import {
  FALLBACK_FONT_FAMILIES_BY_LOCALE,
  InternationalFontLocale,
} from '@/constants';

export function getFontByLocale(locale: InternationalFontLocale) {
  switch (locale) {
    case 'ar-SA':
      return import('@code-dot-org/fonts/locales/ar-SA/index.module.css');
    case 'fa-AF':
      return import('@code-dot-org/fonts/locales/fa-AF/index.module.css');
    case 'fa-IR':
      return import('@code-dot-org/fonts/locales/fa-IR/index.module.css');
    case 'ps-AF':
      return import('@code-dot-org/fonts/locales/ps-AF/index.module.css');
    case 'ur-PK':
      return import('@code-dot-org/fonts/locales/ur-PK/index.module.css');
    case 'bn-BD':
      return import('@code-dot-org/fonts/locales/bn-BD/index.module.css');
    case 'dv-MV':
      return import('@code-dot-org/fonts/locales/dv-MV/index.module.css');
    case 'he-IL':
      return import('@code-dot-org/fonts/locales/he-IL/index.module.css');
    case 'hi-IN':
      return import('@code-dot-org/fonts/locales/hi-IN/index.module.css');
    case 'mr-IN':
      return import('@code-dot-org/fonts/locales/mr-IN/index.module.css');
    case 'ne-NP':
      return import('@code-dot-org/fonts/locales/ne-NP/index.module.css');
    case 'hy-AM':
      return import('@code-dot-org/fonts/locales/hy-AM/index.module.css');
    case 'ja-JP':
      return import('@code-dot-org/fonts/locales/ja-JP/index.module.css');
    case 'ka-GE':
      return import('@code-dot-org/fonts/locales/ka-GE/index.module.css');
    case 'kn-IN':
      return import('@code-dot-org/fonts/locales/kn-IN/index.module.css');
    case 'km-KH':
      return import('@code-dot-org/fonts/locales/km-KH/index.module.css');
    case 'ko-KR':
      return import('@code-dot-org/fonts/locales/ko-KR/index.module.css');
    case 'my-MM':
      return import('@code-dot-org/fonts/locales/my-MM/index.module.css');
    case 'si-LK':
      return import('@code-dot-org/fonts/locales/si-LK/index.module.css');
    case 'ta-IN':
      return import('@code-dot-org/fonts/locales/ta-IN/index.module.css');
    case 'te-IN':
      return import('@code-dot-org/fonts/locales/te-IN/index.module.css');
    case 'th-TH':
      return import('@code-dot-org/fonts/locales/th-TH/index.module.css');
    case 'zh-CN':
      return import('@code-dot-org/fonts/locales/zh-CN/index.module.css');
    case 'zh-TW':
      return import('@code-dot-org/fonts/locales/zh-TW/index.module.css');
    default:
      // Return false if there are no fallback locales
      return Promise.resolve(false);
  }
}

export function getFallbackFontFamilyByLocale(
  locale: InternationalFontLocale,
): string[] {
  console.log('locale: ', locale);
  return FALLBACK_FONT_FAMILIES_BY_LOCALE[locale] ?? [];
}
