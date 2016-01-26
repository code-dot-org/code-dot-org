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
      // Call our gamelabPreload() to force _start/_setup to wait.
      window.gamelabPreload();
    };
    window.setup = _.bind(function () {
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
      onExecutionError: _.bind(this.handleExecutionError, this),
      customMarshalGlobalProperties: {
        width: this.p5,
        height: this.p5,
        displayWidth: this.p5,
        displayHeight: this.p5,
        windowWidth: this.p5,
        windowHeight: this.p5,
        focused: this.p5,
        frameCount: this.p5,
        keyIsPressed: this.p5,
        key: this.p5,
        keyCode: this.p5,
        mouseX: this.p5,
        mouseY: this.p5,
        pmouseX: this.p5,
        pmouseY: this.p5,
        winMouseX: this.p5,
        winMouseY: this.p5,
        pwinMouseX: this.p5,
        pwinMouseY: this.p5,
        mouseButton: this.p5,
        mouseIsPressed: this.p5,
        touchX: this.p5,
        touchY: this.p5,
        ptouchX: this.p5,
        ptouchY: this.p5,
        touches: this.p5,
        touchIsDown: this.p5,
        pixels: this.p5,
        deviceOrientation: this.p5,
        accelerationX: this.p5,
        accelerationY: this.p5,
        accelerationZ: this.p5,
        pAccelerationX: this.p5,
        pAccelerationY: this.p5,
        pAccelerationZ: this.p5,
        rotationX: this.p5,
        rotationY: this.p5,
        rotationZ: this.p5,
        pRotationX: this.p5,
        pRotationY: this.p5,
        pRotationZ: this.p5
      }
    });
    if (!this.JSInterpreter.initialized()) {
      return;
    }
    this.drawFunc = this.JSInterpreter.findGlobalFunction('draw');
    this.setupFunc = this.JSInterpreter.findGlobalFunction('setup');
    this.mousePressedFunc = this.JSInterpreter.findGlobalFunction('mousePressed');

    codegen.customMarshalObjectList = [window.p5, window.Sprite, window.Camera, window.p5.Vector, window.p5.Color, window.p5.Image, window.p5.Renderer, window.p5.Graphics, window.p5.Font, window.p5.Table, window.p5.TableRow, window.p5.Element];
    codegen.customMarshalModifiedObjectList = [{ instance: Array, methodName: 'draw' }];

    // Insert everything on p5 and the Group constructor from p5play into the
    // global namespace of the interpreter:
    for (var prop in this.p5) {
      this.JSInterpreter.createGlobalProperty(prop, this.p5[prop], this.p5);
    }
    this.JSInterpreter.createGlobalProperty('Group', window.Group);
    // And also create a 'p5' object in the global namespace:
    this.JSInterpreter.createGlobalProperty('p5', { Vector: window.p5.Vector });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVks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RyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQsU0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEIsQ0FBQzs7QUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsRUFBRSxFQUFFO0FBQzFCLFNBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQy9CLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5nYW1lbGFiTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGdhbWVsYWIgPSBuZXcgR2FtZUxhYigpO1xuXG4gIGdhbWVsYWIuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oZ2FtZWxhYiwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQ0RPIEFwcDogR2FtZUxhYlxuICpcbiAqIENvcHlyaWdodCAyMDE2IENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmdhbWVsYWJfZm9vID0ge1xuICAgIC8vIEJsb2NrIGZvciBmb28uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZvbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZvb1Rvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5nYW1lbGFiX2ZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBmb28uXG4gICAgcmV0dXJuICdHYW1lTGFiLmZvbygpO1xcbic7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaUphdmFzY3JpcHQgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQnKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBHYW1lTGFiIGNsYXNzXG4gKi9cbnZhciBHYW1lTGFiID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNraW4gPSBudWxsO1xuICB0aGlzLmxldmVsID0gbnVsbDtcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IDA7XG4gIHRoaXMudGlja0NvdW50ID0gMDtcbiAgdGhpcy5zdHVkaW9BcHBfID0gbnVsbDtcbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgdGhpcy5kcmF3RnVuYyA9IG51bGw7XG4gIHRoaXMuc2V0dXBGdW5jID0gbnVsbDtcbiAgdGhpcy5tb3VzZVByZXNzZWRGdW5jID0gbnVsbDtcbiAgdGhpcy5ldmVudEhhbmRsZXJzID0gW107XG4gIHRoaXMuR2xvYmFscyA9IHt9O1xuICB0aGlzLmN1cnJlbnRDbWRRdWV1ZSA9IG51bGw7XG4gIHRoaXMucDUgPSBudWxsO1xuICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBhcGk7XG4gIHRoaXMuYXBpLmluamVjdEdhbWVMYWIodGhpcyk7XG4gIHRoaXMuYXBpSlMgPSBhcGlKYXZhc2NyaXB0O1xuICB0aGlzLmFwaUpTLmluamVjdEdhbWVMYWIodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWI7XG5cbi8qKlxuICogSW5qZWN0IHRoZSBzdHVkaW9BcHAgc2luZ2xldG9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhpcyBHYW1lTGFiIGluc3RhbmNlLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgaWYgKCF0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lTGFiIHJlcXVpcmVzIGEgU3R1ZGlvQXBwXCIpO1xuICB9XG5cbiAgdGhpcy5za2luID0gY29uZmlnLnNraW47XG4gIHRoaXMubGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5zZXR1cEdsb2JhbE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZvciBuby1za2V0Y2ggR2xvYmFsIG1vZGVcbiAgICAgKi9cbiAgICB2YXIgcDUgPSB3aW5kb3cucDU7XG5cbiAgICB0aGlzLl9pc0dsb2JhbCA9IHRydWU7XG4gICAgLy8gTG9vcCB0aHJvdWdoIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZSBhbmQgYXR0YWNoIHRoZW0gdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAgaW4gcDUucHJvdG90eXBlKSB7XG4gICAgICBpZih0eXBlb2YgcDUucHJvdG90eXBlW3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBldiA9IHAuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShldikpIHtcbiAgICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBdHRhY2ggaXRzIHByb3BlcnRpZXMgdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAyIGluIHRoaXMpIHtcbiAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KHAyKSkge1xuICAgICAgICB3aW5kb3dbcDJdID0gdGhpc1twMl07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbmZpZy5kcm9wbGV0Q29uZmlnID0gZHJvcGxldENvbmZpZztcblxuICB2YXIgc2hvd0ZpbmlzaEJ1dHRvbiA9ICF0aGlzLmxldmVsLmlzUHJvamVjdExldmVsO1xuICB2YXIgZmluaXNoQnV0dG9uRmlyc3RMaW5lID0gXy5pc0VtcHR5KHRoaXMubGV2ZWwuc29mdEJ1dHRvbnMpO1xuICB2YXIgZmlyc3RDb250cm9sc1JvdyA9IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246IGZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IHJlcXVpcmUoJy4vZXh0cmFDb250cm9sUm93cy5odG1sLmVqcycpKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGZpbmlzaEJ1dHRvbjogIWZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuXG4gIGNvbmZpZy5odG1sID0gcGFnZSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBkYXRhOiB7XG4gICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogZmlyc3RDb250cm9sc1JvdyxcbiAgICAgIGV4dHJhQ29udHJvbFJvd3M6IGV4dHJhQ29udHJvbFJvd3MsXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IF8uYmluZCh0aGlzLmxvYWRBdWRpb18sIHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBfLmJpbmQodGhpcy5hZnRlckluamVjdF8sIHRoaXMsIGNvbmZpZyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmluaXQoY29uZmlnKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnR2FtZUxhYixjb2RlJyk7XG4gIH1cblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIGRpdkdhbWVMYWIuc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuICBkaXZHYW1lTGFiLnN0eWxlLmhlaWdodCA9ICc0MDBweCc7XG5cbn07XG5cblxuLyoqXG4gKiBSZXNldCBHYW1lTGFiIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGlnbm9yZSkge1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdO1xuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpY2tJbnRlcnZhbElkKTtcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IDA7XG4gIHRoaXMudGlja0NvdW50ID0gMDtcblxuICAvKlxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIHdoaWxlIChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpIHtcbiAgICBkaXZHYW1lTGFiLnJlbW92ZUNoaWxkKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCk7XG4gIH1cbiAgKi9cblxuICBpZiAodGhpcy5wNSkge1xuICAgIHRoaXMucDUucmVtb3ZlKCk7XG4gICAgdGhpcy5wNSA9IG51bGw7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuXG4gICAgLy8gQ2xlYXIgcmVnaXN0ZXJlZCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGU6XG4gICAgZm9yICh2YXIgbWVtYmVyIGluIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzKSB7XG4gICAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHNbbWVtYmVyXTtcbiAgICB9XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMgPSB7IHByZTogW10sIHBvc3Q6IFtdLCByZW1vdmU6IFtdIH07XG4gICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRQcmVsb2FkTWV0aG9kcy5nYW1lbGFiUHJlbG9hZDtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuYWxsU3ByaXRlcyA9IG5ldyB3aW5kb3cuR3JvdXAoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnNwcml0ZVVwZGF0ZSA9IHRydWU7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYSA9IG5ldyB3aW5kb3cuQ2FtZXJhKDAsIDAsIDEpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhLmluaXQgPSBmYWxzZTtcblxuICAgIC8va2V5Ym9hcmQgaW5wdXRcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnJlYWRQcmVzc2VzKTtcblxuICAgIC8vYXV0b21hdGljIHNwcml0ZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnVwZGF0ZVNwcml0ZXMpO1xuXG4gICAgLy9xdWFkdHJlZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LnVwZGF0ZVRyZWUpO1xuXG4gICAgLy9jYW1lcmEgcHVzaCBhbmQgcG9wXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LmNhbWVyYVB1c2gpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cuY2FtZXJhUG9wKTtcblxuICB9XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5nYW1lbGFiUHJlbG9hZCA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSB3aW5kb3cucDUuX2dldERlY3JlbWVudFByZWxvYWQoYXJndW1lbnRzLCB0aGlzLnA1KTtcbiAgfSwgdGhpcyk7XG5cbiAgLy8gRGlzY2FyZCB0aGUgaW50ZXJwcmV0ZXIuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZGVpbml0aWFsaXplKCk7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgfVxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcbiAgdGhpcy5kcmF3RnVuYyA9IG51bGw7XG4gIHRoaXMuc2V0dXBGdW5jID0gbnVsbDtcbiAgdGhpcy5tb3VzZVByZXNzZWRGdW5jID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSBjb2RlIGZvciBhbGwgb2YgdGhlIGV2ZW50IGhhbmRsZXJzIHRoYXQgbWF0Y2ggYW4gZXZlbnQgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgaGFuZGxlciB3ZSB3YW50IHRvIGNhbGxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dRdWV1ZUV4ZW5zaW9uIFdoZW4gdHJ1ZSwgd2UgYWxsb3cgYWRkaXRpb25hbCBjbWRzIHRvXG4gKiAgYmUgYXBwZW5kZWQgdG8gdGhlIHF1ZXVlXG4gKiBAcGFyYW0ge0FycmF5fSBleHRyYUFyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgcGFzc2VkIGludG8gdGhlIHZpcnR1YWxcbiogICBKUyBtYWNoaW5lIGZvciBjb25zdW1wdGlvbiBieSB0aGUgc3R1ZGVudCdzIGV2ZW50LWhhbmRsaW5nIGNvZGUuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNhbGxIYW5kbGVyID0gZnVuY3Rpb24gKG5hbWUsIGFsbG93UXVldWVFeHRlbnNpb24sIGV4dHJhQXJncykge1xuICB0aGlzLmV2ZW50SGFuZGxlcnMuZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIC8vIE5vdGU6IHdlIHNraXAgZXhlY3V0aW5nIHRoZSBjb2RlIGlmIHdlIGhhdmUgbm90IGNvbXBsZXRlZCBleGVjdXRpbmdcbiAgICAgIC8vIHRoZSBjbWRRdWV1ZSBvbiB0aGlzIGhhbmRsZXIgKGNoZWNraW5nIGZvciBub24temVybyBsZW5ndGgpXG4gICAgICBpZiAoaGFuZGxlci5uYW1lID09PSBuYW1lICYmXG4gICAgICAgICAgKGFsbG93UXVldWVFeHRlbnNpb24gfHwgKDAgPT09IGhhbmRsZXIuY21kUXVldWUubGVuZ3RoKSkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBoYW5kbGVyLmNtZFF1ZXVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGhhbmRsZXIuZnVuYyh0aGlzLnN0dWRpb0FwcF8sIHRoaXMuYXBpLCB0aGlzLkdsb2JhbHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gRG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudENtZFF1ZXVlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyAoY3BpcmljaCk6IHN1cHBvcnQgZXZlbnRzIHdpdGggcGFyYW1ldGVyc1xuICAgICAgaWYgKGhhbmRsZXIubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBoYW5kbGVyLmZ1bmMuYXBwbHkobnVsbCwgZXh0cmFBcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHRoaXMpKTtcbn07XG5cbi8vXG4vLyBFeGVjdXRlIGFuIGVudGlyZSBjb21tYW5kIHF1ZXVlIChzcGVjaWZpZWQgd2l0aCB0aGUgbmFtZSBwYXJhbWV0ZXIpXG4vL1xuXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlUXVldWUgPSBmdW5jdGlvbiAobmFtZSwgb25lT25seSkge1xuICB0aGlzLmV2ZW50SGFuZGxlcnMuZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICBpZiAoaGFuZGxlci5uYW1lID09PSBuYW1lICYmIGhhbmRsZXIuY21kUXVldWUubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBjbWQgPSBoYW5kbGVyLmNtZFF1ZXVlWzBdOyBjbWQ7IGNtZCA9IGhhbmRsZXIuY21kUXVldWVbMF0pIHtcbiAgICAgICAgaWYgKHRoaXMuY2FsbENtZChjbWQpKSB7XG4gICAgICAgICAgLy8gQ29tbWFuZCBleGVjdXRlZCBpbW1lZGlhdGVseSwgcmVtb3ZlIGZyb20gcXVldWUgYW5kIGNvbnRpbnVlXG4gICAgICAgICAgaGFuZGxlci5jbWRRdWV1ZS5zaGlmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB0aGlzKSk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5ldmFsQ29kZSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIEdhbWVMYWI6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIFJlc2V0IGFsbCBzdGF0ZS5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpICYmXG4gICAgICAodGhpcy5zdHVkaW9BcHBfLmhhc0V4dHJhVG9wQmxvY2tzKCkgfHxcbiAgICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIsIHdoaWNoIHdpbGwgZmFpbCBhbmQgcmVwb3J0IHRvcCBsZXZlbCBibG9ja3NcbiAgICB0aGlzLmNoZWNrQW5zd2VyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbmV3IHdpbmRvdy5wNShfLmJpbmQoZnVuY3Rpb24gKHA1b2JqKSB7XG4gICAgICB0aGlzLnA1ID0gcDVvYmo7XG5cbiAgICAgIHA1b2JqLnJlZ2lzdGVyUHJlbG9hZE1ldGhvZCgnZ2FtZWxhYlByZWxvYWQnLCB3aW5kb3cucDUucHJvdG90eXBlKTtcblxuICAgICAgcDVvYmouc2V0dXBHbG9iYWxNb2RlKCk7XG5cbiAgICAgIHdpbmRvdy5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDYWxsIG91ciBnYW1lbGFiUHJlbG9hZCgpIHRvIGZvcmNlIF9zdGFydC9fc2V0dXAgdG8gd2FpdC5cbiAgICAgICAgd2luZG93LmdhbWVsYWJQcmVsb2FkKCk7XG4gICAgICB9O1xuICAgICAgd2luZG93LnNldHVwID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcDVvYmouY3JlYXRlQ2FudmFzKDQwMCwgNDAwKTtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLnNldHVwRnVuYykge1xuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5xdWV1ZUV2ZW50KHRoaXMuc2V0dXBGdW5jKTtcbiAgICAgICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgICAgd2luZG93LmRyYXcgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICBpZiAodGhpcy5kcmF3RnVuYykge1xuICAgICAgICAgICAgdGhpcy5KU0ludGVycHJldGVyLnF1ZXVlRXZlbnQodGhpcy5kcmF3RnVuYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcbiAgICAgICAgICB2YXIgdGltZUVsYXBzZWQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgJCgnI2J1YmJsZScpLnRleHQodGltZUVsYXBzZWQudG9GaXhlZCgyKSArICcgbXMnKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgICB3aW5kb3cubW91c2VQcmVzc2VkID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgICAgICAgIGlmICh0aGlzLm1vdXNlUHJlc3NlZEZ1bmMpIHtcbiAgICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5xdWV1ZUV2ZW50KHRoaXMubW91c2VQcmVzc2VkRnVuYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgfSwgdGhpcyksICdkaXZHYW1lTGFiJyk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICAgIGJsb2NrRmlsdGVyOiB0aGlzLmxldmVsLmV4ZWN1dGVQYWxldHRlQXBpc09ubHkgJiYgdGhpcy5sZXZlbC5jb2RlRnVuY3Rpb25zLFxuICAgICAgZW5hYmxlRXZlbnRzOiB0cnVlLFxuICAgICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgICBvbkV4ZWN1dGlvbkVycm9yOiBfLmJpbmQodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvciwgdGhpcyksXG4gICAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczoge1xuICAgICAgICB3aWR0aDogdGhpcy5wNSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICBkaXNwbGF5V2lkdGg6IHRoaXMucDUsXG4gICAgICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIHdpbmRvd1dpZHRoOiB0aGlzLnA1LFxuICAgICAgICB3aW5kb3dIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgICAgIGZyYW1lQ291bnQ6IHRoaXMucDUsXG4gICAgICAgIGtleUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAga2V5OiB0aGlzLnA1LFxuICAgICAgICBrZXlDb2RlOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWDogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgICAgICB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlQnV0dG9uOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFg6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoZXM6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoSXNEb3duOiB0aGlzLnA1LFxuICAgICAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgICAgIGRldmljZU9yaWVudGF0aW9uOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwQWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgICAgIHBBY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICByb3RhdGlvblg6IHRoaXMucDUsXG4gICAgICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgcm90YXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25aOiB0aGlzLnA1XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRyYXdGdW5jID0gdGhpcy5KU0ludGVycHJldGVyLmZpbmRHbG9iYWxGdW5jdGlvbignZHJhdycpO1xuICAgIHRoaXMuc2V0dXBGdW5jID0gdGhpcy5KU0ludGVycHJldGVyLmZpbmRHbG9iYWxGdW5jdGlvbignc2V0dXAnKTtcbiAgICB0aGlzLm1vdXNlUHJlc3NlZEZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKCdtb3VzZVByZXNzZWQnKTtcblxuICAgIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSBbXG4gICAgICB3aW5kb3cucDUsXG4gICAgICB3aW5kb3cuU3ByaXRlLFxuICAgICAgd2luZG93LkNhbWVyYSxcbiAgICAgIHdpbmRvdy5wNS5WZWN0b3IsXG4gICAgICB3aW5kb3cucDUuQ29sb3IsXG4gICAgICB3aW5kb3cucDUuSW1hZ2UsXG4gICAgICB3aW5kb3cucDUuUmVuZGVyZXIsXG4gICAgICB3aW5kb3cucDUuR3JhcGhpY3MsXG4gICAgICB3aW5kb3cucDUuRm9udCxcbiAgICAgIHdpbmRvdy5wNS5UYWJsZSxcbiAgICAgIHdpbmRvdy5wNS5UYWJsZVJvdyxcbiAgICAgIHdpbmRvdy5wNS5FbGVtZW50XG4gICAgXTtcbiAgICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxNb2RpZmllZE9iamVjdExpc3QgPSBbIHsgaW5zdGFuY2U6IEFycmF5LCBtZXRob2ROYW1lOiAnZHJhdycgfSBdO1xuXG4gICAgLy8gSW5zZXJ0IGV2ZXJ5dGhpbmcgb24gcDUgYW5kIHRoZSBHcm91cCBjb25zdHJ1Y3RvciBmcm9tIHA1cGxheSBpbnRvIHRoZVxuICAgIC8vIGdsb2JhbCBuYW1lc3BhY2Ugb2YgdGhlIGludGVycHJldGVyOlxuICAgIGZvciAodmFyIHByb3AgaW4gdGhpcy5wNSkge1xuICAgICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KHByb3AsIHRoaXMucDVbcHJvcF0sIHRoaXMucDUpO1xuICAgIH1cbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoJ0dyb3VwJywgd2luZG93Lkdyb3VwKTtcbiAgICAvLyBBbmQgYWxzbyBjcmVhdGUgYSAncDUnIG9iamVjdCBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZTpcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoJ3A1JywgeyBWZWN0b3I6IHdpbmRvdy5wNS5WZWN0b3IgfSk7XG5cbiAgICAvKlxuICAgIGlmICh0aGlzLmNoZWNrRm9yRWRpdENvZGVQcmVFeGVjdXRpb25GYWlsdXJlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgICB9XG4gICAgKi9cbiAgfSBlbHNlIHtcbiAgICB0aGlzLmNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gICAgdGhpcy5ldmFsQ29kZSh0aGlzLmNvZGUpO1xuICB9XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnc3RhcnQnLCB7bG9vcCA6IHRydWV9KTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBEaXNhYmxlIHRvb2xib3ggd2hpbGUgcnVubmluZ1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveChmYWxzZSk7XG4gIH1cblxuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKF8uYmluZCh0aGlzLm9uVGljaywgdGhpcyksIDMzKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLm9uVGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy50aWNrQ291bnQrKztcblxuICBpZiAodGhpcy50aWNrQ291bnQgPT09IDEpIHtcbiAgICB0aGlzLmNhbGxIYW5kbGVyKCd3aGVuR2FtZVN0YXJ0cycpO1xuICB9XG5cbiAgdGhpcy5leGVjdXRlUXVldWUoJ3doZW5HYW1lU3RhcnRzJyk7XG5cbiAgdGhpcy5jYWxsSGFuZGxlcigncmVwZWF0Rm9yZXZlcicpO1xuICB0aGlzLmV4ZWN1dGVRdWV1ZSgncmVwZWF0Rm9yZXZlcicpO1xuXG4vKlxuICAvLyBSdW4ga2V5IGV2ZW50IGhhbmRsZXJzIGZvciBhbnkga2V5cyB0aGF0IGFyZSBkb3duOlxuICBmb3IgKHZhciBrZXkgaW4gS2V5Q29kZXMpIHtcbiAgICBpZiAoU3R1ZGlvLmtleVN0YXRlW0tleUNvZGVzW2tleV1dICYmXG4gICAgICAgIFN0dWRpby5rZXlTdGF0ZVtLZXlDb2Rlc1trZXldXSA9PT0gXCJrZXlkb3duXCIpIHtcbiAgICAgIHN3aXRjaCAoS2V5Q29kZXNba2V5XSkge1xuICAgICAgICBjYXNlIEtleUNvZGVzLkxFRlQ6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tbGVmdCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGVzLlVQOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLXVwJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuUklHSFQ6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tcmlnaHQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5ET1dOOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLWRvd24nKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBidG4gaW4gQXJyb3dJZHMpIHtcbiAgICBpZiAoU3R1ZGlvLmJ0blN0YXRlW0Fycm93SWRzW2J0bl1dICYmXG4gICAgICAgIFN0dWRpby5idG5TdGF0ZVtBcnJvd0lkc1tidG5dXSA9PT0gQnV0dG9uU3RhdGUuRE9XTikge1xuICAgICAgc3dpdGNoIChBcnJvd0lkc1tidG5dKSB7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuTEVGVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1sZWZ0Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuVVA6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tdXAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5SSUdIVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1yaWdodCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFycm93SWRzLkRPV046XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tZG93bicpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGdlc3R1cmUgaW4gU3R1ZGlvLmdlc3R1cmVzT2JzZXJ2ZWQpIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmUpIHtcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1sZWZ0Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXAnOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi11cCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tcmlnaHQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tZG93bicpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKDAgPT09IFN0dWRpby5nZXN0dXJlc09ic2VydmVkW2dlc3R1cmVdLS0pIHtcbiAgICAgIGRlbGV0ZSBTdHVkaW8uZ2VzdHVyZXNPYnNlcnZlZFtnZXN0dXJlXTtcbiAgICB9XG4gIH1cblxuICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuLWxlZnQnKTtcbiAgU3R1ZGlvLmV4ZWN1dGVRdWV1ZSgnd2hlbi11cCcpO1xuICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuLXJpZ2h0Jyk7XG4gIFN0dWRpby5leGVjdXRlUXVldWUoJ3doZW4tZG93bicpO1xuKi9cblxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmV4ZWN1dGVJbnRlcnByZXRlcih0aGlzLnRpY2tDb3VudCA9PT0gMSk7XG5cbiAgICBpZiAodGhpcy5KU0ludGVycHJldGVyLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyAmJiB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCkge1xuICAgICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQoKTtcbiAgICB9XG4gIH1cblxuXG4vKlxuICB2YXIgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICBpZiAoIVN0dWRpby5zdWNjZWVkZWRUaW1lICYmIGNoZWNrRmluaXNoZWQoKSkge1xuICAgIFN0dWRpby5zdWNjZWVkZWRUaW1lID0gY3VycmVudFRpbWU7XG4gIH1cblxuICBpZiAoIWFuaW1hdGlvbk9ubHlGcmFtZSkge1xuICAgIFN0dWRpby5leGVjdXRlUXVldWUoJ3doZW5Ub3VjaEdvYWwnKTtcbiAgfVxuXG4gIGlmIChTdHVkaW8uc3VjY2VlZGVkVGltZSAmJlxuICAgICAgIXNwcml0ZXNOZWVkTW9yZUFuaW1hdGlvbkZyYW1lcyAmJlxuICAgICAgKCFsZXZlbC5kZWxheUNvbXBsZXRpb24gfHwgY3VycmVudFRpbWUgPiBTdHVkaW8uc3VjY2VlZGVkVGltZSArIGxldmVsLmRlbGF5Q29tcGxldGlvbikpIHtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG5cbiAgLy8gV2Ugd2FudCB0byBtYWtlIHN1cmUgYW55IHF1ZXVlZCBldmVudCBjb2RlIHJlbGF0ZWQgdG8gYWxsIGdvYWxzIGJlaW5nIHZpc2l0ZWQgaXMgZXhlY3V0ZWRcbiAgLy8gYmVmb3JlIHdlIGV2YWx1YXRlIGNvbmRpdGlvbnMgcmVsYXRlZCB0byB0aGlzIGV2ZW50LiAgRm9yIGV4YW1wbGUsIGlmIHNjb3JlIGlzIGluY3JlbWVudGVkXG4gIC8vIGFzIGEgcmVzdWx0IG9mIGFsbCBnb2FscyBiZWluZyB2aXNpdGVkLCByZWNvcmRpbmcgYWxsR29hbHNWaXNpdGVkIGhlcmUgYWxsb3dzIHRoZSBzY29yZVxuICAvLyB0byBiZSBpbmNyZW1lbnRlZCBiZWZvcmUgd2UgY2hlY2sgZm9yIGEgY29tcGxldGlvbiBjb25kaXRpb24gdGhhdCBsb29rcyBmb3IgYm90aCBhbGxcbiAgLy8gZ29hbHMgdmlzaXRlZCwgYW5kIHRoZSBpbmNyZW1lbnRlZCBzY29yZSwgb24gdGhlIG5leHQgdGljay5cbiAgaWYgKFN0dWRpby5hbGxHb2Fsc1Zpc2l0ZWQoKSkge1xuICAgIFN0dWRpby50cmFja2VkQmVoYXZpb3IuYWxsR29hbHNWaXNpdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIEFuZCB3ZSBkb24ndCB3YW50IGEgdGltZW91dCB0byBiZSB1c2VkIGluIGV2YWx1YXRpbmcgY29uZGl0aW9ucyBiZWZvcmUgdGhlIGFsbCBnb2FscyB2aXNpdGVkXG4gIC8vIGV2ZW50cyBhcmUgcHJvY2Vzc2VkIChhcyBkZXNjcmliZWQgYWJvdmUpLCBzbyBhbHNvIHJlY29yZCB0aGF0IGhlcmUuICBUaGlzIGlzIHBhcnRpY3VsYXJseVxuICAvLyByZWxldmFudCB0byBsZXZlbHMgd2hpY2ggXCJ0aW1lIG91dFwiIGltbWVkaWF0ZWx5IHdoZW4gYWxsIHdoZW5fcnVuIGNvZGUgaXMgY29tcGxldGUuXG4gIGlmIChTdHVkaW8udGltZWRPdXQoKSkge1xuICAgIFN0dWRpby50cmFja2VkQmVoYXZpb3IudGltZWRPdXQgPSB0cnVlO1xuICB9XG4qL1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaGFuZGxlRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyLCBsaW5lTnVtYmVyKSB7XG4vKlxuICBpZiAoIWxpbmVOdW1iZXIgJiYgZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBzeW50YXggZXJyb3JzIGNhbWUgYmVmb3JlIGV4ZWN1dGlvbiAoZHVyaW5nIHBhcnNpbmcpLCBzbyB3ZSBuZWVkXG4gICAgLy8gdG8gZGV0ZXJtaW5lIHRoZSBwcm9wZXIgbGluZSBudW1iZXIgYnkgbG9va2luZyBhdCB0aGUgZXhjZXB0aW9uXG4gICAgbGluZU51bWJlciA9IGVyci5sb2MubGluZTtcbiAgICAvLyBOb3cgc2VsZWN0IHRoaXMgbG9jYXRpb24gaW4gdGhlIGVkaXRvciwgc2luY2Ugd2Uga25vdyB3ZSBkaWRuJ3QgaGl0XG4gICAgLy8gdGhpcyB3aGlsZSBleGVjdXRpbmcgKGluIHdoaWNoIGNhc2UsIGl0IHdvdWxkIGFscmVhZHkgaGF2ZSBiZWVuIHNlbGVjdGVkKVxuXG4gICAgY29kZWdlbi5zZWxlY3RFZGl0b3JSb3dDb2xFcnJvcihzdHVkaW9BcHAuZWRpdG9yLCBsaW5lTnVtYmVyIC0gMSwgZXJyLmxvYy5jb2x1bW4pO1xuICB9XG4gIGlmIChTdHVkaW8uSlNJbnRlcnByZXRlcikge1xuICAgIC8vIFNlbGVjdCBjb2RlIHRoYXQganVzdCBleGVjdXRlZDpcbiAgICBTdHVkaW8uSlNJbnRlcnByZXRlci5zZWxlY3RDdXJyZW50Q29kZShcImFjZV9lcnJvclwiKTtcbiAgICAvLyBHcmFiIGxpbmUgbnVtYmVyIGlmIHdlIGRvbid0IGhhdmUgb25lIGFscmVhZHk6XG4gICAgaWYgKCFsaW5lTnVtYmVyKSB7XG4gICAgICBsaW5lTnVtYmVyID0gMSArIFN0dWRpby5KU0ludGVycHJldGVyLmdldE5lYXJlc3RVc2VyQ29kZUxpbmUoKTtcbiAgICB9XG4gIH1cbiAgb3V0cHV0RXJyb3IoU3RyaW5nKGVyciksIEVycm9yTGV2ZWwuRVJST1IsIGxpbmVOdW1iZXIpO1xuICBTdHVkaW8uZXhlY3V0aW9uRXJyb3IgPSB7IGVycjogZXJyLCBsaW5lTnVtYmVyOiBsaW5lTnVtYmVyIH07XG5cbiAgLy8gQ2FsbCBvblB1enpsZUNvbXBsZXRlKCkgaWYgc3ludGF4IGVycm9yIG9yIGFueSB0aW1lIHdlJ3JlIG5vdCBvbiBhIGZyZWVwbGF5IGxldmVsOlxuICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBNYXJrIHByZUV4ZWN1dGlvbkZhaWx1cmUgYW5kIHRlc3RSZXN1bHRzIGltbWVkaWF0ZWx5IHNvIHRoYXQgYW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlIGFsd2F5cyBhcHBlYXJzLCBldmVuIG9uIGZyZWVwbGF5OlxuICAgIFN0dWRpby5wcmVFeGVjdXRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICBTdHVkaW8udGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5TWU5UQVhfRVJST1JfRkFJTDtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9IGVsc2UgaWYgKCFsZXZlbC5mcmVlUGxheSkge1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiovXG4gIHRocm93IGVycjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQVBJIGNvbW1hbmQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGVDbWQgPSBmdW5jdGlvbiAoaWQsIG5hbWUsIG9wdHMpIHtcbiAgY29uc29sZS5sb2coXCJHYW1lTGFiIGV4ZWN1dGVDbWQgXCIgKyBuYW1lKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YXNrcyB0byBiZSBkb25lIGFmdGVyIHRoZSB1c2VyIHByb2dyYW0gaXMgZmluaXNoZWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIC8vIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSAvKiB8fCBsZXZlbC5pbXByZXNzaXZlICovKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIC8vIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBtc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IG1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IGxldmVsLmZyZWVQbGF5ICYmICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgLy8gc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwiZGl2R2FtZUxhYlwiIHRhYmluZGV4PVwiMVwiPlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB0YiA9IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveDtcbnZhciBibG9ja09mVHlwZSA9IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGU7XG52YXIgY3JlYXRlQ2F0ZWdvcnkgPSBibG9ja1V0aWxzLmNyZWF0ZUNhdGVnb3J5O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIEJhc2UgY29uZmlnIGZvciBsZXZlbHMgY3JlYXRlZCB2aWEgbGV2ZWxidWlsZGVyXG5sZXZlbHMuY3VzdG9tID0ge1xuICBpZGVhbDogSW5maW5pdHksXG4gIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc3RhcnRCbG9ja3M6ICcnXG59O1xuXG5sZXZlbHMuc2FuZGJveCA9ICB7XG4gIGlkZWFsOiBJbmZpbml0eSxcbiAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc29mdEJ1dHRvbnM6IFtcbiAgICAnbGVmdEJ1dHRvbicsXG4gICAgJ3JpZ2h0QnV0dG9uJyxcbiAgICAnZG93bkJ1dHRvbicsXG4gICAgJ3VwQnV0dG9uJ1xuICBdLFxuICBmcmVlUGxheTogdHJ1ZSxcbiAgdG9vbGJveDpcbiAgICB0YihibG9ja09mVHlwZSgnZ2FtZWxhYl9mb28nKSksXG4gIHN0YXJ0QmxvY2tzOlxuICAgJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xufTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLnNhbmRib3gsIHtcbiAgZWRpdENvZGU6IHRydWUsXG4gIGNvZGVGdW5jdGlvbnM6IHtcbiAgICAvLyBHYW1lIExhYlxuICAgIFwiZm9vXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBcIlwiLFxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsyOyAvKiBHYW1lTGFiICovIDsgYnVmLnB1c2goJ1xcblxcbicpOzQ7IGlmIChmaW5pc2hCdXR0b24pIHsgOyBidWYucHVzaCgnXFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDcsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg3LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MTA7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzLmJsb2NrcyA9IFtcbiAge2Z1bmM6ICdmb28nLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICcnIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnJzoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gICdHYW1lIExhYic6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBDb21tYW5kczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEV2ZW50czoge1xuICAgIGNvbG9yOiAnZ3JlZW4nLFxuICAgIGJsb2NrczogW11cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzLmF1dG9jb21wbGV0ZUZ1bmN0aW9uc1dpdGhQYXJlbnMgPSB0cnVlO1xubW9kdWxlLmV4cG9ydHMuc2hvd1BhcmFtRHJvcGRvd25zID0gdHJ1ZTtcbiIsIi8vIGxvY2FsZSBmb3IgZ2FtZWxhYlxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5nYW1lbGFiX2xvY2FsZTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg2LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG4nKTsxOTsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCgyMiwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbicpOzI1OyB9IDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKG51bGwsICdmb28nKTtcbn07XG4iLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoaWQpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKGlkLCAnZm9vJyk7XG59O1xuIl19
