require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({47:[function(require,module,exports){
var appMain = require('../appMain');
window.Calc = require('./calc');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.calcMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Calc, levels, options);
};

},{"../appMain":5,"../skins":207,"./blocks":38,"./calc":39,"./levels":46}],39:[function(require,module,exports){
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
var jsnums = require('./js-numbers/js-numbers.js');
var commonMsg = require('../../locale/current/common');
var calcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var page = require('../templates/page.html');
var dom = require('../dom');
var blockUtils = require('../block_utils');
var utils = require('../utils');
var _ = utils.getLodash();
var timeoutList = require('../timeoutList');

var ExpressionNode = require('./expressionNode');
var EquationSet = require('./equationSet');
var Equation = require('./equation');
var Token = require('./token');
var InputIterator = require('./inputIterator');

var TestResults = studioApp.TestResults;
var ResultType = studioApp.ResultType;

var level;
var skin;

studioApp.setCheckForEmptyBlocks(false);

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var LINE_HEIGHT = 24;

var appState = {
  targetSet: null,
  userSet: null,
  animating: false,
  waitingForReport: false,
  response: null,
  message: null,
  result: null,
  testResults: null,
  failedInput: null
};
Calc.appState_ = appState;

var stepSpeed = 2000;

/**
 * Construct a token list from on or two values. If one value is given, that
 * token list is just the set of unmarked tokens. If two values are given, the
 * generated token list has difference marked. Inputs are first converted to
 * ExpressionNodes to allow for token list generation.
 * @param {ExpressionNode|Equation|jsnumber|string} one
 * @param {ExpressionNode|Equation|jsnumber|string} two
 * @param {boolean} markDeepest Only valid if we have a single input. Passed on
 *   to getTokenList.
 * @returns {Token[]}
 */
function constructTokenList(one, two, markDeepest) {
  one = asExpressionNode(one);
  two = asExpressionNode(two);

  markDeepest = utils.valueOr(markDeepest, false);

  var tokenList;

  if (!one) {
    return null;
  } else if (!two) {
    tokenList = one.getTokenList(markDeepest);
  } else {
    tokenList = one.getTokenListDiff(two);
  }

  return ExpressionNode.stripOuterParensFromTokenList(tokenList);
}

/**
 * Converts a val to an ExpressionNode for the purpose of generating a token
 * list.
 * @param {ExpressionNode|Equation|jsnumber|string} val
 * @returns {ExpressionNode}
 */
function asExpressionNode(val) {
  if (val === null || val === undefined) {
    return val;
  }
  if (val instanceof ExpressionNode) {
    return val;
  }
  if (val instanceof Equation) {
    return val.expression;
  }
  // It's perhaps a little weird to convert a string like "= " into an
  // ExpressionNode (which I believe will treat this as a variable), but this
  // allows us to more easily generate a tokenList in a consistent manner.
  if (jsnums.isSchemeNumber(val) || typeof(val) === 'string') {
    return new ExpressionNode(val);
  }
  throw new Error('unexpected');
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
      blockCounterClass : 'block-counter-default',
      inputOutputTable: level.inputOutputTable
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
      var background = document.getElementById('background');
      background.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        '/blockly/media/skins/calc/background_freeplay.png');
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
 * (3) We have a target compute expression that is just a single variable, and
 *     some number of additional variables, but no functions. Display only
 *     the name of the single variable
 * (4) We have a target compute expression that is not a single variable, and
 *     possible some number of additional variables, but no functions. Display
 *     compute expression and variables.
 * (5) We have a target compute expression, and either multiple functions or
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
  var computesFunction = targetSet.computesFunctionCall();
  if (!computesFunction && !targetSet.computesSingleVariable()) {
    var sortedEquations = targetSet.sortedEquations();
    sortedEquations.forEach(function (equation) {
      if (equation.isFunction() && sortedEquations.length > 1) {
        throw new Error("Calc doesn't support goal with multiple functions or " +
          "mixed functions/vars");
      }

      tokenList = constructTokenList(equation);
      displayEquation('answerExpression', equation.signature, tokenList, nextRow++);
    });
  }

  tokenList = constructTokenList(computeEquation);
  var evaluation = targetSet.evaluate();
  if (evaluation.err) {
    throw evaluation.err;
  }

  if (computesFunction) {
    tokenList.push(new Token(' = ', false));
    tokenList.push(new Token(evaluation.result, false));
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
  appState.animating = false;
  appState.waitingForReport = false;
  appState.response = null;
  appState.message = null;
  appState.result = null;
  appState.testResults = null;
  appState.failedInput = null;

  timeoutList.clearTimeouts();

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
    !userSet.computesFunctionCall()) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.LEVEL_INCOMPLETE_FAIL;

    var targetFunctionName = expression.getValue();
    if (!userSet.getEquation(targetFunctionName)) {
      outcome.message = calcMsg.missingFunctionError({
        functionName: targetFunctionName
      });
    }

    return outcome;
  }

  // First evaluate both with the target set of inputs
  var targetEvaluation = targetSet.evaluateWithExpression(expression);
  var userEvaluation = userSet.evaluateWithExpression(expression);
  if (targetEvaluation.err || userEvaluation.err) {
    return divZeroOrFailure(targetEvaluation.err || userEvaluation.err);
  }
  if (!jsnums.equals(targetEvaluation.result, userEvaluation.result)) {
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

    targetEvaluation = targetSet.evaluateWithExpression(expression);
    userEvaluation = userSet.evaluateWithExpression(expression);
    if (targetEvaluation.err || userEvaluation.err) {
      return divZeroOrFailure(targetEvaluation.err || userEvaluation.err);
    }
    if (!jsnums.equals(targetEvaluation.result, userEvaluation.result)) {
      outcome.failedInput = _.clone(values);
    }
  }

  if (outcome.failedInput) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
    outcome.message = calcMsg.failedInput();
  } else if (!targetSet.computeEquation().expression.isIdenticalTo(
      userSet.computeEquation().expression)) {
    // we have the right function, but are calling with the wrong inputs
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
    outcome.message = calcMsg.wrongInput();
  } else {
    outcome.result = ResultType.SUCCESS;
    outcome.testResults = TestResults.ALL_PASS;
  }
  return outcome;
};

function appSpecificFailureOutcome(message, failedInput) {
  return {
    result: ResultType.FAILURE,
    testResults: TestResults.APP_SPECIFIC_FAIL,
    message: message,
    failedInput: utils.valueOr(failedInput, null)
  };
}

/**
 * Looks to see if given error is a divide by zero error. If it is, we fail
 * with an app specific method. If not, we throw a standard failure
 */
function divZeroOrFailure(err) {
  if (err instanceof ExpressionNode.DivideByZeroError) {
    return appSpecificFailureOutcome(calcMsg.divideByZeroError(), null);
  }

  // One way we know we can fail is with infinite recursion. Log if we fail
  // for some other reason
  if (!utils.isInfiniteRecursionError(err)) {
    console.log('Unexpected error: ' + err);
  }

  return {
    result: ResultType.FAILURE,
    testResults: TestResults.LEVEL_INCOMPLETE_FAIL,
    message: null,
    failedInput: null
  };
}

/**
 * Evaluates a target set against a user set when our compute expression is
 * just a naked variable. It does this by looking for a constant in the
 * equation set, and then validating that (a) we have a variable of the same
 * name in the user set and (b) that changing that value in both sets still
 * results in the same evaluation
 */
Calc.evaluateSingleVariable_ = function (targetSet, userSet) {
  var outcome = {
    result: ResultType.UNSET,
    testResults: TestResults.NO_TESTS_RUN,
    message: undefined,
    failedInput: null
  };

  if (!targetSet.computeEquation().expression.isIdenticalTo(
      userSet.computeEquation().expression)) {
    return appSpecificFailureOutcome(calcMsg.levelIncompleteError());
  }

  // Make sure our target set has a constant variable we can use as our
  // pseudo input
  var targetConstants = targetSet.getConstants();
  if (targetConstants.length === 0) {
    throw new Error('Unexpected: single variable with no constants');
  }

  // The code is in place to theoretically support varying multiple constants,
  // but we decided we don't need to support that, so I'm going to explicitly
  // disallow it to reduce the test matrix.
  if (targetConstants.length !== 1) {
    throw new Error('No support for multiple constants');
  }

  // Make sure each of our pseudo inputs has a corresponding variable in the
  // user set.
  var userConstants = userSet.getConstants();
  var userConstantNames = userConstants.map(function (item) {
    return item.name;
  });

  for (var i = 0; i < targetConstants.length; i++) {
    if (userConstantNames.indexOf(targetConstants[i].name) === -1) {
      return appSpecificFailureOutcome(calcMsg.missingVariableX(
        {var: targetConstants[i].name}));
    }
  }

  // Check to see that evaluating target set with the user value of the constant(s)
  // gives the same result as evaluating the user set.
  var evaluation = userSet.evaluate();
  if (evaluation.err) {
    return divZeroOrFailure(evaluation.err);
  }
  var userResult = evaluation.result;

  var targetClone = targetSet.clone();
  var userClone = userSet.clone();
  var setConstantsToValue = function (val, index) {
    var name = targetConstants[index].name;
    targetClone.getEquation(name).expression.setValue(val);
    userClone.getEquation(name).expression.setValue(val);
  };

  evaluation = targetSet.evaluate();
  if (evaluation.err) {
    throw evaluation.err;
  }
  var targetResult = evaluation.result;

  if (!jsnums.equals(userResult, targetResult)) {
    // Our result can different from the target result for two reasons
    // (1) We have the right equation, but our "constant" has a different value.
    // (2) We have the wrong equation
    // Check to see if we evaluate to the same as target if we give it the
    // values from our userSet.
    targetConstants.forEach(function (item, index) {
      var name = item.name;
      var val = userClone.getEquation(name).expression.evaluate().result;
      setConstantsToValue(val, index);
    });

    evaluation = targetClone.evaluate();
    if (evaluation.err) {
      return divZeroOrFailure(evaluation.err);
    }
    if (!jsnums.equals(userResult, evaluation.result)) {
      return appSpecificFailureOutcome(calcMsg.wrongResult());
    }
  }

  // The user got the right value for their input. Let's try changing it and
  // see if they still get the right value
  var possibleValues = _.range(1, 101).concat(_.range(-0, -101, -1));
  var numParams = targetConstants.length;
  var iterator = new InputIterator(possibleValues, numParams);

  while (iterator.remaining() > 0 && !outcome.failedInput) {
    var values = iterator.next();
    values.forEach(setConstantsToValue);

    var targetEvaluation = targetClone.evaluate();
    var userEvaluation = userClone.evaluate();
    var err = targetEvaluation.err || userEvaluation.err;
    if (err) {
      return divZeroOrFailure(err);
    }

    if (!jsnums.equals(targetEvaluation.result, userEvaluation.result)) {
      outcome.failedInput = _.clone(values);
    }
  }

  if (outcome.failedInput) {
    var message = calcMsg.wrongOtherValuesX({var: targetConstants[0].name});
    return appSpecificFailureOutcome(message, outcome.failedInput);
  }

  outcome.result = ResultType.SUCCESS;
  outcome.testResults = TestResults.ALL_PASS;
  return outcome;
};

/**
 * @static
 * @returns outcome object
 */
