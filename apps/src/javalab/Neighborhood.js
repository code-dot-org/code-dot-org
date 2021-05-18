import {tiles, MazeController} from '@code-dot-org/maze';
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
  }

  handleSignal(signal) {
    const type = signal.value;
    switch (type) {
      case NeighborhoodSignalType.MOVE: {
        const {direction, id} = signal.detail;
        this.controller.animatedMove(Direction[direction.toUpperCase()], id);
        break;
      }
      case NeighborhoodSignalType.INITIALIZE: {
        const {direction, x, y, id} = signal.detail;
        this.controller.addPegman(id, x, y, direction);
        break;
      }
      default:
        console.log(type);
        break;
    }
  }

  reset() {
    //this.controller.reset();
  }
}
