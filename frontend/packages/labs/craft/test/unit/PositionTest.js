import { describe, it, expect } from 'vitest';

import Position from '../../src/js/game/LevelMVC/Position';

it('isAdjacent', () => {
  const center = new Position(0, 0);
  expect(Position.isAdjacent(center, new Position(0, 1))).toBe(true);
  expect(Position.isAdjacent(center, new Position(1, 0))).toBe(true);
  expect(Position.isAdjacent(center, new Position(0, -1))).toBe(true);
  expect(Position.isAdjacent(center, new Position(-1, 0))).toBe(true);

  expect(Position.isAdjacent(center, new Position(-1, -1))).toBe(false);
  expect(Position.isAdjacent(center, new Position(1, 1))).toBe(false);

});

it('getOrthogonalPositions', () => {
  expect(Position.getOrthogonalPositions(new Position(0, 0))).toEqual([
    new Position(0, -1),
    new Position(1, 0),
    new Position(0, 1),
    new Position(-1, 0)
  ]);

});
