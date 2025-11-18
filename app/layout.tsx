import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const myGaId = process.env.NEXT_PUBLIC_GA_ID || '';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Krocs | 계획의 루프를 완성하는 시간 루프 코치",
    template: "%s | Krocs",
  },
  description: "계획과 현실을 연결해 루틴과 목표를 조율해 주는 Krocs 시간 루프 코치 서비스",
  keywords: ["Krocs", "시간 관리", "목표 관리", "루틴", "회고", "계획"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "next-themes";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
        >
          {children}
        </ThemeProvider>
      </body>
      {myGaId && <GoogleAnalytics gaId={myGaId} />}
    </html>
  );
}
