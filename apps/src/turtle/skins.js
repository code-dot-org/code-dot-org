var skinBase = require('../skins');

exports.load = function(assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  skin.linePatterns = {
    patternDefault: assetUrl('media/common_images/defaultline-menuicon.png'), // default first, then alphabetical
    arrowLine: assetUrl('media/common_images/arrow.png'),
    arrowMenu: assetUrl('media/common_images/arrow-menuicon.png'),
    bambooLine: assetUrl('media/common_images/bamboo.png'),
    bambooMenu: assetUrl('media/common_images/bamboo-menuicon.png'),
    brickLine: assetUrl('media/common_images/brick.png'),
    brickMenu: assetUrl('media/common_images/brick-menuicon.png'),
    cactusLine: assetUrl('media/common_images/cactus.png'),
    cactusMenu: assetUrl('media/common_images/cactus-menuicon.png'),
    candyLine: assetUrl('media/common_images/candy.png'),
    candyMenu: assetUrl('media/common_images/candy-menuicon.png'),
    candycaneLine: assetUrl('media/common_images/candycane.png'),
    candycaneMenu: assetUrl('media/common_images/candycane-menuicon.png'),
    candycaneGreenLine: assetUrl('media/common_images/candycane-green.png'),
    candycaneGreenMenu: assetUrl(
      'media/common_images/candycane-green-menuicon.png'
    ),
    candycaneRedGreenLine: assetUrl(
      'media/common_images/candycane-redgreen.png'
    ),
    candycaneRedGreenMenu: assetUrl(
      'media/common_images/candycane-redgreen-menuicon.png'
    ),
    dashLine: assetUrl('media/common_images/dashline.png'),
    dashMenu: assetUrl('media/common_images/dashline-menuicon.png'),
    dashBlueLine: assetUrl('media/common_images/dashline-blue.png'),
    dashBlueMenu: assetUrl('media/common_images/dashline-blue-menuicon.png'),
    diamondLine: assetUrl('media/common_images/diamond.png'),
    diamondMenu: assetUrl('media/common_images/diamond-menuicon.png'),
    dotLine: assetUrl('media/common_images/dotline.png'),
    dotMenu: assetUrl('media/common_images/dotline-menuicon.png'),
    dotBlueLine: assetUrl('media/common_images/dotline-blue.png'),
    dotBlueMenu: assetUrl('media/common_images/dotline-blue-menuicon.png'),
    dotYellowLine: assetUrl('media/common_images/dotline-yellow.png'),
    dotYellowMenu: assetUrl('media/common_images/dotline-yellow-menuicon.png'),
    flowerPinkLine: assetUrl('media/common_images/flower-pink.png'),
    flowerPinkMenu: assetUrl('media/common_images/flower-pink-menuicon.png'),
    flowerPurpleLine: assetUrl('media/common_images/flower-purple.png'),
    flowerPurpleMenu: assetUrl(
      'media/common_images/flower-purple-menuicon.png'
    ),
    flowerRedLine: assetUrl('media/common_images/flower-red.png'),
    flowerRedMenu: assetUrl('media/common_images/flower-red-menuicon.png'),
    flowerYellowLine: assetUrl('media/common_images/flower-yellow.png'),
    flowerYellowMenu: assetUrl(
      'media/common_images/flower-yellow-menuicon.png'
    ),
    heartLine: assetUrl('media/common_images/heart.png'),
    heartMenu: assetUrl('media/common_images/heart-menuicon.png'),
    heartPinkLine: assetUrl('media/common_images/heart-pink.png'),
    heartPinkMenu: assetUrl('media/common_images/heart-pink-menuicon.png'),
    lightningLine: assetUrl('media/common_images/lightning.png'),
    lightningMenu: assetUrl('media/common_images/lightning-menuicon.png'),
    pawprintLine: assetUrl('media/common_images/pawprint.png'),
    pawprintMenu: assetUrl('media/common_images/pawprint-menuicon.png'),
    pawprint2Line: assetUrl('media/common_images/pawprint2.png'),
    pawprint2Menu: assetUrl('media/common_images/pawprint2-menuicon.png'),
    pawprintPurpleLine: assetUrl('media/common_images/pawprint-purple.png'),
    pawprintPurpleMenu: assetUrl(
      'media/common_images/pawprint-purple-menuicon.png'
    ),
    rainbowLine: assetUrl('media/common_images/rainbow.png'),
    rainbowMenu: assetUrl('media/common_images/rainbow-menuicon.png'),
    ropeLine: assetUrl('media/common_images/rope.png'),
    ropeMenu: assetUrl('media/common_images/rope-menuicon.png'),
    smileyLine: assetUrl('media/common_images/smiley.png'),
    smileyMenu: assetUrl('media/common_images/smiley-menuicon.png'),
    smokeLine: assetUrl('media/common_images/smoke.png'),
    smokeMenu: assetUrl('media/common_images/smoke-menuicon.png'),
    smoke2Line: assetUrl('media/common_images/smoke2.png'),
    smoke2Menu: assetUrl('media/common_images/smoke2-menuicon.png'),
    spikyLine: assetUrl('media/common_images/spiky.png'),
    spikyMenu: assetUrl('media/common_images/spiky-menuicon.png'),
    squigglyLine: assetUrl('media/common_images/squiggly.png'),
    squigglyMenu: assetUrl('media/common_images/squiggly-menuicon.png'),
    swirlyLine: assetUrl('media/common_images/swirlyline.png'),
    swirlyMenu: assetUrl('media/common_images/swirlyline-menuicon.png'),
    swirly2Line: assetUrl('media/common_images/swirlyline2.png'),
    swirly2Menu: assetUrl('media/common_images/swirlyline2-menuicon.png'),
    tiretrackLine: assetUrl('media/common_images/tiretrack.png'),
    tiretrackMenu: assetUrl('media/common_images/tiretrack-menuicon.png'),
    tiretrack2Line: assetUrl('media/common_images/tiretrack2.png'),
    tiretrack2Menu: assetUrl('media/common_images/tiretrack2-menuicon.png'),
    waterLine: assetUrl('media/common_images/water.png'),
    waterMenu: assetUrl('media/common_images/water-menuicon.png'),
    water2Line: assetUrl('media/common_images/water2.png'),
    water2Menu: assetUrl('media/common_images/water2-menuicon.png')
  };

  var CONFIGS = {
    anna: {
      // slider speed gets divided by this value
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 36,
        numFrames: 10,
        visible: true
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        annaLine: skin.assetUrl('annaline.png'),
        annaLine_2x: skin.assetUrl('annaline_2x.png')
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.assetUrl('annaline-menuicon.png'), 'annaLine']
      ],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skin.assetUrl('blank.png')
    },

    elsa: {
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 18,
        numFrames: 20,
        visible: true
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        elsaLine: skin.assetUrl('elsaline.png'),
        elsaLine_2x: skin.assetUrl('elsaline_2x.png')
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.assetUrl('elsaline-menuicon.png'), 'elsaLine']
      ],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skin.assetUrl('blank.png')
    },

    artist: {
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.linePatterns.arrowMenu, 'arrowLine'],
        [skin.linePatterns.bambooMenu, 'bambooLine'],
        [skin.linePatterns.brickMenu, 'brickLine'],
        [skin.linePatterns.cactusMenu, 'cactusLine'],
        [skin.linePatterns.candyMenu, 'candyLine'],
        [skin.linePatterns.candycaneMenu, 'candycaneLine'],
        [skin.linePatterns.candycaneGreenMenu, 'candycaneGreenLine'],
        [skin.linePatterns.candycaneRedGreenMenu, 'candycaneRedGreenLine'],
        [skin.linePatterns.dashMenu, 'dashLine'],
        [skin.linePatterns.dashBlueMenu, 'dashBlueLine'],
        [skin.linePatterns.diamondMenu, 'diamondLine'],
        [skin.linePatterns.dotMenu, 'dotLine'],
        [skin.linePatterns.dotBlueMenu, 'dotBlueLine'],
        [skin.linePatterns.dotYellowMenu, 'dotYellowLine'],
        [skin.linePatterns.flowerPinkMenu, 'flowerPinkLine'],
        [skin.linePatterns.flowerPurpleMenu, 'flowerPurpleLine'],
        [skin.linePatterns.flowerRedMenu, 'flowerRedLine'],
        [skin.linePatterns.flowerYellowMenu, 'flowerYellowLine'],
        [skin.linePatterns.heartMenu, 'heartLine'],
        [skin.linePatterns.heartPinkMenu, 'heartPinkLine'],
        [skin.linePatterns.lightningMenu, 'lightningLine'],
        [skin.linePatterns.pawprintMenu, 'pawprintLine'],
        [skin.linePatterns.pawprint2Menu, 'pawprint2Line'],
        [skin.linePatterns.pawprintPurpleMenu, 'pawprintPurpleLine'],
        [skin.linePatterns.rainbowMenu, 'rainbowLine'],
        [skin.linePatterns.ropeMenu, 'ropeLine'],
        [skin.linePatterns.smileyMenu, 'smileyLine'],
        [skin.linePatterns.smokeMenu, 'smokeLine'],
        [skin.linePatterns.smoke2Menu, 'smoke2Line'],
        [skin.linePatterns.spikyMenu, 'spikyLine'],
        [skin.linePatterns.squigglyMenu, 'squigglyLine'],
        [skin.linePatterns.swirlyMenu, 'swirlyLine'],
        [skin.linePatterns.swirly2Menu, 'swirly2Line'],
        [skin.linePatterns.tiretrackMenu, 'tiretrackLine'],
        [skin.linePatterns.tiretrack2Menu, 'tiretrack2Line'],
        [skin.linePatterns.waterMenu, 'waterLine'],
        [skin.linePatterns.water2Menu, 'water2Line']
      ]
    }
  };

  /**
   * Generates a mapping of sticker names to the urls of their images.
   *
   * @return the mapping of names to urls
   */
  var stickers = function() {
    // Playlab characters
    var playlab = [
      'Alien',
      'Bat',
      'Bird',
      'Cat',
      'Caveboy',
      'Cavegirl',
      'Dinosaur',
      'Dog',
      'Dragon',
      'Ghost',
      'Knight',
      'Monster',
      'Ninja',
      'Octopus',
      'Penguin',
      'Pirate',
      'Princess',
      'Robot',
      'Soccerboy',
      'Soccergirl',
      'Spacebot',
      'Squirrel',
      'Tennisboy',
      'Tennisgirl',
      'Unicorn',
      'Witch',
      'Wizard',
      'Zombie'
    ];

    // Miscellaneous stickers
    var misc = [
      'Beaver',
      'Bunny',
      'Chicken',
      'Elephant',
      'Giraffe',
      'Goat',
      'Grasshopper',
      'Hippo',
      'Lion',
      'Llama',
      'Monkey',
      'Moose',
      'Mouse',
      'Owl',
      'Peacock',
      'Rocket',
      'Triceratops',
      'Turtle',
      'Zebra'
    ];

    var mapping = {};

    var i, name;
    for (i = 0; i < playlab.length; i++) {
      name = playlab[i];
      mapping[name] = assetUrl(
        'media/skins/studio/' + name.toLowerCase() + '_thumb.png'
      );
    }

    for (i = 0; i < misc.length; i++) {
      name = misc[i];
      mapping[name] = assetUrl(
        'media/common_images/stickers/' + name.toLowerCase() + '.png'
      );
    }

    return mapping;
  };

  skin.stickers = stickers();

  var config = CONFIGS[skin.id];

  // base skin properties here (can be overriden by CONFIG)
  skin.speedModifier = 1;
  skin.avatarSettings = {
    width: 70,
    height: 51,
    numHeadings: 180,
    numFrames: 1,
    visible: true
  };

  // Get properties from config
  for (var prop in config) {
    skin[prop] = config[prop];
  }

  // Declare available line style patterns. This array of arrays is eventually used
  // to populate the image dropdown in the Set Pattern block.

  // All skins have the default line style (solid coloured line)
  var lineStylePatternOptions = [[skin.linePatterns.patternDefault, 'DEFAULT']];

  // If the skin provided line patterns, add them to the pattern set
  if (config && config.lineStylePatternOptions) {
    lineStylePatternOptions = lineStylePatternOptions.concat(
      config.lineStylePatternOptions
    );
  }

  skin.lineStylePatternOptions = lineStylePatternOptions;

  return skin;
};
