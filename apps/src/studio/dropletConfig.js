var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'setCharacter', parent: api, category: '', params: ['"character1"'], dropdown: { 0: [ '"character1"', '"character2"' ] } },
  {func: 'setCharacterSpeed', parent: api, category: '', params: ["8"], dropdown: { 0: [ "2", "3", "5", "8", "12" ] } },
  {func: 'setBackground', parent: api, category: '', params: ['"background3"'], dropdown: { 0: [ '"background1"', '"background2"', '"background3"' ] } },
  {func: 'setWalls', parent: api, category: '', params: ['"maze2"'], dropdown: { 0: [ '"border"', '"maze"', '"maze2"', '"default"', '"hidden"' ] } },
  {func: 'moveEast', parent: api, category: '', },
  {func: 'moveWest', parent: api, category: '', },
  {func: 'moveNorth', parent: api, category: '', },
  {func: 'moveSouth', parent: api, category: '', },
  {func: 'playSound', parent: api, category: '', params: ['"slap"'], dropdown: { 0: [ '"hit"', '"wood"', '"retro"', '"slap"', '"rubber"', '"crunch"', '"winpoint"', '"winpoint2"', '"losepoint"', '"losepoint2"', '"goal1"', '"goal2"' ] } },
  {func: 'changeScore', parent: api, category: '', params: ["1"] },
  {func: 'addItemsToScene', parent: api, category: '', params: ['"item_walk_item4"', "5"], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"' ] } },
  {func: 'setItemActivity', parent: api, category: '', params: ['"item_walk_item4"', '"chase"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"' ], 1: [ '"chase"', '"flee"', '"patrol"', '"none"' ] } },
  {func: 'whenLeft', block: 'function whenLeft() {}', expansion: 'function whenLeft() {\n  __;\n}', category: '' },
  {func: 'whenRight', block: 'function whenRight() {}', expansion: 'function whenRight() {\n  __;\n}', category: '' },
  {func: 'whenUp', block: 'function whenUp() {}', expansion: 'function whenUp() {\n  __;\n}', category: '' },
  {func: 'whenDown', block: 'function whenDown() {}', expansion: 'function whenDown() {\n  __;\n}', category: '' },
  {func: 'whenTouchItem', block: 'function whenTouchItem() {}', expansion: 'function whenTouchItem() {\n  __;\n}', category: '' },

  // Functions hidden from autocomplete - not used in hoc2015:
  {func: 'setSprite', parent: api, category: '', params: ['0', '"character1"'], dropdown: { 1: [ '"character1"', '"character2"' ] } },
  {func: 'setSpritePosition', parent: api, category: '', params: ["0", "7"], 'noAutocomplete': true },
  {func: 'setSpriteSpeed', parent: api, category: '', params: ["0", "8"], 'noAutocomplete': true },
  {func: 'setSpriteEmotion', parent: api, category: '', params: ["0", "1"], 'noAutocomplete': true },
  {func: 'throwProjectile', parent: api, category: '', params: ["0", "1", '"blue_fireball"'], 'noAutocomplete': true },
  {func: 'vanish', parent: api, category: '', params: ["0"], 'noAutocomplete': true },
  {func: 'move', parent: api, category: '', params: ["0", "1"], 'noAutocomplete': true },
  {func: 'showDebugInfo', parent: api, category: '', params: ["false"], 'noAutocomplete': true },
  {func: 'onEvent', parent: api, category: '', params: ["'when-left'", "function() {\n  \n}"], 'noAutocomplete': true },
];

module.exports.categories = {
  '': {
    'color': 'red',
    'blocks': []
  },
  'Play Lab': {
    'color': 'red',
    'blocks': []
  },
};
