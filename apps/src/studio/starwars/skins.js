import {
  HIDDEN_VALUE,
  RANDOM_VALUE,
  SpriteSpeed,
  BEHAVIOR_WATCH_ACTOR
} from '../constants';
import msg from '../locale';

export function loadStarWarsEvents(skin) {
  skin.preloadAssets = true;
  skin.sortDrawOrder = true;
  skin.onlyOneActor = true;

  skin.hideIconInClearPuzzle = true;

  skin.defaultBackground = 'endor';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.instructions2ImageSubstitutions = {
    "pufferpig": skin.assetUrl('instructions_pufferpig.png'),
    "mynock": skin.assetUrl('instructions_mynock.png'),
    "rebelpilot": skin.assetUrl('instructions_rebelpilot.png'),
    "stormtrooper": skin.assetUrl('instructions_stormtrooper.png'),
    "mousedroid": skin.assetUrl('instructions_mousedroid.png'),
    "tauntaun": skin.assetUrl('instructions_tauntaun.png'),
    "probot": skin.assetUrl('instructions_probot.png')
  };

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  skin.ItemClassNames = [
    'pufferpig',
    'stormtrooper',
    'tauntaun',
    'mynock',
    'probot',
    'mousedroid',
    'rebelpilot'
  ];

  skin.AutohandlerTouchItems = {
    whenTouchPufferPig: 'pufferpig',
    whenTouchStormtrooper: 'stormtrooper',
    whenTouchTauntaun: 'tauntaun',
    whenTouchMynock: 'mynock',
    whenTouchProbot: 'probot',
    whenTouchMouseDroid: 'mousedroid',
    whenTouchRebelPilot: 'rebelpilot',
    whenGetPufferPig: 'pufferpig',
    whenGetStormtrooper: 'stormtrooper',
    whenGetTauntaun: 'tauntaun',
    whenGetMynock: 'mynock',
    whenGetProbot: 'probot',
    whenGetMouseDroid: 'mousedroid',
    whenGetRebelPilot: 'rebelpilot',
  };

  skin.AutohandlerGetAllItems = {
    whenGetAllPufferPigs: 'pufferpig',
    whenGetAllStormtroopers: 'stormtrooper',
    whenGetAllTauntauns: 'tauntaun',
    whenGetAllMynocks: 'mynock',
    whenGetAllProbots: 'probot',
    whenGetAllMouseDroids: 'mousedroid',
    whenGetAllRebelPilots: 'rebelpilot',
  };

  skin.specialItemProperties = {
    'pufferpig':       { frames: 12, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -15}, activity: 'roam',  speed: SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true },
    'stormtrooper':    { frames: 12, width: 100, height: 100, scale: 1.1, renderOffset: { x: 0, y: -15}, activity: 'chase', speed: SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true  },
    'tauntaun':        { frames: 15, width: 100, height: 100, scale: 1.6, renderOffset: { x: 0, y:  20}, activity: 'roam',  speed: SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'mynock':          { frames:  8, width: 100, height: 100, scale: 0.9, renderOffset: { x: 0, y: -20}, activity: 'roam',  speed: SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'probot':          { frames: 12, width: 100, height: 100, scale: 1.2, renderOffset: { x: 0, y: -10}, activity: 'chase', speed: SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'mousedroid':      { frames:  1, width: 100, height: 100, scale: 0.5, renderOffset: { x: 0, y: -20}, activity: 'flee',  speed: SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'rebelpilot':      { frames: 13, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -20}, activity: 'flee',  speed: SpriteSpeed.SLOW, spritesCounterclockwise: true },
  };

  skin.customObstacleZones = {endor : {}, hoth: {}, starship: {}};

  function generateGridObstacleZones() {
    var zones = [];
    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        var zone = {
          minX: 50 + col * 100 + 5,
          maxX: 50 + col * 100 + 49 - 5,
          minY: 50 + row * 100 + 15,
          maxY: 50 + row * 100 + 49 - 5
        };
        zones.push(zone);
      }
    }
    return zones;
  }

  skin.customObstacleZones.endor.grid =
  skin.customObstacleZones.hoth.grid =
  skin.customObstacleZones.starship.grid =
    generateGridObstacleZones();

  skin.customObstacleZones.endor.blobs = [
    { minX: 346, maxX: 413, minY: 261, maxY: 344 },
    { minX: 318, maxX: 404, minY: 342, maxY: 397 },
    { minX: 308, maxX: 348, minY: 72, maxY: 110 },
    { minX: 264, maxX: 348, minY: 112, maxY: 197 },
    { minX: 96, maxX: 149, minY: 289, maxY: 349 },
    { minX: 96, maxX: 199, minY: 238, maxY: 288 },
    { minX: 83, maxX: 125, minY: 125, maxY: 147 },
    { minX: 58, maxX: 99, minY: 72, maxY: 91 },
    { minX: 57, maxX: 149, minY: 92, maxY: 123 }];

  skin.customObstacleZones.endor.horizontal = [
    { minX: 51, maxX: 299, minY: 269, maxY: 293 },
    { minX: 150, maxX: 348, minY: 168, maxY: 189 },
    { minX: 53, maxX: 97, minY: 159, maxY: 199 },
    { minX: 50, maxX: 198, minY: 71, maxY: 94 },
    { minX: 255, maxX: 345, minY: 71, maxY: 94 }];

  skin.customObstacleZones.endor.circle = [
    { minX: 251, maxX: 317, minY: 332, maxY: 348 },
    { minX: 83, maxX: 198, minY: 332, maxY: 348 },
    { minX: 250, maxX: 317, minY: 77, maxY: 93 },
    { minX: 313, maxX: 337, minY: 77, maxY: 348 },
    { minX: 163, maxX: 236, minY: 202, maxY: 244 },
    { minX: 83, maxX: 200, minY: 77, maxY: 93 },
    { minX: 62, maxX: 85, minY: 77, maxY: 348 }];

  skin.customObstacleZones.hoth.blobs = [
    { minX: 100, maxX: 142, minY: 283, maxY: 342 },
    { minX: 100, maxX: 187, minY: 226, maxY: 281 },
    { minX: 356, maxX: 394, minY: 264, maxY: 311 },
    { minX: 311, maxX: 393, minY: 313, maxY: 388 },
    { minX: 310, maxX: 344, minY: 61, maxY: 106 },
    { minX: 258, maxX: 344, minY: 108, maxY: 192 },
    { minX: 117, maxX: 146, minY: 120, maxY: 132 },
    { minX: 57, maxX: 117, minY: 70, maxY: 132 }];

  skin.customObstacleZones.hoth.horizontal = [
    { minX: 54, maxX: 299, minY: 268, maxY: 294 },
    { minX: 150, maxX: 350, minY: 171, maxY: 198 },
    { minX: 53, maxX: 99, minY: 171, maxY: 198 },
    { minX: 252, maxX: 350, minY: 66, maxY: 92 },
    { minX: 54, maxX: 195, minY: 66, maxY: 92 }];

  skin.customObstacleZones.hoth.circle = [
    { minX: 250, maxX: 298, minY: 312, maxY: 342 },
    { minX: 300, maxX: 346, minY: 65, maxY: 342 },
    { minX: 252, maxX: 302, minY: 65, maxY: 100 },
    { minX: 99, maxX: 192, minY: 311, maxY: 342 },
    { minX: 101, maxX: 196, minY: 65, maxY: 91 },
    { minX: 50, maxX: 100, minY: 65, maxY: 342 },
    { minX: 163, maxX: 242, minY: 188, maxY: 238 }];

  skin.customObstacleZones.starship.blobs = [
    { minX: 301, maxX: 344, minY: 58, maxY: 120 },
    { minX: 353, maxX: 405, minY: 260, maxY: 308 },
    { minX: 306, maxX: 405, minY: 310, maxY: 393 },
    { minX: 101, maxX: 144, minY: 300, maxY: 350 },
    { minX: 101, maxX: 197, minY: 208, maxY: 299 },
    { minX: 261, maxX: 344, minY: 120, maxY: 192 },
    { minX: 55, maxX: 133, minY: 77, maxY: 141 }];

  skin.customObstacleZones.starship.horizontal = [
    { minX: 52, maxX: 298, minY: 267, maxY: 300 },
    { minX: 151, maxX: 351, minY: 167, maxY: 198 },
    { minX: 49, maxX: 99, minY: 165, maxY: 201 },
    { minX: 51, maxX: 199, minY: 66, maxY: 102 },
    { minX: 251, maxX: 351, minY: 68, maxY: 104 }];

  skin.customObstacleZones.starship.circle = [
    { minX: 251, maxX: 316, minY: 315, maxY: 351 },
    { minX: 153, maxX: 242, minY: 165, maxY: 251 },
    { minX: 252, maxX: 314, minY: 66, maxY: 100 },
    { minX: 310, maxX: 339, minY: 66, maxY: 351 },
    { minX: 80, maxX: 200, minY: 316, maxY: 351 },
    { minX: 82, maxX: 200, minY: 66, maxY: 100 },
    { minX: 63, maxX: 86, minY: 66, maxY: 351 }];

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;

  // Spritesheet for animated goal.
  skin.animatedGoal = skin.assetUrl('goal_idle.png');

  // Dimensions of the goal sprite.
  skin.goalSpriteWidth = 100;
  skin.goalSpriteHeight = 100;

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 16;

  // How long to show each frame of the optional goal animation.
  skin.timePerGoalAnimationFrame = 100;

  // Override the default scaling of collision rectangles for sprite touching a goal.
  skin.finishCollideDistanceScaling = 0.8;

  // For a smaller collision region on a goal.
  skin.goalCollisionRectWidth = 50;
  skin.goalCollisionRectHeight = 75;

  // Whether that goal should fade out when touched.  If true, then the
  // success image is never shown.
  skin.fadeOutGoal = true;
  skin.goalSuccess = null;

  // Draw a goal an an offset to its usual location, useful for oversize goal
  // images, such as a person standing taller than a single grid square whose
  // feet should still be planted in that grid square.
  skin.goalRenderOffsetX = -25;
  skin.goalRenderOffsetY = -45;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  // Dimensions of a rectangle in collidable center in which item collisions occur.
  skin.itemCollisionRectWidth  = 50;
  skin.itemCollisionRectHeight = 50;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 50;
  skin.spriteCollisionRectHeight = 50;

  // Offset & dimensions of a rectangle in collidable in which wall collisions occur.
  // For isometric-style rendering, this would normally be the feet.
  skin.wallCollisionRectOffsetX = 0;
  skin.wallCollisionRectOffsetY = 24;
  skin.wallCollisionRectWidth  = 30;
  skin.wallCollisionRectHeight = 20;

  // When movement is grid aligned, sprite coordinates are the top-left corner
  // of the sprite, and match the top-left corner of the grid square in question.
  // When we draw the sprites bigger, this means the sprite's "feet" will usually
  // be too far to the right and below that square.  These offsets are a chance
  // to move the rendering of the sprite up and to the left, when negative, so
  // that the "feet" are planted at the bottom center of the grid square.
  skin.gridSpriteRenderOffsetX = -30;
  skin.gridSpriteRenderOffsetY = -40;

  skin.avatarList = ['r2-d2', 'c-3po'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: name === 'r2-d2' ? 14 : 16,
        turns: 8,
        emotions: 0,
        walk: name === 'r2-d2' ? 14 : 8
      },
      animations: {
        turns: 8
      },
      animationFrameDuration: 3
    };
  });

  skin['r2-d2'].movementAudio = [
    { begin: 'r2-d2_move1_start', loop: 'r2-d2_move1_loop', end: 'r2-d2_move1_end', volume: 2.2 },
    { begin: 'r2-d2_move2_start', loop: 'r2-d2_move2_loop', end: 'r2-d2_move2_end', volume: 2.2 },
    { begin: 'r2-d2_move3_start', loop: 'r2-d2_move3_loop', end: 'r2-d2_move3_end', volume: 2.2 }
  ];
  skin['c-3po'].movementAudio = [
    { loop: 'c-3po_move_loop', end: 'c-3po_move_end', volume: 0.6 }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === '';
  };

  // No win or failure avatar for this skin.
  skin.winAvatar = null;
  skin.failureAvatar = null;

  skin.pufferpig = skin.assetUrl('walk_pufferpig.png');
  skin.stormtrooper = skin.assetUrl('walk_stormtrooper.png');
  skin.tauntaun = skin.assetUrl('walk_tauntaun.png');
  skin.mynock = skin.assetUrl('walk_mynock.png');
  skin.probot = skin.assetUrl('walk_probot.png');
  skin.mousedroid = skin.assetUrl('walk_mousedroid.png');
  skin.rebelpilot = skin.assetUrl('walk_rebelpilot.png');

  skin.endor = {
    background: skin.assetUrl('background_endor.jpg'),
    tiles: skin.assetUrl('tiles_endor.png'),
    jumboTiles: skin.assetUrl('jumbotiles_endor.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4,
    clouds: [skin.assetUrl('cloud_light.png'), skin.assetUrl('cloud_light2.png')]
  };
  skin.hoth = {
    background: skin.assetUrl('background_hoth.jpg'),
    tiles: skin.assetUrl('tiles_hoth.png'),
    jumboTiles: skin.assetUrl('jumbotiles_hoth.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4,
    clouds: [skin.assetUrl('cloud_dark.png'), skin.assetUrl('cloud_dark2.png')]
  };
  skin.starship = {
    background: skin.assetUrl('background_starship.jpg'),
    tiles: skin.assetUrl('tiles_starship.png'),
    jumboTiles: skin.assetUrl('jumbotiles_starship.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Since we don't have jumbo tiles for our "Hoth" background, in the case
  // of the two maps that use jumbo pieces ("circle" and "horizontal") we
  // return a special version of the map that just uses regular tile pieces.

  skin.getMap = function (background, map) {
    if (background === "hoth" && (map === "circle" || map === "horizontal")) {
      return map + "_nonjumbo";
    } else {
      return map;
    }
  };

  skin.blank =
    [[0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0]];

  skin.circle_nonjumbo =
    [[0x00, 0x00, 0x00, 0x00,  0x00,  0x00, 0x00, 0x00],
     [0x00, 0x11, 0x02, 0x03,  0x00,  0x44, 0x45, 0x00],
     [0x00, 0x04, 0x00, 0x00,  0x00,  0x00, 0x03, 0x00],
     [0x00, 0x14, 0x00, 0x121, 0x121, 0x00, 0x05, 0x00],
     [0x00, 0x02, 0x00, 0x121, 0x121, 0x00, 0x15, 0x00],
     [0x00, 0x03, 0x00, 0x00,  0x00,  0x00, 0x02, 0x00],
     [0x00, 0x24, 0x25, 0x02,  0x00,  0x34, 0x35, 0x00],
     [0x00, 0x00, 0x00, 0x00,  0x00,  0x00, 0x00, 0x00]];

  skin.circle =
    [[0x00, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0x00, 0x200, 0x213, 0x213, 0x00,  0x213, 0x201, 0x00],
     [0x00, 0x212, 0x00,  0x00,  0x00,  0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x121, 0x121, 0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x121, 0x121, 0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x00,  0x00,  0x00,  0x212, 0x00],
     [0x00, 0x202, 0x213, 0x213, 0x00,  0x213, 0x203, 0x00],
     [0x00, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00]];

  skin.horizontal_nonjumbo =
    [[0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x02, 0x03, 0x20, 0x00, 0x24, 0x25, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x10, 0x00, 0x34, 0x35, 0x20, 0x23, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x03, 0x02, 0x22, 0x20, 0x21, 0x00, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];

  skin.horizontal =
    [[0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x213, 0x213, 0x213, 0x00,  0x213, 0x213, 0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x30,  0x00,  0x213, 0x213, 0x213, 0x213, 0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x213, 0x213, 0x213, 0x213, 0x213, 0x00,  0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00]];

  skin.grid =
    [[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x21, 0x00, 0x10, 0x00, 0x20, 0x00, 0x03],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x02, 0x00, 0x11, 0x00, 0x21, 0x00, 0x02],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x03, 0x00, 0x20, 0x00, 0x22, 0x00, 0x11],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x10, 0x00, 0x21, 0x00, 0x23, 0x00, 0x10]];

  skin.blobs =
    [[0x00, 0x00,  0x00,  0x00,  0x00, 0x00,  0x00,  0x00],
     [0x00, 0x103, 0x103, 0x00,  0x00, 0x00,  0x22,  0x00],
     [0x00, 0x103, 0x103, 0x00,  0x00, 0x110, 0x110, 0x00],
     [0x00, 0x00,  0x00,  0x00,  0x00, 0x110, 0x110, 0x00],
     [0x00, 0x00,  0x132, 0x132, 0x00, 0x00,  0x00,  0x00],
     [0x00, 0x00,  0x132, 0x132, 0x00, 0x00,  0x00,  0x23],
     [0x00, 0x00,  0x31,  0x00,  0x00, 0x00,  0x121, 0x121],
     [0x00, 0x00,  0x00,  0x00,  0x00, 0x00,  0x121, 0x121]];

  // Sounds.
  skin.sounds = [
    'R2-D2sound1', 'R2-D2sound2', 'R2-D2sound3', 'R2-D2sound4',
    'R2-D2sound5', 'R2-D2sound6', 'R2-D2sound7', 'R2-D2sound8',
    'R2-D2sound9',
    'C-3POsound1', 'C-3POsound2', 'C-3POsound3', 'C-3POsound4',
    'PufferPigSound1', 'PufferPigSound2', 'PufferPigSound3', 'PufferPigSound4',
    'TauntaunSound1', 'TauntaunSound2', 'TauntaunSound3', 'TauntaunSound4',
    'MynockSound1', 'MynockSound2', 'MynockSound3',
    'ProbotSound1', 'ProbotSound2', 'ProbotSound3',
    'MouseDroidSound1', 'MouseDroidSound2', 'MouseDroidSound3',
    'alert1', 'alert2', 'alert3', 'alert4',
    'applause'
  ];

  skin.soundGroups = {
    'R2-D2sound': {
      randomValue: 'R2-D2random',
      minSuffix: 1,
      maxSuffix: 9
    },
    'C-3POsound': {
      randomValue: 'C-3POrandom',
      minSuffix: 1,
      maxSuffix: 4
    },
    'PufferPigSound': {
      randomValue: 'PufferPigRandom',
      minSuffix: 1,
      maxSuffix: 4
    },
    'TauntaunSound': {
      randomValue: 'TauntaunRandom',
      minSuffix: 1,
      maxSuffix: 4
    },
    'MynockSound': {
      randomValue: 'MynockRandom',
      minSuffix: 1,
      maxSuffix: 3
    },
    'ProbotSound': {
      randomValue: 'ProbotSoundRandom',
      minSuffix: 1,
      maxSuffix: 3
    },
    'MouseDroidSound': {
      randomValue: 'MouseDroidSoundRandom',
      minSuffix: 1,
      maxSuffix: 3
    }
  };

  skin.soundChoices = [
    [msg.playSoundRandom(), RANDOM_VALUE],
    [msg.playSoundR2D2Random(), 'R2-D2random'],
    [msg.playSoundR2D2Sound1(), 'R2-D2sound1'],
    [msg.playSoundR2D2Sound2(), 'R2-D2sound2'],
    [msg.playSoundR2D2Sound3(), 'R2-D2sound3'],
    [msg.playSoundR2D2Sound4(), 'R2-D2sound4'],
    [msg.playSoundR2D2Sound5(), 'R2-D2sound5'],
    [msg.playSoundR2D2Sound6(), 'R2-D2sound6'],
    [msg.playSoundR2D2Sound7(), 'R2-D2sound7'],
    [msg.playSoundR2D2Sound8(), 'R2-D2sound8'],
    [msg.playSoundR2D2Sound9(), 'R2-D2sound9'],
    [msg.playSoundC3PORandom(), 'C-3POrandom'],
    [msg.playSoundC3POSound1(), 'C-3POsound1'],
    [msg.playSoundC3POSound2(), 'C-3POsound2'],
    [msg.playSoundC3POSound3(), 'C-3POsound3'],
    [msg.playSoundC3POSound4(), 'C-3POsound4'],
    [msg.playSoundPufferPigRandom(), 'PufferPigRandom'],
    [msg.playSoundPufferPigSound1(), 'PufferPigSound1'],
    [msg.playSoundPufferPigSound2(), 'PufferPigSound2'],
    [msg.playSoundPufferPigSound3(), 'PufferPigSound3'],
    [msg.playSoundPufferPigSound4(), 'PufferPigSound4'],
    [msg.playSoundTauntaunRandom(), 'TauntaunRandom'],
    [msg.playSoundTauntaunSound1(), 'TauntaunSound1'],
    [msg.playSoundTauntaunSound2(), 'TauntaunSound2'],
    [msg.playSoundTauntaunSound3(), 'TauntaunSound3'],
    [msg.playSoundTauntaunSound4(), 'TauntaunSound4'],
    [msg.playSoundMynockRandom(), 'MynockRandom'],
    [msg.playSoundMynockSound1(), 'MynockSound1'],
    [msg.playSoundMynockSound2(), 'MynockSound2'],
    [msg.playSoundMynockSound3(), 'MynockSound3'],
    [msg.playSoundProbotRandom(), 'ProbotRandom'],
    [msg.playSoundProbotSound1(), 'ProbotSound1'],
    [msg.playSoundProbotSound2(), 'ProbotSound2'],
    [msg.playSoundProbotSound3(), 'ProbotSound3'],
    [msg.playSoundMouseDroidRandom(), 'MouseDroidRandom'],
    [msg.playSoundMouseDroidSound1(), 'MouseDroidSound1'],
    [msg.playSoundMouseDroidSound2(), 'MouseDroidSound2'],
    [msg.playSoundMouseDroidSound3(), 'MouseDroidSound3'],
    [msg.playSoundAlert1(), 'alert1'],
    [msg.playSoundAlert2(), 'alert2'],
    [msg.playSoundAlert3(), 'alert3'],
    [msg.playSoundAlert4(), 'alert4'],
    [msg.playSoundApplause(), 'applause']];

  skin.soundChoicesK1 = [
  ];

  skin.soundMetadata = [
    {name: 'start', volume: 0.2},
    {name: 'win', volume: 0.2},
    {name: 'failure', volume: 0.2},
    {name: 'flag', volume: 0.2},
    {name: 'R2-D2sound1', volume: 0.2},
    {name: 'R2-D2sound2', volume: 0.2},
    {name: 'R2-D2sound3', volume: 0.2},
    {name: 'R2-D2sound4', volume: 0.2},
    {name: 'R2-D2sound5', volume: 0.2},
    {name: 'R2-D2sound6', volume: 0.2},
    {name: 'R2-D2sound7', volume: 0.2},
    {name: 'R2-D2sound8', volume: 0.2},
    {name: 'R2-D2sound9', volume: 0.2},
    {name: 'C-3POsound1', volume: 0.2},
    {name: 'C-3POsound2', volume: 0.2},
    {name: 'C-3POsound3', volume: 0.2},
    {name: 'C-3POsound4', volume: 0.2},
    {name: 'PufferPigSound1', volume: 0.2},
    {name: 'PufferPigSound2', volume: 0.2},
    {name: 'PufferPigSound3', volume: 0.2},
    {name: 'PufferPigSound4', volume: 0.2},
    {name: 'TauntaunSound1', volume: 0.2},
    {name: 'TauntaunSound2', volume: 0.2},
    {name: 'TauntaunSound3', volume: 0.2},
    {name: 'TauntaunSound4', volume: 0.2},
    {name: 'MynockSound1', volume: 0.2},
    {name: 'MynockSound2', volume: 0.2},
    {name: 'MynockSound3', volume: 0.2},
    {name: 'ProbotSound1', volume: 0.2},
    {name: 'ProbotSound2', volume: 0.2},
    {name: 'ProbotSound3', volume: 0.2},
    {name: 'MouseDroidSound1', volume: 0.2},
    {name: 'MouseDroidSound2', volume: 0.2},
    {name: 'MouseDroidSound3', volume: 0.2},
    {name: 'alert1', volume: 0.2},
    {name: 'alert2', volume: 0.2},
    {name: 'alert3', volume: 0.2},
    {name: 'alert4', volume: 0.2},
    {name: 'applause', volume: 0.2}
  ];

  skin.musicMetadata = HOC2015_MUSIC_METADATA;

  // Normally the sound isn't played for the final goal, but this forces it
  // to be played.
  skin.playFinalGoalSound = true;

  // These are used by blocks.js to customize our dropdown blocks across skins
  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    [msg.setMapRandom(), RANDOM_VALUE],
    [msg.setMapBlank(), 'blank'],
    [msg.setMapCircle(), 'circle'],
    [msg.setMapHorizontal(), 'horizontal'],
    [msg.setMapGrid(), 'grid'],
    [msg.setMapBlobs(), 'blobs']
    ];

  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundEndor(), '"endor"'],
    [msg.setBackgroundHoth(), '"hoth"'],
    [msg.setBackgroundStarship(), '"starship"']
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.endor.background, '"endor"'],
    [skin.hoth.background, '"hoth"'],
    [skin.starship.background, '"starship"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
    ];

  skin.spriteChoices = [
    [msg.setDroidHidden(), HIDDEN_VALUE],
    [msg.setDroidRandom(), RANDOM_VALUE],
    [msg.setDroidR2D2(), '"r2-d2"'],
    [msg.setDroidC3PO(), '"c-3po"']];

  skin.setSpritePrefix = msg.setDroid();

  skin.projectileChoices = [];

  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemStormtrooper(), '"stormtrooper"'],
    [msg.itemRebelPilot(), '"rebelpilot"'],
    [msg.itemPufferPig(), '"pufferpig"'],
    [msg.itemMynock(), '"mynock"'],
    [msg.itemMouseDroid(), '"mousedroid"'],
    [msg.itemTauntaun(), '"tauntaun"'],
    [msg.itemProbot(), '"probot"'],
    [msg.itemRandom(), RANDOM_VALUE]];

  skin.msgOverrides = {
    ifSpriteN: msg.ifDroidN,
    moveSpriteN: msg.moveDroidN,
    setSpriteN: msg.setDroidN,
    stopSpriteN: msg.stopDroidN,
    whenSpriteClicked: msg.whenDroidClicked,
    whenSpriteClickedN: msg.whenDroidClickedN,
  };
}

