var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {'func': 'setSprite', 'parent': api, 'category': 'Play Lab', 'params': ["0", "'cat'"] },
  {'func': 'setBackground', 'parent': api, 'category': 'Play Lab', 'params': ["'night'"] },
  {'func': 'move', 'parent': api, 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'moveEast', 'parent': api, 'category': 'Play Lab', },
  {'func': 'moveWest', 'parent': api, 'category': 'Play Lab', },
  {'func': 'moveNorth', 'parent': api, 'category': 'Play Lab', },
  {'func': 'moveSouth', 'parent': api, 'category': 'Play Lab', },
  {'func': 'playSound', 'parent': api, 'category': 'Play Lab', 'params': ["'slap'"] },
  {'func': 'changeScore', 'parent': api, 'category': 'Play Lab', 'params': ["1"] },
  {'func': 'setSpritePosition', 'parent': api, 'category': 'Play Lab', 'params': ["0", "7"] },
  {'func': 'setSpriteSpeed', 'parent': api, 'category': 'Play Lab', 'params': ["0", "8"] },
  {'func': 'setSpriteEmotion', 'parent': api, 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'throwProjectile', 'parent': api, 'category': 'Play Lab', 'params': ["0", "1", "'blue_fireball'"] },
  {'func': 'vanish', 'parent': api, 'category': 'Play Lab', 'params': ["0"] },
  {'func': 'addItemsToScene', 'parent': api, 'category': 'Play Lab', 'params': ["'blue_fireball'", "5"] },
  {'func': 'onEvent', 'parent': api, 'category': 'Play Lab', 'params': ["'when-left'", "function() {\n  \n}"] },
];

module.exports.categories = {
  'Play Lab': {
    'color': 'red',
    'blocks': []
  },
};
