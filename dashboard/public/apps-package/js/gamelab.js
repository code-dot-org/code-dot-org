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
    "var img = loadImage": null,
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
    "var sprite = createSprite": null,
    "setSpeed": null,
    "getAnimationLabel": null,
    "getDirection": null,
    "getSpeed": null,
    "remove": null,
    "addAnimation": null,
    "addImage": null,
    "addSpeed": null,
    "addToGroup": null,
    "bounce": null,
    "collide": null,
    "displace": null,
    "overlap": null,
    "changeAnimation": null,
    "changeImage": null,
    "attractionPoint": null,
    "limitSpeed": null,
    "setCollider": null,
    "setVelocity": null,
    "sprite.height": null,
    "sprite.width": null,
    "sprite.animation": null,
    "depth": null,
    "friction": null,
    "immovable": null,
    "life": null,
    "mass": null,
    "maxSpeed": null,
    "sprite.position.x": null,
    "sprite.position.y": null,
    "sprite.previousPosition.x": null,
    "sprite.previousPosition.y": null,
    "removed": null,
    "restitution": null,
    "rotateToDirection": null,
    "rotation": null,
    "rotationSpeed": null,
    "scale": null,
    "shapeColor": null,
    "touching": null,
    "sprite.velocity.x": null,
    "sprite.velocity.y": null,
    "visible": null,

    // Animations
    "var anim = loadAnimation": null,
    "animation": null,
    "changeFrame": null,
    "nextFrame": null,
    "previousFrame": null,
    "clone": null,
    "getFrame": null,
    "getLastFrame": null,
    "goToFrame": null,
    "play": null,
    "rewind": null,
    "stop": null,
    "frameChanged": null,
    "frameDelay": null,
    "images": null,
    "looping": null,
    "playing": null,
    "anim.visible": null,

    // Groups
    "var group = new Group": null,
    "add": null,
    "group.remove": null,
    "clear": null,
    "contains": null,
    "get": null,
    "group.bounce": null,
    "group.collide": null,
    "group.displace": null,
    "group.overlap": null,
    "maxDepth": null,
    "minDepth": null,

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

var spriteMethodPrefix = '[Sprite].';
var groupMethodPrefix = '[Group].';
var animMethodPrefix = '[Animation].';

var spriteBlockPrefix = 'sprite.';
var groupBlockPrefix = 'group.';
var animBlockPrefix = 'anim.';

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
    } }, assetTooltip: { 0: chooseAsset.bind(null, 'image') } }, { func: 'var img = loadImage', category: 'Game Lab', paletteParams: ['url'], params: ['"https://code.org/images/logo.png"'], noAutocomplete: true }, { func: 'image', category: 'Game Lab', paletteParams: ['image', 'srcX', 'srcY', 'srcW', 'srcH', 'x', 'y', 'w', 'h'], params: ["img", "0", "0", "img.width", "img.height", "0", "0", "img.width", "img.height"] }, { func: 'fill', category: 'Game Lab', paletteParams: ['color'], params: ["'yellow'"] }, { func: 'noFill', category: 'Game Lab' }, { func: 'stroke', category: 'Game Lab', paletteParams: ['color'], params: ["'blue'"] }, { func: 'noStroke', category: 'Game Lab' }, { func: 'arc', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h', 'start', 'stop'], params: ["0", "0", "800", "800", "0", "HALF_PI"] }, { func: 'ellipse', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["200", "200", "400", "400"] }, { func: 'line', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "400", "400"] }, { func: 'point', category: 'Game Lab', paletteParams: ['x', 'y'], params: ["200", "200"] }, { func: 'rect', category: 'Game Lab', paletteParams: ['x', 'y', 'w', 'h'], params: ["100", "100", "200", "200"] }, { func: 'triangle', category: 'Game Lab', paletteParams: ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], params: ["200", "0", "0", "400", "400", "400"] }, { func: 'text', category: 'Game Lab', paletteParams: ['str', 'x', 'y', 'w', 'h'], params: ["'text'", "0", "0", "400", "100"] }, { func: 'textAlign', category: 'Game Lab', paletteParams: ['horiz', 'vert'], params: ["CENTER", "TOP"] }, { func: 'textSize', category: 'Game Lab', paletteParams: ['pixels'], params: ["12"] }, { func: 'drawSprites', category: 'Game Lab' }, { func: 'allSprites', category: 'Game Lab', block: 'allSprites', type: 'property' }, { func: 'background', category: 'Game Lab', paletteParams: ['color'], params: ["'black'"] }, { func: 'width', category: 'Game Lab', type: 'property' }, { func: 'height', category: 'Game Lab', type: 'property' }, { func: 'camera', category: 'Game Lab', type: 'property' }, { func: 'camera.on', category: 'Game Lab' }, { func: 'camera.off', category: 'Game Lab' }, { func: 'camera.active', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseX', category: 'Game Lab', type: 'property' }, { func: 'camera.mouseY', category: 'Game Lab', type: 'property' }, { func: 'camera.position.x', category: 'Game Lab', type: 'property' }, { func: 'camera.position.y', category: 'Game Lab', type: 'property' }, { func: 'camera.zoom', category: 'Game Lab', type: 'property' },

// Sprites
{ func: 'createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], type: 'either' }, { func: 'var sprite = createSprite', category: 'Sprites', paletteParams: ['x', 'y', 'width', 'height'], params: ["200", "200", "30", "30"], noAutocomplete: true, docFunc: 'createSprite' }, { func: 'setSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setSpeed' }, { func: 'getAnimationLabel', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getAnimationLabel', type: 'value' }, { func: 'getDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getDirection', type: 'value' }, { func: 'getSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.getSpeed', type: 'value' }, { func: 'remove', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.remove' }, { func: 'addAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label', 'animation'], params: ['"anim1"', "anim"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addAnimation' }, { func: 'addImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label', 'image'], params: ['"img1"', "img"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addImage' }, { func: 'addSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'angle'], params: ["1", "90"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addSpeed' }, { func: 'addToGroup', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['group'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.addToGroup' }, { func: 'bounce', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.bounce', type: 'either' }, { func: 'collide', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.collide', type: 'either' }, { func: 'displace', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.displace', type: 'either' }, { func: 'overlap', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['target'], params: ["group"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.overlap', type: 'either' }, { func: 'changeAnimation', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"anim1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeAnimation' }, { func: 'changeImage', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['label'], params: ['"img1"'], tipPrefix: spriteMethodPrefix, modeOptionName: '*.changeImage' }, { func: 'attractionPoint', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['speed', 'x', 'y'], params: ["1", "200", "200"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.attractionPoint' }, { func: 'limitSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['max'], params: ["3"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.limitSpeed' }, { func: 'setCollider', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['type', 'x', 'y', 'w', 'h'], params: ['"rectangle"', "0", "0", "20", "20"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setCollider' }, { func: 'setVelocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', paletteParams: ['x', 'y'], params: ["1", "1"], tipPrefix: spriteMethodPrefix, modeOptionName: '*.setVelocity' }, { func: 'sprite.height', category: 'Sprites', modeOptionName: '*.height', type: 'property' }, { func: 'sprite.width', category: 'Sprites', modeOptionName: '*.width', type: 'property' }, { func: 'sprite.animation', category: 'Sprites', modeOptionName: '*.animation', type: 'property' }, { func: 'depth', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.depth', type: 'property' }, { func: 'friction', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.friction', type: 'property' }, { func: 'immovable', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.immovable', type: 'property' }, { func: 'life', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.life', type: 'property' }, { func: 'mass', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.mass', type: 'property' }, { func: 'maxSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.maxSpeed', type: 'property' }, { func: 'position', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.position', type: 'property' }, { func: 'sprite.position.x', category: 'Sprites', modeOptionName: 'sprite_position_x', type: 'property', noAutocomplete: true }, { func: 'sprite.position.y', category: 'Sprites', modeOptionName: 'sprite_position_y', type: 'property', noAutocomplete: true }, { func: 'previousPosition', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.previousPosition', type: 'property' }, { func: 'sprite.previousPosition.x', category: 'Sprites', modeOptionName: 'sprite_previousPosition_x', type: 'property', noAutocomplete: true }, { func: 'sprite.previousPosition.y', category: 'Sprites', modeOptionName: 'sprite_previousPosition_y', type: 'property', noAutocomplete: true }, { func: 'removed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.removed', type: 'property' }, { func: 'restitution', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.restitution', type: 'property' }, { func: 'rotateToDirection', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotateToDirection', type: 'property' }, { func: 'rotation', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotation', type: 'property' }, { func: 'rotationSpeed', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.rotationSpeed', type: 'property' }, { func: 'scale', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.scale', type: 'property' }, { func: 'shapeColor', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.shapeColor', type: 'property' }, { func: 'touching', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.touching', type: 'property' }, { func: 'velocity', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.velocity', type: 'property' }, { func: 'sprite.velocity.x', category: 'Sprites', modeOptionName: 'sprite_velocity_x', type: 'property', noAutocomplete: true }, { func: 'sprite.velocity.y', category: 'Sprites', modeOptionName: 'sprite_velocity_y', type: 'property', noAutocomplete: true }, { func: 'visible', blockPrefix: spriteBlockPrefix, category: 'Sprites', tipPrefix: spriteMethodPrefix, modeOptionName: '*.visible', type: 'property' },
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
{ func: 'loadAnimation', category: 'Animations', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], type: 'either' }, { func: 'var anim = loadAnimation', category: 'Animations', paletteParams: ['url1', 'url2'], params: ['"http://p5play.molleindustria.org/examples/assets/ghost_standing0001.png"', '"http://p5play.molleindustria.org/examples/assets/ghost_standing0002.png"'], noAutocomplete: true, docFunc: 'loadAnimation' }, { func: 'animation', category: 'Animations', paletteParams: ['animation', 'x', 'y'], params: ["anim", "50", "50"] }, { func: 'changeFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["0"], tipPrefix: animMethodPrefix, modeOptionName: '*.changeFrame' }, { func: 'nextFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.nextFrame' }, { func: 'previousFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.previousFrame' }, { func: 'clone', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.clone', type: 'value' }, { func: 'getFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.getFrame', type: 'value' }, { func: 'getLastFrame', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.getLastFrame', type: 'value' }, { func: 'goToFrame', blockPrefix: animBlockPrefix, category: 'Animations', paletteParams: ['frame'], params: ["1"], tipPrefix: animMethodPrefix, modeOptionName: '*.goToFrame' }, { func: 'play', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.play' }, { func: 'rewind', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.rewind' }, { func: 'stop', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.stop' }, { func: 'frameChanged', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.frameChanged', type: 'property' }, { func: 'frameDelay', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.frameDelay', type: 'property' }, { func: 'images', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.images', type: 'property' }, { func: 'looping', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.looping', type: 'property' }, { func: 'playing', blockPrefix: animBlockPrefix, category: 'Animations', tipPrefix: animMethodPrefix, modeOptionName: '*.playing', type: 'property' }, { func: 'anim.visible', category: 'Animations', modeOptionName: '*.visible', type: 'property' },
/* TODO: decide whether to expose these Animation methods:
draw(xy)
getFrameImage()
getHeight()
getImageAt(frame)
getWidth()
*/

