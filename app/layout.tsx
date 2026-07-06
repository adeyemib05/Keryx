import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const baseUrl = (() => {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return raw === "blank" || !raw.startsWith("http") ? "https://keryx-iota.vercel.app" : raw;
})();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Keryx — Pay-Per-Citation AI",
  description: "AI agents pay publishers every time they cite their work. Powered by Circle x402 on Arc Network.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Keryx — Pay-Per-Citation AI",
    description: "The first AI agent that pays publishers per citation using Circle x402 micropayments on the Arc testnet.",
    url: baseUrl,
    siteName: "Keryx",
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "Keryx – Pay-Per-Citation AI Agent",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keryx — Pay-Per-Citation AI",
    description: "The first AI agent that pays publishers per citation using Circle x402 micropayments on the Arc testnet.",
    images: ["/screenshot.png"],
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body
        className="antialiased"
        style={{ background: '#050508', color: '#ffffff', fontFamily: 'var(--font-inter, Inter, system-ui)' }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
