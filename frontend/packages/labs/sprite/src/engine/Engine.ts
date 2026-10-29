// Runs Sprite Lab programs: what apps' P5Lab, SpriteLab and
// SpriteLab2Engine did for Sprite Lab 2, over upstream p5 and the sprite
// library instead of P5Wrapper and p5.play.
//
// One p5 instance lives as long as the engine. Each run builds a fresh
// CoreLibrary and interpreter over it. p5 2.x awaits an async setup and an
// async draw before it schedules the next frame, so the first frame waits
// for the program's global code, and a frame whose draw callback outruns
// its tick budget holds the next frame until the tick loop finishes it.
import p5 from 'p5';

import type {PlayerObserver} from '../audioFeedback/playerObserver';
import {SPRITELAB2_HELPER_CODE} from '../blockly/blockDefinitions';
import {animationNames} from '../imageTrim';
import {usesPlatformPhysics} from '../platformPhysics';
import {attachSprites, postDraw, preDraw, type SpriteP5} from '../sprites';
import type {RuntimeAnimationList, SceneType} from '../types';

import {AnimationTable, type AnimationTableOptions} from './animations';
import {loadImageOnDemand, preloadSceneImages} from './animations/preload';
import {CUSTOM_MARSHAL_OBJECTS, defineGlobals} from './globals';
import {loadHelperLibrary} from './helperLibraries';
import {
  type NativeCallback,
  type ProgramError,
  ProgramRunner,
} from './interpreter/ProgramRunner';
import {Platform} from './platform';
import CoreLibrary from './runtime/CoreLibrary';
import {NO_OP_HOST, type RuntimeHost} from './runtime/RuntimeHost';
import {extendLibrary, type SceneHooks} from './sceneLibrary';

const MAX_INTERPRETER_STEPS_PER_TICK = 500000;
// Browsers clamp this to 4ms or more.
const TICK_MS = 1;
// A block-triggered scene jump waits this long, so a say block on the same
// event is seen before the scene changes.
const SCENE_JUMP_DELAY_MS = 750;
// Extra canvas density beyond the device pixel ratio: the playspace scales
// the 400px canvas up to about 900 CSS pixels.
const CANVAS_DENSITY_FACTOR = 2;

// Markers of a platformer in a scene saved before scenes had types.
const PLATFORM_SCENE_MARKERS = [
  'makePlatformPlayer(',
  'makePlatformBlocks(',
  'setAsPlatformPlayer(',
  "'walls'",
];

export interface EngineLevel {
  /** Interpreted libraries loaded before the program; zGameDev turns on physics. */
  helperLibraries?: string[];
  /** Pool blocks whose runtime half is interpreted code. */
  sharedBlocks?: {helperCode?: string}[];
  customHelperLibrary?: string;
}

export interface EngineOptions {
  /** The element the canvas is made in. */
  container: HTMLElement;
  /** The project's images, with the data of each that has loaded. */
  images: () => RuntimeAnimationList;
  host?: RuntimeHost;
  /** An interpreted helper library's source; bundled or fetched by default. */
  loadLibrary?: (name: string) => Promise<string>;
  /** Decodes an image; for tests. */
  loadImage?: AnimationTableOptions['loadImage'];
}

export interface ControlsState {
  platformer: boolean;
  gravity: number;
}

function deferred(): {promise: Promise<void>; resolve: () => void} {
  let resolve = () => {};
  const promise = new Promise<void>(r => (resolve = r));
  return {promise, resolve};
}

export class SpriteLabEngine implements SceneHooks {
  onGoToScene: ((sceneId: string) => void) | null = null;
  onGoToExternalScene: ((sceneKey: string) => void) | null = null;
  onRestartScene: (() => void) | null = null;
  onPlayMusic: ((channelId: string) => void) | null = null;
  onControlsChange: ((state: ControlsState) => void) | null = null;
  onSceneJumpStart: (() => void) | null = null;
  onSceneJumpLand: (() => void) | null = null;
  onSceneJumpCancel: (() => void) | null = null;
  onExecutionError: ((error: ProgramError) => void) | null = null;
  /** When set, runs take their images from this list (an external scene). */
  preloadAnimationsOverride: RuntimeAnimationList | null = null;

  p5: SpriteP5 | null = null;
  library: CoreLibrary | null = null;
  runner: ProgramRunner | null = null;
  platform = new Platform(false);
  lastRestartAt = 0;

