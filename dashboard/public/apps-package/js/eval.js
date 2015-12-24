require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/brent/git/cdo/apps/build/js/eval/main.js":[function(require,module,exports){
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

},{"../appMain":"/Users/brent/git/cdo/apps/build/js/appMain.js","../skins":"/Users/brent/git/cdo/apps/build/js/skins.js","./blocks":"/Users/brent/git/cdo/apps/build/js/eval/blocks.js","./eval":"/Users/brent/git/cdo/apps/build/js/eval/eval.js","./levels":"/Users/brent/git/cdo/apps/build/js/eval/levels.js"}],"/Users/brent/git/cdo/apps/build/js/eval/eval.js":[function(require,module,exports){
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

},{"../StudioApp":"/Users/brent/git/cdo/apps/build/js/StudioApp.js","../block_utils":"/Users/brent/git/cdo/apps/build/js/block_utils.js","../canvg/svg_todataurl":"/Users/brent/git/cdo/apps/build/js/canvg/svg_todataurl.js","../codegen":"/Users/brent/git/cdo/apps/build/js/codegen.js","../dom":"/Users/brent/git/cdo/apps/build/js/dom.js","../locale":"/Users/brent/git/cdo/apps/build/js/locale.js","../skins":"/Users/brent/git/cdo/apps/build/js/skins.js","../templates/page.html.ejs":"/Users/brent/git/cdo/apps/build/js/templates/page.html.ejs","../utils":"/Users/brent/git/cdo/apps/build/js/utils.js","./api":"/Users/brent/git/cdo/apps/build/js/eval/api.js","./controls.html.ejs":"/Users/brent/git/cdo/apps/build/js/eval/controls.html.ejs","./evalError":"/Users/brent/git/cdo/apps/build/js/eval/evalError.js","./evalText":"/Users/brent/git/cdo/apps/build/js/eval/evalText.js","./levels":"/Users/brent/git/cdo/apps/build/js/eval/levels.js","./locale":"/Users/brent/git/cdo/apps/build/js/eval/locale.js","./visualization.html.ejs":"/Users/brent/git/cdo/apps/build/js/eval/visualization.html.ejs","canvg":"/Users/brent/git/cdo/apps/node_modules/canvg/canvg.js"}],"/Users/brent/git/cdo/apps/build/js/eval/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgEval">\n  <image id="background" visibility="hidden" height="400" width="400" x="0" y="0" ></image>\n  <g id="answer">\n  </g>\n  <g id="user">\n  </g>\n  <g id="test-call">\n  </g>\n  <g id="test-result">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/Users/brent/git/cdo/apps/node_modules/ejs/lib/ejs.js"}],"/Users/brent/git/cdo/apps/build/js/eval/levels.js":[function(require,module,exports){
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

},{"../block_utils":"/Users/brent/git/cdo/apps/build/js/block_utils.js","./locale":"/Users/brent/git/cdo/apps/build/js/eval/locale.js"}],"/Users/brent/git/cdo/apps/build/js/eval/controls.html.ejs":[function(require,module,exports){
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
},{"../locale":"/Users/brent/git/cdo/apps/build/js/locale.js","./locale":"/Users/brent/git/cdo/apps/build/js/eval/locale.js","ejs":"/Users/brent/git/cdo/apps/node_modules/ejs/lib/ejs.js"}],"/Users/brent/git/cdo/apps/build/js/eval/blocks.js":[function(require,module,exports){
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

},{"../locale":"/Users/brent/git/cdo/apps/build/js/locale.js","../sharedFunctionalBlocks":"/Users/brent/git/cdo/apps/build/js/sharedFunctionalBlocks.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js","./locale":"/Users/brent/git/cdo/apps/build/js/eval/locale.js"}],"/Users/brent/git/cdo/apps/build/js/eval/api.js":[function(require,module,exports){
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

},{"./evalCircle":"/Users/brent/git/cdo/apps/build/js/eval/evalCircle.js","./evalEllipse":"/Users/brent/git/cdo/apps/build/js/eval/evalEllipse.js","./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalMulti":"/Users/brent/git/cdo/apps/build/js/eval/evalMulti.js","./evalPolygon":"/Users/brent/git/cdo/apps/build/js/eval/evalPolygon.js","./evalRect":"/Users/brent/git/cdo/apps/build/js/eval/evalRect.js","./evalStar":"/Users/brent/git/cdo/apps/build/js/eval/evalStar.js","./evalText":"/Users/brent/git/cdo/apps/build/js/eval/evalText.js","./evalTriangle":"/Users/brent/git/cdo/apps/build/js/eval/evalTriangle.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalTriangle.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalText.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalStar.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalRect.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalPolygon.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalMulti.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalEllipse.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalCircle.js":[function(require,module,exports){
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

},{"./evalImage":"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js","./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalImage.js":[function(require,module,exports){
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

},{"./evalUtils":"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalUtils.js":[function(require,module,exports){
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

},{"../utils":"/Users/brent/git/cdo/apps/build/js/utils.js","./evalError":"/Users/brent/git/cdo/apps/build/js/eval/evalError.js"}],"/Users/brent/git/cdo/apps/build/js/eval/evalError.js":[function(require,module,exports){
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

},{"./locale":"/Users/brent/git/cdo/apps/build/js/eval/locale.js"}],"/Users/brent/git/cdo/apps/build/js/eval/locale.js":[function(require,module,exports){
// locale for eval

"use strict";

module.exports = window.blockly.eval_locale;

},{}]},{},["/Users/brent/git/cdo/apps/build/js/eval/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ldmFsL21haW4uanMiLCJidWlsZC9qcy9ldmFsL2V2YWwuanMiLCJidWlsZC9qcy9ldmFsL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2xldmVscy5qcyIsImJ1aWxkL2pzL2V2YWwvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2V2YWwvYXBpLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsVHJpYW5nbGUuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxUZXh0LmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsU3Rhci5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbFJlY3QuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxQb2x5Z29uLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsTXVsdGkuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxFbGxpcHNlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsQ2lyY2xlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsSW1hZ2UuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxVdGlscy5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbEVycm9yLmpzIiwiYnVpbGQvanMvZXZhbC9sb2NhbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FB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cEIsbUJBQWlCLEVBQUUsQ0FBQztDQUNyQixDQUFDOzs7Ozs7O0FDakNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRXZhbCA9IHJlcXVpcmUoJy4vZXZhbCcpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5ldmFsTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuRXZhbCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogRXZhbCBHcmFwaGljc1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZhbCA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEV2YWwgPSBtb2R1bGUuZXhwb3J0cztcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBldmFsTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgQ3VzdG9tRXZhbEVycm9yID0gcmVxdWlyZSgnLi9ldmFsRXJyb3InKTtcbnZhciBFdmFsVGV4dCA9IHJlcXVpcmUoJy4vZXZhbFRleHQnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG5cbi8vIExvYWRpbmcgdGhlc2UgbW9kdWxlcyBleHRlbmRzIFNWR0VsZW1lbnQgYW5kIHB1dHMgY2FudmcgaW4gdGhlIGdsb2JhbFxuLy8gbmFtZXNwYWNlXG52YXIgY2FudmcgPSByZXF1aXJlKCdjYW52ZycpO1xuLy8gdGVzdHMgZG9uJ3QgaGF2ZSBzdmdlbGVtZW50XG5pZiAodHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJlcXVpcmUoJy4uL2NhbnZnL3N2Z190b2RhdGF1cmwnKTtcbn1cblxudmFyIGxldmVsO1xudmFyIHNraW47XG5cbnN0dWRpb0FwcC5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKGZhbHNlKTtcblxuRXZhbC5DQU5WQVNfSEVJR0hUID0gNDAwO1xuRXZhbC5DQU5WQVNfV0lEVEggPSA0MDA7XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgc2V0IGluIHRoZSBhcGkgY2FsbCB0byBkcmF3LCBhbmQgZXh0cmFjdGVkIGluIGV2YWxDb2RlXG5FdmFsLmRpc3BsYXllZE9iamVjdCA9IG51bGw7XG5cbkV2YWwuYW5zd2VyT2JqZWN0ID0gbnVsbDtcblxuRXZhbC5mZWVkYmFja0ltYWdlID0gbnVsbDtcbkV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2UgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIEV2YWwuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5FdmFsLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgc3R1ZGlvQXBwLnJ1bkJ1dHRvbkNsaWNrID0gdGhpcy5ydW5CdXR0b25DbGljay5iaW5kKHRoaXMpO1xuXG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ2Z1bmN0aW9uYWxfZGlzcGxheSc7XG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuXG4gIC8vIFdlIGRvbid0IHdhbnQgaWNvbnMgaW4gaW5zdHJ1Y3Rpb25zXG4gIGNvbmZpZy5za2luLnN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLnNtYWxsU3RhdGljQXZhdGFyID0gbnVsbDtcbiAgY29uZmlnLnNraW4uZmFpbHVyZUF2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLndpbkF2YXRhciA9IG51bGw7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsXG4gICAgICB9KSxcbiAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogbGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRXZhbCcpO1xuICAgIGlmICghc3ZnKSB7XG4gICAgICB0aHJvdyBcInNvbWV0aGluZyBiYWQgaGFwcGVuZWRcIjtcbiAgICB9XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBFdmFsLkNBTlZBU19XSURUSCk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRXZhbC5DQU5WQVNfSEVJR0hUKTtcblxuICAgIC8vIFRoaXMgaXMgaGFjayB0aGF0IEkgaGF2ZW4ndCBiZWVuIGFibGUgdG8gZnVsbHkgdW5kZXJzdGFuZC4gRnVydGhlcm1vcmUsXG4gICAgLy8gaXQgc2VlbXMgdG8gYnJlYWsgdGhlIGZ1bmN0aW9uYWwgYmxvY2tzIGluIHNvbWUgYnJvd3NlcnMuIEFzIHN1Y2gsIEknbVxuICAgIC8vIGp1c3QgZ29pbmcgdG8gZGlzYWJsZSB0aGUgaGFjayBmb3IgdGhpcyBhcHAuXG4gICAgQmxvY2tseS5CUk9LRU5fQ09OVFJPTF9QT0lOVFMgPSBmYWxzZTtcblxuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBlbnZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdFdmFsLGNvZGUnKTtcblxuICAgIGlmIChsZXZlbC5jb29yZGluYXRlR3JpZEJhY2tncm91bmQpIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tncm91bmQnKTtcbiAgICAgIGJhY2tncm91bmQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgIHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfZ3JpZC5wbmcnKSk7XG4gICAgICAgIHN0dWRpb0FwcC5jcmVhdGVDb29yZGluYXRlR3JpZEJhY2tncm91bmQoe1xuICAgICAgICAgIHN2ZzogJ3N2Z0V2YWwnLFxuICAgICAgICAgIG9yaWdpbjogLTIwMCxcbiAgICAgICAgICBmaXJzdExhYmVsOiAtMTAwLFxuICAgICAgICAgIGxhc3RMYWJlbDogMTAwLFxuICAgICAgICAgIGluY3JlbWVudDogMTAwXG4gICAgICAgIH0pO1xuICAgICAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmIChsZXZlbC5zb2x1dGlvbkJsb2Nrcykge1xuICAgICAgdmFyIHNvbHV0aW9uQmxvY2tzID0gYmxvY2tVdGlscy5mb3JjZUluc2VydFRvcEJsb2NrKGxldmVsLnNvbHV0aW9uQmxvY2tzLFxuICAgICAgICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayk7XG5cbiAgICAgIHZhciBhbnN3ZXJPYmplY3QgPSBnZXREcmF3YWJsZUZyb21CbG9ja1htbChzb2x1dGlvbkJsb2Nrcyk7XG4gICAgICBpZiAoYW5zd2VyT2JqZWN0ICYmIGFuc3dlck9iamVjdC5kcmF3KSB7XG4gICAgICAgIC8vIHN0b3JlIG9iamVjdCBmb3IgbGF0ZXIgYW5hbHlzaXNcbiAgICAgICAgRXZhbC5hbnN3ZXJPYmplY3QgPSBhbnN3ZXJPYmplY3Q7XG4gICAgICAgIGFuc3dlck9iamVjdC5kcmF3KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXInKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gICAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICAgIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuXG4gICAgLy8gYmFzZSdzIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmUgY2FsbGVkIGZpcnN0XG4gICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChyZXNldEJ1dHRvbiwgRXZhbC5yZXNldEJ1dHRvbkNsaWNrKTtcblxuICAgIGlmIChCbG9ja2x5LmNvbnRyYWN0RWRpdG9yKSB7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdEhhbmRsZXIoZ2V0RXZhbEV4YW1wbGVGYWlsdXJlKTtcbiAgICAgIEJsb2NrbHkuY29udHJhY3RFZGl0b3IucmVnaXN0ZXJUZXN0UmVzZXRIYW5kbGVyKHJlc2V0RXhhbXBsZURpc3BsYXkpO1xuICAgIH1cbiAgfTtcblxuICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge0Jsb2NrbHkuQmxvY2t9XG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtldmFsdWF0ZUluUGxheXNwYWNlXSBUcnVlIGlmIHRoaXMgdGVzdCBzaG91bGQgYWxzbyBzaG93XG4gKiAgIGV2YWx1YXRpb24gaW4gdGhlIHBsYXkgc3BhY2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEVycm9yIHN0cmluZywgb3IgbnVsbCBpZiBzdWNjZXNzXG4gKi9cbmZ1bmN0aW9uIGdldEV2YWxFeGFtcGxlRmFpbHVyZShleGFtcGxlQmxvY2ssIGV2YWx1YXRlSW5QbGF5c3BhY2UpIHtcbiAgaWYgKGV2YWx1YXRlSW5QbGF5c3BhY2UpIHtcbiAgICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljaygpO1xuICAgIEV2YWwucmVzZXRCdXR0b25DbGljaygpO1xuICAgIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoJ3VzZXInKTtcbiAgfVxuXG4gIGNsZWFyVGVzdENhbnZhc2VzKCk7XG4gIGRpc3BsYXlDYWxsQW5kRXhhbXBsZSgpO1xuXG4gIHZhciBmYWlsdXJlO1xuICB0cnkge1xuICAgIHZhciBhY3R1YWxCbG9jayA9IGV4YW1wbGVCbG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKFwiQUNUVUFMXCIpO1xuICAgIHZhciBleHBlY3RlZEJsb2NrID0gZXhhbXBsZUJsb2NrLmdldElucHV0VGFyZ2V0QmxvY2soXCJFWFBFQ1RFRFwiKTtcbiAgICB2YXIgYWN0dWFsRHJhd2VyID0gZ2V0RHJhd2FibGVGcm9tQmxvY2soYWN0dWFsQmxvY2spO1xuICAgIHZhciBleHBlY3RlZERyYXdlciA9IGdldERyYXdhYmxlRnJvbUJsb2NrKGV4cGVjdGVkQmxvY2spO1xuXG4gICAgc3R1ZGlvQXBwLmZlZWRiYWNrXy50aHJvd09uSW52YWxpZEV4YW1wbGVCbG9ja3MoYWN0dWFsQmxvY2ssIGV4cGVjdGVkQmxvY2spO1xuXG4gICAgaWYgKCFhY3R1YWxEcmF3ZXIgfHwgYWN0dWFsRHJhd2VyIGluc3RhbmNlb2YgQ3VzdG9tRXZhbEVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ2FsbCBCbG9jaycpO1xuICAgIH1cblxuICAgIGlmICghZXhwZWN0ZWREcmF3ZXIgfHwgZXhwZWN0ZWREcmF3ZXIgaW5zdGFuY2VvZiBDdXN0b21FdmFsRXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBSZXN1bHQgQmxvY2snKTtcbiAgICB9XG5cbiAgICBhY3R1YWxEcmF3ZXIuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlc3QtY2FsbFwiKSk7XG4gICAgZXhwZWN0ZWREcmF3ZXIuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlc3QtcmVzdWx0XCIpKTtcblxuICAgIGZhaWx1cmUgPSBjYW52YXNlc01hdGNoKCd0ZXN0LWNhbGwnLCAndGVzdC1yZXN1bHQnKSA/IG51bGwgOlxuICAgICAgXCJEb2VzIG5vdCBtYXRjaCBkZWZpbml0aW9uXCI7XG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBmYWlsdXJlID0gXCJFeGVjdXRpb24gZXJyb3I6IFwiICsgZXJyb3IubWVzc2FnZTtcbiAgfVxuXG4gIGlmIChldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gICAgc2hvd09ubHlFeGFtcGxlKCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzZXRFeGFtcGxlRGlzcGxheSgpO1xuICB9XG4gIHJldHVybiBmYWlsdXJlO1xufVxuXG5mdW5jdGlvbiBjbGVhclRlc3RDYW52YXNlcygpIHtcbiAgRXZhbC5jbGVhckNhbnZhc1dpdGhJRChcInRlc3QtY2FsbFwiKTtcbiAgRXZhbC5jbGVhckNhbnZhc1dpdGhJRChcInRlc3QtcmVzdWx0XCIpO1xufVxuXG5mdW5jdGlvbiByZXNldEV4YW1wbGVEaXNwbGF5KCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWNhbGwnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1yZXN1bHQnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufVxuXG5mdW5jdGlvbiBzaG93T25seUV4YW1wbGUoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1jYWxsJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtcmVzdWx0Jykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlDYWxsQW5kRXhhbXBsZSgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWNhbGwnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtcmVzdWx0Jykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG59XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuRXZhbC5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uKCkge1xuICBzdHVkaW9BcHAudG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG4gIEV2YWwuZXhlY3V0ZSgpO1xufTtcblxuRXZhbC5jbGVhckNhbnZhc1dpdGhJRCA9IGZ1bmN0aW9uIChjYW52YXNJRCkge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhc0lEKTtcbiAgd2hpbGUgKGVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxufTtcbi8qKlxuICogQXBwIHNwZWNpZmljIHJlc2V0IGJ1dHRvbiBjbGljayBsb2dpYy4gIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmVcbiAqIGNhbGxlZCBmaXJzdC5cbiAqL1xuRXZhbC5yZXNldEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICByZXNldEV4YW1wbGVEaXNwbGF5KCk7XG4gIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoJ3VzZXInKTtcbiAgRXZhbC5mZWVkYmFja0ltYWdlID0gbnVsbDtcbiAgRXZhbC5lbmNvZGVkRmVlZGJhY2tJbWFnZSA9IG51bGw7XG4gIEV2YWwucmVzdWx0ID0gUmVzdWx0VHlwZS5VTlNFVDtcbiAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgRXZhbC5tZXNzYWdlID0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZXMgdXNlciBjb2RlLCBjYXRjaGluZyBhbnkgZXhjZXB0aW9ucy5cbiAqIEByZXR1cm4ge0V2YWxJbWFnZXxDdXN0b21FdmFsRXJyb3J9IEV2YWxJbWFnZSBvbiBzdWNjZXNzLCBDdXN0b21FdmFsRXJyb3Igb25cbiAqICBoYW5kbGVhYmxlIGZhaWx1cmUsIG51bGwgb24gdW5leHBlY3RlZCBmYWlsdXJlLlxuICovXG5mdW5jdGlvbiBldmFsQ29kZSAoY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICBFdmFsOiBhcGlcbiAgICB9KTtcblxuICAgIHZhciBvYmplY3QgPSBFdmFsLmRpc3BsYXllZE9iamVjdDtcbiAgICBFdmFsLmRpc3BsYXllZE9iamVjdCA9IG51bGw7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgQ3VzdG9tRXZhbEVycm9yKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzSW5maW5pdGVSZWN1cnNpb25FcnJvcihlKSkge1xuICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmFsRXJyb3IoQ3VzdG9tRXZhbEVycm9yLlR5cGUuSW5maW5pdGVSZWN1cnNpb24sIG51bGwpO1xuICAgIH1cblxuICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgIH1cbiAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZykge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDdXN0b21FdmFsRXJyb3IoQ3VzdG9tRXZhbEVycm9yLlR5cGUuVXNlckNvZGVFeGNlcHRpb24sIG51bGwpO1xuICB9XG59XG5cbi8qKlxuICogR2V0IGEgZHJhd2FibGUgRXZhbEltYWdlIGZyb20gdGhlIGJsb2NrcyBjdXJyZW50bHkgaW4gdGhlIHdvcmtzcGFjZVxuICogQHJldHVybiB7RXZhbEltYWdlfEN1c3RvbUV2YWxFcnJvcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RHJhd2FibGVGcm9tQmxvY2tzcGFjZSgpIHtcbiAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0JywgWydmdW5jdGlvbmFsX2Rpc3BsYXknLCAnZnVuY3Rpb25hbF9kZWZpbml0aW9uJ10pO1xuICB2YXIgcmVzdWx0ID0gZXZhbENvZGUoY29kZSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldERyYXdhYmxlRnJvbUJsb2NrKGJsb2NrKSB7XG4gIHZhciBkZWZpbml0aW9uQ29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnLCBbJ2Z1bmN0aW9uYWxfZGVmaW5pdGlvbiddKTtcbiAgdmFyIGJsb2NrQ29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2Nrc1RvQ29kZSgnSmF2YVNjcmlwdCcsIFtibG9ja10pO1xuICB2YXIgbGluZXMgPSBibG9ja0NvZGUuc3BsaXQoJ1xcbicpO1xuICB2YXIgbGFzdExpbmUgPSBsaW5lcy5zbGljZSgtMSlbMF07XG4gIHZhciBsYXN0TGluZVdpdGhEaXNwbGF5ID0gXCJFdmFsLmRpc3BsYXkoXCIgKyBsYXN0TGluZSArIFwiKTtcIjtcbiAgdmFyIGJsb2NrQ29kZURpc3BsYXllZCA9IGxpbmVzLnNsaWNlKDAsIC0xKS5qb2luKCdcXG4nKSArIGxhc3RMaW5lV2l0aERpc3BsYXk7XG4gIHZhciByZXN1bHQgPSBldmFsQ29kZShkZWZpbml0aW9uQ29kZSArICc7ICcgKyBibG9ja0NvZGVEaXNwbGF5ZWQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGRyYXdhYmxlIEV2YWxJbWFnZSBmcm9tIHRoZSBibG9ja3MgaW4gdGhlIHdvcmtzcGFjZS4gSWYgYmxvY2tYbWxcbiAqIGlzIHByb3ZpZGVkLCB0ZW1wb3JhcmlseSBzdGlja3MgdGhvc2UgYmxvY2tzIGludG8gdGhlIHdvcmtzcGFjZSB0byBnZW5lcmF0ZVxuICogdGhlIGV2YWxJbWFnZSwgdGhlbiBkZWxldGVzIGJsb2Nrcy5cbiAqIEByZXR1cm4ge0V2YWxJbWFnZXxDdXN0b21FdmFsRXJyb3J9XG4gKi9cbmZ1bmN0aW9uIGdldERyYXdhYmxlRnJvbUJsb2NrWG1sKGJsb2NrWG1sKSB7XG4gIGlmIChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpLmxlbmd0aCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImdldERyYXdhYmxlRnJvbUJsb2NrcyBzaG91bGRuJ3QgYmUgY2FsbGVkIHdpdGggYmxvY2tzIGlmIFwiICtcbiAgICAgIFwid2UgYWxyZWFkeSBoYXZlIGJsb2NrcyBpbiB0aGUgd29ya3NwYWNlXCIpO1xuICB9XG4gIC8vIFRlbXBvcmFyaWx5IHB1dCB0aGUgYmxvY2tzIGludG8gdGhlIHdvcmtzcGFjZSBzbyB0aGF0IHdlIGNhbiBnZW5lcmF0ZSBjb2RlXG4gIHN0dWRpb0FwcC5sb2FkQmxvY2tzKGJsb2NrWG1sKTtcblxuICB2YXIgcmVzdWx0ID0gZ2V0RHJhd2FibGVGcm9tQmxvY2tzcGFjZSgpO1xuXG4gIC8vIFJlbW92ZSB0aGUgYmxvY2tzXG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoYikgeyBiLmRpc3Bvc2UoKTsgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBwYXJzZSBhbiBFdmFsT2JqZWN0IGxvb2tpbmcgZm9yIEV2YWxUZXh0IG9iamVjdHMuIEZvciBlYWNoIG9uZSxcbiAqIGV4dHJhY3QgdGhlIHRleHQgY29udGVudC5cbiAqL1xuRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfID0gZnVuY3Rpb24gKGV2YWxPYmplY3QpIHtcbiAgaWYgKCFldmFsT2JqZWN0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIHN0cnMgPSBbXTtcbiAgaWYgKGV2YWxPYmplY3QgaW5zdGFuY2VvZiBFdmFsVGV4dCkge1xuICAgIHN0cnMucHVzaChldmFsT2JqZWN0LmdldFRleHQoKSk7XG4gIH1cblxuICBldmFsT2JqZWN0LmdldENoaWxkcmVuKCkuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICBzdHJzID0gc3Rycy5jb25jYXQoRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKGNoaWxkKSk7XG4gIH0pO1xuICByZXR1cm4gc3Rycztcbn07XG5cbi8qKlxuICogQHJldHVybnMgVHJ1ZSBpZiB0d28gZXZhbCBvYmplY3RzIGhhdmUgc2V0cyBvZiB0ZXh0IHN0cmluZ3MgdGhhdCBkaWZmZXJcbiAqICAgb25seSBpbiBjYXNlXG4gKi9cbkV2YWwuaGF2ZUNhc2VNaXNtYXRjaF8gPSBmdW5jdGlvbiAob2JqZWN0MSwgb2JqZWN0Mikge1xuICB2YXIgc3RyczEgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0MSk7XG4gIHZhciBzdHJzMiA9IEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhvYmplY3QyKTtcblxuICBpZiAoc3RyczEubGVuZ3RoICE9PSBzdHJzMi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHJzMS5zb3J0KCk7XG4gIHN0cnMyLnNvcnQoKTtcblxuICB2YXIgY2FzZU1pc21hdGNoID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJzMS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzdHIxID0gc3RyczFbaV07XG4gICAgdmFyIHN0cjIgPSBzdHJzMltpXTtcbiAgICBpZiAoc3RyMSAhPT0gc3RyMikge1xuICAgICAgaWYgKHN0cjEudG9Mb3dlckNhc2UoKSA9PT0gc3RyMi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2VNaXNtYXRjaCAgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBzdHJpbmdzIGRpZmZlciBieSBtb3JlIHRoYW4gY2FzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2FzZU1pc21hdGNoO1xufTtcblxuLyoqXG4gKiBOb3RlOiBpcyB1bmFibGUgdG8gZGlzdGluZ3Vpc2ggZnJvbSB0cnVlL2ZhbHNlIGdlbmVyYXRlZCBmcm9tIHN0cmluZyBibG9ja3NcbiAqICAgdnMuIGZyb20gYm9vbGVhbiBibG9ja3NcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHR3byBldmFsIG9iamVjdHMgYXJlIGJvdGggYm9vbGVhbnMsIGJ1dCBoYXZlIGRpZmZlcmVudCB2YWx1ZXMuXG4gKi9cbkV2YWwuaGF2ZUJvb2xlYW5NaXNtYXRjaF8gPSBmdW5jdGlvbiAob2JqZWN0MSwgb2JqZWN0Mikge1xuICB2YXIgc3RyczEgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0MSk7XG4gIHZhciBzdHJzMiA9IEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhvYmplY3QyKTtcblxuICBpZiAoc3RyczEubGVuZ3RoICE9PSAxIHx8IHN0cnMyLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciB0ZXh0MSA9IHN0cnMxWzBdO1xuICB2YXIgdGV4dDIgPSBzdHJzMlswXTtcblxuICBpZiAoKHRleHQxID09PSBcInRydWVcIiAmJiB0ZXh0MiA9PT0gXCJmYWxzZVwiKSB8fFxuICAgICAgKHRleHQxID09PSBcImZhbHNlXCIgJiYgdGV4dDIgPT09IFwidHJ1ZVwiKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkV2YWwuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICBFdmFsLnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIEV2YWwubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICBpZiAoc3R1ZGlvQXBwLmhhc1VuZmlsbGVkRnVuY3Rpb25hbEJsb2NrKCkpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTkFMX0JMT0NLO1xuICAgIEV2YWwubWVzc2FnZSA9IHN0dWRpb0FwcC5nZXRVbmZpbGxlZEZ1bmN0aW9uYWxCbG9ja0Vycm9yKCdmdW5jdGlvbmFsX2Rpc3BsYXknKTtcbiAgfSBlbHNlIGlmIChzdHVkaW9BcHAuaGFzUXVlc3Rpb25NYXJrc0luTnVtYmVyRmllbGQoKSkge1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlFVRVNUSU9OX01BUktTX0lOX05VTUJFUl9GSUVMRDtcbiAgfSBlbHNlIGlmIChzdHVkaW9BcHAuaGFzRW1wdHlGdW5jdGlvbk9yVmFyaWFibGVOYW1lKCkpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FTVBUWV9GVU5DVElPTl9OQU1FO1xuICAgIEV2YWwubWVzc2FnZSA9IGNvbW1vbk1zZy51bm5hbWVkRnVuY3Rpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBjbGVhclRlc3RDYW52YXNlcygpO1xuICAgIHJlc2V0RXhhbXBsZURpc3BsYXkoKTtcbiAgICB2YXIgdXNlck9iamVjdCA9IGdldERyYXdhYmxlRnJvbUJsb2Nrc3BhY2UoKTtcbiAgICBpZiAodXNlck9iamVjdCAmJiB1c2VyT2JqZWN0LmRyYXcpIHtcbiAgICAgIHVzZXJPYmplY3QuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXJcIikpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGdvdCBhIEN1c3RvbUV2YWxFcnJvciwgc2V0IGVycm9yIG1lc3NhZ2UgYXBwcm9wcmlhdGVseS5cbiAgICBpZiAodXNlck9iamVjdCBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIEV2YWwubWVzc2FnZSA9IHVzZXJPYmplY3QuZmVlZGJhY2tNZXNzYWdlO1xuICAgIH0gZWxzZSBpZiAoRXZhbC5oYXZlQ2FzZU1pc21hdGNoXyh1c2VyT2JqZWN0LCBFdmFsLmFuc3dlck9iamVjdCkpIHtcbiAgICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICBFdmFsLm1lc3NhZ2UgPSBldmFsTXNnLnN0cmluZ01pc21hdGNoRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKEV2YWwuaGF2ZUJvb2xlYW5NaXNtYXRjaF8odXNlck9iamVjdCwgRXZhbC5hbnN3ZXJPYmplY3QpKSB7XG4gICAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgRXZhbC5tZXNzYWdlID0gZXZhbE1zZy53cm9uZ0Jvb2xlYW5FcnJvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBFdmFsLmNoZWNrRXhhbXBsZXNfKCk7XG5cbiAgICAgIC8vIEhhdmVuJ3QgcnVuIGludG8gYW55IGVycm9ycy4gRG8gb3VyIGFjdHVhbCBjb21wYXJpc29uXG4gICAgICBpZiAoRXZhbC5yZXN1bHQgPT09IFJlc3VsdFR5cGUuVU5TRVQpIHtcbiAgICAgICAgRXZhbC5yZXN1bHQgPSBjYW52YXNlc01hdGNoKCd1c2VyJywgJ2Fuc3dlcicpO1xuICAgICAgICBFdmFsLnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKEV2YWwucmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgICAgIEV2YWwucmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2V2YWwnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogRXZhbC5yZXN1bHQsXG4gICAgdGVzdFJlc3VsdDogRXZhbC50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgb25Db21wbGV0ZTogb25SZXBvcnRDb21wbGV0ZSxcbiAgICBpbWFnZTogRXZhbC5lbmNvZGVkRmVlZGJhY2tJbWFnZVxuICB9O1xuXG4gIC8vIGRvbid0IHRyeSBpdCBpZiBmdW5jdGlvbiBpcyBub3QgZGVmaW5lZCwgd2hpY2ggc2hvdWxkIHByb2JhYmx5IG9ubHkgYmVcbiAgLy8gdHJ1ZSBpbiBvdXIgdGVzdCBlbnZpcm9ubWVudFxuICBpZiAodHlwZW9mIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdFdmFsJykudG9EYXRhVVJMID09PSAndW5kZWZpbmVkJykge1xuICAgIHN0dWRpb0FwcC5yZXBvcnQocmVwb3J0RGF0YSk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0V2YWwnKS50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIiwge1xuICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKHBuZ0RhdGFVcmwpIHtcbiAgICAgICAgRXZhbC5mZWVkYmFja0ltYWdlID0gcG5nRGF0YVVybDtcbiAgICAgICAgRXZhbC5lbmNvZGVkRmVlZGJhY2tJbWFnZSA9IGVuY29kZVVSSUNvbXBvbmVudChFdmFsLmZlZWRiYWNrSW1hZ2Uuc3BsaXQoJywnKVsxXSk7XG5cbiAgICAgICAgc3R1ZGlvQXBwLnJlcG9ydChyZXBvcnREYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oRXZhbC5yZXN1bHQgPyAnd2luJyA6ICdmYWlsdXJlJyk7XG59O1xuXG5FdmFsLmNoZWNrRXhhbXBsZXNfID0gZnVuY3Rpb24gKHJlc2V0UGxheXNwYWNlKSB7XG4gIGlmICghbGV2ZWwuZXhhbXBsZXNSZXF1aXJlZCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBleGFtcGxlbGVzcyA9IHN0dWRpb0FwcC5nZXRGdW5jdGlvbldpdGhvdXRUd29FeGFtcGxlcygpO1xuICBpZiAoZXhhbXBsZWxlc3MpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcbiAgICBFdmFsLm1lc3NhZ2UgPSBjb21tb25Nc2cuZW1wdHlFeGFtcGxlQmxvY2tFcnJvck1zZyh7ZnVuY3Rpb25OYW1lOiBleGFtcGxlbGVzc30pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB1bmZpbGxlZCA9IHN0dWRpb0FwcC5nZXRVbmZpbGxlZEZ1bmN0aW9uYWxFeGFtcGxlKCk7XG4gIGlmICh1bmZpbGxlZCkge1xuICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkVYQU1QTEVfRkFJTEVEO1xuXG4gICAgdmFyIG5hbWUgPSB1bmZpbGxlZC5nZXRSb290QmxvY2soKS5nZXRJbnB1dFRhcmdldEJsb2NrKCdBQ1RVQUwnKVxuICAgICAgLmdldFRpdGxlVmFsdWUoJ05BTUUnKTtcbiAgICBFdmFsLm1lc3NhZ2UgPSBjb21tb25Nc2cuZW1wdHlFeGFtcGxlQmxvY2tFcnJvck1zZyh7ZnVuY3Rpb25OYW1lOiBuYW1lfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGZhaWxpbmdCbG9ja05hbWUgPSBzdHVkaW9BcHAuY2hlY2tGb3JGYWlsaW5nRXhhbXBsZXMoZ2V0RXZhbEV4YW1wbGVGYWlsdXJlKTtcbiAgaWYgKGZhaWxpbmdCbG9ja05hbWUpIHtcbiAgICAvLyBDbGVhciB1c2VyIGNhbnZhcywgYXMgdGhpcyBpcyBtZWFudCB0byBiZSBhIHByZS1leGVjdXRpb24gZmFpbHVyZVxuICAgIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoJ3VzZXInKTtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcbiAgICBFdmFsLm1lc3NhZ2UgPSBjb21tb25Nc2cuZXhhbXBsZUVycm9yTWVzc2FnZSh7ZnVuY3Rpb25OYW1lOiBmYWlsaW5nQmxvY2tOYW1lfSk7XG4gICAgcmV0dXJuO1xuICB9XG59O1xuXG4vKipcbiAqIENhbGxpbmcgb3V0ZXJIVE1MIG9uIHN2ZyBlbGVtZW50cyBpbiBzYWZhcmkgZG9lcyBub3Qgd29yay4gSW5zdGVhZCB3ZSBzdGlja1xuICogaXQgaW5zaWRlIGEgZGl2IGFuZCBnZXQgdGhhdCBkaXYncyBpbm5lciBodG1sLlxuICovXG5mdW5jdGlvbiBvdXRlckhUTUwgKGVsZW1lbnQpIHtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuYXBwZW5kQ2hpbGQoZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuZnVuY3Rpb24gaW1hZ2VEYXRhRm9yU3ZnKGVsZW1lbnRJZCkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy53aWR0aCA9IEV2YWwuQ0FOVkFTX1dJRFRIO1xuICBjYW52YXMuaGVpZ2h0ID0gRXZhbC5DQU5WQVNfSEVJR0hUO1xuICBjYW52ZyhjYW52YXMsIG91dGVySFRNTChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SWQpKSk7XG5cbiAgLy8gY2FudmcgYXR0YWNoZXMgYW4gc3ZnIG9iamVjdCB0byB0aGUgY2FudmFzLCBhbmQgYXR0YWNoZXMgYSBzZXRJbnRlcnZhbC5cbiAgLy8gV2UgZG9uJ3QgbmVlZCB0aGlzLCBhbmQgdGhhdCBibG9ja3Mgb3VyIG5vZGUgcHJvY2VzcyBmcm9tIGV4aXR0aW5nIGluXG4gIC8vIHRlc3RzLCBzbyBzdG9wIGl0LlxuICBjYW52YXMuc3ZnLnN0b3AoKTtcblxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIHJldHVybiBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIEV2YWwuQ0FOVkFTX1dJRFRILCBFdmFsLkNBTlZBU19IRUlHSFQpO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBjb250ZW50cyBvZiB0d28gU1ZHIGVsZW1lbnRzIGJ5IGlkXG4gKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzQSBJRCBvZiBjYW52YXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBjYW52YXNCIElEIG9mIGNhbnZhc1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNhbnZhc2VzTWF0Y2goY2FudmFzQSwgY2FudmFzQikge1xuICAvLyBDb21wYXJlIHRoZSBzb2x1dGlvbiBhbmQgdXNlciBjYW52YXNcbiAgdmFyIGltYWdlRGF0YUEgPSBpbWFnZURhdGFGb3JTdmcoY2FudmFzQSk7XG4gIHZhciBpbWFnZURhdGFCID0gaW1hZ2VEYXRhRm9yU3ZnKGNhbnZhc0IpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VEYXRhQS5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKDAgIT09IE1hdGguYWJzKGltYWdlRGF0YUEuZGF0YVtpXSAtIGltYWdlRGF0YUIuZGF0YVtpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG52YXIgZGlzcGxheUZlZWRiYWNrID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgaWYgKEV2YWwucmVzdWx0ID09PSBSZXN1bHRUeXBlLlVOU0VUKSB7XG4gICAgLy8gVGhpcyBjYW4gaGFwcGVuIGlmIHdlIGhpdCByZXNldCBiZWZvcmUgb3VyIGRpYWxvZyBwb3BwZWQgdXAuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gb3ZlcnJpZGUgZXh0cmEgdG9wIGJsb2NrcyBtZXNzYWdlXG4gIGxldmVsLmV4dHJhVG9wQmxvY2tzID0gZXZhbE1zZy5leHRyYVRvcEJsb2NrcygpO1xuXG4gIHZhciB0cnlBZ2FpblRleHQ7XG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRyeUFnYWluVGV4dCA9IGNvbW1vbk1zZy5rZWVwUGxheWluZygpO1xuICB9XG5cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgYXBwOiAnZXZhbCcsXG4gICAgc2tpbjogc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IEV2YWwudGVzdFJlc3VsdHMsXG4gICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICB0cnlBZ2FpblRleHQ6IHRyeUFnYWluVGV4dCxcbiAgICBjb250aW51ZVRleHQ6IGxldmVsLmZyZWVQbGF5ID8gY29tbW9uTXNnLm5leHRQdXp6bGUoKSA6IHVuZGVmaW5lZCxcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSksXG4gICAgLy8gYWxsb3cgdXNlcnMgdG8gc2F2ZSBmcmVlcGxheSBsZXZlbHMgdG8gdGhlaXIgZ2FsbGVyeVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIEV2YWwucmVzcG9uc2UgJiYgRXZhbC5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGZlZWRiYWNrSW1hZ2U6IEV2YWwuZmVlZGJhY2tJbWFnZSxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBldmFsTXNnLnJlaW5mRmVlZGJhY2tNc2coe2JhY2tCdXR0b246IHRyeUFnYWluVGV4dH0pXG4gICAgfVxuICB9O1xuICBpZiAoRXZhbC5tZXNzYWdlICYmICFsZXZlbC5lZGl0X2Jsb2Nrcykge1xuICAgIG9wdGlvbnMubWVzc2FnZSA9IEV2YWwubWVzc2FnZTtcbiAgfVxuICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuZnVuY3Rpb24gb25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSkge1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcblxuICAvLyBBZGQgYSBzaG9ydCBkZWxheSBzbyB0aGF0IHVzZXIgZ2V0cyB0byBzZWUgdGhlaXIgZmluaXNoZWQgZHJhd2luZy5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgZGlzcGxheUZlZWRiYWNrKHJlc3BvbnNlKTtcbiAgfSwgMjAwMCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZSkge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cInN2Z0V2YWxcIj5cXG4gIDxpbWFnZSBpZD1cImJhY2tncm91bmRcIiB2aXNpYmlsaXR5PVwiaGlkZGVuXCIgaGVpZ2h0PVwiNDAwXCIgd2lkdGg9XCI0MDBcIiB4PVwiMFwiIHk9XCIwXCIgPjwvaW1hZ2U+XFxuICA8ZyBpZD1cImFuc3dlclwiPlxcbiAgPC9nPlxcbiAgPGcgaWQ9XCJ1c2VyXCI+XFxuICA8L2c+XFxuICA8ZyBpZD1cInRlc3QtY2FsbFwiPlxcbiAgPC9nPlxcbiAgPGcgaWQ9XCJ0ZXN0LXJlc3VsdFwiPlxcbiAgPC9nPlxcbjwvc3ZnPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGxldmVsLXNwZWNpZmljIHJlcXVpcmVtZW50cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICdldmFsMSc6IHtcbiAgICBzb2x1dGlvbkJsb2NrczogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RhcicsIHtcbiAgICAgICdDT0xPUic6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0cmluZycsIG51bGwsIHsgVkFMOiAnZ3JlZW4nIH0gKSxcbiAgICAgICdTVFlMRSc6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0cmluZycsIG51bGwsIHsgVkFMOiAnc29saWQnIH0pLFxuICAgICAgJ1NJWkUnOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9tYXRoX251bWJlcicsIG51bGwsIHsgTlVNOiAyMDAgfSApXG4gICAgfSksXG4gICAgaWRlYWw6IEluZmluaXR5LFxuICAgIHRvb2xib3g6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfcGx1cycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbWludXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3RpbWVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9kaXZpZGVkYnknKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zdHJpbmcnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3N0eWxlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9jaXJjbGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3RyaWFuZ2xlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zcXVhcmUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3JlY3RhbmdsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfZWxsaXBzZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3RhcicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfcmFkaWFsX3N0YXInKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3BvbHlnb24nKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdwbGFjZV9pbWFnZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ29mZnNldCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ292ZXJsYXknKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCd1bmRlcmxheScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3JvdGF0ZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3NjYWxlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90ZXh0JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnc3RyaW5nX2FwcGVuZCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3N0cmluZ19sZW5ndGgnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2dyZWF0ZXJfdGhhbicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbGVzc190aGFuJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9udW1iZXJfZXF1YWxzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zdHJpbmdfZXF1YWxzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9sb2dpY2FsX2FuZCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbG9naWNhbF9vcicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbG9naWNhbF9ub3QnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2Jvb2xlYW4nKVxuICAgICksXG4gICAgc3RhcnRCbG9ja3M6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0YXInLCB7XG4gICAgICAnQ09MT1InOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ2JsYWNrJyB9ICksXG4gICAgICAnU1RZTEUnOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ3NvbGlkJyB9KSxcbiAgICAgICdTSVpFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInLCBudWxsLCB7IE5VTTogMjAwIH0gKVxuICAgIH0pLFxuICAgIHJlcXVpcmVkQmxvY2tzOiAnJyxcbiAgICBmcmVlUGxheTogZmFsc2VcbiAgfSxcblxuICAnY3VzdG9tJzoge1xuICAgIGFuc3dlcjogJycsXG4gICAgaWRlYWw6IEluZmluaXR5LFxuICAgIHRvb2xib3g6ICcnLFxuICAgIHN0YXJ0QmxvY2tzOiAnJyxcbiAgICByZXF1aXJlZEJsb2NrczogJycsXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZSkge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG4gIHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuICB2YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG47IGJ1Zi5wdXNoKCdcXG5cXG48YnV0dG9uIGlkPVwiY29udGludWVCdXR0b25cIiBjbGFzcz1cImxhdW5jaCBoaWRlIGZsb2F0LXJpZ2h0XCI+XFxuICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDcsICBjb21tb25Nc2cuY29udGludWUoKSApKSwgJ1xcbjwvYnV0dG9uPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBFdmFsIEdyYXBoaWNzXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogRXZhbCBHcmFwaGljcy5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcbnZhciBzaGFyZWRGdW5jdGlvbmFsQmxvY2tzID0gcmVxdWlyZSgnLi4vc2hhcmVkRnVuY3Rpb25hbEJsb2NrcycpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgdmFyIGdlbnN5bSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgTkFNRV9UWVBFID0gYmxvY2tseS5WYXJpYWJsZXMuTkFNRV9UWVBFO1xuICAgIHJldHVybiBnZW5lcmF0b3IudmFyaWFibGVEQl8uZ2V0RGlzdGluY3ROYW1lKG5hbWUsIE5BTUVfVFlQRSk7XG4gIH07XG5cbiAgc2hhcmVkRnVuY3Rpb25hbEJsb2Nrcy5pbnN0YWxsKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltKTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9kaXNwbGF5JyxcbiAgICBibG9ja1RpdGxlOiBtc2cuZGlzcGxheUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnZGlzcGxheScsXG4gICAgcmV0dXJuVHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OT05FLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ0FSRzEnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5PTkUgfSxcbiAgICBdXG4gIH0pO1xuXG4gIC8vIHNoYXBlc1xuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9jaXJjbGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5jaXJjbGVCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ2NpcmNsZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3RyaWFuZ2xlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cudHJpYW5nbGVCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3RyaWFuZ2xlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfc3F1YXJlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3F1YXJlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzcXVhcmUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9yZWN0YW5nbGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5yZWN0YW5nbGVCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3JlY3RhbmdsZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnV0lEVEgnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSEVJR0hUJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfZWxsaXBzZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLmVsbGlwc2VCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ2VsbGlwc2UnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1dJRFRIJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0hFSUdIVCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3N0YXInLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zdGFyQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzdGFyJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfcmFkaWFsX3N0YXInLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5yYWRpYWxTdGFyQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdyYWRpYWxTdGFyJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdQT0lOVFMnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU5ORVInLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnT1VURVInLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9wb2x5Z29uJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucG9seWdvbkJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncG9seWdvbicsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0lERVMnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnTEVOR1RIJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfdGV4dCcsXG4gICAgYmxvY2tUaXRsZTogbXNnLnRleHRCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3RleHQnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1RFWFQnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIC8vIGltYWdlIG1hbmlwdWxhdGlvblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnb3ZlcmxheScsXG4gICAgYmxvY2tUaXRsZTogbXNnLm92ZXJsYXlCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ292ZXJsYXknLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1RPUCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfSxcbiAgICAgIHsgbmFtZTogJ0JPVFRPTScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfSxcbiAgICBdLFxuICAgIHZlcnRpY2FsbHlTdGFja0lucHV0czogdHJ1ZVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAndW5kZXJsYXknLFxuICAgIGJsb2NrVGl0bGU6IG1zZy51bmRlcmxheUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAndW5kZXJsYXknLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ0JPVFRPTScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfSxcbiAgICAgIHsgbmFtZTogJ1RPUCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfVxuICAgIF0sXG4gICAgdmVydGljYWxseVN0YWNrSW5wdXRzOiB0cnVlXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdwbGFjZV9pbWFnZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnBsYWNlSW1hZ2VCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3BsYWNlSW1hZ2UnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1gnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnWScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdJTUFHRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ29mZnNldCcsXG4gICAgYmxvY2tUaXRsZTogbXNnLm9mZnNldEJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnb2Zmc2V0JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdYJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1knLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdyb3RhdGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5yb3RhdGVJbWFnZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncm90YXRlSW1hZ2UnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ0RFR1JFRVMnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdzY2FsZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnNjYWxlSW1hZ2VCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3NjYWxlSW1hZ2UnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ0ZBQ1RPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdJTUFHRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0UgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gc3RyaW5nIG1hbmlwdWxhdGlvblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnc3RyaW5nX2FwcGVuZCcsXG4gICAgYmxvY2tUaXRsZTogbXNnLnN0cmluZ0FwcGVuZEJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3RyaW5nQXBwZW5kJyxcbiAgICByZXR1cm5UeXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdGSVJTVCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdTRUNPTkQnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICAvLyBwb2xsaW5nIGZvciB2YWx1ZXNcbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3N0cmluZ19sZW5ndGgnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zdHJpbmdMZW5ndGhCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3N0cmluZ0xlbmd0aCcsXG4gICAgcmV0dXJuVHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU1RSJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgYmxvY2tseS5GdW5jdGlvbmFsQmxvY2tVdGlscy5pbnN0YWxsU3RyaW5nUGlja2VyKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfc3R5bGUnLFxuICAgIHZhbHVlczogW1xuICAgICAgW21zZy5zb2xpZCgpLCAnc29saWQnXSxcbiAgICAgIFsnNzUlJywgJzc1JSddLFxuICAgICAgWyc1MCUnLCAnNTAlJ10sXG4gICAgICBbJzI1JScsICcyNSUnXSxcbiAgICAgIFttc2cub3V0bGluZSgpLCAnb3V0bGluZSddXG4gICAgXVxuICB9KTtcbn07XG5cblxuZnVuY3Rpb24gaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwgb3B0aW9ucykge1xuICB2YXIgYmxvY2tOYW1lID0gb3B0aW9ucy5ibG9ja05hbWU7XG4gIHZhciBibG9ja1RpdGxlID0gb3B0aW9ucy5ibG9ja1RpdGxlO1xuICB2YXIgYXBpTmFtZSA9IG9wdGlvbnMuYXBpTmFtZTtcbiAgdmFyIGFyZ3MgPSBvcHRpb25zLmFyZ3M7XG4gIHZhciByZXR1cm5UeXBlID0gb3B0aW9ucy5yZXR1cm5UeXBlIHx8IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuSU1BR0U7XG5cbiAgYmxvY2tseS5CbG9ja3NbYmxvY2tOYW1lXSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBibG9ja2x5LkZ1bmN0aW9uYWxCbG9ja1V0aWxzLmluaXRUaXRsZWRGdW5jdGlvbmFsQmxvY2sodGhpcywgYmxvY2tUaXRsZSwgcmV0dXJuVHlwZSwgYXJncywge1xuICAgICAgICB2ZXJ0aWNhbGx5U3RhY2tJbnB1dHM6IG9wdGlvbnMudmVydGljYWxseVN0YWNrSW5wdXRzXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yW2Jsb2NrTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBpQXJncyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFyZyA9IGFyZ3NbaV07XG4gICAgICB2YXIgYXBpQXJnID0gQmxvY2tseS5KYXZhU2NyaXB0LnN0YXRlbWVudFRvQ29kZSh0aGlzLCBhcmcubmFtZSwgZmFsc2UpO1xuICAgICAgLy8gUHJvdmlkZSBkZWZhdWx0c1xuICAgICAgaWYgKCFhcGlBcmcpIHtcbiAgICAgICAgaWYgKGFyZy50eXBlID09PSBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUikge1xuICAgICAgICAgIGFwaUFyZyA9ICcwJztcbiAgICAgICAgfSBlbHNlIGlmIChhcmcubmFtZSA9PT0gJ1NUWUxFJykge1xuICAgICAgICAgIGFwaUFyZyA9IGJsb2NrbHkuSmF2YVNjcmlwdC5xdW90ZV8oJ3NvbGlkJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnLm5hbWUgPT09ICdDT0xPUicpIHtcbiAgICAgICAgICBhcGlBcmcgPSBibG9ja2x5LkphdmFTY3JpcHQucXVvdGVfKCdibGFjaycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhcGlBcmdzLnB1c2goYXBpQXJnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gXCJFdmFsLlwiICsgYXBpTmFtZSArIFwiKFwiICsgYXBpQXJncy5qb2luKFwiLCBcIikgKyBcIilcIjtcbiAgfTtcbn1cbiIsInZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xudmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgRXZhbENpcmNsZSA9IHJlcXVpcmUoJy4vZXZhbENpcmNsZScpO1xudmFyIEV2YWxUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZXZhbFRyaWFuZ2xlJyk7XG52YXIgRXZhbE11bHRpID0gcmVxdWlyZSgnLi9ldmFsTXVsdGknKTtcbnZhciBFdmFsUmVjdCA9IHJlcXVpcmUoJy4vZXZhbFJlY3QnKTtcbnZhciBFdmFsRWxsaXBzZSA9IHJlcXVpcmUoJy4vZXZhbEVsbGlwc2UnKTtcbnZhciBFdmFsVGV4dCA9IHJlcXVpcmUoJy4vZXZhbFRleHQnKTtcbnZhciBFdmFsU3RhciA9IHJlcXVpcmUoJy4vZXZhbFN0YXInKTtcbnZhciBFdmFsUG9seWdvbiA9IHJlcXVpcmUoJy4vZXZhbFBvbHlnb24nKTtcblxuLy8gV2UgZG9uJ3QgdXNlIGJsb2NrSWQgYXQgYWxsIGluIEV2YWwgc2luY2UgZXZlcnl0aGluZyBpcyBldmFsdWF0ZWQgYXQgb25jZS5cblxuZXhwb3J0cy5kaXNwbGF5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBvYmplY3QgPSBcIlwiO1xuICB9XG5cbiAgLy8gY2FsbCB0b2xvY2FsZVN0cmluZyBvbiBudW1iZXJzIHNvIHRoYXQgd2UgZ2V0IGNvbW1hcyBmb3IgbGFyZ2UgbnVtYmVyc1xuICBpZiAodHlwZW9mKG9iamVjdCkgPT09ICdudW1iZXInICYmIG9iamVjdC50b0xvY2FsZVN0cmluZykge1xuICAgIG9iamVjdCA9IG9iamVjdC50b0xvY2FsZVN0cmluZygpO1xuICB9XG5cbiAgaWYgKCFvYmplY3QuZHJhdykge1xuICAgIG9iamVjdCA9IG5ldyBFdmFsVGV4dChvYmplY3QudG9TdHJpbmcoKSwgMTIsICdibGFjaycpO1xuICB9XG4gIEV2YWwuZGlzcGxheWVkT2JqZWN0ID0gb2JqZWN0O1xufTtcblxuZXhwb3J0cy5jaXJjbGUgPSBmdW5jdGlvbiAoc2l6ZSwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbENpcmNsZShzaXplLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy50cmlhbmdsZSA9IGZ1bmN0aW9uIChzaXplLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsVHJpYW5nbGUoc2l6ZSwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMub3ZlcmxheSA9IGZ1bmN0aW9uICh0b3AsIGJvdHRvbSkge1xuICByZXR1cm4gbmV3IEV2YWxNdWx0aSh0b3AsIGJvdHRvbSk7XG59O1xuXG5leHBvcnRzLnVuZGVybGF5ID0gZnVuY3Rpb24gKGJvdHRvbSwgdG9wKSB7XG4gIHJldHVybiBuZXcgRXZhbE11bHRpKHRvcCwgYm90dG9tKTtcbn07XG5cbmV4cG9ydHMuc3F1YXJlID0gZnVuY3Rpb24gKHNpemUsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxSZWN0KHNpemUsIHNpemUsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnJlY3RhbmdsZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsUmVjdCh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5lbGxpcHNlID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxFbGxpcHNlKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnRleHQgPSBmdW5jdGlvbiAodGV4dCwgZm9udFNpemUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFRleHQodGV4dCwgZm9udFNpemUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMuc3RhciA9IGZ1bmN0aW9uIChyYWRpdXMsIHN0eWxlLCBjb2xvcikge1xuICB2YXIgaW5uZXJSYWRpdXMgPSAoMyAtIE1hdGguc3FydCg1KSkgLyAyICogcmFkaXVzO1xuICByZXR1cm4gbmV3IEV2YWxTdGFyKDUsIGlubmVyUmFkaXVzLCByYWRpdXMsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnJhZGlhbFN0YXIgPSBmdW5jdGlvbiAocG9pbnRzLCBpbm5lciwgb3V0ZXIsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxTdGFyKHBvaW50cywgaW5uZXIsIG91dGVyLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5wb2x5Z29uID0gZnVuY3Rpb24gKHBvaW50cywgbGVuZ3RoLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsUG9seWdvbihwb2ludHMsIGxlbmd0aCwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMucGxhY2VJbWFnZSA9IGZ1bmN0aW9uICh4LCB5LCBpbWFnZSkge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHgpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHkpO1xuICBldmFsVXRpbHMuZW5zdXJlVHlwZShpbWFnZSwgRXZhbEltYWdlKTtcblxuICAvLyBvcmlnaW4gYXQgY2VudGVyXG4gIHggPSB4ICsgRXZhbC5DQU5WQVNfV0lEVEggLyAyO1xuICB5ID0geSArIEV2YWwuQ0FOVkFTX0hFSUdIVCAvIDI7XG5cbiAgLy8gVXNlciBpbnB1dHMgeSBpbiBjYXJ0ZXNpYW4gc3BhY2UuIENvbnZlcnQgdG8gcGl4ZWwgc3BhY2UgYmVmb3JlIHNlbmRpbmdcbiAgLy8gdG8gb3VyIEV2YWxJbWFnZS5cbiAgeSA9IGV2YWxVdGlscy5jYXJ0ZXNpYW5Ub1BpeGVsKHkpO1xuXG4gIC8vIHJlbGF0aXZlIHRvIGNlbnRlciBvZiB3b3Jrc3BhY2VcbiAgaW1hZ2UucGxhY2UoeCwgeSk7XG4gIHJldHVybiBpbWFnZTtcbn07XG5cbmV4cG9ydHMub2Zmc2V0ID0gZnVuY3Rpb24gKHgsIHksIGltYWdlKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoeCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoeSk7XG4gIGV2YWxVdGlscy5lbnN1cmVUeXBlKGltYWdlLCBFdmFsSW1hZ2UpO1xuXG4gIHggPSBpbWFnZS54XyArIHg7XG4gIHkgPSBpbWFnZS55XyAtIHk7XG5cbiAgaW1hZ2UucGxhY2UoeCwgeSk7XG4gIHJldHVybiBpbWFnZTtcbn07XG5cbmV4cG9ydHMucm90YXRlSW1hZ2UgPSBmdW5jdGlvbiAoZGVncmVlcywgaW1hZ2UpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihkZWdyZWVzKTtcblxuICBpbWFnZS5yb3RhdGUoZGVncmVlcyk7XG4gIHJldHVybiBpbWFnZTtcbn07XG5cbmV4cG9ydHMuc2NhbGVJbWFnZSA9IGZ1bmN0aW9uIChmYWN0b3IsIGltYWdlKSB7XG4gIGltYWdlLnNjYWxlKGZhY3RvciwgZmFjdG9yKTtcbiAgcmV0dXJuIGltYWdlO1xufTtcblxuZXhwb3J0cy5zdHJpbmdBcHBlbmQgPSBmdW5jdGlvbiAoZmlyc3QsIHNlY29uZCkge1xuICBldmFsVXRpbHMuZW5zdXJlU3RyaW5nKGZpcnN0KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyhzZWNvbmQpO1xuXG4gIHJldHVybiBmaXJzdCArIHNlY29uZDtcbn07XG5cbi8vIHBvbGxpbmcgZm9yIHZhbHVlc1xuZXhwb3J0cy5zdHJpbmdMZW5ndGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHJpbmcoc3RyKTtcblxuICByZXR1cm4gc3RyLmxlbmd0aDtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFRyaWFuZ2xlID0gZnVuY3Rpb24gKGVkZ2UsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGVkZ2UpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy5lZGdlXyA9IGVkZ2U7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbFRyaWFuZ2xlLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxUcmlhbmdsZTtcblxuRXZhbFRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncG9seWdvbicpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIC8vIGNlbnRlciBhdCAwLCAwIChhbGxvd2luZyB0cmFuc2Zvcm1zIHRvIG1vdmUgaXQgYXJvdW5kKVxuICAvLyB0aGUgY2VudGVyIGlzIGhhbGZ3YXkgYmV0d2VlbiB3aWR0aCwgYW5kIGEgdGhpcmQgb2YgdGhlIHdheSB1cCB0aGUgaGVpZ2h0XG4gIHZhciBoZWlnaHQgPSBNYXRoLnNxcnQoMykgLyAyICogdGhpcy5lZGdlXztcblxuICB2YXIgYm90dG9tTGVmdCA9IHtcbiAgICB4OiAtdGhpcy5lZGdlXyAvIDIsXG4gICAgeTogaGVpZ2h0IC8gM1xuICB9O1xuXG4gIHZhciBib3R0b21SaWdodCA9IHtcbiAgICB4OiB0aGlzLmVkZ2VfIC8gMixcbiAgICB5OiBoZWlnaHQgLyAzXG4gIH07XG5cbiAgdmFyIHRvcCA9IHtcbiAgICB4OiAwLFxuICAgIHk6IC1oZWlnaHQgKiAyIC8gM1xuICB9O1xuXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdwb2ludHMnLFxuICAgIGJvdHRvbUxlZnQueCArJywnICsgYm90dG9tTGVmdC55ICsgJyAnICtcbiAgICBib3R0b21SaWdodC54ICsgJywnICsgYm90dG9tUmlnaHQueSArICcgJyArXG4gICAgdG9wLnggKyAnLCcgKyB0b3AueSk7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxUZXh0ID0gZnVuY3Rpb24gKHRleHQsIGZvbnRTaXplLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlU3RyaW5nKHRleHQpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGZvbnRTaXplKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgWydzb2xpZCcsIGNvbG9yXSk7XG5cbiAgdGhpcy50ZXh0XyA9IHRleHQ7XG4gIHRoaXMuZm9udFNpemVfID0gZm9udFNpemU7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbFRleHQuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbFRleHQ7XG5cbkV2YWxUZXh0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndGV4dCcpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuICB0aGlzLmVsZW1lbnRfLnRleHRDb250ZW50ID0gdGhpcy50ZXh0XztcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2ZvbnQtc2l6ZTogJyArIHRoaXMuZm9udFNpemVfICsgJ3B0Jyk7XG5cbiAgdmFyIGJib3ggPSB0aGlzLmVsZW1lbnRfLmdldEJCb3goKTtcbiAgLy8gY2VudGVyIGF0IG9yaWdpblxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneCcsIC1iYm94LndpZHRoIC8gMik7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCd5JywgLWJib3guaGVpZ2h0IC8gMik7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5FdmFsVGV4dC5wcm90b3R5cGUuZ2V0VGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudGV4dF87XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxTdGFyID0gZnVuY3Rpb24gKHBvaW50Q291bnQsIGlubmVyLCBvdXRlciwgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIocG9pbnRDb3VudCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoaW5uZXIpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKG91dGVyKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMub3V0ZXJfID0gb3V0ZXI7XG4gIHRoaXMuaW5uZXJfID0gaW5uZXI7XG4gIHRoaXMucG9pbnRDb3VudF8gPSBwb2ludENvdW50O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxTdGFyLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxTdGFyO1xuXG5FdmFsU3Rhci5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3BvbHlnb24nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICB2YXIgcG9pbnRzID0gW107XG4gIHZhciBvdXRlclJhZGl1cyA9IHRoaXMub3V0ZXJfO1xuICB2YXIgaW5uZXJSYWRpdXMgPSB0aGlzLmlubmVyXztcblxuICB2YXIgYW5nbGVEZWx0YSA9IDIgKiBNYXRoLlBJIC8gdGhpcy5wb2ludENvdW50XztcbiAgZm9yICh2YXIgYW5nbGUgPSAwOyBhbmdsZSA8IDIgKiBNYXRoLlBJOyBhbmdsZSArPSBhbmdsZURlbHRhKSB7XG4gICAgcG9pbnRzLnB1c2gob3V0ZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyBcIixcIiArIG91dGVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGUpKTtcbiAgICBwb2ludHMucHVzaChpbm5lclJhZGl1cyAqIE1hdGguY29zKGFuZ2xlICsgYW5nbGVEZWx0YSAvIDIpICsgXCIsXCIgK1xuICAgICAgaW5uZXJSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSArIGFuZ2xlRGVsdGEgLyAyKSk7XG4gIH1cblxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncG9pbnRzJywgcG9pbnRzLmpvaW4oJyAnKSk7XG4gIGlmICh0aGlzLnBvaW50Q291bnRfICUgMiA9PSAxKSB7XG4gICAgdGhpcy5yb3RhdGUoLTkwIC8gdGhpcy5wb2ludENvdW50Xyk7XG4gIH1cblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFJlY3QgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIod2lkdGgpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGhlaWdodCk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLndpZHRoXyA9IHdpZHRoO1xuICB0aGlzLmhlaWdodF8gPSBoZWlnaHQ7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbFJlY3QuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbFJlY3Q7XG5cbkV2YWxSZWN0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncmVjdCcpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIC8vIGNlbnRlciByZWN0IGF0IDAsIDAuIHdlJ2xsIHVzZSB0cmFuc2Zvcm1zIHRvIG1vdmUgaXQuXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCd4JywgLXRoaXMud2lkdGhfIC8gMik7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCd5JywgLXRoaXMuaGVpZ2h0XyAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoXyk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodF8pO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsUG9seWdvbiA9IGZ1bmN0aW9uIChzaWRlQ291bnQsIGxlbmd0aCwgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoc2lkZUNvdW50KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihsZW5ndGgpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy5yYWRpdXNfID0gbGVuZ3RoIC8gKDIgKiBNYXRoLnNpbihNYXRoLlBJIC8gc2lkZUNvdW50KSk7XG4gIHRoaXMucG9pbnRDb3VudF8gPSBzaWRlQ291bnQ7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbFBvbHlnb24uaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbFBvbHlnb247XG5cbkV2YWxQb2x5Z29uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncG9seWdvbicpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIHZhciBwb2ludHMgPSBbXTtcbiAgdmFyIHJhZGl1cyA9IHRoaXMucmFkaXVzXztcblxuICB2YXIgYW5nbGUgPSAyICogTWF0aC5QSSAvIHRoaXMucG9pbnRDb3VudF87XG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IHRoaXMucG9pbnRDb3VudF87IGkrKykge1xuICAgIHBvaW50cy5wdXNoKHJhZGl1cyAqIE1hdGguY29zKGkgKiBhbmdsZSkgKyBcIixcIiArIHJhZGl1cyAqIE1hdGguc2luKGkgKiBhbmdsZSkpO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIHBvaW50cy5qb2luKCcgJykpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsTXVsdGkgPSBmdW5jdGlvbiAoaW1hZ2UxLCBpbWFnZTIpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UxLCBFdmFsSW1hZ2UpO1xuICBldmFsVXRpbHMuZW5zdXJlVHlwZShpbWFnZTIsIEV2YWxJbWFnZSk7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMpO1xuXG4gIHRoaXMuaW1hZ2UxXyA9IGltYWdlMTtcbiAgdGhpcy5pbWFnZTJfID0gaW1hZ2UyO1xuXG4gIC8vIHdlIHdhbnQgYW4gb2JqZWN0IGNlbnRlcmVkIGF0IDAsIDAgdGhhdCB3ZSBjYW4gdGhlbiBhcHBseSB0cmFuc2Zvcm1zIHRvLlxuICAvLyB0byBhY2NvbXBsaXNoIHRoaXMsIHdlIG5lZWQgdG8gYWRqdXN0IHRoZSBjaGlsZHJlbidzIHgveSdzIHRvIGJlIHJlbGF0aXZlXG4gIC8vIHRvIHVzXG4gIHZhciBkZWx0YVgsIGRlbHRhWTtcbiAgZGVsdGFYID0gdGhpcy5pbWFnZTFfLnhfIC0gdGhpcy54XztcbiAgZGVsdGFZID0gdGhpcy5pbWFnZTFfLnlfIC0gdGhpcy55XztcbiAgdGhpcy5pbWFnZTFfLnVwZGF0ZVBvc2l0aW9uKGRlbHRhWCwgZGVsdGFZKTtcbiAgZGVsdGFYID0gdGhpcy5pbWFnZTJfLnhfIC0gdGhpcy54XztcbiAgZGVsdGFZID0gdGhpcy5pbWFnZTJfLnlfIC0gdGhpcy55XztcbiAgdGhpcy5pbWFnZTJfLnVwZGF0ZVBvc2l0aW9uKGRlbHRhWCwgZGVsdGFZKTtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsTXVsdGkuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbE11bHRpO1xuXG5FdmFsTXVsdGkucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHZhciBkZWx0YVgsIGRlbHRhWTtcblxuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdnJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgdGhpcy5pbWFnZTJfLmRyYXcodGhpcy5lbGVtZW50Xyk7XG4gIHRoaXMuaW1hZ2UxXy5kcmF3KHRoaXMuZWxlbWVudF8pO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS5nZXRDaGlsZHJlbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFt0aGlzLmltYWdlMV8sIHRoaXMuaW1hZ2UyX107XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxDaXJjbGUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIod2lkdGgpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGhlaWdodCk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLndpZHRoXyA9IHdpZHRoO1xuICB0aGlzLmhlaWdodF8gPSBoZWlnaHQ7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbENpcmNsZS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsQ2lyY2xlO1xuXG5FdmFsQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnZWxsaXBzZScpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnY3gnLCAwKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2N5JywgMCk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdyeCcsIHRoaXMud2lkdGhfIC8gMik7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdyeScsIHRoaXMuaGVpZ2h0XyAvIDIpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsQ2lyY2xlID0gZnVuY3Rpb24gKHJhZGl1cywgc3R5bGUsIGNvbG9yKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIocmFkaXVzKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMucmFkaXVzXyA9IHJhZGl1cztcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsQ2lyY2xlLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxDaXJjbGU7XG5cbkV2YWxDaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdjaXJjbGUnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2N4JywgMCk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeScsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncicsIHRoaXMucmFkaXVzXyk7XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5FdmFsQ2lyY2xlLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIE5vLW9wLiBSb3RhdGluZyB0aGUgY2lyY2xlIHN2ZyBnaXZlcyB1cyBzb21lIHByb2JsZW1zIHdoZW4gd2UgY29udmVydCB0b1xuICAvLyBhIGJpdG1hcC5cbn07XG4iLCJ2YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxJbWFnZSA9IGZ1bmN0aW9uIChzdHlsZSwgY29sb3IpIHtcbiAgLy8geC95IGxvY2F0aW9uIGluIHBpeGVsIHNwYWNlIG9mIG9iamVjdCdzIGNlbnRlclxuICB0aGlzLnhfID0gMjAwO1xuICB0aGlzLnlfID0gMjAwO1xuXG4gIHRoaXMucm90YXRpb25fID0gMDtcbiAgdGhpcy5zY2FsZVhfID0gMS4wO1xuICB0aGlzLnNjYWxlWSA9IDEuMDtcblxuICB0aGlzLnN0eWxlXyA9IHN0eWxlO1xuICB0aGlzLmNvbG9yXyA9IGNvbG9yO1xufTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbEltYWdlO1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdGhpcy54XyA9IHg7XG4gIHRoaXMueV8gPSB5O1xufTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudEVsZW1lbnQpIHtcbiAgaWYgKHRoaXMuc3R5bGVfICYmIHRoaXMuY29sb3JfKSB7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBldmFsVXRpbHMuZ2V0RmlsbCh0aGlzLnN0eWxlXywgdGhpcy5jb2xvcl8pKTtcbiAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgZXZhbFV0aWxzLmdldFN0cm9rZSh0aGlzLnN0eWxlXywgdGhpcy5jb2xvcl8pKTtcbiAgICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIGV2YWxVdGlscy5nZXRPcGFjaXR5KHRoaXMuc3R5bGVfLCB0aGlzLmNvbG9yXykpO1xuICB9XG5cbiAgdmFyIHRyYW5zZm9ybSA9IFwiXCI7XG4gIHRyYW5zZm9ybSArPSBcIiB0cmFuc2xhdGUoXCIgKyB0aGlzLnhfICsgXCIgXCIgKyB0aGlzLnlfICsgXCIpXCI7XG5cbiAgaWYgKHRoaXMuc2NhbGVYXyAhPT0gMS4wIHx8IHRoaXMuc2NhbGVZICE9PSAxLjApIHtcbiAgICB0cmFuc2Zvcm0gKz0gXCIgc2NhbGUoXCIgKyB0aGlzLnNjYWxlWF8gKyBcIiBcIiArIHRoaXMuc2NhbGVZXyArIFwiKVwiO1xuICB9XG5cbiAgaWYgKHRoaXMucm90YXRpb25fICE9PSAwKSB7XG4gICAgdHJhbnNmb3JtICs9IFwiIHJvdGF0ZShcIiArIHRoaXMucm90YXRpb25fICsgXCIpXCI7XG4gIH1cblxuICBpZiAodHJhbnNmb3JtID09PSBcIlwiKSB7XG4gICAgdGhpcy5lbGVtZW50Xy5yZW1vdmVBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtKTtcbiAgfVxufTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS5wbGFjZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueF8gPSB4O1xuICB0aGlzLnlfID0geTtcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgdGhpcy5yb3RhdGlvbl8gKz0gZGVncmVlcztcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbiAoc2NhbGVYLCBzY2FsZVkpIHtcbiAgdGhpcy5zY2FsZVhfID0gc2NhbGVYO1xuICB0aGlzLnNjYWxlWV8gPSBzY2FsZVk7XG59O1xuXG4vKipcbiAqIEdldCBjaGlsZCBFdmFsT2JqZWN0cy4gb3ZlcnJpZGRlbiBieSBjaGlsZHJlblxuICovXG5FdmFsSW1hZ2UucHJvdG90eXBlLmdldENoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gW107XG59O1xuIiwidmFyIEN1c3RvbUV2YWxFcnJvciA9IHJlcXVpcmUoJy4vZXZhbEVycm9yJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxuLyoqXG4gKiBUaHJvd3MgYW4gZXhwZWN0aW9uIGlmIHZhbCBpcyBub3Qgb2YgdGhlIGV4cGVjdGVkIHR5cGUuIFR5cGUgaXMgZWl0aGVyIGFcbiAqIHN0cmluZyAobGlrZSBcIm51bWJlclwiIG9yIFwic3RyaW5nXCIpIG9yIGFuIG9iamVjdCAoTGlrZSBFdmFsSW1hZ2UpLlxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVTdHJpbmcgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBtb2R1bGUuZXhwb3J0cy5lbnN1cmVUeXBlKHZhbCwgXCJzdHJpbmdcIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVOdW1iZXIgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBtb2R1bGUuZXhwb3J0cy5lbnN1cmVUeXBlKHZhbCwgXCJudW1iZXJcIik7XG59O1xuXG4vKipcbiAqIFN0eWxlIGlzIGVpdGhlciBcInNvbGlkXCIsIFwib3V0bGluZVwiLCBvciBhIHBlcmNlbnRhZ2UgaS5lLiBcIjcwJVwiXG4gKi9cbm1vZHVsZS5leHBvcnRzLmVuc3VyZVN0eWxlID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodmFsLnNsaWNlKC0xKSA9PT0gJyUnKSB7XG4gICAgdmFyIG9wYWNpdHkgPSBtb2R1bGUuZXhwb3J0cy5nZXRPcGFjaXR5KHZhbCk7XG4gICAgaWYgKG9wYWNpdHkgPj0gMCAmJiBvcGFjaXR5IDw9IDEuMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBpZiAoXy5jb250YWlucyhbJ291dGxpbmUnLCAnc29saWQnXSwgdmFsKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aHJvdyBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLkJhZFN0eWxlLCB2YWwpO1xufTtcblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIHRoaXMgaXMgYSB2YWxpZCBjb2xvciwgdGhyb3dpbmcgaWYgaXQgaXNudC4gQ29sb3IgdmFsaWRpdHlcbiAqIGlzIGRldGVybWluZWQgYnkgc2V0dGluZyB0aGUgdmFsdWUgb24gYW4gaHRtbCBlbGVtZW50IGFuZCBzZWVpbmcgaWYgaXQgdGFrZXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzLmVuc3VyZUNvbG9yID0gZnVuY3Rpb24gKHZhbCkge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlLnN0eWxlLmNvbG9yID0gdmFsO1xuICAvLyBXZSBjYW4ndCBjaGVjayB0aGF0IGUuc3R5bGUuY29sb3IgPT09IHZhbCwgc2luY2Ugc29tZSB2YWxzIHdpbGwgYmVcbiAgLy8gdHJhbnNmb3JtZWQgKGkuZS4gI2ZmZiAtPiByZ2IoMjU1LCAyNTUsIDI1NSlcbiAgaWYgKCFlLnN0eWxlLmNvbG9yKSB7XG4gICAgdGhyb3cgbmV3IEN1c3RvbUV2YWxFcnJvcihDdXN0b21FdmFsRXJyb3IuVHlwZS5CYWRDb2xvciwgdmFsKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0gdmFsXG4gKiBAcGFyYW0ge3N0cmluZ3xDbGFzc30gdHlwZVxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVUeXBlID0gZnVuY3Rpb24gKHZhbCwgdHlwZSkge1xuICBpZiAodHlwZW9mKHR5cGUpID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKHR5cGVvZih2YWwpICE9PSB0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHBlY3RlZCB0eXBlOiBcIiArIHR5cGUgKyBcIlxcbmdvdCB0eXBlOiBcIiArIHR5cGVvZih2YWwpKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoISh2YWwgaW5zdGFuY2VvZiB0eXBlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgb2JqZWN0XCIpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXRGaWxsID0gZnVuY3Rpb24gKHN0eWxlLCBjb2xvcikge1xuICBpZiAoc3R5bGUgPT09ICdvdXRsaW5lJykge1xuICAgIHJldHVybiBcIm5vbmVcIjtcbiAgfVxuICAvLyBmb3Igbm93LCB3ZSB0cmVhdCBhbnl0aGluZyB3ZSBkb24ndCByZWNvZ25pemUgYXMgc29saWQuXG4gIHJldHVybiBjb2xvcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldFN0cm9rZSA9IGZ1bmN0aW9uIChzdHlsZSwgY29sb3IpIHtcbiAgaWYgKHN0eWxlID09PSBcIm91dGxpbmVcIikge1xuICAgIHJldHVybiBjb2xvcjtcbiAgfVxuICByZXR1cm4gXCJub25lXCI7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgb3BhY2l0eSBmcm9tIHRoZSBzdHlsZS4gU3R5bGUgaXMgYSBzdHJpbmcgdGhhdCBpcyBlaXRoZXIgYSB3b3JkIG9yXG4gKiBwZXJjZW50YWdlIChpLmUuIDI1JSkuXG4gKi9cbm1vZHVsZS5leHBvcnRzLmdldE9wYWNpdHkgPSBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgdmFyIGFscGhhID0gMS4wO1xuICBpZiAoc3R5bGUuc2xpY2UoLTEpID09PSBcIiVcIikge1xuICAgIGFscGhhID0gcGFyc2VJbnQoc3R5bGUuc2xpY2UoMCwgLTEpLCAxMCkgLyAxMDA7XG4gIH1cbiAgcmV0dXJuIGFscGhhO1xufTtcblxuLyoqXG4gKiBVc2VycyBzcGVjaWZ5IHBpeGVscyBpbiBhIGNvb3JkaW5hdGUgc3lzdGVtIHdoZXJlIHRoZSBvcmlnaW4gaXMgYXQgdGhlIGJvdHRvbVxuICogbGVmdCwgYW5kIHggYW5kIHkgaW5jcmVhc2UgYXMgeW91IG1vdmUgcmlnaHQvdXAuIEknbSByZWZlcnJpbmcgdG8gdGhpcyBhc1xuICogdGhlIGNhcnRlc2lhbiBjb29yZGluYXRlIHN5c3RlbS5cbiAqIFRoZSBwaXhlbCBjb29yZGluYXRlIHN5c3RlbSBpbnN0ZWFkIGhhcyBvcmlnaW4gYXQgdGhlIHRvcCBsZWZ0LCBhbmQgeCBhbmQgeVxuICogaW5jcmVhc2UgYXMgeW91IG1vdmUgcmlnaHQvZG93bi5cbiAqL1xubW9kdWxlLmV4cG9ydHMuY2FydGVzaWFuVG9QaXhlbCA9IGZ1bmN0aW9uIChjYXJ0ZXNpYW5ZKSB7XG4gIHJldHVybiA0MDAgLSBjYXJ0ZXNpYW5ZO1xufTtcbiIsInZhciBldmFsTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxuLyoqXG4gKiBBbiBFdmFsIGVycm9yIGluZGljYXRpbmcgdGhhdCBzb21ldGhpbmcgYmFkIGhhcHBlbmVkLCBidXQgd2UgdW5kZXJzdGFuZFxuICogdGhlIGJhZCBhbmQgd2FudCBvdXIgYXBwIHRvIGhhbmRsZSBpdCAoaS5lLiB1c2VyIHVzZWQgYW4gaW52YWxpZCBzdHlsZVxuICogc3RyaW5nIGFuZCB3ZSB3YW50IHRvIGRpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZSkuXG4gKi9cbnZhciBDdXN0b21FdmFsRXJyb3IgPSBmdW5jdGlvbiAodHlwZSwgdmFsKSB7XG4gIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBDdXN0b21FdmFsRXJyb3IuVHlwZS5CYWRTdHlsZTpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWdlID0gZXZhbE1zZy5iYWRTdHlsZVN0cmluZ0Vycm9yKHt2YWw6IHZhbH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDdXN0b21FdmFsRXJyb3IuVHlwZS5CYWRDb2xvcjpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWdlID0gZXZhbE1zZy5iYWRDb2xvclN0cmluZ0Vycm9yKHt2YWw6IHZhbH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDdXN0b21FdmFsRXJyb3IuVHlwZS5JbmZpbml0ZVJlY3Vyc2lvbjpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWdlID0gZXZhbE1zZy5pbmZpbml0ZVJlY3Vyc2lvbkVycm9yKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEN1c3RvbUV2YWxFcnJvci5UeXBlLlVzZXJDb2RlRXhjZXB0aW9uOlxuICAgICAgdGhpcy5mZWVkYmFja01lc3NhZ2UgPSBldmFsTXNnLnVzZXJDb2RlRXhjZXB0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy5mZWVkYmFja01lc3NhZyA9ICcnO1xuICAgICAgYnJlYWs7XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IEN1c3RvbUV2YWxFcnJvcjtcblxuQ3VzdG9tRXZhbEVycm9yLlR5cGUgPSB7XG4gIEJhZFN0eWxlOiAwLFxuICBCYWRDb2xvcjogMSxcbiAgSW5maW5pdGVSZWN1cnNpb246IDIsXG4gIFVzZXJDb2RlRXhjZXB0aW9uOiAzXG59O1xuIiwiLy8gbG9jYWxlIGZvciBldmFsXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuZXZhbF9sb2NhbGU7XG4iXX0=
