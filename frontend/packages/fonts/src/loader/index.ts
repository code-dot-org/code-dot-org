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

/**
 * Injects FontAwesome's stylesheets.
 *
 * Pass `{layer}` to import them into a named cascade layer instead of as plain
 * `<link>`s. Consumers that put MUI's emotion styles in a layer (StyledEngine
 * `enableCssLayer`) need this: otherwise FontAwesome's *unlayered* base rules
 * (e.g. icon `line-height: 1`) beat every layered MUI styleOverride, shrinking
 * icon line-boxes. Importing FA into a layer below `mui` restores that order.
 */
export function injectFontAwesome(options: {layer?: string} = {}) {
  const stylesheets = [
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/fontawesome.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/brands.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/solid.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/regular.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/v4-font-face.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/v4-shims.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/duotone.min.css',
    'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/custom-icons.min.css',
  ];

  if (options.layer) {
    const style = document.createElement('style');
    style.textContent = stylesheets
      .map(href => `@import url("${href}") layer(${options.layer});`)
      .join('\n');
    document.head.appendChild(style);
    return;
  }

  stylesheets.forEach(stylesheetHref => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetHref;
    document.head.appendChild(link);
  });
}
