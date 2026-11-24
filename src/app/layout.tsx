import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getContent } from "@/lib/content";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  return {
    metadataBase: new URL("https://swapnilmukherjee.vercel.app"),
    title: {
      default: `${profile.name}, ${profile.title}`,
      template: `%s · ${profile.name}`,
    },
    description: profile.shortBio,
    keywords: [
      "Swapnil Mukherjee",
      "Okta",
      "Auth0",
      "CIAM",
      "Identity",
      "OAuth",
      "OIDC",
      "SAML",
      "Auth0 for AI Agents",
      "Technical Consultant",
    ],
    authors: [{ name: profile.name }],
    creator: profile.name,
    openGraph: {
      type: "website",
      title: `${profile.name}, ${profile.title}`,
      description: profile.shortBio,
      siteName: profile.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name}, ${profile.title}`,
      description: profile.shortBio,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090b0d" },
    { media: "(prefers-color-scheme: light)", color: "#e9eef1" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <head>
        {/* Marks JS as available before paint so scroll scenes can opt in without hiding no-JS content. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
