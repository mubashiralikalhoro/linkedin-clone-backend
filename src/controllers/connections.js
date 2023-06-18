const Joi = require("joi");
const createController = require("../utils/createController");
const { executeQuery } = require("../utils/executeQuery");

// api/connections/send-request (POST)
module.exports.sendRequest = createController(async (req, res) => {
  const { error, value } = Joi.object({
    to: Joi.number().required(),
  }).validate(req.body);

  if (error) {
    res.status(400).send({
      message: error.message,
    });
    return;
  }

  const { to } = value;

  const { error: dBError, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_send_connections_request ${req.userId}, ${to}`
  );

  if (dBError) {
    res.status(500).send({
      message: dBError.message,
    });
    return;
  }

  res.status(200).send({
    message: "Request sent successfully",
    ok: true,
  });
});

// api/connections/accept-request (POST)
module.exports.acceptRequest = createController(async (req, res) => {
  const { error, value } = Joi.object({
    connectionId: Joi.number().required(),
  }).validate(req.body);

  if (error) {
    res.status(400).send({
      message: error.message,
    });
    return;
  }

  const { connectionId } = value;

  const { error: dBError, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_accept_connection ${connectionId}`
  );

  if (dBError) {
    res.status(500).send({
      message: dBError.message,
    });
    return;
  }

  res.status(200).send({
    message: "Request accepted successfully",
    ok: true,
  });
});

// api/connections/remove-connection (POST)
module.exports.removeConnection = createController(async (req, res) => {
  const { error, value } = Joi.object({
    connectionId: Joi.number().required(),
  }).validate(req.body);

  if (error) {
    res.status(400).send({
      message: error.message,
    });
    return;
  }

  const { connectionId } = value;

  const { error: dBError, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_remove_connection ${connectionId}`
  );

  if (dBError) {
    res.status(500).send({
      message: dBError.message,
    });
    return;
  }

  res.status(200).send({
    message: "Connection removed successfully",
    ok: true,
  });
});

// api/connections/get-connections (POST)
module.exports.getConnectedUsers = createController(async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).send({
      message: "userId is required",
    });
    return;
  }

  const { error, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_get_user_connections ${userId}`
  );

  if (error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  const finalResult = result?.map((item) => {
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

  res.status(200).send({
    data: finalResult,
    error: null,
  });
});

module.exports.getConnectionRequests = createController(async (req, res) => {
  const userId = req.userId;

  const { error, result } = await executeQuery(
    req.app.locals.db,
    `EXEC proc_get_user_connection_requests ${userId}`
  );

  if (error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  const finalResult = result?.map((item) => {
    return {
      id: item.id,
      user: {
        id: item.userFromId,
        fullname: item.userFromFullname,
        username: item.userFromUsername,
        work: item.userFromWork,
        image: item.userFromImage,
      },
    };
  });

  res.status(200).send({
    data: finalResult,
    error: null,
  });
});

module.exports.getConnectionStatus = createController(async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    res.status(400).send({
      message: "userId is required",
    });
    return;
  }

  if (Number(userId) === req.userId) {
    res.status(200).send({
      data: {
        status: "self",
      },
      error: null,
    });
    return;
  }

  const { error, result } = await executeQuery(
    req.app.locals.db,
    `SELECT uc.*,cs.unique_key  FROM user_connections uc INNER JOIN connection_status cs
     ON cs.id = uc.connectionStatusId AND (uc.fromUserId = ${req.userId} OR uc.toUserId = ${req.userId})`
  );

  if (error) {
    res.status(500).send({
      message: error.message,
    });
    return;
  }

  console.log("result", result);

  if (result.length === 0) {
    res.status(200).send({
      data: {
        status: "not-connected",
      },
      error: null,
    });
    return;
  }

  const connection = result.find(
    (item) => item.fromUserId === Number(userId) || item.toUserId === Number(userId)
  );

  if (!connection) {
    res.status(200).send({
      data: {
        status: "not-connected",
      },
      error: null,
    });
    return;
  }

  if (connection.fromUserId === Number(userId) || connection.toUserId === Number(userId)) {
    res.status(200).send({
      data: {
        status: connection.unique_key,
        connectionId: connection.id,
      },
      error: null,
    });
    return;
  }
});
