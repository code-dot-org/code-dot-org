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

import {type AnimationItem, type CanvasRendererConfig} from 'lottie-web';

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
  loadCanvasAnimation,
  resolveDancerAssets,
  getConfigValue,
} from './LottieDancerUtils';

const TEST_BASE_DANCER = 'duck';

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
    const skeletonParam = getConfigValue('skeleton')?.toLowerCase();
    this.skeletonName = skeletonParam || TEST_BASE_DANCER;
    this.headScale = 0.5;
    this.cachedAnimationData = {};

    const {headUrl, metadataUrl} = resolveDancerAssets({sourceTag: 'canvas'});
    this.headUrl = headUrl;
    this.metadataUrl = metadataUrl;
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
      return;
    }

    const moveKey = String(danceMove).toLowerCase();

    // Load the transformed JSON (or reuse from cache).
    const animData = await this.loadAndTransformMove(moveKey);

    // Lottie instance bound to our canvas 2D context
    await this.prepareLottie(animData);

    this.totalFrames = Math.max(
      0,
      Math.round((animData.op || 0) - (animData.ip || 0))
    );

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

  resize(): void {
    if (!this.anim) return;
    // DanceParty's GeneratedDancer may recreate the graphics; update renderer references.
    this.anim.renderer.ctx = this.ctx;
    if (typeof this.anim.resize === 'function') this.anim.resize();
  }

  // Lottie lifecycle
  private async prepareLottie(animationData: LottieJSON): Promise<void> {
    this.destroyAnim();
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

  /**
   * Load, recolor, inject head, and memoize a move's Lottie JSON.
   * Returns the cached/transformed JSON if already present.
   */
  private async loadAndTransformMove(danceMove: string): Promise<LottieJSON> {
    const danceMoveLowerCase = String(danceMove).toLowerCase();
    if (this.cachedAnimationData[danceMoveLowerCase]) {
      return this.cachedAnimationData[danceMoveLowerCase];
    }

    const jsonUrl = resolveAnimationUrl(this.skeletonName, danceMoveLowerCase);

    const animData = await fetchJson<LottieJSON>(jsonUrl);

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
    return animData;
  }

  /**
   * Preload and cache one or more moves up front to avoid blips during playback.
   * Ignores duplicates; failures for individual moves don't reject the whole batch.
   */
  public async precacheMoves(
    moves: Array<DanceMoves | string> | null | undefined
  ): Promise<void> {
    if (!moves || moves.length === 0) return;
    const keys = Array.from(new Set(moves.map(m => String(m).toLowerCase())));
    await Promise.all(
      keys.map(k => this.loadAndTransformMove(k).catch(() => {}))
    );
  }

  public destroyAnim(): void {
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
