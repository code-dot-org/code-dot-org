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
  LottieImageLayer,
  LottieJSON,
  Palette,
} from './LottieDancerTypes';
import {
  resolveAnimationUrl,
  fetchJson,
  normalizePalette,
  applyColorMapping,
  fetchDataUrl,
  findPrecompLayerDeep,
  getAssetById,
  ensureImageAsset,
  loadCanvasAnimation,
  resolveDancerAssets,
  getConfigValue,
  insertImageLayer,
  hideLayersByTypeAndCaptureKs,
  recolorBodySvgString,
  svgStringToDataUrl,
  getSkeletonMetadataUrl,
  hideMagentaDress,
  safeFetchSvgText,
  mirrorPngDataUrl,
  getHeadScale,
  cropDataUrl,
  improvePalette,
} from './LottieDancerUtils';

const DEFAULT_SKELETON = 'unicorn';

export default class LottieDancerRenderer {
  // Injected by DanceParty's GeneratedDancer
  private ctx: Canvas2D | null = null;

  private anim: AnimationItem | null = null;
  private totalFrames: number | null = null;

  // Values pulled from appConfig/sessionStorage
  private readonly headScale: number;
  private cachedAnimationData: {[key: string]: LottieJSON} = {};
  private skeletonNamePromise?: Promise<string>;
  private pendingAnimationLoads = new Map<string, Promise<LottieJSON>>();

  /**
   * In Lottie/After Effects, a composition is a timeline that groups layers.
   * Lottie assets list precomps by id (e.g., comp_1), and precomp layers (ty:0) reference them via refId.
   * The renderer walks assets to find the head precomp and then editing layers inside it.
   * These values are reported by getCompSize()
   **/
  private compW?: number;
  private compH?: number;
  private headUrl: string;
  private metadataUrl: string;
  private bodyUrl?: string;
  private bodyMetadataUrl?: string;
  private currentMove: DanceMoves | null;
  private fallbackSkeletonName: string;
  private headLayers?: {
    normal: LottieImageLayer;
    mirrored: LottieImageLayer;
  };

