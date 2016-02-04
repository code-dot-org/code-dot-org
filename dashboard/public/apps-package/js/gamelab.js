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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVks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RSxDQUFDO0FBQzNFLFdBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDOztBQUVwRSxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEQsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs7QUFFeEMsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDOzs7QUFHeEMsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7O0FBRzNFLFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7OztBQUc3RSxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7O0FBRzlELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdELFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBRTlEOztBQUVELFFBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFD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QU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQ3JGLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQ3ZDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQ3JGLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQ3pDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUN2SSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUNoSCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3hGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3pILEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ3BGLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzVDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFF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LEdBQUcsWUFBWTtBQUN4QixTQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNqQyxDQUFDOzs7OztBQ1RGLElBQUksT0FBTyxDQUFDOzs7QUFHWixPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsT0FBTyxFQUFFO0FBQ3pDLFNBQU8sR0FBRyxPQUFPLENBQUM7Q0FDbkIsQ0FBQzs7QUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQ2pDLE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxHQUFHLEdBQUcsVUFBVSxFQUFFLEVBQUU7QUFDMUIsU0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDL0IsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LmdhbWVsYWJNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICB2YXIgZ2FtZWxhYiA9IG5ldyBHYW1lTGFiKCk7XG5cbiAgZ2FtZWxhYi5pbmplY3RTdHVkaW9BcHAoc3R1ZGlvQXBwKTtcbiAgYXBwTWFpbihnYW1lbGFiLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiIsInZhciBza2luQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG5cbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLyoqXG4gKiBDRE8gQXBwOiBHYW1lTGFiXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgQ29kZS5vcmdcbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcblxuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICAvLyBCbG9jayBkZWZpbml0aW9ucy5cbiAgYmxvY2tseS5CbG9ja3MuZ2FtZWxhYl9mb28gPSB7XG4gICAgLy8gQmxvY2sgZm9yIGZvby5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZm9vKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZm9vVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmdhbWVsYWJfZm9vID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGZvby5cbiAgICByZXR1cm4gJ0dhbWVMYWIuZm9vKCk7XFxuJztcbiAgfTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgYXBpSmF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgZHJvcGxldENvbmZpZyA9IHJlcXVpcmUoJy4vZHJvcGxldENvbmZpZycpO1xudmFyIEpTSW50ZXJwcmV0ZXIgPSByZXF1aXJlKCcuLi9KU0ludGVycHJldGVyJyk7XG52YXIgSnNJbnRlcnByZXRlckxvZ2dlciA9IHJlcXVpcmUoJy4uL0pzSW50ZXJwcmV0ZXJMb2dnZXInKTtcblxudmFyIE1BWF9JTlRFUlBSRVRFUl9TVEVQU19QRVJfVElDSyA9IDUwMDAwMDtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYiBjbGFzc1xuICovXG52YXIgR2FtZUxhYiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG5cbiAgLyoqIEB0eXBlIHtTdHVkaW9BcHB9ICovXG4gIHRoaXMuc3R1ZGlvQXBwXyA9IG51bGw7XG5cbiAgLyoqIEB0eXBlIHtKU0ludGVycHJldGVyfSAqL1xuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBudWxsO1xuXG4gIC8qKiBAcHJpdmF0ZSB7SnNJbnRlcnByZXRlckxvZ2dlcn0gKi9cbiAgdGhpcy5jb25zb2xlTG9nZ2VyXyA9IG51bGw7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHRoaXMuR2xvYmFscyA9IHt9O1xuICB0aGlzLmN1cnJlbnRDbWRRdWV1ZSA9IG51bGw7XG4gIHRoaXMucDUgPSBudWxsO1xuICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG4gIHRoaXMucDVldmVudE5hbWVzID0gW1xuICAgICdtb3VzZU1vdmVkJywgJ21vdXNlRHJhZ2dlZCcsICdtb3VzZVByZXNzZWQnLCAnbW91c2VSZWxlYXNlZCcsXG4gICAgJ21vdXNlQ2xpY2tlZCcsICdtb3VzZVdoZWVsJyxcbiAgICAna2V5UHJlc3NlZCcsICdrZXlSZWxlYXNlZCcsICdrZXlUeXBlZCdcbiAgXTtcbiAgdGhpcy5wNXNwZWNpYWxGdW5jdGlvbnMgPSBbJ2RyYXcnLCAnc2V0dXAnXS5jb25jYXQodGhpcy5wNWV2ZW50TmFtZXMpO1xuXG4gIHRoaXMuYXBpID0gYXBpO1xuICB0aGlzLmFwaS5pbmplY3RHYW1lTGFiKHRoaXMpO1xuICB0aGlzLmFwaUpTID0gYXBpSmF2YXNjcmlwdDtcbiAgdGhpcy5hcGlKUy5pbmplY3RHYW1lTGFiKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTGFiO1xuXG4vKipcbiAqIEluamVjdCB0aGUgc3R1ZGlvQXBwIHNpbmdsZXRvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuaW5qZWN0U3R1ZGlvQXBwID0gZnVuY3Rpb24gKHN0dWRpb0FwcCkge1xuICB0aGlzLnN0dWRpb0FwcF8gPSBzdHVkaW9BcHA7XG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCA9IF8uYmluZCh0aGlzLnJlc2V0LCB0aGlzKTtcbiAgdGhpcy5zdHVkaW9BcHBfLnJ1bkJ1dHRvbkNsaWNrID0gXy5iaW5kKHRoaXMucnVuQnV0dG9uQ2xpY2ssIHRoaXMpO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xufTtcblxuLy8gRm9yIHByb3h5aW5nIG5vbi1odHRwcyBhc3NldHNcbnZhciBNRURJQV9QUk9YWSA9ICcvLycgKyBsb2NhdGlvbi5ob3N0ICsgJy9tZWRpYT91PSc7XG5cbi8vIHN0YXJ0cyB3aXRoIGh0dHAgb3IgaHR0cHNcbnZhciBBQlNPTFVURV9SRUdFWFAgPSBuZXcgUmVnRXhwKCdeaHR0cHM/Oi8vJywgJ2knKTtcblxuR2FtZUxhYi5iYXNlUDVsb2FkSW1hZ2UgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhpcyBHYW1lTGFiIGluc3RhbmNlLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgaWYgKCF0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lTGFiIHJlcXVpcmVzIGEgU3R1ZGlvQXBwXCIpO1xuICB9XG5cbiAgdGhpcy5za2luID0gY29uZmlnLnNraW47XG4gIHRoaXMubGV2ZWwgPSBjb25maWcubGV2ZWw7XG4gIHRoaXMuY29uc29sZUxvZ2dlcl8gPSBuZXcgSnNJbnRlcnByZXRlckxvZ2dlcih3aW5kb3cuY29uc29sZSk7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5zZXR1cEdsb2JhbE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZvciBuby1za2V0Y2ggR2xvYmFsIG1vZGVcbiAgICAgKi9cbiAgICB2YXIgcDUgPSB3aW5kb3cucDU7XG5cbiAgICB0aGlzLl9pc0dsb2JhbCA9IHRydWU7XG4gICAgLy8gTG9vcCB0aHJvdWdoIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZSBhbmQgYXR0YWNoIHRoZW0gdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAgaW4gcDUucHJvdG90eXBlKSB7XG4gICAgICBpZih0eXBlb2YgcDUucHJvdG90eXBlW3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBldiA9IHAuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShldikpIHtcbiAgICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBdHRhY2ggaXRzIHByb3BlcnRpZXMgdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAyIGluIHRoaXMpIHtcbiAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KHAyKSkge1xuICAgICAgICB3aW5kb3dbcDJdID0gdGhpc1twMl07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHA1LmxvYWRJbWFnZSBzbyB3ZSBjYW4gbW9kaWZ5IHRoZSBVUkwgcGF0aCBwYXJhbVxuICBpZiAoIUdhbWVMYWIuYmFzZVA1bG9hZEltYWdlKSB7XG4gICAgR2FtZUxhYi5iYXNlUDVsb2FkSW1hZ2UgPSB3aW5kb3cucDUucHJvdG90eXBlLmxvYWRJbWFnZTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uIChwYXRoLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgaWYgKEFCU09MVVRFX1JFR0VYUC50ZXN0KHBhdGgpKSB7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gYmUgYWJsZSB0byBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgb3VyIGZpbGVuYW1lIGNvbnRhaW5zIGFcbiAgICAgICAgLy8gc3BhY2UsIGkuZS4gXCJ3d3cuZXhhbXBsZS5jb20vaW1hZ2VzL2ZvbyBiYXIucG5nXCIsIGV2ZW4gdGhvdWdoIHRoaXMgaXMgYVxuICAgICAgICAvLyB0ZWNobmljYWxseSBpbnZhbGlkIFVSTC4gZW5jb2RlVVJJQ29tcG9uZW50IHdpbGwgcmVwbGFjZSBzcGFjZSB3aXRoICUyMFxuICAgICAgICAvLyBmb3IgdXMsIGJ1dCBhcyBzb29uIGFzIGl0J3MgZGVjb2RlZCwgd2UgYWdhaW4gaGF2ZSBhbiBpbnZhbGlkIFVSTC4gRm9yXG4gICAgICAgIC8vIHRoaXMgcmVhc29uIHdlIGZpcnN0IHJlcGxhY2Ugc3BhY2Ugd2l0aCAlMjAgb3Vyc2VsdmVzLCBzdWNoIHRoYXQgd2Ugbm93XG4gICAgICAgIC8vIGhhdmUgYSB2YWxpZCBVUkwsIGFuZCB0aGVuIGNhbGwgZW5jb2RlVVJJQ29tcG9uZW50IG9uIHRoZSByZXN1bHQuXG4gICAgICAgIHBhdGggPSBNRURJQV9QUk9YWSArIGVuY29kZVVSSUNvbXBvbmVudChwYXRoLnJlcGxhY2UoLyAvZywgJyUyMCcpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBHYW1lTGFiLmJhc2VQNWxvYWRJbWFnZShwYXRoLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbmZpZy5kcm9wbGV0Q29uZmlnID0gZHJvcGxldENvbmZpZztcbiAgY29uZmlnLmFwcE1zZyA9IG1zZztcblxuICB2YXIgc2hvd0ZpbmlzaEJ1dHRvbiA9ICF0aGlzLmxldmVsLmlzUHJvamVjdExldmVsO1xuICB2YXIgZmluaXNoQnV0dG9uRmlyc3RMaW5lID0gXy5pc0VtcHR5KHRoaXMubGV2ZWwuc29mdEJ1dHRvbnMpO1xuICB2YXIgZmlyc3RDb250cm9sc1JvdyA9IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246IGZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IHJlcXVpcmUoJy4vZXh0cmFDb250cm9sUm93cy5odG1sLmVqcycpKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGZpbmlzaEJ1dHRvbjogIWZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuXG4gIGNvbmZpZy5odG1sID0gcGFnZSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBkYXRhOiB7XG4gICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogZmlyc3RDb250cm9sc1JvdyxcbiAgICAgIGV4dHJhQ29udHJvbFJvd3M6IGV4dHJhQ29udHJvbFJvd3MsXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IF8uYmluZCh0aGlzLmxvYWRBdWRpb18sIHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBfLmJpbmQodGhpcy5hZnRlckluamVjdF8sIHRoaXMsIGNvbmZpZyk7XG5cbiAgLy8gU3RvcmUgcDVzcGVjaWFsRnVuY3Rpb25zIGluIHRoZSB1bnVzZWRDb25maWcgYXJyYXkgc28gd2UgZG9uJ3QgZ2l2ZSB3YXJuaW5nc1xuICAvLyBhYm91dCB0aGVzZSBmdW5jdGlvbnMgbm90IGJlaW5nIGNhbGxlZDpcbiAgY29uZmlnLnVudXNlZENvbmZpZyA9IHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5pbml0KGNvbmZpZyk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5sb2FkQXVkaW9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xufTtcblxuLyoqXG4gKiBDb2RlIGNhbGxlZCBhZnRlciB0aGUgYmxvY2tseSBkaXYgKyBibG9ja2x5IGNvcmUgaXMgaW5qZWN0ZWQgaW50byB0aGUgZG9jdW1lbnRcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuYWZ0ZXJJbmplY3RfID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ0dhbWVMYWIsY29kZScpO1xuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG5cbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICBkaXZHYW1lTGFiLnN0eWxlLndpZHRoID0gJzQwMHB4JztcbiAgZGl2R2FtZUxhYi5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuXG59O1xuXG5cbi8qKlxuICogUmVzZXQgR2FtZUxhYiB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlIFJlcXVpcmVkIGJ5IHRoZSBBUEkgYnV0IGlnbm9yZWQgYnkgdGhpc1xuICogICAgIGltcGxlbWVudGF0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChpZ25vcmUpIHtcblxuICB0aGlzLmV2ZW50SGFuZGxlcnMgPSB7fTtcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aWNrSW50ZXJ2YWxJZCk7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG5cbiAgLypcbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICB3aGlsZSAoZGl2R2FtZUxhYi5maXJzdENoaWxkKSB7XG4gICAgZGl2R2FtZUxhYi5yZW1vdmVDaGlsZChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpO1xuICB9XG4gICovXG5cbiAgaWYgKHRoaXMucDUpIHtcbiAgICB0aGlzLnA1LnJlbW92ZSgpO1xuICAgIHRoaXMucDUgPSBudWxsO1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcblxuICAgIC8vIENsZWFyIHJlZ2lzdGVyZWQgbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlOlxuICAgIGZvciAodmFyIG1lbWJlciBpbiB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcykge1xuICAgICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzW21lbWJlcl07XG4gICAgfVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzID0geyBwcmU6IFtdLCBwb3N0OiBbXSwgcmVtb3ZlOiBbXSB9O1xuICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkUHJlbG9hZE1ldGhvZHMuZ2FtZWxhYlByZWxvYWQ7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmFsbFNwcml0ZXMgPSBuZXcgd2luZG93Lkdyb3VwKCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5zcHJpdGVVcGRhdGUgPSB0cnVlO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEgPSBuZXcgd2luZG93LkNhbWVyYSgwLCAwLCAxKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYS5pbml0ID0gZmFsc2U7XG5cbiAgICAvL2tleWJvYXJkIGlucHV0XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS5yZWFkUHJlc3Nlcyk7XG5cbiAgICAvL2F1dG9tYXRpYyBzcHJpdGUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS51cGRhdGVTcHJpdGVzKTtcblxuICAgIC8vcXVhZHRyZWUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy51cGRhdGVUcmVlKTtcblxuICAgIC8vY2FtZXJhIHB1c2ggYW5kIHBvcFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5jYW1lcmFQdXNoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LmNhbWVyYVBvcCk7XG5cbiAgfVxuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuZ2FtZWxhYlByZWxvYWQgPSBfLmJpbmQoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gd2luZG93LnA1Ll9nZXREZWNyZW1lbnRQcmVsb2FkKGFyZ3VtZW50cywgdGhpcy5wNSk7XG4gIH0sIHRoaXMpO1xuXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8uZGV0YWNoKCk7XG5cbiAgLy8gRGlzY2FyZCB0aGUgaW50ZXJwcmV0ZXIuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZGVpbml0aWFsaXplKCk7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgfVxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBHYW1lTGFiOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBSZXNldCBhbGwgc3RhdGUuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJlxuICAgICAgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG5ldyB3aW5kb3cucDUoXy5iaW5kKGZ1bmN0aW9uIChwNW9iaikge1xuICAgICAgdGhpcy5wNSA9IHA1b2JqO1xuXG4gICAgICBwNW9iai5yZWdpc3RlclByZWxvYWRNZXRob2QoJ2dhbWVsYWJQcmVsb2FkJywgd2luZG93LnA1LnByb3RvdHlwZSk7XG5cbiAgICAgIHA1b2JqLnNldHVwR2xvYmFsTW9kZSgpO1xuXG4gICAgICB3aW5kb3cucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ2FsbCBvdXIgZ2FtZWxhYlByZWxvYWQoKSB0byBmb3JjZSBfc3RhcnQvX3NldHVwIHRvIHdhaXQuXG4gICAgICAgIHdpbmRvdy5nYW1lbGFiUHJlbG9hZCgpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5zZXR1cCA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHA1b2JqLmNyZWF0ZUNhbnZhcyg0MDAsIDQwMCk7XG4gICAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzLnNldHVwKSB7XG4gICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLnNldHVwLmFwcGx5KG51bGwpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHdpbmRvdy5kcmF3ID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdykge1xuICAgICAgICAgIHZhciBzdGFydFRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLmRyYXcuYXBwbHkobnVsbCk7XG4gICAgICAgICAgdmFyIHRpbWVFbGFwc2VkID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICQoJyNidWJibGUnKS50ZXh0KHRpbWVFbGFwc2VkLnRvRml4ZWQoMikgKyAnIG1zJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgICAgdGhpcy5wNWV2ZW50TmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgIHdpbmRvd1tldmVudE5hbWVdID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXS5hcHBseShudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSwgdGhpcyksICdkaXZHYW1lTGFiJyk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgICBzdHVkaW9BcHA6IHRoaXMuc3R1ZGlvQXBwXyxcbiAgICAgIG1heEludGVycHJldGVyU3RlcHNQZXJUaWNrOiBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0ssXG4gICAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczoge1xuICAgICAgICB3aWR0aDogdGhpcy5wNSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICBkaXNwbGF5V2lkdGg6IHRoaXMucDUsXG4gICAgICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIHdpbmRvd1dpZHRoOiB0aGlzLnA1LFxuICAgICAgICB3aW5kb3dIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgICAgIGZyYW1lQ291bnQ6IHRoaXMucDUsXG4gICAgICAgIGtleUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAga2V5OiB0aGlzLnA1LFxuICAgICAgICBrZXlDb2RlOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWDogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgICAgICB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlQnV0dG9uOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFg6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoZXM6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoSXNEb3duOiB0aGlzLnA1LFxuICAgICAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgICAgIGRldmljZU9yaWVudGF0aW9uOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwQWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgICAgIHBBY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICByb3RhdGlvblg6IHRoaXMucDUsXG4gICAgICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgcm90YXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25aOiB0aGlzLnA1XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLm9uRXhlY3V0aW9uRXJyb3IucmVnaXN0ZXIodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmNvbnNvbGVMb2dnZXJfLmF0dGFjaFRvKHRoaXMuSlNJbnRlcnByZXRlcik7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLnBhcnNlKHtcbiAgICAgIGNvZGU6IHRoaXMuc3R1ZGlvQXBwXy5nZXRDb2RlKCksXG4gICAgICBibG9ja3M6IGRyb3BsZXRDb25maWcuYmxvY2tzLFxuICAgICAgYmxvY2tGaWx0ZXI6IHRoaXMubGV2ZWwuZXhlY3V0ZVBhbGV0dGVBcGlzT25seSAmJiB0aGlzLmxldmVsLmNvZGVGdW5jdGlvbnMsXG4gICAgICBlbmFibGVFdmVudHM6IHRydWVcbiAgICB9KTtcbiAgICBpZiAoIXRoaXMuSlNJbnRlcnByZXRlci5pbml0aWFsaXplZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wNXNwZWNpYWxGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IHRoaXMuSlNJbnRlcnByZXRlci5maW5kR2xvYmFsRnVuY3Rpb24oZXZlbnROYW1lKTtcbiAgICAgIGlmIChmdW5jKSB7XG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdID1cbiAgICAgICAgICAgIGNvZGVnZW4uY3JlYXRlTmF0aXZlRnVuY3Rpb25Gcm9tSW50ZXJwcmV0ZXJGdW5jdGlvbihmdW5jKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSBbXG4gICAgICB3aW5kb3cucDUsXG4gICAgICB3aW5kb3cuU3ByaXRlLFxuICAgICAgd2luZG93LkNhbWVyYSxcbiAgICAgIHdpbmRvdy5BbmltYXRpb24sXG4gICAgICB3aW5kb3cucDUuVmVjdG9yLFxuICAgICAgd2luZG93LnA1LkNvbG9yLFxuICAgICAgd2luZG93LnA1LkltYWdlLFxuICAgICAgd2luZG93LnA1LlJlbmRlcmVyLFxuICAgICAgd2luZG93LnA1LkdyYXBoaWNzLFxuICAgICAgd2luZG93LnA1LkZvbnQsXG4gICAgICB3aW5kb3cucDUuVGFibGUsXG4gICAgICB3aW5kb3cucDUuVGFibGVSb3csXG4gICAgICB3aW5kb3cucDUuRWxlbWVudFxuICAgIF07XG4gICAgLy8gVGhlIHA1cGxheSBHcm91cCBvYmplY3Qgc2hvdWxkIGJlIGN1c3RvbSBtYXJzaGFsbGVkLCBidXQgaXRzIGNvbnN0cnVjdG9yXG4gICAgLy8gYWN0dWFsbHkgY3JlYXRlcyBhIHN0YW5kYXJkIEFycmF5IGluc3RhbmNlIHdpdGggYSBmZXcgYWRkaXRpb25hbCBtZXRob2RzXG4gICAgLy8gYWRkZWQuIFRoZSBjdXN0b21NYXJzaGFsTW9kaWZpZWRPYmplY3RMaXN0IGFsbG93cyB1cyB0byBzZXQgdXAgYWRkaXRpb25hbFxuICAgIC8vIG9iamVjdCB0eXBlcyB0byBiZSBjdXN0b20gbWFyc2hhbGxlZCBieSBtYXRjaGluZyBib3RoIHRoZSBpbnN0YW5jZSB0eXBlXG4gICAgLy8gYW5kIHRoZSBwcmVzZW5jZSBvZiBhZGRpdGlvbmFsIG1ldGhvZCBuYW1lIG9uIHRoZSBvYmplY3QuXG4gICAgY29kZWdlbi5jdXN0b21NYXJzaGFsTW9kaWZpZWRPYmplY3RMaXN0ID0gWyB7IGluc3RhbmNlOiBBcnJheSwgbWV0aG9kTmFtZTogJ2RyYXcnIH0gXTtcblxuICAgIC8vIEluc2VydCBldmVyeXRoaW5nIG9uIHA1IGFuZCB0aGUgR3JvdXAgY29uc3RydWN0b3IgZnJvbSBwNXBsYXkgaW50byB0aGVcbiAgICAvLyBnbG9iYWwgbmFtZXNwYWNlIG9mIHRoZSBpbnRlcnByZXRlcjpcbiAgICBmb3IgKHZhciBwcm9wIGluIHRoaXMucDUpIHtcbiAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eShwcm9wLCB0aGlzLnA1W3Byb3BdLCB0aGlzLnA1KTtcbiAgICB9XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KCdHcm91cCcsIHdpbmRvdy5Hcm91cCk7XG4gICAgLy8gQW5kIGFsc28gY3JlYXRlIGEgJ3A1JyBvYmplY3QgaW4gdGhlIGdsb2JhbCBuYW1lc3BhY2U6XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KCdwNScsIHsgVmVjdG9yOiB3aW5kb3cucDUuVmVjdG9yIH0pO1xuXG4gICAgLypcbiAgICBpZiAodGhpcy5jaGVja0ZvckVkaXRDb2RlUHJlRXhlY3V0aW9uRmFpbHVyZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vblB1enpsZUNvbXBsZXRlKCk7XG4gICAgfVxuICAgICovXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG5cbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChfLmJpbmQodGhpcy5vblRpY2ssIHRoaXMpLCAzMyk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5vblRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGlja0NvdW50Kys7XG5cbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIodGhpcy50aWNrQ291bnQgPT09IDEpO1xuXG4gICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlci5zdGFydGVkSGFuZGxpbmdFdmVudHMgJiYgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQpIHtcbiAgICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKCk7XG4gICAgfVxuICB9XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbi8qXG4gIG91dHB1dEVycm9yKFN0cmluZyhlcnIpLCBFcnJvckxldmVsLkVSUk9SLCBsaW5lTnVtYmVyKTtcbiAgU3R1ZGlvLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogbGluZU51bWJlciB9O1xuXG4gIC8vIENhbGwgb25QdXp6bGVDb21wbGV0ZSgpIGlmIHN5bnRheCBlcnJvciBvciBhbnkgdGltZSB3ZSdyZSBub3Qgb24gYSBmcmVlcGxheSBsZXZlbDpcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgLy8gTWFyayBwcmVFeGVjdXRpb25GYWlsdXJlIGFuZCB0ZXN0UmVzdWx0cyBpbW1lZGlhdGVseSBzbyB0aGF0IGFuIGVycm9yXG4gICAgLy8gbWVzc2FnZSBhbHdheXMgYXBwZWFycywgZXZlbiBvbiBmcmVlcGxheTpcbiAgICBTdHVkaW8ucHJlRXhlY3V0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgU3R1ZGlvLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuU1lOVEFYX0VSUk9SX0ZBSUw7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfSBlbHNlIGlmICghbGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG4qL1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmxvZyhlcnIpO1xuICB0aHJvdyBlcnI7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGFuIEFQSSBjb21tYW5kLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlQ21kID0gZnVuY3Rpb24gKGlkLCBuYW1lLCBvcHRzKSB7XG4gIGNvbnNvbGUubG9nKFwiR2FtZUxhYiBleGVjdXRlQ21kIFwiICsgbmFtZSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5maW5pc2hFeGVjdXRpb25fID0gZnVuY3Rpb24gKCkge1xuICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5oaWdobGlnaHRCbG9jayhudWxsKTtcbiAgfVxuICB0aGlzLmNoZWNrQW5zd2VyKCk7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZGlzcGxheUZlZWRiYWNrXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIHNraW46IHRoaXMuc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgIHJlc3BvbnNlOiB0aGlzLnJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICAvLyBmZWVkYmFja0ltYWdlOiBmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIiksXG4gICAgLy8gYWRkICdpbXByZXNzaXZlJzp0cnVlIHRvIG5vbi1mcmVlcGxheSBsZXZlbHMgdGhhdCB3ZSBkZWVtIGFyZSByZWxhdGl2ZWx5IGltcHJlc3NpdmUgKHNlZSAjNjY5OTA0ODApXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkgLyogfHwgbGV2ZWwuaW1wcmVzc2l2ZSAqLyksXG4gICAgLy8gaW1wcmVzc2l2ZSBsZXZlbHMgYXJlIGFscmVhZHkgc2F2ZWRcbiAgICAvLyBhbHJlYWR5U2F2ZWQ6IGxldmVsLmltcHJlc3NpdmUsXG4gICAgLy8gYWxsb3cgdXNlcnMgdG8gc2F2ZSBmcmVlcGxheSBsZXZlbHMgdG8gdGhlaXIgZ2FsbGVyeSAoaW1wcmVzc2l2ZSBub24tZnJlZXBsYXkgbGV2ZWxzIGFyZSBhdXRvc2F2ZWQpXG4gICAgc2F2ZVRvR2FsbGVyeVVybDogbGV2ZWwuZnJlZVBsYXkgJiYgdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnNhdmVfdG9fZ2FsbGVyeV91cmwsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogbXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgIHNoYXJpbmdUZXh0OiBtc2cuc2hhcmVEcmF3aW5nKClcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGxheUZlZWRiYWNrXygpO1xufTtcblxuLyoqXG4gKiBWZXJpZnkgaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0LlxuICogSWYgc28sIG1vdmUgb24gdG8gbmV4dCBsZXZlbC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXkgbGV2ZWwsIG9yIHRoZSBsZXZlbCBoYXNcbiAgLy8gYmVlbiBjb21wbGV0ZWRcbiAgdmFyIGxldmVsQ29tcGxldGUgPSBsZXZlbC5mcmVlUGxheSAmJiAoIWxldmVsLmVkaXRDb2RlIHx8ICF0aGlzLmV4ZWN1dGlvbkVycm9yKTtcbiAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgcmV1c2UgYW4gb2xkIG1lc3NhZ2UsIHNpbmNlIG5vdCBhbGwgcGF0aHMgc2V0IG9uZS5cbiAgdGhpcy5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBJZiB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSwgYWx3YXlzIHJldHVybiB0aGUgZnJlZSBwbGF5XG4gIC8vIHJlc3VsdCB0eXBlXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgLy8gUGxheSBzb3VuZFxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPT09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVkgfHxcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBsZXZlbENvbXBsZXRlLFxuICAgIHRlc3RSZXN1bHQ6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IF8uYmluZCh0aGlzLm9uUmVwb3J0Q29tcGxldGUsIHRoaXMpLFxuICAgIC8vIHNhdmVfdG9fZ2FsbGVyeTogbGV2ZWwuaW1wcmVzc2l2ZVxuICB9O1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIFRoZSBjYWxsIHRvIGRpc3BsYXlGZWVkYmFjaygpIHdpbGwgaGFwcGVuIGxhdGVyIGluIG9uUmVwb3J0Q29tcGxldGUoKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cImRpdkdhbWVMYWJcIiB0YWJpbmRleD1cIjFcIj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdGIgPSBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3g7XG52YXIgYmxvY2tPZlR5cGUgPSBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlO1xudmFyIGNyZWF0ZUNhdGVnb3J5ID0gYmxvY2tVdGlscy5jcmVhdGVDYXRlZ29yeTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cbnZhciBsZXZlbHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5sZXZlbHMuc2FuZGJveCA9ICB7XG4gIGlkZWFsOiBJbmZpbml0eSxcbiAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc29mdEJ1dHRvbnM6IFtcbiAgICAnbGVmdEJ1dHRvbicsXG4gICAgJ3JpZ2h0QnV0dG9uJyxcbiAgICAnZG93bkJ1dHRvbicsXG4gICAgJ3VwQnV0dG9uJ1xuICBdLFxuICBmcmVlUGxheTogdHJ1ZSxcbiAgdG9vbGJveDpcbiAgICB0YihibG9ja09mVHlwZSgnZ2FtZWxhYl9mb28nKSksXG4gIHN0YXJ0QmxvY2tzOlxuICAgJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xufTtcblxuLy8gQmFzZSBjb25maWcgZm9yIGxldmVscyBjcmVhdGVkIHZpYSBsZXZlbGJ1aWxkZXJcbmxldmVscy5jdXN0b20gPSB1dGlscy5leHRlbmQobGV2ZWxzLnNhbmRib3gsIHtcbiAgZWRpdENvZGU6IHRydWUsXG4gIGNvZGVGdW5jdGlvbnM6IHtcbiAgICAvLyBHYW1lIExhYlxuICAgIFwibG9hZEltYWdlXCI6IG51bGwsXG4gICAgXCJpbWFnZVwiOiBudWxsLFxuICAgIFwiZmlsbFwiOiBudWxsLFxuICAgIFwibm9GaWxsXCI6IG51bGwsXG4gICAgXCJzdHJva2VcIjogbnVsbCxcbiAgICBcIm5vU3Ryb2tlXCI6IG51bGwsXG4gICAgXCJhcmNcIjogbnVsbCxcbiAgICBcImVsbGlwc2VcIjogbnVsbCxcbiAgICBcImxpbmVcIjogbnVsbCxcbiAgICBcInBvaW50XCI6IG51bGwsXG4gICAgXCJyZWN0XCI6IG51bGwsXG4gICAgXCJ0cmlhbmdsZVwiOiBudWxsLFxuICAgIFwidGV4dFwiOiBudWxsLFxuICAgIFwidGV4dFNpemVcIjogbnVsbCxcbiAgICBcImRyYXdTcHJpdGVzXCI6IG51bGwsXG4gICAgXCJhbGxTcHJpdGVzXCI6IG51bGwsXG4gICAgXCJiYWNrZ3JvdW5kXCI6IG51bGwsXG4gICAgXCJ3aWR0aFwiOiBudWxsLFxuICAgIFwiaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJjYW1lcmFcIjogbnVsbCxcbiAgICBcImNhbWVyYS5vblwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm9mZlwiOiBudWxsLFxuICAgIFwiY2FtZXJhLmFjdGl2ZVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm1vdXNlWFwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm1vdXNlWVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnBvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcImNhbWVyYS5wb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJjYW1lcmEuem9vbVwiOiBudWxsLFxuXG4gICAgLy8gU3ByaXRlc1xuICAgIFwiY3JlYXRlU3ByaXRlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5nZXRBbmltYXRpb25MYWJlbFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldERpcmVjdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkSW1hZ2VcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZFRvR3JvdXBcIjogbnVsbCxcbiAgICBcInNwcml0ZS5jaGFuZ2VBbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5jaGFuZ2VJbWFnZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmF0dHJhY3Rpb25Qb2ludFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmxpbWl0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRDb2xsaWRlclwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldFZlbG9jaXR5XCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJzcHJpdGUud2lkdGhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5kZXB0aFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmZyaWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaW1tb3ZhYmxlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubGlmZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLm1hc3NcIjogbnVsbCxcbiAgICBcInNwcml0ZS5tYXhTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnBvc2l0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucHJldmlvdXNQb3NpdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJlbW92ZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZXN0aXR1dGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0ZVRvRGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGlvblNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2NhbGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zaGFwZUNvbG9yXCI6IG51bGwsXG4gICAgXCJzcHJpdGUudG91Y2hpbmdcIjogbnVsbCxcbiAgICBcInNwcml0ZS52ZWxvY2l0eVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnZpc2libGVcIjogbnVsbCxcblxuICAgIC8vIEFuaW1hdGlvbnNcbiAgICBcImxvYWRBbmltYXRpb25cIjogbnVsbCxcbiAgICBcImFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiYW5pbS5jaGFuZ2VGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5uZXh0RnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ucHJldmlvdXNGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5jbG9uZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nZXRGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nZXRMYXN0RnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0uZ29Ub0ZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLnBsYXlcIjogbnVsbCxcbiAgICBcImFuaW0ucmV3aW5kXCI6IG51bGwsXG4gICAgXCJhbmltLnN0b3BcIjogbnVsbCxcbiAgICBcImFuaW0uZnJhbWVDaGFuZ2VkXCI6IG51bGwsXG4gICAgXCJhbmltLmZyYW1lRGVsYXlcIjogbnVsbCxcbiAgICBcImFuaW0uaW1hZ2VzXCI6IG51bGwsXG4gICAgXCJhbmltLmxvb3BpbmdcIjogbnVsbCxcbiAgICBcImFuaW0ucGxheWluZ1wiOiBudWxsLFxuICAgIFwiYW5pbS52aXNpYmxlXCI6IG51bGwsXG5cbiAgICAvLyBHcm91cHNcbiAgICBcIkdyb3VwXCI6IG51bGwsXG4gICAgXCJncm91cC5hZGRcIjogbnVsbCxcbiAgICBcImdyb3VwLnJlbW92ZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY2xlYXJcIjogbnVsbCxcbiAgICBcImdyb3VwLmNvbnRhaW5zXCI6IG51bGwsXG4gICAgXCJncm91cC5nZXRcIjogbnVsbCxcbiAgICBcImdyb3VwLm1heERlcHRoXCI6IG51bGwsXG4gICAgXCJncm91cC5taW5EZXB0aFwiOiBudWxsLFxuXG4gICAgLy8gRXZlbnRzXG4gICAgXCJrZXlJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcImtleVwiOiBudWxsLFxuICAgIFwia2V5Q29kZVwiOiBudWxsLFxuICAgIFwia2V5UHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5UmVsZWFzZWRcIjogbnVsbCxcbiAgICBcImtleVR5cGVkXCI6IG51bGwsXG4gICAgXCJrZXlEb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50RG93blwiOiBudWxsLFxuICAgIFwia2V5V2VudFVwXCI6IG51bGwsXG4gICAgXCJtb3VzZVhcIjogbnVsbCxcbiAgICBcIm1vdXNlWVwiOiBudWxsLFxuICAgIFwicG1vdXNlWFwiOiBudWxsLFxuICAgIFwicG1vdXNlWVwiOiBudWxsLFxuICAgIFwibW91c2VCdXR0b25cIjogbnVsbCxcbiAgICBcIm1vdXNlSXNQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZU1vdmVkXCI6IG51bGwsXG4gICAgXCJtb3VzZURyYWdnZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlUHJlc3NlZFwiOiBudWxsLFxuICAgIFwibW91c2VSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwibW91c2VDbGlja2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVdoZWVsXCI6IG51bGwsXG5cbiAgICAvLyBDb250cm9sXG4gICAgXCJmb3JMb29wX2lfMF80XCI6IG51bGwsXG4gICAgXCJpZkJsb2NrXCI6IG51bGwsXG4gICAgXCJpZkVsc2VCbG9ja1wiOiBudWxsLFxuICAgIFwid2hpbGVCbG9ja1wiOiBudWxsLFxuXG4gICAgLy8gTWF0aFxuICAgIFwiYWRkT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInN1YnRyYWN0T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm11bHRpcGx5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImRpdmlkZU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJlcXVhbGl0eU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJpbmVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImdyZWF0ZXJUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImdyZWF0ZXJUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJsZXNzVGhhbk9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJsZXNzVGhhbk9yRXF1YWxPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiYW5kT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm9yT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm5vdE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJyYW5kb21OdW1iZXJfbWluX21heFwiOiBudWxsLFxuICAgIFwibWF0aFJvdW5kXCI6IG51bGwsXG4gICAgXCJtYXRoQWJzXCI6IG51bGwsXG4gICAgXCJtYXRoTWF4XCI6IG51bGwsXG4gICAgXCJtYXRoTWluXCI6IG51bGwsXG4gICAgXCJtYXRoUmFuZG9tXCI6IG51bGwsXG5cbiAgICAvLyBWYXJpYWJsZXNcbiAgICBcImRlY2xhcmVBc3NpZ25feFwiOiBudWxsLFxuICAgIFwiZGVjbGFyZU5vQXNzaWduX3hcIjogbnVsbCxcbiAgICBcImFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlQXNzaWduX3N0cl9oZWxsb193b3JsZFwiOiBudWxsLFxuICAgIFwic3Vic3RyaW5nXCI6IG51bGwsXG4gICAgXCJpbmRleE9mXCI6IG51bGwsXG4gICAgXCJpbmNsdWRlc1wiOiBudWxsLFxuICAgIFwibGVuZ3RoXCI6IG51bGwsXG4gICAgXCJ0b1VwcGVyQ2FzZVwiOiBudWxsLFxuICAgIFwidG9Mb3dlckNhc2VcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fbGlzdF9hYmRcIjogbnVsbCxcbiAgICBcImxpc3RMZW5ndGhcIjogbnVsbCxcblxuICAgIC8vIEZ1bmN0aW9uc1xuICAgIFwiZnVuY3Rpb25QYXJhbXNfbm9uZVwiOiBudWxsLFxuICAgIFwiZnVuY3Rpb25QYXJhbXNfblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25cIjogbnVsbCxcbiAgICBcImNhbGxNeUZ1bmN0aW9uX25cIjogbnVsbCxcbiAgICBcInJldHVyblwiOiBudWxsLFxuICB9LFxuICBzdGFydEJsb2NrczogW1xuICAgICdmdW5jdGlvbiBzZXR1cCgpIHsnLFxuICAgICcgICcsXG4gICAgJ30nLFxuICAgICdmdW5jdGlvbiBkcmF3KCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJyddLmpvaW4oJ1xcbicpLFxufSk7XG5cbmxldmVscy5lY19zYW5kYm94ID0gdXRpbHMuZXh0ZW5kKGxldmVscy5jdXN0b20sIHtcbn0pO1xuXG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsyOyAvKiBHYW1lTGFiICovIDsgYnVmLnB1c2goJ1xcblxcbicpOzQ7IGlmIChmaW5pc2hCdXR0b24pIHsgOyBidWYucHVzaCgnXFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDcsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg3LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MTA7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0LmpzJyk7XG5cbnZhciBDT0xPUl9MSUdIVF9HUkVFTiA9ICcjRDNFOTY1JztcbnZhciBDT0xPUl9CTFVFID0gJyMxOUMzRTEnO1xudmFyIENPTE9SX1JFRCA9ICcjRjc4MTgzJztcbnZhciBDT0xPUl9DWUFOID0gJyM0REQwRTEnO1xudmFyIENPTE9SX1lFTExPVyA9ICcjRkZGMTc2JztcbnZhciBDT0xPUl9QSU5LID0gJyNGNTdBQzYnO1xudmFyIENPTE9SX1BVUlBMRSA9ICcjQkI3N0M3JztcbnZhciBDT0xPUl9HUkVFTiA9ICcjNjhEOTk1JztcbnZhciBDT0xPUl9XSElURSA9ICcjRkZGRkZGJztcbnZhciBDT0xPUl9CTFVFID0gJyM2NEI1RjYnO1xudmFyIENPTE9SX09SQU5HRSA9ICcjRkZCNzREJztcblxubW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICAvLyBHYW1lIExhYlxuICB7ZnVuYzogJ2xvYWRJbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBibG9ja1ByZWZpeDogJ3ZhciBpbWcgPSBsb2FkSW1hZ2UnLCBwYWxldHRlUGFyYW1zOiBbJ3VybCddLCBwYXJhbXM6IFsnXCJodHRwczovL2NvZGUub3JnL2ltYWdlcy9sb2dvLnBuZ1wiJ10gfSxcbiAge2Z1bmM6ICdpbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2ltYWdlJywnc3JjWCcsJ3NyY1knLCdzcmNXJywnc3JjSCcsJ3gnLCd5J10sIHBhcmFtczogW1wiaW1nXCIsIFwiMFwiLCBcIjBcIiwgXCJpbWcud2lkdGhcIiwgXCJpbWcuaGVpZ2h0XCIsIFwiMFwiLCBcIjBcIl0gfSxcbiAge2Z1bmM6ICdmaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCIneWVsbG93J1wiXSB9LFxuICB7ZnVuYzogJ25vRmlsbCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnc3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCInYmx1ZSdcIl0gfSxcbiAge2Z1bmM6ICdub1N0cm9rZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYXJjJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCcsJ3N0YXJ0Jywnc3RvcCddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiODAwXCIsIFwiODAwXCIsIFwiMFwiLCBcIkhBTEZfUElcIl0gfSxcbiAge2Z1bmM6ICdlbGxpcHNlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ2xpbmUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MiddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAncG9pbnQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiXSB9LFxuICB7ZnVuYzogJ3JlY3QnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMTAwXCIsIFwiMTAwXCIsIFwiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAndHJpYW5nbGUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MicsJ3gzJywneTMnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydzdHInLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiJ3RleHQnXCIsIFwiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCIxMDBcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0U2l6ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3BpeGVscyddLCBwYXJhbXM6IFtcIjEyXCJdIH0sXG4gIHtmdW5jOiAnZHJhd1Nwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2FsbFNwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgYmxvY2s6ICdhbGxTcHJpdGVzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2JhY2tncm91bmQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibGFjaydcIl0gfSxcbiAge2Z1bmM6ICd3aWR0aCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnaGVpZ2h0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5vbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9mZicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLmFjdGl2ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEuem9vbScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG5cbiAgLy8gU3ByaXRlc1xuICB7ZnVuYzogJ2NyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIGJsb2NrUHJlZml4OiAndmFyIHNwcml0ZSA9IGNyZWF0ZVNwcml0ZScsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIHR5cGU6ICdib3RoJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXRBbmltYXRpb25MYWJlbCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRBbmltYXRpb25MYWJlbCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZ2V0RGlyZWN0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldERpcmVjdGlvbicsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZ2V0U3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0U3BlZWQnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlbW92ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFkZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnLCdhbmltYXRpb24nXSwgcGFyYW1zOiBbJ1wiYW5pbTFcIicsIFwiYW5pbVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZEFuaW1hdGlvbicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkSW1hZ2UnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJywnaW1hZ2UnXSwgcGFyYW1zOiBbJ1wiaW1nMVwiJywgXCJpbWdcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRJbWFnZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkU3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywnYW5nbGUnXSwgcGFyYW1zOiBbXCIxXCIsIFwiOTBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkVG9Hcm91cCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnZ3JvdXAnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZFRvR3JvdXAnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNoYW5nZUFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnXSwgcGFyYW1zOiBbJ1wiYW5pbTFcIiddLCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5jaGFuZ2VJbWFnZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnXSwgcGFyYW1zOiBbJ1wiaW1nMVwiJ10sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VJbWFnZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYXR0cmFjdGlvblBvaW50JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjIwMFwiLCBcIjIwMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmF0dHJhY3Rpb25Qb2ludCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUubGltaXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbWF4J10sIHBhcmFtczogW1wiM1wiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmxpbWl0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldENvbGxpZGVyJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0eXBlJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFsnXCJyZWN0YW5nbGVcIicsIFwiMFwiLCBcIjBcIiwgXCIyMFwiLCBcIjIwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0Q29sbGlkZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldFZlbG9jaXR5JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjFcIiwgXCIxXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0VmVsb2NpdHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmhlaWdodCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5oZWlnaHQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLndpZHRoJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLndpZHRoJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hbmltYXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouYW5pbWF0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5kZXB0aCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5kZXB0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZnJpY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJpY3Rpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmltbW92YWJsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5pbW1vdmFibGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmxpZmUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoubGlmZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubWFzcycsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXNzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5tYXhTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhTcGVlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucG9zaXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNQb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVtb3ZlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZXN0aXR1dGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZXN0aXR1dGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRlVG9EaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRlVG9EaXJlY3Rpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJvdGF0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGlvblNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJvdGF0aW9uU3BlZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNjYWxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnNjYWxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zaGFwZUNvbG9yJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnNoYXBlQ29sb3InLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnRvdWNoaW5nJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnRvdWNoaW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi52ZWxvY2l0eScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmlzaWJsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBwcm9wZXJ0aWVzOlxuY2FtZXJhXG5jb2xsaWRlciAtIFVTRUZVTD8gKG1hcnNoYWwgQUFCQiBhbmQgQ2lyY2xlQ29sbGlkZXIpXG5kZWJ1Z1xuZ3JvdXBzXG5tb3VzZUFjdGl2ZVxubW91c2VJc092ZXJcbm1vdXNlSXNQcmVzc2VkXG5vcmlnaW5hbEhlaWdodFxub3JpZ2luYWxXaWR0aFxuKi9cblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBtZXRob2RzOlxuYWRkSW1hZ2UobGFiZWxpbWcpIC0gMSBwYXJhbSB2ZXJzaW9uOiAoc2V0cyBsYWJlbCB0byBcIm5vcm1hbFwiIGF1dG9tYXRpY2FsbHkpXG5ib3VuY2UodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmNvbGxpZGUodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmRpc3BsYWNlKHRhcmdldGNhbGxiYWNrKSAtIENBTExCQUNLXG5kcmF3KCkgLSBPVkVSUklERSBhbmQvb3IgVVNFRlVMP1xubWlycm9yWChkaXIpIC0gVVNFRlVMP1xubWlycm9yWShkaXIpIC0gVVNFRlVMP1xub3ZlcmxhcCh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xub3ZlcmxhcFBpeGVsKHBvaW50WHBvaW50WSkgLSBVU0VGVUw/XG5vdmVybGFwUG9pbnQocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbnVwZGF0ZSgpIC0gVVNFRlVMP1xuKi9cblxuICAvLyBBbmltYXRpb25zXG4gIHtmdW5jOiAnbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIGJsb2NrUHJlZml4OiAndmFyIGFuaW0gPSBsb2FkQW5pbWF0aW9uJywgcGFsZXR0ZVBhcmFtczogWyd1cmwxJywndXJsMiddLCBwYXJhbXM6IFsnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAxLnBuZ1wiJywgJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMi5wbmdcIiddIH0sXG4gIHtmdW5jOiAnYW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydhbmltYXRpb24nLCd4JywneSddLCBwYXJhbXM6IFtcImFuaW1cIiwgXCI1MFwiLCBcIjUwXCJdIH0sXG4gIHtmdW5jOiAnYW5pbS5jaGFuZ2VGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnZnJhbWUnXSwgcGFyYW1zOiBbXCIwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5uZXh0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoubmV4dEZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ucHJldmlvdXNGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wcmV2aW91c0ZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0uY2xvbmUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouY2xvbmUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nZXRGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRGcmFtZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdldExhc3RGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRMYXN0RnJhbWUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nb1RvRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2ZyYW1lJ10sIHBhcmFtczogW1wiMVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmdvVG9GcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLnBsYXknLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucGxheScgfSxcbiAge2Z1bmM6ICdhbmltLnJld2luZCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZXdpbmQnIH0sXG4gIHtmdW5jOiAnYW5pbS5zdG9wJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnN0b3AnIH0sXG4gIHtmdW5jOiAnYW5pbS5mcmFtZUNoYW5nZWQnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJhbWVDaGFuZ2VkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0uZnJhbWVEZWxheScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmFtZURlbGF5JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0uaW1hZ2VzJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmltYWdlcycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmxvb3BpbmcnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoubG9vcGluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLnBsYXlpbmcnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucGxheWluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLnZpc2libGUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoudmlzaWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBBbmltYXRpb24gbWV0aG9kczpcbmRyYXcoeHkpXG5nZXRGcmFtZUltYWdlKClcbmdldEhlaWdodCgpXG5nZXRJbWFnZUF0KGZyYW1lKVxuZ2V0V2lkdGgoKVxuKi9cblxuICAvLyBHcm91cHNcbiAge2Z1bmM6ICdHcm91cCcsIGJsb2NrUHJlZml4OiAndmFyIGdyb3VwID0gbmV3IEdyb3VwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCB0eXBlOiAnYm90aCcgfSxcbiAge2Z1bmM6ICdncm91cC5hZGQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkJyB9LFxuICB7ZnVuYzogJ2dyb3VwLnJlbW92ZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAuY2xlYXInLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5jbGVhcicgfSxcbiAge2Z1bmM6ICdncm91cC5jb250YWlucycsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jb250YWlucycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5nZXQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnaSddLCBwYXJhbXM6IFtcIjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5nZXQnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAubWF4RGVwdGgnLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhEZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5taW5EZXB0aCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1pbkRlcHRoJywgdHlwZTogJ3ZhbHVlJyB9LFxuXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgR3JvdXAgbWV0aG9kczpcbmJvdW5jZSh0YXJnZXRjYWxsYmFjaykgLSBDQUxMQkFDS1xuZGlzcGxhY2UodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbmRyYXcoKSAtIFVTRUZVTD9cbm92ZXJsYXAodGFyZ2V0Y2FsbGJhY2spIC0gQ0FMTEJBQ0tcbiovXG5cbiAgLy8gRXZlbnRzXG4gIHtmdW5jOiAna2V5SXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5JywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5Q29kZScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleURvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudERvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudFVwJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5UmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlUeXBlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VCdXR0b24nLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlTW92ZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VEcmFnZ2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VDbGlja2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVdoZWVsJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuXG4gIC8vIEFkdmFuY2VkXG4gIHtmdW5jOiAnZm9vJywgcGFyZW50OiBhcGksIGNhdGVnb3J5OiAnQWR2YW5jZWQnIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnR2FtZSBMYWInOiB7XG4gICAgY29sb3I6ICd5ZWxsb3cnLFxuICAgIHJnYjogQ09MT1JfWUVMTE9XLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgU3ByaXRlczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFuaW1hdGlvbnM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBHcm91cHM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEYXRhOiB7XG4gICAgY29sb3I6ICdsaWdodGdyZWVuJyxcbiAgICByZ2I6IENPTE9SX0xJR0hUX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRHJhd2luZzoge1xuICAgIGNvbG9yOiAnY3lhbicsXG4gICAgcmdiOiBDT0xPUl9DWUFOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRXZlbnRzOiB7XG4gICAgY29sb3I6ICdncmVlbicsXG4gICAgcmdiOiBDT0xPUl9HUkVFTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFkdmFuY2VkOiB7XG4gICAgY29sb3I6ICdibHVlJyxcbiAgICByZ2I6IENPTE9SX0JMVUUsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMuc2hvd1BhcmFtRHJvcGRvd25zID0gdHJ1ZTtcbiIsIi8vIGxvY2FsZSBmb3IgZ2FtZWxhYlxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5nYW1lbGFiX2xvY2FsZTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg2LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG4nKTsxOTsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCgyMiwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbicpOzI1OyB9IDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKG51bGwsICdmb28nKTtcbn07XG4iLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoaWQpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKGlkLCAnZm9vJyk7XG59O1xuIl19
