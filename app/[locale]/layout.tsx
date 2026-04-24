import type { Metadata, Viewport } from "next";
import { Newsreader, Geist, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../../styles/globals.css";
import { SITE, type Locale } from "../../lib/site-config";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

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

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const CRITICAL_CSS = `
  html{color-scheme:dark;}
  html[data-theme="light"]{color-scheme:light;}
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) return {};
  const loc = locale as Locale;
  return {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    authors: [{ name: SITE.author.name, url: SITE.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    title: { default: SITE.name, template: `%s · ${SITE.name}` },
    description: SITE.description[loc],
    alternates: {
      canonical: `/${loc}`,
      languages: {
        "pt-BR": "/pt-BR",
        "en": "/en",
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
      alternateLocale: loc === "en" ? ["pt_BR"] : ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      creator: SITE.author.twitter,
      site: SITE.author.twitter,
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
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <div className="shell">
          <SiteHeader locale={loc} />
          <main>{children}</main>
          <SiteFooter locale={loc} />
        </div>
      </body>
    </html>
  );
}
