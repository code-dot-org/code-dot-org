// Wraps esbuild-wasm for the compile surface: initialize once, keep a warm
// build context per entry, and bundle the learner's project on each request.
// Milestone-0 Spike B measured cold ~89 ms / warm-incremental ~10 ms; Spike C
// established the two required init details baked in below.

import * as esbuild from 'esbuild-wasm';

import {virtualFsPlugin} from './virtualFsPlugin';

/** A compile failure, with an esbuild file:line:col location when available. */
export class CompileError extends Error {
  readonly location?: string;
  constructor(message: string, location?: string) {
    super(message);
    this.name = 'CompileError';
    this.location = location;
  }
}

// esbuild-wasm's `initialize` may be called only once per thread, so the init
// promise is a module singleton rather than per-instance.
let initPromise: Promise<void> | null = null;

function initEsbuild(wasmURL?: string): Promise<void> {
  if (!initPromise) {
    // In the browser (wasmURL set) worker:false keeps esbuild on this (idle,
    // hidden) surface's main thread, so the CSP needs no `worker-src blob:`
    // (Spike C). In Node (no wasmURL, e.g. unit tests) esbuild-wasm finds its
    // own binary and the worker option does not apply.
    initPromise = esbuild.initialize(wasmURL ? {wasmURL, worker: false} : {});
  }
  return initPromise;
}

export class WorldCompiler {
  private readonly wasmURL?: string;
  private readonly externals: Record<string, string>;
  private readonly files = new Map<string, string>();
  // A warm, incremental build context per entry. Keying by entry (rather than a
  // single shared context) is what keeps the game entry and the thumbnail-
  // manifest entry BOTH warm: alternating between them no longer disposes and
  // rebuilds the other's context. Rebuilds are sequential, so the shared `files`
  // map is set correctly before each one.
  private readonly contexts = new Map<string, esbuild.BuildContext>();

  constructor(opts: {wasmURL?: string; assetBase?: string} = {}) {
    this.wasmURL = opts.wasmURL;
    // `world-lab` / `phaser` are rewritten to their self-hosted URLs under the
    // asset base so the compiled module imports them same-origin (no import map).
    const base = opts.assetBase ?? '/vendor/';
    this.externals = {
      'world-lab': `${base}world-lab.mjs`,
      phaser: `${base}phaser.esm.js`,
    };
  }

  /** Initialize esbuild-wasm (idempotent). */
  async init(): Promise<void> {
    await initEsbuild(this.wasmURL);
  }

  /**
   * Bundle `files` into a single ESM module, starting at `entry`. Each entry
   * keeps its own warm context, so rebuilds of the same entry are incremental.
   * @throws CompileError on a resolve/parse/bundle failure.
   */
  async compile(files: Record<string, string>, entry: string): Promise<string> {
    await this.init();

    this.files.clear();
    for (const [path, contents] of Object.entries(files)) {
      this.files.set(path, contents);
    }

    let context = this.contexts.get(entry);
    if (!context) {
      context = await esbuild.context({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        write: false,
        sourcemap: 'inline',
        logLevel: 'silent',
        plugins: [virtualFsPlugin(() => this.files, this.externals)],
      });
      this.contexts.set(entry, context);
    }

    try {
      const result = await context.rebuild();
      const output = result.outputFiles?.[0];
      if (!output) {
        throw new CompileError('esbuild produced no output');
      }
      return output.text;
    } catch (error) {
      throw toCompileError(error);
    }
  }

  /** Drop the warm contexts (teardown). */
  async dispose(): Promise<void> {
    await Promise.all([...this.contexts.values()].map(ctx => ctx.dispose()));
    this.contexts.clear();
  }
}

function toCompileError(error: unknown): CompileError {
  if (error instanceof CompileError) {
    return error;
  }
  // esbuild throws with an `errors: Message[]` array.
  const errors = (error as {errors?: esbuild.Message[]}).errors;
  const first = errors?.[0];
  if (first) {
    const loc = first.location
      ? `${first.location.file}:${first.location.line}:${first.location.column}`
      : undefined;
    return new CompileError(first.text, loc);
  }
  return new CompileError(
    error instanceof Error ? error.message : String(error),
  );
}
