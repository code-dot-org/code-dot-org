/**
 * CodeOrgApp: Webapp
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var BlocklyApps = require('../base');
var commonMsg = require('../../locale/current/common');
var webappMsg = require('../../locale/current/webapp');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var _ = utils.getLodash();

/**
 * Create a namespace for the application.
 */
var Webapp = module.exports;

var level;
var skin;

//TODO: Make configurable.
BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;

//The number of blocks to show as feedback.
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

// Default Scalings
Webapp.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var twitterOptions = {
  text: webappMsg.shareWebappTwitter(),
  hashtag: "WebappCode"
};

function loadLevel() {
  Webapp.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Webapp.minWorkspaceHeight = level.minWorkspaceHeight;
  Webapp.softButtons_ = level.softButtons || {};

  // Override scalars.
  for (var key in level.scale) {
    Webapp.scale[key] = level.scale[key];
  }
}

var drawDiv = function () {
  var divWebapp = document.getElementById('divWebapp');
  var divWidth = parseInt(window.getComputedStyle(divWebapp).width, 10);

  // TODO: one-time initial drawing

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = divWidth + 'px';
};

Webapp.onTick = function() {
  Webapp.tickCount++;

  if (Webapp.tickCount === 1) {
    try { Webapp.whenRunFunc(BlocklyApps, api, Webapp.Globals); } catch (e) { }
  }

  if (checkFinished()) {
    Webapp.onPuzzleComplete();
  }
};

/**
 * Initialize Blockly and Webapp for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Webapp.initReadonly = function(config) {
  // Do some minimal level loading so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;
  loadLevel();

  // Webapp.initMinimal();

  BlocklyApps.initReadonly(config);
};

/**
 * Initialize Blockly and the Webapp app.  Called on page load.
 */
