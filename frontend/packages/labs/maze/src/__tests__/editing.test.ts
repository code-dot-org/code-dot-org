import {describe, expect, it} from 'vitest';

import {FeatureType as BeeFeatureType} from '../BeeCell';
import {SquareType} from '../tiles';

import {
  getPaintTools,
  mapDraftFromLevelProperties,
  paintCell,
  serializeMapDraft,
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

    const {serialized_maze, maze} = serializeMapDraft(draft!);
    expect(JSON.parse(serialized_maze)).toEqual(REAL_BEE_SERIALIZED_MAZE);

    // The maze projection is the plain tileType matrix — what
    // checkImportedMazeLevel's extractGrid falls back to.
    expect(JSON.parse(maze)).toEqual(
      REAL_BEE_SERIALIZED_MAZE.map(row => row.map(cell => cell.tileType)),
    );

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
