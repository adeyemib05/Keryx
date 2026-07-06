import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import WelcomeGuide from "@/components/WelcomeGuide";
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
        <WelcomeGuide />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
