/**
 * Blockly Demo: Calc Graphics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var Calc = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Calc = module.exports;
var commonMsg = require('../../locale/current/common');
var calcMsg = require('../../locale/current/calc');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');

var Expression = require('./expression');
var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

/**
 * PID of animation task currently executing.
 */
Calc.pid = 0;

/**
 * Initialize Blockly and the Calc.  Called on page load.
 */
Calc.init = function(config) {

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.insertWhenRun = false;

  // Enable blockly param editing in levelbuilder, regardless of level setting
  if (config.level.edit_blocks) {
    config.disableParamEditing = false;
  }

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    // Add to reserved word list: API, local variables in execution evironment
    // (execute) and the infinite loop detection function.
    //XXX Not sure if this is still right.
    Blockly.JavaScript.addReservedWords('Calc,code');

    // Helper for creating canvas elements.
    var createCanvas = function(id, width, height) {
      var el = document.createElement('canvas');
      el.id = id;
      el.width = width;
      el.height = height;
      return el;
    };

    // Create display canvas.
    var display = createCanvas('display', 400, 400);
    var visualization = document.getElementById('visualization');
    visualization.appendChild(display);
    Calc.ctxDisplay = display.getContext('2d');

    // todo - draw target function

    // todo - figure out LB story

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
  };

  config.getDisplayWidth = function() {
    var el = document.getElementById('visualizationColumn');
    return el.getBoundingClientRect().width;
  };

  BlocklyApps.init(config);
};

/**
 * Reset the Calc to the start position, clear the display, and kill any
 * pending tasks.
 * @param {boolean} ignore Required by the API but ignored by this
 *     implementation.
 */
BlocklyApps.reset = function(ignore) {
  Calc.display();

  // Kill any task.
  if (Calc.pid) {
    window.clearTimeout(Calc.pid);
  }
  Calc.pid = 0;

  // Stop the looping sound.
  // BlocklyApps.stopLoopingAudio('start');
};

/**
 * Copy the scratch canvas to the display canvas. Add a Calc marker.
 */
Calc.display = function() {
  // FF on linux retains drawing of previous location of artist unless we clear
  // the canvas first.
  var style = Calc.ctxDisplay.fillStyle;
  Calc.ctxDisplay.fillStyle = 'white';
  Calc.ctxDisplay.clearRect(0, 0, Calc.ctxDisplay.canvas.width,
    Calc.ctxDisplay.canvas.width);
  Calc.ctxDisplay.fillStyle = style;

  Calc.drawTarget(level.target());
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainWorkspace.traceOn(true);
  BlocklyApps.attempts++;
  Calc.execute();
};

function evalCode (code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Calc: api
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
      if (console && console.log) {
        console.log(e);
      }
    }
  }
}

/**
 * Execute the user's code.  Heaven help us...
 */
Calc.execute = function() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  evalCode(code);

  var expression = Calc.lastExpression;


  // api.log now contains a transcript of all the user's actions.
  // Reset the graphic and animate the transcript.
  BlocklyApps.reset();


  var result = Calc.drawAnswer(level.target(), Calc.lastExpression);

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'turtle',
    level: level.id,
    builder: level.builder,
    result: result,
    testResult: result ? TestResults.ALL_PASS : TestResults.APP_SPECIFIC_FAIL,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);
};

Calc.drawTarget = function (target) {
  Calc.ctxDisplay.fillStyle = 'black';
  Calc.ctxDisplay.font="30px Verdana";
  var str = target.toString();
  Calc.ctxDisplay.fillText(str, 0, 350);
};

Calc.drawAnswer = function (target, answer) {
  var ctx = Calc.ctxDisplay;
  // todo (brent) - should i just have these in one function (i.e. ask for the
  // token list, given an answer and target).
  var diff = Expression.getDiff(answer, target);
  var list = Expression.getTokenList(answer, diff);
  var xpos = 0;
  var ypos = 200;
  for (var i = 0; i < list.length; i++) {
    if (i > 0 && list[i-1].char !== '(' && list[i].char !== ')') {
      ctx.fillText(' ', xpos, ypos);
      xpos += ctx.measureText(' ').width;
    }
    // todo - color based on validity
    ctx.fillStyle = list[i].correct ? 'black' : 'red';
    ctx.fillText(list[i].char, xpos, ypos);
    xpos += ctx.measureText(list[i].char).width;
  }

  return (diff.numDiffs === 0);
};


/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  BlocklyApps.displayFeedback({
    app: 'Calc',
    skin: skin.id,
    // feedbackType: Calc.testResults,
    message: "todo (brent): temp message",
    response: response,
    level: level
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
function onReportComplete(response) {
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  displayFeedback(response);
}


var getFeedbackImage = function() {
  // Copy the user layer
  Calc.ctxFeedback.globalCompositeOperation = 'copy';
  Calc.ctxFeedback.drawImage(Calc.ctxScratch.canvas, 0, 0, 154, 154);
  var feedbackCanvas = Calc.ctxFeedback.canvas;
  return encodeURIComponent(
      feedbackCanvas.toDataURL("image/png").split(',')[1]);
};
