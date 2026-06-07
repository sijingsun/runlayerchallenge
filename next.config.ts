import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/runlayerchallenge",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === "production" ? "/runlayerchallenge" : "",
  },
};

export default nextConfig;
