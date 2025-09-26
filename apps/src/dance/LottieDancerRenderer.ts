import lottie, {
  type AnimationItem,
  type CanvasRendererConfig,
} from 'lottie-web';

import appConfig from '../music/appConfig';

import {
  Canvas2D,
  CanvasAnimConfig,
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
  Palette,
  RGBA,
} from './LottieDancerTypes';

// Default assets
const BASE_HOST = 'https://curriculum.code.org/media/musiclab/generate';
const ASSETS_FOLDER = 'basic2';
const TEST_BASE_DANCER = 'duck';
const TEST_GENERATED_DANCER = 'basic-frog-baseball-cap-00';

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

export default class LottieDancerRenderer {
  // Injected by ExternalDancerLayer
  private ctx: Canvas2D | null = null;

  private anim: AnimationItem | null = null;
  private animationData: LottieJSON | null = null;

  private palette: Palette | null = null;
  private totalFrames: number | null = null;

  // Values pulled from appConfig/localStorage
  private readonly headScale: number;
  private readonly assetsPath: string;
  private readonly skeletonName: string;
  private readonly variant: string;
  private readonly dancerName: string;

  // Optionally reported by getCompSize()
  private compW?: number;
  private compH?: number;

  constructor() {
    const localStorageDancer = safeParseJSON(
      localStorage.getItem('dancer-ai-generate')
    ) as {
      adlibOption?: string;
      choices?: string[];
      variant?: number | string;
    } | null;

    const {adlibOption, choices, variant} = localStorageDancer || {};

    const resolvedDancerName =
      choices && String(variant)
        ? `${choices.join('-')}-0${String(variant)}`
        : TEST_GENERATED_DANCER;

    this.headScale = 0.5;
    this.assetsPath =
      (appConfig.getValue('path') as string) || adlibOption || ASSETS_FOLDER;
    this.skeletonName =
      (appConfig.getValue('skeleton') as string)?.toLowerCase() ||
      TEST_BASE_DANCER;
    this.variant = (variant as string) || '00';
    this.dancerName =
      (appConfig.getValue('dancer') as string)?.toLowerCase() ||
      resolvedDancerName;
  }

  /** DanceParty hands us a p5.Graphics 2D context. */
  init(ctx: Canvas2D) {
    this.ctx = ctx;
  }

  async setSource(danceMove?: string | null): Promise<void> {
    if (!danceMove) {
      this._destroyAnim();
      this.animationData = null;
      this.palette = null;
      this.totalFrames = null;
      return;
    }

    const move = String(danceMove).toLowerCase();
    const jsonUrl = this._resolveAnimationUrl(move);
    const metadataUrl = this._resolveMetadataUrl();

    const [animDataRaw, metadataJson] = await Promise.all([
      this._fetchJson<LottieJSON>(jsonUrl),
      this._fetchJson<Record<string, unknown>>(metadataUrl),
    ]);

    this.palette = this._normalizePalette(metadataJson);

    // Deep clone; we will mutate the JSON tree (recoloring, inserting head image).
    const animData: LottieJSON = JSON.parse(JSON.stringify(animDataRaw));

    // Recolor assets based on hard-coded accessory-name rules.
    this._applyColorMapping(animData, this.palette);

    // Replace vector head with an image, when head.png is available.
    const headInfo = await this._fetchHeadImageInfo();
    if (headInfo) {
      const headPre = this._findHeadPrecompLayerDeep(animData);
      if (headPre?.refId) {
        const headComp = this._getAssetById(animData, headPre.refId);
        if (headComp && Array.isArray(headComp.layers)) {
          const {insertIndex, headKs} = this._hideVectorHeadInComp(headComp);
          const assetId = this._ensureHeadImageAsset(
            animData,
            headInfo.dataUrl,
            headInfo.w,
            headInfo.h
          );
          this._insertHeadImageLayer(
            headComp,
            insertIndex,
            assetId,
            headInfo.w,
            headInfo.h,
            headKs
          );
        }
      }
    }

    // Lottie instance bound to our canvas 2D context
    await this._prepareLottie(animData);

    this.animationData = animData;
    this.totalFrames = Math.max(
      0,
      Math.round((animData.op || 0) - (animData.ip || 0))
    );

    // Optionally capture comp size if top-level provides it.
    if (typeof animData.w === 'number' && typeof animData.h === 'number') {
      this.compW = animData.w;
      this.compH = animData.h;
    }
  }

  getDurationFrames(): number | null {
    return this.totalFrames;
  }

  getCompSize(): {w: number; h: number} | null {
    return this.compW && this.compH ? {w: this.compW, h: this.compH} : null;
  }

  renderFrame(frameIndex: number, mirror: boolean = false): void {
    if (!this.anim || !this.ctx || this.totalFrames === null) return;
    const tf = Math.max(1, this.totalFrames || 1);
    const frame = Math.floor(((frameIndex % tf) + tf) % tf);
    this.anim.goToAndStop(frame, true);
  }

  getTotalFrames(): number | null {
    return this.totalFrames;
  }

  resize(): void {
    if (!this.anim) return;
    // ExternalDancerLayer may recreate the graphics; update renderer references.
    this.anim.renderer.ctx = this.ctx;
    if (typeof this.anim.resize === 'function') this.anim.resize();
  }

