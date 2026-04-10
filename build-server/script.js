require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const s3Client = require("./s3-client.js");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");


const publisher = new Redis(process.env.REDIS_URL);


const PROJECT_ID = process.env.PROJECT_ID;

const publishLog = ( log ) => {
  return publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }));
};


async function Init() {

  publishLog("Starting Build...");

  //  Create the full path of a folder named output inside the current file’s directory.
  //__dirname means: the folder where the current JavaScript file exists
  const outDirPath = path.join(__dirname, "output");

  // Go to the dir, install packages and build the project
  // exec in JavaScript is usually used to run shell/terminal commands from Node.js
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  // Build Logs
  p.stdout.on("data", (data) => {
    console.log(data.toString());
    publishLog(data.toString());
  });
  p.stderr.on("data", (data) => {
    console.error(`Build error: ${data.toString()}`);
    publishLog(data.toString());
  });
  p.on("error", (err) => {
    console.error(`Execution error: ${err.message}`);
    publishLog(`Execution error: ${err.message}`);
  });

  p.on("close", async (code) => {
    if (code !== 0) {
      await publishLog(`======BUILD FAILED with code ${code}======`);
      console.error(`======BUILD FAILED with code ${code}======`);
      publisher.quit();
      process.exit(1);
    }
    publishLog("======BUILD COMPLETED======");
    console.log("======BUILD COMPLETED======");
    // Getting the Path of Dist folder
    const distFolderPath = path.join(__dirname, "output", "dist");

    // Getting All the files in dist as String[]
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    // Upload the files to S3
    for (const file of distFolderContent) {
      const filePath = path.join(distFolderPath, file);
      // If it is a directory ignore
      if (fs.lstatSync(filePath).isDirectory()) continue;

      // Uploading to s3
      console.log(`Uploading ${filePath}`);
      publishLog(`Uploading ${filePath}`);
      const command = new PutObjectCommand({
        Bucket: "vishnu-vercel-output",
        Key: `__output/${PROJECT_ID}/${file}`, // File path in s3
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath), // Getting the type of file
      });

      await s3Client.send(command);
      console.log(`${filePath} Uploaded`);
      publishLog(`${filePath} Uploaded`);
    }

    console.log("DONE.....");
    await publishLog("DONE.....");
    publisher.quit();
    process.exit(0);
  });
}

Init();
