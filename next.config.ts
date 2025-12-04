import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["localhost"], // Replace with your image domain(s)
  },
};

export default nextConfig;
