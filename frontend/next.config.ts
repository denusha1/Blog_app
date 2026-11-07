import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiOrigin = process.env.BLOG_API_PROXY_URL ?? "http://localhost:8080/api";
    return [{ source: "/blog-api/:path*", destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
