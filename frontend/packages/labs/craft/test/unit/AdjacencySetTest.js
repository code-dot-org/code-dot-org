const test = require('tape');

const AdjacencySet = require("../../src/js/game/LevelMVC/AdjacencySet");
const Position = require("../../src/js/game/LevelMVC/Position");

test('AdjacencySets', t => {
  // Separate positions each end up in their own set
  t.deepEqual(new AdjacencySet([
    new Position(0, 0), new Position(1, 1)
  ]).sets, [
    [new Position(0, 0)],
    [new Position(1, 1)],
  ]);

  // Adjacent positions end up in a set all together
  t.deepEqual(new AdjacencySet([
    new Position(0, 0), new Position(1, 1), new Position(1, 0)
  ]).sets, [
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)]
  ]);

  // Can handle combinations
  t.deepEqual(new AdjacencySet([
    new Position(0, 0), new Position(1, 1), new Position(1, 0), new Position(2, 2), new Position(2, 3), new Position(0, 2)
  ]).sets, [
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)],
    [new Position(2, 2), new Position(2, 3)],
    [new Position(0, 2)]
  ]);

  t.end();
});

test('AdjacencySets - custom comparison function', t => {
  // can override the comparison function
  const sameColumn = (left, right) => {
    return left[0] === right[0];
  };

  t.deepEqual(new AdjacencySet([
    new Position(0, 0), new Position(0, 2)
  ], sameColumn).sets, [
    [new Position(0, 0), new Position(0, 2)],
  ]);

  t.deepEqual(new AdjacencySet([
    new Position(0, 0), new Position(1, 0)
  ], sameColumn).sets, [
    [new Position(0, 0)],
    [new Position(1, 0)],
  ]);

  t.end();
});

test('addAdjacency', t => {
  const set = new AdjacencySet();
  set.add(new Position(0, 0));
  t.deepEqual(set.sets, [[new Position(0, 0)]]);
  set.add(new Position(1, 1));
  t.deepEqual(set.sets, [[new Position(0, 0)], [new Position(1, 1)]]);
  set.add(new Position(0, 1));
  t.deepEqual(set.sets, [[new Position(0, 0), new Position(1, 1), new Position(0, 1)]]);
  t.end();
});

test('removeAdjacency', t => {
  const set = new AdjacencySet([new Position(0, 0), new Position(1, 1), new Position(1, 0), new Position(2, 2), new Position(2, 3), new Position(0, 2)]);

  t.true(set.remove(new Position(0, 2)));
  t.deepEqual(set.sets, [
    [new Position(0, 0), new Position(1, 1), new Position(1, 0)],
    [new Position(2, 2), new Position(2, 3)],
  ]);

  t.true(set.remove(new Position(1, 0)));
  t.deepEqual(set.sets, [
    [new Position(2, 2), new Position(2, 3)],
    [new Position(0, 0)],
    [new Position(1, 1)],
  ]);

  t.true(set.remove(new Position(2, 2)));
  t.deepEqual(set.sets, [
    [new Position(0, 0)],
    [new Position(1, 1)],
    [new Position(2, 3)],
  ]);
  t.end();
});
