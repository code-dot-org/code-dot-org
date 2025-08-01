import type Phaser from 'phaser';

import type GameController from './GameController';
import type {AudioPlayer} from './GameController';

/** Describes an image asset. */
export interface ImageAssetDefinition {
  /** Denotes that the asset is an 'image' */
  type: 'image';
  /** The URL of the image */
  path: string;
}

/** Describes a sound asset. */
export interface SoundAssetDefinition {
  /** Denotes that the asset is a 'sound' */
  type: 'sound';
  /** The URL of the mp3 version of the sound */
  mp3: string;
  /** The URL of the ogg version of the sound */
  ogg: string;
}

/** Describes an 'Atlas' */
export interface AtlasAssetDefinition {
  /** Denotes that the asset is an 'atlas' */
  type: 'atlas';
  /** The URL of the PNG related to this atlas data */
  pngPath: string;
  /** The URL of JSON data defining this atlas data */
  jsonPath: string;
}

/**
 * Represents any possible loadable Asset.
 */
export type AssetDefinition =
  | ImageAssetDefinition
  | SoundAssetDefinition
  | AtlasAssetDefinition;

/**
 * Represents all known assets..
 */
export interface Assets {
  [key: string]: AssetDefinition;
}

/**
 * Denotes a set of assets that are grouped together.
 */
export type AssetPack = string[];

/**
 * Groups of assets by name.
 */
export interface AssetPacks {
  [key: string]: AssetPack;
}

/**
 * Describes all of the named assets and asset packs.
 */
class AssetLoader {
  protected controller: GameController;
  protected audioPlayer: AudioPlayer;
  protected assetRoot: string;
  protected assets: Assets;
  protected assetPacks: AssetPacks;

