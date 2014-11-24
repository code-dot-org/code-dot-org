/**
 * CodeOrgApp: Webapp
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var BlocklyApps = require('../base');
var commonMsg = window.blockly.locale;
var webappMsg = window.blockly.appLocale;
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var Slider = require('../slider');
var _ = utils.getLodash();

/**
 * Create a namespace for the application.
 */
var Webapp = module.exports;

var level;
var skin;

//TODO: Make configurable.
BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;

//The number of blocks to show as feedback.
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var MAX_INTERPRETER_STEPS_PER_TICK = 200;

// Default Scalings
Webapp.scale = {
  'snapRadius': 1,
  'stepSpeed': 1
};

var twitterOptions = {
  text: webappMsg.shareWebappTwitter(),
  hashtag: "WebappCode"
};

var StepType = {
  RUN:  0,
  IN:   1,
  OVER: 2,
  OUT:  3,
};

function loadLevel() {
  Webapp.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Webapp.minWorkspaceHeight = level.minWorkspaceHeight;
  Webapp.softButtons_ = level.softButtons || {};

  // Override scalars.
  for (var key in level.scale) {
    Webapp.scale[key] = level.scale[key];
  }
}

var drawDiv = function () {
  var divWebapp = document.getElementById('divWebapp');
  var divWidth = parseInt(window.getComputedStyle(divWebapp).width, 10);

  // TODO: one-time initial drawing

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = divWidth + 'px';
};

function queueOnTick() {
  var stepSpeed = Webapp.scale.stepSpeed;
  if (Webapp.speedSlider) {
    stepSpeed = 300 * Math.pow(1 - Webapp.speedSlider.getValue(), 2);
  }
  window.setTimeout(Webapp.onTick, stepSpeed);
}

