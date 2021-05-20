/**
 * Load Skin for Maze.
 */
// tiles: A 250x200 set of 20 map images.
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// look: Colour of sonar-like look icon.

var skinsBase = require('../skins');
var randomValue = require('../utils').randomValue;
import neighborhoodSprites from './neighborhoodSprites.json';

var CONFIGS = {
  letters: {
    nonDisappearingPegmanHittingObstacle: true,
    pegmanHeight: 50,
    pegmanWidth: 50,
    danceOnLoad: false,
    goal: '',
    idlePegmanAnimation: 'idle_avatar.gif',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    hideInstructions: true
  },

  bee: {
    obstacleAnimation: '',
    obstacleIdle: 'obstacle.png',
    redFlower: 'redFlower.png',
    purpleFlower: 'purpleFlower.png',
    honey: 'honey.png',
    cloud: 'cloud.png',
    cloudAnimation: 'cloud_hide.gif',
    beeSound: true,
    nectarSound: 'getNectar.mp3',
    honeySound: 'makeHoney.mp3',

    look: '#000',
    nonDisappearingPegmanHittingObstacle: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    hittingWallAnimation: 'wall.gif',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    actionSpeedScale: {
      nectar: 1
    },
    pegmanYOffset: 0,
    tileSheetWidth: 5,
    pegmanHeight: 50,
    pegmanWidth: 50
  },

  collector: {
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1,
    movePegmanAnimationFrameNumber: 8,
    pegmanHeight: 50,
    pegmanWidth: 50,

    goal: 'gem.png',
    collectBlock: 'gem_cropped.png',
    corners: 'corners.png',

    collectSounds: ['get_gem_2.mp3', 'get_gem_4.mp3', 'get_gem_6.mp3'],

    // Walk sound works, but the current available audio is a bit too harsh for
    // classroom usage. Temporarily disabling until we get some milder audio
    //walkSound: 'walk.mp3',

    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background.png',
    danceOnLoad: true
  },

  farmer: {
    obstacleIdle: 'obstacle.png',

    dirt: 'dirt.png',
    fillSound: 'fill.mp3',
    digSound: 'dig.mp3',

    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background' + randomValue([0, 1, 2, 3]) + '.png',
    dirtSound: true,
    pegmanYOffset: -8,
    danceOnLoad: true
  },

  harvester: {
    obstacleIdle: 'obstacle.png',

    corn: 'corn.png',
    pumpkin: 'pumpkin.png',
    sprout: 'sprout.png',
    lettuce: 'lettuce.png',

    harvestSound: 'dig.mp3',

    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background' + randomValue([0, 1, 2, 3]) + '.png',
    pegmanYOffset: -8,
    danceOnLoad: true
  },

  pvz: {
    goalIdle: 'goalIdle.gif',
    obstacleIdle: 'obstacleIdle.gif',

    goalAnimation: 'goal.gif',
    maze_forever: 'maze_forever.png',

    obstacleScale: 1.4,
    pegmanYOffset: -8,
    danceOnLoad: true
  },

  birds: {
    goalIdle: 'goalIdle.gif',
    obstacleIdle: 'obstacle.png',

    goalAnimation: 'goal.gif',
    maze_forever: 'maze_forever.png',
    largerObstacleAnimationTiles: 'tiles-broken.png',

    obstacleScale: 1.2,
    additionalSound: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    hittingWallAnimation: 'wall.gif',
    approachingGoalAnimation: 'close_goal.png',
    pegmanHeight: 68,
    pegmanWidth: 51,
    pegmanYOffset: -14,
    turnAfterVictory: true
  },

  scrat: {
    goalIdle: 'goal.png',
    goalAnimation: 'goal.png',
    maze_forever: 'maze_forever.png',
    largerObstacleAnimationTiles: 'tiles-broken.png',

    additionalSound: true,
    idlePegmanAnimation: 'idle_avatar_sheet.png',
    idlePegmanAnimationSpeedScale: 1.5,
    idlePegmanCol: 4,
    idlePegmanRow: 11,

    hittingWallAnimation: 'wall_avatar_sheet.png',
    hittingWallAnimationFrameNumber: 20,
    hittingWallAnimationSpeedScale: 1.5,
    hittingWallPegmanCol: 1,
    hittingWallPegmanRow: 20,

    celebrateAnimation: 'jump_acorn_sheet.png',
    celebratePegmanCol: 1,
    celebratePegmanRow: 9,

    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,

    approachingGoalAnimation: 'close_goal.png',
    pegmanHeight: 107,
    pegmanWidth: 80,
    pegmanXOffset: -12,
    pegmanYOffset: -30,
    turnAfterVictory: true
  },

  neighborhood: {
    spriteMap: neighborhoodSprites,
    sheetRows: {
      'other.png': 3,
      'vehicles.png': 6,
      'buildings.png': 18,
      'sidewalk.png': 2,
      'wall.png': 3
    }
  }
};

