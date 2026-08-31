import {tiles, MazeController} from '@code-dot-org/maze';

import {LevelProperties} from '@cdo/apps/lab2/types';
import * as timeoutList from '@cdo/apps/lib/util/timeoutList';
import {LOOK_ID, SVG_ID} from '@cdo/apps/maze/constants';
import MiniApp from '@cdo/apps/miniApps/MiniApp';

import {ConsoleSignalType, NeighborhoodSignalType} from './constants';
import NeighborhoodSpeedTracker from './NeighborhoodSpeedTracker';
import NeighborhoodRunNarrator from './runNarrator';
import {ConsoleSignal, NeighborhoodSignal} from './types';

const Direction = tiles.Direction;

// The cursor reads the grid from window.Maze. Set only this property: on a
// maze page window.Maze is the app object maze/api.js needs.
function publishController(controller: unknown): void {
  const global = window as unknown as {Maze?: {controller?: unknown}};
  global.Maze = global.Maze ?? {};
  global.Maze.controller = controller;
}

const PAUSE_BETWEEN_SIGNALS = 200;
const ANIMATED_STEP_SPEED = 500;
const ANIMATED_STEPS: (ConsoleSignalType | NeighborhoodSignalType)[] = [
  NeighborhoodSignalType.MOVE,
];
const SIGNAL_CHECK_TIME = 200;

// We are relying on old maze skins here, which are not typed.
type SkinType = Record<string, unknown>;

