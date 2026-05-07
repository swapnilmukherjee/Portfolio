import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ProgressBar } from "@/components/progress-bar";
import { getContent } from "@/lib/content";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  axes: ["opsz"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased overflow-x-hidden">
        <ThemeProvider>
          <ProgressBar />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