Webapp.init = function(config) {
  Webapp.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  loadLevel();

  var finishButtonFirstLine = _.isEmpty(level.softButtons);
  var firstControlsRow = require('./controls.html')({assetUrl: BlocklyApps.assetUrl, finishButton: finishButtonFirstLine});
  var extraControlsRow = require('./extraControlRows.html')({assetUrl: BlocklyApps.assetUrl, finishButton: !finishButtonFirstLine});

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      blockCounterClass: 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    Blockly.SNAP_RADIUS *= Webapp.scale.snapRadius;

    drawDiv();
  };

  config.getDisplayWidth = function() {
    var el = document.getElementById('visualizationColumn');
    return el.getBoundingClientRect().width;
  };

  // arrangeStartBlocks(config);

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = webappMsg.makeYourOwn();
  config.makeUrl = "http://code.org/webapp";
  config.makeImage = BlocklyApps.assetUrl('media/promo.png');

  config.enableShowCode = false;
  config.varsInGlobals = true;

  // Webapp.initMinimal();

  BlocklyApps.init(config);

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Webapp.onPuzzleComplete);
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Webapp.clearEventHandlersKillTickLoop = function() {
  Webapp.whenRunFunc = null;
  if (Webapp.intervalId) {
    window.clearInterval(Webapp.intervalId);
  }
  Webapp.tickCount = 0;
  Webapp.intervalId = 0;
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
BlocklyApps.reset = function(first) {
  var i;
  Webapp.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Webapp.softButtons_.length; i++) {
    document.getElementById(Webapp.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  // Reset configurable variables
  var divWebapp = document.getElementById('divWebapp');
  divWebapp.style.backgroundColor = 'white';

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Webapp.Globals = {};
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
BlocklyApps.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainWorkspace.traceOn(true);
  BlocklyApps.reset(false);
  BlocklyApps.attempts++;
  Webapp.execute();

  if (level.freePlay) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
  }
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Webapp.waitingForReport) {
    BlocklyApps.displayFeedback({
      app: 'webapp', //XXX
      skin: skin.id,
      feedbackType: Webapp.testResults,
      response: Webapp.response,
      level: level,
      showingSharing: level.freePlay,
      feedbackImage: Webapp.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Webapp.response.save_to_gallery_url,
      appStrings: {
        reinfFeedbackMsg: webappMsg.reinfFeedbackMsg(),
        sharingText: webappMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Webapp.onReportComplete = function(response) {
  Webapp.response = response;
  Webapp.waitingForReport = false;
  displayFeedback();
};

//
// Generates code with user-generated function definitions and evals that code
// so these can be called from event handlers. This should be called for each
// block type that defines functions.
//

var defineProcedures = function (blockType) {
  var code = Blockly.Generator.workspaceToCode('JavaScript', blockType);
  try { codegen.evalWith(code, {
                         BlocklyApps: BlocklyApps,
                         Studio: api,
                         Globals: Webapp.Globals } ); } catch (e) { }
};

/**
 * Execute the app
 */
Webapp.execute = function() {
  Webapp.result = BlocklyApps.ResultType.UNSET;
  Webapp.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Webapp.waitingForReport = false;
  Webapp.response = null;
  var i;

  BlocklyApps.playAudio('start');

  BlocklyApps.reset(false);

  // Define any top-level procedures the user may have created
  // (must be after reset(), which resets the Webapp.Globals namespace)
  defineProcedures('procedures_defreturn');
  defineProcedures('procedures_defnoreturn');

  // Set event handlers and start the onTick timer
  var blocks = Blockly.mainWorkspace.getTopBlocks();
  for (var x = 0; blocks[x]; x++) {
    var block = blocks[x];
    if (block.type === 'when_run') {
      var code = Blockly.Generator.blocksToCode('JavaScript', [ block ]);
      if (level.editCode) {
        code = utils.generateCodeAliases(level.codeFunctions);
        code += BlocklyApps.editor.getValue();
      }
      if (code) {
        Webapp.whenRunFunc = codegen.functionFromCode(code, {
                                            BlocklyApps: BlocklyApps,
                                            Webapp: api,
                                            Globals: Webapp.Globals } );
      }
    }
  }

  Webapp.intervalId = window.setInterval(Webapp.onTick, Webapp.scale.stepSpeed);
};

Webapp.feedbackImage = '';
Webapp.encodedFeedbackImage = '';

Webapp.onPuzzleComplete = function() {
  if (level.freePlay) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
  }

  // Stop everything on screen
  Webapp.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Webapp.result === BlocklyApps.ResultType.SUCCESS);

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Webapp.testResults = BlocklyApps.TestResults.FREE_PLAY;
  } else {
    Webapp.testResults = BlocklyApps.getTestResults(levelComplete);
  }

  if (Webapp.testResults >= BlocklyApps.TestResults.FREE_PLAY) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  if (level.editCode) {
    Webapp.testResults = levelComplete ?
      BlocklyApps.TestResults.ALL_PASS :
      BlocklyApps.TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Webapp.waitingForReport = true;

  var sendReport = function() {
    BlocklyApps.report({
      app: 'webapp',
      level: level.id,
      result: Webapp.result === BlocklyApps.ResultType.SUCCESS,
      testResult: Webapp.testResults,
      program: encodeURIComponent(textBlocks),
      image: Webapp.encodedFeedbackImage,
      onComplete: Webapp.onReportComplete
    });
  };

  if (typeof document.getElementById('divWebapp').toDataURL === 'undefined') { // don't try it if function is not defined
    sendReport();
  } else {
    document.getElementById('divWebapp').toDataURL("image/png", {
      callback: function(pngDataUrl) {
        Webapp.feedbackImage = pngDataUrl;
        Webapp.encodedFeedbackImage = encodeURIComponent(Webapp.feedbackImage.split(',')[1]);
        
        sendReport();
      }
    });
  }
};

Webapp.executeCmd = function (id, name, opts) {
  var cmd = {
    'id': id,
    'name': name,
    'opts': opts
  };
  Webapp.callCmd(cmd);
};

//
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Webapp.callCmd = function (cmd) {
  switch (cmd.name) {
    /* 
    case 'wait':
      if (!cmd.opts.started) {
        BlocklyApps.highlight(cmd.id);
      }
      return Studio.wait(cmd.opts);
    */
    case 'turnBlack':
      BlocklyApps.highlight(cmd.id);
      Webapp.turnBlack(cmd.opts);
      break;
  }
  return true;
};

Webapp.turnBlack = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  // sample
  divWebapp.style.backgroundColor = 'black';
};

/*
var onWaitComplete = function (opts) {
  if (!opts.complete) {
    if (opts.waitCallback) {
      opts.waitCallback();
    }
    opts.complete = true;
  }
};

Studio.wait = function (opts) {
  if (!opts.started) {
    opts.started = true;

    // opts.value is the number of milliseconds to wait - or 'click' which means
    // "wait for click"
    if ('click' === opts.value) {
      opts.waitForClick = true;
    } else {
      opts.waitTimeout = window.setTimeout(
        delegate(this, onWaitComplete, opts),
        opts.value);
    }
  }

  return opts.complete;
};
*/

Webapp.timedOut = function() {
  return Webapp.tickCount > Webapp.timeoutFailureTick;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Webapp.result = BlocklyApps.ResultType.FAILURE;
    return true;
  }

  /*
  if (Webapp.allGoalsVisited()) {
    Webapp.result = BlocklyApps.ResultType.SUCCESS;
    return true;
  }
  */

  if (Webapp.timedOut()) {
    Webapp.result = BlocklyApps.ResultType.FAILURE;
    return true;
  }

  return false;
};
