require("dotenv").config();
const { ECSClient } = require("@aws-sdk/client-ecs");

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.PROCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

module.exports = ecsClient;
