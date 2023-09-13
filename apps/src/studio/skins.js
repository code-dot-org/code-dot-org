/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

import {HIDDEN_VALUE, RANDOM_VALUE} from './constants';
import msg from './locale';
import commonMsg from '@cdo/locale';
import skinsBase from '../skins';
import {loadStarWarsGrid, loadStarWarsEvents} from './starwars/skins.js';

const toExport = {};

// Standard Twitter options matching defaults in FeedbackUtils.createSharingDiv
// Use to avoid "story" reference in share text for a given skin.
var plainTwitterOptions = {
  text: commonMsg.defaultTwitterText() + ' @codeorg',
  hashtag: 'HourOfCode',
};

function loadGumball(skin) {
  skin.twitterOptions = plainTwitterOptions;
  skin.defaultBackground = 'dots';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.spriteHeight = 110;
  skin.spriteWidth = 110;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth = 60;
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

  skin.avatarList = [
    'anais',
    'anton',
    'bananajoe',
    'darwin',
    'gumball',
    'nicole',
    'penny',
    'richard',
  ];
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
        walkingEmotions: 3,
      },
      animations: {
        turns: 8,
        walkingEmotions: 3,
      },
      animationFrameDuration: 3,
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
    [msg.setBackgroundWood(), '"wood"'],
  ];

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
    [skin.randomPurpleIcon, RANDOM_VALUE],
  ];

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
    [msg.setSpriteRichard(), '"richard"'],
  ];

  skin.projectileChoices = [
    [msg.projectileBanana(), '"projectile_banana"'],
    [msg.projectileDodgeball(), '"projectile_dodgeball"'],
    [msg.projectileDonkey(), '"projectile_donkey"'],
    [msg.projectileHandbag(), '"projectile_handbag"'],
    [msg.projectileHotdog(), '"projectile_hotdog"'],
    [msg.projectilePompom(), '"projectile_pompom"'],
    [msg.projectileToaster(), '"projectile_toaster"'],
    [msg.projectileWaterball(), '"projectile_waterball"'],
    [msg.projectileRandom(), RANDOM_VALUE],
  ];

  skin.makeProjectileChoices = [
    [msg.makeProjectileBanana(), '"projectile_banana"'],
    [msg.makeProjectileDodgeball(), '"projectile_dodgeball"'],
    [msg.makeProjectileDonkey(), '"projectile_donkey"'],
    [msg.makeProjectileHandbag(), '"projectile_handbag"'],
    [msg.makeProjectileHotdog(), '"projectile_hotdog"'],
    [msg.makeProjectilePompom(), '"projectile_pompom"'],
    [msg.makeProjectileToaster(), '"projectile_toaster"'],
    [msg.makeProjectileWaterball(), '"projectile_waterball"'],
  ];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithProjectileBanana(), 'projectile_banana'],
    [msg.whenSpriteCollidedWithProjectileDodgeball(), 'projectile_dodgeball'],
    [msg.whenSpriteCollidedWithProjectileDonkey(), 'projectile_donkey'],
    [msg.whenSpriteCollidedWithProjectileHandbag(), 'projectile_handbag'],
    [msg.whenSpriteCollidedWithProjectileHotdog(), 'projectile_hotdog'],
    [msg.whenSpriteCollidedWithProjectilePompom(), 'projectile_pompom'],
    [msg.whenSpriteCollidedWithProjectileToaster(), 'projectile_toaster'],
    [msg.whenSpriteCollidedWithProjectileWaterball(), 'projectile_waterball'],
  ];

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
    [msg.itemRandom(), RANDOM_VALUE],
  ];
}

