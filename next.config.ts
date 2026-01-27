import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Varning: Detta gör att bygget går igenom även om du har fel i koden
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Varning: Detta gör att bygget går igenom även om du har TS-fel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;