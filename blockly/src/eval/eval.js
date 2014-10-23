/**
 * Blockly Demo: Eval Graphics
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

var Eval = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Eval = module.exports;
var commonMsg = require('../../locale/current/common');
var evalMsg = require('../../locale/current/eval');
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
 * Initialize Blockly and the Eval.  Called on page load.
 */
Eval.init = function(config) {

  skin = config.skin;
  level = config.level;

  Eval.expressions = {
    target: null, // the complete target expression
    user: null, // the current state of the user expression
    current: null // the current state of the target expression
  };

  Eval.shownFeedback_ = false;

  config.grayOutUndeletableBlocks = true;
  config.insertWhenRun = false;

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
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
    var svg = document.getElementById('svgEval');
    svg.setAttribute('width', CANVAS_WIDTH);
    svg.setAttribute('height', CANVAS_HEIGHT);

    // This is hack that I haven't been able to fully understand. Furthermore,
    // it seems to break the functional blocks in some browsers. As such, I'm
    // just going to disable the hack for this app.
    Blockly.BROKEN_CONTROL_POINTS = false;

    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    //XXX Not sure if this is still right.
    Blockly.JavaScript.addReservedWords('Eval,code');

    Eval.expressions.target = generateExpressionFromBlockXml(level.solutionBlocks);
    Eval.drawExpressions();

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    dom.addClickTouchEvent(document.getElementById("continueButton"), function () {
      Eval.step(true);
    });

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Eval.resetButtonClick);
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
  Eval.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Eval.resetButtonClick = function () {
  var continueButton = document.getElementById('continueButton');
  // todo - single location for toggling hide state?
  continueButton.className += " hide";

  Eval.expressions.user = null;
  Eval.expressions.current = null;
  Eval.shownFeedback_ = false;

  Eval.drawExpressions();
};


function evalCode (code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Eval: api
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
  var expression = Eval.lastExpression;
  Eval.lastExpression = null;

  return expression;
}

/**
 * Execute the user's code.  Heaven help us...
 */
Eval.execute = function() {
  // todo (brent) perhaps try to share user vs. expected generation better
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  evalCode(code);

  if (!Eval.lastExpression) {
    Eval.lastExpression = new ExpressionNode(0);
  }

  Eval.expressions.user = Eval.lastExpression.clone();
  Eval.expressions.current = Eval.expressions.target.clone();

  Eval.expressions.user.applyExpectation(Eval.expressions.target);

  var result = !Eval.expressions.user.failedExpectation(true);

  var equivalent = Eval.expressions.user.isEquivalent(Eval.expressions.target);

  Eval.drawExpressions();

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  // todo (brent) - better way of doing this
  if (equivalent) {
    Eval.message = result ? "correct" : "expression equivalent";
  } else {
    Eval.message = null;
  }

  var reportData = {
    app: 'eval',
    level: level.id,
    builder: level.builder,
    result: result,
    testResult: result ? TestResults.ALL_PASS : TestResults.APP_SPECIFIC_FAIL,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);

  window.setTimeout(function () {
    Eval.step();
  }, 1000);
};

/**
 * Perform a step in our expression evaluation animation. This consists of
 * collapsing the next node in our tree. If that node failed expectations, we
 * will instead bring up a continue button, and refrain from further
 * collapses/animations until continue is pressed.
 */
Eval.step = function (ignoreFailures) {
  if (!Eval.expressions.user) {
    return;
  }

  if (!Eval.expressions.user.isOperation()) {
    displayFeedback();
    return;
  }

  var continueButton = document.getElementById('continueButton');

  var collapsed = Eval.expressions.user.collapse(ignoreFailures);
  if (!collapsed) {
    continueButton.className = continueButton.className.replace(/hide/g, "");
  } else {
    Eval.expressions.current.collapse();
    Eval.drawExpressions();

    continueButton.className += " hide";

    window.setTimeout(function () {
      Eval.step();
    }, 1000);
  }
};

/**
 * Draw the current state of our two expressions.
 */
Eval.drawExpressions = function () {
  var expected = Eval.expressions.current || Eval.expressions.target;
  var user = Eval.expressions.user;

  // todo - in cases where we have the wrong answer, marking the "next" operation
  // for both doesn't necessarily make sense, i.e.
  // goal: ((1 + 2) * (3 + 4))
  // user: (0 * (3 + 4))
  // right now, we'll highlight the 1 + 2 for goal, and the 3 + 4 for user

  expected.applyExpectation(expected);
  drawSvgExpression('answerExpression', expected, user !== null);

  if (user) {
    user.applyExpectation(expected);
    drawSvgExpression('userExpression', user, true);
  } else {
    clearSvgExpression('userExpression');
  }
};

function clearSvgExpression(elementId) {
  var g = document.getElementById(elementId);
  // remove all existing children, in reverse order so that we don't have to
  // worry about indexes changing
  for (var i = g.childNodes.length - 1; i >= 0; i--) {
    g.removeChild(g.childNodes[i]);
  }
}

function drawSvgExpression(elementId, expr, styleMarks) {
  var i, text, textLength, char;
  var g = document.getElementById(elementId);
  clearSvgExpression(elementId);

  var tokenList = expr.getTokenList(styleMarks);
  var xPos = 0;
  for (i = 0; i < tokenList.length; i++) {
    text = document.createElementNS(Blockly.SVG_NS, 'text');

    // getComputedTextLength doesn't respect trailing spaces, so we replace them
    // with _, evalulate our size, then return to the version with spaces.
    char = tokenList[i].char;
    text.textContent = char.replace(/ /g, '_');
    g.appendChild(text);
    // getComputedTextLength isn't available to us in our mochaTests
    textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;
    text.textContent = char;

    text.setAttribute('x', xPos + textLength / 2);
    text.setAttribute('text-anchor', 'middle');
    xPos += textLength;

    if (styleMarks && tokenList[i].marked) {
      if (char === '(' || char === ')') {
        text.setAttribute('class', 'highlightedParen');
      } else {
        text.setAttribute('class', 'exprMistake');
      }
    }
  }

  // center entire expression
  // todo (brent): handle case where expression is longer than width
  var width = g.getBoundingClientRect().width;
  var xPadding = (CANVAS_WIDTH - width) / 2;
  var currentTransform = g.getAttribute('transform');
  // IE has space separated args, others use comma to separate
  var newTransform = currentTransform.replace(/translate\(.*[,|\s]/,
    "translate(" + xPadding + ",");
  g.setAttribute('transform', newTransform);
}

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  if (!Eval.expressions.user.isOperation() && !Eval.shownFeedback_) {
    Eval.shownFeedback_ = true;
    BlocklyApps.displayFeedback({
      app: 'Eval',
      skin: skin.id,
      // feedbackType: Eval.testResults,
      message: Eval.message ? Eval.message : "todo (brent): wrong",
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
