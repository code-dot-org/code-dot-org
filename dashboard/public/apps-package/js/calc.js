require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({32:[function(require,module,exports){
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

},{"../appMain":3,"../skins":108,"./blocks":27,"./calc":28,"./levels":31}],28:[function(require,module,exports){
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
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var dom = require('../dom');
var blockUtils = require('../block_utils');
var _ = require('../utils').getLodash();
var timeoutList = require('../timeoutList');

var ExpressionNode = require('./expressionNode');

var TestResults = studioApp.TestResults;

var level;
var skin;

// todo - better approach for reserved name?
// use zzz for sorting purposes (which is also hacky)
var COMPUTE_NAME = 'zzz_compute';

studioApp.setCheckForEmptyBlocks(false);

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

var appState = {
  targetExpressions: null,
  userExpressions: null,
  animating: false,
  response: null,
  message: null,
  result: null,
  testResults: null,
  currentAnimationDepth: 0
};

var stepSpeed = 2000;


/**
 * An equation is an expression attached to a particular name. For example:
 *   f(x) = x + 1
 *   name: f
 *   equation: x + 1
 * In many cases, this will just be an expression with no name.
 */
var Equation = function (name, expression) {
  this.name = name;
  this.expression = expression;
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
  };

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

    appState.targetExpressions = generateExpressionsFromBlockXml(solutionBlocks);

    _.keys(appState.targetExpressions).sort().forEach(function (name, index) {
      var expression = appState.targetExpressions[name];
      var tokenList = expression.getTokenList(false);
      if (name === COMPUTE_NAME) {
        name = null;
      }
      displayEquation('answerExpression', name, tokenList, index);
    });

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
  Calc.expressions.user = null;
  appState.message = null;
  appState.currentAnimationDepth = 0;
  timeoutList.clearTimeouts();

  appState.animating = false;

  clearSvgUserExpression();
};


function evalCode (code) {
  try {
    codegen.evalWith(code, {
      StudioApp: studioApp,
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
 * Generate a set of expressions from the blocks currently in the workspace.
 * @returns  an object in which keys are expression names (or COMPUTE_NAME for
 * the base expression), and values are the expressions
 */
function generateExpressionsFromTopBlocks() {
  var obj = {};

  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  var equationList = topBlocks.forEach(function (block) {
    var equation = getEquationFromBlock(block);
    obj[equation.name || COMPUTE_NAME] = equation.expression;
  });
  return obj;
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

  var obj = generateExpressionsFromTopBlocks();

  Blockly.mainBlockSpace.getTopBlocks().forEach(function (block) {
    block.dispose();
  });

  return obj;
}

// todo (brent) : would this logic be better placed inside the blocks?
// todo (brent) : needs some unit tests
function getEquationFromBlock(block) {
  var name;
  if (!block) {
    return null;
  }
  var firstChild = block.getChildren()[0];
  switch (block.type) {
    case 'functional_compute':
      if (!firstChild) {
        return new ExpressionNode(0);
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

      return new Equation(null, new ExpressionNode(operation, args, block.id));

    case 'functional_math_number':
    case 'functional_math_number_dropdown':
      var val = block.getTitleValue('NUM') || 0;
      if (val === '???') {
        val = 0;
      }
      return new Equation(null,
        new ExpressionNode(parseInt(val, 10), [], block.id));

    case 'functional_call':
      name = block.getCallName();
      var def = Blockly.Procedures.getDefinition(name, Blockly.mainBlockSpace);
      if (def.isVariable()) {
        return new Equation(null, new ExpressionNode(name));
      } else {
        var values = [];
        var input, childBlock;
        for (var i = 0; !!(input = block.getInput('ARG' + i)); i++) {
          childBlock = input.connection.targetBlock();
          // TODO - better default?
          values.push(childBlock ? getEquationFromBlock(childBlock).expression :
            new ExpressionNode(0));
        }
        return new Equation(null, new ExpressionNode(name, values));
      }
      break;

    case 'functional_definition':
      name = block.getTitleValue('NAME');
      // TODO - access private
      if (block.parameterNames_.length) {
        name += '(' + block.parameterNames_.join(',') +')';
      }
      var expression = firstChild ? getEquationFromBlock(firstChild).expression :
        new ExpressionNode(0);

      return new Equation(name, expression);

    case 'functional_parameters_get':
      return new Equation(null, new ExpressionNode(block.getTitleValue('VAR')));

    default:
      throw "Unknown block type: " + block.type;
  }
}

/**
 * Execute the user's code.
 */
Calc.execute = function() {
  appState.testResults = TestResults.NO_TESTS_RUN;
  appState.message = undefined;

  appState.userExpressions = generateExpressionsFromTopBlocks();

  // TODO (brent) - should this be using TestResult instead for consistency
  // across apps?
  appState.result = true;
  _.keys(appState.targetExpressions).forEach(function (targetName) {
    var target = appState.targetExpressions[targetName];
    var user = appState.userExpressions[targetName];
    if (!user || !user.isIdenticalTo(target)) {
      appState.result = false;
    }
  });

  var hasVariablesOrFunctions = _(appState.userExpressions).size() > 1;
  if (level.freePlay) {
    appState.result = true;
    appState.testResults = TestResults.FREE_PLAY;
  } else {
    // todo -  should we have single place where we get single target/user?
    var user = appState.userExpressions[COMPUTE_NAME];
    var target = appState.targetExpressions[COMPUTE_NAME];

    if (!appState.result && !hasVariablesOrFunctions && user &&
        user.isEquivalentTo(target)) {
      appState.testResults = TestResults.APP_SPECIFIC_FAIL;
      appState.message = calcMsg.equivalentExpression();
    } else {
      appState.testResults = studioApp.getTestResults(appState.result);
    }
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
  if (appState.result && !hasVariablesOrFunctions) {
    Calc.step();
  } else {
    clearSvgUserExpression();
    _(appState.userExpressions).keys().sort().forEach(function (name, index) {
      var expression = appState.userExpressions[name];
      var expected = appState.targetExpressions[name] || expression;
      var tokenList = expression ? expression.getTokenListDiff(expected) : [];
      if (name === COMPUTE_NAME) {
        name = null;
      }
      displayEquation('userExpression', name, tokenList, index, 'errorToken');
    });
    timeoutList.setTimeout(function () {
      stopAnimatingAndDisplayFeedback();
    }, stepSpeed);
  }
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

  if (_(appState.userExpressions).size() > 1 ||
    _(appState.targetExpressions).size() > 1) {
    throw new Error('Can only animate with single user/target');
  }

  var userExpression = appState.userExpressions[COMPUTE_NAME];
  if (!userExpression) {
    throw new Error('require user expression');
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
  var yPos = (line * 20);
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

},{"../../locale/current/calc":152,"../../locale/current/common":153,"../StudioApp":2,"../block_utils":15,"../codegen":38,"../dom":40,"../skins":108,"../templates/page.html":128,"../timeoutList":134,"../utils":148,"./api":26,"./controls.html":29,"./expressionNode":30,"./levels":31,"./visualization.html":33}],33:[function(require,module,exports){
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
},{"../../locale/current/calc":152,"ejs":168}],31:[function(require,module,exports){
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

},{"../../locale/current/calc":152,"../block_utils":15}],29:[function(require,module,exports){
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
},{"../../locale/current/calc":152,"../../locale/current/common":153,"ejs":168}],27:[function(require,module,exports){
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

},{"../../locale/current/calc":152,"../../locale/current/common":153,"../functionalBlockUtils":69,"../sharedFunctionalBlocks":107}],152:[function(require,module,exports){
/*calc*/ module.exports = window.blockly.appLocale;
},{}],26:[function(require,module,exports){
var ExpressionNode = require('./expressionNode');

exports.compute = function (expr, blockId) {
  Calc.computedExpression = expr instanceof ExpressionNode ? expr :
    new ExpressionNode(parseInt(expr, 10));
};

exports.expression = function (operator, arg1, arg2, blockId) {
  return new ExpressionNode(operator, [arg1, arg2], blockId);
};

},{"./expressionNode":30}],30:[function(require,module,exports){
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
  this.value = val;
  this.blockId = blockId;
  if (args === undefined) {
    args = [];
  }

  if (!Array.isArray(args)) {
    throw new Error("Expected array");
  }

  this.children = args.map(function (item) {
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
  if (["+", "-", "*", "/"].indexOf(this.value) !== -1) {
    return ValueType.ARITHMETIC;
  }

  if (typeof(this.value) === 'string') {
    if (this.children.length === 0) {
      return ValueType.VARIABLE;
    }
    return ValueType.FUNCTION_CALL;
  }

  if (typeof(this.value) === 'number') {
    return ValueType.NUMBER;
  }
};

/**
 * Create a deep clone of this node
 */
ExpressionNode.prototype.clone = function () {
  var children = this.children.map(function (item) {
    return item.clone();
  });
  return new ExpressionNode(this.value, children, this.blockId);
};

/**
 * Replace an ExpressionNode's contents with those of another node.
 */
ExpressionNode.prototype.replaceWith = function (newNode) {
  if (!(newNode instanceof ExpressionNode)) {
    throw new Error("Must replaceWith ExpressionNode");
  }
  // clone so that we have our own copies of any objects
  newNode = newNode.clone();
  this.value = newNode.value;
  this.children = newNode.children;
};

/**
 * Evaluate the expression, returning the result.
 */
ExpressionNode.prototype.evaluate = function () {
  var type = this.getType();
  if (type === ValueType.VARIABLE || type === ValueType.FUNCTION_CALL) {
    throw new Error('Must resolve variables/functions before evaluation');
  }
  if (type === ValueType.NUMBER) {
    return this.value;
  }

  if (type !== ValueType.ARITHMETIC) {
    throw new Error('Unexpected error');
  }

  var left = this.children[0].evaluate();
  var right = this.children[1].evaluate();

  switch (this.value) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      throw new Error('Unknown operator: ' + this.value);
    }
};

/**
 * Depth of this node's tree. A lone value is considered to have a depth of 0.
 */
ExpressionNode.prototype.depth = function () {
  var max = 0;
  for (var i = 0; i < this.children.length; i++) {
    max = Math.max(max, 1 + this.children[i].depth());
  }

  return max;
};

/**
 * Gets the deepest descendant operation ExpressionNode in the tree (i.e. the
 * next node to collapse
 */
ExpressionNode.prototype.getDeepestOperation = function () {
  if (this.children.length === 0) {
    return null;
  }

  var deepestChild = null;
  var deepestDepth = 0;
  for (var i = 0; i < this.children.length; i++) {
    var depth = this.children[i].depth();
    if (depth > deepestDepth) {
      deepestDepth = depth;
      deepestChild = this.children[i];
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
    this.value = this.evaluate();
    this.children = [];
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
  var nodesMatch = other && (this.value === other.value) &&
    (this.children.length === other.children.length);
  var type = this.getType();

  // Empty function calls look slightly different, i.e. foo() instead of foo
  if (this.children.length === 0) {
    return [new Token(this.value.toString(), !nodesMatch)];
  }

  if (type === ValueType.ARITHMETIC) {
    // Deal with arithmetic, which is always in the form (child0 operator child1)
    tokens = [new Token('(', !nodesMatch)];
    if (this.children.length > 0) {
      tokens.push([
        this.children[0].getTokenListDiff(nodesMatch && other.children[0]),
        new Token(" " + this.value + " ", !nodesMatch),
        this.children[1].getTokenListDiff(nodesMatch && other.children[1])
      ]);
    }
    tokens.push(new Token(')', !nodesMatch));

  } else if (type === ValueType.FUNCTION_CALL) {
    // Deal with a function call which will generate something like: foo(1, 2, 3)
    tokens = [
      new Token(this.value, this.value !== other.value),
      new Token('(', !nodesMatch)
    ];

    for (var i = 0; i < this.children.length; i++) {
      if (i > 0) {
        tokens.push(new Token(',', !nodesMatch));
      }
      tokens.push(this.children[i].getTokenListDiff(nodesMatch && other.children[i]));
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

  var rightDeeper = this.children[1].depth() > this.children[0].depth();

  return _.flatten([
    new Token('(', false),
    this.children[0].getTokenList(markDeepest && !rightDeeper),
    new Token(" " + this.value + " ", false),
    this.children[1].getTokenList(markDeepest && rightDeeper),
    new Token(')', false)
  ]);
};

/**
 * Is other exactly the same as this ExpressionNode tree.
 */
ExpressionNode.prototype.isIdenticalTo = function (other) {
  if (!other || this.value !== other.value ||
      this.children.length !== other.children.length) {
    return false;
  }

  for (var i = 0; i < this.children.length; i++) {
    if (!this.children[i].isIdenticalTo(other.children[i])) {
      return false;
    }
  }
  return true;
};

/**
 * Do the two nodes differ only in argument order.
 * todo: unit test
 */
ExpressionNode.prototype.isEquivalentTo = function (target) {
  // only ignore argument order for ARITHMETIC
  if (this.getType() !== ValueType.ARITHMETIC) {
    return this.isIdenticalTo(target);
  }

  if (!target || this.value !== target.value) {
    return false;
  }

  var myLeft = this.children[0];
  var myRight = this.children[1];

  var theirLeft = target.children[0];
  var theirRight = target.children[1];

  if (myLeft.isEquivalentTo(theirLeft)) {
    return myRight.isEquivalentTo(theirRight);
  }
  if (myLeft.isEquivalentTo(theirRight)) {
    return myRight.isEquivalentTo(theirLeft);
  }
  return false;
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

},{"../utils":148}]},{},[32]);
