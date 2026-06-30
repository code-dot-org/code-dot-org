import {cells, tiles} from '@code-dot-org/maze';

import MazeKeyboardNavigation, {
  describeCell,
  describeObject,
} from '@cdo/apps/maze/keyboardNavigation';

// Mock the locale so message selection is deterministic and decoupled from
// the build-generated translations. Each message returns a token embedding
// its key and any interpolated count, so tests assert which key was chosen.
jest.mock('@cdo/apps/maze/locale', () => ({
  mazeNavGoal: () => 'GOAL',
  mazeNavObstacle: () => 'OBSTACLE',
  mazeNavStart: () => 'START',
  mazeNavOpenPath: () => 'OPEN',
  mazeNavPosition: ({row, col}: {row: number; col: number}) =>
    `POS(${row},${col})`,
  mazeNavCharacterHere: () => 'HERE',
  mazeNavWall: () => 'WALL',
  mazeNavEdge: () => 'EDGE',
  mazeNavExited: () => 'EXITED',
  mazeNavFlowerPurple: ({count}: {count: number}) => `FLOWER_PURPLE(${count})`,
  mazeNavFlowerRed: ({count}: {count: number}) => `FLOWER_RED(${count})`,
  mazeNavFlowerPurpleUnlimited: () => 'FLOWER_PURPLE_INF',
  mazeNavFlowerRedUnlimited: () => 'FLOWER_RED_INF',
  mazeNavHive: ({count}: {count: number}) => `HIVE(${count})`,
  mazeNavHiveUnlimited: () => 'HIVE_INF',
  mazeNavCloud: () => 'CLOUD',
  mazeNavCollectibles: ({count}: {count: number}) => `ITEMS(${count})`,
  mazeNavDirtPile: ({count}: {count: number}) => `DIRT(${count})`,
  mazeNavHole: ({count}: {count: number}) => `HOLE(${count})`,
  mazeNavCorn: ({count}: {count: number}) => `CORN(${count})`,
  mazeNavPumpkin: ({count}: {count: number}) => `PUMPKIN(${count})`,
  mazeNavLettuce: ({count}: {count: number}) => `LETTUCE(${count})`,
  mazeNavHiddenCrop: () => 'HIDDEN_CROP',
  mazeNavSoil: () => 'SOIL',
  mazeNavSprout: () => 'SPROUT',
}));

const {SquareType} = tiles;
const {HarvesterCell, PlanterCell} = cells;

type Controller = Parameters<typeof describeCell>[0];

// Build a minimal fake controller. tiles is keyed "row,col" -> SquareType
// (matching map.getTile(row, col)); absent entries read as OPEN. subtype is
// merged over a bare default so each test only specifies what it needs.
function makeController(
  opts: {
    subtype?: object;
    tiles?: Record<string, number>;
    pegman?: {x: number; y: number};
    finish?: {x: number; y: number};
  } = {}
): Controller {
  const {
    subtype = {},
    tiles: tileMap = {},
    pegman = {x: -1, y: -1},
    finish,
  } = opts;
  return {
    SQUARE_SIZE: 50,
    subtype: {finish, ...subtype},
    map: {
      ROWS: 10,
      COLS: 10,
      getTile: (row: number, col: number) => tileMap[`${row},${col}`],
    },
    getPegmanX: () => pegman.x,
    getPegmanY: () => pegman.y,
  } as Controller;
}

