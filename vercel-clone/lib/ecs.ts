import { ECSClient } from "@aws-sdk/client-ecs";

export const ecsClient = new ECSClient({
  region: process.env.AWS_REGION || "ap-south-2",
  credentials: {
    accessKeyId: process.env.PROCESSKEYID!,
    secretAccessKey: process.env.SECRETACCESSKEY!,
  },
});
