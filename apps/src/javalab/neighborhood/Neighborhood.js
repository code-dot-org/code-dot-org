import {tiles, MazeController} from '@code-dot-org/maze';
import Slider from '@cdo/apps/slider';
const Direction = tiles.Direction;
import {NeighborhoodSignalType, STATUS_MESSAGE_PREFIX} from '../constants';
import {setTimeout, clearTimeouts} from '@cdo/apps/lib/util/timeoutList';
import javalabMsg from '@cdo/javalab/locale';

const PAUSE_BETWEEN_SIGNALS = 200;
const ANIMATED_STEP_SPEED = 500;
const ANIMATED_STEPS = [NeighborhoodSignalType.MOVE];
const SIGNAL_CHECK_TIME = 200;

export default class Neighborhood {
  constructor(onOutputMessage, onNewlineMessage, setIsRunning) {
    this.controller = null;
    this.numRows = null;
    this.seenFirstSignal = false;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
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
        getTestResults: studioApp.getTestResults.bind(studioApp),
      },
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

    // Expose an interface for testing
    window.__TestInterface.setSpeedSliderValue = value => {
      this.speedSlider.setValue(value);
    };
  }

  handleSignal(signal) {
    // add next signal to our queue of signals
    this.signals.push(signal);
    // if this is the first signal, send a starting painter message
    if (!this.seenFirstSignal) {
      this.seenFirstSignal = true;
      this.onOutputMessage(
        `${STATUS_MESSAGE_PREFIX} ${javalabMsg.startingPainter()}`
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
      setTimeout(() => this.processSignals(), Math.max(remainingTime, 0));
    } else {
      // check again for a signal after the specified wait time
      setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
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
      case NeighborhoodSignalType.SHOW_PAINTER: {
        const {id} = signal.detail;
        this.controller.showPegman(id);
        break;
      }
      case NeighborhoodSignalType.HIDE_PAINTER: {
        const {id} = signal.detail;
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

  getAnimationTime(signal) {
    return ANIMATED_STEPS.includes(signal.value) ? ANIMATED_STEP_SPEED : 0;
  }

  onCompile() {
    this.controller.hideDefaultPegman();
    // start checking for signals after the specified wait time
    setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
  }

  reset() {
    // this will clear all remaining processSignals() commands
    clearTimeouts();
    this.resetSignalQueue();
    this.controller.reset(false, false);
  }

  onStop() {
    clearTimeouts();
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
    return -2 * this.speedSlider.getValue() + 2;
  }
}
