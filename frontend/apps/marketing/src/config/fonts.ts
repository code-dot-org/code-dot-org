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
export const FONT_VARIABLES = DEFAULT_FONTS.map(font => font.variable);