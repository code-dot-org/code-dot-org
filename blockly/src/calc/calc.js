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
var blockUtils = require('../block_utils');

var ExpressionNode = require('./expressionNode');
var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var appState = {
  animating: false,
  response: null,
  message: null,
  result: null,
  testResults: null
};

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

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_compute';
  config.enableShowCode = false;

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
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    var svg = document.getElementById('svgCalc');
    svg.setAttribute('width', CANVAS_WIDTH);
    svg.setAttribute('height', CANVAS_HEIGHT);

    if (level.freePlay) {
      document.getElementById('goalHeader').setAttribute('visibility', 'hidden');
    }

    // This is hack that I haven't been able to fully understand. Furthermore,
    // it seems to break the functional blocks in some browsers. As such, I'm
    // just going to disable the hack for this app.
    Blockly.BROKEN_CONTROL_POINTS = false;

    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Calc,code');

    var solutionBlocks = level.solutionBlocks;
    if (level.solutionBlocks && level.solutionBlocks !== '') {
      solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks,
        config.forceInsertTopBlock);
    }
    Calc.expressions.target = getExpressionFromBlocks(solutionBlocks);
    Calc.drawExpressions();

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Calc.resetButtonClick);
  };

  BlocklyApps.init(config);
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  BlocklyApps.attempts++;
  Calc.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Calc.resetButtonClick = function () {
  Calc.expressions.user = null;
  Calc.expressions.current = null;
  appState.message = null;

  appState.animating = false;

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
 * Generates an ExpressionNode from the blocks in the workspace. If blockXml
 * is provided, temporarily sticks those blocks into the workspace to generate
 * the ExpressionNode, then deletes blocks.
 */

function getExpressionFromBlocks(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("getExpressionFromBlocks shouldn't be called with blocks if " +
        "we already have blocks in the workspace");
    }
    // Temporarily put the blocks into the workspace so that we can generate code
    BlocklyApps.loadBlocks(blockXml);
  }

  var code = Blockly.Generator.blockSpaceToCode('JavaScript', ['functional_compute', 'functional_definition']);
  evalCode(code);
  var object = Calc.computedExpression;
  Calc.computedExpression = null;

  if (blockXml) {
    // Remove the blocks
    Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) { b.dispose(); });
  }

  return object;
}

/**
 * Execute the user's code.  Heaven help us...
 */
Calc.execute = function() {
  appState.result = BlocklyApps.ResultType.UNSET;
  appState.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  appState.message = undefined;

  var userExpression = getExpressionFromBlocks();
  if (userExpression) {
    Calc.expressions.user = userExpression.clone();
  } else {
    Calc.expressions.user = new ExpressionNode(0);
  }

  if (Calc.expressions.target) {
    Calc.expressions.current = Calc.expressions.target.clone();
    Calc.expressions.user.applyExpectation(Calc.expressions.target);
  }

  // todo - should this be using ResultType.* instead?
  appState.result = !Calc.expressions.user.failedExpectation(true);
  appState.testResults = BlocklyApps.getTestResults(appState.result);

  // equivalence means the expressions are the same if we ignore the ordering
  // of inputs
  if (!appState.result && Calc.expressions.user.isEquivalent(Calc.expressions.target)) {
    appState.testResults = TestResults.APP_SPECIFIC_FAIL;
    appState.message = calcMsg.equivalentExpression();
  }

  if (level.freePlay) {
    appState.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  Calc.drawExpressions();

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'calc',
    level: level.id,
    builder: level.builder,
    result: appState.result,
    testResult: appState.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);
  appState.animating = true;

  window.setTimeout(function () {
    Calc.step(false);
  }, 1000);
};

function stopAnimatingAndDisplayFeedback() {
  appState.animating = false;
  displayFeedback();
}

/**
 * Perform a step in our expression evaluation animation. This consists of
 * collapsing the next node in our tree. If that node failed expectations, we
 * will stop further evaluation.
 */
Calc.step = function (ignoreFailures) {
  if (!Calc.expressions.user) {
    return;
  }

  // If we've fully collapsed our expression, display feedback
  if (!Calc.expressions.user.isOperation()) {
    stopAnimatingAndDisplayFeedback();
    return;
  }

  var collapsed = Calc.expressions.user.collapse(ignoreFailures);
  if (!collapsed) {
    stopAnimatingAndDisplayFeedback();
    return;
  } else {
    if (Calc.expressions.current) {
      Calc.expressions.current.collapse();
    }
    Calc.drawExpressions();

    window.setTimeout(function () {
      Calc.step(false);
    }, 1000);
  }
};

/**
 * Draw the current state of our two expressions.
 */
Calc.drawExpressions = function () {
  var expected = Calc.expressions.current || Calc.expressions.target;
  var user = Calc.expressions.user;

  // todo - in cases where we have the wrong answer, marking the "next" operation
  // for both doesn't necessarily make sense, i.e.
  // goal: ((1 + 2) * (3 + 4))
  // user: (0 * (3 + 4))
  // right now, we'll highlight the 1 + 2 for goal, and the 3 + 4 for user

  if (expected) {
    expected.applyExpectation(expected);
    drawSvgExpression('answerExpression', expected, user !== null);
  }

  if (user) {
    if (expected) {
      user.applyExpectation(expected);
    }
    drawSvgExpression('userExpression', user, true);
    var deepest = user.getDeepestOperation();
    BlocklyApps.highlight(deepest ? deepest.blockId : null);
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
    // with _, calculate our size, then return to the version with spaces.
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
 * Deep clone a node, then removing any ids from the clone so that we don't have
 * duplicated ids.
 */
function cloneNodeWithoutIds(elementId) {
  var clone = document.getElementById(elementId).cloneNode(true);
  var descendants = clone.getElementsByTagName("*");
  for (var i = 0; i < descendants.length; i++) {
    var element = descendants[i];
    element.removeAttribute("id");
  }

  return clone;
}

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!appState.response || appState.animating) {
    return;
  }

  // override extra top blocks message
  level.extraTopBlocks = calcMsg.extraTopBlocks();
  var appDiv = null;
  // Show svg in feedback dialog
  if (appState.testResults === TestResults.LEVEL_INCOMPLETE_FAIL) {
    appDiv = cloneNodeWithoutIds('svgCalc');
  }
  var options = {
    app: 'Calc',
    skin: skin.id,
    response: appState.response,
    level: level,
    feedbackType: appState.testResults,
    appStrings: {
      reinfFeedbackMsg: calcMsg.reinfFeedbackMsg()
    },
    appDiv: appDiv
  };
  if (appState.message) {
    options.message = appState.message;
  }

  BlocklyApps.displayFeedback(options);
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
function onReportComplete(response) {
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  appState.response = response;
  displayFeedback();
}
