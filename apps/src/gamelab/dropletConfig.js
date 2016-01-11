var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'foo', parent: api, category: '' },
];

module.exports.categories = {
  '': {
    color: 'red',
    blocks: []
  },
  'Game Lab': {
    color: 'red',
    blocks: []
  },
  Commands: {
    color: 'red',
    blocks: []
  },
  Events: {
    color: 'green',
    blocks: []
  },
};

module.exports.autocompleteFunctionsWithParens = true;
module.exports.showParamDropdowns = true;
