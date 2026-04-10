import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  allowedDevOrigins: ['18.60.117.242', 'klfemflare.in'],
};

export default nextConfig;
