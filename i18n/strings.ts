import type { Locale } from "../lib/site-config";

/**
 * All user-facing strings keyed by locale.
 * Add a new key here AND translate both versions — TypeScript enforces parity.
 */
export const STRINGS = {
  "pt-BR": {
    // Nav
    nav_archive: "arquivo",
    nav_about: "sobre",
    nav_rss: "rss",

    // Post list / post pages
    post_back: "← voltar ao índice",
    post_not_found_title: "Post não encontrado",
    post_not_found_back: "← voltar ao arquivo",

    // Newsletter
    nl_title_pre: "Receba novos ensaios",
    nl_title_em: "por e-mail",
    nl_placeholder: "seu@email.com",
    nl_submit: "Assinar →",
    nl_loading: "enviando…",
    nl_done: "obrigado ✓",
    nl_error_config: "Configure VITE_MAILCHIMP_URL no .env para ativar.",

    // RSS page
    rss_eyebrow: "assinar · rss",
    rss_title_a: "Um feed",
    rss_title_em: "no seu ritmo",
    rss_title_b: ", sem algoritmo.",
    rss_subtitle:
      "RSS é o jeito mais antigo e mais honesto de acompanhar um blog. Adicione o endereço abaixo no seu leitor favorito — novos ensaios aparecem lá sem e-mail, sem tracking, sem notificação.",
    rss_readers_head: "Escolha um leitor",
    rss_readers_count_suffix: "opções",
    rss_reader_cta: "abrir →",
    rss_copy: "COPIAR",
    rss_copied: "COPIADO",

    // Footer
    foot_github: "github",
    foot_twitter: "twitter",
    foot_email: "email",

    // Locale toggle tooltip
    locale_toggle_aria: "Trocar idioma",

    // Post row
    post_list_count: "ensaios",
    post_list_count_singular: "ensaio",

    // Share buttons
    share_label: "Compartilhar",
    share_copy: "Copiar link",
    share_copied: "Copiado",
    share_more: "Mais",

    // Post TOC
    toc_label: "Nesta página",
    toc_back_to_top: "Voltar ao início",
  },

  en: {
    // Nav
    nav_archive: "archive",
    nav_about: "about",
    nav_rss: "rss",

    // Post list / post pages
    post_back: "← back to archive",
    post_not_found_title: "Post not found",
    post_not_found_back: "← back to archive",

    // Newsletter
    nl_title_pre: "Get new essays",
    nl_title_em: "by email",
    nl_placeholder: "your@email.com",
    nl_submit: "Subscribe →",
    nl_loading: "sending…",
    nl_done: "thanks ✓",
    nl_error_config: "Set VITE_MAILCHIMP_URL in .env to enable this.",

    // RSS page
    rss_eyebrow: "subscribe · rss",
    rss_title_a: "A feed",
    rss_title_em: "at your own pace",
    rss_title_b: ", no algorithm.",
    rss_subtitle:
      "RSS is the oldest and most honest way to follow a blog. Add the address below to your favorite reader — new essays show up there without email, tracking, or notifications.",
    rss_readers_head: "Pick a reader",
    rss_readers_count_suffix: "options",
    rss_reader_cta: "open →",
    rss_copy: "COPY",
    rss_copied: "COPIED",

    // Footer
    foot_github: "github",
    foot_twitter: "twitter",
    foot_email: "email",

    // Locale toggle tooltip
    locale_toggle_aria: "Switch language",

    // Post row
    post_list_count: "essays",
    post_list_count_singular: "essay",

    // Share buttons
    share_label: "Share",
    share_copy: "Copy link",
    share_copied: "Copied",
    share_more: "More",

    // Post TOC
    toc_label: "On this page",
    toc_back_to_top: "Back to top",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type StringKey = keyof (typeof STRINGS)["pt-BR"];
