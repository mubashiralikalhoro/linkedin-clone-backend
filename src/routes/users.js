const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const multerUpload = require("../utils/multerUpload");

// api/users/me
router.route("/me").get(usersController.getMe).put(usersController.updateMe);

// api/users/me/profile

router
  .route("/me/images/:image")
  .post(multerUpload.single("file"), usersController.uploadImage)
  .delete(usersController.deleteImage);

// api/users/:id
router.route("/:id").get(usersController.getById);

module.exports = router;
