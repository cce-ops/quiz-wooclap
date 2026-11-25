import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse external so its worker file is loaded from node_modules
  // instead of being bundled into a server chunk where it cannot be resolved.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
