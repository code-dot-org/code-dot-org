var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [
  {func: 'setDroid', parent: api, category: '', params: ['"r2-d2"'], dropdown: { 0: [ '"random"', '"r2-d2"', '"c-3po"' ] } },
  {func: 'setDroidSpeed', parent: api, category: '', params: ['"fast"'], dropdown: { 0: [ '"random"', '"slow"', '"normal"', '"fast"' ] } },
  {func: 'setBackground', parent: api, category: '', params: ['"snow"'], dropdown: { 0: [ '"random"', '"forest"', '"snow"', '"ship"' ] } },
  {func: 'setMap', parent: api, category: '', params: ['"blank"'], dropdown: { 0: [ '"random"', '"blank"', '"circle"', '"horizontal"', '"grid"', '"blobs"'] } },
  {func: 'moveRight', parent: api, category: '', },
  {func: 'moveLeft', parent: api, category: '', },
  {func: 'moveUp', parent: api, category: '', },
  {func: 'moveDown', parent: api, category: '', },
  {func: 'goRight', parent: api, category: '', },
  {func: 'goLeft', parent: api, category: '', },
  {func: 'goUp', parent: api, category: '', },
  {func: 'goDown', parent: api, category: '', },
  {func: 'playSound', parent: api, category: '', params: ['"r2-d2sound1"'],
    dropdown: { 0: [
      '"random"',
      '"r2-d2sound1"', '"r2-d2sound2"', '"r2-d2sound3"', '"r2-d2sound4"',
      '"r2-d2sound5"', '"r2-d2sound6"', '"r2-d2sound7"', '"r2-d2sound8"',
      '"r2-d2sound9"',
      '"c-3posound1"', '"c-3posound2"', '"c-3posound3"', '"c-3posound4"',
      '"pufferpigsound1"', '"pufferpigsound2"', '"pufferpigsound3"', '"pufferpigsound4"',
      '"tauntaunsound1"', '"tauntaunsound2"', '"tauntaunsound3"', '"tauntaunsound4"',
      '"mynocksound1"', '"mynocksound2"', '"mynocksound3"',
      '"probotsound1"', '"probotsound2"', '"probotsound3"',
      '"mousedroidsound1"', '"mousedroidsound2"', '"mousedroidsound3"',
      '"alert1"', '"alert2"', '"alert3"', '"alert4"',
      '"applause"'
      ] } },

  {func: 'endGame', parent: api, category: '', params: ['"win"'], dropdown: { 0: ['"win"', '"lose"' ] } },
  {func: 'addPoints', parent: api, category: '', params: ["100"] },
  {func: 'removePoints', parent: api, category: '', params: ["100"] },
  {func: 'changeScore', parent: api, category: '', params: ["1"] },
  {func: 'addCharacter', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'setToChase', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'setToFlee', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'setToRoam', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'setToStop', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'moveFast', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'moveNormal', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },
  {func: 'moveSlow', parent: api, category: '', params: ['"pufferpig"'], dropdown: { 0: [ '"random"', '"stormtrooper"', '"rebelpilot"', '"pufferpig"', '"mynock"', '"mousedroid"', '"tauntaun"', '"probot"' ] } },

  {func: 'whenTouchGoal', block: 'function whenTouchGoal() {}', expansion: 'function whenTouchGoal() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllGoals', block: 'function whenTouchAllGoals() {}', expansion: 'function whenTouchAllGoals() {\n  __;\n}', category: '' },
  {func: 'whenScore1000', block: 'function whenScore1000() {}', expansion: 'function whenScore1000() {\n  __;\n}', category: '' },

  {func: 'whenLeft', block: 'function whenLeft() {}', expansion: 'function whenLeft() {\n  __;\n}', category: '' },
  {func: 'whenRight', block: 'function whenRight() {}', expansion: 'function whenRight() {\n  __;\n}', category: '' },
  {func: 'whenUp', block: 'function whenUp() {}', expansion: 'function whenUp() {\n  __;\n}', category: '' },
  {func: 'whenDown', block: 'function whenDown() {}', expansion: 'function whenDown() {\n  __;\n}', category: '' },
  {func: 'whenTouchObstacle', block: 'function whenTouchObstacle() {}', expansion: 'function whenTouchObstacle() {\n  __;\n}', category: '' },

  {func: 'whenGetCharacter', block: 'function whenGetCharacter() {}', expansion: 'function whenGetCharacter() {\n  __;\n}', category: '' },
  {func: 'whenTouchCharacter', block: 'function whenTouchCharacter() {}', expansion: 'function whenTouchCharacter() {\n  __;\n}', category: '' },

  {func: 'whenGetStormtrooper', block: 'function whenGetStormtrooper() {}', expansion: 'function whenGetStormtrooper() {\n  __;\n}', category: '' },
  {func: 'whenGetRebelPilot', block: 'function whenGetRebelPilot() {}', expansion: 'function whenGetRebelPilot() {\n  __;\n}', category: '' },
  {func: 'whenGetPufferPig', block: 'function whenGetPufferPig() {}', expansion: 'function whenGetPufferPig() {\n  __;\n}', category: '' },
  {func: 'whenGetMynock', block: 'function whenGetMynock() {}', expansion: 'function whenGetMynock() {\n  __;\n}', category: '' },
  {func: 'whenGetMouseDroid', block: 'function whenGetMouseDroid() {}', expansion: 'function whenGetMouseDroid() {\n  __;\n}', category: '' },
  {func: 'whenGetTauntaun', block: 'function whenGetTauntaun() {}', expansion: 'function whenGetTauntaun() {\n  __;\n}', category: '' },
  {func: 'whenGetProbot', block: 'function whenGetProbot() {}', expansion: 'function whenGetProbot() {\n  __;\n}', category: '' },

  {func: 'whenTouchStormtrooper', block: 'function whenTouchStormtrooper() {}', expansion: 'function whenTouchStormtrooper() {\n  __;\n}', category: '' },
  {func: 'whenTouchRebelPilot', block: 'function whenTouchRebelPilot() {}', expansion: 'function whenTouchRebelPilot() {\n  __;\n}', category: '' },
  {func: 'whenTouchPufferPig', block: 'function whenTouchPufferPig() {}', expansion: 'function whenTouchPufferPig() {\n  __;\n}', category: '' },
  {func: 'whenTouchMynock', block: 'function whenTouchMynock() {}', expansion: 'function whenTouchMynock() {\n  __;\n}', category: '' },
  {func: 'whenTouchMouseDroid', block: 'function whenTouchMouseDroid() {}', expansion: 'function whenTouchMouseDroid() {\n  __;\n}', category: '' },
  {func: 'whenTouchTauntaun', block: 'function whenTouchTauntaun() {}', expansion: 'function whenTouchTauntaun() {\n  __;\n}', category: '' },
  {func: 'whenTouchProbot', block: 'function whenTouchProbot() {}', expansion: 'function whenTouchProbot() {\n  __;\n}', category: '' },

  {func: 'whenTouchAllCharacters', block: 'function whenTouchAllCharacters() {}', expansion: 'function whenTouchAllCharacters() {\n  __;\n}', category: '' },
  {func: 'whenGetAllCharacters', block: 'function whenGetAllCharacters() {}', expansion: 'function whenGetAllCharacters() {\n  __;\n}', category: '' },

  {func: 'whenGetAllStormtroopers', block: 'function whenGetAllStormtroopers() {}', expansion: 'function whenGetAllStormtroopers() {\n  __;\n}', category: '' },
  {func: 'whenGetAllRebelPilots', block: 'function whenGetAllRebelPilots() {}', expansion: 'function whenGetAllRebelPilots() {\n  __;\n}', category: '' },
  {func: 'whenGetAllPufferPigs', block: 'function whenGetAllPufferPigs() {}', expansion: 'function whenGetAllPufferPigs() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMynocks', block: 'function whenGetAllMynocks() {}', expansion: 'function whenGetAllMynocks() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMouseDroids', block: 'function whenGetAllMouseDroids() {}', expansion: 'function whenGetAllMouseDroids() {\n  __;\n}', category: '' },
  {func: 'whenGetAllTauntauns', block: 'function whenGetAllTauntauns() {}', expansion: 'function whenGetAllTauntauns() {\n  __;\n}', category: '' },
  {func: 'whenGetAllProbots', block: 'function whenGetAllProbots() {}', expansion: 'function whenGetAllProbots() {\n  __;\n}', category: '' },

  {func: 'whenTouchAllStormtroopers', block: 'function whenTouchAllStormtroopers() {}', expansion: 'function whenTouchAllStormtroopers() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllRebelPilots', block: 'function whenTouchAllRebelPilots() {}', expansion: 'function whenTouchAllRebelPilots() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllPufferPigs', block: 'function whenTouchAllPufferPigs() {}', expansion: 'function whenTouchAllPufferPigs() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllMynocks', block: 'function whenTouchAllMynocks() {}', expansion: 'function whenTouchAllMynocks() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllMouseDroids', block: 'function whenTouchAllMouseDroids() {}', expansion: 'function whenTouchAllMouseDroids() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllTauntauns', block: 'function whenTouchAllTauntauns() {}', expansion: 'function whenTouchAllTauntauns() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllProbots', block: 'function whenTouchAllProbots() {}', expansion: 'function whenTouchAllProbots() {\n  __;\n}', category: '' },

  // Functions hidden from autocomplete - not used in hoc2015:
  {func: 'setSprite', parent: api, category: '', params: ['0', '"r2-d2"'], dropdown: { 1: [ '"random"', '"r2-d2"', '"c-3po"' ] } },
  {func: 'setSpritePosition', parent: api, category: '', params: ["0", "7"], noAutocomplete: true },
  {func: 'setSpriteSpeed', parent: api, category: '', params: ["0", "8"], noAutocomplete: true },
  {func: 'setSpriteEmotion', parent: api, category: '', params: ["0", "1"], noAutocomplete: true },
  {func: 'throwProjectile', parent: api, category: '', params: ["0", "1", '"blue_fireball"'], noAutocomplete: true },
  {func: 'vanish', parent: api, category: '', params: ["0"], noAutocomplete: true },
  {func: 'move', parent: api, category: '', params: ["0", "1"], noAutocomplete: true },
  {func: 'showDebugInfo', parent: api, category: '', params: ["false"], noAutocomplete: true },
  {func: 'onEvent', parent: api, category: '', params: ["'when-left'", "function() {\n  \n}"], noAutocomplete: true },
];

module.exports.categories = {
  '': {
    color: 'red',
    blocks: []
  },
  'Play Lab': {
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
