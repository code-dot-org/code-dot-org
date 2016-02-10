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
      lineStylePatternOptions: [[skin.annaLine, 'annaLine']]
    },

    elsa: {
      speedModifier: 10,
      turtleNumFrames: 20,
      decorationAnimationNumFrames: 19,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      elsaLine: skin.assetUrl('elsaline.png'),
      elsaLine_2x: skin.assetUrl('elsaline_2x.png'),
      lineStylePatternOptions: [[skin.elsaLine, 'elsaLine']]
    },

    artist: {
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

  // stamps aren't actually used on production anywhere right now. if we were
  // to want to use them, define the mapping from image to name here.
  skin.stampValues = [
    [skin.avatar, 'DEFAULT']
  ];

  // Get properties from config
  var isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  for (var prop in config) {
    skin[prop] = config[prop];
  }

  // Declare available line style patterns. This array of arrays is eventually used
  // to populate the image dropdown in the Set Pattern block.
  var defaultLineStyleOption = [[skin.patternDefault, 'DEFAULT']];
  skin.lineStylePatternOptions = defaultLineStyleOption.concat(config.lineStylePatternOptions);

  return skin;
};
