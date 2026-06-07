import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/runlayerchallenge",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/runlayerchallenge",
  },
};

export default nextConfig;
