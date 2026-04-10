"use server";

import { prisma } from "@/lib/prisma";

export async function getProjectStatus(slug: string) {
  const project = await prisma.project.findUnique({
    where: { subdomain: slug },
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!project) return { status: "NOT_STARTED" };

  const latestDeployment = project.deployments[0];

  return {
    status: latestDeployment?.status || "NOT_STARTED",
  };
}
