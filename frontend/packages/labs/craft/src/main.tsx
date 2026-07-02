import {initializeCore} from '@code-dot-org/core';

import {CraftLabFixtures} from './fixtures';

import {GameController} from './index';

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
