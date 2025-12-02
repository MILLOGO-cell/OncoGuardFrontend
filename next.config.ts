import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"], 
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/api/v1/**",
      },
      {
        protocol: "https",
        hostname: "vcgckw80k8gc0c88osk0kk4w.37.27.42.12.sslip.io",
        pathname: "/api/v1/**",
      },
    ],
  },
};

export default nextConfig;