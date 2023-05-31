const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

// api/users/me
router.route("/me").get(usersController.getMe).put(usersController.updateMe);

// api/users/me/profile
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const appConfig = require("../config/config");
const { v4 } = require("uuid");
const s3 = new S3Client();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: appConfig.s3.bucketName,
    key: function (req, file, cb) {
      cb(null, `uploads/${v4()}`);
    },
  }),
});

router
  .route("/me/images/:image")
  .post(upload.single("file"), usersController.uploadImage)
  .delete(usersController.deleteImage);

// api/users/:id
router.route("/:id").get(usersController.getById);

module.exports = router;
