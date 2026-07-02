/**
 * Browser-side harness for Playwright integration tests.
 * Loaded by integration-harness.html via Vite dev server.
 * Exposes window.__craftTest with a runLevel() helper that
 * mirrors the original Karma RunLevel.js pattern.
 *
 * Phaser 4 is imported as an ES module by the engine itself — no UMD
 * script, no window.Phaser.
 */
import GameController from '../src/js/game/GameController';
import Position from '../src/js/game/LevelMVC/Position';

import AdventurerLevels from './helpers/AdventurerLevels';
import AgentLevels from './helpers/AgentLevels';
import AquaticLevels from './helpers/AquaticLevels';
import DesignerLevels from './helpers/DesignerLevels';
import FunctionalityLevels from './helpers/FunctionalityLevels';

// Deterministic randomness (matches original Karma stub)
Math.random = () => 0.5;

// GameController is untyped JS — minimal interface for the properties we touch.
interface GameControllerInstance {
  codeOrgAPI: unknown;
  levelModel: unknown;
  game: {destroy(): void; time: Record<string, unknown>};
  loadLevel(config: Record<string, unknown>): void;
}

const levels: Record<string, unknown> = {
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

type CommandsFn = (api: unknown, levelModel: unknown) => Promise<unknown>;

function runLevel(
  levelKey: string,
  commands: CommandsFn,
  step = 0.1,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const container = document.getElementById('phaser-game');
    if (container) container.innerHTML = '';

    const gc = new GameController({
      forceSetTimeOut: true,
      containerId: 'phaser-game',
      assetRoot: '/src/assets/',
      audioPlayer,
      debug: false,
      customSlowMotion: step,
      afterAssetsLoaded: () => {
        const api = gc.codeOrgAPI;
        api.resetAttempt();
        commands(api, gc.levelModel)
          .then((result: unknown) => {
            gc.game.destroy();
            gc.game.time = {};
            resolve(result);
          })
          .catch((err: unknown) => {
            gc.game.destroy();
            gc.game.time = {};
            reject(err);
          });
      },
    }) as unknown as GameControllerInstance;

    gc.loadLevel({
      ...defaults,
      ...(levels[levelKey] as Record<string, unknown>),
    });
  });
}

(window as unknown as {__craftTest: unknown}).__craftTest = {
  ready: true,
  runLevel,
  Position,
};
