const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// api/users/me
router.route("/me").get(usersController.getMe);

// api/users/me/profile
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
router
  .route("/me/profile")
  .post(upload.single("file"), usersController.uploadProfile);
// api/users/:id
router.route("/:id").get(usersController.getById);

module.exports = router;
