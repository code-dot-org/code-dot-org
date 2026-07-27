// Wraps esbuild-wasm for the compile surface: initialize once, keep a warm
// build context, and bundle the learner's project on each request. Milestone-0
// Spike B measured cold ~89 ms / warm-incremental ~10 ms; Spike C established the
// two required init details baked in below.

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
  private readonly files = new Map<string, string>();
  private context: esbuild.BuildContext | null = null;
  private contextEntry: string | null = null;

  constructor(opts: {wasmURL?: string} = {}) {
    this.wasmURL = opts.wasmURL;
  }

  /** Initialize esbuild-wasm (idempotent). */
  async init(): Promise<void> {
    await initEsbuild(this.wasmURL);
  }

  /**
   * Bundle `files` into a single ESM module, starting at `entry`. The context is
   * reused across calls with the same entry so rebuilds are incremental.
   * @throws CompileError on a resolve/parse/bundle failure.
   */
  async compile(files: Record<string, string>, entry: string): Promise<string> {
    await this.init();

    this.files.clear();
    for (const [path, contents] of Object.entries(files)) {
      this.files.set(path, contents);
    }

    if (!this.context || this.contextEntry !== entry) {
      await this.context?.dispose();
      this.contextEntry = entry;
      this.context = await esbuild.context({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        write: false,
        sourcemap: 'inline',
        logLevel: 'silent',
        plugins: [virtualFsPlugin(() => this.files)],
      });
    }

    try {
      const result = await this.context.rebuild();
      const output = result.outputFiles?.[0];
      if (!output) {
        throw new CompileError('esbuild produced no output');
      }
      return output.text;
    } catch (error) {
      throw toCompileError(error);
    }
  }

  /** Drop the warm context (teardown). */
  async dispose(): Promise<void> {
    await this.context?.dispose();
    this.context = null;
    this.contextEntry = null;
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
