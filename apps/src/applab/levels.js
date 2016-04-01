var msg = require('./locale');
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
      tb('<block type="applab_container" inline="true"> \
        <value name="ID"><block type="text"><title name="TEXT">id</title></block></value> \
        <value name="HTML"><block type="text"><title name="TEXT">html</title></block></value></block>'),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.custom = {
  'freePlay': true,
  'editCode': true,
  'sliderSpeed': 1,
  'appWidth': 320,
  'appHeight': 480,

  /**
   * This is the default set of functions available to us if the levelbuilder
   * leaves codeFunctions blank.
   * Applab.rb self.palette serves a similar function, intially providing
   * levelbuilders with the text for the default set of blocks.
   * These two places should be kept in sync
   */
  'codeFunctions': {
    // UI Controls
    "onEvent": null,
    "button": null,
    "textInput": null,
    "textLabel": null,
    "dropdown": null,
    "getText": null,
    "setText": null,
    "getNumber": null,
    "setNumber": null,
    "checkbox": null,
    "radioButton": null,
    "getChecked": null,
    "setChecked": null,
    "image": null,
    "getImageURL": null,
    "setImageURL": null,
    "playSound": null,
    "showElement": null,
    "hideElement": null,
    "deleteElement": null,
    "setPosition": null,
    "setSize": null,
    "setProperty": null,
    "write": null,
    "getXPosition": null,
    "getYPosition": null,
    "setScreen": null,

    // Canvas
    "createCanvas": null,
    "setActiveCanvas": null,
    "line": null,
    "circle": null,
    "rect": null,
    "setStrokeWidth": null,
    "setStrokeColor": null,
    "setFillColor": null,
    "drawImageURL": null,
    "getImageData": null,
    "putImageData": null,
    "clearCanvas": null,
    "getRed": null,
    "getGreen": null,
    "getBlue": null,
    "getAlpha": null,
    "setRed": null,
    "setGreen": null,
    "setBlue": null,
    "setAlpha": null,
    "setRGB": null,

    // Data
    "startWebRequest": null,
    "setKeyValue": null,
    "getKeyValue": null,
    "createRecord": null,
    "readRecords": null,
    "updateRecord": null,
    "deleteRecord": null,
    "getUserId": null,
    "drawChart": null,
    "drawChartFromRecords": null,

    // Turtle
    "moveForward": null,
    "moveBackward": null,
    "move": null,
    "moveTo": null,
    "dot": null,
    "turnRight": null,
    "turnLeft": null,
    "turnTo": null,
    "arcRight": null,
    "arcLeft": null,
    "getX": null,
    "getY": null,
    "getDirection": null,
    "penUp": null,
    "penDown": null,
    "penWidth": null,
    "penColor": null,
    "penRGB": null,
    "show": null,
    "hide": null,
    "speed": null,

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,
    "setTimeout": null,
    "clearTimeout": null,
    "setInterval": null,
    "clearInterval": null,
    "getTime": null,

    // Math
    "addOperator": null,
    "subtractOperator": null,
    "multiplyOperator": null,
    "divideOperator": null,
    "equalityOperator": null,
    "inequalityOperator": null,
    "greaterThanOperator": null,
    "greaterThanOrEqualOperator": null,
    "lessThanOperator": null,
    "lessThanOrEqualOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,
    "mathRandom": null,

    // Variables
    "declareAssign_x": null,
    "declareNoAssign_x": null,
    "assign_x": null,
    "declareAssign_x_prompt": null,
    "declareAssign_x_promptNum": null,
    "console.log": null,
    "declareAssign_str_hello_world": null,
    "substring": null,
    "indexOf": null,
    "includes": null,
    "length": null,
    "toUpperCase": null,
    "toLowerCase": null,
    "declareAssign_list_abd": null,
    "listLength": null,
    "insertItem": null,
    "appendItem": null,
    "removeItem": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
    "return": null,
    "comment": null
  },

  // "randomNumber_max": null, // DEPRECATED
};

levels.ec_simple = utils.extend(levels.custom, {
});

// Functions in Advanced category currently disabled in all levels:
/*
 "imageUploadButton": null,
 "container": null,
 "innerHTML": null,
 "setStyle": null,
 "getAttribute": null,
 "setAttribute": null,
 "setParent": null,
*/

levels.full_sandbox =  {
  'scrollbars': true,
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
