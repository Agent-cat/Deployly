const express = require("express");
const httpProxy = require("http-proxy");
const mime = require("mime-types");

const app = express();
const PORT = 8000;

const BASE_PATH =
  "https://vishnu-vercel-output.s3.ap-south-2.amazonaws.com/__output";

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];

  // Custom Domain - DB Query

  const resolvesTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }
});

proxy.on("proxyRes", (proxyRes, req, res) => {
  let urlPath = req.url;
  // Strip query parameters
  urlPath = urlPath.split("?")[0];

  if (urlPath === "/") {
    urlPath = "index.html";
  }
  const contentType = mime.lookup(urlPath) || "text/plain";
  proxyRes.headers["content-type"] = contentType;
});

app.listen(PORT, () => console.log(`Reverse Proxy Running..${PORT}`));
