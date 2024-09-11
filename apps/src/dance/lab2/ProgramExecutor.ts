import CustomMarshalingInterpreter from '@cdo/apps/code-studio/tools/jsinterpreter/CustomMarshalingInterpreter';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';

import {ASSET_BASE} from '../constants';
import * as danceMsg from '../locale';
import {SongMetadata} from '../types';
import utils from '../utils';

// TODO: The Dance Party repo currently does not export types, so we need
// use require() to import these components. We should add declaration files
// to the Dance Party repo and switch to using import statements.
const DanceAPI = require('@code-dot-org/dance-party/src/api');
const DanceParty = require('@code-dot-org/dance-party/src/p5.dance');
const danceCode = require('@code-dot-org/dance-party/src/p5.dance.interpreted.js');
const ResourceLoader = require('@code-dot-org/dance-party/src/ResourceLoader');

type HookName = 'runUserSetup' | 'runUserEvents' | 'getCueList';
type Handler = {code: string; args?: string[]};
const allEvents: {[name in HookName]: Handler} = {
  runUserSetup: {code: 'runUserSetup();'},
  runUserEvents: {code: 'runUserEvents(events);', args: ['events']},
  getCueList: {code: 'return getCueList();'},
};

/**
 * Handles program execution for Dance Party and wraps the native Dance Party API.
 *
 * TODO: Currently only used by Lab2 Dance. Can we share with Dance.js?
 */
export default class ProgramExecutor {
  private readonly nativeAPI: typeof DanceParty;
  private readonly metricsReporter: LabMetricsReporter;
  private hooks: {[name in HookName]?: (args?: unknown[]) => unknown};
  private validationCode?: string;
  private onEventsChanged?: () => void;

  private livePreviewActive = false;
  private currentlyPlayingSong: string | null = null;

  constructor(
    container: string,
    onPuzzleComplete: (result: boolean, message: string) => void,
    isReadOnlyWorkspace: boolean,
    recordReplayLog: boolean,
    metricsReporter: LabMetricsReporter,
    customHelperLibrary?: string,
    validationCode?: string,
    onEventsChanged?: () => void,
    readonlyCode?: string, // Allows us to supply the student code early if we're in a read-only workspace.
    nativeAPI: typeof DanceParty = undefined // For testing
  ) {
    this.hooks = {};
    this.validationCode = validationCode;
    this.onEventsChanged = onEventsChanged;
    this.nativeAPI =
      nativeAPI ||
      new DanceParty({
        onPuzzleComplete,
        playSound: this.playSong,
        recordReplayLog,
        showMeasureLabel: !isReadOnlyWorkspace,
        onHandleEvents: (currentFrameEvents: object[]) =>
          this.handleEvents(currentFrameEvents),
        onInit: async (nativeAPI: typeof DanceParty) => {
          this.init(nativeAPI, isReadOnlyWorkspace, readonlyCode);
        },
        spriteConfig: new Function('World', customHelperLibrary || ''),
        container,
        i18n: danceMsg,
        resourceLoader: new ResourceLoader(ASSET_BASE),
        logger: metricsReporter,
      });
    this.metricsReporter = metricsReporter;
  }

  /**
   * Execute the program. Compiles student code and hands off to the native API to run.
   */
  async execute(code: string, songMetadata: SongMetadata) {
    // TODO: Dance.js checks for unwanted top blocks and duplicate variables in for loops
    // before executing. We should do something similar here.

    this.hooks = await this.compileAllCode(code);
    if (!this.hooks.runUserSetup || !this.hooks.getCueList) {
      this.reportMissingHooks('runUserSetup', 'getCueList');
      return;
    }

    this.hooks.runUserSetup();
    const timestamps = this.hooks.getCueList();
    this.nativeAPI.addCues(timestamps);

    if (this.validationCode) {
      this.nativeAPI.registerValidation(
        utils.getValidationCallback(this.validationCode)
      );
    }

    return new Promise<void>((resolve, reject) => {
      this.nativeAPI.play(songMetadata, (success: boolean) => {
        success ? resolve() : reject();
      });
    });
  }

  /**
   * Show a static preview of the program. Compiles student code and calls on the native API to draw a frame.
   */
  async staticPreview(code: string) {
    this.reset();
    this.hooks = await this.preloadSpritesAndCompileCode(code, 'runUserSetup');
    if (!this.hooks.runUserSetup) {
      this.reportMissingHooks('runUserSetup');
      return;
    }

    const previewDraw = () => {
      this.nativeAPI.setEffectsInPreviewMode(true);

      // the user setup hook initializes effects,
      // needs to happen in preview mode for some effects (eg, tacos)
      if (!this.hooks.runUserSetup) {
        return;
      }
      this.hooks.runUserSetup();

      // redraw() (rather than draw()) is p5's recommended way
      // of drawing once.
      this.nativeAPI.p5_.redraw();

      this.nativeAPI.setEffectsInPreviewMode(false);
    };

    // This is the mechanism p5 uses to queue draws,
    // so we do the same so we end up after any queued draws.
    window.requestAnimationFrame(previewDraw);
  }

