const skinBase = require('../skins');

const linePatterns = require('./linePatterns');

exports.load = function (assetUrl, id) {
  const skin = skinBase.load(assetUrl, id);
  skin.linePatterns = linePatterns.load(assetUrl);

  const CONFIGS = {
    anna: {
      // slider speed gets divided by this value
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 36,
        numFrames: 10,
        visible: true,
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        patternDefault: assetUrl(
          'media/common_images/defaultline-menuicon.png'
        ),
        annaLine: skin.assetUrl('annaline.png'),
        annaLine_2x: skin.assetUrl('annaline_2x.png'),
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.assetUrl('annaline-menuicon.png'), 'annaLine'],
      ],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skin.assetUrl('blank.png'),
    },

    elsa: {
      speedModifier: 10,
      avatarSettings: {
        width: 73,
        height: 100,
        numHeadings: 18,
        numFrames: 20,
        visible: true,
      },
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      linePatterns: {
        patternDefault: assetUrl(
          'media/common_images/defaultline-menuicon.png'
        ),
        elsaLine: skin.assetUrl('elsaline.png'),
        elsaLine_2x: skin.assetUrl('elsaline_2x.png'),
      },
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.assetUrl('elsaline-menuicon.png'), 'elsaLine'],
      ],
      artistOptions: ['anna', 'elsa'],
      avatarAllowedScripts: ['frozen'],
      blankAvatar: skin.assetUrl('blank.png'),
    },

    artist: {
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
        [skin.linePatterns.brickMenu, 'brickLine'],
        [skin.linePatterns.candycaneMenu, 'candycaneLine'],
        [skin.linePatterns.dashMenu, 'dashLine'],
        [skin.linePatterns.diamondMenu, 'diamondLine'],
        [skin.linePatterns.dotMenu, 'dotLine'],
        [skin.linePatterns.flowerPinkMenu, 'flowerPinkLine'],
        [skin.linePatterns.flowerPurpleMenu, 'flowerPurpleLine'],
        [skin.linePatterns.flowerYellowMenu, 'flowerYellowLine'],
        [skin.linePatterns.heartPinkMenu, 'heartPinkLine'],
        [skin.linePatterns.lightningMenu, 'lightningLine'],
        [skin.linePatterns.pawprintMenu, 'pawprintLine'],
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
        [skin.linePatterns.traintrackMenu, 'traintrackLine'],
        [skin.linePatterns.waterMenu, 'waterLine'],
      ],
    },
  };

  /**
   * Generates a mapping of sticker names to the urls of their images.
   *
   * @return the mapping of names to urls
   */
  const stickers = function () {
    // Playlab characters
    const playlab = [
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
      'Zombie',
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
      'Zebra',
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
  var rhombus60degree = [
    'smallRhombusMaroon',
    'smallRhombusRed',
    'smallRhombusOrange',
    'smallRhombusYellow',
    'smallRhombusGreen',
    'smallRhombusCyan',
    'smallRhombusLightBlue',
    'smallRhombusBlue',
    'smallRhombusPurple',
    'smallRhombusMagenta',
  ];
  var rhombus45degree = [
    'smallRhombusMaroon45',
    'smallRhombusRed45',
    'smallRhombusOrange45',
    'smallRhombusYellow45',
    'smallRhombusGreen45',
    'smallRhombusDarkGreen45',
    'smallRhombusLightGreen45',
    'smallRhombusTeal45',
    'smallRhombusCyan45',
    'smallRhombusLightBlue45',
    'smallRhombusBlue45',
    'smallRhombusPurple45',
    'smallRhombusLightPurple45',
    'smallRhombusMagenta45',
    'smallRhombusLightPink45',
    'smallRhombusGray45',
  ];
  var rhombus30degree = [
    'smallRhombusMaroon30',
    'smallRhombusRed30',
    'smallRhombusOrange30',
    'smallRhombusYellow30',
    'smallRhombusGreen30',
    'smallRhombusCyan30',
    'smallRhombusLightBlue30',
    'smallRhombusBlue30',
    'smallRhombusPurple30',
    'smallRhombusMagenta30',
  ];
  var patternBlocks = [
    'hexagonYellow',
    'triangleGreen',
    'squareOrange',
    'trapezoidRed',
  ];

  var allShapes = [
    ...rhombus60degree,
    ...rhombus45degree,
    ...rhombus30degree,
    ...patternBlocks,
  ];

  /**
   * Generates a mapping of geometry sticker names to the urls of their images.
   *
   * @return the mapping of names to urls
   */
  var shapes = function (imageNames) {
    // Pattern Blocks

    var mapping = {};

    imageNames.forEach(name => {
      mapping[name] = assetUrl('media/common_images/shapes/' + name + '.png');
    });
    return mapping;
  };

  skin.stickers = stickers();
  skin.shapes = shapes(allShapes);
  skin.rhombus45degree = shapes(rhombus45degree);

  var config = CONFIGS[skin.id];

  // base skin properties here (can be overriden by CONFIG)
  skin.speedModifier = 1;
  skin.avatarSettings = {
    width: 70,
    height: 51,
    numHeadings: 180,
    numFrames: 1,
    visible: true,
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
