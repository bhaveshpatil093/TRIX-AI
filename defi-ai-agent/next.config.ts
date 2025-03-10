import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript type checking
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint checks during builds
  },
};

export default nextConfig;
