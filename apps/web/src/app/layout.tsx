import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Barlow_Condensed } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

// Inter supports Vietnamese out of the box
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// IBM Plex Mono has full Vietnamese Unicode coverage
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: false,
});

// Barlow Condensed with latin-ext covers Vietnamese diacritics in headlines
const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BIGKID Aero Lab — Engineering Performance. Crafting Speed.",
    template: "%s | BIGKID Aero Lab",
  },
  description:
    "Precision-engineered TT & Triathlon components. The exclusive performance hub for elite cycling in Vietnam.",
  openGraph: {
    siteName: "BIGKID Aero Lab",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${ibmPlexMono.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
