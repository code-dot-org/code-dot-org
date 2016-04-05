/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

var skinsBase = require('../skins');
var msg = require('./locale');
var commonMsg = require('../locale');
var constants = require('./constants');
var studioApp = require('../StudioApp').singleton;

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;

// Standard Twitter options matching defaults in FeedbackUtils.createSharingDiv
// Use to avoid "story" reference in share text for a given skin.
var plainTwitterOptions = {
  text: commonMsg.defaultTwitterText() + " @codeorg",
  hashtag: 'HourOfCode'
};

function loadGumball(skin, assetUrl) {
  skin.twitterOptions = plainTwitterOptions;
  skin.defaultBackground = 'dots';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.spriteHeight = 110;
  skin.spriteWidth = 110;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 60;
  skin.spriteCollisionRectHeight = 60;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'projectile_banana',
    'projectile_dodgeball',
    'projectile_donkey',
    'projectile_handbag',
    'projectile_hotdog',
    'projectile_pompom',
    'projectile_toaster',
    'projectile_waterball',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_projectile_banana',
    'item_projectile_dodgeball',
    'item_projectile_donkey',
    'item_projectile_handbag',
    'item_projectile_hotdog',
    'item_projectile_pompom',
    'item_projectile_toaster',
    'item_projectile_waterball',
  ];

  // Images
  skin.projectile_banana = skin.assetUrl('projectile_banana.png');
  skin.projectile_dodgeball = skin.assetUrl('projectile_dodgeball.png');
  skin.projectile_donkey = skin.assetUrl('projectile_donkey.png');
  skin.projectile_handbag = skin.assetUrl('projectile_handbag.png');
  skin.projectile_hotdog = skin.assetUrl('projectile_hotdog.png');
  skin.projectile_pompom = skin.assetUrl('projectile_pompom.png');
  skin.projectile_toaster = skin.assetUrl('projectile_toaster.png');
  skin.projectile_waterball = skin.assetUrl('projectile_waterball.png');

  // TODO: proper item class names
  skin.item_projectile_banana = skin.assetUrl('projectile_banana.png');
  skin.item_projectile_dodgeball = skin.assetUrl('projectile_dodgeball.png');
  skin.item_projectile_donkey = skin.assetUrl('projectile_donkey.png');
  skin.item_projectile_handbag = skin.assetUrl('projectile_handbag.png');
  skin.item_projectile_hotdog = skin.assetUrl('projectile_hotdog.png');
  skin.item_projectile_pompom = skin.assetUrl('projectile_pompom.png');
  skin.item_projectile_toaster = skin.assetUrl('projectile_toaster.png');
  skin.item_projectile_waterball = skin.assetUrl('projectile_waterball.png');

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 40;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 20;

  skin.characters = {
    background: skin.assetUrl('background_characters.png'),
  };
  skin.checkers = {
    background: skin.assetUrl('background_checkers.png'),
  };
  skin.clouds = {
    background: skin.assetUrl('background_clouds.png'),
  };
  skin.cornered = {
    background: skin.assetUrl('background_cornered.png'),
  };
  skin.dots = {
    background: skin.assetUrl('background_dots.png'),
  };
  skin.graffiti = {
    background: skin.assetUrl('background_graffiti.png'),
  };
  skin.space = {
    background: skin.assetUrl('background_space.png'),
  };
  skin.squares = {
    background: skin.assetUrl('background_squares.png'),
  };
  skin.stripes = {
    background: skin.assetUrl('background_stripes.png'),
  };
  skin.wood = {
    background: skin.assetUrl('background_wood.png'),
  };

  skin.avatarList = ["anais", "anton", "bananajoe", "darwin", "gumball", "nicole", "penny", "richard"];
  skin.walkValues = [8, 8, 8, 12, 12, 8, 10, 12];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name, i) {
    skin[name] = {
      sprite: skin.assetUrl('idle_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        turns: 8,
        emotions: 0,
        walk: skin.walkValues[i],
        extraEmotions: 3,
        walkingEmotions: 3
      },
      animations: {
        turns: 8,
        walkingEmotions: 3,
      },
      animationFrameDuration: 3
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundCharacters(), '"characters"'],
    [msg.setBackgroundCheckers(), '"checkers"'],
    [msg.setBackgroundClouds(), '"clouds"'],
    [msg.setBackgroundCornered(), '"cornered"'],
    [msg.setBackgroundDots(), '"dots"'],
    [msg.setBackgroundGraffiti(), '"graffiti"'],
    [msg.setBackgroundSpace(), '"space"'],
    [msg.setBackgroundSquares(), '"squares"'],
    [msg.setBackgroundStripes(), '"stripes"'],
    [msg.setBackgroundWood(), '"wood"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.characters.background, '"characters"'],
    [skin.checkers.background, '"checkers"'],
    [skin.clouds.background, '"clouds"'],
    [skin.cornered.background, '"cornered"'],
    [skin.dots.background, '"dots"'],
    [skin.graffiti.background, '"graffiti"'],
    [skin.space.background, '"space"'],
    [skin.squares.background, '"squares"'],
    [skin.stripes.background, '"stripes"'],
    [skin.wood.background, '"wood"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteAnais(), '"anais"'],
    [msg.setSpriteAnton(), '"anton"'],
    [msg.setSpriteBananajoe(), '"bananajoe"'],
    [msg.setSpriteDarwin(), '"darwin"'],
    [msg.setSpriteGumball(), '"gumball"'],
    [msg.setSpriteNicole(), '"nicole"'],
    [msg.setSpritePenny(), '"penny"'],
    [msg.setSpriteRichard(), '"richard"']];

  skin.projectileChoices = [
    [msg.projectileBanana(), '"projectile_banana"'],
    [msg.projectileDodgeball(), '"projectile_dodgeball"'],
    [msg.projectileDonkey(), '"projectile_donkey"'],
    [msg.projectileHandbag(), '"projectile_handbag"'],
    [msg.projectileHotdog(), '"projectile_hotdog"'],
    [msg.projectilePompom(), '"projectile_pompom"'],
    [msg.projectileToaster(), '"projectile_toaster"'],
    [msg.projectileWaterball(), '"projectile_waterball"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  skin.makeProjectileChoices = [
    [msg.makeProjectileBanana(), '"projectile_banana"'],
    [msg.makeProjectileDodgeball(), '"projectile_dodgeball"'],
    [msg.makeProjectileDonkey(), '"projectile_donkey"'],
    [msg.makeProjectileHandbag(), '"projectile_handbag"'],
    [msg.makeProjectileHotdog(), '"projectile_hotdog"'],
    [msg.makeProjectilePompom(), '"projectile_pompom"'],
    [msg.makeProjectileToaster(), '"projectile_toaster"'],
    [msg.makeProjectileWaterball(), '"projectile_waterball"']];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithProjectileBanana(), 'projectile_banana'],
    [msg.whenSpriteCollidedWithProjectileDodgeball(), 'projectile_dodgeball'],
    [msg.whenSpriteCollidedWithProjectileDonkey(), 'projectile_donkey'],
    [msg.whenSpriteCollidedWithProjectileHandbag(), 'projectile_handbag'],
    [msg.whenSpriteCollidedWithProjectileHotdog(), 'projectile_hotdog'],
    [msg.whenSpriteCollidedWithProjectilePompom(), 'projectile_pompom'],
    [msg.whenSpriteCollidedWithProjectileToaster(), 'projectile_toaster'],
    [msg.whenSpriteCollidedWithProjectileWaterball(), 'projectile_waterball']];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemProjectileBanana(), '"item_projectile_banana"'],
    [msg.itemProjectileDodgeball(), '"item_projectile_dodgeball"'],
    [msg.itemProjectileDonkey(), '"item_projectile_donkey"'],
    [msg.itemProjectileHandbag(), '"item_projectile_handbag"'],
    [msg.itemProjectileHotdog(), '"item_projectile_hotdog"'],
    [msg.itemProjectilePompom(), '"item_projectile_pompom"'],
    [msg.itemProjectileToaster(), '"item_projectile_toaster"'],
    [msg.itemProjectileWaterball(), '"item_projectile_waterball"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadIceAge(skin, assetUrl) {
  skin.twitterOptions = plainTwitterOptions;
  skin.defaultBackground = 'icy1';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.spriteHeight = 130;
  skin.spriteWidth = 130;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 60;
  skin.spriteCollisionRectHeight = 60;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'ia_projectile_1',
    'ia_projectile_2',
    'ia_projectile_3',
    'ia_projectile_4',
    'ia_projectile_5',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_ia_projectile_1',
    'item_ia_projectile_2',
    'item_ia_projectile_3',
    'item_ia_projectile_4',
    'item_ia_projectile_5',
  ];

  // Images
  skin.ia_projectile_1 = skin.assetUrl('ia_projectile_1.png');
  skin.ia_projectile_2 = skin.assetUrl('ia_projectile_2.png');
  skin.ia_projectile_3 = skin.assetUrl('ia_projectile_3.png');
  skin.ia_projectile_4 = skin.assetUrl('ia_projectile_4.png');
  skin.ia_projectile_5 = skin.assetUrl('ia_projectile_5.png');

  // TODO: proper item class names
  skin.item_ia_projectile_1 = skin.assetUrl('ia_projectile_1.png');
  skin.item_ia_projectile_2 = skin.assetUrl('ia_projectile_2.png');
  skin.item_ia_projectile_3 = skin.assetUrl('ia_projectile_3.png');
  skin.item_ia_projectile_4 = skin.assetUrl('ia_projectile_4.png');
  skin.item_ia_projectile_5 = skin.assetUrl('ia_projectile_5.png');

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 17;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 40;

  skin.icy1 = {
    background: skin.assetUrl('background_icy1.jpg'),
  };
  skin.icy2 = {
    background: skin.assetUrl('background_icy2.jpg'),
  };
  skin.icy3 = {
    background: skin.assetUrl('background_icy3.jpg'),
  };
  skin.icy4 = {
    background: skin.assetUrl('background_icy4.jpg'),
  };
  skin.icy5 = {
    background: skin.assetUrl('background_icy5.jpg'),
  };
  skin.ground = {
    background: skin.assetUrl('background_ground.jpg'),
  };

  skin.avatarList = ["manny", "sid", "scrat", "diego", "granny"];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        turns: 8,
        emotions: 0,
        walk: 12,
        extraEmotions: 3,
        walkingEmotions: 3
      },
      animations: {
        turns: 8,
        walkingEmotions: 3,
      },
      animationFrameDuration: 3
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundIcy1(), '"icy1"'],
    [msg.setBackgroundIcy2(), '"icy2"'],
    [msg.setBackgroundIcy3(), '"icy3"'],
    [msg.setBackgroundIcy4(), '"icy4"'],
    [msg.setBackgroundIcy5(), '"icy5"'],
    [msg.setBackgroundGround(), '"ground"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.icy1.background, '"icy1"'],
    [skin.icy2.background, '"icy2"'],
    [skin.icy3.background, '"icy3"'],
    [skin.icy4.background, '"icy4"'],
    [skin.icy5.background, '"icy5"'],
    [skin.ground.background, '"ground"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteManny(), '"manny"'],
    [msg.setSpriteSid(), '"sid"'],
    [msg.setSpriteScrat(), '"scrat"'],
    [msg.setSpriteDiego(), '"diego"'],
    [msg.setSpriteGranny(), '"granny"']];

  skin.projectileChoices = [
    [msg.projectileIAProjectile1(), '"ia_projectile_1"'],
    [msg.projectileIAProjectile2(), '"ia_projectile_2"'],
    [msg.projectileIAProjectile3(), '"ia_projectile_3"'],
    [msg.projectileIAProjectile4(), '"ia_projectile_4"'],
    [msg.projectileIAProjectile5(), '"ia_projectile_5"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  skin.makeProjectileChoices = [
    [msg.makeProjectileIAProjectile1(), '"ia_projectile_1"'],
    [msg.makeProjectileIAProjectile2(), '"ia_projectile_2"'],
    [msg.makeProjectileIAProjectile3(), '"ia_projectile_3"'],
    [msg.makeProjectileIAProjectile4(), '"ia_projectile_4"'],
    [msg.makeProjectileIAProjectile5(), '"ia_projectile_5"']];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithIAProjectile1(), 'ia_projectile_1'],
    [msg.whenSpriteCollidedWithIAProjectile2(), 'ia_projectile_2'],
    [msg.whenSpriteCollidedWithIAProjectile3(), 'ia_projectile_3'],
    [msg.whenSpriteCollidedWithIAProjectile4(), 'ia_projectile_4'],
    [msg.whenSpriteCollidedWithIAProjectile5(), 'ia_projectile_5']];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemIAProjectile1(), '"item_ia_projectile_1"'],
    [msg.itemIAProjectile2(), '"item_ia_projectile_2"'],
    [msg.itemIAProjectile3(), '"item_ia_projectile_3"'],
    [msg.itemIAProjectile4(), '"item_ia_projectile_4"'],
    [msg.itemIAProjectile5(), '"item_ia_projectile_5"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

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
        turns: 8,
        emotions: 0,
        walk: 12
      },
      animations: {
        turns: 8
      },
      animationFrameDuration: 3
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
  skin.twitterOptions = plainTwitterOptions;
  skin.preloadAssets = true;

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
    'pufferpig':       { frames: 12, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -15}, activity: 'roam',  speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true },
    'stormtrooper':    { frames: 12, width: 100, height: 100, scale: 1.1, renderOffset: { x: 0, y: -15}, activity: 'chase', speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true  },
    'tauntaun':        { frames: 15, width: 100, height: 100, scale: 1.6, renderOffset: { x: 0, y:  20}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'mynock':          { frames:  8, width: 100, height: 100, scale: 0.9, renderOffset: { x: 0, y: -20}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'probot':          { frames: 12, width: 100, height: 100, scale: 1.2, renderOffset: { x: 0, y: -10}, activity: 'chase', speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'mousedroid':      { frames:  1, width: 100, height: 100, scale: 0.5, renderOffset: { x: 0, y: -20}, activity: 'flee',  speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'rebelpilot':      { frames: 13, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -20}, activity: 'flee',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
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
        normal: name == 'r2-d2' ? 14 : 16,
        turns: 8,
        emotions: 0,
        walk: name == 'r2-d2' ? 14 : 8
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

  skin.getMap = function(background, map) {
    if (background == "hoth" && (map == "circle" || map == "horizontal")) {
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
}

function loadHoc2015x(skin, assetUrl) {
  skin.preloadAssets = true;

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
    'hazard': { frames: 13, animationFrameDuration: 6, width: 100, height: 100, scale: 1.3, renderOffset: { x: 0, y: -25}, activity: 'watchActor', speed: constants.SpriteSpeed.VERY_SLOW, isHazard: true }
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

  skin.avatarList = ["dog", "cat", "penguin", "dinosaur", "octopus", "witch",
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
        normal: 2,
        holdIdleFrame0Count: 8,
        turns: 7,
        emotions: 3
      },
      animationFrameDuration: 6
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

  skin.makeProjectileChoices = [
    [msg.makeProjectileBlueFireball(), '"blue_fireball"'],
    [msg.makeProjectilePurpleFireball(), '"purple_fireball"'],
    [msg.makeProjectileRedFireball(), '"red_fireball"'],
    [msg.makeProjectileYellowHearts(), '"yellow_hearts"'],
    [msg.makeProjectilePurpleHearts(), '"purple_hearts"'],
    [msg.makeProjectileRedHearts(), '"red_hearts"']];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithBlueFireball(), 'blue_fireball'],
    [msg.whenSpriteCollidedWithPurpleFireball(), 'purple_fireball'],
    [msg.whenSpriteCollidedWithRedFireball(), 'red_fireball'],
    [msg.whenSpriteCollidedWithYellowHearts(), 'yellow_hearts'],
    [msg.whenSpriteCollidedWithPurpleHearts(), 'purple_hearts'],
    [msg.whenSpriteCollidedWithRedHearts(), 'red_hearts']];

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
  skin.builtinSounds = ['start', 'win', 'failure', 'flag'];
  skin.sounds = [
    'rubber', 'crunch', 'goal1', 'goal2', 'wood', 'retro', 'slap', 'hit',
    'winpoint', 'winpoint2', 'losepoint', 'losepoint2'
  ];

  skin.soundChoices = [
    [msg.playSoundRandom(), RANDOM_VALUE],
    [msg.playSoundHit(), 'hit'],
    [msg.playSoundWood(), 'wood'],
    [msg.playSoundRetro(), 'retro'],
    [msg.playSoundSlap(), 'slap'],
    [msg.playSoundRubber(), 'rubber'],
    [msg.playSoundCrunch(), 'crunch'],
    [msg.playSoundWinPoint(), 'winpoint'],
    [msg.playSoundWinPoint2(), 'winpoint2'],
    [msg.playSoundLosePoint(), 'losepoint'],
    [msg.playSoundLosePoint2(), 'losepoint2'],
    [msg.playSoundGoal1(), 'goal1'],
    [msg.playSoundGoal2(), 'goal2']];

  skin.soundChoicesK1 = [
    [msg.soundRandom(), RANDOM_VALUE],
    [msg.soundHit(), 'hit'],
    [msg.soundWood(), 'wood'],
    [msg.soundRetro(), 'retro'],
    [msg.soundSlap(), 'slap'],
    [msg.soundRubber(), 'rubber'],
    [msg.soundCrunch(), 'crunch'],
    [msg.soundWinPoint(), 'winpoint'],
    [msg.soundWinPoint2(), 'winpoint2'],
    [msg.soundLosePoint(), 'losepoint'],
    [msg.soundLosePoint2(), 'losepoint2'],
    [msg.soundGoal1(), 'goal1'],
    [msg.soundGoal2(), 'goal2']];

  // Settings
  skin.background = skin.assetUrl('background.png');
  skin.spriteHeight = 100;
  skin.spriteWidth = 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  skin.preloadAssets = true;

  skin.setSpritePrefix = msg.setSprite();

  skin.activityChoices = [
    [msg.setActivityRandom(), RANDOM_VALUE],
    [msg.setActivityRoam(), '"roam"'],
    [msg.setActivityChase(), '"chase"'],
    [msg.setActivityFlee(), '"flee"'],
    [msg.setActivityNone(), '"none"'],
    ];

  // take care of items specific to skins
  switch (skin.id) {
    case 'gumball':
      loadGumball(skin, assetUrl);
      break;
    case 'iceage':
      loadIceAge(skin, assetUrl);
      break;
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
