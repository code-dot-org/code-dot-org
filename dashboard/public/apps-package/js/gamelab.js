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
var AppView = require('../templates/AppView.jsx');

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

  React.render(React.createElement(AppView, {
    renderCodeApp: (function () {
      return page({
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
    }).bind(this),
    onMount: (function () {
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
    }).bind(this)
  }), document.getElementById(config.containerId));
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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsDebuggerUi":"/home/ubuntu/staging/apps/build/js/JsDebuggerUi.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../assetManagement/assetPrefix":"/home/ubuntu/staging/apps/build/js/assetManagement/assetPrefix.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./GameLabP5":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabP5.js","./GameLabSprite":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabSprite.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs":[function(require,module,exports){
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
    // Not done, unless we're on the last item in __others:
    state.doneExec = state.__i >= state.__others.length - 1;
  } else {
    state.doneExec = true;
  }

  return result;
};

},{}]},{},["/home/ubuntu/staging/apps/build/js/gamelab/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9HYW1lTGFiUDUuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWJTcHJpdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNyQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FB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QUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQ3ZJLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ2hILEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDeEYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3pJLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekgsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN0RyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUNwRixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUM1QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDbEYsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN4RCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3pELEVB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SCxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFO0FBQzNILEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRTtBQUM1SCxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFO0FBQzNILEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzFGLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFOzs7Ozs7O0FBTzFGLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDN0QsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNwRCxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3hELEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFB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LEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDeEYsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3pGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDekYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN6RixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakcsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUM5RixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQ3BGLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNwRyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUNoRixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3ZGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDekYsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDckgsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN4SCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3RGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDMUYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDcEgsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN0RixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakcsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ2pKLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUM5RixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDL0YsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDckgsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdB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TUFBTSxDQUFDLE1BQU0sRUFBRSxFQUMzQixFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQzlCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQzlCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQzVCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQ2hDLENBQUM7Q0FDSCxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBWTs7QUFFdEQsTUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOzs7QUFHbEIsT0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ3hCLFlBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0dBQzdDOztBQUVELFVBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDOztBQUUxQyxVQUFRLENBQUMsRUFBRSxHQUFHLENBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxN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QUFRLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNsRCxNQUVEOztBQUVFLHNCQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLEdBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxDQUFDOztBQUU3SCxzQkFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxHQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUssSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBLEFBQUMsQ0FBQzs7QUFFN0gsc0JBQUksUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLENBQUM7O0FBRTVILHNCQUFJLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQSxBQUFDLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxDQUFDO2lCQUM3SDs7Ozs7Ozs7O0FBU0Qsb0JBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUMxQzs7QUFHRSxzQkFBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ2xCO0FBQ0Usd0JBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO21CQUU3Qzs7QUFFRCxzQkFBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQ2pCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUVqRDs7QUFFRCxvQkFBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQzFDOztBQUVFLHNCQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRTlDLHNCQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7aUJBQ2pEO2VBQ0Y7Ozs7QUFJRCxrQkFBRyxRQUFRLElBQUksU0FBUyxJQUFJLE9BQU8sUUFBUSxJQUFJLFVBQVUsRUFDdkQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxvQkFBTSxHQUFHLElBQUksQ0FBQzthQUNmO1dBSUYsTUFDSSxJQUFHLElBQUksSUFBRSxVQUFVLEVBQUc7Ozs7QUFJekIsZ0JBQUcsSUFBSSxDQUFDLFFBQVEsWUFBWSxjQUFjLEVBQ3hDLFlBQVksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FFOUQsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFHdkQsZ0JBQUcsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUssWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQzVDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FFakI7QUFDRSxtQkFBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWpDLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDNUIsa0JBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUM3QixrQkFBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzlCLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7O0FBRTNCLGtCQUFHLFFBQVEsSUFBSSxTQUFTLElBQUksT0FBTyxRQUFRLElBQUksVUFBVSxFQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRW5DLG9CQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Y7V0FDRjtTQUNGO09BQ0Y7O0FBRUQsU0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDO0dBQzNELE1BQU07QUFDTCxTQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztHQUN2Qjs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5nYW1lbGFiTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGdhbWVsYWIgPSBuZXcgR2FtZUxhYigpO1xuXG4gIGdhbWVsYWIuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oZ2FtZWxhYiwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQ0RPIEFwcDogR2FtZUxhYlxuICpcbiAqIENvcHlyaWdodCAyMDE2IENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmdhbWVsYWJfZm9vID0ge1xuICAgIC8vIEJsb2NrIGZvciBmb28uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZvbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZvb1Rvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5nYW1lbGFiX2ZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBmb28uXG4gICAgcmV0dXJuICdHYW1lTGFiLmZvbygpO1xcbic7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaUphdmFzY3JpcHQgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQnKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKc0RlYnVnZ2VyVWkgPSByZXF1aXJlKCcuLi9Kc0RlYnVnZ2VyVWknKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xudmFyIEpzSW50ZXJwcmV0ZXJMb2dnZXIgPSByZXF1aXJlKCcuLi9Kc0ludGVycHJldGVyTG9nZ2VyJyk7XG52YXIgR2FtZUxhYlA1ID0gcmVxdWlyZSgnLi9HYW1lTGFiUDUnKTtcbnZhciBnYW1lTGFiU3ByaXRlID0gcmVxdWlyZSgnLi9HYW1lTGFiU3ByaXRlJyk7XG52YXIgYXNzZXRQcmVmaXggPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvYXNzZXRQcmVmaXgnKTtcbnZhciBBcHBWaWV3ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL0FwcFZpZXcuanN4Jyk7XG5cbnZhciBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0sgPSA1MDAwMDA7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEdhbWVMYWIgY2xhc3NcbiAqL1xudmFyIEdhbWVMYWIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2tpbiA9IG51bGw7XG4gIHRoaXMubGV2ZWwgPSBudWxsO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qKiBAdHlwZSB7U3R1ZGlvQXBwfSAqL1xuICB0aGlzLnN0dWRpb0FwcF8gPSBudWxsO1xuXG4gIC8qKiBAdHlwZSB7SlNJbnRlcnByZXRlcn0gKi9cbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcblxuICAvKiogQHByaXZhdGUge0pzSW50ZXJwcmV0ZXJMb2dnZXJ9ICovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8gPSBuZXcgSnNJbnRlcnByZXRlckxvZ2dlcih3aW5kb3cuY29uc29sZSk7XG5cbiAgLyoqIEB0eXBlIHtKc0RlYnVnZ2VyVWl9ICovXG4gIHRoaXMuZGVidWdnZXJfID0gbmV3IEpzRGVidWdnZXJVaSh0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzID0gZmFsc2U7XG4gIHRoaXMuZ2FtZUxhYlA1ID0gbmV3IEdhbWVMYWJQNSgpO1xuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcblxuICBkcm9wbGV0Q29uZmlnLmluamVjdEdhbWVMYWIodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWI7XG5cbi8qKlxuICogSW5qZWN0IHRoZSBzdHVkaW9BcHAgc2luZ2xldG9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG5HYW1lTGFiLmJhc2VQNWxvYWRJbWFnZSA9IG51bGw7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGlzIEdhbWVMYWIgaW5zdGFuY2UuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWVMYWIgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBjb25maWcudXNlc0Fzc2V0cyA9IHRydWU7XG5cbiAgdGhpcy5nYW1lTGFiUDUuaW5pdCh7XG4gICAgZ2FtZUxhYjogdGhpcyxcbiAgICBvbkV4ZWN1dGlvblN0YXJ0aW5nOiB0aGlzLm9uUDVFeGVjdXRpb25TdGFydGluZy5iaW5kKHRoaXMpLFxuICAgIG9uUHJlbG9hZDogdGhpcy5vblA1UHJlbG9hZC5iaW5kKHRoaXMpLFxuICAgIG9uU2V0dXA6IHRoaXMub25QNVNldHVwLmJpbmQodGhpcyksXG4gICAgb25EcmF3OiB0aGlzLm9uUDVEcmF3LmJpbmQodGhpcylcbiAgfSk7XG5cbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuICBjb25maWcuYXBwTXNnID0gbXNnO1xuXG4gIHZhciBzaG93RmluaXNoQnV0dG9uID0gIXRoaXMubGV2ZWwuaXNQcm9qZWN0TGV2ZWw7XG4gIHZhciBmaW5pc2hCdXR0b25GaXJzdExpbmUgPSBfLmlzRW1wdHkodGhpcy5sZXZlbC5zb2Z0QnV0dG9ucyk7XG4gIHZhciBhcmVCcmVha3BvaW50c0VuYWJsZWQgPSB0cnVlO1xuICB2YXIgZmlyc3RDb250cm9sc1JvdyA9IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246IGZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IHRoaXMuZGVidWdnZXJfLmdldE1hcmt1cCh0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsIHtcbiAgICBzaG93QnV0dG9uczogdHJ1ZSxcbiAgICBzaG93Q29uc29sZTogdHJ1ZVxuICB9KTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgcmVuZGVyQ29kZUFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHBhZ2Uoe1xuICAgICAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHRoaXMuc3R1ZGlvQXBwXy5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgICBjb250cm9sczogZmlyc3RDb250cm9sc1JvdyxcbiAgICAgICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgICAgIGJsb2NrVXNlZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgICAgIGJsb2NrQ291bnRlckNsYXNzIDogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICAgICAgcGluV29ya3NwYWNlVG9Cb3R0b206IHRydWUsXG4gICAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcyksXG4gICAgb25Nb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uZmlnLmxvYWRBdWRpbyA9IHRoaXMubG9hZEF1ZGlvXy5iaW5kKHRoaXMpO1xuICAgICAgY29uZmlnLmFmdGVySW5qZWN0ID0gdGhpcy5hZnRlckluamVjdF8uYmluZCh0aGlzLCBjb25maWcpO1xuICAgICAgY29uZmlnLmFmdGVyRWRpdG9yUmVhZHkgPSB0aGlzLmFmdGVyRWRpdG9yUmVhZHlfLmJpbmQodGhpcywgYXJlQnJlYWtwb2ludHNFbmFibGVkKTtcblxuICAgICAgLy8gU3RvcmUgcDVzcGVjaWFsRnVuY3Rpb25zIGluIHRoZSB1bnVzZWRDb25maWcgYXJyYXkgc28gd2UgZG9uJ3QgZ2l2ZSB3YXJuaW5nc1xuICAgICAgLy8gYWJvdXQgdGhlc2UgZnVuY3Rpb25zIG5vdCBiZWluZyBjYWxsZWQ6XG4gICAgICBjb25maWcudW51c2VkQ29uZmlnID0gdGhpcy5nYW1lTGFiUDUucDVzcGVjaWFsRnVuY3Rpb25zO1xuXG4gICAgICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xuXG4gICAgICB0aGlzLmRlYnVnZ2VyXy5pbml0aWFsaXplQWZ0ZXJEb21DcmVhdGVkKHtcbiAgICAgICAgZGVmYXVsdFN0ZXBTcGVlZDogMVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpXG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuY29udGFpbmVySWQpKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnR2FtZUxhYixjb2RlJyk7XG4gIH1cblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIGRpdkdhbWVMYWIuc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuICBkaXZHYW1lTGFiLnN0eWxlLmhlaWdodCA9ICc0MDBweCc7XG5cbn07XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gdG8gcnVuIGFmdGVyIGFjZS9kcm9wbGV0IGlzIGluaXRpYWxpemVkLlxuICogQHBhcmFtIHshYm9vbGVhbn0gYXJlQnJlYWtwb2ludHNFbmFibGVkXG4gKiBAcHJpdmF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckVkaXRvclJlYWR5XyA9IGZ1bmN0aW9uIChhcmVCcmVha3BvaW50c0VuYWJsZWQpIHtcbiAgaWYgKGFyZUJyZWFrcG9pbnRzRW5hYmxlZCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5lbmFibGVCcmVha3BvaW50cygpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGlja0ludGVydmFsSWQpO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgd2hpbGUgKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCkge1xuICAgIGRpdkdhbWVMYWIucmVtb3ZlQ2hpbGQoZGl2R2FtZUxhYi5maXJzdENoaWxkKTtcbiAgfVxuICAqL1xuXG4gIHRoaXMuZ2FtZUxhYlA1LnJlc2V0RXhlY3V0aW9uKCk7XG4gIFxuICAvLyBJbXBvcnQgdG8gcmVzZXQgdGhlc2UgYWZ0ZXIgdGhpcy5nYW1lTGFiUDUgaGFzIGJlZW4gcmVzZXRcbiAgdGhpcy5kcmF3SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB0aGlzLnNldHVwSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB0aGlzLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyA9IGZhbHNlO1xuXG4gIHRoaXMuZGVidWdnZXJfLmRldGFjaCgpO1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmRldGFjaCgpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmV2YWxDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgR2FtZUxhYjogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEluZmluaXR5IGlzIHRocm93biBpZiB3ZSBkZXRlY3QgYW4gaW5maW5pdGUgbG9vcC4gSW4gdGhhdCBjYXNlIHdlJ2xsXG4gICAgLy8gc3RvcCBmdXJ0aGVyIGV4ZWN1dGlvbiwgYW5pbWF0ZSB3aGF0IG9jY3VyZWQgYmVmb3JlIHRoZSBpbmZpbml0ZSBsb29wLFxuICAgIC8vIGFuZCBhbmFseXplIHN1Y2Nlc3MvZmFpbHVyZSBiYXNlZCBvbiB3aGF0IHdhcyBkcmF3bi5cbiAgICAvLyBPdGhlcndpc2UsIGFibm9ybWFsIHRlcm1pbmF0aW9uIGlzIGEgdXNlciBlcnJvci5cbiAgICBpZiAoZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAgIC8vIFVzZXJDb2RlIHNvIHRoYXQgaXQncyBjbGVhciB0aGlzIGlzIGluIGV2YWwnZWQgY29kZS5cbiAgICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgICAgfVxuICAgICAgd2luZG93LmFsZXJ0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gUmVzZXQgYWxsIHN0YXRlLlxuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQoKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkgJiZcbiAgICAgICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgICB0aGlzLnN0dWRpb0FwcF8uaGFzRHVwbGljYXRlVmFyaWFibGVzSW5Gb3JMb29wcygpKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmdhbWVMYWJQNS5zdGFydEV4ZWN1dGlvbigpO1xuXG4gIGlmICghdGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIC8vIFNldCB0byAxbXMgaW50ZXJ2YWwsIGJ1dCBub3RlIHRoYXQgYnJvd3NlciBtaW5pbXVtcyBhcmUgYWN0dWFsbHkgNS0xNm1zOlxuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKF8uYmluZCh0aGlzLm9uVGljaywgdGhpcyksIDEpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaW5pdEludGVycHJldGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgbWF4SW50ZXJwcmV0ZXJTdGVwc1BlclRpY2s6IE1BWF9JTlRFUlBSRVRFUl9TVEVQU19QRVJfVElDSyxcbiAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczogdGhpcy5nYW1lTGFiUDUuZ2V0Q3VzdG9tTWFyc2hhbEdsb2JhbFByb3BlcnRpZXMoKVxuICB9KTtcbiAgdGhpcy5KU0ludGVycHJldGVyLm9uRXhlY3V0aW9uRXJyb3IucmVnaXN0ZXIodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5hdHRhY2hUbyh0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuICB0aGlzLmRlYnVnZ2VyXy5hdHRhY2hUbyh0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuICB0aGlzLkpTSW50ZXJwcmV0ZXIucGFyc2Uoe1xuICAgIGNvZGU6IHRoaXMuc3R1ZGlvQXBwXy5nZXRDb2RlKCksXG4gICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICBibG9ja0ZpbHRlcjogdGhpcy5sZXZlbC5leGVjdXRlUGFsZXR0ZUFwaXNPbmx5ICYmIHRoaXMubGV2ZWwuY29kZUZ1bmN0aW9ucyxcbiAgICBlbmFibGVFdmVudHM6IHRydWVcbiAgfSk7XG4gIGlmICghdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBnYW1lTGFiU3ByaXRlLmluamVjdEpTSW50ZXJwcmV0ZXIodGhpcy5KU0ludGVycHJldGVyKTtcblxuICB0aGlzLmdhbWVMYWJQNS5wNXNwZWNpYWxGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgdmFyIGZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKGV2ZW50TmFtZSk7XG4gICAgaWYgKGZ1bmMpIHtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdID1cbiAgICAgICAgICBjb2RlZ2VuLmNyZWF0ZU5hdGl2ZUZ1bmN0aW9uRnJvbUludGVycHJldGVyRnVuY3Rpb24oZnVuYyk7XG4gICAgfVxuICB9LCB0aGlzKTtcblxuICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gdGhpcy5nYW1lTGFiUDUuZ2V0Q3VzdG9tTWFyc2hhbE9iamVjdExpc3QoKTtcblxuICB2YXIgcHJvcExpc3QgPSB0aGlzLmdhbWVMYWJQNS5nZXRHbG9iYWxQcm9wZXJ0eUxpc3QoKTtcbiAgZm9yICh2YXIgcHJvcCBpbiBwcm9wTGlzdCkge1xuICAgIC8vIEVhY2ggZW50cnkgaW4gdGhlIHByb3BMaXN0IGlzIGFuIGFycmF5IHdpdGggMiBlbGVtZW50czpcbiAgICAvLyBwcm9wTGlzdEl0ZW1bMF0gLSBhIG5hdGl2ZSBwcm9wZXJ0eSB2YWx1ZVxuICAgIC8vIHByb3BMaXN0SXRlbVsxXSAtIHRoZSBwcm9wZXJ0eSdzIHBhcmVudCBvYmplY3RcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoXG4gICAgICAgIHByb3AsXG4gICAgICAgIHByb3BMaXN0W3Byb3BdWzBdLFxuICAgICAgICBwcm9wTGlzdFtwcm9wXVsxXSk7XG4gIH1cblxuICAvKlxuICBpZiAodGhpcy5jaGVja0ZvckVkaXRDb2RlUHJlRXhlY3V0aW9uRmFpbHVyZSgpKSB7XG4gICByZXR1cm4gdGhpcy5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiAgKi9cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLm9uVGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy50aWNrQ291bnQrKztcblxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmV4ZWN1dGVJbnRlcnByZXRlcigpO1xuXG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuc3RhcnRlZEhhbmRsaW5nRXZlbnRzKSB7XG4gICAgICAvLyBDYWxsIHRoaXMgb25jZSBhZnRlciB3ZSd2ZSBzdGFydGVkIGhhbmRsaW5nIGV2ZW50c1xuICAgICAgdGhpcy5zdGFydGVkSGFuZGxpbmdFdmVudHMgPSB0cnVlO1xuICAgICAgdGhpcy5nYW1lTGFiUDUubm90aWZ5VXNlckdsb2JhbENvZGVDb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcGxldGVTZXR1cElmU2V0dXBDb21wbGV0ZSgpO1xuICAgIHRoaXMuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgY2FsbGVkIHdoaWxlIHRoaXMuZ2FtZUxhYlA1IGlzIGluIHN0YXJ0RXhlY3V0aW9uKCkuIFdlIHVzZSB0aGVcbiAqIG9wcG9ydHVuaXR5IHRvIGNyZWF0ZSBuYXRpdmUgZXZlbnQgaGFuZGxlcnMgdGhhdCBjYWxsIGRvd24gaW50byBpbnRlcnByZXRlclxuICogY29kZSBmb3IgZWFjaCBldmVudCBuYW1lLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1RXhlY3V0aW9uU3RhcnRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZ2FtZUxhYlA1LnA1ZXZlbnROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICB3aW5kb3dbZXZlbnROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0uYXBwbHkobnVsbCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuICB9LCB0aGlzKTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gdGhlIHByZWxvYWQgcGhhc2UuIFdlIGluaXRpYWxpemVcbiAqIHRoZSBpbnRlcnByZXRlciwgc3RhcnQgaXRzIGV4ZWN1dGlvbiwgYW5kIGNhbGwgdGhlIHVzZXIncyBwcmVsb2FkIGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1UHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5pbml0SW50ZXJwcmV0ZXIoKTtcbiAgLy8gQW5kIGV4ZWN1dGUgdGhlIGludGVycHJldGVyIGZvciB0aGUgZmlyc3QgdGltZTpcbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIodHJ1ZSk7XG5cbiAgICAvLyBJbiBhZGRpdGlvbiwgZXhlY3V0ZSB0aGUgZ2xvYmFsIGZ1bmN0aW9uIGNhbGxlZCBwcmVsb2FkKClcbiAgICBpZiAodGhpcy5ldmVudEhhbmRsZXJzLnByZWxvYWQpIHtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wcmVsb2FkLmFwcGx5KG51bGwpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCB3aGlsZSB0aGlzLmdhbWVMYWJQNSBpcyBpbiB0aGUgc2V0dXAgcGhhc2UuIFdlIHJlc3RvcmUgdGhlXG4gKiBpbnRlcnByZXRlciBtZXRob2RzIHRoYXQgd2VyZSBtb2RpZmllZCBkdXJpbmcgcHJlbG9hZCwgdGhlbiBjYWxsIHRoZSB1c2VyJ3NcbiAqIHNldHVwIGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1U2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICAvLyBUT0RPOiAoY3BpcmljaCkgUmVtb3ZlIHRoaXMgY29kZSBvbmNlIHA1cGxheSBzdXBwb3J0cyBpbnN0YW5jZSBtb2RlOlxuXG4gICAgLy8gUmVwbGFjZSByZXN0b3JlZCBwcmVsb2FkIG1ldGhvZHMgZm9yIHRoZSBpbnRlcnByZXRlcjpcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5nYW1lTGFiUDUucDUuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoXG4gICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgIHRoaXMuZ2FtZUxhYlA1LnA1W21ldGhvZF0sXG4gICAgICAgICAgdGhpcy5nYW1lTGFiUDUucDUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmV2ZW50SGFuZGxlcnMuc2V0dXApIHtcbiAgICAgIHRoaXMuc2V0dXBJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zZXR1cC5hcHBseShudWxsKTtcbiAgICB9XG4gICAgdGhpcy5jb21wbGV0ZVNldHVwSWZTZXR1cENvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmNvbXBsZXRlU2V0dXBJZlNldHVwQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnNldHVwSW5Qcm9ncmVzcyAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuc2VlblJldHVybkZyb21DYWxsYmFja0R1cmluZ0V4ZWN1dGlvbikge1xuICAgIHRoaXMuZ2FtZUxhYlA1LmFmdGVyU2V0dXBDb21wbGV0ZSgpO1xuICAgIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gYSBkcmF3KCkgY2FsbC4gV2UgY2FsbCB0aGUgdXNlcidzXG4gKiBkcmF3IGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1RHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdykge1xuICAgIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5kcmF3LmFwcGx5KG51bGwpO1xuICB9XG4gIHRoaXMuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSgpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZHJhd0luUHJvZ3Jlc3MgJiYgdGhpcy5KU0ludGVycHJldGVyLnNlZW5SZXR1cm5Gcm9tQ2FsbGJhY2tEdXJpbmdFeGVjdXRpb24pIHtcbiAgICB0aGlzLmdhbWVMYWJQNS5hZnRlckRyYXdDb21wbGV0ZSgpO1xuICAgIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAkKCcjYnViYmxlJykudGV4dCgnRlBTOiAnICsgdGhpcy5nYW1lTGFiUDUuZ2V0RnJhbWVSYXRlKCkudG9GaXhlZCgwKSk7XG4gIH1cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmhhbmRsZUV4ZWN1dGlvbkVycm9yID0gZnVuY3Rpb24gKGVyciwgbGluZU51bWJlcikge1xuLypcbiAgb3V0cHV0RXJyb3IoU3RyaW5nKGVyciksIEVycm9yTGV2ZWwuRVJST1IsIGxpbmVOdW1iZXIpO1xuICBTdHVkaW8uZXhlY3V0aW9uRXJyb3IgPSB7IGVycjogZXJyLCBsaW5lTnVtYmVyOiBsaW5lTnVtYmVyIH07XG5cbiAgLy8gQ2FsbCBvblB1enpsZUNvbXBsZXRlKCkgaWYgc3ludGF4IGVycm9yIG9yIGFueSB0aW1lIHdlJ3JlIG5vdCBvbiBhIGZyZWVwbGF5IGxldmVsOlxuICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBNYXJrIHByZUV4ZWN1dGlvbkZhaWx1cmUgYW5kIHRlc3RSZXN1bHRzIGltbWVkaWF0ZWx5IHNvIHRoYXQgYW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlIGFsd2F5cyBhcHBlYXJzLCBldmVuIG9uIGZyZWVwbGF5OlxuICAgIFN0dWRpby5wcmVFeGVjdXRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICBTdHVkaW8udGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5TWU5UQVhfRVJST1JfRkFJTDtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9IGVsc2UgaWYgKCFsZXZlbC5mcmVlUGxheSkge1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8ubG9nKGVycik7XG4gIHRocm93IGVycjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQVBJIGNvbW1hbmQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGVDbWQgPSBmdW5jdGlvbiAoaWQsIG5hbWUsIG9wdHMpIHtcbiAgY29uc29sZS5sb2coXCJHYW1lTGFiIGV4ZWN1dGVDbWQgXCIgKyBuYW1lKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YXNrcyB0byBiZSBkb25lIGFmdGVyIHRoZSB1c2VyIHByb2dyYW0gaXMgZmluaXNoZWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIC8vIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSAvKiB8fCBsZXZlbC5pbXByZXNzaXZlICovKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIC8vIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBtc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IG1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IGxldmVsLmZyZWVQbGF5ICYmICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgLy8gc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwiZGl2R2FtZUxhYlwiIHRhYmluZGV4PVwiMVwiPlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB0YiA9IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveDtcbnZhciBibG9ja09mVHlwZSA9IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGU7XG52YXIgY3JlYXRlQ2F0ZWdvcnkgPSBibG9ja1V0aWxzLmNyZWF0ZUNhdGVnb3J5O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxldmVscy5zYW5kYm94ID0gIHtcbiAgaWRlYWw6IEluZmluaXR5LFxuICByZXF1aXJlZEJsb2NrczogW1xuICBdLFxuICBzY2FsZToge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICBzb2Z0QnV0dG9uczogW1xuICAgICdsZWZ0QnV0dG9uJyxcbiAgICAncmlnaHRCdXR0b24nLFxuICAgICdkb3duQnV0dG9uJyxcbiAgICAndXBCdXR0b24nXG4gIF0sXG4gIGZyZWVQbGF5OiB0cnVlLFxuICB0b29sYm94OlxuICAgIHRiKGJsb2NrT2ZUeXBlKCdnYW1lbGFiX2ZvbycpKSxcbiAgc3RhcnRCbG9ja3M6XG4gICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nXG59O1xuXG4vLyBCYXNlIGNvbmZpZyBmb3IgbGV2ZWxzIGNyZWF0ZWQgdmlhIGxldmVsYnVpbGRlclxubGV2ZWxzLmN1c3RvbSA9IHV0aWxzLmV4dGVuZChsZXZlbHMuc2FuZGJveCwge1xuICBlZGl0Q29kZTogdHJ1ZSxcbiAgY29kZUZ1bmN0aW9uczoge1xuICAgIC8vIEdhbWUgTGFiXG4gICAgXCJ2YXJfbG9hZEltYWdlXCI6IG51bGwsXG4gICAgXCJpbWFnZVwiOiBudWxsLFxuICAgIFwiZmlsbFwiOiBudWxsLFxuICAgIFwibm9GaWxsXCI6IG51bGwsXG4gICAgXCJzdHJva2VcIjogbnVsbCxcbiAgICBcIm5vU3Ryb2tlXCI6IG51bGwsXG4gICAgXCJhcmNcIjogbnVsbCxcbiAgICBcImVsbGlwc2VcIjogbnVsbCxcbiAgICBcImxpbmVcIjogbnVsbCxcbiAgICBcInBvaW50XCI6IG51bGwsXG4gICAgXCJyZWN0XCI6IG51bGwsXG4gICAgXCJ0cmlhbmdsZVwiOiBudWxsLFxuICAgIFwidGV4dFwiOiBudWxsLFxuICAgIFwidGV4dEFsaWduXCI6IG51bGwsXG4gICAgXCJ0ZXh0U2l6ZVwiOiBudWxsLFxuICAgIFwiZHJhd1Nwcml0ZXNcIjogbnVsbCxcbiAgICBcImFsbFNwcml0ZXNcIjogbnVsbCxcbiAgICBcImJhY2tncm91bmRcIjogbnVsbCxcbiAgICBcIndpZHRoXCI6IG51bGwsXG4gICAgXCJoZWlnaHRcIjogbnVsbCxcbiAgICBcImNhbWVyYVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm9uXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub2ZmXCI6IG51bGwsXG4gICAgXCJjYW1lcmEuYWN0aXZlXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VYXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VZXCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnBvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcImNhbWVyYS56b29tXCI6IG51bGwsXG5cbiAgICAvLyBTcHJpdGVzXG4gICAgXCJ2YXJfY3JlYXRlU3ByaXRlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5nZXRBbmltYXRpb25MYWJlbFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldERpcmVjdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkSW1hZ2VcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZFRvR3JvdXBcIjogbnVsbCxcbiAgICBcInNwcml0ZS5ib3VuY2VcIjogbnVsbCxcbiAgICBcInNwcml0ZS5jb2xsaWRlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZGlzcGxhY2VcIjogbnVsbCxcbiAgICBcInNwcml0ZS5vdmVybGFwXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuY2hhbmdlQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuY2hhbmdlSW1hZ2VcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hdHRyYWN0aW9uUG9pbnRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5saW1pdFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2V0Q29sbGlkZXJcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRWZWxvY2l0eVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmhlaWdodFwiOiBudWxsLFxuICAgIFwic3ByaXRlLndpZHRoXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZGVwdGhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5mcmljdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLmltbW92YWJsZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmxpZmVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5tYXNzXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubWF4U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucG9zaXRpb24ueVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJlbW92ZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZXN0aXR1dGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0ZVRvRGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGlvblNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuc2NhbGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zaGFwZUNvbG9yXCI6IG51bGwsXG4gICAgXCJzcHJpdGUudG91Y2hpbmdcIjogbnVsbCxcbiAgICBcInNwcml0ZS52ZWxvY2l0eS54XCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmVsb2NpdHkueVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnZpc2libGVcIjogbnVsbCxcblxuICAgIC8vIEFuaW1hdGlvbnNcbiAgICBcInZhcl9sb2FkQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhbmltYXRpb25cIjogbnVsbCxcbiAgICBcImFuaW0uY2hhbmdlRnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ubmV4dEZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLnByZXZpb3VzRnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0uY2xvbmVcIjogbnVsbCxcbiAgICBcImFuaW0uZ2V0RnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0uZ2V0TGFzdEZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLmdvVG9GcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5wbGF5XCI6IG51bGwsXG4gICAgXCJhbmltLnJld2luZFwiOiBudWxsLFxuICAgIFwiYW5pbS5zdG9wXCI6IG51bGwsXG4gICAgXCJhbmltLmZyYW1lQ2hhbmdlZFwiOiBudWxsLFxuICAgIFwiYW5pbS5mcmFtZURlbGF5XCI6IG51bGwsXG4gICAgXCJhbmltLmltYWdlc1wiOiBudWxsLFxuICAgIFwiYW5pbS5sb29waW5nXCI6IG51bGwsXG4gICAgXCJhbmltLnBsYXlpbmdcIjogbnVsbCxcbiAgICBcImFuaW0udmlzaWJsZVwiOiBudWxsLFxuXG4gICAgLy8gR3JvdXBzXG4gICAgXCJHcm91cFwiOiBudWxsLFxuICAgIFwiZ3JvdXAuYWRkXCI6IG51bGwsXG4gICAgXCJncm91cC5yZW1vdmVcIjogbnVsbCxcbiAgICBcImdyb3VwLmNsZWFyXCI6IG51bGwsXG4gICAgXCJncm91cC5jb250YWluc1wiOiBudWxsLFxuICAgIFwiZ3JvdXAuZ2V0XCI6IG51bGwsXG4gICAgXCJncm91cC5ib3VuY2VcIjogbnVsbCxcbiAgICBcImdyb3VwLmNvbGxpZGVcIjogbnVsbCxcbiAgICBcImdyb3VwLmRpc3BsYWNlXCI6IG51bGwsXG4gICAgXCJncm91cC5vdmVybGFwXCI6IG51bGwsXG4gICAgXCJncm91cC5tYXhEZXB0aFwiOiBudWxsLFxuICAgIFwiZ3JvdXAubWluRGVwdGhcIjogbnVsbCxcblxuICAgIC8vIEV2ZW50c1xuICAgIFwia2V5SXNQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlcIjogbnVsbCxcbiAgICBcImtleUNvZGVcIjogbnVsbCxcbiAgICBcImtleVByZXNzZWRcIjogbnVsbCxcbiAgICBcImtleVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJrZXlUeXBlZFwiOiBudWxsLFxuICAgIFwia2V5RG93blwiOiBudWxsLFxuICAgIFwia2V5V2VudERvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnRVcFwiOiBudWxsLFxuICAgIFwibW91c2VYXCI6IG51bGwsXG4gICAgXCJtb3VzZVlcIjogbnVsbCxcbiAgICBcInBtb3VzZVhcIjogbnVsbCxcbiAgICBcInBtb3VzZVlcIjogbnVsbCxcbiAgICBcIm1vdXNlQnV0dG9uXCI6IG51bGwsXG4gICAgXCJtb3VzZUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwibW91c2VNb3ZlZFwiOiBudWxsLFxuICAgIFwibW91c2VEcmFnZ2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlUmVsZWFzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlQ2xpY2tlZFwiOiBudWxsLFxuICAgIFwibW91c2VXaGVlbFwiOiBudWxsLFxuXG4gICAgLy8gQ29udHJvbFxuICAgIFwiZm9yTG9vcF9pXzBfNFwiOiBudWxsLFxuICAgIFwiaWZCbG9ja1wiOiBudWxsLFxuICAgIFwiaWZFbHNlQmxvY2tcIjogbnVsbCxcbiAgICBcIndoaWxlQmxvY2tcIjogbnVsbCxcblxuICAgIC8vIE1hdGhcbiAgICBcImFkZE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJzdWJ0cmFjdE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJtdWx0aXBseU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJkaXZpZGVPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiaW5lcXVhbGl0eU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJncmVhdGVyVGhhbk9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJncmVhdGVyVGhhbk9yRXF1YWxPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibGVzc1RoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwibGVzc1RoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImFuZE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJvck9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJub3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwicmFuZG9tTnVtYmVyX21pbl9tYXhcIjogbnVsbCxcbiAgICBcIm1hdGhSb3VuZFwiOiBudWxsLFxuICAgIFwibWF0aEFic1wiOiBudWxsLFxuICAgIFwibWF0aE1heFwiOiBudWxsLFxuICAgIFwibWF0aE1pblwiOiBudWxsLFxuICAgIFwibWF0aFJhbmRvbVwiOiBudWxsLFxuXG4gICAgLy8gVmFyaWFibGVzXG4gICAgXCJkZWNsYXJlQXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVOb0Fzc2lnbl94XCI6IG51bGwsXG4gICAgXCJhc3NpZ25feFwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9zdHJfaGVsbG9fd29ybGRcIjogbnVsbCxcbiAgICBcInN1YnN0cmluZ1wiOiBudWxsLFxuICAgIFwiaW5kZXhPZlwiOiBudWxsLFxuICAgIFwiaW5jbHVkZXNcIjogbnVsbCxcbiAgICBcImxlbmd0aFwiOiBudWxsLFxuICAgIFwidG9VcHBlckNhc2VcIjogbnVsbCxcbiAgICBcInRvTG93ZXJDYXNlXCI6IG51bGwsXG4gICAgXCJkZWNsYXJlQXNzaWduX2xpc3RfYWJkXCI6IG51bGwsXG4gICAgXCJsaXN0TGVuZ3RoXCI6IG51bGwsXG5cbiAgICAvLyBGdW5jdGlvbnNcbiAgICBcImZ1bmN0aW9uUGFyYW1zX25vbmVcIjogbnVsbCxcbiAgICBcImZ1bmN0aW9uUGFyYW1zX25cIjogbnVsbCxcbiAgICBcImNhbGxNeUZ1bmN0aW9uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvbl9uXCI6IG51bGwsXG4gICAgXCJyZXR1cm5cIjogbnVsbCxcbiAgfSxcbiAgc3RhcnRCbG9ja3M6IFtcbiAgICAnZnVuY3Rpb24gc2V0dXAoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnZnVuY3Rpb24gZHJhdygpIHsnLFxuICAgICcgICcsXG4gICAgJ30nLFxuICAgICcnXS5qb2luKCdcXG4nKSxcbn0pO1xuXG5sZXZlbHMuZWNfc2FuZGJveCA9IHV0aWxzLmV4dGVuZChsZXZlbHMuY3VzdG9tLCB7XG59KTtcblxuIiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0LmpzJyk7XG52YXIgc2hvd0Fzc2V0TWFuYWdlciA9IHJlcXVpcmUoJy4uL2Fzc2V0TWFuYWdlbWVudC9zaG93Jyk7XG52YXIgZ2V0QXNzZXREcm9wZG93biA9IHJlcXVpcmUoJy4uL2Fzc2V0TWFuYWdlbWVudC9nZXRBc3NldERyb3Bkb3duJyk7XG5cbnZhciBDT0xPUl9MSUdIVF9HUkVFTiA9ICcjRDNFOTY1JztcbnZhciBDT0xPUl9CTFVFID0gJyMxOUMzRTEnO1xudmFyIENPTE9SX1JFRCA9ICcjRjc4MTgzJztcbnZhciBDT0xPUl9DWUFOID0gJyM0REQwRTEnO1xudmFyIENPTE9SX1lFTExPVyA9ICcjRkZGMTc2JztcbnZhciBDT0xPUl9QSU5LID0gJyNGNTdBQzYnO1xudmFyIENPTE9SX1BVUlBMRSA9ICcjQkI3N0M3JztcbnZhciBDT0xPUl9HUkVFTiA9ICcjNjhEOTk1JztcbnZhciBDT0xPUl9XSElURSA9ICcjRkZGRkZGJztcbnZhciBDT0xPUl9CTFVFID0gJyM2NEI1RjYnO1xudmFyIENPTE9SX09SQU5HRSA9ICcjRkZCNzREJztcblxudmFyIEdhbWVMYWI7XG5cbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuLy8gRmxpcCB0aGUgYXJndW1lbnQgb3JkZXIgc28gd2UgY2FuIGJpbmQgYHR5cGVGaWx0ZXJgLlxuZnVuY3Rpb24gY2hvb3NlQXNzZXQodHlwZUZpbHRlciwgY2FsbGJhY2spIHtcbiAgc2hvd0Fzc2V0TWFuYWdlcihjYWxsYmFjaywgdHlwZUZpbHRlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLmJsb2NrcyA9IFtcbiAgLy8gR2FtZSBMYWJcbiAge2Z1bmM6ICdsb2FkSW1hZ2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd1cmwnXSwgcGFyYW1zOiBbJ1wiaHR0cHM6Ly9jb2RlLm9yZy9pbWFnZXMvbG9nby5wbmdcIiddLCB0eXBlOiAnZWl0aGVyJywgZHJvcGRvd246IHsgMDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZ2V0QXNzZXREcm9wZG93bignaW1hZ2UnKTsgfSB9LCBhc3NldFRvb2x0aXA6IHsgMDogY2hvb3NlQXNzZXQuYmluZChudWxsLCAnaW1hZ2UnKSB9IH0sXG4gIHtmdW5jOiAndmFyX2xvYWRJbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBibG9ja1ByZWZpeDogJ3ZhciBpbWcgPSBsb2FkSW1hZ2UnLCBwYWxldHRlUGFyYW1zOiBbJ3VybCddLCBwYXJhbXM6IFsnXCJodHRwczovL2NvZGUub3JnL2ltYWdlcy9sb2dvLnBuZ1wiJ10sIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sXG4gIHtmdW5jOiAnaW1hZ2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydpbWFnZScsJ3NyY1gnLCdzcmNZJywnc3JjVycsJ3NyY0gnLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiaW1nXCIsIFwiMFwiLCBcIjBcIiwgXCJpbWcud2lkdGhcIiwgXCJpbWcuaGVpZ2h0XCIsIFwiMFwiLCBcIjBcIiwgXCJpbWcud2lkdGhcIiwgXCJpbWcuaGVpZ2h0XCJdIH0sXG4gIHtmdW5jOiAnZmlsbCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ3llbGxvdydcIl0gfSxcbiAge2Z1bmM6ICdub0ZpbGwnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ3N0cm9rZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ2JsdWUnXCJdIH0sXG4gIHtmdW5jOiAnbm9TdHJva2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2FyYycsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnLCdzdGFydCcsJ3N0b3AnXSwgcGFyYW1zOiBbXCIwXCIsIFwiMFwiLCBcIjgwMFwiLCBcIjgwMFwiLCBcIjBcIiwgXCJIQUxGX1BJXCJdIH0sXG4gIHtmdW5jOiAnZWxsaXBzZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICdsaW5lJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneDEnLCd5MScsJ3gyJywneTInXSwgcGFyYW1zOiBbXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ3BvaW50JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIl0gfSxcbiAge2Z1bmM6ICdyZWN0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIjEwMFwiLCBcIjEwMFwiLCBcIjIwMFwiLCBcIjIwMFwiXSB9LFxuICB7ZnVuYzogJ3RyaWFuZ2xlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneDEnLCd5MScsJ3gyJywneTInLCd4MycsJ3kzJ10sIHBhcmFtczogW1wiMjAwXCIsIFwiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnc3RyJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIid0ZXh0J1wiLCBcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiMTAwXCJdIH0sXG4gIHtmdW5jOiAndGV4dEFsaWduJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnaG9yaXonLCd2ZXJ0J10sIHBhcmFtczogW1wiQ0VOVEVSXCIsIFwiVE9QXCJdIH0sXG4gIHtmdW5jOiAndGV4dFNpemUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydwaXhlbHMnXSwgcGFyYW1zOiBbXCIxMlwiXSB9LFxuICB7ZnVuYzogJ2RyYXdTcHJpdGVzJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdhbGxTcHJpdGVzJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIGJsb2NrOiAnYWxsU3ByaXRlcycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdiYWNrZ3JvdW5kJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCInYmxhY2snXCJdIH0sXG4gIHtmdW5jOiAnd2lkdGgnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2hlaWdodCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEub24nLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5vZmYnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5hY3RpdmUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5tb3VzZVgnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5tb3VzZVknLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5wb3NpdGlvbi54JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEucG9zaXRpb24ueScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnpvb20nLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuXG4gIC8vIFNwcml0ZXNcbiAge2Z1bmM6ICdjcmVhdGVTcHJpdGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5Jywnd2lkdGgnLCdoZWlnaHQnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIiwgXCIzMFwiLCBcIjMwXCJdLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Zhcl9jcmVhdGVTcHJpdGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBibG9ja1ByZWZpeDogJ3ZhciBzcHJpdGUgPSBjcmVhdGVTcHJpdGUnLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5Jywnd2lkdGgnLCdoZWlnaHQnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIyMDBcIiwgXCIzMFwiLCBcIjMwXCJdLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXRBbmltYXRpb25MYWJlbCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRBbmltYXRpb25MYWJlbCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZ2V0RGlyZWN0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldERpcmVjdGlvbicsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZ2V0U3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0U3BlZWQnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlbW92ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFkZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnLCdhbmltYXRpb24nXSwgcGFyYW1zOiBbJ1wiYW5pbTFcIicsIFwiYW5pbVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZEFuaW1hdGlvbicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkSW1hZ2UnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJywnaW1hZ2UnXSwgcGFyYW1zOiBbJ1wiaW1nMVwiJywgXCJpbWdcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRJbWFnZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkU3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywnYW5nbGUnXSwgcGFyYW1zOiBbXCIxXCIsIFwiOTBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkVG9Hcm91cCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnZ3JvdXAnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZFRvR3JvdXAnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmJvdW5jZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5ib3VuY2UnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5jb2xsaWRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNvbGxpZGUnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5kaXNwbGFjZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5kaXNwbGFjZScsIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLm92ZXJsYXAnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyoub3ZlcmxhcCcsIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNoYW5nZUFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnXSwgcGFyYW1zOiBbJ1wiYW5pbTFcIiddLCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5jaGFuZ2VJbWFnZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnXSwgcGFyYW1zOiBbJ1wiaW1nMVwiJ10sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VJbWFnZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYXR0cmFjdGlvblBvaW50JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjIwMFwiLCBcIjIwMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmF0dHJhY3Rpb25Qb2ludCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUubGltaXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbWF4J10sIHBhcmFtczogW1wiM1wiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmxpbWl0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldENvbGxpZGVyJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0eXBlJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFsnXCJyZWN0YW5nbGVcIicsIFwiMFwiLCBcIjBcIiwgXCIyMFwiLCBcIjIwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0Q29sbGlkZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldFZlbG9jaXR5JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjFcIiwgXCIxXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0VmVsb2NpdHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmhlaWdodCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5oZWlnaHQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLndpZHRoJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLndpZHRoJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hbmltYXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouYW5pbWF0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5kZXB0aCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5kZXB0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuZnJpY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJpY3Rpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmltbW92YWJsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5pbW1vdmFibGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmxpZmUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoubGlmZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubWFzcycsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXNzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5tYXhTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhTcGVlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucG9zaXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24ueScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi55JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wcmV2aW91c1Bvc2l0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnByZXZpb3VzUG9zaXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi54JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wcmV2aW91c1Bvc2l0aW9uLnknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVtb3ZlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZXN0aXR1dGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yZXN0aXR1dGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRlVG9EaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRlVG9EaXJlY3Rpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJvdGF0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGlvblNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJvdGF0aW9uU3BlZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNjYWxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnNjYWxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5zaGFwZUNvbG9yJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnNoYXBlQ29sb3InLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnRvdWNoaW5nJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnRvdWNoaW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi52ZWxvY2l0eScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmVsb2NpdHkueCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi54JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eS55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZpc2libGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoudmlzaWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBTcHJpdGUgcHJvcGVydGllczpcbmNhbWVyYVxuY29sbGlkZXIgLSBVU0VGVUw/IChtYXJzaGFsIEFBQkIgYW5kIENpcmNsZUNvbGxpZGVyKVxuZGVidWdcbmdyb3Vwc1xubW91c2VBY3RpdmVcbm1vdXNlSXNPdmVyXG5tb3VzZUlzUHJlc3NlZFxub3JpZ2luYWxIZWlnaHRcbm9yaWdpbmFsV2lkdGhcbiovXG5cbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBTcHJpdGUgbWV0aG9kczpcbmFkZEltYWdlKGxhYmVsaW1nKSAtIDEgcGFyYW0gdmVyc2lvbjogKHNldHMgbGFiZWwgdG8gXCJub3JtYWxcIiBhdXRvbWF0aWNhbGx5KVxuZHJhdygpIC0gT1ZFUlJJREUgYW5kL29yIFVTRUZVTD9cbm1pcnJvclgoZGlyKSAtIFVTRUZVTD9cbm1pcnJvclkoZGlyKSAtIFVTRUZVTD9cbm92ZXJsYXBQaXhlbChwb2ludFhwb2ludFkpIC0gVVNFRlVMP1xub3ZlcmxhcFBvaW50KHBvaW50WHBvaW50WSkgLSBVU0VGVUw/XG51cGRhdGUoKSAtIFVTRUZVTD9cbiovXG5cbiAgLy8gQW5pbWF0aW9uc1xuICB7ZnVuYzogJ2xvYWRBbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ3VybDEnLCd1cmwyJ10sIHBhcmFtczogWydcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDEucG5nXCInLCAnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAyLnBuZ1wiJ10sIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAndmFyX2xvYWRBbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBibG9ja1ByZWZpeDogJ3ZhciBhbmltID0gbG9hZEFuaW1hdGlvbicsIHBhbGV0dGVQYXJhbXM6IFsndXJsMScsJ3VybDInXSwgcGFyYW1zOiBbJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMS5wbmdcIicsICdcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDIucG5nXCInXSwgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdhbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2FuaW1hdGlvbicsJ3gnLCd5J10sIHBhcmFtczogW1wiYW5pbVwiLCBcIjUwXCIsIFwiNTBcIl0gfSxcbiAge2Z1bmM6ICdhbmltLmNoYW5nZUZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydmcmFtZSddLCBwYXJhbXM6IFtcIjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLm5leHRGcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5uZXh0RnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5wcmV2aW91c0ZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnByZXZpb3VzRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5jbG9uZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5jbG9uZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdldEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEZyYW1lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ2V0TGFzdEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldExhc3RGcmFtZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmltLmdvVG9GcmFtZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnZnJhbWUnXSwgcGFyYW1zOiBbXCIxXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouZ29Ub0ZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ucGxheScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5JyB9LFxuICB7ZnVuYzogJ2FuaW0ucmV3aW5kJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJld2luZCcgfSxcbiAge2Z1bmM6ICdhbmltLnN0b3AnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouc3RvcCcgfSxcbiAge2Z1bmM6ICdhbmltLmZyYW1lQ2hhbmdlZCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmFtZUNoYW5nZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5mcmFtZURlbGF5JywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmZyYW1lRGVsYXknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5pbWFnZXMnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouaW1hZ2VzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0ubG9vcGluZycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5sb29waW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0ucGxheWluZycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5aW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0udmlzaWJsZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIEFuaW1hdGlvbiBtZXRob2RzOlxuZHJhdyh4eSlcbmdldEZyYW1lSW1hZ2UoKVxuZ2V0SGVpZ2h0KClcbmdldEltYWdlQXQoZnJhbWUpXG5nZXRXaWR0aCgpXG4qL1xuXG4gIC8vIEdyb3Vwc1xuICB7ZnVuYzogJ0dyb3VwJywgYmxvY2tQcmVmaXg6ICd2YXIgZ3JvdXAgPSBuZXcgR3JvdXAnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAnZ3JvdXAuYWRkJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZCcgfSxcbiAge2Z1bmM6ICdncm91cC5yZW1vdmUnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyoucmVtb3ZlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmNsZWFyJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBtb2RlT3B0aW9uTmFtZTogJyouY2xlYXInIH0sXG4gIHtmdW5jOiAnZ3JvdXAuY29udGFpbnMnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouY29udGFpbnMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAuZ2V0JywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ2knXSwgcGFyYW1zOiBbXCIwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0JywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLmJvdW5jZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnZ3JvdXBfYm91bmNlJyB9LCAvKiBhdm9pZCBtb2RlT3B0aW9uTmFtZSBjb25mbGljdCAqL1xuICB7ZnVuYzogJ2dyb3VwLmNvbGxpZGUnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX2JvdW5jZScgfSwgLyogYXZvaWQgbW9kZU9wdGlvbk5hbWUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5kaXNwbGFjZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnZ3JvdXBfYm91bmNlJyB9LCAvKiBhdm9pZCBtb2RlT3B0aW9uTmFtZSBjb25mbGljdCAqL1xuICB7ZnVuYzogJ2dyb3VwLm92ZXJsYXAnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX2JvdW5jZScgfSwgLyogYXZvaWQgbW9kZU9wdGlvbk5hbWUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5tYXhEZXB0aCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1heERlcHRoJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dyb3VwLm1pbkRlcHRoJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBtb2RlT3B0aW9uTmFtZTogJyoubWluRGVwdGgnLCB0eXBlOiAndmFsdWUnIH0sXG5cbi8qIFRPRE86IGRlY2lkZSB3aGV0aGVyIHRvIGV4cG9zZSB0aGVzZSBHcm91cCBtZXRob2RzOlxuZHJhdygpIC0gVVNFRlVMP1xuKi9cblxuICAvLyBFdmVudHNcbiAge2Z1bmM6ICdrZXlJc1ByZXNzZWQnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXlDb2RlJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAna2V5RG93bicsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlXZW50RG93bicsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlXZW50VXAnLCBwYWxldHRlUGFyYW1zOiBbJ2NvZGUnXSwgcGFyYW1zOiBbXCJVUF9BUlJPV1wiXSwgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAna2V5UHJlc3NlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdrZXlSZWxlYXNlZCcsIGJsb2NrOiAnZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIGtleVJlbGVhc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ2tleVR5cGVkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlUeXBlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5VHlwZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VYJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VZJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncG1vdXNlWCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Btb3VzZVknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZUJ1dHRvbicsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlSXNQcmVzc2VkJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VNb3ZlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VNb3ZlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VNb3ZlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZURyYWdnZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlRHJhZ2dlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VEcmFnZ2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlUHJlc3NlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVByZXNzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VSZWxlYXNlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VSZWxlYXNlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VSZWxlYXNlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZUNsaWNrZWQnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlQ2xpY2tlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VDbGlja2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlV2hlZWwnLCBibG9jazogJ2Z1bmN0aW9uIG1vdXNlV2hlZWwoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlV2hlZWwoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG5cbiAgLy8gTWF0aFxuICB7ZnVuYzogJ3NpbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYW5nbGUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnY29zJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhbmdsZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICd0YW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2FuZ2xlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FzaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2Fjb3MnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2F0YW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2F0YW4yJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd5JywneCddLCBwYXJhbXM6IFtcIjEwXCIsIFwiMTBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdkZWdyZWVzJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydyYWRpYW5zJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JhZGlhbnMnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2RlZ3JlZXMnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5nbGVNb2RlJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydtb2RlJ10sIHBhcmFtczogW1wiREVHUkVFU1wiXSB9LFxuICB7ZnVuYzogJ3JhbmRvbScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbWluJywnbWF4J10sIHBhcmFtczogW1wiMVwiLCBcIjVcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyYW5kb21HYXVzc2lhbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbWVhbicsJ3NkJ10sIHBhcmFtczogW1wiMFwiLCBcIjE1XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncmFuZG9tU2VlZCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnc2VlZCddLCBwYXJhbXM6IFtcIjk5XCJdIH0sXG4gIHtmdW5jOiAnYWJzJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCItMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2NlaWwnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjAuMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2NvbnN0cmFpbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJywnbG93JywnaGlnaCddLCBwYXJhbXM6IFtcIjEuMVwiLCBcIjBcIiwgXCIxXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZGlzdCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsneDEnLCd5MScsJ3gyJywneTInXSwgcGFyYW1zOiBbXCIwXCIsIFwiMFwiLCBcIjEwMFwiLCBcIjEwMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2V4cCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2Zsb29yJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIwLjlcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdsZXJwJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydzdGFydCcsJ3N0b3AnLCdhbXQnXSwgcGFyYW1zOiBbXCIwXCIsIFwiMTAwXCIsIFwiMC4xXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbG9nJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIxXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWFnJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhJywnYiddLCBwYXJhbXM6IFtcIjEwMFwiLCBcIjEwMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21hcCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnLCdzdGFydDEnLCdzdG9wMScsJ3N0YXJ0MicsJ3N0b3AnXSwgcGFyYW1zOiBbXCIwLjlcIiwgXCIwXCIsIFwiMVwiLCBcIjBcIiwgXCIxMDBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtYXgnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ24xJywnbjInXSwgcGFyYW1zOiBbXCIxXCIsXCIzXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWluJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyduMScsJ24yJ10sIHBhcmFtczogW1wiMVwiLCBcIjNcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdub3JtJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZScsJ3N0YXJ0Jywnc3RvcCddLCBwYXJhbXM6IFtcIjkwXCIsIFwiMFwiLCBcIjEwMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3BvdycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbicsJ2UnXSwgcGFyYW1zOiBbXCIxMFwiLCBcIjJcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyb3VuZCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMC45XCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnc3EnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjJcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcXJ0JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCI5XCJdLCB0eXBlOiAndmFsdWUnIH0sXG5cbiAgLy8gQWR2YW5jZWRcbl07XG5cbm1vZHVsZS5leHBvcnRzLmNhdGVnb3JpZXMgPSB7XG4gICdHYW1lIExhYic6IHtcbiAgICBjb2xvcjogJ3llbGxvdycsXG4gICAgcmdiOiBDT0xPUl9ZRUxMT1csXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBTcHJpdGVzOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgQW5pbWF0aW9uczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEdyb3Vwczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICByZ2I6IENPTE9SX1JFRCxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIERhdGE6IHtcbiAgICBjb2xvcjogJ2xpZ2h0Z3JlZW4nLFxuICAgIHJnYjogQ09MT1JfTElHSFRfR1JFRU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBEcmF3aW5nOiB7XG4gICAgY29sb3I6ICdjeWFuJyxcbiAgICByZ2I6IENPTE9SX0NZQU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBFdmVudHM6IHtcbiAgICBjb2xvcjogJ2dyZWVuJyxcbiAgICByZ2I6IENPTE9SX0dSRUVOLFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgQWR2YW5jZWQ6IHtcbiAgICBjb2xvcjogJ2JsdWUnLFxuICAgIHJnYjogQ09MT1JfQkxVRSxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cy5hZGRpdGlvbmFsUHJlZGVmVmFsdWVzID0gW1xuICAnUDJEJywgJ1dFQkdMJywgJ0FSUk9XJywgJ0NST1NTJywgJ0hBTkQnLCAnTU9WRScsXG4gICdURVhUJywgJ1dBSVQnLCAnSEFMRl9QSScsICdQSScsICdRVUFSVEVSX1BJJywgJ1RBVScsICdUV09fUEknLCAnREVHUkVFUycsXG4gICdSQURJQU5TJywgJ0NPUk5FUicsICdDT1JORVJTJywgJ1JBRElVUycsICdSSUdIVCcsICdMRUZUJywgJ0NFTlRFUicsICdUT1AnLFxuICAnQk9UVE9NJywgJ0JBU0VMSU5FJywgJ1BPSU5UUycsICdMSU5FUycsICdUUklBTkdMRVMnLCAnVFJJQU5HTEVfRkFOJyxcbiAgJ1RSSUFOR0xFX1NUUklQJywgJ1FVQURTJywgJ1FVQURfU1RSSVAnLCAnQ0xPU0UnLCAnT1BFTicsICdDSE9SRCcsICdQSUUnLFxuICAnUFJPSkVDVCcsICdTUVVBUkUnLCAnUk9VTkQnLCAnQkVWRUwnLCAnTUlURVInLCAnUkdCJywgJ0hTQicsICdIU0wnLCAnQVVUTycsXG4gICdBTFQnLCAnQkFDS1NQQUNFJywgJ0NPTlRST0wnLCAnREVMRVRFJywgJ0RPV05fQVJST1cnLCAnRU5URVInLCAnRVNDQVBFJyxcbiAgJ0xFRlRfQVJST1cnLCAnT1BUSU9OJywgJ1JFVFVSTicsICdSSUdIVF9BUlJPVycsICdTSElGVCcsICdUQUInLCAnVVBfQVJST1cnLFxuICAnQkxFTkQnLCAnQUREJywgJ0RBUktFU1QnLCAnTElHSFRFU1QnLCAnRElGRkVSRU5DRScsICdFWENMVVNJT04nLFxuICAnTVVMVElQTFknLCAnU0NSRUVOJywgJ1JFUExBQ0UnLCAnT1ZFUkxBWScsICdIQVJEX0xJR0hUJywgJ1NPRlRfTElHSFQnLFxuICAnRE9ER0UnLCAnQlVSTicsICdUSFJFU0hPTEQnLCAnR1JBWScsICdPUEFRVUUnLCAnSU5WRVJUJywgJ1BPU1RFUklaRScsXG4gICdESUxBVEUnLCAnRVJPREUnLCAnQkxVUicsICdOT1JNQUwnLCAnSVRBTElDJywgJ0JPTEQnLCAnX0RFRkFVTFRfVEVYVF9GSUxMJyxcbiAgJ19ERUZBVUxUX0xFQURNVUxUJywgJ19DVFhfTUlERExFJywgJ0xJTkVBUicsICdRVUFEUkFUSUMnLCAnQkVaSUVSJyxcbiAgJ0NVUlZFJywgJ19ERUZBVUxUX1NUUk9LRScsICdfREVGQVVMVF9GSUxMJ1xuXTtcbm1vZHVsZS5leHBvcnRzLnNob3dQYXJhbURyb3Bkb3ducyA9IHRydWU7XG4iLCIvLyBsb2NhbGUgZm9yIGdhbWVsYWJcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuZ2FtZWxhYl9sb2NhbGU7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsyOyAvKiBHYW1lTGFiICovIDsgYnVmLnB1c2goJ1xcblxcbjxkaXYgaWQ9XCJzb2Z0LWJ1dHRvbnNcIiBjbGFzcz1cInNvZnQtYnV0dG9ucy1ub25lXCI+XFxuICA8YnV0dG9uIGlkPVwibGVmdEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cImxlZnQtYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuICA8YnV0dG9uIGlkPVwicmlnaHRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDksICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJyaWdodC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJ1cEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJ1cC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJkb3duQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxNSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cImRvd24tYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuXFxuJyk7MTk7IGlmIChmaW5pc2hCdXR0b24pIHsgOyBidWYucHVzaCgnXFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDIyLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoMjIsICBtc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG4nKTsyNTsgfSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoKSB7XG4gIEdhbWVMYWIuZXhlY3V0ZUNtZChudWxsLCAnZm9vJyk7XG59O1xuIiwidmFyIEdhbWVMYWI7XG5cbi8vIEFQSSBkZWZpbml0aW9ucyBmb3IgZnVuY3Rpb25zIGV4cG9zZWQgZm9yIEphdmFTY3JpcHQgKGRyb3BsZXQvYWNlKSBsZXZlbHM6XG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbi8qXG4gKiBBbGwgQVBJcyBkaXNhYmxlZCBmb3Igbm93LiBwNS9wNXBsYXkgaXMgdGhlIG9ubHkgZXhwb3NlZCBBUEkuIElmIHdlIHdhbnQgdG9cbiAqIGV4cG9zZSBvdGhlciB0b3AtbGV2ZWwgQVBJcywgdGhleSBzaG91bGQgYmUgaW5jbHVkZWQgaGVyZSBhcyBzaG93biBpbiB0aGVzZVxuICogY29tbWVudGVkIGZ1bmN0aW9uc1xuICpcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoaWQpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKGlkLCAnZm9vJyk7XG59O1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcbnZhciBnYW1lTGFiU3ByaXRlID0gcmVxdWlyZSgnLi9HYW1lTGFiU3ByaXRlJyk7XG52YXIgYXNzZXRQcmVmaXggPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvYXNzZXRQcmVmaXgnKTtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYlA1IGNsYXNzIHRoYXQgd3JhcHMgcDUgYW5kIHA1cGxheSBhbmQgcGF0Y2hlcyBpdCBpblxuICogc3BlY2lmaWMgcGxhY2VzIHRvIGVuYWJsZSBHYW1lTGFiIGZ1bmN0aW9uYWxpdHlcbiAqL1xudmFyIEdhbWVMYWJQNSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5wNSA9IG51bGw7XG4gIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcbiAgdGhpcy5wNWV2ZW50TmFtZXMgPSBbXG4gICAgJ21vdXNlTW92ZWQnLCAnbW91c2VEcmFnZ2VkJywgJ21vdXNlUHJlc3NlZCcsICdtb3VzZVJlbGVhc2VkJyxcbiAgICAnbW91c2VDbGlja2VkJywgJ21vdXNlV2hlZWwnLFxuICAgICdrZXlQcmVzc2VkJywgJ2tleVJlbGVhc2VkJywgJ2tleVR5cGVkJ1xuICBdO1xuICB0aGlzLnA1c3BlY2lhbEZ1bmN0aW9ucyA9IFsncHJlbG9hZCcsICdkcmF3JywgJ3NldHVwJ10uY29uY2F0KHRoaXMucDVldmVudE5hbWVzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxhYlA1O1xuXG5HYW1lTGFiUDUuYmFzZVA1bG9hZEltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoaXMgR2FtZUxhYlA1IGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB7IU9iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMuZ2FtZUxhYiBpbnN0YW5jZSBvZiBwYXJlbnQgR2FtZUxhYiBvYmplY3RcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uRXhlY3V0aW9uU3RhcnRpbmcgY2FsbGJhY2sgdG8gcnVuIGR1cmluZyBwNSBpbml0XG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5vblByZWxvYWQgY2FsbGJhY2sgdG8gcnVuIGR1cmluZyBwcmVsb2FkKClcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uU2V0dXAgY2FsbGJhY2sgdG8gcnVuIGR1cmluZyBzZXR1cCgpXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5vbkRyYXcgY2FsbGJhY2sgdG8gcnVuIGR1cmluZyBlYWNoIGRyYXcoKVxuICovXG5HYW1lTGFiUDUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gIHRoaXMub25FeGVjdXRpb25TdGFydGluZyA9IG9wdGlvbnMub25FeGVjdXRpb25TdGFydGluZztcbiAgdGhpcy5vblByZWxvYWQgPSBvcHRpb25zLm9uUHJlbG9hZDtcbiAgdGhpcy5vblNldHVwID0gb3B0aW9ucy5vblNldHVwO1xuICB0aGlzLm9uRHJhdyA9IG9wdGlvbnMub25EcmF3O1xuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuc2V0dXBHbG9iYWxNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmb3Igbm8tc2tldGNoIEdsb2JhbCBtb2RlXG4gICAgICovXG4gICAgdmFyIHA1ID0gd2luZG93LnA1O1xuXG4gICAgdGhpcy5faXNHbG9iYWwgPSB0cnVlO1xuICAgIC8vIExvb3AgdGhyb3VnaCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYW5kIGF0dGFjaCB0aGVtIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwIGluIHA1LnByb3RvdHlwZSkge1xuICAgICAgaWYodHlwZW9mIHA1LnByb3RvdHlwZVtwXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZXYgPSBwLnN1YnN0cmluZygyKTtcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudHMuaGFzT3duUHJvcGVydHkoZXYpKSB7XG4gICAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvd1twXSA9IHA1LnByb3RvdHlwZVtwXTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXR0YWNoIGl0cyBwcm9wZXJ0aWVzIHRvIHRoZSB3aW5kb3dcbiAgICBmb3IgKHZhciBwMiBpbiB0aGlzKSB7XG4gICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShwMikpIHtcbiAgICAgICAgd2luZG93W3AyXSA9IHRoaXNbcDJdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBPdmVycmlkZSBwNS5sb2FkSW1hZ2Ugc28gd2UgY2FuIG1vZGlmeSB0aGUgVVJMIHBhdGggcGFyYW1cbiAgaWYgKCFHYW1lTGFiUDUuYmFzZVA1bG9hZEltYWdlKSB7XG4gICAgR2FtZUxhYlA1LmJhc2VQNWxvYWRJbWFnZSA9IHdpbmRvdy5wNS5wcm90b3R5cGUubG9hZEltYWdlO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUubG9hZEltYWdlID0gZnVuY3Rpb24gKHBhdGgsIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICBwYXRoID0gYXNzZXRQcmVmaXguZml4UGF0aChwYXRoKTtcbiAgICAgIHJldHVybiBHYW1lTGFiUDUuYmFzZVA1bG9hZEltYWdlLmNhbGwodGhpcywgcGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH07XG4gIH1cblxuICAvLyBPdmVycmlkZSBwNS5yZWRyYXcgdG8gbWFrZSBpdCB0d28tcGhhc2UgYWZ0ZXIgdXNlckRyYXcoKVxuICB3aW5kb3cucDUucHJvdG90eXBlLnJlZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgZnJvbSByZWRyYXcoKVxuICAgICAqL1xuICAgIHZhciB1c2VyU2V0dXAgPSB0aGlzLnNldHVwIHx8IHdpbmRvdy5zZXR1cDtcbiAgICB2YXIgdXNlckRyYXcgPSB0aGlzLmRyYXcgfHwgd2luZG93LmRyYXc7XG4gICAgaWYgKHR5cGVvZiB1c2VyRHJhdyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5wdXNoKCk7XG4gICAgICBpZiAodHlwZW9mIHVzZXJTZXR1cCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5zY2FsZSh0aGlzLnBpeGVsRGVuc2l0eSwgdGhpcy5waXhlbERlbnNpdHkpO1xuICAgICAgfVxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJlZE1ldGhvZHMucHJlLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgZi5jYWxsKHNlbGYpO1xuICAgICAgfSk7XG4gICAgICB1c2VyRHJhdygpO1xuICAgIH1cbiAgfTtcblxuICAvLyBDcmVhdGUgMm5kIHBoYXNlIGZ1bmN0aW9uIGFmdGVyVXNlckRyYXcoKVxuICB3aW5kb3cucDUucHJvdG90eXBlLmFmdGVyVXNlckRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmcm9tIHJlZHJhdygpXG4gICAgICovXG4gICAgdGhpcy5fcmVnaXN0ZXJlZE1ldGhvZHMucG9zdC5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICBmLmNhbGwoc2VsZik7XG4gICAgfSk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfTtcblxuICAvLyBPdmVycmlkZSBwNS5jcmVhdGVTcHJpdGUgc28gd2UgY2FuIHJlcGxhY2UgdGhlIEFBQkJvcHMoKSBmdW5jdGlvblxuICB3aW5kb3cucDUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZSA9IGZ1bmN0aW9uKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAvKlxuICAgICAqIENvcGllZCBjb2RlIGZyb20gcDVwbGF5IGZyb20gY3JlYXRlU3ByaXRlKClcbiAgICAgKi9cbiAgICB2YXIgcyA9IG5ldyB3aW5kb3cuU3ByaXRlKHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgIHMuQUFCQm9wcyA9IGdhbWVMYWJTcHJpdGUuQUFCQm9wcztcbiAgICBzLmRlcHRoID0gd2luZG93LmFsbFNwcml0ZXMubWF4RGVwdGgoKSsxO1xuICAgIHdpbmRvdy5hbGxTcHJpdGVzLmFkZChzKTtcbiAgICByZXR1cm4gcztcbiAgfTtcblxuICAvLyBPdmVycmlkZSB3aW5kb3cuR3JvdXAgc28gd2UgY2FuIG92ZXJyaWRlIHRoZSBtZXRob2RzIHRoYXQgdGFrZSBjYWxsYmFja1xuICAvLyBwYXJhbWV0ZXJzXG4gIHZhciBiYXNlR3JvdXBDb25zdHJ1Y3RvciA9IHdpbmRvdy5Hcm91cDtcbiAgd2luZG93Lkdyb3VwID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcnJheSA9IGJhc2VHcm91cENvbnN0cnVjdG9yKCk7XG5cbiAgICAvKlxuICAgICAqIENyZWF0ZSBuZXcgaGVscGVyIGNhbGxlZCBjYWxsQUFCQm9wc0ZvckFsbCgpIHdoaWNoIGNhbiBiZSBjYWxsZWQgYXMgYVxuICAgICAqIHN0YXRlZnVsIG5hdGl2ZUZ1bmMgYnkgdGhlIGludGVycHJldGVyLiBUaGlzIGVuYWJsZXMgdGhlIG5hdGl2ZSBtZXRob2QgdG9cbiAgICAgKiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgc28gdGhhdCBpdCBjYW4gZ28gYXN5bmNocm9ub3VzIGV2ZXJ5IHRpbWUgaXRcbiAgICAgKiAob3IgYW55IG5hdGl2ZSBmdW5jdGlvbiB0aGF0IGl0IGNhbGxzLCBzdWNoIGFzIEFBQkJvcHMpIHdhbnRzIHRvIGV4ZWN1dGVcbiAgICAgKiBhIGNhbGxiYWNrIGJhY2sgaW50byBpbnRlcnByZXRlciBjb2RlLiBUaGUgaW50ZXJwcmV0ZXIgc3RhdGUgb2JqZWN0IGlzXG4gICAgICogcmV0cmlldmVkIGJ5IGNhbGxpbmcgSlNJbnRlcnByZXRlci5nZXRDdXJyZW50U3RhdGUoKS5cbiAgICAgKlxuICAgICAqIEFkZGl0aW9uYWwgcHJvcGVydGllcyBjYW4gYmUgc2V0IG9uIHRoZSBzdGF0ZSBvYmplY3QgdG8gdHJhY2sgc3RhdGVcbiAgICAgKiBhY3Jvc3MgdGhlIG11bHRpcGxlIGV4ZWN1dGlvbnMuIElmIHRoZSBmdW5jdGlvbiB3YW50cyB0byBiZSBjYWxsZWQgYWdhaW4sXG4gICAgICogaXQgc2hvdWxkIHNldCBzdGF0ZS5kb25lRXhlYyB0byBmYWxzZS4gV2hlbiB0aGUgZnVuY3Rpb24gaXMgY29tcGxldGUgYW5kXG4gICAgICogbm8gbG9uZ2VyIHdhbnRzIHRvIGJlIGNhbGxlZCBpbiBhIGxvb3AgYnkgdGhlIGludGVycHJldGVyLCBpdCBzaG91bGQgc2V0XG4gICAgICogc3RhdGUuZG9uZUV4ZWMgdG8gdHJ1ZSBhbmQgcmV0dXJuIGEgdmFsdWUuXG4gICAgICovXG4gICAgYXJyYXkuY2FsbEFBQkJvcHNGb3JBbGwgPSBmdW5jdGlvbih0eXBlLCB0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgc3RhdGUgPSBvcHRpb25zLmdhbWVMYWIuSlNJbnRlcnByZXRlci5nZXRDdXJyZW50U3RhdGUoKTtcbiAgICAgIGlmICghc3RhdGUuX19pKSB7XG4gICAgICAgIHN0YXRlLl9faSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoc3RhdGUuX19pIDwgdGhpcy5zaXplKCkpIHtcbiAgICAgICAgaWYgKCFzdGF0ZS5fX3N1YlN0YXRlKSB7XG4gICAgICAgICAgLy8gQmVmb3JlIHdlIGNhbGwgQUFCQm9wcyAoYW5vdGhlciBzdGF0ZWZ1bCBmdW5jdGlvbiksIGhhbmcgYSBfX3N1YlN0YXRlXG4gICAgICAgICAgLy8gb2ZmIG9mIHN0YXRlLCBzbyBpdCBjYW4gdXNlIHRoYXQgaW5zdGVhZCB0byB0cmFjayBpdHMgc3RhdGU6XG4gICAgICAgICAgc3RhdGUuX19zdWJTdGF0ZSA9IHsgZG9uZUV4ZWM6IHRydWUgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdldChzdGF0ZS5fX2kpLkFBQkJvcHModHlwZSwgdGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgICAgIGlmIChzdGF0ZS5fX3N1YlN0YXRlLmRvbmVFeGVjKSB7XG4gICAgICAgICAgLy8gTm90ZTogaWdub3JpbmcgcmV0dXJuIHZhbHVlIGZyb20gZWFjaCBBQUJCb3BzKCkgY2FsbFxuICAgICAgICAgIGRlbGV0ZSBzdGF0ZS5fX3N1YlN0YXRlO1xuICAgICAgICAgIHN0YXRlLl9faSsrO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmRvbmVFeGVjID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5kb25lRXhlYyA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFJlcGxhY2UgdGhlc2UgZm91ciBtZXRob2RzIHRoYXQgdGFrZSBjYWxsYmFjayBwYXJhbWV0ZXJzIHRvIHVzZSB0aGUgbmV3XG4gICAgLy8gY2FsbEFBQkJvcHNGb3JBbGwoKSBoZWxwZXI6XG5cbiAgICBhcnJheS5vdmVybGFwID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsQUFCQm9wc0ZvckFsbChcIm92ZXJsYXBcIiwgdGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFycmF5LmNvbGxpZGUgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxBQUJCb3BzRm9yQWxsKFwiY29sbGlkZVwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXJyYXkuZGlzcGxhY2UgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxBQUJCb3BzRm9yQWxsKFwiZGlzcGxhY2VcIiwgdGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFycmF5LmJvdW5jZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJib3VuY2VcIiwgdGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcblxufTtcblxuLyoqXG4gKiBSZXNldCBHYW1lTGFiUDUgdG8gaXRzIGluaXRpYWwgc3RhdGUuIENhbGxlZCBiZWZvcmUgZWFjaCB0aW1lIGl0IGlzIHVzZWQuXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUucmVzZXRFeGVjdXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgaWYgKHRoaXMucDUpIHtcbiAgICB0aGlzLnA1LnJlbW92ZSgpO1xuICAgIHRoaXMucDUgPSBudWxsO1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcblxuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSB2YXJpb3VzIHA1L3A1cGxheSBpbml0IGNvZGVcbiAgICAgKi9cblxuICAgIC8vIENsZWFyIHJlZ2lzdGVyZWQgbWV0aG9kcyBvbiB0aGUgcHJvdG90eXBlOlxuICAgIGZvciAodmFyIG1lbWJlciBpbiB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkTWV0aG9kcykge1xuICAgICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzW21lbWJlcl07XG4gICAgfVxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzID0geyBwcmU6IFtdLCBwb3N0OiBbXSwgcmVtb3ZlOiBbXSB9O1xuICAgIGRlbGV0ZSB3aW5kb3cucDUucHJvdG90eXBlLl9yZWdpc3RlcmVkUHJlbG9hZE1ldGhvZHMuZ2FtZWxhYlByZWxvYWQ7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmFsbFNwcml0ZXMgPSBuZXcgd2luZG93Lkdyb3VwKCk7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5zcHJpdGVVcGRhdGUgPSB0cnVlO1xuXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5jYW1lcmEgPSBuZXcgd2luZG93LkNhbWVyYSgwLCAwLCAxKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYS5pbml0ID0gZmFsc2U7XG5cbiAgICAvL2tleWJvYXJkIGlucHV0XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS5yZWFkUHJlc3Nlcyk7XG5cbiAgICAvL2F1dG9tYXRpYyBzcHJpdGUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LnA1LnByb3RvdHlwZS51cGRhdGVTcHJpdGVzKTtcblxuICAgIC8vcXVhZHRyZWUgdXBkYXRlXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncG9zdCcsIHdpbmRvdy51cGRhdGVUcmVlKTtcblxuICAgIC8vY2FtZXJhIHB1c2ggYW5kIHBvcFxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3ByZScsIHdpbmRvdy5jYW1lcmFQdXNoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LmNhbWVyYVBvcCk7XG5cbiAgfVxuXG4gIC8vIEltcG9ydGFudCB0byByZXNldCB0aGVzZSBhZnRlciB0aGlzLnA1IGhhcyBiZWVuIHJlbW92ZWQgYWJvdmVcbiAgdGhpcy5kcmF3SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB0aGlzLnNldHVwSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuZ2FtZWxhYlByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSB3aW5kb3cucDUuX2dldERlY3JlbWVudFByZWxvYWQoYXJndW1lbnRzLCB0aGlzLnA1KTtcbiAgfS5iaW5kKHRoaXMpO1xufTtcblxuLyoqXG4gKiBJbnN0YW50aWF0ZSBhIG5ldyBwNSBhbmQgc3RhcnQgZXhlY3V0aW9uXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUuc3RhcnRFeGVjdXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cbiAgLyoganNoaW50IG5vbmV3OmZhbHNlICovXG4gIG5ldyB3aW5kb3cucDUoZnVuY3Rpb24gKHA1b2JqKSB7XG4gICAgICB0aGlzLnA1ID0gcDVvYmo7XG5cbiAgICAgIHA1b2JqLnJlZ2lzdGVyUHJlbG9hZE1ldGhvZCgnZ2FtZWxhYlByZWxvYWQnLCB3aW5kb3cucDUucHJvdG90eXBlKTtcblxuICAgICAgLy8gT3ZlcmxvYWQgX2RyYXcgZnVuY3Rpb24gdG8gbWFrZSBpdCB0d28tcGhhc2VcbiAgICAgIHA1b2JqLl9kcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9kcmF3KClcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3RoaXNGcmFtZVRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHZhciB0aW1lX3NpbmNlX2xhc3QgPSB0aGlzLl90aGlzRnJhbWVUaW1lIC0gdGhpcy5fbGFzdEZyYW1lVGltZTtcbiAgICAgICAgdmFyIHRhcmdldF90aW1lX2JldHdlZW5fZnJhbWVzID0gMTAwMCAvIHRoaXMuX3RhcmdldEZyYW1lUmF0ZTtcblxuICAgICAgICAvLyBvbmx5IGRyYXcgaWYgd2UgcmVhbGx5IG5lZWQgdG87IGRvbid0IG92ZXJleHRlbmQgdGhlIGJyb3dzZXIuXG4gICAgICAgIC8vIGRyYXcgaWYgd2UncmUgd2l0aGluIDVtcyBvZiB3aGVuIG91ciBuZXh0IGZyYW1lIHNob3VsZCBwYWludFxuICAgICAgICAvLyAodGhpcyB3aWxsIHByZXZlbnQgdXMgZnJvbSBnaXZpbmcgdXAgb3Bwb3J0dW5pdGllcyB0byBkcmF3XG4gICAgICAgIC8vIGFnYWluIHdoZW4gaXQncyByZWFsbHkgYWJvdXQgdGltZSBmb3IgdXMgdG8gZG8gc28pLiBmaXhlcyBhblxuICAgICAgICAvLyBpc3N1ZSB3aGVyZSB0aGUgZnJhbWVSYXRlIGlzIHRvbyBsb3cgaWYgb3VyIHJlZnJlc2ggbG9vcCBpc24ndFxuICAgICAgICAvLyBpbiBzeW5jIHdpdGggdGhlIGJyb3dzZXIuIG5vdGUgdGhhdCB3ZSBoYXZlIHRvIGRyYXcgb25jZSBldmVuXG4gICAgICAgIC8vIGlmIGxvb3BpbmcgaXMgb2ZmLCBzbyB3ZSBieXBhc3MgdGhlIHRpbWUgZGVsYXkgaWYgdGhhdFxuICAgICAgICAvLyBpcyB0aGUgY2FzZS5cbiAgICAgICAgdmFyIGVwc2lsb24gPSA1O1xuICAgICAgICBpZiAoIXRoaXMubG9vcCB8fFxuICAgICAgICAgICAgdGltZV9zaW5jZV9sYXN0ID49IHRhcmdldF90aW1lX2JldHdlZW5fZnJhbWVzIC0gZXBzaWxvbikge1xuICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KCdmcmFtZUNvdW50JywgdGhpcy5mcmFtZUNvdW50ICsgMSk7XG4gICAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9kcmF3RXBpbG9ndWUoKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgcDVvYmouYWZ0ZXJSZWRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX2RyYXcoKVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdXBkYXRlUEFjY2VsZXJhdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlUFJvdGF0aW9ucygpO1xuICAgICAgICB0aGlzLl91cGRhdGVQTW91c2VDb29yZHMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlUFRvdWNoQ29vcmRzKCk7XG4gICAgICAgIHRoaXMuX2ZyYW1lUmF0ZSA9IDEwMDAuMC8odGhpcy5fdGhpc0ZyYW1lVGltZSAtIHRoaXMuX2xhc3RGcmFtZVRpbWUpO1xuICAgICAgICB0aGlzLl9sYXN0RnJhbWVUaW1lID0gdGhpcy5fdGhpc0ZyYW1lVGltZTtcblxuICAgICAgICB0aGlzLl9kcmF3RXBpbG9ndWUoKTtcbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIHA1b2JqLl9kcmF3RXBpbG9ndWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX2RyYXcoKVxuICAgICAgICAgKi9cblxuICAgICAgICAvL21hbmRhdG9yeSB1cGRhdGUgdmFsdWVzKG1hdHJpeHMgYW5kIHN0YWNrKSBmb3IgM2RcbiAgICAgICAgaWYodGhpcy5fcmVuZGVyZXIuaXNQM0Qpe1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLl91cGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldCBub3RpZmllZCB0aGUgbmV4dCB0aW1lIHRoZSBicm93c2VyIGdpdmVzIHVzXG4gICAgICAgIC8vIGFuIG9wcG9ydHVuaXR5IHRvIGRyYXcuXG4gICAgICAgIGlmICh0aGlzLl9sb29wKSB7XG4gICAgICAgICAgdGhpcy5fcmVxdWVzdEFuaW1JZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZHJhdyk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIC8vIE92ZXJsb2FkIF9zZXR1cCBmdW5jdGlvbiB0byBtYWtlIGl0IHR3by1waGFzZVxuICAgICAgcDVvYmouX3NldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX3NldHVwKClcbiAgICAgICAgICovXG5cbiAgICAgICAgLy8gcmV0dXJuIHByZWxvYWQgZnVuY3Rpb25zIHRvIHRoZWlyIG5vcm1hbCB2YWxzIGlmIHN3aXRjaGVkIGJ5IHByZWxvYWRcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9pc0dsb2JhbCA/IHdpbmRvdyA6IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YgY29udGV4dC5wcmVsb2FkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZm9yICh2YXIgZiBpbiB0aGlzLl9wcmVsb2FkTWV0aG9kcykge1xuICAgICAgICAgICAgY29udGV4dFtmXSA9IHRoaXMuX3ByZWxvYWRNZXRob2RzW2ZdW2ZdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNob3J0LWNpcmN1aXQgb24gdGhpcywgaW4gY2FzZSBzb21lb25lIHVzZWQgdGhlIGxpYnJhcnkgaW4gXCJnbG9iYWxcIlxuICAgICAgICAvLyBtb2RlIGVhcmxpZXJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0LnNldHVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29udGV4dC5zZXR1cCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3NldHVwRXBpbG9ndWUoKTtcbiAgICAgICAgfVxuXG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICBwNW9iai5fc2V0dXBFcGlsb2d1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfc2V0dXAoKVxuICAgICAgICAgKi9cblxuICAgICAgICAvLyAvLyB1bmhpZGUgaGlkZGVuIGNhbnZhcyB0aGF0IHdhcyBjcmVhdGVkXG4gICAgICAgIC8vIHRoaXMuY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgICAgICAgLy8gdGhpcy5jYW52YXMuY2xhc3NOYW1lID0gdGhpcy5jYW52YXMuY2xhc3NOYW1lLnJlcGxhY2UoJ3A1X2hpZGRlbicsICcnKTtcblxuICAgICAgICAvLyB1bmhpZGUgYW55IGhpZGRlbiBjYW52YXNlcyB0aGF0IHdlcmUgY3JlYXRlZFxuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgvKF58XFxzKXA1X2hpZGRlbig/IVxcUykvZyk7XG4gICAgICAgIHZhciBjYW52YXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3A1X2hpZGRlbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbnZhc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGsgPSBjYW52YXNlc1tpXTtcbiAgICAgICAgICBrLnN0eWxlLnZpc2liaWxpdHkgPSAnJztcbiAgICAgICAgICBrLmNsYXNzTmFtZSA9IGsuY2xhc3NOYW1lLnJlcGxhY2UocmVnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0dXBEb25lID0gdHJ1ZTtcblxuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgLy8gRG8gdGhpcyBhZnRlciB3ZSdyZSBkb25lIG1vbmtleWluZyB3aXRoIHRoZSBwNW9iaiBpbnN0YW5jZSBtZXRob2RzOlxuICAgICAgcDVvYmouc2V0dXBHbG9iYWxNb2RlKCk7XG5cbiAgICAgIHdpbmRvdy5wcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDYWxsIG91ciBnYW1lbGFiUHJlbG9hZCgpIHRvIGZvcmNlIF9zdGFydC9fc2V0dXAgdG8gd2FpdC5cbiAgICAgICAgd2luZG93LmdhbWVsYWJQcmVsb2FkKCk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogcDUgXCJwcmVsb2FkIG1ldGhvZHNcIiB3ZXJlIG1vZGlmaWVkIGJlZm9yZSB0aGlzIHByZWxvYWQgZnVuY3Rpb24gd2FzXG4gICAgICAgICAqIGNhbGxlZCBhbmQgc3Vic3RpdHV0ZWQgd2l0aCB3cmFwcGVkIHZlcnNpb24gdGhhdCBpbmNyZW1lbnQgYSBwcmVsb2FkXG4gICAgICAgICAqIGNvdW50IGFuZCB3aWxsIGxhdGVyIGRlY3JlbWVudCBhIHByZWxvYWQgY291bnQgdXBvbiBhc3luYyBsb2FkXG4gICAgICAgICAqIGNvbXBsZXRpb24uIFNpbmNlIHA1IGlzIHJ1bm5pbmcgaW4gZ2xvYmFsIG1vZGUsIGl0IG9ubHkgd3JhcHBlZCB0aGVcbiAgICAgICAgICogbWV0aG9kcyBvbiB0aGUgd2luZG93IG9iamVjdC4gV2UgbmVlZCB0byBwbGFjZSB0aGUgd3JhcHBlZCBtZXRob2RzIG9uXG4gICAgICAgICAqIHRoZSBwNSBvYmplY3QgYXMgd2VsbCBiZWZvcmUgd2UgbWFyc2hhbCB0byB0aGUgaW50ZXJwcmV0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLnA1Ll9wcmVsb2FkTWV0aG9kcykge1xuICAgICAgICAgIHRoaXMucDVbbWV0aG9kXSA9IHdpbmRvd1ttZXRob2RdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vblByZWxvYWQoKTtcblxuICAgICAgfS5iaW5kKHRoaXMpO1xuICAgICAgd2luZG93LnNldHVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBwNSBcInByZWxvYWQgbWV0aG9kc1wiIGhhdmUgbm93IGJlZW4gcmVzdG9yZWQgYW5kIHRoZSB3cmFwcGVkIHZlcnNpb25cbiAgICAgICAgICogYXJlIG5vIGxvbmdlciBpbiB1c2UuIFNpbmNlIHA1IGlzIHJ1bm5pbmcgaW4gZ2xvYmFsIG1vZGUsIGl0IG9ubHlcbiAgICAgICAgICogcmVzdG9yZWQgdGhlIG1ldGhvZHMgb24gdGhlIHdpbmRvdyBvYmplY3QuIFdlIG5lZWQgdG8gcmVzdG9yZSB0aGVcbiAgICAgICAgICogbWV0aG9kcyBvbiB0aGUgcDUgb2JqZWN0IHRvIG1hdGNoXG4gICAgICAgICAqL1xuICAgICAgICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5wNS5fcHJlbG9hZE1ldGhvZHMpIHtcbiAgICAgICAgICB0aGlzLnA1W21ldGhvZF0gPSB3aW5kb3dbbWV0aG9kXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHA1b2JqLmNyZWF0ZUNhbnZhcyg0MDAsIDQwMCk7XG5cbiAgICAgICAgdGhpcy5vblNldHVwKCk7XG5cbiAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgd2luZG93LmRyYXcgPSB0aGlzLm9uRHJhdy5iaW5kKHRoaXMpO1xuXG4gICAgICB0aGlzLm9uRXhlY3V0aW9uU3RhcnRpbmcoKTtcblxuICAgIH0uYmluZCh0aGlzKSxcbiAgICAnZGl2R2FtZUxhYicpO1xuICAvKiBqc2hpbnQgbm9uZXc6dHJ1ZSAqL1xufTtcblxuLyoqXG4gKiBDYWxsZWQgd2hlbiBhbGwgZ2xvYmFsIGNvZGUgaXMgZG9uZSBleGVjdXRpbmcuIFRoaXMgYWxsb3dzIHVzIHRvIHJlbGVhc2VcbiAqIG91ciBcInByZWxvYWRcIiBjb3VudCByZWZlcmVuY2UgaW4gcDUsIHdoaWNoIG1lYW5zIHRoYXQgc2V0dXAoKSBjYW4gYmVnaW4uXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUubm90aWZ5VXNlckdsb2JhbENvZGVDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkKSB7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQoKTtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IG51bGw7XG4gIH1cbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuZ2V0Q3VzdG9tTWFyc2hhbEdsb2JhbFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHRoaXMucDUsXG4gICAgaGVpZ2h0OiB0aGlzLnA1LFxuICAgIGRpc3BsYXlXaWR0aDogdGhpcy5wNSxcbiAgICBkaXNwbGF5SGVpZ2h0OiB0aGlzLnA1LFxuICAgIHdpbmRvd1dpZHRoOiB0aGlzLnA1LFxuICAgIHdpbmRvd0hlaWdodDogdGhpcy5wNSxcbiAgICBmb2N1c2VkOiB0aGlzLnA1LFxuICAgIGZyYW1lQ291bnQ6IHRoaXMucDUsXG4gICAga2V5SXNQcmVzc2VkOiB0aGlzLnA1LFxuICAgIGtleTogdGhpcy5wNSxcbiAgICBrZXlDb2RlOiB0aGlzLnA1LFxuICAgIG1vdXNlWDogdGhpcy5wNSxcbiAgICBtb3VzZVk6IHRoaXMucDUsXG4gICAgcG1vdXNlWDogdGhpcy5wNSxcbiAgICBwbW91c2VZOiB0aGlzLnA1LFxuICAgIHdpbk1vdXNlWDogdGhpcy5wNSxcbiAgICB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgcHdpbk1vdXNlWDogdGhpcy5wNSxcbiAgICBwd2luTW91c2VZOiB0aGlzLnA1LFxuICAgIG1vdXNlQnV0dG9uOiB0aGlzLnA1LFxuICAgIG1vdXNlSXNQcmVzc2VkOiB0aGlzLnA1LFxuICAgIHRvdWNoWDogdGhpcy5wNSxcbiAgICB0b3VjaFk6IHRoaXMucDUsXG4gICAgcHRvdWNoWDogdGhpcy5wNSxcbiAgICBwdG91Y2hZOiB0aGlzLnA1LFxuICAgIHRvdWNoZXM6IHRoaXMucDUsXG4gICAgdG91Y2hJc0Rvd246IHRoaXMucDUsXG4gICAgcGl4ZWxzOiB0aGlzLnA1LFxuICAgIGRldmljZU9yaWVudGF0aW9uOiB0aGlzLnA1LFxuICAgIGFjY2VsZXJhdGlvblg6IHRoaXMucDUsXG4gICAgYWNjZWxlcmF0aW9uWTogdGhpcy5wNSxcbiAgICBhY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgIHBBY2NlbGVyYXRpb25YOiB0aGlzLnA1LFxuICAgIHBBY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgIHBBY2NlbGVyYXRpb25aOiB0aGlzLnA1LFxuICAgIHJvdGF0aW9uWDogdGhpcy5wNSxcbiAgICByb3RhdGlvblk6IHRoaXMucDUsXG4gICAgcm90YXRpb25aOiB0aGlzLnA1LFxuICAgIHBSb3RhdGlvblg6IHRoaXMucDUsXG4gICAgcFJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICBwUm90YXRpb25aOiB0aGlzLnA1XG4gIH07XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmdldEN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGluc3RhbmNlOiB3aW5kb3cuU3ByaXRlLFxuICAgICAgbWV0aG9kT3B0czoge1xuICAgICAgICBuYXRpdmVDYWxsc0JhY2tJbnRlcnByZXRlcjogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gVGhlIHA1cGxheSBHcm91cCBvYmplY3Qgc2hvdWxkIGJlIGN1c3RvbSBtYXJzaGFsbGVkLCBidXQgaXRzIGNvbnN0cnVjdG9yXG4gICAgLy8gYWN0dWFsbHkgY3JlYXRlcyBhIHN0YW5kYXJkIEFycmF5IGluc3RhbmNlIHdpdGggYSBmZXcgYWRkaXRpb25hbCBtZXRob2RzXG4gICAgLy8gYWRkZWQuIFdlIHNvbHZlIHRoaXMgYnkgcHV0dGluZyBcIkFycmF5XCIgaW4gdGhpcyBsaXN0LCBidXQgd2l0aCBcImRyYXdcIiBhc1xuICAgIC8vIGEgcmVxdWlyZWRNZXRob2Q6XG4gICAge1xuICAgICAgaW5zdGFuY2U6IEFycmF5LFxuICAgICAgcmVxdWlyZWRNZXRob2Q6ICdkcmF3JyxcbiAgICAgIG1ldGhvZE9wdHM6IHtcbiAgICAgICAgbmF0aXZlQ2FsbHNCYWNrSW50ZXJwcmV0ZXI6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNSB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5DYW1lcmEgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cuQW5pbWF0aW9uIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LlZlY3RvciB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5Db2xvciB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5JbWFnZSB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5SZW5kZXJlciB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5HcmFwaGljcyB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5wNS5Gb250IH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LlRhYmxlIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LlRhYmxlUm93IH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkVsZW1lbnQgfSxcbiAgXTtcbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuZ2V0R2xvYmFsUHJvcGVydHlMaXN0ID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBwcm9wTGlzdCA9IHt9O1xuXG4gIC8vIEluY2x1ZGUgZXZlcnkgcHJvcGVydHkgb24gdGhlIHA1IGluc3RhbmNlIGluIHRoZSBnbG9iYWwgcHJvcGVydHkgbGlzdDpcbiAgZm9yICh2YXIgcHJvcCBpbiB0aGlzLnA1KSB7XG4gICAgcHJvcExpc3RbcHJvcF0gPSBbIHRoaXMucDVbcHJvcF0sIHRoaXMucDUgXTtcbiAgfVxuICAvLyBBbmQgdGhlIEdyb3VwIGNvbnN0cnVjdG9yIGZyb20gcDVwbGF5OlxuICBwcm9wTGlzdC5Hcm91cCA9IFsgd2luZG93Lkdyb3VwLCB3aW5kb3cgXTtcbiAgLy8gQW5kIGFsc28gY3JlYXRlIGEgJ3A1JyBvYmplY3QgaW4gdGhlIGdsb2JhbCBuYW1lc3BhY2U6XG4gIHByb3BMaXN0LnA1ID0gWyB7IFZlY3Rvcjogd2luZG93LnA1LlZlY3RvciB9LCB3aW5kb3cgXTtcblxuICByZXR1cm4gcHJvcExpc3Q7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBmcmFtZSByYXRlXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUuZ2V0RnJhbWVSYXRlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5wNSA/IHRoaXMucDUuZnJhbWVSYXRlKCkgOiAwO1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5hZnRlckRyYXdDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5wNS5hZnRlclVzZXJEcmF3KCk7XG4gIHRoaXMucDUuYWZ0ZXJSZWRyYXcoKTtcbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuYWZ0ZXJTZXR1cENvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnA1Ll9zZXR1cEVwaWxvZ3VlKCk7XG59O1xuIiwiLy8ganNoaW50IGlnbm9yZTogc3RhcnRcbi8qXG4gKiBPdmVycmlkZSBTcHJpdGUuQUFCQm9wcyBzbyBpdCBjYW4gYmUgY2FsbGVkIGFzIGEgc3RhdGVmdWwgbmF0aXZlRnVuYyBieSB0aGVcbiAqIGludGVycHJldGVyLiBUaGlzIGVuYWJsZXMgdGhlIG5hdGl2ZSBtZXRob2QgdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHNvXG4gKiB0aGF0IGl0IGNhbiBnbyBhc3luY2hyb25vdXMgZXZlcnkgdGltZSBpdCB3YW50cyB0byBleGVjdXRlIGEgY2FsbGJhY2sgYmFja1xuICogaW50byBpbnRlcnByZXRlciBjb2RlLiBUaGUgaW50ZXJwcmV0ZXIgc3RhdGUgb2JqZWN0IGlzIHJldHJpZXZlZCBieSBjYWxsaW5nXG4gKiBqc0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpLlxuICpcbiAqIEFkZGl0aW9uYWwgcHJvcGVydGllcyBjYW4gYmUgc2V0IG9uIHRoZSBzdGF0ZSBvYmplY3QgdG8gdHJhY2sgc3RhdGUgYWNyb3NzXG4gKiB0aGUgbXVsdGlwbGUgZXhlY3V0aW9ucy4gSWYgdGhlIGZ1bmN0aW9uIHdhbnRzIHRvIGJlIGNhbGxlZCBhZ2FpbiwgaXQgc2hvdWxkXG4gKiBzZXQgc3RhdGUuZG9uZUV4ZWMgdG8gZmFsc2UuIFdoZW4gdGhlIGZ1bmN0aW9uIGlzIGNvbXBsZXRlIGFuZCBubyBsb25nZXJcbiAqIHdhbnRzIHRvIGJlIGNhbGxlZCBpbiBhIGxvb3AgYnkgdGhlIGludGVycHJldGVyLCBpdCBzaG91bGQgc2V0IHN0YXRlLmRvbmVFeGVjXG4gKiB0byB0cnVlIGFuZCByZXR1cm4gYSB2YWx1ZS5cbiAqL1xuXG52YXIganNJbnRlcnByZXRlcjtcblxubW9kdWxlLmV4cG9ydHMuaW5qZWN0SlNJbnRlcnByZXRlciA9IGZ1bmN0aW9uIChqc2kpIHtcbiAganNJbnRlcnByZXRlciA9IGpzaTtcbn07XG5cbi8qXG4gKiBDb3BpZWQgY29kZSBmcm9tIHA1cGxheSBmcm9tIFNwcml0ZSgpIHdpdGggdGFyZ2V0ZWQgbW9kaWZpY2F0aW9ucyB0aGF0XG4gKiB1c2UgdGhlIGFkZGl0aW9uYWwgc3RhdGUgcGFyYW1ldGVyXG4gKi9cbm1vZHVsZS5leHBvcnRzLkFBQkJvcHMgPSBmdW5jdGlvbih0eXBlLCB0YXJnZXQsIGNhbGxiYWNrKSB7XG5cbiAgdmFyIHN0YXRlID0ganNJbnRlcnByZXRlci5nZXRDdXJyZW50U3RhdGUoKTtcbiAgaWYgKHN0YXRlLl9fc3ViU3RhdGUpIHtcbiAgICAvLyBJZiB3ZSdyZSBiZWluZyBjYWxsZWQgYnkgYW5vdGhlciBzdGF0ZWZ1bCBmdW5jdGlvbiB0aGF0IGh1bmcgYSBfX3N1YlN0YXRlXG4gICAgLy8gb2ZmIG9mIHN0YXRlLCB1c2UgdGhhdCBpbnN0ZWFkOlxuICAgIHN0YXRlID0gc3RhdGUuX19zdWJTdGF0ZTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIGlmICh0eXBlb2Ygc3RhdGUuX19pID09PSAndW5kZWZpbmVkJykge1xuICAgIHN0YXRlLl9faSA9IDA7XG5cbiAgICB0aGlzLnRvdWNoaW5nLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLnRvdWNoaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy50b3VjaGluZy50b3AgPSBmYWxzZTtcbiAgICB0aGlzLnRvdWNoaW5nLmJvdHRvbSA9IGZhbHNlO1xuXG4gICAgLy9pZiBzaW5nbGUgc3ByaXRlIHR1cm4gaW50byBhcnJheSBhbnl3YXlcbiAgICBzdGF0ZS5fX290aGVycyA9IFtdO1xuXG4gICAgaWYodGFyZ2V0IGluc3RhbmNlb2YgU3ByaXRlKVxuICAgICAgc3RhdGUuX19vdGhlcnMucHVzaCh0YXJnZXQpO1xuICAgIGVsc2UgaWYodGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpXG4gICAge1xuICAgICAgaWYocXVhZFRyZWUgIT0gdW5kZWZpbmVkICYmIHF1YWRUcmVlLmFjdGl2ZSlcbiAgICAgICAgc3RhdGUuX19vdGhlcnMgPSBxdWFkVHJlZS5yZXRyaWV2ZUZyb21Hcm91cCggdGhpcywgdGFyZ2V0KTtcblxuICAgICAgaWYoc3RhdGUuX19vdGhlcnMubGVuZ3RoID09IDApXG4gICAgICAgIHN0YXRlLl9fb3RoZXJzID0gdGFyZ2V0O1xuXG4gICAgfVxuICAgIGVsc2VcbiAgICAgIHRocm93KFwiRXJyb3I6IG92ZXJsYXAgY2FuIG9ubHkgYmUgY2hlY2tlZCBiZXR3ZWVuIHNwcml0ZXMgb3IgZ3JvdXBzXCIpO1xuXG4gIH0gZWxzZSB7XG4gICAgc3RhdGUuX19pKys7XG4gIH1cbiAgaWYgKHN0YXRlLl9faSA8IHN0YXRlLl9fb3RoZXJzLmxlbmd0aCkge1xuICAgIHZhciBpID0gc3RhdGUuX19pO1xuXG4gICAgaWYodGhpcyAhPSBzdGF0ZS5fX290aGVyc1tpXSAmJiAhdGhpcy5yZW1vdmVkKSAvL3lvdSBjYW4gY2hlY2sgY29sbGlzaW9ucyB3aXRoaW4gdGhlIHNhbWUgZ3JvdXAgYnV0IG5vdCBvbiBpdHNlbGZcbiAgICB7XG4gICAgICB2YXIgb3RoZXIgPSBzdGF0ZS5fX290aGVyc1tpXTtcblxuICAgICAgaWYodGhpcy5jb2xsaWRlciA9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdENvbGxpZGVyKCk7XG5cbiAgICAgIGlmKG90aGVyLmNvbGxpZGVyID09IHVuZGVmaW5lZClcbiAgICAgICAgb3RoZXIuc2V0RGVmYXVsdENvbGxpZGVyKCk7XG5cbiAgICAgIC8qXG4gICAgICBpZih0aGlzLmNvbGxpZGVyVHlwZT09XCJkZWZhdWx0XCIgJiYgYW5pbWF0aW9uc1tjdXJyZW50QW5pbWF0aW9uXSE9bnVsbClcbiAgICAgIHtcbiAgICAgICAgcHJpbnQoXCJidXN0ZWRcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0qL1xuICAgICAgaWYodGhpcy5jb2xsaWRlciAhPSB1bmRlZmluZWQgJiYgb3RoZXIuY29sbGlkZXIgIT0gdW5kZWZpbmVkKVxuICAgICAge1xuICAgICAgaWYodHlwZT09XCJvdmVybGFwXCIpICB7XG4gICAgICAgICAgdmFyIG92ZXI7XG5cbiAgICAgICAgICAvL2lmIHRoZSBvdGhlciBpcyBhIGNpcmNsZSBJIGNhbGN1bGF0ZSB0aGUgZGlzcGxhY2VtZW50IGZyb20gaGVyZVxuICAgICAgICAgIGlmKHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcbiAgICAgICAgICAgICAgb3ZlciA9IG90aGVyLmNvbGxpZGVyLm92ZXJsYXAodGhpcy5jb2xsaWRlcik7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBvdmVyID0gdGhpcy5jb2xsaWRlci5vdmVybGFwKG90aGVyLmNvbGxpZGVyKTtcblxuICAgICAgICAgIGlmKG92ZXIpXG4gICAgICAgICAge1xuXG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZihjYWxsYmFjayAhPSB1bmRlZmluZWQgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzLCBvdGhlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBlbHNlIGlmKHR5cGU9PVwiY29sbGlkZVwiIHx8IHR5cGUgPT0gXCJib3VuY2VcIilcbiAgICAgICAge1xuICAgICAgICAgIHZhciBkaXNwbGFjZW1lbnQgPSBjcmVhdGVWZWN0b3IoMCwwKTtcblxuICAgICAgICAgIC8vaWYgdGhlIHN1bSBvZiB0aGUgc3BlZWQgaXMgbW9yZSB0aGFuIHRoZSBjb2xsaWRlciBpIG1heVxuICAgICAgICAgIC8vaGF2ZSBhIHR1bm5lbGxpbmcgcHJvYmxlbVxuICAgICAgICAgIHZhciB0dW5uZWxYID0gYWJzKHRoaXMudmVsb2NpdHkueC1vdGhlci52ZWxvY2l0eS54KSA+PSBvdGhlci5jb2xsaWRlci5leHRlbnRzLngvMiAmJiByb3VuZCh0aGlzLmRlbHRhWCAtIHRoaXMudmVsb2NpdHkueCkgPT0gMDtcblxuICAgICAgICAgIHZhciB0dW5uZWxZID0gYWJzKHRoaXMudmVsb2NpdHkueS1vdGhlci52ZWxvY2l0eS55KSA+PSAgb3RoZXIuY29sbGlkZXIuc2l6ZSgpLnkvMiAgJiYgcm91bmQodGhpcy5kZWx0YVkgLSB0aGlzLnZlbG9jaXR5LnkpID09IDA7XG5cblxuICAgICAgICAgIGlmKHR1bm5lbFggfHwgdHVubmVsWSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvL2luc3RlYWQgb2YgdXNpbmcgdGhlIGNvbGxpZGVycyBJIHVzZSB0aGUgYm91bmRpbmcgYm94XG4gICAgICAgICAgICAvL2Fyb3VuZCB0aGUgcHJldmlvdXMgcG9zaXRpb24gYW5kIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgIC8vdGhpcyBpcyByZWdhcmRsZXNzIG9mIHRoZSBjb2xsaWRlciB0eXBlXG5cbiAgICAgICAgICAgIC8vdGhlIGNlbnRlciBpcyB0aGUgYXZlcmFnZSBvZiB0aGUgY29sbCBjZW50ZXJzXG4gICAgICAgICAgICB2YXIgYyA9IGNyZWF0ZVZlY3RvcihcbiAgICAgICAgICAgICAgKHRoaXMucG9zaXRpb24ueCt0aGlzLnByZXZpb3VzUG9zaXRpb24ueCkvMixcbiAgICAgICAgICAgICAgKHRoaXMucG9zaXRpb24ueSt0aGlzLnByZXZpb3VzUG9zaXRpb24ueSkvMik7XG5cbiAgICAgICAgICAgIC8vdGhlIGV4dGVudHMgYXJlIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjb2xsIGNlbnRlcnNcbiAgICAgICAgICAgIC8vcGx1cyB0aGUgZXh0ZW50cyBvZiBib3RoXG4gICAgICAgICAgICB2YXIgZSA9IGNyZWF0ZVZlY3RvcihcbiAgICAgICAgICAgICAgYWJzKHRoaXMucG9zaXRpb24ueCAtdGhpcy5wcmV2aW91c1Bvc2l0aW9uLngpICsgdGhpcy5jb2xsaWRlci5leHRlbnRzLngsXG4gICAgICAgICAgICAgIGFicyh0aGlzLnBvc2l0aW9uLnkgLXRoaXMucHJldmlvdXNQb3NpdGlvbi55KSArIHRoaXMuY29sbGlkZXIuZXh0ZW50cy55KTtcblxuICAgICAgICAgICAgdmFyIGJib3ggPSBuZXcgQUFCQihjLCBlLCB0aGlzLmNvbGxpZGVyLm9mZnNldCk7XG5cbiAgICAgICAgICAgIC8vYmJveC5kcmF3KCk7XG5cbiAgICAgICAgICAgIGlmKGJib3gub3ZlcmxhcChvdGhlci5jb2xsaWRlcikpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlmKHR1bm5lbFgpIHtcblxuICAgICAgICAgICAgICAgIC8vZW50ZXJpbmcgZnJvbSB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICBpZih0aGlzLnZlbG9jaXR5LnggPCAwKVxuICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50LnggPSBvdGhlci5jb2xsaWRlci5yaWdodCgpIC0gdGhpcy5jb2xsaWRlci5sZWZ0KCkgKyAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYodGhpcy52ZWxvY2l0eS54ID4gMCApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueCA9IG90aGVyLmNvbGxpZGVyLmxlZnQoKSAtIHRoaXMuY29sbGlkZXIucmlnaHQoKSAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYodHVubmVsWSkge1xuICAgICAgICAgICAgICAgIC8vZnJvbSB0b3BcbiAgICAgICAgICAgICAgICBpZih0aGlzLnZlbG9jaXR5LnkgPiAwKVxuICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50LnkgPSBvdGhlci5jb2xsaWRlci50b3AoKSAtIHRoaXMuY29sbGlkZXIuYm90dG9tKCkgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYodGhpcy52ZWxvY2l0eS55IDwgMCApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueSA9IG90aGVyLmNvbGxpZGVyLmJvdHRvbSgpIC0gdGhpcy5jb2xsaWRlci50b3AoKSArIDE7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0vL2VuZCBvdmVybGFwXG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSAvL25vbiB0dW5uZWwgb3ZlcmxhcFxuICAgICAgICAgIHtcblxuICAgICAgICAgICAgLy9pZiB0aGUgb3RoZXIgaXMgYSBjaXJjbGUgSSBjYWxjdWxhdGUgdGhlIGRpc3BsYWNlbWVudCBmcm9tIGhlcmVcbiAgICAgICAgICAgIC8vYW5kIHJldmVyc2UgaXRcbiAgICAgICAgICAgIGlmKHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQgPSBvdGhlci5jb2xsaWRlci5jb2xsaWRlKHRoaXMuY29sbGlkZXIpLm11bHQoLTEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IHRoaXMuY29sbGlkZXIuY29sbGlkZShvdGhlci5jb2xsaWRlcik7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA9PSAwICYmICBkaXNwbGFjZW1lbnQueSA9PSAwIClcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICB7XG5cbiAgICAgICAgICAgIGlmKCF0aGlzLmltbW92YWJsZSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi5hZGQoZGlzcGxhY2VtZW50KTtcbiAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgdGhpcy5uZXdQb3NpdGlvbiA9IGNyZWF0ZVZlY3Rvcih0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID4gMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54IDwgMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueSA8IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcuYm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC55ID4gMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy50b3AgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZih0eXBlID09IFwiYm91bmNlXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlmKG90aGVyLmltbW92YWJsZSlcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxYMSA9IC10aGlzLnZlbG9jaXR5Lngrb3RoZXIudmVsb2NpdHkueDtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWTEgPSAtdGhpcy52ZWxvY2l0eS55K290aGVyLnZlbG9jaXR5Lnk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWDEgPSAodGhpcy52ZWxvY2l0eS54ICogKHRoaXMubWFzcyAtIG90aGVyLm1hc3MpICsgKDIgKiBvdGhlci5tYXNzICogb3RoZXIudmVsb2NpdHkueCkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFkxID0gKHRoaXMudmVsb2NpdHkueSAqICh0aGlzLm1hc3MgLSBvdGhlci5tYXNzKSArICgyICogb3RoZXIubWFzcyAqIG90aGVyLnZlbG9jaXR5LnkpKSAvICh0aGlzLm1hc3MgKyBvdGhlci5tYXNzKTtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxYMiA9IChvdGhlci52ZWxvY2l0eS54ICogKG90aGVyLm1hc3MgLSB0aGlzLm1hc3MpICsgKDIgKiB0aGlzLm1hc3MgKiB0aGlzLnZlbG9jaXR5LngpKSAvICh0aGlzLm1hc3MgKyBvdGhlci5tYXNzKTtcblxuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxZMiA9IChvdGhlci52ZWxvY2l0eS55ICogKG90aGVyLm1hc3MgLSB0aGlzLm1hc3MpICsgKDIgKiB0aGlzLm1hc3MgKiB0aGlzLnZlbG9jaXR5LnkpKSAvICh0aGlzLm1hc3MgKyBvdGhlci5tYXNzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vdmFyIGJvdGhDaXJjbGVzID0gKHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlciAmJlxuICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICBvdGhlci5jb2xsaWRlciAgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcik7XG5cbiAgICAgICAgICAgICAgLy9pZih0aGlzLnRvdWNoaW5nLmxlZnQgfHwgdGhpcy50b3VjaGluZy5yaWdodCB8fCB0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG5cbiAgICAgICAgICAgICAgLy9wcmludChkaXNwbGFjZW1lbnQpO1xuXG4gICAgICAgICAgICAgIGlmKGFicyhkaXNwbGFjZW1lbnQueCk+YWJzKGRpc3BsYWNlbWVudC55KSlcbiAgICAgICAgICAgICAge1xuXG5cbiAgICAgICAgICAgICAgICBpZighdGhpcy5pbW1vdmFibGUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS54ID0gbmV3VmVsWDEqdGhpcy5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKCFvdGhlci5pbW1vdmFibGUpXG4gICAgICAgICAgICAgICAgICBvdGhlci52ZWxvY2l0eS54ID0gbmV3VmVsWDIqb3RoZXIucmVzdGl0dXRpb247XG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvL2lmKHRoaXMudG91Y2hpbmcudG9wIHx8IHRoaXMudG91Y2hpbmcuYm90dG9tIHx8IHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcbiAgICAgICAgICAgICAgaWYoYWJzKGRpc3BsYWNlbWVudC54KTxhYnMoZGlzcGxhY2VtZW50LnkpKVxuICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICBpZighdGhpcy5pbW1vdmFibGUpXG4gICAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnkgPSBuZXdWZWxZMSp0aGlzLnJlc3RpdHV0aW9uO1xuXG4gICAgICAgICAgICAgICAgaWYoIW90aGVyLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICAgIG90aGVyLnZlbG9jaXR5LnkgPSBuZXdWZWxZMipvdGhlci5yZXN0aXR1dGlvbjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9lbHNlIGlmKHR5cGUgPT0gXCJjb2xsaWRlXCIpXG4gICAgICAgICAgICAgIC8vdGhpcy52ZWxvY2l0eSA9IGNyZWF0ZVZlY3RvcigwLDApO1xuXG4gICAgICAgICAgICBpZihjYWxsYmFjayAhPSB1bmRlZmluZWQgJiYgdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzLCBvdGhlcik7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgfVxuXG5cblxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodHlwZT09XCJkaXNwbGFjZVwiKSAge1xuXG4gICAgICAgICAgLy9pZiB0aGUgb3RoZXIgaXMgYSBjaXJjbGUgSSBjYWxjdWxhdGUgdGhlIGRpc3BsYWNlbWVudCBmcm9tIGhlcmVcbiAgICAgICAgICAvL2FuZCByZXZlcnNlIGl0XG4gICAgICAgICAgaWYodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gb3RoZXIuY29sbGlkZXIuY29sbGlkZSh0aGlzLmNvbGxpZGVyKS5tdWx0KC0xKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkaXNwbGFjZW1lbnQgPSB0aGlzLmNvbGxpZGVyLmNvbGxpZGUob3RoZXIuY29sbGlkZXIpO1xuXG5cbiAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA9PSAwICYmICBkaXNwbGFjZW1lbnQueSA9PSAwIClcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICB7XG4gICAgICAgICAgICBvdGhlci5wb3NpdGlvbi5zdWIoZGlzcGxhY2VtZW50KTtcblxuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC55IDwgMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5ib3R0b20gPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnRvcCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKGNhbGxiYWNrICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIG90aGVyKTtcblxuICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0vL2VuZCBjb2xsaWRlciBleGlzdHNcbiAgICB9XG4gICAgLy8gTm90IGRvbmUsIHVubGVzcyB3ZSdyZSBvbiB0aGUgbGFzdCBpdGVtIGluIF9fb3RoZXJzOlxuICAgIHN0YXRlLmRvbmVFeGVjID0gc3RhdGUuX19pID49IChzdGF0ZS5fX290aGVycy5sZW5ndGggLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5kb25lRXhlYyA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiJdfQ==
