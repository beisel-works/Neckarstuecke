import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Neckarstücke — Kunstdrucke aus dem Neckartal",
    template: "%s — Neckarstücke",
  },
  description:
    "Feinkunstdrucke für Menschen, die das Neckartal kennen. Limitierte Editionen, gedruckt auf Hahnemühle German Etching 310 g/m² (Giclée).",
  openGraph: {
    siteName: "Neckarstücke",
    locale: "de_DE",
    type: "website",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://neckarstuecke.de"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${ebGaramond.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-charcoal)] antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