Webapp.onTick = function() {
  if (!Webapp.running) {
    return;
  }

  Webapp.tickCount++;
  queueOnTick();

  var stepInToStart = Webapp.paused && Webapp.nextStep === StepType.IN && Webapp.tickCount === 1;

  if (Webapp.paused) {
    switch (Webapp.nextStep) {
      case StepType.RUN:
        // Bail out here if in a break state (paused), but make sure that we still
        // have the next tick queued first, so we can resume after un-pausing):
        return;
      case StepType.OUT:
        // If we haven't yet set stepOutToStackDepth, work backwards through the
        // history of callExpressionSeenAtDepth until we find the one we want to
        // step out to - and store that in stepOutToStackDepth:
        if (Webapp.interpreter && typeof Webapp.stepOutToStackDepth === 'undefined') {
          Webapp.stepOutToStackDepth = 0;
          for (var i = Webapp.interpreter.stateStack.length - 1; i > 0; i--) {
            if (Webapp.callExpressionSeenAtDepth[i]) {
              Webapp.stepOutToStackDepth = i;
              break;
            }
          }
        }
        break;
    }
  }

  if (Webapp.interpreter) {
    var doneUserCodeStep = false;
    var unwindingAfterStep = false;

    // In each tick, we will step the interpreter multiple times in a tight
    // loop as long as we are interpreting code that the user can't see
    // (function aliases at the beginning, getCallback event loop at the end)
    for (var stepsThisTick = 0;
         stepsThisTick < MAX_INTERPRETER_STEPS_PER_TICK &&
          (!doneUserCodeStep || unwindingAfterStep);
         stepsThisTick++) {
      var inUserCode = codegen.selectCurrentCode(Webapp.interpreter,
                                                 BlocklyApps.editor,
                                                 Webapp.cumulativeLength,
                                                 Webapp.userCodeStartOffset,
                                                 Webapp.userCodeLength);
      if (inUserCode && stepInToStart) {
        // Special case code when stepping in to start the program (break before 1st statement)
        doneUserCodeStep = true;
        unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Webapp.interpreter);
        continue;
      }
      try {
        Webapp.interpreter.step();
        doneUserCodeStep = doneUserCodeStep ||
          (inUserCode && Webapp.interpreter.stateStack[0] && Webapp.interpreter.stateStack[0].done);

        // Remember the stack depths of call expressions (so we can implement 'step out')

        // Truncate any history of call expressions seen deeper than our current stack position:
        Webapp.callExpressionSeenAtDepth.length = Webapp.interpreter.stateStack.length + 1;

        if (inUserCode && Webapp.interpreter.stateStack[0].node.type === "CallExpression") {
          // Store that we've seen a call expression at this depth in callExpressionSeenAtDepth:
          Webapp.callExpressionSeenAtDepth[Webapp.interpreter.stateStack.length] = true;
        }

        if (Webapp.paused) {
          // Store the first call expression stack depth seen while in this step operation:
          if (inUserCode && Webapp.interpreter.stateStack[0].node.type === "CallExpression") {
            if (typeof Webapp.firstCallStackDepthThisStep === 'undefined') {
              Webapp.firstCallStackDepthThisStep = Webapp.interpreter.stateStack.length;
            }
          }
          // For the step in case, we want to stop the interpreter as soon as we enter the callee:
          if (!doneUserCodeStep &&
              inUserCode &&
              Webapp.nextStep === StepType.IN &&
              Webapp.interpreter.stateStack.length > Webapp.firstCallStackDepthThisStep) {
            doneUserCodeStep = true;
          }
          // After the interpreter says a node is "done" (meaning it is time to stop), we will
          // advance a little further to the start of the next statement. We achieve this by
          // continuing to set unwindingAfterStep to true to keep the loop going:
          if (doneUserCodeStep) {
            var wasUnwinding = unwindingAfterStep;
            // step() additional times if we know it to be safe to get us to the next statement:
            unwindingAfterStep = codegen.isNextStepSafeWhileUnwinding(Webapp.interpreter);
            if (wasUnwinding && !unwindingAfterStep) {
              // done unwinding.. select code that is next to execute:
              inUserCode = codegen.selectCurrentCode(Webapp.interpreter,
                                                     BlocklyApps.editor,
                                                     Webapp.cumulativeLength,
                                                     Webapp.userCodeStartOffset,
                                                     Webapp.userCodeLength);
              if (!inUserCode) {
                // not in user code, so keep unwinding after all...
                unwindingAfterStep = true;
              }
            }
          }
        }
      }
      catch(err) {
        Webapp.executionError = err;
        Webapp.onPuzzleComplete();
        return;
      }
    }
    if (Webapp.paused) {
      if (Webapp.nextStep === StepType.OUT &&
          Webapp.interpreter.stateStack.length > Webapp.stepOutToStackDepth) {
        // trying to step out, but we didn't get out yet... continue next onTick
      } else if (Webapp.nextStep === StepType.OVER &&
          typeof Webapp.firstCallStackDepthThisStep !== 'undefined' &&
          Webapp.interpreter.stateStack.length > Webapp.firstCallStackDepthThisStep) {
        // trying to step over, and we're in deeper inside a function call... continue next onTick
      } else {
        // Our step operation is complete, reset nextStep to StepType.RUN to
        // return to a normal 'break' state:
        Webapp.nextStep = StepType.RUN;
        delete Webapp.stepOutToStackDepth;
        delete Webapp.firstCallStackDepthThisStep;
        document.getElementById('spinner').style.visibility = 'hidden';
      }
    }
  } else {
    if (Webapp.tickCount === 1) {
      try { Webapp.whenRunFunc(BlocklyApps, api, Webapp.Globals); } catch (e) { }
    }
  }

  if (checkFinished()) {
    Webapp.onPuzzleComplete();
  }
};

/**
 * Initialize Blockly and Webapp for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Webapp.initReadonly = function(config) {
  // Do some minimal level loading so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;
  loadLevel();

  // Webapp.initMinimal();

  BlocklyApps.initReadonly(config);
};

/**
 * Initialize Blockly and the Webapp app.  Called on page load.
 */
