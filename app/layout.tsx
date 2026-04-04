import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { ScrollToTop } from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WESAutoTransport - Nationwide Vehicle Shipping",
  description:
    "One Of The Best Auto Transport Company in America. Get a free quote for safe, reliable, and affordable vehicle shipping across all 50 states.",
  metadataBase: new URL("https://wesautotransport.vercel.app"),
  openGraph: {
    title: "WESAutoTransport - Nationwide Vehicle Shipping",
    description: "One Of The Best Auto Transport Company in America. Get a free quote today.",
    url: "https://wesautotransport.vercel.app",
    siteName: "WESAutoTransport",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "WESAutoTransport - Nationwide Vehicle Shipping",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WESAutoTransport - Nationwide Vehicle Shipping",
    description: "One Of The Best Auto Transport Company in America. Get a free quote today.",
    images: ["/hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} value={{ light: "light", dark: "dark" }}>
          <ScrollToTop />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