// night skins are effectively the same, but will have some different assets
// in their respective folders blockly/static/skins/<skin name>
CONFIGS.bee_night = CONFIGS.bee;
CONFIGS.farmer_night = CONFIGS.farmer;

CONFIGS.planter = Object.assign({}, CONFIGS.harvester, {
  soil: 'soil.png'
});

/**
 * Given the mp3 sound, generates a list containing both the mp3 and ogg sounds
 */
function soundAssetUrls(skin, mp3Sound) {
  var base = mp3Sound.match(/^(.*)\.mp3$/)[1];
  return [skin.assetUrl(mp3Sound), skin.assetUrl(base + '.ogg')];
}

exports.load = function(assetUrl, id) {
  // The skin has properties from three locations
  // (1) skinBase - properties common across Blockly apps
  // (2) here - properties common across all maze skins
  // (3) config - properties particular to a maze skin
  // If a property is defined in multiple locations, the more specific location
  // takes precedence

  // (1) Properties common across Blockly apps
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  // (2) Default values for properties common across maze skins.
  skin.obstacleScale = 1.0;
  skin.obstacleAnimation = skin.assetUrl('obstacle.gif');
  skin.movePegmanAnimationSpeedScale = 1;
  skin.look = '#FFF';
  skin.background = skin.assetUrl('background.png');
  skin.tiles = skin.assetUrl('tiles.png');
  skin.pegmanHeight = 52;
  skin.pegmanWidth = 49;
  skin.pegmanYOffset = 0;
  // do we turn to the direction we're facing after performing our victory
  // animation?
  skin.turnAfterVictory = false;
  skin.danceOnLoad = false;

  // Sounds
  skin.obstacleSound = soundAssetUrls(skin, 'obstacle.mp3');
  skin.wallSound = soundAssetUrls(skin, 'wall.mp3');
  skin.winGoalSound = soundAssetUrls(skin, 'win_goal.mp3');
  skin.wall0Sound = soundAssetUrls(skin, 'wall0.mp3');
  skin.wall1Sound = soundAssetUrls(skin, 'wall1.mp3');
  skin.wall2Sound = soundAssetUrls(skin, 'wall2.mp3');
  skin.wall3Sound = soundAssetUrls(skin, 'wall3.mp3');
  skin.wall4Sound = soundAssetUrls(skin, 'wall4.mp3');

  // (3) Get properties from config
  const isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  const isSound = /^(.*)\.mp3$/; // something.mp3

  function determineAssetUrl(val) {
    if (isSound.test(val)) {
      val = soundAssetUrls(skin, val);
    } else if (isAsset.test(val)) {
      val = skin.assetUrl(val);
    }

    return val;
  }

  for (const prop in config) {
    const val = config[prop];
    if (Array.isArray(val)) {
      skin[prop] = val.map(determineAssetUrl);
    } else {
      skin[prop] = determineAssetUrl(val);
    }
  }

  return skin;
};
