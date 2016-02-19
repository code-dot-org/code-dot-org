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
var JsDebuggerUi = require('../JsDebuggerUi');
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');
var GameLabP5 = require('./GameLabP5');
var gameLabSprite = require('./GameLabSprite');
var assetPrefix = require('../assetManagement/assetPrefix');

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
  this.consoleLogger_ = new JsInterpreterLogger(window.console);

  /** @type {JsDebuggerUi} */
  this.debugger_ = new JsDebuggerUi(this.runButtonClick.bind(this));

  this.eventHandlers = {};
  this.Globals = {};
  this.currentCmdQueue = null;
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.startedHandlingEvents = false;
  this.gameLabP5 = new GameLabP5();
  this.api = api;
  this.api.injectGameLab(this);
  this.apiJS = apiJavascript;
  this.apiJS.injectGameLab(this);

  dropletConfig.injectGameLab(this);
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

  config.usesAssets = true;

  this.gameLabP5.init({
    gameLab: this,
    onExecutionStarting: this.onP5ExecutionStarting.bind(this),
    onPreload: this.onP5Preload.bind(this),
    onSetup: this.onP5Setup.bind(this),
    onDraw: this.onP5Draw.bind(this)
  });

  config.dropletConfig = dropletConfig;
  config.appMsg = msg;

  var showFinishButton = !this.level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(this.level.softButtons);
  var areBreakpointsEnabled = true;
  var firstControlsRow = require('./controls.html.ejs')({
    assetUrl: this.studioApp_.assetUrl,
    finishButton: finishButtonFirstLine && showFinishButton
  });
  var extraControlRows = this.debugger_.getMarkup(this.studioApp_.assetUrl, {
    showButtons: true,
    showConsole: true
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
      pinWorkspaceToBottom: true,
      readonlyWorkspace: config.readonlyWorkspace
    }
  });

  config.loadAudio = this.loadAudio_.bind(this);
  config.afterInject = this.afterInject_.bind(this, config);
  config.afterEditorReady = this.afterEditorReady_.bind(this, areBreakpointsEnabled);

  // Store p5specialFunctions in the unusedConfig array so we don't give warnings
  // about these functions not being called:
  config.unusedConfig = this.gameLabP5.p5specialFunctions;

  this.studioApp_.init(config);

  this.debugger_.initializeAfterDomCreated({
    defaultStepSpeed: 1
  });
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
 * Initialization to run after ace/droplet is initialized.
 * @param {!boolean} areBreakpointsEnabled
 * @private
 */
GameLab.prototype.afterEditorReady_ = function (areBreakpointsEnabled) {
  if (areBreakpointsEnabled) {
    this.studioApp_.enableBreakpoints();
  }
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

  this.gameLabP5.resetExecution();

  // Import to reset these after this.gameLabP5 has been reset
  this.drawInProgress = false;
  this.setupInProgress = false;
  this.startedHandlingEvents = false;

  this.debugger_.detach();
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

  this.gameLabP5.startExecution();

  if (!this.level.editCode) {
    this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
    this.evalCode(this.code);
  }

  this.studioApp_.playAudio('start');

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  // Set to 1ms interval, but note that browser minimums are actually 5-16ms:
  this.tickIntervalId = window.setInterval(_.bind(this.onTick, this), 1);
};

GameLab.prototype.initInterpreter = function () {
  if (!this.level.editCode) {
    return;
  }

  this.JSInterpreter = new JSInterpreter({
    studioApp: this.studioApp_,
    maxInterpreterStepsPerTick: MAX_INTERPRETER_STEPS_PER_TICK,
    customMarshalGlobalProperties: this.gameLabP5.getCustomMarshalGlobalProperties()
  });
  this.JSInterpreter.onExecutionError.register(this.handleExecutionError.bind(this));
  this.consoleLogger_.attachTo(this.JSInterpreter);
  this.debugger_.attachTo(this.JSInterpreter);
  this.JSInterpreter.parse({
    code: this.studioApp_.getCode(),
    blocks: dropletConfig.blocks,
    blockFilter: this.level.executePaletteApisOnly && this.level.codeFunctions,
    enableEvents: true
  });
  if (!this.JSInterpreter.initialized()) {
    return;
  }

  gameLabSprite.injectJSInterpreter(this.JSInterpreter);

  this.gameLabP5.p5specialFunctions.forEach(function (eventName) {
    var func = this.JSInterpreter.findGlobalFunction(eventName);
    if (func) {
      this.eventHandlers[eventName] = codegen.createNativeFunctionFromInterpreterFunction(func);
    }
  }, this);

  codegen.customMarshalObjectList = this.gameLabP5.getCustomMarshalObjectList();

  var propList = this.gameLabP5.getGlobalPropertyList();
  for (var prop in propList) {
    // Each entry in the propList is an array with 2 elements:
    // propListItem[0] - a native property value
    // propListItem[1] - the property's parent object
    this.JSInterpreter.createGlobalProperty(prop, propList[prop][0], propList[prop][1]);
  }

  /*
  if (this.checkForEditCodePreExecutionFailure()) {
   return this.onPuzzleComplete();
  }
  */
};

GameLab.prototype.onTick = function () {
  this.tickCount++;

  if (this.JSInterpreter) {
    this.JSInterpreter.executeInterpreter();

    if (!this.startedHandlingEvents && this.JSInterpreter.startedHandlingEvents) {
      // Call this once after we've started handling events
      this.startedHandlingEvents = true;
      this.gameLabP5.notifyUserGlobalCodeComplete();
    }

    this.completeSetupIfSetupComplete();
    this.completeRedrawIfDrawComplete();
  }
};

/**
 * This is called while this.gameLabP5 is in startExecution(). We use the
 * opportunity to create native event handlers that call down into interpreter
 * code for each event name.
 */
GameLab.prototype.onP5ExecutionStarting = function () {
  this.gameLabP5.p5eventNames.forEach(function (eventName) {
    window[eventName] = (function () {
      if (this.JSInterpreter && this.eventHandlers[eventName]) {
        this.eventHandlers[eventName].apply(null);
      }
    }).bind(this);
  }, this);
};

/**
 * This is called while this.gameLabP5 is in the preload phase. We initialize
 * the interpreter, start its execution, and call the user's preload function.
 */
GameLab.prototype.onP5Preload = function () {
  this.initInterpreter();
  // And execute the interpreter for the first time:
  if (this.JSInterpreter && this.JSInterpreter.initialized()) {
    this.JSInterpreter.executeInterpreter(true);

    // In addition, execute the global function called preload()
    if (this.eventHandlers.preload) {
      this.eventHandlers.preload.apply(null);
    }
  }
};

/**
 * This is called while this.gameLabP5 is in the setup phase. We restore the
 * interpreter methods that were modified during preload, then call the user's
 * setup function.
 */
GameLab.prototype.onP5Setup = function () {
  if (this.JSInterpreter) {
    // TODO: (cpirich) Remove this code once p5play supports instance mode:

    // Replace restored preload methods for the interpreter:
    for (var method in this.gameLabP5.p5._preloadMethods) {
      this.JSInterpreter.createGlobalProperty(method, this.gameLabP5.p5[method], this.gameLabP5.p5);
    }

    if (this.eventHandlers.setup) {
      this.setupInProgress = true;
      this.eventHandlers.setup.apply(null);
    }
    this.completeSetupIfSetupComplete();
  }
};

GameLab.prototype.completeSetupIfSetupComplete = function () {
  if (this.setupInProgress && this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterSetupComplete();
    this.setupInProgress = false;
  }
};

/**
 * This is called while this.gameLabP5 is in a draw() call. We call the user's
 * draw function.
 */
GameLab.prototype.onP5Draw = function () {
  if (this.JSInterpreter && this.eventHandlers.draw) {
    this.drawInProgress = true;
    this.eventHandlers.draw.apply(null);
  }
  this.completeRedrawIfDrawComplete();
};

GameLab.prototype.completeRedrawIfDrawComplete = function () {
  if (this.drawInProgress && this.JSInterpreter.seenReturnFromCallbackDuringExecution) {
    this.gameLabP5.afterDrawComplete();
    this.drawInProgress = false;
    $('#bubble').text('FPS: ' + this.gameLabP5.getFrameRate().toFixed(0));
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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsDebuggerUi":"/home/ubuntu/staging/apps/build/js/JsDebuggerUi.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../assetManagement/assetPrefix":"/home/ubuntu/staging/apps/build/js/assetManagement/assetPrefix.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./GameLabP5":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabP5.js","./GameLabSprite":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabSprite.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs":[function(require,module,exports){
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
    "sprite.bounce": null,
    "sprite.collide": null,
    "sprite.displace": null,
    "sprite.overlap": null,
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
    "group.bounce": null,
    "group.collide": null,
    "group.displace": null,
    "group.overlap": null,
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

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js":[function(require,module,exports){
'use strict';

var msg = require('./locale');
var api = require('./apiJavascript.js');
var showAssetManager = require('../assetManagement/show');
var getAssetDropdown = require('../assetManagement/getAssetDropdown');

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

var GameLab;

exports.injectGameLab = function (gamelab) {
  GameLab = gamelab;
};

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  showAssetManager(callback, typeFilter);
}

module.exports.blocks = [
// Game Lab
{ func: 'loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], type: 'either', dropdown: { 0: function _() {
      return getAssetDropdown('image');
    } }, assetTooltip: { 0: chooseAsset.bind(null, 'image') } }, { func: 'var_loadImage', category: 'Game Lab', blockPrefix: 'var img = loadImage', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true }, { func: 'image', category: 'Game Lab', paletteParams: ['image', 'srcX', 'srcY', 'srcW', 'srcH', 'x', 'y', 'w', 'h'], params: ["img", "0", "0", "img.width", "img.height", "0", "0", "img.width", "img.height"] }, { func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] }, { func: 'noFill', category: 'Game Lab' }, { func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] }, { func: 'noStroke', category: 'Game Lab' }, { func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] }, { func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"] }, { func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"] }, { func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"] }, { func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"] }, { func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"] }, { func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"] }, { func: 'textAlign', category: 'Game Lab', paletteParams: ['horiz', 'vert'], params: ["CENTER", "TOP"] }, { func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] }, { func: 'drawSprites', category: 'Game Lab' }, { func: 'allSprites', category: 'Game Lab', block: 'allSprites', type: 'property' }, { func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] }, { func: 'width', category: 'Game Lab', type: 'property' }, { func: 'height', category: 'Game Lab', type: 'property' }, { func: 'camera', category: 'Game Lab', type: 'property' }, { func: 'camera.on', category: 'Game Lab' }, { func: 'camera.off', category: 'Game Lab' }, { func: 'camera.active', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseX', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseY', category: 'Game Lab', type: 'property' }, { func: 'camera.position.x', category: 'Game Lab', type: 'property' }, { func: 'camera.position.y', category: 'Game Lab', type: 'property' }, { func: 'camera.zoom', category: 'Game Lab', type: 'property' },

