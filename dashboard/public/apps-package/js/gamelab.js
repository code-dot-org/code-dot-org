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

    codegen.customMarshalObjectList = [window.p5, window.Sprite, window.Camera, window.p5.Vector, window.p5.Color, window.p5.Image, window.p5.Renderer, window.p5.Graphics, window.p5.Font, window.p5.Table, window.p5.TableRow, window.p5.Element];
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

  this.studioApp_.playAudio('start', { loop: true });

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
    "sprite.getDirection": null,
    "sprite.remove": null,
    "sprite.height": null,
    "sprite.width": null,

    // Groups
    "Group": null,
    "group.add": null,
    "group.remove": null,

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
{ func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] }, { func: 'noFill', category: 'Game Lab' }, { func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] }, { func: 'noStroke', category: 'Game Lab' }, { func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] }, { func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"] }, { func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"] }, { func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"] }, { func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"] }, { func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"] }, { func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"] }, { func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] }, { func: 'drawSprites', category: 'Game Lab' }, { func: 'allSprites', block: 'allSprites', category: 'Game Lab', type: 'property' }, { func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] }, { func: 'width', block: 'width', category: 'Game Lab', type: 'property' }, { func: 'height', block: 'height', category: 'Game Lab', type: 'property' }, { func: 'camera', block: 'camera', category: 'Game Lab', type: 'property' }, { func: 'camera.on', category: 'Game Lab' }, { func: 'camera.off', category: 'Game Lab' }, { func: 'camera.active', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseX', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseY', category: 'Game Lab', type: 'property' }, { func: 'camera.position.x', category: 'Game Lab', type: 'property' }, { func: 'camera.position.y', category: 'Game Lab', type: 'property' }, { func: 'camera.zoom', category: 'Game Lab', type: 'property' },

// Sprites
{ func: 'createSprite', blockPrefix: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'both' }, { func: 'sprite.setSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.setSpeed' }, { func: 'sprite.getDirection', category: 'Sprites', modeOptionName: '*.getDirection', type: 'value' }, { func: 'sprite.remove', category: 'Sprites', modeOptionName: '*.remove' }, { func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' }, { func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' },

