import {InternationalFontLocale} from '@/constants';
import {getFontByLocale} from '@/resolver';

/**
 * Injects an empty div with the CSS module className that references the web font appropriate for the given locale.
 * @param locale
 */
export function injectFont(locale: InternationalFontLocale) {
  getFontByLocale(locale).then(fontClassName => {
    const fontMount = document.createElement('div');
    fontMount.className = fontClassName;
    document.head.appendChild(fontMount);
  });
}

export function injectFontAwesome() {
  const stylesheets = [
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/fontawesome.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/brands.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/solid.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/regular.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/v4-font-face.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/v4-shims.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/duotone.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1762452190/css/custom-icons.min.css',
  ];

  stylesheets.forEach(stylesheetHref => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetHref;
    document.head.appendChild(link);
  });
}
