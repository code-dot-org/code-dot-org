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
var commonMsg = require('../locale');
var evalMsg = require('./locale');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var AppView = require('../templates/AppView.jsx');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
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
Eval.init = function(config) {
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

  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
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
      background.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        skin.assetUrl('background_grid.png'));
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
      var solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks,
        config.forceInsertTopBlock);

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

    if (!!config.level.projectTemplateLevelName) {
      studioApp.displayWorkspaceAlert('warning', <div>{commonMsg.projectWarning()}</div>);
    }
  };

  var generateCodeWorkspaceHtmlFromEjs = function () {
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

  var generateVisualizationColumnHtmlFromEjs = function () {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: require('./controls.html.ejs')({
          assetUrl: studioApp.assetUrl
        })
      }
    });
  };

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    generateCodeWorkspaceHtml: generateCodeWorkspaceHtmlFromEjs,
    generateVisualizationColumnHtml: generateVisualizationColumnHtmlFromEjs,
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

    failure = canvasesMatch('test-call', 'test-result') ? null :
      "Does not match definition";

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
Eval.runButtonClick = function() {
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
function evalCode (code) {
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
    throw new Error("getDrawableFromBlocks shouldn't be called with blocks if " +
      "we already have blocks in the workspace");
  }
  // Temporarily put the blocks into the workspace so that we can generate code
  studioApp.loadBlocks(blockXml);

  var result = getDrawableFromBlockspace();

  // Remove the blocks
  Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) { b.dispose(); });

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
        caseMismatch  = true;
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

  if ((text1 === "true" && text2 === "false") ||
      (text1 === "false" && text2 === "true")) {
    return true;
  }

  return false;
};

/**
 * Execute the user's code.  Heaven help us...
 */
Eval.execute = function() {
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
      callback: function(pngDataUrl) {
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
    Eval.message = commonMsg.emptyExampleBlockErrorMsg({functionName: exampleless});
    return;
  }

  var unfilled = studioApp.getUnfilledFunctionalExample();
  if (unfilled) {
    Eval.result = false;
    Eval.testResults = TestResults.EXAMPLE_FAILED;

    var name = unfilled.getRootBlock().getInputTargetBlock('ACTUAL')
      .getTitleValue('NAME');
    Eval.message = commonMsg.emptyExampleBlockErrorMsg({functionName: name});
    return;
  }

  var failingBlockName = studioApp.checkForFailingExamples(getEvalExampleFailure);
  if (failingBlockName) {
    // Clear user canvas, as this is meant to be a pre-execution failure
    Eval.clearCanvasWithID('user');
    Eval.result = false;
    Eval.testResults = TestResults.EXAMPLE_FAILED;
    Eval.message = commonMsg.exampleErrorMessage({functionName: failingBlockName});
    return;
  }
};

/**
 * Calling outerHTML on svg elements in safari does not work. Instead we stick
 * it inside a div and get that div's inner html.
 */
function outerHTML (element) {
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
var displayFeedback = function(response) {
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
    showingSharing: !level.disableSharing && (level.freePlay),
    // allow users to save freeplay levels to their gallery
    saveToGalleryUrl: level.freePlay && Eval.response && Eval.response.save_to_gallery_url,
    feedbackImage: Eval.feedbackImage,
    appStrings: {
      reinfFeedbackMsg: evalMsg.reinfFeedbackMsg({backButton: tryAgainText})
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