// Sprites
{ func: 'createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'either' }, { func: 'var_createSprite', category: 'Sprites', blockPrefix: 'var sprite = createSprite', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], noAutocomplete: true }, { func: 'sprite.setSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.setSpeed' }, { func: 'sprite.getAnimationLabel', category: 'Sprites', modeOptionName: '*.getAnimationLabel', type: 'value' }, { func: 'sprite.getDirection', category: 'Sprites', modeOptionName: '*.getDirection', type: 'value' }, { func: 'sprite.getSpeed', category: 'Sprites', modeOptionName: '*.getSpeed', type: 'value' }, { func: 'sprite.remove', category: 'Sprites', modeOptionName: '*.remove' }, { func: 'sprite.addAnimation', category: 'Sprites', paletteParams: ['label', 'animation'], params: ['"anim1"', "anim"], modeOptionName: '*.addAnimation' }, { func: 'sprite.addImage', category: 'Sprites', paletteParams: ['label', 'image'], params: ['"img1"', "img"], modeOptionName: '*.addImage' }, { func: 'sprite.addSpeed', category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], modeOptionName: '*.addSpeed' }, { func: 'sprite.addToGroup', category: 'Sprites', paletteParams: ['group'], params: ["group"], modeOptionName: '*.addToGroup' }, { func: 'sprite.bounce', category: 'Sprites', paletteParams: ['target'], params: ["group"], modeOptionName: '*.bounce', type: 'either' }, { func: 'sprite.collide', category: 'Sprites', paletteParams: ['target'], params: ["group"], modeOptionName: '*.collide', type: 'either' }, { func: 'sprite.displace', category: 'Sprites', paletteParams: ['target'], params: ["group"], modeOptionName: '*.displace', type: 'either' }, { func: 'sprite.overlap', category: 'Sprites', paletteParams: ['target'], params: ["group"], modeOptionName: '*.overlap', type: 'either' }, { func: 'sprite.changeAnimation', category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], modeOptionName: '*.changeAnimation' }, { func: 'sprite.changeImage', category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], modeOptionName: '*.changeImage' }, { func: 'sprite.attractionPoint', category: 'Sprites', paletteParams: ['speed', 'x', 'y'], params: ["1", "200", "200"], modeOptionName: '*.attractionPoint' }, { func: 'sprite.limitSpeed', category: 'Sprites', paletteParams: ['max'], params: ["3"], modeOptionName: '*.limitSpeed' }, { func: 'sprite.setCollider', category: 'Sprites', paletteParams: ['type', 'x', 'y', 'w', 'h'], params: ['"rectangle"', "0", "0", "20", "20"], modeOptionName: '*.setCollider' }, { func: 'sprite.setVelocity', category: 'Sprites', paletteParams: ['x', 'y'], params: ["1", "1"], modeOptionName: '*.setVelocity' }, { func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' }, { func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' }, { func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property' }, { func: 'sprite.depth', category: 'Sprites', modeOptionName: '*.depth', type: 'property' }, { func: 'sprite.friction', category: 'Sprites', modeOptionName: '*.friction', type: 'property' }, { func: 'sprite.immovable', category: 'Sprites', modeOptionName: '*.immovable', type: 'property' }, { func: 'sprite.life', category: 'Sprites', modeOptionName: '*.life', type: 'property' }, { func: 'sprite.mass', category: 'Sprites', modeOptionName: '*.mass', type: 'property' }, { func: 'sprite.maxSpeed', category: 'Sprites', modeOptionName: '*.maxSpeed', type: 'property' }, { func: 'sprite.position', category: 'Sprites', modeOptionName: '*.position', type: 'property' }, { func: 'sprite.position.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.position.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.previousPosition', category: 'Sprites', modeOptionName: '*.previousPosition', type: 'property' }, { func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.removed', category: 'Sprites', modeOptionName: '*.removed', type: 'property' }, { func: 'sprite.restitution', category: 'Sprites', modeOptionName: '*.restitution', type: 'property' }, { func: 'sprite.rotateToDirection', category: 'Sprites', modeOptionName: '*.rotateToDirection', type: 'property' }, { func: 'sprite.rotation', category: 'Sprites', modeOptionName: '*.rotation', type: 'property' }, { func: 'sprite.rotationSpeed', category: 'Sprites', modeOptionName: '*.rotationSpeed', type: 'property' }, { func: 'sprite.scale', category: 'Sprites', modeOptionName: '*.scale', type: 'property' }, { func: 'sprite.shapeColor', category: 'Sprites', modeOptionName: '*.shapeColor', type: 'property' }, { func: 'sprite.touching', category: 'Sprites', modeOptionName: '*.touching', type: 'property' }, { func: 'sprite.velocity', category: 'Sprites', modeOptionName: '*.velocity', type: 'property' }, { func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: '*.x', type: 'property' }, { func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: '*.y', type: 'property' }, { func: 'sprite.visible', category: 'Sprites', modeOptionName: '*.visible', type: 'property' },
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
draw() - OVERRIDE and/or USEFUL?
mirrorX(dir) - USEFUL?
mirrorY(dir) - USEFUL?
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
{ func: 'Group', blockPrefix: 'var group = new Group', category: 'Groups', type: 'either' }, { func: 'group.add', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.add' }, { func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.remove' }, { func: 'group.clear', category: 'Groups', modeOptionName: '*.clear' }, { func: 'group.contains', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: '*.contains', type: 'value' }, { func: 'group.get', category: 'Groups', paletteParams: ['i'], params: ["0"], modeOptionName: '*.get', type: 'value' }, { func: 'group.bounce', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce' }, /* avoid modeOptionName conflict */
{ func: 'group.collide', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce' }, /* avoid modeOptionName conflict */
{ func: 'group.displace', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce' }, /* avoid modeOptionName conflict */
{ func: 'group.overlap', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce' }, /* avoid modeOptionName conflict */
{ func: 'group.maxDepth', category: 'Groups', modeOptionName: '*.maxDepth', type: 'value' }, { func: 'group.minDepth', category: 'Groups', modeOptionName: '*.minDepth', type: 'value' },

/* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
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

},{"../assetManagement/getAssetDropdown":"/home/ubuntu/staging/apps/build/js/assetManagement/getAssetDropdown.js","../assetManagement/show":"/home/ubuntu/staging/apps/build/js/assetManagement/show.js","./apiJavascript.js":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/locale.js":[function(require,module,exports){
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

},{}],"/home/ubuntu/staging/apps/build/js/gamelab/GameLabP5.js":[function(require,module,exports){
'use strict';
var gameLabSprite = require('./GameLabSprite');
var assetPrefix = require('../assetManagement/assetPrefix');

/**
 * An instantiable GameLabP5 class that wraps p5 and p5play and patches it in
 * specific places to enable GameLab functionality
 */
var GameLabP5 = function GameLabP5() {
  this.p5 = null;
  this.p5decrementPreload = null;
  this.p5eventNames = ['mouseMoved', 'mouseDragged', 'mousePressed', 'mouseReleased', 'mouseClicked', 'mouseWheel', 'keyPressed', 'keyReleased', 'keyTyped'];
  this.p5specialFunctions = ['preload', 'draw', 'setup'].concat(this.p5eventNames);
};

module.exports = GameLabP5;

GameLabP5.baseP5loadImage = null;

/**
 * Initialize this GameLabP5 instance.
 *
 * @param {!Object} options
 * @param {!Function} options.gameLab instance of parent GameLab object
 * @param {!Function} options.onExecutionStarting callback to run during p5 init
 * @param {!Function} options.onPreload callback to run during preload()
 * @param {!Function} options.onSetup callback to run during setup()
 * @param {!Function} options.onDraw callback to run during each draw()
 */
GameLabP5.prototype.init = function (options) {

  this.onExecutionStarting = options.onExecutionStarting;
  this.onPreload = options.onPreload;
  this.onSetup = options.onSetup;
  this.onDraw = options.onDraw;

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
  if (!GameLabP5.baseP5loadImage) {
    GameLabP5.baseP5loadImage = window.p5.prototype.loadImage;
    window.p5.prototype.loadImage = function (path, successCallback, failureCallback) {
      path = assetPrefix.fixPath(path);
      return GameLabP5.baseP5loadImage.call(this, path, successCallback, failureCallback);
    };
  }

  // Override p5.redraw to make it two-phase after userDraw()
  window.p5.prototype.redraw = function () {
    /*
     * Copied code from p5 from redraw()
     */
    var userSetup = this.setup || window.setup;
    var userDraw = this.draw || window.draw;
    if (typeof userDraw === 'function') {
      this.push();
      if (typeof userSetup === 'undefined') {
        this.scale(this.pixelDensity, this.pixelDensity);
      }
      var self = this;
      this._registeredMethods.pre.forEach(function (f) {
        f.call(self);
      });
      userDraw();
    }
  };

  // Create 2nd phase function afterUserDraw()
  window.p5.prototype.afterUserDraw = function () {
    var self = this;
    /*
     * Copied code from p5 from redraw()
     */
    this._registeredMethods.post.forEach(function (f) {
      f.call(self);
    });
    this.pop();
  };

  // Override p5.createSprite so we can replace the AABBops() function
  window.p5.prototype.createSprite = function (x, y, width, height) {
    /*
     * Copied code from p5play from createSprite()
     */
    var s = new window.Sprite(x, y, width, height);
    s.AABBops = gameLabSprite.AABBops;
    s.depth = window.allSprites.maxDepth() + 1;
    window.allSprites.add(s);
    return s;
  };

  // Override window.Group so we can override the methods that take callback
  // parameters
  var baseGroupConstructor = window.Group;
  window.Group = function () {
    var array = baseGroupConstructor();

    /*
     * Create new helper called callAABBopsForAll() which can be called as a
     * stateful nativeFunc by the interpreter. This enables the native method to
     * be called multiple times so that it can go asynchronous every time it
     * (or any native function that it calls, such as AABBops) wants to execute
     * a callback back into interpreter code. The interpreter state object is
     * retrieved by calling JSInterpreter.getCurrentState().
     *
     * Additional properties can be set on the state object to track state
     * across the multiple executions. If the function wants to be called again,
     * it should set state.doneExec to false. When the function is complete and
     * no longer wants to be called in a loop by the interpreter, it should set
     * state.doneExec to true and return a value.
     */
    array.callAABBopsForAll = function (type, target, callback) {
      var state = options.gameLab.JSInterpreter.getCurrentState();
      if (!state.__i) {
        state.__i = 0;
      }
      if (state.__i < this.size()) {
        if (!state.__subState) {
          // Before we call AABBops (another stateful function), hang a __subState
          // off of state, so it can use that instead to track its state:
          state.__subState = { doneExec: true };
        }
        this.get(state.__i).AABBops(type, target, callback);
        if (state.__subState.doneExec) {
          // Note: ignoring return value from each AABBops() call
          delete state.__subState;
          state.__i++;
        }
        state.doneExec = false;
      } else {
        state.doneExec = true;
      }
    };

    // Replace these four methods that take callback parameters to use the new
    // callAABBopsForAll() helper:

    array.overlap = function (target, callback) {
      this.callAABBopsForAll("overlap", target, callback);
    };

    array.collide = function (target, callback) {
      this.callAABBopsForAll("collide", target, callback);
    };

    array.displace = function (target, callback) {
      this.callAABBopsForAll("displace", target, callback);
    };

    array.bounce = function (target, callback) {
      this.callAABBopsForAll("bounce", target, callback);
    };

    return array;
  };
};

/**
 * Reset GameLabP5 to its initial state. Called before each time it is used.
 */
GameLabP5.prototype.resetExecution = function () {

  if (this.p5) {
    this.p5.remove();
    this.p5 = null;
    this.p5decrementPreload = null;

    /*
     * Copied code from various p5/p5play init code
     */

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

  // Important to reset these after this.p5 has been removed above
  this.drawInProgress = false;
  this.setupInProgress = false;

  window.p5.prototype.gamelabPreload = (function () {
    this.p5decrementPreload = window.p5._getDecrementPreload(arguments, this.p5);
  }).bind(this);
};

/**
 * Instantiate a new p5 and start execution
 */
GameLabP5.prototype.startExecution = function () {

  /* jshint nonew:false */
  new window.p5((function (p5obj) {
    this.p5 = p5obj;

    p5obj.registerPreloadMethod('gamelabPreload', window.p5.prototype);

    // Overload _draw function to make it two-phase
    p5obj._draw = (function () {
      /*
       * Copied code from p5 _draw()
       */
      this._thisFrameTime = window.performance.now();
      var time_since_last = this._thisFrameTime - this._lastFrameTime;
      var target_time_between_frames = 1000 / this._targetFrameRate;

      // only draw if we really need to; don't overextend the browser.
      // draw if we're within 5ms of when our next frame should paint
      // (this will prevent us from giving up opportunities to draw
      // again when it's really about time for us to do so). fixes an
      // issue where the frameRate is too low if our refresh loop isn't
      // in sync with the browser. note that we have to draw once even
      // if looping is off, so we bypass the time delay if that
      // is the case.
      var epsilon = 5;
      if (!this.loop || time_since_last >= target_time_between_frames - epsilon) {
        this._setProperty('frameCount', this.frameCount + 1);
        this.redraw();
      } else {
        this._drawEpilogue();
      }
    }).bind(p5obj);

    p5obj.afterRedraw = (function () {
      /*
       * Copied code from p5 _draw()
       */
      this._updatePAccelerations();
      this._updatePRotations();
      this._updatePMouseCoords();
      this._updatePTouchCoords();
      this._frameRate = 1000.0 / (this._thisFrameTime - this._lastFrameTime);
      this._lastFrameTime = this._thisFrameTime;

      this._drawEpilogue();
    }).bind(p5obj);

    p5obj._drawEpilogue = (function () {
      /*
       * Copied code from p5 _draw()
       */

      //mandatory update values(matrixs and stack) for 3d
      if (this._renderer.isP3D) {
        this._renderer._update();
      }

      // get notified the next time the browser gives us
      // an opportunity to draw.
      if (this._loop) {
        this._requestAnimId = window.requestAnimationFrame(this._draw);
      }
    }).bind(p5obj);

    // Overload _setup function to make it two-phase
    p5obj._setup = (function () {
      /*
       * Copied code from p5 _setup()
       */

      // return preload functions to their normal vals if switched by preload
      var context = this._isGlobal ? window : this;
      if (typeof context.preload === 'function') {
        for (var f in this._preloadMethods) {
          context[f] = this._preloadMethods[f][f];
        }
      }

      // Short-circuit on this, in case someone used the library in "global"
      // mode earlier
      if (typeof context.setup === 'function') {
        context.setup();
      } else {
        this._setupEpilogue();
      }
    }).bind(p5obj);

    p5obj._setupEpilogue = (function () {
      /*
       * Copied code from p5 _setup()
       */

      // // unhide hidden canvas that was created
      // this.canvas.style.visibility = '';
      // this.canvas.className = this.canvas.className.replace('p5_hidden', '');

      // unhide any hidden canvases that were created
      var reg = new RegExp(/(^|\s)p5_hidden(?!\S)/g);
      var canvases = document.getElementsByClassName('p5_hidden');
      for (var i = 0; i < canvases.length; i++) {
        var k = canvases[i];
        k.style.visibility = '';
        k.className = k.className.replace(reg, '');
      }
      this._setupDone = true;
    }).bind(p5obj);

    // Do this after we're done monkeying with the p5obj instance methods:
    p5obj.setupGlobalMode();

    window.preload = (function () {
      // Call our gamelabPreload() to force _start/_setup to wait.
      window.gamelabPreload();

      /*
       * p5 "preload methods" were modified before this preload function was
       * called and substituted with wrapped version that increment a preload
       * count and will later decrement a preload count upon async load
       * completion. Since p5 is running in global mode, it only wrapped the
       * methods on the window object. We need to place the wrapped methods on
       * the p5 object as well before we marshal to the interpreter
       */
      for (var method in this.p5._preloadMethods) {
        this.p5[method] = window[method];
      }

      this.onPreload();
    }).bind(this);
    window.setup = (function () {
      /*
       * p5 "preload methods" have now been restored and the wrapped version
       * are no longer in use. Since p5 is running in global mode, it only
       * restored the methods on the window object. We need to restore the
       * methods on the p5 object to match
       */
      for (var method in this.p5._preloadMethods) {
        this.p5[method] = window[method];
      }

      p5obj.createCanvas(400, 400);

      this.onSetup();
    }).bind(this);

    window.draw = this.onDraw.bind(this);

    this.onExecutionStarting();
  }).bind(this), 'divGameLab');
  /* jshint nonew:true */
};

/**
 * Called when all global code is done executing. This allows us to release
 * our "preload" count reference in p5, which means that setup() can begin.
 */
GameLabP5.prototype.notifyUserGlobalCodeComplete = function () {
  if (this.p5decrementPreload) {
    this.p5decrementPreload();
    this.p5decrementPreload = null;
  }
};

GameLabP5.prototype.getCustomMarshalGlobalProperties = function () {
  return {
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
  };
};

GameLabP5.prototype.getCustomMarshalObjectList = function () {
  return [{
    instance: window.Sprite,
    methodOpts: {
      nativeCallsBackInterpreter: true
    }
  },
  // The p5play Group object should be custom marshalled, but its constructor
  // actually creates a standard Array instance with a few additional methods
  // added. We solve this by putting "Array" in this list, but with "draw" as
  // a requiredMethod:
  {
    instance: Array,
    requiredMethod: 'draw',
    methodOpts: {
      nativeCallsBackInterpreter: true
    }
  }, { instance: window.p5 }, { instance: window.Camera }, { instance: window.Animation }, { instance: window.p5.Vector }, { instance: window.p5.Color }, { instance: window.p5.Image }, { instance: window.p5.Renderer }, { instance: window.p5.Graphics }, { instance: window.p5.Font }, { instance: window.p5.Table }, { instance: window.p5.TableRow }, { instance: window.p5.Element }];
};

GameLabP5.prototype.getGlobalPropertyList = function () {

  var propList = {};

  // Include every property on the p5 instance in the global property list:
  for (var prop in this.p5) {
    propList[prop] = [this.p5[prop], this.p5];
  }
  // And the Group constructor from p5play:
  propList.Group = [window.Group, window];
  // And also create a 'p5' object in the global namespace:
  propList.p5 = [{ Vector: window.p5.Vector }, window];

  return propList;
};

/**
 * Return the current frame rate
 */
GameLabP5.prototype.getFrameRate = function () {
  return this.p5 ? this.p5.frameRate() : 0;
};

GameLabP5.prototype.afterDrawComplete = function () {
  this.p5.afterUserDraw();
  this.p5.afterRedraw();
};

GameLabP5.prototype.afterSetupComplete = function () {
  this.p5._setupEpilogue();
};

},{"../assetManagement/assetPrefix":"/home/ubuntu/staging/apps/build/js/assetManagement/assetPrefix.js","./GameLabSprite":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabSprite.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/GameLabSprite.js":[function(require,module,exports){
// jshint ignore: start
/*
 * Override Sprite.AABBops so it can be called as a stateful nativeFunc by the
 * interpreter. This enables the native method to be called multiple times so
 * that it can go asynchronous every time it wants to execute a callback back
 * into interpreter code. The interpreter state object is retrieved by calling
 * jsInterpreter.getCurrentState().
 *
 * Additional properties can be set on the state object to track state across
 * the multiple executions. If the function wants to be called again, it should
 * set state.doneExec to false. When the function is complete and no longer
 * wants to be called in a loop by the interpreter, it should set state.doneExec
 * to true and return a value.
 */

"use strict";

var jsInterpreter;

module.exports.injectJSInterpreter = function (jsi) {
  jsInterpreter = jsi;
};

/*
 * Copied code from p5play from Sprite() with targeted modifications that
 * use the additional state parameter
 */
module.exports.AABBops = function (type, target, callback) {

  var state = jsInterpreter.getCurrentState();
  if (state.__subState) {
    // If we're being called by another stateful function that hung a __subState
    // off of state, use that instead:
    state = state.__subState;
  }
  var result = false;
  if (typeof state.__i === 'undefined') {
    state.__i = 0;

    this.touching.left = false;
    this.touching.right = false;
    this.touching.top = false;
    this.touching.bottom = false;

    //if single sprite turn into array anyway
    state.__others = [];

    if (target instanceof Sprite) state.__others.push(target);else if (target instanceof Array) {
      if (quadTree != undefined && quadTree.active) state.__others = quadTree.retrieveFromGroup(this, target);

      if (state.__others.length == 0) state.__others = target;
    } else throw "Error: overlap can only be checked between sprites or groups";
  } else {
    state.__i++;
  }
  if (state.__i < state.__others.length) {
    var i = state.__i;

    if (this != state.__others[i] && !this.removed) //you can check collisions within the same group but not on itself
      {
        var other = state.__others[i];

        if (this.collider == undefined) this.setDefaultCollider();

        if (other.collider == undefined) other.setDefaultCollider();

        /*
        if(this.colliderType=="default" && animations[currentAnimation]!=null)
        {
          print("busted");
          return false;
        }*/
        if (this.collider != undefined && other.collider != undefined) {
          if (type == "overlap") {
            var over;

            //if the other is a circle I calculate the displacement from here
            if (this.collider instanceof CircleCollider) over = other.collider.overlap(this.collider);else over = this.collider.overlap(other.collider);

            if (over) {

              result = true;

              if (callback != undefined && typeof callback == "function") callback.call(this, this, other);
            }
          } else if (type == "collide" || type == "bounce") {
            var displacement = createVector(0, 0);

            //if the sum of the speed is more than the collider i may
            //have a tunnelling problem
            var tunnelX = abs(this.velocity.x - other.velocity.x) >= other.collider.extents.x / 2 && round(this.deltaX - this.velocity.x) == 0;

            var tunnelY = abs(this.velocity.y - other.velocity.y) >= other.collider.size().y / 2 && round(this.deltaY - this.velocity.y) == 0;

            if (tunnelX || tunnelY) {
              //instead of using the colliders I use the bounding box
              //around the previous position and current position
              //this is regardless of the collider type

              //the center is the average of the coll centers
              var c = createVector((this.position.x + this.previousPosition.x) / 2, (this.position.y + this.previousPosition.y) / 2);

              //the extents are the distance between the coll centers
              //plus the extents of both
              var e = createVector(abs(this.position.x - this.previousPosition.x) + this.collider.extents.x, abs(this.position.y - this.previousPosition.y) + this.collider.extents.y);

              var bbox = new AABB(c, e, this.collider.offset);

              //bbox.draw();

              if (bbox.overlap(other.collider)) {
                if (tunnelX) {

                  //entering from the right
                  if (this.velocity.x < 0) displacement.x = other.collider.right() - this.collider.left() + 1;else if (this.velocity.x > 0) displacement.x = other.collider.left() - this.collider.right() - 1;
                }

                if (tunnelY) {
                  //from top
                  if (this.velocity.y > 0) displacement.y = other.collider.top() - this.collider.bottom() - 1;else if (this.velocity.y < 0) displacement.y = other.collider.bottom() - this.collider.top() + 1;
                }
              } //end overlap
            } else //non tunnel overlap
              {

                //if the other is a circle I calculate the displacement from here
                //and reverse it
                if (this.collider instanceof CircleCollider) {
                  displacement = other.collider.collide(this.collider).mult(-1);
                } else displacement = this.collider.collide(other.collider);
              }

            if (displacement.x == 0 && displacement.y == 0) result = false;else {

              if (!this.immovable) {
                this.position.add(displacement);
                this.previousPosition = createVector(this.position.x, this.position.y);
                this.newPosition = createVector(this.position.x, this.position.y);
              }

              if (displacement.x > 0) this.touching.left = true;
              if (displacement.x < 0) this.touching.right = true;
              if (displacement.y < 0) this.touching.bottom = true;
              if (displacement.y > 0) this.touching.top = true;

              if (type == "bounce") {
                if (other.immovable) {
                  var newVelX1 = -this.velocity.x + other.velocity.x;
                  var newVelY1 = -this.velocity.y + other.velocity.y;
                } else {
                  //
                  var newVelX1 = (this.velocity.x * (this.mass - other.mass) + 2 * other.mass * other.velocity.x) / (this.mass + other.mass);

                  var newVelY1 = (this.velocity.y * (this.mass - other.mass) + 2 * other.mass * other.velocity.y) / (this.mass + other.mass);

                  var newVelX2 = (other.velocity.x * (other.mass - this.mass) + 2 * this.mass * this.velocity.x) / (this.mass + other.mass);

                  var newVelY2 = (other.velocity.y * (other.mass - this.mass) + 2 * this.mass * this.velocity.y) / (this.mass + other.mass);
                }

                //var bothCircles = (this.collider instanceof CircleCollider &&
                //                   other.collider  instanceof CircleCollider);

                //if(this.touching.left || this.touching.right || this.collider instanceof CircleCollider)

                //print(displacement);

                if (abs(displacement.x) > abs(displacement.y)) {

                  if (!this.immovable) {
                    this.velocity.x = newVelX1 * this.restitution;
                  }

                  if (!other.immovable) other.velocity.x = newVelX2 * other.restitution;
                }
                //if(this.touching.top || this.touching.bottom || this.collider instanceof CircleCollider)
                if (abs(displacement.x) < abs(displacement.y)) {

                  if (!this.immovable) this.velocity.y = newVelY1 * this.restitution;

                  if (!other.immovable) other.velocity.y = newVelY2 * other.restitution;
                }
              }
              //else if(type == "collide")
              //this.velocity = createVector(0,0);

              if (callback != undefined && typeof callback == "function") callback.call(this, this, other);

              result = true;
            }
          } else if (type == "displace") {

            //if the other is a circle I calculate the displacement from here
            //and reverse it
            if (this.collider instanceof CircleCollider) displacement = other.collider.collide(this.collider).mult(-1);else displacement = this.collider.collide(other.collider);

            if (displacement.x == 0 && displacement.y == 0) result = false;else {
              other.position.sub(displacement);

              if (displacement.x > 0) this.touching.left = true;
              if (displacement.x < 0) this.touching.right = true;
              if (displacement.y < 0) this.touching.bottom = true;
              if (displacement.y > 0) this.touching.top = true;

              if (callback != undefined && typeof callback == "function") callback.call(this, this, other);

              result = true;
            }
          }
        } //end collider exists
      }
    // Not done, call again:
    state.doneExec = false;
  } else {
    state.doneExec = true;
  }

  return result;
};

},{}]},{},["/home/ubuntu/staging/apps/build/js/gamelab/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9HYW1lTGFiUDUuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWJTcHJpdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNyQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FB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QUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxFQUN2TSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN6QyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFDdkksRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekksRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3RHLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ3BGLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzVDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNsRixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3hELEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDekQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6RCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMxQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMzQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2hFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFB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LFNBQVMsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDakcsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3pGLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQy9GLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2pHLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN2RixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDdkYsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDL0YsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDL0YsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUMvRyxFQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNsRyxFQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNsRyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUM3RixFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNyRyxFQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2pILEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQy9GLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDekcsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3pGLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ25HLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQy9GLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQy9GLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QjdGLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQywyRUFBMkUsRUFBRSwyRUFBMkUsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFDcFEsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsMEJBQTBCLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLDJFQUEyRSxFQUFFLDJFQUEyRSxDQUFDLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxFQUN2VCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLEVBQzdILEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxFQUNoRixFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdkYsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzdGLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDckcsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLEVBQ3pILEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsRUFDdEUsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxFQUMxRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEVBQ3RFLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDeEcsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDcEcsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQzVGLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUM5RixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFOzs7Ozs7Ozs7O0FBVTlGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxFQUN0SCxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLEVBQ3JFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3pJLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFO0FBQzFILEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUU7QUFDM0gsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFO0FBQzVILEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUU7QUFDM0gsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7Ozs7Ozs7QUFPMUYsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUM3RCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3BELEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDeEQsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNwRyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hHLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdEcsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxTQUFTLEVBQUUsbUNBQW1DLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUM1SCxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLFNBQVMsRUFBRSxvQ0FBb0MsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQy9ILEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLGlDQUFpQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFDdEgsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN2RCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3ZELEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDeEQsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN4RCxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQzVELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUMvRCxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLDBCQUEwQixFQUFFLFNBQVMsRUFBRSxtQ0FBbUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQzVILEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLHFDQUFxQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFDbEksRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxTQUFTLEVBQUUscUNBQXFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUNsSSxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixFQUFFLFNBQVMsRUFBRSxzQ0FBc0MsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQ3JJLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLHFDQUFxQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFDbEksRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxTQUFTLEVBQUUsbUNBQW1DLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTs7O0FBRzVILEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDeEYsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDekYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN6RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3pGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNqRyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFDcEYsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3BHLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ2hGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdkYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN6RixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hILEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdEYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNwSCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3RGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNqRyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakosRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMvRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMs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QUM7O0FBRTdILHNCQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLEdBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxDQUFDOztBQUU3SCxzQkFBSSxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUEsQUFBQyxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUssSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBLEFBQUMsQ0FBQzs7QUFFNUgsc0JBQUksUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLENBQUM7aUJBQzdIOzs7Ozs7Ozs7QUFTRCxvQkFBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQzFDOztBQUdFLHNCQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDbEI7QUFDRSx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7bUJBRTdDOztBQUVELHNCQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7aUJBRWpEOztBQUVELG9CQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDMUM7O0FBRUUsc0JBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQzs7QUFFOUMsc0JBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUNqQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztpQkFDakQ7ZUFDRjs7OztBQUlELGtCQUFHLFFBQVEsSUFBSSxTQUFTLElBQUksT0FBTyxRQUFRLElBQUksVUFBVSxFQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRW5DLG9CQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Y7V0FJRixNQUNJLElBQUcsSUFBSSxJQUFFLFVBQVUsRUFBRzs7OztBQUl6QixnQkFBRyxJQUFJLENBQUMsUUFBUSxZQUFZLGNBQWMsRUFDeEMsWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUU5RCxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUd2RCxnQkFBRyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDNUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUVqQjtBQUNFLG1CQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFakMsa0JBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUM1QixrQkFBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDOUIsa0JBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQzs7QUFFM0Isa0JBQUcsUUFBUSxJQUFJLFNBQVMsSUFBSSxPQUFPLFFBQVEsSUFBSSxVQUFVLEVBQ3ZELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsb0JBQU0sR0FBRyxJQUFJLENBQUM7YUFDZjtXQUNGO1NBQ0Y7T0FDRjs7QUFFRCxTQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztHQUN4QixNQUFNO0FBQ0wsU0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7R0FDdkI7O0FBRUQsU0FBTyxNQUFNLENBQUM7Q0FDZixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG53aW5kb3cuZ2FtZWxhYk1haW4gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIHZhciBnYW1lbGFiID0gbmV3IEdhbWVMYWIoKTtcblxuICBnYW1lbGFiLmluamVjdFN0dWRpb0FwcChzdHVkaW9BcHApO1xuICBhcHBNYWluKGdhbWVsYWIsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIiwidmFyIHNraW5CYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5CYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIENETyBBcHA6IEdhbWVMYWJcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcblxudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIC8vIEJsb2NrIGRlZmluaXRpb25zLlxuICBibG9ja2x5LkJsb2Nrcy5nYW1lbGFiX2ZvbyA9IHtcbiAgICAvLyBCbG9jayBmb3IgZm9vLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5mb28oKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mb29Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZ2FtZWxhYl9mb28gPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZm9vLlxuICAgIHJldHVybiAnR2FtZUxhYi5mb28oKTtcXG4nO1xuICB9O1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBhcGlKYXZhc2NyaXB0ID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0Jyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG52YXIgSnNEZWJ1Z2dlclVpID0gcmVxdWlyZSgnLi4vSnNEZWJ1Z2dlclVpJyk7XG52YXIgSlNJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4uL0pTSW50ZXJwcmV0ZXInKTtcbnZhciBKc0ludGVycHJldGVyTG9nZ2VyID0gcmVxdWlyZSgnLi4vSnNJbnRlcnByZXRlckxvZ2dlcicpO1xudmFyIEdhbWVMYWJQNSA9IHJlcXVpcmUoJy4vR2FtZUxhYlA1Jyk7XG52YXIgZ2FtZUxhYlNwcml0ZSA9IHJlcXVpcmUoJy4vR2FtZUxhYlNwcml0ZScpO1xudmFyIGFzc2V0UHJlZml4ID0gcmVxdWlyZSgnLi4vYXNzZXRNYW5hZ2VtZW50L2Fzc2V0UHJlZml4Jyk7XG5cbnZhciBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0sgPSA1MDAwMDA7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEdhbWVMYWIgY2xhc3NcbiAqL1xudmFyIEdhbWVMYWIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2tpbiA9IG51bGw7XG4gIHRoaXMubGV2ZWwgPSBudWxsO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qKiBAdHlwZSB7U3R1ZGlvQXBwfSAqL1xuICB0aGlzLnN0dWRpb0FwcF8gPSBudWxsO1xuXG4gIC8qKiBAdHlwZSB7SlNJbnRlcnByZXRlcn0gKi9cbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcblxuICAvKiogQHByaXZhdGUge0pzSW50ZXJwcmV0ZXJMb2dnZXJ9ICovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8gPSBuZXcgSnNJbnRlcnByZXRlckxvZ2dlcih3aW5kb3cuY29uc29sZSk7XG5cbiAgLyoqIEB0eXBlIHtKc0RlYnVnZ2VyVWl9ICovXG4gIHRoaXMuZGVidWdnZXJfID0gbmV3IEpzRGVidWdnZXJVaSh0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzID0gZmFsc2U7XG4gIHRoaXMuZ2FtZUxhYlA1ID0gbmV3IEdhbWVMYWJQNSgpO1xuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcblxuICBkcm9wbGV0Q29uZmlnLmluamVjdEdhbWVMYWIodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWI7XG5cbi8qKlxuICogSW5qZWN0IHRoZSBzdHVkaW9BcHAgc2luZ2xldG9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG5HYW1lTGFiLmJhc2VQNWxvYWRJbWFnZSA9IG51bGw7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGlzIEdhbWVMYWIgaW5zdGFuY2UuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWVMYWIgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBjb25maWcudXNlc0Fzc2V0cyA9IHRydWU7XG5cbiAgdGhpcy5nYW1lTGFiUDUuaW5pdCh7XG4gICAgZ2FtZUxhYjogdGhpcyxcbiAgICBvbkV4ZWN1dGlvblN0YXJ0aW5nOiB0aGlzLm9uUDVFeGVjdXRpb25TdGFydGluZy5iaW5kKHRoaXMpLFxuICAgIG9uUHJlbG9hZDogdGhpcy5vblA1UHJlbG9hZC5iaW5kKHRoaXMpLFxuICAgIG9uU2V0dXA6IHRoaXMub25QNVNldHVwLmJpbmQodGhpcyksXG4gICAgb25EcmF3OiB0aGlzLm9uUDVEcmF3LmJpbmQodGhpcylcbiAgfSk7XG5cbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuICBjb25maWcuYXBwTXNnID0gbXNnO1xuXG4gIHZhciBzaG93RmluaXNoQnV0dG9uID0gIXRoaXMubGV2ZWwuaXNQcm9qZWN0TGV2ZWw7XG4gIHZhciBmaW5pc2hCdXR0b25GaXJzdExpbmUgPSBfLmlzRW1wdHkodGhpcy5sZXZlbC5zb2Z0QnV0dG9ucyk7XG4gIHZhciBhcmVCcmVha3BvaW50c0VuYWJsZWQgPSB0cnVlO1xuICB2YXIgZmlyc3RDb250cm9sc1JvdyA9IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246IGZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IHRoaXMuZGVidWdnZXJfLmdldE1hcmt1cCh0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsIHtcbiAgICBzaG93QnV0dG9uczogdHJ1ZSxcbiAgICBzaG93Q29uc29sZTogdHJ1ZVxuICB9KTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IGZpcnN0Q29udHJvbHNSb3csXG4gICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlciA6IHVuZGVmaW5lZCxcbiAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHBpbldvcmtzcGFjZVRvQm90dG9tOiB0cnVlLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IHRoaXMubG9hZEF1ZGlvXy5iaW5kKHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSB0aGlzLmFmdGVySW5qZWN0Xy5iaW5kKHRoaXMsIGNvbmZpZyk7XG4gIGNvbmZpZy5hZnRlckVkaXRvclJlYWR5ID0gdGhpcy5hZnRlckVkaXRvclJlYWR5Xy5iaW5kKHRoaXMsIGFyZUJyZWFrcG9pbnRzRW5hYmxlZCk7XG5cbiAgLy8gU3RvcmUgcDVzcGVjaWFsRnVuY3Rpb25zIGluIHRoZSB1bnVzZWRDb25maWcgYXJyYXkgc28gd2UgZG9uJ3QgZ2l2ZSB3YXJuaW5nc1xuICAvLyBhYm91dCB0aGVzZSBmdW5jdGlvbnMgbm90IGJlaW5nIGNhbGxlZDpcbiAgY29uZmlnLnVudXNlZENvbmZpZyA9IHRoaXMuZ2FtZUxhYlA1LnA1c3BlY2lhbEZ1bmN0aW9ucztcblxuICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xuXG4gIHRoaXMuZGVidWdnZXJfLmluaXRpYWxpemVBZnRlckRvbUNyZWF0ZWQoe1xuICAgIGRlZmF1bHRTdGVwU3BlZWQ6IDFcbiAgfSk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5sb2FkQXVkaW9fID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xufTtcblxuLyoqXG4gKiBDb2RlIGNhbGxlZCBhZnRlciB0aGUgYmxvY2tseSBkaXYgKyBibG9ja2x5IGNvcmUgaXMgaW5qZWN0ZWQgaW50byB0aGUgZG9jdW1lbnRcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuYWZ0ZXJJbmplY3RfID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIEFkZCB0byByZXNlcnZlZCB3b3JkIGxpc3Q6IEFQSSwgbG9jYWwgdmFyaWFibGVzIGluIGV4ZWN1dGlvbiBldmlyb25tZW50XG4gICAgLy8gKGV4ZWN1dGUpIGFuZCB0aGUgaW5maW5pdGUgbG9vcCBkZXRlY3Rpb24gZnVuY3Rpb24uXG4gICAgQmxvY2tseS5KYXZhU2NyaXB0LmFkZFJlc2VydmVkV29yZHMoJ0dhbWVMYWIsY29kZScpO1xuICB9XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG5cbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICBkaXZHYW1lTGFiLnN0eWxlLndpZHRoID0gJzQwMHB4JztcbiAgZGl2R2FtZUxhYi5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuXG59O1xuXG4vKipcbiAqIEluaXRpYWxpemF0aW9uIHRvIHJ1biBhZnRlciBhY2UvZHJvcGxldCBpcyBpbml0aWFsaXplZC5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGFyZUJyZWFrcG9pbnRzRW5hYmxlZFxuICogQHByaXZhdGVcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuYWZ0ZXJFZGl0b3JSZWFkeV8gPSBmdW5jdGlvbiAoYXJlQnJlYWtwb2ludHNFbmFibGVkKSB7XG4gIGlmIChhcmVCcmVha3BvaW50c0VuYWJsZWQpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8uZW5hYmxlQnJlYWtwb2ludHMoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXNldCBHYW1lTGFiIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICogQHBhcmFtIHtib29sZWFufSBpZ25vcmUgUmVxdWlyZWQgYnkgdGhlIEFQSSBidXQgaWdub3JlZCBieSB0aGlzXG4gKiAgICAgaW1wbGVtZW50YXRpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKGlnbm9yZSkge1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLnRpY2tJbnRlcnZhbElkKTtcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IDA7XG4gIHRoaXMudGlja0NvdW50ID0gMDtcblxuICAvKlxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIHdoaWxlIChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpIHtcbiAgICBkaXZHYW1lTGFiLnJlbW92ZUNoaWxkKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCk7XG4gIH1cbiAgKi9cblxuICB0aGlzLmdhbWVMYWJQNS5yZXNldEV4ZWN1dGlvbigpO1xuICBcbiAgLy8gSW1wb3J0IHRvIHJlc2V0IHRoZXNlIGFmdGVyIHRoaXMuZ2FtZUxhYlA1IGhhcyBiZWVuIHJlc2V0XG4gIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgdGhpcy5zZXR1cEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgdGhpcy5zdGFydGVkSGFuZGxpbmdFdmVudHMgPSBmYWxzZTtcblxuICB0aGlzLmRlYnVnZ2VyXy5kZXRhY2goKTtcbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5kZXRhY2goKTtcblxuICAvLyBEaXNjYXJkIHRoZSBpbnRlcnByZXRlci5cbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5kZWluaXRpYWxpemUoKTtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBudWxsO1xuICB9XG4gIHRoaXMuZXhlY3V0aW9uRXJyb3IgPSBudWxsO1xufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgfVxuICB0aGlzLnN0dWRpb0FwcF8uYXR0ZW1wdHMrKztcbiAgdGhpcy5leGVjdXRlKCk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5ldmFsQ29kZSA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgdHJ5IHtcbiAgICBjb2RlZ2VuLmV2YWxXaXRoKGNvZGUsIHtcbiAgICAgIEdhbWVMYWI6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJbmZpbml0eSBpcyB0aHJvd24gaWYgd2UgZGV0ZWN0IGFuIGluZmluaXRlIGxvb3AuIEluIHRoYXQgY2FzZSB3ZSdsbFxuICAgIC8vIHN0b3AgZnVydGhlciBleGVjdXRpb24sIGFuaW1hdGUgd2hhdCBvY2N1cmVkIGJlZm9yZSB0aGUgaW5maW5pdGUgbG9vcCxcbiAgICAvLyBhbmQgYW5hbHl6ZSBzdWNjZXNzL2ZhaWx1cmUgYmFzZWQgb24gd2hhdCB3YXMgZHJhd24uXG4gICAgLy8gT3RoZXJ3aXNlLCBhYm5vcm1hbCB0ZXJtaW5hdGlvbiBpcyBhIHVzZXIgZXJyb3IuXG4gICAgaWYgKGUgIT09IEluZmluaXR5KSB7XG4gICAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgICBpZiAod2luZG93Lm9uZXJyb3IpIHtcbiAgICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5hbGVydChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIFJlc2V0IGFsbCBzdGF0ZS5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0KCk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpICYmXG4gICAgICAodGhpcy5zdHVkaW9BcHBfLmhhc0V4dHJhVG9wQmxvY2tzKCkgfHxcbiAgICAgICAgdGhpcy5zdHVkaW9BcHBfLmhhc0R1cGxpY2F0ZVZhcmlhYmxlc0luRm9yTG9vcHMoKSkpIHtcbiAgICAvLyBpbW1lZGlhdGVseSBjaGVjayBhbnN3ZXIsIHdoaWNoIHdpbGwgZmFpbCBhbmQgcmVwb3J0IHRvcCBsZXZlbCBibG9ja3NcbiAgICB0aGlzLmNoZWNrQW5zd2VyKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5nYW1lTGFiUDUuc3RhcnRFeGVjdXRpb24oKTtcblxuICBpZiAoIXRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICB0aGlzLmNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gICAgdGhpcy5ldmFsQ29kZSh0aGlzLmNvZGUpO1xuICB9XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnc3RhcnQnKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBEaXNhYmxlIHRvb2xib3ggd2hpbGUgcnVubmluZ1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveChmYWxzZSk7XG4gIH1cblxuICAvLyBTZXQgdG8gMW1zIGludGVydmFsLCBidXQgbm90ZSB0aGF0IGJyb3dzZXIgbWluaW11bXMgYXJlIGFjdHVhbGx5IDUtMTZtczpcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChfLmJpbmQodGhpcy5vblRpY2ssIHRoaXMpLCAxKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmluaXRJbnRlcnByZXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5KU0ludGVycHJldGVyID0gbmV3IEpTSW50ZXJwcmV0ZXIoe1xuICAgIHN0dWRpb0FwcDogdGhpcy5zdHVkaW9BcHBfLFxuICAgIG1heEludGVycHJldGVyU3RlcHNQZXJUaWNrOiBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0ssXG4gICAgY3VzdG9tTWFyc2hhbEdsb2JhbFByb3BlcnRpZXM6IHRoaXMuZ2FtZUxhYlA1LmdldEN1c3RvbU1hcnNoYWxHbG9iYWxQcm9wZXJ0aWVzKClcbiAgfSk7XG4gIHRoaXMuSlNJbnRlcnByZXRlci5vbkV4ZWN1dGlvbkVycm9yLnJlZ2lzdGVyKHRoaXMuaGFuZGxlRXhlY3V0aW9uRXJyb3IuYmluZCh0aGlzKSk7XG4gIHRoaXMuY29uc29sZUxvZ2dlcl8uYXR0YWNoVG8odGhpcy5KU0ludGVycHJldGVyKTtcbiAgdGhpcy5kZWJ1Z2dlcl8uYXR0YWNoVG8odGhpcy5KU0ludGVycHJldGVyKTtcbiAgdGhpcy5KU0ludGVycHJldGVyLnBhcnNlKHtcbiAgICBjb2RlOiB0aGlzLnN0dWRpb0FwcF8uZ2V0Q29kZSgpLFxuICAgIGJsb2NrczogZHJvcGxldENvbmZpZy5ibG9ja3MsXG4gICAgYmxvY2tGaWx0ZXI6IHRoaXMubGV2ZWwuZXhlY3V0ZVBhbGV0dGVBcGlzT25seSAmJiB0aGlzLmxldmVsLmNvZGVGdW5jdGlvbnMsXG4gICAgZW5hYmxlRXZlbnRzOiB0cnVlXG4gIH0pO1xuICBpZiAoIXRoaXMuSlNJbnRlcnByZXRlci5pbml0aWFsaXplZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ2FtZUxhYlNwcml0ZS5pbmplY3RKU0ludGVycHJldGVyKHRoaXMuSlNJbnRlcnByZXRlcik7XG5cbiAgdGhpcy5nYW1lTGFiUDUucDVzcGVjaWFsRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgIHZhciBmdW5jID0gdGhpcy5KU0ludGVycHJldGVyLmZpbmRHbG9iYWxGdW5jdGlvbihldmVudE5hbWUpO1xuICAgIGlmIChmdW5jKSB7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSA9XG4gICAgICAgICAgY29kZWdlbi5jcmVhdGVOYXRpdmVGdW5jdGlvbkZyb21JbnRlcnByZXRlckZ1bmN0aW9uKGZ1bmMpO1xuICAgIH1cbiAgfSwgdGhpcyk7XG5cbiAgY29kZWdlbi5jdXN0b21NYXJzaGFsT2JqZWN0TGlzdCA9IHRoaXMuZ2FtZUxhYlA1LmdldEN1c3RvbU1hcnNoYWxPYmplY3RMaXN0KCk7XG5cbiAgdmFyIHByb3BMaXN0ID0gdGhpcy5nYW1lTGFiUDUuZ2V0R2xvYmFsUHJvcGVydHlMaXN0KCk7XG4gIGZvciAodmFyIHByb3AgaW4gcHJvcExpc3QpIHtcbiAgICAvLyBFYWNoIGVudHJ5IGluIHRoZSBwcm9wTGlzdCBpcyBhbiBhcnJheSB3aXRoIDIgZWxlbWVudHM6XG4gICAgLy8gcHJvcExpc3RJdGVtWzBdIC0gYSBuYXRpdmUgcHJvcGVydHkgdmFsdWVcbiAgICAvLyBwcm9wTGlzdEl0ZW1bMV0gLSB0aGUgcHJvcGVydHkncyBwYXJlbnQgb2JqZWN0XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KFxuICAgICAgICBwcm9wLFxuICAgICAgICBwcm9wTGlzdFtwcm9wXVswXSxcbiAgICAgICAgcHJvcExpc3RbcHJvcF1bMV0pO1xuICB9XG5cbiAgLypcbiAgaWYgKHRoaXMuY2hlY2tGb3JFZGl0Q29kZVByZUV4ZWN1dGlvbkZhaWx1cmUoKSkge1xuICAgcmV0dXJuIHRoaXMub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG4gICovXG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5vblRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudGlja0NvdW50Kys7XG5cbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIoKTtcblxuICAgIGlmICghdGhpcy5zdGFydGVkSGFuZGxpbmdFdmVudHMgJiYgdGhpcy5KU0ludGVycHJldGVyLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cykge1xuICAgICAgLy8gQ2FsbCB0aGlzIG9uY2UgYWZ0ZXIgd2UndmUgc3RhcnRlZCBoYW5kbGluZyBldmVudHNcbiAgICAgIHRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ2FtZUxhYlA1Lm5vdGlmeVVzZXJHbG9iYWxDb2RlQ29tcGxldGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXBsZXRlU2V0dXBJZlNldHVwQ29tcGxldGUoKTtcbiAgICB0aGlzLmNvbXBsZXRlUmVkcmF3SWZEcmF3Q29tcGxldGUoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCB3aGlsZSB0aGlzLmdhbWVMYWJQNSBpcyBpbiBzdGFydEV4ZWN1dGlvbigpLiBXZSB1c2UgdGhlXG4gKiBvcHBvcnR1bml0eSB0byBjcmVhdGUgbmF0aXZlIGV2ZW50IGhhbmRsZXJzIHRoYXQgY2FsbCBkb3duIGludG8gaW50ZXJwcmV0ZXJcbiAqIGNvZGUgZm9yIGVhY2ggZXZlbnQgbmFtZS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25QNUV4ZWN1dGlvblN0YXJ0aW5nID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmdhbWVMYWJQNS5wNWV2ZW50TmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgd2luZG93W2V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdLmFwcGx5KG51bGwpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcbiAgfSwgdGhpcyk7XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgY2FsbGVkIHdoaWxlIHRoaXMuZ2FtZUxhYlA1IGlzIGluIHRoZSBwcmVsb2FkIHBoYXNlLiBXZSBpbml0aWFsaXplXG4gKiB0aGUgaW50ZXJwcmV0ZXIsIHN0YXJ0IGl0cyBleGVjdXRpb24sIGFuZCBjYWxsIHRoZSB1c2VyJ3MgcHJlbG9hZCBmdW5jdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25QNVByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuaW5pdEludGVycHJldGVyKCk7XG4gIC8vIEFuZCBleGVjdXRlIHRoZSBpbnRlcnByZXRlciBmb3IgdGhlIGZpcnN0IHRpbWU6XG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKHRydWUpO1xuXG4gICAgLy8gSW4gYWRkaXRpb24sIGV4ZWN1dGUgdGhlIGdsb2JhbCBmdW5jdGlvbiBjYWxsZWQgcHJlbG9hZCgpXG4gICAgaWYgKHRoaXMuZXZlbnRIYW5kbGVycy5wcmVsb2FkKSB7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMucHJlbG9hZC5hcHBseShudWxsKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gdGhlIHNldHVwIHBoYXNlLiBXZSByZXN0b3JlIHRoZVxuICogaW50ZXJwcmV0ZXIgbWV0aG9kcyB0aGF0IHdlcmUgbW9kaWZpZWQgZHVyaW5nIHByZWxvYWQsIHRoZW4gY2FsbCB0aGUgdXNlcidzXG4gKiBzZXR1cCBmdW5jdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25QNVNldHVwID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgLy8gVE9ETzogKGNwaXJpY2gpIFJlbW92ZSB0aGlzIGNvZGUgb25jZSBwNXBsYXkgc3VwcG9ydHMgaW5zdGFuY2UgbW9kZTpcblxuICAgIC8vIFJlcGxhY2UgcmVzdG9yZWQgcHJlbG9hZCBtZXRob2RzIGZvciB0aGUgaW50ZXJwcmV0ZXI6XG4gICAgZm9yICh2YXIgbWV0aG9kIGluIHRoaXMuZ2FtZUxhYlA1LnA1Ll9wcmVsb2FkTWV0aG9kcykge1xuICAgICAgdGhpcy5KU0ludGVycHJldGVyLmNyZWF0ZUdsb2JhbFByb3BlcnR5KFxuICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICB0aGlzLmdhbWVMYWJQNS5wNVttZXRob2RdLFxuICAgICAgICAgIHRoaXMuZ2FtZUxhYlA1LnA1KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5ldmVudEhhbmRsZXJzLnNldHVwKSB7XG4gICAgICB0aGlzLnNldHVwSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc2V0dXAuYXBwbHkobnVsbCk7XG4gICAgfVxuICAgIHRoaXMuY29tcGxldGVTZXR1cElmU2V0dXBDb21wbGV0ZSgpO1xuICB9XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5jb21wbGV0ZVNldHVwSWZTZXR1cENvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5zZXR1cEluUHJvZ3Jlc3MgJiYgdGhpcy5KU0ludGVycHJldGVyLnNlZW5SZXR1cm5Gcm9tQ2FsbGJhY2tEdXJpbmdFeGVjdXRpb24pIHtcbiAgICB0aGlzLmdhbWVMYWJQNS5hZnRlclNldHVwQ29tcGxldGUoKTtcbiAgICB0aGlzLnNldHVwSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgY2FsbGVkIHdoaWxlIHRoaXMuZ2FtZUxhYlA1IGlzIGluIGEgZHJhdygpIGNhbGwuIFdlIGNhbGwgdGhlIHVzZXInc1xuICogZHJhdyBmdW5jdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25QNURyYXcgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzLmRyYXcpIHtcbiAgICB0aGlzLmRyYXdJblByb2dyZXNzID0gdHJ1ZTtcbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdy5hcHBseShudWxsKTtcbiAgfVxuICB0aGlzLmNvbXBsZXRlUmVkcmF3SWZEcmF3Q29tcGxldGUoKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmNvbXBsZXRlUmVkcmF3SWZEcmF3Q29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmRyYXdJblByb2dyZXNzICYmIHRoaXMuSlNJbnRlcnByZXRlci5zZWVuUmV0dXJuRnJvbUNhbGxiYWNrRHVyaW5nRXhlY3V0aW9uKSB7XG4gICAgdGhpcy5nYW1lTGFiUDUuYWZ0ZXJEcmF3Q29tcGxldGUoKTtcbiAgICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gICAgJCgnI2J1YmJsZScpLnRleHQoJ0ZQUzogJyArIHRoaXMuZ2FtZUxhYlA1LmdldEZyYW1lUmF0ZSgpLnRvRml4ZWQoMCkpO1xuICB9XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5oYW5kbGVFeGVjdXRpb25FcnJvciA9IGZ1bmN0aW9uIChlcnIsIGxpbmVOdW1iZXIpIHtcbi8qXG4gIG91dHB1dEVycm9yKFN0cmluZyhlcnIpLCBFcnJvckxldmVsLkVSUk9SLCBsaW5lTnVtYmVyKTtcbiAgU3R1ZGlvLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogbGluZU51bWJlciB9O1xuXG4gIC8vIENhbGwgb25QdXp6bGVDb21wbGV0ZSgpIGlmIHN5bnRheCBlcnJvciBvciBhbnkgdGltZSB3ZSdyZSBub3Qgb24gYSBmcmVlcGxheSBsZXZlbDpcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgLy8gTWFyayBwcmVFeGVjdXRpb25GYWlsdXJlIGFuZCB0ZXN0UmVzdWx0cyBpbW1lZGlhdGVseSBzbyB0aGF0IGFuIGVycm9yXG4gICAgLy8gbWVzc2FnZSBhbHdheXMgYXBwZWFycywgZXZlbiBvbiBmcmVlcGxheTpcbiAgICBTdHVkaW8ucHJlRXhlY3V0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgU3R1ZGlvLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuU1lOVEFYX0VSUk9SX0ZBSUw7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfSBlbHNlIGlmICghbGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG4qL1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmxvZyhlcnIpO1xuICB0aHJvdyBlcnI7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGFuIEFQSSBjb21tYW5kLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlQ21kID0gZnVuY3Rpb24gKGlkLCBuYW1lLCBvcHRzKSB7XG4gIGNvbnNvbGUubG9nKFwiR2FtZUxhYiBleGVjdXRlQ21kIFwiICsgbmFtZSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5maW5pc2hFeGVjdXRpb25fID0gZnVuY3Rpb24gKCkge1xuICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5oaWdobGlnaHRCbG9jayhudWxsKTtcbiAgfVxuICB0aGlzLmNoZWNrQW5zd2VyKCk7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZGlzcGxheUZlZWRiYWNrXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIHNraW46IHRoaXMuc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgIHJlc3BvbnNlOiB0aGlzLnJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICAvLyBmZWVkYmFja0ltYWdlOiBmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIiksXG4gICAgLy8gYWRkICdpbXByZXNzaXZlJzp0cnVlIHRvIG5vbi1mcmVlcGxheSBsZXZlbHMgdGhhdCB3ZSBkZWVtIGFyZSByZWxhdGl2ZWx5IGltcHJlc3NpdmUgKHNlZSAjNjY5OTA0ODApXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkgLyogfHwgbGV2ZWwuaW1wcmVzc2l2ZSAqLyksXG4gICAgLy8gaW1wcmVzc2l2ZSBsZXZlbHMgYXJlIGFscmVhZHkgc2F2ZWRcbiAgICAvLyBhbHJlYWR5U2F2ZWQ6IGxldmVsLmltcHJlc3NpdmUsXG4gICAgLy8gYWxsb3cgdXNlcnMgdG8gc2F2ZSBmcmVlcGxheSBsZXZlbHMgdG8gdGhlaXIgZ2FsbGVyeSAoaW1wcmVzc2l2ZSBub24tZnJlZXBsYXkgbGV2ZWxzIGFyZSBhdXRvc2F2ZWQpXG4gICAgc2F2ZVRvR2FsbGVyeVVybDogbGV2ZWwuZnJlZVBsYXkgJiYgdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnNhdmVfdG9fZ2FsbGVyeV91cmwsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogbXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgIHNoYXJpbmdUZXh0OiBtc2cuc2hhcmVEcmF3aW5nKClcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGxheUZlZWRiYWNrXygpO1xufTtcblxuLyoqXG4gKiBWZXJpZnkgaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0LlxuICogSWYgc28sIG1vdmUgb24gdG8gbmV4dCBsZXZlbC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXkgbGV2ZWwsIG9yIHRoZSBsZXZlbCBoYXNcbiAgLy8gYmVlbiBjb21wbGV0ZWRcbiAgdmFyIGxldmVsQ29tcGxldGUgPSBsZXZlbC5mcmVlUGxheSAmJiAoIWxldmVsLmVkaXRDb2RlIHx8ICF0aGlzLmV4ZWN1dGlvbkVycm9yKTtcbiAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgcmV1c2UgYW4gb2xkIG1lc3NhZ2UsIHNpbmNlIG5vdCBhbGwgcGF0aHMgc2V0IG9uZS5cbiAgdGhpcy5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBJZiB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSwgYWx3YXlzIHJldHVybiB0aGUgZnJlZSBwbGF5XG4gIC8vIHJlc3VsdCB0eXBlXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgLy8gUGxheSBzb3VuZFxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPT09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVkgfHxcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBsZXZlbENvbXBsZXRlLFxuICAgIHRlc3RSZXN1bHQ6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IF8uYmluZCh0aGlzLm9uUmVwb3J0Q29tcGxldGUsIHRoaXMpLFxuICAgIC8vIHNhdmVfdG9fZ2FsbGVyeTogbGV2ZWwuaW1wcmVzc2l2ZVxuICB9O1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIFRoZSBjYWxsIHRvIGRpc3BsYXlGZWVkYmFjaygpIHdpbGwgaGFwcGVuIGxhdGVyIGluIG9uUmVwb3J0Q29tcGxldGUoKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPGRpdiBpZD1cImRpdkdhbWVMYWJcIiB0YWJpbmRleD1cIjFcIj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdGIgPSBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3g7XG52YXIgYmxvY2tPZlR5cGUgPSBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlO1xudmFyIGNyZWF0ZUNhdGVnb3J5ID0gYmxvY2tVdGlscy5jcmVhdGVDYXRlZ29yeTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cbnZhciBsZXZlbHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5sZXZlbHMuc2FuZGJveCA9ICB7XG4gIGlkZWFsOiBJbmZpbml0eSxcbiAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc29mdEJ1dHRvbnM6IFtcbiAgICAnbGVmdEJ1dHRvbicsXG4gICAgJ3JpZ2h0QnV0dG9uJyxcbiAgICAnZG93bkJ1dHRvbicsXG4gICAgJ3VwQnV0dG9uJ1xuICBdLFxuICBmcmVlUGxheTogdHJ1ZSxcbiAgdG9vbGJveDpcbiAgICB0YihibG9ja09mVHlwZSgnZ2FtZWxhYl9mb28nKSksXG4gIHN0YXJ0QmxvY2tzOlxuICAgJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xufTtcblxuLy8gQmFzZSBjb25maWcgZm9yIGxldmVscyBjcmVhdGVkIHZpYSBsZXZlbGJ1aWxkZXJcbmxldmVscy5jdXN0b20gPSB1dGlscy5leHRlbmQobGV2ZWxzLnNhbmRib3gsIHtcbiAgZWRpdENvZGU6IHRydWUsXG4gIGNvZGVGdW5jdGlvbnM6IHtcbiAgICAvLyBHYW1lIExhYlxuICAgIFwidmFyX2xvYWRJbWFnZVwiOiBudWxsLFxuICAgIFwiaW1hZ2VcIjogbnVsbCxcbiAgICBcImZpbGxcIjogbnVsbCxcbiAgICBcIm5vRmlsbFwiOiBudWxsLFxuICAgIFwic3Ryb2tlXCI6IG51bGwsXG4gICAgXCJub1N0cm9rZVwiOiBudWxsLFxuICAgIFwiYXJjXCI6IG51bGwsXG4gICAgXCJlbGxpcHNlXCI6IG51bGwsXG4gICAgXCJsaW5lXCI6IG51bGwsXG4gICAgXCJwb2ludFwiOiBudWxsLFxuICAgIFwicmVjdFwiOiBudWxsLFxuICAgIFwidHJpYW5nbGVcIjogbnVsbCxcbiAgICBcInRleHRcIjogbnVsbCxcbiAgICBcInRleHRBbGlnblwiOiBudWxsLFxuICAgIFwidGV4dFNpemVcIjogbnVsbCxcbiAgICBcImRyYXdTcHJpdGVzXCI6IG51bGwsXG4gICAgXCJhbGxTcHJpdGVzXCI6IG51bGwsXG4gICAgXCJiYWNrZ3JvdW5kXCI6IG51bGwsXG4gICAgXCJ3aWR0aFwiOiBudWxsLFxuICAgIFwiaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJjYW1lcmFcIjogbnVsbCxcbiAgICBcImNhbWVyYS5vblwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm9mZlwiOiBudWxsLFxuICAgIFwiY2FtZXJhLmFjdGl2ZVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm1vdXNlWFwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm1vdXNlWVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnBvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcImNhbWVyYS5wb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJjYW1lcmEuem9vbVwiOiBudWxsLFxuXG4gICAgLy8gU3ByaXRlc1xuICAgIFwidmFyX2NyZWF0ZVNwcml0ZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0QW5pbWF0aW9uTGFiZWxcIjogbnVsbCxcbiAgICBcInNwcml0ZS5nZXREaXJlY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5nZXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJlbW92ZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZEFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZEltYWdlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkU3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRUb0dyb3VwXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYm91bmNlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuY29sbGlkZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmRpc3BsYWNlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUub3ZlcmxhcFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNoYW5nZUltYWdlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYXR0cmFjdGlvblBvaW50XCI6IG51bGwsXG4gICAgXCJzcHJpdGUubGltaXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldENvbGxpZGVyXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0VmVsb2NpdHlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5oZWlnaHRcIjogbnVsbCxcbiAgICBcInNwcml0ZS53aWR0aFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmRlcHRoXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZnJpY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5pbW1vdmFibGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5saWZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubWFzc1wiOiBudWxsLFxuICAgIFwic3ByaXRlLm1heFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnBvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZW1vdmVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVzdGl0dXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGVUb0RpcmVjdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRpb25TcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNjYWxlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2hhcGVDb2xvclwiOiBudWxsLFxuICAgIFwic3ByaXRlLnRvdWNoaW5nXCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmVsb2NpdHkueFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnZlbG9jaXR5LnlcIjogbnVsbCxcbiAgICBcInNwcml0ZS52aXNpYmxlXCI6IG51bGwsXG5cbiAgICAvLyBBbmltYXRpb25zXG4gICAgXCJ2YXJfbG9hZEFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiYW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhbmltLmNoYW5nZUZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLm5leHRGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5wcmV2aW91c0ZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmNsb25lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldEZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmdldExhc3RGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nb1RvRnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ucGxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5yZXdpbmRcIjogbnVsbCxcbiAgICBcImFuaW0uc3RvcFwiOiBudWxsLFxuICAgIFwiYW5pbS5mcmFtZUNoYW5nZWRcIjogbnVsbCxcbiAgICBcImFuaW0uZnJhbWVEZWxheVwiOiBudWxsLFxuICAgIFwiYW5pbS5pbWFnZXNcIjogbnVsbCxcbiAgICBcImFuaW0ubG9vcGluZ1wiOiBudWxsLFxuICAgIFwiYW5pbS5wbGF5aW5nXCI6IG51bGwsXG4gICAgXCJhbmltLnZpc2libGVcIjogbnVsbCxcblxuICAgIC8vIEdyb3Vwc1xuICAgIFwiR3JvdXBcIjogbnVsbCxcbiAgICBcImdyb3VwLmFkZFwiOiBudWxsLFxuICAgIFwiZ3JvdXAucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJncm91cC5jbGVhclwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY29udGFpbnNcIjogbnVsbCxcbiAgICBcImdyb3VwLmdldFwiOiBudWxsLFxuICAgIFwiZ3JvdXAuYm91bmNlXCI6IG51bGwsXG4gICAgXCJncm91cC5jb2xsaWRlXCI6IG51bGwsXG4gICAgXCJncm91cC5kaXNwbGFjZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAub3ZlcmxhcFwiOiBudWxsLFxuICAgIFwiZ3JvdXAubWF4RGVwdGhcIjogbnVsbCxcbiAgICBcImdyb3VwLm1pbkRlcHRoXCI6IG51bGwsXG5cbiAgICAvLyBFdmVudHNcbiAgICBcImtleUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5XCI6IG51bGwsXG4gICAgXCJrZXlDb2RlXCI6IG51bGwsXG4gICAgXCJrZXlQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwia2V5VHlwZWRcIjogbnVsbCxcbiAgICBcImtleURvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnREb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50VXBcIjogbnVsbCxcbiAgICBcIm1vdXNlWFwiOiBudWxsLFxuICAgIFwibW91c2VZXCI6IG51bGwsXG4gICAgXCJwbW91c2VYXCI6IG51bGwsXG4gICAgXCJwbW91c2VZXCI6IG51bGwsXG4gICAgXCJtb3VzZUJ1dHRvblwiOiBudWxsLFxuICAgIFwibW91c2VJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlTW92ZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlRHJhZ2dlZFwiOiBudWxsLFxuICAgIFwibW91c2VQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZUNsaWNrZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlV2hlZWxcIjogbnVsbCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBcImZvckxvb3BfaV8wXzRcIjogbnVsbCxcbiAgICBcImlmQmxvY2tcIjogbnVsbCxcbiAgICBcImlmRWxzZUJsb2NrXCI6IG51bGwsXG4gICAgXCJ3aGlsZUJsb2NrXCI6IG51bGwsXG5cbiAgICAvLyBNYXRoXG4gICAgXCJhZGRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwic3VidHJhY3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibXVsdGlwbHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZGl2aWRlT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImluZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJhbmRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwib3JPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibm90T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInJhbmRvbU51bWJlcl9taW5fbWF4XCI6IG51bGwsXG4gICAgXCJtYXRoUm91bmRcIjogbnVsbCxcbiAgICBcIm1hdGhBYnNcIjogbnVsbCxcbiAgICBcIm1hdGhNYXhcIjogbnVsbCxcbiAgICBcIm1hdGhNaW5cIjogbnVsbCxcbiAgICBcIm1hdGhSYW5kb21cIjogbnVsbCxcblxuICAgIC8vIFZhcmlhYmxlc1xuICAgIFwiZGVjbGFyZUFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlTm9Bc3NpZ25feFwiOiBudWxsLFxuICAgIFwiYXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fc3RyX2hlbGxvX3dvcmxkXCI6IG51bGwsXG4gICAgXCJzdWJzdHJpbmdcIjogbnVsbCxcbiAgICBcImluZGV4T2ZcIjogbnVsbCxcbiAgICBcImluY2x1ZGVzXCI6IG51bGwsXG4gICAgXCJsZW5ndGhcIjogbnVsbCxcbiAgICBcInRvVXBwZXJDYXNlXCI6IG51bGwsXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9saXN0X2FiZFwiOiBudWxsLFxuICAgIFwibGlzdExlbmd0aFwiOiBudWxsLFxuXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgXCJmdW5jdGlvblBhcmFtc19ub25lXCI6IG51bGwsXG4gICAgXCJmdW5jdGlvblBhcmFtc19uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25fblwiOiBudWxsLFxuICAgIFwicmV0dXJuXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBbXG4gICAgJ2Z1bmN0aW9uIHNldHVwKCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJ2Z1bmN0aW9uIGRyYXcoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnJ10uam9pbignXFxuJyksXG59KTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLmN1c3RvbSwge1xufSk7XG5cbiIsInZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdC5qcycpO1xudmFyIHNob3dBc3NldE1hbmFnZXIgPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvc2hvdycpO1xudmFyIGdldEFzc2V0RHJvcGRvd24gPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvZ2V0QXNzZXREcm9wZG93bicpO1xuXG52YXIgQ09MT1JfTElHSFRfR1JFRU4gPSAnI0QzRTk2NSc7XG52YXIgQ09MT1JfQkxVRSA9ICcjMTlDM0UxJztcbnZhciBDT0xPUl9SRUQgPSAnI0Y3ODE4Myc7XG52YXIgQ09MT1JfQ1lBTiA9ICcjNEREMEUxJztcbnZhciBDT0xPUl9ZRUxMT1cgPSAnI0ZGRjE3Nic7XG52YXIgQ09MT1JfUElOSyA9ICcjRjU3QUM2JztcbnZhciBDT0xPUl9QVVJQTEUgPSAnI0JCNzdDNyc7XG52YXIgQ09MT1JfR1JFRU4gPSAnIzY4RDk5NSc7XG52YXIgQ09MT1JfV0hJVEUgPSAnI0ZGRkZGRic7XG52YXIgQ09MT1JfQkxVRSA9ICcjNjRCNUY2JztcbnZhciBDT0xPUl9PUkFOR0UgPSAnI0ZGQjc0RCc7XG5cbnZhciBHYW1lTGFiO1xuXG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbi8vIEZsaXAgdGhlIGFyZ3VtZW50IG9yZGVyIHNvIHdlIGNhbiBiaW5kIGB0eXBlRmlsdGVyYC5cbmZ1bmN0aW9uIGNob29zZUFzc2V0KHR5cGVGaWx0ZXIsIGNhbGxiYWNrKSB7XG4gIHNob3dBc3NldE1hbmFnZXIoY2FsbGJhY2ssIHR5cGVGaWx0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIC8vIEdhbWUgTGFiXG4gIHtmdW5jOiAnbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSwgdHlwZTogJ2VpdGhlcicsIGRyb3Bkb3duOiB7IDA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGdldEFzc2V0RHJvcGRvd24oJ2ltYWdlJyk7IH0gfSwgYXNzZXRUb29sdGlwOiB7IDA6IGNob29zZUFzc2V0LmJpbmQobnVsbCwgJ2ltYWdlJykgfSB9LFxuICB7ZnVuYzogJ3Zhcl9sb2FkSW1hZ2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgYmxvY2tQcmVmaXg6ICd2YXIgaW1nID0gbG9hZEltYWdlJywgcGFsZXR0ZVBhcmFtczogWyd1cmwnXSwgcGFyYW1zOiBbJ1wiaHR0cHM6Ly9jb2RlLm9yZy9pbWFnZXMvbG9nby5wbmdcIiddLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ2ltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnaW1hZ2UnLCdzcmNYJywnc3JjWScsJ3NyY1cnLCdzcmNIJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcImltZ1wiLCBcIjBcIiwgXCIwXCIsIFwiaW1nLndpZHRoXCIsIFwiaW1nLmhlaWdodFwiLCBcIjBcIiwgXCIwXCIsIFwiaW1nLndpZHRoXCIsIFwiaW1nLmhlaWdodFwiXSB9LFxuICB7ZnVuYzogJ2ZpbGwnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIid5ZWxsb3cnXCJdIH0sXG4gIHtmdW5jOiAnbm9GaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdzdHJva2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibHVlJ1wiXSB9LFxuICB7ZnVuYzogJ25vU3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdhcmMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJywnc3RhcnQnLCdzdG9wJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI4MDBcIiwgXCI4MDBcIiwgXCIwXCIsIFwiSEFMRl9QSVwiXSB9LFxuICB7ZnVuYzogJ2VsbGlwc2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAnbGluZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICdwb2ludCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAncmVjdCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIxMDBcIiwgXCIxMDBcIiwgXCIyMDBcIiwgXCIyMDBcIl0gfSxcbiAge2Z1bmM6ICd0cmlhbmdsZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJywneDMnLCd5MyddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAndGV4dCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3N0cicsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIndGV4dCdcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjEwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHRBbGlnbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2hvcml6JywndmVydCddLCBwYXJhbXM6IFtcIkNFTlRFUlwiLCBcIlRPUFwiXSB9LFxuICB7ZnVuYzogJ3RleHRTaXplJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsncGl4ZWxzJ10sIHBhcmFtczogW1wiMTJcIl0gfSxcbiAge2Z1bmM6ICdkcmF3U3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYWxsU3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBibG9jazogJ2FsbFNwcml0ZXMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYmFja2dyb3VuZCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ2JsYWNrJ1wiXSB9LFxuICB7ZnVuYzogJ3dpZHRoJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdoZWlnaHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9uJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEub2ZmJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEuYWN0aXZlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VYJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VZJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEucG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLnknLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS56b29tJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcblxuICAvLyBTcHJpdGVzXG4gIHtmdW5jOiAnY3JlYXRlU3ByaXRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3dpZHRoJywnaGVpZ2h0J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiMzBcIiwgXCIzMFwiXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXJfY3JlYXRlU3ByaXRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgYmxvY2tQcmVmaXg6ICd2YXIgc3ByaXRlID0gY3JlYXRlU3ByaXRlJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3dpZHRoJywnaGVpZ2h0J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiMzBcIiwgXCIzMFwiXSwgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0U3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywnYW5nbGUnXSwgcGFyYW1zOiBbXCIxXCIsIFwiOTBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZ2V0QW5pbWF0aW9uTGFiZWwnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0QW5pbWF0aW9uTGFiZWwnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmdldERpcmVjdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXREaXJlY3Rpb24nLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmdldFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldFNwZWVkJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZW1vdmUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmVtb3ZlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRBbmltYXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJywnYW5pbWF0aW9uJ10sIHBhcmFtczogWydcImFuaW0xXCInLCBcImFuaW1cIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRBbmltYXRpb24nIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFkZEltYWdlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCcsJ2ltYWdlJ10sIHBhcmFtczogWydcImltZzFcIicsIFwiaW1nXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkSW1hZ2UnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFkZFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ2FuZ2xlJ10sIHBhcmFtczogW1wiMVwiLCBcIjkwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkU3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFkZFRvR3JvdXAnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2dyb3VwJ10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRUb0dyb3VwJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5ib3VuY2UnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYm91bmNlJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuY29sbGlkZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jb2xsaWRlJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZGlzcGxhY2UnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouZGlzcGxhY2UnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5vdmVybGFwJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLm92ZXJsYXAnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5jaGFuZ2VBbmltYXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJ10sIHBhcmFtczogWydcImFuaW0xXCInXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUFuaW1hdGlvbicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuY2hhbmdlSW1hZ2UnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJ10sIHBhcmFtczogWydcImltZzFcIiddLCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlSW1hZ2UnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmF0dHJhY3Rpb25Qb2ludCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCd4JywneSddLCBwYXJhbXM6IFtcIjFcIiwgXCIyMDBcIiwgXCIyMDBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hdHRyYWN0aW9uUG9pbnQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmxpbWl0U3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ21heCddLCBwYXJhbXM6IFtcIjNcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5saW1pdFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zZXRDb2xsaWRlcicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndHlwZScsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbJ1wicmVjdGFuZ2xlXCInLCBcIjBcIiwgXCIwXCIsIFwiMjBcIiwgXCIyMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldENvbGxpZGVyJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zZXRWZWxvY2l0eScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knXSwgcGFyYW1zOiBbXCIxXCIsIFwiMVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldFZlbG9jaXR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5oZWlnaHQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouaGVpZ2h0JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS53aWR0aCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi53aWR0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmFuaW1hdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZGVwdGgnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZGVwdGgnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmZyaWN0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmZyaWN0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5pbW1vdmFibGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouaW1tb3ZhYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5saWZlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmxpZmUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLm1hc3MnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoubWFzcycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubWF4U3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoubWF4U3BlZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnBvc2l0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnBvc2l0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbi54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLngnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnBvc2l0aW9uLnknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5wcmV2aW91c1Bvc2l0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLngnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlbW92ZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmVtb3ZlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVzdGl0dXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmVzdGl0dXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0ZVRvRGlyZWN0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJvdGF0ZVRvRGlyZWN0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRpb25TcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGlvblNwZWVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zY2FsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5zY2FsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2hhcGVDb2xvcicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5zaGFwZUNvbG9yJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS50b3VjaGluZycsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi50b3VjaGluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmVsb2NpdHknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoudmVsb2NpdHknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5LngnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmVsb2NpdHkueScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi55JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52aXNpYmxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZpc2libGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgU3ByaXRlIHByb3BlcnRpZXM6XG5jYW1lcmFcbmNvbGxpZGVyIC0gVVNFRlVMPyAobWFyc2hhbCBBQUJCIGFuZCBDaXJjbGVDb2xsaWRlcilcbmRlYnVnXG5ncm91cHNcbm1vdXNlQWN0aXZlXG5tb3VzZUlzT3ZlclxubW91c2VJc1ByZXNzZWRcbm9yaWdpbmFsSGVpZ2h0XG5vcmlnaW5hbFdpZHRoXG4qL1xuXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgU3ByaXRlIG1ldGhvZHM6XG5hZGRJbWFnZShsYWJlbGltZykgLSAxIHBhcmFtIHZlcnNpb246IChzZXRzIGxhYmVsIHRvIFwibm9ybWFsXCIgYXV0b21hdGljYWxseSlcbmRyYXcoKSAtIE9WRVJSSURFIGFuZC9vciBVU0VGVUw/XG5taXJyb3JYKGRpcikgLSBVU0VGVUw/XG5taXJyb3JZKGRpcikgLSBVU0VGVUw/XG5vdmVybGFwUGl4ZWwocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbm92ZXJsYXBQb2ludChwb2ludFhwb2ludFkpIC0gVVNFRlVMP1xudXBkYXRlKCkgLSBVU0VGVUw/XG4qL1xuXG4gIC8vIEFuaW1hdGlvbnNcbiAge2Z1bmM6ICdsb2FkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWyd1cmwxJywndXJsMiddLCBwYXJhbXM6IFsnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAxLnBuZ1wiJywgJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMi5wbmdcIiddLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Zhcl9sb2FkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgYmxvY2tQcmVmaXg6ICd2YXIgYW5pbSA9IGxvYWRBbmltYXRpb24nLCBwYWxldHRlUGFyYW1zOiBbJ3VybDEnLCd1cmwyJ10sIHBhcmFtczogWydcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDEucG5nXCInLCAnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAyLnBuZ1wiJ10sIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sXG4gIHtmdW5jOiAnYW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydhbmltYXRpb24nLCd4JywneSddLCBwYXJhbXM6IFtcImFuaW1cIiwgXCI1MFwiLCBcIjUwXCJdIH0sXG4gIHtmdW5jOiAnYW5pbS5jaGFuZ2VGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnZnJhbWUnXSwgcGFyYW1zOiBbXCIwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5uZXh0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoubmV4dEZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ucHJldmlvdXNGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wcmV2aW91c0ZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0uY2xvbmUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouY2xvbmUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nZXRGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRGcmFtZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdldExhc3RGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRMYXN0RnJhbWUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nb1RvRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2ZyYW1lJ10sIHBhcmFtczogW1wiMVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmdvVG9GcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLnBsYXknLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucGxheScgfSxcbiAge2Z1bmM6ICdhbmltLnJld2luZCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZXdpbmQnIH0sXG4gIHtmdW5jOiAnYW5pbS5zdG9wJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnN0b3AnIH0sXG4gIHtmdW5jOiAnYW5pbS5mcmFtZUNoYW5nZWQnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJhbWVDaGFuZ2VkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0uZnJhbWVEZWxheScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmFtZURlbGF5JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0uaW1hZ2VzJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmltYWdlcycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmxvb3BpbmcnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoubG9vcGluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLnBsYXlpbmcnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucGxheWluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLnZpc2libGUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoudmlzaWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBBbmltYXRpb24gbWV0aG9kczpcbmRyYXcoeHkpXG5nZXRGcmFtZUltYWdlKClcbmdldEhlaWdodCgpXG5nZXRJbWFnZUF0KGZyYW1lKVxuZ2V0V2lkdGgoKVxuKi9cblxuICAvLyBHcm91cHNcbiAge2Z1bmM6ICdHcm91cCcsIGJsb2NrUHJlZml4OiAndmFyIGdyb3VwID0gbmV3IEdyb3VwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmFkZCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGQnIH0sXG4gIHtmdW5jOiAnZ3JvdXAucmVtb3ZlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZScgfSxcbiAge2Z1bmM6ICdncm91cC5jbGVhcicsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmNsZWFyJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmNvbnRhaW5zJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNvbnRhaW5zJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmdldCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydpJ10sIHBhcmFtczogW1wiMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5ib3VuY2UnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX2JvdW5jZScgfSwgLyogYXZvaWQgbW9kZU9wdGlvbk5hbWUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5jb2xsaWRlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9ib3VuY2UnIH0sIC8qIGF2b2lkIG1vZGVPcHRpb25OYW1lIGNvbmZsaWN0ICovXG4gIHtmdW5jOiAnZ3JvdXAuZGlzcGxhY2UnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX2JvdW5jZScgfSwgLyogYXZvaWQgbW9kZU9wdGlvbk5hbWUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5vdmVybGFwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9ib3VuY2UnIH0sIC8qIGF2b2lkIG1vZGVPcHRpb25OYW1lIGNvbmZsaWN0ICovXG4gIHtmdW5jOiAnZ3JvdXAubWF4RGVwdGgnLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhEZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5taW5EZXB0aCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1pbkRlcHRoJywgdHlwZTogJ3ZhbHVlJyB9LFxuXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgR3JvdXAgbWV0aG9kczpcbmRyYXcoKSAtIFVTRUZVTD9cbiovXG5cbiAgLy8gRXZlbnRzXG4gIHtmdW5jOiAna2V5SXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5JywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5Q29kZScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleURvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudERvd24nLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5V2VudFVwJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5UmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlUeXBlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VCdXR0b24nLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlTW92ZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlTW92ZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VEcmFnZ2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVByZXNzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUmVsZWFzZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VDbGlja2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVdoZWVsJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVdoZWVsKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuXG4gIC8vIE1hdGhcbiAge2Z1bmM6ICdzaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2FuZ2xlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2NvcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYW5nbGUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAndGFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhbmdsZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhc2luJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhY29zJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhdGFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhdGFuMicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsneScsJ3gnXSwgcGFyYW1zOiBbXCIxMFwiLCBcIjEwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZGVncmVlcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsncmFkaWFucyddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyYWRpYW5zJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydkZWdyZWVzJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuZ2xlTW9kZScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbW9kZSddLCBwYXJhbXM6IFtcIkRFR1JFRVNcIl0gfSxcbiAge2Z1bmM6ICdyYW5kb20nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21pbicsJ21heCddLCBwYXJhbXM6IFtcIjFcIiwgXCI1XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncmFuZG9tR2F1c3NpYW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21lYW4nLCdzZCddLCBwYXJhbXM6IFtcIjBcIiwgXCIxNVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JhbmRvbVNlZWQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3NlZWQnXSwgcGFyYW1zOiBbXCI5OVwiXSB9LFxuICB7ZnVuYzogJ2FicycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiLTFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjZWlsJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIwLjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjb25zdHJhaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bScsJ2xvdycsJ2hpZ2gnXSwgcGFyYW1zOiBbXCIxLjFcIiwgXCIwXCIsIFwiMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2Rpc3QnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCIxMDBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdleHAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdmbG9vcicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMC45XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbGVycCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnc3RhcnQnLCdzdG9wJywnYW10J10sIHBhcmFtczogW1wiMFwiLCBcIjEwMFwiLCBcIjAuMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2xvZycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21hZycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYScsJ2InXSwgcGFyYW1zOiBbXCIxMDBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtYXAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJywnc3RhcnQxJywnc3RvcDEnLCdzdGFydDInLCdzdG9wJ10sIHBhcmFtczogW1wiMC45XCIsIFwiMFwiLCBcIjFcIiwgXCIwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWF4JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyduMScsJ24yJ10sIHBhcmFtczogW1wiMVwiLFwiM1wiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21pbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbjEnLCduMiddLCBwYXJhbXM6IFtcIjFcIiwgXCIzXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbm9ybScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnLCdzdGFydCcsJ3N0b3AnXSwgcGFyYW1zOiBbXCI5MFwiLCBcIjBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdwb3cnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ24nLCdlJ10sIHBhcmFtczogW1wiMTBcIiwgXCIyXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncm91bmQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjAuOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3NxJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIyXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3FydCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuXG4gIC8vIEFkdmFuY2VkXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnR2FtZSBMYWInOiB7XG4gICAgY29sb3I6ICd5ZWxsb3cnLFxuICAgIHJnYjogQ09MT1JfWUVMTE9XLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgU3ByaXRlczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFuaW1hdGlvbnM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBHcm91cHM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEYXRhOiB7XG4gICAgY29sb3I6ICdsaWdodGdyZWVuJyxcbiAgICByZ2I6IENPTE9SX0xJR0hUX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRHJhd2luZzoge1xuICAgIGNvbG9yOiAnY3lhbicsXG4gICAgcmdiOiBDT0xPUl9DWUFOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRXZlbnRzOiB7XG4gICAgY29sb3I6ICdncmVlbicsXG4gICAgcmdiOiBDT0xPUl9HUkVFTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEFkdmFuY2VkOiB7XG4gICAgY29sb3I6ICdibHVlJyxcbiAgICByZ2I6IENPTE9SX0JMVUUsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMuYWRkaXRpb25hbFByZWRlZlZhbHVlcyA9IFtcbiAgJ1AyRCcsICdXRUJHTCcsICdBUlJPVycsICdDUk9TUycsICdIQU5EJywgJ01PVkUnLFxuICAnVEVYVCcsICdXQUlUJywgJ0hBTEZfUEknLCAnUEknLCAnUVVBUlRFUl9QSScsICdUQVUnLCAnVFdPX1BJJywgJ0RFR1JFRVMnLFxuICAnUkFESUFOUycsICdDT1JORVInLCAnQ09STkVSUycsICdSQURJVVMnLCAnUklHSFQnLCAnTEVGVCcsICdDRU5URVInLCAnVE9QJyxcbiAgJ0JPVFRPTScsICdCQVNFTElORScsICdQT0lOVFMnLCAnTElORVMnLCAnVFJJQU5HTEVTJywgJ1RSSUFOR0xFX0ZBTicsXG4gICdUUklBTkdMRV9TVFJJUCcsICdRVUFEUycsICdRVUFEX1NUUklQJywgJ0NMT1NFJywgJ09QRU4nLCAnQ0hPUkQnLCAnUElFJyxcbiAgJ1BST0pFQ1QnLCAnU1FVQVJFJywgJ1JPVU5EJywgJ0JFVkVMJywgJ01JVEVSJywgJ1JHQicsICdIU0InLCAnSFNMJywgJ0FVVE8nLFxuICAnQUxUJywgJ0JBQ0tTUEFDRScsICdDT05UUk9MJywgJ0RFTEVURScsICdET1dOX0FSUk9XJywgJ0VOVEVSJywgJ0VTQ0FQRScsXG4gICdMRUZUX0FSUk9XJywgJ09QVElPTicsICdSRVRVUk4nLCAnUklHSFRfQVJST1cnLCAnU0hJRlQnLCAnVEFCJywgJ1VQX0FSUk9XJyxcbiAgJ0JMRU5EJywgJ0FERCcsICdEQVJLRVNUJywgJ0xJR0hURVNUJywgJ0RJRkZFUkVOQ0UnLCAnRVhDTFVTSU9OJyxcbiAgJ01VTFRJUExZJywgJ1NDUkVFTicsICdSRVBMQUNFJywgJ09WRVJMQVknLCAnSEFSRF9MSUdIVCcsICdTT0ZUX0xJR0hUJyxcbiAgJ0RPREdFJywgJ0JVUk4nLCAnVEhSRVNIT0xEJywgJ0dSQVknLCAnT1BBUVVFJywgJ0lOVkVSVCcsICdQT1NURVJJWkUnLFxuICAnRElMQVRFJywgJ0VST0RFJywgJ0JMVVInLCAnTk9STUFMJywgJ0lUQUxJQycsICdCT0xEJywgJ19ERUZBVUxUX1RFWFRfRklMTCcsXG4gICdfREVGQVVMVF9MRUFETVVMVCcsICdfQ1RYX01JRERMRScsICdMSU5FQVInLCAnUVVBRFJBVElDJywgJ0JFWklFUicsXG4gICdDVVJWRScsICdfREVGQVVMVF9TVFJPS0UnLCAnX0RFRkFVTFRfRklMTCdcbl07XG5tb2R1bGUuZXhwb3J0cy5zaG93UGFyYW1Ecm9wZG93bnMgPSB0cnVlO1xuIiwiLy8gbG9jYWxlIGZvciBnYW1lbGFiXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmdhbWVsYWJfbG9jYWxlO1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuJyk7MjsgLyogR2FtZUxhYiAqLyA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwic29mdC1idXR0b25zXCIgY2xhc3M9XCJzb2Z0LWJ1dHRvbnMtbm9uZVwiPlxcbiAgPGJ1dHRvbiBpZD1cImxlZnRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDYsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJsZWZ0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg5LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwicmlnaHQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwidXBCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDEyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwidXAtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwiZG93bkJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJkb3duLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbjwvZGl2PlxcblxcbicpOzE5OyBpZiAoZmluaXNoQnV0dG9uKSB7IDsgYnVmLnB1c2goJ1xcbiAgPGRpdiBpZD1cInNoYXJlLWNlbGxcIiBjbGFzcz1cInNoYXJlLWNlbGwtbm9uZVwiPlxcbiAgICA8YnV0dG9uIGlkPVwiZmluaXNoQnV0dG9uXCIgY2xhc3M9XCJzaGFyZVwiPlxcbiAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgyMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDIyLCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MjU7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQobnVsbCwgJ2ZvbycpO1xufTtcbiIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG4vKlxuICogQWxsIEFQSXMgZGlzYWJsZWQgZm9yIG5vdy4gcDUvcDVwbGF5IGlzIHRoZSBvbmx5IGV4cG9zZWQgQVBJLiBJZiB3ZSB3YW50IHRvXG4gKiBleHBvc2Ugb3RoZXIgdG9wLWxldmVsIEFQSXMsIHRoZXkgc2hvdWxkIGJlIGluY2x1ZGVkIGhlcmUgYXMgc2hvd24gaW4gdGhlc2VcbiAqIGNvbW1lbnRlZCBmdW5jdGlvbnNcbiAqXG5cbmV4cG9ydHMucmFuZG9tID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YXIga2V5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsdWVzLmxlbmd0aCk7XG4gIHJldHVybiB2YWx1ZXNba2V5XTtcbn07XG5cbmV4cG9ydHMuZm9vID0gZnVuY3Rpb24gKGlkKSB7XG4gIEdhbWVMYWIuZXhlY3V0ZUNtZChpZCwgJ2ZvbycpO1xufTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG52YXIgZ2FtZUxhYlNwcml0ZSA9IHJlcXVpcmUoJy4vR2FtZUxhYlNwcml0ZScpO1xudmFyIGFzc2V0UHJlZml4ID0gcmVxdWlyZSgnLi4vYXNzZXRNYW5hZ2VtZW50L2Fzc2V0UHJlZml4Jyk7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEdhbWVMYWJQNSBjbGFzcyB0aGF0IHdyYXBzIHA1IGFuZCBwNXBsYXkgYW5kIHBhdGNoZXMgaXQgaW5cbiAqIHNwZWNpZmljIHBsYWNlcyB0byBlbmFibGUgR2FtZUxhYiBmdW5jdGlvbmFsaXR5XG4gKi9cbnZhciBHYW1lTGFiUDUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucDUgPSBudWxsO1xuICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG4gIHRoaXMucDVldmVudE5hbWVzID0gW1xuICAgICdtb3VzZU1vdmVkJywgJ21vdXNlRHJhZ2dlZCcsICdtb3VzZVByZXNzZWQnLCAnbW91c2VSZWxlYXNlZCcsXG4gICAgJ21vdXNlQ2xpY2tlZCcsICdtb3VzZVdoZWVsJyxcbiAgICAna2V5UHJlc3NlZCcsICdrZXlSZWxlYXNlZCcsICdrZXlUeXBlZCdcbiAgXTtcbiAgdGhpcy5wNXNwZWNpYWxGdW5jdGlvbnMgPSBbJ3ByZWxvYWQnLCAnZHJhdycsICdzZXR1cCddLmNvbmNhdCh0aGlzLnA1ZXZlbnROYW1lcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWJQNTtcblxuR2FtZUxhYlA1LmJhc2VQNWxvYWRJbWFnZSA9IG51bGw7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGlzIEdhbWVMYWJQNSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLmdhbWVMYWIgaW5zdGFuY2Ugb2YgcGFyZW50IEdhbWVMYWIgb2JqZWN0XG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5vbkV4ZWN1dGlvblN0YXJ0aW5nIGNhbGxiYWNrIHRvIHJ1biBkdXJpbmcgcDUgaW5pdFxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25QcmVsb2FkIGNhbGxiYWNrIHRvIHJ1biBkdXJpbmcgcHJlbG9hZCgpXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5vblNldHVwIGNhbGxiYWNrIHRvIHJ1biBkdXJpbmcgc2V0dXAoKVxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25EcmF3IGNhbGxiYWNrIHRvIHJ1biBkdXJpbmcgZWFjaCBkcmF3KClcbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICB0aGlzLm9uRXhlY3V0aW9uU3RhcnRpbmcgPSBvcHRpb25zLm9uRXhlY3V0aW9uU3RhcnRpbmc7XG4gIHRoaXMub25QcmVsb2FkID0gb3B0aW9ucy5vblByZWxvYWQ7XG4gIHRoaXMub25TZXR1cCA9IG9wdGlvbnMub25TZXR1cDtcbiAgdGhpcy5vbkRyYXcgPSBvcHRpb25zLm9uRHJhdztcblxuICB3aW5kb3cucDUucHJvdG90eXBlLnNldHVwR2xvYmFsTW9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgZm9yIG5vLXNrZXRjaCBHbG9iYWwgbW9kZVxuICAgICAqL1xuICAgIHZhciBwNSA9IHdpbmRvdy5wNTtcblxuICAgIHRoaXMuX2lzR2xvYmFsID0gdHJ1ZTtcbiAgICAvLyBMb29wIHRocm91Z2ggbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlIGFuZCBhdHRhY2ggdGhlbSB0byB0aGUgd2luZG93XG4gICAgZm9yICh2YXIgcCBpbiBwNS5wcm90b3R5cGUpIHtcbiAgICAgIGlmKHR5cGVvZiBwNS5wcm90b3R5cGVbcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIGV2ID0gcC5zdWJzdHJpbmcoMik7XG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRzLmhhc093blByb3BlcnR5KGV2KSkge1xuICAgICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXS5iaW5kKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEF0dGFjaCBpdHMgcHJvcGVydGllcyB0byB0aGUgd2luZG93XG4gICAgZm9yICh2YXIgcDIgaW4gdGhpcykge1xuICAgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkocDIpKSB7XG4gICAgICAgIHdpbmRvd1twMl0gPSB0aGlzW3AyXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gT3ZlcnJpZGUgcDUubG9hZEltYWdlIHNvIHdlIGNhbiBtb2RpZnkgdGhlIFVSTCBwYXRoIHBhcmFtXG4gIGlmICghR2FtZUxhYlA1LmJhc2VQNWxvYWRJbWFnZSkge1xuICAgIEdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UgPSB3aW5kb3cucDUucHJvdG90eXBlLmxvYWRJbWFnZTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uIChwYXRoLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgcGF0aCA9IGFzc2V0UHJlZml4LmZpeFBhdGgocGF0aCk7XG4gICAgICByZXR1cm4gR2FtZUxhYlA1LmJhc2VQNWxvYWRJbWFnZS5jYWxsKHRoaXMsIHBhdGgsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgcDUucmVkcmF3IHRvIG1ha2UgaXQgdHdvLXBoYXNlIGFmdGVyIHVzZXJEcmF3KClcbiAgd2luZG93LnA1LnByb3RvdHlwZS5yZWRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZyb20gcmVkcmF3KClcbiAgICAgKi9cbiAgICB2YXIgdXNlclNldHVwID0gdGhpcy5zZXR1cCB8fCB3aW5kb3cuc2V0dXA7XG4gICAgdmFyIHVzZXJEcmF3ID0gdGhpcy5kcmF3IHx8IHdpbmRvdy5kcmF3O1xuICAgIGlmICh0eXBlb2YgdXNlckRyYXcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMucHVzaCgpO1xuICAgICAgaWYgKHR5cGVvZiB1c2VyU2V0dXAgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuc2NhbGUodGhpcy5waXhlbERlbnNpdHksIHRoaXMucGl4ZWxEZW5zaXR5KTtcbiAgICAgIH1cbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX3JlZ2lzdGVyZWRNZXRob2RzLnByZS5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICAgIGYuY2FsbChzZWxmKTtcbiAgICAgIH0pO1xuICAgICAgdXNlckRyYXcoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQ3JlYXRlIDJuZCBwaGFzZSBmdW5jdGlvbiBhZnRlclVzZXJEcmF3KClcbiAgd2luZG93LnA1LnByb3RvdHlwZS5hZnRlclVzZXJEcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgZnJvbSByZWRyYXcoKVxuICAgICAqL1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRNZXRob2RzLnBvc3QuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgZi5jYWxsKHNlbGYpO1xuICAgIH0pO1xuICAgIHRoaXMucG9wKCk7XG4gIH07XG5cbiAgLy8gT3ZlcnJpZGUgcDUuY3JlYXRlU3ByaXRlIHNvIHdlIGNhbiByZXBsYWNlIHRoZSBBQUJCb3BzKCkgZnVuY3Rpb25cbiAgd2luZG93LnA1LnByb3RvdHlwZS5jcmVhdGVTcHJpdGUgPSBmdW5jdGlvbih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1cGxheSBmcm9tIGNyZWF0ZVNwcml0ZSgpXG4gICAgICovXG4gICAgdmFyIHMgPSBuZXcgd2luZG93LlNwcml0ZSh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBzLkFBQkJvcHMgPSBnYW1lTGFiU3ByaXRlLkFBQkJvcHM7XG4gICAgcy5kZXB0aCA9IHdpbmRvdy5hbGxTcHJpdGVzLm1heERlcHRoKCkrMTtcbiAgICB3aW5kb3cuYWxsU3ByaXRlcy5hZGQocyk7XG4gICAgcmV0dXJuIHM7XG4gIH07XG5cbiAgLy8gT3ZlcnJpZGUgd2luZG93Lkdyb3VwIHNvIHdlIGNhbiBvdmVycmlkZSB0aGUgbWV0aG9kcyB0aGF0IHRha2UgY2FsbGJhY2tcbiAgLy8gcGFyYW1ldGVyc1xuICB2YXIgYmFzZUdyb3VwQ29uc3RydWN0b3IgPSB3aW5kb3cuR3JvdXA7XG4gIHdpbmRvdy5Hcm91cCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJyYXkgPSBiYXNlR3JvdXBDb25zdHJ1Y3RvcigpO1xuXG4gICAgLypcbiAgICAgKiBDcmVhdGUgbmV3IGhlbHBlciBjYWxsZWQgY2FsbEFBQkJvcHNGb3JBbGwoKSB3aGljaCBjYW4gYmUgY2FsbGVkIGFzIGFcbiAgICAgKiBzdGF0ZWZ1bCBuYXRpdmVGdW5jIGJ5IHRoZSBpbnRlcnByZXRlci4gVGhpcyBlbmFibGVzIHRoZSBuYXRpdmUgbWV0aG9kIHRvXG4gICAgICogYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHNvIHRoYXQgaXQgY2FuIGdvIGFzeW5jaHJvbm91cyBldmVyeSB0aW1lIGl0XG4gICAgICogKG9yIGFueSBuYXRpdmUgZnVuY3Rpb24gdGhhdCBpdCBjYWxscywgc3VjaCBhcyBBQUJCb3BzKSB3YW50cyB0byBleGVjdXRlXG4gICAgICogYSBjYWxsYmFjayBiYWNrIGludG8gaW50ZXJwcmV0ZXIgY29kZS4gVGhlIGludGVycHJldGVyIHN0YXRlIG9iamVjdCBpc1xuICAgICAqIHJldHJpZXZlZCBieSBjYWxsaW5nIEpTSW50ZXJwcmV0ZXIuZ2V0Q3VycmVudFN0YXRlKCkuXG4gICAgICpcbiAgICAgKiBBZGRpdGlvbmFsIHByb3BlcnRpZXMgY2FuIGJlIHNldCBvbiB0aGUgc3RhdGUgb2JqZWN0IHRvIHRyYWNrIHN0YXRlXG4gICAgICogYWNyb3NzIHRoZSBtdWx0aXBsZSBleGVjdXRpb25zLiBJZiB0aGUgZnVuY3Rpb24gd2FudHMgdG8gYmUgY2FsbGVkIGFnYWluLFxuICAgICAqIGl0IHNob3VsZCBzZXQgc3RhdGUuZG9uZUV4ZWMgdG8gZmFsc2UuIFdoZW4gdGhlIGZ1bmN0aW9uIGlzIGNvbXBsZXRlIGFuZFxuICAgICAqIG5vIGxvbmdlciB3YW50cyB0byBiZSBjYWxsZWQgaW4gYSBsb29wIGJ5IHRoZSBpbnRlcnByZXRlciwgaXQgc2hvdWxkIHNldFxuICAgICAqIHN0YXRlLmRvbmVFeGVjIHRvIHRydWUgYW5kIHJldHVybiBhIHZhbHVlLlxuICAgICAqL1xuICAgIGFycmF5LmNhbGxBQUJCb3BzRm9yQWxsID0gZnVuY3Rpb24odHlwZSwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdmFyIHN0YXRlID0gb3B0aW9ucy5nYW1lTGFiLkpTSW50ZXJwcmV0ZXIuZ2V0Q3VycmVudFN0YXRlKCk7XG4gICAgICBpZiAoIXN0YXRlLl9faSkge1xuICAgICAgICBzdGF0ZS5fX2kgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLl9faSA8IHRoaXMuc2l6ZSgpKSB7XG4gICAgICAgIGlmICghc3RhdGUuX19zdWJTdGF0ZSkge1xuICAgICAgICAgIC8vIEJlZm9yZSB3ZSBjYWxsIEFBQkJvcHMgKGFub3RoZXIgc3RhdGVmdWwgZnVuY3Rpb24pLCBoYW5nIGEgX19zdWJTdGF0ZVxuICAgICAgICAgIC8vIG9mZiBvZiBzdGF0ZSwgc28gaXQgY2FuIHVzZSB0aGF0IGluc3RlYWQgdG8gdHJhY2sgaXRzIHN0YXRlOlxuICAgICAgICAgIHN0YXRlLl9fc3ViU3RhdGUgPSB7IGRvbmVFeGVjOiB0cnVlIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZXQoc3RhdGUuX19pKS5BQUJCb3BzKHR5cGUsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgICAgICBpZiAoc3RhdGUuX19zdWJTdGF0ZS5kb25lRXhlYykge1xuICAgICAgICAgIC8vIE5vdGU6IGlnbm9yaW5nIHJldHVybiB2YWx1ZSBmcm9tIGVhY2ggQUFCQm9wcygpIGNhbGxcbiAgICAgICAgICBkZWxldGUgc3RhdGUuX19zdWJTdGF0ZTtcbiAgICAgICAgICBzdGF0ZS5fX2krKztcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5kb25lRXhlYyA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUuZG9uZUV4ZWMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSZXBsYWNlIHRoZXNlIGZvdXIgbWV0aG9kcyB0aGF0IHRha2UgY2FsbGJhY2sgcGFyYW1ldGVycyB0byB1c2UgdGhlIG5ld1xuICAgIC8vIGNhbGxBQUJCb3BzRm9yQWxsKCkgaGVscGVyOlxuXG4gICAgYXJyYXkub3ZlcmxhcCA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJvdmVybGFwXCIsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhcnJheS5jb2xsaWRlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsQUFCQm9wc0ZvckFsbChcImNvbGxpZGVcIiwgdGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFycmF5LmRpc3BsYWNlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsQUFCQm9wc0ZvckFsbChcImRpc3BsYWNlXCIsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhcnJheS5ib3VuY2UgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxBQUJCb3BzRm9yQWxsKFwiYm91bmNlXCIsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG5cbn07XG5cbi8qKlxuICogUmVzZXQgR2FtZUxhYlA1IHRvIGl0cyBpbml0aWFsIHN0YXRlLiBDYWxsZWQgYmVmb3JlIGVhY2ggdGltZSBpdCBpcyB1c2VkLlxuICovXG5HYW1lTGFiUDUucHJvdG90eXBlLnJlc2V0RXhlY3V0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gIGlmICh0aGlzLnA1KSB7XG4gICAgdGhpcy5wNS5yZW1vdmUoKTtcbiAgICB0aGlzLnA1ID0gbnVsbDtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG5cbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gdmFyaW91cyBwNS9wNXBsYXkgaW5pdCBjb2RlXG4gICAgICovXG5cbiAgICAvLyBDbGVhciByZWdpc3RlcmVkIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZTpcbiAgICBmb3IgKHZhciBtZW1iZXIgaW4gd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMpIHtcbiAgICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kc1ttZW1iZXJdO1xuICAgIH1cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcyA9IHsgcHJlOiBbXSwgcG9zdDogW10sIHJlbW92ZTogW10gfTtcbiAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZFByZWxvYWRNZXRob2RzLmdhbWVsYWJQcmVsb2FkO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5hbGxTcHJpdGVzID0gbmV3IHdpbmRvdy5Hcm91cCgpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuc3ByaXRlVXBkYXRlID0gdHJ1ZTtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhID0gbmV3IHdpbmRvdy5DYW1lcmEoMCwgMCwgMSk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEuaW5pdCA9IGZhbHNlO1xuXG4gICAgLy9rZXlib2FyZCBpbnB1dFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUucmVhZFByZXNzZXMpO1xuXG4gICAgLy9hdXRvbWF0aWMgc3ByaXRlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5wNS5wcm90b3R5cGUudXBkYXRlU3ByaXRlcyk7XG5cbiAgICAvL3F1YWR0cmVlIHVwZGF0ZVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cudXBkYXRlVHJlZSk7XG5cbiAgICAvL2NhbWVyYSBwdXNoIGFuZCBwb3BcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cuY2FtZXJhUHVzaCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy5jYW1lcmFQb3ApO1xuXG4gIH1cblxuICAvLyBJbXBvcnRhbnQgdG8gcmVzZXQgdGhlc2UgYWZ0ZXIgdGhpcy5wNSBoYXMgYmVlbiByZW1vdmVkIGFib3ZlXG4gIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgdGhpcy5zZXR1cEluUHJvZ3Jlc3MgPSBmYWxzZTtcblxuICB3aW5kb3cucDUucHJvdG90eXBlLmdhbWVsYWJQcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gd2luZG93LnA1Ll9nZXREZWNyZW1lbnRQcmVsb2FkKGFyZ3VtZW50cywgdGhpcy5wNSk7XG4gIH0uYmluZCh0aGlzKTtcbn07XG5cbi8qKlxuICogSW5zdGFudGlhdGUgYSBuZXcgcDUgYW5kIHN0YXJ0IGV4ZWN1dGlvblxuICovXG5HYW1lTGFiUDUucHJvdG90eXBlLnN0YXJ0RXhlY3V0aW9uID0gZnVuY3Rpb24gKCkge1xuXG4gIC8qIGpzaGludCBub25ldzpmYWxzZSAqL1xuICBuZXcgd2luZG93LnA1KGZ1bmN0aW9uIChwNW9iaikge1xuICAgICAgdGhpcy5wNSA9IHA1b2JqO1xuXG4gICAgICBwNW9iai5yZWdpc3RlclByZWxvYWRNZXRob2QoJ2dhbWVsYWJQcmVsb2FkJywgd2luZG93LnA1LnByb3RvdHlwZSk7XG5cbiAgICAgIC8vIE92ZXJsb2FkIF9kcmF3IGZ1bmN0aW9uIHRvIG1ha2UgaXQgdHdvLXBoYXNlXG4gICAgICBwNW9iai5fZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfZHJhdygpXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl90aGlzRnJhbWVUaW1lID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB2YXIgdGltZV9zaW5jZV9sYXN0ID0gdGhpcy5fdGhpc0ZyYW1lVGltZSAtIHRoaXMuX2xhc3RGcmFtZVRpbWU7XG4gICAgICAgIHZhciB0YXJnZXRfdGltZV9iZXR3ZWVuX2ZyYW1lcyA9IDEwMDAgLyB0aGlzLl90YXJnZXRGcmFtZVJhdGU7XG5cbiAgICAgICAgLy8gb25seSBkcmF3IGlmIHdlIHJlYWxseSBuZWVkIHRvOyBkb24ndCBvdmVyZXh0ZW5kIHRoZSBicm93c2VyLlxuICAgICAgICAvLyBkcmF3IGlmIHdlJ3JlIHdpdGhpbiA1bXMgb2Ygd2hlbiBvdXIgbmV4dCBmcmFtZSBzaG91bGQgcGFpbnRcbiAgICAgICAgLy8gKHRoaXMgd2lsbCBwcmV2ZW50IHVzIGZyb20gZ2l2aW5nIHVwIG9wcG9ydHVuaXRpZXMgdG8gZHJhd1xuICAgICAgICAvLyBhZ2FpbiB3aGVuIGl0J3MgcmVhbGx5IGFib3V0IHRpbWUgZm9yIHVzIHRvIGRvIHNvKS4gZml4ZXMgYW5cbiAgICAgICAgLy8gaXNzdWUgd2hlcmUgdGhlIGZyYW1lUmF0ZSBpcyB0b28gbG93IGlmIG91ciByZWZyZXNoIGxvb3AgaXNuJ3RcbiAgICAgICAgLy8gaW4gc3luYyB3aXRoIHRoZSBicm93c2VyLiBub3RlIHRoYXQgd2UgaGF2ZSB0byBkcmF3IG9uY2UgZXZlblxuICAgICAgICAvLyBpZiBsb29waW5nIGlzIG9mZiwgc28gd2UgYnlwYXNzIHRoZSB0aW1lIGRlbGF5IGlmIHRoYXRcbiAgICAgICAgLy8gaXMgdGhlIGNhc2UuXG4gICAgICAgIHZhciBlcHNpbG9uID0gNTtcbiAgICAgICAgaWYgKCF0aGlzLmxvb3AgfHxcbiAgICAgICAgICAgIHRpbWVfc2luY2VfbGFzdCA+PSB0YXJnZXRfdGltZV9iZXR3ZWVuX2ZyYW1lcyAtIGVwc2lsb24pIHtcbiAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eSgnZnJhbWVDb3VudCcsIHRoaXMuZnJhbWVDb3VudCArIDEpO1xuICAgICAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fZHJhd0VwaWxvZ3VlKCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIHA1b2JqLmFmdGVyUmVkcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9kcmF3KClcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3VwZGF0ZVBBY2NlbGVyYXRpb25zKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBSb3RhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlUE1vdXNlQ29vcmRzKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBUb3VjaENvb3JkcygpO1xuICAgICAgICB0aGlzLl9mcmFtZVJhdGUgPSAxMDAwLjAvKHRoaXMuX3RoaXNGcmFtZVRpbWUgLSB0aGlzLl9sYXN0RnJhbWVUaW1lKTtcbiAgICAgICAgdGhpcy5fbGFzdEZyYW1lVGltZSA9IHRoaXMuX3RoaXNGcmFtZVRpbWU7XG5cbiAgICAgICAgdGhpcy5fZHJhd0VwaWxvZ3VlKCk7XG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICBwNW9iai5fZHJhd0VwaWxvZ3VlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9kcmF3KClcbiAgICAgICAgICovXG5cbiAgICAgICAgLy9tYW5kYXRvcnkgdXBkYXRlIHZhbHVlcyhtYXRyaXhzIGFuZCBzdGFjaykgZm9yIDNkXG4gICAgICAgIGlmKHRoaXMuX3JlbmRlcmVyLmlzUDNEKXtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5fdXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZXQgbm90aWZpZWQgdGhlIG5leHQgdGltZSB0aGUgYnJvd3NlciBnaXZlcyB1c1xuICAgICAgICAvLyBhbiBvcHBvcnR1bml0eSB0byBkcmF3LlxuICAgICAgICBpZiAodGhpcy5fbG9vcCkge1xuICAgICAgICAgIHRoaXMuX3JlcXVlc3RBbmltSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2RyYXcpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICAvLyBPdmVybG9hZCBfc2V0dXAgZnVuY3Rpb24gdG8gbWFrZSBpdCB0d28tcGhhc2VcbiAgICAgIHA1b2JqLl9zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9zZXR1cCgpXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vIHJldHVybiBwcmVsb2FkIGZ1bmN0aW9ucyB0byB0aGVpciBub3JtYWwgdmFscyBpZiBzd2l0Y2hlZCBieSBwcmVsb2FkXG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5faXNHbG9iYWwgPyB3aW5kb3cgOiB0aGlzO1xuICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQucHJlbG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGZvciAodmFyIGYgaW4gdGhpcy5fcHJlbG9hZE1ldGhvZHMpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZl0gPSB0aGlzLl9wcmVsb2FkTWV0aG9kc1tmXVtmXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaG9ydC1jaXJjdWl0IG9uIHRoaXMsIGluIGNhc2Ugc29tZW9uZSB1c2VkIHRoZSBsaWJyYXJ5IGluIFwiZ2xvYmFsXCJcbiAgICAgICAgLy8gbW9kZSBlYXJsaWVyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGV4dC5zZXR1cCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnRleHQuc2V0dXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zZXR1cEVwaWxvZ3VlKCk7XG4gICAgICAgIH1cblxuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgcDVvYmouX3NldHVwRXBpbG9ndWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX3NldHVwKClcbiAgICAgICAgICovXG5cbiAgICAgICAgLy8gLy8gdW5oaWRlIGhpZGRlbiBjYW52YXMgdGhhdCB3YXMgY3JlYXRlZFxuICAgICAgICAvLyB0aGlzLmNhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG4gICAgICAgIC8vIHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9IHRoaXMuY2FudmFzLmNsYXNzTmFtZS5yZXBsYWNlKCdwNV9oaWRkZW4nLCAnJyk7XG5cbiAgICAgICAgLy8gdW5oaWRlIGFueSBoaWRkZW4gY2FudmFzZXMgdGhhdCB3ZXJlIGNyZWF0ZWRcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoLyhefFxccylwNV9oaWRkZW4oPyFcXFMpL2cpO1xuICAgICAgICB2YXIgY2FudmFzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwNV9oaWRkZW4nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW52YXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBrID0gY2FudmFzZXNbaV07XG4gICAgICAgICAgay5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG4gICAgICAgICAgay5jbGFzc05hbWUgPSBrLmNsYXNzTmFtZS5yZXBsYWNlKHJlZywgJycpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldHVwRG9uZSA9IHRydWU7XG5cbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIC8vIERvIHRoaXMgYWZ0ZXIgd2UncmUgZG9uZSBtb25rZXlpbmcgd2l0aCB0aGUgcDVvYmogaW5zdGFuY2UgbWV0aG9kczpcbiAgICAgIHA1b2JqLnNldHVwR2xvYmFsTW9kZSgpO1xuXG4gICAgICB3aW5kb3cucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ2FsbCBvdXIgZ2FtZWxhYlByZWxvYWQoKSB0byBmb3JjZSBfc3RhcnQvX3NldHVwIHRvIHdhaXQuXG4gICAgICAgIHdpbmRvdy5nYW1lbGFiUHJlbG9hZCgpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIHA1IFwicHJlbG9hZCBtZXRob2RzXCIgd2VyZSBtb2RpZmllZCBiZWZvcmUgdGhpcyBwcmVsb2FkIGZ1bmN0aW9uIHdhc1xuICAgICAgICAgKiBjYWxsZWQgYW5kIHN1YnN0aXR1dGVkIHdpdGggd3JhcHBlZCB2ZXJzaW9uIHRoYXQgaW5jcmVtZW50IGEgcHJlbG9hZFxuICAgICAgICAgKiBjb3VudCBhbmQgd2lsbCBsYXRlciBkZWNyZW1lbnQgYSBwcmVsb2FkIGNvdW50IHVwb24gYXN5bmMgbG9hZFxuICAgICAgICAgKiBjb21wbGV0aW9uLiBTaW5jZSBwNSBpcyBydW5uaW5nIGluIGdsb2JhbCBtb2RlLCBpdCBvbmx5IHdyYXBwZWQgdGhlXG4gICAgICAgICAqIG1ldGhvZHMgb24gdGhlIHdpbmRvdyBvYmplY3QuIFdlIG5lZWQgdG8gcGxhY2UgdGhlIHdyYXBwZWQgbWV0aG9kcyBvblxuICAgICAgICAgKiB0aGUgcDUgb2JqZWN0IGFzIHdlbGwgYmVmb3JlIHdlIG1hcnNoYWwgdG8gdGhlIGludGVycHJldGVyXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5wNS5fcHJlbG9hZE1ldGhvZHMpIHtcbiAgICAgICAgICB0aGlzLnA1W21ldGhvZF0gPSB3aW5kb3dbbWV0aG9kXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25QcmVsb2FkKCk7XG5cbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgIHdpbmRvdy5zZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogcDUgXCJwcmVsb2FkIG1ldGhvZHNcIiBoYXZlIG5vdyBiZWVuIHJlc3RvcmVkIGFuZCB0aGUgd3JhcHBlZCB2ZXJzaW9uXG4gICAgICAgICAqIGFyZSBubyBsb25nZXIgaW4gdXNlLiBTaW5jZSBwNSBpcyBydW5uaW5nIGluIGdsb2JhbCBtb2RlLCBpdCBvbmx5XG4gICAgICAgICAqIHJlc3RvcmVkIHRoZSBtZXRob2RzIG9uIHRoZSB3aW5kb3cgb2JqZWN0LiBXZSBuZWVkIHRvIHJlc3RvcmUgdGhlXG4gICAgICAgICAqIG1ldGhvZHMgb24gdGhlIHA1IG9iamVjdCB0byBtYXRjaFxuICAgICAgICAgKi9cbiAgICAgICAgZm9yICh2YXIgbWV0aG9kIGluIHRoaXMucDUuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICAgICAgdGhpcy5wNVttZXRob2RdID0gd2luZG93W21ldGhvZF07XG4gICAgICAgIH1cblxuICAgICAgICBwNW9iai5jcmVhdGVDYW52YXMoNDAwLCA0MDApO1xuXG4gICAgICAgIHRoaXMub25TZXR1cCgpO1xuXG4gICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgIHdpbmRvdy5kcmF3ID0gdGhpcy5vbkRyYXcuYmluZCh0aGlzKTtcblxuICAgICAgdGhpcy5vbkV4ZWN1dGlvblN0YXJ0aW5nKCk7XG5cbiAgICB9LmJpbmQodGhpcyksXG4gICAgJ2RpdkdhbWVMYWInKTtcbiAgLyoganNoaW50IG5vbmV3OnRydWUgKi9cbn07XG5cbi8qKlxuICogQ2FsbGVkIHdoZW4gYWxsIGdsb2JhbCBjb2RlIGlzIGRvbmUgZXhlY3V0aW5nLiBUaGlzIGFsbG93cyB1cyB0byByZWxlYXNlXG4gKiBvdXIgXCJwcmVsb2FkXCIgY291bnQgcmVmZXJlbmNlIGluIHA1LCB3aGljaCBtZWFucyB0aGF0IHNldHVwKCkgY2FuIGJlZ2luLlxuICovXG5HYW1lTGFiUDUucHJvdG90eXBlLm5vdGlmeVVzZXJHbG9iYWxDb2RlQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCkge1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKCk7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB9XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmdldEN1c3RvbU1hcnNoYWxHbG9iYWxQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB0aGlzLnA1LFxuICAgIGhlaWdodDogdGhpcy5wNSxcbiAgICBkaXNwbGF5V2lkdGg6IHRoaXMucDUsXG4gICAgZGlzcGxheUhlaWdodDogdGhpcy5wNSxcbiAgICB3aW5kb3dXaWR0aDogdGhpcy5wNSxcbiAgICB3aW5kb3dIZWlnaHQ6IHRoaXMucDUsXG4gICAgZm9jdXNlZDogdGhpcy5wNSxcbiAgICBmcmFtZUNvdW50OiB0aGlzLnA1LFxuICAgIGtleUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICBrZXk6IHRoaXMucDUsXG4gICAga2V5Q29kZTogdGhpcy5wNSxcbiAgICBtb3VzZVg6IHRoaXMucDUsXG4gICAgbW91c2VZOiB0aGlzLnA1LFxuICAgIHBtb3VzZVg6IHRoaXMucDUsXG4gICAgcG1vdXNlWTogdGhpcy5wNSxcbiAgICB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgd2luTW91c2VZOiB0aGlzLnA1LFxuICAgIHB3aW5Nb3VzZVg6IHRoaXMucDUsXG4gICAgcHdpbk1vdXNlWTogdGhpcy5wNSxcbiAgICBtb3VzZUJ1dHRvbjogdGhpcy5wNSxcbiAgICBtb3VzZUlzUHJlc3NlZDogdGhpcy5wNSxcbiAgICB0b3VjaFg6IHRoaXMucDUsXG4gICAgdG91Y2hZOiB0aGlzLnA1LFxuICAgIHB0b3VjaFg6IHRoaXMucDUsXG4gICAgcHRvdWNoWTogdGhpcy5wNSxcbiAgICB0b3VjaGVzOiB0aGlzLnA1LFxuICAgIHRvdWNoSXNEb3duOiB0aGlzLnA1LFxuICAgIHBpeGVsczogdGhpcy5wNSxcbiAgICBkZXZpY2VPcmllbnRhdGlvbjogdGhpcy5wNSxcbiAgICBhY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgIGFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgYWNjZWxlcmF0aW9uWjogdGhpcy5wNSxcbiAgICBwQWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICBwQWNjZWxlcmF0aW9uWTogdGhpcy5wNSxcbiAgICBwQWNjZWxlcmF0aW9uWjogdGhpcy5wNSxcbiAgICByb3RhdGlvblg6IHRoaXMucDUsXG4gICAgcm90YXRpb25ZOiB0aGlzLnA1LFxuICAgIHJvdGF0aW9uWjogdGhpcy5wNSxcbiAgICBwUm90YXRpb25YOiB0aGlzLnA1LFxuICAgIHBSb3RhdGlvblk6IHRoaXMucDUsXG4gICAgcFJvdGF0aW9uWjogdGhpcy5wNVxuICB9O1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRDdXN0b21NYXJzaGFsT2JqZWN0TGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBpbnN0YW5jZTogd2luZG93LlNwcml0ZSxcbiAgICAgIG1ldGhvZE9wdHM6IHtcbiAgICAgICAgbmF0aXZlQ2FsbHNCYWNrSW50ZXJwcmV0ZXI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFRoZSBwNXBsYXkgR3JvdXAgb2JqZWN0IHNob3VsZCBiZSBjdXN0b20gbWFyc2hhbGxlZCwgYnV0IGl0cyBjb25zdHJ1Y3RvclxuICAgIC8vIGFjdHVhbGx5IGNyZWF0ZXMgYSBzdGFuZGFyZCBBcnJheSBpbnN0YW5jZSB3aXRoIGEgZmV3IGFkZGl0aW9uYWwgbWV0aG9kc1xuICAgIC8vIGFkZGVkLiBXZSBzb2x2ZSB0aGlzIGJ5IHB1dHRpbmcgXCJBcnJheVwiIGluIHRoaXMgbGlzdCwgYnV0IHdpdGggXCJkcmF3XCIgYXNcbiAgICAvLyBhIHJlcXVpcmVkTWV0aG9kOlxuICAgIHtcbiAgICAgIGluc3RhbmNlOiBBcnJheSxcbiAgICAgIHJlcXVpcmVkTWV0aG9kOiAnZHJhdycsXG4gICAgICBtZXRob2RPcHRzOiB7XG4gICAgICAgIG5hdGl2ZUNhbGxzQmFja0ludGVycHJldGVyOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cuQ2FtZXJhIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LkFuaW1hdGlvbiB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5WZWN0b3IgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuQ29sb3IgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuSW1hZ2UgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuUmVuZGVyZXIgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuR3JhcGhpY3MgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuRm9udCB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5UYWJsZSB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5UYWJsZVJvdyB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5FbGVtZW50IH0sXG4gIF07XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmdldEdsb2JhbFByb3BlcnR5TGlzdCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgcHJvcExpc3QgPSB7fTtcblxuICAvLyBJbmNsdWRlIGV2ZXJ5IHByb3BlcnR5IG9uIHRoZSBwNSBpbnN0YW5jZSBpbiB0aGUgZ2xvYmFsIHByb3BlcnR5IGxpc3Q6XG4gIGZvciAodmFyIHByb3AgaW4gdGhpcy5wNSkge1xuICAgIHByb3BMaXN0W3Byb3BdID0gWyB0aGlzLnA1W3Byb3BdLCB0aGlzLnA1IF07XG4gIH1cbiAgLy8gQW5kIHRoZSBHcm91cCBjb25zdHJ1Y3RvciBmcm9tIHA1cGxheTpcbiAgcHJvcExpc3QuR3JvdXAgPSBbIHdpbmRvdy5Hcm91cCwgd2luZG93IF07XG4gIC8vIEFuZCBhbHNvIGNyZWF0ZSBhICdwNScgb2JqZWN0IGluIHRoZSBnbG9iYWwgbmFtZXNwYWNlOlxuICBwcm9wTGlzdC5wNSA9IFsgeyBWZWN0b3I6IHdpbmRvdy5wNS5WZWN0b3IgfSwgd2luZG93IF07XG5cbiAgcmV0dXJuIHByb3BMaXN0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgZnJhbWUgcmF0ZVxuICovXG5HYW1lTGFiUDUucHJvdG90eXBlLmdldEZyYW1lUmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucDUgPyB0aGlzLnA1LmZyYW1lUmF0ZSgpIDogMDtcbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuYWZ0ZXJEcmF3Q29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucDUuYWZ0ZXJVc2VyRHJhdygpO1xuICB0aGlzLnA1LmFmdGVyUmVkcmF3KCk7XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmFmdGVyU2V0dXBDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5wNS5fc2V0dXBFcGlsb2d1ZSgpO1xufTtcbiIsIi8vIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4vKlxuICogT3ZlcnJpZGUgU3ByaXRlLkFBQkJvcHMgc28gaXQgY2FuIGJlIGNhbGxlZCBhcyBhIHN0YXRlZnVsIG5hdGl2ZUZ1bmMgYnkgdGhlXG4gKiBpbnRlcnByZXRlci4gVGhpcyBlbmFibGVzIHRoZSBuYXRpdmUgbWV0aG9kIHRvIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBzb1xuICogdGhhdCBpdCBjYW4gZ28gYXN5bmNocm9ub3VzIGV2ZXJ5IHRpbWUgaXQgd2FudHMgdG8gZXhlY3V0ZSBhIGNhbGxiYWNrIGJhY2tcbiAqIGludG8gaW50ZXJwcmV0ZXIgY29kZS4gVGhlIGludGVycHJldGVyIHN0YXRlIG9iamVjdCBpcyByZXRyaWV2ZWQgYnkgY2FsbGluZ1xuICoganNJbnRlcnByZXRlci5nZXRDdXJyZW50U3RhdGUoKS5cbiAqXG4gKiBBZGRpdGlvbmFsIHByb3BlcnRpZXMgY2FuIGJlIHNldCBvbiB0aGUgc3RhdGUgb2JqZWN0IHRvIHRyYWNrIHN0YXRlIGFjcm9zc1xuICogdGhlIG11bHRpcGxlIGV4ZWN1dGlvbnMuIElmIHRoZSBmdW5jdGlvbiB3YW50cyB0byBiZSBjYWxsZWQgYWdhaW4sIGl0IHNob3VsZFxuICogc2V0IHN0YXRlLmRvbmVFeGVjIHRvIGZhbHNlLiBXaGVuIHRoZSBmdW5jdGlvbiBpcyBjb21wbGV0ZSBhbmQgbm8gbG9uZ2VyXG4gKiB3YW50cyB0byBiZSBjYWxsZWQgaW4gYSBsb29wIGJ5IHRoZSBpbnRlcnByZXRlciwgaXQgc2hvdWxkIHNldCBzdGF0ZS5kb25lRXhlY1xuICogdG8gdHJ1ZSBhbmQgcmV0dXJuIGEgdmFsdWUuXG4gKi9cblxudmFyIGpzSW50ZXJwcmV0ZXI7XG5cbm1vZHVsZS5leHBvcnRzLmluamVjdEpTSW50ZXJwcmV0ZXIgPSBmdW5jdGlvbiAoanNpKSB7XG4gIGpzSW50ZXJwcmV0ZXIgPSBqc2k7XG59O1xuXG4vKlxuICogQ29waWVkIGNvZGUgZnJvbSBwNXBsYXkgZnJvbSBTcHJpdGUoKSB3aXRoIHRhcmdldGVkIG1vZGlmaWNhdGlvbnMgdGhhdFxuICogdXNlIHRoZSBhZGRpdGlvbmFsIHN0YXRlIHBhcmFtZXRlclxuICovXG5tb2R1bGUuZXhwb3J0cy5BQUJCb3BzID0gZnVuY3Rpb24odHlwZSwgdGFyZ2V0LCBjYWxsYmFjaykge1xuXG4gIHZhciBzdGF0ZSA9IGpzSW50ZXJwcmV0ZXIuZ2V0Q3VycmVudFN0YXRlKCk7XG4gIGlmIChzdGF0ZS5fX3N1YlN0YXRlKSB7XG4gICAgLy8gSWYgd2UncmUgYmVpbmcgY2FsbGVkIGJ5IGFub3RoZXIgc3RhdGVmdWwgZnVuY3Rpb24gdGhhdCBodW5nIGEgX19zdWJTdGF0ZVxuICAgIC8vIG9mZiBvZiBzdGF0ZSwgdXNlIHRoYXQgaW5zdGVhZDpcbiAgICBzdGF0ZSA9IHN0YXRlLl9fc3ViU3RhdGU7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodHlwZW9mIHN0YXRlLl9faSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzdGF0ZS5fX2kgPSAwO1xuXG4gICAgdGhpcy50b3VjaGluZy5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZy5yaWdodCA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hpbmcudG9wID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZy5ib3R0b20gPSBmYWxzZTtcblxuICAgIC8vaWYgc2luZ2xlIHNwcml0ZSB0dXJuIGludG8gYXJyYXkgYW55d2F5XG4gICAgc3RhdGUuX19vdGhlcnMgPSBbXTtcblxuICAgIGlmKHRhcmdldCBpbnN0YW5jZW9mIFNwcml0ZSlcbiAgICAgIHN0YXRlLl9fb3RoZXJzLnB1c2godGFyZ2V0KTtcbiAgICBlbHNlIGlmKHRhcmdldCBpbnN0YW5jZW9mIEFycmF5KVxuICAgIHtcbiAgICAgIGlmKHF1YWRUcmVlICE9IHVuZGVmaW5lZCAmJiBxdWFkVHJlZS5hY3RpdmUpXG4gICAgICAgIHN0YXRlLl9fb3RoZXJzID0gcXVhZFRyZWUucmV0cmlldmVGcm9tR3JvdXAoIHRoaXMsIHRhcmdldCk7XG5cbiAgICAgIGlmKHN0YXRlLl9fb3RoZXJzLmxlbmd0aCA9PSAwKVxuICAgICAgICBzdGF0ZS5fX290aGVycyA9IHRhcmdldDtcblxuICAgIH1cbiAgICBlbHNlXG4gICAgICB0aHJvdyhcIkVycm9yOiBvdmVybGFwIGNhbiBvbmx5IGJlIGNoZWNrZWQgYmV0d2VlbiBzcHJpdGVzIG9yIGdyb3Vwc1wiKTtcblxuICB9IGVsc2Uge1xuICAgIHN0YXRlLl9faSsrO1xuICB9XG4gIGlmIChzdGF0ZS5fX2kgPCBzdGF0ZS5fX290aGVycy5sZW5ndGgpIHtcbiAgICB2YXIgaSA9IHN0YXRlLl9faTtcblxuICAgIGlmKHRoaXMgIT0gc3RhdGUuX19vdGhlcnNbaV0gJiYgIXRoaXMucmVtb3ZlZCkgLy95b3UgY2FuIGNoZWNrIGNvbGxpc2lvbnMgd2l0aGluIHRoZSBzYW1lIGdyb3VwIGJ1dCBub3Qgb24gaXRzZWxmXG4gICAge1xuICAgICAgdmFyIG90aGVyID0gc3RhdGUuX19vdGhlcnNbaV07XG5cbiAgICAgIGlmKHRoaXMuY29sbGlkZXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLnNldERlZmF1bHRDb2xsaWRlcigpO1xuXG4gICAgICBpZihvdGhlci5jb2xsaWRlciA9PSB1bmRlZmluZWQpXG4gICAgICAgIG90aGVyLnNldERlZmF1bHRDb2xsaWRlcigpO1xuXG4gICAgICAvKlxuICAgICAgaWYodGhpcy5jb2xsaWRlclR5cGU9PVwiZGVmYXVsdFwiICYmIGFuaW1hdGlvbnNbY3VycmVudEFuaW1hdGlvbl0hPW51bGwpXG4gICAgICB7XG4gICAgICAgIHByaW50KFwiYnVzdGVkXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9Ki9cbiAgICAgIGlmKHRoaXMuY29sbGlkZXIgIT0gdW5kZWZpbmVkICYmIG90aGVyLmNvbGxpZGVyICE9IHVuZGVmaW5lZClcbiAgICAgIHtcbiAgICAgIGlmKHR5cGU9PVwib3ZlcmxhcFwiKSAge1xuICAgICAgICAgIHZhciBvdmVyO1xuXG4gICAgICAgICAgLy9pZiB0aGUgb3RoZXIgaXMgYSBjaXJjbGUgSSBjYWxjdWxhdGUgdGhlIGRpc3BsYWNlbWVudCBmcm9tIGhlcmVcbiAgICAgICAgICBpZih0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG4gICAgICAgICAgICAgIG92ZXIgPSBvdGhlci5jb2xsaWRlci5vdmVybGFwKHRoaXMuY29sbGlkZXIpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgb3ZlciA9IHRoaXMuY29sbGlkZXIub3ZlcmxhcChvdGhlci5jb2xsaWRlcik7XG5cbiAgICAgICAgICBpZihvdmVyKVxuICAgICAgICAgIHtcblxuICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYoY2FsbGJhY2sgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgb3RoZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgZWxzZSBpZih0eXBlPT1cImNvbGxpZGVcIiB8fCB0eXBlID09IFwiYm91bmNlXCIpXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgZGlzcGxhY2VtZW50ID0gY3JlYXRlVmVjdG9yKDAsMCk7XG5cbiAgICAgICAgICAvL2lmIHRoZSBzdW0gb2YgdGhlIHNwZWVkIGlzIG1vcmUgdGhhbiB0aGUgY29sbGlkZXIgaSBtYXlcbiAgICAgICAgICAvL2hhdmUgYSB0dW5uZWxsaW5nIHByb2JsZW1cbiAgICAgICAgICB2YXIgdHVubmVsWCA9IGFicyh0aGlzLnZlbG9jaXR5Lngtb3RoZXIudmVsb2NpdHkueCkgPj0gb3RoZXIuY29sbGlkZXIuZXh0ZW50cy54LzIgJiYgcm91bmQodGhpcy5kZWx0YVggLSB0aGlzLnZlbG9jaXR5LngpID09IDA7XG5cbiAgICAgICAgICB2YXIgdHVubmVsWSA9IGFicyh0aGlzLnZlbG9jaXR5Lnktb3RoZXIudmVsb2NpdHkueSkgPj0gIG90aGVyLmNvbGxpZGVyLnNpemUoKS55LzIgICYmIHJvdW5kKHRoaXMuZGVsdGFZIC0gdGhpcy52ZWxvY2l0eS55KSA9PSAwO1xuXG5cbiAgICAgICAgICBpZih0dW5uZWxYIHx8IHR1bm5lbFkpXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy9pbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb2xsaWRlcnMgSSB1c2UgdGhlIGJvdW5kaW5nIGJveFxuICAgICAgICAgICAgLy9hcm91bmQgdGhlIHByZXZpb3VzIHBvc2l0aW9uIGFuZCBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICAvL3RoaXMgaXMgcmVnYXJkbGVzcyBvZiB0aGUgY29sbGlkZXIgdHlwZVxuXG4gICAgICAgICAgICAvL3RoZSBjZW50ZXIgaXMgdGhlIGF2ZXJhZ2Ugb2YgdGhlIGNvbGwgY2VudGVyc1xuICAgICAgICAgICAgdmFyIGMgPSBjcmVhdGVWZWN0b3IoXG4gICAgICAgICAgICAgICh0aGlzLnBvc2l0aW9uLngrdGhpcy5wcmV2aW91c1Bvc2l0aW9uLngpLzIsXG4gICAgICAgICAgICAgICh0aGlzLnBvc2l0aW9uLnkrdGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkpLzIpO1xuXG4gICAgICAgICAgICAvL3RoZSBleHRlbnRzIGFyZSB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY29sbCBjZW50ZXJzXG4gICAgICAgICAgICAvL3BsdXMgdGhlIGV4dGVudHMgb2YgYm90aFxuICAgICAgICAgICAgdmFyIGUgPSBjcmVhdGVWZWN0b3IoXG4gICAgICAgICAgICAgIGFicyh0aGlzLnBvc2l0aW9uLnggLXRoaXMucHJldmlvdXNQb3NpdGlvbi54KSArIHRoaXMuY29sbGlkZXIuZXh0ZW50cy54LFxuICAgICAgICAgICAgICBhYnModGhpcy5wb3NpdGlvbi55IC10aGlzLnByZXZpb3VzUG9zaXRpb24ueSkgKyB0aGlzLmNvbGxpZGVyLmV4dGVudHMueSk7XG5cbiAgICAgICAgICAgIHZhciBiYm94ID0gbmV3IEFBQkIoYywgZSwgdGhpcy5jb2xsaWRlci5vZmZzZXQpO1xuXG4gICAgICAgICAgICAvL2Jib3guZHJhdygpO1xuXG4gICAgICAgICAgICBpZihiYm94Lm92ZXJsYXAob3RoZXIuY29sbGlkZXIpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZih0dW5uZWxYKSB7XG5cbiAgICAgICAgICAgICAgICAvL2VudGVyaW5nIGZyb20gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgaWYodGhpcy52ZWxvY2l0eS54IDwgMClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC54ID0gb3RoZXIuY29sbGlkZXIucmlnaHQoKSAtIHRoaXMuY29sbGlkZXIubGVmdCgpICsgMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmKHRoaXMudmVsb2NpdHkueCA+IDAgKVxuICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50LnggPSBvdGhlci5jb2xsaWRlci5sZWZ0KCkgLSB0aGlzLmNvbGxpZGVyLnJpZ2h0KCkgLTE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmKHR1bm5lbFkpIHtcbiAgICAgICAgICAgICAgICAvL2Zyb20gdG9wXG4gICAgICAgICAgICAgICAgaWYodGhpcy52ZWxvY2l0eS55ID4gMClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC55ID0gb3RoZXIuY29sbGlkZXIudG9wKCkgLSB0aGlzLmNvbGxpZGVyLmJvdHRvbSgpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmKHRoaXMudmVsb2NpdHkueSA8IDAgKVxuICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50LnkgPSBvdGhlci5jb2xsaWRlci5ib3R0b20oKSAtIHRoaXMuY29sbGlkZXIudG9wKCkgKyAxO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9Ly9lbmQgb3ZlcmxhcFxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgLy9ub24gdHVubmVsIG92ZXJsYXBcbiAgICAgICAgICB7XG5cbiAgICAgICAgICAgIC8vaWYgdGhlIG90aGVyIGlzIGEgY2lyY2xlIEkgY2FsY3VsYXRlIHRoZSBkaXNwbGFjZW1lbnQgZnJvbSBoZXJlXG4gICAgICAgICAgICAvL2FuZCByZXZlcnNlIGl0XG4gICAgICAgICAgICBpZih0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gb3RoZXIuY29sbGlkZXIuY29sbGlkZSh0aGlzLmNvbGxpZGVyKS5tdWx0KC0xKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQgPSB0aGlzLmNvbGxpZGVyLmNvbGxpZGUob3RoZXIuY29sbGlkZXIpO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPT0gMCAmJiAgZGlzcGxhY2VtZW50LnkgPT0gMCApXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAge1xuXG4gICAgICAgICAgICBpZighdGhpcy5pbW1vdmFibGUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRoaXMucG9zaXRpb24uYWRkKGRpc3BsYWNlbWVudCk7XG4gICAgICAgICAgICAgIHRoaXMucHJldmlvdXNQb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgIHRoaXMubmV3UG9zaXRpb24gPSBjcmVhdGVWZWN0b3IodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA8IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueSA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcudG9wID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYodHlwZSA9PSBcImJvdW5jZVwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZihvdGhlci5pbW1vdmFibGUpXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWDEgPSAtdGhpcy52ZWxvY2l0eS54K290aGVyLnZlbG9jaXR5Lng7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFkxID0gLXRoaXMudmVsb2NpdHkueStvdGhlci52ZWxvY2l0eS55O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFgxID0gKHRoaXMudmVsb2NpdHkueCAqICh0aGlzLm1hc3MgLSBvdGhlci5tYXNzKSArICgyICogb3RoZXIubWFzcyAqIG90aGVyLnZlbG9jaXR5LngpKSAvICh0aGlzLm1hc3MgKyBvdGhlci5tYXNzKTtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxZMSA9ICh0aGlzLnZlbG9jaXR5LnkgKiAodGhpcy5tYXNzIC0gb3RoZXIubWFzcykgKyAoMiAqIG90aGVyLm1hc3MgKiBvdGhlci52ZWxvY2l0eS55KSkgLyAodGhpcy5tYXNzICsgb3RoZXIubWFzcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWDIgPSAob3RoZXIudmVsb2NpdHkueCAqIChvdGhlci5tYXNzIC0gdGhpcy5tYXNzKSArICgyICogdGhpcy5tYXNzICogdGhpcy52ZWxvY2l0eS54KSkgLyAodGhpcy5tYXNzICsgb3RoZXIubWFzcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWTIgPSAob3RoZXIudmVsb2NpdHkueSAqIChvdGhlci5tYXNzIC0gdGhpcy5tYXNzKSArICgyICogdGhpcy5tYXNzICogdGhpcy52ZWxvY2l0eS55KSkgLyAodGhpcy5tYXNzICsgb3RoZXIubWFzcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL3ZhciBib3RoQ2lyY2xlcyA9ICh0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIgJiZcbiAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgb3RoZXIuY29sbGlkZXIgIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpO1xuXG4gICAgICAgICAgICAgIC8vaWYodGhpcy50b3VjaGluZy5sZWZ0IHx8IHRoaXMudG91Y2hpbmcucmlnaHQgfHwgdGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuXG4gICAgICAgICAgICAgIC8vcHJpbnQoZGlzcGxhY2VtZW50KTtcblxuICAgICAgICAgICAgICBpZihhYnMoZGlzcGxhY2VtZW50LngpPmFicyhkaXNwbGFjZW1lbnQueSkpXG4gICAgICAgICAgICAgIHtcblxuXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueCA9IG5ld1ZlbFgxKnRoaXMucmVzdGl0dXRpb247XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighb3RoZXIuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICAgICAgb3RoZXIudmVsb2NpdHkueCA9IG5ld1ZlbFgyKm90aGVyLnJlc3RpdHV0aW9uO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9pZih0aGlzLnRvdWNoaW5nLnRvcCB8fCB0aGlzLnRvdWNoaW5nLmJvdHRvbSB8fCB0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG4gICAgICAgICAgICAgIGlmKGFicyhkaXNwbGFjZW1lbnQueCk8YWJzKGRpc3BsYWNlbWVudC55KSlcbiAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS55ID0gbmV3VmVsWTEqdGhpcy5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgICAgIGlmKCFvdGhlci5pbW1vdmFibGUpXG4gICAgICAgICAgICAgICAgICBvdGhlci52ZWxvY2l0eS55ID0gbmV3VmVsWTIqb3RoZXIucmVzdGl0dXRpb247XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vZWxzZSBpZih0eXBlID09IFwiY29sbGlkZVwiKVxuICAgICAgICAgICAgICAvL3RoaXMudmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwwKTtcblxuICAgICAgICAgICAgaWYoY2FsbGJhY2sgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgb3RoZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHR5cGU9PVwiZGlzcGxhY2VcIikgIHtcblxuICAgICAgICAgIC8vaWYgdGhlIG90aGVyIGlzIGEgY2lyY2xlIEkgY2FsY3VsYXRlIHRoZSBkaXNwbGFjZW1lbnQgZnJvbSBoZXJlXG4gICAgICAgICAgLy9hbmQgcmV2ZXJzZSBpdFxuICAgICAgICAgIGlmKHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcbiAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IG90aGVyLmNvbGxpZGVyLmNvbGxpZGUodGhpcy5jb2xsaWRlcikubXVsdCgtMSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gdGhpcy5jb2xsaWRlci5jb2xsaWRlKG90aGVyLmNvbGxpZGVyKTtcblxuXG4gICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPT0gMCAmJiAgZGlzcGxhY2VtZW50LnkgPT0gMCApXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAge1xuICAgICAgICAgICAgb3RoZXIucG9zaXRpb24uc3ViKGRpc3BsYWNlbWVudCk7XG5cbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID4gMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54IDwgMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueSA8IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcuYm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC55ID4gMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy50b3AgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZihjYWxsYmFjayAhPSB1bmRlZmluZWQgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzLCBvdGhlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9Ly9lbmQgY29sbGlkZXIgZXhpc3RzXG4gICAgfVxuICAgIC8vIE5vdCBkb25lLCBjYWxsIGFnYWluOlxuICAgIHN0YXRlLmRvbmVFeGVjID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgc3RhdGUuZG9uZUV4ZWMgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iXX0=
