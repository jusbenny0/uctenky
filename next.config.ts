import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "100.113.152.104",
    "100.113.152.104:3000",
    "localhost",
    "localhost:3000",
  ],
};

export default nextConfig;
