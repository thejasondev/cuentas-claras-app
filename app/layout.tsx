import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Cuentas Claras - Divide la cuenta facilmente",
  description:
    "Aplicacion para dividir la cuenta del restaurante entre comensales. Calcula automaticamente el total por persona incluyendo propina.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuentas Claras",
  },
  icons: {
    icon: [
      {
        url: "/Cuentas Claras Logo.png",
      },
    ],
    apple: "/Cuentas Claras Logo.png",
  },
  openGraph: {
    title: "Cuentas Claras - Divide la cuenta facilmente",
    description:
      "Aplicación para dividir la cuenta del restaurante entre comensales, calcula el total incluyendo propina.",
    url: "https://cuentasclaras.vercel.app/",
    siteName: "Cuentas Claras",
    images: [
      {
        url: "/Cuentas Claras Logo.png",
        width: 512,
        height: 512,
        alt: "Cuentas Claras Logo",
      },
    ],
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cuentasclaras",
    title: "Cuentas Claras - Divide la cuenta facilmente",
    description:
      "Aplicación para dividir la cuenta del restaurante entre comensales, calcula el total incluyendo propina.",
    images: ["/Cuentas Claras Logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#818cf8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased no-select">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
