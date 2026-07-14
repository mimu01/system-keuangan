import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SIK MI Miftahul Ulum 01 — Sistem Informasi Keuangan Sekolah",
  description:
    "Aplikasi keuangan sekolah modern untuk MI Miftahul Ulum 01. Kelola tagihan, pembayaran, dan laporan keuangan dengan mudah, transparan, dan real-time.",
  keywords: [
    "keuangan sekolah",
    "MI Miftahul Ulum",
    "sistem informasi keuangan",
    "pembayaran SPP",
    "tagihan sekolah",
    "sekolah islam",
    "madrasah ibtidaiyah",
  ],
  authors: [{ name: "MI Miftahul Ulum 01" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIK MI MU 01",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "SIK MI Miftahul Ulum 01",
    description:
      "Aplikasi keuangan sekolah modern untuk MI Miftahul Ulum 01. Kelola tagihan, pembayaran, dan laporan keuangan dengan mudah dan transparan.",
    type: "website",
    locale: "id_ID",
    siteName: "SIK MI Miftahul Ulum 01",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0a2e1f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
