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
  title: "Ópera Prima | Compañía de Ópera y Música Clásica",
  description: "Descubre la excelencia lírica con Ópera Prima. Cartelera de temporadas históricas, selección interactiva de entradas en boletería, academia de altos estudios escénicos y streaming premium de música clásica.",
  keywords: "opera, musica clasica, teatro colon, la scala de milan, opera prima, teatro, lirica, ballet, orquesta filarmonica, carmen, la traviata",
  authors: [{ name: "Ópera Prima Compañía" }],
  icons: {
    icon: "/images/silencio_isotipo.svg",
  }
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

