require("dotenv").config();
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL environment variable is required");
}

const io = new Server({
  cors: {
    origin: "*",
  },
});

const subscriber = new Redis(REDIS_URL);

// Standard Prisma initialization with adapter for Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("subscribe", (channel) => {
    console.log(`Socket ${socket.id} subscribing to ${channel}`);
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

async function initRedisSubscribe() {
  console.log("Subscribed to logs:* pattern....");
  subscriber.psubscribe("logs:*");
  subscriber.on("pmessage", async (pattern, channel, message) => {
    // console.log(`Redis Channel: ${channel} | Message: ${message}`);

    // Broadcast message to clients
    io.to(channel).emit("message", message);

    // Update status in Database if build is finished
    const projectSlug = channel.split(":")[1];
    if (projectSlug && message.includes("DONE.....")) {
         console.log(`Updating status for ${projectSlug} to READY`);
         try {
             const project = await prisma.project.findUnique({
                 where: { subdomain: projectSlug },
                 include: { deployments: { orderBy: { createdAt: 'desc' }, take: 1 } }
             });

             if (project && project.deployments[0]) {
                 await prisma.deployment.update({
                     where: { id: project.deployments[0].id },
                     data: { status: "READY" }
                 });
                 console.log(`Successfully updated status for ${projectSlug}`);
             }
         } catch (error) {
             console.error(`Failed to update status for ${projectSlug}:`, error);
         }
    } else if (projectSlug && message.includes("Starting Build...")) {
        console.log(`Updating status for ${projectSlug} to IN_PROGRESS`);
        try {
            const project = await prisma.project.findUnique({
                where: { subdomain: projectSlug },
                include: { deployments: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });

            if (project && project.deployments[0]) {
                await prisma.deployment.update({
                    where: { id: project.deployments[0].id },
                    data: { status: "IN_PROGRESS" }
                });
            }
        } catch (error) {
            console.error(`Failed to update progress status for ${projectSlug}:`, error);
        }
    } else if (projectSlug && message.includes("BUILD FAILED")) {
        console.log(`Updating status for ${projectSlug} to FAIL`);
        try {
            const project = await prisma.project.findUnique({
                where: { subdomain: projectSlug },
                include: { deployments: { orderBy: { createdAt: 'desc' }, take: 1 } }
            });

            if (project && project.deployments[0]) {
                await prisma.deployment.update({
                    where: { id: project.deployments[0].id },
                    data: { status: "FAIL" }
                });
            }
        } catch (error) {
            console.error(`Failed to update error status for ${projectSlug}:`, error);
        }
    }
  });
}

initRedisSubscribe();

const PORT = 9001;
io.listen(PORT, () => {
  console.log(`Socket Server Running on ${PORT}`);
});

