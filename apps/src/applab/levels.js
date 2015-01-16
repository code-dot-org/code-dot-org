/*jshint multistr: true */

var msg = require('../../locale/current/applab');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.simple = {
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'freePlay': true,
  'toolbox':
      tb('<block type="applab_createHtmlBlock" inline="true"> \
        <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
        <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.ec_simple = {
  'freePlay': true,
  'editCode': true,
  'sliderSpeed': 0.95,
  'codeFunctions': [
    {'func': 'onEvent', 'title': 'Execute code in response to an event for the specified element', 'category': 'General', 'params': ["'id'", "'click'", "function() {\n  \n}"] },
    {'func': 'startWebRequest', 'title': 'Request data from the internet and execute code when the request is complete', 'category': 'General', 'params': ["'http://api.openweathermap.org/data/2.5/weather?q=London,uk'", "function(status, type, content) {\n  \n}"] },
    {'func': 'setTimeout', 'title': 'Set a timer and execute code when that number of milliseconds has elapsed', 'category': 'General', 'params': ["function() {\n  \n}", "1000"] },
    {'func': 'clearTimeout', 'title': 'Clear an existing timer by passing in the value returned from setTimeout()', 'category': 'General', 'params': ["0"] },
    {'func': 'createHtmlBlock', 'title': 'Create a block of HTML and assign it an element id', 'category': 'General', 'params': ["'id'", "'html'"] },
    {'func': 'replaceHtmlBlock', 'title': 'Replace a block of HTML associated with the specified id', 'category': 'General', 'params': ["'id'", "'html'"] },
    {'func': 'deleteHtmlBlock', 'title': 'Delete the element with the specified id', 'category': 'General', 'params': ["'id'"] },
    {'func': 'setParent', 'title': 'Set an element to become a child of a parent element', 'category': 'General', 'params': ["'id'", "'parentId'"] },
    {'func': 'setPosition', 'title': 'Position an element with x, y, width, and height coordinates', 'category': 'General', 'params': ["'id'", "0", "0", "100", "100"] },
    {'func': 'setStyle', 'title': 'Add CSS style text to an element', 'category': 'General', 'params': ["'id'", "'color:red;'"] },
    {'func': 'getAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'"], 'type': 'value' },
    {'func': 'setAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'", "200"]},
    {'func': 'createButton', 'title': 'Create a button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createTextInput', 'title': 'Create a text input and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createTextLabel', 'title': 'Create a text label, assign it an element id, and bind it to an associated element', 'category': 'UI Controls', 'params': ["'id'", "'text'", "'forId'"] },
    {'func': 'createDropdown', 'title': 'Create a dropdown, assign it an element id, and populate it with a list of items', 'category': 'UI Controls', 'params': ["'id'", "'option1'", "'etc'"] },
    {'func': 'getText', 'title': 'Get the text from the specified element', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setText', 'title': 'Set the text for the specified element', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createCheckbox', 'title': 'Create a checkbox and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false"] },
    {'func': 'createRadio', 'title': 'Create a radio button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false", "'group'"] },
    {'func': 'getChecked', 'title': 'Get the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setChecked', 'title': 'Set the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'", "true"] },
    {'func': 'createImage', 'title': 'Create an image and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
    {'func': 'getImageURL', 'title': 'Get the URL associated with an image or image upload button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
    {'func': 'setImageURL', 'title': 'Set the URL for the specified image element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
    {'func': 'createImageUploadButton', 'title': 'Create an image upload button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
    {'func': 'createCanvas', 'title': 'Create a canvas with width, height dimensions', 'category': 'Canvas', 'params': ["'id'", "400", "600"] },
    {'func': 'canvasDrawLine', 'title': 'Draw a line on a canvas from x1, y1 to x2, y2', 'category': 'Canvas', 'params': ["'id'", "0", "0", "400", "600"] },
    {'func': 'canvasDrawCircle', 'title': 'Draw a circle on a canvas with the specified coordinates for center (x, y) and radius', 'category': 'Canvas', 'params': ["'id'", "200", "300", "100"] },
    {'func': 'canvasDrawRect', 'title': 'Draw a rectangle on a canvas with x, y, width, and height coordinates', 'category': 'Canvas', 'params': ["'id'", "100", "200", "200", "200"] },
    {'func': 'canvasSetLineWidth', 'title': 'Set the line width for a canvas', 'category': 'Canvas', 'params': ["'id'", "3"] },
    {'func': 'canvasSetStrokeColor', 'title': 'Set the stroke color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'red'"] },
    {'func': 'canvasSetFillColor', 'title': 'Set the fill color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'yellow'"] },
    {'func': 'canvasDrawImage', 'title': 'Draw an image on a canvas with the specified image element and x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "'imageId'", "0", "0"] },
    {'func': 'canvasGetImageData', 'title': 'Get the ImageData for a rectangle (x, y, width, height) within a canvas', 'category': 'Canvas', 'params': ["'id'", "0", "0", "400", "600"], 'type': 'value' },
    {'func': 'canvasPutImageData', 'title': 'Set the ImageData for a rectangle within a canvas with x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "imageData", "0", "0"] },
    {'func': 'canvasClear', 'title': 'Clear all data on a canvas', 'category': 'Canvas', 'params': ["'id'"] },
    {'func': 'createSharedRecord', 'category': 'General', 'params': ["{tableName: 'abc',name:'Alice',age:7,male:false}", "function() {\n  \n}"] },
    {'func': 'readSharedRecords', 'category': 'General', 'params': ["{tableName: 'abc'}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    for (var prop in records[i]) {\n      createHtmlBlock('id2', 'records[' + i + '].' + prop + ': ' + records[i][prop]);\n    }\n  }\n}"] },
  ],
  'categoryInfo': {
    'General': {
      'color': 'blue',
      'blocks': []
    },
    'UI Controls': {
      'color': 'red',
      'blocks': []
    },
    'Canvas': {
      'color': 'yellow',
      'blocks': []
    },
  },
};

levels.full_sandbox =  {
  'scrollbars' : true,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'freePlay': true,
  'toolbox':
    tb(createCategory(
        msg.catActions(),
        '<block type="applab_createHtmlBlock" inline="true"> \
          <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
          <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>') +
       createCategory(msg.catControl(),
                        blockOfType('controls_whileUntil') +
                       '<block type="controls_for"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                          <value name="BY"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_flow_statements')) +
       createCategory(msg.catLogic(),
                        blockOfType('controls_if') +
                        blockOfType('logic_compare') +
                        blockOfType('logic_operation') +
                        blockOfType('logic_negate') +
                        blockOfType('logic_boolean')) +
       createCategory(msg.catMath(),
                        blockOfType('math_number') +
                       '<block type="math_change"> \
                          <value name="DELTA"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                       '<block type="math_random_int"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">100</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('math_arithmetic')) +
       createCategory(msg.catText(),
                        blockOfType('text') +
                        blockOfType('text_join') +
                       '<block type="text_append"> \
                          <value name="TEXT"> \
                            <block type="text"></block> \
                          </value> \
                        </block>') +
       createCategory(msg.catVariables(), '', 'VARIABLE') +
       createCategory(msg.catProcedures(), '', 'PROCEDURE')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
