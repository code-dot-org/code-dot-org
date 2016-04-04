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

  /**
   * Generates a mapping of sticker names to the urls of their images.
   *
   * @return the mapping of names to urls
   */
  var stickers = function() {

    // Playlab characters
    var playlab = ['Alien'   , 'Bat'     , 'Bird'     , 'Cat'       , 'Caveboy'   ,
                   'Cavegirl', 'Dinosaur', 'Dog'      , 'Dragon'    , 'Ghost'     ,
                   'Knight'  , 'Monster' , 'Ninja'    , 'Octopus'   , 'Penguin'   ,
                   'Pirate'  , 'Princess', 'Robot'    , 'Soccerboy' , 'Soccergirl',
                   'Spacebot', 'Squirrel', 'Tennisboy', 'Tennisgirl', 'Unicorn'   ,
                   'Witch'   , 'Wizard'  , 'Zombie'];

    // Miscellaneous stickers
    var misc = ['Beaver', 'Bunny'      , 'Chicken', 'Elephant', 'Giraffe',
                'Goat'  , 'Grasshopper', 'Hippo'  , 'Lion'    , 'Llama'  ,
                'Monkey', 'Moose'      , 'Mouse'  , 'Owl'     , 'Peacock',
                'Rocket', 'Triceratops', 'Turtle' , 'Zebra'];

    var mapping = {};

    var i, name;
    for (i = 0; i < playlab.length; i++) {
      name = playlab[i];
      mapping[name] =  assetUrl('media/skins/studio/' + name.toLowerCase() + '_thumb.png');
    }

    for (i = 0; i < misc.length; i++) {
      name = misc[i];
      mapping[name] = assetUrl('media/common_images/stickers/' + name.toLowerCase() + '.png');
    }

    return mapping;
  };

  skin.stickers = stickers();

  var config = CONFIGS[skin.id];

  // base skin properties here (can be overriden by CONFIG)
  skin.speedModifier = 1;

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
