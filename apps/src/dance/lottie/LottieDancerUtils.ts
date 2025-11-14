import lottie, {type AnimationItem} from 'lottie-web';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import HttpClient from '@cdo/apps/util/HttpClient';

import {GENERATED_DANCER_STORAGE_KEY} from '../ai/constants';

import {
  CanvasAnimConfig,
  DancerMetadata,
  LottieAssetImage,
  LottieAssetPrecomp,
  LottieColorNode,
  LottieImageLayer,
  LottieJSON,
  LottieLayer,
  LottieLayerCommon,
  LottiePrecompLayer,
  LottieShapeAny,
  LottieShapeFillOrStroke,
  LottieShapeGroup,
  LocalStoragePayload,
  Palette,
  ResolveDancerAssetsOpts,
  ResolvedDancerAssets,
  RGBA,
} from './LottieDancerTypes';

const BASE_HOST = 'https://curriculum.code.org/media/musiclab/generate/dancer';

const DEFAULT_IMAGE_SIZE = 1024;

const DEFAULT_DANCER_PATH = `${BASE_HOST}/default`;
const DEFAULT_HEAD_URL = `${DEFAULT_DANCER_PATH}/default.png`;
const DEFAULT_METADATA_URL = `${DEFAULT_DANCER_PATH}/default-metadata.json`;

const BODIES_PATH = `${BASE_HOST}/bodies`;
const DEFAULT_BODY_URL = `${BODIES_PATH}/default.svg`;
const DEFAULT_BODY_METADATA_URL = `${BODIES_PATH}/default.json`;

const SKELETONS_PATH = `${BASE_HOST}/skeletons`;
const PALETTES_PATH = `${SKELETONS_PATH}/palettes`;

const DEFAULT_HEAD_SCALE = 0.5;

// When we improve the palette, we want both secondary and tertiary to be at least
// this far from the primary, when measured using simple Euclidean color distance.
const COLOR_DISTANCE_REQUIRED = 0.32;

// Expected colors to replace in body SVGs.
const BODY_SVG_PRIMARY = '#33FF21';
const BODY_SVG_SECONDARY = '#808080';
const BODY_SVG_TERTIARY = '#4C4C4C';

// Accessory-name mapping used to recolor vector content in the Lottie JSON.
const BASE_ACCESSORY_MAP = {
  secondaryArm: new Set(['bracelet', 'shirt']),
  tertiaryArm: new Set(['cuff']),
  tertiaryLeg: new Set(['cuff']),
};

// The cat's bracelets are part of the 'shirt low' layers. The body-color arm parts are
// incorrectly labeled as 'cuff' layers, so we exclude those from tertiary.
const CAT_ACCESSORY_MAP = {
  secondaryArm: new Set(['shirt']),
};

// The unicorn's accessories use the same labels on both arms and legs. Creating two
// unique sets allows us to assign different colors to arm vs. leg accessories, giving
// the impression shirts and pants with different colors.
const UNICORN_ACCESSORY_MAP = {
  secondaryArm: new Set(['cuff', 'shirt']),
  tertiaryLeg: new Set(['cuff', 'shirt']),
};

function getAccessoryMap(skeletonName: string): {
  secondaryArm?: Set<string>;
  tertiaryArm?: Set<string>;
  tertiaryLeg?: Set<string>;
} {
  switch (skeletonName) {
    case 'cat':
      return CAT_ACCESSORY_MAP;
    case 'unicorn':
      return UNICORN_ACCESSORY_MAP;
    default:
      return BASE_ACCESSORY_MAP;
  }
}

export const getConfigValue = (name: string) =>
  queryParams(name) as string | undefined;

