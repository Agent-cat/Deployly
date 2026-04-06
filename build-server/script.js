require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const s3Client = require("./s3-client.js");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const PROJECT_ID = process.env.PROJECT_ID;

async function Init() {
  //  Create the full path of a folder named output inside the current file’s directory.
  //__dirname means: the folder where the current JavaScript file exists
  const outDirPath = path.join(__dirname, "output");

  // Go to the dir, install packages and build the project
  // exec in JavaScript is usually used to run shell/terminal commands from Node.js
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  // Build Logs
  p.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  p.stderr.on("data", (data) => {
    console.error(`Build error: ${data.toString()}`);
  });
  p.on("error", (err) => {
    console.error(`Execution error: ${err.message}`);
  });

  p.on("close", async (code) => {
    if (code !== 0) {
      console.error(`======BUILD FAILED with code ${code}======`);
      return;
    }
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
      const command = new PutObjectCommand({
        Bucket: "vishnu-vercel-output",
        Key: `__output/${PROJECT_ID}/${file}`, // File path in s3
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath), // Getting the type of file
      });

      await s3Client.send(command);
      console.log(`${filePath} Uploaded`);
    }

    console.log("DONE.....");
  });
}

Init();
