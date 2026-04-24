import { Html, Head, Main, NextScript } from "next/document";
import { useRouter } from "next/router";

/*
 * Everything browser-critical lives here instead of _app.tsx. Three reasons:
 *
 * 1. Vinext 0.0.43 Pages Router doesn't emit <link rel="stylesheet"> for
 *    _app.tsx's CSS chunk in SSR (collectAssetTags walks only the current
 *    page's manifest entry + a handful of hardcoded shared-chunk prefixes,
 *    none of which match `_app-*`). Without a hardcoded <link> here, first
 *    paint has no styles. See pages-server-entry.js collectAssetTags.
 *
 * 2. Vinext 0.0.43 collects next/head content BEFORE the body stream
 *    renders (pages-page-response.js line 104 → 110), so <Head> tags placed
 *    in _app.tsx or page components never reach the SSR shell. _document's
 *    Head children DO reach the shell because the Document renders via
 *    renderDocumentToString as part of the prefix.
 *
 * 3. Both behaviors are tracked bugs, not final design — the README
 *    explicitly calls the project experimental. When those get fixed we can
 *    move fonts back to _app.tsx and delete the hardcoded <link> + the
 *    assetFileNames override in vite.config.ts.
 *
 * What stays here long-term regardless of any vinext fix:
 *   - Critical inline CSS (prevents white flash on first paint)
 *   - Theme bootstrap script (must run in <head> to set data-theme before
 *     any body paint)
 *   - meta theme-color + <html lang>
 */

const CRITICAL_CSS = `
  html{background:#131313;color-scheme:dark;}
  html[data-theme="light"]{background:#f7f4ef;color-scheme:light;}
  body{background:inherit;color:inherit;margin:0;}
`;

const THEME_BOOTSTRAP = `
  (function(){try{
    var t=localStorage.getItem("blog-theme")||"dark";
    document.documentElement.dataset.theme=t;
  }catch(e){
    document.documentElement.dataset.theme="dark";
  }})();
`;

export default function Document() {
  const router = useRouter();
  const lang = router?.locale === "en" ? "en" : "pt-BR";

  return (
    <Html lang={lang} data-theme="dark" data-accent="amber">
      <Head>
        {/* charset + viewport are auto-injected by next/document's Head shim. */}
        <meta name="theme-color" content="#131313" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f4ef" media="(prefers-color-scheme: light)" />

        {/* Anti-FOUC: paint the right background before the external stylesheet
            loads. Values must match the --bg token in styles/tokens.css. */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />

        {/* Theme bootstrap: runs before first paint to honor stored preference. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />

        {/* Fonts: must live here (not _app.tsx) until vinext fixes next/head
            SSR ordering. Preconnect first, then the stylesheet. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Main stylesheet: hardcoded because vinext doesn't auto-emit
            _app.tsx's CSS chunk. Stable filename guaranteed by
            vite.config.ts → build.rollupOptions.output.assetFileNames.
            In dev Vite serves the raw source file directly from /styles/;
            in prod it's the hashed-but-stably-named built asset. */}
        {import.meta.env.PROD ? (
          <link rel="stylesheet" href="/assets/app.css" />
        ) : (
          <link rel="stylesheet" href="/styles/globals.css" />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
