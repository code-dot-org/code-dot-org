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
  this.eventHandlers = [];
  this.Globals = {};
  this.currentCmdQueue = null;

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

  config.dropletConfig = dropletConfig;

  var iconPath = 'media/turtle/' + (config.isLegacyShare && config.hideSource ? 'icons_white.png' : 'icons.png');

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
      visualization: '',
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

  // TODO (cpirich): remove?

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = '400px';
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

  // Discard the interpreter.
  this.JSInterpreter = null;
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
        this.JSInterpreter.queueEvent(handler.func, extraArgs);
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
 * Set up this.code, this.interpreter, etc. to run code for editCode levels
 */

/*
GameLab.prototype.generateTurtleCodeFromJS_ = function () {
  this.code = dropletUtils.generateCodeAliases(dropletConfig, 'Turtle');
  this.userCodeStartOffset = this.code.length;
  this.code += this.studioApp_.editor.getValue();
  this.userCodeLength = this.code.length - this.userCodeStartOffset;

  var session = this.studioApp_.editor.aceEditor.getSession();
  this.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

  var initFunc = _.bind(function(interpreter, scope) {
    codegen.initJSInterpreter(interpreter, null, null, scope, {
      Turtle: this.api
    });
  }, this);
  this.interpreter = new window.Interpreter(this.code, initFunc);
};
*/

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
    /*
    if (this.checkForEditCodePreExecutionFailure()) {
      return this.onPuzzleComplete();
    }
    */
  } else {
      this.code = Blockly.Generator.blockSpaceToCode('JavaScript');
      this.evalCode(this.code);
    }

  // api.log now contains a transcript of all the user's actions.
  this.studioApp_.playAudio('start', { loop: true });
  // animate the transcript.

  if (this.studioApp_.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);
  }

  this.tickIntervalId = window.setInterval(_.bind(this.onTick, this), 33);
};

