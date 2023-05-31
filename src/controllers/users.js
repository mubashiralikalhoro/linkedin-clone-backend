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

// api/users/me (PUT)
module.exports.updateMe = createController(async (req, res) => {
  // empty body
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({
      data: null,
      error: "No changes to update",
    });
    return;
  }
  // validation
  const { error, value } = User.validateUpdate(req.body);
  // validation error
  if (error) {
    res.status(400).send({
      data: null,
      error: error.message,
    });
    return;
  }

  console.log("value :", value);

  // update user
  const dbResponse = await executeQuery(
    req.app.locals.db,
    User.getUpdateQuery(req.userId, value)
  );

  // server error
  if (dbResponse.error) {
    res.status(500).send({
      data: null,
      error: dbResponse.error,
    });
    return;
  }

  // getting updated user
  const updatedUser = await executeQuery(
    req.app.locals.db,
    User.getSelectQuery(req.userId)
  );

  // server error
  if (updatedUser.error) {
    res.status(500).send({
      data: null,
      error: selectError,
    });
    return;
  }

  // success
  res.status(200).send({
    data: updatedUser.result?.[0],
    error: null,
  });
});

// api/users/me/profile (POST)
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

module.exports.uploadImage = createController(async (req, res) => {
  const imageType = req.params.image;
  console.log("imageType :", imageType);

  // no file uploaded
  if (!req.file) {
    res.status(400).send({
      data: null,
      error: "No file uploaded",
    });
    return;
  }

  // get user

  const userResponse = await executeQuery(
    req.app.locals.db,
    User.getSelectQuery(req.userId)
  );

  // server error
  if (userResponse.error) {
    res.status(500).send({
      data: null,
      error: userResponse.error,
    });
    return;
  }

  // user not found
  if (userResponse.result.length === 0) {
    res.status(404).send({
      data: null,
      error: "User not found",
    });
    return;
  }

  // user found
  const user = userResponse.result[0];

  // delete previous image
  if (imageType === "profile" && user.profileImage) {
    await deleteFile(user.profileImage.replace("/images/", ""));
  } else if (imageType === "coverImage" && user.coverImage) {
    await deleteFile(user.coverImage.replace("/images/", ""));
  }

  // upload file to s3
  uploadFile(req.file)
    // success
    .then(async (data) => {
      // deleting file from buffer
      await unlinkFile(req.file.path);
      // update user image
      const { result, error } = await executeQuery(
        req.app.locals.db,

        imageType === "profile"
          ? User.getUpdateImageQuery(req.userId, `/images/${data.Key}`)
          : User.getUpdateCoverImageQuery(req.userId, `/images/${data.Key}`)
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
        data: {
          ...user,
          [imageType === "profile"
            ? "image"
            : "coverImage"]: `/images/${data.Key}`,
        },
        error: null,
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

// api/users/me/profile (DELETE)
module.exports.deleteImage = createController(async (req, res) => {
  const imageType = req.params.image;
  console.log("imageType :", imageType);

  const UserResponse = await executeQuery(
    req.app.locals.db,
    User.getSelectQuery(req.userId)
  );

  // server error
  if (UserResponse.error) {
    res.status(500).send({
      data: null,
      error: UserResponse.error,
    });
    return;
  }

  // user not found
  if (UserResponse.result.length === 0) {
    res.status(404).send({
      data: null,
      error: "User not found",
    });
    return;
  }

  const image =
    imageType === "profile"
      ? UserResponse.result[0].image
      : UserResponse.result[0].coverImage;

  // user does not have a profile picture
  if (image === null) {
    res.status(400).send({
      data: null,
      error: "User does not have a profile picture",
    });
    return;
  }

  // delete file from s3
  deleteFile(image.replace("/images/", ""))
    // success
    .then(async () => {
      // deleting file from db
      const { result, error } = await executeQuery(
        req.app.locals.db,
        imageType === "profile"
          ? User.getUpdateImageQuery(req.userId, ``)
          : User.getUpdateCoverImageQuery(req.userId, ``)
      );

      // server error
      if (error) {
        res.status(500).send({
          data: null,
          error: error,
        });
        return;
      }

      // success
      res.status(200).send({
        data: {
          ...UserResponse.result[0],
          [imageType === "profile" ? "image" : "coverImage"]: "",
        },
        error: null,
      });
    })
    // unable to delete file
    .catch((error) => {
      console.log("error deleting file :", error);
      res.status(500).send({
        data: null,
        error: "Internal server error",
      });
    });
});