  readonly #options: EngineOptions;
  readonly #host: RuntimeHost;
  readonly #libraries = new Map<string, string>();
  #level: Required<EngineLevel> = {
    helperLibraries: ['NativeSpriteLab'],
    sharedBlocks: [],
    customHelperLibrary: '',
  };
  #table: AnimationTable | null = null;
  #userCode = '';
  #referencedImages: ReadonlySet<string> | null = null;
  #sceneType: SceneType | undefined = undefined;
  #runQueue: Promise<void> = Promise.resolve();
  #runQueued = false;
  #setupGate = deferred();
  #draw: NativeCallback | null = null;
  #pendingDraw: (() => void) | null = null;
  #globalCodeDone: (() => void) | null = null;
  #tickId: ReturnType<typeof setInterval> | null = null;
  #drawPaused = false;
  #destroyed = false;
  #jumpTimer: ReturnType<typeof setTimeout> | null = null;
  #sceneJumpInFlight = false;
  #captureWaiters: ((canvas: HTMLCanvasElement | null) => void)[] = [];
  #captureArmed = false;

  constructor(options: EngineOptions) {
    this.#options = options;
    this.#host = options.host ?? NO_OP_HOST;
  }

  get handlers(): SceneHooks['handlers'] {
    return {
      goToScene: this.onGoToScene,
      goToExternalScene: this.onGoToExternalScene,
      restartScene: this.onRestartScene,
      playMusic: this.onPlayMusic,
    };
  }

  /** Level configuration and helper libraries; call once, before running. */
  async initForLevel(level: EngineLevel = {}): Promise<void> {
    const helperLibraries = level.helperLibraries ?? ['NativeSpriteLab'];
    this.platform = new Platform(usesPlatformPhysics(helperLibraries));
    this.#level = {
      // zGameDev turns on the engine's physics; no library loads for it.
      helperLibraries: helperLibraries.filter(name => name !== 'zGameDev'),
      sharedBlocks: [...(level.sharedBlocks ?? []), ...SPRITELAB2_HELPER_CODE],
      customHelperLibrary: level.customHelperLibrary ?? '',
    };
    const load = this.#options.loadLibrary ?? loadHelperLibrary;
    await Promise.all(
      this.#level.helperLibraries.map(async name => {
        if (!this.#libraries.has(name)) {
          this.#libraries.set(name, await load(name));
        }
      }),
    );
  }

  /**
   * Runs `code` from scratch, as the running scene. Runs are serialized;
   * a request made while one waits to start is folded into it.
   */
  runProgram(
    code?: string,
    referencedImages?: ReadonlySet<string> | null,
    sceneType?: SceneType,
  ): Promise<void> {
    if (this.#destroyed) {
      return Promise.resolve();
    }
    // A jump waiting out its delay must not land in the new run.
    this.#clearSceneJumpDelay();
    this.#sceneType = sceneType;
    if (code !== undefined) {
      this.#userCode = code;
      this.#referencedImages = referencedImages ?? null;
    }
    return this.rerun();
  }

  /** Runs the current program again. */
  rerun(): Promise<void> {
    if (!this.#runQueued) {
      this.#runQueued = true;
      this.#runQueue = this.#runQueue.then(() => {
        this.#runQueued = false;
        return this.#run();
      });
    }
    return this.#runQueue;
  }

  /** Whether the running scene is a platformer. */
  isPlatformScene(): boolean {
    if (this.#sceneType) {
      return this.#sceneType === 'platform';
    }
    return PLATFORM_SCENE_MARKERS.some(marker =>
      this.#userCode.includes(marker),
    );
  }

  /**
   * Freezes drawing and the library's clock while nobody can see the
   * playspace, and resumes both.
   */
  setDrawPaused(paused: boolean): void {
    this.#drawPaused = paused;
    this.#applyDrawPaused();
  }

  /** The student answered a prompt. */
  onPromptAnswer(variableName: string, value: string): void {
    this.library?.onPromptAnswer(variableName, value);
  }

  /**
   * Calls `onFrame` with the canvas while the first frame of the next run
   * is drawn, or with null if the engine is destroyed first. Copy at once:
   * the canvas is repainted right after.
   */
  captureFirstFrame(onFrame: (canvas: HTMLCanvasElement | null) => void): void {
    this.#captureWaiters.push(onFrame);
  }

  setPlayerObserver(observer: PlayerObserver | null): void {
    this.platform.setObserver(observer);
  }

  /** A jump that cannot complete; the old scene resumes. */
  cancelSceneJump(): void {
    if (!this.#sceneJumpInFlight) {
      return;
    }
    this.#sceneJumpInFlight = false;
    if (this.runner) {
      this.#startTicks();
    }
    this.onSceneJumpCancel?.();
  }

  destroy(): void {
    this.#destroyed = true;
    this.#stopProgram();
    this.#clearSceneJumpDelay();
    this.#settleCaptures(null);
    this.p5?.remove();
    this.p5 = null;
  }

  // SceneHooks

  hasImage(name: string): boolean {
    return !!this.#table?.has(name);
  }

  projectHasImage(name: string): boolean {
    return this.hasImage(name) || animationNames(this.#images()).has(name);
  }

  loadImageOnDemand(name: string): Promise<boolean> {
    if (!this.#table) {
      return Promise.resolve(false);
    }
    return loadImageOnDemand(this.#table, this.#images(), name);
  }

  notifyControlsChange(): void {
    this.onControlsChange?.({
      platformer: this.platform.enabled && this.isPlatformScene(),
      gravity: this.platform.gravity,
    });
  }

  /**
   * Starts a block-triggered jump after SCENE_JUMP_DELAY_MS. The scene runs
   * on meanwhile, then freezes until the target runs. One jump at a time.
   */
  delaySceneJump(start: () => (() => void) | null | undefined): void {
    if (!start() || this.#jumpTimer || this.#sceneJumpInFlight) {
      return;
    }
    this.#jumpTimer = setTimeout(() => {
      this.#jumpTimer = null;
      const jump = start();
      if (jump && this.#beginSceneJump()) {
        jump();
      }
    }, SCENE_JUMP_DELAY_MS);
  }

  captureArmed(): boolean {
    return this.#captureArmed;
  }

  frameDrawn(canvas: HTMLCanvasElement): void {
    if (this.#captureArmed) {
      this.#captureArmed = false;
      this.#settleCaptures(canvas);
    }
  }

  // The run

  #images(): RuntimeAnimationList {
    return this.preloadAnimationsOverride ?? this.#options.images();
  }

  async #run(): Promise<void> {
    if (this.#destroyed) {
      return;
    }
    const p = this.p5 ?? this.#createP5();
    // Images added since the last run; already-loaded ones are kept.
    await preloadSceneImages(
      this.#table as AnimationTable,
      this.#images(),
      this.#referencedImages,
    );
    if (this.#destroyed) {
      return;
    }
    this.#stopProgram();
    p.allSprites.removeSprites();
    // removeSprites took the edge sprites too; the next edge command
    // makes new ones.
    p.edges = undefined;

    const jumpLanded = this.#sceneJumpInFlight;
    this.#sceneJumpInFlight = false;
    this.#captureArmed = this.#captureWaiters.length > 0;
    this.#startProgram(p);

    const globalCode = deferred();
    this.#globalCodeDone = globalCode.resolve;
    this.#tick();
    await globalCode.promise;
    const runner = this.runner;
    this.#draw =
      runner && !runner.halted
        ? (runner.findGlobalFunction('draw') ?? null)
        : null;
    this.#setupGate.resolve();
    this.#applyDrawPaused();
    if (jumpLanded) {
      this.onSceneJumpLand?.();
    }
  }

  #createP5(): SpriteP5 {
    // p5 2.x's friendly errors fetch and lint the page's own scripts.
    (p5 as unknown as {disableFriendlyErrors: boolean}).disableFriendlyErrors =
      true;
    let attached: SpriteP5 | null = null;
    new p5((sketch: p5) => {
      const p = attachSprites(sketch);
      attached = p;
      sketch.setup = async () => {
        const density = Math.ceil(
          CANVAS_DENSITY_FACTOR * (window.devicePixelRatio || 1),
        );
        sketch.pixelDensity(density);
        this.#installPaintHook(p);
        await this.#setupGate.promise;
      };
      sketch.draw = () => this.#drawFrame(p);
    }, this.#options.container);
    this.p5 = attached as unknown as SpriteP5;
    this.#table = new AnimationTable(this.p5, {
      multiFrame: true,
      loadImage: this.#options.loadImage,
    });
    return this.p5;
  }

  #startProgram(p: SpriteP5): void {
    const library = new CoreLibrary(p, undefined, this.#host);
    const runner = new ProgramRunner({
      maxStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
      customMarshalObjects: CUSTOM_MARSHAL_OBJECTS,
      onExecutionError: error => this.#onError(error),
    });
    library.jsInterpreter = runner;
    this.library = library;
    this.runner = runner;
    this.platform.reset();
    extendLibrary(library, this);
    this.notifyControlsChange();

    const prelude = this.#prelude();
    runner.parse({
      code: prelude + this.#userCode,
      userCodeStartOffset: prelude.length,
      initGlobals: r => {
        defineGlobals(r, p);
        for (const [name, command] of Object.entries(library.commands)) {
          r.createGlobalProperty(name, command, library);
        }
        r.createGlobalProperty('showMobileControls', () => {});
        r.createGlobalProperty('appendSpriteConsole', (text: unknown) =>
          this.#host.addConsoleMessage({text}),
        );
      },
    });
    // p5 lives across runs, so each run's clock starts now.
    library.commands.resetTimer.call(library);
    if (runner.initialized()) {
      runner.executeInterpreter();
      this.#startTicks();
    }
  }

  /** Helper libraries, pool helper code and the level's library, in apps' order. */
  #prelude(): string {
    let code = '';
    code +=
      this.#level.helperLibraries
        .map(name => this.#libraries.get(name) ?? '')
        .join('\n') + '\n';
    code +=
      this.#level.sharedBlocks
        .map(block => block.helperCode)
        .filter(helperCode => helperCode)
        .join('\n') + '\n';
    if (this.#level.customHelperLibrary) {
      code += this.#level.customHelperLibrary + '\n';
    }
    return code;
  }

  /** Ends the running program; a frame waiting on it finishes. */
  #stopProgram(): void {
    this.#stopTicks();
    this.runner?.deinitialize();
    this.#draw = null;
    this.#finishPendingDraw();
    this.#globalCodeDone?.();
    this.#globalCodeDone = null;
  }

  #onError(error: ProgramError): void {
    // As apps' handleExecutionError: the program halts, frames go on.
    this.#stopTicks();
    this.#draw = null;
    this.#finishPendingDraw();
    this.#globalCodeDone?.();
    this.#globalCodeDone = null;
    if (this.onExecutionError) {
      this.onExecutionError(error);
    } else {
      console.error(
        'SpriteLab2 execution error (program halted):',
        error.message,
      );
    }
  }

  // Frames

  #drawFrame(p: SpriteP5): void | Promise<void> {
    // During a jump the program is frozen and the last frame stays up.
    if (this.#sceneJumpInFlight) {
      return;
    }
    preDraw(p as unknown as p5);
    const draw = this.#draw;
    const runner = this.runner;
    const library = this.library;
    if (!draw || !runner || !library) {
      postDraw(p as unknown as p5);
      return;
    }
    // ANI-41, before any behavior or event runs.
    this.platform.unscaleSheetSprites(library);
    draw();
    if (
      runner.seenReturnFromCallbackDuringExecution ||
      !runner.initialized() ||
      runner.halted
    ) {
      postDraw(p as unknown as p5);
      return;
    }
    return new Promise(resolve => {
      this.#pendingDraw = () => {
        postDraw(p as unknown as p5);
        resolve();
      };
    });
  }

  #finishPendingDraw(): void {
    const finish = this.#pendingDraw;
    this.#pendingDraw = null;
    finish?.();
  }

  // Physics and character poses go between this frame's behaviors and the
  // paint; the paint call is the only seam with that timing.
  #installPaintHook(p: SpriteP5): void {
    const paint = p.drawSprites.bind(p);
    p.drawSprites = (...args: Parameters<SpriteP5['drawSprites']>) => {
      const library = this.library;
      if (library) {
        if (!this.platform.resolvedThisFrame) {
          this.platform.resolve(library);
        }
        this.platform.resolvedThisFrame = false;
        this.platform.updateCharacters(library, this.#images());
      }
      paint(...args);
    };
  }

  // Ticks

  #startTicks(): void {
    if (this.#tickId === null) {
      this.#tickId = setInterval(() => this.#tick(), TICK_MS);
    }
  }

  #stopTicks(): void {
    if (this.#tickId !== null) {
      clearInterval(this.#tickId);
      this.#tickId = null;
    }
  }

  #tick(): void {
    const runner = this.runner;
    if (!runner?.initialized()) {
      this.#globalCodeDone?.();
      this.#globalCodeDone = null;
      return;
    }
    if (!runner.isExecuting) {
      runner.executeInterpreter();
    }
    if (
      this.#globalCodeDone &&
      (runner.startedHandlingEvents || runner.isProgramDone())
    ) {
      this.#globalCodeDone();
      this.#globalCodeDone = null;
    }
    if (this.#pendingDraw && runner.seenReturnFromCallbackDuringExecution) {
      this.#finishPendingDraw();
    }
  }

  // Pausing and jumps

  #applyDrawPaused(): void {
    const p = this.p5;
    if (!p) {
      return;
    }
    const now = Date.now();
    if (this.#drawPaused) {
      if (this.library && !this.library.currentPauseStartTime) {
        this.library.startPause(now);
      }
      p.noLoop();
    } else {
      this.library?.endPause(now);
      p.loop();
    }
  }

  #beginSceneJump(): boolean {
    if (this.#sceneJumpInFlight) {
      return false;
    }
    this.#sceneJumpInFlight = true;
    this.#stopTicks();
    this.onSceneJumpStart?.();
    return true;
  }

  #clearSceneJumpDelay(): void {
    if (this.#jumpTimer) {
      clearTimeout(this.#jumpTimer);
      this.#jumpTimer = null;
    }
  }

  #settleCaptures(canvas: HTMLCanvasElement | null): void {
    const waiters = this.#captureWaiters;
    this.#captureWaiters = [];
    waiters.forEach(onFrame => onFrame(canvas));
  }
}