// Groups
{ func: 'Group', blockPrefix: 'var group = new Group', category: 'Groups', type: 'both' }, { func: 'group.add', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.add' }, { func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.remove' },

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsTUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzs7QUFFNUIsU0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxTQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNuQyxDQUFDOzs7OztBQ2RGLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbkMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDckMsTUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXZDLFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7O0FDQUYsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXJDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7O0FBR25DLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBUyxPQUFPLEVBQUUsbUJBQW1CLEVBQUU7QUFDdkQsTUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDOztBQUVwQyxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxTQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQzs7O0FBRy9CLFNBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHOztBQUUzQixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNuQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZOztBQUVsQyxXQUFPLGtCQUFrQixDQUFDO0dBQzNCLENBQUM7Q0FFSCxDQUFDOzs7QUN2Q0YsWUFBWSxDQUFDOztBQUViLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDL0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDakQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Ozs7QUFLaEQsSUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQWU7QUFDeEIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsTUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDeEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDZixNQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLE1BQUksQ0FBQyxZQUFZLEdBQUcsQ0FDbEIsWUFBWSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUM3RCxjQUFjLEVBQUUsWUFBWSxFQUM1QixZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FDeEMsQ0FBQztBQUNGLE1BQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUV0RSxNQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNmLE1BQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLE1BQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO0FBQzNCLE1BQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2hDLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Ozs7O0FBS3pCLE9BQU8sQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFVBQVUsU0FBUyxFQUFFO0FBQ3ZELE1BQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLE1BQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxNQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRW5FLE1BQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUMsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUFVLE1BQU0sRUFBRTtBQUN6QyxNQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNwQixVQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7R0FDakQ7O0FBRUQsTUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzs7QUFFMUIsUUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFlBQVk7Ozs7QUFJaEQsUUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7QUFFbkIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRXRCLFNBQUssSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRTtBQUMxQixVQUFHLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7QUFDeEMsWUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEMsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztPQUNGLE1BQU07QUFDTCxjQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM3QjtLQUNGOztBQUVELFNBQUssSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO0FBQ25CLFVBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMzQixjQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ3ZCO0tBQ0Y7R0FDRixDQUFDOztBQUVGLFFBQU0sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOztBQUVyQyxNQUFJLGdCQUFnQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDbEQsTUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUQsTUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNwRCxZQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLGdCQUFZLEVBQUUscUJBQXFCLElBQUksZ0JBQWdCO0dBQ3hELENBQUMsQ0FBQztBQUNILE1BQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDNUQsWUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtBQUNsQyxnQkFBWSxFQUFFLENBQUMscUJBQXFCLElBQUksZ0JBQWdCO0dBQ3pELENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixZQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLFFBQUksRUFBRTtBQUNKLG1CQUFhLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7QUFDcEQscUJBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRTtBQUNsRCxjQUFRLEVBQUUsZ0JBQWdCO0FBQzFCLHNCQUFnQixFQUFFLGdCQUFnQjtBQUNsQyxlQUFTLEVBQUcsU0FBUztBQUNyQixzQkFBZ0IsRUFBRyxTQUFTO0FBQzVCLGNBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFDN0IsdUJBQWlCLEVBQUcsdUJBQXVCO0FBQzNDLHVCQUFpQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUI7S0FDNUM7R0FDRixDQUFDLENBQUM7O0FBRUgsUUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakQsUUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzs7O0FBSTdELFFBQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDOztBQUU5QyxNQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUM5QixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVk7QUFDekMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDekQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDOUQsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLE1BQU0sRUFBRTs7QUFFakQsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFOzs7QUFHcEMsV0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUNyRDs7O0FBR0QsTUFBSSxtQkFBbUIsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekUscUJBQW1CLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7O0FBRTFDLE1BQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkQsWUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ2pDLFlBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztDQUVuQyxDQUFDOzs7Ozs7O0FBUUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxNQUFNLEVBQUU7O0FBRTFDLE1BQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7Ozs7QUFTbkIsTUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ1gsUUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNqQixRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNmLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7OztBQUcvQixTQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFO0FBQ3pELGFBQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkQ7QUFDRCxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDM0UsV0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUM7O0FBRXBFLFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwRCxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV4QyxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEQsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7OztBQUd4QyxVQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzs7QUFHM0UsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O0FBRzdFLFVBQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7QUFHOUQsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0QsVUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7R0FFOUQ7O0FBRUQsUUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWTtBQUN0RCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQzlFLEVBQUUsSUFBSSxDQUFDLENBQUM7OztBQUdULE1BQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixRQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0dBQzNCO0FBQ0QsTUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Q0FDNUIsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFZO0FBQzdDLE1BQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV4QyxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsV0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdEM7QUFDRCxNQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzNCLE1BQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNoQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzFDLE1BQUk7QUFDRixXQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUNyQixhQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUc7S0FDbEIsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxPQUFPLENBQUMsRUFBRTs7Ozs7QUFLVixRQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7OztBQUdsQixVQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDbEIsY0FBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQzFEO0FBQ0QsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtHQUNGO0NBQ0YsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxZQUFXOztBQUVyQyxNQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV4QixNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEtBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsSUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsRUFBRSxDQUFBLEFBQUMsRUFBRTs7QUFFeEQsUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFdBQU87R0FDUjs7QUFFRCxNQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUNsQyxRQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQzs7QUFFaEIsU0FBSyxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRW5FLFNBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFeEIsVUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZOztBQUUzQixZQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDekIsQ0FBQztBQUNGLFVBQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO0FBQ2hDLFdBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFVBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUNsRCxZQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdEM7S0FDRixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ1QsVUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVk7QUFDL0IsVUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQ2pELFlBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekMsWUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFlBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0FBQ3ZELFNBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztPQUNuRDtLQUNGLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDVCxRQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLFNBQVMsRUFBRTtBQUM3QyxZQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO0FBQ3JDLFlBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3ZELGNBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNDO09BQ0YsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNWLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDVixFQUFFLElBQUksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUUxQixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7QUFDckMsVUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO0FBQy9CLFlBQU0sRUFBRSxhQUFhLENBQUMsTUFBTTtBQUM1QixpQkFBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0FBQzFFLGtCQUFZLEVBQUUsSUFBSTtBQUNsQixlQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDMUIsc0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDO0FBQ3pELG1DQUE2QixFQUFFO0FBQzdCLGFBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNkLGNBQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNmLG9CQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDckIscUJBQWEsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUN0QixtQkFBVyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3BCLG9CQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDckIsZUFBTyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2hCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbkIsb0JBQVksRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNyQixXQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDWixlQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDaEIsY0FBTSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2YsY0FBTSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2YsZUFBTyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2hCLGVBQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNoQixpQkFBUyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGlCQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbEIsa0JBQVUsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNuQixrQkFBVSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ25CLG1CQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDcEIsc0JBQWMsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUN2QixjQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDZixjQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDZixlQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDaEIsZUFBTyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2hCLGVBQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNoQixtQkFBVyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3BCLGNBQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNmLHlCQUFpQixFQUFFLElBQUksQ0FBQyxFQUFFO0FBQzFCLHFCQUFhLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDdEIscUJBQWEsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUN0QixxQkFBYSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3RCLHNCQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDdkIsc0JBQWMsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUN2QixzQkFBYyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLGlCQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbEIsaUJBQVMsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNsQixpQkFBUyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbkIsa0JBQVUsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNuQixrQkFBVSxFQUFFLElBQUksQ0FBQyxFQUFFO09BQ3BCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDckMsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7QUFDbkQsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQ3pCLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMvRDtLQUNGLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsV0FBTyxDQUFDLHVCQUF1QixHQUFHLENBQ2hDLE1BQU0sQ0FBQyxFQUFFLEVBQ1QsTUFBTSxDQUFDLE1BQU0sRUFDYixNQUFNLENBQUMsTUFBTSxFQUNiLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUNoQixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDZixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDZixNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFDbEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQ2xCLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUNkLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUNmLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUNsQixNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FDbEIsQ0FBQzs7Ozs7O0FBTUYsV0FBTyxDQUFDLCtCQUErQixHQUFHLENBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBRSxDQUFDOzs7O0FBSXRGLFNBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtBQUN4QixVQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN2RTtBQUNELFFBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFL0QsUUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7O0dBTzdFLE1BQU07QUFDTCxVQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7O0FBRUQsTUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFHLElBQUksRUFBQyxDQUFDLENBQUM7O0FBRWxELE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTs7QUFFcEMsV0FBTyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3REOztBQUVELE1BQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDekUsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZO0FBQ3JDLE1BQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFakIsTUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUN2RSxVQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUMzQjtHQUNGO0NBQ0YsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVUsR0FBRyxFQUFFLFVBQVUsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUNsRSxRQUFNLEdBQUcsQ0FBQztDQUNYLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2RCxTQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxDQUFDO0NBQzNDLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZOztBQUUvQyxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsV0FBTyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0M7QUFDRCxNQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDcEIsQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFXO0FBQzlDLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRXZCLE1BQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO0FBQzlCLE9BQUcsRUFBRSxTQUFTO0FBQ2QsUUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNsQixnQkFBWSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQzlCLFdBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQixZQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsU0FBSyxFQUFFLEtBQUs7OztBQUdaLGtCQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFLLEtBQUssQ0FBQyxRQUFRLDBCQUEyQjs7OztBQUluRixvQkFBZ0IsRUFBRSxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUI7QUFDdEYsY0FBVSxFQUFFO0FBQ1Ysc0JBQWdCLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3hDLGlCQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRTtLQUNoQztHQUNGLENBQUMsQ0FBQztDQUNKLENBQUM7Ozs7OztBQU1GLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDdEQsTUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckQsV0FBUyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDM0IsTUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDekIsQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBVztBQUN6QyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOzs7O0FBSXZCLE1BQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQSxBQUFDLENBQUM7QUFDaEYsTUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFakUsTUFBSSxPQUFPLENBQUM7QUFDWixNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDcEMsUUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlELFdBQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN0Qzs7O0FBR0QsTUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7O0FBRXpCLE1BQUksS0FBSyxDQUFDLFFBQVEsRUFBRTs7Ozs7OztBQU9sQixXQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDN0M7Ozs7QUFJRCxNQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7R0FDMUQ7OztBQUdELE1BQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsTUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFDMUQsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRTtBQUN4RSxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNsQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDdEM7O0FBRUQsTUFBSSxVQUFVLEdBQUc7QUFDZixPQUFHLEVBQUUsU0FBUztBQUNkLFNBQUssRUFBRSxLQUFLLENBQUMsRUFBRTtBQUNmLFdBQU8sRUFBRSxLQUFLLENBQUMsT0FBTztBQUN0QixVQUFNLEVBQUUsYUFBYTtBQUNyQixjQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDNUIsV0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztBQUNwQyxjQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO0dBRWhELENBQUM7OztBQUVGLE1BQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVuQyxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7O0FBRXBDLFdBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNyRDs7O0NBR0YsQ0FBQzs7O0FDL2tCRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNqQkEsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMzQyxJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO0FBQ2xDLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7QUFDekMsSUFBSSxjQUFjLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQzs7Ozs7QUFLL0MsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxPQUFPLEdBQUk7QUFDaEIsT0FBSyxFQUFFLFFBQVE7QUFDZixnQkFBYyxFQUFFLEVBQ2Y7QUFDRCxPQUFLLEVBQUU7QUFDTCxnQkFBWSxFQUFFLENBQUM7R0FDaEI7QUFDRCxhQUFXLEVBQUUsQ0FDWCxZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksRUFDWixVQUFVLENBQ1g7QUFDRCxVQUFRLEVBQUUsSUFBSTtBQUNkLFNBQU8sRUFDTCxFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2hDLGFBQVcsRUFDVixpRUFBaUU7Q0FDbkUsQ0FBQzs7O0FBR0YsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDM0MsVUFBUSxFQUFFLElBQUk7QUFDZCxlQUFhLEVBQUU7O0FBRWIsVUFBTSxFQUFFLElBQUk7QUFDWixZQUFRLEVBQUUsSUFBSTtBQUNkLFlBQVEsRUFBRSxJQUFJO0FBQ2QsY0FBVSxFQUFFLElBQUk7QUFDaEIsU0FBSyxFQUFFLElBQUk7QUFDWCxhQUFTLEVBQUUsSUFBSTtBQUNmLFVBQU0sRUFBRSxJQUFJO0FBQ1osV0FBTyxFQUFFLElBQUk7QUFDYixVQUFNLEVBQUUsSUFBSTtBQUNaLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLFVBQU0sRUFBRSxJQUFJO0FBQ1osY0FBVSxFQUFFLElBQUk7QUFDaEIsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixnQkFBWSxFQUFFLElBQUk7QUFDbEIsV0FBTyxFQUFFLElBQUk7QUFDYixZQUFRLEVBQUUsSUFBSTtBQUNkLFlBQVEsRUFBRSxJQUFJO0FBQ2QsZUFBVyxFQUFFLElBQUk7QUFDakIsZ0JBQVksRUFBRSxJQUFJO0FBQ2xCLG1CQUFlLEVBQUUsSUFBSTtBQUNyQixtQkFBZSxFQUFFLElBQUk7QUFDckIsbUJBQWUsRUFBRSxJQUFJO0FBQ3JCLHVCQUFtQixFQUFFLElBQUk7QUFDekIsdUJBQW1CLEVBQUUsSUFBSTtBQUN6QixpQkFBYSxFQUFFLElBQUk7OztBQUduQixrQkFBYyxFQUFFLElBQUk7QUFDcEIscUJBQWlCLEVBQUUsSUFBSTtBQUN2Qix5QkFBcUIsRUFBRSxJQUFJO0FBQzNCLG1CQUFlLEVBQUUsSUFBSTtBQUNyQixtQkFBZSxFQUFFLElBQUk7QUFDckIsa0JBQWMsRUFBRSxJQUFJOzs7QUFHcEIsV0FBTyxFQUFFLElBQUk7QUFDYixlQUFXLEVBQUUsSUFBSTtBQUNqQixrQkFBYyxFQUFFLElBQUk7OztBQUdwQixrQkFBYyxFQUFFLElBQUk7QUFDcEIsU0FBSyxFQUFFLElBQUk7QUFDWCxhQUFTLEVBQUUsSUFBSTtBQUNmLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixpQkFBYSxFQUFFLElBQUk7QUFDbkIsY0FBVSxFQUFFLElBQUk7QUFDaEIsYUFBUyxFQUFFLElBQUk7QUFDZixpQkFBYSxFQUFFLElBQUk7QUFDbkIsZUFBVyxFQUFFLElBQUk7QUFDakIsWUFBUSxFQUFFLElBQUk7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLGFBQVMsRUFBRSxJQUFJO0FBQ2YsYUFBUyxFQUFFLElBQUk7QUFDZixpQkFBYSxFQUFFLElBQUk7QUFDbkIsb0JBQWdCLEVBQUUsSUFBSTtBQUN0QixnQkFBWSxFQUFFLElBQUk7QUFDbEIsa0JBQWMsRUFBRSxJQUFJO0FBQ3BCLGtCQUFjLEVBQUUsSUFBSTtBQUNwQixtQkFBZSxFQUFFLElBQUk7QUFDckIsa0JBQWMsRUFBRSxJQUFJO0FBQ3BCLGdCQUFZLEVBQUUsSUFBSTs7O0FBR2xCLG1CQUFlLEVBQUUsSUFBSTtBQUNyQixhQUFTLEVBQUUsSUFBSTtBQUNmLGlCQUFhLEVBQUUsSUFBSTtBQUNuQixnQkFBWSxFQUFFLElBQUk7OztBQUdsQixpQkFBYSxFQUFFLElBQUk7QUFDbkIsc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLG9CQUFnQixFQUFFLElBQUk7QUFDdEIsc0JBQWtCLEVBQUUsSUFBSTtBQUN4Qix3QkFBb0IsRUFBRSxJQUFJO0FBQzFCLHlCQUFxQixFQUFFLElBQUk7QUFDM0IsZ0NBQTRCLEVBQUUsSUFBSTtBQUNsQyxzQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLDZCQUF5QixFQUFFLElBQUk7QUFDL0IsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixpQkFBYSxFQUFFLElBQUk7QUFDbkIsMEJBQXNCLEVBQUUsSUFBSTtBQUM1QixlQUFXLEVBQUUsSUFBSTtBQUNqQixhQUFTLEVBQUUsSUFBSTtBQUNmLGFBQVMsRUFBRSxJQUFJO0FBQ2YsYUFBUyxFQUFFLElBQUk7QUFDZixnQkFBWSxFQUFFLElBQUk7OztBQUdsQixxQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLHVCQUFtQixFQUFFLElBQUk7QUFDekIsY0FBVSxFQUFFLElBQUk7QUFDaEIsbUNBQStCLEVBQUUsSUFBSTtBQUNyQyxlQUFXLEVBQUUsSUFBSTtBQUNqQixhQUFTLEVBQUUsSUFBSTtBQUNmLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLFlBQVEsRUFBRSxJQUFJO0FBQ2QsaUJBQWEsRUFBRSxJQUFJO0FBQ25CLGlCQUFhLEVBQUUsSUFBSTtBQUNuQiw0QkFBd0IsRUFBRSxJQUFJO0FBQzlCLGdCQUFZLEVBQUUsSUFBSTs7O0FBR2xCLHlCQUFxQixFQUFFLElBQUk7QUFDM0Isc0JBQWtCLEVBQUUsSUFBSTtBQUN4QixvQkFBZ0IsRUFBRSxJQUFJO0FBQ3RCLHNCQUFrQixFQUFFLElBQUk7QUFDeEIsWUFBUSxFQUFFLElBQUk7R0FDZjtBQUNELGFBQVcsRUFBRSxDQUNYLG9CQUFvQixFQUNwQixJQUFJLEVBQ0osR0FBRyxFQUNILG1CQUFtQixFQUNuQixJQUFJLEVBQ0osR0FBRyxFQUNILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDakIsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQy9DLENBQUMsQ0FBQzs7O0FDaktIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuQkEsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV4QyxJQUFJLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUNsQyxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDM0IsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzFCLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUMzQixJQUFJLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDN0IsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzNCLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQztBQUM3QixJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7QUFDNUIsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQzVCLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUMzQixJQUFJLFlBQVksR0FBRyxTQUFTLENBQUM7O0FBRTdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHOztBQUV0QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN6QyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFDdkksRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekksRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SCxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUNwRixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUM1QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDbEYsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3hFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUMxRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDMUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFDMUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFDM0MsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNoRSxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2hFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDaEUsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3BFLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNwRSxFQUFDLElB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QUMxQixTQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMvQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuZ2FtZWxhYk1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBnYW1lbGFiID0gbmV3IEdhbWVMYWIoKTtcblxuICBnYW1lbGFiLmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGdhbWVsYWIsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwidmFyIHNraW5CYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5CYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIENETyBBcHA6IEdhbWVMYWJcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5nYW1lbGFiX2ZvbyA9IHtcbiAgICAvLyBCbG9jayBmb3IgZm9vLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5mb28oKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mb29Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZ2FtZWxhYl9mb28gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZm9vLlxuICAgIHJldHVybiAnR2FtZUxhYi5mb28oKTtcXG4nO1xuICB9O1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGlKYXZhc2NyaXB0ID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0Jyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG52YXIgSlNJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4uL0pTSW50ZXJwcmV0ZXInKTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYiBjbGFzc1xuICovXG52YXIgR2FtZUxhYiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IG51bGw7XG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB0aGlzLnA1ZXZlbnROYW1lcyA9IFtcbiAgICAnbW91c2VNb3ZlZCcsICdtb3VzZURyYWdnZWQnLCAnbW91c2VQcmVzc2VkJywgJ21vdXNlUmVsZWFzZWQnLFxuICAgICdtb3VzZUNsaWNrZWQnLCAnbW91c2VXaGVlbCcsXG4gICAgJ2tleVByZXNzZWQnLCAna2V5UmVsZWFzZWQnLCAna2V5VHlwZWQnXG4gIF07XG4gIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zID0gWydkcmF3JywgJ3NldHVwJ10uY29uY2F0KHRoaXMucDVldmVudE5hbWVzKTtcblxuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxhYjtcblxuLyoqXG4gKiBJbmplY3QgdGhlIHN0dWRpb0FwcCBzaW5nbGV0b24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGlzIEdhbWVMYWIgaW5zdGFuY2UuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWVMYWIgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICB3aW5kb3cucDUucHJvdG90eXBlLnNldHVwR2xvYmFsTW9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgZm9yIG5vLXNrZXRjaCBHbG9iYWwgbW9kZVxuICAgICAqL1xuICAgIHZhciBwNSA9IHdpbmRvdy5wNTtcblxuICAgIHRoaXMuX2lzR2xvYmFsID0gdHJ1ZTtcbiAgICAvLyBMb29wIHRocm91Z2ggbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlIGFuZCBhdHRhY2ggdGhlbSB0byB0aGUgd2luZG93XG4gICAgZm9yICh2YXIgcCBpbiBwNS5wcm90b3R5cGUpIHtcbiAgICAgIGlmKHR5cGVvZiBwNS5wcm90b3R5cGVbcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIGV2ID0gcC5zdWJzdHJpbmcoMik7XG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRzLmhhc093blByb3BlcnR5KGV2KSkge1xuICAgICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXS5iaW5kKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEF0dGFjaCBpdHMgcHJvcGVydGllcyB0byB0aGUgd2luZG93XG4gICAgZm9yICh2YXIgcDIgaW4gdGhpcykge1xuICAgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkocDIpKSB7XG4gICAgICAgIHdpbmRvd1twMl0gPSB0aGlzW3AyXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuXG4gIHZhciBzaG93RmluaXNoQnV0dG9uID0gIXRoaXMubGV2ZWwuaXNQcm9qZWN0TGV2ZWw7XG4gIHZhciBmaW5pc2hCdXR0b25GaXJzdExpbmUgPSBfLmlzRW1wdHkodGhpcy5sZXZlbC5zb2Z0QnV0dG9ucyk7XG4gIHZhciBmaXJzdENvbnRyb2xzUm93ID0gcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGZpbmlzaEJ1dHRvbjogZmluaXNoQnV0dG9uRmlyc3RMaW5lICYmIHNob3dGaW5pc2hCdXR0b25cbiAgfSk7XG4gIHZhciBleHRyYUNvbnRyb2xSb3dzID0gcmVxdWlyZSgnLi9leHRyYUNvbnRyb2xSb3dzLmh0bWwuZWpzJykoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZmluaXNoQnV0dG9uOiAhZmluaXNoQnV0dG9uRmlyc3RMaW5lICYmIHNob3dGaW5pc2hCdXR0b25cbiAgfSk7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICBsb2NhbGVEaXJlY3Rpb246IHRoaXMuc3R1ZGlvQXBwXy5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgIGNvbnRyb2xzOiBmaXJzdENvbnRyb2xzUm93LFxuICAgICAgZXh0cmFDb250cm9sUm93czogZXh0cmFDb250cm9sUm93cyxcbiAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogdGhpcy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgIGJsb2NrQ291bnRlckNsYXNzIDogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgfVxuICB9KTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gXy5iaW5kKHRoaXMubG9hZEF1ZGlvXywgdGhpcyk7XG4gIGNvbmZpZy5hZnRlckluamVjdCA9IF8uYmluZCh0aGlzLmFmdGVySW5qZWN0XywgdGhpcywgY29uZmlnKTtcblxuICAvLyBTdG9yZSBwNXNwZWNpYWxGdW5jdGlvbnMgaW4gdGhlIHVudXNlZENvbmZpZyBhcnJheSBzbyB3ZSBkb24ndCBnaXZlIHdhcm5pbmdzXG4gIC8vIGFib3V0IHRoZXNlIGZ1bmN0aW9ucyBub3QgYmVpbmcgY2FsbGVkOlxuICBjb25maWcudW51c2VkQ29uZmlnID0gdGhpcy5wNXNwZWNpYWxGdW5jdGlvbnM7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmluaXQoY29uZmlnKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnR2FtZUxhYixjb2RlJyk7XG4gIH1cblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIGRpdkdhbWVMYWIuc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuICBkaXZHYW1lTGFiLnN0eWxlLmhlaWdodCA9ICc0MDBweCc7XG5cbn07XG5cblxuLyoqXG4gKiBSZXNldCBHYW1lTGFiIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGlnbm9yZSkge1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpY2tJbnRlcnZhbElkKTtcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IDA7XG4gIHRoaXMudGlja0NvdW50ID0gMDtcblxuICAvKlxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIHdoaWxlIChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpIHtcbiAgICBkaXZHYW1lTGFiLnJlbW92ZUNoaWxkKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCk7XG4gIH1cbiAgKi9cblxuICBpZiAodGhpcy5wNSkge1xuICAgIHRoaXMucDUucmVtb3ZlKCk7XG4gICAgdGhpcy5wNSA9IG51bGw7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuXG4gICAgLy8gQ2xlYXIgcmVnaXN0ZXJlZCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGU6XG4gICAgZm9yICh2YXIgbWVtYmVyIGluIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzKSB7XG4gICAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHNbbWVtYmVyXTtcbiAgICB9XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMgPSB7IHByZTogW10sIHBvc3Q6IFtdLCByZW1vdmU6IFtdIH07XG4gICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRQcmVsb2FkTWV0aG9kcy5nYW1lbGFiUHJlbG9hZDtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuYWxsU3ByaXRlcyA9IG5ldyB3aW5kb3cuR3JvdXAoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnNwcml0ZVVwZGF0ZSA9IHRydWU7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYSA9IG5ldyB3aW5kb3cuQ2FtZXJhKDAsIDAsIDEpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhLmluaXQgPSBmYWxzZTtcblxuICAgIC8va2V5Ym9hcmQgaW5wdXRcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnJlYWRQcmVzc2VzKTtcblxuICAgIC8vYXV0b21hdGljIHNwcml0ZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnVwZGF0ZVNwcml0ZXMpO1xuXG4gICAgLy9xdWFkdHJlZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LnVwZGF0ZVRyZWUpO1xuXG4gICAgLy9jYW1lcmEgcHVzaCBhbmQgcG9wXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LmNhbWVyYVB1c2gpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cuY2FtZXJhUG9wKTtcblxuICB9XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5nYW1lbGFiUHJlbG9hZCA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSB3aW5kb3cucDUuX2dldERlY3JlbWVudFByZWxvYWQoYXJndW1lbnRzLCB0aGlzLnA1KTtcbiAgfSwgdGhpcyk7XG5cbiAgLy8gRGlzY2FyZCB0aGUgaW50ZXJwcmV0ZXIuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZGVpbml0aWFsaXplKCk7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgfVxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBHYW1lTGFiOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBSZXNldCBhbGwgc3RhdGUuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJlxuICAgICAgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG5ldyB3aW5kb3cucDUoXy5iaW5kKGZ1bmN0aW9uIChwNW9iaikge1xuICAgICAgdGhpcy5wNSA9IHA1b2JqO1xuXG4gICAgICBwNW9iai5yZWdpc3RlclByZWxvYWRNZXRob2QoJ2dhbWVsYWJQcmVsb2FkJywgd2luZG93LnA1LnByb3RvdHlwZSk7XG5cbiAgICAgIHA1b2JqLnNldHVwR2xvYmFsTW9kZSgpO1xuXG4gICAgICB3aW5kb3cucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ2FsbCBvdXIgZ2FtZWxhYlByZWxvYWQoKSB0byBmb3JjZSBfc3RhcnQvX3NldHVwIHRvIHdhaXQuXG4gICAgICAgIHdpbmRvdy5nYW1lbGFiUHJlbG9hZCgpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5zZXR1cCA9IF8uYmluZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHA1b2JqLmNyZWF0ZUNhbnZhcyg0MDAsIDQwMCk7XG4gICAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzLnNldHVwKSB7XG4gICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLnNldHVwLmFwcGx5KG51bGwpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHdpbmRvdy5kcmF3ID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdykge1xuICAgICAgICAgIHZhciBzdGFydFRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLmRyYXcuYXBwbHkobnVsbCk7XG4gICAgICAgICAgdmFyIHRpbWVFbGFwc2VkID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICQoJyNidWJibGUnKS50ZXh0KHRpbWVFbGFwc2VkLnRvRml4ZWQoMikgKyAnIG1zJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgICAgdGhpcy5wNWV2ZW50TmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgIHdpbmRvd1tldmVudE5hbWVdID0gXy5iaW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXS5hcHBseShudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSwgdGhpcyksICdkaXZHYW1lTGFiJyk7XG5cbiAgaWYgKHRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICAgIGJsb2NrRmlsdGVyOiB0aGlzLmxldmVsLmV4ZWN1dGVQYWxldHRlQXBpc09ubHkgJiYgdGhpcy5sZXZlbC5jb2RlRnVuY3Rpb25zLFxuICAgICAgZW5hYmxlRXZlbnRzOiB0cnVlLFxuICAgICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgICBvbkV4ZWN1dGlvbkVycm9yOiBfLmJpbmQodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvciwgdGhpcyksXG4gICAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczoge1xuICAgICAgICB3aWR0aDogdGhpcy5wNSxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnA1LFxuICAgICAgICBkaXNwbGF5V2lkdGg6IHRoaXMucDUsXG4gICAgICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIHdpbmRvd1dpZHRoOiB0aGlzLnA1LFxuICAgICAgICB3aW5kb3dIZWlnaHQ6IHRoaXMucDUsXG4gICAgICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgICAgIGZyYW1lQ291bnQ6IHRoaXMucDUsXG4gICAgICAgIGtleUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAga2V5OiB0aGlzLnA1LFxuICAgICAgICBrZXlDb2RlOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWDogdGhpcy5wNSxcbiAgICAgICAgcG1vdXNlWTogdGhpcy5wNSxcbiAgICAgICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgICAgICB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgICAgIG1vdXNlQnV0dG9uOiB0aGlzLnA1LFxuICAgICAgICBtb3VzZUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICAgICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgICAgICB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFg6IHRoaXMucDUsXG4gICAgICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoZXM6IHRoaXMucDUsXG4gICAgICAgIHRvdWNoSXNEb3duOiB0aGlzLnA1LFxuICAgICAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgICAgIGRldmljZU9yaWVudGF0aW9uOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBhY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwQWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICAgICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgICAgIHBBY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgICAgICByb3RhdGlvblg6IHRoaXMucDUsXG4gICAgICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICAgICAgcm90YXRpb25aOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25YOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgICAgICBwUm90YXRpb25aOiB0aGlzLnA1XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKGV2ZW50TmFtZSk7XG4gICAgICBpZiAoZnVuYykge1xuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSA9XG4gICAgICAgICAgICBjb2RlZ2VuLmNyZWF0ZU5hdGl2ZUZ1bmN0aW9uRnJvbUludGVycHJldGVyRnVuY3Rpb24oZnVuYyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG5cbiAgICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gW1xuICAgICAgd2luZG93LnA1LFxuICAgICAgd2luZG93LlNwcml0ZSxcbiAgICAgIHdpbmRvdy5DYW1lcmEsXG4gICAgICB3aW5kb3cucDUuVmVjdG9yLFxuICAgICAgd2luZG93LnA1LkNvbG9yLFxuICAgICAgd2luZG93LnA1LkltYWdlLFxuICAgICAgd2luZG93LnA1LlJlbmRlcmVyLFxuICAgICAgd2luZG93LnA1LkdyYXBoaWNzLFxuICAgICAgd2luZG93LnA1LkZvbnQsXG4gICAgICB3aW5kb3cucDUuVGFibGUsXG4gICAgICB3aW5kb3cucDUuVGFibGVSb3csXG4gICAgICB3aW5kb3cucDUuRWxlbWVudFxuICAgIF07XG4gICAgLy8gVGhlIHA1cGxheSBHcm91cCBvYmplY3Qgc2hvdWxkIGJlIGN1c3RvbSBtYXJzaGFsbGVkLCBidXQgaXRzIGNvbnN0cnVjdG9yXG4gICAgLy8gYWN0dWFsbHkgY3JlYXRlcyBhIHN0YW5kYXJkIEFycmF5IGluc3RhbmNlIHdpdGggYSBmZXcgYWRkaXRpb25hbCBtZXRob2RzXG4gICAgLy8gYWRkZWQuIFRoZSBjdXN0b21NYXJzaGFsTW9kaWZpZWRPYmplY3RMaXN0IGFsbG93cyB1cyB0byBzZXQgdXAgYWRkaXRpb25hbFxuICAgIC8vIG9iamVjdCB0eXBlcyB0byBiZSBjdXN0b20gbWFyc2hhbGxlZCBieSBtYXRjaGluZyBib3RoIHRoZSBpbnN0YW5jZSB0eXBlXG4gICAgLy8gYW5kIHRoZSBwcmVzZW5jZSBvZiBhZGRpdGlvbmFsIG1ldGhvZCBuYW1lIG9uIHRoZSBvYmplY3QuXG4gICAgY29kZWdlbi5jdXN0b21NYXJzaGFsTW9kaWZpZWRPYmplY3RMaXN0ID0gWyB7IGluc3RhbmNlOiBBcnJheSwgbWV0aG9kTmFtZTogJ2RyYXcnIH0gXTtcblxuICAgIC8vIEluc2VydCBldmVyeXRoaW5nIG9uIHA1IGFuZCB0aGUgR3JvdXAgY29uc3RydWN0b3IgZnJvbSBwNXBsYXkgaW50byB0aGVcbiAgICAvLyBnbG9iYWwgbmFtZXNwYWNlIG9mIHRoZSBpbnRlcnByZXRlcjpcbiAgICBmb3IgKHZhciBwcm9wIGluIHRoaXMucDUpIHtcbiAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eShwcm9wLCB0aGlzLnA1W3Byb3BdLCB0aGlzLnA1KTtcbiAgICB9XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KCdHcm91cCcsIHdpbmRvdy5Hcm91cCk7XG4gICAgLy8gQW5kIGFsc28gY3JlYXRlIGEgJ3A1JyBvYmplY3QgaW4gdGhlIGdsb2JhbCBuYW1lc3BhY2U6XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KCdwNScsIHsgVmVjdG9yOiB3aW5kb3cucDUuVmVjdG9yIH0pO1xuXG4gICAgLypcbiAgICBpZiAodGhpcy5jaGVja0ZvckVkaXRDb2RlUHJlRXhlY3V0aW9uRmFpbHVyZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vblB1enpsZUNvbXBsZXRlKCk7XG4gICAgfVxuICAgICovXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3N0YXJ0Jywge2xvb3AgOiB0cnVlfSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG5cbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChfLmJpbmQodGhpcy5vblRpY2ssIHRoaXMpLCAzMyk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5vblRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGlja0NvdW50Kys7XG5cbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIodGhpcy50aWNrQ291bnQgPT09IDEpO1xuXG4gICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlci5zdGFydGVkSGFuZGxpbmdFdmVudHMgJiYgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQpIHtcbiAgICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKCk7XG4gICAgfVxuICB9XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbi8qXG4gIGlmICghbGluZU51bWJlciAmJiBlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIHN5bnRheCBlcnJvcnMgY2FtZSBiZWZvcmUgZXhlY3V0aW9uIChkdXJpbmcgcGFyc2luZyksIHNvIHdlIG5lZWRcbiAgICAvLyB0byBkZXRlcm1pbmUgdGhlIHByb3BlciBsaW5lIG51bWJlciBieSBsb29raW5nIGF0IHRoZSBleGNlcHRpb25cbiAgICBsaW5lTnVtYmVyID0gZXJyLmxvYy5saW5lO1xuICAgIC8vIE5vdyBzZWxlY3QgdGhpcyBsb2NhdGlvbiBpbiB0aGUgZWRpdG9yLCBzaW5jZSB3ZSBrbm93IHdlIGRpZG4ndCBoaXRcbiAgICAvLyB0aGlzIHdoaWxlIGV4ZWN1dGluZyAoaW4gd2hpY2ggY2FzZSwgaXQgd291bGQgYWxyZWFkeSBoYXZlIGJlZW4gc2VsZWN0ZWQpXG5cbiAgICBjb2RlZ2VuLnNlbGVjdEVkaXRvclJvd0NvbEVycm9yKHN0dWRpb0FwcC5lZGl0b3IsIGxpbmVOdW1iZXIgLSAxLCBlcnIubG9jLmNvbHVtbik7XG4gIH1cbiAgaWYgKFN0dWRpby5KU0ludGVycHJldGVyKSB7XG4gICAgLy8gU2VsZWN0IGNvZGUgdGhhdCBqdXN0IGV4ZWN1dGVkOlxuICAgIFN0dWRpby5KU0ludGVycHJldGVyLnNlbGVjdEN1cnJlbnRDb2RlKFwiYWNlX2Vycm9yXCIpO1xuICAgIC8vIEdyYWIgbGluZSBudW1iZXIgaWYgd2UgZG9uJ3QgaGF2ZSBvbmUgYWxyZWFkeTpcbiAgICBpZiAoIWxpbmVOdW1iZXIpIHtcbiAgICAgIGxpbmVOdW1iZXIgPSAxICsgU3R1ZGlvLkpTSW50ZXJwcmV0ZXIuZ2V0TmVhcmVzdFVzZXJDb2RlTGluZSgpO1xuICAgIH1cbiAgfVxuICBvdXRwdXRFcnJvcihTdHJpbmcoZXJyKSwgRXJyb3JMZXZlbC5FUlJPUiwgbGluZU51bWJlcik7XG4gIFN0dWRpby5leGVjdXRpb25FcnJvciA9IHsgZXJyOiBlcnIsIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXIgfTtcblxuICAvLyBDYWxsIG9uUHV6emxlQ29tcGxldGUoKSBpZiBzeW50YXggZXJyb3Igb3IgYW55IHRpbWUgd2UncmUgbm90IG9uIGEgZnJlZXBsYXkgbGV2ZWw6XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIE1hcmsgcHJlRXhlY3V0aW9uRmFpbHVyZSBhbmQgdGVzdFJlc3VsdHMgaW1tZWRpYXRlbHkgc28gdGhhdCBhbiBlcnJvclxuICAgIC8vIG1lc3NhZ2UgYWx3YXlzIGFwcGVhcnMsIGV2ZW4gb24gZnJlZXBsYXk6XG4gICAgU3R1ZGlvLnByZUV4ZWN1dGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgIFN0dWRpby50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlNZTlRBWF9FUlJPUl9GQUlMO1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH0gZWxzZSBpZiAoIWxldmVsLmZyZWVQbGF5KSB7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuKi9cbiAgdGhyb3cgZXJyO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBBUEkgY29tbWFuZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZUNtZCA9IGZ1bmN0aW9uIChpZCwgbmFtZSwgb3B0cykge1xuICBjb25zb2xlLmxvZyhcIkdhbWVMYWIgZXhlY3V0ZUNtZCBcIiArIG5hbWUpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIHRhc2tzIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIHVzZXIgcHJvZ3JhbSBpcyBmaW5pc2hlZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZmluaXNoRXhlY3V0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuaGlnaGxpZ2h0QmxvY2sobnVsbCk7XG4gIH1cbiAgdGhpcy5jaGVja0Fuc3dlcigpO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrKHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgLy8gZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IC8qIHx8IGxldmVsLmltcHJlc3NpdmUgKi8pLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgLy8gYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IG1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogbXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gbGV2ZWwuZnJlZVBsYXkgJiYgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICAvLyBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJkaXZHYW1lTGFiXCIgdGFiaW5kZXg9XCIxXCI+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHRiID0gYmxvY2tVdGlscy5jcmVhdGVUb29sYm94O1xudmFyIGJsb2NrT2ZUeXBlID0gYmxvY2tVdGlscy5ibG9ja09mVHlwZTtcbnZhciBjcmVhdGVDYXRlZ29yeSA9IGJsb2NrVXRpbHMuY3JlYXRlQ2F0ZWdvcnk7XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGV2ZWxzLnNhbmRib3ggPSAge1xuICBpZGVhbDogSW5maW5pdHksXG4gIHJlcXVpcmVkQmxvY2tzOiBbXG4gIF0sXG4gIHNjYWxlOiB7XG4gICAgJ3NuYXBSYWRpdXMnOiAyXG4gIH0sXG4gIHNvZnRCdXR0b25zOiBbXG4gICAgJ2xlZnRCdXR0b24nLFxuICAgICdyaWdodEJ1dHRvbicsXG4gICAgJ2Rvd25CdXR0b24nLFxuICAgICd1cEJ1dHRvbidcbiAgXSxcbiAgZnJlZVBsYXk6IHRydWUsXG4gIHRvb2xib3g6XG4gICAgdGIoYmxvY2tPZlR5cGUoJ2dhbWVsYWJfZm9vJykpLFxuICBzdGFydEJsb2NrczpcbiAgICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbn07XG5cbi8vIEJhc2UgY29uZmlnIGZvciBsZXZlbHMgY3JlYXRlZCB2aWEgbGV2ZWxidWlsZGVyXG5sZXZlbHMuY3VzdG9tID0gdXRpbHMuZXh0ZW5kKGxldmVscy5zYW5kYm94LCB7XG4gIGVkaXRDb2RlOiB0cnVlLFxuICBjb2RlRnVuY3Rpb25zOiB7XG4gICAgLy8gR2FtZSBMYWJcbiAgICBcImZpbGxcIjogbnVsbCxcbiAgICBcIm5vRmlsbFwiOiBudWxsLFxuICAgIFwic3Ryb2tlXCI6IG51bGwsXG4gICAgXCJub1N0cm9rZVwiOiBudWxsLFxuICAgIFwiYXJjXCI6IG51bGwsXG4gICAgXCJlbGxpcHNlXCI6IG51bGwsXG4gICAgXCJsaW5lXCI6IG51bGwsXG4gICAgXCJwb2ludFwiOiBudWxsLFxuICAgIFwicmVjdFwiOiBudWxsLFxuICAgIFwidHJpYW5nbGVcIjogbnVsbCxcbiAgICBcInRleHRcIjogbnVsbCxcbiAgICBcInRleHRTaXplXCI6IG51bGwsXG4gICAgXCJkcmF3U3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYWxsU3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYmFja2dyb3VuZFwiOiBudWxsLFxuICAgIFwid2lkdGhcIjogbnVsbCxcbiAgICBcImhlaWdodFwiOiBudWxsLFxuICAgIFwiY2FtZXJhXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub25cIjogbnVsbCxcbiAgICBcImNhbWVyYS5vZmZcIjogbnVsbCxcbiAgICBcImNhbWVyYS5hY3RpdmVcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVhcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVlcIjogbnVsbCxcbiAgICBcImNhbWVyYS5wb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnpvb21cIjogbnVsbCxcblxuICAgIC8vIFNwcml0ZXNcbiAgICBcImNyZWF0ZVNwcml0ZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0RGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJzcHJpdGUud2lkdGhcIjogbnVsbCxcblxuICAgIC8vIEdyb3Vwc1xuICAgIFwiR3JvdXBcIjogbnVsbCxcbiAgICBcImdyb3VwLmFkZFwiOiBudWxsLFxuICAgIFwiZ3JvdXAucmVtb3ZlXCI6IG51bGwsXG5cbiAgICAvLyBFdmVudHNcbiAgICBcImtleUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5XCI6IG51bGwsXG4gICAgXCJrZXlDb2RlXCI6IG51bGwsXG4gICAgXCJrZXlQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwia2V5VHlwZWRcIjogbnVsbCxcbiAgICBcImtleURvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnREb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50VXBcIjogbnVsbCxcbiAgICBcIm1vdXNlWFwiOiBudWxsLFxuICAgIFwibW91c2VZXCI6IG51bGwsXG4gICAgXCJwbW91c2VYXCI6IG51bGwsXG4gICAgXCJwbW91c2VZXCI6IG51bGwsXG4gICAgXCJtb3VzZUJ1dHRvblwiOiBudWxsLFxuICAgIFwibW91c2VJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlTW92ZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlRHJhZ2dlZFwiOiBudWxsLFxuICAgIFwibW91c2VQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZUNsaWNrZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlV2hlZWxcIjogbnVsbCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBcImZvckxvb3BfaV8wXzRcIjogbnVsbCxcbiAgICBcImlmQmxvY2tcIjogbnVsbCxcbiAgICBcImlmRWxzZUJsb2NrXCI6IG51bGwsXG4gICAgXCJ3aGlsZUJsb2NrXCI6IG51bGwsXG5cbiAgICAvLyBNYXRoXG4gICAgXCJhZGRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwic3VidHJhY3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibXVsdGlwbHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZGl2aWRlT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImluZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJhbmRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwib3JPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibm90T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInJhbmRvbU51bWJlcl9taW5fbWF4XCI6IG51bGwsXG4gICAgXCJtYXRoUm91bmRcIjogbnVsbCxcbiAgICBcIm1hdGhBYnNcIjogbnVsbCxcbiAgICBcIm1hdGhNYXhcIjogbnVsbCxcbiAgICBcIm1hdGhNaW5cIjogbnVsbCxcbiAgICBcIm1hdGhSYW5kb21cIjogbnVsbCxcblxuICAgIC8vIFZhcmlhYmxlc1xuICAgIFwiZGVjbGFyZUFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlTm9Bc3NpZ25feFwiOiBudWxsLFxuICAgIFwiYXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fc3RyX2hlbGxvX3dvcmxkXCI6IG51bGwsXG4gICAgXCJzdWJzdHJpbmdcIjogbnVsbCxcbiAgICBcImluZGV4T2ZcIjogbnVsbCxcbiAgICBcImluY2x1ZGVzXCI6IG51bGwsXG4gICAgXCJsZW5ndGhcIjogbnVsbCxcbiAgICBcInRvVXBwZXJDYXNlXCI6IG51bGwsXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9saXN0X2FiZFwiOiBudWxsLFxuICAgIFwibGlzdExlbmd0aFwiOiBudWxsLFxuXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgXCJmdW5jdGlvblBhcmFtc19ub25lXCI6IG51bGwsXG4gICAgXCJmdW5jdGlvblBhcmFtc19uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25fblwiOiBudWxsLFxuICAgIFwicmV0dXJuXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBbXG4gICAgJ2Z1bmN0aW9uIHNldHVwKCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJ2Z1bmN0aW9uIGRyYXcoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnJ10uam9pbignXFxuJyksXG59KTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLmN1c3RvbSwge1xufSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuJyk7NDsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDcsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsxMDsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcblxudmFyIENPTE9SX0xJR0hUX0dSRUVOID0gJyNEM0U5NjUnO1xudmFyIENPTE9SX0JMVUUgPSAnIzE5QzNFMSc7XG52YXIgQ09MT1JfUkVEID0gJyNGNzgxODMnO1xudmFyIENPTE9SX0NZQU4gPSAnIzRERDBFMSc7XG52YXIgQ09MT1JfWUVMTE9XID0gJyNGRkYxNzYnO1xudmFyIENPTE9SX1BJTksgPSAnI0Y1N0FDNic7XG52YXIgQ09MT1JfUFVSUExFID0gJyNCQjc3QzcnO1xudmFyIENPTE9SX0dSRUVOID0gJyM2OEQ5OTUnO1xudmFyIENPTE9SX1dISVRFID0gJyNGRkZGRkYnO1xudmFyIENPTE9SX0JMVUUgPSAnIzY0QjVGNic7XG52YXIgQ09MT1JfT1JBTkdFID0gJyNGRkI3NEQnO1xuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIC8vIEdhbWUgTGFiXG4gIHtmdW5jOiAnZmlsbCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ3llbGxvdydcIl0gfSxcbiAge2Z1bmM6ICdub0ZpbGwnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ3N0cm9rZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ2JsdWUnXCJdIH0sXG4gIHtmdW5jOiAnbm9TdHJva2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2FyYycsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnLCdzdGFydCcsJ3N0b3AnXSwgcGFyYW1zOiBbXCIwXCIsIFwiMFwiLCBcIjgwMFwiLCBcIjgwMFwiLCBcIjBcIiwgXCJIQUxGX1BJXCJdIH0sXG4gIHtmdW5jOiAnZWxsaXBzZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICdsaW5lJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneDEnLCd5MScsJ3gyJywneTInXSwgcGFyYW1zOiBbXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ3BvaW50JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIl0gfSxcbiAge2Z1bmM6ICdyZWN0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIjEwMFwiLCBcIjEwMFwiLCBcIjIwMFwiLCBcIjIwMFwiXSB9LFxuICB7ZnVuYzogJ3RyaWFuZ2xlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneDEnLCd5MScsJ3gyJywneTInLCd4MycsJ3kzJ10sIHBhcmFtczogW1wiMjAwXCIsIFwiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnc3RyJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIid0ZXh0J1wiLCBcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiMTAwXCJdIH0sXG4gIHtmdW5jOiAndGV4dFNpemUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydwaXhlbHMnXSwgcGFyYW1zOiBbXCIxMlwiXSB9LFxuICB7ZnVuYzogJ2RyYXdTcHJpdGVzJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdhbGxTcHJpdGVzJywgYmxvY2s6ICdhbGxTcHJpdGVzJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdiYWNrZ3JvdW5kJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCInYmxhY2snXCJdIH0sXG4gIHtmdW5jOiAnd2lkdGgnLCBibG9jazogJ3dpZHRoJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdoZWlnaHQnLCBibG9jazogJ2hlaWdodCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhJywgYmxvY2s6ICdjYW1lcmEnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5vbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9mZicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLmFjdGl2ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEuem9vbScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG5cbiAgLy8gU3ByaXRlc1xuICB7ZnVuYzogJ2NyZWF0ZVNwcml0ZScsIGJsb2NrUHJlZml4OiAndmFyIHNwcml0ZSA9IGNyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIHR5cGU6ICdib3RoJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXREaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RGlyZWN0aW9uJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZW1vdmUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmVtb3ZlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5oZWlnaHQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouaGVpZ2h0JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS53aWR0aCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi53aWR0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcblxuICAvLyBHcm91cHNcbiAge2Z1bmM6ICdHcm91cCcsIGJsb2NrUHJlZml4OiAndmFyIGdyb3VwID0gbmV3IEdyb3VwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCB0eXBlOiAnYm90aCcgfSxcbiAge2Z1bmM6ICdncm91cC5hZGQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkJyB9LFxuICB7ZnVuYzogJ2dyb3VwLnJlbW92ZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG5cbiAgLy8gRXZlbnRzXG4gIHtmdW5jOiAna2V5SXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5JywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5Q29kZScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleURvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudERvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudFVwJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5UmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlUeXBlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VCdXR0b24nLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlTW92ZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VEcmFnZ2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VDbGlja2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVdoZWVsJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuXG4gIC8vIEFkdmFuY2VkXG4gIHtmdW5jOiAnZm9vJywgcGFyZW50OiBhcGksIGNhdGVnb3J5OiAnQWR2YW5jZWQnIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnR2FtZSBMYWInOiB7XG4gICAgY29sb3I6ICd5ZWxsb3cnLFxuICAgIHJnYjogQ09MT1JfWUVMTE9XLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgU3ByaXRlczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEdyb3Vwczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIERhdGE6IHtcbiAgICBjb2xvcjogJ2xpZ2h0Z3JlZW4nLFxuICAgIHJnYjogQ09MT1JfTElHSFRfR1JFRU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEcmF3aW5nOiB7XG4gICAgY29sb3I6ICdjeWFuJyxcbiAgICByZ2I6IENPTE9SX0NZQU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBFdmVudHM6IHtcbiAgICBjb2xvcjogJ2dyZWVuJyxcbiAgICByZ2I6IENPTE9SX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgQWR2YW5jZWQ6IHtcbiAgICBjb2xvcjogJ2JsdWUnLFxuICAgIHJnYjogQ09MT1JfQkxVRSxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cy5hdXRvY29tcGxldGVGdW5jdGlvbnNXaXRoUGFyZW5zID0gdHJ1ZTtcbm1vZHVsZS5leHBvcnRzLnNob3dQYXJhbURyb3Bkb3ducyA9IHRydWU7XG4iLCIvLyBsb2NhbGUgZm9yIGdhbWVsYWJcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuZ2FtZWxhYl9sb2NhbGU7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsyOyAvKiBHYW1lTGFiICovIDsgYnVmLnB1c2goJ1xcblxcbjxkaXYgaWQ9XCJzb2Z0LWJ1dHRvbnNcIiBjbGFzcz1cInNvZnQtYnV0dG9ucy1ub25lXCI+XFxuICA8YnV0dG9uIGlkPVwibGVmdEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cImxlZnQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwicmlnaHRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDksICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJyaWdodC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJ1cEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJ1cC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJkb3duQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxNSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cImRvd24tYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuXFxuJyk7MTk7IGlmIChmaW5pc2hCdXR0b24pIHsgOyBidWYucHVzaCgnXFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDIyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoMjIsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsyNTsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoKSB7XG4gIEdhbWVMYWIuZXhlY3V0ZUNtZChudWxsLCAnZm9vJyk7XG59O1xuIiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbmV4cG9ydHMucmFuZG9tID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YXIga2V5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsdWVzLmxlbmd0aCk7XG4gIHJldHVybiB2YWx1ZXNba2V5XTtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKGlkKSB7XG4gIEdhbWVMYWIuZXhlY3V0ZUNtZChpZCwgJ2ZvbycpO1xufTtcbiJdfQ==
