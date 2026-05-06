import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Root Nexus | Connecting Ideas with Technology",
  description: "Root Nexus builds future-ready digital solutions through web development, digital marketing, automation, and smart digital experiences.",
  keywords: ["Web Development", "Digital Marketing", "Automation", "AI", "Smart Digital Experiences", "Root Nexus", "Kanthalloor", "Kerala"],
  authors: [{ name: "Root Nexus" }],
  openGraph: {
    title: "Root Nexus | Connecting Ideas with Technology",
    description: "Root Nexus builds future-ready digital solutions through web development, digital marketing, automation, and smart digital experiences.",
    url: "https://rootnexus.com",
    siteName: "Root Nexus",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Root Nexus Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Root Nexus | Connecting Ideas with Technology",
    description: "Root Nexus builds future-ready digital solutions through web development, digital marketing, automation, and smart digital experiences.",
    images: ["/logo.png"],
  },
};

import FixedLogo from "@/components/FixedLogo";
import FloatingActions from "@/components/FloatingActions";

import AIAssistant from "@/components/AIAssistant";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        <FloatingActions />
        <AIAssistant />
        {children}
      </body>
    </html>
  );
}
