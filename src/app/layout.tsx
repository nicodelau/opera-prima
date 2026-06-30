import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://operaprimaproducciones.com"),
  title: "Ópera Prima | Compañía de Ópera y Música Clásica",
  description: "Descubre la excelencia lírica con Ópera Prima. Cartelera de temporadas históricas, selección interactiva de entradas en boletería, academia de altos estudios escénicos y streaming premium de música clásica.",
  keywords: "opera, musica clasica, teatro colon, la scala de milan, opera prima, teatro, lirica, ballet, orquesta filarmonica, carmen, la traviata",
  authors: [{ name: "Ópera Prima Compañía" }],
  icons: {
    icon: "/images/silencio_isotipo.svg",
  },
  openGraph: {
    title: "Ópera Prima | Compañía de Ópera y Música Clásica",
    description: "Descubre la excelencia lírica con Ópera Prima. Cartelera de temporadas históricas, selección interactiva de entradas en boletería, academia de altos estudios escénicos y streaming premium de música clásica.",
    url: "https://operaprimaproducciones.com",
    siteName: "Ópera Prima",
    images: [
      {
        url: "/images/isotype_top.png", // <-- Tu isotipo/logo en formato PNG (1200x630 recomendado para redes)
        width: 1200,
        height: 630,
        alt: "Isotipo de Ópera Prima",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ópera Prima | Compañía de Ópera y Música Clásica",
    description: "Descubre la excelencia lírica con Ópera Prima. Cartelera de temporadas históricas, selección interactiva de entradas en boletería, academia de altos estudios escénicos y streaming premium de música clásica.",
    images: ["/images/isotype_top.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}

