var api = require('./api');
var dontMarshalApi = require('./dontMarshalApi');
var consoleApi = require('../consoleApi');
var showAssetManager = require('../assetManagement/show.js');
var getAssetDropdown = require('../assetManagement/getAssetDropdown');
var ChartApi = require('./ChartApi');
var elementUtils = require('./designElements/elementUtils');
var setPropertyDropdown = require('./setPropertyDropdown').setPropertyDropdown;

var applabConstants = require('./constants');

var DEFAULT_WIDTH = "320";
var DEFAULT_HEIGHT = (480 - applabConstants.FOOTER_HEIGHT).toString();

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  showAssetManager(callback, typeFilter);
}

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_BLUE = '#19C3E1';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';

var stringMethodPrefix = '[string].';
var arrayMethodPrefix = '[list].';

var stringBlockPrefix = 'str.';

/**
 * Generate a list of screen ids for our setScreen dropdown
 */
function getScreenIds() {
  var ret = elementUtils.getScreens().map(function () {
    return '"' + elementUtils.getId(this) + '"';
  });

  // Convert from jQuery's array-like object to a true array
  return $.makeArray(ret);
}

/**
 * @param {string?} selector Filters to ids on elements that match selector, or
 *   all elements if undefined
 * @returns {function} Dropdown function that returns a list of ids for the selector
 */
function idDropdownWithSelector(selector) {
  return function () {
    return Applab.getIdDropdown(selector);
  };
}

// Basic dropdown that shows ids for all DOM elements in the applab app.
var ID_DROPDOWN_PARAM_0 = {
  0: idDropdownWithSelector()
};

// NOTE : format of blocks detailed at top of apps/src/dropletUtils.js

