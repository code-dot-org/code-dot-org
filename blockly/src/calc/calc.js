/**
 * Blockly Demo: Calc Graphics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var Calc = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Calc = module.exports;
var commonMsg = require('../../locale/current/common');
var calcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');


var ExpressionNode = require('./expressionNode');
var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;


/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function(config) {

  skin = config.skin;
  level = config.level;

  Calc.expressions = {
    target: null, // the complete target expression
    user: null, // the current state of the user expression
    current: null // the current state of the target expression
  };

  Calc.shownFeedback_ = false;

  config.grayOutUndeletableBlocks = true;
  config.insertWhenRun = false;

  // Enable blockly param editing in levelbuilder, regardless of level setting
  if (config.level.edit_blocks) {
    config.disableParamEditing = false;
  }

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      controls: require('./controls.html')({
        assetUrl: BlocklyApps.assetUrl
      }),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    //XXX Not sure if this is still right.
    Blockly.JavaScript.addReservedWords('Calc,code');

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create display canvas.
    var display = createCanvas('display', 400, 400);
    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Calc.ctxDisplay = display.getContext('2d');

    Calc.expressions.target = generateExpressionFromBlockXml(level.solutionBlocks);
    Calc.drawExpressions();

    // todo - figure out LB story

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    dom.addClickTouchEvent(document.getElementById("continueButton"), function () {
      Calc.step(true);
    });

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Calc.resetButtonClick);
  };

  config.getDisplayWidth = function() {
    var el = document.getElementById('visualizationColumn');
    return el.getBoundingClientRect().width;
  };

  BlocklyApps.init(config);
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainWorkspace.traceOn(true);
  BlocklyApps.attempts++;
  Calc.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Calc.resetButtonClick = function () {
  var continueButton = document.getElementById('continueButton');
  // todo - single location for toggling hide state?
  continueButton.className += " hide";

  Calc.expressions.user = null;
  Calc.expressions.current = null;
  Calc.shownFeedback_ = false;

  Calc.drawExpressions();
};


function evalCode (code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Calc: api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      if (console && console.log) {
        console.log(e);
      }
    }
  }
}

/**
 * Given the xml for a set of blocks, generates an expression from them by
 * temporarily sticking them into the workspace, generating code, and
 * evaluating said code.
 */
function generateExpressionFromBlockXml(blockXml) {
  var xml = blockXml || '';

  if (Blockly.mainWorkspace.getTopBlocks().length !== 0) {
    throw new Error("generateExpressionFromBlockXml shouldn't be called if " +
      "we already have blocks in the workspace");
  }

  // Temporarily put the blocks into the workspace so that we can generate code
  BlocklyApps.loadBlocks(xml);
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  evalCode(code);

  // Remove the blocks
  Blockly.mainWorkspace.getTopBlocks().forEach(function (b) { b.dispose(); });
  var expression = Calc.lastExpression;
  Calc.lastExpression = null;

  return expression;
}

/**
 * Execute the user's code.  Heaven help us...
 */
Calc.execute = function() {
  // todo (brent) perhaps try to share user vs. expected generation better
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  evalCode(code);

  if (!Calc.lastExpression) {
    Calc.lastExpression = new ExpressionNode(0);
  }

  Calc.expressions.user = Calc.lastExpression.clone();
  Calc.expressions.current = Calc.expressions.target.clone();

  Calc.expressions.user.applyExpectation(Calc.expressions.target);

  var result = !Calc.expressions.user.failedExpectation(true);

  var equivalent = Calc.expressions.user.isEquivalent(Calc.expressions.target);

  Calc.drawExpressions();

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  // todo (brent) - better way of doing this
  if (equivalent) {
    Calc.message = result ? "correct" : "expression equivalent";
  } else {
    Calc.message = null;
  }

  var reportData = {
    app: 'calc',
    level: level.id,
    builder: level.builder,
    result: result,
    testResult: result ? TestResults.ALL_PASS : TestResults.APP_SPECIFIC_FAIL,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);

  window.setTimeout(function () {
    Calc.step();
  }, 1000);
};

/**
 * Perform a step in our expression evaluation animation. This consists of
 * collapsing the next node in our tree. If that node failed expectations, we
 * will instead bring up a continue button, and refrain from further
 * collapses/animations until continue is pressed.
 */
Calc.step = function (ignoreFailures) {
  if (!Calc.expressions.user) {
    return;
  }

  if (!Calc.expressions.user.isOperation()) {
    displayFeedback();
    return;
  }

  var continueButton = document.getElementById('continueButton');

  var collapsed = Calc.expressions.user.collapse(ignoreFailures);
  if (!collapsed) {
    continueButton.className = continueButton.className.replace(/hide/g, "");
  } else {
    Calc.expressions.current.collapse();
    Calc.drawExpressions();

    continueButton.className += " hide";

    window.setTimeout(function () {
      Calc.step();
    }, 1000);
  }
};

/**
 * Draw the current state of our two expressions.
 */
Calc.drawExpressions = function () {
  var ctx = Calc.ctxDisplay;

  var expected = Calc.expressions.current || Calc.expressions.target;
  var user = Calc.expressions.user;

  ctx.clearRect(0, 0, 400, 400);
  ctx.font="30px Verdana";
  expected.applyExpectation(expected);
  drawExpression(ctx, expected, 350, user !== null);

  if (user) {
    user.applyExpectation(expected);
    drawExpression(ctx, user, 250, true);
  }
};

function drawExpression(ctx, expr, ypos, styleMarks) {
  var list = expr.getTokenList(true);

  var strSize = ctx.measureText(expr.toString());

  // todo - handle long strings
  var xpos = (CANVAS_WIDTH - strSize.width) / 2;  
  for (var i = 0; i < list.length; i++) {
    var char = list[i].char;
    ctx.fillStyle = 'black';
    if (styleMarks && list[i].marked) {
      // marked parens are green, other marks ar ered
      ctx.fillStyle = /^[\(|\)]$/.test(char) ? 'green' : 'red';
    }
    ctx.fillText(char, xpos, ypos);
    xpos += ctx.measureText(char).width;
  }
}

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  if (!Calc.expressions.user.isOperation() && !Calc.shownFeedback_) {
    Calc.shownFeedback_ = true;
    BlocklyApps.displayFeedback({
      app: 'Calc',
      skin: skin.id,
      // feedbackType: Calc.testResults,
      message: Calc.message ? Calc.message : "todo (brent): wrong",
      response: response,
      level: level
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
function onReportComplete(response) {
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  displayFeedback(response);
}
