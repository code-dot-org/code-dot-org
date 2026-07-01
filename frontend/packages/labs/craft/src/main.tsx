import {initializeCore} from '@code-dot-org/core';

import {GameController} from './index';
import {CraftLabFixtures} from './fixtures';

initializeCore({plugins: []});

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

const assetRoot = new URL('./assets/', import.meta.url).href;
const level = CraftLabFixtures.defaultLevel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- GameController is untyped
const gameController: any = new GameController({
  Phaser: window.Phaser,
  containerId: 'phaser-game',
  assetRoot,
  audioPlayer,
  debug: true,
  earlyLoadAssetPacks: level.earlyLoadAssetPacks,
  earlyLoadNiceToHaveAssetPacks: level.earlyLoadNiceToHaveAssetPacks,
  afterAssetsLoaded: () => {
    gameController.codeOrgAPI.startAttempt();
  },
});

gameController.loadLevel(level);
