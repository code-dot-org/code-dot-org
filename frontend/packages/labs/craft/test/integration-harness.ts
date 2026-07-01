/**
 * Browser-side harness for Playwright integration tests.
 * Loaded by integration-harness.html via Vite dev server.
 * Exposes window.__craftTest with a runLevel() helper that
 * mirrors the original Karma RunLevel.js pattern.
 *
 * Phaser is loaded as a UMD script in the HTML (sets window.Phaser + window.PIXI).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import GameController from '../src/js/game/GameController';
import Position from '../src/js/game/LevelMVC/Position';

import AdventurerLevels from './helpers/AdventurerLevels';
import AgentLevels from './helpers/AgentLevels';
import AquaticLevels from './helpers/AquaticLevels';
import DesignerLevels from './helpers/DesignerLevels';
import FunctionalityLevels from './helpers/FunctionalityLevels';

// Deterministic randomness (matches original Karma stub)
Math.random = () => 0.5;

const levels: Record<string, any> = {
  ...AdventurerLevels,
  ...AgentLevels,
  ...AquaticLevels,
  ...DesignerLevels,
  ...FunctionalityLevels,
};

const defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: Array(100).fill(''),
  playerName: 'Alex',
  playerStartPosition: [] as number[],
};

const audioPlayer = {
  register() {},
  play() {},
  playURL() {},
  registerByFilenamesAndID() {},
  stopLoopingAudio() {},
  get() {
    return undefined;
  },
};

type CommandsFn = (api: any, levelModel: any) => Promise<any>;

function runLevel(
  levelKey: string,
  commands: CommandsFn,
  step = 0.1,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const container = document.getElementById('phaser-game');
    if (container) container.innerHTML = '';

    const gc: any = new GameController({
      forceSetTimeOut: true,
      Phaser: (window as any).Phaser,
      containerId: 'phaser-game',
      assetRoot: '/src/assets/',
      audioPlayer,
      debug: false,
      customSlowMotion: step,
      afterAssetsLoaded: () => {
        const api = gc.codeOrgAPI;
        api.resetAttempt();
        commands(api, gc.levelModel)
          .then((result: any) => {
            gc.game.destroy();
            gc.game.time = {};
            resolve(result);
          })
          .catch((err: any) => {
            gc.game.destroy();
            gc.game.time = {};
            reject(err);
          });
      },
    });

    gc.loadLevel(Object.assign({}, defaults, levels[levelKey]));
  });
}

(window as any).__craftTest = {
  ready: true,
  runLevel,
  Position,
};
