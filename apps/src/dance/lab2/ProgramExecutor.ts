import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {SongMetadata} from '../types';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';
import * as danceMsg from '../locale';
import Sounds from '@cdo/apps/Sounds';
import {ASSET_BASE} from '../constants';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import utils from '../utils';

// TODO: The Dance Party repo currently does not export types, so we need
// use require() to import these components. We should add declaration files
// to the Dance Party repo and switch to using import statements.
import DanceParty from '@code-dot-org/dance-party/src/p5.dance';
import DanceAPI from '@code-dot-org/dance-party/src/api';
import ResourceLoader from '@code-dot-org/dance-party/src/ResourceLoader';
import danceCode from '@code-dot-org/dance-party/src/p5.dance.interpreted.js';

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
  private hooks: {[name in HookName]?: (args?: unknown[]) => unknown};
  private getCode: () => string;
  private validationCode?: string;
  private onEventsChanged?: () => void;

  constructor(
    container: string,
    getCode: () => string,
    onPuzzleComplete: (result: boolean, message: string) => void,
    isReadOnlyWorkspace: boolean,
    recordReplayLog: boolean,
    customHelperLibrary?: string,
    validationCode?: string,
    onEventsChanged?: () => void,
    nativeAPI: typeof DanceParty = undefined // For testing
  ) {
    this.hooks = {};
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
          this.init(nativeAPI, isReadOnlyWorkspace);
        },
        spriteConfig: new Function('World', customHelperLibrary || ''),
        container,
        i18n: danceMsg,
        resourceLoader: new ResourceLoader(ASSET_BASE),
      });
    this.validationCode = validationCode;
    this.onEventsChanged = onEventsChanged;
    this.getCode = getCode;
  }

  /**
   * Execute the program. Compiles student code and hands off to the native API to run.
   */
  async execute(songMetadata: SongMetadata) {
    // TODO: Dance.js checks for unwanted top blocks and duplicate variables in for loops
    // before executing. We should do something similar here.

    this.hooks = await this.compileAllCode(this.getCode());
    if (!this.hooks.runUserSetup || !this.hooks.getCueList) {
      Lab2MetricsReporter.logWarning('Missing required hooks in compiled code');
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
   * Preview the program. Compiles student code and calls on the native API to draw a frame.
   */
  async preview() {
    this.nativeAPI.setForegroundEffectsInPreviewMode(true);
    this.reset();
    this.hooks = await this.preloadSpritesAndCompileCode(
      this.getCode(),
      'runUserSetup'
    );

    if (!this.hooks.runUserSetup) {
      Lab2MetricsReporter.logWarning('Missing required hook in compiled code');
      return;
    }

    this.hooks.runUserSetup();

    // Force preview draw to occur **after** any
    // draw iterations already queued up.
    // redraw() (rather than draw()) is p5's recommended way
    // of drawing once.
    setTimeout(() => {
      this.nativeAPI.p5_.redraw();
      this.nativeAPI.setForegroundEffectsInPreviewMode(false);
    }, 0);
  }

  reset() {
    Sounds.getSingleton().stopAllAudio();
    this.nativeAPI.reset();
  }

  getReplayLog() {
    return this.nativeAPI.getReplayLog();
  }

  destroy() {
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
    isReadOnlyWorkspace: boolean
  ) {
    if (isReadOnlyWorkspace) {
      // In the share scenario, we call ensureSpritesAreLoaded() early since the
      // student code can't change. This way, we can start fetching assets while
      // waiting for the user to press the Run button.
      const charactersReferenced = utils.computeCharactersReferenced(
        this.getCode()
      );
      await nativeAPI.ensureSpritesAreLoaded(charactersReferenced);
    }
  }

  private handleEvents(currentFrameEvents: object[]) {
    if (!this.hooks.runUserEvents) {
      Lab2MetricsReporter.logWarning('Missing required hook in compiled code');
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
    audioCommands.playSound({
      url: url,
      callback: callback,
      onEnded,
    });
  }
}