// Given information about a generated dancer, this returns the URL for the head image.
function getGeneratedDancerAssets(
  path: string,
  choices: string[] | undefined,
  choicesExtra: string[] | null,
  variant: number,
  extraVariant: number | null
) {
  const joinedChoices = choices?.join('-');
  const dancerPath = `${BASE_HOST}/${path}/${joinedChoices}-${variant
    .toString()
    .padStart(2, '0')}`;
  const head = `${dancerPath}.png`;
  const metadata = `${dancerPath}-metadata.json`;

  // Body selection logic: 1) default, 2) extra choices, 3) adlib choice
  let body = `${BODIES_PATH}/default.svg`;
  let bodyMetadata = `${BODIES_PATH}/default.json`;

  const extraVariantString = extraVariant?.toString().padStart(2, '0') || '00';
  // If we have choicesExtra, use them with the extraVariant to select body.
  if (Array.isArray(choicesExtra) && choicesExtra.length > 0) {
    const bodyName = `${choicesExtra.join('-')}-${extraVariantString}`;
    body = `${BODIES_PATH}/${bodyName}.svg`;
    bodyMetadata = `${BODIES_PATH}/${bodyName}.json`;
  } else {
    // If no choicesExtra, see if the path from adlibOption includes 'adjective' to select body.
    const adjectiveIndex = path.split('-').indexOf('adjective');
    if (adjectiveIndex >= 0 && choices && choices[adjectiveIndex]) {
      const adlibBody = `${choices[adjectiveIndex]}-${extraVariantString}`;
      body = `${BODIES_PATH}/${adlibBody}.svg`;
      bodyMetadata = `${BODIES_PATH}/${adlibBody}.json`;
    }
  }
  return {head, metadata, body, bodyMetadata};
}

// Example: .../dancers/input/DUCK/duck_roll.json
export function resolveAnimationUrl(
  skeletonName: string,
  danceMove: string
): string {
  return `${SKELETONS_PATH}/${skeletonName}/${skeletonName}_${danceMove}.json`;
}

export async function fetchJson<T>(url: string): Promise<T> {
  try {
    const {value} = await HttpClient.fetchJson<T>(url);
    return value;
  } catch (e) {
    console.warn(`Error fetching JSON from ${url}:`, e);
    throw e;
  }
}

// Metadata keeps colors in hex; we convert to normalized RGBA [0..1].
export function normalizePalette(metadata: DancerMetadata = {}): Palette {
  const toRGBA = (hex?: string | null): RGBA | null => {
    if (!hex) return null;
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return [r, g, b, 1];
  };

  const bodyColor = metadata['body_color'] as string | undefined;
  const secondaryColor =
    metadata['secondary_color'] || (bodyColor as string | undefined);
  const tertiaryColor =
    metadata['tertiary_color'] || (secondaryColor as string | undefined);

  return {
    primary: toRGBA(bodyColor),
    secondary: toRGBA(secondaryColor),
    tertiary: toRGBA(tertiaryColor),
    lock: metadata['lock_palette'] === true,
  };
}

/**
 * Walks the animation JSON, looking for fills/strokes that match accessory
 * names, and reassigns their colors from the palette. “Hose” lines in arm/leg
 * contexts fall back to primary if not matched as an accessory.
 *
 * The matching is intentionally fuzzy (word-boundary and space/underscore tolerant)
 * to accommodate a variety of authoring names.
 */
