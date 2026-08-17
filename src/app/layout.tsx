import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PreloaderGate from "@/components/PreloaderGate";
import CookieNotice from "@/components/CookieNotice";
import { SITE_URL } from "@/lib/siteUrl";
import { pageMetadata } from "@/lib/seo";
import ContinueScroll from "@/components/ContinueScroll";

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
      className={`h-full antialiased`}
    >
      <head>
        {/* Must run before the body paints — see the component. */}
        <PreloaderGate />
      </head>
      <body className="min-h-full flex flex-col bg-[#EEE8D9] text-[#171717] ">

        <ThemeProvider>
          <Header />
          {children}
          <Footer />
          <CookieNotice />
          <ContinueScroll />
        </ThemeProvider>
      </body>
    </html>
  );
}