Webapp.init = function(config) {
  Webapp.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  loadLevel();

  Webapp.canvasScale = (window.devicePixelRatio > 1) ? window.devicePixelRatio : 1;

  var showSlider = !config.hide_source && config.level.editCode;
  var showDebugButtons = !config.hide_source && config.level.editCode;
  var finishButtonFirstLine = _.isEmpty(level.softButtons) && !showSlider;
  var firstControlsRow = require('./controls.html')({assetUrl: BlocklyApps.assetUrl, showSlider: showSlider, finishButton: finishButtonFirstLine});
  var extraControlsRow = require('./extraControlRows.html')({assetUrl: BlocklyApps.assetUrl, finishButton: !finishButtonFirstLine, debugButtons: showDebugButtons});

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    if (BlocklyApps.usingBlockly) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Webapp.scale.snapRadius;
    }

    drawDiv();
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = webappMsg.makeYourOwn();
  config.makeUrl = "http://code.org/webapp";
  config.makeImage = BlocklyApps.assetUrl('media/promo.png');

  config.varsInGlobals = true;

  // Webapp.initMinimal();

  BlocklyApps.init(config);

  if (level.editCode) {
    // Initialize the slider.
    var slider = document.getElementById('webapp-slider');
    if (slider) {
      Webapp.speedSlider = new Slider(10, 35, 130, slider);

      // Change default speed (eg Speed up levels that have lots of steps).
      if (config.level.sliderSpeed) {
        Webapp.speedSlider.setValue(config.level.sliderSpeed);
      }
    }
  }

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Webapp.onPuzzleComplete);

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      dom.addClickTouchEvent(pauseButton, Webapp.onPauseButton);
      dom.addClickTouchEvent(stepInButton, Webapp.onStepInButton);
      dom.addClickTouchEvent(stepOverButton, Webapp.onStepOverButton);
      dom.addClickTouchEvent(stepOutButton, Webapp.onStepOutButton);
    }
  }
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Webapp.clearEventHandlersKillTickLoop = function() {
  Webapp.whenRunFunc = null;
  Webapp.running = false;
  Webapp.tickCount = 0;

  var spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.visibility = 'hidden';
  }
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
BlocklyApps.reset = function(first) {
  var i;
  Webapp.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Webapp.softButtons_.length; i++) {
    document.getElementById(Webapp.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  // Reset configurable variables
  var divWebapp = document.getElementById('divWebapp');

  while (divWebapp.firstChild) {
    divWebapp.removeChild(divWebapp.firstChild);
  }

  // Clone and replace divWebapp (this removes all attached event listeners):
  var newDivWebapp = divWebapp.cloneNode(true);
  divWebapp.parentNode.replaceChild(newDivWebapp, divWebapp);

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  if (level.editCode) {
    Webapp.paused = false;
    Webapp.nextStep = StepType.RUN;
    delete Webapp.stepOutToStackDepth;
    delete Webapp.firstCallStackDepthThisStep;
    Webapp.callExpressionSeenAtDepth = [];
    // Reset the pause button:
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.textContent = webappMsg.pause();
      pauseButton.disabled = true;
      stepInButton.disabled = false;
      stepOverButton.disabled = true;
      stepOutButton.disabled = true;
    }
    var spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.visibility = 'hidden';
    }
  }

  // Reset the Globals object used to contain program variables:
  Webapp.Globals = {};
  Webapp.eventQueue = [];
  Webapp.executionError = null;
  Webapp.interpreter = null;
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
BlocklyApps.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  BlocklyApps.toggleRunReset('reset');
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  BlocklyApps.reset(false);
  BlocklyApps.attempts++;
  Webapp.execute();

  if (level.freePlay && !BlocklyApps.hideSource) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
  }
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Webapp.waitingForReport) {
    BlocklyApps.displayFeedback({
      app: 'webapp', //XXX
      skin: skin.id,
      feedbackType: Webapp.testResults,
      response: Webapp.response,
      level: level,
      showingSharing: level.freePlay,
      feedbackImage: Webapp.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Webapp.response && Webapp.response.save_to_gallery_url,
      appStrings: {
        reinfFeedbackMsg: webappMsg.reinfFeedbackMsg(),
        sharingText: webappMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Webapp.onReportComplete = function(response) {
  Webapp.response = response;
  Webapp.waitingForReport = false;
  displayFeedback();
};

//
// Generates code with user-generated function definitions and evals that code
// so these can be called from event handlers. This should be called for each
// block type that defines functions.
//

var defineProcedures = function (blockType) {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', blockType);
  // TODO: handle editCode JS interpreter
  try { codegen.evalWith(code, {
                         codeFunctions: level.codeFunctions,
                         BlocklyApps: BlocklyApps,
                         Studio: api,
                         Globals: Webapp.Globals } ); } catch (e) { }
};

/**
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
var nativeGetCallback = function () {
  return Webapp.eventQueue.shift();
};

/**
 * Execute the app
 */
Webapp.execute = function() {
  Webapp.result = BlocklyApps.ResultType.UNSET;
  Webapp.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Webapp.waitingForReport = false;
  Webapp.response = null;
  var i;

  BlocklyApps.playAudio('start');

  BlocklyApps.reset(false);

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = utils.generateCodeAliases(level.codeFunctions, 'Webapp');
    Webapp.userCodeStartOffset = codeWhenRun.length;
    codeWhenRun += BlocklyApps.editor.getValue();
    Webapp.userCodeLength = codeWhenRun.length - Webapp.userCodeStartOffset;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { obj.fn.apply(null, obj.arguments ? obj.arguments : null); }}';
    var session = BlocklyApps.editor.aceEditor.getSession();
    Webapp.cumulativeLength = codegen.aceCalculateCumulativeLength(session);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Webapp.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');

    var blocks = Blockly.mainBlockSpace.getTopBlocks();
    for (var x = 0; blocks[x]; x++) {
      var block = blocks[x];
      if (block.type === 'when_run') {
        codeWhenRun = Blockly.Generator.blocksToCode('JavaScript', [ block ]);
        break;
      }
    }
  }
  if (codeWhenRun) {
    if (level.editCode) {
      // Use JS interpreter on editCode levels
      var initFunc = function(interpreter, scope) {
        codegen.initJSInterpreter(interpreter, scope, {
                                          BlocklyApps: BlocklyApps,
                                          Webapp: api,
                                          Globals: Webapp.Globals } );


        var getCallbackObj = interpreter.createObject(interpreter.FUNCTION);
        var wrapper = codegen.makeNativeMemberFunction(interpreter,
                                                       nativeGetCallback,
                                                       null);
        interpreter.setProperty(scope,
                                'getCallback',
                                interpreter.createNativeFunction(wrapper));
      };
      Webapp.interpreter = new window.Interpreter(codeWhenRun, initFunc);
    } else {
      Webapp.whenRunFunc = codegen.functionFromCode(codeWhenRun, {
                                          BlocklyApps: BlocklyApps,
                                          Webapp: api,
                                          Globals: Webapp.Globals } );
    }
  }

  if (level.editCode) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    if (pauseButton && stepInButton && stepOverButton && stepOutButton) {
      pauseButton.disabled = false;
      stepInButton.disabled = true;
      stepOverButton.disabled = true;
      stepOutButton.disabled = true;
    }
    var spinner = document.getElementById('spinner');
    if (spinner) {
      spinner.style.visibility = 'visible';
    }
  }

  Webapp.running = true;
  queueOnTick();
};

Webapp.onPauseButton = function() {
  if (Webapp.running) {
    var pauseButton = document.getElementById('pauseButton');
    var stepInButton = document.getElementById('stepInButton');
    var stepOverButton = document.getElementById('stepOverButton');
    var stepOutButton = document.getElementById('stepOutButton');
    // We have code and are either running or paused
    if (Webapp.paused) {
      Webapp.paused = false;
      Webapp.nextStep = StepType.RUN;
      pauseButton.textContent = webappMsg.pause();
    } else {
      Webapp.paused = true;
      Webapp.nextStep = StepType.RUN;
      pauseButton.textContent = webappMsg.continue();
    }
    stepInButton.disabled = !Webapp.paused;
    stepOverButton.disabled = !Webapp.paused;
    stepOutButton.disabled = !Webapp.paused;
    document.getElementById('spinner').style.visibility =
        Webapp.paused ? 'hidden' : 'visible';
  }
};

Webapp.onStepOverButton = function() {
  if (Webapp.running) {
    Webapp.paused = true;
    Webapp.nextStep = StepType.OVER;
    document.getElementById('spinner').style.visibility = 'visible';
  }
};

Webapp.onStepInButton = function() {
  if (!Webapp.running) {
    BlocklyApps.runButtonClick();
    Webapp.onPauseButton();
  }
  Webapp.paused = true;
  Webapp.nextStep = StepType.IN;
  document.getElementById('spinner').style.visibility = 'visible';
};

Webapp.onStepOutButton = function() {
  if (Webapp.running) {
    Webapp.paused = true;
    Webapp.nextStep = StepType.OUT;
    document.getElementById('spinner').style.visibility = 'visible';
  }
};

Webapp.feedbackImage = '';
Webapp.encodedFeedbackImage = '';

Webapp.onPuzzleComplete = function() {
  if (Webapp.executionError) {
    Webapp.result = BlocklyApps.ResultType.ERROR;
  } else if (level.freePlay) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
  }

  // Stop everything on screen
  Webapp.clearEventHandlersKillTickLoop();

  // If the current level is a free play, always return the free play result
  if (level.freePlay) {
    Webapp.testResults = BlocklyApps.TestResults.FREE_PLAY;
  } else {
    var levelComplete = (Webapp.result === BlocklyApps.ResultType.SUCCESS);
    Webapp.testResults = BlocklyApps.getTestResults(levelComplete);
  }

  if (Webapp.testResults >= BlocklyApps.TestResults.FREE_PLAY) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  var program;

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = BlocklyApps.editor.getValue();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Webapp.waitingForReport = true;

  var sendReport = function() {
    BlocklyApps.report({
      app: 'webapp',
      level: level.id,
      result: Webapp.result === BlocklyApps.ResultType.SUCCESS,
      testResult: Webapp.testResults,
      program: encodeURIComponent(program),
      image: Webapp.encodedFeedbackImage,
      onComplete: Webapp.onReportComplete
    });
  };

  if (typeof document.getElementById('divWebapp').toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    document.getElementById('divWebapp').toDataURL("image/png", {
      callback: function(pngDataUrl) {
        Webapp.feedbackImage = pngDataUrl;
        Webapp.encodedFeedbackImage = encodeURIComponent(Webapp.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

Webapp.executeCmd = function (id, name, opts) {
  var cmd = {
    'id': id,
    'name': name,
    'opts': opts
  };
  return Webapp.callCmd(cmd);
};

//
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Webapp.callCmd = function (cmd) {
  var retVal = true;
  switch (cmd.name) {
    /*
    case 'wait':
      if (!cmd.opts.started) {
        BlocklyApps.highlight(cmd.id);
      }
      return Studio.wait(cmd.opts);
    */
    case 'createHtmlBlock':
    case 'replaceHtmlBlock':
    case 'deleteHtmlBlock':
    case 'createButton':
    case 'createCanvas':
    case 'canvasDrawLine':
    case 'canvasDrawCircle':
    case 'canvasClear':
    case 'createTextInput':
    case 'getText':
    case 'setText':
    case 'setStyle':
    case 'attachEventHandler':
      BlocklyApps.highlight(cmd.id);
      retVal = Webapp[cmd.name](cmd.opts);
      break;
  }
  return retVal;
};

Webapp.createHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newDiv = document.createElement("div");
  newDiv.id = opts.elementId;
  newDiv.innerHTML = opts.html;

  return Boolean(divWebapp.appendChild(newDiv));
};

Webapp.createButton = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newButton = document.createElement("button");
  var textNode = document.createTextNode(opts.text);
  newButton.id = opts.elementId;

  return Boolean(newButton.appendChild(textNode) &&
                 divWebapp.appendChild(newButton));
};

Webapp.createCanvas = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newElement = document.createElement("canvas");
  newElement.id = opts.elementId;
  // TODO: support creating canvas elements of different sizes
  newElement.width = 400 * Webapp.canvasScale;
  newElement.height = 400 * Webapp.canvasScale;

  return Boolean(divWebapp.appendChild(newElement));
};

Webapp.canvasDrawLine = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  var ctx = div.getContext("2d");
  if (ctx && divWebapp.contains(div)) {
    ctx.beginPath();
    ctx.moveTo(opts.x1 * Webapp.canvasScale, opts.y1 * Webapp.canvasScale);
    ctx.lineTo(opts.x2 * Webapp.canvasScale, opts.y2 * Webapp.canvasScale);
    ctx.stroke();
  }
  return false;
};

Webapp.canvasDrawCircle = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  var ctx = div.getContext("2d");
  if (ctx && divWebapp.contains(div)) {
    ctx.beginPath();
    ctx.arc(opts.x * Webapp.canvasScale,
            opts.y * Webapp.canvasScale,
            opts.radius * Webapp.canvasScale,
            0,
            2 * Math.PI);
    ctx.stroke();
  }
  return false;
};

Webapp.canvasClear = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  var ctx = div.getContext("2d");
  if (ctx && divWebapp.contains(div)) {
    ctx.clearRect(0, 0, div.width, div.height);
  }
  return false;
};