function loadIceAge(skin) {
  skin.twitterOptions = plainTwitterOptions;
  skin.defaultBackground = 'icy1';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  skin.spriteHeight = 130;
  skin.spriteWidth = 130;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth = 60;
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

  skin.avatarList = ['manny', 'sid', 'scrat', 'diego', 'granny'];

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
        walkingEmotions: 3,
      },
      animations: {
        turns: 8,
        walkingEmotions: 3,
      },
      animationFrameDuration: 3,
    };
  });

  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundIcy1(), '"icy1"'],
    [msg.setBackgroundIcy2(), '"icy2"'],
    [msg.setBackgroundIcy3(), '"icy3"'],
    [msg.setBackgroundIcy4(), '"icy4"'],
    [msg.setBackgroundIcy5(), '"icy5"'],
    [msg.setBackgroundGround(), '"ground"'],
  ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.icy1.background, '"icy1"'],
    [skin.icy2.background, '"icy2"'],
    [skin.icy3.background, '"icy3"'],
    [skin.icy4.background, '"icy4"'],
    [skin.icy5.background, '"icy5"'],
    [skin.ground.background, '"ground"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
  ];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteManny(), '"manny"'],
    [msg.setSpriteSid(), '"sid"'],
    [msg.setSpriteScrat(), '"scrat"'],
    [msg.setSpriteDiego(), '"diego"'],
    [msg.setSpriteGranny(), '"granny"'],
  ];

  skin.projectileChoices = [
    [msg.projectileIAProjectile1(), '"ia_projectile_1"'],
    [msg.projectileIAProjectile2(), '"ia_projectile_2"'],
    [msg.projectileIAProjectile3(), '"ia_projectile_3"'],
    [msg.projectileIAProjectile4(), '"ia_projectile_4"'],
    [msg.projectileIAProjectile5(), '"ia_projectile_5"'],
    [msg.projectileRandom(), RANDOM_VALUE],
  ];

  skin.makeProjectileChoices = [
    [msg.makeProjectileIAProjectile1(), '"ia_projectile_1"'],
    [msg.makeProjectileIAProjectile2(), '"ia_projectile_2"'],
    [msg.makeProjectileIAProjectile3(), '"ia_projectile_3"'],
    [msg.makeProjectileIAProjectile4(), '"ia_projectile_4"'],
    [msg.makeProjectileIAProjectile5(), '"ia_projectile_5"'],
  ];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithIAProjectile1(), 'ia_projectile_1'],
    [msg.whenSpriteCollidedWithIAProjectile2(), 'ia_projectile_2'],
    [msg.whenSpriteCollidedWithIAProjectile3(), 'ia_projectile_3'],
    [msg.whenSpriteCollidedWithIAProjectile4(), 'ia_projectile_4'],
    [msg.whenSpriteCollidedWithIAProjectile5(), 'ia_projectile_5'],
  ];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemIAProjectile1(), '"item_ia_projectile_1"'],
    [msg.itemIAProjectile2(), '"item_ia_projectile_2"'],
    [msg.itemIAProjectile3(), '"item_ia_projectile_3"'],
    [msg.itemIAProjectile4(), '"item_ia_projectile_4"'],
    [msg.itemIAProjectile5(), '"item_ia_projectile_5"'],
    [msg.itemRandom(), RANDOM_VALUE],
  ];
}

function loadInfinity(skin) {
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
    'projectile_duck',
  ];

  skin.specialProjectileProperties = {
    projectile_cherry: {frames: 13},
    projectile_ice: {frames: 12},
    projectile_duck: {frames: 12},
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
    'item_duck',
  ];

  skin.specialItemProperties = {
    item_cherry: {frames: 13},
    item_ice: {frames: 12},
    item_duck: {frames: 12},
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;
  skin.fadeExplosion = true;
  skin.timePerExplosionFrame = 100;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth = 70;
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
        walk: 12,
      },
      animations: {
        turns: 8,
      },
      animationFrameDuration: 3,
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
    background: skin.assetUrl('background_leafy.jpg'),
  };
  skin.grassy = {
    background: skin.assetUrl('background_grassy.jpg'),
  };
  skin.flower = {
    background: skin.assetUrl('background_flower.jpg'),
  };
  skin.tile = {
    background: skin.assetUrl('background_tile.jpg'),
  };
  skin.icy = {
    background: skin.assetUrl('background_icy.jpg'),
  };
  skin.snowy = {
    background: skin.assetUrl('background_snowy.jpg'),
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
    [msg.setSpriteRapunzel(), '"rapunzel"'],
  ];

  skin.projectileChoices = [
    [msg.projectileHiro(), '"projectile_hiro"'],
    [msg.projectileAnna(), '"projectile_anna"'],
    [msg.projectileElsa(), '"projectile_elsa"'],
    [msg.projectileBaymax(), '"projectile_baymax"'],
    [msg.projectileRapunzel(), '"projectile_rapunzel"'],
    [msg.projectileCherry(), '"projectile_cherry"'],
    [msg.projectileIce(), '"projectile_ice"'],
    [msg.projectileDuck(), '"projectile_duck"'],
    [msg.projectileRandom(), RANDOM_VALUE],
  ];

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
    [msg.itemRandom(), RANDOM_VALUE],
  ];
}