describe('maze keyboard navigation reporting', () => {
  describe('describeCell - plain maze (no subtype objects)', () => {
    it('describes an open path with 1-based position', () => {
      const ctrl = makeController();
      expect(describeCell(ctrl, 2, 3)).toBe('OPEN POS(4,3)');
    });

    it('describes the start square', () => {
      const ctrl = makeController({tiles: {'3,2': SquareType.START}});
      expect(describeCell(ctrl, 2, 3)).toBe('START POS(4,3)');
    });

    it('describes an obstacle', () => {
      const ctrl = makeController({tiles: {'3,2': SquareType.OBSTACLE}});
      expect(describeCell(ctrl, 2, 3)).toBe('OBSTACLE POS(4,3)');
    });

    it('describes the goal at the finish coordinates', () => {
      const ctrl = makeController({finish: {x: 2, y: 3}});
      expect(describeCell(ctrl, 2, 3)).toBe('GOAL POS(4,3)');
    });

    it('appends the character-here clause when pegman is on the cell', () => {
      const ctrl = makeController({pegman: {x: 2, y: 3}});
      expect(describeCell(ctrl, 2, 3)).toBe('OPEN POS(4,3) HERE');
    });
  });

  describe('describeObject - bee', () => {
    const beeCtrl = (cell: object, extra: object = {}) =>
      makeController({
        subtype: {isBee: () => true, getCell: () => cell, ...extra},
      });

    it('describes a purple flower with remaining nectar', () => {
      const ctrl = beeCtrl(
        {isFlower: () => true},
        {isRedFlower: () => false, flowerRemainingCapacity: () => 5}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('FLOWER_PURPLE(5)');
    });

    it('describes a red flower with remaining nectar', () => {
      const ctrl = beeCtrl(
        {isFlower: () => true},
        {isRedFlower: () => true, flowerRemainingCapacity: () => 2}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('FLOWER_RED(2)');
    });

    it('describes a flower of unlimited nectar without a count', () => {
      const ctrl = beeCtrl(
        {isFlower: () => true},
        {isRedFlower: () => false, flowerRemainingCapacity: () => Infinity}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('FLOWER_PURPLE_INF');
    });

    it('describes a hive with remaining honey capacity', () => {
      const ctrl = beeCtrl(
        {isFlower: () => false, isHive: () => true},
        {hiveRemainingCapacity: () => 3}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('HIVE(3)');
    });

    it('describes a hive of unlimited capacity without a count', () => {
      const ctrl = beeCtrl(
        {isFlower: () => false, isHive: () => true},
        {hiveRemainingCapacity: () => Infinity}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('HIVE_INF');
    });

    it('describes a static cloud', () => {
      const ctrl = beeCtrl({
        isFlower: () => false,
        isHive: () => false,
        isStaticCloud: () => true,
      });
      expect(describeObject(ctrl, 1, 1)).toBe('CLOUD');
    });

    it('returns null for an empty bee cell so it falls back to the tile', () => {
      const ctrl = beeCtrl({
        isFlower: () => false,
        isHive: () => false,
        isStaticCloud: () => false,
      });
      expect(describeObject(ctrl, 1, 1)).toBeNull();
      expect(describeCell(ctrl, 1, 1)).toBe('OPEN POS(2,2)');
    });
  });

  describe('describeObject - collector', () => {
    const collectorCtrl = (value: number | undefined) =>
      makeController({
        subtype: {
          isCollector: () => true,
          getCell: () => ({
            getCurrentValue: () => value,
          }),
        },
      });

    it('reports the remaining collectible count', () => {
      expect(describeObject(collectorCtrl(4), 1, 1)).toBe('ITEMS(4)');
    });

    it('returns null for an emptied collectible cell', () => {
      expect(describeObject(collectorCtrl(0), 1, 1)).toBeNull();
    });
  });

  describe('describeObject - farmer', () => {
    const farmerCtrl = (value: number | undefined) =>
      makeController({
        subtype: {
          isFarmer: () => true,
          getCell: () => ({
            getCurrentValue: () => value,
          }),
        },
      });

    it('reports a dirt pile for a positive value', () => {
      expect(describeObject(farmerCtrl(3), 1, 1)).toBe('DIRT(3)');
    });

    it('reports a hole with the absolute depth for a negative value', () => {
      expect(describeObject(farmerCtrl(-2), 1, 1)).toBe('HOLE(2)');
    });

    it('returns null for level ground', () => {
      expect(describeObject(farmerCtrl(0), 1, 1)).toBeNull();
    });
  });

  describe('describeObject - harvester (discriminated by cell class)', () => {
    const harvesterCtrl = (cell: object) =>
      makeController({subtype: {getCell: () => cell}});

    it('reports a crop kind and count', () => {
      const corn = new HarvesterCell(
        SquareType.OPEN,
        3,
        3,
        [HarvesterCell.FeatureType.CORN],
        false
      );
      expect(describeObject(harvesterCtrl(corn), 1, 1)).toBe('CORN(3)');
    });

    it('reports a hidden crop for a cell with multiple possible features', () => {
      const hidden = new HarvesterCell(
        SquareType.OPEN,
        3,
        3,
        [HarvesterCell.FeatureType.CORN, HarvesterCell.FeatureType.PUMPKIN],
        false
      );
      expect(describeObject(harvesterCtrl(hidden), 1, 1)).toBe('HIDDEN_CROP');
    });

    it('returns null for a featureless harvester cell', () => {
      const empty = new HarvesterCell(SquareType.OPEN);
      expect(describeObject(harvesterCtrl(empty), 1, 1)).toBeNull();
    });
  });

  describe('describeObject - planter (discriminated by cell class)', () => {
    const planterCtrl = (cell: object) =>
      makeController({subtype: {getCell: () => cell}});

    it('reports soil', () => {
      const soil = new PlanterCell(
        SquareType.OPEN,
        PlanterCell.FeatureType.SOIL
      );
      expect(describeObject(planterCtrl(soil), 1, 1)).toBe('SOIL');
    });

    it('reports a sprout', () => {
      const sprout = new PlanterCell(
        SquareType.OPEN,
        PlanterCell.FeatureType.SPROUT
      );
      expect(describeObject(planterCtrl(sprout), 1, 1)).toBe('SPROUT');
    });

    it('returns null for an empty planter cell', () => {
      const empty = new PlanterCell(SquareType.OPEN);
      expect(describeObject(planterCtrl(empty), 1, 1)).toBeNull();
    });
  });
});

describe('MazeKeyboardNavigation interaction', () => {
  let wrapper: HTMLElement;
  let svg: SVGSVGElement;
  let nav: MazeKeyboardNavigation;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const focusableCursor = () =>
    svg.querySelector('rect[tabindex="0"]') as SVGRectElement | null;

  beforeEach(() => {
    jest.useFakeTimers();
    wrapper = document.createElement('div');
    wrapper.tabIndex = 0;
    svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    document.body.appendChild(wrapper);
    document.body.appendChild(svg);
    (window as unknown as {Maze: object}).Maze = {
      controller: makeController({pegman: {x: 1, y: 1}}),
    };
    nav = new MazeKeyboardNavigation(wrapper, svg);
  });

  afterEach(() => {
    nav.destroy();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    wrapper.remove();
    svg.remove();
    delete (window as unknown as {Maze?: object}).Maze;
  });

  const press = (key: string, target: EventTarget = wrapper) =>
    target.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));

  it('creates a focusable cursor labelled for pegman on Enter', () => {
    press('Enter');
    const cursor = focusableCursor();
    expect(cursor).not.toBeNull();
    expect(cursor?.getAttribute('aria-label')).toBe('OPEN POS(2,2) HERE');
  });

  it('relabels the cursor as it moves to an adjacent cell', () => {
    press('Enter');
    press('ArrowRight');
    // Cursor moved off pegman to col 2, row 1 (1-based POS(2,3)).
    expect(focusableCursor()?.getAttribute('aria-label')).toBe('OPEN POS(2,3)');
  });

  it('removes the cursor on Escape', () => {
    press('Enter');
    expect(focusableCursor()).not.toBeNull();
    press('Escape');
    expect(focusableCursor()).toBeNull();
  });
});