module.exports.blocks = [
  {func: 'onEvent', parent: api, category: 'UI controls', paletteParams: ['id','type','callback'], params: ['"id"', '"click"', "function(event) {\n  \n}"], dropdown: {0: idDropdownWithSelector(), 1: ['"click"', '"change"', '"keyup"', '"keydown"', '"keypress"', '"mousemove"', '"mousedown"', '"mouseup"', '"mouseover"', '"mouseout"', '"input"']}},
  {func: 'button', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"']},
  {func: 'textInput', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"']},
  {func: 'textLabel', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"']},
  {func: 'dropdown', parent: api, category: 'UI controls', paletteParams: ['id','option1','etc'], params: ['"id"', '"option1"', '"etc"']},
  {func: 'getText', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0, type: 'value'},
  {func: 'setText', parent: api, category: 'UI controls', paletteParams: ['id','text'], params: ['"id"', '"text"'], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'getNumber', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0, type: 'value'},
  {func: 'setNumber', parent: api, category: 'UI controls', paletteParams: ['id','number'], params: ['"id"', '0'], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'checkbox', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "false"], dropdown: {1: ["true", "false"]}},
  {func: 'radioButton', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "false", '"group"'], dropdown: {1: ["true", "false"]}},
  {func: 'getChecked', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], type: 'value'},
  {func: 'setChecked', parent: api, category: 'UI controls', paletteParams: ['id','checked'], params: ['"id"', "true"], dropdown: {1: ["true", "false"]}},
  {func: 'image', parent: api, category: 'UI controls', paletteParams: ['id','url'], params: ['"id"', '"https://code.org/images/logo.png"'], dropdown: {1: function () { return getAssetDropdown('image'); }}, 'assetTooltip': {1: chooseAsset.bind(null, 'image')}},
  {func: 'getImageURL', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: {0: idDropdownWithSelector("img")}, type: 'value'},
  {func: 'setImageURL', parent: api, category: 'UI controls', paletteParams: ['id','url'], params: ['"id"', '"https://code.org/images/logo.png"'], dropdown: {0: idDropdownWithSelector("img"), 1: function () { return getAssetDropdown('image'); }}, 'assetTooltip': {1: chooseAsset.bind(null, 'image')}},
  {func: 'playSound', parent: api, category: 'UI controls', paletteParams: ['url'], params: ['"https://studio.code.org/blockly/media/example.mp3"'], dropdown: {0: function () { return getAssetDropdown('audio'); }}, 'assetTooltip': {0: chooseAsset.bind(null, 'audio')}},
  {func: 'showElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'hideElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'deleteElement', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'setPosition', parent: api, category: 'UI controls', paletteParams: ['id','x','y','width','height'], params: ['"id"', "0", "0", "100", "100"], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'setSize', parent: api, category: 'UI controls', paletteParams: ['id','width','height'], params: ['"id"', "100", "100"], dropdown: ID_DROPDOWN_PARAM_0},
  {func: 'setProperty', parent: api, category: 'UI controls', paletteParams: ['id','property','value'], params: ['"id"', '"width"', "100"], dropdown: {0: idDropdownWithSelector(), 1: setPropertyDropdown()}},
  {func: 'write', parent: api, category: 'UI controls', paletteParams: ['text'], params: ['"text"']},
  {func: 'getXPosition', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0, type: 'value'},
  {func: 'getYPosition', parent: api, category: 'UI controls', paletteParams: ['id'], params: ['"id"'], dropdown: ID_DROPDOWN_PARAM_0, type: 'value'},
  {func: 'setScreen', parent: api, category: 'UI controls', paletteParams: ['screenId'], params: ['"screen1"'], dropdown: {0: getScreenIds}},

  {func: 'createCanvas', parent: api, category: 'Canvas', paletteParams: ['id','width','height'], params: ['"id"', DEFAULT_WIDTH, DEFAULT_HEIGHT]},
  {func: 'setActiveCanvas', parent: api, category: 'Canvas', paletteParams: ['id'], params: ['"id"'], dropdown: {0: idDropdownWithSelector("canvas")}},
  {func: 'line', parent: api, category: 'Canvas', paletteParams: ['x1','y1','x2','y2'], params: ["0", "0", "160", "240"]},
  {func: 'circle', parent: api, category: 'Canvas', paletteParams: ['x','y','radius'], params: ["160", "240", "100"]},
  {func: 'rect', parent: api, category: 'Canvas', paletteParams: ['x','y','width','height'], params: ["80", "120", "160", "240"]},
  {func: 'setStrokeWidth', parent: api, category: 'Canvas', paletteParams: ['width'], params: ["3"]},
  {func: 'setStrokeColor', parent: api, category: 'Canvas', paletteParams: ['color'], params: ['"red"'], dropdown: {0: ['"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"']}},
  {func: 'setFillColor', parent: api, category: 'Canvas', paletteParams: ['color'], params: ['"yellow"'], dropdown: {0: ['"yellow"', '"rgb(255,255,0)"', '"rgba(255,255,0,0.5)"', '"#FFFF00"']}},
  // drawImage has been deprecated in favor of drawImageURL
  {func: 'drawImage', parent: api, category: 'Canvas', paletteParams: ['id','x','y'], params: ['"id"', "0", "0"], dropdown: {0: idDropdownWithSelector("img")}, noAutocomplete: true},
  {func: 'drawImageURL', parent: api, category: 'Canvas', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"']},
  {func: 'getImageData', parent: api, category: 'Canvas', paletteParams: ['x','y','width','height'], params: ["0", "0", DEFAULT_WIDTH, DEFAULT_HEIGHT], type: 'value'},
  {func: 'putImageData', parent: api, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"]},
  {func: 'clearCanvas', parent: api, category: 'Canvas',},
  {func: 'getRed', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true},
  {func: 'getGreen', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true},
  {func: 'getBlue', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true},
  {func: 'getAlpha', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y'], params: ["imgData", "0", "0"], type: 'value', dontMarshal: true},
  {func: 'setRed', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','r'], params: ["imgData", "0", "0", "255"], dontMarshal: true},
  {func: 'setGreen', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','g'], params: ["imgData", "0", "0", "255"], dontMarshal: true},
  {func: 'setBlue', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','b'], params: ["imgData", "0", "0", "255"], dontMarshal: true},
  {func: 'setAlpha', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','a'], params: ["imgData", "0", "0", "255"], dontMarshal: true},
  {func: 'setRGB', parent: dontMarshalApi, category: 'Canvas', paletteParams: ['imgData','x','y','r','g','b'], params: ["imgData", "0", "0", "255", "255", "255"], dontMarshal: true},

  {func: 'startWebRequest', parent: api, category: 'Data', paletteParams: ['url','callback'], params: ['"http://api.openweathermap.org/data/2.5/weather?q=London,uk"', "function(status, type, content) {\n  \n}"]},
  {func: 'setKeyValue', parent: api, category: 'Data', paletteParams: ['key','value','callback'], params: ['"key"', '"value"', "function () {\n  \n}"]},
  {func: 'setKeyValueSync', parent: api, category: 'Data', paletteParams: ['key','value'], params: ['"key"', '"value"'], nativeIsAsync: true, noAutocomplete: true},
  {func: 'getKeyValue', parent: api, category: 'Data', paletteParams: ['key','callback'], params: ['"key"', "function (value) {\n  \n}"]},
  {func: 'getKeyValueSync', parent: api, category: 'Data', paletteParams: ['key'], params: ['"key"'], type: 'value', nativeIsAsync: true, noAutocomplete: true},
  {func: 'createRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{name:'Alice'}", "function(record) {\n  \n}"]},
  {func: 'readRecords', parent: api, category: 'Data', paletteParams: ['table','terms','callback'], params: ['"mytable"', "{}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    textLabel('id', records[i].id + ': ' + records[i].name);\n  }\n}"]},
  {func: 'updateRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{id:1, name:'Bob'}", "function(record, success) {\n  \n}"]},
  {func: 'deleteRecord', parent: api, category: 'Data', paletteParams: ['table','record','callback'], params: ['"mytable"', "{id:1}", "function(success) {\n  \n}"]},
  {func: 'onRecordEvent', parent: api, category: 'Data', paletteParams: ['table','callback'], params: ['"mytable"', "function(record, eventType) {\n  if (eventType === 'create') {\n    textLabel('id', 'record with id ' + record.id + ' was created');\n  } \n}"], noAutocomplete: true},
  {func: 'getUserId', parent: api, category: 'Data', type: 'value'},
  {func: 'drawChart', parent: api, category: 'Data', paletteParams: ['chartId', 'chartType', 'chartData'], params: ['"chartId"', '"bar"', '[\n\t{ label: "Row 1", value: 1 },\n\t{ label: "Row 2", value: 2 }\n]'], dropdown: {0: idDropdownWithSelector(".chart"), 1: ChartApi.getChartTypeDropdown}},
  {func: 'drawChartFromRecords', parent: api, category: 'Data', paletteParams: ['chartId', 'chartType', 'tableName', 'columns'], params: ['"chartId"', '"bar"', '"mytable"', '["columnOne", "columnTwo"]'], dropdown: {0: idDropdownWithSelector(".chart"), 1: ChartApi.getChartTypeDropdown}},

  {func: 'moveForward', parent: api, category: 'Turtle', paletteParams: ['pixels'], params: ["25"], dropdown: {0: ["25", "50", "100", "200"]}},
  {func: 'moveBackward', parent: api, category: 'Turtle', paletteParams: ['pixels'], params: ["25"], dropdown: {0: ["25", "50", "100", "200"]}},
  {func: 'move', parent: api, category: 'Turtle', paletteParams: ['x','y'], params: ["25", "25"], dropdown: {0: ["25", "50", "100", "200"], 1: ["25", "50", "100", "200"]}},
  {func: 'moveTo', parent: api, category: 'Turtle', paletteParams: ['x','y'], params: ["0", "0"]},
  {func: 'dot', parent: api, category: 'Turtle', paletteParams: ['radius'], params: ["5"], dropdown: {0: ["1", "5", "10"]}},
  {func: 'turnRight', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["90"], dropdown: {0: ["30", "45", "60", "90"]}},
  {func: 'turnLeft', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["90"], dropdown: {0: ["30", "45", "60", "90"]}},
  {func: 'turnTo', parent: api, category: 'Turtle', paletteParams: ['angle'], params: ["0"], dropdown: {0: ["0", "90", "180", "270"]}},
  {func: 'arcRight', parent: api, category: 'Turtle', paletteParams: ['angle','radius'], params: ["90", "25"], dropdown: {0: ["30", "45", "60", "90"], 1: ["25", "50", "100", "200"]}},
  {func: 'arcLeft', parent: api, category: 'Turtle', paletteParams: ['angle','radius'], params: ["90", "25"], dropdown: {0: ["30", "45", "60", "90"], 1: ["25", "50", "100", "200"]}},
  {func: 'getX', parent: api, category: 'Turtle', type: 'value'},
  {func: 'getY', parent: api, category: 'Turtle', type: 'value'},
  {func: 'getDirection', parent: api, category: 'Turtle', type: 'value'},
  {func: 'penUp', parent: api, category: 'Turtle'},
  {func: 'penDown', parent: api, category: 'Turtle'},
  {func: 'penWidth', parent: api, category: 'Turtle', paletteParams: ['width'], params: ["3"], dropdown: {0: ["1", "3", "5"]}},
  {func: 'penColor', parent: api, category: 'Turtle', paletteParams: ['color'], params: ['"red"'], dropdown: {0: ['"red"', '"rgb(255,0,0)"', '"rgba(255,0,0,0.5)"', '"#FF0000"']}},
  {func: 'penRGB', parent: api, category: 'Turtle', paletteParams: ['r','g','b'], params: ["120", "180", "200"]},
  {func: 'show', parent: api, category: 'Turtle'},
  {func: 'hide', parent: api, category: 'Turtle'},
  {func: 'speed', parent: api, category: 'Turtle', paletteParams: ['value'], params: ["50"], dropdown: {0: ["25", "50", "75", "100"]}},

  {func: 'setTimeout', parent: api, category: 'Control', type: 'either', paletteParams: ['callback','ms'], params: ["function() {\n  \n}", "1000"]},
  {func: 'clearTimeout', parent: api, category: 'Control', paletteParams: ['__'], params: ["__"]},
  {func: 'setInterval', parent: api, category: 'Control', type: 'either', paletteParams: ['callback','ms'], params: ["function() {\n  \n}", "1000"]},
  {func: 'clearInterval', parent: api, category: 'Control', paletteParams: ['__'], params: ["__"]},

  {func: 'console.log', parent: consoleApi, category: 'Variables', paletteParams: ['message'], params: ['"message"']},
  {func: 'declareAssign_str_hello_world', block: 'var str = "Hello World";', category: 'Variables', noAutocomplete: true},
  {func: 'substring', blockPrefix: stringBlockPrefix, category: 'Variables', paletteParams: ['start','end'], params: ["6", "11"], modeOptionName: '*.substring', tipPrefix: stringMethodPrefix, type: 'value'},
  {func: 'indexOf', blockPrefix: stringBlockPrefix, category: 'Variables', paletteParams: ['searchValue'], params: ['"World"'], modeOptionName: '*.indexOf', tipPrefix: stringMethodPrefix, type: 'value'},
  {func: 'includes', blockPrefix: stringBlockPrefix, category: 'Variables', paletteParams: ['searchValue'], params: ['"World"'], modeOptionName: '*.includes', tipPrefix: stringMethodPrefix, type: 'value'},
  {func: 'length', blockPrefix: stringBlockPrefix, category: 'Variables', modeOptionName: '*.length', tipPrefix: stringMethodPrefix, type: 'property'},
  {func: 'toUpperCase', blockPrefix: stringBlockPrefix, category: 'Variables', modeOptionName: '*.toUpperCase', tipPrefix: stringMethodPrefix, type: 'value'},
  {func: 'toLowerCase', blockPrefix: stringBlockPrefix, category: 'Variables', modeOptionName: '*.toLowerCase', tipPrefix: stringMethodPrefix, type: 'value'},
  {func: 'declareAssign_list_abd', block: 'var list = ["a", "b", "d"];', category: 'Variables', noAutocomplete: true},
  {func: 'listLength', block: 'list.length', category: 'Variables', noAutocomplete: true, tipPrefix: arrayMethodPrefix, type: 'property'},
  {func: 'insertItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','index','item'], params: ["list", "2", '"c"'], dontMarshal: true},
  {func: 'appendItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','item'], params: ["list", '"f"'], dontMarshal: true},
  {func: 'removeItem', parent: dontMarshalApi, category: 'Variables', paletteParams: ['list','index'], params: ["list", "0"], dontMarshal: true},

  {func: 'imageUploadButton', parent: api, category: 'Advanced', params: ['"id"', '"text"']},
  {func: 'container', parent: api, category: 'Advanced', params: ['"id"', '"html"']},
  {func: 'innerHTML', parent: api, category: 'Advanced', params: ['"id"', '"html"']},
  {func: 'setParent', parent: api, category: 'Advanced', params: ['"id"', '"parentId"']},
  {func: 'setStyle', parent: api, category: 'Advanced', params: ['"id"', '"color:red;"']},
  {func: 'getAttribute', parent: api, category: 'Advanced', params: ['"id"', '"scrollHeight"'], type: 'value'},
  {func: 'setAttribute', parent: api, category: 'Advanced', params: ['"id"', '"scrollHeight"', "200"]},
];

module.exports.categories = {
  'UI controls': {
    color: 'yellow',
    rgb: COLOR_YELLOW,
    blocks: []
  },
  Canvas: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Data: {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
  Turtle: {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  Advanced: {
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  },
};

/*
 * Set the showExamplesLink config value so that the droplet tooltips will show
 * an 'Examples' link that opens documentation in a lightbox:
 */
module.exports.showExamplesLink = true;

/*
 * Set the showParamDropdowns config value so that ace autocomplete dropdowns
 * will appear for each parameter based on the dropdown properties above:
 */
module.exports.showParamDropdowns = true;
