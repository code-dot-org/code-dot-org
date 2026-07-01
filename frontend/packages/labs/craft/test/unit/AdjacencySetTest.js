import { describe, it, expect } from 'vitest';

import AdjacencySet from '../../src/js/game/LevelMVC/AdjacencySet';
import Position from '../../src/js/game/LevelMVC/Position';

it('AdjacencySets', () => {
  // Separate positions each end up in their own set
  expect(new AdjacencySet([
    new Position(0, 0), new Position(1, 1)
  ]).sets).toEqual([
    [new Position(0, 0)],
    [new Position(1, 1)],
  ]);

  // Adjacent positions end up in a set all together
  expect(new AdjacencySet([
    new Position(0, 0), new Position(1, 1), new Position(1, 0)
  ]).sets).toEqual([
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)]
  ]);

  // Can handle combinations
  expect(new AdjacencySet([
    new Position(0, 0), new Position(1, 1), new Position(1, 0), new Position(2, 2), new Position(2, 3), new Position(0, 2)
  ]).sets).toEqual([
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)],
    [new Position(2, 2), new Position(2, 3)],
    [new Position(0, 2)]
  ]);

});

it('AdjacencySets - custom comparison function', () => {
  // can override the comparison function
  const sameColumn = (left, right) => {
    return left[0] === right[0];
  };

  expect(new AdjacencySet([
    new Position(0, 0), new Position(0, 2)
  ], sameColumn).sets).toEqual([
    [new Position(0, 0), new Position(0, 2)],
  ]);

  expect(new AdjacencySet([
    new Position(0, 0), new Position(1, 0)
  ], sameColumn).sets).toEqual([
    [new Position(0, 0)],
    [new Position(1, 0)],
  ]);

});

it('addAdjacency', () => {
  const set = new AdjacencySet();
  set.add(new Position(0, 0));
  expect(set.sets).toEqual([[new Position(0, 0)]]);
  set.add(new Position(1, 1));
  expect(set.sets).toEqual([[new Position(0, 0)], [new Position(1, 1)]]);
  set.add(new Position(0, 1));
  expect(set.sets).toEqual([[new Position(0, 0), new Position(1, 1), new Position(0, 1)]]);
});

it('removeAdjacency', () => {
  const set = new AdjacencySet([new Position(0, 0), new Position(1, 1), new Position(1, 0), new Position(2, 2), new Position(2, 3), new Position(0, 2)]);

  expect(set.remove(new Position(0, 2))).toBe(true);
  expect(set.sets).toEqual([
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)],
    [new Position(2, 2), new Position(2, 3)],
  ]);

  expect(set.remove(new Position(1, 0))).toBe(true);
  expect(set.sets).toEqual([
    [new Position(2, 2), new Position(2, 3)],
    [new Position(0, 0)],
    [new Position(1, 1)],
  ]);

  expect(set.remove(new Position(2, 2))).toBe(true);
  expect(set.sets).toEqual([
    [new Position(0, 0)],
    [new Position(1, 1)],
    [new Position(2, 3)],
  ]);
});
