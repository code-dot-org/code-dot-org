import HttpClient from '@cdo/apps/util/HttpClient';

// Builds the `fontEmbedCSS` we hand to html-to-image when exporting an element.
// By default, html-to-image inlines every font it finds on the page as base64,
// which can get very large.
// Instead we inline only the faces the element actually draws with, including
// icon fonts drawn in ::before and ::after. A stylesheet from another origin
// cannot be read in place, so we fetch its text, which works when its server
// sends CORS headers. Any other fonts will fall back to OS fonts.
//
// For each piece of text we embed the first family in its font stack that is readable
// at the weight and style in use. If there are characters in the text
// that are not covered by the first family (such as from a different language),
// the browser will fall back to a system font.

const DEFAULT_FONT_WEIGHT = 400;
const WEIGHT_KEYWORDS = new Map([
  ['normal', 400],
  ['bold', 700],
]);
const PSEUDO_ELEMENTS = ['::before', '::after'];
const NO_CONTENT = ['', 'none', 'normal'];

const FONT_SRC_DESCRIPTOR_PATTERN = /src\s*:\s*[^;}]+/;
// One entry of a `src` list: the url, plus the format() that usually follows.
const FONT_SOURCE_PATTERN = /url\((["']?)([^"')]+)\1\)(\s*format\([^)]*\))?/;

interface SheetRules {
  rules: CSSRule[];
  // Relative font urls resolve against the sheet's own address.
  baseHref: string;
}

// A readable @font-face, with the parts we match on pulled out once.
interface FontFaceCandidate {
  rule: CSSFontFaceRule;
  baseHref: string;
  style: string;
  weights: {low: number; high: number};
}

const fontFileCache = new Map<string, Promise<string>>();
const fetchedSheetCache = new Map<string, Promise<SheetRules | undefined>>();

const unquote = (value: string) => value.trim().replace(/^["']|["']$/g, '');

const toWeightNumber = (token: string): number =>
  WEIGHT_KEYWORDS.get(token) ?? Number(token);

// The weights the rule's font file provides. The declaration is one weight
// ("500"), a variable range ("100 900"), or absent, meaning normal.
const parseWeightRange = (
  rule: CSSFontFaceRule
): FontFaceCandidate['weights'] | undefined => {
  const declared =
    rule.style.getPropertyValue('font-weight').trim() || 'normal';
  const bounds = declared.split(/\s+/).map(toWeightNumber);
  if (bounds.some(Number.isNaN)) {
    return undefined;
  }
  const [low, high = low] = bounds;
  return {low, high};
};

const normalizeStyle = (declared: string): string => {
  const keyword = declared.trim().split(/\s+/)[0] || 'normal';
  return keyword === 'oblique' ? 'italic' : keyword;
};

const hasOwnText = (element: Element): boolean =>
  Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
  );

// The computed styles that draw text on this element: its own text, and the
// glyph an icon font draws in a pseudo-element.
const textStyles = (element: Element): CSSStyleDeclaration[] => {
  const pseudoStyles = PSEUDO_ELEMENTS.map(pseudo =>
    window.getComputedStyle(element, pseudo)
  ).filter(style => !NO_CONTENT.includes(style.content));
  return hasOwnText(element)
    ? [window.getComputedStyle(element), ...pseudoStyles]
    : pseudoStyles;
};

// A media query that never matches keeps the fetched sheet from styling the
// page while we read it.
const parseRules = (css: string): CSSRule[] => {
  const style = document.createElement('style');
  style.media = 'not all';
  style.textContent = css;
  document.head.appendChild(style);
  const rules = Array.from(style.sheet?.cssRules ?? []);
  style.remove();
  return rules;
};

// A sheet served without CORS headers refuses every time, so a failure is
// cached too: retrying would only log the same console error on each export.
const fetchSheetRules = (href: string): Promise<SheetRules | undefined> => {
  const cached = fetchedSheetCache.get(href);
  if (cached) {
    return cached;
  }
  const pending = HttpClient.get(href)
    .then(response => response.text())
    .then(css => ({rules: parseRules(css), baseHref: href}))
    .catch(() => undefined);
  fetchedSheetCache.set(href, pending);
  return pending;
};

// Reading a stylesheet from another origin throws unless the page loaded it
// in CORS mode.
const readSheetRules = (
  sheet: CSSStyleSheet
): Promise<SheetRules | undefined> => {
  try {
    return Promise.resolve({
      rules: Array.from(sheet.cssRules),
      baseHref: sheet.href || document.baseURI,
    });
  } catch {
    return sheet.href
      ? fetchSheetRules(sheet.href)
      : Promise.resolve(undefined);
  }
};

// Readable @font-face rules, grouped by the family they declare.
const readCandidatesByFamily = async (): Promise<
  Map<string, FontFaceCandidate[]>
> => {
  const sheets = await Promise.all(
    Array.from(document.styleSheets, readSheetRules)
  );
  const byFamily = new Map<string, FontFaceCandidate[]>();
  sheets.forEach(sheet => {
    sheet?.rules.forEach(rule => {
      if (!(rule instanceof CSSFontFaceRule)) {
        return;
      }
      const weights = parseWeightRange(rule);
      if (!weights) {
        return;
      }
      const family = unquote(
        rule.style.getPropertyValue('font-family')
      ).toLowerCase();
      const candidates = byFamily.get(family) ?? [];
      candidates.push({
        rule,
        baseHref: sheet.baseHref,
        style: normalizeStyle(rule.style.getPropertyValue('font-style')),
        weights,
      });
      byFamily.set(family, candidates);
    });
  });
  return byFamily;
};

const collectUsedFaces = (
  root: HTMLElement,
  byFamily: Map<string, FontFaceCandidate[]>
): FontFaceCandidate[] => {
  const used = new Set<FontFaceCandidate>();
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  elements.flatMap(textStyles).forEach(computed => {
    const weight = Number(computed.fontWeight) || DEFAULT_FONT_WEIGHT;
    const style = normalizeStyle(computed.fontStyle);
    const stack = computed.fontFamily
      .split(',')
      .map(family => unquote(family).toLowerCase());

    for (const family of stack) {
      // Every match, not just the first: a family split into unicode-range
      // subsets has one face per subset, and we cannot tell which the text needs.
      const matches = (byFamily.get(family) ?? []).filter(
        candidate =>
          candidate.style === style &&
          weight >= candidate.weights.low &&
          weight <= candidate.weights.high
      );
      if (matches.length > 0) {
        matches.forEach(match => used.add(match));
        return;
      }
    }
  });
  return Array.from(used);
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const fetchFontAsDataUrl = (url: string): Promise<string> => {
  const cached = fontFileCache.get(url);
  if (cached) {
    return cached;
  }
  const pending = HttpClient.get(url)
    .then(response => response.blob())
    .then(blobToDataUrl);
  // Cache the download across exports, but not a failure.
  fontFileCache.set(url, pending);
  pending.catch(() => fontFileCache.delete(url));
  return pending;
};

// A face usually lists two files, woff2 and a woff fallback. We inline the
// first and drop the rest: a second copy of the same face is wasted bytes, and
// left alone its url would point at a server the exported image cannot reach.
const inlineFontFace = async ({
  rule,
  baseHref,
}: FontFaceCandidate): Promise<string | undefined> => {
  const descriptor = FONT_SRC_DESCRIPTOR_PATTERN.exec(rule.cssText);
  const source = descriptor && FONT_SOURCE_PATTERN.exec(descriptor[0]);
  if (!source) {
    return undefined;
  }
  const [, , path, format = ''] = source;
  const dataUrl = await fetchFontAsDataUrl(new URL(path, baseHref).href);
  return rule.cssText.replace(
    descriptor[0],
    () => `src: url(${dataUrl})${format}`
  );
};

// Resolves to CSS declaring the element's web font faces with their files
// inlined, or to an empty string when there is nothing to embed -- which tells
// html-to-image to skip its own font handling entirely.
export const getFontEmbedCss = async (root: HTMLElement): Promise<string> => {
  const byFamily = await readCandidatesByFamily();
  if (byFamily.size === 0) {
    return '';
  }
  const usedFaces = collectUsedFaces(root, byFamily);
  const inlined = await Promise.all(
    usedFaces.map(face => inlineFontFace(face).catch(() => undefined))
  );
  return inlined.filter(Boolean).join('\n');
};
