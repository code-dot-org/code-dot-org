/**
 * LottieDancerRenderer
 *
 * Renders a single “dancer” move exported from After Effects via Bodymovin/Lottie
 * directly into a provided Canvas 2D context (no DOM container). Callers switch
 * moves by name (e.g., "rest", "double_jam") via setSource(), and drive the
 * animation by calling renderFrame(frameIndex).
 *
 * On load, the renderer:
 *   - Fetches the move’s Lottie JSON for a given skeleton (e.g., DUCK/duck_rest.json).
 *   - Applies palette-driven recoloring to vector layers (primary/secondary/tertiary).
 *   - Swaps the vector head for a generated raster head PNG.
 *   - Memoizes the transformed Lottie JSON per move to avoid repeating work.
 *
 * Usable by multiple clients:
 *   - Dance Party, through GeneratedDancer (passes a p5.Graphics 2D context).
 *   - Other preview layers that also supply a 2D context (in development).
 *
 * Notes:
 *   - We deliberately use the canvas renderer from lottie-web.
 *   - No coupling to audio/BPM — callers pick frames and timing themselves.
 */

import lottie, {
  type AnimationItem,
  type CanvasRendererConfig,
} from 'lottie-web';

import {queryParams} from '@cdo/apps/code-studio/utils';

import {
  Canvas2D,
  CanvasAnimConfig,
  DanceMoves,
  DancerMetadata,
  LottieJSON,
  Palette,
} from './LottieDancerTypes';
import {
  resolveAnimationUrl,
  fetchJson,
  normalizePalette,
  applyColorMapping,
  fetchHeadImageInfo,
  findHeadPrecompLayerDeep,
  getAssetById,
  hideVectorHeadInComp,
  ensureHeadImageAsset,
  insertHeadImageLayer,
  getGeneratedDancerAssets,
  BASE_HOST,
} from './LottieDancerUtils';

// Default assets
// Same constants you already have:
const ASSETS_FOLDER = 'basic2';
const TEST_BASE_DANCER = 'duck';
const TEST_GENERATED_DANCER = 'basic-frog-baseball-cap-00';

export const DEFAULT_HEAD_URL = `${BASE_HOST}/dancer/${ASSETS_FOLDER}/${TEST_GENERATED_DANCER}.png`;
const DEFAULT_METADATA_URL = `${BASE_HOST}/dancer/${ASSETS_FOLDER}/${TEST_GENERATED_DANCER}-metadata.json`;

const getConfigValue = (name: string) =>
  queryParams(name) as string | undefined;

export default class LottieDancerRenderer {
  // Injected by DanceParty's GeneratedDancer
  private ctx: Canvas2D | null = null;

  private anim: AnimationItem | null = null;
  private totalFrames: number | null = null;

  // Values pulled from appConfig/localStorage
  private readonly headScale: number;
  private readonly skeletonName: string;
  private cachedAnimationData: {[key: string]: LottieJSON} = {};

  /**
   * In Lottie/After Effects, a composition is a timeline that groups layers.
   * Lottie assets list precomps by id (e.g., comp_1), and precomp layers (ty:0) reference them via refId.
   * The renderer walks assets to find the head precomp and then editing layers inside it.
   * These values are reported by getCompSize()
   **/
  private compW?: number;
  private compH?: number;
  private headUrl: string | null;
  private metadataUrl: string | null;

  constructor() {
    const localStorageDancer = safeParseJSON(
      localStorage.getItem('dancer-ai-generate')
    ) as {
      adlibOption?: string;
      choices?: string[];
      variant?: number | string;
    } | null;

    const {adlibOption, choices, variant} = localStorageDancer || {};
    const pathParam = getConfigValue('path') || adlibOption || ASSETS_FOLDER;
    const dancerParam = getConfigValue('dancer')?.toLowerCase();
    const skeletonParam = getConfigValue('skeleton')?.toLowerCase();

    this.headScale = 0.5;
    this.skeletonName = skeletonParam || TEST_BASE_DANCER;

    let headUrl: string | undefined;
    let metadataUrl: string | undefined;

    const variantNum =
      typeof variant === 'number' ? variant : Number(variant ?? 0);

    if (Array.isArray(choices) && choices.length > 0) {
      // Preferred path: choices + variant
      const assets = getGeneratedDancerAssets(pathParam, choices, variantNum);
      headUrl = assets.head;
      metadataUrl = assets.metadata;
    } else if (dancerParam) {
      // Also fine: caller gave us a full dancer name (no deconstruction needed)
      const prefix = `${BASE_HOST}/dancer/${pathParam}/${dancerParam}`;
      headUrl = `${prefix}.png`;
      metadataUrl = `${prefix}-metadata.json`;
    } else {
      // Fallback defaults
      headUrl = DEFAULT_HEAD_URL;
      metadataUrl = DEFAULT_METADATA_URL;
    }

    this.headUrl = headUrl;
    this.metadataUrl = metadataUrl;

    this.cachedAnimationData = {};
  }
  /**
   * The caller provides a CanvasRenderingContext2D to paint into.
   * In Dance Party this is the p5.Graphics mid-layer context provided
   * by GeneratedDancer; other hosts (Music Lab, Dance Lab2 “generate dancer”)
   * can pass any 2D context.
   */
  init(ctx: Canvas2D) {
    this.ctx = ctx;
    if (this.anim) {
      // Point Lottie’s canvas renderer at the new context.
      this.anim.renderer.ctx = ctx;
      // Lottie will recompute its internal buffers if needed.
      this.anim.resize();
    }
  }

