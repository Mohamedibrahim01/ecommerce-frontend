import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import Navbar from "@/src/components/Navbar";
import AppInitializer from "@/src/components/auth/AppInitializer";
import { Toaster } from "sonner";
import { Footer } from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PeakSupps — Premium Performance Nutrition",
    template: "%s | PeakSupps",
  },
  description:
    "Discover clinically formulated whey protein, creatine, vitamins, pre-workout and mass gainers. PeakSupps — precision nutrition for peak performance.",
  keywords: [
    "supplements",
    "whey protein",
    "creatine",
    "pre-workout",
    "vitamins",
    "mass gainer",
    "sports nutrition",
    "performance nutrition",
  ],
  authors: [{ name: "PeakSupps" }],
  creator: "PeakSupps",
  metadataBase: new URL("https://ecommerce-peak-supps.vercel.app"),
  openGraph: {
    title: "PeakSupps — Premium Performance Nutrition",
    description:
      "Precision nutrition for peak performance. Shop whey protein, creatine, vitamins, pre-workout and more.",
    type: "website",
    locale: "en_US",
    siteName: "PeakSupps",
  },
  twitter: {
    card: "summary_large_image",
    title: "PeakSupps — Premium Performance Nutrition",
    description: "Precision nutrition for peak performance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={cn(
          "antialiased bg-background text-foreground font-sans",
          "selection:bg-emerald-100 selection:text-emerald-900"
        )}
      >
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          gap={8}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "14px",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "14px",
              fontWeight: "500",
            },
          }}
        />
        <AppInitializer>
          <Navbar />
          <main className="flex-1 min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </AppInitializer>
      </body>
    </html>
  );
}
