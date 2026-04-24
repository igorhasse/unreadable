import type { AppProps } from "next/app";
import "../styles/globals.css";

// Why _app.tsx is so thin: vinext 0.0.43's next/head SSR collector runs
// before the body stream renders, so <Head> tags placed here don't reach
// the SSR shell. All head content lives in _document.tsx instead, which
// renders as part of the shell prefix. See _document.tsx for the full story.

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
