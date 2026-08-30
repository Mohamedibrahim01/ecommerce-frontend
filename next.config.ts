import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // Local backend (development)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      // Cloudinary CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // AWS S3 (various regions)
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      // Imgur
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      // Google user content (avatars)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Original: Muscle & Strength CDN
      {
        protocol: "https",
        hostname: "cdn.muscleandstrength.com",
        pathname: "/**",
      },
      // Unsplash (used in hero image)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Generic HTTPS catch-all for external product images
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  // typedRoutes disabled — causes TS errors on dynamic href strings (e.g. `/categories/${id}`)
};

export default nextConfig;