export function applyColorMapping(
  animationData: LottieJSON,
  palette: Palette | null,
  skeletonName: string
): void {
  if (!palette) return;

  const accessoryMap: {
    secondaryArm?: Set<string>;
    tertiaryArm?: Set<string>;
    tertiaryLeg?: Set<string>;
  } = getAccessoryMap(skeletonName);

  const normalize = (s?: string) =>
    (s || '').toLowerCase().replace(/[_-]+/g, ' ').trim();

  const splitSegments = (s?: string) =>
    normalize(s)
      .split(/\s*\/\s*|\s*::\s*|\s*>\s*|\s{2,}/g)
      .filter(Boolean);

  // Build word-boundary regexes from ACCESSORY_MAP tokens.
  const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokenToRx = (token: string) =>
    new RegExp(
      `\\b${escapeRx(normalize(token)).replace(/\s+/g, '[-_\\s]+')}s?\\b`,
      'i'
    );

  const SECONDARY_ARM_RXS = Array.from(
    accessoryMap.secondaryArm || [],
    tokenToRx
  );
  const TERTIARY_ARM_RXS = Array.from(
    accessoryMap.tertiaryArm || [],
    tokenToRx
  );
  const TERTIARY_LEG_RXS = Array.from(
    accessoryMap.tertiaryLeg || [],
    tokenToRx
  );
  const anyMatch = (str: string | undefined, rxs: RegExp[]) =>
    !!str && rxs.some(rx => rx.test(str));

  const isArmSeg = (seg: string) => /\b(arm)\b/i.test(seg);
  const isLegSeg = (seg: string) => /\b(leg)\b/i.test(seg);
  const isHoseySeg = (seg: string) => /\b(style)\b/i.test(seg);

  // Assign a color to a Lottie color node (handles direct and keyframed).
  const setColorNode = (
    colorNode: LottieColorNode | undefined,
    rgba: RGBA | null
  ) => {
    if (!rgba || !colorNode) return;
    // Some exports attach expressions via `x`; remove to force flat color.
    delete colorNode.x;

    if (colorNode.a === 0) {
      // The node holds a single RGBA array. Preserve the previous alpha if present.
      const prevA = colorNode.k[3] ?? 1;
      colorNode.k = [rgba[0], rgba[1], rgba[2], prevA];
    } else {
      // The node holds an array of keyframes. Update each keyframe's start value.
      for (const kf of colorNode.k) {
        kf.s = [rgba[0], rgba[1], rgba[2], 1];
      }
    }
  };

  const paintNode = (shapeNode: LottieShapeAny, rgba: RGBA | null) => {
    if (!rgba) return;
    const ty = shapeNode.ty;
    if (
      (ty === 'fl' || ty === 'st') &&
      (shapeNode as LottieShapeFillOrStroke).c
    ) {
      setColorNode((shapeNode as LottieShapeFillOrStroke).c, rgba);
    }
    // Note: gradient fill/stroke (gf/gs) not handled here (documented elsewhere).
  };

  const walkShapes = (
    items: Array<LottieShapeAny> | undefined,
    layerName: string,
    pathNames: string[] = []
  ) => {
    if (!Array.isArray(items)) return;

    const layerSegs = splitSegments(layerName);

    for (const shapeNode of items) {
      if (!shapeNode) continue;

      // Recurse into groups to build context (“pathNames”)
      if (shapeNode.ty === 'gr') {
        const nm = (shapeNode as LottieShapeGroup).nm || '';
        const nextPath = nm ? pathNames.concat(nm) : pathNames;
        walkShapes((shapeNode as LottieShapeGroup).it, layerName, nextPath);
        continue;
      }

      const segs = pathNames.flatMap(splitSegments);
      const inArmContext = layerSegs.some(isArmSeg) || segs.some(isArmSeg);
      const inLegContext = layerSegs.some(isLegSeg) || segs.some(isLegSeg);
      const swapLegColor = skeletonName === 'unicorn' && inLegContext;

      // 1) Accessories FIRST (so they override hose matches)
      const matchesSecondary = segs.some(s => anyMatch(s, SECONDARY_ARM_RXS));

      const matchesTertiary = segs.some(
        s =>
          (layerSegs.some(isLegSeg) && anyMatch(s, TERTIARY_LEG_RXS)) ||
          (layerSegs.some(isArmSeg) && anyMatch(s, TERTIARY_ARM_RXS))
      );

      if (matchesSecondary) {
        paintNode(
          shapeNode,
          swapLegColor ? palette.tertiary : palette.secondary
        );
        continue;
      }
      if (matchesTertiary) {
        paintNode(shapeNode, palette.tertiary);
        continue;
      }

      // 2) Rubber-hose lines/areas on arms/legs → PRIMARY (if not accessory)
      const inHoseGroup = segs.some(isHoseySeg);

      const ty = shapeNode.ty;
      if (
        (ty === 'st' || ty === 'fl') &&
        (inArmContext || inLegContext) &&
        inHoseGroup
      ) {
        paintNode(shapeNode, palette.primary);
        continue;
      }
    }
  };

  const visitLayer = (layer?: LottieLayer) => {
    if (!layer) return;
    if (Array.isArray(layer.shapes)) {
      walkShapes(layer.shapes, layer.nm || '', []);
    }
  };

  animationData.layers?.forEach(visitLayer);
  animationData.assets?.forEach(a =>
    (a as LottieAssetPrecomp).layers?.forEach(visitLayer)
  );
}

/** Loads png as a data URL and detects natural size (falls back to 1024×1024). */
export async function fetchDataUrl(url?: string): Promise<string | null> {
  if (!url) {
    return null;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await new Promise<string>(resolve => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`Failed to fetch data URL for image at ${url}:`, e);
    return null;
  }
}

/**
 * Searches all precomp assets for a matching name.
 * Returns pointers so we can locate the child comp that actually holds the layers.
 * @param animationData
 * @returns
 */
