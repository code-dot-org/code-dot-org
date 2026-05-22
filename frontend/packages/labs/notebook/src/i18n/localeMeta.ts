/** Locale tag for each language variant supported by the notebook lab. */
export type SupportedLocale = 'en-US' | 'ja-JP' | 'hi-IN' | 'fa-IR';

/** Inline text flow direction implied by the locale's writing system. */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Display metadata for a single supported locale.
 */
export interface LocaleMeta {
  /** Name as written in the locale's own script and orthography. */
  nativeName: string;
  /** Name rendered in English for developer tooling and fallback UI. */
  englishName: string;
  /** Inline text flow direction for the locale's primary script. */
  direction: TextDirection;
}

/** Locale used when no preference has been set or the stored value is invalid. */
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

/**
 * Static metadata for every locale the lab ships with.
 * Keyed by IETF BCP-47 language tag.
 */
export const LOCALE_META: Record<SupportedLocale, LocaleMeta> = {
  'en-US': {nativeName: 'English', englishName: 'English', direction: 'ltr'},
  'ja-JP': {nativeName: '日本語', englishName: 'Japanese', direction: 'ltr'},
  'hi-IN': {nativeName: 'हिन्दी', englishName: 'Hindi', direction: 'ltr'},
  // Persian is the only RTL locale in the initial set.
  'fa-IR': {nativeName: 'فارسی', englishName: 'Farsi', direction: 'rtl'},
};
