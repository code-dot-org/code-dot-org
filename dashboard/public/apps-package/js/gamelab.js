require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/gamelab/main.js":[function(require,module,exports){
'use strict';

var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var GameLab = require('./GameLab');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.gamelabMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var gamelab = new GameLab();

  gamelab.injectStudioApp(studioApp);
  appMain(gamelab, levels, options);
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./GameLab":"/home/ubuntu/staging/apps/build/js/gamelab/GameLab.js","./blocks":"/home/ubuntu/staging/apps/build/js/gamelab/blocks.js","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/gamelab/skins.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/skins.js":[function(require,module,exports){
'use strict';

var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/blocks.js":[function(require,module,exports){
/**
 * CDO App: GameLab
 *
 * Copyright 2016 Code.org
 *
 */
'use strict';

var msg = require('./locale');
var commonMsg = require('../locale');

var GameLab = require('./GameLab');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  // Block definitions.
  blockly.Blocks.gamelab_foo = {
    // Block for foo.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.foo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.fooTooltip());
    }
  };

  generator.gamelab_foo = function () {
    // Generate JavaScript for foo.
    return 'GameLab.foo();\n';
  };
};

},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./GameLab":"/home/ubuntu/staging/apps/build/js/gamelab/GameLab.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/GameLab.js":[function(require,module,exports){
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
var GameLab = function GameLab() {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;
  this.studioApp_ = null;
  this.JSInterpreter = null;
  this.drawFunc = null;
  this.setupFunc = null;
  this.mousePressedFunc = null;
  this.eventHandlers = [];
  this.Globals = {};
  this.currentCmdQueue = null;
  this.p5 = null;
  this.p5decrementPreload = null;

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

  window.p5.prototype.setupGlobalMode = function () {
    /*
     * Copied code from p5 for no-sketch Global mode
     */
    var p5 = window.p5;

    this._isGlobal = true;
    // Loop through methods on the prototype and attach them to the window
    for (var p in p5.prototype) {
      if (typeof p5.prototype[p] === 'function') {
        var ev = p.substring(2);
        if (!this._events.hasOwnProperty(ev)) {
          window[p] = p5.prototype[p].bind(this);
        }
      } else {
        window[p] = p5.prototype[p];
      }
    }
    // Attach its properties to the window
    for (var p2 in this) {
      if (this.hasOwnProperty(p2)) {
        window[p2] = this[p2];
      }
    }
  };

  config.dropletConfig = dropletConfig;

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
      visualization: require('./visualization.html.ejs')(),
      localeDirection: this.studioApp_.localeDirection(),
      controls: firstControlsRow,
      extraControlRows: extraControlRows,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: this.level.editCode,
      blockCounterClass: 'block-counter-default',
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

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';

  var divGameLab = document.getElementById('divGameLab');
  divGameLab.style.width = '400px';
  divGameLab.style.height = '400px';
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

  /*
  var divGameLab = document.getElementById('divGameLab');
  while (divGameLab.firstChild) {
    divGameLab.removeChild(divGameLab.firstChild);
  }
  */

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
    this.p5decrementPreload = null;

    // Clear registered methods on the prototype:
    for (var member in window.p5.prototype._registeredMethods) {
      delete window.p5.prototype._registeredMethods[member];
    }
    window.p5.prototype._registeredMethods = { pre: [], post: [], remove: [] };
    delete window.p5.prototype._registeredPreloadMethods.gamelabPreload;

    window.p5.prototype.allSprites = new window.Group();
    window.p5.prototype.spriteUpdate = true;

    window.p5.prototype.camera = new window.Camera(0, 0, 1);
    window.p5.prototype.camera.init = false;

    //keyboard input
    window.p5.prototype.registerMethod('pre', window.p5.prototype.readPresses);

    //automatic sprite update
    window.p5.prototype.registerMethod('pre', window.p5.prototype.updateSprites);

    //quadtree update
    window.p5.prototype.registerMethod('post', window.updateTree);

    //camera push and pop
    window.p5.prototype.registerMethod('pre', window.cameraPush);
    window.p5.prototype.registerMethod('post', window.cameraPop);
  }

  window.p5.prototype.gamelabPreload = _.bind(function () {
    this.p5decrementPreload = window.p5._getDecrementPreload(arguments, this.p5);
  }, this);

  // Discard the interpreter.
  if (this.JSInterpreter) {
    this.JSInterpreter.deinitialize();
    this.JSInterpreter = null;
  }
  this.executionError = null;
  this.drawFunc = null;
  this.setupFunc = null;
  this.mousePressedFunc = null;
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
      if (handler.name === name && (allowQueueExtension || 0 === handler.cmdQueue.length)) {
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
        handler.func.apply(null, extraArgs);
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

GameLab.prototype.evalCode = function (code) {
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
 * Execute the user's code.  Heaven help us...
 */
GameLab.prototype.execute = function () {
  // Reset all state.
  this.studioApp_.reset();

  if (this.studioApp_.isUsingBlockly() && (this.studioApp_.hasExtraTopBlocks() || this.studioApp_.hasDuplicateVariablesInForLoops())) {
    // immediately check answer, which will fail and report top level blocks
    this.checkAnswer();
    return;
  }

  new window.p5(_.bind(function (p5obj) {
    this.p5 = p5obj;

    p5obj.registerPreloadMethod('gamelabPreload', window.p5.prototype);

    p5obj.setupGlobalMode();

    window.preload = function () {
      // Artificially increment preloadCount to force _start/_setup to wait.
      // p5._preloadCount++;
      // this.p5decrementPreload = p5._getDecrementPreload(arguments, p5);
      // var gamelabPreload = p5._wrapPreload(p5, 'gamelab');
      window.gamelabPreload();
    };
    window.setup = _.bind(function () {
      console.log("p5 setup");
      p5obj.createCanvas(400, 400);
      if (this.JSInterpreter && this.setupFunc) {
        this.JSInterpreter.queueEvent(this.setupFunc);
        this.JSInterpreter.executeInterpreter();
      }
    }, this);
    window.draw = _.bind(function () {
      if (this.JSInterpreter) {
        var startTime = window.performance.now();
        if (this.drawFunc) {
          this.JSInterpreter.queueEvent(this.drawFunc);
        }
        this.JSInterpreter.executeInterpreter();
        var timeElapsed = window.performance.now() - startTime;
        $('#bubble').text(timeElapsed.toFixed(2) + ' ms');
      }
    }, this);
    window.mousePressed = _.bind(function () {
      if (this.JSInterpreter) {
        if (this.mousePressedFunc) {
          this.JSInterpreter.queueEvent(this.mousePressedFunc);
        }
        this.JSInterpreter.executeInterpreter();
      }
    }, this);
  }, this), 'divGameLab');

  if (this.level.editCode) {
    this.JSInterpreter = new JSInterpreter({
      code: this.studioApp_.getCode(),
      blocks: dropletConfig.blocks,
      blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
      enableEvents: true,
      studioApp: this.studioApp_,
      onExecutionError: _.bind(this.handleExecutionError, this)
    });
    if (!this.JSInterpreter.initialized()) {
      return;
    }
    this.drawFunc = this.JSInterpreter.findGlobalFunction('draw');
    this.setupFunc = this.JSInterpreter.findGlobalFunction('setup');
    this.mousePressedFunc = this.JSInterpreter.findGlobalFunction('mousePressed');

    codegen.customMarshalObjectList = [window.p5, window.Sprite, window.Camera, window.p5.Vector, window.p5.Color, window.p5.Image];
    codegen.customMarshalModifiedObjectList = [{ instance: Array, methodName: 'draw' }];

    var intP5 = codegen.marshalNativeToInterpreter(this.JSInterpreter.interpreter, this.p5, window);

    this.JSInterpreter.interpreter.setProperty(this.JSInterpreter.globalScope, 'p5', intP5);

    var intGroup = codegen.marshalNativeToInterpreter(this.JSInterpreter.interpreter, window.Group, window);

    this.JSInterpreter.interpreter.setProperty(this.JSInterpreter.globalScope, 'Group', intGroup);

    /*
    if (this.checkForEditCodePreExecutionFailure()) {
      return this.onPuzzleComplete();
    }
    */
  } else {
      this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
      this.evalCode(this.code);
    }

  this.studioApp_.playAudio('start', { loop: true });

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  this.tickIntervalId = window.setInterval(_.bind(this.onTick, this), 33);
};

GameLab.prototype.onTick = function () {
  this.tickCount++;

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

    if (this.JSInterpreter.startedHandlingEvents && this.p5decrementPreload) {
      this.p5decrementPreload();
    }
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
GameLab.prototype.displayFeedback_ = function () {
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
    showingSharing: !level.disableSharing && level.freePlay /* || level.impressive */,
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
GameLab.prototype.onReportComplete = function (response) {
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
GameLab.prototype.checkAnswer = function () {
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
  if (this.testResults === this.studioApp_.TestResults.FREE_PLAY || this.testResults >= this.studioApp_.TestResults.TOO_MANY_BLOCKS_FAIL) {
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
    onComplete: _.bind(this.onReportComplete, this)
  };

  // save_to_gallery: level.impressive
  this.studioApp_.report(reportData);

  if (this.studioApp_.isUsingBlockly()) {
    // reenable toolbox
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
  }

  // The call to displayFeedback() will happen later in onReportComplete()
};

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/extraControlRows.html.ejs","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<div id="divGameLab" tabindex="1">\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/levels.js":[function(require,module,exports){
/*jshint multistr: true */

'use strict';

var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

// Base config for levels created via levelbuilder
levels.custom = {
  ideal: Infinity,
  requiredBlocks: [],
  scale: {
    'snapRadius': 2
  },
  startBlocks: ''
};

levels.sandbox = {
  ideal: Infinity,
  requiredBlocks: [],
  scale: {
    'snapRadius': 2
  },
  softButtons: ['leftButton', 'rightButton', 'downButton', 'upButton'],
  freePlay: true,
  toolbox: tb(blockOfType('gamelab_foo')),
  startBlocks: '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.ec_sandbox = utils.extend(levels.sandbox, {
  editCode: true,
  codeFunctions: {
    // Game Lab
    "foo": null
  },
  startBlocks: ""
});

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/extraControlRows.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n');2; /* GameLab */ ; buf.push('\n\n');4; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((7,  assetUrl('media/1x1.gif') )), '">', escape((7,  msg.finish() )), '\n    </button>\n  </div>\n');10; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js":[function(require,module,exports){
'use strict';

var msg = require('./locale');
var api = require('./apiJavascript.js');

module.exports.blocks = [{ func: 'foo', parent: api, category: '' }];

module.exports.categories = {
  '': {
    color: 'red',
    blocks: []
  },
  'Game Lab': {
    color: 'red',
    blocks: []
  },
  Commands: {
    color: 'red',
    blocks: []
  },
  Events: {
    color: 'green',
    blocks: []
  }
};

module.exports.autocompleteFunctionsWithParens = true;
module.exports.showParamDropdowns = true;

},{"./apiJavascript.js":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/locale.js":[function(require,module,exports){
// locale for gamelab
"use strict";

module.exports = window.blockly.gamelab_locale;

},{}],"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n');2; /* GameLab */ ; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" disabled=true class="arrow">\n    <img src="', escape((6,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" disabled=true class="arrow">\n    <img src="', escape((9,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" disabled=true class="arrow">\n    <img src="', escape((12,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" disabled=true class="arrow">\n    <img src="', escape((15,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n\n');19; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((22,  assetUrl('media/1x1.gif') )), '">', escape((22,  msg.finish() )), '\n    </button>\n  </div>\n');25; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js":[function(require,module,exports){
'use strict';

var GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels:
exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

exports.foo = function () {
  GameLab.executeCmd(null, 'foo');
};

},{}],"/home/ubuntu/staging/apps/build/js/gamelab/api.js":[function(require,module,exports){
'use strict';

var GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels:
exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.foo = function (id) {
  GameLab.executeCmd(id, 'foo');
};

},{}]},{},["/home/ubuntu/staging/apps/build/js/gamelab/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVks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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25CQSxJQUFJLE9BQU8sQ0FBQzs7O0FBR1osT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN6QyxTQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ25CLENBQUM7O0FBRUYsT0FBTyxDQUFDLEdBQUcsR0FBRyxZQUFZO0FBQ3hCLFNBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ2pDLENBQUM7Ozs7O0FDVEYsSUFBSSxPQUFPLENBQUM7OztBQUdaLE9BQU8sQ0FBQyxhQUFhLEdBQUcsVUFBVSxPQUFPLEVBQUU7QUFDekMsU0FBTyxHQUFHLE9BQU8sQ0FBQztDQUNuQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVSxNQUFNLEVBQUU7QUFDakMsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELFNBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLENBQUM7O0FBRUYsT0FBTyxDQUFDLEdBQUcsR0FBRyxVQUFVLEVBQUUsRUFBRTtBQUMxQixTQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMvQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuZ2FtZWxhYk1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBnYW1lbGFiID0gbmV3IEdhbWVMYWIoKTtcblxuICBnYW1lbGFiLmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGdhbWVsYWIsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwidmFyIHNraW5CYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5CYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIENETyBBcHA6IEdhbWVMYWJcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5nYW1lbGFiX2ZvbyA9IHtcbiAgICAvLyBCbG9jayBmb3IgZm9vLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5mb28oKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mb29Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZ2FtZWxhYl9mb28gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZm9vLlxuICAgIHJldHVybiAnR2FtZUxhYi5mb28oKTtcXG4nO1xuICB9O1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGlKYXZhc2NyaXB0ID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0Jyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG52YXIgSlNJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4uL0pTSW50ZXJwcmV0ZXInKTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYiBjbGFzc1xuICovXG52YXIgR2FtZUxhYiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IG51bGw7XG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuZHJhd0Z1bmMgPSBudWxsO1xuICB0aGlzLnNldHVwRnVuYyA9IG51bGw7XG4gIHRoaXMubW91c2VQcmVzc2VkRnVuYyA9IG51bGw7XG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdO1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuXG4gIHRoaXMuYXBpID0gYXBpO1xuICB0aGlzLmFwaS5pbmplY3RHYW1lTGFiKHRoaXMpO1xuICB0aGlzLmFwaUpTID0gYXBpSmF2YXNjcmlwdDtcbiAgdGhpcy5hcGlKUy5pbmplY3RHYW1lTGFiKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTGFiO1xuXG4vKipcbiAqIEluamVjdCB0aGUgc3R1ZGlvQXBwIHNpbmdsZXRvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuaW5qZWN0U3R1ZGlvQXBwID0gZnVuY3Rpb24gKHN0dWRpb0FwcCkge1xuICB0aGlzLnN0dWRpb0FwcF8gPSBzdHVkaW9BcHA7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCA9IF8uYmluZCh0aGlzLnJlc2V0LCB0aGlzKTtcbiAgdGhpcy5zdHVkaW9BcHBfLnJ1bkJ1dHRvbkNsaWNrID0gXy5iaW5kKHRoaXMucnVuQnV0dG9uQ2xpY2ssIHRoaXMpO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoaXMgR2FtZUxhYiBpbnN0YW5jZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZUxhYiByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuc2V0dXBHbG9iYWxNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmb3Igbm8tc2tldGNoIEdsb2JhbCBtb2RlXG4gICAgICovXG4gICAgdmFyIHA1ID0gd2luZG93LnA1O1xuXG4gICAgdGhpcy5faXNHbG9iYWwgPSB0cnVlO1xuICAgIC8vIExvb3AgdGhyb3VnaCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYW5kIGF0dGFjaCB0aGVtIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwIGluIHA1LnByb3RvdHlwZSkge1xuICAgICAgaWYodHlwZW9mIHA1LnByb3RvdHlwZVtwXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZXYgPSBwLnN1YnN0cmluZygyKTtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudHMuaGFzT3duUHJvcGVydHkoZXYpKSB7XG4gICAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXR0YWNoIGl0cyBwcm9wZXJ0aWVzIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwMiBpbiB0aGlzKSB7XG4gICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShwMikpIHtcbiAgICAgICAgd2luZG93W3AyXSA9IHRoaXNbcDJdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG5cbiAgdmFyIHNob3dGaW5pc2hCdXR0b24gPSAhdGhpcy5sZXZlbC5pc1Byb2plY3RMZXZlbDtcbiAgdmFyIGZpbmlzaEJ1dHRvbkZpcnN0TGluZSA9IF8uaXNFbXB0eSh0aGlzLmxldmVsLnNvZnRCdXR0b25zKTtcbiAgdmFyIGZpcnN0Q29udHJvbHNSb3cgPSByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZmluaXNoQnV0dG9uOiBmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcbiAgdmFyIGV4dHJhQ29udHJvbFJvd3MgPSByZXF1aXJlKCcuL2V4dHJhQ29udHJvbFJvd3MuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246ICFmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IGZpcnN0Q29udHJvbHNSb3csXG4gICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBfLmJpbmQodGhpcy5sb2FkQXVkaW9fLCB0aGlzKTtcbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gXy5iaW5kKHRoaXMuYWZ0ZXJJbmplY3RfLCB0aGlzLCBjb25maWcpO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5pbml0KGNvbmZpZyk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5sb2FkQXVkaW9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xufTtcblxuLyoqXG4gKiBDb2RlIGNhbGxlZCBhZnRlciB0aGUgYmxvY2tseSBkaXYgKyBibG9ja2x5IGNvcmUgaXMgaW5qZWN0ZWQgaW50byB0aGUgZG9jdW1lbnRcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuYWZ0ZXJJbmplY3RfID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ0dhbWVMYWIsY29kZScpO1xuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG5cbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICBkaXZHYW1lTGFiLnN0eWxlLndpZHRoID0gJzQwMHB4JztcbiAgZGl2R2FtZUxhYi5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuXG59O1xuXG5cbi8qKlxuICogUmVzZXQgR2FtZUxhYiB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlIFJlcXVpcmVkIGJ5IHRoZSBBUEkgYnV0IGlnbm9yZWQgYnkgdGhpc1xuICogICAgIGltcGxlbWVudGF0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChpZ25vcmUpIHtcblxuICB0aGlzLmV2ZW50SGFuZGxlcnMgPSBbXTtcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aWNrSW50ZXJ2YWxJZCk7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG5cbiAgLypcbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICB3aGlsZSAoZGl2R2FtZUxhYi5maXJzdENoaWxkKSB7XG4gICAgZGl2R2FtZUxhYi5yZW1vdmVDaGlsZChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpO1xuICB9XG4gICovXG5cbiAgaWYgKHRoaXMucDUpIHtcbiAgICB0aGlzLnA1LnJlbW92ZSgpO1xuICAgIHRoaXMucDUgPSBudWxsO1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcblxuICAgIC8vIENsZWFyIHJlZ2lzdGVyZWQgbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlOlxuICAgIGZvciAodmFyIG1lbWJlciBpbiB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcykge1xuICAgICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzW21lbWJlcl07XG4gICAgfVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzID0geyBwcmU6IFtdLCBwb3N0OiBbXSwgcmVtb3ZlOiBbXSB9O1xuICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkUHJlbG9hZE1ldGhvZHMuZ2FtZWxhYlByZWxvYWQ7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmFsbFNwcml0ZXMgPSBuZXcgd2luZG93Lkdyb3VwKCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5zcHJpdGVVcGRhdGUgPSB0cnVlO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEgPSBuZXcgd2luZG93LkNhbWVyYSgwLCAwLCAxKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYS5pbml0ID0gZmFsc2U7XG5cbiAgICAvL2tleWJvYXJkIGlucHV0XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS5yZWFkUHJlc3Nlcyk7XG5cbiAgICAvL2F1dG9tYXRpYyBzcHJpdGUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS51cGRhdGVTcHJpdGVzKTtcblxuICAgIC8vcXVhZHRyZWUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy51cGRhdGVUcmVlKTtcblxuICAgIC8vY2FtZXJhIHB1c2ggYW5kIHBvcFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5jYW1lcmFQdXNoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LmNhbWVyYVBvcCk7XG5cbiAgfVxuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuZ2FtZWxhYlByZWxvYWQgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gd2luZG93LnA1Ll9nZXREZWNyZW1lbnRQcmVsb2FkKGFyZ3VtZW50cywgdGhpcy5wNSk7XG4gIH0sIHRoaXMpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG4gIHRoaXMuZHJhd0Z1bmMgPSBudWxsO1xuICB0aGlzLnNldHVwRnVuYyA9IG51bGw7XG4gIHRoaXMubW91c2VQcmVzc2VkRnVuYyA9IG51bGw7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgY29kZSBmb3IgYWxsIG9mIHRoZSBldmVudCBoYW5kbGVycyB0aGF0IG1hdGNoIGFuIGV2ZW50IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIGhhbmRsZXIgd2Ugd2FudCB0byBjYWxsXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93UXVldWVFeGVuc2lvbiBXaGVuIHRydWUsIHdlIGFsbG93IGFkZGl0aW9uYWwgY21kcyB0b1xuICogIGJlIGFwcGVuZGVkIHRvIHRoZSBxdWV1ZVxuICogQHBhcmFtIHtBcnJheX0gZXh0cmFBcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHBhc3NlZCBpbnRvIHRoZSB2aXJ0dWFsXG4qICAgSlMgbWFjaGluZSBmb3IgY29uc3VtcHRpb24gYnkgdGhlIHN0dWRlbnQncyBldmVudC1oYW5kbGluZyBjb2RlLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5jYWxsSGFuZGxlciA9IGZ1bmN0aW9uIChuYW1lLCBhbGxvd1F1ZXVlRXh0ZW5zaW9uLCBleHRyYUFyZ3MpIHtcbiAgdGhpcy5ldmVudEhhbmRsZXJzLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICAvLyBOb3RlOiB3ZSBza2lwIGV4ZWN1dGluZyB0aGUgY29kZSBpZiB3ZSBoYXZlIG5vdCBjb21wbGV0ZWQgZXhlY3V0aW5nXG4gICAgICAvLyB0aGUgY21kUXVldWUgb24gdGhpcyBoYW5kbGVyIChjaGVja2luZyBmb3Igbm9uLXplcm8gbGVuZ3RoKVxuICAgICAgaWYgKGhhbmRsZXIubmFtZSA9PT0gbmFtZSAmJlxuICAgICAgICAgIChhbGxvd1F1ZXVlRXh0ZW5zaW9uIHx8ICgwID09PSBoYW5kbGVyLmNtZFF1ZXVlLmxlbmd0aCkpKSB7XG4gICAgICAgIHRoaXMuY3VycmVudENtZFF1ZXVlID0gaGFuZGxlci5jbWRRdWV1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBoYW5kbGVyLmZ1bmModGhpcy5zdHVkaW9BcHBfLCB0aGlzLmFwaSwgdGhpcy5HbG9iYWxzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRDbWRRdWV1ZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8gKGNwaXJpY2gpOiBzdXBwb3J0IGV2ZW50cyB3aXRoIHBhcmFtZXRlcnNcbiAgICAgIGlmIChoYW5kbGVyLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgaGFuZGxlci5mdW5jLmFwcGx5KG51bGwsIGV4dHJhQXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB0aGlzKSk7XG59O1xuXG4vL1xuLy8gRXhlY3V0ZSBhbiBlbnRpcmUgY29tbWFuZCBxdWV1ZSAoc3BlY2lmaWVkIHdpdGggdGhlIG5hbWUgcGFyYW1ldGVyKVxuLy9cblxuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZVF1ZXVlID0gZnVuY3Rpb24gKG5hbWUsIG9uZU9ubHkpIHtcbiAgdGhpcy5ldmVudEhhbmRsZXJzLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgaWYgKGhhbmRsZXIubmFtZSA9PT0gbmFtZSAmJiBoYW5kbGVyLmNtZFF1ZXVlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgY21kID0gaGFuZGxlci5jbWRRdWV1ZVswXTsgY21kOyBjbWQgPSBoYW5kbGVyLmNtZFF1ZXVlWzBdKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbGxDbWQoY21kKSkge1xuICAgICAgICAgIC8vIENvbW1hbmQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHJlbW92ZSBmcm9tIHF1ZXVlIGFuZCBjb250aW51ZVxuICAgICAgICAgIGhhbmRsZXIuY21kUXVldWUuc2hpZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgdGhpcykpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBHYW1lTGFiOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBSZXNldCBhbGwgc3RhdGUuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJlxuICAgICAgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG5ldyB3aW5kb3cucDUoXy5iaW5kKGZ1bmN0aW9uIChwNW9iaikge1xuICAgICAgdGhpcy5wNSA9IHA1b2JqO1xuXG4gICAgICBwNW9iai5yZWdpc3RlclByZWxvYWRNZXRob2QoJ2dhbWVsYWJQcmVsb2FkJywgd2luZG93LnA1LnByb3RvdHlwZSk7XG5cbiAgICAgIHA1b2JqLnNldHVwR2xvYmFsTW9kZSgpO1xuXG4gICAgICB3aW5kb3cucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQXJ0aWZpY2lhbGx5IGluY3JlbWVudCBwcmVsb2FkQ291bnQgdG8gZm9yY2UgX3N0YXJ0L19zZXR1cCB0byB3YWl0LlxuICAgICAgICAvLyBwNS5fcHJlbG9hZENvdW50Kys7XG4gICAgICAgIC8vIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gcDUuX2dldERlY3JlbWVudFByZWxvYWQoYXJndW1lbnRzLCBwNSk7XG4gICAgICAgIC8vIHZhciBnYW1lbGFiUHJlbG9hZCA9IHA1Ll93cmFwUHJlbG9hZChwNSwgJ2dhbWVsYWInKTtcbiAgICAgICAgd2luZG93LmdhbWVsYWJQcmVsb2FkKCk7XG4gICAgICB9O1xuICAgICAgd2luZG93LnNldHVwID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwNSBzZXR1cFwiKTtcbiAgICAgICAgcDVvYmouY3JlYXRlQ2FudmFzKDQwMCwgNDAwKTtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLnNldHVwRnVuYykge1xuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5xdWV1ZUV2ZW50KHRoaXMuc2V0dXBGdW5jKTtcbiAgICAgICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgICAgd2luZG93LmRyYXcgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICBpZiAodGhpcy5kcmF3RnVuYykge1xuICAgICAgICAgICAgdGhpcy5KU0ludGVycHJldGVyLnF1ZXVlRXZlbnQodGhpcy5kcmF3RnVuYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcbiAgICAgICAgICB2YXIgdGltZUVsYXBzZWQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgJCgnI2J1YmJsZScpLnRleHQodGltZUVsYXBzZWQudG9GaXhlZCgyKSArICcgbXMnKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgICB3aW5kb3cubW91c2VQcmVzc2VkID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgICAgICAgIGlmICh0aGlzLm1vdXNlUHJlc3NlZEZ1bmMpIHtcbiAgICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5xdWV1ZUV2ZW50KHRoaXMubW91c2VQcmVzc2VkRnVuYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSwgdGhpcyksICdkaXZHYW1lTGFiJyk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICAgIGJsb2NrRmlsdGVyOiB0aGlzLmxldmVsLmV4ZWN1dGVQYWxldHRlQXBpc09ubHkgJiYgdGhpcy5sZXZlbC5jb2RlRnVuY3Rpb25zLFxuICAgICAgZW5hYmxlRXZlbnRzOiB0cnVlLFxuICAgICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgICBvbkV4ZWN1dGlvbkVycm9yOiBfLmJpbmQodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvciwgdGhpcyksXG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRyYXdGdW5jID0gdGhpcy5KU0ludGVycHJldGVyLmZpbmRHbG9iYWxGdW5jdGlvbignZHJhdycpO1xuICAgIHRoaXMuc2V0dXBGdW5jID0gdGhpcy5KU0ludGVycHJldGVyLmZpbmRHbG9iYWxGdW5jdGlvbignc2V0dXAnKTtcbiAgICB0aGlzLm1vdXNlUHJlc3NlZEZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKCdtb3VzZVByZXNzZWQnKTtcblxuICAgIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSBbIHdpbmRvdy5wNSwgd2luZG93LlNwcml0ZSwgd2luZG93LkNhbWVyYSwgd2luZG93LnA1LlZlY3Rvciwgd2luZG93LnA1LkNvbG9yLCB3aW5kb3cucDUuSW1hZ2UgXTtcbiAgICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxNb2RpZmllZE9iamVjdExpc3QgPSBbIHsgaW5zdGFuY2U6IEFycmF5LCBtZXRob2ROYW1lOiAnZHJhdycgfSBdO1xuXG4gICAgdmFyIGludFA1ID0gY29kZWdlbi5tYXJzaGFsTmF0aXZlVG9JbnRlcnByZXRlcihcbiAgICAgICAgdGhpcy5KU0ludGVycHJldGVyLmludGVycHJldGVyLFxuICAgICAgICB0aGlzLnA1LFxuICAgICAgICB3aW5kb3cpO1xuXG4gICAgdGhpcy5KU0ludGVycHJldGVyLmludGVycHJldGVyLnNldFByb3BlcnR5KFxuICAgICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZ2xvYmFsU2NvcGUsXG4gICAgICAgICdwNScsXG4gICAgICAgIGludFA1KTtcblxuICAgIHZhciBpbnRHcm91cCA9IGNvZGVnZW4ubWFyc2hhbE5hdGl2ZVRvSW50ZXJwcmV0ZXIoXG4gICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5pbnRlcnByZXRlcixcbiAgICAgICAgd2luZG93Lkdyb3VwLFxuICAgICAgICB3aW5kb3cpO1xuXG4gICAgdGhpcy5KU0ludGVycHJldGVyLmludGVycHJldGVyLnNldFByb3BlcnR5KFxuICAgICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZ2xvYmFsU2NvcGUsXG4gICAgICAgICdHcm91cCcsXG4gICAgICAgIGludEdyb3VwKTtcblxuICAgIC8qXG4gICAgaWYgKHRoaXMuY2hlY2tGb3JFZGl0Q29kZVByZUV4ZWN1dGlvbkZhaWx1cmUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMub25QdXp6bGVDb21wbGV0ZSgpO1xuICAgIH1cbiAgICAqL1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIHRoaXMudGlja0ludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoXy5iaW5kKHRoaXMub25UaWNrLCB0aGlzKSwgMzMpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpY2tDb3VudCsrO1xuXG4gIGlmICh0aGlzLnRpY2tDb3VudCA9PT0gMSkge1xuICAgIHRoaXMuY2FsbEhhbmRsZXIoJ3doZW5HYW1lU3RhcnRzJyk7XG4gIH1cblxuICB0aGlzLmV4ZWN1dGVRdWV1ZSgnd2hlbkdhbWVTdGFydHMnKTtcblxuICB0aGlzLmNhbGxIYW5kbGVyKCdyZXBlYXRGb3JldmVyJyk7XG4gIHRoaXMuZXhlY3V0ZVF1ZXVlKCdyZXBlYXRGb3JldmVyJyk7XG5cbi8qXG4gIC8vIFJ1biBrZXkgZXZlbnQgaGFuZGxlcnMgZm9yIGFueSBrZXlzIHRoYXQgYXJlIGRvd246XG4gIGZvciAodmFyIGtleSBpbiBLZXlDb2Rlcykge1xuICAgIGlmIChTdHVkaW8ua2V5U3RhdGVbS2V5Q29kZXNba2V5XV0gJiZcbiAgICAgICAgU3R1ZGlvLmtleVN0YXRlW0tleUNvZGVzW2tleV1dID09PSBcImtleWRvd25cIikge1xuICAgICAgc3dpdGNoIChLZXlDb2Rlc1trZXldKSB7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuTEVGVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1sZWZ0Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuVVA6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tdXAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5SSUdIVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1yaWdodCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGVzLkRPV046XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tZG93bicpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGJ0biBpbiBBcnJvd0lkcykge1xuICAgIGlmIChTdHVkaW8uYnRuU3RhdGVbQXJyb3dJZHNbYnRuXV0gJiZcbiAgICAgICAgU3R1ZGlvLmJ0blN0YXRlW0Fycm93SWRzW2J0bl1dID09PSBCdXR0b25TdGF0ZS5ET1dOKSB7XG4gICAgICBzd2l0Y2ggKEFycm93SWRzW2J0bl0pIHtcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5MRUZUOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLWxlZnQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5VUDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi11cCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFycm93SWRzLlJJR0hUOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLXJpZ2h0Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuRE9XTjpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1kb3duJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgZ2VzdHVyZSBpbiBTdHVkaW8uZ2VzdHVyZXNPYnNlcnZlZCkge1xuICAgIHN3aXRjaCAoZ2VzdHVyZSkge1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLWxlZnQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1cCc6XG4gICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLXVwJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1yaWdodCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1kb3duJyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoMCA9PT0gU3R1ZGlvLmdlc3R1cmVzT2JzZXJ2ZWRbZ2VzdHVyZV0tLSkge1xuICAgICAgZGVsZXRlIFN0dWRpby5nZXN0dXJlc09ic2VydmVkW2dlc3R1cmVdO1xuICAgIH1cbiAgfVxuXG4gIFN0dWRpby5leGVjdXRlUXVldWUoJ3doZW4tbGVmdCcpO1xuICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuLXVwJyk7XG4gIFN0dWRpby5leGVjdXRlUXVldWUoJ3doZW4tcmlnaHQnKTtcbiAgU3R1ZGlvLmV4ZWN1dGVRdWV1ZSgnd2hlbi1kb3duJyk7XG4qL1xuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKHRoaXMudGlja0NvdW50ID09PSAxKTtcblxuICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIuc3RhcnRlZEhhbmRsaW5nRXZlbnRzICYmIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKSB7XG4gICAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCgpO1xuICAgIH1cbiAgfVxuXG5cbi8qXG4gIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gIGlmICghU3R1ZGlvLnN1Y2NlZWRlZFRpbWUgJiYgY2hlY2tGaW5pc2hlZCgpKSB7XG4gICAgU3R1ZGlvLnN1Y2NlZWRlZFRpbWUgPSBjdXJyZW50VGltZTtcbiAgfVxuXG4gIGlmICghYW5pbWF0aW9uT25seUZyYW1lKSB7XG4gICAgU3R1ZGlvLmV4ZWN1dGVRdWV1ZSgnd2hlblRvdWNoR29hbCcpO1xuICB9XG5cbiAgaWYgKFN0dWRpby5zdWNjZWVkZWRUaW1lICYmXG4gICAgICAhc3ByaXRlc05lZWRNb3JlQW5pbWF0aW9uRnJhbWVzICYmXG4gICAgICAoIWxldmVsLmRlbGF5Q29tcGxldGlvbiB8fCBjdXJyZW50VGltZSA+IFN0dWRpby5zdWNjZWVkZWRUaW1lICsgbGV2ZWwuZGVsYXlDb21wbGV0aW9uKSkge1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cblxuICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSBhbnkgcXVldWVkIGV2ZW50IGNvZGUgcmVsYXRlZCB0byBhbGwgZ29hbHMgYmVpbmcgdmlzaXRlZCBpcyBleGVjdXRlZFxuICAvLyBiZWZvcmUgd2UgZXZhbHVhdGUgY29uZGl0aW9ucyByZWxhdGVkIHRvIHRoaXMgZXZlbnQuICBGb3IgZXhhbXBsZSwgaWYgc2NvcmUgaXMgaW5jcmVtZW50ZWRcbiAgLy8gYXMgYSByZXN1bHQgb2YgYWxsIGdvYWxzIGJlaW5nIHZpc2l0ZWQsIHJlY29yZGluZyBhbGxHb2Fsc1Zpc2l0ZWQgaGVyZSBhbGxvd3MgdGhlIHNjb3JlXG4gIC8vIHRvIGJlIGluY3JlbWVudGVkIGJlZm9yZSB3ZSBjaGVjayBmb3IgYSBjb21wbGV0aW9uIGNvbmRpdGlvbiB0aGF0IGxvb2tzIGZvciBib3RoIGFsbFxuICAvLyBnb2FscyB2aXNpdGVkLCBhbmQgdGhlIGluY3JlbWVudGVkIHNjb3JlLCBvbiB0aGUgbmV4dCB0aWNrLlxuICBpZiAoU3R1ZGlvLmFsbEdvYWxzVmlzaXRlZCgpKSB7XG4gICAgU3R1ZGlvLnRyYWNrZWRCZWhhdmlvci5hbGxHb2Fsc1Zpc2l0ZWQgPSB0cnVlO1xuICB9XG5cbiAgLy8gQW5kIHdlIGRvbid0IHdhbnQgYSB0aW1lb3V0IHRvIGJlIHVzZWQgaW4gZXZhbHVhdGluZyBjb25kaXRpb25zIGJlZm9yZSB0aGUgYWxsIGdvYWxzIHZpc2l0ZWRcbiAgLy8gZXZlbnRzIGFyZSBwcm9jZXNzZWQgKGFzIGRlc2NyaWJlZCBhYm92ZSksIHNvIGFsc28gcmVjb3JkIHRoYXQgaGVyZS4gIFRoaXMgaXMgcGFydGljdWxhcmx5XG4gIC8vIHJlbGV2YW50IHRvIGxldmVscyB3aGljaCBcInRpbWUgb3V0XCIgaW1tZWRpYXRlbHkgd2hlbiBhbGwgd2hlbl9ydW4gY29kZSBpcyBjb21wbGV0ZS5cbiAgaWYgKFN0dWRpby50aW1lZE91dCgpKSB7XG4gICAgU3R1ZGlvLnRyYWNrZWRCZWhhdmlvci50aW1lZE91dCA9IHRydWU7XG4gIH1cbiovXG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbi8qXG4gIGlmICghbGluZU51bWJlciAmJiBlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIHN5bnRheCBlcnJvcnMgY2FtZSBiZWZvcmUgZXhlY3V0aW9uIChkdXJpbmcgcGFyc2luZyksIHNvIHdlIG5lZWRcbiAgICAvLyB0byBkZXRlcm1pbmUgdGhlIHByb3BlciBsaW5lIG51bWJlciBieSBsb29raW5nIGF0IHRoZSBleGNlcHRpb25cbiAgICBsaW5lTnVtYmVyID0gZXJyLmxvYy5saW5lO1xuICAgIC8vIE5vdyBzZWxlY3QgdGhpcyBsb2NhdGlvbiBpbiB0aGUgZWRpdG9yLCBzaW5jZSB3ZSBrbm93IHdlIGRpZG4ndCBoaXRcbiAgICAvLyB0aGlzIHdoaWxlIGV4ZWN1dGluZyAoaW4gd2hpY2ggY2FzZSwgaXQgd291bGQgYWxyZWFkeSBoYXZlIGJlZW4gc2VsZWN0ZWQpXG5cbiAgICBjb2RlZ2VuLnNlbGVjdEVkaXRvclJvd0NvbEVycm9yKHN0dWRpb0FwcC5lZGl0b3IsIGxpbmVOdW1iZXIgLSAxLCBlcnIubG9jLmNvbHVtbik7XG4gIH1cbiAgaWYgKFN0dWRpby5KU0ludGVycHJldGVyKSB7XG4gICAgLy8gU2VsZWN0IGNvZGUgdGhhdCBqdXN0IGV4ZWN1dGVkOlxuICAgIFN0dWRpby5KU0ludGVycHJldGVyLnNlbGVjdEN1cnJlbnRDb2RlKFwiYWNlX2Vycm9yXCIpO1xuICAgIC8vIEdyYWIgbGluZSBudW1iZXIgaWYgd2UgZG9uJ3QgaGF2ZSBvbmUgYWxyZWFkeTpcbiAgICBpZiAoIWxpbmVOdW1iZXIpIHtcbiAgICAgIGxpbmVOdW1iZXIgPSAxICsgU3R1ZGlvLkpTSW50ZXJwcmV0ZXIuZ2V0TmVhcmVzdFVzZXJDb2RlTGluZSgpO1xuICAgIH1cbiAgfVxuICBvdXRwdXRFcnJvcihTdHJpbmcoZXJyKSwgRXJyb3JMZXZlbC5FUlJPUiwgbGluZU51bWJlcik7XG4gIFN0dWRpby5leGVjdXRpb25FcnJvciA9IHsgZXJyOiBlcnIsIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXIgfTtcblxuICAvLyBDYWxsIG9uUHV6emxlQ29tcGxldGUoKSBpZiBzeW50YXggZXJyb3Igb3IgYW55IHRpbWUgd2UncmUgbm90IG9uIGEgZnJlZXBsYXkgbGV2ZWw6XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIE1hcmsgcHJlRXhlY3V0aW9uRmFpbHVyZSBhbmQgdGVzdFJlc3VsdHMgaW1tZWRpYXRlbHkgc28gdGhhdCBhbiBlcnJvclxuICAgIC8vIG1lc3NhZ2UgYWx3YXlzIGFwcGVhcnMsIGV2ZW4gb24gZnJlZXBsYXk6XG4gICAgU3R1ZGlvLnByZUV4ZWN1dGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgIFN0dWRpby50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlNZTlRBWF9FUlJPUl9GQUlMO1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH0gZWxzZSBpZiAoIWxldmVsLmZyZWVQbGF5KSB7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuKi9cbiAgdGhyb3cgZXJyO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBBUEkgY29tbWFuZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZUNtZCA9IGZ1bmN0aW9uIChpZCwgbmFtZSwgb3B0cykge1xuICBjb25zb2xlLmxvZyhcIkdhbWVMYWIgZXhlY3V0ZUNtZCBcIiArIG5hbWUpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIHRhc2tzIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIHVzZXIgcHJvZ3JhbSBpcyBmaW5pc2hlZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZmluaXNoRXhlY3V0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuaGlnaGxpZ2h0QmxvY2sobnVsbCk7XG4gIH1cbiAgdGhpcy5jaGVja0Fuc3dlcigpO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrKHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgLy8gZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IC8qIHx8IGxldmVsLmltcHJlc3NpdmUgKi8pLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgLy8gYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IG1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogbXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gbGV2ZWwuZnJlZVBsYXkgJiYgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICAvLyBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJkaXZHYW1lTGFiXCIgdGFiaW5kZXg9XCIxXCI+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHRiID0gYmxvY2tVdGlscy5jcmVhdGVUb29sYm94O1xudmFyIGJsb2NrT2ZUeXBlID0gYmxvY2tVdGlscy5ibG9ja09mVHlwZTtcbnZhciBjcmVhdGVDYXRlZ29yeSA9IGJsb2NrVXRpbHMuY3JlYXRlQ2F0ZWdvcnk7XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gQmFzZSBjb25maWcgZm9yIGxldmVscyBjcmVhdGVkIHZpYSBsZXZlbGJ1aWxkZXJcbmxldmVscy5jdXN0b20gPSB7XG4gIGlkZWFsOiBJbmZpbml0eSxcbiAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICBzY2FsZToge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICBzdGFydEJsb2NrczogJydcbn07XG5cbmxldmVscy5zYW5kYm94ID0gIHtcbiAgaWRlYWw6IEluZmluaXR5LFxuICByZXF1aXJlZEJsb2NrczogW1xuICBdLFxuICBzY2FsZToge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICBzb2Z0QnV0dG9uczogW1xuICAgICdsZWZ0QnV0dG9uJyxcbiAgICAncmlnaHRCdXR0b24nLFxuICAgICdkb3duQnV0dG9uJyxcbiAgICAndXBCdXR0b24nXG4gIF0sXG4gIGZyZWVQbGF5OiB0cnVlLFxuICB0b29sYm94OlxuICAgIHRiKGJsb2NrT2ZUeXBlKCdnYW1lbGFiX2ZvbycpKSxcbiAgc3RhcnRCbG9ja3M6XG4gICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nXG59O1xuXG5sZXZlbHMuZWNfc2FuZGJveCA9IHV0aWxzLmV4dGVuZChsZXZlbHMuc2FuZGJveCwge1xuICBlZGl0Q29kZTogdHJ1ZSxcbiAgY29kZUZ1bmN0aW9uczoge1xuICAgIC8vIEdhbWUgTGFiXG4gICAgXCJmb29cIjogbnVsbCxcbiAgfSxcbiAgc3RhcnRCbG9ja3M6IFwiXCIsXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuJyk7NDsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDcsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsxMDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICB7ZnVuYzogJ2ZvbycsIHBhcmVudDogYXBpLCBjYXRlZ29yeTogJycgfSxcbl07XG5cbm1vZHVsZS5leHBvcnRzLmNhdGVnb3JpZXMgPSB7XG4gICcnOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgJ0dhbWUgTGFiJzoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIENvbW1hbmRzOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRXZlbnRzOiB7XG4gICAgY29sb3I6ICdncmVlbicsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMuYXV0b2NvbXBsZXRlRnVuY3Rpb25zV2l0aFBhcmVucyA9IHRydWU7XG5tb2R1bGUuZXhwb3J0cy5zaG93UGFyYW1Ecm9wZG93bnMgPSB0cnVlO1xuIiwiLy8gbG9jYWxlIGZvciBnYW1lbGFiXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmdhbWVsYWJfbG9jYWxlO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuJyk7MjsgLyogR2FtZUxhYiAqLyA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwic29mdC1idXR0b25zXCIgY2xhc3M9XCJzb2Z0LWJ1dHRvbnMtbm9uZVwiPlxcbiAgPGJ1dHRvbiBpZD1cImxlZnRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDYsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJsZWZ0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg5LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwicmlnaHQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwidXBCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDEyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwidXAtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwiZG93bkJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJkb3duLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbjwvZGl2PlxcblxcbicpOzE5OyBpZiAoZmluaXNoQnV0dG9uKSB7IDsgYnVmLnB1c2goJ1xcbiAgPGRpdiBpZD1cInNoYXJlLWNlbGxcIiBjbGFzcz1cInNoYXJlLWNlbGwtbm9uZVwiPlxcbiAgICA8YnV0dG9uIGlkPVwiZmluaXNoQnV0dG9uXCIgY2xhc3M9XCJzaGFyZVwiPlxcbiAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDIyLCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MjU7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQobnVsbCwgJ2ZvbycpO1xufTtcbiIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uIChpZCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQoaWQsICdmb28nKTtcbn07XG4iXX0=
