import * as BlocklyCore from 'blockly/core';

import BlocklyModeErrorHandler from '@cdo/apps/BlocklyModeErrorHandler';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';

import SpriteLab from '../SpriteLab';

import {SPRITELAB2_HELPER_CODE} from './blockly/blockDefinitions';
import {trimAnimationListImages} from './imageTrim';

const NOOP = () => {};

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
// Max downward speed (px/frame) for platformer players; see
// resolvePlatformPhysics_.
const TERMINAL_FALL_SPEED = 10;

// Slack (px) for "was on the clear side of this face last frame" tests in
// resolvePlatformPhysics_: resting contact is exact equality, and the stock
// resolver can leave sub-pixel noise on it.
const CONTACT_EPSILON = 0.1;

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
  }

  /**
   * @override
   * Adds the scene-jump commands (exposed as interpreter globals). A fresh
   * library per (re)run is also what clears background/input events between
   * scenes.
   */
  createLibrary(args) {
    const library = super.createLibrary(args);
    // Platformer players get a physics collider narrower than their art, so
    // characters that visibly fit through a gap actually fit (a wingspan's
    // corners are transparent). Width only: the grounded checks measure the
    // image box, so the collider's height and feet must match it.
    library.commands.setColliderWidth = function (spriteArg, fraction) {
      this.getSpriteArray(spriteArg).forEach(sprite => {
        sprite.setCollider(
          'rectangle',
          0,
          0,
          sprite.width * fraction,
          sprite.height
        );
      });
    };
    library.commands.goToScene = sceneId => {
      if (!this.onGoToScene || !this.beginSceneJump_()) {
        return;
      }
      const id = String(sceneId);
      // Defer a tick: jumping tears down the interpreter this command runs in.
      setTimeout(() => this.onGoToScene && this.onGoToScene(id), 0);
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
    this.usesPlatformPhysics_ = helperLibraries.includes('zGameDev');
    this.level = {
      helperLibraries,
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

    await this.loadHelperLibraries(helperLibraries);
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
        this.preloadAnimationsOverride || getStore().getState().animationList
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
    // A single failed image never resolves whenAnimationsAreReady, and the
    // wedge is invisible; surface what it's stuck on.
    const watchdog = setTimeout(() => {
      const list = getStore().getState().animationList;
      const pending = list.orderedKeys
        .filter(key => !list.propsByKey[key]?.loadedFromSource)
        .map(key => list.propsByKey[key]?.name || key);
      if (pending.length) {
        console.warn(
          'SpriteLab2: still waiting on animation image loads after 8s:',
          pending.join(', '),
          '— check the Network tab for failing asset requests.'
        );
      }
    }, 8000);
    return this.preloadTrimmedSpriteImages_().finally(() =>
      clearTimeout(watchdog)
    );
  }

  // Base preloadSpriteImages_ with costume border-trimming (imageTrim.ts).
  async preloadTrimmedSpriteImages_() {
    await this.whenAnimationsAreReady();
    return this.p5Wrapper.preloadSpriteImages(
      await trimAnimationListImages(getStore().getState().animationList)
    );
  }

  // Platformer collision resolution for players, run immediately before
  // every paint — after p5's pre-phase velocity integration AND after this
  // frame's behaviors/events have moved sprites. One rule, applied per axis:
  // reconstruct the frame's movement from the last resolved position, apply
  // the horizontal part and resolve horizontally, then the vertical part and
  // resolve vertically. A wall face only blocks if the player was on its
  // clear side last frame (swept, not overlap: a two-row-tall player whose
  // head brushes a head-height block must not be teleported on top of it).
  // Downward crossings land, upward crossings stop under the block; corners
  // behave (a rising player can't be snapped onto a lip, a head-clip can't
  // shove sideways). Program-driven sprites keep the stock resolver.
  resolvePlatformPhysics_() {
    if (!this.usesPlatformPhysics_ || !this.library || !this.p5Wrapper.p5) {
      return;
    }
    const p5 = this.p5Wrapper.p5;
    // zGameDev's edge pass bounces players off the top of the canvas; this
    // lab keeps the top open (a jump may carry above the screen — gravity
    // brings the player back), so park the top edge sprite out of reach.
    if (p5.topEdge && p5.topEdge.position.y > -1000) {
      p5.topEdge.position.y -= 10000;
    }
    const players = this.library.getSpriteArray({group: 'players'});
    // Snapshot player positions before the stock pass below: the swept
    // resolution reconstructs each player's frame movement as
    // (position − last resolved position), and the stock resolver's shove
    // would corrupt that.
    const moved = players.map(sprite => ({
      sprite,
      x: sprite.position.x,
      y: sprite.position.y,
    }));
    // Non-player sprites keep the stock resolver; running it pre-paint means
    // patrollers and props draw already resolved.
    this.library.commands.collide.call(
      this.library,
      'collide',
      {group: ''},
      {group: 'walls'}
    );
    const walls = this.library.getSpriteArray({group: 'walls'});
    moved.forEach(({sprite, x: curX, y: curY}) => {
      const imgHalfW = (sprite.width * sprite.scale) / 2;
      const imgHalfH = (sprite.height * sprite.scale) / 2;
      // Physics width comes from the (narrowed) collider; height is always
      // the image box, which the grounded checks measure.
      const halfW = sprite.collider
        ? (sprite.collider._width * sprite._getScaleX()) / 2
        : imgHalfW;
      const halfH = imgHalfH;
      const prev = sprite.__slab2Prev || {x: curX, y: curY};
      const dx = curX - prev.x;
      const dy = curY - prev.y;
      let x = prev.x + dx;
      let y = prev.y;
      walls.forEach(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        if (
          Math.abs(y - wall.position.y) >= halfH + wallHalfH ||
          Math.abs(x - wall.position.x) >= halfW + wallHalfW
        ) {
          return;
        }
        if (
          dx > 0 &&
          prev.x + halfW <= wall.position.x - wallHalfW + CONTACT_EPSILON
        ) {
          x = Math.min(x, wall.position.x - wallHalfW - halfW);
        } else if (
          dx < 0 &&
          prev.x - halfW >= wall.position.x + wallHalfW - CONTACT_EPSILON
        ) {
          x = Math.max(x, wall.position.x + wallHalfW + halfW);
        }
      });
      // Side containment uses the image box so the art stays on screen; the
      // top is open on purpose — a jump may carry above the screen, gravity
      // brings the player back.
      x = Math.min(Math.max(x, imgHalfW), p5.width - imgHalfW);
      y = prev.y + dy;
      walls.forEach(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        if (
          Math.abs(x - wall.position.x) >= halfW + wallHalfW ||
          Math.abs(y - wall.position.y) >= halfH + wallHalfH
        ) {
          return;
        }
        if (
          dy > 0 &&
          prev.y + halfH <= wall.position.y - wallHalfH + CONTACT_EPSILON
        ) {
          y = Math.min(y, wall.position.y - wallHalfH - halfH);
          sprite.velocity.y = 0;
        } else if (
          dy < 0 &&
          prev.y - halfH >= wall.position.y + wallHalfH - CONTACT_EPSILON
        ) {
          y = Math.max(y, wall.position.y + wallHalfH + halfH);
          sprite.velocity.y = 0;
        }
      });
      // The bottom clamp sits the image bottom exactly on the floor line, so
      // hasSupportAt's floor branch holds and the player can jump from pits.
      if (y > p5.height - imgHalfH) {
        y = p5.height - imgHalfH;
        sprite.velocity.y = 0;
      }
      // Cap fall speed: a single frame's step must stay small enough that a
      // falling sprite can't pass a block corner between frames.
      if (sprite.velocity.y > TERMINAL_FALL_SPEED) {
        sprite.velocity.y = TERMINAL_FALL_SPEED;
      }
      sprite.position.x = x;
      sprite.position.y = y;
      sprite.__slab2Prev = {x, y};
    });
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
      this.resolvePlatformPhysics_();
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
