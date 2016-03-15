var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  var CONFIGS = {
    anna: {
      // slider speed gets divided by this value
      speedModifier: 10,
      turtleNumFrames: 10,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      annaLine: skin.assetUrl('annaline.png'),
      annaLine_2x: skin.assetUrl('annaline_2x.png'),
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skin.assetUrl('annaline-menuicon.png'), 'annaLine']]
    },

    elsa: {
      speedModifier: 10,
      turtleNumFrames: 20,
      decorationAnimationNumFrames: 19,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      elsaLine: skin.assetUrl('elsaline.png'),
      elsaLine_2x: skin.assetUrl('elsaline_2x.png'),
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [[skin.assetUrl('elsaline-menuicon.png'), 'elsaLine']]
    },

    artist: {
      // Used to populate the Set Pattern block
      lineStylePatternOptions: [
          [skin.rainbowMenu, 'rainbowLine'],
          [skin.ropeMenu, 'ropeLine'],
          [skin.squigglyMenu, 'squigglyLine'],
          [skin.swirlyMenu, 'swirlyLine']
      ]
    }
  };

  var config = CONFIGS[skin.id];

  // base skin properties here (can be overriden by CONFIG)
  skin.speedModifier = 1;

  skin.stickerValues = [
    [skin.stickers.elephant, 'Elephant'],
    [skin.stickers.dragon, 'Dragon'],
    [skin.stickers.triceratops, 'Triceratops'],
    [skin.stickers.monkey, 'Monkey'],
    [skin.stickers.cat, 'Cat'],
    [skin.stickers.turtle, 'Turtle'],
    [skin.stickers.goat, 'Goat'],
    [skin.stickers.zebra, 'Zebra'],
    [skin.stickers.hippo, 'Hippo'],
    [skin.stickers.bunny, 'Bunny'],
    [skin.stickers.peacock, 'Peacock'],
    [skin.stickers.llama, 'Llama'],
    [skin.stickers.giraffe, 'Giraffe'],
    [skin.stickers.mouse, 'Mouse'],
    [skin.stickers.beaver, 'Beaver'],
    [skin.stickers.bat, 'Bat'],
    [skin.stickers.grasshopper, 'Grasshopper'],
    [skin.stickers.chicken, 'Chicken'],
    [skin.stickers.moose, 'Moose'],
    [skin.stickers.owl, 'Owl'],
    [skin.stickers.penguin, 'Penguin'],
    [skin.stickers.lion, 'Lion'],
    [skin.stickers.robot, 'Robot'],
    [skin.stickers.rocket, 'Rocket'],
  ];

  // Get properties from config
  var isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  for (var prop in config) {
    skin[prop] = config[prop];
  }

  // Declare available line style patterns. This array of arrays is eventually used
  // to populate the image dropdown in the Set Pattern block.

  // All skins have the default line style (solid coloured line)
  var lineStylePatternOptions =  [[skin.patternDefault, 'DEFAULT']];

  // If the skin provided line patterns, add them to the pattern set
  if (config && config.lineStylePatternOptions) {
    lineStylePatternOptions = lineStylePatternOptions.concat(config.lineStylePatternOptions);
  }

  skin.lineStylePatternOptions = lineStylePatternOptions;

  return skin;
};
