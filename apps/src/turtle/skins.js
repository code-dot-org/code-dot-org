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
      annaLine_2x: skin.assetUrl('annaline_2x.png')
    },

    elsa: {
      speedModifier: 10,
      turtleNumFrames: 20,
      decorationAnimationNumFrames: 19,
      smoothAnimate: true,
      consolidateTurnAndMove: true,
      elsaLine: skin.assetUrl('elsaline.png'),
      elsaLine_2x: skin.assetUrl('elsaline_2x.png')
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

  // Start by always including the default pattern
  skin.lineStylePatternOptions = [[skin.patternDefault, 'DEFAULT']];

  // Then selectively include other line patterns depending on the skin.
  // Anna and Elsa probably shouldn't draw other line patterns other than their own.
  // When they try to draw other patterns, it looks very distorted.
  // This is likely because there was lot hand-tweaking done previously to make those
  // line patterns look good, and we don't want to touch that.

  // With Anna and Elsa, we're only including their own patterns in the dropdown.
  if (skin.id == "anna") {
    skin.lineStylePatternOptions.push([skin.annaLine, 'annaLine']);
  } else if (skin.id == "elsa") {
    skin.lineStylePatternOptions.push([skin.elsaLine, 'elsaLine']);
  } else {
    skin.lineStylePatternOptions.push([skin.rainbowMenu, 'rainbowLine']);
    skin.lineStylePatternOptions.push([skin.ropeMenu, 'ropeLine']);
    skin.lineStylePatternOptions.push([skin.squigglyMenu, 'squigglyLine']);
    skin.lineStylePatternOptions.push([skin.swirlyMenu, 'swirlyLine']);
  }

  return skin;
};
