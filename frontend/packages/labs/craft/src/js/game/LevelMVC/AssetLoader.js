module.exports = class AssetLoader {
  constructor(controller) {
    this.controller = controller;
    this.audioPlayer = controller.audioPlayer;
    this.game = controller.game;
    this.assetRoot = controller.assetRoot;

    this.assets = {
      entityShadow: {
        type: 'image',
        path: `${this.assetRoot}images/Character_Shadow.png`
      },
      selectionIndicator: {
        type: 'image',
        path: `${this.assetRoot}images/Selection_Indicator.png`
      },
      finishOverlay: {
        type: 'image',
        path: `${this.assetRoot}images/WhiteRect.png`
      },
      underwaterOverlay: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Water_Caustics.png`,
        jsonPath: `${this.assetRoot}images/Water_Caustics.json`
      },
      bed: {
        type: 'image',
        path: `${this.assetRoot}images/Bed.png`
      },
      playerSteve: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Steve1013.png`,
        jsonPath: `${this.assetRoot}images/Steve1013.json`
      },
      playerAlex: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Alex1013.png`,
        jsonPath: `${this.assetRoot}images/Alex1013.json`
      },
      playerSteveEvents: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Steve_2016.png`,
        jsonPath: `${this.assetRoot}images/Steve_2016.json`
      },
      playerAlexEvents: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/DevAlex.png`,
        jsonPath: `${this.assetRoot}images/DevAlex.json`
      },
      playerAgent: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Agent.png`,
        jsonPath: `${this.assetRoot}images/Agent.json`
      },
      playerSteveAquatic: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Steve_2018.png`,
        jsonPath: `${this.assetRoot}images/Steve_2018.json`
      },
      playerAlexAquatic: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Alex_2018.png`,
        jsonPath: `${this.assetRoot}images/Alex_2018.json`
      },
      AO: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/AO.png`,
        jsonPath: `${this.assetRoot}images/AO.json`
      },
      LavaGlow: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/LavaGlow.png`,
        jsonPath: `${this.assetRoot}images/LavaGlow.json`
      },
      WaterAO: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/WaterAO.png`,
        jsonPath: `${this.assetRoot}images/WaterAO.json`
      },
      blockShadows: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Block_Shadows.png`,
        jsonPath: `${this.assetRoot}images/Block_Shadows.json`
      },
      undergroundFow: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/UndergroundFoW.png`,
        jsonPath: `${this.assetRoot}images/UndergroundFoW.json`
      },
      blocks: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Blocks.png`,
        jsonPath: `${this.assetRoot}images/Blocks.json`
      },
      leavesAcacia: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Acacia_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Acacia_Decay.json`
      },
      leavesBirch: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Birch_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Birch_Decay.json`
      },
      leavesJungle: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Jungle_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Jungle_Decay.json`
      },
      leavesOak: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Oak_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Oak_Decay.json`
      },
      leavesSpruce: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Spruce_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Spruce_Decay.json`
      },
      leavesSpruceSnowy: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Leaves_Spruce_Snowy_Decay.png`,
        jsonPath: `${this.assetRoot}images/Leaves_Spruce_Snowy_Decay.json`
      },
      sheep: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Sheep_2016.png`,
        jsonPath: `${this.assetRoot}images/Sheep_2016.json`
      },
      crops: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Crops.png`,
        jsonPath: `${this.assetRoot}images/Crops.json`
      },
      torch: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Torch.png`,
        jsonPath: `${this.assetRoot}images/Torch.json`
      },
      destroyOverlay: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Destroy_Overlay.png`,
        jsonPath: `${this.assetRoot}images/Destroy_Overlay.json`
      },
      blockExplode: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/BlockExplode.png`,
        jsonPath: `${this.assetRoot}images/BlockExplode.json`
      },
      miningParticles: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/MiningParticles.png`,
        jsonPath: `${this.assetRoot}images/MiningParticles.json`
      },
      miniBlocks: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Miniblocks.png`,
        jsonPath: `${this.assetRoot}images/Miniblocks.json`
      },
      lavaPop: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/LavaPop.png`,
        jsonPath: `${this.assetRoot}images/LavaPop.json`
      },
      redstoneSparkle: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Redstone_Sparkle.png`,
        jsonPath: `${this.assetRoot}images/Redstone_Sparkle.json`
      },
      fire: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Fire.png`,
        jsonPath: `${this.assetRoot}images/Fire.json`
      },
      bubbles: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Bubbles.png`,
        jsonPath: `${this.assetRoot}images/Bubbles.json`
      },
      explosion: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Explosion.png`,
        jsonPath: `${this.assetRoot}images/Explosion.json`
      },
      door: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Door.png`,
        jsonPath: `${this.assetRoot}images/Door.json`
      },
      doorIron: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Door_Iron.png`,
        jsonPath: `${this.assetRoot}images/Door_Iron.json`
      },
      rails: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Rails.png`,
        jsonPath: `${this.assetRoot}images/Rails.json`
      },
      tnt: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/TNT.png`,
        jsonPath: `${this.assetRoot}images/TNT.json`
      },
      burningInSun: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/BurningInSun.png`,
        jsonPath: `${this.assetRoot}images/BurningInSun.json`
      },
      zombie: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Zombie.png`,
        jsonPath: `${this.assetRoot}images/Zombie.json`
      },
      ironGolem: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Iron_Golem.png`,
        jsonPath: `${this.assetRoot}images/Iron_Golem.json`
      },
      creeper: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Creeper_2016.png`,
        jsonPath: `${this.assetRoot}images/Creeper_2016.json`
      },
      cow: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Cow.png`,
        jsonPath: `${this.assetRoot}images/Cow.json`
      },
      chicken: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Chicken.png`,
        jsonPath: `${this.assetRoot}images/Chicken.json`
      },
      cod: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Cod_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Cod_2018.json`
      },
      dolphin: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Dolphin_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Dolphin_2018.json`
      },
      ghast: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/Ghast.png`,
        jsonPath: `${this.assetRoot}images/Ghast.json`
      },
      salmon: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Salmon_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Salmon_2018.json`
      },
      seaTurtle: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Sea_Turtle_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Sea_Turtle_2018.json`
      },
      squid: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Squid_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Squid_2018.json`
      },
      tropicalFish: {
        type: 'atlasJSON',
        pngPath: `${this.assetRoot}images/entities/Tropical_Fish_2018.png`,
        jsonPath: `${this.assetRoot}images/entities/Tropical_Fish_2018.json`
      },
      dig_wood1: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/dig_wood1.mp3`,
        wav: `${this.assetRoot}audio/dig_wood1.wav`,
        ogg: `${this.assetRoot}audio/dig_wood1.ogg`
      },
      stepGrass: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/step_grass1.mp3`,
        wav: `${this.assetRoot}audio/step_grass1.wav`,
        ogg: `${this.assetRoot}audio/step_grass1.ogg`
      },
      stepWood: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/wood2.mp3`,
        ogg: `${this.assetRoot}audio/wood2.ogg`
      },
      stepStone: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/stone2.mp3`,
        ogg: `${this.assetRoot}audio/stone2.ogg`
      },
      stepGravel: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/gravel1.mp3`,
        ogg: `${this.assetRoot}audio/gravel1.ogg`
      },
      stepFarmland: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth4.mp3`,
        ogg: `${this.assetRoot}audio/cloth4.ogg`
      },
      failure: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/break.mp3`,
        ogg: `${this.assetRoot}audio/break.ogg`
      },
      success: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/levelup.mp3`,
        ogg: `${this.assetRoot}audio/levelup.ogg`
      },
      fall: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fallsmall.mp3`,
        ogg: `${this.assetRoot}audio/fallsmall.ogg`
      },
      fuse: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fuse.mp3`,
        ogg: `${this.assetRoot}audio/fuse.ogg`
      },
      explode: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/explode3.mp3`,
        ogg: `${this.assetRoot}audio/explode3.ogg`
      },
      placeBlock: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth1.mp3`,
        ogg: `${this.assetRoot}audio/cloth1.ogg`
      },
      collectedBlock: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/pop.mp3`,
        ogg: `${this.assetRoot}audio/pop.ogg`
      },
      bump: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/hit3.mp3`,
        ogg: `${this.assetRoot}audio/hit3.ogg`
      },
      punch: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cloth1.mp3`,
        ogg: `${this.assetRoot}audio/cloth1.ogg`
      },
      fizz: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/fizz.mp3`,
        ogg: `${this.assetRoot}audio/fizz.ogg`
      },
      doorOpen: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/door_open.mp3`,
        ogg: `${this.assetRoot}audio/door_open.ogg`
      },
      houseSuccess: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/launch1.mp3`,
        ogg: `${this.assetRoot}audio/launch1.ogg`
      },
      minecart: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/minecartBase.mp3`,
        ogg: `${this.assetRoot}audio/minecartBase.ogg`
      },
      sheepBaa: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/say3.mp3`,
        ogg: `${this.assetRoot}audio/say3.ogg`
      },
      chickenHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/chickenhurt2.mp3`,
        ogg: `${this.assetRoot}audio/chickenhurt2.ogg`
      },
      chickenBawk: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/chickensay3.mp3`,
        ogg: `${this.assetRoot}audio/chickensay3.ogg`
      },
      cowHuff: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowhuff.mp3`,
        ogg: `${this.assetRoot}audio/cowhuff.ogg`
      },
      cowHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowhurt.mp3`,
        ogg: `${this.assetRoot}audio/cowhurt.ogg`
      },
      cowMoo: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowmoo1.mp3`,
        ogg: `${this.assetRoot}audio/cowmoo1.ogg`
      },
      cowMooLong: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/cowmoolong.mp3`,
        ogg: `${this.assetRoot}audio/cowmoolong.ogg`
      },
      creeperHiss: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/creeper.mp3`,
        ogg: `${this.assetRoot}audio/creeper.ogg`
      },
      ironGolemHit: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/irongolemhit.mp3`,
        ogg: `${this.assetRoot}audio/irongolemhit.ogg`
      },
      metalWhack: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/metalwhack.mp3`,
        ogg: `${this.assetRoot}audio/metalwhack.ogg`
      },
      zombieBrains: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiebrains.mp3`,
        ogg: `${this.assetRoot}audio/zombiebrains.ogg`
      },
      zombieGroan: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiegroan.mp3`,
        ogg: `${this.assetRoot}audio/zombiegroan.ogg`
      },
      zombieHurt: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiehurt1.mp3`,
        ogg: `${this.assetRoot}audio/zombiehurt1.ogg`
      },
      pistonIn: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/piston_in.mp3`,
        ogg: `${this.assetRoot}audio/piston_in.ogg`
      },
      zombieHurt2: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/zombiehurt2.mp3`,
        ogg: `${this.assetRoot}audio/zombiehurt2.ogg`
      },
      pistonOut: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/piston_out.mp3`,
        ogg: `${this.assetRoot}audio/piston_out.ogg`
      },
      portalAmbient: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/portal.mp3`,
        ogg: `${this.assetRoot}audio/portal.ogg`
      },
      portalTravel: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/travel_portal.mp3`,
        ogg: `${this.assetRoot}audio/travel_portal.ogg`
      },
      pressurePlateClick: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/pressurePlateClick.mp3`,
        ogg: `${this.assetRoot}audio/pressurePlateClick.ogg`
      },
      moan2: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan2.mp3`,
        ogg: `${this.assetRoot}audio/moan2.ogg`
      },
      moan3: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan3.mp3`,
        ogg: `${this.assetRoot}audio/moan3.ogg`
      },
      moan6: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan6.mp3`,
        ogg: `${this.assetRoot}audio/moan6.ogg`
      },
      moan7: {
        type: 'sound',
        mp3: `${this.assetRoot}audio/moan7.mp3`,
        ogg: `${this.assetRoot}audio/moan7.ogg`
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
        'success'
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
        'sheepBaa'
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
      aquaticLevelThreeAndFourAssets: ISLAND_LEVEL_ASSETS.concat('cod', 'dolphin'),
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
      playerSteve: [
        'playerSteve'
      ],
      playerAlex: [
        'playerAlex'
      ],
      playerSteveEvents: [
        'playerSteveEvents'
      ],
      playerAlexEvents: [
        'playerAlexEvents'
      ],
      playerAgent: [
        'playerAgent'
      ],
      playerSteveAquatic: [
        'playerSteveAquatic'
      ],
      playerAlexAquatic: [
        'playerAlexAquatic'
      ],
    };
  }

  loadPacks(packList) {
    packList.forEach((packName) => {
      this.loadPack(packName);
    });
  }

  loadPack(packName) {
    let packAssets = this.assetPacks[packName];
    this.loadAssets(packAssets);
  }

  loadAssets(assetNames) {
    assetNames.forEach((assetKey) => {
      let assetConfig = this.assets[assetKey];
      this.loadAsset(assetKey, assetConfig);
    });
  }

  loadAsset(key, config) {
    switch (config.type) {
      case 'image':
        this.game.load.image(key, config.path);
        break;
      case 'sound':
        this.audioPlayer.register({
          id: key,
          mp3: config.mp3,
          ogg: config.ogg
        });
        break;
      case 'atlasJSON':
        this.game.load.atlasJSONHash(key, config.pngPath, config.jsonPath);
        break;
      default:
        throw `Asset ${key} needs config.type set in configuration.`;
    }
  }
};
