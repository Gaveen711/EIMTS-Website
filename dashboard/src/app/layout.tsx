import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          // Applies the stored theme before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html:
              'try{if(localStorage.getItem("ei-dashboard-theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}',
          }}
        />
        {children}
      </body>
    </html>
  );
}
