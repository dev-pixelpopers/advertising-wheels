import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PreloaderGate from "@/components/PreloaderGate";
import CookieNotice from "@/components/CookieNotice";
import { SITE_URL } from "@/lib/siteUrl";
import { pageMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * `metadataBase` is the load-bearing line here.
 *
 * Open Graph images must be ABSOLUTE URLs — a scraper has no page context to
 * resolve `/assets/...` against. Next resolves relative image paths for us, but
 * only once it knows the origin; without this it falls back to localhost, so
 * the two article routes that already declared `openGraph.images` were emitting
 * `http://localhost:3000/...` and rendering as a bare link everywhere.
 *
 * Everything below is the DEFAULT, inherited by any route that does not set its
 * own. Each route layout overrides it via `pageMetadata`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: "Truckside Billboard Advertising | Advertising Wheels",
    description:
      "Unskippable truckside billboards with GPS-verified impressions, measured by StreetMetrics — and retargeting for every audience your trucks reach. 50 DMAs, coast to coast.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Must run before the body paints — see the component. */}
        <PreloaderGate />
      </head>
      <body className="min-h-full flex flex-col bg-[#EEE8D9] dark:bg-[#0A0A0A] text-[#171717] dark:text-[#F5F5F5] transition-colors duration-300">

        <ThemeProvider>
          <Header />
          {children}
          <Footer />
          <CookieNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