export function loadStarWarsGrid(skin) {
  skin.preloadAssets = true;
  skin.sortDrawOrder = true;
  skin.gridAlignedMovement = true;
  skin.gridAlignedExtraPauseSteps = 1;
  skin.slowExecutionFactor = 10;

  skin.hideIconInClearPuzzle = true;

  skin.defaultBackground = 'main';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.instructions2ImageSubstitutions = {
    "bb8": skin.assetUrl('instructions_bb8.png'),
    "hazard": skin.assetUrl('instructions_hazard.png'),
    "scrapmetal1": skin.assetUrl('goal1.png'),
    "scrapmetal2": skin.assetUrl('goal2.png'),
  };

  // An empty transparent PNG, used to override the instructions avatar for
  // scripts in which we don't have permission to show Rey's face
  skin.blankAvatar = skin.assetUrl('blank.png');
  skin.avatarAllowedScripts = [
    'starwars',
    'starwarsblocks'
  ];

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  skin.ItemClassNames = [
    'hazard'
  ];

  skin.AutohandlerTouchItems = {
  };

  skin.AutohandlerGetAllItems = {
  };

  skin.specialItemProperties = {
    hazard: {
      frames: 13,
      animationFrameDuration: 6,
      width: 100,
      height: 100,
      scale: 1.3,
      renderOffset: { x: 0, y: -25 },
      activity: BEHAVIOR_WATCH_ACTOR,
      speed: SpriteSpeed.VERY_SLOW,
      isHazard: true,
    },
  };

  // Spritesheet for animated goal.
  skin.goal1 = skin.assetUrl('goal1.png');
  skin.goal2 = skin.assetUrl('goal2.png');

  // Dimensions of the goal sprite.
  skin.goalSpriteWidth = 50;
  skin.goalSpriteHeight = 50;

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 1;
  skin.disableClipRectOnGoals = true;

  // Special effect applied to goal sprites
  skin.goalEffect = 'glow';

  // How long to show each frame of the optional goal animation.
  skin.timePerGoalAnimationFrame = 100;

  // For a smaller collision region on a goal.
  skin.goalCollisionRectWidth = 50;
  skin.goalCollisionRectHeight = 50;

  // Whether that goal should fade out when touched.  If true, then the
  // success image is never shown.
  skin.fadeOutGoal = true;
  skin.goalSuccess = null;

  // Draw a goal an an offset to its usual location, useful for oversize goal
  // images, such as a person standing taller than a single grid square whose
  // feet should still be planted in that grid square.
  skin.goalRenderOffsetX = 0;
  skin.goalRenderOffsetY = 0;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  // Dimensions of a rectangle in collidable center in which item collisions occur.
  skin.itemCollisionRectWidth  = 50;
  skin.itemCollisionRectHeight = 50;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 50;
  skin.spriteCollisionRectHeight = 50;

  // Offset & dimensions of a rectangle in collidable in which wall collisions occur.
  // For isometric-style rendering, this would normally be the feet.
  skin.wallCollisionRectOffsetX = 0;
  skin.wallCollisionRectOffsetY = 24;
  skin.wallCollisionRectWidth  = 30;
  skin.wallCollisionRectHeight = 20;

  // When movement is grid aligned, sprite coordinates are the top-left corner
  // of the sprite, and match the top-left corner of the grid square in question.
  // When we draw the sprites bigger, this means the sprite's "feet" will usually
  // be too far to the right and below that square.  These offsets are a chance
  // to move the rendering of the sprite up and to the left, when negative, so
  // that the "feet" are planted at the bottom center of the grid square.
  skin.gridSpriteRenderOffsetX = -20;
  skin.gridSpriteRenderOffsetY = -40;

  skin.avatarList = ['bb-8'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 21,
        turns: 8,
        emotions: 0,
        walk: 19
      },
      drawScale: 2,
      animations: {
        turns: 8
      },
      animationFrameDuration: 3
    };
  });
  skin['bb-8'].movementAudio = [
    { begin: 'move1', volume: 0.3 },
    { begin: 'move2', volume: 0.3 },
    { begin: 'move3', volume: 0.3 },
    { begin: 'move4', volume: 0.3 }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === '';
  };

  // No win avatar for this skin.
  skin.winAvatar = null;

  skin.hazard = skin.assetUrl('hazard_idle.png');

  skin.main = {
    background: skin.assetUrl('background_background1.jpg'),
    tiles: skin.assetUrl('tiles_background1.png'),
    clouds: [skin.assetUrl('cloud_light.png'), skin.assetUrl('cloud_light2.png')]
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Sounds.
  skin.sounds = ['move1', 'move2', 'move3', 'move4'];

  skin.soundChoices = [
    ];

  skin.soundChoicesK1 = [
  ];

  skin.musicMetadata = HOC2015_MUSIC_METADATA;

  // Normally the sound isn't played for the final goal, but this forces it
  // to be played.
  skin.playFinalGoalSound = true;

  // These are used by blocks.js to customize our dropdown blocks across skins
  // NOTE: map names must have double quotes inside single quotes
  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    ];

  skin.backgroundChoices = [
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    ];

  skin.spriteChoices = [
    [msg.setDroidHidden(), HIDDEN_VALUE],
    [msg.setDroidRandom(), RANDOM_VALUE],
    [msg.setDroidBB8(), '"bb-8"']];

  skin.setSpritePrefix = msg.setDroid();

  skin.projectileChoices = [];

  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    ];
}

/**
 * Music tracks and associated metadata for both hoc2015 and hoc2015x tutorials.
 * Individual levels don't load all of these, only the subset they request.
 * @const {MusicTrackDefinition[]}
 */
var HOC2015_MUSIC_METADATA = [
  { name: 'song1', volume: 0.5 },
  { name: 'song2', volume: 0.5 },
  { name: 'song3', volume: 0.5 },
  { name: 'song4', volume: 0.4 },
  { name: 'song5', volume: 0.4 },
  { name: 'song6', volume: 0.5 },
  { name: 'song7', volume: 0.4 },
  { name: 'song8', volume: 0.4 },
  { name: 'song9', volume: 0.4 },
  { name: 'song10', volume: 0.5 },
  { name: 'song11', volume: 0.45 },
  { name: 'song12', volume: 0.4 },
  { name: 'song13', volume: 0.4 },
  { name: 'song14', volume: 0.5 },
  { name: 'song15', volume: 0.55 }
];
