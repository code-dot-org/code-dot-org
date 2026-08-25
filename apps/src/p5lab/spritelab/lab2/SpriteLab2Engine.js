import * as BlocklyCore from 'blockly/core';

import BlocklyModeErrorHandler from '@cdo/apps/BlocklyModeErrorHandler';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {APP_HEIGHT, APP_WIDTH} from '@cdo/apps/p5lab/constants';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';

import SpriteLab from '../SpriteLab';

import {SPRITELAB2_HELPER_CODE} from './blockly/blockDefinitions';
import {
  backgroundFrame,
  cameraFocus,
  clampZoom,
  stepZoom,
  worldPoint,
} from './camera';
import {loadedAnimations, trimAnimationListImages} from './imageTrim';
import {
  CONTACT_EPSILON,
  isSupported,
  PLATFORM_GRAVITY,
  resolvePlatformPhysics,
} from './platformPhysics';
import {cellSize, DEFAULT_SCENE_GRID_SIZE} from './world';

const NOOP = () => {};

// How long a run waits for the project's images before going ahead without
// the stragglers.
const IMAGE_LOAD_GRACE_MS = 10000;

// Default sprite size for non-platformer scenes on platform-pool levels;
// platformer scenes use CELL_SIZE (one grid cell). A later World-tab UI may
// let the user pick these per scene.
const STORY_SCENE_SPRITE_SIZE = 300;

// Extra canvas density beyond the device pixel ratio: the canvas is 400
// logical px and the Playspace transform-scales it to ~900 CSS px on the
// Play tab, so stock density paints ~2x2 blocks per canvas pixel.
// Coordinates stay 400-based.
const CANVAS_DENSITY_FACTOR = 2;

// How long a restart quiets further restarts: long enough to see the scene
// run again before another collision can end it.
const RESTART_QUIET_MS = 1000;

// Markers in a scene's compiled program that make it a platformer: the
// platform composites and player setup from the toolbox, or the world
// prelude's wall spawns.
const PLATFORM_SCENE_MARKERS = [
  'makePlatformPlayer(',
  'makePlatformBlocks(',
  'setAsPlatformPlayer(',
  "'walls'",
];

/**
 * Stand-in for the StudioApp singleton: exactly the members the classic
 * engine touches (see P5Lab execute()/initInterpreter()). getCode is the
 * program-injection seam; hideSource/editCode/editor keep the interpreter off
 * the nonexistent droplet/ace editor; the hasUnwanted... and clearAndAttach...
 * stubs let the inherited execute() run unchanged.
 */
function makeStudioAppStub(engine) {
  return {
    libraries: {},
    getCode: () => engine.userCode || '',
    isUsingBlockly: () => true,
    // Force the interpreter down its no-editor code path (we have no ace/droplet
    // editor to highlight).
    hideSource: true,
    editCode: false,
    editor: undefined,
    share: false,
    hasContainedLevels: false,
    clearAndAttachRuntimeAnnotations: NOOP,
    hasUnwantedExtraTopBlocks: () => false,
    hasDuplicateVariablesInForLoops: () => false,
    displayWorkspaceAlert: NOOP,
    closeAlert: NOOP,
    setCheckForEmptyBlocks: NOOP,
    toggleRunReset: NOOP,
    onResize: NOOP,
  };
}

// The engine's reset path calls into mobileControls; there's no dpad DOM here.
const NOOP_MOBILE_CONTROLS = {init: NOOP, update: NOOP, reset: NOOP};

/**
 * Adapts the classic Sprite Lab p5.play engine for use inside a Lab2 React view.
 * Owns no Blockly workspace and no StudioApp; the caller compiles the workspace
 * to JS and feeds it via run(code).
 */