  dispose(): void {
    this._destroyAnim();
  }

  // URL helpers
  private _resolveAnimationUrl(danceMove: string): string {
    // Example: .../dancers/input/DUCK/duck_<move>.json
    return `${BASE_HOST}/dancers/input/${this.skeletonName.toUpperCase()}/${
      this.skeletonName
    }_${danceMove}.json`;
  }

  private _resolveMetadataUrl(): string {
    // Example: .../dancer/<assetsPath>/<dancerName>-metadata.json
    return `${BASE_HOST}/dancer/${this.assetsPath}/${this.dancerName}-metadata.json`;
  }

  private _resolveHeadUrl(): string {
    // Example: .../dancer/<assetsPath>/<dancerName>.png
    return `${BASE_HOST}/dancer/${this.assetsPath}/${this.dancerName}.png`;
  }

  // Lottie lifecycle
  private async _prepareLottie(animationData: LottieJSON): Promise<void> {
    this._destroyAnim();
    const config: CanvasAnimConfig = {
      renderer: 'canvas',
      // Not used by the canvas renderer, but required by the typings.
      //   container: document.createElement('div'),
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: {
        context: this.ctx as CanvasRenderingContext2D,
        clearCanvas: true,
        preserveAspectRatio: 'xMidYMid meet',
      } satisfies CanvasRendererConfig,
    };

    const anim = loadCanvasAnimation(config);

    await new Promise<void>(resolve => {
      const onReady = () => {
        anim.removeEventListener('DOMLoaded', onReady);
        anim.removeEventListener('data_ready', onReady);
        resolve();
      };
      // Both events are fired depending on code path; listen to either.
      anim.addEventListener('DOMLoaded', onReady);
      anim.addEventListener('data_ready', onReady);
    });

    this.anim = anim;
  }

  private _destroyAnim(): void {
    if (this.anim) {
      try {
        this.anim.destroy?.();
      } catch {
        // ignore teardown issues
      }
    }
    this.anim = null;
  }

  // Fetch + palette
  private async _fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {cache: 'no-cache'});
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    }
    return res.json() as Promise<T>;
  }

  private _normalizePalette(metadata: Record<string, unknown> = {}): Palette {
    // Metadata keeps colors in hex; we convert to normalized RGBA [0..1].
    const toRGBA = (hex?: string | null): RGBA | null => {
      if (!hex) return null;
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      return [r, g, b, 1];
    };

    const bodyColor = metadata['body_color'] as string | undefined;
    const secondaryColor = metadata['secondary_color'] as string | undefined;
    const tertiaryColor = metadata['tertiary_color'] as string | undefined;

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
  private _applyColorMapping(
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

  /** Loads head.png as a data URL and detects natural size (falls back to 1000×1000). */
  private async _fetchHeadImageInfo(): Promise<HeadImageInfo | null> {
    const headUrl = this._resolveHeadUrl();
    try {
      const res = await fetch(headUrl, {cache: 'no-cache'});
      if (!res.ok) return null;

      const blob = await res.blob();

      const dataUrl = await new Promise<string>(resolve => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.readAsDataURL(blob);
      });

      const {width, height} = await new Promise<{
        width: number;
        height: number;
      }>(resolve => {
        const img = new Image();
        img.onload = () =>
          resolve({
            width: img.naturalWidth || 1000,
            height: img.naturalHeight || 1000,
          });
        img.onerror = () => resolve({width: 1000, height: 1000});
        img.src = dataUrl;
      });

      return {dataUrl, w: width, h: height};
    } catch {
      return null;
    }
  }

  /**
   * Searches all precomp assets for a layer named like “head”.
   * Returns pointers so we can locate the child comp that actually draws the head.
   */
  private _findHeadPrecompLayerDeep(animationData: LottieJSON): {
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
  private _getAssetById(
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
  private _hideVectorHeadInComp(headCompAsset: LottieAssetPrecomp): {
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
      if (
        layer.ty === 4 &&
        (/bear outlines/i.test(nm) || /\bhead\b/i.test(nm))
      ) {
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
  private _ensureHeadImageAsset(
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
  private _insertHeadImageLayer(
    headCompAsset: LottieAssetPrecomp,
    insertIndex: number,
    imgAssetId: string,
    imgW: number,
    imgH: number,
    copiedKs?: LottieLayerCommon['ks'] | null
  ) {
    const compW = headCompAsset.w || 500;
    const compH = headCompAsset.h || 500;

    type Ks = NonNullable<LottieLayerCommon['ks']>;

    const baseKs = (
      copiedKs ? JSON.parse(JSON.stringify(copiedKs)) : {}
    ) as Partial<Ks>;

    // Map image pixels → comp pixels, then apply headScale
    const sx = (compW / imgW) * 100 * this.headScale;
    const sy = (compH / imgH) * 100 * this.headScale;

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
}

function safeParseJSON(str: string | null): unknown | null {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function loadCanvasAnimation(config: CanvasAnimConfig): AnimationItem {
  // The upstream types for lottie-web requires `container` to be set,
  // but Lottie also supports a canvas with provided 2d context and no container.
  // We cast to `any` to avoid the type error since providing a container here would
  // prevent us from rendering into the provided canvas context.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (lottie.loadAnimation as any)(config);
}
