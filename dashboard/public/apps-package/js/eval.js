require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/eval/main.js":[function(require,module,exports){
'use strict';

var appMain = require('../appMain');
window.Eval = require('./eval');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.evalMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Eval, levels, options);
};

},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","./blocks":"/home/ubuntu/staging/apps/build/js/eval/blocks.js","./eval":"/home/ubuntu/staging/apps/build/js/eval/eval.js","./levels":"/home/ubuntu/staging/apps/build/js/eval/levels.js"}],"/home/ubuntu/staging/apps/build/js/eval/eval.js":[function(require,module,exports){
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
var studioApp = require('../StudioApp').singleton;
var Eval = module.exports;
var commonMsg = require('../locale');
var evalMsg = require('./locale');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var AppView = require('../templates/AppView.jsx');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var blockUtils = require('../block_utils');
var CustomEvalError = require('./evalError');
var EvalText = require('./evalText');
var utils = require('../utils');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

// Loading these modules extends SVGElement and puts canvg in the global
// namespace
var canvg = require('canvg');
// tests don't have svgelement
if (typeof SVGElement !== 'undefined') {
  require('../canvg/svg_todataurl');
}

var level;
var skin;

studioApp.setCheckForEmptyBlocks(false);

Eval.CANVAS_HEIGHT = 400;
Eval.CANVAS_WIDTH = 400;

// This property is set in the api call to draw, and extracted in evalCode
Eval.displayedObject = null;

Eval.answerObject = null;

Eval.feedbackImage = null;
Eval.encodedFeedbackImage = null;

/**
 * Initialize Blockly and the Eval.  Called on page load.
 */
Eval.init = function (config) {
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_display';
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
    var svg = document.getElementById('svgEval');
    if (!svg) {
      throw "something bad happened";
    }
    svg.setAttribute('width', Eval.CANVAS_WIDTH);
    svg.setAttribute('height', Eval.CANVAS_HEIGHT);

    // This is hack that I haven't been able to fully understand. Furthermore,
    // it seems to break the functional blocks in some browsers. As such, I'm
    // just going to disable the hack for this app.
    Blockly.BROKEN_CONTROL_POINTS = false;

    // Add to reserved word list: API, local variables in execution environment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Eval,code');

    if (level.coordinateGridBackground) {
      var background = document.getElementById('background');
      background.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.assetUrl('background_grid.png'));
      studioApp.createCoordinateGridBackground({
        svg: 'svgEval',
        origin: -200,
        firstLabel: -100,
        lastLabel: 100,
        increment: 100
      });
      background.setAttribute('visibility', 'visible');
    }

    if (level.solutionBlocks) {
      var solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks, config.forceInsertTopBlock);

      var answerObject = getDrawableFromBlockXml(solutionBlocks);
      if (answerObject && answerObject.draw) {
        // store object for later analysis
        Eval.answerObject = answerObject;
        answerObject.draw(document.getElementById('answer'));
      }
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's studioApp.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Eval.resetButtonClick);

    if (Blockly.contractEditor) {
      Blockly.contractEditor.registerTestHandler(getEvalExampleFailure);
      Blockly.contractEditor.registerTestResetHandler(resetExampleDisplay);
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
function getEvalExampleFailure(exampleBlock, evaluateInPlayspace) {
  if (evaluateInPlayspace) {
    studioApp.resetButtonClick();
    Eval.resetButtonClick();
    Eval.clearCanvasWithID('user');
  }

  clearTestCanvases();
  displayCallAndExample();

  var failure;
  try {
    var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
    var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");
    var actualDrawer = getDrawableFromBlock(actualBlock);
    var expectedDrawer = getDrawableFromBlock(expectedBlock);

    studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);

    if (!actualDrawer || actualDrawer instanceof CustomEvalError) {
      throw new Error('Invalid Call Block');
    }

    if (!expectedDrawer || expectedDrawer instanceof CustomEvalError) {
      throw new Error('Invalid Result Block');
    }

    actualDrawer.draw(document.getElementById("test-call"));
    expectedDrawer.draw(document.getElementById("test-result"));

    failure = canvasesMatch('test-call', 'test-result') ? null : "Does not match definition";
  } catch (error) {
    failure = "Execution error: " + error.message;
  }

  if (evaluateInPlayspace) {
    showOnlyExample();
  } else {
    resetExampleDisplay();
  }
  return failure;
}

function clearTestCanvases() {
  Eval.clearCanvasWithID("test-call");
  Eval.clearCanvasWithID("test-result");
}

function resetExampleDisplay() {
  document.getElementById('answer').style.display = 'block';
  document.getElementById('test-call').style.display = 'none';
  document.getElementById('test-result').style.display = 'none';
}

function showOnlyExample() {
  document.getElementById('answer').style.display = 'none';
  document.getElementById('test-call').style.display = 'none';
  document.getElementById('test-result').style.display = 'block';
}

function displayCallAndExample() {
  document.getElementById('answer').style.display = 'none';
  document.getElementById('test-call').style.display = 'block';
  document.getElementById('test-result').style.display = 'block';
}

/**
 * Click the run button.  Start the program.
 */
Eval.runButtonClick = function () {
  studioApp.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp.attempts++;
  Eval.execute();
};

Eval.clearCanvasWithID = function (canvasID) {
  var element = document.getElementById(canvasID);
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};
/**
 * App specific reset button click logic.  studioApp.resetButtonClick will be
 * called first.
 */
Eval.resetButtonClick = function () {
  resetExampleDisplay();
  Eval.clearCanvasWithID('user');
  Eval.feedbackImage = null;
  Eval.encodedFeedbackImage = null;
  Eval.result = ResultType.UNSET;
  Eval.testResults = TestResults.NO_TESTS_RUN;
  Eval.message = undefined;
};

/**
 * Evaluates user code, catching any exceptions.
 * @return {EvalImage|CustomEvalError} EvalImage on success, CustomEvalError on
 *  handleable failure, null on unexpected failure.
 */
function evalCode(code) {
  try {
    codegen.evalWith(code, {
      StudioApp: studioApp,
      Eval: api
    });

    var object = Eval.displayedObject;
    Eval.displayedObject = null;
    return object;
  } catch (e) {
    if (e instanceof CustomEvalError) {
      return e;
    }
    if (utils.isInfiniteRecursionError(e)) {
      return new CustomEvalError(CustomEvalError.Type.InfiniteRecursion, null);
    }

    // call window.onerror so that we get new relic collection.  prepend with
    // UserCode so that it's clear this is in eval'ed code.
    if (window.onerror) {
      window.onerror("UserCode:" + e.message, document.URL, 0);
    }
    if (console && console.log) {
      console.log(e);
    }

    return new CustomEvalError(CustomEvalError.Type.UserCodeException, null);
  }
}

/**
 * Get a drawable EvalImage from the blocks currently in the workspace
 * @return {EvalImage|CustomEvalError}
 */
function getDrawableFromBlockspace() {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', ['functional_display', 'functional_definition']);
  var result = evalCode(code);
  return result;
}

function getDrawableFromBlock(block) {
  var definitionCode = Blockly.Generator.blockSpaceToCode('JavaScript', ['functional_definition']);
  var blockCode = Blockly.Generator.blocksToCode('JavaScript', [block]);
  var lines = blockCode.split('\n');
  var lastLine = lines.slice(-1)[0];
  var lastLineWithDisplay = "Eval.display(" + lastLine + ");";
  var blockCodeDisplayed = lines.slice(0, -1).join('\n') + lastLineWithDisplay;
  var result = evalCode(definitionCode + '; ' + blockCodeDisplayed);
  return result;
}

/**
 * Generates a drawable EvalImage from the blocks in the workspace. If blockXml
 * is provided, temporarily sticks those blocks into the workspace to generate
 * the evalImage, then deletes blocks.
 * @return {EvalImage|CustomEvalError}
 */
function getDrawableFromBlockXml(blockXml) {
  if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
    throw new Error("getDrawableFromBlocks shouldn't be called with blocks if " + "we already have blocks in the workspace");
  }
  // Temporarily put the blocks into the workspace so that we can generate code
  studioApp.loadBlocks(blockXml);

  var result = getDrawableFromBlockspace();

  // Remove the blocks
  Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) {
    b.dispose();
  });

  return result;
}

/**
 * Recursively parse an EvalObject looking for EvalText objects. For each one,
 * extract the text content.
 */
Eval.getTextStringsFromObject_ = function (evalObject) {
  if (!evalObject) {
    return [];
  }

  var strs = [];
  if (evalObject instanceof EvalText) {
    strs.push(evalObject.getText());
  }

  evalObject.getChildren().forEach(function (child) {
    strs = strs.concat(Eval.getTextStringsFromObject_(child));
  });
  return strs;
};

/**
 * @returns True if two eval objects have sets of text strings that differ
 *   only in case
 */
Eval.haveCaseMismatch_ = function (object1, object2) {
  var strs1 = Eval.getTextStringsFromObject_(object1);
  var strs2 = Eval.getTextStringsFromObject_(object2);

  if (strs1.length !== strs2.length) {
    return false;
  }

  strs1.sort();
  strs2.sort();

  var caseMismatch = false;

  for (var i = 0; i < strs1.length; i++) {
    var str1 = strs1[i];
    var str2 = strs2[i];
    if (str1 !== str2) {
      if (str1.toLowerCase() === str2.toLowerCase()) {
        caseMismatch = true;
      } else {
        return false; // strings differ by more than case
      }
    }
  }
  return caseMismatch;
};

/**
 * Note: is unable to distinguish from true/false generated from string blocks
 *   vs. from boolean blocks
 * @returns {boolean} True if two eval objects are both booleans, but have different values.
 */
Eval.haveBooleanMismatch_ = function (object1, object2) {
  var strs1 = Eval.getTextStringsFromObject_(object1);
  var strs2 = Eval.getTextStringsFromObject_(object2);

  if (strs1.length !== 1 || strs2.length !== 1) {
    return false;
  }

  var text1 = strs1[0];
  var text2 = strs2[0];

  if (text1 === "true" && text2 === "false" || text1 === "false" && text2 === "true") {
    return true;
  }

  return false;
};

/**
 * Execute the user's code.  Heaven help us...
 */
Eval.execute = function () {
  Eval.result = ResultType.UNSET;
  Eval.testResults = TestResults.NO_TESTS_RUN;
  Eval.message = undefined;

  if (studioApp.hasUnfilledFunctionalBlock()) {
    Eval.result = false;
    Eval.testResults = TestResults.EMPTY_FUNCTIONAL_BLOCK;
    Eval.message = studioApp.getUnfilledFunctionalBlockError('functional_display');
  } else if (studioApp.hasQuestionMarksInNumberField()) {
    Eval.result = false;
    Eval.testResults = TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  } else if (studioApp.hasEmptyFunctionOrVariableName()) {
    Eval.result = false;
    Eval.testResults = TestResults.EMPTY_FUNCTION_NAME;
    Eval.message = commonMsg.unnamedFunction();
  } else {
    clearTestCanvases();
    resetExampleDisplay();
    var userObject = getDrawableFromBlockspace();
    if (userObject && userObject.draw) {
      userObject.draw(document.getElementById("user"));
    }

    // If we got a CustomEvalError, set error message appropriately.
    if (userObject instanceof CustomEvalError) {
      Eval.result = false;
      Eval.testResults = TestResults.APP_SPECIFIC_FAIL;
      Eval.message = userObject.feedbackMessage;
    } else if (Eval.haveCaseMismatch_(userObject, Eval.answerObject)) {
      Eval.result = false;
      Eval.testResults = TestResults.APP_SPECIFIC_FAIL;
      Eval.message = evalMsg.stringMismatchError();
    } else if (Eval.haveBooleanMismatch_(userObject, Eval.answerObject)) {
      Eval.result = false;
      Eval.testResults = TestResults.APP_SPECIFIC_FAIL;
      Eval.message = evalMsg.wrongBooleanError();
    } else {
      Eval.checkExamples_();

      // Haven't run into any errors. Do our actual comparison
      if (Eval.result === ResultType.UNSET) {
        Eval.result = canvasesMatch('user', 'answer');
        Eval.testResults = studioApp.getTestResults(Eval.result);
      }

      if (level.freePlay) {
        Eval.result = true;
        Eval.testResults = TestResults.FREE_PLAY;
      }
    }
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'eval',
    level: level.id,
    builder: level.builder,
    result: Eval.result,
    testResult: Eval.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete,
    image: Eval.encodedFeedbackImage
  };

  // don't try it if function is not defined, which should probably only be
  // true in our test environment
  if (typeof document.getElementById('svgEval').toDataURL === 'undefined') {
    studioApp.report(reportData);
  } else {
    document.getElementById('svgEval').toDataURL("image/png", {
      callback: function callback(pngDataUrl) {
        Eval.feedbackImage = pngDataUrl;
        Eval.encodedFeedbackImage = encodeURIComponent(Eval.feedbackImage.split(',')[1]);

        studioApp.report(reportData);
      }
    });
  }

  studioApp.playAudio(Eval.result ? 'win' : 'failure');
};

Eval.checkExamples_ = function (resetPlayspace) {
  if (!level.examplesRequired) {
    return;
  }

  var exampleless = studioApp.getFunctionWithoutTwoExamples();
  if (exampleless) {
    Eval.result = false;
    Eval.testResults = TestResults.EXAMPLE_FAILED;
    Eval.message = commonMsg.emptyExampleBlockErrorMsg({ functionName: exampleless });
    return;
  }

  var unfilled = studioApp.getUnfilledFunctionalExample();
  if (unfilled) {
    Eval.result = false;
    Eval.testResults = TestResults.EXAMPLE_FAILED;

    var name = unfilled.getRootBlock().getInputTargetBlock('ACTUAL').getTitleValue('NAME');
    Eval.message = commonMsg.emptyExampleBlockErrorMsg({ functionName: name });
    return;
  }

  var failingBlockName = studioApp.checkForFailingExamples(getEvalExampleFailure);
  if (failingBlockName) {
    // Clear user canvas, as this is meant to be a pre-execution failure
    Eval.clearCanvasWithID('user');
    Eval.result = false;
    Eval.testResults = TestResults.EXAMPLE_FAILED;
    Eval.message = commonMsg.exampleErrorMessage({ functionName: failingBlockName });
    return;
  }
};

/**
 * Calling outerHTML on svg elements in safari does not work. Instead we stick
 * it inside a div and get that div's inner html.
 */
function outerHTML(element) {
  var div = document.createElement('div');
  div.appendChild(element.cloneNode(true));
  return div.innerHTML;
}

function imageDataForSvg(elementId) {
  var canvas = document.createElement('canvas');
  canvas.width = Eval.CANVAS_WIDTH;
  canvas.height = Eval.CANVAS_HEIGHT;
  canvg(canvas, outerHTML(document.getElementById(elementId)));

  // canvg attaches an svg object to the canvas, and attaches a setInterval.
  // We don't need this, and that blocks our node process from exitting in
  // tests, so stop it.
  canvas.svg.stop();

  var ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, Eval.CANVAS_WIDTH, Eval.CANVAS_HEIGHT);
}

