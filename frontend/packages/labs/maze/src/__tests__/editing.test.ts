// @vitest-environment jsdom
//
// This package's default vitest environment has no DOM (the map-draft tests
// above don't need one); trayFromToolboxXml below parses XML via DOMParser,
// so this file alone opts into jsdom rather than changing the shared config.
import {describe, expect, it} from 'vitest';

import {
  FeatureType as BeeFeatureType,
  type BeeCellSerialization,
} from '../BeeCell';
import {SquareType} from '../tiles';

import {
  addBlockToProgramXml,
  applyPaint,
  describeCellState,
  getPaintTools,
  getToolboxPalette,
  mapDraftFromLevelProperties,
  paintCell,
  serializeMapDraft,
  toolboxXmlFromTray,
  trayFromToolboxXml,
  type MapDraft,
} from '../editing';

// Lifted verbatim from dashboard/config/levels/custom/maze/OPD-K5-IfE_2022.level's
// serialized_maze — a real bee level with a variable (range) flower cell,
// the exact case Pass B must round-trip unchanged rather than "fix".
const REAL_BEE_SERIALIZED_MAZE: MapDraft = JSON.parse(
  '[[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":2},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1,"featureType":2,"value":1,"cloudType":2,"range":1},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1,"featureType":2,"value":1,"cloudType":2,"range":1},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],[{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}]]',
);

describe('mapDraftFromLevelProperties / serializeMapDraft round-trip', () => {
  it('round-trips a real serialized_maze fixture unchanged, including a variable cell', () => {
    const draft = mapDraftFromLevelProperties(
      undefined,
      REAL_BEE_SERIALIZED_MAZE,
      'bee',
    );
    expect(draft).toEqual(REAL_BEE_SERIALIZED_MAZE);

    const {serialized_maze, maze, initial_dirt} = serializeMapDraft(
      draft!,
      'bee',
    );
    expect(JSON.parse(serialized_maze)).toEqual(REAL_BEE_SERIALIZED_MAZE);

    // The maze projection is the plain tileType matrix — what
    // checkImportedMazeLevel's extractGrid falls back to.
    expect(JSON.parse(maze)).toEqual(
      REAL_BEE_SERIALIZED_MAZE.map(row => row.map(cell => cell.tileType)),
    );

    // initial_dirt is the legacy signed per-cell value grid — it has no way
    // to express a VARIABLE-range cell (the legacy format predates ranges
    // entirely), so the fixture's variable flower cell round-trips as 0,
    // same as any cell with no resolved item.
    const dirt = JSON.parse(initial_dirt) as number[][];
    expect(dirt[4][4]).toBe(0);
    expect(dirt[5][4]).toBe(0);
    expect(dirt[0][0]).toBe(0);

    // The variable cell's featureType/cloudType/range survive untouched —
    // painting never touches a cell it didn't paint.
    const variableCell = draft![4][4] as {
      featureType?: number;
      cloudType?: number;
      range?: number;
    };
    expect(variableCell.featureType).toBe(BeeFeatureType.VARIABLE);
    expect(variableCell.cloudType).toBe(2);
    expect(variableCell.range).toBe(1);
  });

  it('projects a legacy number[][] grid through parseFromOldValues when serialized_maze is absent', () => {
    const legacyGrid = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    const draft = mapDraftFromLevelProperties(legacyGrid, undefined, 'birds');
    expect(draft).toBeDefined();
    expect(draft!.map(row => row.map(cell => cell.tileType))).toEqual(
      legacyGrid,
    );
  });

  it('is undefined when neither field is present', () => {
    expect(mapDraftFromLevelProperties(undefined, undefined, 'birds')).toBeUndefined();
  });
});

describe('getPaintTools', () => {
  it('offers only structural tools for a plain skin', () => {
    const tools = getPaintTools('birds').map(t => t.id);
    expect(tools).toEqual(['wall', 'open', 'start', 'finish', 'obstacle']);
  });

  it('offers bee flower/hive alongside structural tools for the bee skin', () => {
    const tools = getPaintTools('bee').map(t => t.id);
    expect(tools).toEqual([
      'wall',
      'open',
      'start',
      'finish',
      'obstacle',
      'flower',
      'hive',
    ]);
  });

  it('never offers a bee tool on a non-bee skin', () => {
    const tools = getPaintTools('farmer').map(t => t.id);
    expect(tools).not.toContain('flower');
    expect(tools).not.toContain('hive');
  });
});

