export const FONT_FAMILY_NAMES = [
  'Figtree', // Primary Font
  'Noto Sans', // Fallback
  'Barlow Semi Condensed Semibold', // For headings, low priority
  'Barlow Semi Condensed Medium', // For headings, low priority
  '"FontAwesome"', // Icons, low priority
  '"Font Awesome 6 Brands"', // Icons, low priority
  '"Font Awesome 6 Duotone"', // Icons, low priority
  '"Font Awesome 6 Kit"', // Custom Icons, low priority
  '"Font Awesome 6 Pro"', // Icons, low priority
];

export const LOCALES_WITH_INTERNATIONAL_FONTS = [
  'ar-SA',
  'fa-AF',
  'fa-IR',
  'ps-AF',
  'ur-PK',
  'bn-BD',
  'dv-MV',
  'he-IL',
  'hi-IN',
  'mr-IN',
  'ne-NP',
  'hy-AM',
  'ja-JP',
  'ka-GE',
  'kn-IN',
  'km-KH',
  'ko-KR',
  'my-MM',
  'si-LK',
  'ta-IN',
  'te-IN',
  'th-TH',
  'zh-CN',
  'zh-TW',
];

export type InternationalFontLocale =
  (typeof LOCALES_WITH_INTERNATIONAL_FONTS)[number];

export const FALLBACK_FONT_FAMILIES_BY_LOCALE: {
  [locale in InternationalFontLocale]: string[];
} = {
  'ar-SA': ['Noto Sans Arabic'],
  'fa-AF': ['Noto Sans Arabic'],
  'fa-IR': ['Noto Sans Arabic'],
  'ps-AF': ['Noto Sans Arabic'],
  'ur-PK': ['Noto Sans Arabic'],
  'bn-BD': ['Noto Sans Bengali'],
  'dv-MV': ['Noto Sans Thaana'],
  'he-IL': ['Noto Sans Hebrew'],
  'hi-IN': ['Noto Sans Devanagari'],
  'mr-IN': ['Noto Sans Devanagari'],
  'ne-NP': ['Noto Sans Devanagari'],
  'hy-AM': ['Noto Sans Armenian'],
  'ja-JP': ['Noto Sans JP'],
  'ka-GE': ['Noto Sans Georgian'],
  'kn-IN': ['Noto Sans Kannada'],
  'km-KH': ['Noto Sans Khmer'],
  'ko-KR': ['Noto Sans KR'],
  'my-MM': ['Noto Sans Myanmar'],
  'si-LK': ['Noto Sans Sinhala'],
  'ta-IN': ['Noto Sans Tamil'],
  'te-IN': ['Noto Sans Telugu'],
  'th-TH': ['Noto Sans Thai'],
  'zh-CN': ['Noto Sans SC'],
  'zh-TW': ['Noto Sans TC'],
};

/**
 * Uses the document.fonts API to load fonts via the defined font face.
 * Promise resolves when all Code.org fonts are resolved and the DOM is noted as ready.
 */
export function loadFonts(fonts = FONT_FAMILY_NAMES) {
  const fontsToLoad = fonts.map(font => `1rem ${font}`);

  return Promise.all([
    // Load individual fonts
    ...fontsToLoad.map(font => document.fonts.load(font)),
    document.fonts.ready,
  ]);
}
