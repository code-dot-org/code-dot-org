module.exports.blocks = [
  {'func': 'moveForward', 'category': 'Artist', 'params': ["100"], 'idArgLast': true },
  {'func': 'turnRight', 'category': 'Artist', 'params': ["90"], 'idArgLast': true },
  {'func': 'penColour', 'category': 'Artist', 'params': ["'#ff0000'"], 'idArgLast': true },
  {'func': 'penWidth', 'category': 'Artist', 'params': ["1"], 'idArgLast': true },
];

module.exports.categories = {
  'Artist': {
    'color': 'red',
    'blocks': []
  },
};
