require("dotenv").config();
const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { RunTaskCommand } = require("@aws-sdk/client-ecs");
const ecsClient = require("./ecsClient");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/project", async (req, res) => {
  const { gitURL } = req.body;
  if (!gitURL) {
    return res.status(400).json({ error: "gitURL is required" });
  }

  const projectSlug = generateSlug(); // Generate random slug

  const command = new RunTaskCommand({
    cluster: "arn:aws:ecs:ap-south-2:650557269489:cluster/frugal-bird-otdop7",
    taskDefinition:
      "arn:aws:ecs:ap-south-2:650557269489:task-definition/vishnu-builder-task:1",
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [
          "subnet-0fd7d8f7b34b0f158",
          "subnet-0549edade52e22cec",
          "subnet-0a6f12d24f1c662ca",
        ],
        securityGroups: ["sg-0d828e3818da2f192"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "AWS_REGION", value: process.env.AWS_REGION },
            { name: "PROCESSKEYID", value: process.env.PROCESSKEYID },
            {
              name: "SECRETACCESSKEY",
              value: process.env.SECRETACCESSKEY,
            },
            {
              name: "PROJECT_ID",
              value: projectSlug,
            },
            {
              name: "GIT_REPOSITORY_URL",
              value: gitURL,
            },
          ],
        },
      ],
    },
  });

  try {
    await ecsClient.send(command);
    return res.json({
      status: "queued",
      data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
    });
  } catch (error) {
    console.error("Error sending ECS task:", error);
    return res.status(500).json({ error: "Failed to queue project build" });
  }
});

app.listen(PORT, () => console.log(`Api Server Running..${PORT}`));
