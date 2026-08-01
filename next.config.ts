import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/contact-us/",
        destination: "/contact/",
        permanent: true,
      },
      {
        source: "/contact-us-emerald-isle-manpower/",
        destination: "/contact/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
