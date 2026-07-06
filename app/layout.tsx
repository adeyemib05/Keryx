import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Keryx",
  description: "A per-citation micropayment toll layer for independent publishers.",
  icons: {
    icon: "/logo.svg",
  },
};

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} antialiased font-sans`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <div className="min-h-screen flex flex-col">
          <header 
            className="border-b px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <svg width="28" height="28" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                <style>
                  {`
                    @keyframes keryxDraw {
                      0% { stroke-dashoffset: 200; }
                      100% { stroke-dashoffset: 0; }
                    }
                    @keyframes keryxGlow {
                      0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px rgba(68, 136, 255, 0.5)); }
                      50% { opacity: 1; filter: drop-shadow(0 0 10px rgba(68, 136, 255, 0.9)); }
                    }
                    .keryx-wave {
                      stroke-dasharray: 200;
                      animation: keryxDraw 3s ease-in-out infinite alternate;
                    }
                    .keryx-dot {
                      animation: keryxGlow 2s ease-in-out infinite;
                    }
                  `}
                </style>
                <circle cx="48" cy="48" r="44" fill="none" stroke="#4488ff" strokeWidth="2" opacity="0.25"/>
                <circle cx="48" cy="48" r="32" fill="#4488ff10" stroke="#4488ff" strokeWidth="2"/>
                <polyline
                  className="keryx-wave"
                  points="4,48 20,48 30,26 44,70 56,32 66,48 92,48"
                  fill="none"
                  stroke="#4488ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>
                <circle className="keryx-dot" cx="44" cy="70" r="5" fill="#4488ff"/>
                <circle className="keryx-dot" cx="44" cy="70" r="9" fill="none" stroke="#4488ff" strokeWidth="1.5" opacity="0.4"/>
              </svg>
              <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Keryx</span>
            </Link>
            <nav>
              <Link href="/register" className="font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-blue)' }}>
                Register your publication →
              </Link>
            </nav>
          </header>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer 
            className="border-t px-6 py-8 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Keryx · Built on Arc · Powered by Circle
          </footer>
        </div>
      </body>
    </html>
  );
}
