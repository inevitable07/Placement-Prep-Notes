/**
 * @file layout.tsx
 * @description The root layout file for the application. Wraps the app in ClerkProvider for authentication,
 * sets the primary color theme, and loads the Inter google font.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Placement Prep AI",
  description: "AI-powered placement preparation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#000000",
          colorText: "#ffffff",
          colorInputBackground: "#0a0a0a",
          colorInputText: "#ffffff",
        },
      }}
    >
      <html lang="en" className={inter.variable}>
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
