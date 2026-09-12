const test = require('tape');

const LevelModel = require('../../src/js/game/LevelMVC/LevelModel');
const LevelEntity = require('../../src/js/game/LevelMVC/LevelEntity');
const Position = require('../../src/js/game/LevelMVC/Position');

const makePlane = (n, type) => new Array(n).fill(type);
const gridToIndex = (x, y) => y * 10 + x;

const makeLevelDefinition = (width, height) => {
  const size = width * height;
  return {
    playerStartPosition: [0, 2],
    playerStartDirection: 1,
    agentStartPosition: [0, 1],
    agentStartDirection: 1,
    playerName: 'Alex',
    groundPlane: makePlane(size, 'grass'),
    groundDecorationPlane: makePlane(size, ''),
    actionPlane: makePlane(size, ''),
    fluffPlane: makePlane(size, ''),
    gridDimensions: [width, height],
  };
};

const mockGameController = {
  levelEntity: new LevelEntity({}),
  getIsDirectPlayerControl: () => false,
  levelData: {},
  levelView: {
    collectibleItems: [],
    refreshActionGroup: () => {}
  },
  followingPlayer: () => false,
};

test('LevelModel', (t) => {
  t.test('sanity', (t) => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    model.placeBlock("grass");
    t.true(model.actionPlane.getBlockAt([0,2]).blockType === "grass");
    model.placeBlock("gravel");
    t.true(model.actionPlane.getBlockAt([0,2]).blockType === "gravel");
    model.placeBlock("ice");
    t.false(model.actionPlane.getBlockAt([0,2]).blockType === "grass");

    t.equal(model.planeArea(), 25);

    t.assert(model.inBounds(new Position(2, 4)));
    t.false(model.inBounds(new Position(-1, 1)));
    t.false(model.inBounds(new Position(5, 3)));
    t.false(model.inBounds(new Position(3, 5)));

    t.equal(model.yToIndex(2), 10);

    t.assert(model.isPlayerAt(new Position(0, 2)));

    t.end();
  });

  t.test('place block: entity conflict', (t) => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    // player at 0,2 should cause conflict
    t.true(model.checkEntityConflict(new Position(0, 2)));
    t.false(model.checkEntityConflict(new Position(0, 3)));

    t.end();
  });

  t.test('place block: block conflict', (t) => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    model.placeBlock("grass");
    model.player.position = new Position(0, 0);

    // player at 0,0 so only the grass block is left to cause conflict
    t.true(model.checkEntityConflict(new Position(0, 2)));
    t.false(model.checkEntityConflict(new Position(0, 3)));

    t.end();
  });

  t.test('can track player position', (t) => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    t.ok(levelModel.isPlayerAt(new Position(0, 2)));
    t.notOk(levelModel.isPlayerNextTo('sheep'));
    t.ok(levelModel.canMoveForward());
    levelModel.moveForward();
    t.ok(levelModel.isPlayerNextTo('sheep'));
    t.ok(levelModel.isPlayerAt(new Position(1, 2)));
    t.notOk(levelModel.isPlayerAt(new Position(0, 2)));
    t.notOk(levelModel.isPlayerAt(new Position(0, 0)));

    t.end();
  });

  t.test('can move player to given position', (t) => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    t.notOk(levelModel.isPlayerNextTo('sheep'));
    levelModel.moveTo(new Position(1, 2));
    t.ok(levelModel.isPlayerAt(new Position(1, 2)));
    t.ok(levelModel.isPlayerNextTo('sheep'));

    t.end();
  });

  t.test('can get move forward position', (t) => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.playerStartPosition = [2, 2];
    levelDefinition.playerStartDirection = 1; // right
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    // facing right
    t.deepEqual(levelModel.getMoveForwardPosition(), new Position(3, 2));
    levelModel.turnRight(); // to face down
    t.deepEqual(levelModel.getMoveForwardPosition(), new Position(2, 3));
    levelModel.turnRight(); // to face left
    t.deepEqual(levelModel.getMoveForwardPosition(), new Position(1, 2));
    levelModel.turnRight(); // to face up
    t.deepEqual(levelModel.getMoveForwardPosition(), new Position(2, 1));
    levelModel.moveForward(); // move up
    t.deepEqual(levelModel.getMoveForwardPosition(), new Position(2, 0));

    t.end();
  });

  t.test('checkForwardBlock', (t) => {
    t.test('can check forward block is of type water and lava on ground', (t) => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'water';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      t.ok(levelModel.isForwardBlockOfType('water'));
      t.notOk(levelModel.isForwardBlockOfType('lava'));
      t.ok(levelModel.isForwardBlockOfType('')); // '' means action plane empty

      t.end();
    });

    t.test('can check forward block is an action plane block', (t) => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'dirtCoarse';
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'logOak';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      t.ok(levelModel.isForwardBlockOfType('logOak'));
      t.notOk(levelModel.isForwardBlockOfType(''));
      t.notOk(levelModel.isForwardBlockOfType('dirtCoarse'));

      t.end();
    });

    t.test('can check forward block is a tree', (t) => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'treeOak';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      t.ok(levelModel.isForwardBlockOfType('tree'));
      t.ok(levelModel.isForwardBlockOfType('treeOak'));
      t.notOk(levelModel.isForwardBlockOfType('logOak'));
      t.notOk(levelModel.isForwardBlockOfType(''));

      t.end();
    });

    t.test('returns an empty block when checking outside the level boundary', (t) => {
      const levelDefinition = makeLevelDefinition(1, 1);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      t.equal(levelModel.getForwardBlockType(), '');

      t.end();
    });
  });

  t.test('isPlayerNextTo', (t) => {
    t.test('can check if player is next to something in any direction', (t) => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
      let levelModel = new LevelModel(levelDefinition, mockGameController);
      t.notOk(levelModel.isPlayerNextTo('sheep'));

      levelModel.moveTo(new Position(2, 1)); // above sheep
      t.ok(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo(new Position(2, 3)); // below sheep
      t.ok(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo(new Position(1, 2)); // left of sheep
      t.ok(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo(new Position(3, 2)); // right of sheep
      t.ok(levelModel.isPlayerNextTo('sheep'));

      t.end();
    });
  });

  t.test('yToIndex and coordinatesToIndex', (t) => {
    t.test('can calculate plane array offset from grid (x, y)', (t) => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10), mockGameController);
      t.equal(levelModel.yToIndex(5), 50);
      t.equal(levelModel.coordinatesToIndex(new Position(3, 5)), 53);

      let levelModelSmaller = new LevelModel(makeLevelDefinition(5, 5), mockGameController);
      t.equal(levelModelSmaller.yToIndex(5), 25);
      t.equal(levelModelSmaller.coordinatesToIndex(new Position(1, 5)), 26);

      t.end();
    });
  });

  t.test('inBounds', (t) => {
    t.test('can check 10x10 level boundaries', (t) => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10), mockGameController);

      t.ok(levelModel.inBounds(new Position(0, 0)));
      t.ok(levelModel.inBounds(new Position(9, 9)));
      t.ok(levelModel.inBounds(new Position(5, 5)));
      t.ok(levelModel.inBounds(new Position(0, 9)));
      t.ok(levelModel.inBounds(new Position(9, 0)));

      t.notOk(levelModel.inBounds(new Position(10, 10)));
      t.notOk(levelModel.inBounds(new Position(10, 0)));
      t.notOk(levelModel.inBounds(new Position(0, 10)));
      t.notOk(levelModel.inBounds(new Position(-1, -1)));
      t.notOk(levelModel.inBounds(new Position(-1, 0)));
      t.notOk(levelModel.inBounds(new Position(0, -1)));

      t.end();
    });

    t.test('can check 20x20 level boundaries', (t) => {
      let largerDefinition = makeLevelDefinition(20, 20);
      let largerLevelModel = new LevelModel(largerDefinition, mockGameController);
      t.ok(largerLevelModel.inBounds(new Position(0, 0)));
      t.ok(largerLevelModel.inBounds(new Position(19, 19)));
      t.notOk(largerLevelModel.inBounds(new Position(20, 20)));
      t.notOk(largerLevelModel.inBounds(new Position(0, 20)));
      t.notOk(largerLevelModel.inBounds(new Position(20, 0)));

      t.end();
    });

    t.test('can check 10x20 level boundaries', (t) => {
      let rectDefinition = makeLevelDefinition(10, 20);
      rectDefinition.gridDimensions = [10, 20];
      let rectLevelModel = new LevelModel(rectDefinition, mockGameController);
      t.ok(rectLevelModel.inBounds(new Position(0, 0)));
      t.ok(rectLevelModel.inBounds(new Position(9, 19)));
      t.notOk(rectLevelModel.inBounds(new Position(10, 19)));
      t.notOk(rectLevelModel.inBounds(new Position(9, 20)));

      t.end();
    });
  });
});
