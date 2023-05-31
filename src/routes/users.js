const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// api/users/me
router.route("/me").get(usersController.getMe).put(usersController.updateMe);

// api/users/me/profile
const multer = require("multer");
const upload = multer({ dest: "tmp/" });
router
  .route("/me/images/:image")
  .post(upload.single("file"), usersController.uploadImage)
  .delete(usersController.deleteImage);

// api/users/:id
router.route("/:id").get(usersController.getById);

module.exports = router;
