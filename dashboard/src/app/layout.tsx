import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Emerald Isle Content Desk",
  description: "Private job and application management for Emerald Isle staff.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
