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
var Token = ExpressionNode.Token;
var InputIterator = require('./inputIterator');

var TestResults = studioApp.TestResults;
var ResultType = studioApp.ResultType;

var level;
var skin;

studioApp.setCheckForEmptyBlocks(false);

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var LINE_HEIGHT = 20;

var appState = {
  targetSet: null,
  userSet: null,
  animating: false,
  response: null,
  message: null,
  result: null,
  testResults: null,
  currentAnimationDepth: 0,
  failedInput: null
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
  if (typeof(one) === 'string') {
    var marked = (one !== two && two !== undefined);
    return [new Token(one, marked)];
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

    appState.targetSet = generateEquationSetFromBlockXml(solutionBlocks);

    displayGoal(appState.targetSet);

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
 * @param {EquationSet} targetSet The target equation set.
 */
function displayGoal(targetSet) {
  var computeEquation = targetSet.computeEquation();
  if (!computeEquation || !computeEquation.expression) {
    return;
  }

  // If we have a single function, just show the evaluation
  // (i.e. compute expression). Otherwise show all equations.
  var tokenList;
  var nextRow = 0;
  var hasSingleFunction = targetSet.hasSingleFunction();
  if (!hasSingleFunction) {
    var sortedEquations = targetSet.sortedEquations();
    sortedEquations.forEach(function (equation) {
      if (equation.isFunction() && sortedEquations.length > 1) {
        throw new Error("Calc doesn't support goal with multiple functions or " +
          "mixed functions/vars");
      }

      tokenList = equation.expression.getTokenList(false);
      displayEquation('answerExpression', equation.signature, tokenList, nextRow++);
    });
  }

  tokenList = computeEquation.expression.getTokenList(false);
  var result = targetSet.evaluate();

  if (hasSingleFunction) {
    tokenList = tokenList.concat(getTokenList(' = ' + result.toString()));
  }
  displayEquation('answerExpression', computeEquation.signature, tokenList, nextRow);
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
 * Given some xml, geneates an expression set by loading blocks into the
 * blockspace.. Fails if there are already blocks in the workspace.
 */
function generateEquationSetFromBlockXml(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("generateTargetExpression shouldn't be called with blocks" +
        "if we already have blocks in the workspace");
    }
    // Temporarily put the blocks into the workspace so that we can generate code
    studioApp.loadBlocks(blockXml);
  }

  var equationSet = new EquationSet(Blockly.mainBlockSpace.getTopBlocks());

  Blockly.mainBlockSpace.getTopBlocks().forEach(function (block) {
    block.dispose();
  });

  return equationSet;
}

/**
 * Evaluates a target set against a user set when there is only one function.
 * It does this be feeding the function a set of values, and making sure
 * the target and user set evaluate to the same result for each.
 */
Calc.evaluateFunction_ = function (targetSet, userSet) {
  var outcome = {
    result: ResultType.UNSET,
    testResults: TestResults.NO_TESTS_RUN,
    message: undefined,
    failedInput: null
  };

  // if our target is a single function, we evaluate success by evaluating the
  // function with different inputs
  var expression = targetSet.computeEquation().expression.clone();

  // make sure our target/user calls look the same
  var userEquation = userSet.computeEquation();
  var userExpression = userEquation && userEquation.expression;
  if (!expression.hasSameSignature(userExpression) ||
    !userSet.hasSingleFunction()) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.LEVEL_INCOMPLETE_FAIL;
    return outcome;
  }

  // First evaluate both with the target set of inputs
  if (targetSet.evaluateWithExpression(expression) !==
      userSet.evaluateWithExpression(expression)) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.LEVEL_INCOMPLETE_FAIL;
    return outcome;
  }

  // At this point we passed using the target compute expression's inputs.
  // Now we want to use all combinations of inputs in the range [-100...100],
  // noting which set of inputs failed (if any)
  var possibleValues = _.range(1, 101).concat(_.range(-0, -101, -1));
  var numParams = expression.numChildren();
  var iterator = new InputIterator(possibleValues, numParams);

  var setChildToValue = function (val, index) {
    expression.setChildValue(index, val);
  };

  while (iterator.remaining() > 0 && !outcome.failedInput) {
    var values = iterator.next();
    values.forEach(setChildToValue);

    if (targetSet.evaluateWithExpression(expression) !==
        userSet.evaluateWithExpression(expression)) {
      outcome.failedInput = _.clone(values);
    }
  }

  if (outcome.failedInput) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
    outcome.message = calcMsg.failedInput();
  } else {
    outcome.result = ResultType.SUCCESS;
    outcome.testResults = TestResults.ALL_PASS;
  }
  return outcome;
};