export default class Neighborhood extends MiniApp {
  private controller: typeof MazeController | null;
  private onOutputMessage: (message: string) => void;
  private onNewlineMessage: () => void;
  private onPartialOutputMessage: (message: string) => void;
  private setIsRunning: (isRunning: boolean) => void;
  private signals: (NeighborhoodSignal | ConsoleSignal)[];
  private nextSignalIndex: number;
  private speedTracker: NeighborhoodSpeedTracker;
  private isProcessingSignals: boolean;
  private resolveOnDone?: () => void;
  private donePromise: Promise<void> | null = null;
  private narrator: NeighborhoodRunNarrator;
  private setConsoleAnnouncements: (enabled: boolean) => void;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    setIsRunning: (isRunning: boolean) => void,
    onPartialOutputMessage: (message: string) => void,
    // Lets the run narration speak first; the console's output is read after
    // it. Optional because Java Lab has no such console.
    setConsoleAnnouncements: (enabled: boolean) => void = () => {}
  ) {
    super();
    this.controller = null;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
    this.signals = [];
    this.nextSignalIndex = -1;
    this.speedTracker = NeighborhoodSpeedTracker.getInstance();
    this.onPartialOutputMessage = onPartialOutputMessage;
    this.setConsoleAnnouncements = setConsoleAnnouncements;
    this.isProcessingSignals = false;
    // Read lazily: the controller does not exist until afterInject.
    this.narrator = new NeighborhoodRunNarrator(() => this.controller);
  }

  afterInject(
    level: LevelProperties,
    skin: SkinType,
    config: {skinId: string; level: LevelProperties; skin: SkinType},
    playAudio: (name: string, options: Record<string, unknown>) => void,
    playAudioOnFailure: () => void,
    loadAudio: (filenames: string[], name: string[]) => void,
    getTestResults: (
      levelComplete: boolean,
      options: {
        executionError: {error: Error; lineNumber: number};
        allowTopBlocks: boolean;
      }
    ) => void
  ) {
    // A stale controller would let the cursor read the previous level's grid.
    publishController(null);
    if (!level.serializedMaze) {
      return;
    }
    this.prepareForNewMaze();

    this.controller = new MazeController(level, skin, config, {
      // TODO: Either get rid of these methods or support audio in Neighborhood.
      // https://codedotorg.atlassian.net/browse/CT-942
      methods: {
        playAudio,
        playAudioOnFailure,
        loadAudio,
        getTestResults,
      },
    });

    const svg = document.getElementById(SVG_ID);
    this.controller.subtype.initStartFinish();
    this.controller.subtype.createDrawer(svg);
    this.controller.subtype.initWallMap();
    this.controller.initWithSvg(svg);

    publishController(this.controller);

    this.signals = [];
    this.nextSignalIndex = 0;
    this.narrator.reset();

    // Expose an interface for testing.
    // Only used in legacy labs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testInterface = (window as any).__TestInterface;
    if (testInterface) {
      testInterface.setSpeedSliderValue = (value: number) => {
        // The old slider used a range of 0 to 1, while the new slider uses 0 to 100.
        // Note: this will change the animation speed but won't actually update the UI.
        this.speedTracker.setSpeed(value * 100);
      };
    }
  }

  handleSignal(signal: NeighborhoodSignal | ConsoleSignal | null) {
    if (!signal) {
      return;
    }
    // Add next signal to our queue of signals.
    this.signals.push(signal);
  }

  // Process avaiable signals recursively. We process recursively to ensure
  // the commands appear sequential to the user and all commands stay in sync.
  processSignals() {
    // if there is at least one signal we have not processed, process it
    if (this.signals.length > this.nextSignalIndex) {
      const signal = this.signals[this.nextSignalIndex];
      if (signal.value === NeighborhoodSignalType.DONE) {
        // we are done processing commands and can stop checking for signals.
        // Set isRunning to false, add a blank line to the console, and return
        this.setIsRunning(false);
        this.onNewlineMessage();
        // The narrator reads the run's console output as part of its summary,
        // so the console stays quiet until the next write after the run.
        this.narrator.endRun();
        this.setConsoleAnnouncements(true);
        if (this.resolveOnDone) {
          this.resolveOnDone();
        }
        return;
      }
      const timeForSignal =
        this.getAnimationTime(signal) * this.getPegmanSpeedMultiplier();
      const totalSignalTime =
        timeForSignal + PAUSE_BETWEEN_SIGNALS * this.getPegmanSpeedMultiplier();

      const beginTime = Date.now();
      if (signal.value === ConsoleSignalType.CONSOLE_LOG) {
        this.onOutputMessage(signal.detail);
        this.narrator.onConsoleMessage(signal.detail);
      } else if (signal.value === ConsoleSignalType.PARTIAL_LOG) {
        // A partial line is an input() prompt. It cannot wait for the end of
        // the run, so the console speaks again from here on.
        this.setConsoleAnnouncements(true);
        this.onPartialOutputMessage(signal.detail);
      } else {
        this.mazeCommand(signal as NeighborhoodSignal, timeForSignal);
      }
      this.nextSignalIndex++;
      const remainingTime = totalSignalTime - (Date.now() - beginTime);

      // check for another signal after the remaining time to wait between signals
      timeoutList.setTimeout(
        () => this.processSignals(),
        Math.max(remainingTime, 0)
      );
    } else {
      // check again for a signal after the specified wait time
      timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
    }
  }

  mazeCommand(signal: NeighborhoodSignal, timeForSignal: number) {
    // Narrate as the action is drawn, so speech tracks the animation.
    this.narrator.onSignal(signal);
    switch (signal.value) {
      case NeighborhoodSignalType.MOVE: {
        const {direction, id} = signal.detail!;
        this.controller.animatedMove(
          Direction[direction!.toUpperCase()],
          timeForSignal,
          id
        );
        break;
      }
      case NeighborhoodSignalType.INITIALIZE_PAINTER: {
        const {direction, x, y, id} = signal.detail!;
        this.controller.addPegman(
          id,
          parseInt(x!),
          parseInt(y!),
          Direction[direction!.toUpperCase()]
        );
        break;
      }
      case NeighborhoodSignalType.TAKE_PAINT: {
        const {id} = signal.detail!;
        this.controller.subtype.takePaint(id);
        break;
      }
      case NeighborhoodSignalType.PAINT: {
        const {id, color} = signal.detail!;
        this.controller.subtype.addPaint(id, color);
        break;
      }
      case NeighborhoodSignalType.REMOVE_PAINT: {
        const {id} = signal.detail!;
        this.controller.subtype.removePaint(id);
        break;
      }
      case NeighborhoodSignalType.TURN_LEFT: {
        const {id} = signal.detail!;
        this.controller.subtype.turnLeft(id);
        break;
      }
      case NeighborhoodSignalType.SHOW_PAINTER: {
        const {id} = signal.detail!;
        this.controller.showPegman(id);
        break;
      }
      case NeighborhoodSignalType.HIDE_PAINTER: {
        const {id} = signal.detail!;
        this.controller.hidePegman(id);
        break;
      }
      case NeighborhoodSignalType.SHOW_BUCKETS: {
        this.controller.subtype.setBucketVisibility(true);
        break;
      }
      case NeighborhoodSignalType.HIDE_BUCKETS: {
        this.controller.subtype.setBucketVisibility(false);
        break;
      }
      default:
        // Ignore signals we don't know about.
        break;
    }
  }

  getAnimationTime(signal: NeighborhoodSignal | ConsoleSignal) {
    return ANIMATED_STEPS.includes(signal.value) ? ANIMATED_STEP_SPEED : 0;
  }

  onCompile() {
    this.setProcessSignals();
  }

  onRun() {
    this.setProcessSignals();
  }

  setProcessSignals() {
    this.controller.hideDefaultPegman();
    // The narration owns the screen reader for the duration of the run.
    this.setConsoleAnnouncements(false);
    this.isProcessingSignals = true;
    // start checking for signals after the specified wait time
    timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
  }

  reset() {
    // this will clear all remaining processSignals() commands
    timeoutList.clearTimeouts();
    this.resetSignalQueue();
    this.controller.reset(false, false);
  }

  onStop() {
    timeoutList.clearTimeouts();
    this.resetSignalQueue();
  }

  onClose() {
    // On any close command from the server, add a done signal to the end of the queue.
    // We won't receive any more signals after close.
    this.signals.push({value: NeighborhoodSignalType.DONE});
  }

  resetSignalQueue() {
    this.signals = [];
    this.nextSignalIndex = 0;
    this.isProcessingSignals = false;
    // A stopped run must stop talking, and the next one starts its count over.
    // Nothing will reach the narrator's summary now, so the console takes the
    // screen reader back rather than staying silent.
    this.narrator.reset();
    this.setConsoleAnnouncements(true);
  }

  isRunning() {
    return this.isProcessingSignals;
  }

  // Multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 100. We scale the speed slider value to be between
    // 2 (slowest) and 0 (fastest).
    return -2 * (this.speedTracker.getSpeed() / 100) + 2;
  }

  // Ensure the svg maze is empty except for the 'look' tile.
  // We will reuse the same svg for a new maze if the user changes their version
  // and had a different maze in a previous version.
  // We want to make sure it's empty to avoid confusing rendering bugs due to overlapping tiles.
  prepareForNewMaze() {
    const svg = document.getElementById(SVG_ID);
    // Visualization.jsx includes a 'look' tile that we want to keep inside svgMaze.
    const idToIgnore = LOOK_ID;
    if (svg?.children && svg.children.length > 1) {
      const mazeTiles = Array.from(svg.children);
      mazeTiles.forEach(tile => {
        if (tile.id !== idToIgnore) {
          svg.removeChild(tile);
        }
      });
    }
  }

  // Returns a promise that resolves when all neighborhood signals have finished processing.
  waitUntilDone(): Promise<void> {
    if (!this.isRunning()) {
      return Promise.resolve();
    }

    if (this.donePromise) {
      return this.donePromise;
    }

    this.donePromise = new Promise(resolve => {
      this.resolveOnDone = () => {
        resolve();
        this.donePromise = null;
        this.resolveOnDone = undefined;
      };
    });
    return this.donePromise;
  }
}
