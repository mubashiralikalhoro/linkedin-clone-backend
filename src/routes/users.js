const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const multerUpload = require("../utils/multerUpload");

// api/users
router.route("/").get(usersController.get);

// api/users/me
router.route("/me").get(usersController.getMe).put(usersController.updateMe);

// api/users/me/:image
router
  .route("/me/images/:image")
  .post(multerUpload.single("file"), usersController.uploadImage)
  .delete(usersController.deleteImage);

// api/users/:username
router.route("/:username").get(usersController.getByUsername);

module.exports = router;