  async setSource(danceMove?: DanceMoves | null): Promise<void> {
    if (!danceMove) {
      this._clearSource();
      return;
    }

    const danceMoveLowerCase = String(danceMove).toLowerCase();
    let animData: LottieJSON;
    if (this.cachedAnimationData[danceMoveLowerCase]) {
      animData = this.cachedAnimationData[danceMoveLowerCase];
    } else {
      const jsonUrl = resolveAnimationUrl(
        this.skeletonName,
        danceMoveLowerCase
      );

      animData = await fetchJson<LottieJSON>(jsonUrl);

      // Fetch palette metadata if we have a URL for it.
      let palette: Palette | null = null;
      if (this.metadataUrl) {
        const metadataJson = await fetchJson<DancerMetadata>(this.metadataUrl);
        palette = normalizePalette(metadataJson);
      }

      // Recolor assets based on hard-coded accessory-name rules.
      applyColorMapping(animData, palette);

      // Replace vector head with an image, when head.png is available.
      const headInfo = await fetchHeadImageInfo(this.headUrl);
      console.log(headInfo);
      if (headInfo) {
        const headPre = findHeadPrecompLayerDeep(animData);
        if (headPre?.refId) {
          const headComp = getAssetById(animData, headPre.refId);
          if (headComp && Array.isArray(headComp.layers)) {
            const {insertIndex, headKs} = hideVectorHeadInComp(headComp);
            const assetId = ensureHeadImageAsset(
              animData,
              headInfo.dataUrl,
              headInfo.width,
              headInfo.height
            );
            insertHeadImageLayer(
              headComp,
              insertIndex,
              assetId,
              headInfo.width,
              headInfo.height,
              this.headScale,
              headKs
            );
          }
        }
      }
      // Memoize transformed Lottie JSON per move (in-memory cache) so subsequent setSource calls skip recolor/head work.
      // This is useful if the same dance move is used later in a song, or if there are multiple generated dancers using the same move.
      this.cachedAnimationData[danceMoveLowerCase] = animData;
    }

    // Lottie instance bound to our canvas 2D context
    await this._prepareLottie(animData);

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

  renderFrame(frameIndex: number): void {
    if (!this.anim || !this.ctx || this.totalFrames === null) {
      return;
    }
    const totalFrames = Math.max(1, this.totalFrames || 1);
    const frame = Math.floor(
      ((frameIndex % totalFrames) + totalFrames) % totalFrames
    );

    this.anim.goToAndStop(frame, true);
  }

  getTotalFrames(): number | null {
    return this.totalFrames;
  }

  resize(): void {
    if (!this.anim) return;
    // DanceParty's GeneratedDancer may recreate the graphics; update renderer references.
    this.anim.renderer.ctx = this.ctx;
    if (typeof this.anim.resize === 'function') this.anim.resize();
  }

  dispose(): void {
    this._destroyAnim();
  }

  // Cleanup path
  private _clearSource(): void {
    this._destroyAnim();
    this.totalFrames = null;
  }

  // Lottie lifecycle
  private async _prepareLottie(animationData: LottieJSON): Promise<void> {
    this._destroyAnim();
    const config: CanvasAnimConfig = {
      renderer: 'canvas',
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
        resolve();
      };
      anim.addEventListener('DOMLoaded', onReady);
    });

    this.anim = anim;
  }

  private _destroyAnim(): void {
    if (this.anim) {
      try {
        this.anim.destroy?.();
      } catch {
        // Ignore teardown issues.
      }
    }
    this.anim = null;
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
