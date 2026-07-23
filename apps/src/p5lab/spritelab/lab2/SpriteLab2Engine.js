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

// The squeeze band (px): a face engaged thinner than this on the
// perpendicular axis doesn't block, and the leftover thin penetration
// resolves along its shallow axis at the end of the pass. One-cell notches
// and doorways are exactly player-sized in these maps, so without a band
// there is zero clearance to enter them; p5.play's min-axis resolution
// allowed the squeeze implicitly.
const MIN_SOLID_OVERLAP = 8;

// The player's solid body is the art box scaled by this factor, anchored at
// the feet. A default-size (50px) costume gets a 40px body, so every
// costume shape fits a one-cell opening with clearance to spare; art
// outside the body overhangs walls cosmetically. The size block scales art
// and body together, so an explicitly enlarged sprite outgrows standard
// gaps — on purpose.
const PLAYER_BODY_SCALE = 0.8;

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
  //
  // Three feel rules refine the crossings: footing is kept generously
  // (until the collider leaves the block) but gained strictly (center over
  // the surface — corner grazes slide off); faces engaged thinner than the
  // squeeze band don't block, so exact-fit openings are enterable; and the
  // final de-penetration settles thin overlap along its shallow axis.
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
    const moved = players.map(sprite => {
      this.syncPlayerBodyCollider_(sprite);
      return {sprite, x: sprite.position.x, y: sprite.position.y};
    });
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
      const halfW = imgHalfW * PLAYER_BODY_SCALE;
      const halfH = imgHalfH * PLAYER_BODY_SCALE;
      // The resolution runs on the feet-anchored body box: y here is the
      // BODY center, `drop` below the sprite's image center. The feet
      // anchor keeps body bottom == image bottom, which the grounded
      // checks (image box, exact equality on the support line) measure.
      const drop = imgHalfH - halfH;
      const stored = sprite.__slab2Prev || {x: curX, y: curY};
      const prev = {x: stored.x, y: stored.y + drop};
      const dx = curX - prev.x;
      const dy = curY + drop - prev.y;
      let x = prev.x + dx;
      let y = prev.y;
      walls.forEach(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        // A face engaged thinner than the squeeze band vertically doesn't
        // block sideways movement; the de-penetration pass below settles
        // whatever thin overlap results.
        if (
          halfH + wallHalfH - Math.abs(y - wall.position.y) <
            MIN_SOLID_OVERLAP ||
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
      // Pressed against a face last frame? The swept clamps pin at exact
      // contact, so an epsilon test on the face line is reliable. A pressed
      // player's landings and bonks are generous below: entering an opening
      // in the face necessarily starts with only one step's worth of
      // overlap, and the strict center rule would eject what the squeeze
      // band just let in — the source of "misses the gap most of the time".
      const wasPressed = walls.some(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        return (
          Math.abs(Math.abs(prev.x - wall.position.x) - (halfW + wallHalfW)) <=
            CONTACT_EPSILON &&
          halfH + wallHalfH - Math.abs(prev.y - wall.position.y) > 0
        );
      });
      // Purely vertical motion is stable: whatever the player is directly
      // over or under, they land on or bonk against — no corner
      // arbitration, no sideways correction. A jump straight up from a
      // spot retention allowed (standing past a block's edge) comes back
      // down to that same spot, and a head bonk never shoves sideways. The
      // strict clauses below only arbitrate corners reached with
      // horizontal movement — the gap-crossing case they exist for.
      const vertical = Math.abs(dx) <= CONTACT_EPSILON;
      walls.forEach(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        if (
          Math.abs(x - wall.position.x) >= halfW + wallHalfW ||
          Math.abs(y - wall.position.y) >= halfH + wallHalfH
        ) {
          return;
        }
        const top = wall.position.y - wallHalfH;
        const centerOn = Math.abs(x - wall.position.x) <= wallHalfW;
        // Crossing tolerance is the squeeze band, not mere contact: a
        // player who slipped sideways through the band arrives with feet
        // already a few px past the face and must still be caught here —
        // de-penetration would see the fall-deepened overlap and eject
        // them sideways instead.
        if (dy > 0 && prev.y + halfH <= top + MIN_SOLID_OVERLAP) {
          // Footing is kept generously but gained strictly: a player
          // already resting on this block keeps it until the collider
          // fully leaves (a jump from the outer edge still works), while
          // one arriving from open air lands only once their center is
          // over it — a corner graze slides off via de-penetration instead
          // (else one-cell gaps are unenterable: the feet almost always
          // graze a neighbor's corner as they cross the top line).
          const wasResting =
            Math.abs(prev.y + halfH - top) <= CONTACT_EPSILON &&
            Math.abs(prev.x - wall.position.x) < halfW + wallHalfW;
          if (vertical || centerOn || wasResting || wasPressed) {
            y = Math.min(y, top - halfH);
            sprite.velocity.y = 0;
          }
        } else if (
          dy < 0 &&
          prev.y - halfH >= wall.position.y + wallHalfH - MIN_SOLID_OVERLAP &&
          (vertical || centerOn || wasPressed)
        ) {
          y = Math.max(y, wall.position.y + wallHalfH + halfH);
          sprite.velocity.y = 0;
        }
      });
      // The bottom clamp sits the feet exactly on the floor line, so
      // hasSupportAt's floor branch holds and the player can jump from pits.
      if (y > p5.height - halfH) {
        y = p5.height - halfH;
        sprite.velocity.y = 0;
      }
      // De-penetration: settle what the gates left overlapping. A crossing
      // the gates declined (center past the edge) slides off the corner
      // sideways; other thin penetration — squeeze-band drift, a lip
      // grazed on the way up — resolves along its shallow axis. dx per
      // frame is smaller than the band, so overlap entered from a clear
      // side always resolves; deep overlap (a sprite spawned inside a
      // wall) is left for the program to sort out.
      walls.forEach(wall => {
        const wallHalfW = (wall.width * wall.scale) / 2;
        const wallHalfH = (wall.height * wall.scale) / 2;
        const penX = halfW + wallHalfW - Math.abs(x - wall.position.x);
        const penY = halfH + wallHalfH - Math.abs(y - wall.position.y);
        if (penX <= 0 || penY <= 0) {
          return;
        }
        const crossed =
          y < wall.position.y
            ? dy > 0 &&
              prev.y + halfH <= wall.position.y - wallHalfH + CONTACT_EPSILON
            : dy < 0 &&
              prev.y - halfH >= wall.position.y + wallHalfH - CONTACT_EPSILON;
        if (crossed) {
          x += x < wall.position.x ? -penX : penX;
        } else if (penY <= MIN_SOLID_OVERLAP && penY <= penX) {
          if (y < wall.position.y) {
            y -= penY;
            // Keep upward speed: popping onto a lip must not cancel a jump.
            sprite.velocity.y = Math.min(sprite.velocity.y, 0);
          } else {
            y += penY;
            sprite.velocity.y = Math.max(sprite.velocity.y, 0);
          }
        } else if (penX <= MIN_SOLID_OVERLAP) {
          x += x < wall.position.x ? -penX : penX;
        }
      });
      // Cap fall speed: a single frame's step must stay small enough that a
      // falling sprite can't pass a block corner between frames.
      if (sprite.velocity.y > TERMINAL_FALL_SPEED) {
        sprite.velocity.y = TERMINAL_FALL_SPEED;
      }
      sprite.position.x = x;
      sprite.position.y = y - drop;
      sprite.__slab2Prev = {x, y: y - drop};
    });
  }

  // The stock passes (zGameDev's post-paint collide and the edge pass) must
  // agree with the resolver about the player's solid body, or they shove a
  // player back out of an opening the resolver let them enter. Collider
  // dimensions are unscaled local px; the +y offset anchors the box at the
  // feet.
  syncPlayerBodyCollider_(sprite) {
    const key = sprite.width + ':' + sprite.height + ':' + sprite.scale;
    if (sprite.__slab2BodyKey === key) {
      return;
    }
    sprite.__slab2BodyKey = key;
    sprite.setCollider(
      'rectangle',
      0,
      (sprite.height * (1 - PLAYER_BODY_SCALE)) / 2,
      sprite.width * PLAYER_BODY_SCALE,
      sprite.height * PLAYER_BODY_SCALE
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
