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
var studioApp = require('../StudioApp').singleton;
var Calc = module.exports;
var commonMsg = require('../../locale/current/common');
var calcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var api = require('./api');
var page = require('../templates/page.html');
var dom = require('../dom');
var blockUtils = require('../block_utils');
var _ = require('../utils').getLodash();
var timeoutList = require('../timeoutList');

var ExpressionNode = require('./expressionNode');
var EquationSet = require('./equationSet');

var TestResults = studioApp.TestResults;
var ResultType = studioApp.ResultType;

var level;
var skin;

studioApp.setCheckForEmptyBlocks(false);

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var appState = {
  targetSet: null,
  userSet: null,
  animating: false,
  response: null,
  message: null,
  result: null,
  testResults: null,
  currentAnimationDepth: 0
};

var stepSpeed = 2000;

/**
 * Get a token list for an equation, expression, or string. If input(s) are not
 * expressions, we convert to expressions.
 * If two inputs are given, we get the diff.
 * If one input is given, we return the tokenlist for that input.
 */
function getTokenList(one, two) {
  if (one instanceof EquationSet.Equation) {
    one = one.expression;
  }
  if (two instanceof EquationSet.Equation) {
    two = two.expression;
  }
  // TODO - this is a kind of hacky way to do this
  if (typeof(one) === 'string') {
    one = new ExpressionNode(one);
  }
  if (typeof(two) === 'string') {
    two = new ExpressionNode(two);
  }

  if (!one) {
    return null;
  } else if (!two) {
    return one.getTokenList(false);
  } else {
    return one.getTokenListDiff(two);
  }
}

/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function(config) {

  skin = config.skin;
  level = config.level;

  // Does our level have functions, in which case we operate slightly differently
  Calc.functionMode_ = false;

  if (level.scale && level.scale.stepSpeed !== undefined) {
    stepSpeed = level.scale.stepSpeed;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_compute';
  config.enableShowCode = false;

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({
        assetUrl: studioApp.assetUrl
      }),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
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

    appState.targetSet = generateExpressionsFromBlockXml(solutionBlocks);

    displayGoal();

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's studioApp.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Calc.resetButtonClick);
  };

  studioApp.init(config);
};

/**
 * A few possible scenarios
 * (1) We don't have a target compute expression (i.e. freeplay). Show nothing.
 * (2) We have a target compute expression, one function, and no variables.
 *     Show the compute expression + evaluation, and nothing else
 * (3) We have a target compute expression, and possibly some number of
 *     variables, but no functions. Display compute expression and variables
 * (4) We have a target compute expression, and either multiple functions or
 *     one function and variable(s). Currently not supported.
 */
function displayGoal() {
  var computeEquation = appState.targetSet.computeEquation();
  if (!computeEquation || !computeEquation.expression) {
    return;
  }

  // If we have a function, just show the evaluation (i.e. compute expression)
  var singleFunction = appState.targetSet.singleFunction();
  var tokenList;
  var nextRow = 0;
  if (singleFunction === null) {
    var sortedEquations = appState.targetSet.sortedEquations();
    sortedEquations.forEach(function (equation) {
      tokenList = equation.expression.getTokenList(false);
      displayEquation('answerExpression', equation.name, tokenList, nextRow++);
    });
  }

  tokenList = computeEquation.expression.getTokenList(false);
  var result = appState.targetSet.evaluate();

  tokenList = tokenList.concat(getTokenList(' = ' + result.toString()));
  displayEquation('answerExpression', computeEquation.name, tokenList, nextRow);
}

/**
 * Click the run button.  Start the program.
 */
studioApp.runButtonClick = function() {
  studioApp.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp.attempts++;
  Calc.execute();
};

/**
 * App specific reset button click logic.  studioApp.resetButtonClick will be
 * called first.
 */
Calc.resetButtonClick = function () {
  appState.message = null;
  appState.currentAnimationDepth = 0;
  timeoutList.clearTimeouts();

  appState.animating = false;

  clearSvgUserExpression();
};

/**
 * Generate a set of expressions from the blocks currently in the workspace.
 * @returns  an object in which keys are expression names (or COMPUTE_NAME for
 * the base expression), and values are the expressions
 */
function generateExpressionsFromTopBlocks() {
  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  return EquationSet.fromBlocks(topBlocks);
}

/**
 * Given some xml, generates a set of expressions by loading the xml into the
 * workspace and calling generateExpressionsFromTopBlocks. Fails if there are
 * already blocks in the workspace.
 */