describe('describeCellState', () => {
  // Pins the fix for the acceptance run's noise item: the paint grid's
  // aria-labels used to announce only the selected tool, never what the
  // cell under it already held.
  it('names each structural tile type', () => {
    expect(describeCellState({tileType: SquareType.WALL}, 'birds')).toBe(
      'wall',
    );
    expect(describeCellState({tileType: SquareType.OPEN}, 'birds')).toBe(
      'open',
    );
    expect(describeCellState({tileType: SquareType.START}, 'birds')).toBe(
      'start',
    );
    expect(describeCellState({tileType: SquareType.FINISH}, 'birds')).toBe(
      'finish',
    );
    expect(describeCellState({tileType: SquareType.OBSTACLE}, 'birds')).toBe(
      'obstacle',
    );
  });

  it('names a bee flower/hive with its current count, distinct from a plain open cell', () => {
    expect(
      describeCellState(
        {
          tileType: SquareType.OPEN,
          featureType: BeeFeatureType.FLOWER,
          value: 3,
        } as BeeCellSerialization,
        'bee',
      ),
    ).toBe('flower (nectar) (3)');
    expect(
      describeCellState(
        {
          tileType: SquareType.OPEN,
          featureType: BeeFeatureType.HIVE,
          value: 2,
        } as BeeCellSerialization,
        'bee',
      ),
    ).toBe('hive (honey) (2)');
    expect(describeCellState({tileType: SquareType.OPEN}, 'bee')).toBe('open');
  });
});

describe('paintCell', () => {
  function blankGrid(rows: number, cols: number): MapDraft {
    return Array.from({length: rows}, () =>
      Array.from({length: cols}, () => ({tileType: SquareType.OPEN})),
    );
  }

  it('paints only the target cell, leaving every other cell unchanged', () => {
    const draft = blankGrid(3, 3);
    const wallTool = getPaintTools('birds').find(t => t.id === 'wall')!;
    const next = paintCell(draft, 1, 1, wallTool);

    expect(next[1][1].tileType).toBe(SquareType.WALL);
    expect(next[0]).toEqual(draft[0]);
    expect(next[2]).toEqual(draft[2]);
    expect(next).not.toBe(draft);
    expect(draft[1][1].tileType).toBe(SquareType.OPEN); // original untouched
  });

  it('painting Start clears a previous Start elsewhere', () => {
    const draft = blankGrid(2, 2);
    draft[0][0] = {tileType: SquareType.START};
    const startTool = getPaintTools('birds').find(t => t.id === 'start')!;

    const next = paintCell(draft, 1, 1, startTool);

    expect(next[0][0].tileType).toBe(SquareType.OPEN);
    expect(next[1][1].tileType).toBe(SquareType.START);
  });

  it('painting Finish onto the Start cell merges into STARTANDFINISH', () => {
    const draft = blankGrid(2, 2);
    draft[0][0] = {tileType: SquareType.START};
    const finishTool = getPaintTools('birds').find(t => t.id === 'finish')!;

    const next = paintCell(draft, 0, 0, finishTool);

    expect(next[0][0].tileType).toBe(SquareType.STARTANDFINISH);
  });

  it('painting Start on a STARTANDFINISH cell elsewhere demotes it to Finish', () => {
    const draft = blankGrid(2, 2);
    draft[0][0] = {tileType: SquareType.STARTANDFINISH};
    const startTool = getPaintTools('birds').find(t => t.id === 'start')!;

    const next = paintCell(draft, 1, 1, startTool);

    expect(next[0][0].tileType).toBe(SquareType.FINISH);
    expect(next[1][1].tileType).toBe(SquareType.START);
  });
});

describe('serializeMapDraft initial_dirt sign encoding', () => {
  function blankGrid(rows: number, cols: number): MapDraft {
    return Array.from({length: rows}, () =>
      Array.from({length: cols}, () => ({tileType: SquareType.OPEN})),
    );
  }

  it('encodes a painted hive as negative and a flower as positive', () => {
    const draft = blankGrid(1, 2);
    const flowerTool = getPaintTools('bee').find(t => t.id === 'flower')!;
    const hiveTool = getPaintTools('bee').find(t => t.id === 'hive')!;
    const withFlower = paintCell(draft, 0, 0, flowerTool);
    const withBoth = paintCell(withFlower, 0, 1, hiveTool);

    const {initial_dirt} = serializeMapDraft(withBoth, 'bee');
    const dirt = JSON.parse(initial_dirt) as number[][];
    expect(dirt[0][0]).toBeGreaterThan(0);
    expect(dirt[0][1]).toBeLessThan(0);
  });

  it('never signs a non-bee skin (farmer dirt stays a plain positive count)', () => {
    const draft = blankGrid(1, 1);
    const fillTool = {
      id: 'pile',
      label: 'Pile',
      makeCell: () => ({tileType: SquareType.OPEN, value: 3}),
    };
    const painted = paintCell(draft, 0, 0, fillTool);
    const {initial_dirt} = serializeMapDraft(painted, 'farmer');
    expect((JSON.parse(initial_dirt) as number[][])[0][0]).toBe(3);
  });
});

