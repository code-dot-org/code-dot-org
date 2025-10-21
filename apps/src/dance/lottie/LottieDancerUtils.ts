import lottie, {type AnimationItem} from 'lottie-web';

import {queryParams} from '@cdo/apps/code-studio/utils';
import HttpClient from '@cdo/apps/util/HttpClient';

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
  RGB,
} from './LottieDancerTypes';

const BASE_HOST = 'https://curriculum.code.org/media/musiclab/generate';

const DEFAULT_IMAGE_SIZE = 1024;

const DEFAULT_PATH = 'default';
const DEFAULT_DANCER = 'default';

const DEFAULT_HEAD_URL = `${BASE_HOST}/dancer/${DEFAULT_PATH}/${DEFAULT_DANCER}.png`;
const DEFAULT_METADATA_URL = `${BASE_HOST}/dancer/${DEFAULT_PATH}/${DEFAULT_DANCER}-metadata.json`;
const DEFAULT_BODY_URL = `${BASE_HOST}/dancers/bodies/default.png`;
const DEFAULT_BODY_METADATA_URL = `${BASE_HOST}/dancers/bodies/default.json`;

// Accessory-name mapping used to recolor vector content in the Lottie JSON.
const BASE_ACCESSORY_MAP = {
  secondaryArm: new Set(['bracelet', 'shirt']),
  tertiaryArm: new Set(['cuff']),
  tertiaryLeg: new Set(['cuff']),
};

// The cat's bracelets are part of the 'shirt low' layers. The body-color arts are
// incorrectly labeled as 'cuff' layers, so we exclude those from tertiary.
const CAT_ACCESSORY_MAP = {
  secondaryArm: new Set(['shirt']),
};

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
  adlibOption: string,
  choices: string[] | undefined,
  variant: number,
  bodyVariant: number | null
) {
  const joinedChoices = choices?.join('-');
  const dancerPath = `${BASE_HOST}/dancer/${adlibOption}/${joinedChoices}-${variant
    .toString()
    .padStart(2, '0')}`;
  const head = `${dancerPath}.png`;
  const metadata = `${dancerPath}-metadata.json`;
  const adjectiveIndex = adlibOption.split('-').indexOf('adjective');
  const bodyPath = `${BASE_HOST}/dancers/bodies/`;
  let body = `${bodyPath}default.png`;
  let bodyMetadata = `${bodyPath}default.json`;
  if (adjectiveIndex >= 0 && choices && choices[adjectiveIndex]) {
    const adlibBody = `${choices[adjectiveIndex]}-${bodyVariant
      ?.toString()
      .padStart(2, '0')}`;
    body = `${bodyPath}${adlibBody}.png`;
    bodyMetadata = `${bodyPath}${adlibBody}.json`;
  }
  return {head, metadata, body, bodyMetadata};
}

