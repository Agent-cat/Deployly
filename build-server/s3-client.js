const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.PROCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});
w;

module.exports = s3Client;
