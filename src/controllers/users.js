const { object } = require("joi");
const User = require("../models/User");
const createController = require("../utils/createController");
const { executeQuery, executeQueryWithData } = require("../utils/executeQuery");
const { deleteFile } = require("../utils/s3");
const Joi = require("joi");

// api/users
module.exports.get = createController(async (req, res) => {
  const queries = req.query;

  // without queries (can't get all users)
  if (Object.keys(queries).length === 0) {
    res.status(401).send({
      data: null,
      error: "Can't get all users",
    });
  }

  const { error } = Joi.object({
    username: Joi.string(),
    address: Joi.string(),
    fullname: Joi.string(),
    email: Joi.string(),
    id: Joi.string(),
  }).validate(queries);

  if (error) {
    res.status(400).send({
      data: null,
      error: error.message,
    });
  }

  const queryResponse = await executeQuery(
    req.app.locals.db,
    User.QUERIES.get(queries, "like")
  );

  if (queryResponse.error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: queryResponse.result,
    error: null,
  });
});

// api/users/:username
module.exports.getByUsername = createController(async (req, res) => {
  const username = req.params.username;
  const { result, error } = await executeQuery(
    req.app.locals.db,
    User.QUERIES.get({
      username: username,
    })
  );

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

  res.status(200).send({
    data: result?.[0],
    error: null,
  });
});

// api/users/me
module.exports.getMe = createController(async (req, res) => {
  console.log("user :", req.userId);

  const { result, error } = await executeQuery(
    req.app.locals.db,
    User.QUERIES.get({
      id: req.userId,
    })
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

  // update user
  const dbResponse = await executeQueryWithData(
    req.app.locals.db,
    User.QUERIES.update.columns(req.userId, Object.keys(value)),
    value
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
    User.QUERIES.get({
      id: req.userId,
    })
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

// api/users/me/images/:imageType (POST)
module.exports.uploadImage = createController(async (req, res) => {
  const imageType = req.params.image;
  console.log("imageType :", imageType);
  console.log("file :", req.file);
  // no file uploaded
  if (!req.file) {
    res.status(400).send({
      data: null,
      error: "No file uploaded",
    });
    return;
  }

  console.log("file :", req.file);

  // get user
  const userResponse = await executeQuery(
    req.app.locals.db,
    User.QUERIES.get({
      id: req.userId,
    })
  );

  // server error
  if (userResponse.error) {
    await deleteFile(req.file.key);
    res.status(500).send({
      data: null,
      error: userResponse.error,
    });
    return;
  }

  // user not found
  if (userResponse.result.length === 0) {
    await deleteFile(req.file.key);
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

  // update user image
  const { error } = await executeQuery(
    req.app.locals.db,
    imageType === "profile"
      ? User.QUERIES.update.image(req.userId, `/images/${req.file.key}`)
      : User.QUERIES.update.coverImage(req.userId, `/images/${req.file.key}`)
  );
  // server error
  if (error) {
    await deleteFile(req.file.key);
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
        : "coverImage"]: `/images/${req.file.key}`,
    },
    error: null,
  });
});

// api/users/me/profile (DELETE)
module.exports.deleteImage = createController(async (req, res) => {
  const imageType = req.params.image;
  console.log("imageType :", imageType);

  const UserResponse = await executeQuery(
    req.app.locals.db,
    User.QUERIES.get({
      id: req.userId,
    })
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
  if (!image) {
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
          ? User.QUERIES.update.image(req.userId, ``)
          : User.QUERIES.update.coverImage(req.userId, ``)
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