function generateExpressionsFromBlockXml(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("generateTargetExpression shouldn't be called with blocks" +
        "if we already have blocks in the workspace");
    }
    // Temporarily put the blocks into the workspace so that we can generate code
    studioApp.loadBlocks(blockXml);
  }

  var equationSet = generateExpressionsFromTopBlocks();

  Blockly.mainBlockSpace.getTopBlocks().forEach(function (block) {
    block.dispose();
  });

  return equationSet;
}

function evaluateResults(targetSet, userSet) {
  var identical, user, target, levelComplete;
  var outcome = {
    result: ResultType.UNSET,
    testResults: TestResults.NO_TESTS_RUN,
    message: undefined
  };

  var singleFunction = targetSet.singleFunction();
  if (singleFunction) {
    // evaluate test cases
    throw new Error('nye');
  } else if (userSet.hasVariablesOrFunctions()) {
    // TODO - make sure i test the case where target doesnt and user does have vars/funcs
    identical = targetSet.isIdenticalTo(userSet);
    outcome.result = identical ? ResultType.SUCCESS : ResultType.FAILURE;
  } else {
    user = userSet.computeEquation();
    target = targetSet.computeEquation();

    identical = targetSet.isIdenticalTo(userSet);
    if (identical) {
      outcome.result = ResultType.SUCCESS;
      outcome.testResults = TestResults.ALL_PASS;
    } else {
      outcome.result = ResultType.FAILURE;
      if (target && user.expression &&
          user.expression.isEquivalentTo(target.expression)) {
        outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
        outcome.message = calcMsg.equivalentExpression();
      } else {
        levelComplete = (outcome.result === ResultType.SUCCESS);
        outcome.testResults = studioApp.getTestResults(levelComplete);
      }
    }
  }

  return outcome;
}

/**
 * Execute the user's code.
 */
Calc.execute = function() {
  appState.userSet = generateExpressionsFromTopBlocks();

  if (level.freePlay) {
    appState.result = ResultType.SUCCESS;
    appState.testResults = TestResults.FREE_PLAY;
    appState.message = undefined;
  } else {
    var outcome = evaluateResults(appState.targetSet, appState.userSet);
    appState.result = outcome.result;
    appState.testResults = outcome.testResults;
    appState.message = outcome.message;
  }

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

  studioApp.report(reportData);

  appState.animating = true;
  if (appState.result == ResultType.SUCCESS &&
      !appState.userSet.hasVariablesOrFunctions()) {
    Calc.step();
  } else {
    displayComplexUserExpressions();
    timeoutList.setTimeout(function () {
      stopAnimatingAndDisplayFeedback();
    }, stepSpeed);
  }
};

/**
 * If we have any functions or variables in our expression set, we don't support
 * animating evaluation.
 */
function displayComplexUserExpressions () {
  clearSvgUserExpression();

  var computeEquation = appState.userSet.computeEquation();

  if (computeEquation === null || computeEquation.expression === null) {
    return;
  }

  // in single function mode, we're only going to highlight the differences
  // in evaluation
  var hasSingleFunction = appState.targetSet.singleFunction() !== null;

  var nextRow = 0;
  var tokenList;
  appState.userSet.sortedEquations().forEach(function (userEquation) {
    var expectedEquation = hasSingleFunction ? null :
      appState.targetSet.getEquation(userEquation.name);

    tokenList = getTokenList(userEquation, expectedEquation);

    displayEquation('userExpression', userEquation.name, tokenList, nextRow++,
      'errorToken');
  });

  var computeType = computeEquation && computeEquation.expression.getType();
  if (computeType === ExpressionNode.ValueType.FUNCTION_CALL ||
      computeType === ExpressionNode.ValueType.VARIABLE) {
    var targetEquation = appState.targetSet.computeEquation();

    // We're either a variable or a function call. Generate a tokenList (since
    // we could actually be different than the goal)
    tokenList = getTokenList(computeEquation, targetEquation);

    var result = appState.userSet.evaluate().toString();
    var expectedResult = appState.targetSet.evaluate().toString();

    tokenList = tokenList.concat(getTokenList(' = '),
      getTokenList(result, expectedResult));
  } else {
    tokenList = getTokenList(computeEquation, appState.targetSet.computeEquation);
  }

  displayEquation('userExpression', null, tokenList, nextRow, 'errorToken');
}

function stopAnimatingAndDisplayFeedback() {
  appState.animating = false;
  displayFeedback();
}

/**
 * Perform a step in our expression evaluation animation. This consists of
 * collapsing the next node in our tree. If that node failed expectations, we
 * will stop further evaluation.
 */
