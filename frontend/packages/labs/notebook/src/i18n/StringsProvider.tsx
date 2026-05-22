import type {ReactNode} from 'react';
import {createContext, useContext, useMemo} from 'react';

import {type SupportedLocale, DEFAULT_LOCALE} from './localeMeta';

// ---------------------------------------------------------------------------
// Static bundle imports — one per category × locale.
// All files are currently empty ({}) but the merge logic handles population
// transparently as translators fill them in.
// ---------------------------------------------------------------------------

import notebooksEnUS from './labels/notebooks.en-US.json';
import notebooksJaJP from './labels/notebooks.ja-JP.json';
import notebooksHiIN from './labels/notebooks.hi-IN.json';
import notebooksFaIR from './labels/notebooks.fa-IR.json';

import settingsEnUS from './labels/settings.en-US.json';
import settingsJaJP from './labels/settings.ja-JP.json';
import settingsHiIN from './labels/settings.hi-IN.json';
import settingsFaIR from './labels/settings.fa-IR.json';

import rendererEnUS from './labels/renderer.en-US.json';
import rendererJaJP from './labels/renderer.ja-JP.json';
import rendererHiIN from './labels/renderer.hi-IN.json';
import rendererFaIR from './labels/renderer.fa-IR.json';

import navigationEnUS from './labels/navigation.en-US.json';
import navigationJaJP from './labels/navigation.ja-JP.json';
import navigationHiIN from './labels/navigation.hi-IN.json';
import navigationFaIR from './labels/navigation.fa-IR.json';

import themesEnUS from './labels/themes.en-US.json';
import themesJaJP from './labels/themes.ja-JP.json';
import themesHiIN from './labels/themes.hi-IN.json';
import themesFaIR from './labels/themes.fa-IR.json';

// ---------------------------------------------------------------------------
// Internal bundle map
// ---------------------------------------------------------------------------

/**
 * All category bundles for a single locale merged into one flat map.
 * Later categories win on key collision — categories are ordered by specificity
 * so that more-specific namespaces (e.g. renderer) can override shared keys.
 */
type FlatBundle = Record<string, string>;

/**
 * Merges an ordered list of JSON import objects into a single flat map,
 * casting values to string along the way.
 * @param parts Ordered category objects from JSON imports.
 * @returns A single flat key→string map.
 */
function mergeCategories(...parts: Record<string, unknown>[]): FlatBundle {
  const result: FlatBundle = {};
  for (const part of parts) {
    for (const [k, v] of Object.entries(part)) {
      result[k] = String(v);
    }
  }
  return result;
}

/** Pre-built flat bundles keyed by locale — computed once at module load. */
const BUNDLES: Record<SupportedLocale, FlatBundle> = {
  'en-US': mergeCategories(
    notebooksEnUS,
    settingsEnUS,
    rendererEnUS,
    navigationEnUS,
    themesEnUS,
  ),
  'ja-JP': mergeCategories(
    notebooksJaJP,
    settingsJaJP,
    rendererJaJP,
    navigationJaJP,
    themesJaJP,
  ),
  'hi-IN': mergeCategories(
    notebooksHiIN,
    settingsHiIN,
    rendererHiIN,
    navigationHiIN,
    themesHiIN,
  ),
  'fa-IR': mergeCategories(
    notebooksFaIR,
    settingsFaIR,
    rendererFaIR,
    navigationFaIR,
    themesFaIR,
  ),
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StringsContextValue {
  /** Resolved flat string bundle for the active locale. */
  bundle: FlatBundle;
  /** Active locale tag. */
  locale: SupportedLocale;
}

const StringsContext = createContext<StringsContextValue | null>(null);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Props accepted by {@link StringsProvider}.
 */
export interface StringsProviderProps {
  /** Active locale to use for all string lookups within this subtree. */
  locale: SupportedLocale;
  children: ReactNode;
}

/**
 * Provides localised strings to the component subtree via context.
 * Merges all five category bundles for the given locale, falling back to
 * en-US for any keys missing in the active locale.
 * @param props.locale Active locale tag.
 * @param props.children Component subtree that consumes strings.
 */
export function StringsProvider({
  locale,
  children,
}: StringsProviderProps): JSX.Element {
  // Merge active locale over en-US so untranslated keys always resolve.
  const bundle = useMemo<FlatBundle>(() => {
    const base = BUNDLES[DEFAULT_LOCALE];
    if (locale === DEFAULT_LOCALE) {
      return base;
    }
    return {...base, ...BUNDLES[locale]};
  }, [locale]);

  const value = useMemo<StringsContextValue>(
    () => ({bundle, locale}),
    [bundle, locale],
  );

  return (
    <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
  );
}

/**
 * Returns the localised string for the given key.
 * Fallback chain: active locale → en-US → key itself.
 * Must be called inside a {@link StringsProvider}.
 * @param key Bundle key to look up.
 * @returns Translated string, or the key verbatim when no translation exists.
 */
export function useString(key: string): string {
  const ctx = useContext(StringsContext);
  if (ctx === null) {
    throw new Error('useString must be used inside a StringsProvider');
  }
  return ctx.bundle[key] ?? key;
}

/**
 * Returns the currently active locale tag.
 * Must be called inside a {@link StringsProvider}.
 * @returns Active {@link SupportedLocale} tag.
 */
export function useLocale(): SupportedLocale {
  const ctx = useContext(StringsContext);
  if (ctx === null) {
    throw new Error('useLocale must be used inside a StringsProvider');
  }
  return ctx.locale;
}
