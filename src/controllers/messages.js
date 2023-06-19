const Joi = require("joi");
const createController = require("../utils/createController");
const { executeQuery, executeQueryWithData } = require("../utils/executeQuery");
const { v4 } = require("uuid");

module.exports.get = createController(async (req, res) => {
  const userId = req.userId;

  let connectedUsers = await executeQuery(
    req.app.locals.db,
    `EXEC proc_get_user_connections ${userId}`
  );

  if (connectedUsers.error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  connectedUsers = connectedUsers.result?.map((item) => {
    if (item.userFromId === Number(userId)) {
      return {
        id: item.userToId,
        fullname: item.userToFullname,
        username: item.userToUsername,
        work: item.userToWork,
        image: item.userToImage,
      };
    } else {
      return {
        id: item.userFromId,
        fullname: item.userFromFullname,
        username: item.userFromUsername,
        work: item.userFromWork,
        image: item.userFromImage,
      };
    }
  });

  // getting every ones last message with the user
  for (let i = 0; i < connectedUsers.length; i++) {
    const lastMessage = await executeQuery(
      req.app.locals.db,
      `proc_get_last_message_by_user @userId = ${userId},@fromUserId = ${connectedUsers[i].id}`
    );

    console.log(lastMessage);

    if (lastMessage.error) {
      res.status(500).send({
        message: error.message,
      });
      return;
    }

    connectedUsers[i].lastMessage =
      lastMessage.result?.map((item) => ({
        ...item,
        isRead: item.isRead === "false" ? false : true,
        by: item.fromUserId === userId ? "you" : "other",
      }))?.[0] || null;
  }

  res.status(200).send({
    data: connectedUsers,
    error: null,
  });
});

module.exports.getChat = createController(async (req, res) => {
  const userId = req.userId;
  const withUserId = req.params.withUserId;

  const userResponse = await executeQuery(
    req.app.locals.db,
    `SELECT * FROM users WHERE id = ${withUserId}`
  );

  if (userResponse.error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  if (userResponse.result.length === 0) {
    res.status(404).send({
      message: "User not found",
    });
    return;
  }

  const user = {
    id: userResponse.result[0].id,
    fullname: userResponse.result[0].fullname,
    username: userResponse.result[0].username,
    work: userResponse.result[0].work,
    image: userResponse.result[0].image,
  };

  const { error, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_get_by_user @userId = ${userId},@fromUserId = ${withUserId}`
  );

  if (error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  res.status(200).send({
    user,
    data: result
      .map((item) => ({
        ...item,
        isRead: item.isRead === "false" ? false : true,
        by: item.by === userId ? "you" : "other",
      }))
      .reverse(),
    error: null,
    metaData: {
      total: result.length,
    },
  });
});

module.exports.send = createController(async (req, res) => {
  const userId = req.userId;
  const withUserId = req.params.withUserId;

  // checking if user is sending message to himself
  if (withUserId === userId) {
    res.status(400).send({
      message: "You can not send message to yourself",
    });
    return;
  }

  // checking if text is provided
  const validation = Joi.object({
    text: Joi.string().required(),
  }).validate(req.body);

  if (validation.error) {
    res.status(400).send({
      message: validation.error.message,
    });
    return;
  }

  // checking if user is connected with the user he is sending message to or not
  const isUserConnected = await executeQuery(
    req.app.locals.db,
    `SELECT * FROM user_connections WHERE (fromUserId = ${userId} AND toUserId = ${withUserId} AND connectionStatusId = 2) 
         OR (fromUserId = ${withUserId} AND toUserId = ${userId} AND connectionStatusId = 2)`
  );

  console.log("isUserConnected :", isUserConnected);

  if (isUserConnected.error) {
    res.status(500).send({
      message: isUserConnected.error,
    });
    return;
  }

  if (isUserConnected.result?.length === 0) {
    res.status(400).send({
      message: "You are not connected with this user",
    });
    return;
  }

  const payload = {
    fromUserId: userId,
    toUserId: withUserId,
    text: req.body.text,
    createdAt: new Date().toISOString(),
    uuid: v4(),
  };

  const insertingMessage = await executeQueryWithData(
    req.app.locals.db,
    `INSERT INTO messages (fromUserId,toUserId,text,createdAt,uuid) VALUES (@fromUserId,@toUserId,@text,@createdAt,@uuid)`,
    payload
  );

  console.log("insert result :", insertingMessage.result);

  if (insertingMessage.error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  const lastMessage = await executeQuery(
    req.app.locals.db,
    `SELECT id,text,createdAt,isRead FROM messages WHERE uuid = '${payload.uuid}'`
  );

  if (lastMessage.error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  res.status(200).send({
    data: {
      ...lastMessage.result[0],
      isRead: lastMessage.result[0].isRead === "false" ? false : true,
      by: "you",
    },
  });
});

module.exports.markAsRead = createController(async (req, res) => {
  const userId = req.userId; // user who is marking messages as read
  const withUserId = req.params.withUserId;

  const { error } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_mark_messages_as_read @fromUserId = ${withUserId},@toUserId = ${userId}`
  );

  if (error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  res.status(200).send({
    data: {
      message: "Messages marked as read",
      ok: true,
    },
    error: null,
  });
});
