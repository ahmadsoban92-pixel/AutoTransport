import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Default quality for all Next.js <Image> components
    qualities: [75, 90, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
