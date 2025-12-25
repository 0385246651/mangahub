import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
