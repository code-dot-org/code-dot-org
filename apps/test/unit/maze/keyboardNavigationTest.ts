import {cells, tiles} from '@code-dot-org/maze';

import MazeKeyboardNavigation, {
  describeCell,
  describeObject,
} from '@cdo/apps/maze/keyboardNavigation';

const {SquareType, Direction} = tiles;
const {HarvesterCell, PlanterCell} = cells;

type Controller = Parameters<typeof describeCell>[0];

// Build a minimal fake controller. tiles is keyed "row,col" -> SquareType
// (matching map.getTile(row, col)); absent entries read as an open path.
// subtype is merged over a bare default so each test sets only what it needs.
// pegman.d is the facing direction; level carries the block XML scanned to
// decide whether the level uses turning.
function makeController(
  opts: {
    subtype?: object;
    tiles?: Record<string, number>;
    pegman?: {x: number; y: number; d?: number};
    finish?: {x: number; y: number};
    level?: {toolbox?: string; startBlocks?: string};
  } = {}
): Controller {
  const {
    subtype = {},
    tiles: tileMap = {},
    pegman = {x: -1, y: -1},
    finish,
    level,
  } = opts;
  return {
    SQUARE_SIZE: 50,
    subtype: {finish, ...subtype},
    level,
    map: {
      ROWS: 10,
      COLS: 10,
      getTile: (row: number, col: number) => tileMap[`${row},${col}`],
    },
    getPegmanX: () => pegman.x,
    getPegmanY: () => pegman.y,
    getPegmanD: () => pegman.d,
    // The engine always holds the default pegman once it has drawn one.
    pegmanController: {getAllPegmanIds: () => ['default']},
  } as Controller;
}

// The package hides pegmen rather than removing them.
function renderPegman(id = 'default', visibility = 'visible') {
  const el = document.createElement('div');
  el.id = id === 'default' ? 'pegman' : `pegman-${id}`;
  el.setAttribute('visibility', visibility);
  document.body.appendChild(el);
}

function clearPegmen() {
  document.querySelectorAll('[id^="pegman"]').forEach(el => el.remove());
}

