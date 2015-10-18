var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'setBot', parent: api, category: '', params: ['"bot1"'], dropdown: { 0: [ '"random"', '"bot1"', '"bot2"' ] } },
  {func: 'setBotSpeed', parent: api, category: '', params: ['"fast"'], dropdown: { 0: [ '"random"', '"slow"', '"normal"', '"fast"' ] } },
  {func: 'setBackground', parent: api, category: '', params: ['"snow"'], dropdown: { 0: [ '"random"', '"forest"', '"snow"', '"ship"' ] } },
  {func: 'setMap', parent: api, category: '', params: ['"blank"'], dropdown: { 0: [ '"random"', '"blank"', '"circle"', '"horizontal"', '"grid"', '"blobs"'] } },
  {func: 'moveRight', parent: api, category: '', },
  {func: 'moveLeft', parent: api, category: '', },
  {func: 'moveUp', parent: api, category: '', },
  {func: 'moveDown', parent: api, category: '', },
  {func: 'playSound', parent: api, category: '', params: ['"character1sound1"'], 
    dropdown: { 0: [ 
      '"character1sound1"', '"character1sound2"', '"character1sound3"', '"character1sound4"',
      '"character2sound1"', '"character2sound2"', '"character2sound3"', '"character2sound4"',
      '"item1sound1"', '"item1sound2"', '"item1sound3"', '"item1sound4"',
      '"item3sound1"', '"item3sound2"', '"item3sound3"', '"item3sound4"',
      '"alert1"', '"alert2"', '"alert3"', '"alert4"',
      '"applause"' 
      ] } },
  
  {func: 'whenGetAllCharacters', block: 'function whenGetAllCharacters() {}', expansion: 'function whenGetAllCharacters() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMen', block: 'function whenGetAllMen() {}', expansion: 'function whenGetAllMen() {\n  __;\n}', category: '' },
  {func: 'whenGetAllPilots', block: 'function whenGetAllPilots() {}', expansion: 'function whenGetAllPilots() {\n  __;\n}', category: '' },
  {func: 'whenGetAllPigs', block: 'function whenGetAllPigs() {}', expansion: 'function whenGetAllPigs() {\n  __;\n}', category: '' },
  {func: 'whenGetAllBirds', block: 'function whenGetAllBirds() {}', expansion: 'function whenGetAllBirds() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMice', block: 'function whenGetAllMice() {}', expansion: 'function whenGetAllMice() {\n  __;\n}', category: '' },
  {func: 'whenGetAllRoos', block: 'function whenGetAllRoos() {}', expansion: 'function whenGetAllRoos() {\n  __;\n}', category: '' },
  {func: 'whenGetAllSpiders', block: 'function whenGetAllSpiders() {}', expansion: 'function whenGetAllSpiders() {\n  __;\n}', category: '' },
  {func: 'whenTouchGoal', block: 'function whenTouchGoal() {}', expansion: 'function whenTouchGoal() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllGoals', block: 'function whenTouchAllGoals() {}', expansion: 'function whenTouchAllGoals() {\n  __;\n}', category: '' },
  {func: 'whenScore1000', block: 'function whenScore1000() {}', expansion: 'function whenScore1000() {\n  __;\n}', category: '' },

  {func: 'endGame', parent: api, category: '', params: ['"win"'], dropdown: { 0: ['"win"', '"lose"' ] } },
  {func: 'addPoints', parent: api, category: '', params: ["250"] },
  {func: 'changeScore', parent: api, category: '', params: ["1"] },
  {func: 'addCharacter', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'setToChase', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'setToFlee', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'setToRoam', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'setToStop', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'moveFast', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'moveNormal', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'moveSlow', parent: api, category: '', params: ['"pig"'], dropdown: { 0: [ '"random"', '"man"', '"pilot"', '"pig"', '"bird"', '"mouse"', '"roo"', '"spider"' ] } },
  {func: 'whenLeft', block: 'function whenLeft() {}', expansion: 'function whenLeft() {\n  __;\n}', category: '' },
  {func: 'whenRight', block: 'function whenRight() {}', expansion: 'function whenRight() {\n  __;\n}', category: '' },
  {func: 'whenUp', block: 'function whenUp() {}', expansion: 'function whenUp() {\n  __;\n}', category: '' },
  {func: 'whenDown', block: 'function whenDown() {}', expansion: 'function whenDown() {\n  __;\n}', category: '' },
  {func: 'whenTouchObstacle', block: 'function whenTouchObstacle() {}', expansion: 'function whenTouchObstacle() {\n  __;\n}', category: '' },
  {func: 'whenTouchCharacter', block: 'function whenTouchCharacter() {}', expansion: 'function whenTouchCharacter() {\n  __;\n}', category: '' },
  {func: 'whenTouchMan', block: 'function whenTouchMan() {}', expansion: 'function whenTouchMan() {\n  __;\n}', category: '' },
  {func: 'whenTouchPilot', block: 'function whenTouchPilot() {}', expansion: 'function whenTouchPilot() {\n  __;\n}', category: '' },
  {func: 'whenTouchPig', block: 'function whenTouchPig() {}', expansion: 'function whenTouchPig() {\n  __;\n}', category: '' },
  {func: 'whenTouchBird', block: 'function whenTouchBird() {}', expansion: 'function whenTouchBird() {\n  __;\n}', category: '' },
  {func: 'whenTouchMouse', block: 'function whenTouchMouse() {}', expansion: 'function whenTouchMouse() {\n  __;\n}', category: '' },
  {func: 'whenTouchRoo', block: 'function whenTouchRoo() {}', expansion: 'function whenTouchRoo() {\n  __;\n}', category: '' },
  {func: 'whenTouchSpider', block: 'function whenTouchSpider() {}', expansion: 'function whenTouchSpider() {\n  __;\n}', category: '' },

  // Functions hidden from autocomplete - not used in hoc2015:
  {func: 'setSprite', parent: api, category: '', params: ['0', '"bot1"'], dropdown: { 1: [ '"random"', '"bot1"', '"bot2"' ] } },
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
