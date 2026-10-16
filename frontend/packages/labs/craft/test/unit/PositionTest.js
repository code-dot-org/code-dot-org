const test = require('tape');

const Position = require("../../src/js/game/LevelMVC/Position");

test('isAdjacent', t => {
  const center = new Position(0, 0);
  t.true(Position.isAdjacent(center, new Position(0, 1)));
  t.true(Position.isAdjacent(center, new Position(1, 0)));
  t.true(Position.isAdjacent(center, new Position(0, -1)));
  t.true(Position.isAdjacent(center, new Position(-1, 0)));

  t.false(Position.isAdjacent(center, new Position(-1, -1)));
  t.false(Position.isAdjacent(center, new Position(1, 1)));

  t.end();
});

test('getOrthogonalPositions', t => {
  t.deepEqual(Position.getOrthogonalPositions(new Position(0, 0)), [
    new Position(0, -1),
    new Position(1, 0),
    new Position(0, 1),
    new Position(-1, 0)
  ]);

  t.end();
});
