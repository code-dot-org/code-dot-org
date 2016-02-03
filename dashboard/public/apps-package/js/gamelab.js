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

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

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
  this.eventHandlers = {};
  this.Globals = {};
  this.currentCmdQueue = null;
  this.p5 = null;
  this.p5decrementPreload = null;
  this.p5eventNames = ['mouseMoved', 'mouseDragged', 'mousePressed', 'mouseReleased', 'mouseClicked', 'mouseWheel', 'keyPressed', 'keyReleased', 'keyTyped'];
  this.p5specialFunctions = ['draw', 'setup'].concat(this.p5eventNames);

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

// For proxying non-https assets
var MEDIA_PROXY = '//' + location.host + '/media?u=';

// starts with http or https
var ABSOLUTE_REGEXP = new RegExp('^https?://', 'i');

GameLab.baseP5loadImage = null;

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

  // Override p5.loadImage so we can modify the URL path param
  if (!GameLab.baseP5loadImage) {
    GameLab.baseP5loadImage = window.p5.prototype.loadImage;
    window.p5.prototype.loadImage = function (path, successCallback, failureCallback) {
      if (ABSOLUTE_REGEXP.test(path)) {
        // We want to be able to handle the case where our filename contains a
        // space, i.e. "www.example.com/images/foo bar.png", even though this is a
        // technically invalid URL. encodeURIComponent will replace space with %20
        // for us, but as soon as it's decoded, we again have an invalid URL. For
        // this reason we first replace space with %20 ourselves, such that we now
        // have a valid URL, and then call encodeURIComponent on the result.
        path = MEDIA_PROXY + encodeURIComponent(path.replace(/ /g, '%20'));
      }
      return GameLab.baseP5loadImage(path, successCallback, failureCallback);
    };
  }

  config.dropletConfig = dropletConfig;
  config.appMsg = msg;

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

  // Store p5specialFunctions in the unusedConfig array so we don't give warnings
  // about these functions not being called:
  config.unusedConfig = this.p5specialFunctions;

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

  this.eventHandlers = {};
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
      if (this.JSInterpreter && this.eventHandlers.setup) {
        this.eventHandlers.setup.apply(null);
      }
    }, this);
    window.draw = _.bind(function () {
      if (this.JSInterpreter && this.eventHandlers.draw) {
        var startTime = window.performance.now();
        this.eventHandlers.draw.apply(null);
        var timeElapsed = window.performance.now() - startTime;
        $('#bubble').text(timeElapsed.toFixed(2) + ' ms');
      }
    }, this);
    this.p5eventNames.forEach(function (eventName) {
      window[eventName] = _.bind(function () {
        if (this.JSInterpreter && this.eventHandlers[eventName]) {
          this.eventHandlers[eventName].apply(null);
        }
      }, this);
    }, this);
  }, this), 'divGameLab');

  if (this.level.editCode) {
    this.JSInterpreter = new JSInterpreter({
      code: this.studioApp_.getCode(),
      blocks: dropletConfig.blocks,
      blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
      enableEvents: true,
      studioApp: this.studioApp_,
      maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
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

    this.p5specialFunctions.forEach(function (eventName) {
      var func = this.JSInterpreter.findGlobalFunction(eventName);
      if (func) {
        this.eventHandlers[eventName] = codegen.createNativeFunctionFromInterpreterFunction(func);
      }
    }, this);

    codegen.customMarshalObjectList = [window.p5, window.Sprite, window.Camera, window.Animation, window.p5.Vector, window.p5.Color, window.p5.Image, window.p5.Renderer, window.p5.Graphics, window.p5.Font, window.p5.Table, window.p5.TableRow, window.p5.Element];
    // The p5play Group object should be custom marshalled, but its constructor
    // actually creates a standard Array instance with a few additional methods
    // added. The customMarshalModifiedObjectList allows us to set up additional
    // object types to be custom marshalled by matching both the instance type
    // and the presence of additional method name on the object.
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

  this.studioApp_.playAudio('start');

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  this.tickIntervalId = window.setInterval(_.bind(this.onTick, this), 33);
};

GameLab.prototype.onTick = function () {
  this.tickCount++;

  if (this.JSInterpreter) {
    this.JSInterpreter.executeInterpreter(this.tickCount === 1);

    if (this.JSInterpreter.startedHandlingEvents && this.p5decrementPreload) {
      this.p5decrementPreload();
    }
  }
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

// Base config for levels created via levelbuilder
levels.custom = utils.extend(levels.sandbox, {
  editCode: true,
  codeFunctions: {
    // Game Lab
    "loadImage": null,
    "image": null,
    "fill": null,
    "noFill": null,
    "stroke": null,
    "noStroke": null,
    "arc": null,
    "ellipse": null,
    "line": null,
    "point": null,
    "rect": null,
    "triangle": null,
    "text": null,
    "textSize": null,
    "drawSprites": null,
    "allSprites": null,
    "background": null,
    "width": null,
    "height": null,
    "camera": null,
    "camera.on": null,
    "camera.off": null,
    "camera.active": null,
    "camera.mouseX": null,
    "camera.mouseY": null,
    "camera.position.x": null,
    "camera.position.y": null,
    "camera.zoom": null,

    // Sprites
    "createSprite": null,
    "sprite.setSpeed": null,
    "sprite.getAnimationLabel": null,
    "sprite.getDirection": null,
    "sprite.getSpeed": null,
    "sprite.remove": null,
    "sprite.addAnimation": null,
    "sprite.addImage": null,
    "sprite.addSpeed": null,
    "sprite.addToGroup": null,
    "sprite.changeAnimation": null,
    "sprite.changeImage": null,
    "sprite.attractionPoint": null,
    "sprite.limitSpeed": null,
    "sprite.setCollider": null,
    "sprite.setVelocity": null,
    "sprite.height": null,
    "sprite.width": null,
    "sprite.animation": null,
    "sprite.depth": null,
    "sprite.friction": null,
    "sprite.immovable": null,
    "sprite.life": null,
    "sprite.mass": null,
    "sprite.maxSpeed": null,
    "sprite.position": null,
    "sprite.previousPosition": null,
    "sprite.removed": null,
    "sprite.restitution": null,
    "sprite.rotateToDirection": null,
    "sprite.rotation": null,
    "sprite.rotationSpeed": null,
    "sprite.scale": null,
    "sprite.shapeColor": null,
    "sprite.touching": null,
    "sprite.velocity": null,
    "sprite.visible": null,

    // Animations
    "loadAnimation": null,
    "animation": null,
    "anim.changeFrame": null,
    "anim.nextFrame": null,
    "anim.previousFrame": null,
    "anim.clone": null,
    "anim.getFrame": null,
    "anim.getLastFrame": null,
    "anim.goToFrame": null,
    "anim.play": null,
    "anim.rewind": null,
    "anim.stop": null,
    "anim.frameChanged": null,
    "anim.frameDelay": null,
    "anim.images": null,
    "anim.looping": null,
    "anim.playing": null,
    "anim.visible": null,

    // Groups
    "Group": null,
    "group.add": null,
    "group.remove": null,
    "group.clear": null,
    "group.contains": null,
    "group.get": null,
    "group.maxDepth": null,
    "group.minDepth": null,

    // Events
    "keyIsPressed": null,
    "key": null,
    "keyCode": null,
    "keyPressed": null,
    "keyReleased": null,
    "keyTyped": null,
    "keyDown": null,
    "keyWentDown": null,
    "keyWentUp": null,
    "mouseX": null,
    "mouseY": null,
    "pmouseX": null,
    "pmouseY": null,
    "mouseButton": null,
    "mouseIsPressed": null,
    "mouseMoved": null,
    "mouseDragged": null,
    "mousePressed": null,
    "mouseReleased": null,
    "mouseClicked": null,
    "mouseWheel": null,

    // Control
    "forLoop_i_0_4": null,
    "ifBlock": null,
    "ifElseBlock": null,
    "whileBlock": null,

    // Math
    "addOperator": null,
    "subtractOperator": null,
    "multiplyOperator": null,
    "divideOperator": null,
    "equalityOperator": null,
    "inequalityOperator": null,
    "greaterThanOperator": null,
    "greaterThanOrEqualOperator": null,
    "lessThanOperator": null,
    "lessThanOrEqualOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,
    "mathRandom": null,

    // Variables
    "declareAssign_x": null,
    "declareNoAssign_x": null,
    "assign_x": null,
    "declareAssign_str_hello_world": null,
    "substring": null,
    "indexOf": null,
    "includes": null,
    "length": null,
    "toUpperCase": null,
    "toLowerCase": null,
    "declareAssign_list_abd": null,
    "listLength": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
    "return": null
  },
  startBlocks: ['function setup() {', '  ', '}', 'function draw() {', '  ', '}', ''].join('\n')
});

levels.ec_sandbox = utils.extend(levels.custom, {});

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

var COLOR_LIGHT_GREEN = '#D3E965';
var COLOR_BLUE = '#19C3E1';
var COLOR_RED = '#F78183';
var COLOR_CYAN = '#4DD0E1';
var COLOR_YELLOW = '#FFF176';
var COLOR_PINK = '#F57AC6';
var COLOR_PURPLE = '#BB77C7';
var COLOR_GREEN = '#68D995';
var COLOR_WHITE = '#FFFFFF';
var COLOR_BLUE = '#64B5F6';
var COLOR_ORANGE = '#FFB74D';

module.exports.blocks = [
// Game Lab
{ func: 'loadImage', category: 'Game Lab', blockPrefix: 'var img = loadImage', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'] }, { func: 'image', category: 'Game Lab', paletteParams: ['image', 'srcX', 'srcY', 'srcW', 'srcH', 'x', 'y'], params: ["img", "0", "0", "img.width", "img.height", "0", "0"] }, { func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] }, { func: 'noFill', category: 'Game Lab' }, { func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] }, { func: 'noStroke', category: 'Game Lab' }, { func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] }, { func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"] }, { func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"] }, { func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"] }, { func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"] }, { func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"] }, { func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"] }, { func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] }, { func: 'drawSprites', category: 'Game Lab' }, { func: 'allSprites', category: 'Game Lab', block: 'allSprites', type: 'property' }, { func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] }, { func: 'width', category: 'Game Lab', type: 'property' }, { func: 'height', category: 'Game Lab', type: 'property' }, { func: 'camera', category: 'Game Lab', type: 'property' }, { func: 'camera.on', category: 'Game Lab' }, { func: 'camera.off', category: 'Game Lab' }, { func: 'camera.active', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseX', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseY', category: 'Game Lab', type: 'property' }, { func: 'camera.position.x', category: 'Game Lab', type: 'property' }, { func: 'camera.position.y', category: 'Game Lab', type: 'property' }, { func: 'camera.zoom', category: 'Game Lab', type: 'property' },

// Sprites
{ func: 'createSprite', category: 'Sprites', blockPrefix: 'var sprite = createSprite', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'both' }, { func: 'sprite.setSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.setSpeed' }, { func: 'sprite.getAnimationLabel', category: 'Sprites', modeOptionName: '*.getAnimationLabel', type: 'value' }, { func: 'sprite.getDirection', category: 'Sprites', modeOptionName: '*.getDirection', type: 'value' }, { func: 'sprite.getSpeed', category: 'Sprites', modeOptionName: '*.getSpeed', type: 'value' }, { func: 'sprite.remove', category: 'Sprites', modeOptionName: '*.remove' }, { func: 'sprite.addAnimation', category: 'Sprites', paletteParams: ['label', 'animation'], params: ['"anim1"', "anim"], modeOptionName: '*.addAnimation' }, { func: 'sprite.addImage', category: 'Sprites', paletteParams: ['label', 'image'], params: ['"img1"', "img"], modeOptionName: '*.addImage' }, { func: 'sprite.addSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.addSpeed' }, { func: 'sprite.addToGroup', category: 'Sprites', paletteParams: ['group'], params: ["group"], modeOptionName: '*.addToGroup' }, { func: 'sprite.changeAnimation', category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], modeOptionName: '*.changeAnimation' }, { func: 'sprite.changeImage', category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], modeOptionName: '*.changeImage' }, { func: 'sprite.attractionPoint', category: 'Sprites', paletteParams: ['speed', 'x', 'y'], params: ["1", "200", "200"], modeOptionName: '*.attractionPoint' }, { func: 'sprite.limitSpeed', category: 'Sprites', paletteParams: ['max'], params: ["3"], modeOptionName: '*.limitSpeed' }, { func: 'sprite.setCollider', category: 'Sprites', paletteParams: ['type', 'x', 'y', 'w', 'h'], params: ['"rectangle"', "0", "0", "20", "20"], modeOptionName: '*.setCollider' }, { func: 'sprite.setVelocity', category: 'Sprites', paletteParams: ['x', 'y'], params: ["1", "1"], modeOptionName: '*.setVelocity' }, { func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' }, { func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' }, { func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property' }, { func: 'sprite.depth', category: 'Sprites', modeOptionName: '*.depth', type: 'property' }, { func: 'sprite.friction', category: 'Sprites', modeOptionName: '*.friction', type: 'property' }, { func: 'sprite.immovable', category: 'Sprites', modeOptionName: '*.immovable', type: 'property' }, { func: 'sprite.life', category: 'Sprites', modeOptionName: '*.life', type: 'property' }, { func: 'sprite.mass', category: 'Sprites', modeOptionName: '*.mass', type: 'property' }, { func: 'sprite.maxSpeed', category: 'Sprites', modeOptionName: '*.maxSpeed', type: 'property' }, { func: 'sprite.position', category: 'Sprites', modeOptionName: '*.position', type: 'property' }, { func: 'sprite.previousPosition', category: 'Sprites', modeOptionName: '*.previousPosition', type: 'property' }, { func: 'sprite.removed', category: 'Sprites', modeOptionName: '*.removed', type: 'property' }, { func: 'sprite.restitution', category: 'Sprites', modeOptionName: '*.restitution', type: 'property' }, { func: 'sprite.rotateToDirection', category: 'Sprites', modeOptionName: '*.rotateToDirection', type: 'property' }, { func: 'sprite.rotation', category: 'Sprites', modeOptionName: '*.rotation', type: 'property' }, { func: 'sprite.rotationSpeed', category: 'Sprites', modeOptionName: '*.rotationSpeed', type: 'property' }, { func: 'sprite.scale', category: 'Sprites', modeOptionName: '*.scale', type: 'property' }, { func: 'sprite.shapeColor', category: 'Sprites', modeOptionName: '*.shapeColor', type: 'property' }, { func: 'sprite.touching', category: 'Sprites', modeOptionName: '*.touching', type: 'property' }, { func: 'sprite.velocity', category: 'Sprites', modeOptionName: '*.velocity', type: 'property' }, { func: 'sprite.visible', category: 'Sprites', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Sprite properties:
camera
collider - USEFUL? (marshal AABB and CircleCollider)
debug
groups
mouseActive
mouseIsOver
mouseIsPressed
originalHeight
originalWidth
*/

/* TODO: decide whether to expose these Sprite methods:
addImage(labelimg) - 1 param version: (sets label to "normal" automatically)
bounce(targetcallback) - CALLBACK
collide(targetcallback) - CALLBACK
displace(targetcallback) - CALLBACK
draw() - OVERRIDE and/or USEFUL?
mirrorX(dir) - USEFUL?
mirrorY(dir) - USEFUL?
overlap(targetcallback) - CALLBACK
overlapPixel(pointXpointY) - USEFUL?
overlapPoint(pointXpointY) - USEFUL?
update() - USEFUL?
*/

// Animations
{ func: 'loadAnimation', category: 'Animations', blockPrefix: 'var anim = loadAnimation', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'] }, { func: 'animation', category: 'Animations', paletteParams: ['animation', 'x', 'y'], params: ["anim", "50", "50"] }, { func: 'anim.changeFrame', category: 'Animations', paletteParams: ['frame'], params: ["0"], modeOptionName: '*.changeFrame' }, { func: 'anim.nextFrame', category: 'Animations', modeOptionName: '*.nextFrame' }, { func: 'anim.previousFrame', category: 'Animations', modeOptionName: '*.previousFrame' }, { func: 'anim.clone', category: 'Animations', modeOptionName: '*.clone', type: 'value' }, { func: 'anim.getFrame', category: 'Animations', modeOptionName: '*.getFrame', type: 'value' }, { func: 'anim.getLastFrame', category: 'Animations', modeOptionName: '*.getLastFrame', type: 'value' }, { func: 'anim.goToFrame', category: 'Animations', paletteParams: ['frame'], params: ["1"], modeOptionName: '*.goToFrame' }, { func: 'anim.play', category: 'Animations', modeOptionName: '*.play' }, { func: 'anim.rewind', category: 'Animations', modeOptionName: '*.rewind' }, { func: 'anim.stop', category: 'Animations', modeOptionName: '*.stop' }, { func: 'anim.frameChanged', category: 'Animations', modeOptionName: '*.frameChanged', type: 'property' }, { func: 'anim.frameDelay', category: 'Animations', modeOptionName: '*.frameDelay', type: 'property' }, { func: 'anim.images', category: 'Animations', modeOptionName: '*.images', type: 'property' }, { func: 'anim.looping', category: 'Animations', modeOptionName: '*.looping', type: 'property' }, { func: 'anim.playing', category: 'Animations', modeOptionName: '*.playing', type: 'property' }, { func: 'anim.visible', category: 'Animations', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

// Groups
{ func: 'Group', blockPrefix: 'var group = new Group', category: 'Groups', type: 'both' }, { func: 'group.add', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.add' }, { func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.remove' }, { func: 'group.clear', category: 'Groups', modeOptionName: '*.clear' }, { func: 'group.contains', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.contains', type: 'value' }, { func: 'group.get', category: 'Groups', paletteParams: ['i'], params: ["0"], modeOptionName: '*.get', type: 'value' }, { func: 'group.maxDepth', category: 'Groups', modeOptionName: '*.maxDepth', type: 'value' }, { func: 'group.minDepth', category: 'Groups', modeOptionName: '*.minDepth', type: 'value' },

/* TODO: decide whether to expose these Group methods:
bounce(targetcallback) - CALLBACK
displace(targetcallback) - CALLBACK
draw() - USEFUL?
overlap(targetcallback) - CALLBACK
*/

// Events
{ func: 'keyIsPressed', category: 'Events', type: 'property' }, { func: 'key', category: 'Events', type: 'property' }, { func: 'keyCode', category: 'Events', type: 'property' }, { func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Events' }, { func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Events' }, { func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Events' }, { func: 'mouseX', category: 'Events', type: 'property' }, { func: 'mouseY', category: 'Events', type: 'property' }, { func: 'pmouseX', category: 'Events', type: 'property' }, { func: 'pmouseY', category: 'Events', type: 'property' }, { func: 'mouseButton', category: 'Events', type: 'property' }, { func: 'mouseIsPressed', category: 'Events', type: 'property' }, { func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Events' }, { func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Events' }, { func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Events' }, { func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Events' }, { func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Events' }, { func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Events' },

// Advanced
{ func: 'foo', parent: api, category: 'Advanced' }];

module.exports.categories = {
  'Game Lab': {
    color: 'yellow',
    rgb: COLOR_YELLOW,
    blocks: []
  },
  Sprites: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Animations: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Groups: {
    color: 'red',
    rgb: COLOR_RED,
    blocks: []
  },
  Data: {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
  Drawing: {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  Events: {
    color: 'green',
    rgb: COLOR_GREEN,
    blocks: []
  },
  Advanced: {
    color: 'blue',
    rgb: COLOR_BLUE,
    blocks: []
  }
};

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVks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QUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQ3ZJLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ2hILEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDeEYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3pJLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekgsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDcEYsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFDNUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2xGLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDeEQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6RCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3pELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFB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RyxVQUFVLEVBQUUsRUFBRTtBQUMxQixTQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMvQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuZ2FtZWxhYk1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBnYW1lbGFiID0gbmV3IEdhbWVMYWIoKTtcblxuICBnYW1lbGFiLmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGdhbWVsYWIsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwidmFyIHNraW5CYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5CYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIENETyBBcHA6IEdhbWVMYWJcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5nYW1lbGFiX2ZvbyA9IHtcbiAgICAvLyBCbG9jayBmb3IgZm9vLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5mb28oKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mb29Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZ2FtZWxhYl9mb28gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZm9vLlxuICAgIHJldHVybiAnR2FtZUxhYi5mb28oKTtcXG4nO1xuICB9O1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGlKYXZhc2NyaXB0ID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0Jyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG52YXIgSlNJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4uL0pTSW50ZXJwcmV0ZXInKTtcblxudmFyIE1BWF9JTlRFUlBSRVRFUl9TVEVQU19QRVJfVElDSyA9IDUwMDAwMDtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYiBjbGFzc1xuICovXG52YXIgR2FtZUxhYiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IG51bGw7XG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB0aGlzLnA1ZXZlbnROYW1lcyA9IFtcbiAgICAnbW91c2VNb3ZlZCcsICdtb3VzZURyYWdnZWQnLCAnbW91c2VQcmVzc2VkJywgJ21vdXNlUmVsZWFzZWQnLFxuICAgICdtb3VzZUNsaWNrZWQnLCAnbW91c2VXaGVlbCcsXG4gICAgJ2tleVByZXNzZWQnLCAna2V5UmVsZWFzZWQnLCAna2V5VHlwZWQnXG4gIF07XG4gIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zID0gWydkcmF3JywgJ3NldHVwJ10uY29uY2F0KHRoaXMucDVldmVudE5hbWVzKTtcblxuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxhYjtcblxuLyoqXG4gKiBJbmplY3QgdGhlIHN0dWRpb0FwcCBzaW5nbGV0b24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbi8vIEZvciBwcm94eWluZyBub24taHR0cHMgYXNzZXRzXG52YXIgTUVESUFfUFJPWFkgPSAnLy8nICsgbG9jYXRpb24uaG9zdCArICcvbWVkaWE/dT0nO1xuXG4vLyBzdGFydHMgd2l0aCBodHRwIG9yIGh0dHBzXG52YXIgQUJTT0xVVEVfUkVHRVhQID0gbmV3IFJlZ0V4cCgnXmh0dHBzPzovLycsICdpJyk7XG5cbkdhbWVMYWIuYmFzZVA1bG9hZEltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoaXMgR2FtZUxhYiBpbnN0YW5jZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZUxhYiByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuc2V0dXBHbG9iYWxNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmb3Igbm8tc2tldGNoIEdsb2JhbCBtb2RlXG4gICAgICovXG4gICAgdmFyIHA1ID0gd2luZG93LnA1O1xuXG4gICAgdGhpcy5faXNHbG9iYWwgPSB0cnVlO1xuICAgIC8vIExvb3AgdGhyb3VnaCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYW5kIGF0dGFjaCB0aGVtIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwIGluIHA1LnByb3RvdHlwZSkge1xuICAgICAgaWYodHlwZW9mIHA1LnByb3RvdHlwZVtwXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZXYgPSBwLnN1YnN0cmluZygyKTtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudHMuaGFzT3duUHJvcGVydHkoZXYpKSB7XG4gICAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXR0YWNoIGl0cyBwcm9wZXJ0aWVzIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwMiBpbiB0aGlzKSB7XG4gICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShwMikpIHtcbiAgICAgICAgd2luZG93W3AyXSA9IHRoaXNbcDJdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBPdmVycmlkZSBwNS5sb2FkSW1hZ2Ugc28gd2UgY2FuIG1vZGlmeSB0aGUgVVJMIHBhdGggcGFyYW1cbiAgaWYgKCFHYW1lTGFiLmJhc2VQNWxvYWRJbWFnZSkge1xuICAgIEdhbWVMYWIuYmFzZVA1bG9hZEltYWdlID0gd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2U7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbiAocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIGlmIChBQlNPTFVURV9SRUdFWFAudGVzdChwYXRoKSkge1xuICAgICAgICAvLyBXZSB3YW50IHRvIGJlIGFibGUgdG8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIG91ciBmaWxlbmFtZSBjb250YWlucyBhXG4gICAgICAgIC8vIHNwYWNlLCBpLmUuIFwid3d3LmV4YW1wbGUuY29tL2ltYWdlcy9mb28gYmFyLnBuZ1wiLCBldmVuIHRob3VnaCB0aGlzIGlzIGFcbiAgICAgICAgLy8gdGVjaG5pY2FsbHkgaW52YWxpZCBVUkwuIGVuY29kZVVSSUNvbXBvbmVudCB3aWxsIHJlcGxhY2Ugc3BhY2Ugd2l0aCAlMjBcbiAgICAgICAgLy8gZm9yIHVzLCBidXQgYXMgc29vbiBhcyBpdCdzIGRlY29kZWQsIHdlIGFnYWluIGhhdmUgYW4gaW52YWxpZCBVUkwuIEZvclxuICAgICAgICAvLyB0aGlzIHJlYXNvbiB3ZSBmaXJzdCByZXBsYWNlIHNwYWNlIHdpdGggJTIwIG91cnNlbHZlcywgc3VjaCB0aGF0IHdlIG5vd1xuICAgICAgICAvLyBoYXZlIGEgdmFsaWQgVVJMLCBhbmQgdGhlbiBjYWxsIGVuY29kZVVSSUNvbXBvbmVudCBvbiB0aGUgcmVzdWx0LlxuICAgICAgICBwYXRoID0gTUVESUFfUFJPWFkgKyBlbmNvZGVVUklDb21wb25lbnQocGF0aC5yZXBsYWNlKC8gL2csICclMjAnKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gR2FtZUxhYi5iYXNlUDVsb2FkSW1hZ2UocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH07XG4gIH1cblxuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG4gIGNvbmZpZy5hcHBNc2cgPSBtc2c7XG5cbiAgdmFyIHNob3dGaW5pc2hCdXR0b24gPSAhdGhpcy5sZXZlbC5pc1Byb2plY3RMZXZlbDtcbiAgdmFyIGZpbmlzaEJ1dHRvbkZpcnN0TGluZSA9IF8uaXNFbXB0eSh0aGlzLmxldmVsLnNvZnRCdXR0b25zKTtcbiAgdmFyIGZpcnN0Q29udHJvbHNSb3cgPSByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZmluaXNoQnV0dG9uOiBmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcbiAgdmFyIGV4dHJhQ29udHJvbFJvd3MgPSByZXF1aXJlKCcuL2V4dHJhQ29udHJvbFJvd3MuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246ICFmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IGZpcnN0Q29udHJvbHNSb3csXG4gICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBfLmJpbmQodGhpcy5sb2FkQXVkaW9fLCB0aGlzKTtcbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gXy5iaW5kKHRoaXMuYWZ0ZXJJbmplY3RfLCB0aGlzLCBjb25maWcpO1xuXG4gIC8vIFN0b3JlIHA1c3BlY2lhbEZ1bmN0aW9ucyBpbiB0aGUgdW51c2VkQ29uZmlnIGFycmF5IHNvIHdlIGRvbid0IGdpdmUgd2FybmluZ3NcbiAgLy8gYWJvdXQgdGhlc2UgZnVuY3Rpb25zIG5vdCBiZWluZyBjYWxsZWQ6XG4gIGNvbmZpZy51bnVzZWRDb25maWcgPSB0aGlzLnA1c3BlY2lhbEZ1bmN0aW9ucztcblxuICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUubG9hZEF1ZGlvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4ud2luU291bmQsICd3aW4nKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbn07XG5cbi8qKlxuICogQ29kZSBjYWxsZWQgYWZ0ZXIgdGhlIGJsb2NrbHkgZGl2ICsgYmxvY2tseSBjb3JlIGlzIGluamVjdGVkIGludG8gdGhlIGRvY3VtZW50XG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmFmdGVySW5qZWN0XyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdHYW1lTGFiLGNvZGUnKTtcbiAgfVxuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgZGl2R2FtZUxhYi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG4gIGRpdkdhbWVMYWIuc3R5bGUuaGVpZ2h0ID0gJzQwMHB4JztcblxufTtcblxuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGlja0ludGVydmFsSWQpO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgd2hpbGUgKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCkge1xuICAgIGRpdkdhbWVMYWIucmVtb3ZlQ2hpbGQoZGl2R2FtZUxhYi5maXJzdENoaWxkKTtcbiAgfVxuICAqL1xuXG4gIGlmICh0aGlzLnA1KSB7XG4gICAgdGhpcy5wNS5yZW1vdmUoKTtcbiAgICB0aGlzLnA1ID0gbnVsbDtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG5cbiAgICAvLyBDbGVhciByZWdpc3RlcmVkIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZTpcbiAgICBmb3IgKHZhciBtZW1iZXIgaW4gd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMpIHtcbiAgICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kc1ttZW1iZXJdO1xuICAgIH1cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcyA9IHsgcHJlOiBbXSwgcG9zdDogW10sIHJlbW92ZTogW10gfTtcbiAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZFByZWxvYWRNZXRob2RzLmdhbWVsYWJQcmVsb2FkO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5hbGxTcHJpdGVzID0gbmV3IHdpbmRvdy5Hcm91cCgpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuc3ByaXRlVXBkYXRlID0gdHJ1ZTtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhID0gbmV3IHdpbmRvdy5DYW1lcmEoMCwgMCwgMSk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEuaW5pdCA9IGZhbHNlO1xuXG4gICAgLy9rZXlib2FyZCBpbnB1dFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUucmVhZFByZXNzZXMpO1xuXG4gICAgLy9hdXRvbWF0aWMgc3ByaXRlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUudXBkYXRlU3ByaXRlcyk7XG5cbiAgICAvL3F1YWR0cmVlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cudXBkYXRlVHJlZSk7XG5cbiAgICAvL2NhbWVyYSBwdXNoIGFuZCBwb3BcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cuY2FtZXJhUHVzaCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy5jYW1lcmFQb3ApO1xuXG4gIH1cblxuICB3aW5kb3cucDUucHJvdG90eXBlLmdhbWVsYWJQcmVsb2FkID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IHdpbmRvdy5wNS5fZ2V0RGVjcmVtZW50UHJlbG9hZChhcmd1bWVudHMsIHRoaXMucDUpO1xuICB9LCB0aGlzKTtcblxuICAvLyBEaXNjYXJkIHRoZSBpbnRlcnByZXRlci5cbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5kZWluaXRpYWxpemUoKTtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBudWxsO1xuICB9XG4gIHRoaXMuZXhlY3V0aW9uRXJyb3IgPSBudWxsO1xufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgfVxuICB0aGlzLnN0dWRpb0FwcF8uYXR0ZW1wdHMrKztcbiAgdGhpcy5leGVjdXRlKCk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5ldmFsQ29kZSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIEdhbWVMYWI6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIFJlc2V0IGFsbCBzdGF0ZS5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpICYmXG4gICAgICAodGhpcy5zdHVkaW9BcHBfLmhhc0V4dHJhVG9wQmxvY2tzKCkgfHxcbiAgICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIsIHdoaWNoIHdpbGwgZmFpbCBhbmQgcmVwb3J0IHRvcCBsZXZlbCBibG9ja3NcbiAgICB0aGlzLmNoZWNrQW5zd2VyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbmV3IHdpbmRvdy5wNShfLmJpbmQoZnVuY3Rpb24gKHA1b2JqKSB7XG4gICAgICB0aGlzLnA1ID0gcDVvYmo7XG5cbiAgICAgIHA1b2JqLnJlZ2lzdGVyUHJlbG9hZE1ldGhvZCgnZ2FtZWxhYlByZWxvYWQnLCB3aW5kb3cucDUucHJvdG90eXBlKTtcblxuICAgICAgcDVvYmouc2V0dXBHbG9iYWxNb2RlKCk7XG5cbiAgICAgIHdpbmRvdy5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDYWxsIG91ciBnYW1lbGFiUHJlbG9hZCgpIHRvIGZvcmNlIF9zdGFydC9fc2V0dXAgdG8gd2FpdC5cbiAgICAgICAgd2luZG93LmdhbWVsYWJQcmVsb2FkKCk7XG4gICAgICB9O1xuICAgICAgd2luZG93LnNldHVwID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcDVvYmouY3JlYXRlQ2FudmFzKDQwMCwgNDAwKTtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0dXApIHtcbiAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0dXAuYXBwbHkobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgICAgd2luZG93LmRyYXcgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVycy5kcmF3KSB7XG4gICAgICAgICAgdmFyIHN0YXJ0VGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdy5hcHBseShudWxsKTtcbiAgICAgICAgICB2YXIgdGltZUVsYXBzZWQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgJCgnI2J1YmJsZScpLnRleHQodGltZUVsYXBzZWQudG9GaXhlZCgyKSArICcgbXMnKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgICB0aGlzLnA1ZXZlbnROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgICAgd2luZG93W2V2ZW50TmFtZV0gPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdLmFwcGx5KG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LCB0aGlzKSwgJ2RpdkdhbWVMYWInKTtcblxuICBpZiAodGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG5ldyBKU0ludGVycHJldGVyKHtcbiAgICAgIGNvZGU6IHRoaXMuc3R1ZGlvQXBwXy5nZXRDb2RlKCksXG4gICAgICBibG9ja3M6IGRyb3BsZXRDb25maWcuYmxvY2tzLFxuICAgICAgYmxvY2tGaWx0ZXI6IHRoaXMubGV2ZWwuZXhlY3V0ZVBhbGV0dGVBcGlzT25seSAmJiB0aGlzLmxldmVsLmNvZGVGdW5jdGlvbnMsXG4gICAgICBlbmFibGVFdmVudHM6IHRydWUsXG4gICAgICBzdHVkaW9BcHA6IHRoaXMuc3R1ZGlvQXBwXyxcbiAgICAgIG1heEludGVycHJldGVyU3RlcHNQZXJUaWNrOiBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0ssXG4gICAgICBvbkV4ZWN1dGlvbkVycm9yOiBfLmJpbmQodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvciwgdGhpcyksXG4gICAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczoge1xuICAgICAgICB3aWR0aDogdGhpcy5wNSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICBkaXNwbGF5V2lkdGg6IHRoaXMucDUsXG4gICAgICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIHdpbmRvd1dpZHRoOiB0aGlzLnA1LFxuICAgICAgICB3aW5kb3dIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgICAgIGZyYW1lQ291bnQ6IHRoaXMucDUsXG4gICAgICAgIGtleUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAga2V5OiB0aGlzLnA1LFxuICAgICAgICBrZXlDb2RlOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWDogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgICAgICB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlQnV0dG9uOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFg6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoZXM6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoSXNEb3duOiB0aGlzLnA1LFxuICAgICAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgICAgIGRldmljZU9yaWVudGF0aW9uOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwQWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgICAgIHBBY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICByb3RhdGlvblg6IHRoaXMucDUsXG4gICAgICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgcm90YXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25aOiB0aGlzLnA1XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKGV2ZW50TmFtZSk7XG4gICAgICBpZiAoZnVuYykge1xuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSA9XG4gICAgICAgICAgICBjb2RlZ2VuLmNyZWF0ZU5hdGl2ZUZ1bmN0aW9uRnJvbUludGVycHJldGVyRnVuY3Rpb24oZnVuYyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gW1xuICAgICAgd2luZG93LnA1LFxuICAgICAgd2luZG93LlNwcml0ZSxcbiAgICAgIHdpbmRvdy5DYW1lcmEsXG4gICAgICB3aW5kb3cuQW5pbWF0aW9uLFxuICAgICAgd2luZG93LnA1LlZlY3RvcixcbiAgICAgIHdpbmRvdy5wNS5Db2xvcixcbiAgICAgIHdpbmRvdy5wNS5JbWFnZSxcbiAgICAgIHdpbmRvdy5wNS5SZW5kZXJlcixcbiAgICAgIHdpbmRvdy5wNS5HcmFwaGljcyxcbiAgICAgIHdpbmRvdy5wNS5Gb250LFxuICAgICAgd2luZG93LnA1LlRhYmxlLFxuICAgICAgd2luZG93LnA1LlRhYmxlUm93LFxuICAgICAgd2luZG93LnA1LkVsZW1lbnRcbiAgICBdO1xuICAgIC8vIFRoZSBwNXBsYXkgR3JvdXAgb2JqZWN0IHNob3VsZCBiZSBjdXN0b20gbWFyc2hhbGxlZCwgYnV0IGl0cyBjb25zdHJ1Y3RvclxuICAgIC8vIGFjdHVhbGx5IGNyZWF0ZXMgYSBzdGFuZGFyZCBBcnJheSBpbnN0YW5jZSB3aXRoIGEgZmV3IGFkZGl0aW9uYWwgbWV0aG9kc1xuICAgIC8vIGFkZGVkLiBUaGUgY3VzdG9tTWFyc2hhbE1vZGlmaWVkT2JqZWN0TGlzdCBhbGxvd3MgdXMgdG8gc2V0IHVwIGFkZGl0aW9uYWxcbiAgICAvLyBvYmplY3QgdHlwZXMgdG8gYmUgY3VzdG9tIG1hcnNoYWxsZWQgYnkgbWF0Y2hpbmcgYm90aCB0aGUgaW5zdGFuY2UgdHlwZVxuICAgIC8vIGFuZCB0aGUgcHJlc2VuY2Ugb2YgYWRkaXRpb25hbCBtZXRob2QgbmFtZSBvbiB0aGUgb2JqZWN0LlxuICAgIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE1vZGlmaWVkT2JqZWN0TGlzdCA9IFsgeyBpbnN0YW5jZTogQXJyYXksIG1ldGhvZE5hbWU6ICdkcmF3JyB9IF07XG5cbiAgICAvLyBJbnNlcnQgZXZlcnl0aGluZyBvbiBwNSBhbmQgdGhlIEdyb3VwIGNvbnN0cnVjdG9yIGZyb20gcDVwbGF5IGludG8gdGhlXG4gICAgLy8gZ2xvYmFsIG5hbWVzcGFjZSBvZiB0aGUgaW50ZXJwcmV0ZXI6XG4gICAgZm9yICh2YXIgcHJvcCBpbiB0aGlzLnA1KSB7XG4gICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkocHJvcCwgdGhpcy5wNVtwcm9wXSwgdGhpcy5wNSk7XG4gICAgfVxuICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eSgnR3JvdXAnLCB3aW5kb3cuR3JvdXApO1xuICAgIC8vIEFuZCBhbHNvIGNyZWF0ZSBhICdwNScgb2JqZWN0IGluIHRoZSBnbG9iYWwgbmFtZXNwYWNlOlxuICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eSgncDUnLCB7IFZlY3Rvcjogd2luZG93LnA1LlZlY3RvciB9KTtcblxuICAgIC8qXG4gICAgaWYgKHRoaXMuY2hlY2tGb3JFZGl0Q29kZVByZUV4ZWN1dGlvbkZhaWx1cmUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMub25QdXp6bGVDb21wbGV0ZSgpO1xuICAgIH1cbiAgICAqL1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIHRoaXMudGlja0ludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoXy5iaW5kKHRoaXMub25UaWNrLCB0aGlzKSwgMzMpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpY2tDb3VudCsrO1xuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKHRoaXMudGlja0NvdW50ID09PSAxKTtcblxuICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIuc3RhcnRlZEhhbmRsaW5nRXZlbnRzICYmIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKSB7XG4gICAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCgpO1xuICAgIH1cbiAgfVxufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaGFuZGxlRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyLCBsaW5lTnVtYmVyKSB7XG4vKlxuICBpZiAoIWxpbmVOdW1iZXIgJiYgZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBzeW50YXggZXJyb3JzIGNhbWUgYmVmb3JlIGV4ZWN1dGlvbiAoZHVyaW5nIHBhcnNpbmcpLCBzbyB3ZSBuZWVkXG4gICAgLy8gdG8gZGV0ZXJtaW5lIHRoZSBwcm9wZXIgbGluZSBudW1iZXIgYnkgbG9va2luZyBhdCB0aGUgZXhjZXB0aW9uXG4gICAgbGluZU51bWJlciA9IGVyci5sb2MubGluZTtcbiAgICAvLyBOb3cgc2VsZWN0IHRoaXMgbG9jYXRpb24gaW4gdGhlIGVkaXRvciwgc2luY2Ugd2Uga25vdyB3ZSBkaWRuJ3QgaGl0XG4gICAgLy8gdGhpcyB3aGlsZSBleGVjdXRpbmcgKGluIHdoaWNoIGNhc2UsIGl0IHdvdWxkIGFscmVhZHkgaGF2ZSBiZWVuIHNlbGVjdGVkKVxuXG4gICAgY29kZWdlbi5zZWxlY3RFZGl0b3JSb3dDb2xFcnJvcihzdHVkaW9BcHAuZWRpdG9yLCBsaW5lTnVtYmVyIC0gMSwgZXJyLmxvYy5jb2x1bW4pO1xuICB9XG4gIGlmIChTdHVkaW8uSlNJbnRlcnByZXRlcikge1xuICAgIC8vIFNlbGVjdCBjb2RlIHRoYXQganVzdCBleGVjdXRlZDpcbiAgICBTdHVkaW8uSlNJbnRlcnByZXRlci5zZWxlY3RDdXJyZW50Q29kZShcImFjZV9lcnJvclwiKTtcbiAgICAvLyBHcmFiIGxpbmUgbnVtYmVyIGlmIHdlIGRvbid0IGhhdmUgb25lIGFscmVhZHk6XG4gICAgaWYgKCFsaW5lTnVtYmVyKSB7XG4gICAgICBsaW5lTnVtYmVyID0gMSArIFN0dWRpby5KU0ludGVycHJldGVyLmdldE5lYXJlc3RVc2VyQ29kZUxpbmUoKTtcbiAgICB9XG4gIH1cbiAgb3V0cHV0RXJyb3IoU3RyaW5nKGVyciksIEVycm9yTGV2ZWwuRVJST1IsIGxpbmVOdW1iZXIpO1xuICBTdHVkaW8uZXhlY3V0aW9uRXJyb3IgPSB7IGVycjogZXJyLCBsaW5lTnVtYmVyOiBsaW5lTnVtYmVyIH07XG5cbiAgLy8gQ2FsbCBvblB1enpsZUNvbXBsZXRlKCkgaWYgc3ludGF4IGVycm9yIG9yIGFueSB0aW1lIHdlJ3JlIG5vdCBvbiBhIGZyZWVwbGF5IGxldmVsOlxuICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBNYXJrIHByZUV4ZWN1dGlvbkZhaWx1cmUgYW5kIHRlc3RSZXN1bHRzIGltbWVkaWF0ZWx5IHNvIHRoYXQgYW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlIGFsd2F5cyBhcHBlYXJzLCBldmVuIG9uIGZyZWVwbGF5OlxuICAgIFN0dWRpby5wcmVFeGVjdXRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICBTdHVkaW8udGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5TWU5UQVhfRVJST1JfRkFJTDtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9IGVsc2UgaWYgKCFsZXZlbC5mcmVlUGxheSkge1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiovXG4gIHRocm93IGVycjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQVBJIGNvbW1hbmQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGVDbWQgPSBmdW5jdGlvbiAoaWQsIG5hbWUsIG9wdHMpIHtcbiAgY29uc29sZS5sb2coXCJHYW1lTGFiIGV4ZWN1dGVDbWQgXCIgKyBuYW1lKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YXNrcyB0byBiZSBkb25lIGFmdGVyIHRoZSB1c2VyIHByb2dyYW0gaXMgZmluaXNoZWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIC8vIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSAvKiB8fCBsZXZlbC5pbXByZXNzaXZlICovKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIC8vIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBtc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IG1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IGxldmVsLmZyZWVQbGF5ICYmICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgLy8gc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwiZGl2R2FtZUxhYlwiIHRhYmluZGV4PVwiMVwiPlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB0YiA9IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveDtcbnZhciBibG9ja09mVHlwZSA9IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGU7XG52YXIgY3JlYXRlQ2F0ZWdvcnkgPSBibG9ja1V0aWxzLmNyZWF0ZUNhdGVnb3J5O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxldmVscy5zYW5kYm94ID0gIHtcbiAgaWRlYWw6IEluZmluaXR5LFxuICByZXF1aXJlZEJsb2NrczogW1xuICBdLFxuICBzY2FsZToge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICBzb2Z0QnV0dG9uczogW1xuICAgICdsZWZ0QnV0dG9uJyxcbiAgICAncmlnaHRCdXR0b24nLFxuICAgICdkb3duQnV0dG9uJyxcbiAgICAndXBCdXR0b24nXG4gIF0sXG4gIGZyZWVQbGF5OiB0cnVlLFxuICB0b29sYm94OlxuICAgIHRiKGJsb2NrT2ZUeXBlKCdnYW1lbGFiX2ZvbycpKSxcbiAgc3RhcnRCbG9ja3M6XG4gICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nXG59O1xuXG4vLyBCYXNlIGNvbmZpZyBmb3IgbGV2ZWxzIGNyZWF0ZWQgdmlhIGxldmVsYnVpbGRlclxubGV2ZWxzLmN1c3RvbSA9IHV0aWxzLmV4dGVuZChsZXZlbHMuc2FuZGJveCwge1xuICBlZGl0Q29kZTogdHJ1ZSxcbiAgY29kZUZ1bmN0aW9uczoge1xuICAgIC8vIEdhbWUgTGFiXG4gICAgXCJsb2FkSW1hZ2VcIjogbnVsbCxcbiAgICBcImltYWdlXCI6IG51bGwsXG4gICAgXCJmaWxsXCI6IG51bGwsXG4gICAgXCJub0ZpbGxcIjogbnVsbCxcbiAgICBcInN0cm9rZVwiOiBudWxsLFxuICAgIFwibm9TdHJva2VcIjogbnVsbCxcbiAgICBcImFyY1wiOiBudWxsLFxuICAgIFwiZWxsaXBzZVwiOiBudWxsLFxuICAgIFwibGluZVwiOiBudWxsLFxuICAgIFwicG9pbnRcIjogbnVsbCxcbiAgICBcInJlY3RcIjogbnVsbCxcbiAgICBcInRyaWFuZ2xlXCI6IG51bGwsXG4gICAgXCJ0ZXh0XCI6IG51bGwsXG4gICAgXCJ0ZXh0U2l6ZVwiOiBudWxsLFxuICAgIFwiZHJhd1Nwcml0ZXNcIjogbnVsbCxcbiAgICBcImFsbFNwcml0ZXNcIjogbnVsbCxcbiAgICBcImJhY2tncm91bmRcIjogbnVsbCxcbiAgICBcIndpZHRoXCI6IG51bGwsXG4gICAgXCJoZWlnaHRcIjogbnVsbCxcbiAgICBcImNhbWVyYVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm9uXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub2ZmXCI6IG51bGwsXG4gICAgXCJjYW1lcmEuYWN0aXZlXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VYXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VZXCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnBvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcImNhbWVyYS56b29tXCI6IG51bGwsXG5cbiAgICAvLyBTcHJpdGVzXG4gICAgXCJjcmVhdGVTcHJpdGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0RGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZW1vdmVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRBbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRJbWFnZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkVG9Hcm91cFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUltYWdlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYXR0cmFjdGlvblBvaW50XCI6IG51bGwsXG4gICAgXCJzcHJpdGUubGltaXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldENvbGxpZGVyXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0VmVsb2NpdHlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5oZWlnaHRcIjogbnVsbCxcbiAgICBcInNwcml0ZS53aWR0aFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmRlcHRoXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZnJpY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5pbW1vdmFibGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5saWZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubWFzc1wiOiBudWxsLFxuICAgIFwic3ByaXRlLm1heFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucG9zaXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVtb3ZlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJlc3RpdHV0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRlVG9EaXJlY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0aW9uU3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zY2FsZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNoYXBlQ29sb3JcIjogbnVsbCxcbiAgICBcInNwcml0ZS50b3VjaGluZ1wiOiBudWxsLFxuICAgIFwic3ByaXRlLnZlbG9jaXR5XCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmlzaWJsZVwiOiBudWxsLFxuXG4gICAgLy8gQW5pbWF0aW9uc1xuICAgIFwibG9hZEFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiYW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhbmltLmNoYW5nZUZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLm5leHRGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5wcmV2aW91c0ZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmNsb25lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldEZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldExhc3RGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nb1RvRnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ucGxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5yZXdpbmRcIjogbnVsbCxcbiAgICBcImFuaW0uc3RvcFwiOiBudWxsLFxuICAgIFwiYW5pbS5mcmFtZUNoYW5nZWRcIjogbnVsbCxcbiAgICBcImFuaW0uZnJhbWVEZWxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5pbWFnZXNcIjogbnVsbCxcbiAgICBcImFuaW0ubG9vcGluZ1wiOiBudWxsLFxuICAgIFwiYW5pbS5wbGF5aW5nXCI6IG51bGwsXG4gICAgXCJhbmltLnZpc2libGVcIjogbnVsbCxcblxuICAgIC8vIEdyb3Vwc1xuICAgIFwiR3JvdXBcIjogbnVsbCxcbiAgICBcImdyb3VwLmFkZFwiOiBudWxsLFxuICAgIFwiZ3JvdXAucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJncm91cC5jbGVhclwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY29udGFpbnNcIjogbnVsbCxcbiAgICBcImdyb3VwLmdldFwiOiBudWxsLFxuICAgIFwiZ3JvdXAubWF4RGVwdGhcIjogbnVsbCxcbiAgICBcImdyb3VwLm1pbkRlcHRoXCI6IG51bGwsXG5cbiAgICAvLyBFdmVudHNcbiAgICBcImtleUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5XCI6IG51bGwsXG4gICAgXCJrZXlDb2RlXCI6IG51bGwsXG4gICAgXCJrZXlQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwia2V5VHlwZWRcIjogbnVsbCxcbiAgICBcImtleURvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnREb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50VXBcIjogbnVsbCxcbiAgICBcIm1vdXNlWFwiOiBudWxsLFxuICAgIFwibW91c2VZXCI6IG51bGwsXG4gICAgXCJwbW91c2VYXCI6IG51bGwsXG4gICAgXCJwbW91c2VZXCI6IG51bGwsXG4gICAgXCJtb3VzZUJ1dHRvblwiOiBudWxsLFxuICAgIFwibW91c2VJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlTW92ZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlRHJhZ2dlZFwiOiBudWxsLFxuICAgIFwibW91c2VQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZUNsaWNrZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlV2hlZWxcIjogbnVsbCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBcImZvckxvb3BfaV8wXzRcIjogbnVsbCxcbiAgICBcImlmQmxvY2tcIjogbnVsbCxcbiAgICBcImlmRWxzZUJsb2NrXCI6IG51bGwsXG4gICAgXCJ3aGlsZUJsb2NrXCI6IG51bGwsXG5cbiAgICAvLyBNYXRoXG4gICAgXCJhZGRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwic3VidHJhY3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibXVsdGlwbHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZGl2aWRlT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImluZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJhbmRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwib3JPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibm90T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInJhbmRvbU51bWJlcl9taW5fbWF4XCI6IG51bGwsXG4gICAgXCJtYXRoUm91bmRcIjogbnVsbCxcbiAgICBcIm1hdGhBYnNcIjogbnVsbCxcbiAgICBcIm1hdGhNYXhcIjogbnVsbCxcbiAgICBcIm1hdGhNaW5cIjogbnVsbCxcbiAgICBcIm1hdGhSYW5kb21cIjogbnVsbCxcblxuICAgIC8vIFZhcmlhYmxlc1xuICAgIFwiZGVjbGFyZUFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlTm9Bc3NpZ25feFwiOiBudWxsLFxuICAgIFwiYXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fc3RyX2hlbGxvX3dvcmxkXCI6IG51bGwsXG4gICAgXCJzdWJzdHJpbmdcIjogbnVsbCxcbiAgICBcImluZGV4T2ZcIjogbnVsbCxcbiAgICBcImluY2x1ZGVzXCI6IG51bGwsXG4gICAgXCJsZW5ndGhcIjogbnVsbCxcbiAgICBcInRvVXBwZXJDYXNlXCI6IG51bGwsXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9saXN0X2FiZFwiOiBudWxsLFxuICAgIFwibGlzdExlbmd0aFwiOiBudWxsLFxuXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgXCJmdW5jdGlvblBhcmFtc19ub25lXCI6IG51bGwsXG4gICAgXCJmdW5jdGlvblBhcmFtc19uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25fblwiOiBudWxsLFxuICAgIFwicmV0dXJuXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBbXG4gICAgJ2Z1bmN0aW9uIHNldHVwKCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJ2Z1bmN0aW9uIGRyYXcoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnJ10uam9pbignXFxuJyksXG59KTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLmN1c3RvbSwge1xufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuJyk7NDsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDcsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsxMDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcblxudmFyIENPTE9SX0xJR0hUX0dSRUVOID0gJyNEM0U5NjUnO1xudmFyIENPTE9SX0JMVUUgPSAnIzE5QzNFMSc7XG52YXIgQ09MT1JfUkVEID0gJyNGNzgxODMnO1xudmFyIENPTE9SX0NZQU4gPSAnIzRERDBFMSc7XG52YXIgQ09MT1JfWUVMTE9XID0gJyNGRkYxNzYnO1xudmFyIENPTE9SX1BJTksgPSAnI0Y1N0FDNic7XG52YXIgQ09MT1JfUFVSUExFID0gJyNCQjc3QzcnO1xudmFyIENPTE9SX0dSRUVOID0gJyM2OEQ5OTUnO1xudmFyIENPTE9SX1dISVRFID0gJyNGRkZGRkYnO1xudmFyIENPTE9SX0JMVUUgPSAnIzY0QjVGNic7XG52YXIgQ09MT1JfT1JBTkdFID0gJyNGRkI3NEQnO1xuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIC8vIEdhbWUgTGFiXG4gIHtmdW5jOiAnbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIGJsb2NrUHJlZml4OiAndmFyIGltZyA9IGxvYWRJbWFnZScsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSB9LFxuICB7ZnVuYzogJ2ltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnaW1hZ2UnLCdzcmNYJywnc3JjWScsJ3NyY1cnLCdzcmNIJywneCcsJ3knXSwgcGFyYW1zOiBbXCJpbWdcIiwgXCIwXCIsIFwiMFwiLCBcImltZy53aWR0aFwiLCBcImltZy5oZWlnaHRcIiwgXCIwXCIsIFwiMFwiXSB9LFxuICB7ZnVuYzogJ2ZpbGwnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIid5ZWxsb3cnXCJdIH0sXG4gIHtmdW5jOiAnbm9GaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdzdHJva2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibHVlJ1wiXSB9LFxuICB7ZnVuYzogJ25vU3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdhcmMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJywnc3RhcnQnLCdzdG9wJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI4MDBcIiwgXCI4MDBcIiwgXCIwXCIsIFwiSEFMRl9QSVwiXSB9LFxuICB7ZnVuYzogJ2VsbGlwc2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAnbGluZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICdwb2ludCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAncmVjdCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIxMDBcIiwgXCIxMDBcIiwgXCIyMDBcIiwgXCIyMDBcIl0gfSxcbiAge2Z1bmM6ICd0cmlhbmdsZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJywneDMnLCd5MyddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAndGV4dCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3N0cicsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIndGV4dCdcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjEwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHRTaXplJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsncGl4ZWxzJ10sIHBhcmFtczogW1wiMTJcIl0gfSxcbiAge2Z1bmM6ICdkcmF3U3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYWxsU3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBibG9jazogJ2FsbFNwcml0ZXMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYmFja2dyb3VuZCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ2JsYWNrJ1wiXSB9LFxuICB7ZnVuYzogJ3dpZHRoJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdoZWlnaHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9uJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEub2ZmJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEuYWN0aXZlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VYJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VZJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEucG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLnknLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS56b29tJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcblxuICAvLyBTcHJpdGVzXG4gIHtmdW5jOiAnY3JlYXRlU3ByaXRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgYmxvY2tQcmVmaXg6ICd2YXIgc3ByaXRlID0gY3JlYXRlU3ByaXRlJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3dpZHRoJywnaGVpZ2h0J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiMzBcIiwgXCIzMFwiXSwgdHlwZTogJ2JvdGgnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ2FuZ2xlJ10sIHBhcmFtczogW1wiMVwiLCBcIjkwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEFuaW1hdGlvbkxhYmVsJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXREaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RGlyZWN0aW9uJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRTcGVlZCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVtb3ZlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCcsJ2FuaW1hdGlvbiddLCBwYXJhbXM6IFsnXCJhbmltMVwiJywgXCJhbmltXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRJbWFnZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnLCdpbWFnZSddLCBwYXJhbXM6IFsnXCJpbWcxXCInLCBcImltZ1wiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZEltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRUb0dyb3VwJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydncm91cCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkVG9Hcm91cCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuY2hhbmdlQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJhbmltMVwiJ10sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VBbmltYXRpb24nIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNoYW5nZUltYWdlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJpbWcxXCInXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hdHRyYWN0aW9uUG9pbnQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywneCcsJ3knXSwgcGFyYW1zOiBbXCIxXCIsIFwiMjAwXCIsIFwiMjAwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYXR0cmFjdGlvblBvaW50JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5saW1pdFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydtYXgnXSwgcGFyYW1zOiBbXCIzXCJdLCBtb2RlT3B0aW9uTmFtZTogJyoubGltaXRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0Q29sbGlkZXInLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3R5cGUnLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogWydcInJlY3RhbmdsZVwiJywgXCIwXCIsIFwiMFwiLCBcIjIwXCIsIFwiMjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRDb2xsaWRlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0VmVsb2NpdHknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjFcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRWZWxvY2l0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaGVpZ2h0JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmhlaWdodCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUud2lkdGgnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoud2lkdGgnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5hbmltYXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmRlcHRoJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmRlcHRoJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5mcmljdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmljdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaW1tb3ZhYmxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmltbW92YWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubGlmZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5saWZlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5tYXNzJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1hc3MnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLm1heFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1heFNwZWVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5wb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5wcmV2aW91c1Bvc2l0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZW1vdmVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlc3RpdHV0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlc3RpdHV0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGVUb0RpcmVjdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGVUb0RpcmVjdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0aW9uU3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb25TcGVlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2NhbGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2NhbGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNoYXBlQ29sb3InLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2hhcGVDb2xvcicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudG91Y2hpbmcnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoudG91Y2hpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZlbG9jaXR5JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52aXNpYmxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZpc2libGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgU3ByaXRlIHByb3BlcnRpZXM6XG5jYW1lcmFcbmNvbGxpZGVyIC0gVVNFRlVMPyAobWFyc2hhbCBBQUJCIGFuZCBDaXJjbGVDb2xsaWRlcilcbmRlYnVnXG5ncm91cHNcbm1vdXNlQWN0aXZlXG5tb3VzZUlzT3ZlclxubW91c2VJc1ByZXNzZWRcbm9yaWdpbmFsSGVpZ2h0XG5vcmlnaW5hbFdpZHRoXG4qL1xuXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgU3ByaXRlIG1ldGhvZHM6XG5hZGRJbWFnZShsYWJlbGltZykgLSAxIHBhcmFtIHZlcnNpb246IChzZXRzIGxhYmVsIHRvIFwibm9ybWFsXCIgYXV0b21hdGljYWxseSlcbmJvdW5jZSh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuY29sbGlkZSh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuZGlzcGxhY2UodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmRyYXcoKSAtIE9WRVJSSURFIGFuZC9vciBVU0VGVUw/XG5taXJyb3JYKGRpcikgLSBVU0VGVUw/XG5taXJyb3JZKGRpcikgLSBVU0VGVUw/XG5vdmVybGFwKHRhcmdldGNhbGxiYWNrKSAtIENBTExCQUNLXG5vdmVybGFwUGl4ZWwocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbm92ZXJsYXBQb2ludChwb2ludFhwb2ludFkpIC0gVVNFRlVMP1xudXBkYXRlKCkgLSBVU0VGVUw/XG4qL1xuXG4gIC8vIEFuaW1hdGlvbnNcbiAge2Z1bmM6ICdsb2FkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgYmxvY2tQcmVmaXg6ICd2YXIgYW5pbSA9IGxvYWRBbmltYXRpb24nLCBwYWxldHRlUGFyYW1zOiBbJ3VybDEnLCd1cmwyJ10sIHBhcmFtczogWydcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDEucG5nXCInLCAnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAyLnBuZ1wiJ10gfSxcbiAge2Z1bmM6ICdhbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2FuaW1hdGlvbicsJ3gnLCd5J10sIHBhcmFtczogW1wiYW5pbVwiLCBcIjUwXCIsIFwiNTBcIl0gfSxcbiAge2Z1bmM6ICdhbmltLmNoYW5nZUZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydmcmFtZSddLCBwYXJhbXM6IFtcIjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLm5leHRGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5uZXh0RnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5wcmV2aW91c0ZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnByZXZpb3VzRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5jbG9uZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5jbG9uZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdldEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEZyYW1lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ2V0TGFzdEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldExhc3RGcmFtZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdvVG9GcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnZnJhbWUnXSwgcGFyYW1zOiBbXCIxXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouZ29Ub0ZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ucGxheScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5JyB9LFxuICB7ZnVuYzogJ2FuaW0ucmV3aW5kJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJld2luZCcgfSxcbiAge2Z1bmM6ICdhbmltLnN0b3AnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouc3RvcCcgfSxcbiAge2Z1bmM6ICdhbmltLmZyYW1lQ2hhbmdlZCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmFtZUNoYW5nZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5mcmFtZURlbGF5JywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmZyYW1lRGVsYXknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5pbWFnZXMnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouaW1hZ2VzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0ubG9vcGluZycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5sb29waW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0ucGxheWluZycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5aW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0udmlzaWJsZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIEFuaW1hdGlvbiBtZXRob2RzOlxuZHJhdyh4eSlcbmdldEZyYW1lSW1hZ2UoKVxuZ2V0SGVpZ2h0KClcbmdldEltYWdlQXQoZnJhbWUpXG5nZXRXaWR0aCgpXG4qL1xuXG4gIC8vIEdyb3Vwc1xuICB7ZnVuYzogJ0dyb3VwJywgYmxvY2tQcmVmaXg6ICd2YXIgZ3JvdXAgPSBuZXcgR3JvdXAnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHR5cGU6ICdib3RoJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmFkZCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGQnIH0sXG4gIHtmdW5jOiAnZ3JvdXAucmVtb3ZlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZScgfSxcbiAge2Z1bmM6ICdncm91cC5jbGVhcicsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmNsZWFyJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmNvbnRhaW5zJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNvbnRhaW5zJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmdldCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydpJ10sIHBhcmFtczogW1wiMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5tYXhEZXB0aCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1heERlcHRoJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLm1pbkRlcHRoJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBtb2RlT3B0aW9uTmFtZTogJyoubWluRGVwdGgnLCB0eXBlOiAndmFsdWUnIH0sXG5cbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBHcm91cCBtZXRob2RzOlxuYm91bmNlKHRhcmdldGNhbGxiYWNrKSAtIENBTExCQUNLXG5kaXNwbGFjZSh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuZHJhdygpIC0gVVNFRlVMP1xub3ZlcmxhcCh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuKi9cblxuICAvLyBFdmVudHNcbiAge2Z1bmM6ICdrZXlJc1ByZXNzZWQnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXlDb2RlJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5RG93bicsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlXZW50RG93bicsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlXZW50VXAnLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5UHJlc3NlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlSZWxlYXNlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ2tleVR5cGVkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlUeXBlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VYJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncG1vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUJ1dHRvbicsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlSXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VNb3ZlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VNb3ZlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VNb3ZlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZURyYWdnZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VEcmFnZ2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUHJlc3NlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VSZWxlYXNlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VSZWxlYXNlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZUNsaWNrZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VDbGlja2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlV2hlZWwnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlV2hlZWwoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlV2hlZWwoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG5cbiAgLy8gQWR2YW5jZWRcbiAge2Z1bmM6ICdmb28nLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICdBZHZhbmNlZCcgfSxcbl07XG5cbm1vZHVsZS5leHBvcnRzLmNhdGVnb3JpZXMgPSB7XG4gICdHYW1lIExhYic6IHtcbiAgICBjb2xvcjogJ3llbGxvdycsXG4gICAgcmdiOiBDT0xPUl9ZRUxMT1csXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBTcHJpdGVzOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgQW5pbWF0aW9uczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEdyb3Vwczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIERhdGE6IHtcbiAgICBjb2xvcjogJ2xpZ2h0Z3JlZW4nLFxuICAgIHJnYjogQ09MT1JfTElHSFRfR1JFRU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEcmF3aW5nOiB7XG4gICAgY29sb3I6ICdjeWFuJyxcbiAgICByZ2I6IENPTE9SX0NZQU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBFdmVudHM6IHtcbiAgICBjb2xvcjogJ2dyZWVuJyxcbiAgICByZ2I6IENPTE9SX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgQWR2YW5jZWQ6IHtcbiAgICBjb2xvcjogJ2JsdWUnLFxuICAgIHJnYjogQ09MT1JfQkxVRSxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zaG93UGFyYW1Ecm9wZG93bnMgPSB0cnVlO1xuIiwiLy8gbG9jYWxlIGZvciBnYW1lbGFiXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmdhbWVsYWJfbG9jYWxlO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuJyk7MjsgLyogR2FtZUxhYiAqLyA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwic29mdC1idXR0b25zXCIgY2xhc3M9XCJzb2Z0LWJ1dHRvbnMtbm9uZVwiPlxcbiAgPGJ1dHRvbiBpZD1cImxlZnRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDYsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJsZWZ0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg5LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwicmlnaHQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwidXBCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDEyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwidXAtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwiZG93bkJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJkb3duLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbjwvZGl2PlxcblxcbicpOzE5OyBpZiAoZmluaXNoQnV0dG9uKSB7IDsgYnVmLnB1c2goJ1xcbiAgPGRpdiBpZD1cInNoYXJlLWNlbGxcIiBjbGFzcz1cInNoYXJlLWNlbGwtbm9uZVwiPlxcbiAgICA8YnV0dG9uIGlkPVwiZmluaXNoQnV0dG9uXCIgY2xhc3M9XCJzaGFyZVwiPlxcbiAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDIyLCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MjU7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQobnVsbCwgJ2ZvbycpO1xufTtcbiIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uIChpZCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQoaWQsICdmb28nKTtcbn07XG4iXX0=
