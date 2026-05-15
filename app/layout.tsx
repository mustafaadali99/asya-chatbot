import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

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
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
