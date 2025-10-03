import lottie, {type AnimationItem} from 'lottie-web';

import {queryParams} from '@cdo/apps/code-studio/utils';
import HttpClient from '@cdo/apps/util/HttpClient';

import {
  CanvasAnimConfig,
  DancerMetadata,
  HeadImageInfo,
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

const BASE_HOST = 'https://curriculum.code.org/media/musiclab/generate';

const DEFAULT_HEAD_W = 1024;
const DEFAULT_HEAD_H = 1024;

const ASSETS_FOLDER = 'basic2';
const TEST_GENERATED_DANCER = 'basic-frog-baseball-cap-00';

const DEFAULT_HEAD_URL = `${BASE_HOST}/dancer/${ASSETS_FOLDER}/${TEST_GENERATED_DANCER}.png`;
const DEFAULT_METADATA_URL = `${BASE_HOST}/dancer/${ASSETS_FOLDER}/${TEST_GENERATED_DANCER}-metadata.json`;

export const getConfigValue = (name: string) =>
  queryParams(name) as string | undefined;

// Given information about a generated dancer, this returns the URL for the head image.
export function getGeneratedDancerAssets(
  adlibOption: string,
  choices: string[] | undefined,
  variant: number
) {
  const joinedChoices = choices?.join('-');
  const cacheFilePath = `${BASE_HOST}/dancer/${adlibOption}/${joinedChoices}-${variant
    .toString()
    .padStart(2, '0')}`;
  const head = `${cacheFilePath}.png`;
  const metadata = `${cacheFilePath}-metadata.json`;

  return {head, metadata};
}

// Example: .../dancers/input/DUCK/duck_<move>.json
export function resolveAnimationUrl(
  skeletonName: string,
  danceMove: string
): string {
  return `${BASE_HOST}/dancers/input/${skeletonName.toUpperCase()}/${skeletonName}_${danceMove}.json`;
}

// Example: .../dancer/<assetsPath>/<dancerName>-metadata.json
export function resolveMetadataUrl(
  assetsPath: string,
  dancerName: string
): string {
  return `${BASE_HOST}/dancer/${assetsPath}/${dancerName}-metadata.json`;
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

// Accessory-name mapping used to recolor vector content in the Lottie JSON.
const ACCESSORY_MAP = {
  secondary: new Set<string>([
    'bracelet',
    'shirt high',
    'shirt low',
    'shirt low 2',
    'line',
  ]),
  tertiary: new Set<string>([
    'cuff',
    'hip',
    'pelvis',
    'torso accent',
    'belly',
    'leg cuff',
    'arc',
  ]),
};

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
  palette: Palette | null
): void {
  if (!palette) return;

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

  const SECONDARY_RXS = Array.from(ACCESSORY_MAP.secondary, tokenToRx);
  const TERTIARY_RXS = Array.from(ACCESSORY_MAP.tertiary, tokenToRx);

  const anyMatch = (str: string | undefined, rxs: RegExp[]) =>
    !!str && rxs.some(rx => rx.test(str));

  const isArmLegSeg = (seg: string) =>
    /\b(left|right)?\s*(arm|leg|wrist|shoulder|ankle|hip)\b/i.test(seg);

  const isHoseySeg = (seg: string) =>
    /\b(arc|lineforcurve|rubber\s*hose|style)\b/i.test(seg);

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
      const shapeName = normalize(shapeNode.nm as string | undefined);
      const pathStr = [...pathNames, shapeNode.nm || '']
        .filter(Boolean)
        .join(' / ');

      // 1) Accessories FIRST (so they override hose matches)
      const matchesSecondary =
        segs.some(s => anyMatch(s, SECONDARY_RXS)) ||
        anyMatch(shapeName, SECONDARY_RXS) ||
        anyMatch(layerName, SECONDARY_RXS) ||
        anyMatch(pathStr, SECONDARY_RXS);

      const matchesTertiary =
        segs.some(s => anyMatch(s, TERTIARY_RXS)) ||
        anyMatch(shapeName, TERTIARY_RXS) ||
        anyMatch(layerName, TERTIARY_RXS) ||
        anyMatch(pathStr, TERTIARY_RXS);

      if (matchesSecondary) {
        paintNode(shapeNode, palette.secondary);
        continue;
      }
      if (matchesTertiary) {
        paintNode(shapeNode, palette.tertiary);
        continue;
      }

      // 2) Rubber-hose lines/areas on arms/legs → PRIMARY (if not accessory)
      const inArmLegContext =
        layerSegs.some(isArmLegSeg) || segs.some(isArmLegSeg);
      const inHoseGroup = segs.some(isHoseySeg);
      const ty = shapeNode.ty;
      if ((ty === 'st' || ty === 'fl') && inArmLegContext && inHoseGroup) {
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

/** Loads head.png as a data URL and detects natural size (falls back to 1024×1024). */
export async function fetchHeadImageInfo(
  headUrl: string | null
): Promise<HeadImageInfo | null> {
  if (!headUrl) {
    return null;
  }
  try {
    const response = await fetch(headUrl);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const dataUrl = await new Promise<string>(resolve => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.readAsDataURL(blob);
    });

    // We’ve standardized head asset dimensions, so no image probe needed.
    return {dataUrl, width: DEFAULT_HEAD_W, height: DEFAULT_HEAD_H};
  } catch {
    return null;
  }
}

/**
 * Searches all precomp assets for a layer named like “head”.
 * Returns pointers so we can locate the child comp that actually draws the head.
 */
export function findHeadPrecompLayerDeep(animationData: LottieJSON): {
  containerAsset: LottieAssetPrecomp;
  layers: Array<LottieLayer>;
  index: number;
  layer: LottiePrecompLayer;
  refId?: string;
} | null {
  const assets = animationData.assets || [];
  for (const asset of assets) {
    const pre = asset as LottieAssetPrecomp;
    if (!pre || !Array.isArray(pre.layers)) continue;

    for (let i = 0; i < pre.layers.length; i++) {
      const layer = pre.layers[i] as LottieLayer;
      if (layer && layer.ty === 0 && /\bhead\b/i.test(layer.nm || '')) {
        const precompLayer = layer as LottiePrecompLayer;
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
    a => a && a.id === id
  ) as LottieAssetPrecomp | null;
}

/**
 * Hides vector head layers inside the head comp. Also captures a copy of the
 * first matching layer’s transform (ks), so we can reuse it for positioning.
 */
export function hideVectorHeadInComp(headCompAsset: LottieAssetPrecomp): {
  insertIndex: number;
  headKs: LottieLayerCommon['ks'] | null;
} {
  let firstHiddenIndex = -1;
  let headKs: LottieLayerCommon['ks'] | null = null;

  const layers = headCompAsset.layers || [];
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i] as LottieLayer;
    if (!layer) continue;

    // In DoubleJam this is typically named like “BEAR - Head/Bear Outlines” (ty:4)
    const nm = layer.nm || '';
    if (layer.ty === 4 && (/bear outlines/i.test(nm) || /\bhead\b/i.test(nm))) {
      layer.hd = true;
      if (!headKs && layer.ks) {
        headKs = JSON.parse(JSON.stringify(layer.ks));
      }
      if (firstHiddenIndex === -1) firstHiddenIndex = i;
    }
  }

  const insertIndex =
    firstHiddenIndex >= 0 ? firstHiddenIndex + 1 : layers.length;
  return {insertIndex, headKs};
}

/** Ensures a single embedded image asset exists for the custom head and returns its id. */
export function ensureHeadImageAsset(
  animationData: LottieJSON,
  dataUrl: string,
  w: number,
  h: number
): string {
  const assets = (animationData.assets = animationData.assets || []);
  const id = 'img_head_custom';
  if (!assets.some(a => a && a.id === id)) {
    const imgAsset: LottieAssetImage = {id, w, h, u: '', p: dataUrl, e: 1};
    assets.push(imgAsset);
  }
  return id;
}

/**
 * Inserts an image layer into the head comp. If we captured a transform (ks)
 * from a hidden vector head layer, reuse it; otherwise center the image and
 * scale from image pixels → comp pixels, multiplied by headScale.
 */
export function insertHeadImageLayer(
  headCompAsset: LottieAssetPrecomp,
  insertIndex: number,
  imgAssetId: string,
  imgW: number,
  imgH: number,
  headScale: number,
  copiedKs?: LottieLayerCommon['ks'] | null
) {
  const compW = headCompAsset.w || 500;
  const compH = headCompAsset.h || 500;

  type Ks = NonNullable<LottieLayerCommon['ks']>;

  const baseKs = (
    copiedKs ? JSON.parse(JSON.stringify(copiedKs)) : {}
  ) as Partial<Ks>;

  // Map image pixels → comp pixels, then apply headScale
  const sx = (compW / imgW) * 100 * headScale;
  const sy = (compH / imgH) * 100 * headScale;

  // Build a definite `ks` object (not optional) and normalize anchors/pos/scale
  const ks: Ks = {
    ...baseKs,
    o: baseKs.o ?? {a: 0, k: 100},
    r: baseKs.r ?? {a: 0, k: 0},
    // Position at comp center so precomp motion applies cleanly
    p: {a: 0, k: [compW / 2, compH / 2, 0]},
    // Anchor at image center so scaling is intuitive
    a: {a: 0, k: [imgW / 2, imgH / 2, 0]},
    // Force correct pixel→comp scale (fixes the oversized/cropped head)
    s: {a: 0, k: [sx, sy, 100]},
  };

  const maxInd = (headCompAsset.layers || []).reduce(
    (m, L) => Math.max(m, L.ind || 0),
    0
  );

  const imgLayer: LottieImageLayer = {
    ddd: 0,
    ind: maxInd + 1,
    ty: 2,
    nm: 'Head Image',
    refId: imgAssetId,
    sr: 1,
    ks,
    ao: 0,
    ip: 0,
    op: 9999,
    st: 0,
    bm: 0,
    hd: false,
  };

  (headCompAsset.layers = headCompAsset.layers || []).splice(
    insertIndex,
    0,
    imgLayer
  );
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
 * Resolves the generated dancer assets (head PNG + metadata JSON).
 * Source of truth order:
 *   1) URL params (?path=...&dancer=...) → use exactly that dancer
 *   2) localStorage('dancer-ai-generate') with {adlibOption, choices[], variant}
 *   3) hardcoded fallbacks (DEFAULT_HEAD_URL / DEFAULT_METADATA_URL)
 * TODO: Use channel ID instead of local storage.
 */
