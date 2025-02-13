import {figtree} from '@/config/fonts/figtree';
import {
  getNotoFallbackFonts,
  notoSans,
  notoSansMath,
} from '@/config/fonts/noto';
import {
  barlowSemiCondensedMedium,
  barlowSemiCondensedSemiBold,
} from '@/config/fonts/barlow';
import {FontMapping, FontVariableMapping} from '@/config/fonts/types';
import {SUPPORTED_LOCALES, SupportedLocale} from '@/config/locales';

/**
 * A priority order list of fonts to render
 *
 * 1. Figtree
 * 2. Noto Sans (if Figtree does not support the glyph)
 * 3. Noto Sans Math
 * 4. Barlow Semi Condensed (used in headings)
 */
export const DEFAULT_FONTS = [
  figtree,
  notoSans,
  notoSansMath,
  barlowSemiCondensedMedium,
  barlowSemiCondensedSemiBold,
];

/**
 * A map of locale to the fonts to use for that locale.
 * If a locale requires one or more special noto fonts to render its glyphs, add those
 */
export const FONTS_BY_LOCALE: FontMapping = SUPPORTED_LOCALES.reduce(
  (accumulator: FontMapping, locale: SupportedLocale) => {
    accumulator[locale] = [...DEFAULT_FONTS, ...getNotoFallbackFonts(locale)];
    return accumulator;
  },
  Object.create({}),
);

/**
 * A map of locale to the font variables to use for that locale
 */
export const FONT_VARIABLES_BY_LOCALE: FontVariableMapping = Object.entries(
  FONTS_BY_LOCALE,
).reduce((accumulator: FontVariableMapping, [locale, fonts]) => {
  accumulator[locale] = fonts.map(font => font.variable);
  return accumulator;
}, Object.create({}));
