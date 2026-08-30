import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.muscleandstrength.com",
        pathname: "/**",
      },
    ],
  },
  typedRoutes: true,
};

export default nextConfig;