export function findPrecompLayerDeep(
  animationData: LottieJSON,
  nameRx: RegExp
): {
  containerAsset: LottieAssetPrecomp;
  layers: Array<LottieLayer>;
  index: number;
  layer: LottiePrecompLayer;
  refId?: string;
} | null {
  const assets = animationData.assets || [];
  for (const asset of assets) {
    const pre = asset as LottieAssetPrecomp;
    if (!pre || !Array.isArray(pre.layers)) {
      continue;
    }

    for (let i = 0; i < pre.layers.length; i++) {
      const layer = pre.layers[i];
      if (layer && layer.ty === 0 && nameRx.test(layer.nm || '')) {
        const precompLayer = layer;
        return {
          containerAsset: pre,
          layers: pre.layers,
          index: i,
          layer: precompLayer,
          refId: precompLayer.refId,
        };
      }
    }
  }
  return null;
}

/** Returns the asset (usually a comp) by id (e.g., "comp_1"). */
export function getAssetById(
  animationData: LottieJSON,
  id: string
): LottieAssetPrecomp | null {
  return (animationData.assets || []).find(
    animationAsset => animationAsset && animationAsset.id === id
  ) as LottieAssetPrecomp | null;
}

/**
 * Hides vector layers inside their respective comp. Also captures a copy of the
 * first matching layer’s transform (ks), so we can reuse it for positioning.
 */
export function hideLayersByTypeAndCaptureKs(
  compAsset: LottieAssetPrecomp,
  typesToHide: number[] = [4, 1] // 4: shape, 1: solid
): {insertIndex: number; ks: LottieLayerCommon['ks'] | null} {
  const layers = (compAsset.layers = compAsset.layers || []);
  let firstHiddenIndex = -1;
  let captured: LottieLayerCommon['ks'] | null = null;

  for (let i = 0; i < layers.length; i++) {
    const currentLayer = layers[i];
    if (!currentLayer) continue;

    if (typesToHide.includes(currentLayer.ty)) {
      // Standardize on the hidden flag (no timing tweaks)
      currentLayer.hd = true;

      // Deep clone the first available ks
      if (!captured && currentLayer.ks) {
        captured = JSON.parse(JSON.stringify(currentLayer.ks));
      }

      if (firstHiddenIndex < 0) firstHiddenIndex = i;
    }
  }

  // "Replace at" logic
  const insertIndex = firstHiddenIndex >= 0 ? firstHiddenIndex : layers.length;
  return {insertIndex, ks: captured};
}

/** Ensures a single embedded image asset exists for the custom image and returns its id. */
export function ensureImageAsset(
  animationData: LottieJSON,
  dataUrl: string,
  id: string
): string {
  const assets = (animationData.assets = animationData.assets || []);
  const w = DEFAULT_IMAGE_SIZE;
  const h = DEFAULT_IMAGE_SIZE;
  if (!assets.some(a => a && a.id === id)) {
    const imgAsset: LottieAssetImage = {id, w, h, u: '', p: dataUrl, e: 1};
    assets.push(imgAsset);
  }
  return id;
}

function cloneKs(ks?: LottieLayerCommon['ks'] | null) {
  return (ks ? JSON.parse(JSON.stringify(ks)) : {}) as Partial<
    NonNullable<LottieLayerCommon['ks']>
  >;
}
function nextLayerInd(layers?: LottieLayer[]) {
  return (layers || []).reduce((m, L) => Math.max(m, L.ind || 0), 0) + 1;
}
function buildCenteredKs(
  compW: number,
  compH: number,
  imgW: number,
  imgH: number,
  base: Partial<NonNullable<LottieLayerCommon['ks']>>,
  scaleMul: number
) {
  const sx = (compW / imgW) * 100 * scaleMul;
  const sy = (compH / imgH) * 100 * scaleMul;
  const ksBase = base as NonNullable<LottieLayerCommon['ks']>;
  return {
    ...base,
    o: ksBase?.o ?? {a: 0, k: 100},
    r: ksBase?.r ?? {a: 0, k: 0},
    p: {a: 0, k: [compW / 2, compH / 2, 0]},
    a: {a: 0, k: [imgW / 2, imgH / 2, 0]},
    s: {a: 0, k: [sx, sy, 100]},
  } as NonNullable<LottieLayerCommon['ks']>;
}

