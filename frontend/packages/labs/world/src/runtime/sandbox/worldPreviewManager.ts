// Parent side of the preview surface. Builds the VISIBLE preview iframe (the
// game canvas) but does not place it — the caller appends `.iframe` into the
// pane (WorldPreview in the lab; the round-trip harness in a test). `load()`
// tells the preview to import a compiled module URL and resolves when it runs;
// console / engine-error reports are handed to the supplied callbacks (the
// Console/Debugger box wires these in milestone 5).

import type {CheckResult, CheckRun} from '../checks';
import {
  ASSET_BASE_PARAM,
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ROLE_PARAM,
  SandboxRole,
  ToPreviewMessage,
  type ActorSchema,
  type PlacementRequest,
  type FromPreview,
} from '../messages';
import {SANDBOX_SURFACE_DIR} from '../worldConfig';

/** The map editor's per-type picker thumbnails + inspector schemas. */
export interface ActorInfo {
  thumbnails: Record<string, string>;
  schemas: Record<string, ActorSchema>;
  /** How big each kind is, for the kinds that declare a picture. */
  sizes: Record<string, {width: number; height: number}>;
  /** One per requested placement key — see `PlacementRequest`. */
  placements: Record<string, string>;
}

export interface PreviewManagerOptions {
  sandboxUrl: string;
  assetBase: string;
  onConsole?: (level: string, args: unknown[]) => void;
  onEngineError?: (message: string, stack?: string) => void;
}

interface Pending {
  resolve: (detail: unknown) => void;
  reject: (error: Error) => void;
}

export class WorldPreviewManager {
  /** The visible preview iframe; the caller places it in the DOM. */
  readonly iframe: HTMLIFrameElement;
  private readonly sandboxOrigin: string;
  private readonly ready: Promise<void>;
  private resolveReady!: () => void;
  private readonly opts: PreviewManagerOptions;
  private readonly pending = new Map<string, Pending>();

  constructor(opts: PreviewManagerOptions) {
    this.opts = opts;
    const url = new URL(`${SANDBOX_SURFACE_DIR}preview.html`, opts.sandboxUrl);
    this.sandboxOrigin = url.origin;
    url.searchParams.set(PARENT_ORIGIN_PARAM, window.location.origin);
    url.searchParams.set(ASSET_BASE_PARAM, opts.assetBase);
    url.searchParams.set(ROLE_PARAM, SandboxRole.PREVIEW);

    this.ready = new Promise(resolve => {
      this.resolveReady = resolve;
    });

    this.iframe = document.createElement('iframe');
    this.iframe.title = 'World preview';
    this.iframe.src = url.toString();

    window.addEventListener('message', this.onMessage);
  }

  private readonly onMessage = (event: MessageEvent) => {
    if (event.origin !== this.sandboxOrigin) {
      return;
    }
    const data = event.data as FromPreview;
    switch (data?.type) {
      case FromPreviewMessage.READY:
        this.resolveReady();
        break;
      case FromPreviewMessage.BUILT:
        this.pending.get(data.id)?.resolve(data.detail);
        this.pending.delete(data.id);
        break;
      case FromPreviewMessage.THUMBNAILS:
        this.pending.get(data.id)?.resolve({
          thumbnails: data.thumbnails,
          schemas: data.schemas,
          sizes: data.sizes ?? {},
          placements: data.placements ?? {},
        });
        this.pending.delete(data.id);
        break;
      case FromPreviewMessage.CHECK_RESULT:
        this.pending.get(data.id)?.resolve({
          samples: data.samples,
          console: data.console,
          ...(data.error ? {error: data.error} : {}),
        });
        this.pending.delete(data.id);
        break;
      case FromPreviewMessage.CONSOLE:
        this.opts.onConsole?.(data.level, data.args);
        break;
      case FromPreviewMessage.ENGINE_ERROR:
        this.opts.onEngineError?.(data.message, data.stack);
        if (data.id) {
          this.pending.get(data.id)?.reject(new Error(data.message));
          this.pending.delete(data.id);
        }
        break;
      default:
        break;
    }
  };

  /** Import and run a compiled module URL; resolves with its reported detail. */
  async load(
    moduleUrl: string,
    assets?: Record<string, string>,
  ): Promise<unknown> {
    await this.ready;
    const id = crypto.randomUUID();
    const result = new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, {resolve, reject});
    });
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.LOAD, id, moduleUrl, assets},
      this.sandboxOrigin,
    );
    return result;
  }

  stop(): void {
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.STOP},
      this.sandboxOrigin,
    );
  }

  /**
   * Render actor thumbnails and introspect their property schemas from a compiled
   * thumbnail-manifest module (one sandbox pass). Independent of `load`, so it
   * never disturbs the running game.
   */
  async thumbnails(
    moduleUrl: string,
    placements: readonly PlacementRequest[] = [],
  ): Promise<ActorInfo> {
    await this.ready;
    const id = crypto.randomUUID();
    const result = new Promise<ActorInfo>((resolve, reject) => {
      this.pending.set(id, {
        resolve: value => resolve(value as ActorInfo),
        reject,
      });
    });
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.THUMBNAILS, id, moduleUrl, placements},
      this.sandboxOrigin,
    );
    return result;
  }

  /**
   * Play a check's script against a fresh world and hand back what the probes
   * saw (../checks).
   *
   * Independent of `load`, exactly as `thumbnails` is: the game the learner is
   * looking at goes on running, and the check gets a world of its own.
   */
  async check(
    moduleUrl: string,
    run: CheckRun,
    assets?: Record<string, string>,
  ): Promise<CheckResult> {
    await this.ready;
    const id = crypto.randomUUID();
    const result = new Promise<CheckResult>((resolve, reject) => {
      this.pending.set(id, {
        resolve: value => resolve(value as CheckResult),
        reject,
      });
    });
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.CHECK, id, moduleUrl, run, assets},
      this.sandboxOrigin,
    );
    return result;
  }

  /**
   * Hand the sandbox the lab's resolved design-system colors for the preview
   * letterbox background and the canvas border (the sandbox origin can't read
   * the lab's CSS variables). Waits for the surface to be ready so an early call
   * (before the iframe script attaches its listener) isn't dropped.
   */
  async setColors(background: string, border: string): Promise<void> {
    await this.ready;
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.COLORS, background, border},
      this.sandboxOrigin,
    );
  }

  /**
   * Put the keyboard on the game.
   *
   * Asked of the sandbox rather than done from here, because what has to end
   * up focused is the `#game` div INSIDE the frame — the keyboard listeners
   * are on it, so that keys reach a game somebody is looking at and not one
   * scrolled off the page (`PhaserBinding`). `iframe.focus()` from this side
   * gives the frame's document focus with `body` active, and a keydown on
   * `body` never reaches a listener on `#game`.
   *
   * Not awaited on `ready`, unlike the rest: this is answering something a
   * person just did, and a focus that arrives after they have started typing
   * is worse than one that does not arrive at all.
   */
  focusGame(): void {
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.FOCUS},
      this.sandboxOrigin,
    );
  }

  destroy(): void {
    window.removeEventListener('message', this.onMessage);
    this.iframe.remove();
  }
}