function loadStudio(skin) {
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

  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    [msg.setMapRandom(), RANDOM_VALUE],
    [msg.setMapBlank(), 'blank'],
    [msg.setMapCircle(), 'circle'],
    [msg.setMapHorizontal(), 'horizontal'],
    [msg.setMapGrid(), 'grid'],
    [msg.setMapBlobs(), 'blobs'],
  ];

  skin.wallMaps = {
    blank: {
      srcUrl: skin.assetUrl('obstacle_blank.png'),
    },
    circle: {
      srcUrl: skin.assetUrl('obstacle_circle.png'),
    },
    horizontal: {
      srcUrl: skin.assetUrl('obstacle_horizontal.png'),
    },
    grid: {
      srcUrl: skin.assetUrl('obstacle_grid.png'),
    },
    blobs: {
      srcUrl: skin.assetUrl('obstacle_blobs.png'),
    },
  };

  skin.avatarList = [
    'dog',
    'cat',
    'penguin',
    'dinosaur',
    'octopus',
    'witch',
    'bat',
    'bird',
    'dragon',
    'squirrel',
    'wizard',
    'alien',
    'ghost',
    'monster',
    'robot',
    'unicorn',
    'zombie',
    'knight',
    'ninja',
    'pirate',
    'caveboy',
    'cavegirl',
    'princess',
    'spacebot',
    'soccergirl',
    'soccerboy',
    'tennisgirl',
    'tennisboy',
  ];

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
        emotions: 3,
      },
      animationFrameDuration: 6,
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
    [msg.setBackgroundWinter(), '"winter"'],
  ];

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
    [skin.randomPurpleIcon, RANDOM_VALUE],
  ];

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
    [msg.setSpriteTennisBoy(), '"tennisboy"'],
  ];

  skin.projectileChoices = [
    [msg.projectileAirplane(), '"airplane"'],
    [msg.projectileBasketball(), '"basketball"'],
    [msg.projectileDisc(), '"disc"'],
    [msg.projectilePie(), '"pie"'],
    [msg.projectilePumpkin(), '"pumpkin"'],
    [msg.projectileStar(), '"star"'],
    [msg.projectileSandwich(), '"sandwich"'],
    [msg.projectileSnowball(), '"snowball"'],
    [msg.projectileBlueFireball(), '"blue_fireball"'],
    [msg.projectilePurpleFireball(), '"purple_fireball"'],
    [msg.projectileRedFireball(), '"red_fireball"'],
    [msg.projectileYellowHearts(), '"yellow_hearts"'],
    [msg.projectilePurpleHearts(), '"purple_hearts"'],
    [msg.projectileRedHearts(), '"red_hearts"'],
    [msg.projectileRandom(), RANDOM_VALUE],
  ];

  skin.makeProjectileChoices = [
    [msg.makeProjectileAirplane(), '"airplane"'],
    [msg.makeProjectileBasketball(), '"basketball"'],
    [msg.makeProjectileDisc(), '"disc"'],
    [msg.makeProjectilePie(), '"pie"'],
    [msg.makeProjectilePumpkin(), '"pumpkin"'],
    [msg.makeProjectileStar(), '"star"'],
    [msg.makeProjectileSandwich(), '"sandwich"'],
    [msg.makeProjectileSnowball(), '"snowball"'],
    [msg.makeProjectileBlueFireball(), '"blue_fireball"'],
    [msg.makeProjectilePurpleFireball(), '"purple_fireball"'],
    [msg.makeProjectileRedFireball(), '"red_fireball"'],
    [msg.makeProjectileYellowHearts(), '"yellow_hearts"'],
    [msg.makeProjectilePurpleHearts(), '"purple_hearts"'],
    [msg.makeProjectileRedHearts(), '"red_hearts"'],
  ];

  skin.whenProjectileCollidedChoices = [
    [msg.whenSpriteCollidedWithAirplane(), 'airplane'],
    [msg.whenSpriteCollidedWithBasketball(), 'basketball'],
    [msg.whenSpriteCollidedWithDisc(), 'disc'],
    [msg.whenSpriteCollidedWithPie(), 'pie'],
    [msg.whenSpriteCollidedWithPumpkin(), 'pumpkin'],
    [msg.whenSpriteCollidedWithStar(), 'star'],
    [msg.whenSpriteCollidedWithSandwich(), 'sandwich'],
    [msg.whenSpriteCollidedWithSnowball(), 'snowball'],
    [msg.whenSpriteCollidedWithBlueFireball(), 'blue_fireball'],
    [msg.whenSpriteCollidedWithPurpleFireball(), 'purple_fireball'],
    [msg.whenSpriteCollidedWithRedFireball(), 'red_fireball'],
    [msg.whenSpriteCollidedWithYellowHearts(), 'yellow_hearts'],
    [msg.whenSpriteCollidedWithPurpleHearts(), 'purple_hearts'],
    [msg.whenSpriteCollidedWithRedHearts(), 'red_hearts'],
  ];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemAirplane(), '"item_airplane"'],
    [msg.itemBasketball(), '"item_basketball"'],
    [msg.itemDisc(), '"item_disc"'],
    [msg.itemPie(), '"item_pie"'],
    [msg.itemPumpkin(), '"item_pumpkin"'],
    [msg.itemStar(), '"item_star"'],
    [msg.itemSandwich(), '"item_sandwich"'],
    [msg.itemSnowball(), '"item_snowball"'],
    [msg.itemBlueFireball(), '"item_blue_fireball"'],
    [msg.itemPurpleFireball(), '"item_purple_fireball"'],
    [msg.itemRedFireball(), '"item_red_fireball"'],
    [msg.itemYellowHearts(), '"item_yellow_hearts"'],
    [msg.itemPurpleHearts(), '"item_purple_hearts"'],
    [msg.itemRedHearts(), '"item_red_hearts"'],
    [msg.itemRandom(), RANDOM_VALUE],
  ];
}

