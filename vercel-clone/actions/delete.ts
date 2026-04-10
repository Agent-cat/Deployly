"use server";

import { prisma } from "@/lib/prisma";
import { s3Client } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

export async function deleteProject(slug: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { subdomain: slug },
    include: { deployments: true }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== session.user.id) {
    throw new Error("You don't have permission to delete this project");
  }

  const bucketName = "vishnu-vercel-output"; // From proxy.ts
  const prefix = `__output/${slug}/`;

  console.log(`Deleting project ${slug} from S3...`);

  try {
    // 1. List and Delete from S3
    let continued = true;
    let continuationToken = undefined;

    while (continued) {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = (await s3Client.send(listCommand)) as any;

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents
              .filter((obj: any) => obj.Key)
              .map((obj: any) => ({ Key: obj.Key! })),
          },
        });

        await s3Client.send(deleteCommand);
        console.log(`Deleted ${listResponse.Contents.length} objects from S3`);
      }

      continued = !!listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }

    // 2. Delete from DB
    // Since deployment doesn't have Cascade delete, we delete deployments first
    await prisma.deployment.deleteMany({
      where: { projectId: project.id }
    });

    await prisma.project.delete({
      where: { id: project.id }
    });

    console.log(`Project ${slug} deleted successfully`);

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}
