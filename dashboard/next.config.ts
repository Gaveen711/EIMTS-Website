import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@eimts/database"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // The dashboard must never render inside another site's frame.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
