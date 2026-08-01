import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FloatingSocialLinks } from "@/components/layout/FloatingSocialLinks";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { siteName, siteUrl } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Emerald Isle Manpower – Top Recruitment Agency in Sri Lanka",
    template: `%s | ${siteName}`,
  },
  description:
    "Award-winning recruitment agency in Sri Lanka connecting skilled candidates with trusted foreign employers.",
  applicationName: siteName,
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <FloatingSocialLinks />
        <ScrollToTop />
      </body>
    </html>
  );
}