  constructor() {
    this.headScale = getHeadScale();
    this.cachedAnimationData = {};

    const {urls} = resolveDancerAssets({
      sourceTag: 'canvas',
    });
    this.headUrl = urls.headUrl;
    this.metadataUrl = urls.metadataUrl;
    this.bodyUrl = urls.bodyUrl;
    this.bodyMetadataUrl = urls.bodyMetadataUrl;
    this.currentMove = null;
    this.fallbackSkeletonName = DEFAULT_SKELETON;
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

    this.currentMove = danceMove;

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

  renderFrame(frameIndex: number, mirror?: boolean): void {
    if (!this.anim || !this.ctx || this.totalFrames === null) {
      return;
    }

    if (this.moveRequiresMirroring()) {
      // Flip the entire canvas for vectors.
      (this.ctx.canvas as HTMLElement).style.transform = `scaleX(${
        mirror ? -1 : 1
      })`;
      // Re-flip the head image layer to remain net unmirrored.
      if (this.headLayers) {
        this.headLayers.normal.hd = mirror;
        this.headLayers.mirrored.hd = !mirror;
      }
    }

    const totalFrames = Math.max(1, this.totalFrames || 1);
    const frame = Math.floor(
      ((frameIndex % totalFrames) + totalFrames) % totalFrames
    );
    this.anim.goToAndStop(frame, true);
  }

  moveRequiresMirroring(): boolean {
    if (this.currentMove === null) {
      return false;
    }
    // List of moves that should be mirrored when rendering.
    // Other moves (double_jam, this_or_that, zombie) already have symmetrical choreography.
    const movesToMirror = new Set<DanceMoves>([
      'rest',
      'clap_high',
      'dab',
      'drop',
      'floss',
      'fresh',
      'kick',
      'roll',
      'thriller',
    ]);
    const currentMove = this.currentMove;
    return movesToMirror.has(currentMove);
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
   * Resolve skeleton name once with precedence:
   * 1) URL param
   * 2) bodyMetadataUrl JSON: { "skeletonName": "..." }
   * 3) Default (TEST_SKELETON)
   */
  private async getSkeletonName(): Promise<string> {
    if (this.skeletonNamePromise) {
      return this.skeletonNamePromise;
    }
    const skeletonParam = getConfigValue('skeleton')?.toLowerCase();
    this.skeletonNamePromise = (async () => {
      if (!skeletonParam && this.bodyMetadataUrl) {
        try {
          const bodyMetaData = await fetchJson<{skeleton?: string}>(
            this.bodyMetadataUrl
          );
          const skeletonNameFromJson = bodyMetaData?.skeleton;
          if (typeof skeletonNameFromJson === 'string') {
            return skeletonNameFromJson.trim().toLowerCase();
          }
        } catch (e) {
          console.warn(
            `Failed to fetch skeleton name from body metadata URL ${this.bodyMetadataUrl}`,
            e,
            `Falling back to ${
              skeletonParam || this.fallbackSkeletonName
            } skeleton.`
          );
        }
      }
      return skeletonParam || this.fallbackSkeletonName;
    })();
    return this.skeletonNamePromise;
  }

  /**
   * Load, recolor, inject head, and memoize a move's Lottie JSON.
   * Returns the cached/transformed JSON if already present.
   */
  private async loadAndTransformMove(danceMove: string): Promise<LottieJSON> {
    const skeletonName = await this.getSkeletonName();
    const key = danceMove.toLowerCase();
    const danceMoveLowerCase = String(danceMove).toLowerCase();
    if (this.cachedAnimationData[danceMoveLowerCase]) {
      return this.cachedAnimationData[danceMoveLowerCase];
    }
    const pendingLoad = this.pendingAnimationLoads.get(key);
    if (pendingLoad) {
      return pendingLoad;
    }
    const loadPromise = (async () => {
      const jsonUrl = resolveAnimationUrl(skeletonName, danceMoveLowerCase);

      const animData = await fetchJson<LottieJSON>(jsonUrl);
      // Fetch palette metadata if we have a URL for it.
      let palette: Palette | null = null;
      if (this.metadataUrl) {
        // Ideally we fetch dancer-specific metadata first. This accompanies the head PNG.
        try {
          const metadataJson = await fetchJson<DancerMetadata>(
            this.metadataUrl
          );
          palette = normalizePalette(metadataJson);
        } catch (e) {
          // If that fails, try to fetch a default palette based on skeleton name.
          try {
            const skeletonMetaJson = await fetchJson<DancerMetadata>(
              getSkeletonMetadataUrl(skeletonName)
            );
            palette = normalizePalette(skeletonMetaJson);
          } catch {
            // Ignore failures; palette remains null which means no recoloring.
            console.warn(
              `Metadata not found at ${this.metadataUrl} - skipping palette recolor.`
            );
          }
        }
      }

      if (palette) {
        // Improve palette to avoid secondary and tertiary colors being too close to
        // primary color.
        palette = improvePalette(palette);
      }

      // Recolor assets based on hard-coded accessory-name rules.
      applyColorMapping(animData, palette, skeletonName);

      // Replace vector head with an image, if one can be loaded.
      const headDataUrl = await fetchDataUrl(this.headUrl);
      if (headDataUrl) {
        const headRegex = /\b(head)\b/i;
        const headPrecomp = findPrecompLayerDeep(animData, headRegex);
        if (headPrecomp?.refId) {
          const headComp = getAssetById(animData, headPrecomp.refId);
          if (headComp && Array.isArray(headComp.layers)) {
            const {insertIndex, ks: headKs} =
              hideLayersByTypeAndCaptureKs(headComp);
            // Crop edge artifacts from generated head PNGs.
            const croppedHeadUrl = await cropDataUrl(headDataUrl);
            const assetId = ensureImageAsset(
              animData,
              croppedHeadUrl,
              'img_head_custom'
            );
            const headMirrorDataUrl = await mirrorPngDataUrl(croppedHeadUrl);
            const headMirrorAssetId = ensureImageAsset(
              animData,
              headMirrorDataUrl,
              'img_head_custom_mirror'
            );

            // Insert both head layers at same position, mirroring disabled by default
            const headNormal = insertImageLayer(
              headComp,
              insertIndex,
              assetId,
              headKs,
              'Head Image',
              500,
              500,
              this.headScale,
              {bm: 0, hd: false}
            );
            const headMirrored = insertImageLayer(
              headComp,
              insertIndex + 1,
              headMirrorAssetId,
              headKs,
              'Head Image (mirrored)',
              500,
              500,
              this.headScale,
              {bm: 0, hd: true}
            );

            this.headLayers = {normal: headNormal, mirrored: headMirrored};
          }
        }
      }

      // Replace vector body with an image only if an SVG is successfully fetched and recolored.
      if (this.bodyUrl) {
        const bodyRegex = /\b(body)\b/i;
        const bodyPrecomp = findPrecompLayerDeep(animData, bodyRegex);
        if (bodyPrecomp?.refId) {
          const bodyComp = getAssetById(animData, bodyPrecomp.refId);

          if (bodyComp && Array.isArray(bodyComp.layers)) {
            /**
             * Body assets are expected to be SVGs. The renderer fetches the SVG markup
             * and performs pre-raster recoloring. The original vector body shapes are
             * preserved unless the SVG is fetched and processed successfully.
             */
            let finalBodyDataUrl: string | null = null;

            try {
              const svgText = await safeFetchSvgText(this.bodyUrl);
              if (!svgText) {
                throw new Error(
                  `Failed to fetch body SVG: empty response for URL ${this.bodyUrl}.
                Using unmodified vector body from ${skeletonName} Lottie JSON`
                );
              }
              const recoloredSvg = recolorBodySvgString(svgText, palette);
              finalBodyDataUrl = svgStringToDataUrl(recoloredSvg);
            } catch (e) {
              console.warn('Error processing body SVG:', e);
              finalBodyDataUrl = null;
            }

            // Perform replacement only on success; otherwise preserve original shapes
            if (finalBodyDataUrl) {
              // Hide existing vector/solid layers and capture a transform to reuse
              const {insertIndex, ks: bodyKs} =
                hideLayersByTypeAndCaptureKs(bodyComp);

              const imgAssetId = ensureImageAsset(
                animData,
                finalBodyDataUrl,
                'img_body_custom'
              );

              insertImageLayer(
                bodyComp,
                insertIndex,
                imgAssetId,
                bodyKs,
                'Body Image',
                400,
                400,
                1,
                {hasMask: false}
              );
            }
            // If finalBodyDataUrl is null, do nothing: original vector body remains.
          }
        }
      }

      // The frog has an extra magenta dress layer that needs to be hidden.
      if (skeletonName === 'frog') {
        hideMagentaDress(animData);
      }

      // Memoize transformed Lottie JSON per move (in-memory cache) so subsequent setSource calls skip recolor/head work.
      // This is useful if the same dance move is used later in a song, or if there are multiple generated dancers using the same move.
      this.cachedAnimationData[danceMoveLowerCase] = animData;
      if (Object.keys(this.cachedAnimationData).length === 1) {
        // Log only on first successful load to avoid spamming console in Dance levels.
        const shorten = (url?: string) =>
          url?.match(/generate\/([^?]+)/)?.[1] || url;

        console.log('Creating Lottie Dancer with:', {
          danceUrl: shorten(jsonUrl),
          headDataUrl: shorten(this.headUrl),
          metadataUrl: shorten(this.metadataUrl),
          bodyUrl: shorten(this.bodyUrl),
          bodyMetadataUrl: shorten(this.bodyMetadataUrl),
        });
      }
      return animData;
    })();

    this.pendingAnimationLoads.set(key, loadPromise);
    try {
      return await loadPromise;
    } finally {
      this.pendingAnimationLoads.delete(key);
    }
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
