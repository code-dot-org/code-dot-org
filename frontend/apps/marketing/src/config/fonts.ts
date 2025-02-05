import { Figtree, Noto_Sans, Barlow_Semi_Condensed, Noto_Sans_Math, Noto_Sans_Arabic, Noto_Sans_Bengali, Noto_Sans_Thaana, Noto_Sans_Hebrew, Noto_Sans_Devanagari, Noto_Sans_Armenian, Noto_Sans_JP, Noto_Sans_Georgian, Noto_Sans_Kannada, Noto_Sans_Khmer, Noto_Sans_KR, Noto_Sans_Myanmar, Noto_Sans_Sinhala, Noto_Sans_Tamil, Noto_Sans_Telugu, Noto_Sans_TC, Noto_Sans_SC } from 'next/font/google'
import { SupportedLocale } from './locales';
import { CssVariable, Display, NextFont } from 'next/dist/compiled/@next/font';

// Figtree is the main font
const figtree = Figtree({
    variable: '--font-figtree',
    display: 'block',
    fallback: ['Noto Sans', 'Noto Sans Math']
  });
  
  // Noto Sans is the fallback font
  const notoSans = Noto_Sans({
    variable: '--font-noto-sans',
    display: 'swap'
  });
  
  const notoSansMath = Noto_Sans_Math({
    variable: '--font-noto-sans-math',
    weight: "400",
    display: 'swap'
  });
  
  const barlowSemiCondensedMedium = Barlow_Semi_Condensed({
    variable: '--barlow-semi-condensed-medium',
    weight: "500",
    display: 'swap'
  });
  
  const barlowSemiCondensedSemiBold = Barlow_Semi_Condensed({
    variable: '--barlow-semi-condensed-semi-bold',
    weight: "600",
    display: 'swap'
  });

  const notoSansFallbackOptions: {variable: CssVariable, display: Display} = {
    variable: '--font-noto-sans-fallback',  
    display: 'swap'
  };
  
export const DEFAULT_FONTS = [figtree, notoSans, notoSansMath, barlowSemiCondensedMedium, barlowSemiCondensedSemiBold];
export const FONT_VARIABLES = FONTS.map(font => font.variable);

