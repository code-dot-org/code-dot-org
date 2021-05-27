import {tiles, MazeController} from '@code-dot-org/maze';
const Slider = require('@cdo/apps/slider');
const Direction = tiles.Direction;
import {NeighborhoodSignalType} from './constants';
const timeoutList = require('@cdo/apps/lib/util/timeoutList');

const PAUSE_BETWEEN_SIGNALS = 200;
const ANIMATED_STEP_SPEED = 500;
const ANIMATED_STEPS = [
  NeighborhoodSignalType.MOVE,
  NeighborhoodSignalType.PAINT,
  NeighborhoodSignalType.REMOVE_PAINT,
  NeighborhoodSignalType.TURN_LEFT
];

export default class Neighborhood {
  constructor() {
    this.controller = null;
    // TODO: set this based on level once we have variable sizes
    this.numRows = 8;
  }

  afterInject(level, skin, config, studioApp) {
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
    this.lastSignalEndTime = null;
  }

  handleSignal(signal) {
    // Calculate time to wait until executing this signal. Animated steps such as move
    // have an additional timeForSignal that is used by maze to animate the sprite. All
    // signals have a pause between signals. The timing is multiplied by the pegmanSpeedMultiplier
    // to speed up or slow down the overall animation.
    let timeout = 0;
    const timeForSignal =
      this.getAnimationTime(signal) * this.getPegmanSpeedMultiplier();
    const totalSignalTime =
      timeForSignal + PAUSE_BETWEEN_SIGNALS * this.getPegmanSpeedMultiplier();
    if (this.lastSignalEndTime) {
      timeout = this.lastSignalEndTime - Date.now();
      if (timeout < 0) {
        timeout = 0;
      }
      this.lastSignalEndTime = this.lastSignalEndTime + totalSignalTime;
    } else {
      this.lastSignalEndTime = Date.now() + totalSignalTime;
    }
    timeoutList.setTimeout(
      () => this.getMazeCommand(signal, timeForSignal),
      timeout
    );
  }

  getMazeCommand(signal, timeForSignal) {
    switch (signal.value) {
      case NeighborhoodSignalType.MOVE: {
        const {direction, id} = signal.detail;
        return this.controller.animatedMove(
          Direction[direction.toUpperCase()],
          timeForSignal,
          id
        );
      }
      case NeighborhoodSignalType.INITIALIZE_PAINTER: {
        const {direction, x, y, id} = signal.detail;
        return this.controller.addPegman(
          id,
          parseInt(x),
          this.convertYCoordinate(parseInt(y)),
          Direction[direction.toUpperCase()]
        );
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
  }

  reset() {
    timeoutList.clearTimeouts();
    this.controller.reset(false, false);
    this.lastSignalEndTime = null;
  }

  // Multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between -1 and 1 and
    // return 2 to the power of that scaled value to get a multiplier between 0.5 and 2.
    return Math.pow(2, -2 * this.speedSlider.getValue() + 1);
  }

  // Convert y-coordinate from Neighborhood format to Maze format.
  // In neighborhood (0,0) is the bottom-left grid square, in Maze
  // it is the top left.
  convertYCoordinate(y) {
    // if we have 8 rows, y = 0 -> y = 7, y = 1 -> y = 6, and so on
    return this.numRows - 1 - y;
  }
}
