const { S3 } = require("aws-sdk");
const fs = require("fs");
const v4 = require("uuid").v4;
const appConfig = require("../config/config");

module.exports.uploadFile = async (file) => {
  const s3 = new S3({});
  const fileReadStream = fs.createReadStream(file.path);
  const params = {
    Bucket: appConfig.s3.bucketName,
    Key: `uploads/${v4()}`,
    Body: fileReadStream,
  };
  return s3.upload(params).promise();
};

module.exports.getFile = async (key) => {
  const s3 = new S3({});
  const params = {
    Bucket: appConfig.s3.bucketName,
    Key: key,
  };
  return s3.getObject(params).createReadStream();
};

module.exports.deleteFile = async (key) => {
  const s3 = new S3({});
  const params = {
    Bucket: appConfig.s3.bucketName,
    Key: key,
  };
  return s3.deleteObject(params).promise();
};
