const test = require('tape');
const {JSDOM} = require('jsdom');
global.window = new JSDOM().window;
global.navigator = window.navigator;
global.document = window.document;
global.Element = window.Element;
global.Canvas = require('canvas');
global.Image = global.Canvas.Image;
window.CanvasRenderingContext2D = {};
window.focus = () => {};
window.scrollTo = () => {};
global.Phaser = {};
global.PIXI = require('../../node_modules/phaser/build/pixi');
global.p2 = require('../../node_modules/phaser/build/p2');
global.Phaser = require('phaser');
global.Phaser.AnimationManager.prototype.play = () => {};

const LevelView = require('../../src/js/game/LevelMVC/LevelView');
const LevelModel = require('../../src/js/game/LevelMVC/LevelModel');
const LevelEntity = require('../../src/js/game/LevelMVC/LevelEntity');
const Position = require('../../src/js/game/LevelMVC/Position');

const mockGameController = {
  levelEntity: new LevelEntity({}),
  levelData: {},
  followingPlayer: () => false,
  originalFpsToScaled: () => 60,
  getIsDirectPlayerControl: () => true,
  audioPlayer: {
    play: () => {}
  }
};

const levelData = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  playerName: 'Alex',
  verificationFunction: () => {},
  groundPlane: ["grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","dirt","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass","grass"],
  groundDecorationPlane: ["","","","","","","","","","","","","","","","","","","flowerRose","","","tallGrass","","","","","","","","tallGrass","","","tallGrass","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","tallGrass","flowerRose","","","","","","","",""],
  actionPlane: ["grass","grass","","","","","","","grass","grass","grass","grass","","","","","","","","grass","grass","","","treeOak","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","treeBirch","","",""],
  entities: [['sheep', 6, 4, 1]],
  agentStartPosition: new Position(3, 4),
  agentStartDirection: 1,
  playerStartPosition: new Position(3, 4),
  playerStartDirection: 1,
  useAgent: true,
  usePlayer: true,
};

const levelModel = new LevelModel(levelData, mockGameController);

test('sanity', t => {
  const game = new global.Phaser.Game({
    width: 400,
    height: 400,
    renderer: global.Phaser.HEADLESS,
    state: 'earlyLoad',
  });
  game.state.add('levelRunner', {
    create: () => {
      mockGameController.game = game;
      mockGameController.levelModel = levelModel;
      const view = new LevelView(mockGameController);
      view.create(levelModel);

      t.equal(view.player.sprite.position.x, 102);
      t.equal(view.player.sprite.position.y, 128);

      setTimeout(() => game.destroy(), 0);
      t.end();
    }
  });

  game.state.start('levelRunner');
});

test('draw order', t => {
  const game = new global.Phaser.Game({
    width: 400,
    height: 400,
    renderer: global.Phaser.HEADLESS,
    state: 'earlyLoad',
  });
  game.state.add('levelRunner', {
    create: () => {
      mockGameController.game = game;
      mockGameController.levelModel = levelModel;
      const view = new LevelView(mockGameController);
      view.create(levelModel);
      t.ok(view.player.sprite.sortOrder > view.agent.sprite.sortOrder);

      setTimeout(() => game.destroy(), 0);
      t.end();
    }
  });

  game.state.start('levelRunner');
});

test('selection indicator', t => {
  const game = new global.Phaser.Game({
    width: 400,
    height: 400,
    renderer: global.Phaser.HEADLESS,
    state: 'earlyLoad',
  });
  game.state.add('levelRunner', {
    create: () => {
      mockGameController.game = game;
      mockGameController.levelModel = levelModel;
      const view = new LevelView(mockGameController);
      mockGameController.levelView = view;
      view.create(levelModel);

      const mockCommandQueueItem = {
        succeeded: () => {}
      };

      // selection indicator starts visible on player
      t.equals(view.player.sprite.x, 102);
      t.equals(view.player.sprite.y, 128);
      t.equals(view.selectionIndicator.x, 108);
      t.equals(view.selectionIndicator.y, 148);
      t.true(view.selectionIndicator.visible);

      // selection indicator updates as player moves
      view.player.doMoveForward(mockCommandQueueItem);
      t.equals(view.selectionIndicator.x, 148);
      t.equals(view.selectionIndicator.y, 148);

      view.player.doMoveForward(mockCommandQueueItem);
      t.equals(view.selectionIndicator.x, 188);
      t.equals(view.selectionIndicator.y, 148);

      // selection indicator does not update as agent moves
      view.agent.doMoveForward(mockCommandQueueItem);
      t.equals(view.selectionIndicator.x, 188);
      t.equals(view.selectionIndicator.y, 148);

      setTimeout(() => game.destroy(), 0);
      t.end();
    }
  });

  game.state.start('levelRunner');
});

test('pick up on rails', t => {
  const game = new global.Phaser.Game({
    width: 400,
    height: 400,
    renderer: global.Phaser.HEADLESS,
    state: 'earlyLoad',
  });
  game.state.add('levelRunner', {
    create: () => {
      mockGameController.game = game;
      mockGameController.levelModel = levelModel;
      const view = new LevelView(mockGameController);
      mockGameController.levelView = view;
      view.create(levelModel);
      LevelModel.usePlayer = true;

      for (let i = 0; i < 6; ++i) {
        view.createMiniBlock(i, 0, "diamondMiniblock");
      }

      view.player.setMovePosition(new Position(0, 0));
      view.player.setMovePosition(new Position(1, 0));
      view.player.setMovePosition(new Position(2, 0));

      t.equals(view.collectibleItems.length, 3);

      setTimeout(() => game.destroy(), 0);
      t.end();
    }
  });

  game.state.start('levelRunner');
});
