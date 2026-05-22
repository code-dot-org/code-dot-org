/**
 * Static-strings i18n provider for the mobile prototype.
 *
 * Loads strings.en.json and strings.hi.json from the content bundle,
 * selects the right file based on the active seat's language, and
 * exposes a useString(key) hook throughout the subtree.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import enStrings from '../content/strings.en.json';
import hiStrings from '../content/strings.hi.json';
import type {Language} from '../seats/types';

/** Map of all translated string keys to their values. */
type StringsMap = Record<string, string>;

const STRINGS: Record<Language, StringsMap> = {
  en: enStrings as StringsMap,
  hi: hiStrings as StringsMap,
};

interface StringsContextValue {
  lang: Language;
  getString: (key: string) => string;
}

const StringsContext = createContext<StringsContextValue | null>(null);

interface StringsProviderProps {
  lang: Language;
  children: ReactNode;
}

/**
 * Wraps the subtree with the active language's string lookup.
 * Re-renders children whenever lang changes (language toggle).
 */
export function StringsProvider({lang, children}: StringsProviderProps) {
  const strings = STRINGS[lang] ?? STRINGS.en;

  const getString = useCallback(
    (key: string): string => strings[key] ?? key,
    [strings],
  );

  const value = useMemo<StringsContextValue>(
    () => ({lang, getString}),
    [lang, getString],
  );

  return (
    <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
  );
}

/**
 * Returns the localized string for key in the active language.
 * Falls back to the key itself if not found (visible in the UI as a
 * missing-translation signal during development).
 */
export function useString(key: string): string {
  const ctx = useContext(StringsContext);
  if (!ctx) {
    // Outside provider — return key as a safe fallback (dev only).
    return key;
  }
  return ctx.getString(key);
}

/** Exposes the active language code from the nearest StringsProvider. */
export function useLanguage(): Language {
  const ctx = useContext(StringsContext);
  return ctx?.lang ?? 'en';
}
