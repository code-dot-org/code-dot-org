import {describe, expect, it} from 'vitest';

import HarvesterCell from '../HarvesterCell';
import MazeMap from '../MazeMap';
import {SquareType} from '../tiles';

describe('HarvesterCell.parseFromOldValues', () => {
  // Pins the crash class Pass G documented: without this override,
  // Cell.parseFromOldValues hardcodes `new Cell(...)`, so a legacy-format
  // Harvester level's cells come back as plain Cells and every Harvester
  // action block (getCorn/plantCorn/...) crashes on mount.
  it('returns a HarvesterCell, not a base Cell', () => {
    const cell = HarvesterCell.parseFromOldValues(SquareType.OPEN, undefined);
    expect(cell).toBeInstanceOf(HarvesterCell);
    expect(cell.getTile()).toBe(SquareType.OPEN);
  });

  it('parses a string tileType the same way Cell.parseFromOldValues does', () => {
    const cell = HarvesterCell.parseFromOldValues('0', undefined);
    expect(cell.getTile()).toBe(SquareType.WALL);
  });

  // The legacy int grid never encoded crop features per cell (unlike
  // Bee's R/P/FC letters) — a parsed cell always has no feature, matching
  // HarvesterCell's own NONE default.
  it('has no crop feature, regardless of initialDirtCell', () => {
    const cell = HarvesterCell.parseFromOldValues(SquareType.OPEN, 3);
    expect(cell.featureType()).toBe(HarvesterCell.FeatureType.NONE);
    expect(cell.getOriginalValue()).toBeUndefined();
    expect(cell.startsHidden()).toBe(false);
  });

  // The real crash site: MazeController.loadLevel_ falls back to
  // MazeMap.parseFromOldValues whenever a level has no serialized_maze.
  it('round-trips through MazeMap.parseFromOldValues', () => {
    const map = MazeMap.parseFromOldValues(
      [
        [0, 1],
        [1, 3],
      ],
      undefined,
      HarvesterCell,
    );
    map.forEachCell(cell => {
      expect(cell).toBeInstanceOf(HarvesterCell);
    });
  });
});