export default class SpriteLab2Engine extends SpriteLab {
  constructor(defaultAnimations) {
    super(defaultAnimations);
    this.isBlockly = true;
    this.studioApp_ = makeStudioAppStub(this);
    this.mobileControls = NOOP_MOBILE_CONTROLS;
    this.showMobileControls = NOOP;
    this.debuggerEnabled = false;
    this.userCode = '';
    // Scene-jump handlers, set by the view (it compiles the target and
    // re-runs).
    this.onGoToScene = null;
    this.onGoToExternalScene = null;
    this.onRestartScene = null;
    // When the last restart fired, for the quiet window above.
    this.lastRestartAt_ = 0;
    // Jump lifecycle for the view's cover/fade: start fires with the block,
    // land when the target scene runs, cancel on abort.
    this.onSceneJumpStart = null;
    this.onSceneJumpLand = null;
    this.onSceneJumpCancel = null;
    // When set, re-runs preload from this list instead of the project's own
    // (external scenes carry their own images).
    this.preloadAnimationsOverride = null;
    // Guards against overlapping execute() calls (see runProgram/onP5Setup).
    this.executeInFlight_ = false;
    this.executeStartedAt_ = 0;
    this.rerunAfterExecute_ = false;
    // True from a jump trigger until the target runs; repeat triggers are
    // ignored meanwhile.
    this.sceneJumpInFlight_ = false;
    // Set when the zoomed draw loop has already resolved this frame.
    this.physicsResolvedThisFrame_ = false;
  }

  /**
   * @override
   * Adds the scene-jump commands (exposed as interpreter globals). A fresh
   * library per (re)run is also what clears background/input events between
   * scenes.
   */
  createLibrary(args) {
    const library = super.createLibrary(args);
    // Lab2's generated backgrounds (1024px) outresolve the canvas, unlike
    // classic's ~400px library art: resize once to the canvas's physical
    // resolution instead of CoreLibrary's logical 400. A frame (from the
    // zoomed platform draw loop) draws into that rectangle instead, straight
    // from the stored resolution — a zoomed-in view needs the extra pixels a
    // one-time downsize would destroy.
    library.drawBackground = function (frame) {
      if (typeof this.background === 'string') {
        this.p5.background(this.background);
      } else {
        this.p5.background('white');
      }
      if (typeof this.background !== 'object') {
        return;
      }
      if (frame) {
        this.p5.image(
          this.background,
          frame.x,
          frame.y,
          frame.size,
          frame.size
        );
        return;
      }
      const size = APP_WIDTH * (this.p5._pixelDensity || 1);
      if (this.background.width !== size || this.background.height !== size) {
        this.background.resize(size, size);
      }
      this.p5.image(this.background, 0, 0, APP_WIDTH, APP_HEIGHT);
    };
    if (this.usesPlatformPhysics_) {
      // Sized per SCENE, not per level: one project holds both a platformer
      // scene (one-cell sprites) and a story scene (large characters).
      // One cell at the default playfield size. A scene with a world
      // overrides this from the prelude with its own cell size, and the
      // grid blocks size their sprites from their own bitmaps.
      library.defaultSpriteSize = this.sceneLooksLikePlatformer_()
        ? cellSize(DEFAULT_SCENE_GRID_SIZE)
        : STORY_SCENE_SPRITE_SIZE;
      // Landings carry sub-pixel float noise; footing checks must not
      // compare contact exactly.
      library.contactEpsilon = CONTACT_EPSILON;
    }
    // Fresh library = fresh run; gravity returns to the default until a
    // set-gravity block says otherwise. Negative flips the world: players
    // fall up and land on block undersides and the view's top edge.
    this.platformGravity_ = PLATFORM_GRAVITY;
    library.commands.setPlatformGravity = value => {
      this.platformGravity_ = Number(value) || 0;
    };
    // The view eases toward the target zoom a frame at a time (see the
    // platform draw loop below); a fresh run starts back at 1.
    this.cameraZoom_ = 1;
    this.cameraZoomTarget_ = 1;
    // Not reset per run: a restart re-runs the program, and zeroing this here
    // would let the next frame restart again immediately.
    this.lastRestartAt_ = this.lastRestartAt_ || 0;
    library.commands.setCameraZoom = value => {
      this.cameraZoomTarget_ = clampZoom(Number(value));
    };
    if (this.usesPlatformPhysics_) {
      this.installZoomedDrawLoop_(library);
    }
    // Move existing sprites (e.g. world-placed ones) into the players
    // group; the per-frame resolver picks them up from there.
    library.commands.setPlatformPlayer = spriteArg => {
      library.getSpriteArray(spriteArg).forEach(sprite => {
        sprite.group = 'players';
      });
    };
    // Jump against gravity if any player has support in the gravity
    // direction (the resolver's own footing geometry, so it agrees with
    // where players actually rest).
    library.commands.platformJump = speed => {
      const p5 = this.p5Wrapper.p5;
      const players = library.getSpriteArray({group: 'players'});
      const walls = library.getSpriteArray({group: 'walls'});
      const view = {width: p5.width, height: p5.height};
      const grounded = players.some(sprite =>
        isSupported(sprite, walls, view, this.platformGravity_)
      );
      if (!grounded) {
        return;
      }
      const up = this.platformGravity_ < 0 ? 1 : -1;
      players.forEach(sprite => {
        sprite.velocity.y = up * Math.abs(Number(speed) || 0);
      });
    };
    // p5.play throws on an unknown costume name and the interpreter stops
    // there; skip the block instead and say so once.
    const knownCostume = name =>
      !!(library.p5._predefinedSpriteAnimations || {})[name];
    const missing = new Set();
    const warnMissing = name => {
      if (!missing.has(name)) {
        missing.add(name);
        console.warn(
          `SpriteLab2: no image named ${JSON.stringify(
            name
          )} in this project; the block asking for it does nothing.`
        );
      }
    };
    const addSprite = library.addSprite.bind(library);
    library.addSprite = opts => {
      if (opts && opts.animation && !knownCostume(opts.animation)) {
        warnMissing(opts.animation);
        return null;
      }
      return addSprite(opts);
    };
    const setAnimation = library.commands.setAnimation;
    library.commands.setAnimation = function (spriteArg, animation) {
      if (!knownCostume(animation)) {
        warnMissing(animation);
        return;
      }
      return setAnimation.call(this, spriteArg, animation);
    };
    library.commands.goToScene = sceneId => {
      if (!this.onGoToScene || !this.beginSceneJump_()) {
        return;
      }
      const id = String(sceneId);
      // Defer a tick: jumping tears down the interpreter this command runs in.
      setTimeout(() => this.onGoToScene && this.onGoToScene(id), 0);
    };
    // Through the jump gate, for its cover and fade. The quiet window is
    // what keeps a condition that still holds on the next frame from
    // restarting at frame rate.
    library.commands.restartScene = () => {
      const now = Date.now();
      if (now - this.lastRestartAt_ < RESTART_QUIET_MS) {
        return;
      }
      if (!this.onRestartScene || !this.beginSceneJump_()) {
        return;
      }
      this.lastRestartAt_ = now;
      setTimeout(() => this.onRestartScene && this.onRestartScene(), 0);
    };
    library.commands.goToExternalScene = sceneKey => {
      if (!this.onGoToExternalScene || !this.beginSceneJump_()) {
        return;
      }
      const key = String(sceneKey);
      setTimeout(
        () => this.onGoToExternalScene && this.onGoToExternalScene(key),
        0
      );
    };
    return library;
  }

