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
  'appWidth': 320,
  'appHeight': 480,
  'codeFunctions': {
    'onEvent': null,
    'startWebRequest': null,
    'setTimeout': null,
    'clearTimeout': null,
    'createHtmlBlock': null,
    'replaceHtmlBlock': null,
    'deleteHtmlBlock': null,
    'setParent': null,
    'setPosition': null,
    'setStyle': null,
    'getAttribute': null,
    'setAttribute': null,
    'createButton': null,
    'createTextInput': null,
    'createTextLabel': null,
    'createDropdown': null,
    'getText': null,
    'setText': null,
    'createCheckbox': null,
    'createRadio': null,
    'getChecked': null,
    'setChecked': null,
    'createImage': null,
    'getImageURL': null,
    'setImageURL': null,
    'createImageUploadButton': null,
    'createCanvas': null,
    'canvasDrawLine': null,
    'canvasDrawCircle': null,
    'canvasDrawRect': null,
    'canvasSetLineWidth': null,
    'canvasSetStrokeColor': null,
    'canvasSetFillColor': null,
    'canvasDrawImage': null,
    'canvasGetImageData': null,
    'canvasPutImageData': null,
    'canvasClear': null,
    'readSharedValue': null,
    'writeSharedValue': null,
    'createSharedRecord': null,
    'readSharedRecords': null,
    'updateSharedRecord': null,
    'deleteSharedRecord': null,
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
