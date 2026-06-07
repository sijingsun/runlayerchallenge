import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/runlayerchallenge",
  images: { unoptimized: true },
};

export default nextConfig;