describe('maze keyboard navigation reporting', () => {
  describe('describeCell - plain maze (no subtype objects)', () => {
    it('describes an open path with 1-based position', () => {
      const ctrl = makeController();
      expect(describeCell(ctrl, 2, 3)).toBe('Open path. Row 4, column 3.');
    });

    it('describes the start square', () => {
      const ctrl = makeController({tiles: {'3,2': SquareType.START}});
      expect(describeCell(ctrl, 2, 3)).toBe('Start. Row 4, column 3.');
    });

    it('describes an obstacle', () => {
      const ctrl = makeController({tiles: {'3,2': SquareType.OBSTACLE}});
      expect(describeCell(ctrl, 2, 3)).toBe('Obstacle. Row 4, column 3.');
    });

    it('describes the goal at the finish coordinates', () => {
      const ctrl = makeController({finish: {x: 2, y: 3}});
      expect(describeCell(ctrl, 2, 3)).toBe('Goal. Row 4, column 3.');
    });

    it('appends the character-here clause when pegman is on the cell', () => {
      const ctrl = makeController({pegman: {x: 2, y: 3}});
      expect(describeCell(ctrl, 2, 3)).toBe(
        'Open path. Character is here. Row 4, column 3.'
      );
    });
  });

  describe('describeCell - character facing (turn levels only)', () => {
    const turnLevel = {
      toolbox: '<xml><block type="maze_turn" id="turnLeft"/></xml>',
    };

    it.each([
      [Direction.NORTH, 'Character is here, facing north.'],
      [Direction.EAST, 'Character is here, facing east.'],
      [Direction.SOUTH, 'Character is here, facing south.'],
      [Direction.WEST, 'Character is here, facing west.'],
    ])(
      'names pegman facing when the level offers turn blocks (d=%i)',
      (d, token) => {
        const ctrl = makeController({
          pegman: {x: 1, y: 1, d},
          level: turnLevel,
        });
        expect(describeCell(ctrl, 1, 1)).toBe(
          `Open path. ${token} Row 2, column 2.`
        );
      }
    );

    it('detects turning seeded in startBlocks', () => {
      const ctrl = makeController({
        pegman: {x: 1, y: 1, d: Direction.EAST},
        level: {startBlocks: '<xml><block type="maze_turn"/></xml>'},
      });
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Open path. Character is here, facing east. Row 2, column 2.'
      );
    });

    it('omits facing on absolute-movement levels', () => {
      const ctrl = makeController({
        pegman: {x: 1, y: 1, d: Direction.NORTH},
        level: {toolbox: '<xml><block type="maze_moveNorth"/></xml>'},
      });
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Open path. Character is here. Row 2, column 2.'
      );
    });

    it('reports no character clause away from pegman on turn levels', () => {
      const ctrl = makeController({
        pegman: {x: 1, y: 1, d: Direction.NORTH},
        level: turnLevel,
      });
      expect(describeCell(ctrl, 2, 2)).toBe('Open path. Row 3, column 3.');
    });
  });

  describe('describeCell - start block ordering', () => {
    // Position is announced last on every cell; on the start square that
    // means label, then character and (on turn levels) facing, then row/col.
    it('leads with character and facing, position last, on a turn level', () => {
      const ctrl = makeController({
        tiles: {'1,1': SquareType.START},
        pegman: {x: 1, y: 1, d: Direction.NORTH},
        level: {toolbox: '<xml><block type="maze_turn"/></xml>'},
      });
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Start. Character is here, facing north. Row 2, column 2.'
      );
    });

    it('leads with the plain character clause on an absolute level', () => {
      const ctrl = makeController({
        tiles: {'1,1': SquareType.START},
        pegman: {x: 1, y: 1, d: Direction.NORTH},
      });
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Start. Character is here. Row 2, column 2.'
      );
    });

    it('reads "Start" then position when pegman has moved away', () => {
      const ctrl = makeController({
        tiles: {'1,1': SquareType.START},
        pegman: {x: 3, y: 3},
      });
      expect(describeCell(ctrl, 1, 1)).toBe('Start. Row 2, column 2.');
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
      expect(describeObject(ctrl, 1, 1)).toBe('Purple flower, 5 nectar.');
    });

    it('describes a red flower with remaining nectar', () => {
      const ctrl = beeCtrl(
        {isFlower: () => true},
        {isRedFlower: () => true, flowerRemainingCapacity: () => 2}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('Red flower, 2 nectar.');
    });

    it('describes a flower of unlimited nectar without a count', () => {
      const ctrl = beeCtrl(
        {isFlower: () => true},
        {isRedFlower: () => false, flowerRemainingCapacity: () => Infinity}
      );
      expect(describeObject(ctrl, 1, 1)).toBe(
        'Purple flower, unlimited nectar.'
      );
    });

    it('describes a hive with remaining honey capacity', () => {
      const ctrl = beeCtrl(
        {isFlower: () => false, isHive: () => true},
        {hiveRemainingCapacity: () => 3}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('Hive, 3 honey needed.');
    });

    it('describes a hive of unlimited capacity without a count', () => {
      const ctrl = beeCtrl(
        {isFlower: () => false, isHive: () => true},
        {hiveRemainingCapacity: () => Infinity}
      );
      expect(describeObject(ctrl, 1, 1)).toBe('Hive, unlimited honey.');
    });

    it('describes a static cloud', () => {
      const ctrl = beeCtrl({
        isFlower: () => false,
        isHive: () => false,
        isStaticCloud: () => true,
      });
      expect(describeObject(ctrl, 1, 1)).toBe('Hidden cloud.');
    });

    it('returns null for an empty bee cell so it falls back to the tile', () => {
      const ctrl = beeCtrl({
        isFlower: () => false,
        isHive: () => false,
        isStaticCloud: () => false,
      });
      expect(describeObject(ctrl, 1, 1)).toBeNull();
      expect(describeCell(ctrl, 1, 1)).toBe('Open path. Row 2, column 2.');
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
      expect(describeObject(collectorCtrl(4), 1, 1)).toBe(
        '4 items to collect.'
      );
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
      expect(describeObject(farmerCtrl(3), 1, 1)).toBe('Dirt pile, 3.');
    });

    it('reports a hole with the absolute depth for a negative value', () => {
      expect(describeObject(farmerCtrl(-2), 1, 1)).toBe('Hole, 2 dirt needed.');
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
      expect(describeObject(harvesterCtrl(corn), 1, 1)).toBe('Corn, 3.');
    });

    it('reports a hidden crop for a cell with multiple possible features', () => {
      const hidden = new HarvesterCell(
        SquareType.OPEN,
        3,
        3,
        [HarvesterCell.FeatureType.CORN, HarvesterCell.FeatureType.PUMPKIN],
        false
      );
      expect(describeObject(harvesterCtrl(hidden), 1, 1)).toBe('Hidden crop.');
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
      expect(describeObject(planterCtrl(soil), 1, 1)).toBe('Soil.');
    });

    it('reports a sprout', () => {
      const sprout = new PlanterCell(
        SquareType.OPEN,
        PlanterCell.FeatureType.SPROUT
      );
      expect(describeObject(planterCtrl(sprout), 1, 1)).toBe('Sprout.');
    });

    it('returns null for an empty planter cell', () => {
      const empty = new PlanterCell(SquareType.OPEN);
      expect(describeObject(planterCtrl(empty), 1, 1)).toBeNull();
    });
  });

  describe('describeObject - wordsearch (letter read from the DOM)', () => {
    const wordSearchCtrl = () =>
      makeController({subtype: {isWordSearch: () => true}});

    // WordSearch draws each letter into <text id="letter_<row>_<col>">.
    const renderLetter = (row: number, col: number, text: string) => {
      const el = document.createElement('div');
      el.id = `letter_${row}_${col}`;
      el.textContent = text;
      document.body.appendChild(el);
    };

    afterEach(() => {
      document.querySelectorAll('[id^="letter_"]').forEach(el => el.remove());
    });

    it('reports the letter rendered on a tile', () => {
      renderLetter(1, 2, 'E');
      expect(describeObject(wordSearchCtrl(), 2, 1)).toBe('E, letter.');
    });

    it('returns null for the start-square glyph', () => {
      renderLetter(1, 2, '-');
      expect(describeObject(wordSearchCtrl(), 2, 1)).toBeNull();
    });

    it('returns null when no letter has been rendered', () => {
      expect(describeObject(wordSearchCtrl(), 2, 1)).toBeNull();
    });

    it('reports the letter with position via describeCell', () => {
      renderLetter(1, 2, 'S');
      expect(describeCell(wordSearchCtrl(), 2, 1)).toBe(
        'S, letter. Row 2, column 3.'
      );
    });

    it('falls back to the start label on the start square', () => {
      renderLetter(1, 2, '-');
      const ctrl = makeController({
        subtype: {isWordSearch: () => true},
        tiles: {'1,2': SquareType.START},
      });
      expect(describeCell(ctrl, 2, 1)).toBe('Start. Row 2, column 3.');
    });
  });

  // neighborhoodDescriptionsTest covers the wording; these check the wiring.
  describe('describeObject - neighborhood (painter)', () => {
    afterEach(clearPegmen);

    const painterCtrl = (
      cell: {color?: string; value?: number; assetId?: number},
      opts: Parameters<typeof makeController>[0] = {}
    ) =>
      makeController({
        ...opts,
        subtype: {
          isNeighborhood: () => true,
          getSpriteMap: () => ({'0': {name: 'street'}}),
          getCell: () => ({
            getCurrentValue: () => cell.value ?? 0,
            getColor: () => cell.color,
            getAssetId: () => cell.assetId,
          }),
          ...opts.subtype,
        },
      });

    it('describes a painter cell', () => {
      expect(
        describeObject(painterCtrl({color: 'blue', value: 2, assetId: 0}), 1, 1)
      ).toBe('Painted blue. Paint bucket, 2 paint.');
    });

    it('falls back to the tile when a cell has nothing to name', () => {
      const ctrl = painterCtrl({assetId: 999});
      expect(describeObject(ctrl, 1, 1)).toBeNull();
      expect(describeCell(ctrl, 1, 1)).toBe('Open path. Row 2, column 2.');
    });

    it('always names the facing direction, with no block xml to scan', () => {
      renderPegman();
      const ctrl = painterCtrl(
        {assetId: 0},
        {pegman: {x: 1, y: 1, d: Direction.WEST}}
      );
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Street. Painter is here, facing west. Row 2, column 2.'
      );
    });
  });

  describe('describeCharacterHere - neighborhood painters', () => {
    // Painter adds painter-1, painter-2, ... once a program runs.
    afterEach(clearPegmen);

    const painterCtrl = (
      pegmen: Record<string, {x: number; y: number; d?: number}>,
      hidden: string[] = []
    ) => {
      Object.keys(pegmen).forEach(id =>
        renderPegman(id, hidden.includes(id) ? 'hidden' : 'visible')
      );
      return {
        SQUARE_SIZE: 50,
        subtype: {isNeighborhood: () => true},
        map: {ROWS: 10, COLS: 10, getTile: () => undefined},
        pegmanController: {getAllPegmanIds: () => Object.keys(pegmen)},
        getPegmanX: (id = 'default') => pegmen[id]?.x,
        getPegmanY: (id = 'default') => pegmen[id]?.y,
        getPegmanD: (id = 'default') => pegmen[id]?.d,
      } as unknown as Controller;
    };

    it('reports the visible painter, not the hidden default', () => {
      const ctrl = painterCtrl(
        {
          default: {x: 0, y: 0, d: Direction.NORTH},
          'painter-1': {x: 3, y: 4, d: Direction.EAST},
        },
        ['default']
      );
      expect(describeCell(ctrl, 0, 0)).toBe('Open path. Row 1, column 1.');
      expect(describeCell(ctrl, 3, 4)).toBe(
        'Open path. Painter 1 is here, facing east. Row 5, column 4.'
      );
    });

    it('names the default pegman before any painter exists', () => {
      const ctrl = painterCtrl({default: {x: 2, y: 2, d: Direction.SOUTH}});
      expect(describeCell(ctrl, 2, 2)).toBe(
        'Open path. Painter is here, facing south. Row 3, column 3.'
      );
    });

    // Two painters on one cell have to be tellable apart.
    it('names each painter standing on the same cell', () => {
      const ctrl = painterCtrl({
        'painter-1': {x: 1, y: 1, d: Direction.NORTH},
        'painter-2': {x: 1, y: 1, d: Direction.WEST},
      });
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Open path. Painter 1 is here, facing north. ' +
          'Painter 2 is here, facing west. Row 2, column 2.'
      );
    });

    // A reset hides painters, so a hidden one must not be reported.
    it('ignores painters a reset has hidden', () => {
      const ctrl = painterCtrl({'painter-1': {x: 3, y: 4, d: Direction.EAST}}, [
        'painter-1',
      ]);
      expect(describeCell(ctrl, 3, 4)).toBe('Open path. Row 5, column 4.');
    });

    it('reads an unrecognized id as it comes', () => {
      const ctrl = painterCtrl({'jl-7': {x: 1, y: 1, d: Direction.NORTH}});
      expect(describeCell(ctrl, 1, 1)).toBe(
        'Open path. jl-7 is here, facing north. Row 2, column 2.'
      );
    });
  });
});

