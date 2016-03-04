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
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
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

  var renderCodeWorkspace = function renderCodeWorkspace() {
    return codeWorkspaceEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  };

  var renderVisualizationColumn = function renderVisualizationColumn() {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: require('./controls.html.ejs')({
          assetUrl: studioApp.assetUrl
        }),
        inputOutputTable: level.inputOutputTable
      }
    });
  };

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
    onMount: studioApp.init.bind(studioApp, config)
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/controls.html.ejs","./equation":"/home/ubuntu/staging/apps/build/js/calc/equation.js","./equationSet":"/home/ubuntu/staging/apps/build/js/calc/equationSet.js","./expressionNode":"/home/ubuntu/staging/apps/build/js/calc/expressionNode.js","./inputIterator":"/home/ubuntu/staging/apps/build/js/calc/inputIterator.js","./js-numbers/js-numbers.js":"/home/ubuntu/staging/apps/build/js/calc/js-numbers/js-numbers.js","./levels":"/home/ubuntu/staging/apps/build/js/calc/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/calc/locale.js","./token":"/home/ubuntu/staging/apps/build/js/calc/token.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs","lodash":"/home/ubuntu/staging/apps/node_modules/lodash/dist/lodash.js"}],"/home/ubuntu/staging/apps/build/js/calc/visualization.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9jYWxjL21haW4uanMiLCJidWlsZC9qcy9jYWxjL2NhbGMuanMiLCJidWlsZC9qcy9jYWxjL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2xldmVscy5qcyIsImJ1aWxkL2pzL2NhbGMvaW5wdXRJdGVyYXRvci5qcyIsImJ1aWxkL2pzL2NhbGMvZXF1YXRpb25TZXQuanMiLCJidWlsZC9qcy9jYWxjL2V4cHJlc3Npb25Ob2RlLmpzIiwiYnVpbGQvanMvY2FsYy90b2tlbi5qcyIsImJ1aWxkL2pzL2NhbGMvanMtbnVtYmVycy9qcy1udW1iZXJzLmpzIiwiYnVpbGQvanMvY2FsYy9lcXVhdGlvbi5qcyIsImJ1aWxkL2pzL2NhbGMvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9jYWxjL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2NhbGMvbG9jYWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDbEMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFB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QyxFQUFFO0FBQUUsY0FBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUMsQ0FBQztTQUFFLE1BQ2xEO0FBQUUsY0FBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtBQUNwQyxZQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsWUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixZQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsT0FBTztBQUNuQixZQUFJLEVBQUUsR0FBRyxFQUFFLElBQUUsQ0FBQyxJQUFFLElBQUksQ0FBQyxFQUFFLENBQUEsQUFBQyxJQUFFLEFBQUMsRUFBRSxHQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxJQUFFLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUNyRCxZQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFDLEVBQUU7WUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQSxHQUFFLEVBQUU7WUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDMUQsWUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFDLEVBQUU7WUFBRSxDQUFDLEdBQUcsQUFBQyxDQUFDLElBQUUsSUFBSSxHQUFFLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQztBQUM3QyxTQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixZQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3BC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LEVBQUU7O0FBRTlCLGdCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDO0FBQ3BCLGdCQUFJLEVBQUUsR0FBRyxBQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxJQUFFLENBQUMsQUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxFQUFFLENBQUEsR0FBRSxJQUFJLENBQUMsR0FBRyxHQUFFLElBQUksQ0FBQyxFQUFFLENBQUEsSUFBRyxFQUFFLENBQUEsQUFBQyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7O0FBRTVFLGFBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZixhQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxtQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUFFLGlCQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxBQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFBRTtTQUNsRDtBQUNELFNBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNWLFNBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsWUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xEOzs7QUFHRCxhQUFTLFNBQVMsQ0FB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QUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUN2Qyx1QkFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDNUIsd0JBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLHdCQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzNFO2FBQ0o7U0FDSixNQUNJOztBQUVELGdCQUFJLENBQUMsR0FBRyxFQUFFO2dCQUFFLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDO0FBQ3BCLGFBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFBLEdBQUUsQ0FBQyxDQUFDO0FBQ3BCLGFBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZixnQkFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUEsR0FBRSxDQUFDLEFBQUMsQ0FBQyxLQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUMsZ0JBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO0tBQ0o7OztBQUdELGFBQVMsYUFBYSxHQUFHO0FBQ3JCLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QixTQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNkLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUMsQUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRSxDQUFDO1lBQUUsQ0FBQztZ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QyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FDaEQsSUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsS0FDckM7QUFBRSxnQkFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQUFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQUU7S0FDakU7O0FBRUQsYUFBUyxhQUFhLENBQUMsQ0FBQyxFQUFFO0FBQUUsZUFBTyxDQUFDLENBQUM7S0FBRTs7O0FBR3ZDLGFBQVMsYUFBYSxDQUFDLENBQUMsRUFBRTtBQUN0QixTQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsWUFBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBRTtBQUFFLGFBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQUU7QUFDckQsWUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELFlBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxD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RSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsQ0FBQztBQUN6WCxRQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBRSxFQUFFLENBQUEsR0FBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxDQUFDLENB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SyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hFLFdBQU8sZUFBZSxHQUFHLElBQUksR0FBRSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7R0FDbkUsQ0FBQztDQUNIOzs7Ozs7O0FDekRELE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQ2FsYyA9IHJlcXVpcmUoJy4vY2FsYycpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5jYWxjTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuQ2FsYywgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogQ2FsYyBHcmFwaGljc1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuICd1c2Ugc3RyaWN0JztcblxudmFyIENhbGMgPSBtb2R1bGUuZXhwb3J0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBDYWxjID0gbW9kdWxlLmV4cG9ydHM7XG52YXIganNudW1zID0gcmVxdWlyZSgnLi9qcy1udW1iZXJzL2pzLW51bWJlcnMuanMnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBjYWxjTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBBcHBWaWV3ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL0FwcFZpZXcuanN4Jyk7XG52YXIgY29kZVdvcmtzcGFjZUVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jb2RlV29ya3NwYWNlLmh0bWwuZWpzJyk7XG52YXIgdmlzdWFsaXphdGlvbkNvbHVtbkVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy92aXN1YWxpemF0aW9uQ29sdW1uLmh0bWwuZWpzJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciB0aW1lb3V0TGlzdCA9IHJlcXVpcmUoJy4uL3RpbWVvdXRMaXN0Jyk7XG5cbnZhciBFeHByZXNzaW9uTm9kZSA9IHJlcXVpcmUoJy4vZXhwcmVzc2lvbk5vZGUnKTtcbnZhciBFcXVhdGlvblNldCA9IHJlcXVpcmUoJy4vZXF1YXRpb25TZXQnKTtcbnZhciBFcXVhdGlvbiA9IHJlcXVpcmUoJy4vZXF1YXRpb24nKTtcbnZhciBUb2tlbiA9IHJlcXVpcmUoJy4vdG9rZW4nKTtcbnZhciBJbnB1dEl0ZXJhdG9yID0gcmVxdWlyZSgnLi9pbnB1dEl0ZXJhdG9yJyk7XG5cbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2NrcyhmYWxzZSk7XG5cbnZhciBDQU5WQVNfSEVJR0hUID0gNDAwO1xudmFyIENBTlZBU19XSURUSCA9IDQwMDtcblxudmFyIExJTkVfSEVJR0hUID0gMjQ7XG5cbnZhciBhcHBTdGF0ZSA9IHtcbiAgdGFyZ2V0U2V0OiBudWxsLFxuICB1c2VyU2V0OiBudWxsLFxuICBhbmltYXRpbmc6IGZhbHNlLFxuICB3YWl0aW5nRm9yUmVwb3J0OiBmYWxzZSxcbiAgcmVzcG9uc2U6IG51bGwsXG4gIG1lc3NhZ2U6IG51bGwsXG4gIHJlc3VsdDogbnVsbCxcbiAgdGVzdFJlc3VsdHM6IG51bGwsXG4gIGZhaWxlZElucHV0OiBudWxsXG59O1xuQ2FsYy5hcHBTdGF0ZV8gPSBhcHBTdGF0ZTtcblxudmFyIHN0ZXBTcGVlZCA9IDIwMDA7XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdG9rZW4gbGlzdCBmcm9tIG9uIG9yIHR3byB2YWx1ZXMuIElmIG9uZSB2YWx1ZSBpcyBnaXZlbiwgdGhhdFxuICogdG9rZW4gbGlzdCBpcyBqdXN0IHRoZSBzZXQgb2YgdW5tYXJrZWQgdG9rZW5zLiBJZiB0d28gdmFsdWVzIGFyZSBnaXZlbiwgdGhlXG4gKiBnZW5lcmF0ZWQgdG9rZW4gbGlzdCBoYXMgZGlmZmVyZW5jZSBtYXJrZWQuIElucHV0cyBhcmUgZmlyc3QgY29udmVydGVkIHRvXG4gKiBFeHByZXNzaW9uTm9kZXMgdG8gYWxsb3cgZm9yIHRva2VuIGxpc3QgZ2VuZXJhdGlvbi5cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV8RXF1YXRpb258anNudW1iZXJ8c3RyaW5nfSBvbmVcbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV8RXF1YXRpb258anNudW1iZXJ8c3RyaW5nfSB0d29cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFya0RlZXBlc3QgT25seSB2YWxpZCBpZiB3ZSBoYXZlIGEgc2luZ2xlIGlucHV0LiBQYXNzZWQgb25cbiAqICAgdG8gZ2V0VG9rZW5MaXN0LlxuICogQHJldHVybnMge1Rva2VuW119XG4gKi9cbmZ1bmN0aW9uIGNvbnN0cnVjdFRva2VuTGlzdChvbmUsIHR3bywgbWFya0RlZXBlc3QpIHtcbiAgb25lID0gYXNFeHByZXNzaW9uTm9kZShvbmUpO1xuICB0d28gPSBhc0V4cHJlc3Npb25Ob2RlKHR3byk7XG5cbiAgbWFya0RlZXBlc3QgPSB1dGlscy52YWx1ZU9yKG1hcmtEZWVwZXN0LCBmYWxzZSk7XG5cbiAgdmFyIHRva2VuTGlzdDtcblxuICBpZiAoIW9uZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKCF0d28pIHtcbiAgICB0b2tlbkxpc3QgPSBvbmUuZ2V0VG9rZW5MaXN0KG1hcmtEZWVwZXN0KTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbkxpc3QgPSBvbmUuZ2V0VG9rZW5MaXN0RGlmZih0d28pO1xuICB9XG5cbiAgcmV0dXJuIEV4cHJlc3Npb25Ob2RlLnN0cmlwT3V0ZXJQYXJlbnNGcm9tVG9rZW5MaXN0KHRva2VuTGlzdCk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSB2YWwgdG8gYW4gRXhwcmVzc2lvbk5vZGUgZm9yIHRoZSBwdXJwb3NlIG9mIGdlbmVyYXRpbmcgYSB0b2tlblxuICogbGlzdC5cbiAqIEBwYXJhbSB7RXhwcmVzc2lvbk5vZGV8RXF1YXRpb258anNudW1iZXJ8c3RyaW5nfSB2YWxcbiAqIEByZXR1cm5zIHtFeHByZXNzaW9uTm9kZX1cbiAqL1xuZnVuY3Rpb24gYXNFeHByZXNzaW9uTm9kZSh2YWwpIHtcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuICBpZiAodmFsIGluc3RhbmNlb2YgRXF1YXRpb24pIHtcbiAgICByZXR1cm4gdmFsLmV4cHJlc3Npb247XG4gIH1cbiAgLy8gSXQncyBwZXJoYXBzIGEgbGl0dGxlIHdlaXJkIHRvIGNvbnZlcnQgYSBzdHJpbmcgbGlrZSBcIj0gXCIgaW50byBhblxuICAvLyBFeHByZXNzaW9uTm9kZSAod2hpY2ggSSBiZWxpZXZlIHdpbGwgdHJlYXQgdGhpcyBhcyBhIHZhcmlhYmxlKSwgYnV0IHRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIG1vcmUgZWFzaWx5IGdlbmVyYXRlIGEgdG9rZW5MaXN0IGluIGEgY29uc2lzdGVudCBtYW5uZXIuXG4gIGlmIChqc251bXMuaXNTY2hlbWVOdW1iZXIodmFsKSB8fCB0eXBlb2YodmFsKSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbmV3IEV4cHJlc3Npb25Ob2RlKHZhbCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd1bmV4cGVjdGVkJyk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgQ2FsYy4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkNhbGMuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucnVuQnV0dG9uQ2xpY2sgPSB0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG5cbiAgc2tpbiA9IGNvbmZpZy5za2luO1xuICBsZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBpZiAobGV2ZWwuc2NhbGUgJiYgbGV2ZWwuc2NhbGUuc3RlcFNwZWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICBzdGVwU3BlZWQgPSBsZXZlbC5zY2FsZS5zdGVwU3BlZWQ7XG4gIH1cblxuICBjb25maWcuZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzID0gdHJ1ZTtcbiAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2sgPSAnZnVuY3Rpb25hbF9jb21wdXRlJztcbiAgY29uZmlnLmVuYWJsZVNob3dDb2RlID0gZmFsc2U7XG5cbiAgLy8gV2UgZG9uJ3Qgd2FudCBpY29ucyBpbiBpbnN0cnVjdGlvbnNcbiAgY29uZmlnLnNraW4uc3RhdGljQXZhdGFyID0gbnVsbDtcbiAgY29uZmlnLnNraW4uc21hbGxTdGF0aWNBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi5mYWlsdXJlQXZhdGFyID0gbnVsbDtcbiAgY29uZmlnLnNraW4ud2luQXZhdGFyID0gbnVsbDtcblxuICBjb25maWcubG9hZEF1ZGlvID0gZnVuY3Rpb24oKSB7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblNvdW5kLCAnd2luJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG4gIH07XG5cbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdDYWxjJyk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBDQU5WQVNfV0lEVEgpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIENBTlZBU19IRUlHSFQpO1xuXG4gICAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgICB2YXIgYmFja2dyb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kJyk7XG4gICAgICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAnL2Jsb2NrbHkvbWVkaWEvc2tpbnMvY2FsYy9iYWNrZ3JvdW5kX2ZyZWVwbGF5LnBuZycpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgaGFjayB0aGF0IEkgaGF2ZW4ndCBiZWVuIGFibGUgdG8gZnVsbHkgdW5kZXJzdGFuZC4gRnVydGhlcm1vcmUsXG4gICAgLy8gaXQgc2VlbXMgdG8gYnJlYWsgdGhlIGZ1bmN0aW9uYWwgYmxvY2tzIGluIHNvbWUgYnJvd3NlcnMuIEFzIHN1Y2gsIEknbVxuICAgIC8vIGp1c3QgZ29pbmcgdG8gZGlzYWJsZSB0aGUgaGFjayBmb3IgdGhpcyBhcHAuXG4gICAgQmxvY2tseS5CUk9LRU5fQ09OVFJPTF9QT0lOVFMgPSBmYWxzZTtcblxuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ0NhbGMsY29kZScpO1xuXG4gICAgdmFyIHNvbHV0aW9uQmxvY2tzID0gbGV2ZWwuc29sdXRpb25CbG9ja3M7XG4gICAgaWYgKGxldmVsLnNvbHV0aW9uQmxvY2tzICYmIGxldmVsLnNvbHV0aW9uQmxvY2tzICE9PSAnJykge1xuICAgICAgc29sdXRpb25CbG9ja3MgPSBibG9ja1V0aWxzLmZvcmNlSW5zZXJ0VG9wQmxvY2sobGV2ZWwuc29sdXRpb25CbG9ja3MsXG4gICAgICAgIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrKTtcbiAgICB9XG5cbiAgICBhcHBTdGF0ZS50YXJnZXRTZXQgPSBnZW5lcmF0ZUVxdWF0aW9uU2V0RnJvbUJsb2NrWG1sKHNvbHV0aW9uQmxvY2tzKTtcblxuICAgIGRpc3BsYXlHb2FsKGFwcFN0YXRlLnRhcmdldFNldCk7XG5cbiAgICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gICAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG5cbiAgICAvLyBiYXNlJ3Mgc3R1ZGlvQXBwLnJlc2V0QnV0dG9uQ2xpY2sgd2lsbCBiZSBjYWxsZWQgZmlyc3RcbiAgICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcbiAgICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KHJlc2V0QnV0dG9uLCBDYWxjLnJlc2V0QnV0dG9uQ2xpY2spO1xuXG4gICAgaWYgKEJsb2NrbHkuY29udHJhY3RFZGl0b3IpIHtcbiAgICAgIEJsb2NrbHkuY29udHJhY3RFZGl0b3IucmVnaXN0ZXJUZXN0SGFuZGxlcihnZXRDYWxjRXhhbXBsZUZhaWx1cmUpO1xuICAgICAgQmxvY2tseS5jb250cmFjdEVkaXRvci5yZWdpc3RlclRlc3RSZXNldEhhbmRsZXIocmVzZXRDYWxjRXhhbXBsZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZW5kZXJDb2RlV29ya3NwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjb2RlV29ya3NwYWNlRWpzKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIGVkaXRDb2RlOiBsZXZlbC5lZGl0Q29kZSxcbiAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZW5kZXJWaXN1YWxpemF0aW9uQ29sdW1uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2aXN1YWxpemF0aW9uQ29sdW1uRWpzKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmxcbiAgICAgICAgfSksXG4gICAgICAgIGlucHV0T3V0cHV0VGFibGU6IGxldmVsLmlucHV0T3V0cHV0VGFibGVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBSZWFjdERPTS5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiBzdHVkaW9BcHAuaW5pdC5iaW5kKHN0dWRpb0FwcCwgY29uZmlnKVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7QmxvY2tseS5CbG9ja31cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2V2YWx1YXRlSW5QbGF5c3BhY2VdIFRydWUgaWYgdGhpcyB0ZXN0IHNob3VsZCBhbHNvIHNob3dcbiAqICAgZXZhbHVhdGlvbiBpbiB0aGUgcGxheSBzcGFjZVxuICogQHJldHVybnMge3N0cmluZ30gRXJyb3Igc3RyaW5nLCBvciBudWxsIGlmIHN1Y2Nlc3NcbiAqL1xuZnVuY3Rpb24gZ2V0Q2FsY0V4YW1wbGVGYWlsdXJlKGV4YW1wbGVCbG9jaywgZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICB0cnkge1xuICAgIHZhciBlbnRpcmVTZXQgPSBuZXcgRXF1YXRpb25TZXQoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKSk7XG5cbiAgICB2YXIgYWN0dWFsQmxvY2sgPSBleGFtcGxlQmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhcIkFDVFVBTFwiKTtcbiAgICB2YXIgZXhwZWN0ZWRCbG9jayA9IGV4YW1wbGVCbG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKFwiRVhQRUNURURcIik7XG5cbiAgICBzdHVkaW9BcHAuZmVlZGJhY2tfLnRocm93T25JbnZhbGlkRXhhbXBsZUJsb2NrcyhhY3R1YWxCbG9jaywgZXhwZWN0ZWRCbG9jayk7XG5cbiAgICB2YXIgYWN0dWFsRXF1YXRpb24gPSBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhhY3R1YWxCbG9jayk7XG4gICAgdmFyIGFjdHVhbCA9IGVudGlyZVNldC5ldmFsdWF0ZVdpdGhFeHByZXNzaW9uKGFjdHVhbEVxdWF0aW9uLmV4cHJlc3Npb24pO1xuXG4gICAgdmFyIGV4cGVjdGVkRXF1YXRpb24gPSBFcXVhdGlvblNldC5nZXRFcXVhdGlvbkZyb21CbG9jayhleHBlY3RlZEJsb2NrKTtcbiAgICB2YXIgZXhwZWN0ZWQgPSBlbnRpcmVTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHBlY3RlZEVxdWF0aW9uLmV4cHJlc3Npb24pO1xuXG4gICAgdmFyIGFyZUVxdWFsID0ganNudW1zLmVxdWFscyhleHBlY3RlZC5yZXN1bHQsIGFjdHVhbC5yZXN1bHQpO1xuXG4gICAgaWYgKGV2YWx1YXRlSW5QbGF5c3BhY2UpIHtcbiAgICAgIHZhciB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoZXhwZWN0ZWRFcXVhdGlvbiwgbnVsbCk7XG4gICAgICBpZiAoIWV4cGVjdGVkLmVycikge1xuICAgICAgICB0b2tlbkxpc3QucHVzaChuZXcgVG9rZW4oJyA9ICcsIGZhbHNlKSk7XG4gICAgICAgIHRva2VuTGlzdC5wdXNoKG5ldyBUb2tlbihleHBlY3RlZC5yZXN1bHQsICFhcmVFcXVhbCkpO1xuICAgICAgfVxuICAgICAgY2xlYXJTdmdFeHByZXNzaW9uKCdhbnN3ZXJFeHByZXNzaW9uJyk7XG4gICAgICBkaXNwbGF5RXF1YXRpb24oJ3VzZXJFeHByZXNzaW9uJywgbnVsbCwgdG9rZW5MaXN0LCAwLCAnZXJyb3JUb2tlbicpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmVFcXVhbCA/IG51bGwgOiBcIkRvZXMgbm90IG1hdGNoIGRlZmluaXRpb25cIjtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBNb3N0IENhbGMgZXJyb3IgbWVzc2FnZXMgd2VyZSBub3QgbWVhbnQgdG8gYmUgdXNlciBmYWNpbmcuXG4gICAgcmV0dXJuIFwiRXZhbHVhdGlvbiBGYWlsZWQuXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzZXRDYWxjRXhhbXBsZSgpIHtcbiAgY2xlYXJTdmdFeHByZXNzaW9uKCd1c2VyRXhwcmVzc2lvbicpO1xuICBkaXNwbGF5R29hbChhcHBTdGF0ZS50YXJnZXRTZXQpO1xufVxuXG4vKipcbiAqIEEgZmV3IHBvc3NpYmxlIHNjZW5hcmlvc1xuICogKDEpIFdlIGRvbid0IGhhdmUgYSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uIChpLmUuIGZyZWVwbGF5KS4gU2hvdyBub3RoaW5nLlxuICogKDIpIFdlIGhhdmUgYSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uLCBvbmUgZnVuY3Rpb24sIGFuZCBubyB2YXJpYWJsZXMuXG4gKiAgICAgU2hvdyB0aGUgY29tcHV0ZSBleHByZXNzaW9uICsgZXZhbHVhdGlvbiwgYW5kIG5vdGhpbmcgZWxzZVxuICogKDMpIFdlIGhhdmUgYSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uIHRoYXQgaXMganVzdCBhIHNpbmdsZSB2YXJpYWJsZSwgYW5kXG4gKiAgICAgc29tZSBudW1iZXIgb2YgYWRkaXRpb25hbCB2YXJpYWJsZXMsIGJ1dCBubyBmdW5jdGlvbnMuIERpc3BsYXkgb25seVxuICogICAgIHRoZSBuYW1lIG9mIHRoZSBzaW5nbGUgdmFyaWFibGVcbiAqICg0KSBXZSBoYXZlIGEgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbiB0aGF0IGlzIG5vdCBhIHNpbmdsZSB2YXJpYWJsZSwgYW5kXG4gKiAgICAgcG9zc2libGUgc29tZSBudW1iZXIgb2YgYWRkaXRpb25hbCB2YXJpYWJsZXMsIGJ1dCBubyBmdW5jdGlvbnMuIERpc3BsYXlcbiAqICAgICBjb21wdXRlIGV4cHJlc3Npb24gYW5kIHZhcmlhYmxlcy5cbiAqICg1KSBXZSBoYXZlIGEgdGFyZ2V0IGNvbXB1dGUgZXhwcmVzc2lvbiwgYW5kIGVpdGhlciBtdWx0aXBsZSBmdW5jdGlvbnMgb3JcbiAqICAgICBvbmUgZnVuY3Rpb24gYW5kIHZhcmlhYmxlKHMpLiBDdXJyZW50bHkgbm90IHN1cHBvcnRlZC5cbiAqIEBwYXJhbSB7RXF1YXRpb25TZXR9IHRhcmdldFNldCBUaGUgdGFyZ2V0IGVxdWF0aW9uIHNldC5cbiAqL1xuZnVuY3Rpb24gZGlzcGxheUdvYWwodGFyZ2V0U2V0KSB7XG4gIHZhciBjb21wdXRlRXF1YXRpb24gPSB0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCk7XG4gIGlmICghY29tcHV0ZUVxdWF0aW9uIHx8ICFjb21wdXRlRXF1YXRpb24uZXhwcmVzc2lvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIHdlIGhhdmUgYSBzaW5nbGUgZnVuY3Rpb24sIGp1c3Qgc2hvdyB0aGUgZXZhbHVhdGlvblxuICAvLyAoaS5lLiBjb21wdXRlIGV4cHJlc3Npb24pLiBPdGhlcndpc2Ugc2hvdyBhbGwgZXF1YXRpb25zLlxuICB2YXIgdG9rZW5MaXN0O1xuICB2YXIgbmV4dFJvdyA9IDA7XG4gIHZhciBjb21wdXRlc0Z1bmN0aW9uID0gdGFyZ2V0U2V0LmNvbXB1dGVzRnVuY3Rpb25DYWxsKCk7XG4gIGlmICghY29tcHV0ZXNGdW5jdGlvbiAmJiAhdGFyZ2V0U2V0LmNvbXB1dGVzU2luZ2xlVmFyaWFibGUoKSkge1xuICAgIHZhciBzb3J0ZWRFcXVhdGlvbnMgPSB0YXJnZXRTZXQuc29ydGVkRXF1YXRpb25zKCk7XG4gICAgc29ydGVkRXF1YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGVxdWF0aW9uKSB7XG4gICAgICBpZiAoZXF1YXRpb24uaXNGdW5jdGlvbigpICYmIHNvcnRlZEVxdWF0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbGMgZG9lc24ndCBzdXBwb3J0IGdvYWwgd2l0aCBtdWx0aXBsZSBmdW5jdGlvbnMgb3IgXCIgK1xuICAgICAgICAgIFwibWl4ZWQgZnVuY3Rpb25zL3ZhcnNcIik7XG4gICAgICB9XG5cbiAgICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChlcXVhdGlvbik7XG4gICAgICBkaXNwbGF5RXF1YXRpb24oJ2Fuc3dlckV4cHJlc3Npb24nLCBlcXVhdGlvbi5zaWduYXR1cmUsIHRva2VuTGlzdCwgbmV4dFJvdysrKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChjb21wdXRlRXF1YXRpb24pO1xuICB2YXIgZXZhbHVhdGlvbiA9IHRhcmdldFNldC5ldmFsdWF0ZSgpO1xuICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICB0aHJvdyBldmFsdWF0aW9uLmVycjtcbiAgfVxuXG4gIGlmIChjb21wdXRlc0Z1bmN0aW9uKSB7XG4gICAgdG9rZW5MaXN0LnB1c2gobmV3IFRva2VuKCcgPSAnLCBmYWxzZSkpO1xuICAgIHRva2VuTGlzdC5wdXNoKG5ldyBUb2tlbihldmFsdWF0aW9uLnJlc3VsdCwgZmFsc2UpKTtcbiAgfVxuICBkaXNwbGF5RXF1YXRpb24oJ2Fuc3dlckV4cHJlc3Npb24nLCBjb21wdXRlRXF1YXRpb24uc2lnbmF0dXJlLCB0b2tlbkxpc3QsIG5leHRSb3cpO1xufVxuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkNhbGMucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuICBDYWxjLmV4ZWN1dGUoKTtcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIHJlc2V0IGJ1dHRvbiBjbGljayBsb2dpYy4gIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmVcbiAqIGNhbGxlZCBmaXJzdC5cbiAqL1xuQ2FsYy5yZXNldEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICBhcHBTdGF0ZS5hbmltYXRpbmcgPSBmYWxzZTtcbiAgYXBwU3RhdGUud2FpdGluZ0ZvclJlcG9ydCA9IGZhbHNlO1xuICBhcHBTdGF0ZS5yZXNwb25zZSA9IG51bGw7XG4gIGFwcFN0YXRlLm1lc3NhZ2UgPSBudWxsO1xuICBhcHBTdGF0ZS5yZXN1bHQgPSBudWxsO1xuICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IG51bGw7XG4gIGFwcFN0YXRlLmZhaWxlZElucHV0ID0gbnVsbDtcblxuICB0aW1lb3V0TGlzdC5jbGVhclRpbWVvdXRzKCk7XG5cbiAgY2xlYXJTdmdFeHByZXNzaW9uKCd1c2VyRXhwcmVzc2lvbicpO1xufTtcblxuLyoqXG4gKiBHaXZlbiBzb21lIHhtbCwgZ2VuZWF0ZXMgYW4gZXhwcmVzc2lvbiBzZXQgYnkgbG9hZGluZyBibG9ja3MgaW50byB0aGVcbiAqIGJsb2Nrc3BhY2UuLiBGYWlscyBpZiB0aGVyZSBhcmUgYWxyZWFkeSBibG9ja3MgaW4gdGhlIHdvcmtzcGFjZS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVFcXVhdGlvblNldEZyb21CbG9ja1htbChibG9ja1htbCkge1xuICBpZiAoYmxvY2tYbWwpIHtcbiAgICBpZiAoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImdlbmVyYXRlVGFyZ2V0RXhwcmVzc2lvbiBzaG91bGRuJ3QgYmUgY2FsbGVkIHdpdGggYmxvY2tzXCIgK1xuICAgICAgICBcImlmIHdlIGFscmVhZHkgaGF2ZSBibG9ja3MgaW4gdGhlIHdvcmtzcGFjZVwiKTtcbiAgICB9XG4gICAgLy8gVGVtcG9yYXJpbHkgcHV0IHRoZSBibG9ja3MgaW50byB0aGUgd29ya3NwYWNlIHNvIHRoYXQgd2UgY2FuIGdlbmVyYXRlIGNvZGVcbiAgICBzdHVkaW9BcHAubG9hZEJsb2NrcyhibG9ja1htbCk7XG4gIH1cblxuICB2YXIgZXF1YXRpb25TZXQgPSBuZXcgRXF1YXRpb25TZXQoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKSk7XG5cbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChibG9jaykge1xuICAgIGJsb2NrLmRpc3Bvc2UoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGVxdWF0aW9uU2V0O1xufVxuXG4vKipcbiAqIEV2YWx1YXRlcyBhIHRhcmdldCBzZXQgYWdhaW5zdCBhIHVzZXIgc2V0IHdoZW4gdGhlcmUgaXMgb25seSBvbmUgZnVuY3Rpb24uXG4gKiBJdCBkb2VzIHRoaXMgYmUgZmVlZGluZyB0aGUgZnVuY3Rpb24gYSBzZXQgb2YgdmFsdWVzLCBhbmQgbWFraW5nIHN1cmVcbiAqIHRoZSB0YXJnZXQgYW5kIHVzZXIgc2V0IGV2YWx1YXRlIHRvIHRoZSBzYW1lIHJlc3VsdCBmb3IgZWFjaC5cbiAqL1xuQ2FsYy5ldmFsdWF0ZUZ1bmN0aW9uXyA9IGZ1bmN0aW9uICh0YXJnZXRTZXQsIHVzZXJTZXQpIHtcbiAgdmFyIG91dGNvbWUgPSB7XG4gICAgcmVzdWx0OiBSZXN1bHRUeXBlLlVOU0VULFxuICAgIHRlc3RSZXN1bHRzOiBUZXN0UmVzdWx0cy5OT19URVNUU19SVU4sXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkLFxuICAgIGZhaWxlZElucHV0OiBudWxsXG4gIH07XG5cbiAgLy8gaWYgb3VyIHRhcmdldCBpcyBhIHNpbmdsZSBmdW5jdGlvbiwgd2UgZXZhbHVhdGUgc3VjY2VzcyBieSBldmFsdWF0aW5nIHRoZVxuICAvLyBmdW5jdGlvbiB3aXRoIGRpZmZlcmVudCBpbnB1dHNcbiAgdmFyIGV4cHJlc3Npb24gPSB0YXJnZXRTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbi5jbG9uZSgpO1xuXG4gIC8vIG1ha2Ugc3VyZSBvdXIgdGFyZ2V0L3VzZXIgY2FsbHMgbG9vayB0aGUgc2FtZVxuICB2YXIgdXNlckVxdWF0aW9uID0gdXNlclNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgdmFyIHVzZXJFeHByZXNzaW9uID0gdXNlckVxdWF0aW9uICYmIHVzZXJFcXVhdGlvbi5leHByZXNzaW9uO1xuICBpZiAoIWV4cHJlc3Npb24uaGFzU2FtZVNpZ25hdHVyZSh1c2VyRXhwcmVzc2lvbikgfHxcbiAgICAhdXNlclNldC5jb21wdXRlc0Z1bmN0aW9uQ2FsbCgpKSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTDtcblxuICAgIHZhciB0YXJnZXRGdW5jdGlvbk5hbWUgPSBleHByZXNzaW9uLmdldFZhbHVlKCk7XG4gICAgaWYgKCF1c2VyU2V0LmdldEVxdWF0aW9uKHRhcmdldEZ1bmN0aW9uTmFtZSkpIHtcbiAgICAgIG91dGNvbWUubWVzc2FnZSA9IGNhbGNNc2cubWlzc2luZ0Z1bmN0aW9uRXJyb3Ioe1xuICAgICAgICBmdW5jdGlvbk5hbWU6IHRhcmdldEZ1bmN0aW9uTmFtZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cblxuICAvLyBGaXJzdCBldmFsdWF0ZSBib3RoIHdpdGggdGhlIHRhcmdldCBzZXQgb2YgaW5wdXRzXG4gIHZhciB0YXJnZXRFdmFsdWF0aW9uID0gdGFyZ2V0U2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIHZhciB1c2VyRXZhbHVhdGlvbiA9IHVzZXJTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgaWYgKHRhcmdldEV2YWx1YXRpb24uZXJyIHx8IHVzZXJFdmFsdWF0aW9uLmVycikge1xuICAgIHJldHVybiBkaXZaZXJvT3JGYWlsdXJlKHRhcmdldEV2YWx1YXRpb24uZXJyIHx8IHVzZXJFdmFsdWF0aW9uLmVycik7XG4gIH1cbiAgaWYgKCFqc251bXMuZXF1YWxzKHRhcmdldEV2YWx1YXRpb24ucmVzdWx0LCB1c2VyRXZhbHVhdGlvbi5yZXN1bHQpKSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTDtcbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgd2UgcGFzc2VkIHVzaW5nIHRoZSB0YXJnZXQgY29tcHV0ZSBleHByZXNzaW9uJ3MgaW5wdXRzLlxuICAvLyBOb3cgd2Ugd2FudCB0byB1c2UgYWxsIGNvbWJpbmF0aW9ucyBvZiBpbnB1dHMgaW4gdGhlIHJhbmdlIFstMTAwLi4uMTAwXSxcbiAgLy8gbm90aW5nIHdoaWNoIHNldCBvZiBpbnB1dHMgZmFpbGVkIChpZiBhbnkpXG4gIHZhciBwb3NzaWJsZVZhbHVlcyA9IF8ucmFuZ2UoMSwgMTAxKS5jb25jYXQoXy5yYW5nZSgtMCwgLTEwMSwgLTEpKTtcbiAgdmFyIG51bVBhcmFtcyA9IGV4cHJlc3Npb24ubnVtQ2hpbGRyZW4oKTtcbiAgdmFyIGl0ZXJhdG9yID0gbmV3IElucHV0SXRlcmF0b3IocG9zc2libGVWYWx1ZXMsIG51bVBhcmFtcyk7XG5cbiAgdmFyIHNldENoaWxkVG9WYWx1ZSA9IGZ1bmN0aW9uICh2YWwsIGluZGV4KSB7XG4gICAgZXhwcmVzc2lvbi5zZXRDaGlsZFZhbHVlKGluZGV4LCB2YWwpO1xuICB9O1xuXG4gIHdoaWxlIChpdGVyYXRvci5yZW1haW5pbmcoKSA+IDAgJiYgIW91dGNvbWUuZmFpbGVkSW5wdXQpIHtcbiAgICB2YXIgdmFsdWVzID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIHZhbHVlcy5mb3JFYWNoKHNldENoaWxkVG9WYWx1ZSk7XG5cbiAgICB0YXJnZXRFdmFsdWF0aW9uID0gdGFyZ2V0U2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gICAgdXNlckV2YWx1YXRpb24gPSB1c2VyU2V0LmV2YWx1YXRlV2l0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gICAgaWYgKHRhcmdldEV2YWx1YXRpb24uZXJyIHx8IHVzZXJFdmFsdWF0aW9uLmVycikge1xuICAgICAgcmV0dXJuIGRpdlplcm9PckZhaWx1cmUodGFyZ2V0RXZhbHVhdGlvbi5lcnIgfHwgdXNlckV2YWx1YXRpb24uZXJyKTtcbiAgICB9XG4gICAgaWYgKCFqc251bXMuZXF1YWxzKHRhcmdldEV2YWx1YXRpb24ucmVzdWx0LCB1c2VyRXZhbHVhdGlvbi5yZXN1bHQpKSB7XG4gICAgICBvdXRjb21lLmZhaWxlZElucHV0ID0gXy5jbG9uZSh2YWx1ZXMpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvdXRjb21lLmZhaWxlZElucHV0KSB7XG4gICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgIG91dGNvbWUubWVzc2FnZSA9IGNhbGNNc2cuZmFpbGVkSW5wdXQoKTtcbiAgfSBlbHNlIGlmICghdGFyZ2V0U2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb24uaXNJZGVudGljYWxUbyhcbiAgICAgIHVzZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbikpIHtcbiAgICAvLyB3ZSBoYXZlIHRoZSByaWdodCBmdW5jdGlvbiwgYnV0IGFyZSBjYWxsaW5nIHdpdGggdGhlIHdyb25nIGlucHV0c1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICBvdXRjb21lLm1lc3NhZ2UgPSBjYWxjTXNnLndyb25nSW5wdXQoKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQUxMX1BBU1M7XG4gIH1cbiAgcmV0dXJuIG91dGNvbWU7XG59O1xuXG5mdW5jdGlvbiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKG1lc3NhZ2UsIGZhaWxlZElucHV0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdWx0OiBSZXN1bHRUeXBlLkZBSUxVUkUsXG4gICAgdGVzdFJlc3VsdHM6IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMLFxuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgZmFpbGVkSW5wdXQ6IHV0aWxzLnZhbHVlT3IoZmFpbGVkSW5wdXQsIG51bGwpXG4gIH07XG59XG5cbi8qKlxuICogTG9va3MgdG8gc2VlIGlmIGdpdmVuIGVycm9yIGlzIGEgZGl2aWRlIGJ5IHplcm8gZXJyb3IuIElmIGl0IGlzLCB3ZSBmYWlsXG4gKiB3aXRoIGFuIGFwcCBzcGVjaWZpYyBtZXRob2QuIElmIG5vdCwgd2UgdGhyb3cgYSBzdGFuZGFyZCBmYWlsdXJlXG4gKi9cbmZ1bmN0aW9uIGRpdlplcm9PckZhaWx1cmUoZXJyKSB7XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvcikge1xuICAgIHJldHVybiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKGNhbGNNc2cuZGl2aWRlQnlaZXJvRXJyb3IoKSwgbnVsbCk7XG4gIH1cblxuICAvLyBPbmUgd2F5IHdlIGtub3cgd2UgY2FuIGZhaWwgaXMgd2l0aCBpbmZpbml0ZSByZWN1cnNpb24uIExvZyBpZiB3ZSBmYWlsXG4gIC8vIGZvciBzb21lIG90aGVyIHJlYXNvblxuICBpZiAoIXV0aWxzLmlzSW5maW5pdGVSZWN1cnNpb25FcnJvcihlcnIpKSB7XG4gICAgY29uc29sZS5sb2coJ1VuZXhwZWN0ZWQgZXJyb3I6ICcgKyBlcnIpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZXN1bHQ6IFJlc3VsdFR5cGUuRkFJTFVSRSxcbiAgICB0ZXN0UmVzdWx0czogVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMLFxuICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgZmFpbGVkSW5wdXQ6IG51bGxcbiAgfTtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZXMgYSB0YXJnZXQgc2V0IGFnYWluc3QgYSB1c2VyIHNldCB3aGVuIG91ciBjb21wdXRlIGV4cHJlc3Npb24gaXNcbiAqIGp1c3QgYSBuYWtlZCB2YXJpYWJsZS4gSXQgZG9lcyB0aGlzIGJ5IGxvb2tpbmcgZm9yIGEgY29uc3RhbnQgaW4gdGhlXG4gKiBlcXVhdGlvbiBzZXQsIGFuZCB0aGVuIHZhbGlkYXRpbmcgdGhhdCAoYSkgd2UgaGF2ZSBhIHZhcmlhYmxlIG9mIHRoZSBzYW1lXG4gKiBuYW1lIGluIHRoZSB1c2VyIHNldCBhbmQgKGIpIHRoYXQgY2hhbmdpbmcgdGhhdCB2YWx1ZSBpbiBib3RoIHNldHMgc3RpbGxcbiAqIHJlc3VsdHMgaW4gdGhlIHNhbWUgZXZhbHVhdGlvblxuICovXG5DYWxjLmV2YWx1YXRlU2luZ2xlVmFyaWFibGVfID0gZnVuY3Rpb24gKHRhcmdldFNldCwgdXNlclNldCkge1xuICB2YXIgb3V0Y29tZSA9IHtcbiAgICByZXN1bHQ6IFJlc3VsdFR5cGUuVU5TRVQsXG4gICAgdGVzdFJlc3VsdHM6IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTixcbiAgICBtZXNzYWdlOiB1bmRlZmluZWQsXG4gICAgZmFpbGVkSW5wdXQ6IG51bGxcbiAgfTtcblxuICBpZiAoIXRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKS5leHByZXNzaW9uLmlzSWRlbnRpY2FsVG8oXG4gICAgICB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUoY2FsY01zZy5sZXZlbEluY29tcGxldGVFcnJvcigpKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSBvdXIgdGFyZ2V0IHNldCBoYXMgYSBjb25zdGFudCB2YXJpYWJsZSB3ZSBjYW4gdXNlIGFzIG91clxuICAvLyBwc2V1ZG8gaW5wdXRcbiAgdmFyIHRhcmdldENvbnN0YW50cyA9IHRhcmdldFNldC5nZXRDb25zdGFudHMoKTtcbiAgaWYgKHRhcmdldENvbnN0YW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQ6IHNpbmdsZSB2YXJpYWJsZSB3aXRoIG5vIGNvbnN0YW50cycpO1xuICB9XG5cbiAgLy8gVGhlIGNvZGUgaXMgaW4gcGxhY2UgdG8gdGhlb3JldGljYWxseSBzdXBwb3J0IHZhcnlpbmcgbXVsdGlwbGUgY29uc3RhbnRzLFxuICAvLyBidXQgd2UgZGVjaWRlZCB3ZSBkb24ndCBuZWVkIHRvIHN1cHBvcnQgdGhhdCwgc28gSSdtIGdvaW5nIHRvIGV4cGxpY2l0bHlcbiAgLy8gZGlzYWxsb3cgaXQgdG8gcmVkdWNlIHRoZSB0ZXN0IG1hdHJpeC5cbiAgaWYgKHRhcmdldENvbnN0YW50cy5sZW5ndGggIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHN1cHBvcnQgZm9yIG11bHRpcGxlIGNvbnN0YW50cycpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIGVhY2ggb2Ygb3VyIHBzZXVkbyBpbnB1dHMgaGFzIGEgY29ycmVzcG9uZGluZyB2YXJpYWJsZSBpbiB0aGVcbiAgLy8gdXNlciBzZXQuXG4gIHZhciB1c2VyQ29uc3RhbnRzID0gdXNlclNldC5nZXRDb25zdGFudHMoKTtcbiAgdmFyIHVzZXJDb25zdGFudE5hbWVzID0gdXNlckNvbnN0YW50cy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5uYW1lO1xuICB9KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldENvbnN0YW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh1c2VyQ29uc3RhbnROYW1lcy5pbmRleE9mKHRhcmdldENvbnN0YW50c1tpXS5uYW1lKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBhcHBTcGVjaWZpY0ZhaWx1cmVPdXRjb21lKGNhbGNNc2cubWlzc2luZ1ZhcmlhYmxlWChcbiAgICAgICAge3ZhcjogdGFyZ2V0Q29uc3RhbnRzW2ldLm5hbWV9KSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgdG8gc2VlIHRoYXQgZXZhbHVhdGluZyB0YXJnZXQgc2V0IHdpdGggdGhlIHVzZXIgdmFsdWUgb2YgdGhlIGNvbnN0YW50KHMpXG4gIC8vIGdpdmVzIHRoZSBzYW1lIHJlc3VsdCBhcyBldmFsdWF0aW5nIHRoZSB1c2VyIHNldC5cbiAgdmFyIGV2YWx1YXRpb24gPSB1c2VyU2V0LmV2YWx1YXRlKCk7XG4gIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgIHJldHVybiBkaXZaZXJvT3JGYWlsdXJlKGV2YWx1YXRpb24uZXJyKTtcbiAgfVxuICB2YXIgdXNlclJlc3VsdCA9IGV2YWx1YXRpb24ucmVzdWx0O1xuXG4gIHZhciB0YXJnZXRDbG9uZSA9IHRhcmdldFNldC5jbG9uZSgpO1xuICB2YXIgdXNlckNsb25lID0gdXNlclNldC5jbG9uZSgpO1xuICB2YXIgc2V0Q29uc3RhbnRzVG9WYWx1ZSA9IGZ1bmN0aW9uICh2YWwsIGluZGV4KSB7XG4gICAgdmFyIG5hbWUgPSB0YXJnZXRDb25zdGFudHNbaW5kZXhdLm5hbWU7XG4gICAgdGFyZ2V0Q2xvbmUuZ2V0RXF1YXRpb24obmFtZSkuZXhwcmVzc2lvbi5zZXRWYWx1ZSh2YWwpO1xuICAgIHVzZXJDbG9uZS5nZXRFcXVhdGlvbihuYW1lKS5leHByZXNzaW9uLnNldFZhbHVlKHZhbCk7XG4gIH07XG5cbiAgZXZhbHVhdGlvbiA9IHRhcmdldFNldC5ldmFsdWF0ZSgpO1xuICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICB0aHJvdyBldmFsdWF0aW9uLmVycjtcbiAgfVxuICB2YXIgdGFyZ2V0UmVzdWx0ID0gZXZhbHVhdGlvbi5yZXN1bHQ7XG5cbiAgaWYgKCFqc251bXMuZXF1YWxzKHVzZXJSZXN1bHQsIHRhcmdldFJlc3VsdCkpIHtcbiAgICAvLyBPdXIgcmVzdWx0IGNhbiBkaWZmZXJlbnQgZnJvbSB0aGUgdGFyZ2V0IHJlc3VsdCBmb3IgdHdvIHJlYXNvbnNcbiAgICAvLyAoMSkgV2UgaGF2ZSB0aGUgcmlnaHQgZXF1YXRpb24sIGJ1dCBvdXIgXCJjb25zdGFudFwiIGhhcyBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgICAvLyAoMikgV2UgaGF2ZSB0aGUgd3JvbmcgZXF1YXRpb25cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgZXZhbHVhdGUgdG8gdGhlIHNhbWUgYXMgdGFyZ2V0IGlmIHdlIGdpdmUgaXQgdGhlXG4gICAgLy8gdmFsdWVzIGZyb20gb3VyIHVzZXJTZXQuXG4gICAgdGFyZ2V0Q29uc3RhbnRzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICB2YXIgbmFtZSA9IGl0ZW0ubmFtZTtcbiAgICAgIHZhciB2YWwgPSB1c2VyQ2xvbmUuZ2V0RXF1YXRpb24obmFtZSkuZXhwcmVzc2lvbi5ldmFsdWF0ZSgpLnJlc3VsdDtcbiAgICAgIHNldENvbnN0YW50c1RvVmFsdWUodmFsLCBpbmRleCk7XG4gICAgfSk7XG5cbiAgICBldmFsdWF0aW9uID0gdGFyZ2V0Q2xvbmUuZXZhbHVhdGUoKTtcbiAgICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgIHJldHVybiBkaXZaZXJvT3JGYWlsdXJlKGV2YWx1YXRpb24uZXJyKTtcbiAgICB9XG4gICAgaWYgKCFqc251bXMuZXF1YWxzKHVzZXJSZXN1bHQsIGV2YWx1YXRpb24ucmVzdWx0KSkge1xuICAgICAgcmV0dXJuIGFwcFNwZWNpZmljRmFpbHVyZU91dGNvbWUoY2FsY01zZy53cm9uZ1Jlc3VsdCgpKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgdXNlciBnb3QgdGhlIHJpZ2h0IHZhbHVlIGZvciB0aGVpciBpbnB1dC4gTGV0J3MgdHJ5IGNoYW5naW5nIGl0IGFuZFxuICAvLyBzZWUgaWYgdGhleSBzdGlsbCBnZXQgdGhlIHJpZ2h0IHZhbHVlXG4gIHZhciBwb3NzaWJsZVZhbHVlcyA9IF8ucmFuZ2UoMSwgMTAxKS5jb25jYXQoXy5yYW5nZSgtMCwgLTEwMSwgLTEpKTtcbiAgdmFyIG51bVBhcmFtcyA9IHRhcmdldENvbnN0YW50cy5sZW5ndGg7XG4gIHZhciBpdGVyYXRvciA9IG5ldyBJbnB1dEl0ZXJhdG9yKHBvc3NpYmxlVmFsdWVzLCBudW1QYXJhbXMpO1xuXG4gIHdoaWxlIChpdGVyYXRvci5yZW1haW5pbmcoKSA+IDAgJiYgIW91dGNvbWUuZmFpbGVkSW5wdXQpIHtcbiAgICB2YXIgdmFsdWVzID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIHZhbHVlcy5mb3JFYWNoKHNldENvbnN0YW50c1RvVmFsdWUpO1xuXG4gICAgdmFyIHRhcmdldEV2YWx1YXRpb24gPSB0YXJnZXRDbG9uZS5ldmFsdWF0ZSgpO1xuICAgIHZhciB1c2VyRXZhbHVhdGlvbiA9IHVzZXJDbG9uZS5ldmFsdWF0ZSgpO1xuICAgIHZhciBlcnIgPSB0YXJnZXRFdmFsdWF0aW9uLmVyciB8fCB1c2VyRXZhbHVhdGlvbi5lcnI7XG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIGRpdlplcm9PckZhaWx1cmUoZXJyKTtcbiAgICB9XG5cbiAgICBpZiAoIWpzbnVtcy5lcXVhbHModGFyZ2V0RXZhbHVhdGlvbi5yZXN1bHQsIHVzZXJFdmFsdWF0aW9uLnJlc3VsdCkpIHtcbiAgICAgIG91dGNvbWUuZmFpbGVkSW5wdXQgPSBfLmNsb25lKHZhbHVlcyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG91dGNvbWUuZmFpbGVkSW5wdXQpIHtcbiAgICB2YXIgbWVzc2FnZSA9IGNhbGNNc2cud3JvbmdPdGhlclZhbHVlc1goe3ZhcjogdGFyZ2V0Q29uc3RhbnRzWzBdLm5hbWV9KTtcbiAgICByZXR1cm4gYXBwU3BlY2lmaWNGYWlsdXJlT3V0Y29tZShtZXNzYWdlLCBvdXRjb21lLmZhaWxlZElucHV0KTtcbiAgfVxuXG4gIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQUxMX1BBU1M7XG4gIHJldHVybiBvdXRjb21lO1xufTtcblxuLyoqXG4gKiBAc3RhdGljXG4gKiBAcmV0dXJucyBvdXRjb21lIG9iamVjdFxuICovXG5DYWxjLmV2YWx1YXRlUmVzdWx0c18gPSBmdW5jdGlvbiAodGFyZ2V0U2V0LCB1c2VyU2V0KSB7XG4gIHZhciBpZGVudGljYWwsIHVzZXIsIHRhcmdldDtcbiAgdmFyIG91dGNvbWUgPSB7XG4gICAgcmVzdWx0OiBSZXN1bHRUeXBlLlVOU0VULFxuICAgIHRlc3RSZXN1bHRzOiBUZXN0UmVzdWx0cy5OT19URVNUU19SVU4sXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkLFxuICAgIGZhaWxlZElucHV0OiBudWxsXG4gIH07XG5cbiAgaWYgKHRhcmdldFNldC5jb21wdXRlc0Z1bmN0aW9uQ2FsbCgpKSB7XG4gICAgLy8gRXZhbHVhdGUgZnVuY3Rpb24gYnkgdGVzdGluZyBpdCB3aXRoIGEgc2VyaWVzIG9mIGlucHV0c1xuICAgIHJldHVybiBDYWxjLmV2YWx1YXRlRnVuY3Rpb25fKHRhcmdldFNldCwgdXNlclNldCk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0U2V0LmNvbXB1dGVzU2luZ2xlVmFyaWFibGUoKSkge1xuICAgIHJldHVybiBDYWxjLmV2YWx1YXRlU2luZ2xlVmFyaWFibGVfKHRhcmdldFNldCwgdXNlclNldCk7XG4gIH0gZWxzZSBpZiAodXNlclNldC5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpIHx8XG4gICAgICB0YXJnZXRTZXQuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSkge1xuXG4gICAgLy8gV2UgaGF2ZSBtdWx0aXBsZSBleHByZXNzaW9ucy4gRWl0aGVyIG91ciBzZXQgb2YgZXhwcmVzc2lvbnMgYXJlIGVxdWFsLFxuICAgIC8vIG9yIHRoZXkncmUgbm90LlxuICAgIGlmICh0YXJnZXRTZXQuaXNJZGVudGljYWxUbyh1c2VyU2V0KSkge1xuICAgICAgb3V0Y29tZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQUxMX1BBU1M7XG4gICAgfSBlbHNlIGlmICh0YXJnZXRTZXQuaXNFcXVpdmFsZW50VG8odXNlclNldCkpIHtcbiAgICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgb3V0Y29tZS5tZXNzYWdlID0gY2FsY01zZy5lcXVpdmFsZW50RXhwcmVzc2lvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUw7XG4gICAgfVxuICAgIHJldHVybiBvdXRjb21lO1xuICB9IGVsc2Uge1xuICAgIC8vIFdlIGhhdmUgb25seSBhIGNvbXB1dGUgZXF1YXRpb24gZm9yIGVhY2ggc2V0LiBJZiB0aGV5J3JlIG5vdCBlcXVhbCxcbiAgICAvLyBjaGVjayB0byBzZWUgd2hldGhlciB0aGV5IGFyZSBlcXVpdmFsZW50IChpLmUuIHRoZSBzYW1lLCBidXQgd2l0aFxuICAgIC8vIGlucHV0cyBvcmRlcmVkIGRpZmZlcmVudGx5KVxuICAgIHVzZXIgPSB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICAgIHRhcmdldCA9IHRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKTtcblxuICAgIGlkZW50aWNhbCA9IHRhcmdldFNldC5pc0lkZW50aWNhbFRvKHVzZXJTZXQpO1xuICAgIGlmIChpZGVudGljYWwpIHtcbiAgICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFMTF9QQVNTO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICAgIHZhciBsZXZlbENvbXBsZXRlID0gKG91dGNvbWUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MpO1xuICAgICAgb3V0Y29tZS50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcbiAgICAgIGlmICh0YXJnZXQgJiYgdXNlci5leHByZXNzaW9uICYmXG4gICAgICAgICAgdXNlci5leHByZXNzaW9uLmlzRXF1aXZhbGVudFRvKHRhcmdldC5leHByZXNzaW9uKSkge1xuICAgICAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICAgIG91dGNvbWUubWVzc2FnZSA9IGNhbGNNc2cuZXF1aXZhbGVudEV4cHJlc3Npb24oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dGNvbWU7XG4gIH1cbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuXG4gKi9cbkNhbGMuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICBDYWxjLmdlbmVyYXRlUmVzdWx0c18oKTtcblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2NhbGMnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogYXBwU3RhdGUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgdGVzdFJlc3VsdDogYXBwU3RhdGUudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgIG9uQ29tcGxldGU6IG9uUmVwb3J0Q29tcGxldGVcbiAgfTtcblxuICBhcHBTdGF0ZS53YWl0aW5nRm9yUmVwb3J0ID0gdHJ1ZTtcbiAgc3R1ZGlvQXBwLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKGFwcFN0YXRlLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTID8gJ3dpbicgOiAnZmFpbHVyZScpO1xuXG4gIC8vIERpc3BsYXkgZmVlZGJhY2sgaW1tZWRpYXRlbHlcbiAgaWYgKGlzUHJlQW5pbWF0aW9uRmFpbHVyZShhcHBTdGF0ZS50ZXN0UmVzdWx0cykpIHtcbiAgICByZXR1cm4gZGlzcGxheUZlZWRiYWNrKCk7XG4gIH1cblxuICBhcHBTdGF0ZS5hbmltYXRpbmcgPSB0cnVlO1xuICBpZiAoYXBwU3RhdGUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MgJiZcbiAgICAgIGFwcFN0YXRlLnVzZXJTZXQuaXNBbmltYXRhYmxlKCkgJiZcbiAgICAgICFsZXZlbC5lZGl0X2Jsb2Nrcykge1xuICAgIENhbGMuc3RlcCgwKTtcbiAgfSBlbHNlIHtcbiAgICBkaXNwbGF5Q29tcGxleFVzZXJFeHByZXNzaW9ucygpO1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc3RvcEFuaW1hdGluZ0FuZERpc3BsYXlGZWVkYmFjaygpO1xuICAgIH0sIHN0ZXBTcGVlZCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGlzUHJlQW5pbWF0aW9uRmFpbHVyZSh0ZXN0UmVzdWx0KSB7XG4gIHJldHVybiB0ZXN0UmVzdWx0ID09PSBUZXN0UmVzdWx0cy5RVUVTVElPTl9NQVJLU19JTl9OVU1CRVJfRklFTEQgfHxcbiAgICB0ZXN0UmVzdWx0ID09PSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTkFMX0JMT0NLIHx8XG4gICAgdGVzdFJlc3VsdCA9PT0gVGVzdFJlc3VsdHMuRVhUUkFfVE9QX0JMT0NLU19GQUlMIHx8XG4gICAgdGVzdFJlc3VsdCA9PT0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQgfHxcbiAgICB0ZXN0UmVzdWx0ID09PSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTl9OQU1FO1xufVxuXG4vKipcbiAqIEZpbGwgYXBwU3RhdGUgd2l0aCB0aGUgcmVzdWx0cyBvZiBwcm9ncmFtIGV4ZWN1dGlvbi5cbiAqIEBzdGF0aWNcbiAqL1xuQ2FsYy5nZW5lcmF0ZVJlc3VsdHNfID0gZnVuY3Rpb24gKCkge1xuICBhcHBTdGF0ZS5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIC8vIENoZWNrIGZvciBwcmUtZXhlY3V0aW9uIGVycm9yc1xuICBpZiAoc3R1ZGlvQXBwLmhhc0V4dHJhVG9wQmxvY2tzKCkpIHtcbiAgICBhcHBTdGF0ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgYXBwU3RhdGUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWFRSQV9UT1BfQkxPQ0tTX0ZBSUw7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNVbmZpbGxlZEZ1bmN0aW9uYWxCbG9jaygpKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05BTF9CTE9DSztcbiAgICBhcHBTdGF0ZS5tZXNzYWdlID0gc3R1ZGlvQXBwLmdldFVuZmlsbGVkRnVuY3Rpb25hbEJsb2NrRXJyb3IoJ2Z1bmN0aW9uYWxfY29tcHV0ZScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChzdHVkaW9BcHAuaGFzUXVlc3Rpb25NYXJrc0luTnVtYmVyRmllbGQoKSkge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlFVRVNUSU9OX01BUktTX0lOX05VTUJFUl9GSUVMRDtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoc3R1ZGlvQXBwLmhhc0VtcHR5RnVuY3Rpb25PclZhcmlhYmxlTmFtZSgpKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05fTkFNRTtcbiAgICBhcHBTdGF0ZS5tZXNzYWdlID0gY29tbW9uTXNnLnVubmFtZWRGdW5jdGlvbigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGFwcFN0YXRlLnVzZXJTZXQgPSBuZXcgRXF1YXRpb25TZXQoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKSk7XG4gIGFwcFN0YXRlLmZhaWxlZElucHV0ID0gbnVsbDtcblxuICAvLyBOb3RlOiBUaGlzIHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgZnJlZSBwbGF5LCBzbyB5b3UgY2FuIFwiZmFpbFwiIGEgZnJlZVxuICAvLyBwbGF5IGxldmVsIHdpdGggYSBkaXZpZGUgYnkgemVybyBlcnJvci5cbiAgLy8gQWxzbyB3b3J0aCBub3RpbmcsIHdlIG1pZ2h0IHN0aWxsIGVuZCB1cCBnZXR0aW5nIGEgZGl2IHplcm8gbGF0ZXIgd2hlblxuICAvLyB3ZSBzdGFydCB2YXJ5aW5nIGlucHV0cyBpbiBldmFsdWF0ZVJlc3VsdHNfXG4gIGlmIChhcHBTdGF0ZS51c2VyU2V0Lmhhc0Rpdlplcm8oKSkge1xuICAgIGFwcFN0YXRlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBhcHBTdGF0ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgIGFwcFN0YXRlLm1lc3NhZ2UgPSBjYWxjTXNnLmRpdmlkZUJ5WmVyb0Vycm9yKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGxldmVsLmZyZWVQbGF5IHx8IGxldmVsLmVkaXRfYmxvY2tzKSB7XG4gICAgYXBwU3RhdGUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIGFwcFN0YXRlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9IGVsc2Uge1xuICAgIGFwcFN0YXRlID0gJC5leHRlbmQoYXBwU3RhdGUsIENhbGMuY2hlY2tFeGFtcGxlc18oKSk7XG5cbiAgICBpZiAoYXBwU3RhdGUucmVzdWx0ID09PSBudWxsKSB7XG4gICAgICBhcHBTdGF0ZSA9ICQuZXh0ZW5kKGFwcFN0YXRlLFxuICAgICAgICBDYWxjLmV2YWx1YXRlUmVzdWx0c18oYXBwU3RhdGUudGFyZ2V0U2V0LCBhcHBTdGF0ZS51c2VyU2V0KSk7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGUgZGVmYXVsdCBtZXNzYWdlIGZvciBMRVZFTF9JTkNPTVBMRVRFX0ZBSUxcbiAgaWYgKGFwcFN0YXRlLnRlc3RSZXN1bHRzID09PSBUZXN0UmVzdWx0cy5MRVZFTF9JTkNPTVBMRVRFX0ZBSUwgJiZcbiAgICAgICFhcHBTdGF0ZS5tZXNzYWdlKSB7XG4gICAgYXBwU3RhdGUubWVzc2FnZSA9IGNhbGNNc2cubGV2ZWxJbmNvbXBsZXRlRXJyb3IoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBzZXQgb2YgYXBwU3RhdGUgdG8gYmUgbWVyZ2VkIGJ5IGNhbGxlclxuICovXG5DYWxjLmNoZWNrRXhhbXBsZXNfID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0Y29tZSA9IHt9O1xuICBpZiAoIWxldmVsLmV4YW1wbGVzUmVxdWlyZWQpIHtcbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxuXG4gIHZhciBleGFtcGxlbGVzcyA9IHN0dWRpb0FwcC5nZXRGdW5jdGlvbldpdGhvdXRUd29FeGFtcGxlcygpO1xuICBpZiAoZXhhbXBsZWxlc3MpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICBvdXRjb21lLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgb3V0Y29tZS5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogZXhhbXBsZWxlc3N9KTtcbiAgICByZXR1cm4gb3V0Y29tZTtcbiAgfVxuXG4gIHZhciB1bmZpbGxlZCA9IHN0dWRpb0FwcC5nZXRVbmZpbGxlZEZ1bmN0aW9uYWxFeGFtcGxlKCk7XG4gIGlmICh1bmZpbGxlZCkge1xuICAgIG91dGNvbWUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcblxuICAgIHZhciBuYW1lID0gdW5maWxsZWQuZ2V0Um9vdEJsb2NrKCkuZ2V0SW5wdXRUYXJnZXRCbG9jaygnQUNUVUFMJylcbiAgICAgIC5nZXRUaXRsZVZhbHVlKCdOQU1FJyk7XG4gICAgb3V0Y29tZS5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogbmFtZX0pO1xuICAgIHJldHVybiBvdXRjb21lO1xuICB9XG5cbiAgdmFyIGZhaWxpbmdCbG9ja05hbWUgPSBzdHVkaW9BcHAuY2hlY2tGb3JGYWlsaW5nRXhhbXBsZXMoZ2V0Q2FsY0V4YW1wbGVGYWlsdXJlKTtcbiAgaWYgKGZhaWxpbmdCbG9ja05hbWUpIHtcbiAgICBvdXRjb21lLnJlc3VsdCA9IGZhbHNlO1xuICAgIG91dGNvbWUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcbiAgICBvdXRjb21lLm1lc3NhZ2UgPSBjb21tb25Nc2cuZXhhbXBsZUVycm9yTWVzc2FnZSh7ZnVuY3Rpb25OYW1lOiBmYWlsaW5nQmxvY2tOYW1lfSk7XG4gIH1cblxuICByZXR1cm4gb3V0Y29tZTtcbn07XG5cbi8qKlxuICogSWYgd2UgaGF2ZSBhbnkgZnVuY3Rpb25zIG9yIHZhcmlhYmxlcyBpbiBvdXIgZXhwcmVzc2lvbiBzZXQsIHdlIGRvbid0IHN1cHBvcnRcbiAqIGFuaW1hdGluZyBldmFsdWF0aW9uLlxuICovXG5mdW5jdGlvbiBkaXNwbGF5Q29tcGxleFVzZXJFeHByZXNzaW9ucygpIHtcbiAgdmFyIHJlc3VsdDtcbiAgY2xlYXJTdmdFeHByZXNzaW9uKCd1c2VyRXhwcmVzc2lvbicpO1xuXG4gIC8vIENsb25lIHVzZXJTZXQsIGFzIHdlIG1pZ2h0IG1ha2Ugc21hbGwgY2hhbmdlcyB0byB0aGVtIChpLmUuIGlmIHdlIG5lZWQgdG9cbiAgLy8gdmFyeSB2YXJpYWJsZXMpXG4gIHZhciB1c2VyU2V0ID0gYXBwU3RhdGUudXNlclNldC5jbG9uZSgpO1xuICB2YXIgdGFyZ2V0U2V0ID0gYXBwU3RhdGUudGFyZ2V0U2V0O1xuXG4gIHZhciBjb21wdXRlRXF1YXRpb24gPSB1c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICBpZiAoY29tcHV0ZUVxdWF0aW9uID09PSBudWxsIHx8IGNvbXB1dGVFcXVhdGlvbi5leHByZXNzaW9uID09PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSB0b2tlbnMgZm9yIG91ciB1c2VyIGVxdWF0aW9uc1xuICB2YXIgbmV4dFJvdyA9IGRpc3BsYXlOb25Db21wdXRlRXF1YXRpb25zXyh1c2VyU2V0LCB0YXJnZXRTZXQpO1xuXG4gIGlmICh1c2VyU2V0LmNvbXB1dGVzU2luZ2xlQ29uc3RhbnQoKSkge1xuICAgIC8vIEluIHRoaXMgY2FzZSB0aGUgY29tcHV0ZSBlcXVhdGlvbiArIGV2YWx1YXRpb24gd2lsbCBiZSBleGFjdGx5IHRoZSBzYW1lXG4gICAgLy8gYXMgd2hhdCB3ZSd2ZSBhbHJlYWR5IHNob3duLCBzbyBkb24ndCBzaG93IGl0LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIE5vdyBkaXNwbGF5IG91ciBjb21wdXRlIGVxdWF0aW9uIGFuZCB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpbmcgaXRcbiAgdmFyIHRhcmdldEVxdWF0aW9uID0gdGFyZ2V0U2V0ICYmIHRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKTtcblxuICAvLyBXZSdyZSBlaXRoZXIgYSB2YXJpYWJsZSBvciBhIGZ1bmN0aW9uIGNhbGwuIEdlbmVyYXRlIGEgdG9rZW5MaXN0IChzaW5jZVxuICAvLyB3ZSBjb3VsZCBhY3R1YWxseSBiZSBkaWZmZXJlbnQgdGhhbiB0aGUgZ29hbClcbiAgdmFyIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdChjb21wdXRlRXF1YXRpb24sIHRhcmdldEVxdWF0aW9uKTtcbiAgaWYgKHVzZXJTZXQuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSB8fFxuICAgICAgY29tcHV0ZUVxdWF0aW9uLmV4cHJlc3Npb24uZGVwdGgoKSA+IDApIHtcbiAgICB0b2tlbkxpc3QgPSB0b2tlbkxpc3QuY29uY2F0KHRva2VuTGlzdEZvckV2YWx1YXRpb25fKHVzZXJTZXQsIHRhcmdldFNldCkpO1xuICB9XG5cbiAgZGlzcGxheUVxdWF0aW9uKCd1c2VyRXhwcmVzc2lvbicsIG51bGwsIHRva2VuTGlzdCwgbmV4dFJvdysrLCAnZXJyb3JUb2tlbicpO1xuXG4gIHRva2VuTGlzdCA9IHRva2VuTGlzdEZvckZhaWxlZEZ1bmN0aW9uSW5wdXRfKHVzZXJTZXQsIHRhcmdldFNldCk7XG4gIGlmICh0b2tlbkxpc3QgJiYgdG9rZW5MaXN0Lmxlbmd0aCkge1xuICAgIGRpc3BsYXlFcXVhdGlvbigndXNlckV4cHJlc3Npb24nLCBudWxsLCB0b2tlbkxpc3QsIG5leHRSb3crKywgJ2Vycm9yVG9rZW4nKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BsYXkgZXF1YXRpb25zIG90aGVyIHRoYW4gb3VyIGNvbXB1dGUgZXF1YXRpb24uXG4gKiBOb3RlOiBJbiBvbmUgY2FzZSAoc2luZ2xlIHZhcmlhYmxlIGNvbXB1dGUsIGZhaWxlZCBpbnB1dCkgd2UgYWxzbyBtb2RpZnlcbiAqIG91ciB1c2VyU2V0IGhlcmVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEhvdyBtYW55IHJvd3Mgd2UgZGlzcGxheSBlcXVhdGlvbnMgb24uXG4gKi9cbmZ1bmN0aW9uIGRpc3BsYXlOb25Db21wdXRlRXF1YXRpb25zXyh1c2VyU2V0LCB0YXJnZXRTZXQpIHtcbiAgLy8gaW4gc2luZ2xlIGZ1bmN0aW9uL3ZhcmlhYmxlIG1vZGUsIHdlJ3JlIG9ubHkgZ29pbmcgdG8gaGlnaGxpZ2h0IHRoZSBkaWZmZXJlbmNlc1xuICAvLyBpbiB0aGUgZXZhbHVhdGVkIHJlc3VsdFxuICB2YXIgaGlnaGxpZ2h0QWxsRXJyb3JzID0gIXRhcmdldFNldC5jb21wdXRlc0Z1bmN0aW9uQ2FsbCgpICYmXG4gICAgIXRhcmdldFNldC5jb21wdXRlc1NpbmdsZVZhcmlhYmxlKCk7XG5cbiAgaWYgKHRhcmdldFNldC5jb21wdXRlc1NpbmdsZVZhcmlhYmxlKCkgJiYgYXBwU3RhdGUuZmFpbGVkSW5wdXQgIT09IG51bGwpIHtcbiAgICB2YXIgdXNlckNvbnN0YW50cyA9IHVzZXJTZXQuZ2V0Q29uc3RhbnRzKCk7XG4gICAgdmFyIHRhcmdldENvbnN0YW50cyA9IHRhcmdldFNldC5nZXRDb25zdGFudHMoKTtcbiAgICAvLyByZXBsYWNlIGNvbnN0YW50cyB3aXRoIGZhaWxlZCBpbnB1dHMgaW4gdGhlIHVzZXIgc2V0LlxuICAgIHRhcmdldENvbnN0YW50cy5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXRFcXVhdGlvbiwgaW5kZXgpIHtcbiAgICAgIHZhciBuYW1lID0gdGFyZ2V0RXF1YXRpb24ubmFtZTtcbiAgICAgIHZhciB1c2VyRXF1YXRpb24gPSB1c2VyU2V0LmdldEVxdWF0aW9uKG5hbWUpO1xuICAgICAgdXNlckVxdWF0aW9uLmV4cHJlc3Npb24uc2V0VmFsdWUoYXBwU3RhdGUuZmFpbGVkSW5wdXRbaW5kZXhdKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBudW1Sb3dzID0gMDtcbiAgdmFyIHRva2VuTGlzdDtcbiAgdXNlclNldC5zb3J0ZWRFcXVhdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyRXF1YXRpb24pIHtcbiAgICB2YXIgZXhwZWN0ZWRFcXVhdGlvbiA9IGhpZ2hsaWdodEFsbEVycm9ycyA/XG4gICAgICB0YXJnZXRTZXQuZ2V0RXF1YXRpb24odXNlckVxdWF0aW9uLm5hbWUpIDogbnVsbDtcblxuICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdCh1c2VyRXF1YXRpb24sIGV4cGVjdGVkRXF1YXRpb24pO1xuXG4gICAgZGlzcGxheUVxdWF0aW9uKCd1c2VyRXhwcmVzc2lvbicsIHVzZXJFcXVhdGlvbi5zaWduYXR1cmUsIHRva2VuTGlzdCwgbnVtUm93cysrLFxuICAgICAgJ2Vycm9yVG9rZW4nKTtcbiAgfSk7XG5cbiAgcmV0dXJuIG51bVJvd3M7XG59XG5cbi8qKlxuICogQHJldHVybnMge1Rva2VuW119IHRva2VuIGxpc3QgY29tcGFyaW5nIHRoZSBldmx1YXRpb24gb2YgdGhlIHVzZXIgYW5kIHRhcmdldFxuICogICBzZXRzLiBJbmNsdWRlcyBlcXVhbHMgc2lnbi5cbiAqL1xuZnVuY3Rpb24gdG9rZW5MaXN0Rm9yRXZhbHVhdGlvbl8odXNlclNldCwgdGFyZ2V0U2V0KSB7XG4gIHZhciBldmFsdWF0aW9uID0gdXNlclNldC5ldmFsdWF0ZSgpO1xuXG4gIC8vIENoZWNrIGZvciBkaXYgemVyb1xuICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICBpZiAoZXZhbHVhdGlvbi5lcnIgaW5zdGFuY2VvZiBFeHByZXNzaW9uTm9kZS5EaXZpZGVCeVplcm9FcnJvciB8fFxuICAgICAgICB1dGlscy5pc0luZmluaXRlUmVjdXJzaW9uRXJyb3IoZXZhbHVhdGlvbi5lcnIpKSB7XG4gICAgICAvLyBFeHBlY3RlZCB0eXBlIG9mIGVycm9yLCBkbyBub3RoaW5nLlxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnVW5leHBlY3RlZCBlcnJvcjogJyArIGV2YWx1YXRpb24uZXJyKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGV2YWx1YXRpb24ucmVzdWx0O1xuICB2YXIgZXhwZWN0ZWRSZXN1bHQgPSByZXN1bHQ7XG4gIGlmICh0YXJnZXRTZXQuY29tcHV0ZXNTaW5nbGVWYXJpYWJsZSgpKSB7XG4gICAgLy8gSWYgd2UgaGF2ZSBhIGZhaWxlZCBpbnB1dCwgbWFrZSBzdXJlIHRoZSByZXN1bHQgZ2V0cyBtYXJrZWRcbiAgICByZXR1cm4gW1xuICAgICAgbmV3IFRva2VuKCcgPSAnLCBmYWxzZSksXG4gICAgICBuZXcgVG9rZW4ocmVzdWx0LCBhcHBTdGF0ZS5mYWlsZWRJbnB1dClcbiAgICBdO1xuICB9IGVsc2UgaWYgKHRhcmdldFNldC5jb21wdXRlRXF1YXRpb24oKSAhPT0gbnVsbCkge1xuICAgIGV4cGVjdGVkUmVzdWx0ID0gdGFyZ2V0U2V0LmV2YWx1YXRlKCkucmVzdWx0O1xuICB9XG5cbiAgLy8gYWRkIGEgdG9rZW5MaXN0IGRpZmZpbmcgb3VyIHJlc3VsdHNcbiAgcmV0dXJuIGNvbnN0cnVjdFRva2VuTGlzdCgnID0gJykuY29uY2F0KFxuICAgIGNvbnN0cnVjdFRva2VuTGlzdChyZXN1bHQsIGV4cGVjdGVkUmVzdWx0KSk7XG59XG5cbi8qKlxuICogRm9yIGNhc2VzIHdoZXJlIHdlIGhhdmUgYSBzaW5nbGUgZnVuY3Rpb24sIGFuZCBmYWlsdXJlIG9jY3VyZWQgb25seSBhZnRlclxuICogd2UgdmFyaWVkIHRoZSBpbnB1dHMsIHdlIHdhbnQgdG8gZGlzcGxheSBhIGZpbmFsIGxpbmUgdGhhdCBzaG93cyB0aGUgdmFyaWVkXG4gKiBpbnB1dCBhbmQgcmVzdWx0LiBUaGlzIG1ldGhvZCBnZW5lcmF0ZXMgdGhhdCB0b2tlbiBsaXN0XG4gKiBAcmV0dXJucyB7VG9rZW5bXX1cbiAqL1xuZnVuY3Rpb24gdG9rZW5MaXN0Rm9yRmFpbGVkRnVuY3Rpb25JbnB1dF8odXNlclNldCwgdGFyZ2V0U2V0KSB7XG4gIGlmIChhcHBTdGF0ZS5mYWlsZWRJbnB1dCA9PT0gbnVsbCB8fCAhdGFyZ2V0U2V0LmNvbXB1dGVzRnVuY3Rpb25DYWxsKCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgY29tcHV0ZUVxdWF0aW9uID0gdXNlclNldC5jb21wdXRlRXF1YXRpb24oKTtcbiAgdmFyIGV4cHJlc3Npb24gPSBjb21wdXRlRXF1YXRpb24uZXhwcmVzc2lvbi5jbG9uZSgpO1xuICBmb3IgKHZhciBjID0gMDsgYyA8IGV4cHJlc3Npb24ubnVtQ2hpbGRyZW4oKTsgYysrKSB7XG4gICAgZXhwcmVzc2lvbi5zZXRDaGlsZFZhbHVlKGMsIGFwcFN0YXRlLmZhaWxlZElucHV0W2NdKTtcbiAgfVxuICB2YXIgZXZhbHVhdGlvbiA9IHVzZXJTZXQuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgaWYgKGV2YWx1YXRpb24uZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IpIHtcbiAgICAgIGV2YWx1YXRpb24ucmVzdWx0ID0gJyc7IC8vIHJlc3VsdCB3aWxsIG5vdCBiZSB1c2VkIGluIHRoaXMgY2FzZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBldmFsdWF0aW9uLmVycjtcbiAgICB9XG4gIH1cbiAgdmFyIHJlc3VsdCA9IGV2YWx1YXRpb24ucmVzdWx0O1xuXG4gIHJldHVybiBjb25zdHJ1Y3RUb2tlbkxpc3QoZXhwcmVzc2lvbilcbiAgICAuY29uY2F0KG5ldyBUb2tlbignID0gJywgZmFsc2UpKVxuICAgIC5jb25jYXQobmV3IFRva2VuKHJlc3VsdCwgdHJ1ZSkpOyAvLyB0aGlzIHNob3VsZCBhbHdheXMgYmUgbWFya2VkXG59XG5cbmZ1bmN0aW9uIHN0b3BBbmltYXRpbmdBbmREaXNwbGF5RmVlZGJhY2soKSB7XG4gIGFwcFN0YXRlLmFuaW1hdGluZyA9IGZhbHNlO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtIGEgc3RlcCBpbiBvdXIgZXhwcmVzc2lvbiBldmFsdWF0aW9uIGFuaW1hdGlvbi4gVGhpcyBjb25zaXN0cyBvZlxuICogY29sbGFwc2luZyB0aGUgbmV4dCBub2RlIGluIG91ciB0cmVlLiBJZiB0aGF0IG5vZGUgZmFpbGVkIGV4cGVjdGF0aW9ucywgd2VcbiAqIHdpbGwgc3RvcCBmdXJ0aGVyIGV2YWx1YXRpb24uXG4gKi9cbkNhbGMuc3RlcCA9IGZ1bmN0aW9uIChhbmltYXRpb25EZXB0aCkge1xuICB2YXIgaXNGaW5hbCA9IGFuaW1hdGVVc2VyRXhwcmVzc2lvbihhbmltYXRpb25EZXB0aCk7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlmIChpc0ZpbmFsKSB7XG4gICAgICAvLyBvbmUgZGVlcGVyIHRvIHJlbW92ZSBoaWdobGlnaHRpbmdcbiAgICAgIGFuaW1hdGVVc2VyRXhwcmVzc2lvbihhbmltYXRpb25EZXB0aCArIDEpO1xuICAgICAgc3RvcEFuaW1hdGluZ0FuZERpc3BsYXlGZWVkYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBDYWxjLnN0ZXAoYW5pbWF0aW9uRGVwdGggKyAxKTtcbiAgICB9XG4gIH0sIHN0ZXBTcGVlZCk7XG59O1xuXG4vKipcbiAqIEdldHMgcmlkIG9mIGFsbCB0aGUgY2hpbGRyZW4gZnJvbSB0aGUgc3ZnIG9mIHRoZSBnaXZlbiBpZFxuICogQHBhcmFtIHtpZH0gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGNsZWFyU3ZnRXhwcmVzc2lvbihpZCkge1xuICB2YXIgZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgaWYgKCFnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgd2hpbGUgKGcubGFzdENoaWxkKSB7XG4gICAgZy5yZW1vdmVDaGlsZChnLmxhc3RDaGlsZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEcmF3cyBhIHVzZXIgZXhwcmVzc2lvbiBhbmQgZWFjaCBzdGVwIGNvbGxhcHNpbmcgaXQsIHVwIHRvIGdpdmVuIGRlcHRoLlxuICogQHJldHVybnMgVHJ1ZSBpZiBpdCBjb3VsZG4ndCBjb2xsYXBzZSBhbnkgZnVydGhlciBhdCB0aGlzIGRlcHRoLlxuICovXG5mdW5jdGlvbiBhbmltYXRlVXNlckV4cHJlc3Npb24gKG1heE51bVN0ZXBzKSB7XG4gIHZhciB1c2VyRXF1YXRpb24gPSBhcHBTdGF0ZS51c2VyU2V0LmNvbXB1dGVFcXVhdGlvbigpO1xuICBpZiAoIXVzZXJFcXVhdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVxdWlyZSB1c2VyIGV4cHJlc3Npb24nKTtcbiAgfVxuICB2YXIgdXNlckV4cHJlc3Npb24gPSB1c2VyRXF1YXRpb24uZXhwcmVzc2lvbjtcbiAgaWYgKCF1c2VyRXhwcmVzc2lvbikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgaWYgKGFwcFN0YXRlLnVzZXJTZXQuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSB8fFxuICAgIGFwcFN0YXRlLnRhcmdldFNldC5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucygpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYW5pbWF0ZSBpZiBlaXRoZXIgdXNlci90YXJnZXQgaGF2ZSBmdW5jdGlvbnMvdmFyc1wiKTtcbiAgfVxuXG4gIGNsZWFyU3ZnRXhwcmVzc2lvbigndXNlckV4cHJlc3Npb24nKTtcblxuICB2YXIgY3VycmVudCA9IHVzZXJFeHByZXNzaW9uLmNsb25lKCk7XG4gIHZhciBwcmV2aW91c0V4cHJlc3Npb24gPSBjdXJyZW50O1xuICB2YXIgbnVtQ29sbGFwc2VzID0gMDtcbiAgLy8gRWFjaCBzdGVwIGRyYXdzIGEgc2luZ2xlIGxpbmVcbiAgZm9yICh2YXIgY3VycmVudFN0ZXAgPSAwOyBjdXJyZW50U3RlcCA8PSBtYXhOdW1TdGVwcyAmJiAhZmluaXNoZWQ7IGN1cnJlbnRTdGVwKyspIHtcbiAgICB2YXIgdG9rZW5MaXN0O1xuICAgIGlmIChudW1Db2xsYXBzZXMgPT09IG1heE51bVN0ZXBzKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IGxpbmUgaW4gdGhlIGN1cnJlbnQgYW5pbWF0aW9uLCBoaWdobGlnaHQgd2hhdCBoYXNcbiAgICAgIC8vIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgbGluZVxuICAgICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGN1cnJlbnQsIHByZXZpb3VzRXhwcmVzc2lvbik7XG4gICAgfSBlbHNlIGlmIChudW1Db2xsYXBzZXMgKyAxID09PSBtYXhOdW1TdGVwcykge1xuICAgICAgLy8gVGhpcyBpcyB0aGUgc2Vjb25kIHRvIGxhc3QgbGluZS4gSGlnaGxpZ2h0IHRoZSBibG9jayBiZWluZyBjb2xsYXBzZWQsXG4gICAgICAvLyBhbmQgdGhlIGRlZXBlc3Qgb3BlcmF0aW9uICh0aGF0IHdpbGwgYmUgY29sbGFwc2VkIG9uIHRoZSBuZXh0IGxpbmUpXG4gICAgICB2YXIgZGVlcGVzdCA9IGN1cnJlbnQuZ2V0RGVlcGVzdE9wZXJhdGlvbigpO1xuICAgICAgaWYgKGRlZXBlc3QpIHtcbiAgICAgICAgc3R1ZGlvQXBwLmhpZ2hsaWdodCgnYmxvY2tfaWRfJyArIGRlZXBlc3QuYmxvY2tJZCk7XG4gICAgICB9XG4gICAgICB0b2tlbkxpc3QgPSBjb25zdHJ1Y3RUb2tlbkxpc3QoY3VycmVudCwgbnVsbCwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERvbid0IGhpZ2hsaWdodCBhbnl0aGluZ1xuICAgICAgdG9rZW5MaXN0ID0gY29uc3RydWN0VG9rZW5MaXN0KGN1cnJlbnQpO1xuICAgIH1cblxuICAgIC8vIEZvciBsaW5lcyBhZnRlciB0aGUgZmlyc3Qgb25lLCB3ZSB3YW50IHRoZW0gbGVmdCBhbGlnbmVkIGFuZCBwcmVjZWVkZWRcbiAgICAvLyBieSBhbiBlcXVhbHMgc2lnbi5cbiAgICB2YXIgbGVmdEFsaWduID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRTdGVwID4gMCkge1xuICAgICAgbGVmdEFsaWduID0gdHJ1ZTtcbiAgICAgIHRva2VuTGlzdCA9IGNvbnN0cnVjdFRva2VuTGlzdCgnPSAnKS5jb25jYXQodG9rZW5MaXN0KTtcbiAgICB9XG4gICAgZGlzcGxheUVxdWF0aW9uKCd1c2VyRXhwcmVzc2lvbicsIG51bGwsIHRva2VuTGlzdCwgbnVtQ29sbGFwc2VzLCAnbWFya2VkVG9rZW4nLCBsZWZ0QWxpZ24pO1xuICAgIHByZXZpb3VzRXhwcmVzc2lvbiA9IGN1cnJlbnQuY2xvbmUoKTtcbiAgICBpZiAoY3VycmVudC5pc0Rpdlplcm8oKSkge1xuICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY3VycmVudC5jb2xsYXBzZSgpKSB7XG4gICAgICBudW1Db2xsYXBzZXMrKztcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRTdGVwID09PSBudW1Db2xsYXBzZXMgKyAxKSB7XG4gICAgICAvLyBnbyBvbmUgcGFzdCBvdXIgbnVtIGNvbGxhcHNlcyBzbyB0aGF0IHRoZSBsYXN0IGxpbmUgZ2V0cyBoaWdobGlnaHRlZFxuICAgICAgLy8gb24gaXRzIG93blxuICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmaW5pc2hlZDtcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSB0b2tlbkxpc3QgdG8gdGhlIGdpdmVuIHBhcmVudCBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50SWQgSWQgb2YgcGFyZW50IGVsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIGZ1bmN0aW9uL3ZhcmlhYmxlLiBOdWxsIGlmIGJhc2UgZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gdG9rZW5MaXN0IEEgbGlzdCBvZiB0b2tlbnMsIHJlcHJlc2VudGluZyB0aGUgZXhwcmVzc2lvblxuICogQHBhcmFtIHtudW1iZXJ9IGxpbmUgSG93IG1hbnkgbGluZXMgZGVlcCBpbnRvIHBhcmVudCB0byBkaXNwbGF5XG4gKiBAcGFyYW0ge3N0cmluZ30gbWFya0NsYXNzIENzcyBjbGFzcyB0byB1c2UgZm9yICdtYXJrZWQnIHRva2Vucy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbGVmdEFsaWduIElmIHRydWUsIGVxdWF0aW9ucyBhcmUgbGVmdCBhbGlnbmVkIGluc3RlYWQgb2ZcbiAqICAgY2VudGVyZWQuXG4gKi9cbmZ1bmN0aW9uIGRpc3BsYXlFcXVhdGlvbihwYXJlbnRJZCwgbmFtZSwgdG9rZW5MaXN0LCBsaW5lLCBtYXJrQ2xhc3MsIGxlZnRBbGlnbikge1xuICB2YXIgcGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyZW50SWQpO1xuXG4gIHZhciBnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnZycpO1xuICBwYXJlbnQuYXBwZW5kQ2hpbGQoZyk7XG4gIHZhciB4UG9zID0gMDtcbiAgdmFyIGxlbjtcbiAgaWYgKG5hbWUpIHtcbiAgICBsZW4gPSBuZXcgVG9rZW4obmFtZSArICcgPSAnLCBmYWxzZSkucmVuZGVyVG9QYXJlbnQoZywgeFBvcywgbnVsbCk7XG4gICAgeFBvcyArPSBsZW47XG4gIH1cbiAgdmFyIGZpcnN0VG9rZW5MZW4gPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2VuTGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGxlbiA9IHRva2VuTGlzdFtpXS5yZW5kZXJUb1BhcmVudChnLCB4UG9zLCBtYXJrQ2xhc3MpO1xuICAgIGlmIChpID09PSAwKSB7XG4gICAgICBmaXJzdFRva2VuTGVuID0gbGVuO1xuICAgIH1cbiAgICB4UG9zICs9IGxlbjtcbiAgfVxuXG4gIHZhciB4UGFkZGluZztcbiAgaWYgKGxlZnRBbGlnbikge1xuICAgIC8vIEFsaWduIHNlY29uZCB0b2tlbiB3aXRoIHBhcmVudCAoYXNzdW1wdGlvbiBpcyB0aGF0IGZpcnN0IHRva2VuIGlzIG91clxuICAgIC8vIGVxdWFsIHNpZ24pLlxuICAgIHZhciB0cmFuc2Zvcm0gPSBCbG9ja2x5LmdldFJlbGF0aXZlWFkocGFyZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgIHhQYWRkaW5nID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0ueCkgLSBmaXJzdFRva2VuTGVuO1xuICB9IGVsc2Uge1xuICAgIHhQYWRkaW5nID0gKENBTlZBU19XSURUSCAtIGcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpIC8gMjtcbiAgfVxuICB2YXIgeVBvcyA9IChsaW5lICogTElORV9IRUlHSFQpO1xuICBnLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgeFBhZGRpbmcgKyAnLCAnICsgeVBvcyArICcpJyk7XG59XG5cbi8qKlxuICogRGVlcCBjbG9uZSBhIG5vZGUsIHRoZW4gcmVtb3ZpbmcgYW55IGlkcyBmcm9tIHRoZSBjbG9uZSBzbyB0aGF0IHdlIGRvbid0IGhhdmVcbiAqIGR1cGxpY2F0ZWQgaWRzLlxuICovXG5mdW5jdGlvbiBjbG9uZU5vZGVXaXRob3V0SWRzKGVsZW1lbnRJZCkge1xuICB2YXIgY2xvbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SWQpLmNsb25lTm9kZSh0cnVlKTtcbiAgY2xvbmUucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik7XG4gIHZhciBkZXNjZW5kYW50cyA9IGNsb25lLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkZXNjZW5kYW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbGVtZW50ID0gZGVzY2VuZGFudHNbaV07XG4gICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjbG9uZTtcbn1cblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbmZ1bmN0aW9uIGRpc3BsYXlGZWVkYmFjaygpIHtcbiAgaWYgKGFwcFN0YXRlLndhaXRpbmdGb3JSZXBvcnQgfHwgYXBwU3RhdGUuYW5pbWF0aW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gb3ZlcnJpZGUgZXh0cmEgdG9wIGJsb2NrcyBtZXNzYWdlXG4gIGxldmVsLmV4dHJhVG9wQmxvY2tzID0gY2FsY01zZy5leHRyYVRvcEJsb2NrcygpO1xuICB2YXIgYXBwRGl2ID0gbnVsbDtcbiAgLy8gU2hvdyBzdmcgaW4gZmVlZGJhY2sgZGlhbG9nXG4gIGlmICghaXNQcmVBbmltYXRpb25GYWlsdXJlKGFwcFN0YXRlLnRlc3RSZXN1bHRzKSkge1xuICAgIGFwcERpdiA9IGNsb25lTm9kZVdpdGhvdXRJZHMoJ3N2Z0NhbGMnKTtcbiAgICBhcHBEaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzdmdDYWxjRmVlZGJhY2snKTtcbiAgfVxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBhcHA6ICdjYWxjJyxcbiAgICBza2luOiBza2luLmlkLFxuICAgIHJlc3BvbnNlOiBhcHBTdGF0ZS5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgZmVlZGJhY2tUeXBlOiBhcHBTdGF0ZS50ZXN0UmVzdWx0cyxcbiAgICB0cnlBZ2FpblRleHQ6IGxldmVsLmZyZWVQbGF5ID8gY29tbW9uTXNnLmtlZXBQbGF5aW5nKCkgOiB1bmRlZmluZWQsXG4gICAgY29udGludWVUZXh0OiBsZXZlbC5mcmVlUGxheSA/IGNvbW1vbk1zZy5uZXh0UHV6emxlKCkgOiB1bmRlZmluZWQsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogY2FsY01zZy5yZWluZkZlZWRiYWNrTXNnKClcbiAgICB9LFxuICAgIGFwcERpdjogYXBwRGl2XG4gIH07XG4gIGlmIChhcHBTdGF0ZS5tZXNzYWdlICYmICFsZXZlbC5lZGl0X2Jsb2Nrcykge1xuICAgIG9wdGlvbnMubWVzc2FnZSA9IGFwcFN0YXRlLm1lc3NhZ2U7XG4gIH1cblxuICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5mdW5jdGlvbiBvblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKSB7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICBhcHBTdGF0ZS5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBhcHBTdGF0ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59XG5cbi8qIHN0YXJ0LXRlc3QtYmxvY2sgKi9cbi8vIGV4cG9ydCBwcml2YXRlIGZ1bmN0aW9uKHMpIHRvIGV4cG9zZSB0byB1bml0IHRlc3RpbmdcbkNhbGMuX190ZXN0b25seV9fID0ge1xuICBkaXNwbGF5R29hbDogZGlzcGxheUdvYWwsXG4gIGRpc3BsYXlDb21wbGV4VXNlckV4cHJlc3Npb25zOiBkaXNwbGF5Q29tcGxleFVzZXJFeHByZXNzaW9ucyxcbiAgYXBwU3RhdGU6IGFwcFN0YXRlXG59O1xuLyogZW5kLXRlc3QtYmxvY2sgKi9cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7IDsgYnVmLnB1c2goJ1xcblxcbjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cInN2Z0NhbGNcIj5cXG4gIDxpbWFnZSBpZD1cImJhY2tncm91bmRcIiBoZWlnaHQ9XCI0MDBcIiB3aWR0aD1cIjQwMFwiIHg9XCIwXCIgeT1cIjBcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4bGluazpocmVmPVwiL2Jsb2NrbHkvbWVkaWEvc2tpbnMvY2FsYy9iYWNrZ3JvdW5kLnBuZ1wiPjwvaW1hZ2U+XFxuICA8ZyBpZD1cInVzZXJFeHByZXNzaW9uXCIgY2xhc3M9XCJleHByXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDAsIDEwMClcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwiYW5zd2VyRXhwcmVzc2lvblwiIGNsYXNzPVwiZXhwclwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgwLCAzNTApXCI+XFxuICA8L2c+XFxuPC9zdmc+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgbGV2ZWwtc3BlY2lmaWMgcmVxdWlyZW1lbnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2V4YW1wbGUxJzoge1xuICAgIHNvbHV0aW9uQmxvY2tzOiBibG9ja1V0aWxzLmNhbGNCbG9ja1htbCgnZnVuY3Rpb25hbF90aW1lcycsIFtcbiAgICAgIGJsb2NrVXRpbHMuY2FsY0Jsb2NrWG1sKCdmdW5jdGlvbmFsX3BsdXMnLCBbMSwgMl0pLFxuICAgICAgYmxvY2tVdGlscy5jYWxjQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfcGx1cycsIFszLCA0XSlcbiAgICBdKSxcbiAgICBpZGVhbDogSW5maW5pdHksXG4gICAgdG9vbGJveDogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9wbHVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9taW51cycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfdGltZXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2RpdmlkZWRieScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInKSArXG4gICAgICAnPGJsb2NrIHR5cGU9XCJmdW5jdGlvbmFsX21hdGhfbnVtYmVyX2Ryb3Bkb3duXCI+JyArXG4gICAgICAnICA8dGl0bGUgbmFtZT1cIk5VTVwiIGNvbmZpZz1cIjAsMSwyLDMsNCw1LDYsNyw4LDksMTBcIj4/Pz88L3RpdGxlPicgK1xuICAgICAgJzwvYmxvY2s+J1xuICAgICAgKSxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgcmVxdWlyZWRCbG9ja3M6ICcnLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuXG4gICdjdXN0b20nOiB7XG4gICAgYW5zd2VyOiAnJyxcbiAgICBpZGVhbDogSW5maW5pdHksXG4gICAgdG9vbGJveDogJycsXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHJlcXVpcmVkQmxvY2tzOiAnJyxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfVxufTtcbiIsIi8qKlxuICogR2l2ZW4gYSBzZXQgb2YgdmFsdWVzIChpLmUuIFsxLDIsM10sIGFuZCBhIG51bWJlciBvZiBwYXJhbWV0ZXJzLCBnZW5lcmF0ZXNcbiAqIGFsbCBwb3NzaWJsZSBjb21iaW5hdGlvbnMgb2YgdmFsdWVzLlxuICovXG52YXIgSW5wdXRJdGVyYXRvciA9IGZ1bmN0aW9uICh2YWx1ZXMsIG51bVBhcmFtcykge1xuICB0aGlzLm51bVBhcmFtc18gPSBudW1QYXJhbXM7XG4gIHRoaXMucmVtYWluaW5nXyA9IE1hdGgucG93KHZhbHVlcy5sZW5ndGgsIG51bVBhcmFtcyk7XG4gIHRoaXMuYXZhaWxhYmxlVmFsdWVzXyA9IHZhbHVlcztcbiAgLy8gcmVwcmVzZW50cyB0aGUgaW5kZXggaW50byB2YWx1ZXMgZm9yIGVhY2ggcGFyYW0gZm9yIHRoZSBjdXJyZW50IHBlcm11dGF0aW9uXG4gIC8vIHNldCBvdXIgZmlyc3QgaW5kZXggdG8gLTEgc28gdGhhdCBpdCB3aWxsIGdldCBpbmNyZW1lbnRlZCB0byAwIG9uIHRoZSBmaXJzdFxuICAvLyBwYXNzXG4gIHRoaXMuaW5kaWNlc18gPSBbLTFdO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IG51bVBhcmFtczsgaSsrKSB7XG4gICAgdGhpcy5pbmRpY2VzX1tpXSA9IDA7XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IElucHV0SXRlcmF0b3I7XG5cbi8qKlxuICogR2V0IHRoZSBuZXh0IHNldCBvZiB2YWx1ZXMsIHRocm93aW5nIGlmIG5vbmUgcmVtYWluZ1xuICogQHJldHVybnMge251bWJlcltdfSBMaXN0IG9mIGxlbmd0aCBudW1QYXJhbXMgcmVwcmVzZW50aW5nIHRoZSBuZXh0IHNldCBvZlxuICogICBpbnB1dHMuXG4gKi9cbklucHV0SXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJlbWFpbmluZ18gPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2VtcHR5Jyk7XG4gIH1cblxuICB2YXIgd3JhcHBlZDtcbiAgdmFyIHBhcmFtTnVtID0gMDtcbiAgZG8ge1xuICAgIHdyYXBwZWQgPSBmYWxzZTtcbiAgICB0aGlzLmluZGljZXNfW3BhcmFtTnVtXSsrO1xuICAgIGlmICh0aGlzLmluZGljZXNfW3BhcmFtTnVtXSA9PT0gdGhpcy5hdmFpbGFibGVWYWx1ZXNfLmxlbmd0aCkge1xuICAgICAgdGhpcy5pbmRpY2VzX1twYXJhbU51bV0gPSAwO1xuICAgICAgcGFyYW1OdW0rKztcbiAgICAgIHdyYXBwZWQgPSB0cnVlO1xuICAgIH1cbiAgfSB3aGlsZSh3cmFwcGVkICYmIHBhcmFtTnVtIDwgdGhpcy5udW1QYXJhbXNfKTtcbiAgdGhpcy5yZW1haW5pbmdfLS07XG5cbiAgcmV0dXJuIHRoaXMuaW5kaWNlc18ubWFwKGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHJldHVybiB0aGlzLmF2YWlsYWJsZVZhbHVlc19baW5kZXhdO1xuICB9LCB0aGlzKTtcbn07XG5cbi8qKlxuICogQHJldHVybnMgSG93IG1hbnkgcGVybXV0YXRpb25zIGFyZSBsZWZ0XG4gKi9cbklucHV0SXRlcmF0b3IucHJvdG90eXBlLnJlbWFpbmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucmVtYWluaW5nXztcbn07XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuZ2V0TG9kYXNoKCk7XG52YXIgRXhwcmVzc2lvbk5vZGUgPSByZXF1aXJlKCcuL2V4cHJlc3Npb25Ob2RlJyk7XG52YXIgRXF1YXRpb24gPSByZXF1aXJlKCcuL2VxdWF0aW9uJyk7XG52YXIganNudW1zID0gcmVxdWlyZSgnLi9qcy1udW1iZXJzL2pzLW51bWJlcnMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQW4gRXF1YXRpb25TZXQgY29uc2lzdHMgb2YgYSB0b3AgbGV2ZWwgKGNvbXB1dGUpIGVxdWF0aW9uLCBhbmQgb3B0aW9uYWxseVxuICogc29tZSBudW1iZXIgb2Ygc3VwcG9ydCBlcXVhdGlvbnNcbiAqIEBwYXJhbSB7IUFycmF5fSBibG9ja3MgTGlzdCBvZiBibG9ja2x5IGJsb2Nrc1xuICovXG52YXIgRXF1YXRpb25TZXQgPSBmdW5jdGlvbiAoYmxvY2tzKSB7XG4gIHRoaXMuY29tcHV0ZV8gPSBudWxsOyAvLyBhbiBFcXVhdGlvblxuICB0aGlzLmVxdWF0aW9uc18gPSBbXTsgLy8gYSBsaXN0IG9mIEVxdWF0aW9uc1xuXG4gIGlmIChibG9ja3MpIHtcbiAgICBibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgIHZhciBlcXVhdGlvbiA9IEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGJsb2NrKTtcbiAgICAgIGlmIChlcXVhdGlvbikge1xuICAgICAgICB0aGlzLmFkZEVxdWF0aW9uXyhlcXVhdGlvbik7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IEVxdWF0aW9uU2V0O1xuXG5FcXVhdGlvblNldC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjbG9uZSA9IG5ldyBFcXVhdGlvblNldCgpO1xuICBjbG9uZS5jb21wdXRlXyA9IG51bGw7XG4gIGlmICh0aGlzLmNvbXB1dGVfKSB7XG4gICAgY2xvbmUuY29tcHV0ZV8gPSB0aGlzLmNvbXB1dGVfLmNsb25lKCk7XG4gIH1cbiAgY2xvbmUuZXF1YXRpb25zXyA9IHRoaXMuZXF1YXRpb25zXy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICB9KTtcbiAgcmV0dXJuIGNsb25lO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGVxdWF0aW9uIHRvIG91ciBzZXQuIElmIGVxdWF0aW9uJ3MgbmFtZSBpcyBudWxsLCBzZXRzIGl0IGFzIHRoZVxuICogY29tcHV0ZSBlcXVhdGlvbi4gVGhyb3dzIGlmIGVxdWF0aW9uIG9mIHRoaXMgbmFtZSBhbHJlYWR5IGV4aXN0cy5cbiAqIEBwYXJhbSB7RXF1YXRpb259IGVxdWF0aW9uIFRoZSBlcXVhdGlvbiB0byBhZGQuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5hZGRFcXVhdGlvbl8gPSBmdW5jdGlvbiAoZXF1YXRpb24pIHtcbiAgaWYgKCFlcXVhdGlvbi5uYW1lKSB7XG4gICAgaWYgKHRoaXMuY29tcHV0ZV8pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29tcHV0ZSBleHByZXNzaW9uIGFscmVhZHkgZXhpc3RzJyk7XG4gICAgfVxuICAgIHRoaXMuY29tcHV0ZV8gPSBlcXVhdGlvbjtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy5nZXRFcXVhdGlvbihlcXVhdGlvbi5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdlcXVhdGlvbiBhbHJlYWR5IGV4aXN0czogJyArIGVxdWF0aW9uLm5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmVxdWF0aW9uc18ucHVzaChlcXVhdGlvbik7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IGFuIGVxdWF0aW9uIGJ5IG5hbWUsIG9yIGNvbXB1dGUgZXF1YXRpb24gaWYgbmFtZSBpcyBudWxsXG4gKiBAcmV0dXJucyB7RXF1YXRpb259IEVxdWF0aW9uIG9mIHRoYXQgbmFtZSBpZiBpdCBleGlzdHMsIG51bGwgb3RoZXJ3aXNlLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuZ2V0RXF1YXRpb24gPSBmdW5jdGlvbiAobmFtZSkge1xuICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLmNvbXB1dGVFcXVhdGlvbigpO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lcXVhdGlvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRoaXMuZXF1YXRpb25zX1tpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5lcXVhdGlvbnNfW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQHJldHVybnMgdGhlIGNvbXB1dGUgZXF1YXRpb24gaWYgdGhlcmUgaXMgb25lXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5jb21wdXRlRXF1YXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmNvbXB1dGVfO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB0cnVlIGlmIEVxdWF0aW9uU2V0IGhhcyBhdCBsZWFzdCBvbmUgdmFyaWFibGUgb3IgZnVuY3Rpb24uXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5oYXNWYXJpYWJsZXNPckZ1bmN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZXF1YXRpb25zXy5sZW5ndGggPiAwO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBvdXIgY29tcHV0ZSBleHByZXNzaW9uIGlzIGpzdXQgYSBmdW5jaXRvbiBjYWxsXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5jb21wdXRlc0Z1bmN0aW9uQ2FsbCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNvbXB1dGVFeHByZXNzaW9uID0gdGhpcy5jb21wdXRlXy5leHByZXNzaW9uO1xuICByZXR1cm4gY29tcHV0ZUV4cHJlc3Npb24uaXNGdW5jdGlvbkNhbGwoKTtcbn07XG5cblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBvdXIgY29tcHV0ZSBleHByZXNzaW9uIGlzIGp1c3QgYSB2YXJpYWJsZSwgd2hpY2hcbiAqIHdlIHRha2UgdG8gbWVhbiB3ZSBjYW4gdHJlYXQgc2ltaWxhcmx5IHRvIG91ciBzaW5nbGUgZnVuY3Rpb24gc2NlbmFyaW9cbiAqL1xuRXF1YXRpb25TZXQucHJvdG90eXBlLmNvbXB1dGVzU2luZ2xlVmFyaWFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wdXRlXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgY29tcHV0ZUV4cHJlc3Npb24gPSB0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb247XG4gIHJldHVybiBjb21wdXRlRXhwcmVzc2lvbi5pc1ZhcmlhYmxlKCk7XG59O1xuXG4vKipcbiAqIEV4YW1wbGUgc2V0IHRoYXQgcmV0dXJucyB0cnVlOlxuICogQWdlID0gMTJcbiAqIGNvbXB1dGU6IEFnZVxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgb3VyIEVxdWF0aW9uU2V0IGNvbnNpc3RzIG9mIGEgdmFyaWFibGUgc2V0IHRvXG4gKiAgIGEgbnVtYmVyLCBhbmQgdGhlIGNvbXB1dGF0aW9uIG9mIHRoYXQgdmFyaWFibGUuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5jb21wdXRlc1NpbmdsZUNvbnN0YW50ID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY29tcHV0ZV8gfHwgdGhpcy5lcXVhdGlvbnNfLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgZXF1YXRpb24gPSB0aGlzLmVxdWF0aW9uc19bMF07XG4gIHZhciBjb21wdXRlRXhwcmVzc2lvbiA9IHRoaXMuY29tcHV0ZV8uZXhwcmVzc2lvbjtcbiAgcmV0dXJuIGNvbXB1dGVFeHByZXNzaW9uLmlzVmFyaWFibGUoKSAmJiBlcXVhdGlvbi5leHByZXNzaW9uLmlzTnVtYmVyKCkgJiZcbiAgICBjb21wdXRlRXhwcmVzc2lvbi5nZXRWYWx1ZSgpID09PSBlcXVhdGlvbi5uYW1lO1xuXG59O1xuXG5FcXVhdGlvblNldC5wcm90b3R5cGUuaXNBbmltYXRhYmxlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY29tcHV0ZV8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHRoaXMuaGFzVmFyaWFibGVzT3JGdW5jdGlvbnMoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodGhpcy5jb21wdXRlXy5leHByZXNzaW9uLmRlcHRoKCkgPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgZXF1YXRpb25zIHRoYXQgY29uc2lzdCBvZiBzZXR0aW5nIGEgdmFyaWFibGUgdG8gYSBjb25zdGFudFxuICogdmFsdWUsIHdpdGhvdXQgZG9pbmcgYW55IGFkZGl0aW9uYWwgbWF0aC4gaS5lLiBmb28gPSAxXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5nZXRDb25zdGFudHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmVxdWF0aW9uc18uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0ucGFyYW1zLmxlbmd0aCA9PT0gMCAmJiBpdGVtLmV4cHJlc3Npb24uaXNOdW1iZXIoKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEFyZSB0d28gRXF1YXRpb25TZXRzIGlkZW50aWNhbD8gVGhpcyBpcyBjb25zaWRlcmVkIHRvIGJlIHRydWUgaWYgdGhlaXJcbiAqIGNvbXB1dGUgZXhwcmVzc2lvbnMgYXJlIGlkZW50aWNhbCBhbmQgYWxsIG9mIHRoZWlyIGVxdWF0aW9ucyBoYXZlIHRoZSBzYW1lXG4gKiBuYW1lcyBhbmQgaWRlbnRpY2FsIGV4cHJlc3Npb25zLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuaXNJZGVudGljYWxUbyA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICBpZiAodGhpcy5lcXVhdGlvbnNfLmxlbmd0aCAhPT0gb3RoZXJTZXQuZXF1YXRpb25zXy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgb3RoZXJDb21wdXRlID0gb3RoZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbjtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb24uaXNJZGVudGljYWxUbyhvdGhlckNvbXB1dGUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdGhpc0VxdWF0aW9uID0gdGhpcy5lcXVhdGlvbnNfW2ldO1xuICAgIHZhciBvdGhlckVxdWF0aW9uID0gb3RoZXJTZXQuZ2V0RXF1YXRpb24odGhpc0VxdWF0aW9uLm5hbWUpO1xuICAgIGlmICghb3RoZXJFcXVhdGlvbiB8fFxuICAgICAgICAhdGhpc0VxdWF0aW9uLmV4cHJlc3Npb24uaXNJZGVudGljYWxUbyhvdGhlckVxdWF0aW9uLmV4cHJlc3Npb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEFyZSB0d28gRXF1YXRpb25TZXRzIGVxdWl2YWxlbnQ/IFRoaXMgaXMgY29uc2lkZXJlZCB0byBiZSB0cnVlIGlmIHRoZWlyXG4gKiBjb21wdXRlIGV4cHJlc3Npb24gYXJlIGVxdWl2YWxlbnQgYW5kIGFsbCBvZiB0aGVpciBlcXVhdGlvbnMgaGF2ZSB0aGUgc2FtZVxuICogbmFtZXMgYW5kIGVxdWl2YWxlbnQgZXhwcmVzc2lvbnMuIEVxdWl2YWxlbmNlIGlzIGEgbGVzcyBzdHJpY3QgcmVxdWlyZW1lbnRcbiAqIHRoYW4gaWRlbnRpY2FsIHRoYXQgYWxsb3dzIHBhcmFtcyB0byBiZSByZW9yZGVyZWQuXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5pc0VxdWl2YWxlbnRUbyA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICBpZiAodGhpcy5lcXVhdGlvbnNfLmxlbmd0aCAhPT0gb3RoZXJTZXQuZXF1YXRpb25zXy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgb3RoZXJDb21wdXRlID0gb3RoZXJTZXQuY29tcHV0ZUVxdWF0aW9uKCkuZXhwcmVzc2lvbjtcbiAgaWYgKCF0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb24uaXNFcXVpdmFsZW50VG8ob3RoZXJDb21wdXRlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lcXVhdGlvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRoaXNFcXVhdGlvbiA9IHRoaXMuZXF1YXRpb25zX1tpXTtcbiAgICB2YXIgb3RoZXJFcXVhdGlvbiA9IG90aGVyU2V0LmdldEVxdWF0aW9uKHRoaXNFcXVhdGlvbi5uYW1lKTtcbiAgICBpZiAoIW90aGVyRXF1YXRpb24gfHxcbiAgICAgICAgIXRoaXNFcXVhdGlvbi5leHByZXNzaW9uLmlzRXF1aXZhbGVudFRvKG90aGVyRXF1YXRpb24uZXhwcmVzc2lvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG5vbi1jb21wdXRlIGVxdWF0aW9ucyAodmFycy9mdW5jdGlvbnMpIHNvcnRlZCBieSBuYW1lLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuc29ydGVkRXF1YXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAvLyBub3RlOiB0aGlzIGhhcyBzaWRlIGVmZmVjdHMsIGFzIGl0IHJlb3JkZXJzIGVxdWF0aW9ucy4gd2UgY291bGQgYWxzb1xuICAvLyBlbnN1cmUgdGhpcyB3YXMgZG9uZSBvbmx5IG9uY2UgaWYgd2UgaGFkIHBlcmZvcm1hbmNlIGNvbmNlcm5zXG4gIHRoaXMuZXF1YXRpb25zXy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzLmVxdWF0aW9uc187XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGV2YWx1YXRpbmcgb3VyIEVxdWF0aW9uU2V0IHdvdWxkIHJlc3VsdCBpblxuICogICBkaXZpZGluZyBieSB6ZXJvLlxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuaGFzRGl2WmVybyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV2YWx1YXRpb24gPSB0aGlzLmV2YWx1YXRlKCk7XG4gIHJldHVybiBldmFsdWF0aW9uLmVyciAmJlxuICAgIGV2YWx1YXRpb24uZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3I7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSBFcXVhdGlvblNldCdzIGNvbXB1dGUgZXhwcmVzc2lvbiBpbiB0aGUgY29udGV4dCBvZiBpdHMgZXF1YXRpb25zXG4gKi9cbkVxdWF0aW9uU2V0LnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbih0aGlzLmNvbXB1dGVfLmV4cHJlc3Npb24pO1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgZ2l2ZW4gY29tcHV0ZSBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIHRoZSBFcXVhdGlvblNldCdzXG4gKiBlcXVhdGlvbnMuIEZvciBleGFtcGxlLCBvdXIgZXF1YXRpb24gc2V0IG1pZ2h0IGRlZmluZSBmKHgpID0geCArIDEsIGFuZCB0aGlzXG4gKiBhbGxvd3MgdXMgdG8gZXZhbHVhdGUgdGhlIGV4cHJlc3Npb24gZigxKSBvciBmKDIpLi4uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfSBjb21wdXRlRXhwcmVzc2lvbiBUaGUgZXhwcmVzc2lvbiB0byBldmFsdWF0ZVxuICogQHJldHVybnMge09iamVjdH0gZXZhbHVhdGlvbiBBbiBvYmplY3Qgd2l0aCBlaXRoZXIgYW4gZXJyIG9yIHJlc3VsdCBmaWVsZFxuICogQHJldHVybnMge0Vycm9yP30gZXZhbHVhdGlvbi5lcnJcbiAqIEByZXR1cm5zIHtOdW1iZXI/fSBldmFsdWF0aW9uLnJlc3VsdFxuICovXG5FcXVhdGlvblNldC5wcm90b3R5cGUuZXZhbHVhdGVXaXRoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChjb21wdXRlRXhwcmVzc2lvbikge1xuICAvLyBubyB2YXJpYWJsZXMvZnVuY3Rpb25zLiB0aGlzIGlzIGVhc3lcbiAgaWYgKHRoaXMuZXF1YXRpb25zXy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY29tcHV0ZUV4cHJlc3Npb24uZXZhbHVhdGUoKTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBvdXIgZXF1YXRpb25zIHRvIGdlbmVyYXRlIG91ciBtYXBwaW5nLiBXZSBtYXkgbmVlZCB0byBkb1xuICAvLyB0aGlzIGEgZmV3IHRpbWVzLiBTdG9wIHRyeWluZyBhcyBzb29uIGFzIHdlIGRvIGEgZnVsbCBpdGVyYXRpb24gd2l0aG91dFxuICAvLyBhZGRpbmcgYW55dGhpbmcgbmV3IHRvIG91ciBtYXBwaW5nLlxuICB2YXIgbWFwcGluZyA9IHt9O1xuICB2YXIgbWFkZVByb2dyZXNzO1xuICB2YXIgdGVzdE1hcHBpbmc7XG4gIHZhciBldmFsdWF0aW9uO1xuICB2YXIgc2V0VGVzdE1hcHBpbmdUb09uZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdGVzdE1hcHBpbmdbaXRlbV0gPSBqc251bXMubWFrZUZsb2F0KDEpO1xuICB9O1xuICBkbyB7XG4gICAgbWFkZVByb2dyZXNzID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVxdWF0aW9uc18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlcXVhdGlvbiA9IHRoaXMuZXF1YXRpb25zX1tpXTtcbiAgICAgIGlmIChlcXVhdGlvbi5pc0Z1bmN0aW9uKCkpIHtcbiAgICAgICAgaWYgKG1hcHBpbmdbZXF1YXRpb24ubmFtZV0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZWUgaWYgd2UgY2FuIG1hcCBpZiB3ZSByZXBsYWNlIG91ciBwYXJhbXNcbiAgICAgICAgLy8gbm90ZSB0aGF0IHBhcmFtcyBvdmVycmlkZSBleGlzdGluZyB2YXJzIGluIG91ciB0ZXN0TWFwcGluZ1xuICAgICAgICB0ZXN0TWFwcGluZyA9IF8uY2xvbmUobWFwcGluZyk7XG4gICAgICAgIHRlc3RNYXBwaW5nW2VxdWF0aW9uLm5hbWVdID0ge1xuICAgICAgICAgIHZhcmlhYmxlczogZXF1YXRpb24ucGFyYW1zLFxuICAgICAgICAgIGV4cHJlc3Npb246IGVxdWF0aW9uLmV4cHJlc3Npb25cbiAgICAgICAgfTtcbiAgICAgICAgZXF1YXRpb24ucGFyYW1zLmZvckVhY2goc2V0VGVzdE1hcHBpbmdUb09uZSk7XG4gICAgICAgIGV2YWx1YXRpb24gPSBlcXVhdGlvbi5leHByZXNzaW9uLmV2YWx1YXRlKHRlc3RNYXBwaW5nKTtcbiAgICAgICAgaWYgKGV2YWx1YXRpb24uZXJyKSB7XG4gICAgICAgICAgaWYgKGV2YWx1YXRpb24uZXJyIGluc3RhbmNlb2YgRXhwcmVzc2lvbk5vZGUuRGl2aWRlQnlaZXJvRXJyb3IgfHxcbiAgICAgICAgICAgICAgdXRpbHMuaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yKGV2YWx1YXRpb24uZXJyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgZXJyOiBldmFsdWF0aW9uLmVyciB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIGhhdmUgYSB2YWxpZCBtYXBwaW5nXG4gICAgICAgIG1hZGVQcm9ncmVzcyA9IHRydWU7XG4gICAgICAgIG1hcHBpbmdbZXF1YXRpb24ubmFtZV0gPSB7XG4gICAgICAgICAgdmFyaWFibGVzOiBlcXVhdGlvbi5wYXJhbXMsXG4gICAgICAgICAgZXhwcmVzc2lvbjogZXF1YXRpb24uZXhwcmVzc2lvblxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChtYXBwaW5nW2VxdWF0aW9uLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZXZhbHVhdGlvbiA9IGVxdWF0aW9uLmV4cHJlc3Npb24uZXZhbHVhdGUobWFwcGluZyk7XG4gICAgICAgIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgICAgICAgIGlmIChldmFsdWF0aW9uLmVyciBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4geyBlcnI6IGV2YWx1YXRpb24uZXJyIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHdlIGhhdmUgYSB2YXJpYWJsZSB0aGF0IGhhc24ndCB5ZXQgYmVlbiBtYXBwZWQgYW5kIGNhbiBiZVxuICAgICAgICAgIG1hZGVQcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgbWFwcGluZ1tlcXVhdGlvbi5uYW1lXSA9IGV2YWx1YXRpb24ucmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH0gd2hpbGUgKG1hZGVQcm9ncmVzcyk7XG5cbiAgcmV0dXJuIGNvbXB1dGVFeHByZXNzaW9uLmV2YWx1YXRlKG1hcHBpbmcpO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIEJsb2NrbHkgYmxvY2ssIGdlbmVyYXRlcyBhbiBFcXVhdGlvbi5cbiAqL1xuRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2sgPSBmdW5jdGlvbiAoYmxvY2spIHtcbiAgdmFyIG5hbWU7XG4gIGlmICghYmxvY2spIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgZmlyc3RDaGlsZCA9IGJsb2NrLmdldENoaWxkcmVuKClbMF07XG4gIHN3aXRjaCAoYmxvY2sudHlwZSkge1xuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfY29tcHV0ZSc6XG4gICAgICBpZiAoIWZpcnN0Q2hpbGQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSwgbnVsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soZmlyc3RDaGlsZCk7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX3BsdXMnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfbWludXMnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfdGltZXMnOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfZGl2aWRlZGJ5JzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX3Bvdyc6XG4gICAgY2FzZSAnZnVuY3Rpb25hbF9zcXJ0JzpcbiAgICBjYXNlICdmdW5jdGlvbmFsX3NxdWFyZWQnOlxuICAgICAgdmFyIG9wZXJhdGlvbiA9IGJsb2NrLmdldFRpdGxlcygpWzBdLmdldFZhbHVlKCk7XG4gICAgICAvLyBzb21lIG9mIHRoZXNlIGhhdmUgMSBhcmcsIG90aGVycyAyXG4gICAgICB2YXIgYXJnTmFtZXMgPSBbJ0FSRzEnXTtcbiAgICAgIGlmIChibG9jay5nZXRJbnB1dCgnQVJHMicpKSB7XG4gICAgICAgIGFyZ05hbWVzLnB1c2goJ0FSRzInKTtcbiAgICAgIH1cbiAgICAgIHZhciBhcmdzID0gYXJnTmFtZXMubWFwKGZ1bmN0aW9uKGlucHV0TmFtZSkge1xuICAgICAgICB2YXIgYXJnQmxvY2sgPSBibG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKGlucHV0TmFtZSk7XG4gICAgICAgIGlmICghYXJnQmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soYXJnQmxvY2spLmV4cHJlc3Npb247XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSwgbmV3IEV4cHJlc3Npb25Ob2RlKG9wZXJhdGlvbiwgYXJncywgYmxvY2suaWQpKTtcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInOlxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXJfZHJvcGRvd24nOlxuICAgICAgdmFyIHZhbCA9IGJsb2NrLmdldFRpdGxlVmFsdWUoJ05VTScpIHx8IDA7XG4gICAgICBpZiAodmFsID09PSAnPz8/Jykge1xuICAgICAgICB2YWwgPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSxcbiAgICAgICAgbmV3IEV4cHJlc3Npb25Ob2RlKHBhcnNlRmxvYXQodmFsKSwgW10sIGJsb2NrLmlkKSk7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX2NhbGwnOlxuICAgICAgbmFtZSA9IGJsb2NrLmdldENhbGxOYW1lKCk7XG4gICAgICB2YXIgZGVmID0gQmxvY2tseS5Qcm9jZWR1cmVzLmdldERlZmluaXRpb24obmFtZSwgQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgICBpZiAoZGVmLmlzVmFyaWFibGUoKSkge1xuICAgICAgICByZXR1cm4gbmV3IEVxdWF0aW9uKG51bGwsIFtdLCBuZXcgRXhwcmVzc2lvbk5vZGUobmFtZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgICB2YXIgaW5wdXQsIGNoaWxkQmxvY2s7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyAhIShpbnB1dCA9IGJsb2NrLmdldElucHV0KCdBUkcnICsgaSkpOyBpKyspIHtcbiAgICAgICAgICBjaGlsZEJsb2NrID0gaW5wdXQuY29ubmVjdGlvbi50YXJnZXRCbG9jaygpO1xuICAgICAgICAgIHZhbHVlcy5wdXNoKGNoaWxkQmxvY2sgP1xuICAgICAgICAgICAgRXF1YXRpb25TZXQuZ2V0RXF1YXRpb25Gcm9tQmxvY2soY2hpbGRCbG9jaykuZXhwcmVzc2lvbiA6XG4gICAgICAgICAgICBuZXcgRXhwcmVzc2lvbk5vZGUoMCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obnVsbCwgW10sIG5ldyBFeHByZXNzaW9uTm9kZShuYW1lLCB2YWx1ZXMpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnZnVuY3Rpb25hbF9kZWZpbml0aW9uJzpcbiAgICAgIG5hbWUgPSBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJyk7XG5cbiAgICAgIHZhciBleHByZXNzaW9uID0gZmlyc3RDaGlsZCA/XG4gICAgICAgIEVxdWF0aW9uU2V0LmdldEVxdWF0aW9uRnJvbUJsb2NrKGZpcnN0Q2hpbGQpLmV4cHJlc3Npb24gOlxuICAgICAgICBuZXcgRXhwcmVzc2lvbk5vZGUoMCk7XG5cbiAgICAgIHJldHVybiBuZXcgRXF1YXRpb24obmFtZSwgYmxvY2suZ2V0VmFycygpLCBleHByZXNzaW9uKTtcblxuICAgIGNhc2UgJ2Z1bmN0aW9uYWxfcGFyYW1ldGVyc19nZXQnOlxuICAgICAgcmV0dXJuIG5ldyBFcXVhdGlvbihudWxsLCBbXSwgbmV3IEV4cHJlc3Npb25Ob2RlKGJsb2NrLmdldFRpdGxlVmFsdWUoJ1ZBUicpKSk7XG5cbiAgICBjYXNlICdmdW5jdGlvbmFsX2V4YW1wbGUnOlxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgXCJVbmtub3duIGJsb2NrIHR5cGU6IFwiICsgYmxvY2sudHlwZTtcbiAgfVxufTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIFRva2VuID0gcmVxdWlyZSgnLi90b2tlbicpO1xudmFyIGpzbnVtcyA9IHJlcXVpcmUoJy4vanMtbnVtYmVycy9qcy1udW1iZXJzJyk7XG5cbnZhciBWYWx1ZVR5cGUgPSB7XG4gIEFSSVRITUVUSUM6IDEsXG4gIEZVTkNUSU9OX0NBTEw6IDIsXG4gIFZBUklBQkxFOiAzLFxuICBOVU1CRVI6IDQsXG4gIEVYUE9ORU5USUFMOiA1XG59O1xuXG5mdW5jdGlvbiBEaXZpZGVCeVplcm9FcnJvcihtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgJyc7XG59XG5cbi8qKlxuICogQ29udmVydHMgbnVtYmVycyB0byBqc251bWJlciByZXByZXNlbnRhdGlvbnMuIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugc29tZVxuICoganNudW1iZXIgbWV0aG9kcyB3aWxsIHJldHVybiBhIG51bWJlciBvciBqc251bWJlciBkZXBlbmRpbmcgb24gdGhlaXIgdmFsdWVzLFxuICogZm9yIGV4YW1wbGU6XG4gKiBqc251bXMuc3FydChqc251bXMubWFrZUZsb2F0KDQpLnRvRXhhY3QoKSkgPSA0XG4gKiBqc251bXMuc3FydChqc251bXMubWFrZUZsb2F0KDUpLnRvRXhhY3QoKSkgPSBqc251bWJlclxuICogQHBhcmFtIHtudW1iZXJ8anNudW1iZXJ9IHZhbFxuICogQHJldHVybnMge2pzbnVtYmVyfVxuICovXG5mdW5jdGlvbiBlbnN1cmVKc251bSh2YWwpIHtcbiAgaWYgKHR5cGVvZih2YWwpID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBqc251bXMubWFrZUZsb2F0KHZhbCk7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiBBIG5vZGUgY29uc2lzdGluZyBvZiBhbiB2YWx1ZSwgYW5kIHBvdGVudGlhbGx5IGEgc2V0IG9mIG9wZXJhbmRzLlxuICogVGhlIHZhbHVlIHdpbGwgYmUgZWl0aGVyIGFuIG9wZXJhdG9yLCBhIHN0cmluZyByZXByZXNlbnRpbmcgYSB2YXJpYWJsZSwgYVxuICogc3RyaW5nIHJlcHJlc2VudGluZyBhIGZ1bmN0aW9uYWwgY2FsbCwgb3IgYSBudW1iZXIuXG4gKiBJZiBhcmdzIGFyZSBub3QgRXhwcmVzc2lvbk5vZGUsIHdlIGNvbnZlcnQgdGhlbSB0byBiZSBzbywgYXNzdW1pbmcgYW55IHN0cmluZ1xuICogcmVwcmVzZW50cyBhIHZhcmlhYmxlXG4gKi9cbnZhciBFeHByZXNzaW9uTm9kZSA9IGZ1bmN0aW9uICh2YWwsIGFyZ3MsIGJsb2NrSWQpIHtcbiAgdGhpcy52YWx1ZV8gPSBlbnN1cmVKc251bSh2YWwpO1xuXG4gIHRoaXMuYmxvY2tJZF8gPSBibG9ja0lkO1xuICBpZiAoYXJncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncyA9IFtdO1xuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgYXJyYXlcIik7XG4gIH1cblxuICB0aGlzLmNoaWxkcmVuXyA9IGFyZ3MubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEV4cHJlc3Npb25Ob2RlKSkge1xuICAgICAgaXRlbSA9IG5ldyBFeHByZXNzaW9uTm9kZShpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG4gIH0pO1xuXG4gIGlmICh0aGlzLmlzTnVtYmVyKCkgJiYgYXJncy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgaGF2ZSBhcmdzIGZvciBudW1iZXIgRXhwcmVzc2lvbk5vZGVcIik7XG4gIH1cblxuICBpZiAodGhpcy5pc0FyaXRobWV0aWMoKSAmJiBhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFyaXRobWV0aWMgRXhwcmVzc2lvbk5vZGUgbmVlZHMgMiBhcmdzXCIpO1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFeHByZXNzaW9uTm9kZTtcbkV4cHJlc3Npb25Ob2RlLkRpdmlkZUJ5WmVyb0Vycm9yID0gRGl2aWRlQnlaZXJvRXJyb3I7XG5cbi8qKlxuICogV2hhdCB0eXBlIG9mIGV4cHJlc3Npb24gbm9kZSBpcyB0aGlzP1xuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0VHlwZV8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChbXCIrXCIsIFwiLVwiLCBcIipcIiwgXCIvXCJdLmluZGV4T2YodGhpcy52YWx1ZV8pICE9PSAtMSkge1xuICAgIHJldHVybiBWYWx1ZVR5cGUuQVJJVEhNRVRJQztcbiAgfVxuXG4gIGlmIChbXCJwb3dcIiwgXCJzcXJ0XCIsIFwic3FyXCJdLmluZGV4T2YodGhpcy52YWx1ZV8pICE9PSAtMSkge1xuICAgIHJldHVybiBWYWx1ZVR5cGUuRVhQT05FTlRJQUw7XG4gIH1cblxuICBpZiAodHlwZW9mKHRoaXMudmFsdWVfKSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gVmFsdWVUeXBlLlZBUklBQkxFO1xuICAgIH1cbiAgICByZXR1cm4gVmFsdWVUeXBlLkZVTkNUSU9OX0NBTEw7XG4gIH1cblxuICBpZiAoanNudW1zLmlzU2NoZW1lTnVtYmVyKHRoaXMudmFsdWVfKSkge1xuICAgIHJldHVybiBWYWx1ZVR5cGUuTlVNQkVSO1xuICB9XG59O1xuXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNBcml0aG1ldGljID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRUeXBlXygpID09PSBWYWx1ZVR5cGUuQVJJVEhNRVRJQztcbn07XG5cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0Z1bmN0aW9uQ2FsbCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0VHlwZV8oKSA9PT0gVmFsdWVUeXBlLkZVTkNUSU9OX0NBTEw7XG59O1xuXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNWYXJpYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0VHlwZV8oKSA9PT0gVmFsdWVUeXBlLlZBUklBQkxFO1xufTtcblxuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzTnVtYmVyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5nZXRUeXBlXygpID09PSBWYWx1ZVR5cGUuTlVNQkVSO1xufTtcblxuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmlzRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmdldFR5cGVfKCkgPT09IFZhbHVlVHlwZS5FWFBPTkVOVElBTDtcbn07XG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHJvb3QgZXhwcmVzc2lvbiBub2RlIGlzIGEgZGl2aWRlIGJ5IHplcm8uIERvZXNcbiAqICAgbm90IGFjY291bnQgZm9yIGRpdiB6ZXJvcyBpbiBkZXNjZW5kYW50c1xuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNEaXZaZXJvID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmlnaHRDaGlsZCA9IHRoaXMuZ2V0Q2hpbGRWYWx1ZSgxKTtcbiAgcmV0dXJuIHRoaXMuZ2V0VmFsdWUoKSA9PT0gJy8nICYmIGpzbnVtcy5pc1NjaGVtZU51bWJlcihyaWdodENoaWxkKSAmJlxuICAgIGpzbnVtcy5lcXVhbHMocmlnaHRDaGlsZCwgMCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIGRlZXAgY2xvbmUgb2YgdGhpcyBub2RlXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbl8ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgfSk7XG4gIHJldHVybiBuZXcgRXhwcmVzc2lvbk5vZGUodGhpcy52YWx1ZV8sIGNoaWxkcmVuLCB0aGlzLmJsb2NrSWRfKTtcbn07XG5cbi8qKlxuICogRXZhbHVhdGUgdGhlIGV4cHJlc3Npb24sIHJldHVybmluZyB0aGUgcmVzdWx0LlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCBudW1iZXJ8b2JqZWN0Pn0gZ2xvYmFsTWFwcGluZyBHbG9iYWwgbWFwcGluZyBvZlxuICogICB2YXJpYWJsZXMgYW5kIGZ1bmN0aW9uc1xuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCBudW1iZXJ8b2JqZWN0Pn0gbG9jYWxNYXBwaW5nIE1hcHBpbmcgb2ZcbiAqICAgdmFyaWFibGVzL2Z1bmN0aW9ucyBsb2NhbCB0byBzY29wZSBvZiB0aGlzIGZ1bmN0aW9uLlxuICogQHJldHVybnMge09iamVjdH0gZXZhbHVhdGlvbiBBbiBvYmplY3Qgd2l0aCBlaXRoZXIgYW4gZXJyIG9yIHJlc3VsdCBmaWVsZFxuICogQHJldHVybnMge0Vycm9yP30gZXZhbGF0dWlvbi5lcnJcbiAqIEByZXR1cm5zIHtqc251bWJlcj99IGV2YWx1YXRpb24ucmVzdWx0XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uIChnbG9iYWxNYXBwaW5nLCBsb2NhbE1hcHBpbmcpIHtcbiAgdmFyIGVycm9yO1xuICB0cnkge1xuICAgIGdsb2JhbE1hcHBpbmcgPSBnbG9iYWxNYXBwaW5nIHx8IHt9O1xuICAgIGxvY2FsTWFwcGluZyA9IGxvY2FsTWFwcGluZyB8fCB7fTtcblxuICAgIHZhciB0eXBlID0gdGhpcy5nZXRUeXBlXygpO1xuICAgIC8vIEB0eXBlIHtudW1iZXJ8anNudW1iZXJ9XG4gICAgdmFyIHZhbDtcblxuICAgIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuVkFSSUFCTEUpIHtcbiAgICAgIHZhciBtYXBwZWRWYWwgPSB1dGlscy52YWx1ZU9yKGxvY2FsTWFwcGluZ1t0aGlzLnZhbHVlX10sXG4gICAgICAgIGdsb2JhbE1hcHBpbmdbdGhpcy52YWx1ZV9dKTtcbiAgICAgIGlmIChtYXBwZWRWYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG1hcHBpbmcgZm9yIHZhcmlhYmxlIGR1cmluZyBldmFsdWF0aW9uJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjbG9uZSA9IHRoaXMuY2xvbmUoKTtcbiAgICAgIGNsb25lLnNldFZhbHVlKG1hcHBlZFZhbCk7XG4gICAgICByZXR1cm4gY2xvbmUuZXZhbHVhdGUoZ2xvYmFsTWFwcGluZyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5GVU5DVElPTl9DQUxMKSB7XG4gICAgICB2YXIgZnVuY3Rpb25EZWYgPSB1dGlscy52YWx1ZU9yKGxvY2FsTWFwcGluZ1t0aGlzLnZhbHVlX10sXG4gICAgICAgIGdsb2JhbE1hcHBpbmdbdGhpcy52YWx1ZV9dKTtcbiAgICAgIGlmIChmdW5jdGlvbkRlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gbWFwcGluZyBmb3IgZnVuY3Rpb24gZHVyaW5nIGV2YWx1YXRpb24nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFmdW5jdGlvbkRlZi52YXJpYWJsZXMgfHwgIWZ1bmN0aW9uRGVmLmV4cHJlc3Npb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgbWFwcGluZyBmb3I6ICcgKyB0aGlzLnZhbHVlXyk7XG4gICAgICB9XG4gICAgICBpZiAoZnVuY3Rpb25EZWYudmFyaWFibGVzLmxlbmd0aCAhPT0gdGhpcy5jaGlsZHJlbl8ubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQmFkIG1hcHBpbmcgZm9yOiAnICsgdGhpcy52YWx1ZV8pO1xuICAgICAgfVxuXG4gICAgICAvLyBXZSdyZSBjYWxsaW5nIGEgbmV3IGZ1bmN0aW9uLCBzbyBpdCBnZXRzIGEgbmV3IGxvY2FsIHNjb3BlLlxuICAgICAgdmFyIG5ld0xvY2FsTWFwcGluZyA9IHt9O1xuICAgICAgZnVuY3Rpb25EZWYudmFyaWFibGVzLmZvckVhY2goZnVuY3Rpb24gKHZhcmlhYmxlLCBpbmRleCkge1xuICAgICAgICB2YXIgZXZhbHVhdGlvbiA9IHRoaXMuY2hpbGRyZW5fW2luZGV4XS5ldmFsdWF0ZShnbG9iYWxNYXBwaW5nLCBsb2NhbE1hcHBpbmcpO1xuICAgICAgICBpZiAoZXZhbHVhdGlvbi5lcnIpIHtcbiAgICAgICAgICB0aHJvdyBldmFsdWF0aW9uLmVycjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRWYWwgPSBldmFsdWF0aW9uLnJlc3VsdDtcbiAgICAgICAgbmV3TG9jYWxNYXBwaW5nW3ZhcmlhYmxlXSA9IHV0aWxzLnZhbHVlT3IobG9jYWxNYXBwaW5nW2NoaWxkVmFsXSwgY2hpbGRWYWwpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgICByZXR1cm4gZnVuY3Rpb25EZWYuZXhwcmVzc2lvbi5ldmFsdWF0ZShnbG9iYWxNYXBwaW5nLCBuZXdMb2NhbE1hcHBpbmcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuTlVNQkVSKSB7XG4gICAgICByZXR1cm4geyByZXN1bHQ6IHRoaXMudmFsdWVfIH07XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgIT09IFZhbHVlVHlwZS5BUklUSE1FVElDICYmIHR5cGUgIT09IFZhbHVlVHlwZS5FWFBPTkVOVElBTCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkJyk7XG4gICAgfVxuXG4gICAgdmFyIGxlZnQgPSB0aGlzLmNoaWxkcmVuX1swXS5ldmFsdWF0ZShnbG9iYWxNYXBwaW5nLCBsb2NhbE1hcHBpbmcpO1xuICAgIGlmIChsZWZ0LmVycikge1xuICAgICAgdGhyb3cgbGVmdC5lcnI7XG4gICAgfVxuICAgIGxlZnQgPSBsZWZ0LnJlc3VsdC50b0V4YWN0KCk7XG5cbiAgICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAxKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMudmFsdWVfKSB7XG4gICAgICAgIGNhc2UgJ3NxcnQnOlxuICAgICAgICAgIHZhbCA9IGpzbnVtcy5zcXJ0KGxlZnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzcXInOlxuICAgICAgICAgIHZhbCA9IGpzbnVtcy5zcXIobGVmdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIG9wZXJhdG9yOiAnICsgdGhpcy52YWx1ZV8pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBlbnN1cmVKc251bSh2YWwpIH07XG4gICAgfVxuXG4gICAgdmFyIHJpZ2h0ID0gdGhpcy5jaGlsZHJlbl9bMV0uZXZhbHVhdGUoZ2xvYmFsTWFwcGluZywgbG9jYWxNYXBwaW5nKTtcbiAgICBpZiAocmlnaHQuZXJyKSB7XG4gICAgICB0aHJvdyByaWdodC5lcnI7XG4gICAgfVxuICAgIHJpZ2h0ID0gcmlnaHQucmVzdWx0LnRvRXhhY3QoKTtcblxuICAgIHN3aXRjaCAodGhpcy52YWx1ZV8pIHtcbiAgICAgIGNhc2UgJysnOlxuICAgICAgICB2YWwgPSBqc251bXMuYWRkKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICctJzpcbiAgICAgICAgdmFsID0ganNudW1zLnN1YnRyYWN0KGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcqJzpcbiAgICAgICAgdmFsID0ganNudW1zLm11bHRpcGx5KGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgaWYgKGpzbnVtcy5lcXVhbHMocmlnaHQsIDApKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERpdmlkZUJ5WmVyb0Vycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0ganNudW1zLmRpdmlkZShsZWZ0LCByaWdodCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncG93JzpcbiAgICAgICAgdmFsID0ganNudW1zLmV4cHQobGVmdCwgcmlnaHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBvcGVyYXRvcjogJyArIHRoaXMudmFsdWVfKTtcbiAgICB9XG4gICAgLy8gV2hlbiBjYWxsaW5nIGpzbnVtcyBtZXRob2RzLCB0aGV5IHdpbGwgc29tZXRpbWVzIHJldHVybiBhIGpzbnVtYmVyIGFuZFxuICAgIC8vIHNvbWV0aW1lcyBhIG5hdGl2ZSBKYXZhU2NyaXB0IG51bWJlci4gV2Ugd2FudCB0byBtYWtlIHN1cmUgdG8gY29udmVydFxuICAgIC8vIHRvIGEganNudW1iZXIgYmVmb3JlIHdlIHJldHVybi5cbiAgICByZXR1cm4geyByZXN1bHQ6IGVuc3VyZUpzbnVtKHZhbCkgfTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyb3IgPSBlcnI7XG4gIH1cbiAgcmV0dXJuIHsgZXJyOiBlcnJvciB9O1xufTtcblxuLyoqXG4gKiBEZXB0aCBvZiB0aGlzIG5vZGUncyB0cmVlLiBBIGxvbmUgdmFsdWUgaXMgY29uc2lkZXJlZCB0byBoYXZlIGEgZGVwdGggb2YgMC5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmRlcHRoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWF4ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7IGkrKykge1xuICAgIG1heCA9IE1hdGgubWF4KG1heCwgMSArIHRoaXMuY2hpbGRyZW5fW2ldLmRlcHRoKCkpO1xuICB9XG5cbiAgcmV0dXJuIG1heDtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgZGVlcGVzdCBkZXNjZW5kYW50IG9wZXJhdGlvbiBFeHByZXNzaW9uTm9kZSBpbiB0aGUgdHJlZSAoaS5lLiB0aGVcbiAqIG5leHQgbm9kZSB0byBjb2xsYXBzZVxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuZ2V0RGVlcGVzdE9wZXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGRlZXBlc3RDaGlsZCA9IG51bGw7XG4gIHZhciBkZWVwZXN0RGVwdGggPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW5fLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlcHRoID0gdGhpcy5jaGlsZHJlbl9baV0uZGVwdGgoKTtcbiAgICBpZiAoZGVwdGggPiBkZWVwZXN0RGVwdGgpIHtcbiAgICAgIGRlZXBlc3REZXB0aCA9IGRlcHRoO1xuICAgICAgZGVlcGVzdENoaWxkID0gdGhpcy5jaGlsZHJlbl9baV07XG4gICAgfVxuICB9XG5cbiAgaWYgKGRlZXBlc3REZXB0aCA9PT0gMCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmV0dXJuIGRlZXBlc3RDaGlsZC5nZXREZWVwZXN0T3BlcmF0aW9uKCk7XG59O1xuXG4vKipcbiAqIENvbGxhcHNlcyB0aGUgbmV4dCBkZXNjZW5kYW50IGluIHBsYWNlLiBOZXh0IGlzIGRlZmluZWQgYXMgZGVlcGVzdCwgdGhlblxuICogZnVydGhlc3QgbGVmdC5cbiAqIEByZXR1cm5zIHtib29sZWF9IHRydWUgaWYgY29sbGFwc2Ugd2FzIHN1Y2Nlc3NmdWwuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5jb2xsYXBzZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGRlZXBlc3QgPSB0aGlzLmdldERlZXBlc3RPcGVyYXRpb24oKTtcbiAgaWYgKGRlZXBlc3QgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBXZSdyZSB0aGUgZGVwZXN0IG9wZXJhdGlvbiwgaW1wbHlpbmcgYm90aCBzaWRlcyBhcmUgbnVtYmVyc1xuICBpZiAodGhpcyA9PT0gZGVlcGVzdCkge1xuICAgIHZhciBldmFsdWF0aW9uID0gdGhpcy5ldmFsdWF0ZSgpO1xuICAgIGlmIChldmFsdWF0aW9uLmVycikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlXyA9IGV2YWx1YXRpb24ucmVzdWx0O1xuICAgIHRoaXMuY2hpbGRyZW5fID0gW107XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRlZXBlc3QuY29sbGFwc2UoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZXQgYSB0b2tlbkxpc3QgZm9yIHRoaXMgZXhwcmVzc2lvbiwgd2hlcmUgZGlmZmVyZW5jZXMgZnJvbSBvdGhlciBleHByZXNzaW9uXG4gKiBhcmUgbWFya2VkXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfSBvdGhlciBUaGUgRXhwcmVzc2lvbk5vZGUgdG8gY29tcGFyZSB0by5cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldFRva2VuTGlzdERpZmYgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgdmFyIHRva2VucztcbiAgdmFyIG5vZGVzTWF0Y2ggPSBvdGhlciAmJiB0aGlzLmhhc1NhbWVWYWx1ZV8ob3RoZXIpICYmXG4gICAgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCA9PT0gb3RoZXIuY2hpbGRyZW5fLmxlbmd0aCk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRUeXBlXygpO1xuXG4gIGlmICh0aGlzLmNoaWxkcmVuXy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW25ldyBUb2tlbih0aGlzLnZhbHVlXywgIW5vZGVzTWF0Y2gpXTtcbiAgfVxuXG4gIHZhciB0b2tlbnNGb3JDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZEluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5fW2NoaWxkSW5kZXhdLmdldFRva2VuTGlzdERpZmYobm9kZXNNYXRjaCAmJlxuICAgICAgb3RoZXIuY2hpbGRyZW5fW2NoaWxkSW5kZXhdKTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuQVJJVEhNRVRJQykge1xuICAgIC8vIERlYWwgd2l0aCBhcml0aG1ldGljLCB3aGljaCBpcyBhbHdheXMgaW4gdGhlIGZvcm0gKGNoaWxkMCBvcGVyYXRvciBjaGlsZDEpXG4gICAgdG9rZW5zID0gW25ldyBUb2tlbignKCcsICFub2Rlc01hdGNoKV07XG4gICAgdG9rZW5zLnB1c2goW1xuICAgICAgdG9rZW5zRm9yQ2hpbGQoMCksXG4gICAgICBuZXcgVG9rZW4oXCIgXCIgKyB0aGlzLnZhbHVlXyArIFwiIFwiLCAhbm9kZXNNYXRjaCksXG4gICAgICB0b2tlbnNGb3JDaGlsZCgxKVxuICAgIF0pO1xuICAgIHRva2Vucy5wdXNoKG5ldyBUb2tlbignKScsICFub2Rlc01hdGNoKSk7XG5cbiAgICByZXR1cm4gXy5mbGF0dGVuKHRva2Vucyk7XG4gIH1cblxuICBpZiAodGhpcy52YWx1ZV8gPT09ICdzcXInKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbihbXG4gICAgICBuZXcgVG9rZW4oJygnLCAhbm9kZXNNYXRjaCksXG4gICAgICB0b2tlbnNGb3JDaGlsZCgwKSxcbiAgICAgIG5ldyBUb2tlbignIF4gMicsICFub2Rlc01hdGNoKSxcbiAgICAgIG5ldyBUb2tlbignKScsICFub2Rlc01hdGNoKVxuICAgIF0pO1xuICB9IGVsc2UgaWYgKHRoaXMudmFsdWVfID09PSAncG93Jykge1xuICAgIHJldHVybiBfLmZsYXR0ZW4oW1xuICAgICAgbmV3IFRva2VuKCcoJywgIW5vZGVzTWF0Y2gpLFxuICAgICAgdG9rZW5zRm9yQ2hpbGQoMCksXG4gICAgICBuZXcgVG9rZW4oJyBeICcsICFub2Rlc01hdGNoKSxcbiAgICAgIHRva2Vuc0ZvckNoaWxkKDEpLFxuICAgICAgbmV3IFRva2VuKCcpJywgIW5vZGVzTWF0Y2gpXG4gICAgXSk7XG4gIH1cblxuICAvLyBXZSBlaXRoZXIgaGF2ZSBhIGZ1bmN0aW9uIGNhbGwsIG9yIGFuIGFyaXRobWV0aWMgbm9kZSB0aGF0IHdlIHdhbnQgdG9cbiAgLy8gdHJlYXQgbGlrZSBhIGZ1bmN0aW9uIChpLmUuIHNxcnQoNCkpXG4gIC8vIEEgZnVuY3Rpb24gY2FsbCB3aWxsIGdlbmVyYXRlIHNvbWV0aGluZyBsaWtlOiBmb28oMSwgMiwgMylcbiAgdG9rZW5zID0gW1xuICAgIG5ldyBUb2tlbih0aGlzLnZhbHVlXywgb3RoZXIgJiYgdGhpcy52YWx1ZV8gIT09IG90aGVyLnZhbHVlXyksXG4gICAgbmV3IFRva2VuKCcoJywgIW5vZGVzTWF0Y2gpXG4gIF07XG5cbiAgdmFyIG51bUNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbl8ubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKyspIHtcbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHRva2Vucy5wdXNoKG5ldyBUb2tlbignLCcsICFub2Rlc01hdGNoKSk7XG4gICAgfVxuICAgIHZhciBjaGlsZFRva2VucyA9IHRva2Vuc0ZvckNoaWxkKGkpO1xuICAgIGlmIChudW1DaGlsZHJlbiA9PT0gMSkge1xuICAgICAgRXhwcmVzc2lvbk5vZGUuc3RyaXBPdXRlclBhcmVuc0Zyb21Ub2tlbkxpc3QoY2hpbGRUb2tlbnMpO1xuICAgIH1cbiAgICB0b2tlbnMucHVzaChjaGlsZFRva2Vucyk7XG4gIH1cblxuICB0b2tlbnMucHVzaChuZXcgVG9rZW4oXCIpXCIsICFub2Rlc01hdGNoKSk7XG4gIHJldHVybiBfLmZsYXR0ZW4odG9rZW5zKTtcbn07XG5cbi8qKlxuICogR2V0IGEgdG9rZW5MaXN0IGZvciB0aGlzIGV4cHJlc3Npb24sIHBvdGVudGlhbGx5IG1hcmtpbmcgdGhvc2UgdG9rZW5zXG4gKiB0aGF0IGFyZSBpbiB0aGUgZGVlcGVzdCBkZXNjZW5kYW50IGV4cHJlc3Npb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG1hcmtEZWVwZXN0IE1hcmsgdG9rZW5zIGluIHRoZSBkZWVwZXN0IGRlc2NlbmRhbnRcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldFRva2VuTGlzdCA9IGZ1bmN0aW9uIChtYXJrRGVlcGVzdCkge1xuICBpZiAoIW1hcmtEZWVwZXN0KSB7XG4gICAgLy8gZGlmZiBhZ2FpbnN0IHRoaXMgc28gdGhhdCBub3RoaW5nIGlzIG1hcmtlZFxuICAgIHJldHVybiB0aGlzLmdldFRva2VuTGlzdERpZmYodGhpcyk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZXB0aCgpIDw9IDEpIHtcbiAgICAvLyBtYXJrRGVlcGVzdCBpcyB0cnVlLiBkaWZmIGFnYWluc3QgbnVsbCBzbyB0aGF0IGV2ZXJ5dGhpbmcgaXMgbWFya2VkXG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9rZW5MaXN0RGlmZihudWxsKTtcbiAgfVxuXG4gIGlmICh0aGlzLmdldFR5cGVfKCkgIT09IFZhbHVlVHlwZS5BUklUSE1FVElDICYmXG4gICAgICB0aGlzLmdldFR5cGVfKCkgIT09IFZhbHVlVHlwZS5FWFBPTkVOVElBTCkge1xuICAgIC8vIERvbid0IHN1cHBvcnQgZ2V0VG9rZW5MaXN0IGZvciBmdW5jdGlvbnNcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZFwiKTtcbiAgfVxuXG4gIHZhciByaWdodERlZXBlciA9IGZhbHNlO1xuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAyKSB7XG4gICAgcmlnaHREZWVwZXIgPSB0aGlzLmNoaWxkcmVuX1sxXS5kZXB0aCgpID4gdGhpcy5jaGlsZHJlbl9bMF0uZGVwdGgoKTtcbiAgfVxuXG4gIHZhciBwcmVmaXggPSBuZXcgVG9rZW4oJygnLCBmYWxzZSk7XG4gIHZhciBzdWZmaXggPSBuZXcgVG9rZW4oJyknLCBmYWxzZSk7XG5cbiAgaWYgKHRoaXMudmFsdWVfID09PSAnc3FydCcpIHtcbiAgICBwcmVmaXggPSBuZXcgVG9rZW4oJ3NxcnQnLCBmYWxzZSk7XG4gICAgc3VmZml4ID0gbnVsbDtcbiAgfVxuXG4gIHZhciB0b2tlbnMgPSBbXG4gICAgcHJlZml4LFxuICAgIHRoaXMuY2hpbGRyZW5fWzBdLmdldFRva2VuTGlzdChtYXJrRGVlcGVzdCAmJiAhcmlnaHREZWVwZXIpLFxuICBdO1xuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID4gMSkge1xuICAgIHRva2Vucy5wdXNoKFtcbiAgICAgIG5ldyBUb2tlbihcIiBcIiArIHRoaXMudmFsdWVfICsgXCIgXCIsIGZhbHNlKSxcbiAgICAgIHRoaXMuY2hpbGRyZW5fWzFdLmdldFRva2VuTGlzdChtYXJrRGVlcGVzdCAmJiByaWdodERlZXBlcilcbiAgICBdKTtcbiAgfVxuICBpZiAoc3VmZml4KSB7XG4gICAgdG9rZW5zLnB1c2goc3VmZml4KTtcbiAgfVxuICByZXR1cm4gXy5mbGF0dGVuKHRva2Vucyk7XG59O1xuXG4vKipcbiAqIExvb2tzIHRvIHNlZSBpZiB0d28gbm9kZXMgaGF2ZSB0aGUgc2FtZSB2YWx1ZSwgdXNpbmcganNudW0uZXF1YWxzIGluIHRoZVxuICogY2FzZSBvZiBudW1iZXJzXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfSBvdGhlciBFeHByZXNpc29uTm9kZSB0byBjb21wYXJlIHRvXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBib3RoIG5vZGVzIGhhdmUgdGhlIHNhbWUgdmFsdWUuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5oYXNTYW1lVmFsdWVfID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGlmICghb3RoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5pc051bWJlcigpKSB7XG4gICAgcmV0dXJuIGpzbnVtcy5lcXVhbHModGhpcy52YWx1ZV8sIG90aGVyLnZhbHVlXyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy52YWx1ZV8gPT09IG90aGVyLnZhbHVlXztcbn07XG5cbi8qKlxuICogSXMgb3RoZXIgZXhhY3RseSB0aGUgc2FtZSBhcyB0aGlzIEV4cHJlc3Npb25Ob2RlIHRyZWUuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5pc0lkZW50aWNhbFRvID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGlmICghb3RoZXIgfHwgIXRoaXMuaGFzU2FtZVZhbHVlXyhvdGhlcikgfHwgdGhpcy5jaGlsZHJlbl8ubGVuZ3RoICE9PSBvdGhlci5jaGlsZHJlbl8ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghdGhpcy5jaGlsZHJlbl9baV0uaXNJZGVudGljYWxUbyhvdGhlci5jaGlsZHJlbl9baV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYm90aCB0aGlzIGFuZCBvdGhlciBhcmUgY2FsbHMgb2YgdGhlIHNhbWUgZnVuY3Rpb24sIHdpdGhcbiAqIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHNcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmhhc1NhbWVTaWduYXR1cmUgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCFvdGhlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLmdldFR5cGVfKCkgIT09IFZhbHVlVHlwZS5GVU5DVElPTl9DQUxMIHx8XG4gICAgICBvdGhlci5nZXRUeXBlXygpICE9PSBWYWx1ZVR5cGUuRlVOQ1RJT05fQ0FMTCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLnZhbHVlXyAhPT0gb3RoZXIudmFsdWVfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuY2hpbGRyZW5fLmxlbmd0aCAhPT0gb3RoZXIuY2hpbGRyZW5fLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBEbyB0aGUgdHdvIG5vZGVzIGRpZmZlciBvbmx5IGluIGFyZ3VtZW50IG9yZGVyLlxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuaXNFcXVpdmFsZW50VG8gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgLy8gb25seSBpZ25vcmUgYXJndW1lbnQgb3JkZXIgZm9yIEFSSVRITUVUSUNcbiAgaWYgKHRoaXMuZ2V0VHlwZV8oKSAhPT0gVmFsdWVUeXBlLkFSSVRITUVUSUMpIHtcbiAgICByZXR1cm4gdGhpcy5pc0lkZW50aWNhbFRvKG90aGVyKTtcbiAgfVxuXG4gIGlmICghb3RoZXIgfHwgdGhpcy52YWx1ZV8gIT09IG90aGVyLnZhbHVlXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBteUxlZnQgPSB0aGlzLmNoaWxkcmVuX1swXTtcbiAgdmFyIG15UmlnaHQgPSB0aGlzLmNoaWxkcmVuX1sxXTtcblxuICB2YXIgdGhlaXJMZWZ0ID0gb3RoZXIuY2hpbGRyZW5fWzBdO1xuICB2YXIgdGhlaXJSaWdodCA9IG90aGVyLmNoaWxkcmVuX1sxXTtcblxuICBpZiAobXlMZWZ0LmlzRXF1aXZhbGVudFRvKHRoZWlyTGVmdCkpIHtcbiAgICByZXR1cm4gbXlSaWdodC5pc0VxdWl2YWxlbnRUbyh0aGVpclJpZ2h0KTtcbiAgfVxuICBpZiAobXlMZWZ0LmlzRXF1aXZhbGVudFRvKHRoZWlyUmlnaHQpKSB7XG4gICAgcmV0dXJuIG15UmlnaHQuaXNFcXVpdmFsZW50VG8odGhlaXJMZWZ0KTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEhvdyBtYW55IGNoaWxkcmVuIHRoaXMgbm9kZSBoYXNcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLm51bUNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jaGlsZHJlbl8ubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBub2RlJ3MgdmFsdWUuXG4gKi9cbkV4cHJlc3Npb25Ob2RlLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWVfLnRvU3RyaW5nKCk7XG59O1xuXG5cbi8qKlxuICogTW9kaWZ5IHRoaXMgRXhwcmVzc2lvbk5vZGUncyB2YWx1ZVxuICovXG5FeHByZXNzaW9uTm9kZS5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldFR5cGVfKCk7XG4gIGlmICh0eXBlICE9PSBWYWx1ZVR5cGUuVkFSSUFCTEUgJiYgdHlwZSAhPT0gVmFsdWVUeXBlLk5VTUJFUikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IG1vZGlmeSB2YWx1ZVwiKTtcbiAgfVxuICBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLk5VTUJFUikge1xuICAgIHRoaXMudmFsdWVfID0gZW5zdXJlSnNudW0odmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMudmFsdWVfID0gdmFsdWU7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZSBvZiB0aGUgY2hpbGQgYXQgaW5kZXhcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmdldENoaWxkVmFsdWUgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgaWYgKHRoaXMuY2hpbGRyZW5fW2luZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdGhpcy5jaGlsZHJlbl9baW5kZXhdLnZhbHVlXztcbn07XG5cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBvZiB0aGUgY2hpbGQgYXQgaW5kZXhcbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLnNldENoaWxkVmFsdWUgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLmNoaWxkcmVuX1tpbmRleF0uc2V0VmFsdWUodmFsdWUpO1xufTtcblxuLyoqXG4gKiBHZXQgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyZWVcbiAqIE5vdGU6IFRoaXMgaXMgb25seSB1c2VkIGJ5IHRlc3QgY29kZSwgYnV0IGlzIGFsc28gZ2VuZXJhbGx5IHVzZWZ1bCB0byBkZWJ1Z1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuRXhwcmVzc2lvbk5vZGUucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5jaGlsZHJlbl8ubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKHRoaXMuaXNOdW1iZXIoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfLnRvRml4bnVtKCkudG9TdHJpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfLnRvU3RyaW5nKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBcIihcIiArIHRoaXMudmFsdWVfICsgXCIgXCIgK1xuICAgIHRoaXMuY2hpbGRyZW5fLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIGMuZGVidWcoKTtcbiAgICB9KS5qb2luKCcgJykgKyBcIilcIjtcbn07XG5cbi8qKlxuICogR2l2ZW4gYSB0b2tlbiBsaXN0LCBpZiB0aGUgZmlyc3QgYW5kIGxhc3QgaXRlbXMgYXJlIHBhcmVucywgcmVtb3ZlcyB0aGVtXG4gKiBmcm9tIHRoZSBsaXN0XG4gKi9cbkV4cHJlc3Npb25Ob2RlLnN0cmlwT3V0ZXJQYXJlbnNGcm9tVG9rZW5MaXN0ID0gZnVuY3Rpb24gKHRva2VuTGlzdCkge1xuICBpZiAodG9rZW5MaXN0Lmxlbmd0aCA+PSAyICYmIHRva2VuTGlzdFswXS5pc1BhcmVudGhlc2lzKCkgJiZcbiAgICAgIHRva2VuTGlzdFt0b2tlbkxpc3QubGVuZ3RoIC0gMV0uaXNQYXJlbnRoZXNpcygpKSB7XG4gICAgdG9rZW5MaXN0LnNwbGljZSgtMSk7XG4gICAgdG9rZW5MaXN0LnNwbGljZSgwLCAxKTtcbiAgfVxuICByZXR1cm4gdG9rZW5MaXN0O1xufTtcbiIsInZhciBqc251bXMgPSByZXF1aXJlKCcuL2pzLW51bWJlcnMvanMtbnVtYmVycycpO1xuXG4vLyBVbmljb2RlIGNoYXJhY3RlciBmb3Igbm9uLWJyZWFraW5nIHNwYWNlXG52YXIgTkJTUCA9ICdcXHUwMEEwJztcblxuLyoqXG4gKiBBIHRva2VuIGlzIGEgdmFsdWUsIGFuZCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCBpdCBpcyBcIm1hcmtlZFwiLlxuICogTWFya2luZyBpcyBkb25lIGZvciB0d28gZGlmZmVyZW50IHJlYXNvbnMuXG4gKiAoMSkgV2UncmUgY29tcGFyaW5nIHR3byBleHByZXNzaW9ucyBhbmQgd2FudCB0byBtYXJrIHdoZXJlIHRoZXkgZGlmZmVyLlxuICogKDIpIFdlJ3JlIGxvb2tpbmcgYXQgYSBzaW5nbGUgZXhwcmVzc2lvbiBhbmQgd2FudCB0byBtYXJrIHRoZSBkZWVwZXN0XG4gKiAgICAgc3ViZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfGpzbnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gbWFya2VkXG4gKi9cbnZhciBUb2tlbiA9IGZ1bmN0aW9uICh2YWwsIG1hcmtlZCkge1xuICB0aGlzLnZhbF8gPSB2YWw7XG4gIHRoaXMubWFya2VkXyA9IG1hcmtlZDtcblxuICAvLyBTdG9yZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdmFsdWUuIEluIG1vc3QgY2FzZXMgdGhpcyBpcyBqdXN0IGFcbiAgLy8gbm9uIHJlcGVhdGVkIHBvcnRpb24uIEluIHRoZSBjYXNlIG9mIHNvbWV0aGluZyBsaWtlIDEvOSB0aGVyZSB3aWxsIGJlIGJvdGhcbiAgLy8gYSBub24gcmVwZWF0ZWQgcG9ydGlvbiBcIjAuXCIgYW5kIGEgcmVwZWF0ZWQgcG9ydGlvbiBcIjFcIiAtIGkuZS4gMC4xMTExMTExLi4uXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB0aGlzLm5vblJlcGVhdGVkXyA9IG51bGw7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB0aGlzLnJlcGVhdGVkXyA9IG51bGw7XG4gIHRoaXMuc2V0U3RyaW5nUmVwcmVzZW50YXRpb25fKCk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUb2tlbjtcblxuVG9rZW4ucHJvdG90eXBlLmlzUGFyZW50aGVzaXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnZhbF8gPT09ICcoJyB8fCB0aGlzLnZhbF8gPT09ICcpJztcbn07XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiB0b2tlbiB0byB0aGUgcGFyZW50IGVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBhcmVudCBlbGVtZW50IHRvIGFkZCB0b1xuICogQHBhcmFtIHtudW1iZXJ9IHhQb3MgWCBwb3NpdGlvbiB0byBwbGFjZSBlbGVtZW50IGF0XG4gKiBAcGFyYW0ge3N0cmluZz99IG1hcmtDbGFzcyBDbGFzcyBuYW1lIHRvIHVzZSBpZiB0b2tlbiBpcyBtYXJrZWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBsZW5ndGggb2YgdGhlIGFkZGVkIHRleHQgZWxlbWVudFxuICovXG5Ub2tlbi5wcm90b3R5cGUucmVuZGVyVG9QYXJlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgeFBvcywgbWFya0NsYXNzKSB7XG4gIHZhciB0ZXh0LCB0ZXh0TGVuZ3RoO1xuXG4gIHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICd0ZXh0Jyk7XG5cbiAgdmFyIHRzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndHNwYW4nKTtcbiAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAyeCBub25icmVha2luZyBzcGFjZVxuICB0c3Bhbi50ZXh0Q29udGVudCA9IHRoaXMubm9uUmVwZWF0ZWRfLnJlcGxhY2UoLyAvZywgTkJTUCArIE5CU1ApO1xuICB0ZXh0LmFwcGVuZENoaWxkKHRzcGFuKTtcblxuICBpZiAodGhpcy5yZXBlYXRlZF8pIHtcbiAgICB0c3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RzcGFuJyk7XG4gICAgdHNwYW4uc2V0QXR0cmlidXRlKCdzdHlsZScsICd0ZXh0LWRlY29yYXRpb246IG92ZXJsaW5lJyk7XG4gICAgLy8gUmVwbGFjZSBzcGFjZXMgd2l0aCAyeCBub25icmVha2luZyBzcGFjZVxuICAgIHRzcGFuLnRleHRDb250ZW50ID0gdGhpcy5yZXBlYXRlZF8ucmVwbGFjZSgvIC9nLCBOQlNQICsgTkJTUCk7XG4gICAgdGV4dC5hcHBlbmRDaGlsZCh0c3Bhbik7XG4gIH1cblxuICBlbGVtZW50LmFwcGVuZENoaWxkKHRleHQpO1xuXG4gIC8vIEZGIGRvZXNudCBoYXZlIG9mZnNldFdpZHRoXG4gIC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdCB1bmRlcmNhbGN1bGF0ZXMgd2lkdGggb24gaVBhZFxuICBpZiAodGV4dC5vZmZzZXRXaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGV4dExlbmd0aCA9IHRleHQub2Zmc2V0V2lkdGg7XG4gIH0gZWxzZSB7XG4gICAgdGV4dExlbmd0aCA9IHRleHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gIH1cblxuICB0ZXh0LnNldEF0dHJpYnV0ZSgneCcsIHhQb3MpO1xuICBpZiAodGhpcy5tYXJrZWRfICYmIG1hcmtDbGFzcykge1xuICAgIHRleHQuc2V0QXR0cmlidXRlKCdjbGFzcycsIG1hcmtDbGFzcyk7XG4gIH1cblxuICByZXR1cm4gdGV4dExlbmd0aDtcbn07XG5cbi8qKlxuICogU2V0cyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdmFsdWUuXG4gKi9cblRva2VuLnByb3RvdHlwZS5zZXRTdHJpbmdSZXByZXNlbnRhdGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghanNudW1zLmlzU2NoZW1lTnVtYmVyKHRoaXMudmFsXykgfHwgdHlwZW9mKHRoaXMudmFsXykgPT09ICdudW1iZXInKSB7XG4gICAgdGhpcy5ub25SZXBlYXRlZF8gPSB0aGlzLnZhbF87XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYXQgdGhpcyBwb2ludCB3ZSBrbm93IHdlIGhhdmUgYSBqc251bWJlclxuICBpZiAodGhpcy52YWxfLmlzSW50ZWdlcigpKSB7XG4gICAgdGhpcy5ub25SZXBlYXRlZF8gPSBUb2tlbi5udW1iZXJXaXRoQ29tbWFzXyh0aGlzLnZhbF8udG9GaXhudW0oKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gR2l2ZXMgdXMgdGhyZWUgdmFsdWVzOiBOdW1iZXIgYmVmb3JlIGRlY2ltYWwsIG5vbi1yZXBlYXRpbmcgcG9ydGlvbixcbiAgLy8gcmVwZWF0aW5nIHBvcnRpb24uIElmIHdlIGRvbid0IGhhdmUgdGhlIGxhc3QgYml0LCB0aGVyZSdzIG5vIHJlcGl0aXRpb24uXG4gIHZhciBudW1lcmF0b3IgPSBqc251bXMudG9FeGFjdCh0aGlzLnZhbF8ubnVtZXJhdG9yKCkpO1xuICB2YXIgZGVub21pbmF0b3IgPSBqc251bXMudG9FeGFjdCh0aGlzLnZhbF8uZGVub21pbmF0b3IoKSk7XG4gIHZhciByZXBlYXRlciA9IGpzbnVtcy50b1JlcGVhdGluZ0RlY2ltYWwobnVtZXJhdG9yLCBkZW5vbWluYXRvcik7XG4gIGlmICghcmVwZWF0ZXJbMl0gfHwgcmVwZWF0ZXJbMl0gPT09ICcwJykge1xuICAgIHRoaXMubm9uUmVwZWF0ZWRfID0gVG9rZW4ubnVtYmVyV2l0aENvbW1hc18odGhpcy52YWxfLnRvRml4bnVtKCkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMubm9uUmVwZWF0ZWRfID0gVG9rZW4ubnVtYmVyV2l0aENvbW1hc18ocmVwZWF0ZXJbMF0pICsgJy4nICsgcmVwZWF0ZXJbMV07XG4gIHRoaXMucmVwZWF0ZWRfID0gcmVwZWF0ZXJbMl07XG59O1xuXG4vKipcbiAqIEZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjkwMTI5OC8yNTA2NzQ4XG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHJldHVybnMge3N0cmluZ30gdGhlIG51bWJlciB3aXRoIGNvbW1hcyBpbnNlcnRlZCBpbiB0aG91c2FuZHRoJ3MgcGxhY2VcbiAqL1xuVG9rZW4ubnVtYmVyV2l0aENvbW1hc18gPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgcGFydHMgPSB4LnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpO1xuICBwYXJ0c1swXSA9IHBhcnRzWzBdLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKTtcbiAgcmV0dXJuIHBhcnRzLmpvaW4oXCIuXCIpO1xufTtcbiIsIi8vIFNjaGVtZSBudW1iZXJzLlxuXG4vLyBOT1RFOiBUaGlzIHRvcCBiaXQgZGlmZmVycyBmcm9tIHRoZSB2ZXJzaW9uIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ib290c3RyYXB3b3JsZC9qcy1udW1iZXJzL2Jsb2IvbWFzdGVyL3NyYy9qcy1udW1iZXJzLmpzXG52YXIganNudW1zID0ge307XG5tb2R1bGUuZXhwb3J0cyA9IGpzbnVtcztcblxuXG4vLyBUaGUgbnVtZXJpYyB0b3dlciBoYXMgdGhlIGZvbGxvd2luZyBsZXZlbHM6XG4vLyAgICAgaW50ZWdlcnNcbi8vICAgICByYXRpb25hbHNcbi8vICAgICBmbG9hdHNcbi8vICAgICBjb21wbGV4IG51bWJlcnNcbi8vXG4vLyB3aXRoIHRoZSByZXByZXNlbnRhdGlvbnM6XG4vLyAgICAgaW50ZWdlcnM6IGZpeG51bSBvciBCaWdJbnRlZ2VyIFtsZXZlbD0wXVxuLy8gICAgIHJhdGlvbmFsczogUmF0aW9uYWwgW2xldmVsPTFdXG4vLyAgICAgZmxvYXRzOiBGbG9hdFBvaW50IFtsZXZlbD0yXVxuLy8gICAgIGNvbXBsZXggbnVtYmVyczogQ29tcGxleCBbbGV2ZWw9M11cblxuLy8gV2UgdHJ5IHRvIHN0aWNrIHdpdGggdGhlIHVuYm94ZWQgZml4bnVtIHJlcHJlc2VudGF0aW9uIGZvclxuLy8gaW50ZWdlcnMsIHNpbmNlIHRoYXQncyB3aGF0IHNjaGVtZSBwcm9ncmFtcyBjb21tb25seSBkZWFsIHdpdGgsIGFuZFxuLy8gd2Ugd2FudCB0aGF0IGNvbW1vbiB0eXBlIHRvIGJlIGxpZ2h0d2VpZ2h0LlxuXG5cbi8vIEEgYm94ZWQtc2NoZW1lLW51bWJlciBpcyBlaXRoZXIgQmlnSW50ZWdlciwgUmF0aW9uYWwsIEZsb2F0UG9pbnQsIG9yIENvbXBsZXguXG4vLyBBbiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaXMgZWl0aGVyIGZpeG51bSBvciBCaWdJbnRlZ2VyLlxuXG5cbihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gQWJicmV2aWF0aW9uXG4gICAgdmFyIE51bWJlcnMgPSBqc251bXM7XG5cblxuICAgIC8vIG1ha2VOdW1lcmljQmlub3A6IChmaXhudW0gZml4bnVtIC0+IGFueSkgKHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBhbnkpIC0+IChzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIpIFhcbiAgICAvLyBDcmVhdGVzIGEgYmluYXJ5IGZ1bmN0aW9uIHRoYXQgd29ya3MgZWl0aGVyIG9uIGZpeG51bXMgb3IgYm94bnVtcy5cbiAgICAvLyBBcHBsaWVzIHRoZSBhcHByb3ByaWF0ZSBiaW5hcnkgZnVuY3Rpb24sIGVuc3VyaW5nIHRoYXQgYm90aCBzY2hlbWUgbnVtYmVycyBhcmVcbiAgICAvLyBsaWZ0ZWQgdG8gdGhlIHNhbWUgbGV2ZWwuXG4gICAgdmFyIG1ha2VOdW1lcmljQmlub3AgPSBmdW5jdGlvbihvbkZpeG51bXMsIG9uQm94ZWRudW1zLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXNYU3BlY2lhbENhc2UgJiYgb3B0aW9ucy5pc1hTcGVjaWFsQ2FzZSh4KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5vblhTcGVjaWFsQ2FzZSh4LCB5KTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmlzWVNwZWNpYWxDYXNlICYmIG9wdGlvbnMuaXNZU3BlY2lhbENhc2UoeSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMub25ZU3BlY2lhbENhc2UoeCwgeSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YoeCkgPT09ICdudW1iZXInICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKHkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBvbkZpeG51bXMoeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mKHgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHggPSBsaWZ0Rml4bnVtSW50ZWdlcih4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YoeSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgeSA9IGxpZnRGaXhudW1JbnRlZ2VyKHksIHgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoeC5sZXZlbCA8IHkubGV2ZWwpIHggPSB4LmxpZnRUbyh5KTtcbiAgICAgICAgICAgIGlmICh5LmxldmVsIDwgeC5sZXZlbCkgeSA9IHkubGlmdFRvKHgpO1xuICAgICAgICAgICAgcmV0dXJuIG9uQm94ZWRudW1zKHgsIHkpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgLy8gZnJvbUZpeG51bTogZml4bnVtIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZnJvbUZpeG51bSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgaWYgKGlzTmFOKHgpIHx8ICghIGlzRmluaXRlKHgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZiA9IE1hdGguZmxvb3IoeCk7XG4gICAgICAgIGlmIChuZiA9PT0geCkge1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3cobmYpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VCaWdudW0oZXhwYW5kRXhwb25lbnQoeCsnJykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoeCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGV4cGFuZEV4cG9uZW50ID0gZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgbWF0Y2ggPSBzLm1hdGNoKHNjaWVudGlmaWNQYXR0ZXJuKGRpZ2l0c0ZvclJhZGl4KDEwKSwgZXhwTWFya0ZvclJhZGl4KDEwKSkpLCBtYW50aXNzYUNodW5rcywgZXhwb25lbnQ7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgbWFudGlzc2FDaHVua3MgPSBtYXRjaFsxXS5tYXRjaCgvXihbXi5dKikoLiopJC8pO1xuICAgICAgICAgICAgZXhwb25lbnQgPSBOdW1iZXIobWF0Y2hbMl0pO1xuXG4gICAgICAgICAgICBpZiAobWFudGlzc2FDaHVua3NbMl0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hbnRpc3NhQ2h1bmtzWzFdICsgemZpbGwoZXhwb25lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXhwb25lbnQgPj0gbWFudGlzc2FDaHVua3NbMl0ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFudGlzc2FDaHVua3NbMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFudGlzc2FDaHVua3NbMl0uc3Vic3RyaW5nKDEpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpmaWxsKGV4cG9uZW50IC0gKG1hbnRpc3NhQ2h1bmtzWzJdLmxlbmd0aCAtIDEpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFudGlzc2FDaHVua3NbMV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFudGlzc2FDaHVua3NbMl0uc3Vic3RyaW5nKDEsIDErZXhwb25lbnQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHpmaWxsOiBpbnRlZ2VyIC0+IHN0cmluZ1xuICAgIC8vIGJ1aWxkcyBhIHN0cmluZyBvZiBcIjBcIidzIG9mIGxlbmd0aCBuLlxuICAgIHZhciB6ZmlsbCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdmFyIGJ1ZmZlciA9IFtdO1xuICAgICAgICBidWZmZXIubGVuZ3RoID0gbjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGJ1ZmZlcltpXSA9ICcwJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVmZmVyLmpvaW4oJycpO1xuICAgIH07XG5cblxuXG4gICAgLy8gbGlmdEZpeG51bUludGVnZXI6IGZpeG51bS1pbnRlZ2VyIGJveGVkLXNjaGVtZS1udW1iZXIgLT4gYm94ZWQtc2NoZW1lLW51bWJlclxuICAgIC8vIExpZnRzIHVwIGZpeG51bSBpbnRlZ2VycyB0byBhIGJveGVkIHR5cGUuXG4gICAgdmFyIGxpZnRGaXhudW1JbnRlZ2VyID0gZnVuY3Rpb24oeCwgb3RoZXIpIHtcbiAgICAgICAgc3dpdGNoKG90aGVyLmxldmVsKSB7XG4gICAgICAgIGNhc2UgMDogLy8gQmlnSW50ZWdlclxuICAgICAgICAgICAgcmV0dXJuIG1ha2VCaWdudW0oeCk7XG4gICAgICAgIGNhc2UgMTogLy8gUmF0aW9uYWxcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmF0aW9uYWwoeCwgMSk7XG4gICAgICAgIGNhc2UgMjogLy8gRmxvYXRQb2ludFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdFBvaW50KHgpO1xuICAgICAgICBjYXNlIDM6IC8vIENvbXBsZXhcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGxleCh4LCAwKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiSU1QT1NTSUJMRTogY2Fubm90IGxpZnQgZml4bnVtIGludGVnZXIgdG8gXCIgKyBvdGhlci50b1N0cmluZygpLCB4LCBvdGhlcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLyB0aHJvd1J1bnRpbWVFcnJvcjogc3RyaW5nIChzY2hlbWUtbnVtYmVyIHwgdW5kZWZpbmVkKSAoc2NoZW1lLW51bWJlciB8IHVuZGVmaW5lZCkgLT4gdm9pZFxuICAgIC8vIFRocm93cyBhIHJ1bnRpbWUgZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZSBzdHJpbmcuXG4gICAgdmFyIHRocm93UnVudGltZUVycm9yID0gZnVuY3Rpb24obXNnLCB4LCB5KSB7XG4gICAgICAgIE51bWJlcnNbJ29uVGhyb3dSdW50aW1lRXJyb3InXShtc2csIHgsIHkpO1xuICAgIH07XG5cblxuXG4gICAgLy8gb25UaHJvd1J1bnRpbWVFcnJvcjogc3RyaW5nIChzY2hlbWUtbnVtYmVyIHwgdW5kZWZpbmVkKSAoc2NoZW1lLW51bWJlciB8IHVuZGVmaW5lZCkgLT4gdm9pZFxuICAgIC8vIEJ5IGRlZmF1bHQsIHdpbGwgdGhyb3cgYSBuZXcgRXJyb3Igd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICAvLyBPdmVycmlkZSBOdW1iZXJzWydvblRocm93UnVudGltZUVycm9yJ10gaWYgeW91IG5lZWQgdG8gZG8gc29tZXRoaW5nIHNwZWNpYWwuXG4gICAgdmFyIG9uVGhyb3dSdW50aW1lRXJyb3IgPSBmdW5jdGlvbihtc2csIHgsIHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfTtcblxuXG4gICAgLy8gaXNTY2hlbWVOdW1iZXI6IGFueSAtPiBib29sZWFuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSB0aGluZyBpcyBhIHNjaGVtZSBudW1iZXIuXG4gICAgdmFyIGlzU2NoZW1lTnVtYmVyID0gZnVuY3Rpb24odGhpbmcpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YodGhpbmcpID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHx8ICh0aGluZyBpbnN0YW5jZW9mIFJhdGlvbmFsIHx8XG4gICAgICAgICAgICAgICAgICAgIHRoaW5nIGluc3RhbmNlb2YgRmxvYXRQb2ludCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGluZyBpbnN0YW5jZW9mIENvbXBsZXggfHxcbiAgICAgICAgICAgICAgICAgICAgdGhpbmcgaW5zdGFuY2VvZiBCaWdJbnRlZ2VyKSk7XG4gICAgfTtcblxuXG4gICAgLy8gaXNSYXRpb25hbDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzUmF0aW9uYWwgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKG4pID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgIChpc1NjaGVtZU51bWJlcihuKSAmJiBuLmlzUmF0aW9uYWwoKSkpO1xuICAgIH07XG5cbiAgICAvLyBpc1JlYWw6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc1JlYWwgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mKG4pID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgIChpc1NjaGVtZU51bWJlcihuKSAmJiBuLmlzUmVhbCgpKSk7XG4gICAgfTtcblxuICAgIC8vIGlzRXhhY3Q6IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBpc0V4YWN0ID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZihuKSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAoaXNTY2hlbWVOdW1iZXIobikgJiYgbi5pc0V4YWN0KCkpKTtcbiAgICB9O1xuXG4gICAgLy8gaXNFeGFjdDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzSW5leGFjdCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoaXNTY2hlbWVOdW1iZXIobikgJiYgbi5pc0luZXhhY3QoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gaXNJbnRlZ2VyOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgaXNJbnRlZ2VyID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZihuKSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAoaXNTY2hlbWVOdW1iZXIobikgJiYgbi5pc0ludGVnZXIoKSkpO1xuICAgIH07XG5cbiAgICAvLyBpc0V4YWN0SW50ZWdlcjogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGlzRXhhY3RJbnRlZ2VyID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKHR5cGVvZihuKSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAoaXNTY2hlbWVOdW1iZXIobikgJiZcbiAgICAgICAgICAgICAgICAgbi5pc0ludGVnZXIoKSAmJlxuICAgICAgICAgICAgICAgICBuLmlzRXhhY3QoKSkpO1xuICAgIH1cblxuXG5cbiAgICAvLyB0b0ZpeG51bTogc2NoZW1lLW51bWJlciAtPiBqYXZhc2NyaXB0LW51bWJlclxuICAgIHZhciB0b0ZpeG51bSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4udG9GaXhudW0oKTtcbiAgICB9O1xuXG4gICAgLy8gdG9FeGFjdDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHRvRXhhY3QgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLnRvRXhhY3QoKTtcbiAgICB9O1xuXG5cbiAgICAvLyB0b0V4YWN0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgdG9JbmV4YWN0ID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShuKTtcbiAgICAgICAgcmV0dXJuIG4udG9JbmV4YWN0KCk7XG4gICAgfTtcblxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuICAgIC8vIGFkZDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYWRkID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgc3VtO1xuICAgICAgICBpZiAodHlwZW9mKHgpID09PSAnbnVtYmVyJyAmJiB0eXBlb2YoeSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBzdW0gPSB4ICsgeTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KHN1bSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLmFkZChtYWtlQmlnbnVtKHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIEZsb2F0UG9pbnQgJiYgeSBpbnN0YW5jZW9mIEZsb2F0UG9pbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmFkZCh5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRkU2xvdyh4LCB5KTtcbiAgICB9O1xuXG4gICAgdmFyIGFkZFNsb3cgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICB2YXIgc3VtID0geCArIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhzdW0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChtYWtlQmlnbnVtKHgpKS5hZGQobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmFkZCh5KTtcbiAgICAgICAgfSxcbiAgICAgICAge2lzWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4KSB7XG4gICAgICAgICAgICByZXR1cm4gaXNFeGFjdEludGVnZXIoeCkgJiYgX2ludGVnZXJJc1plcm8oeCkgfSxcbiAgICAgICAgIG9uWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7IHJldHVybiB5OyB9LFxuICAgICAgICAgaXNZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgICAgICByZXR1cm4gaXNFeGFjdEludGVnZXIoeSkgJiYgX2ludGVnZXJJc1plcm8oeSkgfSxcbiAgICAgICAgIG9uWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7IHJldHVybiB4OyB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBzdWJ0cmFjdDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgc3VidHJhY3QgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICB2YXIgZGlmZiA9IHggLSB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3coZGlmZikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLnN1YnRyYWN0KG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHguc3VidHJhY3QoeSk7XG4gICAgICAgIH0sXG4gICAgICAgIHtpc1hTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzRXhhY3RJbnRlZ2VyKHgpICYmIF9pbnRlZ2VySXNaZXJvKHgpIH0sXG4gICAgICAgICBvblhTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCwgeSkgeyByZXR1cm4gbmVnYXRlKHkpOyB9LFxuICAgICAgICAgaXNZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgICAgICByZXR1cm4gaXNFeGFjdEludGVnZXIoeSkgJiYgX2ludGVnZXJJc1plcm8oeSkgfSxcbiAgICAgICAgIG9uWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7IHJldHVybiB4OyB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBtdWxpdHBseTogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbXVsdGlwbHkgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwcm9kO1xuICAgICAgICBpZiAodHlwZW9mKHgpID09PSAnbnVtYmVyJyAmJiB0eXBlb2YoeSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBwcm9kID0geCAqIHk7XG4gICAgICAgICAgICBpZiAoaXNPdmVyZmxvdyhwcm9kKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkubXVsdGlwbHkobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh4IGluc3RhbmNlb2YgRmxvYXRQb2ludCAmJiB5IGluc3RhbmNlb2YgRmxvYXRQb2ludCkge1xuICAgICAgICAgICAgcmV0dXJuIHgubXVsdGlwbHkoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG11bHRpcGx5U2xvdyh4LCB5KTtcbiAgICB9O1xuICAgIHZhciBtdWx0aXBseVNsb3cgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICB2YXIgcHJvZCA9IHggKiB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3cocHJvZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLm11bHRpcGx5KG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHgubXVsdGlwbHkoeSk7XG4gICAgICAgIH0sXG4gICAgICAgIHtpc1hTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIChpc0V4YWN0SW50ZWdlcih4KSAmJlxuICAgICAgICAgICAgICAgICAgICAoX2ludGVnZXJJc1plcm8oeCkgfHwgX2ludGVnZXJJc09uZSh4KSB8fCBfaW50ZWdlcklzTmVnYXRpdmVPbmUoeCkpKSB9LFxuICAgICAgICAgb25YU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oeCkpXG4gICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzT25lKHgpKVxuICAgICAgICAgICAgICAgICByZXR1cm4geTtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc05lZ2F0aXZlT25lKHgpKVxuICAgICAgICAgICAgICAgICByZXR1cm4gbmVnYXRlKHkpO1xuICAgICAgICAgfSxcbiAgICAgICAgIGlzWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih5KSB7XG4gICAgICAgICAgICAgcmV0dXJuIChpc0V4YWN0SW50ZWdlcih5KSAmJlxuICAgICAgICAgICAgICAgICAgICAgKF9pbnRlZ2VySXNaZXJvKHkpIHx8IF9pbnRlZ2VySXNPbmUoeSkgfHwgX2ludGVnZXJJc05lZ2F0aXZlT25lKHkpKSl9LFxuICAgICAgICAgb25ZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oeSkpXG4gICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgIGlmIChfaW50ZWdlcklzT25lKHkpKVxuICAgICAgICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgICAgICBpZiAoX2ludGVnZXJJc05lZ2F0aXZlT25lKHkpKVxuICAgICAgICAgICAgICAgICByZXR1cm4gbmVnYXRlKHgpO1xuICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgLy8gZGl2aWRlOiBzY2hlbWUtbnVtYmVyIHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBkaXZpZGUgPSBtYWtlTnVtZXJpY0Jpbm9wKFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oeSkpXG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCIvOiBkaXZpc2lvbiBieSB6ZXJvXCIsIHgsIHkpO1xuICAgICAgICAgICAgdmFyIGRpdiA9IHggLyB5O1xuICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3coZGl2KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAobWFrZUJpZ251bSh4KSkuZGl2aWRlKG1ha2VCaWdudW0oeSkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChNYXRoLmZsb29yKGRpdikgIT09IGRpdikge1xuICAgICAgICAgICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoeCwgeSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmRpdmlkZSh5KTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBpc1hTcGVjaWFsQ2FzZTogZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgcmV0dXJuIChlcXYoeCwgMCkpO1xuICAgICAgICB9LFxuICAgICAgICAgIG9uWFNwZWNpYWxDYXNlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICAgIGlmIChlcXYoeSwgMCkpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiLzogZGl2aXNpb24gYnkgemVyb1wiLCB4LCB5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlzWVNwZWNpYWxDYXNlOiBmdW5jdGlvbih5KSB7XG4gICAgICAgICAgICByZXR1cm4gKGVxdih5LCAwKSk7IH0sXG4gICAgICAgICAgb25ZU3BlY2lhbENhc2U6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCIvOiBkaXZpc2lvbiBieSB6ZXJvXCIsIHgsIHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGVxdWFsczogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgZXF1YWxzID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHggPT09IHk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4LmVxdWFscyh5KTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIGVxdjogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgZXF2ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mKHgpID09PSAnbnVtYmVyJyAmJiB0eXBlb2YoeSkgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHggPT09IHk7XG4gICAgICAgIGlmICh4ID09PSBORUdBVElWRV9aRVJPIHx8IHkgPT09IE5FR0FUSVZFX1pFUk8pXG4gICAgICAgICAgICByZXR1cm4geCA9PT0geTtcbiAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBDb21wbGV4IHx8IHkgaW5zdGFuY2VvZiBDb21wbGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gKGVxdihyZWFsUGFydCh4KSwgcmVhbFBhcnQoeSkpICYmXG4gICAgICAgICAgICAgICAgICAgIGVxdihpbWFnaW5hcnlQYXJ0KHgpLCBpbWFnaW5hcnlQYXJ0KHkpKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGV4ID0gaXNFeGFjdCh4KSwgZXkgPSBpc0V4YWN0KHkpO1xuICAgICAgICByZXR1cm4gKCgoZXggJiYgZXkpIHx8ICghZXggJiYgIWV5KSkgJiYgZXF1YWxzKHgsIHkpKTtcbiAgICB9O1xuXG4gICAgLy8gYXBwcm94RXF1YWw6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgYXBwcm94RXF1YWxzID0gZnVuY3Rpb24oeCwgeSwgZGVsdGEpIHtcbiAgICAgICAgcmV0dXJuIGxlc3NUaGFuKGFicyhzdWJ0cmFjdCh4LCB5KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWx0YSk7XG4gICAgfTtcblxuICAgIC8vIGdyZWF0ZXJUaGFuT3JFcXVhbDogc2NoZW1lLW51bWJlciBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgZ3JlYXRlclRoYW5PckVxdWFsID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHggPj0geTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKCEoaXNSZWFsKHgpICYmIGlzUmVhbCh5KSkpXG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiPj06IGNvdWxkbid0IGJlIGFwcGxpZWQgdG8gY29tcGxleCBudW1iZXJcIiwgeCwgeSk7XG4gICAgICAgICAgICByZXR1cm4geC5ncmVhdGVyVGhhbk9yRXF1YWwoeSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBsZXNzVGhhbk9yRXF1YWw6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGxlc3NUaGFuT3JFcXVhbCA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpe1xuXG4gICAgICAgICAgICByZXR1cm4geCA8PSB5O1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1JlYWwoeCkgJiYgaXNSZWFsKHkpKSlcbiAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIjw9OiBjb3VsZG4ndCBiZSBhcHBsaWVkIHRvIGNvbXBsZXggbnVtYmVyXCIsIHgsIHkpO1xuICAgICAgICAgICAgcmV0dXJuIHgubGVzc1RoYW5PckVxdWFsKHkpO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gZ3JlYXRlclRoYW46IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGdyZWF0ZXJUaGFuID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSl7XG4gICAgICAgICAgICByZXR1cm4geCA+IHk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgIGlmICghKGlzUmVhbCh4KSAmJiBpc1JlYWwoeSkpKVxuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiPjogY291bGRuJ3QgYmUgYXBwbGllZCB0byBjb21wbGV4IG51bWJlclwiLCB4LCB5KTtcbiAgICAgICAgICAgIHJldHVybiB4LmdyZWF0ZXJUaGFuKHkpO1xuICAgICAgICB9KTtcblxuXG4gICAgLy8gbGVzc1RoYW46IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIGxlc3NUaGFuID0gbWFrZU51bWVyaWNCaW5vcChcbiAgICAgICAgZnVuY3Rpb24oeCwgeSl7XG5cbiAgICAgICAgICAgIHJldHVybiB4IDwgeTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKCEoaXNSZWFsKHgpICYmIGlzUmVhbCh5KSkpXG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI8OiBjb3VsZG4ndCBiZSBhcHBsaWVkIHRvIGNvbXBsZXggbnVtYmVyXCIsIHgsIHkpO1xuICAgICAgICAgICAgcmV0dXJuIHgubGVzc1RoYW4oeSk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgIC8vIGV4cHQ6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGV4cHQgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfZXhwdCA9IG1ha2VOdW1lcmljQmlub3AoXG4gICAgICAgICAgICBmdW5jdGlvbih4LCB5KXtcbiAgICAgICAgICAgICAgICB2YXIgcG93ID0gTWF0aC5wb3coeCwgeSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzT3ZlcmZsb3cocG93KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKG1ha2VCaWdudW0oeCkpLmV4cHQobWFrZUJpZ251bSh5KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgICAgIGlmIChlcXVhbHMoeSwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZCh5LCAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC5leHB0KHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgaWYgKGVxdWFscyh5LCAwKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkKHksIDEpO1xuICAgICAgICAgICAgaWYgKGlzUmVhbCh5KSAmJiBsZXNzVGhhbih5LCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfZXhwdChkaXZpZGUoMSwgeCksIG5lZ2F0ZSh5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX2V4cHQoeCwgeSk7XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuXG4gICAgLy8gZXhwOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgZXhwID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoIGVxdihuLCAwKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZXhwKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5leHAoKTtcbiAgICB9O1xuXG5cbiAgICAvLyBtb2R1bG86IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIG1vZHVsbyA9IGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKG0pKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignbW9kdWxvOiB0aGUgZmlyc3QgYXJndW1lbnQgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBtICsgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIG0sIG4pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghIGlzSW50ZWdlcihuKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ21vZHVsbzogdGhlIHNlY29uZCBhcmd1bWVudCAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIG4gKyBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgbSwgbik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKHR5cGVvZihtKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG0gJSBuO1xuICAgICAgICAgICAgaWYgKG4gPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA8PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArIG47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPCAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgbjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gX2ludGVnZXJNb2R1bG8oZmxvb3IobSksIGZsb29yKG4pKTtcbiAgICAgICAgLy8gVGhlIHNpZ24gb2YgdGhlIHJlc3VsdCBzaG91bGQgbWF0Y2ggdGhlIHNpZ24gb2Ygbi5cbiAgICAgICAgaWYgKGxlc3NUaGFuKG4sIDApKSB7XG4gICAgICAgICAgICBpZiAobGVzc1RoYW5PckVxdWFsKHJlc3VsdCwgMCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFkZChyZXN1bHQsIG4pO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobGVzc1RoYW4ocmVzdWx0LCAwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGQocmVzdWx0LCBuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIC8vIG51bWVyYXRvcjogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIG51bWVyYXRvciA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4ubnVtZXJhdG9yKCk7XG4gICAgfTtcblxuXG4gICAgLy8gZGVub21pbmF0b3I6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBkZW5vbWluYXRvciA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgcmV0dXJuIG4uZGVub21pbmF0b3IoKTtcbiAgICB9O1xuXG4gICAgLy8gc3FydDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIHNxcnQgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAobiA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IE1hdGguc3FydChuKTtcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5mbG9vcihyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoQ29tcGxleC5tYWtlSW5zdGFuY2UoMCwgc3FydCgtbikpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5zcXJ0KCk7XG4gICAgfTtcblxuICAgIC8vIGFiczogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGFicyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5hYnMoKTtcbiAgICB9O1xuXG4gICAgLy8gZmxvb3I6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBmbG9vciA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgcmV0dXJuIG4uZmxvb3IoKTtcbiAgICB9O1xuXG4gICAgLy8gY2VpbGluZzogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGNlaWxpbmcgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIHJldHVybiBuLmNlaWxpbmcoKTtcbiAgICB9O1xuXG4gICAgLy8gY29uanVnYXRlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgY29uanVnYXRlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICByZXR1cm4gbi5jb25qdWdhdGUoKTtcbiAgICB9O1xuXG4gICAgLy8gbWFnbml0dWRlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbWFnbml0dWRlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhuKTtcbiAgICAgICAgcmV0dXJuIG4ubWFnbml0dWRlKCk7XG4gICAgfTtcblxuXG4gICAgLy8gbG9nOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgbG9nID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoIGVxdihuLCAxKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgubG9nKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5sb2coKTtcbiAgICB9O1xuXG4gICAgLy8gYW5nbGU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhbmdsZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChuID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5waTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5hbmdsZSgpO1xuICAgIH07XG5cbiAgICAvLyB0YW46IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciB0YW4gPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmIChlcXYobiwgMCkpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnRhbihuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4udGFuKCk7XG4gICAgfTtcblxuICAgIC8vIGF0YW46IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBhdGFuID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDApKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hdGFuKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5hdGFuKCk7XG4gICAgfTtcblxuICAgIC8vIGNvczogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGNvcyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAwKSkgeyByZXR1cm4gMTsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguY29zKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5jb3MoKTtcbiAgICB9O1xuXG4gICAgLy8gc2luOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgc2luID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoZXF2KG4sIDApKSB7IHJldHVybiAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zaW4obikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLnNpbigpO1xuICAgIH07XG5cbiAgICAvLyBhY29zOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYWNvcyA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAxKSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYWNvcyhuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uYWNvcygpO1xuICAgIH07XG5cbiAgICAvLyBhc2luOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgYXNpbiA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKGVxdihuLCAwKSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYXNpbihuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4uYXNpbigpO1xuICAgIH07XG5cbiAgICAvLyBpbWFnaW5hcnlQYXJ0OiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgaW1hZ2luYXJ5UGFydCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLmltYWdpbmFyeVBhcnQoKTtcbiAgICB9O1xuXG4gICAgLy8gcmVhbFBhcnQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciByZWFsUGFydCA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuLnJlYWxQYXJ0KCk7XG4gICAgfTtcblxuICAgIC8vIHJvdW5kOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgcm91bmQgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbi5yb3VuZCgpO1xuICAgIH07XG5cblxuXG4gICAgLy8gc3FyOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICB2YXIgc3FyID0gZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHkoeCwgeCk7XG4gICAgfTtcblxuXG4gICAgLy8gaW50ZWdlclNxcnQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBpbnRlZ2VyU3FydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignaW50ZWdlci1zcXJ0OiB0aGUgYXJndW1lbnQgJyArIHgudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgeCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiAoeCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZih4IDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKE1hdGguc3FydCgteCkpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnNxcnQoeCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4LmludGVnZXJTcXJ0KCk7XG4gICAgfTtcblxuXG4gICAgLy8gZ2NkOiBzY2hlbWUtbnVtYmVyIFtzY2hlbWUtbnVtYmVyIC4uLl0gLT4gc2NoZW1lLW51bWJlclxuICAgIHZhciBnY2QgPSBmdW5jdGlvbihmaXJzdCwgcmVzdCkge1xuICAgICAgICBpZiAoISBpc0ludGVnZXIoZmlyc3QpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcignZ2NkOiB0aGUgYXJndW1lbnQgJyArIGZpcnN0LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIGZpcnN0KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYSA9IGFicyhmaXJzdCksIHQsIGI7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCByZXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBiID0gYWJzKHJlc3RbaV0pO1xuICAgICAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKGIpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ2djZDogdGhlIGFyZ3VtZW50ICcgKyBiLnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhbiBpbnRlZ2VyLlwiLCBiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICghIF9pbnRlZ2VySXNaZXJvKGIpKSB7XG4gICAgICAgICAgICAgICAgdCA9IGE7XG4gICAgICAgICAgICAgICAgYSA9IGI7XG4gICAgICAgICAgICAgICAgYiA9IF9pbnRlZ2VyTW9kdWxvKHQsIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG5cbiAgICAvLyBsY206IHNjaGVtZS1udW1iZXIgW3NjaGVtZS1udW1iZXIgLi4uXSAtPiBzY2hlbWUtbnVtYmVyXG4gICAgdmFyIGxjbSA9IGZ1bmN0aW9uKGZpcnN0LCByZXN0KSB7XG4gICAgICAgIGlmICghIGlzSW50ZWdlcihmaXJzdCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdsY206IHRoZSBhcmd1bWVudCAnICsgZmlyc3QudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgZmlyc3QpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSBhYnMoZmlyc3QpO1xuICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8ocmVzdWx0KSkgeyByZXR1cm4gMDsgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghIGlzSW50ZWdlcihyZXN0W2ldKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCdsY206IHRoZSBhcmd1bWVudCAnICsgcmVzdFtpXS50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgcmVzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZGl2aXNvciA9IF9pbnRlZ2VyR2NkKHJlc3VsdCwgcmVzdFtpXSk7XG4gICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oZGl2aXNvcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCA9IGRpdmlkZShtdWx0aXBseShyZXN1bHQsIHJlc3RbaV0pLCBkaXZpc29yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cblxuICAgIHZhciBxdW90aWVudCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgIGlmICghIGlzSW50ZWdlcih4KSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3F1b3RpZW50OiB0aGUgZmlyc3QgYXJndW1lbnQgJyArIHgudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgeCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHkpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigncXVvdGllbnQ6IHRoZSBzZWNvbmQgYXJndW1lbnQgJyArIHkudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyUXVvdGllbnQoeCwgeSk7XG4gICAgfTtcblxuXG4gICAgdmFyIHJlbWFpbmRlciA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigncmVtYWluZGVyOiB0aGUgZmlyc3QgYXJndW1lbnQgJyArIHgudG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIiwgeCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKHkpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcigncmVtYWluZGVyOiB0aGUgc2Vjb25kIGFyZ3VtZW50ICcgKyB5LnRvU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIsIHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfaW50ZWdlclJlbWFpbmRlcih4LCB5KTtcbiAgICB9O1xuXG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgaHlwZXJib2xpYyBmdW5jdGlvbnNcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0h5cGVyYm9saWNfY29zaW5lXG4gICAgdmFyIGNvc2ggPSBmdW5jdGlvbih4KSB7XG4gICAgICAgIGlmIChlcXYoeCwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSgxLjApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaXZpZGUoYWRkKGV4cCh4KSwgZXhwKG5lZ2F0ZSh4KSkpLFxuICAgICAgICAgICAgICAgICAgICAgIDIpO1xuICAgIH07XG5cbiAgICB2YXIgc2luaCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIGRpdmlkZShzdWJ0cmFjdChleHAoeCksIGV4cChuZWdhdGUoeCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAyKTtcbiAgICB9O1xuXG5cblxuICAgIHZhciBtYWtlQ29tcGxleFBvbGFyID0gZnVuY3Rpb24ociwgdGhldGEpIHtcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBpZiB0aGV0YSBpcyB6ZXJvLCBqdXN0IHJldHVyblxuICAgICAgICAvLyB0aGUgc2NhbGFyLlxuICAgICAgICBpZiAoZXF2KHRoZXRhLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKG11bHRpcGx5KHIsIGNvcyh0aGV0YSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbHkociwgc2luKHRoZXRhKSkpO1xuICAgIH07XG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gSGVscGVyc1xuXG5cbiAgICAvLyBJc0Zpbml0ZTogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBzY2hlbWUgbnVtYmVyIGlzIGZpbml0ZSBvciBub3QuXG4gICAgdmFyIGlzU2NoZW1lTnVtYmVyRmluaXRlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKG4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG4uaXNGaW5pdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBpc092ZXJmbG93OiBqYXZhc2NyaXB0LW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmIHdlIGNvbnNpZGVyIHRoZSBudW1iZXIgYW4gb3ZlcmZsb3cuXG4gICAgdmFyIE1JTl9GSVhOVU0gPSAtKDllMTUpO1xuICAgIHZhciBNQVhfRklYTlVNID0gKDllMTUpO1xuICAgIHZhciBpc092ZXJmbG93ID0gZnVuY3Rpb24obikge1xuICAgICAgICByZXR1cm4gKG4gPCBNSU5fRklYTlVNIHx8ICBNQVhfRklYTlVNIDwgbik7XG4gICAgfTtcblxuXG4gICAgLy8gbmVnYXRlOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBtdWx0aXBsaWVzIGEgbnVtYmVyIHRpbWVzIC0xLlxuICAgIHZhciBuZWdhdGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gLW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG4ubmVnYXRlKCk7XG4gICAgfTtcblxuXG4gICAgLy8gaGFsdmU6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIERpdmlkZSBhIG51bWJlciBieSAyLlxuICAgIHZhciBoYWx2ZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgcmV0dXJuIGRpdmlkZShuLCAyKTtcbiAgICB9O1xuXG5cbiAgICAvLyB0aW1lc0k6IHNjaGVtZS1udW1iZXIgc2NoZW1lLW51bWJlclxuICAgIC8vIG11bHRpcGxpZXMgYSBudW1iZXIgdGltZXMgaS5cbiAgICB2YXIgdGltZXNJID0gZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHkoeCwgcGx1c0kpO1xuICAgIH07XG5cblxuICAgIC8vIGZhc3RFeHB0OiBjb21wdXRlcyBuXmsgYnkgc3F1YXJpbmcuXG4gICAgLy8gbl5rID0gKG5eMileKGsvMilcbiAgICAvLyBBc3N1bWVzIGsgaXMgbm9uLW5lZ2F0aXZlIGludGVnZXIuXG4gICAgdmFyIGZhc3RFeHB0ID0gZnVuY3Rpb24obiwgaykge1xuICAgICAgICB2YXIgYWNjID0gMTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfaW50ZWdlcklzWmVybyhrKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXF1YWxzKG1vZHVsbyhrLCAyKSwgMCkpIHtcbiAgICAgICAgICAgICAgICBuID0gbXVsdGlwbHkobiwgbik7XG4gICAgICAgICAgICAgICAgayA9IGRpdmlkZShrLCAyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWNjID0gbXVsdGlwbHkoYWNjLCBuKTtcbiAgICAgICAgICAgICAgICBrID0gc3VidHJhY3QoaywgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuICAgIC8vIEludGVnZXIgb3BlcmF0aW9uc1xuICAgIC8vIEludGVnZXJzIGFyZSBlaXRoZXIgcmVwcmVzZW50ZWQgYXMgZml4bnVtcyBvciBhcyBCaWdJbnRlZ2Vycy5cblxuICAgIC8vIG1ha2VJbnRlZ2VyQmlub3A6IChmaXhudW0gZml4bnVtIC0+IFgpIChCaWdJbnRlZ2VyIEJpZ0ludGVnZXIgLT4gWCkgLT4gWFxuICAgIC8vIEhlbHBlciB0byBjb2xsZWN0IHRoZSBjb21tb24gbG9naWMgZm9yIGNvZXJzaW5nIGludGVnZXIgZml4bnVtcyBvciBiaWdudW1zIHRvIGFcbiAgICAvLyBjb21tb24gdHlwZSBiZWZvcmUgZG9pbmcgYW4gb3BlcmF0aW9uLlxuICAgIHZhciBtYWtlSW50ZWdlckJpbm9wID0gZnVuY3Rpb24ob25GaXhudW1zLCBvbkJpZ251bXMsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiBSYXRpb25hbCkge1xuICAgICAgICAgICAgICAgIG0gPSBudW1lcmF0b3IobSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG0gaW5zdGFuY2VvZiBDb21wbGV4KSB7XG4gICAgICAgICAgICAgICAgbSA9IHJlYWxQYXJ0KG0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIFJhdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgbiA9IG51bWVyYXRvcihuKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChuIGluc3RhbmNlb2YgQ29tcGxleCkge1xuICAgICAgICAgICAgICAgIG4gPSByZWFsUGFydChuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZihtKSA9PT0gJ251bWJlcicgJiYgdHlwZW9mKG4pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBvbkZpeG51bXMobSwgbik7XG4gICAgICAgICAgICAgICAgaWYgKCEgaXNPdmVyZmxvdyhyZXN1bHQpIHx8XG4gICAgICAgICAgICAgICAgICAgIChvcHRpb25zLmlnbm9yZU92ZXJmbG93KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgRmxvYXRQb2ludCB8fCBuIGluc3RhbmNlb2YgRmxvYXRQb2ludCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRvTm90Q29lcnNlVG9GbG9hdGluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb25GaXhudW1zKHRvRml4bnVtKG0pLCB0b0ZpeG51bShuKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpeG51bXModG9GaXhudW0obSksIHRvRml4bnVtKG4pKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZihtKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBtID0gbWFrZUJpZ251bShtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YobikgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgbiA9IG1ha2VCaWdudW0obik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb25CaWdudW1zKG0sIG4pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICB2YXIgbWFrZUludGVnZXJVbk9wID0gZnVuY3Rpb24ob25GaXhudW1zLCBvbkJpZ251bXMsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgaWYgKG0gaW5zdGFuY2VvZiBSYXRpb25hbCkge1xuICAgICAgICAgICAgICAgIG0gPSBudW1lcmF0b3IobSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG0gaW5zdGFuY2VvZiBDb21wbGV4KSB7XG4gICAgICAgICAgICAgICAgbSA9IHJlYWxQYXJ0KG0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mKG0pID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBvbkZpeG51bXMobSk7XG4gICAgICAgICAgICAgICAgaWYgKCEgaXNPdmVyZmxvdyhyZXN1bHQpIHx8XG4gICAgICAgICAgICAgICAgICAgIChvcHRpb25zLmlnbm9yZU92ZXJmbG93KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtIGluc3RhbmNlb2YgRmxvYXRQb2ludCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvbkZpeG51bXModG9GaXhudW0obSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZihtKSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBtID0gbWFrZUJpZ251bShtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvbkJpZ251bXMobSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgLy8gX2ludGVnZXJNb2R1bG86IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyTW9kdWxvID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gJSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5Nb2QuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIF9pbnRlZ2VyR2NkOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlckdjZCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciB0O1xuICAgICAgICAgICAgd2hpbGUgKGIgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0ID0gYTtcbiAgICAgICAgICAgICAgICBhID0gYjtcbiAgICAgICAgICAgICAgICBiID0gdCAlIGI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuR0NELmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAvLyBfaW50ZWdlcklzWmVybzogaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWYgdGhlIG51bWJlciBpcyB6ZXJvLlxuICAgIHZhciBfaW50ZWdlcklzWmVybyA9IG1ha2VJbnRlZ2VyVW5PcChcbiAgICAgICAgZnVuY3Rpb24obil7XG4gICAgICAgICAgICByZXR1cm4gbiA9PT0gMDtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIGJuRXF1YWxzLmNhbGwobiwgQmlnSW50ZWdlci5aRVJPKTtcbiAgICAgICAgfVxuICAgICk7XG5cblxuICAgIC8vIF9pbnRlZ2VySXNPbmU6IGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VySXNPbmUgPSBtYWtlSW50ZWdlclVuT3AoXG4gICAgICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBuID09PSAxO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5FcXVhbHMuY2FsbChuLCBCaWdJbnRlZ2VyLk9ORSk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgIC8vIF9pbnRlZ2VySXNOZWdhdGl2ZU9uZTogaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJJc05lZ2F0aXZlT25lID0gbWFrZUludGVnZXJVbk9wKFxuICAgICAgICBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gbiA9PT0gLTE7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkVxdWFscy5jYWxsKG4sIEJpZ0ludGVnZXIuTkVHQVRJVkVfT05FKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgLy8gX2ludGVnZXJBZGQ6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyQWRkID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gKyBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5BZGQuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBfaW50ZWdlclN1YnRyYWN0OiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlclN1YnRyYWN0ID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gLSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5TdWJ0cmFjdC5jYWxsKG0sIG4pO1xuICAgICAgICB9KTtcblxuICAgIC8vIF9pbnRlZ2VyTXVsdGlwbHk6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gaW50ZWdlci1zY2hlbWUtbnVtYmVyXG4gICAgdmFyIF9pbnRlZ2VyTXVsdGlwbHkgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSAqIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibk11bHRpcGx5LmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG4gICAgLy9faW50ZWdlclF1b3RpZW50OiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGludGVnZXItc2NoZW1lLW51bWJlclxuICAgIHZhciBfaW50ZWdlclF1b3RpZW50ID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuICgobSAtIChtICUgbikpLyBuKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIGJuRGl2aWRlLmNhbGwobSwgbik7XG4gICAgICAgIH0pO1xuXG4gICAgdmFyIF9pbnRlZ2VyUmVtYWluZGVyID0gbWFrZUludGVnZXJCaW5vcChcbiAgICAgICAgZnVuY3Rpb24obSwgbikge1xuICAgICAgICAgICAgcmV0dXJuIG0gJSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5SZW1haW5kZXIuY2FsbChtLCBuKTtcbiAgICAgICAgfSk7XG5cblxuICAgIC8vIF9pbnRlZ2VyRGl2aWRlVG9GaXhudW06IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gZml4bnVtXG4gICAgdmFyIF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0gPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSAvIG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiB0b0ZpeG51bShtKSAvIHRvRml4bnVtKG4pO1xuICAgICAgICB9LFxuICAgICAgICB7aWdub3JlT3ZlcmZsb3c6IHRydWUsXG4gICAgICAgICBkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuXG4gICAgLy8gX2ludGVnZXJFcXVhbHM6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlckVxdWFscyA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtID09PSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5FcXVhbHMuY2FsbChtLCBuKTtcbiAgICAgICAgfSxcbiAgICAgICAge2RvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG4gICAgLy8gX2ludGVnZXJHcmVhdGVyVGhhbjogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VyR3JlYXRlclRoYW4gPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSA+IG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkNvbXBhcmVUby5jYWxsKG0sIG4pID4gMDtcbiAgICAgICAgfSxcbiAgICAgICAge2RvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG4gICAgLy8gX2ludGVnZXJMZXNzVGhhbjogaW50ZWdlci1zY2hlbWUtbnVtYmVyIGludGVnZXItc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgdmFyIF9pbnRlZ2VyTGVzc1RoYW4gPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSA8IG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkNvbXBhcmVUby5jYWxsKG0sIG4pIDwgMDtcbiAgICAgICAgfSxcbiAgICAgICAge2RvTm90Q29lcnNlVG9GbG9hdGluZzogdHJ1ZX0pO1xuXG4gICAgLy8gX2ludGVnZXJHcmVhdGVyVGhhbk9yRXF1YWw6IGludGVnZXItc2NoZW1lLW51bWJlciBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIHZhciBfaW50ZWdlckdyZWF0ZXJUaGFuT3JFcXVhbCA9IG1ha2VJbnRlZ2VyQmlub3AoXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBtID49IG47XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKG0sIG4pIHtcbiAgICAgICAgICAgIHJldHVybiBibkNvbXBhcmVUby5jYWxsKG0sIG4pID49IDA7XG4gICAgICAgIH0sXG4gICAgICAgIHtkb05vdENvZXJzZVRvRmxvYXRpbmc6IHRydWV9KTtcblxuICAgIC8vIF9pbnRlZ2VyTGVzc1RoYW5PckVxdWFsOiBpbnRlZ2VyLXNjaGVtZS1udW1iZXIgaW50ZWdlci1zY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICB2YXIgX2ludGVnZXJMZXNzVGhhbk9yRXF1YWwgPSBtYWtlSW50ZWdlckJpbm9wKFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gbSA8PSBuO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihtLCBuKSB7XG4gICAgICAgICAgICByZXR1cm4gYm5Db21wYXJlVG8uY2FsbChtLCBuKSA8PSAwO1xuICAgICAgICB9LFxuICAgICAgICB7ZG9Ob3RDb2Vyc2VUb0Zsb2F0aW5nOiB0cnVlfSk7XG5cblxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFRoZSBib3hlZCBudW1iZXIgdHlwZXMgYXJlIGV4cGVjdGVkIHRvIGltcGxlbWVudCB0aGUgZm9sbG93aW5nXG4gICAgLy8gaW50ZXJmYWNlLlxuICAgIC8vXG4gICAgLy8gdG9TdHJpbmc6IC0+IHN0cmluZ1xuXG4gICAgLy8gbGV2ZWw6IG51bWJlclxuXG4gICAgLy8gbGlmdFRvOiBzY2hlbWUtbnVtYmVyIC0+IHNjaGVtZS1udW1iZXJcblxuICAgIC8vIGlzRmluaXRlOiAtPiBib29sZWFuXG5cbiAgICAvLyBpc0ludGVnZXI6IC0+IGJvb2xlYW5cbiAgICAvLyBQcm9kdWNlIHRydWUgaWYgdGhpcyBudW1iZXIgY2FuIGJlIGNvZXJzZWQgaW50byBhbiBpbnRlZ2VyLlxuXG4gICAgLy8gaXNSYXRpb25hbDogLT4gYm9vbGVhblxuICAgIC8vIFByb2R1Y2UgdHJ1ZSBpZiB0aGUgbnVtYmVyIGlzIHJhdGlvbmFsLlxuXG4gICAgLy8gaXNSZWFsOiAtPiBib29sZWFuXG4gICAgLy8gUHJvZHVjZSB0cnVlIGlmIHRoZSBudW1iZXIgaXMgcmVhbC5cblxuICAgIC8vIGlzRXhhY3Q6IC0+IGJvb2xlYW5cbiAgICAvLyBQcm9kdWNlIHRydWUgaWYgdGhlIG51bWJlciBpcyBleGFjdFxuXG4gICAgLy8gdG9FeGFjdDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgYW4gZXhhY3QgbnVtYmVyLlxuXG4gICAgLy8gdG9GaXhudW06IC0+IGphdmFzY3JpcHQtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSBhIGphdmFzY3JpcHQgbnVtYmVyLlxuXG4gICAgLy8gZ3JlYXRlclRoYW46IHNjaGVtZS1udW1iZXIgLT4gYm9vbGVhblxuICAgIC8vIENvbXBhcmUgYWdhaW5zdCBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gZ3JlYXRlclRoYW5PckVxdWFsOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBDb21wYXJlIGFnYWluc3QgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIGxlc3NUaGFuOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBDb21wYXJlIGFnYWluc3QgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIGxlc3NUaGFuT3JFcXVhbDogc2NoZW1lLW51bWJlciAtPiBib29sZWFuXG4gICAgLy8gQ29tcGFyZSBhZ2FpbnN0IGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBhZGQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIEFkZCB3aXRoIGFuIGluc3RhbmNlIG9mIHRoZSBzYW1lIHR5cGUuXG5cbiAgICAvLyBzdWJ0cmFjdDogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gU3VidHJhY3Qgd2l0aCBhbiBpbnN0YW5jZSBvZiB0aGUgc2FtZSB0eXBlLlxuXG4gICAgLy8gbXVsdGlwbHk6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIE11bHRpcGx5IHdpdGggYW4gaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIGRpdmlkZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gRGl2aWRlIHdpdGggYW4gaW5zdGFuY2Ugb2YgdGhlIHNhbWUgdHlwZS5cblxuICAgIC8vIG51bWVyYXRvcjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFJldHVybiB0aGUgbnVtZXJhdG9yLlxuXG4gICAgLy8gZGVub21pbmF0b3I6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBSZXR1cm4gdGhlIGRlbm9taW5hdG9yLlxuXG4gICAgLy8gaW50ZWdlclNxcnQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBpbnRlZ2VyIHNxdWFyZSByb290LlxuXG4gICAgLy8gc3FydDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHNxdWFyZSByb290LlxuXG4gICAgLy8gYWJzOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYWJzb2x1dGUgdmFsdWUuXG5cbiAgICAvLyBmbG9vcjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGZsb29yLlxuXG4gICAgLy8gY2VpbGluZzogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNlaWxpbmcuXG5cbiAgICAvLyBjb25qdWdhdGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBjb25qdWdhdGUuXG5cbiAgICAvLyBtYWduaXR1ZGU6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBtYWduaXR1ZGUuXG5cbiAgICAvLyBsb2c6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBsb2cuXG5cbiAgICAvLyBhbmdsZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFuZ2xlLlxuXG4gICAgLy8gYXRhbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyB0YW5nZW50LlxuXG4gICAgLy8gY29zOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgY29zaW5lLlxuXG4gICAgLy8gc2luOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgc2luZS5cblxuICAgIC8vIGV4cHQ6IHNjaGVtZS1udW1iZXIgLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHBvd2VyIHRvIHRoZSBpbnB1dC5cblxuICAgIC8vIGV4cDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgZSByYWlzZWQgdG8gdGhlIGdpdmVuIHBvd2VyLlxuXG4gICAgLy8gYWNvczogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyBjb3NpbmUuXG5cbiAgICAvLyBhc2luOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIHNpbmUuXG5cbiAgICAvLyBpbWFnaW5hcnlQYXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgaW1hZ2luYXJ5IHBhcnRcblxuICAgIC8vIHJlYWxQYXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgcmVhbCBwYXJ0LlxuXG4gICAgLy8gcm91bmQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBSb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLlxuXG4gICAgLy8gZXF1YWxzOiBzY2hlbWUtbnVtYmVyIC0+IGJvb2xlYW5cbiAgICAvLyBQcm9kdWNlIHRydWUgaWYgdGhlIGdpdmVuIG51bWJlciBvZiB0aGUgc2FtZSB0eXBlIGlzIGVxdWFsLlxuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIFJhdGlvbmFsc1xuXG5cbiAgICB2YXIgUmF0aW9uYWwgPSBmdW5jdGlvbihuLCBkKSB7XG4gICAgICAgIHRoaXMubiA9IG47XG4gICAgICAgIHRoaXMuZCA9IGQ7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfaW50ZWdlcklzT25lKHRoaXMuZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm4udG9TdHJpbmcoKSArIFwiXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uLnRvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuZC50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmxldmVsID0gMTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmxpZnRUbyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0LmxldmVsID09PSAyKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdFBvaW50KFxuICAgICAgICAgICAgICAgIF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKTtcbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMylcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGxleCh0aGlzLCAwKTtcbiAgICAgICAgcmV0dXJuIHRocm93UnVudGltZUVycm9yKFwiaW52YWxpZCBsZXZlbCBvZiBOdW1iZXJcIiwgdGhpcywgdGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzRmluaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIChvdGhlciBpbnN0YW5jZW9mIFJhdGlvbmFsICYmXG4gICAgICAgICAgICAgICAgX2ludGVnZXJFcXVhbHModGhpcy5uLCBvdGhlci5uKSAmJlxuICAgICAgICAgICAgICAgIF9pbnRlZ2VyRXF1YWxzKHRoaXMuZCwgb3RoZXIuZCkpO1xuICAgIH07XG5cblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzSW50ZWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2ludGVnZXJJc09uZSh0aGlzLmQpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNSYXRpb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzUmVhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShfaW50ZWdlckFkZChfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIuZCkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKF9pbnRlZ2VyU3VidHJhY3QoX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIuZCkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UoLXRoaXMubiwgdGhpcy5kKVxuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIuZCkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHRoaXMuZCkgfHwgX2ludGVnZXJJc1plcm8ob3RoZXIubikpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiLzogZGl2aXNpb24gYnkgemVyb1wiLCB0aGlzLCBvdGhlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKTtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUudG9FeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnRvSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy50b0ZpeG51bSgpKTtcbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaXNFeGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmlzSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnRvRml4bnVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLm51bWVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZGVub21pbmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZDtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyR3JlYXRlclRoYW4oX2ludGVnZXJNdWx0aXBseSh0aGlzLm4sIG90aGVyLmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF9pbnRlZ2VyR3JlYXRlclRoYW5PckVxdWFsKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5kLCBvdGhlci5uKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlckxlc3NUaGFuKF9pbnRlZ2VyTXVsdGlwbHkodGhpcy5uLCBvdGhlci5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2ludGVnZXJNdWx0aXBseSh0aGlzLmQsIG90aGVyLm4pKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfaW50ZWdlckxlc3NUaGFuT3JFcXVhbChfaW50ZWdlck11bHRpcGx5KHRoaXMubiwgb3RoZXIuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlck11bHRpcGx5KHRoaXMuZCwgb3RoZXIubikpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuaW50ZWdlclNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHNxcnQodGhpcyk7XG4gICAgICAgIGlmIChpc1JhdGlvbmFsKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0b0V4YWN0KGZsb29yKHJlc3VsdCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVhbChyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9FeGFjdChmbG9vcihyZXN1bHQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSh0b0V4YWN0KGZsb29yKHJlYWxQYXJ0KHJlc3VsdCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b0V4YWN0KGZsb29yKGltYWdpbmFyeVBhcnQocmVzdWx0KSkpKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5zcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfaW50ZWdlckdyZWF0ZXJUaGFuT3JFcXVhbCh0aGlzLm4sICAwKSkge1xuICAgICAgICAgICAgdmFyIG5ld04gPSBzcXJ0KHRoaXMubik7XG4gICAgICAgICAgICB2YXIgbmV3RCA9IHNxcnQodGhpcy5kKTtcbiAgICAgICAgICAgIGlmIChlcXVhbHMoZmxvb3IobmV3TiksIG5ld04pICYmXG4gICAgICAgICAgICAgICAgZXF1YWxzKGZsb29yKG5ld0QpLCBuZXdEKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBSYXRpb25hbC5tYWtlSW5zdGFuY2UobmV3TiwgbmV3RCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShfaW50ZWdlckRpdmlkZVRvRml4bnVtKG5ld04sIG5ld0QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBuZXdOID0gc3FydChuZWdhdGUodGhpcy5uKSk7XG4gICAgICAgICAgICB2YXIgbmV3RCA9IHNxcnQodGhpcy5kKTtcbiAgICAgICAgICAgIGlmIChlcXVhbHMoZmxvb3IobmV3TiksIG5ld04pICYmXG4gICAgICAgICAgICAgICAgZXF1YWxzKGZsb29yKG5ld0QpLCBuZXdEKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgUmF0aW9uYWwubWFrZUluc3RhbmNlKG5ld04sIG5ld0QpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShfaW50ZWdlckRpdmlkZVRvRml4bnVtKG5ld04sIG5ld0QpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKGFicyh0aGlzLm4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZCk7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmZsb29yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBxdW90aWVudCA9IF9pbnRlZ2VyUXVvdGllbnQodGhpcy5uLCB0aGlzLmQpO1xuICAgICAgICBpZiAoX2ludGVnZXJMZXNzVGhhbih0aGlzLm4sIDApKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VidHJhY3QocXVvdGllbnQsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RpZW50O1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmNlaWxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHF1b3RpZW50ID0gX2ludGVnZXJRdW90aWVudCh0aGlzLm4sIHRoaXMuZCk7XG4gICAgICAgIGlmIChfaW50ZWdlckxlc3NUaGFuKHRoaXMubiwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90aWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhZGQocXVvdGllbnQsIDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5tYWduaXR1ZGUgPSBSYXRpb25hbC5wcm90b3R5cGUuYWJzO1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmxvZyh0aGlzLm4gLyB0aGlzLmQpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmFuZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKF9pbnRlZ2VySXNaZXJvKHRoaXMubikpXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgaWYgKF9pbnRlZ2VyR3JlYXRlclRoYW4odGhpcy5uLCAwKSlcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5waTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnRhbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnRhbihfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYXRhbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmF0YW4oX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmNvcyhfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc2luKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5leHB0ID0gZnVuY3Rpb24oYSl7XG4gICAgICAgIGlmIChpc0V4YWN0SW50ZWdlcihhKSAmJiBncmVhdGVyVGhhbk9yRXF1YWwoYSwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYXN0RXhwdCh0aGlzLCBhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5wb3coX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW50ZWdlckRpdmlkZVRvRml4bnVtKGEubiwgYS5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuZXhwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZXhwKF9pbnRlZ2VyRGl2aWRlVG9GaXhudW0odGhpcy5uLCB0aGlzLmQpKSk7XG4gICAgfTtcblxuICAgIFJhdGlvbmFsLnByb3RvdHlwZS5hY29zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguYWNvcyhfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKSkpO1xuICAgIH07XG5cbiAgICBSYXRpb25hbC5wcm90b3R5cGUuYXNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFzaW4oX2ludGVnZXJEaXZpZGVUb0ZpeG51bSh0aGlzLm4sIHRoaXMuZCkpKTtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLmltYWdpbmFyeVBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnJlYWxQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuXG4gICAgUmF0aW9uYWwucHJvdG90eXBlLnJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEZJWE1FOiBub3QgY29ycmVjdCB3aGVuIHZhbHVlcyBhcmUgYmlnbnVtc1xuICAgICAgICBpZiAoZXF1YWxzKHRoaXMuZCwgMikpIHtcbiAgICAgICAgICAgIC8vIFJvdW5kIHRvIGV2ZW4gaWYgaXQncyBhIG4vMlxuICAgICAgICAgICAgdmFyIHYgPSBfaW50ZWdlckRpdmlkZVRvRml4bnVtKHRoaXMubiwgdGhpcy5kKTtcbiAgICAgICAgICAgIHZhciBmbCA9IE1hdGguZmxvb3Iodik7XG4gICAgICAgICAgICB2YXIgY2UgPSBNYXRoLmNlaWwodik7XG4gICAgICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oZmwgJSAyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMubiAvIHRoaXMuZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBSYXRpb25hbC5tYWtlSW5zdGFuY2UgPSBmdW5jdGlvbihuLCBkKSB7XG4gICAgICAgIGlmIChuID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIm4gdW5kZWZpbmVkXCIsIG4sIGQpO1xuXG4gICAgICAgIGlmIChkID09PSB1bmRlZmluZWQpIHsgZCA9IDE7IH1cblxuICAgICAgICBpZiAoX2ludGVnZXJJc1plcm8oZCkpIHtcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiZGl2aXNpb24gYnkgemVybzogXCIrbitcIi9cIitkKTtcbiAgICAgICAgfVxuXG4gIGlmIChfaW50ZWdlckxlc3NUaGFuKGQsIDApKSB7XG4gICAgICAgICAgICBuID0gbmVnYXRlKG4pO1xuICAgICAgICAgICAgZCA9IG5lZ2F0ZShkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaXZpc29yID0gX2ludGVnZXJHY2QoYWJzKG4pLCBhYnMoZCkpO1xuICAgICAgICBuID0gX2ludGVnZXJRdW90aWVudChuLCBkaXZpc29yKTtcbiAgICAgICAgZCA9IF9pbnRlZ2VyUXVvdGllbnQoZCwgZGl2aXNvcik7XG5cbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBpZiB3ZSBjYW4gZ2V0IGFyb3VuZCBjb25zdHJ1Y3Rpb24gdGhlIHJhdGlvbmFsXG4gICAgICAgIC8vIGluIGZhdm9yIG9mIGp1c3QgcmV0dXJuaW5nIG4sIGRvIGl0OlxuICAgICAgICBpZiAoX2ludGVnZXJJc09uZShkKSB8fCBfaW50ZWdlcklzWmVybyhuKSkge1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFJhdGlvbmFsKG4sIGQpO1xuICAgIH07XG5cblxuXG4gICAgLy8gRmxvYXRpbmcgUG9pbnQgbnVtYmVyc1xuICAgIHZhciBGbG9hdFBvaW50ID0gZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLm4gPSBuO1xuICAgIH07XG4gICAgRmxvYXRQb2ludCA9IEZsb2F0UG9pbnQ7XG5cblxuICAgIHZhciBOYU4gPSBuZXcgRmxvYXRQb2ludChOdW1iZXIuTmFOKTtcbiAgICB2YXIgaW5mID0gbmV3IEZsb2F0UG9pbnQoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKTtcbiAgICB2YXIgbmVnaW5mID0gbmV3IEZsb2F0UG9pbnQoTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcblxuICAgIC8vIFdlIHVzZSB0aGVzZSB0d28gY29uc3RhbnRzIHRvIHJlcHJlc2VudCB0aGUgZmxvYXRpbmctcG9pbnQgY29lcnNpb25cbiAgICAvLyBvZiBiaWdudW1zIHRoYXQgY2FuJ3QgYmUgcmVwcmVzZW50ZWQgd2l0aCBmaWRlbGl0eS5cbiAgICB2YXIgVE9PX1BPU0lUSVZFX1RPX1JFUFJFU0VOVCA9IG5ldyBGbG9hdFBvaW50KE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XG4gICAgdmFyIFRPT19ORUdBVElWRV9UT19SRVBSRVNFTlQgPSBuZXcgRmxvYXRQb2ludChOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xuXG4gICAgLy8gTmVnYXRpdmUgemVybyBpcyBhIGRpc3Rpbmd1aXNoZWQgdmFsdWUgcmVwcmVzZW50aW5nIC0wLjAuXG4gICAgLy8gVGhlcmUgc2hvdWxkIG9ubHkgYmUgb25lIGluc3RhbmNlIGZvciAtMC4wLlxuICAgIHZhciBORUdBVElWRV9aRVJPID0gbmV3IEZsb2F0UG9pbnQoLTAuMCk7XG4gICAgdmFyIElORVhBQ1RfWkVSTyA9IG5ldyBGbG9hdFBvaW50KDAuMCk7XG5cbiAgICBGbG9hdFBvaW50LnBpID0gbmV3IEZsb2F0UG9pbnQoTWF0aC5QSSk7XG4gICAgRmxvYXRQb2ludC5lID0gbmV3IEZsb2F0UG9pbnQoTWF0aC5FKTtcbiAgICBGbG9hdFBvaW50Lm5hbiA9IE5hTjtcbiAgICBGbG9hdFBvaW50LmluZiA9IGluZjtcbiAgICBGbG9hdFBvaW50Lm5lZ2luZiA9IG5lZ2luZjtcblxuICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAoaXNOYU4obikpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm5hbjtcbiAgICAgICAgfSBlbHNlIGlmIChuID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50LmluZjtcbiAgICAgICAgfSBlbHNlIGlmIChuID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm5lZ2luZjtcbiAgICAgICAgfSBlbHNlIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoKDEvbikgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBORUdBVElWRV9aRVJPO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5FWEFDVF9aRVJPO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRmxvYXRQb2ludChuKTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNJbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzRmluaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAoaXNGaW5pdGUodGhpcy5uKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMgPT09IFRPT19QT1NJVElWRV9UT19SRVBSRVNFTlQgfHxcbiAgICAgICAgICAgICAgICB0aGlzID09PSBUT09fTkVHQVRJVkVfVE9fUkVQUkVTRU5UKTtcbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS50b0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFRoZSBwcmVjaXNpb24gb2YgaWVlZSBpcyBhYm91dCAxNiBkZWNpbWFsIGRpZ2l0cywgd2hpY2ggd2UgdXNlIGhlcmUuXG4gICAgICAgIGlmICghIGlzRmluaXRlKHRoaXMubikgfHwgaXNOYU4odGhpcy5uKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJ0b0V4YWN0OiBubyBleGFjdCByZXByZXNlbnRhdGlvbiBmb3IgXCIgKyB0aGlzLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHJpbmdSZXAgPSB0aGlzLm4udG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIG1hdGNoID0gc3RyaW5nUmVwLm1hdGNoKC9eKC4qKVxcLiguKikkLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgdmFyIGludFBhcnQgPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgICAgICB2YXIgZnJhY1BhcnQgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICB2YXIgdGVuVG9EZWNpbWFsUGxhY2VzID0gTWF0aC5wb3coMTAsIG1hdGNoWzJdLmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKE1hdGgucm91bmQodGhpcy5uICogdGVuVG9EZWNpbWFsUGxhY2VzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuVG9EZWNpbWFsUGxhY2VzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm47XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUudG9JbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pc0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubGV2ZWwgPSAyO1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5saWZ0VG8gPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMylcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGxleCh0aGlzLCAwKTtcbiAgICAgICAgcmV0dXJuIHRocm93UnVudGltZUVycm9yKFwiaW52YWxpZCBsZXZlbCBvZiBOdW1iZXJcIiwgdGhpcywgdGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMubikpXG4gICAgICAgICAgICByZXR1cm4gXCIrbmFuLjBcIjtcbiAgICAgICAgaWYgKHRoaXMubiA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICAgICAgICAgICAgcmV0dXJuIFwiK2luZi4wXCI7XG4gICAgICAgIGlmICh0aGlzLm4gPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgICAgICAgICAgIHJldHVybiBcIi1pbmYuMFwiO1xuICAgICAgICBpZiAodGhpcyA9PT0gTkVHQVRJVkVfWkVSTylcbiAgICAgICAgICAgIHJldHVybiBcIi0wLjBcIjtcbiAgICAgICAgdmFyIHBhcnRpYWxSZXN1bHQgPSB0aGlzLm4udG9TdHJpbmcoKTtcbiAgICAgICAgaWYgKCEgcGFydGlhbFJlc3VsdC5tYXRjaCgnXFxcXC4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRpYWxSZXN1bHQgKyBcIi4wXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydGlhbFJlc3VsdDtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyLCBhVW5pb25GaW5kKSB7XG4gICAgICAgIHJldHVybiAoKG90aGVyIGluc3RhbmNlb2YgRmxvYXRQb2ludCkgJiZcbiAgICAgICAgICAgICAgICAoKHRoaXMubiA9PT0gb3RoZXIubikpKTtcbiAgICB9O1xuXG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzUmF0aW9uYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGaW5pdGUoKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuaXNJbnRlZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRmluaXRlKCkgJiYgdGhpcy5uID09PSBNYXRoLmZsb29yKHRoaXMubik7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmlzUmVhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG5cbiAgICAvLyBzaWduOiBOdW1iZXIgLT4gey0xLCAwLCAxfVxuICAgIHZhciBzaWduID0gZnVuY3Rpb24obikge1xuICAgICAgICBpZiAobGVzc1RoYW4obiwgMCkpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChncmVhdGVyVGhhbihuLCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAobiA9PT0gTkVHQVRJVkVfWkVSTykge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5pc0Zpbml0ZSgpICYmIG90aGVyLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZSh0aGlzLm4gKyBvdGhlci5uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLm4pIHx8IGlzTmFOKG90aGVyLm4pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0Zpbml0ZSgpICYmICEgb3RoZXIuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvdGhlcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNGaW5pdGUoKSAmJiBvdGhlci5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoKHNpZ24odGhpcykgKiBzaWduKG90aGVyKSA9PT0gMSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyA6IE5hTik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNGaW5pdGUoKSAmJiBvdGhlci5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy5uIC0gb3RoZXIubik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNOYU4odGhpcy5uKSB8fCBpc05hTihvdGhlci5uKSkge1xuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICAgICAgfSBlbHNlIGlmICghIHRoaXMuaXNGaW5pdGUoKSAmJiAhIG90aGVyLmlzRmluaXRlKCkpIHtcbiAgICAgICAgICAgIGlmIChzaWduKHRoaXMpID09PSBzaWduKG90aGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNGaW5pdGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG11bHRpcGx5KG90aGVyLCAtMSk7XG4gICAgICAgIH0gZWxzZSB7ICAvLyBvdGhlci5pc0Zpbml0ZSgpXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoLXRoaXMubik7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMubiAqIG90aGVyLm4pO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UodGhpcy5uIC8gb3RoZXIubik7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUudG9GaXhudW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubjtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubnVtZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdHJpbmdSZXAgPSB0aGlzLm4udG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIG1hdGNoID0gc3RyaW5nUmVwLm1hdGNoKC9eKC4qKVxcLiguKikkLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgdmFyIGFmdGVyRGVjaW1hbCA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgIHZhciBmYWN0b3JUb0ludCA9IE1hdGgucG93KDEwLCBtYXRjaFsyXS5sZW5ndGgpO1xuICAgICAgICAgICAgdmFyIGV4dHJhRmFjdG9yID0gX2ludGVnZXJHY2QoZmFjdG9yVG9JbnQsIGFmdGVyRGVjaW1hbCk7XG4gICAgICAgICAgICB2YXIgbXVsdEZhY3RvciA9IGZhY3RvclRvSW50IC8gZXh0cmFGYWN0b3I7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoIE1hdGgucm91bmQodGhpcy5uICogbXVsdEZhY3RvcikgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmRlbm9taW5hdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdHJpbmdSZXAgPSB0aGlzLm4udG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIG1hdGNoID0gc3RyaW5nUmVwLm1hdGNoKC9eKC4qKVxcLiguKikkLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgdmFyIGFmdGVyRGVjaW1hbCA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgIHZhciBmYWN0b3JUb0ludCA9IE1hdGgucG93KDEwLCBtYXRjaFsyXS5sZW5ndGgpO1xuICAgICAgICAgICAgdmFyIGV4dHJhRmFjdG9yID0gX2ludGVnZXJHY2QoZmFjdG9yVG9JbnQsIGFmdGVyRGVjaW1hbCk7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoIE1hdGgucm91bmQoZmFjdG9yVG9JbnQvZXh0cmFGYWN0b3IpICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoMSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5mbG9vciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5mbG9vcih0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuY2VpbGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5jZWlsKHRoaXMubikpO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubiA+IG90aGVyLm47XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm4gPj0gb3RoZXIubjtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5uIDwgb3RoZXIubjtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubiA8PSBvdGhlci5uO1xuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmludGVnZXJTcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzID09PSBORUdBVElWRV9aRVJPKSB7IHJldHVybiB0aGlzOyB9XG4gICAgICAgIGlmIChpc0ludGVnZXIodGhpcykpIHtcbiAgICAgICAgICAgIGlmKHRoaXMubiA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZmxvb3IoTWF0aC5zcXJ0KHRoaXMubikpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgICAgICBJTkVYQUNUX1pFUk8sXG4gICAgICAgICAgICAgICAgICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZmxvb3IoTWF0aC5zcXJ0KC10aGlzLm4pKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJpbnRlZ2VyU3FydDogY2FuIG9ubHkgYmUgYXBwbGllZCB0byBhbiBpbnRlZ2VyXCIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMubiA8IDApIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguc3FydCgtdGhpcy5uKSkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNxcnQodGhpcy5uKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFicyh0aGlzLm4pKTtcbiAgICB9O1xuXG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLm4gPCAwKVxuICAgICAgICAgICAgcmV0dXJuIChuZXcgQ29tcGxleCh0aGlzLCAwKSkubG9nKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmxvZyh0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYW5nbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoMCA9PT0gdGhpcy5uKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0aGlzLm4gPiAwKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50LnBpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS50YW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC50YW4odGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmF0YW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hdGFuKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5jb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5jb3ModGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNpbih0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuZXhwdCA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICBpZiAodGhpcy5uID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoYS5pc0Zpbml0ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKGEubikpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnBvdyh0aGlzLm4sIGEubikpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmV4cCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmV4cCh0aGlzLm4pKTtcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUuYWNvcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLmFjb3ModGhpcy5uKSk7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmFzaW4gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5hc2luKHRoaXMubikpO1xuICAgIH07XG5cbiAgICBGbG9hdFBvaW50LnByb3RvdHlwZS5pbWFnaW5hcnlQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfTtcblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLnJlYWxQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUucm91bmQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAoaXNGaW5pdGUodGhpcy5uKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMgPT09IE5FR0FUSVZFX1pFUk8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhNYXRoLmZsb29yKHRoaXMubikgLSB0aGlzLm4pID09PSAwLjUpIHtcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5mbG9vcih0aGlzLm4pICUgMiA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguZmxvb3IodGhpcy5uKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGguY2VpbCh0aGlzLm4pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKE1hdGgucm91bmQodGhpcy5uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIEZsb2F0UG9pbnQucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRmxvYXRQb2ludC5wcm90b3R5cGUubWFnbml0dWRlID0gRmxvYXRQb2ludC5wcm90b3R5cGUuYWJzO1xuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDb21wbGV4IG51bWJlcnNcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICB2YXIgQ29tcGxleCA9IGZ1bmN0aW9uKHIsIGkpe1xuICAgICAgICB0aGlzLnIgPSByO1xuICAgICAgICB0aGlzLmkgPSBpO1xuICAgIH07XG5cbiAgICAvLyBDb25zdHJ1Y3RzIGEgY29tcGxleCBudW1iZXIgZnJvbSB0d28gYmFzaWMgbnVtYmVyIHIgYW5kIGkuICByIGFuZCBpIGNhblxuICAgIC8vIGVpdGhlciBiZSBwbHQudHlwZS5SYXRpb25hbCBvciBwbHQudHlwZS5GbG9hdFBvaW50LlxuICAgIENvbXBsZXgubWFrZUluc3RhbmNlID0gZnVuY3Rpb24ociwgaSl7XG4gICAgICAgIGlmIChpID09PSB1bmRlZmluZWQpIHsgaSA9IDA7IH1cbiAgICAgICAgaWYgKGlzRXhhY3QoaSkgJiYgaXNJbnRlZ2VyKGkpICYmIF9pbnRlZ2VySXNaZXJvKGkpKSB7XG4gICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNJbmV4YWN0KHIpIHx8IGlzSW5leGFjdChpKSkge1xuICAgICAgICAgICAgciA9IHRvSW5leGFjdChyKTtcbiAgICAgICAgICAgIGkgPSB0b0luZXhhY3QoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDb21wbGV4KHIsIGkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVhbFBhcnQgPSB0aGlzLnIudG9TdHJpbmcoKSwgaW1hZ1BhcnQgPSB0aGlzLmkudG9TdHJpbmcoKTtcbiAgICAgICAgaWYgKGltYWdQYXJ0WzBdID09PSAnLScgfHwgaW1hZ1BhcnRbMF0gPT09ICcrJykge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWxQYXJ0ICsgaW1hZ1BhcnQgKyAnaSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcmVhbFBhcnQgKyBcIitcIiArIGltYWdQYXJ0ICsgJ2knO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuaXNGaW5pdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGlzU2NoZW1lTnVtYmVyRmluaXRlKHRoaXMucikgJiYgaXNTY2hlbWVOdW1iZXJGaW5pdGUodGhpcy5pKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc1JhdGlvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc1JhdGlvbmFsKHRoaXMucikgJiYgZXF2KHRoaXMuaSwgMCk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzSW50ZWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKGlzSW50ZWdlcih0aGlzLnIpICYmXG4gICAgICAgICAgICAgICAgZXF2KHRoaXMuaSwgMCkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS50b0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSggdG9FeGFjdCh0aGlzLnIpLCB0b0V4YWN0KHRoaXMuaSkgKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUudG9JbmV4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSh0b0luZXhhY3QodGhpcy5yKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvSW5leGFjdCh0aGlzLmkpKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpc0V4YWN0KHRoaXMucikgJiYgaXNFeGFjdCh0aGlzLmkpO1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmlzSW5leGFjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNJbmV4YWN0KHRoaXMucikgfHwgaXNJbmV4YWN0KHRoaXMuaSk7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubGV2ZWwgPSAzO1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5saWZ0VG8gPSBmdW5jdGlvbih0YXJnZXQpe1xuICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIkRvbid0IGtub3cgaG93IHRvIGxpZnQgQ29tcGxleCBudW1iZXJcIiwgdGhpcywgdGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICgob3RoZXIgaW5zdGFuY2VvZiBDb21wbGV4KSAmJlxuICAgICAgICAgICAgICAgICAgICAgIChlcXVhbHModGhpcy5yLCBvdGhlci5yKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAoZXF1YWxzKHRoaXMuaSwgb3RoZXIuaSkpKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKCEgdGhpcy5pc1JlYWwoKSB8fCAhIG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIj46IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzLCBvdGhlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdyZWF0ZXJUaGFuKHRoaXMuciwgb3RoZXIucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICghIHRoaXMuaXNSZWFsKCkgfHwgISBvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI+PTogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JlYXRlclRoYW5PckVxdWFsKHRoaXMuciwgb3RoZXIucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgaWYgKCEgdGhpcy5pc1JlYWwoKSB8fCAhIG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcIjw6IGV4cGVjdHMgYXJndW1lbnQgb2YgdHlwZSByZWFsIG51bWJlclwiLCB0aGlzLCBvdGhlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlc3NUaGFuKHRoaXMuciwgb3RoZXIucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIGlmICghIHRoaXMuaXNSZWFsKCkgfHwgISBvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCI8PTogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVzc1RoYW5PckVxdWFsKHRoaXMuciwgb3RoZXIucik7XG4gICAgfTtcblxuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCFlcXVhbHModGhpcy5pLCAwKS52YWx1ZU9mKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImFiczogZXhwZWN0cyBhcmd1bWVudCBvZiB0eXBlIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gYWJzKHRoaXMucik7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnRvRml4bnVtID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCFlcXVhbHModGhpcy5pLCAwKS52YWx1ZU9mKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcInRvRml4bnVtOiBleHBlY3RzIGFyZ3VtZW50IG9mIHR5cGUgcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0b0ZpeG51bSh0aGlzLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5udW1lcmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJudW1lcmF0b3I6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiBudW1lcmF0b3IodGhpcy5uKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5kZW5vbWluYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImZsb29yOiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gZGVub21pbmF0b3IodGhpcy5uKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob3RoZXIpe1xuICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICBhZGQodGhpcy5yLCBvdGhlci5yKSxcbiAgICAgICAgICAgIGFkZCh0aGlzLmksIG90aGVyLmkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgIHN1YnRyYWN0KHRoaXMuciwgb3RoZXIuciksXG4gICAgICAgICAgICBzdWJ0cmFjdCh0aGlzLmksIG90aGVyLmkpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShuZWdhdGUodGhpcy5yKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lZ2F0ZSh0aGlzLmkpKTtcbiAgICB9O1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uKG90aGVyKXtcbiAgICAgICAgLy8gSWYgdGhlIG90aGVyIHZhbHVlIGlzIHJlYWwsIGp1c3QgZG8gcHJpbWl0aXZlIGRpdmlzaW9uXG4gICAgICAgIGlmIChvdGhlci5pc1JlYWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKFxuICAgICAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuciwgb3RoZXIuciksXG4gICAgICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5pLCBvdGhlci5yKSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSBzdWJ0cmFjdChcbiAgICAgICAgICAgIG11bHRpcGx5KHRoaXMuciwgb3RoZXIuciksXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLmksIG90aGVyLmkpKTtcbiAgICAgICAgdmFyIGkgPSBhZGQoXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLnIsIG90aGVyLmkpLFxuICAgICAgICAgICAgbXVsdGlwbHkodGhpcy5pLCBvdGhlci5yKSk7XG4gICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShyLCBpKTtcbiAgICB9O1xuXG5cblxuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgICAgIHZhciBhLCBiLCBjLCBkLCByLCB4LCB5O1xuICAgICAgICAvLyBJZiB0aGUgb3RoZXIgdmFsdWUgaXMgcmVhbCwganVzdCBkbyBwcmltaXRpdmUgZGl2aXNpb25cbiAgICAgICAgaWYgKG90aGVyLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgZGl2aWRlKHRoaXMuciwgb3RoZXIuciksXG4gICAgICAgICAgICAgICAgZGl2aWRlKHRoaXMuaSwgb3RoZXIucikpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJbmV4YWN0KCkgfHwgb3RoZXIuaXNJbmV4YWN0KCkpIHtcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9wb3J0YWwuYWNtLm9yZy9jaXRhdGlvbi5jZm0/aWQ9MTAzOTgxNFxuICAgICAgICAgICAgLy8gV2UgY3VycmVudGx5IHVzZSBTbWl0aCdzIG1ldGhvZCwgdGhvdWdoIHdlIHNob3VsZFxuICAgICAgICAgICAgLy8gcHJvYmFibHkgc3dpdGNoIG92ZXIgdG8gUHJpZXN0J3MgbWV0aG9kLlxuICAgICAgICAgICAgYSA9IHRoaXMucjtcbiAgICAgICAgICAgIGIgPSB0aGlzLmk7XG4gICAgICAgICAgICBjID0gb3RoZXIucjtcbiAgICAgICAgICAgIGQgPSBvdGhlci5pO1xuICAgICAgICAgICAgaWYgKGxlc3NUaGFuT3JFcXVhbChhYnMoZCksIGFicyhjKSkpIHtcbiAgICAgICAgICAgICAgICByID0gZGl2aWRlKGQsIGMpO1xuICAgICAgICAgICAgICAgIHggPSBkaXZpZGUoYWRkKGEsIG11bHRpcGx5KGIsIHIpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZChjLCBtdWx0aXBseShkLCByKSkpO1xuICAgICAgICAgICAgICAgIHkgPSBkaXZpZGUoc3VidHJhY3QoYiwgbXVsdGlwbHkoYSwgcikpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkKGMsIG11bHRpcGx5KGQsIHIpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHIgPSBkaXZpZGUoYywgZCk7XG4gICAgICAgICAgICAgICAgeCA9IGRpdmlkZShhZGQobXVsdGlwbHkoYSwgciksIGIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkKG11bHRpcGx5KGMsIHIpLCBkKSk7XG4gICAgICAgICAgICAgICAgeSA9IGRpdmlkZShzdWJ0cmFjdChtdWx0aXBseShiLCByKSwgYSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhZGQobXVsdGlwbHkoYywgciksIGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZSh4LCB5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBjb24gPSBjb25qdWdhdGUob3RoZXIpO1xuICAgICAgICAgICAgdmFyIHVwID0gbXVsdGlwbHkodGhpcywgY29uKTtcblxuICAgICAgICAgICAgLy8gRG93biBpcyBndWFyYW50ZWVkIHRvIGJlIHJlYWwgYnkgdGhpcyBwb2ludC5cbiAgICAgICAgICAgIHZhciBkb3duID0gcmVhbFBhcnQobXVsdGlwbHkob3RoZXIsIGNvbikpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoXG4gICAgICAgICAgICAgICAgZGl2aWRlKHJlYWxQYXJ0KHVwKSwgZG93biksXG4gICAgICAgICAgICAgICAgZGl2aWRlKGltYWdpbmFyeVBhcnQodXApLCBkb3duKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgIHRoaXMucixcbiAgICAgICAgICAgIHN1YnRyYWN0KDAsIHRoaXMuaSkpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzdW0gPSBhZGQoXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLnIsIHRoaXMuciksXG4gICAgICAgICAgICBtdWx0aXBseSh0aGlzLmksIHRoaXMuaSkpO1xuICAgICAgICByZXR1cm4gc3FydChzdW0pO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pc1JlYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZXF2KHRoaXMuaSwgMCk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmludGVnZXJTcXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpc0ludGVnZXIodGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnRlZ2VyU3FydCh0aGlzLnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJpbnRlZ2VyU3FydDogY2FuIG9ubHkgYmUgYXBwbGllZCB0byBhbiBpbnRlZ2VyXCIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnNxcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHJldHVybiBzcXJ0KHRoaXMucik7XG4gICAgICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3F1YXJlX3Jvb3QjU3F1YXJlX3Jvb3RzX29mX25lZ2F0aXZlX2FuZF9jb21wbGV4X251bWJlcnNcbiAgICAgICAgdmFyIHJfcGx1c194ID0gYWRkKHRoaXMubWFnbml0dWRlKCksIHRoaXMucik7XG5cbiAgICAgICAgdmFyIHIgPSBzcXJ0KGhhbHZlKHJfcGx1c194KSk7XG5cbiAgICAgICAgdmFyIGkgPSBkaXZpZGUodGhpcy5pLCBzcXJ0KG11bHRpcGx5KHJfcGx1c194LCAyKSkpO1xuXG5cbiAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKHIsIGkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbSA9IHRoaXMubWFnbml0dWRlKCk7XG4gICAgICAgIHZhciB0aGV0YSA9IHRoaXMuYW5nbGUoKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFkZChcbiAgICAgICAgICAgIGxvZyhtKSxcbiAgICAgICAgICAgIHRpbWVzSSh0aGV0YSkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hbmdsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gYW5nbGUodGhpcy5yKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXF1YWxzKDAsIHRoaXMucikpIHtcbiAgICAgICAgICAgIHZhciB0bXAgPSBoYWx2ZShGbG9hdFBvaW50LnBpKTtcbiAgICAgICAgICAgIHJldHVybiBncmVhdGVyVGhhbih0aGlzLmksIDApID9cbiAgICAgICAgICAgICAgICB0bXAgOiBuZWdhdGUodG1wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0bXAgPSBhdGFuKGRpdmlkZShhYnModGhpcy5pKSwgYWJzKHRoaXMucikpKTtcbiAgICAgICAgICAgIGlmIChncmVhdGVyVGhhbih0aGlzLnIsIDApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdyZWF0ZXJUaGFuKHRoaXMuaSwgMCkgP1xuICAgICAgICAgICAgICAgICAgICB0bXAgOiBuZWdhdGUodG1wKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdyZWF0ZXJUaGFuKHRoaXMuaSwgMCkgP1xuICAgICAgICAgICAgICAgICAgICBzdWJ0cmFjdChGbG9hdFBvaW50LnBpLCB0bXApIDogc3VidHJhY3QodG1wLCBGbG9hdFBvaW50LnBpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcGx1c0kgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLCAxKTtcbiAgICB2YXIgbWludXNJID0gQ29tcGxleC5tYWtlSW5zdGFuY2UoMCwgLTEpO1xuXG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS50YW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRpdmlkZSh0aGlzLnNpbigpLCB0aGlzLmNvcygpKTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUuYXRhbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChlcXVhbHModGhpcywgcGx1c0kpIHx8XG4gICAgICAgICAgICBlcXVhbHModGhpcywgbWludXNJKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5lZ2luZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbXVsdGlwbHkoXG4gICAgICAgICAgICBwbHVzSSxcbiAgICAgICAgICAgIG11bHRpcGx5KFxuICAgICAgICAgICAgICAgIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKDAuNSksXG4gICAgICAgICAgICAgICAgbG9nKGRpdmlkZShcbiAgICAgICAgICAgICAgICAgICAgYWRkKHBsdXNJLCB0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgYWRkKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGx1c0ksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmFjdCgwLCB0aGlzKSkpKSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5jb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHJldHVybiBjb3ModGhpcy5yKTtcbiAgICAgICAgdmFyIGl6ID0gdGltZXNJKHRoaXMpO1xuICAgICAgICB2YXIgaXpfbmVnYXRlID0gbmVnYXRlKGl6KTtcblxuICAgICAgICByZXR1cm4gaGFsdmUoYWRkKGV4cChpeiksIGV4cChpel9uZWdhdGUpKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLnNpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgcmV0dXJuIHNpbih0aGlzLnIpO1xuICAgICAgICB2YXIgaXogPSB0aW1lc0kodGhpcyk7XG4gICAgICAgIHZhciBpel9uZWdhdGUgPSBuZWdhdGUoaXopO1xuICAgICAgICB2YXIgejIgPSBDb21wbGV4Lm1ha2VJbnN0YW5jZSgwLCAyKTtcbiAgICAgICAgdmFyIGV4cF9uZWdhdGUgPSBzdWJ0cmFjdChleHAoaXopLCBleHAoaXpfbmVnYXRlKSk7XG4gICAgICAgIHZhciByZXN1bHQgPSBkaXZpZGUoZXhwX25lZ2F0ZSwgejIpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cblxuICAgIENvbXBsZXgucHJvdG90eXBlLmV4cHQgPSBmdW5jdGlvbih5KXtcbiAgICAgICAgaWYgKGlzRXhhY3RJbnRlZ2VyKHkpICYmIGdyZWF0ZXJUaGFuT3JFcXVhbCh5LCAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhc3RFeHB0KHRoaXMsIHkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBleHBvID0gbXVsdGlwbHkoeSwgdGhpcy5sb2coKSk7XG4gICAgICAgIHJldHVybiBleHAoZXhwbyk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmV4cCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByID0gZXhwKHRoaXMucik7XG4gICAgICAgIHZhciBjb3NfYSA9IGNvcyh0aGlzLmkpO1xuICAgICAgICB2YXIgc2luX2EgPSBzaW4odGhpcy5pKTtcblxuICAgICAgICByZXR1cm4gbXVsdGlwbHkoXG4gICAgICAgICAgICByLFxuICAgICAgICAgICAgYWRkKGNvc19hLCB0aW1lc0koc2luX2EpKSk7XG4gICAgfTtcblxuICAgIENvbXBsZXgucHJvdG90eXBlLmFjb3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZiAodGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHJldHVybiBhY29zKHRoaXMucik7XG4gICAgICAgIHZhciBwaV9oYWxmID0gaGFsdmUoRmxvYXRQb2ludC5waSk7XG4gICAgICAgIHZhciBpeiA9IHRpbWVzSSh0aGlzKTtcbiAgICAgICAgdmFyIHJvb3QgPSBzcXJ0KHN1YnRyYWN0KDEsIHNxcih0aGlzKSkpO1xuICAgICAgICB2YXIgbCA9IHRpbWVzSShsb2coYWRkKGl6LCByb290KSkpO1xuICAgICAgICByZXR1cm4gYWRkKHBpX2hhbGYsIGwpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5hc2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFsKCkpXG4gICAgICAgICAgICByZXR1cm4gYXNpbih0aGlzLnIpO1xuXG4gICAgICAgIHZhciBvbmVOZWdhdGVUaGlzU3EgPVxuICAgICAgICAgICAgc3VidHJhY3QoMSwgc3FyKHRoaXMpKTtcbiAgICAgICAgdmFyIHNxcnRPbmVOZWdhdGVUaGlzU3EgPSBzcXJ0KG9uZU5lZ2F0ZVRoaXNTcSk7XG4gICAgICAgIHJldHVybiBtdWx0aXBseSgyLCBhdGFuKGRpdmlkZSh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkKDEsIHNxcnRPbmVOZWdhdGVUaGlzU3EpKSkpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5jZWlsaW5nID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYgKCF0aGlzLmlzUmVhbCgpKVxuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJjZWlsaW5nOiBjYW4gb25seSBiZSBhcHBsaWVkIHRvIHJlYWwgbnVtYmVyXCIsIHRoaXMpO1xuICAgICAgICByZXR1cm4gY2VpbGluZyh0aGlzLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5mbG9vciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiZmxvb3I6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiBmbG9vcih0aGlzLnIpO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5pbWFnaW5hcnlQYXJ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaTtcbiAgICB9O1xuXG4gICAgQ29tcGxleC5wcm90b3R5cGUucmVhbFBhcnQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5yO1xuICAgIH07XG5cbiAgICBDb21wbGV4LnByb3RvdHlwZS5yb3VuZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWwoKSlcbiAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwicm91bmQ6IGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gcmVhbCBudW1iZXJcIiwgdGhpcyk7XG4gICAgICAgIHJldHVybiByb3VuZCh0aGlzLnIpO1xuICAgIH07XG5cblxuXG4gICAgdmFyIGhhc2hNb2RpZmllcnNSZWdleHAgPSBuZXcgUmVnRXhwKFwiXigjW2VpXSNbYm9keF18I1tib2R4XSNbZWldfCNbYm9keGVpXSkoLiopJFwiKVxuICAgIGZ1bmN0aW9uIHJhdGlvbmFsUmVnZXhwKGRpZ2l0cykgeyByZXR1cm4gbmV3IFJlZ0V4cChcIl4oWystXT9bXCIrZGlnaXRzK1wiXSspLyhbXCIrZGlnaXRzK1wiXSspJFwiKTsgfVxuICAgIGZ1bmN0aW9uIG1hdGNoQ29tcGxleFJlZ2V4cChyYWRpeCwgeCkge1xuICAgICAgICB2YXIgc2lnbiA9IFwiWystXVwiO1xuICAgICAgICB2YXIgbWF5YmVTaWduID0gXCJbKy1dP1wiO1xuICAgICAgICB2YXIgZGlnaXRzID0gZGlnaXRzRm9yUmFkaXgocmFkaXgpXG4gICAgICAgIHZhciBleHBtYXJrID0gXCJbXCIrZXhwTWFya0ZvclJhZGl4KHJhZGl4KStcIl1cIlxuICAgICAgICB2YXIgZGlnaXRTZXF1ZW5jZSA9IFwiW1wiK2RpZ2l0cytcIl0rXCJcblxuICAgICAgICB2YXIgdW5zaWduZWRSYXRpb25hbCA9IGRpZ2l0U2VxdWVuY2UrXCIvXCIrZGlnaXRTZXF1ZW5jZVxuICAgICAgICB2YXIgcmF0aW9uYWwgPSBtYXliZVNpZ24gKyB1bnNpZ25lZFJhdGlvbmFsXG5cbiAgICAgICAgdmFyIG5vRGVjaW1hbCA9IGRpZ2l0U2VxdWVuY2VcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PblJpZ2h0ID0gXCJbXCIrZGlnaXRzK1wiXSpcXFxcLltcIitkaWdpdHMrXCJdK1wiXG4gICAgICAgIHZhciBkZWNpbWFsTnVtT25MZWZ0ID0gXCJbXCIrZGlnaXRzK1wiXStcXFxcLltcIitkaWdpdHMrXCJdKlwiXG5cbiAgICAgICAgdmFyIHVuc2lnbmVkRGVjaW1hbCA9IFwiKD86XCIgKyBub0RlY2ltYWwgKyBcInxcIiArIGRlY2ltYWxOdW1PblJpZ2h0ICsgXCJ8XCIgKyBkZWNpbWFsTnVtT25MZWZ0ICsgXCIpXCJcblxuICAgICAgICB2YXIgc3BlY2lhbCA9IFwiKD86aW5mXFwuMHxuYW5cXC4wfGluZlxcLmZ8bmFuXFwuZilcIlxuXG4gICAgICAgIHZhciB1bnNpZ25lZFJlYWxOb0V4cCA9IFwiKD86XCIgKyB1bnNpZ25lZERlY2ltYWwgKyBcInxcIiArIHVuc2lnbmVkUmF0aW9uYWwgKyBcIilcIlxuICAgICAgICB2YXIgdW5zaWduZWRSZWFsID0gdW5zaWduZWRSZWFsTm9FeHAgKyBcIig/OlwiICsgZXhwbWFyayArIG1heWJlU2lnbiArIGRpZ2l0U2VxdWVuY2UgKyBcIik/XCJcbiAgICAgICAgdmFyIHVuc2lnbmVkUmVhbE9yU3BlY2lhbCA9IFwiKD86XCIgKyB1bnNpZ25lZFJlYWwgKyBcInxcIiArIHNwZWNpYWwgKyBcIilcIlxuICAgICAgICB2YXIgcmVhbCA9IFwiKD86XCIgKyBtYXliZVNpZ24gKyB1bnNpZ25lZFJlYWwgKyBcInxcIiArIHNpZ24gKyBzcGVjaWFsICsgXCIpXCJcblxuICAgICAgICB2YXIgYWx0MSA9IG5ldyBSZWdFeHAoXCJeKFwiICsgcmF0aW9uYWwgKyBcIilcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiKFwiICsgc2lnbiArIHVuc2lnbmVkUmF0aW9uYWwgKyBcIj8pXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcImkkXCIpO1xuICAgICAgICB2YXIgYWx0MiA9IG5ldyBSZWdFeHAoXCJeKFwiICsgcmVhbCArIFwiKT9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiKFwiICsgc2lnbiArIHVuc2lnbmVkUmVhbE9yU3BlY2lhbCArIFwiPylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiaSRcIik7XG4gICAgICAgIHZhciBhbHQzID0gbmV3IFJlZ0V4cChcIl4oXCIgKyByZWFsICsgXCIpQChcIiArIHJlYWwgKyBcIikkXCIpO1xuXG4gICAgICAgIHZhciBtYXRjaDEgPSB4Lm1hdGNoKGFsdDEpXG4gICAgICAgIHZhciBtYXRjaDIgPSB4Lm1hdGNoKGFsdDIpXG4gICAgICAgIHZhciBtYXRjaDMgPSB4Lm1hdGNoKGFsdDMpXG5cbiAgICAgICAgcmV0dXJuIG1hdGNoMSA/IG1hdGNoMSA6XG4gICAgICAgICAgICAgICBtYXRjaDIgPyBtYXRjaDIgOlxuICAgICAgICAgICAgICAgbWF0Y2gzID8gbWF0Y2gzIDpcbiAgICAgICAgICAgICAvKiBlbHNlICovIGZhbHNlXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlnaXRSZWdleHAoZGlnaXRzKSB7IHJldHVybiBuZXcgUmVnRXhwKFwiXlsrLV0/W1wiK2RpZ2l0cytcIl0rJFwiKTsgfVxuICAgIC8qKlxuICAgIC8qIE5COiAhISEhIGZsb251bSByZWdleHAgb25seSBtYXRjaGVzIFwiWC5cIiwgXCIuWFwiLCBvciBcIlguWFwiLCBOT1QgXCJYXCIsIHRoaXNcbiAgICAvKiBtdXN0IGJlIHNlcGFyYXRlbHkgY2hlY2tlZCB3aXRoIGRpZ2l0UmVnZXhwLlxuICAgIC8qIEkga25vdyB0aGlzIHNlZW1zIGR1bWIsIGJ1dCB0aGUgYWx0ZXJuYXRpdmUgd291bGQgYmUgdGhhdCB0aGlzIHJlZ2V4cFxuICAgIC8qIHJldHVybnMgc2l4IG1hdGNoZXMsIHdoaWNoIGFsc28gc2VlbXMgZHVtYi5cbiAgICAvKioqL1xuICAgIGZ1bmN0aW9uIGZsb251bVJlZ2V4cChkaWdpdHMpIHtcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PblJpZ2h0ID0gXCIoW1wiK2RpZ2l0cytcIl0qKVxcXFwuKFtcIitkaWdpdHMrXCJdKylcIlxuICAgICAgICB2YXIgZGVjaW1hbE51bU9uTGVmdCA9IFwiKFtcIitkaWdpdHMrXCJdKylcXFxcLihbXCIrZGlnaXRzK1wiXSopXCJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86KFsrLV0/KShcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2ltYWxOdW1PblJpZ2h0K1wifFwiK2RlY2ltYWxOdW1PbkxlZnQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIikpJFwiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2NpZW50aWZpY1BhdHRlcm4oZGlnaXRzLCBleHBfbWFyaykge1xuICAgICAgICB2YXIgbm9EZWNpbWFsID0gXCJbXCIrZGlnaXRzK1wiXStcIlxuICAgICAgICB2YXIgZGVjaW1hbE51bU9uUmlnaHQgPSBcIltcIitkaWdpdHMrXCJdKlxcXFwuW1wiK2RpZ2l0cytcIl0rXCJcbiAgICAgICAgdmFyIGRlY2ltYWxOdW1PbkxlZnQgPSBcIltcIitkaWdpdHMrXCJdK1xcXFwuW1wiK2RpZ2l0cytcIl0qXCJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86KFsrLV0/XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcIig/OlwiK25vRGVjaW1hbCtcInxcIitkZWNpbWFsTnVtT25SaWdodCtcInxcIitkZWNpbWFsTnVtT25MZWZ0K1wiKVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCIpW1wiK2V4cF9tYXJrK1wiXShbKy1dP1tcIitkaWdpdHMrXCJdKykpJFwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaWdpdHNGb3JSYWRpeChyYWRpeCkge1xuICAgICAgICByZXR1cm4gcmFkaXggPT09IDIgID8gXCIwMVwiIDpcbiAgICAgICAgICAgICAgIHJhZGl4ID09PSA4ICA/IFwiMC03XCIgOlxuICAgICAgICAgICAgICAgcmFkaXggPT09IDEwID8gXCIwLTlcIiA6XG4gICAgICAgICAgICAgICByYWRpeCA9PT0gMTYgPyBcIjAtOWEtZkEtRlwiIDpcbiAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKFwiZGlnaXRzRm9yUmFkaXg6IGludmFsaWQgcmFkaXhcIiwgdGhpcywgcmFkaXgpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhwTWFya0ZvclJhZGl4KHJhZGl4KSB7XG4gICAgICAgIHJldHVybiAocmFkaXggPT09IDIgfHwgcmFkaXggPT09IDggfHwgcmFkaXggPT09IDEwKSA/IFwiZGVmc2xcIiA6XG4gICAgICAgICAgICAgICAocmFkaXggPT09IDE2KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwic2xcIiA6XG4gICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImV4cE1hcmtGb3JSYWRpeDogaW52YWxpZCByYWRpeFwiLCB0aGlzLCByYWRpeClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBFeGFjdG5lc3MoaSkge1xuICAgICAgdGhpcy5kZWZhdWx0cCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGkgPT0gMDsgfVxuICAgICAgdGhpcy5leGFjdHAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBpID09IDE7IH1cbiAgICAgIHRoaXMuaW5leGFjdHAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBpID09IDI7IH1cbiAgICB9XG5cbiAgICBFeGFjdG5lc3MuZGVmID0gbmV3IEV4YWN0bmVzcygwKTtcbiAgICBFeGFjdG5lc3Mub24gPSBuZXcgRXhhY3RuZXNzKDEpO1xuICAgIEV4YWN0bmVzcy5vZmYgPSBuZXcgRXhhY3RuZXNzKDIpO1xuXG4gICAgRXhhY3RuZXNzLnByb3RvdHlwZS5pbnRBc0V4YWN0cCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHAoKSB8fCB0aGlzLmV4YWN0cCgpOyB9O1xuICAgIEV4YWN0bmVzcy5wcm90b3R5cGUuZmxvYXRBc0luZXhhY3RwID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cCgpIHx8IHRoaXMuaW5leGFjdHAoKTsgfTtcblxuXG4gICAgLy8gZnJvbVN0cmluZzogc3RyaW5nIGJvb2xlYW4gLT4gKHNjaGVtZS1udW1iZXIgfCBmYWxzZSlcbiAgICB2YXIgZnJvbVN0cmluZyA9IGZ1bmN0aW9uKHgsIGV4YWN0bmVzcykge1xuICAgICAgICB2YXIgcmFkaXggPSAxMFxuICAgICAgICB2YXIgZXhhY3RuZXNzID0gdHlwZW9mIGV4YWN0bmVzcyA9PT0gJ3VuZGVmaW5lZCcgPyBFeGFjdG5lc3MuZGVmIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0bmVzcyA9PT0gdHJ1ZSAgICAgICAgICAgICAgID8gRXhhY3RuZXNzLm9uIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0bmVzcyA9PT0gZmFsc2UgICAgICAgICAgICAgID8gRXhhY3RuZXNzLm9mZiA6XG4gICAgICAgICAgIC8qIGVsc2UgKi8gIHRocm93UnVudGltZUVycm9yKCBcImV4YWN0bmVzcyBtdXN0IGJlIHRydWUgb3IgZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgcikgO1xuXG4gICAgICAgIHZhciBoTWF0Y2ggPSB4LnRvTG93ZXJDYXNlKCkubWF0Y2goaGFzaE1vZGlmaWVyc1JlZ2V4cClcbiAgICAgICAgaWYgKGhNYXRjaCkge1xuICAgICAgICAgICAgdmFyIG1vZGlmaWVyU3RyaW5nID0gaE1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHZhciBleGFjdEZsYWcgPSBtb2RpZmllclN0cmluZy5tYXRjaChuZXcgUmVnRXhwKFwiKCNbZWldKVwiKSlcbiAgICAgICAgICAgIHZhciByYWRpeEZsYWcgPSBtb2RpZmllclN0cmluZy5tYXRjaChuZXcgUmVnRXhwKFwiKCNbYm9keF0pXCIpKVxuXG4gICAgICAgICAgICBpZiAoZXhhY3RGbGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSBleGFjdEZsYWdbMV0uY2hhckF0KDEpXG4gICAgICAgICAgICAgICAgZXhhY3RuZXNzID0gZiA9PT0gJ2UnID8gRXhhY3RuZXNzLm9uIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmID09PSAnaScgPyBFeGFjdG5lc3Mub2ZmIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGNhc2UgaXMgdW5yZWFjaGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImludmFsaWQgZXhhY3RuZXNzIGZsYWdcIiwgdGhpcywgcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyYWRpeEZsYWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IHJhZGl4RmxhZ1sxXS5jaGFyQXQoMSlcbiAgICAgICAgICAgICAgICByYWRpeCA9IGYgPT09ICdiJyA/IDIgOlxuICAgICAgICAgICAgZiA9PT0gJ28nID8gOCA6XG4gICAgICAgICAgICBmID09PSAnZCcgPyAxMCA6XG4gICAgICAgICAgICBmID09PSAneCcgPyAxNiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBjYXNlIGlzIHVucmVhY2hhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd1J1bnRpbWVFcnJvcihcImludmFsaWQgcmFkaXggZmxhZ1wiLCB0aGlzLCByKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG51bWJlclN0cmluZyA9IGhNYXRjaCA/IGhNYXRjaFsyXSA6IHhcbiAgICAgICAgLy8gaWYgdGhlIHN0cmluZyBiZWdpbnMgd2l0aCBhIGhhc2ggbW9kaWZpZXIsIHRoZW4gaXQgbXVzdCBwYXJzZSBhcyBhXG4gICAgICAgIC8vIG51bWJlciwgYW4gaW52YWxpZCBwYXJzZSBpcyBhbiBlcnJvciwgbm90IGZhbHNlLiBGYWxzZSBpcyByZXR1cm5lZFxuICAgICAgICAvLyB3aGVuIHRoZSBpdGVtIGNvdWxkIHBvdGVudGlhbGx5IGhhdmUgYmVlbiByZWFkIGFzIGEgc3ltYm9sLlxuICAgICAgICB2YXIgbXVzdEJlQU51bWJlcnAgPSBoTWF0Y2ggPyB0cnVlIDogZmFsc2VcblxuICAgICAgICByZXR1cm4gZnJvbVN0cmluZ1JhdyhudW1iZXJTdHJpbmcsIHJhZGl4LCBleGFjdG5lc3MsIG11c3RCZUFOdW1iZXJwKVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmcm9tU3RyaW5nUmF3KHgsIHJhZGl4LCBleGFjdG5lc3MsIG11c3RCZUFOdW1iZXJwKSB7XG4gICAgICAgIHZhciBjTWF0Y2ggPSBtYXRjaENvbXBsZXhSZWdleHAocmFkaXgsIHgpO1xuICAgICAgICBpZiAoY01hdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKCBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KCBjTWF0Y2hbMV0gfHwgXCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHJhZGl4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleGFjdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KCBjTWF0Y2hbMl0gPT09IFwiK1wiID8gXCIxXCIgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNNYXRjaFsyXSA9PT0gXCItXCIgPyBcIi0xXCIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY01hdGNoWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByYWRpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZXhhY3RuZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnJvbVN0cmluZ1Jhd05vQ29tcGxleCh4LCByYWRpeCwgZXhhY3RuZXNzLCBtdXN0QmVBTnVtYmVycClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KHgsIHJhZGl4LCBleGFjdG5lc3MsIG11c3RCZUFOdW1iZXJwKSB7XG4gICAgICAgIHZhciBhTWF0Y2ggPSB4Lm1hdGNoKHJhdGlvbmFsUmVnZXhwKGRpZ2l0c0ZvclJhZGl4KHJhZGl4KSkpO1xuICAgICAgICBpZiAoYU1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gUmF0aW9uYWwubWFrZUluc3RhbmNlKCBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KCBhTWF0Y2hbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHJhZGl4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleGFjdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KCBhTWF0Y2hbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHJhZGl4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleGFjdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZsb2F0aW5nIHBvaW50IHRlc3RzXG4gICAgICAgIGlmICh4ID09PSAnK25hbi4wJyB8fCB4ID09PSAnLW5hbi4wJylcbiAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm5hbjtcbiAgICAgICAgaWYgKHggPT09ICcraW5mLjAnKVxuICAgICAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQuaW5mO1xuICAgICAgICBpZiAoeCA9PT0gJy1pbmYuMCcpXG4gICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5uZWdpbmY7XG4gICAgICAgIGlmICh4ID09PSBcIi0wLjBcIikge1xuICAgICAgICAgICAgcmV0dXJuIE5FR0FUSVZFX1pFUk87XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZk1hdGNoID0geC5tYXRjaChmbG9udW1SZWdleHAoZGlnaXRzRm9yUmFkaXgocmFkaXgpKSlcbiAgICAgICAgaWYgKGZNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGludGVncmFsUGFydCA9IGZNYXRjaFszXSAhPT0gdW5kZWZpbmVkID8gZk1hdGNoWzNdIDogZk1hdGNoWzVdO1xuICAgICAgICAgICAgdmFyIGZyYWN0aW9uYWxQYXJ0ID0gZk1hdGNoWzRdICE9PSB1bmRlZmluZWQgPyBmTWF0Y2hbNF0gOiBmTWF0Y2hbNl07XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCggZk1hdGNoWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgaW50ZWdyYWxQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZnJhY3Rpb25hbFBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCByYWRpeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGV4YWN0bmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc01hdGNoID0geC5tYXRjaChzY2llbnRpZmljUGF0dGVybiggZGlnaXRzRm9yUmFkaXgocmFkaXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBleHBNYXJrRm9yUmFkaXgocmFkaXgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgaWYgKHNNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGNvZWZmaWNpZW50ID0gZnJvbVN0cmluZ1Jhd05vQ29tcGxleChzTWF0Y2hbMV0sIHJhZGl4LCBleGFjdG5lc3MpXG4gICAgICAgICAgICB2YXIgZXhwb25lbnQgPSBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KHNNYXRjaFsyXSwgcmFkaXgsIGV4YWN0bmVzcylcbiAgICAgICAgICAgIHJldHVybiBtdWx0aXBseShjb2VmZmljaWVudCwgZXhwdChyYWRpeCwgZXhwb25lbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGludGVnZXIgdGVzdHMuXG4gICAgICAgIGlmICh4Lm1hdGNoKGRpZ2l0UmVnZXhwKGRpZ2l0c0ZvclJhZGl4KHJhZGl4KSkpKSB7XG4gICAgICAgICAgICB2YXIgbiA9IHBhcnNlSW50KHgsIHJhZGl4KTtcbiAgICAgICAgICAgIGlmIChpc092ZXJmbG93KG4pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VCaWdudW0oeCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4YWN0bmVzcy5pbnRBc0V4YWN0cCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShuKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG11c3RCZUFOdW1iZXJwKSB7XG4gICAgICAgICAgICBpZih4Lmxlbmd0aD09PTApIHRocm93UnVudGltZUVycm9yKFwibm8gZGlnaXRzXCIpO1xuICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoXCJiYWQgbnVtYmVyOiBcIiArIHgsIHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHBhcnNlRmxvYXQoc2lnbiwgaW50ZWdyYWxQYXJ0LCBmcmFjdGlvbmFsUGFydCwgcmFkaXgsIGV4YWN0bmVzcykge1xuICAgICAgICB2YXIgc2lnbiA9IChzaWduID09IFwiLVwiID8gLTEgOiAxKTtcbiAgICAgICAgdmFyIGludGVncmFsUGFydFZhbHVlID0gaW50ZWdyYWxQYXJ0ID09PSBcIlwiICA/IDAgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3RuZXNzLmludEFzRXhhY3RwKCkgPyBwYXJzZUV4YWN0SW50KGludGVncmFsUGFydCwgcmFkaXgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChpbnRlZ3JhbFBhcnQsIHJhZGl4KVxuXG4gICAgICAgIHZhciBmcmFjdGlvbmFsTnVtZXJhdG9yID0gZnJhY3Rpb25hbFBhcnQgPT09IFwiXCIgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdG5lc3MuaW50QXNFeGFjdHAoKSA/IHBhcnNlRXhhY3RJbnQoZnJhY3Rpb25hbFBhcnQsIHJhZGl4KSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChmcmFjdGlvbmFsUGFydCwgcmFkaXgpXG4gICAgICAgIC8qIHVuZm9ydHVuYXRlbHksIGZvciB0aGVzZSBuZXh0IHR3byBjYWxjdWxhdGlvbnMsIGBleHB0YCBhbmQgYGRpdmlkZWAgKi9cbiAgICAgICAgLyogd2lsbCBwcm9tb3RlIHRvIEJpZ251bSBhbmQgUmF0aW9uYWwsIHJlc3BlY3RpdmVseSwgYnV0IHdlIG9ubHkgd2FudCAqL1xuICAgICAgICAvKiB0aGVzZSBpZiB3ZSdyZSBwYXJzaW5nIGluIGV4YWN0IG1vZGUgKi9cbiAgICAgICAgdmFyIGZyYWN0aW9uYWxEZW5vbWluYXRvciA9IGV4YWN0bmVzcy5pbnRBc0V4YWN0cCgpID8gZXhwdChyYWRpeCwgZnJhY3Rpb25hbFBhcnQubGVuZ3RoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KHJhZGl4LCBmcmFjdGlvbmFsUGFydC5sZW5ndGgpXG4gICAgICAgIHZhciBmcmFjdGlvbmFsUGFydFZhbHVlID0gZnJhY3Rpb25hbFBhcnQgPT09IFwiXCIgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdG5lc3MuaW50QXNFeGFjdHAoKSA/IGRpdmlkZShmcmFjdGlvbmFsTnVtZXJhdG9yLCBmcmFjdGlvbmFsRGVub21pbmF0b3IpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uYWxOdW1lcmF0b3IgLyBmcmFjdGlvbmFsRGVub21pbmF0b3JcblxuICAgICAgICB2YXIgZm9yY2VJbmV4YWN0ID0gZnVuY3Rpb24obykge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBvID09PSBcIm51bWJlclwiID8gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UobykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udG9JbmV4YWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXhhY3RuZXNzLmZsb2F0QXNJbmV4YWN0cCgpID8gZm9yY2VJbmV4YWN0KG11bHRpcGx5KHNpZ24sIGFkZCggaW50ZWdyYWxQYXJ0VmFsdWUsIGZyYWN0aW9uYWxQYXJ0VmFsdWUpKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbHkoc2lnbiwgYWRkKGludGVncmFsUGFydFZhbHVlLCBmcmFjdGlvbmFsUGFydFZhbHVlKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VFeGFjdEludChzdHIsIHJhZGl4KSB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyaW5nUmF3Tm9Db21wbGV4KHN0ciwgcmFkaXgsIEV4YWN0bmVzcy5vbiwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIFRoZSBjb2RlIGJlbG93IGNvbWVzIGZyb20gVG9tIFd1J3MgQmlnSW50ZWdlciBpbXBsZW1lbnRhdGlvbjpcblxuICAgIC8vIENvcHlyaWdodCAoYykgMjAwNSAgVG9tIFd1XG4gICAgLy8gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICAvLyBTZWUgXCJMSUNFTlNFXCIgZm9yIGRldGFpbHMuXG5cbiAgICAvLyBCYXNpYyBKYXZhU2NyaXB0IEJOIGxpYnJhcnkgLSBzdWJzZXQgdXNlZnVsIGZvciBSU0EgZW5jcnlwdGlvbi5cblxuICAgIC8vIEJpdHMgcGVyIGRpZ2l0XG4gICAgdmFyIGRiaXRzO1xuXG4gICAgLy8gSmF2YVNjcmlwdCBlbmdpbmUgYW5hbHlzaXNcbiAgICB2YXIgY2FuYXJ5ID0gMHhkZWFkYmVlZmNhZmU7XG4gICAgdmFyIGpfbG0gPSAoKGNhbmFyeSYweGZmZmZmZik9PTB4ZWZjYWZlKTtcblxuICAgIC8vIChwdWJsaWMpIENvbnN0cnVjdG9yXG4gICAgZnVuY3Rpb24gQmlnSW50ZWdlcihhLGIsYykge1xuICAgICAgICBpZihhICE9IG51bGwpXG4gICAgICAgICAgICBpZihcIm51bWJlclwiID09IHR5cGVvZiBhKSB0aGlzLmZyb21OdW1iZXIoYSxiLGMpO1xuICAgICAgICBlbHNlIGlmKGIgPT0gbnVsbCAmJiBcInN0cmluZ1wiICE9IHR5cGVvZiBhKSB0aGlzLmZyb21TdHJpbmcoYSwyNTYpO1xuICAgICAgICBlbHNlIHRoaXMuZnJvbVN0cmluZyhhLGIpO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBuZXcsIHVuc2V0IEJpZ0ludGVnZXJcbiAgICBmdW5jdGlvbiBuYmkoKSB7IHJldHVybiBuZXcgQmlnSW50ZWdlcihudWxsKTsgfVxuXG4gICAgLy8gYW06IENvbXB1dGUgd19qICs9ICh4KnRoaXNfaSksIHByb3BhZ2F0ZSBjYXJyaWVzLFxuICAgIC8vIGMgaXMgaW5pdGlhbCBjYXJyeSwgcmV0dXJucyBmaW5hbCBjYXJyeS5cbiAgICAvLyBjIDwgMypkdmFsdWUsIHggPCAyKmR2YWx1ZSwgdGhpc19pIDwgZHZhbHVlXG4gICAgLy8gV2UgbmVlZCB0byBzZWxlY3QgdGhlIGZhc3Rlc3Qgb25lIHRoYXQgd29ya3MgaW4gdGhpcyBlbnZpcm9ubWVudC5cblxuICAgIC8vIGFtMTogdXNlIGEgc2luZ2xlIG11bHQgYW5kIGRpdmlkZSB0byBnZXQgdGhlIGhpZ2ggYml0cyxcbiAgICAvLyBtYXggZGlnaXQgYml0cyBzaG91bGQgYmUgMjYgYmVjYXVzZVxuICAgIC8vIG1heCBpbnRlcm5hbCB2YWx1ZSA9IDIqZHZhbHVlXjItMipkdmFsdWUgKDwgMl41MylcbiAgICBmdW5jdGlvbiBhbTEoaSx4LHcsaixjLG4pIHtcbiAgICAgICAgd2hpbGUoLS1uID49IDApIHtcbiAgICAgICAgICAgIHZhciB2ID0geCp0aGlzW2krK10rd1tqXStjO1xuICAgICAgICAgICAgYyA9IE1hdGguZmxvb3Iodi8weDQwMDAwMDApO1xuICAgICAgICAgICAgd1tqKytdID0gdiYweDNmZmZmZmY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIC8vIGFtMiBhdm9pZHMgYSBiaWcgbXVsdC1hbmQtZXh0cmFjdCBjb21wbGV0ZWx5LlxuICAgIC8vIE1heCBkaWdpdCBiaXRzIHNob3VsZCBiZSA8PSAzMCBiZWNhdXNlIHdlIGRvIGJpdHdpc2Ugb3BzXG4gICAgLy8gb24gdmFsdWVzIHVwIHRvIDIqaGR2YWx1ZV4yLWhkdmFsdWUtMSAoPCAyXjMxKVxuICAgIGZ1bmN0aW9uIGFtMihpLHgsdyxqLGMsbikge1xuICAgICAgICB2YXIgeGwgPSB4JjB4N2ZmZiwgeGggPSB4Pj4xNTtcbiAgICAgICAgd2hpbGUoLS1uID49IDApIHtcbiAgICAgICAgICAgIHZhciBsID0gdGhpc1tpXSYweDdmZmY7XG4gICAgICAgICAgICB2YXIgaCA9IHRoaXNbaSsrXT4+MTU7XG4gICAgICAgICAgICB2YXIgbSA9IHhoKmwraCp4bDtcbiAgICAgICAgICAgIGwgPSB4bCpsKygobSYweDdmZmYpPDwxNSkrd1tqXSsoYyYweDNmZmZmZmZmKTtcbiAgICAgICAgICAgIGMgPSAobD4+PjMwKSsobT4+PjE1KSt4aCpoKyhjPj4+MzApO1xuICAgICAgICAgICAgd1tqKytdID0gbCYweDNmZmZmZmZmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICAvLyBBbHRlcm5hdGVseSwgc2V0IG1heCBkaWdpdCBiaXRzIHRvIDI4IHNpbmNlIHNvbWVcbiAgICAvLyBicm93c2VycyBzbG93IGRvd24gd2hlbiBkZWFsaW5nIHdpdGggMzItYml0IG51bWJlcnMuXG4gICAgZnVuY3Rpb24gYW0zKGkseCx3LGosYyxuKSB7XG4gICAgICAgIHZhciB4bCA9IHgmMHgzZmZmLCB4aCA9IHg+PjE0O1xuICAgICAgICB3aGlsZSgtLW4gPj0gMCkge1xuICAgICAgICAgICAgdmFyIGwgPSB0aGlzW2ldJjB4M2ZmZjtcbiAgICAgICAgICAgIHZhciBoID0gdGhpc1tpKytdPj4xNDtcbiAgICAgICAgICAgIHZhciBtID0geGgqbCtoKnhsO1xuICAgICAgICAgICAgbCA9IHhsKmwrKChtJjB4M2ZmZik8PDE0KSt3W2pdK2M7XG4gICAgICAgICAgICBjID0gKGw+PjI4KSsobT4+MTQpK3hoKmg7XG4gICAgICAgICAgICB3W2orK10gPSBsJjB4ZmZmZmZmZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgaWYoal9sbSAmJiAodHlwZW9mKG5hdmlnYXRvcikgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5hcHBOYW1lID09IFwiTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyXCIpKSB7XG4gICAgICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFtID0gYW0yO1xuICAgICAgICBkYml0cyA9IDMwO1xuICAgIH1cbiAgICBlbHNlIGlmKGpfbG0gJiYgKHR5cGVvZihuYXZpZ2F0b3IpICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IuYXBwTmFtZSAhPSBcIk5ldHNjYXBlXCIpKSB7XG4gICAgICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFtID0gYW0xO1xuICAgICAgICBkYml0cyA9IDI2O1xuICAgIH1cbiAgICBlbHNlIHsgLy8gTW96aWxsYS9OZXRzY2FwZSBzZWVtcyB0byBwcmVmZXIgYW0zXG4gICAgICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFtID0gYW0zO1xuICAgICAgICBkYml0cyA9IDI4O1xuICAgIH1cblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkRCID0gZGJpdHM7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuRE0gPSAoKDE8PGRiaXRzKS0xKTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5EViA9ICgxPDxkYml0cyk7XG5cbiAgICB2YXIgQklfRlAgPSA1MjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5GViA9IE1hdGgucG93KDIsQklfRlApO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLkYxID0gQklfRlAtZGJpdHM7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuRjIgPSAyKmRiaXRzLUJJX0ZQO1xuXG4gICAgLy8gRGlnaXQgY29udmVyc2lvbnNcbiAgICB2YXIgQklfUk0gPSBcIjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiO1xuICAgIHZhciBCSV9SQyA9IFtdO1xuICAgIHZhciBycix2djtcbiAgICByciA9IFwiMFwiLmNoYXJDb2RlQXQoMCk7XG4gICAgZm9yKHZ2ID0gMDsgdnYgPD0gOTsgKyt2dikgQklfUkNbcnIrK10gPSB2djtcbiAgICByciA9IFwiYVwiLmNoYXJDb2RlQXQoMCk7XG4gICAgZm9yKHZ2ID0gMTA7IHZ2IDwgMzY7ICsrdnYpIEJJX1JDW3JyKytdID0gdnY7XG4gICAgcnIgPSBcIkFcIi5jaGFyQ29kZUF0KDApO1xuICAgIGZvcih2diA9IDEwOyB2diA8IDM2OyArK3Z2KSBCSV9SQ1tycisrXSA9IHZ2O1xuXG4gICAgZnVuY3Rpb24gaW50MmNoYXIobikgeyByZXR1cm4gQklfUk0uY2hhckF0KG4pOyB9XG4gICAgZnVuY3Rpb24gaW50QXQocyxpKSB7XG4gICAgICAgIHZhciBjID0gQklfUkNbcy5jaGFyQ29kZUF0KGkpXTtcbiAgICAgICAgcmV0dXJuIChjPT1udWxsKT8tMTpjO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIGNvcHkgdGhpcyB0byByXG4gICAgZnVuY3Rpb24gYm5wQ29weVRvKHIpIHtcbiAgICAgICAgZm9yKHZhciBpID0gdGhpcy50LTE7IGkgPj0gMDsgLS1pKSByW2ldID0gdGhpc1tpXTtcbiAgICAgICAgci50ID0gdGhpcy50O1xuICAgICAgICByLnMgPSB0aGlzLnM7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgc2V0IGZyb20gaW50ZWdlciB2YWx1ZSB4LCAtRFYgPD0geCA8IERWXG4gICAgZnVuY3Rpb24gYm5wRnJvbUludCh4KSB7XG4gICAgICAgIHRoaXMudCA9IDE7XG4gICAgICAgIHRoaXMucyA9ICh4PDApPy0xOjA7XG4gICAgICAgIGlmKHggPiAwKSB0aGlzWzBdID0geDtcbiAgICAgICAgZWxzZSBpZih4IDwgLTEpIHRoaXNbMF0gPSB4K0RWO1xuICAgICAgICBlbHNlIHRoaXMudCA9IDA7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIGJpZ2ludCBpbml0aWFsaXplZCB0byB2YWx1ZVxuICAgIGZ1bmN0aW9uIG5idihpKSB7IHZhciByID0gbmJpKCk7IHIuZnJvbUludChpKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHNldCBmcm9tIHN0cmluZyBhbmQgcmFkaXhcbiAgICBmdW5jdGlvbiBibnBGcm9tU3RyaW5nKHMsYikge1xuICAgICAgICB2YXIgaztcbiAgICAgICAgaWYoYiA9PSAxNikgayA9IDQ7XG4gICAgICAgIGVsc2UgaWYoYiA9PSA4KSBrID0gMztcbiAgICAgICAgZWxzZSBpZihiID09IDI1NikgayA9IDg7IC8vIGJ5dGUgYXJyYXlcbiAgICAgICAgZWxzZSBpZihiID09IDIpIGsgPSAxO1xuICAgICAgICBlbHNlIGlmKGIgPT0gMzIpIGsgPSA1O1xuICAgICAgICBlbHNlIGlmKGIgPT0gNCkgayA9IDI7XG4gICAgICAgIGVsc2UgeyB0aGlzLmZyb21SYWRpeChzLGIpOyByZXR1cm47IH1cbiAgICAgICAgdGhpcy50ID0gMDtcbiAgICAgICAgdGhpcy5zID0gMDtcbiAgICAgICAgdmFyIGkgPSBzLmxlbmd0aCwgbWkgPSBmYWxzZSwgc2ggPSAwO1xuICAgICAgICB3aGlsZSgtLWkgPj0gMCkge1xuICAgICAgICAgICAgdmFyIHggPSAoaz09OCk/c1tpXSYweGZmOmludEF0KHMsaSk7XG4gICAgICAgICAgICBpZih4IDwgMCkge1xuICAgICAgICAgICAgICAgIGlmKHMuY2hhckF0KGkpID09IFwiLVwiKSBtaSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtaSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoc2ggPT0gMClcbiAgICAgICAgICAgICAgICB0aGlzW3RoaXMudCsrXSA9IHg7XG4gICAgICAgICAgICBlbHNlIGlmKHNoK2sgPiB0aGlzLkRCKSB7XG4gICAgICAgICAgICAgICAgdGhpc1t0aGlzLnQtMV0gfD0gKHgmKCgxPDwodGhpcy5EQi1zaCkpLTEpKTw8c2g7XG4gICAgICAgICAgICAgICAgdGhpc1t0aGlzLnQrK10gPSAoeD4+KHRoaXMuREItc2gpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzW3RoaXMudC0xXSB8PSB4PDxzaDtcbiAgICAgICAgICAgIHNoICs9IGs7XG4gICAgICAgICAgICBpZihzaCA+PSB0aGlzLkRCKSBzaCAtPSB0aGlzLkRCO1xuICAgICAgICB9XG4gICAgICAgIGlmKGsgPT0gOCAmJiAoc1swXSYweDgwKSAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLnMgPSAtMTtcbiAgICAgICAgICAgIGlmKHNoID4gMCkgdGhpc1t0aGlzLnQtMV0gfD0gKCgxPDwodGhpcy5EQi1zaCkpLTEpPDxzaDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsYW1wKCk7XG4gICAgICAgIGlmKG1pKSBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8odGhpcyx0aGlzKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBjbGFtcCBvZmYgZXhjZXNzIGhpZ2ggd29yZHNcbiAgICBmdW5jdGlvbiBibnBDbGFtcCgpIHtcbiAgICAgICAgdmFyIGMgPSB0aGlzLnMmdGhpcy5ETTtcbiAgICAgICAgd2hpbGUodGhpcy50ID4gMCAmJiB0aGlzW3RoaXMudC0xXSA9PSBjKSAtLXRoaXMudDtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gc3RyaW5nIHJlcHJlc2VudGF0aW9uIGluIGdpdmVuIHJhZGl4XG4gICAgZnVuY3Rpb24gYm5Ub1N0cmluZyhiKSB7XG4gICAgICAgIGlmKHRoaXMucyA8IDApIHJldHVybiBcIi1cIit0aGlzLm5lZ2F0ZSgpLnRvU3RyaW5nKGIpO1xuICAgICAgICB2YXIgaztcbiAgICAgICAgaWYoYiA9PSAxNikgayA9IDQ7XG4gICAgICAgIGVsc2UgaWYoYiA9PSA4KSBrID0gMztcbiAgICAgICAgZWxzZSBpZihiID09IDIpIGsgPSAxO1xuICAgICAgICBlbHNlIGlmKGIgPT0gMzIpIGsgPSA1O1xuICAgICAgICBlbHNlIGlmKGIgPT0gNCkgayA9IDI7XG4gICAgICAgIGVsc2UgcmV0dXJuIHRoaXMudG9SYWRpeChiKTtcbiAgICAgICAgdmFyIGttID0gKDE8PGspLTEsIGQsIG0gPSBmYWxzZSwgciA9IFtdLCBpID0gdGhpcy50O1xuICAgICAgICB2YXIgcCA9IHRoaXMuREItKGkqdGhpcy5EQiklaztcbiAgICAgICAgaWYoaS0tID4gMCkge1xuICAgICAgICAgICAgaWYocCA8IHRoaXMuREIgJiYgKGQgPSB0aGlzW2ldPj5wKSA+IDApIHsgbSA9IHRydWU7IHIucHVzaChpbnQyY2hhcihkKSk7IH1cbiAgICAgICAgICAgIHdoaWxlKGkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmKHAgPCBrKSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSAodGhpc1tpXSYoKDE8PHApLTEpKTw8KGstcCk7XG4gICAgICAgICAgICAgICAgICAgIGQgfD0gdGhpc1stLWldPj4ocCs9dGhpcy5EQi1rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSAodGhpc1tpXT4+KHAtPWspKSZrbTtcbiAgICAgICAgICAgICAgICAgICAgaWYocCA8PSAwKSB7IHAgKz0gdGhpcy5EQjsgLS1pOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGQgPiAwKSBtID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZihtKSByLnB1c2goaW50MmNoYXIoZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtP3Iuam9pbihcIlwiKTpcIjBcIjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSAtdGhpc1xuICAgIGZ1bmN0aW9uIGJuTmVnYXRlKCkgeyB2YXIgciA9IG5iaSgpOyBCaWdJbnRlZ2VyLlpFUk8uc3ViVG8odGhpcyxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHx0aGlzfFxuICAgIGZ1bmN0aW9uIGJuQWJzKCkgeyByZXR1cm4gKHRoaXMuczwwKT90aGlzLm5lZ2F0ZSgpOnRoaXM7IH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiArIGlmIHRoaXMgPiBhLCAtIGlmIHRoaXMgPCBhLCAwIGlmIGVxdWFsXG4gICAgZnVuY3Rpb24gYm5Db21wYXJlVG8oYSkge1xuICAgICAgICB2YXIgciA9IHRoaXMucy1hLnM7XG4gICAgICAgIGlmKHIgIT0gMCkgcmV0dXJuIHI7XG4gICAgICAgIHZhciBpID0gdGhpcy50O1xuICAgICAgICBpZiAoIHRoaXMucyA8IDAgKSB7XG4gICAgICAgICAgICAgICAgciA9IGEudCAtIGk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgciA9IGkgLSBhLnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYociAhPSAwKSByZXR1cm4gcjtcbiAgICAgICAgd2hpbGUoLS1pID49IDApIGlmKChyPXRoaXNbaV0tYVtpXSkgIT0gMCkgcmV0dXJuIHI7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgYml0IGxlbmd0aCBvZiB0aGUgaW50ZWdlciB4XG4gICAgZnVuY3Rpb24gbmJpdHMoeCkge1xuICAgICAgICB2YXIgciA9IDEsIHQ7XG4gICAgICAgIGlmKCh0PXg+Pj4xNikgIT0gMCkgeyB4ID0gdDsgciArPSAxNjsgfVxuICAgICAgICBpZigodD14Pj44KSAhPSAwKSB7IHggPSB0OyByICs9IDg7IH1cbiAgICAgICAgaWYoKHQ9eD4+NCkgIT0gMCkgeyB4ID0gdDsgciArPSA0OyB9XG4gICAgICAgIGlmKCh0PXg+PjIpICE9IDApIHsgeCA9IHQ7IHIgKz0gMjsgfVxuICAgICAgICBpZigodD14Pj4xKSAhPSAwKSB7IHggPSB0OyByICs9IDE7IH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIHRoZSBudW1iZXIgb2YgYml0cyBpbiBcInRoaXNcIlxuICAgIGZ1bmN0aW9uIGJuQml0TGVuZ3RoKCkge1xuICAgICAgICBpZih0aGlzLnQgPD0gMCkgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiB0aGlzLkRCKih0aGlzLnQtMSkrbmJpdHModGhpc1t0aGlzLnQtMV1eKHRoaXMucyZ0aGlzLkRNKSk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgPDwgbipEQlxuICAgIGZ1bmN0aW9uIGJucERMU2hpZnRUbyhuLHIpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGZvcihpID0gdGhpcy50LTE7IGkgPj0gMDsgLS1pKSByW2krbl0gPSB0aGlzW2ldO1xuICAgICAgICBmb3IoaSA9IG4tMTsgaSA+PSAwOyAtLWkpIHJbaV0gPSAwO1xuICAgICAgICByLnQgPSB0aGlzLnQrbjtcbiAgICAgICAgci5zID0gdGhpcy5zO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzID4+IG4qREJcbiAgICBmdW5jdGlvbiBibnBEUlNoaWZ0VG8obixyKSB7XG4gICAgICAgIGZvcih2YXIgaSA9IG47IGkgPCB0aGlzLnQ7ICsraSkgcltpLW5dID0gdGhpc1tpXTtcbiAgICAgICAgci50ID0gTWF0aC5tYXgodGhpcy50LW4sMCk7XG4gICAgICAgIHIucyA9IHRoaXMucztcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyA8PCBuXG4gICAgZnVuY3Rpb24gYm5wTFNoaWZ0VG8obixyKSB7XG4gICAgICAgIHZhciBicyA9IG4ldGhpcy5EQjtcbiAgICAgICAgdmFyIGNicyA9IHRoaXMuREItYnM7XG4gICAgICAgIHZhciBibSA9ICgxPDxjYnMpLTE7XG4gICAgICAgIHZhciBkcyA9IE1hdGguZmxvb3Iobi90aGlzLkRCKSwgYyA9ICh0aGlzLnM8PGJzKSZ0aGlzLkRNLCBpO1xuICAgICAgICBmb3IoaSA9IHRoaXMudC0xOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgcltpK2RzKzFdID0gKHRoaXNbaV0+PmNicyl8YztcbiAgICAgICAgICAgIGMgPSAodGhpc1tpXSZibSk8PGJzO1xuICAgICAgICB9XG4gICAgICAgIGZvcihpID0gZHMtMTsgaSA+PSAwOyAtLWkpIHJbaV0gPSAwO1xuICAgICAgICByW2RzXSA9IGM7XG4gICAgICAgIHIudCA9IHRoaXMudCtkcysxO1xuICAgICAgICByLnMgPSB0aGlzLnM7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyA+PiBuXG4gICAgZnVuY3Rpb24gYm5wUlNoaWZ0VG8obixyKSB7XG4gICAgICAgIHIucyA9IHRoaXMucztcbiAgICAgICAgdmFyIGRzID0gTWF0aC5mbG9vcihuL3RoaXMuREIpO1xuICAgICAgICBpZihkcyA+PSB0aGlzLnQpIHsgci50ID0gMDsgcmV0dXJuOyB9XG4gICAgICAgIHZhciBicyA9IG4ldGhpcy5EQjtcbiAgICAgICAgdmFyIGNicyA9IHRoaXMuREItYnM7XG4gICAgICAgIHZhciBibSA9ICgxPDxicyktMTtcbiAgICAgICAgclswXSA9IHRoaXNbZHNdPj5icztcbiAgICAgICAgZm9yKHZhciBpID0gZHMrMTsgaSA8IHRoaXMudDsgKytpKSB7XG4gICAgICAgICAgICByW2ktZHMtMV0gfD0gKHRoaXNbaV0mYm0pPDxjYnM7XG4gICAgICAgICAgICByW2ktZHNdID0gdGhpc1tpXT4+YnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYoYnMgPiAwKSByW3RoaXMudC1kcy0xXSB8PSAodGhpcy5zJmJtKTw8Y2JzO1xuICAgICAgICByLnQgPSB0aGlzLnQtZHM7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyAtIGFcbiAgICBmdW5jdGlvbiBibnBTdWJUbyhhLHIpIHtcbiAgICAgICAgdmFyIGkgPSAwLCBjID0gMCwgbSA9IE1hdGgubWluKGEudCx0aGlzLnQpO1xuICAgICAgICB3aGlsZShpIDwgbSkge1xuICAgICAgICAgICAgYyArPSB0aGlzW2ldLWFbaV07XG4gICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICB9XG4gICAgICAgIGlmKGEudCA8IHRoaXMudCkge1xuICAgICAgICAgICAgYyAtPSBhLnM7XG4gICAgICAgICAgICB3aGlsZShpIDwgdGhpcy50KSB7XG4gICAgICAgICAgICAgICAgYyArPSB0aGlzW2ldO1xuICAgICAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyArPSB0aGlzLnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjICs9IHRoaXMucztcbiAgICAgICAgICAgIHdoaWxlKGkgPCBhLnQpIHtcbiAgICAgICAgICAgICAgICBjIC09IGFbaV07XG4gICAgICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjIC09IGEucztcbiAgICAgICAgfVxuICAgICAgICByLnMgPSAoYzwwKT8tMTowO1xuICAgICAgICBpZihjIDwgLTEpIHJbaSsrXSA9IHRoaXMuRFYrYztcbiAgICAgICAgZWxzZSBpZihjID4gMCkgcltpKytdID0gYztcbiAgICAgICAgci50ID0gaTtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSB0aGlzICogYSwgciAhPSB0aGlzLGEgKEhBQyAxNC4xMilcbiAgICAvLyBcInRoaXNcIiBzaG91bGQgYmUgdGhlIGxhcmdlciBvbmUgaWYgYXBwcm9wcmlhdGUuXG4gICAgZnVuY3Rpb24gYm5wTXVsdGlwbHlUbyhhLHIpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLmFicygpLCB5ID0gYS5hYnMoKTtcbiAgICAgICAgdmFyIGkgPSB4LnQ7XG4gICAgICAgIHIudCA9IGkreS50O1xuICAgICAgICB3aGlsZSgtLWkgPj0gMCkgcltpXSA9IDA7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IHkudDsgKytpKSByW2kreC50XSA9IHguYW0oMCx5W2ldLHIsaSwwLHgudCk7XG4gICAgICAgIHIucyA9IDA7XG4gICAgICAgIHIuY2xhbXAoKTtcbiAgICAgICAgaWYodGhpcy5zICE9IGEucykgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHIscik7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXNeMiwgciAhPSB0aGlzIChIQUMgMTQuMTYpXG4gICAgZnVuY3Rpb24gYm5wU3F1YXJlVG8ocikge1xuICAgICAgICB2YXIgeCA9IHRoaXMuYWJzKCk7XG4gICAgICAgIHZhciBpID0gci50ID0gMip4LnQ7XG4gICAgICAgIHdoaWxlKC0taSA+PSAwKSByW2ldID0gMDtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgeC50LTE7ICsraSkge1xuICAgICAgICAgICAgdmFyIGMgPSB4LmFtKGkseFtpXSxyLDIqaSwwLDEpO1xuICAgICAgICAgICAgaWYoKHJbaSt4LnRdKz14LmFtKGkrMSwyKnhbaV0sciwyKmkrMSxjLHgudC1pLTEpKSA+PSB4LkRWKSB7XG4gICAgICAgICAgICAgICAgcltpK3gudF0gLT0geC5EVjtcbiAgICAgICAgICAgICAgICByW2kreC50KzFdID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihyLnQgPiAwKSByW3IudC0xXSArPSB4LmFtKGkseFtpXSxyLDIqaSwwLDEpO1xuICAgICAgICByLnMgPSAwO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG5cbiAgICAvLyAocHJvdGVjdGVkKSBkaXZpZGUgdGhpcyBieSBtLCBxdW90aWVudCBhbmQgcmVtYWluZGVyIHRvIHEsIHIgKEhBQyAxNC4yMClcbiAgICAvLyByICE9IHEsIHRoaXMgIT0gbS4gIHEgb3IgciBtYXkgYmUgbnVsbC5cbiAgICBmdW5jdGlvbiBibnBEaXZSZW1UbyhtLHEscikge1xuICAgICAgICB2YXIgcG0gPSBtLmFicygpO1xuICAgICAgICBpZihwbS50IDw9IDApIHJldHVybjtcbiAgICAgICAgdmFyIHB0ID0gdGhpcy5hYnMoKTtcbiAgICAgICAgaWYocHQudCA8IHBtLnQpIHtcbiAgICAgICAgICAgIGlmKHEgIT0gbnVsbCkgcS5mcm9tSW50KDApO1xuICAgICAgICAgICAgaWYociAhPSBudWxsKSB0aGlzLmNvcHlUbyhyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZihyID09IG51bGwpIHIgPSBuYmkoKTtcbiAgICAgICAgdmFyIHkgPSBuYmkoKSwgdHMgPSB0aGlzLnMsIG1zID0gbS5zO1xuICAgICAgICB2YXIgbnNoID0gdGhpcy5EQi1uYml0cyhwbVtwbS50LTFdKTtcdC8vIG5vcm1hbGl6ZSBtb2R1bHVzXG4gICAgICAgIGlmKG5zaCA+IDApIHsgcG0ubFNoaWZ0VG8obnNoLHkpOyBwdC5sU2hpZnRUbyhuc2gscik7IH1cbiAgICAgICAgZWxzZSB7IHBtLmNvcHlUbyh5KTsgcHQuY29weVRvKHIpOyB9XG4gICAgICAgIHZhciB5cyA9IHkudDtcbiAgICAgICAgdmFyIHkwID0geVt5cy0xXTtcbiAgICAgICAgaWYoeTAgPT0gMCkgcmV0dXJuO1xuICAgICAgICB2YXIgeXQgPSB5MCooMTw8dGhpcy5GMSkrKCh5cz4xKT95W3lzLTJdPj50aGlzLkYyOjApO1xuICAgICAgICB2YXIgZDEgPSB0aGlzLkZWL3l0LCBkMiA9ICgxPDx0aGlzLkYxKS95dCwgZSA9IDE8PHRoaXMuRjI7XG4gICAgICAgIHZhciBpID0gci50LCBqID0gaS15cywgdCA9IChxPT1udWxsKT9uYmkoKTpxO1xuICAgICAgICB5LmRsU2hpZnRUbyhqLHQpO1xuICAgICAgICBpZihyLmNvbXBhcmVUbyh0KSA+PSAwKSB7XG4gICAgICAgICAgICByW3IudCsrXSA9IDE7XG4gICAgICAgICAgICByLnN1YlRvKHQscik7XG4gICAgICAgIH1cbiAgICAgICAgQmlnSW50ZWdlci5PTkUuZGxTaGlmdFRvKHlzLHQpO1xuICAgICAgICB0LnN1YlRvKHkseSk7XHQvLyBcIm5lZ2F0aXZlXCIgeSBzbyB3ZSBjYW4gcmVwbGFjZSBzdWIgd2l0aCBhbSBsYXRlclxuICAgICAgICB3aGlsZSh5LnQgPCB5cykgeVt5LnQrK10gPSAwO1xuICAgICAgICB3aGlsZSgtLWogPj0gMCkge1xuICAgICAgICAgICAgLy8gRXN0aW1hdGUgcXVvdGllbnQgZGlnaXRcbiAgICAgICAgICAgIHZhciBxZCA9IChyWy0taV09PXkwKT90aGlzLkRNOk1hdGguZmxvb3IocltpXSpkMSsocltpLTFdK2UpKmQyKTtcbiAgICAgICAgICAgIGlmKChyW2ldKz15LmFtKDAscWQscixqLDAseXMpKSA8IHFkKSB7XHQvLyBUcnkgaXQgb3V0XG4gICAgICAgICAgICAgICAgeS5kbFNoaWZ0VG8oaix0KTtcbiAgICAgICAgICAgICAgICByLnN1YlRvKHQscik7XG4gICAgICAgICAgICAgICAgd2hpbGUocltpXSA8IC0tcWQpIHIuc3ViVG8odCxyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihxICE9IG51bGwpIHtcbiAgICAgICAgICAgIHIuZHJTaGlmdFRvKHlzLHEpO1xuICAgICAgICAgICAgaWYodHMgIT0gbXMpIEJpZ0ludGVnZXIuWkVSTy5zdWJUbyhxLHEpO1xuICAgICAgICB9XG4gICAgICAgIHIudCA9IHlzO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgICAgIGlmKG5zaCA+IDApIHIuclNoaWZ0VG8obnNoLHIpO1x0Ly8gRGVub3JtYWxpemUgcmVtYWluZGVyXG4gICAgICAgIGlmKHRzIDwgMCkgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHIscik7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyBtb2QgYVxuICAgIGZ1bmN0aW9uIGJuTW9kKGEpIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgdGhpcy5hYnMoKS5kaXZSZW1UbyhhLG51bGwscik7XG4gICAgICAgIGlmKHRoaXMucyA8IDAgJiYgci5jb21wYXJlVG8oQmlnSW50ZWdlci5aRVJPKSA+IDApIGEuc3ViVG8ocixyKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gTW9kdWxhciByZWR1Y3Rpb24gdXNpbmcgXCJjbGFzc2ljXCIgYWxnb3JpdGhtXG4gICAgZnVuY3Rpb24gQ2xhc3NpYyhtKSB7IHRoaXMubSA9IG07IH1cbiAgICBmdW5jdGlvbiBjQ29udmVydCh4KSB7XG4gICAgICAgIGlmKHgucyA8IDAgfHwgeC5jb21wYXJlVG8odGhpcy5tKSA+PSAwKSByZXR1cm4geC5tb2QodGhpcy5tKTtcbiAgICAgICAgZWxzZSByZXR1cm4geDtcbiAgICB9XG4gICAgZnVuY3Rpb24gY1JldmVydCh4KSB7IHJldHVybiB4OyB9XG4gICAgZnVuY3Rpb24gY1JlZHVjZSh4KSB7IHguZGl2UmVtVG8odGhpcy5tLG51bGwseCk7IH1cbiAgICBmdW5jdGlvbiBjTXVsVG8oeCx5LHIpIHsgeC5tdWx0aXBseVRvKHkscik7IHRoaXMucmVkdWNlKHIpOyB9XG4gICAgZnVuY3Rpb24gY1NxclRvKHgscikgeyB4LnNxdWFyZVRvKHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuXG4gICAgQ2xhc3NpYy5wcm90b3R5cGUuY29udmVydCA9IGNDb252ZXJ0O1xuICAgIENsYXNzaWMucHJvdG90eXBlLnJldmVydCA9IGNSZXZlcnQ7XG4gICAgQ2xhc3NpYy5wcm90b3R5cGUucmVkdWNlID0gY1JlZHVjZTtcbiAgICBDbGFzc2ljLnByb3RvdHlwZS5tdWxUbyA9IGNNdWxUbztcbiAgICBDbGFzc2ljLnByb3RvdHlwZS5zcXJUbyA9IGNTcXJUbztcblxuICAgIC8vIChwcm90ZWN0ZWQpIHJldHVybiBcIi0xL3RoaXMgJSAyXkRCXCI7IHVzZWZ1bCBmb3IgTW9udC4gcmVkdWN0aW9uXG4gICAgLy8ganVzdGlmaWNhdGlvbjpcbiAgICAvLyAgICAgICAgIHh5ID09IDEgKG1vZCBtKVxuICAgIC8vICAgICAgICAgeHkgPSAgMStrbVxuICAgIC8vICAgeHkoMi14eSkgPSAoMStrbSkoMS1rbSlcbiAgICAvLyB4W3koMi14eSldID0gMS1rXjJtXjJcbiAgICAvLyB4W3koMi14eSldID09IDEgKG1vZCBtXjIpXG4gICAgLy8gaWYgeSBpcyAxL3ggbW9kIG0sIHRoZW4geSgyLXh5KSBpcyAxL3ggbW9kIG1eMlxuICAgIC8vIHNob3VsZCByZWR1Y2UgeCBhbmQgeSgyLXh5KSBieSBtXjIgYXQgZWFjaCBzdGVwIHRvIGtlZXAgc2l6ZSBib3VuZGVkLlxuICAgIC8vIEpTIG11bHRpcGx5IFwib3ZlcmZsb3dzXCIgZGlmZmVyZW50bHkgZnJvbSBDL0MrKywgc28gY2FyZSBpcyBuZWVkZWQgaGVyZS5cbiAgICBmdW5jdGlvbiBibnBJbnZEaWdpdCgpIHtcbiAgICAgICAgaWYodGhpcy50IDwgMSkgcmV0dXJuIDA7XG4gICAgICAgIHZhciB4ID0gdGhpc1swXTtcbiAgICAgICAgaWYoKHgmMSkgPT0gMCkgcmV0dXJuIDA7XG4gICAgICAgIHZhciB5ID0geCYzO1x0XHQvLyB5ID09IDEveCBtb2QgMl4yXG4gICAgICAgIHkgPSAoeSooMi0oeCYweGYpKnkpKSYweGY7XHQvLyB5ID09IDEveCBtb2QgMl40XG4gICAgICAgIHkgPSAoeSooMi0oeCYweGZmKSp5KSkmMHhmZjtcdC8vIHkgPT0gMS94IG1vZCAyXjhcbiAgICAgICAgeSA9ICh5KigyLSgoKHgmMHhmZmZmKSp5KSYweGZmZmYpKSkmMHhmZmZmO1x0Ly8geSA9PSAxL3ggbW9kIDJeMTZcbiAgICAgICAgLy8gbGFzdCBzdGVwIC0gY2FsY3VsYXRlIGludmVyc2UgbW9kIERWIGRpcmVjdGx5O1xuICAgICAgICAvLyBhc3N1bWVzIDE2IDwgREIgPD0gMzIgYW5kIGFzc3VtZXMgYWJpbGl0eSB0byBoYW5kbGUgNDgtYml0IGludHNcbiAgICAgICAgeSA9ICh5KigyLXgqeSV0aGlzLkRWKSkldGhpcy5EVjtcdFx0Ly8geSA9PSAxL3ggbW9kIDJeZGJpdHNcbiAgICAgICAgLy8gd2UgcmVhbGx5IHdhbnQgdGhlIG5lZ2F0aXZlIGludmVyc2UsIGFuZCAtRFYgPCB5IDwgRFZcbiAgICAgICAgcmV0dXJuICh5PjApP3RoaXMuRFYteToteTtcbiAgICB9XG5cbiAgICAvLyBNb250Z29tZXJ5IHJlZHVjdGlvblxuICAgIGZ1bmN0aW9uIE1vbnRnb21lcnkobSkge1xuICAgICAgICB0aGlzLm0gPSBtO1xuICAgICAgICB0aGlzLm1wID0gbS5pbnZEaWdpdCgpO1xuICAgICAgICB0aGlzLm1wbCA9IHRoaXMubXAmMHg3ZmZmO1xuICAgICAgICB0aGlzLm1waCA9IHRoaXMubXA+PjE1O1xuICAgICAgICB0aGlzLnVtID0gKDE8PChtLkRCLTE1KSktMTtcbiAgICAgICAgdGhpcy5tdDIgPSAyKm0udDtcbiAgICB9XG5cbiAgICAvLyB4UiBtb2QgbVxuICAgIGZ1bmN0aW9uIG1vbnRDb252ZXJ0KHgpIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgeC5hYnMoKS5kbFNoaWZ0VG8odGhpcy5tLnQscik7XG4gICAgICAgIHIuZGl2UmVtVG8odGhpcy5tLG51bGwscik7XG4gICAgICAgIGlmKHgucyA8IDAgJiYgci5jb21wYXJlVG8oQmlnSW50ZWdlci5aRVJPKSA+IDApIHRoaXMubS5zdWJUbyhyLHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyB4L1IgbW9kIG1cbiAgICBmdW5jdGlvbiBtb250UmV2ZXJ0KHgpIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgeC5jb3B5VG8ocik7XG4gICAgICAgIHRoaXMucmVkdWNlKHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyB4ID0geC9SIG1vZCBtIChIQUMgMTQuMzIpXG4gICAgZnVuY3Rpb24gbW9udFJlZHVjZSh4KSB7XG4gICAgICAgIHdoaWxlKHgudCA8PSB0aGlzLm10MilcdC8vIHBhZCB4IHNvIGFtIGhhcyBlbm91Z2ggcm9vbSBsYXRlclxuICAgICAgICAgICAgeFt4LnQrK10gPSAwO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5tLnQ7ICsraSkge1xuICAgICAgICAgICAgLy8gZmFzdGVyIHdheSBvZiBjYWxjdWxhdGluZyB1MCA9IHhbaV0qbXAgbW9kIERWXG4gICAgICAgICAgICB2YXIgaiA9IHhbaV0mMHg3ZmZmO1xuICAgICAgICAgICAgdmFyIHUwID0gKGoqdGhpcy5tcGwrKCgoaip0aGlzLm1waCsoeFtpXT4+MTUpKnRoaXMubXBsKSZ0aGlzLnVtKTw8MTUpKSZ4LkRNO1xuICAgICAgICAgICAgLy8gdXNlIGFtIHRvIGNvbWJpbmUgdGhlIG11bHRpcGx5LXNoaWZ0LWFkZCBpbnRvIG9uZSBjYWxsXG4gICAgICAgICAgICBqID0gaSt0aGlzLm0udDtcbiAgICAgICAgICAgIHhbal0gKz0gdGhpcy5tLmFtKDAsdTAseCxpLDAsdGhpcy5tLnQpO1xuICAgICAgICAgICAgLy8gcHJvcGFnYXRlIGNhcnJ5XG4gICAgICAgICAgICB3aGlsZSh4W2pdID49IHguRFYpIHsgeFtqXSAtPSB4LkRWOyB4Wysral0rKzsgfVxuICAgICAgICB9XG4gICAgICAgIHguY2xhbXAoKTtcbiAgICAgICAgeC5kclNoaWZ0VG8odGhpcy5tLnQseCk7XG4gICAgICAgIGlmKHguY29tcGFyZVRvKHRoaXMubSkgPj0gMCkgeC5zdWJUbyh0aGlzLm0seCk7XG4gICAgfVxuXG4gICAgLy8gciA9IFwieF4yL1IgbW9kIG1cIjsgeCAhPSByXG4gICAgZnVuY3Rpb24gbW9udFNxclRvKHgscikgeyB4LnNxdWFyZVRvKHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuXG4gICAgLy8gciA9IFwieHkvUiBtb2QgbVwiOyB4LHkgIT0gclxuICAgIGZ1bmN0aW9uIG1vbnRNdWxUbyh4LHkscikgeyB4Lm11bHRpcGx5VG8oeSxyKTsgdGhpcy5yZWR1Y2Uocik7IH1cblxuICAgIE1vbnRnb21lcnkucHJvdG90eXBlLmNvbnZlcnQgPSBtb250Q29udmVydDtcbiAgICBNb250Z29tZXJ5LnByb3RvdHlwZS5yZXZlcnQgPSBtb250UmV2ZXJ0O1xuICAgIE1vbnRnb21lcnkucHJvdG90eXBlLnJlZHVjZSA9IG1vbnRSZWR1Y2U7XG4gICAgTW9udGdvbWVyeS5wcm90b3R5cGUubXVsVG8gPSBtb250TXVsVG87XG4gICAgTW9udGdvbWVyeS5wcm90b3R5cGUuc3FyVG8gPSBtb250U3FyVG87XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0cnVlIGlmZiB0aGlzIGlzIGV2ZW5cbiAgICBmdW5jdGlvbiBibnBJc0V2ZW4oKSB7IHJldHVybiAoKHRoaXMudD4wKT8odGhpc1swXSYxKTp0aGlzLnMpID09IDA7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRoaXNeZSwgZSA8IDJeMzIsIGRvaW5nIHNxciBhbmQgbXVsIHdpdGggXCJyXCIgKEhBQyAxNC43OSlcbiAgICBmdW5jdGlvbiBibnBFeHAoZSx6KSB7XG4gICAgICAgICAgICBpZihlID4gMHhmZmZmZmZmZiB8fCBlIDwgMSkgcmV0dXJuIEJpZ0ludGVnZXIuT05FO1xuICAgICAgICAgICAgdmFyIHIgPSBuYmkoKSwgcjIgPSBuYmkoKSwgZyA9IHouY29udmVydCh0aGlzKSwgaSA9IG5iaXRzKGUpLTE7XG4gICAgICAgICAgICBnLmNvcHlUbyhyKTtcbiAgICAgICAgICAgIHdoaWxlKC0taSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgei5zcXJUbyhyLHIyKTtcbiAgICAgICAgICAgICAgICBpZigoZSYoMTw8aSkpID4gMCkgei5tdWxUbyhyMixnLHIpO1xuICAgICAgICAgICAgICAgIGVsc2UgeyB2YXIgdCA9IHI7IHIgPSByMjsgcjIgPSB0OyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gei5yZXZlcnQocik7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpc15lICUgbSwgMCA8PSBlIDwgMl4zMlxuICAgIGZ1bmN0aW9uIGJuTW9kUG93SW50KGUsbSkge1xuICAgICAgICB2YXIgejtcbiAgICAgICAgaWYoZSA8IDI1NiB8fCBtLmlzRXZlbigpKSB6ID0gbmV3IENsYXNzaWMobSk7IGVsc2UgeiA9IG5ldyBNb250Z29tZXJ5KG0pO1xuICAgICAgICByZXR1cm4gdGhpcy5leHAoZSx6KTtcbiAgICB9XG5cbiAgICAvLyBwcm90ZWN0ZWRcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb3B5VG8gPSBibnBDb3B5VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbUludCA9IGJucEZyb21JbnQ7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbVN0cmluZyA9IGJucEZyb21TdHJpbmc7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2xhbXAgPSBibnBDbGFtcDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kbFNoaWZ0VG8gPSBibnBETFNoaWZ0VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZHJTaGlmdFRvID0gYm5wRFJTaGlmdFRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxTaGlmdFRvID0gYm5wTFNoaWZ0VG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuclNoaWZ0VG8gPSBibnBSU2hpZnRUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zdWJUbyA9IGJucFN1YlRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5VG8gPSBibnBNdWx0aXBseVRvO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZVRvID0gYm5wU3F1YXJlVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2UmVtVG8gPSBibnBEaXZSZW1UbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pbnZEaWdpdCA9IGJucEludkRpZ2l0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzRXZlbiA9IGJucElzRXZlbjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ibnBFeHAgPSBibnBFeHA7XG5cbiAgICAvLyBwdWJsaWNcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZyA9IGJuVG9TdHJpbmc7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubmVnYXRlID0gYm5OZWdhdGU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWJzID0gYm5BYnM7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZVRvID0gYm5Db21wYXJlVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYml0TGVuZ3RoID0gYm5CaXRMZW5ndGg7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kID0gYm5Nb2Q7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kUG93SW50ID0gYm5Nb2RQb3dJbnQ7XG5cbiAgICAvLyBcImNvbnN0YW50c1wiXG4gICAgQmlnSW50ZWdlci5aRVJPID0gbmJ2KDApO1xuICAgIEJpZ0ludGVnZXIuT05FID0gbmJ2KDEpO1xuXG4gICAgLy8gQ29weXJpZ2h0IChjKSAyMDA1LTIwMDkgIFRvbSBXdVxuICAgIC8vIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAgLy8gU2VlIFwiTElDRU5TRVwiIGZvciBkZXRhaWxzLlxuXG4gICAgLy8gRXh0ZW5kZWQgSmF2YVNjcmlwdCBCTiBmdW5jdGlvbnMsIHJlcXVpcmVkIGZvciBSU0EgcHJpdmF0ZSBvcHMuXG5cbiAgICAvLyBWZXJzaW9uIDEuMTogbmV3IEJpZ0ludGVnZXIoXCIwXCIsIDEwKSByZXR1cm5zIFwicHJvcGVyXCIgemVyb1xuXG4gICAgLy8gKHB1YmxpYylcbiAgICBmdW5jdGlvbiBibkNsb25lKCkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmNvcHlUbyhyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHJldHVybiB2YWx1ZSBhcyBpbnRlZ2VyXG4gICAgZnVuY3Rpb24gYm5JbnRWYWx1ZSgpIHtcbiAgICAgICAgaWYodGhpcy5zIDwgMCkge1xuICAgICAgICAgICAgaWYodGhpcy50ID09IDEpIHJldHVybiB0aGlzWzBdLXRoaXMuRFY7XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMudCA9PSAwKSByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnQgPT0gMSkgcmV0dXJuIHRoaXNbMF07XG4gICAgICAgIGVsc2UgaWYodGhpcy50ID09IDApIHJldHVybiAwO1xuICAgICAgICAvLyBhc3N1bWVzIDE2IDwgREIgPCAzMlxuICAgICAgICByZXR1cm4gKCh0aGlzWzFdJigoMTw8KDMyLXRoaXMuREIpKS0xKSk8PHRoaXMuREIpfHRoaXNbMF07XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIHZhbHVlIGFzIGJ5dGVcbiAgICBmdW5jdGlvbiBibkJ5dGVWYWx1ZSgpIHsgcmV0dXJuICh0aGlzLnQ9PTApP3RoaXMuczoodGhpc1swXTw8MjQpPj4yNDsgfVxuXG4gICAgLy8gKHB1YmxpYykgcmV0dXJuIHZhbHVlIGFzIHNob3J0IChhc3N1bWVzIERCPj0xNilcbiAgICBmdW5jdGlvbiBiblNob3J0VmFsdWUoKSB7IHJldHVybiAodGhpcy50PT0wKT90aGlzLnM6KHRoaXNbMF08PDE2KT4+MTY7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHJldHVybiB4IHMudC4gcl54IDwgRFZcbiAgICBmdW5jdGlvbiBibnBDaHVua1NpemUocikgeyByZXR1cm4gTWF0aC5mbG9vcihNYXRoLkxOMip0aGlzLkRCL01hdGgubG9nKHIpKTsgfVxuXG4gICAgLy8gKHB1YmxpYykgMCBpZiB0aGlzID09IDAsIDEgaWYgdGhpcyA+IDBcbiAgICBmdW5jdGlvbiBiblNpZ051bSgpIHtcbiAgICAgICAgaWYodGhpcy5zIDwgMCkgcmV0dXJuIC0xO1xuICAgICAgICBlbHNlIGlmKHRoaXMudCA8PSAwIHx8ICh0aGlzLnQgPT0gMSAmJiB0aGlzWzBdIDw9IDApKSByZXR1cm4gMDtcbiAgICAgICAgZWxzZSByZXR1cm4gMTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSBjb252ZXJ0IHRvIHJhZGl4IHN0cmluZ1xuICAgIGZ1bmN0aW9uIGJucFRvUmFkaXgoYikge1xuICAgICAgICBpZihiID09IG51bGwpIGIgPSAxMDtcbiAgICAgICAgaWYodGhpcy5zaWdudW0oKSA9PSAwIHx8IGIgPCAyIHx8IGIgPiAzNikgcmV0dXJuIFwiMFwiO1xuICAgICAgICB2YXIgY3MgPSB0aGlzLmNodW5rU2l6ZShiKTtcbiAgICAgICAgdmFyIGEgPSBNYXRoLnBvdyhiLGNzKTtcbiAgICAgICAgdmFyIGQgPSBuYnYoYSksIHkgPSBuYmkoKSwgeiA9IG5iaSgpLCByID0gXCJcIjtcbiAgICAgICAgdGhpcy5kaXZSZW1UbyhkLHkseik7XG4gICAgICAgIHdoaWxlKHkuc2lnbnVtKCkgPiAwKSB7XG4gICAgICAgICAgICByID0gKGErei5pbnRWYWx1ZSgpKS50b1N0cmluZyhiKS5zdWJzdHIoMSkgKyByO1xuICAgICAgICAgICAgeS5kaXZSZW1UbyhkLHkseik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHouaW50VmFsdWUoKS50b1N0cmluZyhiKSArIHI7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgY29udmVydCBmcm9tIHJhZGl4IHN0cmluZ1xuICAgIGZ1bmN0aW9uIGJucEZyb21SYWRpeChzLGIpIHtcbiAgICAgICAgdGhpcy5mcm9tSW50KDApO1xuICAgICAgICBpZihiID09IG51bGwpIGIgPSAxMDtcbiAgICAgICAgdmFyIGNzID0gdGhpcy5jaHVua1NpemUoYik7XG4gICAgICAgIHZhciBkID0gTWF0aC5wb3coYixjcyksIG1pID0gZmFsc2UsIGogPSAwLCB3ID0gMDtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciB4ID0gaW50QXQocyxpKTtcbiAgICAgICAgICAgIGlmKHggPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYocy5jaGFyQXQoaSkgPT0gXCItXCIgJiYgdGhpcy5zaWdudW0oKSA9PSAwKSBtaSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3ID0gYip3K3g7XG4gICAgICAgICAgICBpZigrK2ogPj0gY3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRNdWx0aXBseShkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRBZGRPZmZzZXQodywwKTtcbiAgICAgICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgICAgICB3ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihqID4gMCkge1xuICAgICAgICAgICAgdGhpcy5kTXVsdGlwbHkoTWF0aC5wb3coYixqKSk7XG4gICAgICAgICAgICB0aGlzLmRBZGRPZmZzZXQodywwKTtcbiAgICAgICAgfVxuICAgICAgICBpZihtaSkgQmlnSW50ZWdlci5aRVJPLnN1YlRvKHRoaXMsdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgYWx0ZXJuYXRlIGNvbnN0cnVjdG9yXG4gICAgZnVuY3Rpb24gYm5wRnJvbU51bWJlcihhLGIsYykge1xuICAgICAgICBpZihcIm51bWJlclwiID09IHR5cGVvZiBiKSB7XG4gICAgICAgICAgICAvLyBuZXcgQmlnSW50ZWdlcihpbnQsaW50LFJORylcbiAgICAgICAgICAgIGlmKGEgPCAyKSB0aGlzLmZyb21JbnQoMSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyb21OdW1iZXIoYSxjKTtcbiAgICAgICAgICAgICAgICBpZighdGhpcy50ZXN0Qml0KGEtMSkpXHQvLyBmb3JjZSBNU0Igc2V0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYml0d2lzZVRvKEJpZ0ludGVnZXIuT05FLnNoaWZ0TGVmdChhLTEpLG9wX29yLHRoaXMpO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMuaXNFdmVuKCkpIHRoaXMuZEFkZE9mZnNldCgxLDApOyAvLyBmb3JjZSBvZGRcbiAgICAgICAgICAgICAgICB3aGlsZSghdGhpcy5pc1Byb2JhYmxlUHJpbWUoYikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kQWRkT2Zmc2V0KDIsMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuYml0TGVuZ3RoKCkgPiBhKSB0aGlzLnN1YlRvKEJpZ0ludGVnZXIuT05FLnNoaWZ0TGVmdChhLTEpLHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5ldyBCaWdJbnRlZ2VyKGludCxSTkcpXG4gICAgICAgICAgICB2YXIgeCA9IFtdLCB0ID0gYSY3O1xuICAgICAgICAgICAgeC5sZW5ndGggPSAoYT4+MykrMTtcbiAgICAgICAgICAgIGIubmV4dEJ5dGVzKHgpO1xuICAgICAgICAgICAgaWYodCA+IDApIHhbMF0gJj0gKCgxPDx0KS0xKTsgZWxzZSB4WzBdID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJvbVN0cmluZyh4LDI1Nik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAocHVibGljKSBjb252ZXJ0IHRvIGJpZ2VuZGlhbiBieXRlIGFycmF5XG4gICAgZnVuY3Rpb24gYm5Ub0J5dGVBcnJheSgpIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnQsIHIgPSBbXTtcbiAgICAgICAgclswXSA9IHRoaXMucztcbiAgICAgICAgdmFyIHAgPSB0aGlzLkRCLShpKnRoaXMuREIpJTgsIGQsIGsgPSAwO1xuICAgICAgICBpZihpLS0gPiAwKSB7XG4gICAgICAgICAgICBpZihwIDwgdGhpcy5EQiAmJiAoZCA9IHRoaXNbaV0+PnApICE9ICh0aGlzLnMmdGhpcy5ETSk+PnApXG4gICAgICAgICAgICAgICAgcltrKytdID0gZHwodGhpcy5zPDwodGhpcy5EQi1wKSk7XG4gICAgICAgICAgICB3aGlsZShpID49IDApIHtcbiAgICAgICAgICAgICAgICBpZihwIDwgOCkge1xuICAgICAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0mKCgxPDxwKS0xKSk8PCg4LXApO1xuICAgICAgICAgICAgICAgICAgICBkIHw9IHRoaXNbLS1pXT4+KHArPXRoaXMuREItOCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkID0gKHRoaXNbaV0+PihwLT04KSkmMHhmZjtcbiAgICAgICAgICAgICAgICAgICAgaWYocCA8PSAwKSB7IHAgKz0gdGhpcy5EQjsgLS1pOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKChkJjB4ODApICE9IDApIGQgfD0gLTI1NjtcbiAgICAgICAgICAgICAgICBpZihrID09IDAgJiYgKHRoaXMucyYweDgwKSAhPSAoZCYweDgwKSkgKytrO1xuICAgICAgICAgICAgICAgIGlmKGsgPiAwIHx8IGQgIT0gdGhpcy5zKSByW2srK10gPSBkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJuRXF1YWxzKGEpIHsgcmV0dXJuKHRoaXMuY29tcGFyZVRvKGEpPT0wKTsgfVxuICAgIGZ1bmN0aW9uIGJuTWluKGEpIHsgcmV0dXJuKHRoaXMuY29tcGFyZVRvKGEpPDApP3RoaXM6YTsgfVxuICAgIGZ1bmN0aW9uIGJuTWF4KGEpIHsgcmV0dXJuKHRoaXMuY29tcGFyZVRvKGEpPjApP3RoaXM6YTsgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgciA9IHRoaXMgb3AgYSAoYml0d2lzZSlcbiAgICBmdW5jdGlvbiBibnBCaXR3aXNlVG8oYSxvcCxyKSB7XG4gICAgICAgIHZhciBpLCBmLCBtID0gTWF0aC5taW4oYS50LHRoaXMudCk7XG4gICAgICAgIGZvcihpID0gMDsgaSA8IG07ICsraSkgcltpXSA9IG9wKHRoaXNbaV0sYVtpXSk7XG4gICAgICAgIGlmKGEudCA8IHRoaXMudCkge1xuICAgICAgICAgICAgZiA9IGEucyZ0aGlzLkRNO1xuICAgICAgICAgICAgZm9yKGkgPSBtOyBpIDwgdGhpcy50OyArK2kpIHJbaV0gPSBvcCh0aGlzW2ldLGYpO1xuICAgICAgICAgICAgci50ID0gdGhpcy50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZiA9IHRoaXMucyZ0aGlzLkRNO1xuICAgICAgICAgICAgZm9yKGkgPSBtOyBpIDwgYS50OyArK2kpIHJbaV0gPSBvcChmLGFbaV0pO1xuICAgICAgICAgICAgci50ID0gYS50O1xuICAgICAgICB9XG4gICAgICAgIHIucyA9IG9wKHRoaXMucyxhLnMpO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAmIGFcbiAgICBmdW5jdGlvbiBvcF9hbmQoeCx5KSB7IHJldHVybiB4Jnk7IH1cbiAgICBmdW5jdGlvbiBibkFuZChhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuYml0d2lzZVRvKGEsb3BfYW5kLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyB8IGFcbiAgICBmdW5jdGlvbiBvcF9vcih4LHkpIHsgcmV0dXJuIHh8eTsgfVxuICAgIGZ1bmN0aW9uIGJuT3IoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmJpdHdpc2VUbyhhLG9wX29yLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyBeIGFcbiAgICBmdW5jdGlvbiBvcF94b3IoeCx5KSB7IHJldHVybiB4Xnk7IH1cbiAgICBmdW5jdGlvbiBiblhvcihhKSB7IHZhciByID0gbmJpKCk7IHRoaXMuYml0d2lzZVRvKGEsb3BfeG9yLHIpOyByZXR1cm4gcjsgfVxuXG4gICAgLy8gKHB1YmxpYykgdGhpcyAmIH5hXG4gICAgZnVuY3Rpb24gb3BfYW5kbm90KHgseSkgeyByZXR1cm4geCZ+eTsgfVxuICAgIGZ1bmN0aW9uIGJuQW5kTm90KGEpIHsgdmFyIHIgPSBuYmkoKTsgdGhpcy5iaXR3aXNlVG8oYSxvcF9hbmRub3Qscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB+dGhpc1xuICAgIGZ1bmN0aW9uIGJuTm90KCkge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy50OyArK2kpIHJbaV0gPSB0aGlzLkRNJn50aGlzW2ldO1xuICAgICAgICByLnQgPSB0aGlzLnQ7XG4gICAgICAgIHIucyA9IH50aGlzLnM7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgPDwgblxuICAgIGZ1bmN0aW9uIGJuU2hpZnRMZWZ0KG4pIHtcbiAgICAgICAgdmFyIHIgPSBuYmkoKTtcbiAgICAgICAgaWYobiA8IDApIHRoaXMuclNoaWZ0VG8oLW4scik7IGVsc2UgdGhpcy5sU2hpZnRUbyhuLHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzID4+IG5cbiAgICBmdW5jdGlvbiBiblNoaWZ0UmlnaHQobikge1xuICAgICAgICB2YXIgciA9IG5iaSgpO1xuICAgICAgICBpZihuIDwgMCkgdGhpcy5sU2hpZnRUbygtbixyKTsgZWxzZSB0aGlzLnJTaGlmdFRvKG4scik7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBpbmRleCBvZiBsb3dlc3QgMS1iaXQgaW4geCwgeCA8IDJeMzFcbiAgICBmdW5jdGlvbiBsYml0KHgpIHtcbiAgICAgICAgaWYoeCA9PSAwKSByZXR1cm4gLTE7XG4gICAgICAgIHZhciByID0gMDtcbiAgICAgICAgaWYoKHgmMHhmZmZmKSA9PSAwKSB7IHggPj49IDE2OyByICs9IDE2OyB9XG4gICAgICAgIGlmKCh4JjB4ZmYpID09IDApIHsgeCA+Pj0gODsgciArPSA4OyB9XG4gICAgICAgIGlmKCh4JjB4ZikgPT0gMCkgeyB4ID4+PSA0OyByICs9IDQ7IH1cbiAgICAgICAgaWYoKHgmMykgPT0gMCkgeyB4ID4+PSAyOyByICs9IDI7IH1cbiAgICAgICAgaWYoKHgmMSkgPT0gMCkgKytyO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm5zIGluZGV4IG9mIGxvd2VzdCAxLWJpdCAob3IgLTEgaWYgbm9uZSlcbiAgICBmdW5jdGlvbiBibkdldExvd2VzdFNldEJpdCgpIHtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMudDsgKytpKVxuICAgICAgICAgICAgaWYodGhpc1tpXSAhPSAwKSByZXR1cm4gaSp0aGlzLkRCK2xiaXQodGhpc1tpXSk7XG4gICAgICAgIGlmKHRoaXMucyA8IDApIHJldHVybiB0aGlzLnQqdGhpcy5EQjtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBudW1iZXIgb2YgMSBiaXRzIGluIHhcbiAgICBmdW5jdGlvbiBjYml0KHgpIHtcbiAgICAgICAgdmFyIHIgPSAwO1xuICAgICAgICB3aGlsZSh4ICE9IDApIHsgeCAmPSB4LTE7ICsrcjsgfVxuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSByZXR1cm4gbnVtYmVyIG9mIHNldCBiaXRzXG4gICAgZnVuY3Rpb24gYm5CaXRDb3VudCgpIHtcbiAgICAgICAgdmFyIHIgPSAwLCB4ID0gdGhpcy5zJnRoaXMuRE07XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnQ7ICsraSkgciArPSBjYml0KHRoaXNbaV1eeCk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRydWUgaWZmIG50aCBiaXQgaXMgc2V0XG4gICAgZnVuY3Rpb24gYm5UZXN0Qml0KG4pIHtcbiAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKG4vdGhpcy5EQik7XG4gICAgICAgIGlmKGogPj0gdGhpcy50KSByZXR1cm4odGhpcy5zIT0wKTtcbiAgICAgICAgcmV0dXJuKCh0aGlzW2pdJigxPDwobiV0aGlzLkRCKSkpIT0wKTtcbiAgICB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSB0aGlzIG9wICgxPDxuKVxuICAgIGZ1bmN0aW9uIGJucENoYW5nZUJpdChuLG9wKSB7XG4gICAgICAgIHZhciByID0gQmlnSW50ZWdlci5PTkUuc2hpZnRMZWZ0KG4pO1xuICAgICAgICB0aGlzLmJpdHdpc2VUbyhyLG9wLHIpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIHwgKDE8PG4pXG4gICAgZnVuY3Rpb24gYm5TZXRCaXQobikgeyByZXR1cm4gdGhpcy5jaGFuZ2VCaXQobixvcF9vcik7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgJiB+KDE8PG4pXG4gICAgZnVuY3Rpb24gYm5DbGVhckJpdChuKSB7IHJldHVybiB0aGlzLmNoYW5nZUJpdChuLG9wX2FuZG5vdCk7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgXiAoMTw8bilcbiAgICBmdW5jdGlvbiBibkZsaXBCaXQobikgeyByZXR1cm4gdGhpcy5jaGFuZ2VCaXQobixvcF94b3IpOyB9XG5cbiAgICAvLyAocHJvdGVjdGVkKSByID0gdGhpcyArIGFcbiAgICBmdW5jdGlvbiBibnBBZGRUbyhhLHIpIHtcbiAgICAgICAgdmFyIGkgPSAwLCBjID0gMCwgbSA9IE1hdGgubWluKGEudCx0aGlzLnQpO1xuICAgICAgICB3aGlsZShpIDwgbSkge1xuICAgICAgICAgICAgYyArPSB0aGlzW2ldK2FbaV07XG4gICAgICAgICAgICByW2krK10gPSBjJnRoaXMuRE07XG4gICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICB9XG4gICAgICAgIGlmKGEudCA8IHRoaXMudCkge1xuICAgICAgICAgICAgYyArPSBhLnM7XG4gICAgICAgICAgICB3aGlsZShpIDwgdGhpcy50KSB7XG4gICAgICAgICAgICAgICAgYyArPSB0aGlzW2ldO1xuICAgICAgICAgICAgICAgIHJbaSsrXSA9IGMmdGhpcy5ETTtcbiAgICAgICAgICAgICAgICBjID4+PSB0aGlzLkRCO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyArPSB0aGlzLnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjICs9IHRoaXMucztcbiAgICAgICAgICAgIHdoaWxlKGkgPCBhLnQpIHtcbiAgICAgICAgICAgICAgICBjICs9IGFbaV07XG4gICAgICAgICAgICAgICAgcltpKytdID0gYyZ0aGlzLkRNO1xuICAgICAgICAgICAgICAgIGMgPj49IHRoaXMuREI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjICs9IGEucztcbiAgICAgICAgfVxuICAgICAgICByLnMgPSAoYzwwKT8tMTowO1xuICAgICAgICBpZihjID4gMCkgcltpKytdID0gYztcbiAgICAgICAgZWxzZSBpZihjIDwgLTEpIHJbaSsrXSA9IHRoaXMuRFYrYztcbiAgICAgICAgci50ID0gaTtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgKyBhXG4gICAgZnVuY3Rpb24gYm5BZGQoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmFkZFRvKGEscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzIC0gYVxuICAgIGZ1bmN0aW9uIGJuU3VidHJhY3QoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLnN1YlRvKGEscik7IHJldHVybiByOyB9XG5cbiAgICAvLyAocHVibGljKSB0aGlzICogYVxuICAgIGZ1bmN0aW9uIGJuTXVsdGlwbHkoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLm11bHRpcGx5VG8oYSxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgLyBhXG4gICAgZnVuY3Rpb24gYm5EaXZpZGUoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmRpdlJlbVRvKGEscixudWxsKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIHRoaXMgJSBhXG4gICAgZnVuY3Rpb24gYm5SZW1haW5kZXIoYSkgeyB2YXIgciA9IG5iaSgpOyB0aGlzLmRpdlJlbVRvKGEsbnVsbCxyKTsgcmV0dXJuIHI7IH1cblxuICAgIC8vIChwdWJsaWMpIFt0aGlzL2EsdGhpcyVhXVxuICAgIGZ1bmN0aW9uIGJuRGl2aWRlQW5kUmVtYWluZGVyKGEpIHtcbiAgICAgICAgdmFyIHEgPSBuYmkoKSwgciA9IG5iaSgpO1xuICAgICAgICB0aGlzLmRpdlJlbVRvKGEscSxyKTtcbiAgICAgICAgcmV0dXJuIFtxLHJdO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRoaXMgKj0gbiwgdGhpcyA+PSAwLCAxIDwgbiA8IERWXG4gICAgZnVuY3Rpb24gYm5wRE11bHRpcGx5KG4pIHtcbiAgICAgICAgdGhpc1t0aGlzLnRdID0gdGhpcy5hbSgwLG4tMSx0aGlzLDAsMCx0aGlzLnQpO1xuICAgICAgICArK3RoaXMudDtcbiAgICAgICAgdGhpcy5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRoaXMgKz0gbiA8PCB3IHdvcmRzLCB0aGlzID49IDBcbiAgICBmdW5jdGlvbiBibnBEQWRkT2Zmc2V0KG4sdykge1xuICAgICAgICBpZihuID09IDApIHJldHVybjtcbiAgICAgICAgd2hpbGUodGhpcy50IDw9IHcpIHRoaXNbdGhpcy50KytdID0gMDtcbiAgICAgICAgdGhpc1t3XSArPSBuO1xuICAgICAgICB3aGlsZSh0aGlzW3ddID49IHRoaXMuRFYpIHtcbiAgICAgICAgICAgIHRoaXNbd10gLT0gdGhpcy5EVjtcbiAgICAgICAgICAgIGlmKCsrdyA+PSB0aGlzLnQpIHRoaXNbdGhpcy50KytdID0gMDtcbiAgICAgICAgICAgICsrdGhpc1t3XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEEgXCJudWxsXCIgcmVkdWNlclxuICAgIGZ1bmN0aW9uIE51bGxFeHAoKSB7fVxuICAgIGZ1bmN0aW9uIG5Ob3AoeCkgeyByZXR1cm4geDsgfVxuICAgIGZ1bmN0aW9uIG5NdWxUbyh4LHkscikgeyB4Lm11bHRpcGx5VG8oeSxyKTsgfVxuICAgIGZ1bmN0aW9uIG5TcXJUbyh4LHIpIHsgeC5zcXVhcmVUbyhyKTsgfVxuXG4gICAgTnVsbEV4cC5wcm90b3R5cGUuY29udmVydCA9IG5Ob3A7XG4gICAgTnVsbEV4cC5wcm90b3R5cGUucmV2ZXJ0ID0gbk5vcDtcbiAgICBOdWxsRXhwLnByb3RvdHlwZS5tdWxUbyA9IG5NdWxUbztcbiAgICBOdWxsRXhwLnByb3RvdHlwZS5zcXJUbyA9IG5TcXJUbztcblxuICAgIC8vIChwdWJsaWMpIHRoaXNeZVxuICAgIGZ1bmN0aW9uIGJuUG93KGUpIHsgcmV0dXJuIHRoaXMuYm5wRXhwKGUsbmV3IE51bGxFeHAoKSk7IH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSBsb3dlciBuIHdvcmRzIG9mIFwidGhpcyAqIGFcIiwgYS50IDw9IG5cbiAgICAvLyBcInRoaXNcIiBzaG91bGQgYmUgdGhlIGxhcmdlciBvbmUgaWYgYXBwcm9wcmlhdGUuXG4gICAgZnVuY3Rpb24gYm5wTXVsdGlwbHlMb3dlclRvKGEsbixyKSB7XG4gICAgICAgIHZhciBpID0gTWF0aC5taW4odGhpcy50K2EudCxuKTtcbiAgICAgICAgci5zID0gMDsgLy8gYXNzdW1lcyBhLHRoaXMgPj0gMFxuICAgICAgICByLnQgPSBpO1xuICAgICAgICB3aGlsZShpID4gMCkgclstLWldID0gMDtcbiAgICAgICAgdmFyIGo7XG4gICAgICAgIGZvcihqID0gci50LXRoaXMudDsgaSA8IGo7ICsraSkgcltpK3RoaXMudF0gPSB0aGlzLmFtKDAsYVtpXSxyLGksMCx0aGlzLnQpO1xuICAgICAgICBmb3IoaiA9IE1hdGgubWluKGEudCxuKTsgaSA8IGo7ICsraSkgdGhpcy5hbSgwLGFbaV0scixpLDAsbi1pKTtcbiAgICAgICAgci5jbGFtcCgpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHIgPSBcInRoaXMgKiBhXCIgd2l0aG91dCBsb3dlciBuIHdvcmRzLCBuID4gMFxuICAgIC8vIFwidGhpc1wiIHNob3VsZCBiZSB0aGUgbGFyZ2VyIG9uZSBpZiBhcHByb3ByaWF0ZS5cbiAgICBmdW5jdGlvbiBibnBNdWx0aXBseVVwcGVyVG8oYSxuLHIpIHtcbiAgICAgICAgLS1uO1xuICAgICAgICB2YXIgaSA9IHIudCA9IHRoaXMudCthLnQtbjtcbiAgICAgICAgci5zID0gMDsgLy8gYXNzdW1lcyBhLHRoaXMgPj0gMFxuICAgICAgICB3aGlsZSgtLWkgPj0gMCkgcltpXSA9IDA7XG4gICAgICAgIGZvcihpID0gTWF0aC5tYXgobi10aGlzLnQsMCk7IGkgPCBhLnQ7ICsraSlcbiAgICAgICAgICAgIHJbdGhpcy50K2ktbl0gPSB0aGlzLmFtKG4taSxhW2ldLHIsMCwwLHRoaXMudCtpLW4pO1xuICAgICAgICByLmNsYW1wKCk7XG4gICAgICAgIHIuZHJTaGlmdFRvKDEscik7XG4gICAgfVxuXG4gICAgLy8gQmFycmV0dCBtb2R1bGFyIHJlZHVjdGlvblxuICAgIGZ1bmN0aW9uIEJhcnJldHQobSkge1xuICAgICAgICAvLyBzZXR1cCBCYXJyZXR0XG4gICAgICAgIHRoaXMucjIgPSBuYmkoKTtcbiAgICAgICAgdGhpcy5xMyA9IG5iaSgpO1xuICAgICAgICBCaWdJbnRlZ2VyLk9ORS5kbFNoaWZ0VG8oMiptLnQsdGhpcy5yMik7XG4gICAgICAgIHRoaXMubXUgPSB0aGlzLnIyLmRpdmlkZShtKTtcbiAgICAgICAgdGhpcy5tID0gbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYXJyZXR0Q29udmVydCh4KSB7XG4gICAgICAgIGlmKHgucyA8IDAgfHwgeC50ID4gMip0aGlzLm0udCkgcmV0dXJuIHgubW9kKHRoaXMubSk7XG4gICAgICAgIGVsc2UgaWYoeC5jb21wYXJlVG8odGhpcy5tKSA8IDApIHJldHVybiB4O1xuICAgICAgICBlbHNlIHsgdmFyIHIgPSBuYmkoKTsgeC5jb3B5VG8ocik7IHRoaXMucmVkdWNlKHIpOyByZXR1cm4gcjsgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJhcnJldHRSZXZlcnQoeCkgeyByZXR1cm4geDsgfVxuXG4gICAgLy8geCA9IHggbW9kIG0gKEhBQyAxNC40MilcbiAgICBmdW5jdGlvbiBiYXJyZXR0UmVkdWNlKHgpIHtcbiAgICAgICAgeC5kclNoaWZ0VG8odGhpcy5tLnQtMSx0aGlzLnIyKTtcbiAgICAgICAgaWYoeC50ID4gdGhpcy5tLnQrMSkgeyB4LnQgPSB0aGlzLm0udCsxOyB4LmNsYW1wKCk7IH1cbiAgICAgICAgdGhpcy5tdS5tdWx0aXBseVVwcGVyVG8odGhpcy5yMix0aGlzLm0udCsxLHRoaXMucTMpO1xuICAgICAgICB0aGlzLm0ubXVsdGlwbHlMb3dlclRvKHRoaXMucTMsdGhpcy5tLnQrMSx0aGlzLnIyKTtcbiAgICAgICAgd2hpbGUoeC5jb21wYXJlVG8odGhpcy5yMikgPCAwKSB4LmRBZGRPZmZzZXQoMSx0aGlzLm0udCsxKTtcbiAgICAgICAgeC5zdWJUbyh0aGlzLnIyLHgpO1xuICAgICAgICB3aGlsZSh4LmNvbXBhcmVUbyh0aGlzLm0pID49IDApIHguc3ViVG8odGhpcy5tLHgpO1xuICAgIH1cblxuICAgIC8vIHIgPSB4XjIgbW9kIG07IHggIT0gclxuICAgIGZ1bmN0aW9uIGJhcnJldHRTcXJUbyh4LHIpIHsgeC5zcXVhcmVUbyhyKTsgdGhpcy5yZWR1Y2Uocik7IH1cblxuICAgIC8vIHIgPSB4KnkgbW9kIG07IHgseSAhPSByXG4gICAgZnVuY3Rpb24gYmFycmV0dE11bFRvKHgseSxyKSB7IHgubXVsdGlwbHlUbyh5LHIpOyB0aGlzLnJlZHVjZShyKTsgfVxuXG4gICAgQmFycmV0dC5wcm90b3R5cGUuY29udmVydCA9IGJhcnJldHRDb252ZXJ0O1xuICAgIEJhcnJldHQucHJvdG90eXBlLnJldmVydCA9IGJhcnJldHRSZXZlcnQ7XG4gICAgQmFycmV0dC5wcm90b3R5cGUucmVkdWNlID0gYmFycmV0dFJlZHVjZTtcbiAgICBCYXJyZXR0LnByb3RvdHlwZS5tdWxUbyA9IGJhcnJldHRNdWxUbztcbiAgICBCYXJyZXR0LnByb3RvdHlwZS5zcXJUbyA9IGJhcnJldHRTcXJUbztcblxuICAgIC8vIChwdWJsaWMpIHRoaXNeZSAlIG0gKEhBQyAxNC44NSlcbiAgICBmdW5jdGlvbiBibk1vZFBvdyhlLG0pIHtcbiAgICAgICAgdmFyIGkgPSBlLmJpdExlbmd0aCgpLCBrLCByID0gbmJ2KDEpLCB6O1xuICAgICAgICBpZihpIDw9IDApIHJldHVybiByO1xuICAgICAgICBlbHNlIGlmKGkgPCAxOCkgayA9IDE7XG4gICAgICAgIGVsc2UgaWYoaSA8IDQ4KSBrID0gMztcbiAgICAgICAgZWxzZSBpZihpIDwgMTQ0KSBrID0gNDtcbiAgICAgICAgZWxzZSBpZihpIDwgNzY4KSBrID0gNTtcbiAgICAgICAgZWxzZSBrID0gNjtcbiAgICAgICAgaWYoaSA8IDgpXG4gICAgICAgICAgICB6ID0gbmV3IENsYXNzaWMobSk7XG4gICAgICAgIGVsc2UgaWYobS5pc0V2ZW4oKSlcbiAgICAgICAgICAgIHogPSBuZXcgQmFycmV0dChtKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeiA9IG5ldyBNb250Z29tZXJ5KG0pO1xuXG4gICAgICAgIC8vIHByZWNvbXB1dGF0aW9uXG4gICAgICAgIHZhciBnID0gW10sIG4gPSAzLCBrMSA9IGstMSwga20gPSAoMTw8ayktMTtcbiAgICAgICAgZ1sxXSA9IHouY29udmVydCh0aGlzKTtcbiAgICAgICAgaWYoayA+IDEpIHtcbiAgICAgICAgICAgIHZhciBnMiA9IG5iaSgpO1xuICAgICAgICAgICAgei5zcXJUbyhnWzFdLGcyKTtcbiAgICAgICAgICAgIHdoaWxlKG4gPD0ga20pIHtcbiAgICAgICAgICAgICAgICBnW25dID0gbmJpKCk7XG4gICAgICAgICAgICAgICAgei5tdWxUbyhnMixnW24tMl0sZ1tuXSk7XG4gICAgICAgICAgICAgICAgbiArPSAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGogPSBlLnQtMSwgdywgaXMxID0gdHJ1ZSwgcjIgPSBuYmkoKSwgdDtcbiAgICAgICAgaSA9IG5iaXRzKGVbal0pLTE7XG4gICAgICAgIHdoaWxlKGogPj0gMCkge1xuICAgICAgICAgICAgaWYoaSA+PSBrMSkgdyA9IChlW2pdPj4oaS1rMSkpJmttO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdyA9IChlW2pdJigoMTw8KGkrMSkpLTEpKTw8KGsxLWkpO1xuICAgICAgICAgICAgICAgIGlmKGogPiAwKSB3IHw9IGVbai0xXT4+KHRoaXMuREIraS1rMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG4gPSBrO1xuICAgICAgICAgICAgd2hpbGUoKHcmMSkgPT0gMCkgeyB3ID4+PSAxOyAtLW47IH1cbiAgICAgICAgICAgIGlmKChpIC09IG4pIDwgMCkgeyBpICs9IHRoaXMuREI7IC0tajsgfVxuICAgICAgICAgICAgaWYoaXMxKSB7XHQvLyByZXQgPT0gMSwgZG9uJ3QgYm90aGVyIHNxdWFyaW5nIG9yIG11bHRpcGx5aW5nIGl0XG4gICAgICAgICAgICAgICAgZ1t3XS5jb3B5VG8ocik7XG4gICAgICAgICAgICAgICAgaXMxID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aGlsZShuID4gMSkgeyB6LnNxclRvKHIscjIpOyB6LnNxclRvKHIyLHIpOyBuIC09IDI7IH1cbiAgICAgICAgICAgICAgICBpZihuID4gMCkgei5zcXJUbyhyLHIyKTsgZWxzZSB7IHQgPSByOyByID0gcjI7IHIyID0gdDsgfVxuICAgICAgICAgICAgICAgIHoubXVsVG8ocjIsZ1t3XSxyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUoaiA+PSAwICYmIChlW2pdJigxPDxpKSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHouc3FyVG8ocixyMik7IHQgPSByOyByID0gcjI7IHIyID0gdDtcbiAgICAgICAgICAgICAgICBpZigtLWkgPCAwKSB7IGkgPSB0aGlzLkRCLTE7IC0tajsgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB6LnJldmVydChyKTtcbiAgICB9XG5cbiAgICAvLyAocHVibGljKSBnY2QodGhpcyxhKSAoSEFDIDE0LjU0KVxuICAgIGZ1bmN0aW9uIGJuR0NEKGEpIHtcbiAgICAgICAgdmFyIHggPSAodGhpcy5zPDApP3RoaXMubmVnYXRlKCk6dGhpcy5jbG9uZSgpO1xuICAgICAgICB2YXIgeSA9IChhLnM8MCk/YS5uZWdhdGUoKTphLmNsb25lKCk7XG4gICAgICAgIGlmKHguY29tcGFyZVRvKHkpIDwgMCkgeyB2YXIgdCA9IHg7IHggPSB5OyB5ID0gdDsgfVxuICAgICAgICB2YXIgaSA9IHguZ2V0TG93ZXN0U2V0Qml0KCksIGcgPSB5LmdldExvd2VzdFNldEJpdCgpO1xuICAgICAgICBpZihnIDwgMCkgcmV0dXJuIHg7XG4gICAgICAgIGlmKGkgPCBnKSBnID0gaTtcbiAgICAgICAgaWYoZyA+IDApIHtcbiAgICAgICAgICAgIHguclNoaWZ0VG8oZyx4KTtcbiAgICAgICAgICAgIHkuclNoaWZ0VG8oZyx5KTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSh4LnNpZ251bSgpID4gMCkge1xuICAgICAgICAgICAgaWYoKGkgPSB4LmdldExvd2VzdFNldEJpdCgpKSA+IDApIHguclNoaWZ0VG8oaSx4KTtcbiAgICAgICAgICAgIGlmKChpID0geS5nZXRMb3dlc3RTZXRCaXQoKSkgPiAwKSB5LnJTaGlmdFRvKGkseSk7XG4gICAgICAgICAgICBpZih4LmNvbXBhcmVUbyh5KSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgeC5zdWJUbyh5LHgpO1xuICAgICAgICAgICAgICAgIHguclNoaWZ0VG8oMSx4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHkuc3ViVG8oeCx5KTtcbiAgICAgICAgICAgICAgICB5LnJTaGlmdFRvKDEseSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoZyA+IDApIHkubFNoaWZ0VG8oZyx5KTtcbiAgICAgICAgcmV0dXJuIHk7XG4gICAgfVxuXG4gICAgLy8gKHByb3RlY3RlZCkgdGhpcyAlIG4sIG4gPCAyXjI2XG4gICAgZnVuY3Rpb24gYm5wTW9kSW50KG4pIHtcbiAgICAgICAgaWYobiA8PSAwKSByZXR1cm4gMDtcbiAgICAgICAgdmFyIGQgPSB0aGlzLkRWJW4sIHIgPSAodGhpcy5zPDApP24tMTowO1xuICAgICAgICBpZih0aGlzLnQgPiAwKVxuICAgICAgICAgICAgaWYoZCA9PSAwKSByID0gdGhpc1swXSVuO1xuICAgICAgICBlbHNlIGZvcih2YXIgaSA9IHRoaXMudC0xOyBpID49IDA7IC0taSkgciA9IChkKnIrdGhpc1tpXSklbjtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgLy8gKHB1YmxpYykgMS90aGlzICUgbSAoSEFDIDE0LjYxKVxuICAgIGZ1bmN0aW9uIGJuTW9kSW52ZXJzZShtKSB7XG4gICAgICAgIHZhciBhYyA9IG0uaXNFdmVuKCk7XG4gICAgICAgIGlmKCh0aGlzLmlzRXZlbigpICYmIGFjKSB8fCBtLnNpZ251bSgpID09IDApIHJldHVybiBCaWdJbnRlZ2VyLlpFUk87XG4gICAgICAgIHZhciB1ID0gbS5jbG9uZSgpLCB2ID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICB2YXIgYSA9IG5idigxKSwgYiA9IG5idigwKSwgYyA9IG5idigwKSwgZCA9IG5idigxKTtcbiAgICAgICAgd2hpbGUodS5zaWdudW0oKSAhPSAwKSB7XG4gICAgICAgICAgICB3aGlsZSh1LmlzRXZlbigpKSB7XG4gICAgICAgICAgICAgICAgdS5yU2hpZnRUbygxLHUpO1xuICAgICAgICAgICAgICAgIGlmKGFjKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKCFhLmlzRXZlbigpIHx8ICFiLmlzRXZlbigpKSB7IGEuYWRkVG8odGhpcyxhKTsgYi5zdWJUbyhtLGIpOyB9XG4gICAgICAgICAgICAgICAgICAgIGEuclNoaWZ0VG8oMSxhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZighYi5pc0V2ZW4oKSkgYi5zdWJUbyhtLGIpO1xuICAgICAgICAgICAgICAgIGIuclNoaWZ0VG8oMSxiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlKHYuaXNFdmVuKCkpIHtcbiAgICAgICAgICAgICAgICB2LnJTaGlmdFRvKDEsdik7XG4gICAgICAgICAgICAgICAgaWYoYWMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIWMuaXNFdmVuKCkgfHwgIWQuaXNFdmVuKCkpIHsgYy5hZGRUbyh0aGlzLGMpOyBkLnN1YlRvKG0sZCk7IH1cbiAgICAgICAgICAgICAgICAgICAgYy5yU2hpZnRUbygxLGMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKCFkLmlzRXZlbigpKSBkLnN1YlRvKG0sZCk7XG4gICAgICAgICAgICAgICAgZC5yU2hpZnRUbygxLGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodS5jb21wYXJlVG8odikgPj0gMCkge1xuICAgICAgICAgICAgICAgIHUuc3ViVG8odix1KTtcbiAgICAgICAgICAgICAgICBpZihhYykgYS5zdWJUbyhjLGEpO1xuICAgICAgICAgICAgICAgIGIuc3ViVG8oZCxiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHYuc3ViVG8odSx2KTtcbiAgICAgICAgICAgICAgICBpZihhYykgYy5zdWJUbyhhLGMpO1xuICAgICAgICAgICAgICAgIGQuc3ViVG8oYixkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih2LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkgIT0gMCkgcmV0dXJuIEJpZ0ludGVnZXIuWkVSTztcbiAgICAgICAgaWYoZC5jb21wYXJlVG8obSkgPj0gMCkgcmV0dXJuIGQuc3VidHJhY3QobSk7XG4gICAgICAgIGlmKGQuc2lnbnVtKCkgPCAwKSBkLmFkZFRvKG0sZCk7IGVsc2UgcmV0dXJuIGQ7XG4gICAgICAgIGlmKGQuc2lnbnVtKCkgPCAwKSByZXR1cm4gZC5hZGQobSk7IGVsc2UgcmV0dXJuIGQ7XG4gICAgfVxuXG4gICAgdmFyIGxvd3ByaW1lcyA9IFsyLDMsNSw3LDExLDEzLDE3LDE5LDIzLDI5LDMxLDM3LDQxLDQzLDQ3LDUzLDU5LDYxLDY3LDcxLDczLDc5LDgzLDg5LDk3LDEwMSwxMDMsMTA3LDEwOSwxMTMsMTI3LDEzMSwxMzcsMTM5LDE0OSwxNTEsMTU3LDE2MywxNjcsMTczLDE3OSwxODEsMTkxLDE5MywxOTcsMTk5LDIxMSwyMjMsMjI3LDIyOSwyMzMsMjM5LDI0MSwyNTEsMjU3LDI2MywyNjksMjcxLDI3NywyODEsMjgzLDI5MywzMDcsMzExLDMxMywzMTcsMzMxLDMzNywzNDcsMzQ5LDM1MywzNTksMzY3LDM3MywzNzksMzgzLDM4OSwzOTcsNDAxLDQwOSw0MTksNDIxLDQzMSw0MzMsNDM5LDQ0Myw0NDksNDU3LDQ2MSw0NjMsNDY3LDQ3OSw0ODcsNDkxLDQ5OSw1MDMsNTA5XTtcbiAgICB2YXIgbHBsaW0gPSAoMTw8MjYpL2xvd3ByaW1lc1tsb3dwcmltZXMubGVuZ3RoLTFdO1xuXG4gICAgLy8gKHB1YmxpYykgdGVzdCBwcmltYWxpdHkgd2l0aCBjZXJ0YWludHkgPj0gMS0uNV50XG4gICAgZnVuY3Rpb24gYm5Jc1Byb2JhYmxlUHJpbWUodCkge1xuICAgICAgICB2YXIgaSwgeCA9IHRoaXMuYWJzKCk7XG4gICAgICAgIGlmKHgudCA9PSAxICYmIHhbMF0gPD0gbG93cHJpbWVzW2xvd3ByaW1lcy5sZW5ndGgtMV0pIHtcbiAgICAgICAgICAgIGZvcihpID0gMDsgaSA8IGxvd3ByaW1lcy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBpZih4WzBdID09IGxvd3ByaW1lc1tpXSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoeC5pc0V2ZW4oKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpID0gMTtcbiAgICAgICAgd2hpbGUoaSA8IGxvd3ByaW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBtID0gbG93cHJpbWVzW2ldLCBqID0gaSsxO1xuICAgICAgICAgICAgd2hpbGUoaiA8IGxvd3ByaW1lcy5sZW5ndGggJiYgbSA8IGxwbGltKSBtICo9IGxvd3ByaW1lc1tqKytdO1xuICAgICAgICAgICAgbSA9IHgubW9kSW50KG0pO1xuICAgICAgICAgICAgd2hpbGUoaSA8IGopIGlmKG0lbG93cHJpbWVzW2krK10gPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4Lm1pbGxlclJhYmluKHQpO1xuICAgIH1cblxuICAgIC8vIChwcm90ZWN0ZWQpIHRydWUgaWYgcHJvYmFibHkgcHJpbWUgKEhBQyA0LjI0LCBNaWxsZXItUmFiaW4pXG4gICAgZnVuY3Rpb24gYm5wTWlsbGVyUmFiaW4odCkge1xuICAgICAgICB2YXIgbjEgPSB0aGlzLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKTtcbiAgICAgICAgdmFyIGsgPSBuMS5nZXRMb3dlc3RTZXRCaXQoKTtcbiAgICAgICAgaWYoayA8PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciByID0gbjEuc2hpZnRSaWdodChrKTtcbiAgICAgICAgdCA9ICh0KzEpPj4xO1xuICAgICAgICBpZih0ID4gbG93cHJpbWVzLmxlbmd0aCkgdCA9IGxvd3ByaW1lcy5sZW5ndGg7XG4gICAgICAgIHZhciBhID0gbmJpKCk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0OyArK2kpIHtcbiAgICAgICAgICAgIGEuZnJvbUludChsb3dwcmltZXNbaV0pO1xuICAgICAgICAgICAgdmFyIHkgPSBhLm1vZFBvdyhyLHRoaXMpO1xuICAgICAgICAgICAgaWYoeS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpICE9IDAgJiYgeS5jb21wYXJlVG8objEpICE9IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgaiA9IDE7XG4gICAgICAgICAgICAgICAgd2hpbGUoaisrIDwgayAmJiB5LmNvbXBhcmVUbyhuMSkgIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB5ID0geS5tb2RQb3dJbnQoMix0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoeS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpID09IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoeS5jb21wYXJlVG8objEpICE9IDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuXG4gICAgLy8gcHJvdGVjdGVkXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2h1bmtTaXplID0gYm5wQ2h1bmtTaXplO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvUmFkaXggPSBibnBUb1JhZGl4O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmZyb21SYWRpeCA9IGJucEZyb21SYWRpeDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tTnVtYmVyID0gYm5wRnJvbU51bWJlcjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXR3aXNlVG8gPSBibnBCaXR3aXNlVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2hhbmdlQml0ID0gYm5wQ2hhbmdlQml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFkZFRvID0gYm5wQWRkVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZE11bHRpcGx5ID0gYm5wRE11bHRpcGx5O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRBZGRPZmZzZXQgPSBibnBEQWRkT2Zmc2V0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5TG93ZXJUbyA9IGJucE11bHRpcGx5TG93ZXJUbztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseVVwcGVyVG8gPSBibnBNdWx0aXBseVVwcGVyVG87XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kSW50ID0gYm5wTW9kSW50O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1pbGxlclJhYmluID0gYm5wTWlsbGVyUmFiaW47XG5cbiAgICAvLyBwdWJsaWNcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbG9uZSA9IGJuQ2xvbmU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaW50VmFsdWUgPSBibkludFZhbHVlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmJ5dGVWYWx1ZSA9IGJuQnl0ZVZhbHVlO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNob3J0VmFsdWUgPSBiblNob3J0VmFsdWU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc2lnbnVtID0gYm5TaWdOdW07XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9CeXRlQXJyYXkgPSBiblRvQnl0ZUFycmF5O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmVxdWFscyA9IGJuRXF1YWxzO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1pbiA9IGJuTWluO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1heCA9IGJuTWF4O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFuZCA9IGJuQW5kO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm9yID0gYm5PcjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS54b3IgPSBiblhvcjtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmROb3QgPSBibkFuZE5vdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3QgPSBibk5vdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQgPSBiblNoaWZ0TGVmdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0ID0gYm5TaGlmdFJpZ2h0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdldExvd2VzdFNldEJpdCA9IGJuR2V0TG93ZXN0U2V0Qml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmJpdENvdW50ID0gYm5CaXRDb3VudDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50ZXN0Qml0ID0gYm5UZXN0Qml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNldEJpdCA9IGJuU2V0Qml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmNsZWFyQml0ID0gYm5DbGVhckJpdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5mbGlwQml0ID0gYm5GbGlwQml0O1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFkZCA9IGJuQWRkO1xuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0ID0gYm5TdWJ0cmFjdDtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseSA9IGJuTXVsdGlwbHk7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlID0gYm5EaXZpZGU7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyID0gYm5SZW1haW5kZXI7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlQW5kUmVtYWluZGVyID0gYm5EaXZpZGVBbmRSZW1haW5kZXI7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kUG93ID0gYm5Nb2RQb3c7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubW9kSW52ZXJzZSA9IGJuTW9kSW52ZXJzZTtcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3cgPSBiblBvdztcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5leHB0ID0gYm5Qb3c7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZ2NkID0gYm5HQ0Q7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lID0gYm5Jc1Byb2JhYmxlUHJpbWU7XG5cbiAgICAvLyBCaWdJbnRlZ2VyIGludGVyZmFjZXMgbm90IGltcGxlbWVudGVkIGluIGpzYm46XG5cbiAgICAvLyBCaWdJbnRlZ2VyKGludCBzaWdudW0sIGJ5dGVbXSBtYWduaXR1ZGUpXG4gICAgLy8gZG91YmxlIGRvdWJsZVZhbHVlKClcbiAgICAvLyBmbG9hdCBmbG9hdFZhbHVlKClcbiAgICAvLyBpbnQgaGFzaENvZGUoKVxuICAgIC8vIGxvbmcgbG9uZ1ZhbHVlKClcbiAgICAvLyBzdGF0aWMgQmlnSW50ZWdlciB2YWx1ZU9mKGxvbmcgdmFsKVxuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gRU5EIE9GIGNvcHktYW5kLXBhc3RlIG9mIGpzYm4uXG5cblxuXG4gICAgQmlnSW50ZWdlci5ORUdBVElWRV9PTkUgPSBCaWdJbnRlZ2VyLk9ORS5uZWdhdGUoKTtcblxuXG4gICAgLy8gT3RoZXIgbWV0aG9kcyB3ZSBuZWVkIHRvIGFkZCBmb3IgY29tcGF0aWJpbHR5IHdpdGgganMtbnVtYmVycyBudW1lcmljIHRvd2VyLlxuXG4gICAgLy8gYWRkIGlzIGltcGxlbWVudGVkIGFib3ZlLlxuICAgIC8vIHN1YnRyYWN0IGlzIGltcGxlbWVudGVkIGFib3ZlLlxuICAgIC8vIG11bHRpcGx5IGlzIGltcGxlbWVudGVkIGFib3ZlLlxuICAgIC8vIGVxdWFscyBpcyBpbXBsZW1lbnRlZCBhYm92ZS5cbiAgICAvLyBhYnMgaXMgaW1wbGVtZW50ZWQgYWJvdmUuXG4gICAgLy8gbmVnYXRlIGlzIGRlZmluZWQgYWJvdmUuXG5cbiAgICAvLyBtYWtlQmlnbnVtOiBzdHJpbmcgLT4gQmlnSW50ZWdlclxuICAgIHZhciBtYWtlQmlnbnVtID0gZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAodHlwZW9mKHMpID09PSAnbnVtYmVyJykgeyBzID0gcyArICcnOyB9XG4gICAgICAgIHMgPSBleHBhbmRFeHBvbmVudChzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHMsIDEwKTtcbiAgICB9O1xuXG4gICAgdmFyIHplcm9zdHJpbmcgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHZhciBidWYgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIGJ1Zi5wdXNoKCcwJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbiAgICB9O1xuXG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXZlbCA9IDA7XG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubGlmdFRvID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmF0aW9uYWwodGhpcywgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5sZXZlbCA9PT0gMikge1xuICAgICAgICAgICAgdmFyIGZpeHJlcCA9IHRoaXMudG9GaXhudW0oKTtcbiAgICAgICAgICAgIGlmIChmaXhyZXAgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgICAgICAgICAgICAgICByZXR1cm4gVE9PX1BPU0lUSVZFX1RPX1JFUFJFU0VOVDtcbiAgICAgICAgICAgIGlmIChmaXhyZXAgPT09IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgICAgICAgICAgICAgICByZXR1cm4gVE9PX05FR0FUSVZFX1RPX1JFUFJFU0VOVDtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXRQb2ludChmaXhyZXApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQubGV2ZWwgPT09IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcGxleCh0aGlzLCAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhyb3dSdW50aW1lRXJyb3IoXCJpbnZhbGlkIGxldmVsIGZvciBCaWdJbnRlZ2VyIGxpZnRcIiwgdGhpcywgdGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNGaW5pdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzSW50ZWdlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNSYXRpb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNSZWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0V4YWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0luZXhhY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEZsb2F0UG9pbnQubWFrZUluc3RhbmNlKHRoaXMudG9GaXhudW0oKSk7XG4gICAgfTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvRml4bnVtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAwLCBzdHIgPSB0aGlzLnRvU3RyaW5nKCksIGk7XG4gICAgICAgIGlmIChzdHJbMF0gPT09ICctJykge1xuICAgICAgICAgICAgZm9yIChpPTE7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKiAxMCArIE51bWJlcihzdHJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC1yZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGk9MDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCAqIDEwICsgTnVtYmVyKHN0cltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlVG8ob3RoZXIpID4gMDtcbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZVRvKG90aGVyKSA+PSAwO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVUbyhvdGhlcikgPCAwO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlVG8ob3RoZXIpIDw9IDA7XG4gICAgfTtcblxuICAgIC8vIGRpdmlkZTogc2NoZW1lLW51bWJlciAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gV0FSTklORyBOT1RFOiB3ZSBvdmVycmlkZSB0aGUgb2xkIHZlcnNpb24gb2YgZGl2aWRlLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHZhciBxdW90aWVudEFuZFJlbWFpbmRlciA9IGJuRGl2aWRlQW5kUmVtYWluZGVyLmNhbGwodGhpcywgb3RoZXIpO1xuICAgICAgICBpZiAocXVvdGllbnRBbmRSZW1haW5kZXJbMV0uY29tcGFyZVRvKEJpZ0ludGVnZXIuWkVSTykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90aWVudEFuZFJlbWFpbmRlclswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBhZGQocXVvdGllbnRBbmRSZW1haW5kZXJbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJhdGlvbmFsLm1ha2VJbnN0YW5jZShxdW90aWVudEFuZFJlbWFpbmRlclsxXSwgb3RoZXIpKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubnVtZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5kZW5vbWluYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9O1xuXG5cbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENsYXNzaWMgaW1wbGVtZW50YXRpb24gb2YgTmV3dG9uLVJhbHBoc29uIHNxdWFyZS1yb290IHNlYXJjaCxcbiAgICAgICAgLy8gYWRhcHRlZCBmb3IgaW50ZWdlci1zcXJ0LlxuICAgICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05ld3RvbidzX21ldGhvZCNTcXVhcmVfcm9vdF9vZl9hX251bWJlclxuICAgICAgICAgICAgdmFyIHNlYXJjaEl0ZXIgPSBmdW5jdGlvbihuLCBndWVzcykge1xuICAgICAgICAgICAgICAgIHdoaWxlKCEobGVzc1RoYW5PckVxdWFsKHNxcihndWVzcyksbikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlc3NUaGFuKG4sc3FyKGFkZChndWVzcywgMSkpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Vlc3MgPSBmbG9vcihkaXZpZGUoYWRkKGd1ZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvb3IoZGl2aWRlKG4sIGd1ZXNzKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBndWVzcztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGludGVnZXJTcXJ0OiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgICAgICAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pbnRlZ2VyU3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBuO1xuICAgICAgICAgICAgICAgIGlmKHNpZ24odGhpcykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VhcmNoSXRlcih0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuID0gdGhpcy5uZWdhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIENvbXBsZXgubWFrZUluc3RhbmNlKDAsIHNlYXJjaEl0ZXIobiwgbikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgfSkoKTtcblxuXG4gICAgLy8gc3FydDogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmV3dG9uJ3NfbWV0aG9kI1NxdWFyZV9yb290X29mX2FfbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgc3F1YXJlIHJvb3QuXG4gICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBHZXQgYW4gYXBwcm94aW1hdGlvbiB1c2luZyBpbnRlZ2VyU3FydCwgYW5kIHRoZW4gc3RhcnQgYW5vdGhlclxuICAgICAgICAvLyBOZXd0b24tUmFscGhzb24gc2VhcmNoIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgQmlnSW50ZWdlci5wcm90b3R5cGUuc3FydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFwcHJveCA9IHRoaXMuaW50ZWdlclNxcnQoKSwgZml4O1xuICAgICAgICAgICAgaWYgKGVxdihzcXIoYXBwcm94KSwgdGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwcm94O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZml4ID0gdG9GaXhudW0odGhpcyk7XG4gICAgICAgICAgICBpZiAoaXNGaW5pdGUoZml4KSkge1xuICAgICAgICAgICAgICAgIGlmIChmaXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRmxvYXRQb2ludC5tYWtlSW5zdGFuY2UoTWF0aC5zcXJ0KGZpeCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBDb21wbGV4Lm1ha2VJbnN0YW5jZShcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBGbG9hdFBvaW50Lm1ha2VJbnN0YW5jZShNYXRoLnNxcnQoLWZpeCkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHByb3g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIC8vIGZsb29yOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgZmxvb3IuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZmxvb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gY2VpbGluZzogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNlaWxpbmcuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY2VpbGluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIC8vIFVudGlsIHdlIGhhdmUgYSBmZWF0dXJlLWNvbXBsZXRlIEJpZyBOdW1iZXIgaW1wbGVtZW50YXRpb24sIHdlJ2xsXG4gICAgLy8gY29udmVydCBCaWdJbnRlZ2VyIG9iamVjdHMgaW50byBGbG9hdFBvaW50IG9iamVjdHMgYW5kIHBlcmZvcm1cbiAgICAvLyB1bnN1cHBvcnRlZCBvcGVyYXRpb25zIHRoZXJlLlxuICAgIGZ1bmN0aW9uIHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoZnVuY3Rpb25fbmFtZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluZXhhY3QgPSB0aGlzLnRvSW5leGFjdCgpO1xuICAgICAgICByZXR1cm4gaW5leGFjdFtmdW5jdGlvbl9uYW1lXS5hcHBseShpbmV4YWN0LCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbmp1Z2F0ZTogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNvbmp1Z2F0ZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb25qdWdhdGUgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiY29uanVnYXRlXCIpO1xuXG4gICAgLy8gbWFnbml0dWRlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgbWFnbml0dWRlLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1hZ25pdHVkZSA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJtYWduaXR1ZGVcIik7XG5cbiAgICAvLyBsb2c6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBQcm9kdWNlIHRoZSBsb2cuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubG9nID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImxvZ1wiKTtcblxuICAgIC8vIGFuZ2xlOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYW5nbGUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW5nbGUgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiYW5nbGVcIik7XG5cbiAgICAvLyBhdGFuOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgYXJjIHRhbmdlbnQuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYXRhbiA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJhdGFuXCIpO1xuXG4gICAgLy8gYWNvczogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyBjb3NpbmUuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWNvcyA9IHRlbXBvcmFyeUFjY3VyYWN5TG9zaW5nV29ya0Fyb3VuZEZvckJpZ051bXMoXCJhY29zXCIpO1xuXG4gICAgLy8gYXNpbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGFyYyBzaW5lLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmFzaW4gPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiYXNpblwiKTtcblxuICAgIC8vIHRhbjogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIHRhbmdlbnQuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudGFuID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcInRhblwiKTtcblxuICAgIC8vIGNvczogLT4gc2NoZW1lLW51bWJlclxuICAgIC8vIFByb2R1Y2UgdGhlIGNvc2luZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb3MgPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwiY29zXCIpO1xuXG4gICAgLy8gc2luOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSB0aGUgc2luZS5cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaW4gPSB0ZW1wb3JhcnlBY2N1cmFjeUxvc2luZ1dvcmtBcm91bmRGb3JCaWdOdW1zKFwic2luXCIpO1xuXG4gICAgLy8gZXhwOiAtPiBzY2hlbWUtbnVtYmVyXG4gICAgLy8gUHJvZHVjZSBlIHJhaXNlZCB0byB0aGUgZ2l2ZW4gcG93ZXIuXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZXhwID0gdGVtcG9yYXJ5QWNjdXJhY3lMb3NpbmdXb3JrQXJvdW5kRm9yQmlnTnVtcyhcImV4cFwiKTtcblxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmltYWdpbmFyeVBhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5yZWFsUGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gcm91bmQ6IC0+IHNjaGVtZS1udW1iZXJcbiAgICAvLyBSb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyLlxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuXG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyB0b1JlcGVhdGluZ0RlY2ltYWw6IGpzbnVtIGpzbnVtIHtsaW1pdDogbnVtYmVyfT8gLT4gW3N0cmluZywgc3RyaW5nLCBzdHJpbmddXG4gICAgLy9cbiAgICAvLyBHaXZlbiB0aGUgbnVtZXJhdG9yIGFuZCBkZW5vbWluYXRvciBwYXJ0cyBvZiBhIHJhdGlvbmFsLFxuICAgIC8vIHByb2R1Y2VzIHRoZSByZXBlYXRpbmctZGVjaW1hbCByZXByZXNlbnRhdGlvbiwgd2hlcmUgdGhlIGZpcnN0XG4gICAgLy8gcGFydCBhcmUgdGhlIGRpZ2l0cyBiZWZvcmUgdGhlIGRlY2ltYWwsIHRoZSBzZWNvbmQgYXJlIHRoZVxuICAgIC8vIG5vbi1yZXBlYXRpbmcgZGlnaXRzIGFmdGVyIHRoZSBkZWNpbWFsLCBhbmQgdGhlIHRoaXJkIGFyZSB0aGVcbiAgICAvLyByZW1haW5pbmcgcmVwZWF0aW5nIGRlY2ltYWxzLlxuICAgIC8vXG4gICAgLy8gQW4gb3B0aW9uYWwgbGltaXQgb24gdGhlIGRlY2ltYWwgZXhwYW5zaW9uIGNhbiBiZSBwcm92aWRlZCwgaW4gd2hpY2hcbiAgICAvLyBjYXNlIHRoZSBzZWFyY2ggY3V0cyBvZmYgaWYgd2UgZ28gcGFzdCB0aGUgbGltaXQuXG4gICAgLy8gSWYgdGhpcyBoYXBwZW5zLCB0aGUgdGhpcmQgYXJndW1lbnQgcmV0dXJuZWQgYmVjb21lcyAnLi4uJyB0byBpbmRpY2F0ZVxuICAgIC8vIHRoYXQgdGhlIHNlYXJjaCB3YXMgcHJlbWF0dXJlbHkgY3V0IG9mZi5cbiAgICB2YXIgdG9SZXBlYXRpbmdEZWNpbWFsID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ2V0UmVzaWR1ZSA9IGZ1bmN0aW9uKHIsIGQsIGxpbWl0KSB7XG4gICAgICAgICAgICB2YXIgZGlnaXRzID0gW107XG4gICAgICAgICAgICB2YXIgc2VlblJlbWFpbmRlcnMgPSB7fTtcbiAgICAgICAgICAgIHNlZW5SZW1haW5kZXJzW3JdID0gdHJ1ZTtcbiAgICAgICAgICAgIHdoaWxlKHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobGltaXQtLSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbZGlnaXRzLmpvaW4oJycpLCAnLi4uJ11cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV4dERpZ2l0ID0gcXVvdGllbnQoXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGx5KHIsIDEwKSwgZCk7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRSZW1haW5kZXIgPSByZW1haW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGx5KHIsIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgZCk7XG4gICAgICAgICAgICAgICAgZGlnaXRzLnB1c2gobmV4dERpZ2l0LnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGlmIChzZWVuUmVtYWluZGVyc1tuZXh0UmVtYWluZGVyXSkge1xuICAgICAgICAgICAgICAgICAgICByID0gbmV4dFJlbWFpbmRlcjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VlblJlbWFpbmRlcnNbbmV4dFJlbWFpbmRlcl0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByID0gbmV4dFJlbWFpbmRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBmaXJzdFJlcGVhdGluZ1JlbWFpbmRlciA9IHI7XG4gICAgICAgICAgICB2YXIgcmVwZWF0aW5nRGlnaXRzID0gW107XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0RGlnaXQgPSBxdW90aWVudChtdWx0aXBseShyLCAxMCksIGQpO1xuICAgICAgICAgICAgICAgIHZhciBuZXh0UmVtYWluZGVyID0gcmVtYWluZGVyKFxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBseShyLCAxMCksXG4gICAgICAgICAgICAgICAgICAgIGQpO1xuICAgICAgICAgICAgICAgIHJlcGVhdGluZ0RpZ2l0cy5wdXNoKG5leHREaWdpdC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxzKG5leHRSZW1haW5kZXIsIGZpcnN0UmVwZWF0aW5nUmVtYWluZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByID0gbmV4dFJlbWFpbmRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgZGlnaXRTdHJpbmcgPSBkaWdpdHMuam9pbignJyk7XG4gICAgICAgICAgICB2YXIgcmVwZWF0aW5nRGlnaXRTdHJpbmcgPSByZXBlYXRpbmdEaWdpdHMuam9pbignJyk7XG5cbiAgICAgICAgICAgIHdoaWxlIChkaWdpdFN0cmluZy5sZW5ndGggPj0gcmVwZWF0aW5nRGlnaXRTdHJpbmcubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgKGRpZ2l0U3RyaW5nLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgZGlnaXRTdHJpbmcubGVuZ3RoIC0gcmVwZWF0aW5nRGlnaXRTdHJpbmcubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICA9PT0gcmVwZWF0aW5nRGlnaXRTdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgZGlnaXRTdHJpbmcgPSBkaWdpdFN0cmluZy5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgIDAsIGRpZ2l0U3RyaW5nLmxlbmd0aCAtIHJlcGVhdGluZ0RpZ2l0U3RyaW5nLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBbZGlnaXRTdHJpbmcsIHJlcGVhdGluZ0RpZ2l0U3RyaW5nXTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihuLCBkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAvLyBkZWZhdWx0IGxpbWl0IG9uIGRlY2ltYWwgZXhwYW5zaW9uOyBjYW4gYmUgb3ZlcnJpZGRlblxuICAgICAgICAgICAgdmFyIGxpbWl0ID0gNTEyO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mKG9wdGlvbnMubGltaXQpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGxpbWl0ID0gb3B0aW9ucy5saW1pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghIGlzSW50ZWdlcihuKSkge1xuICAgICAgICAgICAgICAgIHRocm93UnVudGltZUVycm9yKCd0b1JlcGVhdGluZ0RlY2ltYWw6IG4gJyArIG4udG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGFuIGludGVnZXIuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEgaXNJbnRlZ2VyKGQpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3RvUmVwZWF0aW5nRGVjaW1hbDogZCAnICsgZC50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYW4gaW50ZWdlci5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXF1YWxzKGQsIDApKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3RvUmVwZWF0aW5nRGVjaW1hbDogZCBlcXVhbHMgMCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlc3NUaGFuKGQsIDApKSB7XG4gICAgICAgICAgICAgICAgdGhyb3dSdW50aW1lRXJyb3IoJ3RvUmVwZWF0aW5nRGVjaW1hbDogZCA8IDAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB2YXIgc2lnbiA9IChsZXNzVGhhbihuLCAwKSA/IFwiLVwiIDogXCJcIik7XG4gICAgICAgICAgICAgbiA9IGFicyhuKTtcbiAgICAgICAgICAgICB2YXIgYmVmb3JlRGVjaW1hbFBvaW50ID0gc2lnbiArIHF1b3RpZW50KG4sIGQpO1xuICAgICAgICAgICAgIHZhciBhZnRlckRlY2ltYWxzID0gZ2V0UmVzaWR1ZShyZW1haW5kZXIobiwgZCksIGQsIGxpbWl0KTtcbiAgICAgICAgICAgICByZXR1cm4gW2JlZm9yZURlY2ltYWxQb2ludF0uY29uY2F0KGFmdGVyRGVjaW1hbHMpO1xuICAgICAgICB9O1xuICAgIH0pKCk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cblxuXG4gICAgLy8gRXh0ZXJuYWwgaW50ZXJmYWNlIG9mIGpzLW51bWJlcnM6XG5cbiAgICBOdW1iZXJzWydmcm9tRml4bnVtJ10gPSBmcm9tRml4bnVtO1xuICAgIE51bWJlcnNbJ2Zyb21TdHJpbmcnXSA9IGZyb21TdHJpbmc7XG4gICAgTnVtYmVyc1snbWFrZUJpZ251bSddID0gbWFrZUJpZ251bTtcbiAgICBOdW1iZXJzWydtYWtlUmF0aW9uYWwnXSA9IFJhdGlvbmFsLm1ha2VJbnN0YW5jZTtcbiAgICBOdW1iZXJzWydtYWtlRmxvYXQnXSA9IEZsb2F0UG9pbnQubWFrZUluc3RhbmNlO1xuICAgIE51bWJlcnNbJ21ha2VDb21wbGV4J10gPSBDb21wbGV4Lm1ha2VJbnN0YW5jZTtcbiAgICBOdW1iZXJzWydtYWtlQ29tcGxleFBvbGFyJ10gPSBtYWtlQ29tcGxleFBvbGFyO1xuXG4gICAgTnVtYmVyc1sncGknXSA9IEZsb2F0UG9pbnQucGk7XG4gICAgTnVtYmVyc1snZSddID0gRmxvYXRQb2ludC5lO1xuICAgIE51bWJlcnNbJ25hbiddID0gRmxvYXRQb2ludC5uYW47XG4gICAgTnVtYmVyc1snbmVnYXRpdmVfaW5mJ10gPSBGbG9hdFBvaW50Lm5lZ2luZjtcbiAgICBOdW1iZXJzWydpbmYnXSA9IEZsb2F0UG9pbnQuaW5mO1xuICAgIE51bWJlcnNbJ25lZ2F0aXZlX29uZSddID0gLTE7ICAgLy8gUmF0aW9uYWwuTkVHQVRJVkVfT05FO1xuICAgIE51bWJlcnNbJ3plcm8nXSA9IDA7ICAgICAgICAgICAgLy8gUmF0aW9uYWwuWkVSTztcbiAgICBOdW1iZXJzWydvbmUnXSA9IDE7ICAgICAgICAgICAgIC8vIFJhdGlvbmFsLk9ORTtcbiAgICBOdW1iZXJzWydpJ10gPSBwbHVzSTtcbiAgICBOdW1iZXJzWyduZWdhdGl2ZV9pJ10gPSBtaW51c0k7XG4gICAgTnVtYmVyc1snbmVnYXRpdmVfemVybyddID0gTkVHQVRJVkVfWkVSTztcblxuICAgIE51bWJlcnNbJ29uVGhyb3dSdW50aW1lRXJyb3InXSA9IG9uVGhyb3dSdW50aW1lRXJyb3I7XG4gICAgTnVtYmVyc1snaXNTY2hlbWVOdW1iZXInXSA9IGlzU2NoZW1lTnVtYmVyO1xuICAgIE51bWJlcnNbJ2lzUmF0aW9uYWwnXSA9IGlzUmF0aW9uYWw7XG4gICAgTnVtYmVyc1snaXNSZWFsJ10gPSBpc1JlYWw7XG4gICAgTnVtYmVyc1snaXNFeGFjdCddID0gaXNFeGFjdDtcbiAgICBOdW1iZXJzWydpc0luZXhhY3QnXSA9IGlzSW5leGFjdDtcbiAgICBOdW1iZXJzWydpc0ludGVnZXInXSA9IGlzSW50ZWdlcjtcblxuICAgIE51bWJlcnNbJ3RvRml4bnVtJ10gPSB0b0ZpeG51bTtcbiAgICBOdW1iZXJzWyd0b0V4YWN0J10gPSB0b0V4YWN0O1xuICAgIE51bWJlcnNbJ3RvSW5leGFjdCddID0gdG9JbmV4YWN0O1xuICAgIE51bWJlcnNbJ2FkZCddID0gYWRkO1xuICAgIE51bWJlcnNbJ3N1YnRyYWN0J10gPSBzdWJ0cmFjdDtcbiAgICBOdW1iZXJzWydtdWx0aXBseSddID0gbXVsdGlwbHk7XG4gICAgTnVtYmVyc1snZGl2aWRlJ10gPSBkaXZpZGU7XG4gICAgTnVtYmVyc1snZXF1YWxzJ10gPSBlcXVhbHM7XG4gICAgTnVtYmVyc1snZXF2J10gPSBlcXY7XG4gICAgTnVtYmVyc1snYXBwcm94RXF1YWxzJ10gPSBhcHByb3hFcXVhbHM7XG4gICAgTnVtYmVyc1snZ3JlYXRlclRoYW5PckVxdWFsJ10gPSBncmVhdGVyVGhhbk9yRXF1YWw7XG4gICAgTnVtYmVyc1snbGVzc1RoYW5PckVxdWFsJ10gPSBsZXNzVGhhbk9yRXF1YWw7XG4gICAgTnVtYmVyc1snZ3JlYXRlclRoYW4nXSA9IGdyZWF0ZXJUaGFuO1xuICAgIE51bWJlcnNbJ2xlc3NUaGFuJ10gPSBsZXNzVGhhbjtcbiAgICBOdW1iZXJzWydleHB0J10gPSBleHB0O1xuICAgIE51bWJlcnNbJ2V4cCddID0gZXhwO1xuICAgIE51bWJlcnNbJ21vZHVsbyddID0gbW9kdWxvO1xuICAgIE51bWJlcnNbJ251bWVyYXRvciddID0gbnVtZXJhdG9yO1xuICAgIE51bWJlcnNbJ2Rlbm9taW5hdG9yJ10gPSBkZW5vbWluYXRvcjtcbiAgICBOdW1iZXJzWydpbnRlZ2VyU3FydCddID0gaW50ZWdlclNxcnQ7XG4gICAgTnVtYmVyc1snc3FydCddID0gc3FydDtcbiAgICBOdW1iZXJzWydhYnMnXSA9IGFicztcbiAgICBOdW1iZXJzWydxdW90aWVudCddID0gcXVvdGllbnQ7XG4gICAgTnVtYmVyc1sncmVtYWluZGVyJ10gPSByZW1haW5kZXI7XG4gICAgTnVtYmVyc1snZmxvb3InXSA9IGZsb29yO1xuICAgIE51bWJlcnNbJ2NlaWxpbmcnXSA9IGNlaWxpbmc7XG4gICAgTnVtYmVyc1snY29uanVnYXRlJ10gPSBjb25qdWdhdGU7XG4gICAgTnVtYmVyc1snbWFnbml0dWRlJ10gPSBtYWduaXR1ZGU7XG4gICAgTnVtYmVyc1snbG9nJ10gPSBsb2c7XG4gICAgTnVtYmVyc1snYW5nbGUnXSA9IGFuZ2xlO1xuICAgIE51bWJlcnNbJ3RhbiddID0gdGFuO1xuICAgIE51bWJlcnNbJ2F0YW4nXSA9IGF0YW47XG4gICAgTnVtYmVyc1snY29zJ10gPSBjb3M7XG4gICAgTnVtYmVyc1snc2luJ10gPSBzaW47XG4gICAgTnVtYmVyc1sndGFuJ10gPSB0YW47XG4gICAgTnVtYmVyc1snYWNvcyddID0gYWNvcztcbiAgICBOdW1iZXJzWydhc2luJ10gPSBhc2luO1xuICAgIE51bWJlcnNbJ2Nvc2gnXSA9IGNvc2g7XG4gICAgTnVtYmVyc1snc2luaCddID0gc2luaDtcbiAgICBOdW1iZXJzWydpbWFnaW5hcnlQYXJ0J10gPSBpbWFnaW5hcnlQYXJ0O1xuICAgIE51bWJlcnNbJ3JlYWxQYXJ0J10gPSByZWFsUGFydDtcbiAgICBOdW1iZXJzWydyb3VuZCddID0gcm91bmQ7XG4gICAgTnVtYmVyc1snc3FyJ10gPSBzcXI7XG4gICAgTnVtYmVyc1snZ2NkJ10gPSBnY2Q7XG4gICAgTnVtYmVyc1snbGNtJ10gPSBsY207XG5cbiAgICBOdW1iZXJzWyd0b1JlcGVhdGluZ0RlY2ltYWwnXSA9IHRvUmVwZWF0aW5nRGVjaW1hbDtcblxuXG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGV4cG9zZXMgdGhlIGNsYXNzIHJlcHJlc2VudGF0aW9ucyBmb3IgZWFzaWVyXG4gICAgLy8gaW50ZWdyYXRpb24gd2l0aCBvdGhlciBwcm9qZWN0cy5cbiAgICBOdW1iZXJzWydCaWdJbnRlZ2VyJ10gPSBCaWdJbnRlZ2VyO1xuICAgIE51bWJlcnNbJ1JhdGlvbmFsJ10gPSBSYXRpb25hbDtcbiAgICBOdW1iZXJzWydGbG9hdFBvaW50J10gPSBGbG9hdFBvaW50O1xuICAgIE51bWJlcnNbJ0NvbXBsZXgnXSA9IENvbXBsZXg7XG5cbiAgICBOdW1iZXJzWydNSU5fRklYTlVNJ10gPSBNSU5fRklYTlVNO1xuICAgIE51bWJlcnNbJ01BWF9GSVhOVU0nXSA9IE1BWF9GSVhOVU07XG5cbn0pKCk7XG4iLCIvKipcbiAqIEFuIGVxdWF0aW9uIGlzIGFuIGV4cHJlc3Npb24gYXR0YWNoZWQgdG8gYSBwYXJ0aWN1bGFyIG5hbWUuIEZvciBleGFtcGxlOlxuICogICBmKHgpID0geCArIDFcbiAqICAgbmFtZTogZlxuICogICBlcXVhdGlvbjogeCArIDFcbiAqICAgcGFyYW1zOiBbJ3gnXVxuICogSW4gbWFueSBjYXNlcywgdGhpcyB3aWxsIGp1c3QgYmUgYW4gZXhwcmVzc2lvbiB3aXRoIG5vIG5hbWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBGdW5jdGlvbiBvciB2YXJpYWJsZSBuYW1lLiBOdWxsIGlmIGNvbXB1dGUgZXhwcmVzc2lvblxuICogQHBhcmFtIHtzdHJpbmdbXX0gcGFyYW1zIExpc3Qgb2YgcGFyYW1ldGVyIG5hbWVzIGlmIGEgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0V4cHJlc3Npb25Ob2RlfSBleHByZXNzaW9uXG4gKi9cbnZhciBFcXVhdGlvbiA9IGZ1bmN0aW9uIChuYW1lLCBwYXJhbXMsIGV4cHJlc3Npb24pIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5wYXJhbXMgPSBwYXJhbXMgfHwgW107XG4gIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT09IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0VxdWF0aW9uIHJlcXVpcmVzIG5hbWUsIHBhcmFtcywgYW5kIGV4cHJlc3Npb24nKTtcbiAgfVxuXG4gIHRoaXMuc2lnbmF0dXJlID0gdGhpcy5uYW1lO1xuICBpZiAodGhpcy5wYXJhbXMubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuc2lnbmF0dXJlICs9ICcoJyArIHRoaXMucGFyYW1zLmpvaW4oJywnKSArICcpJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFcXVhdGlvbjtcblxuLyoqXG4gKiBAcmV0dXJucyBUcnVlIGlmIGEgZnVuY3Rpb25cbiAqL1xuRXF1YXRpb24ucHJvdG90eXBlLmlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnBhcmFtcy5sZW5ndGggPiAwO1xufTtcblxuRXF1YXRpb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IEVxdWF0aW9uKHRoaXMubmFtZSwgdGhpcy5wYXJhbXMuc2xpY2UoKSwgdGhpcy5leHByZXNzaW9uLmNsb25lKCkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcbiAgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG4gIHZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbjsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBDYWxjIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogQ2FsYyBHcmFwaGljcy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgc2hhcmVkRnVuY3Rpb25hbEJsb2NrcyA9IHJlcXVpcmUoJy4uL3NoYXJlZEZ1bmN0aW9uYWxCbG9ja3MnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIHNoYXJlZEZ1bmN0aW9uYWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG5cbiAgaW5zdGFsbENvbXB1dGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xufTtcblxuZnVuY3Rpb24gaW5zdGFsbENvbXB1dGUoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pIHtcbiAgYmxvY2tseS5CbG9ja3MuZnVuY3Rpb25hbF9jb21wdXRlID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgYmxvY2tseS5GdW5jdGlvbmFsQmxvY2tVdGlscy5pbml0VGl0bGVkRnVuY3Rpb25hbEJsb2NrKHRoaXMsIG1zZy5ldmFsdWF0ZSgpLCBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5PTkUsIFtcbiAgICAgICAgeyBuYW1lOiAnQVJHMScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH1cbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZnVuY3Rpb25hbF9jb21wdXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZzEgPSBCbG9ja2x5LkphdmFTY3JpcHQuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdBUkcxJywgZmFsc2UpIHx8IDA7XG4gICAgcmV0dXJuIFwiQ2FsYy5jb21wdXRlKFwiICsgYXJnMSArXCIsICdibG9ja19pZF9cIiArIHRoaXMuaWQgKyBcIicpO1xcblwiO1xuICB9O1xufVxuIiwiLy8gbG9jYWxlIGZvciBjYWxjXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuY2FsY19sb2NhbGU7XG4iXX0=
