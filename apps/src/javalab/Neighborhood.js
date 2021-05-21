import {tiles, MazeController} from '@code-dot-org/maze';
const Slider = require('@cdo/apps/slider');
const Direction = tiles.Direction;
import {NeighborhoodSignalType} from './constants';

export default class Neighborhood {
  constructor() {
    this.controller = null;
  }
  afterInject(level, skin, config, studioApp) {
    // Insert some temporary values here until we can populate them from levelbuilder
    level.map = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    level.startDirection = Direction.EAST;

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
  }

  handleSignal(signal) {
    const type = signal.value;
    switch (type) {
      case NeighborhoodSignalType.MOVE: {
        // TODO: Add client-side support for accessing painters by ID
        const {direction /*, id*/} = signal.detail;
        this.controller.animatedMove(
          Direction[direction.toUpperCase()],
          1000 /*, id*/
        );
        break;
      }
      default:
        console.log(type);
        break;
    }
  }

  reset() {
    this.controller.reset();
  }

  // TODO: use this as a multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between -1 and 1 and
    // return 2 to the power of that scaled value to get a multiplier between 0.5 and 2.
    return Math.pow(2, -2 * this.speedSlider.getValue() + 1);
  }
}
