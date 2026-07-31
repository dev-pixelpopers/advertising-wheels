import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Advertising Wheels",
  description: "Leader in truckside billboard advertising",
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
      <body className="min-h-full flex flex-col bg-[#EEE8D9] dark:bg-[#0A0A0A] text-[#171717] dark:text-[#F5F5F5] transition-colors duration-300">

        <ThemeProvider>
          <Header scrolledHero={true} />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
