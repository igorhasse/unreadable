import type { Metadata, Viewport } from "next";
import { Newsreader, Geist } from "next/font/google";
import { notFound } from "next/navigation";
import "../../styles/globals.css";
import { SITE, type Locale } from "../../lib/site-config";
import SiteHeader from "../../components/SiteHeader";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const CRITICAL_CSS = `
  html{color-scheme:dark;}
  html[data-theme="light"]{color-scheme:light;}
  @font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:400 500;font-display:swap;src:url("/fonts/jetbrains-mono-latin.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
`;

const THEME_BOOTSTRAP = `
  (function(){try{
    var t=localStorage.getItem("blog-theme")||"dark";
    document.documentElement.dataset.theme=t;
  }catch(e){
    document.documentElement.dataset.theme="dark";
  }})();
`;

const LOCALES: readonly Locale[] = ["pt-BR", "en"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) return {};
  const loc = locale as Locale;
  return {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    authors: [{ name: SITE.author.name, url: SITE.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    title: {
      default: `${loc === "pt-BR" ? "Início" : "Home"} | ${SITE.author.displayName}`,
      template: `%s | ${SITE.author.displayName}`,
    },
    description: SITE.description[loc],
    alternates: {
      canonical: `/${loc}`,
      languages: {
        "pt-BR": "/pt-BR",
        en: "/en",
        "x-default": "/pt-BR",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: `/${loc}`,
      title: SITE.name,
      description: SITE.description[loc],
      locale: loc === "en" ? "en_US" : "pt_BR",
      images: [
        {
          url: `/${loc}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: SITE.author.twitter,
      site: SITE.author.twitter,
      images: [`/${loc}/opengraph-image`],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: "/apple-touch-icon.png",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
  ],
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const loc = locale as Locale;

  return (
    <html
      lang={loc}
      data-theme="dark"
      data-accent="amber"
      className={`${serif.variable} ${sans.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <div className="shell">
          <SiteHeader locale={loc} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
