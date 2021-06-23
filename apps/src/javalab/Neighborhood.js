import {tiles, MazeController} from '@code-dot-org/maze';
const Slider = require('@cdo/apps/slider');
const Direction = tiles.Direction;
import {NeighborhoodSignalType} from './constants';
const timeoutList = require('@cdo/apps/lib/util/timeoutList');

const PAUSE_BETWEEN_SIGNALS = 200;
const ANIMATED_STEP_SPEED = 500;
const ANIMATED_STEPS = [NeighborhoodSignalType.MOVE];
const SIGNAL_CHECK_TIME = 200;

export default class Neighborhood {
  constructor() {
    this.controller = null;
    this.numRows = null;
  }

  afterInject(level, skin, config, studioApp) {
    this.numRows = level.serializedMaze.length;
    this.controller = new MazeController(level, skin, config, {
      methods: {
        playAudio: (sound, options) => {
          studioApp.playAudio(sound, {...options, noOverlap: true});
        },
        playAudioOnFailure: studioApp.playAudioOnFailure.bind(studioApp),
        loadAudio: studioApp.loadAudio.bind(studioApp),
        getTestResults: studioApp.getTestResults.bind(studioApp)
      }
    });
    // 'svgMaze' is a magic value that we use throughout our code-dot-org and maze code to
    // reference the maze visualization area. It is initially set up in maze's Visualization.jsx
    const svg = document.getElementById('svgMaze');
    this.controller.subtype.initStartFinish();
    this.controller.subtype.createDrawer(svg);
    this.controller.subtype.initWallMap();
    this.controller.initWithSvg(svg);

    const slider = document.getElementById('slider');
    this.speedSlider = new Slider(10, 35, 130, slider);
    this.signals = [];
    this.nextSignalIndex = 0;
  }

  handleSignal(signal) {
    // add next signal to our queue of signals
    this.signals.push(signal);
  }

  // Process avaiable signals recursively. We process recursively to ensure
  // the commands appear sequential to the user and all commands stay in sync.
  processSignals() {
    // if there is at least one signal we have not processed, process it
    if (this.signals.length > this.nextSignalIndex) {
      const signal = this.signals[this.nextSignalIndex];
      if (signal.value === NeighborhoodSignalType.DONE) {
        // we are done processing commands and can stop checking for signals
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

  mazeCommand(signal, timeForSignal) {
    switch (signal.value) {
      case NeighborhoodSignalType.MOVE: {
        const {direction, id} = signal.detail;
        this.controller.animatedMove(
          Direction[direction.toUpperCase()],
          timeForSignal,
          id
        );
        break;
      }
      case NeighborhoodSignalType.INITIALIZE_PAINTER: {
        const {direction, x, y, id} = signal.detail;
        this.controller.addPegman(
          id,
          parseInt(x),
          parseInt(y),
          Direction[direction.toUpperCase()]
        );
        break;
      }
      case NeighborhoodSignalType.TAKE_PAINT: {
        const {id} = signal.detail;
        this.controller.subtype.takePaint(id);
        break;
      }
      case NeighborhoodSignalType.PAINT: {
        const {id, color} = signal.detail;
        this.controller.subtype.addPaint(id, color);
        break;
      }
      case NeighborhoodSignalType.REMOVE_PAINT: {
        const {id} = signal.detail;
        this.controller.subtype.removePaint(id);
        break;
      }
      case NeighborhoodSignalType.TURN_LEFT: {
        const {id} = signal.detail;
        this.controller.subtype.turnLeft(id);
        break;
      }
      default:
        console.log(signal.value);
        break;
    }
  }

  getAnimationTime(signal) {
    return ANIMATED_STEPS.includes(signal.value) ? ANIMATED_STEP_SPEED : 0;
  }

  onCompile() {
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

  // TODO: Call this function when we enable stopping a program
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
  }

  // Multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between -1/3 and -1 2/3
    // and return 8 to the power of that scaled value to get a multiplier between 2 (slowest) and
    // ~0.03 (fastest).
    return Math.pow(8, -2 * this.speedSlider.getValue() + 1 / 3);
  }
}
