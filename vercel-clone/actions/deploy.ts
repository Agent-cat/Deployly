"use server";

import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { generateSlug } from "random-word-slugs";
import { ecsClient } from "@/lib/ecs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function deployProject(gitURL: string) {
  if (!gitURL) {
    throw new Error("gitURL is required");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const projectSlug = generateSlug(); // Generate random slug
  const name = gitURL.split("/").pop()?.replace(".git", "") || projectSlug;

  // Create Project in DB
  const project = await prisma.project.create({
    data: {
      name,
      gitURL,
      subdomain: projectSlug,
      userId: session.user.id,
    },
  });

  // Create Deployment record
  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "QUEUED",
    },
  });

  const command = new RunTaskCommand({
    cluster: process.env.AWS_CLUSTER_ARN,
    taskDefinition: process.env.AWS_TASK_DEFINITION_ARN,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: process.env.AWS_SUBNETS?.split(","),
        securityGroups: process.env.AWS_SECURITY_GROUPS?.split(","),
        assignPublicIp: "ENABLED",
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "AWS_REGION", value: process.env.AWS_REGION },
            { name: "PROCESSKEYID", value: process.env.PROCESSKEYID },
            { name: "SECRETACCESSKEY", value: process.env.SECRETACCESSKEY },
            { name: "PROJECT_ID", value: projectSlug },
            { name: "GIT_REPOSITORY_URL", value: gitURL },
            { name: "DEPLOYMENT_ID", value: deployment.id },
            { name: "REDIS_URL", value: process.env.REDIS_URL },
          ],
        },
      ],
    },
  });

  try {
    await ecsClient.send(command);
    return {
      status: "queued",
      projectSlug,
      projectId: project.id,
      deploymentId: deployment.id,
      url: `http://${projectSlug}.${process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000"}`,
    };
  } catch (error) {
    console.error("Error sending ECS task:", error);
    // Should update deployment to FAIL
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: "FAIL" },
    });
    throw new Error("Failed to queue project build");
  }
}