describe('MazeKeyboardNavigation interaction', () => {
  let svg: SVGSVGElement;
  let nav: MazeKeyboardNavigation;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const focusableCursor = () =>
    svg.querySelector('rect[tabindex="0"]') as SVGRectElement | null;

  beforeEach(() => {
    jest.useFakeTimers();
    // The svg is the interactive host; tabindex lets it take focus like the
    // real Visualization renders it.
    svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.setAttribute('tabindex', '0');
    document.body.appendChild(svg);
    (window as unknown as {Maze: object}).Maze = {
      controller: makeController({pegman: {x: 1, y: 1}}),
    };
    nav = new MazeKeyboardNavigation(svg);
  });

  afterEach(() => {
    clearPegmen();
    nav.destroy();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    svg.remove();
    delete (window as unknown as {Maze?: object}).Maze;
  });

  const press = (key: string, target: EventTarget = svg) =>
    target.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));

  // The controller is read fresh on each navigation action, so a test can
  // swap in a tailored map before pressing Enter.
  const useController = (opts: Parameters<typeof makeController>[0]) => {
    (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
      makeController(opts);
  };

  // announce() clears the live region then sets the text on a 0ms timeout;
  // the region hangs off document.body. Flush pending timers before reading.
  const liveRegionText = () => {
    jest.runOnlyPendingTimers();
    return document.body.querySelector('[aria-live="polite"]')?.textContent;
  };

  it('creates a focusable cursor labelled for pegman on Enter', () => {
    press('Enter');
    const cursor = focusableCursor();
    expect(cursor).not.toBeNull();
    expect(cursor?.getAttribute('aria-label')).toBe(
      'Open path. Character is here. Row 2, column 2.'
    );
  });

  it('relabels the cursor as it moves to an adjacent cell', () => {
    press('Enter');
    press('ArrowRight');
    // Cursor moved off pegman to col 2, row 1, announced 1-based.
    expect(focusableCursor()?.getAttribute('aria-label')).toBe(
      'Open path. Row 2, column 3.'
    );
  });

  // Maze reads the label, so announcing here too would say it twice.
  it('leaves cell descriptions out of the live region on a maze level', () => {
    press('Enter');
    expect(liveRegionText()).toBeFalsy();
    press('ArrowRight');
    expect(liveRegionText()).toBeFalsy();
  });

  it('still announces blocked moves on a maze level', () => {
    useController({pegman: {x: 1, y: 1}, tiles: {'1,2': SquareType.WALL}});
    press('Enter');
    press('ArrowRight');
    expect(liveRegionText()).toBe('Wall.');
  });

  describe('P jumps back to the character', () => {
    it('returns to pegman after wandering off', () => {
      press('Enter');
      press('ArrowRight');
      press('ArrowDown');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Open path. Row 3, column 3.'
      );
      press('p');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Open path. Character is here. Row 2, column 2.'
      );
    });

    it('accepts a capital P', () => {
      press('Enter');
      press('ArrowRight');
      press('P');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Open path. Character is here. Row 2, column 2.'
      );
    });

    it('cycles through every painter on repeated presses', () => {
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        {
          SQUARE_SIZE: 50,
          subtype: {isNeighborhood: () => true},
          map: {ROWS: 10, COLS: 10, getTile: () => undefined},
          pegmanController: {
            getAllPegmanIds: () => ['painter-1', 'painter-2'],
          },
          getPegmanX: (id: string) => (id === 'painter-1' ? 1 : 4),
          getPegmanY: (id: string) => (id === 'painter-1' ? 1 : 5),
          getPegmanD: () => undefined,
        } as unknown as Controller;
      renderPegman('painter-1');
      renderPegman('painter-2');
      // Entry already lands on the first painter, so P advances to the next.
      press('Enter');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Open path. Painter 1 is here. Row 2, column 2.'
      );
      press('p');
      expect(liveRegionText()).toBe(
        'Open path. Painter 2 is here. Row 6, column 5.'
      );
      // Wraps back to the first.
      press('p');
      expect(liveRegionText()).toBe(
        'Open path. Painter 1 is here. Row 2, column 2.'
      );
    });

    // Cycling on coordinates alone would stick on the first of the pair.
    it('reaches a third painter when two share a cell', () => {
      const at: Record<string, number[]> = {
        'painter-1': [1, 1],
        'painter-2': [1, 1],
        'painter-3': [4, 5],
      };
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        {
          SQUARE_SIZE: 50,
          subtype: {isNeighborhood: () => true},
          map: {ROWS: 10, COLS: 10, getTile: () => undefined},
          pegmanController: {getAllPegmanIds: () => Object.keys(at)},
          getPegmanX: (id: string) => at[id][0],
          getPegmanY: (id: string) => at[id][1],
          getPegmanD: () => undefined,
        } as unknown as Controller;
      Object.keys(at).forEach(id => renderPegman(id));

      press('Enter');
      press('p');
      press('p');
      expect(liveRegionText()).toBe(
        'Open path. Painter 3 is here. Row 6, column 5.'
      );
    });

    it('leaves Ctrl+P to the browser', () => {
      press('Enter');
      press('ArrowRight');
      const before = focusableCursor()?.getAttribute('aria-label');
      svg.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'p', ctrlKey: true, bubbles: true})
      );
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(before);
    });

    it('says so when no painter has been placed yet', () => {
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        {
          SQUARE_SIZE: 50,
          subtype: {isNeighborhood: () => true},
          map: {ROWS: 10, COLS: 10, getTile: () => undefined},
          pegmanController: {getAllPegmanIds: () => []},
          getPegmanX: () => undefined,
          getPegmanY: () => undefined,
          getPegmanD: () => undefined,
        } as unknown as Controller;
      press('Enter');
      press('p');
      expect(liveRegionText()).toBe(
        'No painter on the grid yet. Press Run to place one.'
      );
    });

    it('does nothing before the cursor is active', () => {
      press('p');
      expect(focusableCursor()).toBeNull();
    });
  });

  // A level reload clears the svg and takes the cursor with it, firing no blur.
  it('recovers when the maze is rebuilt under an active cursor', () => {
    press('Enter');
    expect(focusableCursor()).not.toBeNull();
    Array.from(svg.children).forEach(child => child.remove());

    // Arrows must not drive a cursor that is no longer on screen.
    press('ArrowRight');
    expect(focusableCursor()).toBeNull();

    // Enter starts a fresh one rather than being swallowed as already active.
    press('Enter');
    expect(focusableCursor()).not.toBeNull();
    expect(focusableCursor()?.getAttribute('aria-label')).toBe(
      'Open path. Character is here. Row 2, column 2.'
    );
  });

  // The grid moves as a program plays. Maze never sets aria-disabled.
  describe('while a program is running', () => {
    // Visualization sets this from the lab's run state.
    const setRunning = (running: boolean) => {
      if (running) {
        svg.setAttribute('aria-disabled', 'true');
      } else {
        svg.removeAttribute('aria-disabled');
      }
    };

    it('refuses to enter, and says why', () => {
      setRunning(true);
      press('Enter');
      expect(focusableCursor()).toBeNull();
      expect(liveRegionText()).toBe(
        'The maze cannot be navigated while program is running.'
      );
    });

    it('stands down when a run starts under an active cursor', () => {
      press('Enter');
      expect(focusableCursor()).not.toBeNull();
      setRunning(true);
      press('ArrowRight');
      expect(focusableCursor()).toBeNull();
    });

    it('lets the student back in once the run finishes', () => {
      setRunning(true);
      press('Enter');
      expect(focusableCursor()).toBeNull();
      setRunning(false);
      press('Enter');
      expect(focusableCursor()).not.toBeNull();
    });
  });

  it('removes the cursor on Escape', () => {
    press('Enter');
    expect(focusableCursor()).not.toBeNull();
    press('Escape');
    expect(focusableCursor()).toBeNull();
  });

  it('announces a wall and holds position when moving into one', () => {
    // Wall east of pegman: tileAt(col, row) reads getTile(row, col).
    useController({pegman: {x: 1, y: 1}, tiles: {'1,2': SquareType.WALL}});
    press('Enter');
    press('ArrowRight');
    expect(liveRegionText()).toBe('Wall.');
    // Cursor stayed on pegman's cell.
    expect(focusableCursor()?.getAttribute('aria-label')).toBe(
      'Open path. Character is here. Row 2, column 2.'
    );
  });

  it('announces the edge when moving out of bounds', () => {
    useController({pegman: {x: 0, y: 0}});
    press('Enter');
    press('ArrowLeft');
    expect(liveRegionText()).toBe('Edge of maze.');
    expect(focusableCursor()?.getAttribute('aria-label')).toBe(
      'Open path. Character is here. Row 1, column 1.'
    );
  });

  it('announces exit and restores focus to the svg on Escape', () => {
    press('Enter');
    press('Escape');
    expect(liveRegionText()).toBe('Exited maze navigation.');
    expect(document.activeElement).toBe(svg);
  });

  // Painter keeps its scenery on wall tiles, so the cursor must reach them.
  describe('neighborhood walls are walkable', () => {
    const neighborhoodController = (tiles: Record<string, number>) =>
      makeController({
        tiles,
        pegman: {x: 1, y: 1},
        subtype: {
          isNeighborhood: () => true,
          getSpriteMap: () => ({'48': {name: 'grass'}}),
          getCell: () => ({
            getCurrentValue: () => 0,
            getColor: () => undefined,
            getAssetId: () => 48,
          }),
        },
      });

    it('moves onto a wall and names the scenery', () => {
      renderPegman();
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        neighborhoodController({'1,2': SquareType.WALL});
      press('Enter');
      press('ArrowRight');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Grass. Row 2, column 3.'
      );
    });

    // Moves must reach the live region; entry must not, or it is read twice.
    it('announces moves but not the cell it entered on', () => {
      renderPegman();
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        neighborhoodController({});
      press('Enter');
      expect(focusableCursor()?.getAttribute('aria-label')).toBe(
        'Grass. Painter is here. Row 2, column 2.'
      );
      expect(liveRegionText()).toBeFalsy();
      press('ArrowRight');
      expect(liveRegionText()).toBe('Grass. Row 2, column 3.');
    });

    it('still refuses to leave the grid', () => {
      renderPegman();
      (window as unknown as {Maze: {controller: Controller}}).Maze.controller =
        neighborhoodController({});
      press('Enter');
      press('ArrowUp');
      press('ArrowUp');
      expect(liveRegionText()).toBe('Edge of the neighborhood.');
    });
  });
});

