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

const FONT_AWESOME_STYLESHEETS = [
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/fontawesome.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/brands.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/solid.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/regular.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/v4-font-face.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/v4-shims.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/duotone.min.css',
  'https://dsco.code.org/assets/font-awesome-pro/1779470619/css/custom-icons.min.css',
];

/**
 * Injects FontAwesome's stylesheets. Returns a promise that resolves once they
 * are in the DOM (so callers can gate rendering on it).
 *
 * Pass `{layer}` to place FontAwesome in a named cascade layer. Consumers that
 * put MUI's emotion styles in a layer (StyledEngine `enableCssLayer`) need this:
 * otherwise FA's *unlayered* base rules (e.g. icon `line-height: 1`) beat every
 * layered MUI styleOverride, shrinking icon line-boxes.
 *
 * We fetch each sheet and inline its rules inside a single `@layer <name> { … }`
 * block rather than using `@import url(…) layer(…)`. Applitools' Ultrafast Grid
 * DOM snapshot inlines an external `@import`'s content but drops the `layer()`,
 * so the cross-origin `@import` form silently renders unlayered there. An inline
 * `@layer` block is captured verbatim. FA's font URLs are absolute, so the
 * inlined rules need no rewriting.
 */
export function injectFontAwesome(
  options: {layer?: string} = {},
): Promise<void> {
  const {layer} = options;

  if (layer) {
    return Promise.all(
      FONT_AWESOME_STYLESHEETS.map(href =>
        fetch(href).then(response => response.text()),
      ),
    ).then(cssTexts => {
      const style = document.createElement('style');
      style.textContent = `@layer ${layer} {\n${cssTexts.join('\n')}\n}`;
      document.head.appendChild(style);
    });
  }

  FONT_AWESOME_STYLESHEETS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
  return Promise.resolve();
}