export function insertImageLayer(
  compAsset: LottieAssetPrecomp,
  insertIndex: number,
  imgAssetId: string,
  copiedKs: LottieLayerCommon['ks'] | null | undefined,
  name: string,
  compDefaultW: number,
  compDefaultH: number,
  scaleMul: number,
  extraLayerProps?: Partial<LottieImageLayer>
): LottieImageLayer {
  const compW = compAsset.w || compDefaultW;
  const compH = compAsset.h || compDefaultH;
  const imgW = DEFAULT_IMAGE_SIZE;
  const imgH = DEFAULT_IMAGE_SIZE;

  const ks = buildCenteredKs(
    compW,
    compH,
    imgW,
    imgH,
    cloneKs(copiedKs),
    scaleMul
  );
  const layer: LottieImageLayer = {
    ddd: 0,
    ind: nextLayerInd(compAsset.layers),
    ty: 2,
    nm: name,
    refId: imgAssetId,
    sr: 1,
    ks,
    ao: 0,
    ip: 0,
    op: 9999,
    st: 0,
    bm: 0,
    hd: false,
    hasMask: false,
    ...(extraLayerProps || {}),
  };

  (compAsset.layers = compAsset.layers || []).splice(insertIndex, 0, layer);
  return layer;
}

export function loadCanvasAnimation(config: CanvasAnimConfig): AnimationItem {
  // The upstream types for lottie-web requires `container` to be set,
  // but Lottie also supports a canvas with provided 2d context and no container.
  // We cast to `any` to avoid the type error since providing a container here would
  // prevent us from rendering into the provided canvas context.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (lottie.loadAnimation as any)(config);
}

/**
 * Resolves the generated dancer assets (head PNG + metadata JSON) and optional body PNG and metadata JSON.
 * Source of truth order:
 *   1) URL params (?path=...&dancer=...) use exactly that dancer and/or (?body=...) for body
 *   2) localStorage('dancer-ai-generate') with {adlibOption, choices[], variant}
 *   3) hardcoded fallbacks (DEFAULT_HEAD_URL / DEFAULT_METADATA_URL)
 * The renderer will not replace the body unless a bodyUrl is returned here.
 * TODO: Use channel ID instead of local storage.
 */
export function resolveDancerAssets(opts: ResolveDancerAssetsOpts = {}): {
  urls: ResolvedDancerAssets;
} {
  // Source tags are need for the head image URL only. It prevents a CORS error
  // that results when we load the same image URL in different contexts (dancer canvas and Blockly field).
  const {sourceTag = 'default'} = opts;
  const srcSuffix = `?src=${encodeURIComponent(sourceTag)}`;

  // 1) Initialize with defaults
  const urls: ResolvedDancerAssets = {
    headUrl: `${DEFAULT_HEAD_URL}${srcSuffix}`,
    metadataUrl: DEFAULT_METADATA_URL,
    bodyUrl: DEFAULT_BODY_URL,
    bodyMetadataUrl: DEFAULT_BODY_METADATA_URL,
  };

  // 2) Generated dancer from localStorage
  let localStorageOptions: LocalStoragePayload = null;
  let extraVariant: number | null = null;
  try {
    const raw = localStorage.getItem(GENERATED_DANCER_STORAGE_KEY);
    localStorageOptions = raw ? (JSON.parse(raw) as LocalStoragePayload) : null;
  } catch {
    localStorageOptions = null;
  }
  if (localStorageOptions) {
    const path = localStorageOptions?.path ?? localStorageOptions?.adlibOption;
    const choices = Array.isArray(localStorageOptions?.choices)
      ? (localStorageOptions!.choices as string[])
      : null;
    const choicesExtra = Array.isArray(localStorageOptions?.choicesExtra)
      ? (localStorageOptions!.choicesExtra as string[])
      : null;
    extraVariant =
      localStorageOptions?.extraVariant ??
      // Keep bodyVariant for backward compatibility.
      localStorageOptions?.bodyVariant ??
      null;
    const variant = localStorageOptions?.variant;

    if (path && choices && choices.length > 0 && typeof variant === 'number') {
      const assets = getGeneratedDancerAssets(
        path,
        choices,
        choicesExtra,
        variant,
        extraVariant
      );
      urls.headUrl = `${assets.head}${srcSuffix}`;
      urls.metadataUrl = assets.metadata;
      urls.bodyUrl = assets.body;
      urls.bodyMetadataUrl = assets.bodyMetadata;
    }
  }

  // 3) Explicit dancer via URL params
  const pathParam = getConfigValue('path');
  const dancerParam = getConfigValue('dancer');
  const bodyParam = getConfigValue('body');

  if (dancerParam && pathParam) {
    const headPrefix = `${BASE_HOST}/${pathParam}/${dancerParam}`;
    urls.headUrl = `${headPrefix}.png${srcSuffix}`;
    urls.metadataUrl = `${headPrefix}-metadata.json`;
  }
  if (bodyParam) {
    urls.bodyUrl = `${BODIES_PATH}/${bodyParam}.svg`;
    urls.bodyMetadataUrl = `${BODIES_PATH}/${bodyParam}.json`;
  }
  return {urls};
}

