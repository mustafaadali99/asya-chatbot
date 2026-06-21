import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["300", "400", "500", "600"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", weight: ["300", "400", "500", "600"], style: ["normal", "italic"] });

const SITE_URL = 'https://asya.elegancevipperfume.com'
const SHOP_URL = 'https://www.elegancevipperfume.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "ASYA | Yapay Zeka Parfüm Asistanı — Elegance VIP Perfume",
    template: "%s | ASYA Koku Asistanı",
  },

  description: "Türkiye'nin ilk yapay zeka destekli parfüm asistanı ASYA; teninizi, ruh halinizi ve mevsimi analiz ederek binlerce nota arasından size özel imza kokunuzu bulur. Kör alışa son verin.",

  keywords: [
    "yapay zeka parfüm asistanı",
    "koku asistanı",
    "parfüm önerisi yapay zeka",
    "imza koku bul",
    "kişisel parfüm profili",
    "muadil parfüm bul",
    "Elegance VIP Perfume",
    "koku profili",
    "parfüm testi",
    "online parfüm danışmanı",
    "Türkiye parfüm platformu",
    "akıllı parfüm seçici",
    "hediye parfüm önerisi",
    "nişli parfüm Türkiye",
    "extrait de parfum Türkiye",
    "ASYA koku asistanı",
    "koku gardırobu",
  ],

  authors: [{ name: "Elegance VIP Perfume", url: SHOP_URL }],
  creator: "Elegance VIP Perfume",
  publisher: "Elegance VIP Perfume",
  applicationName: "ASYA Koku Asistanı",

  alternates: {
    canonical: SITE_URL,
    languages: {
      'tr-TR': SITE_URL,
    },
  },

  openGraph: {
    title: "ASYA — Yapay Zeka ile Parfüm Profilinizi Keşfedin",
    description: "Teninizi, ruh halinizi ve mevsimi analiz ederek imza kokunuzu bulan Türkiye'nin ilk yapay zeka destekli koku asistanı. Ücretsiz koku testi — sonuç hemen e-postanıza gelir.",
    url: SITE_URL,
    siteName: "Elegance VIP — ASYA Koku Asistanı",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/hero-desktop.jpg`,
        width: 1200,
        height: 630,
        alt: "ASYA Yapay Zeka Parfüm Asistanı — Elegance VIP Perfume",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ASYA | Yapay Zeka Parfüm Asistanı",
    description: "Teninize ve ruh halinize özel parfüm profili — Türkiye'nin ilk akıllı koku asistanı.",
    images: [`${SITE_URL}/hero-desktop.jpg`],
    creator: "@elegancevip",
  },

  icons: {
    icon: '/elegance favicon.png',
    shortcut: '/elegance favicon.png',
    apple: '/elegance favicon.png',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  category: "shopping",

  verification: {
    google: "DzwTnRvUNi_lwrDfDROaIgTuKQgXozUmAAf2MfSbk7c",
  },
};

/* ═══ JSON-LD Structured Data (GEO + SEO) ═══ */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization
    {
      "@type": "Organization",
      "@id": `${SHOP_URL}/#organization`,
      "name": "Elegance VIP Perfume",
      "url": SHOP_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/elegance%20logo.png`,
        "width": 400,
        "height": 120,
      },
      "sameAs": [
        "https://www.instagram.com/elegancevipperfume",
        SHOP_URL,
      ],
      "description": "Türkiye'nin lider niş parfüm markası. Gold Serisi ve Elegancia Premium koleksiyonlarıyla yüzlerce benzersiz koku.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR",
      },
    },

    // WebSite
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "ASYA — Yapay Zeka Parfüm Asistanı",
      "description": "Türkiye'nin ilk yapay zeka destekli kişisel parfüm asistanı.",
      "publisher": {
        "@id": `${SHOP_URL}/#organization`,
      },
      "inLanguage": "tr-TR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/chat?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },

    // SoftwareApplication — ASYA
    {
      "@type": "SoftwareApplication",
      "name": "ASYA Koku Asistanı",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "url": SITE_URL,
      "description": "ASYA; teninizi, ruh halinizi, mevsimi ve hava durumunu analiz ederek yapay zeka ile kişisel parfüm profilinizi oluşturur. Muadil parfüm bulma, hediye önerisi, koku gardırobu özellikleri sunar.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY",
        "description": "Ücretsiz koku profili testi",
      },
      "featureList": [
        "Yapay zeka destekli kişisel koku profili oluşturma",
        "3 kişiselleştirilmiş parfüm önerisi",
        "Muadil parfüm bulma motoru",
        "Hediye parfüm sihirbazı",
        "Koku gardırobu (koleksiyon takibi)",
        "Koku hikayesi ve fal analizi",
        "Hava durumuna göre koku önerisi",
        "Kutu açma deneyimi (Unboxing)",
        "E-posta ile kişisel koku profili raporu",
      ],
      "publisher": {
        "@id": `${SHOP_URL}/#organization`,
      },
      "inLanguage": "tr-TR",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "247",
        "bestRating": "5",
      },
    },

    // FAQPage — GEO için kritik (AI arama motorları FAQ'ları çok sever)
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "ASYA koku asistanı nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ASYA, Elegance VIP Perfume'un geliştirdiği Türkiye'nin ilk yapay zeka destekli kişisel koku asistanıdır. Teninizi, ruh halinizi, mevsimi ve hava durumunu analiz ederek size özel parfüm profili oluşturur ve 3 kişiselleştirilmiş koku önerir.",
          },
        },
        {
          "@type": "Question",
          "name": "Yapay zeka ile parfüm önerisi nasıl çalışır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ASYA ile sohbet ederek ten tipinizi, sevdiğiniz koku ailelerini, kullanım amacınızı ve yaşam tarzınızı paylaşırsınız. Yapay zeka bu bilgileri analiz ederek Gold Serisi ve Elegancia Premium koleksiyonlarından size en uygun 3 parfümü önerir ve kişisel koku profilinizi oluşturur.",
          },
        },
        {
          "@type": "Question",
          "name": "Muadil parfüm nasıl bulunur?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ASYA'nın Muadil Bul özelliği ile ünlü markaların pahalı parfümlerine benzer, aynı nota yapısına sahip Elegance VIP parfümlerini anında bulabilirsiniz. Parfüm adını veya notalarını yazmanız yeterlidir.",
          },
        },
        {
          "@type": "Question",
          "name": "Koku profili testi ücretsiz mi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Evet, ASYA koku profili testi tamamen ücretsizdir. Testi tamamladığınızda kişisel koku profiliniz ve önerilen parfümler e-posta adresinize gönderilir.",
          },
        },
        {
          "@type": "Question",
          "name": "Elegance VIP parfümleri hangi serilerden oluşuyor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Elegance VIP Perfume iki ana koleksiyon sunar: Gold Serisi (geniş yelpazede, her gün kullanıma uygun parfümler) ve Elegancia Premium (niş, Extrait de Parfum konsantrasyonunda lüks koleksiyon). Her iki seriden de ASYA size özel öneriler sunar.",
          },
        },
        {
          "@type": "Question",
          "name": "Koku gardırobu nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Koku gardırobu, ASYA üzerinden beğendiğiniz ve kaydettiğiniz parfümlerin kişisel koleksiyonudur. Günlük, romantik, gece ve oryantal gibi kategorilere göre filtreyebilir, koleksiyonunuzu yönetebilirsiniz.",
          },
        },
        {
          "@type": "Question",
          "name": "Hediye parfüm nasıl seçilir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ASYA'nın Hediye Sihirbazı özelliği ile sevdiklerinize parfüm bulmak çok kolay. Kişinin yaşı, cinsiyeti, karakteri ve bütçesi gibi bilgileri paylaşın; ASYA en uygun hediye parfümünü önerir.",
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
