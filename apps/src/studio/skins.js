/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

var skinsBase = require('../skins');
var msg = require('./locale');
var constants = require('./constants');
var studioApp = require('../StudioApp').singleton;

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;


function loadInfinity(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.defaultBackground = 'leafy';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'projectile_hiro',
    'projectile_anna',
    'projectile_elsa',
    'projectile_baymax',
    'projectile_rapunzel',
    'projectile_cherry',
    'projectile_ice',
    'projectile_duck'
  ];

  skin.specialProjectileProperties = {
    'projectile_cherry': { frames: 13 },
    'projectile_ice': { frames: 12 },
    'projectile_duck': { frames: 12 }
  };

  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_hiro',
    'item_anna',
    'item_elsa',
    'item_baymax',
    'item_rapunzel',
    'item_cherry',
    'item_ice',
    'item_duck'
  ];

  skin.specialItemProperties = {
    'item_cherry': { frames: 13 },
    'item_ice': { frames: 12 },
    'item_duck': { frames: 12 }
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;
  skin.fadeExplosion = true;
  skin.timePerExplosionFrame = 100;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  skin.avatarList = ['anna', 'elsa', 'hiro', 'baymax', 'rapunzel'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: 12
      },
      timePerFrame: 100
    };
  });

  skin.preventProjectileLoop = function (className) {
    return className === 'projectile_hiro';
  };

  skin.preventItemLoop = function (className) {
    return className === 'item_hiro';
  };

  skin.projectile_hiro = skin.assetUrl('projectile_hiro.png');
  skin.projectile_anna = skin.assetUrl('projectile_anna.png');
  skin.projectile_elsa = skin.assetUrl('projectile_elsa.png');
  skin.projectile_baymax = skin.assetUrl('projectile_baymax.png');
  skin.projectile_rapunzel = skin.assetUrl('projectile_rapunzel.png');
  skin.projectile_cherry = skin.assetUrl('projectile_cherry.png');
  skin.projectile_ice = skin.assetUrl('projectile_ice.png');
  skin.projectile_duck = skin.assetUrl('projectile_duck.png');

  // TODO: Create actual item choices
  skin.item_hiro = skin.assetUrl('projectile_hiro.png');
  skin.item_anna = skin.assetUrl('projectile_anna.png');
  skin.item_elsa = skin.assetUrl('projectile_elsa.png');
  skin.item_baymax = skin.assetUrl('projectile_baymax.png');
  skin.item_rapunzel = skin.assetUrl('projectile_rapunzel.png');
  skin.item_cherry = skin.assetUrl('projectile_cherry.png');
  skin.item_ice = skin.assetUrl('projectile_ice.png');
  skin.item_duck = skin.assetUrl('projectile_duck.png');

  skin.leafy = {
    background: skin.assetUrl('background_leafy.jpg')
  };
  skin.grassy = {
    background: skin.assetUrl('background_grassy.jpg')
  };
  skin.flower = {
    background: skin.assetUrl('background_flower.jpg')
  };
  skin.tile = {
    background: skin.assetUrl('background_tile.jpg')
  };
  skin.icy = {
    background: skin.assetUrl('background_icy.jpg')
  };
  skin.snowy = {
    background: skin.assetUrl('background_snowy.jpg')
  };

  // These are used by blocks.js to customize our dropdown blocks across skins
  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundLeafy(), '"leafy"'],
    [msg.setBackgroundGrassy(), '"grassy"'],
    [msg.setBackgroundFlower(), '"flower"'],
    [msg.setBackgroundTile(), '"tile"'],
    [msg.setBackgroundIcy(), '"icy"'],
    [msg.setBackgroundSnowy(), '"snowy"'],
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.leafy.background, '"leafy"'],
    [skin.grassy.background, '"grassy"'],
    [skin.flower.background, '"flower"'],
    [skin.tile.background, '"tile"'],
    [skin.icy.background, '"icy"'],
    [skin.snowy.background, '"snowy"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
    ];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteAnna(), '"anna"'],
    [msg.setSpriteElsa(), '"elsa"'],
    [msg.setSpriteHiro(), '"hiro"'],
    [msg.setSpriteBaymax(), '"baymax"'],
    [msg.setSpriteRapunzel(), '"rapunzel"']];

  skin.projectileChoices = [
    [msg.projectileHiro(), '"projectile_hiro"'],
    [msg.projectileAnna(), '"projectile_anna"'],
    [msg.projectileElsa(), '"projectile_elsa"'],
    [msg.projectileBaymax(), '"projectile_baymax"'],
    [msg.projectileRapunzel(), '"projectile_rapunzel"'],
    [msg.projectileCherry(), '"projectile_cherry"'],
    [msg.projectileIce(), '"projectile_ice"'],
    [msg.projectileDuck(), '"projectile_duck"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemHiro(), '"item_hiro"'],
    [msg.itemAnna(), '"item_anna"'],
    [msg.itemElsa(), '"item_elsa"'],
    [msg.itemBaymax(), '"item_baymax"'],
    [msg.itemRapunzel(), '"item_rapunzel"'],
    [msg.itemCherry(), '"item_cherry"'],
    [msg.itemIce(), '"item_ice"'],
    [msg.itemDuck(), '"item_duck"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadHoc2015(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.defaultBackground = 'forest';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  // TODO: proper item class names
  skin.ItemClassNames = [
    'pig',
    'man',
    'roo',
    'bird',
    'spider',
    'mouse',
    'pilot'
  ];

  skin.AutohandlerTouchItems = {
    whenTouchPig: 'pig',
    whenTouchMan: 'man',
    whenTouchRoo: 'roo',
    whenTouchBird: 'bird',
    whenTouchSpider: 'spider',
    whenTouchMouse: 'mouse',
    whenTouchPilot: 'pilot',
    whenGetPig: 'pig',
    whenGetMan: 'man',
    whenGetRoo: 'roo',
    whenGetBird: 'bird',
    whenGetSpider: 'spider',
    whenGetMouse: 'mouse',
    whenGetPilot: 'pilot',
  };

  skin.AutohandlerTouchAllItems = {
    whenTouchAllPigs: 'pig',
    whenTouchAllMen: 'man',
    whenTouchAllRoos: 'roo',
    whenTouchAllBirds: 'bird',
    whenTouchAllSpiders: 'spider',
    whenTouchAllMice: 'mouse',
    whenTouchAllPilots: 'pilot',
    whenGetAllPigs: 'pig',
    whenGetAllMen: 'man',
    whenGetAllRoos: 'roo',
    whenGetAllBirds: 'bird',
    whenGetAllSpiders: 'spider',
    whenGetAllMice: 'mouse',
    whenGetAllPilots: 'pilot',
  };

  skin.specialItemProperties = {
    'pig':    { frames: 12, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true },
    'man':    { frames: 12, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -25}, activity: 'chase', speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true  },
    'roo':    { frames: 15, width: 100, height: 100, scale: 1.6, renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'bird':   { frames:  8, width: 100, height: 100, scale: 1.6, renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'spider': { frames: 12, width: 100, height: 100, scale: 1.2, renderOffset: { x: 0, y: -25}, activity: 'chase', speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'mouse':  { frames:  1, width: 100, height: 100, scale: 0.6, renderOffset: { x: 0, y: -25}, activity: 'flee',  speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'pilot':  { frames: 13, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -25}, activity: 'flee',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;

  // Spritesheet for animated goal.
  skin.animatedGoal = skin.assetUrl('goal_idle.png');

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 16;

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

  skin.avatarList = ['bot1', 'bot2'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: name == 'bot1' ? 14 : 16,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: name == 'bot1' ? 14 : 8
      },
      timePerFrame: 100
    };
  });

  skin.bot1.movementAudio = [
    { begin: 'bot1_move1_start', loop: 'bot1_move1_loop', end: 'bot1_move1_end' },
    { begin: 'bot1_move2_start', loop: 'bot1_move2_loop', end: 'bot1_move2_end' },
    { begin: 'bot1_move3_start', loop: 'bot1_move3_loop', end: 'bot1_move3_end' }
  ];
  skin.bot2.movementAudio = [
    { loop: 'bot2_move_loop', end: 'bot2_move_end' }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === 'item_character1';
  };

  // No failure avatar for this skin.
  skin.failureAvatar = null;

  // TODO: Create actual item choices
  skin.pig = skin.assetUrl('walk_item1.png');
  skin.man = skin.assetUrl('walk_item2.png');
  skin.roo = skin.assetUrl('walk_item3.png');
  skin.bird = skin.assetUrl('walk_item4.png');
  skin.spider = skin.assetUrl('walk_item5.png');
  skin.mouse = skin.assetUrl('walk_item6.png');
  skin.pilot = skin.assetUrl('walk_item7.png');

  skin.forest = {
    background: skin.assetUrl('background_background1.jpg'),
    tiles: skin.assetUrl('tiles_background1.png'),
    jumboTiles: skin.assetUrl('jumbotiles_background1.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4
  };
  skin.snow = {
    background: skin.assetUrl('background_background2.jpg'),
    tiles: skin.assetUrl('tiles_background2.png'),
    jumboTiles: skin.assetUrl('jumbotiles_background2.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4
  };
  skin.ship = {
    background: skin.assetUrl('background_background3.jpg'),
    tiles: skin.assetUrl('tiles_background3.png'),
    jumboTiles: skin.assetUrl('jumbotiles_background3.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Since we don't have jumbo tiles for our "snow" background, in the case
  // of the two maps that use jumbo pieces ("circle" and "horizontal") we
  // return a special version of the map that just uses regular tile pieces.

  skin.getMap = function(background, map) {
    if (background == "snow" && (map == "circle" || map == "horizontal")) {
      return map + "_nonjumbo";
    }
    else {
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
     [0, 0x02, 0x03, 0x04, 0x00, 0x24, 0x25, 0x00], 
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
     [0, 0x10,  0x00,  0x213, 0x213, 0x213, 0x213, 0x00],
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
     [0x00, 0x00,  0x102, 0x102, 0x00, 0x00,  0x00,  0x00], 
     [0x00, 0x00,  0x102, 0x102, 0x00, 0x00,  0x00,  0x23],   
     [0x00, 0x00,  0x03,  0x00,  0x00, 0x00,  0x121, 0x121],  
     [0x00, 0x00,  0x00,  0x00,  0x00, 0x00,  0x121, 0x121]];

  // Sounds.
  skin.sounds = [
    'character1sound1', 'character1sound2', 'character1sound3', 'character1sound4',
    'character1sound5', 'character1sound6', 'character1sound7', 'character1sound8',
    'character1sound9',
    'character2sound1', 'character2sound2', 'character2sound3', 'character2sound4',
    'item1sound1', 'item1sound2', 'item1sound3', 'item1sound4',
    'item3sound1', 'item3sound2', 'item3sound3', 'item3sound4',
    'item4sound1', 'item4sound2', 'item4sound3',
    'item5sound1', 'item5sound2', 'item5sound3',
    'item6sound1', 'item6sound2', 'item6sound3',
    'alert1', 'alert2', 'alert3', 'alert4',
    'applause',
    'start', 'win', 'failure', 'flag',
    'move1', 'move2', 'move3'
  ];

  skin.musicMetadata = HOC2015_MUSIC_METADATA;

  // Normally the sound isn't played for the final goal, but this forces it
  // to be played.
  skin.playFinalGoalSound = true;

  // These are used by blocks.js to customize our dropdown blocks across skins
  // NOTE: map names must have double quotes inside single quotes
  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    [msg.setMapRandom(), RANDOM_VALUE],
    [msg.setMapBlank(), '"blank"'],
    [msg.setMapCircle(), '"circle"'],
    [msg.setMapHorizontal(), '"horizontal"'],
    [msg.setMapGrid(), '"grid"'],
    [msg.setMapBlobs(), '"blobs"']
    ];

  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundForest(), '"forest"'],
    [msg.setBackgroundSnow(), '"snow"'],
    [msg.setBackgroundShip(), '"ship"']
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.forest.background, '"forest"'],
    [skin.snow.background, '"snow"'],
    [skin.ship.background, '"ship"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
    ];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteBot1(), '"bot1"'],
    [msg.setSpriteBot2(), '"bot2"']];

  skin.projectileChoices = [];

  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemMan(), '"man"'],
    [msg.itemPilot(), '"pilot"'],
    [msg.itemPig(), '"pig"'],
    [msg.itemBird(), '"bird"'],
    [msg.itemMouse(), '"mouse"'],
    [msg.itemRoo(), '"roo"'],
    [msg.itemSpider(), '"spider"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadHoc2015x(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.defaultBackground = 'main';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  skin.ItemClassNames = [
    'hazard'
  ];

  skin.AutohandlerTouchItems = {
  };

  skin.AutohandlerTouchAllItems = {
  };

  skin.specialItemProperties = {
    'hazard': { frames: 13, animationRate: 5, width: 100, height: 100, renderOffset: { x: 0, y: -25}, activity: 'watchActor', speed: constants.SpriteSpeed.VERY_SLOW, isHazard: true }
  };

  // Spritesheet for animated goal.
  skin.goal1 = skin.assetUrl('goal1.png');
  skin.goal2 = skin.assetUrl('goal2.png');

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 16;

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

  skin.avatarList = ['bot1'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 21,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: 19
      },
      timePerFrame: 100
    };
  });
  skin.bot1.movementAudio = [
    { begin: 'move1' },
    { begin: 'move2' },
    { begin: 'move3' },
    { begin: 'move4' }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === 'item_character1';
  };

  skin.hazard = skin.assetUrl('hazard_idle.png');

  skin.main = {
    background: skin.assetUrl('background_background1.jpg'),
    tiles: skin.assetUrl('tiles_background1.png')
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Sounds.
  skin.sounds = [
    'start', 'win', 'failure', 'flag',
    'move1', 'move2', 'move3', 'move4'
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
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteBot1(), '"bot1"']];

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
  { name: 'song1' },
  { name: 'song2' },
  { name: 'song3' },
  { name: 'song4', maxVolume: 0.85 },
  { name: 'song5' },
  { name: 'song6' },
  { name: 'song7' },
  { name: 'song8', maxVolume: 0.85 },
  { name: 'song9', maxVolume: 0.85 },
  { name: 'song10' },
  { name: 'song11', maxVolume: 0.85 },
  { name: 'song12', maxVolume: 0.85 },
  { name: 'song13' },
  { name: 'song14' },
  { name: 'song15' }
];