  /**
   * Freeze the interpreted program until the new scene runs, so a "when
   * touching"-style trigger can't re-fire the jump every frame while the
   * target loads; draw keeps rendering the last frame under the fade.
   * Returns false if a jump is already in flight.
   */
  beginSceneJump_() {
    if (this.sceneJumpInFlight_) {
      return false;
    }
    this.sceneJumpInFlight_ = true;
    this.stopTickTimer();
    if (this.onSceneJumpStart) {
      this.onSceneJumpStart();
    }
    return true;
  }

  /**
   * A triggered jump can't complete (unknown scene, failed fetch); resume the
   * old scene. No-op when no jump is in flight.
   */
  cancelSceneJump() {
    if (!this.sceneJumpInFlight_) {
      return;
    }
    this.sceneJumpInFlight_ = false;
    if (this.p5Wrapper.p5 && !this.isTickTimerRunning()) {
      this.startTickTimer();
    }
    if (this.onSceneJumpCancel) {
      this.onSceneJumpCancel();
    }
  }

  /**
   * P5Lab.init() minus the StudioApp/project harness: level config, helper
   * libraries, p5 wiring.
   * @param {object} levelProperties
   * @returns {Promise}
   */
  async initForLevel(levelProperties = {}) {
    const avatarUrl = this.getAvatarUrl(levelProperties.instructionsIcon);
    this.skin = {
      smallStaticAvatar: avatarUrl,
      staticAvatar: avatarUrl,
      winAvatar: avatarUrl,
      failureAvatar: avatarUrl,
    };

    const helperLibraries = levelProperties.helperLibraries || [
      'NativeSpriteLab',
    ];
    // The zGameDev name is only the level's opt-in to platformer physics,
    // which is engine-owned (platformPhysics.ts); no library loads for it.
    this.usesPlatformPhysics_ = helperLibraries.includes('zGameDev');
    this.level = {
      helperLibraries: helperLibraries.filter(name => name !== 'zGameDev'),
      softButtons: [],
      // So the lab-owned blocks' helperCode is prepended like pool blocks'.
      sharedBlocks: [
        ...(levelProperties.sharedBlocks || []),
        ...SPRITELAB2_HELPER_CODE,
      ],
      customHelperLibrary: levelProperties.customHelperLibrary,
    };

    injectErrorHandler(
      new BlocklyModeErrorHandler(() => this.JSInterpreter, null)
    );

    this.p5Wrapper.init({
      gameLab: this,
      onExecutionStarting: this.onP5ExecutionStarting.bind(this),
      onPreload: this.onP5Preload.bind(this),
      onSetup: this.onP5Setup.bind(this),
      onDraw: this.onP5Draw.bind(this),
      spritelab: true,
    });

    await this.loadHelperLibraries(this.level.helperLibraries);
  }

