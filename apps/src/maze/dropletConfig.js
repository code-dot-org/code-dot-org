var msg = require('../../locale/current/maze');

module.exports.blocks = [
  {'func': 'moveForward', 'title': msg.moveForwardTooltip(), 'category': 'Movement' },
  {'func': 'turnLeft', 'title': msg.turnTooltip(), 'category': 'Movement' },
  {'func': 'turnRight', 'title': msg.turnTooltip(), 'category': 'Movement' },
];

module.exports.categories = {
  'Movement': {
    'color': 'red',
    'blocks': []
  },
};
