import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["300", "400", "500", "600"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", weight: ["300", "400", "500", "600"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "ASYA — Elegance VIP Perfume Koku Asistanı",
  description: "Size özel parfümü birlikte bulalım. AI destekli koku asistanı.",
  openGraph: {
    title: "ASYA — Elegance VIP Perfume",
    description: "Ruhunuza en uygun kokuyu buluyoruz.",
    url: "https://www.elegancevipperfume.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
