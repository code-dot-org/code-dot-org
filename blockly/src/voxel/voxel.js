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

Voxel.APP_SHORTNAME = 'voxel';
Voxel.DASHBOARD_APP_SHORTNAME = 'Voxel';
Voxel.WIN_SOUND_KEY = 'win';
Voxel.START_SOUND_KEY = 'start';
Voxel.FAILURE_SOUND_KEY = 'failure';
Voxel.WHEN_RUN_BLOCK_KEY = 'when_run';
Voxel.WHEN_RIGHT_CLICK_BLOCK_KEY = 'voxel_whenRightClick';
Voxel.WHEN_LEFT_CLICK_BLOCK_KEY = 'voxel_whenLeftClick';

/**
 * Initialize Blockly and the Voxel.  Called on page load.
 */
Voxel.init = function(config) {
  Voxel.globals = {};

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = Voxel.WHEN_RUN_BLOCK_KEY;
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
    BlocklyApps.loadAudio(skin.winSound, Voxel.WIN_SOUND_KEY);
    BlocklyApps.loadAudio(skin.startSound, Voxel.START_SOUND_KEY);
    BlocklyApps.loadAudio(skin.failureSound, Voxel.FAILURE_SOUND_KEY);
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

    var shareButton = document.getElementById('rightButton');
    dom.addClickTouchEvent(shareButton, Voxel.endAttempt);
    if (!level.freePlay) {
      var shareButtonArea = document.getElementById('right-button-cell');
      shareButtonArea.style.display = 'none';
    }

    window.game.plugins.get('voxel-reach').on('use', Voxel.generateEventBlockCodeRunner('voxel_whenRightClick'));
    //window.game.plugins.get('voxel-reach').on('start mining', function(target) { Voxel.handleWhenLeftClick(target);});
    window.game.on('fire', Voxel.generateEventBlockCodeRunner('voxel_whenLeftClick'));
  };

  BlocklyApps.init(config);
};

Voxel.generateEventBlockCodeRunner = function(blockType) {
  return function() {
    Voxel.evaluateCodeUnderBlockType(blockType);
  };
};

Voxel.evaluateCodeUnderBlockType = function(blockType) {
  Voxel.evaluateCode(Voxel.allProcedures() + Blockly.Generator.blockSpaceToCode('JavaScript', blockType));
};

Voxel.allProcedures = function() {
  return Voxel.defineProceduresForType('procedures_defreturn') +
  Voxel.defineProceduresForType('procedures_defnoreturn') +
  Voxel.defineProceduresForType('functional_definition');
};

Voxel.defineProceduresForType = function(blockType) {
  return Blockly.Generator.blockSpaceToCode('JavaScript', blockType);
};

Voxel.evaluateCode = function(code) {
  try {
    codegen.evalWith(code, {
        BlocklyApps: BlocklyApps,
        Voxel: api,
        Globals: Voxel.Globals
      }
    );
  } catch (e) { }
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

Voxel.execute = function() {
  Voxel.result = BlocklyApps.ResultType.UNSET;
  Voxel.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Voxel.message = undefined;

  Voxel.evaluateCodeUnderBlockType('when_run');

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
    onComplete: Voxel.onReportComplete
  };

  BlocklyApps.report(reportData);
};

Voxel.endAttempt = function() {
  if (level.freePlay) {
    Voxel.result = BlocklyApps.ResultType.SUCCESS;
  }

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Voxel.result == BlocklyApps.ResultType.SUCCESS);

  if (level.freePlay) {
    Voxel.testResults = BlocklyApps.TestResults.FREE_PLAY;
  } else {
    Voxel.testResults = BlocklyApps.getTestResults(levelComplete);
  }

  if (Voxel.testResults >= BlocklyApps.TestResults.FREE_PLAY) {
    BlocklyApps.playAudio(Voxel.WIN_SOUND_KEY);
  } else {
    BlocklyApps.playAudio(Voxel.FAILURE_SOUND_KEY);
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  // Report result to server.
  BlocklyApps.report({
    app: Voxel.APP_SHORTNAME,
    level: level.id,
    result: Voxel.result === BlocklyApps.ResultType.SUCCESS,
    testResult: Voxel.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: Voxel.onReportComplete
  });
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  BlocklyApps.displayFeedback({
    app: Voxel.DASHBOARD_APP_SHORTNAME,
    skin: skin.id,
    feedbackType: Voxel.testResults,
    response: response,
    level: level,
    showingSharing: level.freePlay,
    appStrings: {
      reinfFeedbackMsg: voxelMsg.reinfFeedbackMsg(),
      sharingText: voxelMsg.shareGame()
    }
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} response JSON response (if available)
 */
Voxel.onReportComplete = function(response) {
  Voxel.response = response;
  displayFeedback(response);
};