  /**
   * Constructs an AssetLoader which keeps track of all known possible assets
   * and can elect to load them into our game renderer as necessary.
   */
  constructor(controller: GameController) {
    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.assetRoot = controller.assetRoot;

    this.assets = {
      entityShadow: {
        type: 'image',
        path: `${this.assetRoot}images/Character_Shadow.png`,
      },
      selectionIndicator: {
        type: 'image',
        path: `${this.assetRoot}images/Selection_Indicator.png`,
      },
      finishOverlay: {
        type: 'image',
        path: `${this.assetRoot}images/WhiteRect.png`,
      },
      underwaterOverlay: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Water_Caustics.png`,
        jsonPath: `${this.assetRoot}images/Water_Caustics.json`,
      },
      bed: {
        type: 'image',
        path: `${this.assetRoot}images/Bed.png`,
      },
      playerSteve: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Steve1013.png`,
        jsonPath: `${this.assetRoot}images/Steve1013.json`,
      },
      playerAlex: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Alex1013.png`,
        jsonPath: `${this.assetRoot}images/Alex1013.json`,
      },
      playerSteveEvents: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Steve_2016.png`,
        jsonPath: `${this.assetRoot}images/Steve_2016.json`,
      },
      playerAlexEvents: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/DevAlex.png`,
        jsonPath: `${this.assetRoot}images/DevAlex.json`,
      },
      playerAgent: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Agent.png`,
        jsonPath: `${this.assetRoot}images/Agent.json`,
      },
      playerSteveAquatic: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Steve_2018.png`,
        jsonPath: `${this.assetRoot}images/Steve_2018.json`,
      },
      playerAlexAquatic: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Alex_2018.png`,
        jsonPath: `${this.assetRoot}images/Alex_2018.json`,
      },
      AO: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/AO.png`,
        jsonPath: `${this.assetRoot}images/AO.json`,
      },
      LavaGlow: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/LavaGlow.png`,
        jsonPath: `${this.assetRoot}images/LavaGlow.json`,
      },
      WaterAO: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/WaterAO.png`,
        jsonPath: `${this.assetRoot}images/WaterAO.json`,
      },
      blockShadows: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Block_Shadows.png`,
        jsonPath: `${this.assetRoot}images/Block_Shadows.json`,
      },
      undergroundFow: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/UndergroundFoW.png`,
        jsonPath: `${this.assetRoot}images/UndergroundFoW.json`,
      },
      blocks: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Blocks.png`,
        jsonPath: `${this.assetRoot}images/Blocks.json`,
      },
      leavesAcacia: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Acacia_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Acacia_Decay.json`,
      },
      leavesBirch: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Birch_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Birch_Decay.json`,
      },
      leavesJungle: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Jungle_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Jungle_Decay.json`,
      },
      leavesOak: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Oak_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Oak_Decay.json`,
      },
      leavesSpruce: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Spruce_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Spruce_Decay.json`,
      },
      leavesSpruceSnowy: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Leaves_Spruce_Snowy_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Spruce_Snowy_Decay.json`,
      },
      sheep: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Sheep_2016.png`,
        jsonPath: `${this.assetRoot}images/Sheep_2016.json`,
      },
      crops: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Crops.png`,
        jsonPath: `${this.assetRoot}images/Crops.json`,
      },
      torch: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Torch.png`,
        jsonPath: `${this.assetRoot}images/Torch.json`,
      },
      destroyOverlay: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Destroy_Overlay.png`,
        jsonPath: `${this.assetRoot}images/Destroy_Overlay.json`,
      },
      blockExplode: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/BlockExplode.png`,
        jsonPath: `${this.assetRoot}images/BlockExplode.json`,
      },
      miningParticles: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/MiningParticles.png`,
        jsonPath: `${this.assetRoot}images/MiningParticles.json`,
      },
      miniBlocks: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Miniblocks.png`,
        jsonPath: `${this.assetRoot}images/Miniblocks.json`,
      },
      lavaPop: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/LavaPop.png`,
        jsonPath: `${this.assetRoot}images/LavaPop.json`,
      },
      redstoneSparkle: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Redstone_Sparkle.png`,
        jsonPath: `${this.assetRoot}images/Redstone_Sparkle.json`,
      },
      fire: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Fire.png`,
        jsonPath: `${this.assetRoot}images/Fire.json`,
      },
      bubbles: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Bubbles.png`,
        jsonPath: `${this.assetRoot}images/Bubbles.json`,
      },
      explosion: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Explosion.png`,
        jsonPath: `${this.assetRoot}images/Explosion.json`,
      },
      door: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Door.png`,
        jsonPath: `${this.assetRoot}images/Door.json`,
      },
      doorIron: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Door_Iron.png`,
        jsonPath: `${this.assetRoot}images/Door_Iron.json`,
      },
      rails: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Rails.png`,
        jsonPath: `${this.assetRoot}images/Rails.json`,
      },
      tnt: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/TNT.png`,
        jsonPath: `${this.assetRoot}images/TNT.json`,
      },
      burningInSun: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/BurningInSun.png`,
        jsonPath: `${this.assetRoot}images/BurningInSun.json`,
      },
      zombie: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Zombie.png`,
        jsonPath: `${this.assetRoot}images/Zombie.json`,
      },
      ironGolem: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Iron_Golem.png`,
        jsonPath: `${this.assetRoot}images/Iron_Golem.json`,
      },
      creeper: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Creeper_2016.png`,
        jsonPath: `${this.assetRoot}images/Creeper_2016.json`,
      },
      cow: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Cow.png`,
        jsonPath: `${this.assetRoot}images/Cow.json`,
      },
      chicken: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Chicken.png`,
        jsonPath: `${this.assetRoot}images/Chicken.json`,
      },
      cod: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Cod_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Cod_2018.json`,
      },
      dolphin: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Dolphin_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Dolphin_2018.json`,
      },
      ghast: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/Ghast.png`,
        jsonPath: `${this.assetRoot}images/Ghast.json`,
      },
      salmon: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Salmon_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Salmon_2018.json`,
      },
      seaTurtle: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Sea_Turtle_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Sea_Turtle_2018.json`,
      },
      squid: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Squid_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Squid_2018.json`,
      },
      tropicalFish: {
        type: 'atlas',
        pngPath: `${this.assetRoot}images/entities/Tropical_Fish_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Tropical_Fish_2018.json`,
      },
      dig_wood1: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/dig_wood1.mp3`,
        ogg: `${this.assetRoot}audio/dig_wood1.ogg`,
      },
      stepGrass: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/step_grass1.mp3`,
        ogg: `${this.assetRoot}audio/step_grass1.ogg`,
      },
      stepWood: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/wood2.mp3`,
        ogg: `${this.assetRoot}audio/wood2.ogg`,
      },
      stepStone: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/stone2.mp3`,
        ogg: `${this.assetRoot}audio/stone2.ogg`,
      },
      stepGravel: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/gravel1.mp3`,
        ogg: `${this.assetRoot}audio/gravel1.ogg`,
      },
      stepFarmland: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth4.mp3`,
        ogg: `${this.assetRoot}audio/cloth4.ogg`,
      },
      failure: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/break.mp3`,
        ogg: `${this.assetRoot}audio/break.ogg`,
      },
      success: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/levelup.mp3`,
        ogg: `${this.assetRoot}audio/levelup.ogg`,
      },
      fall: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fallsmall.mp3`,
        ogg: `${this.assetRoot}audio/fallsmall.ogg`,
      },
      fuse: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fuse.mp3`,
        ogg: `${this.assetRoot}audio/fuse.ogg`,
      },
      explode: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/explode3.mp3`,
        ogg: `${this.assetRoot}audio/explode3.ogg`,
      },
      placeBlock: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth1.mp3`,
        ogg: `${this.assetRoot}audio/cloth1.ogg`,
      },
      collectedBlock: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/pop.mp3`,
        ogg: `${this.assetRoot}audio/pop.ogg`,
      },
      bump: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/hit3.mp3`,
        ogg: `${this.assetRoot}audio/hit3.ogg`,
      },
      punch: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth1.mp3`,
        ogg: `${this.assetRoot}audio/cloth1.ogg`,
      },
      fizz: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fizz.mp3`,
        ogg: `${this.assetRoot}audio/fizz.ogg`,
      },
      doorOpen: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/door_open.mp3`,
        ogg: `${this.assetRoot}audio/door_open.ogg`,
      },
      houseSuccess: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/launch1.mp3`,
        ogg: `${this.assetRoot}audio/launch1.ogg`,
      },
      minecart: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/minecartBase.mp3`,
        ogg: `${this.assetRoot}audio/minecartBase.ogg`,
      },
      sheepBaa: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/say3.mp3`,
        ogg: `${this.assetRoot}audio/say3.ogg`,
      },
      chickenHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/chickenhurt2.mp3`,
        ogg: `${this.assetRoot}audio/chickenhurt2.ogg`,
      },
      chickenBawk: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/chickensay3.mp3`,
        ogg: `${this.assetRoot}audio/chickensay3.ogg`,
      },
      cowHuff: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowhuff.mp3`,
        ogg: `${this.assetRoot}audio/cowhuff.ogg`,
      },
      cowHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowhurt.mp3`,
        ogg: `${this.assetRoot}audio/cowhurt.ogg`,
      },
      cowMoo: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowmoo1.mp3`,
        ogg: `${this.assetRoot}audio/cowmoo1.ogg`,
      },
      cowMooLong: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowmoolong.mp3`,
        ogg: `${this.assetRoot}audio/cowmoolong.ogg`,
      },
      creeperHiss: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/creeper.mp3`,
        ogg: `${this.assetRoot}audio/creeper.ogg`,
      },
      ironGolemHit: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/irongolemhit.mp3`,
        ogg: `${this.assetRoot}audio/irongolemhit.ogg`,
      },
      metalWhack: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/metalwhack.mp3`,
        ogg: `${this.assetRoot}audio/metalwhack.ogg`,
      },
      zombieBrains: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiebrains.mp3`,
        ogg: `${this.assetRoot}audio/zombiebrains.ogg`,
      },
      zombieGroan: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiegroan.mp3`,
        ogg: `${this.assetRoot}audio/zombiegroan.ogg`,
      },
      zombieHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiehurt1.mp3`,
        ogg: `${this.assetRoot}audio/zombiehurt1.ogg`,
      },
      pistonIn: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/piston_in.mp3`,
        ogg: `${this.assetRoot}audio/piston_in.ogg`,
      },
      zombieHurt2: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiehurt2.mp3`,
        ogg: `${this.assetRoot}audio/zombiehurt2.ogg`,
      },
      pistonOut: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/piston_out.mp3`,
        ogg: `${this.assetRoot}audio/piston_out.ogg`,
      },
      portalAmbient: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/portal.mp3`,
        ogg: `${this.assetRoot}audio/portal.ogg`,
      },
      portalTravel: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/travel_portal.mp3`,
        ogg: `${this.assetRoot}audio/travel_portal.ogg`,
      },
      pressurePlateClick: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/pressurePlateClick.mp3`,
        ogg: `${this.assetRoot}audio/pressurePlateClick.ogg`,
      },
      moan2: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan2.mp3`,
        ogg: `${this.assetRoot}audio/moan2.ogg`,
      },
      moan3: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan3.mp3`,
        ogg: `${this.assetRoot}audio/moan3.ogg`,
      },
      moan6: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan6.mp3`,
        ogg: `${this.assetRoot}audio/moan6.ogg`,
      },
      moan7: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan7.mp3`,
        ogg: `${this.assetRoot}audio/moan7.ogg`,
      },
    };

    const ALL_SOUND_ASSETS = [
      'dig_wood1',
      'stepGrass',
      'stepWood',
      'stepStone',
      'stepGravel',
      'stepFarmland',
      'failure',
      'success',
      'fall',
      'fuse',
      'explode',
      'placeBlock',
      'collectedBlock',
      'bump',
      'punch',
      'fizz',
      'doorOpen',
      'minecart',
      'sheepBaa',
      'chickenHurt',
      'chickenBawk',
      'cowHuff',
      'cowHurt',
      'cowMoo',
      'cowMooLong',
      'creeperHiss',
      'ironGolemHit',
      'metalWhack',
      'zombieBrains',
      'zombieGroan',
      'zombieHurt',
      'pistonIn',
      'pistonOut',
      'portalAmbient',
      'portalTravel',
      'pressurePlateClick',
      'moan2',
      'moan3',
      'moan6',
      'moan7',
    ];

    const CHICKEN_LEVEL_ASSETS = [
      'chicken',
      'entityShadow',
      'selectionIndicator',
      'AO',
      'blockShadows',
      'blocks',
      'miniBlocks',
      'stepGrass',
      'failure',
      'success',
    ].concat(ALL_SOUND_ASSETS);

    const ISLAND_LEVEL_ASSETS = [
      'entityShadow',
      'selectionIndicator',
      'finishOverlay',
      'AO',
      'WaterAO',
      'blockShadows',
      'blocks',
      'leavesJungle',
      'destroyOverlay',
      'blockExplode',
      'miningParticles',
      'miniBlocks',
      'bubbles',
      'dig_wood1',
      'stepGrass',
      'stepWood',
      'stepStone',
      'stepGravel',
      'failure',
      'success',
      'fall',
      'placeBlock',
      'collectedBlock',
      'bump',
      'punch',
    ];

    this.assetPacks = {
      adventurerLevelOneAssets: [
        'entityShadow',
        'selectionIndicator',
        'AO',
        'blockShadows',
        'leavesOak',
        'leavesBirch',
        'blocks',
        'sheep',
        'bump',
        'stepGrass',
        'failure',
        'success',
      ],
      adventurerLevelTwoAssets: [
        'entityShadow',
        'selectionIndicator',
        'AO',
        'blockShadows',
        'leavesSpruce',
        'blocks',
        'sheep',
        'bump',
        'stepGrass',
        'failure',
        'playerSteve',
        'success',
        'miniBlocks',
        'blockExplode',
        'miningParticles',
        'destroyOverlay',
        'dig_wood1',
        'collectedBlock',
        'punch',
      ],
      adventurerLevelThreeAssets: [
        'entityShadow',
        'selectionIndicator',
        'AO',
        'blockShadows',
        'leavesOak',
        'blocks',
        'sheep',
        'bump',
        'stepGrass',
        'failure',
        'playerSteve',
        'success',
        'miniBlocks',
        'blockExplode',
        'miningParticles',
        'destroyOverlay',
        'dig_wood1',
        'collectedBlock',
        'sheepBaa',
        'punch',
      ],
      adventurerAllAssetsMinusPlayer: [
        'entityShadow',
        'selectionIndicator',
        'finishOverlay',
        'bed',
        'AO',
        'LavaGlow',
        'WaterAO',
        'blockShadows',
        'undergroundFow',
        'blocks',
        'leavesAcacia',
        'leavesBirch',
        'leavesOak',
        'leavesSpruce',
        'sheep',
        'creeper',
        'crops',
        'torch',
        'destroyOverlay',
        'blockExplode',
        'miningParticles',
        'miniBlocks',
        'lavaPop',
        'fire',
        'bubbles',
        'explosion',
        'door',
        'rails',
        'tnt',
        'dig_wood1',
        'stepGrass',
        'stepWood',
        'stepStone',
        'stepGravel',
        'stepFarmland',
        'failure',
        'success',
        'fall',
        'fuse',
        'explode',
        'placeBlock',
        'collectedBlock',
        'bump',
        'punch',
        'fizz',
        'doorOpen',
        'houseSuccess',
        'minecart',
        'sheepBaa',
      ],
      levelOneAssets: CHICKEN_LEVEL_ASSETS,
      levelTwoAssets: CHICKEN_LEVEL_ASSETS,
      levelThreeAssets: CHICKEN_LEVEL_ASSETS,
      designerAllAssetsMinusPlayer: [
        'entityShadow',
        'selectionIndicator',
        'finishOverlay',
        'bed',
        'AO',
        'LavaGlow',
        'WaterAO',
        'blockShadows',
        'undergroundFow',
        'blocks',
        'leavesAcacia',
        'leavesBirch',
        'leavesJungle',
        'leavesOak',
        'leavesSpruce',
        'sheep',
        'creeper',
        'crops',
        'torch',
        'destroyOverlay',
        'blockExplode',
        'miningParticles',
        'miniBlocks',
        'lavaPop',
        'fire',
        'bubbles',
        'explosion',
        'door',
        'rails',
        'tnt',
        'dig_wood1',
        'stepGrass',
        'stepWood',
        'stepStone',
        'stepGravel',
        'stepFarmland',
        'failure',
        'success',
        'fall',
        'fuse',
        'explode',
        'placeBlock',
        'collectedBlock',
        'bump',
        'punch',
        'fizz',
        'doorOpen',
        'houseSuccess',
        'minecart',
        'sheepBaa',
        'zombie',
        'cow',
        'chicken',
        'ironGolem',
        'burningInSun',
        'chickenHurt',
        'chickenBawk',
        'cowHuff',
        'cowHurt',
        'cowMoo',
        'cowMooLong',
        'creeperHiss',
        'ironGolemHit',
        'metalWhack',
        'zombieBrains',
        'zombieGroan',
        'zombieHurt',
        'zombieHurt2',
      ],
      heroAllAssetsMinusPlayer: [
        'entityShadow',
        'selectionIndicator',
        'finishOverlay',
        'bed',
        'AO',
        'LavaGlow',
        'WaterAO',
        'blockShadows',
        'undergroundFow',
        'blocks',
        'leavesAcacia',
        'leavesBirch',
        'leavesOak',
        'leavesSpruce',
        'leavesSpruceSnowy',
        'sheep',
        'creeper',
        'crops',
        'torch',
        'destroyOverlay',
        'blockExplode',
        'miningParticles',
        'miniBlocks',
        'lavaPop',
        'redstoneSparkle',
        'fire',
        'bubbles',
        'explosion',
        'door',
        'doorIron',
        'rails',
        'tnt',
        'dig_wood1',
        'stepGrass',
        'stepWood',
        'stepStone',
        'stepGravel',
        'stepFarmland',
        'failure',
        'success',
        'fall',
        'fuse',
        'explode',
        'placeBlock',
        'collectedBlock',
        'bump',
        'punch',
        'fizz',
        'doorOpen',
        'houseSuccess',
        'minecart',
        'sheepBaa',
        'zombie',
        'cow',
        'chicken',
        'burningInSun',
        'ghast',
        'chickenHurt',
        'chickenBawk',
        'cowHuff',
        'cowHurt',
        'cowMoo',
        'cowMooLong',
        'creeperHiss',
        'metalWhack',
        'zombieBrains',
        'zombieGroan',
        'zombieHurt',
        'zombieHurt2',
        'pistonIn',
        'pistonOut',
        'portalAmbient',
        'portalTravel',
        'pressurePlateClick',
        'moan2',
        'moan3',
        'moan6',
        'moan7',
      ],
      aquaticIslandAssets: ISLAND_LEVEL_ASSETS,
      aquaticLevelThreeAndFourAssets: ISLAND_LEVEL_ASSETS.concat(
        'cod',
        'dolphin',
      ),
      aquaticAllAssetsMinusPlayer: [
        'entityShadow',
        'selectionIndicator',
        'finishOverlay',
        'underwaterOverlay',
        'AO',
        'LavaGlow',
        'WaterAO',
        'lavaPop',
        'blockShadows',
        'undergroundFow',
        'blocks',
        'leavesJungle',
        'cod',
        'crops',
        'torch',
        'dolphin',
        'salmon',
        'seaTurtle',
        'squid',
        'tropicalFish',
        'destroyOverlay',
        'blockExplode',
        'miningParticles',
        'miniBlocks',
        'bubbles',
        'dig_wood1',
        'stepGrass',
        'stepWood',
        'stepStone',
        'stepGravel',
        'failure',
        'success',
        'fall',
        'placeBlock',
        'collectedBlock',
        'bump',
        'punch',
      ],
      allAssetsMinusPlayer: [
        'entityShadow',
        'selectionIndicator',
        'finishOverlay',
        'underwaterOverlay',
        'bed',
        'AO',
        'LavaGlow',
        'WaterAO',
        'blockShadows',
        'undergroundFow',
        'blocks',
        'cod',
        'dolphin',
        'salmon',
        'seaTurtle',
        'squid',
        'tropicalFish',
        'leavesAcacia',
        'leavesBirch',
        'leavesJungle',
        'leavesOak',
        'leavesSpruce',
        'leavesSpruceSnowy',
        'sheep',
        'creeper',
        'crops',
        'torch',
        'destroyOverlay',
        'blockExplode',
        'miningParticles',
        'miniBlocks',
        'lavaPop',
        'redstoneSparkle',
        'fire',
        'bubbles',
        'explosion',
        'door',
        'doorIron',
        'rails',
        'tnt',
        'dig_wood1',
        'stepGrass',
        'stepWood',
        'stepStone',
        'stepGravel',
        'stepFarmland',
        'failure',
        'success',
        'fall',
        'fuse',
        'explode',
        'placeBlock',
        'collectedBlock',
        'bump',
        'punch',
        'fizz',
        'doorOpen',
        'houseSuccess',
        'minecart',
        'sheepBaa',
        'zombie',
        'cow',
        'chicken',
        'ghast',
        'ironGolem',
        'burningInSun',
        'chickenHurt',
        'chickenBawk',
        'cowHuff',
        'cowHurt',
        'cowMoo',
        'cowMooLong',
        'creeperHiss',
        'ironGolemHit',
        'metalWhack',
        'zombieBrains',
        'zombieGroan',
        'zombieHurt',
        'zombieHurt2',
        'pistonIn',
        'pistonOut',
        'portalAmbient',
        'portalTravel',
        'pressurePlateClick',
        'moan2',
        'moan3',
        'moan6',
        'moan7',
      ],
      playerSteve: ['playerSteve'],
      playerAlex: ['playerAlex'],
      playerSteveEvents: ['playerSteveEvents'],
      playerAlexEvents: ['playerAlexEvents'],
      playerAgent: ['playerAgent'],
      playerSteveAquatic: ['playerSteveAquatic'],
      playerAlexAquatic: ['playerAlexAquatic'],
    };
  }

  /**
   * Loads all of the known AssetPacks with the given names.
   */
  loadPacks(scene: Phaser.Scene, packList: string[]) {
    packList.forEach((packName: string) => {
      this.loadPack(scene, packName);
    });
  }

  /**
   * Loads the given named asset pack.
   *
   * An AssetPack is a set of strings that name, as keys, individual assets.
   */
  loadPack(scene: Phaser.Scene, packName: string) {
    const packAssets = this.assetPacks[packName];
    this.loadAssets(scene, packAssets);
  }

  /**
   * Loads all assets in the given list of keys.
   */
  loadAssets(scene: Phaser.Scene, assetNames: string[]) {
    assetNames.forEach((assetKey: string) => {
      const assetConfig = this.assets[assetKey];
      this.loadAsset(scene, assetKey, assetConfig);
    });
  }

  /**
   * Loads the asset.
   *
   * For images, this loads the image such that our renderers can now reference it.
   *
   * For sounds, it registers the sound data with the audio device that was passed
   * into the GameController.
   */
  loadAsset(scene: Phaser.Scene, key: string, config: AssetDefinition) {
    if (config.type === 'image') {
      scene.load.image(key, config.path);
    } else if (config.type === 'sound') {
      this.audioPlayer.register({
        id: key,
        mp3: config.mp3,
        ogg: config.ogg,
      });
    } else if (config.type === 'atlas') {
      scene.load.atlas(key, config.pngPath, config.jsonPath);
    } else {
      throw `Asset ${key} needs config.type set in configuration.`;
    }
  }
}

export default AssetLoader;
