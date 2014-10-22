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
  'stepSpeed': 1
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

// session is an instance of Ace editSession
// Usage
// var lengthArray = calculateCumulativeLength(editor.getSession());
// Need to call this only if the document is updated after the last call.
function aceCalculateCumulativeLength(session) {
  var cumLength = [];
  var cnt = session.getLength();
  var cuml = 0, nlLength = session.getDocument().getNewLineCharacter().length;
  cumLength.push(cuml);
  var text = session.getLines(0, cnt);
  for (var i = 0; i < cnt; i++) {
    cuml += text[i].length + nlLength;
    cumLength.push(cuml);
  }
  return cumLength;
}

// Fast binary search implementation
// Pass the cumulative length array here.
// Usage
// var row = findRow(lengthArray, 0, lengthArray.length, 2512);
// tries to find 2512th character lies in which row.
function aceFindRow(cumLength, rows, rowe, pos) {
  if (rows > rowe) {
    return null;
  }
  if (rows + 1 === rowe) {
    return rows;
  }

  var mid = Math.floor((rows + rowe) / 2);
  
  if (pos < cumLength[mid]) {
    return aceFindRow(cumLength, rows, mid, pos);
  } else if(pos > cumLength[mid]) {
    return aceFindRow(cumLength, mid, rowe, pos);
  }
  return mid;
}

function createSelection(type, start, end) {
  // console.log("createSelection: type " + type + ", start " + start + ", end " + end);
  var selection = BlocklyApps.editor.aceEditor.getSelection();
  var range = selection.getRange();

  range.start.row = aceFindRow(Webapp.cumLength, 0, Webapp.cumLength.length, start);
  range.start.col = start - Webapp.cumLength[range.start.row];
  range.end.row = aceFindRow(Webapp.cumLength, 0, Webapp.cumLength.length, end);
  range.end.col = end - Webapp.cumLength[range.end.row];

  selection.setSelectionRange(range);
}

