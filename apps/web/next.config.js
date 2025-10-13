/** @type {import('next').NextConfig} */

const backendUrl = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:3000";
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