  /**
   * Show a live preview of the program. Compiles student code and calls on the native API to run the live preview.
   */
  async startLivePreview(
    code: string,
    songMetadata: SongMetadata,
    durationMs?: number
  ) {
    this.reset();
    this.livePreviewActive = true;
    await this.updateLivePreview(code, songMetadata, durationMs);
  }

  /**
   * Update the currently playing live preview.
   */
  async updateLivePreview(
    code: string,
    songMetadata: SongMetadata,
    durationMs?: number
  ) {
    if (!this.livePreviewActive) {
      console.warn('Update live preview called before starting live preview');
      return;
    }
    this.hooks = await this.preloadSpritesAndCompileCode(code, 'runUserSetup');

    if (!this.hooks.runUserSetup) {
      this.reportMissingHooks('runUserSetup');
      return;
    }

    this.hooks.runUserSetup();
    this.nativeAPI.livePreview(
      utils.getSongMetadataForPreview(songMetadata),
      durationMs
    );
  }

  isLivePreviewRunning() {
    return this.livePreviewActive;
  }

  reset() {
    // Only stop audio if this executor had started playing a song.
    if (this.currentlyPlayingSong) {
      audioCommands.stopSound({url: this.currentlyPlayingSong});
      this.currentlyPlayingSong = null;
    }
    this.nativeAPI.reset();
    this.livePreviewActive = false;
  }

  getReplayLog() {
    return this.nativeAPI.getReplayLog();
  }

  destroy() {
    this.reset();
    this.nativeAPI.teardown();
  }

  private async compileAllCode(studentCode: string) {
    return this.preloadSpritesAndCompileCode(
      studentCode,
      'runUserSetup',
      'getCueList',
      'runUserEvents'
    );
  }

  /**
   * Prepares student code for execution. Preloads any sprites referenced in the code
   * and compiles the program.
   *
   * @param code student code
   * @param eventNames events to generate hooks for
   * @returns Generated hooks for the compiled code.
   */
  private async preloadSpritesAndCompileCode(
    code: string,
    ...eventNames: HookName[]
  ) {
    const charactersReferenced = utils.computeCharactersReferenced(code);
    await this.nativeAPI.ensureSpritesAreLoaded(charactersReferenced);

    const events: {[event in HookName]?: Handler} = {};
    eventNames.forEach(name => {
      events[name] = allEvents[name];
    });

    const nativeAPI = this.nativeAPI;
    const api = new DanceAPI(nativeAPI);

    const fullCode = danceCode + code;

    const hooks: {[name: string]: (args?: unknown[]) => unknown} = {};

    CustomMarshalingInterpreter.evalWithEvents(
      api,
      events,
      fullCode,
      undefined
    ).hooks.forEach(hook => {
      hooks[hook.name] = hook.func as () => unknown;
    });

    return hooks;
  }

  private async init(
    nativeAPI: typeof DanceParty,
    isReadOnlyWorkspace: boolean,
    readonlyCode?: string
  ) {
    if (isReadOnlyWorkspace && readonlyCode) {
      // In the share scenario, we call ensureSpritesAreLoaded() early since the
      // student code can't change. This way, we can start fetching assets while
      // waiting for the user to press the Run button.
      const charactersReferenced =
        utils.computeCharactersReferenced(readonlyCode);
      await nativeAPI.ensureSpritesAreLoaded(charactersReferenced);
    }
  }

  private handleEvents(currentFrameEvents: object[]) {
    if (this.livePreviewActive) {
      // We don't want to handle events while live preview is active.
      return;
    }

    if (!this.hooks.runUserEvents) {
      this.reportMissingHooks('runUserEvents');
      return;
    }
    this.hooks.runUserEvents(currentFrameEvents);
    this.onEventsChanged?.();
  }

  private playSong(
    url: string,
    callback: (playSuccess: boolean) => void,
    onEnded: () => void
  ) {
    const callbackWrapper = (playSuccess: boolean) => {
      if (playSuccess) {
        this.currentlyPlayingSong = url;
      }
      callback(playSuccess);
    };

    const onEndedWrapper = () => {
      this.currentlyPlayingSong = null;
      onEnded();
    };

    audioCommands.playSound({
      url,
      callback: callbackWrapper,
      onEnded: onEndedWrapper,
    });
  }

  private reportMissingHooks(...hooks: string[]) {
    this.metricsReporter.logWarning(
      `Missing required hooks in compiled code: ${hooks.join(', ')}`
    );
  }
}