Webapp.createTextInput = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newInput = document.createElement("input");
  newInput.value = opts.text;
  newInput.id = opts.elementId;

  return Boolean(divWebapp.appendChild(newInput));
};

Webapp.getText = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    return String(div.value);
  }
  return false;
};

Webapp.setText = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    div.value = opts.text;
  }
  return false;
};

Webapp.replaceHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var oldDiv = document.getElementById(opts.elementId);
  if (divWebapp.contains(oldDiv)) {
    var newDiv = document.createElement("div");
    newDiv.id = opts.elementId;
    newDiv.innerHTML = opts.html;

    return Boolean(divWebapp.replaceChild(newDiv, oldDiv));
  }
  return false;
};

Webapp.deleteHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    return Boolean(divWebapp.removeChild(div));
  }
  return false;
};

Webapp.setStyle = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var div = document.getElementById(opts.elementId);
  if (divWebapp.contains(div)) {
    div.style.cssText = opts.style;
    return true;
  }
  return false;
};

Webapp.onEventFired = function (opts, e) {
  if (typeof e != 'undefined') {
    // Push a function call on the queue with an array of arguments consisting
    // of just the 'e' parameter
    Webapp.eventQueue.push({
      'fn': opts.func,
      'arguments': [e]
    });
  } else {
    Webapp.eventQueue.push({'fn': opts.func});
  }
};

