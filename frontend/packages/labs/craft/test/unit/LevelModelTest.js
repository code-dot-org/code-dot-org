import { describe, it, expect } from 'vitest';

import LevelEntity from '../../src/js/game/LevelMVC/LevelEntity';
import LevelModel from '../../src/js/game/LevelMVC/LevelModel';
import Position from '../../src/js/game/LevelMVC/Position';

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

describe('LevelModel', () => {
  it('sanity', () => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    model.placeBlock("grass");
    expect(model.actionPlane.getBlockAt([0,2]).blockType).toBe("grass");
    model.placeBlock("gravel");
    expect(model.actionPlane.getBlockAt([0,2]).blockType).toBe("gravel");
    model.placeBlock("ice");
    expect(model.actionPlane.getBlockAt([0,2]).blockType).not.toBe("grass");

    expect(model.planeArea()).toBe(25);

    expect(model.inBounds(new Position(2, 4))).toBeTruthy();
    expect(model.inBounds(new Position(-1, 1))).toBe(false);
    expect(model.inBounds(new Position(5, 3))).toBe(false);
    expect(model.inBounds(new Position(3, 5))).toBe(false);

    expect(model.yToIndex(2)).toBe(10);

    expect(model.isPlayerAt(new Position(0, 2))).toBeTruthy();

  });

  it('place block: entity conflict', () => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    // player at 0,2 should cause conflict
    expect(model.checkEntityConflict(new Position(0, 2))).toBe(true);
    expect(model.checkEntityConflict(new Position(0, 3))).toBe(false);

  });

  it('place block: block conflict', () => {
    const levelDefinition = makeLevelDefinition(5, 5);
    const model = new LevelModel(levelDefinition, mockGameController);

    model.placeBlock("grass");
    model.player.position = new Position(0, 0);

    // player at 0,0 so only the grass block is left to cause conflict
    expect(model.checkEntityConflict(new Position(0, 2))).toBe(true);
    expect(model.checkEntityConflict(new Position(0, 3))).toBe(false);

  });

  it('can track player position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    expect(levelModel.isPlayerAt(new Position(0, 2))).toBeTruthy();
    expect(levelModel.isPlayerNextTo('sheep')).toBeFalsy();
    expect(levelModel.canMoveForward()).toBeTruthy();
    levelModel.moveForward();
    expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();
    expect(levelModel.isPlayerAt(new Position(1, 2))).toBeTruthy();
    expect(levelModel.isPlayerAt(new Position(0, 2))).toBeFalsy();
    expect(levelModel.isPlayerAt(new Position(0, 0))).toBeFalsy();

  });

  it('can move player to given position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    expect(levelModel.isPlayerNextTo('sheep')).toBeFalsy();
    levelModel.moveTo(new Position(1, 2));
    expect(levelModel.isPlayerAt(new Position(1, 2))).toBeTruthy();
    expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();

  });

  it('can get move forward position', () => {
    let levelDefinition = makeLevelDefinition(10, 10);
    levelDefinition.playerStartPosition = [2, 2];
    levelDefinition.playerStartDirection = 1; // right
    let levelModel = new LevelModel(levelDefinition, mockGameController);
    // facing right
    expect(levelModel.getMoveForwardPosition()).toEqual(new Position(3, 2));
    levelModel.turnRight(); // to face down
    expect(levelModel.getMoveForwardPosition()).toEqual(new Position(2, 3));
    levelModel.turnRight(); // to face left
    expect(levelModel.getMoveForwardPosition()).toEqual(new Position(1, 2));
    levelModel.turnRight(); // to face up
    expect(levelModel.getMoveForwardPosition()).toEqual(new Position(2, 1));
    levelModel.moveForward(); // move up
    expect(levelModel.getMoveForwardPosition()).toEqual(new Position(2, 0));

  });

  describe('checkForwardBlock', () => {
    it('can check forward block is of type water and lava on ground', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'water';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      expect(levelModel.isForwardBlockOfType('water')).toBeTruthy();
      expect(levelModel.isForwardBlockOfType('lava')).toBeFalsy();
      expect(levelModel.isForwardBlockOfType('')).toBeTruthy(); // '' means action plane empty

    });

    it('can check forward block is an action plane block', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.groundPlane[gridToIndex(1, 0)] = 'dirtCoarse';
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'logOak';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      expect(levelModel.isForwardBlockOfType('logOak')).toBeTruthy();
      expect(levelModel.isForwardBlockOfType('')).toBeFalsy();
      expect(levelModel.isForwardBlockOfType('dirtCoarse')).toBeFalsy();

    });

    it('can check forward block is a tree', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right
      levelDefinition.actionPlane[gridToIndex(1, 0)] = 'treeOak';

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      expect(levelModel.isForwardBlockOfType('tree')).toBeTruthy();
      expect(levelModel.isForwardBlockOfType('treeOak')).toBeTruthy();
      expect(levelModel.isForwardBlockOfType('logOak')).toBeFalsy();
      expect(levelModel.isForwardBlockOfType('')).toBeFalsy();

    });

    it('returns an empty block when checking outside the level boundary', () => {
      const levelDefinition = makeLevelDefinition(1, 1);
      levelDefinition.playerStartPosition = [0, 0];
      levelDefinition.playerStartDirection = 1; // right

      let levelModel = new LevelModel(levelDefinition, mockGameController);
      expect(levelModel.getForwardBlockType()).toBe('');

    });
  });

  describe('isPlayerNextTo', () => {
    it('can check if player is next to something in any direction', () => {
      let levelDefinition = makeLevelDefinition(10, 10);
      levelDefinition.actionPlane[gridToIndex(2, 2)] = 'sheep';
      let levelModel = new LevelModel(levelDefinition, mockGameController);
      expect(levelModel.isPlayerNextTo('sheep')).toBeFalsy();

      levelModel.moveTo(new Position(2, 1)); // above sheep
      expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();
      levelModel.moveTo(new Position(2, 3)); // below sheep
      expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();
      levelModel.moveTo(new Position(1, 2)); // left of sheep
      expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();
      levelModel.moveTo(new Position(3, 2)); // right of sheep
      expect(levelModel.isPlayerNextTo('sheep')).toBeTruthy();

    });
  });

  describe('yToIndex and coordinatesToIndex', () => {
    it('can calculate plane array offset from grid (x, y)', () => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10), mockGameController);
      expect(levelModel.yToIndex(5)).toBe(50);
      expect(levelModel.coordinatesToIndex(new Position(3, 5))).toBe(53);

      let levelModelSmaller = new LevelModel(makeLevelDefinition(5, 5), mockGameController);
      expect(levelModelSmaller.yToIndex(5)).toBe(25);
      expect(levelModelSmaller.coordinatesToIndex(new Position(1, 5))).toBe(26);

    });
  });

  describe('inBounds', () => {
    it('can check 10x10 level boundaries', () => {
      let levelModel = new LevelModel(makeLevelDefinition(10, 10), mockGameController);

      expect(levelModel.inBounds(new Position(0, 0))).toBeTruthy();
      expect(levelModel.inBounds(new Position(9, 9))).toBeTruthy();
      expect(levelModel.inBounds(new Position(5, 5))).toBeTruthy();
      expect(levelModel.inBounds(new Position(0, 9))).toBeTruthy();
      expect(levelModel.inBounds(new Position(9, 0))).toBeTruthy();

      expect(levelModel.inBounds(new Position(10, 10))).toBeFalsy();
      expect(levelModel.inBounds(new Position(10, 0))).toBeFalsy();
      expect(levelModel.inBounds(new Position(0, 10))).toBeFalsy();
      expect(levelModel.inBounds(new Position(-1, -1))).toBeFalsy();
      expect(levelModel.inBounds(new Position(-1, 0))).toBeFalsy();
      expect(levelModel.inBounds(new Position(0, -1))).toBeFalsy();

    });

    it('can check 20x20 level boundaries', () => {
      let largerDefinition = makeLevelDefinition(20, 20);
      let largerLevelModel = new LevelModel(largerDefinition, mockGameController);
      expect(largerLevelModel.inBounds(new Position(0, 0))).toBeTruthy();
      expect(largerLevelModel.inBounds(new Position(19, 19))).toBeTruthy();
      expect(largerLevelModel.inBounds(new Position(20, 20))).toBeFalsy();
      expect(largerLevelModel.inBounds(new Position(0, 20))).toBeFalsy();
      expect(largerLevelModel.inBounds(new Position(20, 0))).toBeFalsy();

    });

    it('can check 10x20 level boundaries', () => {
      let rectDefinition = makeLevelDefinition(10, 20);
      rectDefinition.gridDimensions = [10, 20];
      let rectLevelModel = new LevelModel(rectDefinition, mockGameController);
      expect(rectLevelModel.inBounds(new Position(0, 0))).toBeTruthy();
      expect(rectLevelModel.inBounds(new Position(9, 19))).toBeTruthy();
      expect(rectLevelModel.inBounds(new Position(10, 19))).toBeFalsy();
      expect(rectLevelModel.inBounds(new Position(9, 20))).toBeFalsy();

    });
  });
});
