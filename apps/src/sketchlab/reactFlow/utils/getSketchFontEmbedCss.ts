// Builds the `fontEmbedCSS` we hand to html-to-image when exporting a sketch.
// By default, html-to-image inlines every font it finds on the page as base64,
// which can get very large. Safari and iPadOS refuse to decode an SVG that large,
// so exporting a sketch with any meaningful amount of content fails.
//
// Instead we inline only the faces the sketch actually draws with, from
// stylesheets we are allowed to read. Any other fonts will fall back to OS fonts.

// Geist is the only web font we rely on.
const EMBEDDABLE_FONT_FAMILIES = new Set(['geist']);

const DEFAULT_FONT_WEIGHT = 400;
const WEIGHT_KEYWORDS = new Map([
  ['normal', 400],
  ['bold', 700],
]);

const FONT_SOURCE_URL_PATTERN = /url\((["']?)([^"')]+)\1\)/;

interface UsedFontFace {
  family: string;
  weight: number;
  style: string;
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

const hasOwnText = (element: Element): boolean =>
  Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
  );

const collectUsedFaces = (root: HTMLElement): UsedFontFace[] => {
  const faces = new Map<string, UsedFontFace>();
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  elements.forEach(element => {
    if (!hasOwnText(element)) {
      return;
    }
    const computed = window.getComputedStyle(element);
    computed.fontFamily
      .split(',')
      .map(family => unquote(family).toLowerCase())
      .filter(family => EMBEDDABLE_FONT_FAMILIES.has(family))
      .forEach(family => {
        const face: UsedFontFace = {
          family,
          weight: Number(computed.fontWeight) || DEFAULT_FONT_WEIGHT,
          style: normalizeStyle(computed.fontStyle),
        };
        faces.set(`${face.family}|${face.weight}|${face.style}`, face);
      });
  });
  return Array.from(faces.values());
};

const readFontFaceRules = (): CSSFontFaceRule[] => {
  const rules: CSSFontFaceRule[] = [];
  Array.from(document.styleSheets).forEach(sheet => {
    let sheetRules: CSSRuleList | null = null;
    try {
      // Reading a cross-origin stylesheet throws; its fonts stay unembedded.
      sheetRules = sheet.cssRules;
    } catch (error) {
      return;
    }
    Array.from(sheetRules || []).forEach(rule => {
      if (rule.type === CSSRule.FONT_FACE_RULE) {
        rules.push(rule as CSSFontFaceRule);
      }
    });
  });
  return rules;
};

const ruleMatchesFace = (rule: CSSFontFaceRule, face: UsedFontFace): boolean =>
  unquote(rule.style.getPropertyValue('font-family')).toLowerCase() ===
    face.family &&
  normalizeStyle(rule.style.getPropertyValue('font-style')) === face.style &&
  ruleSupportsWeight(rule, face.weight);

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

const inlineFontFaceRule = async (
  rule: CSSFontFaceRule
): Promise<string | undefined> => {
  const match = FONT_SOURCE_URL_PATTERN.exec(rule.cssText);
  if (!match) {
    return undefined;
  }
  const [source, , path] = match;
  const base = rule.parentStyleSheet?.href || document.baseURI;
  const dataUrl = await fetchFontAsDataUrl(new URL(path, base).href);
  return rule.cssText.replace(source, `url(${dataUrl})`);
};

// Resolves to CSS declaring the sketch's web font faces with their files
// inlined, or to an empty string when there is nothing to embed -- which tells
// html-to-image to skip its own font handling entirely.
export const getSketchFontEmbedCss = async (
  root: HTMLElement
): Promise<string> => {
  const usedFaces = collectUsedFaces(root);
  if (usedFaces.length === 0) {
    return '';
  }
  const matchingRules = readFontFaceRules().filter(rule =>
    usedFaces.some(face => ruleMatchesFace(rule, face))
  );
  const inlined = await Promise.all(
    matchingRules.map(rule => inlineFontFaceRule(rule).catch(() => undefined))
  );
  return inlined.filter(Boolean).join('\n');
};