// Groups
{ func: 'Group', category: 'Groups', type: 'either' }, { func: 'var group = new Group', category: 'Groups', type: 'either', docFunc: 'Group' }, { func: 'add', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.add' }, { func: 'group.remove', category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], modeOptionName: 'group_remove', noAutocomplete: true }, /* avoid sprite.remove conflict */
{ func: 'clear', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.clear' }, { func: 'contains', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['sprite'], params: ["sprite"], tipPrefix: groupMethodPrefix, modeOptionName: '*.contains', type: 'value' }, { func: 'get', blockPrefix: groupBlockPrefix, category: 'Groups', paletteParams: ['i'], params: ["0"], tipPrefix: groupMethodPrefix, modeOptionName: '*.get', type: 'value' }, { func: 'group.bounce', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_bounce', noAutocomplete: true }, /* avoid sprite.bounce conflict */
{ func: 'group.collide', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_collide', noAutocomplete: true }, /* avoid sprite.collide conflict */
{ func: 'group.displace', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_displace', noAutocomplete: true }, /* avoid sprite.displace conflict */
{ func: 'group.overlap', category: 'Groups', paletteParams: ['target'], params: ["sprite"], modeOptionName: 'group_overlap', noAutocomplete: true }, /* avoid sprite.overlap conflict */
{ func: 'maxDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.maxDepth', type: 'value' }, { func: 'minDepth', blockPrefix: groupBlockPrefix, category: 'Groups', tipPrefix: groupMethodPrefix, modeOptionName: '*.minDepth', type: 'value' },

/* TODO: decide whether to expose these Group methods:
draw() - USEFUL?
*/

// Events
{ func: 'keyIsPressed', category: 'Events', type: 'property' }, { func: 'key', category: 'Events', type: 'property' }, { func: 'keyCode', category: 'Events', type: 'property' }, { func: 'keyDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentDown', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyWentUp', paletteParams: ['code'], params: ["UP_ARROW"], category: 'Events', type: 'value' }, { func: 'keyPressed', block: 'function keyPressed() {}', expansion: 'function keyPressed() {\n  __;\n}', category: 'Events' }, { func: 'keyReleased', block: 'function keyReleased() {}', expansion: 'function keyReleased() {\n  __;\n}', category: 'Events' }, { func: 'keyTyped', block: 'function keyTyped() {}', expansion: 'function keyTyped() {\n  __;\n}', category: 'Events' }, { func: 'mouseX', category: 'Events', type: 'property' }, { func: 'mouseY', category: 'Events', type: 'property' }, { func: 'pmouseX', category: 'Events', type: 'property' }, { func: 'pmouseY', category: 'Events', type: 'property' }, { func: 'mouseButton', category: 'Events', type: 'property' }, { func: 'mouseIsPressed', category: 'Events', type: 'property' }, { func: 'mouseMoved', block: 'function mouseMoved() {}', expansion: 'function mouseMoved() {\n  __;\n}', category: 'Events' }, { func: 'mouseDragged', block: 'function mouseDragged() {}', expansion: 'function mouseDragged() {\n  __;\n}', category: 'Events' }, { func: 'mousePressed', block: 'function mousePressed() {}', expansion: 'function mousePressed() {\n  __;\n}', category: 'Events' }, { func: 'mouseReleased', block: 'function mouseReleased() {}', expansion: 'function mouseReleased() {\n  __;\n}', category: 'Events' }, { func: 'mouseClicked', block: 'function mouseClicked() {}', expansion: 'function mouseClicked() {\n  __;\n}', category: 'Events' }, { func: 'mouseWheel', block: 'function mouseWheel() {}', expansion: 'function mouseWheel() {\n  __;\n}', category: 'Events' },

// Math
{ func: 'sin', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'cos', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'tan', category: 'Math', paletteParams: ['angle'], params: ["0"], type: 'value' }, { func: 'asin', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'acos', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'atan', category: 'Math', paletteParams: ['value'], params: ["0"], type: 'value' }, { func: 'atan2', category: 'Math', paletteParams: ['y', 'x'], params: ["10", "10"], type: 'value' }, { func: 'degrees', category: 'Math', paletteParams: ['radians'], params: ["0"], type: 'value' }, { func: 'radians', category: 'Math', paletteParams: ['degrees'], params: ["0"], type: 'value' }, { func: 'angleMode', category: 'Math', paletteParams: ['mode'], params: ["DEGREES"] }, { func: 'random', category: 'Math', paletteParams: ['min', 'max'], params: ["1", "5"], type: 'value' }, { func: 'randomGaussian', category: 'Math', paletteParams: ['mean', 'sd'], params: ["0", "15"], type: 'value' }, { func: 'randomSeed', category: 'Math', paletteParams: ['seed'], params: ["99"] }, { func: 'abs', category: 'Math', paletteParams: ['num'], params: ["-1"], type: 'value' }, { func: 'ceil', category: 'Math', paletteParams: ['num'], params: ["0.1"], type: 'value' }, { func: 'constrain', category: 'Math', paletteParams: ['num', 'low', 'high'], params: ["1.1", "0", "1"], type: 'value' }, { func: 'dist', category: 'Math', paletteParams: ['x1', 'y1', 'x2', 'y2'], params: ["0", "0", "100", "100"], type: 'value' }, { func: 'exp', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' }, { func: 'floor', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' }, { func: 'lerp', category: 'Math', paletteParams: ['start', 'stop', 'amt'], params: ["0", "100", "0.1"], type: 'value' }, { func: 'log', category: 'Math', paletteParams: ['num'], params: ["1"], type: 'value' }, { func: 'mag', category: 'Math', paletteParams: ['a', 'b'], params: ["100", "100"], type: 'value' }, { func: 'map', category: 'Math', paletteParams: ['value', 'start1', 'stop1', 'start2', 'stop'], params: ["0.9", "0", "1", "0", "100"], type: 'value' }, { func: 'max', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value' }, { func: 'min', category: 'Math', paletteParams: ['n1', 'n2'], params: ["1", "3"], type: 'value' }, { func: 'norm', category: 'Math', paletteParams: ['value', 'start', 'stop'], params: ["90", "0", "100"], type: 'value' }, { func: 'pow', category: 'Math', paletteParams: ['n', 'e'], params: ["10", "2"], type: 'value' }, { func: 'round', category: 'Math', paletteParams: ['num'], params: ["0.9"], type: 'value' }, { func: 'sq', category: 'Math', paletteParams: ['num'], params: ["2"], type: 'value' }, { func: 'sqrt', category: 'Math', paletteParams: ['num'], params: ["9"], type: 'value' },

// Vector
{ func: 'x', category: 'Vector', modeOptionName: '*.x', type: 'property' }, { func: 'y', category: 'Vector', modeOptionName: '*.y', type: 'property' }];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9HYW1lTGFiUDUuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWJTcHJpdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ2xELElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNyQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FB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QyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBRSxFQUN2TSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUNyRixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUN6QyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFDdkksRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDaEgsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDN0csRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN4RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUM3RyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDekksRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUN6SCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQ3RHLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ3BGLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEVBQzVDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNsRixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ3hELEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFDekQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6RCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMxQyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUMzQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQ2hFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUs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RUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEVBQ2xNLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEVBQzVMLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUN0TCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUMvTCxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUNqTSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUs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LGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUNqSixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN2SixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN6SixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUMvSSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUMvSSxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUN2SixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUs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RSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDekYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN6RixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3pGLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNqRyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFDcEYsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3BHLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzdHLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQ2hGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdkYsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUN6RixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3hILEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDdEYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNwSCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQ3RGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNqRyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDakosRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQzlGLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMvRixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUNySCxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFDOUYsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUMxRixFQUFDLElBQUksRUFBRSxJ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QUFNLENBQUMsU0FBUyxFQUFFLEVBQzlCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQzlCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQzVCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQzdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQ2hDLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQ2hDLENBQUM7Q0FDSCxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsWUFBWTs7QUFFdEQsTUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOzs7QUFHbEIsT0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ3hCLFlBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0dBQzdDOztBQUVELFVBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBRSxDQUFDOztBQUUxQyxVQUFRLENBQUMsRUFBRSxHQUFHLENBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUUsQ0FBQzs7QUFFdkQsU0FBTyxR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QyxDQUFDO2lCQUNsRCxNQUVEOztBQUVFLHNCQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLEdBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxDQUFDOztBQUU3SCxzQkFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxHQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUssSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFBLEFBQUMsQ0FBQzs7QUFFN0gsc0JBQUksUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBLEFBQUMsR0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQSxBQUFDLENBQUM7O0FBRTVILHNCQUFJLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQSxBQUFDLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsQUFBQyxDQUFDO2lCQUM3SDs7Ozs7Ozs7O0FBU0Qsb0JBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUMxQzs7QUFHRSxzQkFBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ2xCO0FBQ0Usd0JBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO21CQUU3Qzs7QUFFRCxzQkFBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQ2pCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUVqRDs7QUFFRCxvQkFBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQzFDOztBQUVFLHNCQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRTlDLHNCQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7aUJBQ2pEO2VBQ0Y7Ozs7QUFJRCxrQkFBRyxRQUFRLElBQUksU0FBUyxJQUFJLE9BQU8sUUFBUSxJQUFJLFVBQVUsRUFDdkQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxvQkFBTSxHQUFHLElBQUksQ0FBQzthQUNmO1dBSUYsTUFDSSxJQUFHLElBQUksSUFBRSxVQUFVLEVBQUc7Ozs7QUFJekIsZ0JBQUcsSUFBSSxDQUFDLFFBQVEsWUFBWSxjQUFjLEVBQ3hDLFlBQVksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FFOUQsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFHdkQsZ0JBQUcsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUssWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQzVDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FFakI7QUFDRSxtQkFBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWpDLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDNUIsa0JBQUcsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUM3QixrQkFBRyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzlCLGtCQUFHLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7O0FBRTNCLGtCQUFHLFFBQVEsSUFBSSxTQUFTLElBQUksT0FBTyxRQUFRLElBQUksVUFBVSxFQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRW5DLG9CQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ2Y7V0FDRjtTQUNGO09BQ0Y7O0FBRUQsU0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDO0dBQzNELE1BQU07QUFDTCxTQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztHQUN2Qjs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5nYW1lbGFiTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGdhbWVsYWIgPSBuZXcgR2FtZUxhYigpO1xuXG4gIGdhbWVsYWIuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oZ2FtZWxhYiwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQ0RPIEFwcDogR2FtZUxhYlxuICpcbiAqIENvcHlyaWdodCAyMDE2IENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmdhbWVsYWJfZm9vID0ge1xuICAgIC8vIEJsb2NrIGZvciBmb28uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZvbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZvb1Rvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5nYW1lbGFiX2ZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBmb28uXG4gICAgcmV0dXJuICdHYW1lTGFiLmZvbygpO1xcbic7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaUphdmFzY3JpcHQgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQnKTtcbnZhciBjb2RlV29ya3NwYWNlRWpzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2NvZGVXb3Jrc3BhY2UuaHRtbC5lanMnKTtcbnZhciB2aXN1YWxpemF0aW9uQ29sdW1uRWpzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3Zpc3VhbGl6YXRpb25Db2x1bW4uaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKc0RlYnVnZ2VyVWkgPSByZXF1aXJlKCcuLi9Kc0RlYnVnZ2VyVWknKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xudmFyIEpzSW50ZXJwcmV0ZXJMb2dnZXIgPSByZXF1aXJlKCcuLi9Kc0ludGVycHJldGVyTG9nZ2VyJyk7XG52YXIgR2FtZUxhYlA1ID0gcmVxdWlyZSgnLi9HYW1lTGFiUDUnKTtcbnZhciBnYW1lTGFiU3ByaXRlID0gcmVxdWlyZSgnLi9HYW1lTGFiU3ByaXRlJyk7XG52YXIgYXNzZXRQcmVmaXggPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvYXNzZXRQcmVmaXgnKTtcbnZhciBBcHBWaWV3ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL0FwcFZpZXcuanN4Jyk7XG5cbnZhciBNQVhfSU5URVJQUkVURVJfU1RFUFNfUEVSX1RJQ0sgPSA1MDAwMDA7XG5cbi8qKlxuICogQW4gaW5zdGFudGlhYmxlIEdhbWVMYWIgY2xhc3NcbiAqL1xudmFyIEdhbWVMYWIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2tpbiA9IG51bGw7XG4gIHRoaXMubGV2ZWwgPSBudWxsO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qKiBAdHlwZSB7U3R1ZGlvQXBwfSAqL1xuICB0aGlzLnN0dWRpb0FwcF8gPSBudWxsO1xuXG4gIC8qKiBAdHlwZSB7SlNJbnRlcnByZXRlcn0gKi9cbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcblxuICAvKiogQHByaXZhdGUge0pzSW50ZXJwcmV0ZXJMb2dnZXJ9ICovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8gPSBuZXcgSnNJbnRlcnByZXRlckxvZ2dlcih3aW5kb3cuY29uc29sZSk7XG5cbiAgLyoqIEB0eXBlIHtKc0RlYnVnZ2VyVWl9ICovXG4gIHRoaXMuZGVidWdnZXJfID0gbmV3IEpzRGVidWdnZXJVaSh0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xuXG4gIHRoaXMuZXZlbnRIYW5kbGVycyA9IHt9O1xuICB0aGlzLkdsb2JhbHMgPSB7fTtcbiAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBudWxsO1xuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc3RhcnRlZEhhbmRsaW5nRXZlbnRzID0gZmFsc2U7XG4gIHRoaXMuZ2FtZUxhYlA1ID0gbmV3IEdhbWVMYWJQNSgpO1xuICB0aGlzLmFwaSA9IGFwaTtcbiAgdGhpcy5hcGkuaW5qZWN0R2FtZUxhYih0aGlzKTtcbiAgdGhpcy5hcGlKUyA9IGFwaUphdmFzY3JpcHQ7XG4gIHRoaXMuYXBpSlMuaW5qZWN0R2FtZUxhYih0aGlzKTtcblxuICBkcm9wbGV0Q29uZmlnLmluamVjdEdhbWVMYWIodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWI7XG5cbi8qKlxuICogSW5qZWN0IHRoZSBzdHVkaW9BcHAgc2luZ2xldG9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG5HYW1lTGFiLmJhc2VQNWxvYWRJbWFnZSA9IG51bGw7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGlzIEdhbWVMYWIgaW5zdGFuY2UuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICBpZiAoIXRoaXMuc3R1ZGlvQXBwXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWVMYWIgcmVxdWlyZXMgYSBTdHVkaW9BcHBcIik7XG4gIH1cblxuICB0aGlzLnNraW4gPSBjb25maWcuc2tpbjtcbiAgdGhpcy5sZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBjb25maWcudXNlc0Fzc2V0cyA9IHRydWU7XG5cbiAgdGhpcy5nYW1lTGFiUDUuaW5pdCh7XG4gICAgZ2FtZUxhYjogdGhpcyxcbiAgICBvbkV4ZWN1dGlvblN0YXJ0aW5nOiB0aGlzLm9uUDVFeGVjdXRpb25TdGFydGluZy5iaW5kKHRoaXMpLFxuICAgIG9uUHJlbG9hZDogdGhpcy5vblA1UHJlbG9hZC5iaW5kKHRoaXMpLFxuICAgIG9uU2V0dXA6IHRoaXMub25QNVNldHVwLmJpbmQodGhpcyksXG4gICAgb25EcmF3OiB0aGlzLm9uUDVEcmF3LmJpbmQodGhpcylcbiAgfSk7XG5cbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuICBjb25maWcuYXBwTXNnID0gbXNnO1xuXG4gIHZhciBzaG93RmluaXNoQnV0dG9uID0gIXRoaXMubGV2ZWwuaXNQcm9qZWN0TGV2ZWw7XG4gIHZhciBmaW5pc2hCdXR0b25GaXJzdExpbmUgPSBfLmlzRW1wdHkodGhpcy5sZXZlbC5zb2Z0QnV0dG9ucyk7XG4gIHZhciBhcmVCcmVha3BvaW50c0VuYWJsZWQgPSB0cnVlO1xuICB2YXIgZmlyc3RDb250cm9sc1JvdyA9IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBmaW5pc2hCdXR0b246IGZpbmlzaEJ1dHRvbkZpcnN0TGluZSAmJiBzaG93RmluaXNoQnV0dG9uXG4gIH0pO1xuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IHRoaXMuZGVidWdnZXJfLmdldE1hcmt1cCh0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsIHtcbiAgICBzaG93QnV0dG9uczogdHJ1ZSxcbiAgICBzaG93Q29uc29sZTogdHJ1ZVxuICB9KTtcblxuICB2YXIgcmVuZGVyQ29kZVdvcmtzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29kZVdvcmtzcGFjZUVqcyh7XG4gICAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHRoaXMuc3R1ZGlvQXBwXy5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgZXh0cmFDb250cm9sUm93czogZXh0cmFDb250cm9sUm93cyxcbiAgICAgICAgYmxvY2tVc2VkIDogdW5kZWZpbmVkLFxuICAgICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgICBlZGl0Q29kZTogdGhpcy5sZXZlbC5lZGl0Q29kZSxcbiAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3MgOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcGluV29ya3NwYWNlVG9Cb3R0b206IHRydWUsXG4gICAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfS5iaW5kKHRoaXMpO1xuXG4gIHZhciByZW5kZXJWaXN1YWxpemF0aW9uQ29sdW1uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2aXN1YWxpemF0aW9uQ29sdW1uRWpzKHtcbiAgICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgIGNvbnRyb2xzOiBmaXJzdENvbnRyb2xzUm93LFxuICAgICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzLFxuICAgICAgICBwaW5Xb3Jrc3BhY2VUb0JvdHRvbTogdHJ1ZSxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pO1xuICB9LmJpbmQodGhpcyk7XG5cbiAgdmFyIG9uTW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uZmlnLmxvYWRBdWRpbyA9IHRoaXMubG9hZEF1ZGlvXy5iaW5kKHRoaXMpO1xuICAgIGNvbmZpZy5hZnRlckluamVjdCA9IHRoaXMuYWZ0ZXJJbmplY3RfLmJpbmQodGhpcywgY29uZmlnKTtcbiAgICBjb25maWcuYWZ0ZXJFZGl0b3JSZWFkeSA9IHRoaXMuYWZ0ZXJFZGl0b3JSZWFkeV8uYmluZCh0aGlzLCBhcmVCcmVha3BvaW50c0VuYWJsZWQpO1xuXG4gICAgLy8gU3RvcmUgcDVzcGVjaWFsRnVuY3Rpb25zIGluIHRoZSB1bnVzZWRDb25maWcgYXJyYXkgc28gd2UgZG9uJ3QgZ2l2ZSB3YXJuaW5nc1xuICAgIC8vIGFib3V0IHRoZXNlIGZ1bmN0aW9ucyBub3QgYmVpbmcgY2FsbGVkOlxuICAgIGNvbmZpZy51bnVzZWRDb25maWcgPSB0aGlzLmdhbWVMYWJQNS5wNXNwZWNpYWxGdW5jdGlvbnM7XG5cbiAgICB0aGlzLnN0dWRpb0FwcF8uaW5pdChjb25maWcpO1xuXG4gICAgdGhpcy5kZWJ1Z2dlcl8uaW5pdGlhbGl6ZUFmdGVyRG9tQ3JlYXRlZCh7XG4gICAgICBkZWZhdWx0U3RlcFNwZWVkOiAxXG4gICAgfSk7XG4gIH0uYmluZCh0aGlzKTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHRoaXMuc3R1ZGlvQXBwXy5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiBvbk1vdW50XG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuY29udGFpbmVySWQpKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnR2FtZUxhYixjb2RlJyk7XG4gIH1cblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gJzQwMHB4JztcblxuICB2YXIgZGl2R2FtZUxhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXZHYW1lTGFiJyk7XG4gIGRpdkdhbWVMYWIuc3R5bGUud2lkdGggPSAnNDAwcHgnO1xuICBkaXZHYW1lTGFiLnN0eWxlLmhlaWdodCA9ICc0MDBweCc7XG5cbn07XG5cbi8qKlxuICogSW5pdGlhbGl6YXRpb24gdG8gcnVuIGFmdGVyIGFjZS9kcm9wbGV0IGlzIGluaXRpYWxpemVkLlxuICogQHBhcmFtIHshYm9vbGVhbn0gYXJlQnJlYWtwb2ludHNFbmFibGVkXG4gKiBAcHJpdmF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckVkaXRvclJlYWR5XyA9IGZ1bmN0aW9uIChhcmVCcmVha3BvaW50c0VuYWJsZWQpIHtcbiAgaWYgKGFyZUJyZWFrcG9pbnRzRW5hYmxlZCkge1xuICAgIHRoaXMuc3R1ZGlvQXBwXy5lbmFibGVCcmVha3BvaW50cygpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0ge307XG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGlja0ludGVydmFsSWQpO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8qXG4gIHZhciBkaXZHYW1lTGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpdkdhbWVMYWInKTtcbiAgd2hpbGUgKGRpdkdhbWVMYWIuZmlyc3RDaGlsZCkge1xuICAgIGRpdkdhbWVMYWIucmVtb3ZlQ2hpbGQoZGl2R2FtZUxhYi5maXJzdENoaWxkKTtcbiAgfVxuICAqL1xuXG4gIHRoaXMuZ2FtZUxhYlA1LnJlc2V0RXhlY3V0aW9uKCk7XG4gIFxuICAvLyBJbXBvcnQgdG8gcmVzZXQgdGhlc2UgYWZ0ZXIgdGhpcy5nYW1lTGFiUDUgaGFzIGJlZW4gcmVzZXRcbiAgdGhpcy5kcmF3SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB0aGlzLnNldHVwSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICB0aGlzLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyA9IGZhbHNlO1xuXG4gIHRoaXMuZGVidWdnZXJfLmRldGFjaCgpO1xuICB0aGlzLmNvbnNvbGVMb2dnZXJfLmRldGFjaCgpO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmRlaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMuSlNJbnRlcnByZXRlciA9IG51bGw7XG4gIH1cbiAgdGhpcy5leGVjdXRpb25FcnJvciA9IG51bGw7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0dWRpb0FwcF8udG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHRoaXMuc3R1ZGlvQXBwXy5hdHRlbXB0cysrO1xuICB0aGlzLmV4ZWN1dGUoKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmV2YWxDb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICB0cnkge1xuICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgR2FtZUxhYjogdGhpcy5hcGlcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEluZmluaXR5IGlzIHRocm93biBpZiB3ZSBkZXRlY3QgYW4gaW5maW5pdGUgbG9vcC4gSW4gdGhhdCBjYXNlIHdlJ2xsXG4gICAgLy8gc3RvcCBmdXJ0aGVyIGV4ZWN1dGlvbiwgYW5pbWF0ZSB3aGF0IG9jY3VyZWQgYmVmb3JlIHRoZSBpbmZpbml0ZSBsb29wLFxuICAgIC8vIGFuZCBhbmFseXplIHN1Y2Nlc3MvZmFpbHVyZSBiYXNlZCBvbiB3aGF0IHdhcyBkcmF3bi5cbiAgICAvLyBPdGhlcndpc2UsIGFibm9ybWFsIHRlcm1pbmF0aW9uIGlzIGEgdXNlciBlcnJvci5cbiAgICBpZiAoZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAgIC8vIFVzZXJDb2RlIHNvIHRoYXQgaXQncyBjbGVhciB0aGlzIGlzIGluIGV2YWwnZWQgY29kZS5cbiAgICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgICAgfVxuICAgICAgd2luZG93LmFsZXJ0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gUmVzZXQgYWxsIHN0YXRlLlxuICB0aGlzLnN0dWRpb0FwcF8ucmVzZXQoKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkgJiZcbiAgICAgICh0aGlzLnN0dWRpb0FwcF8uaGFzRXh0cmFUb3BCbG9ja3MoKSB8fFxuICAgICAgICB0aGlzLnN0dWRpb0FwcF8uaGFzRHVwbGljYXRlVmFyaWFibGVzSW5Gb3JMb29wcygpKSkge1xuICAgIC8vIGltbWVkaWF0ZWx5IGNoZWNrIGFuc3dlciwgd2hpY2ggd2lsbCBmYWlsIGFuZCByZXBvcnQgdG9wIGxldmVsIGJsb2Nrc1xuICAgIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmdhbWVMYWJQNS5zdGFydEV4ZWN1dGlvbigpO1xuXG4gIGlmICghdGhpcy5sZXZlbC5lZGl0Q29kZSkge1xuICAgIHRoaXMuY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgICB0aGlzLmV2YWxDb2RlKHRoaXMuY29kZSk7XG4gIH1cblxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIC8vIFNldCB0byAxbXMgaW50ZXJ2YWwsIGJ1dCBub3RlIHRoYXQgYnJvd3NlciBtaW5pbXVtcyBhcmUgYWN0dWFsbHkgNS0xNm1zOlxuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKF8uYmluZCh0aGlzLm9uVGljaywgdGhpcyksIDEpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuaW5pdEludGVycHJldGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMubGV2ZWwuZWRpdENvZGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBuZXcgSlNJbnRlcnByZXRlcih7XG4gICAgc3R1ZGlvQXBwOiB0aGlzLnN0dWRpb0FwcF8sXG4gICAgbWF4SW50ZXJwcmV0ZXJTdGVwc1BlclRpY2s6IE1BWF9JTlRFUlBSRVRFUl9TVEVQU19QRVJfVElDSyxcbiAgICBjdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllczogdGhpcy5nYW1lTGFiUDUuZ2V0Q3VzdG9tTWFyc2hhbEdsb2JhbFByb3BlcnRpZXMoKVxuICB9KTtcbiAgdGhpcy5KU0ludGVycHJldGVyLm9uRXhlY3V0aW9uRXJyb3IucmVnaXN0ZXIodGhpcy5oYW5kbGVFeGVjdXRpb25FcnJvci5iaW5kKHRoaXMpKTtcbiAgdGhpcy5jb25zb2xlTG9nZ2VyXy5hdHRhY2hUbyh0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuICB0aGlzLmRlYnVnZ2VyXy5hdHRhY2hUbyh0aGlzLkpTSW50ZXJwcmV0ZXIpO1xuICB0aGlzLkpTSW50ZXJwcmV0ZXIucGFyc2Uoe1xuICAgIGNvZGU6IHRoaXMuc3R1ZGlvQXBwXy5nZXRDb2RlKCksXG4gICAgYmxvY2tzOiBkcm9wbGV0Q29uZmlnLmJsb2NrcyxcbiAgICBibG9ja0ZpbHRlcjogdGhpcy5sZXZlbC5leGVjdXRlUGFsZXR0ZUFwaXNPbmx5ICYmIHRoaXMubGV2ZWwuY29kZUZ1bmN0aW9ucyxcbiAgICBlbmFibGVFdmVudHM6IHRydWVcbiAgfSk7XG4gIGlmICghdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBnYW1lTGFiU3ByaXRlLmluamVjdEpTSW50ZXJwcmV0ZXIodGhpcy5KU0ludGVycHJldGVyKTtcblxuICB0aGlzLmdhbWVMYWJQNS5wNXNwZWNpYWxGdW5jdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgdmFyIGZ1bmMgPSB0aGlzLkpTSW50ZXJwcmV0ZXIuZmluZEdsb2JhbEZ1bmN0aW9uKGV2ZW50TmFtZSk7XG4gICAgaWYgKGZ1bmMpIHtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVyc1tldmVudE5hbWVdID1cbiAgICAgICAgICBjb2RlZ2VuLmNyZWF0ZU5hdGl2ZUZ1bmN0aW9uRnJvbUludGVycHJldGVyRnVuY3Rpb24oZnVuYyk7XG4gICAgfVxuICB9LCB0aGlzKTtcblxuICBjb2RlZ2VuLmN1c3RvbU1hcnNoYWxPYmplY3RMaXN0ID0gdGhpcy5nYW1lTGFiUDUuZ2V0Q3VzdG9tTWFyc2hhbE9iamVjdExpc3QoKTtcblxuICB2YXIgcHJvcExpc3QgPSB0aGlzLmdhbWVMYWJQNS5nZXRHbG9iYWxQcm9wZXJ0eUxpc3QoKTtcbiAgZm9yICh2YXIgcHJvcCBpbiBwcm9wTGlzdCkge1xuICAgIC8vIEVhY2ggZW50cnkgaW4gdGhlIHByb3BMaXN0IGlzIGFuIGFycmF5IHdpdGggMiBlbGVtZW50czpcbiAgICAvLyBwcm9wTGlzdEl0ZW1bMF0gLSBhIG5hdGl2ZSBwcm9wZXJ0eSB2YWx1ZVxuICAgIC8vIHByb3BMaXN0SXRlbVsxXSAtIHRoZSBwcm9wZXJ0eSdzIHBhcmVudCBvYmplY3RcbiAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoXG4gICAgICAgIHByb3AsXG4gICAgICAgIHByb3BMaXN0W3Byb3BdWzBdLFxuICAgICAgICBwcm9wTGlzdFtwcm9wXVsxXSk7XG4gIH1cblxuICAvKlxuICBpZiAodGhpcy5jaGVja0ZvckVkaXRDb2RlUHJlRXhlY3V0aW9uRmFpbHVyZSgpKSB7XG4gICByZXR1cm4gdGhpcy5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiAgKi9cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLm9uVGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy50aWNrQ291bnQrKztcblxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmV4ZWN1dGVJbnRlcnByZXRlcigpO1xuXG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWRIYW5kbGluZ0V2ZW50cyAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuc3RhcnRlZEhhbmRsaW5nRXZlbnRzKSB7XG4gICAgICAvLyBDYWxsIHRoaXMgb25jZSBhZnRlciB3ZSd2ZSBzdGFydGVkIGhhbmRsaW5nIGV2ZW50c1xuICAgICAgdGhpcy5zdGFydGVkSGFuZGxpbmdFdmVudHMgPSB0cnVlO1xuICAgICAgdGhpcy5nYW1lTGFiUDUubm90aWZ5VXNlckdsb2JhbENvZGVDb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcGxldGVTZXR1cElmU2V0dXBDb21wbGV0ZSgpO1xuICAgIHRoaXMuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgY2FsbGVkIHdoaWxlIHRoaXMuZ2FtZUxhYlA1IGlzIGluIHN0YXJ0RXhlY3V0aW9uKCkuIFdlIHVzZSB0aGVcbiAqIG9wcG9ydHVuaXR5IHRvIGNyZWF0ZSBuYXRpdmUgZXZlbnQgaGFuZGxlcnMgdGhhdCBjYWxsIGRvd24gaW50byBpbnRlcnByZXRlclxuICogY29kZSBmb3IgZWFjaCBldmVudCBuYW1lLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1RXhlY3V0aW9uU3RhcnRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZ2FtZUxhYlA1LnA1ZXZlbnROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICB3aW5kb3dbZXZlbnROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIgJiYgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50TmFtZV0uYXBwbHkobnVsbCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuICB9LCB0aGlzKTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gdGhlIHByZWxvYWQgcGhhc2UuIFdlIGluaXRpYWxpemVcbiAqIHRoZSBpbnRlcnByZXRlciwgc3RhcnQgaXRzIGV4ZWN1dGlvbiwgYW5kIGNhbGwgdGhlIHVzZXIncyBwcmVsb2FkIGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1UHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5pbml0SW50ZXJwcmV0ZXIoKTtcbiAgLy8gQW5kIGV4ZWN1dGUgdGhlIGludGVycHJldGVyIGZvciB0aGUgZmlyc3QgdGltZTpcbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuaW5pdGlhbGl6ZWQoKSkge1xuICAgIHRoaXMuSlNJbnRlcnByZXRlci5leGVjdXRlSW50ZXJwcmV0ZXIodHJ1ZSk7XG5cbiAgICAvLyBJbiBhZGRpdGlvbiwgZXhlY3V0ZSB0aGUgZ2xvYmFsIGZ1bmN0aW9uIGNhbGxlZCBwcmVsb2FkKClcbiAgICBpZiAodGhpcy5ldmVudEhhbmRsZXJzLnByZWxvYWQpIHtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wcmVsb2FkLmFwcGx5KG51bGwpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCB3aGlsZSB0aGlzLmdhbWVMYWJQNSBpcyBpbiB0aGUgc2V0dXAgcGhhc2UuIFdlIHJlc3RvcmUgdGhlXG4gKiBpbnRlcnByZXRlciBtZXRob2RzIHRoYXQgd2VyZSBtb2RpZmllZCBkdXJpbmcgcHJlbG9hZCwgdGhlbiBjYWxsIHRoZSB1c2VyJ3NcbiAqIHNldHVwIGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1U2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICAvLyBUT0RPOiAoY3BpcmljaCkgUmVtb3ZlIHRoaXMgY29kZSBvbmNlIHA1cGxheSBzdXBwb3J0cyBpbnN0YW5jZSBtb2RlOlxuXG4gICAgLy8gUmVwbGFjZSByZXN0b3JlZCBwcmVsb2FkIG1ldGhvZHMgZm9yIHRoZSBpbnRlcnByZXRlcjpcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5nYW1lTGFiUDUucDUuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIuY3JlYXRlR2xvYmFsUHJvcGVydHkoXG4gICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgIHRoaXMuZ2FtZUxhYlA1LnA1W21ldGhvZF0sXG4gICAgICAgICAgdGhpcy5nYW1lTGFiUDUucDUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmV2ZW50SGFuZGxlcnMuc2V0dXApIHtcbiAgICAgIHRoaXMuc2V0dXBJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zZXR1cC5hcHBseShudWxsKTtcbiAgICB9XG4gICAgdGhpcy5jb21wbGV0ZVNldHVwSWZTZXR1cENvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmNvbXBsZXRlU2V0dXBJZlNldHVwQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnNldHVwSW5Qcm9ncmVzcyAmJiB0aGlzLkpTSW50ZXJwcmV0ZXIuc2VlblJldHVybkZyb21DYWxsYmFja0R1cmluZ0V4ZWN1dGlvbikge1xuICAgIHRoaXMuZ2FtZUxhYlA1LmFmdGVyU2V0dXBDb21wbGV0ZSgpO1xuICAgIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBpcyBjYWxsZWQgd2hpbGUgdGhpcy5nYW1lTGFiUDUgaXMgaW4gYSBkcmF3KCkgY2FsbC4gV2UgY2FsbCB0aGUgdXNlcidzXG4gKiBkcmF3IGZ1bmN0aW9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblA1RHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuSlNJbnRlcnByZXRlciAmJiB0aGlzLmV2ZW50SGFuZGxlcnMuZHJhdykge1xuICAgIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5kcmF3LmFwcGx5KG51bGwpO1xuICB9XG4gIHRoaXMuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSgpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuY29tcGxldGVSZWRyYXdJZkRyYXdDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuZHJhd0luUHJvZ3Jlc3MgJiYgdGhpcy5KU0ludGVycHJldGVyLnNlZW5SZXR1cm5Gcm9tQ2FsbGJhY2tEdXJpbmdFeGVjdXRpb24pIHtcbiAgICB0aGlzLmdhbWVMYWJQNS5hZnRlckRyYXdDb21wbGV0ZSgpO1xuICAgIHRoaXMuZHJhd0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAkKCcjYnViYmxlJykudGV4dCgnRlBTOiAnICsgdGhpcy5nYW1lTGFiUDUuZ2V0RnJhbWVSYXRlKCkudG9GaXhlZCgwKSk7XG4gIH1cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmhhbmRsZUV4ZWN1dGlvbkVycm9yID0gZnVuY3Rpb24gKGVyciwgbGluZU51bWJlcikge1xuLypcbiAgb3V0cHV0RXJyb3IoU3RyaW5nKGVyciksIEVycm9yTGV2ZWwuRVJST1IsIGxpbmVOdW1iZXIpO1xuICBTdHVkaW8uZXhlY3V0aW9uRXJyb3IgPSB7IGVycjogZXJyLCBsaW5lTnVtYmVyOiBsaW5lTnVtYmVyIH07XG5cbiAgLy8gQ2FsbCBvblB1enpsZUNvbXBsZXRlKCkgaWYgc3ludGF4IGVycm9yIG9yIGFueSB0aW1lIHdlJ3JlIG5vdCBvbiBhIGZyZWVwbGF5IGxldmVsOlxuICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAvLyBNYXJrIHByZUV4ZWN1dGlvbkZhaWx1cmUgYW5kIHRlc3RSZXN1bHRzIGltbWVkaWF0ZWx5IHNvIHRoYXQgYW4gZXJyb3JcbiAgICAvLyBtZXNzYWdlIGFsd2F5cyBhcHBlYXJzLCBldmVuIG9uIGZyZWVwbGF5OlxuICAgIFN0dWRpby5wcmVFeGVjdXRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICBTdHVkaW8udGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5TWU5UQVhfRVJST1JfRkFJTDtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9IGVsc2UgaWYgKCFsZXZlbC5mcmVlUGxheSkge1xuICAgIFN0dWRpby5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbiovXG4gIHRoaXMuY29uc29sZUxvZ2dlcl8ubG9nKGVycik7XG4gIHRocm93IGVycjtcbn07XG5cbi8qKlxuICogRXhlY3V0ZXMgYW4gQVBJIGNvbW1hbmQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmV4ZWN1dGVDbWQgPSBmdW5jdGlvbiAoaWQsIG5hbWUsIG9wdHMpIHtcbiAgY29uc29sZS5sb2coXCJHYW1lTGFiIGV4ZWN1dGVDbWQgXCIgKyBuYW1lKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIHRoZSB0YXNrcyB0byBiZSBkb25lIGFmdGVyIHRoZSB1c2VyIHByb2dyYW0gaXMgZmluaXNoZWQuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmZpbmlzaEV4ZWN1dGlvbl8gPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcGlubmVyJykuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmhpZ2hsaWdodEJsb2NrKG51bGwpO1xuICB9XG4gIHRoaXMuY2hlY2tBbnN3ZXIoKTtcbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5kaXNwbGF5RmVlZGJhY2tfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXZlbCA9IHRoaXMubGV2ZWw7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgc2tpbjogdGhpcy5za2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgcmVzcG9uc2U6IHRoaXMucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsLFxuICAgIC8vIGZlZWRiYWNrSW1hZ2U6IGZlZWRiYWNrSW1hZ2VDYW52YXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKSxcbiAgICAvLyBhZGQgJ2ltcHJlc3NpdmUnOnRydWUgdG8gbm9uLWZyZWVwbGF5IGxldmVscyB0aGF0IHdlIGRlZW0gYXJlIHJlbGF0aXZlbHkgaW1wcmVzc2l2ZSAoc2VlICM2Njk5MDQ4MClcbiAgICBzaG93aW5nU2hhcmluZzogIWxldmVsLmRpc2FibGVTaGFyaW5nICYmIChsZXZlbC5mcmVlUGxheSAvKiB8fCBsZXZlbC5pbXByZXNzaXZlICovKSxcbiAgICAvLyBpbXByZXNzaXZlIGxldmVscyBhcmUgYWxyZWFkeSBzYXZlZFxuICAgIC8vIGFscmVhZHlTYXZlZDogbGV2ZWwuaW1wcmVzc2l2ZSxcbiAgICAvLyBhbGxvdyB1c2VycyB0byBzYXZlIGZyZWVwbGF5IGxldmVscyB0byB0aGVpciBnYWxsZXJ5IChpbXByZXNzaXZlIG5vbi1mcmVlcGxheSBsZXZlbHMgYXJlIGF1dG9zYXZlZClcbiAgICBzYXZlVG9HYWxsZXJ5VXJsOiBsZXZlbC5mcmVlUGxheSAmJiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc2F2ZV90b19nYWxsZXJ5X3VybCxcbiAgICBhcHBTdHJpbmdzOiB7XG4gICAgICByZWluZkZlZWRiYWNrTXNnOiBtc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgc2hhcmluZ1RleHQ6IG1zZy5zaGFyZURyYXdpbmcoKVxuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAvLyBEaXNhYmxlIHRoZSBydW4gYnV0dG9uIHVudGlsIG9uUmVwb3J0Q29tcGxldGUgaXMgY2FsbGVkLlxuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICBydW5CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgdGhpcy5kaXNwbGF5RmVlZGJhY2tfKCk7XG59O1xuXG4vKipcbiAqIFZlcmlmeSBpZiB0aGUgYW5zd2VyIGlzIGNvcnJlY3QuXG4gKiBJZiBzbywgbW92ZSBvbiB0byBuZXh0IGxldmVsLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5jaGVja0Fuc3dlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIC8vIFRlc3Qgd2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSBsZXZlbCwgb3IgdGhlIGxldmVsIGhhc1xuICAvLyBiZWVuIGNvbXBsZXRlZFxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IGxldmVsLmZyZWVQbGF5ICYmICghbGV2ZWwuZWRpdENvZGUgfHwgIXRoaXMuZXhlY3V0aW9uRXJyb3IpO1xuICB0aGlzLnRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuXG4gIHZhciBwcm9ncmFtO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCByZXVzZSBhbiBvbGQgbWVzc2FnZSwgc2luY2Ugbm90IGFsbCBwYXRocyBzZXQgb25lLlxuICB0aGlzLm1lc3NhZ2UgPSB1bmRlZmluZWQ7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHRoaXMuc3R1ZGlvQXBwXy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH1cblxuICAvLyBQbGF5IHNvdW5kXG4gIHRoaXMuc3R1ZGlvQXBwXy5zdG9wTG9vcGluZ0F1ZGlvKCdzdGFydCcpO1xuICBpZiAodGhpcy50ZXN0UmVzdWx0cyA9PT0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLkZSRUVfUExBWSB8fFxuICAgICAgdGhpcy50ZXN0UmVzdWx0cyA+PSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgcmVwb3J0RGF0YSA9IHtcbiAgICBhcHA6ICdnYW1lbGFiJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgYnVpbGRlcjogbGV2ZWwuYnVpbGRlcixcbiAgICByZXN1bHQ6IGxldmVsQ29tcGxldGUsXG4gICAgdGVzdFJlc3VsdDogdGhpcy50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogXy5iaW5kKHRoaXMub25SZXBvcnRDb21wbGV0ZSwgdGhpcyksXG4gICAgLy8gc2F2ZV90b19nYWxsZXJ5OiBsZXZlbC5pbXByZXNzaXZlXG4gIH07XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnJlcG9ydChyZXBvcnREYXRhKTtcblxuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAvLyByZWVuYWJsZSB0b29sYm94XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIGNhbGwgdG8gZGlzcGxheUZlZWRiYWNrKCkgd2lsbCBoYXBwZW4gbGF0ZXIgaW4gb25SZXBvcnRDb21wbGV0ZSgpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8ZGl2IGlkPVwiZGl2R2FtZUxhYlwiIHRhYmluZGV4PVwiMVwiPlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB0YiA9IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveDtcbnZhciBibG9ja09mVHlwZSA9IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGU7XG52YXIgY3JlYXRlQ2F0ZWdvcnkgPSBibG9ja1V0aWxzLmNyZWF0ZUNhdGVnb3J5O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxldmVscy5zYW5kYm94ID0gIHtcbiAgaWRlYWw6IEluZmluaXR5LFxuICByZXF1aXJlZEJsb2NrczogW1xuICBdLFxuICBzY2FsZToge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICBzb2Z0QnV0dG9uczogW1xuICAgICdsZWZ0QnV0dG9uJyxcbiAgICAncmlnaHRCdXR0b24nLFxuICAgICdkb3duQnV0dG9uJyxcbiAgICAndXBCdXR0b24nXG4gIF0sXG4gIGZyZWVQbGF5OiB0cnVlLFxuICB0b29sYm94OlxuICAgIHRiKGJsb2NrT2ZUeXBlKCdnYW1lbGFiX2ZvbycpKSxcbiAgc3RhcnRCbG9ja3M6XG4gICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nXG59O1xuXG4vLyBCYXNlIGNvbmZpZyBmb3IgbGV2ZWxzIGNyZWF0ZWQgdmlhIGxldmVsYnVpbGRlclxubGV2ZWxzLmN1c3RvbSA9IHV0aWxzLmV4dGVuZChsZXZlbHMuc2FuZGJveCwge1xuICBlZGl0Q29kZTogdHJ1ZSxcbiAgY29kZUZ1bmN0aW9uczoge1xuICAgIC8vIEdhbWUgTGFiXG4gICAgXCJ2YXIgaW1nID0gbG9hZEltYWdlXCI6IG51bGwsXG4gICAgXCJpbWFnZVwiOiBudWxsLFxuICAgIFwiZmlsbFwiOiBudWxsLFxuICAgIFwibm9GaWxsXCI6IG51bGwsXG4gICAgXCJzdHJva2VcIjogbnVsbCxcbiAgICBcIm5vU3Ryb2tlXCI6IG51bGwsXG4gICAgXCJhcmNcIjogbnVsbCxcbiAgICBcImVsbGlwc2VcIjogbnVsbCxcbiAgICBcImxpbmVcIjogbnVsbCxcbiAgICBcInBvaW50XCI6IG51bGwsXG4gICAgXCJyZWN0XCI6IG51bGwsXG4gICAgXCJ0cmlhbmdsZVwiOiBudWxsLFxuICAgIFwidGV4dFwiOiBudWxsLFxuICAgIFwidGV4dEFsaWduXCI6IG51bGwsXG4gICAgXCJ0ZXh0U2l6ZVwiOiBudWxsLFxuICAgIFwiZHJhd1Nwcml0ZXNcIjogbnVsbCxcbiAgICBcImFsbFNwcml0ZXNcIjogbnVsbCxcbiAgICBcImJhY2tncm91bmRcIjogbnVsbCxcbiAgICBcIndpZHRoXCI6IG51bGwsXG4gICAgXCJoZWlnaHRcIjogbnVsbCxcbiAgICBcImNhbWVyYVwiOiBudWxsLFxuICAgIFwiY2FtZXJhLm9uXCI6IG51bGwsXG4gICAgXCJjYW1lcmEub2ZmXCI6IG51bGwsXG4gICAgXCJjYW1lcmEuYWN0aXZlXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VYXCI6IG51bGwsXG4gICAgXCJjYW1lcmEubW91c2VZXCI6IG51bGwsXG4gICAgXCJjYW1lcmEucG9zaXRpb24ueFwiOiBudWxsLFxuICAgIFwiY2FtZXJhLnBvc2l0aW9uLnlcIjogbnVsbCxcbiAgICBcImNhbWVyYS56b29tXCI6IG51bGwsXG5cbiAgICAvLyBTcHJpdGVzXG4gICAgXCJ2YXIgc3ByaXRlID0gY3JlYXRlU3ByaXRlXCI6IG51bGwsXG4gICAgXCJzZXRTcGVlZFwiOiBudWxsLFxuICAgIFwiZ2V0QW5pbWF0aW9uTGFiZWxcIjogbnVsbCxcbiAgICBcImdldERpcmVjdGlvblwiOiBudWxsLFxuICAgIFwiZ2V0U3BlZWRcIjogbnVsbCxcbiAgICBcInJlbW92ZVwiOiBudWxsLFxuICAgIFwiYWRkQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhZGRJbWFnZVwiOiBudWxsLFxuICAgIFwiYWRkU3BlZWRcIjogbnVsbCxcbiAgICBcImFkZFRvR3JvdXBcIjogbnVsbCxcbiAgICBcImJvdW5jZVwiOiBudWxsLFxuICAgIFwiY29sbGlkZVwiOiBudWxsLFxuICAgIFwiZGlzcGxhY2VcIjogbnVsbCxcbiAgICBcIm92ZXJsYXBcIjogbnVsbCxcbiAgICBcImNoYW5nZUFuaW1hdGlvblwiOiBudWxsLFxuICAgIFwiY2hhbmdlSW1hZ2VcIjogbnVsbCxcbiAgICBcImF0dHJhY3Rpb25Qb2ludFwiOiBudWxsLFxuICAgIFwibGltaXRTcGVlZFwiOiBudWxsLFxuICAgIFwic2V0Q29sbGlkZXJcIjogbnVsbCxcbiAgICBcInNldFZlbG9jaXR5XCI6IG51bGwsXG4gICAgXCJzcHJpdGUuaGVpZ2h0XCI6IG51bGwsXG4gICAgXCJzcHJpdGUud2lkdGhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5hbmltYXRpb25cIjogbnVsbCxcbiAgICBcImRlcHRoXCI6IG51bGwsXG4gICAgXCJmcmljdGlvblwiOiBudWxsLFxuICAgIFwiaW1tb3ZhYmxlXCI6IG51bGwsXG4gICAgXCJsaWZlXCI6IG51bGwsXG4gICAgXCJtYXNzXCI6IG51bGwsXG4gICAgXCJtYXhTcGVlZFwiOiBudWxsLFxuICAgIFwic3ByaXRlLnBvc2l0aW9uLnhcIjogbnVsbCxcbiAgICBcInNwcml0ZS5wb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54XCI6IG51bGwsXG4gICAgXCJzcHJpdGUucHJldmlvdXNQb3NpdGlvbi55XCI6IG51bGwsXG4gICAgXCJyZW1vdmVkXCI6IG51bGwsXG4gICAgXCJyZXN0aXR1dGlvblwiOiBudWxsLFxuICAgIFwicm90YXRlVG9EaXJlY3Rpb25cIjogbnVsbCxcbiAgICBcInJvdGF0aW9uXCI6IG51bGwsXG4gICAgXCJyb3RhdGlvblNwZWVkXCI6IG51bGwsXG4gICAgXCJzY2FsZVwiOiBudWxsLFxuICAgIFwic2hhcGVDb2xvclwiOiBudWxsLFxuICAgIFwidG91Y2hpbmdcIjogbnVsbCxcbiAgICBcInNwcml0ZS52ZWxvY2l0eS54XCI6IG51bGwsXG4gICAgXCJzcHJpdGUudmVsb2NpdHkueVwiOiBudWxsLFxuICAgIFwidmlzaWJsZVwiOiBudWxsLFxuXG4gICAgLy8gQW5pbWF0aW9uc1xuICAgIFwidmFyIGFuaW0gPSBsb2FkQW5pbWF0aW9uXCI6IG51bGwsXG4gICAgXCJhbmltYXRpb25cIjogbnVsbCxcbiAgICBcImNoYW5nZUZyYW1lXCI6IG51bGwsXG4gICAgXCJuZXh0RnJhbWVcIjogbnVsbCxcbiAgICBcInByZXZpb3VzRnJhbWVcIjogbnVsbCxcbiAgICBcImNsb25lXCI6IG51bGwsXG4gICAgXCJnZXRGcmFtZVwiOiBudWxsLFxuICAgIFwiZ2V0TGFzdEZyYW1lXCI6IG51bGwsXG4gICAgXCJnb1RvRnJhbWVcIjogbnVsbCxcbiAgICBcInBsYXlcIjogbnVsbCxcbiAgICBcInJld2luZFwiOiBudWxsLFxuICAgIFwic3RvcFwiOiBudWxsLFxuICAgIFwiZnJhbWVDaGFuZ2VkXCI6IG51bGwsXG4gICAgXCJmcmFtZURlbGF5XCI6IG51bGwsXG4gICAgXCJpbWFnZXNcIjogbnVsbCxcbiAgICBcImxvb3BpbmdcIjogbnVsbCxcbiAgICBcInBsYXlpbmdcIjogbnVsbCxcbiAgICBcImFuaW0udmlzaWJsZVwiOiBudWxsLFxuXG4gICAgLy8gR3JvdXBzXG4gICAgXCJ2YXIgZ3JvdXAgPSBuZXcgR3JvdXBcIjogbnVsbCxcbiAgICBcImFkZFwiOiBudWxsLFxuICAgIFwiZ3JvdXAucmVtb3ZlXCI6IG51bGwsXG4gICAgXCJjbGVhclwiOiBudWxsLFxuICAgIFwiY29udGFpbnNcIjogbnVsbCxcbiAgICBcImdldFwiOiBudWxsLFxuICAgIFwiZ3JvdXAuYm91bmNlXCI6IG51bGwsXG4gICAgXCJncm91cC5jb2xsaWRlXCI6IG51bGwsXG4gICAgXCJncm91cC5kaXNwbGFjZVwiOiBudWxsLFxuICAgIFwiZ3JvdXAub3ZlcmxhcFwiOiBudWxsLFxuICAgIFwibWF4RGVwdGhcIjogbnVsbCxcbiAgICBcIm1pbkRlcHRoXCI6IG51bGwsXG5cbiAgICAvLyBFdmVudHNcbiAgICBcImtleUlzUHJlc3NlZFwiOiBudWxsLFxuICAgIFwia2V5XCI6IG51bGwsXG4gICAgXCJrZXlDb2RlXCI6IG51bGwsXG4gICAgXCJrZXlQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJrZXlSZWxlYXNlZFwiOiBudWxsLFxuICAgIFwia2V5VHlwZWRcIjogbnVsbCxcbiAgICBcImtleURvd25cIjogbnVsbCxcbiAgICBcImtleVdlbnREb3duXCI6IG51bGwsXG4gICAgXCJrZXlXZW50VXBcIjogbnVsbCxcbiAgICBcIm1vdXNlWFwiOiBudWxsLFxuICAgIFwibW91c2VZXCI6IG51bGwsXG4gICAgXCJwbW91c2VYXCI6IG51bGwsXG4gICAgXCJwbW91c2VZXCI6IG51bGwsXG4gICAgXCJtb3VzZUJ1dHRvblwiOiBudWxsLFxuICAgIFwibW91c2VJc1ByZXNzZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlTW92ZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlRHJhZ2dlZFwiOiBudWxsLFxuICAgIFwibW91c2VQcmVzc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZVJlbGVhc2VkXCI6IG51bGwsXG4gICAgXCJtb3VzZUNsaWNrZWRcIjogbnVsbCxcbiAgICBcIm1vdXNlV2hlZWxcIjogbnVsbCxcblxuICAgIC8vIENvbnRyb2xcbiAgICBcImZvckxvb3BfaV8wXzRcIjogbnVsbCxcbiAgICBcImlmQmxvY2tcIjogbnVsbCxcbiAgICBcImlmRWxzZUJsb2NrXCI6IG51bGwsXG4gICAgXCJ3aGlsZUJsb2NrXCI6IG51bGwsXG5cbiAgICAvLyBNYXRoXG4gICAgXCJhZGRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwic3VidHJhY3RPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibXVsdGlwbHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZGl2aWRlT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImVxdWFsaXR5T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImluZXF1YWxpdHlPcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PcGVyYXRvclwiOiBudWxsLFxuICAgIFwiZ3JlYXRlclRoYW5PckVxdWFsT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3BlcmF0b3JcIjogbnVsbCxcbiAgICBcImxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yXCI6IG51bGwsXG4gICAgXCJhbmRPcGVyYXRvclwiOiBudWxsLFxuICAgIFwib3JPcGVyYXRvclwiOiBudWxsLFxuICAgIFwibm90T3BlcmF0b3JcIjogbnVsbCxcbiAgICBcInJhbmRvbU51bWJlcl9taW5fbWF4XCI6IG51bGwsXG4gICAgXCJtYXRoUm91bmRcIjogbnVsbCxcbiAgICBcIm1hdGhBYnNcIjogbnVsbCxcbiAgICBcIm1hdGhNYXhcIjogbnVsbCxcbiAgICBcIm1hdGhNaW5cIjogbnVsbCxcbiAgICBcIm1hdGhSYW5kb21cIjogbnVsbCxcblxuICAgIC8vIFZhcmlhYmxlc1xuICAgIFwiZGVjbGFyZUFzc2lnbl94XCI6IG51bGwsXG4gICAgXCJkZWNsYXJlTm9Bc3NpZ25feFwiOiBudWxsLFxuICAgIFwiYXNzaWduX3hcIjogbnVsbCxcbiAgICBcImRlY2xhcmVBc3NpZ25fc3RyX2hlbGxvX3dvcmxkXCI6IG51bGwsXG4gICAgXCJzdWJzdHJpbmdcIjogbnVsbCxcbiAgICBcImluZGV4T2ZcIjogbnVsbCxcbiAgICBcImluY2x1ZGVzXCI6IG51bGwsXG4gICAgXCJsZW5ndGhcIjogbnVsbCxcbiAgICBcInRvVXBwZXJDYXNlXCI6IG51bGwsXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiBudWxsLFxuICAgIFwiZGVjbGFyZUFzc2lnbl9saXN0X2FiZFwiOiBudWxsLFxuICAgIFwibGlzdExlbmd0aFwiOiBudWxsLFxuXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgXCJmdW5jdGlvblBhcmFtc19ub25lXCI6IG51bGwsXG4gICAgXCJmdW5jdGlvblBhcmFtc19uXCI6IG51bGwsXG4gICAgXCJjYWxsTXlGdW5jdGlvblwiOiBudWxsLFxuICAgIFwiY2FsbE15RnVuY3Rpb25fblwiOiBudWxsLFxuICAgIFwicmV0dXJuXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBbXG4gICAgJ2Z1bmN0aW9uIHNldHVwKCkgeycsXG4gICAgJyAgJyxcbiAgICAnfScsXG4gICAgJ2Z1bmN0aW9uIGRyYXcoKSB7JyxcbiAgICAnICAnLFxuICAgICd9JyxcbiAgICAnJ10uam9pbignXFxuJyksXG59KTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLmN1c3RvbSwge1xufSk7XG5cbiIsInZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpSmF2YXNjcmlwdC5qcycpO1xudmFyIHNob3dBc3NldE1hbmFnZXIgPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvc2hvdycpO1xudmFyIGdldEFzc2V0RHJvcGRvd24gPSByZXF1aXJlKCcuLi9hc3NldE1hbmFnZW1lbnQvZ2V0QXNzZXREcm9wZG93bicpO1xuXG52YXIgQ09MT1JfTElHSFRfR1JFRU4gPSAnI0QzRTk2NSc7XG52YXIgQ09MT1JfQkxVRSA9ICcjMTlDM0UxJztcbnZhciBDT0xPUl9SRUQgPSAnI0Y3ODE4Myc7XG52YXIgQ09MT1JfQ1lBTiA9ICcjNEREMEUxJztcbnZhciBDT0xPUl9ZRUxMT1cgPSAnI0ZGRjE3Nic7XG52YXIgQ09MT1JfUElOSyA9ICcjRjU3QUM2JztcbnZhciBDT0xPUl9QVVJQTEUgPSAnI0JCNzdDNyc7XG52YXIgQ09MT1JfR1JFRU4gPSAnIzY4RDk5NSc7XG52YXIgQ09MT1JfV0hJVEUgPSAnI0ZGRkZGRic7XG52YXIgQ09MT1JfQkxVRSA9ICcjNjRCNUY2JztcbnZhciBDT0xPUl9PUkFOR0UgPSAnI0ZGQjc0RCc7XG5cbnZhciBzcHJpdGVNZXRob2RQcmVmaXggPSAnW1Nwcml0ZV0uJztcbnZhciBncm91cE1ldGhvZFByZWZpeCA9ICdbR3JvdXBdLic7XG52YXIgYW5pbU1ldGhvZFByZWZpeCA9ICdbQW5pbWF0aW9uXS4nO1xuXG52YXIgc3ByaXRlQmxvY2tQcmVmaXggPSAnc3ByaXRlLic7XG52YXIgZ3JvdXBCbG9ja1ByZWZpeCA9ICdncm91cC4nO1xudmFyIGFuaW1CbG9ja1ByZWZpeCA9ICdhbmltLic7XG5cbnZhciBHYW1lTGFiO1xuXG5leHBvcnRzLmluamVjdEdhbWVMYWIgPSBmdW5jdGlvbiAoZ2FtZWxhYikge1xuICBHYW1lTGFiID0gZ2FtZWxhYjtcbn07XG5cbi8vIEZsaXAgdGhlIGFyZ3VtZW50IG9yZGVyIHNvIHdlIGNhbiBiaW5kIGB0eXBlRmlsdGVyYC5cbmZ1bmN0aW9uIGNob29zZUFzc2V0KHR5cGVGaWx0ZXIsIGNhbGxiYWNrKSB7XG4gIHNob3dBc3NldE1hbmFnZXIoY2FsbGJhY2ssIHR5cGVGaWx0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIC8vIEdhbWUgTGFiXG4gIHtmdW5jOiAnbG9hZEltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsndXJsJ10sIHBhcmFtczogWydcImh0dHBzOi8vY29kZS5vcmcvaW1hZ2VzL2xvZ28ucG5nXCInXSwgdHlwZTogJ2VpdGhlcicsIGRyb3Bkb3duOiB7IDA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGdldEFzc2V0RHJvcGRvd24oJ2ltYWdlJyk7IH0gfSwgYXNzZXRUb29sdGlwOiB7IDA6IGNob29zZUFzc2V0LmJpbmQobnVsbCwgJ2ltYWdlJykgfSB9LFxuICB7ZnVuYzogJ3ZhciBpbWcgPSBsb2FkSW1hZ2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd1cmwnXSwgcGFyYW1zOiBbJ1wiaHR0cHM6Ly9jb2RlLm9yZy9pbWFnZXMvbG9nby5wbmdcIiddLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ2ltYWdlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsnaW1hZ2UnLCdzcmNYJywnc3JjWScsJ3NyY1cnLCdzcmNIJywneCcsJ3knLCd3JywnaCddLCBwYXJhbXM6IFtcImltZ1wiLCBcIjBcIiwgXCIwXCIsIFwiaW1nLndpZHRoXCIsIFwiaW1nLmhlaWdodFwiLCBcIjBcIiwgXCIwXCIsIFwiaW1nLndpZHRoXCIsIFwiaW1nLmhlaWdodFwiXSB9LFxuICB7ZnVuYzogJ2ZpbGwnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIid5ZWxsb3cnXCJdIH0sXG4gIHtmdW5jOiAnbm9GaWxsJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdzdHJva2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWydjb2xvciddLCBwYXJhbXM6IFtcIidibHVlJ1wiXSB9LFxuICB7ZnVuYzogJ25vU3Ryb2tlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdhcmMnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJywnc3RhcnQnLCdzdG9wJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI4MDBcIiwgXCI4MDBcIiwgXCIwXCIsIFwiSEFMRl9QSVwiXSB9LFxuICB7ZnVuYzogJ2VsbGlwc2UnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3cnLCdoJ10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAnbGluZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJ10sIHBhcmFtczogW1wiMFwiLCBcIjBcIiwgXCI0MDBcIiwgXCI0MDBcIl0gfSxcbiAge2Z1bmM6ICdwb2ludCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCJdIH0sXG4gIHtmdW5jOiAncmVjdCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIxMDBcIiwgXCIxMDBcIiwgXCIyMDBcIiwgXCIyMDBcIl0gfSxcbiAge2Z1bmM6ICd0cmlhbmdsZScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3gxJywneTEnLCd4MicsJ3kyJywneDMnLCd5MyddLCBwYXJhbXM6IFtcIjIwMFwiLCBcIjBcIiwgXCIwXCIsIFwiNDAwXCIsIFwiNDAwXCIsIFwiNDAwXCJdIH0sXG4gIHtmdW5jOiAndGV4dCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ3N0cicsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbXCIndGV4dCdcIiwgXCIwXCIsIFwiMFwiLCBcIjQwMFwiLCBcIjEwMFwiXSB9LFxuICB7ZnVuYzogJ3RleHRBbGlnbicsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2hvcml6JywndmVydCddLCBwYXJhbXM6IFtcIkNFTlRFUlwiLCBcIlRPUFwiXSB9LFxuICB7ZnVuYzogJ3RleHRTaXplJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHBhbGV0dGVQYXJhbXM6IFsncGl4ZWxzJ10sIHBhcmFtczogW1wiMTJcIl0gfSxcbiAge2Z1bmM6ICdkcmF3U3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInIH0sXG4gIHtmdW5jOiAnYWxsU3ByaXRlcycsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBibG9jazogJ2FsbFNwcml0ZXMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnYmFja2dyb3VuZCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCBwYWxldHRlUGFyYW1zOiBbJ2NvbG9yJ10sIHBhcmFtczogW1wiJ2JsYWNrJ1wiXSB9LFxuICB7ZnVuYzogJ3dpZHRoJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdoZWlnaHQnLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYScsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLm9uJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEub2ZmJywgY2F0ZWdvcnk6ICdHYW1lIExhYicgfSxcbiAge2Z1bmM6ICdjYW1lcmEuYWN0aXZlJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VYJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEubW91c2VZJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdjYW1lcmEucG9zaXRpb24ueCcsIGNhdGVnb3J5OiAnR2FtZSBMYWInLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnY2FtZXJhLnBvc2l0aW9uLnknLCBjYXRlZ29yeTogJ0dhbWUgTGFiJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2NhbWVyYS56b29tJywgY2F0ZWdvcnk6ICdHYW1lIExhYicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcblxuICAvLyBTcHJpdGVzXG4gIHtmdW5jOiAnY3JlYXRlU3ByaXRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3dpZHRoJywnaGVpZ2h0J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiMzBcIiwgXCIzMFwiXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXIgc3ByaXRlID0gY3JlYXRlU3ByaXRlJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneScsJ3dpZHRoJywnaGVpZ2h0J10sIHBhcmFtczogW1wiMjAwXCIsIFwiMjAwXCIsIFwiMzBcIiwgXCIzMFwiXSwgbm9BdXRvY29tcGxldGU6IHRydWUsIGRvY0Z1bmM6ICdjcmVhdGVTcHJpdGUnIH0sXG4gIHtmdW5jOiAnc2V0U3BlZWQnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRTcGVlZCcgfSxcbiAge2Z1bmM6ICdnZXRBbmltYXRpb25MYWJlbCcsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5nZXRBbmltYXRpb25MYWJlbCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdnZXREaXJlY3Rpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouZ2V0RGlyZWN0aW9uJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dldFNwZWVkJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldFNwZWVkJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JlbW92ZScsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5yZW1vdmUnIH0sXG4gIHtmdW5jOiAnYWRkQW5pbWF0aW9uJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJywnYW5pbWF0aW9uJ10sIHBhcmFtczogWydcImFuaW0xXCInLCBcImFuaW1cIl0sIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouYWRkQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ2FkZEltYWdlJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJywnaW1hZ2UnXSwgcGFyYW1zOiBbJ1wiaW1nMVwiJywgXCJpbWdcIl0sIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouYWRkSW1hZ2UnIH0sXG4gIHtmdW5jOiAnYWRkU3BlZWQnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsnc3BlZWQnLCdhbmdsZSddLCBwYXJhbXM6IFtcIjFcIiwgXCI5MFwiXSwgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5hZGRTcGVlZCcgfSxcbiAge2Z1bmM6ICdhZGRUb0dyb3VwJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2dyb3VwJ10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouYWRkVG9Hcm91cCcgfSxcbiAge2Z1bmM6ICdib3VuY2UnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wiZ3JvdXBcIl0sIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouYm91bmNlJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdjb2xsaWRlJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmNvbGxpZGUnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ2Rpc3BsYWNlJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmRpc3BsYWNlJywgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICdvdmVybGFwJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcImdyb3VwXCJdLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLm92ZXJsYXAnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ2NoYW5nZUFuaW1hdGlvbicsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydsYWJlbCddLCBwYXJhbXM6IFsnXCJhbmltMVwiJ10sIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouY2hhbmdlQW5pbWF0aW9uJyB9LFxuICB7ZnVuYzogJ2NoYW5nZUltYWdlJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBwYWxldHRlUGFyYW1zOiBbJ2xhYmVsJ10sIHBhcmFtczogWydcImltZzFcIiddLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmNoYW5nZUltYWdlJyB9LFxuICB7ZnVuYzogJ2F0dHJhY3Rpb25Qb2ludCcsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydzcGVlZCcsJ3gnLCd5J10sIHBhcmFtczogW1wiMVwiLCBcIjIwMFwiLCBcIjIwMFwiXSwgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5hdHRyYWN0aW9uUG9pbnQnIH0sXG4gIHtmdW5jOiAnbGltaXRTcGVlZCcsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWydtYXgnXSwgcGFyYW1zOiBbXCIzXCJdLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmxpbWl0U3BlZWQnIH0sXG4gIHtmdW5jOiAnc2V0Q29sbGlkZXInLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHBhbGV0dGVQYXJhbXM6IFsndHlwZScsJ3gnLCd5JywndycsJ2gnXSwgcGFyYW1zOiBbJ1wicmVjdGFuZ2xlXCInLCBcIjBcIiwgXCIwXCIsIFwiMjBcIiwgXCIyMFwiXSwgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5zZXRDb2xsaWRlcicgfSxcbiAge2Z1bmM6ICdzZXRWZWxvY2l0eScsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgcGFsZXR0ZVBhcmFtczogWyd4JywneSddLCBwYXJhbXM6IFtcIjFcIiwgXCIxXCJdLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLnNldFZlbG9jaXR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS5oZWlnaHQnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJyouaGVpZ2h0JywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3Nwcml0ZS53aWR0aCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnKi53aWR0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUuYW5pbWF0aW9uJywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICcqLmFuaW1hdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdkZXB0aCcsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5kZXB0aCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdmcmljdGlvbicsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmljdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdpbW1vdmFibGUnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouaW1tb3ZhYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2xpZmUnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoubGlmZScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtYXNzJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLm1hc3MnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbWF4U3BlZWQnLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoubWF4U3BlZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncG9zaXRpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoucG9zaXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnc3ByaXRlLnBvc2l0aW9uLngnLCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCBtb2RlT3B0aW9uTmFtZTogJ3Nwcml0ZV9wb3NpdGlvbl94JywgdHlwZTogJ3Byb3BlcnR5Jywgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdzcHJpdGUucG9zaXRpb24ueScsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnc3ByaXRlX3Bvc2l0aW9uX3knLCB0eXBlOiAncHJvcGVydHknLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ3ByZXZpb3VzUG9zaXRpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoucHJldmlvdXNQb3NpdGlvbicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbi54JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICdzcHJpdGVfcHJldmlvdXNQb3NpdGlvbl94JywgdHlwZTogJ3Byb3BlcnR5Jywgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdzcHJpdGUucHJldmlvdXNQb3NpdGlvbi55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICdzcHJpdGVfcHJldmlvdXNQb3NpdGlvbl95JywgdHlwZTogJ3Byb3BlcnR5Jywgbm9BdXRvY29tcGxldGU6IHRydWUgfSxcbiAge2Z1bmM6ICdyZW1vdmVkJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLnJlbW92ZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncmVzdGl0dXRpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoucmVzdGl0dXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncm90YXRlVG9EaXJlY3Rpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRlVG9EaXJlY3Rpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncm90YXRpb24nLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyoucm90YXRpb24nLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncm90YXRpb25TcGVlZCcsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5yb3RhdGlvblNwZWVkJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3NjYWxlJywgYmxvY2tQcmVmaXg6IHNwcml0ZUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ1Nwcml0ZXMnLCB0aXBQcmVmaXg6IHNwcml0ZU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLnNjYWxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3NoYXBlQ29sb3InLCBibG9ja1ByZWZpeDogc3ByaXRlQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnU3ByaXRlcycsIHRpcFByZWZpeDogc3ByaXRlTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouc2hhcGVDb2xvcicsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICd0b3VjaGluZycsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi50b3VjaGluZycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICd2ZWxvY2l0eScsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi52ZWxvY2l0eScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdzcHJpdGUudmVsb2NpdHkueCcsIGNhdGVnb3J5OiAnU3ByaXRlcycsIG1vZGVPcHRpb25OYW1lOiAnc3ByaXRlX3ZlbG9jaXR5X3gnLCB0eXBlOiAncHJvcGVydHknLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LFxuICB7ZnVuYzogJ3Nwcml0ZS52ZWxvY2l0eS55JywgY2F0ZWdvcnk6ICdTcHJpdGVzJywgbW9kZU9wdGlvbk5hbWU6ICdzcHJpdGVfdmVsb2NpdHlfeScsIHR5cGU6ICdwcm9wZXJ0eScsIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sXG4gIHtmdW5jOiAndmlzaWJsZScsIGJsb2NrUHJlZml4OiBzcHJpdGVCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdTcHJpdGVzJywgdGlwUHJlZml4OiBzcHJpdGVNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBwcm9wZXJ0aWVzOlxuY2FtZXJhXG5jb2xsaWRlciAtIFVTRUZVTD8gKG1hcnNoYWwgQUFCQiBhbmQgQ2lyY2xlQ29sbGlkZXIpXG5kZWJ1Z1xuZ3JvdXBzXG5tb3VzZUFjdGl2ZVxubW91c2VJc092ZXJcbm1vdXNlSXNQcmVzc2VkXG5vcmlnaW5hbEhlaWdodFxub3JpZ2luYWxXaWR0aFxuKi9cblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIFNwcml0ZSBtZXRob2RzOlxuYWRkSW1hZ2UobGFiZWxpbWcpIC0gMSBwYXJhbSB2ZXJzaW9uOiAoc2V0cyBsYWJlbCB0byBcIm5vcm1hbFwiIGF1dG9tYXRpY2FsbHkpXG5kcmF3KCkgLSBPVkVSUklERSBhbmQvb3IgVVNFRlVMP1xubWlycm9yWChkaXIpIC0gVVNFRlVMP1xubWlycm9yWShkaXIpIC0gVVNFRlVMP1xub3ZlcmxhcFBpeGVsKHBvaW50WHBvaW50WSkgLSBVU0VGVUw/XG5vdmVybGFwUG9pbnQocG9pbnRYcG9pbnRZKSAtIFVTRUZVTD9cbnVwZGF0ZSgpIC0gVVNFRlVMP1xuKi9cblxuICAvLyBBbmltYXRpb25zXG4gIHtmdW5jOiAnbG9hZEFuaW1hdGlvbicsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsndXJsMScsJ3VybDInXSwgcGFyYW1zOiBbJ1wiaHR0cDovL3A1cGxheS5tb2xsZWluZHVzdHJpYS5vcmcvZXhhbXBsZXMvYXNzZXRzL2dob3N0X3N0YW5kaW5nMDAwMS5wbmdcIicsICdcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDIucG5nXCInXSwgdHlwZTogJ2VpdGhlcicgfSxcbiAge2Z1bmM6ICd2YXIgYW5pbSA9IGxvYWRBbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ3VybDEnLCd1cmwyJ10sIHBhcmFtczogWydcImh0dHA6Ly9wNXBsYXkubW9sbGVpbmR1c3RyaWEub3JnL2V4YW1wbGVzL2Fzc2V0cy9naG9zdF9zdGFuZGluZzAwMDEucG5nXCInLCAnXCJodHRwOi8vcDVwbGF5Lm1vbGxlaW5kdXN0cmlhLm9yZy9leGFtcGxlcy9hc3NldHMvZ2hvc3Rfc3RhbmRpbmcwMDAyLnBuZ1wiJ10sIG5vQXV0b2NvbXBsZXRlOiB0cnVlLCBkb2NGdW5jOiAnbG9hZEFuaW1hdGlvbicgfSxcbiAge2Z1bmM6ICdhbmltYXRpb24nLCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2FuaW1hdGlvbicsJ3gnLCd5J10sIHBhcmFtczogW1wiYW5pbVwiLCBcIjUwXCIsIFwiNTBcIl0gfSxcbiAge2Z1bmM6ICdjaGFuZ2VGcmFtZScsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHBhbGV0dGVQYXJhbXM6IFsnZnJhbWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5jaGFuZ2VGcmFtZScgfSxcbiAge2Z1bmM6ICduZXh0RnJhbWUnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5uZXh0RnJhbWUnIH0sXG4gIHtmdW5jOiAncHJldmlvdXNGcmFtZScsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHRpcFByZWZpeDogYW5pbU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLnByZXZpb3VzRnJhbWUnIH0sXG4gIHtmdW5jOiAnY2xvbmUnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5jbG9uZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdnZXRGcmFtZScsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHRpcFByZWZpeDogYW5pbU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldEZyYW1lJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2dldExhc3RGcmFtZScsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHRpcFByZWZpeDogYW5pbU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldExhc3RGcmFtZScsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdnb1RvRnJhbWUnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCBwYWxldHRlUGFyYW1zOiBbJ2ZyYW1lJ10sIHBhcmFtczogW1wiMVwiXSwgdGlwUHJlZml4OiBhbmltTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouZ29Ub0ZyYW1lJyB9LFxuICB7ZnVuYzogJ3BsYXknLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5JyB9LFxuICB7ZnVuYzogJ3Jld2luZCcsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHRpcFByZWZpeDogYW5pbU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLnJld2luZCcgfSxcbiAge2Z1bmM6ICdzdG9wJywgYmxvY2tQcmVmaXg6IGFuaW1CbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgdGlwUHJlZml4OiBhbmltTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouc3RvcCcgfSxcbiAge2Z1bmM6ICdmcmFtZUNoYW5nZWQnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5mcmFtZUNoYW5nZWQnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnZnJhbWVEZWxheScsIGJsb2NrUHJlZml4OiBhbmltQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIHRpcFByZWZpeDogYW5pbU1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmZyYW1lRGVsYXknLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnaW1hZ2VzJywgYmxvY2tQcmVmaXg6IGFuaW1CbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdBbmltYXRpb25zJywgdGlwUHJlZml4OiBhbmltTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouaW1hZ2VzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2xvb3BpbmcnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5sb29waW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ3BsYXlpbmcnLCBibG9ja1ByZWZpeDogYW5pbUJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0FuaW1hdGlvbnMnLCB0aXBQcmVmaXg6IGFuaW1NZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5wbGF5aW5nJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2FuaW0udmlzaWJsZScsIGNhdGVnb3J5OiAnQW5pbWF0aW9ucycsIG1vZGVPcHRpb25OYW1lOiAnKi52aXNpYmxlJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIEFuaW1hdGlvbiBtZXRob2RzOlxuZHJhdyh4eSlcbmdldEZyYW1lSW1hZ2UoKVxuZ2V0SGVpZ2h0KClcbmdldEltYWdlQXQoZnJhbWUpXG5nZXRXaWR0aCgpXG4qL1xuXG4gIC8vIEdyb3Vwc1xuICB7ZnVuYzogJ0dyb3VwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCB0eXBlOiAnZWl0aGVyJyB9LFxuICB7ZnVuYzogJ3ZhciBncm91cCA9IG5ldyBHcm91cCcsIGNhdGVnb3J5OiAnR3JvdXBzJywgdHlwZTogJ2VpdGhlcicsIGRvY0Z1bmM6ICdHcm91cCcgfSxcbiAge2Z1bmM6ICdhZGQnLCBibG9ja1ByZWZpeDogZ3JvdXBCbG9ja1ByZWZpeCwgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3Nwcml0ZSddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgdGlwUHJlZml4OiBncm91cE1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmFkZCcgfSxcbiAge2Z1bmM6ICdncm91cC5yZW1vdmUnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX3JlbW92ZScsIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sIC8qIGF2b2lkIHNwcml0ZS5yZW1vdmUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdjbGVhcicsIGJsb2NrUHJlZml4OiBncm91cEJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0dyb3VwcycsIHRpcFByZWZpeDogZ3JvdXBNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5jbGVhcicgfSxcbiAge2Z1bmM6ICdjb250YWlucycsIGJsb2NrUHJlZml4OiBncm91cEJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsnc3ByaXRlJ10sIHBhcmFtczogW1wic3ByaXRlXCJdLCB0aXBQcmVmaXg6IGdyb3VwTWV0aG9kUHJlZml4LCBtb2RlT3B0aW9uTmFtZTogJyouY29udGFpbnMnLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZ2V0JywgYmxvY2tQcmVmaXg6IGdyb3VwQmxvY2tQcmVmaXgsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWydpJ10sIHBhcmFtczogW1wiMFwiXSwgdGlwUHJlZml4OiBncm91cE1ldGhvZFByZWZpeCwgbW9kZU9wdGlvbk5hbWU6ICcqLmdldCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdncm91cC5ib3VuY2UnLCBjYXRlZ29yeTogJ0dyb3VwcycsIHBhbGV0dGVQYXJhbXM6IFsndGFyZ2V0J10sIHBhcmFtczogW1wic3ByaXRlXCJdLCBtb2RlT3B0aW9uTmFtZTogJ2dyb3VwX2JvdW5jZScsIG5vQXV0b2NvbXBsZXRlOiB0cnVlIH0sIC8qIGF2b2lkIHNwcml0ZS5ib3VuY2UgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5jb2xsaWRlJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9jb2xsaWRlJywgbm9BdXRvY29tcGxldGU6IHRydWUgfSwgLyogYXZvaWQgc3ByaXRlLmNvbGxpZGUgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5kaXNwbGFjZScsIGNhdGVnb3J5OiAnR3JvdXBzJywgcGFsZXR0ZVBhcmFtczogWyd0YXJnZXQnXSwgcGFyYW1zOiBbXCJzcHJpdGVcIl0sIG1vZGVPcHRpb25OYW1lOiAnZ3JvdXBfZGlzcGxhY2UnLCBub0F1dG9jb21wbGV0ZTogdHJ1ZSB9LCAvKiBhdm9pZCBzcHJpdGUuZGlzcGxhY2UgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdncm91cC5vdmVybGFwJywgY2F0ZWdvcnk6ICdHcm91cHMnLCBwYWxldHRlUGFyYW1zOiBbJ3RhcmdldCddLCBwYXJhbXM6IFtcInNwcml0ZVwiXSwgbW9kZU9wdGlvbk5hbWU6ICdncm91cF9vdmVybGFwJywgbm9BdXRvY29tcGxldGU6IHRydWUgfSwgLyogYXZvaWQgc3ByaXRlLm92ZXJsYXAgY29uZmxpY3QgKi9cbiAge2Z1bmM6ICdtYXhEZXB0aCcsIGJsb2NrUHJlZml4OiBncm91cEJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0dyb3VwcycsIHRpcFByZWZpeDogZ3JvdXBNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5tYXhEZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtaW5EZXB0aCcsIGJsb2NrUHJlZml4OiBncm91cEJsb2NrUHJlZml4LCBjYXRlZ29yeTogJ0dyb3VwcycsIHRpcFByZWZpeDogZ3JvdXBNZXRob2RQcmVmaXgsIG1vZGVPcHRpb25OYW1lOiAnKi5taW5EZXB0aCcsIHR5cGU6ICd2YWx1ZScgfSxcblxuLyogVE9ETzogZGVjaWRlIHdoZXRoZXIgdG8gZXhwb3NlIHRoZXNlIEdyb3VwIG1ldGhvZHM6XG5kcmF3KCkgLSBVU0VGVUw/XG4qL1xuXG4gIC8vIEV2ZW50c1xuICB7ZnVuYzogJ2tleUlzUHJlc3NlZCcsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ2tleUNvZGUnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdrZXlEb3duJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVdlbnREb3duJywgcGFsZXR0ZVBhcmFtczogWydjb2RlJ10sIHBhcmFtczogW1wiVVBfQVJST1dcIl0sIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2tleVdlbnRVcCcsIHBhbGV0dGVQYXJhbXM6IFsnY29kZSddLCBwYXJhbXM6IFtcIlVQX0FSUk9XXCJdLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdrZXlQcmVzc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlQcmVzc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlQcmVzc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ2tleVJlbGVhc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAna2V5VHlwZWQnLCBibG9jazogJ2Z1bmN0aW9uIGtleVR5cGVkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBrZXlUeXBlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVgnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZVknLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdwbW91c2VYJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAncG1vdXNlWScsIGNhdGVnb3J5OiAnRXZlbnRzJywgdHlwZTogJ3Byb3BlcnR5JyB9LFxuICB7ZnVuYzogJ21vdXNlQnV0dG9uJywgY2F0ZWdvcnk6ICdFdmVudHMnLCB0eXBlOiAncHJvcGVydHknIH0sXG4gIHtmdW5jOiAnbW91c2VJc1ByZXNzZWQnLCBjYXRlZ29yeTogJ0V2ZW50cycsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICdtb3VzZU1vdmVkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZU1vdmVkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZU1vdmVkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlRHJhZ2dlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VEcmFnZ2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZURyYWdnZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VQcmVzc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVByZXNzZWQoKSB7fScsIGV4cGFuc2lvbjogJ2Z1bmN0aW9uIG1vdXNlUHJlc3NlZCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcbiAge2Z1bmM6ICdtb3VzZVJlbGVhc2VkJywgYmxvY2s6ICdmdW5jdGlvbiBtb3VzZVJlbGVhc2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZVJlbGVhc2VkKCkge1xcbiAgX187XFxufScsIGNhdGVnb3J5OiAnRXZlbnRzJyB9LFxuICB7ZnVuYzogJ21vdXNlQ2xpY2tlZCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VDbGlja2VkKCkge30nLCBleHBhbnNpb246ICdmdW5jdGlvbiBtb3VzZUNsaWNrZWQoKSB7XFxuICBfXztcXG59JywgY2F0ZWdvcnk6ICdFdmVudHMnIH0sXG4gIHtmdW5jOiAnbW91c2VXaGVlbCcsIGJsb2NrOiAnZnVuY3Rpb24gbW91c2VXaGVlbCgpIHt9JywgZXhwYW5zaW9uOiAnZnVuY3Rpb24gbW91c2VXaGVlbCgpIHtcXG4gIF9fO1xcbn0nLCBjYXRlZ29yeTogJ0V2ZW50cycgfSxcblxuICAvLyBNYXRoXG4gIHtmdW5jOiAnc2luJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydhbmdsZSddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdjb3MnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2FuZ2xlJ10sIHBhcmFtczogW1wiMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3RhbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnYW5nbGUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXNpbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYWNvcycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXRhbicsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsndmFsdWUnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnYXRhbjInLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3knLCd4J10sIHBhcmFtczogW1wiMTBcIiwgXCIxMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2RlZ3JlZXMnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3JhZGlhbnMnXSwgcGFyYW1zOiBbXCIwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncmFkaWFucycsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnZGVncmVlcyddLCBwYXJhbXM6IFtcIjBcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdhbmdsZU1vZGUnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ21vZGUnXSwgcGFyYW1zOiBbXCJERUdSRUVTXCJdIH0sXG4gIHtmdW5jOiAncmFuZG9tJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydtaW4nLCdtYXgnXSwgcGFyYW1zOiBbXCIxXCIsIFwiNVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JhbmRvbUdhdXNzaWFuJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydtZWFuJywnc2QnXSwgcGFyYW1zOiBbXCIwXCIsIFwiMTVcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdyYW5kb21TZWVkJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydzZWVkJ10sIHBhcmFtczogW1wiOTlcIl0gfSxcbiAge2Z1bmM6ICdhYnMnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIi0xXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnY2VpbCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMC4xXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnY29uc3RyYWluJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nLCdsb3cnLCdoaWdoJ10sIHBhcmFtczogW1wiMS4xXCIsIFwiMFwiLCBcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdkaXN0JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd4MScsJ3kxJywneDInLCd5MiddLCBwYXJhbXM6IFtcIjBcIiwgXCIwXCIsIFwiMTAwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZXhwJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIxXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnZmxvb3InLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjAuOVwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ2xlcnAnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3N0YXJ0Jywnc3RvcCcsJ2FtdCddLCBwYXJhbXM6IFtcIjBcIiwgXCIxMDBcIiwgXCIwLjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdsb2cnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjFcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtYWcnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ2EnLCdiJ10sIHBhcmFtczogW1wiMTAwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAnbWFwJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyd2YWx1ZScsJ3N0YXJ0MScsJ3N0b3AxJywnc3RhcnQyJywnc3RvcCddLCBwYXJhbXM6IFtcIjAuOVwiLCBcIjBcIiwgXCIxXCIsIFwiMFwiLCBcIjEwMFwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ21heCcsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbjEnLCduMiddLCBwYXJhbXM6IFtcIjFcIixcIjNcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdtaW4nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ24xJywnbjInXSwgcGFyYW1zOiBbXCIxXCIsIFwiM1wiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ25vcm0nLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ3ZhbHVlJywnc3RhcnQnLCdzdG9wJ10sIHBhcmFtczogW1wiOTBcIiwgXCIwXCIsIFwiMTAwXCJdLCB0eXBlOiAndmFsdWUnIH0sXG4gIHtmdW5jOiAncG93JywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWyduJywnZSddLCBwYXJhbXM6IFtcIjEwXCIsIFwiMlwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3JvdW5kJywgY2F0ZWdvcnk6ICdNYXRoJywgcGFsZXR0ZVBhcmFtczogWydudW0nXSwgcGFyYW1zOiBbXCIwLjlcIl0sIHR5cGU6ICd2YWx1ZScgfSxcbiAge2Z1bmM6ICdzcScsIGNhdGVnb3J5OiAnTWF0aCcsIHBhbGV0dGVQYXJhbXM6IFsnbnVtJ10sIHBhcmFtczogW1wiMlwiXSwgdHlwZTogJ3ZhbHVlJyB9LFxuICB7ZnVuYzogJ3NxcnQnLCBjYXRlZ29yeTogJ01hdGgnLCBwYWxldHRlUGFyYW1zOiBbJ251bSddLCBwYXJhbXM6IFtcIjlcIl0sIHR5cGU6ICd2YWx1ZScgfSxcblxuICAvLyBWZWN0b3JcbiAge2Z1bmM6ICd4JywgY2F0ZWdvcnk6ICdWZWN0b3InLCBtb2RlT3B0aW9uTmFtZTogJyoueCcsIHR5cGU6ICdwcm9wZXJ0eScgfSxcbiAge2Z1bmM6ICd5JywgY2F0ZWdvcnk6ICdWZWN0b3InLCBtb2RlT3B0aW9uTmFtZTogJyoueScsIHR5cGU6ICdwcm9wZXJ0eScgfSxcblxuICAvLyBBZHZhbmNlZFxuXTtcblxubW9kdWxlLmV4cG9ydHMuY2F0ZWdvcmllcyA9IHtcbiAgJ0dhbWUgTGFiJzoge1xuICAgIGNvbG9yOiAneWVsbG93JyxcbiAgICByZ2I6IENPTE9SX1lFTExPVyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIFNwcml0ZXM6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgcmdiOiBDT0xPUl9SRUQsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBBbmltYXRpb25zOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgR3JvdXBzOiB7XG4gICAgY29sb3I6ICdyZWQnLFxuICAgIHJnYjogQ09MT1JfUkVELFxuICAgIGJsb2NrczogW11cbiAgfSxcbiAgRGF0YToge1xuICAgIGNvbG9yOiAnbGlnaHRncmVlbicsXG4gICAgcmdiOiBDT0xPUl9MSUdIVF9HUkVFTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIERyYXdpbmc6IHtcbiAgICBjb2xvcjogJ2N5YW4nLFxuICAgIHJnYjogQ09MT1JfQ1lBTixcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEV2ZW50czoge1xuICAgIGNvbG9yOiAnZ3JlZW4nLFxuICAgIHJnYjogQ09MT1JfR1JFRU4sXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBBZHZhbmNlZDoge1xuICAgIGNvbG9yOiAnYmx1ZScsXG4gICAgcmdiOiBDT0xPUl9CTFVFLFxuICAgIGJsb2NrczogW11cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzLmFkZGl0aW9uYWxQcmVkZWZWYWx1ZXMgPSBbXG4gICdQMkQnLCAnV0VCR0wnLCAnQVJST1cnLCAnQ1JPU1MnLCAnSEFORCcsICdNT1ZFJyxcbiAgJ1RFWFQnLCAnV0FJVCcsICdIQUxGX1BJJywgJ1BJJywgJ1FVQVJURVJfUEknLCAnVEFVJywgJ1RXT19QSScsICdERUdSRUVTJyxcbiAgJ1JBRElBTlMnLCAnQ09STkVSJywgJ0NPUk5FUlMnLCAnUkFESVVTJywgJ1JJR0hUJywgJ0xFRlQnLCAnQ0VOVEVSJywgJ1RPUCcsXG4gICdCT1RUT00nLCAnQkFTRUxJTkUnLCAnUE9JTlRTJywgJ0xJTkVTJywgJ1RSSUFOR0xFUycsICdUUklBTkdMRV9GQU4nLFxuICAnVFJJQU5HTEVfU1RSSVAnLCAnUVVBRFMnLCAnUVVBRF9TVFJJUCcsICdDTE9TRScsICdPUEVOJywgJ0NIT1JEJywgJ1BJRScsXG4gICdQUk9KRUNUJywgJ1NRVUFSRScsICdST1VORCcsICdCRVZFTCcsICdNSVRFUicsICdSR0InLCAnSFNCJywgJ0hTTCcsICdBVVRPJyxcbiAgJ0FMVCcsICdCQUNLU1BBQ0UnLCAnQ09OVFJPTCcsICdERUxFVEUnLCAnRE9XTl9BUlJPVycsICdFTlRFUicsICdFU0NBUEUnLFxuICAnTEVGVF9BUlJPVycsICdPUFRJT04nLCAnUkVUVVJOJywgJ1JJR0hUX0FSUk9XJywgJ1NISUZUJywgJ1RBQicsICdVUF9BUlJPVycsXG4gICdCTEVORCcsICdBREQnLCAnREFSS0VTVCcsICdMSUdIVEVTVCcsICdESUZGRVJFTkNFJywgJ0VYQ0xVU0lPTicsXG4gICdNVUxUSVBMWScsICdTQ1JFRU4nLCAnUkVQTEFDRScsICdPVkVSTEFZJywgJ0hBUkRfTElHSFQnLCAnU09GVF9MSUdIVCcsXG4gICdET0RHRScsICdCVVJOJywgJ1RIUkVTSE9MRCcsICdHUkFZJywgJ09QQVFVRScsICdJTlZFUlQnLCAnUE9TVEVSSVpFJyxcbiAgJ0RJTEFURScsICdFUk9ERScsICdCTFVSJywgJ05PUk1BTCcsICdJVEFMSUMnLCAnQk9MRCcsICdfREVGQVVMVF9URVhUX0ZJTEwnLFxuICAnX0RFRkFVTFRfTEVBRE1VTFQnLCAnX0NUWF9NSURETEUnLCAnTElORUFSJywgJ1FVQURSQVRJQycsICdCRVpJRVInLFxuICAnQ1VSVkUnLCAnX0RFRkFVTFRfU1RST0tFJywgJ19ERUZBVUxUX0ZJTEwnXG5dO1xubW9kdWxlLmV4cG9ydHMuc2hvd1BhcmFtRHJvcGRvd25zID0gdHJ1ZTtcbiIsIi8vIGxvY2FsZSBmb3IgZ2FtZWxhYlxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5nYW1lbGFiX2xvY2FsZTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg2LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG4nKTsxOTsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCgyMiwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbicpOzI1OyB9IDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKG51bGwsICdmb28nKTtcbn07XG4iLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuLypcbiAqIEFsbCBBUElzIGRpc2FibGVkIGZvciBub3cuIHA1L3A1cGxheSBpcyB0aGUgb25seSBleHBvc2VkIEFQSS4gSWYgd2Ugd2FudCB0b1xuICogZXhwb3NlIG90aGVyIHRvcC1sZXZlbCBBUElzLCB0aGV5IHNob3VsZCBiZSBpbmNsdWRlZCBoZXJlIGFzIHNob3duIGluIHRoZXNlXG4gKiBjb21tZW50ZWQgZnVuY3Rpb25zXG4gKlxuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uIChpZCkge1xuICBHYW1lTGFiLmV4ZWN1dGVDbWQoaWQsICdmb28nKTtcbn07XG4qL1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdhbWVMYWJTcHJpdGUgPSByZXF1aXJlKCcuL0dhbWVMYWJTcHJpdGUnKTtcbnZhciBhc3NldFByZWZpeCA9IHJlcXVpcmUoJy4uL2Fzc2V0TWFuYWdlbWVudC9hc3NldFByZWZpeCcpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBHYW1lTGFiUDUgY2xhc3MgdGhhdCB3cmFwcyBwNSBhbmQgcDVwbGF5IGFuZCBwYXRjaGVzIGl0IGluXG4gKiBzcGVjaWZpYyBwbGFjZXMgdG8gZW5hYmxlIEdhbWVMYWIgZnVuY3Rpb25hbGl0eVxuICovXG52YXIgR2FtZUxhYlA1ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnA1ID0gbnVsbDtcbiAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuICB0aGlzLnA1ZXZlbnROYW1lcyA9IFtcbiAgICAnbW91c2VNb3ZlZCcsICdtb3VzZURyYWdnZWQnLCAnbW91c2VQcmVzc2VkJywgJ21vdXNlUmVsZWFzZWQnLFxuICAgICdtb3VzZUNsaWNrZWQnLCAnbW91c2VXaGVlbCcsXG4gICAgJ2tleVByZXNzZWQnLCAna2V5UmVsZWFzZWQnLCAna2V5VHlwZWQnXG4gIF07XG4gIHRoaXMucDVzcGVjaWFsRnVuY3Rpb25zID0gWydwcmVsb2FkJywgJ2RyYXcnLCAnc2V0dXAnXS5jb25jYXQodGhpcy5wNWV2ZW50TmFtZXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTGFiUDU7XG5cbkdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhpcyBHYW1lTGFiUDUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0geyFGdW5jdGlvbn0gb3B0aW9ucy5nYW1lTGFiIGluc3RhbmNlIG9mIHBhcmVudCBHYW1lTGFiIG9iamVjdFxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25FeGVjdXRpb25TdGFydGluZyBjYWxsYmFjayB0byBydW4gZHVyaW5nIHA1IGluaXRcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uUHJlbG9hZCBjYWxsYmFjayB0byBydW4gZHVyaW5nIHByZWxvYWQoKVxuICogQHBhcmFtIHshRnVuY3Rpb259IG9wdGlvbnMub25TZXR1cCBjYWxsYmFjayB0byBydW4gZHVyaW5nIHNldHVwKClcbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBvcHRpb25zLm9uRHJhdyBjYWxsYmFjayB0byBydW4gZHVyaW5nIGVhY2ggZHJhdygpXG4gKi9cbkdhbWVMYWJQNS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgdGhpcy5vbkV4ZWN1dGlvblN0YXJ0aW5nID0gb3B0aW9ucy5vbkV4ZWN1dGlvblN0YXJ0aW5nO1xuICB0aGlzLm9uUHJlbG9hZCA9IG9wdGlvbnMub25QcmVsb2FkO1xuICB0aGlzLm9uU2V0dXAgPSBvcHRpb25zLm9uU2V0dXA7XG4gIHRoaXMub25EcmF3ID0gb3B0aW9ucy5vbkRyYXc7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5zZXR1cEdsb2JhbE1vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZvciBuby1za2V0Y2ggR2xvYmFsIG1vZGVcbiAgICAgKi9cbiAgICB2YXIgcDUgPSB3aW5kb3cucDU7XG5cbiAgICB0aGlzLl9pc0dsb2JhbCA9IHRydWU7XG4gICAgLy8gTG9vcCB0aHJvdWdoIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZSBhbmQgYXR0YWNoIHRoZW0gdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAgaW4gcDUucHJvdG90eXBlKSB7XG4gICAgICBpZih0eXBlb2YgcDUucHJvdG90eXBlW3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBldiA9IHAuc3Vic3RyaW5nKDIpO1xuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShldikpIHtcbiAgICAgICAgICB3aW5kb3dbcF0gPSBwNS5wcm90b3R5cGVbcF0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93W3BdID0gcDUucHJvdG90eXBlW3BdO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBdHRhY2ggaXRzIHByb3BlcnRpZXMgdG8gdGhlIHdpbmRvd1xuICAgIGZvciAodmFyIHAyIGluIHRoaXMpIHtcbiAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KHAyKSkge1xuICAgICAgICB3aW5kb3dbcDJdID0gdGhpc1twMl07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHA1LmxvYWRJbWFnZSBzbyB3ZSBjYW4gbW9kaWZ5IHRoZSBVUkwgcGF0aCBwYXJhbVxuICBpZiAoIUdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UpIHtcbiAgICBHYW1lTGFiUDUuYmFzZVA1bG9hZEltYWdlID0gd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2U7XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5sb2FkSW1hZ2UgPSBmdW5jdGlvbiAocGF0aCwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIHBhdGggPSBhc3NldFByZWZpeC5maXhQYXRoKHBhdGgpO1xuICAgICAgcmV0dXJuIEdhbWVMYWJQNS5iYXNlUDVsb2FkSW1hZ2UuY2FsbCh0aGlzLCBwYXRoLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHA1LnJlZHJhdyB0byBtYWtlIGl0IHR3by1waGFzZSBhZnRlciB1c2VyRHJhdygpXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUucmVkcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBmcm9tIHJlZHJhdygpXG4gICAgICovXG4gICAgdmFyIHVzZXJTZXR1cCA9IHRoaXMuc2V0dXAgfHwgd2luZG93LnNldHVwO1xuICAgIHZhciB1c2VyRHJhdyA9IHRoaXMuZHJhdyB8fCB3aW5kb3cuZHJhdztcbiAgICBpZiAodHlwZW9mIHVzZXJEcmF3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnB1c2goKTtcbiAgICAgIGlmICh0eXBlb2YgdXNlclNldHVwID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLnNjYWxlKHRoaXMucGl4ZWxEZW5zaXR5LCB0aGlzLnBpeGVsRGVuc2l0eSk7XG4gICAgICB9XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9yZWdpc3RlcmVkTWV0aG9kcy5wcmUuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgICBmLmNhbGwoc2VsZik7XG4gICAgICB9KTtcbiAgICAgIHVzZXJEcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIENyZWF0ZSAybmQgcGhhc2UgZnVuY3Rpb24gYWZ0ZXJVc2VyRHJhdygpXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuYWZ0ZXJVc2VyRHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IGZyb20gcmVkcmF3KClcbiAgICAgKi9cbiAgICB0aGlzLl9yZWdpc3RlcmVkTWV0aG9kcy5wb3N0LmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgIGYuY2FsbChzZWxmKTtcbiAgICB9KTtcbiAgICB0aGlzLnBvcCgpO1xuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHA1LmNyZWF0ZVNwcml0ZSBzbyB3ZSBjYW4gcmVwbGFjZSB0aGUgQUFCQm9wcygpIGZ1bmN0aW9uXG4gIHdpbmRvdy5wNS5wcm90b3R5cGUuY3JlYXRlU3ByaXRlID0gZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIC8qXG4gICAgICogQ29waWVkIGNvZGUgZnJvbSBwNXBsYXkgZnJvbSBjcmVhdGVTcHJpdGUoKVxuICAgICAqL1xuICAgIHZhciBzID0gbmV3IHdpbmRvdy5TcHJpdGUoeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcy5BQUJCb3BzID0gZ2FtZUxhYlNwcml0ZS5BQUJCb3BzO1xuICAgIHMuZGVwdGggPSB3aW5kb3cuYWxsU3ByaXRlcy5tYXhEZXB0aCgpKzE7XG4gICAgd2luZG93LmFsbFNwcml0ZXMuYWRkKHMpO1xuICAgIHJldHVybiBzO1xuICB9O1xuXG4gIC8vIE92ZXJyaWRlIHdpbmRvdy5Hcm91cCBzbyB3ZSBjYW4gb3ZlcnJpZGUgdGhlIG1ldGhvZHMgdGhhdCB0YWtlIGNhbGxiYWNrXG4gIC8vIHBhcmFtZXRlcnNcbiAgdmFyIGJhc2VHcm91cENvbnN0cnVjdG9yID0gd2luZG93Lkdyb3VwO1xuICB3aW5kb3cuR3JvdXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFycmF5ID0gYmFzZUdyb3VwQ29uc3RydWN0b3IoKTtcblxuICAgIC8qXG4gICAgICogQ3JlYXRlIG5ldyBoZWxwZXIgY2FsbGVkIGNhbGxBQUJCb3BzRm9yQWxsKCkgd2hpY2ggY2FuIGJlIGNhbGxlZCBhcyBhXG4gICAgICogc3RhdGVmdWwgbmF0aXZlRnVuYyBieSB0aGUgaW50ZXJwcmV0ZXIuIFRoaXMgZW5hYmxlcyB0aGUgbmF0aXZlIG1ldGhvZCB0b1xuICAgICAqIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBzbyB0aGF0IGl0IGNhbiBnbyBhc3luY2hyb25vdXMgZXZlcnkgdGltZSBpdFxuICAgICAqIChvciBhbnkgbmF0aXZlIGZ1bmN0aW9uIHRoYXQgaXQgY2FsbHMsIHN1Y2ggYXMgQUFCQm9wcykgd2FudHMgdG8gZXhlY3V0ZVxuICAgICAqIGEgY2FsbGJhY2sgYmFjayBpbnRvIGludGVycHJldGVyIGNvZGUuIFRoZSBpbnRlcnByZXRlciBzdGF0ZSBvYmplY3QgaXNcbiAgICAgKiByZXRyaWV2ZWQgYnkgY2FsbGluZyBKU0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpLlxuICAgICAqXG4gICAgICogQWRkaXRpb25hbCBwcm9wZXJ0aWVzIGNhbiBiZSBzZXQgb24gdGhlIHN0YXRlIG9iamVjdCB0byB0cmFjayBzdGF0ZVxuICAgICAqIGFjcm9zcyB0aGUgbXVsdGlwbGUgZXhlY3V0aW9ucy4gSWYgdGhlIGZ1bmN0aW9uIHdhbnRzIHRvIGJlIGNhbGxlZCBhZ2FpbixcbiAgICAgKiBpdCBzaG91bGQgc2V0IHN0YXRlLmRvbmVFeGVjIHRvIGZhbHNlLiBXaGVuIHRoZSBmdW5jdGlvbiBpcyBjb21wbGV0ZSBhbmRcbiAgICAgKiBubyBsb25nZXIgd2FudHMgdG8gYmUgY2FsbGVkIGluIGEgbG9vcCBieSB0aGUgaW50ZXJwcmV0ZXIsIGl0IHNob3VsZCBzZXRcbiAgICAgKiBzdGF0ZS5kb25lRXhlYyB0byB0cnVlIGFuZCByZXR1cm4gYSB2YWx1ZS5cbiAgICAgKi9cbiAgICBhcnJheS5jYWxsQUFCQm9wc0ZvckFsbCA9IGZ1bmN0aW9uKHR5cGUsIHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBzdGF0ZSA9IG9wdGlvbnMuZ2FtZUxhYi5KU0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpO1xuICAgICAgaWYgKCFzdGF0ZS5fX2kpIHtcbiAgICAgICAgc3RhdGUuX19pID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5fX2kgPCB0aGlzLnNpemUoKSkge1xuICAgICAgICBpZiAoIXN0YXRlLl9fc3ViU3RhdGUpIHtcbiAgICAgICAgICAvLyBCZWZvcmUgd2UgY2FsbCBBQUJCb3BzIChhbm90aGVyIHN0YXRlZnVsIGZ1bmN0aW9uKSwgaGFuZyBhIF9fc3ViU3RhdGVcbiAgICAgICAgICAvLyBvZmYgb2Ygc3RhdGUsIHNvIGl0IGNhbiB1c2UgdGhhdCBpbnN0ZWFkIHRvIHRyYWNrIGl0cyBzdGF0ZTpcbiAgICAgICAgICBzdGF0ZS5fX3N1YlN0YXRlID0geyBkb25lRXhlYzogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0KHN0YXRlLl9faSkuQUFCQm9wcyh0eXBlLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKHN0YXRlLl9fc3ViU3RhdGUuZG9uZUV4ZWMpIHtcbiAgICAgICAgICAvLyBOb3RlOiBpZ25vcmluZyByZXR1cm4gdmFsdWUgZnJvbSBlYWNoIEFBQkJvcHMoKSBjYWxsXG4gICAgICAgICAgZGVsZXRlIHN0YXRlLl9fc3ViU3RhdGU7XG4gICAgICAgICAgc3RhdGUuX19pKys7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZG9uZUV4ZWMgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLmRvbmVFeGVjID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUmVwbGFjZSB0aGVzZSBmb3VyIG1ldGhvZHMgdGhhdCB0YWtlIGNhbGxiYWNrIHBhcmFtZXRlcnMgdG8gdXNlIHRoZSBuZXdcbiAgICAvLyBjYWxsQUFCQm9wc0ZvckFsbCgpIGhlbHBlcjpcblxuICAgIGFycmF5Lm92ZXJsYXAgPSBmdW5jdGlvbih0YXJnZXQsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmNhbGxBQUJCb3BzRm9yQWxsKFwib3ZlcmxhcFwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXJyYXkuY29sbGlkZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJjb2xsaWRlXCIsIHRhcmdldCwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhcnJheS5kaXNwbGFjZSA9IGZ1bmN0aW9uKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuY2FsbEFBQkJvcHNGb3JBbGwoXCJkaXNwbGFjZVwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXJyYXkuYm91bmNlID0gZnVuY3Rpb24odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsQUFCQm9wc0ZvckFsbChcImJvdW5jZVwiLCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuXG59O1xuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWJQNSB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gQ2FsbGVkIGJlZm9yZSBlYWNoIHRpbWUgaXQgaXMgdXNlZC5cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5yZXNldEV4ZWN1dGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICBpZiAodGhpcy5wNSkge1xuICAgIHRoaXMucDUucmVtb3ZlKCk7XG4gICAgdGhpcy5wNSA9IG51bGw7XG4gICAgdGhpcy5wNWRlY3JlbWVudFByZWxvYWQgPSBudWxsO1xuXG4gICAgLypcbiAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHZhcmlvdXMgcDUvcDVwbGF5IGluaXQgY29kZVxuICAgICAqL1xuXG4gICAgLy8gQ2xlYXIgcmVnaXN0ZXJlZCBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGU6XG4gICAgZm9yICh2YXIgbWVtYmVyIGluIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRNZXRob2RzKSB7XG4gICAgICBkZWxldGUgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHNbbWVtYmVyXTtcbiAgICB9XG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5fcmVnaXN0ZXJlZE1ldGhvZHMgPSB7IHByZTogW10sIHBvc3Q6IFtdLCByZW1vdmU6IFtdIH07XG4gICAgZGVsZXRlIHdpbmRvdy5wNS5wcm90b3R5cGUuX3JlZ2lzdGVyZWRQcmVsb2FkTWV0aG9kcy5nYW1lbGFiUHJlbG9hZDtcblxuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuYWxsU3ByaXRlcyA9IG5ldyB3aW5kb3cuR3JvdXAoKTtcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnNwcml0ZVVwZGF0ZSA9IHRydWU7XG5cbiAgICB3aW5kb3cucDUucHJvdG90eXBlLmNhbWVyYSA9IG5ldyB3aW5kb3cuQ2FtZXJhKDAsIDAsIDEpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUuY2FtZXJhLmluaXQgPSBmYWxzZTtcblxuICAgIC8va2V5Ym9hcmQgaW5wdXRcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnJlYWRQcmVzc2VzKTtcblxuICAgIC8vYXV0b21hdGljIHNwcml0ZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwcmUnLCB3aW5kb3cucDUucHJvdG90eXBlLnVwZGF0ZVNwcml0ZXMpO1xuXG4gICAgLy9xdWFkdHJlZSB1cGRhdGVcbiAgICB3aW5kb3cucDUucHJvdG90eXBlLnJlZ2lzdGVyTWV0aG9kKCdwb3N0Jywgd2luZG93LnVwZGF0ZVRyZWUpO1xuXG4gICAgLy9jYW1lcmEgcHVzaCBhbmQgcG9wXG4gICAgd2luZG93LnA1LnByb3RvdHlwZS5yZWdpc3Rlck1ldGhvZCgncHJlJywgd2luZG93LmNhbWVyYVB1c2gpO1xuICAgIHdpbmRvdy5wNS5wcm90b3R5cGUucmVnaXN0ZXJNZXRob2QoJ3Bvc3QnLCB3aW5kb3cuY2FtZXJhUG9wKTtcblxuICB9XG5cbiAgLy8gSW1wb3J0YW50IHRvIHJlc2V0IHRoZXNlIGFmdGVyIHRoaXMucDUgaGFzIGJlZW4gcmVtb3ZlZCBhYm92ZVxuICB0aGlzLmRyYXdJblByb2dyZXNzID0gZmFsc2U7XG4gIHRoaXMuc2V0dXBJblByb2dyZXNzID0gZmFsc2U7XG5cbiAgd2luZG93LnA1LnByb3RvdHlwZS5nYW1lbGFiUHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCA9IHdpbmRvdy5wNS5fZ2V0RGVjcmVtZW50UHJlbG9hZChhcmd1bWVudHMsIHRoaXMucDUpO1xuICB9LmJpbmQodGhpcyk7XG59O1xuXG4vKipcbiAqIEluc3RhbnRpYXRlIGEgbmV3IHA1IGFuZCBzdGFydCBleGVjdXRpb25cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5zdGFydEV4ZWN1dGlvbiA9IGZ1bmN0aW9uICgpIHtcblxuICAvKiBqc2hpbnQgbm9uZXc6ZmFsc2UgKi9cbiAgbmV3IHdpbmRvdy5wNShmdW5jdGlvbiAocDVvYmopIHtcbiAgICAgIHRoaXMucDUgPSBwNW9iajtcblxuICAgICAgcDVvYmoucmVnaXN0ZXJQcmVsb2FkTWV0aG9kKCdnYW1lbGFiUHJlbG9hZCcsIHdpbmRvdy5wNS5wcm90b3R5cGUpO1xuXG4gICAgICAvLyBPdmVybG9hZCBfZHJhdyBmdW5jdGlvbiB0byBtYWtlIGl0IHR3by1waGFzZVxuICAgICAgcDVvYmouX2RyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIENvcGllZCBjb2RlIGZyb20gcDUgX2RyYXcoKVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGhpc0ZyYW1lVGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdmFyIHRpbWVfc2luY2VfbGFzdCA9IHRoaXMuX3RoaXNGcmFtZVRpbWUgLSB0aGlzLl9sYXN0RnJhbWVUaW1lO1xuICAgICAgICB2YXIgdGFyZ2V0X3RpbWVfYmV0d2Vlbl9mcmFtZXMgPSAxMDAwIC8gdGhpcy5fdGFyZ2V0RnJhbWVSYXRlO1xuXG4gICAgICAgIC8vIG9ubHkgZHJhdyBpZiB3ZSByZWFsbHkgbmVlZCB0bzsgZG9uJ3Qgb3ZlcmV4dGVuZCB0aGUgYnJvd3Nlci5cbiAgICAgICAgLy8gZHJhdyBpZiB3ZSdyZSB3aXRoaW4gNW1zIG9mIHdoZW4gb3VyIG5leHQgZnJhbWUgc2hvdWxkIHBhaW50XG4gICAgICAgIC8vICh0aGlzIHdpbGwgcHJldmVudCB1cyBmcm9tIGdpdmluZyB1cCBvcHBvcnR1bml0aWVzIHRvIGRyYXdcbiAgICAgICAgLy8gYWdhaW4gd2hlbiBpdCdzIHJlYWxseSBhYm91dCB0aW1lIGZvciB1cyB0byBkbyBzbykuIGZpeGVzIGFuXG4gICAgICAgIC8vIGlzc3VlIHdoZXJlIHRoZSBmcmFtZVJhdGUgaXMgdG9vIGxvdyBpZiBvdXIgcmVmcmVzaCBsb29wIGlzbid0XG4gICAgICAgIC8vIGluIHN5bmMgd2l0aCB0aGUgYnJvd3Nlci4gbm90ZSB0aGF0IHdlIGhhdmUgdG8gZHJhdyBvbmNlIGV2ZW5cbiAgICAgICAgLy8gaWYgbG9vcGluZyBpcyBvZmYsIHNvIHdlIGJ5cGFzcyB0aGUgdGltZSBkZWxheSBpZiB0aGF0XG4gICAgICAgIC8vIGlzIHRoZSBjYXNlLlxuICAgICAgICB2YXIgZXBzaWxvbiA9IDU7XG4gICAgICAgIGlmICghdGhpcy5sb29wIHx8XG4gICAgICAgICAgICB0aW1lX3NpbmNlX2xhc3QgPj0gdGFyZ2V0X3RpbWVfYmV0d2Vlbl9mcmFtZXMgLSBlcHNpbG9uKSB7XG4gICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkoJ2ZyYW1lQ291bnQnLCB0aGlzLmZyYW1lQ291bnQgKyAxKTtcbiAgICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2RyYXdFcGlsb2d1ZSgpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICBwNW9iai5hZnRlclJlZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfZHJhdygpXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl91cGRhdGVQQWNjZWxlcmF0aW9ucygpO1xuICAgICAgICB0aGlzLl91cGRhdGVQUm90YXRpb25zKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBNb3VzZUNvb3JkcygpO1xuICAgICAgICB0aGlzLl91cGRhdGVQVG91Y2hDb29yZHMoKTtcbiAgICAgICAgdGhpcy5fZnJhbWVSYXRlID0gMTAwMC4wLyh0aGlzLl90aGlzRnJhbWVUaW1lIC0gdGhpcy5fbGFzdEZyYW1lVGltZSk7XG4gICAgICAgIHRoaXMuX2xhc3RGcmFtZVRpbWUgPSB0aGlzLl90aGlzRnJhbWVUaW1lO1xuXG4gICAgICAgIHRoaXMuX2RyYXdFcGlsb2d1ZSgpO1xuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgcDVvYmouX2RyYXdFcGlsb2d1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfZHJhdygpXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vbWFuZGF0b3J5IHVwZGF0ZSB2YWx1ZXMobWF0cml4cyBhbmQgc3RhY2spIGZvciAzZFxuICAgICAgICBpZih0aGlzLl9yZW5kZXJlci5pc1AzRCl7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIuX3VwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2V0IG5vdGlmaWVkIHRoZSBuZXh0IHRpbWUgdGhlIGJyb3dzZXIgZ2l2ZXMgdXNcbiAgICAgICAgLy8gYW4gb3Bwb3J0dW5pdHkgdG8gZHJhdy5cbiAgICAgICAgaWYgKHRoaXMuX2xvb3ApIHtcbiAgICAgICAgICB0aGlzLl9yZXF1ZXN0QW5pbUlkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9kcmF3KTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHA1b2JqKTtcblxuICAgICAgLy8gT3ZlcmxvYWQgX3NldHVwIGZ1bmN0aW9uIHRvIG1ha2UgaXQgdHdvLXBoYXNlXG4gICAgICBwNW9iai5fc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLypcbiAgICAgICAgICogQ29waWVkIGNvZGUgZnJvbSBwNSBfc2V0dXAoKVxuICAgICAgICAgKi9cblxuICAgICAgICAvLyByZXR1cm4gcHJlbG9hZCBmdW5jdGlvbnMgdG8gdGhlaXIgbm9ybWFsIHZhbHMgaWYgc3dpdGNoZWQgYnkgcHJlbG9hZFxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX2lzR2xvYmFsID8gd2luZG93IDogdGhpcztcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0LnByZWxvYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBmb3IgKHZhciBmIGluIHRoaXMuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICAgICAgICBjb250ZXh0W2ZdID0gdGhpcy5fcHJlbG9hZE1ldGhvZHNbZl1bZl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2hvcnQtY2lyY3VpdCBvbiB0aGlzLCBpbiBjYXNlIHNvbWVvbmUgdXNlZCB0aGUgbGlicmFyeSBpbiBcImdsb2JhbFwiXG4gICAgICAgIC8vIG1vZGUgZWFybGllclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQuc2V0dXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb250ZXh0LnNldHVwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2V0dXBFcGlsb2d1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgIH0uYmluZChwNW9iaik7XG5cbiAgICAgIHA1b2JqLl9zZXR1cEVwaWxvZ3VlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKlxuICAgICAgICAgKiBDb3BpZWQgY29kZSBmcm9tIHA1IF9zZXR1cCgpXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8vIC8vIHVuaGlkZSBoaWRkZW4gY2FudmFzIHRoYXQgd2FzIGNyZWF0ZWRcbiAgICAgICAgLy8gdGhpcy5jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICAgICAgICAvLyB0aGlzLmNhbnZhcy5jbGFzc05hbWUgPSB0aGlzLmNhbnZhcy5jbGFzc05hbWUucmVwbGFjZSgncDVfaGlkZGVuJywgJycpO1xuXG4gICAgICAgIC8vIHVuaGlkZSBhbnkgaGlkZGVuIGNhbnZhc2VzIHRoYXQgd2VyZSBjcmVhdGVkXG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKC8oXnxcXHMpcDVfaGlkZGVuKD8hXFxTKS9nKTtcbiAgICAgICAgdmFyIGNhbnZhc2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncDVfaGlkZGVuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FudmFzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgayA9IGNhbnZhc2VzW2ldO1xuICAgICAgICAgIGsuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICAgICAgICAgIGsuY2xhc3NOYW1lID0gay5jbGFzc05hbWUucmVwbGFjZShyZWcsICcnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXR1cERvbmUgPSB0cnVlO1xuXG4gICAgICB9LmJpbmQocDVvYmopO1xuXG4gICAgICAvLyBEbyB0aGlzIGFmdGVyIHdlJ3JlIGRvbmUgbW9ua2V5aW5nIHdpdGggdGhlIHA1b2JqIGluc3RhbmNlIG1ldGhvZHM6XG4gICAgICBwNW9iai5zZXR1cEdsb2JhbE1vZGUoKTtcblxuICAgICAgd2luZG93LnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENhbGwgb3VyIGdhbWVsYWJQcmVsb2FkKCkgdG8gZm9yY2UgX3N0YXJ0L19zZXR1cCB0byB3YWl0LlxuICAgICAgICB3aW5kb3cuZ2FtZWxhYlByZWxvYWQoKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBwNSBcInByZWxvYWQgbWV0aG9kc1wiIHdlcmUgbW9kaWZpZWQgYmVmb3JlIHRoaXMgcHJlbG9hZCBmdW5jdGlvbiB3YXNcbiAgICAgICAgICogY2FsbGVkIGFuZCBzdWJzdGl0dXRlZCB3aXRoIHdyYXBwZWQgdmVyc2lvbiB0aGF0IGluY3JlbWVudCBhIHByZWxvYWRcbiAgICAgICAgICogY291bnQgYW5kIHdpbGwgbGF0ZXIgZGVjcmVtZW50IGEgcHJlbG9hZCBjb3VudCB1cG9uIGFzeW5jIGxvYWRcbiAgICAgICAgICogY29tcGxldGlvbi4gU2luY2UgcDUgaXMgcnVubmluZyBpbiBnbG9iYWwgbW9kZSwgaXQgb25seSB3cmFwcGVkIHRoZVxuICAgICAgICAgKiBtZXRob2RzIG9uIHRoZSB3aW5kb3cgb2JqZWN0LiBXZSBuZWVkIHRvIHBsYWNlIHRoZSB3cmFwcGVkIG1ldGhvZHMgb25cbiAgICAgICAgICogdGhlIHA1IG9iamVjdCBhcyB3ZWxsIGJlZm9yZSB3ZSBtYXJzaGFsIHRvIHRoZSBpbnRlcnByZXRlclxuICAgICAgICAgKi9cbiAgICAgICAgZm9yICh2YXIgbWV0aG9kIGluIHRoaXMucDUuX3ByZWxvYWRNZXRob2RzKSB7XG4gICAgICAgICAgdGhpcy5wNVttZXRob2RdID0gd2luZG93W21ldGhvZF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9uUHJlbG9hZCgpO1xuXG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB3aW5kb3cuc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAqIHA1IFwicHJlbG9hZCBtZXRob2RzXCIgaGF2ZSBub3cgYmVlbiByZXN0b3JlZCBhbmQgdGhlIHdyYXBwZWQgdmVyc2lvblxuICAgICAgICAgKiBhcmUgbm8gbG9uZ2VyIGluIHVzZS4gU2luY2UgcDUgaXMgcnVubmluZyBpbiBnbG9iYWwgbW9kZSwgaXQgb25seVxuICAgICAgICAgKiByZXN0b3JlZCB0aGUgbWV0aG9kcyBvbiB0aGUgd2luZG93IG9iamVjdC4gV2UgbmVlZCB0byByZXN0b3JlIHRoZVxuICAgICAgICAgKiBtZXRob2RzIG9uIHRoZSBwNSBvYmplY3QgdG8gbWF0Y2hcbiAgICAgICAgICovXG4gICAgICAgIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLnA1Ll9wcmVsb2FkTWV0aG9kcykge1xuICAgICAgICAgIHRoaXMucDVbbWV0aG9kXSA9IHdpbmRvd1ttZXRob2RdO1xuICAgICAgICB9XG5cbiAgICAgICAgcDVvYmouY3JlYXRlQ2FudmFzKDQwMCwgNDAwKTtcblxuICAgICAgICB0aGlzLm9uU2V0dXAoKTtcblxuICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICB3aW5kb3cuZHJhdyA9IHRoaXMub25EcmF3LmJpbmQodGhpcyk7XG5cbiAgICAgIHRoaXMub25FeGVjdXRpb25TdGFydGluZygpO1xuXG4gICAgfS5iaW5kKHRoaXMpLFxuICAgICdkaXZHYW1lTGFiJyk7XG4gIC8qIGpzaGludCBub25ldzp0cnVlICovXG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIGFsbCBnbG9iYWwgY29kZSBpcyBkb25lIGV4ZWN1dGluZy4gVGhpcyBhbGxvd3MgdXMgdG8gcmVsZWFzZVxuICogb3VyIFwicHJlbG9hZFwiIGNvdW50IHJlZmVyZW5jZSBpbiBwNSwgd2hpY2ggbWVhbnMgdGhhdCBzZXR1cCgpIGNhbiBiZWdpbi5cbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5ub3RpZnlVc2VyR2xvYmFsQ29kZUNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5wNWRlY3JlbWVudFByZWxvYWQpIHtcbiAgICB0aGlzLnA1ZGVjcmVtZW50UHJlbG9hZCgpO1xuICAgIHRoaXMucDVkZWNyZW1lbnRQcmVsb2FkID0gbnVsbDtcbiAgfVxufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRDdXN0b21NYXJzaGFsR2xvYmFsUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogdGhpcy5wNSxcbiAgICBoZWlnaHQ6IHRoaXMucDUsXG4gICAgZGlzcGxheVdpZHRoOiB0aGlzLnA1LFxuICAgIGRpc3BsYXlIZWlnaHQ6IHRoaXMucDUsXG4gICAgd2luZG93V2lkdGg6IHRoaXMucDUsXG4gICAgd2luZG93SGVpZ2h0OiB0aGlzLnA1LFxuICAgIGZvY3VzZWQ6IHRoaXMucDUsXG4gICAgZnJhbWVDb3VudDogdGhpcy5wNSxcbiAgICBrZXlJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAga2V5OiB0aGlzLnA1LFxuICAgIGtleUNvZGU6IHRoaXMucDUsXG4gICAgbW91c2VYOiB0aGlzLnA1LFxuICAgIG1vdXNlWTogdGhpcy5wNSxcbiAgICBwbW91c2VYOiB0aGlzLnA1LFxuICAgIHBtb3VzZVk6IHRoaXMucDUsXG4gICAgd2luTW91c2VYOiB0aGlzLnA1LFxuICAgIHdpbk1vdXNlWTogdGhpcy5wNSxcbiAgICBwd2luTW91c2VYOiB0aGlzLnA1LFxuICAgIHB3aW5Nb3VzZVk6IHRoaXMucDUsXG4gICAgbW91c2VCdXR0b246IHRoaXMucDUsXG4gICAgbW91c2VJc1ByZXNzZWQ6IHRoaXMucDUsXG4gICAgdG91Y2hYOiB0aGlzLnA1LFxuICAgIHRvdWNoWTogdGhpcy5wNSxcbiAgICBwdG91Y2hYOiB0aGlzLnA1LFxuICAgIHB0b3VjaFk6IHRoaXMucDUsXG4gICAgdG91Y2hlczogdGhpcy5wNSxcbiAgICB0b3VjaElzRG93bjogdGhpcy5wNSxcbiAgICBwaXhlbHM6IHRoaXMucDUsXG4gICAgZGV2aWNlT3JpZW50YXRpb246IHRoaXMucDUsXG4gICAgYWNjZWxlcmF0aW9uWDogdGhpcy5wNSxcbiAgICBhY2NlbGVyYXRpb25ZOiB0aGlzLnA1LFxuICAgIGFjY2VsZXJhdGlvblo6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblg6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblk6IHRoaXMucDUsXG4gICAgcEFjY2VsZXJhdGlvblo6IHRoaXMucDUsXG4gICAgcm90YXRpb25YOiB0aGlzLnA1LFxuICAgIHJvdGF0aW9uWTogdGhpcy5wNSxcbiAgICByb3RhdGlvblo6IHRoaXMucDUsXG4gICAgcFJvdGF0aW9uWDogdGhpcy5wNSxcbiAgICBwUm90YXRpb25ZOiB0aGlzLnA1LFxuICAgIHBSb3RhdGlvblo6IHRoaXMucDVcbiAgfTtcbn07XG5cbkdhbWVMYWJQNS5wcm90b3R5cGUuZ2V0Q3VzdG9tTWFyc2hhbE9iamVjdExpc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgaW5zdGFuY2U6IHdpbmRvdy5TcHJpdGUsXG4gICAgICBtZXRob2RPcHRzOiB7XG4gICAgICAgIG5hdGl2ZUNhbGxzQmFja0ludGVycHJldGVyOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBUaGUgcDVwbGF5IEdyb3VwIG9iamVjdCBzaG91bGQgYmUgY3VzdG9tIG1hcnNoYWxsZWQsIGJ1dCBpdHMgY29uc3RydWN0b3JcbiAgICAvLyBhY3R1YWxseSBjcmVhdGVzIGEgc3RhbmRhcmQgQXJyYXkgaW5zdGFuY2Ugd2l0aCBhIGZldyBhZGRpdGlvbmFsIG1ldGhvZHNcbiAgICAvLyBhZGRlZC4gV2Ugc29sdmUgdGhpcyBieSBwdXR0aW5nIFwiQXJyYXlcIiBpbiB0aGlzIGxpc3QsIGJ1dCB3aXRoIFwiZHJhd1wiIGFzXG4gICAgLy8gYSByZXF1aXJlZE1ldGhvZDpcbiAgICB7XG4gICAgICBpbnN0YW5jZTogQXJyYXksXG4gICAgICByZXF1aXJlZE1ldGhvZDogJ2RyYXcnLFxuICAgICAgbWV0aG9kT3B0czoge1xuICAgICAgICBuYXRpdmVDYWxsc0JhY2tJbnRlcnByZXRlcjogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1IH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LkNhbWVyYSB9LFxuICAgIHsgaW5zdGFuY2U6IHdpbmRvdy5BbmltYXRpb24gfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVmVjdG9yIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkNvbG9yIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkltYWdlIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LlJlbmRlcmVyIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkdyYXBoaWNzIH0sXG4gICAgeyBpbnN0YW5jZTogd2luZG93LnA1LkZvbnQgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVGFibGUgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuVGFibGVSb3cgfSxcbiAgICB7IGluc3RhbmNlOiB3aW5kb3cucDUuRWxlbWVudCB9LFxuICBdO1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRHbG9iYWxQcm9wZXJ0eUxpc3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHByb3BMaXN0ID0ge307XG5cbiAgLy8gSW5jbHVkZSBldmVyeSBwcm9wZXJ0eSBvbiB0aGUgcDUgaW5zdGFuY2UgaW4gdGhlIGdsb2JhbCBwcm9wZXJ0eSBsaXN0OlxuICBmb3IgKHZhciBwcm9wIGluIHRoaXMucDUpIHtcbiAgICBwcm9wTGlzdFtwcm9wXSA9IFsgdGhpcy5wNVtwcm9wXSwgdGhpcy5wNSBdO1xuICB9XG4gIC8vIEFuZCB0aGUgR3JvdXAgY29uc3RydWN0b3IgZnJvbSBwNXBsYXk6XG4gIHByb3BMaXN0Lkdyb3VwID0gWyB3aW5kb3cuR3JvdXAsIHdpbmRvdyBdO1xuICAvLyBBbmQgYWxzbyBjcmVhdGUgYSAncDUnIG9iamVjdCBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZTpcbiAgcHJvcExpc3QucDUgPSBbIHsgVmVjdG9yOiB3aW5kb3cucDUuVmVjdG9yIH0sIHdpbmRvdyBdO1xuXG4gIHJldHVybiBwcm9wTGlzdDtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGZyYW1lIHJhdGVcbiAqL1xuR2FtZUxhYlA1LnByb3RvdHlwZS5nZXRGcmFtZVJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnA1ID8gdGhpcy5wNS5mcmFtZVJhdGUoKSA6IDA7XG59O1xuXG5HYW1lTGFiUDUucHJvdG90eXBlLmFmdGVyRHJhd0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnA1LmFmdGVyVXNlckRyYXcoKTtcbiAgdGhpcy5wNS5hZnRlclJlZHJhdygpO1xufTtcblxuR2FtZUxhYlA1LnByb3RvdHlwZS5hZnRlclNldHVwQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucDUuX3NldHVwRXBpbG9ndWUoKTtcbn07XG4iLCIvLyBqc2hpbnQgaWdub3JlOiBzdGFydFxuLypcbiAqIE92ZXJyaWRlIFNwcml0ZS5BQUJCb3BzIHNvIGl0IGNhbiBiZSBjYWxsZWQgYXMgYSBzdGF0ZWZ1bCBuYXRpdmVGdW5jIGJ5IHRoZVxuICogaW50ZXJwcmV0ZXIuIFRoaXMgZW5hYmxlcyB0aGUgbmF0aXZlIG1ldGhvZCB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgc29cbiAqIHRoYXQgaXQgY2FuIGdvIGFzeW5jaHJvbm91cyBldmVyeSB0aW1lIGl0IHdhbnRzIHRvIGV4ZWN1dGUgYSBjYWxsYmFjayBiYWNrXG4gKiBpbnRvIGludGVycHJldGVyIGNvZGUuIFRoZSBpbnRlcnByZXRlciBzdGF0ZSBvYmplY3QgaXMgcmV0cmlldmVkIGJ5IGNhbGxpbmdcbiAqIGpzSW50ZXJwcmV0ZXIuZ2V0Q3VycmVudFN0YXRlKCkuXG4gKlxuICogQWRkaXRpb25hbCBwcm9wZXJ0aWVzIGNhbiBiZSBzZXQgb24gdGhlIHN0YXRlIG9iamVjdCB0byB0cmFjayBzdGF0ZSBhY3Jvc3NcbiAqIHRoZSBtdWx0aXBsZSBleGVjdXRpb25zLiBJZiB0aGUgZnVuY3Rpb24gd2FudHMgdG8gYmUgY2FsbGVkIGFnYWluLCBpdCBzaG91bGRcbiAqIHNldCBzdGF0ZS5kb25lRXhlYyB0byBmYWxzZS4gV2hlbiB0aGUgZnVuY3Rpb24gaXMgY29tcGxldGUgYW5kIG5vIGxvbmdlclxuICogd2FudHMgdG8gYmUgY2FsbGVkIGluIGEgbG9vcCBieSB0aGUgaW50ZXJwcmV0ZXIsIGl0IHNob3VsZCBzZXQgc3RhdGUuZG9uZUV4ZWNcbiAqIHRvIHRydWUgYW5kIHJldHVybiBhIHZhbHVlLlxuICovXG5cbnZhciBqc0ludGVycHJldGVyO1xuXG5tb2R1bGUuZXhwb3J0cy5pbmplY3RKU0ludGVycHJldGVyID0gZnVuY3Rpb24gKGpzaSkge1xuICBqc0ludGVycHJldGVyID0ganNpO1xufTtcblxuLypcbiAqIENvcGllZCBjb2RlIGZyb20gcDVwbGF5IGZyb20gU3ByaXRlKCkgd2l0aCB0YXJnZXRlZCBtb2RpZmljYXRpb25zIHRoYXRcbiAqIHVzZSB0aGUgYWRkaXRpb25hbCBzdGF0ZSBwYXJhbWV0ZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMuQUFCQm9wcyA9IGZ1bmN0aW9uKHR5cGUsIHRhcmdldCwgY2FsbGJhY2spIHtcblxuICB2YXIgc3RhdGUgPSBqc0ludGVycHJldGVyLmdldEN1cnJlbnRTdGF0ZSgpO1xuICBpZiAoc3RhdGUuX19zdWJTdGF0ZSkge1xuICAgIC8vIElmIHdlJ3JlIGJlaW5nIGNhbGxlZCBieSBhbm90aGVyIHN0YXRlZnVsIGZ1bmN0aW9uIHRoYXQgaHVuZyBhIF9fc3ViU3RhdGVcbiAgICAvLyBvZmYgb2Ygc3RhdGUsIHVzZSB0aGF0IGluc3RlYWQ6XG4gICAgc3RhdGUgPSBzdGF0ZS5fX3N1YlN0YXRlO1xuICB9XG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiBzdGF0ZS5fX2kgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3RhdGUuX19pID0gMDtcblxuICAgIHRoaXMudG91Y2hpbmcubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hpbmcucmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnRvdWNoaW5nLnRvcCA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hpbmcuYm90dG9tID0gZmFsc2U7XG5cbiAgICAvL2lmIHNpbmdsZSBzcHJpdGUgdHVybiBpbnRvIGFycmF5IGFueXdheVxuICAgIHN0YXRlLl9fb3RoZXJzID0gW107XG5cbiAgICBpZih0YXJnZXQgaW5zdGFuY2VvZiBTcHJpdGUpXG4gICAgICBzdGF0ZS5fX290aGVycy5wdXNoKHRhcmdldCk7XG4gICAgZWxzZSBpZih0YXJnZXQgaW5zdGFuY2VvZiBBcnJheSlcbiAgICB7XG4gICAgICBpZihxdWFkVHJlZSAhPSB1bmRlZmluZWQgJiYgcXVhZFRyZWUuYWN0aXZlKVxuICAgICAgICBzdGF0ZS5fX290aGVycyA9IHF1YWRUcmVlLnJldHJpZXZlRnJvbUdyb3VwKCB0aGlzLCB0YXJnZXQpO1xuXG4gICAgICBpZihzdGF0ZS5fX290aGVycy5sZW5ndGggPT0gMClcbiAgICAgICAgc3RhdGUuX19vdGhlcnMgPSB0YXJnZXQ7XG5cbiAgICB9XG4gICAgZWxzZVxuICAgICAgdGhyb3coXCJFcnJvcjogb3ZlcmxhcCBjYW4gb25seSBiZSBjaGVja2VkIGJldHdlZW4gc3ByaXRlcyBvciBncm91cHNcIik7XG5cbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5fX2krKztcbiAgfVxuICBpZiAoc3RhdGUuX19pIDwgc3RhdGUuX19vdGhlcnMubGVuZ3RoKSB7XG4gICAgdmFyIGkgPSBzdGF0ZS5fX2k7XG5cbiAgICBpZih0aGlzICE9IHN0YXRlLl9fb3RoZXJzW2ldICYmICF0aGlzLnJlbW92ZWQpIC8veW91IGNhbiBjaGVjayBjb2xsaXNpb25zIHdpdGhpbiB0aGUgc2FtZSBncm91cCBidXQgbm90IG9uIGl0c2VsZlxuICAgIHtcbiAgICAgIHZhciBvdGhlciA9IHN0YXRlLl9fb3RoZXJzW2ldO1xuXG4gICAgICBpZih0aGlzLmNvbGxpZGVyID09IHVuZGVmaW5lZClcbiAgICAgICAgdGhpcy5zZXREZWZhdWx0Q29sbGlkZXIoKTtcblxuICAgICAgaWYob3RoZXIuY29sbGlkZXIgPT0gdW5kZWZpbmVkKVxuICAgICAgICBvdGhlci5zZXREZWZhdWx0Q29sbGlkZXIoKTtcblxuICAgICAgLypcbiAgICAgIGlmKHRoaXMuY29sbGlkZXJUeXBlPT1cImRlZmF1bHRcIiAmJiBhbmltYXRpb25zW2N1cnJlbnRBbmltYXRpb25dIT1udWxsKVxuICAgICAge1xuICAgICAgICBwcmludChcImJ1c3RlZFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSovXG4gICAgICBpZih0aGlzLmNvbGxpZGVyICE9IHVuZGVmaW5lZCAmJiBvdGhlci5jb2xsaWRlciAhPSB1bmRlZmluZWQpXG4gICAgICB7XG4gICAgICBpZih0eXBlPT1cIm92ZXJsYXBcIikgIHtcbiAgICAgICAgICB2YXIgb3ZlcjtcblxuICAgICAgICAgIC8vaWYgdGhlIG90aGVyIGlzIGEgY2lyY2xlIEkgY2FsY3VsYXRlIHRoZSBkaXNwbGFjZW1lbnQgZnJvbSBoZXJlXG4gICAgICAgICAgaWYodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICBvdmVyID0gb3RoZXIuY29sbGlkZXIub3ZlcmxhcCh0aGlzLmNvbGxpZGVyKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIG92ZXIgPSB0aGlzLmNvbGxpZGVyLm92ZXJsYXAob3RoZXIuY29sbGlkZXIpO1xuXG4gICAgICAgICAgaWYob3ZlcilcbiAgICAgICAgICB7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKGNhbGxiYWNrICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIG90aGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZT09XCJjb2xsaWRlXCIgfHwgdHlwZSA9PSBcImJvdW5jZVwiKVxuICAgICAgICB7XG4gICAgICAgICAgdmFyIGRpc3BsYWNlbWVudCA9IGNyZWF0ZVZlY3RvcigwLDApO1xuXG4gICAgICAgICAgLy9pZiB0aGUgc3VtIG9mIHRoZSBzcGVlZCBpcyBtb3JlIHRoYW4gdGhlIGNvbGxpZGVyIGkgbWF5XG4gICAgICAgICAgLy9oYXZlIGEgdHVubmVsbGluZyBwcm9ibGVtXG4gICAgICAgICAgdmFyIHR1bm5lbFggPSBhYnModGhpcy52ZWxvY2l0eS54LW90aGVyLnZlbG9jaXR5LngpID49IG90aGVyLmNvbGxpZGVyLmV4dGVudHMueC8yICYmIHJvdW5kKHRoaXMuZGVsdGFYIC0gdGhpcy52ZWxvY2l0eS54KSA9PSAwO1xuXG4gICAgICAgICAgdmFyIHR1bm5lbFkgPSBhYnModGhpcy52ZWxvY2l0eS55LW90aGVyLnZlbG9jaXR5LnkpID49ICBvdGhlci5jb2xsaWRlci5zaXplKCkueS8yICAmJiByb3VuZCh0aGlzLmRlbHRhWSAtIHRoaXMudmVsb2NpdHkueSkgPT0gMDtcblxuXG4gICAgICAgICAgaWYodHVubmVsWCB8fCB0dW5uZWxZKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vaW5zdGVhZCBvZiB1c2luZyB0aGUgY29sbGlkZXJzIEkgdXNlIHRoZSBib3VuZGluZyBib3hcbiAgICAgICAgICAgIC8vYXJvdW5kIHRoZSBwcmV2aW91cyBwb3NpdGlvbiBhbmQgY3VycmVudCBwb3NpdGlvblxuICAgICAgICAgICAgLy90aGlzIGlzIHJlZ2FyZGxlc3Mgb2YgdGhlIGNvbGxpZGVyIHR5cGVcblxuICAgICAgICAgICAgLy90aGUgY2VudGVyIGlzIHRoZSBhdmVyYWdlIG9mIHRoZSBjb2xsIGNlbnRlcnNcbiAgICAgICAgICAgIHZhciBjID0gY3JlYXRlVmVjdG9yKFxuICAgICAgICAgICAgICAodGhpcy5wb3NpdGlvbi54K3RoaXMucHJldmlvdXNQb3NpdGlvbi54KS8yLFxuICAgICAgICAgICAgICAodGhpcy5wb3NpdGlvbi55K3RoaXMucHJldmlvdXNQb3NpdGlvbi55KS8yKTtcblxuICAgICAgICAgICAgLy90aGUgZXh0ZW50cyBhcmUgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNvbGwgY2VudGVyc1xuICAgICAgICAgICAgLy9wbHVzIHRoZSBleHRlbnRzIG9mIGJvdGhcbiAgICAgICAgICAgIHZhciBlID0gY3JlYXRlVmVjdG9yKFxuICAgICAgICAgICAgICBhYnModGhpcy5wb3NpdGlvbi54IC10aGlzLnByZXZpb3VzUG9zaXRpb24ueCkgKyB0aGlzLmNvbGxpZGVyLmV4dGVudHMueCxcbiAgICAgICAgICAgICAgYWJzKHRoaXMucG9zaXRpb24ueSAtdGhpcy5wcmV2aW91c1Bvc2l0aW9uLnkpICsgdGhpcy5jb2xsaWRlci5leHRlbnRzLnkpO1xuXG4gICAgICAgICAgICB2YXIgYmJveCA9IG5ldyBBQUJCKGMsIGUsIHRoaXMuY29sbGlkZXIub2Zmc2V0KTtcblxuICAgICAgICAgICAgLy9iYm94LmRyYXcoKTtcblxuICAgICAgICAgICAgaWYoYmJveC5vdmVybGFwKG90aGVyLmNvbGxpZGVyKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWYodHVubmVsWCkge1xuXG4gICAgICAgICAgICAgICAgLy9lbnRlcmluZyBmcm9tIHRoZSByaWdodFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueCA8IDApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueCA9IG90aGVyLmNvbGxpZGVyLnJpZ2h0KCkgLSB0aGlzLmNvbGxpZGVyLmxlZnQoKSArIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZih0aGlzLnZlbG9jaXR5LnggPiAwIClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC54ID0gb3RoZXIuY29sbGlkZXIubGVmdCgpIC0gdGhpcy5jb2xsaWRlci5yaWdodCgpIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZih0dW5uZWxZKSB7XG4gICAgICAgICAgICAgICAgLy9mcm9tIHRvcFxuICAgICAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueSA+IDApXG4gICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnQueSA9IG90aGVyLmNvbGxpZGVyLnRvcCgpIC0gdGhpcy5jb2xsaWRlci5ib3R0b20oKSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZih0aGlzLnZlbG9jaXR5LnkgPCAwIClcbiAgICAgICAgICAgICAgICAgIGRpc3BsYWNlbWVudC55ID0gb3RoZXIuY29sbGlkZXIuYm90dG9tKCkgLSB0aGlzLmNvbGxpZGVyLnRvcCgpICsgMTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfS8vZW5kIG92ZXJsYXBcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIC8vbm9uIHR1bm5lbCBvdmVybGFwXG4gICAgICAgICAge1xuXG4gICAgICAgICAgICAvL2lmIHRoZSBvdGhlciBpcyBhIGNpcmNsZSBJIGNhbGN1bGF0ZSB0aGUgZGlzcGxhY2VtZW50IGZyb20gaGVyZVxuICAgICAgICAgICAgLy9hbmQgcmV2ZXJzZSBpdFxuICAgICAgICAgICAgaWYodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IG90aGVyLmNvbGxpZGVyLmNvbGxpZGUodGhpcy5jb2xsaWRlcikubXVsdCgtMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZGlzcGxhY2VtZW50ID0gdGhpcy5jb2xsaWRlci5jb2xsaWRlKG90aGVyLmNvbGxpZGVyKTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID09IDAgJiYgIGRpc3BsYWNlbWVudC55ID09IDAgKVxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgIHtcblxuICAgICAgICAgICAgaWYoIXRoaXMuaW1tb3ZhYmxlKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLmFkZChkaXNwbGFjZW1lbnQpO1xuICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzUG9zaXRpb24gPSBjcmVhdGVWZWN0b3IodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICB0aGlzLm5ld1Bvc2l0aW9uID0gY3JlYXRlVmVjdG9yKHRoaXMucG9zaXRpb24ueCwgdGhpcy5wb3NpdGlvbi55KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnggPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC55IDwgMClcbiAgICAgICAgICAgICAgdGhpcy50b3VjaGluZy5ib3R0b20gPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPiAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLnRvcCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmKHR5cGUgPT0gXCJib3VuY2VcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWYob3RoZXIuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFgxID0gLXRoaXMudmVsb2NpdHkueCtvdGhlci52ZWxvY2l0eS54O1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxZMSA9IC10aGlzLnZlbG9jaXR5Lnkrb3RoZXIudmVsb2NpdHkueTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWxYMSA9ICh0aGlzLnZlbG9jaXR5LnggKiAodGhpcy5tYXNzIC0gb3RoZXIubWFzcykgKyAoMiAqIG90aGVyLm1hc3MgKiBvdGhlci52ZWxvY2l0eS54KSkgLyAodGhpcy5tYXNzICsgb3RoZXIubWFzcyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVsWTEgPSAodGhpcy52ZWxvY2l0eS55ICogKHRoaXMubWFzcyAtIG90aGVyLm1hc3MpICsgKDIgKiBvdGhlci5tYXNzICogb3RoZXIudmVsb2NpdHkueSkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFgyID0gKG90aGVyLnZlbG9jaXR5LnggKiAob3RoZXIubWFzcyAtIHRoaXMubWFzcykgKyAoMiAqIHRoaXMubWFzcyAqIHRoaXMudmVsb2NpdHkueCkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZlbFkyID0gKG90aGVyLnZlbG9jaXR5LnkgKiAob3RoZXIubWFzcyAtIHRoaXMubWFzcykgKyAoMiAqIHRoaXMubWFzcyAqIHRoaXMudmVsb2NpdHkueSkpIC8gKHRoaXMubWFzcyArIG90aGVyLm1hc3MpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy92YXIgYm90aENpcmNsZXMgPSAodGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyICYmXG4gICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgIG90aGVyLmNvbGxpZGVyICBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKTtcblxuICAgICAgICAgICAgICAvL2lmKHRoaXMudG91Y2hpbmcubGVmdCB8fCB0aGlzLnRvdWNoaW5nLnJpZ2h0IHx8IHRoaXMuY29sbGlkZXIgaW5zdGFuY2VvZiBDaXJjbGVDb2xsaWRlcilcblxuICAgICAgICAgICAgICAvL3ByaW50KGRpc3BsYWNlbWVudCk7XG5cbiAgICAgICAgICAgICAgaWYoYWJzKGRpc3BsYWNlbWVudC54KT5hYnMoZGlzcGxhY2VtZW50LnkpKVxuICAgICAgICAgICAgICB7XG5cblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnggPSBuZXdWZWxYMSp0aGlzLnJlc3RpdHV0aW9uO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIW90aGVyLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICAgIG90aGVyLnZlbG9jaXR5LnggPSBuZXdWZWxYMipvdGhlci5yZXN0aXR1dGlvbjtcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vaWYodGhpcy50b3VjaGluZy50b3AgfHwgdGhpcy50b3VjaGluZy5ib3R0b20gfHwgdGhpcy5jb2xsaWRlciBpbnN0YW5jZW9mIENpcmNsZUNvbGxpZGVyKVxuICAgICAgICAgICAgICBpZihhYnMoZGlzcGxhY2VtZW50LngpPGFicyhkaXNwbGFjZW1lbnQueSkpXG4gICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmltbW92YWJsZSlcbiAgICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSA9IG5ld1ZlbFkxKnRoaXMucmVzdGl0dXRpb247XG5cbiAgICAgICAgICAgICAgICBpZighb3RoZXIuaW1tb3ZhYmxlKVxuICAgICAgICAgICAgICAgICAgb3RoZXIudmVsb2NpdHkueSA9IG5ld1ZlbFkyKm90aGVyLnJlc3RpdHV0aW9uO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2Vsc2UgaWYodHlwZSA9PSBcImNvbGxpZGVcIilcbiAgICAgICAgICAgICAgLy90aGlzLnZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKDAsMCk7XG5cbiAgICAgICAgICAgIGlmKGNhbGxiYWNrICE9IHVuZGVmaW5lZCAmJiB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIG90aGVyKTtcblxuICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cblxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0eXBlPT1cImRpc3BsYWNlXCIpICB7XG5cbiAgICAgICAgICAvL2lmIHRoZSBvdGhlciBpcyBhIGNpcmNsZSBJIGNhbGN1bGF0ZSB0aGUgZGlzcGxhY2VtZW50IGZyb20gaGVyZVxuICAgICAgICAgIC8vYW5kIHJldmVyc2UgaXRcbiAgICAgICAgICBpZih0aGlzLmNvbGxpZGVyIGluc3RhbmNlb2YgQ2lyY2xlQ29sbGlkZXIpXG4gICAgICAgICAgICBkaXNwbGFjZW1lbnQgPSBvdGhlci5jb2xsaWRlci5jb2xsaWRlKHRoaXMuY29sbGlkZXIpLm11bHQoLTEpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpc3BsYWNlbWVudCA9IHRoaXMuY29sbGlkZXIuY29sbGlkZShvdGhlci5jb2xsaWRlcik7XG5cblxuICAgICAgICAgIGlmKGRpc3BsYWNlbWVudC54ID09IDAgJiYgIGRpc3BsYWNlbWVudC55ID09IDAgKVxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG90aGVyLnBvc2l0aW9uLnN1YihkaXNwbGFjZW1lbnQpO1xuXG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueCA8IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoZGlzcGxhY2VtZW50LnkgPCAwKVxuICAgICAgICAgICAgICB0aGlzLnRvdWNoaW5nLmJvdHRvbSA9IHRydWU7XG4gICAgICAgICAgICBpZihkaXNwbGFjZW1lbnQueSA+IDApXG4gICAgICAgICAgICAgIHRoaXMudG91Y2hpbmcudG9wID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYoY2FsbGJhY2sgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgb3RoZXIpO1xuXG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfS8vZW5kIGNvbGxpZGVyIGV4aXN0c1xuICAgIH1cbiAgICAvLyBOb3QgZG9uZSwgdW5sZXNzIHdlJ3JlIG9uIHRoZSBsYXN0IGl0ZW0gaW4gX19vdGhlcnM6XG4gICAgc3RhdGUuZG9uZUV4ZWMgPSBzdGF0ZS5fX2kgPj0gKHN0YXRlLl9fb3RoZXJzLmxlbmd0aCAtIDEpO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmRvbmVFeGVjID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIl19
