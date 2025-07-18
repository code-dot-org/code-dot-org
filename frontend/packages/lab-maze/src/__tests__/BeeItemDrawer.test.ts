import Bee from '../Bee';
import BeeCell from '../BeeCell';
import BeeItemDrawer from '../BeeItemDrawer';
import MazeController, {Configuration} from '../MazeController';
import MazeMap from '../MazeMap';
import type {Skin} from '../skin';

import {baseLevel} from './data';

jest.mock('../MazeController');

let svg: SVGSVGElement;

function setGlobals() {
  expect(document.getElementById('svgMaze')).toBeNull();

  const svgMaze = document.createElement('div');
  svgMaze.id = 'svgMaze';
  svgMaze.innerHTML = '<div class="pegman-location"></div>';
  document.body.appendChild(svgMaze);

  svg = svgMaze as unknown as SVGSVGElement;
}

function cleanupGlobals() {
  const svgMaze = document.getElementById('svgMaze');
  if (svgMaze) {
    document.body.removeChild(svgMaze);
    expect(document.getElementById('svgMaze')).toBeNull();
  }
}

function createFakeSkin(): Skin {
  // BeeItemDrawer takes a skin as an input. Rather than load the actual skin,
  // we'll just fake those fields that we need
  return {
    redFlower: 'redFlower.png',
    purpleFlower: 'purpleFlower.png',
    honey: 'honey.png',
    cloud: 'cloud.png',
    flowerComb: 'flowercomb.png',
    numbers: 'numbers.png',
    cloudAnimation: 'cloudAnimation.png',
  } as unknown as Skin;
}

const skin = createFakeSkin();

type SetupValues = [
  number | string,
  number,
  number,
  boolean,
  boolean,
  string,
  string | null,
];

function validateImages(setup: SetupValues[], defaultFlower: string) {
  // create a 1 row map with all of our values
  const map = [
    setup.map(item => {
      return item[0];
    }),
  ];
  const initialDirtMap = [
    setup.map(item => {
      return item[2];
    }),
  ];

  // create a config with a level based on the contraints from setup
  const config = {
    level: {
      ...baseLevel,
      honeyGoal: 1,
      map,
      flowerType: defaultFlower,
      startDirection: 1,
      initialDirt: initialDirtMap,
    },
    skin,
  };

  const maze = new MazeController(
    config.level,
    config.skin as Skin,
    config as Configuration,
    {},
  );
  maze.map = MazeMap.parseFromOldValues(map, config.level.initialDirt, BeeCell);

  // create a bee with a shim maze
  const bee = new Bee(maze, config);
  const drawer = new BeeItemDrawer(
    maze.map as MazeMap<BeeCell>,
    skin,
    svg,
    bee,
  );

  const row = 0;

  // col is the column in our 1 row map, which is the equivalent to the row
  // of the same number in our setup list
  setup.forEach((item, col) => {
    const running = item[3];
    const expectedCloud = item[4];
    const expectedText = item[5];
    const imgType = item[6];

    drawer.updateItemImage(row, col, running);

    const img = document.getElementById(
      BeeItemDrawer.cellId('beeItem', 0, col),
    );
    const counter = document.getElementById(
      BeeItemDrawer.cellId('counter', 0, col),
    );
    const cloud = document.getElementById(
      BeeItemDrawer.cellId('cloud', 0, col),
    );

    try {
      expect(img === null).toEqual(imgType === null);

      if (img && imgType) {
        expect(img.getAttribute('xlink:href')).toEqual(
          (skin as unknown as {[key: string]: string})[imgType],
        );
        expect(img.getAttribute('visibility')).toEqual('visible');
        expect(parseInt(img.getAttribute('x') || '0')).toEqual(50 * col);
        expect(parseInt(img.getAttribute('width') || '0')).toEqual(50);
      }

      if (counter) {
        const actualText = counter.firstChild?.nodeValue;
        expect(actualText).toEqual(expectedText);
      }

      const actualCloud = !!(
        cloud && cloud.getAttribute('visibility') === 'visible'
      );
      expect(actualCloud).toEqual(expectedCloud);
    } catch (error) {
      // output which item is failing
      if (error instanceof Error) {
        console.log(error.message + ' for index #' + col);
      }
      throw error;
    }
  });
}