Webapp.onTick = function() {
  Webapp.tickCount++;

  if (Webapp.interpreter) {
    if (!BlocklyApps.editor.currentlyUsingBlocks && Webapp.interpreter.stateStack[0]) {
      // If we are showing Javascript code in the ace editor, highlight
      // the code being executed in each step:
      
      var node = Webapp.interpreter.stateStack[0].node;
      // Adjust start/end by Webapp.userCodeStartOffset since the code running
      // has been expanded vs. what the user sees in the editor window:
      var start = node.start - Webapp.userCodeStartOffset;
      var end = node.end - Webapp.userCodeStartOffset;
      var type = node.type;

      // Only show selection if the node being executed is inside the user's
      // code (not inside code we inserted before or after their code that is
      // not visible in the editor):
      if ((start > 0) && (start < Webapp.userCodeLength)) {
        createSelection(type, start, end);
      } else {
        BlocklyApps.editor.aceEditor.getSelection().clearSelection();
      }
    }
    Webapp.interpreter.step();
  } else {
    if (Webapp.tickCount === 1) {
      try { Webapp.whenRunFunc(BlocklyApps, api, Webapp.Globals); } catch (e) { }
    }
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

  while (divWebapp.firstChild) {
    divWebapp.removeChild(divWebapp.firstChild);
  }

  // Clone and replace divWebapp (this removes all attached event listeners):
  var newDivWebapp = divWebapp.cloneNode(true);
  divWebapp.parentNode.replaceChild(newDivWebapp, divWebapp);

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Webapp.Globals = {};
  Webapp.eventQueue = [];
  Webapp.interpreter = null;
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
  // TODO: handle editCode JS interpreter
  try { codegen.evalWith(code, {
                         codeFunctions: level.codeFunctions,
                         BlocklyApps: BlocklyApps,
                         Studio: api,
                         Globals: Webapp.Globals } ); } catch (e) { }
};

/**
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
var nativeGetCallback = function () {
  return Webapp.eventQueue.shift();
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

  // Set event handlers and start the onTick timer

  var codeWhenRun;
  if (level.editCode) {
    codeWhenRun = utils.generateCodeAliases(level.codeFunctions, 'Webapp');
    Webapp.userCodeStartOffset = codeWhenRun.length;
    codeWhenRun += BlocklyApps.editor.getValue();
    Webapp.userCodeLength = codeWhenRun.length - Webapp.userCodeStartOffset;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += 'while (true) { var obj = getCallback(); ' +
      'if (obj) { obj.fn.apply(null, obj.arguments ? obj.arguments : null); }}';
    var session = BlocklyApps.editor.aceEditor.getSession();
    Webapp.cumLength = aceCalculateCumulativeLength(session);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Webapp.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');

    var blocks = Blockly.mainWorkspace.getTopBlocks();
    for (var x = 0; blocks[x]; x++) {
      var block = blocks[x];
      if (block.type === 'when_run') {
        codeWhenRun = Blockly.Generator.blocksToCode('JavaScript', [ block ]);
        break;
      }
    }
  }
  if (codeWhenRun) {
    if (level.editCode) {
      // Use JS interpreter on editCode levels
      var initFunc = function(interpreter, scope) {
        codegen.initJSInterpreter(interpreter, scope, {
                                          BlocklyApps: BlocklyApps,
                                          Webapp: api,
                                          Globals: Webapp.Globals } );

        function makeNativeMemberFunction(nativeFunc, parentObj) {
          return function() {
            // Call the native function:
            var retVal = nativeFunc.apply(parentObj, arguments);

            // Now figure out what to do with the return value...

            if (retVal instanceof Function) {
              // Don't call createPrimitive() for functions
              return retVal;
            } else if (retVal instanceof Object) {
              var newObj = interpreter.createObject(interpreter.OBJECT);
              // Limited attempt to marshal back complex return values
              // Special case: only one-level deep, only handling
              // primitives and arrays of primitives
              for (var prop in retVal) {
                var isFuncOrObj = retVal[prop] instanceof Function ||
                                  retVal[prop] instanceof Object;
                // replace properties with wrapped properties
                if (retVal[prop] instanceof Array) {
                  var newArray = interpreter.createObject(interpreter.ARRAY);
                  for (var i = 0; i < retVal[prop].length; i++) {
                    newArray.properties[i] = interpreter.createPrimitive(retVal[prop][i]);
                  }
                  newArray.length = retVal[prop].length;
                  interpreter.setProperty(newObj, prop, newArray);
                } else if (isFuncOrObj) {
                  // skipping over these - they could be objects that should
                  // be converted into interpreter objects. they could be native
                  // functions that should be converted. Or they could be objects
                  // that are already interpreter objects, which is what we assume
                  // for now:
                  interpreter.setProperty(newObj, prop, retVal[prop]);
                } else {
                  // wrap as a primitive if it is not a function or object:
                  interpreter.setProperty(newObj, prop, interpreter.createPrimitive(retVal[prop]));
                }
              }
              return newObj;
            } else {
              return interpreter.createPrimitive(retVal);
            }
          };
        }

        var getCallbackObj = interpreter.createObject(interpreter.FUNCTION);
        var wrapper = makeNativeMemberFunction(nativeGetCallback, null);
        interpreter.setProperty(scope,
                                'getCallback',
                                interpreter.createNativeFunction(wrapper));
      };
      Webapp.interpreter = new window.Interpreter(codeWhenRun, initFunc);
    } else {
      Webapp.whenRunFunc = codegen.functionFromCode(codeWhenRun, {
                                          BlocklyApps: BlocklyApps,
                                          Webapp: api,
                                          Globals: Webapp.Globals } );
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
  return Webapp.callCmd(cmd);
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
  var retVal = true;
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
      retVal = Webapp.turnBlack(cmd.opts);
      break;
    case 'createHtmlBlock':
      BlocklyApps.highlight(cmd.id);
      retVal = Webapp.createHtmlBlock(cmd.opts);
      break;
    case 'attachEventHandler':
      BlocklyApps.highlight(cmd.id);
      retVal = Webapp.attachEventHandler(cmd.opts);
      break;
  }
  return retVal;
};

Webapp.turnBlack = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  // sample
  divWebapp.style.backgroundColor = 'black';

  return true;
};

Webapp.createHtmlBlock = function (opts) {
  var divWebapp = document.getElementById('divWebapp');

  var newDiv = document.createElement("div");
  newDiv.id = opts.elementId;
  newDiv.innerHTML = opts.html;

  divWebapp.appendChild(newDiv);

  return newDiv;
};

/**
 * @param scope Object :  The scope in which to execute the delegated function.
 * @param func Function : The function to execute
 * @param data Object or Array : The data to pass to the function. If the function is also passed arguments, the data is appended to the arguments list. If the data is an Array, each item is appended as a new argument.
 */
var delegate = function(scope, func, data)
{
  return function()
  {
    var args = Array.prototype.slice.apply(arguments).concat(data);
    func.apply(scope, args);
  };
};

Webapp.onEventFired = function (e, opts) {
  Webapp.eventQueue.push({'fn': opts.func});
};

Webapp.attachEventHandler = function (opts) {
  // For now, we're not tracking how many of these we add and we don't allow
  // the user to detach the handler. We detach all listeners by cloning the
  // divWebapp DOM node inside of reset()
  document.getElementById(opts.elementId).addEventListener(
      opts.eventName,
      delegate(this, Webapp.onEventFired, opts));
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
