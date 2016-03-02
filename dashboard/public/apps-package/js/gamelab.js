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
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
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

  var renderCodeWorkspace = (function () {
    return codeWorkspaceEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        localeDirection: this.studioApp_.localeDirection(),
        extraControlRows: extraControlRows,
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: this.level.editCode,
        blockCounterClass: 'block-counter-default',
        pinWorkspaceToBottom: true,
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  }).bind(this);

  var renderVisualizationColumn = (function () {
    return visualizationColumnEjs({
      assetUrl: this.studioApp_.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: firstControlsRow,
        extraControlRows: extraControlRows,
        pinWorkspaceToBottom: true,
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  }).bind(this);

  var onMount = (function () {
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
  }).bind(this);

  React.render(React.createElement(AppView, {
    assetUrl: this.studioApp_.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
    onMount: onMount
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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../JsDebuggerUi":"/home/ubuntu/staging/apps/build/js/JsDebuggerUi.js","../JsInterpreterLogger":"/home/ubuntu/staging/apps/build/js/JsInterpreterLogger.js","../assetManagement/assetPrefix":"/home/ubuntu/staging/apps/build/js/assetManagement/assetPrefix.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./GameLabP5":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabP5.js","./GameLabSprite":"/home/ubuntu/staging/apps/build/js/gamelab/GameLabSprite.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/gamelab/visualization.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9HYW1lTGFiUDUuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWJTcHJpdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNyQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FB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LENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxFQUN2TSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN6QyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFDdkksRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekksRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3RHLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ3BGLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzVDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNsRixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3hELEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDekQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6RCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMxQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMzQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2hFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDaEUsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUs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LGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdEYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNwSCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3RGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNqRyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakosRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMvRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3JGLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVB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QUFHLElBQUksQ0FBQztBQUM1QixrQkFBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDOUIsa0JBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQzs7QUFFM0Isa0JBQUcsUUFBUSxJQUFJLFNBQVMsSUFBSSxPQUFPLFFBQVEsSUFBSSxVQUFVLEVBQ3ZELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsb0JBQU0sR0FBRyxJQUFJLENBQUM7YUFDZjtXQUNGO1NBQ0Y7T0FDRjs7QUFFRCxTQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUssS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLENBQUM7R0FDM0QsTUFBTTtBQUNMLFNBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0dBQ3ZCOztBQUVELFNBQU8sTUFBTSxDQUFDO0NBQ2YsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxud2luZG93LmdhbWVsYWJNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICB2YXIgZ2FtZWxhYiA9IG5ldyBHYW1lTGFiKCk7XG5cbiAgZ2FtZWxhYi5pbmplY3RTdHVkaW9BcHAoc3R1ZGlvQXBwKTtcbiAgYXBwTWFpbihnYW1lbGFiLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiIsInZhciBza2luQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG5cbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLyoqXG4gKiBDRE8gQXBwOiBHYW1lTGFiXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgQ29kZS5vcmdcbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG5cbnZhciBHYW1lTGFiID0gcmVxdWlyZSgnLi9HYW1lTGFiJyk7XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcblxuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICAvLyBCbG9jayBkZWZpbml0aW9ucy5cbiAgYmxvY2tseS5CbG9ja3MuZ2FtZWxhYl9mb28gPSB7XG4gICAgLy8gQmxvY2sgZm9yIGZvby5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZm9vKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZm9vVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmdhbWVsYWJfZm9vID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGZvby5cbiAgICByZXR1cm4gJ0dhbWVMYWIuZm9vKCk7XFxuJztcbiAgfTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgYXBpSmF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdCcpO1xudmFyIGNvZGVXb3Jrc3BhY2VFanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvY29kZVdvcmtzcGFjZS5odG1sLmVqcycpO1xudmFyIHZpc3VhbGl6YXRpb25Db2x1bW5FanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdmlzdWFsaXphdGlvbkNvbHVtbi5odG1sLmVqcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgZHJvcGxldENvbmZpZyA9IHJlcXVpcmUoJy4vZHJvcGxldENvbmZpZycpO1xudmFyIEpzRGVidWdnZXJVaSA9IHJlcXVpcmUoJy4uL0pzRGVidWdnZXJVaScpO1xudmFyIEpTSW50ZXJwcmV0ZXIgPSByZXF1aXJlKCcuLi9KU0ludGVycHJldGVyJyk7XG52YXIgSnNJbnRlcnByZXRlckxvZ2dlciA9IHJlcXVpcmUoJy4uL0pzSW50ZXJwcmV0ZXJMb2dnZXInKTtcbnZhciBHYW1lTGFiUDUgPSByZXF1aXJlKCcuL0dhbWVMYWJQNScpO1xudmFyIGdhbWVMYWJTcHJpdGUgPSByZXF1aXJlKCcuL0dhbWVMYWJTcHJpdGUnKTtcbnZhciBhc3NldFByZWZpeCA9IHJlcXVpcmUoJy4uL2Fzc2V0TWFuYWdlbWVudC9hc3NldFByZWZpeCcpO1xudmFyIEFwcFZpZXcgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvQXBwVmlldy5qc3gnKTtcblxudmFyIE1BWF9JTlRFUlBSRVRFUl9TVEVQU19QRVJfVElDSyA9IDUwMDAwMDtcblxuLyoqXG4gKiBBbiBpbnN0YW50aWFibGUgR2FtZUxhYiBjbGFzc1xuICovXG52YXIgR2FtZUxhYiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5za2luID0gbnVsbDtcbiAgdGhpcy5sZXZlbCA9IG51bGw7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG5cbiAgLyoqIEB0eXBlIHtTdHVkaW9BcHB9ICovXG4gIHRoaXMuc3R1ZGlvQXBwXyA9IG51bGw7XG5cbiAgLyoqIEB0eXBlIHtKU0ludGVycHJldGVyfSAqL1xuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBudWxsO1xuXG4gIC8qKiBAcHJpdmF0ZSB7SnNJbnRlcnByZXRlckxvZ2dlcn0gKi9cbiAgdGhpcy5jb25zb2xlTG9nZ2VyXyA9IG5ldyBKc0ludGVycHJldGVyTG9nZ2VyKHdpbmRvdy5jb25zb2xlKTtcblxuICAvKiogQHR5cGUge0pzRGVidWdnZXJVaX0gKi9cbiAgdGhpcy5kZWJ1Z2dlcl8gPSBuZXcgSnNEZWJ1Z2dlclVpKHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHRoaXMuR2xvYmFscyA9IHt9O1xuICB0aGlzLmN1cnJlbnRDbWRRdWV1ZSA9IG51bGw7XG4gIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgdGhpcy5zZXR1cEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgdGhpcy5zdGFydGVkSGFuZGxpbmdFdmVudHMgPSBmYWxzZTtcbiAgdGhpcy5nYW1lTGFiUDUgPSBuZXcgR2FtZUxhYlA1KCk7XG4gIHRoaXMuYXBpID0gYXBpO1xuICB0aGlzLmFwaS5pbmplY3RHYW1lTGFiKHRoaXMpO1xuICB0aGlzLmFwaUpTID0gYXBpSmF2YXNjcmlwdDtcbiAgdGhpcy5hcGlKUy5pbmplY3RHYW1lTGFiKHRoaXMpO1xuXG4gIGRyb3BsZXRDb25maWcuaW5qZWN0R2FtZUxhYih0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUxhYjtcblxuLyoqXG4gKiBJbmplY3QgdGhlIHN0dWRpb0FwcCBzaW5nbGV0b24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluamVjdFN0dWRpb0FwcCA9IGZ1bmN0aW9uIChzdHVkaW9BcHApIHtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQgPSBfLmJpbmQodGhpcy5yZXNldCwgdGhpcyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5ydW5CdXR0b25DbGljayA9IF8uYmluZCh0aGlzLnJ1bkJ1dHRvbkNsaWNrLCB0aGlzKTtcblxuICB0aGlzLnN0dWRpb0FwcF8uc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcbn07XG5cbkdhbWVMYWIuYmFzZVA1bG9hZEltYWdlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoaXMgR2FtZUxhYiBpbnN0YW5jZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gIGlmICghdGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZUxhYiByZXF1aXJlcyBhIFN0dWRpb0FwcFwiKTtcbiAgfVxuXG4gIHRoaXMuc2tpbiA9IGNvbmZpZy5za2luO1xuICB0aGlzLmxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy51c2VzQXNzZXRzID0gdHJ1ZTtcblxuICB0aGlzLmdhbWVMYWJQNS5pbml0KHtcbiAgICBnYW1lTGFiOiB0aGlzLFxuICAgIG9uRXhlY3V0aW9uU3RhcnRpbmc6IHRoaXMub25QNUV4ZWN1dGlvblN0YXJ0aW5nLmJpbmQodGhpcyksXG4gICAgb25QcmVsb2FkOiB0aGlzLm9uUDVQcmVsb2FkLmJpbmQodGhpcyksXG4gICAgb25TZXR1cDogdGhpcy5vblA1U2V0dXAuYmluZCh0aGlzKSxcbiAgICBvbkRyYXc6IHRoaXMub25QNURyYXcuYmluZCh0aGlzKVxuICB9KTtcblxuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG4gIGNvbmZpZy5hcHBNc2cgPSBtc2c7XG5cbiAgdmFyIHNob3dGaW5pc2hCdXR0b24gPSAhdGhpcy5sZXZlbC5pc1Byb2plY3RMZXZlbDtcbiAgdmFyIGZpbmlzaEJ1dHRvbkZpcnN0TGluZSA9IF8uaXNFbXB0eSh0aGlzLmxldmVsLnNvZnRCdXR0b25zKTtcbiAgdmFyIGFyZUJyZWFrcG9pbnRzRW5hYmxlZCA9IHRydWU7XG4gIHZhciBmaXJzdENvbnRyb2xzUm93ID0gcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGZpbmlzaEJ1dHRvbjogZmluaXNoQnV0dG9uRmlyc3RMaW5lICYmIHNob3dGaW5pc2hCdXR0b25cbiAgfSk7XG4gIHZhciBleHRyYUNvbnRyb2xSb3dzID0gdGhpcy5kZWJ1Z2dlcl8uZ2V0TWFya3VwKHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCwge1xuICAgIHNob3dCdXR0b25zOiB0cnVlLFxuICAgIHNob3dDb25zb2xlOiB0cnVlXG4gIH0pO1xuXG4gIHZhciByZW5kZXJDb2RlV29ya3NwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjb2RlV29ya3NwYWNlRWpzKHtcbiAgICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvY2FsZURpcmVjdGlvbjogdGhpcy5zdHVkaW9BcHBfLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkZWFsQmxvY2tOdW1iZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIGVkaXRDb2RlOiB0aGlzLmxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgICBwaW5Xb3Jrc3BhY2VUb0JvdHRvbTogdHJ1ZSxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdmFyIHJlbmRlclZpc3VhbGl6YXRpb25Db2x1bW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZpc3VhbGl6YXRpb25Db2x1bW5FanMoe1xuICAgICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgY29udHJvbHM6IGZpcnN0Q29udHJvbHNSb3csXG4gICAgICAgIGV4dHJhQ29udHJvbFJvd3M6IGV4dHJhQ29udHJvbFJvd3MsXG4gICAgICAgIHBpbldvcmtzcGFjZVRvQm90dG9tOiB0cnVlLFxuICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0uYmluZCh0aGlzKTtcblxuICB2YXIgb25Nb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25maWcubG9hZEF1ZGlvID0gdGhpcy5sb2FkQXVkaW9fLmJpbmQodGhpcyk7XG4gICAgY29uZmlnLmFmdGVySW5qZWN0ID0gdGhpcy5hZnRlckluamVjdF8uYmluZCh0aGlzLCBjb25maWcpO1xuICAgIGNvbmZpZy5hZnRlckVkaXRvclJlYWR5ID0gdGhpcy5hZnRlckVkaXRvclJlYWR5Xy5iaW5kKHRoaXMsIGFyZUJyZWFrcG9pbnRzRW5hYmxlZCk7XG5cbiAgICAvLyBTdG9yZSBwNXNwZWNpYWxGdW5jdGlvbnMgaW4gdGhlIHVudXNlZENvbmZpZyBhcnJheSBzbyB3ZSBkb24ndCBnaXZlIHdhcm5pbmdzXG4gICAgLy8gYWJvdXQgdGhlc2UgZnVuY3Rpb25zIG5vdCBiZWluZyBjYWxsZWQ6XG4gICAgY29uZmlnLnVudXNlZENvbmZpZyA9IHRoaXMuZ2FtZUxhYlA1LnA1c3BlY2lhbEZ1bmN0aW9ucztcblxuICAgIHRoaXMuc3R1ZGlvQXBwXy5pbml0KGNvbmZpZyk7XG5cbiAgICB0aGlzLmRlYnVnZ2VyXy5pbml0aWFsaXplQWZ0ZXJEb21DcmVhdGVkKHtcbiAgICAgIGRlZmF1bHRTdGVwU3BlZWQ6IDFcbiAgICB9KTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEFwcFZpZXcsIHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGlzRW1iZWRWaWV3OiAhIWNvbmZpZy5lbWJlZCxcbiAgICBpc1NoYXJlVmlldzogISFjb25maWcuc2hhcmUsXG4gICAgcmVuZGVyQ29kZVdvcmtzcGFjZTogcmVuZGVyQ29kZVdvcmtzcGFjZSxcbiAgICByZW5kZXJWaXN1YWxpemF0aW9uQ29sdW1uOiByZW5kZXJWaXN1YWxpemF0aW9uQ29sdW1uLFxuICAgIG9uTW91bnQ6IG9uTW91bnRcbiAgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5jb250YWluZXJJZCkpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUubG9hZEF1ZGlvXyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4ud2luU291bmQsICd3aW4nKTtcbiAgdGhpcy5zdHVkaW9BcHBfLmxvYWRBdWRpbyh0aGlzLnNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbn07XG5cbi8qKlxuICogQ29kZSBjYWxsZWQgYWZ0ZXIgdGhlIGJsb2NrbHkgZGl2ICsgYmxvY2tseSBjb3JlIGlzIGluamVjdGVkIGludG8gdGhlIGRvY3VtZW50XG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmFmdGVySW5qZWN0XyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyBBZGQgdG8gcmVzZXJ2ZWQgd29yZCBsaXN0OiBBUEksIGxvY2FsIHZhcmlhYmxlcyBpbiBleGVjdXRpb24gZXZpcm9ubWVudFxuICAgIC8vIChleGVjdXRlKSBhbmQgdGhlIGluZmluaXRlIGxvb3AgZGV0ZWN0aW9uIGZ1bmN0aW9uLlxuICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5hZGRSZXNlcnZlZFdvcmRzKCdHYW1lTGFiLGNvZGUnKTtcbiAgfVxuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgZGl2R2FtZUxhYi5zdHlsZS53aWR0aCA9ICc0MDBweCc7XG4gIGRpdkdhbWVMYWIuc3R5bGUuaGVpZ2h0ID0gJzQwMHB4JztcblxufTtcblxuLyoqXG4gKiBJbml0aWFsaXphdGlvbiB0byBydW4gYWZ0ZXIgYWNlL2Ryb3BsZXQgaXMgaW5pdGlhbGl6ZWQuXG4gKiBAcGFyYW0geyFib29sZWFufSBhcmVCcmVha3BvaW50c0VuYWJsZWRcbiAqIEBwcml2YXRlXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmFmdGVyRWRpdG9yUmVhZHlfID0gZnVuY3Rpb24gKGFyZUJyZWFrcG9pbnRzRW5hYmxlZCkge1xuICBpZiAoYXJlQnJlYWtwb2ludHNFbmFibGVkKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLmVuYWJsZUJyZWFrcG9pbnRzKCk7XG4gIH1cbn07XG5cbi8qKlxuICogUmVzZXQgR2FtZUxhYiB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaWdub3JlIFJlcXVpcmVkIGJ5IHRoZSBBUEkgYnV0IGlnbm9yZWQgYnkgdGhpc1xuICogICAgIGltcGxlbWVudGF0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uIChpZ25vcmUpIHtcblxuICB0aGlzLmV2ZW50SGFuZGxlcnMgPSB7fTtcbiAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy50aWNrSW50ZXJ2YWxJZCk7XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSAwO1xuICB0aGlzLnRpY2tDb3VudCA9IDA7XG5cbiAgLypcbiAgdmFyIGRpdkdhbWVMYWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2R2FtZUxhYicpO1xuICB3aGlsZSAoZGl2R2FtZUxhYi5maXJzdENoaWxkKSB7XG4gICAgZGl2R2FtZUxhYi5yZW1vdmVDaGlsZChkaXZHYW1lTGFiLmZpcnN0Q2hpbGQpO1xuICB9XG4gICovXG5cbiAgdGhpcy5nYW1lTGFiUDUucmVzZXRFeGVjdXRpb24oKTtcbiAgXG4gIC8vIEltcG9ydCB0byByZXNldCB0aGVzZSBhZnRlciB0aGlzLmdhbWVMYWJQNSBoYXMgYmVlbiByZXNldFxuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzID0gZmFsc2U7XG5cbiAgdGhpcy5kZWJ1Z2dlcl8uZGV0YWNoKCk7XG4gIHRoaXMuY29uc29sZUxvZ2dlcl8uZGV0YWNoKCk7XG5cbiAgLy8gRGlzY2FyZCB0aGUgaW50ZXJwcmV0ZXIuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZGVpbml0aWFsaXplKCk7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgfVxuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBHYW1lTGFiOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBSZXNldCBhbGwgc3RhdGUuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJlxuICAgICAgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuZ2FtZUxhYlA1LnN0YXJ0RXhlY3V0aW9uKCk7XG5cbiAgaWYgKCF0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuICB9XG5cbiAgLy8gU2V0IHRvIDFtcyBpbnRlcnZhbCwgYnV0IG5vdGUgdGhhdCBicm93c2VyIG1pbmltdW1zIGFyZSBhY3R1YWxseSA1LTE2bXM6XG4gIHRoaXMudGlja0ludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoXy5iaW5kKHRoaXMub25UaWNrLCB0aGlzKSwgMSk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5pbml0SW50ZXJwcmV0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuSlNJbnRlcnByZXRlciA9IG5ldyBKU0ludGVycHJldGVyKHtcbiAgICBzdHVkaW9BcHA6IHRoaXMuc3R1ZGlvQXBwXyxcbiAgICBtYXhJbnRlcnByZXRlclN0ZXBzUGVyVGljazogTUFYX0lOVEVSUFJFVEVSX1NURVBTX1BFUl9USUNLLFxuICAgIGN1c3RvbU1hcnNoYWxHbG9iYWxQcm9wZXJ0aWVzOiB0aGlzLmdhbWVMYWJQNS5nZXRDdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllcygpXG4gIH0pO1xuICB0aGlzLkpTSW50ZXJwcmV0ZXIub25FeGVjdXRpb25FcnJvci5yZWdpc3Rlcih0aGlzLmhhbmRsZUV4ZWN1dGlvbkVycm9yLmJpbmQodGhpcykpO1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmF0dGFjaFRvKHRoaXMuSlNJbnRlcnByZXRlcik7XG4gIHRoaXMuZGVidWdnZXJfLmF0dGFjaFRvKHRoaXMuSlNJbnRlcnByZXRlcik7XG4gIHRoaXMuSlNJbnRlcnByZXRlci5wYXJzZSh7XG4gICAgY29kZTogdGhpcy5zdHVkaW9BcHBfLmdldENvZGUoKSxcbiAgICBibG9ja3M6IGRyb3BsZXRDb25maWcuYmxvY2tzLFxuICAgIGJsb2NrRmlsdGVyOiB0aGlzLmxldmVsLmV4ZWN1dGVQYWxldHRlQXBpc09ubHkgJiYgdGhpcy5sZXZlbC5jb2RlRnVuY3Rpb25zLFxuICAgIGVuYWJsZUV2ZW50czogdHJ1ZVxuICB9KTtcbiAgaWYgKCF0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGdhbWVMYWJTcHJpdGUuaW5qZWN0SlNJbnRlcnByZXRlcih0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuXG4gIHRoaXMuZ2FtZUxhYlA1LnA1c3BlY2lhbEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICB2YXIgZnVuYyA9IHRoaXMuSlNJbnRlcnByZXRlci5maW5kR2xvYmFsRnVuY3Rpb24oZXZlbnROYW1lKTtcbiAgICBpZiAoZnVuYykge1xuICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0gPVxuICAgICAgICAgIGNvZGVnZW4uY3JlYXRlTmF0aXZlRnVuY3Rpb25Gcm9tSW50ZXJwcmV0ZXJGdW5jdGlvbihmdW5jKTtcbiAgICB9XG4gIH0sIHRoaXMpO1xuXG4gIGNvZGVnZW4uY3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSB0aGlzLmdhbWVMYWJQNS5nZXRDdXN0b21NYXJzaGFsT2JqZWN0TGlzdCgpO1xuXG4gIHZhciBwcm9wTGlzdCA9IHRoaXMuZ2FtZUxhYlA1LmdldEdsb2JhbFByb3BlcnR5TGlzdCgpO1xuICBmb3IgKHZhciBwcm9wIGluIHByb3BMaXN0KSB7XG4gICAgLy8gRWFjaCBlbnRyeSBpbiB0aGUgcHJvcExpc3QgaXMgYW4gYXJyYXkgd2l0aCAyIGVsZW1lbnRzOlxuICAgIC8vIHByb3BMaXN0SXRlbVswXSAtIGEgbmF0aXZlIHByb3BlcnR5IHZhbHVlXG4gICAgLy8gcHJvcExpc3RJdGVtWzFdIC0gdGhlIHByb3BlcnR5J3MgcGFyZW50IG9iamVjdFxuICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eShcbiAgICAgICAgcHJvcCxcbiAgICAgICAgcHJvcExpc3RbcHJvcF1bMF0sXG4gICAgICAgIHByb3BMaXN0W3Byb3BdWzFdKTtcbiAgfVxuXG4gIC8qXG4gIGlmICh0aGlzLmNoZWNrRm9yRWRpdENvZGVQcmVFeGVjdXRpb25GYWlsdXJlKCkpIHtcbiAgIHJldHVybiB0aGlzLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuICAqL1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpY2tDb3VudCsrO1xuXG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuZXhlY3V0ZUludGVycHJldGVyKCk7XG5cbiAgICBpZiAoIXRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzICYmIHRoaXMuSlNJbnRlcnByZXRlci5zdGFydGVkSGFuZGxpbmdFdmVudHMpIHtcbiAgICAgIC8vIENhbGwgdGhpcyBvbmNlIGFmdGVyIHdlJ3ZlIHN0YXJ0ZWQgaGFuZGxpbmcgZXZlbnRzXG4gICAgICB0aGlzLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyA9IHRydWU7XG4gICAgICB0aGlzLmdhbWVMYWJQNS5ub3RpZnlVc2VyR2xvYmFsQ29kZUNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5jb21wbGV0ZVNldHVwSWZTZXR1cENvbXBsZXRlKCk7XG4gICAgdGhpcy5jb21wbGV0ZVJlZHJhd0lmRHJhd0NvbXBsZXRlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gc3RhcnRFeGVjdXRpb24oKS4gV2UgdXNlIHRoZVxuICogb3Bwb3J0dW5pdHkgdG8gY3JlYXRlIG5hdGl2ZSBldmVudCBoYW5kbGVycyB0aGF0IGNhbGwgZG93biBpbnRvIGludGVycHJldGVyXG4gKiBjb2RlIGZvciBlYWNoIGV2ZW50IG5hbWUuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUDVFeGVjdXRpb25TdGFydGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5nYW1lTGFiUDUucDVldmVudE5hbWVzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgIHdpbmRvd1tldmVudE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnROYW1lXS5hcHBseShudWxsKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG4gIH0sIHRoaXMpO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCB3aGlsZSB0aGlzLmdhbWVMYWJQNSBpcyBpbiB0aGUgcHJlbG9hZCBwaGFzZS4gV2UgaW5pdGlhbGl6ZVxuICogdGhlIGludGVycHJldGVyLCBzdGFydCBpdHMgZXhlY3V0aW9uLCBhbmQgY2FsbCB0aGUgdXNlcidzIHByZWxvYWQgZnVuY3Rpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUDVQcmVsb2FkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmluaXRJbnRlcnByZXRlcigpO1xuICAvLyBBbmQgZXhlY3V0ZSB0aGUgaW50ZXJwcmV0ZXIgZm9yIHRoZSBmaXJzdCB0aW1lOlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuSlNJbnRlcnByZXRlci5pbml0aWFsaXplZCgpKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmV4ZWN1dGVJbnRlcnByZXRlcih0cnVlKTtcblxuICAgIC8vIEluIGFkZGl0aW9uLCBleGVjdXRlIHRoZSBnbG9iYWwgZnVuY3Rpb24gY2FsbGVkIHByZWxvYWQoKVxuICAgIGlmICh0aGlzLmV2ZW50SGFuZGxlcnMucHJlbG9hZCkge1xuICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLnByZWxvYWQuYXBwbHkobnVsbCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgY2FsbGVkIHdoaWxlIHRoaXMuZ2FtZUxhYlA1IGlzIGluIHRoZSBzZXR1cCBwaGFzZS4gV2UgcmVzdG9yZSB0aGVcbiAqIGludGVycHJldGVyIG1ldGhvZHMgdGhhdCB3ZXJlIG1vZGlmaWVkIGR1cmluZyBwcmVsb2FkLCB0aGVuIGNhbGwgdGhlIHVzZXInc1xuICogc2V0dXAgZnVuY3Rpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUDVTZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlcikge1xuICAgIC8vIFRPRE86IChjcGlyaWNoKSBSZW1vdmUgdGhpcyBjb2RlIG9uY2UgcDVwbGF5IHN1cHBvcnRzIGluc3RhbmNlIG1vZGU6XG5cbiAgICAvLyBSZXBsYWNlIHJlc3RvcmVkIHByZWxvYWQgbWV0aG9kcyBmb3IgdGhlIGludGVycHJldGVyOlxuICAgIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLmdhbWVMYWJQNS5wNS5fcHJlbG9hZE1ldGhvZHMpIHtcbiAgICAgIHRoaXMuSlNJbnRlcnByZXRlci5jcmVhdGVHbG9iYWxQcm9wZXJ0eShcbiAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgdGhpcy5nYW1lTGFiUDUucDVbbWV0aG9kXSxcbiAgICAgICAgICB0aGlzLmdhbWVMYWJQNS5wNSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZXZlbnRIYW5kbGVycy5zZXR1cCkge1xuICAgICAgdGhpcy5zZXR1cEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLnNldHVwLmFwcGx5KG51bGwpO1xuICAgIH1cbiAgICB0aGlzLmNvbXBsZXRlU2V0dXBJZlNldHVwQ29tcGxldGUoKTtcbiAgfVxufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuY29tcGxldGVTZXR1cElmU2V0dXBDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuc2V0dXBJblByb2dyZXNzICYmIHRoaXMuSlNJbnRlcnByZXRlci5zZWVuUmV0dXJuRnJvbUNhbGxiYWNrRHVyaW5nRXhlY3V0aW9uKSB7XG4gICAgdGhpcy5nYW1lTGFiUDUuYWZ0ZXJTZXR1cENvbXBsZXRlKCk7XG4gICAgdGhpcy5zZXR1cEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCB3aGlsZSB0aGlzLmdhbWVMYWJQNSBpcyBpbiBhIGRyYXcoKSBjYWxsLiBXZSBjYWxsIHRoZSB1c2VyJ3NcbiAqIGRyYXcgZnVuY3Rpb24uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUDVEcmF3ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5KU0ludGVycHJldGVyICYmIHRoaXMuZXZlbnRIYW5kbGVycy5kcmF3KSB7XG4gICAgdGhpcy5kcmF3SW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgdGhpcy5ldmVudEhhbmRsZXJzLmRyYXcuYXBwbHkobnVsbCk7XG4gIH1cbiAgdGhpcy5jb21wbGV0ZVJlZHJhd0lmRHJhd0NvbXBsZXRlKCk7XG59O1xuXG5HYW1lTGFiLnByb3RvdHlwZS5jb21wbGV0ZVJlZHJhd0lmRHJhd0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5kcmF3SW5Qcm9ncmVzcyAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuc2VlblJldHVybkZyb21DYWxsYmFja0R1cmluZ0V4ZWN1dGlvbikge1xuICAgIHRoaXMuZ2FtZUxhYlA1LmFmdGVyRHJhd0NvbXBsZXRlKCk7XG4gICAgdGhpcy5kcmF3SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICQoJyNidWJibGUnKS50ZXh0KCdGUFM6ICcgKyB0aGlzLmdhbWVMYWJQNS5nZXRGcmFtZVJhdGUoKS50b0ZpeGVkKDApKTtcbiAgfVxufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaGFuZGxlRXhlY3V0aW9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyLCBsaW5lTnVtYmVyKSB7XG4vKlxuICBvdXRwdXRFcnJvcihTdHJpbmcoZXJyKSwgRXJyb3JMZXZlbC5FUlJPUiwgbGluZU51bWJlcik7XG4gIFN0dWRpby5leGVjdXRpb25FcnJvciA9IHsgZXJyOiBlcnIsIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXIgfTtcblxuICAvLyBDYWxsIG9uUHV6emxlQ29tcGxldGUoKSBpZiBzeW50YXggZXJyb3Igb3IgYW55IHRpbWUgd2UncmUgbm90IG9uIGEgZnJlZXBsYXkgbGV2ZWw6XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgIC8vIE1hcmsgcHJlRXhlY3V0aW9uRmFpbHVyZSBhbmQgdGVzdFJlc3VsdHMgaW1tZWRpYXRlbHkgc28gdGhhdCBhbiBlcnJvclxuICAgIC8vIG1lc3NhZ2UgYWx3YXlzIGFwcGVhcnMsIGV2ZW4gb24gZnJlZXBsYXk6XG4gICAgU3R1ZGlvLnByZUV4ZWN1dGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgIFN0dWRpby50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLlNZTlRBWF9FUlJPUl9GQUlMO1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH0gZWxzZSBpZiAoIWxldmVsLmZyZWVQbGF5KSB7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuKi9cbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5sb2coZXJyKTtcbiAgdGhyb3cgZXJyO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBBUEkgY29tbWFuZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZUNtZCA9IGZ1bmN0aW9uIChpZCwgbmFtZSwgb3B0cykge1xuICBjb25zb2xlLmxvZyhcIkdhbWVMYWIgZXhlY3V0ZUNtZCBcIiArIG5hbWUpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgdGhlIHRhc2tzIHRvIGJlIGRvbmUgYWZ0ZXIgdGhlIHVzZXIgcHJvZ3JhbSBpcyBmaW5pc2hlZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZmluaXNoRXhlY3V0aW9uXyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuaGlnaGxpZ2h0QmxvY2sobnVsbCk7XG4gIH1cbiAgdGhpcy5jaGVja0Fuc3dlcigpO1xufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmRpc3BsYXlGZWVkYmFja18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrKHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBza2luOiB0aGlzLnNraW4uaWQsXG4gICAgZmVlZGJhY2tUeXBlOiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICByZXNwb25zZTogdGhpcy5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWwsXG4gICAgLy8gZmVlZGJhY2tJbWFnZTogZmVlZGJhY2tJbWFnZUNhbnZhcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpLFxuICAgIC8vIGFkZCAnaW1wcmVzc2l2ZSc6dHJ1ZSB0byBub24tZnJlZXBsYXkgbGV2ZWxzIHRoYXQgd2UgZGVlbSBhcmUgcmVsYXRpdmVseSBpbXByZXNzaXZlIChzZWUgIzY2OTkwNDgwKVxuICAgIHNob3dpbmdTaGFyaW5nOiAhbGV2ZWwuZGlzYWJsZVNoYXJpbmcgJiYgKGxldmVsLmZyZWVQbGF5IC8qIHx8IGxldmVsLmltcHJlc3NpdmUgKi8pLFxuICAgIC8vIGltcHJlc3NpdmUgbGV2ZWxzIGFyZSBhbHJlYWR5IHNhdmVkXG4gICAgLy8gYWxyZWFkeVNhdmVkOiBsZXZlbC5pbXByZXNzaXZlLFxuICAgIC8vIGFsbG93IHVzZXJzIHRvIHNhdmUgZnJlZXBsYXkgbGV2ZWxzIHRvIHRoZWlyIGdhbGxlcnkgKGltcHJlc3NpdmUgbm9uLWZyZWVwbGF5IGxldmVscyBhcmUgYXV0b3NhdmVkKVxuICAgIHNhdmVUb0dhbGxlcnlVcmw6IGxldmVsLmZyZWVQbGF5ICYmIHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zYXZlX3RvX2dhbGxlcnlfdXJsLFxuICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IG1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICBzaGFyaW5nVGV4dDogbXNnLnNoYXJlRHJhd2luZygpXG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIC8vIERpc2FibGUgdGhlIHJ1biBidXR0b24gdW50aWwgb25SZXBvcnRDb21wbGV0ZSBpcyBjYWxsZWQuXG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHJ1bkJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmRpc3BsYXlGZWVkYmFja18oKTtcbn07XG5cbi8qKlxuICogVmVyaWZ5IGlmIHRoZSBhbnN3ZXIgaXMgY29ycmVjdC5cbiAqIElmIHNvLCBtb3ZlIG9uIHRvIG5leHQgbGV2ZWwuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNoZWNrQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgLy8gVGVzdCB3aGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5IGxldmVsLCBvciB0aGUgbGV2ZWwgaGFzXG4gIC8vIGJlZW4gY29tcGxldGVkXG4gIHZhciBsZXZlbENvbXBsZXRlID0gbGV2ZWwuZnJlZVBsYXkgJiYgKCFsZXZlbC5lZGl0Q29kZSB8fCAhdGhpcy5leGVjdXRpb25FcnJvcik7XG4gIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gICAgcHJvZ3JhbSA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IHJldXNlIGFuIG9sZCBtZXNzYWdlLCBzaW5jZSBub3QgYWxsIHBhdGhzIHNldCBvbmUuXG4gIHRoaXMubWVzc2FnZSA9IHVuZGVmaW5lZDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICAvLyBJZiB3ZSB3YW50IHRvIFwibm9ybWFsaXplXCIgdGhlIEphdmFTY3JpcHQgdG8gYXZvaWQgcHJvbGlmZXJhdGlvbiBvZiBuZWFybHlcbiAgICAvLyBpZGVudGljYWwgdmVyc2lvbnMgb2YgdGhlIGNvZGUgb24gdGhlIHNlcnZpY2UsIHdlIGNvdWxkIGRvIGVpdGhlciBvZiB0aGVzZTpcblxuICAgIC8vIGRvIGFuIGFjb3JuLnBhcnNlIGFuZCB0aGVuIHVzZSBlc2NvZGVnZW4gdG8gZ2VuZXJhdGUgYmFjayBhIFwiY2xlYW5cIiB2ZXJzaW9uXG4gICAgLy8gb3IgbWluaWZ5ICh1Z2xpZnlqcykgYW5kIHRoYXQgb3IganMtYmVhdXRpZnkgdG8gcmVzdG9yZSBhIFwiY2xlYW5cIiB2ZXJzaW9uXG5cbiAgICBwcm9ncmFtID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWTtcbiAgfVxuXG4gIC8vIFBsYXkgc291bmRcbiAgdGhpcy5zdHVkaW9BcHBfLnN0b3BMb29waW5nQXVkaW8oJ3N0YXJ0Jyk7XG4gIGlmICh0aGlzLnRlc3RSZXN1bHRzID09PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZIHx8XG4gICAgICB0aGlzLnRlc3RSZXN1bHRzID49IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciByZXBvcnREYXRhID0ge1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICBidWlsZGVyOiBsZXZlbC5idWlsZGVyLFxuICAgIHJlc3VsdDogbGV2ZWxDb21wbGV0ZSxcbiAgICB0ZXN0UmVzdWx0OiB0aGlzLnRlc3RSZXN1bHRzLFxuICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudChwcm9ncmFtKSxcbiAgICBvbkNvbXBsZXRlOiBfLmJpbmQodGhpcy5vblJlcG9ydENvbXBsZXRlLCB0aGlzKSxcbiAgICAvLyBzYXZlX3RvX2dhbGxlcnk6IGxldmVsLmltcHJlc3NpdmVcbiAgfTtcblxuICB0aGlzLnN0dWRpb0FwcF8ucmVwb3J0KHJlcG9ydERhdGEpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gIH1cblxuICAvLyBUaGUgY2FsbCB0byBkaXNwbGF5RmVlZGJhY2soKSB3aWxsIGhhcHBlbiBsYXRlciBpbiBvblJlcG9ydENvbXBsZXRlKClcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxkaXYgaWQ9XCJkaXZHYW1lTGFiXCIgdGFiaW5kZXg9XCIxXCI+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHRiID0gYmxvY2tVdGlscy5jcmVhdGVUb29sYm94O1xudmFyIGJsb2NrT2ZUeXBlID0gYmxvY2tVdGlscy5ibG9ja09mVHlwZTtcbnZhciBjcmVhdGVDYXRlZ29yeSA9IGJsb2NrVXRpbHMuY3JlYXRlQ2F0ZWdvcnk7XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG52YXIgbGV2ZWxzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGV2ZWxzLnNhbmRib3ggPSAge1xuICBpZGVhbDogSW5maW5pdHksXG4gIHJlcXVpcmVkQmxvY2tzOiBbXG4gIF0sXG4gIHNjYWxlOiB7XG4gICAgJ3NuYXBSYWRpdXMnOiAyXG4gIH0sXG4gIHNvZnRCdXR0b25zOiBbXG4gICAgJ2xlZnRCdXR0b24nLFxuICAgICdyaWdodEJ1dHRvbicsXG4gICAgJ2Rvd25CdXR0b24nLFxuICAgICd1cEJ1dHRvbidcbiAgXSxcbiAgZnJlZVBsYXk6IHRydWUsXG4gIHRvb2xib3g6XG4gICAgdGIoYmxvY2tPZlR5cGUoJ2dhbWVsYWJfZm9vJykpLFxuICBzdGFydEJsb2NrczpcbiAgICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbn07XG5cbi8vIEJhc2UgY29uZmlnIGZvciBsZXZlbHMgY3JlYXRlZCB2aWEgbGV2ZWxidWlsZGVyXG5sZXZlbHMuY3VzdG9tID0gdXRpbHMuZXh0ZW5kKGxldmVscy5zYW5kYm94LCB7XG4gIGVkaXRDb2RlOiB0cnVlLFxuICBjb2RlRnVuY3Rpb25zOiB7XG4gICAgLy8gR2FtZSBMYWJcbiAgICBcInZhcl9sb2FkSW1hZ2VcIjogbnVsbCxcbiAgICBcImltYWdlXCI6IG51bGwsXG4gICAgXCJmaWxsXCI6IG51bGwsXG4gICAgXCJub0ZpbGxcIjogbnVsbCxcbiAgICBcInN0cm9rZVwiOiBudWxsLFxuICAgIFwibm9TdHJva2VcIjogbnVsbCxcbiAgICBcImFyY1wiOiBudWxsLFxuICAgIFwiZWxsaXBzZVwiOiBudWxsLFxuICAgIFwibGluZVwiOiBudWxsLFxuICAgIFwicG9pbnRcIjogbnVsbCxcbiAgICBcInJlY3RcIjogbnVsbCxcbiAgICBcInRyaWFuZ2xlXCI6IG51bGwsXG4gICAgXCJ0ZXh0XCI6IG51bGwsXG4gICAgXCJ0ZXh0QWxpZ25cIjogbnVsbCxcbiAgICBcInRleHRTaXplXCI6IG51bGwsXG4gICAgXCJkcmF3U3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYWxsU3ByaXRlc1wiOiBudWxsLFxuICAgIFwiYmFja2dyb3VuZFwiOiBudWxsLFxuICAgIFwid2lkdGhcIjogbnVsbCxcbiAgICBcImhlaWdodFwiOiBudWxsLFxuICAgIFwiY2FtZXJhXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub25cIjogbnVsbCxcbiAgICBcImNhbWVyYS5vZmZcIjogbnVsbCxcbiAgICBcImNhbWVyYS5hY3RpdmVcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVhcIjogbnVsbCxcbiAgICBcImNhbWVyYS5tb3VzZVlcIjogbnVsbCxcbiAgICBcImNhbWVyYS5wb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnpvb21cIjogbnVsbCxcblxuICAgIC8vIFNwcml0ZXNcbiAgICBcInZhcl9jcmVhdGVTcHJpdGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0RGlyZWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuZ2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5yZW1vdmVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRBbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5hZGRJbWFnZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmFkZFNwZWVkXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuYWRkVG9Hcm91cFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmJvdW5jZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmNvbGxpZGVcIjogbnVsbCxcbiAgICBcInNwcml0ZS5kaXNwbGFjZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLm92ZXJsYXBcIjogbnVsbCxcbiAgICBcInNwcml0ZS5jaGFuZ2VBbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5jaGFuZ2VJbWFnZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLmF0dHJhY3Rpb25Qb2ludFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmxpbWl0U3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zZXRDb2xsaWRlclwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNldFZlbG9jaXR5XCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJzcHJpdGUud2lkdGhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hbmltYXRpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5kZXB0aFwiOiBudWxsLFxuICAgIFwic3ByaXRlLmZyaWN0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaW1tb3ZhYmxlXCI6IG51bGwsXG4gICAgXCJzcHJpdGUubGlmZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLm1hc3NcIjogbnVsbCxcbiAgICBcInNwcml0ZS5tYXhTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnBvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucHJldmlvdXNQb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucmVtb3ZlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJlc3RpdHV0aW9uXCI6IG51bGwsXG4gICAgXCJzcHJpdGUucm90YXRlVG9EaXJlY3Rpb25cIjogbnVsbCxcbiAgICBcInNwcml0ZS5yb3RhdGlvblwiOiBudWxsLFxuICAgIFwic3ByaXRlLnJvdGF0aW9uU3BlZWRcIjogbnVsbCxcbiAgICBcInNwcml0ZS5zY2FsZVwiOiBudWxsLFxuICAgIFwic3ByaXRlLnNoYXBlQ29sb3JcIjogbnVsbCxcbiAgICBcInNwcml0ZS50b3VjaGluZ1wiOiBudWxsLFxuICAgIFwic3ByaXRlLnZlbG9jaXR5LnhcIjogbnVsbCxcbiAgICBcInNwcml0ZS52ZWxvY2l0eS55XCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmlzaWJsZVwiOiBudWxsLFxuXG4gICAgLy8gQW5pbWF0aW9uc1xuICAgIFwidmFyX2xvYWRBbmltYXRpb25cIjogbnVsbCxcbiAgICBcImFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiYW5pbS5jaGFuZ2VGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5uZXh0RnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0ucHJldmlvdXNGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5jbG9uZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nZXRGcmFtZVwiOiBudWxsLFxuICAgIFwiYW5pbS5nZXRMYXN0RnJhbWVcIjogbnVsbCxcbiAgICBcImFuaW0uZ29Ub0ZyYW1lXCI6IG51bGwsXG4gICAgXCJhbmltLnBsYXlcIjogbnVsbCxcbiAgICBcImFuaW0ucmV3aW5kXCI6IG51bGwsXG4gICAgXCJhbmltLnN0b3BcIjogbnVsbCxcbiAgICBcImFuaW0uZnJhbWVDaGFuZ2VkXCI6IG51bGwsXG4gICAgXCJhbmltLmZyYW1lRGVsYXlcIjogbnVsbCxcbiAgICBcImFuaW0uaW1hZ2VzXCI6IG51bGwsXG4gICAgXCJhbmltLmxvb3BpbmdcIjogbnVsbCxcbiAgICBcImFuaW0ucGxheWluZ1wiOiBudWxsLFxuICAgIFwiYW5pbS52aXNpYmxlXCI6IG51bGwsXG5cbiAgICAvLyBHcm91cHNcbiAgICBcIkdyb3VwXCI6IG51bGwsXG4gICAgXCJncm91cC5hZGRcIjogbnVsbCxcbiAgICBcImdyb3VwLnJlbW92ZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY2xlYXJcIjogbnVsbCxcbiAgICBcImdyb3VwLmNvbnRhaW5zXCI6IG51bGwsXG4gICAgXCJncm91cC5nZXRcIjogbnVsbCxcbiAgICBcImdyb3VwLmJvdW5jZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAuY29sbGlkZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAuZGlzcGxhY2VcIjogbnVsbCxcbiAgICBcImdyb3VwLm92ZXJsYXBcIjogbnVsbCxcbiAgICBcImdyb3VwLm1heERlcHRoXCI6IG51bGwsXG4gICAgXCJncm91cC5taW5EZXB0aFwiOiBudWxsLFxuXG4gICAgLy8gRXZlbnRzXG4gICAgXCJrZXlJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcImtleVwiOiBudWxsLFxuICAgIFwia2V5Q29kZVwiOiBudWxsLFxuICAgIFwia2V5UHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5UmVsZWFzZWRcIjogbnVsbCxcbiAgICBcImtleVR5cGVkXCI6IG51bGwsXG4gICAgXCJrZXlEb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50RG93blwiOiBudWxsLFxuICAgIFwia2V5V2VudFVwXCI6IG51bGwsXG4gICAgXCJtb3VzZVhcIjogbnVsbCxcbiAgICBcIm1vdXNlWVwiOiBudWxsLFxuICAgIFwicG1vdXNlWFwiOiBudWxsLFxuICAgIFwicG1vdXNlWVwiOiBudWxsLFxuICAgIFwibW91c2VCdXR0b25cIjogbnVsbCxcbiAgICBcIm1vdXNlSXNQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZU1vdmVkXCI6IG51bGwsXG4gICAgXCJtb3VzZURyYWdnZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlUHJlc3NlZFwiOiBudWxsLFxuICAgIFwibW91c2VSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwibW91c2VDbGlja2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVdoZWVsXCI6IG51bGwsXG5cbiAgICAvLyBDb250cm9sXG4gICAgXCJmb3JMb29wX2lfMF80XCI6IG51bGwsXG4gICAgXCJpZkJsb2NrXCI6IG51bGwsXG4gICAgXCJpZkVsc2VCbG9ja1wiOiBudWxsLFxuICAgIFwid2hpbGVCbG9ja1wiOiBudWxsLFxuXG4gICAgLy8gTWF0aFxuICAgIFwiYWRkT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInN1YnRyYWN0T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm11bHRpcGx5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImRpdmlkZU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJlcXVhbGl0eU9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJpbmVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImdyZWF0ZXJUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImdyZWF0ZXJUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJsZXNzVGhhbk9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJsZXNzVGhhbk9yRXF1YWxPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiYW5kT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm9yT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcIm5vdE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJyYW5kb21OdW1iZXJfbWluX21heFwiOiBudWxsLFxuICAgIFwibWF0aFJvdW5kXCI6IG51bGwsXG4gICAgXCJtYXRoQWJzXCI6IG51bGwsXG4gICAgXCJtYXRoTWF4XCI6IG51bGwsXG4gICAgXCJtYXRoTWluXCI6IG51bGwsXG4gICAgXCJtYXRoUmFuZG9tXCI6IG51bGwsXG5cbiAgICAvLyBWYXJpYWJsZXNcbiAgICBcImRlY2xhcmVBc3NpZ25feFwiOiBudWxsLFxuICAgIFwiZGVjbGFyZU5vQXNzaWduX3hcIjogbnVsbCxcbiAgICBcImFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlQXNzaWduX3N0cl9oZWxsb193b3JsZFwiOiBudWxsLFxuICAgIFwic3Vic3RyaW5nXCI6IG51bGwsXG4gICAgXCJpbmRleE9mXCI6IG51bGwsXG4gICAgXCJpbmNsdWRlc1wiOiBudWxsLFxuICAgIFwibGVuZ3RoXCI6IG51bGwsXG4gICAgXCJ0b1VwcGVyQ2FzZVwiOiBudWxsLFxuICAgIFwidG9Mb3dlckNhc2VcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fbGlzdF9hYmRcIjogbnVsbCxcbiAgICBcImxpc3RMZW5ndGhcIjogbnVsbCxcblxuICAgIC8vIEZ1bmN0aW9uc1xuICAgIFwiZnVuY3Rpb25QYXJhbXNfbm9uZVwiOiBudWxsLFxuICAgIFwiZnVuY3Rpb25QYXJhbXNfblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25cIjogbnVsbCxcbiAgICBcImNhbGxNeUZ1bmN0aW9uX25cIjogbnVsbCxcbiAgICBcInJldHVyblwiOiBudWxsLFxuICB9LFxuICBzdGFydEJsb2NrczogW1xuICAgICdmdW5jdGlvbiBzZXR1cCgpIHsnLFxuICAgICcgICcsXG4gICAgJ30nLFxuICAgICdmdW5jdGlvbiBkcmF3KCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJyddLmpvaW4oJ1xcbicpLFxufSk7XG5cbmxldmVscy5lY19zYW5kYm94ID0gdXRpbHMuZXh0ZW5kKGxldmVscy5jdXN0b20sIHtcbn0pO1xuXG4iLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQuanMnKTtcbnZhciBzaG93QXNzZXRNYW5hZ2VyID0gcmVxdWlyZSgnLi4vYXNzZXRNYW5hZ2VtZW50L3Nob3cnKTtcbnZhciBnZXRBc3NldERyb3Bkb3duID0gcmVxdWlyZSgnLi4vYXNzZXRNYW5hZ2VtZW50L2dldEFzc2V0RHJvcGRvd24nKTtcblxudmFyIENPTE9SX0xJR0hUX0dSRUVOID0gJyNEM0U5NjUnO1xudmFyIENPTE9SX0JMVUUgPSAnIzE5QzNFMSc7XG52YXIgQ09MT1JfUkVEID0gJyNGNzgxODMnO1xudmFyIENPTE9SX0NZQU4gPSAnIzRERDBFMSc7XG52YXIgQ09MT1JfWUVMTE9XID0gJyNGRkYxNzYnO1xudmFyIENPTE9SX1BJTksgPSAnI0Y1N0FDNic7XG52YXIgQ09MT1JfUFVSUExFID0gJyNCQjc3QzcnO1xudmFyIENPTE9SX0dSRUVOID0gJyM2OEQ5OTUnO1xudmFyIENPTE9SX1dISVRFID0gJyNGRkZGRkYnO1xudmFyIENPTE9SX0JMVUUgPSAnIzY0QjVGNic7XG52YXIgQ09MT1JfT1JBTkdFID0gJyNGRkI3NEQnO1xuXG52YXIgR2FtZUxhYjtcblxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG4vLyBGbGlwIHRoZSBhcmd1bWVudCBvcmRlciBzbyB3ZSBjYW4gYmluZCBgdHlwZUZpbHRlcmAuXG5mdW5jdGlvbiBjaG9vc2VBc3NldCh0eXBlRmlsdGVyLCBjYWxsYmFjaykge1xuICBzaG93QXNzZXRNYW5hZ2VyKGNhbGxiYWNrLCB0eXBlRmlsdGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICAvLyBHYW1lIExhYlxuICB7ZnVuYzogJ2xvYWRJbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3VybCddLCBwYXJhbXM6IFsnXCJodHRwczovL2NvZGUub3JnL2ltYWdlcy9sb2dvLnBuZ1wiJ10sIHR5cGU6ICdlaXRoZXInLCBkcm9wZG93bjogeyAwOiBmdW5jdGlvbiAoKSB7IHJldHVybiBnZXRBc3NldERyb3Bkb3duKCdpbWFnZScpOyB9IH0sIGFzc2V0VG9vbHRpcDogeyAwOiBjaG9vc2VBc3NldC5iaW5kKG51bGwsICdpbWFnZScpIH0gfSxcbiAge2Z1bmM6ICd2YXJfbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIGJsb2NrUHJlZml4OiAndmFyIGltZyA9IGxvYWRJbWFnZScsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSwgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdpbWFnZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2ltYWdlJywnc3JjWCcsJ3NyY1knLCdzcmNXJywnc3JjSCcsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCJpbWdcIiwgXCIwXCIsIFwiMFwiLCBcImltZy53aWR0aFwiLCBcImltZy5oZWlnaHRcIiwgXCIwXCIsIFwiMFwiLCBcImltZy53aWR0aFwiLCBcImltZy5oZWlnaHRcIl0gfSxcbiAge2Z1bmM6ICdmaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCIneWVsbG93J1wiXSB9LFxuICB7ZnVuYzogJ25vRmlsbCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnc3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnY29sb3InXSwgcGFyYW1zOiBbXCInYmx1ZSdcIl0gfSxcbiAge2Z1bmM6ICdub1N0cm9rZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYXJjJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCcsJ3N0YXJ0Jywnc3RvcCddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiODAwXCIsIFwiODAwXCIsIFwiMFwiLCBcIkhBTEZfUElcIl0gfSxcbiAge2Z1bmM6ICdlbGxpcHNlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ2xpbmUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MiddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAncG9pbnQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiXSB9LFxuICB7ZnVuYzogJ3JlY3QnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMTAwXCIsIFwiMTAwXCIsIFwiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAndHJpYW5nbGUnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MicsJ3gzJywneTMnXSwgcGFyYW1zOiBbXCIyMDBcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjQwMFwiLCBcIjQwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydzdHInLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiJ3RleHQnXCIsIFwiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCIxMDBcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0QWxpZ24nLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydob3JpeicsJ3ZlcnQnXSwgcGFyYW1zOiBbXCJDRU5URVJcIiwgXCJUT1BcIl0gfSxcbiAge2Z1bmM6ICd0ZXh0U2l6ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3BpeGVscyddLCBwYXJhbXM6IFtcIjEyXCJdIH0sXG4gIHtmdW5jOiAnZHJhd1Nwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJyB9LFxuICB7ZnVuYzogJ2FsbFNwcml0ZXMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgYmxvY2s6ICdhbGxTcHJpdGVzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2JhY2tncm91bmQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibGFjaydcIl0gfSxcbiAge2Z1bmM6ICd3aWR0aCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnaGVpZ2h0JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5vbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9mZicsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnY2FtZXJhLmFjdGl2ZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm1vdXNlWScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEuem9vbScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG5cbiAgLy8gU3ByaXRlc1xuICB7ZnVuYzogJ2NyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAndmFyX2NyZWF0ZVNwcml0ZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIGJsb2NrUHJlZml4OiAndmFyIHNwcml0ZSA9IGNyZWF0ZVNwcml0ZScsIHBhbGV0dGVQYXJhbXM6IFsneCcsJ3knLCd3aWR0aCcsJ2hlaWdodCddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjIwMFwiLCBcIjMwXCIsIFwiMzBcIl0sIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNldFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ2FuZ2xlJ10sIHBhcmFtczogW1wiMVwiLCBcIjkwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouc2V0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmdldEFuaW1hdGlvbkxhYmVsJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEFuaW1hdGlvbkxhYmVsJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXREaXJlY3Rpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RGlyZWN0aW9uJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5nZXRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRTcGVlZCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucmVtb3ZlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYWRkQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCcsJ2FuaW1hdGlvbiddLCBwYXJhbXM6IFsnXCJhbmltMVwiJywgXCJhbmltXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRJbWFnZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnbGFiZWwnLCdpbWFnZSddLCBwYXJhbXM6IFsnXCJpbWcxXCInLCBcImltZ1wiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZEltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRTcGVlZCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZFNwZWVkJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hZGRUb0dyb3VwJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydncm91cCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkVG9Hcm91cCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYm91bmNlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmJvdW5jZScsIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNvbGxpZGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouY29sbGlkZScsIHR5cGU6ICdlaXRoZXInIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmRpc3BsYWNlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJncm91cFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmRpc3BsYWNlJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUub3ZlcmxhcCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5vdmVybGFwJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuY2hhbmdlQW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJhbmltMVwiJ10sIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VBbmltYXRpb24nIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmNoYW5nZUltYWdlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJpbWcxXCInXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUltYWdlJyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5hdHRyYWN0aW9uUG9pbnQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3NwZWVkJywneCcsJ3knXSwgcGFyYW1zOiBbXCIxXCIsIFwiMjAwXCIsIFwiMjAwXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYXR0cmFjdGlvblBvaW50JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5saW1pdFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydtYXgnXSwgcGFyYW1zOiBbXCIzXCJdLCBtb2RlT3B0aW9uTmFtZTogJyoubGltaXRTcGVlZCcgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0Q29sbGlkZXInLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3R5cGUnLCd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogWydcInJlY3RhbmdsZVwiJywgXCIwXCIsIFwiMFwiLCBcIjIwXCIsIFwiMjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRDb2xsaWRlcicgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2V0VmVsb2NpdHknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjFcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRWZWxvY2l0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaGVpZ2h0JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmhlaWdodCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUud2lkdGgnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoud2lkdGgnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmFuaW1hdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5hbmltYXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLmRlcHRoJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmRlcHRoJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5mcmljdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmljdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuaW1tb3ZhYmxlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmltbW92YWJsZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUubGlmZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5saWZlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5tYXNzJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1hc3MnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLm1heFNwZWVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLm1heFNwZWVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5wb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi54JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5wb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNQb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLngnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnByZXZpb3VzUG9zaXRpb24ueScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi55JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yZW1vdmVkJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJlc3RpdHV0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnJlc3RpdHV0aW9uJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5yb3RhdGVUb0RpcmVjdGlvbicsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGVUb0RpcmVjdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucm90YXRpb24nLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnJvdGF0aW9uU3BlZWQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb25TcGVlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuc2NhbGUnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2NhbGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnNoYXBlQ29sb3InLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouc2hhcGVDb2xvcicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudG91Y2hpbmcnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoudG91Y2hpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZlbG9jaXR5JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eS54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLngnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnZlbG9jaXR5LnknLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyoueScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmlzaWJsZScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBwcm9wZXJ0aWVzOlxuY2FtZXJhXG5jb2xsaWRlciAtIFVTRUZVTD8gKG1hcnNoYWwgQUFCQiBhbmQgQ2lyY2xlQ29sbGlkZXIpXG5kZWJ1Z1xuZ3JvdXBzXG5tb3VzZUFjdGl2ZVxubW91c2VJc092ZXJcbm1vdXNlSXNQcmVzc2VkXG5vcmlnaW5hbEhlaWdodFxub3JpZ2luYWxXaWR0aFxuKi9cblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBtZXRob2RzOlxuYWRkSW1hZ2UobGFiZWxpbWcpIC0gMSBwYXJhbSB2ZXJzaW9uOiAoc2V0cyBsYWJlbCB0byBcIm5vcm1hbFwiIGF1dG9tYXRpY2FsbHkpXG5kcmF3KCkgLSBPVkVSUklERSBhbmQvb3IgVVNFRlVMP1xubWlycm9yWChkaXIpIC0gVVNFRlVMP1xubWlycm9yWShkaXIpIC0gVVNFRlVMP1xub3ZlcmxhcFBpeGVsKHBvaW50WHBvaW50WSkgLSBVU0VGVUw/XG5vdmVybGFwUG9pbnQocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbnVwZGF0ZSgpIC0gVVNFRlVMP1xuKi9cblxuICAvLyBBbmltYXRpb25zXG4gIHtmdW5jOiAnbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsndXJsMScsJ3VybDInXSwgcGFyYW1zOiBbJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMS5wbmdcIicsICdcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDIucG5nXCInXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXJfbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIGJsb2NrUHJlZml4OiAndmFyIGFuaW0gPSBsb2FkQW5pbWF0aW9uJywgcGFsZXR0ZVBhcmFtczogWyd1cmwxJywndXJsMiddLCBwYXJhbXM6IFsnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAxLnBuZ1wiJywgJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMi5wbmdcIiddLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ2FuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnYW5pbWF0aW9uJywneCcsJ3knXSwgcGFyYW1zOiBbXCJhbmltXCIsIFwiNTBcIiwgXCI1MFwiXSB9LFxuICB7ZnVuYzogJ2FuaW0uY2hhbmdlRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2ZyYW1lJ10sIHBhcmFtczogW1wiMFwiXSwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUZyYW1lJyB9LFxuICB7ZnVuYzogJ2FuaW0ubmV4dEZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLm5leHRGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLnByZXZpb3VzRnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNGcmFtZScgfSxcbiAge2Z1bmM6ICdhbmltLmNsb25lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmNsb25lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ2V0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RnJhbWUnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5nZXRMYXN0RnJhbWUnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0TGFzdEZyYW1lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2FuaW0uZ29Ub0ZyYW1lJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgcGFsZXR0ZVBhcmFtczogWydmcmFtZSddLCBwYXJhbXM6IFtcIjFcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5nb1RvRnJhbWUnIH0sXG4gIHtmdW5jOiAnYW5pbS5wbGF5JywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnBsYXknIH0sXG4gIHtmdW5jOiAnYW5pbS5yZXdpbmQnLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyoucmV3aW5kJyB9LFxuICB7ZnVuYzogJ2FuaW0uc3RvcCcsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5zdG9wJyB9LFxuICB7ZnVuYzogJ2FuaW0uZnJhbWVDaGFuZ2VkJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmZyYW1lQ2hhbmdlZCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmZyYW1lRGVsYXknLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBtb2RlT3B0aW9uTmFtZTogJyouZnJhbWVEZWxheScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdhbmltLmltYWdlcycsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi5pbWFnZXMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5sb29waW5nJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLmxvb3BpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS5wbGF5aW5nJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnBsYXlpbmcnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYW5pbS52aXNpYmxlJywgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgbW9kZU9wdGlvbk5hbWU6ICcqLnZpc2libGUnLCB0eXBlOiAncHJvcGVydHknIH0sXG4vKiBUT0RPOiBkZWNpZGUgd2hldGhlciB0byBleHBvc2UgdGhlc2UgQW5pbWF0aW9uIG1ldGhvZHM6XG5kcmF3KHh5KVxuZ2V0RnJhbWVJbWFnZSgpXG5nZXRIZWlnaHQoKVxuZ2V0SW1hZ2VBdChmcmFtZSlcbmdldFdpZHRoKClcbiovXG5cbiAgLy8gR3JvdXBzXG4gIHtmdW5jOiAnR3JvdXAnLCBibG9ja1ByZWZpeDogJ3ZhciBncm91cCA9IG5ldyBHcm91cCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdncm91cC5hZGQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJyouYWRkJyB9LFxuICB7ZnVuYzogJ2dyb3VwLnJlbW92ZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAuY2xlYXInLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5jbGVhcicgfSxcbiAge2Z1bmM6ICdncm91cC5jb250YWlucycsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydzcHJpdGUnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5jb250YWlucycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5nZXQnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnaSddLCBwYXJhbXM6IFtcIjBcIl0sIG1vZGVPcHRpb25OYW1lOiAnKi5nZXQnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAuYm91bmNlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9ib3VuY2UnIH0sIC8qIGF2b2lkIG1vZGVPcHRpb25OYW1lIGNvbmZsaWN0ICovXG4gIHtmdW5jOiAnZ3JvdXAuY29sbGlkZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnZ3JvdXBfYm91bmNlJyB9LCAvKiBhdm9pZCBtb2RlT3B0aW9uTmFtZSBjb25mbGljdCAqL1xuICB7ZnVuYzogJ2dyb3VwLmRpc3BsYWNlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9ib3VuY2UnIH0sIC8qIGF2b2lkIG1vZGVPcHRpb25OYW1lIGNvbmZsaWN0ICovXG4gIHtmdW5jOiAnZ3JvdXAub3ZlcmxhcCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnZ3JvdXBfYm91bmNlJyB9LCAvKiBhdm9pZCBtb2RlT3B0aW9uTmFtZSBjb25mbGljdCAqL1xuICB7ZnVuYzogJ2dyb3VwLm1heERlcHRoJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBtb2RlT3B0aW9uTmFtZTogJyoubWF4RGVwdGgnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ3JvdXAubWluRGVwdGgnLCBjYXRlZ29yeTogJ0dyb3VwcycsIG1vZGVPcHRpb25OYW1lOiAnKi5taW5EZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIEdyb3VwIG1ldGhvZHM6XG5kcmF3KCkgLSBVU0VGVUw/XG4qL1xuXG4gIC8vIEV2ZW50c1xuICB7ZnVuYzogJ2tleUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleUNvZGUnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXlEb3duJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVdlbnREb3duJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVdlbnRVcCcsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlQcmVzc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlQcmVzc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ2tleVJlbGVhc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5VHlwZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlUeXBlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZVknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VYJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncG1vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlQnV0dG9uJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VJc1ByZXNzZWQnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZU1vdmVkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZU1vdmVkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZU1vdmVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlRHJhZ2dlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VEcmFnZ2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VQcmVzc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVJlbGVhc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVJlbGVhc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlQ2xpY2tlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VDbGlja2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VXaGVlbCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VXaGVlbCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VXaGVlbCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcblxuICAvLyBNYXRoXG4gIHtmdW5jOiAnc2luJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhbmdsZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjb3MnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2FuZ2xlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3RhbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYW5nbGUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXNpbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYWNvcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXRhbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXRhbjInLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3knLCd4J10sIHBhcmFtczogW1wiMTBcIiwgXCIxMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2RlZ3JlZXMnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3JhZGlhbnMnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncmFkaWFucycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnZGVncmVlcyddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmdsZU1vZGUnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21vZGUnXSwgcGFyYW1zOiBbXCJERUdSRUVTXCJdIH0sXG4gIHtmdW5jOiAncmFuZG9tJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydtaW4nLCdtYXgnXSwgcGFyYW1zOiBbXCIxXCIsIFwiNVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JhbmRvbUdhdXNzaWFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydtZWFuJywnc2QnXSwgcGFyYW1zOiBbXCIwXCIsIFwiMTVcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyYW5kb21TZWVkJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydzZWVkJ10sIHBhcmFtczogW1wiOTlcIl0gfSxcbiAge2Z1bmM6ICdhYnMnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIi0xXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnY2VpbCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMC4xXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnY29uc3RyYWluJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nLCdsb3cnLCdoaWdoJ10sIHBhcmFtczogW1wiMS4xXCIsIFwiMFwiLCBcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdkaXN0JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MiddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiMTAwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZXhwJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIxXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZmxvb3InLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjAuOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2xlcnAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3N0YXJ0Jywnc3RvcCcsJ2FtdCddLCBwYXJhbXM6IFtcIjBcIiwgXCIxMDBcIiwgXCIwLjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdsb2cnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtYWcnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2EnLCdiJ10sIHBhcmFtczogW1wiMTAwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWFwJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZScsJ3N0YXJ0MScsJ3N0b3AxJywnc3RhcnQyJywnc3RvcCddLCBwYXJhbXM6IFtcIjAuOVwiLCBcIjBcIiwgXCIxXCIsIFwiMFwiLCBcIjEwMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21heCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbjEnLCduMiddLCBwYXJhbXM6IFtcIjFcIixcIjNcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ24xJywnbjInXSwgcGFyYW1zOiBbXCIxXCIsIFwiM1wiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ25vcm0nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJywnc3RhcnQnLCdzdG9wJ10sIHBhcmFtczogW1wiOTBcIiwgXCIwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncG93JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyduJywnZSddLCBwYXJhbXM6IFtcIjEwXCIsIFwiMlwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JvdW5kJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIwLjlcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMlwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3NxcnQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjlcIl0sIHR5cGU6ICd2YWx1ZScgfSxcblxuICAvLyBBZHZhbmNlZFxuXTtcblxubW9kdWxlLmV4cG9ydHMuY2F0ZWdvcmllcyA9IHtcbiAgJ0dhbWUgTGFiJzoge1xuICAgIGNvbG9yOiAneWVsbG93JyxcbiAgICByZ2I6IENPTE9SX1lFTExPVyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIFNwcml0ZXM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBBbmltYXRpb25zOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgR3JvdXBzOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRGF0YToge1xuICAgIGNvbG9yOiAnbGlnaHRncmVlbicsXG4gICAgcmdiOiBDT0xPUl9MSUdIVF9HUkVFTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIERyYXdpbmc6IHtcbiAgICBjb2xvcjogJ2N5YW4nLFxuICAgIHJnYjogQ09MT1JfQ1lBTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEV2ZW50czoge1xuICAgIGNvbG9yOiAnZ3JlZW4nLFxuICAgIHJnYjogQ09MT1JfR1JFRU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBBZHZhbmNlZDoge1xuICAgIGNvbG9yOiAnYmx1ZScsXG4gICAgcmdiOiBDT0xPUl9CTFVFLFxuICAgIGJsb2NrczogW11cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzLmFkZGl0aW9uYWxQcmVkZWZWYWx1ZXMgPSBbXG4gICdQMkQnLCAnV0VCR0wnLCAnQVJST1cnLCAnQ1JPU1MnLCAnSEFORCcsICdNT1ZFJyxcbiAgJ1RFWFQnLCAnV0FJVCcsICdIQUxGX1BJJywgJ1BJJywgJ1FVQVJURVJfUEknLCAnVEFVJywgJ1RXT19QSScsICdERUdSRUVTJyxcbiAgJ1JBRElBTlMnLCAnQ09STkVSJywgJ0NPUk5FUlMnLCAnUkFESVVTJywgJ1JJR0hUJywgJ0xFRlQnLCAnQ0VOVEVSJywgJ1RPUCcsXG4gICdCT1RUT00nLCAnQkFTRUxJTkUnLCAnUE9JTlRTJywgJ0xJTkVTJywgJ1RSSUFOR0xFUycsICdUUklBTkdMRV9GQU4nLFxuICAnVFJJQU5HTEVfU1RSSVAnLCAnUVVBRFMnLCAnUVVBRF9TVFJJUCcsICdDTE9TRScsICdPUEVOJywgJ0NIT1JEJywgJ1BJRScsXG4gICdQUk9KRUNUJywgJ1NRVUFSRScsICdST1VORCcsICdCRVZFTCcsICdNSVRFUicsICdSR0InLCAnSFNCJywgJ0hTTCcsICdBVVRPJyxcbiAgJ0FMVCcsICdCQUNLU1BBQ0UnLCAnQ09OVFJPTCcsICdERUxFVEUnLCAnRE9XTl9BUlJPVycsICdFTlRFUicsICdFU0NBUEUnLFxuICAnTEVGVF9BUlJPVycsICdPUFRJT04nLCAnUkVUVVJOJywgJ1JJR0hUX0FSUk9XJywgJ1NISUZUJywgJ1RBQicsICdVUF9BUlJPVycsXG4gICdCTEVORCcsICdBREQnLCAnREFSS0VTVCcsICdMSUdIVEVTVCcsICdESUZGRVJFTkNFJywgJ0VYQ0xVU0lPTicsXG4gICdNVUxUSVBMWScsICdTQ1JFRU4nLCAnUkVQTEFDRScsICdPVkVSTEFZJywgJ0hBUkRfTElHSFQnLCAnU09GVF9MSUdIVCcsXG4gICdET0RHRScsICdCVVJOJywgJ1RIUkVTSE9MRCcsICdHUkFZJywgJ09QQVFVRScsICdJTlZFUlQnLCAnUE9TVEVSSVpFJyxcbiAgJ0RJTEFURScsICdFUk9ERScsICdCTFVSJywgJ05PUk1BTCcsICdJVEFMSUMnLCAnQk9MRCcsICdfREVGQVVMVF9URVhUX0ZJTEwnLFxuICAnX0RFRkFVTFRfTEVBRE1VTFQnLCAnX0NUWF9NSURETEUnLCAnTElORUFSJywgJ1FVQURSQVRJQycsICdCRVpJRVInLFxuICAnQ1VSVkUnLCAnX0RFRkFVTFRfU1RST0tFJywgJ19ERUZBVUxUX0ZJTEwnXG5dO1xubW9kdWxlLmV4cG9ydHMuc2hvd1BhcmFtRHJvcGRvd25zID0gdHJ1ZTtcbiIsIi8vIGxvY2FsZSBmb3IgZ2FtZWxhYlxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5nYW1lbGFiX2xvY2FsZTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg2LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG4nKTsxOTsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCgyMiwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbicpOzI1OyB9IDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKG51bGwsICdmb28nKTtcbn07XG4iLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuLypcbiAqIEFsbCBBUElzIGRpc2FibGVkIGZvciBub3cuIHA1L3A1cGxheSBpcyB0aGUgb25seSBleHBvc2VkIEFQSS4gSWYgd2Ugd2FudCB0b1xuICogZXhwb3NlIG90aGVyIHRvcC1sZXZlbCBBUElzLCB0aGV5IHNob3VsZCBiZSBpbmNsdWRlZCBoZXJlIGFzIHNob3duIGluIHRoZXNlXG4gKiBjb21tZW50ZWQgZnVuY3Rpb25zXG4gKlxuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uIChpZCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQoaWQsICdmb28nKTtcbn07XG4qL1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdhbWVMYWJTcHJpdGUgPSByZXF1aXJlKCcuL0dhbWVMYWJTcHJpdGUnKTtcbnZhciBhc3NldFByZWZpeCA9IHJlcXVpcmUoJy4uL2Fzc2V0TWFuYWdlbWVudC9hc3NldFByZWZpeCcpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBHYW1lTGFiUDUgY2xhc3MgdGhhdCB3cmFwcyBwNSBhbmQgcDVwbGF5IGFuZCBwYXRjaGVzIGl0IGluXG4gKiBzcGVjaWZpYyBwbGFjZXMgdG8gZW5hYmxlIEdhbWVMYWIgZnVuY3Rpb25hbGl0eVxuICovXG52YXIgR2FtZUxhYlA1ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB0aGlzLnA1ZXZlbnROYW1lcyA9IFtcbiAgICAnbW91c2VNb3ZlZCcsICdtb3VzZURyYWdnZWQnLCAnbW91c2VQcmVzc2VkJywgJ21vdXNlUmVsZWFzZWQnLFxuICAgICdtb3VzZUNsaWNrZWQnLCAnbW91c2VXaGVlbCcsXG4gICAgJ2tleVByZXNzZWQnLCAna2V5UmVsZWFzZWQnLCAna2V5VHlwZWQnXG4gIF07XG4gIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zID0gWydwcmVsb2FkJywgJ2RyYXcnLCAnc2V0dXAnXS5jb25jYXQodGhpcy5wNWV2ZW50TmFtZXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTGFiUDU7XG5cbkdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhpcyBHYW1lTGFiUDUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5nYW1lTGFiIGluc3RhbmNlIG9mIHBhcmVudCBHYW1lTGFiIG9iamVjdFxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25FeGVjdXRpb25TdGFydGluZyBjYWxsYmFjayB0byBydW4gZHVyaW5nIHA1IGluaXRcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uUHJlbG9hZCBjYWxsYmFjayB0byBydW4gZHVyaW5nIHByZWxvYWQoKVxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25TZXR1cCBjYWxsYmFjayB0byBydW4gZHVyaW5nIHNldHVwKClcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uRHJhdyBjYWxsYmFjayB0byBydW4gZHVyaW5nIGVhY2ggZHJhdygpXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgdGhpcy5vbkV4ZWN1dGlvblN0YXJ0aW5nID0gb3B0aW9ucy5vbkV4ZWN1dGlvblN0YXJ0aW5nO1xuICB0aGlzLm9uUHJlbG9hZCA9IG9wdGlvbnMub25QcmVsb2FkO1xuICB0aGlzLm9uU2V0dXAgPSBvcHRpb25zLm9uU2V0dXA7XG4gIHRoaXMub25EcmF3ID0gb3B0aW9ucy5vbkRyYXc7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5zZXR1cEdsb2JhbE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZvciBuby1za2V0Y2ggR2xvYmFsIG1vZGVcbiAgICAgKi9cbiAgICB2YXIgcDUgPSB3aW5kb3cucDU7XG5cbiAgICB0aGlzLl9pc0dsb2JhbCA9IHRydWU7XG4gICAgLy8gTG9vcCB0aHJvdWdoIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZSBhbmQgYXR0YWNoIHRoZW0gdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAgaW4gcDUucHJvdG90eXBlKSB7XG4gICAgICBpZih0eXBlb2YgcDUucHJvdG90eXBlW3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBldiA9IHAuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShldikpIHtcbiAgICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBdHRhY2ggaXRzIHByb3BlcnRpZXMgdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAyIGluIHRoaXMpIHtcbiAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KHAyKSkge1xuICAgICAgICB3aW5kb3dbcDJdID0gdGhpc1twMl07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHA1LmxvYWRJbWFnZSBzbyB3ZSBjYW4gbW9kaWZ5IHRoZSBVUkwgcGF0aCBwYXJhbVxuICBpZiAoIUdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UpIHtcbiAgICBHYW1lTGFiUDUuYmFzZVA1bG9hZEltYWdlID0gd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2U7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbiAocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIHBhdGggPSBhc3NldFByZWZpeC5maXhQYXRoKHBhdGgpO1xuICAgICAgcmV0dXJuIEdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UuY2FsbCh0aGlzLCBwYXRoLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHA1LnJlZHJhdyB0byBtYWtlIGl0IHR3by1waGFzZSBhZnRlciB1c2VyRHJhdygpXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUucmVkcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmcm9tIHJlZHJhdygpXG4gICAgICovXG4gICAgdmFyIHVzZXJTZXR1cCA9IHRoaXMuc2V0dXAgfHwgd2luZG93LnNldHVwO1xuICAgIHZhciB1c2VyRHJhdyA9IHRoaXMuZHJhdyB8fCB3aW5kb3cuZHJhdztcbiAgICBpZiAodHlwZW9mIHVzZXJEcmF3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnB1c2goKTtcbiAgICAgIGlmICh0eXBlb2YgdXNlclNldHVwID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLnNjYWxlKHRoaXMucGl4ZWxEZW5zaXR5LCB0aGlzLnBpeGVsRGVuc2l0eSk7XG4gICAgICB9XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9yZWdpc3RlcmVkTWV0aG9kcy5wcmUuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgICBmLmNhbGwoc2VsZik7XG4gICAgICB9KTtcbiAgICAgIHVzZXJEcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIENyZWF0ZSAybmQgcGhhc2UgZnVuY3Rpb24gYWZ0ZXJVc2VyRHJhdygpXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuYWZ0ZXJVc2VyRHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZyb20gcmVkcmF3KClcbiAgICAgKi9cbiAgICB0aGlzLl9yZWdpc3RlcmVkTWV0aG9kcy5wb3N0LmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgIGYuY2FsbChzZWxmKTtcbiAgICB9KTtcbiAgICB0aGlzLnBvcCgpO1xuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHA1LmNyZWF0ZVNwcml0ZSBzbyB3ZSBjYW4gcmVwbGFjZSB0aGUgQUFCQm9wcygpIGZ1bmN0aW9uXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuY3JlYXRlU3ByaXRlID0gZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNXBsYXkgZnJvbSBjcmVhdGVTcHJpdGUoKVxuICAgICAqL1xuICAgIHZhciBzID0gbmV3IHdpbmRvdy5TcHJpdGUoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcy5BQUJCb3BzID0gZ2FtZUxhYlNwcml0ZS5BQUJCb3BzO1xuICAgIHMuZGVwdGggPSB3aW5kb3cuYWxsU3ByaXRlcy5tYXhEZXB0aCgpKzE7XG4gICAgd2luZG93LmFsbFNwcml0ZXMuYWRkKHMpO1xuICAgIHJldHVybiBzO1xuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHdpbmRvdy5Hcm91cCBzbyB3ZSBjYW4gb3ZlcnJpZGUgdGhlIG1ldGhvZHMgdGhhdCB0YWtlIGNhbGxiYWNrXG4gIC8vIHBhcmFtZXRlcnNcbiAgdmFyIGJhc2VHcm91cENvbnN0cnVjdG9yID0gd2luZG93Lkdyb3VwO1xuICB3aW5kb3cuR3JvdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gYmFzZUdyb3VwQ29uc3RydWN0b3IoKTtcblxuICAgIC8qXG4gICAgICogQ3JlYXRlIG5ldyBoZWxwZXIgY2FsbGVkIGNhbGxBQUJCb3BzRm9yQWxsKCkgd2hpY2ggY2FuIGJlIGNhbGxlZCBhcyBhXG4gICAgICogc3RhdGVmdWwgbmF0aXZlRnVuYyBieSB0aGUgaW50ZXJwcmV0ZXIuIFRoaXMgZW5hYmxlcyB0aGUgbmF0aXZlIG1ldGhvZCB0b1xuICAgICAqIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBzbyB0aGF0IGl0IGNhbiBnbyBhc3luY2hyb25vdXMgZXZlcnkgdGltZSBpdFxuICAgICAqIChvciBhbnkgbmF0aXZlIGZ1bmN0aW9uIHRoYXQgaXQgY2FsbHMsIHN1Y2ggYXMgQUFCQm9wcykgd2FudHMgdG8gZXhlY3V0ZVxuICAgICAqIGEgY2FsbGJhY2sgYmFjayBpbnRvIGludGVycHJldGVyIGNvZGUuIFRoZSBpbnRlcnByZXRlciBzdGF0ZSBvYmplY3QgaXNcbiAgICAgKiByZXRyaWV2ZWQgYnkgY2FsbGluZyBKU0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpLlxuICAgICAqXG4gICAgICogQWRkaXRpb25hbCBwcm9wZXJ0aWVzIGNhbiBiZSBzZXQgb24gdGhlIHN0YXRlIG9iamVjdCB0byB0cmFjayBzdGF0ZVxuICAgICAqIGFjcm9zcyB0aGUgbXVsdGlwbGUgZXhlY3V0aW9ucy4gSWYgdGhlIGZ1bmN0aW9uIHdhbnRzIHRvIGJlIGNhbGxlZCBhZ2FpbixcbiAgICAgKiBpdCBzaG91bGQgc2V0IHN0YXRlLmRvbmVFeGVjIHRvIGZhbHNlLiBXaGVuIHRoZSBmdW5jdGlvbiBpcyBjb21wbGV0ZSBhbmRcbiAgICAgKiBubyBsb25nZXIgd2FudHMgdG8gYmUgY2FsbGVkIGluIGEgbG9vcCBieSB0aGUgaW50ZXJwcmV0ZXIsIGl0IHNob3VsZCBzZXRcbiAgICAgKiBzdGF0ZS5kb25lRXhlYyB0byB0cnVlIGFuZCByZXR1cm4gYSB2YWx1ZS5cbiAgICAgKi9cbiAgICBhcnJheS5jYWxsQUFCQm9wc0ZvckFsbCA9IGZ1bmN0aW9uKHR5cGUsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBzdGF0ZSA9IG9wdGlvbnMuZ2FtZUxhYi5KU0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpO1xuICAgICAgaWYgKCFzdGF0ZS5fX2kpIHtcbiAgICAgICAgc3RhdGUuX19pID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5fX2kgPCB0aGlzLnNpemUoKSkge1xuICAgICAgICBpZiAoIXN0YXRlLl9fc3ViU3RhdGUpIHtcbiAgICAgICAgICAvLyBCZWZvcmUgd2UgY2FsbCBBQUJCb3BzIChhbm90aGVyIHN0YXRlZnVsIGZ1bmN0aW9uKSwgaGFuZyBhIF9fc3ViU3RhdGVcbiAgICAgICAgICAvLyBvZmYgb2Ygc3RhdGUsIHNvIGl0IGNhbiB1c2UgdGhhdCBpbnN0ZWFkIHRvIHRyYWNrIGl0cyBzdGF0ZTpcbiAgICAgICAgICBzdGF0ZS5fX3N1YlN0YXRlID0geyBkb25lRXhlYzogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0KHN0YXRlLl9faSkuQUFCQm9wcyh0eXBlLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKHN0YXRlLl9fc3ViU3RhdGUuZG9uZUV4ZWMpIHtcbiAgICAgICAgICAvLyBOb3RlOiBpZ25vcmluZyByZXR1cm4gdmFsdWUgZnJvbSBlYWNoIEFBQkJvcHMoKSBjYWxsXG4gICAgICAgICAgZGVsZXRlIHN0YXRlLl9fc3ViU3RhdGU7XG4gICAgICAgICAgc3RhdGUuX19pKys7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZG9uZUV4ZWMgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLmRvbmVFeGVjID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUmVwbGFjZSB0aGVzZSBmb3VyIG1ldGhvZHMgdGhhdCB0YWtlIGNhbGxiYWNrIHBhcmFtZXRlcnMgdG8gdXNlIHRoZSBuZXdcbiAgICAvLyBjYWxsQUFCQm9wc0ZvckFsbCgpIGhlbHBlcjpcblxuICAgIGFycmF5Lm92ZXJsYXAgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxBQUJCb3BzRm9yQWxsKFwib3ZlcmxhcFwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXJyYXkuY29sbGlkZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJjb2xsaWRlXCIsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhcnJheS5kaXNwbGFjZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJkaXNwbGFjZVwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXJyYXkuYm91bmNlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsQUFCQm9wc0ZvckFsbChcImJvdW5jZVwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuXG59O1xuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWJQNSB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gQ2FsbGVkIGJlZm9yZSBlYWNoIHRpbWUgaXQgaXMgdXNlZC5cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5yZXNldEV4ZWN1dGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICBpZiAodGhpcy5wNSkge1xuICAgIHRoaXMucDUucmVtb3ZlKCk7XG4gICAgdGhpcy5wNSA9IG51bGw7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuXG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHZhcmlvdXMgcDUvcDVwbGF5IGluaXQgY29kZVxuICAgICAqL1xuXG4gICAgLy8gQ2xlYXIgcmVnaXN0ZXJlZCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGU6XG4gICAgZm9yICh2YXIgbWVtYmVyIGluIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzKSB7XG4gICAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHNbbWVtYmVyXTtcbiAgICB9XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMgPSB7IHByZTogW10sIHBvc3Q6IFtdLCByZW1vdmU6IFtdIH07XG4gICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRQcmVsb2FkTWV0aG9kcy5nYW1lbGFiUHJlbG9hZDtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuYWxsU3ByaXRlcyA9IG5ldyB3aW5kb3cuR3JvdXAoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnNwcml0ZVVwZGF0ZSA9IHRydWU7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYSA9IG5ldyB3aW5kb3cuQ2FtZXJhKDAsIDAsIDEpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhLmluaXQgPSBmYWxzZTtcblxuICAgIC8va2V5Ym9hcmQgaW5wdXRcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnJlYWRQcmVzc2VzKTtcblxuICAgIC8vYXV0b21hdGljIHNwcml0ZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnVwZGF0ZVNwcml0ZXMpO1xuXG4gICAgLy9xdWFkdHJlZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LnVwZGF0ZVRyZWUpO1xuXG4gICAgLy9jYW1lcmEgcHVzaCBhbmQgcG9wXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LmNhbWVyYVB1c2gpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cuY2FtZXJhUG9wKTtcblxuICB9XG5cbiAgLy8gSW1wb3J0YW50IHRvIHJlc2V0IHRoZXNlIGFmdGVyIHRoaXMucDUgaGFzIGJlZW4gcmVtb3ZlZCBhYm92ZVxuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5nYW1lbGFiUHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IHdpbmRvdy5wNS5fZ2V0RGVjcmVtZW50UHJlbG9hZChhcmd1bWVudHMsIHRoaXMucDUpO1xuICB9LmJpbmQodGhpcyk7XG59O1xuXG4vKipcbiAqIEluc3RhbnRpYXRlIGEgbmV3IHA1IGFuZCBzdGFydCBleGVjdXRpb25cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5zdGFydEV4ZWN1dGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAvKiBqc2hpbnQgbm9uZXc6ZmFsc2UgKi9cbiAgbmV3IHdpbmRvdy5wNShmdW5jdGlvbiAocDVvYmopIHtcbiAgICAgIHRoaXMucDUgPSBwNW9iajtcblxuICAgICAgcDVvYmoucmVnaXN0ZXJQcmVsb2FkTWV0aG9kKCdnYW1lbGFiUHJlbG9hZCcsIHdpbmRvdy5wNS5wcm90b3R5cGUpO1xuXG4gICAgICAvLyBPdmVybG9hZCBfZHJhdyBmdW5jdGlvbiB0byBtYWtlIGl0IHR3by1waGFzZVxuICAgICAgcDVvYmouX2RyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX2RyYXcoKVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGhpc0ZyYW1lVGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdmFyIHRpbWVfc2luY2VfbGFzdCA9IHRoaXMuX3RoaXNGcmFtZVRpbWUgLSB0aGlzLl9sYXN0RnJhbWVUaW1lO1xuICAgICAgICB2YXIgdGFyZ2V0X3RpbWVfYmV0d2Vlbl9mcmFtZXMgPSAxMDAwIC8gdGhpcy5fdGFyZ2V0RnJhbWVSYXRlO1xuXG4gICAgICAgIC8vIG9ubHkgZHJhdyBpZiB3ZSByZWFsbHkgbmVlZCB0bzsgZG9uJ3Qgb3ZlcmV4dGVuZCB0aGUgYnJvd3Nlci5cbiAgICAgICAgLy8gZHJhdyBpZiB3ZSdyZSB3aXRoaW4gNW1zIG9mIHdoZW4gb3VyIG5leHQgZnJhbWUgc2hvdWxkIHBhaW50XG4gICAgICAgIC8vICh0aGlzIHdpbGwgcHJldmVudCB1cyBmcm9tIGdpdmluZyB1cCBvcHBvcnR1bml0aWVzIHRvIGRyYXdcbiAgICAgICAgLy8gYWdhaW4gd2hlbiBpdCdzIHJlYWxseSBhYm91dCB0aW1lIGZvciB1cyB0byBkbyBzbykuIGZpeGVzIGFuXG4gICAgICAgIC8vIGlzc3VlIHdoZXJlIHRoZSBmcmFtZVJhdGUgaXMgdG9vIGxvdyBpZiBvdXIgcmVmcmVzaCBsb29wIGlzbid0XG4gICAgICAgIC8vIGluIHN5bmMgd2l0aCB0aGUgYnJvd3Nlci4gbm90ZSB0aGF0IHdlIGhhdmUgdG8gZHJhdyBvbmNlIGV2ZW5cbiAgICAgICAgLy8gaWYgbG9vcGluZyBpcyBvZmYsIHNvIHdlIGJ5cGFzcyB0aGUgdGltZSBkZWxheSBpZiB0aGF0XG4gICAgICAgIC8vIGlzIHRoZSBjYXNlLlxuICAgICAgICB2YXIgZXBzaWxvbiA9IDU7XG4gICAgICAgIGlmICghdGhpcy5sb29wIHx8XG4gICAgICAgICAgICB0aW1lX3NpbmNlX2xhc3QgPj0gdGFyZ2V0X3RpbWVfYmV0d2Vlbl9mcmFtZXMgLSBlcHNpbG9uKSB7XG4gICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkoJ2ZyYW1lQ291bnQnLCB0aGlzLmZyYW1lQ291bnQgKyAxKTtcbiAgICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2RyYXdFcGlsb2d1ZSgpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICBwNW9iai5hZnRlclJlZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfZHJhdygpXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl91cGRhdGVQQWNjZWxlcmF0aW9ucygpO1xuICAgICAgICB0aGlzLl91cGRhdGVQUm90YXRpb25zKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBNb3VzZUNvb3JkcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVQVG91Y2hDb29yZHMoKTtcbiAgICAgICAgdGhpcy5fZnJhbWVSYXRlID0gMTAwMC4wLyh0aGlzLl90aGlzRnJhbWVUaW1lIC0gdGhpcy5fbGFzdEZyYW1lVGltZSk7XG4gICAgICAgIHRoaXMuX2xhc3RGcmFtZVRpbWUgPSB0aGlzLl90aGlzRnJhbWVUaW1lO1xuXG4gICAgICAgIHRoaXMuX2RyYXdFcGlsb2d1ZSgpO1xuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgcDVvYmouX2RyYXdFcGlsb2d1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfZHJhdygpXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vbWFuZGF0b3J5IHVwZGF0ZSB2YWx1ZXMobWF0cml4cyBhbmQgc3RhY2spIGZvciAzZFxuICAgICAgICBpZih0aGlzLl9yZW5kZXJlci5pc1AzRCl7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIuX3VwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2V0IG5vdGlmaWVkIHRoZSBuZXh0IHRpbWUgdGhlIGJyb3dzZXIgZ2l2ZXMgdXNcbiAgICAgICAgLy8gYW4gb3Bwb3J0dW5pdHkgdG8gZHJhdy5cbiAgICAgICAgaWYgKHRoaXMuX2xvb3ApIHtcbiAgICAgICAgICB0aGlzLl9yZXF1ZXN0QW5pbUlkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9kcmF3KTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgLy8gT3ZlcmxvYWQgX3NldHVwIGZ1bmN0aW9uIHRvIG1ha2UgaXQgdHdvLXBoYXNlXG4gICAgICBwNW9iai5fc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfc2V0dXAoKVxuICAgICAgICAgKi9cblxuICAgICAgICAvLyByZXR1cm4gcHJlbG9hZCBmdW5jdGlvbnMgdG8gdGhlaXIgbm9ybWFsIHZhbHMgaWYgc3dpdGNoZWQgYnkgcHJlbG9hZFxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX2lzR2xvYmFsID8gd2luZG93IDogdGhpcztcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0LnByZWxvYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBmb3IgKHZhciBmIGluIHRoaXMuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICAgICAgICBjb250ZXh0W2ZdID0gdGhpcy5fcHJlbG9hZE1ldGhvZHNbZl1bZl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2hvcnQtY2lyY3VpdCBvbiB0aGlzLCBpbiBjYXNlIHNvbWVvbmUgdXNlZCB0aGUgbGlicmFyeSBpbiBcImdsb2JhbFwiXG4gICAgICAgIC8vIG1vZGUgZWFybGllclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQuc2V0dXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb250ZXh0LnNldHVwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2V0dXBFcGlsb2d1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIHA1b2JqLl9zZXR1cEVwaWxvZ3VlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9zZXR1cCgpXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vIC8vIHVuaGlkZSBoaWRkZW4gY2FudmFzIHRoYXQgd2FzIGNyZWF0ZWRcbiAgICAgICAgLy8gdGhpcy5jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICAgICAgICAvLyB0aGlzLmNhbnZhcy5jbGFzc05hbWUgPSB0aGlzLmNhbnZhcy5jbGFzc05hbWUucmVwbGFjZSgncDVfaGlkZGVuJywgJycpO1xuXG4gICAgICAgIC8vIHVuaGlkZSBhbnkgaGlkZGVuIGNhbnZhc2VzIHRoYXQgd2VyZSBjcmVhdGVkXG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKC8oXnxcXHMpcDVfaGlkZGVuKD8hXFxTKS9nKTtcbiAgICAgICAgdmFyIGNhbnZhc2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncDVfaGlkZGVuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FudmFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgayA9IGNhbnZhc2VzW2ldO1xuICAgICAgICAgIGsuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICAgICAgICAgIGsuY2xhc3NOYW1lID0gay5jbGFzc05hbWUucmVwbGFjZShyZWcsICcnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXR1cERvbmUgPSB0cnVlO1xuXG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICAvLyBEbyB0aGlzIGFmdGVyIHdlJ3JlIGRvbmUgbW9ua2V5aW5nIHdpdGggdGhlIHA1b2JqIGluc3RhbmNlIG1ldGhvZHM6XG4gICAgICBwNW9iai5zZXR1cEdsb2JhbE1vZGUoKTtcblxuICAgICAgd2luZG93LnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENhbGwgb3VyIGdhbWVsYWJQcmVsb2FkKCkgdG8gZm9yY2UgX3N0YXJ0L19zZXR1cCB0byB3YWl0LlxuICAgICAgICB3aW5kb3cuZ2FtZWxhYlByZWxvYWQoKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBwNSBcInByZWxvYWQgbWV0aG9kc1wiIHdlcmUgbW9kaWZpZWQgYmVmb3JlIHRoaXMgcHJlbG9hZCBmdW5jdGlvbiB3YXNcbiAgICAgICAgICogY2FsbGVkIGFuZCBzdWJzdGl0dXRlZCB3aXRoIHdyYXBwZWQgdmVyc2lvbiB0aGF0IGluY3JlbWVudCBhIHByZWxvYWRcbiAgICAgICAgICogY291bnQgYW5kIHdpbGwgbGF0ZXIgZGVjcmVtZW50IGEgcHJlbG9hZCBjb3VudCB1cG9uIGFzeW5jIGxvYWRcbiAgICAgICAgICogY29tcGxldGlvbi4gU2luY2UgcDUgaXMgcnVubmluZyBpbiBnbG9iYWwgbW9kZSwgaXQgb25seSB3cmFwcGVkIHRoZVxuICAgICAgICAgKiBtZXRob2RzIG9uIHRoZSB3aW5kb3cgb2JqZWN0LiBXZSBuZWVkIHRvIHBsYWNlIHRoZSB3cmFwcGVkIG1ldGhvZHMgb25cbiAgICAgICAgICogdGhlIHA1IG9iamVjdCBhcyB3ZWxsIGJlZm9yZSB3ZSBtYXJzaGFsIHRvIHRoZSBpbnRlcnByZXRlclxuICAgICAgICAgKi9cbiAgICAgICAgZm9yICh2YXIgbWV0aG9kIGluIHRoaXMucDUuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICAgICAgdGhpcy5wNVttZXRob2RdID0gd2luZG93W21ldGhvZF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9uUHJlbG9hZCgpO1xuXG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB3aW5kb3cuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIHA1IFwicHJlbG9hZCBtZXRob2RzXCIgaGF2ZSBub3cgYmVlbiByZXN0b3JlZCBhbmQgdGhlIHdyYXBwZWQgdmVyc2lvblxuICAgICAgICAgKiBhcmUgbm8gbG9uZ2VyIGluIHVzZS4gU2luY2UgcDUgaXMgcnVubmluZyBpbiBnbG9iYWwgbW9kZSwgaXQgb25seVxuICAgICAgICAgKiByZXN0b3JlZCB0aGUgbWV0aG9kcyBvbiB0aGUgd2luZG93IG9iamVjdC4gV2UgbmVlZCB0byByZXN0b3JlIHRoZVxuICAgICAgICAgKiBtZXRob2RzIG9uIHRoZSBwNSBvYmplY3QgdG8gbWF0Y2hcbiAgICAgICAgICovXG4gICAgICAgIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLnA1Ll9wcmVsb2FkTWV0aG9kcykge1xuICAgICAgICAgIHRoaXMucDVbbWV0aG9kXSA9IHdpbmRvd1ttZXRob2RdO1xuICAgICAgICB9XG5cbiAgICAgICAgcDVvYmouY3JlYXRlQ2FudmFzKDQwMCwgNDAwKTtcblxuICAgICAgICB0aGlzLm9uU2V0dXAoKTtcblxuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICB3aW5kb3cuZHJhdyA9IHRoaXMub25EcmF3LmJpbmQodGhpcyk7XG5cbiAgICAgIHRoaXMub25FeGVjdXRpb25TdGFydGluZygpO1xuXG4gICAgfS5iaW5kKHRoaXMpLFxuICAgICdkaXZHYW1lTGFiJyk7XG4gIC8qIGpzaGludCBub25ldzp0cnVlICovXG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIGFsbCBnbG9iYWwgY29kZSBpcyBkb25lIGV4ZWN1dGluZy4gVGhpcyBhbGxvd3MgdXMgdG8gcmVsZWFzZVxuICogb3VyIFwicHJlbG9hZFwiIGNvdW50IHJlZmVyZW5jZSBpbiBwNSwgd2hpY2ggbWVhbnMgdGhhdCBzZXR1cCgpIGNhbiBiZWdpbi5cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5ub3RpZnlVc2VyR2xvYmFsQ29kZUNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5wNWRlY3JlbWVudFByZWxvYWQpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCgpO1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcbiAgfVxufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRDdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogdGhpcy5wNSxcbiAgICBoZWlnaHQ6IHRoaXMucDUsXG4gICAgZGlzcGxheVdpZHRoOiB0aGlzLnA1LFxuICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgd2luZG93V2lkdGg6IHRoaXMucDUsXG4gICAgd2luZG93SGVpZ2h0OiB0aGlzLnA1LFxuICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgZnJhbWVDb3VudDogdGhpcy5wNSxcbiAgICBrZXlJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAga2V5OiB0aGlzLnA1LFxuICAgIGtleUNvZGU6IHRoaXMucDUsXG4gICAgbW91c2VYOiB0aGlzLnA1LFxuICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICBwbW91c2VYOiB0aGlzLnA1LFxuICAgIHBtb3VzZVk6IHRoaXMucDUsXG4gICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgIHdpbk1vdXNlWTogdGhpcy5wNSxcbiAgICBwd2luTW91c2VYOiB0aGlzLnA1LFxuICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgbW91c2VCdXR0b246IHRoaXMucDUsXG4gICAgbW91c2VJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgIHRvdWNoWTogdGhpcy5wNSxcbiAgICBwdG91Y2hYOiB0aGlzLnA1LFxuICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgdG91Y2hlczogdGhpcy5wNSxcbiAgICB0b3VjaElzRG93bjogdGhpcy5wNSxcbiAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgZGV2aWNlT3JpZW50YXRpb246IHRoaXMucDUsXG4gICAgYWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgIGFjY2VsZXJhdGlvblo6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblg6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblo6IHRoaXMucDUsXG4gICAgcm90YXRpb25YOiB0aGlzLnA1LFxuICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICByb3RhdGlvblo6IHRoaXMucDUsXG4gICAgcFJvdGF0aW9uWDogdGhpcy5wNSxcbiAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgIHBSb3RhdGlvblo6IHRoaXMucDVcbiAgfTtcbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuZ2V0Q3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgaW5zdGFuY2U6IHdpbmRvdy5TcHJpdGUsXG4gICAgICBtZXRob2RPcHRzOiB7XG4gICAgICAgIG5hdGl2ZUNhbGxzQmFja0ludGVycHJldGVyOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBUaGUgcDVwbGF5IEdyb3VwIG9iamVjdCBzaG91bGQgYmUgY3VzdG9tIG1hcnNoYWxsZWQsIGJ1dCBpdHMgY29uc3RydWN0b3JcbiAgICAvLyBhY3R1YWxseSBjcmVhdGVzIGEgc3RhbmRhcmQgQXJyYXkgaW5zdGFuY2Ugd2l0aCBhIGZldyBhZGRpdGlvbmFsIG1ldGhvZHNcbiAgICAvLyBhZGRlZC4gV2Ugc29sdmUgdGhpcyBieSBwdXR0aW5nIFwiQXJyYXlcIiBpbiB0aGlzIGxpc3QsIGJ1dCB3aXRoIFwiZHJhd1wiIGFzXG4gICAgLy8gYSByZXF1aXJlZE1ldGhvZDpcbiAgICB7XG4gICAgICBpbnN0YW5jZTogQXJyYXksXG4gICAgICByZXF1aXJlZE1ldGhvZDogJ2RyYXcnLFxuICAgICAgbWV0aG9kT3B0czoge1xuICAgICAgICBuYXRpdmVDYWxsc0JhY2tJbnRlcnByZXRlcjogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1IH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LkNhbWVyYSB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5BbmltYXRpb24gfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVmVjdG9yIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkNvbG9yIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkltYWdlIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LlJlbmRlcmVyIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkdyYXBoaWNzIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkZvbnQgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVGFibGUgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVGFibGVSb3cgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuRWxlbWVudCB9LFxuICBdO1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRHbG9iYWxQcm9wZXJ0eUxpc3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHByb3BMaXN0ID0ge307XG5cbiAgLy8gSW5jbHVkZSBldmVyeSBwcm9wZXJ0eSBvbiB0aGUgcDUgaW5zdGFuY2UgaW4gdGhlIGdsb2JhbCBwcm9wZXJ0eSBsaXN0OlxuICBmb3IgKHZhciBwcm9wIGluIHRoaXMucDUpIHtcbiAgICBwcm9wTGlzdFtwcm9wXSA9IFsgdGhpcy5wNVtwcm9wXSwgdGhpcy5wNSBdO1xuICB9XG4gIC8vIEFuZCB0aGUgR3JvdXAgY29uc3RydWN0b3IgZnJvbSBwNXBsYXk6XG4gIHByb3BMaXN0Lkdyb3VwID0gWyB3aW5kb3cuR3JvdXAsIHdpbmRvdyBdO1xuICAvLyBBbmQgYWxzbyBjcmVhdGUgYSAncDUnIG9iamVjdCBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZTpcbiAgcHJvcExpc3QucDUgPSBbIHsgVmVjdG9yOiB3aW5kb3cucDUuVmVjdG9yIH0sIHdpbmRvdyBdO1xuXG4gIHJldHVybiBwcm9wTGlzdDtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGZyYW1lIHJhdGVcbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRGcmFtZVJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnA1ID8gdGhpcy5wNS5mcmFtZVJhdGUoKSA6IDA7XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmFmdGVyRHJhd0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnA1LmFmdGVyVXNlckRyYXcoKTtcbiAgdGhpcy5wNS5hZnRlclJlZHJhdygpO1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5hZnRlclNldHVwQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucDUuX3NldHVwRXBpbG9ndWUoKTtcbn07XG4iLCIvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuLypcbiAqIE92ZXJyaWRlIFNwcml0ZS5BQUJCb3BzIHNvIGl0IGNhbiBiZSBjYWxsZWQgYXMgYSBzdGF0ZWZ1bCBuYXRpdmVGdW5jIGJ5IHRoZVxuICogaW50ZXJwcmV0ZXIuIFRoaXMgZW5hYmxlcyB0aGUgbmF0aXZlIG1ldGhvZCB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgc29cbiAqIHRoYXQgaXQgY2FuIGdvIGFzeW5jaHJvbm91cyBldmVyeSB0aW1lIGl0IHdhbnRzIHRvIGV4ZWN1dGUgYSBjYWxsYmFjayBiYWNrXG4gKiBpbnRvIGludGVycHJldGVyIGNvZGUuIFRoZSBpbnRlcnByZXRlciBzdGF0ZSBvYmplY3QgaXMgcmV0cmlldmVkIGJ5IGNhbGxpbmdcbiAqIGpzSW50ZXJwcmV0ZXIuZ2V0Q3VycmVudFN0YXRlKCkuXG4gKlxuICogQWRkaXRpb25hbCBwcm9wZXJ0aWVzIGNhbiBiZSBzZXQgb24gdGhlIHN0YXRlIG9iamVjdCB0byB0cmFjayBzdGF0ZSBhY3Jvc3NcbiAqIHRoZSBtdWx0aXBsZSBleGVjdXRpb25zLiBJZiB0aGUgZnVuY3Rpb24gd2FudHMgdG8gYmUgY2FsbGVkIGFnYWluLCBpdCBzaG91bGRcbiAqIHNldCBzdGF0ZS5kb25lRXhlYyB0byBmYWxzZS4gV2hlbiB0aGUgZnVuY3Rpb24gaXMgY29tcGxldGUgYW5kIG5vIGxvbmdlclxuICogd2FudHMgdG8gYmUgY2FsbGVkIGluIGEgbG9vcCBieSB0aGUgaW50ZXJwcmV0ZXIsIGl0IHNob3VsZCBzZXQgc3RhdGUuZG9uZUV4ZWNcbiAqIHRvIHRydWUgYW5kIHJldHVybiBhIHZhbHVlLlxuICovXG5cbnZhciBqc0ludGVycHJldGVyO1xuXG5tb2R1bGUuZXhwb3J0cy5pbmplY3RKU0ludGVycHJldGVyID0gZnVuY3Rpb24gKGpzaSkge1xuICBqc0ludGVycHJldGVyID0ganNpO1xufTtcblxuLypcbiAqIENvcGllZCBjb2RlIGZyb20gcDVwbGF5IGZyb20gU3ByaXRlKCkgd2l0aCB0YXJnZXRlZCBtb2RpZmljYXRpb25zIHRoYXRcbiAqIHVzZSB0aGUgYWRkaXRpb25hbCBzdGF0ZSBwYXJhbWV0ZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMuQUFCQm9wcyA9IGZ1bmN0aW9uKHR5cGUsIHRhcmdldCwgY2FsbGJhY2spIHtcblxuICB2YXIgc3RhdGUgPSBqc0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpO1xuICBpZiAoc3RhdGUuX19zdWJTdGF0ZSkge1xuICAgIC8vIElmIHdlJ3JlIGJlaW5nIGNhbGxlZCBieSBhbm90aGVyIHN0YXRlZnVsIGZ1bmN0aW9uIHRoYXQgaHVuZyBhIF9fc3ViU3RhdGVcbiAgICAvLyBvZmYgb2Ygc3RhdGUsIHVzZSB0aGF0IGluc3RlYWQ6XG4gICAgc3RhdGUgPSBzdGF0ZS5fX3N1YlN0YXRlO1xuICB9XG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiBzdGF0ZS5fX2kgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3RhdGUuX19pID0gMDtcblxuICAgIHRoaXMudG91Y2hpbmcubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hpbmcucmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnRvdWNoaW5nLnRvcCA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hpbmcuYm90dG9tID0gZmFsc2U7XG5cbiAgICAvL2lmIHNpbmdsZSBzcHJpdGUgdHVybiBpbnRvIGFycmF5IGFueXdheVxuICAgIHN0YXRlLl9fb3RoZXJzID0gW107XG5cbiAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBTcHJpdGUpXG4gICAgICBzdGF0ZS5fX290aGVycy5wdXNoKHRhcmdldCk7XG4gICAgZWxzZSBpZih0YXJnZXQgaW5zdGFuY2VvZiBBcnJheSlcbiAgICB7XG4gICAgICBpZihxdWFkVHJlZSAhPSB1bmRlZmluZWQgJiYgcXVhZFRyZWUuYWN0aXZlKVxuICAgICAgICBzdGF0ZS5fX290aGVycyA9IHF1YWRUcmVlLnJldHJpZXZlRnJvbUdyb3VwKCB0aGlzLCB0YXJnZXQpO1xuXG4gICAgICBpZihzdGF0ZS5fX290aGVycy5sZW5ndGggPT0gMClcbiAgICAgICAgc3RhdGUuX19vdGhlcnMgPSB0YXJnZXQ7XG5cbiAgICB9XG4gICAgZWxzZVxuICAgICAgdGhyb3coXCJFcnJvcjogb3ZlcmxhcCBjYW4gb25seSBiZSBjaGVja2VkIGJldHdlZW4gc3ByaXRlcyBvciBncm91cHNcIik7XG5cbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5fX2krKztcbiAgfVxuICBpZiAoc3RhdGUuX19pIDwgc3RhdGUuX19vdGhlcnMubGVuZ3RoKSB7XG4gICAgdmFyIGkgPSBzdGF0ZS5fX2k7XG5cbiAgICBpZih0aGlzICE9IHN0YXRlLl9fb3RoZXJzW2ldICYmICF0aGlzLnJlbW92ZWQpIC8veW91IGNhbiBjaGVjayBjb2xsaXNpb25zIHdpdGhpbiB0aGUgc2FtZSBncm91cCBidXQgbm90IG9uIGl0c2VsZlxuICAgIHtcbiAgICAgIHZhciBvdGhlciA9IHN0YXRlLl9fb3RoZXJzW2ldO1xuXG4gICAgICBpZih0aGlzLmNvbGxpZGVyID09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5zZXREZWZhdWx0Q29sbGlkZXIoKTtcblxuICAgICAgaWYob3RoZXIuY29sbGlkZXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICBvdGhlci5zZXREZWZhdWx0Q29sbGlkZXIoKTtcblxuICAgICAgLypcbiAgICAgIGlmKHRoaXMuY29sbGlkZXJUeXBlPT1cImRlZmF1bHRcIiAmJiBhbmltYXRpb25zW2N1cnJlbnRBbmltYXRpb25dIT1udWxsKVxuICAgICAge1xuICAgICAgICBwcmludChcImJ1c3RlZFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSovXG4gICAgICBpZih0aGlzLmNvbGxpZGVyICE9IHVuZGVmaW5lZCAmJiBvdGhlci5jb2xsaWRlciAhPSB1bmRlZmluZWQpXG4gICAgICB7XG4gICAgICBpZih0eXBlPT1cIm92ZXJsYXBcIikgIHtcbiAgICAgICAgICB2YXIgb3ZlcjtcblxuICAgICAgICAgIC8vaWYgdGhlIG90aGVyIGlzIGEgY2lyY2xlIEkgY2FsY3VsYXRlIHRoZSBkaXNwbGFjZW1lbnQgZnJvbSBoZXJlXG4gICAgICAgICAgaWYodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICBvdmVyID0gb3RoZXIuY29sbGlkZXIub3ZlcmxhcCh0aGlzLmNvbGxpZGVyKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIG92ZXIgPSB0aGlzLmNvbGxpZGVyLm92ZXJsYXAob3RoZXIuY29sbGlkZXIpO1xuXG4gICAgICAgICAgaWYob3ZlcilcbiAgICAgICAgICB7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKGNhbGxiYWNrICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZT09XCJjb2xsaWRlXCIgfHwgdHlwZSA9PSBcImJvdW5jZVwiKVxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGRpc3BsYWNlbWVudCA9IGNyZWF0ZVZlY3RvcigwLDApO1xuXG4gICAgICAgICAgLy9pZiB0aGUgc3VtIG9mIHRoZSBzcGVlZCBpcyBtb3JlIHRoYW4gdGhlIGNvbGxpZGVyIGkgbWF5XG4gICAgICAgICAgLy9oYXZlIGEgdHVubmVsbGluZyBwcm9ibGVtXG4gICAgICAgICAgdmFyIHR1bm5lbFggPSBhYnModGhpcy52ZWxvY2l0eS54LW90aGVyLnZlbG9jaXR5LngpID49IG90aGVyLmNvbGxpZGVyLmV4dGVudHMueC8yICYmIHJvdW5kKHRoaXMuZGVsdGFYIC0gdGhpcy52ZWxvY2l0eS54KSA9PSAwO1xuXG4gICAgICAgICAgdmFyIHR1bm5lbFkgPSBhYnModGhpcy52ZWxvY2l0eS55LW90aGVyLnZlbG9jaXR5LnkpID49ICBvdGhlci5jb2xsaWRlci5zaXplKCkueS8yICAmJiByb3VuZCh0aGlzLmRlbHRhWSAtIHRoaXMudmVsb2NpdHkueSkgPT0gMDtcblxuXG4gICAgICAgICAgaWYodHVubmVsWCB8fCB0dW5uZWxZKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vaW5zdGVhZCBvZiB1c2luZyB0aGUgY29sbGlkZXJzIEkgdXNlIHRoZSBib3VuZGluZyBib3hcbiAgICAgICAgICAgIC8vYXJvdW5kIHRoZSBwcmV2aW91cyBwb3NpdGlvbiBhbmQgY3VycmVudCBwb3NpdGlvblxuICAgICAgICAgICAgLy90aGlzIGlzIHJlZ2FyZGxlc3Mgb2YgdGhlIGNvbGxpZGVyIHR5cGVcblxuICAgICAgICAgICAgLy90aGUgY2VudGVyIGlzIHRoZSBhdmVyYWdlIG9mIHRoZSBjb2xsIGNlbnRlcnNcbiAgICAgICAgICAgIHZhciBjID0gY3JlYXRlVmVjdG9yKFxuICAgICAgICAgICAgICAodGhpcy5wb3NpdGlvbi54K3RoaXMucHJldmlvdXNQb3NpdGlvbi54KS8yLFxuICAgICAgICAgICAgICAodGhpcy5wb3NpdGlvbi55K3RoaXMucHJldmlvdXNQb3NpdGlvbi55KS8yKTtcblxuICAgICAgICAgICAgLy90aGUgZXh0ZW50cyBhcmUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNvbGwgY2VudGVyc1xuICAgICAgICAgICAgLy9wbHVzIHRoZSBleHRlbnRzIG9mIGJvdGhcbiAgICAgICAgICAgIHZhciBlID0gY3JlYXRlVmVjdG9yKFxuICAgICAgICAgICAgICBhYnModGhpcy5wb3NpdGlvbi54IC10aGlzLnByZXZpb3VzUG9zaXRpb24ueCkgKyB0aGlzLmNvbGxpZGVyLmV4dGVudHMueCxcbiAgICAgICAgICAgICAgYWJzKHRoaXMucG9zaXRpb24ueSAtdGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkpICsgdGhpcy5jb2xsaWRlci5leHRlbnRzLnkpO1xuXG4gICAgICAgICAgICB2YXIgYmJveCA9IG5ldyBBQUJCKGMsIGUsIHRoaXMuY29sbGlkZXIub2Zmc2V0KTtcblxuICAgICAgICAgICAgLy9iYm94LmRyYXcoKTtcblxuICAgICAgICAgICAgaWYoYmJveC5vdmVybGFwKG90aGVyLmNvbGxpZGVyKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWYodHVubmVsWCkge1xuXG4gICAgICAgICAgICAgICAgLy9lbnRlcmluZyBmcm9tIHRoZSByaWdodFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueCA8IDApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueCA9IG90aGVyLmNvbGxpZGVyLnJpZ2h0KCkgLSB0aGlzLmNvbGxpZGVyLmxlZnQoKSArIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZih0aGlzLnZlbG9jaXR5LnggPiAwIClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC54ID0gb3RoZXIuY29sbGlkZXIubGVmdCgpIC0gdGhpcy5jb2xsaWRlci5yaWdodCgpIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZih0dW5uZWxZKSB7XG4gICAgICAgICAgICAgICAgLy9mcm9tIHRvcFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueSA+IDApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueSA9IG90aGVyLmNvbGxpZGVyLnRvcCgpIC0gdGhpcy5jb2xsaWRlci5ib3R0b20oKSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZih0aGlzLnZlbG9jaXR5LnkgPCAwIClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC55ID0gb3RoZXIuY29sbGlkZXIuYm90dG9tKCkgLSB0aGlzLmNvbGxpZGVyLnRvcCgpICsgMTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfS8vZW5kIG92ZXJsYXBcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIC8vbm9uIHR1bm5lbCBvdmVybGFwXG4gICAgICAgICAge1xuXG4gICAgICAgICAgICAvL2lmIHRoZSBvdGhlciBpcyBhIGNpcmNsZSBJIGNhbGN1bGF0ZSB0aGUgZGlzcGxhY2VtZW50IGZyb20gaGVyZVxuICAgICAgICAgICAgLy9hbmQgcmV2ZXJzZSBpdFxuICAgICAgICAgICAgaWYodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IG90aGVyLmNvbGxpZGVyLmNvbGxpZGUodGhpcy5jb2xsaWRlcikubXVsdCgtMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gdGhpcy5jb2xsaWRlci5jb2xsaWRlKG90aGVyLmNvbGxpZGVyKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID09IDAgJiYgIGRpc3BsYWNlbWVudC55ID09IDAgKVxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgIHtcblxuICAgICAgICAgICAgaWYoIXRoaXMuaW1tb3ZhYmxlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZChkaXNwbGFjZW1lbnQpO1xuICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSBjcmVhdGVWZWN0b3IodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICB0aGlzLm5ld1Bvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC55IDwgMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5ib3R0b20gPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnRvcCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJib3VuY2VcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWYob3RoZXIuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFgxID0gLXRoaXMudmVsb2NpdHkueCtvdGhlci52ZWxvY2l0eS54O1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxZMSA9IC10aGlzLnZlbG9jaXR5Lnkrb3RoZXIudmVsb2NpdHkueTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxYMSA9ICh0aGlzLnZlbG9jaXR5LnggKiAodGhpcy5tYXNzIC0gb3RoZXIubWFzcykgKyAoMiAqIG90aGVyLm1hc3MgKiBvdGhlci52ZWxvY2l0eS54KSkgLyAodGhpcy5tYXNzICsgb3RoZXIubWFzcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWTEgPSAodGhpcy52ZWxvY2l0eS55ICogKHRoaXMubWFzcyAtIG90aGVyLm1hc3MpICsgKDIgKiBvdGhlci5tYXNzICogb3RoZXIudmVsb2NpdHkueSkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFgyID0gKG90aGVyLnZlbG9jaXR5LnggKiAob3RoZXIubWFzcyAtIHRoaXMubWFzcykgKyAoMiAqIHRoaXMubWFzcyAqIHRoaXMudmVsb2NpdHkueCkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFkyID0gKG90aGVyLnZlbG9jaXR5LnkgKiAob3RoZXIubWFzcyAtIHRoaXMubWFzcykgKyAoMiAqIHRoaXMubWFzcyAqIHRoaXMudmVsb2NpdHkueSkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy92YXIgYm90aENpcmNsZXMgPSAodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyICYmXG4gICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIG90aGVyLmNvbGxpZGVyICBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKTtcblxuICAgICAgICAgICAgICAvL2lmKHRoaXMudG91Y2hpbmcubGVmdCB8fCB0aGlzLnRvdWNoaW5nLnJpZ2h0IHx8IHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcblxuICAgICAgICAgICAgICAvL3ByaW50KGRpc3BsYWNlbWVudCk7XG5cbiAgICAgICAgICAgICAgaWYoYWJzKGRpc3BsYWNlbWVudC54KT5hYnMoZGlzcGxhY2VtZW50LnkpKVxuICAgICAgICAgICAgICB7XG5cblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnggPSBuZXdWZWxYMSp0aGlzLnJlc3RpdHV0aW9uO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIW90aGVyLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICAgIG90aGVyLnZlbG9jaXR5LnggPSBuZXdWZWxYMipvdGhlci5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vaWYodGhpcy50b3VjaGluZy50b3AgfHwgdGhpcy50b3VjaGluZy5ib3R0b20gfHwgdGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICBpZihhYnMoZGlzcGxhY2VtZW50LngpPGFicyhkaXNwbGFjZW1lbnQueSkpXG4gICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSA9IG5ld1ZlbFkxKnRoaXMucmVzdGl0dXRpb247XG5cbiAgICAgICAgICAgICAgICBpZighb3RoZXIuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICAgICAgb3RoZXIudmVsb2NpdHkueSA9IG5ld1ZlbFkyKm90aGVyLnJlc3RpdHV0aW9uO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2Vsc2UgaWYodHlwZSA9PSBcImNvbGxpZGVcIilcbiAgICAgICAgICAgICAgLy90aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsMCk7XG5cbiAgICAgICAgICAgIGlmKGNhbGxiYWNrICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIG90aGVyKTtcblxuICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cblxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0eXBlPT1cImRpc3BsYWNlXCIpICB7XG5cbiAgICAgICAgICAvL2lmIHRoZSBvdGhlciBpcyBhIGNpcmNsZSBJIGNhbGN1bGF0ZSB0aGUgZGlzcGxhY2VtZW50IGZyb20gaGVyZVxuICAgICAgICAgIC8vYW5kIHJldmVyc2UgaXRcbiAgICAgICAgICBpZih0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG4gICAgICAgICAgICBkaXNwbGFjZW1lbnQgPSBvdGhlci5jb2xsaWRlci5jb2xsaWRlKHRoaXMuY29sbGlkZXIpLm11bHQoLTEpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IHRoaXMuY29sbGlkZXIuY29sbGlkZShvdGhlci5jb2xsaWRlcik7XG5cblxuICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID09IDAgJiYgIGRpc3BsYWNlbWVudC55ID09IDAgKVxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG90aGVyLnBvc2l0aW9uLnN1YihkaXNwbGFjZW1lbnQpO1xuXG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA8IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueSA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcudG9wID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYoY2FsbGJhY2sgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgb3RoZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfS8vZW5kIGNvbGxpZGVyIGV4aXN0c1xuICAgIH1cbiAgICAvLyBOb3QgZG9uZSwgdW5sZXNzIHdlJ3JlIG9uIHRoZSBsYXN0IGl0ZW0gaW4gX19vdGhlcnM6XG4gICAgc3RhdGUuZG9uZUV4ZWMgPSBzdGF0ZS5fX2kgPj0gKHN0YXRlLl9fb3RoZXJzLmxlbmd0aCAtIDEpO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmRvbmVFeGVjID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIl19
