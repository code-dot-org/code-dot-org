require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/adhoc/apps/build/js/eval/main.js":[function(require,module,exports){
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

},{"../appMain":"/home/ubuntu/adhoc/apps/build/js/appMain.js","../skins":"/home/ubuntu/adhoc/apps/build/js/skins.js","./blocks":"/home/ubuntu/adhoc/apps/build/js/eval/blocks.js","./eval":"/home/ubuntu/adhoc/apps/build/js/eval/eval.js","./levels":"/home/ubuntu/adhoc/apps/build/js/eval/levels.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/eval.js":[function(require,module,exports){
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
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

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

  studioApp.init(config);
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

},{"../StudioApp":"/home/ubuntu/adhoc/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/adhoc/apps/build/js/block_utils.js","../canvg/svg_todataurl":"/home/ubuntu/adhoc/apps/build/js/canvg/svg_todataurl.js","../codegen":"/home/ubuntu/adhoc/apps/build/js/codegen.js","../dom":"/home/ubuntu/adhoc/apps/build/js/dom.js","../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","../skins":"/home/ubuntu/adhoc/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/adhoc/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/adhoc/apps/build/js/utils.js","./api":"/home/ubuntu/adhoc/apps/build/js/eval/api.js","./controls.html.ejs":"/home/ubuntu/adhoc/apps/build/js/eval/controls.html.ejs","./evalError":"/home/ubuntu/adhoc/apps/build/js/eval/evalError.js","./evalText":"/home/ubuntu/adhoc/apps/build/js/eval/evalText.js","./levels":"/home/ubuntu/adhoc/apps/build/js/eval/levels.js","./locale":"/home/ubuntu/adhoc/apps/build/js/eval/locale.js","./visualization.html.ejs":"/home/ubuntu/adhoc/apps/build/js/eval/visualization.html.ejs","canvg":"/home/ubuntu/adhoc/apps/node_modules/canvg/canvg.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/visualization.html.ejs":[function(require,module,exports){
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
},{"ejs":"/home/ubuntu/adhoc/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/levels.js":[function(require,module,exports){
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

},{"../block_utils":"/home/ubuntu/adhoc/apps/build/js/block_utils.js","./locale":"/home/ubuntu/adhoc/apps/build/js/eval/locale.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/controls.html.ejs":[function(require,module,exports){
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
},{"../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","./locale":"/home/ubuntu/adhoc/apps/build/js/eval/locale.js","ejs":"/home/ubuntu/adhoc/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/blocks.js":[function(require,module,exports){
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

},{"../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","../sharedFunctionalBlocks":"/home/ubuntu/adhoc/apps/build/js/sharedFunctionalBlocks.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js","./locale":"/home/ubuntu/adhoc/apps/build/js/eval/locale.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/api.js":[function(require,module,exports){
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

},{"./evalCircle":"/home/ubuntu/adhoc/apps/build/js/eval/evalCircle.js","./evalEllipse":"/home/ubuntu/adhoc/apps/build/js/eval/evalEllipse.js","./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalMulti":"/home/ubuntu/adhoc/apps/build/js/eval/evalMulti.js","./evalPolygon":"/home/ubuntu/adhoc/apps/build/js/eval/evalPolygon.js","./evalRect":"/home/ubuntu/adhoc/apps/build/js/eval/evalRect.js","./evalStar":"/home/ubuntu/adhoc/apps/build/js/eval/evalStar.js","./evalText":"/home/ubuntu/adhoc/apps/build/js/eval/evalText.js","./evalTriangle":"/home/ubuntu/adhoc/apps/build/js/eval/evalTriangle.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalTriangle.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalText.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalStar.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalRect.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalPolygon.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalMulti.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalEllipse.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalCircle.js":[function(require,module,exports){
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

},{"./evalImage":"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js","./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalImage.js":[function(require,module,exports){
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

},{"./evalUtils":"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalUtils.js":[function(require,module,exports){
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

},{"../utils":"/home/ubuntu/adhoc/apps/build/js/utils.js","./evalError":"/home/ubuntu/adhoc/apps/build/js/eval/evalError.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/evalError.js":[function(require,module,exports){
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

},{"./locale":"/home/ubuntu/adhoc/apps/build/js/eval/locale.js"}],"/home/ubuntu/adhoc/apps/build/js/eval/locale.js":[function(require,module,exports){
// locale for eval

"use strict";

module.exports = window.blockly.eval_locale;

},{}]},{},["/home/ubuntu/adhoc/apps/build/js/eval/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ldmFsL21haW4uanMiLCJidWlsZC9qcy9ldmFsL2V2YWwuanMiLCJidWlsZC9qcy9ldmFsL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2xldmVscy5qcyIsImJ1aWxkL2pzL2V2YWwvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2V2YWwvYXBpLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsVHJpYW5nbGUuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxUZXh0LmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsU3Rhci5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbFJlY3QuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxQb2x5Z29uLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsTXVsdGkuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxFbGxpcHNlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsQ2lyY2xlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsSW1hZ2UuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxVdGlscy5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbEVycm9yLmpzIiwiYnVpbGQvanMvZXZhbC9sb2NhbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FB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RSxDQUFDO0FBQ3BCLG1CQUFpQixFQUFFLENBQUM7Q0FDckIsQ0FBQzs7Ozs7OztBQ2pDRixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93LkV2YWwgPSByZXF1aXJlKCcuL2V2YWwnKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuZXZhbE1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIGFwcE1haW4od2luZG93LkV2YWwsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IEV2YWwgR3JhcGhpY3NcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEV2YWwgPSBtb2R1bGUuZXhwb3J0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBFdmFsID0gbW9kdWxlLmV4cG9ydHM7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgZXZhbE1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIEN1c3RvbUV2YWxFcnJvciA9IHJlcXVpcmUoJy4vZXZhbEVycm9yJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG4vLyBMb2FkaW5nIHRoZXNlIG1vZHVsZXMgZXh0ZW5kcyBTVkdFbGVtZW50IGFuZCBwdXRzIGNhbnZnIGluIHRoZSBnbG9iYWxcbi8vIG5hbWVzcGFjZVxudmFyIGNhbnZnID0gcmVxdWlyZSgnY2FudmcnKTtcbi8vIHRlc3RzIGRvbid0IGhhdmUgc3ZnZWxlbWVudFxuaWYgKHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICByZXF1aXJlKCcuLi9jYW52Zy9zdmdfdG9kYXRhdXJsJyk7XG59XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2NrcyhmYWxzZSk7XG5cbkV2YWwuQ0FOVkFTX0hFSUdIVCA9IDQwMDtcbkV2YWwuQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHNldCBpbiB0aGUgYXBpIGNhbGwgdG8gZHJhdywgYW5kIGV4dHJhY3RlZCBpbiBldmFsQ29kZVxuRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBudWxsO1xuXG5FdmFsLmFuc3dlck9iamVjdCA9IG51bGw7XG5cbkV2YWwuZmVlZGJhY2tJbWFnZSA9IG51bGw7XG5FdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBFdmFsLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuRXZhbC5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSB0cnVlO1xuICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayA9ICdmdW5jdGlvbmFsX2Rpc3BsYXknO1xuICBjb25maWcuZW5hYmxlU2hvd0NvZGUgPSBmYWxzZTtcblxuICAvLyBXZSBkb24ndCB3YW50IGljb25zIGluIGluc3RydWN0aW9uc1xuICBjb25maWcuc2tpbi5zdGF0aWNBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi53aW5BdmF0YXIgPSBudWxsO1xuXG4gIGNvbmZpZy5odG1sID0gcGFnZSh7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICBkYXRhOiB7XG4gICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybFxuICAgICAgfSksXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0V2YWwnKTtcbiAgICBpZiAoIXN2Zykge1xuICAgICAgdGhyb3cgXCJzb21ldGhpbmcgYmFkIGhhcHBlbmVkXCI7XG4gICAgfVxuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRXZhbC5DQU5WQVNfV0lEVEgpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEV2YWwuQ0FOVkFTX0hFSUdIVCk7XG5cbiAgICAvLyBUaGlzIGlzIGhhY2sgdGhhdCBJIGhhdmVuJ3QgYmVlbiBhYmxlIHRvIGZ1bGx5IHVuZGVyc3RhbmQuIEZ1cnRoZXJtb3JlLFxuICAgIC8vIGl0IHNlZW1zIHRvIGJyZWFrIHRoZSBmdW5jdGlvbmFsIGJsb2NrcyBpbiBzb21lIGJyb3dzZXJzLiBBcyBzdWNoLCBJJ21cbiAgICAvLyBqdXN0IGdvaW5nIHRvIGRpc2FibGUgdGhlIGhhY2sgZm9yIHRoaXMgYXBwLlxuICAgIEJsb2NrbHkuQlJPS0VOX0NPTlRST0xfUE9JTlRTID0gZmFsc2U7XG5cbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZW52aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnRXZhbCxjb2RlJyk7XG5cbiAgICBpZiAobGV2ZWwuY29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKSB7XG4gICAgICB2YXIgYmFja2dyb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kJyk7XG4gICAgICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX2dyaWQucG5nJykpO1xuICAgICAgICBzdHVkaW9BcHAuY3JlYXRlQ29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKHtcbiAgICAgICAgICBzdmc6ICdzdmdFdmFsJyxcbiAgICAgICAgICBvcmlnaW46IC0yMDAsXG4gICAgICAgICAgZmlyc3RMYWJlbDogLTEwMCxcbiAgICAgICAgICBsYXN0TGFiZWw6IDEwMCxcbiAgICAgICAgICBpbmNyZW1lbnQ6IDEwMFxuICAgICAgICB9KTtcbiAgICAgIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAobGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICAgIHZhciBzb2x1dGlvbkJsb2NrcyA9IGJsb2NrVXRpbHMuZm9yY2VJbnNlcnRUb3BCbG9jayhsZXZlbC5zb2x1dGlvbkJsb2NrcyxcbiAgICAgICAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2spO1xuXG4gICAgICB2YXIgYW5zd2VyT2JqZWN0ID0gZ2V0RHJhd2FibGVGcm9tQmxvY2tYbWwoc29sdXRpb25CbG9ja3MpO1xuICAgICAgaWYgKGFuc3dlck9iamVjdCAmJiBhbnN3ZXJPYmplY3QuZHJhdykge1xuICAgICAgICAvLyBzdG9yZSBvYmplY3QgZm9yIGxhdGVyIGFuYWx5c2lzXG4gICAgICAgIEV2YWwuYW5zd2VyT2JqZWN0ID0gYW5zd2VyT2JqZWN0O1xuICAgICAgICBhbnN3ZXJPYmplY3QuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICAgIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICAgIC8vIGJhc2UncyBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlIGNhbGxlZCBmaXJzdFxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmVzZXRCdXR0b24sIEV2YWwucmVzZXRCdXR0b25DbGljayk7XG5cbiAgICBpZiAoQmxvY2tseS5jb250cmFjdEVkaXRvcikge1xuICAgICAgQmxvY2tseS5jb250cmFjdEVkaXRvci5yZWdpc3RlclRlc3RIYW5kbGVyKGdldEV2YWxFeGFtcGxlRmFpbHVyZSk7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdFJlc2V0SGFuZGxlcihyZXNldEV4YW1wbGVEaXNwbGF5KTtcbiAgICB9XG4gIH07XG5cbiAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtCbG9ja2x5LkJsb2NrfVxuICogQHBhcmFtIHtib29sZWFufSBbZXZhbHVhdGVJblBsYXlzcGFjZV0gVHJ1ZSBpZiB0aGlzIHRlc3Qgc2hvdWxkIGFsc28gc2hvd1xuICogICBldmFsdWF0aW9uIGluIHRoZSBwbGF5IHNwYWNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBFcnJvciBzdHJpbmcsIG9yIG51bGwgaWYgc3VjY2Vzc1xuICovXG5mdW5jdGlvbiBnZXRFdmFsRXhhbXBsZUZhaWx1cmUoZXhhbXBsZUJsb2NrLCBldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gIGlmIChldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gICAgc3R1ZGlvQXBwLnJlc2V0QnV0dG9uQ2xpY2soKTtcbiAgICBFdmFsLnJlc2V0QnV0dG9uQ2xpY2soKTtcbiAgICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gIH1cblxuICBjbGVhclRlc3RDYW52YXNlcygpO1xuICBkaXNwbGF5Q2FsbEFuZEV4YW1wbGUoKTtcblxuICB2YXIgZmFpbHVyZTtcbiAgdHJ5IHtcbiAgICB2YXIgYWN0dWFsQmxvY2sgPSBleGFtcGxlQmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhcIkFDVFVBTFwiKTtcbiAgICB2YXIgZXhwZWN0ZWRCbG9jayA9IGV4YW1wbGVCbG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKFwiRVhQRUNURURcIik7XG4gICAgdmFyIGFjdHVhbERyYXdlciA9IGdldERyYXdhYmxlRnJvbUJsb2NrKGFjdHVhbEJsb2NrKTtcbiAgICB2YXIgZXhwZWN0ZWREcmF3ZXIgPSBnZXREcmF3YWJsZUZyb21CbG9jayhleHBlY3RlZEJsb2NrKTtcblxuICAgIHN0dWRpb0FwcC5mZWVkYmFja18udGhyb3dPbkludmFsaWRFeGFtcGxlQmxvY2tzKGFjdHVhbEJsb2NrLCBleHBlY3RlZEJsb2NrKTtcblxuICAgIGlmICghYWN0dWFsRHJhd2VyIHx8IGFjdHVhbERyYXdlciBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIENhbGwgQmxvY2snKTtcbiAgICB9XG5cbiAgICBpZiAoIWV4cGVjdGVkRHJhd2VyIHx8IGV4cGVjdGVkRHJhd2VyIGluc3RhbmNlb2YgQ3VzdG9tRXZhbEVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUmVzdWx0IEJsb2NrJyk7XG4gICAgfVxuXG4gICAgYWN0dWFsRHJhd2VyLmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0LWNhbGxcIikpO1xuICAgIGV4cGVjdGVkRHJhd2VyLmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0LXJlc3VsdFwiKSk7XG5cbiAgICBmYWlsdXJlID0gY2FudmFzZXNNYXRjaCgndGVzdC1jYWxsJywgJ3Rlc3QtcmVzdWx0JykgPyBudWxsIDpcbiAgICAgIFwiRG9lcyBub3QgbWF0Y2ggZGVmaW5pdGlvblwiO1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZmFpbHVyZSA9IFwiRXhlY3V0aW9uIGVycm9yOiBcIiArIGVycm9yLm1lc3NhZ2U7XG4gIH1cblxuICBpZiAoZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICAgIHNob3dPbmx5RXhhbXBsZSgpO1xuICB9IGVsc2Uge1xuICAgIHJlc2V0RXhhbXBsZURpc3BsYXkoKTtcbiAgfVxuICByZXR1cm4gZmFpbHVyZTtcbn1cblxuZnVuY3Rpb24gY2xlYXJUZXN0Q2FudmFzZXMoKSB7XG4gIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoXCJ0ZXN0LWNhbGxcIik7XG4gIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoXCJ0ZXN0LXJlc3VsdFwiKTtcbn1cblxuZnVuY3Rpb24gcmVzZXRFeGFtcGxlRGlzcGxheSgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1jYWxsJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtcmVzdWx0Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbn1cblxuZnVuY3Rpb24gc2hvd09ubHlFeGFtcGxlKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtY2FsbCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LXJlc3VsdCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5Q2FsbEFuZEV4YW1wbGUoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1jYWxsJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LXJlc3VsdCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufVxuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkV2YWwucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuICBFdmFsLmV4ZWN1dGUoKTtcbn07XG5cbkV2YWwuY2xlYXJDYW52YXNXaXRoSUQgPSBmdW5jdGlvbiAoY2FudmFzSUQpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRCk7XG4gIHdoaWxlIChlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cbn07XG4vKipcbiAqIEFwcCBzcGVjaWZpYyByZXNldCBidXR0b24gY2xpY2sgbG9naWMuICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlXG4gKiBjYWxsZWQgZmlyc3QuXG4gKi9cbkV2YWwucmVzZXRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgcmVzZXRFeGFtcGxlRGlzcGxheSgpO1xuICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gIEV2YWwuZmVlZGJhY2tJbWFnZSA9IG51bGw7XG4gIEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2UgPSBudWxsO1xuICBFdmFsLnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIEV2YWwubWVzc2FnZSA9IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogRXZhbHVhdGVzIHVzZXIgY29kZSwgY2F0Y2hpbmcgYW55IGV4Y2VwdGlvbnMuXG4gKiBAcmV0dXJuIHtFdmFsSW1hZ2V8Q3VzdG9tRXZhbEVycm9yfSBFdmFsSW1hZ2Ugb24gc3VjY2VzcywgQ3VzdG9tRXZhbEVycm9yIG9uXG4gKiAgaGFuZGxlYWJsZSBmYWlsdXJlLCBudWxsIG9uIHVuZXhwZWN0ZWQgZmFpbHVyZS5cbiAqL1xuZnVuY3Rpb24gZXZhbENvZGUgKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgRXZhbDogYXBpXG4gICAgfSk7XG5cbiAgICB2YXIgb2JqZWN0ID0gRXZhbC5kaXNwbGF5ZWRPYmplY3Q7XG4gICAgRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBudWxsO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0luZmluaXRlUmVjdXJzaW9uRXJyb3IoZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLkluZmluaXRlUmVjdXJzaW9uLCBudWxsKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICB9XG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLlVzZXJDb2RlRXhjZXB0aW9uLCBudWxsKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBhIGRyYXdhYmxlIEV2YWxJbWFnZSBmcm9tIHRoZSBibG9ja3MgY3VycmVudGx5IGluIHRoZSB3b3Jrc3BhY2VcbiAqIEByZXR1cm4ge0V2YWxJbWFnZXxDdXN0b21FdmFsRXJyb3J9XG4gKi9cbmZ1bmN0aW9uIGdldERyYXdhYmxlRnJvbUJsb2Nrc3BhY2UoKSB7XG4gIHZhciBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcsIFsnZnVuY3Rpb25hbF9kaXNwbGF5JywgJ2Z1bmN0aW9uYWxfZGVmaW5pdGlvbiddKTtcbiAgdmFyIHJlc3VsdCA9IGV2YWxDb2RlKGNvZGUpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXREcmF3YWJsZUZyb21CbG9jayhibG9jaykge1xuICB2YXIgZGVmaW5pdGlvbkNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0JywgWydmdW5jdGlvbmFsX2RlZmluaXRpb24nXSk7XG4gIHZhciBibG9ja0NvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja3NUb0NvZGUoJ0phdmFTY3JpcHQnLCBbYmxvY2tdKTtcbiAgdmFyIGxpbmVzID0gYmxvY2tDb2RlLnNwbGl0KCdcXG4nKTtcbiAgdmFyIGxhc3RMaW5lID0gbGluZXMuc2xpY2UoLTEpWzBdO1xuICB2YXIgbGFzdExpbmVXaXRoRGlzcGxheSA9IFwiRXZhbC5kaXNwbGF5KFwiICsgbGFzdExpbmUgKyBcIik7XCI7XG4gIHZhciBibG9ja0NvZGVEaXNwbGF5ZWQgPSBsaW5lcy5zbGljZSgwLCAtMSkuam9pbignXFxuJykgKyBsYXN0TGluZVdpdGhEaXNwbGF5O1xuICB2YXIgcmVzdWx0ID0gZXZhbENvZGUoZGVmaW5pdGlvbkNvZGUgKyAnOyAnICsgYmxvY2tDb2RlRGlzcGxheWVkKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBkcmF3YWJsZSBFdmFsSW1hZ2UgZnJvbSB0aGUgYmxvY2tzIGluIHRoZSB3b3Jrc3BhY2UuIElmIGJsb2NrWG1sXG4gKiBpcyBwcm92aWRlZCwgdGVtcG9yYXJpbHkgc3RpY2tzIHRob3NlIGJsb2NrcyBpbnRvIHRoZSB3b3Jrc3BhY2UgdG8gZ2VuZXJhdGVcbiAqIHRoZSBldmFsSW1hZ2UsIHRoZW4gZGVsZXRlcyBibG9ja3MuXG4gKiBAcmV0dXJuIHtFdmFsSW1hZ2V8Q3VzdG9tRXZhbEVycm9yfVxuICovXG5mdW5jdGlvbiBnZXREcmF3YWJsZUZyb21CbG9ja1htbChibG9ja1htbCkge1xuICBpZiAoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKS5sZW5ndGggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXREcmF3YWJsZUZyb21CbG9ja3Mgc2hvdWxkbid0IGJlIGNhbGxlZCB3aXRoIGJsb2NrcyBpZiBcIiArXG4gICAgICBcIndlIGFscmVhZHkgaGF2ZSBibG9ja3MgaW4gdGhlIHdvcmtzcGFjZVwiKTtcbiAgfVxuICAvLyBUZW1wb3JhcmlseSBwdXQgdGhlIGJsb2NrcyBpbnRvIHRoZSB3b3Jrc3BhY2Ugc28gdGhhdCB3ZSBjYW4gZ2VuZXJhdGUgY29kZVxuICBzdHVkaW9BcHAubG9hZEJsb2NrcyhibG9ja1htbCk7XG5cbiAgdmFyIHJlc3VsdCA9IGdldERyYXdhYmxlRnJvbUJsb2Nrc3BhY2UoKTtcblxuICAvLyBSZW1vdmUgdGhlIGJsb2Nrc1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKGIpIHsgYi5kaXNwb3NlKCk7IH0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcGFyc2UgYW4gRXZhbE9iamVjdCBsb29raW5nIGZvciBFdmFsVGV4dCBvYmplY3RzLiBGb3IgZWFjaCBvbmUsXG4gKiBleHRyYWN0IHRoZSB0ZXh0IGNvbnRlbnQuXG4gKi9cbkV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyA9IGZ1bmN0aW9uIChldmFsT2JqZWN0KSB7XG4gIGlmICghZXZhbE9iamVjdCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBzdHJzID0gW107XG4gIGlmIChldmFsT2JqZWN0IGluc3RhbmNlb2YgRXZhbFRleHQpIHtcbiAgICBzdHJzLnB1c2goZXZhbE9iamVjdC5nZXRUZXh0KCkpO1xuICB9XG5cbiAgZXZhbE9iamVjdC5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgc3RycyA9IHN0cnMuY29uY2F0KEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhjaGlsZCkpO1xuICB9KTtcbiAgcmV0dXJuIHN0cnM7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIFRydWUgaWYgdHdvIGV2YWwgb2JqZWN0cyBoYXZlIHNldHMgb2YgdGV4dCBzdHJpbmdzIHRoYXQgZGlmZmVyXG4gKiAgIG9ubHkgaW4gY2FzZVxuICovXG5FdmFsLmhhdmVDYXNlTWlzbWF0Y2hfID0gZnVuY3Rpb24gKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgdmFyIHN0cnMxID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDEpO1xuICB2YXIgc3RyczIgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0Mik7XG5cbiAgaWYgKHN0cnMxLmxlbmd0aCAhPT0gc3RyczIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RyczEuc29ydCgpO1xuICBzdHJzMi5zb3J0KCk7XG5cbiAgdmFyIGNhc2VNaXNtYXRjaCA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyczEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc3RyMSA9IHN0cnMxW2ldO1xuICAgIHZhciBzdHIyID0gc3RyczJbaV07XG4gICAgaWYgKHN0cjEgIT09IHN0cjIpIHtcbiAgICAgIGlmIChzdHIxLnRvTG93ZXJDYXNlKCkgPT09IHN0cjIudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlTWlzbWF0Y2ggID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gc3RyaW5ncyBkaWZmZXIgYnkgbW9yZSB0aGFuIGNhc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhc2VNaXNtYXRjaDtcbn07XG5cbi8qKlxuICogTm90ZTogaXMgdW5hYmxlIHRvIGRpc3Rpbmd1aXNoIGZyb20gdHJ1ZS9mYWxzZSBnZW5lcmF0ZWQgZnJvbSBzdHJpbmcgYmxvY2tzXG4gKiAgIHZzLiBmcm9tIGJvb2xlYW4gYmxvY2tzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0d28gZXZhbCBvYmplY3RzIGFyZSBib3RoIGJvb2xlYW5zLCBidXQgaGF2ZSBkaWZmZXJlbnQgdmFsdWVzLlxuICovXG5FdmFsLmhhdmVCb29sZWFuTWlzbWF0Y2hfID0gZnVuY3Rpb24gKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgdmFyIHN0cnMxID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDEpO1xuICB2YXIgc3RyczIgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0Mik7XG5cbiAgaWYgKHN0cnMxLmxlbmd0aCAhPT0gMSB8fCBzdHJzMi5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdGV4dDEgPSBzdHJzMVswXTtcbiAgdmFyIHRleHQyID0gc3RyczJbMF07XG5cbiAgaWYgKCh0ZXh0MSA9PT0gXCJ0cnVlXCIgJiYgdGV4dDIgPT09IFwiZmFsc2VcIikgfHxcbiAgICAgICh0ZXh0MSA9PT0gXCJmYWxzZVwiICYmIHRleHQyID09PSBcInRydWVcIikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5FdmFsLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgRXZhbC5yZXN1bHQgPSBSZXN1bHRUeXBlLlVOU0VUO1xuICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOO1xuICBFdmFsLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNVbmZpbGxlZEZ1bmN0aW9uYWxCbG9jaygpKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05BTF9CTE9DSztcbiAgICBFdmFsLm1lc3NhZ2UgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsQmxvY2tFcnJvcignZnVuY3Rpb25hbF9kaXNwbGF5Jyk7XG4gIH0gZWxzZSBpZiAoc3R1ZGlvQXBwLmhhc1F1ZXN0aW9uTWFya3NJbk51bWJlckZpZWxkKCkpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5RVUVTVElPTl9NQVJLU19JTl9OVU1CRVJfRklFTEQ7XG4gIH0gZWxzZSBpZiAoc3R1ZGlvQXBwLmhhc0VtcHR5RnVuY3Rpb25PclZhcmlhYmxlTmFtZSgpKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05fTkFNRTtcbiAgICBFdmFsLm1lc3NhZ2UgPSBjb21tb25Nc2cudW5uYW1lZEZ1bmN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgY2xlYXJUZXN0Q2FudmFzZXMoKTtcbiAgICByZXNldEV4YW1wbGVEaXNwbGF5KCk7XG4gICAgdmFyIHVzZXJPYmplY3QgPSBnZXREcmF3YWJsZUZyb21CbG9ja3NwYWNlKCk7XG4gICAgaWYgKHVzZXJPYmplY3QgJiYgdXNlck9iamVjdC5kcmF3KSB7XG4gICAgICB1c2VyT2JqZWN0LmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyXCIpKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgYSBDdXN0b21FdmFsRXJyb3IsIHNldCBlcnJvciBtZXNzYWdlIGFwcHJvcHJpYXRlbHkuXG4gICAgaWYgKHVzZXJPYmplY3QgaW5zdGFuY2VvZiBDdXN0b21FdmFsRXJyb3IpIHtcbiAgICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICBFdmFsLm1lc3NhZ2UgPSB1c2VyT2JqZWN0LmZlZWRiYWNrTWVzc2FnZTtcbiAgICB9IGVsc2UgaWYgKEV2YWwuaGF2ZUNhc2VNaXNtYXRjaF8odXNlck9iamVjdCwgRXZhbC5hbnN3ZXJPYmplY3QpKSB7XG4gICAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgRXZhbC5tZXNzYWdlID0gZXZhbE1zZy5zdHJpbmdNaXNtYXRjaEVycm9yKCk7XG4gICAgfSBlbHNlIGlmIChFdmFsLmhhdmVCb29sZWFuTWlzbWF0Y2hfKHVzZXJPYmplY3QsIEV2YWwuYW5zd2VyT2JqZWN0KSkge1xuICAgICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIEV2YWwubWVzc2FnZSA9IGV2YWxNc2cud3JvbmdCb29sZWFuRXJyb3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgRXZhbC5jaGVja0V4YW1wbGVzXygpO1xuXG4gICAgICAvLyBIYXZlbid0IHJ1biBpbnRvIGFueSBlcnJvcnMuIERvIG91ciBhY3R1YWwgY29tcGFyaXNvblxuICAgICAgaWYgKEV2YWwucmVzdWx0ID09PSBSZXN1bHRUeXBlLlVOU0VUKSB7XG4gICAgICAgIEV2YWwucmVzdWx0ID0gY2FudmFzZXNNYXRjaCgndXNlcicsICdhbnN3ZXInKTtcbiAgICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhFdmFsLnJlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgICAgICBFdmFsLnJlc3VsdCA9IHRydWU7XG4gICAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdldmFsJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IEV2YWwucmVzdWx0LFxuICAgIHRlc3RSZXN1bHQ6IEV2YWwudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgIG9uQ29tcGxldGU6IG9uUmVwb3J0Q29tcGxldGUsXG4gICAgaW1hZ2U6IEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2VcbiAgfTtcblxuICAvLyBkb24ndCB0cnkgaXQgaWYgZnVuY3Rpb24gaXMgbm90IGRlZmluZWQsIHdoaWNoIHNob3VsZCBwcm9iYWJseSBvbmx5IGJlXG4gIC8vIHRydWUgaW4gb3VyIHRlc3QgZW52aXJvbm1lbnRcbiAgaWYgKHR5cGVvZiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRXZhbCcpLnRvRGF0YVVSTCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzdHVkaW9BcHAucmVwb3J0KHJlcG9ydERhdGEpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdFdmFsJykudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIsIHtcbiAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihwbmdEYXRhVXJsKSB7XG4gICAgICAgIEV2YWwuZmVlZGJhY2tJbWFnZSA9IHBuZ0RhdGFVcmw7XG4gICAgICAgIEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2UgPSBlbmNvZGVVUklDb21wb25lbnQoRXZhbC5mZWVkYmFja0ltYWdlLnNwbGl0KCcsJylbMV0pO1xuXG4gICAgICAgIHN0dWRpb0FwcC5yZXBvcnQocmVwb3J0RGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKEV2YWwucmVzdWx0ID8gJ3dpbicgOiAnZmFpbHVyZScpO1xufTtcblxuRXZhbC5jaGVja0V4YW1wbGVzXyA9IGZ1bmN0aW9uIChyZXNldFBsYXlzcGFjZSkge1xuICBpZiAoIWxldmVsLmV4YW1wbGVzUmVxdWlyZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZXhhbXBsZWxlc3MgPSBzdHVkaW9BcHAuZ2V0RnVuY3Rpb25XaXRob3V0VHdvRXhhbXBsZXMoKTtcbiAgaWYgKGV4YW1wbGVsZXNzKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogZXhhbXBsZWxlc3N9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdW5maWxsZWQgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsRXhhbXBsZSgpO1xuICBpZiAodW5maWxsZWQpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcblxuICAgIHZhciBuYW1lID0gdW5maWxsZWQuZ2V0Um9vdEJsb2NrKCkuZ2V0SW5wdXRUYXJnZXRCbG9jaygnQUNUVUFMJylcbiAgICAgIC5nZXRUaXRsZVZhbHVlKCdOQU1FJyk7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogbmFtZX0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBmYWlsaW5nQmxvY2tOYW1lID0gc3R1ZGlvQXBwLmNoZWNrRm9yRmFpbGluZ0V4YW1wbGVzKGdldEV2YWxFeGFtcGxlRmFpbHVyZSk7XG4gIGlmIChmYWlsaW5nQmxvY2tOYW1lKSB7XG4gICAgLy8gQ2xlYXIgdXNlciBjYW52YXMsIGFzIHRoaXMgaXMgbWVhbnQgdG8gYmUgYSBwcmUtZXhlY3V0aW9uIGZhaWx1cmVcbiAgICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmV4YW1wbGVFcnJvck1lc3NhZ2Uoe2Z1bmN0aW9uTmFtZTogZmFpbGluZ0Jsb2NrTmFtZX0pO1xuICAgIHJldHVybjtcbiAgfVxufTtcblxuLyoqXG4gKiBDYWxsaW5nIG91dGVySFRNTCBvbiBzdmcgZWxlbWVudHMgaW4gc2FmYXJpIGRvZXMgbm90IHdvcmsuIEluc3RlYWQgd2Ugc3RpY2tcbiAqIGl0IGluc2lkZSBhIGRpdiBhbmQgZ2V0IHRoYXQgZGl2J3MgaW5uZXIgaHRtbC5cbiAqL1xuZnVuY3Rpb24gb3V0ZXJIVE1MIChlbGVtZW50KSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmFwcGVuZENoaWxkKGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGltYWdlRGF0YUZvclN2ZyhlbGVtZW50SWQpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSBFdmFsLkNBTlZBU19XSURUSDtcbiAgY2FudmFzLmhlaWdodCA9IEV2YWwuQ0FOVkFTX0hFSUdIVDtcbiAgY2FudmcoY2FudmFzLCBvdXRlckhUTUwoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKSkpO1xuXG4gIC8vIGNhbnZnIGF0dGFjaGVzIGFuIHN2ZyBvYmplY3QgdG8gdGhlIGNhbnZhcywgYW5kIGF0dGFjaGVzIGEgc2V0SW50ZXJ2YWwuXG4gIC8vIFdlIGRvbid0IG5lZWQgdGhpcywgYW5kIHRoYXQgYmxvY2tzIG91ciBub2RlIHByb2Nlc3MgZnJvbSBleGl0dGluZyBpblxuICAvLyB0ZXN0cywgc28gc3RvcCBpdC5cbiAgY2FudmFzLnN2Zy5zdG9wKCk7XG5cbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBFdmFsLkNBTlZBU19XSURUSCwgRXZhbC5DQU5WQVNfSEVJR0hUKTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgY29udGVudHMgb2YgdHdvIFNWRyBlbGVtZW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IGNhbnZhc0EgSUQgb2YgY2FudmFzXG4gKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzQiBJRCBvZiBjYW52YXNcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBjYW52YXNlc01hdGNoKGNhbnZhc0EsIGNhbnZhc0IpIHtcbiAgLy8gQ29tcGFyZSB0aGUgc29sdXRpb24gYW5kIHVzZXIgY2FudmFzXG4gIHZhciBpbWFnZURhdGFBID0gaW1hZ2VEYXRhRm9yU3ZnKGNhbnZhc0EpO1xuICB2YXIgaW1hZ2VEYXRhQiA9IGltYWdlRGF0YUZvclN2ZyhjYW52YXNCKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlRGF0YUEuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGlmICgwICE9PSBNYXRoLmFicyhpbWFnZURhdGFBLmRhdGFbaV0gLSBpbWFnZURhdGFCLmRhdGFbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIGlmIChFdmFsLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5VTlNFVCkge1xuICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB3ZSBoaXQgcmVzZXQgYmVmb3JlIG91ciBkaWFsb2cgcG9wcGVkIHVwLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIG92ZXJyaWRlIGV4dHJhIHRvcCBibG9ja3MgbWVzc2FnZVxuICBsZXZlbC5leHRyYVRvcEJsb2NrcyA9IGV2YWxNc2cuZXh0cmFUb3BCbG9ja3MoKTtcblxuICB2YXIgdHJ5QWdhaW5UZXh0O1xuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0cnlBZ2FpblRleHQgPSBjb21tb25Nc2cua2VlcFBsYXlpbmcoKTtcbiAgfVxuXG4gIHZhciBvcHRpb25zID0ge1xuICAgIGFwcDogJ2V2YWwnLFxuICAgIHNraW46IHNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiBFdmFsLnRlc3RSZXN1bHRzLFxuICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgdHJ5QWdhaW5UZXh0OiB0cnlBZ2FpblRleHQsXG4gICAgY29udGludWVUZXh0OiBsZXZlbC5mcmVlUGxheSA/IGNvbW1vbk1zZy5uZXh0UHV6emxlKCkgOiB1bmRlZmluZWQsXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkpLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnlcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiBFdmFsLnJlc3BvbnNlICYmIEV2YWwucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBmZWVkYmFja0ltYWdlOiBFdmFsLmZlZWRiYWNrSW1hZ2UsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogZXZhbE1zZy5yZWluZkZlZWRiYWNrTXNnKHtiYWNrQnV0dG9uOiB0cnlBZ2FpblRleHR9KVxuICAgIH1cbiAgfTtcbiAgaWYgKEV2YWwubWVzc2FnZSAmJiAhbGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICBvcHRpb25zLm1lc3NhZ2UgPSBFdmFsLm1lc3NhZ2U7XG4gIH1cbiAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayhvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbmZ1bmN0aW9uIG9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpIHtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG5cbiAgLy8gQWRkIGEgc2hvcnQgZGVsYXkgc28gdGhhdCB1c2VyIGdldHMgdG8gc2VlIHRoZWlyIGZpbmlzaGVkIGRyYXdpbmcuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGRpc3BsYXlGZWVkYmFjayhyZXNwb25zZSk7XG4gIH0sIDIwMDApO1xufVxuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJzdmdFdmFsXCI+XFxuICA8aW1hZ2UgaWQ9XCJiYWNrZ3JvdW5kXCIgdmlzaWJpbGl0eT1cImhpZGRlblwiIGhlaWdodD1cIjQwMFwiIHdpZHRoPVwiNDAwXCIgeD1cIjBcIiB5PVwiMFwiID48L2ltYWdlPlxcbiAgPGcgaWQ9XCJhbnN3ZXJcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwidXNlclwiPlxcbiAgPC9nPlxcbiAgPGcgaWQ9XCJ0ZXN0LWNhbGxcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwidGVzdC1yZXN1bHRcIj5cXG4gIDwvZz5cXG48L3N2Zz5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBsZXZlbC1zcGVjaWZpYyByZXF1aXJlbWVudHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnZXZhbDEnOiB7XG4gICAgc29sdXRpb25CbG9ja3M6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0YXInLCB7XG4gICAgICAnQ09MT1InOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ2dyZWVuJyB9ICksXG4gICAgICAnU1RZTEUnOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ3NvbGlkJyB9KSxcbiAgICAgICdTSVpFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInLCBudWxsLCB7IE5VTTogMjAwIH0gKVxuICAgIH0pLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3BsdXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX21pbnVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90aW1lcycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfZGl2aWRlZGJ5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9tYXRoX251bWJlcicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3RyaW5nJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zdHlsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfY2lyY2xlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90cmlhbmdsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3F1YXJlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9yZWN0YW5nbGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2VsbGlwc2UnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3N0YXInKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3JhZGlhbF9zdGFyJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9wb2x5Z29uJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgncGxhY2VfaW1hZ2UnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdvZmZzZXQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdvdmVybGF5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgndW5kZXJsYXknKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdyb3RhdGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzY2FsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfdGV4dCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3N0cmluZ19hcHBlbmQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzdHJpbmdfbGVuZ3RoJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9ncmVhdGVyX3RoYW4nKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xlc3NfdGhhbicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbnVtYmVyX2VxdWFscycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3RyaW5nX2VxdWFscycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbG9naWNhbF9hbmQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xvZ2ljYWxfb3InKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xvZ2ljYWxfbm90JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9ib29sZWFuJylcbiAgICApLFxuICAgIHN0YXJ0QmxvY2tzOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdGFyJywge1xuICAgICAgJ0NPTE9SJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdibGFjaycgfSApLFxuICAgICAgJ1NUWUxFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdzb2xpZCcgfSksXG4gICAgICAnU0laRSc6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJywgbnVsbCwgeyBOVU06IDIwMCB9IClcbiAgICB9KSxcbiAgICByZXF1aXJlZEJsb2NrczogJycsXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG5cbiAgJ2N1c3RvbSc6IHtcbiAgICBhbnN3ZXI6ICcnLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiAnJyxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgcmVxdWlyZWRCbG9ja3M6ICcnLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuICB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbiAgdmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuOyBidWYucHVzaCgnXFxuXFxuPGJ1dHRvbiBpZD1cImNvbnRpbnVlQnV0dG9uXCIgY2xhc3M9XCJsYXVuY2ggaGlkZSBmbG9hdC1yaWdodFwiPlxcbiAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDcsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg3LCAgY29tbW9uTXNnLmNvbnRpbnVlKCkgKSksICdcXG48L2J1dHRvbj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogRXZhbCBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IEV2YWwgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG52YXIgc2hhcmVkRnVuY3Rpb25hbEJsb2NrcyA9IHJlcXVpcmUoJy4uL3NoYXJlZEZ1bmN0aW9uYWxCbG9ja3MnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIHNoYXJlZEZ1bmN0aW9uYWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfZGlzcGxheScsXG4gICAgYmxvY2tUaXRsZTogbXNnLmRpc3BsYXlCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ2Rpc3BsYXknLFxuICAgIHJldHVyblR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTk9ORSxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdBUkcxJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OT05FIH0sXG4gICAgXVxuICB9KTtcblxuICAvLyBzaGFwZXNcbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfY2lyY2xlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuY2lyY2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdjaXJjbGUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF90cmlhbmdsZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnRyaWFuZ2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICd0cmlhbmdsZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3NxdWFyZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnNxdWFyZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3F1YXJlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfcmVjdGFuZ2xlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucmVjdGFuZ2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdyZWN0YW5nbGUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1dJRFRIJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0hFSUdIVCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX2VsbGlwc2UnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5lbGxpcHNlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdlbGxpcHNlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdXSURUSCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdIRUlHSFQnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9zdGFyJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3RhckJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3RhcicsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3JhZGlhbF9zdGFyJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucmFkaWFsU3RhckJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncmFkaWFsU3RhcicsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnUE9JTlRTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lOTkVSJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ09VVEVSJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfcG9seWdvbicsXG4gICAgYmxvY2tUaXRsZTogbXNnLnBvbHlnb25CbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3BvbHlnb24nLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJREVTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0xFTkdUSCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3RleHQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy50ZXh0QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICd0ZXh0JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdURVhUJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICAvLyBpbWFnZSBtYW5pcHVsYXRpb25cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ292ZXJsYXknLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5vdmVybGF5QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdvdmVybGF5JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdUT1AnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgICB7IG5hbWU6ICdCT1RUT00nLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgXSxcbiAgICB2ZXJ0aWNhbGx5U3RhY2tJbnB1dHM6IHRydWVcbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3VuZGVybGF5JyxcbiAgICBibG9ja1RpdGxlOiBtc2cudW5kZXJsYXlCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3VuZGVybGF5JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdCT1RUT00nLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgICB7IG5hbWU6ICdUT1AnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdLFxuICAgIHZlcnRpY2FsbHlTdGFja0lucHV0czogdHJ1ZVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAncGxhY2VfaW1hZ2UnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5wbGFjZUltYWdlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdwbGFjZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdYJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1knLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdvZmZzZXQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5vZmZzZXRCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ29mZnNldCcsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnWCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdZJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAncm90YXRlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucm90YXRlSW1hZ2VCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3JvdGF0ZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdERUdSRUVTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnc2NhbGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zY2FsZUltYWdlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzY2FsZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdGQUNUT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIC8vIHN0cmluZyBtYW5pcHVsYXRpb25cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3N0cmluZ19hcHBlbmQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zdHJpbmdBcHBlbmRCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3N0cmluZ0FwcGVuZCcsXG4gICAgcmV0dXJuVHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnRklSU1QnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnU0VDT05EJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gcG9sbGluZyBmb3IgdmFsdWVzXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdzdHJpbmdfbGVuZ3RoJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3RyaW5nTGVuZ3RoQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzdHJpbmdMZW5ndGgnLFxuICAgIHJldHVyblR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NUUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGJsb2NrbHkuRnVuY3Rpb25hbEJsb2NrVXRpbHMuaW5zdGFsbFN0cmluZ1BpY2tlcihibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3N0eWxlJyxcbiAgICB2YWx1ZXM6IFtcbiAgICAgIFttc2cuc29saWQoKSwgJ3NvbGlkJ10sXG4gICAgICBbJzc1JScsICc3NSUnXSxcbiAgICAgIFsnNTAlJywgJzUwJSddLFxuICAgICAgWycyNSUnLCAnMjUlJ10sXG4gICAgICBbbXNnLm91dGxpbmUoKSwgJ291dGxpbmUnXVxuICAgIF1cbiAgfSk7XG59O1xuXG5cbmZ1bmN0aW9uIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIG9wdGlvbnMpIHtcbiAgdmFyIGJsb2NrTmFtZSA9IG9wdGlvbnMuYmxvY2tOYW1lO1xuICB2YXIgYmxvY2tUaXRsZSA9IG9wdGlvbnMuYmxvY2tUaXRsZTtcbiAgdmFyIGFwaU5hbWUgPSBvcHRpb25zLmFwaU5hbWU7XG4gIHZhciBhcmdzID0gb3B0aW9ucy5hcmdzO1xuICB2YXIgcmV0dXJuVHlwZSA9IG9wdGlvbnMucmV0dXJuVHlwZSB8fCBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFO1xuXG4gIGJsb2NrbHkuQmxvY2tzW2Jsb2NrTmFtZV0gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgYmxvY2tseS5GdW5jdGlvbmFsQmxvY2tVdGlscy5pbml0VGl0bGVkRnVuY3Rpb25hbEJsb2NrKHRoaXMsIGJsb2NrVGl0bGUsIHJldHVyblR5cGUsIGFyZ3MsIHtcbiAgICAgICAgdmVydGljYWxseVN0YWNrSW5wdXRzOiBvcHRpb25zLnZlcnRpY2FsbHlTdGFja0lucHV0c1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvcltibG9ja05hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwaUFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhcmcgPSBhcmdzW2ldO1xuICAgICAgdmFyIGFwaUFyZyA9IEJsb2NrbHkuSmF2YVNjcmlwdC5zdGF0ZW1lbnRUb0NvZGUodGhpcywgYXJnLm5hbWUsIGZhbHNlKTtcbiAgICAgIC8vIFByb3ZpZGUgZGVmYXVsdHNcbiAgICAgIGlmICghYXBpQXJnKSB7XG4gICAgICAgIGlmIChhcmcudHlwZSA9PT0gYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpIHtcbiAgICAgICAgICBhcGlBcmcgPSAnMCc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnLm5hbWUgPT09ICdTVFlMRScpIHtcbiAgICAgICAgICBhcGlBcmcgPSBibG9ja2x5LkphdmFTY3JpcHQucXVvdGVfKCdzb2xpZCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZy5uYW1lID09PSAnQ09MT1InKSB7XG4gICAgICAgICAgYXBpQXJnID0gYmxvY2tseS5KYXZhU2NyaXB0LnF1b3RlXygnYmxhY2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXBpQXJncy5wdXNoKGFwaUFyZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwiRXZhbC5cIiArIGFwaU5hbWUgKyBcIihcIiArIGFwaUFyZ3Muam9pbihcIiwgXCIpICsgXCIpXCI7XG4gIH07XG59XG4iLCJ2YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcbnZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIEV2YWxUZXh0ID0gcmVxdWlyZSgnLi9ldmFsVGV4dCcpO1xudmFyIEV2YWxDaXJjbGUgPSByZXF1aXJlKCcuL2V2YWxDaXJjbGUnKTtcbnZhciBFdmFsVHJpYW5nbGUgPSByZXF1aXJlKCcuL2V2YWxUcmlhbmdsZScpO1xudmFyIEV2YWxNdWx0aSA9IHJlcXVpcmUoJy4vZXZhbE11bHRpJyk7XG52YXIgRXZhbFJlY3QgPSByZXF1aXJlKCcuL2V2YWxSZWN0Jyk7XG52YXIgRXZhbEVsbGlwc2UgPSByZXF1aXJlKCcuL2V2YWxFbGxpcHNlJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgRXZhbFN0YXIgPSByZXF1aXJlKCcuL2V2YWxTdGFyJyk7XG52YXIgRXZhbFBvbHlnb24gPSByZXF1aXJlKCcuL2V2YWxQb2x5Z29uJyk7XG5cbi8vIFdlIGRvbid0IHVzZSBibG9ja0lkIGF0IGFsbCBpbiBFdmFsIHNpbmNlIGV2ZXJ5dGhpbmcgaXMgZXZhbHVhdGVkIGF0IG9uY2UuXG5cbmV4cG9ydHMuZGlzcGxheSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgb2JqZWN0ID0gXCJcIjtcbiAgfVxuXG4gIC8vIGNhbGwgdG9sb2NhbGVTdHJpbmcgb24gbnVtYmVycyBzbyB0aGF0IHdlIGdldCBjb21tYXMgZm9yIGxhcmdlIG51bWJlcnNcbiAgaWYgKHR5cGVvZihvYmplY3QpID09PSAnbnVtYmVyJyAmJiBvYmplY3QudG9Mb2NhbGVTdHJpbmcpIHtcbiAgICBvYmplY3QgPSBvYmplY3QudG9Mb2NhbGVTdHJpbmcoKTtcbiAgfVxuXG4gIGlmICghb2JqZWN0LmRyYXcpIHtcbiAgICBvYmplY3QgPSBuZXcgRXZhbFRleHQob2JqZWN0LnRvU3RyaW5nKCksIDEyLCAnYmxhY2snKTtcbiAgfVxuICBFdmFsLmRpc3BsYXllZE9iamVjdCA9IG9iamVjdDtcbn07XG5cbmV4cG9ydHMuY2lyY2xlID0gZnVuY3Rpb24gKHNpemUsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxDaXJjbGUoc2l6ZSwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMudHJpYW5nbGUgPSBmdW5jdGlvbiAoc2l6ZSwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFRyaWFuZ2xlKHNpemUsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLm92ZXJsYXkgPSBmdW5jdGlvbiAodG9wLCBib3R0b20pIHtcbiAgcmV0dXJuIG5ldyBFdmFsTXVsdGkodG9wLCBib3R0b20pO1xufTtcblxuZXhwb3J0cy51bmRlcmxheSA9IGZ1bmN0aW9uIChib3R0b20sIHRvcCkge1xuICByZXR1cm4gbmV3IEV2YWxNdWx0aSh0b3AsIGJvdHRvbSk7XG59O1xuXG5leHBvcnRzLnNxdWFyZSA9IGZ1bmN0aW9uIChzaXplLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsUmVjdChzaXplLCBzaXplLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5yZWN0YW5nbGUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFJlY3Qod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMuZWxsaXBzZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsRWxsaXBzZSh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy50ZXh0ID0gZnVuY3Rpb24gKHRleHQsIGZvbnRTaXplLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxUZXh0KHRleHQsIGZvbnRTaXplLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnN0YXIgPSBmdW5jdGlvbiAocmFkaXVzLCBzdHlsZSwgY29sb3IpIHtcbiAgdmFyIGlubmVyUmFkaXVzID0gKDMgLSBNYXRoLnNxcnQoNSkpIC8gMiAqIHJhZGl1cztcbiAgcmV0dXJuIG5ldyBFdmFsU3Rhcig1LCBpbm5lclJhZGl1cywgcmFkaXVzLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5yYWRpYWxTdGFyID0gZnVuY3Rpb24gKHBvaW50cywgaW5uZXIsIG91dGVyLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsU3Rhcihwb2ludHMsIGlubmVyLCBvdXRlciwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMucG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGxlbmd0aCwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFBvbHlnb24ocG9pbnRzLCBsZW5ndGgsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnBsYWNlSW1hZ2UgPSBmdW5jdGlvbiAoeCwgeSwgaW1hZ2UpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih4KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih5KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UsIEV2YWxJbWFnZSk7XG5cbiAgLy8gb3JpZ2luIGF0IGNlbnRlclxuICB4ID0geCArIEV2YWwuQ0FOVkFTX1dJRFRIIC8gMjtcbiAgeSA9IHkgKyBFdmFsLkNBTlZBU19IRUlHSFQgLyAyO1xuXG4gIC8vIFVzZXIgaW5wdXRzIHkgaW4gY2FydGVzaWFuIHNwYWNlLiBDb252ZXJ0IHRvIHBpeGVsIHNwYWNlIGJlZm9yZSBzZW5kaW5nXG4gIC8vIHRvIG91ciBFdmFsSW1hZ2UuXG4gIHkgPSBldmFsVXRpbHMuY2FydGVzaWFuVG9QaXhlbCh5KTtcblxuICAvLyByZWxhdGl2ZSB0byBjZW50ZXIgb2Ygd29ya3NwYWNlXG4gIGltYWdlLnBsYWNlKHgsIHkpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLm9mZnNldCA9IGZ1bmN0aW9uICh4LCB5LCBpbWFnZSkge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHgpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHkpO1xuICBldmFsVXRpbHMuZW5zdXJlVHlwZShpbWFnZSwgRXZhbEltYWdlKTtcblxuICB4ID0gaW1hZ2UueF8gKyB4O1xuICB5ID0gaW1hZ2UueV8gLSB5O1xuXG4gIGltYWdlLnBsYWNlKHgsIHkpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLnJvdGF0ZUltYWdlID0gZnVuY3Rpb24gKGRlZ3JlZXMsIGltYWdlKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoZGVncmVlcyk7XG5cbiAgaW1hZ2Uucm90YXRlKGRlZ3JlZXMpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLnNjYWxlSW1hZ2UgPSBmdW5jdGlvbiAoZmFjdG9yLCBpbWFnZSkge1xuICBpbWFnZS5zY2FsZShmYWN0b3IsIGZhY3Rvcik7XG4gIHJldHVybiBpbWFnZTtcbn07XG5cbmV4cG9ydHMuc3RyaW5nQXBwZW5kID0gZnVuY3Rpb24gKGZpcnN0LCBzZWNvbmQpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyhmaXJzdCk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHJpbmcoc2Vjb25kKTtcblxuICByZXR1cm4gZmlyc3QgKyBzZWNvbmQ7XG59O1xuXG4vLyBwb2xsaW5nIGZvciB2YWx1ZXNcbmV4cG9ydHMuc3RyaW5nTGVuZ3RoID0gZnVuY3Rpb24gKHN0cikge1xuICBldmFsVXRpbHMuZW5zdXJlU3RyaW5nKHN0cik7XG5cbiAgcmV0dXJuIHN0ci5sZW5ndGg7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxUcmlhbmdsZSA9IGZ1bmN0aW9uIChlZGdlLCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihlZGdlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMuZWRnZV8gPSBlZGdlO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxUcmlhbmdsZS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsVHJpYW5nbGU7XG5cbkV2YWxUcmlhbmdsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3BvbHlnb24nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICAvLyBjZW50ZXIgYXQgMCwgMCAoYWxsb3dpbmcgdHJhbnNmb3JtcyB0byBtb3ZlIGl0IGFyb3VuZClcbiAgLy8gdGhlIGNlbnRlciBpcyBoYWxmd2F5IGJldHdlZW4gd2lkdGgsIGFuZCBhIHRoaXJkIG9mIHRoZSB3YXkgdXAgdGhlIGhlaWdodFxuICB2YXIgaGVpZ2h0ID0gTWF0aC5zcXJ0KDMpIC8gMiAqIHRoaXMuZWRnZV87XG5cbiAgdmFyIGJvdHRvbUxlZnQgPSB7XG4gICAgeDogLXRoaXMuZWRnZV8gLyAyLFxuICAgIHk6IGhlaWdodCAvIDNcbiAgfTtcblxuICB2YXIgYm90dG9tUmlnaHQgPSB7XG4gICAgeDogdGhpcy5lZGdlXyAvIDIsXG4gICAgeTogaGVpZ2h0IC8gM1xuICB9O1xuXG4gIHZhciB0b3AgPSB7XG4gICAgeDogMCxcbiAgICB5OiAtaGVpZ2h0ICogMiAvIDNcbiAgfTtcblxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncG9pbnRzJyxcbiAgICBib3R0b21MZWZ0LnggKycsJyArIGJvdHRvbUxlZnQueSArICcgJyArXG4gICAgYm90dG9tUmlnaHQueCArICcsJyArIGJvdHRvbVJpZ2h0LnkgKyAnICcgK1xuICAgIHRvcC54ICsgJywnICsgdG9wLnkpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsVGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCBmb250U2l6ZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyh0ZXh0KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihmb250U2l6ZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFsnc29saWQnLCBjb2xvcl0pO1xuXG4gIHRoaXMudGV4dF8gPSB0ZXh0O1xuICB0aGlzLmZvbnRTaXplXyA9IGZvbnRTaXplO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxUZXh0LmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxUZXh0O1xuXG5FdmFsVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RleHQnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cbiAgdGhpcy5lbGVtZW50Xy50ZXh0Q29udGVudCA9IHRoaXMudGV4dF87XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdzdHlsZScsICdmb250LXNpemU6ICcgKyB0aGlzLmZvbnRTaXplXyArICdwdCcpO1xuXG4gIHZhciBiYm94ID0gdGhpcy5lbGVtZW50Xy5nZXRCQm94KCk7XG4gIC8vIGNlbnRlciBhdCBvcmlnaW5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3gnLCAtYmJveC53aWR0aCAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneScsIC1iYm94LmhlaWdodCAvIDIpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuRXZhbFRleHQucHJvdG90eXBlLmdldFRleHQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRleHRfO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsU3RhciA9IGZ1bmN0aW9uIChwb2ludENvdW50LCBpbm5lciwgb3V0ZXIsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHBvaW50Q291bnQpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGlubmVyKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihvdXRlcik7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLm91dGVyXyA9IG91dGVyO1xuICB0aGlzLmlubmVyXyA9IGlubmVyO1xuICB0aGlzLnBvaW50Q291bnRfID0gcG9pbnRDb3VudDtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsU3Rhci5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsU3RhcjtcblxuRXZhbFN0YXIucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdwb2x5Z29uJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgdmFyIHBvaW50cyA9IFtdO1xuICB2YXIgb3V0ZXJSYWRpdXMgPSB0aGlzLm91dGVyXztcbiAgdmFyIGlubmVyUmFkaXVzID0gdGhpcy5pbm5lcl87XG5cbiAgdmFyIGFuZ2xlRGVsdGEgPSAyICogTWF0aC5QSSAvIHRoaXMucG9pbnRDb3VudF87XG4gIGZvciAodmFyIGFuZ2xlID0gMDsgYW5nbGUgPCAyICogTWF0aC5QSTsgYW5nbGUgKz0gYW5nbGVEZWx0YSkge1xuICAgIHBvaW50cy5wdXNoKG91dGVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGUpICsgXCIsXCIgKyBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSk7XG4gICAgcG9pbnRzLnB1c2goaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSArIGFuZ2xlRGVsdGEgLyAyKSArIFwiLFwiICtcbiAgICAgIGlubmVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGUgKyBhbmdsZURlbHRhIC8gMikpO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIHBvaW50cy5qb2luKCcgJykpO1xuICBpZiAodGhpcy5wb2ludENvdW50XyAlIDIgPT0gMSkge1xuICAgIHRoaXMucm90YXRlKC05MCAvIHRoaXMucG9pbnRDb3VudF8pO1xuICB9XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxSZWN0ID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHdpZHRoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihoZWlnaHQpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy53aWR0aF8gPSB3aWR0aDtcbiAgdGhpcy5oZWlnaHRfID0gaGVpZ2h0O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxSZWN0LmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxSZWN0O1xuXG5FdmFsUmVjdC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3JlY3QnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICAvLyBjZW50ZXIgcmVjdCBhdCAwLCAwLiB3ZSdsbCB1c2UgdHJhbnNmb3JtcyB0byBtb3ZlIGl0LlxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneCcsIC10aGlzLndpZHRoXyAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneScsIC10aGlzLmhlaWdodF8gLyAyKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aF8pO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHRfKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFBvbHlnb24gPSBmdW5jdGlvbiAoc2lkZUNvdW50LCBsZW5ndGgsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHNpZGVDb3VudCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIobGVuZ3RoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMucmFkaXVzXyA9IGxlbmd0aCAvICgyICogTWF0aC5zaW4oTWF0aC5QSSAvIHNpZGVDb3VudCkpO1xuICB0aGlzLnBvaW50Q291bnRfID0gc2lkZUNvdW50O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxQb2x5Z29uLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxQb2x5Z29uO1xuXG5FdmFsUG9seWdvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3BvbHlnb24nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICB2YXIgcG9pbnRzID0gW107XG4gIHZhciByYWRpdXMgPSB0aGlzLnJhZGl1c187XG5cbiAgdmFyIGFuZ2xlID0gMiAqIE1hdGguUEkgLyB0aGlzLnBvaW50Q291bnRfO1xuICBmb3IgKHZhciBpID0gMTsgaSA8PSB0aGlzLnBvaW50Q291bnRfOyBpKyspIHtcbiAgICBwb2ludHMucHVzaChyYWRpdXMgKiBNYXRoLmNvcyhpICogYW5nbGUpICsgXCIsXCIgKyByYWRpdXMgKiBNYXRoLnNpbihpICogYW5nbGUpKTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdwb2ludHMnLCBwb2ludHMuam9pbignICcpKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbE11bHRpID0gZnVuY3Rpb24gKGltYWdlMSwgaW1hZ2UyKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVUeXBlKGltYWdlMSwgRXZhbEltYWdlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UyLCBFdmFsSW1hZ2UpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzKTtcblxuICB0aGlzLmltYWdlMV8gPSBpbWFnZTE7XG4gIHRoaXMuaW1hZ2UyXyA9IGltYWdlMjtcblxuICAvLyB3ZSB3YW50IGFuIG9iamVjdCBjZW50ZXJlZCBhdCAwLCAwIHRoYXQgd2UgY2FuIHRoZW4gYXBwbHkgdHJhbnNmb3JtcyB0by5cbiAgLy8gdG8gYWNjb21wbGlzaCB0aGlzLCB3ZSBuZWVkIHRvIGFkanVzdCB0aGUgY2hpbGRyZW4ncyB4L3kncyB0byBiZSByZWxhdGl2ZVxuICAvLyB0byB1c1xuICB2YXIgZGVsdGFYLCBkZWx0YVk7XG4gIGRlbHRhWCA9IHRoaXMuaW1hZ2UxXy54XyAtIHRoaXMueF87XG4gIGRlbHRhWSA9IHRoaXMuaW1hZ2UxXy55XyAtIHRoaXMueV87XG4gIHRoaXMuaW1hZ2UxXy51cGRhdGVQb3NpdGlvbihkZWx0YVgsIGRlbHRhWSk7XG4gIGRlbHRhWCA9IHRoaXMuaW1hZ2UyXy54XyAtIHRoaXMueF87XG4gIGRlbHRhWSA9IHRoaXMuaW1hZ2UyXy55XyAtIHRoaXMueV87XG4gIHRoaXMuaW1hZ2UyXy51cGRhdGVQb3NpdGlvbihkZWx0YVgsIGRlbHRhWSk7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbE11bHRpLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxNdWx0aTtcblxuRXZhbE11bHRpLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB2YXIgZGVsdGFYLCBkZWx0YVk7XG5cbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnZycpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2UyXy5kcmF3KHRoaXMuZWxlbWVudF8pO1xuICB0aGlzLmltYWdlMV8uZHJhdyh0aGlzLmVsZW1lbnRfKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUuZ2V0Q2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBbdGhpcy5pbWFnZTFfLCB0aGlzLmltYWdlMl9dO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsQ2lyY2xlID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHdpZHRoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihoZWlnaHQpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy53aWR0aF8gPSB3aWR0aDtcbiAgdGhpcy5oZWlnaHRfID0gaGVpZ2h0O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxDaXJjbGUuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbENpcmNsZTtcblxuRXZhbENpcmNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2VsbGlwc2UnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2N4JywgMCk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeScsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncngnLCB0aGlzLndpZHRoXyAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncnknLCB0aGlzLmhlaWdodF8gLyAyKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbENpcmNsZSA9IGZ1bmN0aW9uIChyYWRpdXMsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHJhZGl1cyk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLnJhZGl1c18gPSByYWRpdXM7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbENpcmNsZS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsQ2lyY2xlO1xuXG5FdmFsQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnY2lyY2xlJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeCcsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnY3knLCAwKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3InLCB0aGlzLnJhZGl1c18pO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuRXZhbENpcmNsZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKCkge1xuICAvLyBOby1vcC4gUm90YXRpbmcgdGhlIGNpcmNsZSBzdmcgZ2l2ZXMgdXMgc29tZSBwcm9ibGVtcyB3aGVuIHdlIGNvbnZlcnQgdG9cbiAgLy8gYSBiaXRtYXAuXG59O1xuIiwidmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsSW1hZ2UgPSBmdW5jdGlvbiAoc3R5bGUsIGNvbG9yKSB7XG4gIC8vIHgveSBsb2NhdGlvbiBpbiBwaXhlbCBzcGFjZSBvZiBvYmplY3QncyBjZW50ZXJcbiAgdGhpcy54XyA9IDIwMDtcbiAgdGhpcy55XyA9IDIwMDtcblxuICB0aGlzLnJvdGF0aW9uXyA9IDA7XG4gIHRoaXMuc2NhbGVYXyA9IDEuMDtcbiAgdGhpcy5zY2FsZVkgPSAxLjA7XG5cbiAgdGhpcy5zdHlsZV8gPSBzdHlsZTtcbiAgdGhpcy5jb2xvcl8gPSBjb2xvcjtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxJbWFnZTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueF8gPSB4O1xuICB0aGlzLnlfID0geTtcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnRFbGVtZW50KSB7XG4gIGlmICh0aGlzLnN0eWxlXyAmJiB0aGlzLmNvbG9yXykge1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdmaWxsJywgZXZhbFV0aWxzLmdldEZpbGwodGhpcy5zdHlsZV8sIHRoaXMuY29sb3JfKSk7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIGV2YWxVdGlscy5nZXRTdHJva2UodGhpcy5zdHlsZV8sIHRoaXMuY29sb3JfKSk7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCBldmFsVXRpbHMuZ2V0T3BhY2l0eSh0aGlzLnN0eWxlXywgdGhpcy5jb2xvcl8pKTtcbiAgfVxuXG4gIHZhciB0cmFuc2Zvcm0gPSBcIlwiO1xuICB0cmFuc2Zvcm0gKz0gXCIgdHJhbnNsYXRlKFwiICsgdGhpcy54XyArIFwiIFwiICsgdGhpcy55XyArIFwiKVwiO1xuXG4gIGlmICh0aGlzLnNjYWxlWF8gIT09IDEuMCB8fCB0aGlzLnNjYWxlWSAhPT0gMS4wKSB7XG4gICAgdHJhbnNmb3JtICs9IFwiIHNjYWxlKFwiICsgdGhpcy5zY2FsZVhfICsgXCIgXCIgKyB0aGlzLnNjYWxlWV8gKyBcIilcIjtcbiAgfVxuXG4gIGlmICh0aGlzLnJvdGF0aW9uXyAhPT0gMCkge1xuICAgIHRyYW5zZm9ybSArPSBcIiByb3RhdGUoXCIgKyB0aGlzLnJvdGF0aW9uXyArIFwiKVwiO1xuICB9XG5cbiAgaWYgKHRyYW5zZm9ybSA9PT0gXCJcIikge1xuICAgIHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSk7XG4gIH1cbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUucGxhY2UgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB0aGlzLnhfID0geDtcbiAgdGhpcy55XyA9IHk7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gIHRoaXMucm90YXRpb25fICs9IGRlZ3JlZXM7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKHNjYWxlWCwgc2NhbGVZKSB7XG4gIHRoaXMuc2NhbGVYXyA9IHNjYWxlWDtcbiAgdGhpcy5zY2FsZVlfID0gc2NhbGVZO1xufTtcblxuLyoqXG4gKiBHZXQgY2hpbGQgRXZhbE9iamVjdHMuIG92ZXJyaWRkZW4gYnkgY2hpbGRyZW5cbiAqL1xuRXZhbEltYWdlLnByb3RvdHlwZS5nZXRDaGlsZHJlbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFtdO1xufTtcbiIsInZhciBDdXN0b21FdmFsRXJyb3IgPSByZXF1aXJlKCcuL2V2YWxFcnJvcicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogVGhyb3dzIGFuIGV4cGVjdGlvbiBpZiB2YWwgaXMgbm90IG9mIHRoZSBleHBlY3RlZCB0eXBlLiBUeXBlIGlzIGVpdGhlciBhXG4gKiBzdHJpbmcgKGxpa2UgXCJudW1iZXJcIiBvciBcInN0cmluZ1wiKSBvciBhbiBvYmplY3QgKExpa2UgRXZhbEltYWdlKS5cbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlU3RyaW5nID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gbW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSh2YWwsIFwic3RyaW5nXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZW5zdXJlTnVtYmVyID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gbW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSh2YWwsIFwibnVtYmVyXCIpO1xufTtcblxuLyoqXG4gKiBTdHlsZSBpcyBlaXRoZXIgXCJzb2xpZFwiLCBcIm91dGxpbmVcIiwgb3IgYSBwZXJjZW50YWdlIGkuZS4gXCI3MCVcIlxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVTdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbC5zbGljZSgtMSkgPT09ICclJykge1xuICAgIHZhciBvcGFjaXR5ID0gbW9kdWxlLmV4cG9ydHMuZ2V0T3BhY2l0eSh2YWwpO1xuICAgIGlmIChvcGFjaXR5ID49IDAgJiYgb3BhY2l0eSA8PSAxLjApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gaWYgKF8uY29udGFpbnMoWydvdXRsaW5lJywgJ3NvbGlkJ10sIHZhbCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhyb3cgbmV3IEN1c3RvbUV2YWxFcnJvcihDdXN0b21FdmFsRXJyb3IuVHlwZS5CYWRTdHlsZSwgdmFsKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiB0aGlzIGlzIGEgdmFsaWQgY29sb3IsIHRocm93aW5nIGlmIGl0IGlzbnQuIENvbG9yIHZhbGlkaXR5XG4gKiBpcyBkZXRlcm1pbmVkIGJ5IHNldHRpbmcgdGhlIHZhbHVlIG9uIGFuIGh0bWwgZWxlbWVudCBhbmQgc2VlaW5nIGlmIGl0IHRha2VzLlxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVDb2xvciA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZS5zdHlsZS5jb2xvciA9IHZhbDtcbiAgLy8gV2UgY2FuJ3QgY2hlY2sgdGhhdCBlLnN0eWxlLmNvbG9yID09PSB2YWwsIHNpbmNlIHNvbWUgdmFscyB3aWxsIGJlXG4gIC8vIHRyYW5zZm9ybWVkIChpLmUuICNmZmYgLT4gcmdiKDI1NSwgMjU1LCAyNTUpXG4gIGlmICghZS5zdHlsZS5jb2xvcikge1xuICAgIHRocm93IG5ldyBDdXN0b21FdmFsRXJyb3IoQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkQ29sb3IsIHZhbCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHZhbFxuICogQHBhcmFtIHtzdHJpbmd8Q2xhc3N9IHR5cGVcbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSA9IGZ1bmN0aW9uICh2YWwsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZih0eXBlKSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmICh0eXBlb2YodmFsKSAhPT0gdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgdHlwZTogXCIgKyB0eXBlICsgXCJcXG5nb3QgdHlwZTogXCIgKyB0eXBlb2YodmFsKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKCEodmFsIGluc3RhbmNlb2YgdHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIG9iamVjdFwiKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0RmlsbCA9IGZ1bmN0aW9uIChzdHlsZSwgY29sb3IpIHtcbiAgaWYgKHN0eWxlID09PSAnb3V0bGluZScpIHtcbiAgICByZXR1cm4gXCJub25lXCI7XG4gIH1cbiAgLy8gZm9yIG5vdywgd2UgdHJlYXQgYW55dGhpbmcgd2UgZG9uJ3QgcmVjb2duaXplIGFzIHNvbGlkLlxuICByZXR1cm4gY29sb3I7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXRTdHJva2UgPSBmdW5jdGlvbiAoc3R5bGUsIGNvbG9yKSB7XG4gIGlmIChzdHlsZSA9PT0gXCJvdXRsaW5lXCIpIHtcbiAgICByZXR1cm4gY29sb3I7XG4gIH1cbiAgcmV0dXJuIFwibm9uZVwiO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIG9wYWNpdHkgZnJvbSB0aGUgc3R5bGUuIFN0eWxlIGlzIGEgc3RyaW5nIHRoYXQgaXMgZWl0aGVyIGEgd29yZCBvclxuICogcGVyY2VudGFnZSAoaS5lLiAyNSUpLlxuICovXG5tb2R1bGUuZXhwb3J0cy5nZXRPcGFjaXR5ID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gIHZhciBhbHBoYSA9IDEuMDtcbiAgaWYgKHN0eWxlLnNsaWNlKC0xKSA9PT0gXCIlXCIpIHtcbiAgICBhbHBoYSA9IHBhcnNlSW50KHN0eWxlLnNsaWNlKDAsIC0xKSwgMTApIC8gMTAwO1xuICB9XG4gIHJldHVybiBhbHBoYTtcbn07XG5cbi8qKlxuICogVXNlcnMgc3BlY2lmeSBwaXhlbHMgaW4gYSBjb29yZGluYXRlIHN5c3RlbSB3aGVyZSB0aGUgb3JpZ2luIGlzIGF0IHRoZSBib3R0b21cbiAqIGxlZnQsIGFuZCB4IGFuZCB5IGluY3JlYXNlIGFzIHlvdSBtb3ZlIHJpZ2h0L3VwLiBJJ20gcmVmZXJyaW5nIHRvIHRoaXMgYXNcbiAqIHRoZSBjYXJ0ZXNpYW4gY29vcmRpbmF0ZSBzeXN0ZW0uXG4gKiBUaGUgcGl4ZWwgY29vcmRpbmF0ZSBzeXN0ZW0gaW5zdGVhZCBoYXMgb3JpZ2luIGF0IHRoZSB0b3AgbGVmdCwgYW5kIHggYW5kIHlcbiAqIGluY3JlYXNlIGFzIHlvdSBtb3ZlIHJpZ2h0L2Rvd24uXG4gKi9cbm1vZHVsZS5leHBvcnRzLmNhcnRlc2lhblRvUGl4ZWwgPSBmdW5jdGlvbiAoY2FydGVzaWFuWSkge1xuICByZXR1cm4gNDAwIC0gY2FydGVzaWFuWTtcbn07XG4iLCJ2YXIgZXZhbE1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8qKlxuICogQW4gRXZhbCBlcnJvciBpbmRpY2F0aW5nIHRoYXQgc29tZXRoaW5nIGJhZCBoYXBwZW5lZCwgYnV0IHdlIHVuZGVyc3RhbmRcbiAqIHRoZSBiYWQgYW5kIHdhbnQgb3VyIGFwcCB0byBoYW5kbGUgaXQgKGkuZS4gdXNlciB1c2VkIGFuIGludmFsaWQgc3R5bGVcbiAqIHN0cmluZyBhbmQgd2Ugd2FudCB0byBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UpLlxuICovXG52YXIgQ3VzdG9tRXZhbEVycm9yID0gZnVuY3Rpb24gKHR5cGUsIHZhbCkge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkU3R5bGU6XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuYmFkU3R5bGVTdHJpbmdFcnJvcih7dmFsOiB2YWx9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkQ29sb3I6XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuYmFkQ29sb3JTdHJpbmdFcnJvcih7dmFsOiB2YWx9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuSW5maW5pdGVSZWN1cnNpb246XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuaW5maW5pdGVSZWN1cnNpb25FcnJvcigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDdXN0b21FdmFsRXJyb3IuVHlwZS5Vc2VyQ29kZUV4Y2VwdGlvbjpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWdlID0gZXZhbE1zZy51c2VyQ29kZUV4Y2VwdGlvbigpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWcgPSAnJztcbiAgICAgIGJyZWFrO1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBDdXN0b21FdmFsRXJyb3I7XG5cbkN1c3RvbUV2YWxFcnJvci5UeXBlID0ge1xuICBCYWRTdHlsZTogMCxcbiAgQmFkQ29sb3I6IDEsXG4gIEluZmluaXRlUmVjdXJzaW9uOiAyLFxuICBVc2VyQ29kZUV4Y2VwdGlvbjogM1xufTtcbiIsIi8vIGxvY2FsZSBmb3IgZXZhbFxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmV2YWxfbG9jYWxlO1xuIl19
