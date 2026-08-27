import {describe, expect, it} from 'vitest';

import MazeMap from '../MazeMap';
import PlanterCell from '../PlanterCell';
import {SquareType} from '../tiles';

describe('PlanterCell.parseFromOldValues', () => {
  // Pins the crash class Pass G documented: without this override,
  // Cell.parseFromOldValues hardcodes `new Cell(...)`, so a legacy-format
  // Planter level's cells come back as plain Cells and every Planter
  // action block (plant/harvest) crashes on mount.
  it('returns a PlanterCell, not a base Cell', () => {
    const cell = PlanterCell.parseFromOldValues(SquareType.OPEN, undefined);
    expect(cell).toBeInstanceOf(PlanterCell);
    expect(cell.getTile()).toBe(SquareType.OPEN);
  });

  it('parses a string tileType the same way Cell.parseFromOldValues does', () => {
    const cell = PlanterCell.parseFromOldValues('0', undefined);
    expect(cell.getTile()).toBe(SquareType.WALL);
  });

  // The legacy int grid never encoded a soil/sprout feature per cell — a
  // parsed cell always falls back to PlanterCell's own NONE default.
  it('has no soil/sprout feature, regardless of initialDirtCell', () => {
    const cell = PlanterCell.parseFromOldValues(SquareType.OPEN, 3);
    expect(cell.featureType()).toBe(PlanterCell.FeatureType.NONE);
    expect(cell.isSoil()).toBe(false);
    expect(cell.isSprout()).toBe(false);
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
      PlanterCell,
    );
    map.forEachCell(cell => {
      expect(cell).toBeInstanceOf(PlanterCell);
    });
  });
});