  // Replicates StudioApp.loadLibrary_: source text stashed where
  // initInterpreter expects it.
  async loadHelperLibraries(names) {
    await Promise.all(
      (names || []).map(async name => {
        if (this.studioApp_.libraries[name]) {
          return;
        }
        const response = await HttpClient.get('/libraries/' + name);
        this.studioApp_.libraries[name] = await response.text();
      })
    );
  }

  setCode(code) {
    this.userCode = code || '';
  }

  sceneLooksLikePlatformer_() {
    const code = this.userCode || '';
    return PLATFORM_SCENE_MARKERS.some(marker => code.includes(marker));
  }

  /** Run the given compiled JS program from scratch (creates/recreates p5). */
  run(code) {
    if (code !== undefined) {
      this.setCode(code);
    }
    this.execute();
  }

  /**
   * Set the program and (re)run it as a live preview. First run creates p5
   * via execute(); after that it re-runs inside the existing p5 — recreating
   * p5 per edit flickers and races its own async preload callbacks.
   */
  runProgram(code) {
    if (code !== undefined) {
      this.setCode(code);
    }
    // A second execute() while the first's preload is pending crashes the
    // interpreter (getScope); defer and re-run with the latest code after.
    // The timestamp keeps an aborted run from wedging the engine.
    if (this.executeInFlight_ && Date.now() - this.executeStartedAt_ < 15000) {
      this.rerunAfterExecute_ = true;
      return;
    }
    if (this.p5Wrapper.p5 && !this.p5Wrapper.p5decrementPreload) {
      this.rerun();
    } else {
      this.executeInFlight_ = true;
      this.executeStartedAt_ = Date.now();
      this.execute();
    }
  }

  /**
   * @override
   * The base method reads the generator's nameDB_, which only exists after a
   * first init/workspaceToCode; if the engine's first run beats the Code tab
   * to compiling, it crashes and the playspace stays blank. Init the name DB
   * on a throwaway workspace first.
   */
  initInterpreter(attachDebugger) {
    if (!Blockly.JavaScript.nameDB_) {
      const scratch = new BlocklyCore.Workspace();
      try {
        Blockly.JavaScript.init(scratch);
      } finally {
        scratch.dispose();
      }
    }
    super.initInterpreter(attachDebugger);
  }

  /**
   * @override
   * p5's async preload can complete after a teardown left the interpreter
   * non-runnable; executing then crashes in getScope — skip. (runProgram
   * prevents overlap; this is the backstop.)
   */
  onP5Setup() {
    const interpreterRunnable =
      !this.JSInterpreter ||
      (this.JSInterpreter.initialized() &&
        this.JSInterpreter.interpreter.stateStack);
    if (!interpreterRunnable) {
      this.executeInFlight_ = false;
      return;
    }
    super.onP5Setup();
    const p5 = this.p5Wrapper.p5;
    const density = Math.ceil(
      CANVAS_DENSITY_FACTOR * (window.devicePixelRatio || 1)
    );
    if (p5 && p5._renderer && p5.pixelDensity() !== density) {
      p5.pixelDensity(density);
    }
    this.executeInFlight_ = false;
    if (this.rerunAfterExecute_) {
      this.rerunAfterExecute_ = false;
      this.rerun();
    }
  }

  /**
   * Re-run the current program inside the existing p5. Serialized through a
   * queue so overlapping re-runs can't interleave across the preload await.
   */
  rerun() {
    this.rerunQueue_ = (this.rerunQueue_ || Promise.resolve()).then(() =>
      this.doRerun_()
    );
    return this.rerunQueue_;
  }