Calc.evaluateResults_ = function (targetSet, userSet) {
  var identical, user, target;
  var outcome = {
    result: ResultType.UNSET,
    testResults: TestResults.NO_TESTS_RUN,
    message: undefined,
    failedInput: null
  };

  if (targetSet.computesFunctionCall()) {
    // Evaluate function by testing it with a series of inputs
    return Calc.evaluateFunction_(targetSet, userSet);
  } else if (targetSet.computesSingleVariable()) {
    return Calc.evaluateSingleVariable_(targetSet, userSet);
  } else if (userSet.hasVariablesOrFunctions() ||
      targetSet.hasVariablesOrFunctions()) {

    // We have multiple expressions. Either our set of expressions are equal,
    // or they're not.
    if (targetSet.isIdenticalTo(userSet)) {
      outcome.result = ResultType.SUCCESS;
      outcome.testResults = TestResults.ALL_PASS;
    } else if (targetSet.isEquivalentTo(userSet)) {
      outcome.result = ResultType.FAILURE;
      outcome.testResults = TestResults.APP_SPECIFIC_FAIL;
      outcome.message = calcMsg.equivalentExpression();
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
  Calc.generateResults_();

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

  appState.waitingForReport = true;
  studioApp.report(reportData);

  studioApp.playAudio(appState.result === ResultType.SUCCESS ? 'win' : 'failure');

  // Display feedback immediately
  if (isPreAnimationFailure(appState.testResults)) {
    return displayFeedback();
  }

  appState.animating = true;
  if (appState.result === ResultType.SUCCESS &&
      appState.userSet.isAnimatable() &&
      !level.edit_blocks) {
    Calc.step(0);
  } else {
    displayComplexUserExpressions();
    timeoutList.setTimeout(function () {
      stopAnimatingAndDisplayFeedback();
    }, stepSpeed);
  }
};

function isPreAnimationFailure(testResult) {
  return testResult === TestResults.QUESTION_MARKS_IN_NUMBER_FIELD ||
    testResult === TestResults.EMPTY_FUNCTIONAL_BLOCK ||
    testResult === TestResults.EXTRA_TOP_BLOCKS_FAIL;
}

/**
 * Fill appState with the results of program execution.
 * @static
 */
Calc.generateResults_ = function () {
  appState.message = undefined;

  // Check for pre-execution errors
  if (studioApp.hasExtraTopBlocks()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.EXTRA_TOP_BLOCKS_FAIL;
    return;
  }

  if (studioApp.hasUnfilledFunctionalBlock()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.EMPTY_FUNCTIONAL_BLOCK;

    // Gate message on whether or not it's the compute block that's empty
    var compute = _.find(Blockly.mainBlockSpace.getTopBlocks(), function (item) {
      return item.type === 'functional_compute';
    });
    if (compute && !compute.getInputTargetBlock('ARG1')) {
      appState.message = calcMsg.emptyComputeBlock();
    } else {
      appState.message = commonMsg.emptyFunctionalBlock();
    }
    return;
  }

  if (studioApp.hasQuestionMarksInNumberField()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
    return;
  }

  appState.userSet = new EquationSet(Blockly.mainBlockSpace.getTopBlocks());
  appState.failedInput = null;

  // Note: This will take precedence over free play, so you can "fail" a free
  // play level with a divide by zero error.
  // Also worth noting, we might still end up getting a div zero later when
  // we start varying inputs in evaluateResults_
  if (appState.userSet.hasDivZero()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.APP_SPECIFIC_FAIL;
    appState.message = calcMsg.divideByZeroError();
    return;
  }

  if (level.freePlay || level.edit_blocks) {
    appState.result = ResultType.SUCCESS;
    appState.testResults = TestResults.FREE_PLAY;
  } else {
    var outcome = Calc.evaluateResults_(appState.targetSet, appState.userSet);
    appState.result = outcome.result;
    appState.testResults = outcome.testResults;
    appState.message = outcome.message;
    appState.failedInput = outcome.failedInput;
  }

  // Override default message for LEVEL_INCOMPLETE_FAIL
  if (appState.testResults === TestResults.LEVEL_INCOMPLETE_FAIL &&
      !appState.message) {
    appState.message = calcMsg.levelIncompleteError();
  }
};

/**
 * If we have any functions or variables in our expression set, we don't support
 * animating evaluation.
 */
function displayComplexUserExpressions() {
  var result;
  clearSvgUserExpression();

  // Clone userSet, and we might make small changes to them (i.e. if we need to
  // vary variables)
  var userSet = appState.userSet.clone();
  var targetSet = appState.targetSet;

  var computeEquation = userSet.computeEquation();
  if (computeEquation === null || computeEquation.expression === null) {
    return;
  }

  // get the tokens for our user equations
  var nextRow = displayNonComputeEquations_(userSet, targetSet);

  if (userSet.computesSingleConstant()) {
    // In this case the compute equation + evaluation will be exactly the same
    // as what we've already shown, so don't show it.
    return;
  }

  // Now display our compute equation and the result of evaluating it
  var targetEquation = targetSet && targetSet.computeEquation();

  // We're either a variable or a function call. Generate a tokenList (since
  // we could actually be different than the goal)
  var tokenList = constructTokenList(computeEquation, targetEquation);
  if (userSet.hasVariablesOrFunctions() ||
      computeEquation.expression.depth() > 0) {
    tokenList = tokenList.concat(tokenListForEvaluation_(userSet, targetSet));
  }

  displayEquation('userExpression', null, tokenList, nextRow++, 'errorToken');

  tokenList = tokenListForFailedFunctionInput_(userSet, targetSet);
  if (tokenList && tokenList.length) {
    displayEquation('userExpression', null, tokenList, nextRow++, 'errorToken');
  }
}

/**
 * Display equations other than our compute equation.
 * Note: In one case (single variable compute, failed input) we also modify
 * our userSet here
 * @returns {number} How many rows we display equations on.
 */
function displayNonComputeEquations_(userSet, targetSet) {
  // in single function/variable mode, we're only going to highlight the differences
  // in the evaluated result
  var highlightAllErrors = !targetSet.computesFunctionCall() &&
    !targetSet.computesSingleVariable();

  if (targetSet.computesSingleVariable() && appState.failedInput !== null) {
    var userConstants = userSet.getConstants();
    var targetConstants = targetSet.getConstants();
    // replace constants with failed inputs in the user set.
    targetConstants.forEach(function (targetEquation, index) {
      var name = targetEquation.name;
      var userEquation = userSet.getEquation(name);
      userEquation.expression.setValue(appState.failedInput[index]);
    });
  }

  var numRows = 0;
  var tokenList;
  userSet.sortedEquations().forEach(function (userEquation) {
    var expectedEquation = highlightAllErrors ?
      targetSet.getEquation(userEquation.name) : null;

    tokenList = constructTokenList(userEquation, expectedEquation);

    displayEquation('userExpression', userEquation.signature, tokenList, numRows++,
      'errorToken');
  });

  return numRows;
}

/**
 * @returns {Token[]} token list comparing the evluation of the user and target
 *   sets. Includes equals sign.
 */
function tokenListForEvaluation_(userSet, targetSet) {
  var evaluation = userSet.evaluate();

  // Check for div zero
  if (evaluation.err) {
    if (evaluation.err instanceof ExpressionNode.DivideByZeroError ||
        utils.isInfiniteRecursionError(evaluation.err)) {
      // Expected type of error, do nothing.
    } else {
      console.log('Unexpected error: ' + evaluation.err);
    }
    return [];
  }

  var result = evaluation.result;
  var expectedResult = result;
  if (targetSet.computesSingleVariable()) {
    // If we have a failed input, make sure the result gets marked
    return [
      new Token(' = ', false),
      new Token(result, appState.failedInput)
    ];
  } else if (targetSet.computeEquation() !== null) {
    expectedResult = targetSet.evaluate().result;
  }

  // add a tokenList diffing our results
  return constructTokenList(' = ').concat(
    constructTokenList(result, expectedResult));
}

/**
 * For cases where we have a single function, and failure occured only after
 * we varied the inputs, we want to display a final line that shows the varied
 * input and result. This method generates that token list
 * @returns {Token[]}
 */
function tokenListForFailedFunctionInput_(userSet, targetSet) {
  if (appState.failedInput === null || !targetSet.computesFunctionCall()) {
    return [];
  }

  var computeEquation = userSet.computeEquation();
  var expression = computeEquation.expression.clone();
  for (var c = 0; c < expression.numChildren(); c++) {
    expression.setChildValue(c, appState.failedInput[c]);
  }
  var evaluation = userSet.evaluateWithExpression(expression);
  if (evaluation.err) {
    if (evaluation.err instanceof ExpressionNode.DivideByZeroError) {
      evaluation.result = ''; // result will not be used in this case
    } else {
      throw evaluation.err;
    }
  }
  var result = evaluation.result;

  return constructTokenList(expression)
    .concat(new Token(' = ', false))
    .concat(new Token(result, true)); // this should always be marked
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
Calc.step = function (animationDepth) {
  var isFinal = animateUserExpression(animationDepth);
  timeoutList.setTimeout(function () {
    if (isFinal) {
      // one deeper to remove highlighting
      animateUserExpression(animationDepth + 1);
      stopAnimatingAndDisplayFeedback();
    } else {
      Calc.step(animationDepth + 1);
    }
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
  var numCollapses = 0;
  // Each step draws a single line
  for (var currentStep = 0; currentStep <= maxNumSteps && !finished; currentStep++) {
    var tokenList;
    if (numCollapses === maxNumSteps) {
      // This is the last line in the current animation, highlight what has
      // changed since the last line
      tokenList = constructTokenList(current, previousExpression);
    } else if (numCollapses + 1 === maxNumSteps) {
      // This is the second to last line. Highlight the block being collapsed,
      // and the deepest operation (that will be collapsed on the next line)
      var deepest = current.getDeepestOperation();
      if (deepest) {
        studioApp.highlight('block_id_' + deepest.blockId);
      }
      tokenList = constructTokenList(current, null, true);
    } else {
      // Don't highlight anything
      tokenList = constructTokenList(current);
    }

    // For lines after the first one, we want them left aligned and preceeded
    // by an equals sign.
    var leftAlign = false;
    if (currentStep > 0) {
      leftAlign = true;
      tokenList = constructTokenList('= ').concat(tokenList);
    }
    displayEquation('userExpression', null, tokenList, numCollapses, 'markedToken', leftAlign);
    previousExpression = current.clone();
    if (current.isDivZero()) {
      finished = true;
    }
    if (current.collapse()) {
      numCollapses++;
    } else if (currentStep === numCollapses + 1) {
      // go one past our num collapses so that the last line gets highlighted
      // on its own
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
 * @param {boolean} leftAlign If true, equations are left aligned instead of
 *   centered.
 */
function displayEquation(parentId, name, tokenList, line, markClass, leftAlign) {
  var parent = document.getElementById(parentId);

  var g = document.createElementNS(Blockly.SVG_NS, 'g');
  parent.appendChild(g);
  var xPos = 0;
  var len;
  if (name) {
    len = new Token(name + ' = ', false).renderToParent(g, xPos, null);
    xPos += len;
  }
  var firstTokenLen = 0;
  for (var i = 0; i < tokenList.length; i++) {
    len = tokenList[i].renderToParent(g, xPos, markClass);
    if (i === 0) {
      firstTokenLen = len;
    }
    xPos += len;
  }

  var xPadding;
  if (leftAlign) {
    // Align second token with parent (assumption is that first token is our
    // equal sign).
    var transform = Blockly.getRelativeXY(parent.childNodes[0]);
    xPadding = parseFloat(transform.x) - firstTokenLen;
  } else {
    xPadding = (CANVAS_WIDTH - g.getBoundingClientRect().width) / 2;
  }
  var yPos = (line * LINE_HEIGHT);
  g.setAttribute('transform', 'translate(' + xPadding + ', ' + yPos + ')');
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
  if (appState.waitingForReport || appState.animating) {
    return;
  }

  // override extra top blocks message
  level.extraTopBlocks = calcMsg.extraTopBlocks();
  var appDiv = null;
  // Show svg in feedback dialog
  if (!isPreAnimationFailure(appState.testResults)) {
    appDiv = cloneNodeWithoutIds('svgCalc');
  }
  var options = {
    app: 'calc',
    skin: skin.id,
    response: appState.response,
    level: level,
    feedbackType: appState.testResults,
    tryAgainText: level.freePlay ? commonMsg.keepPlaying() : undefined,
    continueText: level.freePlay ? commonMsg.nextPuzzle() : undefined, 
    appStrings: {
      reinfFeedbackMsg: calcMsg.reinfFeedbackMsg()
    },
    appDiv: appDiv
  };
  if (appState.message && !level.edit_blocks) {
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
  appState.waitingForReport = false;
  displayFeedback();
}

/* start-test-block */
// export private function(s) to expose to unit testing
Calc.__testonly__ = {
  displayGoal: displayGoal,
  displayComplexUserExpressions: displayComplexUserExpressions,
  appState: appState
};
/* end-test-block */

},{"../../locale/current/calc":257,"../../locale/current/common":258,"../StudioApp":4,"../block_utils":27,"../dom":58,"../skins":207,"../templates/page.html":232,"../timeoutList":238,"../utils":253,"./controls.html":40,"./equation":41,"./equationSet":42,"./expressionNode":43,"./inputIterator":44,"./js-numbers/js-numbers.js":45,"./levels":46,"./token":48,"./visualization.html":49}],49:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/current/calc'); ; buf.push('\n\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgCalc">\n  <image id="background" height="400" width="400" x="0" y="0" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/blockly/media/skins/calc/background.png"></image>\n  <g id="userExpression" class="expr" transform="translate(0, 100)">\n  </g>\n  <g id="answerExpression" class="expr" transform="translate(0, 350)">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/calc":257,"ejs":274}],46:[function(require,module,exports){
var msg = require('../../locale/current/calc');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'example1': {
    solutionBlocks: blockUtils.calcBlockXml('functional_times', [
      blockUtils.calcBlockXml('functional_plus', [1, 2]),
      blockUtils.calcBlockXml('functional_plus', [3, 4])
    ]),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('functional_plus') +
      blockUtils.blockOfType('functional_minus') +
      blockUtils.blockOfType('functional_times') +
      blockUtils.blockOfType('functional_dividedby') +
      blockUtils.blockOfType('functional_math_number') +
      '<block type="functional_math_number_dropdown">' +
      '  <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">???</title>' +
      '</block>'
      ),
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  },

  'custom': {
    answer: '',
    ideal: Infinity,
    toolbox: '',
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  }
};

},{"../../locale/current/calc":257,"../block_utils":27}],44:[function(require,module,exports){
/**
 * Given a set of values (i.e. [1,2,3], and a number of parameters, generates
 * all possible combinations of values.
 */
var InputIterator = function (values, numParams) {
  this.numParams_ = numParams;
  this.remaining_ = Math.pow(values.length, numParams);
  this.availableValues_ = values;
  // represents the index into values for each param for the current permutation
  // set our first index to -1 so that it will get incremented to 0 on the first
  // pass
  this.indices_ = [-1];
  for (var i = 1; i < numParams; i++) {
    this.indices_[i] = 0;
  }
};
module.exports = InputIterator;

/**
 * Get the next set of values, throwing if none remaing
 * @returns {number[]} List of length numParams representing the next set of
 *   inputs.
 */
InputIterator.prototype.next = function () {
  if (this.remaining_ === 0) {
    throw new Error('empty');
  }

  var wrapped;
  var paramNum = 0;
  do {
    wrapped = false;
    this.indices_[paramNum]++;
    if (this.indices_[paramNum] === this.availableValues_.length) {
      this.indices_[paramNum] = 0;
      paramNum++;
      wrapped = true;
    }
  } while(wrapped && paramNum < this.numParams_);
  this.remaining_--;

  return this.indices_.map(function (index) {
    return this.availableValues_[index];
  }, this);
};

/**
 * @returns How many permutations are left
 */
InputIterator.prototype.remaining = function () {
  return this.remaining_;
};

},{}],42:[function(require,module,exports){
var _ = require('../utils').getLodash();
var ExpressionNode = require('./expressionNode');
var Equation = require('./equation');
var jsnums = require('./js-numbers/js-numbers');
var utils = require('../utils');

/**
 * An EquationSet consists of a top level (compute) equation, and optionally
 * some number of support equations
 * @param {!Array} blocks List of blockly blocks
 */
var EquationSet = function (blocks) {
  this.compute_ = null; // an Equation
  this.equations_ = []; // a list of Equations

  if (blocks) {
    blocks.forEach(function (block) {
      var equation = getEquationFromBlock(block);
      if (equation) {
        this.addEquation_(equation);
      }
    }, this);
  }
};
module.exports = EquationSet;

EquationSet.prototype.clone = function () {
  var clone = new EquationSet();
  clone.compute_ = null;
  if (this.compute_) {
    clone.compute_ = this.compute_.clone();
  }
  clone.equations_ = this.equations_.map(function (item) {
    return item.clone();
  });
  return clone;
};

/**
 * Adds an equation to our set. If equation's name is null, sets it as the
 * compute equation. Throws if equation of this name already exists.
 * @param {Equation} equation The equation to add.
 */
EquationSet.prototype.addEquation_ = function (equation) {
  if (!equation.name) {
    if (this.compute_) {
      throw new Error('compute expression already exists');
    }
    this.compute_ = equation;
  } else {
    if (this.getEquation(equation.name)) {
      throw new Error('equation already exists: ' + equation.name);
    }
    this.equations_.push(equation);
  }
};

/**
 * Get an equation by name, or compute equation if name is null
 * @returns {Equation} Equation of that name if it exists, null otherwise.
 */
EquationSet.prototype.getEquation = function (name) {
  if (name === null) {
    return this.computeEquation();
  }
  for (var i = 0; i < this.equations_.length; i++) {
    if (this.equations_[i].name === name) {
      return this.equations_[i];
    }
  }
  return null;
};

/**
 * @returns the compute equation if there is one
 */
EquationSet.prototype.computeEquation = function () {
  return this.compute_;
};

/**
 * @returns true if EquationSet has at least one variable or function.
 */
EquationSet.prototype.hasVariablesOrFunctions = function () {
  return this.equations_.length > 0;
};

/**
 * @returns {boolean} True if our compute expression is jsut a funciton call
 */
EquationSet.prototype.computesFunctionCall = function () {
  if (!this.compute_) {
    return false;
  }

  var computeExpression = this.compute_.expression;
  return computeExpression.isFunctionCall();
};


/**
 * @returns {boolean} True if our compute expression is just a variable, which
 * we take to mean we can treat similarly to our single function scenario
 */
EquationSet.prototype.computesSingleVariable = function () {
  if (!this.compute_) {
    return false;
  }
  var computeExpression = this.compute_.expression;
  return computeExpression.isVariable();
};

/**
 * Example set that returns true:
 * Age = 12
 * compute: Age
 * @returns {boolean} True if our EquationSet consists of a variable set to
 *   a number, and the computation of that variable.
 */
EquationSet.prototype.computesSingleConstant = function () {
  if (!this.compute_ || this.equations_.length !== 1) {
    return false;
  }
  var equation = this.equations_[0];
  var computeExpression = this.compute_.expression;
  return computeExpression.isVariable() && equation.expression.isNumber() &&
    computeExpression.getValue() === equation.name;

};

EquationSet.prototype.isAnimatable = function () {
  if (!this.compute_) {
    return false;
  }
  if (this.hasVariablesOrFunctions()) {
    return false;
  }
  if (this.compute_.expression.depth() === 0) {
    return false;
  }

  return true;
};

/**
 * Returns a list of equations that consist of setting a variable to a constant
 * value, without doing any additional math. i.e. foo = 1
 */
EquationSet.prototype.getConstants = function () {
  return this.equations_.filter(function (item) {
    return item.params.length === 0 && item.expression.isNumber();
  });
};

/**
 * Are two EquationSets identical? This is considered to be true if their
 * compute expressions are identical and all of their equations have the same
 * names and identical expressions.
 */
EquationSet.prototype.isIdenticalTo = function (otherSet) {
  if (this.equations_.length !== otherSet.equations_.length) {
    return false;
  }

  var otherCompute = otherSet.computeEquation().expression;
  if (!this.compute_.expression.isIdenticalTo(otherCompute)) {
    return false;
  }

  for (var i = 0; i < this.equations_.length; i++) {
    var thisEquation = this.equations_[i];
    var otherEquation = otherSet.getEquation(thisEquation.name);
    if (!otherEquation ||
        !thisEquation.expression.isIdenticalTo(otherEquation.expression)) {
      return false;
    }
  }

  return true;
};

/**
 * Are two EquationSets equivalent? This is considered to be true if their
 * compute expression are equivalent and all of their equations have the same
 * names and equivalent expressions. Equivalence is a less strict requirement
 * than identical that allows params to be reordered.
 */
EquationSet.prototype.isEquivalentTo = function (otherSet) {
  if (this.equations_.length !== otherSet.equations_.length) {
    return false;
  }

  var otherCompute = otherSet.computeEquation().expression;
  if (!this.compute_.expression.isEquivalentTo(otherCompute)) {
    return false;
  }

  for (var i = 0; i < this.equations_.length; i++) {
    var thisEquation = this.equations_[i];
    var otherEquation = otherSet.getEquation(thisEquation.name);
    if (!otherEquation ||
        !thisEquation.expression.isEquivalentTo(otherEquation.expression)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns a list of the non-compute equations (vars/functions) sorted by name.
 */
EquationSet.prototype.sortedEquations = function () {
  // note: this has side effects, as it reorders equations. we could also
  // ensure this was done only once if we had performance concerns
  this.equations_.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  return this.equations_;
};

/**
 * @returns {boolean} true if evaluating our EquationSet would result in
 *   dividing by zero.
 */
EquationSet.prototype.hasDivZero = function () {
  var evaluation = this.evaluate();
  return evaluation.err &&
    evaluation.err instanceof ExpressionNode.DivideByZeroError;
};

/**
 * Evaluate the EquationSet's compute expression in the context of its equations
 */
EquationSet.prototype.evaluate = function () {
  return this.evaluateWithExpression(this.compute_.expression);
};

/**
 * Evaluate the given compute expression in the context of the EquationSet's
 * equations. For example, our equation set might define f(x) = x + 1, and this
 * allows us to evaluate the expression f(1) or f(2)...
 * @param {ExpressionNode} computeExpression The expression to evaluate
 * @returns {Object} evaluation An object with either an err or result field
 * @returns {Error?} evalatuion.err
 * @returns {Number?} evaluation.result
 */
EquationSet.prototype.evaluateWithExpression = function (computeExpression) {
  // no variables/functions. this is easy
  if (this.equations_.length === 0) {
    return computeExpression.evaluate();
  }

  // Iterate through our equations to generate our mapping. We may need to do
  // this a few times. Stop trying as soon as we do a full iteration without
  // adding anything new to our mapping.
  var mapping = {};
  var madeProgress;
  var testMapping;
  var evaluation;
  var setTestMappingToOne = function (item) {
    testMapping[item] = jsnums.makeFloat(1);
  };
  do {
    madeProgress = false;
    for (var i = 0; i < this.equations_.length; i++) {
      var equation = this.equations_[i];
      if (equation.isFunction()) {
        if (mapping[equation.name]) {
          continue;
        }
        // see if we can map if we replace our params
        // note that params override existing vars in our testMapping
        testMapping = _.clone(mapping);
        testMapping[equation.name] = {
          variables: equation.params,
          expression: equation.expression
        };
        equation.params.forEach(setTestMappingToOne);
        evaluation = equation.expression.evaluate(testMapping);
        if (evaluation.err) {
          if (evaluation.err instanceof ExpressionNode.DivideByZeroError ||
              utils.isInfiniteRecursionError(evaluation.err)) {
            return { err: evaluation.err };
          }
          continue;
        }

        // we have a valid mapping
        madeProgress = true;
        mapping[equation.name] = {
          variables: equation.params,
          expression: equation.expression
        };
      } else if (mapping[equation.name] === undefined) {
        evaluation = equation.expression.evaluate(mapping);
        if (evaluation.err) {
          if (evaluation.err instanceof ExpressionNode.DivideByZeroError) {
            return { err: evaluation.err };
          }
        } else {
          // we have a variable that hasn't yet been mapped and can be
          madeProgress = true;
          mapping[equation.name] = evaluation.result;
        }
      }
    }

  } while (madeProgress);

  return computeExpression.evaluate(mapping);
};

/**
 * Given a Blockly block, generates an Equation.
 */
function getEquationFromBlock(block) {
  var name;
  if (!block) {
    return null;
  }
  var firstChild = block.getChildren()[0];
  switch (block.type) {
    case 'functional_compute':
      if (!firstChild) {
        return new Equation(null, [], null);
      }
      return getEquationFromBlock(firstChild);

    case 'functional_plus':
    case 'functional_minus':
    case 'functional_times':
    case 'functional_dividedby':
    case 'functional_pow':
    case 'functional_sqrt':
    case 'functional_squared':
      var operation = block.getTitles()[0].getValue();
      // some of these have 1 arg, others 2
      var argNames = ['ARG1'];
      if (block.getInput('ARG2')) {
        argNames.push('ARG2');
      }
      var args = argNames.map(function(inputName) {
        var argBlock = block.getInputTargetBlock(inputName);
        if (!argBlock) {
          return 0;
        }
        return getEquationFromBlock(argBlock).expression;
      });

      return new Equation(null, [], new ExpressionNode(operation, args, block.id));

    case 'functional_math_number':
    case 'functional_math_number_dropdown':
      var val = block.getTitleValue('NUM') || 0;
      if (val === '???') {
        val = 0;
      }
      return new Equation(null, [],
        new ExpressionNode(parseFloat(val), [], block.id));

    case 'functional_call':
      name = block.getCallName();
      var def = Blockly.Procedures.getDefinition(name, Blockly.mainBlockSpace);
      if (def.isVariable()) {
        return new Equation(null, [], new ExpressionNode(name));
      } else {
        var values = [];
        var input, childBlock;
        for (var i = 0; !!(input = block.getInput('ARG' + i)); i++) {
          childBlock = input.connection.targetBlock();
          values.push(childBlock ? getEquationFromBlock(childBlock).expression :
            new ExpressionNode(0));
        }
        return new Equation(null, [], new ExpressionNode(name, values));
      }
      break;

    case 'functional_definition':
      name = block.getTitleValue('NAME');

      var expression = firstChild ? getEquationFromBlock(firstChild).expression :
        new ExpressionNode(0);

      return new Equation(name, block.getVars(), expression);

    case 'functional_parameters_get':
      return new Equation(null, [], new ExpressionNode(block.getTitleValue('VAR')));

    case 'functional_example':
      return null;

    default:
      throw "Unknown block type: " + block.type;
  }
}

/* start-test-block */
// export private function(s) to expose to unit testing
EquationSet.__testonly__ = {
  getEquationFromBlock: getEquationFromBlock
};
/* end-test-block */

},{"../utils":253,"./equation":41,"./expressionNode":43,"./js-numbers/js-numbers":45}],43:[function(require,module,exports){
var utils = require('../utils');
var _ = utils.getLodash();
var Token = require('./token');
var jsnums = require('./js-numbers/js-numbers');

var ValueType = {
  ARITHMETIC: 1,
  FUNCTION_CALL: 2,
  VARIABLE: 3,
  NUMBER: 4,
  EXPONENTIAL: 5
};

function DivideByZeroError(message) {
  this.message = message || '';
}

/**
 * Converts numbers to jsnumber representations. This is needed because some
 * jsnumber methods will return a number or jsnumber depending on their values,
 * for example:
 * jsnums.sqrt(jsnums.makeFloat(4).toExact()) = 4
 * jsnums.sqrt(jsnums.makeFloat(5).toExact()) = jsnumber
 * @param {number|jsnumber} val
 * @returns {jsnumber}
 */
function ensureJsnum(val) {
  if (typeof(val) === 'number') {
    return jsnums.makeFloat(val);
  }
  return val;
}

/**
 * A node consisting of an value, and potentially a set of operands.
 * The value will be either an operator, a string representing a variable, a
 * string representing a functional call, or a number.
 * If args are not ExpressionNode, we convert them to be so, assuming any string
 * represents a variable
 */
var ExpressionNode = function (val, args, blockId) {
  this.value_ = ensureJsnum(val);

  this.blockId_ = blockId;
  if (args === undefined) {
    args = [];
  }

  if (!Array.isArray(args)) {
    throw new Error("Expected array");
  }

  this.children_ = args.map(function (item) {
    if (!(item instanceof ExpressionNode)) {
      item = new ExpressionNode(item);
    }
    return item;
  });

  if (this.isNumber() && args.length > 0) {
    throw new Error("Can't have args for number ExpressionNode");
  }

  if (this.isArithmetic() && args.length !== 2) {
    throw new Error("Arithmetic ExpressionNode needs 2 args");
  }
};
module.exports = ExpressionNode;
ExpressionNode.DivideByZeroError = DivideByZeroError;

/**
 * What type of expression node is this?
 */
ExpressionNode.prototype.getType_ = function () {
  if (["+", "-", "*", "/"].indexOf(this.value_) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (["pow", "sqrt", "sqr"].indexOf(this.value_) !== -1) {
    return ValueType.EXPONENTIAL;
  }

  if (typeof(this.value_) === 'string') {
    if (this.children_.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (jsnums.isSchemeNumber(this.value_)) {
    return ValueType.NUMBER;
  }
};

ExpressionNode.prototype.isArithmetic = function () {
  return this.getType_() === ValueType.ARITHMETIC;
};

ExpressionNode.prototype.isFunctionCall = function () {
  return this.getType_() === ValueType.FUNCTION_CALL;
};

ExpressionNode.prototype.isVariable = function () {
  return this.getType_() === ValueType.VARIABLE;
};

ExpressionNode.prototype.isNumber = function () {
  return this.getType_() === ValueType.NUMBER;
};

ExpressionNode.prototype.isExponential = function () {
  return this.getType_() === ValueType.EXPONENTIAL;
};

/**
 * @returns {boolean} true if the root expression node is a divide by zero. Does
 *   not account for div zeros in descendants
 */
ExpressionNode.prototype.isDivZero = function () {
  var rightChild = this.getChildValue(1);
  return this.getValue() === '/' && jsnums.isSchemeNumber(rightChild) &&
    jsnums.equals(rightChild, 0);
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  var children = this.children_.map(function (item) {
    return item.clone();
  });
  return new ExpressionNode(this.value_, children, this.blockId_);
};

/**
 * Evaluate the expression, returning the result.
 * @param {Object<string, number|object>} globalMapping Global mapping of
 *   variables and functions
 * @param {Object<string, number|object>} localMapping Mapping of
 *   variables/functions local to scope of this function.
 * @returns {Object} evaluation An object with either an err or result field
 * @returns {Error?} evalatuion.err
 * @returns {jsnumber?} evaluation.result
 */
ExpressionNode.prototype.evaluate = function (globalMapping, localMapping) {
  try {
    globalMapping = globalMapping || {};
    localMapping = localMapping || {};

    var type = this.getType_();
    // @type {number|jsnumber}
    var val;

    if (type === ValueType.VARIABLE) {
      var mappedVal = utils.valueOr(localMapping[this.value_],
        globalMapping[this.value_]);
      if (mappedVal === undefined) {
        throw new Error('No mapping for variable during evaluation');
      }

      var clone = this.clone();
      clone.setValue(mappedVal);
      return clone.evaluate(globalMapping);
    }

    if (type === ValueType.FUNCTION_CALL) {
      var functionDef = utils.valueOr(localMapping[this.value_],
        globalMapping[this.value_]);
      if (functionDef === undefined) {
        throw new Error('No mapping for function during evaluation');
      }

      if (!functionDef.variables || !functionDef.expression) {
        throw new Error('Bad mapping for: ' + this.value_);
      }
      if (functionDef.variables.length !== this.children_.length) {
        throw new Error('Bad mapping for: ' + this.value_);
      }

      // We're calling a new function, so it gets a new local scope.
      var newLocalMapping = {};
      functionDef.variables.forEach(function (variable, index) {
        var evaluation = this.children_[index].evaluate(globalMapping, localMapping);
        if (evaluation.err) {
          throw evaluation.err;
        }
        var childVal = evaluation.result;
        newLocalMapping[variable] = utils.valueOr(localMapping[childVal], childVal);
      }, this);
      return functionDef.expression.evaluate(globalMapping, newLocalMapping);
    }

    if (type === ValueType.NUMBER) {
      return { result: this.value_ };
    }

    if (type !== ValueType.ARITHMETIC && type !== ValueType.EXPONENTIAL) {
      throw new Error('Unexpected');
    }

    var left = this.children_[0].evaluate(globalMapping, localMapping);
    if (left.err) {
      throw left.err;
    }
    left = left.result.toExact();

    if (this.children_.length === 1) {
      switch (this.value_) {
        case 'sqrt':
          val = jsnums.sqrt(left);
          break;
        case 'sqr':
          val = jsnums.sqr(left);
          break;
        default:
          throw new Error('Unknown operator: ' + this.value_);
      }
      return { result: ensureJsnum(val) };
    }

    var right = this.children_[1].evaluate(globalMapping, localMapping);
    if (right.err) {
      throw right.err;
    }
    right = right.result.toExact();

    switch (this.value_) {
      case '+':
        val = jsnums.add(left, right);
        break;
      case '-':
        val = jsnums.subtract(left, right);
        break;
      case '*':
        val = jsnums.multiply(left, right);
        break;
      case '/':
        if (jsnums.equals(right, 0)) {
          throw new DivideByZeroError();
        }
        val = jsnums.divide(left, right);
        break;
      case 'pow':
        val = jsnums.expt(left, right);
        break;
      default:
        throw new Error('Unknown operator: ' + this.value_);
    }
    // When calling jsnums methods, they will sometimes return a jsnumber and
    // sometimes a native JavaScript number. We want to make sure to convert
    // to a jsnumber before we return.
    return { result: ensureJsnum(val) };
  } catch (err) {
    return { err: err };
  }
};

/**
 * Depth of this node's tree. A lone value is considered to have a depth of 0.
 */
ExpressionNode.prototype.depth = function () {
  var max = 0;
  for (var i = 0; i < this.children_.length; i++) {
    max = Math.max(max, 1 + this.children_[i].depth());
  }

  return max;
};

/**
 * Gets the deepest descendant operation ExpressionNode in the tree (i.e. the
 * next node to collapse
 */
ExpressionNode.prototype.getDeepestOperation = function () {
  if (this.children_.length === 0) {
    return null;
  }

  var deepestChild = null;
  var deepestDepth = 0;
  for (var i = 0; i < this.children_.length; i++) {
    var depth = this.children_[i].depth();
    if (depth > deepestDepth) {
      deepestDepth = depth;
      deepestChild = this.children_[i];
    }
  }

  if (deepestDepth === 0) {
    return this;
  }

  return deepestChild.getDeepestOperation();
};

/**
 * Collapses the next descendant in place. Next is defined as deepest, then
 * furthest left.
 * @returns {boolea} true if collapse was successful.
 */
ExpressionNode.prototype.collapse = function () {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    var evaluation = this.evaluate();
    if (evaluation.err) {
      return false;
    }
    this.value_ = evaluation.result;
    this.children_ = [];
    return true;
  } else {
    return deepest.collapse();
  }
};

/**
 * Get a tokenList for this expression, where differences from other expression
 * are marked
 * @param {ExpressionNode} other The ExpressionNode to compare to.
 */
ExpressionNode.prototype.getTokenListDiff = function (other) {
  var tokens;
  var nodesMatch = other && this.hasSameValue_(other) &&
    (this.children_.length === other.children_.length);
  var type = this.getType_();

  if (this.children_.length === 0) {
    return [new Token(this.value_, !nodesMatch)];
  }

  var tokensForChild = function (childIndex) {
    return this.children_[childIndex].getTokenListDiff(nodesMatch &&
      other.children_[childIndex]);
  }.bind(this);

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    tokens.push([
      tokensForChild(0),
      new Token(" " + this.value_ + " ", !nodesMatch),
      tokensForChild(1)
    ]);
    tokens.push(new Token(')', !nodesMatch));

    return _.flatten(tokens);
  }

  if (this.value_ === 'sqr') {
    return _.flatten([
      new Token('(', !nodesMatch),
      tokensForChild(0),
      new Token(' ^ 2', !nodesMatch),
      new Token(')', !nodesMatch)
    ]);
  } else if (this.value_ === 'pow') {
    return _.flatten([
      new Token('(', !nodesMatch),
      tokensForChild(0),
      new Token(' ^ ', !nodesMatch),
      tokensForChild(1),
      new Token(')', !nodesMatch)
    ]);
  }

  // We either have a function call, or an arithmetic node that we want to
  // treat like a function (i.e. sqrt(4))
  // A function call will generate something like: foo(1, 2, 3)
  tokens = [
    new Token(this.value_, other && this.value_ !== other.value_),
    new Token('(', !nodesMatch)
  ];

  var numChildren = this.children_.length;
  for (var i = 0; i < numChildren; i++) {
    if (i > 0) {
      tokens.push(new Token(',', !nodesMatch));
    }
    var childTokens = tokensForChild(i);
    if (numChildren === 1) {
      ExpressionNode.stripOuterParensFromTokenList(childTokens);
    }
    tokens.push(childTokens);
  }

  tokens.push(new Token(")", !nodesMatch));
  return _.flatten(tokens);
};

/**
 * Get a tokenList for this expression, potentially marking those tokens
 * that are in the deepest descendant expression.
 * @param {boolean} markDeepest Mark tokens in the deepest descendant
 */
ExpressionNode.prototype.getTokenList = function (markDeepest) {
  if (!markDeepest) {
    // diff against this so that nothing is marked
    return this.getTokenListDiff(this);
  } else if (this.depth() <= 1) {
    // markDeepest is true. diff against null so that everything is marked
    return this.getTokenListDiff(null);
  }

  if (this.getType_() !== ValueType.ARITHMETIC &&
      this.getType_() !== ValueType.EXPONENTIAL) {
    // Don't support getTokenList for functions
    throw new Error("Unsupported");
  }

  var rightDeeper = false;
  if (this.children_.length === 2) {
    rightDeeper = this.children_[1].depth() > this.children_[0].depth();
  }

  var prefix = new Token('(', false);
  var suffix = new Token(')', false);

  if (this.value_ === 'sqrt') {
    prefix = new Token('sqrt', false);
    suffix = null;
  }

  var tokens = [
    prefix,
    this.children_[0].getTokenList(markDeepest && !rightDeeper),
  ];
  if (this.children_.length > 1) {
    tokens.push([
      new Token(" " + this.value_ + " ", false),
      this.children_[1].getTokenList(markDeepest && rightDeeper)
    ]);
  }
  if (suffix) {
    tokens.push(suffix);
  }
  return _.flatten(tokens);
};

/**
 * Looks to see if two nodes have the same value, using jsnum.equals in the
 * case of numbers
 * @param {ExpressionNode} other ExpresisonNode to compare to
 * @returns {boolean} True if both nodes have the same value.
 */
ExpressionNode.prototype.hasSameValue_ = function (other) {
  if (!other) {
    return false;
  }

  if (this.isNumber()) {
    return jsnums.equals(this.value_, other.value_);
  }

  return this.value_ === other.value_;
};

/**
 * Is other exactly the same as this ExpressionNode tree.
 */
ExpressionNode.prototype.isIdenticalTo = function (other) {
  if (!other || !this.hasSameValue_(other) || this.children_.length !== other.children_.length) {
    return false;
  }

  for (var i = 0; i < this.children_.length; i++) {
    if (!this.children_[i].isIdenticalTo(other.children_[i])) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if both this and other are calls of the same function, with
 * the same number of arguments
 */
ExpressionNode.prototype.hasSameSignature = function (other) {
  if (!other) {
    return false;
  }

  if (this.getType_() !== ValueType.FUNCTION_CALL ||
      other.getType_() !== ValueType.FUNCTION_CALL) {
    return false;
  }

  if (this.value_ !== other.value_) {
    return false;
  }

  if (this.children_.length !== other.children_.length) {
    return false;
  }

  return true;
};

/**
 * Do the two nodes differ only in argument order.
 */
ExpressionNode.prototype.isEquivalentTo = function (other) {
  // only ignore argument order for ARITHMETIC
  if (this.getType_() !== ValueType.ARITHMETIC) {
    return this.isIdenticalTo(other);
  }

  if (!other || this.value_ !== other.value_) {
    return false;
  }

  var myLeft = this.children_[0];
  var myRight = this.children_[1];

  var theirLeft = other.children_[0];
  var theirRight = other.children_[1];

  if (myLeft.isEquivalentTo(theirLeft)) {
    return myRight.isEquivalentTo(theirRight);
  }
  if (myLeft.isEquivalentTo(theirRight)) {
    return myRight.isEquivalentTo(theirLeft);
  }
  return false;
};

/**
 * @returns {number} How many children this node has
 */
ExpressionNode.prototype.numChildren = function () {
  return this.children_.length;
};

/**
 * Get the value
 * @returns {string} String representation of this node's value.
 */
ExpressionNode.prototype.getValue = function () {
  return this.value_.toString();
};


/**
 * Modify this ExpressionNode's value
 */
ExpressionNode.prototype.setValue = function (value) {
  var type = this.getType_();
  if (type !== ValueType.VARIABLE && type !== ValueType.NUMBER) {
    throw new Error("Can't modify value");
  }
  if (type === ValueType.NUMBER) {
    this.value_ = ensureJsnum(value);
  } else {
    this.value_ = value;
  }
};

/**
 * Get the value of the child at index
 */
ExpressionNode.prototype.getChildValue = function (index) {
  if (this.children_[index] === undefined) {
    return undefined;
  }
  return this.children_[index].value_;
};

/**
 * Set the value of the child at index
 */
ExpressionNode.prototype.setChildValue = function (index, value) {
  return this.children_[index].setValue(value);
};

/**
 * Get a string representation of the tree
 * Note: This is only used by test code, but is also generally useful to debug
 * @returns {string}
 */
ExpressionNode.prototype.debug = function () {
  if (this.children_.length === 0) {
    if (this.isNumber()) {
      return this.value_.toFixnum().toString();
    } else {
      return this.value_.toString();
    }
  }
  return "(" + this.value_ + " " +
    this.children_.map(function (c) {
      return c.debug();
    }).join(' ') + ")";
};

/**
 * Given a token list, if the first and last items are parens, removes them
 * from the list
 */
ExpressionNode.stripOuterParensFromTokenList = function (tokenList) {
  if (tokenList.length >= 2 && tokenList[0].isParenthesis() &&
      tokenList[tokenList.length - 1].isParenthesis()) {
    tokenList.splice(-1);
    tokenList.splice(0, 1);
  }
  return tokenList;
};

},{"../utils":253,"./js-numbers/js-numbers":45,"./token":48}],48:[function(require,module,exports){
var jsnums = require('./js-numbers/js-numbers');

// Unicode character for non-breaking space
var NBSP = '\u00A0';

/**
 * A token is a value, and a boolean indicating whether or not it is "marked".
 * Marking is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 * @param {string|jsnumber} val
 * @param {boolean} marked
 */
var Token = function (val, marked) {
  this.val_ = val;
  this.marked_ = marked;

  // Store string representation of value. In most cases this is just a
  // non repeated portion. In the case of something like 1/9 there will be both
  // a non repeated portion "0." and a repeated portion "1" - i.e. 0.1111111...
  /** @type {string} */
  this.nonRepeated_ = null;
  /** @type {string} */
  this.repeated_ = null;
  this.setStringRepresentation_();
};
module.exports = Token;

Token.prototype.isParenthesis = function () {
  return this.val_ === '(' || this.val_ === ')';
};

/**
 * Add the given token to the parent element.
 * @param {HTMLElement} element Parent element to add to
 * @param {number} xPos X position to place element at
 * @param {string?} markClass Class name to use if token is marked
 * @returns {number} the length of the added text element
 */
Token.prototype.renderToParent = function (element, xPos, markClass) {
  var text, textLength;

  text = document.createElementNS(Blockly.SVG_NS, 'text');

  var tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
  // Replace spaces with 2x nonbreaking space
  tspan.textContent = this.nonRepeated_.replace(/ /g, NBSP + NBSP);
  text.appendChild(tspan);

  if (this.repeated_) {
    tspan = document.createElementNS(Blockly.SVG_NS, 'tspan');
    tspan.setAttribute('style', 'text-decoration: overline');
    // Replace spaces with 2x nonbreaking space
    tspan.textContent = this.repeated_.replace(/ /g, NBSP + NBSP);
    text.appendChild(tspan);
  }

  element.appendChild(text);

  // FF doesnt have offsetWidth
  // getBoundingClientRect undercalculates width on iPad
  if (text.offsetWidth !== undefined) {
    textLength = text.offsetWidth;
  } else {
    textLength = text.getBoundingClientRect().width;
  }

  text.setAttribute('x', xPos);
  if (this.marked_ && markClass) {
    text.setAttribute('class', markClass);
  }

  return textLength;
};

/**
 * Sets string representation of value.
 */
Token.prototype.setStringRepresentation_ = function () {
  if (!jsnums.isSchemeNumber(this.val_) || typeof(this.val_) === 'number') {
    this.nonRepeated_ = this.val_;
    return;
  }

  // at this point we know we have a jsnumber
  if (this.val_.isInteger()) {
    this.nonRepeated_ = Token.numberWithCommas_(this.val_.toFixnum());
    return;
  }

  // Gives us three values: Number before decimal, non-repeating portion,
  // repeating portion. If we don't have the last bit, there's no repitition.
  var numerator = jsnums.toExact(this.val_.numerator());
  var denominator = jsnums.toExact(this.val_.denominator());
  var repeater = jsnums.toRepeatingDecimal(numerator, denominator);
  if (!repeater[2] || repeater[2] === '0') {
    this.nonRepeated_ = Token.numberWithCommas_(this.val_.toFixnum());
    return;
  }

  this.nonRepeated_ = Token.numberWithCommas_(repeater[0]) + '.' + repeater[1];
  this.repeated_ = repeater[2];
};

/**
 * From http://stackoverflow.com/a/2901298/2506748
 * @param {number} x
 * @returns {string} the number with commas inserted in thousandth's place
 */
Token.numberWithCommas_ = function (x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

},{"./js-numbers/js-numbers":45}],45:[function(require,module,exports){
// Scheme numbers.

// NOTE: This top bit differs from the version at https://github.com/bootstrapworld/js-numbers/blob/master/src/js-numbers.js
var jsnums = {};
module.exports = jsnums;


// The numeric tower has the following levels:
//     integers
//     rationals
//     floats
//     complex numbers
//
// with the representations:
//     integers: fixnum or BigInteger [level=0]
//     rationals: Rational [level=1]
//     floats: FloatPoint [level=2]
//     complex numbers: Complex [level=3]

// We try to stick with the unboxed fixnum representation for
// integers, since that's what scheme programs commonly deal with, and
// we want that common type to be lightweight.


// A boxed-scheme-number is either BigInteger, Rational, FloatPoint, or Complex.
// An integer-scheme-number is either fixnum or BigInteger.


(function() {
    'use strict';
    // Abbreviation
    var Numbers = jsnums;


    // makeNumericBinop: (fixnum fixnum -> any) (scheme-number scheme-number -> any) -> (scheme-number scheme-number) X
    // Creates a binary function that works either on fixnums or boxnums.
    // Applies the appropriate binary function, ensuring that both scheme numbers are
    // lifted to the same level.
    var makeNumericBinop = function(onFixnums, onBoxednums, options) {
        options = options || {};
        return function(x, y) {
            if (options.isXSpecialCase && options.isXSpecialCase(x))
                return options.onXSpecialCase(x, y);
            if (options.isYSpecialCase && options.isYSpecialCase(y))
                return options.onYSpecialCase(x, y);

            if (typeof(x) === 'number' &&
                typeof(y) === 'number') {
                return onFixnums(x, y);
            }
            if (typeof(x) === 'number') {
                x = liftFixnumInteger(x, y);
            }
            if (typeof(y) === 'number') {
                y = liftFixnumInteger(y, x);
            }

            if (x.level < y.level) x = x.liftTo(y);
            if (y.level < x.level) y = y.liftTo(x);
            return onBoxednums(x, y);
        };
    }


    // fromFixnum: fixnum -> scheme-number
    var fromFixnum = function(x) {
        if (isNaN(x) || (! isFinite(x))) {
            return FloatPoint.makeInstance(x);
        }
        var nf = Math.floor(x);
        if (nf === x) {
            if (isOverflow(nf)) {
                return makeBignum(expandExponent(x+''));
            } else {
                return nf;
            }
        } else {
            return FloatPoint.makeInstance(x);
        }
    };

    var expandExponent = function(s) {
        var match = s.match(scientificPattern(digitsForRadix(10), expMarkForRadix(10))), mantissaChunks, exponent;
        if (match) {
            mantissaChunks = match[1].match(/^([^.]*)(.*)$/);
            exponent = Number(match[2]);

            if (mantissaChunks[2].length === 0) {
                return mantissaChunks[1] + zfill(exponent);
            }

            if (exponent >= mantissaChunks[2].length - 1) {
                return (mantissaChunks[1] +
                        mantissaChunks[2].substring(1) +
                        zfill(exponent - (mantissaChunks[2].length - 1)));
            } else {
                return (mantissaChunks[1] +
                        mantissaChunks[2].substring(1, 1+exponent));
            }
        } else {
            return s;
        }
    };

    // zfill: integer -> string
    // builds a string of "0"'s of length n.
    var zfill = function(n) {
        var buffer = [];
        buffer.length = n;
        for (var i = 0; i < n; i++) {
            buffer[i] = '0';
        }
        return buffer.join('');
    };



    // liftFixnumInteger: fixnum-integer boxed-scheme-number -> boxed-scheme-number
    // Lifts up fixnum integers to a boxed type.
    var liftFixnumInteger = function(x, other) {
        switch(other.level) {
        case 0: // BigInteger
            return makeBignum(x);
        case 1: // Rational
            return new Rational(x, 1);
        case 2: // FloatPoint
            return new FloatPoint(x);
        case 3: // Complex
            return new Complex(x, 0);
        default:
            throwRuntimeError("IMPOSSIBLE: cannot lift fixnum integer to " + other.toString(), x, other);
        }
    };


    // throwRuntimeError: string (scheme-number | undefined) (scheme-number | undefined) -> void
    // Throws a runtime error with the given message string.
    var throwRuntimeError = function(msg, x, y) {
        Numbers['onThrowRuntimeError'](msg, x, y);
    };



    // onThrowRuntimeError: string (scheme-number | undefined) (scheme-number | undefined) -> void
    // By default, will throw a new Error with the given message.
    // Override Numbers['onThrowRuntimeError'] if you need to do something special.
    var onThrowRuntimeError = function(msg, x, y) {
        throw new Error(msg);
    };


    // isSchemeNumber: any -> boolean
    // Returns true if the thing is a scheme number.
    var isSchemeNumber = function(thing) {
        return (typeof(thing) === 'number'
                || (thing instanceof Rational ||
                    thing instanceof FloatPoint ||
                    thing instanceof Complex ||
                    thing instanceof BigInteger));
    };


    // isRational: scheme-number -> boolean
    var isRational = function(n) {
        return (typeof(n) === 'number' ||
                (isSchemeNumber(n) && n.isRational()));
    };

    // isReal: scheme-number -> boolean
    var isReal = function(n) {
        return (typeof(n) === 'number' ||
                (isSchemeNumber(n) && n.isReal()));
    };

    // isExact: scheme-number -> boolean
    var isExact = function(n) {
        return (typeof(n) === 'number' ||
                (isSchemeNumber(n) && n.isExact()));
    };

    // isExact: scheme-number -> boolean
    var isInexact = function(n) {
        if (typeof(n) === 'number') {
            return false;
        } else {
            return (isSchemeNumber(n) && n.isInexact());
        }
    };

    // isInteger: scheme-number -> boolean
    var isInteger = function(n) {
        return (typeof(n) === 'number' ||
                (isSchemeNumber(n) && n.isInteger()));
    };

    // isExactInteger: scheme-number -> boolean
    var isExactInteger = function(n) {
        return (typeof(n) === 'number' ||
                (isSchemeNumber(n) &&
                 n.isInteger() &&
                 n.isExact()));
    }



    // toFixnum: scheme-number -> javascript-number
    var toFixnum = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.toFixnum();
    };

    // toExact: scheme-number -> scheme-number
    var toExact = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.toExact();
    };


    // toExact: scheme-number -> scheme-number
    var toInexact = function(n) {
        if (typeof(n) === 'number')
            return FloatPoint.makeInstance(n);
        return n.toInexact();
    };



    //////////////////////////////////////////////////////////////////////


    // add: scheme-number scheme-number -> scheme-number
    var add = function(x, y) {
        var sum;
        if (typeof(x) === 'number' && typeof(y) === 'number') {
            sum = x + y;
            if (isOverflow(sum)) {
                return (makeBignum(x)).add(makeBignum(y));
            }
        }
        if (x instanceof FloatPoint && y instanceof FloatPoint) {
            return x.add(y);
        }
        return addSlow(x, y);
    };

    var addSlow = makeNumericBinop(
        function(x, y) {
            var sum = x + y;
            if (isOverflow(sum)) {
                return (makeBignum(x)).add(makeBignum(y));
            } else {
                return sum;
            }
        },
        function(x, y) {
            return x.add(y);
        },
        {isXSpecialCase: function(x) {
            return isExactInteger(x) && _integerIsZero(x) },
         onXSpecialCase: function(x, y) { return y; },
         isYSpecialCase: function(y) {
             return isExactInteger(y) && _integerIsZero(y) },
         onYSpecialCase: function(x, y) { return x; }
        });


    // subtract: scheme-number scheme-number -> scheme-number
    var subtract = makeNumericBinop(
        function(x, y) {
            var diff = x - y;
            if (isOverflow(diff)) {
                return (makeBignum(x)).subtract(makeBignum(y));
            } else {
                return diff;
            }
        },
        function(x, y) {
            return x.subtract(y);
        },
        {isXSpecialCase: function(x) {
            return isExactInteger(x) && _integerIsZero(x) },
         onXSpecialCase: function(x, y) { return negate(y); },
         isYSpecialCase: function(y) {
             return isExactInteger(y) && _integerIsZero(y) },
         onYSpecialCase: function(x, y) { return x; }
        });


    // mulitply: scheme-number scheme-number -> scheme-number
    var multiply = function(x, y) {
        var prod;
        if (typeof(x) === 'number' && typeof(y) === 'number') {
            prod = x * y;
            if (isOverflow(prod)) {
                return (makeBignum(x)).multiply(makeBignum(y));
            } else {
                return prod;
            }
        }
        if (x instanceof FloatPoint && y instanceof FloatPoint) {
            return x.multiply(y);
        }
        return multiplySlow(x, y);
    };
    var multiplySlow = makeNumericBinop(
        function(x, y) {
            var prod = x * y;
            if (isOverflow(prod)) {
                return (makeBignum(x)).multiply(makeBignum(y));
            } else {
                return prod;
            }
        },
        function(x, y) {
            return x.multiply(y);
        },
        {isXSpecialCase: function(x) {
            return (isExactInteger(x) &&
                    (_integerIsZero(x) || _integerIsOne(x) || _integerIsNegativeOne(x))) },
         onXSpecialCase: function(x, y) {
             if (_integerIsZero(x))
                 return 0;
             if (_integerIsOne(x))
                 return y;
             if (_integerIsNegativeOne(x))
                 return negate(y);
         },
         isYSpecialCase: function(y) {
             return (isExactInteger(y) &&
                     (_integerIsZero(y) || _integerIsOne(y) || _integerIsNegativeOne(y)))},
         onYSpecialCase: function(x, y) {
             if (_integerIsZero(y))
                 return 0;
             if (_integerIsOne(y))
                 return x;
             if (_integerIsNegativeOne(y))
                 return negate(x);
         }
        });


    // divide: scheme-number scheme-number -> scheme-number
    var divide = makeNumericBinop(
        function(x, y) {
            if (_integerIsZero(y))
                throwRuntimeError("/: division by zero", x, y);
            var div = x / y;
            if (isOverflow(div)) {
                return (makeBignum(x)).divide(makeBignum(y));
            } else if (Math.floor(div) !== div) {
                return Rational.makeInstance(x, y);
            } else {
                return div;
            }
        },
        function(x, y) {
            return x.divide(y);
        },
        { isXSpecialCase: function(x) {
            return (eqv(x, 0));
        },
          onXSpecialCase: function(x, y) {
              if (eqv(y, 0)) {
                  throwRuntimeError("/: division by zero", x, y);
              }
              return 0;
          },
          isYSpecialCase: function(y) {
            return (eqv(y, 0)); },
          onYSpecialCase: function(x, y) {
              throwRuntimeError("/: division by zero", x, y);
          }
        });


    // equals: scheme-number scheme-number -> boolean
    var equals = makeNumericBinop(
        function(x, y) {
            return x === y;
        },
        function(x, y) {
            return x.equals(y);
        });


    // eqv: scheme-number scheme-number -> boolean
    var eqv = function(x, y) {
        if (x === y)
            return true;
        if (typeof(x) === 'number' && typeof(y) === 'number')
            return x === y;
        if (x === NEGATIVE_ZERO || y === NEGATIVE_ZERO)
            return x === y;
        if (x instanceof Complex || y instanceof Complex) {
            return (eqv(realPart(x), realPart(y)) &&
                    eqv(imaginaryPart(x), imaginaryPart(y)));
        }
        var ex = isExact(x), ey = isExact(y);
        return (((ex && ey) || (!ex && !ey)) && equals(x, y));
    };

    // approxEqual: scheme-number scheme-number scheme-number -> boolean
    var approxEquals = function(x, y, delta) {
        return lessThan(abs(subtract(x, y)),
                        delta);
    };

    // greaterThanOrEqual: scheme-number scheme-number -> boolean
    var greaterThanOrEqual = makeNumericBinop(
        function(x, y) {
            return x >= y;
        },
        function(x, y) {
            if (!(isReal(x) && isReal(y)))
                throwRuntimeError(
                    ">=: couldn't be applied to complex number", x, y);
            return x.greaterThanOrEqual(y);
        });


    // lessThanOrEqual: scheme-number scheme-number -> boolean
    var lessThanOrEqual = makeNumericBinop(
        function(x, y){

            return x <= y;
        },
        function(x, y) {
            if (!(isReal(x) && isReal(y)))
                throwRuntimeError("<=: couldn't be applied to complex number", x, y);
            return x.lessThanOrEqual(y);
        });


    // greaterThan: scheme-number scheme-number -> boolean
    var greaterThan = makeNumericBinop(
        function(x, y){
            return x > y;
        },
        function(x, y) {
            if (!(isReal(x) && isReal(y)))
                throwRuntimeError(">: couldn't be applied to complex number", x, y);
            return x.greaterThan(y);
        });


    // lessThan: scheme-number scheme-number -> boolean
    var lessThan = makeNumericBinop(
        function(x, y){

            return x < y;
        },
        function(x, y) {
            if (!(isReal(x) && isReal(y)))
                throwRuntimeError("<: couldn't be applied to complex number", x, y);
            return x.lessThan(y);
        });



    // expt: scheme-number scheme-number -> scheme-number
    var expt = (function() {
        var _expt = makeNumericBinop(
            function(x, y){
                var pow = Math.pow(x, y);
                if (isOverflow(pow)) {
                    return (makeBignum(x)).expt(makeBignum(y));
                } else {
                    return pow;
                }
            },
            function(x, y) {
                if (equals(y, 0)) {
                    return add(y, 1);
                } else {
                    return x.expt(y);
                }
            });
        return function(x, y) {
            if (equals(y, 0))
                return add(y, 1);
            if (isReal(y) && lessThan(y, 0)) {
                return _expt(divide(1, x), negate(y));
            }
            return _expt(x, y);
        };
    })();


    // exp: scheme-number -> scheme-number
    var exp = function(n) {
        if ( eqv(n, 0) ) {
                return 1;
        }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.exp(n));
        }
        return n.exp();
    };


    // modulo: scheme-number scheme-number -> scheme-number
    var modulo = function(m, n) {
        if (! isInteger(m)) {
            throwRuntimeError('modulo: the first argument '
                              + m + " is not an integer.", m, n);
        }
        if (! isInteger(n)) {
            throwRuntimeError('modulo: the second argument '
                              + n + " is not an integer.", m, n);
        }
        var result;
        if (typeof(m) === 'number') {
            result = m % n;
            if (n < 0) {
                if (result <= 0)
                    return result;
                else
                    return result + n;
            } else {
                if (result < 0)
                    return result + n;
                else
                    return result;
            }
        }
        result = _integerModulo(floor(m), floor(n));
        // The sign of the result should match the sign of n.
        if (lessThan(n, 0)) {
            if (lessThanOrEqual(result, 0)) {
                return result;
            }
            return add(result, n);

        } else {
            if (lessThan(result, 0)) {
                return add(result, n);
            }
            return result;
        }
    };



    // numerator: scheme-number -> scheme-number
    var numerator = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.numerator();
    };


    // denominator: scheme-number -> scheme-number
    var denominator = function(n) {
        if (typeof(n) === 'number')
            return 1;
        return n.denominator();
    };

    // sqrt: scheme-number -> scheme-number
    var sqrt = function(n) {
        if (typeof(n) === 'number') {
            if (n >= 0) {
                var result = Math.sqrt(n);
                if (Math.floor(result) === result) {
                    return result;
                } else {
                    return FloatPoint.makeInstance(result);
                }
            } else {
                return (Complex.makeInstance(0, sqrt(-n)));
            }
        }
        return n.sqrt();
    };

    // abs: scheme-number -> scheme-number
    var abs = function(n) {
        if (typeof(n) === 'number') {
            return Math.abs(n);
        }
        return n.abs();
    };

    // floor: scheme-number -> scheme-number
    var floor = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.floor();
    };

    // ceiling: scheme-number -> scheme-number
    var ceiling = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.ceiling();
    };

    // conjugate: scheme-number -> scheme-number
    var conjugate = function(n) {
        if (typeof(n) === 'number')
            return n;
        return n.conjugate();
    };

    // magnitude: scheme-number -> scheme-number
    var magnitude = function(n) {
        if (typeof(n) === 'number')
            return Math.abs(n);
        return n.magnitude();
    };


    // log: scheme-number -> scheme-number
    var log = function(n) {
        if ( eqv(n, 1) ) {
                return 0;
        }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.log(n));
        }
        return n.log();
    };

    // angle: scheme-number -> scheme-number
    var angle = function(n) {
        if (typeof(n) === 'number') {
            if (n > 0)
                return 0;
            else
                return FloatPoint.pi;
        }
        return n.angle();
    };

    // tan: scheme-number -> scheme-number
    var tan = function(n) {
        if (eqv(n, 0)) { return 0; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.tan(n));
        }
        return n.tan();
    };

    // atan: scheme-number -> scheme-number
    var atan = function(n) {
        if (eqv(n, 0)) { return 0; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.atan(n));
        }
        return n.atan();
    };

    // cos: scheme-number -> scheme-number
    var cos = function(n) {
        if (eqv(n, 0)) { return 1; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.cos(n));
        }
        return n.cos();
    };

    // sin: scheme-number -> scheme-number
    var sin = function(n) {
        if (eqv(n, 0)) { return 0; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.sin(n));
        }
        return n.sin();
    };

    // acos: scheme-number -> scheme-number
    var acos = function(n) {
        if (eqv(n, 1)) { return 0; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.acos(n));
        }
        return n.acos();
    };

    // asin: scheme-number -> scheme-number
    var asin = function(n) {
        if (eqv(n, 0)) { return 0; }
        if (typeof(n) === 'number') {
            return FloatPoint.makeInstance(Math.asin(n));
        }
        return n.asin();
    };

    // imaginaryPart: scheme-number -> scheme-number
    var imaginaryPart = function(n) {
        if (typeof(n) === 'number') {
            return 0;
        }
        return n.imaginaryPart();
    };

    // realPart: scheme-number -> scheme-number
    var realPart = function(n) {
        if (typeof(n) === 'number') {
            return n;
        }
        return n.realPart();
    };

    // round: scheme-number -> scheme-number
    var round = function(n) {
        if (typeof(n) === 'number') {
            return n;
        }
        return n.round();
    };



    // sqr: scheme-number -> scheme-number
    var sqr = function(x) {
        return multiply(x, x);
    };


    // integerSqrt: scheme-number -> scheme-number
    var integerSqrt = function(x) {
        if (! isInteger(x)) {
            throwRuntimeError('integer-sqrt: the argument ' + x.toString() +
                              " is not an integer.", x);
        }
        if (typeof (x) === 'number') {
            if(x < 0) {
                return Complex.makeInstance(0,
                                            Math.floor(Math.sqrt(-x)))
            } else {
                return Math.floor(Math.sqrt(x));
            }
        }
        return x.integerSqrt();
    };


    // gcd: scheme-number [scheme-number ...] -> scheme-number
    var gcd = function(first, rest) {
        if (! isInteger(first)) {
            throwRuntimeError('gcd: the argument ' + first.toString() +
                              " is not an integer.", first);
        }
        var a = abs(first), t, b;
        for(var i = 0; i < rest.length; i++) {
            b = abs(rest[i]);
            if (! isInteger(b)) {
                throwRuntimeError('gcd: the argument ' + b.toString() +
                                  " is not an integer.", b);
            }
            while (! _integerIsZero(b)) {
                t = a;
                a = b;
                b = _integerModulo(t, b);
            }
        }
        return a;
    };

    // lcm: scheme-number [scheme-number ...] -> scheme-number
    var lcm = function(first, rest) {
        if (! isInteger(first)) {
            throwRuntimeError('lcm: the argument ' + first.toString() +
                              " is not an integer.", first);
        }
        var result = abs(first);
        if (_integerIsZero(result)) { return 0; }
        for (var i = 0; i < rest.length; i++) {
            if (! isInteger(rest[i])) {
                throwRuntimeError('lcm: the argument ' + rest[i].toString() +
                                  " is not an integer.", rest[i]);
            }
            var divisor = _integerGcd(result, rest[i]);
            if (_integerIsZero(divisor)) {
                return 0;
            }
            result = divide(multiply(result, rest[i]), divisor);
        }
        return result;
    };


    var quotient = function(x, y) {
         if (! isInteger(x)) {
            throwRuntimeError('quotient: the first argument ' + x.toString() +
                              " is not an integer.", x);
        }
        if (! isInteger(y)) {
            throwRuntimeError('quotient: the second argument ' + y.toString() +
                              " is not an integer.", y);
        }
        return _integerQuotient(x, y);
    };


    var remainder = function(x, y) {
        if (! isInteger(x)) {
            throwRuntimeError('remainder: the first argument ' + x.toString() +
                              " is not an integer.", x);
        }
        if (! isInteger(y)) {
            throwRuntimeError('remainder: the second argument ' + y.toString() +
                              " is not an integer.", y);
        }
        return _integerRemainder(x, y);
    };


    // Implementation of the hyperbolic functions
    // http://en.wikipedia.org/wiki/Hyperbolic_cosine
    var cosh = function(x) {
        if (eqv(x, 0)) {
            return FloatPoint.makeInstance(1.0);
        }
        return divide(add(exp(x), exp(negate(x))),
                      2);
    };

    var sinh = function(x) {
        return divide(subtract(exp(x), exp(negate(x))),
                      2);
    };



    var makeComplexPolar = function(r, theta) {
        // special case: if theta is zero, just return
        // the scalar.
        if (eqv(theta, 0)) {
            return r;
        }
        return Complex.makeInstance(multiply(r, cos(theta)),
                                    multiply(r, sin(theta)));
    };



    //////////////////////////////////////////////////////////////////////

    // Helpers


    // IsFinite: scheme-number -> boolean
    // Returns true if the scheme number is finite or not.
    var isSchemeNumberFinite = function(n) {
        if (typeof(n) === 'number') {
            return isFinite(n);
        } else {
            return n.isFinite();
        }
    };

    // isOverflow: javascript-number -> boolean
    // Returns true if we consider the number an overflow.
    var MIN_FIXNUM = -(9e15);
    var MAX_FIXNUM = (9e15);
    var isOverflow = function(n) {
        return (n < MIN_FIXNUM ||  MAX_FIXNUM < n);
    };


    // negate: scheme-number -> scheme-number
    // multiplies a number times -1.
    var negate = function(n) {
        if (typeof(n) === 'number') {
            return -n;
        }
        return n.negate();
    };


    // halve: scheme-number -> scheme-number
    // Divide a number by 2.
    var halve = function(n) {
        return divide(n, 2);
    };


    // timesI: scheme-number scheme-number
    // multiplies a number times i.
    var timesI = function(x) {
        return multiply(x, plusI);
    };


    // fastExpt: computes n^k by squaring.
    // n^k = (n^2)^(k/2)
    // Assumes k is non-negative integer.
    var fastExpt = function(n, k) {
        var acc = 1;
        while (true) {
            if (_integerIsZero(k)) {
                return acc;
            }
            if (equals(modulo(k, 2), 0)) {
                n = multiply(n, n);
                k = divide(k, 2);
            } else {
                acc = multiply(acc, n);
                k = subtract(k, 1);
            }
        }
    };



    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////


    // Integer operations
    // Integers are either represented as fixnums or as BigIntegers.

    // makeIntegerBinop: (fixnum fixnum -> X) (BigInteger BigInteger -> X) -> X
    // Helper to collect the common logic for coersing integer fixnums or bignums to a
    // common type before doing an operation.
    var makeIntegerBinop = function(onFixnums, onBignums, options) {
        options = options || {};
        return (function(m, n) {
            if (m instanceof Rational) {
                m = numerator(m);
            } else if (m instanceof Complex) {
                m = realPart(m);
            }

            if (n instanceof Rational) {
                n = numerator(n);
            }else if (n instanceof Complex) {
                n = realPart(n);
            }

            if (typeof(m) === 'number' && typeof(n) === 'number') {
                var result = onFixnums(m, n);
                if (! isOverflow(result) ||
                    (options.ignoreOverflow)) {
                    return result;
                }
            }
            if (m instanceof FloatPoint || n instanceof FloatPoint) {
                if (options.doNotCoerseToFloating) {
                    return onFixnums(toFixnum(m), toFixnum(n));
                }
                else {
                    return FloatPoint.makeInstance(
                        onFixnums(toFixnum(m), toFixnum(n)));
                }
            }
            if (typeof(m) === 'number') {
                m = makeBignum(m);
            }
            if (typeof(n) === 'number') {
                n = makeBignum(n);
            }
            return onBignums(m, n);
        });
    };


    var makeIntegerUnOp = function(onFixnums, onBignums, options) {
        options = options || {};
        return (function(m) {
            if (m instanceof Rational) {
                m = numerator(m);
            } else if (m instanceof Complex) {
                m = realPart(m);
            }

            if (typeof(m) === 'number') {
                var result = onFixnums(m);
                if (! isOverflow(result) ||
                    (options.ignoreOverflow)) {
                    return result;
                }
            }
            if (m instanceof FloatPoint) {
                return onFixnums(toFixnum(m));
            }
            if (typeof(m) === 'number') {
                m = makeBignum(m);
            }
            return onBignums(m);
        });
    };



    // _integerModulo: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerModulo = makeIntegerBinop(
        function(m, n) {
            return m % n;
        },
        function(m, n) {
            return bnMod.call(m, n);
        });


    // _integerGcd: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerGcd = makeIntegerBinop(
        function(a, b) {
            var t;
            while (b !== 0) {
                t = a;
                a = b;
                b = t % b;
            }
            return a;
        },
        function(m, n) {
            return bnGCD.call(m, n);
        });


    // _integerIsZero: integer-scheme-number -> boolean
    // Returns true if the number is zero.
    var _integerIsZero = makeIntegerUnOp(
        function(n){
            return n === 0;
        },
        function(n) {
            return bnEquals.call(n, BigInteger.ZERO);
        }
    );


    // _integerIsOne: integer-scheme-number -> boolean
    var _integerIsOne = makeIntegerUnOp(
        function(n) {
            return n === 1;
        },
        function(n) {
            return bnEquals.call(n, BigInteger.ONE);
        });



    // _integerIsNegativeOne: integer-scheme-number -> boolean
    var _integerIsNegativeOne = makeIntegerUnOp(
        function(n) {
            return n === -1;
        },
        function(n) {
            return bnEquals.call(n, BigInteger.NEGATIVE_ONE);
        });



    // _integerAdd: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerAdd = makeIntegerBinop(
        function(m, n) {
            return m + n;
        },
        function(m, n) {
            return bnAdd.call(m, n);
        });

    // _integerSubtract: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerSubtract = makeIntegerBinop(
        function(m, n) {
            return m - n;
        },
        function(m, n) {
            return bnSubtract.call(m, n);
        });

    // _integerMultiply: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerMultiply = makeIntegerBinop(
        function(m, n) {
            return m * n;
        },
        function(m, n) {
            return bnMultiply.call(m, n);
        });

    //_integerQuotient: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerQuotient = makeIntegerBinop(
        function(m, n) {
            return ((m - (m % n))/ n);
        },
        function(m, n) {
            return bnDivide.call(m, n);
        });

    var _integerRemainder = makeIntegerBinop(
        function(m, n) {
            return m % n;
        },
        function(m, n) {
            return bnRemainder.call(m, n);
        });


    // _integerDivideToFixnum: integer-scheme-number integer-scheme-number -> fixnum
    var _integerDivideToFixnum = makeIntegerBinop(
        function(m, n) {
            return m / n;
        },
        function(m, n) {
            return toFixnum(m) / toFixnum(n);
        },
        {ignoreOverflow: true,
         doNotCoerseToFloating: true});


    // _integerEquals: integer-scheme-number integer-scheme-number -> boolean
    var _integerEquals = makeIntegerBinop(
        function(m, n) {
            return m === n;
        },
        function(m, n) {
            return bnEquals.call(m, n);
        },
        {doNotCoerseToFloating: true});

    // _integerGreaterThan: integer-scheme-number integer-scheme-number -> boolean
    var _integerGreaterThan = makeIntegerBinop(
        function(m, n) {
            return m > n;
        },
        function(m, n) {
            return bnCompareTo.call(m, n) > 0;
        },
        {doNotCoerseToFloating: true});

    // _integerLessThan: integer-scheme-number integer-scheme-number -> boolean
    var _integerLessThan = makeIntegerBinop(
        function(m, n) {
            return m < n;
        },
        function(m, n) {
            return bnCompareTo.call(m, n) < 0;
        },
        {doNotCoerseToFloating: true});

    // _integerGreaterThanOrEqual: integer-scheme-number integer-scheme-number -> boolean
    var _integerGreaterThanOrEqual = makeIntegerBinop(
        function(m, n) {
            return m >= n;
        },
        function(m, n) {
            return bnCompareTo.call(m, n) >= 0;
        },
        {doNotCoerseToFloating: true});

    // _integerLessThanOrEqual: integer-scheme-number integer-scheme-number -> boolean
    var _integerLessThanOrEqual = makeIntegerBinop(
        function(m, n) {
            return m <= n;
        },
        function(m, n) {
            return bnCompareTo.call(m, n) <= 0;
        },
        {doNotCoerseToFloating: true});



    //////////////////////////////////////////////////////////////////////
    // The boxed number types are expected to implement the following
    // interface.
    //
    // toString: -> string

    // level: number

    // liftTo: scheme-number -> scheme-number

    // isFinite: -> boolean

    // isInteger: -> boolean
    // Produce true if this number can be coersed into an integer.

    // isRational: -> boolean
    // Produce true if the number is rational.

    // isReal: -> boolean
    // Produce true if the number is real.

    // isExact: -> boolean
    // Produce true if the number is exact

    // toExact: -> scheme-number
    // Produce an exact number.

    // toFixnum: -> javascript-number
    // Produce a javascript number.

    // greaterThan: scheme-number -> boolean
    // Compare against instance of the same type.

    // greaterThanOrEqual: scheme-number -> boolean
    // Compare against instance of the same type.

    // lessThan: scheme-number -> boolean
    // Compare against instance of the same type.

    // lessThanOrEqual: scheme-number -> boolean
    // Compare against instance of the same type.

    // add: scheme-number -> scheme-number
    // Add with an instance of the same type.

    // subtract: scheme-number -> scheme-number
    // Subtract with an instance of the same type.

    // multiply: scheme-number -> scheme-number
    // Multiply with an instance of the same type.

    // divide: scheme-number -> scheme-number
    // Divide with an instance of the same type.

    // numerator: -> scheme-number
    // Return the numerator.

    // denominator: -> scheme-number
    // Return the denominator.

    // integerSqrt: -> scheme-number
    // Produce the integer square root.

    // sqrt: -> scheme-number
    // Produce the square root.

    // abs: -> scheme-number
    // Produce the absolute value.

    // floor: -> scheme-number
    // Produce the floor.

    // ceiling: -> scheme-number
    // Produce the ceiling.

    // conjugate: -> scheme-number
    // Produce the conjugate.

    // magnitude: -> scheme-number
    // Produce the magnitude.

    // log: -> scheme-number
    // Produce the log.

    // angle: -> scheme-number
    // Produce the angle.

    // atan: -> scheme-number
    // Produce the arc tangent.

    // cos: -> scheme-number
    // Produce the cosine.

    // sin: -> scheme-number
    // Produce the sine.

    // expt: scheme-number -> scheme-number
    // Produce the power to the input.

    // exp: -> scheme-number
    // Produce e raised to the given power.

    // acos: -> scheme-number
    // Produce the arc cosine.

    // asin: -> scheme-number
    // Produce the arc sine.

    // imaginaryPart: -> scheme-number
    // Produce the imaginary part

    // realPart: -> scheme-number
    // Produce the real part.

    // round: -> scheme-number
    // Round to the nearest integer.

    // equals: scheme-number -> boolean
    // Produce true if the given number of the same type is equal.



    //////////////////////////////////////////////////////////////////////

    // Rationals


    var Rational = function(n, d) {
        this.n = n;
        this.d = d;
    };


    Rational.prototype.toString = function() {
        if (_integerIsOne(this.d)) {
            return this.n.toString() + "";
        } else {
            return this.n.toString() + "/" + this.d.toString();
        }
    };


    Rational.prototype.level = 1;


    Rational.prototype.liftTo = function(target) {
        if (target.level === 2)
            return new FloatPoint(
                _integerDivideToFixnum(this.n, this.d));
        if (target.level === 3)
            return new Complex(this, 0);
        return throwRuntimeError("invalid level of Number", this, target);
    };

    Rational.prototype.isFinite = function() {
        return true;
    };

    Rational.prototype.equals = function(other) {
        return (other instanceof Rational &&
                _integerEquals(this.n, other.n) &&
                _integerEquals(this.d, other.d));
    };



    Rational.prototype.isInteger = function() {
        return _integerIsOne(this.d);
    };

    Rational.prototype.isRational = function() {
        return true;
    };

    Rational.prototype.isReal = function() {
        return true;
    };


    Rational.prototype.add = function(other) {
        return Rational.makeInstance(_integerAdd(_integerMultiply(this.n, other.d),
                                                 _integerMultiply(this.d, other.n)),
                                     _integerMultiply(this.d, other.d));
    };

    Rational.prototype.subtract = function(other) {
        return Rational.makeInstance(_integerSubtract(_integerMultiply(this.n, other.d),
                                                      _integerMultiply(this.d, other.n)),
                                     _integerMultiply(this.d, other.d));
    };

    Rational.prototype.negate = function() {
        return Rational.makeInstance(-this.n, this.d)
    };

    Rational.prototype.multiply = function(other) {
        return Rational.makeInstance(_integerMultiply(this.n, other.n),
                                     _integerMultiply(this.d, other.d));
    };

    Rational.prototype.divide = function(other) {
        if (_integerIsZero(this.d) || _integerIsZero(other.n)) {
            throwRuntimeError("/: division by zero", this, other);
        }
        return Rational.makeInstance(_integerMultiply(this.n, other.d),
                                     _integerMultiply(this.d, other.n));
    };


    Rational.prototype.toExact = function() {
        return this;
    };

    Rational.prototype.toInexact = function() {
        return FloatPoint.makeInstance(this.toFixnum());
    };


    Rational.prototype.isExact = function() {
        return true;
    };

    Rational.prototype.isInexact = function() {
        return false;
    };


    Rational.prototype.toFixnum = function() {
        return _integerDivideToFixnum(this.n, this.d);
    };

    Rational.prototype.numerator = function() {
        return this.n;
    };

    Rational.prototype.denominator = function() {
        return this.d;
    };

    Rational.prototype.greaterThan = function(other) {
        return _integerGreaterThan(_integerMultiply(this.n, other.d),
                                   _integerMultiply(this.d, other.n));
    };

    Rational.prototype.greaterThanOrEqual = function(other) {
        return _integerGreaterThanOrEqual(_integerMultiply(this.n, other.d),
                                          _integerMultiply(this.d, other.n));
    };

    Rational.prototype.lessThan = function(other) {
        return _integerLessThan(_integerMultiply(this.n, other.d),
                                _integerMultiply(this.d, other.n));
    };

    Rational.prototype.lessThanOrEqual = function(other) {
        return _integerLessThanOrEqual(_integerMultiply(this.n, other.d),
                                       _integerMultiply(this.d, other.n));
    };

    Rational.prototype.integerSqrt = function() {
        var result = sqrt(this);
        if (isRational(result)) {
            return toExact(floor(result));
        } else if (isReal(result)) {
            return toExact(floor(result));
        } else {
            return Complex.makeInstance(toExact(floor(realPart(result))),
                                        toExact(floor(imaginaryPart(result))));
        }
    };


    Rational.prototype.sqrt = function() {
        if (_integerGreaterThanOrEqual(this.n,  0)) {
            var newN = sqrt(this.n);
            var newD = sqrt(this.d);
            if (equals(floor(newN), newN) &&
                equals(floor(newD), newD)) {
                return Rational.makeInstance(newN, newD);
            } else {
                return FloatPoint.makeInstance(_integerDivideToFixnum(newN, newD));
            }
        } else {
            var newN = sqrt(negate(this.n));
            var newD = sqrt(this.d);
            if (equals(floor(newN), newN) &&
                equals(floor(newD), newD)) {
                return Complex.makeInstance(
                    0,
                    Rational.makeInstance(newN, newD));
            } else {
                return Complex.makeInstance(
                    0,
                    FloatPoint.makeInstance(_integerDivideToFixnum(newN, newD)));
            }
        }
    };

    Rational.prototype.abs = function() {
        return Rational.makeInstance(abs(this.n),
                                     this.d);
    };


    Rational.prototype.floor = function() {
        var quotient = _integerQuotient(this.n, this.d);
        if (_integerLessThan(this.n, 0)) {
            return subtract(quotient, 1);
        } else {
            return quotient;
        }
    };


    Rational.prototype.ceiling = function() {
        var quotient = _integerQuotient(this.n, this.d);
        if (_integerLessThan(this.n, 0)) {
            return quotient;
        } else {
            return add(quotient, 1);
        }
    };

    Rational.prototype.conjugate = function() {
        return this;
    };

    Rational.prototype.magnitude = Rational.prototype.abs;

    Rational.prototype.log = function(){
        return FloatPoint.makeInstance(Math.log(this.n / this.d));
    };

    Rational.prototype.angle = function(){
        if (_integerIsZero(this.n))
            return 0;
        if (_integerGreaterThan(this.n, 0))
            return 0;
        else
            return FloatPoint.pi;
    };

    Rational.prototype.tan = function(){
        return FloatPoint.makeInstance(Math.tan(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.atan = function(){
        return FloatPoint.makeInstance(Math.atan(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.cos = function(){
        return FloatPoint.makeInstance(Math.cos(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.sin = function(){
        return FloatPoint.makeInstance(Math.sin(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.expt = function(a){
        if (isExactInteger(a) && greaterThanOrEqual(a, 0)) {
            return fastExpt(this, a);
        }
        return FloatPoint.makeInstance(Math.pow(_integerDivideToFixnum(this.n, this.d),
                                                _integerDivideToFixnum(a.n, a.d)));
    };

    Rational.prototype.exp = function(){
        return FloatPoint.makeInstance(Math.exp(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.acos = function(){
        return FloatPoint.makeInstance(Math.acos(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.asin = function(){
        return FloatPoint.makeInstance(Math.asin(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.imaginaryPart = function(){
        return 0;
    };

    Rational.prototype.realPart = function(){
        return this;
    };


    Rational.prototype.round = function() {
        // FIXME: not correct when values are bignums
        if (equals(this.d, 2)) {
            // Round to even if it's a n/2
            var v = _integerDivideToFixnum(this.n, this.d);
            var fl = Math.floor(v);
            var ce = Math.ceil(v);
            if (_integerIsZero(fl % 2)) {
                return fl;
            }
            else {
                return ce;
            }
        } else {
            return Math.round(this.n / this.d);
        }
    };


    Rational.makeInstance = function(n, d) {
        if (n === undefined)
            throwRuntimeError("n undefined", n, d);

        if (d === undefined) { d = 1; }

        if (_integerIsZero(d)) {
            throwRuntimeError("division by zero: "+n+"/"+d);
        }

  if (_integerLessThan(d, 0)) {
            n = negate(n);
            d = negate(d);
        }

        var divisor = _integerGcd(abs(n), abs(d));
        n = _integerQuotient(n, divisor);
        d = _integerQuotient(d, divisor);

        // Optimization: if we can get around construction the rational
        // in favor of just returning n, do it:
        if (_integerIsOne(d) || _integerIsZero(n)) {
            return n;
        }

        return new Rational(n, d);
    };



    // Floating Point numbers
    var FloatPoint = function(n) {
        this.n = n;
    };
    FloatPoint = FloatPoint;


    var NaN = new FloatPoint(Number.NaN);
    var inf = new FloatPoint(Number.POSITIVE_INFINITY);
    var neginf = new FloatPoint(Number.NEGATIVE_INFINITY);

    // We use these two constants to represent the floating-point coersion
    // of bignums that can't be represented with fidelity.
    var TOO_POSITIVE_TO_REPRESENT = new FloatPoint(Number.POSITIVE_INFINITY);
    var TOO_NEGATIVE_TO_REPRESENT = new FloatPoint(Number.NEGATIVE_INFINITY);

    // Negative zero is a distinguished value representing -0.0.
    // There should only be one instance for -0.0.
    var NEGATIVE_ZERO = new FloatPoint(-0.0);
    var INEXACT_ZERO = new FloatPoint(0.0);

    FloatPoint.pi = new FloatPoint(Math.PI);
    FloatPoint.e = new FloatPoint(Math.E);
    FloatPoint.nan = NaN;
    FloatPoint.inf = inf;
    FloatPoint.neginf = neginf;

    FloatPoint.makeInstance = function(n) {
        if (isNaN(n)) {
            return FloatPoint.nan;
        } else if (n === Number.POSITIVE_INFINITY) {
            return FloatPoint.inf;
        } else if (n === Number.NEGATIVE_INFINITY) {
            return FloatPoint.neginf;
        } else if (n === 0) {
            if ((1/n) === -Infinity) {
                return NEGATIVE_ZERO;
            } else {
                return INEXACT_ZERO;
            }
        }
        return new FloatPoint(n);
    };


    FloatPoint.prototype.isExact = function() {
        return false;
    };

    FloatPoint.prototype.isInexact = function() {
        return true;
    };


    FloatPoint.prototype.isFinite = function() {
        return (isFinite(this.n) ||
                this === TOO_POSITIVE_TO_REPRESENT ||
                this === TOO_NEGATIVE_TO_REPRESENT);
    };


    FloatPoint.prototype.toExact = function() {
        // The precision of ieee is about 16 decimal digits, which we use here.
        if (! isFinite(this.n) || isNaN(this.n)) {
            throwRuntimeError("toExact: no exact representation for " + this, this);
        }

        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var intPart = parseInt(match[1]);
            var fracPart = parseInt(match[2]);
            var tenToDecimalPlaces = Math.pow(10, match[2].length);
            return Rational.makeInstance(Math.round(this.n * tenToDecimalPlaces),
                                         tenToDecimalPlaces);
        }
        else {
            return this.n;
        }
    };

    FloatPoint.prototype.toInexact = function() {
        return this;
    };

    FloatPoint.prototype.isInexact = function() {
        return true;
    };


    FloatPoint.prototype.level = 2;


    FloatPoint.prototype.liftTo = function(target) {
        if (target.level === 3)
            return new Complex(this, 0);
        return throwRuntimeError("invalid level of Number", this, target);
    };

    FloatPoint.prototype.toString = function() {
        if (isNaN(this.n))
            return "+nan.0";
        if (this.n === Number.POSITIVE_INFINITY)
            return "+inf.0";
        if (this.n === Number.NEGATIVE_INFINITY)
            return "-inf.0";
        if (this === NEGATIVE_ZERO)
            return "-0.0";
        var partialResult = this.n.toString();
        if (! partialResult.match('\\.')) {
            return partialResult + ".0";
        } else {
            return partialResult;
        }
    };


    FloatPoint.prototype.equals = function(other, aUnionFind) {
        return ((other instanceof FloatPoint) &&
                ((this.n === other.n)));
    };



    FloatPoint.prototype.isRational = function() {
        return this.isFinite();
    };

    FloatPoint.prototype.isInteger = function() {
        return this.isFinite() && this.n === Math.floor(this.n);
    };

    FloatPoint.prototype.isReal = function() {
        return true;
    };


    // sign: Number -> {-1, 0, 1}
    var sign = function(n) {
        if (lessThan(n, 0)) {
            return -1;
        } else if (greaterThan(n, 0)) {
            return 1;
        } else if (n === NEGATIVE_ZERO) {
            return -1;
        } else {
            return 0;
        }
    };


    FloatPoint.prototype.add = function(other) {
        if (this.isFinite() && other.isFinite()) {
            return FloatPoint.makeInstance(this.n + other.n);
        } else {
            if (isNaN(this.n) || isNaN(other.n)) {
                return NaN;
            } else if (this.isFinite() && ! other.isFinite()) {
                return other;
            } else if (!this.isFinite() && other.isFinite()) {
                return this;
            } else {
                return ((sign(this) * sign(other) === 1) ?
                        this : NaN);
            };
        }
    };

    FloatPoint.prototype.subtract = function(other) {
        if (this.isFinite() && other.isFinite()) {
            return FloatPoint.makeInstance(this.n - other.n);
        } else if (isNaN(this.n) || isNaN(other.n)) {
            return NaN;
        } else if (! this.isFinite() && ! other.isFinite()) {
            if (sign(this) === sign(other)) {
                return NaN;
            } else {
                return this;
            }
        } else if (this.isFinite()) {
            return multiply(other, -1);
        } else {  // other.isFinite()
            return this;
        }
    };


    FloatPoint.prototype.negate = function() {
        return FloatPoint.makeInstance(-this.n);
    };

    FloatPoint.prototype.multiply = function(other) {
        return FloatPoint.makeInstance(this.n * other.n);
    };

    FloatPoint.prototype.divide = function(other) {
        return FloatPoint.makeInstance(this.n / other.n);
    };


    FloatPoint.prototype.toFixnum = function() {
        return this.n;
    };

    FloatPoint.prototype.numerator = function() {
        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var afterDecimal = parseInt(match[2]);
            var factorToInt = Math.pow(10, match[2].length);
            var extraFactor = _integerGcd(factorToInt, afterDecimal);
            var multFactor = factorToInt / extraFactor;
            return FloatPoint.makeInstance( Math.round(this.n * multFactor) );
        } else {
            return this;
        }
    };

    FloatPoint.prototype.denominator = function() {
        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var afterDecimal = parseInt(match[2]);
            var factorToInt = Math.pow(10, match[2].length);
            var extraFactor = _integerGcd(factorToInt, afterDecimal);
            return FloatPoint.makeInstance( Math.round(factorToInt/extraFactor) );
        } else {
            return FloatPoint.makeInstance(1);
        }
    };


    FloatPoint.prototype.floor = function() {
        return FloatPoint.makeInstance(Math.floor(this.n));
    };

    FloatPoint.prototype.ceiling = function() {
        return FloatPoint.makeInstance(Math.ceil(this.n));
    };


    FloatPoint.prototype.greaterThan = function(other) {
        return this.n > other.n;
    };

    FloatPoint.prototype.greaterThanOrEqual = function(other) {
        return this.n >= other.n;
    };

    FloatPoint.prototype.lessThan = function(other) {
        return this.n < other.n;
    };

    FloatPoint.prototype.lessThanOrEqual = function(other) {
        return this.n <= other.n;
    };


    FloatPoint.prototype.integerSqrt = function() {
        if (this === NEGATIVE_ZERO) { return this; }
        if (isInteger(this)) {
            if(this.n >= 0) {
                return FloatPoint.makeInstance(Math.floor(Math.sqrt(this.n)));
            } else {
                return Complex.makeInstance(
                    INEXACT_ZERO,
                    FloatPoint.makeInstance(Math.floor(Math.sqrt(-this.n))));
            }
        } else {
            throwRuntimeError("integerSqrt: can only be applied to an integer", this);
        }
    };

    FloatPoint.prototype.sqrt = function() {
        if (this.n < 0) {
            var result = Complex.makeInstance(
                0,
                FloatPoint.makeInstance(Math.sqrt(-this.n)));
            return result;
        } else {
            return FloatPoint.makeInstance(Math.sqrt(this.n));
        }
    };

    FloatPoint.prototype.abs = function() {
        return FloatPoint.makeInstance(Math.abs(this.n));
    };



    FloatPoint.prototype.log = function(){
        if (this.n < 0)
            return (new Complex(this, 0)).log();
        else
            return FloatPoint.makeInstance(Math.log(this.n));
    };

    FloatPoint.prototype.angle = function(){
        if (0 === this.n)
            return 0;
        if (this.n > 0)
            return 0;
        else
            return FloatPoint.pi;
    };

    FloatPoint.prototype.tan = function(){
        return FloatPoint.makeInstance(Math.tan(this.n));
    };

    FloatPoint.prototype.atan = function(){
        return FloatPoint.makeInstance(Math.atan(this.n));
    };

    FloatPoint.prototype.cos = function(){
        return FloatPoint.makeInstance(Math.cos(this.n));
    };

    FloatPoint.prototype.sin = function(){
        return FloatPoint.makeInstance(Math.sin(this.n));
    };

    FloatPoint.prototype.expt = function(a){
        if (this.n === 1) {
            if (a.isFinite()) {
                return this;
            } else if (isNaN(a.n)){
                return this;
            } else {
                return this;
            }
        } else {
            return FloatPoint.makeInstance(Math.pow(this.n, a.n));
        }
    };

    FloatPoint.prototype.exp = function(){
        return FloatPoint.makeInstance(Math.exp(this.n));
    };

    FloatPoint.prototype.acos = function(){
        return FloatPoint.makeInstance(Math.acos(this.n));
    };

    FloatPoint.prototype.asin = function(){
        return FloatPoint.makeInstance(Math.asin(this.n));
    };

    FloatPoint.prototype.imaginaryPart = function(){
        return 0;
    };

    FloatPoint.prototype.realPart = function(){
        return this;
    };


    FloatPoint.prototype.round = function(){
        if (isFinite(this.n)) {
            if (this === NEGATIVE_ZERO) {
                return this;
            }
            if (Math.abs(Math.floor(this.n) - this.n) === 0.5) {
                if (Math.floor(this.n) % 2 === 0)
                    return FloatPoint.makeInstance(Math.floor(this.n));
                return FloatPoint.makeInstance(Math.ceil(this.n));
            } else {
                return FloatPoint.makeInstance(Math.round(this.n));
            }
        } else {
            return this;
        }
    };


    FloatPoint.prototype.conjugate = function() {
        return this;
    };

    FloatPoint.prototype.magnitude = FloatPoint.prototype.abs;



    //////////////////////////////////////////////////////////////////////
    // Complex numbers
    //////////////////////////////////////////////////////////////////////

    var Complex = function(r, i){
        this.r = r;
        this.i = i;
    };

    // Constructs a complex number from two basic number r and i.  r and i can
    // either be plt.type.Rational or plt.type.FloatPoint.
    Complex.makeInstance = function(r, i){
        if (i === undefined) { i = 0; }
        if (isExact(i) && isInteger(i) && _integerIsZero(i)) {
            return r;
        }
        if (isInexact(r) || isInexact(i)) {
            r = toInexact(r);
            i = toInexact(i);
        }
        return new Complex(r, i);
    };

    Complex.prototype.toString = function() {
        var realPart = this.r.toString(), imagPart = this.i.toString();
        if (imagPart[0] === '-' || imagPart[0] === '+') {
            return realPart + imagPart + 'i';
        } else {
            return realPart + "+" + imagPart + 'i';
        }
    };


    Complex.prototype.isFinite = function() {
        return isSchemeNumberFinite(this.r) && isSchemeNumberFinite(this.i);
    };


    Complex.prototype.isRational = function() {
        return isRational(this.r) && eqv(this.i, 0);
    };

    Complex.prototype.isInteger = function() {
        return (isInteger(this.r) &&
                eqv(this.i, 0));
    };

    Complex.prototype.toExact = function() {
        return Complex.makeInstance( toExact(this.r), toExact(this.i) );
    };

    Complex.prototype.toInexact = function() {
        return Complex.makeInstance(toInexact(this.r),
                                    toInexact(this.i));
    };


    Complex.prototype.isExact = function() {
        return isExact(this.r) && isExact(this.i);
    };


    Complex.prototype.isInexact = function() {
        return isInexact(this.r) || isInexact(this.i);
    };


    Complex.prototype.level = 3;


    Complex.prototype.liftTo = function(target){
        throwRuntimeError("Don't know how to lift Complex number", this, target);
    };

    Complex.prototype.equals = function(other) {
        var result = ((other instanceof Complex) &&
                      (equals(this.r, other.r)) &&
                      (equals(this.i, other.i)));
        return result;
    };



    Complex.prototype.greaterThan = function(other) {
        if (! this.isReal() || ! other.isReal()) {
            throwRuntimeError(">: expects argument of type real number", this, other);
        }
        return greaterThan(this.r, other.r);
    };

    Complex.prototype.greaterThanOrEqual = function(other) {
        if (! this.isReal() || ! other.isReal()) {
            throwRuntimeError(">=: expects argument of type real number", this, other);
        }
        return greaterThanOrEqual(this.r, other.r);
    };

    Complex.prototype.lessThan = function(other) {
        if (! this.isReal() || ! other.isReal()) {
            throwRuntimeError("<: expects argument of type real number", this, other);
        }
        return lessThan(this.r, other.r);
    };

    Complex.prototype.lessThanOrEqual = function(other) {
        if (! this.isReal() || ! other.isReal()) {
            throwRuntimeError("<=: expects argument of type real number", this, other);
        }
        return lessThanOrEqual(this.r, other.r);
    };


    Complex.prototype.abs = function(){
        if (!equals(this.i, 0).valueOf())
            throwRuntimeError("abs: expects argument of type real number", this);
        return abs(this.r);
    };

    Complex.prototype.toFixnum = function(){
        if (!equals(this.i, 0).valueOf())
            throwRuntimeError("toFixnum: expects argument of type real number", this);
        return toFixnum(this.r);
    };

    Complex.prototype.numerator = function() {
        if (!this.isReal())
            throwRuntimeError("numerator: can only be applied to real number", this);
        return numerator(this.n);
    };


    Complex.prototype.denominator = function() {
        if (!this.isReal())
            throwRuntimeError("floor: can only be applied to real number", this);
        return denominator(this.n);
    };

    Complex.prototype.add = function(other){
        return Complex.makeInstance(
            add(this.r, other.r),
            add(this.i, other.i));
    };

    Complex.prototype.subtract = function(other){
        return Complex.makeInstance(
            subtract(this.r, other.r),
            subtract(this.i, other.i));
    };

    Complex.prototype.negate = function() {
        return Complex.makeInstance(negate(this.r),
                                    negate(this.i));
    };


    Complex.prototype.multiply = function(other){
        // If the other value is real, just do primitive division
        if (other.isReal()) {
            return Complex.makeInstance(
                multiply(this.r, other.r),
                multiply(this.i, other.r));
        }
        var r = subtract(
            multiply(this.r, other.r),
            multiply(this.i, other.i));
        var i = add(
            multiply(this.r, other.i),
            multiply(this.i, other.r));
        return Complex.makeInstance(r, i);
    };





    Complex.prototype.divide = function(other){
        var a, b, c, d, r, x, y;
        // If the other value is real, just do primitive division
        if (other.isReal()) {
            return Complex.makeInstance(
                divide(this.r, other.r),
                divide(this.i, other.r));
        }

        if (this.isInexact() || other.isInexact()) {
            // http://portal.acm.org/citation.cfm?id=1039814
            // We currently use Smith's method, though we should
            // probably switch over to Priest's method.
            a = this.r;
            b = this.i;
            c = other.r;
            d = other.i;
            if (lessThanOrEqual(abs(d), abs(c))) {
                r = divide(d, c);
                x = divide(add(a, multiply(b, r)),
                           add(c, multiply(d, r)));
                y = divide(subtract(b, multiply(a, r)),
                           add(c, multiply(d, r)));
            } else {
                r = divide(c, d);
                x = divide(add(multiply(a, r), b),
                           add(multiply(c, r), d));
                y = divide(subtract(multiply(b, r), a),
                           add(multiply(c, r), d));
            }
            return Complex.makeInstance(x, y);
        } else {
            var con = conjugate(other);
            var up = multiply(this, con);

            // Down is guaranteed to be real by this point.
            var down = realPart(multiply(other, con));

            var result = Complex.makeInstance(
                divide(realPart(up), down),
                divide(imaginaryPart(up), down));
            return result;
        }
    };

    Complex.prototype.conjugate = function(){
        var result = Complex.makeInstance(
            this.r,
            subtract(0, this.i));

        return result;
    };

    Complex.prototype.magnitude = function(){
        var sum = add(
            multiply(this.r, this.r),
            multiply(this.i, this.i));
        return sqrt(sum);
    };

    Complex.prototype.isReal = function(){
        return eqv(this.i, 0);
    };

    Complex.prototype.integerSqrt = function() {
        if (isInteger(this)) {
            return integerSqrt(this.r);
        } else {
            throwRuntimeError("integerSqrt: can only be applied to an integer", this);
        }
    };

    Complex.prototype.sqrt = function(){
        if (this.isReal())
            return sqrt(this.r);
        // http://en.wikipedia.org/wiki/Square_root#Square_roots_of_negative_and_complex_numbers
        var r_plus_x = add(this.magnitude(), this.r);

        var r = sqrt(halve(r_plus_x));

        var i = divide(this.i, sqrt(multiply(r_plus_x, 2)));


        return Complex.makeInstance(r, i);
    };

    Complex.prototype.log = function(){
        var m = this.magnitude();
        var theta = this.angle();
        var result = add(
            log(m),
            timesI(theta));
        return result;
    };

    Complex.prototype.angle = function(){
        if (this.isReal()) {
            return angle(this.r);
        }
        if (equals(0, this.r)) {
            var tmp = halve(FloatPoint.pi);
            return greaterThan(this.i, 0) ?
                tmp : negate(tmp);
        } else {
            var tmp = atan(divide(abs(this.i), abs(this.r)));
            if (greaterThan(this.r, 0)) {
                return greaterThan(this.i, 0) ?
                    tmp : negate(tmp);
            } else {
                return greaterThan(this.i, 0) ?
                    subtract(FloatPoint.pi, tmp) : subtract(tmp, FloatPoint.pi);
            }
        }
    };

    var plusI = Complex.makeInstance(0, 1);
    var minusI = Complex.makeInstance(0, -1);


    Complex.prototype.tan = function() {
        return divide(this.sin(), this.cos());
    };

    Complex.prototype.atan = function(){
        if (equals(this, plusI) ||
            equals(this, minusI)) {
            return neginf;
        }
        return multiply(
            plusI,
            multiply(
                FloatPoint.makeInstance(0.5),
                log(divide(
                    add(plusI, this),
                    add(
                        plusI,
                        subtract(0, this))))));
    };

    Complex.prototype.cos = function(){
        if (this.isReal())
            return cos(this.r);
        var iz = timesI(this);
        var iz_negate = negate(iz);

        return halve(add(exp(iz), exp(iz_negate)));
    };

    Complex.prototype.sin = function(){
        if (this.isReal())
            return sin(this.r);
        var iz = timesI(this);
        var iz_negate = negate(iz);
        var z2 = Complex.makeInstance(0, 2);
        var exp_negate = subtract(exp(iz), exp(iz_negate));
        var result = divide(exp_negate, z2);
        return result;
    };


    Complex.prototype.expt = function(y){
        if (isExactInteger(y) && greaterThanOrEqual(y, 0)) {
            return fastExpt(this, y);
        }
        var expo = multiply(y, this.log());
        return exp(expo);
    };

    Complex.prototype.exp = function(){
        var r = exp(this.r);
        var cos_a = cos(this.i);
        var sin_a = sin(this.i);

        return multiply(
            r,
            add(cos_a, timesI(sin_a)));
    };

    Complex.prototype.acos = function(){
        if (this.isReal())
            return acos(this.r);
        var pi_half = halve(FloatPoint.pi);
        var iz = timesI(this);
        var root = sqrt(subtract(1, sqr(this)));
        var l = timesI(log(add(iz, root)));
        return add(pi_half, l);
    };

    Complex.prototype.asin = function(){
        if (this.isReal())
            return asin(this.r);

        var oneNegateThisSq =
            subtract(1, sqr(this));
        var sqrtOneNegateThisSq = sqrt(oneNegateThisSq);
        return multiply(2, atan(divide(this,
                                       add(1, sqrtOneNegateThisSq))));
    };

    Complex.prototype.ceiling = function(){
        if (!this.isReal())
            throwRuntimeError("ceiling: can only be applied to real number", this);
        return ceiling(this.r);
    };

    Complex.prototype.floor = function(){
        if (!this.isReal())
            throwRuntimeError("floor: can only be applied to real number", this);
        return floor(this.r);
    };

    Complex.prototype.imaginaryPart = function(){
        return this.i;
    };

    Complex.prototype.realPart = function(){
        return this.r;
    };

    Complex.prototype.round = function(){
        if (!this.isReal())
            throwRuntimeError("round: can only be applied to real number", this);
        return round(this.r);
    };



    var hashModifiersRegexp = new RegExp("^(#[ei]#[bodx]|#[bodx]#[ei]|#[bodxei])(.*)$")
    function rationalRegexp(digits) { return new RegExp("^([+-]?["+digits+"]+)/(["+digits+"]+)$"); }
    function matchComplexRegexp(radix, x) {
        var sign = "[+-]";
        var maybeSign = "[+-]?";
        var digits = digitsForRadix(radix)
        var expmark = "["+expMarkForRadix(radix)+"]"
        var digitSequence = "["+digits+"]+"

        var unsignedRational = digitSequence+"/"+digitSequence
        var rational = maybeSign + unsignedRational

        var noDecimal = digitSequence
        var decimalNumOnRight = "["+digits+"]*\\.["+digits+"]+"
        var decimalNumOnLeft = "["+digits+"]+\\.["+digits+"]*"

        var unsignedDecimal = "(?:" + noDecimal + "|" + decimalNumOnRight + "|" + decimalNumOnLeft + ")"

        var special = "(?:inf\.0|nan\.0|inf\.f|nan\.f)"

        var unsignedRealNoExp = "(?:" + unsignedDecimal + "|" + unsignedRational + ")"
        var unsignedReal = unsignedRealNoExp + "(?:" + expmark + maybeSign + digitSequence + ")?"
        var unsignedRealOrSpecial = "(?:" + unsignedReal + "|" + special + ")"
        var real = "(?:" + maybeSign + unsignedReal + "|" + sign + special + ")"

        var alt1 = new RegExp("^(" + rational + ")"
                             + "(" + sign + unsignedRational + "?)"
                             + "i$");
        var alt2 = new RegExp("^(" + real + ")?"
                             + "(" + sign + unsignedRealOrSpecial + "?)"
                             + "i$");
        var alt3 = new RegExp("^(" + real + ")@(" + real + ")$");

        var match1 = x.match(alt1)
        var match2 = x.match(alt2)
        var match3 = x.match(alt3)

        return match1 ? match1 :
               match2 ? match2 :
               match3 ? match3 :
             /* else */ false
    }

    function digitRegexp(digits) { return new RegExp("^[+-]?["+digits+"]+$"); }
    /**
    /* NB: !!!! flonum regexp only matches "X.", ".X", or "X.X", NOT "X", this
    /* must be separately checked with digitRegexp.
    /* I know this seems dumb, but the alternative would be that this regexp
    /* returns six matches, which also seems dumb.
    /***/
    function flonumRegexp(digits) {
        var decimalNumOnRight = "(["+digits+"]*)\\.(["+digits+"]+)"
        var decimalNumOnLeft = "(["+digits+"]+)\\.(["+digits+"]*)"
        return new RegExp("^(?:([+-]?)(" +
                          decimalNumOnRight+"|"+decimalNumOnLeft +
                          "))$");
    }
    function scientificPattern(digits, exp_mark) {
        var noDecimal = "["+digits+"]+"
        var decimalNumOnRight = "["+digits+"]*\\.["+digits+"]+"
        var decimalNumOnLeft = "["+digits+"]+\\.["+digits+"]*"
        return new RegExp("^(?:([+-]?" +
                          "(?:"+noDecimal+"|"+decimalNumOnRight+"|"+decimalNumOnLeft+")" +
                          ")["+exp_mark+"]([+-]?["+digits+"]+))$");
    }

    function digitsForRadix(radix) {
        return radix === 2  ? "01" :
               radix === 8  ? "0-7" :
               radix === 10 ? "0-9" :
               radix === 16 ? "0-9a-fA-F" :
               throwRuntimeError("digitsForRadix: invalid radix", this, radix)
    }

    function expMarkForRadix(radix) {
        return (radix === 2 || radix === 8 || radix === 10) ? "defsl" :
               (radix === 16)                               ? "sl" :
               throwRuntimeError("expMarkForRadix: invalid radix", this, radix)
    }

    function Exactness(i) {
      this.defaultp = function () { return i == 0; }
      this.exactp = function () { return i == 1; }
      this.inexactp = function () { return i == 2; }
    }

    Exactness.def = new Exactness(0);
    Exactness.on = new Exactness(1);
    Exactness.off = new Exactness(2);

    Exactness.prototype.intAsExactp = function () { return this.defaultp() || this.exactp(); };
    Exactness.prototype.floatAsInexactp = function () { return this.defaultp() || this.inexactp(); };


    // fromString: string boolean -> (scheme-number | false)
    var fromString = function(x, exactness) {
        var radix = 10
        var exactness = typeof exactness === 'undefined' ? Exactness.def :
                        exactness === true               ? Exactness.on :
                        exactness === false              ? Exactness.off :
           /* else */  throwRuntimeError( "exactness must be true or false"
                                        , this
                                        , r) ;

        var hMatch = x.toLowerCase().match(hashModifiersRegexp)
        if (hMatch) {
            var modifierString = hMatch[1].toLowerCase();

            var exactFlag = modifierString.match(new RegExp("(#[ei])"))
            var radixFlag = modifierString.match(new RegExp("(#[bodx])"))

            if (exactFlag) {
                var f = exactFlag[1].charAt(1)
                exactness = f === 'e' ? Exactness.on :
                            f === 'i' ? Exactness.off :
                         // this case is unreachable
                         throwRuntimeError("invalid exactness flag", this, r)
            }
            if (radixFlag) {
                var f = radixFlag[1].charAt(1)
                radix = f === 'b' ? 2 :
            f === 'o' ? 8 :
            f === 'd' ? 10 :
            f === 'x' ? 16 :
                         // this case is unreachable
                        throwRuntimeError("invalid radix flag", this, r)
            }
        }

        var numberString = hMatch ? hMatch[2] : x
        // if the string begins with a hash modifier, then it must parse as a
        // number, an invalid parse is an error, not false. False is returned
        // when the item could potentially have been read as a symbol.
        var mustBeANumberp = hMatch ? true : false

        return fromStringRaw(numberString, radix, exactness, mustBeANumberp)
    };

    function fromStringRaw(x, radix, exactness, mustBeANumberp) {
        var cMatch = matchComplexRegexp(radix, x);
        if (cMatch) {
          return Complex.makeInstance( fromStringRawNoComplex( cMatch[1] || "0"
                                                             , radix
                                                             , exactness
                                                             )
                                     , fromStringRawNoComplex( cMatch[2] === "+" ? "1"  :
                                                               cMatch[2] === "-" ? "-1" :
                                                               cMatch[2]
                                                             , radix
                                                             , exactness
                                                             ));
        }

        return fromStringRawNoComplex(x, radix, exactness, mustBeANumberp)
    }

    function fromStringRawNoComplex(x, radix, exactness, mustBeANumberp) {
        var aMatch = x.match(rationalRegexp(digitsForRadix(radix)));
        if (aMatch) {
            return Rational.makeInstance( fromStringRawNoComplex( aMatch[1]
                                                                , radix
                                                                , exactness
                                                                )
                                        , fromStringRawNoComplex( aMatch[2]
                                                                , radix
                                                                , exactness
                                                                ));
        }

        // Floating point tests
        if (x === '+nan.0' || x === '-nan.0')
            return FloatPoint.nan;
        if (x === '+inf.0')
            return FloatPoint.inf;
        if (x === '-inf.0')
            return FloatPoint.neginf;
        if (x === "-0.0") {
            return NEGATIVE_ZERO;
        }

        var fMatch = x.match(flonumRegexp(digitsForRadix(radix)))
        if (fMatch) {
            var integralPart = fMatch[3] !== undefined ? fMatch[3] : fMatch[5];
            var fractionalPart = fMatch[4] !== undefined ? fMatch[4] : fMatch[6];
            return parseFloat( fMatch[1]
                             , integralPart
                             , fractionalPart
                             , radix
                             , exactness
                             )
        }

        var sMatch = x.match(scientificPattern( digitsForRadix(radix)
                                              , expMarkForRadix(radix)
                                              ))
        if (sMatch) {
            var coefficient = fromStringRawNoComplex(sMatch[1], radix, exactness)
            var exponent = fromStringRawNoComplex(sMatch[2], radix, exactness)
            return multiply(coefficient, expt(radix, exponent));
        }

        // Finally, integer tests.
        if (x.match(digitRegexp(digitsForRadix(radix)))) {
            var n = parseInt(x, radix);
            if (isOverflow(n)) {
                return makeBignum(x);
            } else if (exactness.intAsExactp()) {
                return n;
            } else {
                return FloatPoint.makeInstance(n)
            }
        } else if (mustBeANumberp) {
            if(x.length===0) throwRuntimeError("no digits");
            throwRuntimeError("bad number: " + x, this);
        } else {
            return false;
        }
    };

    function parseFloat(sign, integralPart, fractionalPart, radix, exactness) {
        var sign = (sign == "-" ? -1 : 1);
        var integralPartValue = integralPart === ""  ? 0  :
                                exactness.intAsExactp() ? parseExactInt(integralPart, radix) :
                                                          parseInt(integralPart, radix)

        var fractionalNumerator = fractionalPart === "" ? 0 :
                                  exactness.intAsExactp() ? parseExactInt(fractionalPart, radix) :
                                                            parseInt(fractionalPart, radix)
        /* unfortunately, for these next two calculations, `expt` and `divide` */
        /* will promote to Bignum and Rational, respectively, but we only want */
        /* these if we're parsing in exact mode */
        var fractionalDenominator = exactness.intAsExactp() ? expt(radix, fractionalPart.length) :
                                                              Math.pow(radix, fractionalPart.length)
        var fractionalPartValue = fractionalPart === "" ? 0 :
                                  exactness.intAsExactp() ? divide(fractionalNumerator, fractionalDenominator) :
                                                            fractionalNumerator / fractionalDenominator

        var forceInexact = function(o) {
            return typeof o === "number" ? FloatPoint.makeInstance(o) :
                                           o.toInexact();
        }

        return exactness.floatAsInexactp() ? forceInexact(multiply(sign, add( integralPartValue, fractionalPartValue))) :
                                             multiply(sign, add(integralPartValue, fractionalPartValue));
    }

    function parseExactInt(str, radix) {
        return fromStringRawNoComplex(str, radix, Exactness.on, true);
    }

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////

    // The code below comes from Tom Wu's BigInteger implementation:

    // Copyright (c) 2005  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Basic JavaScript BN library - subset useful for RSA encryption.

    // Bits per digit
    var dbits;

    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary&0xffffff)==0xefcafe);

    // (public) Constructor
    function BigInteger(a,b,c) {
        if(a != null)
            if("number" == typeof a) this.fromNumber(a,b,c);
        else if(b == null && "string" != typeof a) this.fromString(a,256);
        else this.fromString(a,b);
    }

    // return new, unset BigInteger
    function nbi() { return new BigInteger(null); }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i,x,w,j,c,n) {
        while(--n >= 0) {
            var v = x*this[i++]+w[j]+c;
            c = Math.floor(v/0x4000000);
            w[j++] = v&0x3ffffff;
        }
        return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i,x,w,j,c,n) {
        var xl = x&0x7fff, xh = x>>15;
        while(--n >= 0) {
            var l = this[i]&0x7fff;
            var h = this[i++]>>15;
            var m = xh*l+h*xl;
            l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
            c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
            w[j++] = l&0x3fffffff;
        }
        return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i,x,w,j,c,n) {
        var xl = x&0x3fff, xh = x>>14;
        while(--n >= 0) {
            var l = this[i]&0x3fff;
            var h = this[i++]>>14;
            var m = xh*l+h*xl;
            l = xl*l+((m&0x3fff)<<14)+w[j]+c;
            c = (l>>28)+(m>>14)+xh*h;
            w[j++] = l&0xfffffff;
        }
        return c;
    }
    if(j_lm && (typeof(navigator) !== 'undefined' && navigator.appName == "Microsoft Internet Explorer")) {
        BigInteger.prototype.am = am2;
        dbits = 30;
    }
    else if(j_lm && (typeof(navigator) !== 'undefined' && navigator.appName != "Netscape")) {
        BigInteger.prototype.am = am1;
        dbits = 26;
    }
    else { // Mozilla/Netscape seems to prefer am3
        BigInteger.prototype.am = am3;
        dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1<<dbits)-1);
    BigInteger.prototype.DV = (1<<dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2,BI_FP);
    BigInteger.prototype.F1 = BI_FP-dbits;
    BigInteger.prototype.F2 = 2*dbits-BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = [];
    var rr,vv;
    rr = "0".charCodeAt(0);
    for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s,i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c==null)?-1:c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
        for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
        this.t = 1;
        this.s = (x<0)?-1:0;
        if(x > 0) this[0] = x;
        else if(x < -1) this[0] = x+DV;
        else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

    // (protected) set from string and radix
    function bnpFromString(s,b) {
        var k;
        if(b == 16) k = 4;
        else if(b == 8) k = 3;
        else if(b == 256) k = 8; // byte array
        else if(b == 2) k = 1;
        else if(b == 32) k = 5;
        else if(b == 4) k = 2;
        else { this.fromRadix(s,b); return; }
        this.t = 0;
        this.s = 0;
        var i = s.length, mi = false, sh = 0;
        while(--i >= 0) {
            var x = (k==8)?s[i]&0xff:intAt(s,i);
            if(x < 0) {
                if(s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if(sh == 0)
                this[this.t++] = x;
            else if(sh+k > this.DB) {
                this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
                this[this.t++] = (x>>(this.DB-sh));
            }
            else
                this[this.t-1] |= x<<sh;
            sh += k;
            if(sh >= this.DB) sh -= this.DB;
        }
        if(k == 8 && (s[0]&0x80) != 0) {
            this.s = -1;
            if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
        }
        this.clamp();
        if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
        var c = this.s&this.DM;
        while(this.t > 0 && this[this.t-1] == c) --this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
        if(this.s < 0) return "-"+this.negate().toString(b);
        var k;
        if(b == 16) k = 4;
        else if(b == 8) k = 3;
        else if(b == 2) k = 1;
        else if(b == 32) k = 5;
        else if(b == 4) k = 2;
        else return this.toRadix(b);
        var km = (1<<k)-1, d, m = false, r = [], i = this.t;
        var p = this.DB-(i*this.DB)%k;
        if(i-- > 0) {
            if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r.push(int2char(d)); }
            while(i >= 0) {
                if(p < k) {
                    d = (this[i]&((1<<p)-1))<<(k-p);
                    d |= this[--i]>>(p+=this.DB-k);
                }
                else {
                    d = (this[i]>>(p-=k))&km;
                    if(p <= 0) { p += this.DB; --i; }
                }
                if(d > 0) m = true;
                if(m) r.push(int2char(d));
            }
        }
        return m?r.join(""):"0";
    }

    // (public) -this
    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

    // (public) |this|
    function bnAbs() { return (this.s<0)?this.negate():this; }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
        var r = this.s-a.s;
        if(r != 0) return r;
        var i = this.t;
        if ( this.s < 0 ) {
                r = a.t - i;
        }
        else {
                r = i - a.t;
        }
        if(r != 0) return r;
        while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
        return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
        var r = 1, t;
        if((t=x>>>16) != 0) { x = t; r += 16; }
        if((t=x>>8) != 0) { x = t; r += 8; }
        if((t=x>>4) != 0) { x = t; r += 4; }
        if((t=x>>2) != 0) { x = t; r += 2; }
        if((t=x>>1) != 0) { x = t; r += 1; }
        return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
        if(this.t <= 0) return 0;
        return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n,r) {
        var i;
        for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
        for(i = n-1; i >= 0; --i) r[i] = 0;
        r.t = this.t+n;
        r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n,r) {
        for(var i = n; i < this.t; ++i) r[i-n] = this[i];
        r.t = Math.max(this.t-n,0);
        r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n,r) {
        var bs = n%this.DB;
        var cbs = this.DB-bs;
        var bm = (1<<cbs)-1;
        var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
        for(i = this.t-1; i >= 0; --i) {
            r[i+ds+1] = (this[i]>>cbs)|c;
            c = (this[i]&bm)<<bs;
        }
        for(i = ds-1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t+ds+1;
        r.s = this.s;
        r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n,r) {
        r.s = this.s;
        var ds = Math.floor(n/this.DB);
        if(ds >= this.t) { r.t = 0; return; }
        var bs = n%this.DB;
        var cbs = this.DB-bs;
        var bm = (1<<bs)-1;
        r[0] = this[ds]>>bs;
        for(var i = ds+1; i < this.t; ++i) {
            r[i-ds-1] |= (this[i]&bm)<<cbs;
            r[i-ds] = this[i]>>bs;
        }
        if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
        r.t = this.t-ds;
        r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a,r) {
        var i = 0, c = 0, m = Math.min(a.t,this.t);
        while(i < m) {
            c += this[i]-a[i];
            r[i++] = c&this.DM;
            c >>= this.DB;
        }
        if(a.t < this.t) {
            c -= a.s;
            while(i < this.t) {
                c += this[i];
                r[i++] = c&this.DM;
                c >>= this.DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while(i < a.t) {
                c -= a[i];
                r[i++] = c&this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = (c<0)?-1:0;
        if(c < -1) r[i++] = this.DV+c;
        else if(c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a,r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i+y.t;
        while(--i >= 0) r[i] = 0;
        for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
        r.s = 0;
        r.clamp();
        if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2*x.t;
        while(--i >= 0) r[i] = 0;
        for(i = 0; i < x.t-1; ++i) {
            var c = x.am(i,x[i],r,2*i,0,1);
            if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
                r[i+x.t] -= x.DV;
                r[i+x.t+1] = 1;
            }
        }
        if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
        r.s = 0;
        r.clamp();
    }


    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m,q,r) {
        var pm = m.abs();
        if(pm.t <= 0) return;
        var pt = this.abs();
        if(pt.t < pm.t) {
            if(q != null) q.fromInt(0);
            if(r != null) this.copyTo(r);
            return;
        }
        if(r == null) r = nbi();
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
        if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
        else { pm.copyTo(y); pt.copyTo(r); }
        var ys = y.t;
        var y0 = y[ys-1];
        if(y0 == 0) return;
        var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
        var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
        var i = r.t, j = i-ys, t = (q==null)?nbi():q;
        y.dlShiftTo(j,t);
        if(r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t,r);
        }
        BigInteger.ONE.dlShiftTo(ys,t);
        t.subTo(y,y);	// "negative" y so we can replace sub with am later
        while(y.t < ys) y[y.t++] = 0;
        while(--j >= 0) {
            // Estimate quotient digit
            var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
            if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
                y.dlShiftTo(j,t);
                r.subTo(t,r);
                while(r[i] < --qd) r.subTo(t,r);
            }
        }
        if(q != null) {
            r.drShiftTo(ys,q);
            if(ts != ms) BigInteger.ZERO.subTo(q,q);
        }
        r.t = ys;
        r.clamp();
        if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
        if(ts < 0) BigInteger.ZERO.subTo(r,r);
    }

    // (public) this mod a
    function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a,null,r);
        if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
        return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) { this.m = m; }
    function cConvert(x) {
        if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
        else return x;
    }
    function cRevert(x) { return x; }
    function cReduce(x) { x.divRemTo(this.m,null,x); }
    function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
    function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;

    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
        if(this.t < 1) return 0;
        var x = this[0];
        if((x&1) == 0) return 0;
        var y = x&3;		// y == 1/x mod 2^2
        y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
        y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
        y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return (y>0)?this.DV-y:-y;
    }

    // Montgomery reduction
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp&0x7fff;
        this.mph = this.mp>>15;
        this.um = (1<<(m.DB-15))-1;
        this.mt2 = 2*m.t;
    }

    // xR mod m
    function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t,r);
        r.divRemTo(this.m,null,r);
        if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
        return r;
    }

    // x/R mod m
    function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }

    // x = x/R mod m (HAC 14.32)
    function montReduce(x) {
        while(x.t <= this.mt2)	// pad x so am has enough room later
            x[x.t++] = 0;
        for(var i = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j = x[i]&0x7fff;
            var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
            // use am to combine the multiply-shift-add into one call
            j = i+this.m.t;
            x[j] += this.m.am(0,u0,x,i,0,this.m.t);
            // propagate carry
            while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
        }
        x.clamp();
        x.drShiftTo(this.m.t,x);
        if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

    // (protected) true iff this is even
    function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e,z) {
            if(e > 0xffffffff || e < 1) return BigInteger.ONE;
            var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
            g.copyTo(r);
            while(--i >= 0) {
                z.sqrTo(r,r2);
                if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
                else { var t = r; r = r2; r2 = t; }
            }
            return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e,m) {
        var z;
        if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
        return this.exp(e,z);
    }

    // protected
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.bnpExp = bnpExp;

    // public
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;

    // "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);

    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Extended JavaScript BN functions, required for RSA private ops.

    // Version 1.1: new BigInteger("0", 10) returns "proper" zero

    // (public)
    function bnClone() { var r = nbi(); this.copyTo(r); return r; }

    // (public) return value as integer
    function bnIntValue() {
        if(this.s < 0) {
            if(this.t == 1) return this[0]-this.DV;
            else if(this.t == 0) return -1;
        }
        else if(this.t == 1) return this[0];
        else if(this.t == 0) return 0;
        // assumes 16 < DB < 32
        return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
    }

    // (public) return value as byte
    function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
        if(this.s < 0) return -1;
        else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
        else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
        if(b == null) b = 10;
        if(this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b,cs);
        var d = nbv(a), y = nbi(), z = nbi(), r = "";
        this.divRemTo(d,y,z);
        while(y.signum() > 0) {
            r = (a+z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d,y,z);
        }
        return z.intValue().toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s,b) {
        this.fromInt(0);
        if(b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
        for(var i = 0; i < s.length; ++i) {
            var x = intAt(s,i);
            if(x < 0) {
                if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b*w+x;
            if(++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w,0);
                j = 0;
                w = 0;
            }
        }
        if(j > 0) {
            this.dMultiply(Math.pow(b,j));
            this.dAddOffset(w,0);
        }
        if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a,b,c) {
        if("number" == typeof b) {
            // new BigInteger(int,int,RNG)
            if(a < 2) this.fromInt(1);
            else {
                this.fromNumber(a,c);
                if(!this.testBit(a-1))	// force MSB set
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
                if(this.isEven()) this.dAddOffset(1,0); // force odd
                while(!this.isProbablePrime(b)) {
                    this.dAddOffset(2,0);
                    if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
                }
            }
        }
        else {
            // new BigInteger(int,RNG)
            var x = [], t = a&7;
            x.length = (a>>3)+1;
            b.nextBytes(x);
            if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
            this.fromString(x,256);
        }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
        var i = this.t, r = [];
        r[0] = this.s;
        var p = this.DB-(i*this.DB)%8, d, k = 0;
        if(i-- > 0) {
            if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
                r[k++] = d|(this.s<<(this.DB-p));
            while(i >= 0) {
                if(p < 8) {
                    d = (this[i]&((1<<p)-1))<<(8-p);
                    d |= this[--i]>>(p+=this.DB-8);
                }
                else {
                    d = (this[i]>>(p-=8))&0xff;
                    if(p <= 0) { p += this.DB; --i; }
                }
                if((d&0x80) != 0) d |= -256;
                if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
                if(k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }

    function bnEquals(a) { return(this.compareTo(a)==0); }
    function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
    function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a,op,r) {
        var i, f, m = Math.min(a.t,this.t);
        for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
        if(a.t < this.t) {
            f = a.s&this.DM;
            for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
            r.t = this.t;
        }
        else {
            f = this.s&this.DM;
            for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
            r.t = a.t;
        }
        r.s = op(this.s,a.s);
        r.clamp();
    }

    // (public) this & a
    function op_and(x,y) { return x&y; }
    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

    // (public) this | a
    function op_or(x,y) { return x|y; }
    function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

    // (public) this ^ a
    function op_xor(x,y) { return x^y; }
    function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

    // (public) this & ~a
    function op_andnot(x,y) { return x&~y; }
    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

    // (public) ~this
    function bnNot() {
        var r = nbi();
        for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
        var r = nbi();
        if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
        return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
        var r = nbi();
        if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
        return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
        if(x == 0) return -1;
        var r = 0;
        if((x&0xffff) == 0) { x >>= 16; r += 16; }
        if((x&0xff) == 0) { x >>= 8; r += 8; }
        if((x&0xf) == 0) { x >>= 4; r += 4; }
        if((x&3) == 0) { x >>= 2; r += 2; }
        if((x&1) == 0) ++r;
        return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
        for(var i = 0; i < this.t; ++i)
            if(this[i] != 0) return i*this.DB+lbit(this[i]);
        if(this.s < 0) return this.t*this.DB;
        return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
        var r = 0;
        while(x != 0) { x &= x-1; ++r; }
        return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
        var r = 0, x = this.s&this.DM;
        for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
        return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
        var j = Math.floor(n/this.DB);
        if(j >= this.t) return(this.s!=0);
        return((this[j]&(1<<(n%this.DB)))!=0);
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n,op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r,op,r);
        return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) { return this.changeBit(n,op_or); }

    // (public) this & ~(1<<n)
    function bnClearBit(n) { return this.changeBit(n,op_andnot); }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) { return this.changeBit(n,op_xor); }

    // (protected) r = this + a
    function bnpAddTo(a,r) {
        var i = 0, c = 0, m = Math.min(a.t,this.t);
        while(i < m) {
            c += this[i]+a[i];
            r[i++] = c&this.DM;
            c >>= this.DB;
        }
        if(a.t < this.t) {
            c += a.s;
            while(i < this.t) {
                c += this[i];
                r[i++] = c&this.DM;
                c >>= this.DB;
            }
            c += this.s;
        }
        else {
            c += this.s;
            while(i < a.t) {
                c += a[i];
                r[i++] = c&this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = (c<0)?-1:0;
        if(c > 0) r[i++] = c;
        else if(c < -1) r[i++] = this.DV+c;
        r.t = i;
        r.clamp();
    }

    // (public) this + a
    function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

    // (public) this - a
    function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

    // (public) this * a
    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

    // (public) this / a
    function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

    // (public) this % a
    function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
        var q = nbi(), r = nbi();
        this.divRemTo(a,q,r);
        return [q,r];
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
        this[this.t] = this.am(0,n-1,this,0,0,this.t);
        ++this.t;
        this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n,w) {
        if(n == 0) return;
        while(this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while(this[w] >= this.DV) {
            this[w] -= this.DV;
            if(++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    }

    // A "null" reducer
    function NullExp() {}
    function nNop(x) { return x; }
    function nMulTo(x,y,r) { x.multiplyTo(y,r); }
    function nSqrTo(x,r) { x.squareTo(r); }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

    // (public) this^e
    function bnPow(e) { return this.bnpExp(e,new NullExp()); }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a,n,r) {
        var i = Math.min(this.t+a.t,n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while(i > 0) r[--i] = 0;
        var j;
        for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
        for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
        r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a,n,r) {
        --n;
        var i = r.t = this.t+a.t-n;
        r.s = 0; // assumes a,this >= 0
        while(--i >= 0) r[i] = 0;
        for(i = Math.max(n-this.t,0); i < a.t; ++i)
            r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
        r.clamp();
        r.drShiftTo(1,r);
    }

    // Barrett modular reduction
    function Barrett(m) {
        // setup Barrett
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }

    function barrettConvert(x) {
        if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
        else if(x.compareTo(this.m) < 0) return x;
        else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
    }

    function barrettRevert(x) { return x; }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
        x.drShiftTo(this.m.t-1,this.r2);
        if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
        this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
        this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
        while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
        x.subTo(this.r2,x);
        while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

    // (public) this^e % m (HAC 14.85)
    function bnModPow(e,m) {
        var i = e.bitLength(), k, r = nbv(1), z;
        if(i <= 0) return r;
        else if(i < 18) k = 1;
        else if(i < 48) k = 3;
        else if(i < 144) k = 4;
        else if(i < 768) k = 5;
        else k = 6;
        if(i < 8)
            z = new Classic(m);
        else if(m.isEven())
            z = new Barrett(m);
        else
            z = new Montgomery(m);

        // precomputation
        var g = [], n = 3, k1 = k-1, km = (1<<k)-1;
        g[1] = z.convert(this);
        if(k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1],g2);
            while(n <= km) {
                g[n] = nbi();
                z.mulTo(g2,g[n-2],g[n]);
                n += 2;
            }
        }

        var j = e.t-1, w, is1 = true, r2 = nbi(), t;
        i = nbits(e[j])-1;
        while(j >= 0) {
            if(i >= k1) w = (e[j]>>(i-k1))&km;
            else {
                w = (e[j]&((1<<(i+1))-1))<<(k1-i);
                if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
            }

            n = k;
            while((w&1) == 0) { w >>= 1; --n; }
            if((i -= n) < 0) { i += this.DB; --j; }
            if(is1) {	// ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            }
            else {
                while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
                if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
                z.mulTo(r2,g[w],r);
            }

            while(j >= 0 && (e[j]&(1<<i)) == 0) {
                z.sqrTo(r,r2); t = r; r = r2; r2 = t;
                if(--i < 0) { i = this.DB-1; --j; }
            }
        }
        return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
        var x = (this.s<0)?this.negate():this.clone();
        var y = (a.s<0)?a.negate():a.clone();
        if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
        var i = x.getLowestSetBit(), g = y.getLowestSetBit();
        if(g < 0) return x;
        if(i < g) g = i;
        if(g > 0) {
            x.rShiftTo(g,x);
            y.rShiftTo(g,y);
        }
        while(x.signum() > 0) {
            if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
            if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
            if(x.compareTo(y) >= 0) {
                x.subTo(y,x);
                x.rShiftTo(1,x);
            }
            else {
                y.subTo(x,y);
                y.rShiftTo(1,y);
            }
        }
        if(g > 0) y.lShiftTo(g,y);
        return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
        if(n <= 0) return 0;
        var d = this.DV%n, r = (this.s<0)?n-1:0;
        if(this.t > 0)
            if(d == 0) r = this[0]%n;
        else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
        return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
        var ac = m.isEven();
        if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
        var u = m.clone(), v = this.clone();
        var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
        while(u.signum() != 0) {
            while(u.isEven()) {
                u.rShiftTo(1,u);
                if(ac) {
                    if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
                    a.rShiftTo(1,a);
                }
                else if(!b.isEven()) b.subTo(m,b);
                b.rShiftTo(1,b);
            }
            while(v.isEven()) {
                v.rShiftTo(1,v);
                if(ac) {
                    if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
                    c.rShiftTo(1,c);
                }
                else if(!d.isEven()) d.subTo(m,d);
                d.rShiftTo(1,d);
            }
            if(u.compareTo(v) >= 0) {
                u.subTo(v,u);
                if(ac) a.subTo(c,a);
                b.subTo(d,b);
            }
            else {
                v.subTo(u,v);
                if(ac) c.subTo(a,c);
                d.subTo(b,d);
            }
        }
        if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        if(d.compareTo(m) >= 0) return d.subtract(m);
        if(d.signum() < 0) d.addTo(m,d); else return d;
        if(d.signum() < 0) return d.add(m); else return d;
    }

    var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
    var lplim = (1<<26)/lowprimes[lowprimes.length-1];

    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
        var i, x = this.abs();
        if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
            for(i = 0; i < lowprimes.length; ++i)
                if(x[0] == lowprimes[i]) return true;
            return false;
        }
        if(x.isEven()) return false;
        i = 1;
        while(i < lowprimes.length) {
            var m = lowprimes[i], j = i+1;
            while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while(i < j) if(m%lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if(k <= 0) return false;
        var r = n1.shiftRight(k);
        t = (t+1)>>1;
        if(t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for(var i = 0; i < t; ++i) {
            a.fromInt(lowprimes[i]);
            var y = a.modPow(r,this);
            if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while(j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2,this);
                    if(y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if(y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }



    // protected
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;

    // public
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.expt = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

    // BigInteger interfaces not implemented in jsbn:

    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)



    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    // END OF copy-and-paste of jsbn.



    BigInteger.NEGATIVE_ONE = BigInteger.ONE.negate();


    // Other methods we need to add for compatibilty with js-numbers numeric tower.

    // add is implemented above.
    // subtract is implemented above.
    // multiply is implemented above.
    // equals is implemented above.
    // abs is implemented above.
    // negate is defined above.

    // makeBignum: string -> BigInteger
    var makeBignum = function(s) {
        if (typeof(s) === 'number') { s = s + ''; }
        s = expandExponent(s);
        return new BigInteger(s, 10);
    };

    var zerostring = function(n) {
        var buf = [];
        for (var i = 0; i < n; i++) {
            buf.push('0');
        }
        return buf.join('');
    };


    BigInteger.prototype.level = 0;
    BigInteger.prototype.liftTo = function(target) {
        if (target.level === 1) {
            return new Rational(this, 1);
        }
        if (target.level === 2) {
            var fixrep = this.toFixnum();
            if (fixrep === Number.POSITIVE_INFINITY)
                return TOO_POSITIVE_TO_REPRESENT;
            if (fixrep === Number.NEGATIVE_INFINITY)
                return TOO_NEGATIVE_TO_REPRESENT;
            return new FloatPoint(fixrep);
        }
        if (target.level === 3) {
            return new Complex(this, 0);
        }
        return throwRuntimeError("invalid level for BigInteger lift", this, target);
    };

    BigInteger.prototype.isFinite = function() {
        return true;
    };

    BigInteger.prototype.isInteger = function() {
        return true;
    };

    BigInteger.prototype.isRational = function() {
        return true;
    };

    BigInteger.prototype.isReal = function() {
        return true;
    };

    BigInteger.prototype.isExact = function() {
        return true;
    };

    BigInteger.prototype.isInexact = function() {
        return false;
    };

    BigInteger.prototype.toExact = function() {
        return this;
    };

    BigInteger.prototype.toInexact = function() {
        return FloatPoint.makeInstance(this.toFixnum());
    };

    BigInteger.prototype.toFixnum = function() {
        var result = 0, str = this.toString(), i;
        if (str[0] === '-') {
            for (i=1; i < str.length; i++) {
                result = result * 10 + Number(str[i]);
            }
            return -result;
        } else {
            for (i=0; i < str.length; i++) {
                result = result * 10 + Number(str[i]);
            }
            return result;
        }
    };


    BigInteger.prototype.greaterThan = function(other) {
        return this.compareTo(other) > 0;
    };

    BigInteger.prototype.greaterThanOrEqual = function(other) {
        return this.compareTo(other) >= 0;
    };

    BigInteger.prototype.lessThan = function(other) {
        return this.compareTo(other) < 0;
    };

    BigInteger.prototype.lessThanOrEqual = function(other) {
        return this.compareTo(other) <= 0;
    };

    // divide: scheme-number -> scheme-number
    // WARNING NOTE: we override the old version of divide.
    BigInteger.prototype.divide = function(other) {
        var quotientAndRemainder = bnDivideAndRemainder.call(this, other);
        if (quotientAndRemainder[1].compareTo(BigInteger.ZERO) === 0) {
            return quotientAndRemainder[0];
        } else {
            var result = add(quotientAndRemainder[0],
                             Rational.makeInstance(quotientAndRemainder[1], other));
            return result;
        }
    };

    BigInteger.prototype.numerator = function() {
        return this;
    };

    BigInteger.prototype.denominator = function() {
        return 1;
    };


    (function() {
        // Classic implementation of Newton-Ralphson square-root search,
        // adapted for integer-sqrt.
        // http://en.wikipedia.org/wiki/Newton's_method#Square_root_of_a_number
            var searchIter = function(n, guess) {
                while(!(lessThanOrEqual(sqr(guess),n) &&
                        lessThan(n,sqr(add(guess, 1))))) {
                    guess = floor(divide(add(guess,
                                             floor(divide(n, guess))),
                                         2));
                }
                return guess;
            };

            // integerSqrt: -> scheme-number
            BigInteger.prototype.integerSqrt = function() {
                var n;
                if(sign(this) >= 0) {
                    return searchIter(this, this);
                } else {
                    n = this.negate();
                    return Complex.makeInstance(0, searchIter(n, n));
                }
            };
    })();


    // sqrt: -> scheme-number
    // http://en.wikipedia.org/wiki/Newton's_method#Square_root_of_a_number
    // Produce the square root.
    (function() {
        // Get an approximation using integerSqrt, and then start another
        // Newton-Ralphson search if necessary.
        BigInteger.prototype.sqrt = function() {
            var approx = this.integerSqrt(), fix;
            if (eqv(sqr(approx), this)) {
                return approx;
            }
            fix = toFixnum(this);
            if (isFinite(fix)) {
                if (fix >= 0) {
                    return FloatPoint.makeInstance(Math.sqrt(fix));
                } else {
                    return Complex.makeInstance(
                        0,
                        FloatPoint.makeInstance(Math.sqrt(-fix)));
                }
            } else {
                return approx;
            }
        };
    })();

    // floor: -> scheme-number
    // Produce the floor.
    BigInteger.prototype.floor = function() {
        return this;
    }

    // ceiling: -> scheme-number
    // Produce the ceiling.
    BigInteger.prototype.ceiling = function() {
        return this;
    }


    // Until we have a feature-complete Big Number implementation, we'll
    // convert BigInteger objects into FloatPoint objects and perform
    // unsupported operations there.
    function temporaryAccuracyLosingWorkAroundForBigNums(function_name) {
      return function () {
        var inexact = this.toInexact();
        return inexact[function_name].apply(inexact, arguments);
      }
    }

    // conjugate: -> scheme-number
    // Produce the conjugate.
    BigInteger.prototype.conjugate = temporaryAccuracyLosingWorkAroundForBigNums("conjugate");

    // magnitude: -> scheme-number
    // Produce the magnitude.
    BigInteger.prototype.magnitude = temporaryAccuracyLosingWorkAroundForBigNums("magnitude");

    // log: -> scheme-number
    // Produce the log.
    BigInteger.prototype.log = temporaryAccuracyLosingWorkAroundForBigNums("log");

    // angle: -> scheme-number
    // Produce the angle.
    BigInteger.prototype.angle = temporaryAccuracyLosingWorkAroundForBigNums("angle");

    // atan: -> scheme-number
    // Produce the arc tangent.
    BigInteger.prototype.atan = temporaryAccuracyLosingWorkAroundForBigNums("atan");

    // acos: -> scheme-number
    // Produce the arc cosine.
    BigInteger.prototype.acos = temporaryAccuracyLosingWorkAroundForBigNums("acos");

    // asin: -> scheme-number
    // Produce the arc sine.
    BigInteger.prototype.asin = temporaryAccuracyLosingWorkAroundForBigNums("asin");

    // tan: -> scheme-number
    // Produce the tangent.
    BigInteger.prototype.tan = temporaryAccuracyLosingWorkAroundForBigNums("tan");

    // cos: -> scheme-number
    // Produce the cosine.
    BigInteger.prototype.cos = temporaryAccuracyLosingWorkAroundForBigNums("cos");

    // sin: -> scheme-number
    // Produce the sine.
    BigInteger.prototype.sin = temporaryAccuracyLosingWorkAroundForBigNums("sin");

    // exp: -> scheme-number
    // Produce e raised to the given power.
    BigInteger.prototype.exp = temporaryAccuracyLosingWorkAroundForBigNums("exp");

    BigInteger.prototype.imaginaryPart = function() {
            return 0;
    }
    BigInteger.prototype.realPart = function() {
            return this;
    }

    // round: -> scheme-number
    // Round to the nearest integer.
    BigInteger.prototype.round = function() {
            return this;
    }





    //////////////////////////////////////////////////////////////////////
    // toRepeatingDecimal: jsnum jsnum {limit: number}? -> [string, string, string]
    //
    // Given the numerator and denominator parts of a rational,
    // produces the repeating-decimal representation, where the first
    // part are the digits before the decimal, the second are the
    // non-repeating digits after the decimal, and the third are the
    // remaining repeating decimals.
    //
    // An optional limit on the decimal expansion can be provided, in which
    // case the search cuts off if we go past the limit.
    // If this happens, the third argument returned becomes '...' to indicate
    // that the search was prematurely cut off.
    var toRepeatingDecimal = (function() {
        var getResidue = function(r, d, limit) {
            var digits = [];
            var seenRemainders = {};
            seenRemainders[r] = true;
            while(true) {
                if (limit-- <= 0) {
                    return [digits.join(''), '...']
                }

                var nextDigit = quotient(
                    multiply(r, 10), d);
                var nextRemainder = remainder(
                    multiply(r, 10),
                    d);
                digits.push(nextDigit.toString());
                if (seenRemainders[nextRemainder]) {
                    r = nextRemainder;
                    break;
                } else {
                    seenRemainders[nextRemainder] = true;
                    r = nextRemainder;
                }
            }

            var firstRepeatingRemainder = r;
            var repeatingDigits = [];
            while (true) {
                var nextDigit = quotient(multiply(r, 10), d);
                var nextRemainder = remainder(
                    multiply(r, 10),
                    d);
                repeatingDigits.push(nextDigit.toString());
                if (equals(nextRemainder, firstRepeatingRemainder)) {
                    break;
                } else {
                    r = nextRemainder;
                }
            };

            var digitString = digits.join('');
            var repeatingDigitString = repeatingDigits.join('');

            while (digitString.length >= repeatingDigitString.length &&
                   (digitString.substring(
                       digitString.length - repeatingDigitString.length)
                    === repeatingDigitString)) {
                digitString = digitString.substring(
                    0, digitString.length - repeatingDigitString.length);
            }

            return [digitString, repeatingDigitString];

        };

        return function(n, d, options) {
            // default limit on decimal expansion; can be overridden
            var limit = 512;
            if (options && typeof(options.limit) !== 'undefined') {
                limit = options.limit;
            }
            if (! isInteger(n)) {
                throwRuntimeError('toRepeatingDecimal: n ' + n.toString() +
                                  " is not an integer.");
            }
            if (! isInteger(d)) {
                throwRuntimeError('toRepeatingDecimal: d ' + d.toString() +
                                  " is not an integer.");
            }
            if (equals(d, 0)) {
                throwRuntimeError('toRepeatingDecimal: d equals 0');
            }
            if (lessThan(d, 0)) {
                throwRuntimeError('toRepeatingDecimal: d < 0');
            }
             var sign = (lessThan(n, 0) ? "-" : "");
             n = abs(n);
             var beforeDecimalPoint = sign + quotient(n, d);
             var afterDecimals = getResidue(remainder(n, d), d, limit);
             return [beforeDecimalPoint].concat(afterDecimals);
        };
    })();
    //////////////////////////////////////////////////////////////////////




    // External interface of js-numbers:

    Numbers['fromFixnum'] = fromFixnum;
    Numbers['fromString'] = fromString;
    Numbers['makeBignum'] = makeBignum;
    Numbers['makeRational'] = Rational.makeInstance;
    Numbers['makeFloat'] = FloatPoint.makeInstance;
    Numbers['makeComplex'] = Complex.makeInstance;
    Numbers['makeComplexPolar'] = makeComplexPolar;

    Numbers['pi'] = FloatPoint.pi;
    Numbers['e'] = FloatPoint.e;
    Numbers['nan'] = FloatPoint.nan;
    Numbers['negative_inf'] = FloatPoint.neginf;
    Numbers['inf'] = FloatPoint.inf;
    Numbers['negative_one'] = -1;   // Rational.NEGATIVE_ONE;
    Numbers['zero'] = 0;            // Rational.ZERO;
    Numbers['one'] = 1;             // Rational.ONE;
    Numbers['i'] = plusI;
    Numbers['negative_i'] = minusI;
    Numbers['negative_zero'] = NEGATIVE_ZERO;

    Numbers['onThrowRuntimeError'] = onThrowRuntimeError;
    Numbers['isSchemeNumber'] = isSchemeNumber;
    Numbers['isRational'] = isRational;
    Numbers['isReal'] = isReal;
    Numbers['isExact'] = isExact;
    Numbers['isInexact'] = isInexact;
    Numbers['isInteger'] = isInteger;

    Numbers['toFixnum'] = toFixnum;
    Numbers['toExact'] = toExact;
    Numbers['toInexact'] = toInexact;
    Numbers['add'] = add;
    Numbers['subtract'] = subtract;
    Numbers['multiply'] = multiply;
    Numbers['divide'] = divide;
    Numbers['equals'] = equals;
    Numbers['eqv'] = eqv;
    Numbers['approxEquals'] = approxEquals;
    Numbers['greaterThanOrEqual'] = greaterThanOrEqual;
    Numbers['lessThanOrEqual'] = lessThanOrEqual;
    Numbers['greaterThan'] = greaterThan;
    Numbers['lessThan'] = lessThan;
    Numbers['expt'] = expt;
    Numbers['exp'] = exp;
    Numbers['modulo'] = modulo;
    Numbers['numerator'] = numerator;
    Numbers['denominator'] = denominator;
    Numbers['integerSqrt'] = integerSqrt;
    Numbers['sqrt'] = sqrt;
    Numbers['abs'] = abs;
    Numbers['quotient'] = quotient;
    Numbers['remainder'] = remainder;
    Numbers['floor'] = floor;
    Numbers['ceiling'] = ceiling;
    Numbers['conjugate'] = conjugate;
    Numbers['magnitude'] = magnitude;
    Numbers['log'] = log;
    Numbers['angle'] = angle;
    Numbers['tan'] = tan;
    Numbers['atan'] = atan;
    Numbers['cos'] = cos;
    Numbers['sin'] = sin;
    Numbers['tan'] = tan;
    Numbers['acos'] = acos;
    Numbers['asin'] = asin;
    Numbers['cosh'] = cosh;
    Numbers['sinh'] = sinh;
    Numbers['imaginaryPart'] = imaginaryPart;
    Numbers['realPart'] = realPart;
    Numbers['round'] = round;
    Numbers['sqr'] = sqr;
    Numbers['gcd'] = gcd;
    Numbers['lcm'] = lcm;

    Numbers['toRepeatingDecimal'] = toRepeatingDecimal;



    // The following exposes the class representations for easier
    // integration with other projects.
    Numbers['BigInteger'] = BigInteger;
    Numbers['Rational'] = Rational;
    Numbers['FloatPoint'] = FloatPoint;
    Numbers['Complex'] = Complex;

    Numbers['MIN_FIXNUM'] = MIN_FIXNUM;
    Numbers['MAX_FIXNUM'] = MAX_FIXNUM;

})();

},{}],41:[function(require,module,exports){
/**
 * An equation is an expression attached to a particular name. For example:
 *   f(x) = x + 1
 *   name: f
 *   equation: x + 1
 *   params: ['x']
 * In many cases, this will just be an expression with no name.
 * @param {string} name Function or variable name. Null if compute expression
 * @param {string[]} params List of parameter names if a function.
 * @param {ExpressionNode} expression
 */
var Equation = function (name, params, expression) {
  this.name = name;
  this.params = params || [];
  this.expression = expression;

  if (arguments.length !== 3) {
    throw new Error('Equation requires name, params, and expression');
  }

  this.signature = this.name;
  if (this.params.length > 0) {
    this.signature += '(' + this.params.join(',') + ')';
  }
};

module.exports = Equation;

/**
 * @returns True if a function
 */
Equation.prototype.isFunction = function () {
  return this.params.length > 0;
};

Equation.prototype.clone = function () {
  return new Equation(this.name, this.params.slice(), this.expression.clone());
};

},{}],40:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../../locale/current/calc');
  var commonMsg = require('../../locale/current/common');
; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/calc":257,"../../locale/current/common":258,"ejs":274}],38:[function(require,module,exports){
/**
 * Blockly Demo: Calc Graphics
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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

/**
 * @fileoverview Demonstration of Blockly: Calc Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('../../locale/current/calc');
var commonMsg = require('../../locale/current/common');

var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installCompute(blockly, generator, gensym);
};

function installCompute(blockly, generator, gensym) {
  blockly.Blocks.functional_compute = {
    helpUrl: '',
    init: function() {
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, msg.evaluate(), blockly.BlockValueType.NONE, [
        { name: 'ARG1', type: blockly.BlockValueType.NUMBER }
      ]);
    }
  };

  generator.functional_compute = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return "Calc.compute(" + arg1 +", 'block_id_" + this.id + "');\n";
  };
}

},{"../../locale/current/calc":257,"../../locale/current/common":258,"../sharedFunctionalBlocks":206}],257:[function(require,module,exports){
/*calc*/ module.exports = window.blockly.appLocale;
},{}]},{},[47]);
