// The postMessage contracts between the lab and the two sandbox surfaces
// (specs/PLAN.md §4). Side-effect-free so every bundle — lab, compile iframe,
// preview iframe — imports the same string constants. Following python-lab's
// style: `as const` maps (TS enums are forbidden here under erasableSyntaxOnly)
// plus one interface per message and a directional union, so the compiler
// rejects a message sent the wrong way.

// ── URL params (set on an iframe `src`, never postMessage'd) ─────────────────

/** The lab's origin, forwarded so the sandbox knows whom to trust. */
export const PARENT_ORIGIN_PARAM = 'parentOrigin';
/** Origin-relative base for the self-hosted esbuild-wasm / Phaser assets. */
export const ASSET_BASE_PARAM = 'assetBase';
/** Which surface this page plays: `compile` or `preview`. */
export const ROLE_PARAM = 'role';

export const SandboxRole = {
  COMPILE: 'compile',
  PREVIEW: 'preview',
} as const;
export type SandboxRoleType = (typeof SandboxRole)[keyof typeof SandboxRole];

/** Where the transport service worker serves compiled modules from. */
export const BUILD_PATH_PREFIX = '/__world_build__/';

// ── Lab → compile surface ────────────────────────────────────────────────────

export const ToCompileMessage = {
  COMPILE: 'compile',
  DISPOSE: 'dispose',
} as const;

/** A path-keyed project (path -> source text) plus the entry module to bundle. */
export interface CompileRequest {
  type: typeof ToCompileMessage.COMPILE;
  id: string;
  files: Record<string, string>;
  entry: string;
}

export interface DisposeRequest {
  type: typeof ToCompileMessage.DISPOSE;
}

export type ToCompile = CompileRequest | DisposeRequest;

// ── Compile surface → lab ────────────────────────────────────────────────────

export const FromCompileMessage = {
  READY: 'compile_ready',
  COMPILED: 'compiled',
  ERROR: 'compile_error',
} as const;

export interface CompileReadyMessage {
  type: typeof FromCompileMessage.READY;
}

/** The bundle is stored and addressable at `moduleUrl` (served by the SW). */
export interface CompiledMessage {
  type: typeof FromCompileMessage.COMPILED;
  id: string;
  moduleUrl: string;
}

export interface CompileErrorMessage {
  type: typeof FromCompileMessage.ERROR;
  id: string;
  message: string;
  location?: string;
}

export type FromCompile =
  | CompileReadyMessage
  | CompiledMessage
  | CompileErrorMessage;

// ── Lab → preview surface ────────────────────────────────────────────────────

export const ToPreviewMessage = {
  LOAD: 'load',
  STOP: 'stop',
} as const;

/** Import and run the module at `moduleUrl` (served same-origin by the SW). */
export interface LoadMessage {
  type: typeof ToPreviewMessage.LOAD;
  id: string;
  moduleUrl: string;
  /** Uploaded assets as `{fileName: dataURL}`, for the driver's textures. */
  assets?: Record<string, string>;
}

export interface StopMessage {
  type: typeof ToPreviewMessage.STOP;
}

export type ToPreview = LoadMessage | StopMessage;

// ── Preview surface → lab ────────────────────────────────────────────────────

export const FromPreviewMessage = {
  READY: 'preview_ready',
  BUILT: 'built',
  CONSOLE: 'console',
  ENGINE_ERROR: 'engine_error',
} as const;

export interface PreviewReadyMessage {
  type: typeof FromPreviewMessage.READY;
}

/** How a `load` was applied: a fresh start, a live reconcile, or a restart. */
export type ReloadMode = 'built' | 'reconciled' | 'restarted';

/** What the preview reports after applying a `load` (hot-reload outcome). */
export interface ReloadReport {
  mode: ReloadMode;
  /** Current world-scoped property values, by `${ruleId}.${propId}`. */
  world: Record<string, unknown>;
}

/** The module imported and ran; `detail` reports the hot-reload outcome. */
export interface BuiltMessage {
  type: typeof FromPreviewMessage.BUILT;
  id: string;
  detail?: ReloadReport;
}

export interface ConsoleMessage {
  type: typeof FromPreviewMessage.CONSOLE;
  level: string;
  args: unknown[];
}

export interface EngineErrorMessage {
  type: typeof FromPreviewMessage.ENGINE_ERROR;
  id?: string;
  message: string;
  stack?: string;
  phase: 'construct' | 'tick';
}

export type FromPreview =
  | PreviewReadyMessage
  | BuiltMessage
  | ConsoleMessage
  | EngineErrorMessage;

// ── Compile surface ↔ transport service worker ───────────────────────────────

export const BuildWorkerMessage = {
  PUT_MODULE: 'put_module',
  MODULE_STORED: 'module_stored',
  KEEP_ALIVE: 'keep_alive',
} as const;
