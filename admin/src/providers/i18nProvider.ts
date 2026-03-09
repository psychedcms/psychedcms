import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import frenchMessages from 'ra-language-french';

const messages: Record<string, object> = {
  en: englishMessages,
  fr: frenchMessages,
};

/**
 * Create a polyglot i18n provider for react-admin.
 * The initial locale comes from the user's preferred editing locale.
 */
export function createI18nProvider(defaultLocale: string) {
  return polyglotI18nProvider(
    (locale) => messages[locale] ?? englishMessages,
    defaultLocale,
    [
      { locale: 'en', name: 'English' },
      { locale: 'fr', name: 'Français' },
    ],
  );
}
