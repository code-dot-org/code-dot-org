import {
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Armenian,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Georgian,
  Noto_Sans_Hebrew,
  Noto_Sans_JP,
  Noto_Sans_Kannada,
  Noto_Sans_Khmer,
  Noto_Sans_KR,
  Noto_Sans_Math,
  Noto_Sans_Myanmar,
  Noto_Sans_SC,
  Noto_Sans_Sinhala,
  Noto_Sans_Tamil,
  Noto_Sans_TC,
  Noto_Sans_Telugu,
  Noto_Sans_Thaana,
  Noto_Sans_Thai,
} from 'next/font/google';
import {SupportedLocale} from '@/config/locales';

/**
 * Noto is the fallback font for Code.org for glyphs not supported by Figtree.
 */
export const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  display: 'swap',
  subsets: [
    'latin',
    'cyrillic',
    'latin-ext',
    'greek-ext',
    'greek',
    'vietnamese',
    'devanagari',
    'cyrillic-ext',
  ],
});

/**
 * For mathematical symbols
 */
export const notoSansMath = Noto_Sans_Math({
  variable: '--font-noto-sans-math',
  subsets: ['math'],
  weight: '400',
  display: 'swap',
});

/**
 * Custom fonts for different locales
 */
export const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-noto-fallback',
  subsets: ['arabic'],
  display: 'swap',
});
export const notoSansBengali = Noto_Sans_Bengali({
  variable: '--font-noto-fallback',
  subsets: ['bengali', 'latin', 'latin-ext'],
  display: 'swap',
});
export const notoSansThaana = Noto_Sans_Thaana({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'thaana'],
  display: 'swap',
});
export const notoSansHebrew = Noto_Sans_Hebrew({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'hebrew', 'latin-ext'],
  display: 'swap',
});
export const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-fallback',
  subsets: ['devanagari', 'latin', 'latin-ext'],
  display: 'swap',
});
export const notoSansArmenian = Noto_Sans_Armenian({
  variable: '--font-noto-fallback',
  subsets: ['armenian', 'latin', 'latin-ext'],
  display: 'swap',
});
export const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  display: 'swap',
});
export const notoSansGeorgian = Noto_Sans_Georgian({
  variable: '--font-noto-fallback',
  subsets: ['georgian', 'latin', 'latin-ext', 'greek-ext'],
  display: 'swap',
});
export const notoSansKannada = Noto_Sans_Kannada({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'kannada'],
  display: 'swap',
});
export const notoSansKhmer = Noto_Sans_Khmer({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'khmer'],
  display: 'swap',
});
export const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  display: 'swap',
});
export const notoSansMyanmar = Noto_Sans_Myanmar({
  variable: '--font-noto-fallback',
  display: 'swap',
  weight: '400',
  subsets: ['myanmar'],
});
export const notoSansSinhala = Noto_Sans_Sinhala({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'sinhala'],
  display: 'swap',
});
export const notoSansTamil = Noto_Sans_Tamil({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'tamil'],
  display: 'swap',
});
export const notoSansTelugu = Noto_Sans_Telugu({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'telugu'],
  display: 'swap',
});
export const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'thai'],
  display: 'swap',
});
export const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-fallback',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  display: 'swap',
});
export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
  variable: '--font-noto-fallback',
  display: 'swap',
});

/**
 * Returns the special noto fonts to use for the specified locale.
 * @param locale ISO Locale string
 */
export function getNotoFallbackFonts(locale: SupportedLocale) {
  switch (locale) {
    case 'ar-SA':
    case 'fa-AF':
    case 'fa-IR':
    case 'ps-AF':
    case 'ur-PK':
      return [notoSansArabic];
    case 'bn-BD':
      return [notoSansBengali];
    case 'dv-MV':
      return [notoSansThaana];
    case 'he-IL':
      return [notoSansHebrew];
    case 'hi-IN':
    case 'mr-IN':
    case 'ne-NP':
      return [notoSansDevanagari];
    case 'hy-AM':
      return [notoSansArmenian];
    case 'ja-JP':
      return [notoSansJP];
    case 'ka-GE':
      return [notoSansGeorgian];
    case 'kn-IN':
      return [notoSansKannada];
    case 'km-KH':
      return [notoSansKhmer];
    case 'ko-KR':
      return [notoSansKR];
    case 'my-MM':
      return [notoSansMyanmar];
    case 'si-LK':
      return [notoSansSinhala];
    case 'ta-IN':
      return [notoSansTamil];
    case 'te-IN':
      return [notoSansTelugu];
    case 'th-TH':
      return [notoSansThai];
    case 'zh-CN':
      return [notoSansSC];
    case 'zh-TW':
      return [notoSansTC];
    default: {
      return [];
    }
  }
}