describe('beeItemDrawer', () => {
  beforeEach(setGlobals);
  afterEach(cleanupGlobals);

  it('red flower default', () => {
    // map, dirtMap, initialDirtmap, running, expected index, expected image
    const setup: SetupValues[] = [
      // everything but the last 3 rows is the same whether or not we're running
      [2, 0, 0, true, false, '', null],
      [1, 1, 1, true, false, '1', 'redFlower'],
      [1, 2, 2, true, false, '2', 'redFlower'],
      [1, 11, 11, true, false, '11', 'redFlower'],
      [1, 98, 98, true, false, '0', 'redFlower'], // 98 -> 0
      [1, 99, 99, true, false, '', 'redFlower'], // 99 -> unlimited
      [1, -1, -1, true, false, '1', 'honey'],
      [1, -2, -2, true, false, '2', 'honey'],
      [1, -11, -11, true, false, '11', 'honey'],
      [1, -98, -98, true, false, '0', 'honey'],
      [1, -99, -99, true, false, '', 'honey'],
      // red with default red - behaves same as map = 1
      ['R', 1, 1, true, false, '1', 'redFlower'],
      // purple with default red
      ['P', 1, 1, true, false, '1', 'purpleFlower'],
      ['FC', 1, 1, true, false, '1', 'redFlower'], // flowercomb
      ['FC', -1, -1, true, false, '1', 'honey'], // flowercomb

      [2, 0, 0, false, false, '', null],
      [1, 1, 1, false, false, '1', 'redFlower'],
      [1, 2, 2, false, false, '2', 'redFlower'],
      [1, 11, 11, false, false, '11', 'redFlower'],
      [1, 98, 98, false, false, '0', 'redFlower'], // 98 -> 0
      [1, 99, 99, false, false, '', 'redFlower'], // 99 -> unlimited
      [1, -1, -1, false, false, '1', 'honey'],
      [1, -2, -2, false, false, '2', 'honey'],
      [1, -11, -11, false, false, '11', 'honey'],
      [1, -98, -98, false, false, '0', 'honey'],
      [1, -99, -99, false, false, '', 'honey'],
      ['R', 1, 1, false, false, '1', 'redFlower'],
      // purple with default red
      ['P', 1, 1, false, false, '?', 'purpleFlower'],
      ['FC', 1, 1, false, true, '', 'redFlower'], // flowercomb
      ['FC', -1, -1, false, true, '', 'honey'], // flowercomb
    ];

    validateImages(setup, 'redWithNectar');
  });

  it('purple flower default', () => {
    // map, dirtMap, initialDirtmap, expected index, expected image
    const setup: SetupValues[] = [
      // everything but the last 3 rows is the same whether or not we're running
      [2, 0, 0, true, false, '', null],
      [1, 1, 1, true, false, '1', 'purpleFlower'],
      [1, 2, 2, true, false, '2', 'purpleFlower'],
      [1, 11, 11, true, false, '11', 'purpleFlower'],
      [1, 98, 98, true, false, '0', 'purpleFlower'], // 98 -> 0
      [1, 99, 99, true, false, '', 'purpleFlower'], // 99 -> unlimited
      [1, -1, -1, true, false, '1', 'honey'],
      [1, -2, -2, true, false, '2', 'honey'],
      [1, -11, -11, true, false, '11', 'honey'],
      [1, -98, -98, true, false, '0', 'honey'],
      [1, -99, -99, true, false, '', 'honey'],
      // red with default purple - visible whether or not running
      ['R', 1, 1, true, false, '1', 'redFlower'],
      // purple with default purple - same as map = 1
      ['P', 1, 1, true, false, '1', 'purpleFlower'],
      ['FC', 1, 1, true, false, '1', 'purpleFlower'], // flowercomb
      ['FC', -1, -1, true, false, '1', 'honey'], // flowercomb

      [2, 0, 0, false, false, '', null],
      [1, 1, 1, false, false, '?', 'purpleFlower'],
      [1, 2, 2, false, false, '?', 'purpleFlower'],
      [1, 11, 11, false, false, '?', 'purpleFlower'],
      [1, 98, 98, false, false, '?', 'purpleFlower'],
      [1, 99, 99, false, false, '?', 'purpleFlower'],
      [1, -1, -1, false, false, '1', 'honey'],
      [1, -2, -2, false, false, '2', 'honey'],
      [1, -11, -11, false, false, '11', 'honey'],
      [1, -98, -98, false, false, '0', 'honey'],
      [1, -99, -99, false, false, '', 'honey'],
      // red with default purple - visible whether or not running
      ['R', 1, 1, false, false, '1', 'redFlower'],
      // purple with default purple - same as map = 1
      ['P', 1, 1, false, false, '?', 'purpleFlower'],
      ['FC', 1, 1, false, true, '', 'purpleFlower'], // flowercomb
      ['FC', -1, -1, false, true, '', 'honey'], // flowercomb
    ];

    validateImages(setup, 'purpleNectarHidden');
  });
});
