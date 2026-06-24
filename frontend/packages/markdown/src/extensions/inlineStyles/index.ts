import type {Nodes, Root} from 'hast';

import type {MarkdownExtension} from '../../extension';

/*
 * Presentational CSS properties an author may set inline. Deliberately omits
 * every property that lets an element escape its place in the text:
 *
 *   - positioning / stacking (position, top/right/bottom/left, z-index) — the
 *     levers for a full-viewport clickjacking overlay;
 *   - transform / clip / filter / opacity / visibility — hiding or relocating
 *     content for spoofing;
 *   - anything that fetches a resource (the `background` shorthand and
 *     background-image, list-style-image, border-image, mask, cursor) — the
 *     lever for CSS-based tracking and data exfiltration.
 *
 * What remains only affects the element's own typography and box. The sanitizer
 * does not parse style contents, so this allowlist (applied by the plugin
 * below, before sanitization) is what actually constrains the value.
 */
const ALLOWED_PROPERTIES = new Set([
  // typography
  'color',
  'font',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-align',
  'text-decoration',
  'text-indent',
  'text-transform',
  'text-shadow',
  'white-space',
  'word-break',
  'overflow-wrap',
  'word-wrap',
  'direction',
  'vertical-align',
  // box model
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-collapse',
  'border-spacing',
  'box-sizing',
  'background-color',
  // block layout (harmless without positioning)
  'display',
  'overflow',
  'float',
  'clear',
  'list-style-type',
  'list-style-position',
]);

/*
 * A declaration value is rejected outright if it can reach out of the inline
 * style: `url(...)` and `image-set(...)`/`element(...)` fetch or reference other
 * content; `expression(...)` is legacy IE scripting; a backslash enables hex
 * escapes that reconstruct any of the above (`\75 rl(` is `url(`); a CSS comment
 * sequence hides tokens from a naive reader. None of the allowed properties
 * legitimately need these, so a blanket reject is safe and defends against a
 * property slipping in that happens to take a url.
 */
const UNSAFE_VALUE = /url\(|image-set\(|element\(|expression\(|\/\*|\*\/|\\/i;

// Split a style string into declarations on top-level `;`, respecting quotes
// and parentheses so a `;` inside a value cannot end a declaration early.
const splitDeclarations = (style: string): string[] => {
  const declarations: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';
  for (const ch of style) {
    if (quote) {
      current += ch;
      if (ch === quote) {
        quote = null;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === '(') {
      depth += 1;
      current += ch;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (ch === ';' && depth === 0) {
      declarations.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  declarations.push(current);
  return declarations;
};

// Drop every declaration whose property is not allowlisted or whose value is
// unsafe; return the rebuilt style string (empty if nothing survived).
const filterStyle = (style: string): string =>
  splitDeclarations(style)
    .map(declaration => {
      const colon = declaration.indexOf(':');
      if (colon === -1) {
        return null;
      }
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      if (!property || !value) {
        return null;
      }
      if (!ALLOWED_PROPERTIES.has(property) || UNSAFE_VALUE.test(value)) {
        return null;
      }
      return `${property}:${value}`;
    })
    .filter((declaration): declaration is string => declaration !== null)
    .join(';');

/*
 * Walk the tree and rewrite every element's `style` to its allowlisted subset,
 * removing the attribute when nothing safe remains. Runs before sanitization,
 * so the value the sanitizer waves through is already constrained.
 */
const filterInlineStyles = () => (tree: Root) => {
  const walk = (node: Nodes): void => {
    if (node.type === 'element' && typeof node.properties?.style === 'string') {
      const filtered = filterStyle(node.properties.style);
      if (filtered) {
        node.properties.style = filtered;
      } else {
        delete node.properties.style;
      }
    }
    if ('children' in node) {
      node.children.forEach(child => walk(child));
    }
  };
  walk(tree);
};

/**
 * Permits a constrained subset of inline `style`, plus `className`, on every
 * element.
 *
 * Ported from legacy SafeMarkdown, which allowed arbitrary inline CSS. Arbitrary
 * `style` is an injection sink — positioning yields clickjacking overlays, a
 * `url()` value yields tracking/exfiltration — so this restricts `style` to the
 * presentational `ALLOWED_PROPERTIES` (see above) via a pre-sanitization plugin.
 *
 * CAVEAT: `className` is still unrestricted, so an author can apply any class the
 * host's stylesheet defines; prefer semantic markup and enable this only where
 * existing curriculum depends on it.
 */
export const inlineStyles: MarkdownExtension = {
  name: 'inlineStyles',
  rehypePlugins: [filterInlineStyles],
  sanitizeSchema: {attributes: {'*': ['style', 'className']}},
};
