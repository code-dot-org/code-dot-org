var msg = require('../../locale/current/turtle');

module.exports.blocks = [
  {'func': 'moveForward', 'title': msg.moveForwardTooltip(), 'category': 'Artist', 'params': ["100"], 'idArgLast': true },
  {'func': 'turnRight', 'title': msg.turnTooltip(), 'category': 'Artist', 'params': ["90"], 'idArgLast': true },
  {'func': 'penColour', 'title': msg.colourTooltip(), 'category': 'Artist', 'params': ["'#ff0000'"], 'idArgLast': true },
  {'func': 'penWidth', 'title': msg.widthTooltip(), 'category': 'Artist', 'params': ["1"], 'idArgLast': true },
];

module.exports.categories = {
  'Artist': {
    'color': 'red',
    'blocks': []
  },
};
