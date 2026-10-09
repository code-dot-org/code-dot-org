import HttpClient from '@cdo/apps/util/HttpClient';

// Builds the `fontEmbedCSS` we hand to html-to-image when exporting a sketch.
// By default, html-to-image inlines every font it finds on the page as base64,
// which can get very large.
// Instead we inline only the faces the sketch actually draws with, from
// stylesheets we are allowed to read. Any other fonts will fall back to OS fonts.
//
// For each piece of text we embed the first family in its font stack that has a
// readable face at the weight and style in use. Later families are fallbacks for
// glyphs the first one lacks.

const DEFAULT_FONT_WEIGHT = 400;
const WEIGHT_KEYWORDS = new Map([
  ['normal', 400],
  ['bold', 700],
]);

const FONT_SRC_DESCRIPTOR_PATTERN = /src\s*:\s*[^;}]+/;
// One entry of a `src` list: the url, plus the format() that usually follows.
const FONT_SOURCE_PATTERN = /url\((["']?)([^"')]+)\1\)(\s*format\([^)]*\))?/;

// A readable @font-face, with the parts we match on pulled out once.
interface FontFaceCandidate {
  rule: CSSFontFaceRule;
  style: string;
  weights: {low: number; high: number};
}

const fontFileCache = new Map<string, Promise<string>>();

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

// Readable @font-face rules, grouped by the family they declare. A cross-origin
// stylesheet throws when read; its fonts stay unembedded.
const readCandidatesByFamily = (): Map<string, FontFaceCandidate[]> => {
  const byFamily = new Map<string, FontFaceCandidate[]>();
  Array.from(document.styleSheets).forEach(sheet => {
    let sheetRules: CSSRule[];
    try {
      sheetRules = Array.from(sheet.cssRules);
    } catch {
      return;
    }
    sheetRules.forEach(rule => {
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
        style: normalizeStyle(rule.style.getPropertyValue('font-style')),
        weights,
      });
      byFamily.set(family, candidates);
    });
  });
  return byFamily;
};

const collectUsedRules = (
  root: HTMLElement,
  byFamily: Map<string, FontFaceCandidate[]>
): CSSFontFaceRule[] => {
  const used = new Set<CSSFontFaceRule>();
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  elements.forEach(element => {
    if (!hasOwnText(element)) {
      return;
    }
    const computed = window.getComputedStyle(element);
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
        matches.forEach(match => used.add(match.rule));
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
const inlineFontFaceRule = async (
  rule: CSSFontFaceRule
): Promise<string | undefined> => {
  const descriptor = FONT_SRC_DESCRIPTOR_PATTERN.exec(rule.cssText);
  const source = descriptor && FONT_SOURCE_PATTERN.exec(descriptor[0]);
  if (!source) {
    return undefined;
  }
  const [, , path, format = ''] = source;
  const base = rule.parentStyleSheet?.href || document.baseURI;
  const dataUrl = await fetchFontAsDataUrl(new URL(path, base).href);
  return rule.cssText.replace(
    descriptor[0],
    () => `src: url(${dataUrl})${format}`
  );
};

// Resolves to CSS declaring the sketch's web font faces with their files
// inlined, or to an empty string when there is nothing to embed -- which tells
// html-to-image to skip its own font handling entirely.
export const getSketchFontEmbedCss = async (
  root: HTMLElement
): Promise<string> => {
  const byFamily = readCandidatesByFamily();
  if (byFamily.size === 0) {
    return '';
  }
  const usedRules = collectUsedRules(root, byFamily);
  const inlined = await Promise.all(
    usedRules.map(rule => inlineFontFaceRule(rule).catch(() => undefined))
  );
  return inlined.filter(Boolean).join('\n');
};
