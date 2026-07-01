import sinon from 'sinon';
import GameController from '../../src/js/game/GameController';
import AdventurerLevels from './AdventurerLevels';
import AgentLevels from './AgentLevels';
import AquaticLevels from './AquaticLevels';
import DesignerLevels from './DesignerLevels';
import FunctionalityLevels from './FunctionalityLevels';

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

export default (level, commands, step = 0.1) => {
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
