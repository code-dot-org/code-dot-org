// The postMessage contracts between the lab and the two sandbox surfaces
// (specs/PLAN.md §4). Side-effect-free so every bundle — lab, compile iframe,
// preview iframe — imports the same string constants. Following python-lab's
// style: `as const` maps (TS enums are forbidden here under erasableSyntaxOnly)
// plus one interface per message and a directional union, so the compiler
// rejects a message sent the wrong way.

// ── URL params (set on an iframe `src`, never postMessage'd) ─────────────────

/** The lab's origin, forwarded so the sandbox knows whom to trust. */
import type {CheckResult, CheckRun} from './checks';

export const PARENT_ORIGIN_PARAM = 'parentOrigin';
/** Origin-relative base for the self-hosted esbuild-wasm / Phaser assets. */
export const ASSET_BASE_PARAM = 'assetBase';
/** Which surface this page plays: `compile` or `preview`. */
export const ROLE_PARAM = 'role';
/**
 * Whether esbuild-wasm runs in a Web Worker. ON by default: the main-thread path
 * is ~50x slower in real browsers (Go→wasm hand-offs hit the main thread's
 * ~4ms timer clamp and the Atomics.wait ban — see esbuildCompiler / SANDBOX.md).
 * The worker costs a `worker-src blob:` CSP allowance; a host that cannot grant
 * it sets this to `0`/`false` to force the main thread. Absent = default (on).
 */
export const ESBUILD_WORKER_PARAM = 'esbuildWorker';
/**
 * The lab-URL override, forwarded to the compile iframe as ESBUILD_WORKER_PARAM.
 * Absent → default (worker on); `world-esbuild-worker=0` → main thread.
 */
export const LAB_ESBUILD_WORKER_PARAM = 'world-esbuild-worker';

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
  /** Play a check's script against a fresh world and report the samples. */
  CHECK: 'check',
  LOAD: 'load',
  STOP: 'stop',
  COLORS: 'colors',
  THUMBNAILS: 'thumbnails',
  /**
   * Put the keyboard on the game.
   *
   * IT HAS TO BE ASKED FOR, because the thing that must end up focused is
   * inside the sandbox and the lab is on the other side of an origin. The
   * keyboard listeners sit on the `#game` div rather than on the window, so
   * that keys only reach a game somebody is looking at (`PhaserBinding`) —
   * and focusing the IFRAME from outside is not the same thing: the frame's
   * document gets focus with `body` active, a keydown targets `body`, and a
   * listener on `#game` never sees it because events go up and `body` is not
   * inside it.
   */
  FOCUS: 'focus',
} as const;

export interface FocusRequest {
  type: typeof ToPreviewMessage.FOCUS;
}

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

/**
 * The design-system colors for the preview surface, resolved on the lab side
 * (the sandbox is a separate origin with no access to the lab's CSS variables):
 * `background` paints the letterbox around the game, `border` draws a hairline
 * on the canvas's open (letterboxed) sides.
 */
export interface ColorsMessage {
  type: typeof ToPreviewMessage.COLORS;
  background: string;
  border: string;
}

/**
 * Render a static thumbnail for each actor a compiled "thumbnail manifest"
 * module lists (its default export is `{world, actors: [{type, builder}]}`). The
 * sandbox instantiates them and draws each one's current frame — the actor
 * picker in the map editor shows these. Reply: `ThumbnailsReadyMessage`.
 */
export interface ThumbnailsMessage {
  type: typeof ToPreviewMessage.THUMBNAILS;
  id: string;
  moduleUrl: string;
  /**
   * Particular placements to draw, beyond one of each kind.
   *
   * A kind's picture is not a placement's: a Label placed three times says
   * three different things, and drawing all of them from the kind is a map
   * editor showing three identical smudges (specs/UI_ACTORS.md). These travel
   * as DATA rather than baked into the manifest module, because the module is
   * compiled and the overrides change on every keystroke in the inspector.
   */
  placements?: readonly PlacementRequest[];
}

/** One placement to draw: what kind it is, and what it overrides. */
export interface PlacementRequest {
  /** Content-derived, so two placements that differ in nothing are drawn once
   *  and share the answer (`mapModel.placementKey`). */
  key: string;
  type: string;
  properties: Record<string, Record<string, unknown>>;
}

/**
 * Run a check (../checks).
 *
 * A FRESH world, built from the same module the game is running but through
 * `instantiate()` rather than `getWorld()` — the latter memoizes, so a check
 * asking for a world would otherwise be handed the one mid-play, with the
 * learner's own keypresses already in its history.
 */
export interface CheckMessage {
  type: typeof ToPreviewMessage.CHECK;
  id: string;
  moduleUrl: string;
  /** The uploaded images, as `load` sends them — a world may draw them. */
  assets?: Record<string, string>;
  run: CheckRun;
}

