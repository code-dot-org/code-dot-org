import {tiles, MazeController} from '@code-dot-org/maze';

import {LevelProperties} from '@cdo/apps/lab2/types';
import * as timeoutList from '@cdo/apps/lib/util/timeoutList';
import {LOOK_ID, SVG_ID} from '@cdo/apps/maze/constants';
import Slider from '@cdo/apps/slider';
import commonI18n from '@cdo/locale';

import {NeighborhoodSignalType} from './constants';
import {NeighborhoodSignal} from './types';

const Direction = tiles.Direction;

const PAUSE_BETWEEN_SIGNALS = 200;
const ANIMATED_STEP_SPEED = 500;
const ANIMATED_STEPS = [NeighborhoodSignalType.MOVE];
const SIGNAL_CHECK_TIME = 200;

// We are relying on old maze skins here, which are not typed.
type SkinType = Record<string, unknown>;

export default class Neighborhood {
  private controller: typeof MazeController | null;
  private seenFirstSignal: boolean;
  private onOutputMessage: (message: string) => void;
  private onNewlineMessage: () => void;
  private setIsRunning: (isRunning: boolean) => void;
  private statusMessagePrefix: string;
  private speedSlider: Slider | null;
  private signals: NeighborhoodSignal[];
  private nextSignalIndex: number;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    setIsRunning: (isRunning: boolean) => void,
    statusMessagePrefix: string
  ) {
    this.controller = null;
    this.seenFirstSignal = false;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
    this.statusMessagePrefix = statusMessagePrefix;
    this.speedSlider = null;
    this.signals = [];
    this.nextSignalIndex = -1;
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

    const slider = document.getElementById('slider');
    if (!slider) {
      return;
    }
    this.speedSlider = new Slider(10, 35, 130, slider);
    this.signals = [];
    this.nextSignalIndex = 0;

    // Expose an interface for testing.
    // Only used in legacy labs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testInterface = (window as any).__TestInterface;
    if (testInterface) {
      testInterface.setSpeedSliderValue = (value: number) => {
        this.speedSlider!.setValue(value);
      };
    }
  }

  handleSignal(signal: NeighborhoodSignal | null) {
    if (!signal) {
      return;
    }
    // Add next signal to our queue of signals.
    this.signals.push(signal);
    // if this is the first signal, send a starting painter message
    if (!this.seenFirstSignal) {
      this.seenFirstSignal = true;
      this.onOutputMessage(
        `${this.statusMessagePrefix} ${commonI18n.startingPainter()}`
      );
      this.onNewlineMessage();
    }
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
        return;
      }
      const timeForSignal =
        this.getAnimationTime(signal) * this.getPegmanSpeedMultiplier();
      const totalSignalTime =
        timeForSignal + PAUSE_BETWEEN_SIGNALS * this.getPegmanSpeedMultiplier();

      const beginTime = Date.now();
      this.mazeCommand(signal, timeForSignal);
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

  getAnimationTime(signal: NeighborhoodSignal) {
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
    this.seenFirstSignal = false;
  }

  // Multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between
    // 2 (slowest) and 0 (fastest).
    return -2 * this.speedSlider!.getValue() + 2;
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
}
