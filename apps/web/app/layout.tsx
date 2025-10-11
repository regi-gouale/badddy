import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Solide Cotizoo - Logiciel de facturation pour freelances et auto-entrepreneurs",
    template: "%s | Solide Cotizoo",
  },
  description:
    "Créez et gérez vos devis et factures en ligne. Logiciel de facturation gratuit et simple pour freelances, auto-entrepreneurs et TPE. Conforme à la réglementation française.",
  keywords: [
    "logiciel de facturation",
    "facturation freelance",
    "devis en ligne",
    "facture auto-entrepreneur",
    "gestion facturation",
    "logiciel devis gratuit",
    "facturation TPE",
    "créer facture",
    "suivi paiement",
    "export PDF facture",
    "facturation conforme",
    "gestion clients",
  ],
  authors: [{ name: "Solide Cotizoo" }],
  creator: "Solide Cotizoo",
  publisher: "Solide Cotizoo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://solide.cotizoo.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Solide Cotizoo",
    title: "Solide Cotizoo - Logiciel de facturation pour freelances",
    description:
      "Créez et gérez vos devis et factures en ligne. Simple, rapide et conforme à la réglementation française.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Solide Cotizoo - Logiciel de facturation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solide Cotizoo - Logiciel de facturation pour freelances",
    description:
      "Créez et gérez vos devis et factures en ligne. Simple, rapide et conforme.",
    images: ["/og-image.png"],
    creator: "@solidecotizoo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlausibleProvider domain="badddy.cotizoo.com">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <NuqsAdapter>
                <main className="min-h-screen w-full bg-background text-foreground">
                  {children}
                </main>
              </NuqsAdapter>
            </ReactQueryProvider>
            <ToasterProvider />
          </ThemeProvider>
        </PlausibleProvider>
      </body>
    </html>
  );
}
