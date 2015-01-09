/**
 * Blockly App: Jigsaw
 *
 * Copyright 2013 Code.org
 *
 */

'use strict';

var studioAppSingleton = require('../base');
var skins = require('../skins');
var page = require('../templates/page.html');
var dom = require('../dom');

/**
 * Create a namespace for the application.
 */
var Jigsaw = module.exports;

var level;
var skin;

var ResultType = studioAppSingleton.ResultType;
var TestResults = studioAppSingleton.TestResults;

studioAppSingleton.CHECK_FOR_EMPTY_BLOCKS = true;
//The number of blocks to show as feedback.
studioAppSingleton.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

// Never bump neighbors for Jigsaw
Blockly.BUMP_UNCONNECTED = false;

function useLargeNotches() {
  Blockly.BlockSvg.NOTCH_WIDTH = 50;

  var notchHeight = 8;
  var notchWidthA = 6;
  var notchWidthB = 10;

  Blockly.BlockSvg.NOTCH_PATH_WIDTH = notchWidthA * 2 + notchWidthB;

  Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l ' +
    notchWidthA + ',' + notchHeight + ' ' +
    notchWidthB + ',0 ' +
    notchWidthA + ',-' + notchHeight;
  Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l ' +
    '-' + notchWidthA + ',' + notchHeight + ' ' +
    '-' + notchWidthB + ',0 ' +
    '-' + notchWidthA + ',-' + notchHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
  // Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

  var notchHighlightHeight = notchHeight; //4;
  var notchHighlightWidthA = notchWidthA + 0.5; //6.5;
  var notchHighlightWidthB = notchWidthB - 1; //2;

  Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l ' +
    notchHighlightWidthA + ',' + notchHighlightHeight + ' ' +
    notchHighlightWidthB + ',0 ' +
    notchHighlightWidthA + ',-' + notchHighlightHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';
}


// Default Scalings
Jigsaw.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var loadLevel = function() {
  // Load maps.
  // Override scalars.
  for (var key in level.scale) {
    Jigsaw.scale[key] = level.scale[key];
  }

  Jigsaw.MAZE_WIDTH = 0;
  Jigsaw.MAZE_HEIGHT = 0;

  Jigsaw.block1Clicked = false;
};

var drawMap = function() {
  var i, x, y, k, tile;

  // Hide the left column.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.display = 'none';

  // account for toolbox if there
  var toolboxWidth = -Blockly.mainBlockSpace.getMetrics().viewLeft;

  if (level.ghost) {
    var svg = document.querySelectorAll(".blocklySvg")[0];
    var image = Blockly.createSvgElement('rect', {
      fill: "url(#pat_" + level.id + "A)",
      "fill-opacity": "0.2",
      width: level.image.width,
      height: level.image.height,
      transform: "translate(" + (toolboxWidth + level.ghost.x) + ", " +
        level.ghost.y + ")"
    });
    // we want it to be first, so it's behind everything
    svg.insertBefore(image, svg.childNodes[0]);
  }
};

/**
 * Initialize Blockly and the Jigsaw app.  Called on page load.
 */
Jigsaw.init = function(config) {
  // Jigsaw.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  loadLevel();

  if (level.largeNotches) {
    useLargeNotches();
  }
  Blockly.SNAP_RADIUS = level.snapRadius || 90;

  config.html = page({
    assetUrl: studioAppSingleton.assetUrl,
    data: {
      localeDirection: studioAppSingleton.localeDirection(),
      controls: require('./controls.html')({assetUrl: studioAppSingleton.assetUrl}),
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
    }
  });

  // TODO (br-pair) : I think this is something that's happening in all apps?
  config.loadAudio = function() {
    studioAppSingleton.loadAudio(skin.winSound, 'win');
    studioAppSingleton.loadAudio(skin.startSound, 'start');
    studioAppSingleton.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
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

  studioAppSingleton.init(config);

  document.getElementById('runButton').style.display = 'none';
  Jigsaw.successListener = Blockly.mainBlockSpaceEditor.addChangeListener(function(evt) {
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
 * studioAppSingleton.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Jigsaw.waitingForReport) {
    studioAppSingleton.displayFeedback({
      app: 'Jigsaw',
      skin: skin.id,
      feedbackType: Jigsaw.testResults,
      response: Jigsaw.response,
      level: level
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Jigsaw.onReportComplete = function(response) {
  Jigsaw.response = response;
  Jigsaw.waitingForReport = false;
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Jigsaw.execute = function() {
  // execute is a no-op for jigsaw
};

Jigsaw.onPuzzleComplete = function() {

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Jigsaw.result == ResultType.SUCCESS);

  Jigsaw.testResults = studioAppSingleton.getTestResults(levelComplete, {
    allowTopBlocks: true
  });

  if (Jigsaw.testResults >= TestResults.FREE_PLAY) {
    studioAppSingleton.playAudio('win');
  } else {
    studioAppSingleton.playAudio('failure');
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Jigsaw.waitingForReport = true;

  // Report result to server.
  studioAppSingleton.report({
     app: 'Jigsaw',
     level: level.id,
     result: Jigsaw.result === ResultType.SUCCESS,
     testResult: Jigsaw.testResults,
     program: encodeURIComponent(textBlocks),
     onComplete: Jigsaw.onReportComplete
  });
};
