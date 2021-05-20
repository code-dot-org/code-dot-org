import {tiles, MazeController} from '@code-dot-org/maze';
const Slider = require('@cdo/apps/slider');
const Direction = tiles.Direction;
import {NeighborhoodSignalType} from './constants';
const timeoutList = require('@cdo/apps/lib/util/timeoutList');

const BASE_STEP_SPEED = 500;

export default class Neighborhood {
  constructor() {
    this.controller = null;
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
    this.lastActionTime = null;
  }

  handleSignal(signal) {
    // Calculate time to wait until executing this signal. Time to wait will
    // be milliseconds of (last action enqueued + time per action) - current time,
    // or 0 if that number is negative or this is the first signal received.
    let timeout = 0;
    const timeForAction = BASE_STEP_SPEED * this.getPegmanSpeedMultiplier();
    if (this.lastActionTime) {
      const nextActionTime = this.lastActionTime + timeForAction;
      timeout = nextActionTime - Date.now();
      if (timeout < 0) {
        timeout = 0;
      }
      this.lastActionTime = nextActionTime;
    } else {
      this.lastActionTime = Date.now();
    }
    timeoutList.setTimeout(
      () => this.getMazeCommand(signal, timeForAction),
      timeout
    );
  }

  getMazeCommand(signal, timeForAction) {
    switch (signal.value) {
      case NeighborhoodSignalType.MOVE: {
        const {direction, id} = signal.detail;
        return this.controller.animatedMove(
          Direction[direction.toUpperCase()],
          timeForAction,
          id
        );
      }
      case NeighborhoodSignalType.INITIALIZE_PAINTER: {
        const {direction, x, y, id} = signal.detail;
        return this.controller.addPegman(
          id,
          parseInt(x),
          parseInt(y),
          Direction[direction.toUpperCase()]
        );
      }
      default:
        console.log(signal.value);
        break;
    }
  }

  onCompile() {
    this.controller.hideDefaultPegman();
  }

  reset() {
    this.controller.reset(false, false);
    this.lastActionTime = null;
  }

  // Multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between -1 and 1 and
    // return 2 to the power of that scaled value to get a multiplier between 0.5 and 2.
    return Math.pow(2, -2 * this.speedSlider.getValue() + 1);
  }
}
