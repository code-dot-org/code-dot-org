import {SoundBoard} from '@code-dot-org/audio';
import type {MusicTrackDefinition} from '@code-dot-org/audio';
import type {BlocklyLevelEnvironment} from '@code-dot-org/lab-blockly';

import characters from './characters';
import GameController, {AudioPlayer} from './GameController';
import type {CraftData} from './types';

const MEDIA_URL = '';

const _interfaceImages = {
  DEFAULT: [
    MEDIA_URL + 'Sliced_Parts/MC_Loading_Spinner.gif',
    MEDIA_URL + 'Sliced_Parts/Frame_Large_Plus_Logo.png',
    MEDIA_URL + 'Sliced_Parts/Pop_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/X_Button.png',
    MEDIA_URL + 'Sliced_Parts/Button_Grey_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Run_Button_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png',
    MEDIA_URL + 'Sliced_Parts/Run_Button_Down_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Reset_Button_Up_Slice.png',
    MEDIA_URL + 'Sliced_Parts/MC_Reset_Arrow_Icon.png',
    MEDIA_URL + 'Sliced_Parts/Reset_Button_Down_Slice.png',
    MEDIA_URL + 'Sliced_Parts/Callout_Tail.png',
  ],
  1: [
    MEDIA_URL + 'Sliced_Parts/Steve_Character_Select.png',
    MEDIA_URL + 'Sliced_Parts/Alex_Character_Select.png',
    characters.Steve.staticAvatar,
    characters.Steve.smallStaticAvatar,
    characters.Alex.staticAvatar,
    characters.Alex.smallStaticAvatar,
  ],
  2: [
    // TODO(bjordan): find different pre-load point for feedback images,
    // bucket by selected character
    characters.Alex.winAvatar,
    characters.Steve.winAvatar,
    characters.Alex.failureAvatar,
    characters.Steve.failureAvatar,
  ],
  6: [
    MEDIA_URL + 'Sliced_Parts/House_Option_A_v3.png',
    MEDIA_URL + 'Sliced_Parts/House_Option_B_v3.png',
    MEDIA_URL + 'Sliced_Parts/House_Option_C_v3.png',
  ],
};

const _MUSIC_METADATA: MusicTrackDefinition[] = [
  {volume: 1, hasOgg: true, name: 'vignette1'},
  {volume: 1, hasOgg: true, name: 'vignette2-quiet'},
  {volume: 1, hasOgg: true, name: 'vignette3'},
  {volume: 1, hasOgg: true, name: 'vignette4-intro'},
  {volume: 1, hasOgg: true, name: 'vignette5-shortpiano'},
  {volume: 1, hasOgg: true, name: 'vignette7-funky-chirps-short'},
  {volume: 1, hasOgg: true, name: 'vignette8-free-play'},
];

/**
 * Represents a Minecraft level.
 */
class Craft extends EventTarget {
  controller: GameController;

  constructor(config: {
    container: HTMLDivElement;
    levelData: CraftData;
    environment: BlocklyLevelEnvironment;
  }) {
    super();

    const {container} = config;

    const containerId = 'foobar';

    container.setAttribute('id', containerId);

    const soundBoard = new SoundBoard();
    this.controller = new GameController({
      containerId,
      audioPlayer: soundBoard as AudioPlayer,
      forceSetTimeOut: false,
      afterAssetsLoaded: () => {},
      earlyLoadAssetPacks: ['heroAllAssetsMinusPlayer'],
      earlyLoadNiceToHaveAssetPacks: ['playerSteveEvents', 'playerAgent'],
      assetRoot: '/skins/craft/',
      levelConfig: config.levelData,
    });
  }

  uninitialize() {
    this.controller.destroy();
  }

  run() {
  }

  step() {
  }

  reset() {
  }
}

export default Craft;