  async doRerun_() {
    const p5 = this.p5Wrapper.p5;
    if (!p5) {
      this.execute();
      return;
    }
    // Preload images added since the initial execute() — the costume/
    // background commands silently no-op on unknown names. Already-loaded
    // entries are skipped and trims are cached, so re-runs are cheap.
    await this.p5Wrapper.preloadSpriteImages(
      await trimAnimationListImages(
        loadedAnimations(
          this.preloadAnimationsOverride || getStore().getState().animationList
        )
      )
    );
    p5.allSprites.removeSprites();
    // removeSprites destroyed the edge sprites too; clear the handle so the
    // next edgesCollide/edgesDisplace recreates them instead of colliding
    // against dead sprites.
    p5.edges = undefined;
    if (this.JSInterpreter) {
      this.JSInterpreter.deinitialize();
    }
    this.initInterpreter(false /* attachDebugger */);
    // p5 is reused across re-runs, so re-baseline the world clock — without
    // this, "at time N" events never fire again after the first run.
    if (this.library?.commands?.resetTimer) {
      this.library.commands.resetTimer.call(this.library);
    }
    // Clear the jump gate BEFORE onP5Setup: the new scene's "when run" may
    // legitimately trigger the next jump.
    const jumpLanded = this.sceneJumpInFlight_;
    this.sceneJumpInFlight_ = false;
    this.onP5Setup();
    this.p5Wrapper.setLoop(true);
    // Stay frozen if "when run" already triggered the next jump.
    if (!this.sceneJumpInFlight_ && !this.isTickTimerRunning()) {
      this.startTickTimer();
    }
    if (jumpLanded && this.onSceneJumpLand) {
      this.onSceneJumpLand();
    }
  }

  /** Stop execution. */
  resetRuntime() {
    this.reset();
  }

  destroy() {
    this.reset();
    this.stopTickTimer();
  }

  // Backgrounds come from the Items tab, not backgrounds.json — and the base
  // preloadBackgrounds() wedges p5 forever on a failed loadImage (the preload
  // count never decrements).
  preloadLabAssets() {
    return this.preloadTrimmedSpriteImages_();
  }

  /**
   * Wait for the project's images, but not forever: the store never marks an
   * image whose fetch failed, so after the grace period the run goes ahead
   * with what has loaded.
   */
  async whenAnimationsAreReadyOrGivenUp_() {
    let timer;
    const gaveUp = await Promise.race([
      this.whenAnimationsAreReady().then(() => false),
      new Promise(resolve => {
        timer = setTimeout(() => resolve(true), IMAGE_LOAD_GRACE_MS);
      }),
    ]);
    clearTimeout(timer);
    if (gaveUp) {
      const list = getStore().getState().animationList;
      const pending = list.orderedKeys
        .filter(key => !list.propsByKey[key]?.loadedFromSource)
        .map(key => list.propsByKey[key]?.name || key);
      console.warn(
        `SpriteLab2: ${pending.join(', ')} did not load within ` +
          `${IMAGE_LOAD_GRACE_MS / 1000}s; running without ` +
          `${pending.length === 1 ? 'it' : 'them'}. Check the Network tab ` +
          'for failing asset requests.'
      );
    }
  }

  // Base preloadSpriteImages_ with costume border-trimming (imageTrim.ts);
  // an image with no data would only make p5 log an error.
  async preloadTrimmedSpriteImages_() {
    await this.whenAnimationsAreReadyOrGivenUp_();
    return this.p5Wrapper.preloadSpriteImages(
      await trimAnimationListImages(
        loadedAnimations(getStore().getState().animationList)
      )
    );
  }

