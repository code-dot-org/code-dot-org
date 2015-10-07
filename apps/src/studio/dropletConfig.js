var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'setBot', parent: api, category: '', params: ['"bot1"'], dropdown: { 0: [ '"bot1"', '"bot2"' ] } },
  {func: 'setBotSpeed', parent: api, category: '', params: ["8"], dropdown: { 0: [ "2", "3", "5", "8", "12" ] } },
  {func: 'setBackground', parent: api, category: '', params: ['"background3"'], dropdown: { 0: [ '"background1"', '"background2"', '"background3"' ] } },
  {func: 'setMap', parent: api, category: '', params: ['"blank"'], dropdown: { 0: [ '"blank"', '"circle"', '"circle2"', '"horizontal"', '"grid"', '"blobs"'] } },
  {func: 'moveRight', parent: api, category: '', },
  {func: 'moveLeft', parent: api, category: '', },
  {func: 'moveUp', parent: api, category: '', },
  {func: 'moveDown', parent: api, category: '', },
  {func: 'playSound', parent: api, category: '', params: ['"slap"'], dropdown: { 0: [ '"hit"', '"wood"', '"retro"', '"slap"', '"rubber"', '"crunch"', '"winpoint"', '"winpoint2"', '"losepoint"', '"losepoint2"', '"goal1"', '"goal2"' ] } },
  {func: 'changeScore', parent: api, category: '', params: ["1"] },
  {func: 'addCharacter', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'setToChase', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'setToFlee', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'setToRoam', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'setToStop', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'moveFast', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'moveNormal', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'moveSlow', parent: api, category: '', params: ['"item_walk_item4"'], dropdown: { 0: [ '"item_walk_item1"', '"item_walk_item2"', '"item_walk_item3"', '"item_walk_item4"', '"item_walk_item5"', '"item_walk_item6"' ] } },
  {func: 'whenLeft', block: 'function whenLeft() {}', expansion: 'function whenLeft() {\n  __;\n}', category: '' },
  {func: 'whenRight', block: 'function whenRight() {}', expansion: 'function whenRight() {\n  __;\n}', category: '' },
  {func: 'whenUp', block: 'function whenUp() {}', expansion: 'function whenUp() {\n  __;\n}', category: '' },
  {func: 'whenDown', block: 'function whenDown() {}', expansion: 'function whenDown() {\n  __;\n}', category: '' },
  {func: 'whenTouchObstacle', block: 'function whenTouchObstacle() {}', expansion: 'function whenTouchObstacle() {\n  __;\n}', category: '' },
  {func: 'whenTouchCharacter', block: 'function whenTouchCharacter() {}', expansion: 'function whenTouchCharacter() {\n  __;\n}', category: '' },
  {func: 'whenTouchWalkItem1', block: 'function whenTouchWalkItem1() {}', expansion: 'function whenTouchWalkItem1() {\n  __;\n}', category: '' },
  {func: 'whenTouchWalkItem2', block: 'function whenTouchWalkItem2() {}', expansion: 'function whenTouchWalkItem2() {\n  __;\n}', category: '' },
  {func: 'whenTouchWalkItem3', block: 'function whenTouchWalkItem3() {}', expansion: 'function whenTouchWalkItem3() {\n  __;\n}', category: '' },
  {func: 'whenTouchWalkItem4', block: 'function whenTouchWalkItem4() {}', expansion: 'function whenTouchWalkItem4() {\n  __;\n}', category: '' },

  // Functions hidden from autocomplete - not used in hoc2015:
  {func: 'setSprite', parent: api, category: '', params: ['0', '"bot1"'], dropdown: { 1: [ '"bot1"', '"bot2"' ] } },
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
  'Commands': {
    'color': 'red',
    'blocks': []
  },
  'Events': {
    'color': 'green',
    'blocks': []
  },
};

module.exports.autocompleteFunctionsWithParens = true;

module.exports.showParamDropdowns = true;