/**
 * Fetches a text resource and returns its content as a string.
 * Returns null if the request fails or the response is not OK.
 * Used to load SVG markup for pre-raster recoloring.
 */
export async function fetchText(url?: string): Promise<string | null> {
  if (!url) {
    return null;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Fetches SVG text from the given URL, falling back to the default body SVG if needed.
 */
export async function safeFetchSvgText(url?: string): Promise<string | null> {
  let svgText = await fetchText(url);
  if (!svgText) {
    console.warn(`Failed to fetch SVG text from ${url}`);
    svgText = await fetchText(DEFAULT_BODY_URL);
  }
  return svgText;
}

/**
 * Converts an SVG string into a base64-encoded data URL suitable for use in a
 * Lottie image asset. Base64 encoding ensures that reserved characters such as
 * “<”, “>”, or “#” do not corrupt the URL.
 */
export function svgStringToDataUrl(svg: string): string {
  const base64 =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/** Converts an [r,g,b,a] array with values in 0–1 into a #RRGGBB string. */
function toHexFromRgba(rgba: RGBA | null | undefined): string | null {
  if (!rgba) return null;
  const [r, g, b] = rgba.map(v => Math.round((v || 0) * 255));
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Extracts a #RRGGBB fill value from an inline style string, if present. */
function getInlineFillFromStyle(style: string | null): string | null {
  if (!style) return null;
  const m = style.match(/fill\s*:\s*(#[0-9a-fA-F]{6})\b/);
  return m ? m[1] : null;
}

/** Simple Euclidean color distance between two colors. */
function colorDistance(color1: RGBA, color2: RGBA) {
  return Math.sqrt(
    (color1[0] - color2[0]) * (color1[0] - color2[0]) +
      (color1[1] - color2[1]) * (color1[1] - color2[1]) +
      (color1[2] - color2[2]) * (color1[2] - color2[2])
  );
}

/** Simple inversion of a color. */
function colorInverse(color: RGBA): RGBA {
  return [1 - color[0], 1 - color[1], 1 - color[2], color[3]];
}

/** Returns a new, improved palette, in which secondary and tertiary are
 * at least COLOR_DISTANCE_REQUIRED away from primary.  If either is initially
 * closer, then it is inverted in the returned palette.
 */
export function improvePalette(palette: Palette): Palette {
  if (palette.primary && palette.secondary && palette.tertiary) {
    const primary = palette.primary;
    const secondary =
      colorDistance(palette.primary, palette.secondary) <
      COLOR_DISTANCE_REQUIRED
        ? colorInverse(palette.secondary)
        : palette.secondary;
    const tertiary =
      colorDistance(palette.primary, palette.tertiary) < COLOR_DISTANCE_REQUIRED
        ? colorInverse(palette.tertiary)
        : palette.tertiary;

    return {primary, secondary, tertiary};
  }

  return palette;
}

/**
 * Performs in-place recoloring of an SVG markup string.
 * Only shapes whose fill or inline-style fill exactly matches one of the
 * standardized tokens are updated to the palette colors.
 */
export function recolorBodySvgString(
  svgText: string,
  palette: Palette | null
): string {
  if (!palette) return svgText;

  const primaryHex = toHexFromRgba(palette.primary);
  const secondaryHex = toHexFromRgba(palette.secondary ?? palette.primary);
  const tertiaryHex = toHexFromRgba(
    palette.tertiary ?? palette.secondary ?? palette.primary
  );

  /** Maps canonical source tokens (lowercased) to palette colors. */
  const tokenToTarget = new Map<string, string>();
  if (primaryHex) tokenToTarget.set(BODY_SVG_PRIMARY.toLowerCase(), primaryHex);
  if (secondaryHex)
    tokenToTarget.set(BODY_SVG_SECONDARY.toLowerCase(), secondaryHex);
  if (tertiaryHex)
    tokenToTarget.set(BODY_SVG_TERTIARY.toLowerCase(), tertiaryHex);

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  /** Query all standard vector shape elements that can have fill attributes. */
  const nodes = doc.querySelectorAll<SVGElement>(
    'path,rect,circle,ellipse,polygon,polyline,line'
  );

  nodes.forEach(node => {
    // Attribute-level fill
    const attrFill = node.getAttribute('fill');
    if (attrFill && /^#[0-9a-fA-F]{6}$/.test(attrFill)) {
      const key = attrFill.toLowerCase();
      const target = tokenToTarget.get(key);
      if (target) {
        node.setAttribute('fill', target);
        return;
      }
    }

    // Inline style fill
    const styleFill = getInlineFillFromStyle(node.getAttribute('style'));
    if (styleFill) {
      const key = styleFill.toLowerCase();
      const target = tokenToTarget.get(key);
      if (target) {
        const style = node.getAttribute('style')!;
        node.setAttribute(
          'style',
          style.replace(/fill\s*:\s*#[0-9a-fA-F]{6}/, `fill:${target}`)
        );
      }
    }
  });

  return new XMLSerializer().serializeToString(doc.documentElement);
}

export function getSkeletonMetadataUrl(skeletonName: string): string {
  return `${PALETTES_PATH}/${skeletonName}-metadata.json`;
}

// Hide the magenta "dress" solids in the comp tree (frog skeleton only).
export function hideMagentaDress(animData: LottieJSON): void {
  if (!animData) return;

  // Build lookup for nested precomps.
  const assetById: Record<string, LottieJSON> = {};
  for (const asset of animData.assets || []) {
    if (asset?.id) assetById[asset.id] = asset;
  }

  const visitComp = (comp: LottieJSON) => {
    if (!comp?.layers) return;
    for (const layer of comp.layers) {
      if (layer.nm === 'Deep Magenta-Red Solid 4') {
        layer.hd = true;
      }

      // Recurse into precomps.
      if (layer.ty === 0 && typeof layer.refId === 'string') {
        const child = assetById[layer.refId];
        if (child) visitComp(child);
      }
    }
  };

  // Start from top-level comp.
  visitComp(animData);
}

/**
 * Loads a PNG image from a data URL, mirrors it horizontally, and returns a new data URL.
 * @param dataUrl
 * @returns
 */
export async function mirrorPngDataUrl(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = reject;
    imageElement.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const context2D = canvas.getContext('2d')!;
  context2D.translate(canvas.width, 0);
  context2D.scale(-1, 1);
  context2D.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

// Head crop can be overridden via DCDO or URL param.
function getHeadCrop(): number {
  const dcdoHeadCrop = DCDO.get('ai-dancer-head-crop');

  if (dcdoHeadCrop === false) {
    return Number(getConfigValue('headCrop')) || 10;
  }

  return Number(dcdoHeadCrop);
}

// Head scale can be overridden via URL param, e.g. ?headScale=0.8, ?bigHead=true
// If getHeadCrop() returns a value, then it calculates the right scale based on that.
export function getHeadScale(): number {
  const headCrop = getHeadCrop();

  const scaleParam =
    getConfigValue('headScale') ||
    (getConfigValue('bigHead') === 'true'
      ? '1.0'
      : headCrop
      ? String((0.5 * (DEFAULT_IMAGE_SIZE - 2 * headCrop)) / DEFAULT_IMAGE_SIZE)
      : undefined);
  const scale = scaleParam ? parseFloat(scaleParam) : NaN;
  return isNaN(scale) || scale <= 0 ? DEFAULT_HEAD_SCALE : scale;
}

/** Crops "transparent" inset from all sides of a PNG data URL. */
export async function cropDataUrl(dataUrl: string): Promise<string> {
  const inset = getHeadCrop();

  if (!inset) {
    return dataUrl;
  }

  const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = reject;
    imageElement.src = dataUrl;
  });

  const scaledWidth = Math.max(1, loadedImage.naturalWidth - inset * 2);
  const scaledHeight = Math.max(1, loadedImage.naturalHeight - inset * 2);

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = scaledWidth;
  offscreenCanvas.height = scaledHeight;
  const offscreenCanvasContext = offscreenCanvas.getContext('2d')!;
  offscreenCanvasContext.drawImage(
    loadedImage,
    inset,
    inset,
    scaledWidth,
    scaledHeight,
    0,
    0,
    scaledWidth,
    scaledHeight
  );

  return offscreenCanvas.toDataURL('image/png');
}
