/**
 * Blockly Demo: Voxel Graphics
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

var Voxel = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Voxel = module.exports;
var commonMsg = require('../../locale/current/common');
var voxelMsg = require('../../locale/current/voxel');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var blockUtils = require('../block_utils');

// requiring this loads canvg into the global namespace
require('../canvg/canvg.js');
var canvg = window.canvg || global.canvg;

var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

/**
 * Initialize Blockly and the Voxel.  Called on page load.
 */
Voxel.init = function(config) {

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';
  config.enableShowCode = false;

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({
        assetUrl: BlocklyApps.assetUrl
      }),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    Blockly.BROKEN_CONTROL_POINTS = false; // necessary hack?
    // Add to reserved word list: API, local variables in execution environment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Voxel,code');

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';
    var visualization = document.getElementById('visualization');
    visualization.appendChild(document.getElementById('container'));

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Voxel.resetButtonClick);

    window.game.plugins.get('voxel-reach').on('use', function(target) { Voxel.handleWhenRightClick(target);});
    //window.game.plugins.get('voxel-reach').on('start mining', function(target) { Voxel.handleWhenLeftClick(target);});
    window.game.on('fire', function() { Voxel.handleWhenLeftClick();});

  };

  BlocklyApps.init(config);
};

Voxel.handleWhenRightClick = function(target) {
  evalCode(Blockly.Generator.blockSpaceToCode(
    'JavaScript',
    'voxel_whenRightClick'));
};

Voxel.handleWhenLeftClick = function(target) {
  evalCode(Blockly.Generator.blockSpaceToCode(
    'JavaScript',
    'voxel_whenLeftClick'));
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  BlocklyApps.attempts++;
  Voxel.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Voxel.resetButtonClick = function () {

};


function evalCode (code) {
  try {
    return codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Voxel: api
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
Voxel.execute = function() {
  Voxel.result = BlocklyApps.ResultType.UNSET;
  Voxel.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Voxel.message = undefined;

  // Run the app
  var codeWhenRunButton = Blockly.Generator.blockSpaceToCode(
    'JavaScript',
    'when_run');

  // Get a result
  Voxel.result = evalCode(codeWhenRunButton);
  return; // TODO(bjordan): remove
  Voxel.testResults = BlocklyApps.getTestResults(Voxel.result);

  if (level.freePlay) {
    Voxel.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'voxel',
    level: level.id,
    builder: level.builder,
    result: Voxel.result,
    testResult: Voxel.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  // override extra top blocks message
  level.extraTopBlocks = voxelMsg.extraTopBlocks();

  BlocklyApps.displayFeedback({
    app: 'Voxel',
    skin: skin.id,
    feedbackType: Voxel.testResults,
    response: response,
    level: level,
    appStrings: {
      reinfFeedbackMsg: voxelMsg.reinfFeedbackMsg()
    },
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
