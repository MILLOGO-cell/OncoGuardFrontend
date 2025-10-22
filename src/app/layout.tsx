import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers";
import { NavigationProvider } from "@/providers/NavigationProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OncoGuard — Diagnostic intelligent du cancer du sein",
  description:
    "OncoGuard est une plateforme d’aide au diagnostic médical exploitant l’intelligence artificielle pour l’analyse d’images mammaires et la classification BI-RADS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <NavigationProvider>
          <Providers>{children}</Providers>
        </NavigationProvider>
      </body>
    </html>
  );
}
