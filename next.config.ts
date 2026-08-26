import type { NextConfig } from "next";

const authenticatedRoutes = [
  "/portal/:path*",
  "/dashboard/:path*",
  "/customers/:path*",
  "/requests/:path*",
  "/transactions/:path*",
  "/users/:path*",
  "/analytics/:path*",
  "/settings/:path*",
  "/profile/:path*",
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return authenticatedRoutes.map((source) => ({
      source,
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      ],
    }));
  },
};

export default nextConfig;