export const FONTS: { [locale in SupportedLocale]: NextFont[]} = {
    'ar-SA': [...DEFAULT_FONTS, Noto_Sans_Arabic(notoSansFallbackOptions)],
    'az-AZ': DEFAULT_FONTS,
    'bg-BG': DEFAULT_FONTS,
    'bn-BD': [...DEFAULT_FONTS, Noto_Sans_Bengali(notoSansFallbackOptions)],
    'bs-BA': DEFAULT_FONTS,
    'ca-ES': DEFAULT_FONTS,
    'co-CO': DEFAULT_FONTS,
    'cs-CZ': DEFAULT_FONTS,
    'da-DK': DEFAULT_FONTS,
    'de-DE': DEFAULT_FONTS,
    'dv-MV': [...DEFAULT_FONTS, Noto_Sans_Thaana(notoSansFallbackOptions)],
    'el-GR': DEFAULT_FONTS,
    'en-GB': DEFAULT_FONTS,
    'en-US': DEFAULT_FONTS,
    'es-ES': DEFAULT_FONTS,
    'es-MX': DEFAULT_FONTS,
    'et-EE': DEFAULT_FONTS,
    'eu-ES': DEFAULT_FONTS,
    'fa-AF': [...DEFAULT_FONTS, Noto_Sans_Arabic(notoSansFallbackOptions)],
    'fa-IR': [...DEFAULT_FONTS, Noto_Sans_Arabic(notoSansFallbackOptions)],
    'fi-FI': DEFAULT_FONTS,
    'fil-PH': DEFAULT_FONTS,
    'fr-FR': DEFAULT_FONTS,
    'ga-IE': DEFAULT_FONTS,
    'gl-ES': DEFAULT_FONTS,
    'haw-HI': DEFAULT_FONTS,
    'he-IL': [...DEFAULT_FONTS, Noto_Sans_Hebrew(notoSansFallbackOptions)],
    'hi-IN': [...DEFAULT_FONTS, Noto_Sans_Devanagari(notoSansFallbackOptions)],
    'hr-HR': DEFAULT_FONTS,
    'hu-HU': DEFAULT_FONTS,
    'hy-AM': [...DEFAULT_FONTS, Noto_Sans_Armenian(notoSansFallbackOptions)],
    'id-ID': DEFAULT_FONTS,
    'in-TL': DEFAULT_FONTS,
    'is-IS': DEFAULT_FONTS,
    'it-IT': DEFAULT_FONTS,
    'ja-JP': [...DEFAULT_FONTS, Noto_Sans_JP(notoSansFallbackOptions)],
    'ka-GE': [...DEFAULT_FONTS, Noto_Sans_Georgian(notoSansFallbackOptions)],
    'kk-KZ': DEFAULT_FONTS,
    'kn-IN': [...DEFAULT_FONTS, Noto_Sans_Kannada(notoSansFallbackOptions)],
    'km-KH': [...DEFAULT_FONTS, Noto_Sans_Khmer(notoSansFallbackOptions)],
    'ko-KR': [...DEFAULT_FONTS, Noto_Sans_KR(notoSansFallbackOptions)],
    'ku-IQ': DEFAULT_FONTS,
    'ky-KG': DEFAULT_FONTS,
    'lt-LT': DEFAULT_FONTS,
    'lv-LV': DEFAULT_FONTS,
    'mi-NZ': DEFAULT_FONTS,
    'mk-MK': DEFAULT_FONTS,
    'mn-MN': DEFAULT_FONTS,
    'mr-IN': [...DEFAULT_FONTS, Noto_Sans_Devanagari(notoSansFallbackOptions)],
    'ms-MY': DEFAULT_FONTS,
    'mt-MT': DEFAULT_FONTS,
    'my-MM': [...DEFAULT_FONTS, Noto_Sans_Myanmar({...notoSansFallbackOptions, weight: "400"})],
    'ne-NP': [...DEFAULT_FONTS, Noto_Sans_Devanagari(notoSansFallbackOptions)],
    'nl-NL': DEFAULT_FONTS,
    'nn-NO': DEFAULT_FONTS,
    'no-NO': DEFAULT_FONTS,
    'pl-PL': DEFAULT_FONTS,
    'ps-AF': [...DEFAULT_FONTS, Noto_Sans_Arabic(notoSansFallbackOptions)],
    'pt-BR': DEFAULT_FONTS,
    'pt-PT': DEFAULT_FONTS,
    'ro-RO': DEFAULT_FONTS,
    'ru-RU': DEFAULT_FONTS,
    'se-FI': DEFAULT_FONTS,
    'sm-WS': DEFAULT_FONTS,
    'si-LK': [...DEFAULT_FONTS, Noto_Sans_Sinhala(notoSansFallbackOptions)],
    'sk-SK': DEFAULT_FONTS,
    'sl-SI': DEFAULT_FONTS,
    'sq-AL': DEFAULT_FONTS,
    'sr-SP': DEFAULT_FONTS,
    'sv-SE': DEFAULT_FONTS,
    'ta-IN': [...DEFAULT_FONTS, Noto_Sans_Tamil(notoSansFallbackOptions)],
    'te-IN': [...DEFAULT_FONTS, Noto_Sans_Telugu(notoSansFallbackOptions)], 
    'tg-TJ': DEFAULT_FONTS,
    'th-TH': [...DEFAULT_FONTS, Noto_Sans_Thaana(notoSansFallbackOptions)],
    'tr-TR': DEFAULT_FONTS,
    'uk-UA': DEFAULT_FONTS,
    'ur-PK': [...DEFAULT_FONTS, Noto_Sans_Arabic(notoSansFallbackOptions)],
    'uz-UZ': DEFAULT_FONTS,
    'vi-VN': DEFAULT_FONTS,
    'zh-CN': [...DEFAULT_FONTS, Noto_Sans_SC(notoSansFallbackOptions)], 
    'zh-TW': [...DEFAULT_FONTS, Noto_Sans_TC(notoSansFallbackOptions)],
    'zu-ZA': DEFAULT_FONTS
}

export function getFonts(locale: SupportedLocale) {
  switch (locale) {
    case 'en-US': {
      return FONTS
    }
  }
}