GameLab.prototype.onTick = function () {
  this.tickCount++;
  var i;

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

},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/gamelab/api.js","./apiJavascript":"/home/ubuntu/staging/apps/build/js/gamelab/apiJavascript.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/gamelab/dropletConfig.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/gamelab/extraControlRows.html.ejs","./levels":"/home/ubuntu/staging/apps/build/js/gamelab/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/gamelab/locale.js"}],"/home/ubuntu/staging/apps/build/js/gamelab/levels.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9nYW1lbGFiL21haW4uanMiLCJidWlsZC9qcy9nYW1lbGFiL3NraW5zLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9ibG9ja3MuanMiLCJidWlsZC9qcy9nYW1lbGFiL0dhbWVMYWIuanMiLCJidWlsZC9qcy9nYW1lbGFiL2xldmVscy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvbG9jYWxlLmpzIiwiYnVpbGQvanMvZ2FtZWxhYi9jb250cm9scy5odG1sLmVqcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpSmF2YXNjcmlwdC5qcyIsImJ1aWxkL2pzL2dhbWVsYWIvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNsRCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDckMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDOUIsTUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzs7QUFFNUIsU0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxTQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNuQyxDQUFDOzs7OztBQ2RGLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbkMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDckMsTUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXZDLFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7O0FDQUYsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXJDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7O0FBR25DLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBUyxPQUFPLEVBQUUsbUJBQW1CLEVBQUU7QUFDdkQsTUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDOztBQUVwQyxNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxTQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQzs7O0FBRy9CLFNBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHOztBQUUzQixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBVztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDbEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNuQztHQUNGLENBQUM7O0FBRUYsV0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZOztBQUVsQyxXQUFPLGtCQUFrQixDQUFDO0dBQzNCLENBQUM7Q0FFSCxDQUFDOzs7QUN2Q0YsWUFBWSxDQUFDOztBQUViLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDL0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDakQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Ozs7QUFLaEQsSUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQWU7QUFDeEIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsTUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsTUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDeEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7O0FBRTVCLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsTUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0IsTUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDM0IsTUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDaEMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7Ozs7QUFLekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBVSxTQUFTLEVBQUU7QUFDdkQsTUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDNUIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELE1BQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbkUsTUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5QyxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsTUFBTSxFQUFFO0FBQ3pDLE1BQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3BCLFVBQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztHQUNqRDs7QUFFRCxNQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsTUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOztBQUUxQixRQUFNLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQzs7QUFFckMsTUFBSSxRQUFRLEdBQUcsZUFBZSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsR0FBRyxXQUFXLENBQUEsQUFBQyxDQUFDOztBQUUvRyxNQUFJLGdCQUFnQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7QUFDbEQsTUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUQsTUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNwRCxZQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLGdCQUFZLEVBQUUscUJBQXFCLElBQUksZ0JBQWdCO0dBQ3hELENBQUMsQ0FBQztBQUNILE1BQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDNUQsWUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtBQUNsQyxnQkFBWSxFQUFFLENBQUMscUJBQXFCLElBQUksZ0JBQWdCO0dBQ3pELENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixZQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ2xDLFFBQUksRUFBRTtBQUNKLG1CQUFhLEVBQUUsRUFBRTtBQUNqQixxQkFBZSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFO0FBQ2xELGNBQVEsRUFBRSxnQkFBZ0I7QUFDMUIsc0JBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLGVBQVMsRUFBRyxTQUFTO0FBQ3JCLHNCQUFnQixFQUFHLFNBQVM7QUFDNUIsY0FBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUM3Qix1QkFBaUIsRUFBRyx1QkFBdUI7QUFDM0MsdUJBQWlCLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtLQUM1QztHQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRCxRQUFNLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTdELE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzlCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsWUFBWTtBQUN6QyxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6RCxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUM5RCxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVqRCxNQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7OztBQUdwQyxXQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQ3JEOzs7OztBQUtELE1BQUksbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pFLHFCQUFtQixDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0NBQzNDLENBQUM7Ozs7Ozs7QUFRRixPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLE1BQU0sRUFBRTs7QUFFMUMsTUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDeEIsUUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUMsTUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7OztBQUduQixNQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztDQUM1QixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFlBQVk7QUFDN0MsTUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXhDLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNwQyxXQUFPLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN0QztBQUNELE1BQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDM0IsTUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2hCLENBQUM7Ozs7Ozs7Ozs7QUFVRixPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUU7QUFDOUUsTUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU8sRUFBRTtBQUNuRCxRQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUU7OztBQUdwQyxVQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUNwQixtQkFBbUIsSUFBSyxDQUFDLEtBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQUFBQyxFQUFFO0FBQzVELFlBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUN4QyxZQUFJO0FBQ0YsaUJBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2RCxDQUFDLE9BQU8sQ0FBQyxFQUFFOztTQUVYO0FBQ0QsWUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7T0FDN0I7S0FDRixNQUFNOztBQUVMLFVBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDekIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztPQUN4RDtLQUNGO0dBQ0YsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ1gsQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3hELE1BQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxPQUFPLEVBQUU7QUFDbkQsUUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNwRCxXQUFLLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2xFLFlBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTs7QUFFckIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUIsTUFBTTtBQUNMLGdCQUFNO1NBQ1A7T0FDRjtLQUNGO0dBQ0YsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ1gsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLElBQUksRUFBRTtBQUMxQyxNQUFJO0FBQ0YsV0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDckIsYUFBTyxFQUFFLElBQUksQ0FBQyxHQUFHO0tBQ2xCLENBQUMsQ0FBQztHQUNKLENBQUMsT0FBTyxDQUFDLEVBQUU7Ozs7O0FBS1YsUUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFOzs7QUFHbEIsVUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO0FBQ2xCLGNBQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztPQUMxRDtBQUNELFlBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7R0FDRjtDQUNGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBVzs7QUFFckMsTUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFeEIsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxLQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLElBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsK0JBQStCLEVBQUUsQ0FBQSxBQUFDLEVBQUU7O0FBRXhELFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixXQUFPO0dBQ1I7O0FBRUQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO0FBQ3JDLFVBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtBQUMvQixZQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU07QUFDNUIsaUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtBQUMxRSxrQkFBWSxFQUFFLElBQUk7QUFDbEIsZUFBUyxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQzFCLHNCQUFnQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQztLQUMxRCxDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUNyQyxhQUFPO0tBQ1I7Ozs7OztHQU1GLE1BQU07QUFDTCxVQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7OztBQUdELE1BQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDOzs7QUFHbEQsTUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxFQUFFOztBQUVwQyxXQUFPLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDdEQ7O0FBRUQsTUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUN6RSxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVk7QUFDckMsTUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxDQUFDOztBQUVOLE1BQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7QUFDeEIsUUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ3BDOztBQUVELE1BQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFcEMsTUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNsQyxNQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0VuQyxNQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1DRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxHQUFHLEVBQUUsVUFBVSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ2xFLFFBQU0sR0FBRyxDQUFDO0NBQ1gsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZELFNBQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDM0MsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVk7O0FBRS9DLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNwQyxXQUFPLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3QztBQUNELE1BQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztDQUNwQixDQUFDOzs7Ozs7QUFNRixPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFlBQVc7QUFDOUMsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFdkIsTUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7QUFDOUIsT0FBRyxFQUFFLFNBQVM7QUFDZCxRQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGdCQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDOUIsV0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ3JCLFlBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixTQUFLLEVBQUUsS0FBSzs7O0FBR1osa0JBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUssS0FBSyxDQUFDLFFBQVEsMEJBQTJCOzs7O0FBSW5GLG9CQUFnQixFQUFFLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQjtBQUN0RixjQUFVLEVBQUU7QUFDVixzQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDeEMsaUJBQVcsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFO0tBQ2hDO0dBQ0YsQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7Ozs7O0FBTUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFTLFFBQVEsRUFBRTtBQUN0RCxNQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7QUFFekIsTUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRCxXQUFTLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUMzQixNQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztDQUN6QixDQUFDOzs7Ozs7QUFNRixPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFXO0FBQ3pDLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7QUFJdkIsTUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLFFBQVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFBLEFBQUMsQ0FBQztBQUNoRixNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVqRSxNQUFJLE9BQU8sQ0FBQztBQUNaLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTtBQUNwQyxRQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsV0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ3RDOzs7QUFHRCxNQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7QUFFekIsTUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFOzs7Ozs7O0FBT2xCLFdBQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUM3Qzs7OztBQUlELE1BQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNsQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztHQUMxRDs7O0FBR0QsTUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUMxRCxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFO0FBQ3hFLFFBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ2xDLE1BQU07QUFDTCxRQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN0Qzs7QUFFRCxNQUFJLFVBQVUsR0FBRztBQUNmLE9BQUcsRUFBRSxTQUFTO0FBQ2QsU0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ2YsV0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO0FBQ3RCLFVBQU0sRUFBRSxhQUFhO0FBQ3JCLGNBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM1QixXQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDO0FBQ3BDLGNBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7R0FFaEQsQ0FBQzs7O0FBRUYsTUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRW5DLE1BQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsRUFBRTs7QUFFcEMsV0FBTyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JEOzs7Q0FHRixDQUFDOzs7Ozs7O0FDM2pCRixJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7QUFDbEMsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztBQUN6QyxJQUFJLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDOzs7OztBQUsvQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7O0FBR2pDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDZCxPQUFLLEVBQUUsUUFBUTtBQUNmLGdCQUFjLEVBQUUsRUFBRTtBQUNsQixPQUFLLEVBQUU7QUFDTCxnQkFBWSxFQUFFLENBQUM7R0FDaEI7QUFDRCxhQUFXLEVBQUUsRUFBRTtDQUNoQixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUk7QUFDaEIsT0FBSyxFQUFFLFFBQVE7QUFDZixnQkFBYyxFQUFFLEVBQ2Y7QUFDRCxPQUFLLEVBQUU7QUFDTCxnQkFBWSxFQUFFLENBQUM7R0FDaEI7QUFDRCxhQUFXLEVBQUUsQ0FDWCxZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksRUFDWixVQUFVLENBQ1g7QUFDRCxVQUFRLEVBQUUsSUFBSTtBQUNkLFNBQU8sRUFDTCxFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2hDLGFBQVcsRUFDVixpRUFBaUU7Q0FDbkUsQ0FBQzs7QUFFRixNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUMvQyxVQUFRLEVBQUUsSUFBSTtBQUNkLGVBQWEsRUFBRTs7QUFFYixTQUFLLEVBQUUsSUFBSTtHQUNaO0FBQ0QsYUFBVyxFQUFFLEVBQUU7Q0FDaEIsQ0FBQyxDQUFDOzs7QUNuREg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25CQSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXhDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQ3RCLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FDMUMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRztBQUMxQixJQUFFLEVBQUU7QUFDRixTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxFQUFFO0dBQ1g7QUFDRCxZQUFVLEVBQUU7QUFDVixTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxFQUFFO0dBQ1g7QUFDRCxVQUFRLEVBQUU7QUFDUixTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxFQUFFO0dBQ1g7QUFDRCxRQUFNLEVBQUU7QUFDTixTQUFLLEVBQUUsT0FBTztBQUNkLFVBQU0sRUFBRSxFQUFFO0dBQ1g7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEdBQUcsSUFBSSxDQUFDO0FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUMxQnpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7OztBQ0QvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkJBLElBQUksT0FBTyxDQUFDOzs7QUFHWixPQUFPLENBQUMsYUFBYSxHQUFHLFVBQVUsT0FBTyxFQUFFO0FBQ3pDLFNBQU8sR0FBRyxPQUFPLENBQUM7Q0FDbkIsQ0FBQzs7QUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFlBQVk7QUFDeEIsU0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDakMsQ0FBQzs7Ozs7QUNURixJQUFJLE9BQU8sQ0FBQzs7O0FBR1osT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFVLE9BQU8sRUFBRTtBQUN6QyxTQUFPLEdBQUcsT0FBTyxDQUFDO0NBQ25CLENBQUM7O0FBRUYsT0FBTyxDQUFDLE1BQU0sR0FBRyxVQUFVLE1BQU0sRUFBRTtBQUNqQyxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQsU0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEIsQ0FBQzs7QUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsRUFBRSxFQUFFO0FBQzFCLFNBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQy9CLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIEdhbWVMYWIgPSByZXF1aXJlKCcuL0dhbWVMYWInKTtcbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbndpbmRvdy5nYW1lbGFiTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgdmFyIGdhbWVsYWIgPSBuZXcgR2FtZUxhYigpO1xuXG4gIGdhbWVsYWIuaW5qZWN0U3R1ZGlvQXBwKHN0dWRpb0FwcCk7XG4gIGFwcE1haW4oZ2FtZWxhYiwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG4iLCJ2YXIgc2tpbkJhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbiAoYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbkJhc2UubG9hZChhc3NldFVybCwgaWQpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQ0RPIEFwcDogR2FtZUxhYlxuICpcbiAqIENvcHlyaWdodCAyMDE2IENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuXG52YXIgR2FtZUxhYiA9IHJlcXVpcmUoJy4vR2FtZUxhYicpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgLy8gQmxvY2sgZGVmaW5pdGlvbnMuXG4gIGJsb2NrbHkuQmxvY2tzLmdhbWVsYWJfZm9vID0ge1xuICAgIC8vIEJsb2NrIGZvciBmb28uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZvbygpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZvb1Rvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5nYW1lbGFiX2ZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBmb28uXG4gICAgcmV0dXJuICdHYW1lTGFiLmZvbygpO1xcbic7XG4gIH07XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIGFwaUphdmFzY3JpcHQgPSByZXF1aXJlKCcuL2FwaUphdmFzY3JpcHQnKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgZHJvcGxldFV0aWxzID0gcmVxdWlyZSgnLi4vZHJvcGxldFV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcbnZhciBKU0ludGVycHJldGVyID0gcmVxdWlyZSgnLi4vSlNJbnRlcnByZXRlcicpO1xuXG4vKipcbiAqIEFuIGluc3RhbnRpYWJsZSBHYW1lTGFiIGNsYXNzXG4gKi9cbnZhciBHYW1lTGFiID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNraW4gPSBudWxsO1xuICB0aGlzLmxldmVsID0gbnVsbDtcbiAgdGhpcy50aWNrSW50ZXJ2YWxJZCA9IDA7XG4gIHRoaXMudGlja0NvdW50ID0gMDtcbiAgdGhpcy5zdHVkaW9BcHBfID0gbnVsbDtcbiAgdGhpcy5KU0ludGVycHJldGVyID0gbnVsbDtcbiAgdGhpcy5ldmVudEhhbmRsZXJzID0gW107XG4gIHRoaXMuR2xvYmFscyA9IHt9O1xuICB0aGlzLmN1cnJlbnRDbWRRdWV1ZSA9IG51bGw7XG5cbiAgdGhpcy5hcGkgPSBhcGk7XG4gIHRoaXMuYXBpLmluamVjdEdhbWVMYWIodGhpcyk7XG4gIHRoaXMuYXBpSlMgPSBhcGlKYXZhc2NyaXB0O1xuICB0aGlzLmFwaUpTLmluamVjdEdhbWVMYWIodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVMYWI7XG5cbi8qKlxuICogSW5qZWN0IHRoZSBzdHVkaW9BcHAgc2luZ2xldG9uLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5pbmplY3RTdHVkaW9BcHAgPSBmdW5jdGlvbiAoc3R1ZGlvQXBwKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5zdHVkaW9BcHBfLnJlc2V0ID0gXy5iaW5kKHRoaXMucmVzZXQsIHRoaXMpO1xuICB0aGlzLnN0dWRpb0FwcF8ucnVuQnV0dG9uQ2xpY2sgPSBfLmJpbmQodGhpcy5ydW5CdXR0b25DbGljaywgdGhpcyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhpcyBHYW1lTGFiIGluc3RhbmNlLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgaWYgKCF0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lTGFiIHJlcXVpcmVzIGEgU3R1ZGlvQXBwXCIpO1xuICB9XG5cbiAgdGhpcy5za2luID0gY29uZmlnLnNraW47XG4gIHRoaXMubGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuXG4gIHZhciBpY29uUGF0aCA9ICdtZWRpYS90dXJ0bGUvJyArIChjb25maWcuaXNMZWdhY3lTaGFyZSAmJiBjb25maWcuaGlkZVNvdXJjZSA/ICdpY29uc193aGl0ZS5wbmcnIDogJ2ljb25zLnBuZycpO1xuXG4gIHZhciBzaG93RmluaXNoQnV0dG9uID0gIXRoaXMubGV2ZWwuaXNQcm9qZWN0TGV2ZWw7XG4gIHZhciBmaW5pc2hCdXR0b25GaXJzdExpbmUgPSBfLmlzRW1wdHkodGhpcy5sZXZlbC5zb2Z0QnV0dG9ucyk7XG4gIHZhciBmaXJzdENvbnRyb2xzUm93ID0gcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGZpbmlzaEJ1dHRvbjogZmluaXNoQnV0dG9uRmlyc3RMaW5lICYmIHNob3dGaW5pc2hCdXR0b25cbiAgfSk7XG4gIHZhciBleHRyYUNvbnRyb2xSb3dzID0gcmVxdWlyZSgnLi9leHRyYUNvbnRyb2xSb3dzLmh0bWwuZWpzJykoe1xuICAgIGFzc2V0VXJsOiB0aGlzLnN0dWRpb0FwcF8uYXNzZXRVcmwsXG4gICAgZmluaXNoQnV0dG9uOiAhZmluaXNoQnV0dG9uRmlyc3RMaW5lICYmIHNob3dGaW5pc2hCdXR0b25cbiAgfSk7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogdGhpcy5zdHVkaW9BcHBfLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIHZpc3VhbGl6YXRpb246ICcnLFxuICAgICAgbG9jYWxlRGlyZWN0aW9uOiB0aGlzLnN0dWRpb0FwcF8ubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICBjb250cm9sczogZmlyc3RDb250cm9sc1JvdyxcbiAgICAgIGV4dHJhQ29udHJvbFJvd3M6IGV4dHJhQ29udHJvbFJvd3MsXG4gICAgICBibG9ja1VzZWQgOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyIDogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IHRoaXMubGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzcyA6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IF8uYmluZCh0aGlzLmxvYWRBdWRpb18sIHRoaXMpO1xuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBfLmJpbmQodGhpcy5hZnRlckluamVjdF8sIHRoaXMsIGNvbmZpZyk7XG5cbiAgdGhpcy5zdHVkaW9BcHBfLmluaXQoY29uZmlnKTtcbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmxvYWRBdWRpb18gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLndpblNvdW5kLCAnd2luJyk7XG4gIHRoaXMuc3R1ZGlvQXBwXy5sb2FkQXVkaW8odGhpcy5za2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICB0aGlzLnN0dWRpb0FwcF8ubG9hZEF1ZGlvKHRoaXMuc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG59O1xuXG4vKipcbiAqIENvZGUgY2FsbGVkIGFmdGVyIHRoZSBibG9ja2x5IGRpdiArIGJsb2NrbHkgY29yZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBkb2N1bWVudFxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5hZnRlckluamVjdF8gPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gQWRkIHRvIHJlc2VydmVkIHdvcmQgbGlzdDogQVBJLCBsb2NhbCB2YXJpYWJsZXMgaW4gZXhlY3V0aW9uIGV2aXJvbm1lbnRcbiAgICAvLyAoZXhlY3V0ZSkgYW5kIHRoZSBpbmZpbml0ZSBsb29wIGRldGVjdGlvbiBmdW5jdGlvbi5cbiAgICBCbG9ja2x5LkphdmFTY3JpcHQuYWRkUmVzZXJ2ZWRXb3JkcygnR2FtZUxhYixjb2RlJyk7XG4gIH1cblxuICAvLyBUT0RPIChjcGlyaWNoKTogcmVtb3ZlP1xuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSAnNDAwcHgnO1xufTtcblxuXG4vKipcbiAqIFJlc2V0IEdhbWVMYWIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZSBSZXF1aXJlZCBieSB0aGUgQVBJIGJ1dCBpZ25vcmVkIGJ5IHRoaXNcbiAqICAgICBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoaWdub3JlKSB7XG5cbiAgdGhpcy5ldmVudEhhbmRsZXJzID0gW107XG4gIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMudGlja0ludGVydmFsSWQpO1xuICB0aGlzLnRpY2tJbnRlcnZhbElkID0gMDtcbiAgdGhpcy50aWNrQ291bnQgPSAwO1xuXG4gIC8vIERpc2NhcmQgdGhlIGludGVycHJldGVyLlxuICB0aGlzLkpTSW50ZXJwcmV0ZXIgPSBudWxsO1xuICB0aGlzLmV4ZWN1dGlvbkVycm9yID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3R1ZGlvQXBwXy50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NwaW5uZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgdGhpcy5zdHVkaW9BcHBfLmF0dGVtcHRzKys7XG4gIHRoaXMuZXhlY3V0ZSgpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSBjb2RlIGZvciBhbGwgb2YgdGhlIGV2ZW50IGhhbmRsZXJzIHRoYXQgbWF0Y2ggYW4gZXZlbnQgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgaGFuZGxlciB3ZSB3YW50IHRvIGNhbGxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dRdWV1ZUV4ZW5zaW9uIFdoZW4gdHJ1ZSwgd2UgYWxsb3cgYWRkaXRpb25hbCBjbWRzIHRvXG4gKiAgYmUgYXBwZW5kZWQgdG8gdGhlIHF1ZXVlXG4gKiBAcGFyYW0ge0FycmF5fSBleHRyYUFyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgcGFzc2VkIGludG8gdGhlIHZpcnR1YWxcbiogICBKUyBtYWNoaW5lIGZvciBjb25zdW1wdGlvbiBieSB0aGUgc3R1ZGVudCdzIGV2ZW50LWhhbmRsaW5nIGNvZGUuXG4gKi9cbkdhbWVMYWIucHJvdG90eXBlLmNhbGxIYW5kbGVyID0gZnVuY3Rpb24gKG5hbWUsIGFsbG93UXVldWVFeHRlbnNpb24sIGV4dHJhQXJncykge1xuICB0aGlzLmV2ZW50SGFuZGxlcnMuZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICBpZiAodGhpcy5zdHVkaW9BcHBfLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIC8vIE5vdGU6IHdlIHNraXAgZXhlY3V0aW5nIHRoZSBjb2RlIGlmIHdlIGhhdmUgbm90IGNvbXBsZXRlZCBleGVjdXRpbmdcbiAgICAgIC8vIHRoZSBjbWRRdWV1ZSBvbiB0aGlzIGhhbmRsZXIgKGNoZWNraW5nIGZvciBub24temVybyBsZW5ndGgpXG4gICAgICBpZiAoaGFuZGxlci5uYW1lID09PSBuYW1lICYmXG4gICAgICAgICAgKGFsbG93UXVldWVFeHRlbnNpb24gfHwgKDAgPT09IGhhbmRsZXIuY21kUXVldWUubGVuZ3RoKSkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q21kUXVldWUgPSBoYW5kbGVyLmNtZFF1ZXVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGhhbmRsZXIuZnVuYyh0aGlzLnN0dWRpb0FwcF8sIHRoaXMuYXBpLCB0aGlzLkdsb2JhbHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gRG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudENtZFF1ZXVlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETyAoY3BpcmljaCk6IHN1cHBvcnQgZXZlbnRzIHdpdGggcGFyYW1ldGVyc1xuICAgICAgaWYgKGhhbmRsZXIubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICB0aGlzLkpTSW50ZXJwcmV0ZXIucXVldWVFdmVudChoYW5kbGVyLmZ1bmMsIGV4dHJhQXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB0aGlzKSk7XG59O1xuXG4vL1xuLy8gRXhlY3V0ZSBhbiBlbnRpcmUgY29tbWFuZCBxdWV1ZSAoc3BlY2lmaWVkIHdpdGggdGhlIG5hbWUgcGFyYW1ldGVyKVxuLy9cblxuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZVF1ZXVlID0gZnVuY3Rpb24gKG5hbWUsIG9uZU9ubHkpIHtcbiAgdGhpcy5ldmVudEhhbmRsZXJzLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgaWYgKGhhbmRsZXIubmFtZSA9PT0gbmFtZSAmJiBoYW5kbGVyLmNtZFF1ZXVlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgY21kID0gaGFuZGxlci5jbWRRdWV1ZVswXTsgY21kOyBjbWQgPSBoYW5kbGVyLmNtZFF1ZXVlWzBdKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbGxDbWQoY21kKSkge1xuICAgICAgICAgIC8vIENvbW1hbmQgZXhlY3V0ZWQgaW1tZWRpYXRlbHksIHJlbW92ZSBmcm9tIHF1ZXVlIGFuZCBjb250aW51ZVxuICAgICAgICAgIGhhbmRsZXIuY21kUXVldWUuc2hpZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgdGhpcykpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUuZXZhbENvZGUgPSBmdW5jdGlvbihjb2RlKSB7XG4gIHRyeSB7XG4gICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICBHYW1lTGFiOiB0aGlzLmFwaVxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSW5maW5pdHkgaXMgdGhyb3duIGlmIHdlIGRldGVjdCBhbiBpbmZpbml0ZSBsb29wLiBJbiB0aGF0IGNhc2Ugd2UnbGxcbiAgICAvLyBzdG9wIGZ1cnRoZXIgZXhlY3V0aW9uLCBhbmltYXRlIHdoYXQgb2NjdXJlZCBiZWZvcmUgdGhlIGluZmluaXRlIGxvb3AsXG4gICAgLy8gYW5kIGFuYWx5emUgc3VjY2Vzcy9mYWlsdXJlIGJhc2VkIG9uIHdoYXQgd2FzIGRyYXduLlxuICAgIC8vIE90aGVyd2lzZSwgYWJub3JtYWwgdGVybWluYXRpb24gaXMgYSB1c2VyIGVycm9yLlxuICAgIGlmIChlICE9PSBJbmZpbml0eSkge1xuICAgICAgLy8gY2FsbCB3aW5kb3cub25lcnJvciBzbyB0aGF0IHdlIGdldCBuZXcgcmVsaWMgY29sbGVjdGlvbi4gIHByZXBlbmQgd2l0aFxuICAgICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICAgIHdpbmRvdy5vbmVycm9yKFwiVXNlckNvZGU6XCIgKyBlLm1lc3NhZ2UsIGRvY3VtZW50LlVSTCwgMCk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuYWxlcnQoZSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNldCB1cCB0aGlzLmNvZGUsIHRoaXMuaW50ZXJwcmV0ZXIsIGV0Yy4gdG8gcnVuIGNvZGUgZm9yIGVkaXRDb2RlIGxldmVsc1xuICovXG5cbi8qXG5HYW1lTGFiLnByb3RvdHlwZS5nZW5lcmF0ZVR1cnRsZUNvZGVGcm9tSlNfID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNvZGUgPSBkcm9wbGV0VXRpbHMuZ2VuZXJhdGVDb2RlQWxpYXNlcyhkcm9wbGV0Q29uZmlnLCAnVHVydGxlJyk7XG4gIHRoaXMudXNlckNvZGVTdGFydE9mZnNldCA9IHRoaXMuY29kZS5sZW5ndGg7XG4gIHRoaXMuY29kZSArPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIHRoaXMudXNlckNvZGVMZW5ndGggPSB0aGlzLmNvZGUubGVuZ3RoIC0gdGhpcy51c2VyQ29kZVN0YXJ0T2Zmc2V0O1xuXG4gIHZhciBzZXNzaW9uID0gdGhpcy5zdHVkaW9BcHBfLmVkaXRvci5hY2VFZGl0b3IuZ2V0U2Vzc2lvbigpO1xuICB0aGlzLmN1bXVsYXRpdmVMZW5ndGggPSBjb2RlZ2VuLmFjZUNhbGN1bGF0ZUN1bXVsYXRpdmVMZW5ndGgoc2Vzc2lvbik7XG5cbiAgdmFyIGluaXRGdW5jID0gXy5iaW5kKGZ1bmN0aW9uKGludGVycHJldGVyLCBzY29wZSkge1xuICAgIGNvZGVnZW4uaW5pdEpTSW50ZXJwcmV0ZXIoaW50ZXJwcmV0ZXIsIG51bGwsIG51bGwsIHNjb3BlLCB7XG4gICAgICBUdXJ0bGU6IHRoaXMuYXBpXG4gICAgfSk7XG4gIH0sIHRoaXMpO1xuICB0aGlzLmludGVycHJldGVyID0gbmV3IHdpbmRvdy5JbnRlcnByZXRlcih0aGlzLmNvZGUsIGluaXRGdW5jKTtcbn07XG4qL1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBSZXNldCBhbGwgc3RhdGUuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXNldCgpO1xuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSAmJlxuICAgICAgKHRoaXMuc3R1ZGlvQXBwXy5oYXNFeHRyYVRvcEJsb2NrcygpIHx8XG4gICAgICAgIHRoaXMuc3R1ZGlvQXBwXy5oYXNEdXBsaWNhdGVWYXJpYWJsZXNJbkZvckxvb3BzKCkpKSB7XG4gICAgLy8gaW1tZWRpYXRlbHkgY2hlY2sgYW5zd2VyLCB3aGljaCB3aWxsIGZhaWwgYW5kIHJlcG9ydCB0b3AgbGV2ZWwgYmxvY2tzXG4gICAgdGhpcy5jaGVja0Fuc3dlcigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLmxldmVsLmVkaXRDb2RlKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyID0gbmV3IEpTSW50ZXJwcmV0ZXIoe1xuICAgICAgY29kZTogdGhpcy5zdHVkaW9BcHBfLmdldENvZGUoKSxcbiAgICAgIGJsb2NrczogZHJvcGxldENvbmZpZy5ibG9ja3MsXG4gICAgICBibG9ja0ZpbHRlcjogdGhpcy5sZXZlbC5leGVjdXRlUGFsZXR0ZUFwaXNPbmx5ICYmIHRoaXMubGV2ZWwuY29kZUZ1bmN0aW9ucyxcbiAgICAgIGVuYWJsZUV2ZW50czogdHJ1ZSxcbiAgICAgIHN0dWRpb0FwcDogdGhpcy5zdHVkaW9BcHBfLFxuICAgICAgb25FeGVjdXRpb25FcnJvcjogXy5iaW5kKHRoaXMuaGFuZGxlRXhlY3V0aW9uRXJyb3IsIHRoaXMpLFxuICAgIH0pO1xuICAgIGlmICghdGhpcy5KU0ludGVycHJldGVyLmluaXRpYWxpemVkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLypcbiAgICBpZiAodGhpcy5jaGVja0ZvckVkaXRDb2RlUHJlRXhlY3V0aW9uRmFpbHVyZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vblB1enpsZUNvbXBsZXRlKCk7XG4gICAgfVxuICAgICovXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5jb2RlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZSgnSmF2YVNjcmlwdCcpO1xuICAgIHRoaXMuZXZhbENvZGUodGhpcy5jb2RlKTtcbiAgfVxuXG4gIC8vIGFwaS5sb2cgbm93IGNvbnRhaW5zIGEgdHJhbnNjcmlwdCBvZiBhbGwgdGhlIHVzZXIncyBhY3Rpb25zLlxuICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKCdzdGFydCcsIHtsb29wIDogdHJ1ZX0pO1xuICAvLyBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8uaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcbiAgfVxuXG4gIHRoaXMudGlja0ludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoXy5iaW5kKHRoaXMub25UaWNrLCB0aGlzKSwgMzMpO1xufTtcblxuR2FtZUxhYi5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpY2tDb3VudCsrO1xuICB2YXIgaTtcblxuICBpZiAodGhpcy50aWNrQ291bnQgPT09IDEpIHtcbiAgICB0aGlzLmNhbGxIYW5kbGVyKCd3aGVuR2FtZVN0YXJ0cycpO1xuICB9XG5cbiAgdGhpcy5leGVjdXRlUXVldWUoJ3doZW5HYW1lU3RhcnRzJyk7XG5cbiAgdGhpcy5jYWxsSGFuZGxlcigncmVwZWF0Rm9yZXZlcicpO1xuICB0aGlzLmV4ZWN1dGVRdWV1ZSgncmVwZWF0Rm9yZXZlcicpO1xuXG4vKlxuICAvLyBSdW4ga2V5IGV2ZW50IGhhbmRsZXJzIGZvciBhbnkga2V5cyB0aGF0IGFyZSBkb3duOlxuICBmb3IgKHZhciBrZXkgaW4gS2V5Q29kZXMpIHtcbiAgICBpZiAoU3R1ZGlvLmtleVN0YXRlW0tleUNvZGVzW2tleV1dICYmXG4gICAgICAgIFN0dWRpby5rZXlTdGF0ZVtLZXlDb2Rlc1trZXldXSA9PT0gXCJrZXlkb3duXCIpIHtcbiAgICAgIHN3aXRjaCAoS2V5Q29kZXNba2V5XSkge1xuICAgICAgICBjYXNlIEtleUNvZGVzLkxFRlQ6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tbGVmdCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGVzLlVQOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLXVwJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuUklHSFQ6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tcmlnaHQnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5ET1dOOlxuICAgICAgICAgIGNhbGxIYW5kbGVyKCd3aGVuLWRvd24nKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBidG4gaW4gQXJyb3dJZHMpIHtcbiAgICBpZiAoU3R1ZGlvLmJ0blN0YXRlW0Fycm93SWRzW2J0bl1dICYmXG4gICAgICAgIFN0dWRpby5idG5TdGF0ZVtBcnJvd0lkc1tidG5dXSA9PT0gQnV0dG9uU3RhdGUuRE9XTikge1xuICAgICAgc3dpdGNoIChBcnJvd0lkc1tidG5dKSB7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuTEVGVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1sZWZ0Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuVVA6XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tdXAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5SSUdIVDpcbiAgICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1yaWdodCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFycm93SWRzLkRPV046XG4gICAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tZG93bicpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGdlc3R1cmUgaW4gU3R1ZGlvLmdlc3R1cmVzT2JzZXJ2ZWQpIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmUpIHtcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi1sZWZ0Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXAnOlxuICAgICAgICBjYWxsSGFuZGxlcignd2hlbi11cCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tcmlnaHQnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgY2FsbEhhbmRsZXIoJ3doZW4tZG93bicpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKDAgPT09IFN0dWRpby5nZXN0dXJlc09ic2VydmVkW2dlc3R1cmVdLS0pIHtcbiAgICAgIGRlbGV0ZSBTdHVkaW8uZ2VzdHVyZXNPYnNlcnZlZFtnZXN0dXJlXTtcbiAgICB9XG4gIH1cblxuICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuLWxlZnQnKTtcbiAgU3R1ZGlvLmV4ZWN1dGVRdWV1ZSgnd2hlbi11cCcpO1xuICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuLXJpZ2h0Jyk7XG4gIFN0dWRpby5leGVjdXRlUXVldWUoJ3doZW4tZG93bicpO1xuKi9cblxuICBpZiAodGhpcy5KU0ludGVycHJldGVyKSB7XG4gICAgdGhpcy5KU0ludGVycHJldGVyLmV4ZWN1dGVJbnRlcnByZXRlcih0aGlzLnRpY2tDb3VudCA9PT0gMSk7XG4gIH1cblxuLypcbiAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgaWYgKCFTdHVkaW8uc3VjY2VlZGVkVGltZSAmJiBjaGVja0ZpbmlzaGVkKCkpIHtcbiAgICBTdHVkaW8uc3VjY2VlZGVkVGltZSA9IGN1cnJlbnRUaW1lO1xuICB9XG5cbiAgaWYgKCFhbmltYXRpb25Pbmx5RnJhbWUpIHtcbiAgICBTdHVkaW8uZXhlY3V0ZVF1ZXVlKCd3aGVuVG91Y2hHb2FsJyk7XG4gIH1cblxuICBpZiAoU3R1ZGlvLnN1Y2NlZWRlZFRpbWUgJiZcbiAgICAgICFzcHJpdGVzTmVlZE1vcmVBbmltYXRpb25GcmFtZXMgJiZcbiAgICAgICghbGV2ZWwuZGVsYXlDb21wbGV0aW9uIHx8IGN1cnJlbnRUaW1lID4gU3R1ZGlvLnN1Y2NlZWRlZFRpbWUgKyBsZXZlbC5kZWxheUNvbXBsZXRpb24pKSB7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxuXG4gIC8vIFdlIHdhbnQgdG8gbWFrZSBzdXJlIGFueSBxdWV1ZWQgZXZlbnQgY29kZSByZWxhdGVkIHRvIGFsbCBnb2FscyBiZWluZyB2aXNpdGVkIGlzIGV4ZWN1dGVkXG4gIC8vIGJlZm9yZSB3ZSBldmFsdWF0ZSBjb25kaXRpb25zIHJlbGF0ZWQgdG8gdGhpcyBldmVudC4gIEZvciBleGFtcGxlLCBpZiBzY29yZSBpcyBpbmNyZW1lbnRlZFxuICAvLyBhcyBhIHJlc3VsdCBvZiBhbGwgZ29hbHMgYmVpbmcgdmlzaXRlZCwgcmVjb3JkaW5nIGFsbEdvYWxzVmlzaXRlZCBoZXJlIGFsbG93cyB0aGUgc2NvcmVcbiAgLy8gdG8gYmUgaW5jcmVtZW50ZWQgYmVmb3JlIHdlIGNoZWNrIGZvciBhIGNvbXBsZXRpb24gY29uZGl0aW9uIHRoYXQgbG9va3MgZm9yIGJvdGggYWxsXG4gIC8vIGdvYWxzIHZpc2l0ZWQsIGFuZCB0aGUgaW5jcmVtZW50ZWQgc2NvcmUsIG9uIHRoZSBuZXh0IHRpY2suXG4gIGlmIChTdHVkaW8uYWxsR29hbHNWaXNpdGVkKCkpIHtcbiAgICBTdHVkaW8udHJhY2tlZEJlaGF2aW9yLmFsbEdvYWxzVmlzaXRlZCA9IHRydWU7XG4gIH1cblxuICAvLyBBbmQgd2UgZG9uJ3Qgd2FudCBhIHRpbWVvdXQgdG8gYmUgdXNlZCBpbiBldmFsdWF0aW5nIGNvbmRpdGlvbnMgYmVmb3JlIHRoZSBhbGwgZ29hbHMgdmlzaXRlZFxuICAvLyBldmVudHMgYXJlIHByb2Nlc3NlZCAoYXMgZGVzY3JpYmVkIGFib3ZlKSwgc28gYWxzbyByZWNvcmQgdGhhdCBoZXJlLiAgVGhpcyBpcyBwYXJ0aWN1bGFybHlcbiAgLy8gcmVsZXZhbnQgdG8gbGV2ZWxzIHdoaWNoIFwidGltZSBvdXRcIiBpbW1lZGlhdGVseSB3aGVuIGFsbCB3aGVuX3J1biBjb2RlIGlzIGNvbXBsZXRlLlxuICBpZiAoU3R1ZGlvLnRpbWVkT3V0KCkpIHtcbiAgICBTdHVkaW8udHJhY2tlZEJlaGF2aW9yLnRpbWVkT3V0ID0gdHJ1ZTtcbiAgfVxuKi9cbn07XG5cbkdhbWVMYWIucHJvdG90eXBlLmhhbmRsZUV4ZWN1dGlvbkVycm9yID0gZnVuY3Rpb24gKGVyciwgbGluZU51bWJlcikge1xuLypcbiAgaWYgKCFsaW5lTnVtYmVyICYmIGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgLy8gc3ludGF4IGVycm9ycyBjYW1lIGJlZm9yZSBleGVjdXRpb24gKGR1cmluZyBwYXJzaW5nKSwgc28gd2UgbmVlZFxuICAgIC8vIHRvIGRldGVybWluZSB0aGUgcHJvcGVyIGxpbmUgbnVtYmVyIGJ5IGxvb2tpbmcgYXQgdGhlIGV4Y2VwdGlvblxuICAgIGxpbmVOdW1iZXIgPSBlcnIubG9jLmxpbmU7XG4gICAgLy8gTm93IHNlbGVjdCB0aGlzIGxvY2F0aW9uIGluIHRoZSBlZGl0b3IsIHNpbmNlIHdlIGtub3cgd2UgZGlkbid0IGhpdFxuICAgIC8vIHRoaXMgd2hpbGUgZXhlY3V0aW5nIChpbiB3aGljaCBjYXNlLCBpdCB3b3VsZCBhbHJlYWR5IGhhdmUgYmVlbiBzZWxlY3RlZClcblxuICAgIGNvZGVnZW4uc2VsZWN0RWRpdG9yUm93Q29sRXJyb3Ioc3R1ZGlvQXBwLmVkaXRvciwgbGluZU51bWJlciAtIDEsIGVyci5sb2MuY29sdW1uKTtcbiAgfVxuICBpZiAoU3R1ZGlvLkpTSW50ZXJwcmV0ZXIpIHtcbiAgICAvLyBTZWxlY3QgY29kZSB0aGF0IGp1c3QgZXhlY3V0ZWQ6XG4gICAgU3R1ZGlvLkpTSW50ZXJwcmV0ZXIuc2VsZWN0Q3VycmVudENvZGUoXCJhY2VfZXJyb3JcIik7XG4gICAgLy8gR3JhYiBsaW5lIG51bWJlciBpZiB3ZSBkb24ndCBoYXZlIG9uZSBhbHJlYWR5OlxuICAgIGlmICghbGluZU51bWJlcikge1xuICAgICAgbGluZU51bWJlciA9IDEgKyBTdHVkaW8uSlNJbnRlcnByZXRlci5nZXROZWFyZXN0VXNlckNvZGVMaW5lKCk7XG4gICAgfVxuICB9XG4gIG91dHB1dEVycm9yKFN0cmluZyhlcnIpLCBFcnJvckxldmVsLkVSUk9SLCBsaW5lTnVtYmVyKTtcbiAgU3R1ZGlvLmV4ZWN1dGlvbkVycm9yID0geyBlcnI6IGVyciwgbGluZU51bWJlcjogbGluZU51bWJlciB9O1xuXG4gIC8vIENhbGwgb25QdXp6bGVDb21wbGV0ZSgpIGlmIHN5bnRheCBlcnJvciBvciBhbnkgdGltZSB3ZSdyZSBub3Qgb24gYSBmcmVlcGxheSBsZXZlbDpcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgLy8gTWFyayBwcmVFeGVjdXRpb25GYWlsdXJlIGFuZCB0ZXN0UmVzdWx0cyBpbW1lZGlhdGVseSBzbyB0aGF0IGFuIGVycm9yXG4gICAgLy8gbWVzc2FnZSBhbHdheXMgYXBwZWFycywgZXZlbiBvbiBmcmVlcGxheTpcbiAgICBTdHVkaW8ucHJlRXhlY3V0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgU3R1ZGlvLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuU1lOVEFYX0VSUk9SX0ZBSUw7XG4gICAgU3R1ZGlvLm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfSBlbHNlIGlmICghbGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBTdHVkaW8ub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG4qL1xuICB0aHJvdyBlcnI7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIGFuIEFQSSBjb21tYW5kLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5leGVjdXRlQ21kID0gZnVuY3Rpb24gKGlkLCBuYW1lLCBvcHRzKSB7XG4gIGNvbnNvbGUubG9nKFwiR2FtZUxhYiBleGVjdXRlQ21kIFwiICsgbmFtZSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSB0aGUgdGFza3MgdG8gYmUgZG9uZSBhZnRlciB0aGUgdXNlciBwcm9ncmFtIGlzIGZpbmlzaGVkLlxuICovXG5HYW1lTGFiLnByb3RvdHlwZS5maW5pc2hFeGVjdXRpb25fID0gZnVuY3Rpb24gKCkge1xuICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS5oaWdobGlnaHRCbG9jayhudWxsKTtcbiAgfVxuICB0aGlzLmNoZWNrQW5zd2VyKCk7XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiB0aGlzLnN0dWRpb0FwcF8uZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuZGlzcGxheUZlZWRiYWNrXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV2ZWwgPSB0aGlzLmxldmVsO1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5kaXNwbGF5RmVlZGJhY2soe1xuICAgIGFwcDogJ2dhbWVsYWInLFxuICAgIHNraW46IHRoaXMuc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgIHJlc3BvbnNlOiB0aGlzLnJlc3BvbnNlLFxuICAgIGxldmVsOiBsZXZlbCxcbiAgICAvLyBmZWVkYmFja0ltYWdlOiBmZWVkYmFja0ltYWdlQ2FudmFzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIiksXG4gICAgLy8gYWRkICdpbXByZXNzaXZlJzp0cnVlIHRvIG5vbi1mcmVlcGxheSBsZXZlbHMgdGhhdCB3ZSBkZWVtIGFyZSByZWxhdGl2ZWx5IGltcHJlc3NpdmUgKHNlZSAjNjY5OTA0ODApXG4gICAgc2hvd2luZ1NoYXJpbmc6ICFsZXZlbC5kaXNhYmxlU2hhcmluZyAmJiAobGV2ZWwuZnJlZVBsYXkgLyogfHwgbGV2ZWwuaW1wcmVzc2l2ZSAqLyksXG4gICAgLy8gaW1wcmVzc2l2ZSBsZXZlbHMgYXJlIGFscmVhZHkgc2F2ZWRcbiAgICAvLyBhbHJlYWR5U2F2ZWQ6IGxldmVsLmltcHJlc3NpdmUsXG4gICAgLy8gYWxsb3cgdXNlcnMgdG8gc2F2ZSBmcmVlcGxheSBsZXZlbHMgdG8gdGhlaXIgZ2FsbGVyeSAoaW1wcmVzc2l2ZSBub24tZnJlZXBsYXkgbGV2ZWxzIGFyZSBhdXRvc2F2ZWQpXG4gICAgc2F2ZVRvR2FsbGVyeVVybDogbGV2ZWwuZnJlZVBsYXkgJiYgdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnNhdmVfdG9fZ2FsbGVyeV91cmwsXG4gICAgYXBwU3RyaW5nczoge1xuICAgICAgcmVpbmZGZWVkYmFja01zZzogbXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgIHNoYXJpbmdUZXh0OiBtc2cuc2hhcmVEcmF3aW5nKClcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgLy8gRGlzYWJsZSB0aGUgcnVuIGJ1dHRvbiB1bnRpbCBvblJlcG9ydENvbXBsZXRlIGlzIGNhbGxlZC5cbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgcnVuQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuZGlzcGxheUZlZWRiYWNrXygpO1xufTtcblxuLyoqXG4gKiBWZXJpZnkgaWYgdGhlIGFuc3dlciBpcyBjb3JyZWN0LlxuICogSWYgc28sIG1vdmUgb24gdG8gbmV4dCBsZXZlbC5cbiAqL1xuR2FtZUxhYi5wcm90b3R5cGUuY2hlY2tBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxldmVsID0gdGhpcy5sZXZlbDtcblxuICAvLyBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXkgbGV2ZWwsIG9yIHRoZSBsZXZlbCBoYXNcbiAgLy8gYmVlbiBjb21wbGV0ZWRcbiAgdmFyIGxldmVsQ29tcGxldGUgPSBsZXZlbC5mcmVlUGxheSAmJiAoIWxldmVsLmVkaXRDb2RlIHx8ICF0aGlzLmV4ZWN1dGlvbkVycm9yKTtcbiAgdGhpcy50ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgcmV1c2UgYW4gb2xkIG1lc3NhZ2UsIHNpbmNlIG5vdCBhbGwgcGF0aHMgc2V0IG9uZS5cbiAgdGhpcy5tZXNzYWdlID0gdW5kZWZpbmVkO1xuXG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSB0aGlzLnN0dWRpb0FwcF8uZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBJZiB0aGUgY3VycmVudCBsZXZlbCBpcyBhIGZyZWUgcGxheSwgYWx3YXlzIHJldHVybiB0aGUgZnJlZSBwbGF5XG4gIC8vIHJlc3VsdCB0eXBlXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHRoaXMudGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9XG5cbiAgLy8gUGxheSBzb3VuZFxuICB0aGlzLnN0dWRpb0FwcF8uc3RvcExvb3BpbmdBdWRpbygnc3RhcnQnKTtcbiAgaWYgKHRoaXMudGVzdFJlc3VsdHMgPT09IHRoaXMuc3R1ZGlvQXBwXy5UZXN0UmVzdWx0cy5GUkVFX1BMQVkgfHxcbiAgICAgIHRoaXMudGVzdFJlc3VsdHMgPj0gdGhpcy5zdHVkaW9BcHBfLlRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHJlcG9ydERhdGEgPSB7XG4gICAgYXBwOiAnZ2FtZWxhYicsXG4gICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgIGJ1aWxkZXI6IGxldmVsLmJ1aWxkZXIsXG4gICAgcmVzdWx0OiBsZXZlbENvbXBsZXRlLFxuICAgIHRlc3RSZXN1bHQ6IHRoaXMudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IF8uYmluZCh0aGlzLm9uUmVwb3J0Q29tcGxldGUsIHRoaXMpLFxuICAgIC8vIHNhdmVfdG9fZ2FsbGVyeTogbGV2ZWwuaW1wcmVzc2l2ZVxuICB9O1xuXG4gIHRoaXMuc3R1ZGlvQXBwXy5yZXBvcnQocmVwb3J0RGF0YSk7XG5cbiAgaWYgKHRoaXMuc3R1ZGlvQXBwXy5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIFRoZSBjYWxsIHRvIGRpc3BsYXlGZWVkYmFjaygpIHdpbGwgaGFwcGVuIGxhdGVyIGluIG9uUmVwb3J0Q29tcGxldGUoKVxufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB0YiA9IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveDtcbnZhciBibG9ja09mVHlwZSA9IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGU7XG52YXIgY3JlYXRlQ2F0ZWdvcnkgPSBibG9ja1V0aWxzLmNyZWF0ZUNhdGVnb3J5O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xudmFyIGxldmVscyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIEJhc2UgY29uZmlnIGZvciBsZXZlbHMgY3JlYXRlZCB2aWEgbGV2ZWxidWlsZGVyXG5sZXZlbHMuY3VzdG9tID0ge1xuICBpZGVhbDogSW5maW5pdHksXG4gIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc3RhcnRCbG9ja3M6ICcnXG59O1xuXG5sZXZlbHMuc2FuZGJveCA9ICB7XG4gIGlkZWFsOiBJbmZpbml0eSxcbiAgcmVxdWlyZWRCbG9ja3M6IFtcbiAgXSxcbiAgc2NhbGU6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgc29mdEJ1dHRvbnM6IFtcbiAgICAnbGVmdEJ1dHRvbicsXG4gICAgJ3JpZ2h0QnV0dG9uJyxcbiAgICAnZG93bkJ1dHRvbicsXG4gICAgJ3VwQnV0dG9uJ1xuICBdLFxuICBmcmVlUGxheTogdHJ1ZSxcbiAgdG9vbGJveDpcbiAgICB0YihibG9ja09mVHlwZSgnZ2FtZWxhYl9mb28nKSksXG4gIHN0YXJ0QmxvY2tzOlxuICAgJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xufTtcblxubGV2ZWxzLmVjX3NhbmRib3ggPSB1dGlscy5leHRlbmQobGV2ZWxzLnNhbmRib3gsIHtcbiAgZWRpdENvZGU6IHRydWUsXG4gIGNvZGVGdW5jdGlvbnM6IHtcbiAgICAvLyBHYW1lIExhYlxuICAgIFwiZm9vXCI6IG51bGwsXG4gIH0sXG4gIHN0YXJ0QmxvY2tzOiBcIlwiLFxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsyOyAvKiBHYW1lTGFiICovIDsgYnVmLnB1c2goJ1xcblxcbicpOzQ7IGlmIChmaW5pc2hCdXR0b24pIHsgOyBidWYucHVzaCgnXFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDcsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg3LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuJyk7MTA7IH0gOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGlKYXZhc2NyaXB0LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzLmJsb2NrcyA9IFtcbiAge2Z1bmM6ICdmb28nLCBwYXJlbnQ6IGFwaSwgY2F0ZWdvcnk6ICcnIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnJzoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gICdHYW1lIExhYic6IHtcbiAgICBjb2xvcjogJ3JlZCcsXG4gICAgYmxvY2tzOiBbXVxuICB9LFxuICBDb21tYW5kczoge1xuICAgIGNvbG9yOiAncmVkJyxcbiAgICBibG9ja3M6IFtdXG4gIH0sXG4gIEV2ZW50czoge1xuICAgIGNvbG9yOiAnZ3JlZW4nLFxuICAgIGJsb2NrczogW11cbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzLmF1dG9jb21wbGV0ZUZ1bmN0aW9uc1dpdGhQYXJlbnMgPSB0cnVlO1xubW9kdWxlLmV4cG9ydHMuc2hvd1BhcmFtRHJvcGRvd25zID0gdHJ1ZTtcbiIsIi8vIGxvY2FsZSBmb3IgZ2FtZWxhYlxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5nYW1lbGFiX2xvY2FsZTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOzI7IC8qIEdhbWVMYWIgKi8gOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg2LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMiwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG5cXG4nKTsxOTsgaWYgKGZpbmlzaEJ1dHRvbikgeyA7IGJ1Zi5wdXNoKCdcXG4gIDxkaXYgaWQ9XCJzaGFyZS1jZWxsXCIgY2xhc3M9XCJzaGFyZS1jZWxsLW5vbmVcIj5cXG4gICAgPGJ1dHRvbiBpZD1cImZpbmlzaEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMjIsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCgyMiwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgICA8L2J1dHRvbj5cXG4gIDwvZGl2PlxcbicpOzI1OyB9IDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBHYW1lTGFiO1xuXG4vLyBBUEkgZGVmaW5pdGlvbnMgZm9yIGZ1bmN0aW9ucyBleHBvc2VkIGZvciBKYXZhU2NyaXB0IChkcm9wbGV0L2FjZSkgbGV2ZWxzOlxuZXhwb3J0cy5pbmplY3RHYW1lTGFiID0gZnVuY3Rpb24gKGdhbWVsYWIpIHtcbiAgR2FtZUxhYiA9IGdhbWVsYWI7XG59O1xuXG5leHBvcnRzLmZvbyA9IGZ1bmN0aW9uICgpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKG51bGwsICdmb28nKTtcbn07XG4iLCJ2YXIgR2FtZUxhYjtcblxuLy8gQVBJIGRlZmluaXRpb25zIGZvciBmdW5jdGlvbnMgZXhwb3NlZCBmb3IgSmF2YVNjcmlwdCAoZHJvcGxldC9hY2UpIGxldmVsczpcbmV4cG9ydHMuaW5qZWN0R2FtZUxhYiA9IGZ1bmN0aW9uIChnYW1lbGFiKSB7XG4gIEdhbWVMYWIgPSBnYW1lbGFiO1xufTtcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5mb28gPSBmdW5jdGlvbiAoaWQpIHtcbiAgR2FtZUxhYi5leGVjdXRlQ21kKGlkLCAnZm9vJyk7XG59O1xuIl19
