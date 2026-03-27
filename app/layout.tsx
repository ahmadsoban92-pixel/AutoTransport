import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WESAutoTransport - Nationwide Vehicle Shipping",
  description:
    "One Of The Best Auto Transport Company in America. Get a free quote for safe, reliable, and affordable vehicle shipping across all 50 states.",
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
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