describe('applyPaint — burst-painting regression (Author Mode gap #4)', () => {
  // Reproduces, at the pure draft layer, the exact composition a rapid
  // click burst needs: each call's return value threaded back in as the
  // next call's `current`, with no intervening React render to "catch up"
  // a stale closure. Before the fix, MazeLab's handlePaintCell read a
  // `mapDraft` STATE variable that only advances on commit — a burst of
  // synchronous calls sharing one stale base each computed their own
  // single-cell diff from it, and only the last call's diff survived.
  // applyPaint has no such state to go stale: threading its own return
  // value forward is the entire contract, so this test only proves the
  // contract, not the React fix itself — see MazeLab/index.tsx's
  // mapDraftRef for where that contract is actually honoured against real
  // (possibly-batched) React renders.
  it('every cell in a rapid burst of paints survives, none overwritten by a stale base', () => {
    const rows = 5;
    const cols = 6;
    const base: MapDraft = Array.from({length: rows}, () =>
      Array.from({length: cols}, () => ({tileType: SquareType.OPEN})),
    );
    const wallTool = getPaintTools('birds').find(t => t.id === 'wall')!;
    const fallback = () => base;

    let draft: MapDraft | undefined = undefined;
    const paintedCells: [number, number][] = [];
    for (let i = 0; i < 26; i++) {
      const row = i % rows;
      const col = Math.floor(i / rows) % cols;
      paintedCells.push([row, col]);
      draft = applyPaint(draft, fallback, row, col, wallTool);
    }

    expect(draft).toBeDefined();
    for (const [row, col] of paintedCells) {
      expect(draft![row][col].tileType).toBe(SquareType.WALL);
    }
  });

  it('falls back to the served base only for the first call in the burst', () => {
    const base: MapDraft = [
      [{tileType: SquareType.OPEN}, {tileType: SquareType.OPEN}],
    ];
    const wallTool = getPaintTools('birds').find(t => t.id === 'wall')!;
    let fallbackCalls = 0;
    const fallback = () => {
      fallbackCalls++;
      return base;
    };

    let draft: MapDraft | undefined = undefined;
    draft = applyPaint(draft, fallback, 0, 0, wallTool);
    draft = applyPaint(draft, fallback, 0, 1, wallTool);

    expect(fallbackCalls).toBe(1);
    expect(draft![0][0].tileType).toBe(SquareType.WALL);
    expect(draft![0][1].tileType).toBe(SquareType.WALL);
  });
});

