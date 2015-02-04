require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({35:[function(require,module,exports){
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

},{"../appMain":3,"../skins":125,"./blocks":28,"./calc":29,"./levels":34}],29:[function(require,module,exports){
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
    tokenList = getTokenList(computeEquation, appState.targetSet.computeEquation);
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

},{"../../locale/current/calc":169,"../../locale/current/common":170,"../StudioApp":2,"../block_utils":16,"../dom":43,"../skins":125,"../templates/page.html":145,"../timeoutList":151,"../utils":165,"./api":27,"./controls.html":30,"./equationSet":31,"./expressionNode":32,"./inputIterator":33,"./levels":34,"./visualization.html":36}],36:[function(require,module,exports){
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
 buf.push('');1; var msg = require('../../locale/current/calc'); ; buf.push('\n\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgCalc">\n  <rect x="0" y="0" width="400" height="300" fill="#33ccff"/>\n  <rect x="0" y="300" width="400" height="100" fill="#996633"/>\n  <text x="0" y="30" class="calcHeader">', escape((6,  msg.yourExpression() )), '</text>\n  <g id="userExpression" class="expr" transform="translate(0, 100)">\n  </g>\n  <text x="0" y="330" class="calcHeader" id="goalHeader">', escape((9,  msg.goal() )), '</text>\n  <g id="answerExpression" class="expr" transform="translate(0, 350)">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/calc":169,"ejs":186}],34:[function(require,module,exports){
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

},{"../../locale/current/calc":169,"../block_utils":16}],33:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
var _ = require('../utils').getLodash();
var ExpressionNode = require('./expressionNode');

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

  this.signature = this.name;
  if (this.params.length > 0) {
    this.signature += '(' + this.params.join(',') + ')';
  }
};

/**
 * @returns True if a function
 */
Equation.prototype.isFunction = function () {
  return this.params.length > 0;
};

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
EquationSet.Equation = Equation;
module.exports = EquationSet;

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
 * @returns {boolean} True if the EquationSet has exactly one function and no
 * variables. If we have multiple functions or one function and some variables,
 * returns false.
 */
 EquationSet.prototype.hasSingleFunction = function () {
   if (this.equations_.length === 1 && this.equations_[0].isFunction()) {
     return true;
   }

   return false;
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
  var setTestMappingToOne = function (item) {
    testMapping[item] = 1;
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
        equation.params.forEach(setTestMappingToOne);
        if (!equation.expression.canEvaluate(testMapping)) {
          continue;
        }

        // we have a valid mapping
        madeProgress = true;
        mapping[equation.name] = {
          variables: equation.params,
          expression: equation.expression
        };
      } else if (mapping[equation.name] === undefined &&
          equation.expression.canEvaluate(mapping)) {
        // we have a variable that hasn't yet been mapped and can be
        madeProgress = true;
        mapping[equation.name] = equation.expression.evaluate(mapping);
      }
    }

  } while (madeProgress);

  if (!computeExpression.canEvaluate(mapping)) {
    throw new Error("Can't resolve EquationSet");
  }

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
      var operation = block.getTitles()[0].getValue();
      var args = ['ARG1', 'ARG2'].map(function(inputName) {
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
        new ExpressionNode(parseInt(val, 10), [], block.id));

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

},{"../utils":165,"./expressionNode":32}],30:[function(require,module,exports){
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
},{"../../locale/current/calc":169,"../../locale/current/common":170,"ejs":186}],28:[function(require,module,exports){
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

var functionalBlockUtils = require('../functionalBlockUtils');
var initTitledFunctionalBlock = functionalBlockUtils.initTitledFunctionalBlock;

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installCompute(blockly, generator, gensym);

};

function initFunctionalBlock(block, title, numArgs) {
  block.setHSV(184, 1.00, 0.74);
  block.setFunctional(true, {
    headerHeight: 30,
  });

  var options = {
    fixedSize: { height: 35 },
    fontSize: 25 // in pixels
  };

  block.appendDummyInput()
      .appendTitle(new Blockly.FieldLabel(title, options))
      .setAlign(Blockly.ALIGN_CENTRE);
  for (var i = 1; i <= numArgs; i++) {
    block.appendFunctionalInput('ARG' + i)
         .setInline(i > 1)
         .setHSV(184, 1.00, 0.74)
         .setCheck('Number');
  }

  block.setFunctionalOutput(true, 'Number');
}

function installCompute(blockly, generator, gensym) {
  blockly.Blocks.functional_compute = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, msg.compute(), 'none', [
        { name: 'ARG1', type: 'Number' }
      ]);
    }
  };

  generator.functional_compute = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return "Calc.compute(" + arg1 +", 'block_id_" + this.id + "');\n";
  };
}

},{"../../locale/current/calc":169,"../../locale/current/common":170,"../functionalBlockUtils":72,"../sharedFunctionalBlocks":124}],169:[function(require,module,exports){
/*calc*/ module.exports = window.blockly.appLocale;
},{}],27:[function(require,module,exports){
var ExpressionNode = require('./expressionNode');

exports.compute = function (expr, blockId) {
  Calc.computedExpression = expr instanceof ExpressionNode ? expr :
    new ExpressionNode(parseInt(expr, 10));
};

exports.expression = function (operator, arg1, arg2, blockId) {
  return new ExpressionNode(operator, [arg1, arg2], blockId);
};

},{"./expressionNode":32}],32:[function(require,module,exports){
var utils = require('../utils');
var _ = utils.getLodash();

/**
 * A node consisting of an value, and potentially a set of operands.
 * The value will be either an operator, a string representing a variable, a
 * string representing a functional call, or a number.
 * If args are not ExpressionNode, we convert them to be so, assuming any string
 * represents a variable
 */
var ValueType = {
  ARITHMETIC: 1,
  FUNCTION_CALL: 2,
  VARIABLE: 3,
  NUMBER: 4
};

var ExpressionNode = function (val, args, blockId) {
  this.value_ = val;
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

  if (this.getType() === ValueType.NUMBER && args.length > 0) {
    throw new Error("Can't have args for number ExpressionNode");
  }

  if (this.getType() === ValueType.ARITHMETIC && args.length !== 2) {
    throw new Error("Arithmetic ExpressionNode needs 2 args");
  }
};
module.exports = ExpressionNode;

ExpressionNode.ValueType = ValueType;

/**
 * What type of expression node is this?
 */
ExpressionNode.prototype.getType = function () {
  if (["+", "-", "*", "/"].indexOf(this.value_) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (typeof(this.value_) === 'string') {
    if (this.children_.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (typeof(this.value_) === 'number') {
    return ValueType.NUMBER;
  }
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
 * See if we can evaluate this node by trying to do so and catching exceptions.
 * @returns Whether we can evaluate.
 */
ExpressionNode.prototype.canEvaluate = function (mapping) {
  try {
    this.evaluate(mapping);
  } catch (err) {
    return false;
  }
  return true;
};

/**
 * Evaluate the expression, returning the result.
 */
ExpressionNode.prototype.evaluate = function (mapping) {
  mapping = mapping || {};
  var type = this.getType();

  if (type === ValueType.VARIABLE && mapping[this.value_] !== undefined) {
    var clone = this.clone();
    clone.setValue(mapping[this.value_]);
    return clone.evaluate(mapping);
  }

  if (type === ValueType.FUNCTION_CALL && mapping[this.value_] !== undefined) {
    var functionDef = mapping[this.value_];
    if (!functionDef.variables || !functionDef.expression) {
      throw new Error('Bad mapping for: ' + this.value_);
    }
    if (functionDef.variables.length !== this.children_.length) {
      throw new Error('Bad mapping for: ' + this.value_);
    }
    // Generate a new mapping so that if we have collisions between global
    // variables and function variables, the function vars take precedence
    var newMapping = {};
    _.keys(mapping).forEach(function (key) {
      newMapping[key] = mapping[key];
    });
    functionDef.variables.forEach(function (variable, index) {
      newMapping[variable] = this.getChildValue(index);
    }, this);
    return functionDef.expression.evaluate(newMapping);
  }

  if (type === ValueType.VARIABLE || type === ValueType.FUNCTION_CALL) {
    throw new Error('Must resolve variables/functions before evaluation');
  }
  if (type === ValueType.NUMBER) {
    return this.value_;
  }

  if (type !== ValueType.ARITHMETIC) {
    throw new Error('Unexpected error');
  }

  var left = this.children_[0].evaluate(mapping);
  var right = this.children_[1].evaluate(mapping);

  switch (this.value_) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.value_);
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
 * furthest left. Returns whether collapse was successful.
 */
ExpressionNode.prototype.collapse = function () {
  var deepest = this.getDeepestOperation();
  if (deepest === null) {
    return false;
  }

  // We're the depest operation, implying both sides are numbers
  if (this === deepest) {
    this.value_ = this.evaluate();
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
  var nodesMatch = other && (this.value_ === other.value_) &&
    (this.children_.length === other.children_.length);
  var type = this.getType();

  // Empty function calls look slightly different, i.e. foo() instead of foo
  if (this.children_.length === 0) {
    return [new Token(this.value_.toString(), !nodesMatch)];
  }

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    if (this.children_.length > 0) {
      tokens.push([
        this.children_[0].getTokenListDiff(nodesMatch && other.children_[0]),
        new Token(" " + this.value_ + " ", !nodesMatch),
        this.children_[1].getTokenListDiff(nodesMatch && other.children_[1])
      ]);
    }
    tokens.push(new Token(')', !nodesMatch));

  } else if (type === ValueType.FUNCTION_CALL) {
    // Deal with a function call which will generate something like: foo(1, 2, 3)
    tokens = [
      new Token(this.value_, this.value_ !== other.value_),
      new Token('(', !nodesMatch)
    ];

    for (var i = 0; i < this.children_.length; i++) {
      if (i > 0) {
        tokens.push(new Token(',', !nodesMatch));
      }
      tokens.push(this.children_[i].getTokenListDiff(nodesMatch && other.children_[i]));
    }

    tokens.push(new Token(")", !nodesMatch));
  } else if (this.getType() === ValueType.VARIABLE) {

  }
  return _.flatten(tokens);
};


/**
 * Get a tokenList for this expression, potentially marking those tokens
 * that are in the deepest descendant expression.
 * @param {boolean} markDeepest Mark tokens in the deepest descendant
 */
ExpressionNode.prototype.getTokenList = function (markDeepest) {
  var depth = this.depth();
  if (depth <= 1) {
    return this.getTokenListDiff(markDeepest ? null : this);
  }

  if (this.getType() !== ValueType.ARITHMETIC) {
    // Don't support getTokenList for functions
    throw new Error("Unsupported");
  }

  var rightDeeper = this.children_[1].depth() > this.children_[0].depth();

  return _.flatten([
    new Token('(', false),
    this.children_[0].getTokenList(markDeepest && !rightDeeper),
    new Token(" " + this.value_ + " ", false),
    this.children_[1].getTokenList(markDeepest && rightDeeper),
    new Token(')', false)
  ]);
};

/**
 * Is other exactly the same as this ExpressionNode tree.
 */
ExpressionNode.prototype.isIdenticalTo = function (other) {
  if (!other || this.value_ !== other.value_ ||
      this.children_.length !== other.children_.length) {
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

  if (this.getType() !== ValueType.FUNCTION_CALL ||
      other.getType() !== ValueType.FUNCTION_CALL) {
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
  if (this.getType() !== ValueType.ARITHMETIC) {
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
 * Modify this ExpressionNode's value
 */
ExpressionNode.prototype.setValue = function (value) {
  var type = this.getType();
  if (type !== ValueType.VARIABLE && type !== ValueType.NUMBER) {
    throw new Error("Can't modify value");
  }
  this.value_ = value;
};

/**
 * Get the value of the child at index
 */
ExpressionNode.prototype.getChildValue = function (index) {
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
 */
ExpressionNode.prototype.debug = function () {
  if (this.children_.length === 0) {
    return this.value_;
  }
  return "(" + this.value_ + " " +
    this.children_.map(function (c) {
      return c.debug();
    }).join(' ') + ")";
};

/**
 * A token is essentially just a string that may or may not be "marked". Marking
 * is done for two different reasons.
 * (1) We're comparing two expressions and want to mark where they differ.
 * (2) We're looking at a single expression and want to mark the deepest
 *     subexpression.
 */
var Token = function (str, marked) {
  this.str = str;
  this.marked = marked;
};
ExpressionNode.Token = Token;

},{"../utils":165}]},{},[35]);
