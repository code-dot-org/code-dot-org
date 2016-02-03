require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/calc/main.js":[function(require,module,exports){
'use strict';

var appMain = require('../appMain');
window.Calc = require('./calc');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.calcMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Calc, levels, options);
};

},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","./blocks":"/home/ubuntu/staging/apps/build/js/calc/blocks.js","./calc":"/home/ubuntu/staging/apps/build/js/calc/calc.js","./levels":"/home/ubuntu/staging/apps/build/js/calc/levels.js"}],"/home/ubuntu/staging/apps/build/js/calc/calc.js":[function(require,module,exports){
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
var commonMsg = require('../locale');
var calcMsg = require('./locale');
var skins = require('../skins');
var levels = require('./levels');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var blockUtils = require('../block_utils');
var utils = require('../utils');
var _ = require('lodash');
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
  if (jsnums.isSchemeNumber(val) || typeof val === 'string') {
    return new ExpressionNode(val);
  }
  throw new Error('unexpected');
}

/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function (config) {
  // replace studioApp methods with our own
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  skin = config.skin;
  level = config.level;

  if (level.scale && level.scale.stepSpeed !== undefined) {
    stepSpeed = level.scale.stepSpeed;
  }

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_compute';
  config.enableShowCode = false;

  // We don't want icons in instructions
  config.skin.staticAvatar = null;
  config.skin.smallStaticAvatar = null;
  config.skin.failureAvatar = null;
  config.skin.winAvatar = null;

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html.ejs')(),
      controls: require('./controls.html.ejs')({
        assetUrl: studioApp.assetUrl
      }),
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default',
      inputOutputTable: level.inputOutputTable,
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

  config.loadAudio = function () {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function () {
    var svg = document.getElementById('svgCalc');
    svg.setAttribute('width', CANVAS_WIDTH);
    svg.setAttribute('height', CANVAS_HEIGHT);

    if (level.freePlay) {
      var background = document.getElementById('background');
      background.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/blockly/media/skins/calc/background_freeplay.png');
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
      solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks, config.forceInsertTopBlock);
    }

    appState.targetSet = generateEquationSetFromBlockXml(solutionBlocks);

    displayGoal(appState.targetSet);

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's studioApp.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Calc.resetButtonClick);

    if (Blockly.contractEditor) {
      Blockly.contractEditor.registerTestHandler(getCalcExampleFailure);
      Blockly.contractEditor.registerTestResetHandler(resetCalcExample);
    }
  };

  studioApp.init(config);
};

/**
 * @param {Blockly.Block}
 * @param {boolean} [evaluateInPlayspace] True if this test should also show
 *   evaluation in the play space
 * @returns {string} Error string, or null if success
 */
function getCalcExampleFailure(exampleBlock, evaluateInPlayspace) {
  try {
    var entireSet = new EquationSet(Blockly.mainBlockSpace.getTopBlocks());

    var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
    var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");

    studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);

    var actualEquation = EquationSet.getEquationFromBlock(actualBlock);
    var actual = entireSet.evaluateWithExpression(actualEquation.expression);

    var expectedEquation = EquationSet.getEquationFromBlock(expectedBlock);
    var expected = entireSet.evaluateWithExpression(expectedEquation.expression);

    var areEqual = jsnums.equals(expected.result, actual.result);

    if (evaluateInPlayspace) {
      var tokenList = constructTokenList(expectedEquation, null);
      if (!expected.err) {
        tokenList.push(new Token(' = ', false));
        tokenList.push(new Token(expected.result, !areEqual));
      }
      clearSvgExpression('answerExpression');
      displayEquation('userExpression', null, tokenList, 0, 'errorToken');
    }

    return areEqual ? null : "Does not match definition";
  } catch (error) {
    // Most Calc error messages were not meant to be user facing.
    return "Evaluation Failed.";
  }
}

function resetCalcExample() {
  clearSvgExpression('userExpression');
  displayGoal(appState.targetSet);
}

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
        throw new Error("Calc doesn't support goal with multiple functions or " + "mixed functions/vars");
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
Calc.runButtonClick = function () {
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

  clearSvgExpression('userExpression');
};

/**
 * Given some xml, geneates an expression set by loading blocks into the
 * blockspace.. Fails if there are already blocks in the workspace.
 */
function generateEquationSetFromBlockXml(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("generateTargetExpression shouldn't be called with blocks" + "if we already have blocks in the workspace");
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
  if (!expression.hasSameSignature(userExpression) || !userSet.computesFunctionCall()) {
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

  var setChildToValue = function setChildToValue(val, index) {
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
  } else if (!targetSet.computeEquation().expression.isIdenticalTo(userSet.computeEquation().expression)) {
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

  if (!targetSet.computeEquation().expression.isIdenticalTo(userSet.computeEquation().expression)) {
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
      return appSpecificFailureOutcome(calcMsg.missingVariableX({ 'var': targetConstants[i].name }));
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
  var setConstantsToValue = function setConstantsToValue(val, index) {
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
    var message = calcMsg.wrongOtherValuesX({ 'var': targetConstants[0].name });
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
  } else if (userSet.hasVariablesOrFunctions() || targetSet.hasVariablesOrFunctions()) {

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
      var levelComplete = outcome.result === ResultType.SUCCESS;
      outcome.testResults = studioApp.getTestResults(levelComplete);
      if (target && user.expression && user.expression.isEquivalentTo(target.expression)) {
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
Calc.execute = function () {
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
  if (appState.result === ResultType.SUCCESS && appState.userSet.isAnimatable() && !level.edit_blocks) {
    Calc.step(0);
  } else {
    displayComplexUserExpressions();
    timeoutList.setTimeout(function () {
      stopAnimatingAndDisplayFeedback();
    }, stepSpeed);
  }
};

function isPreAnimationFailure(testResult) {
  return testResult === TestResults.QUESTION_MARKS_IN_NUMBER_FIELD || testResult === TestResults.EMPTY_FUNCTIONAL_BLOCK || testResult === TestResults.EXTRA_TOP_BLOCKS_FAIL || testResult === TestResults.EXAMPLE_FAILED || testResult === TestResults.EMPTY_FUNCTION_NAME;
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
    appState.message = studioApp.getUnfilledFunctionalBlockError('functional_compute');
    return;
  }

  if (studioApp.hasQuestionMarksInNumberField()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
    return;
  }

  if (studioApp.hasEmptyFunctionOrVariableName()) {
    appState.result = ResultType.FAILURE;
    appState.testResults = TestResults.EMPTY_FUNCTION_NAME;
    appState.message = commonMsg.unnamedFunction();
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
    appState = $.extend(appState, Calc.checkExamples_());

    if (appState.result === null) {
      appState = $.extend(appState, Calc.evaluateResults_(appState.targetSet, appState.userSet));
    }
  }

  // Override default message for LEVEL_INCOMPLETE_FAIL
  if (appState.testResults === TestResults.LEVEL_INCOMPLETE_FAIL && !appState.message) {
    appState.message = calcMsg.levelIncompleteError();
  }
};

/**
 * @returns {Object} set of appState to be merged by caller
 */
Calc.checkExamples_ = function () {
  var outcome = {};
  if (!level.examplesRequired) {
    return outcome;
  }

  var exampleless = studioApp.getFunctionWithoutTwoExamples();
  if (exampleless) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({ functionName: exampleless });
    return outcome;
  }

  var unfilled = studioApp.getUnfilledFunctionalExample();
  if (unfilled) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;

    var name = unfilled.getRootBlock().getInputTargetBlock('ACTUAL').getTitleValue('NAME');
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({ functionName: name });
    return outcome;
  }

  var failingBlockName = studioApp.checkForFailingExamples(getCalcExampleFailure);
  if (failingBlockName) {
    outcome.result = false;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.exampleErrorMessage({ functionName: failingBlockName });
  }

  return outcome;
};

/**
 * If we have any functions or variables in our expression set, we don't support
 * animating evaluation.
 */
function displayComplexUserExpressions() {
  var result;
  clearSvgExpression('userExpression');

  // Clone userSet, as we might make small changes to them (i.e. if we need to
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
  if (userSet.hasVariablesOrFunctions() || computeEquation.expression.depth() > 0) {
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
  var highlightAllErrors = !targetSet.computesFunctionCall() && !targetSet.computesSingleVariable();

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
    var expectedEquation = highlightAllErrors ? targetSet.getEquation(userEquation.name) : null;

    tokenList = constructTokenList(userEquation, expectedEquation);

    displayEquation('userExpression', userEquation.signature, tokenList, numRows++, 'errorToken');
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
    if (evaluation.err instanceof ExpressionNode.DivideByZeroError || utils.isInfiniteRecursionError(evaluation.err)) {
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
    return [new Token(' = ', false), new Token(result, appState.failedInput)];
  } else if (targetSet.computeEquation() !== null) {
    expectedResult = targetSet.evaluate().result;
  }

  // add a tokenList diffing our results
  return constructTokenList(' = ').concat(constructTokenList(result, expectedResult));
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

  return constructTokenList(expression).concat(new Token(' = ', false)).concat(new Token(result, true)); // this should always be marked
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

/**
 * Gets rid of all the children from the svg of the given id
 * @param {id} string
 */
function clearSvgExpression(id) {
  var g = document.getElementById(id);
  if (!g) {
    return;
  }

  while (g.lastChild) {
    g.removeChild(g.lastChild);
  }
}

/**
 * Draws a user expression and each step collapsing it, up to given depth.
 * @returns True if it couldn't collapse any further at this depth.
 */
function animateUserExpression(maxNumSteps) {
  var userEquation = appState.userSet.computeEquation();
  if (!userEquation) {
    throw new Error('require user expression');
  }
  var userExpression = userEquation.expression;
  if (!userExpression) {
    return true;
  }

  var finished = false;

  if (appState.userSet.hasVariablesOrFunctions() || appState.targetSet.hasVariablesOrFunctions()) {
    throw new Error("Can't animate if either user/target have functions/vars");
  }

  clearSvgExpression('userExpression');

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
  var yPos = line * LINE_HEIGHT;
  g.setAttribute('transform', 'translate(' + xPadding + ', ' + yPos + ')');
}

/**
 * Deep clone a node, then removing any ids from the clone so that we don't have
 * duplicated ids.
 */
function cloneNodeWithoutIds(elementId) {
  var clone = document.getElementById(elementId).cloneNode(true);
  clone.removeAttribute("id");
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
    appDiv.setAttribute('class', 'svgCalcFeedback');
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
  studioApp.onReportComplete(response);
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/controls.html.ejs","./equation":"/home/ubuntu/staging/apps/build/js/calc/equation.js","./equationSet":"/home/ubuntu/staging/apps/build/js/calc/equationSet.js","./expressionNode":"/home/ubuntu/staging/apps/build/js/calc/expressionNode.js","./inputIterator":"/home/ubuntu/staging/apps/build/js/calc/inputIterator.js","./js-numbers/js-numbers.js":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js","./levels":"/home/ubuntu/staging/apps/build/js/calc/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js","./token":"/home/ubuntu/staging/apps/build/js/calc/token.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs","lodash":"/home/ubuntu/staging/apps/node_modules/lodash/dist/lodash.js"}],"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('./locale'); ; buf.push('\n\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgCalc">\n  <image id="background" height="400" width="400" x="0" y="0" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/blockly/media/skins/calc/background.png"></image>\n  <g id="userExpression" class="expr" transform="translate(0, 100)">\n  </g>\n  <g id="answerExpression" class="expr" transform="translate(0, 350)">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/calc/levels.js":[function(require,module,exports){
'use strict';

var msg = require('./locale');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'example1': {
    solutionBlocks: blockUtils.calcBlockXml('functional_times', [blockUtils.calcBlockXml('functional_plus', [1, 2]), blockUtils.calcBlockXml('functional_plus', [3, 4])]),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(blockUtils.blockOfType('functional_plus') + blockUtils.blockOfType('functional_minus') + blockUtils.blockOfType('functional_times') + blockUtils.blockOfType('functional_dividedby') + blockUtils.blockOfType('functional_math_number') + '<block type="functional_math_number_dropdown">' + '  <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">???</title>' + '</block>'),
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

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js"}],"/home/ubuntu/staging/apps/build/js/calc/inputIterator.js":[function(require,module,exports){
/**
 * Given a set of values (i.e. [1,2,3], and a number of parameters, generates
 * all possible combinations of values.
 */
'use strict';

var InputIterator = function InputIterator(values, numParams) {
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
  } while (wrapped && paramNum < this.numParams_);
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

},{}],"/home/ubuntu/staging/apps/build/js/calc/equationSet.js":[function(require,module,exports){
'use strict';

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
var EquationSet = function EquationSet(blocks) {
  this.compute_ = null; // an Equation
  this.equations_ = []; // a list of Equations

  if (blocks) {
    blocks.forEach(function (block) {
      var equation = EquationSet.getEquationFromBlock(block);
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
  return computeExpression.isVariable() && equation.expression.isNumber() && computeExpression.getValue() === equation.name;
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
    if (!otherEquation || !thisEquation.expression.isIdenticalTo(otherEquation.expression)) {
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
    if (!otherEquation || !thisEquation.expression.isEquivalentTo(otherEquation.expression)) {
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
  return evaluation.err && evaluation.err instanceof ExpressionNode.DivideByZeroError;
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
 * @returns {Error?} evaluation.err
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
  var setTestMappingToOne = function setTestMappingToOne(item) {
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
          if (evaluation.err instanceof ExpressionNode.DivideByZeroError || utils.isInfiniteRecursionError(evaluation.err)) {
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
EquationSet.getEquationFromBlock = function (block) {
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
      return EquationSet.getEquationFromBlock(firstChild);

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
      var args = argNames.map(function (inputName) {
        var argBlock = block.getInputTargetBlock(inputName);
        if (!argBlock) {
          return 0;
        }
        return EquationSet.getEquationFromBlock(argBlock).expression;
      }, this);

      return new Equation(null, [], new ExpressionNode(operation, args, block.id));

    case 'functional_math_number':
    case 'functional_math_number_dropdown':
      var val = block.getTitleValue('NUM') || 0;
      if (val === '???') {
        val = 0;
      }
      return new Equation(null, [], new ExpressionNode(parseFloat(val), [], block.id));

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
          values.push(childBlock ? EquationSet.getEquationFromBlock(childBlock).expression : new ExpressionNode(0));
        }
        return new Equation(null, [], new ExpressionNode(name, values));
      }
      break;

    case 'functional_definition':
      name = block.getTitleValue('NAME');

      var expression = firstChild ? EquationSet.getEquationFromBlock(firstChild).expression : new ExpressionNode(0);

      return new Equation(name, block.getVars(), expression);

    case 'functional_parameters_get':
      return new Equation(null, [], new ExpressionNode(block.getTitleValue('VAR')));

    case 'functional_example':
      return null;

    default:
      throw "Unknown block type: " + block.type;
  }
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./equation":"/home/ubuntu/staging/apps/build/js/calc/equation.js","./expressionNode":"/home/ubuntu/staging/apps/build/js/calc/expressionNode.js","./js-numbers/js-numbers":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js"}],"/home/ubuntu/staging/apps/build/js/calc/expressionNode.js":[function(require,module,exports){
'use strict';

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
  if (typeof val === 'number') {
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
var ExpressionNode = function ExpressionNode(val, args, blockId) {
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

  if (typeof this.value_ === 'string') {
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
  return this.getValue() === '/' && jsnums.isSchemeNumber(rightChild) && jsnums.equals(rightChild, 0);
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
  var error;
  try {
    globalMapping = globalMapping || {};
    localMapping = localMapping || {};

    var type = this.getType_();
    // @type {number|jsnumber}
    var val;

    if (type === ValueType.VARIABLE) {
      var mappedVal = utils.valueOr(localMapping[this.value_], globalMapping[this.value_]);
      if (mappedVal === undefined) {
        throw new Error('No mapping for variable during evaluation');
      }

      var clone = this.clone();
      clone.setValue(mappedVal);
      return clone.evaluate(globalMapping);
    }

    if (type === ValueType.FUNCTION_CALL) {
      var functionDef = utils.valueOr(localMapping[this.value_], globalMapping[this.value_]);
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
    error = err;
  }
  return { err: error };
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
  var nodesMatch = other && this.hasSameValue_(other) && this.children_.length === other.children_.length;
  var type = this.getType_();

  if (this.children_.length === 0) {
    return [new Token(this.value_, !nodesMatch)];
  }

  var tokensForChild = (function (childIndex) {
    return this.children_[childIndex].getTokenListDiff(nodesMatch && other.children_[childIndex]);
  }).bind(this);

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    tokens.push([tokensForChild(0), new Token(" " + this.value_ + " ", !nodesMatch), tokensForChild(1)]);
    tokens.push(new Token(')', !nodesMatch));

    return _.flatten(tokens);
  }

  if (this.value_ === 'sqr') {
    return _.flatten([new Token('(', !nodesMatch), tokensForChild(0), new Token(' ^ 2', !nodesMatch), new Token(')', !nodesMatch)]);
  } else if (this.value_ === 'pow') {
    return _.flatten([new Token('(', !nodesMatch), tokensForChild(0), new Token(' ^ ', !nodesMatch), tokensForChild(1), new Token(')', !nodesMatch)]);
  }

  // We either have a function call, or an arithmetic node that we want to
  // treat like a function (i.e. sqrt(4))
  // A function call will generate something like: foo(1, 2, 3)
  tokens = [new Token(this.value_, other && this.value_ !== other.value_), new Token('(', !nodesMatch)];

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

  if (this.getType_() !== ValueType.ARITHMETIC && this.getType_() !== ValueType.EXPONENTIAL) {
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

  var tokens = [prefix, this.children_[0].getTokenList(markDeepest && !rightDeeper)];
  if (this.children_.length > 1) {
    tokens.push([new Token(" " + this.value_ + " ", false), this.children_[1].getTokenList(markDeepest && rightDeeper)]);
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

  if (this.getType_() !== ValueType.FUNCTION_CALL || other.getType_() !== ValueType.FUNCTION_CALL) {
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
  return "(" + this.value_ + " " + this.children_.map(function (c) {
    return c.debug();
  }).join(' ') + ")";
};

/**
 * Given a token list, if the first and last items are parens, removes them
 * from the list
 */
ExpressionNode.stripOuterParensFromTokenList = function (tokenList) {
  if (tokenList.length >= 2 && tokenList[0].isParenthesis() && tokenList[tokenList.length - 1].isParenthesis()) {
    tokenList.splice(-1);
    tokenList.splice(0, 1);
  }
  return tokenList;
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./js-numbers/js-numbers":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js","./token":"/home/ubuntu/staging/apps/build/js/calc/token.js"}],"/home/ubuntu/staging/apps/build/js/calc/token.js":[function(require,module,exports){
'use strict';

var jsnums = require('./js-numbers/js-numbers');

// Unicode character for non-breaking space
var NBSP = ' ';

/**
 * A token is a value, and a boolean indicating whether or not it is "marked".
 * Marking is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 * @param {string|jsnumber} val
 * @param {boolean} marked
 */
var Token = function Token(val, marked) {
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
  if (!jsnums.isSchemeNumber(this.val_) || typeof this.val_ === 'number') {
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

},{"./js-numbers/js-numbers":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js"}],"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js":[function(require,module,exports){
// Scheme numbers.

// NOTE: This top bit differs from the version at https://github.com/bootstrapworld/js-numbers/blob/master/src/js-numbers.js
'use strict';

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

(function () {
    'use strict';
    // Abbreviation
    var Numbers = jsnums;

    // makeNumericBinop: (fixnum fixnum -> any) (scheme-number scheme-number -> any) -> (scheme-number scheme-number) X
    // Creates a binary function that works either on fixnums or boxnums.
    // Applies the appropriate binary function, ensuring that both scheme numbers are
    // lifted to the same level.
    var makeNumericBinop = function makeNumericBinop(onFixnums, onBoxednums, options) {
        options = options || {};
        return function (x, y) {
            if (options.isXSpecialCase && options.isXSpecialCase(x)) return options.onXSpecialCase(x, y);
            if (options.isYSpecialCase && options.isYSpecialCase(y)) return options.onYSpecialCase(x, y);

            if (typeof x === 'number' && typeof y === 'number') {
                return onFixnums(x, y);
            }
            if (typeof x === 'number') {
                x = liftFixnumInteger(x, y);
            }
            if (typeof y === 'number') {
                y = liftFixnumInteger(y, x);
            }

            if (x.level < y.level) x = x.liftTo(y);
            if (y.level < x.level) y = y.liftTo(x);
            return onBoxednums(x, y);
        };
    };

    // fromFixnum: fixnum -> scheme-number
    var fromFixnum = function fromFixnum(x) {
        if (isNaN(x) || !isFinite(x)) {
            return FloatPoint.makeInstance(x);
        }
        var nf = Math.floor(x);
        if (nf === x) {
            if (isOverflow(nf)) {
                return makeBignum(expandExponent(x + ''));
            } else {
                return nf;
            }
        } else {
            return FloatPoint.makeInstance(x);
        }
    };

    var expandExponent = function expandExponent(s) {
        var match = s.match(scientificPattern(digitsForRadix(10), expMarkForRadix(10))),
            mantissaChunks,
            exponent;
        if (match) {
            mantissaChunks = match[1].match(/^([^.]*)(.*)$/);
            exponent = Number(match[2]);

            if (mantissaChunks[2].length === 0) {
                return mantissaChunks[1] + zfill(exponent);
            }

            if (exponent >= mantissaChunks[2].length - 1) {
                return mantissaChunks[1] + mantissaChunks[2].substring(1) + zfill(exponent - (mantissaChunks[2].length - 1));
            } else {
                return mantissaChunks[1] + mantissaChunks[2].substring(1, 1 + exponent);
            }
        } else {
            return s;
        }
    };

    // zfill: integer -> string
    // builds a string of "0"'s of length n.
    var zfill = function zfill(n) {
        var buffer = [];
        buffer.length = n;
        for (var i = 0; i < n; i++) {
            buffer[i] = '0';
        }
        return buffer.join('');
    };

    // liftFixnumInteger: fixnum-integer boxed-scheme-number -> boxed-scheme-number
    // Lifts up fixnum integers to a boxed type.
    var liftFixnumInteger = function liftFixnumInteger(x, other) {
        switch (other.level) {
            case 0:
                // BigInteger
                return makeBignum(x);
            case 1:
                // Rational
                return new Rational(x, 1);
            case 2:
                // FloatPoint
                return new FloatPoint(x);
            case 3:
                // Complex
                return new Complex(x, 0);
            default:
                throwRuntimeError("IMPOSSIBLE: cannot lift fixnum integer to " + other.toString(), x, other);
        }
    };

    // throwRuntimeError: string (scheme-number | undefined) (scheme-number | undefined) -> void
    // Throws a runtime error with the given message string.
    var throwRuntimeError = function throwRuntimeError(msg, x, y) {
        Numbers['onThrowRuntimeError'](msg, x, y);
    };

    // onThrowRuntimeError: string (scheme-number | undefined) (scheme-number | undefined) -> void
    // By default, will throw a new Error with the given message.
    // Override Numbers['onThrowRuntimeError'] if you need to do something special.
    var onThrowRuntimeError = function onThrowRuntimeError(msg, x, y) {
        throw new Error(msg);
    };

    // isSchemeNumber: any -> boolean
    // Returns true if the thing is a scheme number.
    var isSchemeNumber = function isSchemeNumber(thing) {
        return typeof thing === 'number' || thing instanceof Rational || thing instanceof FloatPoint || thing instanceof Complex || thing instanceof BigInteger;
    };

    // isRational: scheme-number -> boolean
    var isRational = function isRational(n) {
        return typeof n === 'number' || isSchemeNumber(n) && n.isRational();
    };

    // isReal: scheme-number -> boolean
    var isReal = function isReal(n) {
        return typeof n === 'number' || isSchemeNumber(n) && n.isReal();
    };

    // isExact: scheme-number -> boolean
    var isExact = function isExact(n) {
        return typeof n === 'number' || isSchemeNumber(n) && n.isExact();
    };

    // isExact: scheme-number -> boolean
    var isInexact = function isInexact(n) {
        if (typeof n === 'number') {
            return false;
        } else {
            return isSchemeNumber(n) && n.isInexact();
        }
    };

    // isInteger: scheme-number -> boolean
    var isInteger = function isInteger(n) {
        return typeof n === 'number' || isSchemeNumber(n) && n.isInteger();
    };

    // isExactInteger: scheme-number -> boolean
    var isExactInteger = function isExactInteger(n) {
        return typeof n === 'number' || isSchemeNumber(n) && n.isInteger() && n.isExact();
    };

    // toFixnum: scheme-number -> javascript-number
    var toFixnum = function toFixnum(n) {
        if (typeof n === 'number') return n;
        return n.toFixnum();
    };

    // toExact: scheme-number -> scheme-number
    var toExact = function toExact(n) {
        if (typeof n === 'number') return n;
        return n.toExact();
    };

    // toExact: scheme-number -> scheme-number
    var toInexact = function toInexact(n) {
        if (typeof n === 'number') return FloatPoint.makeInstance(n);
        return n.toInexact();
    };

    //////////////////////////////////////////////////////////////////////

    // add: scheme-number scheme-number -> scheme-number
    var add = function add(x, y) {
        var sum;
        if (typeof x === 'number' && typeof y === 'number') {
            sum = x + y;
            if (isOverflow(sum)) {
                return makeBignum(x).add(makeBignum(y));
            }
        }
        if (x instanceof FloatPoint && y instanceof FloatPoint) {
            return x.add(y);
        }
        return addSlow(x, y);
    };

    var addSlow = makeNumericBinop(function (x, y) {
        var sum = x + y;
        if (isOverflow(sum)) {
            return makeBignum(x).add(makeBignum(y));
        } else {
            return sum;
        }
    }, function (x, y) {
        return x.add(y);
    }, { isXSpecialCase: function isXSpecialCase(x) {
            return isExactInteger(x) && _integerIsZero(x);
        },
        onXSpecialCase: function onXSpecialCase(x, y) {
            return y;
        },
        isYSpecialCase: function isYSpecialCase(y) {
            return isExactInteger(y) && _integerIsZero(y);
        },
        onYSpecialCase: function onYSpecialCase(x, y) {
            return x;
        }
    });

    // subtract: scheme-number scheme-number -> scheme-number
    var subtract = makeNumericBinop(function (x, y) {
        var diff = x - y;
        if (isOverflow(diff)) {
            return makeBignum(x).subtract(makeBignum(y));
        } else {
            return diff;
        }
    }, function (x, y) {
        return x.subtract(y);
    }, { isXSpecialCase: function isXSpecialCase(x) {
            return isExactInteger(x) && _integerIsZero(x);
        },
        onXSpecialCase: function onXSpecialCase(x, y) {
            return negate(y);
        },
        isYSpecialCase: function isYSpecialCase(y) {
            return isExactInteger(y) && _integerIsZero(y);
        },
        onYSpecialCase: function onYSpecialCase(x, y) {
            return x;
        }
    });

    // mulitply: scheme-number scheme-number -> scheme-number
    var multiply = function multiply(x, y) {
        var prod;
        if (typeof x === 'number' && typeof y === 'number') {
            prod = x * y;
            if (isOverflow(prod)) {
                return makeBignum(x).multiply(makeBignum(y));
            } else {
                return prod;
            }
        }
        if (x instanceof FloatPoint && y instanceof FloatPoint) {
            return x.multiply(y);
        }
        return multiplySlow(x, y);
    };
    var multiplySlow = makeNumericBinop(function (x, y) {
        var prod = x * y;
        if (isOverflow(prod)) {
            return makeBignum(x).multiply(makeBignum(y));
        } else {
            return prod;
        }
    }, function (x, y) {
        return x.multiply(y);
    }, { isXSpecialCase: function isXSpecialCase(x) {
            return isExactInteger(x) && (_integerIsZero(x) || _integerIsOne(x) || _integerIsNegativeOne(x));
        },
        onXSpecialCase: function onXSpecialCase(x, y) {
            if (_integerIsZero(x)) return 0;
            if (_integerIsOne(x)) return y;
            if (_integerIsNegativeOne(x)) return negate(y);
        },
        isYSpecialCase: function isYSpecialCase(y) {
            return isExactInteger(y) && (_integerIsZero(y) || _integerIsOne(y) || _integerIsNegativeOne(y));
        },
        onYSpecialCase: function onYSpecialCase(x, y) {
            if (_integerIsZero(y)) return 0;
            if (_integerIsOne(y)) return x;
            if (_integerIsNegativeOne(y)) return negate(x);
        }
    });

    // divide: scheme-number scheme-number -> scheme-number
    var divide = makeNumericBinop(function (x, y) {
        if (_integerIsZero(y)) throwRuntimeError("/: division by zero", x, y);
        var div = x / y;
        if (isOverflow(div)) {
            return makeBignum(x).divide(makeBignum(y));
        } else if (Math.floor(div) !== div) {
            return Rational.makeInstance(x, y);
        } else {
            return div;
        }
    }, function (x, y) {
        return x.divide(y);
    }, { isXSpecialCase: function isXSpecialCase(x) {
            return eqv(x, 0);
        },
        onXSpecialCase: function onXSpecialCase(x, y) {
            if (eqv(y, 0)) {
                throwRuntimeError("/: division by zero", x, y);
            }
            return 0;
        },
        isYSpecialCase: function isYSpecialCase(y) {
            return eqv(y, 0);
        },
        onYSpecialCase: function onYSpecialCase(x, y) {
            throwRuntimeError("/: division by zero", x, y);
        }
    });

    // equals: scheme-number scheme-number -> boolean
    var equals = makeNumericBinop(function (x, y) {
        return x === y;
    }, function (x, y) {
        return x.equals(y);
    });

    // eqv: scheme-number scheme-number -> boolean
    var eqv = function eqv(_x, _x2) {
        var _left;

        var _again = true;

        _function: while (_again) {
            var x = _x,
                y = _x2;
            _again = false;

            if (x === y) return true;
            if (typeof x === 'number' && typeof y === 'number') return x === y;
            if (x === NEGATIVE_ZERO || y === NEGATIVE_ZERO) return x === y;
            if (x instanceof Complex || y instanceof Complex) {
                if (!(_left = eqv(realPart(x), realPart(y)))) {
                    return _left;
                }

                _x = imaginaryPart(x);
                _x2 = imaginaryPart(y);
                _again = true;
                continue _function;
            }
            var ex = isExact(x),
                ey = isExact(y);
            return (ex && ey || !ex && !ey) && equals(x, y);
        }
    };

    // approxEqual: scheme-number scheme-number scheme-number -> boolean
    var approxEquals = function approxEquals(x, y, delta) {
        return lessThan(abs(subtract(x, y)), delta);
    };

    // greaterThanOrEqual: scheme-number scheme-number -> boolean
    var greaterThanOrEqual = makeNumericBinop(function (x, y) {
        return x >= y;
    }, function (x, y) {
        if (!(isReal(x) && isReal(y))) throwRuntimeError(">=: couldn't be applied to complex number", x, y);
        return x.greaterThanOrEqual(y);
    });

    // lessThanOrEqual: scheme-number scheme-number -> boolean
    var lessThanOrEqual = makeNumericBinop(function (x, y) {

        return x <= y;
    }, function (x, y) {
        if (!(isReal(x) && isReal(y))) throwRuntimeError("<=: couldn't be applied to complex number", x, y);
        return x.lessThanOrEqual(y);
    });

    // greaterThan: scheme-number scheme-number -> boolean
    var greaterThan = makeNumericBinop(function (x, y) {
        return x > y;
    }, function (x, y) {
        if (!(isReal(x) && isReal(y))) throwRuntimeError(">: couldn't be applied to complex number", x, y);
        return x.greaterThan(y);
    });

    // lessThan: scheme-number scheme-number -> boolean
    var lessThan = makeNumericBinop(function (x, y) {

        return x < y;
    }, function (x, y) {
        if (!(isReal(x) && isReal(y))) throwRuntimeError("<: couldn't be applied to complex number", x, y);
        return x.lessThan(y);
    });

    // expt: scheme-number scheme-number -> scheme-number
    var expt = (function () {
        var _expt = makeNumericBinop(function (x, y) {
            var pow = Math.pow(x, y);
            if (isOverflow(pow)) {
                return makeBignum(x).expt(makeBignum(y));
            } else {
                return pow;
            }
        }, function (x, y) {
            if (equals(y, 0)) {
                return add(y, 1);
            } else {
                return x.expt(y);
            }
        });
        return function (x, y) {
            if (equals(y, 0)) return add(y, 1);
            if (isReal(y) && lessThan(y, 0)) {
                return _expt(divide(1, x), negate(y));
            }
            return _expt(x, y);
        };
    })();

    // exp: scheme-number -> scheme-number
    var exp = function exp(n) {
        if (eqv(n, 0)) {
            return 1;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.exp(n));
        }
        return n.exp();
    };

    // modulo: scheme-number scheme-number -> scheme-number
    var modulo = function modulo(m, n) {
        if (!isInteger(m)) {
            throwRuntimeError('modulo: the first argument ' + m + " is not an integer.", m, n);
        }
        if (!isInteger(n)) {
            throwRuntimeError('modulo: the second argument ' + n + " is not an integer.", m, n);
        }
        var result;
        if (typeof m === 'number') {
            result = m % n;
            if (n < 0) {
                if (result <= 0) return result;else return result + n;
            } else {
                if (result < 0) return result + n;else return result;
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
    var numerator = function numerator(n) {
        if (typeof n === 'number') return n;
        return n.numerator();
    };

    // denominator: scheme-number -> scheme-number
    var denominator = function denominator(n) {
        if (typeof n === 'number') return 1;
        return n.denominator();
    };

    // sqrt: scheme-number -> scheme-number
    var sqrt = function sqrt(n) {
        if (typeof n === 'number') {
            if (n >= 0) {
                var result = Math.sqrt(n);
                if (Math.floor(result) === result) {
                    return result;
                } else {
                    return FloatPoint.makeInstance(result);
                }
            } else {
                return Complex.makeInstance(0, sqrt(-n));
            }
        }
        return n.sqrt();
    };

    // abs: scheme-number -> scheme-number
    var abs = function abs(n) {
        if (typeof n === 'number') {
            return Math.abs(n);
        }
        return n.abs();
    };

    // floor: scheme-number -> scheme-number
    var floor = function floor(n) {
        if (typeof n === 'number') return n;
        return n.floor();
    };

    // ceiling: scheme-number -> scheme-number
    var ceiling = function ceiling(n) {
        if (typeof n === 'number') return n;
        return n.ceiling();
    };

    // conjugate: scheme-number -> scheme-number
    var conjugate = function conjugate(n) {
        if (typeof n === 'number') return n;
        return n.conjugate();
    };

    // magnitude: scheme-number -> scheme-number
    var magnitude = function magnitude(n) {
        if (typeof n === 'number') return Math.abs(n);
        return n.magnitude();
    };

    // log: scheme-number -> scheme-number
    var log = function log(n) {
        if (eqv(n, 1)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.log(n));
        }
        return n.log();
    };

    // angle: scheme-number -> scheme-number
    var angle = function angle(n) {
        if (typeof n === 'number') {
            if (n > 0) return 0;else return FloatPoint.pi;
        }
        return n.angle();
    };

    // tan: scheme-number -> scheme-number
    var tan = function tan(n) {
        if (eqv(n, 0)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.tan(n));
        }
        return n.tan();
    };

    // atan: scheme-number -> scheme-number
    var atan = function atan(n) {
        if (eqv(n, 0)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.atan(n));
        }
        return n.atan();
    };

    // cos: scheme-number -> scheme-number
    var cos = function cos(n) {
        if (eqv(n, 0)) {
            return 1;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.cos(n));
        }
        return n.cos();
    };

    // sin: scheme-number -> scheme-number
    var sin = function sin(n) {
        if (eqv(n, 0)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.sin(n));
        }
        return n.sin();
    };

    // acos: scheme-number -> scheme-number
    var acos = function acos(n) {
        if (eqv(n, 1)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.acos(n));
        }
        return n.acos();
    };

    // asin: scheme-number -> scheme-number
    var asin = function asin(n) {
        if (eqv(n, 0)) {
            return 0;
        }
        if (typeof n === 'number') {
            return FloatPoint.makeInstance(Math.asin(n));
        }
        return n.asin();
    };

    // imaginaryPart: scheme-number -> scheme-number
    var imaginaryPart = function imaginaryPart(n) {
        if (typeof n === 'number') {
            return 0;
        }
        return n.imaginaryPart();
    };

    // realPart: scheme-number -> scheme-number
    var realPart = function realPart(n) {
        if (typeof n === 'number') {
            return n;
        }
        return n.realPart();
    };

    // round: scheme-number -> scheme-number
    var round = function round(n) {
        if (typeof n === 'number') {
            return n;
        }
        return n.round();
    };

    // sqr: scheme-number -> scheme-number
    var sqr = function sqr(x) {
        return multiply(x, x);
    };

    // integerSqrt: scheme-number -> scheme-number
    var integerSqrt = function integerSqrt(x) {
        if (!isInteger(x)) {
            throwRuntimeError('integer-sqrt: the argument ' + x.toString() + " is not an integer.", x);
        }
        if (typeof x === 'number') {
            if (x < 0) {
                return Complex.makeInstance(0, Math.floor(Math.sqrt(-x)));
            } else {
                return Math.floor(Math.sqrt(x));
            }
        }
        return x.integerSqrt();
    };

    // gcd: scheme-number [scheme-number ...] -> scheme-number
    var gcd = function gcd(first, rest) {
        if (!isInteger(first)) {
            throwRuntimeError('gcd: the argument ' + first.toString() + " is not an integer.", first);
        }
        var a = abs(first),
            t,
            b;
        for (var i = 0; i < rest.length; i++) {
            b = abs(rest[i]);
            if (!isInteger(b)) {
                throwRuntimeError('gcd: the argument ' + b.toString() + " is not an integer.", b);
            }
            while (!_integerIsZero(b)) {
                t = a;
                a = b;
                b = _integerModulo(t, b);
            }
        }
        return a;
    };

    // lcm: scheme-number [scheme-number ...] -> scheme-number
    var lcm = function lcm(first, rest) {
        if (!isInteger(first)) {
            throwRuntimeError('lcm: the argument ' + first.toString() + " is not an integer.", first);
        }
        var result = abs(first);
        if (_integerIsZero(result)) {
            return 0;
        }
        for (var i = 0; i < rest.length; i++) {
            if (!isInteger(rest[i])) {
                throwRuntimeError('lcm: the argument ' + rest[i].toString() + " is not an integer.", rest[i]);
            }
            var divisor = _integerGcd(result, rest[i]);
            if (_integerIsZero(divisor)) {
                return 0;
            }
            result = divide(multiply(result, rest[i]), divisor);
        }
        return result;
    };

    var quotient = function quotient(x, y) {
        if (!isInteger(x)) {
            throwRuntimeError('quotient: the first argument ' + x.toString() + " is not an integer.", x);
        }
        if (!isInteger(y)) {
            throwRuntimeError('quotient: the second argument ' + y.toString() + " is not an integer.", y);
        }
        return _integerQuotient(x, y);
    };

    var remainder = function remainder(x, y) {
        if (!isInteger(x)) {
            throwRuntimeError('remainder: the first argument ' + x.toString() + " is not an integer.", x);
        }
        if (!isInteger(y)) {
            throwRuntimeError('remainder: the second argument ' + y.toString() + " is not an integer.", y);
        }
        return _integerRemainder(x, y);
    };

    // Implementation of the hyperbolic functions
    // http://en.wikipedia.org/wiki/Hyperbolic_cosine
    var cosh = function cosh(x) {
        if (eqv(x, 0)) {
            return FloatPoint.makeInstance(1.0);
        }
        return divide(add(exp(x), exp(negate(x))), 2);
    };

    var sinh = function sinh(x) {
        return divide(subtract(exp(x), exp(negate(x))), 2);
    };

    var makeComplexPolar = function makeComplexPolar(r, theta) {
        // special case: if theta is zero, just return
        // the scalar.
        if (eqv(theta, 0)) {
            return r;
        }
        return Complex.makeInstance(multiply(r, cos(theta)), multiply(r, sin(theta)));
    };

    //////////////////////////////////////////////////////////////////////

    // Helpers

    // IsFinite: scheme-number -> boolean
    // Returns true if the scheme number is finite or not.
    var isSchemeNumberFinite = function isSchemeNumberFinite(n) {
        if (typeof n === 'number') {
            return isFinite(n);
        } else {
            return n.isFinite();
        }
    };

    // isOverflow: javascript-number -> boolean
    // Returns true if we consider the number an overflow.
    var MIN_FIXNUM = -9e15;
    var MAX_FIXNUM = 9e15;
    var isOverflow = function isOverflow(n) {
        return n < MIN_FIXNUM || MAX_FIXNUM < n;
    };

    // negate: scheme-number -> scheme-number
    // multiplies a number times -1.
    var negate = function negate(n) {
        if (typeof n === 'number') {
            return -n;
        }
        return n.negate();
    };

    // halve: scheme-number -> scheme-number
    // Divide a number by 2.
    var halve = function halve(n) {
        return divide(n, 2);
    };

    // timesI: scheme-number scheme-number
    // multiplies a number times i.
    var timesI = function timesI(x) {
        return multiply(x, plusI);
    };

    // fastExpt: computes n^k by squaring.
    // n^k = (n^2)^(k/2)
    // Assumes k is non-negative integer.
    var fastExpt = function fastExpt(n, k) {
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
    var makeIntegerBinop = function makeIntegerBinop(onFixnums, onBignums, options) {
        options = options || {};
        return function (m, n) {
            if (m instanceof Rational) {
                m = numerator(m);
            } else if (m instanceof Complex) {
                m = realPart(m);
            }

            if (n instanceof Rational) {
                n = numerator(n);
            } else if (n instanceof Complex) {
                n = realPart(n);
            }

            if (typeof m === 'number' && typeof n === 'number') {
                var result = onFixnums(m, n);
                if (!isOverflow(result) || options.ignoreOverflow) {
                    return result;
                }
            }
            if (m instanceof FloatPoint || n instanceof FloatPoint) {
                if (options.doNotCoerseToFloating) {
                    return onFixnums(toFixnum(m), toFixnum(n));
                } else {
                    return FloatPoint.makeInstance(onFixnums(toFixnum(m), toFixnum(n)));
                }
            }
            if (typeof m === 'number') {
                m = makeBignum(m);
            }
            if (typeof n === 'number') {
                n = makeBignum(n);
            }
            return onBignums(m, n);
        };
    };

    var makeIntegerUnOp = function makeIntegerUnOp(onFixnums, onBignums, options) {
        options = options || {};
        return function (m) {
            if (m instanceof Rational) {
                m = numerator(m);
            } else if (m instanceof Complex) {
                m = realPart(m);
            }

            if (typeof m === 'number') {
                var result = onFixnums(m);
                if (!isOverflow(result) || options.ignoreOverflow) {
                    return result;
                }
            }
            if (m instanceof FloatPoint) {
                return onFixnums(toFixnum(m));
            }
            if (typeof m === 'number') {
                m = makeBignum(m);
            }
            return onBignums(m);
        };
    };

    // _integerModulo: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerModulo = makeIntegerBinop(function (m, n) {
        return m % n;
    }, function (m, n) {
        return bnMod.call(m, n);
    });

    // _integerGcd: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerGcd = makeIntegerBinop(function (a, b) {
        var t;
        while (b !== 0) {
            t = a;
            a = b;
            b = t % b;
        }
        return a;
    }, function (m, n) {
        return bnGCD.call(m, n);
    });

    // _integerIsZero: integer-scheme-number -> boolean
    // Returns true if the number is zero.
    var _integerIsZero = makeIntegerUnOp(function (n) {
        return n === 0;
    }, function (n) {
        return bnEquals.call(n, BigInteger.ZERO);
    });

    // _integerIsOne: integer-scheme-number -> boolean
    var _integerIsOne = makeIntegerUnOp(function (n) {
        return n === 1;
    }, function (n) {
        return bnEquals.call(n, BigInteger.ONE);
    });

    // _integerIsNegativeOne: integer-scheme-number -> boolean
    var _integerIsNegativeOne = makeIntegerUnOp(function (n) {
        return n === -1;
    }, function (n) {
        return bnEquals.call(n, BigInteger.NEGATIVE_ONE);
    });

    // _integerAdd: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerAdd = makeIntegerBinop(function (m, n) {
        return m + n;
    }, function (m, n) {
        return bnAdd.call(m, n);
    });

    // _integerSubtract: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerSubtract = makeIntegerBinop(function (m, n) {
        return m - n;
    }, function (m, n) {
        return bnSubtract.call(m, n);
    });

    // _integerMultiply: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerMultiply = makeIntegerBinop(function (m, n) {
        return m * n;
    }, function (m, n) {
        return bnMultiply.call(m, n);
    });

    //_integerQuotient: integer-scheme-number integer-scheme-number -> integer-scheme-number
    var _integerQuotient = makeIntegerBinop(function (m, n) {
        return (m - m % n) / n;
    }, function (m, n) {
        return bnDivide.call(m, n);
    });

    var _integerRemainder = makeIntegerBinop(function (m, n) {
        return m % n;
    }, function (m, n) {
        return bnRemainder.call(m, n);
    });

    // _integerDivideToFixnum: integer-scheme-number integer-scheme-number -> fixnum
    var _integerDivideToFixnum = makeIntegerBinop(function (m, n) {
        return m / n;
    }, function (m, n) {
        return toFixnum(m) / toFixnum(n);
    }, { ignoreOverflow: true,
        doNotCoerseToFloating: true });

    // _integerEquals: integer-scheme-number integer-scheme-number -> boolean
    var _integerEquals = makeIntegerBinop(function (m, n) {
        return m === n;
    }, function (m, n) {
        return bnEquals.call(m, n);
    }, { doNotCoerseToFloating: true });

    // _integerGreaterThan: integer-scheme-number integer-scheme-number -> boolean
    var _integerGreaterThan = makeIntegerBinop(function (m, n) {
        return m > n;
    }, function (m, n) {
        return bnCompareTo.call(m, n) > 0;
    }, { doNotCoerseToFloating: true });

    // _integerLessThan: integer-scheme-number integer-scheme-number -> boolean
    var _integerLessThan = makeIntegerBinop(function (m, n) {
        return m < n;
    }, function (m, n) {
        return bnCompareTo.call(m, n) < 0;
    }, { doNotCoerseToFloating: true });

    // _integerGreaterThanOrEqual: integer-scheme-number integer-scheme-number -> boolean
    var _integerGreaterThanOrEqual = makeIntegerBinop(function (m, n) {
        return m >= n;
    }, function (m, n) {
        return bnCompareTo.call(m, n) >= 0;
    }, { doNotCoerseToFloating: true });

    // _integerLessThanOrEqual: integer-scheme-number integer-scheme-number -> boolean
    var _integerLessThanOrEqual = makeIntegerBinop(function (m, n) {
        return m <= n;
    }, function (m, n) {
        return bnCompareTo.call(m, n) <= 0;
    }, { doNotCoerseToFloating: true });

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

    var Rational = function Rational(n, d) {
        this.n = n;
        this.d = d;
    };

    Rational.prototype.toString = function () {
        if (_integerIsOne(this.d)) {
            return this.n.toString() + "";
        } else {
            return this.n.toString() + "/" + this.d.toString();
        }
    };

    Rational.prototype.level = 1;

    Rational.prototype.liftTo = function (target) {
        if (target.level === 2) return new FloatPoint(_integerDivideToFixnum(this.n, this.d));
        if (target.level === 3) return new Complex(this, 0);
        return throwRuntimeError("invalid level of Number", this, target);
    };

    Rational.prototype.isFinite = function () {
        return true;
    };

    Rational.prototype.equals = function (other) {
        return other instanceof Rational && _integerEquals(this.n, other.n) && _integerEquals(this.d, other.d);
    };

    Rational.prototype.isInteger = function () {
        return _integerIsOne(this.d);
    };

    Rational.prototype.isRational = function () {
        return true;
    };

    Rational.prototype.isReal = function () {
        return true;
    };

    Rational.prototype.add = function (other) {
        return Rational.makeInstance(_integerAdd(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n)), _integerMultiply(this.d, other.d));
    };

    Rational.prototype.subtract = function (other) {
        return Rational.makeInstance(_integerSubtract(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n)), _integerMultiply(this.d, other.d));
    };

    Rational.prototype.negate = function () {
        return Rational.makeInstance(-this.n, this.d);
    };

    Rational.prototype.multiply = function (other) {
        return Rational.makeInstance(_integerMultiply(this.n, other.n), _integerMultiply(this.d, other.d));
    };

    Rational.prototype.divide = function (other) {
        if (_integerIsZero(this.d) || _integerIsZero(other.n)) {
            throwRuntimeError("/: division by zero", this, other);
        }
        return Rational.makeInstance(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n));
    };

    Rational.prototype.toExact = function () {
        return this;
    };

    Rational.prototype.toInexact = function () {
        return FloatPoint.makeInstance(this.toFixnum());
    };

    Rational.prototype.isExact = function () {
        return true;
    };

    Rational.prototype.isInexact = function () {
        return false;
    };

    Rational.prototype.toFixnum = function () {
        return _integerDivideToFixnum(this.n, this.d);
    };

    Rational.prototype.numerator = function () {
        return this.n;
    };

    Rational.prototype.denominator = function () {
        return this.d;
    };

    Rational.prototype.greaterThan = function (other) {
        return _integerGreaterThan(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n));
    };

    Rational.prototype.greaterThanOrEqual = function (other) {
        return _integerGreaterThanOrEqual(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n));
    };

    Rational.prototype.lessThan = function (other) {
        return _integerLessThan(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n));
    };

    Rational.prototype.lessThanOrEqual = function (other) {
        return _integerLessThanOrEqual(_integerMultiply(this.n, other.d), _integerMultiply(this.d, other.n));
    };

    Rational.prototype.integerSqrt = function () {
        var result = sqrt(this);
        if (isRational(result)) {
            return toExact(floor(result));
        } else if (isReal(result)) {
            return toExact(floor(result));
        } else {
            return Complex.makeInstance(toExact(floor(realPart(result))), toExact(floor(imaginaryPart(result))));
        }
    };

    Rational.prototype.sqrt = function () {
        if (_integerGreaterThanOrEqual(this.n, 0)) {
            var newN = sqrt(this.n);
            var newD = sqrt(this.d);
            if (equals(floor(newN), newN) && equals(floor(newD), newD)) {
                return Rational.makeInstance(newN, newD);
            } else {
                return FloatPoint.makeInstance(_integerDivideToFixnum(newN, newD));
            }
        } else {
            var newN = sqrt(negate(this.n));
            var newD = sqrt(this.d);
            if (equals(floor(newN), newN) && equals(floor(newD), newD)) {
                return Complex.makeInstance(0, Rational.makeInstance(newN, newD));
            } else {
                return Complex.makeInstance(0, FloatPoint.makeInstance(_integerDivideToFixnum(newN, newD)));
            }
        }
    };

    Rational.prototype.abs = function () {
        return Rational.makeInstance(abs(this.n), this.d);
    };

    Rational.prototype.floor = function () {
        var quotient = _integerQuotient(this.n, this.d);
        if (_integerLessThan(this.n, 0)) {
            return subtract(quotient, 1);
        } else {
            return quotient;
        }
    };

    Rational.prototype.ceiling = function () {
        var quotient = _integerQuotient(this.n, this.d);
        if (_integerLessThan(this.n, 0)) {
            return quotient;
        } else {
            return add(quotient, 1);
        }
    };

    Rational.prototype.conjugate = function () {
        return this;
    };

    Rational.prototype.magnitude = Rational.prototype.abs;

    Rational.prototype.log = function () {
        return FloatPoint.makeInstance(Math.log(this.n / this.d));
    };

    Rational.prototype.angle = function () {
        if (_integerIsZero(this.n)) return 0;
        if (_integerGreaterThan(this.n, 0)) return 0;else return FloatPoint.pi;
    };

    Rational.prototype.tan = function () {
        return FloatPoint.makeInstance(Math.tan(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.atan = function () {
        return FloatPoint.makeInstance(Math.atan(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.cos = function () {
        return FloatPoint.makeInstance(Math.cos(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.sin = function () {
        return FloatPoint.makeInstance(Math.sin(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.expt = function (a) {
        if (isExactInteger(a) && greaterThanOrEqual(a, 0)) {
            return fastExpt(this, a);
        }
        return FloatPoint.makeInstance(Math.pow(_integerDivideToFixnum(this.n, this.d), _integerDivideToFixnum(a.n, a.d)));
    };

    Rational.prototype.exp = function () {
        return FloatPoint.makeInstance(Math.exp(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.acos = function () {
        return FloatPoint.makeInstance(Math.acos(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.asin = function () {
        return FloatPoint.makeInstance(Math.asin(_integerDivideToFixnum(this.n, this.d)));
    };

    Rational.prototype.imaginaryPart = function () {
        return 0;
    };

    Rational.prototype.realPart = function () {
        return this;
    };

    Rational.prototype.round = function () {
        // FIXME: not correct when values are bignums
        if (equals(this.d, 2)) {
            // Round to even if it's a n/2
            var v = _integerDivideToFixnum(this.n, this.d);
            var fl = Math.floor(v);
            var ce = Math.ceil(v);
            if (_integerIsZero(fl % 2)) {
                return fl;
            } else {
                return ce;
            }
        } else {
            return Math.round(this.n / this.d);
        }
    };

    Rational.makeInstance = function (n, d) {
        if (n === undefined) throwRuntimeError("n undefined", n, d);

        if (d === undefined) {
            d = 1;
        }

        if (_integerIsZero(d)) {
            throwRuntimeError("division by zero: " + n + "/" + d);
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
    var FloatPoint = function FloatPoint(n) {
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

    FloatPoint.makeInstance = function (n) {
        if (isNaN(n)) {
            return FloatPoint.nan;
        } else if (n === Number.POSITIVE_INFINITY) {
            return FloatPoint.inf;
        } else if (n === Number.NEGATIVE_INFINITY) {
            return FloatPoint.neginf;
        } else if (n === 0) {
            if (1 / n === -Infinity) {
                return NEGATIVE_ZERO;
            } else {
                return INEXACT_ZERO;
            }
        }
        return new FloatPoint(n);
    };

    FloatPoint.prototype.isExact = function () {
        return false;
    };

    FloatPoint.prototype.isInexact = function () {
        return true;
    };

    FloatPoint.prototype.isFinite = function () {
        return isFinite(this.n) || this === TOO_POSITIVE_TO_REPRESENT || this === TOO_NEGATIVE_TO_REPRESENT;
    };

    FloatPoint.prototype.toExact = function () {
        // The precision of ieee is about 16 decimal digits, which we use here.
        if (!isFinite(this.n) || isNaN(this.n)) {
            throwRuntimeError("toExact: no exact representation for " + this, this);
        }

        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var intPart = parseInt(match[1]);
            var fracPart = parseInt(match[2]);
            var tenToDecimalPlaces = Math.pow(10, match[2].length);
            return Rational.makeInstance(Math.round(this.n * tenToDecimalPlaces), tenToDecimalPlaces);
        } else {
            return this.n;
        }
    };

    FloatPoint.prototype.toInexact = function () {
        return this;
    };

    FloatPoint.prototype.isInexact = function () {
        return true;
    };

    FloatPoint.prototype.level = 2;

    FloatPoint.prototype.liftTo = function (target) {
        if (target.level === 3) return new Complex(this, 0);
        return throwRuntimeError("invalid level of Number", this, target);
    };

    FloatPoint.prototype.toString = function () {
        if (isNaN(this.n)) return "+nan.0";
        if (this.n === Number.POSITIVE_INFINITY) return "+inf.0";
        if (this.n === Number.NEGATIVE_INFINITY) return "-inf.0";
        if (this === NEGATIVE_ZERO) return "-0.0";
        var partialResult = this.n.toString();
        if (!partialResult.match('\\.')) {
            return partialResult + ".0";
        } else {
            return partialResult;
        }
    };

    FloatPoint.prototype.equals = function (other, aUnionFind) {
        return other instanceof FloatPoint && this.n === other.n;
    };

    FloatPoint.prototype.isRational = function () {
        return this.isFinite();
    };

    FloatPoint.prototype.isInteger = function () {
        return this.isFinite() && this.n === Math.floor(this.n);
    };

    FloatPoint.prototype.isReal = function () {
        return true;
    };

    // sign: Number -> {-1, 0, 1}
    var sign = function sign(n) {
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

    FloatPoint.prototype.add = function (other) {
        if (this.isFinite() && other.isFinite()) {
            return FloatPoint.makeInstance(this.n + other.n);
        } else {
            if (isNaN(this.n) || isNaN(other.n)) {
                return NaN;
            } else if (this.isFinite() && !other.isFinite()) {
                return other;
            } else if (!this.isFinite() && other.isFinite()) {
                return this;
            } else {
                return sign(this) * sign(other) === 1 ? this : NaN;
            };
        }
    };

    FloatPoint.prototype.subtract = function (other) {
        if (this.isFinite() && other.isFinite()) {
            return FloatPoint.makeInstance(this.n - other.n);
        } else if (isNaN(this.n) || isNaN(other.n)) {
            return NaN;
        } else if (!this.isFinite() && !other.isFinite()) {
            if (sign(this) === sign(other)) {
                return NaN;
            } else {
                return this;
            }
        } else if (this.isFinite()) {
            return multiply(other, -1);
        } else {
            // other.isFinite()
            return this;
        }
    };

    FloatPoint.prototype.negate = function () {
        return FloatPoint.makeInstance(-this.n);
    };

    FloatPoint.prototype.multiply = function (other) {
        return FloatPoint.makeInstance(this.n * other.n);
    };

    FloatPoint.prototype.divide = function (other) {
        return FloatPoint.makeInstance(this.n / other.n);
    };

    FloatPoint.prototype.toFixnum = function () {
        return this.n;
    };

    FloatPoint.prototype.numerator = function () {
        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var afterDecimal = parseInt(match[2]);
            var factorToInt = Math.pow(10, match[2].length);
            var extraFactor = _integerGcd(factorToInt, afterDecimal);
            var multFactor = factorToInt / extraFactor;
            return FloatPoint.makeInstance(Math.round(this.n * multFactor));
        } else {
            return this;
        }
    };

    FloatPoint.prototype.denominator = function () {
        var stringRep = this.n.toString();
        var match = stringRep.match(/^(.*)\.(.*)$/);
        if (match) {
            var afterDecimal = parseInt(match[2]);
            var factorToInt = Math.pow(10, match[2].length);
            var extraFactor = _integerGcd(factorToInt, afterDecimal);
            return FloatPoint.makeInstance(Math.round(factorToInt / extraFactor));
        } else {
            return FloatPoint.makeInstance(1);
        }
    };

    FloatPoint.prototype.floor = function () {
        return FloatPoint.makeInstance(Math.floor(this.n));
    };

    FloatPoint.prototype.ceiling = function () {
        return FloatPoint.makeInstance(Math.ceil(this.n));
    };

    FloatPoint.prototype.greaterThan = function (other) {
        return this.n > other.n;
    };

    FloatPoint.prototype.greaterThanOrEqual = function (other) {
        return this.n >= other.n;
    };

    FloatPoint.prototype.lessThan = function (other) {
        return this.n < other.n;
    };

    FloatPoint.prototype.lessThanOrEqual = function (other) {
        return this.n <= other.n;
    };

    FloatPoint.prototype.integerSqrt = function () {
        if (this === NEGATIVE_ZERO) {
            return this;
        }
        if (isInteger(this)) {
            if (this.n >= 0) {
                return FloatPoint.makeInstance(Math.floor(Math.sqrt(this.n)));
            } else {
                return Complex.makeInstance(INEXACT_ZERO, FloatPoint.makeInstance(Math.floor(Math.sqrt(-this.n))));
            }
        } else {
            throwRuntimeError("integerSqrt: can only be applied to an integer", this);
        }
    };

    FloatPoint.prototype.sqrt = function () {
        if (this.n < 0) {
            var result = Complex.makeInstance(0, FloatPoint.makeInstance(Math.sqrt(-this.n)));
            return result;
        } else {
            return FloatPoint.makeInstance(Math.sqrt(this.n));
        }
    };

    FloatPoint.prototype.abs = function () {
        return FloatPoint.makeInstance(Math.abs(this.n));
    };

    FloatPoint.prototype.log = function () {
        if (this.n < 0) return new Complex(this, 0).log();else return FloatPoint.makeInstance(Math.log(this.n));
    };

    FloatPoint.prototype.angle = function () {
        if (0 === this.n) return 0;
        if (this.n > 0) return 0;else return FloatPoint.pi;
    };

    FloatPoint.prototype.tan = function () {
        return FloatPoint.makeInstance(Math.tan(this.n));
    };

    FloatPoint.prototype.atan = function () {
        return FloatPoint.makeInstance(Math.atan(this.n));
    };

    FloatPoint.prototype.cos = function () {
        return FloatPoint.makeInstance(Math.cos(this.n));
    };

    FloatPoint.prototype.sin = function () {
        return FloatPoint.makeInstance(Math.sin(this.n));
    };

    FloatPoint.prototype.expt = function (a) {
        if (this.n === 1) {
            if (a.isFinite()) {
                return this;
            } else if (isNaN(a.n)) {
                return this;
            } else {
                return this;
            }
        } else {
            return FloatPoint.makeInstance(Math.pow(this.n, a.n));
        }
    };

    FloatPoint.prototype.exp = function () {
        return FloatPoint.makeInstance(Math.exp(this.n));
    };

    FloatPoint.prototype.acos = function () {
        return FloatPoint.makeInstance(Math.acos(this.n));
    };

    FloatPoint.prototype.asin = function () {
        return FloatPoint.makeInstance(Math.asin(this.n));
    };

    FloatPoint.prototype.imaginaryPart = function () {
        return 0;
    };

    FloatPoint.prototype.realPart = function () {
        return this;
    };

    FloatPoint.prototype.round = function () {
        if (isFinite(this.n)) {
            if (this === NEGATIVE_ZERO) {
                return this;
            }
            if (Math.abs(Math.floor(this.n) - this.n) === 0.5) {
                if (Math.floor(this.n) % 2 === 0) return FloatPoint.makeInstance(Math.floor(this.n));
                return FloatPoint.makeInstance(Math.ceil(this.n));
            } else {
                return FloatPoint.makeInstance(Math.round(this.n));
            }
        } else {
            return this;
        }
    };

    FloatPoint.prototype.conjugate = function () {
        return this;
    };

    FloatPoint.prototype.magnitude = FloatPoint.prototype.abs;

    //////////////////////////////////////////////////////////////////////
    // Complex numbers
    //////////////////////////////////////////////////////////////////////

    var Complex = function Complex(r, i) {
        this.r = r;
        this.i = i;
    };

    // Constructs a complex number from two basic number r and i.  r and i can
    // either be plt.type.Rational or plt.type.FloatPoint.
    Complex.makeInstance = function (r, i) {
        if (i === undefined) {
            i = 0;
        }
        if (isExact(i) && isInteger(i) && _integerIsZero(i)) {
            return r;
        }
        if (isInexact(r) || isInexact(i)) {
            r = toInexact(r);
            i = toInexact(i);
        }
        return new Complex(r, i);
    };

    Complex.prototype.toString = function () {
        var realPart = this.r.toString(),
            imagPart = this.i.toString();
        if (imagPart[0] === '-' || imagPart[0] === '+') {
            return realPart + imagPart + 'i';
        } else {
            return realPart + "+" + imagPart + 'i';
        }
    };

    Complex.prototype.isFinite = function () {
        return isSchemeNumberFinite(this.r) && isSchemeNumberFinite(this.i);
    };

    Complex.prototype.isRational = function () {
        return isRational(this.r) && eqv(this.i, 0);
    };

    Complex.prototype.isInteger = function () {
        return isInteger(this.r) && eqv(this.i, 0);
    };

    Complex.prototype.toExact = function () {
        return Complex.makeInstance(toExact(this.r), toExact(this.i));
    };

    Complex.prototype.toInexact = function () {
        return Complex.makeInstance(toInexact(this.r), toInexact(this.i));
    };

    Complex.prototype.isExact = function () {
        return isExact(this.r) && isExact(this.i);
    };

    Complex.prototype.isInexact = function () {
        return isInexact(this.r) || isInexact(this.i);
    };

    Complex.prototype.level = 3;

    Complex.prototype.liftTo = function (target) {
        throwRuntimeError("Don't know how to lift Complex number", this, target);
    };

    Complex.prototype.equals = function (other) {
        var result = other instanceof Complex && equals(this.r, other.r) && equals(this.i, other.i);
        return result;
    };

    Complex.prototype.greaterThan = function (other) {
        if (!this.isReal() || !other.isReal()) {
            throwRuntimeError(">: expects argument of type real number", this, other);
        }
        return greaterThan(this.r, other.r);
    };

    Complex.prototype.greaterThanOrEqual = function (other) {
        if (!this.isReal() || !other.isReal()) {
            throwRuntimeError(">=: expects argument of type real number", this, other);
        }
        return greaterThanOrEqual(this.r, other.r);
    };

    Complex.prototype.lessThan = function (other) {
        if (!this.isReal() || !other.isReal()) {
            throwRuntimeError("<: expects argument of type real number", this, other);
        }
        return lessThan(this.r, other.r);
    };

    Complex.prototype.lessThanOrEqual = function (other) {
        if (!this.isReal() || !other.isReal()) {
            throwRuntimeError("<=: expects argument of type real number", this, other);
        }
        return lessThanOrEqual(this.r, other.r);
    };

    Complex.prototype.abs = function () {
        if (!equals(this.i, 0).valueOf()) throwRuntimeError("abs: expects argument of type real number", this);
        return abs(this.r);
    };

    Complex.prototype.toFixnum = function () {
        if (!equals(this.i, 0).valueOf()) throwRuntimeError("toFixnum: expects argument of type real number", this);
        return toFixnum(this.r);
    };

    Complex.prototype.numerator = function () {
        if (!this.isReal()) throwRuntimeError("numerator: can only be applied to real number", this);
        return numerator(this.n);
    };

    Complex.prototype.denominator = function () {
        if (!this.isReal()) throwRuntimeError("floor: can only be applied to real number", this);
        return denominator(this.n);
    };

    Complex.prototype.add = function (other) {
        return Complex.makeInstance(add(this.r, other.r), add(this.i, other.i));
    };

    Complex.prototype.subtract = function (other) {
        return Complex.makeInstance(subtract(this.r, other.r), subtract(this.i, other.i));
    };

    Complex.prototype.negate = function () {
        return Complex.makeInstance(negate(this.r), negate(this.i));
    };

    Complex.prototype.multiply = function (other) {
        // If the other value is real, just do primitive division
        if (other.isReal()) {
            return Complex.makeInstance(multiply(this.r, other.r), multiply(this.i, other.r));
        }
        var r = subtract(multiply(this.r, other.r), multiply(this.i, other.i));
        var i = add(multiply(this.r, other.i), multiply(this.i, other.r));
        return Complex.makeInstance(r, i);
    };

    Complex.prototype.divide = function (other) {
        var a, b, c, d, r, x, y;
        // If the other value is real, just do primitive division
        if (other.isReal()) {
            return Complex.makeInstance(divide(this.r, other.r), divide(this.i, other.r));
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
                x = divide(add(a, multiply(b, r)), add(c, multiply(d, r)));
                y = divide(subtract(b, multiply(a, r)), add(c, multiply(d, r)));
            } else {
                r = divide(c, d);
                x = divide(add(multiply(a, r), b), add(multiply(c, r), d));
                y = divide(subtract(multiply(b, r), a), add(multiply(c, r), d));
            }
            return Complex.makeInstance(x, y);
        } else {
            var con = conjugate(other);
            var up = multiply(this, con);

            // Down is guaranteed to be real by this point.
            var down = realPart(multiply(other, con));

            var result = Complex.makeInstance(divide(realPart(up), down), divide(imaginaryPart(up), down));
            return result;
        }
    };

    Complex.prototype.conjugate = function () {
        var result = Complex.makeInstance(this.r, subtract(0, this.i));

        return result;
    };

    Complex.prototype.magnitude = function () {
        var sum = add(multiply(this.r, this.r), multiply(this.i, this.i));
        return sqrt(sum);
    };

    Complex.prototype.isReal = function () {
        return eqv(this.i, 0);
    };

    Complex.prototype.integerSqrt = function () {
        if (isInteger(this)) {
            return integerSqrt(this.r);
        } else {
            throwRuntimeError("integerSqrt: can only be applied to an integer", this);
        }
    };

    Complex.prototype.sqrt = function () {
        if (this.isReal()) return sqrt(this.r);
        // http://en.wikipedia.org/wiki/Square_root#Square_roots_of_negative_and_complex_numbers
        var r_plus_x = add(this.magnitude(), this.r);

        var r = sqrt(halve(r_plus_x));

        var i = divide(this.i, sqrt(multiply(r_plus_x, 2)));

        return Complex.makeInstance(r, i);
    };

    Complex.prototype.log = function () {
        var m = this.magnitude();
        var theta = this.angle();
        var result = add(log(m), timesI(theta));
        return result;
    };

    Complex.prototype.angle = function () {
        if (this.isReal()) {
            return angle(this.r);
        }
        if (equals(0, this.r)) {
            var tmp = halve(FloatPoint.pi);
            return greaterThan(this.i, 0) ? tmp : negate(tmp);
        } else {
            var tmp = atan(divide(abs(this.i), abs(this.r)));
            if (greaterThan(this.r, 0)) {
                return greaterThan(this.i, 0) ? tmp : negate(tmp);
            } else {
                return greaterThan(this.i, 0) ? subtract(FloatPoint.pi, tmp) : subtract(tmp, FloatPoint.pi);
            }
        }
    };

    var plusI = Complex.makeInstance(0, 1);
    var minusI = Complex.makeInstance(0, -1);

    Complex.prototype.tan = function () {
        return divide(this.sin(), this.cos());
    };

    Complex.prototype.atan = function () {
        if (equals(this, plusI) || equals(this, minusI)) {
            return neginf;
        }
        return multiply(plusI, multiply(FloatPoint.makeInstance(0.5), log(divide(add(plusI, this), add(plusI, subtract(0, this))))));
    };

    Complex.prototype.cos = function () {
        if (this.isReal()) return cos(this.r);
        var iz = timesI(this);
        var iz_negate = negate(iz);

        return halve(add(exp(iz), exp(iz_negate)));
    };

    Complex.prototype.sin = function () {
        if (this.isReal()) return sin(this.r);
        var iz = timesI(this);
        var iz_negate = negate(iz);
        var z2 = Complex.makeInstance(0, 2);
        var exp_negate = subtract(exp(iz), exp(iz_negate));
        var result = divide(exp_negate, z2);
        return result;
    };

    Complex.prototype.expt = function (y) {
        if (isExactInteger(y) && greaterThanOrEqual(y, 0)) {
            return fastExpt(this, y);
        }
        var expo = multiply(y, this.log());
        return exp(expo);
    };

    Complex.prototype.exp = function () {
        var r = exp(this.r);
        var cos_a = cos(this.i);
        var sin_a = sin(this.i);

        return multiply(r, add(cos_a, timesI(sin_a)));
    };

    Complex.prototype.acos = function () {
        if (this.isReal()) return acos(this.r);
        var pi_half = halve(FloatPoint.pi);
        var iz = timesI(this);
        var root = sqrt(subtract(1, sqr(this)));
        var l = timesI(log(add(iz, root)));
        return add(pi_half, l);
    };

    Complex.prototype.asin = function () {
        if (this.isReal()) return asin(this.r);

        var oneNegateThisSq = subtract(1, sqr(this));
        var sqrtOneNegateThisSq = sqrt(oneNegateThisSq);
        return multiply(2, atan(divide(this, add(1, sqrtOneNegateThisSq))));
    };

    Complex.prototype.ceiling = function () {
        if (!this.isReal()) throwRuntimeError("ceiling: can only be applied to real number", this);
        return ceiling(this.r);
    };

    Complex.prototype.floor = function () {
        if (!this.isReal()) throwRuntimeError("floor: can only be applied to real number", this);
        return floor(this.r);
    };

    Complex.prototype.imaginaryPart = function () {
        return this.i;
    };

    Complex.prototype.realPart = function () {
        return this.r;
    };

    Complex.prototype.round = function () {
        if (!this.isReal()) throwRuntimeError("round: can only be applied to real number", this);
        return round(this.r);
    };

    var hashModifiersRegexp = new RegExp("^(#[ei]#[bodx]|#[bodx]#[ei]|#[bodxei])(.*)$");
    function rationalRegexp(digits) {
        return new RegExp("^([+-]?[" + digits + "]+)/([" + digits + "]+)$");
    }
    function matchComplexRegexp(radix, x) {
        var sign = "[+-]";
        var maybeSign = "[+-]?";
        var digits = digitsForRadix(radix);
        var expmark = "[" + expMarkForRadix(radix) + "]";
        var digitSequence = "[" + digits + "]+";

        var unsignedRational = digitSequence + "/" + digitSequence;
        var rational = maybeSign + unsignedRational;

        var noDecimal = digitSequence;
        var decimalNumOnRight = "[" + digits + "]*\\.[" + digits + "]+";
        var decimalNumOnLeft = "[" + digits + "]+\\.[" + digits + "]*";

        var unsignedDecimal = "(?:" + noDecimal + "|" + decimalNumOnRight + "|" + decimalNumOnLeft + ")";

        var special = "(?:inf\.0|nan\.0|inf\.f|nan\.f)";

        var unsignedRealNoExp = "(?:" + unsignedDecimal + "|" + unsignedRational + ")";
        var unsignedReal = unsignedRealNoExp + "(?:" + expmark + maybeSign + digitSequence + ")?";
        var unsignedRealOrSpecial = "(?:" + unsignedReal + "|" + special + ")";
        var real = "(?:" + maybeSign + unsignedReal + "|" + sign + special + ")";

        var alt1 = new RegExp("^(" + rational + ")" + "(" + sign + unsignedRational + "?)" + "i$");
        var alt2 = new RegExp("^(" + real + ")?" + "(" + sign + unsignedRealOrSpecial + "?)" + "i$");
        var alt3 = new RegExp("^(" + real + ")@(" + real + ")$");

        var match1 = x.match(alt1);
        var match2 = x.match(alt2);
        var match3 = x.match(alt3);

        return match1 ? match1 : match2 ? match2 : match3 ? match3 :
        /* else */false;
    }

    function digitRegexp(digits) {
        return new RegExp("^[+-]?[" + digits + "]+$");
    }
    /**
    /* NB: !!!! flonum regexp only matches "X.", ".X", or "X.X", NOT "X", this
    /* must be separately checked with digitRegexp.
    /* I know this seems dumb, but the alternative would be that this regexp
    /* returns six matches, which also seems dumb.
    /***/
    function flonumRegexp(digits) {
        var decimalNumOnRight = "([" + digits + "]*)\\.([" + digits + "]+)";
        var decimalNumOnLeft = "([" + digits + "]+)\\.([" + digits + "]*)";
        return new RegExp("^(?:([+-]?)(" + decimalNumOnRight + "|" + decimalNumOnLeft + "))$");
    }
    function scientificPattern(digits, exp_mark) {
        var noDecimal = "[" + digits + "]+";
        var decimalNumOnRight = "[" + digits + "]*\\.[" + digits + "]+";
        var decimalNumOnLeft = "[" + digits + "]+\\.[" + digits + "]*";
        return new RegExp("^(?:([+-]?" + "(?:" + noDecimal + "|" + decimalNumOnRight + "|" + decimalNumOnLeft + ")" + ")[" + exp_mark + "]([+-]?[" + digits + "]+))$");
    }

    function digitsForRadix(radix) {
        return radix === 2 ? "01" : radix === 8 ? "0-7" : radix === 10 ? "0-9" : radix === 16 ? "0-9a-fA-F" : throwRuntimeError("digitsForRadix: invalid radix", this, radix);
    }

    function expMarkForRadix(radix) {
        return radix === 2 || radix === 8 || radix === 10 ? "defsl" : radix === 16 ? "sl" : throwRuntimeError("expMarkForRadix: invalid radix", this, radix);
    }

    function Exactness(i) {
        this.defaultp = function () {
            return i == 0;
        };
        this.exactp = function () {
            return i == 1;
        };
        this.inexactp = function () {
            return i == 2;
        };
    }

    Exactness.def = new Exactness(0);
    Exactness.on = new Exactness(1);
    Exactness.off = new Exactness(2);

    Exactness.prototype.intAsExactp = function () {
        return this.defaultp() || this.exactp();
    };
    Exactness.prototype.floatAsInexactp = function () {
        return this.defaultp() || this.inexactp();
    };

    // fromString: string boolean -> (scheme-number | false)
    var fromString = function fromString(x, exactness) {
        var radix = 10;
        var exactness = typeof exactness === 'undefined' ? Exactness.def : exactness === true ? Exactness.on : exactness === false ? Exactness.off :
        /* else */throwRuntimeError("exactness must be true or false", this, r);

        var hMatch = x.toLowerCase().match(hashModifiersRegexp);
        if (hMatch) {
            var modifierString = hMatch[1].toLowerCase();

            var exactFlag = modifierString.match(new RegExp("(#[ei])"));
            var radixFlag = modifierString.match(new RegExp("(#[bodx])"));

            if (exactFlag) {
                var f = exactFlag[1].charAt(1);
                exactness = f === 'e' ? Exactness.on : f === 'i' ? Exactness.off :
                // this case is unreachable
                throwRuntimeError("invalid exactness flag", this, r);
            }
            if (radixFlag) {
                var f = radixFlag[1].charAt(1);
                radix = f === 'b' ? 2 : f === 'o' ? 8 : f === 'd' ? 10 : f === 'x' ? 16 :
                // this case is unreachable
                throwRuntimeError("invalid radix flag", this, r);
            }
        }

        var numberString = hMatch ? hMatch[2] : x;
        // if the string begins with a hash modifier, then it must parse as a
        // number, an invalid parse is an error, not false. False is returned
        // when the item could potentially have been read as a symbol.
        var mustBeANumberp = hMatch ? true : false;

        return fromStringRaw(numberString, radix, exactness, mustBeANumberp);
    };

    function fromStringRaw(x, radix, exactness, mustBeANumberp) {
        var cMatch = matchComplexRegexp(radix, x);
        if (cMatch) {
            return Complex.makeInstance(fromStringRawNoComplex(cMatch[1] || "0", radix, exactness), fromStringRawNoComplex(cMatch[2] === "+" ? "1" : cMatch[2] === "-" ? "-1" : cMatch[2], radix, exactness));
        }

        return fromStringRawNoComplex(x, radix, exactness, mustBeANumberp);
    }

    function fromStringRawNoComplex(x, radix, exactness, mustBeANumberp) {
        var aMatch = x.match(rationalRegexp(digitsForRadix(radix)));
        if (aMatch) {
            return Rational.makeInstance(fromStringRawNoComplex(aMatch[1], radix, exactness), fromStringRawNoComplex(aMatch[2], radix, exactness));
        }

        // Floating point tests
        if (x === '+nan.0' || x === '-nan.0') return FloatPoint.nan;
        if (x === '+inf.0') return FloatPoint.inf;
        if (x === '-inf.0') return FloatPoint.neginf;
        if (x === "-0.0") {
            return NEGATIVE_ZERO;
        }

        var fMatch = x.match(flonumRegexp(digitsForRadix(radix)));
        if (fMatch) {
            var integralPart = fMatch[3] !== undefined ? fMatch[3] : fMatch[5];
            var fractionalPart = fMatch[4] !== undefined ? fMatch[4] : fMatch[6];
            return parseFloat(fMatch[1], integralPart, fractionalPart, radix, exactness);
        }

        var sMatch = x.match(scientificPattern(digitsForRadix(radix), expMarkForRadix(radix)));
        if (sMatch) {
            var coefficient = fromStringRawNoComplex(sMatch[1], radix, exactness);
            var exponent = fromStringRawNoComplex(sMatch[2], radix, exactness);
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
                return FloatPoint.makeInstance(n);
            }
        } else if (mustBeANumberp) {
            if (x.length === 0) throwRuntimeError("no digits");
            throwRuntimeError("bad number: " + x, this);
        } else {
            return false;
        }
    };

    function parseFloat(sign, integralPart, fractionalPart, radix, exactness) {
        var sign = sign == "-" ? -1 : 1;
        var integralPartValue = integralPart === "" ? 0 : exactness.intAsExactp() ? parseExactInt(integralPart, radix) : parseInt(integralPart, radix);

        var fractionalNumerator = fractionalPart === "" ? 0 : exactness.intAsExactp() ? parseExactInt(fractionalPart, radix) : parseInt(fractionalPart, radix);
        /* unfortunately, for these next two calculations, `expt` and `divide` */
        /* will promote to Bignum and Rational, respectively, but we only want */
        /* these if we're parsing in exact mode */
        var fractionalDenominator = exactness.intAsExactp() ? expt(radix, fractionalPart.length) : Math.pow(radix, fractionalPart.length);
        var fractionalPartValue = fractionalPart === "" ? 0 : exactness.intAsExactp() ? divide(fractionalNumerator, fractionalDenominator) : fractionalNumerator / fractionalDenominator;

        var forceInexact = function forceInexact(o) {
            return typeof o === "number" ? FloatPoint.makeInstance(o) : o.toInexact();
        };

        return exactness.floatAsInexactp() ? forceInexact(multiply(sign, add(integralPartValue, fractionalPartValue))) : multiply(sign, add(integralPartValue, fractionalPartValue));
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
    var j_lm = (canary & 0xffffff) == 0xefcafe;

    // (public) Constructor
    function BigInteger(a, b, c) {
        if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c);else if (b == null && "string" != typeof a) this.fromString(a, 256);else this.fromString(a, b);
    }

    // return new, unset BigInteger
    function nbi() {
        return new BigInteger(null);
    }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 0x4000000);
            w[j++] = v & 0x3ffffff;
        }
        return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff,
            xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 0x7fff;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 0x3fffffff;
        }
        return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff,
            xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 0x3fff;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 0xfffffff;
        }
        return c;
    }
    if (j_lm && typeof navigator !== 'undefined' && navigator.appName == "Microsoft Internet Explorer") {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else if (j_lm && typeof navigator !== 'undefined' && navigator.appName != "Netscape") {
        BigInteger.prototype.am = am1;
        dbits = 26;
    } else {
        // Mozilla/Netscape seems to prefer am3
        BigInteger.prototype.am = am3;
        dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = (1 << dbits) - 1;
    BigInteger.prototype.DV = 1 << dbits;

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = [];
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) {
        return BI_RM.charAt(n);
    }
    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return c == null ? -1 : c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
        this.t = 1;
        this.s = x < 0 ? -1 : 0;
        if (x > 0) this[0] = x;else if (x < -1) this[0] = x + DV;else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) {
        var r = nbi();r.fromInt(i);return r;
    }

    // (protected) set from string and radix
    function bnpFromString(s, b) {
        var k;
        if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 256) k = 8; // byte array
        else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else {
                this.fromRadix(s, b);return;
            }
        this.t = 0;
        this.s = 0;
        var i = s.length,
            mi = false,
            sh = 0;
        while (--i >= 0) {
            var x = k == 8 ? s[i] & 0xff : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0) this[this.t++] = x;else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
                this[this.t++] = x >> this.DB - sh;
            } else this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 0x80) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
        }
        this.clamp();
        if (mi) BigInteger.ZERO.subTo(this, this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c) --this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate().toString(b);
        var k;
        if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else return this.toRadix(b);
        var km = (1 << k) - 1,
            d,
            m = false,
            r = [],
            i = this.t;
        var p = this.DB - i * this.DB % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;r.push(int2char(d));
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & (1 << p) - 1) << k - p;
                    d |= this[--i] >> (p += this.DB - k);
                } else {
                    d = this[i] >> (p -= k) & km;
                    if (p <= 0) {
                        p += this.DB;--i;
                    }
                }
                if (d > 0) m = true;
                if (m) r.push(int2char(d));
            }
        }
        return m ? r.join("") : "0";
    }

    // (public) -this
    function bnNegate() {
        var r = nbi();BigInteger.ZERO.subTo(this, r);return r;
    }

    // (public) |this|
    function bnAbs() {
        return this.s < 0 ? this.negate() : this;
    }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        if (this.s < 0) {
            r = a.t - i;
        } else {
            r = i - a.t;
        }
        if (r != 0) return r;
        while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
        var r = 1,
            t;
        if ((t = x >>> 16) != 0) {
            x = t;r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;r += 1;
        }
        return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB),
            c = this.s << bs & this.DM,
            i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = this[i] >> cbs | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c;else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a, r) {
        var x = this.abs(),
            y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    }

    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(),
            ts = this.s,
            ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt,
            d2 = (1 << this.F1) / yt,
            e = 1 << this.F2;
        var i = r.t,
            j = i - ys,
            t = q == null ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y); // "negative" y so we can replace sub with am later
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            // Estimate quotient digit
            var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                // Try it out
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
        if (ts < 0) BigInteger.ZERO.subTo(r, r);
    }

    // (public) this mod a
    function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
        return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) {
        this.m = m;
    }
    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);else return x;
    }
    function cRevert(x) {
        return x;
    }
    function cReduce(x) {
        x.divRemTo(this.m, null, x);
    }
    function cMulTo(x, y, r) {
        x.multiplyTo(y, r);this.reduce(r);
    }
    function cSqrTo(x, r) {
        x.squareTo(r);this.reduce(r);
    }

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
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3; // y == 1/x mod 2^2
        y = y * (2 - (x & 0xf) * y) & 0xf; // y == 1/x mod 2^4
        y = y * (2 - (x & 0xff) * y) & 0xff; // y == 1/x mod 2^8
        y = y * (2 - ((x & 0xffff) * y & 0xffff)) & 0xffff; // y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = y * (2 - x * y % this.DV) % this.DV; // y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return y > 0 ? this.DV - y : -y;
    }

    // Montgomery reduction
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 0x7fff;
        this.mph = this.mp >> 15;
        this.um = (1 << m.DB - 15) - 1;
        this.mt2 = 2 * m.t;
    }

    // xR mod m
    function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
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
        while (x.t <= this.mt2) // pad x so am has enough room later
        x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j = x[i] & 0x7fff;
            var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
            // use am to combine the multiply-shift-add into one call
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            // propagate carry
            while (x[j] >= x.DV) {
                x[j] -= x.DV;x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x, r) {
        x.squareTo(r);this.reduce(r);
    }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x, y, r) {
        x.multiplyTo(y, r);this.reduce(r);
    }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

    // (protected) true iff this is even
    function bnpIsEven() {
        return (this.t > 0 ? this[0] & 1 : this.s) == 0;
    }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e, z) {
        if (e > 0xffffffff || e < 1) return BigInteger.ONE;
        var r = nbi(),
            r2 = nbi(),
            g = z.convert(this),
            i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & 1 << i) > 0) z.mulTo(r2, g, r);else {
                var t = r;r = r2;r2 = t;
            }
        }
        return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m);else z = new Montgomery(m);
        return this.exp(e, z);
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
    function bnClone() {
        var r = nbi();this.copyTo(r);return r;
    }

    // (public) return value as integer
    function bnIntValue() {
        if (this.s < 0) {
            if (this.t == 1) return this[0] - this.DV;else if (this.t == 0) return -1;
        } else if (this.t == 1) return this[0];else if (this.t == 0) return 0;
        // assumes 16 < DB < 32
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
    }

    // (public) return value as byte
    function bnByteValue() {
        return this.t == 0 ? this.s : this[0] << 24 >> 24;
    }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() {
        return this.t == 0 ? this.s : this[0] << 16 >> 16;
    }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) {
        return Math.floor(Math.LN2 * this.DB / Math.log(r));
    }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
        if (this.s < 0) return -1;else if (this.t <= 0 || this.t == 1 && this[0] <= 0) return 0;else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
        if (b == null) b = 10;
        if (this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a),
            y = nbi(),
            z = nbi(),
            r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
            r = (a + z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d, y, z);
        }
        return z.intValue().toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s, b) {
        this.fromInt(0);
        if (b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs),
            mi = false,
            j = 0,
            w = 0;
        for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b * w + x;
            if (++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w, 0);
                j = 0;
                w = 0;
            }
        }
        if (j > 0) {
            this.dMultiply(Math.pow(b, j));
            this.dAddOffset(w, 0);
        }
        if (mi) BigInteger.ZERO.subTo(this, this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a, b, c) {
        if ("number" == typeof b) {
            // new BigInteger(int,int,RNG)
            if (a < 2) this.fromInt(1);else {
                this.fromNumber(a, c);
                if (!this.testBit(a - 1)) // force MSB set
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                if (this.isEven()) this.dAddOffset(1, 0); // force odd
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                }
            }
        } else {
            // new BigInteger(int,RNG)
            var x = [],
                t = a & 7;
            x.length = (a >> 3) + 1;
            b.nextBytes(x);
            if (t > 0) x[0] &= (1 << t) - 1;else x[0] = 0;
            this.fromString(x, 256);
        }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
        var i = this.t,
            r = [];
        r[0] = this.s;
        var p = this.DB - i * this.DB % 8,
            d,
            k = 0;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) r[k++] = d | this.s << this.DB - p;
            while (i >= 0) {
                if (p < 8) {
                    d = (this[i] & (1 << p) - 1) << 8 - p;
                    d |= this[--i] >> (p += this.DB - 8);
                } else {
                    d = this[i] >> (p -= 8) & 0xff;
                    if (p <= 0) {
                        p += this.DB;--i;
                    }
                }
                if ((d & 0x80) != 0) d |= -256;
                if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
                if (k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }

    function bnEquals(a) {
        return this.compareTo(a) == 0;
    }
    function bnMin(a) {
        return this.compareTo(a) < 0 ? this : a;
    }
    function bnMax(a) {
        return this.compareTo(a) > 0 ? this : a;
    }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a, op, r) {
        var i,
            f,
            m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
            f = a.s & this.DM;
            for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
            r.t = this.t;
        } else {
            f = this.s & this.DM;
            for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
            r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
    }

    // (public) this & a
    function op_and(x, y) {
        return x & y;
    }
    function bnAnd(a) {
        var r = nbi();this.bitwiseTo(a, op_and, r);return r;
    }

    // (public) this | a
    function op_or(x, y) {
        return x | y;
    }
    function bnOr(a) {
        var r = nbi();this.bitwiseTo(a, op_or, r);return r;
    }

    // (public) this ^ a
    function op_xor(x, y) {
        return x ^ y;
    }
    function bnXor(a) {
        var r = nbi();this.bitwiseTo(a, op_xor, r);return r;
    }

    // (public) this & ~a
    function op_andnot(x, y) {
        return x & ~y;
    }
    function bnAndNot(a) {
        var r = nbi();this.bitwiseTo(a, op_andnot, r);return r;
    }

    // (public) ~this
    function bnNot() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
        var r = nbi();
        if (n < 0) this.rShiftTo(-n, r);else this.lShiftTo(n, r);
        return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
        var r = nbi();
        if (n < 0) this.lShiftTo(-n, r);else this.rShiftTo(n, r);
        return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
        if (x == 0) return -1;
        var r = 0;
        if ((x & 0xffff) == 0) {
            x >>= 16;r += 16;
        }
        if ((x & 0xff) == 0) {
            x >>= 8;r += 8;
        }
        if ((x & 0xf) == 0) {
            x >>= 4;r += 4;
        }
        if ((x & 3) == 0) {
            x >>= 2;r += 2;
        }
        if ((x & 1) == 0) ++r;
        return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i) if (this[i] != 0) return i * this.DB + lbit(this[i]);
        if (this.s < 0) return this.t * this.DB;
        return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
        var r = 0;
        while (x != 0) {
            x &= x - 1;++r;
        }
        return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
        var r = 0,
            x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
        return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t) return this.s != 0;
        return (this[j] & 1 << n % this.DB) != 0;
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n, op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) {
        return this.changeBit(n, op_or);
    }

    // (public) this & ~(1<<n)
    function bnClearBit(n) {
        return this.changeBit(n, op_andnot);
    }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) {
        return this.changeBit(n, op_xor);
    }

    // (protected) r = this + a
    function bnpAddTo(a, r) {
        var i = 0,
            c = 0,
            m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] + a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c += a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c += a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c > 0) r[i++] = c;else if (c < -1) r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
    }

    // (public) this + a
    function bnAdd(a) {
        var r = nbi();this.addTo(a, r);return r;
    }

    // (public) this - a
    function bnSubtract(a) {
        var r = nbi();this.subTo(a, r);return r;
    }

    // (public) this * a
    function bnMultiply(a) {
        var r = nbi();this.multiplyTo(a, r);return r;
    }

    // (public) this / a
    function bnDivide(a) {
        var r = nbi();this.divRemTo(a, r, null);return r;
    }

    // (public) this % a
    function bnRemainder(a) {
        var r = nbi();this.divRemTo(a, null, r);return r;
    }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
        var q = nbi(),
            r = nbi();
        this.divRemTo(a, q, r);
        return [q, r];
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n, w) {
        if (n == 0) return;
        while (this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
            this[w] -= this.DV;
            if (++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    }

    // A "null" reducer
    function NullExp() {}
    function nNop(x) {
        return x;
    }
    function nMulTo(x, y, r) {
        x.multiplyTo(y, r);
    }
    function nSqrTo(x, r) {
        x.squareTo(r);
    }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

    // (public) this^e
    function bnPow(e) {
        return this.bnpExp(e, new NullExp());
    }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while (i > 0) r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0; // assumes a,this >= 0
        while (--i >= 0) r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i) r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
    }

    // Barrett modular reduction
    function Barrett(m) {
        // setup Barrett
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }

    function barrettConvert(x) {
        if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);else if (x.compareTo(this.m) < 0) return x;else {
            var r = nbi();x.copyTo(r);this.reduce(r);return r;
        }
    }

    function barrettRevert(x) {
        return x;
    }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x, r) {
        x.squareTo(r);this.reduce(r);
    }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x, y, r) {
        x.multiplyTo(y, r);this.reduce(r);
    }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

    // (public) this^e % m (HAC 14.85)
    function bnModPow(e, m) {
        var i = e.bitLength(),
            k,
            r = nbv(1),
            z;
        if (i <= 0) return r;else if (i < 18) k = 1;else if (i < 48) k = 3;else if (i < 144) k = 4;else if (i < 768) k = 5;else k = 6;
        if (i < 8) z = new Classic(m);else if (m.isEven()) z = new Barrett(m);else z = new Montgomery(m);

        // precomputation
        var g = [],
            n = 3,
            k1 = k - 1,
            km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1], g2);
            while (n <= km) {
                g[n] = nbi();
                z.mulTo(g2, g[n - 2], g[n]);
                n += 2;
            }
        }

        var j = e.t - 1,
            w,
            is1 = true,
            r2 = nbi(),
            t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
            if (i >= k1) w = e[j] >> i - k1 & km;else {
                w = (e[j] & (1 << i + 1) - 1) << k1 - i;
                if (j > 0) w |= e[j - 1] >> this.DB + i - k1;
            }

            n = k;
            while ((w & 1) == 0) {
                w >>= 1;--n;
            }
            if ((i -= n) < 0) {
                i += this.DB;--j;
            }
            if (is1) {
                // ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            } else {
                while (n > 1) {
                    z.sqrTo(r, r2);z.sqrTo(r2, r);n -= 2;
                }
                if (n > 0) z.sqrTo(r, r2);else {
                    t = r;r = r2;r2 = t;
                }
                z.mulTo(r2, g[w], r);
            }

            while (j >= 0 && (e[j] & 1 << i) == 0) {
                z.sqrTo(r, r2);t = r;r = r2;r2 = t;
                if (--i < 0) {
                    i = this.DB - 1;--j;
                }
            }
        }
        return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
        var x = this.s < 0 ? this.negate() : this.clone();
        var y = a.s < 0 ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
            var t = x;x = y;y = t;
        }
        var i = x.getLowestSetBit(),
            g = y.getLowestSetBit();
        if (g < 0) return x;
        if (i < g) g = i;
        if (g > 0) {
            x.rShiftTo(g, x);
            y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
            if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
            if (x.compareTo(y) >= 0) {
                x.subTo(y, x);
                x.rShiftTo(1, x);
            } else {
                y.subTo(x, y);
                y.rShiftTo(1, y);
            }
        }
        if (g > 0) y.lShiftTo(g, y);
        return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
        if (n <= 0) return 0;
        var d = this.DV % n,
            r = this.s < 0 ? n - 1 : 0;
        if (this.t > 0) if (d == 0) r = this[0] % n;else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
        return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
        var ac = m.isEven();
        if (this.isEven() && ac || m.signum() == 0) return BigInteger.ZERO;
        var u = m.clone(),
            v = this.clone();
        var a = nbv(1),
            b = nbv(0),
            c = nbv(0),
            d = nbv(1);
        while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u);
                if (ac) {
                    if (!a.isEven() || !b.isEven()) {
                        a.addTo(this, a);b.subTo(m, b);
                    }
                    a.rShiftTo(1, a);
                } else if (!b.isEven()) b.subTo(m, b);
                b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v);
                if (ac) {
                    if (!c.isEven() || !d.isEven()) {
                        c.addTo(this, c);d.subTo(m, d);
                    }
                    c.rShiftTo(1, c);
                } else if (!d.isEven()) d.subTo(m, d);
                d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) {
                u.subTo(v, u);
                if (ac) a.subTo(c, a);
                b.subTo(d, b);
            } else {
                v.subTo(u, v);
                if (ac) c.subTo(a, c);
                d.subTo(b, d);
            }
        }
        if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        if (d.compareTo(m) >= 0) return d.subtract(m);
        if (d.signum() < 0) d.addTo(m, d);else return d;
        if (d.signum() < 0) return d.add(m);else return d;
    }

    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
        var i,
            x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i) if (x[0] == lowprimes[i]) return true;
            return false;
        }
        if (x.isEven()) return false;
        i = 1;
        while (i < lowprimes.length) {
            var m = lowprimes[i],
                j = i + 1;
            while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while (i < j) if (m % lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0) return false;
        var r = n1.shiftRight(k);
        t = t + 1 >> 1;
        if (t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
            a.fromInt(lowprimes[i]);
            var y = a.modPow(r, this);
            if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while (j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2, this);
                    if (y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if (y.compareTo(n1) != 0) return false;
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
    var makeBignum = function makeBignum(s) {
        if (typeof s === 'number') {
            s = s + '';
        }
        s = expandExponent(s);
        return new BigInteger(s, 10);
    };

    var zerostring = function zerostring(n) {
        var buf = [];
        for (var i = 0; i < n; i++) {
            buf.push('0');
        }
        return buf.join('');
    };

    BigInteger.prototype.level = 0;
    BigInteger.prototype.liftTo = function (target) {
        if (target.level === 1) {
            return new Rational(this, 1);
        }
        if (target.level === 2) {
            var fixrep = this.toFixnum();
            if (fixrep === Number.POSITIVE_INFINITY) return TOO_POSITIVE_TO_REPRESENT;
            if (fixrep === Number.NEGATIVE_INFINITY) return TOO_NEGATIVE_TO_REPRESENT;
            return new FloatPoint(fixrep);
        }
        if (target.level === 3) {
            return new Complex(this, 0);
        }
        return throwRuntimeError("invalid level for BigInteger lift", this, target);
    };

    BigInteger.prototype.isFinite = function () {
        return true;
    };

    BigInteger.prototype.isInteger = function () {
        return true;
    };

    BigInteger.prototype.isRational = function () {
        return true;
    };

    BigInteger.prototype.isReal = function () {
        return true;
    };

    BigInteger.prototype.isExact = function () {
        return true;
    };

    BigInteger.prototype.isInexact = function () {
        return false;
    };

    BigInteger.prototype.toExact = function () {
        return this;
    };

    BigInteger.prototype.toInexact = function () {
        return FloatPoint.makeInstance(this.toFixnum());
    };

    BigInteger.prototype.toFixnum = function () {
        var result = 0,
            str = this.toString(),
            i;
        if (str[0] === '-') {
            for (i = 1; i < str.length; i++) {
                result = result * 10 + Number(str[i]);
            }
            return -result;
        } else {
            for (i = 0; i < str.length; i++) {
                result = result * 10 + Number(str[i]);
            }
            return result;
        }
    };

    BigInteger.prototype.greaterThan = function (other) {
        return this.compareTo(other) > 0;
    };

    BigInteger.prototype.greaterThanOrEqual = function (other) {
        return this.compareTo(other) >= 0;
    };

    BigInteger.prototype.lessThan = function (other) {
        return this.compareTo(other) < 0;
    };

    BigInteger.prototype.lessThanOrEqual = function (other) {
        return this.compareTo(other) <= 0;
    };

    // divide: scheme-number -> scheme-number
    // WARNING NOTE: we override the old version of divide.
    BigInteger.prototype.divide = function (other) {
        var quotientAndRemainder = bnDivideAndRemainder.call(this, other);
        if (quotientAndRemainder[1].compareTo(BigInteger.ZERO) === 0) {
            return quotientAndRemainder[0];
        } else {
            var result = add(quotientAndRemainder[0], Rational.makeInstance(quotientAndRemainder[1], other));
            return result;
        }
    };

    BigInteger.prototype.numerator = function () {
        return this;
    };

    BigInteger.prototype.denominator = function () {
        return 1;
    };

    (function () {
        // Classic implementation of Newton-Ralphson square-root search,
        // adapted for integer-sqrt.
        // http://en.wikipedia.org/wiki/Newton's_method#Square_root_of_a_number
        var searchIter = function searchIter(n, guess) {
            while (!(lessThanOrEqual(sqr(guess), n) && lessThan(n, sqr(add(guess, 1))))) {
                guess = floor(divide(add(guess, floor(divide(n, guess))), 2));
            }
            return guess;
        };

        // integerSqrt: -> scheme-number
        BigInteger.prototype.integerSqrt = function () {
            var n;
            if (sign(this) >= 0) {
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
    (function () {
        // Get an approximation using integerSqrt, and then start another
        // Newton-Ralphson search if necessary.
        BigInteger.prototype.sqrt = function () {
            var approx = this.integerSqrt(),
                fix;
            if (eqv(sqr(approx), this)) {
                return approx;
            }
            fix = toFixnum(this);
            if (isFinite(fix)) {
                if (fix >= 0) {
                    return FloatPoint.makeInstance(Math.sqrt(fix));
                } else {
                    return Complex.makeInstance(0, FloatPoint.makeInstance(Math.sqrt(-fix)));
                }
            } else {
                return approx;
            }
        };
    })();

    // floor: -> scheme-number
    // Produce the floor.
    BigInteger.prototype.floor = function () {
        return this;
    };

    // ceiling: -> scheme-number
    // Produce the ceiling.
    BigInteger.prototype.ceiling = function () {
        return this;
    };

    // Until we have a feature-complete Big Number implementation, we'll
    // convert BigInteger objects into FloatPoint objects and perform
    // unsupported operations there.
    function temporaryAccuracyLosingWorkAroundForBigNums(function_name) {
        return function () {
            var inexact = this.toInexact();
            return inexact[function_name].apply(inexact, arguments);
        };
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

    BigInteger.prototype.imaginaryPart = function () {
        return 0;
    };
    BigInteger.prototype.realPart = function () {
        return this;
    };

    // round: -> scheme-number
    // Round to the nearest integer.
    BigInteger.prototype.round = function () {
        return this;
    };

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
    var toRepeatingDecimal = (function () {
        var getResidue = function getResidue(r, d, limit) {
            var digits = [];
            var seenRemainders = {};
            seenRemainders[r] = true;
            while (true) {
                if (limit-- <= 0) {
                    return [digits.join(''), '...'];
                }

                var nextDigit = quotient(multiply(r, 10), d);
                var nextRemainder = remainder(multiply(r, 10), d);
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
                var nextRemainder = remainder(multiply(r, 10), d);
                repeatingDigits.push(nextDigit.toString());
                if (equals(nextRemainder, firstRepeatingRemainder)) {
                    break;
                } else {
                    r = nextRemainder;
                }
            };

            var digitString = digits.join('');
            var repeatingDigitString = repeatingDigits.join('');

            while (digitString.length >= repeatingDigitString.length && digitString.substring(digitString.length - repeatingDigitString.length) === repeatingDigitString) {
                digitString = digitString.substring(0, digitString.length - repeatingDigitString.length);
            }

            return [digitString, repeatingDigitString];
        };

        return function (n, d, options) {
            // default limit on decimal expansion; can be overridden
            var limit = 512;
            if (options && typeof options.limit !== 'undefined') {
                limit = options.limit;
            }
            if (!isInteger(n)) {
                throwRuntimeError('toRepeatingDecimal: n ' + n.toString() + " is not an integer.");
            }
            if (!isInteger(d)) {
                throwRuntimeError('toRepeatingDecimal: d ' + d.toString() + " is not an integer.");
            }
            if (equals(d, 0)) {
                throwRuntimeError('toRepeatingDecimal: d equals 0');
            }
            if (lessThan(d, 0)) {
                throwRuntimeError('toRepeatingDecimal: d < 0');
            }
            var sign = lessThan(n, 0) ? "-" : "";
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
    Numbers['negative_one'] = -1; // Rational.NEGATIVE_ONE;
    Numbers['zero'] = 0; // Rational.ZERO;
    Numbers['one'] = 1; // Rational.ONE;
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

},{}],"/home/ubuntu/staging/apps/build/js/calc/equation.js":[function(require,module,exports){
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
'use strict';

var Equation = function Equation(name, params, expression) {
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

},{}],"/home/ubuntu/staging/apps/build/js/calc/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
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
  var msg = require('./locale');
  var commonMsg = require('../locale');
; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/calc/blocks.js":[function(require,module,exports){
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

var msg = require('./locale');
var commonMsg = require('../locale');

var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function gensym(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installCompute(blockly, generator, gensym);
};

function installCompute(blockly, generator, gensym) {
  blockly.Blocks.functional_compute = {
    helpUrl: '',
    init: function init() {
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, msg.evaluate(), blockly.BlockValueType.NONE, [{ name: 'ARG1', type: blockly.BlockValueType.NUMBER }]);
    }
  };

  generator.functional_compute = function () {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return "Calc.compute(" + arg1 + ", 'block_id_" + this.id + "');\n";
  };
}

},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../sharedFunctionalBlocks":"/home/ubuntu/staging/apps/build/js/sharedFunctionalBlocks.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js"}],"/home/ubuntu/staging/apps/build/js/calc/locale.js":[function(require,module,exports){
// locale for calc

"use strict";

module.exports = window.blockly.calc_locale;

},{}]},{},["/home/ubuntu/staging/apps/build/js/calc/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jYWxjL21haW4uanMiLCJidWlsZC9qcy9jYWxjL2NhbGMuanMiLCJidWlsZC9qcy9jYWxjL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2xldmVscy5qcyIsImJ1aWxkL2pzL2NhbGMvaW5wdXRJdGVyYXRvci5qcyIsImJ1aWxkL2pzL2NhbGMvZXF1YXRpb25TZXQuanMiLCJidWlsZC9qcy9jYWxjL2V4cHJlc3Npb25Ob2RlLmpzIiwiYnVpbGQvanMvY2FsYy90b2tlbi5qcyIsImJ1aWxkL2pzL2NhbGMvanMtbnVtYmVycy9qcy1udW1iZXJzLmpzIiwiYnVpbGQvanMvY2FsYy9lcXVhdGlvbi5qcyIsImJ1aWxkL2pzL2NhbGMvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2NhbGMvbG9jYWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDbEMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFB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QyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsU0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDUixTQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDVixZQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEQ7OztBQUdELGFBQVMsV0FBVyxDQUFDLENBQUMsRUFBRTtBQUNwQixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixlQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLGFBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDdkIsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsZ0JBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxD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Q0FBQyxFQUFFO0FBQUUsYUFBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7U0FBRTtBQUNyRCxZQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsWUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELGVBQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELFNBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixlQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckQ7OztBQUdELGFBQVMsWUFBWSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFBRSxTQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUFFOzs7QUFHN0QsYUFBUyxZQUFZLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFBRSxTQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFD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QyxDQUFDO0FBQy9DLFlBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBTSxPQUFPLENBQUMsQ0FBQztLQUNyRDs7QUFFRCxRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcs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YUFBTyxDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FDeEcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUN0RCxDQUFDLENBQUM7S0FDSjtHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLGtCQUFrQixHQUFHLFlBQVc7QUFDeEMsUUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEUsV0FBTyxlQUFlLEdBQUcsSUFBSSxHQUFFLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztHQUNuRSxDQUFDO0NBQ0g7Ozs7Ozs7QUN6REQsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbndpbmRvdy5DYWxjID0gcmVxdWlyZSgnLi9jYWxjJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LmNhbGNNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5DYWxjLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBDYWxjIEdyYXBoaWNzXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4gJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FsYyA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIENhbGMgPSBtb2R1bGUuZXhwb3J0cztcbnZhciBqc251bXMgPSByZXF1aXJlKCcuL2pzLW51bWJlcnMvanMtbnVtYmVycy5qcycpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGNhbGNNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgdGltZW91dExpc3QgPSByZXF1aXJlKCcuLi90aW1lb3V0TGlzdCcpO1xuXG52YXIgRXhwcmVzc2lvbk5vZGUgPSByZXF1aXJlKCcuL2V4cHJlc3Npb25Ob2RlJyk7XG52YXIgRXF1YXRpb25TZXQgPSByZXF1aXJlKCcuL2VxdWF0aW9uU2V0Jyk7XG52YXIgRXF1YXRpb24gPSByZXF1aXJlKCcuL2VxdWF0aW9uJyk7XG52YXIgVG9rZW4gPSByZXF1aXJlKCcuL3Rva2VuJyk7XG52YXIgSW5wdXRJdGVyYXRvciA9IHJlcXVpcmUoJy4vaW5wdXRJdGVyYXRvcicpO1xuXG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xuXG52YXIgbGV2ZWw7XG52YXIgc2tpbjtcblxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3MoZmFsc2UpO1xuXG52YXIgQ0FOVkFTX0hFSUdIVCA9IDQwMDtcbnZhciBDQU5WQVNfV0lEVEggPSA0MDA7XG5cbnZhciBMSU5FX0hFSUdIVCA9IDI0O1xuXG52YXIgYXBwU3RhdGUgPSB7XG4gIHRhcmdldFNldDogbnVsbCxcbiAgdXNlclNldDogbnVsbCxcbiAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgd2FpdGluZ0ZvclJlcG9ydDogZmFsc2UsXG4gIHJlc3BvbnNlOiBudWxsLFxuICBtZXNzYWdlOiBudWxsLFxuICByZXN1bHQ6IG51bGwsXG4gIHRlc3RSZXN1bHRzOiBudWxsLFxuICBmYWlsZWRJbnB1dDogbnVsbFxufTtcbkNhbGMuYXBwU3RhdGVfID0gYXBwU3RhdGU7XG5cbnZhciBzdGVwU3BlZWQgPSAyMDAwO1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRva2VuIGxpc3QgZnJvbSBvbiBvciB0d28gdmFsdWVzLiBJZiBvbmUgdmFsdWUgaXMgZ2l2ZW4sIHRoYXRcbiAqIHRva2VuIGxpc3QgaXMganVzdCB0aGUgc2V0IG9mIHVubWFya2VkIHRva2Vucy4gSWYgdHdvIHZhbHVlcyBhcmUgZ2l2ZW4sIHRoZVxuICogZ2VuZXJhdGVkIHRva2VuIGxpc3QgaGFzIGRpZmZlcmVuY2UgbWFya2VkLiBJbnB1dHMgYXJlIGZpcnN0IGNvbnZlcnRlZCB0b1xuICogRXhwcmVzc2lvbk5vZGVzIHRvIGFsbG93IGZvciB0b2tlbiBsaXN0IGdlbmVyYXRpb24uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gb25lXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gdHdvXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG1hcmtEZWVwZXN0IE9ubHkgdmFsaWQgaWYgd2UgaGF2ZSBhIHNpbmdsZSBpbnB1dC4gUGFzc2VkIG9uXG4gKiAgIHRvIGdldFRva2VuTGlzdC5cbiAqIEByZXR1cm5zIHtUb2tlbltdfVxuICovXG5mdW5jdGlvbiBjb25zdHJ1Y3RUb2tlbkxpc3Qob25lLCB0d28sIG1hcmtEZWVwZXN0KSB7XG4gIG9uZSA9IGFzRXhwcmVzc2lvbk5vZGUob25lKTtcbiAgdHdvID0gYXNFeHByZXNzaW9uTm9kZSh0d28pO1xuXG4gIG1hcmtEZWVwZXN0ID0gdXRpbHMudmFsdWVPcihtYXJrRGVlcGVzdCwgZmFsc2UpO1xuXG4gIHZhciB0b2tlbkxpc3Q7XG5cbiAgaWYgKCFvbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmICghdHdvKSB7XG4gICAgdG9rZW5MaXN0ID0gb25lLmdldFRva2VuTGlzdChtYXJrRGVlcGVzdCk7XG4gIH0gZWxzZSB7XG4gICAgdG9rZW5MaXN0ID0gb25lLmdldFRva2VuTGlzdERpZmYodHdvKTtcbiAgfVxuXG4gIHJldHVybiBFeHByZXNzaW9uTm9kZS5zdHJpcE91dGVyUGFyZW5zRnJvbVRva2VuTGlzdCh0b2tlbkxpc3QpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdmFsIHRvIGFuIEV4cHJlc3Npb25Ob2RlIGZvciB0aGUgcHVycG9zZSBvZiBnZW5lcmF0aW5nIGEgdG9rZW5cbiAqIGxpc3QuXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gdmFsXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbk5vZGV9XG4gKi9cbmZ1bmN0aW9uIGFzRXhwcmVzc2lvbk5vZGUodmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZSkge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVxdWF0aW9uKSB7XG4gICAgcmV0dXJuIHZhbC5leHByZXNzaW9uO1xuICB9XG4gIC8vIEl0J3MgcGVyaGFwcyBhIGxpdHRsZSB3ZWlyZCB0byBjb252ZXJ0IGEgc3RyaW5nIGxpa2UgXCI9IFwiIGludG8gYW5cbiAgLy8gRXhwcmVzc2lvbk5vZGUgKHdoaWNoIEkgYmVsaWV2ZSB3aWxsIHRyZWF0IHRoaXMgYXMgYSB2YXJpYWJsZSksIGJ1dCB0aGlzXG4gIC8vIGFsbG93cyB1cyB0byBtb3JlIGVhc2lseSBnZW5lcmF0ZSBhIHRva2VuTGlzdCBpbiBhIGNvbnNpc3RlbnQgbWFubmVyLlxuICBpZiAoanNudW1zLmlzU2NoZW1lTnVtYmVyKHZhbCkgfHwgdHlwZW9mKHZhbCkgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9kZSh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCcpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIENhbGMuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5DYWxjLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gcmVwbGFjZSBzdHVkaW9BcHAgbWV0aG9kcyB3aXRoIG91ciBvd25cbiAgc3R1ZGlvQXBwLnJ1bkJ1dHRvbkNsaWNrID0gdGhpcy5ydW5CdXR0b25DbGljay5iaW5kKHRoaXMpO1xuXG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgaWYgKGxldmVsLnNjYWxlICYmIGxldmVsLnNjYWxlLnN0ZXBTcGVlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3RlcFNwZWVkID0gbGV2ZWwuc2NhbGUuc3RlcFNwZWVkO1xuICB9XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ2Z1bmN0aW9uYWxfY29tcHV0ZSc7XG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuXG4gIC8vIFdlIGRvbid0IHdhbnQgaWNvbnMgaW4gaW5zdHJ1Y3Rpb25zXG4gIGNvbmZpZy5za2luLnN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gbnVsbDtcbiAgY29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLndpbkF2YXRhciA9IG51bGw7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsXG4gICAgICB9KSxcbiAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogbGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgaW5wdXRPdXRwdXRUYWJsZTogbGV2ZWwuaW5wdXRPdXRwdXRUYWJsZSxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0NhbGMnKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIENBTlZBU19XSURUSCk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQ0FOVkFTX0hFSUdIVCk7XG5cbiAgICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tncm91bmQnKTtcbiAgICAgIGJhY2tncm91bmQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICcvYmxvY2tseS9tZWRpYS9za2lucy9jYWxjL2JhY2tncm91bmRfZnJlZXBsYXkucG5nJyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBoYWNrIHRoYXQgSSBoYXZlbid0IGJlZW4gYWJsZSB0byBmdWxseSB1bmRlcnN0YW5kLiBGdXJ0aGVybW9yZSxcbiAgICAvLyBpdCBzZWVtcyB0byBicmVhayB0aGUgZnVuY3Rpb25hbCBibG9ja3MgaW4gc29tZSBicm93c2Vycy4gQXMgc3VjaCwgSSdtXG4gICAgLy8ganVzdCBnb2luZyB0byBkaXNhYmxlIHRoZSBoYWNrIGZvciB0aGlzIGFwcC5cbiAgICBCbG9ja2x5LkJST0tFTl9DT05UUk9MX1BPSU5UUyA9IGZhbHNlO1xuXG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnQ2FsYyxjb2RlJyk7XG5cbiAgICB2YXIgc29sdXRpb25CbG9ja3MgPSBsZXZlbC5zb2x1dGlvbkJsb2NrcztcbiAgICBpZiAobGV2ZWwuc29sdXRpb25CbG9ja3MgJiYgbGV2ZWwuc29sdXRpb25CbG9ja3MgIT09ICcnKSB7XG4gICAgICBzb2x1dGlvbkJsb2NrcyA9IGJsb2NrVXRpbHMuZm9yY2VJbnNlcnRUb3BCbG9jayhsZXZlbC5zb2x1dGlvbkJsb2NrcyxcbiAgICAgICAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2spO1xuICAgIH1cblxuICAgIGFwcFN0YXRlLnRhcmdldFNldCA9IGdlbmVyYXRlRXF1YXRpb25TZXRGcm9tQmxvY2tYbWwoc29sdXRpb25CbG9ja3MpO1xuXG4gICAgZGlzcGxheUdvYWwoYXBwU3RhdGUudGFyZ2V0U2V0KTtcblxuICAgIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICAgIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICAgIC8vIGJhc2UncyBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlIGNhbGxlZCBmaXJzdFxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmVzZXRCdXR0b24sIENhbGMucmVzZXRCdXR0b25DbGljayk7XG5cbiAgICBpZiAoQmxvY2tseS5jb250cmFjdEVkaXRvcikge1xuICAgICAgQmxvY2tseS5jb250cmFjdEVkaXRvci5yZWdpc3RlclRlc3RIYW5kbGVyKGdldENhbGNFeGFtcGxlRmFpbHVyZSk7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdFJlc2V0SGFuZGxlcihyZXNldENhbGNFeGFtcGxlKTtcbiAgICB9XG4gIH07XG5cbiAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtCbG9ja2x5LkJsb2NrfVxuICogQHBhcmFtIHtib29sZWFufSBbZXZhbHVhdGVJblBsYXlzcGFjZV0gVHJ1ZSBpZiB0aGlzIHRlc3Qgc2hvdWxkIGFsc28gc2hvd1xuICogICBldmFsdWF0aW9uIGluIHRoZSBwbGF5IHNwYWNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBFcnJvciBzdHJpbmcsIG9yIG51bGwgaWYgc3VjY2Vzc1xuICovXG5mdW5jdGlvbiBnZXRDYWxjRXhhbXBsZUZhaWx1cmUoZXhhbXBsZUJsb2NrLCBldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gIHRyeSB7XG4gICAgdmFyIGVudGlyZVNldCA9IG5ldyBFcXVhdGlvblNldChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpKTtcblxuICAgIHZhciBhY3R1YWxCbG9jayA9IGV4YW1wbGVCbG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKFwiQUNUVUFMXCIpO1xuICAgIHZhciBleHBlY3RlZEJsb2NrID0gZXhhbXBsZUJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soXCJFWFBFQ1RFRFwiKTtcblxuICAgIHN0dWRpb0FwcC5mZWVkYmFja18udGhyb3dPbkludmFsaWRFeGFtcGxlQmxvY2tzKGFjdHVhbEJsb2NrLCBleHBlY3RlZEJsb2NrKTtcblxuICAgIHZhciBhY3R1YWxFcXVhdGlvbiA9IEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGFjdHVhbEJsb2NrKTtcbiAgICB2YXIgYWN0dWFsID0gZW50aXJlU2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oYWN0dWFsRXF1YXRpb24uZXhwcmVzc2lvbik7XG5cbiAgICB2YXIgZXhwZWN0ZWRFcXVhdGlvbiA9IEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGV4cGVjdGVkQmxvY2spO1xuICAgIHZhciBleHBlY3RlZCA9IGVudGlyZVNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cGVjdGVkRXF1YXRpb24uZXhwcmVzc2lvbik7XG5cbiAgICB2YXIgYXJlRXF1YWwgPSBqc251bXMuZXF1YWxzKGV4cGVjdGVkLnJlc3VsdCwgYWN0dWFsLnJlc3VsdCk7XG5cbiAgICBpZiAoZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICAgICAgdmFyIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChleHBlY3RlZEVxdWF0aW9uLCBudWxsKTtcbiAgICAgIGlmICghZXhwZWN0ZWQuZXJyKSB7XG4gICAgICAgIHRva2VuTGlzdC5wdXNoKG5ldyBUb2tlbignID0gJywgZmFsc2UpKTtcbiAgICAgICAgdG9rZW5MaXN0LnB1c2gobmV3IFRva2VuKGV4cGVjdGVkLnJlc3VsdCwgIWFyZUVxdWFsKSk7XG4gICAgICB9XG4gICAgICBjbGVhclN2Z0V4cHJlc3Npb24oJ2Fuc3dlckV4cHJlc3Npb24nKTtcbiAgICAgIGRpc3BsYXlFcXVhdGlvbigndXNlckV4cHJlc3Npb24nLCBudWxsLCB0b2tlbkxpc3QsIDAsICdlcnJvclRva2VuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZUVxdWFsID8gbnVsbCA6IFwiRG9lcyBub3QgbWF0Y2ggZGVmaW5pdGlvblwiO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIE1vc3QgQ2FsYyBlcnJvciBtZXNzYWdlcyB3ZXJlIG5vdCBtZWFudCB0byBiZSB1c2VyIGZhY2luZy5cbiAgICByZXR1cm4gXCJFdmFsdWF0aW9uIEZhaWxlZC5cIjtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldENhbGNFeGFtcGxlKCkge1xuICBjbGVhclN2Z0V4cHJlc3Npb24oJ3VzZXJFeHByZXNzaW9uJyk7XG4gIGRpc3BsYXlHb2FsKGFwcFN0YXRlLnRhcmdldFNldCk7XG59XG5cbi8qKlxuICogQSBmZXcgcG9zc2libGUgc2NlbmFyaW9zXG4gKiAoMSkgV2UgZG9uJ3QgaGF2ZSBhIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24gKGkuZS4gZnJlZXBsYXkpLiBTaG93IG5vdGhpbmcuXG4gKiAoMikgV2UgaGF2ZSBhIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24sIG9uZSBmdW5jdGlvbiwgYW5kIG5vIHZhcmlhYmxlcy5cbiAqICAgICBTaG93IHRoZSBjb21wdXRlIGV4cHJlc3Npb24gKyBldmFsdWF0aW9uLCBhbmQgbm90aGluZyBlbHNlXG4gKiAoMykgV2UgaGF2ZSBhIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24gdGhhdCBpcyBqdXN0IGEgc2luZ2xlIHZhcmlhYmxlLCBhbmRcbiAqICAgICBzb21lIG51bWJlciBvZiBhZGRpdGlvbmFsIHZhcmlhYmxlcywgYnV0IG5vIGZ1bmN0aW9ucy4gRGlzcGxheSBvbmx5XG4gKiAgICAgdGhlIG5hbWUgb2YgdGhlIHNpbmdsZSB2YXJpYWJsZVxuICogKDQpIFdlIGhhdmUgYSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uIHRoYXQgaXMgbm90IGEgc2luZ2xlIHZhcmlhYmxlLCBhbmRcbiAqICAgICBwb3NzaWJsZSBzb21lIG51bWJlciBvZiBhZGRpdGlvbmFsIHZhcmlhYmxlcywgYnV0IG5vIGZ1bmN0aW9ucy4gRGlzcGxheVxuICogICAgIGNvbXB1dGUgZXhwcmVzc2lvbiBhbmQgdmFyaWFibGVzLlxuICogKDUpIFdlIGhhdmUgYSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uLCBhbmQgZWl0aGVyIG11bHRpcGxlIGZ1bmN0aW9ucyBvclxuICogICAgIG9uZSBmdW5jdGlvbiBhbmQgdmFyaWFibGUocykuIEN1cnJlbnRseSBub3Qgc3VwcG9ydGVkLlxuICogQHBhcmFtIHtFcXVhdGlvblNldH0gdGFyZ2V0U2V0IFRoZSB0YXJnZXQgZXF1YXRpb24gc2V0LlxuICovXG5mdW5jdGlvbiBkaXNwbGF5R29hbCh0YXJnZXRTZXQpIHtcbiAgdmFyIGNvbXB1dGVFcXVhdGlvbiA9IHRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgaWYgKCFjb21wdXRlRXF1YXRpb24gfHwgIWNvbXB1dGVFcXVhdGlvbi5leHByZXNzaW9uKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIHNpbmdsZSBmdW5jdGlvbiwganVzdCBzaG93IHRoZSBldmFsdWF0aW9uXG4gIC8vIChpLmUuIGNvbXB1dGUgZXhwcmVzc2lvbikuIE90aGVyd2lzZSBzaG93IGFsbCBlcXVhdGlvbnMuXG4gIHZhciB0b2tlbkxpc3Q7XG4gIHZhciBuZXh0Um93ID0gMDtcbiAgdmFyIGNvbXB1dGVzRnVuY3Rpb24gPSB0YXJnZXRTZXQuY29tcHV0ZXNGdW5jdGlvbkNhbGwoKTtcbiAgaWYgKCFjb21wdXRlc0Z1bmN0aW9uICYmICF0YXJnZXRTZXQuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSgpKSB7XG4gICAgdmFyIHNvcnRlZEVxdWF0aW9ucyA9IHRhcmdldFNldC5zb3J0ZWRFcXVhdGlvbnMoKTtcbiAgICBzb3J0ZWRFcXVhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZXF1YXRpb24pIHtcbiAgICAgIGlmIChlcXVhdGlvbi5pc0Z1bmN0aW9uKCkgJiYgc29ydGVkRXF1YXRpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsYyBkb2Vzbid0IHN1cHBvcnQgZ29hbCB3aXRoIG11bHRpcGxlIGZ1bmN0aW9ucyBvciBcIiArXG4gICAgICAgICAgXCJtaXhlZCBmdW5jdGlvbnMvdmFyc1wiKTtcbiAgICAgIH1cblxuICAgICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGVxdWF0aW9uKTtcbiAgICAgIGRpc3BsYXlFcXVhdGlvbignYW5zd2VyRXhwcmVzc2lvbicsIGVxdWF0aW9uLnNpZ25hdHVyZSwgdG9rZW5MaXN0LCBuZXh0Um93KyspO1xuICAgIH0pO1xuICB9XG5cbiAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGNvbXB1dGVFcXVhdGlvbik7XG4gIHZhciBldmFsdWF0aW9uID0gdGFyZ2V0U2V0LmV2YWx1YXRlKCk7XG4gIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgIHRocm93IGV2YWx1YXRpb24uZXJyO1xuICB9XG5cbiAgaWYgKGNvbXB1dGVzRnVuY3Rpb24pIHtcbiAgICB0b2tlbkxpc3QucHVzaChuZXcgVG9rZW4oJyA9ICcsIGZhbHNlKSk7XG4gICAgdG9rZW5MaXN0LnB1c2gobmV3IFRva2VuKGV2YWx1YXRpb24ucmVzdWx0LCBmYWxzZSkpO1xuICB9XG4gIGRpc3BsYXlFcXVhdGlvbignYW5zd2VyRXhwcmVzc2lvbicsIGNvbXB1dGVFcXVhdGlvbi5zaWduYXR1cmUsIHRva2VuTGlzdCwgbmV4dFJvdyk7XG59XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuQ2FsYy5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uKCkge1xuICBzdHVkaW9BcHAudG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG4gIENhbGMuZXhlY3V0ZSgpO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgcmVzZXQgYnV0dG9uIGNsaWNrIGxvZ2ljLiAgc3R1ZGlvQXBwLnJlc2V0QnV0dG9uQ2xpY2sgd2lsbCBiZVxuICogY2FsbGVkIGZpcnN0LlxuICovXG5DYWxjLnJlc2V0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGFwcFN0YXRlLmFuaW1hdGluZyA9IGZhbHNlO1xuICBhcHBTdGF0ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIGFwcFN0YXRlLnJlc3BvbnNlID0gbnVsbDtcbiAgYXBwU3RhdGUubWVzc2FnZSA9IG51bGw7XG4gIGFwcFN0YXRlLnJlc3VsdCA9IG51bGw7XG4gIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gbnVsbDtcbiAgYXBwU3RhdGUuZmFpbGVkSW5wdXQgPSBudWxsO1xuXG4gIHRpbWVvdXRMaXN0LmNsZWFyVGltZW91dHMoKTtcblxuICBjbGVhclN2Z0V4cHJlc3Npb24oJ3VzZXJFeHByZXNzaW9uJyk7XG59O1xuXG4vKipcbiAqIEdpdmVuIHNvbWUgeG1sLCBnZW5lYXRlcyBhbiBleHByZXNzaW9uIHNldCBieSBsb2FkaW5nIGJsb2NrcyBpbnRvIHRoZVxuICogYmxvY2tzcGFjZS4uIEZhaWxzIGlmIHRoZXJlIGFyZSBhbHJlYWR5IGJsb2NrcyBpbiB0aGUgd29ya3NwYWNlLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUVxdWF0aW9uU2V0RnJvbUJsb2NrWG1sKGJsb2NrWG1sKSB7XG4gIGlmIChibG9ja1htbCkge1xuICAgIGlmIChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZ2VuZXJhdGVUYXJnZXRFeHByZXNzaW9uIHNob3VsZG4ndCBiZSBjYWxsZWQgd2l0aCBibG9ja3NcIiArXG4gICAgICAgIFwiaWYgd2UgYWxyZWFkeSBoYXZlIGJsb2NrcyBpbiB0aGUgd29ya3NwYWNlXCIpO1xuICAgIH1cbiAgICAvLyBUZW1wb3JhcmlseSBwdXQgdGhlIGJsb2NrcyBpbnRvIHRoZSB3b3Jrc3BhY2Ugc28gdGhhdCB3ZSBjYW4gZ2VuZXJhdGUgY29kZVxuICAgIHN0dWRpb0FwcC5sb2FkQmxvY2tzKGJsb2NrWG1sKTtcbiAgfVxuXG4gIHZhciBlcXVhdGlvblNldCA9IG5ldyBFcXVhdGlvblNldChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpKTtcblxuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgYmxvY2suZGlzcG9zZSgpO1xuICB9KTtcblxuICByZXR1cm4gZXF1YXRpb25TZXQ7XG59XG5cbi8qKlxuICogRXZhbHVhdGVzIGEgdGFyZ2V0IHNldCBhZ2FpbnN0IGEgdXNlciBzZXQgd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSBmdW5jdGlvbi5cbiAqIEl0IGRvZXMgdGhpcyBiZSBmZWVkaW5nIHRoZSBmdW5jdGlvbiBhIHNldCBvZiB2YWx1ZXMsIGFuZCBtYWtpbmcgc3VyZVxuICogdGhlIHRhcmdldCBhbmQgdXNlciBzZXQgZXZhbHVhdGUgdG8gdGhlIHNhbWUgcmVzdWx0IGZvciBlYWNoLlxuICovXG5DYWxjLmV2YWx1YXRlRnVuY3Rpb25fID0gZnVuY3Rpb24gKHRhcmdldFNldCwgdXNlclNldCkge1xuICB2YXIgb3V0Y29tZSA9IHtcbiAgICByZXN1bHQ6IFJlc3VsdFR5cGUuVU5TRVQsXG4gICAgdGVzdFJlc3VsdHM6IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTixcbiAgICBtZXNzYWdlOiB1bmRlZmluZWQsXG4gICAgZmFpbGVkSW5wdXQ6IG51bGxcbiAgfTtcblxuICAvLyBpZiBvdXIgdGFyZ2V0IGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCB3ZSBldmFsdWF0ZSBzdWNjZXNzIGJ5IGV2YWx1YXRpbmcgdGhlXG4gIC8vIGZ1bmN0aW9uIHdpdGggZGlmZmVyZW50IGlucHV0c1xuICB2YXIgZXhwcmVzc2lvbiA9IHRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uLmNsb25lKCk7XG5cbiAgLy8gbWFrZSBzdXJlIG91ciB0YXJnZXQvdXNlciBjYWxscyBsb29rIHRoZSBzYW1lXG4gIHZhciB1c2VyRXF1YXRpb24gPSB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICB2YXIgdXNlckV4cHJlc3Npb24gPSB1c2VyRXF1YXRpb24gJiYgdXNlckVxdWF0aW9uLmV4cHJlc3Npb247XG4gIGlmICghZXhwcmVzc2lvbi5oYXNTYW1lU2lnbmF0dXJlKHVzZXJFeHByZXNzaW9uKSB8fFxuICAgICF1c2VyU2V0LmNvbXB1dGVzRnVuY3Rpb25DYWxsKCkpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMO1xuXG4gICAgdmFyIHRhcmdldEZ1bmN0aW9uTmFtZSA9IGV4cHJlc3Npb24uZ2V0VmFsdWUoKTtcbiAgICBpZiAoIXVzZXJTZXQuZ2V0RXF1YXRpb24odGFyZ2V0RnVuY3Rpb25OYW1lKSkge1xuICAgICAgb3V0Y29tZS5tZXNzYWdlID0gY2FsY01zZy5taXNzaW5nRnVuY3Rpb25FcnJvcih7XG4gICAgICAgIGZ1bmN0aW9uTmFtZTogdGFyZ2V0RnVuY3Rpb25OYW1lXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxuXG4gIC8vIEZpcnN0IGV2YWx1YXRlIGJvdGggd2l0aCB0aGUgdGFyZ2V0IHNldCBvZiBpbnB1dHNcbiAgdmFyIHRhcmdldEV2YWx1YXRpb24gPSB0YXJnZXRTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgdmFyIHVzZXJFdmFsdWF0aW9uID0gdXNlclNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICBpZiAodGFyZ2V0RXZhbHVhdGlvbi5lcnIgfHwgdXNlckV2YWx1YXRpb24uZXJyKSB7XG4gICAgcmV0dXJuIGRpdlplcm9PckZhaWx1cmUodGFyZ2V0RXZhbHVhdGlvbi5lcnIgfHwgdXNlckV2YWx1YXRpb24uZXJyKTtcbiAgfVxuICBpZiAoIWpzbnVtcy5lcXVhbHModGFyZ2V0RXZhbHVhdGlvbi5yZXN1bHQsIHVzZXJFdmFsdWF0aW9uLnJlc3VsdCkpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMO1xuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB3ZSBwYXNzZWQgdXNpbmcgdGhlIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24ncyBpbnB1dHMuXG4gIC8vIE5vdyB3ZSB3YW50IHRvIHVzZSBhbGwgY29tYmluYXRpb25zIG9mIGlucHV0cyBpbiB0aGUgcmFuZ2UgWy0xMDAuLi4xMDBdLFxuICAvLyBub3Rpbmcgd2hpY2ggc2V0IG9mIGlucHV0cyBmYWlsZWQgKGlmIGFueSlcbiAgdmFyIHBvc3NpYmxlVmFsdWVzID0gXy5yYW5nZSgxLCAxMDEpLmNvbmNhdChfLnJhbmdlKC0wLCAtMTAxLCAtMSkpO1xuICB2YXIgbnVtUGFyYW1zID0gZXhwcmVzc2lvbi5udW1DaGlsZHJlbigpO1xuICB2YXIgaXRlcmF0b3IgPSBuZXcgSW5wdXRJdGVyYXRvcihwb3NzaWJsZVZhbHVlcywgbnVtUGFyYW1zKTtcblxuICB2YXIgc2V0Q2hpbGRUb1ZhbHVlID0gZnVuY3Rpb24gKHZhbCwgaW5kZXgpIHtcbiAgICBleHByZXNzaW9uLnNldENoaWxkVmFsdWUoaW5kZXgsIHZhbCk7XG4gIH07XG5cbiAgd2hpbGUgKGl0ZXJhdG9yLnJlbWFpbmluZygpID4gMCAmJiAhb3V0Y29tZS5mYWlsZWRJbnB1dCkge1xuICAgIHZhciB2YWx1ZXMgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgdmFsdWVzLmZvckVhY2goc2V0Q2hpbGRUb1ZhbHVlKTtcblxuICAgIHRhcmdldEV2YWx1YXRpb24gPSB0YXJnZXRTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgICB1c2VyRXZhbHVhdGlvbiA9IHVzZXJTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgICBpZiAodGFyZ2V0RXZhbHVhdGlvbi5lcnIgfHwgdXNlckV2YWx1YXRpb24uZXJyKSB7XG4gICAgICByZXR1cm4gZGl2WmVyb09yRmFpbHVyZSh0YXJnZXRFdmFsdWF0aW9uLmVyciB8fCB1c2VyRXZhbHVhdGlvbi5lcnIpO1xuICAgIH1cbiAgICBpZiAoIWpzbnVtcy5lcXVhbHModGFyZ2V0RXZhbHVhdGlvbi5yZXN1bHQsIHVzZXJFdmFsdWF0aW9uLnJlc3VsdCkpIHtcbiAgICAgIG91dGNvbWUuZmFpbGVkSW5wdXQgPSBfLmNsb25lKHZhbHVlcyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG91dGNvbWUuZmFpbGVkSW5wdXQpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgb3V0Y29tZS5tZXNzYWdlID0gY2FsY01zZy5mYWlsZWRJbnB1dCgpO1xuICB9IGVsc2UgaWYgKCF0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbi5pc0lkZW50aWNhbFRvKFxuICAgICAgdXNlclNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uKSkge1xuICAgIC8vIHdlIGhhdmUgdGhlIHJpZ2h0IGZ1bmN0aW9uLCBidXQgYXJlIGNhbGxpbmcgd2l0aCB0aGUgd3JvbmcgaW5wdXRzXG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgIG91dGNvbWUubWVzc2FnZSA9IGNhbGNNc2cud3JvbmdJbnB1dCgpO1xuICB9IGVsc2Uge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BTExfUEFTUztcbiAgfVxuICByZXR1cm4gb3V0Y29tZTtcbn07XG5cbmZ1bmN0aW9uIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUobWVzc2FnZSwgZmFpbGVkSW5wdXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN1bHQ6IFJlc3VsdFR5cGUuRkFJTFVSRSxcbiAgICB0ZXN0UmVzdWx0czogVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUwsXG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBmYWlsZWRJbnB1dDogdXRpbHMudmFsdWVPcihmYWlsZWRJbnB1dCwgbnVsbClcbiAgfTtcbn1cblxuLyoqXG4gKiBMb29rcyB0byBzZWUgaWYgZ2l2ZW4gZXJyb3IgaXMgYSBkaXZpZGUgYnkgemVybyBlcnJvci4gSWYgaXQgaXMsIHdlIGZhaWxcbiAqIHdpdGggYW4gYXBwIHNwZWNpZmljIG1ldGhvZC4gSWYgbm90LCB3ZSB0aHJvdyBhIHN0YW5kYXJkIGZhaWx1cmVcbiAqL1xuZnVuY3Rpb24gZGl2WmVyb09yRmFpbHVyZShlcnIpIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yKSB7XG4gICAgcmV0dXJuIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUoY2FsY01zZy5kaXZpZGVCeVplcm9FcnJvcigpLCBudWxsKTtcbiAgfVxuXG4gIC8vIE9uZSB3YXkgd2Uga25vdyB3ZSBjYW4gZmFpbCBpcyB3aXRoIGluZmluaXRlIHJlY3Vyc2lvbi4gTG9nIGlmIHdlIGZhaWxcbiAgLy8gZm9yIHNvbWUgb3RoZXIgcmVhc29uXG4gIGlmICghdXRpbHMuaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yKGVycikpIHtcbiAgICBjb25zb2xlLmxvZygnVW5leHBlY3RlZCBlcnJvcjogJyArIGVycik7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlc3VsdDogUmVzdWx0VHlwZS5GQUlMVVJFLFxuICAgIHRlc3RSZXN1bHRzOiBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUwsXG4gICAgbWVzc2FnZTogbnVsbCxcbiAgICBmYWlsZWRJbnB1dDogbnVsbFxuICB9O1xufVxuXG4vKipcbiAqIEV2YWx1YXRlcyBhIHRhcmdldCBzZXQgYWdhaW5zdCBhIHVzZXIgc2V0IHdoZW4gb3VyIGNvbXB1dGUgZXhwcmVzc2lvbiBpc1xuICoganVzdCBhIG5ha2VkIHZhcmlhYmxlLiBJdCBkb2VzIHRoaXMgYnkgbG9va2luZyBmb3IgYSBjb25zdGFudCBpbiB0aGVcbiAqIGVxdWF0aW9uIHNldCwgYW5kIHRoZW4gdmFsaWRhdGluZyB0aGF0IChhKSB3ZSBoYXZlIGEgdmFyaWFibGUgb2YgdGhlIHNhbWVcbiAqIG5hbWUgaW4gdGhlIHVzZXIgc2V0IGFuZCAoYikgdGhhdCBjaGFuZ2luZyB0aGF0IHZhbHVlIGluIGJvdGggc2V0cyBzdGlsbFxuICogcmVzdWx0cyBpbiB0aGUgc2FtZSBldmFsdWF0aW9uXG4gKi9cbkNhbGMuZXZhbHVhdGVTaW5nbGVWYXJpYWJsZV8gPSBmdW5jdGlvbiAodGFyZ2V0U2V0LCB1c2VyU2V0KSB7XG4gIHZhciBvdXRjb21lID0ge1xuICAgIHJlc3VsdDogUmVzdWx0VHlwZS5VTlNFVCxcbiAgICB0ZXN0UmVzdWx0czogVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOLFxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZCxcbiAgICBmYWlsZWRJbnB1dDogbnVsbFxuICB9O1xuXG4gIGlmICghdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb24uaXNJZGVudGljYWxUbyhcbiAgICAgIHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShjYWxjTXNnLmxldmVsSW5jb21wbGV0ZUVycm9yKCkpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIG91ciB0YXJnZXQgc2V0IGhhcyBhIGNvbnN0YW50IHZhcmlhYmxlIHdlIGNhbiB1c2UgYXMgb3VyXG4gIC8vIHBzZXVkbyBpbnB1dFxuICB2YXIgdGFyZ2V0Q29uc3RhbnRzID0gdGFyZ2V0U2V0LmdldENvbnN0YW50cygpO1xuICBpZiAodGFyZ2V0Q29uc3RhbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZDogc2luZ2xlIHZhcmlhYmxlIHdpdGggbm8gY29uc3RhbnRzJyk7XG4gIH1cblxuICAvLyBUaGUgY29kZSBpcyBpbiBwbGFjZSB0byB0aGVvcmV0aWNhbGx5IHN1cHBvcnQgdmFyeWluZyBtdWx0aXBsZSBjb25zdGFudHMsXG4gIC8vIGJ1dCB3ZSBkZWNpZGVkIHdlIGRvbid0IG5lZWQgdG8gc3VwcG9ydCB0aGF0LCBzbyBJJ20gZ29pbmcgdG8gZXhwbGljaXRseVxuICAvLyBkaXNhbGxvdyBpdCB0byByZWR1Y2UgdGhlIHRlc3QgbWF0cml4LlxuICBpZiAodGFyZ2V0Q29uc3RhbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gc3VwcG9ydCBmb3IgbXVsdGlwbGUgY29uc3RhbnRzJyk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgZWFjaCBvZiBvdXIgcHNldWRvIGlucHV0cyBoYXMgYSBjb3JyZXNwb25kaW5nIHZhcmlhYmxlIGluIHRoZVxuICAvLyB1c2VyIHNldC5cbiAgdmFyIHVzZXJDb25zdGFudHMgPSB1c2VyU2V0LmdldENvbnN0YW50cygpO1xuICB2YXIgdXNlckNvbnN0YW50TmFtZXMgPSB1c2VyQ29uc3RhbnRzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLm5hbWU7XG4gIH0pO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Q29uc3RhbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHVzZXJDb25zdGFudE5hbWVzLmluZGV4T2YodGFyZ2V0Q29uc3RhbnRzW2ldLm5hbWUpID09PSAtMSkge1xuICAgICAgcmV0dXJuIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUoY2FsY01zZy5taXNzaW5nVmFyaWFibGVYKFxuICAgICAgICB7dmFyOiB0YXJnZXRDb25zdGFudHNbaV0ubmFtZX0pKTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayB0byBzZWUgdGhhdCBldmFsdWF0aW5nIHRhcmdldCBzZXQgd2l0aCB0aGUgdXNlciB2YWx1ZSBvZiB0aGUgY29uc3RhbnQocylcbiAgLy8gZ2l2ZXMgdGhlIHNhbWUgcmVzdWx0IGFzIGV2YWx1YXRpbmcgdGhlIHVzZXIgc2V0LlxuICB2YXIgZXZhbHVhdGlvbiA9IHVzZXJTZXQuZXZhbHVhdGUoKTtcbiAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgcmV0dXJuIGRpdlplcm9PckZhaWx1cmUoZXZhbHVhdGlvbi5lcnIpO1xuICB9XG4gIHZhciB1c2VyUmVzdWx0ID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG5cbiAgdmFyIHRhcmdldENsb25lID0gdGFyZ2V0U2V0LmNsb25lKCk7XG4gIHZhciB1c2VyQ2xvbmUgPSB1c2VyU2V0LmNsb25lKCk7XG4gIHZhciBzZXRDb25zdGFudHNUb1ZhbHVlID0gZnVuY3Rpb24gKHZhbCwgaW5kZXgpIHtcbiAgICB2YXIgbmFtZSA9IHRhcmdldENvbnN0YW50c1tpbmRleF0ubmFtZTtcbiAgICB0YXJnZXRDbG9uZS5nZXRFcXVhdGlvbihuYW1lKS5leHByZXNzaW9uLnNldFZhbHVlKHZhbCk7XG4gICAgdXNlckNsb25lLmdldEVxdWF0aW9uKG5hbWUpLmV4cHJlc3Npb24uc2V0VmFsdWUodmFsKTtcbiAgfTtcblxuICBldmFsdWF0aW9uID0gdGFyZ2V0U2V0LmV2YWx1YXRlKCk7XG4gIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgIHRocm93IGV2YWx1YXRpb24uZXJyO1xuICB9XG4gIHZhciB0YXJnZXRSZXN1bHQgPSBldmFsdWF0aW9uLnJlc3VsdDtcblxuICBpZiAoIWpzbnVtcy5lcXVhbHModXNlclJlc3VsdCwgdGFyZ2V0UmVzdWx0KSkge1xuICAgIC8vIE91ciByZXN1bHQgY2FuIGRpZmZlcmVudCBmcm9tIHRoZSB0YXJnZXQgcmVzdWx0IGZvciB0d28gcmVhc29uc1xuICAgIC8vICgxKSBXZSBoYXZlIHRoZSByaWdodCBlcXVhdGlvbiwgYnV0IG91ciBcImNvbnN0YW50XCIgaGFzIGEgZGlmZmVyZW50IHZhbHVlLlxuICAgIC8vICgyKSBXZSBoYXZlIHRoZSB3cm9uZyBlcXVhdGlvblxuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBldmFsdWF0ZSB0byB0aGUgc2FtZSBhcyB0YXJnZXQgaWYgd2UgZ2l2ZSBpdCB0aGVcbiAgICAvLyB2YWx1ZXMgZnJvbSBvdXIgdXNlclNldC5cbiAgICB0YXJnZXRDb25zdGFudHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICAgIHZhciBuYW1lID0gaXRlbS5uYW1lO1xuICAgICAgdmFyIHZhbCA9IHVzZXJDbG9uZS5nZXRFcXVhdGlvbihuYW1lKS5leHByZXNzaW9uLmV2YWx1YXRlKCkucmVzdWx0O1xuICAgICAgc2V0Q29uc3RhbnRzVG9WYWx1ZSh2YWwsIGluZGV4KTtcbiAgICB9KTtcblxuICAgIGV2YWx1YXRpb24gPSB0YXJnZXRDbG9uZS5ldmFsdWF0ZSgpO1xuICAgIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgICAgcmV0dXJuIGRpdlplcm9PckZhaWx1cmUoZXZhbHVhdGlvbi5lcnIpO1xuICAgIH1cbiAgICBpZiAoIWpzbnVtcy5lcXVhbHModXNlclJlc3VsdCwgZXZhbHVhdGlvbi5yZXN1bHQpKSB7XG4gICAgICByZXR1cm4gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShjYWxjTXNnLndyb25nUmVzdWx0KCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSB1c2VyIGdvdCB0aGUgcmlnaHQgdmFsdWUgZm9yIHRoZWlyIGlucHV0LiBMZXQncyB0cnkgY2hhbmdpbmcgaXQgYW5kXG4gIC8vIHNlZSBpZiB0aGV5IHN0aWxsIGdldCB0aGUgcmlnaHQgdmFsdWVcbiAgdmFyIHBvc3NpYmxlVmFsdWVzID0gXy5yYW5nZSgxLCAxMDEpLmNvbmNhdChfLnJhbmdlKC0wLCAtMTAxLCAtMSkpO1xuICB2YXIgbnVtUGFyYW1zID0gdGFyZ2V0Q29uc3RhbnRzLmxlbmd0aDtcbiAgdmFyIGl0ZXJhdG9yID0gbmV3IElucHV0SXRlcmF0b3IocG9zc2libGVWYWx1ZXMsIG51bVBhcmFtcyk7XG5cbiAgd2hpbGUgKGl0ZXJhdG9yLnJlbWFpbmluZygpID4gMCAmJiAhb3V0Y29tZS5mYWlsZWRJbnB1dCkge1xuICAgIHZhciB2YWx1ZXMgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgdmFsdWVzLmZvckVhY2goc2V0Q29uc3RhbnRzVG9WYWx1ZSk7XG5cbiAgICB2YXIgdGFyZ2V0RXZhbHVhdGlvbiA9IHRhcmdldENsb25lLmV2YWx1YXRlKCk7XG4gICAgdmFyIHVzZXJFdmFsdWF0aW9uID0gdXNlckNsb25lLmV2YWx1YXRlKCk7XG4gICAgdmFyIGVyciA9IHRhcmdldEV2YWx1YXRpb24uZXJyIHx8IHVzZXJFdmFsdWF0aW9uLmVycjtcbiAgICBpZiAoZXJyKSB7XG4gICAgICByZXR1cm4gZGl2WmVyb09yRmFpbHVyZShlcnIpO1xuICAgIH1cblxuICAgIGlmICghanNudW1zLmVxdWFscyh0YXJnZXRFdmFsdWF0aW9uLnJlc3VsdCwgdXNlckV2YWx1YXRpb24ucmVzdWx0KSkge1xuICAgICAgb3V0Y29tZS5mYWlsZWRJbnB1dCA9IF8uY2xvbmUodmFsdWVzKTtcbiAgICB9XG4gIH1cblxuICBpZiAob3V0Y29tZS5mYWlsZWRJbnB1dCkge1xuICAgIHZhciBtZXNzYWdlID0gY2FsY01zZy53cm9uZ090aGVyVmFsdWVzWCh7dmFyOiB0YXJnZXRDb25zdGFudHNbMF0ubmFtZX0pO1xuICAgIHJldHVybiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKG1lc3NhZ2UsIG91dGNvbWUuZmFpbGVkSW5wdXQpO1xuICB9XG5cbiAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BTExfUEFTUztcbiAgcmV0dXJuIG91dGNvbWU7XG59O1xuXG4vKipcbiAqIEBzdGF0aWNcbiAqIEByZXR1cm5zIG91dGNvbWUgb2JqZWN0XG4gKi9cbkNhbGMuZXZhbHVhdGVSZXN1bHRzXyA9IGZ1bmN0aW9uICh0YXJnZXRTZXQsIHVzZXJTZXQpIHtcbiAgdmFyIGlkZW50aWNhbCwgdXNlciwgdGFyZ2V0O1xuICB2YXIgb3V0Y29tZSA9IHtcbiAgICByZXN1bHQ6IFJlc3VsdFR5cGUuVU5TRVQsXG4gICAgdGVzdFJlc3VsdHM6IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTixcbiAgICBtZXNzYWdlOiB1bmRlZmluZWQsXG4gICAgZmFpbGVkSW5wdXQ6IG51bGxcbiAgfTtcblxuICBpZiAodGFyZ2V0U2V0LmNvbXB1dGVzRnVuY3Rpb25DYWxsKCkpIHtcbiAgICAvLyBFdmFsdWF0ZSBmdW5jdGlvbiBieSB0ZXN0aW5nIGl0IHdpdGggYSBzZXJpZXMgb2YgaW5wdXRzXG4gICAgcmV0dXJuIENhbGMuZXZhbHVhdGVGdW5jdGlvbl8odGFyZ2V0U2V0LCB1c2VyU2V0KTtcbiAgfSBlbHNlIGlmICh0YXJnZXRTZXQuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSgpKSB7XG4gICAgcmV0dXJuIENhbGMuZXZhbHVhdGVTaW5nbGVWYXJpYWJsZV8odGFyZ2V0U2V0LCB1c2VyU2V0KTtcbiAgfSBlbHNlIGlmICh1c2VyU2V0Lmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkgfHxcbiAgICAgIHRhcmdldFNldC5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpKSB7XG5cbiAgICAvLyBXZSBoYXZlIG11bHRpcGxlIGV4cHJlc3Npb25zLiBFaXRoZXIgb3VyIHNldCBvZiBleHByZXNzaW9ucyBhcmUgZXF1YWwsXG4gICAgLy8gb3IgdGhleSdyZSBub3QuXG4gICAgaWYgKHRhcmdldFNldC5pc0lkZW50aWNhbFRvKHVzZXJTZXQpKSB7XG4gICAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BTExfUEFTUztcbiAgICB9IGVsc2UgaWYgKHRhcmdldFNldC5pc0VxdWl2YWxlbnRUbyh1c2VyU2V0KSkge1xuICAgICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICBvdXRjb21lLm1lc3NhZ2UgPSBjYWxjTXNnLmVxdWl2YWxlbnRFeHByZXNzaW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTDtcbiAgICB9XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH0gZWxzZSB7XG4gICAgLy8gV2UgaGF2ZSBvbmx5IGEgY29tcHV0ZSBlcXVhdGlvbiBmb3IgZWFjaCBzZXQuIElmIHRoZXkncmUgbm90IGVxdWFsLFxuICAgIC8vIGNoZWNrIHRvIHNlZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWl2YWxlbnQgKGkuZS4gdGhlIHNhbWUsIGJ1dCB3aXRoXG4gICAgLy8gaW5wdXRzIG9yZGVyZWQgZGlmZmVyZW50bHkpXG4gICAgdXNlciA9IHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuXG4gICAgaWRlbnRpY2FsID0gdGFyZ2V0U2V0LmlzSWRlbnRpY2FsVG8odXNlclNldCk7XG4gICAgaWYgKGlkZW50aWNhbCkge1xuICAgICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQUxMX1BBU1M7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgICAgdmFyIGxldmVsQ29tcGxldGUgPSAob3V0Y29tZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG4gICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuICAgICAgaWYgKHRhcmdldCAmJiB1c2VyLmV4cHJlc3Npb24gJiZcbiAgICAgICAgICB1c2VyLmV4cHJlc3Npb24uaXNFcXVpdmFsZW50VG8odGFyZ2V0LmV4cHJlc3Npb24pKSB7XG4gICAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgICAgb3V0Y29tZS5tZXNzYWdlID0gY2FsY01zZy5lcXVpdmFsZW50RXhwcmVzc2lvbigpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS5cbiAqL1xuQ2FsYy5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIENhbGMuZ2VuZXJhdGVSZXN1bHRzXygpO1xuXG4gIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gIHZhciB0ZXh0QmxvY2tzID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAnY2FsYycsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBhcHBTdGF0ZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyxcbiAgICB0ZXN0UmVzdWx0OiBhcHBTdGF0ZS50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgb25Db21wbGV0ZTogb25SZXBvcnRDb21wbGV0ZVxuICB9O1xuXG4gIGFwcFN0YXRlLndhaXRpbmdGb3JSZXBvcnQgPSB0cnVlO1xuICBzdHVkaW9BcHAucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oYXBwU3RhdGUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MgPyAnd2luJyA6ICdmYWlsdXJlJyk7XG5cbiAgLy8gRGlzcGxheSBmZWVkYmFjayBpbW1lZGlhdGVseVxuICBpZiAoaXNQcmVBbmltYXRpb25GYWlsdXJlKGFwcFN0YXRlLnRlc3RSZXN1bHRzKSkge1xuICAgIHJldHVybiBkaXNwbGF5RmVlZGJhY2soKTtcbiAgfVxuXG4gIGFwcFN0YXRlLmFuaW1hdGluZyA9IHRydWU7XG4gIGlmIChhcHBTdGF0ZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyAmJlxuICAgICAgYXBwU3RhdGUudXNlclNldC5pc0FuaW1hdGFibGUoKSAmJlxuICAgICAgIWxldmVsLmVkaXRfYmxvY2tzKSB7XG4gICAgQ2FsYy5zdGVwKDApO1xuICB9IGVsc2Uge1xuICAgIGRpc3BsYXlDb21wbGV4VXNlckV4cHJlc3Npb25zKCk7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzdG9wQW5pbWF0aW5nQW5kRGlzcGxheUZlZWRiYWNrKCk7XG4gICAgfSwgc3RlcFNwZWVkKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gaXNQcmVBbmltYXRpb25GYWlsdXJlKHRlc3RSZXN1bHQpIHtcbiAgcmV0dXJuIHRlc3RSZXN1bHQgPT09IFRlc3RSZXN1bHRzLlFVRVNUSU9OX01BUktTX0lOX05VTUJFUl9GSUVMRCB8fFxuICAgIHRlc3RSZXN1bHQgPT09IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OQUxfQkxPQ0sgfHxcbiAgICB0ZXN0UmVzdWx0ID09PSBUZXN0UmVzdWx0cy5FWFRSQV9UT1BfQkxPQ0tTX0ZBSUwgfHxcbiAgICB0ZXN0UmVzdWx0ID09PSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRCB8fFxuICAgIHRlc3RSZXN1bHQgPT09IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OX05BTUU7XG59XG5cbi8qKlxuICogRmlsbCBhcHBTdGF0ZSB3aXRoIHRoZSByZXN1bHRzIG9mIHByb2dyYW0gZXhlY3V0aW9uLlxuICogQHN0YXRpY1xuICovXG5DYWxjLmdlbmVyYXRlUmVzdWx0c18gPSBmdW5jdGlvbiAoKSB7XG4gIGFwcFN0YXRlLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgLy8gQ2hlY2sgZm9yIHByZS1leGVjdXRpb24gZXJyb3JzXG4gIGlmIChzdHVkaW9BcHAuaGFzRXh0cmFUb3BCbG9ja3MoKSkge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYVFJBX1RPUF9CTE9DS1NfRkFJTDtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3R1ZGlvQXBwLmhhc1VuZmlsbGVkRnVuY3Rpb25hbEJsb2NrKCkpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTkFMX0JMT0NLO1xuICAgIGFwcFN0YXRlLm1lc3NhZ2UgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsQmxvY2tFcnJvcignZnVuY3Rpb25hbF9jb21wdXRlJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNRdWVzdGlvbk1hcmtzSW5OdW1iZXJGaWVsZCgpKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuUVVFU1RJT05fTUFSS1NfSU5fTlVNQkVSX0ZJRUxEO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzdHVkaW9BcHAuaGFzRW1wdHlGdW5jdGlvbk9yVmFyaWFibGVOYW1lKCkpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTl9OQU1FO1xuICAgIGFwcFN0YXRlLm1lc3NhZ2UgPSBjb21tb25Nc2cudW5uYW1lZEZ1bmN0aW9uKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXBwU3RhdGUudXNlclNldCA9IG5ldyBFcXVhdGlvblNldChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpKTtcbiAgYXBwU3RhdGUuZmFpbGVkSW5wdXQgPSBudWxsO1xuXG4gIC8vIE5vdGU6IFRoaXMgd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciBmcmVlIHBsYXksIHNvIHlvdSBjYW4gXCJmYWlsXCIgYSBmcmVlXG4gIC8vIHBsYXkgbGV2ZWwgd2l0aCBhIGRpdmlkZSBieSB6ZXJvIGVycm9yLlxuICAvLyBBbHNvIHdvcnRoIG5vdGluZywgd2UgbWlnaHQgc3RpbGwgZW5kIHVwIGdldHRpbmcgYSBkaXYgemVybyBsYXRlciB3aGVuXG4gIC8vIHdlIHN0YXJ0IHZhcnlpbmcgaW5wdXRzIGluIGV2YWx1YXRlUmVzdWx0c19cbiAgaWYgKGFwcFN0YXRlLnVzZXJTZXQuaGFzRGl2WmVybygpKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgYXBwU3RhdGUubWVzc2FnZSA9IGNhbGNNc2cuZGl2aWRlQnlaZXJvRXJyb3IoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAobGV2ZWwuZnJlZVBsYXkgfHwgbGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH0gZWxzZSB7XG4gICAgYXBwU3RhdGUgPSAkLmV4dGVuZChhcHBTdGF0ZSwgQ2FsYy5jaGVja0V4YW1wbGVzXygpKTtcblxuICAgIGlmIChhcHBTdGF0ZS5yZXN1bHQgPT09IG51bGwpIHtcbiAgICAgIGFwcFN0YXRlID0gJC5leHRlbmQoYXBwU3RhdGUsXG4gICAgICAgIENhbGMuZXZhbHVhdGVSZXN1bHRzXyhhcHBTdGF0ZS50YXJnZXRTZXQsIGFwcFN0YXRlLnVzZXJTZXQpKTtcbiAgICB9XG4gIH1cblxuICAvLyBPdmVycmlkZSBkZWZhdWx0IG1lc3NhZ2UgZm9yIExFVkVMX0lOQ09NUExFVEVfRkFJTFxuICBpZiAoYXBwU3RhdGUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTCAmJlxuICAgICAgIWFwcFN0YXRlLm1lc3NhZ2UpIHtcbiAgICBhcHBTdGF0ZS5tZXNzYWdlID0gY2FsY01zZy5sZXZlbEluY29tcGxldGVFcnJvcigpO1xuICB9XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtPYmplY3R9IHNldCBvZiBhcHBTdGF0ZSB0byBiZSBtZXJnZWQgYnkgY2FsbGVyXG4gKi9cbkNhbGMuY2hlY2tFeGFtcGxlc18gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXRjb21lID0ge307XG4gIGlmICghbGV2ZWwuZXhhbXBsZXNSZXF1aXJlZCkge1xuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG5cbiAgdmFyIGV4YW1wbGVsZXNzID0gc3R1ZGlvQXBwLmdldEZ1bmN0aW9uV2l0aG91dFR3b0V4YW1wbGVzKCk7XG4gIGlmIChleGFtcGxlbGVzcykge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcbiAgICBvdXRjb21lLm1lc3NhZ2UgPSBjb21tb25Nc2cuZW1wdHlFeGFtcGxlQmxvY2tFcnJvck1zZyh7ZnVuY3Rpb25OYW1lOiBleGFtcGxlbGVzc30pO1xuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG5cbiAgdmFyIHVuZmlsbGVkID0gc3R1ZGlvQXBwLmdldFVuZmlsbGVkRnVuY3Rpb25hbEV4YW1wbGUoKTtcbiAgaWYgKHVuZmlsbGVkKSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuXG4gICAgdmFyIG5hbWUgPSB1bmZpbGxlZC5nZXRSb290QmxvY2soKS5nZXRJbnB1dFRhcmdldEJsb2NrKCdBQ1RVQUwnKVxuICAgICAgLmdldFRpdGxlVmFsdWUoJ05BTUUnKTtcbiAgICBvdXRjb21lLm1lc3NhZ2UgPSBjb21tb25Nc2cuZW1wdHlFeGFtcGxlQmxvY2tFcnJvck1zZyh7ZnVuY3Rpb25OYW1lOiBuYW1lfSk7XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cblxuICB2YXIgZmFpbGluZ0Jsb2NrTmFtZSA9IHN0dWRpb0FwcC5jaGVja0ZvckZhaWxpbmdFeGFtcGxlcyhnZXRDYWxjRXhhbXBsZUZhaWx1cmUpO1xuICBpZiAoZmFpbGluZ0Jsb2NrTmFtZSkge1xuICAgIG91dGNvbWUucmVzdWx0ID0gZmFsc2U7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuICAgIG91dGNvbWUubWVzc2FnZSA9IGNvbW1vbk1zZy5leGFtcGxlRXJyb3JNZXNzYWdlKHtmdW5jdGlvbk5hbWU6IGZhaWxpbmdCbG9ja05hbWV9KTtcbiAgfVxuXG4gIHJldHVybiBvdXRjb21lO1xufTtcblxuLyoqXG4gKiBJZiB3ZSBoYXZlIGFueSBmdW5jdGlvbnMgb3IgdmFyaWFibGVzIGluIG91ciBleHByZXNzaW9uIHNldCwgd2UgZG9uJ3Qgc3VwcG9ydFxuICogYW5pbWF0aW5nIGV2YWx1YXRpb24uXG4gKi9cbmZ1bmN0aW9uIGRpc3BsYXlDb21wbGV4VXNlckV4cHJlc3Npb25zKCkge1xuICB2YXIgcmVzdWx0O1xuICBjbGVhclN2Z0V4cHJlc3Npb24oJ3VzZXJFeHByZXNzaW9uJyk7XG5cbiAgLy8gQ2xvbmUgdXNlclNldCwgYXMgd2UgbWlnaHQgbWFrZSBzbWFsbCBjaGFuZ2VzIHRvIHRoZW0gKGkuZS4gaWYgd2UgbmVlZCB0b1xuICAvLyB2YXJ5IHZhcmlhYmxlcylcbiAgdmFyIHVzZXJTZXQgPSBhcHBTdGF0ZS51c2VyU2V0LmNsb25lKCk7XG4gIHZhciB0YXJnZXRTZXQgPSBhcHBTdGF0ZS50YXJnZXRTZXQ7XG5cbiAgdmFyIGNvbXB1dGVFcXVhdGlvbiA9IHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIGlmIChjb21wdXRlRXF1YXRpb24gPT09IG51bGwgfHwgY29tcHV0ZUVxdWF0aW9uLmV4cHJlc3Npb24gPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBnZXQgdGhlIHRva2VucyBmb3Igb3VyIHVzZXIgZXF1YXRpb25zXG4gIHZhciBuZXh0Um93ID0gZGlzcGxheU5vbkNvbXB1dGVFcXVhdGlvbnNfKHVzZXJTZXQsIHRhcmdldFNldCk7XG5cbiAgaWYgKHVzZXJTZXQuY29tcHV0ZXNTaW5nbGVDb25zdGFudCgpKSB7XG4gICAgLy8gSW4gdGhpcyBjYXNlIHRoZSBjb21wdXRlIGVxdWF0aW9uICsgZXZhbHVhdGlvbiB3aWxsIGJlIGV4YWN0bHkgdGhlIHNhbWVcbiAgICAvLyBhcyB3aGF0IHdlJ3ZlIGFscmVhZHkgc2hvd24sIHNvIGRvbid0IHNob3cgaXQuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gTm93IGRpc3BsYXkgb3VyIGNvbXB1dGUgZXF1YXRpb24gYW5kIHRoZSByZXN1bHQgb2YgZXZhbHVhdGluZyBpdFxuICB2YXIgdGFyZ2V0RXF1YXRpb24gPSB0YXJnZXRTZXQgJiYgdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuXG4gIC8vIFdlJ3JlIGVpdGhlciBhIHZhcmlhYmxlIG9yIGEgZnVuY3Rpb24gY2FsbC4gR2VuZXJhdGUgYSB0b2tlbkxpc3QgKHNpbmNlXG4gIC8vIHdlIGNvdWxkIGFjdHVhbGx5IGJlIGRpZmZlcmVudCB0aGFuIHRoZSBnb2FsKVxuICB2YXIgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGNvbXB1dGVFcXVhdGlvbiwgdGFyZ2V0RXF1YXRpb24pO1xuICBpZiAodXNlclNldC5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpIHx8XG4gICAgICBjb21wdXRlRXF1YXRpb24uZXhwcmVzc2lvbi5kZXB0aCgpID4gMCkge1xuICAgIHRva2VuTGlzdCA9IHRva2VuTGlzdC5jb25jYXQodG9rZW5MaXN0Rm9yRXZhbHVhdGlvbl8odXNlclNldCwgdGFyZ2V0U2V0KSk7XG4gIH1cblxuICBkaXNwbGF5RXF1YXRpb24oJ3VzZXJFeHByZXNzaW9uJywgbnVsbCwgdG9rZW5MaXN0LCBuZXh0Um93KyssICdlcnJvclRva2VuJyk7XG5cbiAgdG9rZW5MaXN0ID0gdG9rZW5MaXN0Rm9yRmFpbGVkRnVuY3Rpb25JbnB1dF8odXNlclNldCwgdGFyZ2V0U2V0KTtcbiAgaWYgKHRva2VuTGlzdCAmJiB0b2tlbkxpc3QubGVuZ3RoKSB7XG4gICAgZGlzcGxheUVxdWF0aW9uKCd1c2VyRXhwcmVzc2lvbicsIG51bGwsIHRva2VuTGlzdCwgbmV4dFJvdysrLCAnZXJyb3JUb2tlbicpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGxheSBlcXVhdGlvbnMgb3RoZXIgdGhhbiBvdXIgY29tcHV0ZSBlcXVhdGlvbi5cbiAqIE5vdGU6IEluIG9uZSBjYXNlIChzaW5nbGUgdmFyaWFibGUgY29tcHV0ZSwgZmFpbGVkIGlucHV0KSB3ZSBhbHNvIG1vZGlmeVxuICogb3VyIHVzZXJTZXQgaGVyZVxuICogQHJldHVybnMge251bWJlcn0gSG93IG1hbnkgcm93cyB3ZSBkaXNwbGF5IGVxdWF0aW9ucyBvbi5cbiAqL1xuZnVuY3Rpb24gZGlzcGxheU5vbkNvbXB1dGVFcXVhdGlvbnNfKHVzZXJTZXQsIHRhcmdldFNldCkge1xuICAvLyBpbiBzaW5nbGUgZnVuY3Rpb24vdmFyaWFibGUgbW9kZSwgd2UncmUgb25seSBnb2luZyB0byBoaWdobGlnaHQgdGhlIGRpZmZlcmVuY2VzXG4gIC8vIGluIHRoZSBldmFsdWF0ZWQgcmVzdWx0XG4gIHZhciBoaWdobGlnaHRBbGxFcnJvcnMgPSAhdGFyZ2V0U2V0LmNvbXB1dGVzRnVuY3Rpb25DYWxsKCkgJiZcbiAgICAhdGFyZ2V0U2V0LmNvbXB1dGVzU2luZ2xlVmFyaWFibGUoKTtcblxuICBpZiAodGFyZ2V0U2V0LmNvbXB1dGVzU2luZ2xlVmFyaWFibGUoKSAmJiBhcHBTdGF0ZS5mYWlsZWRJbnB1dCAhPT0gbnVsbCkge1xuICAgIHZhciB1c2VyQ29uc3RhbnRzID0gdXNlclNldC5nZXRDb25zdGFudHMoKTtcbiAgICB2YXIgdGFyZ2V0Q29uc3RhbnRzID0gdGFyZ2V0U2V0LmdldENvbnN0YW50cygpO1xuICAgIC8vIHJlcGxhY2UgY29uc3RhbnRzIHdpdGggZmFpbGVkIGlucHV0cyBpbiB0aGUgdXNlciBzZXQuXG4gICAgdGFyZ2V0Q29uc3RhbnRzLmZvckVhY2goZnVuY3Rpb24gKHRhcmdldEVxdWF0aW9uLCBpbmRleCkge1xuICAgICAgdmFyIG5hbWUgPSB0YXJnZXRFcXVhdGlvbi5uYW1lO1xuICAgICAgdmFyIHVzZXJFcXVhdGlvbiA9IHVzZXJTZXQuZ2V0RXF1YXRpb24obmFtZSk7XG4gICAgICB1c2VyRXF1YXRpb24uZXhwcmVzc2lvbi5zZXRWYWx1ZShhcHBTdGF0ZS5mYWlsZWRJbnB1dFtpbmRleF0pO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIG51bVJvd3MgPSAwO1xuICB2YXIgdG9rZW5MaXN0O1xuICB1c2VyU2V0LnNvcnRlZEVxdWF0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKHVzZXJFcXVhdGlvbikge1xuICAgIHZhciBleHBlY3RlZEVxdWF0aW9uID0gaGlnaGxpZ2h0QWxsRXJyb3JzID9cbiAgICAgIHRhcmdldFNldC5nZXRFcXVhdGlvbih1c2VyRXF1YXRpb24ubmFtZSkgOiBudWxsO1xuXG4gICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KHVzZXJFcXVhdGlvbiwgZXhwZWN0ZWRFcXVhdGlvbik7XG5cbiAgICBkaXNwbGF5RXF1YXRpb24oJ3VzZXJFeHByZXNzaW9uJywgdXNlckVxdWF0aW9uLnNpZ25hdHVyZSwgdG9rZW5MaXN0LCBudW1Sb3dzKyssXG4gICAgICAnZXJyb3JUb2tlbicpO1xuICB9KTtcblxuICByZXR1cm4gbnVtUm93cztcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7VG9rZW5bXX0gdG9rZW4gbGlzdCBjb21wYXJpbmcgdGhlIGV2bHVhdGlvbiBvZiB0aGUgdXNlciBhbmQgdGFyZ2V0XG4gKiAgIHNldHMuIEluY2x1ZGVzIGVxdWFscyBzaWduLlxuICovXG5mdW5jdGlvbiB0b2tlbkxpc3RGb3JFdmFsdWF0aW9uXyh1c2VyU2V0LCB0YXJnZXRTZXQpIHtcbiAgdmFyIGV2YWx1YXRpb24gPSB1c2VyU2V0LmV2YWx1YXRlKCk7XG5cbiAgLy8gQ2hlY2sgZm9yIGRpdiB6ZXJvXG4gIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgIGlmIChldmFsdWF0aW9uLmVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yIHx8XG4gICAgICAgIHV0aWxzLmlzSW5maW5pdGVSZWN1cnNpb25FcnJvcihldmFsdWF0aW9uLmVycikpIHtcbiAgICAgIC8vIEV4cGVjdGVkIHR5cGUgb2YgZXJyb3IsIGRvIG5vdGhpbmcuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdVbmV4cGVjdGVkIGVycm9yOiAnICsgZXZhbHVhdGlvbi5lcnIpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG4gIHZhciBleHBlY3RlZFJlc3VsdCA9IHJlc3VsdDtcbiAgaWYgKHRhcmdldFNldC5jb21wdXRlc1NpbmdsZVZhcmlhYmxlKCkpIHtcbiAgICAvLyBJZiB3ZSBoYXZlIGEgZmFpbGVkIGlucHV0LCBtYWtlIHN1cmUgdGhlIHJlc3VsdCBnZXRzIG1hcmtlZFxuICAgIHJldHVybiBbXG4gICAgICBuZXcgVG9rZW4oJyA9ICcsIGZhbHNlKSxcbiAgICAgIG5ldyBUb2tlbihyZXN1bHQsIGFwcFN0YXRlLmZhaWxlZElucHV0KVxuICAgIF07XG4gIH0gZWxzZSBpZiAodGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpICE9PSBudWxsKSB7XG4gICAgZXhwZWN0ZWRSZXN1bHQgPSB0YXJnZXRTZXQuZXZhbHVhdGUoKS5yZXN1bHQ7XG4gIH1cblxuICAvLyBhZGQgYSB0b2tlbkxpc3QgZGlmZmluZyBvdXIgcmVzdWx0c1xuICByZXR1cm4gY29uc3RydWN0VG9rZW5MaXN0KCcgPSAnKS5jb25jYXQoXG4gICAgY29uc3RydWN0VG9rZW5MaXN0KHJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQpKTtcbn1cblxuLyoqXG4gKiBGb3IgY2FzZXMgd2hlcmUgd2UgaGF2ZSBhIHNpbmdsZSBmdW5jdGlvbiwgYW5kIGZhaWx1cmUgb2NjdXJlZCBvbmx5IGFmdGVyXG4gKiB3ZSB2YXJpZWQgdGhlIGlucHV0cywgd2Ugd2FudCB0byBkaXNwbGF5IGEgZmluYWwgbGluZSB0aGF0IHNob3dzIHRoZSB2YXJpZWRcbiAqIGlucHV0IGFuZCByZXN1bHQuIFRoaXMgbWV0aG9kIGdlbmVyYXRlcyB0aGF0IHRva2VuIGxpc3RcbiAqIEByZXR1cm5zIHtUb2tlbltdfVxuICovXG5mdW5jdGlvbiB0b2tlbkxpc3RGb3JGYWlsZWRGdW5jdGlvbklucHV0Xyh1c2VyU2V0LCB0YXJnZXRTZXQpIHtcbiAgaWYgKGFwcFN0YXRlLmZhaWxlZElucHV0ID09PSBudWxsIHx8ICF0YXJnZXRTZXQuY29tcHV0ZXNGdW5jdGlvbkNhbGwoKSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBjb21wdXRlRXF1YXRpb24gPSB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICB2YXIgZXhwcmVzc2lvbiA9IGNvbXB1dGVFcXVhdGlvbi5leHByZXNzaW9uLmNsb25lKCk7XG4gIGZvciAodmFyIGMgPSAwOyBjIDwgZXhwcmVzc2lvbi5udW1DaGlsZHJlbigpOyBjKyspIHtcbiAgICBleHByZXNzaW9uLnNldENoaWxkVmFsdWUoYywgYXBwU3RhdGUuZmFpbGVkSW5wdXRbY10pO1xuICB9XG4gIHZhciBldmFsdWF0aW9uID0gdXNlclNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICBpZiAoZXZhbHVhdGlvbi5lcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvcikge1xuICAgICAgZXZhbHVhdGlvbi5yZXN1bHQgPSAnJzsgLy8gcmVzdWx0IHdpbGwgbm90IGJlIHVzZWQgaW4gdGhpcyBjYXNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGV2YWx1YXRpb24uZXJyO1xuICAgIH1cbiAgfVxuICB2YXIgcmVzdWx0ID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG5cbiAgcmV0dXJuIGNvbnN0cnVjdFRva2VuTGlzdChleHByZXNzaW9uKVxuICAgIC5jb25jYXQobmV3IFRva2VuKCcgPSAnLCBmYWxzZSkpXG4gICAgLmNvbmNhdChuZXcgVG9rZW4ocmVzdWx0LCB0cnVlKSk7IC8vIHRoaXMgc2hvdWxkIGFsd2F5cyBiZSBtYXJrZWRcbn1cblxuZnVuY3Rpb24gc3RvcEFuaW1hdGluZ0FuZERpc3BsYXlGZWVkYmFjaygpIHtcbiAgYXBwU3RhdGUuYW5pbWF0aW5nID0gZmFsc2U7XG4gIGRpc3BsYXlGZWVkYmFjaygpO1xufVxuXG4vKipcbiAqIFBlcmZvcm0gYSBzdGVwIGluIG91ciBleHByZXNzaW9uIGV2YWx1YXRpb24gYW5pbWF0aW9uLiBUaGlzIGNvbnNpc3RzIG9mXG4gKiBjb2xsYXBzaW5nIHRoZSBuZXh0IG5vZGUgaW4gb3VyIHRyZWUuIElmIHRoYXQgbm9kZSBmYWlsZWQgZXhwZWN0YXRpb25zLCB3ZVxuICogd2lsbCBzdG9wIGZ1cnRoZXIgZXZhbHVhdGlvbi5cbiAqL1xuQ2FsYy5zdGVwID0gZnVuY3Rpb24gKGFuaW1hdGlvbkRlcHRoKSB7XG4gIHZhciBpc0ZpbmFsID0gYW5pbWF0ZVVzZXJFeHByZXNzaW9uKGFuaW1hdGlvbkRlcHRoKTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGlzRmluYWwpIHtcbiAgICAgIC8vIG9uZSBkZWVwZXIgdG8gcmVtb3ZlIGhpZ2hsaWdodGluZ1xuICAgICAgYW5pbWF0ZVVzZXJFeHByZXNzaW9uKGFuaW1hdGlvbkRlcHRoICsgMSk7XG4gICAgICBzdG9wQW5pbWF0aW5nQW5kRGlzcGxheUZlZWRiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIENhbGMuc3RlcChhbmltYXRpb25EZXB0aCArIDEpO1xuICAgIH1cbiAgfSwgc3RlcFNwZWVkKTtcbn07XG5cbi8qKlxuICogR2V0cyByaWQgb2YgYWxsIHRoZSBjaGlsZHJlbiBmcm9tIHRoZSBzdmcgb2YgdGhlIGdpdmVuIGlkXG4gKiBAcGFyYW0ge2lkfSBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gY2xlYXJTdmdFeHByZXNzaW9uKGlkKSB7XG4gIHZhciBnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICBpZiAoIWcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB3aGlsZSAoZy5sYXN0Q2hpbGQpIHtcbiAgICBnLnJlbW92ZUNoaWxkKGcubGFzdENoaWxkKTtcbiAgfVxufVxuXG4vKipcbiAqIERyYXdzIGEgdXNlciBleHByZXNzaW9uIGFuZCBlYWNoIHN0ZXAgY29sbGFwc2luZyBpdCwgdXAgdG8gZ2l2ZW4gZGVwdGguXG4gKiBAcmV0dXJucyBUcnVlIGlmIGl0IGNvdWxkbid0IGNvbGxhcHNlIGFueSBmdXJ0aGVyIGF0IHRoaXMgZGVwdGguXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGVVc2VyRXhwcmVzc2lvbiAobWF4TnVtU3RlcHMpIHtcbiAgdmFyIHVzZXJFcXVhdGlvbiA9IGFwcFN0YXRlLnVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIGlmICghdXNlckVxdWF0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXF1aXJlIHVzZXIgZXhwcmVzc2lvbicpO1xuICB9XG4gIHZhciB1c2VyRXhwcmVzc2lvbiA9IHVzZXJFcXVhdGlvbi5leHByZXNzaW9uO1xuICBpZiAoIXVzZXJFeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgZmluaXNoZWQgPSBmYWxzZTtcblxuICBpZiAoYXBwU3RhdGUudXNlclNldC5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpIHx8XG4gICAgYXBwU3RhdGUudGFyZ2V0U2V0Lmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBhbmltYXRlIGlmIGVpdGhlciB1c2VyL3RhcmdldCBoYXZlIGZ1bmN0aW9ucy92YXJzXCIpO1xuICB9XG5cbiAgY2xlYXJTdmdFeHByZXNzaW9uKCd1c2VyRXhwcmVzc2lvbicpO1xuXG4gIHZhciBjdXJyZW50ID0gdXNlckV4cHJlc3Npb24uY2xvbmUoKTtcbiAgdmFyIHByZXZpb3VzRXhwcmVzc2lvbiA9IGN1cnJlbnQ7XG4gIHZhciBudW1Db2xsYXBzZXMgPSAwO1xuICAvLyBFYWNoIHN0ZXAgZHJhd3MgYSBzaW5nbGUgbGluZVxuICBmb3IgKHZhciBjdXJyZW50U3RlcCA9IDA7IGN1cnJlbnRTdGVwIDw9IG1heE51bVN0ZXBzICYmICFmaW5pc2hlZDsgY3VycmVudFN0ZXArKykge1xuICAgIHZhciB0b2tlbkxpc3Q7XG4gICAgaWYgKG51bUNvbGxhcHNlcyA9PT0gbWF4TnVtU3RlcHMpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgbGluZSBpbiB0aGUgY3VycmVudCBhbmltYXRpb24sIGhpZ2hsaWdodCB3aGF0IGhhc1xuICAgICAgLy8gY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBsaW5lXG4gICAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoY3VycmVudCwgcHJldmlvdXNFeHByZXNzaW9uKTtcbiAgICB9IGVsc2UgaWYgKG51bUNvbGxhcHNlcyArIDEgPT09IG1heE51bVN0ZXBzKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBzZWNvbmQgdG8gbGFzdCBsaW5lLiBIaWdobGlnaHQgdGhlIGJsb2NrIGJlaW5nIGNvbGxhcHNlZCxcbiAgICAgIC8vIGFuZCB0aGUgZGVlcGVzdCBvcGVyYXRpb24gKHRoYXQgd2lsbCBiZSBjb2xsYXBzZWQgb24gdGhlIG5leHQgbGluZSlcbiAgICAgIHZhciBkZWVwZXN0ID0gY3VycmVudC5nZXREZWVwZXN0T3BlcmF0aW9uKCk7XG4gICAgICBpZiAoZGVlcGVzdCkge1xuICAgICAgICBzdHVkaW9BcHAuaGlnaGxpZ2h0KCdibG9ja19pZF8nICsgZGVlcGVzdC5ibG9ja0lkKTtcbiAgICAgIH1cbiAgICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChjdXJyZW50LCBudWxsLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRG9uJ3QgaGlnaGxpZ2h0IGFueXRoaW5nXG4gICAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoY3VycmVudCk7XG4gICAgfVxuXG4gICAgLy8gRm9yIGxpbmVzIGFmdGVyIHRoZSBmaXJzdCBvbmUsIHdlIHdhbnQgdGhlbSBsZWZ0IGFsaWduZWQgYW5kIHByZWNlZWRlZFxuICAgIC8vIGJ5IGFuIGVxdWFscyBzaWduLlxuICAgIHZhciBsZWZ0QWxpZ24gPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFN0ZXAgPiAwKSB7XG4gICAgICBsZWZ0QWxpZ24gPSB0cnVlO1xuICAgICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KCc9ICcpLmNvbmNhdCh0b2tlbkxpc3QpO1xuICAgIH1cbiAgICBkaXNwbGF5RXF1YXRpb24oJ3VzZXJFeHByZXNzaW9uJywgbnVsbCwgdG9rZW5MaXN0LCBudW1Db2xsYXBzZXMsICdtYXJrZWRUb2tlbicsIGxlZnRBbGlnbik7XG4gICAgcHJldmlvdXNFeHByZXNzaW9uID0gY3VycmVudC5jbG9uZSgpO1xuICAgIGlmIChjdXJyZW50LmlzRGl2WmVybygpKSB7XG4gICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjdXJyZW50LmNvbGxhcHNlKCkpIHtcbiAgICAgIG51bUNvbGxhcHNlcysrO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudFN0ZXAgPT09IG51bUNvbGxhcHNlcyArIDEpIHtcbiAgICAgIC8vIGdvIG9uZSBwYXN0IG91ciBudW0gY29sbGFwc2VzIHNvIHRoYXQgdGhlIGxhc3QgbGluZSBnZXRzIGhpZ2hsaWdodGVkXG4gICAgICAvLyBvbiBpdHMgb3duXG4gICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZpbmlzaGVkO1xufVxuXG4vKipcbiAqIEFwcGVuZCBhIHRva2VuTGlzdCB0byB0aGUgZ2l2ZW4gcGFyZW50IGVsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRJZCBJZCBvZiBwYXJlbnQgZWxlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgZnVuY3Rpb24vdmFyaWFibGUuIE51bGwgaWYgYmFzZSBleHByZXNzaW9uLlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSB0b2tlbkxpc3QgQSBsaXN0IG9mIHRva2VucywgcmVwcmVzZW50aW5nIHRoZSBleHByZXNzaW9uXG4gKiBAcGFyYW0ge251bWJlcn0gbGluZSBIb3cgbWFueSBsaW5lcyBkZWVwIGludG8gcGFyZW50IHRvIGRpc3BsYXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBtYXJrQ2xhc3MgQ3NzIGNsYXNzIHRvIHVzZSBmb3IgJ21hcmtlZCcgdG9rZW5zLlxuICogQHBhcmFtIHtib29sZWFufSBsZWZ0QWxpZ24gSWYgdHJ1ZSwgZXF1YXRpb25zIGFyZSBsZWZ0IGFsaWduZWQgaW5zdGVhZCBvZlxuICogICBjZW50ZXJlZC5cbiAqL1xuZnVuY3Rpb24gZGlzcGxheUVxdWF0aW9uKHBhcmVudElkLCBuYW1lLCB0b2tlbkxpc3QsIGxpbmUsIG1hcmtDbGFzcywgbGVmdEFsaWduKSB7XG4gIHZhciBwYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJlbnRJZCk7XG5cbiAgdmFyIGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdnJyk7XG4gIHBhcmVudC5hcHBlbmRDaGlsZChnKTtcbiAgdmFyIHhQb3MgPSAwO1xuICB2YXIgbGVuO1xuICBpZiAobmFtZSkge1xuICAgIGxlbiA9IG5ldyBUb2tlbihuYW1lICsgJyA9ICcsIGZhbHNlKS5yZW5kZXJUb1BhcmVudChnLCB4UG9zLCBudWxsKTtcbiAgICB4UG9zICs9IGxlbjtcbiAgfVxuICB2YXIgZmlyc3RUb2tlbkxlbiA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5MaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgbGVuID0gdG9rZW5MaXN0W2ldLnJlbmRlclRvUGFyZW50KGcsIHhQb3MsIG1hcmtDbGFzcyk7XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGZpcnN0VG9rZW5MZW4gPSBsZW47XG4gICAgfVxuICAgIHhQb3MgKz0gbGVuO1xuICB9XG5cbiAgdmFyIHhQYWRkaW5nO1xuICBpZiAobGVmdEFsaWduKSB7XG4gICAgLy8gQWxpZ24gc2Vjb25kIHRva2VuIHdpdGggcGFyZW50IChhc3N1bXB0aW9uIGlzIHRoYXQgZmlyc3QgdG9rZW4gaXMgb3VyXG4gICAgLy8gZXF1YWwgc2lnbikuXG4gICAgdmFyIHRyYW5zZm9ybSA9IEJsb2NrbHkuZ2V0UmVsYXRpdmVYWShwYXJlbnQuY2hpbGROb2Rlc1swXSk7XG4gICAgeFBhZGRpbmcgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS54KSAtIGZpcnN0VG9rZW5MZW47XG4gIH0gZWxzZSB7XG4gICAgeFBhZGRpbmcgPSAoQ0FOVkFTX1dJRFRIIC0gZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCkgLyAyO1xuICB9XG4gIHZhciB5UG9zID0gKGxpbmUgKiBMSU5FX0hFSUdIVCk7XG4gIGcuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB4UGFkZGluZyArICcsICcgKyB5UG9zICsgJyknKTtcbn1cblxuLyoqXG4gKiBEZWVwIGNsb25lIGEgbm9kZSwgdGhlbiByZW1vdmluZyBhbnkgaWRzIGZyb20gdGhlIGNsb25lIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZVxuICogZHVwbGljYXRlZCBpZHMuXG4gKi9cbmZ1bmN0aW9uIGNsb25lTm9kZVdpdGhvdXRJZHMoZWxlbWVudElkKSB7XG4gIHZhciBjbG9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCkuY2xvbmVOb2RlKHRydWUpO1xuICBjbG9uZS5yZW1vdmVBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgdmFyIGRlc2NlbmRhbnRzID0gY2xvbmUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRlc2NlbmRhbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkZXNjZW5kYW50c1tpXTtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNsb25lO1xufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuZnVuY3Rpb24gZGlzcGxheUZlZWRiYWNrKCkge1xuICBpZiAoYXBwU3RhdGUud2FpdGluZ0ZvclJlcG9ydCB8fCBhcHBTdGF0ZS5hbmltYXRpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBvdmVycmlkZSBleHRyYSB0b3AgYmxvY2tzIG1lc3NhZ2VcbiAgbGV2ZWwuZXh0cmFUb3BCbG9ja3MgPSBjYWxjTXNnLmV4dHJhVG9wQmxvY2tzKCk7XG4gIHZhciBhcHBEaXYgPSBudWxsO1xuICAvLyBTaG93IHN2ZyBpbiBmZWVkYmFjayBkaWFsb2dcbiAgaWYgKCFpc1ByZUFuaW1hdGlvbkZhaWx1cmUoYXBwU3RhdGUudGVzdFJlc3VsdHMpKSB7XG4gICAgYXBwRGl2ID0gY2xvbmVOb2RlV2l0aG91dElkcygnc3ZnQ2FsYycpO1xuICAgIGFwcERpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3N2Z0NhbGNGZWVkYmFjaycpO1xuICB9XG4gIHZhciBvcHRpb25zID0ge1xuICAgIGFwcDogJ2NhbGMnLFxuICAgIHNraW46IHNraW4uaWQsXG4gICAgcmVzcG9uc2U6IGFwcFN0YXRlLnJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICBmZWVkYmFja1R5cGU6IGFwcFN0YXRlLnRlc3RSZXN1bHRzLFxuICAgIHRyeUFnYWluVGV4dDogbGV2ZWwuZnJlZVBsYXkgPyBjb21tb25Nc2cua2VlcFBsYXlpbmcoKSA6IHVuZGVmaW5lZCxcbiAgICBjb250aW51ZVRleHQ6IGxldmVsLmZyZWVQbGF5ID8gY29tbW9uTXNnLm5leHRQdXp6bGUoKSA6IHVuZGVmaW5lZCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBjYWxjTXNnLnJlaW5mRmVlZGJhY2tNc2coKVxuICAgIH0sXG4gICAgYXBwRGl2OiBhcHBEaXZcbiAgfTtcbiAgaWYgKGFwcFN0YXRlLm1lc3NhZ2UgJiYgIWxldmVsLmVkaXRfYmxvY2tzKSB7XG4gICAgb3B0aW9ucy5tZXNzYWdlID0gYXBwU3RhdGUubWVzc2FnZTtcbiAgfVxuXG4gIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sob3B0aW9ucyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbmZ1bmN0aW9uIG9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpIHtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIGFwcFN0YXRlLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGFwcFN0YXRlLndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgc3R1ZGlvQXBwLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn1cblxuLyogc3RhcnQtdGVzdC1ibG9jayAqL1xuLy8gZXhwb3J0IHByaXZhdGUgZnVuY3Rpb24ocykgdG8gZXhwb3NlIHRvIHVuaXQgdGVzdGluZ1xuQ2FsYy5fX3Rlc3Rvbmx5X18gPSB7XG4gIGRpc3BsYXlHb2FsOiBkaXNwbGF5R29hbCxcbiAgZGlzcGxheUNvbXBsZXhVc2VyRXhwcmVzc2lvbnM6IGRpc3BsYXlDb21wbGV4VXNlckV4cHJlc3Npb25zLFxuICBhcHBTdGF0ZTogYXBwU3RhdGVcbn07XG4vKiBlbmQtdGVzdC1ibG9jayAqL1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTsgOyBidWYucHVzaCgnXFxuXFxuPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnQ2FsY1wiPlxcbiAgPGltYWdlIGlkPVwiYmFja2dyb3VuZFwiIGhlaWdodD1cIjQwMFwiIHdpZHRoPVwiNDAwXCIgeD1cIjBcIiB5PVwiMFwiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHhsaW5rOmhyZWY9XCIvYmxvY2tseS9tZWRpYS9za2lucy9jYWxjL2JhY2tncm91bmQucG5nXCI+PC9pbWFnZT5cXG4gIDxnIGlkPVwidXNlckV4cHJlc3Npb25cIiBjbGFzcz1cImV4cHJcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMCwgMTAwKVwiPlxcbiAgPC9nPlxcbiAgPGcgaWQ9XCJhbnN3ZXJFeHByZXNzaW9uXCIgY2xhc3M9XCJleHByXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDAsIDM1MClcIj5cXG4gIDwvZz5cXG48L3N2Zz5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBsZXZlbC1zcGVjaWZpYyByZXF1aXJlbWVudHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnZXhhbXBsZTEnOiB7XG4gICAgc29sdXRpb25CbG9ja3M6IGJsb2NrVXRpbHMuY2FsY0Jsb2NrWG1sKCdmdW5jdGlvbmFsX3RpbWVzJywgW1xuICAgICAgYmxvY2tVdGlscy5jYWxjQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfcGx1cycsIFsxLCAyXSksXG4gICAgICBibG9ja1V0aWxzLmNhbGNCbG9ja1htbCgnZnVuY3Rpb25hbF9wbHVzJywgWzMsIDRdKVxuICAgIF0pLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3BsdXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX21pbnVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90aW1lcycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfZGl2aWRlZGJ5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9tYXRoX251bWJlcicpICtcbiAgICAgICc8YmxvY2sgdHlwZT1cImZ1bmN0aW9uYWxfbWF0aF9udW1iZXJfZHJvcGRvd25cIj4nICtcbiAgICAgICcgIDx0aXRsZSBuYW1lPVwiTlVNXCIgY29uZmlnPVwiMCwxLDIsMyw0LDUsNiw3LDgsOSwxMFwiPj8/PzwvdGl0bGU+JyArXG4gICAgICAnPC9ibG9jaz4nXG4gICAgICApLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICByZXF1aXJlZEJsb2NrczogJycsXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG5cbiAgJ2N1c3RvbSc6IHtcbiAgICBhbnN3ZXI6ICcnLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiAnJyxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgcmVxdWlyZWRCbG9ja3M6ICcnLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9XG59O1xuIiwiLyoqXG4gKiBHaXZlbiBhIHNldCBvZiB2YWx1ZXMgKGkuZS4gWzEsMiwzXSwgYW5kIGEgbnVtYmVyIG9mIHBhcmFtZXRlcnMsIGdlbmVyYXRlc1xuICogYWxsIHBvc3NpYmxlIGNvbWJpbmF0aW9ucyBvZiB2YWx1ZXMuXG4gKi9cbnZhciBJbnB1dEl0ZXJhdG9yID0gZnVuY3Rpb24gKHZhbHVlcywgbnVtUGFyYW1zKSB7XG4gIHRoaXMubnVtUGFyYW1zXyA9IG51bVBhcmFtcztcbiAgdGhpcy5yZW1haW5pbmdfID0gTWF0aC5wb3codmFsdWVzLmxlbmd0aCwgbnVtUGFyYW1zKTtcbiAgdGhpcy5hdmFpbGFibGVWYWx1ZXNfID0gdmFsdWVzO1xuICAvLyByZXByZXNlbnRzIHRoZSBpbmRleCBpbnRvIHZhbHVlcyBmb3IgZWFjaCBwYXJhbSBmb3IgdGhlIGN1cnJlbnQgcGVybXV0YXRpb25cbiAgLy8gc2V0IG91ciBmaXJzdCBpbmRleCB0byAtMSBzbyB0aGF0IGl0IHdpbGwgZ2V0IGluY3JlbWVudGVkIHRvIDAgb24gdGhlIGZpcnN0XG4gIC8vIHBhc3NcbiAgdGhpcy5pbmRpY2VzXyA9IFstMV07XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgbnVtUGFyYW1zOyBpKyspIHtcbiAgICB0aGlzLmluZGljZXNfW2ldID0gMDtcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gSW5wdXRJdGVyYXRvcjtcblxuLyoqXG4gKiBHZXQgdGhlIG5leHQgc2V0IG9mIHZhbHVlcywgdGhyb3dpbmcgaWYgbm9uZSByZW1haW5nXG4gKiBAcmV0dXJucyB7bnVtYmVyW119IExpc3Qgb2YgbGVuZ3RoIG51bVBhcmFtcyByZXByZXNlbnRpbmcgdGhlIG5leHQgc2V0IG9mXG4gKiAgIGlucHV0cy5cbiAqL1xuSW5wdXRJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucmVtYWluaW5nXyA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZW1wdHknKTtcbiAgfVxuXG4gIHZhciB3cmFwcGVkO1xuICB2YXIgcGFyYW1OdW0gPSAwO1xuICBkbyB7XG4gICAgd3JhcHBlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5kaWNlc19bcGFyYW1OdW1dKys7XG4gICAgaWYgKHRoaXMuaW5kaWNlc19bcGFyYW1OdW1dID09PSB0aGlzLmF2YWlsYWJsZVZhbHVlc18ubGVuZ3RoKSB7XG4gICAgICB0aGlzLmluZGljZXNfW3BhcmFtTnVtXSA9IDA7XG4gICAgICBwYXJhbU51bSsrO1xuICAgICAgd3JhcHBlZCA9IHRydWU7XG4gICAgfVxuICB9IHdoaWxlKHdyYXBwZWQgJiYgcGFyYW1OdW0gPCB0aGlzLm51bVBhcmFtc18pO1xuICB0aGlzLnJlbWFpbmluZ18tLTtcblxuICByZXR1cm4gdGhpcy5pbmRpY2VzXy5tYXAoZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuYXZhaWxhYmxlVmFsdWVzX1tpbmRleF07XG4gIH0sIHRoaXMpO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyBIb3cgbWFueSBwZXJtdXRhdGlvbnMgYXJlIGxlZnRcbiAqL1xuSW5wdXRJdGVyYXRvci5wcm90b3R5cGUucmVtYWluaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5yZW1haW5pbmdfO1xufTtcbiIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5nZXRMb2Rhc2goKTtcbnZhciBFeHByZXNzaW9uTm9kZSA9IHJlcXVpcmUoJy4vZXhwcmVzc2lvbk5vZGUnKTtcbnZhciBFcXVhdGlvbiA9IHJlcXVpcmUoJy4vZXF1YXRpb24nKTtcbnZhciBqc251bXMgPSByZXF1aXJlKCcuL2pzLW51bWJlcnMvanMtbnVtYmVycycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBBbiBFcXVhdGlvblNldCBjb25zaXN0cyBvZiBhIHRvcCBsZXZlbCAoY29tcHV0ZSkgZXF1YXRpb24sIGFuZCBvcHRpb25hbGx5XG4gKiBzb21lIG51bWJlciBvZiBzdXBwb3J0IGVxdWF0aW9uc1xuICogQHBhcmFtIHshQXJyYXl9IGJsb2NrcyBMaXN0IG9mIGJsb2NrbHkgYmxvY2tzXG4gKi9cbnZhciBFcXVhdGlvblNldCA9IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgdGhpcy5jb21wdXRlXyA9IG51bGw7IC8vIGFuIEVxdWF0aW9uXG4gIHRoaXMuZXF1YXRpb25zXyA9IFtdOyAvLyBhIGxpc3Qgb2YgRXF1YXRpb25zXG5cbiAgaWYgKGJsb2Nrcykge1xuICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChibG9jaykge1xuICAgICAgdmFyIGVxdWF0aW9uID0gRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soYmxvY2spO1xuICAgICAgaWYgKGVxdWF0aW9uKSB7XG4gICAgICAgIHRoaXMuYWRkRXF1YXRpb25fKGVxdWF0aW9uKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gRXF1YXRpb25TZXQ7XG5cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNsb25lID0gbmV3IEVxdWF0aW9uU2V0KCk7XG4gIGNsb25lLmNvbXB1dGVfID0gbnVsbDtcbiAgaWYgKHRoaXMuY29tcHV0ZV8pIHtcbiAgICBjbG9uZS5jb21wdXRlXyA9IHRoaXMuY29tcHV0ZV8uY2xvbmUoKTtcbiAgfVxuICBjbG9uZS5lcXVhdGlvbnNfID0gdGhpcy5lcXVhdGlvbnNfLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gIH0pO1xuICByZXR1cm4gY2xvbmU7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gZXF1YXRpb24gdG8gb3VyIHNldC4gSWYgZXF1YXRpb24ncyBuYW1lIGlzIG51bGwsIHNldHMgaXQgYXMgdGhlXG4gKiBjb21wdXRlIGVxdWF0aW9uLiBUaHJvd3MgaWYgZXF1YXRpb24gb2YgdGhpcyBuYW1lIGFscmVhZHkgZXhpc3RzLlxuICogQHBhcmFtIHtFcXVhdGlvbn0gZXF1YXRpb24gVGhlIGVxdWF0aW9uIHRvIGFkZC5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmFkZEVxdWF0aW9uXyA9IGZ1bmN0aW9uIChlcXVhdGlvbikge1xuICBpZiAoIWVxdWF0aW9uLm5hbWUpIHtcbiAgICBpZiAodGhpcy5jb21wdXRlXykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb21wdXRlIGV4cHJlc3Npb24gYWxyZWFkeSBleGlzdHMnKTtcbiAgICB9XG4gICAgdGhpcy5jb21wdXRlXyA9IGVxdWF0aW9uO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLmdldEVxdWF0aW9uKGVxdWF0aW9uLm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2VxdWF0aW9uIGFscmVhZHkgZXhpc3RzOiAnICsgZXF1YXRpb24ubmFtZSk7XG4gICAgfVxuICAgIHRoaXMuZXF1YXRpb25zXy5wdXNoKGVxdWF0aW9uKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXQgYW4gZXF1YXRpb24gYnkgbmFtZSwgb3IgY29tcHV0ZSBlcXVhdGlvbiBpZiBuYW1lIGlzIG51bGxcbiAqIEByZXR1cm5zIHtFcXVhdGlvbn0gRXF1YXRpb24gb2YgdGhhdCBuYW1lIGlmIGl0IGV4aXN0cywgbnVsbCBvdGhlcndpc2UuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5nZXRFcXVhdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIGlmIChuYW1lID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGhpcy5lcXVhdGlvbnNfW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWF0aW9uc19baV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB0aGUgY29tcHV0ZSBlcXVhdGlvbiBpZiB0aGVyZSBpcyBvbmVcbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmNvbXB1dGVFcXVhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY29tcHV0ZV87XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHRydWUgaWYgRXF1YXRpb25TZXQgaGFzIGF0IGxlYXN0IG9uZSB2YXJpYWJsZSBvciBmdW5jdGlvbi5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5lcXVhdGlvbnNfLmxlbmd0aCA+IDA7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIG91ciBjb21wdXRlIGV4cHJlc3Npb24gaXMganN1dCBhIGZ1bmNpdG9uIGNhbGxcbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmNvbXB1dGVzRnVuY3Rpb25DYWxsID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY29tcHV0ZV8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY29tcHV0ZUV4cHJlc3Npb24gPSB0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb247XG4gIHJldHVybiBjb21wdXRlRXhwcmVzc2lvbi5pc0Z1bmN0aW9uQ2FsbCgpO1xufTtcblxuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIG91ciBjb21wdXRlIGV4cHJlc3Npb24gaXMganVzdCBhIHZhcmlhYmxlLCB3aGljaFxuICogd2UgdGFrZSB0byBtZWFuIHdlIGNhbiB0cmVhdCBzaW1pbGFybHkgdG8gb3VyIHNpbmdsZSBmdW5jdGlvbiBzY2VuYXJpb1xuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBjb21wdXRlRXhwcmVzc2lvbiA9IHRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbjtcbiAgcmV0dXJuIGNvbXB1dGVFeHByZXNzaW9uLmlzVmFyaWFibGUoKTtcbn07XG5cbi8qKlxuICogRXhhbXBsZSBzZXQgdGhhdCByZXR1cm5zIHRydWU6XG4gKiBBZ2UgPSAxMlxuICogY29tcHV0ZTogQWdlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBvdXIgRXF1YXRpb25TZXQgY29uc2lzdHMgb2YgYSB2YXJpYWJsZSBzZXQgdG9cbiAqICAgYSBudW1iZXIsIGFuZCB0aGUgY29tcHV0YXRpb24gb2YgdGhhdCB2YXJpYWJsZS5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmNvbXB1dGVzU2luZ2xlQ29uc3RhbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wdXRlXyB8fCB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBlcXVhdGlvbiA9IHRoaXMuZXF1YXRpb25zX1swXTtcbiAgdmFyIGNvbXB1dGVFeHByZXNzaW9uID0gdGhpcy5jb21wdXRlXy5leHByZXNzaW9uO1xuICByZXR1cm4gY29tcHV0ZUV4cHJlc3Npb24uaXNWYXJpYWJsZSgpICYmIGVxdWF0aW9uLmV4cHJlc3Npb24uaXNOdW1iZXIoKSAmJlxuICAgIGNvbXB1dGVFeHByZXNzaW9uLmdldFZhbHVlKCkgPT09IGVxdWF0aW9uLm5hbWU7XG5cbn07XG5cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5pc0FuaW1hdGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wdXRlXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodGhpcy5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb24uZGVwdGgoKSA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBlcXVhdGlvbnMgdGhhdCBjb25zaXN0IG9mIHNldHRpbmcgYSB2YXJpYWJsZSB0byBhIGNvbnN0YW50XG4gKiB2YWx1ZSwgd2l0aG91dCBkb2luZyBhbnkgYWRkaXRpb25hbCBtYXRoLiBpLmUuIGZvbyA9IDFcbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmdldENvbnN0YW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZXF1YXRpb25zXy5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5wYXJhbXMubGVuZ3RoID09PSAwICYmIGl0ZW0uZXhwcmVzc2lvbi5pc051bWJlcigpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQXJlIHR3byBFcXVhdGlvblNldHMgaWRlbnRpY2FsPyBUaGlzIGlzIGNvbnNpZGVyZWQgdG8gYmUgdHJ1ZSBpZiB0aGVpclxuICogY29tcHV0ZSBleHByZXNzaW9ucyBhcmUgaWRlbnRpY2FsIGFuZCBhbGwgb2YgdGhlaXIgZXF1YXRpb25zIGhhdmUgdGhlIHNhbWVcbiAqIG5hbWVzIGFuZCBpZGVudGljYWwgZXhwcmVzc2lvbnMuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5pc0lkZW50aWNhbFRvID0gZnVuY3Rpb24gKG90aGVyU2V0KSB7XG4gIGlmICh0aGlzLmVxdWF0aW9uc18ubGVuZ3RoICE9PSBvdGhlclNldC5lcXVhdGlvbnNfLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBvdGhlckNvbXB1dGUgPSBvdGhlclNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uO1xuICBpZiAoIXRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbi5pc0lkZW50aWNhbFRvKG90aGVyQ29tcHV0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXF1YXRpb25zXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0aGlzRXF1YXRpb24gPSB0aGlzLmVxdWF0aW9uc19baV07XG4gICAgdmFyIG90aGVyRXF1YXRpb24gPSBvdGhlclNldC5nZXRFcXVhdGlvbih0aGlzRXF1YXRpb24ubmFtZSk7XG4gICAgaWYgKCFvdGhlckVxdWF0aW9uIHx8XG4gICAgICAgICF0aGlzRXF1YXRpb24uZXhwcmVzc2lvbi5pc0lkZW50aWNhbFRvKG90aGVyRXF1YXRpb24uZXhwcmVzc2lvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQXJlIHR3byBFcXVhdGlvblNldHMgZXF1aXZhbGVudD8gVGhpcyBpcyBjb25zaWRlcmVkIHRvIGJlIHRydWUgaWYgdGhlaXJcbiAqIGNvbXB1dGUgZXhwcmVzc2lvbiBhcmUgZXF1aXZhbGVudCBhbmQgYWxsIG9mIHRoZWlyIGVxdWF0aW9ucyBoYXZlIHRoZSBzYW1lXG4gKiBuYW1lcyBhbmQgZXF1aXZhbGVudCBleHByZXNzaW9ucy4gRXF1aXZhbGVuY2UgaXMgYSBsZXNzIHN0cmljdCByZXF1aXJlbWVudFxuICogdGhhbiBpZGVudGljYWwgdGhhdCBhbGxvd3MgcGFyYW1zIHRvIGJlIHJlb3JkZXJlZC5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmlzRXF1aXZhbGVudFRvID0gZnVuY3Rpb24gKG90aGVyU2V0KSB7XG4gIGlmICh0aGlzLmVxdWF0aW9uc18ubGVuZ3RoICE9PSBvdGhlclNldC5lcXVhdGlvbnNfLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBvdGhlckNvbXB1dGUgPSBvdGhlclNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uO1xuICBpZiAoIXRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbi5pc0VxdWl2YWxlbnRUbyhvdGhlckNvbXB1dGUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdGhpc0VxdWF0aW9uID0gdGhpcy5lcXVhdGlvbnNfW2ldO1xuICAgIHZhciBvdGhlckVxdWF0aW9uID0gb3RoZXJTZXQuZ2V0RXF1YXRpb24odGhpc0VxdWF0aW9uLm5hbWUpO1xuICAgIGlmICghb3RoZXJFcXVhdGlvbiB8fFxuICAgICAgICAhdGhpc0VxdWF0aW9uLmV4cHJlc3Npb24uaXNFcXVpdmFsZW50VG8ob3RoZXJFcXVhdGlvbi5leHByZXNzaW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiB0aGUgbm9uLWNvbXB1dGUgZXF1YXRpb25zICh2YXJzL2Z1bmN0aW9ucykgc29ydGVkIGJ5IG5hbWUuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5zb3J0ZWRFcXVhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIG5vdGU6IHRoaXMgaGFzIHNpZGUgZWZmZWN0cywgYXMgaXQgcmVvcmRlcnMgZXF1YXRpb25zLiB3ZSBjb3VsZCBhbHNvXG4gIC8vIGVuc3VyZSB0aGlzIHdhcyBkb25lIG9ubHkgb25jZSBpZiB3ZSBoYWQgcGVyZm9ybWFuY2UgY29uY2VybnNcbiAgdGhpcy5lcXVhdGlvbnNfLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuZXF1YXRpb25zXztcbn07XG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgZXZhbHVhdGluZyBvdXIgRXF1YXRpb25TZXQgd291bGQgcmVzdWx0IGluXG4gKiAgIGRpdmlkaW5nIGJ5IHplcm8uXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5oYXNEaXZaZXJvID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZXZhbHVhdGlvbiA9IHRoaXMuZXZhbHVhdGUoKTtcbiAgcmV0dXJuIGV2YWx1YXRpb24uZXJyICYmXG4gICAgZXZhbHVhdGlvbi5lcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvcjtcbn07XG5cbi8qKlxuICogRXZhbHVhdGUgdGhlIEVxdWF0aW9uU2V0J3MgY29tcHV0ZSBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIGl0cyBlcXVhdGlvbnNcbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKHRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbik7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSBnaXZlbiBjb21wdXRlIGV4cHJlc3Npb24gaW4gdGhlIGNvbnRleHQgb2YgdGhlIEVxdWF0aW9uU2V0J3NcbiAqIGVxdWF0aW9ucy4gRm9yIGV4YW1wbGUsIG91ciBlcXVhdGlvbiBzZXQgbWlnaHQgZGVmaW5lIGYoeCkgPSB4ICsgMSwgYW5kIHRoaXNcbiAqIGFsbG93cyB1cyB0byBldmFsdWF0ZSB0aGUgZXhwcmVzc2lvbiBmKDEpIG9yIGYoMikuLi5cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV9IGNvbXB1dGVFeHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBldmFsdWF0aW9uIEFuIG9iamVjdCB3aXRoIGVpdGhlciBhbiBlcnIgb3IgcmVzdWx0IGZpZWxkXG4gKiBAcmV0dXJucyB7RXJyb3I/fSBldmFsdWF0aW9uLmVyclxuICogQHJldHVybnMge051bWJlcj99IGV2YWx1YXRpb24ucmVzdWx0XG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uID0gZnVuY3Rpb24gKGNvbXB1dGVFeHByZXNzaW9uKSB7XG4gIC8vIG5vIHZhcmlhYmxlcy9mdW5jdGlvbnMuIHRoaXMgaXMgZWFzeVxuICBpZiAodGhpcy5lcXVhdGlvbnNfLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjb21wdXRlRXhwcmVzc2lvbi5ldmFsdWF0ZSgpO1xuICB9XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIG91ciBlcXVhdGlvbnMgdG8gZ2VuZXJhdGUgb3VyIG1hcHBpbmcuIFdlIG1heSBuZWVkIHRvIGRvXG4gIC8vIHRoaXMgYSBmZXcgdGltZXMuIFN0b3AgdHJ5aW5nIGFzIHNvb24gYXMgd2UgZG8gYSBmdWxsIGl0ZXJhdGlvbiB3aXRob3V0XG4gIC8vIGFkZGluZyBhbnl0aGluZyBuZXcgdG8gb3VyIG1hcHBpbmcuXG4gIHZhciBtYXBwaW5nID0ge307XG4gIHZhciBtYWRlUHJvZ3Jlc3M7XG4gIHZhciB0ZXN0TWFwcGluZztcbiAgdmFyIGV2YWx1YXRpb247XG4gIHZhciBzZXRUZXN0TWFwcGluZ1RvT25lID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB0ZXN0TWFwcGluZ1tpdGVtXSA9IGpzbnVtcy5tYWtlRmxvYXQoMSk7XG4gIH07XG4gIGRvIHtcbiAgICBtYWRlUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXF1YXRpb25zXy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGVxdWF0aW9uID0gdGhpcy5lcXVhdGlvbnNfW2ldO1xuICAgICAgaWYgKGVxdWF0aW9uLmlzRnVuY3Rpb24oKSkge1xuICAgICAgICBpZiAobWFwcGluZ1tlcXVhdGlvbi5uYW1lXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNlZSBpZiB3ZSBjYW4gbWFwIGlmIHdlIHJlcGxhY2Ugb3VyIHBhcmFtc1xuICAgICAgICAvLyBub3RlIHRoYXQgcGFyYW1zIG92ZXJyaWRlIGV4aXN0aW5nIHZhcnMgaW4gb3VyIHRlc3RNYXBwaW5nXG4gICAgICAgIHRlc3RNYXBwaW5nID0gXy5jbG9uZShtYXBwaW5nKTtcbiAgICAgICAgdGVzdE1hcHBpbmdbZXF1YXRpb24ubmFtZV0gPSB7XG4gICAgICAgICAgdmFyaWFibGVzOiBlcXVhdGlvbi5wYXJhbXMsXG4gICAgICAgICAgZXhwcmVzc2lvbjogZXF1YXRpb24uZXhwcmVzc2lvblxuICAgICAgICB9O1xuICAgICAgICBlcXVhdGlvbi5wYXJhbXMuZm9yRWFjaChzZXRUZXN0TWFwcGluZ1RvT25lKTtcbiAgICAgICAgZXZhbHVhdGlvbiA9IGVxdWF0aW9uLmV4cHJlc3Npb24uZXZhbHVhdGUodGVzdE1hcHBpbmcpO1xuICAgICAgICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgICAgICBpZiAoZXZhbHVhdGlvbi5lcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvciB8fFxuICAgICAgICAgICAgICB1dGlscy5pc0luZmluaXRlUmVjdXJzaW9uRXJyb3IoZXZhbHVhdGlvbi5lcnIpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBlcnI6IGV2YWx1YXRpb24uZXJyIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgaGF2ZSBhIHZhbGlkIG1hcHBpbmdcbiAgICAgICAgbWFkZVByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgbWFwcGluZ1tlcXVhdGlvbi5uYW1lXSA9IHtcbiAgICAgICAgICB2YXJpYWJsZXM6IGVxdWF0aW9uLnBhcmFtcyxcbiAgICAgICAgICBleHByZXNzaW9uOiBlcXVhdGlvbi5leHByZXNzaW9uXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKG1hcHBpbmdbZXF1YXRpb24ubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBldmFsdWF0aW9uID0gZXF1YXRpb24uZXhwcmVzc2lvbi5ldmFsdWF0ZShtYXBwaW5nKTtcbiAgICAgICAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgICAgICAgaWYgKGV2YWx1YXRpb24uZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7IGVycjogZXZhbHVhdGlvbi5lcnIgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd2UgaGF2ZSBhIHZhcmlhYmxlIHRoYXQgaGFzbid0IHlldCBiZWVuIG1hcHBlZCBhbmQgY2FuIGJlXG4gICAgICAgICAgbWFkZVByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICBtYXBwaW5nW2VxdWF0aW9uLm5hbWVdID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfSB3aGlsZSAobWFkZVByb2dyZXNzKTtcblxuICByZXR1cm4gY29tcHV0ZUV4cHJlc3Npb24uZXZhbHVhdGUobWFwcGluZyk7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgQmxvY2tseSBibG9jaywgZ2VuZXJhdGVzIGFuIEVxdWF0aW9uLlxuICovXG5FcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayA9IGZ1bmN0aW9uIChibG9jaykge1xuICB2YXIgbmFtZTtcbiAgaWYgKCFibG9jaykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBmaXJzdENoaWxkID0gYmxvY2suZ2V0Q2hpbGRyZW4oKVswXTtcbiAgc3dpdGNoIChibG9jay50eXBlKSB7XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9jb21wdXRlJzpcbiAgICAgIGlmICghZmlyc3RDaGlsZCkge1xuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhmaXJzdENoaWxkKTtcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfcGx1cyc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9taW51cyc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF90aW1lcyc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9kaXZpZGVkYnknOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfcG93JzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX3NxcnQnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfc3F1YXJlZCc6XG4gICAgICB2YXIgb3BlcmF0aW9uID0gYmxvY2suZ2V0VGl0bGVzKClbMF0uZ2V0VmFsdWUoKTtcbiAgICAgIC8vIHNvbWUgb2YgdGhlc2UgaGF2ZSAxIGFyZywgb3RoZXJzIDJcbiAgICAgIHZhciBhcmdOYW1lcyA9IFsnQVJHMSddO1xuICAgICAgaWYgKGJsb2NrLmdldElucHV0KCdBUkcyJykpIHtcbiAgICAgICAgYXJnTmFtZXMucHVzaCgnQVJHMicpO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBhcmdOYW1lcy5tYXAoZnVuY3Rpb24oaW5wdXROYW1lKSB7XG4gICAgICAgIHZhciBhcmdCbG9jayA9IGJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soaW5wdXROYW1lKTtcbiAgICAgICAgaWYgKCFhcmdCbG9jaykge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhhcmdCbG9jaykuZXhwcmVzc2lvbjtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLCBuZXcgRXhwcmVzc2lvbk5vZGUob3BlcmF0aW9uLCBhcmdzLCBibG9jay5pZCkpO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9tYXRoX251bWJlcic6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9tYXRoX251bWJlcl9kcm9wZG93bic6XG4gICAgICB2YXIgdmFsID0gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTlVNJykgfHwgMDtcbiAgICAgIGlmICh2YWwgPT09ICc/Pz8nKSB7XG4gICAgICAgIHZhbCA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLFxuICAgICAgICBuZXcgRXhwcmVzc2lvbk5vZGUocGFyc2VGbG9hdCh2YWwpLCBbXSwgYmxvY2suaWQpKTtcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfY2FsbCc6XG4gICAgICBuYW1lID0gYmxvY2suZ2V0Q2FsbE5hbWUoKTtcbiAgICAgIHZhciBkZWYgPSBCbG9ja2x5LlByb2NlZHVyZXMuZ2V0RGVmaW5pdGlvbihuYW1lLCBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICAgIGlmIChkZWYuaXNWYXJpYWJsZSgpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sIG5ldyBFeHByZXNzaW9uTm9kZShuYW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVzID0gW107XG4gICAgICAgIHZhciBpbnB1dCwgY2hpbGRCbG9jaztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7ICEhKGlucHV0ID0gYmxvY2suZ2V0SW5wdXQoJ0FSRycgKyBpKSk7IGkrKykge1xuICAgICAgICAgIGNoaWxkQmxvY2sgPSBpbnB1dC5jb25uZWN0aW9uLnRhcmdldEJsb2NrKCk7XG4gICAgICAgICAgdmFsdWVzLnB1c2goY2hpbGRCbG9jayA/XG4gICAgICAgICAgICBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhjaGlsZEJsb2NrKS5leHByZXNzaW9uIDpcbiAgICAgICAgICAgIG5ldyBFeHByZXNzaW9uTm9kZSgwKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSwgbmV3IEV4cHJlc3Npb25Ob2RlKG5hbWUsIHZhbHVlcykpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX2RlZmluaXRpb24nOlxuICAgICAgbmFtZSA9IGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKTtcblxuICAgICAgdmFyIGV4cHJlc3Npb24gPSBmaXJzdENoaWxkID9cbiAgICAgICAgRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soZmlyc3RDaGlsZCkuZXhwcmVzc2lvbiA6XG4gICAgICAgIG5ldyBFeHByZXNzaW9uTm9kZSgwKTtcblxuICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihuYW1lLCBibG9jay5nZXRWYXJzKCksIGV4cHJlc3Npb24pO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9wYXJhbWV0ZXJzX2dldCc6XG4gICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLCBuZXcgRXhwcmVzc2lvbk5vZGUoYmxvY2suZ2V0VGl0bGVWYWx1ZSgnVkFSJykpKTtcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfZXhhbXBsZSc6XG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBcIlVua25vd24gYmxvY2sgdHlwZTogXCIgKyBibG9jay50eXBlO1xuICB9XG59O1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgVG9rZW4gPSByZXF1aXJlKCcuL3Rva2VuJyk7XG52YXIganNudW1zID0gcmVxdWlyZSgnLi9qcy1udW1iZXJzL2pzLW51bWJlcnMnKTtcblxudmFyIFZhbHVlVHlwZSA9IHtcbiAgQVJJVEhNRVRJQzogMSxcbiAgRlVOQ1RJT05fQ0FMTDogMixcbiAgVkFSSUFCTEU6IDMsXG4gIE5VTUJFUjogNCxcbiAgRVhQT05FTlRJQUw6IDVcbn07XG5cbmZ1bmN0aW9uIERpdmlkZUJ5WmVyb0Vycm9yKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnJztcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBudW1iZXJzIHRvIGpzbnVtYmVyIHJlcHJlc2VudGF0aW9ucy4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBzb21lXG4gKiBqc251bWJlciBtZXRob2RzIHdpbGwgcmV0dXJuIGEgbnVtYmVyIG9yIGpzbnVtYmVyIGRlcGVuZGluZyBvbiB0aGVpciB2YWx1ZXMsXG4gKiBmb3IgZXhhbXBsZTpcbiAqIGpzbnVtcy5zcXJ0KGpzbnVtcy5tYWtlRmxvYXQoNCkudG9FeGFjdCgpKSA9IDRcbiAqIGpzbnVtcy5zcXJ0KGpzbnVtcy5tYWtlRmxvYXQoNSkudG9FeGFjdCgpKSA9IGpzbnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcnxqc251bWJlcn0gdmFsXG4gKiBAcmV0dXJucyB7anNudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGVuc3VyZUpzbnVtKHZhbCkge1xuICBpZiAodHlwZW9mKHZhbCkgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGpzbnVtcy5tYWtlRmxvYXQodmFsKTtcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIEEgbm9kZSBjb25zaXN0aW5nIG9mIGFuIHZhbHVlLCBhbmQgcG90ZW50aWFsbHkgYSBzZXQgb2Ygb3BlcmFuZHMuXG4gKiBUaGUgdmFsdWUgd2lsbCBiZSBlaXRoZXIgYW4gb3BlcmF0b3IsIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhIHZhcmlhYmxlLCBhXG4gKiBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZnVuY3Rpb25hbCBjYWxsLCBvciBhIG51bWJlci5cbiAqIElmIGFyZ3MgYXJlIG5vdCBFeHByZXNzaW9uTm9kZSwgd2UgY29udmVydCB0aGVtIHRvIGJlIHNvLCBhc3N1bWluZyBhbnkgc3RyaW5nXG4gKiByZXByZXNlbnRzIGEgdmFyaWFibGVcbiAqL1xudmFyIEV4cHJlc3Npb25Ob2RlID0gZnVuY3Rpb24gKHZhbCwgYXJncywgYmxvY2tJZCkge1xuICB0aGlzLnZhbHVlXyA9IGVuc3VyZUpzbnVtKHZhbCk7XG5cbiAgdGhpcy5ibG9ja0lkXyA9IGJsb2NrSWQ7XG4gIGlmIChhcmdzID09PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzID0gW107XG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBhcnJheVwiKTtcbiAgfVxuXG4gIHRoaXMuY2hpbGRyZW5fID0gYXJncy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICBpZiAoIShpdGVtIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUpKSB7XG4gICAgICBpdGVtID0gbmV3IEV4cHJlc3Npb25Ob2RlKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbiAgfSk7XG5cbiAgaWYgKHRoaXMuaXNOdW1iZXIoKSAmJiBhcmdzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBoYXZlIGFyZ3MgZm9yIG51bWJlciBFeHByZXNzaW9uTm9kZVwiKTtcbiAgfVxuXG4gIGlmICh0aGlzLmlzQXJpdGhtZXRpYygpICYmIGFyZ3MubGVuZ3RoICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQXJpdGhtZXRpYyBFeHByZXNzaW9uTm9kZSBuZWVkcyAyIGFyZ3NcIik7XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IEV4cHJlc3Npb25Ob2RlO1xuRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IgPSBEaXZpZGVCeVplcm9FcnJvcjtcblxuLyoqXG4gKiBXaGF0IHR5cGUgb2YgZXhwcmVzc2lvbiBub2RlIGlzIHRoaXM/XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXRUeXBlXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKFtcIitcIiwgXCItXCIsIFwiKlwiLCBcIi9cIl0uaW5kZXhPZih0aGlzLnZhbHVlXykgIT09IC0xKSB7XG4gICAgcmV0dXJuIFZhbHVlVHlwZS5BUklUSE1FVElDO1xuICB9XG5cbiAgaWYgKFtcInBvd1wiLCBcInNxcnRcIiwgXCJzcXJcIl0uaW5kZXhPZih0aGlzLnZhbHVlXykgIT09IC0xKSB7XG4gICAgcmV0dXJuIFZhbHVlVHlwZS5FWFBPTkVOVElBTDtcbiAgfVxuXG4gIGlmICh0eXBlb2YodGhpcy52YWx1ZV8pID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBWYWx1ZVR5cGUuVkFSSUFCTEU7XG4gICAgfVxuICAgIHJldHVybiBWYWx1ZVR5cGUuRlVOQ1RJT05fQ0FMTDtcbiAgfVxuXG4gIGlmIChqc251bXMuaXNTY2hlbWVOdW1iZXIodGhpcy52YWx1ZV8pKSB7XG4gICAgcmV0dXJuIFZhbHVlVHlwZS5OVU1CRVI7XG4gIH1cbn07XG5cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0FyaXRobWV0aWMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFR5cGVfKCkgPT09IFZhbHVlVHlwZS5BUklUSE1FVElDO1xufTtcblxuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzRnVuY3Rpb25DYWxsID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRUeXBlXygpID09PSBWYWx1ZVR5cGUuRlVOQ1RJT05fQ0FMTDtcbn07XG5cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc1ZhcmlhYmxlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRUeXBlXygpID09PSBWYWx1ZVR5cGUuVkFSSUFCTEU7XG59O1xuXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFR5cGVfKCkgPT09IFZhbHVlVHlwZS5OVU1CRVI7XG59O1xuXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNFeHBvbmVudGlhbCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0VHlwZV8oKSA9PT0gVmFsdWVUeXBlLkVYUE9ORU5USUFMO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcm9vdCBleHByZXNzaW9uIG5vZGUgaXMgYSBkaXZpZGUgYnkgemVyby4gRG9lc1xuICogICBub3QgYWNjb3VudCBmb3IgZGl2IHplcm9zIGluIGRlc2NlbmRhbnRzXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0Rpdlplcm8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByaWdodENoaWxkID0gdGhpcy5nZXRDaGlsZFZhbHVlKDEpO1xuICByZXR1cm4gdGhpcy5nZXRWYWx1ZSgpID09PSAnLycgJiYganNudW1zLmlzU2NoZW1lTnVtYmVyKHJpZ2h0Q2hpbGQpICYmXG4gICAganNudW1zLmVxdWFscyhyaWdodENoaWxkLCAwKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVlcCBjbG9uZSBvZiB0aGlzIG5vZGVcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuXy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICB9KTtcbiAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9kZSh0aGlzLnZhbHVlXywgY2hpbGRyZW4sIHRoaXMuYmxvY2tJZF8pO1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgZXhwcmVzc2lvbiwgcmV0dXJuaW5nIHRoZSByZXN1bHQuXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsIG51bWJlcnxvYmplY3Q+fSBnbG9iYWxNYXBwaW5nIEdsb2JhbCBtYXBwaW5nIG9mXG4gKiAgIHZhcmlhYmxlcyBhbmQgZnVuY3Rpb25zXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsIG51bWJlcnxvYmplY3Q+fSBsb2NhbE1hcHBpbmcgTWFwcGluZyBvZlxuICogICB2YXJpYWJsZXMvZnVuY3Rpb25zIGxvY2FsIHRvIHNjb3BlIG9mIHRoaXMgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBldmFsdWF0aW9uIEFuIG9iamVjdCB3aXRoIGVpdGhlciBhbiBlcnIgb3IgcmVzdWx0IGZpZWxkXG4gKiBAcmV0dXJucyB7RXJyb3I/fSBldmFsYXR1aW9uLmVyclxuICogQHJldHVybnMge2pzbnVtYmVyP30gZXZhbHVhdGlvbi5yZXN1bHRcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmV2YWx1YXRlID0gZnVuY3Rpb24gKGdsb2JhbE1hcHBpbmcsIGxvY2FsTWFwcGluZykge1xuICB2YXIgZXJyb3I7XG4gIHRyeSB7XG4gICAgZ2xvYmFsTWFwcGluZyA9IGdsb2JhbE1hcHBpbmcgfHwge307XG4gICAgbG9jYWxNYXBwaW5nID0gbG9jYWxNYXBwaW5nIHx8IHt9O1xuXG4gICAgdmFyIHR5cGUgPSB0aGlzLmdldFR5cGVfKCk7XG4gICAgLy8gQHR5cGUge251bWJlcnxqc251bWJlcn1cbiAgICB2YXIgdmFsO1xuXG4gICAgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5WQVJJQUJMRSkge1xuICAgICAgdmFyIG1hcHBlZFZhbCA9IHV0aWxzLnZhbHVlT3IobG9jYWxNYXBwaW5nW3RoaXMudmFsdWVfXSxcbiAgICAgICAgZ2xvYmFsTWFwcGluZ1t0aGlzLnZhbHVlX10pO1xuICAgICAgaWYgKG1hcHBlZFZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gbWFwcGluZyBmb3IgdmFyaWFibGUgZHVyaW5nIGV2YWx1YXRpb24nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNsb25lID0gdGhpcy5jbG9uZSgpO1xuICAgICAgY2xvbmUuc2V0VmFsdWUobWFwcGVkVmFsKTtcbiAgICAgIHJldHVybiBjbG9uZS5ldmFsdWF0ZShnbG9iYWxNYXBwaW5nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkZVTkNUSU9OX0NBTEwpIHtcbiAgICAgIHZhciBmdW5jdGlvbkRlZiA9IHV0aWxzLnZhbHVlT3IobG9jYWxNYXBwaW5nW3RoaXMudmFsdWVfXSxcbiAgICAgICAgZ2xvYmFsTWFwcGluZ1t0aGlzLnZhbHVlX10pO1xuICAgICAgaWYgKGZ1bmN0aW9uRGVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBtYXBwaW5nIGZvciBmdW5jdGlvbiBkdXJpbmcgZXZhbHVhdGlvbicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWZ1bmN0aW9uRGVmLnZhcmlhYmxlcyB8fCAhZnVuY3Rpb25EZWYuZXhwcmVzc2lvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBtYXBwaW5nIGZvcjogJyArIHRoaXMudmFsdWVfKTtcbiAgICAgIH1cbiAgICAgIGlmIChmdW5jdGlvbkRlZi52YXJpYWJsZXMubGVuZ3RoICE9PSB0aGlzLmNoaWxkcmVuXy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgbWFwcGluZyBmb3I6ICcgKyB0aGlzLnZhbHVlXyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlJ3JlIGNhbGxpbmcgYSBuZXcgZnVuY3Rpb24sIHNvIGl0IGdldHMgYSBuZXcgbG9jYWwgc2NvcGUuXG4gICAgICB2YXIgbmV3TG9jYWxNYXBwaW5nID0ge307XG4gICAgICBmdW5jdGlvbkRlZi52YXJpYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAodmFyaWFibGUsIGluZGV4KSB7XG4gICAgICAgIHZhciBldmFsdWF0aW9uID0gdGhpcy5jaGlsZHJlbl9baW5kZXhdLmV2YWx1YXRlKGdsb2JhbE1hcHBpbmcsIGxvY2FsTWFwcGluZyk7XG4gICAgICAgIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgICAgICAgIHRocm93IGV2YWx1YXRpb24uZXJyO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaGlsZFZhbCA9IGV2YWx1YXRpb24ucmVzdWx0O1xuICAgICAgICBuZXdMb2NhbE1hcHBpbmdbdmFyaWFibGVdID0gdXRpbHMudmFsdWVPcihsb2NhbE1hcHBpbmdbY2hpbGRWYWxdLCBjaGlsZFZhbCk7XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbkRlZi5leHByZXNzaW9uLmV2YWx1YXRlKGdsb2JhbE1hcHBpbmcsIG5ld0xvY2FsTWFwcGluZyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5OVU1CRVIpIHtcbiAgICAgIHJldHVybiB7IHJlc3VsdDogdGhpcy52YWx1ZV8gfTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSAhPT0gVmFsdWVUeXBlLkFSSVRITUVUSUMgJiYgdHlwZSAhPT0gVmFsdWVUeXBlLkVYUE9ORU5USUFMKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQnKTtcbiAgICB9XG5cbiAgICB2YXIgbGVmdCA9IHRoaXMuY2hpbGRyZW5fWzBdLmV2YWx1YXRlKGdsb2JhbE1hcHBpbmcsIGxvY2FsTWFwcGluZyk7XG4gICAgaWYgKGxlZnQuZXJyKSB7XG4gICAgICB0aHJvdyBsZWZ0LmVycjtcbiAgICB9XG4gICAgbGVmdCA9IGxlZnQucmVzdWx0LnRvRXhhY3QoKTtcblxuICAgIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHN3aXRjaCAodGhpcy52YWx1ZV8pIHtcbiAgICAgICAgY2FzZSAnc3FydCc6XG4gICAgICAgICAgdmFsID0ganNudW1zLnNxcnQobGVmdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Nxcic6XG4gICAgICAgICAgdmFsID0ganNudW1zLnNxcihsZWZ0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3BlcmF0b3I6ICcgKyB0aGlzLnZhbHVlXyk7XG4gICAgICB9XG4gICAgICByZXR1cm4geyByZXN1bHQ6IGVuc3VyZUpzbnVtKHZhbCkgfTtcbiAgICB9XG5cbiAgICB2YXIgcmlnaHQgPSB0aGlzLmNoaWxkcmVuX1sxXS5ldmFsdWF0ZShnbG9iYWxNYXBwaW5nLCBsb2NhbE1hcHBpbmcpO1xuICAgIGlmIChyaWdodC5lcnIpIHtcbiAgICAgIHRocm93IHJpZ2h0LmVycjtcbiAgICB9XG4gICAgcmlnaHQgPSByaWdodC5yZXN1bHQudG9FeGFjdCgpO1xuXG4gICAgc3dpdGNoICh0aGlzLnZhbHVlXykge1xuICAgICAgY2FzZSAnKyc6XG4gICAgICAgIHZhbCA9IGpzbnVtcy5hZGQobGVmdCwgcmlnaHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy0nOlxuICAgICAgICB2YWwgPSBqc251bXMuc3VidHJhY3QobGVmdCwgcmlnaHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyonOlxuICAgICAgICB2YWwgPSBqc251bXMubXVsdGlwbHkobGVmdCwgcmlnaHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICBpZiAoanNudW1zLmVxdWFscyhyaWdodCwgMCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRGl2aWRlQnlaZXJvRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICB2YWwgPSBqc251bXMuZGl2aWRlKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwb3cnOlxuICAgICAgICB2YWwgPSBqc251bXMuZXhwdChsZWZ0LCByaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9wZXJhdG9yOiAnICsgdGhpcy52YWx1ZV8pO1xuICAgIH1cbiAgICAvLyBXaGVuIGNhbGxpbmcganNudW1zIG1ldGhvZHMsIHRoZXkgd2lsbCBzb21ldGltZXMgcmV0dXJuIGEganNudW1iZXIgYW5kXG4gICAgLy8gc29tZXRpbWVzIGEgbmF0aXZlIEphdmFTY3JpcHQgbnVtYmVyLiBXZSB3YW50IHRvIG1ha2Ugc3VyZSB0byBjb252ZXJ0XG4gICAgLy8gdG8gYSBqc251bWJlciBiZWZvcmUgd2UgcmV0dXJuLlxuICAgIHJldHVybiB7IHJlc3VsdDogZW5zdXJlSnNudW0odmFsKSB9O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBlcnJvciA9IGVycjtcbiAgfVxuICByZXR1cm4geyBlcnI6IGVycm9yIH07XG59O1xuXG4vKipcbiAqIERlcHRoIG9mIHRoaXMgbm9kZSdzIHRyZWUuIEEgbG9uZSB2YWx1ZSBpcyBjb25zaWRlcmVkIHRvIGhhdmUgYSBkZXB0aCBvZiAwLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZGVwdGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBtYXggPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW5fLmxlbmd0aDsgaSsrKSB7XG4gICAgbWF4ID0gTWF0aC5tYXgobWF4LCAxICsgdGhpcy5jaGlsZHJlbl9baV0uZGVwdGgoKSk7XG4gIH1cblxuICByZXR1cm4gbWF4O1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkZWVwZXN0IGRlc2NlbmRhbnQgb3BlcmF0aW9uIEV4cHJlc3Npb25Ob2RlIGluIHRoZSB0cmVlIChpLmUuIHRoZVxuICogbmV4dCBub2RlIHRvIGNvbGxhcHNlXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXREZWVwZXN0T3BlcmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgZGVlcGVzdENoaWxkID0gbnVsbDtcbiAgdmFyIGRlZXBlc3REZXB0aCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbl8ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVwdGggPSB0aGlzLmNoaWxkcmVuX1tpXS5kZXB0aCgpO1xuICAgIGlmIChkZXB0aCA+IGRlZXBlc3REZXB0aCkge1xuICAgICAgZGVlcGVzdERlcHRoID0gZGVwdGg7XG4gICAgICBkZWVwZXN0Q2hpbGQgPSB0aGlzLmNoaWxkcmVuX1tpXTtcbiAgICB9XG4gIH1cblxuICBpZiAoZGVlcGVzdERlcHRoID09PSAwKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4gZGVlcGVzdENoaWxkLmdldERlZXBlc3RPcGVyYXRpb24oKTtcbn07XG5cbi8qKlxuICogQ29sbGFwc2VzIHRoZSBuZXh0IGRlc2NlbmRhbnQgaW4gcGxhY2UuIE5leHQgaXMgZGVmaW5lZCBhcyBkZWVwZXN0LCB0aGVuXG4gKiBmdXJ0aGVzdCBsZWZ0LlxuICogQHJldHVybnMge2Jvb2xlYX0gdHJ1ZSBpZiBjb2xsYXBzZSB3YXMgc3VjY2Vzc2Z1bC5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmNvbGxhcHNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZGVlcGVzdCA9IHRoaXMuZ2V0RGVlcGVzdE9wZXJhdGlvbigpO1xuICBpZiAoZGVlcGVzdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFdlJ3JlIHRoZSBkZXBlc3Qgb3BlcmF0aW9uLCBpbXBseWluZyBib3RoIHNpZGVzIGFyZSBudW1iZXJzXG4gIGlmICh0aGlzID09PSBkZWVwZXN0KSB7XG4gICAgdmFyIGV2YWx1YXRpb24gPSB0aGlzLmV2YWx1YXRlKCk7XG4gICAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMudmFsdWVfID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG4gICAgdGhpcy5jaGlsZHJlbl8gPSBbXTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZGVlcGVzdC5jb2xsYXBzZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhIHRva2VuTGlzdCBmb3IgdGhpcyBleHByZXNzaW9uLCB3aGVyZSBkaWZmZXJlbmNlcyBmcm9tIG90aGVyIGV4cHJlc3Npb25cbiAqIGFyZSBtYXJrZWRcbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV9IG90aGVyIFRoZSBFeHByZXNzaW9uTm9kZSB0byBjb21wYXJlIHRvLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0VG9rZW5MaXN0RGlmZiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICB2YXIgdG9rZW5zO1xuICB2YXIgbm9kZXNNYXRjaCA9IG90aGVyICYmIHRoaXMuaGFzU2FtZVZhbHVlXyhvdGhlcikgJiZcbiAgICAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSBvdGhlci5jaGlsZHJlbl8ubGVuZ3RoKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldFR5cGVfKCk7XG5cbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbbmV3IFRva2VuKHRoaXMudmFsdWVfLCAhbm9kZXNNYXRjaCldO1xuICB9XG5cbiAgdmFyIHRva2Vuc0ZvckNoaWxkID0gZnVuY3Rpb24gKGNoaWxkSW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGlsZHJlbl9bY2hpbGRJbmRleF0uZ2V0VG9rZW5MaXN0RGlmZihub2Rlc01hdGNoICYmXG4gICAgICBvdGhlci5jaGlsZHJlbl9bY2hpbGRJbmRleF0pO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5BUklUSE1FVElDKSB7XG4gICAgLy8gRGVhbCB3aXRoIGFyaXRobWV0aWMsIHdoaWNoIGlzIGFsd2F5cyBpbiB0aGUgZm9ybSAoY2hpbGQwIG9wZXJhdG9yIGNoaWxkMSlcbiAgICB0b2tlbnMgPSBbbmV3IFRva2VuKCcoJywgIW5vZGVzTWF0Y2gpXTtcbiAgICB0b2tlbnMucHVzaChbXG4gICAgICB0b2tlbnNGb3JDaGlsZCgwKSxcbiAgICAgIG5ldyBUb2tlbihcIiBcIiArIHRoaXMudmFsdWVfICsgXCIgXCIsICFub2Rlc01hdGNoKSxcbiAgICAgIHRva2Vuc0ZvckNoaWxkKDEpXG4gICAgXSk7XG4gICAgdG9rZW5zLnB1c2gobmV3IFRva2VuKCcpJywgIW5vZGVzTWF0Y2gpKTtcblxuICAgIHJldHVybiBfLmZsYXR0ZW4odG9rZW5zKTtcbiAgfVxuXG4gIGlmICh0aGlzLnZhbHVlXyA9PT0gJ3NxcicpIHtcbiAgICByZXR1cm4gXy5mbGF0dGVuKFtcbiAgICAgIG5ldyBUb2tlbignKCcsICFub2Rlc01hdGNoKSxcbiAgICAgIHRva2Vuc0ZvckNoaWxkKDApLFxuICAgICAgbmV3IFRva2VuKCcgXiAyJywgIW5vZGVzTWF0Y2gpLFxuICAgICAgbmV3IFRva2VuKCcpJywgIW5vZGVzTWF0Y2gpXG4gICAgXSk7XG4gIH0gZWxzZSBpZiAodGhpcy52YWx1ZV8gPT09ICdwb3cnKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbihbXG4gICAgICBuZXcgVG9rZW4oJygnLCAhbm9kZXNNYXRjaCksXG4gICAgICB0b2tlbnNGb3JDaGlsZCgwKSxcbiAgICAgIG5ldyBUb2tlbignIF4gJywgIW5vZGVzTWF0Y2gpLFxuICAgICAgdG9rZW5zRm9yQ2hpbGQoMSksXG4gICAgICBuZXcgVG9rZW4oJyknLCAhbm9kZXNNYXRjaClcbiAgICBdKTtcbiAgfVxuXG4gIC8vIFdlIGVpdGhlciBoYXZlIGEgZnVuY3Rpb24gY2FsbCwgb3IgYW4gYXJpdGhtZXRpYyBub2RlIHRoYXQgd2Ugd2FudCB0b1xuICAvLyB0cmVhdCBsaWtlIGEgZnVuY3Rpb24gKGkuZS4gc3FydCg0KSlcbiAgLy8gQSBmdW5jdGlvbiBjYWxsIHdpbGwgZ2VuZXJhdGUgc29tZXRoaW5nIGxpa2U6IGZvbygxLCAyLCAzKVxuICB0b2tlbnMgPSBbXG4gICAgbmV3IFRva2VuKHRoaXMudmFsdWVfLCBvdGhlciAmJiB0aGlzLnZhbHVlXyAhPT0gb3RoZXIudmFsdWVfKSxcbiAgICBuZXcgVG9rZW4oJygnLCAhbm9kZXNNYXRjaClcbiAgXTtcblxuICB2YXIgbnVtQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKykge1xuICAgIGlmIChpID4gMCkge1xuICAgICAgdG9rZW5zLnB1c2gobmV3IFRva2VuKCcsJywgIW5vZGVzTWF0Y2gpKTtcbiAgICB9XG4gICAgdmFyIGNoaWxkVG9rZW5zID0gdG9rZW5zRm9yQ2hpbGQoaSk7XG4gICAgaWYgKG51bUNoaWxkcmVuID09PSAxKSB7XG4gICAgICBFeHByZXNzaW9uTm9kZS5zdHJpcE91dGVyUGFyZW5zRnJvbVRva2VuTGlzdChjaGlsZFRva2Vucyk7XG4gICAgfVxuICAgIHRva2Vucy5wdXNoKGNoaWxkVG9rZW5zKTtcbiAgfVxuXG4gIHRva2Vucy5wdXNoKG5ldyBUb2tlbihcIilcIiwgIW5vZGVzTWF0Y2gpKTtcbiAgcmV0dXJuIF8uZmxhdHRlbih0b2tlbnMpO1xufTtcblxuLyoqXG4gKiBHZXQgYSB0b2tlbkxpc3QgZm9yIHRoaXMgZXhwcmVzc2lvbiwgcG90ZW50aWFsbHkgbWFya2luZyB0aG9zZSB0b2tlbnNcbiAqIHRoYXQgYXJlIGluIHRoZSBkZWVwZXN0IGRlc2NlbmRhbnQgZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFya0RlZXBlc3QgTWFyayB0b2tlbnMgaW4gdGhlIGRlZXBlc3QgZGVzY2VuZGFudFxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0VG9rZW5MaXN0ID0gZnVuY3Rpb24gKG1hcmtEZWVwZXN0KSB7XG4gIGlmICghbWFya0RlZXBlc3QpIHtcbiAgICAvLyBkaWZmIGFnYWluc3QgdGhpcyBzbyB0aGF0IG5vdGhpbmcgaXMgbWFya2VkXG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9rZW5MaXN0RGlmZih0aGlzKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlcHRoKCkgPD0gMSkge1xuICAgIC8vIG1hcmtEZWVwZXN0IGlzIHRydWUuIGRpZmYgYWdhaW5zdCBudWxsIHNvIHRoYXQgZXZlcnl0aGluZyBpcyBtYXJrZWRcbiAgICByZXR1cm4gdGhpcy5nZXRUb2tlbkxpc3REaWZmKG51bGwpO1xuICB9XG5cbiAgaWYgKHRoaXMuZ2V0VHlwZV8oKSAhPT0gVmFsdWVUeXBlLkFSSVRITUVUSUMgJiZcbiAgICAgIHRoaXMuZ2V0VHlwZV8oKSAhPT0gVmFsdWVUeXBlLkVYUE9ORU5USUFMKSB7XG4gICAgLy8gRG9uJ3Qgc3VwcG9ydCBnZXRUb2tlbkxpc3QgZm9yIGZ1bmN0aW9uc1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkXCIpO1xuICB9XG5cbiAgdmFyIHJpZ2h0RGVlcGVyID0gZmFsc2U7XG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDIpIHtcbiAgICByaWdodERlZXBlciA9IHRoaXMuY2hpbGRyZW5fWzFdLmRlcHRoKCkgPiB0aGlzLmNoaWxkcmVuX1swXS5kZXB0aCgpO1xuICB9XG5cbiAgdmFyIHByZWZpeCA9IG5ldyBUb2tlbignKCcsIGZhbHNlKTtcbiAgdmFyIHN1ZmZpeCA9IG5ldyBUb2tlbignKScsIGZhbHNlKTtcblxuICBpZiAodGhpcy52YWx1ZV8gPT09ICdzcXJ0Jykge1xuICAgIHByZWZpeCA9IG5ldyBUb2tlbignc3FydCcsIGZhbHNlKTtcbiAgICBzdWZmaXggPSBudWxsO1xuICB9XG5cbiAgdmFyIHRva2VucyA9IFtcbiAgICBwcmVmaXgsXG4gICAgdGhpcy5jaGlsZHJlbl9bMF0uZ2V0VG9rZW5MaXN0KG1hcmtEZWVwZXN0ICYmICFyaWdodERlZXBlciksXG4gIF07XG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPiAxKSB7XG4gICAgdG9rZW5zLnB1c2goW1xuICAgICAgbmV3IFRva2VuKFwiIFwiICsgdGhpcy52YWx1ZV8gKyBcIiBcIiwgZmFsc2UpLFxuICAgICAgdGhpcy5jaGlsZHJlbl9bMV0uZ2V0VG9rZW5MaXN0KG1hcmtEZWVwZXN0ICYmIHJpZ2h0RGVlcGVyKVxuICAgIF0pO1xuICB9XG4gIGlmIChzdWZmaXgpIHtcbiAgICB0b2tlbnMucHVzaChzdWZmaXgpO1xuICB9XG4gIHJldHVybiBfLmZsYXR0ZW4odG9rZW5zKTtcbn07XG5cbi8qKlxuICogTG9va3MgdG8gc2VlIGlmIHR3byBub2RlcyBoYXZlIHRoZSBzYW1lIHZhbHVlLCB1c2luZyBqc251bS5lcXVhbHMgaW4gdGhlXG4gKiBjYXNlIG9mIG51bWJlcnNcbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV9IG90aGVyIEV4cHJlc2lzb25Ob2RlIHRvIGNvbXBhcmUgdG9cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIGJvdGggbm9kZXMgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmhhc1NhbWVWYWx1ZV8gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCFvdGhlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLmlzTnVtYmVyKCkpIHtcbiAgICByZXR1cm4ganNudW1zLmVxdWFscyh0aGlzLnZhbHVlXywgb3RoZXIudmFsdWVfKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnZhbHVlXyA9PT0gb3RoZXIudmFsdWVfO1xufTtcblxuLyoqXG4gKiBJcyBvdGhlciBleGFjdGx5IHRoZSBzYW1lIGFzIHRoaXMgRXhwcmVzc2lvbk5vZGUgdHJlZS5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzSWRlbnRpY2FsVG8gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCFvdGhlciB8fCAhdGhpcy5oYXNTYW1lVmFsdWVfKG90aGVyKSB8fCB0aGlzLmNoaWxkcmVuXy5sZW5ndGggIT09IG90aGVyLmNoaWxkcmVuXy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW5fLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCF0aGlzLmNoaWxkcmVuX1tpXS5pc0lkZW50aWNhbFRvKG90aGVyLmNoaWxkcmVuX1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBib3RoIHRoaXMgYW5kIG90aGVyIGFyZSBjYWxscyBvZiB0aGUgc2FtZSBmdW5jdGlvbiwgd2l0aFxuICogdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50c1xuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaGFzU2FtZVNpZ25hdHVyZSA9IGZ1bmN0aW9uIChvdGhlcikge1xuICBpZiAoIW90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuZ2V0VHlwZV8oKSAhPT0gVmFsdWVUeXBlLkZVTkNUSU9OX0NBTEwgfHxcbiAgICAgIG90aGVyLmdldFR5cGVfKCkgIT09IFZhbHVlVHlwZS5GVU5DVElPTl9DQUxMKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMudmFsdWVfICE9PSBvdGhlci52YWx1ZV8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoICE9PSBvdGhlci5jaGlsZHJlbl8ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIERvIHRoZSB0d28gbm9kZXMgZGlmZmVyIG9ubHkgaW4gYXJndW1lbnQgb3JkZXIuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0VxdWl2YWxlbnRUbyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAvLyBvbmx5IGlnbm9yZSBhcmd1bWVudCBvcmRlciBmb3IgQVJJVEhNRVRJQ1xuICBpZiAodGhpcy5nZXRUeXBlXygpICE9PSBWYWx1ZVR5cGUuQVJJVEhNRVRJQykge1xuICAgIHJldHVybiB0aGlzLmlzSWRlbnRpY2FsVG8ob3RoZXIpO1xuICB9XG5cbiAgaWYgKCFvdGhlciB8fCB0aGlzLnZhbHVlXyAhPT0gb3RoZXIudmFsdWVfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIG15TGVmdCA9IHRoaXMuY2hpbGRyZW5fWzBdO1xuICB2YXIgbXlSaWdodCA9IHRoaXMuY2hpbGRyZW5fWzFdO1xuXG4gIHZhciB0aGVpckxlZnQgPSBvdGhlci5jaGlsZHJlbl9bMF07XG4gIHZhciB0aGVpclJpZ2h0ID0gb3RoZXIuY2hpbGRyZW5fWzFdO1xuXG4gIGlmIChteUxlZnQuaXNFcXVpdmFsZW50VG8odGhlaXJMZWZ0KSkge1xuICAgIHJldHVybiBteVJpZ2h0LmlzRXF1aXZhbGVudFRvKHRoZWlyUmlnaHQpO1xuICB9XG4gIGlmIChteUxlZnQuaXNFcXVpdmFsZW50VG8odGhlaXJSaWdodCkpIHtcbiAgICByZXR1cm4gbXlSaWdodC5pc0VxdWl2YWxlbnRUbyh0aGVpckxlZnQpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQHJldHVybnMge251bWJlcn0gSG93IG1hbnkgY2hpbGRyZW4gdGhpcyBub2RlIGhhc1xuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUubnVtQ2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIG5vZGUncyB2YWx1ZS5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZV8udG9TdHJpbmcoKTtcbn07XG5cblxuLyoqXG4gKiBNb2RpZnkgdGhpcyBFeHByZXNzaW9uTm9kZSdzIHZhbHVlXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0VHlwZV8oKTtcbiAgaWYgKHR5cGUgIT09IFZhbHVlVHlwZS5WQVJJQUJMRSAmJiB0eXBlICE9PSBWYWx1ZVR5cGUuTlVNQkVSKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgbW9kaWZ5IHZhbHVlXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuTlVNQkVSKSB7XG4gICAgdGhpcy52YWx1ZV8gPSBlbnN1cmVKc251bSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52YWx1ZV8gPSB2YWx1ZTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIHRoZSBjaGlsZCBhdCBpbmRleFxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0Q2hpbGRWYWx1ZSA9IGZ1bmN0aW9uIChpbmRleCkge1xuICBpZiAodGhpcy5jaGlsZHJlbl9baW5kZXhdID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0aGlzLmNoaWxkcmVuX1tpbmRleF0udmFsdWVfO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlIG9mIHRoZSBjaGlsZCBhdCBpbmRleFxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuc2V0Q2hpbGRWYWx1ZSA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuY2hpbGRyZW5fW2luZGV4XS5zZXRWYWx1ZSh2YWx1ZSk7XG59O1xuXG4vKipcbiAqIEdldCBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJlZVxuICogTm90ZTogVGhpcyBpcyBvbmx5IHVzZWQgYnkgdGVzdCBjb2RlLCBidXQgaXMgYWxzbyBnZW5lcmFsbHkgdXNlZnVsIHRvIGRlYnVnXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZGVidWcgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAodGhpcy5pc051bWJlcigpKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV8udG9GaXhudW0oKS50b1N0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV8udG9TdHJpbmcoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFwiKFwiICsgdGhpcy52YWx1ZV8gKyBcIiBcIiArXG4gICAgdGhpcy5jaGlsZHJlbl8ubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICByZXR1cm4gYy5kZWJ1ZygpO1xuICAgIH0pLmpvaW4oJyAnKSArIFwiKVwiO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIHRva2VuIGxpc3QsIGlmIHRoZSBmaXJzdCBhbmQgbGFzdCBpdGVtcyBhcmUgcGFyZW5zLCByZW1vdmVzIHRoZW1cbiAqIGZyb20gdGhlIGxpc3RcbiAqL1xuRXhwcmVzc2lvbk5vZGUuc3RyaXBPdXRlclBhcmVuc0Zyb21Ub2tlbkxpc3QgPSBmdW5jdGlvbiAodG9rZW5MaXN0KSB7XG4gIGlmICh0b2tlbkxpc3QubGVuZ3RoID49IDIgJiYgdG9rZW5MaXN0WzBdLmlzUGFyZW50aGVzaXMoKSAmJlxuICAgICAgdG9rZW5MaXN0W3Rva2VuTGlzdC5sZW5ndGggLSAxXS5pc1BhcmVudGhlc2lzKCkpIHtcbiAgICB0b2tlbkxpc3Quc3BsaWNlKC0xKTtcbiAgICB0b2tlbkxpc3Quc3BsaWNlKDAsIDEpO1xuICB9XG4gIHJldHVybiB0b2tlbkxpc3Q7XG59O1xuIiwidmFyIGpzbnVtcyA9IHJlcXVpcmUoJy4vanMtbnVtYmVycy9qcy1udW1iZXJzJyk7XG5cbi8vIFVuaWNvZGUgY2hhcmFjdGVyIGZvciBub24tYnJlYWtpbmcgc3BhY2VcbnZhciBOQlNQID0gJ1xcdTAwQTAnO1xuXG4vKipcbiAqIEEgdG9rZW4gaXMgYSB2YWx1ZSwgYW5kIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IGl0IGlzIFwibWFya2VkXCIuXG4gKiBNYXJraW5nIGlzIGRvbmUgZm9yIHR3byBkaWZmZXJlbnQgcmVhc29ucy5cbiAqICgxKSBXZSdyZSBjb21wYXJpbmcgdHdvIGV4cHJlc3Npb25zIGFuZCB3YW50IHRvIG1hcmsgd2hlcmUgdGhleSBkaWZmZXIuXG4gKiAoMikgV2UncmUgbG9va2luZyBhdCBhIHNpbmdsZSBleHByZXNzaW9uIGFuZCB3YW50IHRvIG1hcmsgdGhlIGRlZXBlc3RcbiAqICAgICBzdWJleHByZXNzaW9uLlxuICogQHBhcmFtIHtzdHJpbmd8anNudW1iZXJ9IHZhbFxuICogQHBhcmFtIHtib29sZWFufSBtYXJrZWRcbiAqL1xudmFyIFRva2VuID0gZnVuY3Rpb24gKHZhbCwgbWFya2VkKSB7XG4gIHRoaXMudmFsXyA9IHZhbDtcbiAgdGhpcy5tYXJrZWRfID0gbWFya2VkO1xuXG4gIC8vIFN0b3JlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB2YWx1ZS4gSW4gbW9zdCBjYXNlcyB0aGlzIGlzIGp1c3QgYVxuICAvLyBub24gcmVwZWF0ZWQgcG9ydGlvbi4gSW4gdGhlIGNhc2Ugb2Ygc29tZXRoaW5nIGxpa2UgMS85IHRoZXJlIHdpbGwgYmUgYm90aFxuICAvLyBhIG5vbiByZXBlYXRlZCBwb3J0aW9uIFwiMC5cIiBhbmQgYSByZXBlYXRlZCBwb3J0aW9uIFwiMVwiIC0gaS5lLiAwLjExMTExMTEuLi5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIHRoaXMubm9uUmVwZWF0ZWRfID0gbnVsbDtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIHRoaXMucmVwZWF0ZWRfID0gbnVsbDtcbiAgdGhpcy5zZXRTdHJpbmdSZXByZXNlbnRhdGlvbl8oKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRva2VuO1xuXG5Ub2tlbi5wcm90b3R5cGUuaXNQYXJlbnRoZXNpcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmFsXyA9PT0gJygnIHx8IHRoaXMudmFsXyA9PT0gJyknO1xufTtcblxuLyoqXG4gKiBBZGQgdGhlIGdpdmVuIHRva2VuIHRvIHRoZSBwYXJlbnQgZWxlbWVudC5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgUGFyZW50IGVsZW1lbnQgdG8gYWRkIHRvXG4gKiBAcGFyYW0ge251bWJlcn0geFBvcyBYIHBvc2l0aW9uIHRvIHBsYWNlIGVsZW1lbnQgYXRcbiAqIEBwYXJhbSB7c3RyaW5nP30gbWFya0NsYXNzIENsYXNzIG5hbWUgdG8gdXNlIGlmIHRva2VuIGlzIG1hcmtlZFxuICogQHJldHVybnMge251bWJlcn0gdGhlIGxlbmd0aCBvZiB0aGUgYWRkZWQgdGV4dCBlbGVtZW50XG4gKi9cblRva2VuLnByb3RvdHlwZS5yZW5kZXJUb1BhcmVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCB4UG9zLCBtYXJrQ2xhc3MpIHtcbiAgdmFyIHRleHQsIHRleHRMZW5ndGg7XG5cbiAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RleHQnKTtcblxuICB2YXIgdHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICd0c3BhbicpO1xuICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIDJ4IG5vbmJyZWFraW5nIHNwYWNlXG4gIHRzcGFuLnRleHRDb250ZW50ID0gdGhpcy5ub25SZXBlYXRlZF8ucmVwbGFjZSgvIC9nLCBOQlNQICsgTkJTUCk7XG4gIHRleHQuYXBwZW5kQ2hpbGQodHNwYW4pO1xuXG4gIGlmICh0aGlzLnJlcGVhdGVkXykge1xuICAgIHRzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndHNwYW4nKTtcbiAgICB0c3Bhbi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ3RleHQtZGVjb3JhdGlvbjogb3ZlcmxpbmUnKTtcbiAgICAvLyBSZXBsYWNlIHNwYWNlcyB3aXRoIDJ4IG5vbmJyZWFraW5nIHNwYWNlXG4gICAgdHNwYW4udGV4dENvbnRlbnQgPSB0aGlzLnJlcGVhdGVkXy5yZXBsYWNlKC8gL2csIE5CU1AgKyBOQlNQKTtcbiAgICB0ZXh0LmFwcGVuZENoaWxkKHRzcGFuKTtcbiAgfVxuXG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dCk7XG5cbiAgLy8gRkYgZG9lc250IGhhdmUgb2Zmc2V0V2lkdGhcbiAgLy8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0IHVuZGVyY2FsY3VsYXRlcyB3aWR0aCBvbiBpUGFkXG4gIGlmICh0ZXh0Lm9mZnNldFdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICB0ZXh0TGVuZ3RoID0gdGV4dC5vZmZzZXRXaWR0aDtcbiAgfSBlbHNlIHtcbiAgICB0ZXh0TGVuZ3RoID0gdGV4dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgfVxuXG4gIHRleHQuc2V0QXR0cmlidXRlKCd4JywgeFBvcyk7XG4gIGlmICh0aGlzLm1hcmtlZF8gJiYgbWFya0NsYXNzKSB7XG4gICAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgbWFya0NsYXNzKTtcbiAgfVxuXG4gIHJldHVybiB0ZXh0TGVuZ3RoO1xufTtcblxuLyoqXG4gKiBTZXRzIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB2YWx1ZS5cbiAqL1xuVG9rZW4ucHJvdG90eXBlLnNldFN0cmluZ1JlcHJlc2VudGF0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFqc251bXMuaXNTY2hlbWVOdW1iZXIodGhpcy52YWxfKSB8fCB0eXBlb2YodGhpcy52YWxfKSA9PT0gJ251bWJlcicpIHtcbiAgICB0aGlzLm5vblJlcGVhdGVkXyA9IHRoaXMudmFsXztcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBhdCB0aGlzIHBvaW50IHdlIGtub3cgd2UgaGF2ZSBhIGpzbnVtYmVyXG4gIGlmICh0aGlzLnZhbF8uaXNJbnRlZ2VyKCkpIHtcbiAgICB0aGlzLm5vblJlcGVhdGVkXyA9IFRva2VuLm51bWJlcldpdGhDb21tYXNfKHRoaXMudmFsXy50b0ZpeG51bSgpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBHaXZlcyB1cyB0aHJlZSB2YWx1ZXM6IE51bWJlciBiZWZvcmUgZGVjaW1hbCwgbm9uLXJlcGVhdGluZyBwb3J0aW9uLFxuICAvLyByZXBlYXRpbmcgcG9ydGlvbi4gSWYgd2UgZG9uJ3QgaGF2ZSB0aGUgbGFzdCBiaXQsIHRoZXJlJ3Mgbm8gcmVwaXRpdGlvbi5cbiAgdmFyIG51bWVyYXRvciA9IGpzbnVtcy50b0V4YWN0KHRoaXMudmFsXy5udW1lcmF0b3IoKSk7XG4gIHZhciBkZW5vbWluYXRvciA9IGpzbnVtcy50b0V4YWN0KHRoaXMudmFsXy5kZW5vbWluYXRvcigpKTtcbiAgdmFyIHJlcGVhdGVyID0ganNudW1zLnRvUmVwZWF0aW5nRGVjaW1hbChudW1lcmF0b3IsIGRlbm9taW5hdG9yKTtcbiAgaWYgKCFyZXBlYXRlclsyXSB8fCByZXBlYXRlclsyXSA9PT0gJzAnKSB7XG4gICAgdGhpcy5ub25SZXBlYXRlZF8gPSBUb2tlbi5udW1iZXJXaXRoQ29tbWFzXyh0aGlzLnZhbF8udG9GaXhudW0oKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5ub25SZXBlYXRlZF8gPSBUb2tlbi5udW1iZXJXaXRoQ29tbWFzXyhyZXBlYXRlclswXSkgKyAnLicgKyByZXBlYXRlclsxXTtcbiAgdGhpcy5yZXBlYXRlZF8gPSByZXBlYXRlclsyXTtcbn07XG5cbi8qKlxuICogRnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yOTAxMjk4LzI1MDY3NDhcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgbnVtYmVyIHdpdGggY29tbWFzIGluc2VydGVkIGluIHRob3VzYW5kdGgncyBwbGFjZVxuICovXG5Ub2tlbi5udW1iZXJXaXRoQ29tbWFzXyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBwYXJ0cyA9IHgudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XG4gIHBhcnRzWzBdID0gcGFydHNbMF0ucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpO1xuICByZXR1cm4gcGFydHMuam9pbihcIi5cIik7XG59O1xuIiwiLy8gU2NoZW1lIG51bWJlcnMuXG5cbi8vIE5PVEU6IFRoaXMgdG9wIGJpdCBkaWZmZXJzIGZyb20gdGhlIHZlcnNpb24gYXQgaHR0cHM6Ly9naXRodWIuY29tL2Jvb3RzdHJhcHdvcmxkL2pzLW51bWJlcnMvYmxvYi9tYXN0ZXIvc3JjL2pzLW51bWJlcnMuanNcbnZhciBqc251bXMgPSB7fTtcbm1vZHVsZS5leHBvcnRzID0ganNudW1zO1xuXG5cbi8vIFRoZSBudW1lcmljIHRvd2VyIGhhcyB0aGUgZm9sbG93aW5nIGxldmVsczpcbi8vICAgICBpbnRlZ2Vyc1xuLy8gICAgIHJhdGlvbmFsc1xuLy8gICAgIGZsb2F0c1xuLy8gICAgIGNvbXBsZXggbnVtYmVyc1xuLy9cbi8vIHdpdGggdGhlIHJlcHJlc2VudGF0aW9uczpcbi8vICAgICBpbnRlZ2VyczogZml4bnVtIG9yIEJpZ0ludGVnZXIgW2xldmVsPTBdXG4vLyAgICAgcmF0aW9uYWxzOiBSYXRpb25hbCBbbGV2ZWw9MV1cbi8vICAgICBmbG9hdHM6IEZsb2F0UG9pbnQgW2xldmVsPTJdXG4vLyAgICAgY29tcGxleCBudW1iZXJzOiBDb21wbGV4IFtsZXZlbD0zXVxuXG4vLyBXZSB0cnkgdG8gc3RpY2sgd2l0aCB0aGUgdW5ib3hlZCBmaXhudW0gcmVwcmVzZW50YXRpb24gZm9yXG4vLyBpbnRlZ2Vycywgc2luY2UgdGhhdCdzIHdoYXQgc2NoZW1lIHByb2dyYW1zIGNvbW1vbmx5IGRlYWwgd2l0aCwgYW5kXG4vLyB3ZSB3YW50IHRoYXQgY29tbW9uIHR5cGUgdG8gYmUgbGlnaHR3ZWlnaHQuXG5cblxuLy8gQSBib3hlZC1zY2hlbWUtbnVtYmVyIGlzIGVpdGhlciBCaWdJbnRlZ2VyLCBSYXRpb25hbCwgRmxvYXRQb2ludCwgb3IgQ29tcGxleC5cbi8vIEFuIGludGVnZXItc2NoZW1lLW51bWJlciBpcyBlaXRoZXIgZml4bnVtIG9yIEJpZ0ludGVnZXIuXG5cblxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBBYmJyZXZpYXRpb25cbiAgICB2YXIgTnVtYmVycyA9IGpzbnVtcztcblxuXG4gICAgLy8gbWFrZU51bWVyaWNCaW5vcDogKGZpeG51bSBmaXhudW0gLT4gYW55KSAoc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGFueSkgLT4gKHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlcikgWFxuICAgIC8vIENyZWF0ZXMgYSBiaW5hcnkgZnVuY3Rpb24gdGhhdCB3b3JrcyBlaXRoZXIgb24gZml4bnVtcyBvciBib3hudW1zLlxuICAgIC8vIEFwcGxpZXMgdGhlIGFwcHJvcHJpYXRlIGJpbmFyeSBmdW5jdGlvbiwgZW5zdXJpbmcgdGhhdCBib3RoIHNjaGVtZSBudW1iZXJzIGFyZVxuICAgIC8vIGxpZnRlZCB0byB0aGUgc2FtZSBsZXZlbC5cbiAgICB2YXIgbWFrZU51bWVyaWNCaW5vcCA9IGZ1bmN0aW9uKG9uRml4bnVtcywgb25Cb3hlZG51bXMsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pc1hTcGVjaWFsQ2FzZSAmJiBvcHRpb25zLmlzWFNwZWNpYWxDYXNlKHgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLm9uWFNwZWNpYWxDYXNlKHgsIHkpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXNZU3BlY2lhbENhc2UgJiYgb3B0aW9ucy5pc1lTcGVjaWFsQ2FzZSh5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5vbllTcGVjaWFsQ2FzZSh4LCB5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZih4KSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoeSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uRml4bnVtcyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YoeCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgeCA9IGxpZnRGaXhudW1JbnRlZ2VyKHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZih5KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB5ID0gbGlmdEZpeG51bUludGVnZXIoeSwgeCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh4LmxldmVsIDwgeS5sZXZlbCkgeCA9IHgubGlmdFRvKHkpO1xuICAgICAgICAgICAgaWYgKHkubGV2ZWwgPCB4LmxldmVsKSB5ID0geS5saWZ0VG8oeCk7XG4gICAgICAgICAgICByZXR1cm4gb25Cb3hlZG51bXMoeCwgeSk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvLyBmcm9tRml4bnVtOiBmaXhudW0gLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBmcm9tRml4bnVtID0gZnVuY3Rpb24oeCkge1xuICAgICAgICBpZiAoaXNOYU4oeCkgfHwgKCEgaXNGaW5pdGUoeCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoeCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5mID0gTWF0aC5mbG9vcih4KTtcbiAgICAgICAgaWYgKG5mID09PSB4KSB7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhuZikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZUJpZ251bShleHBhbmRFeHBvbmVudCh4KycnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh4KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZXhwYW5kRXhwb25lbnQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHMubWF0Y2goc2NpZW50aWZpY1BhdHRlcm4oZGlnaXRzRm9yUmFkaXgoMTApLCBleHBNYXJrRm9yUmFkaXgoMTApKSksIG1hbnRpc3NhQ2h1bmtzLCBleHBvbmVudDtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBtYW50aXNzYUNodW5rcyA9IG1hdGNoWzFdLm1hdGNoKC9eKFteLl0qKSguKikkLyk7XG4gICAgICAgICAgICBleHBvbmVudCA9IE51bWJlcihtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgIGlmIChtYW50aXNzYUNodW5rc1syXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFudGlzc2FDaHVua3NbMV0gKyB6ZmlsbChleHBvbmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChleHBvbmVudCA+PSBtYW50aXNzYUNodW5rc1syXS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYW50aXNzYUNodW5rc1sxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW50aXNzYUNodW5rc1syXS5zdWJzdHJpbmcoMSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgemZpbGwoZXhwb25lbnQgLSAobWFudGlzc2FDaHVua3NbMl0ubGVuZ3RoIC0gMSkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYW50aXNzYUNodW5rc1sxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW50aXNzYUNodW5rc1syXS5zdWJzdHJpbmcoMSwgMStleHBvbmVudCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gemZpbGw6IGludGVnZXIgLT4gc3RyaW5nXG4gICAgLy8gYnVpbGRzIGEgc3RyaW5nIG9mIFwiMFwiJ3Mgb2YgbGVuZ3RoIG4uXG4gICAgdmFyIHpmaWxsID0gZnVuY3Rpb24obikge1xuICAgICAgICB2YXIgYnVmZmVyID0gW107XG4gICAgICAgIGJ1ZmZlci5sZW5ndGggPSBuO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgYnVmZmVyW2ldID0gJzAnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWZmZXIuam9pbignJyk7XG4gICAgfTtcblxuXG5cbiAgICAvLyBsaWZ0Rml4bnVtSW50ZWdlcjogZml4bnVtLWludGVnZXIgYm94ZWQtc2NoZW1lLW51bWJlciAtPiBib3hlZC1zY2hlbWUtbnVtYmVyXG4gICAgLy8gTGlmdHMgdXAgZml4bnVtIGludGVnZXJzIHRvIGEgYm94ZWQgdHlwZS5cbiAgICB2YXIgbGlmdEZpeG51bUludGVnZXIgPSBmdW5jdGlvbih4LCBvdGhlcikge1xuICAgICAgICBzd2l0Y2gob3RoZXIubGV2ZWwpIHtcbiAgICAgICAgY2FzZSAwOiAvLyBCaWdJbnRlZ2VyXG4gICAgICAgICAgICByZXR1cm4gbWFrZUJpZ251bSh4KTtcbiAgICAgICAgY2FzZSAxOiAvLyBSYXRpb25hbFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSYXRpb25hbCh4LCAxKTtcbiAgICAgICAgY2FzZSAyOiAvLyBGbG9hdFBvaW50XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0UG9pbnQoeCk7XG4gICAgICAgIGNhc2UgMzogLy8gQ29tcGxleFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KHgsIDApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJJTVBPU1NJQkxFOiBjYW5ub3QgbGlmdCBmaXhudW0gaW50ZWdlciB0byBcIiArIG90aGVyLnRvU3RyaW5nKCksIHgsIG90aGVyKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8vIHRocm93UnVudGltZUVycm9yOiBzdHJpbmcgKHNjaGVtZS1udW1iZXIgfCB1bmRlZmluZWQpIChzY2hlbWUtbnVtYmVyIHwgdW5kZWZpbmVkKSAtPiB2b2lkXG4gICAgLy8gVGhyb3dzIGEgcnVudGltZSBlcnJvciB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlIHN0cmluZy5cbiAgICB2YXIgdGhyb3dSdW50aW1lRXJyb3IgPSBmdW5jdGlvbihtc2csIHgsIHkpIHtcbiAgICAgICAgTnVtYmVyc1snb25UaHJvd1J1bnRpbWVFcnJvciddKG1zZywgeCwgeSk7XG4gICAgfTtcblxuXG5cbiAgICAvLyBvblRocm93UnVudGltZUVycm9yOiBzdHJpbmcgKHNjaGVtZS1udW1iZXIgfCB1bmRlZmluZWQpIChzY2hlbWUtbnVtYmVyIHwgdW5kZWZpbmVkKSAtPiB2b2lkXG4gICAgLy8gQnkgZGVmYXVsdCwgd2lsbCB0aHJvdyBhIG5ldyBFcnJvciB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgIC8vIE92ZXJyaWRlIE51bWJlcnNbJ29uVGhyb3dSdW50aW1lRXJyb3InXSBpZiB5b3UgbmVlZCB0byBkbyBzb21ldGhpbmcgc3BlY2lhbC5cbiAgICB2YXIgb25UaHJvd1J1bnRpbWVFcnJvciA9IGZ1bmN0aW9uKG1zZywgeCwgeSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9O1xuXG5cbiAgICAvLyBpc1NjaGVtZU51bWJlcjogYW55IC0+IGJvb2xlYW5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRoaW5nIGlzIGEgc2NoZW1lIG51bWJlci5cbiAgICB2YXIgaXNTY2hlbWVOdW1iZXIgPSBmdW5jdGlvbih0aGluZykge1xuICAgICAgICByZXR1cm4gKHR5cGVvZih0aGluZykgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgfHwgKHRoaW5nIGluc3RhbmNlb2YgUmF0aW9uYWwgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpbmcgaW5zdGFuY2VvZiBGbG9hdFBvaW50IHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaW5nIGluc3RhbmNlb2YgQ29tcGxleCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGluZyBpbnN0YW5jZW9mIEJpZ0ludGVnZXIpKTtcbiAgICB9O1xuXG5cbiAgICAvLyBpc1JhdGlvbmFsOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNSYXRpb25hbCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YobikgPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgKGlzU2NoZW1lTnVtYmVyKG4pICYmIG4uaXNSYXRpb25hbCgpKSk7XG4gICAgfTtcblxuICAgIC8vIGlzUmVhbDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzUmVhbCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YobikgPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgKGlzU2NoZW1lTnVtYmVyKG4pICYmIG4uaXNSZWFsKCkpKTtcbiAgICB9O1xuXG4gICAgLy8gaXNFeGFjdDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzRXhhY3QgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKG4pID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgIChpc1NjaGVtZU51bWJlcihuKSAmJiBuLmlzRXhhY3QoKSkpO1xuICAgIH07XG5cbiAgICAvLyBpc0V4YWN0OiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNJbmV4YWN0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChpc1NjaGVtZU51bWJlcihuKSAmJiBuLmlzSW5leGFjdCgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBpc0ludGVnZXI6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc0ludGVnZXIgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKG4pID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgIChpc1NjaGVtZU51bWJlcihuKSAmJiBuLmlzSW50ZWdlcigpKSk7XG4gICAgfTtcblxuICAgIC8vIGlzRXhhY3RJbnRlZ2VyOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNFeGFjdEludGVnZXIgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKG4pID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgIChpc1NjaGVtZU51bWJlcihuKSAmJlxuICAgICAgICAgICAgICAgICBuLmlzSW50ZWdlcigpICYmXG4gICAgICAgICAgICAgICAgIG4uaXNFeGFjdCgpKSk7XG4gICAgfVxuXG5cblxuICAgIC8vIHRvRml4bnVtOiBzY2hlbWUtbnVtYmVyIC0+IGphdmFzY3JpcHQtbnVtYmVyXG4gICAgdmFyIHRvRml4bnVtID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi50b0ZpeG51bSgpO1xuICAgIH07XG5cbiAgICAvLyB0b0V4YWN0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgdG9FeGFjdCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4udG9FeGFjdCgpO1xuICAgIH07XG5cblxuICAgIC8vIHRvRXhhY3Q6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciB0b0luZXhhY3QgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKG4pO1xuICAgICAgICByZXR1cm4gbi50b0luZXhhY3QoKTtcbiAgICB9O1xuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgLy8gYWRkOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhZGQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBzdW07XG4gICAgICAgIGlmICh0eXBlb2YoeCkgPT09ICdudW1iZXInICYmIHR5cGVvZih5KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN1bSA9IHggKyB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3coc3VtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkuYWRkKG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh4IGluc3RhbmNlb2YgRmxvYXRQb2ludCAmJiB5IGluc3RhbmNlb2YgRmxvYXRQb2ludCkge1xuICAgICAgICAgICAgcmV0dXJuIHguYWRkKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZGRTbG93KHgsIHkpO1xuICAgIH07XG5cbiAgICB2YXIgYWRkU2xvdyA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSB4ICsgeTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KHN1bSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLmFkZChtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHguYWRkKHkpO1xuICAgICAgICB9LFxuICAgICAgICB7aXNYU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0V4YWN0SW50ZWdlcih4KSAmJiBfaW50ZWdlcklzWmVybyh4KSB9LFxuICAgICAgICAgb25YU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHsgcmV0dXJuIHk7IH0sXG4gICAgICAgICBpc1lTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeSkge1xuICAgICAgICAgICAgIHJldHVybiBpc0V4YWN0SW50ZWdlcih5KSAmJiBfaW50ZWdlcklzWmVybyh5KSB9LFxuICAgICAgICAgb25ZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHsgcmV0dXJuIHg7IH1cbiAgICAgICAgfSk7XG5cblxuICAgIC8vIHN1YnRyYWN0OiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBzdWJ0cmFjdCA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBkaWZmID0geCAtIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhkaWZmKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkuc3VidHJhY3QobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geC5zdWJ0cmFjdCh5KTtcbiAgICAgICAgfSxcbiAgICAgICAge2lzWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4gaXNFeGFjdEludGVnZXIoeCkgJiYgX2ludGVnZXJJc1plcm8oeCkgfSxcbiAgICAgICAgIG9uWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7IHJldHVybiBuZWdhdGUoeSk7IH0sXG4gICAgICAgICBpc1lTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeSkge1xuICAgICAgICAgICAgIHJldHVybiBpc0V4YWN0SW50ZWdlcih5KSAmJiBfaW50ZWdlcklzWmVybyh5KSB9LFxuICAgICAgICAgb25ZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHsgcmV0dXJuIHg7IH1cbiAgICAgICAgfSk7XG5cblxuICAgIC8vIG11bGl0cGx5OiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBtdWx0aXBseSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHByb2Q7XG4gICAgICAgIGlmICh0eXBlb2YoeCkgPT09ICdudW1iZXInICYmIHR5cGVvZih5KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHByb2QgPSB4ICogeTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KHByb2QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5tdWx0aXBseShtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBGbG9hdFBvaW50ICYmIHkgaW5zdGFuY2VvZiBGbG9hdFBvaW50KSB7XG4gICAgICAgICAgICByZXR1cm4geC5tdWx0aXBseSh5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbXVsdGlwbHlTbG93KHgsIHkpO1xuICAgIH07XG4gICAgdmFyIG11bHRpcGx5U2xvdyA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHZhciBwcm9kID0geCAqIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhwcm9kKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkubXVsdGlwbHkobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geC5tdWx0aXBseSh5KTtcbiAgICAgICAgfSxcbiAgICAgICAge2lzWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4gKGlzRXhhY3RJbnRlZ2VyKHgpICYmXG4gICAgICAgICAgICAgICAgICAgIChfaW50ZWdlcklzWmVybyh4KSB8fCBfaW50ZWdlcklzT25lKHgpIHx8IF9pbnRlZ2VySXNOZWdhdGl2ZU9uZSh4KSkpIH0sXG4gICAgICAgICBvblhTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyh4KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNPbmUoeCkpXG4gICAgICAgICAgICAgICAgIHJldHVybiB5O1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzTmVnYXRpdmVPbmUoeCkpXG4gICAgICAgICAgICAgICAgIHJldHVybiBuZWdhdGUoeSk7XG4gICAgICAgICB9LFxuICAgICAgICAgaXNZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgICAgICByZXR1cm4gKGlzRXhhY3RJbnRlZ2VyKHkpICYmXG4gICAgICAgICAgICAgICAgICAgICAoX2ludGVnZXJJc1plcm8oeSkgfHwgX2ludGVnZXJJc09uZSh5KSB8fCBfaW50ZWdlcklzTmVnYXRpdmVPbmUoeSkpKX0sXG4gICAgICAgICBvbllTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyh5KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNPbmUoeSkpXG4gICAgICAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzTmVnYXRpdmVPbmUoeSkpXG4gICAgICAgICAgICAgICAgIHJldHVybiBuZWdhdGUoeCk7XG4gICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBkaXZpZGU6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGRpdmlkZSA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyh5KSlcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIi86IGRpdmlzaW9uIGJ5IHplcm9cIiwgeCwgeSk7XG4gICAgICAgICAgICB2YXIgZGl2ID0geCAvIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhkaXYpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5kaXZpZGUobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1hdGguZmxvb3IoZGl2KSAhPT0gZGl2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZSh4LCB5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHguZGl2aWRlKHkpO1xuICAgICAgICB9LFxuICAgICAgICB7IGlzWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4gKGVxdih4LCAwKSk7XG4gICAgICAgIH0sXG4gICAgICAgICAgb25YU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICAgaWYgKGVxdih5LCAwKSkge1xuICAgICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCIvOiBkaXZpc2lvbiBieSB6ZXJvXCIsIHgsIHkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaXNZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgICAgIHJldHVybiAoZXF2KHksIDApKTsgfSxcbiAgICAgICAgICBvbllTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIi86IGRpdmlzaW9uIGJ5IHplcm9cIiwgeCwgeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgLy8gZXF1YWxzOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBlcXVhbHMgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geCA9PT0geTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHguZXF1YWxzKHkpO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gZXF2OiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBlcXYgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmICh4ID09PSB5KVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmICh0eXBlb2YoeCkgPT09ICdudW1iZXInICYmIHR5cGVvZih5KSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4geCA9PT0geTtcbiAgICAgICAgaWYgKHggPT09IE5FR0FUSVZFX1pFUk8gfHwgeSA9PT0gTkVHQVRJVkVfWkVSTylcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5O1xuICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIENvbXBsZXggfHwgeSBpbnN0YW5jZW9mIENvbXBsZXgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZXF2KHJlYWxQYXJ0KHgpLCByZWFsUGFydCh5KSkgJiZcbiAgICAgICAgICAgICAgICAgICAgZXF2KGltYWdpbmFyeVBhcnQoeCksIGltYWdpbmFyeVBhcnQoeSkpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZXggPSBpc0V4YWN0KHgpLCBleSA9IGlzRXhhY3QoeSk7XG4gICAgICAgIHJldHVybiAoKChleCAmJiBleSkgfHwgKCFleCAmJiAhZXkpKSAmJiBlcXVhbHMoeCwgeSkpO1xuICAgIH07XG5cbiAgICAvLyBhcHByb3hFcXVhbDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBhcHByb3hFcXVhbHMgPSBmdW5jdGlvbih4LCB5LCBkZWx0YSkge1xuICAgICAgICByZXR1cm4gbGVzc1RoYW4oYWJzKHN1YnRyYWN0KHgsIHkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhKTtcbiAgICB9O1xuXG4gICAgLy8gZ3JlYXRlclRoYW5PckVxdWFsOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBncmVhdGVyVGhhbk9yRXF1YWwgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geCA+PSB5O1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1JlYWwoeCkgJiYgaXNSZWFsKHkpKSlcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgXCI+PTogY291bGRuJ3QgYmUgYXBwbGllZCB0byBjb21wbGV4IG51bWJlclwiLCB4LCB5KTtcbiAgICAgICAgICAgIHJldHVybiB4LmdyZWF0ZXJUaGFuT3JFcXVhbCh5KTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGxlc3NUaGFuT3JFcXVhbDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgbGVzc1RoYW5PckVxdWFsID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSl7XG5cbiAgICAgICAgICAgIHJldHVybiB4IDw9IHk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmICghKGlzUmVhbCh4KSAmJiBpc1JlYWwoeSkpKVxuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPD06IGNvdWxkbid0IGJlIGFwcGxpZWQgdG8gY29tcGxleCBudW1iZXJcIiwgeCwgeSk7XG4gICAgICAgICAgICByZXR1cm4geC5sZXNzVGhhbk9yRXF1YWwoeSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBncmVhdGVyVGhhbjogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgZ3JlYXRlclRoYW4gPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KXtcbiAgICAgICAgICAgIHJldHVybiB4ID4geTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKCEoaXNSZWFsKHgpICYmIGlzUmVhbCh5KSkpXG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI+OiBjb3VsZG4ndCBiZSBhcHBsaWVkIHRvIGNvbXBsZXggbnVtYmVyXCIsIHgsIHkpO1xuICAgICAgICAgICAgcmV0dXJuIHguZ3JlYXRlclRoYW4oeSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBsZXNzVGhhbjogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgbGVzc1RoYW4gPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KXtcblxuICAgICAgICAgICAgcmV0dXJuIHggPCB5O1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1JlYWwoeCkgJiYgaXNSZWFsKHkpKSlcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIjw6IGNvdWxkbid0IGJlIGFwcGxpZWQgdG8gY29tcGxleCBudW1iZXJcIiwgeCwgeSk7XG4gICAgICAgICAgICByZXR1cm4geC5sZXNzVGhhbih5KTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgLy8gZXhwdDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZXhwdCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9leHB0ID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKHgsIHkpe1xuICAgICAgICAgICAgICAgIHZhciBwb3cgPSBNYXRoLnBvdyh4LCB5KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhwb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkuZXhwdChtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG93O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVxdWFscyh5LCAwKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkKHksIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LmV4cHQoeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoZXF1YWxzKHksIDApKVxuICAgICAgICAgICAgICAgIHJldHVybiBhZGQoeSwgMSk7XG4gICAgICAgICAgICBpZiAoaXNSZWFsKHkpICYmIGxlc3NUaGFuKHksIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9leHB0KGRpdmlkZSgxLCB4KSwgbmVnYXRlKHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfZXhwdCh4LCB5KTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG5cbiAgICAvLyBleHA6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBleHAgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICggZXF2KG4sIDApICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5leHAobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmV4cCgpO1xuICAgIH07XG5cblxuICAgIC8vIG1vZHVsbzogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbW9kdWxvID0gZnVuY3Rpb24obSwgbikge1xuICAgICAgICBpZiAoISBpc0ludGVnZXIobSkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdtb2R1bG86IHRoZSBmaXJzdCBhcmd1bWVudCAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIG0gKyBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgbSwgbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKG4pKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignbW9kdWxvOiB0aGUgc2Vjb25kIGFyZ3VtZW50ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgbiArIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCBtLCBuKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBpZiAodHlwZW9mKG0pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gbSAlIG47XG4gICAgICAgICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IDw9IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA8IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgKyBuO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBfaW50ZWdlck1vZHVsbyhmbG9vcihtKSwgZmxvb3IobikpO1xuICAgICAgICAvLyBUaGUgc2lnbiBvZiB0aGUgcmVzdWx0IHNob3VsZCBtYXRjaCB0aGUgc2lnbiBvZiBuLlxuICAgICAgICBpZiAobGVzc1RoYW4obiwgMCkpIHtcbiAgICAgICAgICAgIGlmIChsZXNzVGhhbk9yRXF1YWwocmVzdWx0LCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWRkKHJlc3VsdCwgbik7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChsZXNzVGhhbihyZXN1bHQsIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZChyZXN1bHQsIG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgLy8gbnVtZXJhdG9yOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbnVtZXJhdG9yID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi5udW1lcmF0b3IoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBkZW5vbWluYXRvcjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGRlbm9taW5hdG9yID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICByZXR1cm4gbi5kZW5vbWluYXRvcigpO1xuICAgIH07XG5cbiAgICAvLyBzcXJ0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgc3FydCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5zcXJ0KG4pO1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKHJlc3VsdCkgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLCBzcXJ0KC1uKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLnNxcnQoKTtcbiAgICB9O1xuXG4gICAgLy8gYWJzOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYWJzID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKG4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmFicygpO1xuICAgIH07XG5cbiAgICAvLyBmbG9vcjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGZsb29yID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi5mbG9vcigpO1xuICAgIH07XG5cbiAgICAvLyBjZWlsaW5nOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgY2VpbGluZyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4uY2VpbGluZygpO1xuICAgIH07XG5cbiAgICAvLyBjb25qdWdhdGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBjb25qdWdhdGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLmNvbmp1Z2F0ZSgpO1xuICAgIH07XG5cbiAgICAvLyBtYWduaXR1ZGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBtYWduaXR1ZGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKG4pO1xuICAgICAgICByZXR1cm4gbi5tYWduaXR1ZGUoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBsb2c6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBsb2cgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICggZXF2KG4sIDEpICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5sb2cobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmxvZygpO1xuICAgIH07XG5cbiAgICAvLyBhbmdsZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGFuZ2xlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKG4gPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50LnBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmFuZ2xlKCk7XG4gICAgfTtcblxuICAgIC8vIHRhbjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHRhbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAwKSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgudGFuKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi50YW4oKTtcbiAgICB9O1xuXG4gICAgLy8gYXRhbjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGF0YW4gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMCkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmF0YW4obikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmF0YW4oKTtcbiAgICB9O1xuXG4gICAgLy8gY29zOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgY29zID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDApKSB7IHJldHVybiAxOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5jb3MobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmNvcygpO1xuICAgIH07XG5cbiAgICAvLyBzaW46IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBzaW4gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMCkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNpbihuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uc2luKCk7XG4gICAgfTtcblxuICAgIC8vIGFjb3M6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhY29zID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDEpKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hY29zKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5hY29zKCk7XG4gICAgfTtcblxuICAgIC8vIGFzaW46IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhc2luID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDApKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hc2luKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5hc2luKCk7XG4gICAgfTtcblxuICAgIC8vIGltYWdpbmFyeVBhcnQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBpbWFnaW5hcnlQYXJ0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uaW1hZ2luYXJ5UGFydCgpO1xuICAgIH07XG5cbiAgICAvLyByZWFsUGFydDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHJlYWxQYXJ0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4ucmVhbFBhcnQoKTtcbiAgICB9O1xuXG4gICAgLy8gcm91bmQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciByb3VuZCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLnJvdW5kKCk7XG4gICAgfTtcblxuXG5cbiAgICAvLyBzcXI6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBzcXIgPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBtdWx0aXBseSh4LCB4KTtcbiAgICB9O1xuXG5cbiAgICAvLyBpbnRlZ2VyU3FydDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGludGVnZXJTcXJ0ID0gZnVuY3Rpb24oeCkge1xuICAgICAgICBpZiAoISBpc0ludGVnZXIoeCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdpbnRlZ2VyLXNxcnQ6IHRoZSBhcmd1bWVudCAnICsgeC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCB4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mICh4KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmKHggPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5zcXJ0KC14KSkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguc3FydCh4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHguaW50ZWdlclNxcnQoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBnY2Q6IHNjaGVtZS1udW1iZXIgW3NjaGVtZS1udW1iZXIgLi4uXSAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGdjZCA9IGZ1bmN0aW9uKGZpcnN0LCByZXN0KSB7XG4gICAgICAgIGlmICghIGlzSW50ZWdlcihmaXJzdCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdnY2Q6IHRoZSBhcmd1bWVudCAnICsgZmlyc3QudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgZmlyc3QpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gYWJzKGZpcnN0KSwgdCwgYjtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHJlc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGIgPSBhYnMocmVzdFtpXSk7XG4gICAgICAgICAgICBpZiAoISBpc0ludGVnZXIoYikpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignZ2NkOiB0aGUgYXJndW1lbnQgJyArIGIudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKCEgX2ludGVnZXJJc1plcm8oYikpIHtcbiAgICAgICAgICAgICAgICB0ID0gYTtcbiAgICAgICAgICAgICAgICBhID0gYjtcbiAgICAgICAgICAgICAgICBiID0gX2ludGVnZXJNb2R1bG8odCwgYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcblxuICAgIC8vIGxjbTogc2NoZW1lLW51bWJlciBbc2NoZW1lLW51bWJlciAuLi5dIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbGNtID0gZnVuY3Rpb24oZmlyc3QsIHJlc3QpIHtcbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKGZpcnN0KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ2xjbTogdGhlIGFyZ3VtZW50ICcgKyBmaXJzdC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCBmaXJzdCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IGFicyhmaXJzdCk7XG4gICAgICAgIGlmIChfaW50ZWdlcklzWmVybyhyZXN1bHQpKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHJlc3RbaV0pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ2xjbTogdGhlIGFyZ3VtZW50ICcgKyByZXN0W2ldLnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCByZXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkaXZpc29yID0gX2ludGVnZXJHY2QocmVzdWx0LCByZXN0W2ldKTtcbiAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyhkaXZpc29yKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ID0gZGl2aWRlKG11bHRpcGx5KHJlc3VsdCwgcmVzdFtpXSksIGRpdmlzb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuXG4gICAgdmFyIHF1b3RpZW50ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigncXVvdGllbnQ6IHRoZSBmaXJzdCBhcmd1bWVudCAnICsgeC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCB4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISBpc0ludGVnZXIoeSkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdxdW90aWVudDogdGhlIHNlY29uZCBhcmd1bWVudCAnICsgeS50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCB5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2ludGVnZXJRdW90aWVudCh4LCB5KTtcbiAgICB9O1xuXG5cbiAgICB2YXIgcmVtYWluZGVyID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBpZiAoISBpc0ludGVnZXIoeCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdyZW1haW5kZXI6IHRoZSBmaXJzdCBhcmd1bWVudCAnICsgeC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCB4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISBpc0ludGVnZXIoeSkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdyZW1haW5kZXI6IHRoZSBzZWNvbmQgYXJndW1lbnQgJyArIHkudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyUmVtYWluZGVyKHgsIHkpO1xuICAgIH07XG5cblxuICAgIC8vIEltcGxlbWVudGF0aW9uIG9mIHRoZSBoeXBlcmJvbGljIGZ1bmN0aW9uc1xuICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSHlwZXJib2xpY19jb3NpbmVcbiAgICB2YXIgY29zaCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgaWYgKGVxdih4LCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKDEuMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpdmlkZShhZGQoZXhwKHgpLCBleHAobmVnYXRlKHgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgMik7XG4gICAgfTtcblxuICAgIHZhciBzaW5oID0gZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gZGl2aWRlKHN1YnRyYWN0KGV4cCh4KSwgZXhwKG5lZ2F0ZSh4KSkpLFxuICAgICAgICAgICAgICAgICAgICAgIDIpO1xuICAgIH07XG5cblxuXG4gICAgdmFyIG1ha2VDb21wbGV4UG9sYXIgPSBmdW5jdGlvbihyLCB0aGV0YSkge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGlmIHRoZXRhIGlzIHplcm8sIGp1c3QgcmV0dXJuXG4gICAgICAgIC8vIHRoZSBzY2FsYXIuXG4gICAgICAgIGlmIChlcXYodGhldGEsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UobXVsdGlwbHkociwgY29zKHRoZXRhKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBseShyLCBzaW4odGhldGEpKSk7XG4gICAgfTtcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBIZWxwZXJzXG5cblxuICAgIC8vIElzRmluaXRlOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWYgdGhlIHNjaGVtZSBudW1iZXIgaXMgZmluaXRlIG9yIG5vdC5cbiAgICB2YXIgaXNTY2hlbWVOdW1iZXJGaW5pdGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUobik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbi5pc0Zpbml0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGlzT3ZlcmZsb3c6IGphdmFzY3JpcHQtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWYgd2UgY29uc2lkZXIgdGhlIG51bWJlciBhbiBvdmVyZmxvdy5cbiAgICB2YXIgTUlOX0ZJWE5VTSA9IC0oOWUxNSk7XG4gICAgdmFyIE1BWF9GSVhOVU0gPSAoOWUxNSk7XG4gICAgdmFyIGlzT3ZlcmZsb3cgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAobiA8IE1JTl9GSVhOVU0gfHwgIE1BWF9GSVhOVU0gPCBuKTtcbiAgICB9O1xuXG5cbiAgICAvLyBuZWdhdGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIG11bHRpcGxpZXMgYSBudW1iZXIgdGltZXMgLTEuXG4gICAgdmFyIG5lZ2F0ZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiAtbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5uZWdhdGUoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBoYWx2ZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gRGl2aWRlIGEgbnVtYmVyIGJ5IDIuXG4gICAgdmFyIGhhbHZlID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gZGl2aWRlKG4sIDIpO1xuICAgIH07XG5cblxuICAgIC8vIHRpbWVzSTogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyXG4gICAgLy8gbXVsdGlwbGllcyBhIG51bWJlciB0aW1lcyBpLlxuICAgIHZhciB0aW1lc0kgPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBtdWx0aXBseSh4LCBwbHVzSSk7XG4gICAgfTtcblxuXG4gICAgLy8gZmFzdEV4cHQ6IGNvbXB1dGVzIG5eayBieSBzcXVhcmluZy5cbiAgICAvLyBuXmsgPSAobl4yKV4oay8yKVxuICAgIC8vIEFzc3VtZXMgayBpcyBub24tbmVnYXRpdmUgaW50ZWdlci5cbiAgICB2YXIgZmFzdEV4cHQgPSBmdW5jdGlvbihuLCBrKSB7XG4gICAgICAgIHZhciBhY2MgPSAxO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKGspKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcXVhbHMobW9kdWxvKGssIDIpLCAwKSkge1xuICAgICAgICAgICAgICAgIG4gPSBtdWx0aXBseShuLCBuKTtcbiAgICAgICAgICAgICAgICBrID0gZGl2aWRlKGssIDIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY2MgPSBtdWx0aXBseShhY2MsIG4pO1xuICAgICAgICAgICAgICAgIGsgPSBzdWJ0cmFjdChrLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgLy8gSW50ZWdlciBvcGVyYXRpb25zXG4gICAgLy8gSW50ZWdlcnMgYXJlIGVpdGhlciByZXByZXNlbnRlZCBhcyBmaXhudW1zIG9yIGFzIEJpZ0ludGVnZXJzLlxuXG4gICAgLy8gbWFrZUludGVnZXJCaW5vcDogKGZpeG51bSBmaXhudW0gLT4gWCkgKEJpZ0ludGVnZXIgQmlnSW50ZWdlciAtPiBYKSAtPiBYXG4gICAgLy8gSGVscGVyIHRvIGNvbGxlY3QgdGhlIGNvbW1vbiBsb2dpYyBmb3IgY29lcnNpbmcgaW50ZWdlciBmaXhudW1zIG9yIGJpZ251bXMgdG8gYVxuICAgIC8vIGNvbW1vbiB0eXBlIGJlZm9yZSBkb2luZyBhbiBvcGVyYXRpb24uXG4gICAgdmFyIG1ha2VJbnRlZ2VyQmlub3AgPSBmdW5jdGlvbihvbkZpeG51bXMsIG9uQmlnbnVtcywgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIFJhdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgbSA9IG51bWVyYXRvcihtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobSBpbnN0YW5jZW9mIENvbXBsZXgpIHtcbiAgICAgICAgICAgICAgICBtID0gcmVhbFBhcnQobSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgUmF0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICBuID0gbnVtZXJhdG9yKG4pO1xuICAgICAgICAgICAgfWVsc2UgaWYgKG4gaW5zdGFuY2VvZiBDb21wbGV4KSB7XG4gICAgICAgICAgICAgICAgbiA9IHJlYWxQYXJ0KG4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mKG0pID09PSAnbnVtYmVyJyAmJiB0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9uRml4bnVtcyhtLCBuKTtcbiAgICAgICAgICAgICAgICBpZiAoISBpc092ZXJmbG93KHJlc3VsdCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG9wdGlvbnMuaWdub3JlT3ZlcmZsb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiBGbG9hdFBvaW50IHx8IG4gaW5zdGFuY2VvZiBGbG9hdFBvaW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvbkZpeG51bXModG9GaXhudW0obSksIHRvRml4bnVtKG4pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRml4bnVtcyh0b0ZpeG51bShtKSwgdG9GaXhudW0obikpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKG0pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG0gPSBtYWtlQmlnbnVtKG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBuID0gbWFrZUJpZ251bShuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvbkJpZ251bXMobSwgbik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIHZhciBtYWtlSW50ZWdlclVuT3AgPSBmdW5jdGlvbihvbkZpeG51bXMsIG9uQmlnbnVtcywgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIFJhdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgbSA9IG51bWVyYXRvcihtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobSBpbnN0YW5jZW9mIENvbXBsZXgpIHtcbiAgICAgICAgICAgICAgICBtID0gcmVhbFBhcnQobSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YobSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9uRml4bnVtcyhtKTtcbiAgICAgICAgICAgICAgICBpZiAoISBpc092ZXJmbG93KHJlc3VsdCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG9wdGlvbnMuaWdub3JlT3ZlcmZsb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiBGbG9hdFBvaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uRml4bnVtcyh0b0ZpeG51bShtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKG0pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG0gPSBtYWtlQmlnbnVtKG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9uQmlnbnVtcyhtKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICAvLyBfaW50ZWdlck1vZHVsbzogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJNb2R1bG8gPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSAlIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibk1vZC5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gX2ludGVnZXJHY2Q6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyR2NkID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgdmFyIHQ7XG4gICAgICAgICAgICB3aGlsZSAoYiAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHQgPSBhO1xuICAgICAgICAgICAgICAgIGEgPSBiO1xuICAgICAgICAgICAgICAgIGIgPSB0ICUgYjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5HQ0QuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIF9pbnRlZ2VySXNaZXJvOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgbnVtYmVyIGlzIHplcm8uXG4gICAgdmFyIF9pbnRlZ2VySXNaZXJvID0gbWFrZUludGVnZXJVbk9wKFxuICAgICAgICBmdW5jdGlvbihuKXtcbiAgICAgICAgICAgIHJldHVybiBuID09PSAwO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5FcXVhbHMuY2FsbChuLCBCaWdJbnRlZ2VyLlpFUk8pO1xuICAgICAgICB9XG4gICAgKTtcblxuXG4gICAgLy8gX2ludGVnZXJJc09uZTogaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJJc09uZSA9IG1ha2VJbnRlZ2VyVW5PcChcbiAgICAgICAgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIG4gPT09IDE7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkVxdWFscy5jYWxsKG4sIEJpZ0ludGVnZXIuT05FKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgLy8gX2ludGVnZXJJc05lZ2F0aXZlT25lOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlcklzTmVnYXRpdmVPbmUgPSBtYWtlSW50ZWdlclVuT3AoXG4gICAgICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBuID09PSAtMTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIGJuRXF1YWxzLmNhbGwobiwgQmlnSW50ZWdlci5ORUdBVElWRV9PTkUpO1xuICAgICAgICB9KTtcblxuXG5cbiAgICAvLyBfaW50ZWdlckFkZDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJBZGQgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSArIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkFkZC5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuICAgIC8vIF9pbnRlZ2VyU3VidHJhY3Q6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyU3VidHJhY3QgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSAtIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBiblN1YnRyYWN0LmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gX2ludGVnZXJNdWx0aXBseTogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJNdWx0aXBseSA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtICogbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuTXVsdGlwbHkuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cbiAgICAvL19pbnRlZ2VyUXVvdGllbnQ6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyUXVvdGllbnQgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gKChtIC0gKG0gJSBuKSkvIG4pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5EaXZpZGUuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cbiAgICB2YXIgX2ludGVnZXJSZW1haW5kZXIgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSAlIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBiblJlbWFpbmRlci5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gX2ludGVnZXJEaXZpZGVUb0ZpeG51bTogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBmaXhudW1cbiAgICB2YXIgX2ludGVnZXJEaXZpZGVUb0ZpeG51bSA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtIC8gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIHRvRml4bnVtKG0pIC8gdG9GaXhudW0obik7XG4gICAgICAgIH0sXG4gICAgICAgIHtpZ25vcmVPdmVyZmxvdzogdHJ1ZSxcbiAgICAgICAgIGRvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG5cbiAgICAvLyBfaW50ZWdlckVxdWFsczogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VyRXF1YWxzID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gPT09IG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkVxdWFscy5jYWxsKG0sIG4pO1xuICAgICAgICB9LFxuICAgICAgICB7ZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cbiAgICAvLyBfaW50ZWdlckdyZWF0ZXJUaGFuOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJHcmVhdGVyVGhhbiA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtID4gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuQ29tcGFyZVRvLmNhbGwobSwgbikgPiAwO1xuICAgICAgICB9LFxuICAgICAgICB7ZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cbiAgICAvLyBfaW50ZWdlckxlc3NUaGFuOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJMZXNzVGhhbiA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtIDwgbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuQ29tcGFyZVRvLmNhbGwobSwgbikgPCAwO1xuICAgICAgICB9LFxuICAgICAgICB7ZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cbiAgICAvLyBfaW50ZWdlckdyZWF0ZXJUaGFuT3JFcXVhbDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VyR3JlYXRlclRoYW5PckVxdWFsID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gPj0gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuQ29tcGFyZVRvLmNhbGwobSwgbikgPj0gMDtcbiAgICAgICAgfSxcbiAgICAgICAge2RvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG4gICAgLy8gX2ludGVnZXJMZXNzVGhhbk9yRXF1YWw6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlckxlc3NUaGFuT3JFcXVhbCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtIDw9IG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkNvbXBhcmVUby5jYWxsKG0sIG4pIDw9IDA7XG4gICAgICAgIH0sXG4gICAgICAgIHtkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gVGhlIGJveGVkIG51bWJlciB0eXBlcyBhcmUgZXhwZWN0ZWQgdG8gaW1wbGVtZW50IHRoZSBmb2xsb3dpbmdcbiAgICAvLyBpbnRlcmZhY2UuXG4gICAgLy9cbiAgICAvLyB0b1N0cmluZzogLT4gc3RyaW5nXG5cbiAgICAvLyBsZXZlbDogbnVtYmVyXG5cbiAgICAvLyBsaWZ0VG86IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuXG4gICAgLy8gaXNGaW5pdGU6IC0+IGJvb2xlYW5cblxuICAgIC8vIGlzSW50ZWdlcjogLT4gYm9vbGVhblxuICAgIC8vIFByb2R1Y2UgdHJ1ZSBpZiB0aGlzIG51bWJlciBjYW4gYmUgY29lcnNlZCBpbnRvIGFuIGludGVnZXIuXG5cbiAgICAvLyBpc1JhdGlvbmFsOiAtPiBib29sZWFuXG4gICAgLy8gUHJvZHVjZSB0cnVlIGlmIHRoZSBudW1iZXIgaXMgcmF0aW9uYWwuXG5cbiAgICAvLyBpc1JlYWw6IC0+IGJvb2xlYW5cbiAgICAvLyBQcm9kdWNlIHRydWUgaWYgdGhlIG51bWJlciBpcyByZWFsLlxuXG4gICAgLy8gaXNFeGFjdDogLT4gYm9vbGVhblxuICAgIC8vIFByb2R1Y2UgdHJ1ZSBpZiB0aGUgbnVtYmVyIGlzIGV4YWN0XG5cbiAgICAvLyB0b0V4YWN0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSBhbiBleGFjdCBudW1iZXIuXG5cbiAgICAvLyB0b0ZpeG51bTogLT4gamF2YXNjcmlwdC1udW1iZXJcbiAgICAvLyBQcm9kdWNlIGEgamF2YXNjcmlwdCBudW1iZXIuXG5cbiAgICAvLyBncmVhdGVyVGhhbjogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gQ29tcGFyZSBhZ2FpbnN0IGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBncmVhdGVyVGhhbk9yRXF1YWw6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIENvbXBhcmUgYWdhaW5zdCBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gbGVzc1RoYW46IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIENvbXBhcmUgYWdhaW5zdCBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gbGVzc1RoYW5PckVxdWFsOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBDb21wYXJlIGFnYWluc3QgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIGFkZDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gQWRkIHdpdGggYW4gaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIHN1YnRyYWN0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBTdWJ0cmFjdCB3aXRoIGFuIGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBtdWx0aXBseTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gTXVsdGlwbHkgd2l0aCBhbiBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gZGl2aWRlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBEaXZpZGUgd2l0aCBhbiBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gbnVtZXJhdG9yOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUmV0dXJuIHRoZSBudW1lcmF0b3IuXG5cbiAgICAvLyBkZW5vbWluYXRvcjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFJldHVybiB0aGUgZGVub21pbmF0b3IuXG5cbiAgICAvLyBpbnRlZ2VyU3FydDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGludGVnZXIgc3F1YXJlIHJvb3QuXG5cbiAgICAvLyBzcXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgc3F1YXJlIHJvb3QuXG5cbiAgICAvLyBhYnM6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhYnNvbHV0ZSB2YWx1ZS5cblxuICAgIC8vIGZsb29yOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgZmxvb3IuXG5cbiAgICAvLyBjZWlsaW5nOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY2VpbGluZy5cblxuICAgIC8vIGNvbmp1Z2F0ZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNvbmp1Z2F0ZS5cblxuICAgIC8vIG1hZ25pdHVkZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIG1hZ25pdHVkZS5cblxuICAgIC8vIGxvZzogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGxvZy5cblxuICAgIC8vIGFuZ2xlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYW5nbGUuXG5cbiAgICAvLyBhdGFuOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIHRhbmdlbnQuXG5cbiAgICAvLyBjb3M6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjb3NpbmUuXG5cbiAgICAvLyBzaW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBzaW5lLlxuXG4gICAgLy8gZXhwdDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgcG93ZXIgdG8gdGhlIGlucHV0LlxuXG4gICAgLy8gZXhwOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSBlIHJhaXNlZCB0byB0aGUgZ2l2ZW4gcG93ZXIuXG5cbiAgICAvLyBhY29zOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIGNvc2luZS5cblxuICAgIC8vIGFzaW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgc2luZS5cblxuICAgIC8vIGltYWdpbmFyeVBhcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBpbWFnaW5hcnkgcGFydFxuXG4gICAgLy8gcmVhbFBhcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSByZWFsIHBhcnQuXG5cbiAgICAvLyByb3VuZDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuXG5cbiAgICAvLyBlcXVhbHM6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIFByb2R1Y2UgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbnVtYmVyIG9mIHRoZSBzYW1lIHR5cGUgaXMgZXF1YWwuXG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gUmF0aW9uYWxzXG5cblxuICAgIHZhciBSYXRpb25hbCA9IGZ1bmN0aW9uKG4sIGQpIHtcbiAgICAgICAgdGhpcy5uID0gbjtcbiAgICAgICAgdGhpcy5kID0gZDtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF9pbnRlZ2VySXNPbmUodGhpcy5kKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubi50b1N0cmluZygpICsgXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm4udG9TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5kLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubGV2ZWwgPSAxO1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubGlmdFRvID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDIpXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0UG9pbnQoXG4gICAgICAgICAgICAgICAgX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpO1xuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAzKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KHRoaXMsIDApO1xuICAgICAgICByZXR1cm4gdGhyb3dSdW50aW1lRXJyb3IoXCJpbnZhbGlkIGxldmVsIG9mIE51bWJlclwiLCB0aGlzLCB0YXJnZXQpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNGaW5pdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gKG90aGVyIGluc3RhbmNlb2YgUmF0aW9uYWwgJiZcbiAgICAgICAgICAgICAgICBfaW50ZWdlckVxdWFscyh0aGlzLm4sIG90aGVyLm4pICYmXG4gICAgICAgICAgICAgICAgX2ludGVnZXJFcXVhbHModGhpcy5kLCBvdGhlci5kKSk7XG4gICAgfTtcblxuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNJbnRlZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlcklzT25lKHRoaXMuZCk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc1JhdGlvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNSZWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKF9pbnRlZ2VyQWRkKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5kKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoX2ludGVnZXJTdWJ0cmFjdChfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5kKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZSgtdGhpcy5uLCB0aGlzLmQpXG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLm4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5kKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8odGhpcy5kKSB8fCBfaW50ZWdlcklzWmVybyhvdGhlci5uKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCIvOiBkaXZpc2lvbiBieSB6ZXJvXCIsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS50b0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUudG9JbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLnRvRml4bnVtKCkpO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNJbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUudG9GaXhudW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubnVtZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm47XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5kZW5vbWluYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJHcmVhdGVyVGhhbihfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJHcmVhdGVyVGhhbk9yRXF1YWwoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyTGVzc1RoYW4oX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyTGVzc1RoYW5PckVxdWFsKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pbnRlZ2VyU3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gc3FydCh0aGlzKTtcbiAgICAgICAgaWYgKGlzUmF0aW9uYWwocmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRvRXhhY3QoZmxvb3IocmVzdWx0KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNSZWFsKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0V4YWN0KGZsb29yKHJlc3VsdCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKHRvRXhhY3QoZmxvb3IocmVhbFBhcnQocmVzdWx0KSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvRXhhY3QoZmxvb3IoaW1hZ2luYXJ5UGFydChyZXN1bHQpKSkpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF9pbnRlZ2VyR3JlYXRlclRoYW5PckVxdWFsKHRoaXMubiwgIDApKSB7XG4gICAgICAgICAgICB2YXIgbmV3TiA9IHNxcnQodGhpcy5uKTtcbiAgICAgICAgICAgIHZhciBuZXdEID0gc3FydCh0aGlzLmQpO1xuICAgICAgICAgICAgaWYgKGVxdWFscyhmbG9vcihuZXdOKSwgbmV3TikgJiZcbiAgICAgICAgICAgICAgICBlcXVhbHMoZmxvb3IobmV3RCksIG5ld0QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShuZXdOLCBuZXdEKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0obmV3TiwgbmV3RCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG5ld04gPSBzcXJ0KG5lZ2F0ZSh0aGlzLm4pKTtcbiAgICAgICAgICAgIHZhciBuZXdEID0gc3FydCh0aGlzLmQpO1xuICAgICAgICAgICAgaWYgKGVxdWFscyhmbG9vcihuZXdOKSwgbmV3TikgJiZcbiAgICAgICAgICAgICAgICBlcXVhbHMoZmxvb3IobmV3RCksIG5ld0QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICBSYXRpb25hbC5tYWtlSW5zdGFuY2UobmV3TiwgbmV3RCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0obmV3TiwgbmV3RCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoYWJzKHRoaXMubiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kKTtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZmxvb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHF1b3RpZW50ID0gX2ludGVnZXJRdW90aWVudCh0aGlzLm4sIHRoaXMuZCk7XG4gICAgICAgIGlmIChfaW50ZWdlckxlc3NUaGFuKHRoaXMubiwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWJ0cmFjdChxdW90aWVudCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcXVvdGllbnQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuY2VpbGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcXVvdGllbnQgPSBfaW50ZWdlclF1b3RpZW50KHRoaXMubiwgdGhpcy5kKTtcbiAgICAgICAgaWYgKF9pbnRlZ2VyTGVzc1RoYW4odGhpcy5uLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RpZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFkZChxdW90aWVudCwgMSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLm1hZ25pdHVkZSA9IFJhdGlvbmFsLnByb3RvdHlwZS5hYnM7XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgubG9nKHRoaXMubiAvIHRoaXMuZCkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYW5nbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8odGhpcy5uKSlcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBpZiAoX2ludGVnZXJHcmVhdGVyVGhhbih0aGlzLm4sIDApKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50LnBpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUudGFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgudGFuKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hdGFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXRhbihfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguY29zKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5zaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zaW4oX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmV4cHQgPSBmdW5jdGlvbihhKXtcbiAgICAgICAgaWYgKGlzRXhhY3RJbnRlZ2VyKGEpICYmIGdyZWF0ZXJUaGFuT3JFcXVhbChhLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhc3RFeHB0KHRoaXMsIGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnBvdyhfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0oYS5uLCBhLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5leHAgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5leHAoX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmFjb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hY29zKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXNpbihfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaW1hZ2luYXJ5UGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUucmVhbFBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUucm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRklYTUU6IG5vdCBjb3JyZWN0IHdoZW4gdmFsdWVzIGFyZSBiaWdudW1zXG4gICAgICAgIGlmIChlcXVhbHModGhpcy5kLCAyKSkge1xuICAgICAgICAgICAgLy8gUm91bmQgdG8gZXZlbiBpZiBpdCdzIGEgbi8yXG4gICAgICAgICAgICB2YXIgdiA9IF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpO1xuICAgICAgICAgICAgdmFyIGZsID0gTWF0aC5mbG9vcih2KTtcbiAgICAgICAgICAgIHZhciBjZSA9IE1hdGguY2VpbCh2KTtcbiAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyhmbCAlIDIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy5uIC8gdGhpcy5kKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLm1ha2VJbnN0YW5jZSA9IGZ1bmN0aW9uKG4sIGQpIHtcbiAgICAgICAgaWYgKG4gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwibiB1bmRlZmluZWRcIiwgbiwgZCk7XG5cbiAgICAgICAgaWYgKGQgPT09IHVuZGVmaW5lZCkgeyBkID0gMTsgfVxuXG4gICAgICAgIGlmIChfaW50ZWdlcklzWmVybyhkKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJkaXZpc2lvbiBieSB6ZXJvOiBcIituK1wiL1wiK2QpO1xuICAgICAgICB9XG5cbiAgaWYgKF9pbnRlZ2VyTGVzc1RoYW4oZCwgMCkpIHtcbiAgICAgICAgICAgIG4gPSBuZWdhdGUobik7XG4gICAgICAgICAgICBkID0gbmVnYXRlKGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpdmlzb3IgPSBfaW50ZWdlckdjZChhYnMobiksIGFicyhkKSk7XG4gICAgICAgIG4gPSBfaW50ZWdlclF1b3RpZW50KG4sIGRpdmlzb3IpO1xuICAgICAgICBkID0gX2ludGVnZXJRdW90aWVudChkLCBkaXZpc29yKTtcblxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IGlmIHdlIGNhbiBnZXQgYXJvdW5kIGNvbnN0cnVjdGlvbiB0aGUgcmF0aW9uYWxcbiAgICAgICAgLy8gaW4gZmF2b3Igb2YganVzdCByZXR1cm5pbmcgbiwgZG8gaXQ6XG4gICAgICAgIGlmIChfaW50ZWdlcklzT25lKGQpIHx8IF9pbnRlZ2VySXNaZXJvKG4pKSB7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUmF0aW9uYWwobiwgZCk7XG4gICAgfTtcblxuXG5cbiAgICAvLyBGbG9hdGluZyBQb2ludCBudW1iZXJzXG4gICAgdmFyIEZsb2F0UG9pbnQgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMubiA9IG47XG4gICAgfTtcbiAgICBGbG9hdFBvaW50ID0gRmxvYXRQb2ludDtcblxuXG4gICAgdmFyIE5hTiA9IG5ldyBGbG9hdFBvaW50KE51bWJlci5OYU4pO1xuICAgIHZhciBpbmYgPSBuZXcgRmxvYXRQb2ludChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgIHZhciBuZWdpbmYgPSBuZXcgRmxvYXRQb2ludChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xuXG4gICAgLy8gV2UgdXNlIHRoZXNlIHR3byBjb25zdGFudHMgdG8gcmVwcmVzZW50IHRoZSBmbG9hdGluZy1wb2ludCBjb2Vyc2lvblxuICAgIC8vIG9mIGJpZ251bXMgdGhhdCBjYW4ndCBiZSByZXByZXNlbnRlZCB3aXRoIGZpZGVsaXR5LlxuICAgIHZhciBUT09fUE9TSVRJVkVfVE9fUkVQUkVTRU5UID0gbmV3IEZsb2F0UG9pbnQoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKTtcbiAgICB2YXIgVE9PX05FR0FUSVZFX1RPX1JFUFJFU0VOVCA9IG5ldyBGbG9hdFBvaW50KE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7XG5cbiAgICAvLyBOZWdhdGl2ZSB6ZXJvIGlzIGEgZGlzdGluZ3Vpc2hlZCB2YWx1ZSByZXByZXNlbnRpbmcgLTAuMC5cbiAgICAvLyBUaGVyZSBzaG91bGQgb25seSBiZSBvbmUgaW5zdGFuY2UgZm9yIC0wLjAuXG4gICAgdmFyIE5FR0FUSVZFX1pFUk8gPSBuZXcgRmxvYXRQb2ludCgtMC4wKTtcbiAgICB2YXIgSU5FWEFDVF9aRVJPID0gbmV3IEZsb2F0UG9pbnQoMC4wKTtcblxuICAgIEZsb2F0UG9pbnQucGkgPSBuZXcgRmxvYXRQb2ludChNYXRoLlBJKTtcbiAgICBGbG9hdFBvaW50LmUgPSBuZXcgRmxvYXRQb2ludChNYXRoLkUpO1xuICAgIEZsb2F0UG9pbnQubmFuID0gTmFOO1xuICAgIEZsb2F0UG9pbnQuaW5mID0gaW5mO1xuICAgIEZsb2F0UG9pbnQubmVnaW5mID0gbmVnaW5mO1xuXG4gICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChpc05hTihuKSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubmFuO1xuICAgICAgICB9IGVsc2UgaWYgKG4gPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQuaW5mO1xuICAgICAgICB9IGVsc2UgaWYgKG4gPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubmVnaW5mO1xuICAgICAgICB9IGVsc2UgaWYgKG4gPT09IDApIHtcbiAgICAgICAgICAgIGlmICgoMS9uKSA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE5FR0FUSVZFX1pFUk87XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBJTkVYQUNUX1pFUk87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBGbG9hdFBvaW50KG4pO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNGaW5pdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChpc0Zpbml0ZSh0aGlzLm4pIHx8XG4gICAgICAgICAgICAgICAgdGhpcyA9PT0gVE9PX1BPU0lUSVZFX1RPX1JFUFJFU0VOVCB8fFxuICAgICAgICAgICAgICAgIHRoaXMgPT09IFRPT19ORUdBVElWRV9UT19SRVBSRVNFTlQpO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnRvRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVGhlIHByZWNpc2lvbiBvZiBpZWVlIGlzIGFib3V0IDE2IGRlY2ltYWwgZGlnaXRzLCB3aGljaCB3ZSB1c2UgaGVyZS5cbiAgICAgICAgaWYgKCEgaXNGaW5pdGUodGhpcy5uKSB8fCBpc05hTih0aGlzLm4pKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcInRvRXhhY3Q6IG5vIGV4YWN0IHJlcHJlc2VudGF0aW9uIGZvciBcIiArIHRoaXMsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0cmluZ1JlcCA9IHRoaXMubi50b1N0cmluZygpO1xuICAgICAgICB2YXIgbWF0Y2ggPSBzdHJpbmdSZXAubWF0Y2goL14oLiopXFwuKC4qKSQvKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW50UGFydCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgICAgIHZhciBmcmFjUGFydCA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgIHZhciB0ZW5Ub0RlY2ltYWxQbGFjZXMgPSBNYXRoLnBvdygxMCwgbWF0Y2hbMl0ubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoTWF0aC5yb3VuZCh0aGlzLm4gKiB0ZW5Ub0RlY2ltYWxQbGFjZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5Ub0RlY2ltYWxQbGFjZXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS50b0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5sZXZlbCA9IDI7XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmxpZnRUbyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAzKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KHRoaXMsIDApO1xuICAgICAgICByZXR1cm4gdGhyb3dSdW50aW1lRXJyb3IoXCJpbnZhbGlkIGxldmVsIG9mIE51bWJlclwiLCB0aGlzLCB0YXJnZXQpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNOYU4odGhpcy5uKSlcbiAgICAgICAgICAgIHJldHVybiBcIituYW4uMFwiO1xuICAgICAgICBpZiAodGhpcy5uID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICAgICAgICByZXR1cm4gXCIraW5mLjBcIjtcbiAgICAgICAgaWYgKHRoaXMubiA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICAgICAgICAgICAgcmV0dXJuIFwiLWluZi4wXCI7XG4gICAgICAgIGlmICh0aGlzID09PSBORUdBVElWRV9aRVJPKVxuICAgICAgICAgICAgcmV0dXJuIFwiLTAuMFwiO1xuICAgICAgICB2YXIgcGFydGlhbFJlc3VsdCA9IHRoaXMubi50b1N0cmluZygpO1xuICAgICAgICBpZiAoISBwYXJ0aWFsUmVzdWx0Lm1hdGNoKCdcXFxcLicpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydGlhbFJlc3VsdCArIFwiLjBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWFsUmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24ob3RoZXIsIGFVbmlvbkZpbmQpIHtcbiAgICAgICAgcmV0dXJuICgob3RoZXIgaW5zdGFuY2VvZiBGbG9hdFBvaW50KSAmJlxuICAgICAgICAgICAgICAgICgodGhpcy5uID09PSBvdGhlci5uKSkpO1xuICAgIH07XG5cblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNSYXRpb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0Zpbml0ZSgpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc0ludGVnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGaW5pdGUoKSAmJiB0aGlzLm4gPT09IE1hdGguZmxvb3IodGhpcy5uKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNSZWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cblxuICAgIC8vIHNpZ246IE51bWJlciAtPiB7LTEsIDAsIDF9XG4gICAgdmFyIHNpZ24gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChsZXNzVGhhbihuLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGdyZWF0ZXJUaGFuKG4sIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmIChuID09PSBORUdBVElWRV9aRVJPKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRmluaXRlKCkgJiYgb3RoZXIuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMubiArIG90aGVyLm4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMubikgfHwgaXNOYU4ob3RoZXIubikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRmluaXRlKCkgJiYgISBvdGhlci5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG90aGVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0Zpbml0ZSgpICYmIG90aGVyLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoc2lnbih0aGlzKSAqIHNpZ24ob3RoZXIpID09PSAxKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzIDogTmFOKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5pc0Zpbml0ZSgpICYmIG90aGVyLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLm4gLSBvdGhlci5uKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc05hTih0aGlzLm4pIHx8IGlzTmFOKG90aGVyLm4pKSB7XG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9IGVsc2UgaWYgKCEgdGhpcy5pc0Zpbml0ZSgpICYmICEgb3RoZXIuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgaWYgKHNpZ24odGhpcykgPT09IHNpZ24ob3RoZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbXVsdGlwbHkob3RoZXIsIC0xKTtcbiAgICAgICAgfSBlbHNlIHsgIC8vIG90aGVyLmlzRmluaXRlKClcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSgtdGhpcy5uKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy5uICogb3RoZXIubik7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLm4gLyBvdGhlci5uKTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS50b0ZpeG51bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5udW1lcmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0cmluZ1JlcCA9IHRoaXMubi50b1N0cmluZygpO1xuICAgICAgICB2YXIgbWF0Y2ggPSBzdHJpbmdSZXAubWF0Y2goL14oLiopXFwuKC4qKSQvKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgYWZ0ZXJEZWNpbWFsID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgdmFyIGZhY3RvclRvSW50ID0gTWF0aC5wb3coMTAsIG1hdGNoWzJdLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgZXh0cmFGYWN0b3IgPSBfaW50ZWdlckdjZChmYWN0b3JUb0ludCwgYWZ0ZXJEZWNpbWFsKTtcbiAgICAgICAgICAgIHZhciBtdWx0RmFjdG9yID0gZmFjdG9yVG9JbnQgLyBleHRyYUZhY3RvcjtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSggTWF0aC5yb3VuZCh0aGlzLm4gKiBtdWx0RmFjdG9yKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZGVub21pbmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0cmluZ1JlcCA9IHRoaXMubi50b1N0cmluZygpO1xuICAgICAgICB2YXIgbWF0Y2ggPSBzdHJpbmdSZXAubWF0Y2goL14oLiopXFwuKC4qKSQvKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgYWZ0ZXJEZWNpbWFsID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgdmFyIGZhY3RvclRvSW50ID0gTWF0aC5wb3coMTAsIG1hdGNoWzJdLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgZXh0cmFGYWN0b3IgPSBfaW50ZWdlckdjZChmYWN0b3JUb0ludCwgYWZ0ZXJEZWNpbWFsKTtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSggTWF0aC5yb3VuZChmYWN0b3JUb0ludC9leHRyYUZhY3RvcikgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSgxKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmZsb29yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmZsb29yKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5jZWlsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmNlaWwodGhpcy5uKSk7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5uID4gb3RoZXIubjtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubiA+PSBvdGhlci5uO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm4gPCBvdGhlci5uO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5uIDw9IG90aGVyLm47XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaW50ZWdlclNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IE5FR0FUSVZFX1pFUk8pIHsgcmV0dXJuIHRoaXM7IH1cbiAgICAgICAgaWYgKGlzSW50ZWdlcih0aGlzKSkge1xuICAgICAgICAgICAgaWYodGhpcy5uID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5mbG9vcihNYXRoLnNxcnQodGhpcy5uKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgIElORVhBQ1RfWkVSTyxcbiAgICAgICAgICAgICAgICAgICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5mbG9vcihNYXRoLnNxcnQoLXRoaXMubikpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImludGVnZXJTcXJ0OiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIGFuIGludGVnZXJcIiwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5uIDwgMCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zcXJ0KC10aGlzLm4pKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc3FydCh0aGlzLm4pKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYWJzKHRoaXMubikpO1xuICAgIH07XG5cblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMubiA8IDApXG4gICAgICAgICAgICByZXR1cm4gKG5ldyBDb21wbGV4KHRoaXMsIDApKS5sb2coKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgubG9nKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICgwID09PSB0aGlzLm4pXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgaWYgKHRoaXMubiA+IDApXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQucGk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnRhbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnRhbih0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYXRhbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmF0YW4odGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmNvcyh0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc2luKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5leHB0ID0gZnVuY3Rpb24oYSl7XG4gICAgICAgIGlmICh0aGlzLm4gPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChhLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNOYU4oYS5uKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgucG93KHRoaXMubiwgYS5uKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZXhwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZXhwKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYWNvcyh0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYXNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFzaW4odGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmltYWdpbmFyeVBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUucmVhbFBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChpc0Zpbml0ZSh0aGlzLm4pKSB7XG4gICAgICAgICAgICBpZiAodGhpcyA9PT0gTkVHQVRJVkVfWkVSTykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKE1hdGguZmxvb3IodGhpcy5uKSAtIHRoaXMubikgPT09IDAuNSkge1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLmZsb29yKHRoaXMubikgJSAyID09PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5mbG9vcih0aGlzLm4pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5jZWlsKHRoaXMubikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5yb3VuZCh0aGlzLm4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuY29uanVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5tYWduaXR1ZGUgPSBGbG9hdFBvaW50LnByb3RvdHlwZS5hYnM7XG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbXBsZXggbnVtYmVyc1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIHZhciBDb21wbGV4ID0gZnVuY3Rpb24ociwgaSl7XG4gICAgICAgIHRoaXMuciA9IHI7XG4gICAgICAgIHRoaXMuaSA9IGk7XG4gICAgfTtcblxuICAgIC8vIENvbnN0cnVjdHMgYSBjb21wbGV4IG51bWJlciBmcm9tIHR3byBiYXNpYyBudW1iZXIgciBhbmQgaS4gIHIgYW5kIGkgY2FuXG4gICAgLy8gZWl0aGVyIGJlIHBsdC50eXBlLlJhdGlvbmFsIG9yIHBsdC50eXBlLkZsb2F0UG9pbnQuXG4gICAgQ29tcGxleC5tYWtlSW5zdGFuY2UgPSBmdW5jdGlvbihyLCBpKXtcbiAgICAgICAgaWYgKGkgPT09IHVuZGVmaW5lZCkgeyBpID0gMDsgfVxuICAgICAgICBpZiAoaXNFeGFjdChpKSAmJiBpc0ludGVnZXIoaSkgJiYgX2ludGVnZXJJc1plcm8oaSkpIHtcbiAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0luZXhhY3QocikgfHwgaXNJbmV4YWN0KGkpKSB7XG4gICAgICAgICAgICByID0gdG9JbmV4YWN0KHIpO1xuICAgICAgICAgICAgaSA9IHRvSW5leGFjdChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IENvbXBsZXgociwgaSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWFsUGFydCA9IHRoaXMuci50b1N0cmluZygpLCBpbWFnUGFydCA9IHRoaXMuaS50b1N0cmluZygpO1xuICAgICAgICBpZiAoaW1hZ1BhcnRbMF0gPT09ICctJyB8fCBpbWFnUGFydFswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVhbFBhcnQgKyBpbWFnUGFydCArICdpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZWFsUGFydCArIFwiK1wiICsgaW1hZ1BhcnQgKyAnaSc7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc0Zpbml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNTY2hlbWVOdW1iZXJGaW5pdGUodGhpcy5yKSAmJiBpc1NjaGVtZU51bWJlckZpbml0ZSh0aGlzLmkpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzUmF0aW9uYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzUmF0aW9uYWwodGhpcy5yKSAmJiBlcXYodGhpcy5pLCAwKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNJbnRlZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoaXNJbnRlZ2VyKHRoaXMucikgJiZcbiAgICAgICAgICAgICAgICBlcXYodGhpcy5pLCAwKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnRvRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKCB0b0V4YWN0KHRoaXMuciksIHRvRXhhY3QodGhpcy5pKSApO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS50b0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKHRvSW5leGFjdCh0aGlzLnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9JbmV4YWN0KHRoaXMuaSkpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzRXhhY3QodGhpcy5yKSAmJiBpc0V4YWN0KHRoaXMuaSk7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNJbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0luZXhhY3QodGhpcy5yKSB8fCBpc0luZXhhY3QodGhpcy5pKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5sZXZlbCA9IDM7XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmxpZnRUbyA9IGZ1bmN0aW9uKHRhcmdldCl7XG4gICAgICAgIHRocm93UnVudGltZUVycm9yKFwiRG9uJ3Qga25vdyBob3cgdG8gbGlmdCBDb21wbGV4IG51bWJlclwiLCB0aGlzLCB0YXJnZXQpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gKChvdGhlciBpbnN0YW5jZW9mIENvbXBsZXgpICYmXG4gICAgICAgICAgICAgICAgICAgICAgKGVxdWFscyh0aGlzLnIsIG90aGVyLnIpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgIChlcXVhbHModGhpcy5pLCBvdGhlci5pKSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAoISB0aGlzLmlzUmVhbCgpIHx8ICEgb3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPjogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JlYXRlclRoYW4odGhpcy5yLCBvdGhlci5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKCEgdGhpcy5pc1JlYWwoKSB8fCAhIG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIj49OiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcywgb3RoZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBncmVhdGVyVGhhbk9yRXF1YWwodGhpcy5yLCBvdGhlci5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAoISB0aGlzLmlzUmVhbCgpIHx8ICEgb3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPDogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVzc1RoYW4odGhpcy5yLCBvdGhlci5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKCEgdGhpcy5pc1JlYWwoKSB8fCAhIG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIjw9OiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcywgb3RoZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZXNzVGhhbk9yRXF1YWwodGhpcy5yLCBvdGhlci5yKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIWVxdWFscyh0aGlzLmksIDApLnZhbHVlT2YoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiYWJzOiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiBhYnModGhpcy5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUudG9GaXhudW0gPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIWVxdWFscyh0aGlzLmksIDApLnZhbHVlT2YoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwidG9GaXhudW06IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRvRml4bnVtKHRoaXMucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLm51bWVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIm51bWVyYXRvcjogY2FuIG9ubHkgYmUgYXBwbGllZCB0byByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIG51bWVyYXRvcih0aGlzLm4pO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmRlbm9taW5hdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiZmxvb3I6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiBkZW5vbWluYXRvcih0aGlzLm4pO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgIGFkZCh0aGlzLnIsIG90aGVyLnIpLFxuICAgICAgICAgICAgYWRkKHRoaXMuaSwgb3RoZXIuaSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG90aGVyKXtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgc3VidHJhY3QodGhpcy5yLCBvdGhlci5yKSxcbiAgICAgICAgICAgIHN1YnRyYWN0KHRoaXMuaSwgb3RoZXIuaSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKG5lZ2F0ZSh0aGlzLnIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmVnYXRlKHRoaXMuaSkpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24ob3RoZXIpe1xuICAgICAgICAvLyBJZiB0aGUgb3RoZXIgdmFsdWUgaXMgcmVhbCwganVzdCBkbyBwcmltaXRpdmUgZGl2aXNpb25cbiAgICAgICAgaWYgKG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5yLCBvdGhlci5yKSxcbiAgICAgICAgICAgICAgICBtdWx0aXBseSh0aGlzLmksIG90aGVyLnIpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHN1YnRyYWN0KFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5yLCBvdGhlci5yKSxcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuaSwgb3RoZXIuaSkpO1xuICAgICAgICB2YXIgaSA9IGFkZChcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuciwgb3RoZXIuaSksXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLmksIG90aGVyLnIpKTtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKHIsIGkpO1xuICAgIH07XG5cblxuXG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uKG90aGVyKXtcbiAgICAgICAgdmFyIGEsIGIsIGMsIGQsIHIsIHgsIHk7XG4gICAgICAgIC8vIElmIHRoZSBvdGhlciB2YWx1ZSBpcyByZWFsLCBqdXN0IGRvIHByaW1pdGl2ZSBkaXZpc2lvblxuICAgICAgICBpZiAob3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICBkaXZpZGUodGhpcy5yLCBvdGhlci5yKSxcbiAgICAgICAgICAgICAgICBkaXZpZGUodGhpcy5pLCBvdGhlci5yKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0luZXhhY3QoKSB8fCBvdGhlci5pc0luZXhhY3QoKSkge1xuICAgICAgICAgICAgLy8gaHR0cDovL3BvcnRhbC5hY20ub3JnL2NpdGF0aW9uLmNmbT9pZD0xMDM5ODE0XG4gICAgICAgICAgICAvLyBXZSBjdXJyZW50bHkgdXNlIFNtaXRoJ3MgbWV0aG9kLCB0aG91Z2ggd2Ugc2hvdWxkXG4gICAgICAgICAgICAvLyBwcm9iYWJseSBzd2l0Y2ggb3ZlciB0byBQcmllc3QncyBtZXRob2QuXG4gICAgICAgICAgICBhID0gdGhpcy5yO1xuICAgICAgICAgICAgYiA9IHRoaXMuaTtcbiAgICAgICAgICAgIGMgPSBvdGhlci5yO1xuICAgICAgICAgICAgZCA9IG90aGVyLmk7XG4gICAgICAgICAgICBpZiAobGVzc1RoYW5PckVxdWFsKGFicyhkKSwgYWJzKGMpKSkge1xuICAgICAgICAgICAgICAgIHIgPSBkaXZpZGUoZCwgYyk7XG4gICAgICAgICAgICAgICAgeCA9IGRpdmlkZShhZGQoYSwgbXVsdGlwbHkoYiwgcikpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkKGMsIG11bHRpcGx5KGQsIHIpKSk7XG4gICAgICAgICAgICAgICAgeSA9IGRpdmlkZShzdWJ0cmFjdChiLCBtdWx0aXBseShhLCByKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQoYywgbXVsdGlwbHkoZCwgcikpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgciA9IGRpdmlkZShjLCBkKTtcbiAgICAgICAgICAgICAgICB4ID0gZGl2aWRlKGFkZChtdWx0aXBseShhLCByKSwgYiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQobXVsdGlwbHkoYywgciksIGQpKTtcbiAgICAgICAgICAgICAgICB5ID0gZGl2aWRlKHN1YnRyYWN0KG11bHRpcGx5KGIsIHIpLCBhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZChtdWx0aXBseShjLCByKSwgZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKHgsIHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNvbiA9IGNvbmp1Z2F0ZShvdGhlcik7XG4gICAgICAgICAgICB2YXIgdXAgPSBtdWx0aXBseSh0aGlzLCBjb24pO1xuXG4gICAgICAgICAgICAvLyBEb3duIGlzIGd1YXJhbnRlZWQgdG8gYmUgcmVhbCBieSB0aGlzIHBvaW50LlxuICAgICAgICAgICAgdmFyIGRvd24gPSByZWFsUGFydChtdWx0aXBseShvdGhlciwgY29uKSk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICBkaXZpZGUocmVhbFBhcnQodXApLCBkb3duKSxcbiAgICAgICAgICAgICAgICBkaXZpZGUoaW1hZ2luYXJ5UGFydCh1cCksIGRvd24pKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuY29uanVnYXRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgdGhpcy5yLFxuICAgICAgICAgICAgc3VidHJhY3QoMCwgdGhpcy5pKSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubWFnbml0dWRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHN1bSA9IGFkZChcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuciwgdGhpcy5yKSxcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuaSwgdGhpcy5pKSk7XG4gICAgICAgIHJldHVybiBzcXJ0KHN1bSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzUmVhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBlcXYodGhpcy5pLCAwKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaW50ZWdlclNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlzSW50ZWdlcih0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGludGVnZXJTcXJ0KHRoaXMucik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImludGVnZXJTcXJ0OiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIGFuIGludGVnZXJcIiwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgcmV0dXJuIHNxcnQodGhpcy5yKTtcbiAgICAgICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcXVhcmVfcm9vdCNTcXVhcmVfcm9vdHNfb2ZfbmVnYXRpdmVfYW5kX2NvbXBsZXhfbnVtYmVyc1xuICAgICAgICB2YXIgcl9wbHVzX3ggPSBhZGQodGhpcy5tYWduaXR1ZGUoKSwgdGhpcy5yKTtcblxuICAgICAgICB2YXIgciA9IHNxcnQoaGFsdmUocl9wbHVzX3gpKTtcblxuICAgICAgICB2YXIgaSA9IGRpdmlkZSh0aGlzLmksIHNxcnQobXVsdGlwbHkocl9wbHVzX3gsIDIpKSk7XG5cblxuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UociwgaSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtID0gdGhpcy5tYWduaXR1ZGUoKTtcbiAgICAgICAgdmFyIHRoZXRhID0gdGhpcy5hbmdsZSgpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gYWRkKFxuICAgICAgICAgICAgbG9nKG0pLFxuICAgICAgICAgICAgdGltZXNJKHRoZXRhKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmFuZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBhbmdsZSh0aGlzLnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcXVhbHMoMCwgdGhpcy5yKSkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGhhbHZlKEZsb2F0UG9pbnQucGkpO1xuICAgICAgICAgICAgcmV0dXJuIGdyZWF0ZXJUaGFuKHRoaXMuaSwgMCkgP1xuICAgICAgICAgICAgICAgIHRtcCA6IG5lZ2F0ZSh0bXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGF0YW4oZGl2aWRlKGFicyh0aGlzLmkpLCBhYnModGhpcy5yKSkpO1xuICAgICAgICAgICAgaWYgKGdyZWF0ZXJUaGFuKHRoaXMuciwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JlYXRlclRoYW4odGhpcy5pLCAwKSA/XG4gICAgICAgICAgICAgICAgICAgIHRtcCA6IG5lZ2F0ZSh0bXApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JlYXRlclRoYW4odGhpcy5pLCAwKSA/XG4gICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KEZsb2F0UG9pbnQucGksIHRtcCkgOiBzdWJ0cmFjdCh0bXAsIEZsb2F0UG9pbnQucGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBwbHVzSSA9IENvbXBsZXgubWFrZUluc3RhbmNlKDAsIDEpO1xuICAgIHZhciBtaW51c0kgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLCAtMSk7XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLnRhbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGl2aWRlKHRoaXMuc2luKCksIHRoaXMuY29zKCkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hdGFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKGVxdWFscyh0aGlzLCBwbHVzSSkgfHxcbiAgICAgICAgICAgIGVxdWFscyh0aGlzLCBtaW51c0kpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmVnaW5mO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtdWx0aXBseShcbiAgICAgICAgICAgIHBsdXNJLFxuICAgICAgICAgICAgbXVsdGlwbHkoXG4gICAgICAgICAgICAgICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoMC41KSxcbiAgICAgICAgICAgICAgICBsb2coZGl2aWRlKFxuICAgICAgICAgICAgICAgICAgICBhZGQocGx1c0ksIHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBhZGQoXG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVzSSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KDAsIHRoaXMpKSkpKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgcmV0dXJuIGNvcyh0aGlzLnIpO1xuICAgICAgICB2YXIgaXogPSB0aW1lc0kodGhpcyk7XG4gICAgICAgIHZhciBpel9uZWdhdGUgPSBuZWdhdGUoaXopO1xuXG4gICAgICAgIHJldHVybiBoYWx2ZShhZGQoZXhwKGl6KSwgZXhwKGl6X25lZ2F0ZSkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICByZXR1cm4gc2luKHRoaXMucik7XG4gICAgICAgIHZhciBpeiA9IHRpbWVzSSh0aGlzKTtcbiAgICAgICAgdmFyIGl6X25lZ2F0ZSA9IG5lZ2F0ZShpeik7XG4gICAgICAgIHZhciB6MiA9IENvbXBsZXgubWFrZUluc3RhbmNlKDAsIDIpO1xuICAgICAgICB2YXIgZXhwX25lZ2F0ZSA9IHN1YnRyYWN0KGV4cChpeiksIGV4cChpel9uZWdhdGUpKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGRpdmlkZShleHBfbmVnYXRlLCB6Mik7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZXhwdCA9IGZ1bmN0aW9uKHkpe1xuICAgICAgICBpZiAoaXNFeGFjdEludGVnZXIoeSkgJiYgZ3JlYXRlclRoYW5PckVxdWFsKHksIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFzdEV4cHQodGhpcywgeSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGV4cG8gPSBtdWx0aXBseSh5LCB0aGlzLmxvZygpKTtcbiAgICAgICAgcmV0dXJuIGV4cChleHBvKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZXhwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHIgPSBleHAodGhpcy5yKTtcbiAgICAgICAgdmFyIGNvc19hID0gY29zKHRoaXMuaSk7XG4gICAgICAgIHZhciBzaW5fYSA9IHNpbih0aGlzLmkpO1xuXG4gICAgICAgIHJldHVybiBtdWx0aXBseShcbiAgICAgICAgICAgIHIsXG4gICAgICAgICAgICBhZGQoY29zX2EsIHRpbWVzSShzaW5fYSkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYWNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgcmV0dXJuIGFjb3ModGhpcy5yKTtcbiAgICAgICAgdmFyIHBpX2hhbGYgPSBoYWx2ZShGbG9hdFBvaW50LnBpKTtcbiAgICAgICAgdmFyIGl6ID0gdGltZXNJKHRoaXMpO1xuICAgICAgICB2YXIgcm9vdCA9IHNxcnQoc3VidHJhY3QoMSwgc3FyKHRoaXMpKSk7XG4gICAgICAgIHZhciBsID0gdGltZXNJKGxvZyhhZGQoaXosIHJvb3QpKSk7XG4gICAgICAgIHJldHVybiBhZGQocGlfaGFsZiwgbCk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmFzaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHJldHVybiBhc2luKHRoaXMucik7XG5cbiAgICAgICAgdmFyIG9uZU5lZ2F0ZVRoaXNTcSA9XG4gICAgICAgICAgICBzdWJ0cmFjdCgxLCBzcXIodGhpcykpO1xuICAgICAgICB2YXIgc3FydE9uZU5lZ2F0ZVRoaXNTcSA9IHNxcnQob25lTmVnYXRlVGhpc1NxKTtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5KDIsIGF0YW4oZGl2aWRlKHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQoMSwgc3FydE9uZU5lZ2F0ZVRoaXNTcSkpKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmNlaWxpbmcgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImNlaWxpbmc6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiBjZWlsaW5nKHRoaXMucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmZsb29yID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJmbG9vcjogY2FuIG9ubHkgYmUgYXBwbGllZCB0byByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGZsb29yKHRoaXMucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmltYWdpbmFyeVBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5pO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5yZWFsUGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnI7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnJvdW5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJyb3VuZDogY2FuIG9ubHkgYmUgYXBwbGllZCB0byByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHJvdW5kKHRoaXMucik7XG4gICAgfTtcblxuXG5cbiAgICB2YXIgaGFzaE1vZGlmaWVyc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJeKCNbZWldI1tib2R4XXwjW2JvZHhdI1tlaV18I1tib2R4ZWldKSguKikkXCIpXG4gICAgZnVuY3Rpb24gcmF0aW9uYWxSZWdleHAoZGlnaXRzKSB7IHJldHVybiBuZXcgUmVnRXhwKFwiXihbKy1dP1tcIitkaWdpdHMrXCJdKykvKFtcIitkaWdpdHMrXCJdKykkXCIpOyB9XG4gICAgZnVuY3Rpb24gbWF0Y2hDb21wbGV4UmVnZXhwKHJhZGl4LCB4KSB7XG4gICAgICAgIHZhciBzaWduID0gXCJbKy1dXCI7XG4gICAgICAgIHZhciBtYXliZVNpZ24gPSBcIlsrLV0/XCI7XG4gICAgICAgIHZhciBkaWdpdHMgPSBkaWdpdHNGb3JSYWRpeChyYWRpeClcbiAgICAgICAgdmFyIGV4cG1hcmsgPSBcIltcIitleHBNYXJrRm9yUmFkaXgocmFkaXgpK1wiXVwiXG4gICAgICAgIHZhciBkaWdpdFNlcXVlbmNlID0gXCJbXCIrZGlnaXRzK1wiXStcIlxuXG4gICAgICAgIHZhciB1bnNpZ25lZFJhdGlvbmFsID0gZGlnaXRTZXF1ZW5jZStcIi9cIitkaWdpdFNlcXVlbmNlXG4gICAgICAgIHZhciByYXRpb25hbCA9IG1heWJlU2lnbiArIHVuc2lnbmVkUmF0aW9uYWxcblxuICAgICAgICB2YXIgbm9EZWNpbWFsID0gZGlnaXRTZXF1ZW5jZVxuICAgICAgICB2YXIgZGVjaW1hbE51bU9uUmlnaHQgPSBcIltcIitkaWdpdHMrXCJdKlxcXFwuW1wiK2RpZ2l0cytcIl0rXCJcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PbkxlZnQgPSBcIltcIitkaWdpdHMrXCJdK1xcXFwuW1wiK2RpZ2l0cytcIl0qXCJcblxuICAgICAgICB2YXIgdW5zaWduZWREZWNpbWFsID0gXCIoPzpcIiArIG5vRGVjaW1hbCArIFwifFwiICsgZGVjaW1hbE51bU9uUmlnaHQgKyBcInxcIiArIGRlY2ltYWxOdW1PbkxlZnQgKyBcIilcIlxuXG4gICAgICAgIHZhciBzcGVjaWFsID0gXCIoPzppbmZcXC4wfG5hblxcLjB8aW5mXFwuZnxuYW5cXC5mKVwiXG5cbiAgICAgICAgdmFyIHVuc2lnbmVkUmVhbE5vRXhwID0gXCIoPzpcIiArIHVuc2lnbmVkRGVjaW1hbCArIFwifFwiICsgdW5zaWduZWRSYXRpb25hbCArIFwiKVwiXG4gICAgICAgIHZhciB1bnNpZ25lZFJlYWwgPSB1bnNpZ25lZFJlYWxOb0V4cCArIFwiKD86XCIgKyBleHBtYXJrICsgbWF5YmVTaWduICsgZGlnaXRTZXF1ZW5jZSArIFwiKT9cIlxuICAgICAgICB2YXIgdW5zaWduZWRSZWFsT3JTcGVjaWFsID0gXCIoPzpcIiArIHVuc2lnbmVkUmVhbCArIFwifFwiICsgc3BlY2lhbCArIFwiKVwiXG4gICAgICAgIHZhciByZWFsID0gXCIoPzpcIiArIG1heWJlU2lnbiArIHVuc2lnbmVkUmVhbCArIFwifFwiICsgc2lnbiArIHNwZWNpYWwgKyBcIilcIlxuXG4gICAgICAgIHZhciBhbHQxID0gbmV3IFJlZ0V4cChcIl4oXCIgKyByYXRpb25hbCArIFwiKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIoXCIgKyBzaWduICsgdW5zaWduZWRSYXRpb25hbCArIFwiPylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiaSRcIik7XG4gICAgICAgIHZhciBhbHQyID0gbmV3IFJlZ0V4cChcIl4oXCIgKyByZWFsICsgXCIpP1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIoXCIgKyBzaWduICsgdW5zaWduZWRSZWFsT3JTcGVjaWFsICsgXCI/KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCJpJFwiKTtcbiAgICAgICAgdmFyIGFsdDMgPSBuZXcgUmVnRXhwKFwiXihcIiArIHJlYWwgKyBcIilAKFwiICsgcmVhbCArIFwiKSRcIik7XG5cbiAgICAgICAgdmFyIG1hdGNoMSA9IHgubWF0Y2goYWx0MSlcbiAgICAgICAgdmFyIG1hdGNoMiA9IHgubWF0Y2goYWx0MilcbiAgICAgICAgdmFyIG1hdGNoMyA9IHgubWF0Y2goYWx0MylcblxuICAgICAgICByZXR1cm4gbWF0Y2gxID8gbWF0Y2gxIDpcbiAgICAgICAgICAgICAgIG1hdGNoMiA/IG1hdGNoMiA6XG4gICAgICAgICAgICAgICBtYXRjaDMgPyBtYXRjaDMgOlxuICAgICAgICAgICAgIC8qIGVsc2UgKi8gZmFsc2VcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaWdpdFJlZ2V4cChkaWdpdHMpIHsgcmV0dXJuIG5ldyBSZWdFeHAoXCJeWystXT9bXCIrZGlnaXRzK1wiXSskXCIpOyB9XG4gICAgLyoqXG4gICAgLyogTkI6ICEhISEgZmxvbnVtIHJlZ2V4cCBvbmx5IG1hdGNoZXMgXCJYLlwiLCBcIi5YXCIsIG9yIFwiWC5YXCIsIE5PVCBcIlhcIiwgdGhpc1xuICAgIC8qIG11c3QgYmUgc2VwYXJhdGVseSBjaGVja2VkIHdpdGggZGlnaXRSZWdleHAuXG4gICAgLyogSSBrbm93IHRoaXMgc2VlbXMgZHVtYiwgYnV0IHRoZSBhbHRlcm5hdGl2ZSB3b3VsZCBiZSB0aGF0IHRoaXMgcmVnZXhwXG4gICAgLyogcmV0dXJucyBzaXggbWF0Y2hlcywgd2hpY2ggYWxzbyBzZWVtcyBkdW1iLlxuICAgIC8qKiovXG4gICAgZnVuY3Rpb24gZmxvbnVtUmVnZXhwKGRpZ2l0cykge1xuICAgICAgICB2YXIgZGVjaW1hbE51bU9uUmlnaHQgPSBcIihbXCIrZGlnaXRzK1wiXSopXFxcXC4oW1wiK2RpZ2l0cytcIl0rKVwiXG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25MZWZ0ID0gXCIoW1wiK2RpZ2l0cytcIl0rKVxcXFwuKFtcIitkaWdpdHMrXCJdKilcIlxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChcIl4oPzooWystXT8pKFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbE51bU9uUmlnaHQrXCJ8XCIrZGVjaW1hbE51bU9uTGVmdCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiKSkkXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzY2llbnRpZmljUGF0dGVybihkaWdpdHMsIGV4cF9tYXJrKSB7XG4gICAgICAgIHZhciBub0RlY2ltYWwgPSBcIltcIitkaWdpdHMrXCJdK1wiXG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25SaWdodCA9IFwiW1wiK2RpZ2l0cytcIl0qXFxcXC5bXCIrZGlnaXRzK1wiXStcIlxuICAgICAgICB2YXIgZGVjaW1hbE51bU9uTGVmdCA9IFwiW1wiK2RpZ2l0cytcIl0rXFxcXC5bXCIrZGlnaXRzK1wiXSpcIlxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChcIl4oPzooWystXT9cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiKD86XCIrbm9EZWNpbWFsK1wifFwiK2RlY2ltYWxOdW1PblJpZ2h0K1wifFwiK2RlY2ltYWxOdW1PbkxlZnQrXCIpXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIilbXCIrZXhwX21hcmsrXCJdKFsrLV0/W1wiK2RpZ2l0cytcIl0rKSkkXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpZ2l0c0ZvclJhZGl4KHJhZGl4KSB7XG4gICAgICAgIHJldHVybiByYWRpeCA9PT0gMiAgPyBcIjAxXCIgOlxuICAgICAgICAgICAgICAgcmFkaXggPT09IDggID8gXCIwLTdcIiA6XG4gICAgICAgICAgICAgICByYWRpeCA9PT0gMTAgPyBcIjAtOVwiIDpcbiAgICAgICAgICAgICAgIHJhZGl4ID09PSAxNiA/IFwiMC05YS1mQS1GXCIgOlxuICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJkaWdpdHNGb3JSYWRpeDogaW52YWxpZCByYWRpeFwiLCB0aGlzLCByYWRpeClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBNYXJrRm9yUmFkaXgocmFkaXgpIHtcbiAgICAgICAgcmV0dXJuIChyYWRpeCA9PT0gMiB8fCByYWRpeCA9PT0gOCB8fCByYWRpeCA9PT0gMTApID8gXCJkZWZzbFwiIDpcbiAgICAgICAgICAgICAgIChyYWRpeCA9PT0gMTYpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJzbFwiIDpcbiAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiZXhwTWFya0ZvclJhZGl4OiBpbnZhbGlkIHJhZGl4XCIsIHRoaXMsIHJhZGl4KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIEV4YWN0bmVzcyhpKSB7XG4gICAgICB0aGlzLmRlZmF1bHRwID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaSA9PSAwOyB9XG4gICAgICB0aGlzLmV4YWN0cCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGkgPT0gMTsgfVxuICAgICAgdGhpcy5pbmV4YWN0cCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGkgPT0gMjsgfVxuICAgIH1cblxuICAgIEV4YWN0bmVzcy5kZWYgPSBuZXcgRXhhY3RuZXNzKDApO1xuICAgIEV4YWN0bmVzcy5vbiA9IG5ldyBFeGFjdG5lc3MoMSk7XG4gICAgRXhhY3RuZXNzLm9mZiA9IG5ldyBFeGFjdG5lc3MoMik7XG5cbiAgICBFeGFjdG5lc3MucHJvdG90eXBlLmludEFzRXhhY3RwID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cCgpIHx8IHRoaXMuZXhhY3RwKCk7IH07XG4gICAgRXhhY3RuZXNzLnByb3RvdHlwZS5mbG9hdEFzSW5leGFjdHAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmRlZmF1bHRwKCkgfHwgdGhpcy5pbmV4YWN0cCgpOyB9O1xuXG5cbiAgICAvLyBmcm9tU3RyaW5nOiBzdHJpbmcgYm9vbGVhbiAtPiAoc2NoZW1lLW51bWJlciB8IGZhbHNlKVxuICAgIHZhciBmcm9tU3RyaW5nID0gZnVuY3Rpb24oeCwgZXhhY3RuZXNzKSB7XG4gICAgICAgIHZhciByYWRpeCA9IDEwXG4gICAgICAgIHZhciBleGFjdG5lc3MgPSB0eXBlb2YgZXhhY3RuZXNzID09PSAndW5kZWZpbmVkJyA/IEV4YWN0bmVzcy5kZWYgOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RuZXNzID09PSB0cnVlICAgICAgICAgICAgICAgPyBFeGFjdG5lc3Mub24gOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RuZXNzID09PSBmYWxzZSAgICAgICAgICAgICAgPyBFeGFjdG5lc3Mub2ZmIDpcbiAgICAgICAgICAgLyogZWxzZSAqLyAgdGhyb3dSdW50aW1lRXJyb3IoIFwiZXhhY3RuZXNzIG11c3QgYmUgdHJ1ZSBvciBmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByKSA7XG5cbiAgICAgICAgdmFyIGhNYXRjaCA9IHgudG9Mb3dlckNhc2UoKS5tYXRjaChoYXNoTW9kaWZpZXJzUmVnZXhwKVxuICAgICAgICBpZiAoaE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZXJTdHJpbmcgPSBoTWF0Y2hbMV0udG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgdmFyIGV4YWN0RmxhZyA9IG1vZGlmaWVyU3RyaW5nLm1hdGNoKG5ldyBSZWdFeHAoXCIoI1tlaV0pXCIpKVxuICAgICAgICAgICAgdmFyIHJhZGl4RmxhZyA9IG1vZGlmaWVyU3RyaW5nLm1hdGNoKG5ldyBSZWdFeHAoXCIoI1tib2R4XSlcIikpXG5cbiAgICAgICAgICAgIGlmIChleGFjdEZsYWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IGV4YWN0RmxhZ1sxXS5jaGFyQXQoMSlcbiAgICAgICAgICAgICAgICBleGFjdG5lc3MgPSBmID09PSAnZScgPyBFeGFjdG5lc3Mub24gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYgPT09ICdpJyA/IEV4YWN0bmVzcy5vZmYgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FzZSBpcyB1bnJlYWNoYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiaW52YWxpZCBleGFjdG5lc3MgZmxhZ1wiLCB0aGlzLCByKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJhZGl4RmxhZykge1xuICAgICAgICAgICAgICAgIHZhciBmID0gcmFkaXhGbGFnWzFdLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgIHJhZGl4ID0gZiA9PT0gJ2InID8gMiA6XG4gICAgICAgICAgICBmID09PSAnbycgPyA4IDpcbiAgICAgICAgICAgIGYgPT09ICdkJyA/IDEwIDpcbiAgICAgICAgICAgIGYgPT09ICd4JyA/IDE2IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGNhc2UgaXMgdW5yZWFjaGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiaW52YWxpZCByYWRpeCBmbGFnXCIsIHRoaXMsIHIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbnVtYmVyU3RyaW5nID0gaE1hdGNoID8gaE1hdGNoWzJdIDogeFxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGJlZ2lucyB3aXRoIGEgaGFzaCBtb2RpZmllciwgdGhlbiBpdCBtdXN0IHBhcnNlIGFzIGFcbiAgICAgICAgLy8gbnVtYmVyLCBhbiBpbnZhbGlkIHBhcnNlIGlzIGFuIGVycm9yLCBub3QgZmFsc2UuIEZhbHNlIGlzIHJldHVybmVkXG4gICAgICAgIC8vIHdoZW4gdGhlIGl0ZW0gY291bGQgcG90ZW50aWFsbHkgaGF2ZSBiZWVuIHJlYWQgYXMgYSBzeW1ib2wuXG4gICAgICAgIHZhciBtdXN0QmVBTnVtYmVycCA9IGhNYXRjaCA/IHRydWUgOiBmYWxzZVxuXG4gICAgICAgIHJldHVybiBmcm9tU3RyaW5nUmF3KG51bWJlclN0cmluZywgcmFkaXgsIGV4YWN0bmVzcywgbXVzdEJlQU51bWJlcnApXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGZyb21TdHJpbmdSYXcoeCwgcmFkaXgsIGV4YWN0bmVzcywgbXVzdEJlQU51bWJlcnApIHtcbiAgICAgICAgdmFyIGNNYXRjaCA9IG1hdGNoQ29tcGxleFJlZ2V4cChyYWRpeCwgeCk7XG4gICAgICAgIGlmIChjTWF0Y2gpIHtcbiAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoIGNNYXRjaFsxXSB8fCBcIjBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcmFkaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4YWN0bmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoIGNNYXRjaFsyXSA9PT0gXCIrXCIgPyBcIjFcIiAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY01hdGNoWzJdID09PSBcIi1cIiA/IFwiLTFcIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjTWF0Y2hbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHJhZGl4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleGFjdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KHgsIHJhZGl4LCBleGFjdG5lc3MsIG11c3RCZUFOdW1iZXJwKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoeCwgcmFkaXgsIGV4YWN0bmVzcywgbXVzdEJlQU51bWJlcnApIHtcbiAgICAgICAgdmFyIGFNYXRjaCA9IHgubWF0Y2gocmF0aW9uYWxSZWdleHAoZGlnaXRzRm9yUmFkaXgocmFkaXgpKSk7XG4gICAgICAgIGlmIChhTWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoIGFNYXRjaFsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcmFkaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4YWN0bmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoIGFNYXRjaFsyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcmFkaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4YWN0bmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmxvYXRpbmcgcG9pbnQgdGVzdHNcbiAgICAgICAgaWYgKHggPT09ICcrbmFuLjAnIHx8IHggPT09ICctbmFuLjAnKVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubmFuO1xuICAgICAgICBpZiAoeCA9PT0gJytpbmYuMCcpXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5pbmY7XG4gICAgICAgIGlmICh4ID09PSAnLWluZi4wJylcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm5lZ2luZjtcbiAgICAgICAgaWYgKHggPT09IFwiLTAuMFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gTkVHQVRJVkVfWkVSTztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmTWF0Y2ggPSB4Lm1hdGNoKGZsb251bVJlZ2V4cChkaWdpdHNGb3JSYWRpeChyYWRpeCkpKVxuICAgICAgICBpZiAoZk1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW50ZWdyYWxQYXJ0ID0gZk1hdGNoWzNdICE9PSB1bmRlZmluZWQgPyBmTWF0Y2hbM10gOiBmTWF0Y2hbNV07XG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25hbFBhcnQgPSBmTWF0Y2hbNF0gIT09IHVuZGVmaW5lZCA/IGZNYXRjaFs0XSA6IGZNYXRjaFs2XTtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KCBmTWF0Y2hbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBpbnRlZ3JhbFBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBmcmFjdGlvbmFsUGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHJhZGl4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhhY3RuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzTWF0Y2ggPSB4Lm1hdGNoKHNjaWVudGlmaWNQYXR0ZXJuKCBkaWdpdHNGb3JSYWRpeChyYWRpeClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4cE1hcmtGb3JSYWRpeChyYWRpeClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICBpZiAoc01hdGNoKSB7XG4gICAgICAgICAgICB2YXIgY29lZmZpY2llbnQgPSBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KHNNYXRjaFsxXSwgcmFkaXgsIGV4YWN0bmVzcylcbiAgICAgICAgICAgIHZhciBleHBvbmVudCA9IGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoc01hdGNoWzJdLCByYWRpeCwgZXhhY3RuZXNzKVxuICAgICAgICAgICAgcmV0dXJuIG11bHRpcGx5KGNvZWZmaWNpZW50LCBleHB0KHJhZGl4LCBleHBvbmVudCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgaW50ZWdlciB0ZXN0cy5cbiAgICAgICAgaWYgKHgubWF0Y2goZGlnaXRSZWdleHAoZGlnaXRzRm9yUmFkaXgocmFkaXgpKSkpIHtcbiAgICAgICAgICAgIHZhciBuID0gcGFyc2VJbnQoeCwgcmFkaXgpO1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3cobikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZUJpZ251bSh4KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXhhY3RuZXNzLmludEFzRXhhY3RwKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKG4pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobXVzdEJlQU51bWJlcnApIHtcbiAgICAgICAgICAgIGlmKHgubGVuZ3RoPT09MCkgdGhyb3dSdW50aW1lRXJyb3IoXCJubyBkaWdpdHNcIik7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImJhZCBudW1iZXI6IFwiICsgeCwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcGFyc2VGbG9hdChzaWduLCBpbnRlZ3JhbFBhcnQsIGZyYWN0aW9uYWxQYXJ0LCByYWRpeCwgZXhhY3RuZXNzKSB7XG4gICAgICAgIHZhciBzaWduID0gKHNpZ24gPT0gXCItXCIgPyAtMSA6IDEpO1xuICAgICAgICB2YXIgaW50ZWdyYWxQYXJ0VmFsdWUgPSBpbnRlZ3JhbFBhcnQgPT09IFwiXCIgID8gMCAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdG5lc3MuaW50QXNFeGFjdHAoKSA/IHBhcnNlRXhhY3RJbnQoaW50ZWdyYWxQYXJ0LCByYWRpeCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGludGVncmFsUGFydCwgcmFkaXgpXG5cbiAgICAgICAgdmFyIGZyYWN0aW9uYWxOdW1lcmF0b3IgPSBmcmFjdGlvbmFsUGFydCA9PT0gXCJcIiA/IDAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0bmVzcy5pbnRBc0V4YWN0cCgpID8gcGFyc2VFeGFjdEludChmcmFjdGlvbmFsUGFydCwgcmFkaXgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZyYWN0aW9uYWxQYXJ0LCByYWRpeClcbiAgICAgICAgLyogdW5mb3J0dW5hdGVseSwgZm9yIHRoZXNlIG5leHQgdHdvIGNhbGN1bGF0aW9ucywgYGV4cHRgIGFuZCBgZGl2aWRlYCAqL1xuICAgICAgICAvKiB3aWxsIHByb21vdGUgdG8gQmlnbnVtIGFuZCBSYXRpb25hbCwgcmVzcGVjdGl2ZWx5LCBidXQgd2Ugb25seSB3YW50ICovXG4gICAgICAgIC8qIHRoZXNlIGlmIHdlJ3JlIHBhcnNpbmcgaW4gZXhhY3QgbW9kZSAqL1xuICAgICAgICB2YXIgZnJhY3Rpb25hbERlbm9taW5hdG9yID0gZXhhY3RuZXNzLmludEFzRXhhY3RwKCkgPyBleHB0KHJhZGl4LCBmcmFjdGlvbmFsUGFydC5sZW5ndGgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3cocmFkaXgsIGZyYWN0aW9uYWxQYXJ0Lmxlbmd0aClcbiAgICAgICAgdmFyIGZyYWN0aW9uYWxQYXJ0VmFsdWUgPSBmcmFjdGlvbmFsUGFydCA9PT0gXCJcIiA/IDAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0bmVzcy5pbnRBc0V4YWN0cCgpID8gZGl2aWRlKGZyYWN0aW9uYWxOdW1lcmF0b3IsIGZyYWN0aW9uYWxEZW5vbWluYXRvcikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbE51bWVyYXRvciAvIGZyYWN0aW9uYWxEZW5vbWluYXRvclxuXG4gICAgICAgIHZhciBmb3JjZUluZXhhY3QgPSBmdW5jdGlvbihvKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIG8gPT09IFwibnVtYmVyXCIgPyBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShvKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby50b0luZXhhY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBleGFjdG5lc3MuZmxvYXRBc0luZXhhY3RwKCkgPyBmb3JjZUluZXhhY3QobXVsdGlwbHkoc2lnbiwgYWRkKCBpbnRlZ3JhbFBhcnRWYWx1ZSwgZnJhY3Rpb25hbFBhcnRWYWx1ZSkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBseShzaWduLCBhZGQoaW50ZWdyYWxQYXJ0VmFsdWUsIGZyYWN0aW9uYWxQYXJ0VmFsdWUpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUV4YWN0SW50KHN0ciwgcmFkaXgpIHtcbiAgICAgICAgcmV0dXJuIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoc3RyLCByYWRpeCwgRXhhY3RuZXNzLm9uLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gVGhlIGNvZGUgYmVsb3cgY29tZXMgZnJvbSBUb20gV3UncyBCaWdJbnRlZ2VyIGltcGxlbWVudGF0aW9uOlxuXG4gICAgLy8gQ29weXJpZ2h0IChjKSAyMDA1ICBUb20gV3VcbiAgICAvLyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIC8vIFNlZSBcIkxJQ0VOU0VcIiBmb3IgZGV0YWlscy5cblxuICAgIC8vIEJhc2ljIEphdmFTY3JpcHQgQk4gbGlicmFyeSAtIHN1YnNldCB1c2VmdWwgZm9yIFJTQSBlbmNyeXB0aW9uLlxuXG4gICAgLy8gQml0cyBwZXIgZGlnaXRcbiAgICB2YXIgZGJpdHM7XG5cbiAgICAvLyBKYXZhU2NyaXB0IGVuZ2luZSBhbmFseXNpc1xuICAgIHZhciBjYW5hcnkgPSAweGRlYWRiZWVmY2FmZTtcbiAgICB2YXIgal9sbSA9ICgoY2FuYXJ5JjB4ZmZmZmZmKT09MHhlZmNhZmUpO1xuXG4gICAgLy8gKHB1YmxpYykgQ29uc3RydWN0b3JcbiAgICBmdW5jdGlvbiBCaWdJbnRlZ2VyKGEsYixjKSB7XG4gICAgICAgIGlmKGEgIT0gbnVsbClcbiAgICAgICAgICAgIGlmKFwibnVtYmVyXCIgPT0gdHlwZW9mIGEpIHRoaXMuZnJvbU51bWJlcihhLGIsYyk7XG4gICAgICAgIGVsc2UgaWYoYiA9PSBudWxsICYmIFwic3RyaW5nXCIgIT0gdHlwZW9mIGEpIHRoaXMuZnJvbVN0cmluZyhhLDI1Nik7XG4gICAgICAgIGVsc2UgdGhpcy5mcm9tU3RyaW5nKGEsYik7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIG5ldywgdW5zZXQgQmlnSW50ZWdlclxuICAgIGZ1bmN0aW9uIG5iaSgpIHsgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG51bGwpOyB9XG5cbiAgICAvLyBhbTogQ29tcHV0ZSB3X2ogKz0gKHgqdGhpc19pKSwgcHJvcGFnYXRlIGNhcnJpZXMsXG4gICAgLy8gYyBpcyBpbml0aWFsIGNhcnJ5LCByZXR1cm5zIGZpbmFsIGNhcnJ5LlxuICAgIC8vIGMgPCAzKmR2YWx1ZSwgeCA8IDIqZHZhbHVlLCB0aGlzX2kgPCBkdmFsdWVcbiAgICAvLyBXZSBuZWVkIHRvIHNlbGVjdCB0aGUgZmFzdGVzdCBvbmUgdGhhdCB3b3JrcyBpbiB0aGlzIGVudmlyb25tZW50LlxuXG4gICAgLy8gYW0xOiB1c2UgYSBzaW5nbGUgbXVsdCBhbmQgZGl2aWRlIHRvIGdldCB0aGUgaGlnaCBiaXRzLFxuICAgIC8vIG1heCBkaWdpdCBiaXRzIHNob3VsZCBiZSAyNiBiZWNhdXNlXG4gICAgLy8gbWF4IGludGVybmFsIHZhbHVlID0gMipkdmFsdWVeMi0yKmR2YWx1ZSAoPCAyXjUzKVxuICAgIGZ1bmN0aW9uIGFtMShpLHgsdyxqLGMsbikge1xuICAgICAgICB3aGlsZSgtLW4gPj0gMCkge1xuICAgICAgICAgICAgdmFyIHYgPSB4KnRoaXNbaSsrXSt3W2pdK2M7XG4gICAgICAgICAgICBjID0gTWF0aC5mbG9vcih2LzB4NDAwMDAwMCk7XG4gICAgICAgICAgICB3W2orK10gPSB2JjB4M2ZmZmZmZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgLy8gYW0yIGF2b2lkcyBhIGJpZyBtdWx0LWFuZC1leHRyYWN0IGNvbXBsZXRlbHkuXG4gICAgLy8gTWF4IGRpZ2l0IGJpdHMgc2hvdWxkIGJlIDw9IDMwIGJlY2F1c2Ugd2UgZG8gYml0d2lzZSBvcHNcbiAgICAvLyBvbiB2YWx1ZXMgdXAgdG8gMipoZHZhbHVlXjItaGR2YWx1ZS0xICg8IDJeMzEpXG4gICAgZnVuY3Rpb24gYW0yKGkseCx3LGosYyxuKSB7XG4gICAgICAgIHZhciB4bCA9IHgmMHg3ZmZmLCB4aCA9IHg+PjE1O1xuICAgICAgICB3aGlsZSgtLW4gPj0gMCkge1xuICAgICAgICAgICAgdmFyIGwgPSB0aGlzW2ldJjB4N2ZmZjtcbiAgICAgICAgICAgIHZhciBoID0gdGhpc1tpKytdPj4xNTtcbiAgICAgICAgICAgIHZhciBtID0geGgqbCtoKnhsO1xuICAgICAgICAgICAgbCA9IHhsKmwrKChtJjB4N2ZmZik8PDE1KSt3W2pdKyhjJjB4M2ZmZmZmZmYpO1xuICAgICAgICAgICAgYyA9IChsPj4+MzApKyhtPj4+MTUpK3hoKmgrKGM+Pj4zMCk7XG4gICAgICAgICAgICB3W2orK10gPSBsJjB4M2ZmZmZmZmY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIC8vIEFsdGVybmF0ZWx5LCBzZXQgbWF4IGRpZ2l0IGJpdHMgdG8gMjggc2luY2Ugc29tZVxuICAgIC8vIGJyb3dzZXJzIHNsb3cgZG93biB3aGVuIGRlYWxpbmcgd2l0aCAzMi1iaXQgbnVtYmVycy5cbiAgICBmdW5jdGlvbiBhbTMoaSx4LHcsaixjLG4pIHtcbiAgICAgICAgdmFyIHhsID0geCYweDNmZmYsIHhoID0geD4+MTQ7XG4gICAgICAgIHdoaWxlKC0tbiA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgbCA9IHRoaXNbaV0mMHgzZmZmO1xuICAgICAgICAgICAgdmFyIGggPSB0aGlzW2krK10+PjE0O1xuICAgICAgICAgICAgdmFyIG0gPSB4aCpsK2gqeGw7XG4gICAgICAgICAgICBsID0geGwqbCsoKG0mMHgzZmZmKTw8MTQpK3dbal0rYztcbiAgICAgICAgICAgIGMgPSAobD4+MjgpKyhtPj4xNCkreGgqaDtcbiAgICAgICAgICAgIHdbaisrXSA9IGwmMHhmZmZmZmZmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICBpZihqX2xtICYmICh0eXBlb2YobmF2aWdhdG9yKSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLmFwcE5hbWUgPT0gXCJNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXJcIikpIHtcbiAgICAgICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW0gPSBhbTI7XG4gICAgICAgIGRiaXRzID0gMzA7XG4gICAgfVxuICAgIGVsc2UgaWYoal9sbSAmJiAodHlwZW9mKG5hdmlnYXRvcikgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5hcHBOYW1lICE9IFwiTmV0c2NhcGVcIikpIHtcbiAgICAgICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW0gPSBhbTE7XG4gICAgICAgIGRiaXRzID0gMjY7XG4gICAgfVxuICAgIGVsc2UgeyAvLyBNb3ppbGxhL05ldHNjYXBlIHNlZW1zIHRvIHByZWZlciBhbTNcbiAgICAgICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW0gPSBhbTM7XG4gICAgICAgIGRiaXRzID0gMjg7XG4gICAgfVxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuREIgPSBkYml0cztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ETSA9ICgoMTw8ZGJpdHMpLTEpO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkRWID0gKDE8PGRiaXRzKTtcblxuICAgIHZhciBCSV9GUCA9IDUyO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkZWID0gTWF0aC5wb3coMixCSV9GUCk7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuRjEgPSBCSV9GUC1kYml0cztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5GMiA9IDIqZGJpdHMtQklfRlA7XG5cbiAgICAvLyBEaWdpdCBjb252ZXJzaW9uc1xuICAgIHZhciBCSV9STSA9IFwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCI7XG4gICAgdmFyIEJJX1JDID0gW107XG4gICAgdmFyIHJyLHZ2O1xuICAgIHJyID0gXCIwXCIuY2hhckNvZGVBdCgwKTtcbiAgICBmb3IodnYgPSAwOyB2diA8PSA5OyArK3Z2KSBCSV9SQ1tycisrXSA9IHZ2O1xuICAgIHJyID0gXCJhXCIuY2hhckNvZGVBdCgwKTtcbiAgICBmb3IodnYgPSAxMDsgdnYgPCAzNjsgKyt2dikgQklfUkNbcnIrK10gPSB2djtcbiAgICByciA9IFwiQVwiLmNoYXJDb2RlQXQoMCk7XG4gICAgZm9yKHZ2ID0gMTA7IHZ2IDwgMzY7ICsrdnYpIEJJX1JDW3JyKytdID0gdnY7XG5cbiAgICBmdW5jdGlvbiBpbnQyY2hhcihuKSB7IHJldHVybiBCSV9STS5jaGFyQXQobik7IH1cbiAgICBmdW5jdGlvbiBpbnRBdChzLGkpIHtcbiAgICAgICAgdmFyIGMgPSBCSV9SQ1tzLmNoYXJDb2RlQXQoaSldO1xuICAgICAgICByZXR1cm4gKGM9PW51bGwpPy0xOmM7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgY29weSB0aGlzIHRvIHJcbiAgICBmdW5jdGlvbiBibnBDb3B5VG8ocikge1xuICAgICAgICBmb3IodmFyIGkgPSB0aGlzLnQtMTsgaSA+PSAwOyAtLWkpIHJbaV0gPSB0aGlzW2ldO1xuICAgICAgICByLnQgPSB0aGlzLnQ7XG4gICAgICAgIHIucyA9IHRoaXMucztcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBzZXQgZnJvbSBpbnRlZ2VyIHZhbHVlIHgsIC1EViA8PSB4IDwgRFZcbiAgICBmdW5jdGlvbiBibnBGcm9tSW50KHgpIHtcbiAgICAgICAgdGhpcy50ID0gMTtcbiAgICAgICAgdGhpcy5zID0gKHg8MCk/LTE6MDtcbiAgICAgICAgaWYoeCA+IDApIHRoaXNbMF0gPSB4O1xuICAgICAgICBlbHNlIGlmKHggPCAtMSkgdGhpc1swXSA9IHgrRFY7XG4gICAgICAgIGVsc2UgdGhpcy50ID0gMDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gYmlnaW50IGluaXRpYWxpemVkIHRvIHZhbHVlXG4gICAgZnVuY3Rpb24gbmJ2KGkpIHsgdmFyIHIgPSBuYmkoKTsgci5mcm9tSW50KGkpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgc2V0IGZyb20gc3RyaW5nIGFuZCByYWRpeFxuICAgIGZ1bmN0aW9uIGJucEZyb21TdHJpbmcocyxiKSB7XG4gICAgICAgIHZhciBrO1xuICAgICAgICBpZihiID09IDE2KSBrID0gNDtcbiAgICAgICAgZWxzZSBpZihiID09IDgpIGsgPSAzO1xuICAgICAgICBlbHNlIGlmKGIgPT0gMjU2KSBrID0gODsgLy8gYnl0ZSBhcnJheVxuICAgICAgICBlbHNlIGlmKGIgPT0gMikgayA9IDE7XG4gICAgICAgIGVsc2UgaWYoYiA9PSAzMikgayA9IDU7XG4gICAgICAgIGVsc2UgaWYoYiA9PSA0KSBrID0gMjtcbiAgICAgICAgZWxzZSB7IHRoaXMuZnJvbVJhZGl4KHMsYik7IHJldHVybjsgfVxuICAgICAgICB0aGlzLnQgPSAwO1xuICAgICAgICB0aGlzLnMgPSAwO1xuICAgICAgICB2YXIgaSA9IHMubGVuZ3RoLCBtaSA9IGZhbHNlLCBzaCA9IDA7XG4gICAgICAgIHdoaWxlKC0taSA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgeCA9IChrPT04KT9zW2ldJjB4ZmY6aW50QXQocyxpKTtcbiAgICAgICAgICAgIGlmKHggPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYocy5jaGFyQXQoaSkgPT0gXCItXCIpIG1pID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1pID0gZmFsc2U7XG4gICAgICAgICAgICBpZihzaCA9PSAwKVxuICAgICAgICAgICAgICAgIHRoaXNbdGhpcy50KytdID0geDtcbiAgICAgICAgICAgIGVsc2UgaWYoc2grayA+IHRoaXMuREIpIHtcbiAgICAgICAgICAgICAgICB0aGlzW3RoaXMudC0xXSB8PSAoeCYoKDE8PCh0aGlzLkRCLXNoKSktMSkpPDxzaDtcbiAgICAgICAgICAgICAgICB0aGlzW3RoaXMudCsrXSA9ICh4Pj4odGhpcy5EQi1zaCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXNbdGhpcy50LTFdIHw9IHg8PHNoO1xuICAgICAgICAgICAgc2ggKz0gaztcbiAgICAgICAgICAgIGlmKHNoID49IHRoaXMuREIpIHNoIC09IHRoaXMuREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYoayA9PSA4ICYmIChzWzBdJjB4ODApICE9IDApIHtcbiAgICAgICAgICAgIHRoaXMucyA9IC0xO1xuICAgICAgICAgICAgaWYoc2ggPiAwKSB0aGlzW3RoaXMudC0xXSB8PSAoKDE8PCh0aGlzLkRCLXNoKSktMSk8PHNoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xhbXAoKTtcbiAgICAgICAgaWYobWkpIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyh0aGlzLHRoaXMpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIGNsYW1wIG9mZiBleGNlc3MgaGlnaCB3b3Jkc1xuICAgIGZ1bmN0aW9uIGJucENsYW1wKCkge1xuICAgICAgICB2YXIgYyA9IHRoaXMucyZ0aGlzLkRNO1xuICAgICAgICB3aGlsZSh0aGlzLnQgPiAwICYmIHRoaXNbdGhpcy50LTFdID09IGMpIC0tdGhpcy50O1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiBzdHJpbmcgcmVwcmVzZW50YXRpb24gaW4gZ2l2ZW4gcmFkaXhcbiAgICBmdW5jdGlvbiBiblRvU3RyaW5nKGIpIHtcbiAgICAgICAgaWYodGhpcy5zIDwgMCkgcmV0dXJuIFwiLVwiK3RoaXMubmVnYXRlKCkudG9TdHJpbmcoYik7XG4gICAgICAgIHZhciBrO1xuICAgICAgICBpZihiID09IDE2KSBrID0gNDtcbiAgICAgICAgZWxzZSBpZihiID09IDgpIGsgPSAzO1xuICAgICAgICBlbHNlIGlmKGIgPT0gMikgayA9IDE7XG4gICAgICAgIGVsc2UgaWYoYiA9PSAzMikgayA9IDU7XG4gICAgICAgIGVsc2UgaWYoYiA9PSA0KSBrID0gMjtcbiAgICAgICAgZWxzZSByZXR1cm4gdGhpcy50b1JhZGl4KGIpO1xuICAgICAgICB2YXIga20gPSAoMTw8ayktMSwgZCwgbSA9IGZhbHNlLCByID0gW10sIGkgPSB0aGlzLnQ7XG4gICAgICAgIHZhciBwID0gdGhpcy5EQi0oaSp0aGlzLkRCKSVrO1xuICAgICAgICBpZihpLS0gPiAwKSB7XG4gICAgICAgICAgICBpZihwIDwgdGhpcy5EQiAmJiAoZCA9IHRoaXNbaV0+PnApID4gMCkgeyBtID0gdHJ1ZTsgci5wdXNoKGludDJjaGFyKGQpKTsgfVxuICAgICAgICAgICAgd2hpbGUoaSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYocCA8IGspIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldJigoMTw8cCktMSkpPDwoay1wKTtcbiAgICAgICAgICAgICAgICAgICAgZCB8PSB0aGlzWy0taV0+PihwKz10aGlzLkRCLWspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldPj4ocC09aykpJmttO1xuICAgICAgICAgICAgICAgICAgICBpZihwIDw9IDApIHsgcCArPSB0aGlzLkRCOyAtLWk7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZCA+IDApIG0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmKG0pIHIucHVzaChpbnQyY2hhcihkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0/ci5qb2luKFwiXCIpOlwiMFwiO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIC10aGlzXG4gICAgZnVuY3Rpb24gYm5OZWdhdGUoKSB7IHZhciByID0gbmJpKCk7IEJpZ0ludGVnZXIuWkVSTy5zdWJUbyh0aGlzLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgfHRoaXN8XG4gICAgZnVuY3Rpb24gYm5BYnMoKSB7IHJldHVybiAodGhpcy5zPDApP3RoaXMubmVnYXRlKCk6dGhpczsgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuICsgaWYgdGhpcyA+IGEsIC0gaWYgdGhpcyA8IGEsIDAgaWYgZXF1YWxcbiAgICBmdW5jdGlvbiBibkNvbXBhcmVUbyhhKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5zLWEucztcbiAgICAgICAgaWYociAhPSAwKSByZXR1cm4gcjtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnQ7XG4gICAgICAgIGlmICggdGhpcy5zIDwgMCApIHtcbiAgICAgICAgICAgICAgICByID0gYS50IC0gaTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByID0gaSAtIGEudDtcbiAgICAgICAgfVxuICAgICAgICBpZihyICE9IDApIHJldHVybiByO1xuICAgICAgICB3aGlsZSgtLWkgPj0gMCkgaWYoKHI9dGhpc1tpXS1hW2ldKSAhPSAwKSByZXR1cm4gcjtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyBiaXQgbGVuZ3RoIG9mIHRoZSBpbnRlZ2VyIHhcbiAgICBmdW5jdGlvbiBuYml0cyh4KSB7XG4gICAgICAgIHZhciByID0gMSwgdDtcbiAgICAgICAgaWYoKHQ9eD4+PjE2KSAhPSAwKSB7IHggPSB0OyByICs9IDE2OyB9XG4gICAgICAgIGlmKCh0PXg+PjgpICE9IDApIHsgeCA9IHQ7IHIgKz0gODsgfVxuICAgICAgICBpZigodD14Pj40KSAhPSAwKSB7IHggPSB0OyByICs9IDQ7IH1cbiAgICAgICAgaWYoKHQ9eD4+MikgIT0gMCkgeyB4ID0gdDsgciArPSAyOyB9XG4gICAgICAgIGlmKCh0PXg+PjEpICE9IDApIHsgeCA9IHQ7IHIgKz0gMTsgfVxuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gdGhlIG51bWJlciBvZiBiaXRzIGluIFwidGhpc1wiXG4gICAgZnVuY3Rpb24gYm5CaXRMZW5ndGgoKSB7XG4gICAgICAgIGlmKHRoaXMudCA8PSAwKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuREIqKHRoaXMudC0xKStuYml0cyh0aGlzW3RoaXMudC0xXV4odGhpcy5zJnRoaXMuRE0pKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyA8PCBuKkRCXG4gICAgZnVuY3Rpb24gYm5wRExTaGlmdFRvKG4scikge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgZm9yKGkgPSB0aGlzLnQtMTsgaSA+PSAwOyAtLWkpIHJbaStuXSA9IHRoaXNbaV07XG4gICAgICAgIGZvcihpID0gbi0xOyBpID49IDA7IC0taSkgcltpXSA9IDA7XG4gICAgICAgIHIudCA9IHRoaXMudCtuO1xuICAgICAgICByLnMgPSB0aGlzLnM7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPj4gbipEQlxuICAgIGZ1bmN0aW9uIGJucERSU2hpZnRUbyhuLHIpIHtcbiAgICAgICAgZm9yKHZhciBpID0gbjsgaSA8IHRoaXMudDsgKytpKSByW2ktbl0gPSB0aGlzW2ldO1xuICAgICAgICByLnQgPSBNYXRoLm1heCh0aGlzLnQtbiwwKTtcbiAgICAgICAgci5zID0gdGhpcy5zO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzIDw8IG5cbiAgICBmdW5jdGlvbiBibnBMU2hpZnRUbyhuLHIpIHtcbiAgICAgICAgdmFyIGJzID0gbiV0aGlzLkRCO1xuICAgICAgICB2YXIgY2JzID0gdGhpcy5EQi1icztcbiAgICAgICAgdmFyIGJtID0gKDE8PGNicyktMTtcbiAgICAgICAgdmFyIGRzID0gTWF0aC5mbG9vcihuL3RoaXMuREIpLCBjID0gKHRoaXMuczw8YnMpJnRoaXMuRE0sIGk7XG4gICAgICAgIGZvcihpID0gdGhpcy50LTE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICByW2krZHMrMV0gPSAodGhpc1tpXT4+Y2JzKXxjO1xuICAgICAgICAgICAgYyA9ICh0aGlzW2ldJmJtKTw8YnM7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGkgPSBkcy0xOyBpID49IDA7IC0taSkgcltpXSA9IDA7XG4gICAgICAgIHJbZHNdID0gYztcbiAgICAgICAgci50ID0gdGhpcy50K2RzKzE7XG4gICAgICAgIHIucyA9IHRoaXMucztcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzID4+IG5cbiAgICBmdW5jdGlvbiBibnBSU2hpZnRUbyhuLHIpIHtcbiAgICAgICAgci5zID0gdGhpcy5zO1xuICAgICAgICB2YXIgZHMgPSBNYXRoLmZsb29yKG4vdGhpcy5EQik7XG4gICAgICAgIGlmKGRzID49IHRoaXMudCkgeyByLnQgPSAwOyByZXR1cm47IH1cbiAgICAgICAgdmFyIGJzID0gbiV0aGlzLkRCO1xuICAgICAgICB2YXIgY2JzID0gdGhpcy5EQi1icztcbiAgICAgICAgdmFyIGJtID0gKDE8PGJzKS0xO1xuICAgICAgICByWzBdID0gdGhpc1tkc10+PmJzO1xuICAgICAgICBmb3IodmFyIGkgPSBkcysxOyBpIDwgdGhpcy50OyArK2kpIHtcbiAgICAgICAgICAgIHJbaS1kcy0xXSB8PSAodGhpc1tpXSZibSk8PGNicztcbiAgICAgICAgICAgIHJbaS1kc10gPSB0aGlzW2ldPj5icztcbiAgICAgICAgfVxuICAgICAgICBpZihicyA+IDApIHJbdGhpcy50LWRzLTFdIHw9ICh0aGlzLnMmYm0pPDxjYnM7XG4gICAgICAgIHIudCA9IHRoaXMudC1kcztcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzIC0gYVxuICAgIGZ1bmN0aW9uIGJucFN1YlRvKGEscikge1xuICAgICAgICB2YXIgaSA9IDAsIGMgPSAwLCBtID0gTWF0aC5taW4oYS50LHRoaXMudCk7XG4gICAgICAgIHdoaWxlKGkgPCBtKSB7XG4gICAgICAgICAgICBjICs9IHRoaXNbaV0tYVtpXTtcbiAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYS50IDwgdGhpcy50KSB7XG4gICAgICAgICAgICBjIC09IGEucztcbiAgICAgICAgICAgIHdoaWxlKGkgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgICAgICBjICs9IHRoaXNbaV07XG4gICAgICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjICs9IHRoaXMucztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGMgKz0gdGhpcy5zO1xuICAgICAgICAgICAgd2hpbGUoaSA8IGEudCkge1xuICAgICAgICAgICAgICAgIGMgLT0gYVtpXTtcbiAgICAgICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgLT0gYS5zO1xuICAgICAgICB9XG4gICAgICAgIHIucyA9IChjPDApPy0xOjA7XG4gICAgICAgIGlmKGMgPCAtMSkgcltpKytdID0gdGhpcy5EVitjO1xuICAgICAgICBlbHNlIGlmKGMgPiAwKSByW2krK10gPSBjO1xuICAgICAgICByLnQgPSBpO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgKiBhLCByICE9IHRoaXMsYSAoSEFDIDE0LjEyKVxuICAgIC8vIFwidGhpc1wiIHNob3VsZCBiZSB0aGUgbGFyZ2VyIG9uZSBpZiBhcHByb3ByaWF0ZS5cbiAgICBmdW5jdGlvbiBibnBNdWx0aXBseVRvKGEscikge1xuICAgICAgICB2YXIgeCA9IHRoaXMuYWJzKCksIHkgPSBhLmFicygpO1xuICAgICAgICB2YXIgaSA9IHgudDtcbiAgICAgICAgci50ID0gaSt5LnQ7XG4gICAgICAgIHdoaWxlKC0taSA+PSAwKSByW2ldID0gMDtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgeS50OyArK2kpIHJbaSt4LnRdID0geC5hbSgwLHlbaV0scixpLDAseC50KTtcbiAgICAgICAgci5zID0gMDtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgICAgICBpZih0aGlzLnMgIT0gYS5zKSBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8ocixyKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpc14yLCByICE9IHRoaXMgKEhBQyAxNC4xNilcbiAgICBmdW5jdGlvbiBibnBTcXVhcmVUbyhyKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5hYnMoKTtcbiAgICAgICAgdmFyIGkgPSByLnQgPSAyKngudDtcbiAgICAgICAgd2hpbGUoLS1pID49IDApIHJbaV0gPSAwO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCB4LnQtMTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgYyA9IHguYW0oaSx4W2ldLHIsMippLDAsMSk7XG4gICAgICAgICAgICBpZigocltpK3gudF0rPXguYW0oaSsxLDIqeFtpXSxyLDIqaSsxLGMseC50LWktMSkpID49IHguRFYpIHtcbiAgICAgICAgICAgICAgICByW2kreC50XSAtPSB4LkRWO1xuICAgICAgICAgICAgICAgIHJbaSt4LnQrMV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHIudCA+IDApIHJbci50LTFdICs9IHguYW0oaSx4W2ldLHIsMippLDAsMSk7XG4gICAgICAgIHIucyA9IDA7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cblxuICAgIC8vIChwcm90ZWN0ZWQpIGRpdmlkZSB0aGlzIGJ5IG0sIHF1b3RpZW50IGFuZCByZW1haW5kZXIgdG8gcSwgciAoSEFDIDE0LjIwKVxuICAgIC8vIHIgIT0gcSwgdGhpcyAhPSBtLiAgcSBvciByIG1heSBiZSBudWxsLlxuICAgIGZ1bmN0aW9uIGJucERpdlJlbVRvKG0scSxyKSB7XG4gICAgICAgIHZhciBwbSA9IG0uYWJzKCk7XG4gICAgICAgIGlmKHBtLnQgPD0gMCkgcmV0dXJuO1xuICAgICAgICB2YXIgcHQgPSB0aGlzLmFicygpO1xuICAgICAgICBpZihwdC50IDwgcG0udCkge1xuICAgICAgICAgICAgaWYocSAhPSBudWxsKSBxLmZyb21JbnQoMCk7XG4gICAgICAgICAgICBpZihyICE9IG51bGwpIHRoaXMuY29weVRvKHIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKHIgPT0gbnVsbCkgciA9IG5iaSgpO1xuICAgICAgICB2YXIgeSA9IG5iaSgpLCB0cyA9IHRoaXMucywgbXMgPSBtLnM7XG4gICAgICAgIHZhciBuc2ggPSB0aGlzLkRCLW5iaXRzKHBtW3BtLnQtMV0pO1x0Ly8gbm9ybWFsaXplIG1vZHVsdXNcbiAgICAgICAgaWYobnNoID4gMCkgeyBwbS5sU2hpZnRUbyhuc2gseSk7IHB0LmxTaGlmdFRvKG5zaCxyKTsgfVxuICAgICAgICBlbHNlIHsgcG0uY29weVRvKHkpOyBwdC5jb3B5VG8ocik7IH1cbiAgICAgICAgdmFyIHlzID0geS50O1xuICAgICAgICB2YXIgeTAgPSB5W3lzLTFdO1xuICAgICAgICBpZih5MCA9PSAwKSByZXR1cm47XG4gICAgICAgIHZhciB5dCA9IHkwKigxPDx0aGlzLkYxKSsoKHlzPjEpP3lbeXMtMl0+PnRoaXMuRjI6MCk7XG4gICAgICAgIHZhciBkMSA9IHRoaXMuRlYveXQsIGQyID0gKDE8PHRoaXMuRjEpL3l0LCBlID0gMTw8dGhpcy5GMjtcbiAgICAgICAgdmFyIGkgPSByLnQsIGogPSBpLXlzLCB0ID0gKHE9PW51bGwpP25iaSgpOnE7XG4gICAgICAgIHkuZGxTaGlmdFRvKGosdCk7XG4gICAgICAgIGlmKHIuY29tcGFyZVRvKHQpID49IDApIHtcbiAgICAgICAgICAgIHJbci50KytdID0gMTtcbiAgICAgICAgICAgIHIuc3ViVG8odCxyKTtcbiAgICAgICAgfVxuICAgICAgICBCaWdJbnRlZ2VyLk9ORS5kbFNoaWZ0VG8oeXMsdCk7XG4gICAgICAgIHQuc3ViVG8oeSx5KTtcdC8vIFwibmVnYXRpdmVcIiB5IHNvIHdlIGNhbiByZXBsYWNlIHN1YiB3aXRoIGFtIGxhdGVyXG4gICAgICAgIHdoaWxlKHkudCA8IHlzKSB5W3kudCsrXSA9IDA7XG4gICAgICAgIHdoaWxlKC0taiA+PSAwKSB7XG4gICAgICAgICAgICAvLyBFc3RpbWF0ZSBxdW90aWVudCBkaWdpdFxuICAgICAgICAgICAgdmFyIHFkID0gKHJbLS1pXT09eTApP3RoaXMuRE06TWF0aC5mbG9vcihyW2ldKmQxKyhyW2ktMV0rZSkqZDIpO1xuICAgICAgICAgICAgaWYoKHJbaV0rPXkuYW0oMCxxZCxyLGosMCx5cykpIDwgcWQpIHtcdC8vIFRyeSBpdCBvdXRcbiAgICAgICAgICAgICAgICB5LmRsU2hpZnRUbyhqLHQpO1xuICAgICAgICAgICAgICAgIHIuc3ViVG8odCxyKTtcbiAgICAgICAgICAgICAgICB3aGlsZShyW2ldIDwgLS1xZCkgci5zdWJUbyh0LHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHEgIT0gbnVsbCkge1xuICAgICAgICAgICAgci5kclNoaWZ0VG8oeXMscSk7XG4gICAgICAgICAgICBpZih0cyAhPSBtcykgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHEscSk7XG4gICAgICAgIH1cbiAgICAgICAgci50ID0geXM7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICAgICAgaWYobnNoID4gMCkgci5yU2hpZnRUbyhuc2gscik7XHQvLyBEZW5vcm1hbGl6ZSByZW1haW5kZXJcbiAgICAgICAgaWYodHMgPCAwKSBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8ocixyKTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIG1vZCBhXG4gICAgZnVuY3Rpb24gYm5Nb2QoYSkge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICB0aGlzLmFicygpLmRpdlJlbVRvKGEsbnVsbCxyKTtcbiAgICAgICAgaWYodGhpcy5zIDwgMCAmJiByLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLlpFUk8pID4gMCkgYS5zdWJUbyhyLHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyBNb2R1bGFyIHJlZHVjdGlvbiB1c2luZyBcImNsYXNzaWNcIiBhbGdvcml0aG1cbiAgICBmdW5jdGlvbiBDbGFzc2ljKG0pIHsgdGhpcy5tID0gbTsgfVxuICAgIGZ1bmN0aW9uIGNDb252ZXJ0KHgpIHtcbiAgICAgICAgaWYoeC5zIDwgMCB8fCB4LmNvbXBhcmVUbyh0aGlzLm0pID49IDApIHJldHVybiB4Lm1vZCh0aGlzLm0pO1xuICAgICAgICBlbHNlIHJldHVybiB4O1xuICAgIH1cbiAgICBmdW5jdGlvbiBjUmV2ZXJ0KHgpIHsgcmV0dXJuIHg7IH1cbiAgICBmdW5jdGlvbiBjUmVkdWNlKHgpIHsgeC5kaXZSZW1Ubyh0aGlzLm0sbnVsbCx4KTsgfVxuICAgIGZ1bmN0aW9uIGNNdWxUbyh4LHkscikgeyB4Lm11bHRpcGx5VG8oeSxyKTsgdGhpcy5yZWR1Y2Uocik7IH1cbiAgICBmdW5jdGlvbiBjU3FyVG8oeCxyKSB7IHguc3F1YXJlVG8ocik7IHRoaXMucmVkdWNlKHIpOyB9XG5cbiAgICBDbGFzc2ljLnByb3RvdHlwZS5jb252ZXJ0ID0gY0NvbnZlcnQ7XG4gICAgQ2xhc3NpYy5wcm90b3R5cGUucmV2ZXJ0ID0gY1JldmVydDtcbiAgICBDbGFzc2ljLnByb3RvdHlwZS5yZWR1Y2UgPSBjUmVkdWNlO1xuICAgIENsYXNzaWMucHJvdG90eXBlLm11bFRvID0gY011bFRvO1xuICAgIENsYXNzaWMucHJvdG90eXBlLnNxclRvID0gY1NxclRvO1xuXG4gICAgLy8gKHByb3RlY3RlZCkgcmV0dXJuIFwiLTEvdGhpcyAlIDJeREJcIjsgdXNlZnVsIGZvciBNb250LiByZWR1Y3Rpb25cbiAgICAvLyBqdXN0aWZpY2F0aW9uOlxuICAgIC8vICAgICAgICAgeHkgPT0gMSAobW9kIG0pXG4gICAgLy8gICAgICAgICB4eSA9ICAxK2ttXG4gICAgLy8gICB4eSgyLXh5KSA9ICgxK2ttKSgxLWttKVxuICAgIC8vIHhbeSgyLXh5KV0gPSAxLWteMm1eMlxuICAgIC8vIHhbeSgyLXh5KV0gPT0gMSAobW9kIG1eMilcbiAgICAvLyBpZiB5IGlzIDEveCBtb2QgbSwgdGhlbiB5KDIteHkpIGlzIDEveCBtb2QgbV4yXG4gICAgLy8gc2hvdWxkIHJlZHVjZSB4IGFuZCB5KDIteHkpIGJ5IG1eMiBhdCBlYWNoIHN0ZXAgdG8ga2VlcCBzaXplIGJvdW5kZWQuXG4gICAgLy8gSlMgbXVsdGlwbHkgXCJvdmVyZmxvd3NcIiBkaWZmZXJlbnRseSBmcm9tIEMvQysrLCBzbyBjYXJlIGlzIG5lZWRlZCBoZXJlLlxuICAgIGZ1bmN0aW9uIGJucEludkRpZ2l0KCkge1xuICAgICAgICBpZih0aGlzLnQgPCAxKSByZXR1cm4gMDtcbiAgICAgICAgdmFyIHggPSB0aGlzWzBdO1xuICAgICAgICBpZigoeCYxKSA9PSAwKSByZXR1cm4gMDtcbiAgICAgICAgdmFyIHkgPSB4JjM7XHRcdC8vIHkgPT0gMS94IG1vZCAyXjJcbiAgICAgICAgeSA9ICh5KigyLSh4JjB4ZikqeSkpJjB4ZjtcdC8vIHkgPT0gMS94IG1vZCAyXjRcbiAgICAgICAgeSA9ICh5KigyLSh4JjB4ZmYpKnkpKSYweGZmO1x0Ly8geSA9PSAxL3ggbW9kIDJeOFxuICAgICAgICB5ID0gKHkqKDItKCgoeCYweGZmZmYpKnkpJjB4ZmZmZikpKSYweGZmZmY7XHQvLyB5ID09IDEveCBtb2QgMl4xNlxuICAgICAgICAvLyBsYXN0IHN0ZXAgLSBjYWxjdWxhdGUgaW52ZXJzZSBtb2QgRFYgZGlyZWN0bHk7XG4gICAgICAgIC8vIGFzc3VtZXMgMTYgPCBEQiA8PSAzMiBhbmQgYXNzdW1lcyBhYmlsaXR5IHRvIGhhbmRsZSA0OC1iaXQgaW50c1xuICAgICAgICB5ID0gKHkqKDIteCp5JXRoaXMuRFYpKSV0aGlzLkRWO1x0XHQvLyB5ID09IDEveCBtb2QgMl5kYml0c1xuICAgICAgICAvLyB3ZSByZWFsbHkgd2FudCB0aGUgbmVnYXRpdmUgaW52ZXJzZSwgYW5kIC1EViA8IHkgPCBEVlxuICAgICAgICByZXR1cm4gKHk+MCk/dGhpcy5EVi15Oi15O1xuICAgIH1cblxuICAgIC8vIE1vbnRnb21lcnkgcmVkdWN0aW9uXG4gICAgZnVuY3Rpb24gTW9udGdvbWVyeShtKSB7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgICAgIHRoaXMubXAgPSBtLmludkRpZ2l0KCk7XG4gICAgICAgIHRoaXMubXBsID0gdGhpcy5tcCYweDdmZmY7XG4gICAgICAgIHRoaXMubXBoID0gdGhpcy5tcD4+MTU7XG4gICAgICAgIHRoaXMudW0gPSAoMTw8KG0uREItMTUpKS0xO1xuICAgICAgICB0aGlzLm10MiA9IDIqbS50O1xuICAgIH1cblxuICAgIC8vIHhSIG1vZCBtXG4gICAgZnVuY3Rpb24gbW9udENvbnZlcnQoeCkge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICB4LmFicygpLmRsU2hpZnRUbyh0aGlzLm0udCxyKTtcbiAgICAgICAgci5kaXZSZW1Ubyh0aGlzLm0sbnVsbCxyKTtcbiAgICAgICAgaWYoeC5zIDwgMCAmJiByLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLlpFUk8pID4gMCkgdGhpcy5tLnN1YlRvKHIscik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIHgvUiBtb2QgbVxuICAgIGZ1bmN0aW9uIG1vbnRSZXZlcnQoeCkge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICB4LmNvcHlUbyhyKTtcbiAgICAgICAgdGhpcy5yZWR1Y2Uocik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIHggPSB4L1IgbW9kIG0gKEhBQyAxNC4zMilcbiAgICBmdW5jdGlvbiBtb250UmVkdWNlKHgpIHtcbiAgICAgICAgd2hpbGUoeC50IDw9IHRoaXMubXQyKVx0Ly8gcGFkIHggc28gYW0gaGFzIGVub3VnaCByb29tIGxhdGVyXG4gICAgICAgICAgICB4W3gudCsrXSA9IDA7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm0udDsgKytpKSB7XG4gICAgICAgICAgICAvLyBmYXN0ZXIgd2F5IG9mIGNhbGN1bGF0aW5nIHUwID0geFtpXSptcCBtb2QgRFZcbiAgICAgICAgICAgIHZhciBqID0geFtpXSYweDdmZmY7XG4gICAgICAgICAgICB2YXIgdTAgPSAoaip0aGlzLm1wbCsoKChqKnRoaXMubXBoKyh4W2ldPj4xNSkqdGhpcy5tcGwpJnRoaXMudW0pPDwxNSkpJnguRE07XG4gICAgICAgICAgICAvLyB1c2UgYW0gdG8gY29tYmluZSB0aGUgbXVsdGlwbHktc2hpZnQtYWRkIGludG8gb25lIGNhbGxcbiAgICAgICAgICAgIGogPSBpK3RoaXMubS50O1xuICAgICAgICAgICAgeFtqXSArPSB0aGlzLm0uYW0oMCx1MCx4LGksMCx0aGlzLm0udCk7XG4gICAgICAgICAgICAvLyBwcm9wYWdhdGUgY2FycnlcbiAgICAgICAgICAgIHdoaWxlKHhbal0gPj0geC5EVikgeyB4W2pdIC09IHguRFY7IHhbKytqXSsrOyB9XG4gICAgICAgIH1cbiAgICAgICAgeC5jbGFtcCgpO1xuICAgICAgICB4LmRyU2hpZnRUbyh0aGlzLm0udCx4KTtcbiAgICAgICAgaWYoeC5jb21wYXJlVG8odGhpcy5tKSA+PSAwKSB4LnN1YlRvKHRoaXMubSx4KTtcbiAgICB9XG5cbiAgICAvLyByID0gXCJ4XjIvUiBtb2QgbVwiOyB4ICE9IHJcbiAgICBmdW5jdGlvbiBtb250U3FyVG8oeCxyKSB7IHguc3F1YXJlVG8ocik7IHRoaXMucmVkdWNlKHIpOyB9XG5cbiAgICAvLyByID0gXCJ4eS9SIG1vZCBtXCI7IHgseSAhPSByXG4gICAgZnVuY3Rpb24gbW9udE11bFRvKHgseSxyKSB7IHgubXVsdGlwbHlUbyh5LHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuXG4gICAgTW9udGdvbWVyeS5wcm90b3R5cGUuY29udmVydCA9IG1vbnRDb252ZXJ0O1xuICAgIE1vbnRnb21lcnkucHJvdG90eXBlLnJldmVydCA9IG1vbnRSZXZlcnQ7XG4gICAgTW9udGdvbWVyeS5wcm90b3R5cGUucmVkdWNlID0gbW9udFJlZHVjZTtcbiAgICBNb250Z29tZXJ5LnByb3RvdHlwZS5tdWxUbyA9IG1vbnRNdWxUbztcbiAgICBNb250Z29tZXJ5LnByb3RvdHlwZS5zcXJUbyA9IG1vbnRTcXJUbztcblxuICAgIC8vIChwcm90ZWN0ZWQpIHRydWUgaWZmIHRoaXMgaXMgZXZlblxuICAgIGZ1bmN0aW9uIGJucElzRXZlbigpIHsgcmV0dXJuICgodGhpcy50PjApPyh0aGlzWzBdJjEpOnRoaXMucykgPT0gMDsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdGhpc15lLCBlIDwgMl4zMiwgZG9pbmcgc3FyIGFuZCBtdWwgd2l0aCBcInJcIiAoSEFDIDE0Ljc5KVxuICAgIGZ1bmN0aW9uIGJucEV4cChlLHopIHtcbiAgICAgICAgICAgIGlmKGUgPiAweGZmZmZmZmZmIHx8IGUgPCAxKSByZXR1cm4gQmlnSW50ZWdlci5PTkU7XG4gICAgICAgICAgICB2YXIgciA9IG5iaSgpLCByMiA9IG5iaSgpLCBnID0gei5jb252ZXJ0KHRoaXMpLCBpID0gbmJpdHMoZSktMTtcbiAgICAgICAgICAgIGcuY29weVRvKHIpO1xuICAgICAgICAgICAgd2hpbGUoLS1pID49IDApIHtcbiAgICAgICAgICAgICAgICB6LnNxclRvKHIscjIpO1xuICAgICAgICAgICAgICAgIGlmKChlJigxPDxpKSkgPiAwKSB6Lm11bFRvKHIyLGcscik7XG4gICAgICAgICAgICAgICAgZWxzZSB7IHZhciB0ID0gcjsgciA9IHIyOyByMiA9IHQ7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB6LnJldmVydChyKTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzXmUgJSBtLCAwIDw9IGUgPCAyXjMyXG4gICAgZnVuY3Rpb24gYm5Nb2RQb3dJbnQoZSxtKSB7XG4gICAgICAgIHZhciB6O1xuICAgICAgICBpZihlIDwgMjU2IHx8IG0uaXNFdmVuKCkpIHogPSBuZXcgQ2xhc3NpYyhtKTsgZWxzZSB6ID0gbmV3IE1vbnRnb21lcnkobSk7XG4gICAgICAgIHJldHVybiB0aGlzLmV4cChlLHopO1xuICAgIH1cblxuICAgIC8vIHByb3RlY3RlZFxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNvcHlUbyA9IGJucENvcHlUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tSW50ID0gYm5wRnJvbUludDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tU3RyaW5nID0gYm5wRnJvbVN0cmluZztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbGFtcCA9IGJucENsYW1wO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRsU2hpZnRUbyA9IGJucERMU2hpZnRUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kclNoaWZ0VG8gPSBibnBEUlNoaWZ0VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubFNoaWZ0VG8gPSBibnBMU2hpZnRUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5yU2hpZnRUbyA9IGJucFJTaGlmdFRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnN1YlRvID0gYm5wU3ViVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHlUbyA9IGJucE11bHRpcGx5VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc3F1YXJlVG8gPSBibnBTcXVhcmVUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZSZW1UbyA9IGJucERpdlJlbVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmludkRpZ2l0ID0gYm5wSW52RGlnaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuID0gYm5wSXNFdmVuO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmJucEV4cCA9IGJucEV4cDtcblxuICAgIC8vIHB1YmxpY1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nID0gYm5Ub1N0cmluZztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGUgPSBibk5lZ2F0ZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hYnMgPSBibkFicztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlVG8gPSBibkNvbXBhcmVUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGggPSBibkJpdExlbmd0aDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2QgPSBibk1vZDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3dJbnQgPSBibk1vZFBvd0ludDtcblxuICAgIC8vIFwiY29uc3RhbnRzXCJcbiAgICBCaWdJbnRlZ2VyLlpFUk8gPSBuYnYoMCk7XG4gICAgQmlnSW50ZWdlci5PTkUgPSBuYnYoMSk7XG5cbiAgICAvLyBDb3B5cmlnaHQgKGMpIDIwMDUtMjAwOSAgVG9tIFd1XG4gICAgLy8gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICAvLyBTZWUgXCJMSUNFTlNFXCIgZm9yIGRldGFpbHMuXG5cbiAgICAvLyBFeHRlbmRlZCBKYXZhU2NyaXB0IEJOIGZ1bmN0aW9ucywgcmVxdWlyZWQgZm9yIFJTQSBwcml2YXRlIG9wcy5cblxuICAgIC8vIFZlcnNpb24gMS4xOiBuZXcgQmlnSW50ZWdlcihcIjBcIiwgMTApIHJldHVybnMgXCJwcm9wZXJcIiB6ZXJvXG5cbiAgICAvLyAocHVibGljKVxuICAgIGZ1bmN0aW9uIGJuQ2xvbmUoKSB7IHZhciByID0gbmJpKCk7IHRoaXMuY29weVRvKHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIHZhbHVlIGFzIGludGVnZXJcbiAgICBmdW5jdGlvbiBibkludFZhbHVlKCkge1xuICAgICAgICBpZih0aGlzLnMgPCAwKSB7XG4gICAgICAgICAgICBpZih0aGlzLnQgPT0gMSkgcmV0dXJuIHRoaXNbMF0tdGhpcy5EVjtcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy50ID09IDApIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMudCA9PSAxKSByZXR1cm4gdGhpc1swXTtcbiAgICAgICAgZWxzZSBpZih0aGlzLnQgPT0gMCkgcmV0dXJuIDA7XG4gICAgICAgIC8vIGFzc3VtZXMgMTYgPCBEQiA8IDMyXG4gICAgICAgIHJldHVybiAoKHRoaXNbMV0mKCgxPDwoMzItdGhpcy5EQikpLTEpKTw8dGhpcy5EQil8dGhpc1swXTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gdmFsdWUgYXMgYnl0ZVxuICAgIGZ1bmN0aW9uIGJuQnl0ZVZhbHVlKCkgeyByZXR1cm4gKHRoaXMudD09MCk/dGhpcy5zOih0aGlzWzBdPDwyNCk+PjI0OyB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gdmFsdWUgYXMgc2hvcnQgKGFzc3VtZXMgREI+PTE2KVxuICAgIGZ1bmN0aW9uIGJuU2hvcnRWYWx1ZSgpIHsgcmV0dXJuICh0aGlzLnQ9PTApP3RoaXMuczoodGhpc1swXTw8MTYpPj4xNjsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgcmV0dXJuIHggcy50LiByXnggPCBEVlxuICAgIGZ1bmN0aW9uIGJucENodW5rU2l6ZShyKSB7IHJldHVybiBNYXRoLmZsb29yKE1hdGguTE4yKnRoaXMuREIvTWF0aC5sb2cocikpOyB9XG5cbiAgICAvLyAocHVibGljKSAwIGlmIHRoaXMgPT0gMCwgMSBpZiB0aGlzID4gMFxuICAgIGZ1bmN0aW9uIGJuU2lnTnVtKCkge1xuICAgICAgICBpZih0aGlzLnMgPCAwKSByZXR1cm4gLTE7XG4gICAgICAgIGVsc2UgaWYodGhpcy50IDw9IDAgfHwgKHRoaXMudCA9PSAxICYmIHRoaXNbMF0gPD0gMCkpIHJldHVybiAwO1xuICAgICAgICBlbHNlIHJldHVybiAxO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIGNvbnZlcnQgdG8gcmFkaXggc3RyaW5nXG4gICAgZnVuY3Rpb24gYm5wVG9SYWRpeChiKSB7XG4gICAgICAgIGlmKGIgPT0gbnVsbCkgYiA9IDEwO1xuICAgICAgICBpZih0aGlzLnNpZ251bSgpID09IDAgfHwgYiA8IDIgfHwgYiA+IDM2KSByZXR1cm4gXCIwXCI7XG4gICAgICAgIHZhciBjcyA9IHRoaXMuY2h1bmtTaXplKGIpO1xuICAgICAgICB2YXIgYSA9IE1hdGgucG93KGIsY3MpO1xuICAgICAgICB2YXIgZCA9IG5idihhKSwgeSA9IG5iaSgpLCB6ID0gbmJpKCksIHIgPSBcIlwiO1xuICAgICAgICB0aGlzLmRpdlJlbVRvKGQseSx6KTtcbiAgICAgICAgd2hpbGUoeS5zaWdudW0oKSA+IDApIHtcbiAgICAgICAgICAgIHIgPSAoYSt6LmludFZhbHVlKCkpLnRvU3RyaW5nKGIpLnN1YnN0cigxKSArIHI7XG4gICAgICAgICAgICB5LmRpdlJlbVRvKGQseSx6KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gei5pbnRWYWx1ZSgpLnRvU3RyaW5nKGIpICsgcjtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBjb252ZXJ0IGZyb20gcmFkaXggc3RyaW5nXG4gICAgZnVuY3Rpb24gYm5wRnJvbVJhZGl4KHMsYikge1xuICAgICAgICB0aGlzLmZyb21JbnQoMCk7XG4gICAgICAgIGlmKGIgPT0gbnVsbCkgYiA9IDEwO1xuICAgICAgICB2YXIgY3MgPSB0aGlzLmNodW5rU2l6ZShiKTtcbiAgICAgICAgdmFyIGQgPSBNYXRoLnBvdyhiLGNzKSwgbWkgPSBmYWxzZSwgaiA9IDAsIHcgPSAwO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHggPSBpbnRBdChzLGkpO1xuICAgICAgICAgICAgaWYoeCA8IDApIHtcbiAgICAgICAgICAgICAgICBpZihzLmNoYXJBdChpKSA9PSBcIi1cIiAmJiB0aGlzLnNpZ251bSgpID09IDApIG1pID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHcgPSBiKncreDtcbiAgICAgICAgICAgIGlmKCsraiA+PSBjcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZE11bHRpcGx5KGQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZEFkZE9mZnNldCh3LDApO1xuICAgICAgICAgICAgICAgIGogPSAwO1xuICAgICAgICAgICAgICAgIHcgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGogPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmRNdWx0aXBseShNYXRoLnBvdyhiLGopKTtcbiAgICAgICAgICAgIHRoaXMuZEFkZE9mZnNldCh3LDApO1xuICAgICAgICB9XG4gICAgICAgIGlmKG1pKSBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8odGhpcyx0aGlzKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBhbHRlcm5hdGUgY29uc3RydWN0b3JcbiAgICBmdW5jdGlvbiBibnBGcm9tTnVtYmVyKGEsYixjKSB7XG4gICAgICAgIGlmKFwibnVtYmVyXCIgPT0gdHlwZW9mIGIpIHtcbiAgICAgICAgICAgIC8vIG5ldyBCaWdJbnRlZ2VyKGludCxpbnQsUk5HKVxuICAgICAgICAgICAgaWYoYSA8IDIpIHRoaXMuZnJvbUludCgxKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJvbU51bWJlcihhLGMpO1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLnRlc3RCaXQoYS0xKSlcdC8vIGZvcmNlIE1TQiBzZXRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaXR3aXNlVG8oQmlnSW50ZWdlci5PTkUuc2hpZnRMZWZ0KGEtMSksb3Bfb3IsdGhpcyk7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5pc0V2ZW4oKSkgdGhpcy5kQWRkT2Zmc2V0KDEsMCk7IC8vIGZvcmNlIG9kZFxuICAgICAgICAgICAgICAgIHdoaWxlKCF0aGlzLmlzUHJvYmFibGVQcmltZShiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRBZGRPZmZzZXQoMiwwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5iaXRMZW5ndGgoKSA+IGEpIHRoaXMuc3ViVG8oQmlnSW50ZWdlci5PTkUuc2hpZnRMZWZ0KGEtMSksdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gbmV3IEJpZ0ludGVnZXIoaW50LFJORylcbiAgICAgICAgICAgIHZhciB4ID0gW10sIHQgPSBhJjc7XG4gICAgICAgICAgICB4Lmxlbmd0aCA9IChhPj4zKSsxO1xuICAgICAgICAgICAgYi5uZXh0Qnl0ZXMoeCk7XG4gICAgICAgICAgICBpZih0ID4gMCkgeFswXSAmPSAoKDE8PHQpLTEpOyBlbHNlIHhbMF0gPSAwO1xuICAgICAgICAgICAgdGhpcy5mcm9tU3RyaW5nKHgsMjU2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIGNvbnZlcnQgdG8gYmlnZW5kaWFuIGJ5dGUgYXJyYXlcbiAgICBmdW5jdGlvbiBiblRvQnl0ZUFycmF5KCkge1xuICAgICAgICB2YXIgaSA9IHRoaXMudCwgciA9IFtdO1xuICAgICAgICByWzBdID0gdGhpcy5zO1xuICAgICAgICB2YXIgcCA9IHRoaXMuREItKGkqdGhpcy5EQiklOCwgZCwgayA9IDA7XG4gICAgICAgIGlmKGktLSA+IDApIHtcbiAgICAgICAgICAgIGlmKHAgPCB0aGlzLkRCICYmIChkID0gdGhpc1tpXT4+cCkgIT0gKHRoaXMucyZ0aGlzLkRNKT4+cClcbiAgICAgICAgICAgICAgICByW2srK10gPSBkfCh0aGlzLnM8PCh0aGlzLkRCLXApKTtcbiAgICAgICAgICAgIHdoaWxlKGkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmKHAgPCA4KSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSAodGhpc1tpXSYoKDE8PHApLTEpKTw8KDgtcCk7XG4gICAgICAgICAgICAgICAgICAgIGQgfD0gdGhpc1stLWldPj4ocCs9dGhpcy5EQi04KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSAodGhpc1tpXT4+KHAtPTgpKSYweGZmO1xuICAgICAgICAgICAgICAgICAgICBpZihwIDw9IDApIHsgcCArPSB0aGlzLkRCOyAtLWk7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoKGQmMHg4MCkgIT0gMCkgZCB8PSAtMjU2O1xuICAgICAgICAgICAgICAgIGlmKGsgPT0gMCAmJiAodGhpcy5zJjB4ODApICE9IChkJjB4ODApKSArK2s7XG4gICAgICAgICAgICAgICAgaWYoayA+IDAgfHwgZCAhPSB0aGlzLnMpIHJbaysrXSA9IGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYm5FcXVhbHMoYSkgeyByZXR1cm4odGhpcy5jb21wYXJlVG8oYSk9PTApOyB9XG4gICAgZnVuY3Rpb24gYm5NaW4oYSkgeyByZXR1cm4odGhpcy5jb21wYXJlVG8oYSk8MCk/dGhpczphOyB9XG4gICAgZnVuY3Rpb24gYm5NYXgoYSkgeyByZXR1cm4odGhpcy5jb21wYXJlVG8oYSk+MCk/dGhpczphOyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyBvcCBhIChiaXR3aXNlKVxuICAgIGZ1bmN0aW9uIGJucEJpdHdpc2VUbyhhLG9wLHIpIHtcbiAgICAgICAgdmFyIGksIGYsIG0gPSBNYXRoLm1pbihhLnQsdGhpcy50KTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgbTsgKytpKSByW2ldID0gb3AodGhpc1tpXSxhW2ldKTtcbiAgICAgICAgaWYoYS50IDwgdGhpcy50KSB7XG4gICAgICAgICAgICBmID0gYS5zJnRoaXMuRE07XG4gICAgICAgICAgICBmb3IoaSA9IG07IGkgPCB0aGlzLnQ7ICsraSkgcltpXSA9IG9wKHRoaXNbaV0sZik7XG4gICAgICAgICAgICByLnQgPSB0aGlzLnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmID0gdGhpcy5zJnRoaXMuRE07XG4gICAgICAgICAgICBmb3IoaSA9IG07IGkgPCBhLnQ7ICsraSkgcltpXSA9IG9wKGYsYVtpXSk7XG4gICAgICAgICAgICByLnQgPSBhLnQ7XG4gICAgICAgIH1cbiAgICAgICAgci5zID0gb3AodGhpcy5zLGEucyk7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICYgYVxuICAgIGZ1bmN0aW9uIG9wX2FuZCh4LHkpIHsgcmV0dXJuIHgmeTsgfVxuICAgIGZ1bmN0aW9uIGJuQW5kKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5iaXR3aXNlVG8oYSxvcF9hbmQscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIHwgYVxuICAgIGZ1bmN0aW9uIG9wX29yKHgseSkgeyByZXR1cm4geHx5OyB9XG4gICAgZnVuY3Rpb24gYm5PcihhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuYml0d2lzZVRvKGEsb3Bfb3Iscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIF4gYVxuICAgIGZ1bmN0aW9uIG9wX3hvcih4LHkpIHsgcmV0dXJuIHheeTsgfVxuICAgIGZ1bmN0aW9uIGJuWG9yKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5iaXR3aXNlVG8oYSxvcF94b3Iscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICYgfmFcbiAgICBmdW5jdGlvbiBvcF9hbmRub3QoeCx5KSB7IHJldHVybiB4Jn55OyB9XG4gICAgZnVuY3Rpb24gYm5BbmROb3QoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmJpdHdpc2VUbyhhLG9wX2FuZG5vdCxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIH50aGlzXG4gICAgZnVuY3Rpb24gYm5Ob3QoKSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnQ7ICsraSkgcltpXSA9IHRoaXMuRE0mfnRoaXNbaV07XG4gICAgICAgIHIudCA9IHRoaXMudDtcbiAgICAgICAgci5zID0gfnRoaXMucztcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyA8PCBuXG4gICAgZnVuY3Rpb24gYm5TaGlmdExlZnQobikge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICBpZihuIDwgMCkgdGhpcy5yU2hpZnRUbygtbixyKTsgZWxzZSB0aGlzLmxTaGlmdFRvKG4scik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgPj4gblxuICAgIGZ1bmN0aW9uIGJuU2hpZnRSaWdodChuKSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIGlmKG4gPCAwKSB0aGlzLmxTaGlmdFRvKC1uLHIpOyBlbHNlIHRoaXMuclNoaWZ0VG8obixyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIGluZGV4IG9mIGxvd2VzdCAxLWJpdCBpbiB4LCB4IDwgMl4zMVxuICAgIGZ1bmN0aW9uIGxiaXQoeCkge1xuICAgICAgICBpZih4ID09IDApIHJldHVybiAtMTtcbiAgICAgICAgdmFyIHIgPSAwO1xuICAgICAgICBpZigoeCYweGZmZmYpID09IDApIHsgeCA+Pj0gMTY7IHIgKz0gMTY7IH1cbiAgICAgICAgaWYoKHgmMHhmZikgPT0gMCkgeyB4ID4+PSA4OyByICs9IDg7IH1cbiAgICAgICAgaWYoKHgmMHhmKSA9PSAwKSB7IHggPj49IDQ7IHIgKz0gNDsgfVxuICAgICAgICBpZigoeCYzKSA9PSAwKSB7IHggPj49IDI7IHIgKz0gMjsgfVxuICAgICAgICBpZigoeCYxKSA9PSAwKSArK3I7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybnMgaW5kZXggb2YgbG93ZXN0IDEtYml0IChvciAtMSBpZiBub25lKVxuICAgIGZ1bmN0aW9uIGJuR2V0TG93ZXN0U2V0Qml0KCkge1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy50OyArK2kpXG4gICAgICAgICAgICBpZih0aGlzW2ldICE9IDApIHJldHVybiBpKnRoaXMuREIrbGJpdCh0aGlzW2ldKTtcbiAgICAgICAgaWYodGhpcy5zIDwgMCkgcmV0dXJuIHRoaXMudCp0aGlzLkRCO1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIG51bWJlciBvZiAxIGJpdHMgaW4geFxuICAgIGZ1bmN0aW9uIGNiaXQoeCkge1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIHdoaWxlKHggIT0gMCkgeyB4ICY9IHgtMTsgKytyOyB9XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiBudW1iZXIgb2Ygc2V0IGJpdHNcbiAgICBmdW5jdGlvbiBibkJpdENvdW50KCkge1xuICAgICAgICB2YXIgciA9IDAsIHggPSB0aGlzLnMmdGhpcy5ETTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKSByICs9IGNiaXQodGhpc1tpXV54KTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdHJ1ZSBpZmYgbnRoIGJpdCBpcyBzZXRcbiAgICBmdW5jdGlvbiBiblRlc3RCaXQobikge1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3Iobi90aGlzLkRCKTtcbiAgICAgICAgaWYoaiA+PSB0aGlzLnQpIHJldHVybih0aGlzLnMhPTApO1xuICAgICAgICByZXR1cm4oKHRoaXNbal0mKDE8PChuJXRoaXMuREIpKSkhPTApO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRoaXMgb3AgKDE8PG4pXG4gICAgZnVuY3Rpb24gYm5wQ2hhbmdlQml0KG4sb3ApIHtcbiAgICAgICAgdmFyIHIgPSBCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQobik7XG4gICAgICAgIHRoaXMuYml0d2lzZVRvKHIsb3Ascik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgfCAoMTw8bilcbiAgICBmdW5jdGlvbiBiblNldEJpdChuKSB7IHJldHVybiB0aGlzLmNoYW5nZUJpdChuLG9wX29yKTsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAmIH4oMTw8bilcbiAgICBmdW5jdGlvbiBibkNsZWFyQml0KG4pIHsgcmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3BfYW5kbm90KTsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyBeICgxPDxuKVxuICAgIGZ1bmN0aW9uIGJuRmxpcEJpdChuKSB7IHJldHVybiB0aGlzLmNoYW5nZUJpdChuLG9wX3hvcik7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzICsgYVxuICAgIGZ1bmN0aW9uIGJucEFkZFRvKGEscikge1xuICAgICAgICB2YXIgaSA9IDAsIGMgPSAwLCBtID0gTWF0aC5taW4oYS50LHRoaXMudCk7XG4gICAgICAgIHdoaWxlKGkgPCBtKSB7XG4gICAgICAgICAgICBjICs9IHRoaXNbaV0rYVtpXTtcbiAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYS50IDwgdGhpcy50KSB7XG4gICAgICAgICAgICBjICs9IGEucztcbiAgICAgICAgICAgIHdoaWxlKGkgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgICAgICBjICs9IHRoaXNbaV07XG4gICAgICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjICs9IHRoaXMucztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGMgKz0gdGhpcy5zO1xuICAgICAgICAgICAgd2hpbGUoaSA8IGEudCkge1xuICAgICAgICAgICAgICAgIGMgKz0gYVtpXTtcbiAgICAgICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgKz0gYS5zO1xuICAgICAgICB9XG4gICAgICAgIHIucyA9IChjPDApPy0xOjA7XG4gICAgICAgIGlmKGMgPiAwKSByW2krK10gPSBjO1xuICAgICAgICBlbHNlIGlmKGMgPCAtMSkgcltpKytdID0gdGhpcy5EVitjO1xuICAgICAgICByLnQgPSBpO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyArIGFcbiAgICBmdW5jdGlvbiBibkFkZChhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuYWRkVG8oYSxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgLSBhXG4gICAgZnVuY3Rpb24gYm5TdWJ0cmFjdChhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuc3ViVG8oYSxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgKiBhXG4gICAgZnVuY3Rpb24gYm5NdWx0aXBseShhKSB7IHZhciByID0gbmJpKCk7IHRoaXMubXVsdGlwbHlUbyhhLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAvIGFcbiAgICBmdW5jdGlvbiBibkRpdmlkZShhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuZGl2UmVtVG8oYSxyLG51bGwpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAlIGFcbiAgICBmdW5jdGlvbiBiblJlbWFpbmRlcihhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuZGl2UmVtVG8oYSxudWxsLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgW3RoaXMvYSx0aGlzJWFdXG4gICAgZnVuY3Rpb24gYm5EaXZpZGVBbmRSZW1haW5kZXIoYSkge1xuICAgICAgICB2YXIgcSA9IG5iaSgpLCByID0gbmJpKCk7XG4gICAgICAgIHRoaXMuZGl2UmVtVG8oYSxxLHIpO1xuICAgICAgICByZXR1cm4gW3Escl07XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdGhpcyAqPSBuLCB0aGlzID49IDAsIDEgPCBuIDwgRFZcbiAgICBmdW5jdGlvbiBibnBETXVsdGlwbHkobikge1xuICAgICAgICB0aGlzW3RoaXMudF0gPSB0aGlzLmFtKDAsbi0xLHRoaXMsMCwwLHRoaXMudCk7XG4gICAgICAgICsrdGhpcy50O1xuICAgICAgICB0aGlzLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdGhpcyArPSBuIDw8IHcgd29yZHMsIHRoaXMgPj0gMFxuICAgIGZ1bmN0aW9uIGJucERBZGRPZmZzZXQobix3KSB7XG4gICAgICAgIGlmKG4gPT0gMCkgcmV0dXJuO1xuICAgICAgICB3aGlsZSh0aGlzLnQgPD0gdykgdGhpc1t0aGlzLnQrK10gPSAwO1xuICAgICAgICB0aGlzW3ddICs9IG47XG4gICAgICAgIHdoaWxlKHRoaXNbd10gPj0gdGhpcy5EVikge1xuICAgICAgICAgICAgdGhpc1t3XSAtPSB0aGlzLkRWO1xuICAgICAgICAgICAgaWYoKyt3ID49IHRoaXMudCkgdGhpc1t0aGlzLnQrK10gPSAwO1xuICAgICAgICAgICAgKyt0aGlzW3ddO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQSBcIm51bGxcIiByZWR1Y2VyXG4gICAgZnVuY3Rpb24gTnVsbEV4cCgpIHt9XG4gICAgZnVuY3Rpb24gbk5vcCh4KSB7IHJldHVybiB4OyB9XG4gICAgZnVuY3Rpb24gbk11bFRvKHgseSxyKSB7IHgubXVsdGlwbHlUbyh5LHIpOyB9XG4gICAgZnVuY3Rpb24gblNxclRvKHgscikgeyB4LnNxdWFyZVRvKHIpOyB9XG5cbiAgICBOdWxsRXhwLnByb3RvdHlwZS5jb252ZXJ0ID0gbk5vcDtcbiAgICBOdWxsRXhwLnByb3RvdHlwZS5yZXZlcnQgPSBuTm9wO1xuICAgIE51bGxFeHAucHJvdG90eXBlLm11bFRvID0gbk11bFRvO1xuICAgIE51bGxFeHAucHJvdG90eXBlLnNxclRvID0gblNxclRvO1xuXG4gICAgLy8gKHB1YmxpYykgdGhpc15lXG4gICAgZnVuY3Rpb24gYm5Qb3coZSkgeyByZXR1cm4gdGhpcy5ibnBFeHAoZSxuZXcgTnVsbEV4cCgpKTsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IGxvd2VyIG4gd29yZHMgb2YgXCJ0aGlzICogYVwiLCBhLnQgPD0gblxuICAgIC8vIFwidGhpc1wiIHNob3VsZCBiZSB0aGUgbGFyZ2VyIG9uZSBpZiBhcHByb3ByaWF0ZS5cbiAgICBmdW5jdGlvbiBibnBNdWx0aXBseUxvd2VyVG8oYSxuLHIpIHtcbiAgICAgICAgdmFyIGkgPSBNYXRoLm1pbih0aGlzLnQrYS50LG4pO1xuICAgICAgICByLnMgPSAwOyAvLyBhc3N1bWVzIGEsdGhpcyA+PSAwXG4gICAgICAgIHIudCA9IGk7XG4gICAgICAgIHdoaWxlKGkgPiAwKSByWy0taV0gPSAwO1xuICAgICAgICB2YXIgajtcbiAgICAgICAgZm9yKGogPSByLnQtdGhpcy50OyBpIDwgajsgKytpKSByW2krdGhpcy50XSA9IHRoaXMuYW0oMCxhW2ldLHIsaSwwLHRoaXMudCk7XG4gICAgICAgIGZvcihqID0gTWF0aC5taW4oYS50LG4pOyBpIDwgajsgKytpKSB0aGlzLmFtKDAsYVtpXSxyLGksMCxuLWkpO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IFwidGhpcyAqIGFcIiB3aXRob3V0IGxvd2VyIG4gd29yZHMsIG4gPiAwXG4gICAgLy8gXCJ0aGlzXCIgc2hvdWxkIGJlIHRoZSBsYXJnZXIgb25lIGlmIGFwcHJvcHJpYXRlLlxuICAgIGZ1bmN0aW9uIGJucE11bHRpcGx5VXBwZXJUbyhhLG4scikge1xuICAgICAgICAtLW47XG4gICAgICAgIHZhciBpID0gci50ID0gdGhpcy50K2EudC1uO1xuICAgICAgICByLnMgPSAwOyAvLyBhc3N1bWVzIGEsdGhpcyA+PSAwXG4gICAgICAgIHdoaWxlKC0taSA+PSAwKSByW2ldID0gMDtcbiAgICAgICAgZm9yKGkgPSBNYXRoLm1heChuLXRoaXMudCwwKTsgaSA8IGEudDsgKytpKVxuICAgICAgICAgICAgclt0aGlzLnQraS1uXSA9IHRoaXMuYW0obi1pLGFbaV0sciwwLDAsdGhpcy50K2ktbik7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICAgICAgci5kclNoaWZ0VG8oMSxyKTtcbiAgICB9XG5cbiAgICAvLyBCYXJyZXR0IG1vZHVsYXIgcmVkdWN0aW9uXG4gICAgZnVuY3Rpb24gQmFycmV0dChtKSB7XG4gICAgICAgIC8vIHNldHVwIEJhcnJldHRcbiAgICAgICAgdGhpcy5yMiA9IG5iaSgpO1xuICAgICAgICB0aGlzLnEzID0gbmJpKCk7XG4gICAgICAgIEJpZ0ludGVnZXIuT05FLmRsU2hpZnRUbygyKm0udCx0aGlzLnIyKTtcbiAgICAgICAgdGhpcy5tdSA9IHRoaXMucjIuZGl2aWRlKG0pO1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJhcnJldHRDb252ZXJ0KHgpIHtcbiAgICAgICAgaWYoeC5zIDwgMCB8fCB4LnQgPiAyKnRoaXMubS50KSByZXR1cm4geC5tb2QodGhpcy5tKTtcbiAgICAgICAgZWxzZSBpZih4LmNvbXBhcmVUbyh0aGlzLm0pIDwgMCkgcmV0dXJuIHg7XG4gICAgICAgIGVsc2UgeyB2YXIgciA9IG5iaSgpOyB4LmNvcHlUbyhyKTsgdGhpcy5yZWR1Y2Uocik7IHJldHVybiByOyB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFycmV0dFJldmVydCh4KSB7IHJldHVybiB4OyB9XG5cbiAgICAvLyB4ID0geCBtb2QgbSAoSEFDIDE0LjQyKVxuICAgIGZ1bmN0aW9uIGJhcnJldHRSZWR1Y2UoeCkge1xuICAgICAgICB4LmRyU2hpZnRUbyh0aGlzLm0udC0xLHRoaXMucjIpO1xuICAgICAgICBpZih4LnQgPiB0aGlzLm0udCsxKSB7IHgudCA9IHRoaXMubS50KzE7IHguY2xhbXAoKTsgfVxuICAgICAgICB0aGlzLm11Lm11bHRpcGx5VXBwZXJUbyh0aGlzLnIyLHRoaXMubS50KzEsdGhpcy5xMyk7XG4gICAgICAgIHRoaXMubS5tdWx0aXBseUxvd2VyVG8odGhpcy5xMyx0aGlzLm0udCsxLHRoaXMucjIpO1xuICAgICAgICB3aGlsZSh4LmNvbXBhcmVUbyh0aGlzLnIyKSA8IDApIHguZEFkZE9mZnNldCgxLHRoaXMubS50KzEpO1xuICAgICAgICB4LnN1YlRvKHRoaXMucjIseCk7XG4gICAgICAgIHdoaWxlKHguY29tcGFyZVRvKHRoaXMubSkgPj0gMCkgeC5zdWJUbyh0aGlzLm0seCk7XG4gICAgfVxuXG4gICAgLy8gciA9IHheMiBtb2QgbTsgeCAhPSByXG4gICAgZnVuY3Rpb24gYmFycmV0dFNxclRvKHgscikgeyB4LnNxdWFyZVRvKHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuXG4gICAgLy8gciA9IHgqeSBtb2QgbTsgeCx5ICE9IHJcbiAgICBmdW5jdGlvbiBiYXJyZXR0TXVsVG8oeCx5LHIpIHsgeC5tdWx0aXBseVRvKHkscik7IHRoaXMucmVkdWNlKHIpOyB9XG5cbiAgICBCYXJyZXR0LnByb3RvdHlwZS5jb252ZXJ0ID0gYmFycmV0dENvbnZlcnQ7XG4gICAgQmFycmV0dC5wcm90b3R5cGUucmV2ZXJ0ID0gYmFycmV0dFJldmVydDtcbiAgICBCYXJyZXR0LnByb3RvdHlwZS5yZWR1Y2UgPSBiYXJyZXR0UmVkdWNlO1xuICAgIEJhcnJldHQucHJvdG90eXBlLm11bFRvID0gYmFycmV0dE11bFRvO1xuICAgIEJhcnJldHQucHJvdG90eXBlLnNxclRvID0gYmFycmV0dFNxclRvO1xuXG4gICAgLy8gKHB1YmxpYykgdGhpc15lICUgbSAoSEFDIDE0Ljg1KVxuICAgIGZ1bmN0aW9uIGJuTW9kUG93KGUsbSkge1xuICAgICAgICB2YXIgaSA9IGUuYml0TGVuZ3RoKCksIGssIHIgPSBuYnYoMSksIHo7XG4gICAgICAgIGlmKGkgPD0gMCkgcmV0dXJuIHI7XG4gICAgICAgIGVsc2UgaWYoaSA8IDE4KSBrID0gMTtcbiAgICAgICAgZWxzZSBpZihpIDwgNDgpIGsgPSAzO1xuICAgICAgICBlbHNlIGlmKGkgPCAxNDQpIGsgPSA0O1xuICAgICAgICBlbHNlIGlmKGkgPCA3NjgpIGsgPSA1O1xuICAgICAgICBlbHNlIGsgPSA2O1xuICAgICAgICBpZihpIDwgOClcbiAgICAgICAgICAgIHogPSBuZXcgQ2xhc3NpYyhtKTtcbiAgICAgICAgZWxzZSBpZihtLmlzRXZlbigpKVxuICAgICAgICAgICAgeiA9IG5ldyBCYXJyZXR0KG0pO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB6ID0gbmV3IE1vbnRnb21lcnkobSk7XG5cbiAgICAgICAgLy8gcHJlY29tcHV0YXRpb25cbiAgICAgICAgdmFyIGcgPSBbXSwgbiA9IDMsIGsxID0gay0xLCBrbSA9ICgxPDxrKS0xO1xuICAgICAgICBnWzFdID0gei5jb252ZXJ0KHRoaXMpO1xuICAgICAgICBpZihrID4gMSkge1xuICAgICAgICAgICAgdmFyIGcyID0gbmJpKCk7XG4gICAgICAgICAgICB6LnNxclRvKGdbMV0sZzIpO1xuICAgICAgICAgICAgd2hpbGUobiA8PSBrbSkge1xuICAgICAgICAgICAgICAgIGdbbl0gPSBuYmkoKTtcbiAgICAgICAgICAgICAgICB6Lm11bFRvKGcyLGdbbi0yXSxnW25dKTtcbiAgICAgICAgICAgICAgICBuICs9IDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaiA9IGUudC0xLCB3LCBpczEgPSB0cnVlLCByMiA9IG5iaSgpLCB0O1xuICAgICAgICBpID0gbmJpdHMoZVtqXSktMTtcbiAgICAgICAgd2hpbGUoaiA+PSAwKSB7XG4gICAgICAgICAgICBpZihpID49IGsxKSB3ID0gKGVbal0+PihpLWsxKSkma207XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3ID0gKGVbal0mKCgxPDwoaSsxKSktMSkpPDwoazEtaSk7XG4gICAgICAgICAgICAgICAgaWYoaiA+IDApIHcgfD0gZVtqLTFdPj4odGhpcy5EQitpLWsxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbiA9IGs7XG4gICAgICAgICAgICB3aGlsZSgodyYxKSA9PSAwKSB7IHcgPj49IDE7IC0tbjsgfVxuICAgICAgICAgICAgaWYoKGkgLT0gbikgPCAwKSB7IGkgKz0gdGhpcy5EQjsgLS1qOyB9XG4gICAgICAgICAgICBpZihpczEpIHtcdC8vIHJldCA9PSAxLCBkb24ndCBib3RoZXIgc3F1YXJpbmcgb3IgbXVsdGlwbHlpbmcgaXRcbiAgICAgICAgICAgICAgICBnW3ddLmNvcHlUbyhyKTtcbiAgICAgICAgICAgICAgICBpczEgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlKG4gPiAxKSB7IHouc3FyVG8ocixyMik7IHouc3FyVG8ocjIscik7IG4gLT0gMjsgfVxuICAgICAgICAgICAgICAgIGlmKG4gPiAwKSB6LnNxclRvKHIscjIpOyBlbHNlIHsgdCA9IHI7IHIgPSByMjsgcjIgPSB0OyB9XG4gICAgICAgICAgICAgICAgei5tdWxUbyhyMixnW3ddLHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZShqID49IDAgJiYgKGVbal0mKDE8PGkpKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgei5zcXJUbyhyLHIyKTsgdCA9IHI7IHIgPSByMjsgcjIgPSB0O1xuICAgICAgICAgICAgICAgIGlmKC0taSA8IDApIHsgaSA9IHRoaXMuREItMTsgLS1qOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHoucmV2ZXJ0KHIpO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIGdjZCh0aGlzLGEpIChIQUMgMTQuNTQpXG4gICAgZnVuY3Rpb24gYm5HQ0QoYSkge1xuICAgICAgICB2YXIgeCA9ICh0aGlzLnM8MCk/dGhpcy5uZWdhdGUoKTp0aGlzLmNsb25lKCk7XG4gICAgICAgIHZhciB5ID0gKGEuczwwKT9hLm5lZ2F0ZSgpOmEuY2xvbmUoKTtcbiAgICAgICAgaWYoeC5jb21wYXJlVG8oeSkgPCAwKSB7IHZhciB0ID0geDsgeCA9IHk7IHkgPSB0OyB9XG4gICAgICAgIHZhciBpID0geC5nZXRMb3dlc3RTZXRCaXQoKSwgZyA9IHkuZ2V0TG93ZXN0U2V0Qml0KCk7XG4gICAgICAgIGlmKGcgPCAwKSByZXR1cm4geDtcbiAgICAgICAgaWYoaSA8IGcpIGcgPSBpO1xuICAgICAgICBpZihnID4gMCkge1xuICAgICAgICAgICAgeC5yU2hpZnRUbyhnLHgpO1xuICAgICAgICAgICAgeS5yU2hpZnRUbyhnLHkpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlKHguc2lnbnVtKCkgPiAwKSB7XG4gICAgICAgICAgICBpZigoaSA9IHguZ2V0TG93ZXN0U2V0Qml0KCkpID4gMCkgeC5yU2hpZnRUbyhpLHgpO1xuICAgICAgICAgICAgaWYoKGkgPSB5LmdldExvd2VzdFNldEJpdCgpKSA+IDApIHkuclNoaWZ0VG8oaSx5KTtcbiAgICAgICAgICAgIGlmKHguY29tcGFyZVRvKHkpID49IDApIHtcbiAgICAgICAgICAgICAgICB4LnN1YlRvKHkseCk7XG4gICAgICAgICAgICAgICAgeC5yU2hpZnRUbygxLHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeS5zdWJUbyh4LHkpO1xuICAgICAgICAgICAgICAgIHkuclNoaWZ0VG8oMSx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihnID4gMCkgeS5sU2hpZnRUbyhnLHkpO1xuICAgICAgICByZXR1cm4geTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0aGlzICUgbiwgbiA8IDJeMjZcbiAgICBmdW5jdGlvbiBibnBNb2RJbnQobikge1xuICAgICAgICBpZihuIDw9IDApIHJldHVybiAwO1xuICAgICAgICB2YXIgZCA9IHRoaXMuRFYlbiwgciA9ICh0aGlzLnM8MCk/bi0xOjA7XG4gICAgICAgIGlmKHRoaXMudCA+IDApXG4gICAgICAgICAgICBpZihkID09IDApIHIgPSB0aGlzWzBdJW47XG4gICAgICAgIGVsc2UgZm9yKHZhciBpID0gdGhpcy50LTE7IGkgPj0gMDsgLS1pKSByID0gKGQqcit0aGlzW2ldKSVuO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSAxL3RoaXMgJSBtIChIQUMgMTQuNjEpXG4gICAgZnVuY3Rpb24gYm5Nb2RJbnZlcnNlKG0pIHtcbiAgICAgICAgdmFyIGFjID0gbS5pc0V2ZW4oKTtcbiAgICAgICAgaWYoKHRoaXMuaXNFdmVuKCkgJiYgYWMpIHx8IG0uc2lnbnVtKCkgPT0gMCkgcmV0dXJuIEJpZ0ludGVnZXIuWkVSTztcbiAgICAgICAgdmFyIHUgPSBtLmNsb25lKCksIHYgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgIHZhciBhID0gbmJ2KDEpLCBiID0gbmJ2KDApLCBjID0gbmJ2KDApLCBkID0gbmJ2KDEpO1xuICAgICAgICB3aGlsZSh1LnNpZ251bSgpICE9IDApIHtcbiAgICAgICAgICAgIHdoaWxlKHUuaXNFdmVuKCkpIHtcbiAgICAgICAgICAgICAgICB1LnJTaGlmdFRvKDEsdSk7XG4gICAgICAgICAgICAgICAgaWYoYWMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIWEuaXNFdmVuKCkgfHwgIWIuaXNFdmVuKCkpIHsgYS5hZGRUbyh0aGlzLGEpOyBiLnN1YlRvKG0sYik7IH1cbiAgICAgICAgICAgICAgICAgICAgYS5yU2hpZnRUbygxLGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKCFiLmlzRXZlbigpKSBiLnN1YlRvKG0sYik7XG4gICAgICAgICAgICAgICAgYi5yU2hpZnRUbygxLGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUodi5pc0V2ZW4oKSkge1xuICAgICAgICAgICAgICAgIHYuclNoaWZ0VG8oMSx2KTtcbiAgICAgICAgICAgICAgICBpZihhYykge1xuICAgICAgICAgICAgICAgICAgICBpZighYy5pc0V2ZW4oKSB8fCAhZC5pc0V2ZW4oKSkgeyBjLmFkZFRvKHRoaXMsYyk7IGQuc3ViVG8obSxkKTsgfVxuICAgICAgICAgICAgICAgICAgICBjLnJTaGlmdFRvKDEsYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoIWQuaXNFdmVuKCkpIGQuc3ViVG8obSxkKTtcbiAgICAgICAgICAgICAgICBkLnJTaGlmdFRvKDEsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih1LmNvbXBhcmVUbyh2KSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdS5zdWJUbyh2LHUpO1xuICAgICAgICAgICAgICAgIGlmKGFjKSBhLnN1YlRvKGMsYSk7XG4gICAgICAgICAgICAgICAgYi5zdWJUbyhkLGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdi5zdWJUbyh1LHYpO1xuICAgICAgICAgICAgICAgIGlmKGFjKSBjLnN1YlRvKGEsYyk7XG4gICAgICAgICAgICAgICAgZC5zdWJUbyhiLGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHYuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSAhPSAwKSByZXR1cm4gQmlnSW50ZWdlci5aRVJPO1xuICAgICAgICBpZihkLmNvbXBhcmVUbyhtKSA+PSAwKSByZXR1cm4gZC5zdWJ0cmFjdChtKTtcbiAgICAgICAgaWYoZC5zaWdudW0oKSA8IDApIGQuYWRkVG8obSxkKTsgZWxzZSByZXR1cm4gZDtcbiAgICAgICAgaWYoZC5zaWdudW0oKSA8IDApIHJldHVybiBkLmFkZChtKTsgZWxzZSByZXR1cm4gZDtcbiAgICB9XG5cbiAgICB2YXIgbG93cHJpbWVzID0gWzIsMyw1LDcsMTEsMTMsMTcsMTksMjMsMjksMzEsMzcsNDEsNDMsNDcsNTMsNTksNjEsNjcsNzEsNzMsNzksODMsODksOTcsMTAxLDEwMywxMDcsMTA5LDExMywxMjcsMTMxLDEzNywxMzksMTQ5LDE1MSwxNTcsMTYzLDE2NywxNzMsMTc5LDE4MSwxOTEsMTkzLDE5NywxOTksMjExLDIyMywyMjcsMjI5LDIzMywyMzksMjQxLDI1MSwyNTcsMjYzLDI2OSwyNzEsMjc3LDI4MSwyODMsMjkzLDMwNywzMTEsMzEzLDMxNywzMzEsMzM3LDM0NywzNDksMzUzLDM1OSwzNjcsMzczLDM3OSwzODMsMzg5LDM5Nyw0MDEsNDA5LDQxOSw0MjEsNDMxLDQzMyw0MzksNDQzLDQ0OSw0NTcsNDYxLDQ2Myw0NjcsNDc5LDQ4Nyw0OTEsNDk5LDUwMyw1MDldO1xuICAgIHZhciBscGxpbSA9ICgxPDwyNikvbG93cHJpbWVzW2xvd3ByaW1lcy5sZW5ndGgtMV07XG5cbiAgICAvLyAocHVibGljKSB0ZXN0IHByaW1hbGl0eSB3aXRoIGNlcnRhaW50eSA+PSAxLS41XnRcbiAgICBmdW5jdGlvbiBibklzUHJvYmFibGVQcmltZSh0KSB7XG4gICAgICAgIHZhciBpLCB4ID0gdGhpcy5hYnMoKTtcbiAgICAgICAgaWYoeC50ID09IDEgJiYgeFswXSA8PSBsb3dwcmltZXNbbG93cHJpbWVzLmxlbmd0aC0xXSkge1xuICAgICAgICAgICAgZm9yKGkgPSAwOyBpIDwgbG93cHJpbWVzLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGlmKHhbMF0gPT0gbG93cHJpbWVzW2ldKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZih4LmlzRXZlbigpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGkgPSAxO1xuICAgICAgICB3aGlsZShpIDwgbG93cHJpbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG0gPSBsb3dwcmltZXNbaV0sIGogPSBpKzE7XG4gICAgICAgICAgICB3aGlsZShqIDwgbG93cHJpbWVzLmxlbmd0aCAmJiBtIDwgbHBsaW0pIG0gKj0gbG93cHJpbWVzW2orK107XG4gICAgICAgICAgICBtID0geC5tb2RJbnQobSk7XG4gICAgICAgICAgICB3aGlsZShpIDwgaikgaWYobSVsb3dwcmltZXNbaSsrXSA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHgubWlsbGVyUmFiaW4odCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdHJ1ZSBpZiBwcm9iYWJseSBwcmltZSAoSEFDIDQuMjQsIE1pbGxlci1SYWJpbilcbiAgICBmdW5jdGlvbiBibnBNaWxsZXJSYWJpbih0KSB7XG4gICAgICAgIHZhciBuMSA9IHRoaXMuc3VidHJhY3QoQmlnSW50ZWdlci5PTkUpO1xuICAgICAgICB2YXIgayA9IG4xLmdldExvd2VzdFNldEJpdCgpO1xuICAgICAgICBpZihrIDw9IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIHIgPSBuMS5zaGlmdFJpZ2h0KGspO1xuICAgICAgICB0ID0gKHQrMSk+PjE7XG4gICAgICAgIGlmKHQgPiBsb3dwcmltZXMubGVuZ3RoKSB0ID0gbG93cHJpbWVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGEgPSBuYmkoKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHQ7ICsraSkge1xuICAgICAgICAgICAgYS5mcm9tSW50KGxvd3ByaW1lc1tpXSk7XG4gICAgICAgICAgICB2YXIgeSA9IGEubW9kUG93KHIsdGhpcyk7XG4gICAgICAgICAgICBpZih5LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgIT0gMCAmJiB5LmNvbXBhcmVUbyhuMSkgIT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBqID0gMTtcbiAgICAgICAgICAgICAgICB3aGlsZShqKysgPCBrICYmIHkuY29tcGFyZVRvKG4xKSAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHkgPSB5Lm1vZFBvd0ludCgyLHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBpZih5LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih5LmNvbXBhcmVUbyhuMSkgIT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICAvLyBwcm90ZWN0ZWRcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jaHVua1NpemUgPSBibnBDaHVua1NpemU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9SYWRpeCA9IGJucFRvUmFkaXg7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbVJhZGl4ID0gYm5wRnJvbVJhZGl4O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZyb21OdW1iZXIgPSBibnBGcm9tTnVtYmVyO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmJpdHdpc2VUbyA9IGJucEJpdHdpc2VUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jaGFuZ2VCaXQgPSBibnBDaGFuZ2VCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWRkVG8gPSBibnBBZGRUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kTXVsdGlwbHkgPSBibnBETXVsdGlwbHk7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZEFkZE9mZnNldCA9IGJucERBZGRPZmZzZXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHlMb3dlclRvID0gYm5wTXVsdGlwbHlMb3dlclRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5VXBwZXJUbyA9IGJucE11bHRpcGx5VXBwZXJUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnQgPSBibnBNb2RJbnQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubWlsbGVyUmFiaW4gPSBibnBNaWxsZXJSYWJpbjtcblxuICAgIC8vIHB1YmxpY1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNsb25lID0gYm5DbG9uZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pbnRWYWx1ZSA9IGJuSW50VmFsdWU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYnl0ZVZhbHVlID0gYm5CeXRlVmFsdWU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2hvcnRWYWx1ZSA9IGJuU2hvcnRWYWx1ZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaWdudW0gPSBiblNpZ051bTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0J5dGVBcnJheSA9IGJuVG9CeXRlQXJyYXk7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzID0gYm5FcXVhbHM7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubWluID0gYm5NaW47XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubWF4ID0gYm5NYXg7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW5kID0gYm5BbmQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUub3IgPSBibk9yO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnhvciA9IGJuWG9yO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFuZE5vdCA9IGJuQW5kTm90O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm5vdCA9IGJuTm90O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0TGVmdCA9IGJuU2hpZnRMZWZ0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBiblNoaWZ0UmlnaHQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZ2V0TG93ZXN0U2V0Qml0ID0gYm5HZXRMb3dlc3RTZXRCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYml0Q291bnQgPSBibkJpdENvdW50O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRlc3RCaXQgPSBiblRlc3RCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2V0Qml0ID0gYm5TZXRCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2xlYXJCaXQgPSBibkNsZWFyQml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZsaXBCaXQgPSBibkZsaXBCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWRkID0gYm5BZGQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3QgPSBiblN1YnRyYWN0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5ID0gYm5NdWx0aXBseTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBibkRpdmlkZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXIgPSBiblJlbWFpbmRlcjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGVBbmRSZW1haW5kZXIgPSBibkRpdmlkZUFuZFJlbWFpbmRlcjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3cgPSBibk1vZFBvdztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnZlcnNlID0gYm5Nb2RJbnZlcnNlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnBvdyA9IGJuUG93O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmV4cHQgPSBiblBvdztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5nY2QgPSBibkdDRDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWUgPSBibklzUHJvYmFibGVQcmltZTtcblxuICAgIC8vIEJpZ0ludGVnZXIgaW50ZXJmYWNlcyBub3QgaW1wbGVtZW50ZWQgaW4ganNibjpcblxuICAgIC8vIEJpZ0ludGVnZXIoaW50IHNpZ251bSwgYnl0ZVtdIG1hZ25pdHVkZSlcbiAgICAvLyBkb3VibGUgZG91YmxlVmFsdWUoKVxuICAgIC8vIGZsb2F0IGZsb2F0VmFsdWUoKVxuICAgIC8vIGludCBoYXNoQ29kZSgpXG4gICAgLy8gbG9uZyBsb25nVmFsdWUoKVxuICAgIC8vIHN0YXRpYyBCaWdJbnRlZ2VyIHZhbHVlT2YobG9uZyB2YWwpXG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBFTkQgT0YgY29weS1hbmQtcGFzdGUgb2YganNibi5cblxuXG5cbiAgICBCaWdJbnRlZ2VyLk5FR0FUSVZFX09ORSA9IEJpZ0ludGVnZXIuT05FLm5lZ2F0ZSgpO1xuXG5cbiAgICAvLyBPdGhlciBtZXRob2RzIHdlIG5lZWQgdG8gYWRkIGZvciBjb21wYXRpYmlsdHkgd2l0aCBqcy1udW1iZXJzIG51bWVyaWMgdG93ZXIuXG5cbiAgICAvLyBhZGQgaXMgaW1wbGVtZW50ZWQgYWJvdmUuXG4gICAgLy8gc3VidHJhY3QgaXMgaW1wbGVtZW50ZWQgYWJvdmUuXG4gICAgLy8gbXVsdGlwbHkgaXMgaW1wbGVtZW50ZWQgYWJvdmUuXG4gICAgLy8gZXF1YWxzIGlzIGltcGxlbWVudGVkIGFib3ZlLlxuICAgIC8vIGFicyBpcyBpbXBsZW1lbnRlZCBhYm92ZS5cbiAgICAvLyBuZWdhdGUgaXMgZGVmaW5lZCBhYm92ZS5cblxuICAgIC8vIG1ha2VCaWdudW06IHN0cmluZyAtPiBCaWdJbnRlZ2VyXG4gICAgdmFyIG1ha2VCaWdudW0gPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIGlmICh0eXBlb2YocykgPT09ICdudW1iZXInKSB7IHMgPSBzICsgJyc7IH1cbiAgICAgICAgcyA9IGV4cGFuZEV4cG9uZW50KHMpO1xuICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIocywgMTApO1xuICAgIH07XG5cbiAgICB2YXIgemVyb3N0cmluZyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdmFyIGJ1ZiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgYnVmLnB1c2goJzAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVmLmpvaW4oJycpO1xuICAgIH07XG5cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxldmVsID0gMDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5saWZ0VG8gPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSYXRpb25hbCh0aGlzLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAyKSB7XG4gICAgICAgICAgICB2YXIgZml4cmVwID0gdGhpcy50b0ZpeG51bSgpO1xuICAgICAgICAgICAgaWYgKGZpeHJlcCA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICAgICAgICAgICAgICAgIHJldHVybiBUT09fUE9TSVRJVkVfVE9fUkVQUkVTRU5UO1xuICAgICAgICAgICAgaWYgKGZpeHJlcCA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICAgICAgICAgICAgICAgIHJldHVybiBUT09fTkVHQVRJVkVfVE9fUkVQUkVTRU5UO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdFBvaW50KGZpeHJlcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KHRoaXMsIDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aHJvd1J1bnRpbWVFcnJvcihcImludmFsaWQgbGV2ZWwgZm9yIEJpZ0ludGVnZXIgbGlmdFwiLCB0aGlzLCB0YXJnZXQpO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0Zpbml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNJbnRlZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1JhdGlvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1JlYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy50b0ZpeG51bSgpKTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9GaXhudW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IDAsIHN0ciA9IHRoaXMudG9TdHJpbmcoKSwgaTtcbiAgICAgICAgaWYgKHN0clswXSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBmb3IgKGk9MTsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAqIDEwICsgTnVtYmVyKHN0cltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLXJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaT0wOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICogMTAgKyBOdW1iZXIoc3RyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVUbyhvdGhlcikgPiAwO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlVG8ob3RoZXIpID49IDA7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKG90aGVyKSA8IDA7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVUbyhvdGhlcikgPD0gMDtcbiAgICB9O1xuXG4gICAgLy8gZGl2aWRlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBXQVJOSU5HIE5PVEU6IHdlIG92ZXJyaWRlIHRoZSBvbGQgdmVyc2lvbiBvZiBkaXZpZGUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgdmFyIHF1b3RpZW50QW5kUmVtYWluZGVyID0gYm5EaXZpZGVBbmRSZW1haW5kZXIuY2FsbCh0aGlzLCBvdGhlcik7XG4gICAgICAgIGlmIChxdW90aWVudEFuZFJlbWFpbmRlclsxXS5jb21wYXJlVG8oQmlnSW50ZWdlci5aRVJPKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RpZW50QW5kUmVtYWluZGVyWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGFkZChxdW90aWVudEFuZFJlbWFpbmRlclswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmF0aW9uYWwubWFrZUluc3RhbmNlKHF1b3RpZW50QW5kUmVtYWluZGVyWzFdLCBvdGhlcikpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5udW1lcmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRlbm9taW5hdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH07XG5cblxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQ2xhc3NpYyBpbXBsZW1lbnRhdGlvbiBvZiBOZXd0b24tUmFscGhzb24gc3F1YXJlLXJvb3Qgc2VhcmNoLFxuICAgICAgICAvLyBhZGFwdGVkIGZvciBpbnRlZ2VyLXNxcnQuXG4gICAgICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3dG9uJ3NfbWV0aG9kI1NxdWFyZV9yb290X29mX2FfbnVtYmVyXG4gICAgICAgICAgICB2YXIgc2VhcmNoSXRlciA9IGZ1bmN0aW9uKG4sIGd1ZXNzKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUoIShsZXNzVGhhbk9yRXF1YWwoc3FyKGd1ZXNzKSxuKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbGVzc1RoYW4obixzcXIoYWRkKGd1ZXNzLCAxKSkpKSkge1xuICAgICAgICAgICAgICAgICAgICBndWVzcyA9IGZsb29yKGRpdmlkZShhZGQoZ3Vlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9vcihkaXZpZGUobiwgZ3Vlc3MpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGd1ZXNzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaW50ZWdlclNxcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAgICAgICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmludGVnZXJTcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG47XG4gICAgICAgICAgICAgICAgaWYoc2lnbih0aGlzKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWFyY2hJdGVyKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSB0aGlzLm5lZ2F0ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoMCwgc2VhcmNoSXRlcihuLCBuKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICB9KSgpO1xuXG5cbiAgICAvLyBzcXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9OZXd0b24nc19tZXRob2QjU3F1YXJlX3Jvb3Rfb2ZfYV9udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBzcXVhcmUgcm9vdC5cbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEdldCBhbiBhcHByb3hpbWF0aW9uIHVzaW5nIGludGVnZXJTcXJ0LCBhbmQgdGhlbiBzdGFydCBhbm90aGVyXG4gICAgICAgIC8vIE5ld3Rvbi1SYWxwaHNvbiBzZWFyY2ggaWYgbmVjZXNzYXJ5LlxuICAgICAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXBwcm94ID0gdGhpcy5pbnRlZ2VyU3FydCgpLCBmaXg7XG4gICAgICAgICAgICBpZiAoZXF2KHNxcihhcHByb3gpLCB0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHByb3g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaXggPSB0b0ZpeG51bSh0aGlzKTtcbiAgICAgICAgICAgIGlmIChpc0Zpbml0ZShmaXgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNxcnQoZml4KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc3FydCgtZml4KSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcHJveDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgLy8gZmxvb3I6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBmbG9vci5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mbG9vciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBjZWlsaW5nOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY2VpbGluZy5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jZWlsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgLy8gVW50aWwgd2UgaGF2ZSBhIGZlYXR1cmUtY29tcGxldGUgQmlnIE51bWJlciBpbXBsZW1lbnRhdGlvbiwgd2UnbGxcbiAgICAvLyBjb252ZXJ0IEJpZ0ludGVnZXIgb2JqZWN0cyBpbnRvIEZsb2F0UG9pbnQgb2JqZWN0cyBhbmQgcGVyZm9ybVxuICAgIC8vIHVuc3VwcG9ydGVkIG9wZXJhdGlvbnMgdGhlcmUuXG4gICAgZnVuY3Rpb24gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhmdW5jdGlvbl9uYW1lKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5leGFjdCA9IHRoaXMudG9JbmV4YWN0KCk7XG4gICAgICAgIHJldHVybiBpbmV4YWN0W2Z1bmN0aW9uX25hbWVdLmFwcGx5KGluZXhhY3QsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uanVnYXRlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY29uanVnYXRlLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJjb25qdWdhdGVcIik7XG5cbiAgICAvLyBtYWduaXR1ZGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBtYWduaXR1ZGUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubWFnbml0dWRlID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcIm1hZ25pdHVkZVwiKTtcblxuICAgIC8vIGxvZzogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGxvZy5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sb2cgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwibG9nXCIpO1xuXG4gICAgLy8gYW5nbGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhbmdsZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmdsZSA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJhbmdsZVwiKTtcblxuICAgIC8vIGF0YW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgdGFuZ2VudC5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hdGFuID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImF0YW5cIik7XG5cbiAgICAvLyBhY29zOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIGNvc2luZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hY29zID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImFjb3NcIik7XG5cbiAgICAvLyBhc2luOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIHNpbmUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYXNpbiA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJhc2luXCIpO1xuXG4gICAgLy8gdGFuOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgdGFuZ2VudC5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50YW4gPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwidGFuXCIpO1xuXG4gICAgLy8gY29zOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY29zaW5lLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNvcyA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJjb3NcIik7XG5cbiAgICAvLyBzaW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBzaW5lLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNpbiA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJzaW5cIik7XG5cbiAgICAvLyBleHA6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIGUgcmFpc2VkIHRvIHRoZSBnaXZlbiBwb3dlci5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5leHAgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiZXhwXCIpO1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaW1hZ2luYXJ5UGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnJlYWxQYXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyByb3VuZDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFJvdW5kIHRvIHRoZSBuZWFyZXN0IGludGVnZXIuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUucm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIHRvUmVwZWF0aW5nRGVjaW1hbDoganNudW0ganNudW0ge2xpbWl0OiBudW1iZXJ9PyAtPiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZ11cbiAgICAvL1xuICAgIC8vIEdpdmVuIHRoZSBudW1lcmF0b3IgYW5kIGRlbm9taW5hdG9yIHBhcnRzIG9mIGEgcmF0aW9uYWwsXG4gICAgLy8gcHJvZHVjZXMgdGhlIHJlcGVhdGluZy1kZWNpbWFsIHJlcHJlc2VudGF0aW9uLCB3aGVyZSB0aGUgZmlyc3RcbiAgICAvLyBwYXJ0IGFyZSB0aGUgZGlnaXRzIGJlZm9yZSB0aGUgZGVjaW1hbCwgdGhlIHNlY29uZCBhcmUgdGhlXG4gICAgLy8gbm9uLXJlcGVhdGluZyBkaWdpdHMgYWZ0ZXIgdGhlIGRlY2ltYWwsIGFuZCB0aGUgdGhpcmQgYXJlIHRoZVxuICAgIC8vIHJlbWFpbmluZyByZXBlYXRpbmcgZGVjaW1hbHMuXG4gICAgLy9cbiAgICAvLyBBbiBvcHRpb25hbCBsaW1pdCBvbiB0aGUgZGVjaW1hbCBleHBhbnNpb24gY2FuIGJlIHByb3ZpZGVkLCBpbiB3aGljaFxuICAgIC8vIGNhc2UgdGhlIHNlYXJjaCBjdXRzIG9mZiBpZiB3ZSBnbyBwYXN0IHRoZSBsaW1pdC5cbiAgICAvLyBJZiB0aGlzIGhhcHBlbnMsIHRoZSB0aGlyZCBhcmd1bWVudCByZXR1cm5lZCBiZWNvbWVzICcuLi4nIHRvIGluZGljYXRlXG4gICAgLy8gdGhhdCB0aGUgc2VhcmNoIHdhcyBwcmVtYXR1cmVseSBjdXQgb2ZmLlxuICAgIHZhciB0b1JlcGVhdGluZ0RlY2ltYWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBnZXRSZXNpZHVlID0gZnVuY3Rpb24ociwgZCwgbGltaXQpIHtcbiAgICAgICAgICAgIHZhciBkaWdpdHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBzZWVuUmVtYWluZGVycyA9IHt9O1xuICAgICAgICAgICAgc2VlblJlbWFpbmRlcnNbcl0gPSB0cnVlO1xuICAgICAgICAgICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChsaW1pdC0tIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtkaWdpdHMuam9pbignJyksICcuLi4nXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBuZXh0RGlnaXQgPSBxdW90aWVudChcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbHkociwgMTApLCBkKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFJlbWFpbmRlciA9IHJlbWFpbmRlcihcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbHkociwgMTApLFxuICAgICAgICAgICAgICAgICAgICBkKTtcbiAgICAgICAgICAgICAgICBkaWdpdHMucHVzaChuZXh0RGlnaXQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHNlZW5SZW1haW5kZXJzW25leHRSZW1haW5kZXJdKSB7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBuZXh0UmVtYWluZGVyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWVuUmVtYWluZGVyc1tuZXh0UmVtYWluZGVyXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBuZXh0UmVtYWluZGVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGZpcnN0UmVwZWF0aW5nUmVtYWluZGVyID0gcjtcbiAgICAgICAgICAgIHZhciByZXBlYXRpbmdEaWdpdHMgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHREaWdpdCA9IHF1b3RpZW50KG11bHRpcGx5KHIsIDEwKSwgZCk7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRSZW1haW5kZXIgPSByZW1haW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGx5KHIsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgZCk7XG4gICAgICAgICAgICAgICAgcmVwZWF0aW5nRGlnaXRzLnB1c2gobmV4dERpZ2l0LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGlmIChlcXVhbHMobmV4dFJlbWFpbmRlciwgZmlyc3RSZXBlYXRpbmdSZW1haW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBuZXh0UmVtYWluZGVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBkaWdpdFN0cmluZyA9IGRpZ2l0cy5qb2luKCcnKTtcbiAgICAgICAgICAgIHZhciByZXBlYXRpbmdEaWdpdFN0cmluZyA9IHJlcGVhdGluZ0RpZ2l0cy5qb2luKCcnKTtcblxuICAgICAgICAgICAgd2hpbGUgKGRpZ2l0U3RyaW5nLmxlbmd0aCA+PSByZXBlYXRpbmdEaWdpdFN0cmluZy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAoZGlnaXRTdHJpbmcuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICBkaWdpdFN0cmluZy5sZW5ndGggLSByZXBlYXRpbmdEaWdpdFN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgID09PSByZXBlYXRpbmdEaWdpdFN0cmluZykpIHtcbiAgICAgICAgICAgICAgICBkaWdpdFN0cmluZyA9IGRpZ2l0U3RyaW5nLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgMCwgZGlnaXRTdHJpbmcubGVuZ3RoIC0gcmVwZWF0aW5nRGlnaXRTdHJpbmcubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFtkaWdpdFN0cmluZywgcmVwZWF0aW5nRGlnaXRTdHJpbmddO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG4sIGQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgbGltaXQgb24gZGVjaW1hbCBleHBhbnNpb247IGNhbiBiZSBvdmVycmlkZGVuXG4gICAgICAgICAgICB2YXIgbGltaXQgPSA1MTI7XG4gICAgICAgICAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Yob3B0aW9ucy5saW1pdCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgbGltaXQgPSBvcHRpb25zLmxpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKG4pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3RvUmVwZWF0aW5nRGVjaW1hbDogbiAnICsgbi50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoISBpc0ludGVnZXIoZCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigndG9SZXBlYXRpbmdEZWNpbWFsOiBkICcgKyBkLnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlcXVhbHMoZCwgMCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigndG9SZXBlYXRpbmdEZWNpbWFsOiBkIGVxdWFscyAwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVzc1RoYW4oZCwgMCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigndG9SZXBlYXRpbmdEZWNpbWFsOiBkIDwgMCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgIHZhciBzaWduID0gKGxlc3NUaGFuKG4sIDApID8gXCItXCIgOiBcIlwiKTtcbiAgICAgICAgICAgICBuID0gYWJzKG4pO1xuICAgICAgICAgICAgIHZhciBiZWZvcmVEZWNpbWFsUG9pbnQgPSBzaWduICsgcXVvdGllbnQobiwgZCk7XG4gICAgICAgICAgICAgdmFyIGFmdGVyRGVjaW1hbHMgPSBnZXRSZXNpZHVlKHJlbWFpbmRlcihuLCBkKSwgZCwgbGltaXQpO1xuICAgICAgICAgICAgIHJldHVybiBbYmVmb3JlRGVjaW1hbFBvaW50XS5jb25jYXQoYWZ0ZXJEZWNpbWFscyk7XG4gICAgICAgIH07XG4gICAgfSkoKTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG5cbiAgICAvLyBFeHRlcm5hbCBpbnRlcmZhY2Ugb2YganMtbnVtYmVyczpcblxuICAgIE51bWJlcnNbJ2Zyb21GaXhudW0nXSA9IGZyb21GaXhudW07XG4gICAgTnVtYmVyc1snZnJvbVN0cmluZyddID0gZnJvbVN0cmluZztcbiAgICBOdW1iZXJzWydtYWtlQmlnbnVtJ10gPSBtYWtlQmlnbnVtO1xuICAgIE51bWJlcnNbJ21ha2VSYXRpb25hbCddID0gUmF0aW9uYWwubWFrZUluc3RhbmNlO1xuICAgIE51bWJlcnNbJ21ha2VGbG9hdCddID0gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2U7XG4gICAgTnVtYmVyc1snbWFrZUNvbXBsZXgnXSA9IENvbXBsZXgubWFrZUluc3RhbmNlO1xuICAgIE51bWJlcnNbJ21ha2VDb21wbGV4UG9sYXInXSA9IG1ha2VDb21wbGV4UG9sYXI7XG5cbiAgICBOdW1iZXJzWydwaSddID0gRmxvYXRQb2ludC5waTtcbiAgICBOdW1iZXJzWydlJ10gPSBGbG9hdFBvaW50LmU7XG4gICAgTnVtYmVyc1snbmFuJ10gPSBGbG9hdFBvaW50Lm5hbjtcbiAgICBOdW1iZXJzWyduZWdhdGl2ZV9pbmYnXSA9IEZsb2F0UG9pbnQubmVnaW5mO1xuICAgIE51bWJlcnNbJ2luZiddID0gRmxvYXRQb2ludC5pbmY7XG4gICAgTnVtYmVyc1snbmVnYXRpdmVfb25lJ10gPSAtMTsgICAvLyBSYXRpb25hbC5ORUdBVElWRV9PTkU7XG4gICAgTnVtYmVyc1snemVybyddID0gMDsgICAgICAgICAgICAvLyBSYXRpb25hbC5aRVJPO1xuICAgIE51bWJlcnNbJ29uZSddID0gMTsgICAgICAgICAgICAgLy8gUmF0aW9uYWwuT05FO1xuICAgIE51bWJlcnNbJ2knXSA9IHBsdXNJO1xuICAgIE51bWJlcnNbJ25lZ2F0aXZlX2knXSA9IG1pbnVzSTtcbiAgICBOdW1iZXJzWyduZWdhdGl2ZV96ZXJvJ10gPSBORUdBVElWRV9aRVJPO1xuXG4gICAgTnVtYmVyc1snb25UaHJvd1J1bnRpbWVFcnJvciddID0gb25UaHJvd1J1bnRpbWVFcnJvcjtcbiAgICBOdW1iZXJzWydpc1NjaGVtZU51bWJlciddID0gaXNTY2hlbWVOdW1iZXI7XG4gICAgTnVtYmVyc1snaXNSYXRpb25hbCddID0gaXNSYXRpb25hbDtcbiAgICBOdW1iZXJzWydpc1JlYWwnXSA9IGlzUmVhbDtcbiAgICBOdW1iZXJzWydpc0V4YWN0J10gPSBpc0V4YWN0O1xuICAgIE51bWJlcnNbJ2lzSW5leGFjdCddID0gaXNJbmV4YWN0O1xuICAgIE51bWJlcnNbJ2lzSW50ZWdlciddID0gaXNJbnRlZ2VyO1xuXG4gICAgTnVtYmVyc1sndG9GaXhudW0nXSA9IHRvRml4bnVtO1xuICAgIE51bWJlcnNbJ3RvRXhhY3QnXSA9IHRvRXhhY3Q7XG4gICAgTnVtYmVyc1sndG9JbmV4YWN0J10gPSB0b0luZXhhY3Q7XG4gICAgTnVtYmVyc1snYWRkJ10gPSBhZGQ7XG4gICAgTnVtYmVyc1snc3VidHJhY3QnXSA9IHN1YnRyYWN0O1xuICAgIE51bWJlcnNbJ211bHRpcGx5J10gPSBtdWx0aXBseTtcbiAgICBOdW1iZXJzWydkaXZpZGUnXSA9IGRpdmlkZTtcbiAgICBOdW1iZXJzWydlcXVhbHMnXSA9IGVxdWFscztcbiAgICBOdW1iZXJzWydlcXYnXSA9IGVxdjtcbiAgICBOdW1iZXJzWydhcHByb3hFcXVhbHMnXSA9IGFwcHJveEVxdWFscztcbiAgICBOdW1iZXJzWydncmVhdGVyVGhhbk9yRXF1YWwnXSA9IGdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgICBOdW1iZXJzWydsZXNzVGhhbk9yRXF1YWwnXSA9IGxlc3NUaGFuT3JFcXVhbDtcbiAgICBOdW1iZXJzWydncmVhdGVyVGhhbiddID0gZ3JlYXRlclRoYW47XG4gICAgTnVtYmVyc1snbGVzc1RoYW4nXSA9IGxlc3NUaGFuO1xuICAgIE51bWJlcnNbJ2V4cHQnXSA9IGV4cHQ7XG4gICAgTnVtYmVyc1snZXhwJ10gPSBleHA7XG4gICAgTnVtYmVyc1snbW9kdWxvJ10gPSBtb2R1bG87XG4gICAgTnVtYmVyc1snbnVtZXJhdG9yJ10gPSBudW1lcmF0b3I7XG4gICAgTnVtYmVyc1snZGVub21pbmF0b3InXSA9IGRlbm9taW5hdG9yO1xuICAgIE51bWJlcnNbJ2ludGVnZXJTcXJ0J10gPSBpbnRlZ2VyU3FydDtcbiAgICBOdW1iZXJzWydzcXJ0J10gPSBzcXJ0O1xuICAgIE51bWJlcnNbJ2FicyddID0gYWJzO1xuICAgIE51bWJlcnNbJ3F1b3RpZW50J10gPSBxdW90aWVudDtcbiAgICBOdW1iZXJzWydyZW1haW5kZXInXSA9IHJlbWFpbmRlcjtcbiAgICBOdW1iZXJzWydmbG9vciddID0gZmxvb3I7XG4gICAgTnVtYmVyc1snY2VpbGluZyddID0gY2VpbGluZztcbiAgICBOdW1iZXJzWydjb25qdWdhdGUnXSA9IGNvbmp1Z2F0ZTtcbiAgICBOdW1iZXJzWydtYWduaXR1ZGUnXSA9IG1hZ25pdHVkZTtcbiAgICBOdW1iZXJzWydsb2cnXSA9IGxvZztcbiAgICBOdW1iZXJzWydhbmdsZSddID0gYW5nbGU7XG4gICAgTnVtYmVyc1sndGFuJ10gPSB0YW47XG4gICAgTnVtYmVyc1snYXRhbiddID0gYXRhbjtcbiAgICBOdW1iZXJzWydjb3MnXSA9IGNvcztcbiAgICBOdW1iZXJzWydzaW4nXSA9IHNpbjtcbiAgICBOdW1iZXJzWyd0YW4nXSA9IHRhbjtcbiAgICBOdW1iZXJzWydhY29zJ10gPSBhY29zO1xuICAgIE51bWJlcnNbJ2FzaW4nXSA9IGFzaW47XG4gICAgTnVtYmVyc1snY29zaCddID0gY29zaDtcbiAgICBOdW1iZXJzWydzaW5oJ10gPSBzaW5oO1xuICAgIE51bWJlcnNbJ2ltYWdpbmFyeVBhcnQnXSA9IGltYWdpbmFyeVBhcnQ7XG4gICAgTnVtYmVyc1sncmVhbFBhcnQnXSA9IHJlYWxQYXJ0O1xuICAgIE51bWJlcnNbJ3JvdW5kJ10gPSByb3VuZDtcbiAgICBOdW1iZXJzWydzcXInXSA9IHNxcjtcbiAgICBOdW1iZXJzWydnY2QnXSA9IGdjZDtcbiAgICBOdW1iZXJzWydsY20nXSA9IGxjbTtcblxuICAgIE51bWJlcnNbJ3RvUmVwZWF0aW5nRGVjaW1hbCddID0gdG9SZXBlYXRpbmdEZWNpbWFsO1xuXG5cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgZXhwb3NlcyB0aGUgY2xhc3MgcmVwcmVzZW50YXRpb25zIGZvciBlYXNpZXJcbiAgICAvLyBpbnRlZ3JhdGlvbiB3aXRoIG90aGVyIHByb2plY3RzLlxuICAgIE51bWJlcnNbJ0JpZ0ludGVnZXInXSA9IEJpZ0ludGVnZXI7XG4gICAgTnVtYmVyc1snUmF0aW9uYWwnXSA9IFJhdGlvbmFsO1xuICAgIE51bWJlcnNbJ0Zsb2F0UG9pbnQnXSA9IEZsb2F0UG9pbnQ7XG4gICAgTnVtYmVyc1snQ29tcGxleCddID0gQ29tcGxleDtcblxuICAgIE51bWJlcnNbJ01JTl9GSVhOVU0nXSA9IE1JTl9GSVhOVU07XG4gICAgTnVtYmVyc1snTUFYX0ZJWE5VTSddID0gTUFYX0ZJWE5VTTtcblxufSkoKTtcbiIsIi8qKlxuICogQW4gZXF1YXRpb24gaXMgYW4gZXhwcmVzc2lvbiBhdHRhY2hlZCB0byBhIHBhcnRpY3VsYXIgbmFtZS4gRm9yIGV4YW1wbGU6XG4gKiAgIGYoeCkgPSB4ICsgMVxuICogICBuYW1lOiBmXG4gKiAgIGVxdWF0aW9uOiB4ICsgMVxuICogICBwYXJhbXM6IFsneCddXG4gKiBJbiBtYW55IGNhc2VzLCB0aGlzIHdpbGwganVzdCBiZSBhbiBleHByZXNzaW9uIHdpdGggbm8gbmFtZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEZ1bmN0aW9uIG9yIHZhcmlhYmxlIG5hbWUuIE51bGwgaWYgY29tcHV0ZSBleHByZXNzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBwYXJhbXMgTGlzdCBvZiBwYXJhbWV0ZXIgbmFtZXMgaWYgYSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV9IGV4cHJlc3Npb25cbiAqL1xudmFyIEVxdWF0aW9uID0gZnVuY3Rpb24gKG5hbWUsIHBhcmFtcywgZXhwcmVzc2lvbikge1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuICB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCBbXTtcbiAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXF1YXRpb24gcmVxdWlyZXMgbmFtZSwgcGFyYW1zLCBhbmQgZXhwcmVzc2lvbicpO1xuICB9XG5cbiAgdGhpcy5zaWduYXR1cmUgPSB0aGlzLm5hbWU7XG4gIGlmICh0aGlzLnBhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5zaWduYXR1cmUgKz0gJygnICsgdGhpcy5wYXJhbXMuam9pbignLCcpICsgJyknO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVxdWF0aW9uO1xuXG4vKipcbiAqIEByZXR1cm5zIFRydWUgaWYgYSBmdW5jdGlvblxuICovXG5FcXVhdGlvbi5wcm90b3R5cGUuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucGFyYW1zLmxlbmd0aCA+IDA7XG59O1xuXG5FcXVhdGlvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgRXF1YXRpb24odGhpcy5uYW1lLCB0aGlzLnBhcmFtcy5zbGljZSgpLCB0aGlzLmV4cHJlc3Npb24uY2xvbmUoKSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuICB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbiAgdmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IENhbGMgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBDYWxjIEdyYXBoaWNzLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBzaGFyZWRGdW5jdGlvbmFsQmxvY2tzID0gcmVxdWlyZSgnLi4vc2hhcmVkRnVuY3Rpb25hbEJsb2NrcycpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgdmFyIGdlbnN5bSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgTkFNRV9UWVBFID0gYmxvY2tseS5WYXJpYWJsZXMuTkFNRV9UWVBFO1xuICAgIHJldHVybiBnZW5lcmF0b3IudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKG5hbWUsIE5BTUVfVFlQRSk7XG4gIH07XG5cbiAgc2hhcmVkRnVuY3Rpb25hbEJsb2Nrcy5pbnN0YWxsKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcblxuICBpbnN0YWxsQ29tcHV0ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG59O1xuXG5mdW5jdGlvbiBpbnN0YWxsQ29tcHV0ZShibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSkge1xuICBibG9ja2x5LkJsb2Nrcy5mdW5jdGlvbmFsX2NvbXB1dGUgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICBibG9ja2x5LkZ1bmN0aW9uYWxCbG9ja1V0aWxzLmluaXRUaXRsZWRGdW5jdGlvbmFsQmxvY2sodGhpcywgbXNnLmV2YWx1YXRlKCksIGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTk9ORSwgW1xuICAgICAgICB7IG5hbWU6ICdBUkcxJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mdW5jdGlvbmFsX2NvbXB1dGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJnMSA9IEJsb2NrbHkuSmF2YVNjcmlwdC5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0FSRzEnLCBmYWxzZSkgfHwgMDtcbiAgICByZXR1cm4gXCJDYWxjLmNvbXB1dGUoXCIgKyBhcmcxICtcIiwgJ2Jsb2NrX2lkX1wiICsgdGhpcy5pZCArIFwiJyk7XFxuXCI7XG4gIH07XG59XG4iLCIvLyBsb2NhbGUgZm9yIGNhbGNcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5jYWxjX2xvY2FsZTtcbiJdfQ==
