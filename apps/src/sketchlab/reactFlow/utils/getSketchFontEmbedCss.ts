// Builds the `fontEmbedCSS` we hand to html-to-image when exporting a sketch.
// By default, html-to-image inlines every font it finds on the page as base64,
// which can get very large.
// Instead we inline only the faces the sketch actually draws with, from
// stylesheets we are allowed to read. Any other fonts will fall back to OS fonts.
//
// Our bundled fonts are split into unicode-range subsets. We resolve each
// character the way the browser does: first family in the stack that declares
// a face covering it is embedded.

const DEFAULT_FONT_WEIGHT = 400;
const WEIGHT_KEYWORDS = new Map([
  ['normal', 400],
  ['bold', 700],
]);

const FONT_SRC_DESCRIPTOR_PATTERN = /src\s*:\s*[^;}]+/;
// One entry of a `src` list: the url, plus the format() that usually follows.
const FONT_SOURCE_PATTERN = /url\((["']?)([^"')]+)\1\)(\s*format\([^)]*\))?/;

// The three forms a unicode-range takes: "U+4??", "U+0100-02BA", "U+0131".
const UNICODE_RANGE_PATTERN = /^u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?$/;

// A code point is the number Unicode assigns a character: "A" is 65, "ש" is
// 1488. A @font-face names the ones its file covers as ranges of those numbers.
interface CodePointRange {
  low: number;
  high: number;
}

// A readable @font-face, with the parts we match on pulled out once. Absent
// `ranges` means the rule declared no unicode-range, so it covers everything.
interface FontFaceCandidate {
  rule: CSSFontFaceRule;
  style: string;
  ranges?: CodePointRange[];
}

const fontFileCache = new Map<string, Promise<string>>();

const unquote = (value: string) => value.trim().replace(/^["']|["']$/g, '');

const toWeightNumber = (token: string): number =>
  WEIGHT_KEYWORDS.get(token) ?? Number(token);

// Whether the rule's font file provides the weight in use. The declaration is
// one weight ("500"), a variable range ("100 900"), or absent, meaning normal.
const ruleSupportsWeight = (
  rule: CSSFontFaceRule,
  usedWeight: number
): boolean => {
  const declared =
    rule.style.getPropertyValue('font-weight').trim() || 'normal';
  const bounds = declared.split(/\s+/).map(toWeightNumber);
  if (bounds.some(Number.isNaN)) {
    return false;
  }
  const [low, high = low] = bounds;
  return usedWeight >= low && usedWeight <= high;
};

const normalizeStyle = (declared: string): string => {
  const keyword = declared.trim().split(/\s+/)[0] || 'normal';
  return keyword === 'oblique' ? 'italic' : keyword;
};

const ownText = (element: Element): string =>
  Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent)
    .join('');

const parseUnicodeRange = (declared: string): CodePointRange[] | undefined => {
  const ranges: CodePointRange[] = [];
  for (const token of declared.split(',')) {
    const match = UNICODE_RANGE_PATTERN.exec(token.trim().toLowerCase());
    if (!match) {
      return undefined;
    }
    const [, start, end] = match;
    ranges.push({
      low: parseInt(start.replace(/\?/g, '0'), 16),
      high: parseInt(end ?? start.replace(/\?/g, 'f'), 16),
    });
  }
  return ranges.length > 0 ? ranges : undefined;
};

const coversCodePoint = (
  candidate: FontFaceCandidate,
  codePoint: number
): boolean =>
  !candidate.ranges ||
  candidate.ranges.some(({low, high}) => codePoint >= low && codePoint <= high);

// Readable @font-face rules, grouped by the family they declare. A cross-origin
// stylesheet throws when read; its fonts stay unembedded.
const readCandidatesByFamily = (): Map<string, FontFaceCandidate[]> => {
  const byFamily = new Map<string, FontFaceCandidate[]>();
  Array.from(document.styleSheets).forEach(sheet => {
    let sheetRules: CSSRuleList | null = null;
    try {
      sheetRules = sheet.cssRules;
    } catch (error) {
      return;
    }
    Array.from(sheetRules || []).forEach(rule => {
      if (!(rule instanceof CSSFontFaceRule)) {
        return;
      }
      const declared = rule.style.getPropertyValue('unicode-range').trim();
      const family = unquote(
        rule.style.getPropertyValue('font-family')
      ).toLowerCase();
      const candidate: FontFaceCandidate = {
        rule,
        style: normalizeStyle(rule.style.getPropertyValue('font-style')),
        // A rule we cannot parse is treated as covering everything: embedding
        // a file we do not need beats dropping one we do.
        ranges: declared ? parseUnicodeRange(declared) : undefined,
      };
      byFamily.set(family, [...(byFamily.get(family) ?? []), candidate]);
    });
  });
  return byFamily;
};

// The browser draws each character with the first family in the stack that can
// supply it, so later families in the stack are not worth embedding for it.
const findFaceForCodePoint = (
  byFamily: Map<string, FontFaceCandidate[]>,
  stack: string[],
  weight: number,
  style: string,
  codePoint: number
): CSSFontFaceRule | undefined => {
  for (const family of stack) {
    const match = byFamily
      .get(family)
      ?.find(
        candidate =>
          candidate.style === style &&
          ruleSupportsWeight(candidate.rule, weight) &&
          coversCodePoint(candidate, codePoint)
      );
    if (match) {
      return match.rule;
    }
  }
  return undefined;
};

const collectUsedRules = (
  root: HTMLElement,
  byFamily: Map<string, FontFaceCandidate[]>
): CSSFontFaceRule[] => {
  const used = new Set<CSSFontFaceRule>();
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  elements.forEach(element => {
    const text = ownText(element);
    if (!text.trim()) {
      return;
    }
    const computed = window.getComputedStyle(element);
    const weight = Number(computed.fontWeight) || DEFAULT_FONT_WEIGHT;
    const style = normalizeStyle(computed.fontStyle);
    const stack = computed.fontFamily
      .split(',')
      .map(family => unquote(family).toLowerCase());
    const codePoints = new Set<number>();
    for (const character of text) {
      // Whitespace needs no glyph, and resolving it would pull in the Latin
      // subset of a family even for a sketch written in another script.
      if (!/\s/.test(character)) {
        codePoints.add(character.codePointAt(0) as number);
      }
    }
    codePoints.forEach(codePoint => {
      const rule = findFaceForCodePoint(
        byFamily,
        stack,
        weight,
        style,
        codePoint
      );
      if (rule) {
        used.add(rule);
      }
    });
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
  const pending = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Font request failed with status ${response.status}`);
      }
      return response.blob();
    })
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
