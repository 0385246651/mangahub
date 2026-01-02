import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "otruyenapi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.otruyenapi.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sv1.otruyencdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
