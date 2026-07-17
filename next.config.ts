import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HAPUS output: "standalone" — tidak perlu di Vercel, bisa cause mobile PWA issue
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
