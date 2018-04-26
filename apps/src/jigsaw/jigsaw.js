/**
 * Blockly App: Jigsaw
 *
 * Copyright 2013 Code.org
 *
 */

var React = require('react');
var ReactDOM = require('react-dom');
var studioApp = require('../StudioApp').singleton;
var Provider = require('react-redux').Provider;
import AppView from '../templates/AppView';
var JigsawVisualizationColumn = require('./JigsawVisualizationColumn');
var dom = require('../dom');
import {getStore} from '../redux';

/**
 * Create a namespace for the application.
 */
var Jigsaw = module.exports;

var level;
var skin;

import {TestResults, ResultType} from '../constants';

studioApp().setCheckForEmptyBlocks(true);

// Never bump neighbors for Jigsaw
Blockly.BUMP_UNCONNECTED = false;

function useLargeNotches() {
  var notchHeight = 8;
  var notchWidthA = 6;
  var notchWidthB = 10;

  Blockly.BlockSvg.NOTCH_PATH_WIDTH = notchWidthA * 2 + notchWidthB;
  Blockly.BlockSvg.NOTCH_WIDTH = 50;

  var notchPathLeft = 'l ' +
    notchWidthA + ',' + notchHeight + ' ' +
    notchWidthB + ',0 ' +
    notchWidthA + ',-' + notchHeight;
  var notchPathRight = 'l ' +
    '-' + notchWidthA + ',' + notchHeight + ' ' +
    '-' + notchWidthB + ',0 ' +
    '-' + notchWidthA + ',-' + notchHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
  // Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

  var notchHighlightHeight = notchHeight; //4;
  var notchHighlightWidthA = notchWidthA + 0.5; //6.5;
  var notchHighlightWidthB = notchWidthB - 1; //2;

  var notchPathLeftHighlight = 'l ' +
    notchHighlightWidthA + ',' + notchHighlightHeight + ' ' +
    notchHighlightWidthB + ',0 ' +
    notchHighlightWidthA + ',-' + notchHighlightHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';

  Blockly.Connection.NOTCH_PATHS_OVERRIDE = {
    left: notchPathLeft,
    leftHighlight: notchPathLeftHighlight,
    right: notchPathRight
  };

}


// Default Scalings
Jigsaw.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var loadLevel = function () {
  // Load maps.
  // Override scalars.
  for (var key in level.scale) {
    Jigsaw.scale[key] = level.scale[key];
  }

  Jigsaw.MAZE_WIDTH = 0;
  Jigsaw.MAZE_HEIGHT = 0;

  Jigsaw.block1Clicked = false;
};

var drawMap = function () {
  // Hide the left column and the resize bar.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.display = 'none';

  if (level.ghost) {
    var blockCanvas = Blockly.mainBlockSpace.getCanvas();
    Blockly.createSvgElement('rect', {
      fill: "url(#pat_" + level.id + "A)",
      "fill-opacity": "0.2",
      width: level.image.width,
      height: level.image.height,
      transform: "translate(" + level.ghost.x + ", " +
        level.ghost.y + ")"
    }, blockCanvas, {
      beforeExisting: true
    });
  }
};

/**
 * Initialize Blockly and the Jigsaw app.  Called on page load.
 */
Jigsaw.init = function (config) {
  // Jigsaw.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  loadLevel();

  if (level.largeNotches) {
    useLargeNotches();
  }
  Blockly.SNAP_RADIUS = level.snapRadius || 90;

  config.loadAudio = function () {
    studioApp().loadAudio(skin.winSound, 'win');
    studioApp().loadAudio(skin.startSound, 'start');
    studioApp().loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function () {
    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    drawMap();
  };

  // only have trashcan for levels with toolbox
  config.trashcan = !!level.toolbox;
  config.scrollbars = false;

  config.enableShowCode = false;
  config.enableShowBlockCount = false;

  var onMount = function () {
    studioApp().init(config);

    document.getElementById('runButton').style.display = 'none';
    Jigsaw.successListener = Blockly.mainBlockSpaceEditor.addChangeListener(function (evt) {
      checkForSuccess();
    });

    // Only used by level1, in which the success criteria is clicking on the block
    var block1 = document.querySelectorAll("[block-id='1']")[0];
    if (block1) {
      dom.addMouseDownTouchEvent(block1, function () {
        Jigsaw.block1Clicked = true;
      });
    }
  };

  studioApp().setPageConstants(config, {
    noVisualization: true
  });

  ReactDOM.render(
    <Provider store={getStore()}>
      <AppView
        visualizationColumn={<JigsawVisualizationColumn/>}
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

function checkForSuccess() {
  var success = level.goal.successCondition();
  if (success) {
    Blockly.removeChangeListener(Jigsaw.successListener);

    Jigsaw.result = ResultType.SUCCESS;
    Jigsaw.onPuzzleComplete();
  }
}

/**
 * App specific displayFeedback function that calls into
 * studioApp().displayFeedback when appropriate
 */
var displayFeedback = function () {
  if (!Jigsaw.waitingForReport) {
    studioApp().displayFeedback({
      feedbackType: Jigsaw.testResults,
      response: Jigsaw.response,
      level: level,
      hideTryAgain: true,
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Jigsaw.onReportComplete = function (response) {
  Jigsaw.response = response;
  Jigsaw.waitingForReport = false;
  studioApp().onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Jigsaw.execute = function () {
  // execute is a no-op for jigsaw
};

Jigsaw.onPuzzleComplete = function () {

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Jigsaw.result === ResultType.SUCCESS);

  Jigsaw.testResults = studioApp().getTestResults(levelComplete, {
    allowTopBlocks: true
  });

  if (Jigsaw.testResults >= TestResults.FREE_PLAY) {
    studioApp().playAudio('win');
  } else {
    studioApp().playAudio('failure');
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Jigsaw.waitingForReport = true;

  // Report result to server.
  studioApp().report({
     app: 'Jigsaw',
     level: level.id,
     result: Jigsaw.result === ResultType.SUCCESS,
     testResult: Jigsaw.testResults,
     program: encodeURIComponent(textBlocks),
     onComplete: Jigsaw.onReportComplete
  });
};
