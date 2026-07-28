// Parent side of the preview surface. Builds the VISIBLE preview iframe (the
// game canvas) but does not place it — the caller appends `.iframe` into the
// pane (WorldPreview in the lab; the round-trip harness in a test). `load()`
// tells the preview to import a compiled module URL and resolves when it runs;
// console / engine-error reports are handed to the supplied callbacks (the
// Console/Debugger box wires these in milestone 5).

import {
  ASSET_BASE_PARAM,
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ROLE_PARAM,
  SandboxRole,
  ToPreviewMessage,
  type ActorSchema,
  type FromPreview,
} from '../messages';

/** The map editor's per-type picker thumbnails + inspector schemas. */
export interface ActorInfo {
  thumbnails: Record<string, string>;
  schemas: Record<string, ActorSchema>;
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
    const url = new URL('preview.html', opts.sandboxUrl);
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
  async thumbnails(moduleUrl: string): Promise<ActorInfo> {
    await this.ready;
    const id = crypto.randomUUID();
    const result = new Promise<ActorInfo>((resolve, reject) => {
      this.pending.set(id, {
        resolve: value => resolve(value as ActorInfo),
        reject,
      });
    });
    this.iframe.contentWindow?.postMessage(
      {type: ToPreviewMessage.THUMBNAILS, id, moduleUrl},
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

  destroy(): void {
    window.removeEventListener('message', this.onMessage);
    this.iframe.remove();
  }
}