export type ToPreview =
  | CheckMessage
  | LoadMessage
  | StopMessage
  | ColorsMessage
  | ThumbnailsMessage
  | FocusRequest;

// ── Preview surface → lab ────────────────────────────────────────────────────

export const FromPreviewMessage = {
  CHECK_RESULT: 'check_result',
  READY: 'preview_ready',
  BUILT: 'built',
  CONSOLE: 'console',
  ENGINE_ERROR: 'engine_error',
  THUMBNAILS: 'thumbnails_ready',
} as const;

export interface PreviewReadyMessage {
  type: typeof FromPreviewMessage.READY;
}

/**
 * How a `load` was applied: a fresh start, a live reconcile, a restart, or
 * nothing at all.
 *
 * `unchanged` is a rebuild that produced the module the game is already
 * running. Build URLs are content-addressed, so an identical URL means an
 * identical bundle — and a rebuild can be requested for reasons that do not
 * touch the bundle at all, opening a file being the common one.
 */
export type ReloadMode = 'built' | 'reconciled' | 'restarted' | 'unchanged';

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

/** One editable property in an actor's schema (introspected in the sandbox). */
export interface PropertySchema {
  /** The declaring trait's id (the `.map` override key's first level). */
  ownerId: string;
  propId: string;
  /** Localizable label. */
  name: string;
  /**
   * `actor` is a REFERENCE: the value stored is another placement's id, and
   * `WorldBuilder.loadMap` resolves it once every entry exists. The inspector
   * offers the map's own placements, which is the one list the sandbox cannot
   * supply — it knows the actor kinds, not what a particular map holds.
   *
   * `actors` is several of those, stored as an array of ids and resolved in
   * the same pass. Only a SETTABLE one appears: the read-only ones are what a
   * rule works out each frame — what is touching this, what it has collected —
   * and there is nothing for a person to pick.
   */
  type:
    | 'number'
    | 'boolean'
    | 'string'
    | 'color'
    | 'vector'
    | 'point'
    | 'actor'
    | 'actors';
  /** Default value; a vector/point is `{x, y}`. */
  default: unknown;
  /**
   * For an enum-like string property (sprite / animation): the allowed values.
   * Present → the editor renders a dropdown; absent → a free text field.
   */
  options?: string[];
}
/** An actor's editable properties, grouped by the trait that declares them. */
export interface TraitSchema {
  trait: string;
  traitName: string;
  props: PropertySchema[];
}
/** An actor type's editable schema — its trait groups, in application order. */
export type ActorSchema = TraitSchema[];

/**
 * Rendered actor thumbnails (type → data URL) plus each type's editable property
 * schema (type → trait groups), both from one introspection pass in the sandbox.
 * The map editor's picker uses the thumbnails; its inspector uses the schemas.
 */
export interface ThumbnailsReadyMessage {
  type: typeof FromPreviewMessage.THUMBNAILS;
  id: string;
  thumbnails: Record<string, string>;
  schemas: Record<string, ActorSchema>;
  /**
   * How big each kind is IN THE WORLD, for the kinds that say.
   *
   * A drawing declares its canvas and that canvas is the actor's size — its
   * click box and its collision box are worked out from it (specs/DRAWING.md).
   * The map editor drew every kind at one nominal tile, so a 64-by-8 bar came
   * out 32 by 4: the right shape at the wrong scale, a quarter of the width it
   * will have beside a 32-pixel player.
   *
   * ONLY THE KINDS THAT SAY. A sprite-backed actor's size is its image's, and
   * the image is not measured here — a frame names a sprite and carries no
   * dimensions (`animationTypes.FrameState`). Those keep the nominal tile,
   * which is exactly right for the 32-pixel sprites everything ships with and
   * wrong for any other, and is a measurement to add rather than a shape to
   * guess.
   */
  sizes: Record<string, {width: number; height: number}>;
  /** One per requested placement key, for the editors that draw placements. */
  placements: Record<string, string>;
}

/** The samples a check produced, for the lab to judge. */
export interface CheckResultMessage extends CheckResult {
  type: typeof FromPreviewMessage.CHECK_RESULT;
  id: string;
}

export type FromPreview =
  | CheckResultMessage
  | PreviewReadyMessage
  | BuiltMessage
  | ConsoleMessage
  | EngineErrorMessage
  | ThumbnailsReadyMessage;

// ── Compile surface ↔ transport service worker ───────────────────────────────

export const BuildWorkerMessage = {
  PUT_MODULE: 'put_module',
  MODULE_STORED: 'module_stored',
  KEEP_ALIVE: 'keep_alive',
} as const;