// Example: .../dancers/input/DUCK/duck_roll.json
export function resolveAnimationUrl(
  skeletonName: string,
  danceMove: string
): string {
  return `${BASE_HOST}/dancers/input/${skeletonName.toUpperCase()}/${skeletonName}_${danceMove}.json`;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const {value} = await HttpClient.fetchJson<T>(url);
  return value;
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
  } catch {
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
): void {
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

  // 1) Initializae with defaults
  const urls: ResolvedDancerAssets = {
    headUrl: `${DEFAULT_HEAD_URL}${srcSuffix}`,
    metadataUrl: DEFAULT_METADATA_URL,
    bodyUrl: DEFAULT_BODY_URL,
    bodyMetadataUrl: DEFAULT_BODY_METADATA_URL,
  };

  // 2) Generated dancer from localStorage
  let localStorageOptions: LocalStoragePayload = null;
  let bodyVariant: number | null = null;
  try {
    const raw = localStorage.getItem('dancer-ai-generate');
    localStorageOptions = raw ? (JSON.parse(raw) as LocalStoragePayload) : null;
  } catch {
    localStorageOptions = null;
  }
  if (localStorageOptions) {
    const adlibOption = localStorageOptions?.adlibOption;
    const choices = Array.isArray(localStorageOptions?.choices)
      ? (localStorageOptions!.choices as string[])
      : null;
    bodyVariant = localStorageOptions?.bodyVariant ?? null;
    const variant = localStorageOptions?.variant;

    if (
      adlibOption &&
      choices &&
      choices.length > 0 &&
      typeof variant === 'number'
    ) {
      const assets = getGeneratedDancerAssets(
        adlibOption,
        choices,
        variant,
        bodyVariant
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
    const headPrefix = `${BASE_HOST}/dancer/${pathParam}/${dancerParam}`;
    urls.headUrl = `${headPrefix}.png${srcSuffix}`;
    urls.metadataUrl = `${headPrefix}-metadata.json`;
  }
  if (bodyParam) {
    const bodyPrefix = `${BASE_HOST}/dancers/bodies/`;
    urls.bodyUrl = `${bodyPrefix}${bodyParam}.png`;
    urls.bodyMetadataUrl = `${bodyPrefix}${bodyParam}.json`;
  }
  console.log('Resolved dancer assets:', urls);
  return {urls};
}

export function hexFromRgba(rgba: RGBA | null | undefined): string {
  if (!rgba) return '000000';
  const [r, g, b] = rgba;
  const to255 = (x: number) => Math.max(0, Math.min(255, Math.round(x * 255)));
  return [to255(r), to255(g), to255(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}

function rgbDistanceSq(a: RGB, b: RGB): number {
  const deltaRed = a[0] - b[0];
  const deltaGreen = a[1] - b[1];
  const deltaBlue = a[2] - b[2];
  return deltaRed * deltaRed + deltaGreen * deltaGreen + deltaBlue * deltaBlue;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function rgbaToRgb255(rgba: RGBA): RGB {
  return [
    Math.round((rgba[0] || 0) * 255),
    Math.round((rgba[1] || 0) * 255),
    Math.round((rgba[2] || 0) * 255),
  ];
}

export type BodyRecolorOptions = {
  basePrimary?: RGB;
  baseSecondary?: RGB;
  baseTertiary?: RGB;

  /** Pixels within this distance (in RGB^2) snap to the target exactly. */
  innerThresholdSq?: number;

  /** Pixels within this max distance blend toward the target. */
  hardThresholdSq?: number;

  /**
   * Optional: increase tolerance at semi-transparent edges.
   * Effective hard threshold = hardThresholdSq * (1 + (1 - alpha) * edgeAlphaBoostMultiplier).
   * (alpha is 0..1)
   */
  edgeAlphaBoostMultiplier?: number;
};

const DEFAULT_BODY_RECOLOR_OPTS: Required<BodyRecolorOptions> = {
  basePrimary: [51, 255, 33], // neon green
  baseSecondary: [128, 128, 128], // mid gray
  baseTertiary: [76, 76, 76], // dark gray

  // Snap band: ~10 units/channel → 10^2 = 100
  innerThresholdSq: 100,

  // Soft band (AA): allow up to ~60 units total delta → 60^2 = 3600
  hardThresholdSq: 3600,

  // Edge boost: add up to +200% tolerance at fully transparent edge pixels
  edgeAlphaBoostMultiplier: 2.0,
};

/**
 * Recolors the 3 zones of the body PNG to palette.primary/secondary/tertiary.
 * Returns a data URL that is fed into ensureImageAsset().
 *
 * Strategy:
 *  - Per pixel, find nearest of the 3 base colors. If distance <= threshold,
 *    blend toward the target palette color with a softness that preserves AA edges.
 *  - Alpha is preserved. Non-matched pixels are left unchanged.
 */
export async function recolorBodyDataUrl(
  srcDataUrl: string,
  palette: Palette,
  opts?: BodyRecolorOptions
): Promise<string> {
  const recolorOptions = {...DEFAULT_BODY_RECOLOR_OPTS, ...(opts || {})};

  if (!palette?.primary || !palette?.secondary || !palette?.tertiary) {
    return srcDataUrl;
  }

  const img = await createImageBitmap(await (await fetch(srcDataUrl)).blob());
  const w = img.width || DEFAULT_IMAGE_SIZE;
  const h = img.height || DEFAULT_IMAGE_SIZE;

  const offscreenCanvas = new OffscreenCanvas(w, h);
  offscreenCanvas.width = w;
  offscreenCanvas.height = h;

  const ctx = offscreenCanvas.getContext('2d', {
    willReadFrequently: true,
  })!;
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const tgtPrimary: RGB = rgbaToRgb255(palette.primary);
  const tgtSecondary: RGB = rgbaToRgb255(palette.secondary);
  const tgtTertiary: RGB = rgbaToRgb255(palette.tertiary);

  const bases: Array<{base: RGB; target: RGB | null}> = [
    {base: recolorOptions.basePrimary, target: tgtPrimary},
    {base: recolorOptions.baseSecondary, target: tgtSecondary},
    {base: recolorOptions.baseTertiary, target: tgtTertiary},
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const a255 = data[i + 3];
    if (a255 === 0) continue;

    // nearest base
    let best = 0,
      bestDist = Infinity;
    for (let j = 0; j < bases.length; j++) {
      const d = rgbDistanceSq(bases[j].base, [r, g, b]);
      if (d < bestDist) {
        bestDist = d;
        best = j;
      }
    }

    const mapping = bases[best];
    if (!mapping.target) continue;

    // Edge-aware tolerance
    const alpha = a255 / 255;
    const hardSq =
      recolorOptions.hardThresholdSq *
      (1 + (1 - alpha) * recolorOptions.edgeAlphaBoostMultiplier);

    if (bestDist <= recolorOptions.innerThresholdSq) {
      // snap: exact target
      data[i] = mapping.target[0];
      data[i + 1] = mapping.target[1];
      data[i + 2] = mapping.target[2];
      continue;
    }
    if (bestDist <= hardSq) {
      // blend within soft band (keeps AA smooth)
      const t = 1 - bestDist / hardSq;
      const [nr, ng, nb] = lerpRgb([r, g, b], mapping.target, t);
      data[i] = nr | 0;
      data[i + 1] = ng | 0;
      data[i + 2] = nb | 0;
      continue;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const blob = await offscreenCanvas.convertToBlob({
    type: 'image/png',
  });
  return await new Promise<string>(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.readAsDataURL(blob);
  });
}

const recolorCache = new Map<string, string>();

export function getCachedRecoloredBody(key: string): string | null {
  return recolorCache.get(key) || null;
}

export function setCachedRecoloredBody(key: string, dataUrl: string): void {
  recolorCache.set(key, dataUrl);
}
