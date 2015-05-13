var api = require('./api');

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_BLUE = '#19C3E1';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';

module.exports.blocks = [
  {'func': 'onEvent', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"click"', "function(event) {\n  \n}"], 'dropdown': { 1: [ '"click"', '"change"', '"keyup"', '"keydown"', '"keypress"', '"mousemove"', '"mousedown"', '"mouseup"', '"mouseover"', '"mouseout"', '"input"' ] } },
  {'func': 'button', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"text"'] },
  {'func': 'textInput', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"text"'] },
  {'func': 'textLabel', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"text"', '"forId"'] },
  {'func': 'dropdown', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"option1"', '"etc"'] },
  {'func': 'getText', 'parent': api, 'category': 'UI controls', 'params': ['"id"'], 'type': 'value' },
  {'func': 'setText', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"text"'] },
  {'func': 'checkbox', 'parent': api, 'category': 'UI controls', 'params': ['"id"', "false"], 'dropdown': { 1: [ "true", "false" ] } },
  {'func': 'radioButton', 'parent': api, 'category': 'UI controls', 'params': ['"id"', "false", '"group"'], 'dropdown': { 1: [ "true", "false" ] } },
  {'func': 'getChecked', 'parent': api, 'category': 'UI controls', 'params': ['"id"'], 'type': 'value' },
  {'func': 'setChecked', 'parent': api, 'category': 'UI controls', 'params': ['"id"', "true"], 'dropdown': { 1: [ "true", "false" ] } },
  {'func': 'image', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"http://code.org/images/logo.png"'] },
  {'func': 'getImageURL', 'parent': api, 'category': 'UI controls', 'params': ['"id"'], 'type': 'value' },
  {'func': 'setImageURL', 'parent': api, 'category': 'UI controls', 'params': ['"id"', '"http://code.org/images/logo.png"'] },
  {'func': 'playSound', 'parent': api, 'category': 'UI controls', 'params': ['"http://soundbible.com/mp3/neck_snap-Vladimir-719669812.mp3"'] },
  {'func': 'showElement', 'parent': api, 'category': 'UI controls', 'params': ['"id"'] },
  {'func': 'hideElement', 'parent': api, 'category': 'UI controls', 'params': ['"id"'] },
  {'func': 'deleteElement', 'parent': api, 'category': 'UI controls', 'params': ['"id"'] },
  {'func': 'setPosition', 'parent': api, 'category': 'UI controls', 'params': ['"id"', "0", "0", "100", "100"] },
  {'func': 'write', 'parent': api, 'category': 'UI controls', 'params': ['"html"'] },
  {'func': 'getXPosition', 'parent': api, 'category': 'UI controls', 'params': ['"id"'], 'type': 'value' },
  {'func': 'getYPosition', 'parent': api, 'category': 'UI controls', 'params': ['"id"'], 'type': 'value' },

  {'func': 'createCanvas', 'parent': api, 'category': 'Canvas', 'params': ['"id"', "320", "480"] },
  {'func': 'setActiveCanvas', 'parent': api, 'category': 'Canvas', 'params': ['"id"'] },
  {'func': 'line', 'parent': api, 'category': 'Canvas', 'params': ["0", "0", "160", "240"] },
  {'func': 'circle', 'parent': api, 'category': 'Canvas', 'params': ["160", "240", "100"] },
  {'func': 'rect', 'parent': api, 'category': 'Canvas', 'params': ["80", "120", "160", "240"] },
  {'func': 'setStrokeWidth', 'parent': api, 'category': 'Canvas', 'params': ["3"] },
  {'func': 'setStrokeColor', 'parent': api, 'category': 'Canvas', 'params': ['"red"'], 'dropdown': { 0: [ '"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"' ] } },
  {'func': 'setFillColor', 'parent': api, 'category': 'Canvas', 'params': ['"yellow"'], 'dropdown': { 0: [ '"yellow"', '"rgb(255,255,0)"', '"rgba(255,255,0,0.5)"', '"#FFFF00"' ] } },
  {'func': 'drawImage', 'parent': api, 'category': 'Canvas', 'params': ['"imageId"', "0", "0"] },
  {'func': 'getImageData', 'parent': api, 'category': 'Canvas', 'params': ["0", "0", "320", "480"], 'type': 'value' },
  {'func': 'putImageData', 'parent': api, 'category': 'Canvas', 'params': ["imageData", "0", "0"] },
  {'func': 'clearCanvas', 'parent': api, 'category': 'Canvas', },
  {'func': 'getRed', 'category': 'Canvas', 'params': ["imageData", "0", "0"], 'type': 'value', 'dontMarshal': true },
  {'func': 'getGreen', 'category': 'Canvas', 'params': ["imageData", "0", "0"], 'type': 'value', 'dontMarshal': true },
  {'func': 'getBlue', 'category': 'Canvas', 'params': ["imageData", "0", "0"], 'type': 'value', 'dontMarshal': true },
  {'func': 'getAlpha', 'category': 'Canvas', 'params': ["imageData", "0", "0"], 'type': 'value', 'dontMarshal': true },
  {'func': 'setRed', 'category': 'Canvas', 'params': ["imageData", "0", "0", "255"], 'dontMarshal': true },
  {'func': 'setGreen', 'category': 'Canvas', 'params': ["imageData", "0", "0", "255"], 'dontMarshal': true },
  {'func': 'setBlue', 'category': 'Canvas', 'params': ["imageData", "0", "0", "255"], 'dontMarshal': true },
  {'func': 'setAlpha', 'category': 'Canvas', 'params': ["imageData", "0", "0", "255"], 'dontMarshal': true },
  {'func': 'setRGB', 'category': 'Canvas', 'params': ["imageData", "0", "0", "255", "255", "255"], 'dontMarshal': true },

  {'func': 'startWebRequest', 'parent': api, 'category': 'Data', 'params': ['"http://api.openweathermap.org/data/2.5/weather?q=London,uk"', "function(status, type, content) {\n  \n}"] },
  {'func': 'setKeyValue', 'parent': api, 'category': 'Data', 'params': ['"key"', '"value"', "function () {\n  \n}"] },
  {'func': 'getKeyValue', 'parent': api, 'category': 'Data', 'params': ['"key"', "function (value) {\n  \n}"] },
  {'func': 'createRecord', 'parent': api, 'category': 'Data', 'params': ['"mytable"', "{name:'Alice'}", "function(record) {\n  \n}"] },
  {'func': 'readRecords', 'parent': api, 'category': 'Data', 'params': ['"mytable"', "{}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    textLabel('id', records[i].id + ': ' + records[i].name);\n  }\n}"] },
  {'func': 'updateRecord', 'parent': api, 'category': 'Data', 'params': ['"mytable"', "{id:1, name:'Bob'}", "function(record) {\n  \n}"] },
  {'func': 'deleteRecord', 'parent': api, 'category': 'Data', 'params': ['"mytable"', "{id:1}", "function() {\n  \n}"] },
  {'func': 'getUserId', 'parent': api, 'category': 'Data', 'params': [], type: 'value' },

  {'func': 'moveForward', 'parent': api, 'category': 'Turtle', 'params': ["25"], 'dropdown': { 0: [ "25", "50", "100", "200" ] } },
  {'func': 'moveBackward', 'parent': api, 'category': 'Turtle', 'params': ["25"], 'dropdown': { 0: [ "25", "50", "100", "200" ] } },
  {'func': 'move', 'parent': api, 'category': 'Turtle', 'params': ["25", "25"], 'dropdown': { 0: [ "25", "50", "100", "200" ], 1: [ "25", "50", "100", "200" ] } },
  {'func': 'moveTo', 'parent': api, 'category': 'Turtle', 'params': ["0", "0"] },
  {'func': 'dot', 'parent': api, 'category': 'Turtle', 'params': ["5"], 'dropdown': { 0: [ "1", "5", "10" ] } },
  {'func': 'turnRight', 'parent': api, 'category': 'Turtle', 'params': ["90"], 'dropdown': { 0: [ "30", "45", "60", "90" ] } },
  {'func': 'turnLeft', 'parent': api, 'category': 'Turtle', 'params': ["90"], 'dropdown': { 0: [ "30", "45", "60", "90" ] } },
  {'func': 'turnTo', 'parent': api, 'category': 'Turtle', 'params': ["0"], 'dropdown': { 0: [ "0", "90", "180", "270" ] } },
  {'func': 'arcRight', 'parent': api, 'category': 'Turtle', 'params': ["90", "25"], 'dropdown': { 0: [ "30", "45", "60", "90" ], 1: [ "25", "50", "100", "200" ] } },
  {'func': 'arcLeft', 'parent': api, 'category': 'Turtle', 'params': ["90", "25"], 'dropdown': { 0: [ "30", "45", "60", "90" ], 1: [ "25", "50", "100", "200" ] } },
  {'func': 'getX', 'parent': api, 'category': 'Turtle', 'type': 'value' },
  {'func': 'getY', 'parent': api, 'category': 'Turtle', 'type': 'value' },
  {'func': 'getDirection', 'parent': api, 'category': 'Turtle', 'type': 'value' },
  {'func': 'penUp', 'parent': api, 'category': 'Turtle' },
  {'func': 'penDown', 'parent': api, 'category': 'Turtle' },
  {'func': 'penWidth', 'parent': api, 'category': 'Turtle', 'params': ["3"], 'dropdown': { 0: [ "1", "3", "5" ] } },
  {'func': 'penColor', 'parent': api, 'category': 'Turtle', 'params': ['"red"'], 'dropdown': { 0: [ '"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"' ] } },
  {'func': 'penRGB', 'parent': api, 'category': 'Turtle', 'params': ["120", "180", "200"] },
  {'func': 'show', 'parent': api, 'category': 'Turtle' },
  {'func': 'hide', 'parent': api, 'category': 'Turtle' },
  {'func': 'speed', 'parent': api, 'category': 'Turtle', 'params': ["50"], 'dropdown': { 0: [ "25", "50", "75", "100" ] } },

  {'func': 'setTimeout', 'parent': api, 'category': 'Control', 'type': 'either', 'params': ["function() {\n  \n}", "1000"] },
  {'func': 'clearTimeout', 'parent': api, 'category': 'Control', 'params': ["0"] },
  {'func': 'setInterval', 'parent': api, 'category': 'Control', 'type': 'either', 'params': ["function() {\n  \n}", "1000"] },
  {'func': 'clearInterval', 'parent': api, 'category': 'Control', 'params': ["0"] },

  {'func': 'console.log', 'category': 'Variables', 'params': ['"Message"'] },

  {'func': 'imageUploadButton', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"text"'] },
  {'func': 'container', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"html"'] },
  {'func': 'innerHTML', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"html"'] },
  {'func': 'setParent', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"parentId"'] },
  {'func': 'setStyle', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"color:red;"'] },
  {'func': 'getAttribute', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"scrollHeight"'], 'type': 'value' },
  {'func': 'setAttribute', 'parent': api, 'category': 'Advanced', 'params': ['"id"', '"scrollHeight"', "200"]},
];

module.exports.categories = {
  'UI controls': {
    'color': 'yellow',
    'rgb': COLOR_YELLOW,
    'blocks': []
  },
  'Canvas': {
    'color': 'red',
    'rgb': COLOR_RED,
    'blocks': []
  },
  'Data': {
    'color': 'lightgreen',
    'rgb': COLOR_LIGHT_GREEN,
    'blocks': []
  },
  'Turtle': {
    'color': 'cyan',
    'rgb': COLOR_CYAN,
    'blocks': []
  },
  'Advanced': {
    'color': 'blue',
    'rgb': COLOR_BLUE,
    'blocks': []
  },
};
