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
  description: "Root Nexus is a premier digital agency building future-ready web development, digital marketing, and AI automation solutions for businesses in Udumalaipet, Coimbatore, Munnar, Marayoor, and Kanthalloor.",
  keywords: [
    "Web Development Udumalaipet", 
    "Digital Marketing Coimbatore", 
    "AI Automation Munnar", 
    "Web Design Marayoor", 
    "Software company in Kanthalloor", 
    "Web Development Coimbatore", 
    "Digital Agency Udumalaipet", 
    "Root Nexus", 
    "Smart Digital Experiences"
  ],
  authors: [{ name: "Root Nexus" }],
  openGraph: {
    title: "Root Nexus | Connecting Ideas with Technology",
    description: "Root Nexus is a premier digital agency building future-ready web development, digital marketing, and AI automation solutions for businesses in Udumalaipet, Coimbatore, Munnar, Marayoor, and Kanthalloor.",
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
    description: "Root Nexus is a premier digital agency building future-ready web development, digital marketing, and AI automation solutions for businesses in Udumalaipet, Coimbatore, Munnar, Marayoor, and Kanthalloor.",
    images: ["/logo.png"],
  },
};

import FixedLogo from "@/components/FixedLogo";
import ClientLayoutGuard from "@/components/ClientLayoutGuard";
import { Providers } from "@/components/Providers";

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
        <Providers>
          <ClientLayoutGuard />
          {children}
        </Providers>
      </body>
    </html>
  );
}
