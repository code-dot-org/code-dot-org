/*jshint multistr: true */

var msg = window.blockly.appLocale;
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
      tb('<block type="webapp_createHtmlBlock" inline="true"> \
        <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
        <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.ec_simple = {
  'freePlay': true,
  'editCode': true,
  'sliderSpeed': 0.7,
  'codeFunctions': [
    {'func': 'random', 'params': ["1", "100"], 'category': 'hidden', 'idArgNone': true },
    {'func': 'createButton', 'params': ["'id'", "'text'"] },
    {'func': 'createTextInput', 'params': ["'id'", "'text'"] },
    {'func': 'getText', 'params': ["'id'"], 'category': 'value' },
    {'func': 'setText', 'params': ["'id'", "'text'"] },
    {'func': 'setStyle', 'params': ["'id'", "'color:red;'"] },
    {'func': 'createHtmlBlock', 'params': ["'id'", "'html'"] },
    {'func': 'replaceHtmlBlock', 'params': ["'id'", "'html'"] },
    {'func': 'deleteHtmlBlock', 'params': ["'id'"] },
    {'func': 'createCanvas', 'params': ["'id'"] },
    {'func': 'canvasDrawLine', 'params': ["'id'", "0", "0", "400", "400"] },
    {'func': 'canvasDrawCircle', 'params': ["'id'", "200", "200", "100"] },
    {'func': 'canvasClear', 'params': ["'id'"] },
    {'func': 'attachEventHandler', 'params': ["'id'", "'click'", "function() {\n  \n}"] },
  ],
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
        '<block type="webapp_createHtmlBlock" inline="true"> \
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
