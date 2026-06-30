import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";

export const dictionaries = {
  es,
  en,
  fr,
} as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof es;

export const supportedLocales: Locale[] = ["es", "en", "fr"];
export const defaultLocale: Locale = "es";

export function hasLocale(locale: string | undefined | null): locale is Locale {
  if (!locale) return false;
  return supportedLocales.includes(locale as Locale);
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function getDictionarySync(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