describe('addBlockToProgramXml (Author Mode click-to-add, gap #7)', () => {
  const hatOnly =
    '<xml><block type="when_run" deletable="false" movable="false"></block></xml>';

  // Regression: a real Blockly workspace's own serializer never emits a
  // <statement> for an empty input, so a freshly-added repeat's body tag
  // is already gone by the time the NEXT click reads the workspace's
  // (by-then round-tripped) XML back — the exact shape a live click-to-add
  // session produces between clicks. Only the block's type survives that
  // round trip, which is what CONTAINER_BLOCK_STATEMENTS keys on.
  it('still nests into a repeat block after its empty DO tag is stripped, as a real Blockly round-trip would', () => {
    const repeatEntry = getToolboxPalette('birds').find(
      p => p.id === 'repeat',
    )!;
    const withRepeat = addBlockToProgramXml(hatOnly, repeatEntry);
    expect(withRepeat).not.toContain('<statement');

    const withNectar = addBlockToProgramXml(
      withRepeat,
      getToolboxPalette('bee').find(p => p.id === 'getNectar')!,
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(withNectar, 'text/xml');
    const repeatBlock = Array.from(doc.documentElement.children[0].children)
      .find(el => el.tagName === 'next')?.children[0];
    expect(repeatBlock?.getAttribute('type')).toBe('controls_repeat_dropdown');
    const statementEl = Array.from(repeatBlock!.children).find(
      el => el.tagName === 'statement',
    );
    expect(statementEl?.children[0]?.getAttribute('type')).toBe('maze_nectar');
    // Never chained onto the repeat itself via <next>.
    expect(
      Array.from(repeatBlock!.children).some(el => el.tagName === 'next'),
    ).toBe(false);
  });

  it('gives a fresh repeat block an empty DO body so the next click nests into it', () => {
    const repeatEntry = getToolboxPalette('birds').find(
      p => p.id === 'repeat',
    )!;
    const withRepeat = addBlockToProgramXml(hatOnly, repeatEntry);
    const withMoveForward = addBlockToProgramXml(
      withRepeat,
      getToolboxPalette('birds').find(p => p.id === 'moveForward')!,
    );

    const parser = new DOMParser();
    const doc = parser.parseFromString(withMoveForward, 'text/xml');
    const repeatEl = Array.from(
      doc.documentElement.children[0].children,
    ).find(el => el.tagName === 'next');
    const statementEl = repeatEl?.children[0]
      ? Array.from(repeatEl.children[0].children).find(
          el => el.tagName === 'statement',
        )
      : undefined;
    expect(statementEl?.children[0]?.getAttribute('type')).toBe(
      'maze_moveForward',
    );
  });

  it('builds the full repeat(5){moveForward,nectar,turnLeft,moveForward,honey,turnRight} program by click order alone', () => {
    const palette = getToolboxPalette('bee');
    const byId = (id: string) => palette.find(p => p.id === id)!;
    const clicks = [
      'repeat',
      'moveForward',
      'getNectar',
      'turnLeft',
      'moveForward',
      'makeHoney',
      'turnRight',
    ];
    let xml = hatOnly;
    for (const id of clicks) {
      xml = addBlockToProgramXml(xml, byId(id));
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const hat = doc.documentElement.children[0];
    const repeatBlock = Array.from(hat.children)
      .find(el => el.tagName === 'next')
      ?.children[0];
    expect(repeatBlock?.getAttribute('type')).toBe('controls_repeat_dropdown');

    const bodyStatement = Array.from(repeatBlock!.children).find(
      el => el.tagName === 'statement',
    )!;
    const bodyTypes: string[] = [];
    let current: Element | undefined = bodyStatement.children[0];
    while (current) {
      bodyTypes.push(current.getAttribute('type')!);
      const nextEl: Element | undefined = Array.from(current.children).find(
        el => el.tagName === 'next',
      );
      current = nextEl?.children[0] ?? undefined;
    }
    expect(bodyTypes).toEqual([
      'maze_moveForward',
      'maze_nectar',
      'maze_turn',
      'maze_moveForward',
      'maze_honey',
      'maze_turn',
    ]);
    // Nothing was ever chained onto the repeat itself.
    expect(
      Array.from(repeatBlock!.children).some(el => el.tagName === 'next'),
    ).toBe(false);
  });
});

describe('toolbox tray (trayFromToolboxXml / toolboxXmlFromTray)', () => {
  it('matches maze_turn entries by their DIR field, not just block type', () => {
    // Lifted from dashboard/config/levels/custom/maze/courseD_maze_until3_2024.level's
    // toolbox_blocks.
    const tray = trayFromToolboxXml(
      '<xml>' +
        '<block type="maze_move" limit="2"><title name="DIR">moveForward</title></block>' +
        '<block type="maze_turn"><title name="DIR">turnRight</title></block>' +
        '<block type="maze_turn"><title name="DIR">turnLeft</title></block>' +
        '<block type="maze_forever"/>' +
        '<block type="comment"><title name="TEXT"/></block>' +
        '</xml>',
      'birds',
    );

    expect(tray.map(t => t.id)).toEqual([
      // maze_move DIR=moveForward isn't in the palette (only maze_moveForward
      // and maze_move DIR=moveBackward are) — a pass-through chip, not lost.
      expect.stringContaining('custom-maze_move-'),
      'turnRight',
      'turnLeft',
      'forever',
      expect.stringContaining('custom-comment-'),
    ]);
    // The served fragment's limit="2" survives verbatim on the pass-through
    // chip — Pass C0's "carry limit through" applies here too.
    expect(tray[0].xml).toContain('limit="2"');
  });

  it('round-trips a real limit=-bearing fixture (courseD_maze_ramp1_2024) unchanged', () => {
    const xml = '<xml><block type="maze_moveForward" limit="2"/></xml>';
    const tray = trayFromToolboxXml(xml, 'birds');
    expect(tray).toHaveLength(1);
    expect(tray[0].id).toBe('moveForward');
    expect(tray[0].xml).toContain('limit="2"');
    expect(toolboxXmlFromTray(tray)).toBe(
      '<xml><block type="maze_moveForward" limit="2"/></xml>',
    );
  });

  it('composing the tray back to XML preserves chip order', () => {
    const palette = getToolboxPalette('birds');
    const turnLeft = palette.find(p => p.id === 'turnLeft')!;
    const moveForward = palette.find(p => p.id === 'moveForward')!;
    const xml = toolboxXmlFromTray([
      {...turnLeft},
      {...moveForward},
    ]);
    expect(xml).toBe(
      '<xml><block type="maze_turn"><field name="DIR">turnLeft</field></block>' +
        '<block type="maze_moveForward"/></xml>',
    );
  });

  it('offers skin-specific actions only for their skin', () => {
    const beePalette = getToolboxPalette('bee');
    const farmerPalette = getToolboxPalette('farmer');
    expect(beePalette.some(p => p.id === 'getNectar')).toBe(true);
    expect(farmerPalette.some(p => p.id === 'getNectar')).toBe(false);
    expect(farmerPalette.some(p => p.id === 'fill')).toBe(true);
    expect(beePalette.some(p => p.id === 'fill')).toBe(false);
  });
});