export function resolveDancerAssets(
  opts: ResolveDancerAssetsOpts = {}
): ResolvedDancerAssets {
  const {sourceTag = 'adefaultpp'} = opts;

  const srcSuffix = `?src=${encodeURIComponent(sourceTag)}`;

  // 1) Explicit dancer via URL params
  const pathParam = getConfigValue('path');
  const dancerParam = getConfigValue('dancer')?.toLowerCase();

  if (dancerParam && pathParam) {
    const prefix = `${BASE_HOST}/dancer/${pathParam}/${dancerParam}`;
    return {
      headUrl: `${prefix}.png${srcSuffix}`,
      metadataUrl: `${prefix}-metadata.json`,
    };
  }

  // 2) Generated dancer from localStorage

  let localStorageOptions: LocalStoragePayload = null;
  try {
    const raw = localStorage.getItem('dancer-ai-generate');
    localStorageOptions = raw ? (JSON.parse(raw) as LocalStoragePayload) : null;
  } catch {
    localStorageOptions = null;
  }

  const adlibOption = localStorageOptions?.adlibOption;
  const choices = Array.isArray(localStorageOptions?.choices)
    ? (localStorageOptions!.choices as string[])
    : null;

  const variant = localStorageOptions?.variant;

  if (
    adlibOption &&
    choices &&
    choices.length > 0 &&
    typeof variant === 'number'
  ) {
    const assets = getGeneratedDancerAssets(adlibOption, choices, variant);
    return {
      headUrl: `${assets.head}${srcSuffix}`,
      metadataUrl: assets.metadata,
    };
  }

  // 3) Exact fallback defaults
  return {
    headUrl: `${DEFAULT_HEAD_URL}${srcSuffix}`,
    metadataUrl: DEFAULT_METADATA_URL,
  };
}
