var msg = require('./locale');

module.exports.blocks = [
  {'func': 'moveForward', 'category': 'Movement'},
  {'func': 'turnLeft', 'category': 'Movement'},
  {'func': 'turnRight', 'category': 'Movement'},
];

module.exports.categories = {
  'Movement': {
    'color': 'red',
    'blocks': []
  },
};
