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
var AppView = require('../templates/AppView.jsx');
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

  React.render(React.createElement(AppView, {
    renderCodeApp: function renderCodeApp() {
      return page({
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
    },
    onMount: function onMount() {
      studioApp.init(config);
    }
  }), document.getElementById(config.containerId));
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/controls.html.ejs","./equation":"/home/ubuntu/staging/apps/build/js/calc/equation.js","./equationSet":"/home/ubuntu/staging/apps/build/js/calc/equationSet.js","./expressionNode":"/home/ubuntu/staging/apps/build/js/calc/expressionNode.js","./inputIterator":"/home/ubuntu/staging/apps/build/js/calc/inputIterator.js","./js-numbers/js-numbers.js":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js","./levels":"/home/ubuntu/staging/apps/build/js/calc/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js","./token":"/home/ubuntu/staging/apps/build/js/calc/token.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs","lodash":"/home/ubuntu/staging/apps/node_modules/lodash/dist/lodash.js"}],"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jYWxjL21haW4uanMiLCJidWlsZC9qcy9jYWxjL2NhbGMuanMiLCJidWlsZC9qcy9jYWxjL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2xldmVscy5qcyIsImJ1aWxkL2pzL2NhbGMvaW5wdXRJdGVyYXRvci5qcyIsImJ1aWxkL2pzL2NhbGMvZXF1YXRpb25TZXQuanMiLCJidWlsZC9qcy9jYWxjL2V4cHJlc3Npb25Ob2RlLmpzIiwiYnVpbGQvanMvY2FsYy90b2tlbi5qcyIsImJ1aWxkL2pzL2NhbGMvanMtbnVtYmVycy9qcy1udW1iZXJzLmpzIiwiYnVpbGQvanMvY2FsYy9lcXVhdGlvbi5qcyIsImJ1aWxkL2pzL2NhbGMvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2NhbGMvbG9jYWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDbEMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFB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QUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0UsYUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxTQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDYjs7OztBQUlELGFBQVMsa0JBQWtCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUU7QUFDL0IsVUFBRSxDQUFDLENBQUM7QUFDSixZQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7QUFDM0IsU0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDUixlQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLGFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFNBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNWLFNBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCOzs7QUFHRCxhQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUU7O0FBRWhCLFlBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDaEIsWUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNoQixrQkFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLFlBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsWUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZDs7QUFFRCxhQUFTLGNBQWMsQ0FBQyxDQUFDLEVBQUU7QUFDdkIsWUFBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQ2hELElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEtBQ3JDO0FBQUUsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEFBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxPQUFPLENBQUMsQ0FBQztTQUFFO0tBQ2pFOztBQUVELGFBQVMsYUFBYSxDQUFDLENBQUMsRUFBRTtBQUFFLGVBQU8sQ0FBQyxDQUFDO0tBQUU7OztBQUd2QyxhQUFTLGFBQWEsQ0FBQyxDQUFDLEVBQUU7QUFDdEIsU0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFlBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUU7QUFBRSxhQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxBQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUFFO0FBQ3JELFlBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwRCxZQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkQsZUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsU0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLGVBQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztLQUNyRDs7O0FBR0Qs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QyxJQUFJLENBQUM7QUFDNUQsWUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsWUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQU0sT0FBTyxDQUFDLENBQUM7QUFDL0MsWUFBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFNLE9BQU8sQ0FBQyxDQUFDO0tBQ3JEOztBQUVELFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FB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TSxDQUFDLENBQUM7O0FBRTNELGdCQUFjLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUM1QyxDQUFDOztBQUVGLFNBQVMsY0FBYyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2xELFNBQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEdBQUc7QUFDbEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsZ0JBQVc7QUFDZixhQUFPLENBQUMsb0JBQW9CLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUN4RyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQ3RELENBQUMsQ0FBQztLQUNKO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsa0JBQWtCLEdBQUcsWUFBVztBQUN4QyxRQUFJLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RSxXQUFPLGVBQWUsR0FBRyxJQUFJLEdBQUUsY0FBYyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDO0dBQ25FLENBQUM7Q0FDSDs7Ozs7OztBQ3pERCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93LkNhbGMgPSByZXF1aXJlKCcuL2NhbGMnKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuY2FsY01haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIGFwcE1haW4od2luZG93LkNhbGMsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IENhbGMgR3JhcGhpY3NcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbiAndXNlIHN0cmljdCc7XG5cbnZhciBDYWxjID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgQ2FsYyA9IG1vZHVsZS5leHBvcnRzO1xudmFyIGpzbnVtcyA9IHJlcXVpcmUoJy4vanMtbnVtYmVycy9qcy1udW1iZXJzLmpzJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgY2FsY01zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgdGltZW91dExpc3QgPSByZXF1aXJlKCcuLi90aW1lb3V0TGlzdCcpO1xuXG52YXIgRXhwcmVzc2lvbk5vZGUgPSByZXF1aXJlKCcuL2V4cHJlc3Npb25Ob2RlJyk7XG52YXIgRXF1YXRpb25TZXQgPSByZXF1aXJlKCcuL2VxdWF0aW9uU2V0Jyk7XG52YXIgRXF1YXRpb24gPSByZXF1aXJlKCcuL2VxdWF0aW9uJyk7XG52YXIgVG9rZW4gPSByZXF1aXJlKCcuL3Rva2VuJyk7XG52YXIgSW5wdXRJdGVyYXRvciA9IHJlcXVpcmUoJy4vaW5wdXRJdGVyYXRvcicpO1xuXG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xuXG52YXIgbGV2ZWw7XG52YXIgc2tpbjtcblxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3MoZmFsc2UpO1xuXG52YXIgQ0FOVkFTX0hFSUdIVCA9IDQwMDtcbnZhciBDQU5WQVNfV0lEVEggPSA0MDA7XG5cbnZhciBMSU5FX0hFSUdIVCA9IDI0O1xuXG52YXIgYXBwU3RhdGUgPSB7XG4gIHRhcmdldFNldDogbnVsbCxcbiAgdXNlclNldDogbnVsbCxcbiAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgd2FpdGluZ0ZvclJlcG9ydDogZmFsc2UsXG4gIHJlc3BvbnNlOiBudWxsLFxuICBtZXNzYWdlOiBudWxsLFxuICByZXN1bHQ6IG51bGwsXG4gIHRlc3RSZXN1bHRzOiBudWxsLFxuICBmYWlsZWRJbnB1dDogbnVsbFxufTtcbkNhbGMuYXBwU3RhdGVfID0gYXBwU3RhdGU7XG5cbnZhciBzdGVwU3BlZWQgPSAyMDAwO1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRva2VuIGxpc3QgZnJvbSBvbiBvciB0d28gdmFsdWVzLiBJZiBvbmUgdmFsdWUgaXMgZ2l2ZW4sIHRoYXRcbiAqIHRva2VuIGxpc3QgaXMganVzdCB0aGUgc2V0IG9mIHVubWFya2VkIHRva2Vucy4gSWYgdHdvIHZhbHVlcyBhcmUgZ2l2ZW4sIHRoZVxuICogZ2VuZXJhdGVkIHRva2VuIGxpc3QgaGFzIGRpZmZlcmVuY2UgbWFya2VkLiBJbnB1dHMgYXJlIGZpcnN0IGNvbnZlcnRlZCB0b1xuICogRXhwcmVzc2lvbk5vZGVzIHRvIGFsbG93IGZvciB0b2tlbiBsaXN0IGdlbmVyYXRpb24uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gb25lXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gdHdvXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG1hcmtEZWVwZXN0IE9ubHkgdmFsaWQgaWYgd2UgaGF2ZSBhIHNpbmdsZSBpbnB1dC4gUGFzc2VkIG9uXG4gKiAgIHRvIGdldFRva2VuTGlzdC5cbiAqIEByZXR1cm5zIHtUb2tlbltdfVxuICovXG5mdW5jdGlvbiBjb25zdHJ1Y3RUb2tlbkxpc3Qob25lLCB0d28sIG1hcmtEZWVwZXN0KSB7XG4gIG9uZSA9IGFzRXhwcmVzc2lvbk5vZGUob25lKTtcbiAgdHdvID0gYXNFeHByZXNzaW9uTm9kZSh0d28pO1xuXG4gIG1hcmtEZWVwZXN0ID0gdXRpbHMudmFsdWVPcihtYXJrRGVlcGVzdCwgZmFsc2UpO1xuXG4gIHZhciB0b2tlbkxpc3Q7XG5cbiAgaWYgKCFvbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmICghdHdvKSB7XG4gICAgdG9rZW5MaXN0ID0gb25lLmdldFRva2VuTGlzdChtYXJrRGVlcGVzdCk7XG4gIH0gZWxzZSB7XG4gICAgdG9rZW5MaXN0ID0gb25lLmdldFRva2VuTGlzdERpZmYodHdvKTtcbiAgfVxuXG4gIHJldHVybiBFeHByZXNzaW9uTm9kZS5zdHJpcE91dGVyUGFyZW5zRnJvbVRva2VuTGlzdCh0b2tlbkxpc3QpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgdmFsIHRvIGFuIEV4cHJlc3Npb25Ob2RlIGZvciB0aGUgcHVycG9zZSBvZiBnZW5lcmF0aW5nIGEgdG9rZW5cbiAqIGxpc3QuXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfEVxdWF0aW9ufGpzbnVtYmVyfHN0cmluZ30gdmFsXG4gKiBAcmV0dXJucyB7RXhwcmVzc2lvbk5vZGV9XG4gKi9cbmZ1bmN0aW9uIGFzRXhwcmVzc2lvbk5vZGUodmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZSkge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVxdWF0aW9uKSB7XG4gICAgcmV0dXJuIHZhbC5leHByZXNzaW9uO1xuICB9XG4gIC8vIEl0J3MgcGVyaGFwcyBhIGxpdHRsZSB3ZWlyZCB0byBjb252ZXJ0IGEgc3RyaW5nIGxpa2UgXCI9IFwiIGludG8gYW5cbiAgLy8gRXhwcmVzc2lvbk5vZGUgKHdoaWNoIEkgYmVsaWV2ZSB3aWxsIHRyZWF0IHRoaXMgYXMgYSB2YXJpYWJsZSksIGJ1dCB0aGlzXG4gIC8vIGFsbG93cyB1cyB0byBtb3JlIGVhc2lseSBnZW5lcmF0ZSBhIHRva2VuTGlzdCBpbiBhIGNvbnNpc3RlbnQgbWFubmVyLlxuICBpZiAoanNudW1zLmlzU2NoZW1lTnVtYmVyKHZhbCkgfHwgdHlwZW9mKHZhbCkgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uTm9kZSh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndW5leHBlY3RlZCcpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIENhbGMuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5DYWxjLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gcmVwbGFjZSBzdHVkaW9BcHAgbWV0aG9kcyB3aXRoIG91ciBvd25cbiAgc3R1ZGlvQXBwLnJ1bkJ1dHRvbkNsaWNrID0gdGhpcy5ydW5CdXR0b25DbGljay5iaW5kKHRoaXMpO1xuXG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgaWYgKGxldmVsLnNjYWxlICYmIGxldmVsLnNjYWxlLnN0ZXBTcGVlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc3RlcFNwZWVkID0gbGV2ZWwuc2NhbGUuc3RlcFNwZWVkO1xuICB9XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ2Z1bmN0aW9uYWxfY29tcHV0ZSc7XG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuXG4gIC8vIFdlIGRvbid0IHdhbnQgaWNvbnMgaW4gaW5zdHJ1Y3Rpb25zXG4gIGNvbmZpZy5za2luLnN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gbnVsbDtcbiAgY29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLndpbkF2YXRhciA9IG51bGw7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnQ2FsYycpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQ0FOVkFTX1dJRFRIKTtcbiAgICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBDQU5WQVNfSEVJR0hUKTtcblxuICAgIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgICAgdmFyIGJhY2tncm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja2dyb3VuZCcpO1xuICAgICAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgJy9ibG9ja2x5L21lZGlhL3NraW5zL2NhbGMvYmFja2dyb3VuZF9mcmVlcGxheS5wbmcnKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGlzIGhhY2sgdGhhdCBJIGhhdmVuJ3QgYmVlbiBhYmxlIHRvIGZ1bGx5IHVuZGVyc3RhbmQuIEZ1cnRoZXJtb3JlLFxuICAgIC8vIGl0IHNlZW1zIHRvIGJyZWFrIHRoZSBmdW5jdGlvbmFsIGJsb2NrcyBpbiBzb21lIGJyb3dzZXJzLiBBcyBzdWNoLCBJJ21cbiAgICAvLyBqdXN0IGdvaW5nIHRvIGRpc2FibGUgdGhlIGhhY2sgZm9yIHRoaXMgYXBwLlxuICAgIEJsb2NrbHkuQlJPS0VOX0NPTlRST0xfUE9JTlRTID0gZmFsc2U7XG5cbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdDYWxjLGNvZGUnKTtcblxuICAgIHZhciBzb2x1dGlvbkJsb2NrcyA9IGxldmVsLnNvbHV0aW9uQmxvY2tzO1xuICAgIGlmIChsZXZlbC5zb2x1dGlvbkJsb2NrcyAmJiBsZXZlbC5zb2x1dGlvbkJsb2NrcyAhPT0gJycpIHtcbiAgICAgIHNvbHV0aW9uQmxvY2tzID0gYmxvY2tVdGlscy5mb3JjZUluc2VydFRvcEJsb2NrKGxldmVsLnNvbHV0aW9uQmxvY2tzLFxuICAgICAgICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayk7XG4gICAgfVxuXG4gICAgYXBwU3RhdGUudGFyZ2V0U2V0ID0gZ2VuZXJhdGVFcXVhdGlvblNldEZyb21CbG9ja1htbChzb2x1dGlvbkJsb2Nrcyk7XG5cbiAgICBkaXNwbGF5R29hbChhcHBTdGF0ZS50YXJnZXRTZXQpO1xuXG4gICAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gICAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICAgIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuXG4gICAgLy8gYmFzZSdzIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmUgY2FsbGVkIGZpcnN0XG4gICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChyZXNldEJ1dHRvbiwgQ2FsYy5yZXNldEJ1dHRvbkNsaWNrKTtcblxuICAgIGlmIChCbG9ja2x5LmNvbnRyYWN0RWRpdG9yKSB7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdEhhbmRsZXIoZ2V0Q2FsY0V4YW1wbGVGYWlsdXJlKTtcbiAgICAgIEJsb2NrbHkuY29udHJhY3RFZGl0b3IucmVnaXN0ZXJUZXN0UmVzZXRIYW5kbGVyKHJlc2V0Q2FsY0V4YW1wbGUpO1xuICAgIH1cbiAgfTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgcmVuZGVyQ29kZUFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHBhZ2Uoe1xuICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICAgICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBlZGl0Q29kZTogbGV2ZWwuZWRpdENvZGUsXG4gICAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgICBpbnB1dE91dHB1dFRhYmxlOiBsZXZlbC5pbnB1dE91dHB1dFRhYmxlLFxuICAgICAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBvbk1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xuICAgIH1cbiAgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5jb250YWluZXJJZCkpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge0Jsb2NrbHkuQmxvY2t9XG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtldmFsdWF0ZUluUGxheXNwYWNlXSBUcnVlIGlmIHRoaXMgdGVzdCBzaG91bGQgYWxzbyBzaG93XG4gKiAgIGV2YWx1YXRpb24gaW4gdGhlIHBsYXkgc3BhY2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEVycm9yIHN0cmluZywgb3IgbnVsbCBpZiBzdWNjZXNzXG4gKi9cbmZ1bmN0aW9uIGdldENhbGNFeGFtcGxlRmFpbHVyZShleGFtcGxlQmxvY2ssIGV2YWx1YXRlSW5QbGF5c3BhY2UpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZW50aXJlU2V0ID0gbmV3IEVxdWF0aW9uU2V0KEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkpO1xuXG4gICAgdmFyIGFjdHVhbEJsb2NrID0gZXhhbXBsZUJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soXCJBQ1RVQUxcIik7XG4gICAgdmFyIGV4cGVjdGVkQmxvY2sgPSBleGFtcGxlQmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhcIkVYUEVDVEVEXCIpO1xuXG4gICAgc3R1ZGlvQXBwLmZlZWRiYWNrXy50aHJvd09uSW52YWxpZEV4YW1wbGVCbG9ja3MoYWN0dWFsQmxvY2ssIGV4cGVjdGVkQmxvY2spO1xuXG4gICAgdmFyIGFjdHVhbEVxdWF0aW9uID0gRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soYWN0dWFsQmxvY2spO1xuICAgIHZhciBhY3R1YWwgPSBlbnRpcmVTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihhY3R1YWxFcXVhdGlvbi5leHByZXNzaW9uKTtcblxuICAgIHZhciBleHBlY3RlZEVxdWF0aW9uID0gRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soZXhwZWN0ZWRCbG9jayk7XG4gICAgdmFyIGV4cGVjdGVkID0gZW50aXJlU2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwZWN0ZWRFcXVhdGlvbi5leHByZXNzaW9uKTtcblxuICAgIHZhciBhcmVFcXVhbCA9IGpzbnVtcy5lcXVhbHMoZXhwZWN0ZWQucmVzdWx0LCBhY3R1YWwucmVzdWx0KTtcblxuICAgIGlmIChldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gICAgICB2YXIgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGV4cGVjdGVkRXF1YXRpb24sIG51bGwpO1xuICAgICAgaWYgKCFleHBlY3RlZC5lcnIpIHtcbiAgICAgICAgdG9rZW5MaXN0LnB1c2gobmV3IFRva2VuKCcgPSAnLCBmYWxzZSkpO1xuICAgICAgICB0b2tlbkxpc3QucHVzaChuZXcgVG9rZW4oZXhwZWN0ZWQucmVzdWx0LCAhYXJlRXF1YWwpKTtcbiAgICAgIH1cbiAgICAgIGNsZWFyU3ZnRXhwcmVzc2lvbignYW5zd2VyRXhwcmVzc2lvbicpO1xuICAgICAgZGlzcGxheUVxdWF0aW9uKCd1c2VyRXhwcmVzc2lvbicsIG51bGwsIHRva2VuTGlzdCwgMCwgJ2Vycm9yVG9rZW4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJlRXF1YWwgPyBudWxsIDogXCJEb2VzIG5vdCBtYXRjaCBkZWZpbml0aW9uXCI7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gTW9zdCBDYWxjIGVycm9yIG1lc3NhZ2VzIHdlcmUgbm90IG1lYW50IHRvIGJlIHVzZXIgZmFjaW5nLlxuICAgIHJldHVybiBcIkV2YWx1YXRpb24gRmFpbGVkLlwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0Q2FsY0V4YW1wbGUoKSB7XG4gIGNsZWFyU3ZnRXhwcmVzc2lvbigndXNlckV4cHJlc3Npb24nKTtcbiAgZGlzcGxheUdvYWwoYXBwU3RhdGUudGFyZ2V0U2V0KTtcbn1cblxuLyoqXG4gKiBBIGZldyBwb3NzaWJsZSBzY2VuYXJpb3NcbiAqICgxKSBXZSBkb24ndCBoYXZlIGEgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbiAoaS5lLiBmcmVlcGxheSkuIFNob3cgbm90aGluZy5cbiAqICgyKSBXZSBoYXZlIGEgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbiwgb25lIGZ1bmN0aW9uLCBhbmQgbm8gdmFyaWFibGVzLlxuICogICAgIFNob3cgdGhlIGNvbXB1dGUgZXhwcmVzc2lvbiArIGV2YWx1YXRpb24sIGFuZCBub3RoaW5nIGVsc2VcbiAqICgzKSBXZSBoYXZlIGEgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbiB0aGF0IGlzIGp1c3QgYSBzaW5nbGUgdmFyaWFibGUsIGFuZFxuICogICAgIHNvbWUgbnVtYmVyIG9mIGFkZGl0aW9uYWwgdmFyaWFibGVzLCBidXQgbm8gZnVuY3Rpb25zLiBEaXNwbGF5IG9ubHlcbiAqICAgICB0aGUgbmFtZSBvZiB0aGUgc2luZ2xlIHZhcmlhYmxlXG4gKiAoNCkgV2UgaGF2ZSBhIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24gdGhhdCBpcyBub3QgYSBzaW5nbGUgdmFyaWFibGUsIGFuZFxuICogICAgIHBvc3NpYmxlIHNvbWUgbnVtYmVyIG9mIGFkZGl0aW9uYWwgdmFyaWFibGVzLCBidXQgbm8gZnVuY3Rpb25zLiBEaXNwbGF5XG4gKiAgICAgY29tcHV0ZSBleHByZXNzaW9uIGFuZCB2YXJpYWJsZXMuXG4gKiAoNSkgV2UgaGF2ZSBhIHRhcmdldCBjb21wdXRlIGV4cHJlc3Npb24sIGFuZCBlaXRoZXIgbXVsdGlwbGUgZnVuY3Rpb25zIG9yXG4gKiAgICAgb25lIGZ1bmN0aW9uIGFuZCB2YXJpYWJsZShzKS4gQ3VycmVudGx5IG5vdCBzdXBwb3J0ZWQuXG4gKiBAcGFyYW0ge0VxdWF0aW9uU2V0fSB0YXJnZXRTZXQgVGhlIHRhcmdldCBlcXVhdGlvbiBzZXQuXG4gKi9cbmZ1bmN0aW9uIGRpc3BsYXlHb2FsKHRhcmdldFNldCkge1xuICB2YXIgY29tcHV0ZUVxdWF0aW9uID0gdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICBpZiAoIWNvbXB1dGVFcXVhdGlvbiB8fCAhY29tcHV0ZUVxdWF0aW9uLmV4cHJlc3Npb24pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiB3ZSBoYXZlIGEgc2luZ2xlIGZ1bmN0aW9uLCBqdXN0IHNob3cgdGhlIGV2YWx1YXRpb25cbiAgLy8gKGkuZS4gY29tcHV0ZSBleHByZXNzaW9uKS4gT3RoZXJ3aXNlIHNob3cgYWxsIGVxdWF0aW9ucy5cbiAgdmFyIHRva2VuTGlzdDtcbiAgdmFyIG5leHRSb3cgPSAwO1xuICB2YXIgY29tcHV0ZXNGdW5jdGlvbiA9IHRhcmdldFNldC5jb21wdXRlc0Z1bmN0aW9uQ2FsbCgpO1xuICBpZiAoIWNvbXB1dGVzRnVuY3Rpb24gJiYgIXRhcmdldFNldC5jb21wdXRlc1NpbmdsZVZhcmlhYmxlKCkpIHtcbiAgICB2YXIgc29ydGVkRXF1YXRpb25zID0gdGFyZ2V0U2V0LnNvcnRlZEVxdWF0aW9ucygpO1xuICAgIHNvcnRlZEVxdWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlcXVhdGlvbikge1xuICAgICAgaWYgKGVxdWF0aW9uLmlzRnVuY3Rpb24oKSAmJiBzb3J0ZWRFcXVhdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxjIGRvZXNuJ3Qgc3VwcG9ydCBnb2FsIHdpdGggbXVsdGlwbGUgZnVuY3Rpb25zIG9yIFwiICtcbiAgICAgICAgICBcIm1peGVkIGZ1bmN0aW9ucy92YXJzXCIpO1xuICAgICAgfVxuXG4gICAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoZXF1YXRpb24pO1xuICAgICAgZGlzcGxheUVxdWF0aW9uKCdhbnN3ZXJFeHByZXNzaW9uJywgZXF1YXRpb24uc2lnbmF0dXJlLCB0b2tlbkxpc3QsIG5leHRSb3crKyk7XG4gICAgfSk7XG4gIH1cblxuICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoY29tcHV0ZUVxdWF0aW9uKTtcbiAgdmFyIGV2YWx1YXRpb24gPSB0YXJnZXRTZXQuZXZhbHVhdGUoKTtcbiAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgdGhyb3cgZXZhbHVhdGlvbi5lcnI7XG4gIH1cblxuICBpZiAoY29tcHV0ZXNGdW5jdGlvbikge1xuICAgIHRva2VuTGlzdC5wdXNoKG5ldyBUb2tlbignID0gJywgZmFsc2UpKTtcbiAgICB0b2tlbkxpc3QucHVzaChuZXcgVG9rZW4oZXZhbHVhdGlvbi5yZXN1bHQsIGZhbHNlKSk7XG4gIH1cbiAgZGlzcGxheUVxdWF0aW9uKCdhbnN3ZXJFeHByZXNzaW9uJywgY29tcHV0ZUVxdWF0aW9uLnNpZ25hdHVyZSwgdG9rZW5MaXN0LCBuZXh0Um93KTtcbn1cblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5DYWxjLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICBzdHVkaW9BcHAuYXR0ZW1wdHMrKztcbiAgQ2FsYy5leGVjdXRlKCk7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyByZXNldCBidXR0b24gY2xpY2sgbG9naWMuICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlXG4gKiBjYWxsZWQgZmlyc3QuXG4gKi9cbkNhbGMucmVzZXRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgYXBwU3RhdGUuYW5pbWF0aW5nID0gZmFsc2U7XG4gIGFwcFN0YXRlLndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgYXBwU3RhdGUucmVzcG9uc2UgPSBudWxsO1xuICBhcHBTdGF0ZS5tZXNzYWdlID0gbnVsbDtcbiAgYXBwU3RhdGUucmVzdWx0ID0gbnVsbDtcbiAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBudWxsO1xuICBhcHBTdGF0ZS5mYWlsZWRJbnB1dCA9IG51bGw7XG5cbiAgdGltZW91dExpc3QuY2xlYXJUaW1lb3V0cygpO1xuXG4gIGNsZWFyU3ZnRXhwcmVzc2lvbigndXNlckV4cHJlc3Npb24nKTtcbn07XG5cbi8qKlxuICogR2l2ZW4gc29tZSB4bWwsIGdlbmVhdGVzIGFuIGV4cHJlc3Npb24gc2V0IGJ5IGxvYWRpbmcgYmxvY2tzIGludG8gdGhlXG4gKiBibG9ja3NwYWNlLi4gRmFpbHMgaWYgdGhlcmUgYXJlIGFscmVhZHkgYmxvY2tzIGluIHRoZSB3b3Jrc3BhY2UuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRXF1YXRpb25TZXRGcm9tQmxvY2tYbWwoYmxvY2tYbWwpIHtcbiAgaWYgKGJsb2NrWG1sKSB7XG4gICAgaWYgKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZW5lcmF0ZVRhcmdldEV4cHJlc3Npb24gc2hvdWxkbid0IGJlIGNhbGxlZCB3aXRoIGJsb2Nrc1wiICtcbiAgICAgICAgXCJpZiB3ZSBhbHJlYWR5IGhhdmUgYmxvY2tzIGluIHRoZSB3b3Jrc3BhY2VcIik7XG4gICAgfVxuICAgIC8vIFRlbXBvcmFyaWx5IHB1dCB0aGUgYmxvY2tzIGludG8gdGhlIHdvcmtzcGFjZSBzbyB0aGF0IHdlIGNhbiBnZW5lcmF0ZSBjb2RlXG4gICAgc3R1ZGlvQXBwLmxvYWRCbG9ja3MoYmxvY2tYbWwpO1xuICB9XG5cbiAgdmFyIGVxdWF0aW9uU2V0ID0gbmV3IEVxdWF0aW9uU2V0KEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkpO1xuXG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2spIHtcbiAgICBibG9jay5kaXNwb3NlKCk7XG4gIH0pO1xuXG4gIHJldHVybiBlcXVhdGlvblNldDtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZXMgYSB0YXJnZXQgc2V0IGFnYWluc3QgYSB1c2VyIHNldCB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIGZ1bmN0aW9uLlxuICogSXQgZG9lcyB0aGlzIGJlIGZlZWRpbmcgdGhlIGZ1bmN0aW9uIGEgc2V0IG9mIHZhbHVlcywgYW5kIG1ha2luZyBzdXJlXG4gKiB0aGUgdGFyZ2V0IGFuZCB1c2VyIHNldCBldmFsdWF0ZSB0byB0aGUgc2FtZSByZXN1bHQgZm9yIGVhY2guXG4gKi9cbkNhbGMuZXZhbHVhdGVGdW5jdGlvbl8gPSBmdW5jdGlvbiAodGFyZ2V0U2V0LCB1c2VyU2V0KSB7XG4gIHZhciBvdXRjb21lID0ge1xuICAgIHJlc3VsdDogUmVzdWx0VHlwZS5VTlNFVCxcbiAgICB0ZXN0UmVzdWx0czogVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOLFxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZCxcbiAgICBmYWlsZWRJbnB1dDogbnVsbFxuICB9O1xuXG4gIC8vIGlmIG91ciB0YXJnZXQgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIHdlIGV2YWx1YXRlIHN1Y2Nlc3MgYnkgZXZhbHVhdGluZyB0aGVcbiAgLy8gZnVuY3Rpb24gd2l0aCBkaWZmZXJlbnQgaW5wdXRzXG4gIHZhciBleHByZXNzaW9uID0gdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb24uY2xvbmUoKTtcblxuICAvLyBtYWtlIHN1cmUgb3VyIHRhcmdldC91c2VyIGNhbGxzIGxvb2sgdGhlIHNhbWVcbiAgdmFyIHVzZXJFcXVhdGlvbiA9IHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIHZhciB1c2VyRXhwcmVzc2lvbiA9IHVzZXJFcXVhdGlvbiAmJiB1c2VyRXF1YXRpb24uZXhwcmVzc2lvbjtcbiAgaWYgKCFleHByZXNzaW9uLmhhc1NhbWVTaWduYXR1cmUodXNlckV4cHJlc3Npb24pIHx8XG4gICAgIXVzZXJTZXQuY29tcHV0ZXNGdW5jdGlvbkNhbGwoKSkge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUw7XG5cbiAgICB2YXIgdGFyZ2V0RnVuY3Rpb25OYW1lID0gZXhwcmVzc2lvbi5nZXRWYWx1ZSgpO1xuICAgIGlmICghdXNlclNldC5nZXRFcXVhdGlvbih0YXJnZXRGdW5jdGlvbk5hbWUpKSB7XG4gICAgICBvdXRjb21lLm1lc3NhZ2UgPSBjYWxjTXNnLm1pc3NpbmdGdW5jdGlvbkVycm9yKHtcbiAgICAgICAgZnVuY3Rpb25OYW1lOiB0YXJnZXRGdW5jdGlvbk5hbWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG5cbiAgLy8gRmlyc3QgZXZhbHVhdGUgYm90aCB3aXRoIHRoZSB0YXJnZXQgc2V0IG9mIGlucHV0c1xuICB2YXIgdGFyZ2V0RXZhbHVhdGlvbiA9IHRhcmdldFNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICB2YXIgdXNlckV2YWx1YXRpb24gPSB1c2VyU2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIGlmICh0YXJnZXRFdmFsdWF0aW9uLmVyciB8fCB1c2VyRXZhbHVhdGlvbi5lcnIpIHtcbiAgICByZXR1cm4gZGl2WmVyb09yRmFpbHVyZSh0YXJnZXRFdmFsdWF0aW9uLmVyciB8fCB1c2VyRXZhbHVhdGlvbi5lcnIpO1xuICB9XG4gIGlmICghanNudW1zLmVxdWFscyh0YXJnZXRFdmFsdWF0aW9uLnJlc3VsdCwgdXNlckV2YWx1YXRpb24ucmVzdWx0KSkge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUw7XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHdlIHBhc3NlZCB1c2luZyB0aGUgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbidzIGlucHV0cy5cbiAgLy8gTm93IHdlIHdhbnQgdG8gdXNlIGFsbCBjb21iaW5hdGlvbnMgb2YgaW5wdXRzIGluIHRoZSByYW5nZSBbLTEwMC4uLjEwMF0sXG4gIC8vIG5vdGluZyB3aGljaCBzZXQgb2YgaW5wdXRzIGZhaWxlZCAoaWYgYW55KVxuICB2YXIgcG9zc2libGVWYWx1ZXMgPSBfLnJhbmdlKDEsIDEwMSkuY29uY2F0KF8ucmFuZ2UoLTAsIC0xMDEsIC0xKSk7XG4gIHZhciBudW1QYXJhbXMgPSBleHByZXNzaW9uLm51bUNoaWxkcmVuKCk7XG4gIHZhciBpdGVyYXRvciA9IG5ldyBJbnB1dEl0ZXJhdG9yKHBvc3NpYmxlVmFsdWVzLCBudW1QYXJhbXMpO1xuXG4gIHZhciBzZXRDaGlsZFRvVmFsdWUgPSBmdW5jdGlvbiAodmFsLCBpbmRleCkge1xuICAgIGV4cHJlc3Npb24uc2V0Q2hpbGRWYWx1ZShpbmRleCwgdmFsKTtcbiAgfTtcblxuICB3aGlsZSAoaXRlcmF0b3IucmVtYWluaW5nKCkgPiAwICYmICFvdXRjb21lLmZhaWxlZElucHV0KSB7XG4gICAgdmFyIHZhbHVlcyA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICB2YWx1ZXMuZm9yRWFjaChzZXRDaGlsZFRvVmFsdWUpO1xuXG4gICAgdGFyZ2V0RXZhbHVhdGlvbiA9IHRhcmdldFNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAgIHVzZXJFdmFsdWF0aW9uID0gdXNlclNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAgIGlmICh0YXJnZXRFdmFsdWF0aW9uLmVyciB8fCB1c2VyRXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgIHJldHVybiBkaXZaZXJvT3JGYWlsdXJlKHRhcmdldEV2YWx1YXRpb24uZXJyIHx8IHVzZXJFdmFsdWF0aW9uLmVycik7XG4gICAgfVxuICAgIGlmICghanNudW1zLmVxdWFscyh0YXJnZXRFdmFsdWF0aW9uLnJlc3VsdCwgdXNlckV2YWx1YXRpb24ucmVzdWx0KSkge1xuICAgICAgb3V0Y29tZS5mYWlsZWRJbnB1dCA9IF8uY2xvbmUodmFsdWVzKTtcbiAgICB9XG4gIH1cblxuICBpZiAob3V0Y29tZS5mYWlsZWRJbnB1dCkge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICBvdXRjb21lLm1lc3NhZ2UgPSBjYWxjTXNnLmZhaWxlZElucHV0KCk7XG4gIH0gZWxzZSBpZiAoIXRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uLmlzSWRlbnRpY2FsVG8oXG4gICAgICB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb24pKSB7XG4gICAgLy8gd2UgaGF2ZSB0aGUgcmlnaHQgZnVuY3Rpb24sIGJ1dCBhcmUgY2FsbGluZyB3aXRoIHRoZSB3cm9uZyBpbnB1dHNcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgb3V0Y29tZS5tZXNzYWdlID0gY2FsY01zZy53cm9uZ0lucHV0KCk7XG4gIH0gZWxzZSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFMTF9QQVNTO1xuICB9XG4gIHJldHVybiBvdXRjb21lO1xufTtcblxuZnVuY3Rpb24gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShtZXNzYWdlLCBmYWlsZWRJbnB1dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3VsdDogUmVzdWx0VHlwZS5GQUlMVVJFLFxuICAgIHRlc3RSZXN1bHRzOiBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTCxcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGZhaWxlZElucHV0OiB1dGlscy52YWx1ZU9yKGZhaWxlZElucHV0LCBudWxsKVxuICB9O1xufVxuXG4vKipcbiAqIExvb2tzIHRvIHNlZSBpZiBnaXZlbiBlcnJvciBpcyBhIGRpdmlkZSBieSB6ZXJvIGVycm9yLiBJZiBpdCBpcywgd2UgZmFpbFxuICogd2l0aCBhbiBhcHAgc3BlY2lmaWMgbWV0aG9kLiBJZiBub3QsIHdlIHRocm93IGEgc3RhbmRhcmQgZmFpbHVyZVxuICovXG5mdW5jdGlvbiBkaXZaZXJvT3JGYWlsdXJlKGVycikge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IpIHtcbiAgICByZXR1cm4gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShjYWxjTXNnLmRpdmlkZUJ5WmVyb0Vycm9yKCksIG51bGwpO1xuICB9XG5cbiAgLy8gT25lIHdheSB3ZSBrbm93IHdlIGNhbiBmYWlsIGlzIHdpdGggaW5maW5pdGUgcmVjdXJzaW9uLiBMb2cgaWYgd2UgZmFpbFxuICAvLyBmb3Igc29tZSBvdGhlciByZWFzb25cbiAgaWYgKCF1dGlscy5pc0luZmluaXRlUmVjdXJzaW9uRXJyb3IoZXJyKSkge1xuICAgIGNvbnNvbGUubG9nKCdVbmV4cGVjdGVkIGVycm9yOiAnICsgZXJyKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVzdWx0OiBSZXN1bHRUeXBlLkZBSUxVUkUsXG4gICAgdGVzdFJlc3VsdHM6IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTCxcbiAgICBtZXNzYWdlOiBudWxsLFxuICAgIGZhaWxlZElucHV0OiBudWxsXG4gIH07XG59XG5cbi8qKlxuICogRXZhbHVhdGVzIGEgdGFyZ2V0IHNldCBhZ2FpbnN0IGEgdXNlciBzZXQgd2hlbiBvdXIgY29tcHV0ZSBleHByZXNzaW9uIGlzXG4gKiBqdXN0IGEgbmFrZWQgdmFyaWFibGUuIEl0IGRvZXMgdGhpcyBieSBsb29raW5nIGZvciBhIGNvbnN0YW50IGluIHRoZVxuICogZXF1YXRpb24gc2V0LCBhbmQgdGhlbiB2YWxpZGF0aW5nIHRoYXQgKGEpIHdlIGhhdmUgYSB2YXJpYWJsZSBvZiB0aGUgc2FtZVxuICogbmFtZSBpbiB0aGUgdXNlciBzZXQgYW5kIChiKSB0aGF0IGNoYW5naW5nIHRoYXQgdmFsdWUgaW4gYm90aCBzZXRzIHN0aWxsXG4gKiByZXN1bHRzIGluIHRoZSBzYW1lIGV2YWx1YXRpb25cbiAqL1xuQ2FsYy5ldmFsdWF0ZVNpbmdsZVZhcmlhYmxlXyA9IGZ1bmN0aW9uICh0YXJnZXRTZXQsIHVzZXJTZXQpIHtcbiAgdmFyIG91dGNvbWUgPSB7XG4gICAgcmVzdWx0OiBSZXN1bHRUeXBlLlVOU0VULFxuICAgIHRlc3RSZXN1bHRzOiBUZXN0UmVzdWx0cy5OT19URVNUU19SVU4sXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkLFxuICAgIGZhaWxlZElucHV0OiBudWxsXG4gIH07XG5cbiAgaWYgKCF0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbi5pc0lkZW50aWNhbFRvKFxuICAgICAgdXNlclNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uKSkge1xuICAgIHJldHVybiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKGNhbGNNc2cubGV2ZWxJbmNvbXBsZXRlRXJyb3IoKSk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgb3VyIHRhcmdldCBzZXQgaGFzIGEgY29uc3RhbnQgdmFyaWFibGUgd2UgY2FuIHVzZSBhcyBvdXJcbiAgLy8gcHNldWRvIGlucHV0XG4gIHZhciB0YXJnZXRDb25zdGFudHMgPSB0YXJnZXRTZXQuZ2V0Q29uc3RhbnRzKCk7XG4gIGlmICh0YXJnZXRDb25zdGFudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkOiBzaW5nbGUgdmFyaWFibGUgd2l0aCBubyBjb25zdGFudHMnKTtcbiAgfVxuXG4gIC8vIFRoZSBjb2RlIGlzIGluIHBsYWNlIHRvIHRoZW9yZXRpY2FsbHkgc3VwcG9ydCB2YXJ5aW5nIG11bHRpcGxlIGNvbnN0YW50cyxcbiAgLy8gYnV0IHdlIGRlY2lkZWQgd2UgZG9uJ3QgbmVlZCB0byBzdXBwb3J0IHRoYXQsIHNvIEknbSBnb2luZyB0byBleHBsaWNpdGx5XG4gIC8vIGRpc2FsbG93IGl0IHRvIHJlZHVjZSB0aGUgdGVzdCBtYXRyaXguXG4gIGlmICh0YXJnZXRDb25zdGFudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBzdXBwb3J0IGZvciBtdWx0aXBsZSBjb25zdGFudHMnKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSBlYWNoIG9mIG91ciBwc2V1ZG8gaW5wdXRzIGhhcyBhIGNvcnJlc3BvbmRpbmcgdmFyaWFibGUgaW4gdGhlXG4gIC8vIHVzZXIgc2V0LlxuICB2YXIgdXNlckNvbnN0YW50cyA9IHVzZXJTZXQuZ2V0Q29uc3RhbnRzKCk7XG4gIHZhciB1c2VyQ29uc3RhbnROYW1lcyA9IHVzZXJDb25zdGFudHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgfSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRDb25zdGFudHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodXNlckNvbnN0YW50TmFtZXMuaW5kZXhPZih0YXJnZXRDb25zdGFudHNbaV0ubmFtZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShjYWxjTXNnLm1pc3NpbmdWYXJpYWJsZVgoXG4gICAgICAgIHt2YXI6IHRhcmdldENvbnN0YW50c1tpXS5uYW1lfSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRvIHNlZSB0aGF0IGV2YWx1YXRpbmcgdGFyZ2V0IHNldCB3aXRoIHRoZSB1c2VyIHZhbHVlIG9mIHRoZSBjb25zdGFudChzKVxuICAvLyBnaXZlcyB0aGUgc2FtZSByZXN1bHQgYXMgZXZhbHVhdGluZyB0aGUgdXNlciBzZXQuXG4gIHZhciBldmFsdWF0aW9uID0gdXNlclNldC5ldmFsdWF0ZSgpO1xuICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICByZXR1cm4gZGl2WmVyb09yRmFpbHVyZShldmFsdWF0aW9uLmVycik7XG4gIH1cbiAgdmFyIHVzZXJSZXN1bHQgPSBldmFsdWF0aW9uLnJlc3VsdDtcblxuICB2YXIgdGFyZ2V0Q2xvbmUgPSB0YXJnZXRTZXQuY2xvbmUoKTtcbiAgdmFyIHVzZXJDbG9uZSA9IHVzZXJTZXQuY2xvbmUoKTtcbiAgdmFyIHNldENvbnN0YW50c1RvVmFsdWUgPSBmdW5jdGlvbiAodmFsLCBpbmRleCkge1xuICAgIHZhciBuYW1lID0gdGFyZ2V0Q29uc3RhbnRzW2luZGV4XS5uYW1lO1xuICAgIHRhcmdldENsb25lLmdldEVxdWF0aW9uKG5hbWUpLmV4cHJlc3Npb24uc2V0VmFsdWUodmFsKTtcbiAgICB1c2VyQ2xvbmUuZ2V0RXF1YXRpb24obmFtZSkuZXhwcmVzc2lvbi5zZXRWYWx1ZSh2YWwpO1xuICB9O1xuXG4gIGV2YWx1YXRpb24gPSB0YXJnZXRTZXQuZXZhbHVhdGUoKTtcbiAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgdGhyb3cgZXZhbHVhdGlvbi5lcnI7XG4gIH1cbiAgdmFyIHRhcmdldFJlc3VsdCA9IGV2YWx1YXRpb24ucmVzdWx0O1xuXG4gIGlmICghanNudW1zLmVxdWFscyh1c2VyUmVzdWx0LCB0YXJnZXRSZXN1bHQpKSB7XG4gICAgLy8gT3VyIHJlc3VsdCBjYW4gZGlmZmVyZW50IGZyb20gdGhlIHRhcmdldCByZXN1bHQgZm9yIHR3byByZWFzb25zXG4gICAgLy8gKDEpIFdlIGhhdmUgdGhlIHJpZ2h0IGVxdWF0aW9uLCBidXQgb3VyIFwiY29uc3RhbnRcIiBoYXMgYSBkaWZmZXJlbnQgdmFsdWUuXG4gICAgLy8gKDIpIFdlIGhhdmUgdGhlIHdyb25nIGVxdWF0aW9uXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGV2YWx1YXRlIHRvIHRoZSBzYW1lIGFzIHRhcmdldCBpZiB3ZSBnaXZlIGl0IHRoZVxuICAgIC8vIHZhbHVlcyBmcm9tIG91ciB1c2VyU2V0LlxuICAgIHRhcmdldENvbnN0YW50cy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgICAgdmFyIG5hbWUgPSBpdGVtLm5hbWU7XG4gICAgICB2YXIgdmFsID0gdXNlckNsb25lLmdldEVxdWF0aW9uKG5hbWUpLmV4cHJlc3Npb24uZXZhbHVhdGUoKS5yZXN1bHQ7XG4gICAgICBzZXRDb25zdGFudHNUb1ZhbHVlKHZhbCwgaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgZXZhbHVhdGlvbiA9IHRhcmdldENsb25lLmV2YWx1YXRlKCk7XG4gICAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgICByZXR1cm4gZGl2WmVyb09yRmFpbHVyZShldmFsdWF0aW9uLmVycik7XG4gICAgfVxuICAgIGlmICghanNudW1zLmVxdWFscyh1c2VyUmVzdWx0LCBldmFsdWF0aW9uLnJlc3VsdCkpIHtcbiAgICAgIHJldHVybiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKGNhbGNNc2cud3JvbmdSZXN1bHQoKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIHVzZXIgZ290IHRoZSByaWdodCB2YWx1ZSBmb3IgdGhlaXIgaW5wdXQuIExldCdzIHRyeSBjaGFuZ2luZyBpdCBhbmRcbiAgLy8gc2VlIGlmIHRoZXkgc3RpbGwgZ2V0IHRoZSByaWdodCB2YWx1ZVxuICB2YXIgcG9zc2libGVWYWx1ZXMgPSBfLnJhbmdlKDEsIDEwMSkuY29uY2F0KF8ucmFuZ2UoLTAsIC0xMDEsIC0xKSk7XG4gIHZhciBudW1QYXJhbXMgPSB0YXJnZXRDb25zdGFudHMubGVuZ3RoO1xuICB2YXIgaXRlcmF0b3IgPSBuZXcgSW5wdXRJdGVyYXRvcihwb3NzaWJsZVZhbHVlcywgbnVtUGFyYW1zKTtcblxuICB3aGlsZSAoaXRlcmF0b3IucmVtYWluaW5nKCkgPiAwICYmICFvdXRjb21lLmZhaWxlZElucHV0KSB7XG4gICAgdmFyIHZhbHVlcyA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICB2YWx1ZXMuZm9yRWFjaChzZXRDb25zdGFudHNUb1ZhbHVlKTtcblxuICAgIHZhciB0YXJnZXRFdmFsdWF0aW9uID0gdGFyZ2V0Q2xvbmUuZXZhbHVhdGUoKTtcbiAgICB2YXIgdXNlckV2YWx1YXRpb24gPSB1c2VyQ2xvbmUuZXZhbHVhdGUoKTtcbiAgICB2YXIgZXJyID0gdGFyZ2V0RXZhbHVhdGlvbi5lcnIgfHwgdXNlckV2YWx1YXRpb24uZXJyO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBkaXZaZXJvT3JGYWlsdXJlKGVycik7XG4gICAgfVxuXG4gICAgaWYgKCFqc251bXMuZXF1YWxzKHRhcmdldEV2YWx1YXRpb24ucmVzdWx0LCB1c2VyRXZhbHVhdGlvbi5yZXN1bHQpKSB7XG4gICAgICBvdXRjb21lLmZhaWxlZElucHV0ID0gXy5jbG9uZSh2YWx1ZXMpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvdXRjb21lLmZhaWxlZElucHV0KSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBjYWxjTXNnLndyb25nT3RoZXJWYWx1ZXNYKHt2YXI6IHRhcmdldENvbnN0YW50c1swXS5uYW1lfSk7XG4gICAgcmV0dXJuIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUobWVzc2FnZSwgb3V0Y29tZS5mYWlsZWRJbnB1dCk7XG4gIH1cblxuICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFMTF9QQVNTO1xuICByZXR1cm4gb3V0Y29tZTtcbn07XG5cbi8qKlxuICogQHN0YXRpY1xuICogQHJldHVybnMgb3V0Y29tZSBvYmplY3RcbiAqL1xuQ2FsYy5ldmFsdWF0ZVJlc3VsdHNfID0gZnVuY3Rpb24gKHRhcmdldFNldCwgdXNlclNldCkge1xuICB2YXIgaWRlbnRpY2FsLCB1c2VyLCB0YXJnZXQ7XG4gIHZhciBvdXRjb21lID0ge1xuICAgIHJlc3VsdDogUmVzdWx0VHlwZS5VTlNFVCxcbiAgICB0ZXN0UmVzdWx0czogVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOLFxuICAgIG1lc3NhZ2U6IHVuZGVmaW5lZCxcbiAgICBmYWlsZWRJbnB1dDogbnVsbFxuICB9O1xuXG4gIGlmICh0YXJnZXRTZXQuY29tcHV0ZXNGdW5jdGlvbkNhbGwoKSkge1xuICAgIC8vIEV2YWx1YXRlIGZ1bmN0aW9uIGJ5IHRlc3RpbmcgaXQgd2l0aCBhIHNlcmllcyBvZiBpbnB1dHNcbiAgICByZXR1cm4gQ2FsYy5ldmFsdWF0ZUZ1bmN0aW9uXyh0YXJnZXRTZXQsIHVzZXJTZXQpO1xuICB9IGVsc2UgaWYgKHRhcmdldFNldC5jb21wdXRlc1NpbmdsZVZhcmlhYmxlKCkpIHtcbiAgICByZXR1cm4gQ2FsYy5ldmFsdWF0ZVNpbmdsZVZhcmlhYmxlXyh0YXJnZXRTZXQsIHVzZXJTZXQpO1xuICB9IGVsc2UgaWYgKHVzZXJTZXQuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSB8fFxuICAgICAgdGFyZ2V0U2V0Lmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkpIHtcblxuICAgIC8vIFdlIGhhdmUgbXVsdGlwbGUgZXhwcmVzc2lvbnMuIEVpdGhlciBvdXIgc2V0IG9mIGV4cHJlc3Npb25zIGFyZSBlcXVhbCxcbiAgICAvLyBvciB0aGV5J3JlIG5vdC5cbiAgICBpZiAodGFyZ2V0U2V0LmlzSWRlbnRpY2FsVG8odXNlclNldCkpIHtcbiAgICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFMTF9QQVNTO1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0U2V0LmlzRXF1aXZhbGVudFRvKHVzZXJTZXQpKSB7XG4gICAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIG91dGNvbWUubWVzc2FnZSA9IGNhbGNNc2cuZXF1aXZhbGVudEV4cHJlc3Npb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMO1xuICAgIH1cbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfSBlbHNlIHtcbiAgICAvLyBXZSBoYXZlIG9ubHkgYSBjb21wdXRlIGVxdWF0aW9uIGZvciBlYWNoIHNldC4gSWYgdGhleSdyZSBub3QgZXF1YWwsXG4gICAgLy8gY2hlY2sgdG8gc2VlIHdoZXRoZXIgdGhleSBhcmUgZXF1aXZhbGVudCAoaS5lLiB0aGUgc2FtZSwgYnV0IHdpdGhcbiAgICAvLyBpbnB1dHMgb3JkZXJlZCBkaWZmZXJlbnRseSlcbiAgICB1c2VyID0gdXNlclNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgICB0YXJnZXQgPSB0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG5cbiAgICBpZGVudGljYWwgPSB0YXJnZXRTZXQuaXNJZGVudGljYWxUbyh1c2VyU2V0KTtcbiAgICBpZiAoaWRlbnRpY2FsKSB7XG4gICAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BTExfUEFTUztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChvdXRjb21lLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKTtcbiAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG4gICAgICBpZiAodGFyZ2V0ICYmIHVzZXIuZXhwcmVzc2lvbiAmJlxuICAgICAgICAgIHVzZXIuZXhwcmVzc2lvbi5pc0VxdWl2YWxlbnRUbyh0YXJnZXQuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgICBvdXRjb21lLm1lc3NhZ2UgPSBjYWxjTXNnLmVxdWl2YWxlbnRFeHByZXNzaW9uKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLlxuICovXG5DYWxjLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgQ2FsYy5nZW5lcmF0ZVJlc3VsdHNfKCk7XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdjYWxjJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGFwcFN0YXRlLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTLFxuICAgIHRlc3RSZXN1bHQ6IGFwcFN0YXRlLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0QmxvY2tzKSxcbiAgICBvbkNvbXBsZXRlOiBvblJlcG9ydENvbXBsZXRlXG4gIH07XG5cbiAgYXBwU3RhdGUud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG4gIHN0dWRpb0FwcC5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhhcHBTdGF0ZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyA/ICd3aW4nIDogJ2ZhaWx1cmUnKTtcblxuICAvLyBEaXNwbGF5IGZlZWRiYWNrIGltbWVkaWF0ZWx5XG4gIGlmIChpc1ByZUFuaW1hdGlvbkZhaWx1cmUoYXBwU3RhdGUudGVzdFJlc3VsdHMpKSB7XG4gICAgcmV0dXJuIGRpc3BsYXlGZWVkYmFjaygpO1xuICB9XG5cbiAgYXBwU3RhdGUuYW5pbWF0aW5nID0gdHJ1ZTtcbiAgaWYgKGFwcFN0YXRlLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTICYmXG4gICAgICBhcHBTdGF0ZS51c2VyU2V0LmlzQW5pbWF0YWJsZSgpICYmXG4gICAgICAhbGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICBDYWxjLnN0ZXAoMCk7XG4gIH0gZWxzZSB7XG4gICAgZGlzcGxheUNvbXBsZXhVc2VyRXhwcmVzc2lvbnMoKTtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0b3BBbmltYXRpbmdBbmREaXNwbGF5RmVlZGJhY2soKTtcbiAgICB9LCBzdGVwU3BlZWQpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBpc1ByZUFuaW1hdGlvbkZhaWx1cmUodGVzdFJlc3VsdCkge1xuICByZXR1cm4gdGVzdFJlc3VsdCA9PT0gVGVzdFJlc3VsdHMuUVVFU1RJT05fTUFSS1NfSU5fTlVNQkVSX0ZJRUxEIHx8XG4gICAgdGVzdFJlc3VsdCA9PT0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05BTF9CTE9DSyB8fFxuICAgIHRlc3RSZXN1bHQgPT09IFRlc3RSZXN1bHRzLkVYVFJBX1RPUF9CTE9DS1NfRkFJTCB8fFxuICAgIHRlc3RSZXN1bHQgPT09IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEIHx8XG4gICAgdGVzdFJlc3VsdCA9PT0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05fTkFNRTtcbn1cblxuLyoqXG4gKiBGaWxsIGFwcFN0YXRlIHdpdGggdGhlIHJlc3VsdHMgb2YgcHJvZ3JhbSBleGVjdXRpb24uXG4gKiBAc3RhdGljXG4gKi9cbkNhbGMuZ2VuZXJhdGVSZXN1bHRzXyA9IGZ1bmN0aW9uICgpIHtcbiAgYXBwU3RhdGUubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICAvLyBDaGVjayBmb3IgcHJlLWV4ZWN1dGlvbiBlcnJvcnNcbiAgaWYgKHN0dWRpb0FwcC5oYXNFeHRyYVRvcEJsb2NrcygpKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhUUkFfVE9QX0JMT0NLU19GQUlMO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzdHVkaW9BcHAuaGFzVW5maWxsZWRGdW5jdGlvbmFsQmxvY2soKSkge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OQUxfQkxPQ0s7XG4gICAgYXBwU3RhdGUubWVzc2FnZSA9IHN0dWRpb0FwcC5nZXRVbmZpbGxlZEZ1bmN0aW9uYWxCbG9ja0Vycm9yKCdmdW5jdGlvbmFsX2NvbXB1dGUnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3R1ZGlvQXBwLmhhc1F1ZXN0aW9uTWFya3NJbk51bWJlckZpZWxkKCkpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5RVUVTVElPTl9NQVJLU19JTl9OVU1CRVJfRklFTEQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNFbXB0eUZ1bmN0aW9uT3JWYXJpYWJsZU5hbWUoKSkge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OX05BTUU7XG4gICAgYXBwU3RhdGUubWVzc2FnZSA9IGNvbW1vbk1zZy51bm5hbWVkRnVuY3Rpb24oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBhcHBTdGF0ZS51c2VyU2V0ID0gbmV3IEVxdWF0aW9uU2V0KEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkpO1xuICBhcHBTdGF0ZS5mYWlsZWRJbnB1dCA9IG51bGw7XG5cbiAgLy8gTm90ZTogVGhpcyB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIGZyZWUgcGxheSwgc28geW91IGNhbiBcImZhaWxcIiBhIGZyZWVcbiAgLy8gcGxheSBsZXZlbCB3aXRoIGEgZGl2aWRlIGJ5IHplcm8gZXJyb3IuXG4gIC8vIEFsc28gd29ydGggbm90aW5nLCB3ZSBtaWdodCBzdGlsbCBlbmQgdXAgZ2V0dGluZyBhIGRpdiB6ZXJvIGxhdGVyIHdoZW5cbiAgLy8gd2Ugc3RhcnQgdmFyeWluZyBpbnB1dHMgaW4gZXZhbHVhdGVSZXN1bHRzX1xuICBpZiAoYXBwU3RhdGUudXNlclNldC5oYXNEaXZaZXJvKCkpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICBhcHBTdGF0ZS5tZXNzYWdlID0gY2FsY01zZy5kaXZpZGVCeVplcm9FcnJvcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChsZXZlbC5mcmVlUGxheSB8fCBsZXZlbC5lZGl0X2Jsb2Nrcykge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfSBlbHNlIHtcbiAgICBhcHBTdGF0ZSA9ICQuZXh0ZW5kKGFwcFN0YXRlLCBDYWxjLmNoZWNrRXhhbXBsZXNfKCkpO1xuXG4gICAgaWYgKGFwcFN0YXRlLnJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgYXBwU3RhdGUgPSAkLmV4dGVuZChhcHBTdGF0ZSxcbiAgICAgICAgQ2FsYy5ldmFsdWF0ZVJlc3VsdHNfKGFwcFN0YXRlLnRhcmdldFNldCwgYXBwU3RhdGUudXNlclNldCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRlIGRlZmF1bHQgbWVzc2FnZSBmb3IgTEVWRUxfSU5DT01QTEVURV9GQUlMXG4gIGlmIChhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMICYmXG4gICAgICAhYXBwU3RhdGUubWVzc2FnZSkge1xuICAgIGFwcFN0YXRlLm1lc3NhZ2UgPSBjYWxjTXNnLmxldmVsSW5jb21wbGV0ZUVycm9yKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHJldHVybnMge09iamVjdH0gc2V0IG9mIGFwcFN0YXRlIHRvIGJlIG1lcmdlZCBieSBjYWxsZXJcbiAqL1xuQ2FsYy5jaGVja0V4YW1wbGVzXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dGNvbWUgPSB7fTtcbiAgaWYgKCFsZXZlbC5leGFtcGxlc1JlcXVpcmVkKSB7XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cblxuICB2YXIgZXhhbXBsZWxlc3MgPSBzdHVkaW9BcHAuZ2V0RnVuY3Rpb25XaXRob3V0VHdvRXhhbXBsZXMoKTtcbiAgaWYgKGV4YW1wbGVsZXNzKSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuICAgIG91dGNvbWUubWVzc2FnZSA9IGNvbW1vbk1zZy5lbXB0eUV4YW1wbGVCbG9ja0Vycm9yTXNnKHtmdW5jdGlvbk5hbWU6IGV4YW1wbGVsZXNzfSk7XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cblxuICB2YXIgdW5maWxsZWQgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsRXhhbXBsZSgpO1xuICBpZiAodW5maWxsZWQpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG5cbiAgICB2YXIgbmFtZSA9IHVuZmlsbGVkLmdldFJvb3RCbG9jaygpLmdldElucHV0VGFyZ2V0QmxvY2soJ0FDVFVBTCcpXG4gICAgICAuZ2V0VGl0bGVWYWx1ZSgnTkFNRScpO1xuICAgIG91dGNvbWUubWVzc2FnZSA9IGNvbW1vbk1zZy5lbXB0eUV4YW1wbGVCbG9ja0Vycm9yTXNnKHtmdW5jdGlvbk5hbWU6IG5hbWV9KTtcbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxuXG4gIHZhciBmYWlsaW5nQmxvY2tOYW1lID0gc3R1ZGlvQXBwLmNoZWNrRm9yRmFpbGluZ0V4YW1wbGVzKGdldENhbGNFeGFtcGxlRmFpbHVyZSk7XG4gIGlmIChmYWlsaW5nQmxvY2tOYW1lKSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBmYWxzZTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgb3V0Y29tZS5tZXNzYWdlID0gY29tbW9uTXNnLmV4YW1wbGVFcnJvck1lc3NhZ2Uoe2Z1bmN0aW9uTmFtZTogZmFpbGluZ0Jsb2NrTmFtZX0pO1xuICB9XG5cbiAgcmV0dXJuIG91dGNvbWU7XG59O1xuXG4vKipcbiAqIElmIHdlIGhhdmUgYW55IGZ1bmN0aW9ucyBvciB2YXJpYWJsZXMgaW4gb3VyIGV4cHJlc3Npb24gc2V0LCB3ZSBkb24ndCBzdXBwb3J0XG4gKiBhbmltYXRpbmcgZXZhbHVhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZGlzcGxheUNvbXBsZXhVc2VyRXhwcmVzc2lvbnMoKSB7XG4gIHZhciByZXN1bHQ7XG4gIGNsZWFyU3ZnRXhwcmVzc2lvbigndXNlckV4cHJlc3Npb24nKTtcblxuICAvLyBDbG9uZSB1c2VyU2V0LCBhcyB3ZSBtaWdodCBtYWtlIHNtYWxsIGNoYW5nZXMgdG8gdGhlbSAoaS5lLiBpZiB3ZSBuZWVkIHRvXG4gIC8vIHZhcnkgdmFyaWFibGVzKVxuICB2YXIgdXNlclNldCA9IGFwcFN0YXRlLnVzZXJTZXQuY2xvbmUoKTtcbiAgdmFyIHRhcmdldFNldCA9IGFwcFN0YXRlLnRhcmdldFNldDtcblxuICB2YXIgY29tcHV0ZUVxdWF0aW9uID0gdXNlclNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgaWYgKGNvbXB1dGVFcXVhdGlvbiA9PT0gbnVsbCB8fCBjb21wdXRlRXF1YXRpb24uZXhwcmVzc2lvbiA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGdldCB0aGUgdG9rZW5zIGZvciBvdXIgdXNlciBlcXVhdGlvbnNcbiAgdmFyIG5leHRSb3cgPSBkaXNwbGF5Tm9uQ29tcHV0ZUVxdWF0aW9uc18odXNlclNldCwgdGFyZ2V0U2V0KTtcblxuICBpZiAodXNlclNldC5jb21wdXRlc1NpbmdsZUNvbnN0YW50KCkpIHtcbiAgICAvLyBJbiB0aGlzIGNhc2UgdGhlIGNvbXB1dGUgZXF1YXRpb24gKyBldmFsdWF0aW9uIHdpbGwgYmUgZXhhY3RseSB0aGUgc2FtZVxuICAgIC8vIGFzIHdoYXQgd2UndmUgYWxyZWFkeSBzaG93biwgc28gZG9uJ3Qgc2hvdyBpdC5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBOb3cgZGlzcGxheSBvdXIgY29tcHV0ZSBlcXVhdGlvbiBhbmQgdGhlIHJlc3VsdCBvZiBldmFsdWF0aW5nIGl0XG4gIHZhciB0YXJnZXRFcXVhdGlvbiA9IHRhcmdldFNldCAmJiB0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG5cbiAgLy8gV2UncmUgZWl0aGVyIGEgdmFyaWFibGUgb3IgYSBmdW5jdGlvbiBjYWxsLiBHZW5lcmF0ZSBhIHRva2VuTGlzdCAoc2luY2VcbiAgLy8gd2UgY291bGQgYWN0dWFsbHkgYmUgZGlmZmVyZW50IHRoYW4gdGhlIGdvYWwpXG4gIHZhciB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoY29tcHV0ZUVxdWF0aW9uLCB0YXJnZXRFcXVhdGlvbik7XG4gIGlmICh1c2VyU2V0Lmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkgfHxcbiAgICAgIGNvbXB1dGVFcXVhdGlvbi5leHByZXNzaW9uLmRlcHRoKCkgPiAwKSB7XG4gICAgdG9rZW5MaXN0ID0gdG9rZW5MaXN0LmNvbmNhdCh0b2tlbkxpc3RGb3JFdmFsdWF0aW9uXyh1c2VyU2V0LCB0YXJnZXRTZXQpKTtcbiAgfVxuXG4gIGRpc3BsYXlFcXVhdGlvbigndXNlckV4cHJlc3Npb24nLCBudWxsLCB0b2tlbkxpc3QsIG5leHRSb3crKywgJ2Vycm9yVG9rZW4nKTtcblxuICB0b2tlbkxpc3QgPSB0b2tlbkxpc3RGb3JGYWlsZWRGdW5jdGlvbklucHV0Xyh1c2VyU2V0LCB0YXJnZXRTZXQpO1xuICBpZiAodG9rZW5MaXN0ICYmIHRva2VuTGlzdC5sZW5ndGgpIHtcbiAgICBkaXNwbGF5RXF1YXRpb24oJ3VzZXJFeHByZXNzaW9uJywgbnVsbCwgdG9rZW5MaXN0LCBuZXh0Um93KyssICdlcnJvclRva2VuJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwbGF5IGVxdWF0aW9ucyBvdGhlciB0aGFuIG91ciBjb21wdXRlIGVxdWF0aW9uLlxuICogTm90ZTogSW4gb25lIGNhc2UgKHNpbmdsZSB2YXJpYWJsZSBjb21wdXRlLCBmYWlsZWQgaW5wdXQpIHdlIGFsc28gbW9kaWZ5XG4gKiBvdXIgdXNlclNldCBoZXJlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBIb3cgbWFueSByb3dzIHdlIGRpc3BsYXkgZXF1YXRpb25zIG9uLlxuICovXG5mdW5jdGlvbiBkaXNwbGF5Tm9uQ29tcHV0ZUVxdWF0aW9uc18odXNlclNldCwgdGFyZ2V0U2V0KSB7XG4gIC8vIGluIHNpbmdsZSBmdW5jdGlvbi92YXJpYWJsZSBtb2RlLCB3ZSdyZSBvbmx5IGdvaW5nIHRvIGhpZ2hsaWdodCB0aGUgZGlmZmVyZW5jZXNcbiAgLy8gaW4gdGhlIGV2YWx1YXRlZCByZXN1bHRcbiAgdmFyIGhpZ2hsaWdodEFsbEVycm9ycyA9ICF0YXJnZXRTZXQuY29tcHV0ZXNGdW5jdGlvbkNhbGwoKSAmJlxuICAgICF0YXJnZXRTZXQuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSgpO1xuXG4gIGlmICh0YXJnZXRTZXQuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSgpICYmIGFwcFN0YXRlLmZhaWxlZElucHV0ICE9PSBudWxsKSB7XG4gICAgdmFyIHVzZXJDb25zdGFudHMgPSB1c2VyU2V0LmdldENvbnN0YW50cygpO1xuICAgIHZhciB0YXJnZXRDb25zdGFudHMgPSB0YXJnZXRTZXQuZ2V0Q29uc3RhbnRzKCk7XG4gICAgLy8gcmVwbGFjZSBjb25zdGFudHMgd2l0aCBmYWlsZWQgaW5wdXRzIGluIHRoZSB1c2VyIHNldC5cbiAgICB0YXJnZXRDb25zdGFudHMuZm9yRWFjaChmdW5jdGlvbiAodGFyZ2V0RXF1YXRpb24sIGluZGV4KSB7XG4gICAgICB2YXIgbmFtZSA9IHRhcmdldEVxdWF0aW9uLm5hbWU7XG4gICAgICB2YXIgdXNlckVxdWF0aW9uID0gdXNlclNldC5nZXRFcXVhdGlvbihuYW1lKTtcbiAgICAgIHVzZXJFcXVhdGlvbi5leHByZXNzaW9uLnNldFZhbHVlKGFwcFN0YXRlLmZhaWxlZElucHV0W2luZGV4XSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgbnVtUm93cyA9IDA7XG4gIHZhciB0b2tlbkxpc3Q7XG4gIHVzZXJTZXQuc29ydGVkRXF1YXRpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAodXNlckVxdWF0aW9uKSB7XG4gICAgdmFyIGV4cGVjdGVkRXF1YXRpb24gPSBoaWdobGlnaHRBbGxFcnJvcnMgP1xuICAgICAgdGFyZ2V0U2V0LmdldEVxdWF0aW9uKHVzZXJFcXVhdGlvbi5uYW1lKSA6IG51bGw7XG5cbiAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QodXNlckVxdWF0aW9uLCBleHBlY3RlZEVxdWF0aW9uKTtcblxuICAgIGRpc3BsYXlFcXVhdGlvbigndXNlckV4cHJlc3Npb24nLCB1c2VyRXF1YXRpb24uc2lnbmF0dXJlLCB0b2tlbkxpc3QsIG51bVJvd3MrKyxcbiAgICAgICdlcnJvclRva2VuJyk7XG4gIH0pO1xuXG4gIHJldHVybiBudW1Sb3dzO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHtUb2tlbltdfSB0b2tlbiBsaXN0IGNvbXBhcmluZyB0aGUgZXZsdWF0aW9uIG9mIHRoZSB1c2VyIGFuZCB0YXJnZXRcbiAqICAgc2V0cy4gSW5jbHVkZXMgZXF1YWxzIHNpZ24uXG4gKi9cbmZ1bmN0aW9uIHRva2VuTGlzdEZvckV2YWx1YXRpb25fKHVzZXJTZXQsIHRhcmdldFNldCkge1xuICB2YXIgZXZhbHVhdGlvbiA9IHVzZXJTZXQuZXZhbHVhdGUoKTtcblxuICAvLyBDaGVjayBmb3IgZGl2IHplcm9cbiAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgaWYgKGV2YWx1YXRpb24uZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IgfHxcbiAgICAgICAgdXRpbHMuaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yKGV2YWx1YXRpb24uZXJyKSkge1xuICAgICAgLy8gRXhwZWN0ZWQgdHlwZSBvZiBlcnJvciwgZG8gbm90aGluZy5cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ1VuZXhwZWN0ZWQgZXJyb3I6ICcgKyBldmFsdWF0aW9uLmVycik7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBldmFsdWF0aW9uLnJlc3VsdDtcbiAgdmFyIGV4cGVjdGVkUmVzdWx0ID0gcmVzdWx0O1xuICBpZiAodGFyZ2V0U2V0LmNvbXB1dGVzU2luZ2xlVmFyaWFibGUoKSkge1xuICAgIC8vIElmIHdlIGhhdmUgYSBmYWlsZWQgaW5wdXQsIG1ha2Ugc3VyZSB0aGUgcmVzdWx0IGdldHMgbWFya2VkXG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBUb2tlbignID0gJywgZmFsc2UpLFxuICAgICAgbmV3IFRva2VuKHJlc3VsdCwgYXBwU3RhdGUuZmFpbGVkSW5wdXQpXG4gICAgXTtcbiAgfSBlbHNlIGlmICh0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCkgIT09IG51bGwpIHtcbiAgICBleHBlY3RlZFJlc3VsdCA9IHRhcmdldFNldC5ldmFsdWF0ZSgpLnJlc3VsdDtcbiAgfVxuXG4gIC8vIGFkZCBhIHRva2VuTGlzdCBkaWZmaW5nIG91ciByZXN1bHRzXG4gIHJldHVybiBjb25zdHJ1Y3RUb2tlbkxpc3QoJyA9ICcpLmNvbmNhdChcbiAgICBjb25zdHJ1Y3RUb2tlbkxpc3QocmVzdWx0LCBleHBlY3RlZFJlc3VsdCkpO1xufVxuXG4vKipcbiAqIEZvciBjYXNlcyB3aGVyZSB3ZSBoYXZlIGEgc2luZ2xlIGZ1bmN0aW9uLCBhbmQgZmFpbHVyZSBvY2N1cmVkIG9ubHkgYWZ0ZXJcbiAqIHdlIHZhcmllZCB0aGUgaW5wdXRzLCB3ZSB3YW50IHRvIGRpc3BsYXkgYSBmaW5hbCBsaW5lIHRoYXQgc2hvd3MgdGhlIHZhcmllZFxuICogaW5wdXQgYW5kIHJlc3VsdC4gVGhpcyBtZXRob2QgZ2VuZXJhdGVzIHRoYXQgdG9rZW4gbGlzdFxuICogQHJldHVybnMge1Rva2VuW119XG4gKi9cbmZ1bmN0aW9uIHRva2VuTGlzdEZvckZhaWxlZEZ1bmN0aW9uSW5wdXRfKHVzZXJTZXQsIHRhcmdldFNldCkge1xuICBpZiAoYXBwU3RhdGUuZmFpbGVkSW5wdXQgPT09IG51bGwgfHwgIXRhcmdldFNldC5jb21wdXRlc0Z1bmN0aW9uQ2FsbCgpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGNvbXB1dGVFcXVhdGlvbiA9IHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIHZhciBleHByZXNzaW9uID0gY29tcHV0ZUVxdWF0aW9uLmV4cHJlc3Npb24uY2xvbmUoKTtcbiAgZm9yICh2YXIgYyA9IDA7IGMgPCBleHByZXNzaW9uLm51bUNoaWxkcmVuKCk7IGMrKykge1xuICAgIGV4cHJlc3Npb24uc2V0Q2hpbGRWYWx1ZShjLCBhcHBTdGF0ZS5mYWlsZWRJbnB1dFtjXSk7XG4gIH1cbiAgdmFyIGV2YWx1YXRpb24gPSB1c2VyU2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgIGlmIChldmFsdWF0aW9uLmVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yKSB7XG4gICAgICBldmFsdWF0aW9uLnJlc3VsdCA9ICcnOyAvLyByZXN1bHQgd2lsbCBub3QgYmUgdXNlZCBpbiB0aGlzIGNhc2VcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXZhbHVhdGlvbi5lcnI7XG4gICAgfVxuICB9XG4gIHZhciByZXN1bHQgPSBldmFsdWF0aW9uLnJlc3VsdDtcblxuICByZXR1cm4gY29uc3RydWN0VG9rZW5MaXN0KGV4cHJlc3Npb24pXG4gICAgLmNvbmNhdChuZXcgVG9rZW4oJyA9ICcsIGZhbHNlKSlcbiAgICAuY29uY2F0KG5ldyBUb2tlbihyZXN1bHQsIHRydWUpKTsgLy8gdGhpcyBzaG91bGQgYWx3YXlzIGJlIG1hcmtlZFxufVxuXG5mdW5jdGlvbiBzdG9wQW5pbWF0aW5nQW5kRGlzcGxheUZlZWRiYWNrKCkge1xuICBhcHBTdGF0ZS5hbmltYXRpbmcgPSBmYWxzZTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59XG5cbi8qKlxuICogUGVyZm9ybSBhIHN0ZXAgaW4gb3VyIGV4cHJlc3Npb24gZXZhbHVhdGlvbiBhbmltYXRpb24uIFRoaXMgY29uc2lzdHMgb2ZcbiAqIGNvbGxhcHNpbmcgdGhlIG5leHQgbm9kZSBpbiBvdXIgdHJlZS4gSWYgdGhhdCBub2RlIGZhaWxlZCBleHBlY3RhdGlvbnMsIHdlXG4gKiB3aWxsIHN0b3AgZnVydGhlciBldmFsdWF0aW9uLlxuICovXG5DYWxjLnN0ZXAgPSBmdW5jdGlvbiAoYW5pbWF0aW9uRGVwdGgpIHtcbiAgdmFyIGlzRmluYWwgPSBhbmltYXRlVXNlckV4cHJlc3Npb24oYW5pbWF0aW9uRGVwdGgpO1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaXNGaW5hbCkge1xuICAgICAgLy8gb25lIGRlZXBlciB0byByZW1vdmUgaGlnaGxpZ2h0aW5nXG4gICAgICBhbmltYXRlVXNlckV4cHJlc3Npb24oYW5pbWF0aW9uRGVwdGggKyAxKTtcbiAgICAgIHN0b3BBbmltYXRpbmdBbmREaXNwbGF5RmVlZGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgQ2FsYy5zdGVwKGFuaW1hdGlvbkRlcHRoICsgMSk7XG4gICAgfVxuICB9LCBzdGVwU3BlZWQpO1xufTtcblxuLyoqXG4gKiBHZXRzIHJpZCBvZiBhbGwgdGhlIGNoaWxkcmVuIGZyb20gdGhlIHN2ZyBvZiB0aGUgZ2l2ZW4gaWRcbiAqIEBwYXJhbSB7aWR9IHN0cmluZ1xuICovXG5mdW5jdGlvbiBjbGVhclN2Z0V4cHJlc3Npb24oaWQpIHtcbiAgdmFyIGcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gIGlmICghZykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHdoaWxlIChnLmxhc3RDaGlsZCkge1xuICAgIGcucmVtb3ZlQ2hpbGQoZy5sYXN0Q2hpbGQpO1xuICB9XG59XG5cbi8qKlxuICogRHJhd3MgYSB1c2VyIGV4cHJlc3Npb24gYW5kIGVhY2ggc3RlcCBjb2xsYXBzaW5nIGl0LCB1cCB0byBnaXZlbiBkZXB0aC5cbiAqIEByZXR1cm5zIFRydWUgaWYgaXQgY291bGRuJ3QgY29sbGFwc2UgYW55IGZ1cnRoZXIgYXQgdGhpcyBkZXB0aC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZVVzZXJFeHByZXNzaW9uIChtYXhOdW1TdGVwcykge1xuICB2YXIgdXNlckVxdWF0aW9uID0gYXBwU3RhdGUudXNlclNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgaWYgKCF1c2VyRXF1YXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcXVpcmUgdXNlciBleHByZXNzaW9uJyk7XG4gIH1cbiAgdmFyIHVzZXJFeHByZXNzaW9uID0gdXNlckVxdWF0aW9uLmV4cHJlc3Npb247XG4gIGlmICghdXNlckV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xuXG4gIGlmIChhcHBTdGF0ZS51c2VyU2V0Lmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkgfHxcbiAgICBhcHBTdGF0ZS50YXJnZXRTZXQuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFuaW1hdGUgaWYgZWl0aGVyIHVzZXIvdGFyZ2V0IGhhdmUgZnVuY3Rpb25zL3ZhcnNcIik7XG4gIH1cblxuICBjbGVhclN2Z0V4cHJlc3Npb24oJ3VzZXJFeHByZXNzaW9uJyk7XG5cbiAgdmFyIGN1cnJlbnQgPSB1c2VyRXhwcmVzc2lvbi5jbG9uZSgpO1xuICB2YXIgcHJldmlvdXNFeHByZXNzaW9uID0gY3VycmVudDtcbiAgdmFyIG51bUNvbGxhcHNlcyA9IDA7XG4gIC8vIEVhY2ggc3RlcCBkcmF3cyBhIHNpbmdsZSBsaW5lXG4gIGZvciAodmFyIGN1cnJlbnRTdGVwID0gMDsgY3VycmVudFN0ZXAgPD0gbWF4TnVtU3RlcHMgJiYgIWZpbmlzaGVkOyBjdXJyZW50U3RlcCsrKSB7XG4gICAgdmFyIHRva2VuTGlzdDtcbiAgICBpZiAobnVtQ29sbGFwc2VzID09PSBtYXhOdW1TdGVwcykge1xuICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBsaW5lIGluIHRoZSBjdXJyZW50IGFuaW1hdGlvbiwgaGlnaGxpZ2h0IHdoYXQgaGFzXG4gICAgICAvLyBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGxpbmVcbiAgICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChjdXJyZW50LCBwcmV2aW91c0V4cHJlc3Npb24pO1xuICAgIH0gZWxzZSBpZiAobnVtQ29sbGFwc2VzICsgMSA9PT0gbWF4TnVtU3RlcHMpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHNlY29uZCB0byBsYXN0IGxpbmUuIEhpZ2hsaWdodCB0aGUgYmxvY2sgYmVpbmcgY29sbGFwc2VkLFxuICAgICAgLy8gYW5kIHRoZSBkZWVwZXN0IG9wZXJhdGlvbiAodGhhdCB3aWxsIGJlIGNvbGxhcHNlZCBvbiB0aGUgbmV4dCBsaW5lKVxuICAgICAgdmFyIGRlZXBlc3QgPSBjdXJyZW50LmdldERlZXBlc3RPcGVyYXRpb24oKTtcbiAgICAgIGlmIChkZWVwZXN0KSB7XG4gICAgICAgIHN0dWRpb0FwcC5oaWdobGlnaHQoJ2Jsb2NrX2lkXycgKyBkZWVwZXN0LmJsb2NrSWQpO1xuICAgICAgfVxuICAgICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGN1cnJlbnQsIG51bGwsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEb24ndCBoaWdobGlnaHQgYW55dGhpbmdcbiAgICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChjdXJyZW50KTtcbiAgICB9XG5cbiAgICAvLyBGb3IgbGluZXMgYWZ0ZXIgdGhlIGZpcnN0IG9uZSwgd2Ugd2FudCB0aGVtIGxlZnQgYWxpZ25lZCBhbmQgcHJlY2VlZGVkXG4gICAgLy8gYnkgYW4gZXF1YWxzIHNpZ24uXG4gICAgdmFyIGxlZnRBbGlnbiA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50U3RlcCA+IDApIHtcbiAgICAgIGxlZnRBbGlnbiA9IHRydWU7XG4gICAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoJz0gJykuY29uY2F0KHRva2VuTGlzdCk7XG4gICAgfVxuICAgIGRpc3BsYXlFcXVhdGlvbigndXNlckV4cHJlc3Npb24nLCBudWxsLCB0b2tlbkxpc3QsIG51bUNvbGxhcHNlcywgJ21hcmtlZFRva2VuJywgbGVmdEFsaWduKTtcbiAgICBwcmV2aW91c0V4cHJlc3Npb24gPSBjdXJyZW50LmNsb25lKCk7XG4gICAgaWYgKGN1cnJlbnQuaXNEaXZaZXJvKCkpIHtcbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnQuY29sbGFwc2UoKSkge1xuICAgICAgbnVtQ29sbGFwc2VzKys7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50U3RlcCA9PT0gbnVtQ29sbGFwc2VzICsgMSkge1xuICAgICAgLy8gZ28gb25lIHBhc3Qgb3VyIG51bSBjb2xsYXBzZXMgc28gdGhhdCB0aGUgbGFzdCBsaW5lIGdldHMgaGlnaGxpZ2h0ZWRcbiAgICAgIC8vIG9uIGl0cyBvd25cbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluaXNoZWQ7XG59XG5cbi8qKlxuICogQXBwZW5kIGEgdG9rZW5MaXN0IHRvIHRoZSBnaXZlbiBwYXJlbnQgZWxlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudElkIElkIG9mIHBhcmVudCBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIG9mIHRoZSBmdW5jdGlvbi92YXJpYWJsZS4gTnVsbCBpZiBiYXNlIGV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IHRva2VuTGlzdCBBIGxpc3Qgb2YgdG9rZW5zLCByZXByZXNlbnRpbmcgdGhlIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIEhvdyBtYW55IGxpbmVzIGRlZXAgaW50byBwYXJlbnQgdG8gZGlzcGxheVxuICogQHBhcmFtIHtzdHJpbmd9IG1hcmtDbGFzcyBDc3MgY2xhc3MgdG8gdXNlIGZvciAnbWFya2VkJyB0b2tlbnMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGxlZnRBbGlnbiBJZiB0cnVlLCBlcXVhdGlvbnMgYXJlIGxlZnQgYWxpZ25lZCBpbnN0ZWFkIG9mXG4gKiAgIGNlbnRlcmVkLlxuICovXG5mdW5jdGlvbiBkaXNwbGF5RXF1YXRpb24ocGFyZW50SWQsIG5hbWUsIHRva2VuTGlzdCwgbGluZSwgbWFya0NsYXNzLCBsZWZ0QWxpZ24pIHtcbiAgdmFyIHBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmVudElkKTtcblxuICB2YXIgZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2cnKTtcbiAgcGFyZW50LmFwcGVuZENoaWxkKGcpO1xuICB2YXIgeFBvcyA9IDA7XG4gIHZhciBsZW47XG4gIGlmIChuYW1lKSB7XG4gICAgbGVuID0gbmV3IFRva2VuKG5hbWUgKyAnID0gJywgZmFsc2UpLnJlbmRlclRvUGFyZW50KGcsIHhQb3MsIG51bGwpO1xuICAgIHhQb3MgKz0gbGVuO1xuICB9XG4gIHZhciBmaXJzdFRva2VuTGVuID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbkxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBsZW4gPSB0b2tlbkxpc3RbaV0ucmVuZGVyVG9QYXJlbnQoZywgeFBvcywgbWFya0NsYXNzKTtcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgZmlyc3RUb2tlbkxlbiA9IGxlbjtcbiAgICB9XG4gICAgeFBvcyArPSBsZW47XG4gIH1cblxuICB2YXIgeFBhZGRpbmc7XG4gIGlmIChsZWZ0QWxpZ24pIHtcbiAgICAvLyBBbGlnbiBzZWNvbmQgdG9rZW4gd2l0aCBwYXJlbnQgKGFzc3VtcHRpb24gaXMgdGhhdCBmaXJzdCB0b2tlbiBpcyBvdXJcbiAgICAvLyBlcXVhbCBzaWduKS5cbiAgICB2YXIgdHJhbnNmb3JtID0gQmxvY2tseS5nZXRSZWxhdGl2ZVhZKHBhcmVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICB4UGFkZGluZyA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLngpIC0gZmlyc3RUb2tlbkxlbjtcbiAgfSBlbHNlIHtcbiAgICB4UGFkZGluZyA9IChDQU5WQVNfV0lEVEggLSBnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKSAvIDI7XG4gIH1cbiAgdmFyIHlQb3MgPSAobGluZSAqIExJTkVfSEVJR0hUKTtcbiAgZy5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHhQYWRkaW5nICsgJywgJyArIHlQb3MgKyAnKScpO1xufVxuXG4vKipcbiAqIERlZXAgY2xvbmUgYSBub2RlLCB0aGVuIHJlbW92aW5nIGFueSBpZHMgZnJvbSB0aGUgY2xvbmUgc28gdGhhdCB3ZSBkb24ndCBoYXZlXG4gKiBkdXBsaWNhdGVkIGlkcy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVOb2RlV2l0aG91dElkcyhlbGVtZW50SWQpIHtcbiAgdmFyIGNsb25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKS5jbG9uZU5vZGUodHJ1ZSk7XG4gIGNsb25lLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICB2YXIgZGVzY2VuZGFudHMgPSBjbG9uZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGVzY2VuZGFudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWxlbWVudCA9IGRlc2NlbmRhbnRzW2ldO1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik7XG4gIH1cblxuICByZXR1cm4gY2xvbmU7XG59XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5mdW5jdGlvbiBkaXNwbGF5RmVlZGJhY2soKSB7XG4gIGlmIChhcHBTdGF0ZS53YWl0aW5nRm9yUmVwb3J0IHx8IGFwcFN0YXRlLmFuaW1hdGluZykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIG92ZXJyaWRlIGV4dHJhIHRvcCBibG9ja3MgbWVzc2FnZVxuICBsZXZlbC5leHRyYVRvcEJsb2NrcyA9IGNhbGNNc2cuZXh0cmFUb3BCbG9ja3MoKTtcbiAgdmFyIGFwcERpdiA9IG51bGw7XG4gIC8vIFNob3cgc3ZnIGluIGZlZWRiYWNrIGRpYWxvZ1xuICBpZiAoIWlzUHJlQW5pbWF0aW9uRmFpbHVyZShhcHBTdGF0ZS50ZXN0UmVzdWx0cykpIHtcbiAgICBhcHBEaXYgPSBjbG9uZU5vZGVXaXRob3V0SWRzKCdzdmdDYWxjJyk7XG4gICAgYXBwRGl2LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnc3ZnQ2FsY0ZlZWRiYWNrJyk7XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgYXBwOiAnY2FsYycsXG4gICAgc2tpbjogc2tpbi5pZCxcbiAgICByZXNwb25zZTogYXBwU3RhdGUucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIGZlZWRiYWNrVHlwZTogYXBwU3RhdGUudGVzdFJlc3VsdHMsXG4gICAgdHJ5QWdhaW5UZXh0OiBsZXZlbC5mcmVlUGxheSA/IGNvbW1vbk1zZy5rZWVwUGxheWluZygpIDogdW5kZWZpbmVkLFxuICAgIGNvbnRpbnVlVGV4dDogbGV2ZWwuZnJlZVBsYXkgPyBjb21tb25Nc2cubmV4dFB1enpsZSgpIDogdW5kZWZpbmVkLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IGNhbGNNc2cucmVpbmZGZWVkYmFja01zZygpXG4gICAgfSxcbiAgICBhcHBEaXY6IGFwcERpdlxuICB9O1xuICBpZiAoYXBwU3RhdGUubWVzc2FnZSAmJiAhbGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICBvcHRpb25zLm1lc3NhZ2UgPSBhcHBTdGF0ZS5tZXNzYWdlO1xuICB9XG5cbiAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayhvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuZnVuY3Rpb24gb25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSkge1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgYXBwU3RhdGUucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgYXBwU3RhdGUud2FpdGluZ0ZvclJlcG9ydCA9IGZhbHNlO1xuICBzdHVkaW9BcHAub25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSk7XG4gIGRpc3BsYXlGZWVkYmFjaygpO1xufVxuXG4vKiBzdGFydC10ZXN0LWJsb2NrICovXG4vLyBleHBvcnQgcHJpdmF0ZSBmdW5jdGlvbihzKSB0byBleHBvc2UgdG8gdW5pdCB0ZXN0aW5nXG5DYWxjLl9fdGVzdG9ubHlfXyA9IHtcbiAgZGlzcGxheUdvYWw6IGRpc3BsYXlHb2FsLFxuICBkaXNwbGF5Q29tcGxleFVzZXJFeHByZXNzaW9uczogZGlzcGxheUNvbXBsZXhVc2VyRXhwcmVzc2lvbnMsXG4gIGFwcFN0YXRlOiBhcHBTdGF0ZVxufTtcbi8qIGVuZC10ZXN0LWJsb2NrICovXG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpOyA7IGJ1Zi5wdXNoKCdcXG5cXG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJzdmdDYWxjXCI+XFxuICA8aW1hZ2UgaWQ9XCJiYWNrZ3JvdW5kXCIgaGVpZ2h0PVwiNDAwXCIgd2lkdGg9XCI0MDBcIiB4PVwiMFwiIHk9XCIwXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeGxpbms6aHJlZj1cIi9ibG9ja2x5L21lZGlhL3NraW5zL2NhbGMvYmFja2dyb3VuZC5wbmdcIj48L2ltYWdlPlxcbiAgPGcgaWQ9XCJ1c2VyRXhwcmVzc2lvblwiIGNsYXNzPVwiZXhwclwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwLCAxMDApXCI+XFxuICA8L2c+XFxuICA8ZyBpZD1cImFuc3dlckV4cHJlc3Npb25cIiBjbGFzcz1cImV4cHJcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMCwgMzUwKVwiPlxcbiAgPC9nPlxcbjwvc3ZnPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGxldmVsLXNwZWNpZmljIHJlcXVpcmVtZW50cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICdleGFtcGxlMSc6IHtcbiAgICBzb2x1dGlvbkJsb2NrczogYmxvY2tVdGlscy5jYWxjQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfdGltZXMnLCBbXG4gICAgICBibG9ja1V0aWxzLmNhbGNCbG9ja1htbCgnZnVuY3Rpb25hbF9wbHVzJywgWzEsIDJdKSxcbiAgICAgIGJsb2NrVXRpbHMuY2FsY0Jsb2NrWG1sKCdmdW5jdGlvbmFsX3BsdXMnLCBbMywgNF0pXG4gICAgXSksXG4gICAgaWRlYWw6IEluZmluaXR5LFxuICAgIHRvb2xib3g6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfcGx1cycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbWludXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3RpbWVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9kaXZpZGVkYnknKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJykgK1xuICAgICAgJzxibG9jayB0eXBlPVwiZnVuY3Rpb25hbF9tYXRoX251bWJlcl9kcm9wZG93blwiPicgK1xuICAgICAgJyAgPHRpdGxlIG5hbWU9XCJOVU1cIiBjb25maWc9XCIwLDEsMiwzLDQsNSw2LDcsOCw5LDEwXCI+Pz8/PC90aXRsZT4nICtcbiAgICAgICc8L2Jsb2NrPidcbiAgICAgICksXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHJlcXVpcmVkQmxvY2tzOiAnJyxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcblxuICAnY3VzdG9tJzoge1xuICAgIGFuc3dlcjogJycsXG4gICAgaWRlYWw6IEluZmluaXR5LFxuICAgIHRvb2xib3g6ICcnLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICByZXF1aXJlZEJsb2NrczogJycsXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH1cbn07XG4iLCIvKipcbiAqIEdpdmVuIGEgc2V0IG9mIHZhbHVlcyAoaS5lLiBbMSwyLDNdLCBhbmQgYSBudW1iZXIgb2YgcGFyYW1ldGVycywgZ2VuZXJhdGVzXG4gKiBhbGwgcG9zc2libGUgY29tYmluYXRpb25zIG9mIHZhbHVlcy5cbiAqL1xudmFyIElucHV0SXRlcmF0b3IgPSBmdW5jdGlvbiAodmFsdWVzLCBudW1QYXJhbXMpIHtcbiAgdGhpcy5udW1QYXJhbXNfID0gbnVtUGFyYW1zO1xuICB0aGlzLnJlbWFpbmluZ18gPSBNYXRoLnBvdyh2YWx1ZXMubGVuZ3RoLCBudW1QYXJhbXMpO1xuICB0aGlzLmF2YWlsYWJsZVZhbHVlc18gPSB2YWx1ZXM7XG4gIC8vIHJlcHJlc2VudHMgdGhlIGluZGV4IGludG8gdmFsdWVzIGZvciBlYWNoIHBhcmFtIGZvciB0aGUgY3VycmVudCBwZXJtdXRhdGlvblxuICAvLyBzZXQgb3VyIGZpcnN0IGluZGV4IHRvIC0xIHNvIHRoYXQgaXQgd2lsbCBnZXQgaW5jcmVtZW50ZWQgdG8gMCBvbiB0aGUgZmlyc3RcbiAgLy8gcGFzc1xuICB0aGlzLmluZGljZXNfID0gWy0xXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBudW1QYXJhbXM7IGkrKykge1xuICAgIHRoaXMuaW5kaWNlc19baV0gPSAwO1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBJbnB1dEl0ZXJhdG9yO1xuXG4vKipcbiAqIEdldCB0aGUgbmV4dCBzZXQgb2YgdmFsdWVzLCB0aHJvd2luZyBpZiBub25lIHJlbWFpbmdcbiAqIEByZXR1cm5zIHtudW1iZXJbXX0gTGlzdCBvZiBsZW5ndGggbnVtUGFyYW1zIHJlcHJlc2VudGluZyB0aGUgbmV4dCBzZXQgb2ZcbiAqICAgaW5wdXRzLlxuICovXG5JbnB1dEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5yZW1haW5pbmdfID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdlbXB0eScpO1xuICB9XG5cbiAgdmFyIHdyYXBwZWQ7XG4gIHZhciBwYXJhbU51bSA9IDA7XG4gIGRvIHtcbiAgICB3cmFwcGVkID0gZmFsc2U7XG4gICAgdGhpcy5pbmRpY2VzX1twYXJhbU51bV0rKztcbiAgICBpZiAodGhpcy5pbmRpY2VzX1twYXJhbU51bV0gPT09IHRoaXMuYXZhaWxhYmxlVmFsdWVzXy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaW5kaWNlc19bcGFyYW1OdW1dID0gMDtcbiAgICAgIHBhcmFtTnVtKys7XG4gICAgICB3cmFwcGVkID0gdHJ1ZTtcbiAgICB9XG4gIH0gd2hpbGUod3JhcHBlZCAmJiBwYXJhbU51bSA8IHRoaXMubnVtUGFyYW1zXyk7XG4gIHRoaXMucmVtYWluaW5nXy0tO1xuXG4gIHJldHVybiB0aGlzLmluZGljZXNfLm1hcChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5hdmFpbGFibGVWYWx1ZXNfW2luZGV4XTtcbiAgfSwgdGhpcyk7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIEhvdyBtYW55IHBlcm11dGF0aW9ucyBhcmUgbGVmdFxuICovXG5JbnB1dEl0ZXJhdG9yLnByb3RvdHlwZS5yZW1haW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJlbWFpbmluZ187XG59O1xuIiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlscycpLmdldExvZGFzaCgpO1xudmFyIEV4cHJlc3Npb25Ob2RlID0gcmVxdWlyZSgnLi9leHByZXNzaW9uTm9kZScpO1xudmFyIEVxdWF0aW9uID0gcmVxdWlyZSgnLi9lcXVhdGlvbicpO1xudmFyIGpzbnVtcyA9IHJlcXVpcmUoJy4vanMtbnVtYmVycy9qcy1udW1iZXJzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIEFuIEVxdWF0aW9uU2V0IGNvbnNpc3RzIG9mIGEgdG9wIGxldmVsIChjb21wdXRlKSBlcXVhdGlvbiwgYW5kIG9wdGlvbmFsbHlcbiAqIHNvbWUgbnVtYmVyIG9mIHN1cHBvcnQgZXF1YXRpb25zXG4gKiBAcGFyYW0geyFBcnJheX0gYmxvY2tzIExpc3Qgb2YgYmxvY2tseSBibG9ja3NcbiAqL1xudmFyIEVxdWF0aW9uU2V0ID0gZnVuY3Rpb24gKGJsb2Nrcykge1xuICB0aGlzLmNvbXB1dGVfID0gbnVsbDsgLy8gYW4gRXF1YXRpb25cbiAgdGhpcy5lcXVhdGlvbnNfID0gW107IC8vIGEgbGlzdCBvZiBFcXVhdGlvbnNcblxuICBpZiAoYmxvY2tzKSB7XG4gICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgICB2YXIgZXF1YXRpb24gPSBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhibG9jayk7XG4gICAgICBpZiAoZXF1YXRpb24pIHtcbiAgICAgICAgdGhpcy5hZGRFcXVhdGlvbl8oZXF1YXRpb24pO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFcXVhdGlvblNldDtcblxuRXF1YXRpb25TZXQucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2xvbmUgPSBuZXcgRXF1YXRpb25TZXQoKTtcbiAgY2xvbmUuY29tcHV0ZV8gPSBudWxsO1xuICBpZiAodGhpcy5jb21wdXRlXykge1xuICAgIGNsb25lLmNvbXB1dGVfID0gdGhpcy5jb21wdXRlXy5jbG9uZSgpO1xuICB9XG4gIGNsb25lLmVxdWF0aW9uc18gPSB0aGlzLmVxdWF0aW9uc18ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgfSk7XG4gIHJldHVybiBjbG9uZTtcbn07XG5cbi8qKlxuICogQWRkcyBhbiBlcXVhdGlvbiB0byBvdXIgc2V0LiBJZiBlcXVhdGlvbidzIG5hbWUgaXMgbnVsbCwgc2V0cyBpdCBhcyB0aGVcbiAqIGNvbXB1dGUgZXF1YXRpb24uIFRocm93cyBpZiBlcXVhdGlvbiBvZiB0aGlzIG5hbWUgYWxyZWFkeSBleGlzdHMuXG4gKiBAcGFyYW0ge0VxdWF0aW9ufSBlcXVhdGlvbiBUaGUgZXF1YXRpb24gdG8gYWRkLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuYWRkRXF1YXRpb25fID0gZnVuY3Rpb24gKGVxdWF0aW9uKSB7XG4gIGlmICghZXF1YXRpb24ubmFtZSkge1xuICAgIGlmICh0aGlzLmNvbXB1dGVfKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXB1dGUgZXhwcmVzc2lvbiBhbHJlYWR5IGV4aXN0cycpO1xuICAgIH1cbiAgICB0aGlzLmNvbXB1dGVfID0gZXF1YXRpb247XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRoaXMuZ2V0RXF1YXRpb24oZXF1YXRpb24ubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZXF1YXRpb24gYWxyZWFkeSBleGlzdHM6ICcgKyBlcXVhdGlvbi5uYW1lKTtcbiAgICB9XG4gICAgdGhpcy5lcXVhdGlvbnNfLnB1c2goZXF1YXRpb24pO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhbiBlcXVhdGlvbiBieSBuYW1lLCBvciBjb21wdXRlIGVxdWF0aW9uIGlmIG5hbWUgaXMgbnVsbFxuICogQHJldHVybnMge0VxdWF0aW9ufSBFcXVhdGlvbiBvZiB0aGF0IG5hbWUgaWYgaXQgZXhpc3RzLCBudWxsIG90aGVyd2lzZS5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmdldEVxdWF0aW9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wdXRlRXF1YXRpb24oKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXF1YXRpb25zXy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0aGlzLmVxdWF0aW9uc19baV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXF1YXRpb25zX1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHRoZSBjb21wdXRlIGVxdWF0aW9uIGlmIHRoZXJlIGlzIG9uZVxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuY29tcHV0ZUVxdWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jb21wdXRlXztcbn07XG5cbi8qKlxuICogQHJldHVybnMgdHJ1ZSBpZiBFcXVhdGlvblNldCBoYXMgYXQgbGVhc3Qgb25lIHZhcmlhYmxlIG9yIGZ1bmN0aW9uLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoID4gMDtcbn07XG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgb3VyIGNvbXB1dGUgZXhwcmVzc2lvbiBpcyBqc3V0IGEgZnVuY2l0b24gY2FsbFxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuY29tcHV0ZXNGdW5jdGlvbkNhbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wdXRlXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBjb21wdXRlRXhwcmVzc2lvbiA9IHRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbjtcbiAgcmV0dXJuIGNvbXB1dGVFeHByZXNzaW9uLmlzRnVuY3Rpb25DYWxsKCk7XG59O1xuXG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgb3VyIGNvbXB1dGUgZXhwcmVzc2lvbiBpcyBqdXN0IGEgdmFyaWFibGUsIHdoaWNoXG4gKiB3ZSB0YWtlIHRvIG1lYW4gd2UgY2FuIHRyZWF0IHNpbWlsYXJseSB0byBvdXIgc2luZ2xlIGZ1bmN0aW9uIHNjZW5hcmlvXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5jb21wdXRlc1NpbmdsZVZhcmlhYmxlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY29tcHV0ZV8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGNvbXB1dGVFeHByZXNzaW9uID0gdGhpcy5jb21wdXRlXy5leHByZXNzaW9uO1xuICByZXR1cm4gY29tcHV0ZUV4cHJlc3Npb24uaXNWYXJpYWJsZSgpO1xufTtcblxuLyoqXG4gKiBFeGFtcGxlIHNldCB0aGF0IHJldHVybnMgdHJ1ZTpcbiAqIEFnZSA9IDEyXG4gKiBjb21wdXRlOiBBZ2VcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIG91ciBFcXVhdGlvblNldCBjb25zaXN0cyBvZiBhIHZhcmlhYmxlIHNldCB0b1xuICogICBhIG51bWJlciwgYW5kIHRoZSBjb21wdXRhdGlvbiBvZiB0aGF0IHZhcmlhYmxlLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuY29tcHV0ZXNTaW5nbGVDb25zdGFudCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfIHx8IHRoaXMuZXF1YXRpb25zXy5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGVxdWF0aW9uID0gdGhpcy5lcXVhdGlvbnNfWzBdO1xuICB2YXIgY29tcHV0ZUV4cHJlc3Npb24gPSB0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb247XG4gIHJldHVybiBjb21wdXRlRXhwcmVzc2lvbi5pc1ZhcmlhYmxlKCkgJiYgZXF1YXRpb24uZXhwcmVzc2lvbi5pc051bWJlcigpICYmXG4gICAgY29tcHV0ZUV4cHJlc3Npb24uZ2V0VmFsdWUoKSA9PT0gZXF1YXRpb24ubmFtZTtcblxufTtcblxuRXF1YXRpb25TZXQucHJvdG90eXBlLmlzQW5pbWF0YWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0aGlzLmhhc1ZhcmlhYmxlc09yRnVuY3Rpb25zKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbi5kZXB0aCgpID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGVxdWF0aW9ucyB0aGF0IGNvbnNpc3Qgb2Ygc2V0dGluZyBhIHZhcmlhYmxlIHRvIGEgY29uc3RhbnRcbiAqIHZhbHVlLCB3aXRob3V0IGRvaW5nIGFueSBhZGRpdGlvbmFsIG1hdGguIGkuZS4gZm9vID0gMVxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuZ2V0Q29uc3RhbnRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5lcXVhdGlvbnNfLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLnBhcmFtcy5sZW5ndGggPT09IDAgJiYgaXRlbS5leHByZXNzaW9uLmlzTnVtYmVyKCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBBcmUgdHdvIEVxdWF0aW9uU2V0cyBpZGVudGljYWw/IFRoaXMgaXMgY29uc2lkZXJlZCB0byBiZSB0cnVlIGlmIHRoZWlyXG4gKiBjb21wdXRlIGV4cHJlc3Npb25zIGFyZSBpZGVudGljYWwgYW5kIGFsbCBvZiB0aGVpciBlcXVhdGlvbnMgaGF2ZSB0aGUgc2FtZVxuICogbmFtZXMgYW5kIGlkZW50aWNhbCBleHByZXNzaW9ucy5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmlzSWRlbnRpY2FsVG8gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgaWYgKHRoaXMuZXF1YXRpb25zXy5sZW5ndGggIT09IG90aGVyU2V0LmVxdWF0aW9uc18ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIG90aGVyQ29tcHV0ZSA9IG90aGVyU2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb247XG4gIGlmICghdGhpcy5jb21wdXRlXy5leHByZXNzaW9uLmlzSWRlbnRpY2FsVG8ob3RoZXJDb21wdXRlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lcXVhdGlvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRoaXNFcXVhdGlvbiA9IHRoaXMuZXF1YXRpb25zX1tpXTtcbiAgICB2YXIgb3RoZXJFcXVhdGlvbiA9IG90aGVyU2V0LmdldEVxdWF0aW9uKHRoaXNFcXVhdGlvbi5uYW1lKTtcbiAgICBpZiAoIW90aGVyRXF1YXRpb24gfHxcbiAgICAgICAgIXRoaXNFcXVhdGlvbi5leHByZXNzaW9uLmlzSWRlbnRpY2FsVG8ob3RoZXJFcXVhdGlvbi5leHByZXNzaW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBcmUgdHdvIEVxdWF0aW9uU2V0cyBlcXVpdmFsZW50PyBUaGlzIGlzIGNvbnNpZGVyZWQgdG8gYmUgdHJ1ZSBpZiB0aGVpclxuICogY29tcHV0ZSBleHByZXNzaW9uIGFyZSBlcXVpdmFsZW50IGFuZCBhbGwgb2YgdGhlaXIgZXF1YXRpb25zIGhhdmUgdGhlIHNhbWVcbiAqIG5hbWVzIGFuZCBlcXVpdmFsZW50IGV4cHJlc3Npb25zLiBFcXVpdmFsZW5jZSBpcyBhIGxlc3Mgc3RyaWN0IHJlcXVpcmVtZW50XG4gKiB0aGFuIGlkZW50aWNhbCB0aGF0IGFsbG93cyBwYXJhbXMgdG8gYmUgcmVvcmRlcmVkLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuaXNFcXVpdmFsZW50VG8gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgaWYgKHRoaXMuZXF1YXRpb25zXy5sZW5ndGggIT09IG90aGVyU2V0LmVxdWF0aW9uc18ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIG90aGVyQ29tcHV0ZSA9IG90aGVyU2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb247XG4gIGlmICghdGhpcy5jb21wdXRlXy5leHByZXNzaW9uLmlzRXF1aXZhbGVudFRvKG90aGVyQ29tcHV0ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZXF1YXRpb25zXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0aGlzRXF1YXRpb24gPSB0aGlzLmVxdWF0aW9uc19baV07XG4gICAgdmFyIG90aGVyRXF1YXRpb24gPSBvdGhlclNldC5nZXRFcXVhdGlvbih0aGlzRXF1YXRpb24ubmFtZSk7XG4gICAgaWYgKCFvdGhlckVxdWF0aW9uIHx8XG4gICAgICAgICF0aGlzRXF1YXRpb24uZXhwcmVzc2lvbi5pc0VxdWl2YWxlbnRUbyhvdGhlckVxdWF0aW9uLmV4cHJlc3Npb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBub24tY29tcHV0ZSBlcXVhdGlvbnMgKHZhcnMvZnVuY3Rpb25zKSBzb3J0ZWQgYnkgbmFtZS5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLnNvcnRlZEVxdWF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gbm90ZTogdGhpcyBoYXMgc2lkZSBlZmZlY3RzLCBhcyBpdCByZW9yZGVycyBlcXVhdGlvbnMuIHdlIGNvdWxkIGFsc29cbiAgLy8gZW5zdXJlIHRoaXMgd2FzIGRvbmUgb25seSBvbmNlIGlmIHdlIGhhZCBwZXJmb3JtYW5jZSBjb25jZXJuc1xuICB0aGlzLmVxdWF0aW9uc18uc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcy5lcXVhdGlvbnNfO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBldmFsdWF0aW5nIG91ciBFcXVhdGlvblNldCB3b3VsZCByZXN1bHQgaW5cbiAqICAgZGl2aWRpbmcgYnkgemVyby5cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmhhc0Rpdlplcm8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZSgpO1xuICByZXR1cm4gZXZhbHVhdGlvbi5lcnIgJiZcbiAgICBldmFsdWF0aW9uLmVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yO1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgRXF1YXRpb25TZXQncyBjb21wdXRlIGV4cHJlc3Npb24gaW4gdGhlIGNvbnRleHQgb2YgaXRzIGVxdWF0aW9uc1xuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmV2YWx1YXRlV2l0aEV4cHJlc3Npb24odGhpcy5jb21wdXRlXy5leHByZXNzaW9uKTtcbn07XG5cbi8qKlxuICogRXZhbHVhdGUgdGhlIGdpdmVuIGNvbXB1dGUgZXhwcmVzc2lvbiBpbiB0aGUgY29udGV4dCBvZiB0aGUgRXF1YXRpb25TZXQnc1xuICogZXF1YXRpb25zLiBGb3IgZXhhbXBsZSwgb3VyIGVxdWF0aW9uIHNldCBtaWdodCBkZWZpbmUgZih4KSA9IHggKyAxLCBhbmQgdGhpc1xuICogYWxsb3dzIHVzIHRvIGV2YWx1YXRlIHRoZSBleHByZXNzaW9uIGYoMSkgb3IgZigyKS4uLlxuICogQHBhcmFtIHtFeHByZXNzaW9uTm9kZX0gY29tcHV0ZUV4cHJlc3Npb24gVGhlIGV4cHJlc3Npb24gdG8gZXZhbHVhdGVcbiAqIEByZXR1cm5zIHtPYmplY3R9IGV2YWx1YXRpb24gQW4gb2JqZWN0IHdpdGggZWl0aGVyIGFuIGVyciBvciByZXN1bHQgZmllbGRcbiAqIEByZXR1cm5zIHtFcnJvcj99IGV2YWx1YXRpb24uZXJyXG4gKiBAcmV0dXJucyB7TnVtYmVyP30gZXZhbHVhdGlvbi5yZXN1bHRcbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmV2YWx1YXRlV2l0aEV4cHJlc3Npb24gPSBmdW5jdGlvbiAoY29tcHV0ZUV4cHJlc3Npb24pIHtcbiAgLy8gbm8gdmFyaWFibGVzL2Z1bmN0aW9ucy4gdGhpcyBpcyBlYXN5XG4gIGlmICh0aGlzLmVxdWF0aW9uc18ubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNvbXB1dGVFeHByZXNzaW9uLmV2YWx1YXRlKCk7XG4gIH1cblxuICAvLyBJdGVyYXRlIHRocm91Z2ggb3VyIGVxdWF0aW9ucyB0byBnZW5lcmF0ZSBvdXIgbWFwcGluZy4gV2UgbWF5IG5lZWQgdG8gZG9cbiAgLy8gdGhpcyBhIGZldyB0aW1lcy4gU3RvcCB0cnlpbmcgYXMgc29vbiBhcyB3ZSBkbyBhIGZ1bGwgaXRlcmF0aW9uIHdpdGhvdXRcbiAgLy8gYWRkaW5nIGFueXRoaW5nIG5ldyB0byBvdXIgbWFwcGluZy5cbiAgdmFyIG1hcHBpbmcgPSB7fTtcbiAgdmFyIG1hZGVQcm9ncmVzcztcbiAgdmFyIHRlc3RNYXBwaW5nO1xuICB2YXIgZXZhbHVhdGlvbjtcbiAgdmFyIHNldFRlc3RNYXBwaW5nVG9PbmUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgIHRlc3RNYXBwaW5nW2l0ZW1dID0ganNudW1zLm1ha2VGbG9hdCgxKTtcbiAgfTtcbiAgZG8ge1xuICAgIG1hZGVQcm9ncmVzcyA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lcXVhdGlvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZXF1YXRpb24gPSB0aGlzLmVxdWF0aW9uc19baV07XG4gICAgICBpZiAoZXF1YXRpb24uaXNGdW5jdGlvbigpKSB7XG4gICAgICAgIGlmIChtYXBwaW5nW2VxdWF0aW9uLm5hbWVdKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2VlIGlmIHdlIGNhbiBtYXAgaWYgd2UgcmVwbGFjZSBvdXIgcGFyYW1zXG4gICAgICAgIC8vIG5vdGUgdGhhdCBwYXJhbXMgb3ZlcnJpZGUgZXhpc3RpbmcgdmFycyBpbiBvdXIgdGVzdE1hcHBpbmdcbiAgICAgICAgdGVzdE1hcHBpbmcgPSBfLmNsb25lKG1hcHBpbmcpO1xuICAgICAgICB0ZXN0TWFwcGluZ1tlcXVhdGlvbi5uYW1lXSA9IHtcbiAgICAgICAgICB2YXJpYWJsZXM6IGVxdWF0aW9uLnBhcmFtcyxcbiAgICAgICAgICBleHByZXNzaW9uOiBlcXVhdGlvbi5leHByZXNzaW9uXG4gICAgICAgIH07XG4gICAgICAgIGVxdWF0aW9uLnBhcmFtcy5mb3JFYWNoKHNldFRlc3RNYXBwaW5nVG9PbmUpO1xuICAgICAgICBldmFsdWF0aW9uID0gZXF1YXRpb24uZXhwcmVzc2lvbi5ldmFsdWF0ZSh0ZXN0TWFwcGluZyk7XG4gICAgICAgIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgICAgICAgIGlmIChldmFsdWF0aW9uLmVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yIHx8XG4gICAgICAgICAgICAgIHV0aWxzLmlzSW5maW5pdGVSZWN1cnNpb25FcnJvcihldmFsdWF0aW9uLmVycikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IGVycjogZXZhbHVhdGlvbi5lcnIgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBoYXZlIGEgdmFsaWQgbWFwcGluZ1xuICAgICAgICBtYWRlUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICBtYXBwaW5nW2VxdWF0aW9uLm5hbWVdID0ge1xuICAgICAgICAgIHZhcmlhYmxlczogZXF1YXRpb24ucGFyYW1zLFxuICAgICAgICAgIGV4cHJlc3Npb246IGVxdWF0aW9uLmV4cHJlc3Npb25cbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAobWFwcGluZ1tlcXVhdGlvbi5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGV2YWx1YXRpb24gPSBlcXVhdGlvbi5leHByZXNzaW9uLmV2YWx1YXRlKG1hcHBpbmcpO1xuICAgICAgICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgICAgICBpZiAoZXZhbHVhdGlvbi5lcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiBldmFsdWF0aW9uLmVyciB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB3ZSBoYXZlIGEgdmFyaWFibGUgdGhhdCBoYXNuJ3QgeWV0IGJlZW4gbWFwcGVkIGFuZCBjYW4gYmVcbiAgICAgICAgICBtYWRlUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAgIG1hcHBpbmdbZXF1YXRpb24ubmFtZV0gPSBldmFsdWF0aW9uLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9IHdoaWxlIChtYWRlUHJvZ3Jlc3MpO1xuXG4gIHJldHVybiBjb21wdXRlRXhwcmVzc2lvbi5ldmFsdWF0ZShtYXBwaW5nKTtcbn07XG5cbi8qKlxuICogR2l2ZW4gYSBCbG9ja2x5IGJsb2NrLCBnZW5lcmF0ZXMgYW4gRXF1YXRpb24uXG4gKi9cbkVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrID0gZnVuY3Rpb24gKGJsb2NrKSB7XG4gIHZhciBuYW1lO1xuICBpZiAoIWJsb2NrKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGZpcnN0Q2hpbGQgPSBibG9jay5nZXRDaGlsZHJlbigpWzBdO1xuICBzd2l0Y2ggKGJsb2NrLnR5cGUpIHtcbiAgICBjYXNlICdmdW5jdGlvbmFsX2NvbXB1dGUnOlxuICAgICAgaWYgKCFmaXJzdENoaWxkKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sIG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGZpcnN0Q2hpbGQpO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9wbHVzJzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX21pbnVzJzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX3RpbWVzJzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX2RpdmlkZWRieSc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9wb3cnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfc3FydCc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9zcXVhcmVkJzpcbiAgICAgIHZhciBvcGVyYXRpb24gPSBibG9jay5nZXRUaXRsZXMoKVswXS5nZXRWYWx1ZSgpO1xuICAgICAgLy8gc29tZSBvZiB0aGVzZSBoYXZlIDEgYXJnLCBvdGhlcnMgMlxuICAgICAgdmFyIGFyZ05hbWVzID0gWydBUkcxJ107XG4gICAgICBpZiAoYmxvY2suZ2V0SW5wdXQoJ0FSRzInKSkge1xuICAgICAgICBhcmdOYW1lcy5wdXNoKCdBUkcyJyk7XG4gICAgICB9XG4gICAgICB2YXIgYXJncyA9IGFyZ05hbWVzLm1hcChmdW5jdGlvbihpbnB1dE5hbWUpIHtcbiAgICAgICAgdmFyIGFyZ0Jsb2NrID0gYmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhpbnB1dE5hbWUpO1xuICAgICAgICBpZiAoIWFyZ0Jsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGFyZ0Jsb2NrKS5leHByZXNzaW9uO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sIG5ldyBFeHByZXNzaW9uTm9kZShvcGVyYXRpb24sIGFyZ3MsIGJsb2NrLmlkKSk7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX21hdGhfbnVtYmVyX2Ryb3Bkb3duJzpcbiAgICAgIHZhciB2YWwgPSBibG9jay5nZXRUaXRsZVZhbHVlKCdOVU0nKSB8fCAwO1xuICAgICAgaWYgKHZhbCA9PT0gJz8/PycpIHtcbiAgICAgICAgdmFsID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sXG4gICAgICAgIG5ldyBFeHByZXNzaW9uTm9kZShwYXJzZUZsb2F0KHZhbCksIFtdLCBibG9jay5pZCkpO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9jYWxsJzpcbiAgICAgIG5hbWUgPSBibG9jay5nZXRDYWxsTmFtZSgpO1xuICAgICAgdmFyIGRlZiA9IEJsb2NrbHkuUHJvY2VkdXJlcy5nZXREZWZpbml0aW9uKG5hbWUsIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgICAgaWYgKGRlZi5pc1ZhcmlhYmxlKCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSwgbmV3IEV4cHJlc3Npb25Ob2RlKG5hbWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgdmFyIGlucHV0LCBjaGlsZEJsb2NrO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgISEoaW5wdXQgPSBibG9jay5nZXRJbnB1dCgnQVJHJyArIGkpKTsgaSsrKSB7XG4gICAgICAgICAgY2hpbGRCbG9jayA9IGlucHV0LmNvbm5lY3Rpb24udGFyZ2V0QmxvY2soKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChjaGlsZEJsb2NrID9cbiAgICAgICAgICAgIEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGNoaWxkQmxvY2spLmV4cHJlc3Npb24gOlxuICAgICAgICAgICAgbmV3IEV4cHJlc3Npb25Ob2RlKDApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLCBuZXcgRXhwcmVzc2lvbk5vZGUobmFtZSwgdmFsdWVzKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfZGVmaW5pdGlvbic6XG4gICAgICBuYW1lID0gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpO1xuXG4gICAgICB2YXIgZXhwcmVzc2lvbiA9IGZpcnN0Q2hpbGQgP1xuICAgICAgICBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhmaXJzdENoaWxkKS5leHByZXNzaW9uIDpcbiAgICAgICAgbmV3IEV4cHJlc3Npb25Ob2RlKDApO1xuXG4gICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG5hbWUsIGJsb2NrLmdldFZhcnMoKSwgZXhwcmVzc2lvbik7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX3BhcmFtZXRlcnNfZ2V0JzpcbiAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sIG5ldyBFeHByZXNzaW9uTm9kZShibG9jay5nZXRUaXRsZVZhbHVlKCdWQVInKSkpO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9leGFtcGxlJzpcbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IFwiVW5rbm93biBibG9jayB0eXBlOiBcIiArIGJsb2NrLnR5cGU7XG4gIH1cbn07XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBUb2tlbiA9IHJlcXVpcmUoJy4vdG9rZW4nKTtcbnZhciBqc251bXMgPSByZXF1aXJlKCcuL2pzLW51bWJlcnMvanMtbnVtYmVycycpO1xuXG52YXIgVmFsdWVUeXBlID0ge1xuICBBUklUSE1FVElDOiAxLFxuICBGVU5DVElPTl9DQUxMOiAyLFxuICBWQVJJQUJMRTogMyxcbiAgTlVNQkVSOiA0LFxuICBFWFBPTkVOVElBTDogNVxufTtcblxuZnVuY3Rpb24gRGl2aWRlQnlaZXJvRXJyb3IobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICcnO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIG51bWJlcnMgdG8ganNudW1iZXIgcmVwcmVzZW50YXRpb25zLiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIHNvbWVcbiAqIGpzbnVtYmVyIG1ldGhvZHMgd2lsbCByZXR1cm4gYSBudW1iZXIgb3IganNudW1iZXIgZGVwZW5kaW5nIG9uIHRoZWlyIHZhbHVlcyxcbiAqIGZvciBleGFtcGxlOlxuICoganNudW1zLnNxcnQoanNudW1zLm1ha2VGbG9hdCg0KS50b0V4YWN0KCkpID0gNFxuICoganNudW1zLnNxcnQoanNudW1zLm1ha2VGbG9hdCg1KS50b0V4YWN0KCkpID0ganNudW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfGpzbnVtYmVyfSB2YWxcbiAqIEByZXR1cm5zIHtqc251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZW5zdXJlSnNudW0odmFsKSB7XG4gIGlmICh0eXBlb2YodmFsKSA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4ganNudW1zLm1ha2VGbG9hdCh2YWwpO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogQSBub2RlIGNvbnNpc3Rpbmcgb2YgYW4gdmFsdWUsIGFuZCBwb3RlbnRpYWxseSBhIHNldCBvZiBvcGVyYW5kcy5cbiAqIFRoZSB2YWx1ZSB3aWxsIGJlIGVpdGhlciBhbiBvcGVyYXRvciwgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgdmFyaWFibGUsIGFcbiAqIHN0cmluZyByZXByZXNlbnRpbmcgYSBmdW5jdGlvbmFsIGNhbGwsIG9yIGEgbnVtYmVyLlxuICogSWYgYXJncyBhcmUgbm90IEV4cHJlc3Npb25Ob2RlLCB3ZSBjb252ZXJ0IHRoZW0gdG8gYmUgc28sIGFzc3VtaW5nIGFueSBzdHJpbmdcbiAqIHJlcHJlc2VudHMgYSB2YXJpYWJsZVxuICovXG52YXIgRXhwcmVzc2lvbk5vZGUgPSBmdW5jdGlvbiAodmFsLCBhcmdzLCBibG9ja0lkKSB7XG4gIHRoaXMudmFsdWVfID0gZW5zdXJlSnNudW0odmFsKTtcblxuICB0aGlzLmJsb2NrSWRfID0gYmxvY2tJZDtcbiAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MgPSBbXTtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIGFycmF5XCIpO1xuICB9XG5cbiAgdGhpcy5jaGlsZHJlbl8gPSBhcmdzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIGlmICghKGl0ZW0gaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZSkpIHtcbiAgICAgIGl0ZW0gPSBuZXcgRXhwcmVzc2lvbk5vZGUoaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xuICB9KTtcblxuICBpZiAodGhpcy5pc051bWJlcigpICYmIGFyZ3MubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGhhdmUgYXJncyBmb3IgbnVtYmVyIEV4cHJlc3Npb25Ob2RlXCIpO1xuICB9XG5cbiAgaWYgKHRoaXMuaXNBcml0aG1ldGljKCkgJiYgYXJncy5sZW5ndGggIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcml0aG1ldGljIEV4cHJlc3Npb25Ob2RlIG5lZWRzIDIgYXJnc1wiKTtcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gRXhwcmVzc2lvbk5vZGU7XG5FeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvciA9IERpdmlkZUJ5WmVyb0Vycm9yO1xuXG4vKipcbiAqIFdoYXQgdHlwZSBvZiBleHByZXNzaW9uIG5vZGUgaXMgdGhpcz9cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldFR5cGVfID0gZnVuY3Rpb24gKCkge1xuICBpZiAoW1wiK1wiLCBcIi1cIiwgXCIqXCIsIFwiL1wiXS5pbmRleE9mKHRoaXMudmFsdWVfKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gVmFsdWVUeXBlLkFSSVRITUVUSUM7XG4gIH1cblxuICBpZiAoW1wicG93XCIsIFwic3FydFwiLCBcInNxclwiXS5pbmRleE9mKHRoaXMudmFsdWVfKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gVmFsdWVUeXBlLkVYUE9ORU5USUFMO1xuICB9XG5cbiAgaWYgKHR5cGVvZih0aGlzLnZhbHVlXykgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFZhbHVlVHlwZS5WQVJJQUJMRTtcbiAgICB9XG4gICAgcmV0dXJuIFZhbHVlVHlwZS5GVU5DVElPTl9DQUxMO1xuICB9XG5cbiAgaWYgKGpzbnVtcy5pc1NjaGVtZU51bWJlcih0aGlzLnZhbHVlXykpIHtcbiAgICByZXR1cm4gVmFsdWVUeXBlLk5VTUJFUjtcbiAgfVxufTtcblxuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzQXJpdGhtZXRpYyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0VHlwZV8oKSA9PT0gVmFsdWVUeXBlLkFSSVRITUVUSUM7XG59O1xuXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNGdW5jdGlvbkNhbGwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFR5cGVfKCkgPT09IFZhbHVlVHlwZS5GVU5DVElPTl9DQUxMO1xufTtcblxuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzVmFyaWFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFR5cGVfKCkgPT09IFZhbHVlVHlwZS5WQVJJQUJMRTtcbn07XG5cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc051bWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0VHlwZV8oKSA9PT0gVmFsdWVUeXBlLk5VTUJFUjtcbn07XG5cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRUeXBlXygpID09PSBWYWx1ZVR5cGUuRVhQT05FTlRJQUw7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSByb290IGV4cHJlc3Npb24gbm9kZSBpcyBhIGRpdmlkZSBieSB6ZXJvLiBEb2VzXG4gKiAgIG5vdCBhY2NvdW50IGZvciBkaXYgemVyb3MgaW4gZGVzY2VuZGFudHNcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzRGl2WmVybyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJpZ2h0Q2hpbGQgPSB0aGlzLmdldENoaWxkVmFsdWUoMSk7XG4gIHJldHVybiB0aGlzLmdldFZhbHVlKCkgPT09ICcvJyAmJiBqc251bXMuaXNTY2hlbWVOdW1iZXIocmlnaHRDaGlsZCkgJiZcbiAgICBqc251bXMuZXF1YWxzKHJpZ2h0Q2hpbGQsIDApO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBkZWVwIGNsb25lIG9mIHRoaXMgbm9kZVxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5fLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gIH0pO1xuICByZXR1cm4gbmV3IEV4cHJlc3Npb25Ob2RlKHRoaXMudmFsdWVfLCBjaGlsZHJlbiwgdGhpcy5ibG9ja0lkXyk7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSBleHByZXNzaW9uLCByZXR1cm5pbmcgdGhlIHJlc3VsdC5cbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgbnVtYmVyfG9iamVjdD59IGdsb2JhbE1hcHBpbmcgR2xvYmFsIG1hcHBpbmcgb2ZcbiAqICAgdmFyaWFibGVzIGFuZCBmdW5jdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgbnVtYmVyfG9iamVjdD59IGxvY2FsTWFwcGluZyBNYXBwaW5nIG9mXG4gKiAgIHZhcmlhYmxlcy9mdW5jdGlvbnMgbG9jYWwgdG8gc2NvcGUgb2YgdGhpcyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IGV2YWx1YXRpb24gQW4gb2JqZWN0IHdpdGggZWl0aGVyIGFuIGVyciBvciByZXN1bHQgZmllbGRcbiAqIEByZXR1cm5zIHtFcnJvcj99IGV2YWxhdHVpb24uZXJyXG4gKiBAcmV0dXJucyB7anNudW1iZXI/fSBldmFsdWF0aW9uLnJlc3VsdFxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiAoZ2xvYmFsTWFwcGluZywgbG9jYWxNYXBwaW5nKSB7XG4gIHZhciBlcnJvcjtcbiAgdHJ5IHtcbiAgICBnbG9iYWxNYXBwaW5nID0gZ2xvYmFsTWFwcGluZyB8fCB7fTtcbiAgICBsb2NhbE1hcHBpbmcgPSBsb2NhbE1hcHBpbmcgfHwge307XG5cbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0VHlwZV8oKTtcbiAgICAvLyBAdHlwZSB7bnVtYmVyfGpzbnVtYmVyfVxuICAgIHZhciB2YWw7XG5cbiAgICBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLlZBUklBQkxFKSB7XG4gICAgICB2YXIgbWFwcGVkVmFsID0gdXRpbHMudmFsdWVPcihsb2NhbE1hcHBpbmdbdGhpcy52YWx1ZV9dLFxuICAgICAgICBnbG9iYWxNYXBwaW5nW3RoaXMudmFsdWVfXSk7XG4gICAgICBpZiAobWFwcGVkVmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBtYXBwaW5nIGZvciB2YXJpYWJsZSBkdXJpbmcgZXZhbHVhdGlvbicpO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lKCk7XG4gICAgICBjbG9uZS5zZXRWYWx1ZShtYXBwZWRWYWwpO1xuICAgICAgcmV0dXJuIGNsb25lLmV2YWx1YXRlKGdsb2JhbE1hcHBpbmcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuRlVOQ1RJT05fQ0FMTCkge1xuICAgICAgdmFyIGZ1bmN0aW9uRGVmID0gdXRpbHMudmFsdWVPcihsb2NhbE1hcHBpbmdbdGhpcy52YWx1ZV9dLFxuICAgICAgICBnbG9iYWxNYXBwaW5nW3RoaXMudmFsdWVfXSk7XG4gICAgICBpZiAoZnVuY3Rpb25EZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG1hcHBpbmcgZm9yIGZ1bmN0aW9uIGR1cmluZyBldmFsdWF0aW9uJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZnVuY3Rpb25EZWYudmFyaWFibGVzIHx8ICFmdW5jdGlvbkRlZi5leHByZXNzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQmFkIG1hcHBpbmcgZm9yOiAnICsgdGhpcy52YWx1ZV8pO1xuICAgICAgfVxuICAgICAgaWYgKGZ1bmN0aW9uRGVmLnZhcmlhYmxlcy5sZW5ndGggIT09IHRoaXMuY2hpbGRyZW5fLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBtYXBwaW5nIGZvcjogJyArIHRoaXMudmFsdWVfKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UncmUgY2FsbGluZyBhIG5ldyBmdW5jdGlvbiwgc28gaXQgZ2V0cyBhIG5ldyBsb2NhbCBzY29wZS5cbiAgICAgIHZhciBuZXdMb2NhbE1hcHBpbmcgPSB7fTtcbiAgICAgIGZ1bmN0aW9uRGVmLnZhcmlhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YXJpYWJsZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGV2YWx1YXRpb24gPSB0aGlzLmNoaWxkcmVuX1tpbmRleF0uZXZhbHVhdGUoZ2xvYmFsTWFwcGluZywgbG9jYWxNYXBwaW5nKTtcbiAgICAgICAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgICAgICAgdGhyb3cgZXZhbHVhdGlvbi5lcnI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkVmFsID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG4gICAgICAgIG5ld0xvY2FsTWFwcGluZ1t2YXJpYWJsZV0gPSB1dGlscy52YWx1ZU9yKGxvY2FsTWFwcGluZ1tjaGlsZFZhbF0sIGNoaWxkVmFsKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uRGVmLmV4cHJlc3Npb24uZXZhbHVhdGUoZ2xvYmFsTWFwcGluZywgbmV3TG9jYWxNYXBwaW5nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLk5VTUJFUikge1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiB0aGlzLnZhbHVlXyB9O1xuICAgIH1cblxuICAgIGlmICh0eXBlICE9PSBWYWx1ZVR5cGUuQVJJVEhNRVRJQyAmJiB0eXBlICE9PSBWYWx1ZVR5cGUuRVhQT05FTlRJQUwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCcpO1xuICAgIH1cblxuICAgIHZhciBsZWZ0ID0gdGhpcy5jaGlsZHJlbl9bMF0uZXZhbHVhdGUoZ2xvYmFsTWFwcGluZywgbG9jYWxNYXBwaW5nKTtcbiAgICBpZiAobGVmdC5lcnIpIHtcbiAgICAgIHRocm93IGxlZnQuZXJyO1xuICAgIH1cbiAgICBsZWZ0ID0gbGVmdC5yZXN1bHQudG9FeGFjdCgpO1xuXG4gICAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMSkge1xuICAgICAgc3dpdGNoICh0aGlzLnZhbHVlXykge1xuICAgICAgICBjYXNlICdzcXJ0JzpcbiAgICAgICAgICB2YWwgPSBqc251bXMuc3FydChsZWZ0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3FyJzpcbiAgICAgICAgICB2YWwgPSBqc251bXMuc3FyKGxlZnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvcGVyYXRvcjogJyArIHRoaXMudmFsdWVfKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHJlc3VsdDogZW5zdXJlSnNudW0odmFsKSB9O1xuICAgIH1cblxuICAgIHZhciByaWdodCA9IHRoaXMuY2hpbGRyZW5fWzFdLmV2YWx1YXRlKGdsb2JhbE1hcHBpbmcsIGxvY2FsTWFwcGluZyk7XG4gICAgaWYgKHJpZ2h0LmVycikge1xuICAgICAgdGhyb3cgcmlnaHQuZXJyO1xuICAgIH1cbiAgICByaWdodCA9IHJpZ2h0LnJlc3VsdC50b0V4YWN0KCk7XG5cbiAgICBzd2l0Y2ggKHRoaXMudmFsdWVfKSB7XG4gICAgICBjYXNlICcrJzpcbiAgICAgICAgdmFsID0ganNudW1zLmFkZChsZWZ0LCByaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLSc6XG4gICAgICAgIHZhbCA9IGpzbnVtcy5zdWJ0cmFjdChsZWZ0LCByaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnKic6XG4gICAgICAgIHZhbCA9IGpzbnVtcy5tdWx0aXBseShsZWZ0LCByaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIGlmIChqc251bXMuZXF1YWxzKHJpZ2h0LCAwKSkge1xuICAgICAgICAgIHRocm93IG5ldyBEaXZpZGVCeVplcm9FcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHZhbCA9IGpzbnVtcy5kaXZpZGUobGVmdCwgcmlnaHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bvdyc6XG4gICAgICAgIHZhbCA9IGpzbnVtcy5leHB0KGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gb3BlcmF0b3I6ICcgKyB0aGlzLnZhbHVlXyk7XG4gICAgfVxuICAgIC8vIFdoZW4gY2FsbGluZyBqc251bXMgbWV0aG9kcywgdGhleSB3aWxsIHNvbWV0aW1lcyByZXR1cm4gYSBqc251bWJlciBhbmRcbiAgICAvLyBzb21ldGltZXMgYSBuYXRpdmUgSmF2YVNjcmlwdCBudW1iZXIuIFdlIHdhbnQgdG8gbWFrZSBzdXJlIHRvIGNvbnZlcnRcbiAgICAvLyB0byBhIGpzbnVtYmVyIGJlZm9yZSB3ZSByZXR1cm4uXG4gICAgcmV0dXJuIHsgcmVzdWx0OiBlbnN1cmVKc251bSh2YWwpIH07XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGVycm9yID0gZXJyO1xuICB9XG4gIHJldHVybiB7IGVycjogZXJyb3IgfTtcbn07XG5cbi8qKlxuICogRGVwdGggb2YgdGhpcyBub2RlJ3MgdHJlZS4gQSBsb25lIHZhbHVlIGlzIGNvbnNpZGVyZWQgdG8gaGF2ZSBhIGRlcHRoIG9mIDAuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5kZXB0aCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1heCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbl8ubGVuZ3RoOyBpKyspIHtcbiAgICBtYXggPSBNYXRoLm1heChtYXgsIDEgKyB0aGlzLmNoaWxkcmVuX1tpXS5kZXB0aCgpKTtcbiAgfVxuXG4gIHJldHVybiBtYXg7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGRlZXBlc3QgZGVzY2VuZGFudCBvcGVyYXRpb24gRXhwcmVzc2lvbk5vZGUgaW4gdGhlIHRyZWUgKGkuZS4gdGhlXG4gKiBuZXh0IG5vZGUgdG8gY29sbGFwc2VcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldERlZXBlc3RPcGVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBkZWVwZXN0Q2hpbGQgPSBudWxsO1xuICB2YXIgZGVlcGVzdERlcHRoID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXB0aCA9IHRoaXMuY2hpbGRyZW5fW2ldLmRlcHRoKCk7XG4gICAgaWYgKGRlcHRoID4gZGVlcGVzdERlcHRoKSB7XG4gICAgICBkZWVwZXN0RGVwdGggPSBkZXB0aDtcbiAgICAgIGRlZXBlc3RDaGlsZCA9IHRoaXMuY2hpbGRyZW5fW2ldO1xuICAgIH1cbiAgfVxuXG4gIGlmIChkZWVwZXN0RGVwdGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJldHVybiBkZWVwZXN0Q2hpbGQuZ2V0RGVlcGVzdE9wZXJhdGlvbigpO1xufTtcblxuLyoqXG4gKiBDb2xsYXBzZXMgdGhlIG5leHQgZGVzY2VuZGFudCBpbiBwbGFjZS4gTmV4dCBpcyBkZWZpbmVkIGFzIGRlZXBlc3QsIHRoZW5cbiAqIGZ1cnRoZXN0IGxlZnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhfSB0cnVlIGlmIGNvbGxhcHNlIHdhcyBzdWNjZXNzZnVsLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuY29sbGFwc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBkZWVwZXN0ID0gdGhpcy5nZXREZWVwZXN0T3BlcmF0aW9uKCk7XG4gIGlmIChkZWVwZXN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gV2UncmUgdGhlIGRlcGVzdCBvcGVyYXRpb24sIGltcGx5aW5nIGJvdGggc2lkZXMgYXJlIG51bWJlcnNcbiAgaWYgKHRoaXMgPT09IGRlZXBlc3QpIHtcbiAgICB2YXIgZXZhbHVhdGlvbiA9IHRoaXMuZXZhbHVhdGUoKTtcbiAgICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy52YWx1ZV8gPSBldmFsdWF0aW9uLnJlc3VsdDtcbiAgICB0aGlzLmNoaWxkcmVuXyA9IFtdO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBkZWVwZXN0LmNvbGxhcHNlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IGEgdG9rZW5MaXN0IGZvciB0aGlzIGV4cHJlc3Npb24sIHdoZXJlIGRpZmZlcmVuY2VzIGZyb20gb3RoZXIgZXhwcmVzc2lvblxuICogYXJlIG1hcmtlZFxuICogQHBhcmFtIHtFeHByZXNzaW9uTm9kZX0gb3RoZXIgVGhlIEV4cHJlc3Npb25Ob2RlIHRvIGNvbXBhcmUgdG8uXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXRUb2tlbkxpc3REaWZmID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIHZhciB0b2tlbnM7XG4gIHZhciBub2Rlc01hdGNoID0gb3RoZXIgJiYgdGhpcy5oYXNTYW1lVmFsdWVfKG90aGVyKSAmJlxuICAgICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IG90aGVyLmNoaWxkcmVuXy5sZW5ndGgpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0VHlwZV8oKTtcblxuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtuZXcgVG9rZW4odGhpcy52YWx1ZV8sICFub2Rlc01hdGNoKV07XG4gIH1cblxuICB2YXIgdG9rZW5zRm9yQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRJbmRleCkge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuX1tjaGlsZEluZGV4XS5nZXRUb2tlbkxpc3REaWZmKG5vZGVzTWF0Y2ggJiZcbiAgICAgIG90aGVyLmNoaWxkcmVuX1tjaGlsZEluZGV4XSk7XG4gIH0uYmluZCh0aGlzKTtcblxuICBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkFSSVRITUVUSUMpIHtcbiAgICAvLyBEZWFsIHdpdGggYXJpdGhtZXRpYywgd2hpY2ggaXMgYWx3YXlzIGluIHRoZSBmb3JtIChjaGlsZDAgb3BlcmF0b3IgY2hpbGQxKVxuICAgIHRva2VucyA9IFtuZXcgVG9rZW4oJygnLCAhbm9kZXNNYXRjaCldO1xuICAgIHRva2Vucy5wdXNoKFtcbiAgICAgIHRva2Vuc0ZvckNoaWxkKDApLFxuICAgICAgbmV3IFRva2VuKFwiIFwiICsgdGhpcy52YWx1ZV8gKyBcIiBcIiwgIW5vZGVzTWF0Y2gpLFxuICAgICAgdG9rZW5zRm9yQ2hpbGQoMSlcbiAgICBdKTtcbiAgICB0b2tlbnMucHVzaChuZXcgVG9rZW4oJyknLCAhbm9kZXNNYXRjaCkpO1xuXG4gICAgcmV0dXJuIF8uZmxhdHRlbih0b2tlbnMpO1xuICB9XG5cbiAgaWYgKHRoaXMudmFsdWVfID09PSAnc3FyJykge1xuICAgIHJldHVybiBfLmZsYXR0ZW4oW1xuICAgICAgbmV3IFRva2VuKCcoJywgIW5vZGVzTWF0Y2gpLFxuICAgICAgdG9rZW5zRm9yQ2hpbGQoMCksXG4gICAgICBuZXcgVG9rZW4oJyBeIDInLCAhbm9kZXNNYXRjaCksXG4gICAgICBuZXcgVG9rZW4oJyknLCAhbm9kZXNNYXRjaClcbiAgICBdKTtcbiAgfSBlbHNlIGlmICh0aGlzLnZhbHVlXyA9PT0gJ3BvdycpIHtcbiAgICByZXR1cm4gXy5mbGF0dGVuKFtcbiAgICAgIG5ldyBUb2tlbignKCcsICFub2Rlc01hdGNoKSxcbiAgICAgIHRva2Vuc0ZvckNoaWxkKDApLFxuICAgICAgbmV3IFRva2VuKCcgXiAnLCAhbm9kZXNNYXRjaCksXG4gICAgICB0b2tlbnNGb3JDaGlsZCgxKSxcbiAgICAgIG5ldyBUb2tlbignKScsICFub2Rlc01hdGNoKVxuICAgIF0pO1xuICB9XG5cbiAgLy8gV2UgZWl0aGVyIGhhdmUgYSBmdW5jdGlvbiBjYWxsLCBvciBhbiBhcml0aG1ldGljIG5vZGUgdGhhdCB3ZSB3YW50IHRvXG4gIC8vIHRyZWF0IGxpa2UgYSBmdW5jdGlvbiAoaS5lLiBzcXJ0KDQpKVxuICAvLyBBIGZ1bmN0aW9uIGNhbGwgd2lsbCBnZW5lcmF0ZSBzb21ldGhpbmcgbGlrZTogZm9vKDEsIDIsIDMpXG4gIHRva2VucyA9IFtcbiAgICBuZXcgVG9rZW4odGhpcy52YWx1ZV8sIG90aGVyICYmIHRoaXMudmFsdWVfICE9PSBvdGhlci52YWx1ZV8pLFxuICAgIG5ldyBUb2tlbignKCcsICFub2Rlc01hdGNoKVxuICBdO1xuXG4gIHZhciBudW1DaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW5fLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1DaGlsZHJlbjsgaSsrKSB7XG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICB0b2tlbnMucHVzaChuZXcgVG9rZW4oJywnLCAhbm9kZXNNYXRjaCkpO1xuICAgIH1cbiAgICB2YXIgY2hpbGRUb2tlbnMgPSB0b2tlbnNGb3JDaGlsZChpKTtcbiAgICBpZiAobnVtQ2hpbGRyZW4gPT09IDEpIHtcbiAgICAgIEV4cHJlc3Npb25Ob2RlLnN0cmlwT3V0ZXJQYXJlbnNGcm9tVG9rZW5MaXN0KGNoaWxkVG9rZW5zKTtcbiAgICB9XG4gICAgdG9rZW5zLnB1c2goY2hpbGRUb2tlbnMpO1xuICB9XG5cbiAgdG9rZW5zLnB1c2gobmV3IFRva2VuKFwiKVwiLCAhbm9kZXNNYXRjaCkpO1xuICByZXR1cm4gXy5mbGF0dGVuKHRva2Vucyk7XG59O1xuXG4vKipcbiAqIEdldCBhIHRva2VuTGlzdCBmb3IgdGhpcyBleHByZXNzaW9uLCBwb3RlbnRpYWxseSBtYXJraW5nIHRob3NlIHRva2Vuc1xuICogdGhhdCBhcmUgaW4gdGhlIGRlZXBlc3QgZGVzY2VuZGFudCBleHByZXNzaW9uLlxuICogQHBhcmFtIHtib29sZWFufSBtYXJrRGVlcGVzdCBNYXJrIHRva2VucyBpbiB0aGUgZGVlcGVzdCBkZXNjZW5kYW50XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXRUb2tlbkxpc3QgPSBmdW5jdGlvbiAobWFya0RlZXBlc3QpIHtcbiAgaWYgKCFtYXJrRGVlcGVzdCkge1xuICAgIC8vIGRpZmYgYWdhaW5zdCB0aGlzIHNvIHRoYXQgbm90aGluZyBpcyBtYXJrZWRcbiAgICByZXR1cm4gdGhpcy5nZXRUb2tlbkxpc3REaWZmKHRoaXMpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVwdGgoKSA8PSAxKSB7XG4gICAgLy8gbWFya0RlZXBlc3QgaXMgdHJ1ZS4gZGlmZiBhZ2FpbnN0IG51bGwgc28gdGhhdCBldmVyeXRoaW5nIGlzIG1hcmtlZFxuICAgIHJldHVybiB0aGlzLmdldFRva2VuTGlzdERpZmYobnVsbCk7XG4gIH1cblxuICBpZiAodGhpcy5nZXRUeXBlXygpICE9PSBWYWx1ZVR5cGUuQVJJVEhNRVRJQyAmJlxuICAgICAgdGhpcy5nZXRUeXBlXygpICE9PSBWYWx1ZVR5cGUuRVhQT05FTlRJQUwpIHtcbiAgICAvLyBEb24ndCBzdXBwb3J0IGdldFRva2VuTGlzdCBmb3IgZnVuY3Rpb25zXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWRcIik7XG4gIH1cblxuICB2YXIgcmlnaHREZWVwZXIgPSBmYWxzZTtcbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMikge1xuICAgIHJpZ2h0RGVlcGVyID0gdGhpcy5jaGlsZHJlbl9bMV0uZGVwdGgoKSA+IHRoaXMuY2hpbGRyZW5fWzBdLmRlcHRoKCk7XG4gIH1cblxuICB2YXIgcHJlZml4ID0gbmV3IFRva2VuKCcoJywgZmFsc2UpO1xuICB2YXIgc3VmZml4ID0gbmV3IFRva2VuKCcpJywgZmFsc2UpO1xuXG4gIGlmICh0aGlzLnZhbHVlXyA9PT0gJ3NxcnQnKSB7XG4gICAgcHJlZml4ID0gbmV3IFRva2VuKCdzcXJ0JywgZmFsc2UpO1xuICAgIHN1ZmZpeCA9IG51bGw7XG4gIH1cblxuICB2YXIgdG9rZW5zID0gW1xuICAgIHByZWZpeCxcbiAgICB0aGlzLmNoaWxkcmVuX1swXS5nZXRUb2tlbkxpc3QobWFya0RlZXBlc3QgJiYgIXJpZ2h0RGVlcGVyKSxcbiAgXTtcbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA+IDEpIHtcbiAgICB0b2tlbnMucHVzaChbXG4gICAgICBuZXcgVG9rZW4oXCIgXCIgKyB0aGlzLnZhbHVlXyArIFwiIFwiLCBmYWxzZSksXG4gICAgICB0aGlzLmNoaWxkcmVuX1sxXS5nZXRUb2tlbkxpc3QobWFya0RlZXBlc3QgJiYgcmlnaHREZWVwZXIpXG4gICAgXSk7XG4gIH1cbiAgaWYgKHN1ZmZpeCkge1xuICAgIHRva2Vucy5wdXNoKHN1ZmZpeCk7XG4gIH1cbiAgcmV0dXJuIF8uZmxhdHRlbih0b2tlbnMpO1xufTtcblxuLyoqXG4gKiBMb29rcyB0byBzZWUgaWYgdHdvIG5vZGVzIGhhdmUgdGhlIHNhbWUgdmFsdWUsIHVzaW5nIGpzbnVtLmVxdWFscyBpbiB0aGVcbiAqIGNhc2Ugb2YgbnVtYmVyc1xuICogQHBhcmFtIHtFeHByZXNzaW9uTm9kZX0gb3RoZXIgRXhwcmVzaXNvbk5vZGUgdG8gY29tcGFyZSB0b1xuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYm90aCBub2RlcyBoYXZlIHRoZSBzYW1lIHZhbHVlLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaGFzU2FtZVZhbHVlXyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICBpZiAoIW90aGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuaXNOdW1iZXIoKSkge1xuICAgIHJldHVybiBqc251bXMuZXF1YWxzKHRoaXMudmFsdWVfLCBvdGhlci52YWx1ZV8pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMudmFsdWVfID09PSBvdGhlci52YWx1ZV87XG59O1xuXG4vKipcbiAqIElzIG90aGVyIGV4YWN0bHkgdGhlIHNhbWUgYXMgdGhpcyBFeHByZXNzaW9uTm9kZSB0cmVlLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNJZGVudGljYWxUbyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICBpZiAoIW90aGVyIHx8ICF0aGlzLmhhc1NhbWVWYWx1ZV8ob3RoZXIpIHx8IHRoaXMuY2hpbGRyZW5fLmxlbmd0aCAhPT0gb3RoZXIuY2hpbGRyZW5fLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbl8ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRoaXMuY2hpbGRyZW5fW2ldLmlzSWRlbnRpY2FsVG8ob3RoZXIuY2hpbGRyZW5fW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGJvdGggdGhpcyBhbmQgb3RoZXIgYXJlIGNhbGxzIG9mIHRoZSBzYW1lIGZ1bmN0aW9uLCB3aXRoXG4gKiB0aGUgc2FtZSBudW1iZXIgb2YgYXJndW1lbnRzXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5oYXNTYW1lU2lnbmF0dXJlID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGlmICghb3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5nZXRUeXBlXygpICE9PSBWYWx1ZVR5cGUuRlVOQ1RJT05fQ0FMTCB8fFxuICAgICAgb3RoZXIuZ2V0VHlwZV8oKSAhPT0gVmFsdWVUeXBlLkZVTkNUSU9OX0NBTEwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy52YWx1ZV8gIT09IG90aGVyLnZhbHVlXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggIT09IG90aGVyLmNoaWxkcmVuXy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogRG8gdGhlIHR3byBub2RlcyBkaWZmZXIgb25seSBpbiBhcmd1bWVudCBvcmRlci5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzRXF1aXZhbGVudFRvID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIC8vIG9ubHkgaWdub3JlIGFyZ3VtZW50IG9yZGVyIGZvciBBUklUSE1FVElDXG4gIGlmICh0aGlzLmdldFR5cGVfKCkgIT09IFZhbHVlVHlwZS5BUklUSE1FVElDKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNJZGVudGljYWxUbyhvdGhlcik7XG4gIH1cblxuICBpZiAoIW90aGVyIHx8IHRoaXMudmFsdWVfICE9PSBvdGhlci52YWx1ZV8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgbXlMZWZ0ID0gdGhpcy5jaGlsZHJlbl9bMF07XG4gIHZhciBteVJpZ2h0ID0gdGhpcy5jaGlsZHJlbl9bMV07XG5cbiAgdmFyIHRoZWlyTGVmdCA9IG90aGVyLmNoaWxkcmVuX1swXTtcbiAgdmFyIHRoZWlyUmlnaHQgPSBvdGhlci5jaGlsZHJlbl9bMV07XG5cbiAgaWYgKG15TGVmdC5pc0VxdWl2YWxlbnRUbyh0aGVpckxlZnQpKSB7XG4gICAgcmV0dXJuIG15UmlnaHQuaXNFcXVpdmFsZW50VG8odGhlaXJSaWdodCk7XG4gIH1cbiAgaWYgKG15TGVmdC5pc0VxdWl2YWxlbnRUbyh0aGVpclJpZ2h0KSkge1xuICAgIHJldHVybiBteVJpZ2h0LmlzRXF1aXZhbGVudFRvKHRoZWlyTGVmdCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBIb3cgbWFueSBjaGlsZHJlbiB0aGlzIG5vZGUgaGFzXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5udW1DaGlsZHJlbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY2hpbGRyZW5fLmxlbmd0aDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ30gU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbm9kZSdzIHZhbHVlLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnZhbHVlXy50b1N0cmluZygpO1xufTtcblxuXG4vKipcbiAqIE1vZGlmeSB0aGlzIEV4cHJlc3Npb25Ob2RlJ3MgdmFsdWVcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRUeXBlXygpO1xuICBpZiAodHlwZSAhPT0gVmFsdWVUeXBlLlZBUklBQkxFICYmIHR5cGUgIT09IFZhbHVlVHlwZS5OVU1CRVIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBtb2RpZnkgdmFsdWVcIik7XG4gIH1cbiAgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5OVU1CRVIpIHtcbiAgICB0aGlzLnZhbHVlXyA9IGVuc3VyZUpzbnVtKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnZhbHVlXyA9IHZhbHVlO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdmFsdWUgb2YgdGhlIGNoaWxkIGF0IGluZGV4XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXRDaGlsZFZhbHVlID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIGlmICh0aGlzLmNoaWxkcmVuX1tpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY2hpbGRyZW5fW2luZGV4XS52YWx1ZV87XG59O1xuXG4vKipcbiAqIFNldCB0aGUgdmFsdWUgb2YgdGhlIGNoaWxkIGF0IGluZGV4XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5zZXRDaGlsZFZhbHVlID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5jaGlsZHJlbl9baW5kZXhdLnNldFZhbHVlKHZhbHVlKTtcbn07XG5cbi8qKlxuICogR2V0IGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmVlXG4gKiBOb3RlOiBUaGlzIGlzIG9ubHkgdXNlZCBieSB0ZXN0IGNvZGUsIGJ1dCBpcyBhbHNvIGdlbmVyYWxseSB1c2VmdWwgdG8gZGVidWdcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5kZWJ1ZyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmICh0aGlzLmlzTnVtYmVyKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlXy50b0ZpeG51bSgpLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlXy50b1N0cmluZygpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gXCIoXCIgKyB0aGlzLnZhbHVlXyArIFwiIFwiICtcbiAgICB0aGlzLmNoaWxkcmVuXy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBjLmRlYnVnKCk7XG4gICAgfSkuam9pbignICcpICsgXCIpXCI7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgdG9rZW4gbGlzdCwgaWYgdGhlIGZpcnN0IGFuZCBsYXN0IGl0ZW1zIGFyZSBwYXJlbnMsIHJlbW92ZXMgdGhlbVxuICogZnJvbSB0aGUgbGlzdFxuICovXG5FeHByZXNzaW9uTm9kZS5zdHJpcE91dGVyUGFyZW5zRnJvbVRva2VuTGlzdCA9IGZ1bmN0aW9uICh0b2tlbkxpc3QpIHtcbiAgaWYgKHRva2VuTGlzdC5sZW5ndGggPj0gMiAmJiB0b2tlbkxpc3RbMF0uaXNQYXJlbnRoZXNpcygpICYmXG4gICAgICB0b2tlbkxpc3RbdG9rZW5MaXN0Lmxlbmd0aCAtIDFdLmlzUGFyZW50aGVzaXMoKSkge1xuICAgIHRva2VuTGlzdC5zcGxpY2UoLTEpO1xuICAgIHRva2VuTGlzdC5zcGxpY2UoMCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRva2VuTGlzdDtcbn07XG4iLCJ2YXIganNudW1zID0gcmVxdWlyZSgnLi9qcy1udW1iZXJzL2pzLW51bWJlcnMnKTtcblxuLy8gVW5pY29kZSBjaGFyYWN0ZXIgZm9yIG5vbi1icmVha2luZyBzcGFjZVxudmFyIE5CU1AgPSAnXFx1MDBBMCc7XG5cbi8qKlxuICogQSB0b2tlbiBpcyBhIHZhbHVlLCBhbmQgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgaXQgaXMgXCJtYXJrZWRcIi5cbiAqIE1hcmtpbmcgaXMgZG9uZSBmb3IgdHdvIGRpZmZlcmVudCByZWFzb25zLlxuICogKDEpIFdlJ3JlIGNvbXBhcmluZyB0d28gZXhwcmVzc2lvbnMgYW5kIHdhbnQgdG8gbWFyayB3aGVyZSB0aGV5IGRpZmZlci5cbiAqICgyKSBXZSdyZSBsb29raW5nIGF0IGEgc2luZ2xlIGV4cHJlc3Npb24gYW5kIHdhbnQgdG8gbWFyayB0aGUgZGVlcGVzdFxuICogICAgIHN1YmV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge3N0cmluZ3xqc251bWJlcn0gdmFsXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG1hcmtlZFxuICovXG52YXIgVG9rZW4gPSBmdW5jdGlvbiAodmFsLCBtYXJrZWQpIHtcbiAgdGhpcy52YWxfID0gdmFsO1xuICB0aGlzLm1hcmtlZF8gPSBtYXJrZWQ7XG5cbiAgLy8gU3RvcmUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHZhbHVlLiBJbiBtb3N0IGNhc2VzIHRoaXMgaXMganVzdCBhXG4gIC8vIG5vbiByZXBlYXRlZCBwb3J0aW9uLiBJbiB0aGUgY2FzZSBvZiBzb21ldGhpbmcgbGlrZSAxLzkgdGhlcmUgd2lsbCBiZSBib3RoXG4gIC8vIGEgbm9uIHJlcGVhdGVkIHBvcnRpb24gXCIwLlwiIGFuZCBhIHJlcGVhdGVkIHBvcnRpb24gXCIxXCIgLSBpLmUuIDAuMTExMTExMS4uLlxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgdGhpcy5ub25SZXBlYXRlZF8gPSBudWxsO1xuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgdGhpcy5yZXBlYXRlZF8gPSBudWxsO1xuICB0aGlzLnNldFN0cmluZ1JlcHJlc2VudGF0aW9uXygpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gVG9rZW47XG5cblRva2VuLnByb3RvdHlwZS5pc1BhcmVudGhlc2lzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy52YWxfID09PSAnKCcgfHwgdGhpcy52YWxfID09PSAnKSc7XG59O1xuXG4vKipcbiAqIEFkZCB0aGUgZ2l2ZW4gdG9rZW4gdG8gdGhlIHBhcmVudCBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBQYXJlbnQgZWxlbWVudCB0byBhZGQgdG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB4UG9zIFggcG9zaXRpb24gdG8gcGxhY2UgZWxlbWVudCBhdFxuICogQHBhcmFtIHtzdHJpbmc/fSBtYXJrQ2xhc3MgQ2xhc3MgbmFtZSB0byB1c2UgaWYgdG9rZW4gaXMgbWFya2VkXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbGVuZ3RoIG9mIHRoZSBhZGRlZCB0ZXh0IGVsZW1lbnRcbiAqL1xuVG9rZW4ucHJvdG90eXBlLnJlbmRlclRvUGFyZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIHhQb3MsIG1hcmtDbGFzcykge1xuICB2YXIgdGV4dCwgdGV4dExlbmd0aDtcblxuICB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndGV4dCcpO1xuXG4gIHZhciB0c3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RzcGFuJyk7XG4gIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggMnggbm9uYnJlYWtpbmcgc3BhY2VcbiAgdHNwYW4udGV4dENvbnRlbnQgPSB0aGlzLm5vblJlcGVhdGVkXy5yZXBsYWNlKC8gL2csIE5CU1AgKyBOQlNQKTtcbiAgdGV4dC5hcHBlbmRDaGlsZCh0c3Bhbik7XG5cbiAgaWYgKHRoaXMucmVwZWF0ZWRfKSB7XG4gICAgdHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICd0c3BhbicpO1xuICAgIHRzcGFuLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAndGV4dC1kZWNvcmF0aW9uOiBvdmVybGluZScpO1xuICAgIC8vIFJlcGxhY2Ugc3BhY2VzIHdpdGggMnggbm9uYnJlYWtpbmcgc3BhY2VcbiAgICB0c3Bhbi50ZXh0Q29udGVudCA9IHRoaXMucmVwZWF0ZWRfLnJlcGxhY2UoLyAvZywgTkJTUCArIE5CU1ApO1xuICAgIHRleHQuYXBwZW5kQ2hpbGQodHNwYW4pO1xuICB9XG5cbiAgZWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0KTtcblxuICAvLyBGRiBkb2VzbnQgaGF2ZSBvZmZzZXRXaWR0aFxuICAvLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgdW5kZXJjYWxjdWxhdGVzIHdpZHRoIG9uIGlQYWRcbiAgaWYgKHRleHQub2Zmc2V0V2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgIHRleHRMZW5ndGggPSB0ZXh0Lm9mZnNldFdpZHRoO1xuICB9IGVsc2Uge1xuICAgIHRleHRMZW5ndGggPSB0ZXh0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICB9XG5cbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3gnLCB4UG9zKTtcbiAgaWYgKHRoaXMubWFya2VkXyAmJiBtYXJrQ2xhc3MpIHtcbiAgICB0ZXh0LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBtYXJrQ2xhc3MpO1xuICB9XG5cbiAgcmV0dXJuIHRleHRMZW5ndGg7XG59O1xuXG4vKipcbiAqIFNldHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHZhbHVlLlxuICovXG5Ub2tlbi5wcm90b3R5cGUuc2V0U3RyaW5nUmVwcmVzZW50YXRpb25fID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIWpzbnVtcy5pc1NjaGVtZU51bWJlcih0aGlzLnZhbF8pIHx8IHR5cGVvZih0aGlzLnZhbF8pID09PSAnbnVtYmVyJykge1xuICAgIHRoaXMubm9uUmVwZWF0ZWRfID0gdGhpcy52YWxfO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGF0IHRoaXMgcG9pbnQgd2Uga25vdyB3ZSBoYXZlIGEganNudW1iZXJcbiAgaWYgKHRoaXMudmFsXy5pc0ludGVnZXIoKSkge1xuICAgIHRoaXMubm9uUmVwZWF0ZWRfID0gVG9rZW4ubnVtYmVyV2l0aENvbW1hc18odGhpcy52YWxfLnRvRml4bnVtKCkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEdpdmVzIHVzIHRocmVlIHZhbHVlczogTnVtYmVyIGJlZm9yZSBkZWNpbWFsLCBub24tcmVwZWF0aW5nIHBvcnRpb24sXG4gIC8vIHJlcGVhdGluZyBwb3J0aW9uLiBJZiB3ZSBkb24ndCBoYXZlIHRoZSBsYXN0IGJpdCwgdGhlcmUncyBubyByZXBpdGl0aW9uLlxuICB2YXIgbnVtZXJhdG9yID0ganNudW1zLnRvRXhhY3QodGhpcy52YWxfLm51bWVyYXRvcigpKTtcbiAgdmFyIGRlbm9taW5hdG9yID0ganNudW1zLnRvRXhhY3QodGhpcy52YWxfLmRlbm9taW5hdG9yKCkpO1xuICB2YXIgcmVwZWF0ZXIgPSBqc251bXMudG9SZXBlYXRpbmdEZWNpbWFsKG51bWVyYXRvciwgZGVub21pbmF0b3IpO1xuICBpZiAoIXJlcGVhdGVyWzJdIHx8IHJlcGVhdGVyWzJdID09PSAnMCcpIHtcbiAgICB0aGlzLm5vblJlcGVhdGVkXyA9IFRva2VuLm51bWJlcldpdGhDb21tYXNfKHRoaXMudmFsXy50b0ZpeG51bSgpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLm5vblJlcGVhdGVkXyA9IFRva2VuLm51bWJlcldpdGhDb21tYXNfKHJlcGVhdGVyWzBdKSArICcuJyArIHJlcGVhdGVyWzFdO1xuICB0aGlzLnJlcGVhdGVkXyA9IHJlcGVhdGVyWzJdO1xufTtcblxuLyoqXG4gKiBGcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI5MDEyOTgvMjUwNjc0OFxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBudW1iZXIgd2l0aCBjb21tYXMgaW5zZXJ0ZWQgaW4gdGhvdXNhbmR0aCdzIHBsYWNlXG4gKi9cblRva2VuLm51bWJlcldpdGhDb21tYXNfID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHBhcnRzID0geC50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcbiAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIik7XG4gIHJldHVybiBwYXJ0cy5qb2luKFwiLlwiKTtcbn07XG4iLCIvLyBTY2hlbWUgbnVtYmVycy5cblxuLy8gTk9URTogVGhpcyB0b3AgYml0IGRpZmZlcnMgZnJvbSB0aGUgdmVyc2lvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vYm9vdHN0cmFwd29ybGQvanMtbnVtYmVycy9ibG9iL21hc3Rlci9zcmMvanMtbnVtYmVycy5qc1xudmFyIGpzbnVtcyA9IHt9O1xubW9kdWxlLmV4cG9ydHMgPSBqc251bXM7XG5cblxuLy8gVGhlIG51bWVyaWMgdG93ZXIgaGFzIHRoZSBmb2xsb3dpbmcgbGV2ZWxzOlxuLy8gICAgIGludGVnZXJzXG4vLyAgICAgcmF0aW9uYWxzXG4vLyAgICAgZmxvYXRzXG4vLyAgICAgY29tcGxleCBudW1iZXJzXG4vL1xuLy8gd2l0aCB0aGUgcmVwcmVzZW50YXRpb25zOlxuLy8gICAgIGludGVnZXJzOiBmaXhudW0gb3IgQmlnSW50ZWdlciBbbGV2ZWw9MF1cbi8vICAgICByYXRpb25hbHM6IFJhdGlvbmFsIFtsZXZlbD0xXVxuLy8gICAgIGZsb2F0czogRmxvYXRQb2ludCBbbGV2ZWw9Ml1cbi8vICAgICBjb21wbGV4IG51bWJlcnM6IENvbXBsZXggW2xldmVsPTNdXG5cbi8vIFdlIHRyeSB0byBzdGljayB3aXRoIHRoZSB1bmJveGVkIGZpeG51bSByZXByZXNlbnRhdGlvbiBmb3Jcbi8vIGludGVnZXJzLCBzaW5jZSB0aGF0J3Mgd2hhdCBzY2hlbWUgcHJvZ3JhbXMgY29tbW9ubHkgZGVhbCB3aXRoLCBhbmRcbi8vIHdlIHdhbnQgdGhhdCBjb21tb24gdHlwZSB0byBiZSBsaWdodHdlaWdodC5cblxuXG4vLyBBIGJveGVkLXNjaGVtZS1udW1iZXIgaXMgZWl0aGVyIEJpZ0ludGVnZXIsIFJhdGlvbmFsLCBGbG9hdFBvaW50LCBvciBDb21wbGV4LlxuLy8gQW4gaW50ZWdlci1zY2hlbWUtbnVtYmVyIGlzIGVpdGhlciBmaXhudW0gb3IgQmlnSW50ZWdlci5cblxuXG4oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIEFiYnJldmlhdGlvblxuICAgIHZhciBOdW1iZXJzID0ganNudW1zO1xuXG5cbiAgICAvLyBtYWtlTnVtZXJpY0Jpbm9wOiAoZml4bnVtIGZpeG51bSAtPiBhbnkpIChzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYW55KSAtPiAoc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyKSBYXG4gICAgLy8gQ3JlYXRlcyBhIGJpbmFyeSBmdW5jdGlvbiB0aGF0IHdvcmtzIGVpdGhlciBvbiBmaXhudW1zIG9yIGJveG51bXMuXG4gICAgLy8gQXBwbGllcyB0aGUgYXBwcm9wcmlhdGUgYmluYXJ5IGZ1bmN0aW9uLCBlbnN1cmluZyB0aGF0IGJvdGggc2NoZW1lIG51bWJlcnMgYXJlXG4gICAgLy8gbGlmdGVkIHRvIHRoZSBzYW1lIGxldmVsLlxuICAgIHZhciBtYWtlTnVtZXJpY0Jpbm9wID0gZnVuY3Rpb24ob25GaXhudW1zLCBvbkJveGVkbnVtcywgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmlzWFNwZWNpYWxDYXNlICYmIG9wdGlvbnMuaXNYU3BlY2lhbENhc2UoeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMub25YU3BlY2lhbENhc2UoeCwgeSk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pc1lTcGVjaWFsQ2FzZSAmJiBvcHRpb25zLmlzWVNwZWNpYWxDYXNlKHkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLm9uWVNwZWNpYWxDYXNlKHgsIHkpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mKHgpID09PSAnbnVtYmVyJyAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25GaXhudW1zKHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZih4KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB4ID0gbGlmdEZpeG51bUludGVnZXIoeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKHkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHkgPSBsaWZ0Rml4bnVtSW50ZWdlcih5LCB4KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHgubGV2ZWwgPCB5LmxldmVsKSB4ID0geC5saWZ0VG8oeSk7XG4gICAgICAgICAgICBpZiAoeS5sZXZlbCA8IHgubGV2ZWwpIHkgPSB5LmxpZnRUbyh4KTtcbiAgICAgICAgICAgIHJldHVybiBvbkJveGVkbnVtcyh4LCB5KTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIC8vIGZyb21GaXhudW06IGZpeG51bSAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGZyb21GaXhudW0gPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIGlmIChpc05hTih4KSB8fCAoISBpc0Zpbml0ZSh4KSkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh4KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmYgPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICBpZiAobmYgPT09IHgpIHtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KG5mKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYWtlQmlnbnVtKGV4cGFuZEV4cG9uZW50KHgrJycpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5mO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBleHBhbmRFeHBvbmVudCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gcy5tYXRjaChzY2llbnRpZmljUGF0dGVybihkaWdpdHNGb3JSYWRpeCgxMCksIGV4cE1hcmtGb3JSYWRpeCgxMCkpKSwgbWFudGlzc2FDaHVua3MsIGV4cG9uZW50O1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIG1hbnRpc3NhQ2h1bmtzID0gbWF0Y2hbMV0ubWF0Y2goL14oW14uXSopKC4qKSQvKTtcbiAgICAgICAgICAgIGV4cG9uZW50ID0gTnVtYmVyKG1hdGNoWzJdKTtcblxuICAgICAgICAgICAgaWYgKG1hbnRpc3NhQ2h1bmtzWzJdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYW50aXNzYUNodW5rc1sxXSArIHpmaWxsKGV4cG9uZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGV4cG9uZW50ID49IG1hbnRpc3NhQ2h1bmtzWzJdLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1hbnRpc3NhQ2h1bmtzWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnRpc3NhQ2h1bmtzWzJdLnN1YnN0cmluZygxKSArXG4gICAgICAgICAgICAgICAgICAgICAgICB6ZmlsbChleHBvbmVudCAtIChtYW50aXNzYUNodW5rc1syXS5sZW5ndGggLSAxKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1hbnRpc3NhQ2h1bmtzWzFdICtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbnRpc3NhQ2h1bmtzWzJdLnN1YnN0cmluZygxLCAxK2V4cG9uZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyB6ZmlsbDogaW50ZWdlciAtPiBzdHJpbmdcbiAgICAvLyBidWlsZHMgYSBzdHJpbmcgb2YgXCIwXCIncyBvZiBsZW5ndGggbi5cbiAgICB2YXIgemZpbGwgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHZhciBidWZmZXIgPSBbXTtcbiAgICAgICAgYnVmZmVyLmxlbmd0aCA9IG47XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBidWZmZXJbaV0gPSAnMCc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1ZmZlci5qb2luKCcnKTtcbiAgICB9O1xuXG5cblxuICAgIC8vIGxpZnRGaXhudW1JbnRlZ2VyOiBmaXhudW0taW50ZWdlciBib3hlZC1zY2hlbWUtbnVtYmVyIC0+IGJveGVkLXNjaGVtZS1udW1iZXJcbiAgICAvLyBMaWZ0cyB1cCBmaXhudW0gaW50ZWdlcnMgdG8gYSBib3hlZCB0eXBlLlxuICAgIHZhciBsaWZ0Rml4bnVtSW50ZWdlciA9IGZ1bmN0aW9uKHgsIG90aGVyKSB7XG4gICAgICAgIHN3aXRjaChvdGhlci5sZXZlbCkge1xuICAgICAgICBjYXNlIDA6IC8vIEJpZ0ludGVnZXJcbiAgICAgICAgICAgIHJldHVybiBtYWtlQmlnbnVtKHgpO1xuICAgICAgICBjYXNlIDE6IC8vIFJhdGlvbmFsXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJhdGlvbmFsKHgsIDEpO1xuICAgICAgICBjYXNlIDI6IC8vIEZsb2F0UG9pbnRcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXRQb2ludCh4KTtcbiAgICAgICAgY2FzZSAzOiAvLyBDb21wbGV4XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbXBsZXgoeCwgMCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIklNUE9TU0lCTEU6IGNhbm5vdCBsaWZ0IGZpeG51bSBpbnRlZ2VyIHRvIFwiICsgb3RoZXIudG9TdHJpbmcoKSwgeCwgb3RoZXIpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLy8gdGhyb3dSdW50aW1lRXJyb3I6IHN0cmluZyAoc2NoZW1lLW51bWJlciB8IHVuZGVmaW5lZCkgKHNjaGVtZS1udW1iZXIgfCB1bmRlZmluZWQpIC0+IHZvaWRcbiAgICAvLyBUaHJvd3MgYSBydW50aW1lIGVycm9yIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2Ugc3RyaW5nLlxuICAgIHZhciB0aHJvd1J1bnRpbWVFcnJvciA9IGZ1bmN0aW9uKG1zZywgeCwgeSkge1xuICAgICAgICBOdW1iZXJzWydvblRocm93UnVudGltZUVycm9yJ10obXNnLCB4LCB5KTtcbiAgICB9O1xuXG5cblxuICAgIC8vIG9uVGhyb3dSdW50aW1lRXJyb3I6IHN0cmluZyAoc2NoZW1lLW51bWJlciB8IHVuZGVmaW5lZCkgKHNjaGVtZS1udW1iZXIgfCB1bmRlZmluZWQpIC0+IHZvaWRcbiAgICAvLyBCeSBkZWZhdWx0LCB3aWxsIHRocm93IGEgbmV3IEVycm9yIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAgLy8gT3ZlcnJpZGUgTnVtYmVyc1snb25UaHJvd1J1bnRpbWVFcnJvciddIGlmIHlvdSBuZWVkIHRvIGRvIHNvbWV0aGluZyBzcGVjaWFsLlxuICAgIHZhciBvblRocm93UnVudGltZUVycm9yID0gZnVuY3Rpb24obXNnLCB4LCB5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH07XG5cblxuICAgIC8vIGlzU2NoZW1lTnVtYmVyOiBhbnkgLT4gYm9vbGVhblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgdGhpbmcgaXMgYSBzY2hlbWUgbnVtYmVyLlxuICAgIHZhciBpc1NjaGVtZU51bWJlciA9IGZ1bmN0aW9uKHRoaW5nKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKHRoaW5nKSA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICB8fCAodGhpbmcgaW5zdGFuY2VvZiBSYXRpb25hbCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGluZyBpbnN0YW5jZW9mIEZsb2F0UG9pbnQgfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpbmcgaW5zdGFuY2VvZiBDb21wbGV4IHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaW5nIGluc3RhbmNlb2YgQmlnSW50ZWdlcikpO1xuICAgIH07XG5cblxuICAgIC8vIGlzUmF0aW9uYWw6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc1JhdGlvbmFsID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZihuKSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAoaXNTY2hlbWVOdW1iZXIobikgJiYgbi5pc1JhdGlvbmFsKCkpKTtcbiAgICB9O1xuXG4gICAgLy8gaXNSZWFsOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNSZWFsID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZihuKSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAoaXNTY2hlbWVOdW1iZXIobikgJiYgbi5pc1JlYWwoKSkpO1xuICAgIH07XG5cbiAgICAvLyBpc0V4YWN0OiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNFeGFjdCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YobikgPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgKGlzU2NoZW1lTnVtYmVyKG4pICYmIG4uaXNFeGFjdCgpKSk7XG4gICAgfTtcblxuICAgIC8vIGlzRXhhY3Q6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc0luZXhhY3QgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKGlzU2NoZW1lTnVtYmVyKG4pICYmIG4uaXNJbmV4YWN0KCkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGlzSW50ZWdlcjogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzSW50ZWdlciA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YobikgPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgKGlzU2NoZW1lTnVtYmVyKG4pICYmIG4uaXNJbnRlZ2VyKCkpKTtcbiAgICB9O1xuXG4gICAgLy8gaXNFeGFjdEludGVnZXI6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc0V4YWN0SW50ZWdlciA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YobikgPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgKGlzU2NoZW1lTnVtYmVyKG4pICYmXG4gICAgICAgICAgICAgICAgIG4uaXNJbnRlZ2VyKCkgJiZcbiAgICAgICAgICAgICAgICAgbi5pc0V4YWN0KCkpKTtcbiAgICB9XG5cblxuXG4gICAgLy8gdG9GaXhudW06IHNjaGVtZS1udW1iZXIgLT4gamF2YXNjcmlwdC1udW1iZXJcbiAgICB2YXIgdG9GaXhudW0gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLnRvRml4bnVtKCk7XG4gICAgfTtcblxuICAgIC8vIHRvRXhhY3Q6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciB0b0V4YWN0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi50b0V4YWN0KCk7XG4gICAgfTtcblxuXG4gICAgLy8gdG9FeGFjdDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHRvSW5leGFjdCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2Uobik7XG4gICAgICAgIHJldHVybiBuLnRvSW5leGFjdCgpO1xuICAgIH07XG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbiAgICAvLyBhZGQ6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGFkZCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHN1bTtcbiAgICAgICAgaWYgKHR5cGVvZih4KSA9PT0gJ251bWJlcicgJiYgdHlwZW9mKHkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgc3VtID0geCArIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhzdW0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5hZGQobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBGbG9hdFBvaW50ICYmIHkgaW5zdGFuY2VvZiBGbG9hdFBvaW50KSB7XG4gICAgICAgICAgICByZXR1cm4geC5hZGQoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZFNsb3coeCwgeSk7XG4gICAgfTtcblxuICAgIHZhciBhZGRTbG93ID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgdmFyIHN1bSA9IHggKyB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3coc3VtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkuYWRkKG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geC5hZGQoeSk7XG4gICAgICAgIH0sXG4gICAgICAgIHtpc1hTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzRXhhY3RJbnRlZ2VyKHgpICYmIF9pbnRlZ2VySXNaZXJvKHgpIH0sXG4gICAgICAgICBvblhTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkgeyByZXR1cm4geTsgfSxcbiAgICAgICAgIGlzWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih5KSB7XG4gICAgICAgICAgICAgcmV0dXJuIGlzRXhhY3RJbnRlZ2VyKHkpICYmIF9pbnRlZ2VySXNaZXJvKHkpIH0sXG4gICAgICAgICBvbllTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkgeyByZXR1cm4geDsgfVxuICAgICAgICB9KTtcblxuXG4gICAgLy8gc3VidHJhY3Q6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHN1YnRyYWN0ID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgdmFyIGRpZmYgPSB4IC0geTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KGRpZmYpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5zdWJ0cmFjdChtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4LnN1YnRyYWN0KHkpO1xuICAgICAgICB9LFxuICAgICAgICB7aXNYU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0V4YWN0SW50ZWdlcih4KSAmJiBfaW50ZWdlcklzWmVybyh4KSB9LFxuICAgICAgICAgb25YU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHsgcmV0dXJuIG5lZ2F0ZSh5KTsgfSxcbiAgICAgICAgIGlzWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih5KSB7XG4gICAgICAgICAgICAgcmV0dXJuIGlzRXhhY3RJbnRlZ2VyKHkpICYmIF9pbnRlZ2VySXNaZXJvKHkpIH0sXG4gICAgICAgICBvbllTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkgeyByZXR1cm4geDsgfVxuICAgICAgICB9KTtcblxuXG4gICAgLy8gbXVsaXRwbHk6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIG11bHRpcGx5ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgcHJvZDtcbiAgICAgICAgaWYgKHR5cGVvZih4KSA9PT0gJ251bWJlcicgJiYgdHlwZW9mKHkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcHJvZCA9IHggKiB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3cocHJvZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLm11bHRpcGx5KG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIEZsb2F0UG9pbnQgJiYgeSBpbnN0YW5jZW9mIEZsb2F0UG9pbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB4Lm11bHRpcGx5KHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtdWx0aXBseVNsb3coeCwgeSk7XG4gICAgfTtcbiAgICB2YXIgbXVsdGlwbHlTbG93ID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgdmFyIHByb2QgPSB4ICogeTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KHByb2QpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5tdWx0aXBseShtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4Lm11bHRpcGx5KHkpO1xuICAgICAgICB9LFxuICAgICAgICB7aXNYU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHJldHVybiAoaXNFeGFjdEludGVnZXIoeCkgJiZcbiAgICAgICAgICAgICAgICAgICAgKF9pbnRlZ2VySXNaZXJvKHgpIHx8IF9pbnRlZ2VySXNPbmUoeCkgfHwgX2ludGVnZXJJc05lZ2F0aXZlT25lKHgpKSkgfSxcbiAgICAgICAgIG9uWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHgpKVxuICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc09uZSh4KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHk7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNOZWdhdGl2ZU9uZSh4KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIG5lZ2F0ZSh5KTtcbiAgICAgICAgIH0sXG4gICAgICAgICBpc1lTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeSkge1xuICAgICAgICAgICAgIHJldHVybiAoaXNFeGFjdEludGVnZXIoeSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIChfaW50ZWdlcklzWmVybyh5KSB8fCBfaW50ZWdlcklzT25lKHkpIHx8IF9pbnRlZ2VySXNOZWdhdGl2ZU9uZSh5KSkpfSxcbiAgICAgICAgIG9uWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHkpKVxuICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc09uZSh5KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNOZWdhdGl2ZU9uZSh5KSlcbiAgICAgICAgICAgICAgICAgcmV0dXJuIG5lZ2F0ZSh4KTtcbiAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGRpdmlkZTogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZGl2aWRlID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHkpKVxuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiLzogZGl2aXNpb24gYnkgemVyb1wiLCB4LCB5KTtcbiAgICAgICAgICAgIHZhciBkaXYgPSB4IC8geTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KGRpdikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLmRpdmlkZShtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTWF0aC5mbG9vcihkaXYpICE9PSBkaXYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKHgsIHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geC5kaXZpZGUoeSk7XG4gICAgICAgIH0sXG4gICAgICAgIHsgaXNYU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZXF2KHgsIDApKTtcbiAgICAgICAgfSxcbiAgICAgICAgICBvblhTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgICBpZiAoZXF2KHksIDApKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIi86IGRpdmlzaW9uIGJ5IHplcm9cIiwgeCwgeSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBpc1lTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeSkge1xuICAgICAgICAgICAgcmV0dXJuIChlcXYoeSwgMCkpOyB9LFxuICAgICAgICAgIG9uWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiLzogZGl2aXNpb24gYnkgemVyb1wiLCB4LCB5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBlcXVhbHM6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGVxdWFscyA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5O1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geC5lcXVhbHMoeSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBlcXY6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGVxdiA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPT09IHkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKHR5cGVvZih4KSA9PT0gJ251bWJlcicgJiYgdHlwZW9mKHkpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5O1xuICAgICAgICBpZiAoeCA9PT0gTkVHQVRJVkVfWkVSTyB8fCB5ID09PSBORUdBVElWRV9aRVJPKVxuICAgICAgICAgICAgcmV0dXJuIHggPT09IHk7XG4gICAgICAgIGlmICh4IGluc3RhbmNlb2YgQ29tcGxleCB8fCB5IGluc3RhbmNlb2YgQ29tcGxleCkge1xuICAgICAgICAgICAgcmV0dXJuIChlcXYocmVhbFBhcnQoeCksIHJlYWxQYXJ0KHkpKSAmJlxuICAgICAgICAgICAgICAgICAgICBlcXYoaW1hZ2luYXJ5UGFydCh4KSwgaW1hZ2luYXJ5UGFydCh5KSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBleCA9IGlzRXhhY3QoeCksIGV5ID0gaXNFeGFjdCh5KTtcbiAgICAgICAgcmV0dXJuICgoKGV4ICYmIGV5KSB8fCAoIWV4ICYmICFleSkpICYmIGVxdWFscyh4LCB5KSk7XG4gICAgfTtcblxuICAgIC8vIGFwcHJveEVxdWFsOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGFwcHJveEVxdWFscyA9IGZ1bmN0aW9uKHgsIHksIGRlbHRhKSB7XG4gICAgICAgIHJldHVybiBsZXNzVGhhbihhYnMoc3VidHJhY3QoeCwgeSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGEpO1xuICAgIH07XG5cbiAgICAvLyBncmVhdGVyVGhhbk9yRXF1YWw6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGdyZWF0ZXJUaGFuT3JFcXVhbCA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4ID49IHk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmICghKGlzUmVhbCh4KSAmJiBpc1JlYWwoeSkpKVxuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICAgICAgICBcIj49OiBjb3VsZG4ndCBiZSBhcHBsaWVkIHRvIGNvbXBsZXggbnVtYmVyXCIsIHgsIHkpO1xuICAgICAgICAgICAgcmV0dXJuIHguZ3JlYXRlclRoYW5PckVxdWFsKHkpO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gbGVzc1RoYW5PckVxdWFsOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBsZXNzVGhhbk9yRXF1YWwgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KXtcblxuICAgICAgICAgICAgcmV0dXJuIHggPD0geTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKCEoaXNSZWFsKHgpICYmIGlzUmVhbCh5KSkpXG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI8PTogY291bGRuJ3QgYmUgYXBwbGllZCB0byBjb21wbGV4IG51bWJlclwiLCB4LCB5KTtcbiAgICAgICAgICAgIHJldHVybiB4Lmxlc3NUaGFuT3JFcXVhbCh5KTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGdyZWF0ZXJUaGFuOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBncmVhdGVyVGhhbiA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpe1xuICAgICAgICAgICAgcmV0dXJuIHggPiB5O1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1JlYWwoeCkgJiYgaXNSZWFsKHkpKSlcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIj46IGNvdWxkbid0IGJlIGFwcGxpZWQgdG8gY29tcGxleCBudW1iZXJcIiwgeCwgeSk7XG4gICAgICAgICAgICByZXR1cm4geC5ncmVhdGVyVGhhbih5KTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGxlc3NUaGFuOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBsZXNzVGhhbiA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpe1xuXG4gICAgICAgICAgICByZXR1cm4geCA8IHk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmICghKGlzUmVhbCh4KSAmJiBpc1JlYWwoeSkpKVxuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPDogY291bGRuJ3QgYmUgYXBwbGllZCB0byBjb21wbGV4IG51bWJlclwiLCB4LCB5KTtcbiAgICAgICAgICAgIHJldHVybiB4Lmxlc3NUaGFuKHkpO1xuICAgICAgICB9KTtcblxuXG5cbiAgICAvLyBleHB0OiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBleHB0ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2V4cHQgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICAgICAgZnVuY3Rpb24oeCwgeSl7XG4gICAgICAgICAgICAgICAgdmFyIHBvdyA9IE1hdGgucG93KHgsIHkpO1xuICAgICAgICAgICAgICAgIGlmIChpc092ZXJmbG93KHBvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5leHB0KG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzKHksIDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGQoeSwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHguZXhwdCh5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmIChlcXVhbHMoeSwgMCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZCh5LCAxKTtcbiAgICAgICAgICAgIGlmIChpc1JlYWwoeSkgJiYgbGVzc1RoYW4oeSwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2V4cHQoZGl2aWRlKDEsIHgpLCBuZWdhdGUoeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9leHB0KHgsIHkpO1xuICAgICAgICB9O1xuICAgIH0pKCk7XG5cblxuICAgIC8vIGV4cDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGV4cCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKCBlcXYobiwgMCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmV4cChuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uZXhwKCk7XG4gICAgfTtcblxuXG4gICAgLy8gbW9kdWxvOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBtb2R1bG8gPSBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgIGlmICghIGlzSW50ZWdlcihtKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ21vZHVsbzogdGhlIGZpcnN0IGFyZ3VtZW50ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgbSArIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCBtLCBuKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISBpc0ludGVnZXIobikpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdtb2R1bG86IHRoZSBzZWNvbmQgYXJndW1lbnQgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBuICsgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIG0sIG4pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGlmICh0eXBlb2YobSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBtICUgbjtcbiAgICAgICAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPD0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgKyBuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IDwgMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIG47XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IF9pbnRlZ2VyTW9kdWxvKGZsb29yKG0pLCBmbG9vcihuKSk7XG4gICAgICAgIC8vIFRoZSBzaWduIG9mIHRoZSByZXN1bHQgc2hvdWxkIG1hdGNoIHRoZSBzaWduIG9mIG4uXG4gICAgICAgIGlmIChsZXNzVGhhbihuLCAwKSkge1xuICAgICAgICAgICAgaWYgKGxlc3NUaGFuT3JFcXVhbChyZXN1bHQsIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhZGQocmVzdWx0LCBuKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGxlc3NUaGFuKHJlc3VsdCwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkKHJlc3VsdCwgbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICAvLyBudW1lcmF0b3I6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBudW1lcmF0b3IgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLm51bWVyYXRvcigpO1xuICAgIH07XG5cblxuICAgIC8vIGRlbm9taW5hdG9yOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZGVub21pbmF0b3IgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIHJldHVybiBuLmRlbm9taW5hdG9yKCk7XG4gICAgfTtcblxuICAgIC8vIHNxcnQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBzcXJ0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKG4gPj0gMCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBNYXRoLnNxcnQobik7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguZmxvb3IocmVzdWx0KSA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKENvbXBsZXgubWFrZUluc3RhbmNlKDAsIHNxcnQoLW4pKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uc3FydCgpO1xuICAgIH07XG5cbiAgICAvLyBhYnM6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhYnMgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMobik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uYWJzKCk7XG4gICAgfTtcblxuICAgIC8vIGZsb29yOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZmxvb3IgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLmZsb29yKCk7XG4gICAgfTtcblxuICAgIC8vIGNlaWxpbmc6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBjZWlsaW5nID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi5jZWlsaW5nKCk7XG4gICAgfTtcblxuICAgIC8vIGNvbmp1Z2F0ZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4uY29uanVnYXRlKCk7XG4gICAgfTtcblxuICAgIC8vIG1hZ25pdHVkZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIG1hZ25pdHVkZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMobik7XG4gICAgICAgIHJldHVybiBuLm1hZ25pdHVkZSgpO1xuICAgIH07XG5cblxuICAgIC8vIGxvZzogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGxvZyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKCBlcXYobiwgMSkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmxvZyhuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4ubG9nKCk7XG4gICAgfTtcblxuICAgIC8vIGFuZ2xlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYW5nbGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAobiA+IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQucGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uYW5nbGUoKTtcbiAgICB9O1xuXG4gICAgLy8gdGFuOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgdGFuID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDApKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC50YW4obikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLnRhbigpO1xuICAgIH07XG5cbiAgICAvLyBhdGFuOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYXRhbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAwKSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXRhbihuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uYXRhbigpO1xuICAgIH07XG5cbiAgICAvLyBjb3M6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBjb3MgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMCkpIHsgcmV0dXJuIDE7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmNvcyhuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uY29zKCk7XG4gICAgfTtcblxuICAgIC8vIHNpbjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHNpbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAwKSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc2luKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5zaW4oKTtcbiAgICB9O1xuXG4gICAgLy8gYWNvczogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGFjb3MgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMSkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFjb3MobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmFjb3MoKTtcbiAgICB9O1xuXG4gICAgLy8gYXNpbjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGFzaW4gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMCkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFzaW4obikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmFzaW4oKTtcbiAgICB9O1xuXG4gICAgLy8gaW1hZ2luYXJ5UGFydDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGltYWdpbmFyeVBhcnQgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5pbWFnaW5hcnlQYXJ0KCk7XG4gICAgfTtcblxuICAgIC8vIHJlYWxQYXJ0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgcmVhbFBhcnQgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5yZWFsUGFydCgpO1xuICAgIH07XG5cbiAgICAvLyByb3VuZDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHJvdW5kID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4ucm91bmQoKTtcbiAgICB9O1xuXG5cblxuICAgIC8vIHNxcjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHNxciA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5KHgsIHgpO1xuICAgIH07XG5cblxuICAgIC8vIGludGVnZXJTcXJ0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgaW50ZWdlclNxcnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIGlmICghIGlzSW50ZWdlcih4KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ2ludGVnZXItc3FydDogdGhlIGFyZ3VtZW50ICcgKyB4LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgKHgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYoeCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnNxcnQoLXgpKSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5zcXJ0KHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geC5pbnRlZ2VyU3FydCgpO1xuICAgIH07XG5cblxuICAgIC8vIGdjZDogc2NoZW1lLW51bWJlciBbc2NoZW1lLW51bWJlciAuLi5dIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZ2NkID0gZnVuY3Rpb24oZmlyc3QsIHJlc3QpIHtcbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKGZpcnN0KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ2djZDogdGhlIGFyZ3VtZW50ICcgKyBmaXJzdC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCBmaXJzdCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGEgPSBhYnMoZmlyc3QpLCB0LCBiO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcmVzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYiA9IGFicyhyZXN0W2ldKTtcbiAgICAgICAgICAgIGlmICghIGlzSW50ZWdlcihiKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdnY2Q6IHRoZSBhcmd1bWVudCAnICsgYi50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoISBfaW50ZWdlcklzWmVybyhiKSkge1xuICAgICAgICAgICAgICAgIHQgPSBhO1xuICAgICAgICAgICAgICAgIGEgPSBiO1xuICAgICAgICAgICAgICAgIGIgPSBfaW50ZWdlck1vZHVsbyh0LCBiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuXG4gICAgLy8gbGNtOiBzY2hlbWUtbnVtYmVyIFtzY2hlbWUtbnVtYmVyIC4uLl0gLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBsY20gPSBmdW5jdGlvbihmaXJzdCwgcmVzdCkge1xuICAgICAgICBpZiAoISBpc0ludGVnZXIoZmlyc3QpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignbGNtOiB0aGUgYXJndW1lbnQgJyArIGZpcnN0LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIGZpcnN0KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gYWJzKGZpcnN0KTtcbiAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHJlc3VsdCkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoISBpc0ludGVnZXIocmVzdFtpXSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignbGNtOiB0aGUgYXJndW1lbnQgJyArIHJlc3RbaV0udG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHJlc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRpdmlzb3IgPSBfaW50ZWdlckdjZChyZXN1bHQsIHJlc3RbaV0pO1xuICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKGRpdmlzb3IpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgPSBkaXZpZGUobXVsdGlwbHkocmVzdWx0LCByZXN0W2ldKSwgZGl2aXNvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG5cbiAgICB2YXIgcXVvdGllbnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICBpZiAoISBpc0ludGVnZXIoeCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdxdW90aWVudDogdGhlIGZpcnN0IGFyZ3VtZW50ICcgKyB4LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghIGlzSW50ZWdlcih5KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3F1b3RpZW50OiB0aGUgc2Vjb25kIGFyZ3VtZW50ICcgKyB5LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfaW50ZWdlclF1b3RpZW50KHgsIHkpO1xuICAgIH07XG5cblxuICAgIHZhciByZW1haW5kZXIgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmICghIGlzSW50ZWdlcih4KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3JlbWFpbmRlcjogdGhlIGZpcnN0IGFyZ3VtZW50ICcgKyB4LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghIGlzSW50ZWdlcih5KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3JlbWFpbmRlcjogdGhlIHNlY29uZCBhcmd1bWVudCAnICsgeS50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCB5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2ludGVnZXJSZW1haW5kZXIoeCwgeSk7XG4gICAgfTtcblxuXG4gICAgLy8gSW1wbGVtZW50YXRpb24gb2YgdGhlIGh5cGVyYm9saWMgZnVuY3Rpb25zXG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IeXBlcmJvbGljX2Nvc2luZVxuICAgIHZhciBjb3NoID0gZnVuY3Rpb24oeCkge1xuICAgICAgICBpZiAoZXF2KHgsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoMS4wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGl2aWRlKGFkZChleHAoeCksIGV4cChuZWdhdGUoeCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAyKTtcbiAgICB9O1xuXG4gICAgdmFyIHNpbmggPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBkaXZpZGUoc3VidHJhY3QoZXhwKHgpLCBleHAobmVnYXRlKHgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgMik7XG4gICAgfTtcblxuXG5cbiAgICB2YXIgbWFrZUNvbXBsZXhQb2xhciA9IGZ1bmN0aW9uKHIsIHRoZXRhKSB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZTogaWYgdGhldGEgaXMgemVybywganVzdCByZXR1cm5cbiAgICAgICAgLy8gdGhlIHNjYWxhci5cbiAgICAgICAgaWYgKGVxdih0aGV0YSwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShtdWx0aXBseShyLCBjb3ModGhldGEpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGx5KHIsIHNpbih0aGV0YSkpKTtcbiAgICB9O1xuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIEhlbHBlcnNcblxuXG4gICAgLy8gSXNGaW5pdGU6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgc2NoZW1lIG51bWJlciBpcyBmaW5pdGUgb3Igbm90LlxuICAgIHZhciBpc1NjaGVtZU51bWJlckZpbml0ZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0Zpbml0ZShuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuLmlzRmluaXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gaXNPdmVyZmxvdzogamF2YXNjcmlwdC1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZiB3ZSBjb25zaWRlciB0aGUgbnVtYmVyIGFuIG92ZXJmbG93LlxuICAgIHZhciBNSU5fRklYTlVNID0gLSg5ZTE1KTtcbiAgICB2YXIgTUFYX0ZJWE5VTSA9ICg5ZTE1KTtcbiAgICB2YXIgaXNPdmVyZmxvdyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuIChuIDwgTUlOX0ZJWE5VTSB8fCAgTUFYX0ZJWE5VTSA8IG4pO1xuICAgIH07XG5cblxuICAgIC8vIG5lZ2F0ZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gbXVsdGlwbGllcyBhIG51bWJlciB0aW1lcyAtMS5cbiAgICB2YXIgbmVnYXRlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIC1uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLm5lZ2F0ZSgpO1xuICAgIH07XG5cblxuICAgIC8vIGhhbHZlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBEaXZpZGUgYSBudW1iZXIgYnkgMi5cbiAgICB2YXIgaGFsdmUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiBkaXZpZGUobiwgMik7XG4gICAgfTtcblxuXG4gICAgLy8gdGltZXNJOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXJcbiAgICAvLyBtdWx0aXBsaWVzIGEgbnVtYmVyIHRpbWVzIGkuXG4gICAgdmFyIHRpbWVzSSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5KHgsIHBsdXNJKTtcbiAgICB9O1xuXG5cbiAgICAvLyBmYXN0RXhwdDogY29tcHV0ZXMgbl5rIGJ5IHNxdWFyaW5nLlxuICAgIC8vIG5eayA9IChuXjIpXihrLzIpXG4gICAgLy8gQXNzdW1lcyBrIGlzIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLlxuICAgIHZhciBmYXN0RXhwdCA9IGZ1bmN0aW9uKG4sIGspIHtcbiAgICAgICAgdmFyIGFjYyA9IDE7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oaykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVxdWFscyhtb2R1bG8oaywgMiksIDApKSB7XG4gICAgICAgICAgICAgICAgbiA9IG11bHRpcGx5KG4sIG4pO1xuICAgICAgICAgICAgICAgIGsgPSBkaXZpZGUoaywgMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjYyA9IG11bHRpcGx5KGFjYywgbik7XG4gICAgICAgICAgICAgICAgayA9IHN1YnRyYWN0KGssIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbiAgICAvLyBJbnRlZ2VyIG9wZXJhdGlvbnNcbiAgICAvLyBJbnRlZ2VycyBhcmUgZWl0aGVyIHJlcHJlc2VudGVkIGFzIGZpeG51bXMgb3IgYXMgQmlnSW50ZWdlcnMuXG5cbiAgICAvLyBtYWtlSW50ZWdlckJpbm9wOiAoZml4bnVtIGZpeG51bSAtPiBYKSAoQmlnSW50ZWdlciBCaWdJbnRlZ2VyIC0+IFgpIC0+IFhcbiAgICAvLyBIZWxwZXIgdG8gY29sbGVjdCB0aGUgY29tbW9uIGxvZ2ljIGZvciBjb2Vyc2luZyBpbnRlZ2VyIGZpeG51bXMgb3IgYmlnbnVtcyB0byBhXG4gICAgLy8gY29tbW9uIHR5cGUgYmVmb3JlIGRvaW5nIGFuIG9wZXJhdGlvbi5cbiAgICB2YXIgbWFrZUludGVnZXJCaW5vcCA9IGZ1bmN0aW9uKG9uRml4bnVtcywgb25CaWdudW1zLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgUmF0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICBtID0gbnVtZXJhdG9yKG0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtIGluc3RhbmNlb2YgQ29tcGxleCkge1xuICAgICAgICAgICAgICAgIG0gPSByZWFsUGFydChtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBSYXRpb25hbCkge1xuICAgICAgICAgICAgICAgIG4gPSBudW1lcmF0b3Iobik7XG4gICAgICAgICAgICB9ZWxzZSBpZiAobiBpbnN0YW5jZW9mIENvbXBsZXgpIHtcbiAgICAgICAgICAgICAgICBuID0gcmVhbFBhcnQobik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YobSkgPT09ICdudW1iZXInICYmIHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gb25GaXhudW1zKG0sIG4pO1xuICAgICAgICAgICAgICAgIGlmICghIGlzT3ZlcmZsb3cocmVzdWx0KSB8fFxuICAgICAgICAgICAgICAgICAgICAob3B0aW9ucy5pZ25vcmVPdmVyZmxvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIEZsb2F0UG9pbnQgfHwgbiBpbnN0YW5jZW9mIEZsb2F0UG9pbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kb05vdENvZXJzZVRvRmxvYXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9uRml4bnVtcyh0b0ZpeG51bShtKSwgdG9GaXhudW0obikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaXhudW1zKHRvRml4bnVtKG0pLCB0b0ZpeG51bShuKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YobSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbSA9IG1ha2VCaWdudW0obSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIG4gPSBtYWtlQmlnbnVtKG4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9uQmlnbnVtcyhtLCBuKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgdmFyIG1ha2VJbnRlZ2VyVW5PcCA9IGZ1bmN0aW9uKG9uRml4bnVtcywgb25CaWdudW1zLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgUmF0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICBtID0gbnVtZXJhdG9yKG0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtIGluc3RhbmNlb2YgQ29tcGxleCkge1xuICAgICAgICAgICAgICAgIG0gPSByZWFsUGFydChtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZihtKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gb25GaXhudW1zKG0pO1xuICAgICAgICAgICAgICAgIGlmICghIGlzT3ZlcmZsb3cocmVzdWx0KSB8fFxuICAgICAgICAgICAgICAgICAgICAob3B0aW9ucy5pZ25vcmVPdmVyZmxvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobSBpbnN0YW5jZW9mIEZsb2F0UG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb25GaXhudW1zKHRvRml4bnVtKG0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YobSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbSA9IG1ha2VCaWdudW0obSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb25CaWdudW1zKG0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIC8vIF9pbnRlZ2VyTW9kdWxvOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlck1vZHVsbyA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtICUgbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuTW9kLmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBfaW50ZWdlckdjZDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJHY2QgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgdDtcbiAgICAgICAgICAgIHdoaWxlIChiICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdCA9IGE7XG4gICAgICAgICAgICAgICAgYSA9IGI7XG4gICAgICAgICAgICAgICAgYiA9IHQgJSBiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkdDRC5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gX2ludGVnZXJJc1plcm86IGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBudW1iZXIgaXMgemVyby5cbiAgICB2YXIgX2ludGVnZXJJc1plcm8gPSBtYWtlSW50ZWdlclVuT3AoXG4gICAgICAgIGZ1bmN0aW9uKG4pe1xuICAgICAgICAgICAgcmV0dXJuIG4gPT09IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkVxdWFscy5jYWxsKG4sIEJpZ0ludGVnZXIuWkVSTyk7XG4gICAgICAgIH1cbiAgICApO1xuXG5cbiAgICAvLyBfaW50ZWdlcklzT25lOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlcklzT25lID0gbWFrZUludGVnZXJVbk9wKFxuICAgICAgICBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gbiA9PT0gMTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIGJuRXF1YWxzLmNhbGwobiwgQmlnSW50ZWdlci5PTkUpO1xuICAgICAgICB9KTtcblxuXG5cbiAgICAvLyBfaW50ZWdlcklzTmVnYXRpdmVPbmU6IGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VySXNOZWdhdGl2ZU9uZSA9IG1ha2VJbnRlZ2VyVW5PcChcbiAgICAgICAgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIG4gPT09IC0xO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5FcXVhbHMuY2FsbChuLCBCaWdJbnRlZ2VyLk5FR0FUSVZFX09ORSk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgIC8vIF9pbnRlZ2VyQWRkOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlckFkZCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtICsgbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuQWRkLmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gX2ludGVnZXJTdWJ0cmFjdDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJTdWJ0cmFjdCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtIC0gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuU3VidHJhY3QuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBfaW50ZWdlck11bHRpcGx5OiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlck11bHRpcGx5ID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gKiBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5NdWx0aXBseS5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuICAgIC8vX2ludGVnZXJRdW90aWVudDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBpbnRlZ2VyLXNjaGVtZS1udW1iZXJcbiAgICB2YXIgX2ludGVnZXJRdW90aWVudCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiAoKG0gLSAobSAlIG4pKS8gbik7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkRpdmlkZS5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuICAgIHZhciBfaW50ZWdlclJlbWFpbmRlciA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtICUgbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuUmVtYWluZGVyLmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBfaW50ZWdlckRpdmlkZVRvRml4bnVtOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGZpeG51bVxuICAgIHZhciBfaW50ZWdlckRpdmlkZVRvRml4bnVtID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gLyBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9GaXhudW0obSkgLyB0b0ZpeG51bShuKTtcbiAgICAgICAgfSxcbiAgICAgICAge2lnbm9yZU92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cblxuICAgIC8vIF9pbnRlZ2VyRXF1YWxzOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJFcXVhbHMgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSA9PT0gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuRXF1YWxzLmNhbGwobSwgbik7XG4gICAgICAgIH0sXG4gICAgICAgIHtkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuICAgIC8vIF9pbnRlZ2VyR3JlYXRlclRoYW46IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlckdyZWF0ZXJUaGFuID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gPiBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5Db21wYXJlVG8uY2FsbChtLCBuKSA+IDA7XG4gICAgICAgIH0sXG4gICAgICAgIHtkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuICAgIC8vIF9pbnRlZ2VyTGVzc1RoYW46IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlckxlc3NUaGFuID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gPCBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5Db21wYXJlVG8uY2FsbChtLCBuKSA8IDA7XG4gICAgICAgIH0sXG4gICAgICAgIHtkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuICAgIC8vIF9pbnRlZ2VyR3JlYXRlclRoYW5PckVxdWFsOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJHcmVhdGVyVGhhbk9yRXF1YWwgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSA+PSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5Db21wYXJlVG8uY2FsbChtLCBuKSA+PSAwO1xuICAgICAgICB9LFxuICAgICAgICB7ZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cbiAgICAvLyBfaW50ZWdlckxlc3NUaGFuT3JFcXVhbDogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VyTGVzc1RoYW5PckVxdWFsID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gPD0gbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuQ29tcGFyZVRvLmNhbGwobSwgbikgPD0gMDtcbiAgICAgICAgfSxcbiAgICAgICAge2RvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBUaGUgYm94ZWQgbnVtYmVyIHR5cGVzIGFyZSBleHBlY3RlZCB0byBpbXBsZW1lbnQgdGhlIGZvbGxvd2luZ1xuICAgIC8vIGludGVyZmFjZS5cbiAgICAvL1xuICAgIC8vIHRvU3RyaW5nOiAtPiBzdHJpbmdcblxuICAgIC8vIGxldmVsOiBudW1iZXJcblxuICAgIC8vIGxpZnRUbzogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG5cbiAgICAvLyBpc0Zpbml0ZTogLT4gYm9vbGVhblxuXG4gICAgLy8gaXNJbnRlZ2VyOiAtPiBib29sZWFuXG4gICAgLy8gUHJvZHVjZSB0cnVlIGlmIHRoaXMgbnVtYmVyIGNhbiBiZSBjb2Vyc2VkIGludG8gYW4gaW50ZWdlci5cblxuICAgIC8vIGlzUmF0aW9uYWw6IC0+IGJvb2xlYW5cbiAgICAvLyBQcm9kdWNlIHRydWUgaWYgdGhlIG51bWJlciBpcyByYXRpb25hbC5cblxuICAgIC8vIGlzUmVhbDogLT4gYm9vbGVhblxuICAgIC8vIFByb2R1Y2UgdHJ1ZSBpZiB0aGUgbnVtYmVyIGlzIHJlYWwuXG5cbiAgICAvLyBpc0V4YWN0OiAtPiBib29sZWFuXG4gICAgLy8gUHJvZHVjZSB0cnVlIGlmIHRoZSBudW1iZXIgaXMgZXhhY3RcblxuICAgIC8vIHRvRXhhY3Q6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIGFuIGV4YWN0IG51bWJlci5cblxuICAgIC8vIHRvRml4bnVtOiAtPiBqYXZhc2NyaXB0LW51bWJlclxuICAgIC8vIFByb2R1Y2UgYSBqYXZhc2NyaXB0IG51bWJlci5cblxuICAgIC8vIGdyZWF0ZXJUaGFuOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBDb21wYXJlIGFnYWluc3QgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIGdyZWF0ZXJUaGFuT3JFcXVhbDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gQ29tcGFyZSBhZ2FpbnN0IGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBsZXNzVGhhbjogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gQ29tcGFyZSBhZ2FpbnN0IGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBsZXNzVGhhbk9yRXF1YWw6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIENvbXBhcmUgYWdhaW5zdCBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gYWRkOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBBZGQgd2l0aCBhbiBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gc3VidHJhY3Q6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFN1YnRyYWN0IHdpdGggYW4gaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIG11bHRpcGx5OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBNdWx0aXBseSB3aXRoIGFuIGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBkaXZpZGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIERpdmlkZSB3aXRoIGFuIGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBudW1lcmF0b3I6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBSZXR1cm4gdGhlIG51bWVyYXRvci5cblxuICAgIC8vIGRlbm9taW5hdG9yOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUmV0dXJuIHRoZSBkZW5vbWluYXRvci5cblxuICAgIC8vIGludGVnZXJTcXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgaW50ZWdlciBzcXVhcmUgcm9vdC5cblxuICAgIC8vIHNxcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBzcXVhcmUgcm9vdC5cblxuICAgIC8vIGFiczogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFic29sdXRlIHZhbHVlLlxuXG4gICAgLy8gZmxvb3I6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBmbG9vci5cblxuICAgIC8vIGNlaWxpbmc6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjZWlsaW5nLlxuXG4gICAgLy8gY29uanVnYXRlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY29uanVnYXRlLlxuXG4gICAgLy8gbWFnbml0dWRlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgbWFnbml0dWRlLlxuXG4gICAgLy8gbG9nOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgbG9nLlxuXG4gICAgLy8gYW5nbGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhbmdsZS5cblxuICAgIC8vIGF0YW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgdGFuZ2VudC5cblxuICAgIC8vIGNvczogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNvc2luZS5cblxuICAgIC8vIHNpbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHNpbmUuXG5cbiAgICAvLyBleHB0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBwb3dlciB0byB0aGUgaW5wdXQuXG5cbiAgICAvLyBleHA6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIGUgcmFpc2VkIHRvIHRoZSBnaXZlbiBwb3dlci5cblxuICAgIC8vIGFjb3M6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgY29zaW5lLlxuXG4gICAgLy8gYXNpbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyBzaW5lLlxuXG4gICAgLy8gaW1hZ2luYXJ5UGFydDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGltYWdpbmFyeSBwYXJ0XG5cbiAgICAvLyByZWFsUGFydDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHJlYWwgcGFydC5cblxuICAgIC8vIHJvdW5kOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUm91bmQgdG8gdGhlIG5lYXJlc3QgaW50ZWdlci5cblxuICAgIC8vIGVxdWFsczogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gUHJvZHVjZSB0cnVlIGlmIHRoZSBnaXZlbiBudW1iZXIgb2YgdGhlIHNhbWUgdHlwZSBpcyBlcXVhbC5cblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBSYXRpb25hbHNcblxuXG4gICAgdmFyIFJhdGlvbmFsID0gZnVuY3Rpb24obiwgZCkge1xuICAgICAgICB0aGlzLm4gPSBuO1xuICAgICAgICB0aGlzLmQgPSBkO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2ludGVnZXJJc09uZSh0aGlzLmQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uLnRvU3RyaW5nKCkgKyBcIlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubi50b1N0cmluZygpICsgXCIvXCIgKyB0aGlzLmQudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5sZXZlbCA9IDE7XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5saWZ0VG8gPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMilcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXRQb2ludChcbiAgICAgICAgICAgICAgICBfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSk7XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDMpXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbXBsZXgodGhpcywgMCk7XG4gICAgICAgIHJldHVybiB0aHJvd1J1bnRpbWVFcnJvcihcImludmFsaWQgbGV2ZWwgb2YgTnVtYmVyXCIsIHRoaXMsIHRhcmdldCk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc0Zpbml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAob3RoZXIgaW5zdGFuY2VvZiBSYXRpb25hbCAmJlxuICAgICAgICAgICAgICAgIF9pbnRlZ2VyRXF1YWxzKHRoaXMubiwgb3RoZXIubikgJiZcbiAgICAgICAgICAgICAgICBfaW50ZWdlckVxdWFscyh0aGlzLmQsIG90aGVyLmQpKTtcbiAgICB9O1xuXG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc0ludGVnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VySXNPbmUodGhpcy5kKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzUmF0aW9uYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc1JlYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoX2ludGVnZXJBZGQoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLmQpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShfaW50ZWdlclN1YnRyYWN0KF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLmQpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKC10aGlzLm4sIHRoaXMuZClcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIubiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLmQpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmIChfaW50ZWdlcklzWmVybyh0aGlzLmQpIHx8IF9pbnRlZ2VySXNaZXJvKG90aGVyLm4pKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIi86IGRpdmlzaW9uIGJ5IHplcm9cIiwgdGhpcywgb3RoZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSk7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnRvRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS50b0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMudG9GaXhudW0oKSk7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzRXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pc0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS50b0ZpeG51bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5udW1lcmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubjtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmRlbm9taW5hdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmQ7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlckdyZWF0ZXJUaGFuKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlckdyZWF0ZXJUaGFuT3JFcXVhbChfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJMZXNzVGhhbihfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJMZXNzVGhhbk9yRXF1YWwoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmludGVnZXJTcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBzcXJ0KHRoaXMpO1xuICAgICAgICBpZiAoaXNSYXRpb25hbChyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9FeGFjdChmbG9vcihyZXN1bHQpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1JlYWwocmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRvRXhhY3QoZmxvb3IocmVzdWx0KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UodG9FeGFjdChmbG9vcihyZWFsUGFydChyZXN1bHQpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9FeGFjdChmbG9vcihpbWFnaW5hcnlQYXJ0KHJlc3VsdCkpKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2ludGVnZXJHcmVhdGVyVGhhbk9yRXF1YWwodGhpcy5uLCAgMCkpIHtcbiAgICAgICAgICAgIHZhciBuZXdOID0gc3FydCh0aGlzLm4pO1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBzcXJ0KHRoaXMuZCk7XG4gICAgICAgICAgICBpZiAoZXF1YWxzKGZsb29yKG5ld04pLCBuZXdOKSAmJlxuICAgICAgICAgICAgICAgIGVxdWFscyhmbG9vcihuZXdEKSwgbmV3RCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKG5ld04sIG5ld0QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoX2ludGVnZXJEaXZpZGVUb0ZpeG51bShuZXdOLCBuZXdEKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbmV3TiA9IHNxcnQobmVnYXRlKHRoaXMubikpO1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBzcXJ0KHRoaXMuZCk7XG4gICAgICAgICAgICBpZiAoZXF1YWxzKGZsb29yKG5ld04pLCBuZXdOKSAmJlxuICAgICAgICAgICAgICAgIGVxdWFscyhmbG9vcihuZXdEKSwgbmV3RCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShuZXdOLCBuZXdEKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoX2ludGVnZXJEaXZpZGVUb0ZpeG51bShuZXdOLCBuZXdEKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShhYnModGhpcy5uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmQpO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5mbG9vciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcXVvdGllbnQgPSBfaW50ZWdlclF1b3RpZW50KHRoaXMubiwgdGhpcy5kKTtcbiAgICAgICAgaWYgKF9pbnRlZ2VyTGVzc1RoYW4odGhpcy5uLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1YnRyYWN0KHF1b3RpZW50LCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90aWVudDtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5jZWlsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBxdW90aWVudCA9IF9pbnRlZ2VyUXVvdGllbnQodGhpcy5uLCB0aGlzLmQpO1xuICAgICAgICBpZiAoX2ludGVnZXJMZXNzVGhhbih0aGlzLm4sIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gcXVvdGllbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYWRkKHF1b3RpZW50LCAxKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuY29uanVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubWFnbml0dWRlID0gUmF0aW9uYWwucHJvdG90eXBlLmFicztcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5sb2codGhpcy5uIC8gdGhpcy5kKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChfaW50ZWdlcklzWmVybyh0aGlzLm4pKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGlmIChfaW50ZWdlckdyZWF0ZXJUaGFuKHRoaXMubiwgMCkpXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQucGk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS50YW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC50YW4oX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmF0YW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hdGFuKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5jb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5jb3MoX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNpbihfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZXhwdCA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICBpZiAoaXNFeGFjdEludGVnZXIoYSkgJiYgZ3JlYXRlclRoYW5PckVxdWFsKGEsIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFzdEV4cHQodGhpcywgYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgucG93KF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJEaXZpZGVUb0ZpeG51bShhLm4sIGEuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmV4cCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmV4cChfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYWNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFjb3MoX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmFzaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hc2luKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5pbWFnaW5hcnlQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5yZWFsUGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBGSVhNRTogbm90IGNvcnJlY3Qgd2hlbiB2YWx1ZXMgYXJlIGJpZ251bXNcbiAgICAgICAgaWYgKGVxdWFscyh0aGlzLmQsIDIpKSB7XG4gICAgICAgICAgICAvLyBSb3VuZCB0byBldmVuIGlmIGl0J3MgYSBuLzJcbiAgICAgICAgICAgIHZhciB2ID0gX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCk7XG4gICAgICAgICAgICB2YXIgZmwgPSBNYXRoLmZsb29yKHYpO1xuICAgICAgICAgICAgdmFyIGNlID0gTWF0aC5jZWlsKHYpO1xuICAgICAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKGZsICUgMikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLm4gLyB0aGlzLmQpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwubWFrZUluc3RhbmNlID0gZnVuY3Rpb24obiwgZCkge1xuICAgICAgICBpZiAobiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJuIHVuZGVmaW5lZFwiLCBuLCBkKTtcblxuICAgICAgICBpZiAoZCA9PT0gdW5kZWZpbmVkKSB7IGQgPSAxOyB9XG5cbiAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKGQpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImRpdmlzaW9uIGJ5IHplcm86IFwiK24rXCIvXCIrZCk7XG4gICAgICAgIH1cblxuICBpZiAoX2ludGVnZXJMZXNzVGhhbihkLCAwKSkge1xuICAgICAgICAgICAgbiA9IG5lZ2F0ZShuKTtcbiAgICAgICAgICAgIGQgPSBuZWdhdGUoZCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGl2aXNvciA9IF9pbnRlZ2VyR2NkKGFicyhuKSwgYWJzKGQpKTtcbiAgICAgICAgbiA9IF9pbnRlZ2VyUXVvdGllbnQobiwgZGl2aXNvcik7XG4gICAgICAgIGQgPSBfaW50ZWdlclF1b3RpZW50KGQsIGRpdmlzb3IpO1xuXG4gICAgICAgIC8vIE9wdGltaXphdGlvbjogaWYgd2UgY2FuIGdldCBhcm91bmQgY29uc3RydWN0aW9uIHRoZSByYXRpb25hbFxuICAgICAgICAvLyBpbiBmYXZvciBvZiBqdXN0IHJldHVybmluZyBuLCBkbyBpdDpcbiAgICAgICAgaWYgKF9pbnRlZ2VySXNPbmUoZCkgfHwgX2ludGVnZXJJc1plcm8obikpIHtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBSYXRpb25hbChuLCBkKTtcbiAgICB9O1xuXG5cblxuICAgIC8vIEZsb2F0aW5nIFBvaW50IG51bWJlcnNcbiAgICB2YXIgRmxvYXRQb2ludCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdGhpcy5uID0gbjtcbiAgICB9O1xuICAgIEZsb2F0UG9pbnQgPSBGbG9hdFBvaW50O1xuXG5cbiAgICB2YXIgTmFOID0gbmV3IEZsb2F0UG9pbnQoTnVtYmVyLk5hTik7XG4gICAgdmFyIGluZiA9IG5ldyBGbG9hdFBvaW50KE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XG4gICAgdmFyIG5lZ2luZiA9IG5ldyBGbG9hdFBvaW50KE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7XG5cbiAgICAvLyBXZSB1c2UgdGhlc2UgdHdvIGNvbnN0YW50cyB0byByZXByZXNlbnQgdGhlIGZsb2F0aW5nLXBvaW50IGNvZXJzaW9uXG4gICAgLy8gb2YgYmlnbnVtcyB0aGF0IGNhbid0IGJlIHJlcHJlc2VudGVkIHdpdGggZmlkZWxpdHkuXG4gICAgdmFyIFRPT19QT1NJVElWRV9UT19SRVBSRVNFTlQgPSBuZXcgRmxvYXRQb2ludChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgIHZhciBUT09fTkVHQVRJVkVfVE9fUkVQUkVTRU5UID0gbmV3IEZsb2F0UG9pbnQoTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcblxuICAgIC8vIE5lZ2F0aXZlIHplcm8gaXMgYSBkaXN0aW5ndWlzaGVkIHZhbHVlIHJlcHJlc2VudGluZyAtMC4wLlxuICAgIC8vIFRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSBpbnN0YW5jZSBmb3IgLTAuMC5cbiAgICB2YXIgTkVHQVRJVkVfWkVSTyA9IG5ldyBGbG9hdFBvaW50KC0wLjApO1xuICAgIHZhciBJTkVYQUNUX1pFUk8gPSBuZXcgRmxvYXRQb2ludCgwLjApO1xuXG4gICAgRmxvYXRQb2ludC5waSA9IG5ldyBGbG9hdFBvaW50KE1hdGguUEkpO1xuICAgIEZsb2F0UG9pbnQuZSA9IG5ldyBGbG9hdFBvaW50KE1hdGguRSk7XG4gICAgRmxvYXRQb2ludC5uYW4gPSBOYU47XG4gICAgRmxvYXRQb2ludC5pbmYgPSBpbmY7XG4gICAgRmxvYXRQb2ludC5uZWdpbmYgPSBuZWdpbmY7XG5cbiAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGlzTmFOKG4pKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5uYW47XG4gICAgICAgIH0gZWxzZSBpZiAobiA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5pbmY7XG4gICAgICAgIH0gZWxzZSBpZiAobiA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5uZWdpbmY7XG4gICAgICAgIH0gZWxzZSBpZiAobiA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKCgxL24pID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTkVHQVRJVkVfWkVSTztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElORVhBQ1RfWkVSTztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEZsb2F0UG9pbnQobik7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNFeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc0Zpbml0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKGlzRmluaXRlKHRoaXMubikgfHxcbiAgICAgICAgICAgICAgICB0aGlzID09PSBUT09fUE9TSVRJVkVfVE9fUkVQUkVTRU5UIHx8XG4gICAgICAgICAgICAgICAgdGhpcyA9PT0gVE9PX05FR0FUSVZFX1RPX1JFUFJFU0VOVCk7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUudG9FeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBUaGUgcHJlY2lzaW9uIG9mIGllZWUgaXMgYWJvdXQgMTYgZGVjaW1hbCBkaWdpdHMsIHdoaWNoIHdlIHVzZSBoZXJlLlxuICAgICAgICBpZiAoISBpc0Zpbml0ZSh0aGlzLm4pIHx8IGlzTmFOKHRoaXMubikpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwidG9FeGFjdDogbm8gZXhhY3QgcmVwcmVzZW50YXRpb24gZm9yIFwiICsgdGhpcywgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3RyaW5nUmVwID0gdGhpcy5uLnRvU3RyaW5nKCk7XG4gICAgICAgIHZhciBtYXRjaCA9IHN0cmluZ1JlcC5tYXRjaCgvXiguKilcXC4oLiopJC8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnRQYXJ0ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgdmFyIGZyYWNQYXJ0ID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgdmFyIHRlblRvRGVjaW1hbFBsYWNlcyA9IE1hdGgucG93KDEwLCBtYXRjaFsyXS5sZW5ndGgpO1xuICAgICAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShNYXRoLnJvdW5kKHRoaXMubiAqIHRlblRvRGVjaW1hbFBsYWNlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlblRvRGVjaW1hbFBsYWNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnRvSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNJbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmxldmVsID0gMjtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubGlmdFRvID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDMpXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbXBsZXgodGhpcywgMCk7XG4gICAgICAgIHJldHVybiB0aHJvd1J1bnRpbWVFcnJvcihcImludmFsaWQgbGV2ZWwgb2YgTnVtYmVyXCIsIHRoaXMsIHRhcmdldCk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpc05hTih0aGlzLm4pKVxuICAgICAgICAgICAgcmV0dXJuIFwiK25hbi4wXCI7XG4gICAgICAgIGlmICh0aGlzLm4gPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgICAgICAgICAgIHJldHVybiBcIitpbmYuMFwiO1xuICAgICAgICBpZiAodGhpcy5uID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gICAgICAgICAgICByZXR1cm4gXCItaW5mLjBcIjtcbiAgICAgICAgaWYgKHRoaXMgPT09IE5FR0FUSVZFX1pFUk8pXG4gICAgICAgICAgICByZXR1cm4gXCItMC4wXCI7XG4gICAgICAgIHZhciBwYXJ0aWFsUmVzdWx0ID0gdGhpcy5uLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmICghIHBhcnRpYWxSZXN1bHQubWF0Y2goJ1xcXFwuJykpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0aWFsUmVzdWx0ICsgXCIuMFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRpYWxSZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlciwgYVVuaW9uRmluZCkge1xuICAgICAgICByZXR1cm4gKChvdGhlciBpbnN0YW5jZW9mIEZsb2F0UG9pbnQpICYmXG4gICAgICAgICAgICAgICAgKCh0aGlzLm4gPT09IG90aGVyLm4pKSk7XG4gICAgfTtcblxuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc1JhdGlvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRmluaXRlKCk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzSW50ZWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0Zpbml0ZSgpICYmIHRoaXMubiA9PT0gTWF0aC5mbG9vcih0aGlzLm4pO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc1JlYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuXG4gICAgLy8gc2lnbjogTnVtYmVyIC0+IHstMSwgMCwgMX1cbiAgICB2YXIgc2lnbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGxlc3NUaGFuKG4sIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAoZ3JlYXRlclRoYW4obiwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKG4gPT09IE5FR0FUSVZFX1pFUk8pIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNGaW5pdGUoKSAmJiBvdGhlci5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy5uICsgb3RoZXIubik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5uKSB8fCBpc05hTihvdGhlci5uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNGaW5pdGUoKSAmJiAhIG90aGVyLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3RoZXI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzRmluaXRlKCkgJiYgb3RoZXIuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKChzaWduKHRoaXMpICogc2lnbihvdGhlcikgPT09IDEpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgOiBOYU4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRmluaXRlKCkgJiYgb3RoZXIuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMubiAtIG90aGVyLm4pO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKHRoaXMubikgfHwgaXNOYU4ob3RoZXIubikpIHtcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgIH0gZWxzZSBpZiAoISB0aGlzLmlzRmluaXRlKCkgJiYgISBvdGhlci5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICBpZiAoc2lnbih0aGlzKSA9PT0gc2lnbihvdGhlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBtdWx0aXBseShvdGhlciwgLTEpO1xuICAgICAgICB9IGVsc2UgeyAgLy8gb3RoZXIuaXNGaW5pdGUoKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKC10aGlzLm4pO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLm4gKiBvdGhlci5uKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMubiAvIG90aGVyLm4pO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnRvRml4bnVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm47XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLm51bWVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RyaW5nUmVwID0gdGhpcy5uLnRvU3RyaW5nKCk7XG4gICAgICAgIHZhciBtYXRjaCA9IHN0cmluZ1JlcC5tYXRjaCgvXiguKilcXC4oLiopJC8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBhZnRlckRlY2ltYWwgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICB2YXIgZmFjdG9yVG9JbnQgPSBNYXRoLnBvdygxMCwgbWF0Y2hbMl0ubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciBleHRyYUZhY3RvciA9IF9pbnRlZ2VyR2NkKGZhY3RvclRvSW50LCBhZnRlckRlY2ltYWwpO1xuICAgICAgICAgICAgdmFyIG11bHRGYWN0b3IgPSBmYWN0b3JUb0ludCAvIGV4dHJhRmFjdG9yO1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKCBNYXRoLnJvdW5kKHRoaXMubiAqIG11bHRGYWN0b3IpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5kZW5vbWluYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RyaW5nUmVwID0gdGhpcy5uLnRvU3RyaW5nKCk7XG4gICAgICAgIHZhciBtYXRjaCA9IHN0cmluZ1JlcC5tYXRjaCgvXiguKilcXC4oLiopJC8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBhZnRlckRlY2ltYWwgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICB2YXIgZmFjdG9yVG9JbnQgPSBNYXRoLnBvdygxMCwgbWF0Y2hbMl0ubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciBleHRyYUZhY3RvciA9IF9pbnRlZ2VyR2NkKGZhY3RvclRvSW50LCBhZnRlckRlY2ltYWwpO1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKCBNYXRoLnJvdW5kKGZhY3RvclRvSW50L2V4dHJhRmFjdG9yKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZmxvb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZmxvb3IodGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmNlaWxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguY2VpbCh0aGlzLm4pKTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm4gPiBvdGhlci5uO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5uID49IG90aGVyLm47XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubiA8IG90aGVyLm47XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm4gPD0gb3RoZXIubjtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pbnRlZ2VyU3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcyA9PT0gTkVHQVRJVkVfWkVSTykgeyByZXR1cm4gdGhpczsgfVxuICAgICAgICBpZiAoaXNJbnRlZ2VyKHRoaXMpKSB7XG4gICAgICAgICAgICBpZih0aGlzLm4gPj0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmZsb29yKE1hdGguc3FydCh0aGlzLm4pKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAgICAgSU5FWEFDVF9aRVJPLFxuICAgICAgICAgICAgICAgICAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmZsb29yKE1hdGguc3FydCgtdGhpcy5uKSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiaW50ZWdlclNxcnQ6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gYW4gaW50ZWdlclwiLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm4gPCAwKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNxcnQoLXRoaXMubikpKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zcXJ0KHRoaXMubikpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hYnModGhpcy5uKSk7XG4gICAgfTtcblxuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5uIDwgMClcbiAgICAgICAgICAgIHJldHVybiAobmV3IENvbXBsZXgodGhpcywgMCkpLmxvZygpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5sb2codGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmFuZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKDAgPT09IHRoaXMubilcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBpZiAodGhpcy5uID4gMClcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5waTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUudGFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgudGFuKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hdGFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXRhbih0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguY29zKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5zaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zaW4odGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmV4cHQgPSBmdW5jdGlvbihhKXtcbiAgICAgICAgaWYgKHRoaXMubiA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKGEuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc05hTihhLm4pKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5wb3codGhpcy5uLCBhLm4pKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5leHAgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5leHAodGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmFjb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hY29zKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXNpbih0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaW1hZ2luYXJ5UGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5yZWFsUGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnJvdW5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKGlzRmluaXRlKHRoaXMubikpIHtcbiAgICAgICAgICAgIGlmICh0aGlzID09PSBORUdBVElWRV9aRVJPKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoTWF0aC5mbG9vcih0aGlzLm4pIC0gdGhpcy5uKSA9PT0gMC41KSB7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguZmxvb3IodGhpcy5uKSAlIDIgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmZsb29yKHRoaXMubikpO1xuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmNlaWwodGhpcy5uKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnJvdW5kKHRoaXMubikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLm1hZ25pdHVkZSA9IEZsb2F0UG9pbnQucHJvdG90eXBlLmFicztcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29tcGxleCBudW1iZXJzXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIENvbXBsZXggPSBmdW5jdGlvbihyLCBpKXtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5pID0gaTtcbiAgICB9O1xuXG4gICAgLy8gQ29uc3RydWN0cyBhIGNvbXBsZXggbnVtYmVyIGZyb20gdHdvIGJhc2ljIG51bWJlciByIGFuZCBpLiAgciBhbmQgaSBjYW5cbiAgICAvLyBlaXRoZXIgYmUgcGx0LnR5cGUuUmF0aW9uYWwgb3IgcGx0LnR5cGUuRmxvYXRQb2ludC5cbiAgICBDb21wbGV4Lm1ha2VJbnN0YW5jZSA9IGZ1bmN0aW9uKHIsIGkpe1xuICAgICAgICBpZiAoaSA9PT0gdW5kZWZpbmVkKSB7IGkgPSAwOyB9XG4gICAgICAgIGlmIChpc0V4YWN0KGkpICYmIGlzSW50ZWdlcihpKSAmJiBfaW50ZWdlcklzWmVybyhpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzSW5leGFjdChyKSB8fCBpc0luZXhhY3QoaSkpIHtcbiAgICAgICAgICAgIHIgPSB0b0luZXhhY3Qocik7XG4gICAgICAgICAgICBpID0gdG9JbmV4YWN0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQ29tcGxleChyLCBpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlYWxQYXJ0ID0gdGhpcy5yLnRvU3RyaW5nKCksIGltYWdQYXJ0ID0gdGhpcy5pLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmIChpbWFnUGFydFswXSA9PT0gJy0nIHx8IGltYWdQYXJ0WzBdID09PSAnKycpIHtcbiAgICAgICAgICAgIHJldHVybiByZWFsUGFydCArIGltYWdQYXJ0ICsgJ2knO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWxQYXJ0ICsgXCIrXCIgKyBpbWFnUGFydCArICdpJztcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzRmluaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc1NjaGVtZU51bWJlckZpbml0ZSh0aGlzLnIpICYmIGlzU2NoZW1lTnVtYmVyRmluaXRlKHRoaXMuaSk7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNSYXRpb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNSYXRpb25hbCh0aGlzLnIpICYmIGVxdih0aGlzLmksIDApO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc0ludGVnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChpc0ludGVnZXIodGhpcy5yKSAmJlxuICAgICAgICAgICAgICAgIGVxdih0aGlzLmksIDApKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUudG9FeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoIHRvRXhhY3QodGhpcy5yKSwgdG9FeGFjdCh0aGlzLmkpICk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnRvSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UodG9JbmV4YWN0KHRoaXMuciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b0luZXhhY3QodGhpcy5pKSk7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNFeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNFeGFjdCh0aGlzLnIpICYmIGlzRXhhY3QodGhpcy5pKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzSW5leGFjdCh0aGlzLnIpIHx8IGlzSW5leGFjdCh0aGlzLmkpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmxldmVsID0gMztcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubGlmdFRvID0gZnVuY3Rpb24odGFyZ2V0KXtcbiAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJEb24ndCBrbm93IGhvdyB0byBsaWZ0IENvbXBsZXggbnVtYmVyXCIsIHRoaXMsIHRhcmdldCk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAoKG90aGVyIGluc3RhbmNlb2YgQ29tcGxleCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAoZXF1YWxzKHRoaXMuciwgb3RoZXIucikpICYmXG4gICAgICAgICAgICAgICAgICAgICAgKGVxdWFscyh0aGlzLmksIG90aGVyLmkpKSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICghIHRoaXMuaXNSZWFsKCkgfHwgISBvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI+OiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcywgb3RoZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBncmVhdGVyVGhhbih0aGlzLnIsIG90aGVyLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAoISB0aGlzLmlzUmVhbCgpIHx8ICEgb3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPj06IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzLCBvdGhlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdyZWF0ZXJUaGFuT3JFcXVhbCh0aGlzLnIsIG90aGVyLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICghIHRoaXMuaXNSZWFsKCkgfHwgISBvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI8OiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcywgb3RoZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZXNzVGhhbih0aGlzLnIsIG90aGVyLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAoISB0aGlzLmlzUmVhbCgpIHx8ICEgb3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPD06IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzLCBvdGhlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlc3NUaGFuT3JFcXVhbCh0aGlzLnIsIG90aGVyLnIpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghZXF1YWxzKHRoaXMuaSwgMCkudmFsdWVPZigpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJhYnM6IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGFicyh0aGlzLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS50b0ZpeG51bSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghZXF1YWxzKHRoaXMuaSwgMCkudmFsdWVPZigpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJ0b0ZpeG51bTogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdG9GaXhudW0odGhpcy5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubnVtZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwibnVtZXJhdG9yOiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gbnVtZXJhdG9yKHRoaXMubik7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZGVub21pbmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJmbG9vcjogY2FuIG9ubHkgYmUgYXBwbGllZCB0byByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGRlbm9taW5hdG9yKHRoaXMubik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG90aGVyKXtcbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgYWRkKHRoaXMuciwgb3RoZXIuciksXG4gICAgICAgICAgICBhZGQodGhpcy5pLCBvdGhlci5pKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3RoZXIpe1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICBzdWJ0cmFjdCh0aGlzLnIsIG90aGVyLnIpLFxuICAgICAgICAgICAgc3VidHJhY3QodGhpcy5pLCBvdGhlci5pKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UobmVnYXRlKHRoaXMuciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWdhdGUodGhpcy5pKSk7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgICAgIC8vIElmIHRoZSBvdGhlciB2YWx1ZSBpcyByZWFsLCBqdXN0IGRvIHByaW1pdGl2ZSBkaXZpc2lvblxuICAgICAgICBpZiAob3RoZXIuaXNSZWFsKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICBtdWx0aXBseSh0aGlzLnIsIG90aGVyLnIpLFxuICAgICAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuaSwgb3RoZXIucikpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gc3VidHJhY3QoXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLnIsIG90aGVyLnIpLFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5pLCBvdGhlci5pKSk7XG4gICAgICAgIHZhciBpID0gYWRkKFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5yLCBvdGhlci5pKSxcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuaSwgb3RoZXIucikpO1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UociwgaSk7XG4gICAgfTtcblxuXG5cblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24ob3RoZXIpe1xuICAgICAgICB2YXIgYSwgYiwgYywgZCwgciwgeCwgeTtcbiAgICAgICAgLy8gSWYgdGhlIG90aGVyIHZhbHVlIGlzIHJlYWwsIGp1c3QgZG8gcHJpbWl0aXZlIGRpdmlzaW9uXG4gICAgICAgIGlmIChvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgIGRpdmlkZSh0aGlzLnIsIG90aGVyLnIpLFxuICAgICAgICAgICAgICAgIGRpdmlkZSh0aGlzLmksIG90aGVyLnIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSW5leGFjdCgpIHx8IG90aGVyLmlzSW5leGFjdCgpKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vcG9ydGFsLmFjbS5vcmcvY2l0YXRpb24uY2ZtP2lkPTEwMzk4MTRcbiAgICAgICAgICAgIC8vIFdlIGN1cnJlbnRseSB1c2UgU21pdGgncyBtZXRob2QsIHRob3VnaCB3ZSBzaG91bGRcbiAgICAgICAgICAgIC8vIHByb2JhYmx5IHN3aXRjaCBvdmVyIHRvIFByaWVzdCdzIG1ldGhvZC5cbiAgICAgICAgICAgIGEgPSB0aGlzLnI7XG4gICAgICAgICAgICBiID0gdGhpcy5pO1xuICAgICAgICAgICAgYyA9IG90aGVyLnI7XG4gICAgICAgICAgICBkID0gb3RoZXIuaTtcbiAgICAgICAgICAgIGlmIChsZXNzVGhhbk9yRXF1YWwoYWJzKGQpLCBhYnMoYykpKSB7XG4gICAgICAgICAgICAgICAgciA9IGRpdmlkZShkLCBjKTtcbiAgICAgICAgICAgICAgICB4ID0gZGl2aWRlKGFkZChhLCBtdWx0aXBseShiLCByKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQoYywgbXVsdGlwbHkoZCwgcikpKTtcbiAgICAgICAgICAgICAgICB5ID0gZGl2aWRlKHN1YnRyYWN0KGIsIG11bHRpcGx5KGEsIHIpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZChjLCBtdWx0aXBseShkLCByKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByID0gZGl2aWRlKGMsIGQpO1xuICAgICAgICAgICAgICAgIHggPSBkaXZpZGUoYWRkKG11bHRpcGx5KGEsIHIpLCBiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZChtdWx0aXBseShjLCByKSwgZCkpO1xuICAgICAgICAgICAgICAgIHkgPSBkaXZpZGUoc3VidHJhY3QobXVsdGlwbHkoYiwgciksIGEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkKG11bHRpcGx5KGMsIHIpLCBkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoeCwgeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgY29uID0gY29uanVnYXRlKG90aGVyKTtcbiAgICAgICAgICAgIHZhciB1cCA9IG11bHRpcGx5KHRoaXMsIGNvbik7XG5cbiAgICAgICAgICAgIC8vIERvd24gaXMgZ3VhcmFudGVlZCB0byBiZSByZWFsIGJ5IHRoaXMgcG9pbnQuXG4gICAgICAgICAgICB2YXIgZG93biA9IHJlYWxQYXJ0KG11bHRpcGx5KG90aGVyLCBjb24pKTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgIGRpdmlkZShyZWFsUGFydCh1cCksIGRvd24pLFxuICAgICAgICAgICAgICAgIGRpdmlkZShpbWFnaW5hcnlQYXJ0KHVwKSwgZG93bikpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICB0aGlzLnIsXG4gICAgICAgICAgICBzdWJ0cmFjdCgwLCB0aGlzLmkpKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5tYWduaXR1ZGUgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc3VtID0gYWRkKFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5yLCB0aGlzLnIpLFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5pLCB0aGlzLmkpKTtcbiAgICAgICAgcmV0dXJuIHNxcnQoc3VtKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNSZWFsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGVxdih0aGlzLmksIDApO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pbnRlZ2VyU3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNJbnRlZ2VyKHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaW50ZWdlclNxcnQodGhpcy5yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiaW50ZWdlclNxcnQ6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gYW4gaW50ZWdlclwiLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICByZXR1cm4gc3FydCh0aGlzLnIpO1xuICAgICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NxdWFyZV9yb290I1NxdWFyZV9yb290c19vZl9uZWdhdGl2ZV9hbmRfY29tcGxleF9udW1iZXJzXG4gICAgICAgIHZhciByX3BsdXNfeCA9IGFkZCh0aGlzLm1hZ25pdHVkZSgpLCB0aGlzLnIpO1xuXG4gICAgICAgIHZhciByID0gc3FydChoYWx2ZShyX3BsdXNfeCkpO1xuXG4gICAgICAgIHZhciBpID0gZGl2aWRlKHRoaXMuaSwgc3FydChtdWx0aXBseShyX3BsdXNfeCwgMikpKTtcblxuXG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShyLCBpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG0gPSB0aGlzLm1hZ25pdHVkZSgpO1xuICAgICAgICB2YXIgdGhldGEgPSB0aGlzLmFuZ2xlKCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBhZGQoXG4gICAgICAgICAgICBsb2cobSksXG4gICAgICAgICAgICB0aW1lc0kodGhldGEpKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYW5nbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFuZ2xlKHRoaXMucik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVxdWFscygwLCB0aGlzLnIpKSB7XG4gICAgICAgICAgICB2YXIgdG1wID0gaGFsdmUoRmxvYXRQb2ludC5waSk7XG4gICAgICAgICAgICByZXR1cm4gZ3JlYXRlclRoYW4odGhpcy5pLCAwKSA/XG4gICAgICAgICAgICAgICAgdG1wIDogbmVnYXRlKHRtcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdG1wID0gYXRhbihkaXZpZGUoYWJzKHRoaXMuaSksIGFicyh0aGlzLnIpKSk7XG4gICAgICAgICAgICBpZiAoZ3JlYXRlclRoYW4odGhpcy5yLCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBncmVhdGVyVGhhbih0aGlzLmksIDApID9cbiAgICAgICAgICAgICAgICAgICAgdG1wIDogbmVnYXRlKHRtcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBncmVhdGVyVGhhbih0aGlzLmksIDApID9cbiAgICAgICAgICAgICAgICAgICAgc3VidHJhY3QoRmxvYXRQb2ludC5waSwgdG1wKSA6IHN1YnRyYWN0KHRtcCwgRmxvYXRQb2ludC5waSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHBsdXNJID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoMCwgMSk7XG4gICAgdmFyIG1pbnVzSSA9IENvbXBsZXgubWFrZUluc3RhbmNlKDAsIC0xKTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUudGFuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkaXZpZGUodGhpcy5zaW4oKSwgdGhpcy5jb3MoKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmF0YW4gPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoZXF1YWxzKHRoaXMsIHBsdXNJKSB8fFxuICAgICAgICAgICAgZXF1YWxzKHRoaXMsIG1pbnVzSSkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZWdpbmY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG11bHRpcGx5KFxuICAgICAgICAgICAgcGx1c0ksXG4gICAgICAgICAgICBtdWx0aXBseShcbiAgICAgICAgICAgICAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSgwLjUpLFxuICAgICAgICAgICAgICAgIGxvZyhkaXZpZGUoXG4gICAgICAgICAgICAgICAgICAgIGFkZChwbHVzSSwgdGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGFkZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdXNJLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VidHJhY3QoMCwgdGhpcykpKSkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICByZXR1cm4gY29zKHRoaXMucik7XG4gICAgICAgIHZhciBpeiA9IHRpbWVzSSh0aGlzKTtcbiAgICAgICAgdmFyIGl6X25lZ2F0ZSA9IG5lZ2F0ZShpeik7XG5cbiAgICAgICAgcmV0dXJuIGhhbHZlKGFkZChleHAoaXopLCBleHAoaXpfbmVnYXRlKSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5zaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHJldHVybiBzaW4odGhpcy5yKTtcbiAgICAgICAgdmFyIGl6ID0gdGltZXNJKHRoaXMpO1xuICAgICAgICB2YXIgaXpfbmVnYXRlID0gbmVnYXRlKGl6KTtcbiAgICAgICAgdmFyIHoyID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoMCwgMik7XG4gICAgICAgIHZhciBleHBfbmVnYXRlID0gc3VidHJhY3QoZXhwKGl6KSwgZXhwKGl6X25lZ2F0ZSkpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gZGl2aWRlKGV4cF9uZWdhdGUsIHoyKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5leHB0ID0gZnVuY3Rpb24oeSl7XG4gICAgICAgIGlmIChpc0V4YWN0SW50ZWdlcih5KSAmJiBncmVhdGVyVGhhbk9yRXF1YWwoeSwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYXN0RXhwdCh0aGlzLCB5KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZXhwbyA9IG11bHRpcGx5KHksIHRoaXMubG9nKCkpO1xuICAgICAgICByZXR1cm4gZXhwKGV4cG8pO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5leHAgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgciA9IGV4cCh0aGlzLnIpO1xuICAgICAgICB2YXIgY29zX2EgPSBjb3ModGhpcy5pKTtcbiAgICAgICAgdmFyIHNpbl9hID0gc2luKHRoaXMuaSk7XG5cbiAgICAgICAgcmV0dXJuIG11bHRpcGx5KFxuICAgICAgICAgICAgcixcbiAgICAgICAgICAgIGFkZChjb3NfYSwgdGltZXNJKHNpbl9hKSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICByZXR1cm4gYWNvcyh0aGlzLnIpO1xuICAgICAgICB2YXIgcGlfaGFsZiA9IGhhbHZlKEZsb2F0UG9pbnQucGkpO1xuICAgICAgICB2YXIgaXogPSB0aW1lc0kodGhpcyk7XG4gICAgICAgIHZhciByb290ID0gc3FydChzdWJ0cmFjdCgxLCBzcXIodGhpcykpKTtcbiAgICAgICAgdmFyIGwgPSB0aW1lc0kobG9nKGFkZChpeiwgcm9vdCkpKTtcbiAgICAgICAgcmV0dXJuIGFkZChwaV9oYWxmLCBsKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYXNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgcmV0dXJuIGFzaW4odGhpcy5yKTtcblxuICAgICAgICB2YXIgb25lTmVnYXRlVGhpc1NxID1cbiAgICAgICAgICAgIHN1YnRyYWN0KDEsIHNxcih0aGlzKSk7XG4gICAgICAgIHZhciBzcXJ0T25lTmVnYXRlVGhpc1NxID0gc3FydChvbmVOZWdhdGVUaGlzU3EpO1xuICAgICAgICByZXR1cm4gbXVsdGlwbHkoMiwgYXRhbihkaXZpZGUodGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZCgxLCBzcXJ0T25lTmVnYXRlVGhpc1NxKSkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuY2VpbGluZyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiY2VpbGluZzogY2FuIG9ubHkgYmUgYXBwbGllZCB0byByZWFsIG51bWJlclwiLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGNlaWxpbmcodGhpcy5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZmxvb3IgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImZsb29yOiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gZmxvb3IodGhpcy5yKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaW1hZ2luYXJ5UGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnJlYWxQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucjtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUucm91bmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcInJvdW5kOiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gcm91bmQodGhpcy5yKTtcbiAgICB9O1xuXG5cblxuICAgIHZhciBoYXNoTW9kaWZpZXJzUmVnZXhwID0gbmV3IFJlZ0V4cChcIl4oI1tlaV0jW2JvZHhdfCNbYm9keF0jW2VpXXwjW2JvZHhlaV0pKC4qKSRcIilcbiAgICBmdW5jdGlvbiByYXRpb25hbFJlZ2V4cChkaWdpdHMpIHsgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKFsrLV0/W1wiK2RpZ2l0cytcIl0rKS8oW1wiK2RpZ2l0cytcIl0rKSRcIik7IH1cbiAgICBmdW5jdGlvbiBtYXRjaENvbXBsZXhSZWdleHAocmFkaXgsIHgpIHtcbiAgICAgICAgdmFyIHNpZ24gPSBcIlsrLV1cIjtcbiAgICAgICAgdmFyIG1heWJlU2lnbiA9IFwiWystXT9cIjtcbiAgICAgICAgdmFyIGRpZ2l0cyA9IGRpZ2l0c0ZvclJhZGl4KHJhZGl4KVxuICAgICAgICB2YXIgZXhwbWFyayA9IFwiW1wiK2V4cE1hcmtGb3JSYWRpeChyYWRpeCkrXCJdXCJcbiAgICAgICAgdmFyIGRpZ2l0U2VxdWVuY2UgPSBcIltcIitkaWdpdHMrXCJdK1wiXG5cbiAgICAgICAgdmFyIHVuc2lnbmVkUmF0aW9uYWwgPSBkaWdpdFNlcXVlbmNlK1wiL1wiK2RpZ2l0U2VxdWVuY2VcbiAgICAgICAgdmFyIHJhdGlvbmFsID0gbWF5YmVTaWduICsgdW5zaWduZWRSYXRpb25hbFxuXG4gICAgICAgIHZhciBub0RlY2ltYWwgPSBkaWdpdFNlcXVlbmNlXG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25SaWdodCA9IFwiW1wiK2RpZ2l0cytcIl0qXFxcXC5bXCIrZGlnaXRzK1wiXStcIlxuICAgICAgICB2YXIgZGVjaW1hbE51bU9uTGVmdCA9IFwiW1wiK2RpZ2l0cytcIl0rXFxcXC5bXCIrZGlnaXRzK1wiXSpcIlxuXG4gICAgICAgIHZhciB1bnNpZ25lZERlY2ltYWwgPSBcIig/OlwiICsgbm9EZWNpbWFsICsgXCJ8XCIgKyBkZWNpbWFsTnVtT25SaWdodCArIFwifFwiICsgZGVjaW1hbE51bU9uTGVmdCArIFwiKVwiXG5cbiAgICAgICAgdmFyIHNwZWNpYWwgPSBcIig/OmluZlxcLjB8bmFuXFwuMHxpbmZcXC5mfG5hblxcLmYpXCJcblxuICAgICAgICB2YXIgdW5zaWduZWRSZWFsTm9FeHAgPSBcIig/OlwiICsgdW5zaWduZWREZWNpbWFsICsgXCJ8XCIgKyB1bnNpZ25lZFJhdGlvbmFsICsgXCIpXCJcbiAgICAgICAgdmFyIHVuc2lnbmVkUmVhbCA9IHVuc2lnbmVkUmVhbE5vRXhwICsgXCIoPzpcIiArIGV4cG1hcmsgKyBtYXliZVNpZ24gKyBkaWdpdFNlcXVlbmNlICsgXCIpP1wiXG4gICAgICAgIHZhciB1bnNpZ25lZFJlYWxPclNwZWNpYWwgPSBcIig/OlwiICsgdW5zaWduZWRSZWFsICsgXCJ8XCIgKyBzcGVjaWFsICsgXCIpXCJcbiAgICAgICAgdmFyIHJlYWwgPSBcIig/OlwiICsgbWF5YmVTaWduICsgdW5zaWduZWRSZWFsICsgXCJ8XCIgKyBzaWduICsgc3BlY2lhbCArIFwiKVwiXG5cbiAgICAgICAgdmFyIGFsdDEgPSBuZXcgUmVnRXhwKFwiXihcIiArIHJhdGlvbmFsICsgXCIpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIihcIiArIHNpZ24gKyB1bnNpZ25lZFJhdGlvbmFsICsgXCI/KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCJpJFwiKTtcbiAgICAgICAgdmFyIGFsdDIgPSBuZXcgUmVnRXhwKFwiXihcIiArIHJlYWwgKyBcIik/XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIihcIiArIHNpZ24gKyB1bnNpZ25lZFJlYWxPclNwZWNpYWwgKyBcIj8pXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcImkkXCIpO1xuICAgICAgICB2YXIgYWx0MyA9IG5ldyBSZWdFeHAoXCJeKFwiICsgcmVhbCArIFwiKUAoXCIgKyByZWFsICsgXCIpJFwiKTtcblxuICAgICAgICB2YXIgbWF0Y2gxID0geC5tYXRjaChhbHQxKVxuICAgICAgICB2YXIgbWF0Y2gyID0geC5tYXRjaChhbHQyKVxuICAgICAgICB2YXIgbWF0Y2gzID0geC5tYXRjaChhbHQzKVxuXG4gICAgICAgIHJldHVybiBtYXRjaDEgPyBtYXRjaDEgOlxuICAgICAgICAgICAgICAgbWF0Y2gyID8gbWF0Y2gyIDpcbiAgICAgICAgICAgICAgIG1hdGNoMyA/IG1hdGNoMyA6XG4gICAgICAgICAgICAgLyogZWxzZSAqLyBmYWxzZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpZ2l0UmVnZXhwKGRpZ2l0cykgeyByZXR1cm4gbmV3IFJlZ0V4cChcIl5bKy1dP1tcIitkaWdpdHMrXCJdKyRcIik7IH1cbiAgICAvKipcbiAgICAvKiBOQjogISEhISBmbG9udW0gcmVnZXhwIG9ubHkgbWF0Y2hlcyBcIlguXCIsIFwiLlhcIiwgb3IgXCJYLlhcIiwgTk9UIFwiWFwiLCB0aGlzXG4gICAgLyogbXVzdCBiZSBzZXBhcmF0ZWx5IGNoZWNrZWQgd2l0aCBkaWdpdFJlZ2V4cC5cbiAgICAvKiBJIGtub3cgdGhpcyBzZWVtcyBkdW1iLCBidXQgdGhlIGFsdGVybmF0aXZlIHdvdWxkIGJlIHRoYXQgdGhpcyByZWdleHBcbiAgICAvKiByZXR1cm5zIHNpeCBtYXRjaGVzLCB3aGljaCBhbHNvIHNlZW1zIGR1bWIuXG4gICAgLyoqKi9cbiAgICBmdW5jdGlvbiBmbG9udW1SZWdleHAoZGlnaXRzKSB7XG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25SaWdodCA9IFwiKFtcIitkaWdpdHMrXCJdKilcXFxcLihbXCIrZGlnaXRzK1wiXSspXCJcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PbkxlZnQgPSBcIihbXCIrZGlnaXRzK1wiXSspXFxcXC4oW1wiK2RpZ2l0cytcIl0qKVwiXG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKFwiXig/OihbKy1dPykoXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFsTnVtT25SaWdodCtcInxcIitkZWNpbWFsTnVtT25MZWZ0ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIpKSRcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNjaWVudGlmaWNQYXR0ZXJuKGRpZ2l0cywgZXhwX21hcmspIHtcbiAgICAgICAgdmFyIG5vRGVjaW1hbCA9IFwiW1wiK2RpZ2l0cytcIl0rXCJcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PblJpZ2h0ID0gXCJbXCIrZGlnaXRzK1wiXSpcXFxcLltcIitkaWdpdHMrXCJdK1wiXG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25MZWZ0ID0gXCJbXCIrZGlnaXRzK1wiXStcXFxcLltcIitkaWdpdHMrXCJdKlwiXG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKFwiXig/OihbKy1dP1wiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIoPzpcIitub0RlY2ltYWwrXCJ8XCIrZGVjaW1hbE51bU9uUmlnaHQrXCJ8XCIrZGVjaW1hbE51bU9uTGVmdCtcIilcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiKVtcIitleHBfbWFyaytcIl0oWystXT9bXCIrZGlnaXRzK1wiXSspKSRcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlnaXRzRm9yUmFkaXgocmFkaXgpIHtcbiAgICAgICAgcmV0dXJuIHJhZGl4ID09PSAyICA/IFwiMDFcIiA6XG4gICAgICAgICAgICAgICByYWRpeCA9PT0gOCAgPyBcIjAtN1wiIDpcbiAgICAgICAgICAgICAgIHJhZGl4ID09PSAxMCA/IFwiMC05XCIgOlxuICAgICAgICAgICAgICAgcmFkaXggPT09IDE2ID8gXCIwLTlhLWZBLUZcIiA6XG4gICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImRpZ2l0c0ZvclJhZGl4OiBpbnZhbGlkIHJhZGl4XCIsIHRoaXMsIHJhZGl4KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cE1hcmtGb3JSYWRpeChyYWRpeCkge1xuICAgICAgICByZXR1cm4gKHJhZGl4ID09PSAyIHx8IHJhZGl4ID09PSA4IHx8IHJhZGl4ID09PSAxMCkgPyBcImRlZnNsXCIgOlxuICAgICAgICAgICAgICAgKHJhZGl4ID09PSAxNikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInNsXCIgOlxuICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJleHBNYXJrRm9yUmFkaXg6IGludmFsaWQgcmFkaXhcIiwgdGhpcywgcmFkaXgpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gRXhhY3RuZXNzKGkpIHtcbiAgICAgIHRoaXMuZGVmYXVsdHAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBpID09IDA7IH1cbiAgICAgIHRoaXMuZXhhY3RwID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaSA9PSAxOyB9XG4gICAgICB0aGlzLmluZXhhY3RwID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaSA9PSAyOyB9XG4gICAgfVxuXG4gICAgRXhhY3RuZXNzLmRlZiA9IG5ldyBFeGFjdG5lc3MoMCk7XG4gICAgRXhhY3RuZXNzLm9uID0gbmV3IEV4YWN0bmVzcygxKTtcbiAgICBFeGFjdG5lc3Mub2ZmID0gbmV3IEV4YWN0bmVzcygyKTtcblxuICAgIEV4YWN0bmVzcy5wcm90b3R5cGUuaW50QXNFeGFjdHAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmRlZmF1bHRwKCkgfHwgdGhpcy5leGFjdHAoKTsgfTtcbiAgICBFeGFjdG5lc3MucHJvdG90eXBlLmZsb2F0QXNJbmV4YWN0cCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHAoKSB8fCB0aGlzLmluZXhhY3RwKCk7IH07XG5cblxuICAgIC8vIGZyb21TdHJpbmc6IHN0cmluZyBib29sZWFuIC0+IChzY2hlbWUtbnVtYmVyIHwgZmFsc2UpXG4gICAgdmFyIGZyb21TdHJpbmcgPSBmdW5jdGlvbih4LCBleGFjdG5lc3MpIHtcbiAgICAgICAgdmFyIHJhZGl4ID0gMTBcbiAgICAgICAgdmFyIGV4YWN0bmVzcyA9IHR5cGVvZiBleGFjdG5lc3MgPT09ICd1bmRlZmluZWQnID8gRXhhY3RuZXNzLmRlZiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdG5lc3MgPT09IHRydWUgICAgICAgICAgICAgICA/IEV4YWN0bmVzcy5vbiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdG5lc3MgPT09IGZhbHNlICAgICAgICAgICAgICA/IEV4YWN0bmVzcy5vZmYgOlxuICAgICAgICAgICAvKiBlbHNlICovICB0aHJvd1J1bnRpbWVFcnJvciggXCJleGFjdG5lc3MgbXVzdCBiZSB0cnVlIG9yIGZhbHNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHIpIDtcblxuICAgICAgICB2YXIgaE1hdGNoID0geC50b0xvd2VyQ2FzZSgpLm1hdGNoKGhhc2hNb2RpZmllcnNSZWdleHApXG4gICAgICAgIGlmIChoTWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBtb2RpZmllclN0cmluZyA9IGhNYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICB2YXIgZXhhY3RGbGFnID0gbW9kaWZpZXJTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChcIigjW2VpXSlcIikpXG4gICAgICAgICAgICB2YXIgcmFkaXhGbGFnID0gbW9kaWZpZXJTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChcIigjW2JvZHhdKVwiKSlcblxuICAgICAgICAgICAgaWYgKGV4YWN0RmxhZykge1xuICAgICAgICAgICAgICAgIHZhciBmID0gZXhhY3RGbGFnWzFdLmNoYXJBdCgxKVxuICAgICAgICAgICAgICAgIGV4YWN0bmVzcyA9IGYgPT09ICdlJyA/IEV4YWN0bmVzcy5vbiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZiA9PT0gJ2knID8gRXhhY3RuZXNzLm9mZiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBjYXNlIGlzIHVucmVhY2hhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJpbnZhbGlkIGV4YWN0bmVzcyBmbGFnXCIsIHRoaXMsIHIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmFkaXhGbGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSByYWRpeEZsYWdbMV0uY2hhckF0KDEpXG4gICAgICAgICAgICAgICAgcmFkaXggPSBmID09PSAnYicgPyAyIDpcbiAgICAgICAgICAgIGYgPT09ICdvJyA/IDggOlxuICAgICAgICAgICAgZiA9PT0gJ2QnID8gMTAgOlxuICAgICAgICAgICAgZiA9PT0gJ3gnID8gMTYgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FzZSBpcyB1bnJlYWNoYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJpbnZhbGlkIHJhZGl4IGZsYWdcIiwgdGhpcywgcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBudW1iZXJTdHJpbmcgPSBoTWF0Y2ggPyBoTWF0Y2hbMl0gOiB4XG4gICAgICAgIC8vIGlmIHRoZSBzdHJpbmcgYmVnaW5zIHdpdGggYSBoYXNoIG1vZGlmaWVyLCB0aGVuIGl0IG11c3QgcGFyc2UgYXMgYVxuICAgICAgICAvLyBudW1iZXIsIGFuIGludmFsaWQgcGFyc2UgaXMgYW4gZXJyb3IsIG5vdCBmYWxzZS4gRmFsc2UgaXMgcmV0dXJuZWRcbiAgICAgICAgLy8gd2hlbiB0aGUgaXRlbSBjb3VsZCBwb3RlbnRpYWxseSBoYXZlIGJlZW4gcmVhZCBhcyBhIHN5bWJvbC5cbiAgICAgICAgdmFyIG11c3RCZUFOdW1iZXJwID0gaE1hdGNoID8gdHJ1ZSA6IGZhbHNlXG5cbiAgICAgICAgcmV0dXJuIGZyb21TdHJpbmdSYXcobnVtYmVyU3RyaW5nLCByYWRpeCwgZXhhY3RuZXNzLCBtdXN0QmVBTnVtYmVycClcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZnJvbVN0cmluZ1Jhdyh4LCByYWRpeCwgZXhhY3RuZXNzLCBtdXN0QmVBTnVtYmVycCkge1xuICAgICAgICB2YXIgY01hdGNoID0gbWF0Y2hDb21wbGV4UmVnZXhwKHJhZGl4LCB4KTtcbiAgICAgICAgaWYgKGNNYXRjaCkge1xuICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSggZnJvbVN0cmluZ1Jhd05vQ29tcGxleCggY01hdGNoWzFdIHx8IFwiMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByYWRpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhhY3RuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJvbVN0cmluZ1Jhd05vQ29tcGxleCggY01hdGNoWzJdID09PSBcIitcIiA/IFwiMVwiICA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjTWF0Y2hbMl0gPT09IFwiLVwiID8gXCItMVwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNNYXRjaFsyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcmFkaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4YWN0bmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoeCwgcmFkaXgsIGV4YWN0bmVzcywgbXVzdEJlQU51bWJlcnApXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJvbVN0cmluZ1Jhd05vQ29tcGxleCh4LCByYWRpeCwgZXhhY3RuZXNzLCBtdXN0QmVBTnVtYmVycCkge1xuICAgICAgICB2YXIgYU1hdGNoID0geC5tYXRjaChyYXRpb25hbFJlZ2V4cChkaWdpdHNGb3JSYWRpeChyYWRpeCkpKTtcbiAgICAgICAgaWYgKGFNYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZSggZnJvbVN0cmluZ1Jhd05vQ29tcGxleCggYU1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByYWRpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhhY3RuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJvbVN0cmluZ1Jhd05vQ29tcGxleCggYU1hdGNoWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByYWRpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhhY3RuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGbG9hdGluZyBwb2ludCB0ZXN0c1xuICAgICAgICBpZiAoeCA9PT0gJytuYW4uMCcgfHwgeCA9PT0gJy1uYW4uMCcpXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5uYW47XG4gICAgICAgIGlmICh4ID09PSAnK2luZi4wJylcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50LmluZjtcbiAgICAgICAgaWYgKHggPT09ICctaW5mLjAnKVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubmVnaW5mO1xuICAgICAgICBpZiAoeCA9PT0gXCItMC4wXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBORUdBVElWRV9aRVJPO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZNYXRjaCA9IHgubWF0Y2goZmxvbnVtUmVnZXhwKGRpZ2l0c0ZvclJhZGl4KHJhZGl4KSkpXG4gICAgICAgIGlmIChmTWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnRlZ3JhbFBhcnQgPSBmTWF0Y2hbM10gIT09IHVuZGVmaW5lZCA/IGZNYXRjaFszXSA6IGZNYXRjaFs1XTtcbiAgICAgICAgICAgIHZhciBmcmFjdGlvbmFsUGFydCA9IGZNYXRjaFs0XSAhPT0gdW5kZWZpbmVkID8gZk1hdGNoWzRdIDogZk1hdGNoWzZdO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoIGZNYXRjaFsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGludGVncmFsUGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGZyYWN0aW9uYWxQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcmFkaXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleGFjdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNNYXRjaCA9IHgubWF0Y2goc2NpZW50aWZpY1BhdHRlcm4oIGRpZ2l0c0ZvclJhZGl4KHJhZGl4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhwTWFya0ZvclJhZGl4KHJhZGl4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgIGlmIChzTWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBjb2VmZmljaWVudCA9IGZyb21TdHJpbmdSYXdOb0NvbXBsZXgoc01hdGNoWzFdLCByYWRpeCwgZXhhY3RuZXNzKVxuICAgICAgICAgICAgdmFyIGV4cG9uZW50ID0gZnJvbVN0cmluZ1Jhd05vQ29tcGxleChzTWF0Y2hbMl0sIHJhZGl4LCBleGFjdG5lc3MpXG4gICAgICAgICAgICByZXR1cm4gbXVsdGlwbHkoY29lZmZpY2llbnQsIGV4cHQocmFkaXgsIGV4cG9uZW50KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBpbnRlZ2VyIHRlc3RzLlxuICAgICAgICBpZiAoeC5tYXRjaChkaWdpdFJlZ2V4cChkaWdpdHNGb3JSYWRpeChyYWRpeCkpKSkge1xuICAgICAgICAgICAgdmFyIG4gPSBwYXJzZUludCh4LCByYWRpeCk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhuKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYWtlQmlnbnVtKHgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChleGFjdG5lc3MuaW50QXNFeGFjdHAoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UobilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtdXN0QmVBTnVtYmVycCkge1xuICAgICAgICAgICAgaWYoeC5sZW5ndGg9PT0wKSB0aHJvd1J1bnRpbWVFcnJvcihcIm5vIGRpZ2l0c1wiKTtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiYmFkIG51bWJlcjogXCIgKyB4LCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwYXJzZUZsb2F0KHNpZ24sIGludGVncmFsUGFydCwgZnJhY3Rpb25hbFBhcnQsIHJhZGl4LCBleGFjdG5lc3MpIHtcbiAgICAgICAgdmFyIHNpZ24gPSAoc2lnbiA9PSBcIi1cIiA/IC0xIDogMSk7XG4gICAgICAgIHZhciBpbnRlZ3JhbFBhcnRWYWx1ZSA9IGludGVncmFsUGFydCA9PT0gXCJcIiAgPyAwICA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0bmVzcy5pbnRBc0V4YWN0cCgpID8gcGFyc2VFeGFjdEludChpbnRlZ3JhbFBhcnQsIHJhZGl4KSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoaW50ZWdyYWxQYXJ0LCByYWRpeClcblxuICAgICAgICB2YXIgZnJhY3Rpb25hbE51bWVyYXRvciA9IGZyYWN0aW9uYWxQYXJ0ID09PSBcIlwiID8gMCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RuZXNzLmludEFzRXhhY3RwKCkgPyBwYXJzZUV4YWN0SW50KGZyYWN0aW9uYWxQYXJ0LCByYWRpeCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoZnJhY3Rpb25hbFBhcnQsIHJhZGl4KVxuICAgICAgICAvKiB1bmZvcnR1bmF0ZWx5LCBmb3IgdGhlc2UgbmV4dCB0d28gY2FsY3VsYXRpb25zLCBgZXhwdGAgYW5kIGBkaXZpZGVgICovXG4gICAgICAgIC8qIHdpbGwgcHJvbW90ZSB0byBCaWdudW0gYW5kIFJhdGlvbmFsLCByZXNwZWN0aXZlbHksIGJ1dCB3ZSBvbmx5IHdhbnQgKi9cbiAgICAgICAgLyogdGhlc2UgaWYgd2UncmUgcGFyc2luZyBpbiBleGFjdCBtb2RlICovXG4gICAgICAgIHZhciBmcmFjdGlvbmFsRGVub21pbmF0b3IgPSBleGFjdG5lc3MuaW50QXNFeGFjdHAoKSA/IGV4cHQocmFkaXgsIGZyYWN0aW9uYWxQYXJ0Lmxlbmd0aCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyhyYWRpeCwgZnJhY3Rpb25hbFBhcnQubGVuZ3RoKVxuICAgICAgICB2YXIgZnJhY3Rpb25hbFBhcnRWYWx1ZSA9IGZyYWN0aW9uYWxQYXJ0ID09PSBcIlwiID8gMCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RuZXNzLmludEFzRXhhY3RwKCkgPyBkaXZpZGUoZnJhY3Rpb25hbE51bWVyYXRvciwgZnJhY3Rpb25hbERlbm9taW5hdG9yKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsTnVtZXJhdG9yIC8gZnJhY3Rpb25hbERlbm9taW5hdG9yXG5cbiAgICAgICAgdmFyIGZvcmNlSW5leGFjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgbyA9PT0gXCJudW1iZXJcIiA/IEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKG8pIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnRvSW5leGFjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV4YWN0bmVzcy5mbG9hdEFzSW5leGFjdHAoKSA/IGZvcmNlSW5leGFjdChtdWx0aXBseShzaWduLCBhZGQoIGludGVncmFsUGFydFZhbHVlLCBmcmFjdGlvbmFsUGFydFZhbHVlKSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGx5KHNpZ24sIGFkZChpbnRlZ3JhbFBhcnRWYWx1ZSwgZnJhY3Rpb25hbFBhcnRWYWx1ZSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRXhhY3RJbnQoc3RyLCByYWRpeCkge1xuICAgICAgICByZXR1cm4gZnJvbVN0cmluZ1Jhd05vQ29tcGxleChzdHIsIHJhZGl4LCBFeGFjdG5lc3Mub24sIHRydWUpO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBUaGUgY29kZSBiZWxvdyBjb21lcyBmcm9tIFRvbSBXdSdzIEJpZ0ludGVnZXIgaW1wbGVtZW50YXRpb246XG5cbiAgICAvLyBDb3B5cmlnaHQgKGMpIDIwMDUgIFRvbSBXdVxuICAgIC8vIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAgLy8gU2VlIFwiTElDRU5TRVwiIGZvciBkZXRhaWxzLlxuXG4gICAgLy8gQmFzaWMgSmF2YVNjcmlwdCBCTiBsaWJyYXJ5IC0gc3Vic2V0IHVzZWZ1bCBmb3IgUlNBIGVuY3J5cHRpb24uXG5cbiAgICAvLyBCaXRzIHBlciBkaWdpdFxuICAgIHZhciBkYml0cztcblxuICAgIC8vIEphdmFTY3JpcHQgZW5naW5lIGFuYWx5c2lzXG4gICAgdmFyIGNhbmFyeSA9IDB4ZGVhZGJlZWZjYWZlO1xuICAgIHZhciBqX2xtID0gKChjYW5hcnkmMHhmZmZmZmYpPT0weGVmY2FmZSk7XG5cbiAgICAvLyAocHVibGljKSBDb25zdHJ1Y3RvclxuICAgIGZ1bmN0aW9uIEJpZ0ludGVnZXIoYSxiLGMpIHtcbiAgICAgICAgaWYoYSAhPSBudWxsKVxuICAgICAgICAgICAgaWYoXCJudW1iZXJcIiA9PSB0eXBlb2YgYSkgdGhpcy5mcm9tTnVtYmVyKGEsYixjKTtcbiAgICAgICAgZWxzZSBpZihiID09IG51bGwgJiYgXCJzdHJpbmdcIiAhPSB0eXBlb2YgYSkgdGhpcy5mcm9tU3RyaW5nKGEsMjU2KTtcbiAgICAgICAgZWxzZSB0aGlzLmZyb21TdHJpbmcoYSxiKTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gbmV3LCB1bnNldCBCaWdJbnRlZ2VyXG4gICAgZnVuY3Rpb24gbmJpKCkgeyByZXR1cm4gbmV3IEJpZ0ludGVnZXIobnVsbCk7IH1cblxuICAgIC8vIGFtOiBDb21wdXRlIHdfaiArPSAoeCp0aGlzX2kpLCBwcm9wYWdhdGUgY2FycmllcyxcbiAgICAvLyBjIGlzIGluaXRpYWwgY2FycnksIHJldHVybnMgZmluYWwgY2FycnkuXG4gICAgLy8gYyA8IDMqZHZhbHVlLCB4IDwgMipkdmFsdWUsIHRoaXNfaSA8IGR2YWx1ZVxuICAgIC8vIFdlIG5lZWQgdG8gc2VsZWN0IHRoZSBmYXN0ZXN0IG9uZSB0aGF0IHdvcmtzIGluIHRoaXMgZW52aXJvbm1lbnQuXG5cbiAgICAvLyBhbTE6IHVzZSBhIHNpbmdsZSBtdWx0IGFuZCBkaXZpZGUgdG8gZ2V0IHRoZSBoaWdoIGJpdHMsXG4gICAgLy8gbWF4IGRpZ2l0IGJpdHMgc2hvdWxkIGJlIDI2IGJlY2F1c2VcbiAgICAvLyBtYXggaW50ZXJuYWwgdmFsdWUgPSAyKmR2YWx1ZV4yLTIqZHZhbHVlICg8IDJeNTMpXG4gICAgZnVuY3Rpb24gYW0xKGkseCx3LGosYyxuKSB7XG4gICAgICAgIHdoaWxlKC0tbiA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgdiA9IHgqdGhpc1tpKytdK3dbal0rYztcbiAgICAgICAgICAgIGMgPSBNYXRoLmZsb29yKHYvMHg0MDAwMDAwKTtcbiAgICAgICAgICAgIHdbaisrXSA9IHYmMHgzZmZmZmZmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICAvLyBhbTIgYXZvaWRzIGEgYmlnIG11bHQtYW5kLWV4dHJhY3QgY29tcGxldGVseS5cbiAgICAvLyBNYXggZGlnaXQgYml0cyBzaG91bGQgYmUgPD0gMzAgYmVjYXVzZSB3ZSBkbyBiaXR3aXNlIG9wc1xuICAgIC8vIG9uIHZhbHVlcyB1cCB0byAyKmhkdmFsdWVeMi1oZHZhbHVlLTEgKDwgMl4zMSlcbiAgICBmdW5jdGlvbiBhbTIoaSx4LHcsaixjLG4pIHtcbiAgICAgICAgdmFyIHhsID0geCYweDdmZmYsIHhoID0geD4+MTU7XG4gICAgICAgIHdoaWxlKC0tbiA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgbCA9IHRoaXNbaV0mMHg3ZmZmO1xuICAgICAgICAgICAgdmFyIGggPSB0aGlzW2krK10+PjE1O1xuICAgICAgICAgICAgdmFyIG0gPSB4aCpsK2gqeGw7XG4gICAgICAgICAgICBsID0geGwqbCsoKG0mMHg3ZmZmKTw8MTUpK3dbal0rKGMmMHgzZmZmZmZmZik7XG4gICAgICAgICAgICBjID0gKGw+Pj4zMCkrKG0+Pj4xNSkreGgqaCsoYz4+PjMwKTtcbiAgICAgICAgICAgIHdbaisrXSA9IGwmMHgzZmZmZmZmZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgLy8gQWx0ZXJuYXRlbHksIHNldCBtYXggZGlnaXQgYml0cyB0byAyOCBzaW5jZSBzb21lXG4gICAgLy8gYnJvd3NlcnMgc2xvdyBkb3duIHdoZW4gZGVhbGluZyB3aXRoIDMyLWJpdCBudW1iZXJzLlxuICAgIGZ1bmN0aW9uIGFtMyhpLHgsdyxqLGMsbikge1xuICAgICAgICB2YXIgeGwgPSB4JjB4M2ZmZiwgeGggPSB4Pj4xNDtcbiAgICAgICAgd2hpbGUoLS1uID49IDApIHtcbiAgICAgICAgICAgIHZhciBsID0gdGhpc1tpXSYweDNmZmY7XG4gICAgICAgICAgICB2YXIgaCA9IHRoaXNbaSsrXT4+MTQ7XG4gICAgICAgICAgICB2YXIgbSA9IHhoKmwraCp4bDtcbiAgICAgICAgICAgIGwgPSB4bCpsKygobSYweDNmZmYpPDwxNCkrd1tqXStjO1xuICAgICAgICAgICAgYyA9IChsPj4yOCkrKG0+PjE0KSt4aCpoO1xuICAgICAgICAgICAgd1tqKytdID0gbCYweGZmZmZmZmY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIGlmKGpfbG0gJiYgKHR5cGVvZihuYXZpZ2F0b3IpICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IuYXBwTmFtZSA9PSBcIk1pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlclwiKSkge1xuICAgICAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbSA9IGFtMjtcbiAgICAgICAgZGJpdHMgPSAzMDtcbiAgICB9XG4gICAgZWxzZSBpZihqX2xtICYmICh0eXBlb2YobmF2aWdhdG9yKSAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLmFwcE5hbWUgIT0gXCJOZXRzY2FwZVwiKSkge1xuICAgICAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbSA9IGFtMTtcbiAgICAgICAgZGJpdHMgPSAyNjtcbiAgICB9XG4gICAgZWxzZSB7IC8vIE1vemlsbGEvTmV0c2NhcGUgc2VlbXMgdG8gcHJlZmVyIGFtM1xuICAgICAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbSA9IGFtMztcbiAgICAgICAgZGJpdHMgPSAyODtcbiAgICB9XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5EQiA9IGRiaXRzO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkRNID0gKCgxPDxkYml0cyktMSk7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuRFYgPSAoMTw8ZGJpdHMpO1xuXG4gICAgdmFyIEJJX0ZQID0gNTI7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuRlYgPSBNYXRoLnBvdygyLEJJX0ZQKTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5GMSA9IEJJX0ZQLWRiaXRzO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkYyID0gMipkYml0cy1CSV9GUDtcblxuICAgIC8vIERpZ2l0IGNvbnZlcnNpb25zXG4gICAgdmFyIEJJX1JNID0gXCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIjtcbiAgICB2YXIgQklfUkMgPSBbXTtcbiAgICB2YXIgcnIsdnY7XG4gICAgcnIgPSBcIjBcIi5jaGFyQ29kZUF0KDApO1xuICAgIGZvcih2diA9IDA7IHZ2IDw9IDk7ICsrdnYpIEJJX1JDW3JyKytdID0gdnY7XG4gICAgcnIgPSBcImFcIi5jaGFyQ29kZUF0KDApO1xuICAgIGZvcih2diA9IDEwOyB2diA8IDM2OyArK3Z2KSBCSV9SQ1tycisrXSA9IHZ2O1xuICAgIHJyID0gXCJBXCIuY2hhckNvZGVBdCgwKTtcbiAgICBmb3IodnYgPSAxMDsgdnYgPCAzNjsgKyt2dikgQklfUkNbcnIrK10gPSB2djtcblxuICAgIGZ1bmN0aW9uIGludDJjaGFyKG4pIHsgcmV0dXJuIEJJX1JNLmNoYXJBdChuKTsgfVxuICAgIGZ1bmN0aW9uIGludEF0KHMsaSkge1xuICAgICAgICB2YXIgYyA9IEJJX1JDW3MuY2hhckNvZGVBdChpKV07XG4gICAgICAgIHJldHVybiAoYz09bnVsbCk/LTE6YztcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBjb3B5IHRoaXMgdG8gclxuICAgIGZ1bmN0aW9uIGJucENvcHlUbyhyKSB7XG4gICAgICAgIGZvcih2YXIgaSA9IHRoaXMudC0xOyBpID49IDA7IC0taSkgcltpXSA9IHRoaXNbaV07XG4gICAgICAgIHIudCA9IHRoaXMudDtcbiAgICAgICAgci5zID0gdGhpcy5zO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHNldCBmcm9tIGludGVnZXIgdmFsdWUgeCwgLURWIDw9IHggPCBEVlxuICAgIGZ1bmN0aW9uIGJucEZyb21JbnQoeCkge1xuICAgICAgICB0aGlzLnQgPSAxO1xuICAgICAgICB0aGlzLnMgPSAoeDwwKT8tMTowO1xuICAgICAgICBpZih4ID4gMCkgdGhpc1swXSA9IHg7XG4gICAgICAgIGVsc2UgaWYoeCA8IC0xKSB0aGlzWzBdID0geCtEVjtcbiAgICAgICAgZWxzZSB0aGlzLnQgPSAwO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBiaWdpbnQgaW5pdGlhbGl6ZWQgdG8gdmFsdWVcbiAgICBmdW5jdGlvbiBuYnYoaSkgeyB2YXIgciA9IG5iaSgpOyByLmZyb21JbnQoaSk7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBzZXQgZnJvbSBzdHJpbmcgYW5kIHJhZGl4XG4gICAgZnVuY3Rpb24gYm5wRnJvbVN0cmluZyhzLGIpIHtcbiAgICAgICAgdmFyIGs7XG4gICAgICAgIGlmKGIgPT0gMTYpIGsgPSA0O1xuICAgICAgICBlbHNlIGlmKGIgPT0gOCkgayA9IDM7XG4gICAgICAgIGVsc2UgaWYoYiA9PSAyNTYpIGsgPSA4OyAvLyBieXRlIGFycmF5XG4gICAgICAgIGVsc2UgaWYoYiA9PSAyKSBrID0gMTtcbiAgICAgICAgZWxzZSBpZihiID09IDMyKSBrID0gNTtcbiAgICAgICAgZWxzZSBpZihiID09IDQpIGsgPSAyO1xuICAgICAgICBlbHNlIHsgdGhpcy5mcm9tUmFkaXgocyxiKTsgcmV0dXJuOyB9XG4gICAgICAgIHRoaXMudCA9IDA7XG4gICAgICAgIHRoaXMucyA9IDA7XG4gICAgICAgIHZhciBpID0gcy5sZW5ndGgsIG1pID0gZmFsc2UsIHNoID0gMDtcbiAgICAgICAgd2hpbGUoLS1pID49IDApIHtcbiAgICAgICAgICAgIHZhciB4ID0gKGs9PTgpP3NbaV0mMHhmZjppbnRBdChzLGkpO1xuICAgICAgICAgICAgaWYoeCA8IDApIHtcbiAgICAgICAgICAgICAgICBpZihzLmNoYXJBdChpKSA9PSBcIi1cIikgbWkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWkgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmKHNoID09IDApXG4gICAgICAgICAgICAgICAgdGhpc1t0aGlzLnQrK10gPSB4O1xuICAgICAgICAgICAgZWxzZSBpZihzaCtrID4gdGhpcy5EQikge1xuICAgICAgICAgICAgICAgIHRoaXNbdGhpcy50LTFdIHw9ICh4JigoMTw8KHRoaXMuREItc2gpKS0xKSk8PHNoO1xuICAgICAgICAgICAgICAgIHRoaXNbdGhpcy50KytdID0gKHg+Pih0aGlzLkRCLXNoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpc1t0aGlzLnQtMV0gfD0geDw8c2g7XG4gICAgICAgICAgICBzaCArPSBrO1xuICAgICAgICAgICAgaWYoc2ggPj0gdGhpcy5EQikgc2ggLT0gdGhpcy5EQjtcbiAgICAgICAgfVxuICAgICAgICBpZihrID09IDggJiYgKHNbMF0mMHg4MCkgIT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zID0gLTE7XG4gICAgICAgICAgICBpZihzaCA+IDApIHRoaXNbdGhpcy50LTFdIHw9ICgoMTw8KHRoaXMuREItc2gpKS0xKTw8c2g7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGFtcCgpO1xuICAgICAgICBpZihtaSkgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHRoaXMsdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgY2xhbXAgb2ZmIGV4Y2VzcyBoaWdoIHdvcmRzXG4gICAgZnVuY3Rpb24gYm5wQ2xhbXAoKSB7XG4gICAgICAgIHZhciBjID0gdGhpcy5zJnRoaXMuRE07XG4gICAgICAgIHdoaWxlKHRoaXMudCA+IDAgJiYgdGhpc1t0aGlzLnQtMV0gPT0gYykgLS10aGlzLnQ7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIHN0cmluZyByZXByZXNlbnRhdGlvbiBpbiBnaXZlbiByYWRpeFxuICAgIGZ1bmN0aW9uIGJuVG9TdHJpbmcoYikge1xuICAgICAgICBpZih0aGlzLnMgPCAwKSByZXR1cm4gXCItXCIrdGhpcy5uZWdhdGUoKS50b1N0cmluZyhiKTtcbiAgICAgICAgdmFyIGs7XG4gICAgICAgIGlmKGIgPT0gMTYpIGsgPSA0O1xuICAgICAgICBlbHNlIGlmKGIgPT0gOCkgayA9IDM7XG4gICAgICAgIGVsc2UgaWYoYiA9PSAyKSBrID0gMTtcbiAgICAgICAgZWxzZSBpZihiID09IDMyKSBrID0gNTtcbiAgICAgICAgZWxzZSBpZihiID09IDQpIGsgPSAyO1xuICAgICAgICBlbHNlIHJldHVybiB0aGlzLnRvUmFkaXgoYik7XG4gICAgICAgIHZhciBrbSA9ICgxPDxrKS0xLCBkLCBtID0gZmFsc2UsIHIgPSBbXSwgaSA9IHRoaXMudDtcbiAgICAgICAgdmFyIHAgPSB0aGlzLkRCLShpKnRoaXMuREIpJWs7XG4gICAgICAgIGlmKGktLSA+IDApIHtcbiAgICAgICAgICAgIGlmKHAgPCB0aGlzLkRCICYmIChkID0gdGhpc1tpXT4+cCkgPiAwKSB7IG0gPSB0cnVlOyByLnB1c2goaW50MmNoYXIoZCkpOyB9XG4gICAgICAgICAgICB3aGlsZShpID49IDApIHtcbiAgICAgICAgICAgICAgICBpZihwIDwgaykge1xuICAgICAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0mKCgxPDxwKS0xKSk8PChrLXApO1xuICAgICAgICAgICAgICAgICAgICBkIHw9IHRoaXNbLS1pXT4+KHArPXRoaXMuREItayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0+PihwLT1rKSkma207XG4gICAgICAgICAgICAgICAgICAgIGlmKHAgPD0gMCkgeyBwICs9IHRoaXMuREI7IC0taTsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihkID4gMCkgbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYobSkgci5wdXNoKGludDJjaGFyKGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbT9yLmpvaW4oXCJcIik6XCIwXCI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgLXRoaXNcbiAgICBmdW5jdGlvbiBibk5lZ2F0ZSgpIHsgdmFyIHIgPSBuYmkoKTsgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHRoaXMscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB8dGhpc3xcbiAgICBmdW5jdGlvbiBibkFicygpIHsgcmV0dXJuICh0aGlzLnM8MCk/dGhpcy5uZWdhdGUoKTp0aGlzOyB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gKyBpZiB0aGlzID4gYSwgLSBpZiB0aGlzIDwgYSwgMCBpZiBlcXVhbFxuICAgIGZ1bmN0aW9uIGJuQ29tcGFyZVRvKGEpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzLnMtYS5zO1xuICAgICAgICBpZihyICE9IDApIHJldHVybiByO1xuICAgICAgICB2YXIgaSA9IHRoaXMudDtcbiAgICAgICAgaWYgKCB0aGlzLnMgPCAwICkge1xuICAgICAgICAgICAgICAgIHIgPSBhLnQgLSBpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHIgPSBpIC0gYS50O1xuICAgICAgICB9XG4gICAgICAgIGlmKHIgIT0gMCkgcmV0dXJuIHI7XG4gICAgICAgIHdoaWxlKC0taSA+PSAwKSBpZigocj10aGlzW2ldLWFbaV0pICE9IDApIHJldHVybiByO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIGJpdCBsZW5ndGggb2YgdGhlIGludGVnZXIgeFxuICAgIGZ1bmN0aW9uIG5iaXRzKHgpIHtcbiAgICAgICAgdmFyIHIgPSAxLCB0O1xuICAgICAgICBpZigodD14Pj4+MTYpICE9IDApIHsgeCA9IHQ7IHIgKz0gMTY7IH1cbiAgICAgICAgaWYoKHQ9eD4+OCkgIT0gMCkgeyB4ID0gdDsgciArPSA4OyB9XG4gICAgICAgIGlmKCh0PXg+PjQpICE9IDApIHsgeCA9IHQ7IHIgKz0gNDsgfVxuICAgICAgICBpZigodD14Pj4yKSAhPSAwKSB7IHggPSB0OyByICs9IDI7IH1cbiAgICAgICAgaWYoKHQ9eD4+MSkgIT0gMCkgeyB4ID0gdDsgciArPSAxOyB9XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiB0aGUgbnVtYmVyIG9mIGJpdHMgaW4gXCJ0aGlzXCJcbiAgICBmdW5jdGlvbiBibkJpdExlbmd0aCgpIHtcbiAgICAgICAgaWYodGhpcy50IDw9IDApIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gdGhpcy5EQioodGhpcy50LTEpK25iaXRzKHRoaXNbdGhpcy50LTFdXih0aGlzLnMmdGhpcy5ETSkpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzIDw8IG4qREJcbiAgICBmdW5jdGlvbiBibnBETFNoaWZ0VG8obixyKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBmb3IoaSA9IHRoaXMudC0xOyBpID49IDA7IC0taSkgcltpK25dID0gdGhpc1tpXTtcbiAgICAgICAgZm9yKGkgPSBuLTE7IGkgPj0gMDsgLS1pKSByW2ldID0gMDtcbiAgICAgICAgci50ID0gdGhpcy50K247XG4gICAgICAgIHIucyA9IHRoaXMucztcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyA+PiBuKkRCXG4gICAgZnVuY3Rpb24gYm5wRFJTaGlmdFRvKG4scikge1xuICAgICAgICBmb3IodmFyIGkgPSBuOyBpIDwgdGhpcy50OyArK2kpIHJbaS1uXSA9IHRoaXNbaV07XG4gICAgICAgIHIudCA9IE1hdGgubWF4KHRoaXMudC1uLDApO1xuICAgICAgICByLnMgPSB0aGlzLnM7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPDwgblxuICAgIGZ1bmN0aW9uIGJucExTaGlmdFRvKG4scikge1xuICAgICAgICB2YXIgYnMgPSBuJXRoaXMuREI7XG4gICAgICAgIHZhciBjYnMgPSB0aGlzLkRCLWJzO1xuICAgICAgICB2YXIgYm0gPSAoMTw8Y2JzKS0xO1xuICAgICAgICB2YXIgZHMgPSBNYXRoLmZsb29yKG4vdGhpcy5EQiksIGMgPSAodGhpcy5zPDxicykmdGhpcy5ETSwgaTtcbiAgICAgICAgZm9yKGkgPSB0aGlzLnQtMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIHJbaStkcysxXSA9ICh0aGlzW2ldPj5jYnMpfGM7XG4gICAgICAgICAgICBjID0gKHRoaXNbaV0mYm0pPDxicztcbiAgICAgICAgfVxuICAgICAgICBmb3IoaSA9IGRzLTE7IGkgPj0gMDsgLS1pKSByW2ldID0gMDtcbiAgICAgICAgcltkc10gPSBjO1xuICAgICAgICByLnQgPSB0aGlzLnQrZHMrMTtcbiAgICAgICAgci5zID0gdGhpcy5zO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPj4gblxuICAgIGZ1bmN0aW9uIGJucFJTaGlmdFRvKG4scikge1xuICAgICAgICByLnMgPSB0aGlzLnM7XG4gICAgICAgIHZhciBkcyA9IE1hdGguZmxvb3Iobi90aGlzLkRCKTtcbiAgICAgICAgaWYoZHMgPj0gdGhpcy50KSB7IHIudCA9IDA7IHJldHVybjsgfVxuICAgICAgICB2YXIgYnMgPSBuJXRoaXMuREI7XG4gICAgICAgIHZhciBjYnMgPSB0aGlzLkRCLWJzO1xuICAgICAgICB2YXIgYm0gPSAoMTw8YnMpLTE7XG4gICAgICAgIHJbMF0gPSB0aGlzW2RzXT4+YnM7XG4gICAgICAgIGZvcih2YXIgaSA9IGRzKzE7IGkgPCB0aGlzLnQ7ICsraSkge1xuICAgICAgICAgICAgcltpLWRzLTFdIHw9ICh0aGlzW2ldJmJtKTw8Y2JzO1xuICAgICAgICAgICAgcltpLWRzXSA9IHRoaXNbaV0+PmJzO1xuICAgICAgICB9XG4gICAgICAgIGlmKGJzID4gMCkgclt0aGlzLnQtZHMtMV0gfD0gKHRoaXMucyZibSk8PGNicztcbiAgICAgICAgci50ID0gdGhpcy50LWRzO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgLSBhXG4gICAgZnVuY3Rpb24gYm5wU3ViVG8oYSxyKSB7XG4gICAgICAgIHZhciBpID0gMCwgYyA9IDAsIG0gPSBNYXRoLm1pbihhLnQsdGhpcy50KTtcbiAgICAgICAgd2hpbGUoaSA8IG0pIHtcbiAgICAgICAgICAgIGMgKz0gdGhpc1tpXS1hW2ldO1xuICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgfVxuICAgICAgICBpZihhLnQgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgIGMgLT0gYS5zO1xuICAgICAgICAgICAgd2hpbGUoaSA8IHRoaXMudCkge1xuICAgICAgICAgICAgICAgIGMgKz0gdGhpc1tpXTtcbiAgICAgICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgKz0gdGhpcy5zO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYyArPSB0aGlzLnM7XG4gICAgICAgICAgICB3aGlsZShpIDwgYS50KSB7XG4gICAgICAgICAgICAgICAgYyAtPSBhW2ldO1xuICAgICAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyAtPSBhLnM7XG4gICAgICAgIH1cbiAgICAgICAgci5zID0gKGM8MCk/LTE6MDtcbiAgICAgICAgaWYoYyA8IC0xKSByW2krK10gPSB0aGlzLkRWK2M7XG4gICAgICAgIGVsc2UgaWYoYyA+IDApIHJbaSsrXSA9IGM7XG4gICAgICAgIHIudCA9IGk7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyAqIGEsIHIgIT0gdGhpcyxhIChIQUMgMTQuMTIpXG4gICAgLy8gXCJ0aGlzXCIgc2hvdWxkIGJlIHRoZSBsYXJnZXIgb25lIGlmIGFwcHJvcHJpYXRlLlxuICAgIGZ1bmN0aW9uIGJucE11bHRpcGx5VG8oYSxyKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5hYnMoKSwgeSA9IGEuYWJzKCk7XG4gICAgICAgIHZhciBpID0geC50O1xuICAgICAgICByLnQgPSBpK3kudDtcbiAgICAgICAgd2hpbGUoLS1pID49IDApIHJbaV0gPSAwO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCB5LnQ7ICsraSkgcltpK3gudF0gPSB4LmFtKDAseVtpXSxyLGksMCx4LnQpO1xuICAgICAgICByLnMgPSAwO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgICAgIGlmKHRoaXMucyAhPSBhLnMpIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyhyLHIpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzXjIsIHIgIT0gdGhpcyAoSEFDIDE0LjE2KVxuICAgIGZ1bmN0aW9uIGJucFNxdWFyZVRvKHIpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLmFicygpO1xuICAgICAgICB2YXIgaSA9IHIudCA9IDIqeC50O1xuICAgICAgICB3aGlsZSgtLWkgPj0gMCkgcltpXSA9IDA7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IHgudC0xOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjID0geC5hbShpLHhbaV0sciwyKmksMCwxKTtcbiAgICAgICAgICAgIGlmKChyW2kreC50XSs9eC5hbShpKzEsMip4W2ldLHIsMippKzEsYyx4LnQtaS0xKSkgPj0geC5EVikge1xuICAgICAgICAgICAgICAgIHJbaSt4LnRdIC09IHguRFY7XG4gICAgICAgICAgICAgICAgcltpK3gudCsxXSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoci50ID4gMCkgcltyLnQtMV0gKz0geC5hbShpLHhbaV0sciwyKmksMCwxKTtcbiAgICAgICAgci5zID0gMDtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuXG4gICAgLy8gKHByb3RlY3RlZCkgZGl2aWRlIHRoaXMgYnkgbSwgcXVvdGllbnQgYW5kIHJlbWFpbmRlciB0byBxLCByIChIQUMgMTQuMjApXG4gICAgLy8gciAhPSBxLCB0aGlzICE9IG0uICBxIG9yIHIgbWF5IGJlIG51bGwuXG4gICAgZnVuY3Rpb24gYm5wRGl2UmVtVG8obSxxLHIpIHtcbiAgICAgICAgdmFyIHBtID0gbS5hYnMoKTtcbiAgICAgICAgaWYocG0udCA8PSAwKSByZXR1cm47XG4gICAgICAgIHZhciBwdCA9IHRoaXMuYWJzKCk7XG4gICAgICAgIGlmKHB0LnQgPCBwbS50KSB7XG4gICAgICAgICAgICBpZihxICE9IG51bGwpIHEuZnJvbUludCgwKTtcbiAgICAgICAgICAgIGlmKHIgIT0gbnVsbCkgdGhpcy5jb3B5VG8ocik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYociA9PSBudWxsKSByID0gbmJpKCk7XG4gICAgICAgIHZhciB5ID0gbmJpKCksIHRzID0gdGhpcy5zLCBtcyA9IG0ucztcbiAgICAgICAgdmFyIG5zaCA9IHRoaXMuREItbmJpdHMocG1bcG0udC0xXSk7XHQvLyBub3JtYWxpemUgbW9kdWx1c1xuICAgICAgICBpZihuc2ggPiAwKSB7IHBtLmxTaGlmdFRvKG5zaCx5KTsgcHQubFNoaWZ0VG8obnNoLHIpOyB9XG4gICAgICAgIGVsc2UgeyBwbS5jb3B5VG8oeSk7IHB0LmNvcHlUbyhyKTsgfVxuICAgICAgICB2YXIgeXMgPSB5LnQ7XG4gICAgICAgIHZhciB5MCA9IHlbeXMtMV07XG4gICAgICAgIGlmKHkwID09IDApIHJldHVybjtcbiAgICAgICAgdmFyIHl0ID0geTAqKDE8PHRoaXMuRjEpKygoeXM+MSk/eVt5cy0yXT4+dGhpcy5GMjowKTtcbiAgICAgICAgdmFyIGQxID0gdGhpcy5GVi95dCwgZDIgPSAoMTw8dGhpcy5GMSkveXQsIGUgPSAxPDx0aGlzLkYyO1xuICAgICAgICB2YXIgaSA9IHIudCwgaiA9IGkteXMsIHQgPSAocT09bnVsbCk/bmJpKCk6cTtcbiAgICAgICAgeS5kbFNoaWZ0VG8oaix0KTtcbiAgICAgICAgaWYoci5jb21wYXJlVG8odCkgPj0gMCkge1xuICAgICAgICAgICAgcltyLnQrK10gPSAxO1xuICAgICAgICAgICAgci5zdWJUbyh0LHIpO1xuICAgICAgICB9XG4gICAgICAgIEJpZ0ludGVnZXIuT05FLmRsU2hpZnRUbyh5cyx0KTtcbiAgICAgICAgdC5zdWJUbyh5LHkpO1x0Ly8gXCJuZWdhdGl2ZVwiIHkgc28gd2UgY2FuIHJlcGxhY2Ugc3ViIHdpdGggYW0gbGF0ZXJcbiAgICAgICAgd2hpbGUoeS50IDwgeXMpIHlbeS50KytdID0gMDtcbiAgICAgICAgd2hpbGUoLS1qID49IDApIHtcbiAgICAgICAgICAgIC8vIEVzdGltYXRlIHF1b3RpZW50IGRpZ2l0XG4gICAgICAgICAgICB2YXIgcWQgPSAoclstLWldPT15MCk/dGhpcy5ETTpNYXRoLmZsb29yKHJbaV0qZDErKHJbaS0xXStlKSpkMik7XG4gICAgICAgICAgICBpZigocltpXSs9eS5hbSgwLHFkLHIsaiwwLHlzKSkgPCBxZCkge1x0Ly8gVHJ5IGl0IG91dFxuICAgICAgICAgICAgICAgIHkuZGxTaGlmdFRvKGosdCk7XG4gICAgICAgICAgICAgICAgci5zdWJUbyh0LHIpO1xuICAgICAgICAgICAgICAgIHdoaWxlKHJbaV0gPCAtLXFkKSByLnN1YlRvKHQscik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYocSAhPSBudWxsKSB7XG4gICAgICAgICAgICByLmRyU2hpZnRUbyh5cyxxKTtcbiAgICAgICAgICAgIGlmKHRzICE9IG1zKSBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8ocSxxKTtcbiAgICAgICAgfVxuICAgICAgICByLnQgPSB5cztcbiAgICAgICAgci5jbGFtcCgpO1xuICAgICAgICBpZihuc2ggPiAwKSByLnJTaGlmdFRvKG5zaCxyKTtcdC8vIERlbm9ybWFsaXplIHJlbWFpbmRlclxuICAgICAgICBpZih0cyA8IDApIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyhyLHIpO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgbW9kIGFcbiAgICBmdW5jdGlvbiBibk1vZChhKSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIHRoaXMuYWJzKCkuZGl2UmVtVG8oYSxudWxsLHIpO1xuICAgICAgICBpZih0aGlzLnMgPCAwICYmIHIuY29tcGFyZVRvKEJpZ0ludGVnZXIuWkVSTykgPiAwKSBhLnN1YlRvKHIscik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIE1vZHVsYXIgcmVkdWN0aW9uIHVzaW5nIFwiY2xhc3NpY1wiIGFsZ29yaXRobVxuICAgIGZ1bmN0aW9uIENsYXNzaWMobSkgeyB0aGlzLm0gPSBtOyB9XG4gICAgZnVuY3Rpb24gY0NvbnZlcnQoeCkge1xuICAgICAgICBpZih4LnMgPCAwIHx8IHguY29tcGFyZVRvKHRoaXMubSkgPj0gMCkgcmV0dXJuIHgubW9kKHRoaXMubSk7XG4gICAgICAgIGVsc2UgcmV0dXJuIHg7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNSZXZlcnQoeCkgeyByZXR1cm4geDsgfVxuICAgIGZ1bmN0aW9uIGNSZWR1Y2UoeCkgeyB4LmRpdlJlbVRvKHRoaXMubSxudWxsLHgpOyB9XG4gICAgZnVuY3Rpb24gY011bFRvKHgseSxyKSB7IHgubXVsdGlwbHlUbyh5LHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuICAgIGZ1bmN0aW9uIGNTcXJUbyh4LHIpIHsgeC5zcXVhcmVUbyhyKTsgdGhpcy5yZWR1Y2Uocik7IH1cblxuICAgIENsYXNzaWMucHJvdG90eXBlLmNvbnZlcnQgPSBjQ29udmVydDtcbiAgICBDbGFzc2ljLnByb3RvdHlwZS5yZXZlcnQgPSBjUmV2ZXJ0O1xuICAgIENsYXNzaWMucHJvdG90eXBlLnJlZHVjZSA9IGNSZWR1Y2U7XG4gICAgQ2xhc3NpYy5wcm90b3R5cGUubXVsVG8gPSBjTXVsVG87XG4gICAgQ2xhc3NpYy5wcm90b3R5cGUuc3FyVG8gPSBjU3FyVG87XG5cbiAgICAvLyAocHJvdGVjdGVkKSByZXR1cm4gXCItMS90aGlzICUgMl5EQlwiOyB1c2VmdWwgZm9yIE1vbnQuIHJlZHVjdGlvblxuICAgIC8vIGp1c3RpZmljYXRpb246XG4gICAgLy8gICAgICAgICB4eSA9PSAxIChtb2QgbSlcbiAgICAvLyAgICAgICAgIHh5ID0gIDEra21cbiAgICAvLyAgIHh5KDIteHkpID0gKDEra20pKDEta20pXG4gICAgLy8geFt5KDIteHkpXSA9IDEta14ybV4yXG4gICAgLy8geFt5KDIteHkpXSA9PSAxIChtb2QgbV4yKVxuICAgIC8vIGlmIHkgaXMgMS94IG1vZCBtLCB0aGVuIHkoMi14eSkgaXMgMS94IG1vZCBtXjJcbiAgICAvLyBzaG91bGQgcmVkdWNlIHggYW5kIHkoMi14eSkgYnkgbV4yIGF0IGVhY2ggc3RlcCB0byBrZWVwIHNpemUgYm91bmRlZC5cbiAgICAvLyBKUyBtdWx0aXBseSBcIm92ZXJmbG93c1wiIGRpZmZlcmVudGx5IGZyb20gQy9DKyssIHNvIGNhcmUgaXMgbmVlZGVkIGhlcmUuXG4gICAgZnVuY3Rpb24gYm5wSW52RGlnaXQoKSB7XG4gICAgICAgIGlmKHRoaXMudCA8IDEpIHJldHVybiAwO1xuICAgICAgICB2YXIgeCA9IHRoaXNbMF07XG4gICAgICAgIGlmKCh4JjEpID09IDApIHJldHVybiAwO1xuICAgICAgICB2YXIgeSA9IHgmMztcdFx0Ly8geSA9PSAxL3ggbW9kIDJeMlxuICAgICAgICB5ID0gKHkqKDItKHgmMHhmKSp5KSkmMHhmO1x0Ly8geSA9PSAxL3ggbW9kIDJeNFxuICAgICAgICB5ID0gKHkqKDItKHgmMHhmZikqeSkpJjB4ZmY7XHQvLyB5ID09IDEveCBtb2QgMl44XG4gICAgICAgIHkgPSAoeSooMi0oKCh4JjB4ZmZmZikqeSkmMHhmZmZmKSkpJjB4ZmZmZjtcdC8vIHkgPT0gMS94IG1vZCAyXjE2XG4gICAgICAgIC8vIGxhc3Qgc3RlcCAtIGNhbGN1bGF0ZSBpbnZlcnNlIG1vZCBEViBkaXJlY3RseTtcbiAgICAgICAgLy8gYXNzdW1lcyAxNiA8IERCIDw9IDMyIGFuZCBhc3N1bWVzIGFiaWxpdHkgdG8gaGFuZGxlIDQ4LWJpdCBpbnRzXG4gICAgICAgIHkgPSAoeSooMi14KnkldGhpcy5EVikpJXRoaXMuRFY7XHRcdC8vIHkgPT0gMS94IG1vZCAyXmRiaXRzXG4gICAgICAgIC8vIHdlIHJlYWxseSB3YW50IHRoZSBuZWdhdGl2ZSBpbnZlcnNlLCBhbmQgLURWIDwgeSA8IERWXG4gICAgICAgIHJldHVybiAoeT4wKT90aGlzLkRWLXk6LXk7XG4gICAgfVxuXG4gICAgLy8gTW9udGdvbWVyeSByZWR1Y3Rpb25cbiAgICBmdW5jdGlvbiBNb250Z29tZXJ5KG0pIHtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICAgICAgdGhpcy5tcCA9IG0uaW52RGlnaXQoKTtcbiAgICAgICAgdGhpcy5tcGwgPSB0aGlzLm1wJjB4N2ZmZjtcbiAgICAgICAgdGhpcy5tcGggPSB0aGlzLm1wPj4xNTtcbiAgICAgICAgdGhpcy51bSA9ICgxPDwobS5EQi0xNSkpLTE7XG4gICAgICAgIHRoaXMubXQyID0gMiptLnQ7XG4gICAgfVxuXG4gICAgLy8geFIgbW9kIG1cbiAgICBmdW5jdGlvbiBtb250Q29udmVydCh4KSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIHguYWJzKCkuZGxTaGlmdFRvKHRoaXMubS50LHIpO1xuICAgICAgICByLmRpdlJlbVRvKHRoaXMubSxudWxsLHIpO1xuICAgICAgICBpZih4LnMgPCAwICYmIHIuY29tcGFyZVRvKEJpZ0ludGVnZXIuWkVSTykgPiAwKSB0aGlzLm0uc3ViVG8ocixyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8geC9SIG1vZCBtXG4gICAgZnVuY3Rpb24gbW9udFJldmVydCh4KSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIHguY29weVRvKHIpO1xuICAgICAgICB0aGlzLnJlZHVjZShyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8geCA9IHgvUiBtb2QgbSAoSEFDIDE0LjMyKVxuICAgIGZ1bmN0aW9uIG1vbnRSZWR1Y2UoeCkge1xuICAgICAgICB3aGlsZSh4LnQgPD0gdGhpcy5tdDIpXHQvLyBwYWQgeCBzbyBhbSBoYXMgZW5vdWdoIHJvb20gbGF0ZXJcbiAgICAgICAgICAgIHhbeC50KytdID0gMDtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubS50OyArK2kpIHtcbiAgICAgICAgICAgIC8vIGZhc3RlciB3YXkgb2YgY2FsY3VsYXRpbmcgdTAgPSB4W2ldKm1wIG1vZCBEVlxuICAgICAgICAgICAgdmFyIGogPSB4W2ldJjB4N2ZmZjtcbiAgICAgICAgICAgIHZhciB1MCA9IChqKnRoaXMubXBsKygoKGoqdGhpcy5tcGgrKHhbaV0+PjE1KSp0aGlzLm1wbCkmdGhpcy51bSk8PDE1KSkmeC5ETTtcbiAgICAgICAgICAgIC8vIHVzZSBhbSB0byBjb21iaW5lIHRoZSBtdWx0aXBseS1zaGlmdC1hZGQgaW50byBvbmUgY2FsbFxuICAgICAgICAgICAgaiA9IGkrdGhpcy5tLnQ7XG4gICAgICAgICAgICB4W2pdICs9IHRoaXMubS5hbSgwLHUwLHgsaSwwLHRoaXMubS50KTtcbiAgICAgICAgICAgIC8vIHByb3BhZ2F0ZSBjYXJyeVxuICAgICAgICAgICAgd2hpbGUoeFtqXSA+PSB4LkRWKSB7IHhbal0gLT0geC5EVjsgeFsrK2pdKys7IH1cbiAgICAgICAgfVxuICAgICAgICB4LmNsYW1wKCk7XG4gICAgICAgIHguZHJTaGlmdFRvKHRoaXMubS50LHgpO1xuICAgICAgICBpZih4LmNvbXBhcmVUbyh0aGlzLm0pID49IDApIHguc3ViVG8odGhpcy5tLHgpO1xuICAgIH1cblxuICAgIC8vIHIgPSBcInheMi9SIG1vZCBtXCI7IHggIT0gclxuICAgIGZ1bmN0aW9uIG1vbnRTcXJUbyh4LHIpIHsgeC5zcXVhcmVUbyhyKTsgdGhpcy5yZWR1Y2Uocik7IH1cblxuICAgIC8vIHIgPSBcInh5L1IgbW9kIG1cIjsgeCx5ICE9IHJcbiAgICBmdW5jdGlvbiBtb250TXVsVG8oeCx5LHIpIHsgeC5tdWx0aXBseVRvKHkscik7IHRoaXMucmVkdWNlKHIpOyB9XG5cbiAgICBNb250Z29tZXJ5LnByb3RvdHlwZS5jb252ZXJ0ID0gbW9udENvbnZlcnQ7XG4gICAgTW9udGdvbWVyeS5wcm90b3R5cGUucmV2ZXJ0ID0gbW9udFJldmVydDtcbiAgICBNb250Z29tZXJ5LnByb3RvdHlwZS5yZWR1Y2UgPSBtb250UmVkdWNlO1xuICAgIE1vbnRnb21lcnkucHJvdG90eXBlLm11bFRvID0gbW9udE11bFRvO1xuICAgIE1vbnRnb21lcnkucHJvdG90eXBlLnNxclRvID0gbW9udFNxclRvO1xuXG4gICAgLy8gKHByb3RlY3RlZCkgdHJ1ZSBpZmYgdGhpcyBpcyBldmVuXG4gICAgZnVuY3Rpb24gYm5wSXNFdmVuKCkgeyByZXR1cm4gKCh0aGlzLnQ+MCk/KHRoaXNbMF0mMSk6dGhpcy5zKSA9PSAwOyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0aGlzXmUsIGUgPCAyXjMyLCBkb2luZyBzcXIgYW5kIG11bCB3aXRoIFwiclwiIChIQUMgMTQuNzkpXG4gICAgZnVuY3Rpb24gYm5wRXhwKGUseikge1xuICAgICAgICAgICAgaWYoZSA+IDB4ZmZmZmZmZmYgfHwgZSA8IDEpIHJldHVybiBCaWdJbnRlZ2VyLk9ORTtcbiAgICAgICAgICAgIHZhciByID0gbmJpKCksIHIyID0gbmJpKCksIGcgPSB6LmNvbnZlcnQodGhpcyksIGkgPSBuYml0cyhlKS0xO1xuICAgICAgICAgICAgZy5jb3B5VG8ocik7XG4gICAgICAgICAgICB3aGlsZSgtLWkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHouc3FyVG8ocixyMik7XG4gICAgICAgICAgICAgICAgaWYoKGUmKDE8PGkpKSA+IDApIHoubXVsVG8ocjIsZyxyKTtcbiAgICAgICAgICAgICAgICBlbHNlIHsgdmFyIHQgPSByOyByID0gcjI7IHIyID0gdDsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHoucmV2ZXJ0KHIpO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXNeZSAlIG0sIDAgPD0gZSA8IDJeMzJcbiAgICBmdW5jdGlvbiBibk1vZFBvd0ludChlLG0pIHtcbiAgICAgICAgdmFyIHo7XG4gICAgICAgIGlmKGUgPCAyNTYgfHwgbS5pc0V2ZW4oKSkgeiA9IG5ldyBDbGFzc2ljKG0pOyBlbHNlIHogPSBuZXcgTW9udGdvbWVyeShtKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwKGUseik7XG4gICAgfVxuXG4gICAgLy8gcHJvdGVjdGVkXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29weVRvID0gYm5wQ29weVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZyb21JbnQgPSBibnBGcm9tSW50O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZyb21TdHJpbmcgPSBibnBGcm9tU3RyaW5nO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNsYW1wID0gYm5wQ2xhbXA7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGxTaGlmdFRvID0gYm5wRExTaGlmdFRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRyU2hpZnRUbyA9IGJucERSU2hpZnRUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sU2hpZnRUbyA9IGJucExTaGlmdFRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnJTaGlmdFRvID0gYm5wUlNoaWZ0VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc3ViVG8gPSBibnBTdWJUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseVRvID0gYm5wTXVsdGlwbHlUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zcXVhcmVUbyA9IGJucFNxdWFyZVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdlJlbVRvID0gYm5wRGl2UmVtVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaW52RGlnaXQgPSBibnBJbnZEaWdpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0V2ZW4gPSBibnBJc0V2ZW47XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYm5wRXhwID0gYm5wRXhwO1xuXG4gICAgLy8gcHVibGljXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9TdHJpbmcgPSBiblRvU3RyaW5nO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm5lZ2F0ZSA9IGJuTmVnYXRlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFicyA9IGJuQWJzO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmVUbyA9IGJuQ29tcGFyZVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aCA9IGJuQml0TGVuZ3RoO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZCA9IGJuTW9kO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvd0ludCA9IGJuTW9kUG93SW50O1xuXG4gICAgLy8gXCJjb25zdGFudHNcIlxuICAgIEJpZ0ludGVnZXIuWkVSTyA9IG5idigwKTtcbiAgICBCaWdJbnRlZ2VyLk9ORSA9IG5idigxKTtcblxuICAgIC8vIENvcHlyaWdodCAoYykgMjAwNS0yMDA5ICBUb20gV3VcbiAgICAvLyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgIC8vIFNlZSBcIkxJQ0VOU0VcIiBmb3IgZGV0YWlscy5cblxuICAgIC8vIEV4dGVuZGVkIEphdmFTY3JpcHQgQk4gZnVuY3Rpb25zLCByZXF1aXJlZCBmb3IgUlNBIHByaXZhdGUgb3BzLlxuXG4gICAgLy8gVmVyc2lvbiAxLjE6IG5ldyBCaWdJbnRlZ2VyKFwiMFwiLCAxMCkgcmV0dXJucyBcInByb3BlclwiIHplcm9cblxuICAgIC8vIChwdWJsaWMpXG4gICAgZnVuY3Rpb24gYm5DbG9uZSgpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5jb3B5VG8ocik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gdmFsdWUgYXMgaW50ZWdlclxuICAgIGZ1bmN0aW9uIGJuSW50VmFsdWUoKSB7XG4gICAgICAgIGlmKHRoaXMucyA8IDApIHtcbiAgICAgICAgICAgIGlmKHRoaXMudCA9PSAxKSByZXR1cm4gdGhpc1swXS10aGlzLkRWO1xuICAgICAgICAgICAgZWxzZSBpZih0aGlzLnQgPT0gMCkgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy50ID09IDEpIHJldHVybiB0aGlzWzBdO1xuICAgICAgICBlbHNlIGlmKHRoaXMudCA9PSAwKSByZXR1cm4gMDtcbiAgICAgICAgLy8gYXNzdW1lcyAxNiA8IERCIDwgMzJcbiAgICAgICAgcmV0dXJuICgodGhpc1sxXSYoKDE8PCgzMi10aGlzLkRCKSktMSkpPDx0aGlzLkRCKXx0aGlzWzBdO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiB2YWx1ZSBhcyBieXRlXG4gICAgZnVuY3Rpb24gYm5CeXRlVmFsdWUoKSB7IHJldHVybiAodGhpcy50PT0wKT90aGlzLnM6KHRoaXNbMF08PDI0KT4+MjQ7IH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiB2YWx1ZSBhcyBzaG9ydCAoYXNzdW1lcyBEQj49MTYpXG4gICAgZnVuY3Rpb24gYm5TaG9ydFZhbHVlKCkgeyByZXR1cm4gKHRoaXMudD09MCk/dGhpcy5zOih0aGlzWzBdPDwxNik+PjE2OyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByZXR1cm4geCBzLnQuIHJeeCA8IERWXG4gICAgZnVuY3Rpb24gYm5wQ2h1bmtTaXplKHIpIHsgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5MTjIqdGhpcy5EQi9NYXRoLmxvZyhyKSk7IH1cblxuICAgIC8vIChwdWJsaWMpIDAgaWYgdGhpcyA9PSAwLCAxIGlmIHRoaXMgPiAwXG4gICAgZnVuY3Rpb24gYm5TaWdOdW0oKSB7XG4gICAgICAgIGlmKHRoaXMucyA8IDApIHJldHVybiAtMTtcbiAgICAgICAgZWxzZSBpZih0aGlzLnQgPD0gMCB8fCAodGhpcy50ID09IDEgJiYgdGhpc1swXSA8PSAwKSkgcmV0dXJuIDA7XG4gICAgICAgIGVsc2UgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgY29udmVydCB0byByYWRpeCBzdHJpbmdcbiAgICBmdW5jdGlvbiBibnBUb1JhZGl4KGIpIHtcbiAgICAgICAgaWYoYiA9PSBudWxsKSBiID0gMTA7XG4gICAgICAgIGlmKHRoaXMuc2lnbnVtKCkgPT0gMCB8fCBiIDwgMiB8fCBiID4gMzYpIHJldHVybiBcIjBcIjtcbiAgICAgICAgdmFyIGNzID0gdGhpcy5jaHVua1NpemUoYik7XG4gICAgICAgIHZhciBhID0gTWF0aC5wb3coYixjcyk7XG4gICAgICAgIHZhciBkID0gbmJ2KGEpLCB5ID0gbmJpKCksIHogPSBuYmkoKSwgciA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGl2UmVtVG8oZCx5LHopO1xuICAgICAgICB3aGlsZSh5LnNpZ251bSgpID4gMCkge1xuICAgICAgICAgICAgciA9IChhK3ouaW50VmFsdWUoKSkudG9TdHJpbmcoYikuc3Vic3RyKDEpICsgcjtcbiAgICAgICAgICAgIHkuZGl2UmVtVG8oZCx5LHopO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB6LmludFZhbHVlKCkudG9TdHJpbmcoYikgKyByO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIGNvbnZlcnQgZnJvbSByYWRpeCBzdHJpbmdcbiAgICBmdW5jdGlvbiBibnBGcm9tUmFkaXgocyxiKSB7XG4gICAgICAgIHRoaXMuZnJvbUludCgwKTtcbiAgICAgICAgaWYoYiA9PSBudWxsKSBiID0gMTA7XG4gICAgICAgIHZhciBjcyA9IHRoaXMuY2h1bmtTaXplKGIpO1xuICAgICAgICB2YXIgZCA9IE1hdGgucG93KGIsY3MpLCBtaSA9IGZhbHNlLCBqID0gMCwgdyA9IDA7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgeCA9IGludEF0KHMsaSk7XG4gICAgICAgICAgICBpZih4IDwgMCkge1xuICAgICAgICAgICAgICAgIGlmKHMuY2hhckF0KGkpID09IFwiLVwiICYmIHRoaXMuc2lnbnVtKCkgPT0gMCkgbWkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdyA9IGIqdyt4O1xuICAgICAgICAgICAgaWYoKytqID49IGNzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kTXVsdGlwbHkoZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kQWRkT2Zmc2V0KHcsMCk7XG4gICAgICAgICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgICAgICAgdyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoaiA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZE11bHRpcGx5KE1hdGgucG93KGIsaikpO1xuICAgICAgICAgICAgdGhpcy5kQWRkT2Zmc2V0KHcsMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYobWkpIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyh0aGlzLHRoaXMpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIGFsdGVybmF0ZSBjb25zdHJ1Y3RvclxuICAgIGZ1bmN0aW9uIGJucEZyb21OdW1iZXIoYSxiLGMpIHtcbiAgICAgICAgaWYoXCJudW1iZXJcIiA9PSB0eXBlb2YgYikge1xuICAgICAgICAgICAgLy8gbmV3IEJpZ0ludGVnZXIoaW50LGludCxSTkcpXG4gICAgICAgICAgICBpZihhIDwgMikgdGhpcy5mcm9tSW50KDEpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcm9tTnVtYmVyKGEsYyk7XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMudGVzdEJpdChhLTEpKVx0Ly8gZm9yY2UgTVNCIHNldFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpdHdpc2VUbyhCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQoYS0xKSxvcF9vcix0aGlzKTtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmlzRXZlbigpKSB0aGlzLmRBZGRPZmZzZXQoMSwwKTsgLy8gZm9yY2Ugb2RkXG4gICAgICAgICAgICAgICAgd2hpbGUoIXRoaXMuaXNQcm9iYWJsZVByaW1lKGIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZEFkZE9mZnNldCgyLDApO1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmJpdExlbmd0aCgpID4gYSkgdGhpcy5zdWJUbyhCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQoYS0xKSx0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBuZXcgQmlnSW50ZWdlcihpbnQsUk5HKVxuICAgICAgICAgICAgdmFyIHggPSBbXSwgdCA9IGEmNztcbiAgICAgICAgICAgIHgubGVuZ3RoID0gKGE+PjMpKzE7XG4gICAgICAgICAgICBiLm5leHRCeXRlcyh4KTtcbiAgICAgICAgICAgIGlmKHQgPiAwKSB4WzBdICY9ICgoMTw8dCktMSk7IGVsc2UgeFswXSA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyb21TdHJpbmcoeCwyNTYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgY29udmVydCB0byBiaWdlbmRpYW4gYnl0ZSBhcnJheVxuICAgIGZ1bmN0aW9uIGJuVG9CeXRlQXJyYXkoKSB7XG4gICAgICAgIHZhciBpID0gdGhpcy50LCByID0gW107XG4gICAgICAgIHJbMF0gPSB0aGlzLnM7XG4gICAgICAgIHZhciBwID0gdGhpcy5EQi0oaSp0aGlzLkRCKSU4LCBkLCBrID0gMDtcbiAgICAgICAgaWYoaS0tID4gMCkge1xuICAgICAgICAgICAgaWYocCA8IHRoaXMuREIgJiYgKGQgPSB0aGlzW2ldPj5wKSAhPSAodGhpcy5zJnRoaXMuRE0pPj5wKVxuICAgICAgICAgICAgICAgIHJbaysrXSA9IGR8KHRoaXMuczw8KHRoaXMuREItcCkpO1xuICAgICAgICAgICAgd2hpbGUoaSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYocCA8IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldJigoMTw8cCktMSkpPDwoOC1wKTtcbiAgICAgICAgICAgICAgICAgICAgZCB8PSB0aGlzWy0taV0+PihwKz10aGlzLkRCLTgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9ICh0aGlzW2ldPj4ocC09OCkpJjB4ZmY7XG4gICAgICAgICAgICAgICAgICAgIGlmKHAgPD0gMCkgeyBwICs9IHRoaXMuREI7IC0taTsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZigoZCYweDgwKSAhPSAwKSBkIHw9IC0yNTY7XG4gICAgICAgICAgICAgICAgaWYoayA9PSAwICYmICh0aGlzLnMmMHg4MCkgIT0gKGQmMHg4MCkpICsraztcbiAgICAgICAgICAgICAgICBpZihrID4gMCB8fCBkICE9IHRoaXMucykgcltrKytdID0gZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBibkVxdWFscyhhKSB7IHJldHVybih0aGlzLmNvbXBhcmVUbyhhKT09MCk7IH1cbiAgICBmdW5jdGlvbiBibk1pbihhKSB7IHJldHVybih0aGlzLmNvbXBhcmVUbyhhKTwwKT90aGlzOmE7IH1cbiAgICBmdW5jdGlvbiBibk1heChhKSB7IHJldHVybih0aGlzLmNvbXBhcmVUbyhhKT4wKT90aGlzOmE7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzIG9wIGEgKGJpdHdpc2UpXG4gICAgZnVuY3Rpb24gYm5wQml0d2lzZVRvKGEsb3Ascikge1xuICAgICAgICB2YXIgaSwgZiwgbSA9IE1hdGgubWluKGEudCx0aGlzLnQpO1xuICAgICAgICBmb3IoaSA9IDA7IGkgPCBtOyArK2kpIHJbaV0gPSBvcCh0aGlzW2ldLGFbaV0pO1xuICAgICAgICBpZihhLnQgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgIGYgPSBhLnMmdGhpcy5ETTtcbiAgICAgICAgICAgIGZvcihpID0gbTsgaSA8IHRoaXMudDsgKytpKSByW2ldID0gb3AodGhpc1tpXSxmKTtcbiAgICAgICAgICAgIHIudCA9IHRoaXMudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGYgPSB0aGlzLnMmdGhpcy5ETTtcbiAgICAgICAgICAgIGZvcihpID0gbTsgaSA8IGEudDsgKytpKSByW2ldID0gb3AoZixhW2ldKTtcbiAgICAgICAgICAgIHIudCA9IGEudDtcbiAgICAgICAgfVxuICAgICAgICByLnMgPSBvcCh0aGlzLnMsYS5zKTtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgJiBhXG4gICAgZnVuY3Rpb24gb3BfYW5kKHgseSkgeyByZXR1cm4geCZ5OyB9XG4gICAgZnVuY3Rpb24gYm5BbmQoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmJpdHdpc2VUbyhhLG9wX2FuZCxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgfCBhXG4gICAgZnVuY3Rpb24gb3Bfb3IoeCx5KSB7IHJldHVybiB4fHk7IH1cbiAgICBmdW5jdGlvbiBibk9yKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5iaXR3aXNlVG8oYSxvcF9vcixyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgXiBhXG4gICAgZnVuY3Rpb24gb3BfeG9yKHgseSkgeyByZXR1cm4geF55OyB9XG4gICAgZnVuY3Rpb24gYm5Yb3IoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmJpdHdpc2VUbyhhLG9wX3hvcixyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgJiB+YVxuICAgIGZ1bmN0aW9uIG9wX2FuZG5vdCh4LHkpIHsgcmV0dXJuIHgmfnk7IH1cbiAgICBmdW5jdGlvbiBibkFuZE5vdChhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuYml0d2lzZVRvKGEsb3BfYW5kbm90LHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgfnRoaXNcbiAgICBmdW5jdGlvbiBibk5vdCgpIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKSByW2ldID0gdGhpcy5ETSZ+dGhpc1tpXTtcbiAgICAgICAgci50ID0gdGhpcy50O1xuICAgICAgICByLnMgPSB+dGhpcy5zO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIDw8IG5cbiAgICBmdW5jdGlvbiBiblNoaWZ0TGVmdChuKSB7XG4gICAgICAgIHZhciByID0gbmJpKCk7XG4gICAgICAgIGlmKG4gPCAwKSB0aGlzLnJTaGlmdFRvKC1uLHIpOyBlbHNlIHRoaXMubFNoaWZ0VG8obixyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyA+PiBuXG4gICAgZnVuY3Rpb24gYm5TaGlmdFJpZ2h0KG4pIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgaWYobiA8IDApIHRoaXMubFNoaWZ0VG8oLW4scik7IGVsc2UgdGhpcy5yU2hpZnRUbyhuLHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gaW5kZXggb2YgbG93ZXN0IDEtYml0IGluIHgsIHggPCAyXjMxXG4gICAgZnVuY3Rpb24gbGJpdCh4KSB7XG4gICAgICAgIGlmKHggPT0gMCkgcmV0dXJuIC0xO1xuICAgICAgICB2YXIgciA9IDA7XG4gICAgICAgIGlmKCh4JjB4ZmZmZikgPT0gMCkgeyB4ID4+PSAxNjsgciArPSAxNjsgfVxuICAgICAgICBpZigoeCYweGZmKSA9PSAwKSB7IHggPj49IDg7IHIgKz0gODsgfVxuICAgICAgICBpZigoeCYweGYpID09IDApIHsgeCA+Pj0gNDsgciArPSA0OyB9XG4gICAgICAgIGlmKCh4JjMpID09IDApIHsgeCA+Pj0gMjsgciArPSAyOyB9XG4gICAgICAgIGlmKCh4JjEpID09IDApICsrcjtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJucyBpbmRleCBvZiBsb3dlc3QgMS1iaXQgKG9yIC0xIGlmIG5vbmUpXG4gICAgZnVuY3Rpb24gYm5HZXRMb3dlc3RTZXRCaXQoKSB7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnQ7ICsraSlcbiAgICAgICAgICAgIGlmKHRoaXNbaV0gIT0gMCkgcmV0dXJuIGkqdGhpcy5EQitsYml0KHRoaXNbaV0pO1xuICAgICAgICBpZih0aGlzLnMgPCAwKSByZXR1cm4gdGhpcy50KnRoaXMuREI7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gbnVtYmVyIG9mIDEgYml0cyBpbiB4XG4gICAgZnVuY3Rpb24gY2JpdCh4KSB7XG4gICAgICAgIHZhciByID0gMDtcbiAgICAgICAgd2hpbGUoeCAhPSAwKSB7IHggJj0geC0xOyArK3I7IH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIG51bWJlciBvZiBzZXQgYml0c1xuICAgIGZ1bmN0aW9uIGJuQml0Q291bnQoKSB7XG4gICAgICAgIHZhciByID0gMCwgeCA9IHRoaXMucyZ0aGlzLkRNO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy50OyArK2kpIHIgKz0gY2JpdCh0aGlzW2ldXngpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0cnVlIGlmZiBudGggYml0IGlzIHNldFxuICAgIGZ1bmN0aW9uIGJuVGVzdEJpdChuKSB7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihuL3RoaXMuREIpO1xuICAgICAgICBpZihqID49IHRoaXMudCkgcmV0dXJuKHRoaXMucyE9MCk7XG4gICAgICAgIHJldHVybigodGhpc1tqXSYoMTw8KG4ldGhpcy5EQikpKSE9MCk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdGhpcyBvcCAoMTw8bilcbiAgICBmdW5jdGlvbiBibnBDaGFuZ2VCaXQobixvcCkge1xuICAgICAgICB2YXIgciA9IEJpZ0ludGVnZXIuT05FLnNoaWZ0TGVmdChuKTtcbiAgICAgICAgdGhpcy5iaXR3aXNlVG8ocixvcCxyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyB8ICgxPDxuKVxuICAgIGZ1bmN0aW9uIGJuU2V0Qml0KG4pIHsgcmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3Bfb3IpOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICYgfigxPDxuKVxuICAgIGZ1bmN0aW9uIGJuQ2xlYXJCaXQobikgeyByZXR1cm4gdGhpcy5jaGFuZ2VCaXQobixvcF9hbmRub3QpOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIF4gKDE8PG4pXG4gICAgZnVuY3Rpb24gYm5GbGlwQml0KG4pIHsgcmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3BfeG9yKTsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgKyBhXG4gICAgZnVuY3Rpb24gYm5wQWRkVG8oYSxyKSB7XG4gICAgICAgIHZhciBpID0gMCwgYyA9IDAsIG0gPSBNYXRoLm1pbihhLnQsdGhpcy50KTtcbiAgICAgICAgd2hpbGUoaSA8IG0pIHtcbiAgICAgICAgICAgIGMgKz0gdGhpc1tpXSthW2ldO1xuICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgfVxuICAgICAgICBpZihhLnQgPCB0aGlzLnQpIHtcbiAgICAgICAgICAgIGMgKz0gYS5zO1xuICAgICAgICAgICAgd2hpbGUoaSA8IHRoaXMudCkge1xuICAgICAgICAgICAgICAgIGMgKz0gdGhpc1tpXTtcbiAgICAgICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICAgICAgYyA+Pj0gdGhpcy5EQjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgKz0gdGhpcy5zO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYyArPSB0aGlzLnM7XG4gICAgICAgICAgICB3aGlsZShpIDwgYS50KSB7XG4gICAgICAgICAgICAgICAgYyArPSBhW2ldO1xuICAgICAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyArPSBhLnM7XG4gICAgICAgIH1cbiAgICAgICAgci5zID0gKGM8MCk/LTE6MDtcbiAgICAgICAgaWYoYyA+IDApIHJbaSsrXSA9IGM7XG4gICAgICAgIGVsc2UgaWYoYyA8IC0xKSByW2krK10gPSB0aGlzLkRWK2M7XG4gICAgICAgIHIudCA9IGk7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICsgYVxuICAgIGZ1bmN0aW9uIGJuQWRkKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5hZGRUbyhhLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAtIGFcbiAgICBmdW5jdGlvbiBiblN1YnRyYWN0KGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5zdWJUbyhhLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAqIGFcbiAgICBmdW5jdGlvbiBibk11bHRpcGx5KGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5tdWx0aXBseVRvKGEscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIC8gYVxuICAgIGZ1bmN0aW9uIGJuRGl2aWRlKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5kaXZSZW1UbyhhLHIsbnVsbCk7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICUgYVxuICAgIGZ1bmN0aW9uIGJuUmVtYWluZGVyKGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5kaXZSZW1UbyhhLG51bGwscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSBbdGhpcy9hLHRoaXMlYV1cbiAgICBmdW5jdGlvbiBibkRpdmlkZUFuZFJlbWFpbmRlcihhKSB7XG4gICAgICAgIHZhciBxID0gbmJpKCksIHIgPSBuYmkoKTtcbiAgICAgICAgdGhpcy5kaXZSZW1UbyhhLHEscik7XG4gICAgICAgIHJldHVybiBbcSxyXTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0aGlzICo9IG4sIHRoaXMgPj0gMCwgMSA8IG4gPCBEVlxuICAgIGZ1bmN0aW9uIGJucERNdWx0aXBseShuKSB7XG4gICAgICAgIHRoaXNbdGhpcy50XSA9IHRoaXMuYW0oMCxuLTEsdGhpcywwLDAsdGhpcy50KTtcbiAgICAgICAgKyt0aGlzLnQ7XG4gICAgICAgIHRoaXMuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0aGlzICs9IG4gPDwgdyB3b3JkcywgdGhpcyA+PSAwXG4gICAgZnVuY3Rpb24gYm5wREFkZE9mZnNldChuLHcpIHtcbiAgICAgICAgaWYobiA9PSAwKSByZXR1cm47XG4gICAgICAgIHdoaWxlKHRoaXMudCA8PSB3KSB0aGlzW3RoaXMudCsrXSA9IDA7XG4gICAgICAgIHRoaXNbd10gKz0gbjtcbiAgICAgICAgd2hpbGUodGhpc1t3XSA+PSB0aGlzLkRWKSB7XG4gICAgICAgICAgICB0aGlzW3ddIC09IHRoaXMuRFY7XG4gICAgICAgICAgICBpZigrK3cgPj0gdGhpcy50KSB0aGlzW3RoaXMudCsrXSA9IDA7XG4gICAgICAgICAgICArK3RoaXNbd107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBIFwibnVsbFwiIHJlZHVjZXJcbiAgICBmdW5jdGlvbiBOdWxsRXhwKCkge31cbiAgICBmdW5jdGlvbiBuTm9wKHgpIHsgcmV0dXJuIHg7IH1cbiAgICBmdW5jdGlvbiBuTXVsVG8oeCx5LHIpIHsgeC5tdWx0aXBseVRvKHkscik7IH1cbiAgICBmdW5jdGlvbiBuU3FyVG8oeCxyKSB7IHguc3F1YXJlVG8ocik7IH1cblxuICAgIE51bGxFeHAucHJvdG90eXBlLmNvbnZlcnQgPSBuTm9wO1xuICAgIE51bGxFeHAucHJvdG90eXBlLnJldmVydCA9IG5Ob3A7XG4gICAgTnVsbEV4cC5wcm90b3R5cGUubXVsVG8gPSBuTXVsVG87XG4gICAgTnVsbEV4cC5wcm90b3R5cGUuc3FyVG8gPSBuU3FyVG87XG5cbiAgICAvLyAocHVibGljKSB0aGlzXmVcbiAgICBmdW5jdGlvbiBiblBvdyhlKSB7IHJldHVybiB0aGlzLmJucEV4cChlLG5ldyBOdWxsRXhwKCkpOyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gbG93ZXIgbiB3b3JkcyBvZiBcInRoaXMgKiBhXCIsIGEudCA8PSBuXG4gICAgLy8gXCJ0aGlzXCIgc2hvdWxkIGJlIHRoZSBsYXJnZXIgb25lIGlmIGFwcHJvcHJpYXRlLlxuICAgIGZ1bmN0aW9uIGJucE11bHRpcGx5TG93ZXJUbyhhLG4scikge1xuICAgICAgICB2YXIgaSA9IE1hdGgubWluKHRoaXMudCthLnQsbik7XG4gICAgICAgIHIucyA9IDA7IC8vIGFzc3VtZXMgYSx0aGlzID49IDBcbiAgICAgICAgci50ID0gaTtcbiAgICAgICAgd2hpbGUoaSA+IDApIHJbLS1pXSA9IDA7XG4gICAgICAgIHZhciBqO1xuICAgICAgICBmb3IoaiA9IHIudC10aGlzLnQ7IGkgPCBqOyArK2kpIHJbaSt0aGlzLnRdID0gdGhpcy5hbSgwLGFbaV0scixpLDAsdGhpcy50KTtcbiAgICAgICAgZm9yKGogPSBNYXRoLm1pbihhLnQsbik7IGkgPCBqOyArK2kpIHRoaXMuYW0oMCxhW2ldLHIsaSwwLG4taSk7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gXCJ0aGlzICogYVwiIHdpdGhvdXQgbG93ZXIgbiB3b3JkcywgbiA+IDBcbiAgICAvLyBcInRoaXNcIiBzaG91bGQgYmUgdGhlIGxhcmdlciBvbmUgaWYgYXBwcm9wcmlhdGUuXG4gICAgZnVuY3Rpb24gYm5wTXVsdGlwbHlVcHBlclRvKGEsbixyKSB7XG4gICAgICAgIC0tbjtcbiAgICAgICAgdmFyIGkgPSByLnQgPSB0aGlzLnQrYS50LW47XG4gICAgICAgIHIucyA9IDA7IC8vIGFzc3VtZXMgYSx0aGlzID49IDBcbiAgICAgICAgd2hpbGUoLS1pID49IDApIHJbaV0gPSAwO1xuICAgICAgICBmb3IoaSA9IE1hdGgubWF4KG4tdGhpcy50LDApOyBpIDwgYS50OyArK2kpXG4gICAgICAgICAgICByW3RoaXMudCtpLW5dID0gdGhpcy5hbShuLWksYVtpXSxyLDAsMCx0aGlzLnQraS1uKTtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgICAgICByLmRyU2hpZnRUbygxLHIpO1xuICAgIH1cblxuICAgIC8vIEJhcnJldHQgbW9kdWxhciByZWR1Y3Rpb25cbiAgICBmdW5jdGlvbiBCYXJyZXR0KG0pIHtcbiAgICAgICAgLy8gc2V0dXAgQmFycmV0dFxuICAgICAgICB0aGlzLnIyID0gbmJpKCk7XG4gICAgICAgIHRoaXMucTMgPSBuYmkoKTtcbiAgICAgICAgQmlnSW50ZWdlci5PTkUuZGxTaGlmdFRvKDIqbS50LHRoaXMucjIpO1xuICAgICAgICB0aGlzLm11ID0gdGhpcy5yMi5kaXZpZGUobSk7XG4gICAgICAgIHRoaXMubSA9IG07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFycmV0dENvbnZlcnQoeCkge1xuICAgICAgICBpZih4LnMgPCAwIHx8IHgudCA+IDIqdGhpcy5tLnQpIHJldHVybiB4Lm1vZCh0aGlzLm0pO1xuICAgICAgICBlbHNlIGlmKHguY29tcGFyZVRvKHRoaXMubSkgPCAwKSByZXR1cm4geDtcbiAgICAgICAgZWxzZSB7IHZhciByID0gbmJpKCk7IHguY29weVRvKHIpOyB0aGlzLnJlZHVjZShyKTsgcmV0dXJuIHI7IH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYXJyZXR0UmV2ZXJ0KHgpIHsgcmV0dXJuIHg7IH1cblxuICAgIC8vIHggPSB4IG1vZCBtIChIQUMgMTQuNDIpXG4gICAgZnVuY3Rpb24gYmFycmV0dFJlZHVjZSh4KSB7XG4gICAgICAgIHguZHJTaGlmdFRvKHRoaXMubS50LTEsdGhpcy5yMik7XG4gICAgICAgIGlmKHgudCA+IHRoaXMubS50KzEpIHsgeC50ID0gdGhpcy5tLnQrMTsgeC5jbGFtcCgpOyB9XG4gICAgICAgIHRoaXMubXUubXVsdGlwbHlVcHBlclRvKHRoaXMucjIsdGhpcy5tLnQrMSx0aGlzLnEzKTtcbiAgICAgICAgdGhpcy5tLm11bHRpcGx5TG93ZXJUbyh0aGlzLnEzLHRoaXMubS50KzEsdGhpcy5yMik7XG4gICAgICAgIHdoaWxlKHguY29tcGFyZVRvKHRoaXMucjIpIDwgMCkgeC5kQWRkT2Zmc2V0KDEsdGhpcy5tLnQrMSk7XG4gICAgICAgIHguc3ViVG8odGhpcy5yMix4KTtcbiAgICAgICAgd2hpbGUoeC5jb21wYXJlVG8odGhpcy5tKSA+PSAwKSB4LnN1YlRvKHRoaXMubSx4KTtcbiAgICB9XG5cbiAgICAvLyByID0geF4yIG1vZCBtOyB4ICE9IHJcbiAgICBmdW5jdGlvbiBiYXJyZXR0U3FyVG8oeCxyKSB7IHguc3F1YXJlVG8ocik7IHRoaXMucmVkdWNlKHIpOyB9XG5cbiAgICAvLyByID0geCp5IG1vZCBtOyB4LHkgIT0gclxuICAgIGZ1bmN0aW9uIGJhcnJldHRNdWxUbyh4LHkscikgeyB4Lm11bHRpcGx5VG8oeSxyKTsgdGhpcy5yZWR1Y2Uocik7IH1cblxuICAgIEJhcnJldHQucHJvdG90eXBlLmNvbnZlcnQgPSBiYXJyZXR0Q29udmVydDtcbiAgICBCYXJyZXR0LnByb3RvdHlwZS5yZXZlcnQgPSBiYXJyZXR0UmV2ZXJ0O1xuICAgIEJhcnJldHQucHJvdG90eXBlLnJlZHVjZSA9IGJhcnJldHRSZWR1Y2U7XG4gICAgQmFycmV0dC5wcm90b3R5cGUubXVsVG8gPSBiYXJyZXR0TXVsVG87XG4gICAgQmFycmV0dC5wcm90b3R5cGUuc3FyVG8gPSBiYXJyZXR0U3FyVG87XG5cbiAgICAvLyAocHVibGljKSB0aGlzXmUgJSBtIChIQUMgMTQuODUpXG4gICAgZnVuY3Rpb24gYm5Nb2RQb3coZSxtKSB7XG4gICAgICAgIHZhciBpID0gZS5iaXRMZW5ndGgoKSwgaywgciA9IG5idigxKSwgejtcbiAgICAgICAgaWYoaSA8PSAwKSByZXR1cm4gcjtcbiAgICAgICAgZWxzZSBpZihpIDwgMTgpIGsgPSAxO1xuICAgICAgICBlbHNlIGlmKGkgPCA0OCkgayA9IDM7XG4gICAgICAgIGVsc2UgaWYoaSA8IDE0NCkgayA9IDQ7XG4gICAgICAgIGVsc2UgaWYoaSA8IDc2OCkgayA9IDU7XG4gICAgICAgIGVsc2UgayA9IDY7XG4gICAgICAgIGlmKGkgPCA4KVxuICAgICAgICAgICAgeiA9IG5ldyBDbGFzc2ljKG0pO1xuICAgICAgICBlbHNlIGlmKG0uaXNFdmVuKCkpXG4gICAgICAgICAgICB6ID0gbmV3IEJhcnJldHQobSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHogPSBuZXcgTW9udGdvbWVyeShtKTtcblxuICAgICAgICAvLyBwcmVjb21wdXRhdGlvblxuICAgICAgICB2YXIgZyA9IFtdLCBuID0gMywgazEgPSBrLTEsIGttID0gKDE8PGspLTE7XG4gICAgICAgIGdbMV0gPSB6LmNvbnZlcnQodGhpcyk7XG4gICAgICAgIGlmKGsgPiAxKSB7XG4gICAgICAgICAgICB2YXIgZzIgPSBuYmkoKTtcbiAgICAgICAgICAgIHouc3FyVG8oZ1sxXSxnMik7XG4gICAgICAgICAgICB3aGlsZShuIDw9IGttKSB7XG4gICAgICAgICAgICAgICAgZ1tuXSA9IG5iaSgpO1xuICAgICAgICAgICAgICAgIHoubXVsVG8oZzIsZ1tuLTJdLGdbbl0pO1xuICAgICAgICAgICAgICAgIG4gKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBqID0gZS50LTEsIHcsIGlzMSA9IHRydWUsIHIyID0gbmJpKCksIHQ7XG4gICAgICAgIGkgPSBuYml0cyhlW2pdKS0xO1xuICAgICAgICB3aGlsZShqID49IDApIHtcbiAgICAgICAgICAgIGlmKGkgPj0gazEpIHcgPSAoZVtqXT4+KGktazEpKSZrbTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHcgPSAoZVtqXSYoKDE8PChpKzEpKS0xKSk8PChrMS1pKTtcbiAgICAgICAgICAgICAgICBpZihqID4gMCkgdyB8PSBlW2otMV0+Pih0aGlzLkRCK2ktazEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuID0gaztcbiAgICAgICAgICAgIHdoaWxlKCh3JjEpID09IDApIHsgdyA+Pj0gMTsgLS1uOyB9XG4gICAgICAgICAgICBpZigoaSAtPSBuKSA8IDApIHsgaSArPSB0aGlzLkRCOyAtLWo7IH1cbiAgICAgICAgICAgIGlmKGlzMSkge1x0Ly8gcmV0ID09IDEsIGRvbid0IGJvdGhlciBzcXVhcmluZyBvciBtdWx0aXBseWluZyBpdFxuICAgICAgICAgICAgICAgIGdbd10uY29weVRvKHIpO1xuICAgICAgICAgICAgICAgIGlzMSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgd2hpbGUobiA+IDEpIHsgei5zcXJUbyhyLHIyKTsgei5zcXJUbyhyMixyKTsgbiAtPSAyOyB9XG4gICAgICAgICAgICAgICAgaWYobiA+IDApIHouc3FyVG8ocixyMik7IGVsc2UgeyB0ID0gcjsgciA9IHIyOyByMiA9IHQ7IH1cbiAgICAgICAgICAgICAgICB6Lm11bFRvKHIyLGdbd10scik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlKGogPj0gMCAmJiAoZVtqXSYoMTw8aSkpID09IDApIHtcbiAgICAgICAgICAgICAgICB6LnNxclRvKHIscjIpOyB0ID0gcjsgciA9IHIyOyByMiA9IHQ7XG4gICAgICAgICAgICAgICAgaWYoLS1pIDwgMCkgeyBpID0gdGhpcy5EQi0xOyAtLWo7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gei5yZXZlcnQocik7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgZ2NkKHRoaXMsYSkgKEhBQyAxNC41NClcbiAgICBmdW5jdGlvbiBibkdDRChhKSB7XG4gICAgICAgIHZhciB4ID0gKHRoaXMuczwwKT90aGlzLm5lZ2F0ZSgpOnRoaXMuY2xvbmUoKTtcbiAgICAgICAgdmFyIHkgPSAoYS5zPDApP2EubmVnYXRlKCk6YS5jbG9uZSgpO1xuICAgICAgICBpZih4LmNvbXBhcmVUbyh5KSA8IDApIHsgdmFyIHQgPSB4OyB4ID0geTsgeSA9IHQ7IH1cbiAgICAgICAgdmFyIGkgPSB4LmdldExvd2VzdFNldEJpdCgpLCBnID0geS5nZXRMb3dlc3RTZXRCaXQoKTtcbiAgICAgICAgaWYoZyA8IDApIHJldHVybiB4O1xuICAgICAgICBpZihpIDwgZykgZyA9IGk7XG4gICAgICAgIGlmKGcgPiAwKSB7XG4gICAgICAgICAgICB4LnJTaGlmdFRvKGcseCk7XG4gICAgICAgICAgICB5LnJTaGlmdFRvKGcseSk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUoeC5zaWdudW0oKSA+IDApIHtcbiAgICAgICAgICAgIGlmKChpID0geC5nZXRMb3dlc3RTZXRCaXQoKSkgPiAwKSB4LnJTaGlmdFRvKGkseCk7XG4gICAgICAgICAgICBpZigoaSA9IHkuZ2V0TG93ZXN0U2V0Qml0KCkpID4gMCkgeS5yU2hpZnRUbyhpLHkpO1xuICAgICAgICAgICAgaWYoeC5jb21wYXJlVG8oeSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIHguc3ViVG8oeSx4KTtcbiAgICAgICAgICAgICAgICB4LnJTaGlmdFRvKDEseCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5LnN1YlRvKHgseSk7XG4gICAgICAgICAgICAgICAgeS5yU2hpZnRUbygxLHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGcgPiAwKSB5LmxTaGlmdFRvKGcseSk7XG4gICAgICAgIHJldHVybiB5O1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRoaXMgJSBuLCBuIDwgMl4yNlxuICAgIGZ1bmN0aW9uIGJucE1vZEludChuKSB7XG4gICAgICAgIGlmKG4gPD0gMCkgcmV0dXJuIDA7XG4gICAgICAgIHZhciBkID0gdGhpcy5EViVuLCByID0gKHRoaXMuczwwKT9uLTE6MDtcbiAgICAgICAgaWYodGhpcy50ID4gMClcbiAgICAgICAgICAgIGlmKGQgPT0gMCkgciA9IHRoaXNbMF0lbjtcbiAgICAgICAgZWxzZSBmb3IodmFyIGkgPSB0aGlzLnQtMTsgaSA+PSAwOyAtLWkpIHIgPSAoZCpyK3RoaXNbaV0pJW47XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIDEvdGhpcyAlIG0gKEhBQyAxNC42MSlcbiAgICBmdW5jdGlvbiBibk1vZEludmVyc2UobSkge1xuICAgICAgICB2YXIgYWMgPSBtLmlzRXZlbigpO1xuICAgICAgICBpZigodGhpcy5pc0V2ZW4oKSAmJiBhYykgfHwgbS5zaWdudW0oKSA9PSAwKSByZXR1cm4gQmlnSW50ZWdlci5aRVJPO1xuICAgICAgICB2YXIgdSA9IG0uY2xvbmUoKSwgdiA9IHRoaXMuY2xvbmUoKTtcbiAgICAgICAgdmFyIGEgPSBuYnYoMSksIGIgPSBuYnYoMCksIGMgPSBuYnYoMCksIGQgPSBuYnYoMSk7XG4gICAgICAgIHdoaWxlKHUuc2lnbnVtKCkgIT0gMCkge1xuICAgICAgICAgICAgd2hpbGUodS5pc0V2ZW4oKSkge1xuICAgICAgICAgICAgICAgIHUuclNoaWZ0VG8oMSx1KTtcbiAgICAgICAgICAgICAgICBpZihhYykge1xuICAgICAgICAgICAgICAgICAgICBpZighYS5pc0V2ZW4oKSB8fCAhYi5pc0V2ZW4oKSkgeyBhLmFkZFRvKHRoaXMsYSk7IGIuc3ViVG8obSxiKTsgfVxuICAgICAgICAgICAgICAgICAgICBhLnJTaGlmdFRvKDEsYSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoIWIuaXNFdmVuKCkpIGIuc3ViVG8obSxiKTtcbiAgICAgICAgICAgICAgICBiLnJTaGlmdFRvKDEsYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSh2LmlzRXZlbigpKSB7XG4gICAgICAgICAgICAgICAgdi5yU2hpZnRUbygxLHYpO1xuICAgICAgICAgICAgICAgIGlmKGFjKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCFjLmlzRXZlbigpIHx8ICFkLmlzRXZlbigpKSB7IGMuYWRkVG8odGhpcyxjKTsgZC5zdWJUbyhtLGQpOyB9XG4gICAgICAgICAgICAgICAgICAgIGMuclNoaWZ0VG8oMSxjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZighZC5pc0V2ZW4oKSkgZC5zdWJUbyhtLGQpO1xuICAgICAgICAgICAgICAgIGQuclNoaWZ0VG8oMSxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHUuY29tcGFyZVRvKHYpID49IDApIHtcbiAgICAgICAgICAgICAgICB1LnN1YlRvKHYsdSk7XG4gICAgICAgICAgICAgICAgaWYoYWMpIGEuc3ViVG8oYyxhKTtcbiAgICAgICAgICAgICAgICBiLnN1YlRvKGQsYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2LnN1YlRvKHUsdik7XG4gICAgICAgICAgICAgICAgaWYoYWMpIGMuc3ViVG8oYSxjKTtcbiAgICAgICAgICAgICAgICBkLnN1YlRvKGIsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYodi5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpICE9IDApIHJldHVybiBCaWdJbnRlZ2VyLlpFUk87XG4gICAgICAgIGlmKGQuY29tcGFyZVRvKG0pID49IDApIHJldHVybiBkLnN1YnRyYWN0KG0pO1xuICAgICAgICBpZihkLnNpZ251bSgpIDwgMCkgZC5hZGRUbyhtLGQpOyBlbHNlIHJldHVybiBkO1xuICAgICAgICBpZihkLnNpZ251bSgpIDwgMCkgcmV0dXJuIGQuYWRkKG0pOyBlbHNlIHJldHVybiBkO1xuICAgIH1cblxuICAgIHZhciBsb3dwcmltZXMgPSBbMiwzLDUsNywxMSwxMywxNywxOSwyMywyOSwzMSwzNyw0MSw0Myw0Nyw1Myw1OSw2MSw2Nyw3MSw3Myw3OSw4Myw4OSw5NywxMDEsMTAzLDEwNywxMDksMTEzLDEyNywxMzEsMTM3LDEzOSwxNDksMTUxLDE1NywxNjMsMTY3LDE3MywxNzksMTgxLDE5MSwxOTMsMTk3LDE5OSwyMTEsMjIzLDIyNywyMjksMjMzLDIzOSwyNDEsMjUxLDI1NywyNjMsMjY5LDI3MSwyNzcsMjgxLDI4MywyOTMsMzA3LDMxMSwzMTMsMzE3LDMzMSwzMzcsMzQ3LDM0OSwzNTMsMzU5LDM2NywzNzMsMzc5LDM4MywzODksMzk3LDQwMSw0MDksNDE5LDQyMSw0MzEsNDMzLDQzOSw0NDMsNDQ5LDQ1Nyw0NjEsNDYzLDQ2Nyw0NzksNDg3LDQ5MSw0OTksNTAzLDUwOV07XG4gICAgdmFyIGxwbGltID0gKDE8PDI2KS9sb3dwcmltZXNbbG93cHJpbWVzLmxlbmd0aC0xXTtcblxuICAgIC8vIChwdWJsaWMpIHRlc3QgcHJpbWFsaXR5IHdpdGggY2VydGFpbnR5ID49IDEtLjVedFxuICAgIGZ1bmN0aW9uIGJuSXNQcm9iYWJsZVByaW1lKHQpIHtcbiAgICAgICAgdmFyIGksIHggPSB0aGlzLmFicygpO1xuICAgICAgICBpZih4LnQgPT0gMSAmJiB4WzBdIDw9IGxvd3ByaW1lc1tsb3dwcmltZXMubGVuZ3RoLTFdKSB7XG4gICAgICAgICAgICBmb3IoaSA9IDA7IGkgPCBsb3dwcmltZXMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgaWYoeFswXSA9PSBsb3dwcmltZXNbaV0pIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmKHguaXNFdmVuKCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaSA9IDE7XG4gICAgICAgIHdoaWxlKGkgPCBsb3dwcmltZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IGxvd3ByaW1lc1tpXSwgaiA9IGkrMTtcbiAgICAgICAgICAgIHdoaWxlKGogPCBsb3dwcmltZXMubGVuZ3RoICYmIG0gPCBscGxpbSkgbSAqPSBsb3dwcmltZXNbaisrXTtcbiAgICAgICAgICAgIG0gPSB4Lm1vZEludChtKTtcbiAgICAgICAgICAgIHdoaWxlKGkgPCBqKSBpZihtJWxvd3ByaW1lc1tpKytdID09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geC5taWxsZXJSYWJpbih0KTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0cnVlIGlmIHByb2JhYmx5IHByaW1lIChIQUMgNC4yNCwgTWlsbGVyLVJhYmluKVxuICAgIGZ1bmN0aW9uIGJucE1pbGxlclJhYmluKHQpIHtcbiAgICAgICAgdmFyIG4xID0gdGhpcy5zdWJ0cmFjdChCaWdJbnRlZ2VyLk9ORSk7XG4gICAgICAgIHZhciBrID0gbjEuZ2V0TG93ZXN0U2V0Qml0KCk7XG4gICAgICAgIGlmKGsgPD0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgciA9IG4xLnNoaWZ0UmlnaHQoayk7XG4gICAgICAgIHQgPSAodCsxKT4+MTtcbiAgICAgICAgaWYodCA+IGxvd3ByaW1lcy5sZW5ndGgpIHQgPSBsb3dwcmltZXMubGVuZ3RoO1xuICAgICAgICB2YXIgYSA9IG5iaSgpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdDsgKytpKSB7XG4gICAgICAgICAgICBhLmZyb21JbnQobG93cHJpbWVzW2ldKTtcbiAgICAgICAgICAgIHZhciB5ID0gYS5tb2RQb3cocix0aGlzKTtcbiAgICAgICAgICAgIGlmKHkuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSAhPSAwICYmIHkuY29tcGFyZVRvKG4xKSAhPSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGogPSAxO1xuICAgICAgICAgICAgICAgIHdoaWxlKGorKyA8IGsgJiYgeS5jb21wYXJlVG8objEpICE9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHkubW9kUG93SW50KDIsdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHkuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHkuY29tcGFyZVRvKG4xKSAhPSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cblxuICAgIC8vIHByb3RlY3RlZFxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNodW5rU2l6ZSA9IGJucENodW5rU2l6ZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1JhZGl4ID0gYm5wVG9SYWRpeDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tUmFkaXggPSBibnBGcm9tUmFkaXg7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbU51bWJlciA9IGJucEZyb21OdW1iZXI7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYml0d2lzZVRvID0gYm5wQml0d2lzZVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNoYW5nZUJpdCA9IGJucENoYW5nZUJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGRUbyA9IGJucEFkZFRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRNdWx0aXBseSA9IGJucERNdWx0aXBseTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kQWRkT2Zmc2V0ID0gYm5wREFkZE9mZnNldDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseUxvd2VyVG8gPSBibnBNdWx0aXBseUxvd2VyVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHlVcHBlclRvID0gYm5wTXVsdGlwbHlVcHBlclRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludCA9IGJucE1vZEludDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5taWxsZXJSYWJpbiA9IGJucE1pbGxlclJhYmluO1xuXG4gICAgLy8gcHVibGljXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2xvbmUgPSBibkNsb25lO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmludFZhbHVlID0gYm5JbnRWYWx1ZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ieXRlVmFsdWUgPSBibkJ5dGVWYWx1ZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaG9ydFZhbHVlID0gYm5TaG9ydFZhbHVlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNpZ251bSA9IGJuU2lnTnVtO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvQnl0ZUFycmF5ID0gYm5Ub0J5dGVBcnJheTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHMgPSBibkVxdWFscztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5taW4gPSBibk1pbjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tYXggPSBibk1heDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmQgPSBibkFuZDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5vciA9IGJuT3I7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUueG9yID0gYm5Yb3I7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW5kTm90ID0gYm5BbmROb3Q7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubm90ID0gYm5Ob3Q7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0ID0gYm5TaGlmdExlZnQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRSaWdodCA9IGJuU2hpZnRSaWdodDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5nZXRMb3dlc3RTZXRCaXQgPSBibkdldExvd2VzdFNldEJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRDb3VudCA9IGJuQml0Q291bnQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudGVzdEJpdCA9IGJuVGVzdEJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zZXRCaXQgPSBiblNldEJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbGVhckJpdCA9IGJuQ2xlYXJCaXQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZmxpcEJpdCA9IGJuRmxpcEJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQgPSBibkFkZDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGJuU3VidHJhY3Q7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHkgPSBibk11bHRpcGx5O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZSA9IGJuRGl2aWRlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnJlbWFpbmRlciA9IGJuUmVtYWluZGVyO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZUFuZFJlbWFpbmRlciA9IGJuRGl2aWRlQW5kUmVtYWluZGVyO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdyA9IGJuTW9kUG93O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludmVyc2UgPSBibk1vZEludmVyc2U7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUucG93ID0gYm5Qb3c7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZXhwdCA9IGJuUG93O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdjZCA9IGJuR0NEO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJvYmFibGVQcmltZSA9IGJuSXNQcm9iYWJsZVByaW1lO1xuXG4gICAgLy8gQmlnSW50ZWdlciBpbnRlcmZhY2VzIG5vdCBpbXBsZW1lbnRlZCBpbiBqc2JuOlxuXG4gICAgLy8gQmlnSW50ZWdlcihpbnQgc2lnbnVtLCBieXRlW10gbWFnbml0dWRlKVxuICAgIC8vIGRvdWJsZSBkb3VibGVWYWx1ZSgpXG4gICAgLy8gZmxvYXQgZmxvYXRWYWx1ZSgpXG4gICAgLy8gaW50IGhhc2hDb2RlKClcbiAgICAvLyBsb25nIGxvbmdWYWx1ZSgpXG4gICAgLy8gc3RhdGljIEJpZ0ludGVnZXIgdmFsdWVPZihsb25nIHZhbClcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIEVORCBPRiBjb3B5LWFuZC1wYXN0ZSBvZiBqc2JuLlxuXG5cblxuICAgIEJpZ0ludGVnZXIuTkVHQVRJVkVfT05FID0gQmlnSW50ZWdlci5PTkUubmVnYXRlKCk7XG5cblxuICAgIC8vIE90aGVyIG1ldGhvZHMgd2UgbmVlZCB0byBhZGQgZm9yIGNvbXBhdGliaWx0eSB3aXRoIGpzLW51bWJlcnMgbnVtZXJpYyB0b3dlci5cblxuICAgIC8vIGFkZCBpcyBpbXBsZW1lbnRlZCBhYm92ZS5cbiAgICAvLyBzdWJ0cmFjdCBpcyBpbXBsZW1lbnRlZCBhYm92ZS5cbiAgICAvLyBtdWx0aXBseSBpcyBpbXBsZW1lbnRlZCBhYm92ZS5cbiAgICAvLyBlcXVhbHMgaXMgaW1wbGVtZW50ZWQgYWJvdmUuXG4gICAgLy8gYWJzIGlzIGltcGxlbWVudGVkIGFib3ZlLlxuICAgIC8vIG5lZ2F0ZSBpcyBkZWZpbmVkIGFib3ZlLlxuXG4gICAgLy8gbWFrZUJpZ251bTogc3RyaW5nIC0+IEJpZ0ludGVnZXJcbiAgICB2YXIgbWFrZUJpZ251bSA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgaWYgKHR5cGVvZihzKSA9PT0gJ251bWJlcicpIHsgcyA9IHMgKyAnJzsgfVxuICAgICAgICBzID0gZXhwYW5kRXhwb25lbnQocyk7XG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihzLCAxMCk7XG4gICAgfTtcblxuICAgIHZhciB6ZXJvc3RyaW5nID0gZnVuY3Rpb24obikge1xuICAgICAgICB2YXIgYnVmID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBidWYucHVzaCgnMCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWYuam9pbignJyk7XG4gICAgfTtcblxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubGV2ZWwgPSAwO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxpZnRUbyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJhdGlvbmFsKHRoaXMsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDIpIHtcbiAgICAgICAgICAgIHZhciBmaXhyZXAgPSB0aGlzLnRvRml4bnVtKCk7XG4gICAgICAgICAgICBpZiAoZml4cmVwID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRPT19QT1NJVElWRV9UT19SRVBSRVNFTlQ7XG4gICAgICAgICAgICBpZiAoZml4cmVwID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRPT19ORUdBVElWRV9UT19SRVBSRVNFTlQ7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0UG9pbnQoZml4cmVwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbXBsZXgodGhpcywgMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRocm93UnVudGltZUVycm9yKFwiaW52YWxpZCBsZXZlbCBmb3IgQmlnSW50ZWdlciBsaWZ0XCIsIHRoaXMsIHRhcmdldCk7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzRmluaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0ludGVnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUmF0aW9uYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUmVhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNFeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNJbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9FeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9JbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLnRvRml4bnVtKCkpO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0ZpeG51bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gMCwgc3RyID0gdGhpcy50b1N0cmluZygpLCBpO1xuICAgICAgICBpZiAoc3RyWzBdID09PSAnLScpIHtcbiAgICAgICAgICAgIGZvciAoaT0xOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICogMTAgKyBOdW1iZXIoc3RyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAtcmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChpPTA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKiAxMCArIE51bWJlcihzdHJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKG90aGVyKSA+IDA7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVUbyhvdGhlcikgPj0gMDtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlVG8ob3RoZXIpIDwgMDtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKG90aGVyKSA8PSAwO1xuICAgIH07XG5cbiAgICAvLyBkaXZpZGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFdBUk5JTkcgTk9URTogd2Ugb3ZlcnJpZGUgdGhlIG9sZCB2ZXJzaW9uIG9mIGRpdmlkZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICB2YXIgcXVvdGllbnRBbmRSZW1haW5kZXIgPSBibkRpdmlkZUFuZFJlbWFpbmRlci5jYWxsKHRoaXMsIG90aGVyKTtcbiAgICAgICAgaWYgKHF1b3RpZW50QW5kUmVtYWluZGVyWzFdLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLlpFUk8pID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcXVvdGllbnRBbmRSZW1haW5kZXJbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gYWRkKHF1b3RpZW50QW5kUmVtYWluZGVyWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSYXRpb25hbC5tYWtlSW5zdGFuY2UocXVvdGllbnRBbmRSZW1haW5kZXJbMV0sIG90aGVyKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm51bWVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGVub21pbmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfTtcblxuXG4gICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDbGFzc2ljIGltcGxlbWVudGF0aW9uIG9mIE5ld3Rvbi1SYWxwaHNvbiBzcXVhcmUtcm9vdCBzZWFyY2gsXG4gICAgICAgIC8vIGFkYXB0ZWQgZm9yIGludGVnZXItc3FydC5cbiAgICAgICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9OZXd0b24nc19tZXRob2QjU3F1YXJlX3Jvb3Rfb2ZfYV9udW1iZXJcbiAgICAgICAgICAgIHZhciBzZWFyY2hJdGVyID0gZnVuY3Rpb24obiwgZ3Vlc3MpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSghKGxlc3NUaGFuT3JFcXVhbChzcXIoZ3Vlc3MpLG4pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXNzVGhhbihuLHNxcihhZGQoZ3Vlc3MsIDEpKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGd1ZXNzID0gZmxvb3IoZGl2aWRlKGFkZChndWVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsb29yKGRpdmlkZShuLCBndWVzcykpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZ3Vlc3M7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBpbnRlZ2VyU3FydDogLT4gc2NoZW1lLW51bWJlclxuICAgICAgICAgICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaW50ZWdlclNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbjtcbiAgICAgICAgICAgICAgICBpZihzaWduKHRoaXMpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlYXJjaEl0ZXIodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRoaXMubmVnYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLCBzZWFyY2hJdGVyKG4sIG4pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgIH0pKCk7XG5cblxuICAgIC8vIHNxcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld3RvbidzX21ldGhvZCNTcXVhcmVfcm9vdF9vZl9hX251bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHNxdWFyZSByb290LlxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gR2V0IGFuIGFwcHJveGltYXRpb24gdXNpbmcgaW50ZWdlclNxcnQsIGFuZCB0aGVuIHN0YXJ0IGFub3RoZXJcbiAgICAgICAgLy8gTmV3dG9uLVJhbHBoc29uIHNlYXJjaCBpZiBuZWNlc3NhcnkuXG4gICAgICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBhcHByb3ggPSB0aGlzLmludGVnZXJTcXJ0KCksIGZpeDtcbiAgICAgICAgICAgIGlmIChlcXYoc3FyKGFwcHJveCksIHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcHJveDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpeCA9IHRvRml4bnVtKHRoaXMpO1xuICAgICAgICAgICAgaWYgKGlzRmluaXRlKGZpeCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZml4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc3FydChmaXgpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zcXJ0KC1maXgpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwcm94O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICAvLyBmbG9vcjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGZsb29yLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZsb29yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIGNlaWxpbmc6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjZWlsaW5nLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNlaWxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICAvLyBVbnRpbCB3ZSBoYXZlIGEgZmVhdHVyZS1jb21wbGV0ZSBCaWcgTnVtYmVyIGltcGxlbWVudGF0aW9uLCB3ZSdsbFxuICAgIC8vIGNvbnZlcnQgQmlnSW50ZWdlciBvYmplY3RzIGludG8gRmxvYXRQb2ludCBvYmplY3RzIGFuZCBwZXJmb3JtXG4gICAgLy8gdW5zdXBwb3J0ZWQgb3BlcmF0aW9ucyB0aGVyZS5cbiAgICBmdW5jdGlvbiB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKGZ1bmN0aW9uX25hbWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbmV4YWN0ID0gdGhpcy50b0luZXhhY3QoKTtcbiAgICAgICAgcmV0dXJuIGluZXhhY3RbZnVuY3Rpb25fbmFtZV0uYXBwbHkoaW5leGFjdCwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25qdWdhdGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjb25qdWdhdGUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29uanVnYXRlID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImNvbmp1Z2F0ZVwiKTtcblxuICAgIC8vIG1hZ25pdHVkZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIG1hZ25pdHVkZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tYWduaXR1ZGUgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwibWFnbml0dWRlXCIpO1xuXG4gICAgLy8gbG9nOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgbG9nLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxvZyA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJsb2dcIik7XG5cbiAgICAvLyBhbmdsZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFuZ2xlLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFuZ2xlID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImFuZ2xlXCIpO1xuXG4gICAgLy8gYXRhbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyB0YW5nZW50LlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmF0YW4gPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiYXRhblwiKTtcblxuICAgIC8vIGFjb3M6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgY29zaW5lLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFjb3MgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiYWNvc1wiKTtcblxuICAgIC8vIGFzaW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBhcmMgc2luZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hc2luID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImFzaW5cIik7XG5cbiAgICAvLyB0YW46IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSB0YW5nZW50LlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRhbiA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJ0YW5cIik7XG5cbiAgICAvLyBjb3M6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjb3NpbmUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29zID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImNvc1wiKTtcblxuICAgIC8vIHNpbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHNpbmUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2luID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcInNpblwiKTtcblxuICAgIC8vIGV4cDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgZSByYWlzZWQgdG8gdGhlIGdpdmVuIHBvd2VyLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmV4cCA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJleHBcIik7XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pbWFnaW5hcnlQYXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUucmVhbFBhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIHJvdW5kOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUm91bmQgdG8gdGhlIG5lYXJlc3QgaW50ZWdlci5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gdG9SZXBlYXRpbmdEZWNpbWFsOiBqc251bSBqc251bSB7bGltaXQ6IG51bWJlcn0/IC0+IFtzdHJpbmcsIHN0cmluZywgc3RyaW5nXVxuICAgIC8vXG4gICAgLy8gR2l2ZW4gdGhlIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IgcGFydHMgb2YgYSByYXRpb25hbCxcbiAgICAvLyBwcm9kdWNlcyB0aGUgcmVwZWF0aW5nLWRlY2ltYWwgcmVwcmVzZW50YXRpb24sIHdoZXJlIHRoZSBmaXJzdFxuICAgIC8vIHBhcnQgYXJlIHRoZSBkaWdpdHMgYmVmb3JlIHRoZSBkZWNpbWFsLCB0aGUgc2Vjb25kIGFyZSB0aGVcbiAgICAvLyBub24tcmVwZWF0aW5nIGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCwgYW5kIHRoZSB0aGlyZCBhcmUgdGhlXG4gICAgLy8gcmVtYWluaW5nIHJlcGVhdGluZyBkZWNpbWFscy5cbiAgICAvL1xuICAgIC8vIEFuIG9wdGlvbmFsIGxpbWl0IG9uIHRoZSBkZWNpbWFsIGV4cGFuc2lvbiBjYW4gYmUgcHJvdmlkZWQsIGluIHdoaWNoXG4gICAgLy8gY2FzZSB0aGUgc2VhcmNoIGN1dHMgb2ZmIGlmIHdlIGdvIHBhc3QgdGhlIGxpbWl0LlxuICAgIC8vIElmIHRoaXMgaGFwcGVucywgdGhlIHRoaXJkIGFyZ3VtZW50IHJldHVybmVkIGJlY29tZXMgJy4uLicgdG8gaW5kaWNhdGVcbiAgICAvLyB0aGF0IHRoZSBzZWFyY2ggd2FzIHByZW1hdHVyZWx5IGN1dCBvZmYuXG4gICAgdmFyIHRvUmVwZWF0aW5nRGVjaW1hbCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdldFJlc2lkdWUgPSBmdW5jdGlvbihyLCBkLCBsaW1pdCkge1xuICAgICAgICAgICAgdmFyIGRpZ2l0cyA9IFtdO1xuICAgICAgICAgICAgdmFyIHNlZW5SZW1haW5kZXJzID0ge307XG4gICAgICAgICAgICBzZWVuUmVtYWluZGVyc1tyXSA9IHRydWU7XG4gICAgICAgICAgICB3aGlsZSh0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbWl0LS0gPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2RpZ2l0cy5qb2luKCcnKSwgJy4uLiddXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG5leHREaWdpdCA9IHF1b3RpZW50KFxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBseShyLCAxMCksIGQpO1xuICAgICAgICAgICAgICAgIHZhciBuZXh0UmVtYWluZGVyID0gcmVtYWluZGVyKFxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBseShyLCAxMCksXG4gICAgICAgICAgICAgICAgICAgIGQpO1xuICAgICAgICAgICAgICAgIGRpZ2l0cy5wdXNoKG5leHREaWdpdC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VlblJlbWFpbmRlcnNbbmV4dFJlbWFpbmRlcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IG5leHRSZW1haW5kZXI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW5SZW1haW5kZXJzW25leHRSZW1haW5kZXJdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgciA9IG5leHRSZW1haW5kZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZmlyc3RSZXBlYXRpbmdSZW1haW5kZXIgPSByO1xuICAgICAgICAgICAgdmFyIHJlcGVhdGluZ0RpZ2l0cyA9IFtdO1xuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dERpZ2l0ID0gcXVvdGllbnQobXVsdGlwbHkociwgMTApLCBkKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFJlbWFpbmRlciA9IHJlbWFpbmRlcihcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbHkociwgMTApLFxuICAgICAgICAgICAgICAgICAgICBkKTtcbiAgICAgICAgICAgICAgICByZXBlYXRpbmdEaWdpdHMucHVzaChuZXh0RGlnaXQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGVxdWFscyhuZXh0UmVtYWluZGVyLCBmaXJzdFJlcGVhdGluZ1JlbWFpbmRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IG5leHRSZW1haW5kZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGRpZ2l0U3RyaW5nID0gZGlnaXRzLmpvaW4oJycpO1xuICAgICAgICAgICAgdmFyIHJlcGVhdGluZ0RpZ2l0U3RyaW5nID0gcmVwZWF0aW5nRGlnaXRzLmpvaW4oJycpO1xuXG4gICAgICAgICAgICB3aGlsZSAoZGlnaXRTdHJpbmcubGVuZ3RoID49IHJlcGVhdGluZ0RpZ2l0U3RyaW5nLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgIChkaWdpdFN0cmluZy5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgIGRpZ2l0U3RyaW5nLmxlbmd0aCAtIHJlcGVhdGluZ0RpZ2l0U3RyaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgPT09IHJlcGVhdGluZ0RpZ2l0U3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIGRpZ2l0U3RyaW5nID0gZGlnaXRTdHJpbmcuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAwLCBkaWdpdFN0cmluZy5sZW5ndGggLSByZXBlYXRpbmdEaWdpdFN0cmluZy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW2RpZ2l0U3RyaW5nLCByZXBlYXRpbmdEaWdpdFN0cmluZ107XG5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24obiwgZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgLy8gZGVmYXVsdCBsaW1pdCBvbiBkZWNpbWFsIGV4cGFuc2lvbjsgY2FuIGJlIG92ZXJyaWRkZW5cbiAgICAgICAgICAgIHZhciBsaW1pdCA9IDUxMjtcbiAgICAgICAgICAgIGlmIChvcHRpb25zICYmIHR5cGVvZihvcHRpb25zLmxpbWl0KSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBsaW1pdCA9IG9wdGlvbnMubGltaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoISBpc0ludGVnZXIobikpIHtcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigndG9SZXBlYXRpbmdEZWNpbWFsOiBuICcgKyBuLnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghIGlzSW50ZWdlcihkKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCd0b1JlcGVhdGluZ0RlY2ltYWw6IGQgJyArIGQudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVxdWFscyhkLCAwKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCd0b1JlcGVhdGluZ0RlY2ltYWw6IGQgZXF1YWxzIDAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZXNzVGhhbihkLCAwKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCd0b1JlcGVhdGluZ0RlY2ltYWw6IGQgPCAwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgdmFyIHNpZ24gPSAobGVzc1RoYW4obiwgMCkgPyBcIi1cIiA6IFwiXCIpO1xuICAgICAgICAgICAgIG4gPSBhYnMobik7XG4gICAgICAgICAgICAgdmFyIGJlZm9yZURlY2ltYWxQb2ludCA9IHNpZ24gKyBxdW90aWVudChuLCBkKTtcbiAgICAgICAgICAgICB2YXIgYWZ0ZXJEZWNpbWFscyA9IGdldFJlc2lkdWUocmVtYWluZGVyKG4sIGQpLCBkLCBsaW1pdCk7XG4gICAgICAgICAgICAgcmV0dXJuIFtiZWZvcmVEZWNpbWFsUG9pbnRdLmNvbmNhdChhZnRlckRlY2ltYWxzKTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG5cblxuICAgIC8vIEV4dGVybmFsIGludGVyZmFjZSBvZiBqcy1udW1iZXJzOlxuXG4gICAgTnVtYmVyc1snZnJvbUZpeG51bSddID0gZnJvbUZpeG51bTtcbiAgICBOdW1iZXJzWydmcm9tU3RyaW5nJ10gPSBmcm9tU3RyaW5nO1xuICAgIE51bWJlcnNbJ21ha2VCaWdudW0nXSA9IG1ha2VCaWdudW07XG4gICAgTnVtYmVyc1snbWFrZVJhdGlvbmFsJ10gPSBSYXRpb25hbC5tYWtlSW5zdGFuY2U7XG4gICAgTnVtYmVyc1snbWFrZUZsb2F0J10gPSBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZTtcbiAgICBOdW1iZXJzWydtYWtlQ29tcGxleCddID0gQ29tcGxleC5tYWtlSW5zdGFuY2U7XG4gICAgTnVtYmVyc1snbWFrZUNvbXBsZXhQb2xhciddID0gbWFrZUNvbXBsZXhQb2xhcjtcblxuICAgIE51bWJlcnNbJ3BpJ10gPSBGbG9hdFBvaW50LnBpO1xuICAgIE51bWJlcnNbJ2UnXSA9IEZsb2F0UG9pbnQuZTtcbiAgICBOdW1iZXJzWyduYW4nXSA9IEZsb2F0UG9pbnQubmFuO1xuICAgIE51bWJlcnNbJ25lZ2F0aXZlX2luZiddID0gRmxvYXRQb2ludC5uZWdpbmY7XG4gICAgTnVtYmVyc1snaW5mJ10gPSBGbG9hdFBvaW50LmluZjtcbiAgICBOdW1iZXJzWyduZWdhdGl2ZV9vbmUnXSA9IC0xOyAgIC8vIFJhdGlvbmFsLk5FR0FUSVZFX09ORTtcbiAgICBOdW1iZXJzWyd6ZXJvJ10gPSAwOyAgICAgICAgICAgIC8vIFJhdGlvbmFsLlpFUk87XG4gICAgTnVtYmVyc1snb25lJ10gPSAxOyAgICAgICAgICAgICAvLyBSYXRpb25hbC5PTkU7XG4gICAgTnVtYmVyc1snaSddID0gcGx1c0k7XG4gICAgTnVtYmVyc1snbmVnYXRpdmVfaSddID0gbWludXNJO1xuICAgIE51bWJlcnNbJ25lZ2F0aXZlX3plcm8nXSA9IE5FR0FUSVZFX1pFUk87XG5cbiAgICBOdW1iZXJzWydvblRocm93UnVudGltZUVycm9yJ10gPSBvblRocm93UnVudGltZUVycm9yO1xuICAgIE51bWJlcnNbJ2lzU2NoZW1lTnVtYmVyJ10gPSBpc1NjaGVtZU51bWJlcjtcbiAgICBOdW1iZXJzWydpc1JhdGlvbmFsJ10gPSBpc1JhdGlvbmFsO1xuICAgIE51bWJlcnNbJ2lzUmVhbCddID0gaXNSZWFsO1xuICAgIE51bWJlcnNbJ2lzRXhhY3QnXSA9IGlzRXhhY3Q7XG4gICAgTnVtYmVyc1snaXNJbmV4YWN0J10gPSBpc0luZXhhY3Q7XG4gICAgTnVtYmVyc1snaXNJbnRlZ2VyJ10gPSBpc0ludGVnZXI7XG5cbiAgICBOdW1iZXJzWyd0b0ZpeG51bSddID0gdG9GaXhudW07XG4gICAgTnVtYmVyc1sndG9FeGFjdCddID0gdG9FeGFjdDtcbiAgICBOdW1iZXJzWyd0b0luZXhhY3QnXSA9IHRvSW5leGFjdDtcbiAgICBOdW1iZXJzWydhZGQnXSA9IGFkZDtcbiAgICBOdW1iZXJzWydzdWJ0cmFjdCddID0gc3VidHJhY3Q7XG4gICAgTnVtYmVyc1snbXVsdGlwbHknXSA9IG11bHRpcGx5O1xuICAgIE51bWJlcnNbJ2RpdmlkZSddID0gZGl2aWRlO1xuICAgIE51bWJlcnNbJ2VxdWFscyddID0gZXF1YWxzO1xuICAgIE51bWJlcnNbJ2VxdiddID0gZXF2O1xuICAgIE51bWJlcnNbJ2FwcHJveEVxdWFscyddID0gYXBwcm94RXF1YWxzO1xuICAgIE51bWJlcnNbJ2dyZWF0ZXJUaGFuT3JFcXVhbCddID0gZ3JlYXRlclRoYW5PckVxdWFsO1xuICAgIE51bWJlcnNbJ2xlc3NUaGFuT3JFcXVhbCddID0gbGVzc1RoYW5PckVxdWFsO1xuICAgIE51bWJlcnNbJ2dyZWF0ZXJUaGFuJ10gPSBncmVhdGVyVGhhbjtcbiAgICBOdW1iZXJzWydsZXNzVGhhbiddID0gbGVzc1RoYW47XG4gICAgTnVtYmVyc1snZXhwdCddID0gZXhwdDtcbiAgICBOdW1iZXJzWydleHAnXSA9IGV4cDtcbiAgICBOdW1iZXJzWydtb2R1bG8nXSA9IG1vZHVsbztcbiAgICBOdW1iZXJzWydudW1lcmF0b3InXSA9IG51bWVyYXRvcjtcbiAgICBOdW1iZXJzWydkZW5vbWluYXRvciddID0gZGVub21pbmF0b3I7XG4gICAgTnVtYmVyc1snaW50ZWdlclNxcnQnXSA9IGludGVnZXJTcXJ0O1xuICAgIE51bWJlcnNbJ3NxcnQnXSA9IHNxcnQ7XG4gICAgTnVtYmVyc1snYWJzJ10gPSBhYnM7XG4gICAgTnVtYmVyc1sncXVvdGllbnQnXSA9IHF1b3RpZW50O1xuICAgIE51bWJlcnNbJ3JlbWFpbmRlciddID0gcmVtYWluZGVyO1xuICAgIE51bWJlcnNbJ2Zsb29yJ10gPSBmbG9vcjtcbiAgICBOdW1iZXJzWydjZWlsaW5nJ10gPSBjZWlsaW5nO1xuICAgIE51bWJlcnNbJ2Nvbmp1Z2F0ZSddID0gY29uanVnYXRlO1xuICAgIE51bWJlcnNbJ21hZ25pdHVkZSddID0gbWFnbml0dWRlO1xuICAgIE51bWJlcnNbJ2xvZyddID0gbG9nO1xuICAgIE51bWJlcnNbJ2FuZ2xlJ10gPSBhbmdsZTtcbiAgICBOdW1iZXJzWyd0YW4nXSA9IHRhbjtcbiAgICBOdW1iZXJzWydhdGFuJ10gPSBhdGFuO1xuICAgIE51bWJlcnNbJ2NvcyddID0gY29zO1xuICAgIE51bWJlcnNbJ3NpbiddID0gc2luO1xuICAgIE51bWJlcnNbJ3RhbiddID0gdGFuO1xuICAgIE51bWJlcnNbJ2Fjb3MnXSA9IGFjb3M7XG4gICAgTnVtYmVyc1snYXNpbiddID0gYXNpbjtcbiAgICBOdW1iZXJzWydjb3NoJ10gPSBjb3NoO1xuICAgIE51bWJlcnNbJ3NpbmgnXSA9IHNpbmg7XG4gICAgTnVtYmVyc1snaW1hZ2luYXJ5UGFydCddID0gaW1hZ2luYXJ5UGFydDtcbiAgICBOdW1iZXJzWydyZWFsUGFydCddID0gcmVhbFBhcnQ7XG4gICAgTnVtYmVyc1sncm91bmQnXSA9IHJvdW5kO1xuICAgIE51bWJlcnNbJ3NxciddID0gc3FyO1xuICAgIE51bWJlcnNbJ2djZCddID0gZ2NkO1xuICAgIE51bWJlcnNbJ2xjbSddID0gbGNtO1xuXG4gICAgTnVtYmVyc1sndG9SZXBlYXRpbmdEZWNpbWFsJ10gPSB0b1JlcGVhdGluZ0RlY2ltYWw7XG5cblxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBleHBvc2VzIHRoZSBjbGFzcyByZXByZXNlbnRhdGlvbnMgZm9yIGVhc2llclxuICAgIC8vIGludGVncmF0aW9uIHdpdGggb3RoZXIgcHJvamVjdHMuXG4gICAgTnVtYmVyc1snQmlnSW50ZWdlciddID0gQmlnSW50ZWdlcjtcbiAgICBOdW1iZXJzWydSYXRpb25hbCddID0gUmF0aW9uYWw7XG4gICAgTnVtYmVyc1snRmxvYXRQb2ludCddID0gRmxvYXRQb2ludDtcbiAgICBOdW1iZXJzWydDb21wbGV4J10gPSBDb21wbGV4O1xuXG4gICAgTnVtYmVyc1snTUlOX0ZJWE5VTSddID0gTUlOX0ZJWE5VTTtcbiAgICBOdW1iZXJzWydNQVhfRklYTlVNJ10gPSBNQVhfRklYTlVNO1xuXG59KSgpO1xuIiwiLyoqXG4gKiBBbiBlcXVhdGlvbiBpcyBhbiBleHByZXNzaW9uIGF0dGFjaGVkIHRvIGEgcGFydGljdWxhciBuYW1lLiBGb3IgZXhhbXBsZTpcbiAqICAgZih4KSA9IHggKyAxXG4gKiAgIG5hbWU6IGZcbiAqICAgZXF1YXRpb246IHggKyAxXG4gKiAgIHBhcmFtczogWyd4J11cbiAqIEluIG1hbnkgY2FzZXMsIHRoaXMgd2lsbCBqdXN0IGJlIGFuIGV4cHJlc3Npb24gd2l0aCBubyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgRnVuY3Rpb24gb3IgdmFyaWFibGUgbmFtZS4gTnVsbCBpZiBjb21wdXRlIGV4cHJlc3Npb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IHBhcmFtcyBMaXN0IG9mIHBhcmFtZXRlciBuYW1lcyBpZiBhIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtFeHByZXNzaW9uTm9kZX0gZXhwcmVzc2lvblxuICovXG52YXIgRXF1YXRpb24gPSBmdW5jdGlvbiAobmFtZSwgcGFyYW1zLCBleHByZXNzaW9uKSB7XG4gIHRoaXMubmFtZSA9IG5hbWU7XG4gIHRoaXMucGFyYW1zID0gcGFyYW1zIHx8IFtdO1xuICB0aGlzLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFcXVhdGlvbiByZXF1aXJlcyBuYW1lLCBwYXJhbXMsIGFuZCBleHByZXNzaW9uJyk7XG4gIH1cblxuICB0aGlzLnNpZ25hdHVyZSA9IHRoaXMubmFtZTtcbiAgaWYgKHRoaXMucGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLnNpZ25hdHVyZSArPSAnKCcgKyB0aGlzLnBhcmFtcy5qb2luKCcsJykgKyAnKSc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXF1YXRpb247XG5cbi8qKlxuICogQHJldHVybnMgVHJ1ZSBpZiBhIGZ1bmN0aW9uXG4gKi9cbkVxdWF0aW9uLnByb3RvdHlwZS5pc0Z1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5wYXJhbXMubGVuZ3RoID4gMDtcbn07XG5cbkVxdWF0aW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBFcXVhdGlvbih0aGlzLm5hbWUsIHRoaXMucGFyYW1zLnNsaWNlKCksIHRoaXMuZXhwcmVzc2lvbi5jbG9uZSgpKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG4gIHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuICB2YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG47IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogQ2FsYyBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IENhbGMgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIHNoYXJlZEZ1bmN0aW9uYWxCbG9ja3MgPSByZXF1aXJlKCcuLi9zaGFyZWRGdW5jdGlvbmFsQmxvY2tzJyk7XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICB2YXIgZ2Vuc3ltID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBOQU1FX1RZUEUgPSBibG9ja2x5LlZhcmlhYmxlcy5OQU1FX1RZUEU7XG4gICAgcmV0dXJuIGdlbmVyYXRvci52YXJpYWJsZURCXy5nZXREaXN0aW5jdE5hbWUobmFtZSwgTkFNRV9UWVBFKTtcbiAgfTtcblxuICBzaGFyZWRGdW5jdGlvbmFsQmxvY2tzLmluc3RhbGwoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuXG4gIGluc3RhbGxDb21wdXRlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcbn07XG5cbmZ1bmN0aW9uIGluc3RhbGxDb21wdXRlKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmZ1bmN0aW9uYWxfY29tcHV0ZSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIGJsb2NrbHkuRnVuY3Rpb25hbEJsb2NrVXRpbHMuaW5pdFRpdGxlZEZ1bmN0aW9uYWxCbG9jayh0aGlzLCBtc2cuZXZhbHVhdGUoKSwgYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OT05FLCBbXG4gICAgICAgIHsgbmFtZTogJ0FSRzEnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9XG4gICAgICBdKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmZ1bmN0aW9uYWxfY29tcHV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmcxID0gQmxvY2tseS5KYXZhU2NyaXB0LnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnQVJHMScsIGZhbHNlKSB8fCAwO1xuICAgIHJldHVybiBcIkNhbGMuY29tcHV0ZShcIiArIGFyZzEgK1wiLCAnYmxvY2tfaWRfXCIgKyB0aGlzLmlkICsgXCInKTtcXG5cIjtcbiAgfTtcbn1cbiIsIi8vIGxvY2FsZSBmb3IgY2FsY1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmNhbGNfbG9jYWxlO1xuIl19
