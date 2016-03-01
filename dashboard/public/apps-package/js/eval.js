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

  var renderCodeApp = function renderCodeApp() {
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
  };

  React.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    requireLandscape: !(config.share || config.embed),
    renderCodeApp: renderCodeApp,
    onMount: studioApp.init.bind(studioApp, config)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ldmFsL21haW4uanMiLCJidWlsZC9qcy9ldmFsL2V2YWwuanMiLCJidWlsZC9qcy9ldmFsL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2xldmVscy5qcyIsImJ1aWxkL2pzL2V2YWwvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ldmFsL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2V2YWwvYXBpLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsVHJpYW5nbGUuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxUZXh0LmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsU3Rhci5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbFJlY3QuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxQb2x5Z29uLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsTXVsdGkuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxFbGxpcHNlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsQ2lyY2xlLmpzIiwiYnVpbGQvanMvZXZhbC9ldmFsSW1hZ2UuanMiLCJidWlsZC9qcy9ldmFsL2V2YWxVdGlscy5qcyIsImJ1aWxkL2pzL2V2YWwvZXZhbEVycm9yLmpzIiwiYnVpbGQvanMvZXZhbC9sb2NhbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLFFBQVEsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNsQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDdkMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ01GLFlBQVksQ0FBQzs7QUFFYixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDOzs7OztBQUsxQixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDMUIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDbEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDakQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3QyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVoQyxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7Ozs7QUFJeEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3QixJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsRUFBRTtBQUNyQyxTQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxJQUFJLEtBQUssQ0FBQztBQUNWLElBQUksSUFBSSxDQUFDOztBQUVULFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7QUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7OztBQUd4QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQzs7QUFFNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7O0FBRXpCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7Ozs7O0FBS2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBUyxNQUFNLEVBQUU7QUFDM0IsV0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFMUQsTUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbkIsT0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXJCLFFBQU0sQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7QUFDdkMsUUFBTSxDQUFDLG1CQUFtQixHQUFHLG9CQUFvQixDQUFDO0FBQ2xELFFBQU0sQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDOzs7QUFHOUIsUUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ2hDLFFBQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFFBQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUNqQyxRQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRTdCLFFBQU0sQ0FBQyxTQUFTLEdBQUcsWUFBVztBQUM1QixhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUMsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztHQUNuRCxDQUFDOztBQUVGLFFBQU0sQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUM5QixRQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxHQUFHLEVBQUU7QUFDUixZQUFNLHdCQUF3QixDQUFDO0tBQ2hDO0FBQ0QsT0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdDLE9BQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzs7Ozs7QUFLL0MsV0FBTyxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQzs7OztBQUl0QyxXQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVqRCxRQUFJLEtBQUssQ0FBQyx3QkFBd0IsRUFBRTtBQUNsQyxVQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZELGdCQUFVLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLFlBQVksRUFDcEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7QUFDdEMsZUFBUyxDQUFDLDhCQUE4QixDQUFDO0FBQ3ZDLFdBQUcsRUFBRSxTQUFTO0FBQ2QsY0FBTSxFQUFFLENBQUMsR0FBRztBQUNaLGtCQUFVLEVBQUUsQ0FBQyxHQUFHO0FBQ2hCLGlCQUFTLEVBQUUsR0FBRztBQUNkLGlCQUFTLEVBQUUsR0FBRztPQUNmLENBQUMsQ0FBQztBQUNMLGdCQUFVLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNsRDs7QUFFRCxRQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDeEIsVUFBSSxjQUFjLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQ3RFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztBQUU5QixVQUFJLFlBQVksR0FBRyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzRCxVQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFOztBQUVyQyxZQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNqQyxvQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7T0FDdEQ7S0FDRjs7O0FBR0QsUUFBSSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekUsdUJBQW1CLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7OztBQUcxQyxRQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3pELE9BQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRTNELFFBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtBQUMxQixhQUFPLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEUsYUFBTyxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3RFO0dBQ0YsQ0FBQzs7QUFFRixNQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQWU7QUFDOUIsV0FBTyxJQUFJLENBQUM7QUFDVixjQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7QUFDNUIsVUFBSSxFQUFFO0FBQ0osdUJBQWUsRUFBRSxTQUFTLENBQUMsZUFBZSxFQUFFO0FBQzVDLHFCQUFhLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7QUFDcEQsZ0JBQVEsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN2QyxrQkFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO1NBQzdCLENBQUM7QUFDRixpQkFBUyxFQUFHLFNBQVM7QUFDckIsd0JBQWdCLEVBQUcsU0FBUztBQUM1QixnQkFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0FBQ3hCLHlCQUFpQixFQUFHLHVCQUF1QjtBQUMzQyx5QkFBaUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCO09BQzVDO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQzs7QUFFRixPQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ3hDLFlBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtBQUM1QixvQkFBZ0IsRUFBRSxFQUFFLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQSxBQUFDO0FBQ2pELGlCQUFhLEVBQUUsYUFBYTtBQUM1QixXQUFPLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQztHQUNoRCxDQUFDLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztDQUNsRCxDQUFDOzs7Ozs7OztBQVFGLFNBQVMscUJBQXFCLENBQUMsWUFBWSxFQUFFLG1CQUFtQixFQUFFO0FBQ2hFLE1BQUksbUJBQW1CLEVBQUU7QUFDdkIsYUFBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDeEIsUUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hDOztBQUVELG1CQUFpQixFQUFFLENBQUM7QUFDcEIsdUJBQXFCLEVBQUUsQ0FBQzs7QUFFeEIsTUFBSSxPQUFPLENBQUM7QUFDWixNQUFJO0FBQ0YsUUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdELFFBQUksYUFBYSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqRSxRQUFJLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRCxRQUFJLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFekQsYUFBUyxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRTVFLFFBQUksQ0FBQyxZQUFZLElBQUksWUFBWSxZQUFZLGVBQWUsRUFBRTtBQUM1RCxZQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDdkM7O0FBRUQsUUFBSSxDQUFDLGNBQWMsSUFBSSxjQUFjLFlBQVksZUFBZSxFQUFFO0FBQ2hFLFlBQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUN6Qzs7QUFFRCxnQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDeEQsa0JBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOztBQUU1RCxXQUFPLEdBQUcsYUFBYSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsR0FBRyxJQUFJLEdBQ3hELDJCQUEyQixDQUFDO0dBRS9CLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxXQUFPLEdBQUcsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztHQUMvQzs7QUFFRCxNQUFJLG1CQUFtQixFQUFFO0FBQ3ZCLG1CQUFlLEVBQUUsQ0FBQztHQUNuQixNQUFNO0FBQ0wsdUJBQW1CLEVBQUUsQ0FBQztHQUN2QjtBQUNELFNBQU8sT0FBTyxDQUFDO0NBQ2hCOztBQUVELFNBQVMsaUJBQWlCLEdBQUc7QUFDM0IsTUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztDQUN2Qzs7QUFFRCxTQUFTLG1CQUFtQixHQUFHO0FBQzdCLFVBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDMUQsVUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUM1RCxVQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0NBQy9EOztBQUVELFNBQVMsZUFBZSxHQUFHO0FBQ3pCLFVBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDekQsVUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUM1RCxVQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ2hFOztBQUVELFNBQVMscUJBQXFCLEdBQUc7QUFDL0IsVUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN6RCxVQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQzdELFVBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDaEU7Ozs7O0FBS0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFXO0FBQy9CLFdBQVMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbEMsU0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsV0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNoQixDQUFDOztBQUVGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLFFBQVEsRUFBRTtBQUMzQyxNQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hELFNBQU8sT0FBTyxDQUFDLFVBQVUsRUFBRTtBQUN6QixXQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUN6QztDQUNGLENBQUM7Ozs7O0FBS0YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVk7QUFDbEMscUJBQW1CLEVBQUUsQ0FBQztBQUN0QixNQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsTUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUNqQyxNQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7QUFDL0IsTUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO0FBQzVDLE1BQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0NBQzFCLENBQUM7Ozs7Ozs7QUFPRixTQUFTLFFBQVEsQ0FBRSxJQUFJLEVBQUU7QUFDdkIsTUFBSTtBQUNGLFdBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3JCLGVBQVMsRUFBRSxTQUFTO0FBQ3BCLFVBQUksRUFBRSxHQUFHO0tBQ1YsQ0FBQyxDQUFDOztBQUVILFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDbEMsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsV0FBTyxNQUFNLENBQUM7R0FDZixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsUUFBSSxDQUFDLFlBQVksZUFBZSxFQUFFO0FBQ2hDLGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7QUFDRCxRQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQyxhQUFPLElBQUksZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDMUU7Ozs7QUFJRCxRQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDbEIsWUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFEO0FBQ0QsUUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUMxQixhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCOztBQUVELFdBQU8sSUFBSSxlQUFlLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUMxRTtDQUNGOzs7Ozs7QUFNRCxTQUFTLHlCQUF5QixHQUFHO0FBQ25DLE1BQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0FBQzdHLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELFNBQVMsb0JBQW9CLENBQUMsS0FBSyxFQUFFO0FBQ25DLE1BQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0FBQ2pHLE1BQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDdEUsTUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxNQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBSSxtQkFBbUIsR0FBRyxlQUFlLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQztBQUM1RCxNQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLG1CQUFtQixDQUFDO0FBQzdFLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLGtCQUFrQixDQUFDLENBQUM7QUFDbEUsU0FBTyxNQUFNLENBQUM7Q0FDZjs7Ozs7Ozs7QUFRRCxTQUFTLHVCQUF1QixDQUFDLFFBQVEsRUFBRTtBQUN6QyxNQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN0RCxVQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxHQUN6RSx5Q0FBeUMsQ0FBQyxDQUFDO0dBQzlDOztBQUVELFdBQVMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRS9CLE1BQUksTUFBTSxHQUFHLHlCQUF5QixFQUFFLENBQUM7OztBQUd6QyxTQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUFFLEtBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUFFLENBQUMsQ0FBQzs7QUFFN0UsU0FBTyxNQUFNLENBQUM7Q0FDZjs7Ozs7O0FBTUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFVBQVUsVUFBVSxFQUFFO0FBQ3JELE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixXQUFPLEVBQUUsQ0FBQztHQUNYOztBQUVELE1BQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLE1BQUksVUFBVSxZQUFZLFFBQVEsRUFBRTtBQUNsQyxRQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQ2pDOztBQUVELFlBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDaEQsUUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDM0QsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7QUFNRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ25ELE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRCxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXBELE1BQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2pDLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsT0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2IsT0FBSyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUViLE1BQUksWUFBWSxHQUFHLEtBQUssQ0FBQzs7QUFFekIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixRQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDakIsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQzdDLG9CQUFZLEdBQUksSUFBSSxDQUFDO09BQ3RCLE1BQU07QUFDTCxlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0Y7R0FDRjtBQUNELFNBQU8sWUFBWSxDQUFDO0NBQ3JCLENBQUM7Ozs7Ozs7QUFPRixJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ3RELE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRCxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXBELE1BQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDNUMsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxNQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVyQixNQUFJLEFBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLLEtBQUssT0FBTyxJQUNyQyxLQUFLLEtBQUssT0FBTyxJQUFJLEtBQUssS0FBSyxNQUFNLEFBQUMsRUFBRTtBQUMzQyxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQzs7Ozs7QUFLRixJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVc7QUFDeEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztBQUM1QyxNQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFekIsTUFBSSxTQUFTLENBQUMsMEJBQTBCLEVBQUUsRUFBRTtBQUMxQyxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztBQUN0RCxRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0dBQ2hGLE1BQU0sSUFBSSxTQUFTLENBQUMsNkJBQTZCLEVBQUUsRUFBRTtBQUNwRCxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyw4QkFBOEIsQ0FBQztHQUMvRCxNQUFNLElBQUksU0FBUyxDQUFDLDhCQUE4QixFQUFFLEVBQUU7QUFDckQsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUM7QUFDbkQsUUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7R0FDNUMsTUFBTTtBQUNMLHFCQUFpQixFQUFFLENBQUM7QUFDcEIsdUJBQW1CLEVBQUUsQ0FBQztBQUN0QixRQUFJLFVBQVUsR0FBRyx5QkFBeUIsRUFBRSxDQUFDO0FBQzdDLFFBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDakMsZ0JBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ2xEOzs7QUFHRCxRQUFJLFVBQVUsWUFBWSxlQUFlLEVBQUU7QUFDekMsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsVUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUM7QUFDakQsVUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDO0tBQzNDLE1BQU0sSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUNoRSxVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixVQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztBQUNqRCxVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0tBQzlDLE1BQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUNuRSxVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixVQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztBQUNqRCxVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzVDLE1BQU07QUFDTCxVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7OztBQUd0QixVQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRTtBQUNwQyxZQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDOUMsWUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMxRDs7QUFFRCxVQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDbEIsWUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsWUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO09BQzFDO0tBQ0Y7R0FDRjs7QUFFRCxNQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTVDLE1BQUksVUFBVSxHQUFHO0FBQ2YsT0FBRyxFQUFFLE1BQU07QUFDWCxTQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDZixXQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87QUFDdEIsVUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ25CLGNBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM1QixXQUFPLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLGNBQVUsRUFBRSxnQkFBZ0I7QUFDNUIsU0FBSyxFQUFFLElBQUksQ0FBQyxvQkFBb0I7R0FDakMsQ0FBQzs7OztBQUlGLE1BQUksT0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUU7QUFDdkUsYUFBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM5QixNQUFNO0FBQ0wsWUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO0FBQ3hELGNBQVEsRUFBRSxrQkFBUyxVQUFVLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUM7QUFDaEMsWUFBSSxDQUFDLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpGLGlCQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzlCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsV0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQztDQUN0RCxDQUFDOztBQUVGLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxjQUFjLEVBQUU7QUFDOUMsTUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtBQUMzQixXQUFPO0dBQ1I7O0FBRUQsTUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLDZCQUE2QixFQUFFLENBQUM7QUFDNUQsTUFBSSxXQUFXLEVBQUU7QUFDZixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUM7QUFDOUMsUUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMseUJBQXlCLENBQUMsRUFBQyxZQUFZLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztBQUNoRixXQUFPO0dBQ1I7O0FBRUQsTUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLDRCQUE0QixFQUFFLENBQUM7QUFDeEQsTUFBSSxRQUFRLEVBQUU7QUFDWixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUM7O0FBRTlDLFFBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FDN0QsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLHlCQUF5QixDQUFDLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDekUsV0FBTztHQUNSOztBQUVELE1BQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEYsTUFBSSxnQkFBZ0IsRUFBRTs7QUFFcEIsUUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQztBQUM5QyxRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUM7QUFDL0UsV0FBTztHQUNSO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsU0FBUyxTQUFTLENBQUUsT0FBTyxFQUFFO0FBQzNCLE1BQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEMsS0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekMsU0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDO0NBQ3RCOztBQUVELFNBQVMsZUFBZSxDQUFDLFNBQVMsRUFBRTtBQUNsQyxNQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNqQyxRQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDbkMsT0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0FBSzdELFFBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWxCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsU0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDdEU7Ozs7Ozs7O0FBUUQsU0FBUyxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTs7QUFFdkMsTUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLE1BQUksVUFBVSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFMUMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQy9DLFFBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDM0QsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7O0FBTUQsSUFBSSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFZLFFBQVEsRUFBRTtBQUN2QyxNQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRTs7QUFFcEMsV0FBTztHQUNSOzs7QUFHRCxPQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFaEQsTUFBSSxZQUFZLENBQUM7QUFDakIsTUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ2xCLGdCQUFZLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0dBQ3hDOztBQUVELE1BQUksT0FBTyxHQUFHO0FBQ1osT0FBRyxFQUFFLE1BQU07QUFDWCxRQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDYixnQkFBWSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQzlCLFlBQVEsRUFBRSxRQUFRO0FBQ2xCLFNBQUssRUFBRSxLQUFLO0FBQ1osZ0JBQVksRUFBRSxZQUFZO0FBQzFCLGdCQUFZLEVBQUUsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLEdBQUcsU0FBUztBQUNqRSxrQkFBYyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSyxLQUFLLENBQUMsUUFBUSxBQUFDOztBQUV6RCxvQkFBZ0IsRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUI7QUFDdEYsaUJBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUNqQyxjQUFVLEVBQUU7QUFDVixzQkFBZ0IsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFDLENBQUM7S0FDdkU7R0FDRixDQUFDO0FBQ0YsTUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtBQUN0QyxXQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7R0FDaEM7QUFDRCxXQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3BDLENBQUM7Ozs7OztBQU1GLFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFOztBQUVsQyxNQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JELFdBQVMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOzs7QUFHM0IsWUFBVSxDQUFDLFlBQVk7QUFDckIsbUJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUMzQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ1Y7OztBQzVvQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25CQSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7O0FBSzNDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixTQUFPLEVBQUU7QUFDUCxrQkFBYyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUU7QUFDekQsYUFBTyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFFO0FBQzlFLGFBQU8sRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM3RSxZQUFNLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUU7S0FDL0UsQ0FBQztBQUNGLFNBQUssRUFBRSxRQUFRO0FBQ2YsV0FBTyxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQy9CLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsR0FDekMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUMxQyxVQUFVLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEdBQzFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsR0FDOUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUNoRCxVQUFVLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQzNDLFVBQVUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsR0FDMUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUMzQyxVQUFVLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEdBQzdDLFVBQVUsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsR0FDM0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUM5QyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQzVDLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsR0FDekMsVUFBVSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUNoRCxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQzVDLFVBQVUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEdBQ3JDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQ2hDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQ2pDLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQ2xDLFVBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQ2hDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQy9CLFVBQVUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsR0FDekMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsR0FDdkMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsR0FDdkMsVUFBVSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxHQUNqRCxVQUFVLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLEdBQzlDLFVBQVUsQ0FBQyxXQUFXLENBQUMsMEJBQTBCLENBQUMsR0FDbEQsVUFBVSxDQUFDLFdBQVcsQ0FBQywwQkFBMEIsQ0FBQyxHQUNsRCxVQUFVLENBQUMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQ2hELFVBQVUsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsR0FDL0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUNoRCxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQzdDO0FBQ0QsZUFBVyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUU7QUFDdEQsYUFBTyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFFO0FBQzlFLGFBQU8sRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM3RSxZQUFNLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUU7S0FDL0UsQ0FBQztBQUNGLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztHQUNoQjs7QUFFRCxVQUFRLEVBQUU7QUFDUixVQUFNLEVBQUUsRUFBRTtBQUNWLFNBQUssRUFBRSxRQUFRO0FBQ2YsV0FBTyxFQUFFLEVBQUU7QUFDWCxlQUFXLEVBQUUsRUFBRTtBQUNmLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztHQUNoQjtDQUNGLENBQUM7OztBQ2pFRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQ0EsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXJDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2QyxJQUFJLHNCQUFzQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOzs7QUFHbEUsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFTLE9BQU8sRUFBRSxtQkFBbUIsRUFBRTtBQUN2RCxNQUFJLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7O0FBRXBDLE1BQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFNBQU8sQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDOztBQUUvQixNQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBWSxJQUFJLEVBQUU7QUFDMUIsUUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDNUMsV0FBTyxTQUFTLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDL0QsQ0FBQzs7QUFFRix3QkFBc0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFM0Qsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLG9CQUFvQjtBQUMvQixjQUFVLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixFQUFFO0FBQ25DLFdBQU8sRUFBRSxTQUFTO0FBQ2xCLGNBQVUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUk7QUFDdkMsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUNwRDtHQUNGLENBQUMsQ0FBQzs7O0FBR0gsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLG1CQUFtQjtBQUM5QixjQUFVLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLFdBQU8sRUFBRSxRQUFRO0FBQ2pCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDckQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQ3ZEO0dBQ0YsQ0FBQyxDQUFDOztBQUVILHdCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2pELGFBQVMsRUFBRSxxQkFBcUI7QUFDaEMsY0FBVSxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtBQUNwQyxXQUFPLEVBQUUsVUFBVTtBQUNuQixRQUFJLEVBQUUsQ0FDSixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3JELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUN2RDtHQUNGLENBQUMsQ0FBQzs7QUFFSCx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtBQUNqRCxhQUFTLEVBQUUsbUJBQW1CO0FBQzlCLGNBQVUsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsV0FBTyxFQUFFLFFBQVE7QUFDakIsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUNyRCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3RELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FDdkQ7R0FDRixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLHNCQUFzQjtBQUNqQyxjQUFVLEVBQUUsR0FBRyxDQUFDLG1CQUFtQixFQUFFO0FBQ3JDLFdBQU8sRUFBRSxXQUFXO0FBQ3BCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN2RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3RELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FDdkQ7R0FDRixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLG9CQUFvQjtBQUMvQixjQUFVLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixFQUFFO0FBQ25DLFdBQU8sRUFBRSxTQUFTO0FBQ2xCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN2RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3RELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FDdkQ7R0FDRixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLGlCQUFpQjtBQUM1QixjQUFVLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRTtBQUNoQyxXQUFPLEVBQUUsTUFBTTtBQUNmLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDckQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQ3ZEO0dBQ0YsQ0FBQyxDQUFDOztBQUVILHdCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2pELGFBQVMsRUFBRSx3QkFBd0I7QUFDbkMsY0FBVSxFQUFFLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN0QyxXQUFPLEVBQUUsWUFBWTtBQUNyQixRQUFJLEVBQUUsQ0FDSixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3ZELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3RELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FDdkQ7R0FDRixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLG9CQUFvQjtBQUMvQixjQUFVLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixFQUFFO0FBQ25DLFdBQU8sRUFBRSxTQUFTO0FBQ2xCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN2RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ3RELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FDdkQ7R0FDRixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLGlCQUFpQjtBQUM1QixjQUFVLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRTtBQUNoQyxXQUFPLEVBQUUsTUFBTTtBQUNmLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDckQsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUNyRCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQ3ZEO0dBQ0YsQ0FBQyxDQUFDOzs7QUFHSCx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtBQUNqRCxhQUFTLEVBQUUsU0FBUztBQUNwQixjQUFVLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixFQUFFO0FBQ25DLFdBQU8sRUFBRSxTQUFTO0FBQ2xCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFDbkQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUN2RDtBQUNELHlCQUFxQixFQUFFLElBQUk7R0FDNUIsQ0FBQyxDQUFDOztBQUVILHdCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2pELGFBQVMsRUFBRSxVQUFVO0FBQ3JCLGNBQVUsRUFBRSxHQUFHLENBQUMsa0JBQWtCLEVBQUU7QUFDcEMsV0FBTyxFQUFFLFVBQVU7QUFDbkIsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQ3BEO0FBQ0QseUJBQXFCLEVBQUUsSUFBSTtHQUM1QixDQUFDLENBQUM7O0FBRUgsd0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7QUFDakQsYUFBUyxFQUFFLGFBQWE7QUFDeEIsY0FBVSxFQUFFLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN0QyxXQUFPLEVBQUUsWUFBWTtBQUNyQixRQUFJLEVBQUUsQ0FDSixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQ2xELEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDbEQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUN0RDtHQUNGLENBQUMsQ0FBQzs7QUFFSCx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtBQUNqRCxhQUFTLEVBQUUsUUFBUTtBQUNuQixjQUFVLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLFdBQU8sRUFBRSxRQUFRO0FBQ2pCLFFBQUksRUFBRSxDQUNKLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFDbEQsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUNsRCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQ3REO0dBQ0YsQ0FBQyxDQUFDOztBQUVILHdCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2pELGFBQVMsRUFBRSxRQUFRO0FBQ25CLGNBQVUsRUFBRSxHQUFHLENBQUMscUJBQXFCLEVBQUU7QUFDdkMsV0FBTyxFQUFFLGFBQWE7QUFDdEIsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN4RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQ3REO0dBQ0YsQ0FBQyxDQUFDOztBQUVILHdCQUFzQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ2pELGFBQVMsRUFBRSxPQUFPO0FBQ2xCLGNBQVUsRUFBRSxHQUFHLENBQUMsb0JBQW9CLEVBQUU7QUFDdEMsV0FBTyxFQUFFLFlBQVk7QUFDckIsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN2RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQ3REO0dBQ0YsQ0FBQyxDQUFDOzs7QUFHSCx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtBQUNqRCxhQUFTLEVBQUUsZUFBZTtBQUMxQixjQUFVLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixFQUFFO0FBQ3hDLFdBQU8sRUFBRSxjQUFjO0FBQ3ZCLGNBQVUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU07QUFDekMsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQ3hEO0dBQ0YsQ0FBQyxDQUFDOzs7QUFHSCx3QkFBc0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtBQUNqRCxhQUFTLEVBQUUsZUFBZTtBQUMxQixjQUFVLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixFQUFFO0FBQ3hDLFdBQU8sRUFBRSxjQUFjO0FBQ3ZCLGNBQVUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU07QUFDekMsUUFBSSxFQUFFLENBQ0osRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUNyRDtHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRTtBQUNuRSxhQUFTLEVBQUUsa0JBQWtCO0FBQzdCLFVBQU0sRUFBRSxDQUNOLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUN0QixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDZCxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDZCxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDZCxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FDM0I7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOztBQUdGLFNBQVMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ25FLE1BQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDbEMsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUNwQyxNQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQzlCLE1BQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDeEIsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQzs7QUFFcEUsU0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRztBQUMxQixRQUFJLEVBQUUsZ0JBQVk7QUFDaEIsYUFBTyxDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtBQUN6Riw2QkFBcUIsRUFBRSxPQUFPLENBQUMscUJBQXFCO09BQ3JELENBQUMsQ0FBQztLQUNKO0dBQ0YsQ0FBQzs7QUFFRixXQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsWUFBVztBQUNoQyxRQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDakIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEMsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLFVBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUV2RSxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQzlDLGdCQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ2QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQy9CLGdCQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQy9CLGdCQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0M7T0FDRjtBQUNELGFBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEI7O0FBRUQsV0FBTyxPQUFPLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztHQUMzRCxDQUFDO0NBQ0g7Ozs7O0FDeFNELElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6QyxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMzQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7OztBQUkzQyxPQUFPLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQ2xDLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUN4QixVQUFNLEdBQUcsRUFBRSxDQUFDO0dBQ2I7OztBQUdELE1BQUksT0FBTyxNQUFNLEFBQUMsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUN4RCxVQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQ2xDOztBQUVELE1BQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2hCLFVBQU0sR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZEO0FBQ0QsTUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7Q0FDL0IsQ0FBQzs7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDN0MsU0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzNDLENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLFNBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM3QyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ3ZDLFNBQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ25DLENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFVLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDeEMsU0FBTyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDN0MsU0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMvQyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsVUFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDekQsU0FBTyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNsRCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDdkQsU0FBTyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNyRCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUM5QyxTQUFPLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDNUMsQ0FBQzs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDN0MsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxHQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDbEQsU0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDM0QsQ0FBQzs7QUFFRixPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqRSxTQUFPLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUN6RCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBVSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDeEQsU0FBTyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztDQUN0RCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUMxQyxXQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFdBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsV0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7OztBQUd2QyxHQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLEdBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7Ozs7QUFJL0IsR0FBQyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBR2xDLE9BQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLFNBQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQzs7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7QUFDdEMsV0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixXQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFdBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUV2QyxHQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDakIsR0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixPQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQixTQUFPLEtBQUssQ0FBQztDQUNkLENBQUM7O0FBRUYsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDOUMsV0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFaEMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QixTQUFPLEtBQUssQ0FBQztDQUNkLENBQUM7O0FBRUYsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDNUMsT0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUIsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDOztBQUVGLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQzlDLFdBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsV0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFL0IsU0FBTyxLQUFLLEdBQUcsTUFBTSxDQUFDO0NBQ3ZCLENBQUM7OztBQUdGLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDcEMsV0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFNUIsU0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO0NBQ25CLENBQUM7Ozs7O0FDaklGLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRXZDLElBQUksWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFhLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLFdBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0IsV0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU3QixXQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOztBQUV0QyxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFbEIsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Q0FDdEIsQ0FBQztBQUNGLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUM7O0FBRTlCLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQzlDLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3BFLFVBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ25DOzs7O0FBSUQsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFM0MsTUFBSSxVQUFVLEdBQUc7QUFDZixLQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7QUFDbEIsS0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDO0dBQ2QsQ0FBQzs7QUFFRixNQUFJLFdBQVcsR0FBRztBQUNoQixLQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDO0FBQ2pCLEtBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQztHQUNkLENBQUM7O0FBRUYsTUFBSSxHQUFHLEdBQUc7QUFDUixLQUFDLEVBQUUsQ0FBQztBQUNKLEtBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQztHQUNuQixDQUFDOztBQUVGLE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFDakMsVUFBVSxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQ3RDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUN6QyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXZCLFdBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUNoREYsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQWEsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDOUMsV0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixXQUFTLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLFdBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdCLFdBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXhDLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDOztBQUUxQixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakUsVUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZDLE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQzs7QUFFM0UsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbkMsTUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVsRCxXQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ2pELENBQUM7O0FBRUYsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBWTtBQUN2QyxTQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDbkIsQ0FBQzs7Ozs7QUNwQ0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQWEsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUMvRCxXQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLFdBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsV0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFdBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdCLFdBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXRDLE1BQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDOztBQUU5QixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDcEUsVUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkM7O0FBRUQsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE1BQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDOUIsTUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFOUIsTUFBSSxVQUFVLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNoRCxPQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLFVBQVUsRUFBRTtBQUM1RCxVQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFVBQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQzlELFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNuRDs7QUFFRCxNQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3JDOztBQUVELFdBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUM1Q0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQWEsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ3BELFdBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsV0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFdBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdCLFdBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXRDLE1BQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUV0QixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakUsVUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkM7OztBQUdELE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuRCxNQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRW5ELFdBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUNoQ0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQWEsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzNELFdBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEMsV0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFdBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdCLFdBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXRDLE1BQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUEsQUFBQyxDQUFDO0FBQzVELE1BQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDOztBQUU3QixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQzs7QUFFN0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDN0MsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDcEUsVUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkM7O0FBRUQsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRTFCLE1BQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDM0MsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsVUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQ2hGOztBQUVELE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXZELFdBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUNwQ0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQWEsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUN4QyxXQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUN4QyxXQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzs7QUFFeEMsV0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Ozs7O0FBS3RCLE1BQUksTUFBTSxFQUFFLE1BQU0sQ0FBQztBQUNuQixRQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNuQyxRQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNuQyxNQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUMsUUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDbkMsUUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDbkMsTUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUU1QyxNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFM0IsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDM0MsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxNQUFNLEVBQUUsTUFBTSxDQUFDOztBQUVuQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5RCxVQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNuQzs7QUFFRCxNQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVqQyxXQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ2pELENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWTtBQUM1QyxTQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7Ozs7QUM1Q0YsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQWEsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ3RELFdBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsV0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLFdBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTdCLFdBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXRDLE1BQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUV0QixNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN0QixDQUFDO0FBQ0YsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQzs7QUFFNUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDNUMsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDcEUsVUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbkM7QUFDRCxNQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEMsTUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVuRCxXQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ2pELENBQUM7Ozs7O0FDOUJGLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRXZDLElBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFhLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLFdBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsV0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixXQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU3QixXQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOztBQUV0QyxNQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7QUFFdEIsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Q0FDdEIsQ0FBQztBQUNGLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7O0FBRTVCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQzVDLE1BQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2xCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLFVBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ25DO0FBQ0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU5QyxXQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ2pELENBQUM7O0FBRUYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTs7O0NBR3pDLENBQUM7Ozs7O0FDaENGLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkMsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQWEsS0FBSyxFQUFFLEtBQUssRUFBRTs7QUFFdEMsTUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDZCxNQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQzs7QUFFZCxNQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNuQixNQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUNuQixNQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQzs7QUFFbEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Q0FDckIsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDOztBQUUzQixTQUFTLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbkQsTUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDWixNQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUNiLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBVSxhQUFhLEVBQUU7QUFDbEQsTUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDOUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNoRixRQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLFFBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7R0FDdkY7O0FBRUQsTUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFdBQVMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7O0FBRTNELE1BQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7QUFDL0MsYUFBUyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztHQUNsRTs7QUFFRCxNQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLGFBQVMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7R0FDaEQ7O0FBRUQsTUFBSSxTQUFTLEtBQUssRUFBRSxFQUFFO0FBQ3BCLFFBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQzVDLE1BQU07QUFDTCxRQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDcEQ7Q0FDRixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMxQyxNQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNaLE1BQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUM5QyxNQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQztDQUMzQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNwRCxNQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixNQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztDQUN2QixDQUFDOzs7OztBQUtGLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVk7QUFDNUMsU0FBTyxFQUFFLENBQUM7Q0FDWCxDQUFDOzs7OztBQ2pFRixJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDN0MsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7Ozs7O0FBTTFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQzNDLFNBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ2pELENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDM0MsU0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDakQsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUMxQyxNQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDekIsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0MsUUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxHQUFHLEVBQUU7QUFDbEMsYUFBTztLQUNSO0dBQ0YsQUFBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDM0MsV0FBTztHQUNSO0FBQ0QsUUFBTSxJQUFJLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUMvRCxDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUMxQyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLEdBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQzs7O0FBR3BCLE1BQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNsQixVQUFNLElBQUksZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQy9EO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQy9DLE1BQUksT0FBTyxJQUFJLEFBQUMsS0FBSyxRQUFRLEVBQUU7QUFDN0IsUUFBSSxPQUFPLEdBQUcsQUFBQyxLQUFLLElBQUksRUFBRTtBQUN4QixZQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixHQUFHLElBQUksR0FBRyxjQUFjLEdBQUcsT0FBTyxHQUFHLEFBQUMsQ0FBQyxDQUFDO0tBQzFFO0dBQ0YsTUFBTSxJQUFJLEVBQUUsR0FBRyxZQUFZLElBQUksQ0FBQSxBQUFDLEVBQUU7QUFDakMsVUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0dBQ3RDO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDL0MsTUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3ZCLFdBQU8sTUFBTSxDQUFDO0dBQ2Y7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqRCxNQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDdkIsV0FBTyxLQUFLLENBQUM7R0FDZDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2YsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUU7QUFDM0MsTUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLE1BQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUMzQixTQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0dBQ2hEO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDOzs7Ozs7Ozs7QUFTRixNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsVUFBVSxFQUFFO0FBQ3RELFNBQU8sR0FBRyxHQUFHLFVBQVUsQ0FBQztDQUN6QixDQUFDOzs7OztBQy9GRixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Ozs7Ozs7QUFPbEMsSUFBSSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFhLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDekMsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFVBQVEsSUFBSTtBQUNWLFNBQUssZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRO0FBQ2hDLFVBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7QUFDL0QsWUFBTTtBQUFBLEFBQ1IsU0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVE7QUFDaEMsVUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUMvRCxZQUFNO0FBQUEsQUFDUixTQUFLLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCO0FBQ3pDLFVBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDeEQsWUFBTTtBQUFBLEFBQ1IsU0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtBQUN6QyxVQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ25ELFlBQU07QUFBQSxBQUNSO0FBQ0UsVUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsWUFBTTtBQUFBLEdBQ1Q7Q0FDRixDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUM7O0FBRWpDLGVBQWUsQ0FBQyxJQUFJLEdBQUc7QUFDckIsVUFBUSxFQUFFLENBQUM7QUFDWCxVQUFRLEVBQUUsQ0FBQztBQUNYLG1CQUFpQixFQUFFLENBQUM7QUFDcEIsbUJBQWlCLEVBQUUsQ0FBQztDQUNyQixDQUFDOzs7Ozs7O0FDakNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRXZhbCA9IHJlcXVpcmUoJy4vZXZhbCcpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5ldmFsTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuRXZhbCwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogRXZhbCBHcmFwaGljc1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZhbCA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEV2YWwgPSBtb2R1bGUuZXhwb3J0cztcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBldmFsTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIEN1c3RvbUV2YWxFcnJvciA9IHJlcXVpcmUoJy4vZXZhbEVycm9yJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG4vLyBMb2FkaW5nIHRoZXNlIG1vZHVsZXMgZXh0ZW5kcyBTVkdFbGVtZW50IGFuZCBwdXRzIGNhbnZnIGluIHRoZSBnbG9iYWxcbi8vIG5hbWVzcGFjZVxudmFyIGNhbnZnID0gcmVxdWlyZSgnY2FudmcnKTtcbi8vIHRlc3RzIGRvbid0IGhhdmUgc3ZnZWxlbWVudFxuaWYgKHR5cGVvZiBTVkdFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICByZXF1aXJlKCcuLi9jYW52Zy9zdmdfdG9kYXRhdXJsJyk7XG59XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2NrcyhmYWxzZSk7XG5cbkV2YWwuQ0FOVkFTX0hFSUdIVCA9IDQwMDtcbkV2YWwuQ0FOVkFTX1dJRFRIID0gNDAwO1xuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHNldCBpbiB0aGUgYXBpIGNhbGwgdG8gZHJhdywgYW5kIGV4dHJhY3RlZCBpbiBldmFsQ29kZVxuRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBudWxsO1xuXG5FdmFsLmFuc3dlck9iamVjdCA9IG51bGw7XG5cbkV2YWwuZmVlZGJhY2tJbWFnZSA9IG51bGw7XG5FdmFsLmVuY29kZWRGZWVkYmFja0ltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBFdmFsLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuRXZhbC5pbml0ID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSB0cnVlO1xuICBjb25maWcuZm9yY2VJbnNlcnRUb3BCbG9jayA9ICdmdW5jdGlvbmFsX2Rpc3BsYXknO1xuICBjb25maWcuZW5hYmxlU2hvd0NvZGUgPSBmYWxzZTtcblxuICAvLyBXZSBkb24ndCB3YW50IGljb25zIGluIGluc3RydWN0aW9uc1xuICBjb25maWcuc2tpbi5zdGF0aWNBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IG51bGw7XG4gIGNvbmZpZy5za2luLmZhaWx1cmVBdmF0YXIgPSBudWxsO1xuICBjb25maWcuc2tpbi53aW5BdmF0YXIgPSBudWxsO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0V2YWwnKTtcbiAgICBpZiAoIXN2Zykge1xuICAgICAgdGhyb3cgXCJzb21ldGhpbmcgYmFkIGhhcHBlbmVkXCI7XG4gICAgfVxuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRXZhbC5DQU5WQVNfV0lEVEgpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEV2YWwuQ0FOVkFTX0hFSUdIVCk7XG5cbiAgICAvLyBUaGlzIGlzIGhhY2sgdGhhdCBJIGhhdmVuJ3QgYmVlbiBhYmxlIHRvIGZ1bGx5IHVuZGVyc3RhbmQuIEZ1cnRoZXJtb3JlLFxuICAgIC8vIGl0IHNlZW1zIHRvIGJyZWFrIHRoZSBmdW5jdGlvbmFsIGJsb2NrcyBpbiBzb21lIGJyb3dzZXJzLiBBcyBzdWNoLCBJJ21cbiAgICAvLyBqdXN0IGdvaW5nIHRvIGRpc2FibGUgdGhlIGhhY2sgZm9yIHRoaXMgYXBwLlxuICAgIEJsb2NrbHkuQlJPS0VOX0NPTlRST0xfUE9JTlRTID0gZmFsc2U7XG5cbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZW52aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnRXZhbCxjb2RlJyk7XG5cbiAgICBpZiAobGV2ZWwuY29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKSB7XG4gICAgICB2YXIgYmFja2dyb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kJyk7XG4gICAgICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX2dyaWQucG5nJykpO1xuICAgICAgICBzdHVkaW9BcHAuY3JlYXRlQ29vcmRpbmF0ZUdyaWRCYWNrZ3JvdW5kKHtcbiAgICAgICAgICBzdmc6ICdzdmdFdmFsJyxcbiAgICAgICAgICBvcmlnaW46IC0yMDAsXG4gICAgICAgICAgZmlyc3RMYWJlbDogLTEwMCxcbiAgICAgICAgICBsYXN0TGFiZWw6IDEwMCxcbiAgICAgICAgICBpbmNyZW1lbnQ6IDEwMFxuICAgICAgICB9KTtcbiAgICAgIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAobGV2ZWwuc29sdXRpb25CbG9ja3MpIHtcbiAgICAgIHZhciBzb2x1dGlvbkJsb2NrcyA9IGJsb2NrVXRpbHMuZm9yY2VJbnNlcnRUb3BCbG9jayhsZXZlbC5zb2x1dGlvbkJsb2NrcyxcbiAgICAgICAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2spO1xuXG4gICAgICB2YXIgYW5zd2VyT2JqZWN0ID0gZ2V0RHJhd2FibGVGcm9tQmxvY2tYbWwoc29sdXRpb25CbG9ja3MpO1xuICAgICAgaWYgKGFuc3dlck9iamVjdCAmJiBhbnN3ZXJPYmplY3QuZHJhdykge1xuICAgICAgICAvLyBzdG9yZSBvYmplY3QgZm9yIGxhdGVyIGFuYWx5c2lzXG4gICAgICAgIEV2YWwuYW5zd2VyT2JqZWN0ID0gYW5zd2VyT2JqZWN0O1xuICAgICAgICBhbnN3ZXJPYmplY3QuZHJhdyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICAgIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICAgIC8vIGJhc2UncyBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlIGNhbGxlZCBmaXJzdFxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmVzZXRCdXR0b24sIEV2YWwucmVzZXRCdXR0b25DbGljayk7XG5cbiAgICBpZiAoQmxvY2tseS5jb250cmFjdEVkaXRvcikge1xuICAgICAgQmxvY2tseS5jb250cmFjdEVkaXRvci5yZWdpc3RlclRlc3RIYW5kbGVyKGdldEV2YWxFeGFtcGxlRmFpbHVyZSk7XG4gICAgICBCbG9ja2x5LmNvbnRyYWN0RWRpdG9yLnJlZ2lzdGVyVGVzdFJlc2V0SGFuZGxlcihyZXNldEV4YW1wbGVEaXNwbGF5KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHJlbmRlckNvZGVBcHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHBhZ2Uoe1xuICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmxcbiAgICAgICAgfSksXG4gICAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlldywge1xuICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgcmVxdWlyZUxhbmRzY2FwZTogIShjb25maWcuc2hhcmUgfHwgY29uZmlnLmVtYmVkKSxcbiAgICByZW5kZXJDb2RlQXBwOiByZW5kZXJDb2RlQXBwLFxuICAgIG9uTW91bnQ6IHN0dWRpb0FwcC5pbml0LmJpbmQoc3R1ZGlvQXBwLCBjb25maWcpXG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuY29udGFpbmVySWQpKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtCbG9ja2x5LkJsb2NrfVxuICogQHBhcmFtIHtib29sZWFufSBbZXZhbHVhdGVJblBsYXlzcGFjZV0gVHJ1ZSBpZiB0aGlzIHRlc3Qgc2hvdWxkIGFsc28gc2hvd1xuICogICBldmFsdWF0aW9uIGluIHRoZSBwbGF5IHNwYWNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBFcnJvciBzdHJpbmcsIG9yIG51bGwgaWYgc3VjY2Vzc1xuICovXG5mdW5jdGlvbiBnZXRFdmFsRXhhbXBsZUZhaWx1cmUoZXhhbXBsZUJsb2NrLCBldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gIGlmIChldmFsdWF0ZUluUGxheXNwYWNlKSB7XG4gICAgc3R1ZGlvQXBwLnJlc2V0QnV0dG9uQ2xpY2soKTtcbiAgICBFdmFsLnJlc2V0QnV0dG9uQ2xpY2soKTtcbiAgICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gIH1cblxuICBjbGVhclRlc3RDYW52YXNlcygpO1xuICBkaXNwbGF5Q2FsbEFuZEV4YW1wbGUoKTtcblxuICB2YXIgZmFpbHVyZTtcbiAgdHJ5IHtcbiAgICB2YXIgYWN0dWFsQmxvY2sgPSBleGFtcGxlQmxvY2suZ2V0SW5wdXRUYXJnZXRCbG9jayhcIkFDVFVBTFwiKTtcbiAgICB2YXIgZXhwZWN0ZWRCbG9jayA9IGV4YW1wbGVCbG9jay5nZXRJbnB1dFRhcmdldEJsb2NrKFwiRVhQRUNURURcIik7XG4gICAgdmFyIGFjdHVhbERyYXdlciA9IGdldERyYXdhYmxlRnJvbUJsb2NrKGFjdHVhbEJsb2NrKTtcbiAgICB2YXIgZXhwZWN0ZWREcmF3ZXIgPSBnZXREcmF3YWJsZUZyb21CbG9jayhleHBlY3RlZEJsb2NrKTtcblxuICAgIHN0dWRpb0FwcC5mZWVkYmFja18udGhyb3dPbkludmFsaWRFeGFtcGxlQmxvY2tzKGFjdHVhbEJsb2NrLCBleHBlY3RlZEJsb2NrKTtcblxuICAgIGlmICghYWN0dWFsRHJhd2VyIHx8IGFjdHVhbERyYXdlciBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIENhbGwgQmxvY2snKTtcbiAgICB9XG5cbiAgICBpZiAoIWV4cGVjdGVkRHJhd2VyIHx8IGV4cGVjdGVkRHJhd2VyIGluc3RhbmNlb2YgQ3VzdG9tRXZhbEVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUmVzdWx0IEJsb2NrJyk7XG4gICAgfVxuXG4gICAgYWN0dWFsRHJhd2VyLmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0LWNhbGxcIikpO1xuICAgIGV4cGVjdGVkRHJhd2VyLmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0LXJlc3VsdFwiKSk7XG5cbiAgICBmYWlsdXJlID0gY2FudmFzZXNNYXRjaCgndGVzdC1jYWxsJywgJ3Rlc3QtcmVzdWx0JykgPyBudWxsIDpcbiAgICAgIFwiRG9lcyBub3QgbWF0Y2ggZGVmaW5pdGlvblwiO1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZmFpbHVyZSA9IFwiRXhlY3V0aW9uIGVycm9yOiBcIiArIGVycm9yLm1lc3NhZ2U7XG4gIH1cblxuICBpZiAoZXZhbHVhdGVJblBsYXlzcGFjZSkge1xuICAgIHNob3dPbmx5RXhhbXBsZSgpO1xuICB9IGVsc2Uge1xuICAgIHJlc2V0RXhhbXBsZURpc3BsYXkoKTtcbiAgfVxuICByZXR1cm4gZmFpbHVyZTtcbn1cblxuZnVuY3Rpb24gY2xlYXJUZXN0Q2FudmFzZXMoKSB7XG4gIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoXCJ0ZXN0LWNhbGxcIik7XG4gIEV2YWwuY2xlYXJDYW52YXNXaXRoSUQoXCJ0ZXN0LXJlc3VsdFwiKTtcbn1cblxuZnVuY3Rpb24gcmVzZXRFeGFtcGxlRGlzcGxheSgpIHtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1jYWxsJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtcmVzdWx0Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbn1cblxuZnVuY3Rpb24gc2hvd09ubHlFeGFtcGxlKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zd2VyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtY2FsbCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LXJlc3VsdCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5Q2FsbEFuZEV4YW1wbGUoKSB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1jYWxsJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LXJlc3VsdCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufVxuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkV2YWwucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuICBFdmFsLmV4ZWN1dGUoKTtcbn07XG5cbkV2YWwuY2xlYXJDYW52YXNXaXRoSUQgPSBmdW5jdGlvbiAoY2FudmFzSUQpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRCk7XG4gIHdoaWxlIChlbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cbn07XG4vKipcbiAqIEFwcCBzcGVjaWZpYyByZXNldCBidXR0b24gY2xpY2sgbG9naWMuICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlXG4gKiBjYWxsZWQgZmlyc3QuXG4gKi9cbkV2YWwucmVzZXRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgcmVzZXRFeGFtcGxlRGlzcGxheSgpO1xuICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gIEV2YWwuZmVlZGJhY2tJbWFnZSA9IG51bGw7XG4gIEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2UgPSBudWxsO1xuICBFdmFsLnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIEV2YWwubWVzc2FnZSA9IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogRXZhbHVhdGVzIHVzZXIgY29kZSwgY2F0Y2hpbmcgYW55IGV4Y2VwdGlvbnMuXG4gKiBAcmV0dXJuIHtFdmFsSW1hZ2V8Q3VzdG9tRXZhbEVycm9yfSBFdmFsSW1hZ2Ugb24gc3VjY2VzcywgQ3VzdG9tRXZhbEVycm9yIG9uXG4gKiAgaGFuZGxlYWJsZSBmYWlsdXJlLCBudWxsIG9uIHVuZXhwZWN0ZWQgZmFpbHVyZS5cbiAqL1xuZnVuY3Rpb24gZXZhbENvZGUgKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgRXZhbDogYXBpXG4gICAgfSk7XG5cbiAgICB2YXIgb2JqZWN0ID0gRXZhbC5kaXNwbGF5ZWRPYmplY3Q7XG4gICAgRXZhbC5kaXNwbGF5ZWRPYmplY3QgPSBudWxsO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEN1c3RvbUV2YWxFcnJvcikge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0luZmluaXRlUmVjdXJzaW9uRXJyb3IoZSkpIHtcbiAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLkluZmluaXRlUmVjdXJzaW9uLCBudWxsKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICB9XG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ3VzdG9tRXZhbEVycm9yKEN1c3RvbUV2YWxFcnJvci5UeXBlLlVzZXJDb2RlRXhjZXB0aW9uLCBudWxsKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBhIGRyYXdhYmxlIEV2YWxJbWFnZSBmcm9tIHRoZSBibG9ja3MgY3VycmVudGx5IGluIHRoZSB3b3Jrc3BhY2VcbiAqIEByZXR1cm4ge0V2YWxJbWFnZXxDdXN0b21FdmFsRXJyb3J9XG4gKi9cbmZ1bmN0aW9uIGdldERyYXdhYmxlRnJvbUJsb2Nrc3BhY2UoKSB7XG4gIHZhciBjb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcsIFsnZnVuY3Rpb25hbF9kaXNwbGF5JywgJ2Z1bmN0aW9uYWxfZGVmaW5pdGlvbiddKTtcbiAgdmFyIHJlc3VsdCA9IGV2YWxDb2RlKGNvZGUpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXREcmF3YWJsZUZyb21CbG9jayhibG9jaykge1xuICB2YXIgZGVmaW5pdGlvbkNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0JywgWydmdW5jdGlvbmFsX2RlZmluaXRpb24nXSk7XG4gIHZhciBibG9ja0NvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja3NUb0NvZGUoJ0phdmFTY3JpcHQnLCBbYmxvY2tdKTtcbiAgdmFyIGxpbmVzID0gYmxvY2tDb2RlLnNwbGl0KCdcXG4nKTtcbiAgdmFyIGxhc3RMaW5lID0gbGluZXMuc2xpY2UoLTEpWzBdO1xuICB2YXIgbGFzdExpbmVXaXRoRGlzcGxheSA9IFwiRXZhbC5kaXNwbGF5KFwiICsgbGFzdExpbmUgKyBcIik7XCI7XG4gIHZhciBibG9ja0NvZGVEaXNwbGF5ZWQgPSBsaW5lcy5zbGljZSgwLCAtMSkuam9pbignXFxuJykgKyBsYXN0TGluZVdpdGhEaXNwbGF5O1xuICB2YXIgcmVzdWx0ID0gZXZhbENvZGUoZGVmaW5pdGlvbkNvZGUgKyAnOyAnICsgYmxvY2tDb2RlRGlzcGxheWVkKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBkcmF3YWJsZSBFdmFsSW1hZ2UgZnJvbSB0aGUgYmxvY2tzIGluIHRoZSB3b3Jrc3BhY2UuIElmIGJsb2NrWG1sXG4gKiBpcyBwcm92aWRlZCwgdGVtcG9yYXJpbHkgc3RpY2tzIHRob3NlIGJsb2NrcyBpbnRvIHRoZSB3b3Jrc3BhY2UgdG8gZ2VuZXJhdGVcbiAqIHRoZSBldmFsSW1hZ2UsIHRoZW4gZGVsZXRlcyBibG9ja3MuXG4gKiBAcmV0dXJuIHtFdmFsSW1hZ2V8Q3VzdG9tRXZhbEVycm9yfVxuICovXG5mdW5jdGlvbiBnZXREcmF3YWJsZUZyb21CbG9ja1htbChibG9ja1htbCkge1xuICBpZiAoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKS5sZW5ndGggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXREcmF3YWJsZUZyb21CbG9ja3Mgc2hvdWxkbid0IGJlIGNhbGxlZCB3aXRoIGJsb2NrcyBpZiBcIiArXG4gICAgICBcIndlIGFscmVhZHkgaGF2ZSBibG9ja3MgaW4gdGhlIHdvcmtzcGFjZVwiKTtcbiAgfVxuICAvLyBUZW1wb3JhcmlseSBwdXQgdGhlIGJsb2NrcyBpbnRvIHRoZSB3b3Jrc3BhY2Ugc28gdGhhdCB3ZSBjYW4gZ2VuZXJhdGUgY29kZVxuICBzdHVkaW9BcHAubG9hZEJsb2NrcyhibG9ja1htbCk7XG5cbiAgdmFyIHJlc3VsdCA9IGdldERyYXdhYmxlRnJvbUJsb2Nrc3BhY2UoKTtcblxuICAvLyBSZW1vdmUgdGhlIGJsb2Nrc1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKGIpIHsgYi5kaXNwb3NlKCk7IH0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcGFyc2UgYW4gRXZhbE9iamVjdCBsb29raW5nIGZvciBFdmFsVGV4dCBvYmplY3RzLiBGb3IgZWFjaCBvbmUsXG4gKiBleHRyYWN0IHRoZSB0ZXh0IGNvbnRlbnQuXG4gKi9cbkV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyA9IGZ1bmN0aW9uIChldmFsT2JqZWN0KSB7XG4gIGlmICghZXZhbE9iamVjdCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBzdHJzID0gW107XG4gIGlmIChldmFsT2JqZWN0IGluc3RhbmNlb2YgRXZhbFRleHQpIHtcbiAgICBzdHJzLnB1c2goZXZhbE9iamVjdC5nZXRUZXh0KCkpO1xuICB9XG5cbiAgZXZhbE9iamVjdC5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgc3RycyA9IHN0cnMuY29uY2F0KEV2YWwuZ2V0VGV4dFN0cmluZ3NGcm9tT2JqZWN0XyhjaGlsZCkpO1xuICB9KTtcbiAgcmV0dXJuIHN0cnM7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIFRydWUgaWYgdHdvIGV2YWwgb2JqZWN0cyBoYXZlIHNldHMgb2YgdGV4dCBzdHJpbmdzIHRoYXQgZGlmZmVyXG4gKiAgIG9ubHkgaW4gY2FzZVxuICovXG5FdmFsLmhhdmVDYXNlTWlzbWF0Y2hfID0gZnVuY3Rpb24gKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgdmFyIHN0cnMxID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDEpO1xuICB2YXIgc3RyczIgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0Mik7XG5cbiAgaWYgKHN0cnMxLmxlbmd0aCAhPT0gc3RyczIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RyczEuc29ydCgpO1xuICBzdHJzMi5zb3J0KCk7XG5cbiAgdmFyIGNhc2VNaXNtYXRjaCA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyczEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc3RyMSA9IHN0cnMxW2ldO1xuICAgIHZhciBzdHIyID0gc3RyczJbaV07XG4gICAgaWYgKHN0cjEgIT09IHN0cjIpIHtcbiAgICAgIGlmIChzdHIxLnRvTG93ZXJDYXNlKCkgPT09IHN0cjIudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBjYXNlTWlzbWF0Y2ggID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gc3RyaW5ncyBkaWZmZXIgYnkgbW9yZSB0aGFuIGNhc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhc2VNaXNtYXRjaDtcbn07XG5cbi8qKlxuICogTm90ZTogaXMgdW5hYmxlIHRvIGRpc3Rpbmd1aXNoIGZyb20gdHJ1ZS9mYWxzZSBnZW5lcmF0ZWQgZnJvbSBzdHJpbmcgYmxvY2tzXG4gKiAgIHZzLiBmcm9tIGJvb2xlYW4gYmxvY2tzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0d28gZXZhbCBvYmplY3RzIGFyZSBib3RoIGJvb2xlYW5zLCBidXQgaGF2ZSBkaWZmZXJlbnQgdmFsdWVzLlxuICovXG5FdmFsLmhhdmVCb29sZWFuTWlzbWF0Y2hfID0gZnVuY3Rpb24gKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgdmFyIHN0cnMxID0gRXZhbC5nZXRUZXh0U3RyaW5nc0Zyb21PYmplY3RfKG9iamVjdDEpO1xuICB2YXIgc3RyczIgPSBFdmFsLmdldFRleHRTdHJpbmdzRnJvbU9iamVjdF8ob2JqZWN0Mik7XG5cbiAgaWYgKHN0cnMxLmxlbmd0aCAhPT0gMSB8fCBzdHJzMi5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdGV4dDEgPSBzdHJzMVswXTtcbiAgdmFyIHRleHQyID0gc3RyczJbMF07XG5cbiAgaWYgKCh0ZXh0MSA9PT0gXCJ0cnVlXCIgJiYgdGV4dDIgPT09IFwiZmFsc2VcIikgfHxcbiAgICAgICh0ZXh0MSA9PT0gXCJmYWxzZVwiICYmIHRleHQyID09PSBcInRydWVcIikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5FdmFsLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgRXZhbC5yZXN1bHQgPSBSZXN1bHRUeXBlLlVOU0VUO1xuICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuTk9fVEVTVFNfUlVOO1xuICBFdmFsLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKHN0dWRpb0FwcC5oYXNVbmZpbGxlZEZ1bmN0aW9uYWxCbG9jaygpKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05BTF9CTE9DSztcbiAgICBFdmFsLm1lc3NhZ2UgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsQmxvY2tFcnJvcignZnVuY3Rpb25hbF9kaXNwbGF5Jyk7XG4gIH0gZWxzZSBpZiAoc3R1ZGlvQXBwLmhhc1F1ZXN0aW9uTWFya3NJbk51bWJlckZpZWxkKCkpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5RVUVTVElPTl9NQVJLU19JTl9OVU1CRVJfRklFTEQ7XG4gIH0gZWxzZSBpZiAoc3R1ZGlvQXBwLmhhc0VtcHR5RnVuY3Rpb25PclZhcmlhYmxlTmFtZSgpKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRU1QVFlfRlVOQ1RJT05fTkFNRTtcbiAgICBFdmFsLm1lc3NhZ2UgPSBjb21tb25Nc2cudW5uYW1lZEZ1bmN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgY2xlYXJUZXN0Q2FudmFzZXMoKTtcbiAgICByZXNldEV4YW1wbGVEaXNwbGF5KCk7XG4gICAgdmFyIHVzZXJPYmplY3QgPSBnZXREcmF3YWJsZUZyb21CbG9ja3NwYWNlKCk7XG4gICAgaWYgKHVzZXJPYmplY3QgJiYgdXNlck9iamVjdC5kcmF3KSB7XG4gICAgICB1c2VyT2JqZWN0LmRyYXcoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyXCIpKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgYSBDdXN0b21FdmFsRXJyb3IsIHNldCBlcnJvciBtZXNzYWdlIGFwcHJvcHJpYXRlbHkuXG4gICAgaWYgKHVzZXJPYmplY3QgaW5zdGFuY2VvZiBDdXN0b21FdmFsRXJyb3IpIHtcbiAgICAgIEV2YWwucmVzdWx0ID0gZmFsc2U7XG4gICAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICBFdmFsLm1lc3NhZ2UgPSB1c2VyT2JqZWN0LmZlZWRiYWNrTWVzc2FnZTtcbiAgICB9IGVsc2UgaWYgKEV2YWwuaGF2ZUNhc2VNaXNtYXRjaF8odXNlck9iamVjdCwgRXZhbC5hbnN3ZXJPYmplY3QpKSB7XG4gICAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgRXZhbC5tZXNzYWdlID0gZXZhbE1zZy5zdHJpbmdNaXNtYXRjaEVycm9yKCk7XG4gICAgfSBlbHNlIGlmIChFdmFsLmhhdmVCb29sZWFuTWlzbWF0Y2hfKHVzZXJPYmplY3QsIEV2YWwuYW5zd2VyT2JqZWN0KSkge1xuICAgICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIEV2YWwubWVzc2FnZSA9IGV2YWxNc2cud3JvbmdCb29sZWFuRXJyb3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgRXZhbC5jaGVja0V4YW1wbGVzXygpO1xuXG4gICAgICAvLyBIYXZlbid0IHJ1biBpbnRvIGFueSBlcnJvcnMuIERvIG91ciBhY3R1YWwgY29tcGFyaXNvblxuICAgICAgaWYgKEV2YWwucmVzdWx0ID09PSBSZXN1bHRUeXBlLlVOU0VUKSB7XG4gICAgICAgIEV2YWwucmVzdWx0ID0gY2FudmFzZXNNYXRjaCgndXNlcicsICdhbnN3ZXInKTtcbiAgICAgICAgRXZhbC50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhFdmFsLnJlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgICAgICBFdmFsLnJlc3VsdCA9IHRydWU7XG4gICAgICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdldmFsJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IEV2YWwucmVzdWx0LFxuICAgIHRlc3RSZXN1bHQ6IEV2YWwudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgIG9uQ29tcGxldGU6IG9uUmVwb3J0Q29tcGxldGUsXG4gICAgaW1hZ2U6IEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2VcbiAgfTtcblxuICAvLyBkb24ndCB0cnkgaXQgaWYgZnVuY3Rpb24gaXMgbm90IGRlZmluZWQsIHdoaWNoIHNob3VsZCBwcm9iYWJseSBvbmx5IGJlXG4gIC8vIHRydWUgaW4gb3VyIHRlc3QgZW52aXJvbm1lbnRcbiAgaWYgKHR5cGVvZiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRXZhbCcpLnRvRGF0YVVSTCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzdHVkaW9BcHAucmVwb3J0KHJlcG9ydERhdGEpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdFdmFsJykudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIsIHtcbiAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihwbmdEYXRhVXJsKSB7XG4gICAgICAgIEV2YWwuZmVlZGJhY2tJbWFnZSA9IHBuZ0RhdGFVcmw7XG4gICAgICAgIEV2YWwuZW5jb2RlZEZlZWRiYWNrSW1hZ2UgPSBlbmNvZGVVUklDb21wb25lbnQoRXZhbC5mZWVkYmFja0ltYWdlLnNwbGl0KCcsJylbMV0pO1xuXG4gICAgICAgIHN0dWRpb0FwcC5yZXBvcnQocmVwb3J0RGF0YSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKEV2YWwucmVzdWx0ID8gJ3dpbicgOiAnZmFpbHVyZScpO1xufTtcblxuRXZhbC5jaGVja0V4YW1wbGVzXyA9IGZ1bmN0aW9uIChyZXNldFBsYXlzcGFjZSkge1xuICBpZiAoIWxldmVsLmV4YW1wbGVzUmVxdWlyZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZXhhbXBsZWxlc3MgPSBzdHVkaW9BcHAuZ2V0RnVuY3Rpb25XaXRob3V0VHdvRXhhbXBsZXMoKTtcbiAgaWYgKGV4YW1wbGVsZXNzKSB7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogZXhhbXBsZWxlc3N9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdW5maWxsZWQgPSBzdHVkaW9BcHAuZ2V0VW5maWxsZWRGdW5jdGlvbmFsRXhhbXBsZSgpO1xuICBpZiAodW5maWxsZWQpIHtcbiAgICBFdmFsLnJlc3VsdCA9IGZhbHNlO1xuICAgIEV2YWwudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5FWEFNUExFX0ZBSUxFRDtcblxuICAgIHZhciBuYW1lID0gdW5maWxsZWQuZ2V0Um9vdEJsb2NrKCkuZ2V0SW5wdXRUYXJnZXRCbG9jaygnQUNUVUFMJylcbiAgICAgIC5nZXRUaXRsZVZhbHVlKCdOQU1FJyk7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmVtcHR5RXhhbXBsZUJsb2NrRXJyb3JNc2coe2Z1bmN0aW9uTmFtZTogbmFtZX0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBmYWlsaW5nQmxvY2tOYW1lID0gc3R1ZGlvQXBwLmNoZWNrRm9yRmFpbGluZ0V4YW1wbGVzKGdldEV2YWxFeGFtcGxlRmFpbHVyZSk7XG4gIGlmIChmYWlsaW5nQmxvY2tOYW1lKSB7XG4gICAgLy8gQ2xlYXIgdXNlciBjYW52YXMsIGFzIHRoaXMgaXMgbWVhbnQgdG8gYmUgYSBwcmUtZXhlY3V0aW9uIGZhaWx1cmVcbiAgICBFdmFsLmNsZWFyQ2FudmFzV2l0aElEKCd1c2VyJyk7XG4gICAgRXZhbC5yZXN1bHQgPSBmYWxzZTtcbiAgICBFdmFsLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRVhBTVBMRV9GQUlMRUQ7XG4gICAgRXZhbC5tZXNzYWdlID0gY29tbW9uTXNnLmV4YW1wbGVFcnJvck1lc3NhZ2Uoe2Z1bmN0aW9uTmFtZTogZmFpbGluZ0Jsb2NrTmFtZX0pO1xuICAgIHJldHVybjtcbiAgfVxufTtcblxuLyoqXG4gKiBDYWxsaW5nIG91dGVySFRNTCBvbiBzdmcgZWxlbWVudHMgaW4gc2FmYXJpIGRvZXMgbm90IHdvcmsuIEluc3RlYWQgd2Ugc3RpY2tcbiAqIGl0IGluc2lkZSBhIGRpdiBhbmQgZ2V0IHRoYXQgZGl2J3MgaW5uZXIgaHRtbC5cbiAqL1xuZnVuY3Rpb24gb3V0ZXJIVE1MIChlbGVtZW50KSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmFwcGVuZENoaWxkKGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGltYWdlRGF0YUZvclN2ZyhlbGVtZW50SWQpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSBFdmFsLkNBTlZBU19XSURUSDtcbiAgY2FudmFzLmhlaWdodCA9IEV2YWwuQ0FOVkFTX0hFSUdIVDtcbiAgY2FudmcoY2FudmFzLCBvdXRlckhUTUwoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKSkpO1xuXG4gIC8vIGNhbnZnIGF0dGFjaGVzIGFuIHN2ZyBvYmplY3QgdG8gdGhlIGNhbnZhcywgYW5kIGF0dGFjaGVzIGEgc2V0SW50ZXJ2YWwuXG4gIC8vIFdlIGRvbid0IG5lZWQgdGhpcywgYW5kIHRoYXQgYmxvY2tzIG91ciBub2RlIHByb2Nlc3MgZnJvbSBleGl0dGluZyBpblxuICAvLyB0ZXN0cywgc28gc3RvcCBpdC5cbiAgY2FudmFzLnN2Zy5zdG9wKCk7XG5cbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBFdmFsLkNBTlZBU19XSURUSCwgRXZhbC5DQU5WQVNfSEVJR0hUKTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgY29udGVudHMgb2YgdHdvIFNWRyBlbGVtZW50cyBieSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IGNhbnZhc0EgSUQgb2YgY2FudmFzXG4gKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzQiBJRCBvZiBjYW52YXNcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBjYW52YXNlc01hdGNoKGNhbnZhc0EsIGNhbnZhc0IpIHtcbiAgLy8gQ29tcGFyZSB0aGUgc29sdXRpb24gYW5kIHVzZXIgY2FudmFzXG4gIHZhciBpbWFnZURhdGFBID0gaW1hZ2VEYXRhRm9yU3ZnKGNhbnZhc0EpO1xuICB2YXIgaW1hZ2VEYXRhQiA9IGltYWdlRGF0YUZvclN2ZyhjYW52YXNCKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlRGF0YUEuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGlmICgwICE9PSBNYXRoLmFicyhpbWFnZURhdGFBLmRhdGFbaV0gLSBpbWFnZURhdGFCLmRhdGFbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIGlmIChFdmFsLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5VTlNFVCkge1xuICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB3ZSBoaXQgcmVzZXQgYmVmb3JlIG91ciBkaWFsb2cgcG9wcGVkIHVwLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIG92ZXJyaWRlIGV4dHJhIHRvcCBibG9ja3MgbWVzc2FnZVxuICBsZXZlbC5leHRyYVRvcEJsb2NrcyA9IGV2YWxNc2cuZXh0cmFUb3BCbG9ja3MoKTtcblxuICB2YXIgdHJ5QWdhaW5UZXh0O1xuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0cnlBZ2FpblRleHQgPSBjb21tb25Nc2cua2VlcFBsYXlpbmcoKTtcbiAgfVxuXG4gIHZhciBvcHRpb25zID0ge1xuICAgIGFwcDogJ2V2YWwnLFxuICAgIHNraW46IHNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiBFdmFsLnRlc3RSZXN1bHRzLFxuICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgdHJ5QWdhaW5UZXh0OiB0cnlBZ2FpblRleHQsXG4gICAgY29udGludWVUZXh0OiBsZXZlbC5mcmVlUGxheSA/IGNvbW1vbk1zZy5uZXh0UHV6emxlKCkgOiB1bmRlZmluZWQsXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkpLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnlcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiBFdmFsLnJlc3BvbnNlICYmIEV2YWwucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBmZWVkYmFja0ltYWdlOiBFdmFsLmZlZWRiYWNrSW1hZ2UsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogZXZhbE1zZy5yZWluZkZlZWRiYWNrTXNnKHtiYWNrQnV0dG9uOiB0cnlBZ2FpblRleHR9KVxuICAgIH1cbiAgfTtcbiAgaWYgKEV2YWwubWVzc2FnZSAmJiAhbGV2ZWwuZWRpdF9ibG9ja3MpIHtcbiAgICBvcHRpb25zLm1lc3NhZ2UgPSBFdmFsLm1lc3NhZ2U7XG4gIH1cbiAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayhvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbmZ1bmN0aW9uIG9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpIHtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG5cbiAgLy8gQWRkIGEgc2hvcnQgZGVsYXkgc28gdGhhdCB1c2VyIGdldHMgdG8gc2VlIHRoZWlyIGZpbmlzaGVkIGRyYXdpbmcuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGRpc3BsYXlGZWVkYmFjayhyZXNwb25zZSk7XG4gIH0sIDIwMDApO1xufVxuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJzdmdFdmFsXCI+XFxuICA8aW1hZ2UgaWQ9XCJiYWNrZ3JvdW5kXCIgdmlzaWJpbGl0eT1cImhpZGRlblwiIGhlaWdodD1cIjQwMFwiIHdpZHRoPVwiNDAwXCIgeD1cIjBcIiB5PVwiMFwiID48L2ltYWdlPlxcbiAgPGcgaWQ9XCJhbnN3ZXJcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwidXNlclwiPlxcbiAgPC9nPlxcbiAgPGcgaWQ9XCJ0ZXN0LWNhbGxcIj5cXG4gIDwvZz5cXG4gIDxnIGlkPVwidGVzdC1yZXN1bHRcIj5cXG4gIDwvZz5cXG48L3N2Zz5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBsZXZlbC1zcGVjaWZpYyByZXF1aXJlbWVudHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnZXZhbDEnOiB7XG4gICAgc29sdXRpb25CbG9ja3M6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX3N0YXInLCB7XG4gICAgICAnQ09MT1InOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ2dyZWVuJyB9ICksXG4gICAgICAnU1RZTEUnOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdHJpbmcnLCBudWxsLCB7IFZBTDogJ3NvbGlkJyB9KSxcbiAgICAgICdTSVpFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfbWF0aF9udW1iZXInLCBudWxsLCB7IE5VTTogMjAwIH0gKVxuICAgIH0pLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3BsdXMnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX21pbnVzJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90aW1lcycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfZGl2aWRlZGJ5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9tYXRoX251bWJlcicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3RyaW5nJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9zdHlsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfY2lyY2xlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF90cmlhbmdsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3F1YXJlJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9yZWN0YW5nbGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2VsbGlwc2UnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3N0YXInKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX3JhZGlhbF9zdGFyJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9wb2x5Z29uJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgncGxhY2VfaW1hZ2UnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdvZmZzZXQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdvdmVybGF5JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgndW5kZXJsYXknKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdyb3RhdGUnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzY2FsZScpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfdGV4dCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ3N0cmluZ19hcHBlbmQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdzdHJpbmdfbGVuZ3RoJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9ncmVhdGVyX3RoYW4nKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xlc3NfdGhhbicpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbnVtYmVyX2VxdWFscycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfc3RyaW5nX2VxdWFscycpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2Z1bmN0aW9uYWxfbG9naWNhbF9hbmQnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xvZ2ljYWxfb3InKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdmdW5jdGlvbmFsX2xvZ2ljYWxfbm90JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnZnVuY3Rpb25hbF9ib29sZWFuJylcbiAgICApLFxuICAgIHN0YXJ0QmxvY2tzOiBibG9ja1V0aWxzLm1hdGhCbG9ja1htbCgnZnVuY3Rpb25hbF9zdGFyJywge1xuICAgICAgJ0NPTE9SJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdibGFjaycgfSApLFxuICAgICAgJ1NUWUxFJzogYmxvY2tVdGlscy5tYXRoQmxvY2tYbWwoJ2Z1bmN0aW9uYWxfc3RyaW5nJywgbnVsbCwgeyBWQUw6ICdzb2xpZCcgfSksXG4gICAgICAnU0laRSc6IGJsb2NrVXRpbHMubWF0aEJsb2NrWG1sKCdmdW5jdGlvbmFsX21hdGhfbnVtYmVyJywgbnVsbCwgeyBOVU06IDIwMCB9IClcbiAgICB9KSxcbiAgICByZXF1aXJlZEJsb2NrczogJycsXG4gICAgZnJlZVBsYXk6IGZhbHNlXG4gIH0sXG5cbiAgJ2N1c3RvbSc6IHtcbiAgICBhbnN3ZXI6ICcnLFxuICAgIGlkZWFsOiBJbmZpbml0eSxcbiAgICB0b29sYm94OiAnJyxcbiAgICBzdGFydEJsb2NrczogJycsXG4gICAgcmVxdWlyZWRCbG9ja3M6ICcnLFxuICAgIGZyZWVQbGF5OiBmYWxzZVxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuICB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbiAgdmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuOyBidWYucHVzaCgnXFxuXFxuPGJ1dHRvbiBpZD1cImNvbnRpbnVlQnV0dG9uXCIgY2xhc3M9XCJsYXVuY2ggaGlkZSBmbG9hdC1yaWdodFwiPlxcbiAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDcsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg3LCAgY29tbW9uTXNnLmNvbnRpbnVlKCkgKSksICdcXG48L2J1dHRvbj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogRXZhbCBHcmFwaGljc1xuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IEV2YWwgR3JhcGhpY3MuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG52YXIgc2hhcmVkRnVuY3Rpb25hbEJsb2NrcyA9IHJlcXVpcmUoJy4uL3NoYXJlZEZ1bmN0aW9uYWxCbG9ja3MnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIHZhciBnZW5zeW0gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIE5BTUVfVFlQRSA9IGJsb2NrbHkuVmFyaWFibGVzLk5BTUVfVFlQRTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yLnZhcmlhYmxlREJfLmdldERpc3RpbmN0TmFtZShuYW1lLCBOQU1FX1RZUEUpO1xuICB9O1xuXG4gIHNoYXJlZEZ1bmN0aW9uYWxCbG9ja3MuaW5zdGFsbChibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfZGlzcGxheScsXG4gICAgYmxvY2tUaXRsZTogbXNnLmRpc3BsYXlCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ2Rpc3BsYXknLFxuICAgIHJldHVyblR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTk9ORSxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdBUkcxJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OT05FIH0sXG4gICAgXVxuICB9KTtcblxuICAvLyBzaGFwZXNcbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfY2lyY2xlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuY2lyY2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdjaXJjbGUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF90cmlhbmdsZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnRyaWFuZ2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICd0cmlhbmdsZScsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3NxdWFyZScsXG4gICAgYmxvY2tUaXRsZTogbXNnLnNxdWFyZUJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3F1YXJlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdTSVpFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfcmVjdGFuZ2xlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucmVjdGFuZ2xlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdyZWN0YW5nbGUnLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1dJRFRIJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0hFSUdIVCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX2VsbGlwc2UnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5lbGxpcHNlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdlbGxpcHNlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdXSURUSCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdIRUlHSFQnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnU1RZTEUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnZnVuY3Rpb25hbF9zdGFyJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3RhckJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAnc3RhcicsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnU0laRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3JhZGlhbF9zdGFyJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucmFkaWFsU3RhckJsb2NrVGl0bGUoKSxcbiAgICBhcGlOYW1lOiAncmFkaWFsU3RhcicsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnUE9JTlRTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lOTkVSJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ09VVEVSJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1NUWUxFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ0NPTE9SJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ2Z1bmN0aW9uYWxfcG9seWdvbicsXG4gICAgYmxvY2tUaXRsZTogbXNnLnBvbHlnb25CbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3BvbHlnb24nLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NJREVTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0xFTkdUSCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdTVFlMRScsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH0sXG4gICAgICB7IG5hbWU6ICdDT0xPUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3RleHQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy50ZXh0QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICd0ZXh0JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdURVhUJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHsgbmFtZTogJ1NJWkUnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnQ09MT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9XG4gICAgXVxuICB9KTtcblxuICAvLyBpbWFnZSBtYW5pcHVsYXRpb25cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ292ZXJsYXknLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5vdmVybGF5QmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdvdmVybGF5JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdUT1AnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgICB7IG5hbWU6ICdCT1RUT00nLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgXSxcbiAgICB2ZXJ0aWNhbGx5U3RhY2tJbnB1dHM6IHRydWVcbiAgfSk7XG5cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3VuZGVybGF5JyxcbiAgICBibG9ja1RpdGxlOiBtc2cudW5kZXJsYXlCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3VuZGVybGF5JyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdCT1RUT00nLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH0sXG4gICAgICB7IG5hbWU6ICdUT1AnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdLFxuICAgIHZlcnRpY2FsbHlTdGFja0lucHV0czogdHJ1ZVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAncGxhY2VfaW1hZ2UnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5wbGFjZUltYWdlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdwbGFjZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdYJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ1knLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdvZmZzZXQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5vZmZzZXRCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ29mZnNldCcsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnWCcsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSIH0sXG4gICAgICB7IG5hbWU6ICdZJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAncm90YXRlJyxcbiAgICBibG9ja1RpdGxlOiBtc2cucm90YXRlSW1hZ2VCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3JvdGF0ZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdERUdSRUVTJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIgfSxcbiAgICAgIHsgbmFtZTogJ0lNQUdFJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5JTUFHRSB9XG4gICAgXVxuICB9KTtcblxuICBpbnN0YWxsRnVuY3Rpb25hbEJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgZ2Vuc3ltLCB7XG4gICAgYmxvY2tOYW1lOiAnc2NhbGUnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zY2FsZUltYWdlQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzY2FsZUltYWdlJyxcbiAgICBhcmdzOiBbXG4gICAgICB7IG5hbWU6ICdGQUNUT1InLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUiB9LFxuICAgICAgeyBuYW1lOiAnSU1BR0UnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFIH1cbiAgICBdXG4gIH0pO1xuXG4gIC8vIHN0cmluZyBtYW5pcHVsYXRpb25cbiAgaW5zdGFsbEZ1bmN0aW9uYWxCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIGdlbnN5bSwge1xuICAgIGJsb2NrTmFtZTogJ3N0cmluZ19hcHBlbmQnLFxuICAgIGJsb2NrVGl0bGU6IG1zZy5zdHJpbmdBcHBlbmRCbG9ja1RpdGxlKCksXG4gICAgYXBpTmFtZTogJ3N0cmluZ0FwcGVuZCcsXG4gICAgcmV0dXJuVHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcsXG4gICAgYXJnczogW1xuICAgICAgeyBuYW1lOiAnRklSU1QnLCB0eXBlOiBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLlNUUklORyB9LFxuICAgICAgeyBuYW1lOiAnU0VDT05EJywgdHlwZTogYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5TVFJJTkcgfVxuICAgIF1cbiAgfSk7XG5cbiAgLy8gcG9sbGluZyBmb3IgdmFsdWVzXG4gIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIHtcbiAgICBibG9ja05hbWU6ICdzdHJpbmdfbGVuZ3RoJyxcbiAgICBibG9ja1RpdGxlOiBtc2cuc3RyaW5nTGVuZ3RoQmxvY2tUaXRsZSgpLFxuICAgIGFwaU5hbWU6ICdzdHJpbmdMZW5ndGgnLFxuICAgIHJldHVyblR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSLFxuICAgIGFyZ3M6IFtcbiAgICAgIHsgbmFtZTogJ1NUUicsIHR5cGU6IGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuU1RSSU5HIH1cbiAgICBdXG4gIH0pO1xuXG4gIGJsb2NrbHkuRnVuY3Rpb25hbEJsb2NrVXRpbHMuaW5zdGFsbFN0cmluZ1BpY2tlcihibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBibG9ja05hbWU6ICdmdW5jdGlvbmFsX3N0eWxlJyxcbiAgICB2YWx1ZXM6IFtcbiAgICAgIFttc2cuc29saWQoKSwgJ3NvbGlkJ10sXG4gICAgICBbJzc1JScsICc3NSUnXSxcbiAgICAgIFsnNTAlJywgJzUwJSddLFxuICAgICAgWycyNSUnLCAnMjUlJ10sXG4gICAgICBbbXNnLm91dGxpbmUoKSwgJ291dGxpbmUnXVxuICAgIF1cbiAgfSk7XG59O1xuXG5cbmZ1bmN0aW9uIGluc3RhbGxGdW5jdGlvbmFsQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBnZW5zeW0sIG9wdGlvbnMpIHtcbiAgdmFyIGJsb2NrTmFtZSA9IG9wdGlvbnMuYmxvY2tOYW1lO1xuICB2YXIgYmxvY2tUaXRsZSA9IG9wdGlvbnMuYmxvY2tUaXRsZTtcbiAgdmFyIGFwaU5hbWUgPSBvcHRpb25zLmFwaU5hbWU7XG4gIHZhciBhcmdzID0gb3B0aW9ucy5hcmdzO1xuICB2YXIgcmV0dXJuVHlwZSA9IG9wdGlvbnMucmV0dXJuVHlwZSB8fCBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLklNQUdFO1xuXG4gIGJsb2NrbHkuQmxvY2tzW2Jsb2NrTmFtZV0gPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgYmxvY2tseS5GdW5jdGlvbmFsQmxvY2tVdGlscy5pbml0VGl0bGVkRnVuY3Rpb25hbEJsb2NrKHRoaXMsIGJsb2NrVGl0bGUsIHJldHVyblR5cGUsIGFyZ3MsIHtcbiAgICAgICAgdmVydGljYWxseVN0YWNrSW5wdXRzOiBvcHRpb25zLnZlcnRpY2FsbHlTdGFja0lucHV0c1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvcltibG9ja05hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwaUFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhcmcgPSBhcmdzW2ldO1xuICAgICAgdmFyIGFwaUFyZyA9IEJsb2NrbHkuSmF2YVNjcmlwdC5zdGF0ZW1lbnRUb0NvZGUodGhpcywgYXJnLm5hbWUsIGZhbHNlKTtcbiAgICAgIC8vIFByb3ZpZGUgZGVmYXVsdHNcbiAgICAgIGlmICghYXBpQXJnKSB7XG4gICAgICAgIGlmIChhcmcudHlwZSA9PT0gYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpIHtcbiAgICAgICAgICBhcGlBcmcgPSAnMCc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnLm5hbWUgPT09ICdTVFlMRScpIHtcbiAgICAgICAgICBhcGlBcmcgPSBibG9ja2x5LkphdmFTY3JpcHQucXVvdGVfKCdzb2xpZCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZy5uYW1lID09PSAnQ09MT1InKSB7XG4gICAgICAgICAgYXBpQXJnID0gYmxvY2tseS5KYXZhU2NyaXB0LnF1b3RlXygnYmxhY2snKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXBpQXJncy5wdXNoKGFwaUFyZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwiRXZhbC5cIiArIGFwaU5hbWUgKyBcIihcIiArIGFwaUFyZ3Muam9pbihcIiwgXCIpICsgXCIpXCI7XG4gIH07XG59XG4iLCJ2YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcbnZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIEV2YWxUZXh0ID0gcmVxdWlyZSgnLi9ldmFsVGV4dCcpO1xudmFyIEV2YWxDaXJjbGUgPSByZXF1aXJlKCcuL2V2YWxDaXJjbGUnKTtcbnZhciBFdmFsVHJpYW5nbGUgPSByZXF1aXJlKCcuL2V2YWxUcmlhbmdsZScpO1xudmFyIEV2YWxNdWx0aSA9IHJlcXVpcmUoJy4vZXZhbE11bHRpJyk7XG52YXIgRXZhbFJlY3QgPSByZXF1aXJlKCcuL2V2YWxSZWN0Jyk7XG52YXIgRXZhbEVsbGlwc2UgPSByZXF1aXJlKCcuL2V2YWxFbGxpcHNlJyk7XG52YXIgRXZhbFRleHQgPSByZXF1aXJlKCcuL2V2YWxUZXh0Jyk7XG52YXIgRXZhbFN0YXIgPSByZXF1aXJlKCcuL2V2YWxTdGFyJyk7XG52YXIgRXZhbFBvbHlnb24gPSByZXF1aXJlKCcuL2V2YWxQb2x5Z29uJyk7XG5cbi8vIFdlIGRvbid0IHVzZSBibG9ja0lkIGF0IGFsbCBpbiBFdmFsIHNpbmNlIGV2ZXJ5dGhpbmcgaXMgZXZhbHVhdGVkIGF0IG9uY2UuXG5cbmV4cG9ydHMuZGlzcGxheSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgb2JqZWN0ID0gXCJcIjtcbiAgfVxuXG4gIC8vIGNhbGwgdG9sb2NhbGVTdHJpbmcgb24gbnVtYmVycyBzbyB0aGF0IHdlIGdldCBjb21tYXMgZm9yIGxhcmdlIG51bWJlcnNcbiAgaWYgKHR5cGVvZihvYmplY3QpID09PSAnbnVtYmVyJyAmJiBvYmplY3QudG9Mb2NhbGVTdHJpbmcpIHtcbiAgICBvYmplY3QgPSBvYmplY3QudG9Mb2NhbGVTdHJpbmcoKTtcbiAgfVxuXG4gIGlmICghb2JqZWN0LmRyYXcpIHtcbiAgICBvYmplY3QgPSBuZXcgRXZhbFRleHQob2JqZWN0LnRvU3RyaW5nKCksIDEyLCAnYmxhY2snKTtcbiAgfVxuICBFdmFsLmRpc3BsYXllZE9iamVjdCA9IG9iamVjdDtcbn07XG5cbmV4cG9ydHMuY2lyY2xlID0gZnVuY3Rpb24gKHNpemUsIHN0eWxlLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxDaXJjbGUoc2l6ZSwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMudHJpYW5nbGUgPSBmdW5jdGlvbiAoc2l6ZSwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFRyaWFuZ2xlKHNpemUsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLm92ZXJsYXkgPSBmdW5jdGlvbiAodG9wLCBib3R0b20pIHtcbiAgcmV0dXJuIG5ldyBFdmFsTXVsdGkodG9wLCBib3R0b20pO1xufTtcblxuZXhwb3J0cy51bmRlcmxheSA9IGZ1bmN0aW9uIChib3R0b20sIHRvcCkge1xuICByZXR1cm4gbmV3IEV2YWxNdWx0aSh0b3AsIGJvdHRvbSk7XG59O1xuXG5leHBvcnRzLnNxdWFyZSA9IGZ1bmN0aW9uIChzaXplLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsUmVjdChzaXplLCBzaXplLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5yZWN0YW5nbGUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFJlY3Qod2lkdGgsIGhlaWdodCwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMuZWxsaXBzZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsRWxsaXBzZSh3aWR0aCwgaGVpZ2h0LCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy50ZXh0ID0gZnVuY3Rpb24gKHRleHQsIGZvbnRTaXplLCBjb2xvcikge1xuICByZXR1cm4gbmV3IEV2YWxUZXh0KHRleHQsIGZvbnRTaXplLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnN0YXIgPSBmdW5jdGlvbiAocmFkaXVzLCBzdHlsZSwgY29sb3IpIHtcbiAgdmFyIGlubmVyUmFkaXVzID0gKDMgLSBNYXRoLnNxcnQoNSkpIC8gMiAqIHJhZGl1cztcbiAgcmV0dXJuIG5ldyBFdmFsU3Rhcig1LCBpbm5lclJhZGl1cywgcmFkaXVzLCBzdHlsZSwgY29sb3IpO1xufTtcblxuZXhwb3J0cy5yYWRpYWxTdGFyID0gZnVuY3Rpb24gKHBvaW50cywgaW5uZXIsIG91dGVyLCBzdHlsZSwgY29sb3IpIHtcbiAgcmV0dXJuIG5ldyBFdmFsU3Rhcihwb2ludHMsIGlubmVyLCBvdXRlciwgc3R5bGUsIGNvbG9yKTtcbn07XG5cbmV4cG9ydHMucG9seWdvbiA9IGZ1bmN0aW9uIChwb2ludHMsIGxlbmd0aCwgc3R5bGUsIGNvbG9yKSB7XG4gIHJldHVybiBuZXcgRXZhbFBvbHlnb24ocG9pbnRzLCBsZW5ndGgsIHN0eWxlLCBjb2xvcik7XG59O1xuXG5leHBvcnRzLnBsYWNlSW1hZ2UgPSBmdW5jdGlvbiAoeCwgeSwgaW1hZ2UpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih4KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcih5KTtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UsIEV2YWxJbWFnZSk7XG5cbiAgLy8gb3JpZ2luIGF0IGNlbnRlclxuICB4ID0geCArIEV2YWwuQ0FOVkFTX1dJRFRIIC8gMjtcbiAgeSA9IHkgKyBFdmFsLkNBTlZBU19IRUlHSFQgLyAyO1xuXG4gIC8vIFVzZXIgaW5wdXRzIHkgaW4gY2FydGVzaWFuIHNwYWNlLiBDb252ZXJ0IHRvIHBpeGVsIHNwYWNlIGJlZm9yZSBzZW5kaW5nXG4gIC8vIHRvIG91ciBFdmFsSW1hZ2UuXG4gIHkgPSBldmFsVXRpbHMuY2FydGVzaWFuVG9QaXhlbCh5KTtcblxuICAvLyByZWxhdGl2ZSB0byBjZW50ZXIgb2Ygd29ya3NwYWNlXG4gIGltYWdlLnBsYWNlKHgsIHkpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLm9mZnNldCA9IGZ1bmN0aW9uICh4LCB5LCBpbWFnZSkge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHgpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHkpO1xuICBldmFsVXRpbHMuZW5zdXJlVHlwZShpbWFnZSwgRXZhbEltYWdlKTtcblxuICB4ID0gaW1hZ2UueF8gKyB4O1xuICB5ID0gaW1hZ2UueV8gLSB5O1xuXG4gIGltYWdlLnBsYWNlKHgsIHkpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLnJvdGF0ZUltYWdlID0gZnVuY3Rpb24gKGRlZ3JlZXMsIGltYWdlKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIoZGVncmVlcyk7XG5cbiAgaW1hZ2Uucm90YXRlKGRlZ3JlZXMpO1xuICByZXR1cm4gaW1hZ2U7XG59O1xuXG5leHBvcnRzLnNjYWxlSW1hZ2UgPSBmdW5jdGlvbiAoZmFjdG9yLCBpbWFnZSkge1xuICBpbWFnZS5zY2FsZShmYWN0b3IsIGZhY3Rvcik7XG4gIHJldHVybiBpbWFnZTtcbn07XG5cbmV4cG9ydHMuc3RyaW5nQXBwZW5kID0gZnVuY3Rpb24gKGZpcnN0LCBzZWNvbmQpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyhmaXJzdCk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHJpbmcoc2Vjb25kKTtcblxuICByZXR1cm4gZmlyc3QgKyBzZWNvbmQ7XG59O1xuXG4vLyBwb2xsaW5nIGZvciB2YWx1ZXNcbmV4cG9ydHMuc3RyaW5nTGVuZ3RoID0gZnVuY3Rpb24gKHN0cikge1xuICBldmFsVXRpbHMuZW5zdXJlU3RyaW5nKHN0cik7XG5cbiAgcmV0dXJuIHN0ci5sZW5ndGg7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxUcmlhbmdsZSA9IGZ1bmN0aW9uIChlZGdlLCBzdHlsZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihlZGdlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMuZWRnZV8gPSBlZGdlO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxUcmlhbmdsZS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsVHJpYW5nbGU7XG5cbkV2YWxUcmlhbmdsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3BvbHlnb24nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICAvLyBjZW50ZXIgYXQgMCwgMCAoYWxsb3dpbmcgdHJhbnNmb3JtcyB0byBtb3ZlIGl0IGFyb3VuZClcbiAgLy8gdGhlIGNlbnRlciBpcyBoYWxmd2F5IGJldHdlZW4gd2lkdGgsIGFuZCBhIHRoaXJkIG9mIHRoZSB3YXkgdXAgdGhlIGhlaWdodFxuICB2YXIgaGVpZ2h0ID0gTWF0aC5zcXJ0KDMpIC8gMiAqIHRoaXMuZWRnZV87XG5cbiAgdmFyIGJvdHRvbUxlZnQgPSB7XG4gICAgeDogLXRoaXMuZWRnZV8gLyAyLFxuICAgIHk6IGhlaWdodCAvIDNcbiAgfTtcblxuICB2YXIgYm90dG9tUmlnaHQgPSB7XG4gICAgeDogdGhpcy5lZGdlXyAvIDIsXG4gICAgeTogaGVpZ2h0IC8gM1xuICB9O1xuXG4gIHZhciB0b3AgPSB7XG4gICAgeDogMCxcbiAgICB5OiAtaGVpZ2h0ICogMiAvIDNcbiAgfTtcblxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncG9pbnRzJyxcbiAgICBib3R0b21MZWZ0LnggKycsJyArIGJvdHRvbUxlZnQueSArICcgJyArXG4gICAgYm90dG9tUmlnaHQueCArICcsJyArIGJvdHRvbVJpZ2h0LnkgKyAnICcgK1xuICAgIHRvcC54ICsgJywnICsgdG9wLnkpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsVGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCBmb250U2l6ZSwgY29sb3IpIHtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0cmluZyh0ZXh0KTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihmb250U2l6ZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFsnc29saWQnLCBjb2xvcl0pO1xuXG4gIHRoaXMudGV4dF8gPSB0ZXh0O1xuICB0aGlzLmZvbnRTaXplXyA9IGZvbnRTaXplO1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxUZXh0LmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxUZXh0O1xuXG5FdmFsVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RleHQnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cbiAgdGhpcy5lbGVtZW50Xy50ZXh0Q29udGVudCA9IHRoaXMudGV4dF87XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdzdHlsZScsICdmb250LXNpemU6ICcgKyB0aGlzLmZvbnRTaXplXyArICdwdCcpO1xuXG4gIHZhciBiYm94ID0gdGhpcy5lbGVtZW50Xy5nZXRCQm94KCk7XG4gIC8vIGNlbnRlciBhdCBvcmlnaW5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3gnLCAtYmJveC53aWR0aCAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneScsIC1iYm94LmhlaWdodCAvIDIpO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuRXZhbFRleHQucHJvdG90eXBlLmdldFRleHQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRleHRfO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsU3RhciA9IGZ1bmN0aW9uIChwb2ludENvdW50LCBpbm5lciwgb3V0ZXIsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHBvaW50Q291bnQpO1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKGlubmVyKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihvdXRlcik7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLm91dGVyXyA9IG91dGVyO1xuICB0aGlzLmlubmVyXyA9IGlubmVyO1xuICB0aGlzLnBvaW50Q291bnRfID0gcG9pbnRDb3VudDtcblxuICB0aGlzLmVsZW1lbnRfID0gbnVsbDtcbn07XG5FdmFsU3Rhci5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsU3RhcjtcblxuRXZhbFN0YXIucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICghdGhpcy5lbGVtZW50Xykge1xuICAgIHRoaXMuZWxlbWVudF8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdwb2x5Z29uJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG5cbiAgdmFyIHBvaW50cyA9IFtdO1xuICB2YXIgb3V0ZXJSYWRpdXMgPSB0aGlzLm91dGVyXztcbiAgdmFyIGlubmVyUmFkaXVzID0gdGhpcy5pbm5lcl87XG5cbiAgdmFyIGFuZ2xlRGVsdGEgPSAyICogTWF0aC5QSSAvIHRoaXMucG9pbnRDb3VudF87XG4gIGZvciAodmFyIGFuZ2xlID0gMDsgYW5nbGUgPCAyICogTWF0aC5QSTsgYW5nbGUgKz0gYW5nbGVEZWx0YSkge1xuICAgIHBvaW50cy5wdXNoKG91dGVyUmFkaXVzICogTWF0aC5jb3MoYW5nbGUpICsgXCIsXCIgKyBvdXRlclJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSk7XG4gICAgcG9pbnRzLnB1c2goaW5uZXJSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSArIGFuZ2xlRGVsdGEgLyAyKSArIFwiLFwiICtcbiAgICAgIGlubmVyUmFkaXVzICogTWF0aC5zaW4oYW5nbGUgKyBhbmdsZURlbHRhIC8gMikpO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3BvaW50cycsIHBvaW50cy5qb2luKCcgJykpO1xuICBpZiAodGhpcy5wb2ludENvdW50XyAlIDIgPT0gMSkge1xuICAgIHRoaXMucm90YXRlKC05MCAvIHRoaXMucG9pbnRDb3VudF8pO1xuICB9XG5cbiAgRXZhbEltYWdlLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuIiwidmFyIEV2YWxJbWFnZSA9IHJlcXVpcmUoJy4vZXZhbEltYWdlJyk7XG52YXIgZXZhbFV0aWxzID0gcmVxdWlyZSgnLi9ldmFsVXRpbHMnKTtcblxudmFyIEV2YWxSZWN0ID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHdpZHRoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihoZWlnaHQpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy53aWR0aF8gPSB3aWR0aDtcbiAgdGhpcy5oZWlnaHRfID0gaGVpZ2h0O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxSZWN0LmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxSZWN0O1xuXG5FdmFsUmVjdC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3JlY3QnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICAvLyBjZW50ZXIgcmVjdCBhdCAwLCAwLiB3ZSdsbCB1c2UgdHJhbnNmb3JtcyB0byBtb3ZlIGl0LlxuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneCcsIC10aGlzLndpZHRoXyAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgneScsIC10aGlzLmhlaWdodF8gLyAyKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aF8pO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHRfKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbFBvbHlnb24gPSBmdW5jdGlvbiAoc2lkZUNvdW50LCBsZW5ndGgsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHNpZGVDb3VudCk7XG4gIGV2YWxVdGlscy5lbnN1cmVOdW1iZXIobGVuZ3RoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVN0eWxlKHN0eWxlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZUNvbG9yKGNvbG9yKTtcblxuICBFdmFsSW1hZ2UuYXBwbHkodGhpcywgW3N0eWxlLCBjb2xvcl0pO1xuXG4gIHRoaXMucmFkaXVzXyA9IGxlbmd0aCAvICgyICogTWF0aC5zaW4oTWF0aC5QSSAvIHNpZGVDb3VudCkpO1xuICB0aGlzLnBvaW50Q291bnRfID0gc2lkZUNvdW50O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxQb2x5Z29uLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxQb2x5Z29uO1xuXG5FdmFsUG9seWdvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3BvbHlnb24nKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cblxuICB2YXIgcG9pbnRzID0gW107XG4gIHZhciByYWRpdXMgPSB0aGlzLnJhZGl1c187XG5cbiAgdmFyIGFuZ2xlID0gMiAqIE1hdGguUEkgLyB0aGlzLnBvaW50Q291bnRfO1xuICBmb3IgKHZhciBpID0gMTsgaSA8PSB0aGlzLnBvaW50Q291bnRfOyBpKyspIHtcbiAgICBwb2ludHMucHVzaChyYWRpdXMgKiBNYXRoLmNvcyhpICogYW5nbGUpICsgXCIsXCIgKyByYWRpdXMgKiBNYXRoLnNpbihpICogYW5nbGUpKTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdwb2ludHMnLCBwb2ludHMuam9pbignICcpKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbE11bHRpID0gZnVuY3Rpb24gKGltYWdlMSwgaW1hZ2UyKSB7XG4gIGV2YWxVdGlscy5lbnN1cmVUeXBlKGltYWdlMSwgRXZhbEltYWdlKTtcbiAgZXZhbFV0aWxzLmVuc3VyZVR5cGUoaW1hZ2UyLCBFdmFsSW1hZ2UpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzKTtcblxuICB0aGlzLmltYWdlMV8gPSBpbWFnZTE7XG4gIHRoaXMuaW1hZ2UyXyA9IGltYWdlMjtcblxuICAvLyB3ZSB3YW50IGFuIG9iamVjdCBjZW50ZXJlZCBhdCAwLCAwIHRoYXQgd2UgY2FuIHRoZW4gYXBwbHkgdHJhbnNmb3JtcyB0by5cbiAgLy8gdG8gYWNjb21wbGlzaCB0aGlzLCB3ZSBuZWVkIHRvIGFkanVzdCB0aGUgY2hpbGRyZW4ncyB4L3kncyB0byBiZSByZWxhdGl2ZVxuICAvLyB0byB1c1xuICB2YXIgZGVsdGFYLCBkZWx0YVk7XG4gIGRlbHRhWCA9IHRoaXMuaW1hZ2UxXy54XyAtIHRoaXMueF87XG4gIGRlbHRhWSA9IHRoaXMuaW1hZ2UxXy55XyAtIHRoaXMueV87XG4gIHRoaXMuaW1hZ2UxXy51cGRhdGVQb3NpdGlvbihkZWx0YVgsIGRlbHRhWSk7XG4gIGRlbHRhWCA9IHRoaXMuaW1hZ2UyXy54XyAtIHRoaXMueF87XG4gIGRlbHRhWSA9IHRoaXMuaW1hZ2UyXy55XyAtIHRoaXMueV87XG4gIHRoaXMuaW1hZ2UyXy51cGRhdGVQb3NpdGlvbihkZWx0YVgsIGRlbHRhWSk7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbE11bHRpLmluaGVyaXRzKEV2YWxJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxNdWx0aTtcblxuRXZhbE11bHRpLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB2YXIgZGVsdGFYLCBkZWx0YVk7XG5cbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnZycpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRfKTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2UyXy5kcmF3KHRoaXMuZWxlbWVudF8pO1xuICB0aGlzLmltYWdlMV8uZHJhdyh0aGlzLmVsZW1lbnRfKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUuZ2V0Q2hpbGRyZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBbdGhpcy5pbWFnZTFfLCB0aGlzLmltYWdlMl9dO1xufTtcbiIsInZhciBFdmFsSW1hZ2UgPSByZXF1aXJlKCcuL2V2YWxJbWFnZScpO1xudmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsQ2lyY2xlID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHdpZHRoKTtcbiAgZXZhbFV0aWxzLmVuc3VyZU51bWJlcihoZWlnaHQpO1xuICBldmFsVXRpbHMuZW5zdXJlU3R5bGUoc3R5bGUpO1xuICBldmFsVXRpbHMuZW5zdXJlQ29sb3IoY29sb3IpO1xuXG4gIEV2YWxJbWFnZS5hcHBseSh0aGlzLCBbc3R5bGUsIGNvbG9yXSk7XG5cbiAgdGhpcy53aWR0aF8gPSB3aWR0aDtcbiAgdGhpcy5oZWlnaHRfID0gaGVpZ2h0O1xuXG4gIHRoaXMuZWxlbWVudF8gPSBudWxsO1xufTtcbkV2YWxDaXJjbGUuaW5oZXJpdHMoRXZhbEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gRXZhbENpcmNsZTtcblxuRXZhbENpcmNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKCF0aGlzLmVsZW1lbnRfKSB7XG4gICAgdGhpcy5lbGVtZW50XyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2VsbGlwc2UnKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50Xyk7XG4gIH1cbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ2N4JywgMCk7XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeScsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncngnLCB0aGlzLndpZHRoXyAvIDIpO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgncnknLCB0aGlzLmhlaWdodF8gLyAyKTtcblxuICBFdmFsSW1hZ2UucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgRXZhbEltYWdlID0gcmVxdWlyZSgnLi9ldmFsSW1hZ2UnKTtcbnZhciBldmFsVXRpbHMgPSByZXF1aXJlKCcuL2V2YWxVdGlscycpO1xuXG52YXIgRXZhbENpcmNsZSA9IGZ1bmN0aW9uIChyYWRpdXMsIHN0eWxlLCBjb2xvcikge1xuICBldmFsVXRpbHMuZW5zdXJlTnVtYmVyKHJhZGl1cyk7XG4gIGV2YWxVdGlscy5lbnN1cmVTdHlsZShzdHlsZSk7XG4gIGV2YWxVdGlscy5lbnN1cmVDb2xvcihjb2xvcik7XG5cbiAgRXZhbEltYWdlLmFwcGx5KHRoaXMsIFtzdHlsZSwgY29sb3JdKTtcblxuICB0aGlzLnJhZGl1c18gPSByYWRpdXM7XG5cbiAgdGhpcy5lbGVtZW50XyA9IG51bGw7XG59O1xuRXZhbENpcmNsZS5pbmhlcml0cyhFdmFsSW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBFdmFsQ2lyY2xlO1xuXG5FdmFsQ2lyY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAoIXRoaXMuZWxlbWVudF8pIHtcbiAgICB0aGlzLmVsZW1lbnRfID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnY2lyY2xlJyk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudF8pO1xuICB9XG4gIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdjeCcsIDApO1xuICB0aGlzLmVsZW1lbnRfLnNldEF0dHJpYnV0ZSgnY3knLCAwKTtcbiAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3InLCB0aGlzLnJhZGl1c18pO1xuXG4gIEV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuRXZhbENpcmNsZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKCkge1xuICAvLyBOby1vcC4gUm90YXRpbmcgdGhlIGNpcmNsZSBzdmcgZ2l2ZXMgdXMgc29tZSBwcm9ibGVtcyB3aGVuIHdlIGNvbnZlcnQgdG9cbiAgLy8gYSBiaXRtYXAuXG59O1xuIiwidmFyIGV2YWxVdGlscyA9IHJlcXVpcmUoJy4vZXZhbFV0aWxzJyk7XG5cbnZhciBFdmFsSW1hZ2UgPSBmdW5jdGlvbiAoc3R5bGUsIGNvbG9yKSB7XG4gIC8vIHgveSBsb2NhdGlvbiBpbiBwaXhlbCBzcGFjZSBvZiBvYmplY3QncyBjZW50ZXJcbiAgdGhpcy54XyA9IDIwMDtcbiAgdGhpcy55XyA9IDIwMDtcblxuICB0aGlzLnJvdGF0aW9uXyA9IDA7XG4gIHRoaXMuc2NhbGVYXyA9IDEuMDtcbiAgdGhpcy5zY2FsZVkgPSAxLjA7XG5cbiAgdGhpcy5zdHlsZV8gPSBzdHlsZTtcbiAgdGhpcy5jb2xvcl8gPSBjb2xvcjtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEV2YWxJbWFnZTtcblxuRXZhbEltYWdlLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHRoaXMueF8gPSB4O1xuICB0aGlzLnlfID0geTtcbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uIChwYXJlbnRFbGVtZW50KSB7XG4gIGlmICh0aGlzLnN0eWxlXyAmJiB0aGlzLmNvbG9yXykge1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKCdmaWxsJywgZXZhbFV0aWxzLmdldEZpbGwodGhpcy5zdHlsZV8sIHRoaXMuY29sb3JfKSk7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIGV2YWxVdGlscy5nZXRTdHJva2UodGhpcy5zdHlsZV8sIHRoaXMuY29sb3JfKSk7XG4gICAgdGhpcy5lbGVtZW50Xy5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCBldmFsVXRpbHMuZ2V0T3BhY2l0eSh0aGlzLnN0eWxlXywgdGhpcy5jb2xvcl8pKTtcbiAgfVxuXG4gIHZhciB0cmFuc2Zvcm0gPSBcIlwiO1xuICB0cmFuc2Zvcm0gKz0gXCIgdHJhbnNsYXRlKFwiICsgdGhpcy54XyArIFwiIFwiICsgdGhpcy55XyArIFwiKVwiO1xuXG4gIGlmICh0aGlzLnNjYWxlWF8gIT09IDEuMCB8fCB0aGlzLnNjYWxlWSAhPT0gMS4wKSB7XG4gICAgdHJhbnNmb3JtICs9IFwiIHNjYWxlKFwiICsgdGhpcy5zY2FsZVhfICsgXCIgXCIgKyB0aGlzLnNjYWxlWV8gKyBcIilcIjtcbiAgfVxuXG4gIGlmICh0aGlzLnJvdGF0aW9uXyAhPT0gMCkge1xuICAgIHRyYW5zZm9ybSArPSBcIiByb3RhdGUoXCIgKyB0aGlzLnJvdGF0aW9uXyArIFwiKVwiO1xuICB9XG5cbiAgaWYgKHRyYW5zZm9ybSA9PT0gXCJcIikge1xuICAgIHRoaXMuZWxlbWVudF8ucmVtb3ZlQXR0cmlidXRlKFwidHJhbnNmb3JtXCIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZWxlbWVudF8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSk7XG4gIH1cbn07XG5cbkV2YWxJbWFnZS5wcm90b3R5cGUucGxhY2UgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB0aGlzLnhfID0geDtcbiAgdGhpcy55XyA9IHk7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gIHRoaXMucm90YXRpb25fICs9IGRlZ3JlZXM7XG59O1xuXG5FdmFsSW1hZ2UucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKHNjYWxlWCwgc2NhbGVZKSB7XG4gIHRoaXMuc2NhbGVYXyA9IHNjYWxlWDtcbiAgdGhpcy5zY2FsZVlfID0gc2NhbGVZO1xufTtcblxuLyoqXG4gKiBHZXQgY2hpbGQgRXZhbE9iamVjdHMuIG92ZXJyaWRkZW4gYnkgY2hpbGRyZW5cbiAqL1xuRXZhbEltYWdlLnByb3RvdHlwZS5nZXRDaGlsZHJlbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFtdO1xufTtcbiIsInZhciBDdXN0b21FdmFsRXJyb3IgPSByZXF1aXJlKCcuL2V2YWxFcnJvcicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogVGhyb3dzIGFuIGV4cGVjdGlvbiBpZiB2YWwgaXMgbm90IG9mIHRoZSBleHBlY3RlZCB0eXBlLiBUeXBlIGlzIGVpdGhlciBhXG4gKiBzdHJpbmcgKGxpa2UgXCJudW1iZXJcIiBvciBcInN0cmluZ1wiKSBvciBhbiBvYmplY3QgKExpa2UgRXZhbEltYWdlKS5cbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlU3RyaW5nID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gbW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSh2YWwsIFwic3RyaW5nXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZW5zdXJlTnVtYmVyID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gbW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSh2YWwsIFwibnVtYmVyXCIpO1xufTtcblxuLyoqXG4gKiBTdHlsZSBpcyBlaXRoZXIgXCJzb2xpZFwiLCBcIm91dGxpbmVcIiwgb3IgYSBwZXJjZW50YWdlIGkuZS4gXCI3MCVcIlxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVTdHlsZSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKHZhbC5zbGljZSgtMSkgPT09ICclJykge1xuICAgIHZhciBvcGFjaXR5ID0gbW9kdWxlLmV4cG9ydHMuZ2V0T3BhY2l0eSh2YWwpO1xuICAgIGlmIChvcGFjaXR5ID49IDAgJiYgb3BhY2l0eSA8PSAxLjApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH0gaWYgKF8uY29udGFpbnMoWydvdXRsaW5lJywgJ3NvbGlkJ10sIHZhbCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhyb3cgbmV3IEN1c3RvbUV2YWxFcnJvcihDdXN0b21FdmFsRXJyb3IuVHlwZS5CYWRTdHlsZSwgdmFsKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiB0aGlzIGlzIGEgdmFsaWQgY29sb3IsIHRocm93aW5nIGlmIGl0IGlzbnQuIENvbG9yIHZhbGlkaXR5XG4gKiBpcyBkZXRlcm1pbmVkIGJ5IHNldHRpbmcgdGhlIHZhbHVlIG9uIGFuIGh0bWwgZWxlbWVudCBhbmQgc2VlaW5nIGlmIGl0IHRha2VzLlxuICovXG5tb2R1bGUuZXhwb3J0cy5lbnN1cmVDb2xvciA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZS5zdHlsZS5jb2xvciA9IHZhbDtcbiAgLy8gV2UgY2FuJ3QgY2hlY2sgdGhhdCBlLnN0eWxlLmNvbG9yID09PSB2YWwsIHNpbmNlIHNvbWUgdmFscyB3aWxsIGJlXG4gIC8vIHRyYW5zZm9ybWVkIChpLmUuICNmZmYgLT4gcmdiKDI1NSwgMjU1LCAyNTUpXG4gIGlmICghZS5zdHlsZS5jb2xvcikge1xuICAgIHRocm93IG5ldyBDdXN0b21FdmFsRXJyb3IoQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkQ29sb3IsIHZhbCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHZhbFxuICogQHBhcmFtIHtzdHJpbmd8Q2xhc3N9IHR5cGVcbiAqL1xubW9kdWxlLmV4cG9ydHMuZW5zdXJlVHlwZSA9IGZ1bmN0aW9uICh2YWwsIHR5cGUpIHtcbiAgaWYgKHR5cGVvZih0eXBlKSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmICh0eXBlb2YodmFsKSAhPT0gdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgdHlwZTogXCIgKyB0eXBlICsgXCJcXG5nb3QgdHlwZTogXCIgKyB0eXBlb2YodmFsKSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKCEodmFsIGluc3RhbmNlb2YgdHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIG9iamVjdFwiKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0RmlsbCA9IGZ1bmN0aW9uIChzdHlsZSwgY29sb3IpIHtcbiAgaWYgKHN0eWxlID09PSAnb3V0bGluZScpIHtcbiAgICByZXR1cm4gXCJub25lXCI7XG4gIH1cbiAgLy8gZm9yIG5vdywgd2UgdHJlYXQgYW55dGhpbmcgd2UgZG9uJ3QgcmVjb2duaXplIGFzIHNvbGlkLlxuICByZXR1cm4gY29sb3I7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXRTdHJva2UgPSBmdW5jdGlvbiAoc3R5bGUsIGNvbG9yKSB7XG4gIGlmIChzdHlsZSA9PT0gXCJvdXRsaW5lXCIpIHtcbiAgICByZXR1cm4gY29sb3I7XG4gIH1cbiAgcmV0dXJuIFwibm9uZVwiO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIG9wYWNpdHkgZnJvbSB0aGUgc3R5bGUuIFN0eWxlIGlzIGEgc3RyaW5nIHRoYXQgaXMgZWl0aGVyIGEgd29yZCBvclxuICogcGVyY2VudGFnZSAoaS5lLiAyNSUpLlxuICovXG5tb2R1bGUuZXhwb3J0cy5nZXRPcGFjaXR5ID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gIHZhciBhbHBoYSA9IDEuMDtcbiAgaWYgKHN0eWxlLnNsaWNlKC0xKSA9PT0gXCIlXCIpIHtcbiAgICBhbHBoYSA9IHBhcnNlSW50KHN0eWxlLnNsaWNlKDAsIC0xKSwgMTApIC8gMTAwO1xuICB9XG4gIHJldHVybiBhbHBoYTtcbn07XG5cbi8qKlxuICogVXNlcnMgc3BlY2lmeSBwaXhlbHMgaW4gYSBjb29yZGluYXRlIHN5c3RlbSB3aGVyZSB0aGUgb3JpZ2luIGlzIGF0IHRoZSBib3R0b21cbiAqIGxlZnQsIGFuZCB4IGFuZCB5IGluY3JlYXNlIGFzIHlvdSBtb3ZlIHJpZ2h0L3VwLiBJJ20gcmVmZXJyaW5nIHRvIHRoaXMgYXNcbiAqIHRoZSBjYXJ0ZXNpYW4gY29vcmRpbmF0ZSBzeXN0ZW0uXG4gKiBUaGUgcGl4ZWwgY29vcmRpbmF0ZSBzeXN0ZW0gaW5zdGVhZCBoYXMgb3JpZ2luIGF0IHRoZSB0b3AgbGVmdCwgYW5kIHggYW5kIHlcbiAqIGluY3JlYXNlIGFzIHlvdSBtb3ZlIHJpZ2h0L2Rvd24uXG4gKi9cbm1vZHVsZS5leHBvcnRzLmNhcnRlc2lhblRvUGl4ZWwgPSBmdW5jdGlvbiAoY2FydGVzaWFuWSkge1xuICByZXR1cm4gNDAwIC0gY2FydGVzaWFuWTtcbn07XG4iLCJ2YXIgZXZhbE1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8qKlxuICogQW4gRXZhbCBlcnJvciBpbmRpY2F0aW5nIHRoYXQgc29tZXRoaW5nIGJhZCBoYXBwZW5lZCwgYnV0IHdlIHVuZGVyc3RhbmRcbiAqIHRoZSBiYWQgYW5kIHdhbnQgb3VyIGFwcCB0byBoYW5kbGUgaXQgKGkuZS4gdXNlciB1c2VkIGFuIGludmFsaWQgc3R5bGVcbiAqIHN0cmluZyBhbmQgd2Ugd2FudCB0byBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UpLlxuICovXG52YXIgQ3VzdG9tRXZhbEVycm9yID0gZnVuY3Rpb24gKHR5cGUsIHZhbCkge1xuICB0aGlzLnR5cGUgPSB0eXBlO1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkU3R5bGU6XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuYmFkU3R5bGVTdHJpbmdFcnJvcih7dmFsOiB2YWx9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuQmFkQ29sb3I6XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuYmFkQ29sb3JTdHJpbmdFcnJvcih7dmFsOiB2YWx9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ3VzdG9tRXZhbEVycm9yLlR5cGUuSW5maW5pdGVSZWN1cnNpb246XG4gICAgICB0aGlzLmZlZWRiYWNrTWVzc2FnZSA9IGV2YWxNc2cuaW5maW5pdGVSZWN1cnNpb25FcnJvcigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDdXN0b21FdmFsRXJyb3IuVHlwZS5Vc2VyQ29kZUV4Y2VwdGlvbjpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWdlID0gZXZhbE1zZy51c2VyQ29kZUV4Y2VwdGlvbigpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuZmVlZGJhY2tNZXNzYWcgPSAnJztcbiAgICAgIGJyZWFrO1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBDdXN0b21FdmFsRXJyb3I7XG5cbkN1c3RvbUV2YWxFcnJvci5UeXBlID0ge1xuICBCYWRTdHlsZTogMCxcbiAgQmFkQ29sb3I6IDEsXG4gIEluZmluaXRlUmVjdXJzaW9uOiAyLFxuICBVc2VyQ29kZUV4Y2VwdGlvbjogM1xufTtcbiIsIi8vIGxvY2FsZSBmb3IgZXZhbFxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmV2YWxfbG9jYWxlO1xuIl19