Calc.evaluateResults_ = function (targetSet, userSet) {
  var identical, user, target;
  var outcome = {
    result: ResultType.UNSET,
    testResults: TestResults.NO_TESTS_RUN,
    message: undefined,
    failedInput: null
  };

  if (targetSet.hasSingleFunction()) {
    // Evaluate function by testing it with a series of inputs
    return Calc.evaluateFunction_(targetSet, userSet);
  } else if (userSet.hasVariablesOrFunctions() ||
      targetSet.hasVariablesOrFunctions()) {
    // We have multiple expressions. Either our set of expressions are equal,
    // or they're not.
    if (targetSet.isIdenticalTo(userSet)) {
      outcome.result = ResultType.SUCCESS;
      outcome.testResults = TestResults.ALL_PASS;
    } else {
      outcome.result = ResultType.FAILURE;
      outcome.testResults = TestResults.LEVEL_INCOMPLETE_FAIL;
    }
    return outcome;
  } else {
    // We have only a compute equation for each set. If they're not equal,
    // check to see whether they are equivalent (i.e. the same, but with
    // inputs ordered differently)
    user = userSet.computeEquation();
    target = targetSet.computeEquation();

    identical = targetSet.isIdenticalTo(userSet);
    if (identical) {
      outcome.result = ResultType.SUCCESS;
      outcome.testResults = TestResults.ALL_PASS;
    } else {
      outcome.result = ResultType.FAILURE;
      var levelComplete = (outcome.result === ResultType.SUCCESS);
      outcome.testResults = studioApp.getTestResults(levelComplete);
      if (target && user.expression &&
          user.expression.isEquivalentTo(target.expression)) {
        outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
        outcome.message = calcMsg.equivalentExpression();
      }
    }
    return outcome;
  }
};

/**
 * Execute the user's code.
 */
Calc.execute = function() {
  appState.userSet = new EquationSet(Blockly.mainBlockSpace.getTopBlocks());
  appState.failedInput = null;

  if (level.freePlay || level.edit_blocks) {
    appState.result = ResultType.SUCCESS;
    appState.testResults = TestResults.FREE_PLAY;
    appState.message = undefined;
  } else {
    var outcome = Calc.evaluateResults_(appState.targetSet, appState.userSet);
    appState.result = outcome.result;
    appState.testResults = outcome.testResults;
    appState.message = outcome.message;
    appState.failedInput = outcome.failedInput;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'calc',
    level: level.id,
    builder: level.builder,
    result: appState.result === ResultType.SUCCESS,
    testResult: appState.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  studioApp.report(reportData);

  appState.animating = true;
  if (appState.result === ResultType.SUCCESS &&
      !appState.userSet.hasVariablesOrFunctions() &&
      !level.edit_blocks) {
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
  var result;
  clearSvgUserExpression();

  var computeEquation = appState.userSet.computeEquation();
  if (computeEquation === null || computeEquation.expression === null) {
    return;
  }

  // in single function mode, we're only going to highlight the differences
  // in evaluation
  var hasSingleFunction = appState.targetSet.hasSingleFunction();

  var nextRow = 0;
  var tokenList;
  appState.userSet.sortedEquations().forEach(function (userEquation) {
    var expectedEquation = hasSingleFunction ? null :
      appState.targetSet.getEquation(userEquation.name);

    tokenList = getTokenList(userEquation, expectedEquation);

    displayEquation('userExpression', userEquation.signature, tokenList, nextRow++,
      'errorToken');
  });

  // Now display our compute equation and the result of evaluating it
  var computeType = computeEquation && computeEquation.expression.getType();
  if (computeType === ExpressionNode.ValueType.FUNCTION_CALL ||
      computeType === ExpressionNode.ValueType.VARIABLE) {
    var targetEquation = appState.targetSet.computeEquation();

    // We're either a variable or a function call. Generate a tokenList (since
    // we could actually be different than the goal)
    tokenList = getTokenList(computeEquation, targetEquation);

    result = appState.userSet.evaluate().toString();
    var expectedResult = appState.targetSet.computeEquation() === null ?
      result : appState.targetSet.evaluate().toString();

    tokenList = tokenList.concat(getTokenList(' = '),
      getTokenList(result, expectedResult));
  } else {
    tokenList = getTokenList(computeEquation, appState.targetSet.computeEquation());
  }

  displayEquation('userExpression', null, tokenList, nextRow++, 'errorToken');

  if (appState.failedInput) {
    var expression = computeEquation.expression.clone();
    for (var c = 0; c < expression.numChildren(); c++) {
      expression.setChildValue(c, appState.failedInput[c]);
    }
    result = appState.userSet.evaluateWithExpression(expression).toString();

    tokenList = getTokenList(expression)
      .concat(getTokenList(' = '))
      .concat(getTokenList(result, ' ')); // this should always be marked
    displayEquation('userExpression', null, tokenList, nextRow++, 'errorToken');
  }
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
 * @returns True if it couldn't collapse any further at this depth.
 */
function animateUserExpression (maxNumSteps) {
  var userEquation = appState.userSet.computeEquation();
  if (!userEquation) {
    throw new Error('require user expression');
  }
  var userExpression = userEquation.expression;
  if (!userExpression) {
    return true;
  }

  var finished = false;

  if (appState.userSet.hasVariablesOrFunctions() ||
    appState.targetSet.hasVariablesOrFunctions()) {
    throw new Error("Can't animate if either user/target have functions/vars");
  }

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
  if (name) {
    len = addText(g, (name + ' = '), xPos, null);
    xPos += len;
  }

  for (var i = 0; i < tokenList.length; i++) {
    len = addText(g, tokenList[i].str, xPos, tokenList[i].marked && markClass);
    xPos += len;
  }

  var xPadding = (CANVAS_WIDTH - g.getBoundingClientRect().width) / 2;
  var yPos = (line * LINE_HEIGHT);
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
function displayFeedback() {
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
}

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

/* start-test-block */
// export private function(s) to expose to unit testing
Calc.__testonly__ = {
  displayGoal: displayGoal
};
/* end-test-block */
