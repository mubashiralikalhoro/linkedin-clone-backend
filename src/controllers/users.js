const User = require("../models/User");
const createController = require("../utils/createController");
const executeQuery = require("../utils/executeQuery");
const { uploadFile, deleteFile } = require("../utils/s3");

// api/users/:id
module.exports.getById = createController(async (req, res) => {
  const { result, error } = await executeQuery(
    req.app.locals.db,
    User.getSelectQuery(req.params.id)
  );
  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result,
    error: null,
  });
});

// api/users/me
module.exports.getMe = createController(async (req, res) => {
  console.log("user :", req.userId);

  const { result, error } = await executeQuery(
    req.app.locals.db,
    User.getSelectQuery(req.userId)
  );

  // server error
  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  // user not found
  if (result.length === 0) {
    res.status(404).send({
      data: null,
      error: "User not found",
    });
    return;
  }

  //   success
  res.status(200).send({
    data: result?.[0],
    error: null,
  });
});

// api/users/me/profile (POST)
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

module.exports.uploadProfile = createController(async (req, res) => {
  console.log("file :", req.file);

  // upload file to s3
  uploadFile(req.file)
    // success
    .then(async (data) => {
      // deleting file from buffer
      await unlinkFile(req.file.path);
      // update user image
      const { result, error } = await executeQuery(
        req.app.locals.db,
        User.getUpdateImageQuery(req.userId, `/images/${data.Key}`)
      );
      // server error
      if (error) {
        await deleteFile(data.Key);
        res.status(500).send({
          data: null,
          error: error,
        });
        return;
      }
      // success
      res.send({
        ok: true,
        imageUrl: `/images/${data.Key}`,
      });
    })
    // error
    .catch(() => {
      console.log("error uploading file :", error);
      res.status(500).send({
        data: null,
        error: "Internal server error",
      });
    });
});
