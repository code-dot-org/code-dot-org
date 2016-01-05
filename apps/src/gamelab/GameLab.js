'use strict';

var commonMsg = require('../locale');
var msg = require('./locale');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var apiJavascript = require('./apiJavascript');
var page = require('../templates/page.html.ejs');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var JSInterpreter = require('../JSInterpreter');

/**
 * An instantiable GameLab class
 */
var GameLab = function () {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;
  this.studioApp_ = null;
  this.JSInterpreter = null;
  this.eventHandlers = [];
  this.Globals = {};
  this.currentCmdQueue = null;

  this.api = api;
  this.api.injectGameLab(this);
  this.apiJS = apiJavascript;
  this.apiJS.injectGameLab(this);
};

module.exports = GameLab;

/**
 * Inject the studioApp singleton.
 */
GameLab.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
  this.studioApp_.reset = _.bind(this.reset, this);
  this.studioApp_.runButtonClick = _.bind(this.runButtonClick, this);

  this.studioApp_.setCheckForEmptyBlocks(true);
};

/**
 * Initialize Blockly and this GameLab instance.  Called on page load.
 */
GameLab.prototype.init = function (config) {
  if (!this.studioApp_) {
    throw new Error("GameLab requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  config.dropletConfig = dropletConfig;

  var iconPath = 'media/turtle/' + (config.isLegacyShare && config.hideSource ? 'icons_white.png' : 'icons.png');

  var showFinishButton = !this.level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);
  var firstControlsRow = require('./controls.html.ejs')({
    assetUrl: this.studioApp_.assetUrl,
    finishButton: finishButtonFirstLine && showFinishButton
  });
  var extraControlRows = require('./extraControlRows.html.ejs')({
    assetUrl: this.studioApp_.assetUrl,
    finishButton: !finishButtonFirstLine && showFinishButton
  });

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: firstControlsRow,
      extraControlRows: extraControlRows,
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: this.level.editCode,
      blockCounterClass : 'block-counter-default',
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

  config.loadAudio = _.bind(this.loadAudio_, this);
  config.afterInject = _.bind(this.afterInject_, this, config);

  this.studioApp_.init(config);
};

GameLab.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Code called after the blockly div + blockly core is injected into the document
 */
GameLab.prototype.afterInject_ = function (config) {

  if (this.studioApp_.isUsingBlockly()) {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('GameLab,code');
  }

  // TODO (cpirich): remove?

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';
};


/**
 * Reset GameLab to its initial state.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
GameLab.prototype.reset = function (ignore) {

  this.eventHandlers = [];
  window.clearInterval(this.tickIntervalId);
  this.tickIntervalId = 0;
  this.tickCount = 0;

  // Discard the interpreter.
  this.JSInterpreter = null;
  this.executionError = null;
};

/**
 * Click the run button.  Start the program.
 */
GameLab.prototype.runButtonClick = function () {
  this.studioApp_.toggleRunReset('reset');
  // document.getElementById('spinner').style.visibility = 'visible';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  this.studioApp_.attempts++;
  this.execute();
};

/**
 * Execute the code for all of the event handlers that match an event name
 * @param {string} name Name of the handler we want to call
 * @param {boolean} allowQueueExension When true, we allow additional cmds to
 *  be appended to the queue
 * @param {Array} extraArgs Additional arguments passed into the virtual
*   JS machine for consumption by the student's event-handling code.
 */
GameLab.prototype.callHandler = function (name, allowQueueExtension, extraArgs) {
  this.eventHandlers.forEach(_.bind(function (handler) {
    if (this.studioApp_.isUsingBlockly()) {
      // Note: we skip executing the code if we have not completed executing
      // the cmdQueue on this handler (checking for non-zero length)
      if (handler.name === name &&
          (allowQueueExtension || (0 === handler.cmdQueue.length))) {
        this.currentCmdQueue = handler.cmdQueue;
        try {
          handler.func(this.studioApp_, this.api, this.Globals);
        } catch (e) {
          // Do nothing
        }
        this.currentCmdQueue = null;
      }
    } else {
      // TODO (cpirich): support events with parameters
      if (handler.name === name) {
        this.JSInterpreter.queueEvent(handler.func, extraArgs);
      }
    }
  }, this));
};

//
// Execute an entire command queue (specified with the name parameter)
//

GameLab.prototype.executeQueue = function (name, oneOnly) {
  this.eventHandlers.forEach(_.bind(function (handler) {
    if (handler.name === name && handler.cmdQueue.length) {
      for (var cmd = handler.cmdQueue[0]; cmd; cmd = handler.cmdQueue[0]) {
        if (this.callCmd(cmd)) {
          // Command executed immediately, remove from queue and continue
          handler.cmdQueue.shift();
        } else {
          break;
        }
      }
    }
  }, this));
};

GameLab.prototype.evalCode = function(code) {
  try {
    codegen.evalWith(code, {
      GameLab: this.api
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
      window.alert(e);
    }
  }
};

/**
 * Set up this.code, this.interpreter, etc. to run code for editCode levels
 */

/*
GameLab.prototype.generateTurtleCodeFromJS_ = function () {
  this.code = dropletUtils.generateCodeAliases(dropletConfig, 'Turtle');
  this.userCodeStartOffset = this.code.length;
  this.code += this.studioApp_.editor.getValue();
  this.userCodeLength = this.code.length - this.userCodeStartOffset;

  var session = this.studioApp_.editor.aceEditor.getSession();
  this.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = _.bind(function(interpreter, scope) {
    codegen.initJSInterpreter(interpreter, null, null, scope, {
      Turtle: this.api
    });
  }, this);
  this.interpreter = new window.Interpreter(this.code, initFunc);
};
*/

/**
 * Execute the user's code.  Heaven help us...
 */
GameLab.prototype.execute = function() {
  // Reset all state.
  this.studioApp_.reset();

  if (this.studioApp_.isUsingBlockly() &&
      (this.studioApp_.hasExtraTopBlocks() ||
        this.studioApp_.hasDuplicateVariablesInForLoops())) {
    // immediately check answer, which will fail and report top level blocks
    this.checkAnswer();
    return;
  }

  if (this.level.editCode) {
    this.JSInterpreter = new JSInterpreter({
      code: this.studioApp_.getCode(),
      blocks: dropletConfig.blocks,
      blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
      enableEvents: true,
      studioApp: this.studioApp_,
      onExecutionError: _.bind(this.handleExecutionError, this),
    });
    if (!this.JSInterpreter.initialized()) {
      return;
    }
    /*
    if (this.checkForEditCodePreExecutionFailure()) {
      return this.onPuzzleComplete();
    }
    */
  } else {
    this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    this.evalCode(this.code);
  }

  // api.log now contains a transcript of all the user's actions.
  this.studioApp_.playAudio('start', {loop : true});
  // animate the transcript.

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  this.tickIntervalId = window.setInterval(_.bind(this.onTick, this), 33);
};

GameLab.prototype.onTick = function () {
  this.tickCount++;
  var i;

  if (this.tickCount === 1) {
    this.callHandler('whenGameStarts');
  }

  this.executeQueue('whenGameStarts');

  this.callHandler('repeatForever');
  this.executeQueue('repeatForever');

/*
  // Run key event handlers for any keys that are down:
  for (var key in KeyCodes) {
    if (Studio.keyState[KeyCodes[key]] &&
        Studio.keyState[KeyCodes[key]] === "keydown") {
      switch (KeyCodes[key]) {
        case KeyCodes.LEFT:
          callHandler('when-left');
          break;
        case KeyCodes.UP:
          callHandler('when-up');
          break;
        case KeyCodes.RIGHT:
          callHandler('when-right');
          break;
        case KeyCodes.DOWN:
          callHandler('when-down');
          break;
      }
    }
  }

  for (var btn in ArrowIds) {
    if (Studio.btnState[ArrowIds[btn]] &&
        Studio.btnState[ArrowIds[btn]] === ButtonState.DOWN) {
      switch (ArrowIds[btn]) {
        case ArrowIds.LEFT:
          callHandler('when-left');
          break;
        case ArrowIds.UP:
          callHandler('when-up');
          break;
        case ArrowIds.RIGHT:
          callHandler('when-right');
          break;
        case ArrowIds.DOWN:
          callHandler('when-down');
          break;
      }
    }
  }

  for (var gesture in Studio.gesturesObserved) {
    switch (gesture) {
      case 'left':
        callHandler('when-left');
        break;
      case 'up':
        callHandler('when-up');
        break;
      case 'right':
        callHandler('when-right');
        break;
      case 'down':
        callHandler('when-down');
        break;
    }
    if (0 === Studio.gesturesObserved[gesture]--) {
      delete Studio.gesturesObserved[gesture];
    }
  }

  Studio.executeQueue('when-left');
  Studio.executeQueue('when-up');
  Studio.executeQueue('when-right');
  Studio.executeQueue('when-down');
*/

  if (this.JSInterpreter) {
    this.JSInterpreter.executeInterpreter(this.tickCount === 1);
  }

/*
  var currentTime = new Date().getTime();

  if (!Studio.succeededTime && checkFinished()) {
    Studio.succeededTime = currentTime;
  }

  if (!animationOnlyFrame) {
    Studio.executeQueue('whenTouchGoal');
  }

  if (Studio.succeededTime &&
      !spritesNeedMoreAnimationFrames &&
      (!level.delayCompletion || currentTime > Studio.succeededTime + level.delayCompletion)) {
    Studio.onPuzzleComplete();
  }

  // We want to make sure any queued event code related to all goals being visited is executed
  // before we evaluate conditions related to this event.  For example, if score is incremented
  // as a result of all goals being visited, recording allGoalsVisited here allows the score
  // to be incremented before we check for a completion condition that looks for both all
  // goals visited, and the incremented score, on the next tick.
  if (Studio.allGoalsVisited()) {
    Studio.trackedBehavior.allGoalsVisited = true;
  }

  // And we don't want a timeout to be used in evaluating conditions before the all goals visited
  // events are processed (as described above), so also record that here.  This is particularly
  // relevant to levels which "time out" immediately when all when_run code is complete.
  if (Studio.timedOut()) {
    Studio.trackedBehavior.timedOut = true;
  }
*/
};

GameLab.prototype.handleExecutionError = function (err, lineNumber) {
/*
  if (!lineNumber && err instanceof SyntaxError) {
    // syntax errors came before execution (during parsing), so we need
    // to determine the proper line number by looking at the exception
    lineNumber = err.loc.line;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)

    codegen.selectEditorRowColError(studioApp.editor, lineNumber - 1, err.loc.column);
  }
  if (Studio.JSInterpreter) {
    // Select code that just executed:
    Studio.JSInterpreter.selectCurrentCode("ace_error");
    // Grab line number if we don't have one already:
    if (!lineNumber) {
      lineNumber = 1 + Studio.JSInterpreter.getNearestUserCodeLine();
    }
  }
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Studio.executionError = { err: err, lineNumber: lineNumber };

  // Call onPuzzleComplete() if syntax error or any time we're not on a freeplay level:
  if (err instanceof SyntaxError) {
    // Mark preExecutionFailure and testResults immediately so that an error
    // message always appears, even on freeplay:
    Studio.preExecutionFailure = true;
    Studio.testResults = TestResults.SYNTAX_ERROR_FAIL;
    Studio.onPuzzleComplete();
  } else if (!level.freePlay) {
    Studio.onPuzzleComplete();
  }
*/
  throw err;
};

/**
 * Executes an API command.
 */
GameLab.prototype.executeCmd = function (id, name, opts) {
  console.log("GameLab executeCmd " + name);
};

/**
 * Handle the tasks to be done after the user program is finished.
 */
GameLab.prototype.finishExecution_ = function () {
  // document.getElementById('spinner').style.visibility = 'hidden';
  if (this.studioApp_.isUsingBlockly()) {
    Blockly.mainBlockSpace.highlightBlock(null);
  }
  this.checkAnswer();
};

/**
 * App specific displayFeedback function that calls into
 * this.studioApp_.displayFeedback when appropriate
 */
GameLab.prototype.displayFeedback_ = function() {
  var level = this.level;

  this.studioApp_.displayFeedback({
    app: 'gamelab',
    skin: this.skin.id,
    feedbackType: this.testResults,
    message: this.message,
    response: this.response,
    level: level,
    // feedbackImage: feedbackImageCanvas.canvas.toDataURL("image/png"),
    // add 'impressive':true to non-freeplay levels that we deem are relatively impressive (see #66990480)
    showingSharing: !level.disableSharing && (level.freePlay /* || level.impressive */),
    // impressive levels are already saved
    // alreadySaved: level.impressive,
    // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
    saveToGalleryUrl: level.freePlay && this.response && this.response.save_to_gallery_url,
    appStrings: {
      reinfFeedbackMsg: msg.reinfFeedbackMsg(),
      sharingText: msg.shareDrawing()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
GameLab.prototype.onReportComplete = function(response) {
  this.response = response;
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  this.displayFeedback_();
};

/**
 * Verify if the answer is correct.
 * If so, move on to next level.
 */
GameLab.prototype.checkAnswer = function() {
  var level = this.level;

  // Test whether the current level is a free play level, or the level has
  // been completed
  var levelComplete = level.freePlay && (!level.editCode || !this.executionError);
  this.testResults = this.studioApp_.getTestResults(levelComplete);

  var program;
  if (this.studioApp_.isUsingBlockly()) {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  // Make sure we don't reuse an old message, since not all paths set one.
  this.message = undefined;

  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = this.studioApp_.editor.getValue();
  }

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    this.testResults = this.studioApp_.TestResults.FREE_PLAY;
  }

  // Play sound
  this.studioApp_.stopLoopingAudio('start');
  if (this.testResults === this.studioApp_.TestResults.FREE_PLAY ||
      this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
    this.studioApp_.playAudio('win');
  } else {
    this.studioApp_.playAudio('failure');
  }

  var reportData = {
    app: 'gamelab',
    level: level.id,
    builder: level.builder,
    result: levelComplete,
    testResult: this.testResults,
    program: encodeURIComponent(program),
    onComplete: _.bind(this.onReportComplete, this),
    // save_to_gallery: level.impressive
  };

  this.studioApp_.report(reportData);

  if (this.studioApp_.isUsingBlockly()) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};