function loadStudio(skin, assetUrl) {
  skin.defaultBackground = 'cave';
  skin.projectileFrames = 8;
  skin.itemFrames = 8;

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 20;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 40;

  skin.hardcourt = {
    background: skin.assetUrl('background.png'),
  };
  skin.black = {
    background: skin.assetUrl('retro_background.png'),
  };
  skin.cave = {
    background: skin.assetUrl('background_cave.png'),
  };
  skin.night = {
    background: skin.assetUrl('background_santa.png'),
  };
  skin.cloudy = {
    background: skin.assetUrl('background_scifi.png'),
  };
  skin.underwater = {
    background: skin.assetUrl('background_underwater.png'),
  };
  skin.city = {
    background: skin.assetUrl('background_city.png'),
  };
  skin.desert = {
    background: skin.assetUrl('background_desert.png'),
  };
  skin.rainbow = {
    background: skin.assetUrl('background_rainbow.png'),
  };
  skin.soccer = {
    background: skin.assetUrl('background_soccer.png'),
  };
  skin.space = {
    background: skin.assetUrl('background_space.png'),
  };
  skin.tennis = {
    background: skin.assetUrl('background_tennis.png'),
  };
  skin.winter = {
    background: skin.assetUrl('background_winter.png'),
  };
  skin.grid = {
    background: skin.assetUrl('background_grid.png'),
  };

  skin.avatarList = [ "dog", "cat", "penguin", "dinosaur", "octopus", "witch",
    "bat", "bird", "dragon", "squirrel", "wizard", "alien", "ghost", "monster",
    "robot", "unicorn", "zombie", "knight", "ninja", "pirate", "caveboy",
    "cavegirl", "princess", "spacebot", "soccergirl", "soccerboy", "tennisgirl",
    "tennisboy"];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl(name + '_spritesheet_200px.png'),
      dropdownThumbnail: skin.assetUrl(name + '_thumb.png'),
      frameCounts: {
        normal: 1,
        animation: 1,
        turns: 7,
        emotions: 3
      }
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundCave(), '"cave"'],
    [msg.setBackgroundNight(), '"night"'],
    [msg.setBackgroundCloudy(), '"cloudy"'],
    [msg.setBackgroundUnderwater(), '"underwater"'],
    [msg.setBackgroundHardcourt(), '"hardcourt"'],
    [msg.setBackgroundBlack(), '"black"'],
    [msg.setBackgroundCity(), '"city"'],
    [msg.setBackgroundDesert(), '"desert"'],
    [msg.setBackgroundRainbow(), '"rainbow"'],
    [msg.setBackgroundSoccer(), '"soccer"'],
    [msg.setBackgroundSpace(), '"space"'],
    [msg.setBackgroundTennis(), '"tennis"'],
    [msg.setBackgroundWinter(), '"winter"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.cave.background, '"cave"'],
    [skin.night.background, '"night"'],
    [skin.cloudy.background, '"cloudy"'],
    [skin.underwater.background, '"underwater"'],
    [skin.hardcourt.background, '"hardcourt"'],
    [skin.black.background, '"black"'],
    [skin.city.background, '"city"'],
    [skin.desert.background, '"desert"'],
    [skin.rainbow.background, '"rainbow"'],
    [skin.soccer.background, '"soccer"'],
    [skin.space.background, '"space"'],
    [skin.tennis.background, '"tennis"'],
    [skin.winter.background, '"winter"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteWitch(), '"witch"'],
    [msg.setSpriteCat(), '"cat"'],
    [msg.setSpriteDinosaur(), '"dinosaur"'],
    [msg.setSpriteDog(), '"dog"'],
    [msg.setSpriteOctopus(), '"octopus"'],
    [msg.setSpritePenguin(), '"penguin"'],
    [msg.setSpriteBat(), '"bat"'],
    [msg.setSpriteBird(), '"bird"'],
    [msg.setSpriteDragon(), '"dragon"'],
    [msg.setSpriteSquirrel(), '"squirrel"'],
    [msg.setSpriteWizard(), '"wizard"'],
    [msg.setSpriteAlien(), '"alien"'],
    [msg.setSpriteGhost(), '"ghost"'],
    [msg.setSpriteMonster(), '"monster"'],
    [msg.setSpriteRobot(), '"robot"'],
    [msg.setSpriteUnicorn(), '"unicorn"'],
    [msg.setSpriteZombie(), '"zombie"'],
    [msg.setSpriteKnight(), '"knight"'],
    [msg.setSpriteNinja(), '"ninja"'],
    [msg.setSpritePirate(), '"pirate"'],
    [msg.setSpriteCaveBoy(), '"caveboy"'],
    [msg.setSpriteCaveGirl(), '"cavegirl"'],
    [msg.setSpritePrincess(), '"princess"'],
    [msg.setSpriteSpacebot(), '"spacebot"'],
    [msg.setSpriteSoccerGirl(), '"soccergirl"'],
    [msg.setSpriteSoccerBoy(), '"soccerboy"'],
    [msg.setSpriteTennisGirl(), '"tennisgirl"'],
    [msg.setSpriteTennisBoy(), '"tennisboy"']];

  skin.projectileChoices = [
    [msg.projectileBlueFireball(), '"blue_fireball"'],
    [msg.projectilePurpleFireball(), '"purple_fireball"'],
    [msg.projectileRedFireball(), '"red_fireball"'],
    [msg.projectileYellowHearts(), '"yellow_hearts"'],
    [msg.projectilePurpleHearts(), '"purple_hearts"'],
    [msg.projectileRedHearts(), '"red_hearts"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemBlueFireball(), '"item_blue_fireball"'],
    [msg.itemPurpleFireball(), '"item_purple_fireball"'],
    [msg.itemRedFireball(), '"item_red_fireball"'],
    [msg.itemYellowHearts(), '"item_yellow_hearts"'],
    [msg.itemPurpleHearts(), '"item_purple_hearts"'],
    [msg.itemRedHearts(), '"item_red_hearts"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}


exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'blue_fireball',
    'purple_fireball',
    'red_fireball',
    'purple_hearts',
    'red_hearts',
    'yellow_hearts',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_blue_fireball',
    'item_purple_fireball',
    'item_red_fireball',
    'item_purple_hearts',
    'item_red_hearts',
    'item_yellow_hearts',
  ];

  // Images
  skin.yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.red_hearts = skin.assetUrl('red_hearts.gif');
  skin.blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.red_fireball = skin.assetUrl('red_fireball.png');

  // TODO: proper item class names
  skin.item_yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.item_purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.item_red_hearts = skin.assetUrl('red_hearts.gif');
  skin.item_blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.item_purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.item_red_fireball = skin.assetUrl('red_fireball.png');

  skin.whenUp = skin.assetUrl('when-up.png');
  skin.whenDown = skin.assetUrl('when-down.png');
  skin.whenLeft = skin.assetUrl('when-left.png');
  skin.whenRight = skin.assetUrl('when-right.png');
  skin.collide = skin.assetUrl('when-sprite-collide.png');
  skin.emotionAngry = skin.assetUrl('emotion-angry.png');
  skin.emotionNormal = skin.assetUrl('emotion-nothing.png');
  skin.emotionSad = skin.assetUrl('emotion-sad.png');
  skin.emotionHappy = skin.assetUrl('emotion-happy.png');
  skin.speechBubble = skin.assetUrl('say-sprite.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');

  // Sounds
  skin.sounds = [
    'rubber', 'crunch', 'goal1', 'goal2', 'wood', 'retro', 'slap', 'hit',
    'winpoint', 'winpoint2', 'losepoint', 'losepoint2',
    'start', 'win', 'failure', 'flag'
  ];

  // Settings
  skin.background = skin.assetUrl('background.png');
  skin.spriteHeight = 100;
  skin.spriteWidth = 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  skin.preloadAssets = true;

  skin.activityChoices = [
    [msg.setActivityRandom(), RANDOM_VALUE],
    [msg.setActivityRoam(), '"roam"'],
    [msg.setActivityChase(), '"chase"'],
    [msg.setActivityFlee(), '"flee"'],
    [msg.setActivityNone(), '"none"'],
    ];

  // take care of items specific to skins
  switch (skin.id) {
    case 'infinity':
      loadInfinity(skin, assetUrl);
      break;
    case 'hoc2015':
      loadHoc2015(skin, assetUrl);
      break;
    case 'hoc2015x':
      loadHoc2015x(skin, assetUrl);
      break;
    case 'studio':
      loadStudio(skin, assetUrl);
      break;
  }

  return skin;
};
