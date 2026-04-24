// Vinext reads this file at build/dev and applies the i18n config to SSR
// routing. With defaultLocale 'pt-BR', URLs stay at root for PT; EN gets
// the /en prefix. localeDetection:false means no auto-redirect from
// Accept-Language — first-time visitors always land on PT, and the
// LocaleToggle in the header lets them switch.
export default {
  i18n: {
    locales: ["pt-BR", "en"],
    defaultLocale: "pt-BR",
    localeDetection: false,
  },
};