Webapp.attachEventHandler = function (opts) {
  var divWebapp = document.getElementById('divWebapp');
  var divElement = document.getElementById(opts.elementId);
  if (divWebapp.contains(divElement)) {
    // For now, we're not tracking how many of these we add and we don't allow
    // the user to detach the handler. We detach all listeners by cloning the
    // divWebapp DOM node inside of reset()
    divElement.addEventListener(
        opts.eventName,
        Webapp.onEventFired.bind(this, opts));
  }
};

/*
var onWaitComplete = function (opts) {
  if (!opts.complete) {
    if (opts.waitCallback) {
      opts.waitCallback();
    }
    opts.complete = true;
  }
};

Studio.wait = function (opts) {
  if (!opts.started) {
    opts.started = true;

    // opts.value is the number of milliseconds to wait - or 'click' which means
    // "wait for click"
    if ('click' === opts.value) {
      opts.waitForClick = true;
    } else {
      opts.waitTimeout = window.setTimeout(
        delegate(this, onWaitComplete, opts),
        opts.value);
    }
  }

  return opts.complete;
};
*/

Webapp.timedOut = function() {
  return Webapp.tickCount > Webapp.timeoutFailureTick;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Webapp.result = BlocklyApps.ResultType.FAILURE;
    return true;
  }

  /*
  if (Webapp.allGoalsVisited()) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
    return true;
  }
  */

  if (Webapp.timedOut()) {
    Webapp.result = BlocklyApps.ResultType.FAILURE;
    return true;
  }

  return false;
};
