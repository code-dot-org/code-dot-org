var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'moveForward', parent: api, category: 'Artist', params: ["100"] },
  {func: 'turnRight', parent: api, category: 'Artist', params: ["90"] },
  {func: 'penColour', parent: api, category: 'Artist', params: ["'#ff0000'"] },
  {func: 'penWidth', parent: api, category: 'Artist', params: ["1"] },
];

module.exports.categories = {
  Artist: {
    color: 'red',
    blocks: []
  },
};