// maze_locale.js ships only with maze levels; English is the fallback.
describe('maze translations', () => {
  afterEach(() => {
    jest.dontMock('@cdo/apps/maze/locale');
    jest.resetModules();
  });

  it('prefers the maze translation over the English fallback', () => {
    jest.isolateModules(() => {
      jest.doMock('@cdo/apps/maze/locale', () => ({
        mazeNavOpenPath: () => 'CHEMIN LIBRE.',
        mazeNavPosition: ({row, col}: {row: number; col: number}) =>
          `LIGNE ${row}, COLONNE ${col}.`,
      }));
      const localized = require('@cdo/apps/maze/keyboardNavigation');
      expect(localized.describeCell(makeController(), 2, 3)).toBe(
        'CHEMIN LIBRE. LIGNE 4, COLONNE 3.'
      );
    });
  });

  it('falls back per key, so a partial bundle still reads', () => {
    jest.isolateModules(() => {
      jest.doMock('@cdo/apps/maze/locale', () => ({
        mazeNavOpenPath: () => 'CHEMIN LIBRE.',
      }));
      const localized = require('@cdo/apps/maze/keyboardNavigation');
      expect(localized.describeCell(makeController(), 2, 3)).toBe(
        'CHEMIN LIBRE. Row 4, column 3.'
      );
    });
  });
});
