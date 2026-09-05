const sinon = require("sinon");
const GameController = require("../../src/js/game/GameController");
const AdventurerLevels = require("./AdventurerLevels");
const AgentLevels = require("./AgentLevels");
const AquaticLevels = require("./AquaticLevels");
const DesignerLevels = require("./DesignerLevels");
const FunctionalityLevels = require("./FunctionalityLevels");

sinon.stub(Math, "random").returns(0.5);

const levels = Object.assign({}, AdventurerLevels, AgentLevels, AquaticLevels, DesignerLevels, FunctionalityLevels);

const defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
  playerName: 'Alex',
  playerStartPosition: [],
};

module.exports = (level, commands, step = 0.1) => {
  const gameController = new GameController({
    forceSetTimeOut: true,
    Phaser: window.Phaser,
    assetRoot: '/base/src/assets/',
    audioPlayer: {
      register: () => {},
      play: () => {},
    },
    debug: false,
    customSlowMotion: step,
    afterAssetsLoaded: () => {
      const api = gameController.codeOrgAPI;
      api.resetAttempt();
      commands(api, gameController.levelModel).then(() => {
        // Clean up.
        gameController.game.destroy();
        gameController.game.time = {};
      });
    },
  });

  gameController.loadLevel(Object.assign({}, defaults, levels[level]));
};
