import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "emeraldislemanpower.com",
    port: "",
    pathname: "/assets/projects/**",
    search: "",
  },
];

try {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  remotePatterns?.push({
    protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
    hostname: supabaseUrl.hostname,
    port: supabaseUrl.port,
    pathname: "/storage/v1/object/public/project-media/**",
    search: "",
  });
} catch {
  // Builds without Supabase configured still use the bundled project images.
}

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 78, 85],
    minimumCacheTTL: 2678400,
    remotePatterns,
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