  /**
   * CoreLibrary's draw loop with the set-zoom camera folded in (platform
   * levels only; the stock loop runs elsewhere). Zoom is render-only: sprites
   * keep world coordinates and the physics keeps the canvas-sized world.
   *
   * p5.play activates its camera around the whole draw cycle (identity until
   * a set-zoom block runs). The pre-draw hook pushed last frame's transform,
   * so the loop re-pushes with this frame's values, splitting the frame into
   * a screen-space background pass (its own harder zoom and half-rate pan —
   * the parallax), a camera pass for world content (sprites and their speech
   * bubbles), and a screen-space HUD pass (variable bubbles, effects, title).
   */
  installZoomedDrawLoop_(library) {
    const engine = this;
    library.commands.executeDrawLoopAndCallbacks = function () {
      const p5 = this.p5;
      const camera = p5.camera;
      engine.cameraZoom_ = stepZoom(
        engine.cameraZoom_,
        engine.cameraZoomTarget_
      );
      const zoom = engine.cameraZoom_;
      // p5.play's own mouse translation ignores zoom. From last frame's
      // camera, as p5.play's own hook does.
      const mouse = worldPoint({x: p5.mouseX, y: p5.mouseY}, zoom, {
        x: camera.position.x,
        y: camera.position.y,
      });
      camera.mouseX = mouse.x;
      camera.mouseY = mouse.y;
      this.runBehaviors();
      this.runEvents();
      // Resolve before framing the shot: mid-fall the player is still inside
      // the platform it is about to land on, and framing that position paints
      // the scene a few pixels out for one frame.
      engine.resolvePlatformPhysics_();
      engine.physicsResolvedThisFrame_ = true;
      const player = this.getSpriteArray({group: 'players'})[0];
      const focus = cameraFocus(zoom, player ? player.position : null);
      camera.off();
      this.drawBackground(backgroundFrame(zoom, focus));
      camera.zoom = zoom;
      camera.position.x = focus.x;
      camera.position.y = focus.y;
      camera.on();
      p5.drawSprites();
      this.drawSpeechBubbles();
      camera.off();
      this.drawVariableBubbles();
      if (!this.isPreviewFrame()) {
        this.foregroundEffects.forEach(effect => effect.func());
      }
      if (this.screenText.title || this.screenText.subtitle) {
        this.commands.drawTitle.apply(this);
      }
      this.commands.drawStoryLabText.apply(this);
    };
  }

  // Platformer physics for players (see platformPhysics.ts for the rules),
  // run immediately before every paint — after p5's pre-phase velocity
  // integration and after this frame's behaviors/events have moved
  // sprites. Program-driven (non-player) sprites keep the stock resolver.
  resolvePlatformPhysics_() {
    if (!this.usesPlatformPhysics_ || !this.library || !this.p5Wrapper.p5) {
      return;
    }
    const p5 = this.p5Wrapper.p5;
    // Snapshot player positions before the stock pass below: the movement
    // reconstruction must not see its shove.
    const moved = this.library
      .getSpriteArray({group: 'players'})
      .map(sprite => ({
        sprite,
        x: sprite.position.x,
        y: sprite.position.y,
      }));
    // Non-player sprites keep the stock resolver; running it pre-paint
    // means patrollers and props draw already resolved.
    this.library.commands.collide.call(
      this.library,
      'collide',
      {group: ''},
      {group: 'walls'}
    );
    resolvePlatformPhysics(
      moved,
      this.library.getSpriteArray({group: 'walls'}),
      {
        width: p5.width,
        height: p5.height,
      },
      this.platformGravity_
    );
  }

  // The resolution must run after this frame's behaviors/events but before
  // the paint; the only seam with that timing is the paint call itself.
  wrapDrawSpritesOnce_() {
    const p5 = this.p5Wrapper.p5;
    if (!p5 || p5.__slab2ResolvesBeforePaint) {
      return;
    }
    p5.__slab2ResolvesBeforePaint = true;
    const paint = p5.drawSprites.bind(p5);
    p5.drawSprites = (...args) => {
      // The zoomed loop resolves earlier, to frame the shot on where sprites
      // end up.
      if (!this.physicsResolvedThisFrame_) {
        this.resolvePlatformPhysics_();
      }
      this.physicsResolvedThisFrame_ = false;
      return paint(...args);
    };
  }

  onP5Draw() {
    this.wrapDrawSpritesOnce_();
    super.onP5Draw();
  }

  // --- Overrides that sever the global studioApp() singleton ---

  // The base class surfaces execution errors via StudioApp workspace alerts;
  // log loudly instead — an execution error halts the program and would
  // otherwise read as a silently blank playspace.
  reactToExecutionError(msg) {
    console.error('SpriteLab2 execution error (program halted):', msg);
  }
  clearExecutionErrorWorkspaceAlert() {}

  // Classic reset() ends with preview(), re-launching the engine right after
  // teardown — a stale preload callback then fires on the discarded
  // interpreter. Reset just stops; runProgram is the only launcher.
  preview() {}
}
