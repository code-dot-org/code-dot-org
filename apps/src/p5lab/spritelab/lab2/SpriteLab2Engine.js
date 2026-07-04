import * as BlocklyCore from 'blockly/core';

import BlocklyModeErrorHandler from '@cdo/apps/BlocklyModeErrorHandler';
import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import {getStore} from '@cdo/apps/redux';

import SpriteLab from '../SpriteLab';

const NOOP = () => {};

/**
 * A stand-in for the StudioApp singleton.
 *
 * The classic p5.play engine (P5Lab/SpriteLab) was built to be driven by
 * StudioApp: it reads the compiled program from studioApp.getCode(), asks it
 * about empty/duplicate blocks before running, and hands it to the
 * JSInterpreter. In Lab2 we own the Blockly workspace and the project lifecycle
 * ourselves, so we satisfy exactly those touch points and nothing else.
 *
 * Coupling points covered (see P5Lab.js execute()/initInterpreter() and
 * JSInterpreter.js): getCode is the program injection seam; hideSource/editor/
 * editCode keep the interpreter off the (nonexistent) droplet/ace editor; the
 * hasUnwanted... and clearAndAttach... stubs let the inherited execute() run
 * unchanged.
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

// We don't render the on-screen dpad/space controls, but the engine's reset
// path calls into mobileControls; a no-op satisfies it without the dpad DOM.
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
    // Scenes UI variant: the view sets these to handle the go-to-scene and
    // go-to-external-scene blocks (it compiles the target scene and re-runs
    // the program).
    this.onGoToScene = null;
    this.onGoToExternalScene = null;
    // When set, the next re-runs preload from this serialized animation list
    // instead of the project's own (used while running an external project's
    // scenes, whose images live in their animation list).
    this.preloadAnimationsOverride = null;
    // Guards against overlapping execute() calls (see runProgram/onP5Setup).
    this.executeInFlight_ = false;
    this.executeStartedAt_ = 0;
    this.rerunAfterExecute_ = false;
  }

  /**
   * @override
   * Add the scene-jump command to the library. initInterpreter exposes every
   * library command as an interpreter global, so the go-to-scene block's
   * generated `goToScene("id")` lands here. A fresh library is created on every
   * (re)run, which is also what clears the background and input events between
   * scenes.
   */
  createLibrary(args) {
    const library = super.createLibrary(args);
    library.commands.goToScene = sceneId => {
      if (!this.onGoToScene) {
        return;
      }
      const id = String(sceneId);
      // Defer a tick: this command runs inside the interpreter, and jumping
      // scenes tears the interpreter down. Don't saw off the branch mid-step.
      setTimeout(() => this.onGoToScene && this.onGoToScene(id), 0);
    };
    library.commands.goToExternalScene = sceneKey => {
      if (!this.onGoToExternalScene) {
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
   * Minimal replacement for P5Lab.init() that skips the StudioApp/project
   * harness. Sets up the level config the run path reads, fetches helper
   * libraries (e.g. NativeSpriteLab) the interpreter prepends to user code, and
   * wires p5.
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
    this.level = {
      helperLibraries,
      softButtons: [],
      sharedBlocks: levelProperties.sharedBlocks || [],
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

  // Replicates StudioApp.loadLibrary_: helper-library source is fetched as text
  // and stashed where initInterpreter expects it (studioApp_.libraries[name]).
  async loadHelperLibraries(names) {
    await Promise.all(
      (names || []).map(async name => {
        if (this.studioApp_.libraries[name]) {
          return;
        }
        const response = await fetch('/libraries/' + name);
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
   * Set the program and (re)run it as a live preview. The first time this
   * creates the p5 instance via execute(); afterwards it re-runs inside the
   * existing p5 (rerun) so we don't tear down and recreate p5 on every code
   * edit — which both avoids flicker and the stale-preload-callback race that
   * destroying p5 mid-cycle causes.
   */
  runProgram(code) {
    if (code !== undefined) {
      this.setCode(code);
    }
    // While the initial execute()'s async preload is pending, a second
    // execute() would tear down state the pending preload callback still
    // runs against (crashing in the interpreter's getScope). Defer: the
    // in-flight run completes, then re-runs with the latest code. The
    // timestamp is a safety valve so a run that never completes (e.g. a
    // parse failure aborted it) can't wedge the engine.
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
   * P5Lab.initInterpreter registers command names in the Blockly generator's
   * reserved-word list, but the generator's nameDB_ only exists after its
   * first init/workspaceToCode. If the engine's first run beats the Code tab
   * to compiling anything (a page-load timing race), initInterpreter crashes
   * on nameDB_.reservedWords and the swallowed execution error leaves the
   * playspace permanently blank. Initialize the name DB against a throwaway
   * headless workspace first.
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
   * Runs when p5's preload phase completes — possibly long after the run that
   * started it, and (because preload is async) possibly after a teardown left
   * the interpreter non-runnable. Executing then crashes in the interpreter's
   * getScope; skip instead. Overlap is also prevented in runProgram — this is
   * the backstop.
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
   * Re-run the current program inside the already-created p5 instance: refresh
   * preloaded images, clear sprites, rebuild the interpreter with the latest
   * code, re-run setup, and keep the draw loop going. Serialized through a
   * queue so overlapping re-runs (rapid edits, scene jumps) can't interleave
   * across the preload await.
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
    // p5 only preloads project images during the initial execute(); an image
    // generated since then isn't in p5._predefinedSpriteAnimations, and the
    // costume/background commands silently no-op on unknown names (e.g. a
    // scene jump to a "set background" of a new image rendered white). The
    // preload helper skips entries whose dataURI is already loaded, so this
    // only fetches what's new. External scenes preload from their own
    // project's animation list instead.
    await this.p5Wrapper.preloadSpriteImages(
      this.preloadAnimationsOverride || getStore().getState().animationList
    );
    p5.allSprites.removeSprites();
    if (this.JSInterpreter) {
      this.JSInterpreter.deinitialize();
    }
    this.initInterpreter(false /* attachDebugger */);
    // The classic engine builds a fresh p5 per run, so CoreLibrary's world-
    // timer baseline of 0 is correct there. We reuse p5 across re-runs, where
    // the world clock keeps counting — without a re-baseline, "at time N"
    // events can never fire again after the first run. Reset (same as the
    // reset-timer block) so N means "into this run" — and for scene jumps,
    // "into this scene".
    if (this.library?.commands?.resetTimer) {
      this.library.commands.resetTimer.call(this.library);
    }
    this.onP5Setup();
    this.p5Wrapper.setLoop(true);
    if (!this.isTickTimerRunning()) {
      this.startTickTimer();
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

  // SpriteLab2 doesn't use the classic fixed background set (backgrounds.json);
  // backgrounds come from the Items tab. Skip the base class's
  // preloadBackgrounds() and only preload the project's own sprite images. This
  // also avoids a p5 preload-count leak: a failed loadImage() during preload
  // (e.g. a background asset 404) never decrements p5._preloadCount, leaving the
  // engine stuck in the preload phase forever.
  preloadLabAssets() {
    // Preload wedges are invisible (the playspace just stays an empty box):
    // whenAnimationsAreReady() waits for every animation's image fetch, and a
    // single failed asset never resolves it. Surface what it's stuck on.
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
    return this.preloadSpriteImages_().finally(() => clearTimeout(watchdog));
  }

  // --- Overrides that sever the global studioApp() singleton ---

  // Sprite Lab has no user-facing console, so the base class surfaces execution
  // errors via a StudioApp workspace alert. We have no StudioApp; log loudly
  // instead — the injected error handler's own log lands in a collapsed
  // console group that's easy to miss, and an execution error here halts the
  // program (a silently blank playspace otherwise).
  reactToExecutionError(msg) {
    console.error('SpriteLab2 execution error (program halted):', msg);
  }
  clearExecutionErrorWorkspaceAlert() {}

  // The classic SpriteLab.reset() ends by calling preview() to render a static
  // first frame. In the tabbed Lab2 UI we don't want a reset to re-launch the
  // engine: doing so re-creates p5 and re-runs the interpreter right after
  // teardown, and a stale async preload callback from the program that was just
  // stopped then fires executeInterpreter on the discarded interpreter
  // ("Uncaught (in promise) ... getScope"). Reset should simply stop; Run is
  // the only thing that launches execution. So preview() is a no-op here.
  preview() {}
}