Calc.step = function () {
  if (animateUserExpression(appState.currentAnimationDepth)) {
    stopAnimatingAndDisplayFeedback();
    return;
  }
  appState.currentAnimationDepth++;

  timeoutList.setTimeout(function () {
    Calc.step();
  }, stepSpeed);
};

function clearSvgUserExpression() {
  var g = document.getElementById('userExpression');
  // remove all existing children, in reverse order so that we don't have to
  // worry about indexes changing
  for (var i = g.childNodes.length - 1; i >= 0; i--) {
    g.removeChild(g.childNodes[i]);
  }
}

/**
 * Draws a user expression and each step collapsing it, up to given depth.
 * Returns true if it couldn't collapse any further at this depth.
 */
function animateUserExpression (maxNumSteps) {
  var finished = false;

  if (appState.userSet.hasVariablesOrFunctions() ||
    appState.targetSet.hasVariablesOrFunctions()) {
    throw new Error("Can't animate if either user/target have functions/vars");
  }

  var userEquation = appState.userSet.computeEquation();
  if (!userEquation) {
    throw new Error('require user expression');
  }
  var userExpression = userEquation.expression;

  clearSvgUserExpression();

  var current = userExpression.clone();
  var previousExpression = current;
  var currentDepth = 0;
  for (var currentStep = 0; currentStep <= maxNumSteps && !finished; currentStep++) {
    var tokenList;
    if (currentDepth === maxNumSteps) {
      tokenList = current.getTokenListDiff(previousExpression);
    } else if (currentDepth + 1 === maxNumSteps) {
      var deepest = current.getDeepestOperation();
      if (deepest) {
        studioApp.highlight('block_id_' + deepest.blockId);
      }
      tokenList = current.getTokenList(true);
    } else {
      tokenList = current.getTokenList(false);
    }
    displayEquation('userExpression', null, tokenList, currentDepth, 'markedToken');
    previousExpression = current.clone();
    if (current.collapse()) {
      currentDepth++;
    } else if (currentStep - currentDepth > 2) {
      // we want to go one more step after the last collapse so that we show
      // our last line without highlighting it
      finished = true;
    }
  }



  return finished;
}

/**
 * Append a tokenList to the given parent element
 * @param {string} parentId Id of parent element
 * @param {string} name Name of the function/variable. Null if base expression.
 * @param {Array<Object>} tokenList A list of tokens, representing the expression
 * @param {number} line How many lines deep into parent to display
 * @param {string} markClass Css class to use for 'marked' tokens.
 */
function displayEquation(parentId, name, tokenList, line, markClass) {
  var parent = document.getElementById(parentId);

  var g = document.createElementNS(Blockly.SVG_NS, 'g');
  parent.appendChild(g);
  var xPos = 0;
  var len;
  // TODO (brent) in the case of functions, really we'd like the name to also be
  // a tokenDiff - i.e. if target is foo(x,y) and user expression is foo(y, x)
  // we'd like to highlight the differences
  if (name) {
    len = addText(g, (name + ' = '), xPos, null);
    xPos += len;
  }

  for (var i = 0; i < tokenList.length; i++) {
    len = addText(g, tokenList[i].str, xPos, tokenList[i].marked && markClass);
    xPos += len;
  }

  // todo (brent): handle case where expression is longer than width
  var xPadding = (CANVAS_WIDTH - g.getBoundingClientRect().width) / 2;
  var yPos = (line * 20); // TODO - this shouldnt be hardcoded
  g.setAttribute('transform', 'translate(' + xPadding + ', ' + yPos + ')');
}

/**
 * Add some text to parent element at given xPos with css class className
 */
function addText(parent, str, xPos, className) {
  var text, textLength;
  text = document.createElementNS(Blockly.SVG_NS, 'text');
  // getComputedTextLength doesn't respect trailing spaces, so we replace them
  // with _, calculate our size, then return to the version with spaces.
  text.textContent = str.replace(/ /g, '_');
  parent.appendChild(text);
  // getComputedTextLength isn't available to us in our mochaTests
  textLength = text.getComputedTextLength ? text.getComputedTextLength() : 0;
  text.textContent = str;

  text.setAttribute('x', xPos + textLength / 2);
  text.setAttribute('text-anchor', 'middle');
  if (className) {
    text.setAttribute('class', className);
  }

  return textLength;
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
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!appState.response || appState.animating) {
    return;
  }

  // override extra top blocks message
  level.extraTopBlocks = calcMsg.extraTopBlocks();
  var appDiv = null;
  // Show svg in feedback dialog
  appDiv = cloneNodeWithoutIds('svgCalc');
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

  studioApp.displayFeedback(options);
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
