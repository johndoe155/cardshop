import type { Metadata } from "next";
import "./globals.css";
import { Providers, CustomCursor } from "@/components/Providers";
import { CanvasRoot } from "@/components/canvas/CanvasRoot";

export const metadata: Metadata = {
  metadataBase: new URL('https://nemoscardshop.com'),
  title: "Nemo's Card Shop — Digital Soul, Physical Form • Real Brand • Rapier + GLSL",
  description: "Turning NFTs into museum-grade physical slabs. Cracked ice, holo foil, vault-sealed. Now with real brand assets, 42 slab photos, Rapier physics pit, true WebGL forge. Not merch. Artifacts.",
  openGraph: {
    title: "Nemo's Card Shop — The Vault • Real Brand • Physics + WebGL",
    description: "2,847 slabs forged. Real logos, real mascot, 42 slabs, Rapier physics pit, true GLSL holo. Your JPEG deserves better.",
    type: "website",
    images: [
      {
        url: "/api/og?finish=holo&name=BAYC%20%232087&collection=Bored%20Ape%20Yacht%20Club",
        width: 1200,
        height: 630,
        alt: "Nemo's Card Shop - The Vault - Real Brand",
      },
      {
        url: "/og-fallback.jpg",
        width: 1200,
        height: 630,
        alt: "Nemo's Card Shop - Fallback OG - Real",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nemo's Card Shop — The Vault • Real Brand",
    description: "2,847 slabs forged. Real logos, mascot, 42 slabs, Rapier pit, true GLSL. Your JPEG deserves better.",
    images: ["/api/og?finish=holo&name=BAYC%20%232087&collection=Bored%20Ape%20Yacht%20Club", "/og-fallback.jpg"],
  },
  icons: {
    icon: [
      { url: "/logo-mark.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/mascot/front.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo-mark.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo-mark-orange.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/mascot/front.png" />
        <style>{`
          :root {
            --font-display: 'Syne', sans-serif;
            --font-body: 'Space Grotesk', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col bg-[#080808] text-[#F5F3EF] overflow-x-hidden">
        <Providers>
          <CanvasRoot />
          <CustomCursor />
          <div className="grain" />
          <div className="scroll-progress" id="scroll-progress" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
