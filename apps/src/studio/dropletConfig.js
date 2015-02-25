var msg = require('../../locale/current/studio');

module.exports.blocks = [
  {'func': 'setSprite', 'title': msg.setSpriteTooltip(), 'category': 'Play Lab', 'params': ["0", "'cat'"] },
  {'func': 'setBackground', 'title': msg.setBackgroundTooltip(), 'category': 'Play Lab', 'params': ["'night'"] },
  {'func': 'move', 'title': msg.moveTooltip(), 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'playSound', 'title': msg.playSoundTooltip(), 'category': 'Play Lab', 'params': ["'slap'"] },
  {'func': 'changeScore', 'title': msg.changeScoreTooltip(), 'category': 'Play Lab', 'params': ["1"] },
  {'func': 'setSpritePosition', 'title': msg.setSpritePositionTooltip(), 'category': 'Play Lab', 'params': ["0", "7"] },
  {'func': 'setSpriteSpeed', 'title': msg.setSpriteSpeedTooltip(), 'category': 'Play Lab', 'params': ["0", "8"] },
  {'func': 'setSpriteEmotion', 'title': msg.setSpriteEmotionTooltip(), 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'throwProjectile', 'title': msg.throwTooltip(), 'category': 'Play Lab', 'params': ["0", "1", "'blue_fireball'"] },
  {'func': 'vanish', 'title': msg.vanishTooltip(), 'category': 'Play Lab', 'params': ["0"] },
  {'func': 'onEvent', 'title': msg.onEventTooltip(), 'category': 'Play Lab', 'params': ["'when-left'", "function() {\n  \n}"] },
];

module.exports.categories = {
  'Play Lab': {
    'color': 'red',
    'blocks': []
  },
};
