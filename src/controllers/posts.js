const { v4 } = require("uuid");
const Post = require("../models/Post");

const createController = require("../utils/createController");
const executeQuery = require("../utils/executeQuery");
const { deleteFile } = require("../utils/s3");

// helper

const getPostObjectFormat = (item) => ({
  id: item?.id,
  title: item?.title,
  description: item?.description,
  image: item?.uuid,
  createdAt: item?.createdAt,
  uuid: item?.uuid,
  user: {
    id: item?.userId,
    fullname: item?.userFullname,
    image: item?.userImage,
  },
});

// api/posts (GET)
module.exports.get = createController(async (req, res) => {
  console.log("queries", req.query);
  const { error, result } = await executeQuery(
    req.app.locals.db,
    Post.getSelectAllQuery()
  );

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
  }

  const image = req?.file ? `/images/${req.file.key}` : "";
  const post = new Post(
    v4(),
    value?.title,
    value?.description,
    image,
    new Date().toISOString(),
    req.userId
  );

  const saveResponse = await executeQuery(
    req.app.locals.db,
    post.getInsertQuery()
  );

  // server error
  if (saveResponse.error) {
    if (req.file) await deleteFile(req.file.key);
    res.status(500).send({
      data: null,
      error: saveResponse.error,
    });
  }

  const dbResponse = await executeQuery(
    req.app.locals.db,
    post.getSelectByUuidQuery()
  );

  // server error
  if (dbResponse.error) {
    res.status(500).send({
      data: null,
      error: dbResponse.error,
    });
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
    Post.getSelectQuery(id)
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

module.exports.deleteById = createController(async (req, res) => {
  const id = req.params.id;
  const { error, result } = await executeQuery(
    req.app.locals.db,
    Post.getDeleteByIdQuery(id)
  );

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
