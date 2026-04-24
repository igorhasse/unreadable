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
    nl_copy_full:
      'Uma newsletter ocasional. Sem resumos, sem "5 tendências", só o post completo quando sair — geralmente uma vez por mês.',
    nl_copy_compact: "Se gostou, assine pra receber o próximo no seu e-mail.",
    nl_placeholder: "seu@email.com",
    nl_submit: "Assinar →",
    nl_loading: "enviando…",
    nl_done: "obrigado ✓",
    nl_fineprint: "Cancele em um clique. Sem spam, nunca.",
    nl_error_config: "Configure VITE_MAILCHIMP_URL no .env para ativar.",

    // About page
    about_eyebrow: "sobre · igor hasse",
    about_title_a: "Engenheiro que escreve",
    about_title_em: "antes",
    about_title_b: "de publicar.",
    about_lede_a:
      "Oi. Sou Igor — engenheiro de software, brasileiro, atualmente trabalhando com ferramentas para desenvolvedores. Este é meu",
    about_lede_em: "caderno público",
    about_lede_b: ".",
    about_h2_blog: "Sobre o blog",
    about_blog:
      "A primeira regra é simples: nada sai daqui antes de eu reler por inteiro depois de pelo menos sete dias parado. Escrevo aqui quando uma ideia já passou semanas no rascunho e ainda sobrevive.",
    about_h2_now: "O que estou fazendo agora",
    about_now: "Trabalho, side projects, livros. Preencha como quiser.",
    about_h2_contact: "Contato",
    about_contact_a: "Melhor canal:",
    about_contact_email: "email",
    about_contact_b: ". Também leio DMs no",
    about_contact_twitter: "twitter",
    about_contact_c: ".",

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
    foot_copyright: "Igor Hasse",
    foot_github: "github",
    foot_twitter: "twitter",
    foot_email: "email",

    // Locale toggle tooltip
    locale_toggle_aria: "Trocar idioma",

    // Post row
    post_list_count: "ensaios",
    post_list_count_singular: "ensaio",
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
    nl_copy_full:
      'An occasional newsletter. No roundups, no "5 trends," just the full post when it drops — usually once a month.',
    nl_copy_compact: "If you enjoyed this, subscribe to get the next one in your inbox.",
    nl_placeholder: "your@email.com",
    nl_submit: "Subscribe →",
    nl_loading: "sending…",
    nl_done: "thanks ✓",
    nl_fineprint: "One-click unsubscribe. No spam, ever.",
    nl_error_config: "Set VITE_MAILCHIMP_URL in .env to enable this.",

    // About page
    about_eyebrow: "about · igor hasse",
    about_title_a: "Engineer who writes",
    about_title_em: "before",
    about_title_b: "publishing.",
    about_lede_a:
      "Hi. I'm Igor — software engineer, Brazilian, currently working on developer tools. This is my",
    about_lede_em: "public notebook",
    about_lede_b: ".",
    about_h2_blog: "About this blog",
    about_blog:
      "The first rule is simple: nothing ships until I reread it end to end after at least seven days of rest. I write here when an idea has already sat in drafts for weeks and still survives.",
    about_h2_now: "What I'm doing now",
    about_now: "Work, side projects, books. Fill in the rest as you like.",
    about_h2_contact: "Contact",
    about_contact_a: "Best channel:",
    about_contact_email: "email",
    about_contact_b: ". I also read DMs on",
    about_contact_twitter: "twitter",
    about_contact_c: ".",

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
    foot_copyright: "Igor Hasse",
    foot_github: "github",
    foot_twitter: "twitter",
    foot_email: "email",

    // Locale toggle tooltip
    locale_toggle_aria: "Switch language",

    // Post row
    post_list_count: "essays",
    post_list_count_singular: "essay",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type StringKey = keyof (typeof STRINGS)["pt-BR"];
