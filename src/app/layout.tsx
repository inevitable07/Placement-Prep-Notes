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
          colorPrimary: "#6366F1",
          colorBackground: "#15161A",
          colorText: "#F5F5F5",
          colorTextSecondary: "#A1A1AA",
          colorInputBackground: "#1B1C21",
          colorInputText: "#F5F5F5",
        },
        elements: {
          card: {
            backgroundColor: "#15161A",
            borderColor: "#26272D",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
          },
          headerTitle: {
            color: "#F5F5F5",
          },
          headerSubtitle: {
            color: "#A1A1AA",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#1B1C21",
            borderColor: "#26272D",
            color: "#F5F5F5",
            "&:hover": {
              backgroundColor: "#26272D",
            },
          },
          formButtonPrimary: {
            backgroundColor: "#FFEBCC",
            color: "#0B0B0F",
            fontWeight: "600",
            "&:hover": {
              backgroundColor: "#E6D3B8",
            },
            "&:active": {
              backgroundColor: "#D9C6AB",
            },
          },
          formFieldInput: {
            backgroundColor: "#1B1C21",
            borderColor: "#26272D",
            color: "#F5F5F5",
            borderRadius: "8px",
            "&:focus": {
              borderColor: "#6366F1",
            },
          },
          formFieldLabel: {
            color: "#F5F5F5",
          },
          dividerLine: {
            backgroundColor: "#26272D",
          },
          dividerText: {
            color: "#A1A1AA",
          },
          footerActionText: {
            color: "#A1A1AA",
          },
          footerActionLink: {
            color: "#6366F1",
            "&:hover": {
              color: "#4f46e5",
            },
          },
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
