/**
 * Tests for text-direction metadata in LOCALE_META.
 *
 * Coverage:
 *   - fa-IR is the only RTL locale in the initial set.
 *   - All other locales are LTR.
 *   - document.documentElement.dir would be set to 'rtl' for fa-IR and
 *     'ltr' for all others (verified via LOCALE_META, which is what
 *     lab-root.tsx reads in its useEffect).
 */

import {describe, it, expect} from 'vitest';
import {LOCALE_META} from '../localeMeta';
import type {SupportedLocale} from '../localeMeta';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LOCALE_META text direction', () => {
  it('fa-IR has direction rtl', () => {
    expect(LOCALE_META['fa-IR'].direction).toBe('rtl');
  });

  it('en-US has direction ltr', () => {
    expect(LOCALE_META['en-US'].direction).toBe('ltr');
  });

  it('ja-JP has direction ltr', () => {
    expect(LOCALE_META['ja-JP'].direction).toBe('ltr');
  });

  it('hi-IN has direction ltr', () => {
    expect(LOCALE_META['hi-IN'].direction).toBe('ltr');
  });

  it('all non-fa-IR locales are ltr', () => {
    const ltrLocales: SupportedLocale[] = ['en-US', 'ja-JP', 'hi-IN'];
    for (const locale of ltrLocales) {
      expect(LOCALE_META[locale].direction).toBe('ltr');
    }
  });

  it('document.documentElement.dir would be rtl for fa-IR', () => {
    // Verify the value that lab-root.tsx would pass to document.documentElement.dir.
    // The actual DOM assignment is tested indirectly by reading LOCALE_META, which
    // is the sole source of truth for the effect.
    expect(LOCALE_META['fa-IR'].direction).toBe('rtl');
  });

  it('document.documentElement.dir would be ltr for en-US', () => {
    expect(LOCALE_META['en-US'].direction).toBe('ltr');
  });

  it('exactly one locale is rtl', () => {
    const locales = Object.keys(LOCALE_META) as SupportedLocale[];
    const rtlLocales = locales.filter(l => LOCALE_META[l].direction === 'rtl');
    expect(rtlLocales).toEqual(['fa-IR']);
  });
});
