import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FloatingSocialLinks } from "@/components/layout/FloatingSocialLinks";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
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
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        {/* Runs before first paint so reveal targets start hidden instead of
            flashing visible then re-animating. Without JS it never runs and
            every reveal rule stays inert (see globals.css ei-motion-ready). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('ei-motion-ready')}catch(e){}",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <FloatingSocialLinks />
        <ScrollReveal />
        <ScrollToTop />
      </body>
    </html>
  );
}
