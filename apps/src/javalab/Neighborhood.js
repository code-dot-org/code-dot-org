import {tiles, MazeController} from '@code-dot-org/maze';
const Slider = require('@cdo/apps/slider');
const Direction = tiles.Direction;

export default class Neighborhood {
  constructor() {}
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

    let controller = new MazeController(level, skin, config, {
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
    controller.subtype.initStartFinish();
    controller.subtype.createDrawer(svg);
    controller.subtype.initWallMap();
    controller.initWithSvg(svg);

    const slider = document.getElementById('slider');
    this.speedSlider = new Slider(10, 35, 130, slider);
  }

  // TODO: use this as a multiplier on the time per action or step at execution time.
  getPegmanSpeedMultiplier() {
    // The slider goes from 0 to 1. We scale the speed slider value to be between -1 and 1 and
    // return 2 to the power of that scaled value to get a multiplier between 0.5 and 2.
    return Math.pow(2, -2 * this.speedSlider.getValue() + 1);
  }
}
