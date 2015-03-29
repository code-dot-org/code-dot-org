var msg = require('../../locale/current/studio');

module.exports.blocks = [
  {'func': 'setSprite', 'category': 'Play Lab', 'params': ["0", "'cat'"] },
  {'func': 'setBackground', 'category': 'Play Lab', 'params': ["'night'"] },
  {'func': 'move', 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'playSound', 'category': 'Play Lab', 'params': ["'slap'"] },
  {'func': 'changeScore', 'category': 'Play Lab', 'params': ["1"] },
  {'func': 'setSpritePosition', 'category': 'Play Lab', 'params': ["0", "7"] },
  {'func': 'setSpriteSpeed', 'category': 'Play Lab', 'params': ["0", "8"] },
  {'func': 'setSpriteEmotion', 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'throwProjectile', 'category': 'Play Lab', 'params': ["0", "1", "'blue_fireball'"] },
  {'func': 'vanish', 'category': 'Play Lab', 'params': ["0"] },
  {'func': 'onEvent', 'category': 'Play Lab', 'params': ["'when-left'", "function() {\n  \n}"] },
];

module.exports.categories = {
  'Play Lab': {
    'color': 'red',
    'blocks': []
  },
};
