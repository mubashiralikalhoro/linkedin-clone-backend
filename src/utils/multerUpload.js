const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const appConfig = require("../config/config");
const { v4 } = require("uuid");
const s3 = new S3Client();

const multerUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: appConfig.s3.bucketName,
    key: function (req, file, cb) {
      cb(null, `uploads/${v4()}`);
    },
  }),
});

module.exports = multerUpload;
