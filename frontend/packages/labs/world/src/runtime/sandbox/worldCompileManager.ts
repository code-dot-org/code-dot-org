// Parent side of the compile surface. Builds the HIDDEN compile iframe on the
// sandbox origin, forwards the origin + asset base on its `src`, and exposes
// `compile()` — which resolves with the URL of the stored bundle. Mirrors
// python-lab's pyodideSandboxManager: origin-checked messages, a READY
// handshake gating requests, and a run-id → callback map.

import {
  ASSET_BASE_PARAM,
  ESBUILD_WORKER_PARAM,
  FromCompileMessage,
  LAB_ESBUILD_WORKER_PARAM,
  PARENT_ORIGIN_PARAM,
  ROLE_PARAM,
  SandboxRole,
  ToCompileMessage,
  type FromCompile,
} from '../messages';

export interface CompileManagerOptions {
  /** Sandbox origin base, e.g. `http://localhost:5202/`. */
  sandboxUrl: string;
  /** Origin-relative asset base forwarded to the iframe, e.g. `/vendor/`. */
  assetBase: string;
}

interface Pending {
  resolve: (moduleUrl: string) => void;
  reject: (error: Error) => void;
}

export class WorldCompileManager {
  private readonly iframe: HTMLIFrameElement;
  private readonly sandboxOrigin: string;
  private readonly ready: Promise<void>;
  private resolveReady!: () => void;
  private readonly pending = new Map<string, Pending>();

  constructor(opts: CompileManagerOptions) {
    const url = new URL('compile.html', opts.sandboxUrl);
    this.sandboxOrigin = url.origin;
    url.searchParams.set(PARENT_ORIGIN_PARAM, window.location.origin);
    url.searchParams.set(ASSET_BASE_PARAM, opts.assetBase);
    url.searchParams.set(ROLE_PARAM, SandboxRole.COMPILE);
    // Forward the esbuild-worker override (its value) from the lab URL to the
    // surface. Default is worker-on; only a host that can't grant `worker-src
    // blob:` sets `world-esbuild-worker=0` to fall back to the main thread.
    const workerOverride = new URLSearchParams(window.location.search).get(
      LAB_ESBUILD_WORKER_PARAM,
    );
    if (workerOverride != null) {
      url.searchParams.set(ESBUILD_WORKER_PARAM, workerOverride || '1');
    }

    this.ready = new Promise(resolve => {
      this.resolveReady = resolve;
    });

    this.iframe = document.createElement('iframe');
    this.iframe.title = 'World compile sandbox';
    this.iframe.style.display = 'none';
    this.iframe.src = url.toString();

    window.addEventListener('message', this.onMessage);
    document.body.appendChild(this.iframe);
  }

  private readonly onMessage = (event: MessageEvent) => {
    if (event.origin !== this.sandboxOrigin) {
      return;
    }
    const data = event.data as FromCompile;
    if (data?.type === FromCompileMessage.READY) {
      this.resolveReady();
    } else if (data?.type === FromCompileMessage.COMPILED) {
      this.pending.get(data.id)?.resolve(data.moduleUrl);
      this.pending.delete(data.id);
    } else if (data?.type === FromCompileMessage.ERROR) {
      const where = data.location ? ` (${data.location})` : '';
      this.pending.get(data.id)?.reject(new Error(`${data.message}${where}`));
      this.pending.delete(data.id);
    }
  };

  /** Compile `files` from `entry`; resolves with the served module URL. */
  async compile(files: Record<string, string>, entry: string): Promise<string> {
    await this.ready;
    const id = crypto.randomUUID();
    const result = new Promise<string>((resolve, reject) => {
      this.pending.set(id, {resolve, reject});
    });
    this.iframe.contentWindow?.postMessage(
      {type: ToCompileMessage.COMPILE, id, files, entry},
      this.sandboxOrigin,
    );
    return result;
  }

  destroy(): void {
    this.iframe.contentWindow?.postMessage(
      {type: ToCompileMessage.DISPOSE},
      this.sandboxOrigin,
    );
    window.removeEventListener('message', this.onMessage);
    this.iframe.remove();
  }
}
