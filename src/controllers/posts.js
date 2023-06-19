const { v4 } = require("uuid");
const Post = require("../models/Post");
const createController = require("../utils/createController");
const { executeQuery, executeQueryWithData } = require("../utils/executeQuery");
const { deleteFile } = require("../utils/s3");
const Joi = require("joi");

// helper
const getPostObjectFormat = (item) => ({
  id: item?.id,
  title: item?.title,
  description: item?.description,
  image: item?.image,
  createdAt: item?.createdAt,
  uuid: item?.uuid,
  likes: item?.likes,
  isLiked: item?.isLiked === 1,
  comments: item?.comments,
  user: {
    id: item?.userId,
    username: item?.userUsername,
    fullname: item?.userFullname,
    image: item?.userImage,
    work: item?.userWork,
  },
});

const getCommentObjectFormat = (item) => ({
  id: item?.id,
  text: item?.text,
  createdAt: item?.createdAt,
  uuid: item?.uuid,
  user: {
    id: item?.userId,
    username: item?.userUsername,
    fullname: item?.userFullname,
    image: item?.userImage,
    work: item?.userWork,
  },
});

// api/posts (GET)
module.exports.get = createController(async (req, res) => {
  console.log("queries", req.query);
  console.log("req.userId", req.userId);
  const { error, result } = await executeQuery(
    req.app.locals.db,
    Post.QUERIES.get(req.query, req.userId)
  );

  console.log("results : ", result);

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result.map(getPostObjectFormat),
    error: null,
  });
});

// api/posts (POST)
module.exports.post = createController(async (req, res) => {
  const { error, value } = Post.validate(req.body);

  // invalid body bad req
  if (error) {
    if (req.file) {
      await deleteFile(req.file.key);
    }

    res.status(400).send({
      data: null,
      error: error.message,
    });
    return;
  }

  const image = req?.file ? `/images/${req.file.key}` : "";

  // (@uuid,@title,@description,@image,@createdAt,@userId)
  let payload = {
    uuid: v4(),
    title: value.title,
    description: value.description,
    image: image,
    createdAt: new Date().toISOString(),
    userId: req.userId,
  };

  const saveResponse = await executeQueryWithData(
    req.app.locals.db,
    Post.QUERIES.insert(),
    payload
  );

  // server error
  if (saveResponse.error) {
    if (req.file) await deleteFile(req.file.key);
    res.status(500).send({
      data: null,
      error: saveResponse.error,
    });

    return;
  }

  const dbResponse = await executeQuery(
    req.app.locals.db,
    Post.QUERIES.get(
      {
        uuid: payload.uuid,
      },
      req.userId
    )
  );

  // server error
  if (dbResponse.error) {
    res.status(500).send({
      data: null,
      error: dbResponse.error,
    });
    return;
  }

  res.status(200).send({
    data: dbResponse.result?.map(getPostObjectFormat)?.[0],
    error: null,
  });
});

// api/posts/:id (GET)
module.exports.getById = createController(async (req, res) => {
  const id = req.params.id;
  const { error, result } = await executeQuery(
    req.app.locals.db,
    Post.QUERIES.get({
      id: id,
    })
  );

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result?.map(getPostObjectFormat)?.[0],
    error: null,
  });
});

// api/posts/:id (DELETE)
module.exports.deleteById = createController(async (req, res) => {
  const id = req.params.id;

  const { error } = await executeQuery(req.app.locals.db, Post.QUERIES.delete(id));

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: {
      ok: true,
    },
    error: null,
  });
});

// api/posts/:id/like (POST)
module.exports.like = createController(async (req, res) => {
  const id = req.params.id;

  const { error } = await executeQuery(req.app.locals.db, Post.QUERIES.like(req.userId, id));

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: {
      ok: true,
    },
    error: null,
  });
});

// api/posts/:id/unlike (POST)
module.exports.unlike = createController(async (req, res) => {
  const id = req.params.id;

  const { error } = await executeQuery(req.app.locals.db, Post.QUERIES.unlike(req.userId, id));

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: {
      ok: true,
    },
    error: null,
  });
});

// api/posts/:id/comment (POST)
module.exports.addComment = createController(async (req, res) => {
  const { error, value } = Joi.object({
    text: Joi.string().required().max(500),
  }).validate(req.body);

  if (error) {
    res.status(400).send({
      data: null,
      error: error.message,
    });
    return;
  }

  const payload = {
    text: value.text,
    userId: req.userId,
    postId: req.params.id,
    createdAt: new Date().toISOString(),
    uuid: v4(),
  };

  const { error: dbError } = await executeQueryWithData(
    req.app.locals.db,
    Post.QUERIES.insertComment(),
    payload
  );

  if (dbError) {
    res.status(500).send({
      data: null,
      error: dbError,
    });
    return;
  }

  const { error: getError, result } = await executeQuery(
    req.app.locals.db,
    Post.QUERIES.getCommentByUuid(payload.uuid)
  );

  if (getError) {
    res.status(500).send({
      data: null,
      error: getError,
    });
    return;
  }

  res.status(200).send({
    data: result?.map(getCommentObjectFormat)?.[0],
    error: null,
  });
});

// api/posts/:id/comment (GET)
module.exports.getComments = createController(async (req, res) => {
  const { error, result } = await executeQuery(
    req.app.locals.db,
    Post.QUERIES.getCommentsByPostId(req.params.id)
  );

  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result?.map(getCommentObjectFormat),
    error: null,
  });
});
