let chai = require('chai');
chai.config.includeStack = true;
let assert = chai.assert;

let testUtils = require('../util/testUtils');
testUtils.setupLocale('calc');

let LevelModel = require('@cdo/apps/craft/game/LevelMVC/LevelModel.js');

let _ = require('@cdo/apps/lodash');

let makePlane = (n, type) => _.range(n).map(() => type);
let blankPlane = () => makePlane(100, '');
let gridToIndex = (x, y) => y * 10 + x;

let makeLevelDefinition = (width, height) => {
  let size = width * height;
  return {
    playerStartPosition: [0, 2], // two away from sheep
    playerStartDirection: 1, // right
    playerName: 'Alex',
    groundPlane: makePlane(size, 'grass'),
    groundDecorationPlane: makePlane(size, ''),
    actionPlane: makePlane(size, ''),
    fluffPlane: makePlane(size, ''),
    gridDimensions: [width, height],
    verificationFunction: function (verificationAPI) {
    }
  };
};

describe('LevelModel', () => {
  it('can track player position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition);
    assert(levelModel.isPlayerAt([0, 2]));
    assert(!levelModel.isPlayerNextTo('sheep'));
    assert(levelModel.canMoveForward());
    levelModel.moveForward();
    assert(levelModel.isPlayerNextTo('sheep'));
    assert(levelModel.isPlayerAt([1, 2]));
    assert(!levelModel.isPlayerAt([0, 2]));
    assert(!levelModel.isPlayerAt([0, 0]));
  });

  it('can move player to given position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition);
    assert(!levelModel.isPlayerNextTo('sheep'));
    levelModel.moveTo([1, 2]);
    assert(levelModel.isPlayerAt([1, 2]));
    assert(levelModel.isPlayerNextTo('sheep'));
  });

  it('can get move forward position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.playerStartPosition = [2, 2];
    levelDefinition.playerStartDirection = 1; // right
    let levelModel = new LevelModel(levelDefinition);
    // facing right
    assert.deepEqual(levelModel.getMoveForwardPosition(), [3, 2]);
    levelModel.turnRight(); // to face down
    assert.deepEqual(levelModel.getMoveForwardPosition(), [2, 3]);
    levelModel.turnRight(); // to face left
    assert.deepEqual(levelModel.getMoveForwardPosition(), [1, 2]);
    levelModel.turnRight(); // to face up
    assert.deepEqual(levelModel.getMoveForwardPosition(), [2, 1]);
    levelModel.moveForward(); // move up
    assert.deepEqual(levelModel.getMoveForwardPosition(), [2, 0]);
  });

  describe('checkForwardBlock', () => {
    it('can check forward block is of type water and lava on ground', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'water';

      let levelModel = new LevelModel(levelDefinition);
      assert(levelModel.isForwardBlockOfType('water'));
      assert(!levelModel.isForwardBlockOfType('lava'));
      assert(levelModel.isForwardBlockOfType('')); // '' means action plane empty
    });

    it('can check forward block is an action plane block', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'dirtCoarse';
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'logOak';

      let levelModel = new LevelModel(levelDefinition);
      assert(levelModel.isForwardBlockOfType('logOak'));
      assert(!levelModel.isForwardBlockOfType(''));
      assert(!levelModel.isForwardBlockOfType('dirtCoarse'));
    });

    it('can check forward block is a tree', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'treeOak';

      let levelModel = new LevelModel(levelDefinition);
      assert(levelModel.isForwardBlockOfType('tree'));
      assert(levelModel.isForwardBlockOfType('treeOak'));
      assert(!levelModel.isForwardBlockOfType('logOak'));
      assert(!levelModel.isForwardBlockOfType(''));
    });
  });

  describe('isPlayerNextTo', () => {
    it('can check if player is next to something in any direction', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
      let levelModel = new LevelModel(levelDefinition);
      assert(!levelModel.isPlayerNextTo('sheep'));

      levelModel.moveTo([2, 1]); // above sheep
      assert(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo([2, 3]); // below sheep
      assert(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo([1, 2]); // left of sheep
      assert(levelModel.isPlayerNextTo('sheep'));
      levelModel.moveTo([3, 2]); // right of sheep
      assert(levelModel.isPlayerNextTo('sheep'));
    });
  });

  describe('yToIndex and coordinatesToIndex', () => {
    it('can calculate plane array offset from grid (x, y)', () => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10));
      assert.equal(levelModel.yToIndex(5), 50);
      assert.equal(levelModel.coordinatesToIndex([3, 5]), 53);

      let levelModelSmaller = new LevelModel(makeLevelDefinition(5, 5));
      assert.equal(levelModelSmaller.yToIndex(5), 25);
      assert.equal(levelModelSmaller.coordinatesToIndex([1, 5]), 26);
    });
  });

  describe('inBounds', () => {
    it('can check 10x10 level boundaries', () => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10));

      assert(levelModel.inBounds(0, 0));
      assert(levelModel.inBounds(9, 9));
      assert(levelModel.inBounds(5, 5));
      assert(levelModel.inBounds(0, 9));
      assert(levelModel.inBounds(9, 0));

      assert(!levelModel.inBounds(10, 10));
      assert(!levelModel.inBounds(10, 0));
      assert(!levelModel.inBounds(0, 10));
      assert(!levelModel.inBounds(-1, -1));
      assert(!levelModel.inBounds(-1, 0));
      assert(!levelModel.inBounds(0, -1));
    });

    it('can check 20x20 level boundaries', () => {
      let largerDefinition = makeLevelDefinition(20, 20);
      let largerLevelModel = new LevelModel(largerDefinition);
      assert(largerLevelModel.inBounds(0, 0));
      assert(largerLevelModel.inBounds(19, 19));
      assert(!largerLevelModel.inBounds(20, 20));
      assert(!largerLevelModel.inBounds(0, 20));
      assert(!largerLevelModel.inBounds(20, 0));
    });

    it('can check 10x20 level boundaries', () => {
      let rectDefinition = makeLevelDefinition(20, 20);
      rectDefinition.gridDimensions = [10, 20];
      let rectLevelModel = new LevelModel(rectDefinition);
      assert(rectLevelModel.inBounds(0, 0));
      assert(rectLevelModel.inBounds(9, 19));
      assert(!rectLevelModel.inBounds(10, 19));
      assert(!rectLevelModel.inBounds(9, 20));
    });
  });
});
