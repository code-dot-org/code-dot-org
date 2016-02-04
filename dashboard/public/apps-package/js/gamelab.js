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
var JsInterpreterLogger = require('../JsInterpreterLogger');

var MAX_INTERPRETER_STEPS_PER_TICK = 500000;

/**
 * An instantiable GameLab class
 */
var GameLab = function GameLab() {
  this.skin = null;
  this.level = null;
  this.tickIntervalId = 0;
  this.tickCount = 0;

  /** @type {StudioApp} */
  this.studioApp_ = null;

  /** @type {JSInterpreter} */
  this.JSInterpreter = null;

  /** @private {JsInterpreterLogger} */
  this.consoleLogger_ = null;

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
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

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

  this.consoleLogger_.detach();

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
      studioApp: this.studioApp_,
      maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
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
    this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
    this.consoleLogger_.attachTo(this.JSInterpreter);
    this.JSInterpreter.parse({
      code: this.studioApp_.getCode(),
      blocks: dropletConfig.blocks,
      blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
      enableEvents: true
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
  this.consoleLogger_.log(err);
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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/extraControlRows.html.ejs","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs":[function(require,module,exports){
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
    "var_loadImage": null,
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
    "textAlign": null,
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
    "var_createSprite": null,
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
    "sprite.position.x": null,
    "sprite.position.y": null,
    "sprite.previousPosition.x": null,
    "sprite.previousPosition.y": null,
    "sprite.removed": null,
    "sprite.restitution": null,
    "sprite.rotateToDirection": null,
    "sprite.rotation": null,
    "sprite.rotationSpeed": null,
    "sprite.scale": null,
    "sprite.shapeColor": null,
    "sprite.touching": null,
    "sprite.velocity.x": null,
    "sprite.velocity.y": null,
    "sprite.visible": null,

    // Animations
    "var_loadAnimation": null,
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
{ func: 'loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], type: 'either' }, { func: 'var_loadImage', category: 'Game Lab', blockPrefix: 'var img = loadImage', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true }, { func: 'image', category: 'Game Lab', paletteParams: ['image', 'srcX', 'srcY', 'srcW', 'srcH', 'x', 'y'], params: ["img", "0", "0", "img.width", "img.height", "0", "0"] }, { func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] }, { func: 'noFill', category: 'Game Lab' }, { func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] }, { func: 'noStroke', category: 'Game Lab' }, { func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] }, { func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"] }, { func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"] }, { func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"] }, { func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"] }, { func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"] }, { func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"] }, { func: 'textAlign', category: 'Game Lab', paletteParams: ['horiz', 'vert'], params: ["CENTER", "TOP"] }, { func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] }, { func: 'drawSprites', category: 'Game Lab' }, { func: 'allSprites', category: 'Game Lab', block: 'allSprites', type: 'property' }, { func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] }, { func: 'width', category: 'Game Lab', type: 'property' }, { func: 'height', category: 'Game Lab', type: 'property' }, { func: 'camera', category: 'Game Lab', type: 'property' }, { func: 'camera.on', category: 'Game Lab' }, { func: 'camera.off', category: 'Game Lab' }, { func: 'camera.active', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseX', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseY', category: 'Game Lab', type: 'property' }, { func: 'camera.position.x', category: 'Game Lab', type: 'property' }, { func: 'camera.position.y', category: 'Game Lab', type: 'property' }, { func: 'camera.zoom', category: 'Game Lab', type: 'property' },

// Sprites
{ func: 'createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'either' }, { func: 'var_createSprite', category: 'Sprites', blockPrefix: 'var sprite = createSprite', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], noAutocomplete: true }, { func: 'sprite.setSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.setSpeed' }, { func: 'sprite.getAnimationLabel', category: 'Sprites', modeOptionName: '*.getAnimationLabel', type: 'value' }, { func: 'sprite.getDirection', category: 'Sprites', modeOptionName: '*.getDirection', type: 'value' }, { func: 'sprite.getSpeed', category: 'Sprites', modeOptionName: '*.getSpeed', type: 'value' }, { func: 'sprite.remove', category: 'Sprites', modeOptionName: '*.remove' }, { func: 'sprite.addAnimation', category: 'Sprites', paletteParams: ['label', 'animation'], params: ['"anim1"', "anim"], modeOptionName: '*.addAnimation' }, { func: 'sprite.addImage', category: 'Sprites', paletteParams: ['label', 'image'], params: ['"img1"', "img"], modeOptionName: '*.addImage' }, { func: 'sprite.addSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.addSpeed' }, { func: 'sprite.addToGroup', category: 'Sprites', paletteParams: ['group'], params: ["group"], modeOptionName: '*.addToGroup' }, { func: 'sprite.changeAnimation', category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], modeOptionName: '*.changeAnimation' }, { func: 'sprite.changeImage', category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], modeOptionName: '*.changeImage' }, { func: 'sprite.attractionPoint', category: 'Sprites', paletteParams: ['speed', 'x', 'y'], params: ["1", "200", "200"], modeOptionName: '*.attractionPoint' }, { func: 'sprite.limitSpeed', category: 'Sprites', paletteParams: ['max'], params: ["3"], modeOptionName: '*.limitSpeed' }, { func: 'sprite.setCollider', category: 'Sprites', paletteParams: ['type', 'x', 'y', 'w', 'h'], params: ['"rectangle"', "0", "0", "20", "20"], modeOptionName: '*.setCollider' }, { func: 'sprite.setVelocity', category: 'Sprites', paletteParams: ['x', 'y'], params: ["1", "1"], modeOptionName: '*.setVelocity' }, { func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' }, { func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' }, { func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property' }, { func: 'sprite.depth', category: 'Sprites', modeOptionName: '*.depth', type: 'property' }, { func: 'sprite.friction', category: 'Sprites', modeOptionName: '*.friction', type: 'property' }, { func: 'sprite.immovable', category: 'Sprites', modeOptionName: '*.immovable', type: 'property' }, { func: 'sprite.life', category: 'Sprites', modeOptionName: '*.life', type: 'property' }, { func: 'sprite.mass', category: 'Sprites', modeOptionName: '*.mass', type: 'property' }, { func: 'sprite.maxSpeed', category: 'Sprites', modeOptionName: '*.maxSpeed', type: 'property' }, { func: 'sprite.position', category: 'Sprites', modeOptionName: '*.position', type: 'property' }, { func: 'sprite.position.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.position.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.previousPosition', category: 'Sprites', modeOptionName: '*.previousPosition', type: 'property' }, { func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.removed', category: 'Sprites', modeOptionName: '*.removed', type: 'property' }, { func: 'sprite.restitution', category: 'Sprites', modeOptionName: '*.restitution', type: 'property' }, { func: 'sprite.rotateToDirection', category: 'Sprites', modeOptionName: '*.rotateToDirection', type: 'property' }, { func: 'sprite.rotation', category: 'Sprites', modeOptionName: '*.rotation', type: 'property' }, { func: 'sprite.rotationSpeed', category: 'Sprites', modeOptionName: '*.rotationSpeed', type: 'property' }, { func: 'sprite.scale', category: 'Sprites', modeOptionName: '*.scale', type: 'property' }, { func: 'sprite.shapeColor', category: 'Sprites', modeOptionName: '*.shapeColor', type: 'property' }, { func: 'sprite.touching', category: 'Sprites', modeOptionName: '*.touching', type: 'property' }, { func: 'sprite.velocity', category: 'Sprites', modeOptionName: '*.velocity', type: 'property' }, { func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.visible', category: 'Sprites', modeOptionName: '*.visible', type: 'property' },
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
{ func: 'loadAnimation', category: 'Animations', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], type: 'either' }, { func: 'var_loadAnimation', category: 'Animations', blockPrefix: 'var anim = loadAnimation', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], noAutocomplete: true }, { func: 'animation', category: 'Animations', paletteParams: ['animation', 'x', 'y'], params: ["anim", "50", "50"] }, { func: 'anim.changeFrame', category: 'Animations', paletteParams: ['frame'], params: ["0"], modeOptionName: '*.changeFrame' }, { func: 'anim.nextFrame', category: 'Animations', modeOptionName: '*.nextFrame' }, { func: 'anim.previousFrame', category: 'Animations', modeOptionName: '*.previousFrame' }, { func: 'anim.clone', category: 'Animations', modeOptionName: '*.clone', type: 'value' }, { func: 'anim.getFrame', category: 'Animations', modeOptionName: '*.getFrame', type: 'value' }, { func: 'anim.getLastFrame', category: 'Animations', modeOptionName: '*.getLastFrame', type: 'value' }, { func: 'anim.goToFrame', category: 'Animations', paletteParams: ['frame'], params: ["1"], modeOptionName: '*.goToFrame' }, { func: 'anim.play', category: 'Animations', modeOptionName: '*.play' }, { func: 'anim.rewind', category: 'Animations', modeOptionName: '*.rewind' }, { func: 'anim.stop', category: 'Animations', modeOptionName: '*.stop' }, { func: 'anim.frameChanged', category: 'Animations', modeOptionName: '*.frameChanged', type: 'property' }, { func: 'anim.frameDelay', category: 'Animations', modeOptionName: '*.frameDelay', type: 'property' }, { func: 'anim.images', category: 'Animations', modeOptionName: '*.images', type: 'property' }, { func: 'anim.looping', category: 'Animations', modeOptionName: '*.looping', type: 'property' }, { func: 'anim.playing', category: 'Animations', modeOptionName: '*.playing', type: 'property' }, { func: 'anim.visible', category: 'Animations', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

// Groups
{ func: 'Group', blockPrefix: 'var group = new Group', category: 'Groups', type: 'either' }, { func: 'group.add', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.add' }, { func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.remove' }, { func: 'group.clear', category: 'Groups', modeOptionName: '*.clear' }, { func: 'group.contains', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.contains', type: 'value' }, { func: 'group.get', category: 'Groups', paletteParams: ['i'], params: ["0"], modeOptionName: '*.get', type: 'value' }, { func: 'group.maxDepth', category: 'Groups', modeOptionName: '*.maxDepth', type: 'value' }, { func: 'group.minDepth', category: 'Groups', modeOptionName: '*.minDepth', type: 'value' },

/* TODO: decide whether to expose these Group methods:
bounce(targetcallback) - CALLBACK
displace(targetcallback) - CALLBACK
draw() - USEFUL?
overlap(targetcallback) - CALLBACK
*/

// Events
{ func: 'keyIsPressed', category: 'Events', type: 'property' }, { func: 'key', category: 'Events', type: 'property' }, { func: 'keyCode', category: 'Events', type: 'property' }, { func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Events' }, { func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Events' }, { func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Events' }, { func: 'mouseX', category: 'Events', type: 'property' }, { func: 'mouseY', category: 'Events', type: 'property' }, { func: 'pmouseX', category: 'Events', type: 'property' }, { func: 'pmouseY', category: 'Events', type: 'property' }, { func: 'mouseButton', category: 'Events', type: 'property' }, { func: 'mouseIsPressed', category: 'Events', type: 'property' }, { func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Events' }, { func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Events' }, { func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Events' }, { func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Events' }, { func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Events' }, { func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Events' },

// Math
{ func: 'sin', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'cos', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'tan', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'asin', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'acos', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'atan', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'atan2', category: 'Math', paletteParams: ['y', 'x'], params: ["10", "10"], type: 'value' }, { func: 'degrees', category: 'Math', paletteParams: ['radians'], params: ["0"], type: 'value' }, { func: 'radians', category: 'Math', paletteParams: ['degrees'], params: ["0"], type: 'value' }, { func: 'angleMode', category: 'Math', paletteParams: ['mode'], params: ["DEGREES"] }, { func: 'random', category: 'Math', paletteParams: ['min', 'max'], params: ["1", "5"], type: 'value' }, { func: 'randomGaussian', category: 'Math', paletteParams: ['mean', 'sd'], params: ["0", "15"], type: 'value' }, { func: 'randomSeed', category: 'Math', paletteParams: ['seed'], params: ["99"] }, { func: 'abs', category: 'Math', paletteParams: ['num'], params: ["-1"], type: 'value' }, { func: 'ceil', category: 'Math', paletteParams: ['num'], params: ["0.1"], type: 'value' }, { func: 'constrain', category: 'Math', paletteParams: ['num', 'low', 'high'], params: ["1.1", "0", "1"], type: 'value' }, { func: 'dist', category: 'Math', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "100", "100"], type: 'value' }, { func: 'exp', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' }, { func: 'floor', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' }, { func: 'lerp', category: 'Math', paletteParams: ['start', 'stop', 'amt'], params: ["0", "100", "0.1"], type: 'value' }, { func: 'log', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' }, { func: 'mag', category: 'Math', paletteParams: ['a', 'b'], params: ["100", "100"], type: 'value' }, { func: 'map', category: 'Math', paletteParams: ['value', 'start1', 'stop1', 'start2', 'stop'], params: ["0.9", "0", "1", "0", "100"], type: 'value' }, { func: 'max', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value' }, { func: 'min', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value' }, { func: 'norm', category: 'Math', paletteParams: ['value', 'start', 'stop'], params: ["90", "0", "100"], type: 'value' }, { func: 'pow', category: 'Math', paletteParams: ['n', 'e'], params: ["10", "2"], type: 'value' }, { func: 'round', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' }, { func: 'sq', category: 'Math', paletteParams: ['num'], params: ["2"], type: 'value' }, { func: 'sqrt', category: 'Math', paletteParams: ['num'], params: ["9"], type: 'value' }];

// Advanced
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

module.exports.additionalPredefValues = ['P2D', 'WEBGL', 'ARROW', 'CROSS', 'HAND', 'MOVE', 'TEXT', 'WAIT', 'HALF_PI', 'PI', 'QUARTER_PI', 'TAU', 'TWO_PI', 'DEGREES', 'RADIANS', 'CORNER', 'CORNERS', 'RADIUS', 'RIGHT', 'LEFT', 'CENTER', 'TOP', 'BOTTOM', 'BASELINE', 'POINTS', 'LINES', 'TRIANGLES', 'TRIANGLE_FAN', 'TRIANGLE_STRIP', 'QUADS', 'QUAD_STRIP', 'CLOSE', 'OPEN', 'CHORD', 'PIE', 'PROJECT', 'SQUARE', 'ROUND', 'BEVEL', 'MITER', 'RGB', 'HSB', 'HSL', 'AUTO', 'ALT', 'BACKSPACE', 'CONTROL', 'DELETE', 'DOWN_ARROW', 'ENTER', 'ESCAPE', 'LEFT_ARROW', 'OPTION', 'RETURN', 'RIGHT_ARROW', 'SHIFT', 'TAB', 'UP_ARROW', 'BLEND', 'ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION', 'MULTIPLY', 'SCREEN', 'REPLACE', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN', 'THRESHOLD', 'GRAY', 'OPAQUE', 'INVERT', 'POSTERIZE', 'DILATE', 'ERODE', 'BLUR', 'NORMAL', 'ITALIC', 'BOLD', '_DEFAULT_TEXT_FILL', '_DEFAULT_LEADMULT', '_CTX_MIDDLE', 'LINEAR', 'QUADRATIC', 'BEZIER', 'CURVE', '_DEFAULT_STROKE', '_DEFAULT_FILL'];
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
"use strict";

var GameLab;

// API definitions for functions exposed for JavaScript (droplet/ace) levels:
exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

/*
 * All APIs disabled for now. p5/p5play is the only exposed API. If we want to
 * expose other top-level APIs, they should be included here as shown in these
 * commented functions
 *

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.foo = function (id) {
  GameLab.executeCmd(id, 'foo');
};
*/

},{}]},{},["/home/ubuntu/staging/apps/build/js/gamelab/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVks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RSxDQUFDO0FBQzNFLFdBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDOztBQUVwRSxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEQsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs7QUFFeEMsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDOzs7QUFHeEMsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7O0FBRzNFLFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7OztBQUc3RSxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0FBRzlELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBRTlEOztBQUVELFFBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFD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QUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQ3BLLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQ3JGLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQ3ZDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQ3JGLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQ3pDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUN2SSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUNoSCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3hGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3pILEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDdEcsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFDcEYsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFDNUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2xGLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDeEQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6RCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3pELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzFDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzNDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDaEUsRUFBQyxJQUFJ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RUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDcEgsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN0RixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakcsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ2pKLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUM5RixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDL0YsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDckgsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBR3hGLENBQUM7OztBQUVGLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHO0FBQzFCLFlBQVUsRUFBRTtBQUNWLFNBQUssRUFBRSxRQUFRO0FBQ2YsT0FBRyxFQUFFLFlBQVk7QUFDakIsVUFBTSxFQUFFLEVBQUU7R0FDWDtBQUNELFNBQU8sRUFBRTtBQUNQLFNBQUssRUFBRSxLQUFLO0FBQ1osT0FBRyxFQUFFLFNBQVM7QUFDZCxVQUFNLEVBQUUsRUFBRTtHQUNYO0FBQ0QsWUFBVSxFQUFFO0FBQ1YsU0FBSyxFQUFFLEtBQUs7QUFDWixPQUFHLEVBQUUsU0FBUztBQUNkLFVBQU0sRUFBRSxFQUFFO0dBQ1g7QUFDRCxRQUFNLEVBQUU7QUFDTixTQUFLLEVBQUUsS0FBSztBQUNaLE9BQUcsRUFBRSxTQUFTO0FBQ2QsVUFBTSxFQUFFLEVBQUU7R0FDWDtBQUNELE1BQUksRUFBRTtBQUNKLFNBQUssRUFBRSxZQUFZO0FBQ25CLE9BQUcsRUFBRSxpQkFBaUI7QUFDdEIsVUFBTSxFQUFFLEVBQUU7R0FDWDtBQUNELFNBQU8sRUFBRTtBQUNQLFNBQUssRUFBRSxNQUFNO0FBQ2IsT0FBRyxFQUFFLFVBQVU7QUFDZixVQUFNLEVBQUUsRUFBRTtHQUNYO0FBQ0QsUUFBTSxFQUFFO0FBQ04sU0FBSyxFQUFFLE9BQU87QUFDZCxPQUFHLEVBQUUsV0FBVztBQUNoQixVQUFNLEVBQUUsRUFBRTtHQUNYO0FBQ0QsVUFBUSxFQUFFO0FBQ1IsU0FBSyxFQUFFLE1BQU07QUFDYixPQUFHLEVBQUUsVUFBVTtBQUNmLFVBQU0sRUFBRSxFQUFFO0dBQ1g7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEdBQUcsQ0FDdEMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQ2hELE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQ3pFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQzFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUNwRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFDeEUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQzNFLEtBQUssRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFDeEUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUMzRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFDaEUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQ3RFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFDckUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQzNFLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsQ0FDNUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUN4UnpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7OztBQ0QvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkJBLElBQUksT0FBTyxDQUFDOzs7QUFHWixPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsT0FBTyxFQUFFO0FBQ3pDLFNBQU8sR0FBRyxPQUFPLENBQUM7Q0FDbkIsQ0FBQzs7QUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFlBQVk7QUFDeEIsU0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDakMsQ0FBQzs7Ozs7QUNURixJQUFJLE9BQU8sQ0FBQzs7O0FBR1osT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN6QyxTQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ25CLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5nYW1lbGFiTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGdhbWVsYWIgPSBuZXcgR2FtZUxhYigpO1xuXG4gIGdhbWVsYWIuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oZ2FtZWxhYiwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQ0RPIEFwcDogR2FtZUxhYlxuICpcbiAqIENvcHlyaWdodCAyMDE2IENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmdhbWVsYWJfZm9vID0ge1xuICAgIC8vIEJsb2NrIGZvciBmb28uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZvbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZvb1Rvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5nYW1lbGFiX2ZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBmb28uXG4gICAgcmV0dXJuICdHYW1lTGFiLmZvbygpO1xcbic7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaUphdmFzY3JpcHQgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQnKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xudmFyIEpzSW50ZXJwcmV0ZXJMb2dnZXIgPSByZXF1aXJlKCcuLi9Kc0ludGVycHJldGVyTG9nZ2VyJyk7XG5cbnZhciBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0sgPSA1MDAwMDA7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEdhbWVMYWIgY2xhc3NcbiAqL1xudmFyIEdhbWVMYWIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2tpbiA9IG51bGw7XG4gIHRoaXMubGV2ZWwgPSBudWxsO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qKiBAdHlwZSB7U3R1ZGlvQXBwfSAqL1xuICB0aGlzLnN0dWRpb0FwcF8gPSBudWxsO1xuXG4gIC8qKiBAdHlwZSB7SlNJbnRlcnByZXRlcn0gKi9cbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcblxuICAvKiogQHByaXZhdGUge0pzSW50ZXJwcmV0ZXJMb2dnZXJ9ICovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8gPSBudWxsO1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB0aGlzLnA1ZXZlbnROYW1lcyA9IFtcbiAgICAnbW91c2VNb3ZlZCcsICdtb3VzZURyYWdnZWQnLCAnbW91c2VQcmVzc2VkJywgJ21vdXNlUmVsZWFzZWQnLFxuICAgICdtb3VzZUNsaWNrZWQnLCAnbW91c2VXaGVlbCcsXG4gICAgJ2tleVByZXNzZWQnLCAna2V5UmVsZWFzZWQnLCAna2V5VHlwZWQnXG4gIF07XG4gIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zID0gWydkcmF3JywgJ3NldHVwJ10uY29uY2F0KHRoaXMucDVldmVudE5hbWVzKTtcblxuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxhYjtcblxuLyoqXG4gKiBJbmplY3QgdGhlIHN0dWRpb0FwcCBzaW5nbGV0b24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbi8vIEZvciBwcm94eWluZyBub24taHR0cHMgYXNzZXRzXG52YXIgTUVESUFfUFJPWFkgPSAnLy8nICsgbG9jYXRpb24uaG9zdCArICcvbWVkaWE/dT0nO1xuXG4vLyBzdGFydHMgd2l0aCBodHRwIG9yIGh0dHBzXG52YXIgQUJTT0xVVEVfUkVHRVhQID0gbmV3IFJlZ0V4cCgnXmh0dHBzPzovLycsICdpJyk7XG5cbkdhbWVMYWIuYmFzZVA1bG9hZEltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoaXMgR2FtZUxhYiBpbnN0YW5jZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZUxhYiByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfID0gbmV3IEpzSW50ZXJwcmV0ZXJMb2dnZXIod2luZG93LmNvbnNvbGUpO1xuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuc2V0dXBHbG9iYWxNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmb3Igbm8tc2tldGNoIEdsb2JhbCBtb2RlXG4gICAgICovXG4gICAgdmFyIHA1ID0gd2luZG93LnA1O1xuXG4gICAgdGhpcy5faXNHbG9iYWwgPSB0cnVlO1xuICAgIC8vIExvb3AgdGhyb3VnaCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYW5kIGF0dGFjaCB0aGVtIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwIGluIHA1LnByb3RvdHlwZSkge1xuICAgICAgaWYodHlwZW9mIHA1LnByb3RvdHlwZVtwXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZXYgPSBwLnN1YnN0cmluZygyKTtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudHMuaGFzT3duUHJvcGVydHkoZXYpKSB7XG4gICAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXR0YWNoIGl0cyBwcm9wZXJ0aWVzIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwMiBpbiB0aGlzKSB7XG4gICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShwMikpIHtcbiAgICAgICAgd2luZG93W3AyXSA9IHRoaXNbcDJdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBPdmVycmlkZSBwNS5sb2FkSW1hZ2Ugc28gd2UgY2FuIG1vZGlmeSB0aGUgVVJMIHBhdGggcGFyYW1cbiAgaWYgKCFHYW1lTGFiLmJhc2VQNWxvYWRJbWFnZSkge1xuICAgIEdhbWVMYWIuYmFzZVA1bG9hZEltYWdlID0gd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2U7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbiAocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIGlmIChBQlNPTFVURV9SRUdFWFAudGVzdChwYXRoKSkge1xuICAgICAgICAvLyBXZSB3YW50IHRvIGJlIGFibGUgdG8gaGFuZGxlIHRoZSBjYXNlIHdoZXJlIG91ciBmaWxlbmFtZSBjb250YWlucyBhXG4gICAgICAgIC8vIHNwYWNlLCBpLmUuIFwid3d3LmV4YW1wbGUuY29tL2ltYWdlcy9mb28gYmFyLnBuZ1wiLCBldmVuIHRob3VnaCB0aGlzIGlzIGFcbiAgICAgICAgLy8gdGVjaG5pY2FsbHkgaW52YWxpZCBVUkwuIGVuY29kZVVSSUNvbXBvbmVudCB3aWxsIHJlcGxhY2Ugc3BhY2Ugd2l0aCAlMjBcbiAgICAgICAgLy8gZm9yIHVzLCBidXQgYXMgc29vbiBhcyBpdCdzIGRlY29kZWQsIHdlIGFnYWluIGhhdmUgYW4gaW52YWxpZCBVUkwuIEZvclxuICAgICAgICAvLyB0aGlzIHJlYXNvbiB3ZSBmaXJzdCByZXBsYWNlIHNwYWNlIHdpdGggJTIwIG91cnNlbHZlcywgc3VjaCB0aGF0IHdlIG5vd1xuICAgICAgICAvLyBoYXZlIGEgdmFsaWQgVVJMLCBhbmQgdGhlbiBjYWxsIGVuY29kZVVSSUNvbXBvbmVudCBvbiB0aGUgcmVzdWx0LlxuICAgICAgICBwYXRoID0gTUVESUFfUFJPWFkgKyBlbmNvZGVVUklDb21wb25lbnQocGF0aC5yZXBsYWNlKC8gL2csICclMjAnKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gR2FtZUxhYi5iYXNlUDVsb2FkSW1hZ2UocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH07XG4gIH1cblxuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG4gIGNvbmZpZy5hcHBNc2cgPSBtc2c7XG5cbiAgdmFyIHNob3dGaW5pc2hCdXR0b24gPSAhdGhpcy5sZXZlbC5pc1Byb2plY3RMZXZlbDtcbiAgdmFyIGZpbmlzaEJ1dHRvbkZpcnN0TGluZSA9IF8uaXNFbXB0eSh0aGlzLmxldmVsLnNvZnRCdXR0b25zKTtcbiAgdmFyIGZpcnN0Q29udHJvbHNSb3cgPSByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZmluaXNoQnV0dG9uOiBmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcbiAgdmFyIGV4dHJhQ29udHJvbFJvd3MgPSByZXF1aXJlKCcuL2V4dHJhQ29udHJvbFJvd3MuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246ICFmaW5pc2hCdXR0b25GaXJzdExpbmUgJiYgc2hvd0ZpbmlzaEJ1dHRvblxuICB9KTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IGZpcnN0Q29udHJvbHNSb3csXG4gICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBfLmJpbmQodGhpcy5sb2FkQXVkaW9fLCB0aGlzKTtcbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gXy5iaW5kKHRoaXMuYWZ0ZXJJbmplY3RfLCB0aGlzLCBjb25maWcpO1xuXG4gIC8vIFN0b3JlIHA1c3BlY2lhbEZ1bmN0aW9ucyBpbiB0aGUgdW51c2VkQ29uZmlnIGFycmF5IHNvIHdlIGRvbid0IGdpdmUgd2FybmluZ3NcbiAgLy8gYWJvdXQgdGhlc2UgZnVuY3Rpb25zIG5vdCBiZWluZyBjYWxsZWQ6XG4gIGNvbmZpZy51bnVzZWRDb25maWcgPSB0aGlzLnA1c3BlY2lhbEZ1bmN0aW9ucztcblxuICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUubG9hZEF1ZGlvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4ud2luU291bmQsICd3aW4nKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbn07XG5cbi8qKlxuICogQ29kZSBjYWxsZWQgYWZ0ZXIgdGhlIGJsb2NrbHkgZGl2ICsgYmxvY2tseSBjb3JlIGlzIGluamVjdGVkIGludG8gdGhlIGRvY3VtZW50XG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmFmdGVySW5qZWN0XyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdHYW1lTGFiLGNvZGUnKTtcbiAgfVxuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgZGl2R2FtZUxhYi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG4gIGRpdkdhbWVMYWIuc3R5bGUuaGVpZ2h0ID0gJzQwMHB4JztcblxufTtcblxuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGlja0ludGVydmFsSWQpO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgd2hpbGUgKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCkge1xuICAgIGRpdkdhbWVMYWIucmVtb3ZlQ2hpbGQoZGl2R2FtZUxhYi5maXJzdENoaWxkKTtcbiAgfVxuICAqL1xuXG4gIGlmICh0aGlzLnA1KSB7XG4gICAgdGhpcy5wNS5yZW1vdmUoKTtcbiAgICB0aGlzLnA1ID0gbnVsbDtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG5cbiAgICAvLyBDbGVhciByZWdpc3RlcmVkIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZTpcbiAgICBmb3IgKHZhciBtZW1iZXIgaW4gd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMpIHtcbiAgICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kc1ttZW1iZXJdO1xuICAgIH1cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcyA9IHsgcHJlOiBbXSwgcG9zdDogW10sIHJlbW92ZTogW10gfTtcbiAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZFByZWxvYWRNZXRob2RzLmdhbWVsYWJQcmVsb2FkO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5hbGxTcHJpdGVzID0gbmV3IHdpbmRvdy5Hcm91cCgpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuc3ByaXRlVXBkYXRlID0gdHJ1ZTtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhID0gbmV3IHdpbmRvdy5DYW1lcmEoMCwgMCwgMSk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEuaW5pdCA9IGZhbHNlO1xuXG4gICAgLy9rZXlib2FyZCBpbnB1dFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUucmVhZFByZXNzZXMpO1xuXG4gICAgLy9hdXRvbWF0aWMgc3ByaXRlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUudXBkYXRlU3ByaXRlcyk7XG5cbiAgICAvL3F1YWR0cmVlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cudXBkYXRlVHJlZSk7XG5cbiAgICAvL2NhbWVyYSBwdXNoIGFuZCBwb3BcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cuY2FtZXJhUHVzaCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy5jYW1lcmFQb3ApO1xuXG4gIH1cblxuICB3aW5kb3cucDUucHJvdG90eXBlLmdhbWVsYWJQcmVsb2FkID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IHdpbmRvdy5wNS5fZ2V0RGVjcmVtZW50UHJlbG9hZChhcmd1bWVudHMsIHRoaXMucDUpO1xuICB9LCB0aGlzKTtcblxuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmRldGFjaCgpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmV2YWxDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgR2FtZUxhYjogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEluZmluaXR5IGlzIHRocm93biBpZiB3ZSBkZXRlY3QgYW4gaW5maW5pdGUgbG9vcC4gSW4gdGhhdCBjYXNlIHdlJ2xsXG4gICAgLy8gc3RvcCBmdXJ0aGVyIGV4ZWN1dGlvbiwgYW5pbWF0ZSB3aGF0IG9jY3VyZWQgYmVmb3JlIHRoZSBpbmZpbml0ZSBsb29wLFxuICAgIC8vIGFuZCBhbmFseXplIHN1Y2Nlc3MvZmFpbHVyZSBiYXNlZCBvbiB3aGF0IHdhcyBkcmF3bi5cbiAgICAvLyBPdGhlcndpc2UsIGFibm9ybWFsIHRlcm1pbmF0aW9uIGlzIGEgdXNlciBlcnJvci5cbiAgICBpZiAoZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAgIC8vIFVzZXJDb2RlIHNvIHRoYXQgaXQncyBjbGVhciB0aGlzIGlzIGluIGV2YWwnZWQgY29kZS5cbiAgICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgICAgfVxuICAgICAgd2luZG93LmFsZXJ0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gUmVzZXQgYWxsIHN0YXRlLlxuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQoKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkgJiZcbiAgICAgICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgICB0aGlzLnN0dWRpb0FwcF8uaGFzRHVwbGljYXRlVmFyaWFibGVzSW5Gb3JMb29wcygpKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBuZXcgd2luZG93LnA1KF8uYmluZChmdW5jdGlvbiAocDVvYmopIHtcbiAgICAgIHRoaXMucDUgPSBwNW9iajtcblxuICAgICAgcDVvYmoucmVnaXN0ZXJQcmVsb2FkTWV0aG9kKCdnYW1lbGFiUHJlbG9hZCcsIHdpbmRvdy5wNS5wcm90b3R5cGUpO1xuXG4gICAgICBwNW9iai5zZXR1cEdsb2JhbE1vZGUoKTtcblxuICAgICAgd2luZG93LnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENhbGwgb3VyIGdhbWVsYWJQcmVsb2FkKCkgdG8gZm9yY2UgX3N0YXJ0L19zZXR1cCB0byB3YWl0LlxuICAgICAgICB3aW5kb3cuZ2FtZWxhYlByZWxvYWQoKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuc2V0dXAgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICBwNW9iai5jcmVhdGVDYW52YXMoNDAwLCA0MDApO1xuICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVycy5zZXR1cCkge1xuICAgICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zZXR1cC5hcHBseShudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcyk7XG4gICAgICB3aW5kb3cuZHJhdyA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzLmRyYXcpIHtcbiAgICAgICAgICB2YXIgc3RhcnRUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5kcmF3LmFwcGx5KG51bGwpO1xuICAgICAgICAgIHZhciB0aW1lRWxhcHNlZCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAkKCcjYnViYmxlJykudGV4dCh0aW1lRWxhcHNlZC50b0ZpeGVkKDIpICsgJyBtcycpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHRoaXMucDVldmVudE5hbWVzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgICB3aW5kb3dbZXZlbnROYW1lXSA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0uYXBwbHkobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sIHRoaXMpLCAnZGl2R2FtZUxhYicpO1xuXG4gIGlmICh0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbmV3IEpTSW50ZXJwcmV0ZXIoe1xuICAgICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgICBtYXhJbnRlcnByZXRlclN0ZXBzUGVyVGljazogTUFYX0lOVEVSUFJFVEVSX1NURVBTX1BFUl9USUNLLFxuICAgICAgY3VzdG9tTWFyc2hhbEdsb2JhbFByb3BlcnRpZXM6IHtcbiAgICAgICAgd2lkdGg6IHRoaXMucDUsXG4gICAgICAgIGhlaWdodDogdGhpcy5wNSxcbiAgICAgICAgZGlzcGxheVdpZHRoOiB0aGlzLnA1LFxuICAgICAgICBkaXNwbGF5SGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICB3aW5kb3dXaWR0aDogdGhpcy5wNSxcbiAgICAgICAgd2luZG93SGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICBmb2N1c2VkOiB0aGlzLnA1LFxuICAgICAgICBmcmFtZUNvdW50OiB0aGlzLnA1LFxuICAgICAgICBrZXlJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAgICAgIGtleTogdGhpcy5wNSxcbiAgICAgICAga2V5Q29kZTogdGhpcy5wNSxcbiAgICAgICAgbW91c2VYOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHBtb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIHBtb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHdpbk1vdXNlWDogdGhpcy5wNSxcbiAgICAgICAgd2luTW91c2VZOiB0aGlzLnA1LFxuICAgICAgICBwd2luTW91c2VYOiB0aGlzLnA1LFxuICAgICAgICBwd2luTW91c2VZOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZUJ1dHRvbjogdGhpcy5wNSxcbiAgICAgICAgbW91c2VJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoWDogdGhpcy5wNSxcbiAgICAgICAgdG91Y2hZOiB0aGlzLnA1LFxuICAgICAgICBwdG91Y2hYOiB0aGlzLnA1LFxuICAgICAgICBwdG91Y2hZOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaGVzOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaElzRG93bjogdGhpcy5wNSxcbiAgICAgICAgcGl4ZWxzOiB0aGlzLnA1LFxuICAgICAgICBkZXZpY2VPcmllbnRhdGlvbjogdGhpcy5wNSxcbiAgICAgICAgYWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgYWNjZWxlcmF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgYWNjZWxlcmF0aW9uWjogdGhpcy5wNSxcbiAgICAgICAgcEFjY2VsZXJhdGlvblg6IHRoaXMucDUsXG4gICAgICAgIHBBY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBwQWNjZWxlcmF0aW9uWjogdGhpcy5wNSxcbiAgICAgICAgcm90YXRpb25YOiB0aGlzLnA1LFxuICAgICAgICByb3RhdGlvblk6IHRoaXMucDUsXG4gICAgICAgIHJvdGF0aW9uWjogdGhpcy5wNSxcbiAgICAgICAgcFJvdGF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgcFJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgcFJvdGF0aW9uWjogdGhpcy5wNVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5vbkV4ZWN1dGlvbkVycm9yLnJlZ2lzdGVyKHRoaXMuaGFuZGxlRXhlY3V0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5jb25zb2xlTG9nZ2VyXy5hdHRhY2hUbyh0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5wYXJzZSh7XG4gICAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICAgIGJsb2NrRmlsdGVyOiB0aGlzLmxldmVsLmV4ZWN1dGVQYWxldHRlQXBpc09ubHkgJiYgdGhpcy5sZXZlbC5jb2RlRnVuY3Rpb25zLFxuICAgICAgZW5hYmxlRXZlbnRzOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKGV2ZW50TmFtZSk7XG4gICAgICBpZiAoZnVuYykge1xuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSA9XG4gICAgICAgICAgICBjb2RlZ2VuLmNyZWF0ZU5hdGl2ZUZ1bmN0aW9uRnJvbUludGVycHJldGVyRnVuY3Rpb24oZnVuYyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gW1xuICAgICAgd2luZG93LnA1LFxuICAgICAgd2luZG93LlNwcml0ZSxcbiAgICAgIHdpbmRvdy5DYW1lcmEsXG4gICAgICB3aW5kb3cuQW5pbWF0aW9uLFxuICAgICAgd2luZG93LnA1LlZlY3RvcixcbiAgICAgIHdpbmRvdy5wNS5Db2xvcixcbiAgICAgIHdpbmRvdy5wNS5JbWFnZSxcbiAgICAgIHdpbmRvdy5wNS5SZW5kZXJlcixcbiAgICAgIHdpbmRvdy5wNS5HcmFwaGljcyxcbiAgICAgIHdpbmRvdy5wNS5Gb250LFxuICAgICAgd2luZG93LnA1LlRhYmxlLFxuICAgICAgd2luZG93LnA1LlRhYmxlUm93LFxuICAgICAgd2luZG93LnA1LkVsZW1lbnRcbiAgICBdO1xuICAgIC8vIFRoZSBwNXBsYXkgR3JvdXAgb2JqZWN0IHNob3VsZCBiZSBjdXN0b20gbWFyc2hhbGxlZCwgYnV0IGl0cyBjb25zdHJ1Y3RvclxuICAgIC8vIGFjdHVhbGx5IGNyZWF0ZXMgYSBzdGFuZGFyZCBBcnJheSBpbnN0YW5jZSB3aXRoIGEgZmV3IGFkZGl0aW9uYWwgbWV0aG9kc1xuICAgIC8vIGFkZGVkLiBUaGUgY3VzdG9tTWFyc2hhbE1vZGlmaWVkT2JqZWN0TGlzdCBhbGxvd3MgdXMgdG8gc2V0IHVwIGFkZGl0aW9uYWxcbiAgICAvLyBvYmplY3QgdHlwZXMgdG8gYmUgY3VzdG9tIG1hcnNoYWxsZWQgYnkgbWF0Y2hpbmcgYm90aCB0aGUgaW5zdGFuY2UgdHlwZVxuICAgIC8vIGFuZCB0aGUgcHJlc2VuY2Ugb2YgYWRkaXRpb25hbCBtZXRob2QgbmFtZSBvbiB0aGUgb2JqZWN0LlxuICAgIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE1vZGlmaWVkT2JqZWN0TGlzdCA9IFsgeyBpbnN0YW5jZTogQXJyYXksIG1ldGhvZE5hbWU6ICdkcmF3JyB9IF07XG5cbiAgICAvLyBJbnNlcnQgZXZlcnl0aGluZyBvbiBwNSBhbmQgdGhlIEdyb3VwIGNvbnN0cnVjdG9yIGZyb20gcDVwbGF5IGludG8gdGhlXG4gICAgLy8gZ2xvYmFsIG5hbWVzcGFjZSBvZiB0aGUgaW50ZXJwcmV0ZXI6XG4gICAgZm9yICh2YXIgcHJvcCBpbiB0aGlzLnA1KSB7XG4gICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkocHJvcCwgdGhpcy5wNVtwcm9wXSwgdGhpcy5wNSk7XG4gICAgfVxuICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eSgnR3JvdXAnLCB3aW5kb3cuR3JvdXApO1xuICAgIC8vIEFuZCBhbHNvIGNyZWF0ZSBhICdwNScgb2JqZWN0IGluIHRoZSBnbG9iYWwgbmFtZXNwYWNlOlxuICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eSgncDUnLCB7IFZlY3Rvcjogd2luZG93LnA1LlZlY3RvciB9KTtcblxuICAgIC8qXG4gICAgaWYgKHRoaXMuY2hlY2tGb3JFZGl0Q29kZVByZUV4ZWN1dGlvbkZhaWx1cmUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMub25QdXp6bGVDb21wbGV0ZSgpO1xuICAgIH1cbiAgICAqL1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIHRoaXMudGlja0ludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoXy5iaW5kKHRoaXMub25UaWNrLCB0aGlzKSwgMzMpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpY2tDb3VudCsrO1xuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKHRoaXMudGlja0NvdW50ID09PSAxKTtcblxuICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIuc3RhcnRlZEhhbmRsaW5nRXZlbnRzICYmIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKSB7XG4gICAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCgpO1xuICAgIH1cbiAgfVxufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaGFuZGxlRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyLCBsaW5lTnVtYmVyKSB7XG4vKlxuICBvdXRwdXRFcnJvcihTdHJpbmcoZXJyKSwgRXJyb3JMZXZlbC5FUlJPUiwgbGluZU51bWJlcik7XG4gIFN0dWRpby5leGVjdXRpb25FcnJvciA9IHsgZXJyOiBlcnIsIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXIgfTtcblxuICAvLyBDYWxsIG9uUHV6emxlQ29tcGxldGUoKSBpZiBzeW50YXggZXJyb3Igb3IgYW55IHRpbWUgd2UncmUgbm90IG9uIGEgZnJlZXBsYXkgbGV2ZWw6XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIE1hcmsgcHJlRXhlY3V0aW9uRmFpbHVyZSBhbmQgdGVzdFJlc3VsdHMgaW1tZWRpYXRlbHkgc28gdGhhdCBhbiBlcnJvclxuICAgIC8vIG1lc3NhZ2UgYWx3YXlzIGFwcGVhcnMsIGV2ZW4gb24gZnJlZXBsYXk6XG4gICAgU3R1ZGlvLnByZUV4ZWN1dGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgIFN0dWRpby50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlNZTlRBWF9FUlJPUl9GQUlMO1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH0gZWxzZSBpZiAoIWxldmVsLmZyZWVQbGF5KSB7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuKi9cbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5sb2coZXJyKTtcbiAgdGhyb3cgZXJyO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBBUEkgY29tbWFuZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZUNtZCA9IGZ1bmN0aW9uIChpZCwgbmFtZSwgb3B0cykge1xuICBjb25zb2xlLmxvZyhcIkdhbWVMYWIgZXhlY3V0ZUNtZCBcIiArIG5hbWUpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIHRhc2tzIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIHVzZXIgcHJvZ3JhbSBpcyBmaW5pc2hlZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZmluaXNoRXhlY3V0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuaGlnaGxpZ2h0QmxvY2sobnVsbCk7XG4gIH1cbiAgdGhpcy5jaGVja0Fuc3dlcigpO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrKHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgLy8gZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IC8qIHx8IGxldmVsLmltcHJlc3NpdmUgKi8pLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgLy8gYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IG1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogbXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gbGV2ZWwuZnJlZVBsYXkgJiYgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICAvLyBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJkaXZHYW1lTGFiXCIgdGFiaW5kZXg9XCIxXCI+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHRiID0gYmxvY2tVdGlscy5jcmVhdGVUb29sYm94O1xudmFyIGJsb2NrT2ZUeXBlID0gYmxvY2tVdGlscy5ibG9ja09mVHlwZTtcbnZhciBjcmVhdGVDYXRlZ29yeSA9IGJsb2NrVXRpbHMuY3JlYXRlQ2F0ZWdvcnk7XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGV2ZWxzLnNhbmRib3ggPSAge1xuICBpZGVhbDogSW5maW5pdHksXG4gIHJlcXVpcmVkQmxvY2tzOiBbXG4gIF0sXG4gIHNjYWxlOiB7XG4gICAgJ3NuYXBSYWRpdXMnOiAyXG4gIH0sXG4gIHNvZnRCdXR0b25zOiBbXG4gICAgJ2xlZnRCdXR0b24nLFxuICAgICdyaWdodEJ1dHRvbicsXG4gICAgJ2Rvd25CdXR0b24nLFxuICAgICd1cEJ1dHRvbidcbiAgXSxcbiAgZnJlZVBsYXk6IHRydWUsXG4gIHRvb2xib3g6XG4gICAgdGIoYmxvY2tPZlR5cGUoJ2dhbWVsYWJfZm9vJykpLFxuICBzdGFydEJsb2NrczpcbiAgICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbn07XG5cbi8vIEJhc2UgY29uZmlnIGZvciBsZXZlbHMgY3JlYXRlZCB2aWEgbGV2ZWxidWlsZGVyXG5sZXZlbHMuY3VzdG9tID0gdXRpbHMuZXh0ZW5kKGxldmVscy5zYW5kYm94LCB7XG4gIGVkaXRDb2RlOiB0cnVlLFxuICBjb2RlRnVuY3Rpb25zOiB7XG4gICAgLy8gR2FtZSBMYWJcbiAgICBcInZhcl9sb2FkSW1hZ2VcIjogbnVsbCxcbiAgICBcImltYWdlXCI6IG51bGwsXG4gICAgXCJmaWxsXCI6IG51bGwsXG4gICAgXCJub0ZpbGxcIjogbnVsbCxcbiAgICBcInN0cm9rZVwiOiBudWxsLFxuICAgIFwibm9TdHJva2VcIjogbnVsbCxcbiAgICBcImFyY1wiOiBudWxsLFxuICAgIFwiZWxsaXBzZVwiOiBudWxsLFxuICAgIFwibGluZVwiOiBudWxsLFxuICAgIFwicG9pbnRcIjogbnVsbCxcbiAgICBcInJlY3RcIjogbnVsbCxcbiAgICBcInRyaWFuZ2xlXCI6IG51bGwsXG4gICAgXCJ0ZXh0XCI6IG51bGwsXG4gICAgXCJ0ZXh0QWxpZ25cIjogbnVsbCxcbiAgICBcInRleHRTaXplXCI6IG51bGwsXG4gICAgXCJkcmF3U3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYWxsU3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYmFja2dyb3VuZFwiOiBudWxsLFxuICAgIFwid2lkdGhcIjogbnVsbCxcbiAgICBcImhlaWdodFwiOiBudWxsLFxuICAgIFwiY2FtZXJhXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub25cIjogbnVsbCxcbiAgICBcImNhbWVyYS5vZmZcIjogbnVsbCxcbiAgICBcImNhbWVyYS5hY3RpdmVcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVhcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVlcIjogbnVsbCxcbiAgICBcImNhbWVyYS5wb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnpvb21cIjogbnVsbCxcblxuICAgIC8vIFNwcml0ZXNcbiAgICBcInZhcl9jcmVhdGVTcHJpdGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0RGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZW1vdmVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRBbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRJbWFnZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkVG9Hcm91cFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUltYWdlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYXR0cmFjdGlvblBvaW50XCI6IG51bGwsXG4gICAgXCJzcHJpdGUubGltaXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldENvbGxpZGVyXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0VmVsb2NpdHlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5oZWlnaHRcIjogbnVsbCxcbiAgICBcInNwcml0ZS53aWR0aFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmRlcHRoXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZnJpY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5pbW1vdmFibGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5saWZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubWFzc1wiOiBudWxsLFxuICAgIFwic3ByaXRlLm1heFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnBvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZW1vdmVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVzdGl0dXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGVUb0RpcmVjdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRpb25TcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNjYWxlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2hhcGVDb2xvclwiOiBudWxsLFxuICAgIFwic3ByaXRlLnRvdWNoaW5nXCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmVsb2NpdHkueFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnZlbG9jaXR5LnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS52aXNpYmxlXCI6IG51bGwsXG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgXCJ2YXJfbG9hZEFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiYW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhbmltLmNoYW5nZUZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLm5leHRGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5wcmV2aW91c0ZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmNsb25lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldEZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldExhc3RGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nb1RvRnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ucGxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5yZXdpbmRcIjogbnVsbCxcbiAgICBcImFuaW0uc3RvcFwiOiBudWxsLFxuICAgIFwiYW5pbS5mcmFtZUNoYW5nZWRcIjogbnVsbCxcbiAgICBcImFuaW0uZnJhbWVEZWxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5pbWFnZXNcIjogbnVsbCxcbiAgICBcImFuaW0ubG9vcGluZ1wiOiBudWxsLFxuICAgIFwiYW5pbS5wbGF5aW5nXCI6IG51bGwsXG4gICAgXCJhbmltLnZpc2libGVcIjogbnVsbCxcblxuICAgIC8vIEdyb3Vwc1xuICAgIFwiR3JvdXBcIjogbnVsbCxcbiAgICBcImdyb3VwLmFkZFwiOiBudWxsLFxuICAgIFwiZ3JvdXAucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJncm91cC5jbGVhclwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY29udGFpbnNcIjogbnVsbCxcbiAgICBcImdyb3VwLmdldFwiOiBudWxsLFxuICAgIFwiZ3JvdXAubWF4RGVwdGhcIjogbnVsbCxcbiAgICBcImdyb3VwLm1pbkRlcHRoXCI6IG51bGwsXG5cbiAgICAvLyBFdmVudHNcbiAgICBcImtleUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5XCI6IG51bGwsXG4gICAgXCJrZXlDb2RlXCI6IG51bGwsXG4gICAgXCJrZXlQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwia2V5VHlwZWRcIjogbnVsbCxcbiAgICBcImtleURvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnREb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50VXBcIjogbnVsbCxcbiAgICBcIm1vdXNlWFwiOiBudWxsLFxuICAgIFwibW91c2VZXCI6IG51bGwsXG4gICAgXCJwbW91c2VYXCI6IG51bGwsXG4gICAgXCJwbW91c2VZXCI6IG51bGwsXG4gICAgXCJtb3VzZUJ1dHRvblwiOiBudWxsLFxuICAgIFwibW91c2VJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlTW92ZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlRHJhZ2dlZFwiOiBudWxsLFxuICAgIFwibW91c2VQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZUNsaWNrZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlV2hlZWxcIjogbnVsbCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBcImZvckxvb3BfaV8wXzRcIjogbnVsbCxcbiAgICBcImlmQmxvY2tcIjogbnVsbCxcbiAgICBcImlmRWxzZUJsb2NrXCI6IG51bGwsXG4gICAgXCJ3aGlsZUJsb2NrXCI6IG51bGwsXG5cbiAgICAvLyBNYXRoXG4gICAgXCJhZGRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwic3VidHJhY3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibXVsdGlwbHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZGl2aWRlT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImluZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJhbmRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwib3JPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibm90T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInJhbmRvbU51bWJlcl9taW5fbWF4XCI6IG51bGwsXG4gICAgXCJtYXRoUm91bmRcIjogbnVsbCxcbiAgICBcIm1hdGhBYnNcIjogbnVsbCxcbiAgICBcIm1hdGhNYXhcIjogbnVsbCxcbiAgICBcIm1hdGhNaW5cIjogbnVsbCxcbiAgICBcIm1hdGhSYW5kb21cIjogbnVsbCxcblxuICAgIC8vIFZhcmlhYmxlc1xuICAgIFwiZGVjbGFyZUFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlTm9Bc3NpZ25feFwiOiBudWxsLFxuICAgIFwiYXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fc3RyX2hlbGxvX3dvcmxkXCI6IG51bGwsXG4gICAgXCJzdWJzdHJpbmdcIjogbnVsbCxcbiAgICBcImluZGV4T2ZcIjogbnVsbCxcbiAgICBcImluY2x1ZGVzXCI6IG51bGwsXG4gICAgXCJsZW5ndGhcIjogbnVsbCxcbiAgICBcInRvVXBwZXJDYXNlXCI6IG51bGwsXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9saXN0X2FiZFwiOiBudWxsLFxuICAgIFwibGlzdExlbmd0aFwiOiBudWxsLFxuXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgXCJmdW5jdGlvblBhcmFtc19ub25lXCI6IG51bGwsXG4gICAgXCJmdW5jdGlvblBhcmFtc19uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25fblwiOiBudWxsLFxuICAgIFwicmV0dXJuXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBbXG4gICAgJ2Z1bmN0aW9uIHNldHVwKCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJ2Z1bmN0aW9uIGRyYXcoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnJ10uam9pbignXFxuJyksXG59KTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLmN1c3RvbSwge1xufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuJyk7NDsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDcsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsxMDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcblxudmFyIENPTE9SX0xJR0hUX0dSRUVOID0gJyNEM0U5NjUnO1xudmFyIENPTE9SX0JMVUUgPSAnIzE5QzNFMSc7XG52YXIgQ09MT1JfUkVEID0gJyNGNzgxODMnO1xudmFyIENPTE9SX0NZQU4gPSAnIzRERDBFMSc7XG52YXIgQ09MT1JfWUVMTE9XID0gJyNGRkYxNzYnO1xudmFyIENPTE9SX1BJTksgPSAnI0Y1N0FDNic7XG52YXIgQ09MT1JfUFVSUExFID0gJyNCQjc3QzcnO1xudmFyIENPTE9SX0dSRUVOID0gJyM2OEQ5OTUnO1xudmFyIENPTE9SX1dISVRFID0gJyNGRkZGRkYnO1xudmFyIENPTE9SX0JMVUUgPSAnIzY0QjVGNic7XG52YXIgQ09MT1JfT1JBTkdFID0gJyNGRkI3NEQnO1xuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIC8vIEdhbWUgTGFiXG4gIHtmdW5jOiAnbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXJfbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIGJsb2NrUHJlZml4OiAndmFyIGltZyA9IGxvYWRJbWFnZScsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSwgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdpbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2ltYWdlJywnc3JjWCcsJ3NyY1knLCdzcmNXJywnc3JjSCcsJ3gnLCd5J10sIHBhcmFtczogW1wiaW1nXCIsIFwiMFwiLCBcIjBcIiwgXCJpbWcud2lkdGhcIiwgXCJpbWcuaGVpZ2h0XCIsIFwiMFwiLCBcIjBcIl0gfSxcbiAge2Z1bmM6ICdmaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCIneWVsbG93J1wiXSB9LFxuICB7ZnVuYzogJ25vRmlsbCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnc3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCInYmx1ZSdcIl0gfSxcbiAge2Z1bmM6ICdub1N0cm9rZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYXJjJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCcsJ3N0YXJ0Jywnc3RvcCddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiODAwXCIsIFwiODAwXCIsIFwiMFwiLCBcIkhBTEZfUElcIl0gfSxcbiAge2Z1bmM6ICdlbGxpcHNlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ2xpbmUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MiddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAncG9pbnQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiXSB9LFxuICB7ZnVuYzogJ3JlY3QnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMTAwXCIsIFwiMTAwXCIsIFwiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAndHJpYW5nbGUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MicsJ3gzJywneTMnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydzdHInLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiJ3RleHQnXCIsIFwiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCIxMDBcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0QWxpZ24nLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydob3JpeicsJ3ZlcnQnXSwgcGFyYW1zOiBbXCJDRU5URVJcIiwgXCJUT1BcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0U2l6ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3BpeGVscyddLCBwYXJhbXM6IFtcIjEyXCJdIH0sXG4gIHtmdW5jOiAnZHJhd1Nwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2FsbFNwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgYmxvY2s6ICdhbGxTcHJpdGVzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2JhY2tncm91bmQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibGFjaydcIl0gfSxcbiAge2Z1bmM6ICd3aWR0aCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnaGVpZ2h0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5vbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9mZicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLmFjdGl2ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEuem9vbScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG5cbiAgLy8gU3ByaXRlc1xuICB7ZnVuYzogJ2NyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAndmFyX2NyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIGJsb2NrUHJlZml4OiAndmFyIHNwcml0ZSA9IGNyZWF0ZVNwcml0ZScsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ2FuZ2xlJ10sIHBhcmFtczogW1wiMVwiLCBcIjkwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEFuaW1hdGlvbkxhYmVsJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXREaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RGlyZWN0aW9uJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRTcGVlZCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVtb3ZlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCcsJ2FuaW1hdGlvbiddLCBwYXJhbXM6IFsnXCJhbmltMVwiJywgXCJhbmltXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRJbWFnZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnLCdpbWFnZSddLCBwYXJhbXM6IFsnXCJpbWcxXCInLCBcImltZ1wiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZEltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRUb0dyb3VwJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydncm91cCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkVG9Hcm91cCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuY2hhbmdlQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJhbmltMVwiJ10sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VBbmltYXRpb24nIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNoYW5nZUltYWdlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJpbWcxXCInXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hdHRyYWN0aW9uUG9pbnQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywneCcsJ3knXSwgcGFyYW1zOiBbXCIxXCIsIFwiMjAwXCIsIFwiMjAwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYXR0cmFjdGlvblBvaW50JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5saW1pdFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydtYXgnXSwgcGFyYW1zOiBbXCIzXCJdLCBtb2RlT3B0aW9uTmFtZTogJyoubGltaXRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0Q29sbGlkZXInLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3R5cGUnLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogWydcInJlY3RhbmdsZVwiJywgXCIwXCIsIFwiMFwiLCBcIjIwXCIsIFwiMjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRDb2xsaWRlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0VmVsb2NpdHknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjFcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRWZWxvY2l0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaGVpZ2h0JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmhlaWdodCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUud2lkdGgnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoud2lkdGgnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5hbmltYXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmRlcHRoJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmRlcHRoJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5mcmljdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmljdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaW1tb3ZhYmxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmltbW92YWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubGlmZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5saWZlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5tYXNzJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1hc3MnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLm1heFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1heFNwZWVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5wb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi54JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNQb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLngnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi55JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZW1vdmVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlc3RpdHV0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlc3RpdHV0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGVUb0RpcmVjdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGVUb0RpcmVjdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0aW9uU3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb25TcGVlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2NhbGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2NhbGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNoYXBlQ29sb3InLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2hhcGVDb2xvcicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudG91Y2hpbmcnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoudG91Y2hpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZlbG9jaXR5JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eS54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLngnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5LnknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmlzaWJsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBwcm9wZXJ0aWVzOlxuY2FtZXJhXG5jb2xsaWRlciAtIFVTRUZVTD8gKG1hcnNoYWwgQUFCQiBhbmQgQ2lyY2xlQ29sbGlkZXIpXG5kZWJ1Z1xuZ3JvdXBzXG5tb3VzZUFjdGl2ZVxubW91c2VJc092ZXJcbm1vdXNlSXNQcmVzc2VkXG5vcmlnaW5hbEhlaWdodFxub3JpZ2luYWxXaWR0aFxuKi9cblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBtZXRob2RzOlxuYWRkSW1hZ2UobGFiZWxpbWcpIC0gMSBwYXJhbSB2ZXJzaW9uOiAoc2V0cyBsYWJlbCB0byBcIm5vcm1hbFwiIGF1dG9tYXRpY2FsbHkpXG5ib3VuY2UodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmNvbGxpZGUodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmRpc3BsYWNlKHRhcmdldGNhbGxiYWNrKSAtIENBTExCQUNLXG5kcmF3KCkgLSBPVkVSUklERSBhbmQvb3IgVVNFRlVMP1xubWlycm9yWChkaXIpIC0gVVNFRlVMP1xubWlycm9yWShkaXIpIC0gVVNFRlVMP1xub3ZlcmxhcCh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xub3ZlcmxhcFBpeGVsKHBvaW50WHBvaW50WSkgLSBVU0VGVUw/XG5vdmVybGFwUG9pbnQocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbnVwZGF0ZSgpIC0gVVNFRlVMP1xuKi9cblxuICAvLyBBbmltYXRpb25zXG4gIHtmdW5jOiAnbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsndXJsMScsJ3VybDInXSwgcGFyYW1zOiBbJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMS5wbmdcIicsICdcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDIucG5nXCInXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXJfbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIGJsb2NrUHJlZml4OiAndmFyIGFuaW0gPSBsb2FkQW5pbWF0aW9uJywgcGFsZXR0ZVBhcmFtczogWyd1cmwxJywndXJsMiddLCBwYXJhbXM6IFsnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAxLnBuZ1wiJywgJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMi5wbmdcIiddLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ2FuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnYW5pbWF0aW9uJywneCcsJ3knXSwgcGFyYW1zOiBbXCJhbmltXCIsIFwiNTBcIiwgXCI1MFwiXSB9LFxuICB7ZnVuYzogJ2FuaW0uY2hhbmdlRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2ZyYW1lJ10sIHBhcmFtczogW1wiMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ubmV4dEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLm5leHRGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLnByZXZpb3VzRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLmNsb25lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmNsb25lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ2V0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RnJhbWUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nZXRMYXN0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0TGFzdEZyYW1lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ29Ub0ZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydmcmFtZSddLCBwYXJhbXM6IFtcIjFcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5nb1RvRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5wbGF5JywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnBsYXknIH0sXG4gIHtmdW5jOiAnYW5pbS5yZXdpbmQnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmV3aW5kJyB9LFxuICB7ZnVuYzogJ2FuaW0uc3RvcCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5zdG9wJyB9LFxuICB7ZnVuYzogJ2FuaW0uZnJhbWVDaGFuZ2VkJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmZyYW1lQ2hhbmdlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmZyYW1lRGVsYXknLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJhbWVEZWxheScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmltYWdlcycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5pbWFnZXMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5sb29waW5nJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmxvb3BpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5wbGF5aW5nJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnBsYXlpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS52aXNpYmxlJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZpc2libGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgQW5pbWF0aW9uIG1ldGhvZHM6XG5kcmF3KHh5KVxuZ2V0RnJhbWVJbWFnZSgpXG5nZXRIZWlnaHQoKVxuZ2V0SW1hZ2VBdChmcmFtZSlcbmdldFdpZHRoKClcbiovXG5cbiAgLy8gR3JvdXBzXG4gIHtmdW5jOiAnR3JvdXAnLCBibG9ja1ByZWZpeDogJ3ZhciBncm91cCA9IG5ldyBHcm91cCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdncm91cC5hZGQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkJyB9LFxuICB7ZnVuYzogJ2dyb3VwLnJlbW92ZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAuY2xlYXInLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5jbGVhcicgfSxcbiAge2Z1bmM6ICdncm91cC5jb250YWlucycsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jb250YWlucycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5nZXQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnaSddLCBwYXJhbXM6IFtcIjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5nZXQnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAubWF4RGVwdGgnLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhEZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5taW5EZXB0aCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1pbkRlcHRoJywgdHlwZTogJ3ZhbHVlJyB9LFxuXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgR3JvdXAgbWV0aG9kczpcbmJvdW5jZSh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuZGlzcGxhY2UodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmRyYXcoKSAtIFVTRUZVTD9cbm92ZXJsYXAodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbiovXG5cbiAgLy8gRXZlbnRzXG4gIHtmdW5jOiAna2V5SXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5JywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5Q29kZScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleURvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudERvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudFVwJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5UmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlUeXBlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VCdXR0b24nLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlTW92ZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VEcmFnZ2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VDbGlja2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVdoZWVsJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuXG4gIC8vIE1hdGhcbiAge2Z1bmM6ICdzaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2FuZ2xlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2NvcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYW5nbGUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAndGFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhbmdsZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhc2luJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhY29zJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhdGFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhdGFuMicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsneScsJ3gnXSwgcGFyYW1zOiBbXCIxMFwiLCBcIjEwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZGVncmVlcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsncmFkaWFucyddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyYWRpYW5zJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydkZWdyZWVzJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuZ2xlTW9kZScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbW9kZSddLCBwYXJhbXM6IFtcIkRFR1JFRVNcIl0gfSxcbiAge2Z1bmM6ICdyYW5kb20nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21pbicsJ21heCddLCBwYXJhbXM6IFtcIjFcIiwgXCI1XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncmFuZG9tR2F1c3NpYW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21lYW4nLCdzZCddLCBwYXJhbXM6IFtcIjBcIiwgXCIxNVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JhbmRvbVNlZWQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3NlZWQnXSwgcGFyYW1zOiBbXCI5OVwiXSB9LFxuICB7ZnVuYzogJ2FicycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiLTFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjZWlsJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIwLjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjb25zdHJhaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bScsJ2xvdycsJ2hpZ2gnXSwgcGFyYW1zOiBbXCIxLjFcIiwgXCIwXCIsIFwiMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2Rpc3QnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCIxMDBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdleHAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdmbG9vcicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMC45XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbGVycCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnc3RhcnQnLCdzdG9wJywnYW10J10sIHBhcmFtczogW1wiMFwiLCBcIjEwMFwiLCBcIjAuMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2xvZycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21hZycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYScsJ2InXSwgcGFyYW1zOiBbXCIxMDBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtYXAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJywnc3RhcnQxJywnc3RvcDEnLCdzdGFydDInLCdzdG9wJ10sIHBhcmFtczogW1wiMC45XCIsIFwiMFwiLCBcIjFcIiwgXCIwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWF4JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyduMScsJ24yJ10sIHBhcmFtczogW1wiMVwiLFwiM1wiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21pbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbjEnLCduMiddLCBwYXJhbXM6IFtcIjFcIiwgXCIzXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbm9ybScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnLCdzdGFydCcsJ3N0b3AnXSwgcGFyYW1zOiBbXCI5MFwiLCBcIjBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdwb3cnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ24nLCdlJ10sIHBhcmFtczogW1wiMTBcIiwgXCIyXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncm91bmQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjAuOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3NxJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIyXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3FydCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuXG4gIC8vIEFkdmFuY2VkXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnR2FtZSBMYWInOiB7XG4gICAgY29sb3I6ICd5ZWxsb3cnLFxuICAgIHJnYjogQ09MT1JfWUVMTE9XLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgU3ByaXRlczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFuaW1hdGlvbnM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBHcm91cHM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEYXRhOiB7XG4gICAgY29sb3I6ICdsaWdodGdyZWVuJyxcbiAgICByZ2I6IENPTE9SX0xJR0hUX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRHJhd2luZzoge1xuICAgIGNvbG9yOiAnY3lhbicsXG4gICAgcmdiOiBDT0xPUl9DWUFOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRXZlbnRzOiB7XG4gICAgY29sb3I6ICdncmVlbicsXG4gICAgcmdiOiBDT0xPUl9HUkVFTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFkdmFuY2VkOiB7XG4gICAgY29sb3I6ICdibHVlJyxcbiAgICByZ2I6IENPTE9SX0JMVUUsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMuYWRkaXRpb25hbFByZWRlZlZhbHVlcyA9IFtcbiAgJ1AyRCcsICdXRUJHTCcsICdBUlJPVycsICdDUk9TUycsICdIQU5EJywgJ01PVkUnLFxuICAnVEVYVCcsICdXQUlUJywgJ0hBTEZfUEknLCAnUEknLCAnUVVBUlRFUl9QSScsICdUQVUnLCAnVFdPX1BJJywgJ0RFR1JFRVMnLFxuICAnUkFESUFOUycsICdDT1JORVInLCAnQ09STkVSUycsICdSQURJVVMnLCAnUklHSFQnLCAnTEVGVCcsICdDRU5URVInLCAnVE9QJyxcbiAgJ0JPVFRPTScsICdCQVNFTElORScsICdQT0lOVFMnLCAnTElORVMnLCAnVFJJQU5HTEVTJywgJ1RSSUFOR0xFX0ZBTicsXG4gICdUUklBTkdMRV9TVFJJUCcsICdRVUFEUycsICdRVUFEX1NUUklQJywgJ0NMT1NFJywgJ09QRU4nLCAnQ0hPUkQnLCAnUElFJyxcbiAgJ1BST0pFQ1QnLCAnU1FVQVJFJywgJ1JPVU5EJywgJ0JFVkVMJywgJ01JVEVSJywgJ1JHQicsICdIU0InLCAnSFNMJywgJ0FVVE8nLFxuICAnQUxUJywgJ0JBQ0tTUEFDRScsICdDT05UUk9MJywgJ0RFTEVURScsICdET1dOX0FSUk9XJywgJ0VOVEVSJywgJ0VTQ0FQRScsXG4gICdMRUZUX0FSUk9XJywgJ09QVElPTicsICdSRVRVUk4nLCAnUklHSFRfQVJST1cnLCAnU0hJRlQnLCAnVEFCJywgJ1VQX0FSUk9XJyxcbiAgJ0JMRU5EJywgJ0FERCcsICdEQVJLRVNUJywgJ0xJR0hURVNUJywgJ0RJRkZFUkVOQ0UnLCAnRVhDTFVTSU9OJyxcbiAgJ01VTFRJUExZJywgJ1NDUkVFTicsICdSRVBMQUNFJywgJ09WRVJMQVknLCAnSEFSRF9MSUdIVCcsICdTT0ZUX0xJR0hUJyxcbiAgJ0RPREdFJywgJ0JVUk4nLCAnVEhSRVNIT0xEJywgJ0dSQVknLCAnT1BBUVVFJywgJ0lOVkVSVCcsICdQT1NURVJJWkUnLFxuICAnRElMQVRFJywgJ0VST0RFJywgJ0JMVVInLCAnTk9STUFMJywgJ0lUQUxJQycsICdCT0xEJywgJ19ERUZBVUxUX1RFWFRfRklMTCcsXG4gICdfREVGQVVMVF9MRUFETVVMVCcsICdfQ1RYX01JRERMRScsICdMSU5FQVInLCAnUVVBRFJBVElDJywgJ0JFWklFUicsXG4gICdDVVJWRScsICdfREVGQVVMVF9TVFJPS0UnLCAnX0RFRkFVTFRfRklMTCdcbl07XG5tb2R1bGUuZXhwb3J0cy5zaG93UGFyYW1Ecm9wZG93bnMgPSB0cnVlO1xuIiwiLy8gbG9jYWxlIGZvciBnYW1lbGFiXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmdhbWVsYWJfbG9jYWxlO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuJyk7MjsgLyogR2FtZUxhYiAqLyA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwic29mdC1idXR0b25zXCIgY2xhc3M9XCJzb2Z0LWJ1dHRvbnMtbm9uZVwiPlxcbiAgPGJ1dHRvbiBpZD1cImxlZnRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDYsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJsZWZ0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg5LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwicmlnaHQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwidXBCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDEyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwidXAtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwiZG93bkJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJkb3duLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbjwvZGl2PlxcblxcbicpOzE5OyBpZiAoZmluaXNoQnV0dG9uKSB7IDsgYnVmLnB1c2goJ1xcbiAgPGRpdiBpZD1cInNoYXJlLWNlbGxcIiBjbGFzcz1cInNoYXJlLWNlbGwtbm9uZVwiPlxcbiAgICA8YnV0dG9uIGlkPVwiZmluaXNoQnV0dG9uXCIgY2xhc3M9XCJzaGFyZVwiPlxcbiAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDIyLCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MjU7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQobnVsbCwgJ2ZvbycpO1xufTtcbiIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG4vKlxuICogQWxsIEFQSXMgZGlzYWJsZWQgZm9yIG5vdy4gcDUvcDVwbGF5IGlzIHRoZSBvbmx5IGV4cG9zZWQgQVBJLiBJZiB3ZSB3YW50IHRvXG4gKiBleHBvc2Ugb3RoZXIgdG9wLWxldmVsIEFQSXMsIHRoZXkgc2hvdWxkIGJlIGluY2x1ZGVkIGhlcmUgYXMgc2hvd24gaW4gdGhlc2VcbiAqIGNvbW1lbnRlZCBmdW5jdGlvbnNcbiAqXG5cbmV4cG9ydHMucmFuZG9tID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YXIga2V5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsdWVzLmxlbmd0aCk7XG4gIHJldHVybiB2YWx1ZXNba2V5XTtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKGlkKSB7XG4gIEdhbWVMYWIuZXhlY3V0ZUNtZChpZCwgJ2ZvbycpO1xufTtcbiovXG4iXX0=
