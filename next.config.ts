import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@circle-fin/x402-batching'],
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;