/**
 * Compares the contents of two SVG elements by id
 * @param {string} canvasA ID of canvas
 * @param {string} canvasB ID of canvas
 * @returns {boolean}
 */
function canvasesMatch(canvasA, canvasB) {
  // Compare the solution and user canvas
  var imageDataA = imageDataForSvg(canvasA);
  var imageDataB = imageDataForSvg(canvasB);

  for (var i = 0; i < imageDataA.data.length; i++) {
    if (0 !== Math.abs(imageDataA.data[i] - imageDataB.data[i])) {
      return false;
    }
  }
  return true;
}

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function displayFeedback(response) {
  if (Eval.result === ResultType.UNSET) {
    // This can happen if we hit reset before our dialog popped up.
    return;
  }

  // override extra top blocks message
  level.extraTopBlocks = evalMsg.extraTopBlocks();

  var tryAgainText;
  if (level.freePlay) {
    tryAgainText = commonMsg.keepPlaying();
  }

  var options = {
    app: 'eval',
    skin: skin.id,
    feedbackType: Eval.testResults,
    response: response,
    level: level,
    tryAgainText: tryAgainText,
    continueText: level.freePlay ? commonMsg.nextPuzzle() : undefined,
    showingSharing: !level.disableSharing && level.freePlay,
    // allow users to save freeplay levels to their gallery
    saveToGalleryUrl: level.freePlay && Eval.response && Eval.response.save_to_gallery_url,
    feedbackImage: Eval.feedbackImage,
    appStrings: {
      reinfFeedbackMsg: evalMsg.reinfFeedbackMsg({ backButton: tryAgainText })
    }
  };
  if (Eval.message && !level.edit_blocks) {
    options.message = Eval.message;
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

  // Add a short delay so that user gets to see their finished drawing.
  setTimeout(function () {
    displayFeedback(response);
  }, 2000);
}

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../canvg/svg_todataurl":"/home/ubuntu/staging/apps/build/js/canvg/svg_todataurl.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/eval/api.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/eval/controls.html.ejs","./evalError":"/home/ubuntu/staging/apps/build/js/eval/evalError.js","./evalText":"/home/ubuntu/staging/apps/build/js/eval/evalText.js","./levels":"/home/ubuntu/staging/apps/build/js/eval/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/eval/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/eval/visualization.html.ejs","canvg":"/home/ubuntu/staging/apps/node_modules/canvg/canvg.js"}],"/home/ubuntu/staging/apps/build/js/eval/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgEval">\n  <image id="background" visibility="hidden" height="400" width="400" x="0" y="0" ></image>\n  <g id="answer">\n  </g>\n  <g id="user">\n  </g>\n  <g id="test-call">\n  </g>\n  <g id="test-result">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/eval/levels.js":[function(require,module,exports){
'use strict';

var msg = require('./locale');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'eval1': {
    solutionBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'green' }),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 200 })
    }),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(blockUtils.blockOfType('functional_plus') + blockUtils.blockOfType('functional_minus') + blockUtils.blockOfType('functional_times') + blockUtils.blockOfType('functional_dividedby') + blockUtils.blockOfType('functional_math_number') + blockUtils.blockOfType('functional_string') + blockUtils.blockOfType('functional_style') + blockUtils.blockOfType('functional_circle') + blockUtils.blockOfType('functional_triangle') + blockUtils.blockOfType('functional_square') + blockUtils.blockOfType('functional_rectangle') + blockUtils.blockOfType('functional_ellipse') + blockUtils.blockOfType('functional_star') + blockUtils.blockOfType('functional_radial_star') + blockUtils.blockOfType('functional_polygon') + blockUtils.blockOfType('place_image') + blockUtils.blockOfType('offset') + blockUtils.blockOfType('overlay') + blockUtils.blockOfType('underlay') + blockUtils.blockOfType('rotate') + blockUtils.blockOfType('scale') + blockUtils.blockOfType('functional_text') + blockUtils.blockOfType('string_append') + blockUtils.blockOfType('string_length') + blockUtils.blockOfType('functional_greater_than') + blockUtils.blockOfType('functional_less_than') + blockUtils.blockOfType('functional_number_equals') + blockUtils.blockOfType('functional_string_equals') + blockUtils.blockOfType('functional_logical_and') + blockUtils.blockOfType('functional_logical_or') + blockUtils.blockOfType('functional_logical_not') + blockUtils.blockOfType('functional_boolean')),
    startBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'black' }),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 200 })
    }),
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

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","./locale":"/home/ubuntu/staging/apps/build/js/eval/locale.js"}],"/home/ubuntu/staging/apps/build/js/eval/controls.html.ejs":[function(require,module,exports){
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
; buf.push('\n\n<button id="continueButton" class="launch hide float-right">\n  <img src="', escape((7,  assetUrl('media/1x1.gif') )), '">', escape((7,  commonMsg.continue() )), '\n</button>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/eval/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/eval/blocks.js":[function(require,module,exports){
/**
 * Blockly Demo: Eval Graphics
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
 * @fileoverview Demonstration of Blockly: Eval Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('./locale');
var commonMsg = require('../locale');

var evalUtils = require('./evalUtils');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function gensym(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_display',
    blockTitle: msg.displayBlockTitle(),
    apiName: 'display',
    returnType: blockly.BlockValueType.NONE,
    args: [{ name: 'ARG1', type: blockly.BlockValueType.NONE }]
  });

  // shapes
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_circle',
    blockTitle: msg.circleBlockTitle(),
    apiName: 'circle',
    args: [{ name: 'SIZE', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_triangle',
    blockTitle: msg.triangleBlockTitle(),
    apiName: 'triangle',
    args: [{ name: 'SIZE', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_square',
    blockTitle: msg.squareBlockTitle(),
    apiName: 'square',
    args: [{ name: 'SIZE', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_rectangle',
    blockTitle: msg.rectangleBlockTitle(),
    apiName: 'rectangle',
    args: [{ name: 'WIDTH', type: blockly.BlockValueType.NUMBER }, { name: 'HEIGHT', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_ellipse',
    blockTitle: msg.ellipseBlockTitle(),
    apiName: 'ellipse',
    args: [{ name: 'WIDTH', type: blockly.BlockValueType.NUMBER }, { name: 'HEIGHT', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_star',
    blockTitle: msg.starBlockTitle(),
    apiName: 'star',
    args: [{ name: 'SIZE', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_radial_star',
    blockTitle: msg.radialStarBlockTitle(),
    apiName: 'radialStar',
    args: [{ name: 'POINTS', type: blockly.BlockValueType.NUMBER }, { name: 'INNER', type: blockly.BlockValueType.NUMBER }, { name: 'OUTER', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_polygon',
    blockTitle: msg.polygonBlockTitle(),
    apiName: 'polygon',
    args: [{ name: 'SIDES', type: blockly.BlockValueType.NUMBER }, { name: 'LENGTH', type: blockly.BlockValueType.NUMBER }, { name: 'STYLE', type: blockly.BlockValueType.STRING }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_text',
    blockTitle: msg.textBlockTitle(),
    apiName: 'text',
    args: [{ name: 'TEXT', type: blockly.BlockValueType.STRING }, { name: 'SIZE', type: blockly.BlockValueType.NUMBER }, { name: 'COLOR', type: blockly.BlockValueType.STRING }]
  });

  // image manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'overlay',
    blockTitle: msg.overlayBlockTitle(),
    apiName: 'overlay',
    args: [{ name: 'TOP', type: blockly.BlockValueType.IMAGE }, { name: 'BOTTOM', type: blockly.BlockValueType.IMAGE }],
    verticallyStackInputs: true
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'underlay',
    blockTitle: msg.underlayBlockTitle(),
    apiName: 'underlay',
    args: [{ name: 'BOTTOM', type: blockly.BlockValueType.IMAGE }, { name: 'TOP', type: blockly.BlockValueType.IMAGE }],
    verticallyStackInputs: true
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'place_image',
    blockTitle: msg.placeImageBlockTitle(),
    apiName: 'placeImage',
    args: [{ name: 'X', type: blockly.BlockValueType.NUMBER }, { name: 'Y', type: blockly.BlockValueType.NUMBER }, { name: 'IMAGE', type: blockly.BlockValueType.IMAGE }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'offset',
    blockTitle: msg.offsetBlockTitle(),
    apiName: 'offset',
    args: [{ name: 'X', type: blockly.BlockValueType.NUMBER }, { name: 'Y', type: blockly.BlockValueType.NUMBER }, { name: 'IMAGE', type: blockly.BlockValueType.IMAGE }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'rotate',
    blockTitle: msg.rotateImageBlockTitle(),
    apiName: 'rotateImage',
    args: [{ name: 'DEGREES', type: blockly.BlockValueType.NUMBER }, { name: 'IMAGE', type: blockly.BlockValueType.IMAGE }]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'scale',
    blockTitle: msg.scaleImageBlockTitle(),
    apiName: 'scaleImage',
    args: [{ name: 'FACTOR', type: blockly.BlockValueType.NUMBER }, { name: 'IMAGE', type: blockly.BlockValueType.IMAGE }]
  });

  // string manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_append',
    blockTitle: msg.stringAppendBlockTitle(),
    apiName: 'stringAppend',
    returnType: blockly.BlockValueType.STRING,
    args: [{ name: 'FIRST', type: blockly.BlockValueType.STRING }, { name: 'SECOND', type: blockly.BlockValueType.STRING }]
  });

  // polling for values
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_length',
    blockTitle: msg.stringLengthBlockTitle(),
    apiName: 'stringLength',
    returnType: blockly.BlockValueType.NUMBER,
    args: [{ name: 'STR', type: blockly.BlockValueType.STRING }]
  });

  blockly.FunctionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_style',
    values: [[msg.solid(), 'solid'], ['75%', '75%'], ['50%', '50%'], ['25%', '25%'], [msg.outline(), 'outline']]
  });
};

function installFunctionalBlock(blockly, generator, gensym, options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;
  var returnType = options.returnType || blockly.BlockValueType.IMAGE;

  blockly.Blocks[blockName] = {
    init: function init() {
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockTitle, returnType, args, {
        verticallyStackInputs: options.verticallyStackInputs
      });
    }
  };

  generator[blockName] = function () {
    var apiArgs = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var apiArg = Blockly.JavaScript.statementToCode(this, arg.name, false);
      // Provide defaults
      if (!apiArg) {
        if (arg.type === blockly.BlockValueType.NUMBER) {
          apiArg = '0';
        } else if (arg.name === 'STYLE') {
          apiArg = blockly.JavaScript.quote_('solid');
        } else if (arg.name === 'COLOR') {
          apiArg = blockly.JavaScript.quote_('black');
        }
      }
      apiArgs.push(apiArg);
    }

    return "Eval." + apiName + "(" + apiArgs.join(", ") + ")";
  };
}

},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../sharedFunctionalBlocks":"/home/ubuntu/staging/apps/build/js/sharedFunctionalBlocks.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js","./locale":"/home/ubuntu/staging/apps/build/js/eval/locale.js"}],"/home/ubuntu/staging/apps/build/js/eval/api.js":[function(require,module,exports){
'use strict';

var evalUtils = require('./evalUtils');
var EvalImage = require('./evalImage');
var EvalText = require('./evalText');
var EvalCircle = require('./evalCircle');
var EvalTriangle = require('./evalTriangle');
var EvalMulti = require('./evalMulti');
var EvalRect = require('./evalRect');
var EvalEllipse = require('./evalEllipse');
var EvalText = require('./evalText');
var EvalStar = require('./evalStar');
var EvalPolygon = require('./evalPolygon');

// We don't use blockId at all in Eval since everything is evaluated at once.

exports.display = function (object) {
  if (object === undefined) {
    object = "";
  }

  // call tolocaleString on numbers so that we get commas for large numbers
  if (typeof object === 'number' && object.toLocaleString) {
    object = object.toLocaleString();
  }

  if (!object.draw) {
    object = new EvalText(object.toString(), 12, 'black');
  }
  Eval.displayedObject = object;
};

exports.circle = function (size, style, color) {
  return new EvalCircle(size, style, color);
};

exports.triangle = function (size, style, color) {
  return new EvalTriangle(size, style, color);
};

exports.overlay = function (top, bottom) {
  return new EvalMulti(top, bottom);
};

exports.underlay = function (bottom, top) {
  return new EvalMulti(top, bottom);
};

exports.square = function (size, style, color) {
  return new EvalRect(size, size, style, color);
};

exports.rectangle = function (width, height, style, color) {
  return new EvalRect(width, height, style, color);
};

exports.ellipse = function (width, height, style, color) {
  return new EvalEllipse(width, height, style, color);
};

exports.text = function (text, fontSize, color) {
  return new EvalText(text, fontSize, color);
};

exports.star = function (radius, style, color) {
  var innerRadius = (3 - Math.sqrt(5)) / 2 * radius;
  return new EvalStar(5, innerRadius, radius, style, color);
};

exports.radialStar = function (points, inner, outer, style, color) {
  return new EvalStar(points, inner, outer, style, color);
};

exports.polygon = function (points, length, style, color) {
  return new EvalPolygon(points, length, style, color);
};

exports.placeImage = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);

  // origin at center
  x = x + Eval.CANVAS_WIDTH / 2;
  y = y + Eval.CANVAS_HEIGHT / 2;

  // User inputs y in cartesian space. Convert to pixel space before sending
  // to our EvalImage.
  y = evalUtils.cartesianToPixel(y);

  // relative to center of workspace
  image.place(x, y);
  return image;
};

exports.offset = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);

  x = image.x_ + x;
  y = image.y_ - y;

  image.place(x, y);
  return image;
};

exports.rotateImage = function (degrees, image) {
  evalUtils.ensureNumber(degrees);

  image.rotate(degrees);
  return image;
};

exports.scaleImage = function (factor, image) {
  image.scale(factor, factor);
  return image;
};

exports.stringAppend = function (first, second) {
  evalUtils.ensureString(first);
  evalUtils.ensureString(second);

  return first + second;
};

// polling for values
exports.stringLength = function (str) {
  evalUtils.ensureString(str);

  return str.length;
};

},{"./evalCircle":"/home/ubuntu/staging/apps/build/js/eval/evalCircle.js","./evalEllipse":"/home/ubuntu/staging/apps/build/js/eval/evalEllipse.js","./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalMulti":"/home/ubuntu/staging/apps/build/js/eval/evalMulti.js","./evalPolygon":"/home/ubuntu/staging/apps/build/js/eval/evalPolygon.js","./evalRect":"/home/ubuntu/staging/apps/build/js/eval/evalRect.js","./evalStar":"/home/ubuntu/staging/apps/build/js/eval/evalStar.js","./evalText":"/home/ubuntu/staging/apps/build/js/eval/evalText.js","./evalTriangle":"/home/ubuntu/staging/apps/build/js/eval/evalTriangle.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalTriangle.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalTriangle = function EvalTriangle(edge, style, color) {
  evalUtils.ensureNumber(edge);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.edge_ = edge;

  this.element_ = null;
};
EvalTriangle.inherits(EvalImage);
module.exports = EvalTriangle;

EvalTriangle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  // center at 0, 0 (allowing transforms to move it around)
  // the center is halfway between width, and a third of the way up the height
  var height = Math.sqrt(3) / 2 * this.edge_;

  var bottomLeft = {
    x: -this.edge_ / 2,
    y: height / 3
  };

  var bottomRight = {
    x: this.edge_ / 2,
    y: height / 3
  };

  var top = {
    x: 0,
    y: -height * 2 / 3
  };

  this.element_.setAttribute('points', bottomLeft.x + ',' + bottomLeft.y + ' ' + bottomRight.x + ',' + bottomRight.y + ' ' + top.x + ',' + top.y);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalText.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalText = function EvalText(text, fontSize, color) {
  evalUtils.ensureString(text);
  evalUtils.ensureNumber(fontSize);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, ['solid', color]);

  this.text_ = text;
  this.fontSize_ = fontSize;

  this.element_ = null;
};
EvalText.inherits(EvalImage);
module.exports = EvalText;

EvalText.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'text');
    parent.appendChild(this.element_);
  }
  this.element_.textContent = this.text_;
  this.element_.setAttribute('style', 'font-size: ' + this.fontSize_ + 'pt');

  var bbox = this.element_.getBBox();
  // center at origin
  this.element_.setAttribute('x', -bbox.width / 2);
  this.element_.setAttribute('y', -bbox.height / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalText.prototype.getText = function () {
  return this.text_;
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalStar.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalStar = function EvalStar(pointCount, inner, outer, style, color) {
  evalUtils.ensureNumber(pointCount);
  evalUtils.ensureNumber(inner);
  evalUtils.ensureNumber(outer);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.outer_ = outer;
  this.inner_ = inner;
  this.pointCount_ = pointCount;

  this.element_ = null;
};
EvalStar.inherits(EvalImage);
module.exports = EvalStar;

EvalStar.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  var points = [];
  var outerRadius = this.outer_;
  var innerRadius = this.inner_;

  var angleDelta = 2 * Math.PI / this.pointCount_;
  for (var angle = 0; angle < 2 * Math.PI; angle += angleDelta) {
    points.push(outerRadius * Math.cos(angle) + "," + outerRadius * Math.sin(angle));
    points.push(innerRadius * Math.cos(angle + angleDelta / 2) + "," + innerRadius * Math.sin(angle + angleDelta / 2));
  }

  this.element_.setAttribute('points', points.join(' '));
  if (this.pointCount_ % 2 == 1) {
    this.rotate(-90 / this.pointCount_);
  }

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalRect.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalRect = function EvalRect(width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalRect.inherits(EvalImage);
module.exports = EvalRect;

EvalRect.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'rect');
    parent.appendChild(this.element_);
  }

  // center rect at 0, 0. we'll use transforms to move it.
  this.element_.setAttribute('x', -this.width_ / 2);
  this.element_.setAttribute('y', -this.height_ / 2);
  this.element_.setAttribute('width', this.width_);
  this.element_.setAttribute('height', this.height_);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalPolygon.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalPolygon = function EvalPolygon(sideCount, length, style, color) {
  evalUtils.ensureNumber(sideCount);
  evalUtils.ensureNumber(length);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = length / (2 * Math.sin(Math.PI / sideCount));
  this.pointCount_ = sideCount;

  this.element_ = null;
};
EvalPolygon.inherits(EvalImage);
module.exports = EvalPolygon;

EvalPolygon.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  var points = [];
  var radius = this.radius_;

  var angle = 2 * Math.PI / this.pointCount_;
  for (var i = 1; i <= this.pointCount_; i++) {
    points.push(radius * Math.cos(i * angle) + "," + radius * Math.sin(i * angle));
  }

  this.element_.setAttribute('points', points.join(' '));

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalMulti.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalMulti = function EvalMulti(image1, image2) {
  evalUtils.ensureType(image1, EvalImage);
  evalUtils.ensureType(image2, EvalImage);

  EvalImage.apply(this);

  this.image1_ = image1;
  this.image2_ = image2;

  // we want an object centered at 0, 0 that we can then apply transforms to.
  // to accomplish this, we need to adjust the children's x/y's to be relative
  // to us
  var deltaX, deltaY;
  deltaX = this.image1_.x_ - this.x_;
  deltaY = this.image1_.y_ - this.y_;
  this.image1_.updatePosition(deltaX, deltaY);
  deltaX = this.image2_.x_ - this.x_;
  deltaY = this.image2_.y_ - this.y_;
  this.image2_.updatePosition(deltaX, deltaY);

  this.element_ = null;
};
EvalMulti.inherits(EvalImage);
module.exports = EvalMulti;

EvalMulti.prototype.draw = function (parent) {
  if (!this.element_) {
    var deltaX, deltaY;

    this.element_ = document.createElementNS(Blockly.SVG_NS, 'g');
    parent.appendChild(this.element_);
  }

  this.image2_.draw(this.element_);
  this.image1_.draw(this.element_);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalImage.prototype.getChildren = function () {
  return [this.image1_, this.image2_];
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalEllipse.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalCircle = function EvalCircle(width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'ellipse');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('rx', this.width_ / 2);
  this.element_.setAttribute('ry', this.height_ / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalCircle.js":[function(require,module,exports){
'use strict';

var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalCircle = function EvalCircle(radius, style, color) {
  evalUtils.ensureNumber(radius);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = radius;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('r', this.radius_);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalCircle.prototype.rotate = function () {
  // No-op. Rotating the circle svg gives us some problems when we convert to
  // a bitmap.
};

},{"./evalImage":"/home/ubuntu/staging/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalImage.js":[function(require,module,exports){
'use strict';

var evalUtils = require('./evalUtils');

var EvalImage = function EvalImage(style, color) {
  // x/y location in pixel space of object's center
  this.x_ = 200;
  this.y_ = 200;

  this.rotation_ = 0;
  this.scaleX_ = 1.0;
  this.scaleY = 1.0;

  this.style_ = style;
  this.color_ = color;
};
module.exports = EvalImage;

EvalImage.prototype.updatePosition = function (x, y) {
  this.x_ = x;
  this.y_ = y;
};

EvalImage.prototype.draw = function (parentElement) {
  if (this.style_ && this.color_) {
    this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
    this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
    this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
  }

  var transform = "";
  transform += " translate(" + this.x_ + " " + this.y_ + ")";

  if (this.scaleX_ !== 1.0 || this.scaleY !== 1.0) {
    transform += " scale(" + this.scaleX_ + " " + this.scaleY_ + ")";
  }

  if (this.rotation_ !== 0) {
    transform += " rotate(" + this.rotation_ + ")";
  }

  if (transform === "") {
    this.element_.removeAttribute("transform");
  } else {
    this.element_.setAttribute("transform", transform);
  }
};

EvalImage.prototype.place = function (x, y) {
  this.x_ = x;
  this.y_ = y;
};

EvalImage.prototype.rotate = function (degrees) {
  this.rotation_ += degrees;
};

EvalImage.prototype.scale = function (scaleX, scaleY) {
  this.scaleX_ = scaleX;
  this.scaleY_ = scaleY;
};

/**
 * Get child EvalObjects. overridden by children
 */
EvalImage.prototype.getChildren = function () {
  return [];
};

},{"./evalUtils":"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalUtils.js":[function(require,module,exports){
'use strict';

var CustomEvalError = require('./evalError');
var utils = require('../utils');
var _ = utils.getLodash();

/**
 * Throws an expection if val is not of the expected type. Type is either a
 * string (like "number" or "string") or an object (Like EvalImage).
 */
module.exports.ensureString = function (val) {
  return module.exports.ensureType(val, "string");
};

module.exports.ensureNumber = function (val) {
  return module.exports.ensureType(val, "number");
};

/**
 * Style is either "solid", "outline", or a percentage i.e. "70%"
 */
module.exports.ensureStyle = function (val) {
  if (val.slice(-1) === '%') {
    var opacity = module.exports.getOpacity(val);
    if (opacity >= 0 && opacity <= 1.0) {
      return;
    }
  }if (_.contains(['outline', 'solid'], val)) {
    return;
  }
  throw new CustomEvalError(CustomEvalError.Type.BadStyle, val);
};

/**
 * Checks to see if this is a valid color, throwing if it isnt. Color validity
 * is determined by setting the value on an html element and seeing if it takes.
 */
module.exports.ensureColor = function (val) {
  var e = document.createElement('div');
  e.style.color = val;
  // We can't check that e.style.color === val, since some vals will be
  // transformed (i.e. #fff -> rgb(255, 255, 255)
  if (!e.style.color) {
    throw new CustomEvalError(CustomEvalError.Type.BadColor, val);
  }
};

/**
 * @param val
 * @param {string|Class} type
 */
module.exports.ensureType = function (val, type) {
  if (typeof type === "string") {
    if (typeof val !== type) {
      throw new Error("expected type: " + type + "\ngot type: " + typeof val);
    }
  } else if (!(val instanceof type)) {
    throw new Error("unexpected object");
  }
};

module.exports.getFill = function (style, color) {
  if (style === 'outline') {
    return "none";
  }
  // for now, we treat anything we don't recognize as solid.
  return color;
};

module.exports.getStroke = function (style, color) {
  if (style === "outline") {
    return color;
  }
  return "none";
};

/**
 * Get the opacity from the style. Style is a string that is either a word or
 * percentage (i.e. 25%).
 */
module.exports.getOpacity = function (style) {
  var alpha = 1.0;
  if (style.slice(-1) === "%") {
    alpha = parseInt(style.slice(0, -1), 10) / 100;
  }
  return alpha;
};

/**
 * Users specify pixels in a coordinate system where the origin is at the bottom
 * left, and x and y increase as you move right/up. I'm referring to this as
 * the cartesian coordinate system.
 * The pixel coordinate system instead has origin at the top left, and x and y
 * increase as you move right/down.
 */
module.exports.cartesianToPixel = function (cartesianY) {
  return 400 - cartesianY;
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./evalError":"/home/ubuntu/staging/apps/build/js/eval/evalError.js"}],"/home/ubuntu/staging/apps/build/js/eval/evalError.js":[function(require,module,exports){
'use strict';

var evalMsg = require('./locale');

/**
 * An Eval error indicating that something bad happened, but we understand
 * the bad and want our app to handle it (i.e. user used an invalid style
 * string and we want to display an error message).
 */
var CustomEvalError = function CustomEvalError(type, val) {
  this.type = type;

  switch (type) {
    case CustomEvalError.Type.BadStyle:
      this.feedbackMessage = evalMsg.badStyleStringError({ val: val });
      break;
    case CustomEvalError.Type.BadColor:
      this.feedbackMessage = evalMsg.badColorStringError({ val: val });
      break;
    case CustomEvalError.Type.InfiniteRecursion:
      this.feedbackMessage = evalMsg.infiniteRecursionError();
      break;
    case CustomEvalError.Type.UserCodeException:
      this.feedbackMessage = evalMsg.userCodeException();
      break;
    default:
      this.feedbackMessag = '';
      break;
  }
};
module.exports = CustomEvalError;

CustomEvalError.Type = {
  BadStyle: 0,
  BadColor: 1,
  InfiniteRecursion: 2,
  UserCodeException: 3
};

},{"./locale":"/home/ubuntu/staging/apps/build/js/eval/locale.js"}],"/home/ubuntu/staging/apps/build/js/eval/locale.js":[function(require,module,exports){
// locale for eval

"use strict";

module.exports = window.blockly.eval_locale;

},{}]},{},["/home/ubuntu/staging/apps/build/js/eval/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ldmFsL21haW4uanMiLCJidWlsZC9qcy9ldmFsL2V2YWwuanMiLCJidWlsZC9qcy9ldmFsL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2xldmVscy5qcyIsImJ1aWxkL2pzL2V2YWwvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2V2YWwvYXBpLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsVHJpYW5nbGUuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxUZXh0LmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsU3Rhci5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbFJlY3QuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxQb2x5Z29uLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsTXVsdGkuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxFbGxpcHNlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsQ2lyY2xlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsSW1hZ2UuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxVdGlscy5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbEVycm9yLmpzIiwiYnVpbGQvanMvZXZhbC9sb2NhbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FB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RSxDQUFDO0FBQ25ELFlBQU07QUFBQSxBQUNSO0FBQ0UsVUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsWUFBTTtBQUFBLEdBQ1Q7Q0FDRixDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUM7O0FBRWpDLGVBQWUsQ0FBQyxJQUFJLEdBQUc7QUFDckIsVUFBUSxFQUFFLENBQUM7QUFDWCxVQUFRLEVBQUUsQ0FBQztBQUNYLG1CQUFpQixFQUFFLENBQUM7QUFDcEIsbUJBQWlCLEVBQUUsQ0FBQztDQUNyQixDQUFDOzs7Ozs7O0FDakNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRXZhbCA9IHJlcXVpcmUoJy4vZXZhbCcpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5ldmFsTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuRXZhbCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogRXZhbCBHcmFwaGljc1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZhbCA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEV2YWwgPSBtb2R1bGUuZXhwb3J0cztcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBldmFsTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIEN1c3RvbUV2YWxFcnJvciA9IHJlcXVpcmUoJy4vZXZhbEVycm9yJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG4vLyBMb2FkaW5nIHRoZXNlIG1vZHVsZXMgZXh0ZW5kcyBTVkdFbGVtZW50IGFuZCBwdXRzIGNhbnZnIGluIHRoZSBnbG9iYWxcbi8vIG5hbWVzcGFjZVxudmFyIGNhbnZnID0gcmVxdWlyZSgnY2FudmcnKTtcbi8vIHRlc3RzIGRvbid0IGhhdmUgc3ZnZWxlbWVudFxuaWYgKHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICByZXF1aXJlKCcuLi9jYW52Zy9zdmdfdG9kYXRhdXJsJyk7XG59XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2NrcyhmYWxzZSk7XG5cbkV2YWwuQ0FOVkFTX0hFSUdIVCA9IDQwMDtcbkV2YWwuQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHNldCBpbiB0aGUgYXBpIGNhbGwgdG8gZHJhdywgYW5kIGV4dHJhY3RlZCBpbiBldmFsQ29kZVxuRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBudWxsO1xuXG5FdmFsLmFuc3dlck9iamVjdCA9IG51bGw7XG5cbkV2YWwuZmVlZGJhY2tJbWFnZSA9IG51bGw7XG5FdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBFdmFsLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuRXZhbC5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSB0cnVlO1xuICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayA9ICdmdW5jdGlvbmFsX2Rpc3BsYXknO1xuICBjb25maWcuZW5hYmxlU2hvd0NvZGUgPSBmYWxzZTtcblxuICAvLyBXZSBkb24ndCB3YW50IGljb25zIGluIGluc3RydWN0aW9uc1xuICBjb25maWcuc2tpbi5zdGF0aWNBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi53aW5BdmF0YXIgPSBudWxsO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0V2YWwnKTtcbiAgICBpZiAoIXN2Zykge1xuICAgICAgdGhyb3cgXCJzb21ldGhpbmcgYmFkIGhhcHBlbmVkXCI7XG4gICAgfVxuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRXZhbC5DQU5WQVNfV0lEVEgpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEV2YWwuQ0FOVkFTX0hFSUdIVCk7XG5cbiAgICAvLyBUaGlzIGlzIGhhY2sgdGhhdCBJIGhhdmVuJ3QgYmVlbiBhYmxlIHRvIGZ1bGx5IHVuZGVyc3RhbmQuIEZ1cnRoZXJtb3JlLFxuICAgIC8vIGl0IHNlZW1zIHRvIGJyZWFrIHRoZSBmdW5jdGlvbmFsIGJsb2NrcyBpbiBzb21lIGJyb3dzZXJzLiBBcyBzdWNoLCBJJ21cbiAgICAvLyBqdXN0IGdvaW5nIHRvIGRpc2FibGUgdGhlIGhhY2sgZm9yIHRoaXMgYXBwLlxuICAgIEJsb2NrbHkuQlJPS0VOX0NPTlRST0xfUE9JTlRTID0gZmFsc2U7XG5cbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZW52aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnRXZhbCxjb2RlJyk7XG5cbiAgICBpZiAobGV2ZWwuY29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKSB7XG4gICAgICB2YXIgYmFja2dyb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kJyk7XG4gICAgICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX2dyaWQucG5nJykpO1xuICAgICAgICBzdHVkaW9BcHAuY3JlYXRlQ29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKHtcbiAgICAgICAgICBzdmc6ICdzdmdFdmFsJyxcbiAgICAgICAgICBvcmlnaW46IC0yMDAsXG4gICAgICAgICAgZmlyc3RMYWJlbDogLTEwMCxcbiAgICAgICAgICBsYXN0TGFiZWw6IDEwMCxcbiAgICAgICAgICBpbmNyZW1lbnQ6IDEwMFxuICAgICAgICB9KTtcbiAgICAgIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAobGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICAgIHZhciBzb2x1dGlvbkJsb2NrcyA9IGJsb2NrVXRpbHMuZm9yY2VJbnNlcnRUb3BCbG9jayhsZXZlbC5zb2x1dGlvbkJsb2NrcyxcbiAgICAgICAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2spO1xuXG4gICAgICB2YXIgYW5zd2VyT2JqZWN0ID0gZ2V0RHJhd2FibGVGcm9tQmxvY2tYbWwoc29sdXRpb25CbG9ja3MpO1xuICAgICAgaWYgKGFuc3dlck9iamVjdCAmJiBhbnN3ZXJPYmplY3QuZHJhdykge1xuICAgICAgICAvLyBzdG9yZSBvYmplY3QgZm9yIGxhdGVyIGFuYWx5c2lzXG4gICAgICAgIEV2YWwuYW5zd2VyT2JqZWN0ID0gYW5zd2VyT2JqZWN0O1xuICAgICAgICBhbnN3ZXJPYmplY3QuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICAgIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICAgIC8vIGJhc2UncyBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlIGNhbGxlZCBmaXJzdFxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmVzZXRCdXR0b24sIEV2YWwucmVzZXRCdXR0b25DbGljayk7XG5cbiAgICBpZiAoQmxvY2tseS5jb250cmFjdEVkaXRvcikge1xuICAgICAgQmxvY2tseS5jb250cmFjdEVkaXRvci5yZWdpc3RlclRlc3RIYW5kbGVyKGdldEV2YWxFeGFtcGxlRmFpbHVyZSk7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdFJlc2V0SGFuZGxlcihyZXNldEV4YW1wbGVEaXNwbGF5KTtcbiAgICB9XG4gIH07XG5cbiAgUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlldywge1xuICAgIHJlbmRlckNvZGVBcHA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwYWdlKHtcbiAgICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICAgIGJsb2NrQ291bnRlckNsYXNzIDogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9uTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0dWRpb0FwcC5pbml0KGNvbmZpZyk7XG4gICAgfVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7QmxvY2tseS5CbG9ja31cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2V2YWx1YXRlSW5QbGF5c3BhY2VdIFRydWUgaWYgdGhpcyB0ZXN0IHNob3VsZCBhbHNvIHNob3dcbiAqICAgZXZhbHVhdGlvbiBpbiB0aGUgcGxheSBzcGFjZVxuICogQHJldHVybnMge3N0cmluZ30gRXJyb3Igc3RyaW5nLCBvciBudWxsIGlmIHN1Y2Nlc3NcbiAqL1xuZnVuY3Rpb24gZ2V0RXZhbEV4YW1wbGVGYWlsdXJlKGV4YW1wbGVCbG9jaywgZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICBpZiAoZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICAgIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrKCk7XG4gICAgRXZhbC5yZXNldEJ1dHRvbkNsaWNrKCk7XG4gICAgRXZhbC5jbGVhckNhbnZhc1dpdGhJRCgndXNlcicpO1xuICB9XG5cbiAgY2xlYXJUZXN0Q2FudmFzZXMoKTtcbiAgZGlzcGxheUNhbGxBbmRFeGFtcGxlKCk7XG5cbiAgdmFyIGZhaWx1cmU7XG4gIHRyeSB7XG4gICAgdmFyIGFjdHVhbEJsb2NrID0gZXhhbXBsZUJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soXCJBQ1RVQUxcIik7XG4gICAgdmFyIGV4cGVjdGVkQmxvY2sgPSBleGFtcGxlQmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhcIkVYUEVDVEVEXCIpO1xuICAgIHZhciBhY3R1YWxEcmF3ZXIgPSBnZXREcmF3YWJsZUZyb21CbG9jayhhY3R1YWxCbG9jayk7XG4gICAgdmFyIGV4cGVjdGVkRHJhd2VyID0gZ2V0RHJhd2FibGVGcm9tQmxvY2soZXhwZWN0ZWRCbG9jayk7XG5cbiAgICBzdHVkaW9BcHAuZmVlZGJhY2tfLnRocm93T25JbnZhbGlkRXhhbXBsZUJsb2NrcyhhY3R1YWxCbG9jaywgZXhwZWN0ZWRCbG9jayk7XG5cbiAgICBpZiAoIWFjdHVhbERyYXdlciB8fCBhY3R1YWxEcmF3ZXIgaW5zdGFuY2VvZiBDdXN0b21FdmFsRXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBDYWxsIEJsb2NrJyk7XG4gICAgfVxuXG4gICAgaWYgKCFleHBlY3RlZERyYXdlciB8fCBleHBlY3RlZERyYXdlciBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFJlc3VsdCBCbG9jaycpO1xuICAgIH1cblxuICAgIGFjdHVhbERyYXdlci5kcmF3KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVzdC1jYWxsXCIpKTtcbiAgICBleHBlY3RlZERyYXdlci5kcmF3KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVzdC1yZXN1bHRcIikpO1xuXG4gICAgZmFpbHVyZSA9IGNhbnZhc2VzTWF0Y2goJ3Rlc3QtY2FsbCcsICd0ZXN0LXJlc3VsdCcpID8gbnVsbCA6XG4gICAgICBcIkRvZXMgbm90IG1hdGNoIGRlZmluaXRpb25cIjtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGZhaWx1cmUgPSBcIkV4ZWN1dGlvbiBlcnJvcjogXCIgKyBlcnJvci5tZXNzYWdlO1xuICB9XG5cbiAgaWYgKGV2YWx1YXRlSW5QbGF5c3BhY2UpIHtcbiAgICBzaG93T25seUV4YW1wbGUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXNldEV4YW1wbGVEaXNwbGF5KCk7XG4gIH1cbiAgcmV0dXJuIGZhaWx1cmU7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGVzdENhbnZhc2VzKCkge1xuICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKFwidGVzdC1jYWxsXCIpO1xuICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKFwidGVzdC1yZXN1bHRcIik7XG59XG5cbmZ1bmN0aW9uIHJlc2V0RXhhbXBsZURpc3BsYXkoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtY2FsbCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LXJlc3VsdCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59XG5cbmZ1bmN0aW9uIHNob3dPbmx5RXhhbXBsZSgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWNhbGwnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1yZXN1bHQnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbn1cblxuZnVuY3Rpb24gZGlzcGxheUNhbGxBbmRFeGFtcGxlKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtY2FsbCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1yZXN1bHQnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbn1cblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5FdmFsLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICBzdHVkaW9BcHAuYXR0ZW1wdHMrKztcbiAgRXZhbC5leGVjdXRlKCk7XG59O1xuXG5FdmFsLmNsZWFyQ2FudmFzV2l0aElEID0gZnVuY3Rpb24gKGNhbnZhc0lEKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzSUQpO1xuICB3aGlsZSAoZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICB9XG59O1xuLyoqXG4gKiBBcHAgc3BlY2lmaWMgcmVzZXQgYnV0dG9uIGNsaWNrIGxvZ2ljLiAgc3R1ZGlvQXBwLnJlc2V0QnV0dG9uQ2xpY2sgd2lsbCBiZVxuICogY2FsbGVkIGZpcnN0LlxuICovXG5FdmFsLnJlc2V0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHJlc2V0RXhhbXBsZURpc3BsYXkoKTtcbiAgRXZhbC5jbGVhckNhbnZhc1dpdGhJRCgndXNlcicpO1xuICBFdmFsLmZlZWRiYWNrSW1hZ2UgPSBudWxsO1xuICBFdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlID0gbnVsbDtcbiAgRXZhbC5yZXN1bHQgPSBSZXN1bHRUeXBlLlVOU0VUO1xuICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOO1xuICBFdmFsLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlcyB1c2VyIGNvZGUsIGNhdGNoaW5nIGFueSBleGNlcHRpb25zLlxuICogQHJldHVybiB7RXZhbEltYWdlfEN1c3RvbUV2YWxFcnJvcn0gRXZhbEltYWdlIG9uIHN1Y2Nlc3MsIEN1c3RvbUV2YWxFcnJvciBvblxuICogIGhhbmRsZWFibGUgZmFpbHVyZSwgbnVsbCBvbiB1bmV4cGVjdGVkIGZhaWx1cmUuXG4gKi9cbmZ1bmN0aW9uIGV2YWxDb2RlIChjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgIEV2YWw6IGFwaVxuICAgIH0pO1xuXG4gICAgdmFyIG9iamVjdCA9IEV2YWwuZGlzcGxheWVkT2JqZWN0O1xuICAgIEV2YWwuZGlzcGxheWVkT2JqZWN0ID0gbnVsbDtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBDdXN0b21FdmFsRXJyb3IpIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNJbmZpbml0ZVJlY3Vyc2lvbkVycm9yKGUpKSB7XG4gICAgICByZXR1cm4gbmV3IEN1c3RvbUV2YWxFcnJvcihDdXN0b21FdmFsRXJyb3IuVHlwZS5JbmZpbml0ZVJlY3Vyc2lvbiwgbnVsbCk7XG4gICAgfVxuXG4gICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgIC8vIFVzZXJDb2RlIHNvIHRoYXQgaXQncyBjbGVhciB0aGlzIGlzIGluIGV2YWwnZWQgY29kZS5cbiAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgfVxuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEN1c3RvbUV2YWxFcnJvcihDdXN0b21FdmFsRXJyb3IuVHlwZS5Vc2VyQ29kZUV4Y2VwdGlvbiwgbnVsbCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYSBkcmF3YWJsZSBFdmFsSW1hZ2UgZnJvbSB0aGUgYmxvY2tzIGN1cnJlbnRseSBpbiB0aGUgd29ya3NwYWNlXG4gKiBAcmV0dXJuIHtFdmFsSW1hZ2V8Q3VzdG9tRXZhbEVycm9yfVxuICovXG5mdW5jdGlvbiBnZXREcmF3YWJsZUZyb21CbG9ja3NwYWNlKCkge1xuICB2YXIgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnLCBbJ2Z1bmN0aW9uYWxfZGlzcGxheScsICdmdW5jdGlvbmFsX2RlZmluaXRpb24nXSk7XG4gIHZhciByZXN1bHQgPSBldmFsQ29kZShjb2RlKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0RHJhd2FibGVGcm9tQmxvY2soYmxvY2spIHtcbiAgdmFyIGRlZmluaXRpb25Db2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcsIFsnZnVuY3Rpb25hbF9kZWZpbml0aW9uJ10pO1xuICB2YXIgYmxvY2tDb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tzVG9Db2RlKCdKYXZhU2NyaXB0JywgW2Jsb2NrXSk7XG4gIHZhciBsaW5lcyA9IGJsb2NrQ29kZS5zcGxpdCgnXFxuJyk7XG4gIHZhciBsYXN0TGluZSA9IGxpbmVzLnNsaWNlKC0xKVswXTtcbiAgdmFyIGxhc3RMaW5lV2l0aERpc3BsYXkgPSBcIkV2YWwuZGlzcGxheShcIiArIGxhc3RMaW5lICsgXCIpO1wiO1xuICB2YXIgYmxvY2tDb2RlRGlzcGxheWVkID0gbGluZXMuc2xpY2UoMCwgLTEpLmpvaW4oJ1xcbicpICsgbGFzdExpbmVXaXRoRGlzcGxheTtcbiAgdmFyIHJlc3VsdCA9IGV2YWxDb2RlKGRlZmluaXRpb25Db2RlICsgJzsgJyArIGJsb2NrQ29kZURpc3BsYXllZCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgZHJhd2FibGUgRXZhbEltYWdlIGZyb20gdGhlIGJsb2NrcyBpbiB0aGUgd29ya3NwYWNlLiBJZiBibG9ja1htbFxuICogaXMgcHJvdmlkZWQsIHRlbXBvcmFyaWx5IHN0aWNrcyB0aG9zZSBibG9ja3MgaW50byB0aGUgd29ya3NwYWNlIHRvIGdlbmVyYXRlXG4gKiB0aGUgZXZhbEltYWdlLCB0aGVuIGRlbGV0ZXMgYmxvY2tzLlxuICogQHJldHVybiB7RXZhbEltYWdlfEN1c3RvbUV2YWxFcnJvcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RHJhd2FibGVGcm9tQmxvY2tYbWwoYmxvY2tYbWwpIHtcbiAgaWYgKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZ2V0RHJhd2FibGVGcm9tQmxvY2tzIHNob3VsZG4ndCBiZSBjYWxsZWQgd2l0aCBibG9ja3MgaWYgXCIgK1xuICAgICAgXCJ3ZSBhbHJlYWR5IGhhdmUgYmxvY2tzIGluIHRoZSB3b3Jrc3BhY2VcIik7XG4gIH1cbiAgLy8gVGVtcG9yYXJpbHkgcHV0IHRoZSBibG9ja3MgaW50byB0aGUgd29ya3NwYWNlIHNvIHRoYXQgd2UgY2FuIGdlbmVyYXRlIGNvZGVcbiAgc3R1ZGlvQXBwLmxvYWRCbG9ja3MoYmxvY2tYbWwpO1xuXG4gIHZhciByZXN1bHQgPSBnZXREcmF3YWJsZUZyb21CbG9ja3NwYWNlKCk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBibG9ja3NcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7IGIuZGlzcG9zZSgpOyB9KTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHBhcnNlIGFuIEV2YWxPYmplY3QgbG9va2luZyBmb3IgRXZhbFRleHQgb2JqZWN0cy4gRm9yIGVhY2ggb25lLFxuICogZXh0cmFjdCB0aGUgdGV4dCBjb250ZW50LlxuICovXG5FdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8gPSBmdW5jdGlvbiAoZXZhbE9iamVjdCkge1xuICBpZiAoIWV2YWxPYmplY3QpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgc3RycyA9IFtdO1xuICBpZiAoZXZhbE9iamVjdCBpbnN0YW5jZW9mIEV2YWxUZXh0KSB7XG4gICAgc3Rycy5wdXNoKGV2YWxPYmplY3QuZ2V0VGV4dCgpKTtcbiAgfVxuXG4gIGV2YWxPYmplY3QuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHN0cnMgPSBzdHJzLmNvbmNhdChFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8oY2hpbGQpKTtcbiAgfSk7XG4gIHJldHVybiBzdHJzO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHR3byBldmFsIG9iamVjdHMgaGF2ZSBzZXRzIG9mIHRleHQgc3RyaW5ncyB0aGF0IGRpZmZlclxuICogICBvbmx5IGluIGNhc2VcbiAqL1xuRXZhbC5oYXZlQ2FzZU1pc21hdGNoXyA9IGZ1bmN0aW9uIChvYmplY3QxLCBvYmplY3QyKSB7XG4gIHZhciBzdHJzMSA9IEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhvYmplY3QxKTtcbiAgdmFyIHN0cnMyID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDIpO1xuXG4gIGlmIChzdHJzMS5sZW5ndGggIT09IHN0cnMyLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0cnMxLnNvcnQoKTtcbiAgc3RyczIuc29ydCgpO1xuXG4gIHZhciBjYXNlTWlzbWF0Y2ggPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cnMxLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHN0cjEgPSBzdHJzMVtpXTtcbiAgICB2YXIgc3RyMiA9IHN0cnMyW2ldO1xuICAgIGlmIChzdHIxICE9PSBzdHIyKSB7XG4gICAgICBpZiAoc3RyMS50b0xvd2VyQ2FzZSgpID09PSBzdHIyLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZU1pc21hdGNoICA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHN0cmluZ3MgZGlmZmVyIGJ5IG1vcmUgdGhhbiBjYXNlXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjYXNlTWlzbWF0Y2g7XG59O1xuXG4vKipcbiAqIE5vdGU6IGlzIHVuYWJsZSB0byBkaXN0aW5ndWlzaCBmcm9tIHRydWUvZmFsc2UgZ2VuZXJhdGVkIGZyb20gc3RyaW5nIGJsb2Nrc1xuICogICB2cy4gZnJvbSBib29sZWFuIGJsb2Nrc1xuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdHdvIGV2YWwgb2JqZWN0cyBhcmUgYm90aCBib29sZWFucywgYnV0IGhhdmUgZGlmZmVyZW50IHZhbHVlcy5cbiAqL1xuRXZhbC5oYXZlQm9vbGVhbk1pc21hdGNoXyA9IGZ1bmN0aW9uIChvYmplY3QxLCBvYmplY3QyKSB7XG4gIHZhciBzdHJzMSA9IEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhvYmplY3QxKTtcbiAgdmFyIHN0cnMyID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDIpO1xuXG4gIGlmIChzdHJzMS5sZW5ndGggIT09IDEgfHwgc3RyczIubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHRleHQxID0gc3RyczFbMF07XG4gIHZhciB0ZXh0MiA9IHN0cnMyWzBdO1xuXG4gIGlmICgodGV4dDEgPT09IFwidHJ1ZVwiICYmIHRleHQyID09PSBcImZhbHNlXCIpIHx8XG4gICAgICAodGV4dDEgPT09IFwiZmFsc2VcIiAmJiB0ZXh0MiA9PT0gXCJ0cnVlXCIpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuRXZhbC5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIEV2YWwucmVzdWx0ID0gUmVzdWx0VHlwZS5VTlNFVDtcbiAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgRXZhbC5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIGlmIChzdHVkaW9BcHAuaGFzVW5maWxsZWRGdW5jdGlvbmFsQmxvY2soKSkge1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OQUxfQkxPQ0s7XG4gICAgRXZhbC5tZXNzYWdlID0gc3R1ZGlvQXBwLmdldFVuZmlsbGVkRnVuY3Rpb25hbEJsb2NrRXJyb3IoJ2Z1bmN0aW9uYWxfZGlzcGxheScpO1xuICB9IGVsc2UgaWYgKHN0dWRpb0FwcC5oYXNRdWVzdGlvbk1hcmtzSW5OdW1iZXJGaWVsZCgpKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuUVVFU1RJT05fTUFSS1NfSU5fTlVNQkVSX0ZJRUxEO1xuICB9IGVsc2UgaWYgKHN0dWRpb0FwcC5oYXNFbXB0eUZ1bmN0aW9uT3JWYXJpYWJsZU5hbWUoKSkge1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVNUFRZX0ZVTkNUSU9OX05BTUU7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLnVubmFtZWRGdW5jdGlvbigpO1xuICB9IGVsc2Uge1xuICAgIGNsZWFyVGVzdENhbnZhc2VzKCk7XG4gICAgcmVzZXRFeGFtcGxlRGlzcGxheSgpO1xuICAgIHZhciB1c2VyT2JqZWN0ID0gZ2V0RHJhd2FibGVGcm9tQmxvY2tzcGFjZSgpO1xuICAgIGlmICh1c2VyT2JqZWN0ICYmIHVzZXJPYmplY3QuZHJhdykge1xuICAgICAgdXNlck9iamVjdC5kcmF3KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlclwiKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ290IGEgQ3VzdG9tRXZhbEVycm9yLCBzZXQgZXJyb3IgbWVzc2FnZSBhcHByb3ByaWF0ZWx5LlxuICAgIGlmICh1c2VyT2JqZWN0IGluc3RhbmNlb2YgQ3VzdG9tRXZhbEVycm9yKSB7XG4gICAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgRXZhbC5tZXNzYWdlID0gdXNlck9iamVjdC5mZWVkYmFja01lc3NhZ2U7XG4gICAgfSBlbHNlIGlmIChFdmFsLmhhdmVDYXNlTWlzbWF0Y2hfKHVzZXJPYmplY3QsIEV2YWwuYW5zd2VyT2JqZWN0KSkge1xuICAgICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIEV2YWwubWVzc2FnZSA9IGV2YWxNc2cuc3RyaW5nTWlzbWF0Y2hFcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoRXZhbC5oYXZlQm9vbGVhbk1pc21hdGNoXyh1c2VyT2JqZWN0LCBFdmFsLmFuc3dlck9iamVjdCkpIHtcbiAgICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICBFdmFsLm1lc3NhZ2UgPSBldmFsTXNnLndyb25nQm9vbGVhbkVycm9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIEV2YWwuY2hlY2tFeGFtcGxlc18oKTtcblxuICAgICAgLy8gSGF2ZW4ndCBydW4gaW50byBhbnkgZXJyb3JzLiBEbyBvdXIgYWN0dWFsIGNvbXBhcmlzb25cbiAgICAgIGlmIChFdmFsLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5VTlNFVCkge1xuICAgICAgICBFdmFsLnJlc3VsdCA9IGNhbnZhc2VzTWF0Y2goJ3VzZXInLCAnYW5zd2VyJyk7XG4gICAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMoRXZhbC5yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICAgICAgRXZhbC5yZXN1bHQgPSB0cnVlO1xuICAgICAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gIHZhciB0ZXh0QmxvY2tzID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAnZXZhbCcsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBFdmFsLnJlc3VsdCxcbiAgICB0ZXN0UmVzdWx0OiBFdmFsLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0QmxvY2tzKSxcbiAgICBvbkNvbXBsZXRlOiBvblJlcG9ydENvbXBsZXRlLFxuICAgIGltYWdlOiBFdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlXG4gIH07XG5cbiAgLy8gZG9uJ3QgdHJ5IGl0IGlmIGZ1bmN0aW9uIGlzIG5vdCBkZWZpbmVkLCB3aGljaCBzaG91bGQgcHJvYmFibHkgb25seSBiZVxuICAvLyB0cnVlIGluIG91ciB0ZXN0IGVudmlyb25tZW50XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0V2YWwnKS50b0RhdGFVUkwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3R1ZGlvQXBwLnJlcG9ydChyZXBvcnREYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRXZhbCcpLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiLCB7XG4gICAgICBjYWxsYmFjazogZnVuY3Rpb24ocG5nRGF0YVVybCkge1xuICAgICAgICBFdmFsLmZlZWRiYWNrSW1hZ2UgPSBwbmdEYXRhVXJsO1xuICAgICAgICBFdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlID0gZW5jb2RlVVJJQ29tcG9uZW50KEV2YWwuZmVlZGJhY2tJbWFnZS5zcGxpdCgnLCcpWzFdKTtcblxuICAgICAgICBzdHVkaW9BcHAucmVwb3J0KHJlcG9ydERhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhFdmFsLnJlc3VsdCA/ICd3aW4nIDogJ2ZhaWx1cmUnKTtcbn07XG5cbkV2YWwuY2hlY2tFeGFtcGxlc18gPSBmdW5jdGlvbiAocmVzZXRQbGF5c3BhY2UpIHtcbiAgaWYgKCFsZXZlbC5leGFtcGxlc1JlcXVpcmVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGV4YW1wbGVsZXNzID0gc3R1ZGlvQXBwLmdldEZ1bmN0aW9uV2l0aG91dFR3b0V4YW1wbGVzKCk7XG4gIGlmIChleGFtcGxlbGVzcykge1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuICAgIEV2YWwubWVzc2FnZSA9IGNvbW1vbk1zZy5lbXB0eUV4YW1wbGVCbG9ja0Vycm9yTXNnKHtmdW5jdGlvbk5hbWU6IGV4YW1wbGVsZXNzfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHVuZmlsbGVkID0gc3R1ZGlvQXBwLmdldFVuZmlsbGVkRnVuY3Rpb25hbEV4YW1wbGUoKTtcbiAgaWYgKHVuZmlsbGVkKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG5cbiAgICB2YXIgbmFtZSA9IHVuZmlsbGVkLmdldFJvb3RCbG9jaygpLmdldElucHV0VGFyZ2V0QmxvY2soJ0FDVFVBTCcpXG4gICAgICAuZ2V0VGl0bGVWYWx1ZSgnTkFNRScpO1xuICAgIEV2YWwubWVzc2FnZSA9IGNvbW1vbk1zZy5lbXB0eUV4YW1wbGVCbG9ja0Vycm9yTXNnKHtmdW5jdGlvbk5hbWU6IG5hbWV9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmFpbGluZ0Jsb2NrTmFtZSA9IHN0dWRpb0FwcC5jaGVja0ZvckZhaWxpbmdFeGFtcGxlcyhnZXRFdmFsRXhhbXBsZUZhaWx1cmUpO1xuICBpZiAoZmFpbGluZ0Jsb2NrTmFtZSkge1xuICAgIC8vIENsZWFyIHVzZXIgY2FudmFzLCBhcyB0aGlzIGlzIG1lYW50IHRvIGJlIGEgcHJlLWV4ZWN1dGlvbiBmYWlsdXJlXG4gICAgRXZhbC5jbGVhckNhbnZhc1dpdGhJRCgndXNlcicpO1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuICAgIEV2YWwubWVzc2FnZSA9IGNvbW1vbk1zZy5leGFtcGxlRXJyb3JNZXNzYWdlKHtmdW5jdGlvbk5hbWU6IGZhaWxpbmdCbG9ja05hbWV9KTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGluZyBvdXRlckhUTUwgb24gc3ZnIGVsZW1lbnRzIGluIHNhZmFyaSBkb2VzIG5vdCB3b3JrLiBJbnN0ZWFkIHdlIHN0aWNrXG4gKiBpdCBpbnNpZGUgYSBkaXYgYW5kIGdldCB0aGF0IGRpdidzIGlubmVyIGh0bWwuXG4gKi9cbmZ1bmN0aW9uIG91dGVySFRNTCAoZWxlbWVudCkge1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5hcHBlbmRDaGlsZChlbGVtZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gIHJldHVybiBkaXYuaW5uZXJIVE1MO1xufVxuXG5mdW5jdGlvbiBpbWFnZURhdGFGb3JTdmcoZWxlbWVudElkKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLndpZHRoID0gRXZhbC5DQU5WQVNfV0lEVEg7XG4gIGNhbnZhcy5oZWlnaHQgPSBFdmFsLkNBTlZBU19IRUlHSFQ7XG4gIGNhbnZnKGNhbnZhcywgb3V0ZXJIVE1MKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCkpKTtcblxuICAvLyBjYW52ZyBhdHRhY2hlcyBhbiBzdmcgb2JqZWN0IHRvIHRoZSBjYW52YXMsIGFuZCBhdHRhY2hlcyBhIHNldEludGVydmFsLlxuICAvLyBXZSBkb24ndCBuZWVkIHRoaXMsIGFuZCB0aGF0IGJsb2NrcyBvdXIgbm9kZSBwcm9jZXNzIGZyb20gZXhpdHRpbmcgaW5cbiAgLy8gdGVzdHMsIHNvIHN0b3AgaXQuXG4gIGNhbnZhcy5zdmcuc3RvcCgpO1xuXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgcmV0dXJuIGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgRXZhbC5DQU5WQVNfV0lEVEgsIEV2YWwuQ0FOVkFTX0hFSUdIVCk7XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGNvbnRlbnRzIG9mIHR3byBTVkcgZWxlbWVudHMgYnkgaWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBjYW52YXNBIElEIG9mIGNhbnZhc1xuICogQHBhcmFtIHtzdHJpbmd9IGNhbnZhc0IgSUQgb2YgY2FudmFzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gY2FudmFzZXNNYXRjaChjYW52YXNBLCBjYW52YXNCKSB7XG4gIC8vIENvbXBhcmUgdGhlIHNvbHV0aW9uIGFuZCB1c2VyIGNhbnZhc1xuICB2YXIgaW1hZ2VEYXRhQSA9IGltYWdlRGF0YUZvclN2ZyhjYW52YXNBKTtcbiAgdmFyIGltYWdlRGF0YUIgPSBpbWFnZURhdGFGb3JTdmcoY2FudmFzQik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZURhdGFBLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoMCAhPT0gTWF0aC5hYnMoaW1hZ2VEYXRhQS5kYXRhW2ldIC0gaW1hZ2VEYXRhQi5kYXRhW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbnZhciBkaXNwbGF5RmVlZGJhY2sgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICBpZiAoRXZhbC5yZXN1bHQgPT09IFJlc3VsdFR5cGUuVU5TRVQpIHtcbiAgICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgd2UgaGl0IHJlc2V0IGJlZm9yZSBvdXIgZGlhbG9nIHBvcHBlZCB1cC5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBvdmVycmlkZSBleHRyYSB0b3AgYmxvY2tzIG1lc3NhZ2VcbiAgbGV2ZWwuZXh0cmFUb3BCbG9ja3MgPSBldmFsTXNnLmV4dHJhVG9wQmxvY2tzKCk7XG5cbiAgdmFyIHRyeUFnYWluVGV4dDtcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdHJ5QWdhaW5UZXh0ID0gY29tbW9uTXNnLmtlZXBQbGF5aW5nKCk7XG4gIH1cblxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBhcHA6ICdldmFsJyxcbiAgICBza2luOiBza2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogRXZhbC50ZXN0UmVzdWx0cyxcbiAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIHRyeUFnYWluVGV4dDogdHJ5QWdhaW5UZXh0LFxuICAgIGNvbnRpbnVlVGV4dDogbGV2ZWwuZnJlZVBsYXkgPyBjb21tb25Nc2cubmV4dFB1enpsZSgpIDogdW5kZWZpbmVkLFxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5KSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5XG4gICAgc2F2ZVRvR2FsbGVyeVVybDogbGV2ZWwuZnJlZVBsYXkgJiYgRXZhbC5yZXNwb25zZSAmJiBFdmFsLnJlc3BvbnNlLnNhdmVfdG9fZ2FsbGVyeV91cmwsXG4gICAgZmVlZGJhY2tJbWFnZTogRXZhbC5mZWVkYmFja0ltYWdlLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IGV2YWxNc2cucmVpbmZGZWVkYmFja01zZyh7YmFja0J1dHRvbjogdHJ5QWdhaW5UZXh0fSlcbiAgICB9XG4gIH07XG4gIGlmIChFdmFsLm1lc3NhZ2UgJiYgIWxldmVsLmVkaXRfYmxvY2tzKSB7XG4gICAgb3B0aW9ucy5tZXNzYWdlID0gRXZhbC5tZXNzYWdlO1xuICB9XG4gIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5mdW5jdGlvbiBvblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKSB7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8vIEFkZCBhIHNob3J0IGRlbGF5IHNvIHRoYXQgdXNlciBnZXRzIHRvIHNlZSB0aGVpciBmaW5pc2hlZCBkcmF3aW5nLlxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBkaXNwbGF5RmVlZGJhY2socmVzcG9uc2UpO1xuICB9LCAyMDAwKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnRXZhbFwiPlxcbiAgPGltYWdlIGlkPVwiYmFja2dyb3VuZFwiIHZpc2liaWxpdHk9XCJoaWRkZW5cIiBoZWlnaHQ9XCI0MDBcIiB3aWR0aD1cIjQwMFwiIHg9XCIwXCIgeT1cIjBcIiA+PC9pbWFnZT5cXG4gIDxnIGlkPVwiYW5zd2VyXCI+XFxuICA8L2c+XFxuICA8ZyBpZD1cInVzZXJcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwidGVzdC1jYWxsXCI+XFxuICA8L2c+XFxuICA8ZyBpZD1cInRlc3QtcmVzdWx0XCI+XFxuICA8L2c+XFxuPC9zdmc+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgbGV2ZWwtc3BlY2lmaWMgcmVxdWlyZW1lbnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2V2YWwxJzoge1xuICAgIHNvbHV0aW9uQmxvY2tzOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdGFyJywge1xuICAgICAgJ0NPTE9SJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdncmVlbicgfSApLFxuICAgICAgJ1NUWUxFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdzb2xpZCcgfSksXG4gICAgICAnU0laRSc6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJywgbnVsbCwgeyBOVU06IDIwMCB9IClcbiAgICB9KSxcbiAgICBpZGVhbDogSW5maW5pdHksXG4gICAgdG9vbGJveDogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9wbHVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9taW51cycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfdGltZXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2RpdmlkZWRieScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3N0cmluZycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3R5bGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2NpcmNsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfdHJpYW5nbGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3NxdWFyZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfcmVjdGFuZ2xlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9lbGxpcHNlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zdGFyJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9yYWRpYWxfc3RhcicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfcG9seWdvbicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3BsYWNlX2ltYWdlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnb2Zmc2V0JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnb3ZlcmxheScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3VuZGVybGF5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgncm90YXRlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc2NhbGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3RleHQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzdHJpbmdfYXBwZW5kJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc3RyaW5nX2xlbmd0aCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfZ3JlYXRlcl90aGFuJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9sZXNzX3RoYW4nKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX251bWJlcl9lcXVhbHMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3N0cmluZ19lcXVhbHMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xvZ2ljYWxfYW5kJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9sb2dpY2FsX29yJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9sb2dpY2FsX25vdCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfYm9vbGVhbicpXG4gICAgKSxcbiAgICBzdGFydEJsb2NrczogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RhcicsIHtcbiAgICAgICdDT0xPUic6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0cmluZycsIG51bGwsIHsgVkFMOiAnYmxhY2snIH0gKSxcbiAgICAgICdTVFlMRSc6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0cmluZycsIG51bGwsIHsgVkFMOiAnc29saWQnIH0pLFxuICAgICAgJ1NJWkUnOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9tYXRoX251bWJlcicsIG51bGwsIHsgTlVNOiAyMDAgfSApXG4gICAgfSksXG4gICAgcmVxdWlyZWRCbG9ja3M6ICcnLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9LFxuXG4gICdjdXN0b20nOiB7XG4gICAgYW5zd2VyOiAnJyxcbiAgICBpZGVhbDogSW5maW5pdHksXG4gICAgdG9vbGJveDogJycsXG4gICAgc3RhcnRCbG9ja3M6ICcnLFxuICAgIHJlcXVpcmVkQmxvY2tzOiAnJyxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcbiAgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG4gIHZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbjsgYnVmLnB1c2goJ1xcblxcbjxidXR0b24gaWQ9XCJjb250aW51ZUJ1dHRvblwiIGNsYXNzPVwibGF1bmNoIGhpZGUgZmxvYXQtcmlnaHRcIj5cXG4gIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg3LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoNywgIGNvbW1vbk1zZy5jb250aW51ZSgpICkpLCAnXFxuPC9idXR0b24+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IEV2YWwgR3JhcGhpY3NcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBFdmFsIEdyYXBoaWNzLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xudmFyIHNoYXJlZEZ1bmN0aW9uYWxCbG9ja3MgPSByZXF1aXJlKCcuLi9zaGFyZWRGdW5jdGlvbmFsQmxvY2tzJyk7XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcblxuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICB2YXIgZ2Vuc3ltID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBOQU1FX1RZUEUgPSBibG9ja2x5LlZhcmlhYmxlcy5OQU1FX1RZUEU7XG4gICAgcmV0dXJuIGdlbmVyYXRvci52YXJpYWJsZURCXy5nZXREaXN0aW5jdE5hbWUobmFtZSwgTkFNRV9UWVBFKTtcbiAgfTtcblxuICBzaGFyZWRGdW5jdGlvbmFsQmxvY2tzLmluc3RhbGwoYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX2Rpc3BsYXknLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5kaXNwbGF5QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdkaXNwbGF5JyxcbiAgICByZXR1cm5UeXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5PTkUsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnQVJHMScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTk9ORSB9LFxuICAgIF1cbiAgfSk7XG5cbiAgLy8gc2hhcGVzXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX2NpcmNsZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLmNpcmNsZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnY2lyY2xlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfdHJpYW5nbGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy50cmlhbmdsZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAndHJpYW5nbGUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9zcXVhcmUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zcXVhcmVCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3NxdWFyZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3JlY3RhbmdsZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnJlY3RhbmdsZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncmVjdGFuZ2xlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdXSURUSCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdIRUlHSFQnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9lbGxpcHNlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuZWxsaXBzZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnZWxsaXBzZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnV0lEVEgnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSEVJR0hUJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfc3RhcicsXG4gICAgYmxvY2tUaXRsZTogbXNnLnN0YXJCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3N0YXInLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9yYWRpYWxfc3RhcicsXG4gICAgYmxvY2tUaXRsZTogbXNnLnJhZGlhbFN0YXJCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3JhZGlhbFN0YXInLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1BPSU5UUycsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdJTk5FUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdPVVRFUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3BvbHlnb24nLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5wb2x5Z29uQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdwb2x5Z29uJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSURFUycsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdMRU5HVEgnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF90ZXh0JyxcbiAgICBibG9ja1RpdGxlOiBtc2cudGV4dEJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAndGV4dCcsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnVEVYVCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gaW1hZ2UgbWFuaXB1bGF0aW9uXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdvdmVybGF5JyxcbiAgICBibG9ja1RpdGxlOiBtc2cub3ZlcmxheUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnb3ZlcmxheScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnVE9QJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9LFxuICAgICAgeyBuYW1lOiAnQk9UVE9NJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9LFxuICAgIF0sXG4gICAgdmVydGljYWxseVN0YWNrSW5wdXRzOiB0cnVlXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICd1bmRlcmxheScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnVuZGVybGF5QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICd1bmRlcmxheScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnQk9UVE9NJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9LFxuICAgICAgeyBuYW1lOiAnVE9QJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXSxcbiAgICB2ZXJ0aWNhbGx5U3RhY2tJbnB1dHM6IHRydWVcbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3BsYWNlX2ltYWdlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucGxhY2VJbWFnZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncGxhY2VJbWFnZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnWCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdZJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnb2Zmc2V0JyxcbiAgICBibG9ja1RpdGxlOiBtc2cub2Zmc2V0QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdvZmZzZXQnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1gnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnWScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdJTUFHRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3JvdGF0ZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnJvdGF0ZUltYWdlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdyb3RhdGVJbWFnZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnREVHUkVFUycsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdJTUFHRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3NjYWxlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc2NhbGVJbWFnZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc2NhbGVJbWFnZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnRkFDVE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICAvLyBzdHJpbmcgbWFuaXB1bGF0aW9uXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdzdHJpbmdfYXBwZW5kJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3RyaW5nQXBwZW5kQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzdHJpbmdBcHBlbmQnLFxuICAgIHJldHVyblR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ0ZJUlNUJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ1NFQ09ORCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIC8vIHBvbGxpbmcgZm9yIHZhbHVlc1xuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnc3RyaW5nX2xlbmd0aCcsXG4gICAgYmxvY2tUaXRsZTogbXNnLnN0cmluZ0xlbmd0aEJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3RyaW5nTGVuZ3RoJyxcbiAgICByZXR1cm5UeXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUixcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTVFInLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBibG9ja2x5LkZ1bmN0aW9uYWxCbG9ja1V0aWxzLmluc3RhbGxTdHJpbmdQaWNrZXIoYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9zdHlsZScsXG4gICAgdmFsdWVzOiBbXG4gICAgICBbbXNnLnNvbGlkKCksICdzb2xpZCddLFxuICAgICAgWyc3NSUnLCAnNzUlJ10sXG4gICAgICBbJzUwJScsICc1MCUnXSxcbiAgICAgIFsnMjUlJywgJzI1JSddLFxuICAgICAgW21zZy5vdXRsaW5lKCksICdvdXRsaW5lJ11cbiAgICBdXG4gIH0pO1xufTtcblxuXG5mdW5jdGlvbiBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCBvcHRpb25zKSB7XG4gIHZhciBibG9ja05hbWUgPSBvcHRpb25zLmJsb2NrTmFtZTtcbiAgdmFyIGJsb2NrVGl0bGUgPSBvcHRpb25zLmJsb2NrVGl0bGU7XG4gIHZhciBhcGlOYW1lID0gb3B0aW9ucy5hcGlOYW1lO1xuICB2YXIgYXJncyA9IG9wdGlvbnMuYXJncztcbiAgdmFyIHJldHVyblR5cGUgPSBvcHRpb25zLnJldHVyblR5cGUgfHwgYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRTtcblxuICBibG9ja2x5LkJsb2Nrc1tibG9ja05hbWVdID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGJsb2NrbHkuRnVuY3Rpb25hbEJsb2NrVXRpbHMuaW5pdFRpdGxlZEZ1bmN0aW9uYWxCbG9jayh0aGlzLCBibG9ja1RpdGxlLCByZXR1cm5UeXBlLCBhcmdzLCB7XG4gICAgICAgIHZlcnRpY2FsbHlTdGFja0lucHV0czogb3B0aW9ucy52ZXJ0aWNhbGx5U3RhY2tJbnB1dHNcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3JbYmxvY2tOYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcGlBcmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXJnID0gYXJnc1tpXTtcbiAgICAgIHZhciBhcGlBcmcgPSBCbG9ja2x5LkphdmFTY3JpcHQuc3RhdGVtZW50VG9Db2RlKHRoaXMsIGFyZy5uYW1lLCBmYWxzZSk7XG4gICAgICAvLyBQcm92aWRlIGRlZmF1bHRzXG4gICAgICBpZiAoIWFwaUFyZykge1xuICAgICAgICBpZiAoYXJnLnR5cGUgPT09IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKSB7XG4gICAgICAgICAgYXBpQXJnID0gJzAnO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZy5uYW1lID09PSAnU1RZTEUnKSB7XG4gICAgICAgICAgYXBpQXJnID0gYmxvY2tseS5KYXZhU2NyaXB0LnF1b3RlXygnc29saWQnKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmcubmFtZSA9PT0gJ0NPTE9SJykge1xuICAgICAgICAgIGFwaUFyZyA9IGJsb2NrbHkuSmF2YVNjcmlwdC5xdW90ZV8oJ2JsYWNrJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFwaUFyZ3MucHVzaChhcGlBcmcpO1xuICAgIH1cblxuICAgIHJldHVybiBcIkV2YWwuXCIgKyBhcGlOYW1lICsgXCIoXCIgKyBhcGlBcmdzLmpvaW4oXCIsIFwiKSArIFwiKVwiO1xuICB9O1xufVxuIiwidmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG52YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBFdmFsVGV4dCA9IHJlcXVpcmUoJy4vZXZhbFRleHQnKTtcbnZhciBFdmFsQ2lyY2xlID0gcmVxdWlyZSgnLi9ldmFsQ2lyY2xlJyk7XG52YXIgRXZhbFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9ldmFsVHJpYW5nbGUnKTtcbnZhciBFdmFsTXVsdGkgPSByZXF1aXJlKCcuL2V2YWxNdWx0aScpO1xudmFyIEV2YWxSZWN0ID0gcmVxdWlyZSgnLi9ldmFsUmVjdCcpO1xudmFyIEV2YWxFbGxpcHNlID0gcmVxdWlyZSgnLi9ldmFsRWxsaXBzZScpO1xudmFyIEV2YWxUZXh0ID0gcmVxdWlyZSgnLi9ldmFsVGV4dCcpO1xudmFyIEV2YWxTdGFyID0gcmVxdWlyZSgnLi9ldmFsU3RhcicpO1xudmFyIEV2YWxQb2x5Z29uID0gcmVxdWlyZSgnLi9ldmFsUG9seWdvbicpO1xuXG4vLyBXZSBkb24ndCB1c2UgYmxvY2tJZCBhdCBhbGwgaW4gRXZhbCBzaW5jZSBldmVyeXRoaW5nIGlzIGV2YWx1YXRlZCBhdCBvbmNlLlxuXG5leHBvcnRzLmRpc3BsYXkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT09IHVuZGVmaW5lZCkge1xuICAgIG9iamVjdCA9IFwiXCI7XG4gIH1cblxuICAvLyBjYWxsIHRvbG9jYWxlU3RyaW5nIG9uIG51bWJlcnMgc28gdGhhdCB3ZSBnZXQgY29tbWFzIGZvciBsYXJnZSBudW1iZXJzXG4gIGlmICh0eXBlb2Yob2JqZWN0KSA9PT0gJ251bWJlcicgJiYgb2JqZWN0LnRvTG9jYWxlU3RyaW5nKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0LnRvTG9jYWxlU3RyaW5nKCk7XG4gIH1cblxuICBpZiAoIW9iamVjdC5kcmF3KSB7XG4gICAgb2JqZWN0ID0gbmV3IEV2YWxUZXh0KG9iamVjdC50b1N0cmluZygpLCAxMiwgJ2JsYWNrJyk7XG4gIH1cbiAgRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBvYmplY3Q7XG59O1xuXG5leHBvcnRzLmNpcmNsZSA9IGZ1bmN0aW9uIChzaXplLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsQ2lyY2xlKHNpemUsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnRyaWFuZ2xlID0gZnVuY3Rpb24gKHNpemUsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxUcmlhbmdsZShzaXplLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5vdmVybGF5ID0gZnVuY3Rpb24gKHRvcCwgYm90dG9tKSB7XG4gIHJldHVybiBuZXcgRXZhbE11bHRpKHRvcCwgYm90dG9tKTtcbn07XG5cbmV4cG9ydHMudW5kZXJsYXkgPSBmdW5jdGlvbiAoYm90dG9tLCB0b3ApIHtcbiAgcmV0dXJuIG5ldyBFdmFsTXVsdGkodG9wLCBib3R0b20pO1xufTtcblxuZXhwb3J0cy5zcXVhcmUgPSBmdW5jdGlvbiAoc2l6ZSwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFJlY3Qoc2l6ZSwgc2l6ZSwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMucmVjdGFuZ2xlID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxSZWN0KHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLmVsbGlwc2UgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbEVsbGlwc2Uod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMudGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCBmb250U2l6ZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsVGV4dCh0ZXh0LCBmb250U2l6ZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5zdGFyID0gZnVuY3Rpb24gKHJhZGl1cywgc3R5bGUsIGNvbG9yKSB7XG4gIHZhciBpbm5lclJhZGl1cyA9ICgzIC0gTWF0aC5zcXJ0KDUpKSAvIDIgKiByYWRpdXM7XG4gIHJldHVybiBuZXcgRXZhbFN0YXIoNSwgaW5uZXJSYWRpdXMsIHJhZGl1cywgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMucmFkaWFsU3RhciA9IGZ1bmN0aW9uIChwb2ludHMsIGlubmVyLCBvdXRlciwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFN0YXIocG9pbnRzLCBpbm5lciwgb3V0ZXIsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnBvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzLCBsZW5ndGgsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxQb2x5Z29uKHBvaW50cywgbGVuZ3RoLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5wbGFjZUltYWdlID0gZnVuY3Rpb24gKHgsIHksIGltYWdlKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoeCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoeSk7XG4gIGV2YWxVdGlscy5lbnN1cmVUeXBlKGltYWdlLCBFdmFsSW1hZ2UpO1xuXG4gIC8vIG9yaWdpbiBhdCBjZW50ZXJcbiAgeCA9IHggKyBFdmFsLkNBTlZBU19XSURUSCAvIDI7XG4gIHkgPSB5ICsgRXZhbC5DQU5WQVNfSEVJR0hUIC8gMjtcblxuICAvLyBVc2VyIGlucHV0cyB5IGluIGNhcnRlc2lhbiBzcGFjZS4gQ29udmVydCB0byBwaXhlbCBzcGFjZSBiZWZvcmUgc2VuZGluZ1xuICAvLyB0byBvdXIgRXZhbEltYWdlLlxuICB5ID0gZXZhbFV0aWxzLmNhcnRlc2lhblRvUGl4ZWwoeSk7XG5cbiAgLy8gcmVsYXRpdmUgdG8gY2VudGVyIG9mIHdvcmtzcGFjZVxuICBpbWFnZS5wbGFjZSh4LCB5KTtcbiAgcmV0dXJuIGltYWdlO1xufTtcblxuZXhwb3J0cy5vZmZzZXQgPSBmdW5jdGlvbiAoeCwgeSwgaW1hZ2UpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih4KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih5KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UsIEV2YWxJbWFnZSk7XG5cbiAgeCA9IGltYWdlLnhfICsgeDtcbiAgeSA9IGltYWdlLnlfIC0geTtcblxuICBpbWFnZS5wbGFjZSh4LCB5KTtcbiAgcmV0dXJuIGltYWdlO1xufTtcblxuZXhwb3J0cy5yb3RhdGVJbWFnZSA9IGZ1bmN0aW9uIChkZWdyZWVzLCBpbWFnZSkge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGRlZ3JlZXMpO1xuXG4gIGltYWdlLnJvdGF0ZShkZWdyZWVzKTtcbiAgcmV0dXJuIGltYWdlO1xufTtcblxuZXhwb3J0cy5zY2FsZUltYWdlID0gZnVuY3Rpb24gKGZhY3RvciwgaW1hZ2UpIHtcbiAgaW1hZ2Uuc2NhbGUoZmFjdG9yLCBmYWN0b3IpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLnN0cmluZ0FwcGVuZCA9IGZ1bmN0aW9uIChmaXJzdCwgc2Vjb25kKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHJpbmcoZmlyc3QpO1xuICBldmFsVXRpbHMuZW5zdXJlU3RyaW5nKHNlY29uZCk7XG5cbiAgcmV0dXJuIGZpcnN0ICsgc2Vjb25kO1xufTtcblxuLy8gcG9sbGluZyBmb3IgdmFsdWVzXG5leHBvcnRzLnN0cmluZ0xlbmd0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyhzdHIpO1xuXG4gIHJldHVybiBzdHIubGVuZ3RoO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsVHJpYW5nbGUgPSBmdW5jdGlvbiAoZWRnZSwgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoZWRnZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLmVkZ2VfID0gZWRnZTtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsVHJpYW5nbGUuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbFRyaWFuZ2xlO1xuXG5FdmFsVHJpYW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdwb2x5Z29uJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgLy8gY2VudGVyIGF0IDAsIDAgKGFsbG93aW5nIHRyYW5zZm9ybXMgdG8gbW92ZSBpdCBhcm91bmQpXG4gIC8vIHRoZSBjZW50ZXIgaXMgaGFsZndheSBiZXR3ZWVuIHdpZHRoLCBhbmQgYSB0aGlyZCBvZiB0aGUgd2F5IHVwIHRoZSBoZWlnaHRcbiAgdmFyIGhlaWdodCA9IE1hdGguc3FydCgzKSAvIDIgKiB0aGlzLmVkZ2VfO1xuXG4gIHZhciBib3R0b21MZWZ0ID0ge1xuICAgIHg6IC10aGlzLmVkZ2VfIC8gMixcbiAgICB5OiBoZWlnaHQgLyAzXG4gIH07XG5cbiAgdmFyIGJvdHRvbVJpZ2h0ID0ge1xuICAgIHg6IHRoaXMuZWRnZV8gLyAyLFxuICAgIHk6IGhlaWdodCAvIDNcbiAgfTtcblxuICB2YXIgdG9wID0ge1xuICAgIHg6IDAsXG4gICAgeTogLWhlaWdodCAqIDIgLyAzXG4gIH07XG5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsXG4gICAgYm90dG9tTGVmdC54ICsnLCcgKyBib3R0b21MZWZ0LnkgKyAnICcgK1xuICAgIGJvdHRvbVJpZ2h0LnggKyAnLCcgKyBib3R0b21SaWdodC55ICsgJyAnICtcbiAgICB0b3AueCArICcsJyArIHRvcC55KTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFRleHQgPSBmdW5jdGlvbiAodGV4dCwgZm9udFNpemUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHJpbmcodGV4dCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoZm9udFNpemUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbJ3NvbGlkJywgY29sb3JdKTtcblxuICB0aGlzLnRleHRfID0gdGV4dDtcbiAgdGhpcy5mb250U2l6ZV8gPSBmb250U2l6ZTtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsVGV4dC5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsVGV4dDtcblxuRXZhbFRleHQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICd0ZXh0Jyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG4gIHRoaXMuZWxlbWVudF8udGV4dENvbnRlbnQgPSB0aGlzLnRleHRfO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZm9udC1zaXplOiAnICsgdGhpcy5mb250U2l6ZV8gKyAncHQnKTtcblxuICB2YXIgYmJveCA9IHRoaXMuZWxlbWVudF8uZ2V0QkJveCgpO1xuICAvLyBjZW50ZXIgYXQgb3JpZ2luXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCd4JywgLWJib3gud2lkdGggLyAyKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3knLCAtYmJveC5oZWlnaHQgLyAyKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkV2YWxUZXh0LnByb3RvdHlwZS5nZXRUZXh0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50ZXh0Xztcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFN0YXIgPSBmdW5jdGlvbiAocG9pbnRDb3VudCwgaW5uZXIsIG91dGVyLCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihwb2ludENvdW50KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihpbm5lcik7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIob3V0ZXIpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy5vdXRlcl8gPSBvdXRlcjtcbiAgdGhpcy5pbm5lcl8gPSBpbm5lcjtcbiAgdGhpcy5wb2ludENvdW50XyA9IHBvaW50Q291bnQ7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbFN0YXIuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbFN0YXI7XG5cbkV2YWxTdGFyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncG9seWdvbicpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIHZhciBwb2ludHMgPSBbXTtcbiAgdmFyIG91dGVyUmFkaXVzID0gdGhpcy5vdXRlcl87XG4gIHZhciBpbm5lclJhZGl1cyA9IHRoaXMuaW5uZXJfO1xuXG4gIHZhciBhbmdsZURlbHRhID0gMiAqIE1hdGguUEkgLyB0aGlzLnBvaW50Q291bnRfO1xuICBmb3IgKHZhciBhbmdsZSA9IDA7IGFuZ2xlIDwgMiAqIE1hdGguUEk7IGFuZ2xlICs9IGFuZ2xlRGVsdGEpIHtcbiAgICBwb2ludHMucHVzaChvdXRlclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIFwiLFwiICsgb3V0ZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkpO1xuICAgIHBvaW50cy5wdXNoKGlubmVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGUgKyBhbmdsZURlbHRhIC8gMikgKyBcIixcIiArXG4gICAgICBpbm5lclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlICsgYW5nbGVEZWx0YSAvIDIpKTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdwb2ludHMnLCBwb2ludHMuam9pbignICcpKTtcbiAgaWYgKHRoaXMucG9pbnRDb3VudF8gJSAyID09IDEpIHtcbiAgICB0aGlzLnJvdGF0ZSgtOTAgLyB0aGlzLnBvaW50Q291bnRfKTtcbiAgfVxuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsUmVjdCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih3aWR0aCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoaGVpZ2h0KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMud2lkdGhfID0gd2lkdGg7XG4gIHRoaXMuaGVpZ2h0XyA9IGhlaWdodDtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsUmVjdC5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsUmVjdDtcblxuRXZhbFJlY3QucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgLy8gY2VudGVyIHJlY3QgYXQgMCwgMC4gd2UnbGwgdXNlIHRyYW5zZm9ybXMgdG8gbW92ZSBpdC5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3gnLCAtdGhpcy53aWR0aF8gLyAyKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3knLCAtdGhpcy5oZWlnaHRfIC8gMik7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGhfKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0Xyk7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxQb2x5Z29uID0gZnVuY3Rpb24gKHNpZGVDb3VudCwgbGVuZ3RoLCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihzaWRlQ291bnQpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGxlbmd0aCk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLnJhZGl1c18gPSBsZW5ndGggLyAoMiAqIE1hdGguc2luKE1hdGguUEkgLyBzaWRlQ291bnQpKTtcbiAgdGhpcy5wb2ludENvdW50XyA9IHNpZGVDb3VudDtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsUG9seWdvbi5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsUG9seWdvbjtcblxuRXZhbFBvbHlnb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdwb2x5Z29uJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgdmFyIHBvaW50cyA9IFtdO1xuICB2YXIgcmFkaXVzID0gdGhpcy5yYWRpdXNfO1xuXG4gIHZhciBhbmdsZSA9IDIgKiBNYXRoLlBJIC8gdGhpcy5wb2ludENvdW50XztcbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gdGhpcy5wb2ludENvdW50XzsgaSsrKSB7XG4gICAgcG9pbnRzLnB1c2gocmFkaXVzICogTWF0aC5jb3MoaSAqIGFuZ2xlKSArIFwiLFwiICsgcmFkaXVzICogTWF0aC5zaW4oaSAqIGFuZ2xlKSk7XG4gIH1cblxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgcG9pbnRzLmpvaW4oJyAnKSk7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxNdWx0aSA9IGZ1bmN0aW9uIChpbWFnZTEsIGltYWdlMikge1xuICBldmFsVXRpbHMuZW5zdXJlVHlwZShpbWFnZTEsIEV2YWxJbWFnZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVUeXBlKGltYWdlMiwgRXZhbEltYWdlKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcyk7XG5cbiAgdGhpcy5pbWFnZTFfID0gaW1hZ2UxO1xuICB0aGlzLmltYWdlMl8gPSBpbWFnZTI7XG5cbiAgLy8gd2Ugd2FudCBhbiBvYmplY3QgY2VudGVyZWQgYXQgMCwgMCB0aGF0IHdlIGNhbiB0aGVuIGFwcGx5IHRyYW5zZm9ybXMgdG8uXG4gIC8vIHRvIGFjY29tcGxpc2ggdGhpcywgd2UgbmVlZCB0byBhZGp1c3QgdGhlIGNoaWxkcmVuJ3MgeC95J3MgdG8gYmUgcmVsYXRpdmVcbiAgLy8gdG8gdXNcbiAgdmFyIGRlbHRhWCwgZGVsdGFZO1xuICBkZWx0YVggPSB0aGlzLmltYWdlMV8ueF8gLSB0aGlzLnhfO1xuICBkZWx0YVkgPSB0aGlzLmltYWdlMV8ueV8gLSB0aGlzLnlfO1xuICB0aGlzLmltYWdlMV8udXBkYXRlUG9zaXRpb24oZGVsdGFYLCBkZWx0YVkpO1xuICBkZWx0YVggPSB0aGlzLmltYWdlMl8ueF8gLSB0aGlzLnhfO1xuICBkZWx0YVkgPSB0aGlzLmltYWdlMl8ueV8gLSB0aGlzLnlfO1xuICB0aGlzLmltYWdlMl8udXBkYXRlUG9zaXRpb24oZGVsdGFYLCBkZWx0YVkpO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxNdWx0aS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsTXVsdGk7XG5cbkV2YWxNdWx0aS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdmFyIGRlbHRhWCwgZGVsdGFZO1xuXG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2cnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICB0aGlzLmltYWdlMl8uZHJhdyh0aGlzLmVsZW1lbnRfKTtcbiAgdGhpcy5pbWFnZTFfLmRyYXcodGhpcy5lbGVtZW50Xyk7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLmdldENoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gW3RoaXMuaW1hZ2UxXywgdGhpcy5pbWFnZTJfXTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbENpcmNsZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih3aWR0aCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoaGVpZ2h0KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMud2lkdGhfID0gd2lkdGg7XG4gIHRoaXMuaGVpZ2h0XyA9IGhlaWdodDtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsQ2lyY2xlLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxDaXJjbGU7XG5cbkV2YWxDaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdlbGxpcHNlJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeCcsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnY3knLCAwKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3J4JywgdGhpcy53aWR0aF8gLyAyKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3J5JywgdGhpcy5oZWlnaHRfIC8gMik7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxDaXJjbGUgPSBmdW5jdGlvbiAocmFkaXVzLCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihyYWRpdXMpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy5yYWRpdXNfID0gcmFkaXVzO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxDaXJjbGUuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbENpcmNsZTtcblxuRXZhbENpcmNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2NpcmNsZScpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnY3gnLCAwKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2N5JywgMCk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdyJywgdGhpcy5yYWRpdXNfKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkV2YWxDaXJjbGUucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gTm8tb3AuIFJvdGF0aW5nIHRoZSBjaXJjbGUgc3ZnIGdpdmVzIHVzIHNvbWUgcHJvYmxlbXMgd2hlbiB3ZSBjb252ZXJ0IHRvXG4gIC8vIGEgYml0bWFwLlxufTtcbiIsInZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbEltYWdlID0gZnVuY3Rpb24gKHN0eWxlLCBjb2xvcikge1xuICAvLyB4L3kgbG9jYXRpb24gaW4gcGl4ZWwgc3BhY2Ugb2Ygb2JqZWN0J3MgY2VudGVyXG4gIHRoaXMueF8gPSAyMDA7XG4gIHRoaXMueV8gPSAyMDA7XG5cbiAgdGhpcy5yb3RhdGlvbl8gPSAwO1xuICB0aGlzLnNjYWxlWF8gPSAxLjA7XG4gIHRoaXMuc2NhbGVZID0gMS4wO1xuXG4gIHRoaXMuc3R5bGVfID0gc3R5bGU7XG4gIHRoaXMuY29sb3JfID0gY29sb3I7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsSW1hZ2U7XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbiAoeCwgeSkge1xuICB0aGlzLnhfID0geDtcbiAgdGhpcy55XyA9IHk7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50RWxlbWVudCkge1xuICBpZiAodGhpcy5zdHlsZV8gJiYgdGhpcy5jb2xvcl8pIHtcbiAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnZmlsbCcsIGV2YWxVdGlscy5nZXRGaWxsKHRoaXMuc3R5bGVfLCB0aGlzLmNvbG9yXykpO1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdzdHJva2UnLCBldmFsVXRpbHMuZ2V0U3Ryb2tlKHRoaXMuc3R5bGVfLCB0aGlzLmNvbG9yXykpO1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgZXZhbFV0aWxzLmdldE9wYWNpdHkodGhpcy5zdHlsZV8sIHRoaXMuY29sb3JfKSk7XG4gIH1cblxuICB2YXIgdHJhbnNmb3JtID0gXCJcIjtcbiAgdHJhbnNmb3JtICs9IFwiIHRyYW5zbGF0ZShcIiArIHRoaXMueF8gKyBcIiBcIiArIHRoaXMueV8gKyBcIilcIjtcblxuICBpZiAodGhpcy5zY2FsZVhfICE9PSAxLjAgfHwgdGhpcy5zY2FsZVkgIT09IDEuMCkge1xuICAgIHRyYW5zZm9ybSArPSBcIiBzY2FsZShcIiArIHRoaXMuc2NhbGVYXyArIFwiIFwiICsgdGhpcy5zY2FsZVlfICsgXCIpXCI7XG4gIH1cblxuICBpZiAodGhpcy5yb3RhdGlvbl8gIT09IDApIHtcbiAgICB0cmFuc2Zvcm0gKz0gXCIgcm90YXRlKFwiICsgdGhpcy5yb3RhdGlvbl8gKyBcIilcIjtcbiAgfVxuXG4gIGlmICh0cmFuc2Zvcm0gPT09IFwiXCIpIHtcbiAgICB0aGlzLmVsZW1lbnRfLnJlbW92ZUF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0pO1xuICB9XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnBsYWNlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54XyA9IHg7XG4gIHRoaXMueV8gPSB5O1xufTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiAoZGVncmVlcykge1xuICB0aGlzLnJvdGF0aW9uXyArPSBkZWdyZWVzO1xufTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uIChzY2FsZVgsIHNjYWxlWSkge1xuICB0aGlzLnNjYWxlWF8gPSBzY2FsZVg7XG4gIHRoaXMuc2NhbGVZXyA9IHNjYWxlWTtcbn07XG5cbi8qKlxuICogR2V0IGNoaWxkIEV2YWxPYmplY3RzLiBvdmVycmlkZGVuIGJ5IGNoaWxkcmVuXG4gKi9cbkV2YWxJbWFnZS5wcm90b3R5cGUuZ2V0Q2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBbXTtcbn07XG4iLCJ2YXIgQ3VzdG9tRXZhbEVycm9yID0gcmVxdWlyZSgnLi9ldmFsRXJyb3InKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG4vKipcbiAqIFRocm93cyBhbiBleHBlY3Rpb24gaWYgdmFsIGlzIG5vdCBvZiB0aGUgZXhwZWN0ZWQgdHlwZS4gVHlwZSBpcyBlaXRoZXIgYVxuICogc3RyaW5nIChsaWtlIFwibnVtYmVyXCIgb3IgXCJzdHJpbmdcIikgb3IgYW4gb2JqZWN0IChMaWtlIEV2YWxJbWFnZSkuXG4gKi9cbm1vZHVsZS5leHBvcnRzLmVuc3VyZVN0cmluZyA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuIG1vZHVsZS5leHBvcnRzLmVuc3VyZVR5cGUodmFsLCBcInN0cmluZ1wiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmVuc3VyZU51bWJlciA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuIG1vZHVsZS5leHBvcnRzLmVuc3VyZVR5cGUodmFsLCBcIm51bWJlclwiKTtcbn07XG5cbi8qKlxuICogU3R5bGUgaXMgZWl0aGVyIFwic29saWRcIiwgXCJvdXRsaW5lXCIsIG9yIGEgcGVyY2VudGFnZSBpLmUuIFwiNzAlXCJcbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlU3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwuc2xpY2UoLTEpID09PSAnJScpIHtcbiAgICB2YXIgb3BhY2l0eSA9IG1vZHVsZS5leHBvcnRzLmdldE9wYWNpdHkodmFsKTtcbiAgICBpZiAob3BhY2l0eSA+PSAwICYmIG9wYWNpdHkgPD0gMS4wKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGlmIChfLmNvbnRhaW5zKFsnb3V0bGluZScsICdzb2xpZCddLCB2YWwpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRocm93IG5ldyBDdXN0b21FdmFsRXJyb3IoQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkU3R5bGUsIHZhbCk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB0byBzZWUgaWYgdGhpcyBpcyBhIHZhbGlkIGNvbG9yLCB0aHJvd2luZyBpZiBpdCBpc250LiBDb2xvciB2YWxpZGl0eVxuICogaXMgZGV0ZXJtaW5lZCBieSBzZXR0aW5nIHRoZSB2YWx1ZSBvbiBhbiBodG1sIGVsZW1lbnQgYW5kIHNlZWluZyBpZiBpdCB0YWtlcy5cbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlQ29sb3IgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGUuc3R5bGUuY29sb3IgPSB2YWw7XG4gIC8vIFdlIGNhbid0IGNoZWNrIHRoYXQgZS5zdHlsZS5jb2xvciA9PT0gdmFsLCBzaW5jZSBzb21lIHZhbHMgd2lsbCBiZVxuICAvLyB0cmFuc2Zvcm1lZCAoaS5lLiAjZmZmIC0+IHJnYigyNTUsIDI1NSwgMjU1KVxuICBpZiAoIWUuc3R5bGUuY29sb3IpIHtcbiAgICB0aHJvdyBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLkJhZENvbG9yLCB2YWwpO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB2YWxcbiAqIEBwYXJhbSB7c3RyaW5nfENsYXNzfSB0eXBlXG4gKi9cbm1vZHVsZS5leHBvcnRzLmVuc3VyZVR5cGUgPSBmdW5jdGlvbiAodmFsLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YodHlwZSkgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAodHlwZW9mKHZhbCkgIT09IHR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIHR5cGU6IFwiICsgdHlwZSArIFwiXFxuZ290IHR5cGU6IFwiICsgdHlwZW9mKHZhbCkpO1xuICAgIH1cbiAgfSBlbHNlIGlmICghKHZhbCBpbnN0YW5jZW9mIHR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCBvYmplY3RcIik7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldEZpbGwgPSBmdW5jdGlvbiAoc3R5bGUsIGNvbG9yKSB7XG4gIGlmIChzdHlsZSA9PT0gJ291dGxpbmUnKSB7XG4gICAgcmV0dXJuIFwibm9uZVwiO1xuICB9XG4gIC8vIGZvciBub3csIHdlIHRyZWF0IGFueXRoaW5nIHdlIGRvbid0IHJlY29nbml6ZSBhcyBzb2xpZC5cbiAgcmV0dXJuIGNvbG9yO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0U3Ryb2tlID0gZnVuY3Rpb24gKHN0eWxlLCBjb2xvcikge1xuICBpZiAoc3R5bGUgPT09IFwib3V0bGluZVwiKSB7XG4gICAgcmV0dXJuIGNvbG9yO1xuICB9XG4gIHJldHVybiBcIm5vbmVcIjtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBvcGFjaXR5IGZyb20gdGhlIHN0eWxlLiBTdHlsZSBpcyBhIHN0cmluZyB0aGF0IGlzIGVpdGhlciBhIHdvcmQgb3JcbiAqIHBlcmNlbnRhZ2UgKGkuZS4gMjUlKS5cbiAqL1xubW9kdWxlLmV4cG9ydHMuZ2V0T3BhY2l0eSA9IGZ1bmN0aW9uIChzdHlsZSkge1xuICB2YXIgYWxwaGEgPSAxLjA7XG4gIGlmIChzdHlsZS5zbGljZSgtMSkgPT09IFwiJVwiKSB7XG4gICAgYWxwaGEgPSBwYXJzZUludChzdHlsZS5zbGljZSgwLCAtMSksIDEwKSAvIDEwMDtcbiAgfVxuICByZXR1cm4gYWxwaGE7XG59O1xuXG4vKipcbiAqIFVzZXJzIHNwZWNpZnkgcGl4ZWxzIGluIGEgY29vcmRpbmF0ZSBzeXN0ZW0gd2hlcmUgdGhlIG9yaWdpbiBpcyBhdCB0aGUgYm90dG9tXG4gKiBsZWZ0LCBhbmQgeCBhbmQgeSBpbmNyZWFzZSBhcyB5b3UgbW92ZSByaWdodC91cC4gSSdtIHJlZmVycmluZyB0byB0aGlzIGFzXG4gKiB0aGUgY2FydGVzaWFuIGNvb3JkaW5hdGUgc3lzdGVtLlxuICogVGhlIHBpeGVsIGNvb3JkaW5hdGUgc3lzdGVtIGluc3RlYWQgaGFzIG9yaWdpbiBhdCB0aGUgdG9wIGxlZnQsIGFuZCB4IGFuZCB5XG4gKiBpbmNyZWFzZSBhcyB5b3UgbW92ZSByaWdodC9kb3duLlxuICovXG5tb2R1bGUuZXhwb3J0cy5jYXJ0ZXNpYW5Ub1BpeGVsID0gZnVuY3Rpb24gKGNhcnRlc2lhblkpIHtcbiAgcmV0dXJuIDQwMCAtIGNhcnRlc2lhblk7XG59O1xuIiwidmFyIGV2YWxNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG4vKipcbiAqIEFuIEV2YWwgZXJyb3IgaW5kaWNhdGluZyB0aGF0IHNvbWV0aGluZyBiYWQgaGFwcGVuZWQsIGJ1dCB3ZSB1bmRlcnN0YW5kXG4gKiB0aGUgYmFkIGFuZCB3YW50IG91ciBhcHAgdG8gaGFuZGxlIGl0IChpLmUuIHVzZXIgdXNlZCBhbiBpbnZhbGlkIHN0eWxlXG4gKiBzdHJpbmcgYW5kIHdlIHdhbnQgdG8gZGlzcGxheSBhbiBlcnJvciBtZXNzYWdlKS5cbiAqL1xudmFyIEN1c3RvbUV2YWxFcnJvciA9IGZ1bmN0aW9uICh0eXBlLCB2YWwpIHtcbiAgdGhpcy50eXBlID0gdHlwZTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEN1c3RvbUV2YWxFcnJvci5UeXBlLkJhZFN0eWxlOlxuICAgICAgdGhpcy5mZWVkYmFja01lc3NhZ2UgPSBldmFsTXNnLmJhZFN0eWxlU3RyaW5nRXJyb3Ioe3ZhbDogdmFsfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEN1c3RvbUV2YWxFcnJvci5UeXBlLkJhZENvbG9yOlxuICAgICAgdGhpcy5mZWVkYmFja01lc3NhZ2UgPSBldmFsTXNnLmJhZENvbG9yU3RyaW5nRXJyb3Ioe3ZhbDogdmFsfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEN1c3RvbUV2YWxFcnJvci5UeXBlLkluZmluaXRlUmVjdXJzaW9uOlxuICAgICAgdGhpcy5mZWVkYmFja01lc3NhZ2UgPSBldmFsTXNnLmluZmluaXRlUmVjdXJzaW9uRXJyb3IoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuVXNlckNvZGVFeGNlcHRpb246XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cudXNlckNvZGVFeGNlcHRpb24oKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnID0gJyc7XG4gICAgICBicmVhaztcbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gQ3VzdG9tRXZhbEVycm9yO1xuXG5DdXN0b21FdmFsRXJyb3IuVHlwZSA9IHtcbiAgQmFkU3R5bGU6IDAsXG4gIEJhZENvbG9yOiAxLFxuICBJbmZpbml0ZVJlY3Vyc2lvbjogMixcbiAgVXNlckNvZGVFeGNlcHRpb246IDNcbn07XG4iLCIvLyBsb2NhbGUgZm9yIGV2YWxcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5ldmFsX2xvY2FsZTtcbiJdfQ==
