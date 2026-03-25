import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoTransportPro - Nationwide Vehicle Shipping",
  description:
    "America's most trusted auto transport brokerage. Get a free quote for safe, reliable, and affordable vehicle shipping across all 50 states.",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