toExport.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'airplane',
    'basketball',
    'disc',
    'pie',
    'pumpkin',
    'star',
    'sandwich',
    'snowball',
    'blue_fireball',
    'purple_fireball',
    'red_fireball',
    'purple_hearts',
    'red_hearts',
    'yellow_hearts',
  ];

  skin.specialProjectileProperties = {
    airplane: {frames: 10},
    basketball: {frames: 10},
    disc: {frames: 10},
    pie: {frames: 10},
    pumpkin: {frames: 10},
    star: {frames: 10},
    sandwich: {frames: 10},
    snowball: {frames: 10},
  };

  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_airplane',
    'item_basketball',
    'item_disc',
    'item_pie',
    'item_pumpkin',
    'item_star',
    'item_sandwich',
    'item_snowball',
    'item_blue_fireball',
    'item_purple_fireball',
    'item_red_fireball',
    'item_purple_hearts',
    'item_red_hearts',
    'item_yellow_hearts',
  ];

  // Images
  skin.airplane = skin.assetUrl('projectile_airplane.png');
  skin.basketball = skin.assetUrl('projectile_basketball.png');
  skin.disc = skin.assetUrl('projectile_disc.png');
  skin.pie = skin.assetUrl('projectile_pie.png');
  skin.pumpkin = skin.assetUrl('projectile_pumpkin.png');
  skin.star = skin.assetUrl('projectile_star.png');
  skin.sandwich = skin.assetUrl('projectile_sandwich.png');
  skin.snowball = skin.assetUrl('projectile_snowball.png');
  skin.yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.red_hearts = skin.assetUrl('red_hearts.gif');
  skin.blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.red_fireball = skin.assetUrl('red_fireball.png');

  // TODO: proper item class names
  skin.item_airplane = skin.assetUrl('projectile_airplane.png');
  skin.item_basketball = skin.assetUrl('projectile_basketball.png');
  skin.item_disc = skin.assetUrl('projectile_disc.png');
  skin.item_pie = skin.assetUrl('projectile_pie.png');
  skin.item_pumpkin = skin.assetUrl('projectile_pumpkin.png');
  skin.item_star = skin.assetUrl('projectile_star.png');
  skin.item_sandwich = skin.assetUrl('projectile_sandwich.png');
  skin.item_snowball = skin.assetUrl('projectile_snowball.png');
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
    'rubber',
    'crunch',
    'goal1',
    'goal2',
    'wood',
    'retro',
    'slap',
    'hit',
    'winpoint',
    'winpoint2',
    'losepoint',
    'losepoint2',
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
    [msg.playSoundGoal2(), 'goal2'],
  ];

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
    [msg.soundGoal2(), 'goal2'],
  ];

  // Settings
  skin.background = skin.assetUrl('background.png');
  skin.spriteHeight = 100;
  skin.spriteWidth = 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  skin.preloadAssets = true;

  // Offset for the rectangle in collidable in which wall collisions occur.
  // Default to no offset here and allow other skins to override.
  skin.wallCollisionRectOffsetX = 0;
  skin.wallCollisionRectOffsetY = 0;

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
      loadGumball(skin);
      break;
    case 'iceage':
      loadIceAge(skin);
      break;
    case 'infinity':
      loadInfinity(skin);
      break;
    case 'hoc2015':
      loadStarWarsEvents(skin);
      skin.twitterOptions = plainTwitterOptions;
      break;
    case 'hoc2015x':
      loadStarWarsGrid(skin);
      break;
    case 'studio':
      loadStudio(skin);
      break;
  }

  return skin;
};

export {toExport as default};
