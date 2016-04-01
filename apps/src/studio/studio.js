/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var studioMsg = require('./locale');
var skins = require('../skins');
var constants = require('./constants');
var sharedConstants = require('../constants');
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var AppView = require('../templates/AppView.jsx');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
var dom = require('../dom');
var Collidable = require('./collidable');
var Sprite = require('./Sprite');
var Projectile = require('./projectile');
var Item = require('./Item');
var BigGameLogic = require('./bigGameLogic');
var RocketHeightLogic = require('./rocketHeightLogic');
var SamBatLogic = require('./samBatLogic');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var Hammer = utils.getHammer();
var JSInterpreter = require('../JSInterpreter');
var JsInterpreterLogger = require('../JsInterpreterLogger');
var annotationList = require('../acemode/annotationList');
var spriteActions = require('./spriteActions');
var ImageFilterFactory = require('./ImageFilterFactory');
var ThreeSliceAudio = require('./ThreeSliceAudio');
var MusicController = require('../MusicController');
var paramLists = require('./paramLists.js');

// tests don't have svgelement
if (typeof SVGElement !== 'undefined') {
  // Loading these modules extends SVGElement and puts canvg in the global
  // namespace
  require('canvg');
  require('../canvg/svg_todataurl');
}

var Direction = constants.Direction;
var NextTurn = constants.NextTurn;
var SquareType = constants.SquareType;
var Emotions = constants.Emotions;

var KeyCodes = sharedConstants.KeyCodes;

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

var SVG_NS = sharedConstants.SVG_NS;

// Whether we are showing debug information
var showDebugInfo = false;

/**
 * Create a namespace for the application.
 */
var Studio = module.exports;

Studio.keyState = {};
Studio.gesturesObserved = {};
Studio.btnState = {};

var ButtonState = {
  UP: 0,
  DOWN: 1
};

var ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

Studio.GameStates = {
  WAITING: 0,
  ACTIVE: 1,
  OVER: 2
};

var DRAG_DISTANCE_TO_MOVE_RATIO = 25;

// NOTE: all class names should be unique. eventhandler naming won't work
// if we name a projectile class 'left' for example.

var EdgeClassNames = [
  'top',
  'left',
  'bottom',
  'right'
];

var level;
var skin;

/**
 * Milliseconds between each animation frame.
 */
var stepSpeed;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var MAX_INTERPRETER_STEPS_PER_TICK = 200;

var AUTO_HANDLER_MAP = {
  whenRun: 'whenGameStarts',
  whenDown: 'when-down',
  whenUp: 'when-up',
  whenLeft: 'when-left',
  whenRight: 'when-right',
  whenGetCharacter: 'whenSpriteCollided-' +
      (Studio.protagonistSpriteIndex || 0) +
      '-any_item',
  whenTouchCharacter: 'whenSpriteCollided-' +
      (Studio.protagonistSpriteIndex || 0) +
      '-any_item',
  whenTouchObstacle: 'whenSpriteCollided-' +
      (Studio.protagonistSpriteIndex || 0) +
      '-wall',
  whenGetAllCharacters: 'whenGetAllItems',
  whenTouchGoal: 'whenTouchGoal',
  whenTouchAllGoals: 'whenTouchAllGoals',
  whenScore1000: 'whenScore1000',
};

// Default Scalings
Studio.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var TITLE_SCREEN_TIMEOUT = 5000;
var TITLE_SCREEN_TITLE_Y_POSITION = 60; // bottom of title text
var TITLE_SCREEN_TEXT_Y_POSITION = 100; // top of text group
var TITLE_SCREEN_TEXT_SIDE_MARGIN = 20;
var TITLE_SCREEN_TEXT_LINE_HEIGHT = 24;
var TITLE_SCREEN_TEXT_MAX_LINES = 7;
var TITLE_SCREEN_TEXT_TOP_MARGIN = 5;
var TITLE_SCREEN_TEXT_V_PADDING = 15;
var TITLE_SCREEN_TEXT_WIDTH = 360;
var TITLE_SCREEN_TEXT_HEIGHT =
      TITLE_SCREEN_TEXT_TOP_MARGIN + TITLE_SCREEN_TEXT_V_PADDING +
      (TITLE_SCREEN_TEXT_MAX_LINES * TITLE_SCREEN_TEXT_LINE_HEIGHT);

var TITLE_SPRITE_X_POS = 3;
var TITLE_SPRITE_Y_POS = 6;

var SPEECH_BUBBLE_RADIUS = 20;
var SPEECH_BUBBLE_H_OFFSET = 50;
var SPEECH_BUBBLE_PADDING = 5;
var SPEECH_BUBBLE_SIDE_MARGIN = 10;
var SPEECH_BUBBLE_LINE_HEIGHT = 20;
var SPEECH_BUBBLE_MAX_LINES = 4;
var SPEECH_BUBBLE_TOP_MARGIN = 5;
var SPEECH_BUBBLE_WIDTH = 180;
var SPEECH_BUBBLE_HEIGHT = 20 +
      (SPEECH_BUBBLE_MAX_LINES * SPEECH_BUBBLE_LINE_HEIGHT);

var SCORE_TEXT_Y_POSITION = 30; // bottom of text
var VICTORY_TEXT_Y_POSITION = 130;
var RESET_TEXT_Y_POSITION = 380;

var MIN_TIME_BETWEEN_PROJECTILES = 500; // time in ms

var twitterOptions = {
  text: studioMsg.shareStudioTwitter(),
  hashtag: "StudioCode"
};

/** @type {JsInterpreterLogger} */
var consoleLogger = null;

function loadLevel() {
  // Load maps.
  Studio.map = level.map;
  Studio.wallMap = null;  // The map name actually being used.
  Studio.wallMapRequested = null; // The map name requested by the caller.
  Studio.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Studio.slowExecutionFactor = level.slowExecutionFactor || 1;
  Studio.gridAlignedExtraPauseSteps = level.gridAlignedExtraPauseSteps || 0;
  Studio.ticksBeforeFaceSouth = Studio.slowExecutionFactor +
      utils.valueOr(level.ticksBeforeFaceSouth,
          constants.IDLE_TICKS_BEFORE_FACE_SOUTH);
  Studio.minWorkspaceHeight = level.minWorkspaceHeight;
  Studio.softButtons_ = level.softButtons || {};
  // protagonistSpriteIndex was originally mispelled. accept either spelling.
  Studio.protagonistSpriteIndex = utils.valueOr(level.protagonistSpriteIndex,level.protaganistSpriteIndex);

  switch (level.customGameType) {
    case 'Big Game':
      Studio.customLogic = new BigGameLogic(Studio);
      break;
    case 'Rocket Height':
      Studio.customLogic = new RocketHeightLogic(Studio);
      break;
    case 'Sam the Bat':
      Studio.customLogic = new SamBatLogic(Studio);
      break;
    case 'Ninja Cat':
      Studio.customLogic = new BigGameLogic(Studio, {
        staticPlayer: true
      });

  }
  blocks.registerCustomGameLogic(Studio.customLogic);

  if (level.avatarList) {
    Studio.startAvatars = level.avatarList.slice();
  } else {
    Studio.startAvatars = reorderedStartAvatars(skin.avatarList,
      level.firstSpriteIndex);
  }

  // Override scalars.
  for (var key in level.scale) {
    Studio.scale[key] = level.scale[key];
  }

  // Measure maze dimensions and set sizes.
  // ROWS: Number of tiles down.
  Studio.ROWS = Studio.map.length;
  // COLS: Number of tiles across.
  Studio.COLS = Studio.map[0].length;
  // Pixel height and width of each maze square (i.e. tile).
  Studio.SQUARE_SIZE = 50;
  Studio.HALF_SQUARE = Studio.SQUARE_SIZE / 2;

  // Height and width of the goal and obstacles.
  Studio.MARKER_HEIGHT = level.markerHeight || 100;
  Studio.MARKER_WIDTH = level.markerWidth || 100;

  Studio.MAZE_WIDTH = Studio.SQUARE_SIZE * Studio.COLS;
  Studio.MAZE_HEIGHT = Studio.SQUARE_SIZE * Studio.ROWS;
  studioApp.MAZE_WIDTH = Studio.MAZE_WIDTH;
  studioApp.MAZE_HEIGHT = Studio.MAZE_HEIGHT;
}

/**
 * Returns a list of avatars, reordered such that firstSpriteIndex comes first
 * (and is now at index 0).
 */
function reorderedStartAvatars (avatarList, firstSpriteIndex) {
  firstSpriteIndex = firstSpriteIndex || 0;
  return _.flatten([
    avatarList.slice(firstSpriteIndex),
    avatarList.slice(0, firstSpriteIndex)
  ]);
}

var drawMap = function () {
  var svg = document.getElementById('svgStudio');
  var i, x, y, k;

  // Adjust outer element size.
  svg.setAttribute('width', Studio.MAZE_WIDTH);
  svg.setAttribute('height', Studio.MAZE_HEIGHT);

  // Attach click handler.
  var hammerSvg = new Hammer(svg);
  hammerSvg.on("tap", Studio.onSvgClicked);
  hammerSvg.on("drag", Studio.onSvgDrag);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Studio.MAZE_WIDTH + 'px';

  var backgroundLayer = document.createElementNS(SVG_NS, 'g');
  backgroundLayer.setAttribute('id', 'backgroundLayer');
  svg.appendChild(backgroundLayer);

  if (Studio.background && skin[Studio.background].background) {
    var tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                        skin[Studio.background].background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Studio.MAZE_HEIGHT);
    tile.setAttribute('width', Studio.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    backgroundLayer.appendChild(tile);
  }

  if (level.coordinateGridBackground) {
    studioApp.createCoordinateGridBackground({
      svg: 'backgroundLayer',
      origin: 0,
      firstLabel: 100,
      lastLabel: 300,
      increment: 100
    });
  }

  var spriteLayer = document.createElementNS(SVG_NS, 'g');
  spriteLayer.setAttribute('id', 'spriteLayer');
  svg.appendChild(spriteLayer);

  if (level.wallMapCollisions) {
    Studio.drawMapTiles();
  }

  if (Studio.spriteStart_) {
    for (i = 0; i < Studio.spriteCount; i++) {
      var spriteSpeechBubble = document.createElementNS(SVG_NS, 'g');
      spriteSpeechBubble.setAttribute('id', 'speechBubble' + i);
      spriteSpeechBubble.setAttribute('visibility', 'hidden');

      var speechRect = document.createElementNS(SVG_NS, 'path');
      speechRect.setAttribute('id', 'speechBubblePath' + i);
      speechRect.setAttribute('class', 'studio-speech-bubble-path');

      var speechText = document.createElementNS(SVG_NS, 'text');
      speechText.setAttribute('id', 'speechBubbleText' + i);
      speechText.setAttribute('class', 'studio-speech-bubble');

      spriteSpeechBubble.appendChild(speechRect);
      spriteSpeechBubble.appendChild(speechText);
      svg.appendChild(spriteSpeechBubble);
    }
  }

  var goalOverride = utils.valueOr(level.goalOverride, {});
  var numFrames = 1;
  if (goalOverride.goalAnimation && skin.animatedGoalFrames) {
    numFrames = skin.animatedGoalFrames;
  }

  // Calculate the dimensions of the spritesheet & the sprite itself that's rendered
  // out of it.  Precedence order is skin.goalSpriteWidth/Height, goalOverride.imageWidth/Height,
  // and then Studio.MARKER_WIDTH/HEIGHT.
  //
  // Legacy levels might specify goalOverride.imageWidth/Height which are dimensions
  // of the entire spritesheet, and rely upon studio's default MARKER_WIDTH/HEIGHT which
  // are dimensions of the sprite itself.
  // Newer levels might specify skin.goalSpriteWith/Height which are the dimensions of the
  // sprite itself.  The dimensions of the spritesheet are calculated using skin.animatedGoalFrames.
  // The fallback dimensions of both spritesheet and sprite are studio's default
  // MARKER_WIDTH/HEIGHT.

  var spritesheetWidth = skin.goalSpriteWidth ? (skin.goalSpriteWidth * numFrames) :
    utils.valueOr(goalOverride.imageWidth, Studio.MARKER_WIDTH);
  var spritesheetHeight = skin.goalSpriteHeight ? skin.goalSpriteHeight :
    utils.valueOr(goalOverride.imageHeight, Studio.MARKER_HEIGHT);

  var spriteWidth = utils.valueOr(skin.goalSpriteWidth, Studio.MARKER_WIDTH);
  var spriteHeight = utils.valueOr(skin.goalSpriteHeight, Studio.MARKER_HEIGHT);

  if (Studio.spriteGoals_) {
    for (i = 0; i < Studio.spriteGoals_.length; i++) {
      // Add finish markers.

      var finishClipPath = document.createElementNS(SVG_NS, 'clipPath');
      finishClipPath.setAttribute('id', 'finishClipPath' + i);
      var finishClipRect = document.createElementNS(SVG_NS, 'rect');
      finishClipRect.setAttribute('id', 'finishClipRect' + i);
      finishClipRect.setAttribute('width', spriteWidth);
      finishClipRect.setAttribute('height', spriteHeight);
      finishClipPath.appendChild(finishClipRect);
      // Safari workaround: Clip paths work better when descendant of an SVGGElement.
      spriteLayer.appendChild(finishClipPath);

      var spriteFinishMarker = document.createElementNS(SVG_NS, 'image');
      spriteFinishMarker.setAttribute('id', 'spriteFinish' + i);
      spriteFinishMarker.setAttribute('width', spritesheetWidth);
      spriteFinishMarker.setAttribute('height', spritesheetHeight);
      if (!skin.disableClipRectOnGoals) {
        spriteFinishMarker.setAttribute('clip-path', 'url(#finishClipPath' + i + ')');
      }
      svg.appendChild(spriteFinishMarker);
    }
  }
  Studio.applyGoalEffect();

  // Create cloud elements.
  var cloudGroup = document.createElementNS(SVG_NS, 'g');
  cloudGroup.setAttribute('id', 'cloudLayer');
  for (i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
    var cloud = document.createElementNS(SVG_NS, 'image');
    cloud.setAttribute('id', 'cloud' + i);
    cloudGroup.appendChild(cloud);
  }
  svg.appendChild(cloudGroup);

  var gameTextGroup = document.createElementNS(SVG_NS, 'g');
  gameTextGroup.setAttribute('id', 'gameTextGroup');
  svg.appendChild(gameTextGroup);

  var overlayGroup = document.createElementNS(SVG_NS, 'g');
  overlayGroup.setAttribute('id', 'overlayGroup');
  svg.appendChild(overlayGroup);

  var score = document.createElementNS(SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'studio-score');
  score.setAttribute('x', Studio.MAZE_WIDTH / 2);
  score.setAttribute('y', SCORE_TEXT_Y_POSITION);
  score.appendChild(document.createTextNode(''));
  score.setAttribute('visibility', 'hidden');
  gameTextGroup.appendChild(score);

  var victoryText = document.createElementNS(SVG_NS, 'text');
  victoryText.setAttribute('id', 'victoryText');
  victoryText.setAttribute('class', 'studio-victory-text');
  victoryText.setAttribute('x', Studio.MAZE_WIDTH / 2);
  victoryText.setAttribute('y', VICTORY_TEXT_Y_POSITION);
  victoryText.appendChild(document.createTextNode(''));
  victoryText.setAttribute('visibility', 'hidden');
  gameTextGroup.appendChild(victoryText);

  if (dom.isMobile() || dom.isWindowsTouch()) {
    var resetOverlayRect = document.createElementNS(SVG_NS, 'rect');
    resetOverlayRect.setAttribute('width', Studio.MAZE_WIDTH);
    resetOverlayRect.setAttribute('height', Studio.MAZE_HEIGHT);
    resetOverlayRect.setAttribute('fill', 'black');
    resetOverlayRect.setAttribute('opacity', 0.3);
    overlayGroup.appendChild(resetOverlayRect);
    var resetTextA = document.createElementNS(SVG_NS, 'text');
    resetTextA.setAttribute('id', 'resetTextA');
    resetTextA.setAttribute('class', 'studio-reset-text');
    resetTextA.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetTextA.setAttribute('y', RESET_TEXT_Y_POSITION - 30);
    resetTextA.appendChild(document.createTextNode(studioMsg.tapToPlay()));
    resetTextA.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetTextA);
    var resetTextB = document.createElementNS(SVG_NS, 'text');
    resetTextB.setAttribute('id', 'resetTextB');
    resetTextB.setAttribute('class', 'studio-reset-text');
    resetTextB.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetTextB.setAttribute('y', RESET_TEXT_Y_POSITION);
    resetTextB.appendChild(document.createTextNode(studioMsg.swipeToMove()));
    resetTextB.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetTextB);
    var touchDragIcon = document.createElementNS(SVG_NS, 'image');
    touchDragIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        studioApp.assetUrl('media/common_images/touch-drag.png'));
    var touchIconSize = 300;
    touchDragIcon.setAttribute('width', touchIconSize);
    touchDragIcon.setAttribute('height', touchIconSize);
    touchDragIcon.setAttribute('x', (Studio.MAZE_WIDTH - touchIconSize) / 2);
    touchDragIcon.setAttribute('y', (Studio.MAZE_HEIGHT - touchIconSize) / 2 - 25);
    overlayGroup.appendChild(touchDragIcon);
  } else {
    var resetText = document.createElementNS(SVG_NS, 'text');
    resetText.setAttribute('id', 'resetText');
    resetText.setAttribute('class', 'studio-reset-text');
    resetText.setAttribute('x', Studio.MAZE_WIDTH / 2);
    resetText.setAttribute('y', RESET_TEXT_Y_POSITION);
    resetText.appendChild(document.createTextNode(studioMsg.tapOrClickToReset()));
    resetText.setAttribute('visibility', 'visible');
    overlayGroup.appendChild(resetText);
  }

  if (level.floatingScore) {
    var floatingScore = document.createElementNS(SVG_NS, 'text');
    floatingScore.setAttribute('id', 'floatingScore');
    floatingScore.setAttribute('class', 'studio-floating-score');
    floatingScore.setAttribute('x', Studio.MAZE_WIDTH / 2);
    floatingScore.setAttribute('y', SCORE_TEXT_Y_POSITION);
    floatingScore.appendChild(document.createTextNode(''));
    floatingScore.setAttribute('visibility', 'hidden');
    svg.appendChild(floatingScore);
  }

  var titleScreenTitle = document.createElementNS(SVG_NS, 'text');
  titleScreenTitle.setAttribute('id', 'titleScreenTitle');
  titleScreenTitle.setAttribute('class', 'studio-ts-title');
  titleScreenTitle.setAttribute('x', Studio.MAZE_WIDTH / 2);
  titleScreenTitle.setAttribute('y', TITLE_SCREEN_TITLE_Y_POSITION);
  titleScreenTitle.appendChild(document.createTextNode(''));
  titleScreenTitle.setAttribute('visibility', 'hidden');
  svg.appendChild(titleScreenTitle);

  var titleScreenTextGroup = document.createElementNS(SVG_NS, 'g');
  var xPosTextGroup = (Studio.MAZE_WIDTH - TITLE_SCREEN_TEXT_WIDTH) / 2;
  titleScreenTextGroup.setAttribute('id', 'titleScreenTextGroup');
  titleScreenTextGroup.setAttribute('x', xPosTextGroup);
  titleScreenTextGroup.setAttribute('y', TITLE_SCREEN_TEXT_Y_POSITION);
  titleScreenTextGroup.setAttribute(
      'transform',
      'translate(' + xPosTextGroup + ',' + TITLE_SCREEN_TEXT_Y_POSITION + ')');
  titleScreenTextGroup.setAttribute('visibility', 'hidden');

  var titleScreenTextRect = document.createElementNS(SVG_NS, 'rect');
  titleScreenTextRect.setAttribute('id', 'titleScreenTextRect');
  titleScreenTextRect.setAttribute('x', 0);
  titleScreenTextRect.setAttribute('y', 0);
  titleScreenTextRect.setAttribute('width', TITLE_SCREEN_TEXT_WIDTH);
  titleScreenTextRect.setAttribute('class', 'studio-ts-text-rect');

  var titleScreenText = document.createElementNS(SVG_NS, 'text');
  titleScreenText.setAttribute('id', 'titleScreenText');
  titleScreenText.setAttribute('class', 'studio-ts-text');
  titleScreenText.setAttribute('x', TITLE_SCREEN_TEXT_WIDTH / 2);
  titleScreenText.setAttribute('y', 0);
  titleScreenText.appendChild(document.createTextNode(''));

  titleScreenTextGroup.appendChild(titleScreenTextRect);
  titleScreenTextGroup.appendChild(titleScreenText);
  svg.appendChild(titleScreenTextGroup);
};

function collisionTest(x1, x2, xVariance, y1, y2, yVariance) {
  return (Math.abs(x1 - x2) <= xVariance) && (Math.abs(y1 - y2) <= yVariance);
}

function overlappingTest(x1, x2, xVariance, y1, y2, yVariance) {
  return (Math.abs(x1 - x2) < xVariance) && (Math.abs(y1 - y2) < yVariance);
}

/** @type {ImageFilter} */
var goalFilterEffect = null;

/**
 * Apply the effect specified in skin.goalEffect to all of the goal objects
 * in the level.
 */
Studio.applyGoalEffect = function () {
  if (!Studio.spriteGoals_) {
    return;
  }

  if (!goalFilterEffect) {
    var svg = document.getElementById('svgStudio');
    goalFilterEffect = ImageFilterFactory.makeFilterOfType(skin.goalEffect, svg);
  }

  var spriteFinishMarker;
  for (var i = 0; i < Studio.spriteGoals_.length; i++) {
    spriteFinishMarker = document.getElementById('spriteFinish' + i);
    if (goalFilterEffect) {
      goalFilterEffect.applyTo(spriteFinishMarker);
    }
  }
};

/**
 * Remove the effect specified in skin.goalEffect from all of the goal objects
 * in the level.
 */
Studio.removeGoalEffect = function () {
  if (!Studio.spriteGoals_ || !goalFilterEffect) {
    return;
  }

  var spriteFinishMarker;
  for (var i = 0; i < Studio.spriteGoals_.length; i++) {
    spriteFinishMarker = document.getElementById('spriteFinish' + i);
    goalFilterEffect.removeFrom(spriteFinishMarker);
  }
};

/**
 * @param scope Object :  The scope in which to execute the delegated function.
 * @param func Function : The function to execute
 * @param data Object or Array : The data to pass to the function. If the function is also passed arguments, the data is appended to the arguments list. If the data is an Array, each item is appended as a new argument.
 */
var delegate = function(scope, func, data) {
  return function() {
    var args = Array.prototype.slice.apply(arguments).concat(data);
    func.apply(scope, args);
  };
};

var calcMoveDistanceFromQueues = function (index, yAxis, modifyQueues) {
  var totalDistance = 0;

  Studio.eventHandlers.forEach(function (handler) {
    var cmd = handler.cmdQueue[0];
    if (cmd && cmd.name === 'moveDistance' && cmd.opts.spriteIndex === index) {
      var scaleFactor;
      var distThisMove = Math.min(cmd.opts.queuedDistance,
                                  Studio.sprite[cmd.opts.spriteIndex].speed);
      switch (cmd.opts.dir) {
        case Direction.NORTH:
          scaleFactor = yAxis ? -1 : 0;
          break;
        case Direction.WEST:
          scaleFactor = yAxis ? 0: -1;
          break;
        case Direction.SOUTH:
          scaleFactor = yAxis ? 1 : 0;
          break;
        case Direction.EAST:
          scaleFactor = yAxis ? 0: 1;
          break;
      }
      if (modifyQueues && (0 !== scaleFactor)) {
        cmd.opts.queuedDistance -= distThisMove;
        if ("0.00" === Math.abs(cmd.opts.queuedDistance).toFixed(2)) {
          cmd.opts.queuedDistance = 0;
        }
      }
      totalDistance += distThisMove * scaleFactor;
    }
  });

  return totalDistance;
};


var cancelQueuedMovements = function (index, yAxis) {
  Studio.eventHandlers.forEach(function (handler) {
    var cmd = handler.cmdQueue[0];
    if (cmd && cmd.name === 'moveDistance' && cmd.opts.spriteIndex === index) {
      var dir = cmd.opts.dir;
      if (yAxis && (dir === Direction.NORTH || dir === Direction.SOUTH)) {
        cmd.opts.queuedDistance = 0;
      } else if (!yAxis && (dir === Direction.EAST || dir === Direction.WEST)) {
        cmd.opts.queuedDistance = 0;
      }
    }
  });
};

//
// Return the next position for this sprite on a given coordinate axis
// given the queued moves (yAxis == false means xAxis)
// NOTE: position values returned are not clamped to playspace boundaries
//

var getNextPosition = function (i, yAxis, modifyQueues) {
  var curPos = yAxis ? Studio.sprite[i].y : Studio.sprite[i].x;
  return curPos + calcMoveDistanceFromQueues(i, yAxis, modifyQueues);
};

//
// Perform Queued Moves in the X and Y axes (called from inside onTick)
//
var performQueuedMoves = function (i) {
  var sprite = Studio.sprite[i];

  var origX = sprite.x;
  var origY = sprite.y;

  var nextX = getNextPosition(i, false, true);
  var nextY = getNextPosition(i, true, true);

  if (level.allowSpritesOutsidePlayspace) {
    sprite.x = nextX;
    sprite.y = nextY;
  } else {
    var playspaceBoundaries = Studio.getPlayspaceBoundaries(sprite);

    // Clamp nextX to boundaries as newX:
    var newX = Math.min(playspaceBoundaries.right,
                        Math.max(playspaceBoundaries.left, nextX));
    if (nextX != newX) {
      cancelQueuedMovements(i, false);
    }
    sprite.x = newX;

    // Clamp nextY to boundaries as newY:
    var newY = Math.min(playspaceBoundaries.bottom,
                        Math.max(playspaceBoundaries.top, nextY));
    if (nextY != newY) {
      cancelQueuedMovements(i, true);
    }
    sprite.y = newY;
  }

  // if sprite position changed, note it
  if (origX !== sprite.x || origY !== sprite.y) {
    sprite.lastMove = Studio.tickCount;
  }
};

//
// Set text into SVG text tspan elements (manual word wrapping)
// Thanks http://stackoverflow.com/questions/
//        7046986/svg-using-getcomputedtextlength-to-wrap-text
//
// opts.svgText: existing svg 'text' element
// opts.text: full-length text string
// opts.width: total width
// opts.fullHeight: total height (fits maxLines of text)
// opts.maxLines: max number of text lines
// opts.lineHeight: height per line of text
// opts.topMargin: top margin
// opts.sideMargin: left & right margin (deducted from total width)
//

var setSvgText = function(opts) {
  // Remove any children from the svgText node:
  while (opts.svgText.firstChild) {
    opts.svgText.removeChild(opts.svgText.firstChild);
  }

  var words = opts.text.toString().split(' ');
  // Create first tspan element
  var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  tspan.setAttribute("x", opts.width / 2);
  tspan.setAttribute("dy", opts.lineHeight + opts.topMargin);
  // Create text in tspan element
  var text_node = document.createTextNode(words[0]);

  // Add text to tspan element
  tspan.appendChild(text_node);
  // Add tspan element to DOM
  opts.svgText.appendChild(tspan);
  var tSpansAdded = 1;

  for (var i = 1; i < words.length; i++) {
    // Find number of letters in string
    var len = tspan.firstChild.data.length;
    // Add next word
    tspan.firstChild.data += " " + words[i];

    if (tspan.getComputedTextLength &&
      tspan.getComputedTextLength() > opts.width - 2 * opts.sideMargin) {
      // Remove added word
      tspan.firstChild.data = tspan.firstChild.data.slice(0, len);

      if (opts.maxLines === tSpansAdded) {
        return opts.fullHeight;
      }
      // Create new tspan element
      tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute("x", opts.width / 2);
      tspan.setAttribute("dy", opts.lineHeight);
      text_node = document.createTextNode(words[i]);
      tspan.appendChild(text_node);
      opts.svgText.appendChild(tspan);
      tSpansAdded++;
    }
  }
  var linesLessThanMax = opts.maxLines - Math.max(1, tSpansAdded);
  return opts.fullHeight - linesLessThanMax * opts.lineHeight;
};

/**
 * Execute the code for all of the event handlers that match an event name
 * @param {string} name Name of the handler we want to call
 * @param {boolean} allowQueueExension When true, we allow additional cmds to
 *  be appended to the queue
 * @param {Array} extraArgs Additional arguments passed into the virtual
*   JS machine for consumption by the student's event-handling code.
 */
function callHandler (name, allowQueueExtension, extraArgs) {
  if (level.autoArrowSteer) {
    var moveDir;
    switch (name) {
      case 'when-up':
        moveDir = Direction.NORTH;
        break;
      case 'when-down':
        moveDir = Direction.SOUTH;
        break;
      case 'when-left':
        moveDir = Direction.WEST;
        break;
      case 'when-right':
        moveDir = Direction.EAST;
        break;
    }
    if (moveDir) {
      Studio.queueCmd(null, 'move', {
        'spriteIndex': Studio.protagonistSpriteIndex || 0,
        'dir': moveDir
      });
    }
  }

  Studio.eventHandlers.forEach(function (handler) {
    if (studioApp.isUsingBlockly()) {
      // Note: we skip executing the code if we have not completed executing
      // the cmdQueue on this handler (checking for non-zero length)
      if (handler.name === name &&
          (allowQueueExtension || (0 === handler.cmdQueue.length))) {
        Studio.currentCmdQueue = handler.cmdQueue;
        try {
          handler.func(studioApp, api, Studio.Globals);
        } catch (e) {
          // Do nothing
        }
        Studio.currentCmdQueue = null;
      }
    } else {
      // TODO (cpirich): support events with parameters
      if (handler.name === name) {
        handler.func.apply(null, extraArgs);
      }
    }
  });
}

Studio.initAutoHandlers = function (map) {
  for (var funcName in map) {
    var func = Studio.JSInterpreter.findGlobalFunction(funcName);
    var nativeFunc = codegen.createNativeFunctionFromInterpreterFunction(func);
    if (func) {
      registerEventHandler(Studio.eventHandlers, map[funcName], nativeFunc);
    }
  }
};

/**
 * Performs movement on a list of Projectiles or Items. Removes items from the
 * list automatically when they move out of bounds
 * @param {Item[]|Projectile[]} list
 */
function performItemOrProjectileMoves (list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].moveToNextPosition();
    if (list[i].outOfBounds()) {
      list[i].removeElement();
      list.splice(i, 1);
    }
  }
}

/**
 * Triggers display update on a list of Sprites, Projectiles, or Items - for
 * updating position and/or animation frames.
 * @param {Collidable[]} list
 */
function displayCollidables (list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].display();
  }
}

/**
 * Sort the draw order of sprites, explosions, items, and tiles so that items
 * higher on the screen are drawn before the ones in front, for a simple form of
 * z-sorting.
 */
function sortDrawOrder() {
  if (!level.sortDrawOrder) {
    return;
  }

  var spriteLayer = document.getElementById('spriteLayer');

  var drawArray = [];
  var drawItem;

  // Add items.
  for (var i = 0; i < Studio.items.length; i++) {
    drawItem = {
      element: Studio.items[i].getElement(),
      y: Studio.items[i].y + Studio.items[i].height/2 + Studio.items[i].renderOffset.y
    };
    drawArray.push(drawItem);

    Studio.drawDebugRect("itemLocation", Studio.items[i].x, Studio.items[i].y, 4, 4);
    Studio.drawDebugRect("itemBottom", Studio.items[i].x, drawItem.y, 4, 4);
  }

  // Add sprite elements (both legacy and normal) and explosions.
  for (i = 0; i < Studio.sprite.length; i++) {
    var sprite = Studio.sprite[i];
    var y = sprite.displayY + sprite.height;

    drawItem = {
      element: document.getElementById('explosion' + i),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    drawItem = {
      element: sprite.getElement(),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    drawItem = {
      element: sprite.getLegacyElement(),
      y: y
    };
    if (drawItem.element) {
      drawArray.push(drawItem);
    }

    Studio.drawDebugRect("spriteBottom", Studio.sprite[i].x, sprite.y, 4, 4);
  }

  // Add wall tiles.
  for (i = 0; i < Studio.tiles.length; i++) {
    drawArray.push({
      element: document.getElementById('tile_' + i),
      y: Studio.tiles[i].bottomY
    });
  }

  // Add goals.
  for (i = 0; i < Studio.spriteGoals_.length; i++) {
    var goalHeight = skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;

    drawArray.push({
      element: document.getElementById('spriteFinish' + i),
      y: Studio.spriteGoals_[i].y + goalHeight
    });
  }

  // Now sort everything by y.
  drawArray = _.sortBy(drawArray, 'y');

  // Carefully place the elements back in the DOM starting at the end of the
  // spriteLayer and, one by one, insert them before the previous one
  // (this prevents flashing in Safari vs. an in-order appendChild() loop)
  var prevNode;
  for (i = drawArray.length - 1; i >= 0; i--) {
    if (prevNode) {
      spriteLayer.insertBefore(drawArray[i].element, prevNode);
    } else {
      spriteLayer.appendChild(drawArray[i].element);
    }
    prevNode = drawArray[i].element;
  }
}

/**
 * This is a little weird, but is effectively a way for us to call api code
 * (i.e. the methods in studio/api.js) so that we can essentially simulate
 * generated code. It does this by creating an event handler for the given name,
 * calling the handler - which results in func being executed to generate a
 * command queue - and then executing the command queue.
 */
Studio.callApiCode = function (name, func) {
  registerEventHandler(Studio.eventHandlers, name, func);
  // generate the cmdQueue
  callHandler(name);
  Studio.executeQueue(name);
};

Studio.onTick = function() {
  Studio.tickCount++;
  var i;

  Studio.clearDebugElements();

  var animationOnlyFrame = Studio.pauseInterpreter ||
      (0 !== (Studio.tickCount - 1) % Studio.slowExecutionFactor);

  if (!animationOnlyFrame && Studio.yieldExecutionTicks > 0) {
    Studio.yieldExecutionTicks--;
  }

  if (Studio.customLogic) {
    Studio.customLogic.onTick();
  }

  if (Studio.tickCount === 1) {
    callHandler('whenGameStarts');
  }

  if (!animationOnlyFrame) {
    Studio.executeQueue('whenGameStarts');

    callHandler('repeatForever');
    Studio.executeQueue('repeatForever');

    for (i = 0; i < Studio.spriteCount; i++) {
      Studio.executeQueue('whenSpriteClicked-' + i);
    }

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

    updateItems();

    checkForCollisions();
  }

  if (Studio.JSInterpreter &&
      !animationOnlyFrame &&
      Studio.yieldExecutionTicks === 0) {
    Studio.JSInterpreter.executeInterpreter(Studio.tickCount === 1);
  }

  var spritesNeedMoreAnimationFrames = false;

  for (i = 0; i < Studio.spriteCount; i++) {
    if (!animationOnlyFrame) {
      performQueuedMoves(i);
    }

    // After 5 ticks of no movement, turn sprite forward.
    var ticksBeforeFaceSouth = utils.valueOr(level.ticksBeforeFaceSouth, Studio.ticksBeforeFaceSouth);
    if (Studio.tickCount - Studio.sprite[i].lastMove > Studio.ticksBeforeFaceSouth) {
      Studio.sprite[i].setDirection(Direction.NONE);
      Studio.movementAudioOff();
    }

    // Display sprite:
    Studio.displaySprite(i);

    var sprite = Studio.sprite[i];
    if (sprite.hasActions()) {
      spritesNeedMoreAnimationFrames = true;
    }

    Studio.drawDebugRect("spriteCenter", Studio.sprite[i].x, Studio.sprite[i].y, 5, 5);
  }

  // Animate goals
  Studio.animateGoals();

  // Animate clouds
  Studio.animateClouds();

  if (!animationOnlyFrame) {
    performItemOrProjectileMoves(Studio.projectiles);
    performItemOrProjectileMoves(Studio.items);
  }
  displayCollidables(Studio.sprite);
  displayCollidables(Studio.projectiles);
  displayCollidables(Studio.items);

  Studio.updateFloatingScore();

  Studio.drawTimeoutRect();

  sortDrawOrder();

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
};

/**
 * Returns the distance between two sprites on the specified axis.
 * @param {number} i1 The index of the first sprite.
 * @param {number} i2 The index of the second sprite.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function spriteCollisionDistance  (i1, i2, yAxis) {
  var sprite1Width  = skin.spriteCollisionRectWidth  || Studio.sprite[i1].width;
  var sprite1Height = skin.spriteCollisionRectHeight || Studio.sprite[i1].height;
  var sprite2Width  = skin.spriteCollisionRectWidth  || Studio.sprite[i2].width;
  var sprite2Height = skin.spriteCollisionRectHeight || Studio.sprite[i2].height;

  var dim1 = yAxis ? sprite1Height : sprite1Width;
  var dim2 = yAxis ? sprite2Height : sprite2Width;
  return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
}

/**
 * Returns the distance between a sprite and a collidable on the specified axis.
 * @param {number} i1 The index of the sprite.
 * @param {number} i2 The index of the collidable.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function spriteCollidableCollisionDistance (iS, collidable, yAxis) {
  var spriteWidth = skin.spriteCollisionRectWidth || Studio.sprite[iS].width;
  var spriteHeight = skin.spriteCollisionRectHeight || Studio.sprite[iS].height;
  var collidableWidth = skin.itemCollisionRectWidth || collidable.width;
  var collidableHeight = skin.itemCollisionRectHeight || collidable.height;
  var dim1 = yAxis ? spriteHeight : spriteWidth;
  var dim2 = yAxis ? collidableHeight : collidableWidth;
  return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
}

/**
 * Returns the distance between a collidable and an edge on the specified axis.
 * @param {number} i1 The index of the collidable.
 * @param {string} i2 The name of the edge.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function edgeCollidableCollisionDistance (collidable, edgeName, yAxis) {
  var dim1 = yAxis ? collidable.height : collidable.width;
  var dim2;
  if (edgeName === 'left' || edgeName === 'right') {
    dim2 = yAxis ? Studio.MAZE_HEIGHT : 0;
  } else {
    dim2 = yAxis ? 0 : Studio.MAZE_WIDTH;
  }
  return (dim1 + dim2) / 2;
}

/* Checks for collisions between an actor and a list of projectiles or items.
 * Calls startCollision/endCollision and handleCollision for className, but not
 * executeCollision, which is expected to be called afterwards by the caller.
 */
function handleActorCollisionsWithCollidableList (
           spriteIndex, xCenter, yCenter, list, autoDisappear) {
  // Traverse the list in reverse order because we may remove elements from the
  // list while inside the loop:
  for (var i = list.length - 1; i >= 0; i--) {
    var collidable = list[i];
    var next = collidable.getNextPosition();

    if (collidable.isFading && collidable.isFading()) {
      continue;
    }

    var distanceScaling = constants.SPRITE_COLLIDE_DISTANCE_SCALING;

    Studio.drawDebugRect("itemCollision",
      next.x,
      next.y,
      distanceScaling * (skin.itemCollisionRectWidth || collidable.width),
      distanceScaling * (skin.itemCollisionRectHeight || collidable.height));
    Studio.drawDebugRect("spriteCollision",
      xCenter,
      yCenter,
      distanceScaling * (skin.spriteCollisionRectWidth || Studio.sprite[spriteIndex].width),
      distanceScaling * (skin.spriteCollisionRectHeight || Studio.sprite[spriteIndex].height));

    if (collisionTest(
          xCenter,
          next.x,
          spriteCollidableCollisionDistance(spriteIndex, collidable, false),
          yCenter,
          next.y,
          spriteCollidableCollisionDistance(spriteIndex, collidable, true))) {
      if (collidable.startCollision(spriteIndex)) {
        Studio.currentEventParams = {eventObject: collidable};
        // Allow cmdQueue extension (pass true) since this handler
        // may be called for multiple collidables before executing the queue
        // below

        // NOTE: not using collideSpriteWith() because collision state is
        // tracked on the collidable in this case
        handleCollision(spriteIndex, collidable.className, true);
        Studio.currentEventParams = null;

        // Make the projectile/item disappear automatically if this parameter
        // is set:
        if (autoDisappear) {
          if (list === Studio.items) {
            // NOTE: we do this only for the Item list (not projectiles)

            // NOTE: if items are allowed to move outOfBounds(), this may never
            // be called because the last item may not be removed here.

            if (list.length === 1) {
              callHandler('whenGetAllItems');
              Studio.trackedBehavior.gotAllItems = true;
            }

            var className = collidable.className;
            var itemCount = 0;
            for (var j = 0; j < list.length; j++) {
              if (className === list[j].className) {
                itemCount++;
              }
            }

            if (itemCount === 1) {
              callHandler('whenGetAll-' + className);
            }
          }

          if (collidable.beginRemoveElement) {
            collidable.beginRemoveElement();
          } else {
            collidable.removeElement();
            list.splice(i, 1);
          }
        }
      }
    } else {
      collidable.endCollision(spriteIndex);
    }
  }
}

/* Checks for collisions between a collidable and all of the edges.
 * Calls startCollision and endCollision on the projectile. The caller
 * should pass in a function to handle the case when a new collision is
 * detected. executeCollision() is expected to be called later by the caller.
 */
function handleEdgeCollisions (collidable, xPos, yPos, onCollided) {
  for (var i = 0; i < EdgeClassNames.length && level.edgeCollisions; i++) {
    var edgeXCenter, edgeYCenter;
    var edgeClass = EdgeClassNames[i];
    switch (edgeClass) {
      case 'top':
        edgeXCenter = Studio.MAZE_WIDTH / 2;
        edgeYCenter = 0;
        break;
      case 'left':
        edgeXCenter = 0;
        edgeYCenter = Studio.MAZE_HEIGHT / 2;
        break;
      case 'bottom':
        edgeXCenter = Studio.MAZE_WIDTH / 2;
        edgeYCenter = Studio.MAZE_HEIGHT;
        break;
      case 'right':
        edgeXCenter = Studio.MAZE_WIDTH;
        edgeYCenter = Studio.MAZE_HEIGHT / 2;
        break;
    }
    if (collisionTest(
          xPos,
          edgeXCenter,
          edgeCollidableCollisionDistance(collidable, edgeClass, false),
          yPos,
          edgeYCenter,
          edgeCollidableCollisionDistance(collidable, edgeClass, true))) {
      if (collidable.startCollision(edgeClass)) {
        onCollided(edgeClass);
      }
    } else {
      collidable.endCollision(edgeClass);
    }
  }
}

/* Create an edge collision handler callback for a specific spriteIndex
 */
function createActorEdgeCollisionHandler (spriteIndex) {
  return function (edgeClass) {
    handleCollision(spriteIndex, edgeClass);
  };
}

/* Check for collisions (note that we use the positions they are about
 * to attain with queued moves - this allows the moves to be canceled before
 * the actual movements take place)
 */
function checkForCollisions() {

  checkForItemCollisions();

  for (var i = 0; i < Studio.spriteCount; i++) {
    var sprite = Studio.sprite[i];
    if (!sprite.visible) {
      // hidden sprite can't collide with anything
      continue;
    }
    var iHalfWidth = sprite.width / 2;
    var iHalfHeight = sprite.height / 2;
    var iXPos = getNextPosition(i, false, false);
    var iYPos = getNextPosition(i, true, false);
    var iXCenter = iXPos + iHalfWidth;
    var iYCenter = iYPos + iHalfHeight;
    for (var j = 0; j < Studio.spriteCount; j++) {
      if (i == j || !Studio.sprite[j].visible) {
        continue;
      }
      var jXCenter = getNextPosition(j, false, false) +
                      Studio.sprite[j].width / 2;
      var jYCenter = getNextPosition(j, true, false) +
                      Studio.sprite[j].height / 2;
      if (collisionTest(iXCenter,
                        jXCenter,
                        spriteCollisionDistance(i, j, false),
                        iYCenter,
                        jYCenter,
                        spriteCollisionDistance(i, j, true))) {
        Studio.collideSpriteWith(i, j);
      } else {
        sprite.endCollision(j);
      }
      executeCollision(i, j);
    }

    handleActorCollisionsWithCollidableList(i,
                                            iXCenter,
                                            iYCenter,
                                            Studio.projectiles);
    handleActorCollisionsWithCollidableList(i,
                                            iXCenter,
                                            iYCenter,
                                            Studio.items,
                                            level.removeItemsWhenActorCollides);

    handleEdgeCollisions(
        sprite,
        iXCenter,
        iYCenter,
        createActorEdgeCollisionHandler(i));

    if (level.wallMapCollisions) {
      if (Studio.willSpriteTouchWall(sprite, iXPos, iYPos)) {
        if (level.blockMovingIntoWalls) {
          cancelQueuedMovements(i, false);
          cancelQueuedMovements(i, true);

          // Since we never overlap the wall/obstacle when blockMovingIntoWalls
          // is set, throttle the event so it doesn't fire every frame while
          // attempting to move into a wall:

          Studio.throttledCollideSpriteWithWallFunctions[i]();

        } else {
          Studio.collideSpriteWith(i, 'wall');
        }
      } else {
        sprite.endCollision('wall');
      }
    }

    // Don't execute actor collision queue(s) until we've handled all
    // wall, projectile, item, and edge collisions. Not sure this is strictly
    // necessary, but it preserves behavior that student code may depend upon.
    executeCollision(i, 'wall');
    for (j = 0; j < EdgeClassNames.length; j++) {
      executeCollision(i, EdgeClassNames[j]);
    }
    for (j = 0; j < skin.ProjectileClassNames.length; j++) {
      executeCollision(i, skin.ProjectileClassNames[j]);
    }
    for (j = 0; j < skin.ItemClassNames.length; j++) {
      executeCollision(i, skin.ItemClassNames[j]);
      if (level.removeItemsWhenActorCollides) {
        Studio.executeQueue('whenGetAll-' + skin.ItemClassNames[j]);
      }
    }
    if (level.removeItemsWhenActorCollides) {
      Studio.executeQueue('whenGetAllItems');
    }
  }
}

/* Create an edge collision handler callback for a specific item
 */
function createItemEdgeCollisionHandler (item) {
  return function (edgeClass) {
    Studio.currentEventParams = {eventObject: item};
    // Allow cmdQueue extension (pass true) since this handler
    // may be called for multiple items before executing the queue
    // below
    handleItemCollision(item.className, edgeClass, true);
    Studio.currentEventParams = null;
  };
}

/* Calls each item's update function
 */
function updateItems () {
  // Traverse the list in reverse order because we may remove elements from the
  // list while inside the loop:
  for (var i = Studio.items.length - 1; i >= 0; i--) {
    var item = Studio.items[i];

    item.update();

    if (item.hasCompletedFade()) {
      item.removeElement();
      Studio.items.splice(i, 1);
    }
  }
}

function checkForItemCollisions () {
  for (var i = 0; i < Studio.items.length; i++) {
    var item = Studio.items[i];
    var next = item.getNextPosition();

    if (item.isFading && item.isFading()) {
      continue;
    }

    if (level.wallMapCollisions) {
      if (Studio.willCollidableTouchWall(item, next.x, next.y)) {
        Studio.currentEventParams = {eventObject: item};
        // Allow cmdQueue extension (pass true) since this handler
        // may be called for multiple items before executing the queue
        // below
        Studio.collideItemWith(item, 'wall', true);
        Studio.currentEventParams = null;
      } else {
        item.endCollision('wall');
      }
    }

    if (level.edgeCollisions) {
      handleEdgeCollisions(
          item,
          next.x,
          next.y,
          createItemEdgeCollisionHandler(item));
    }

    // After collisions have been handled for these items, now execute the
    // command queues for this item:
    executeItemCollision(item.className, 'wall');
    for (var j = 0; j < EdgeClassNames.length; j++) {
      executeItemCollision(item.className, EdgeClassNames[j]);
    }
  }
}

/**
 * Test to see if an actor sprite will be touching a wall given particular X/Y
 * position coordinates (top-left)
 */
Studio.willSpriteTouchWall = function (sprite, xPos, yPos) {
  var xCenter = xPos + sprite.width / 2;
  var yCenter = yPos + sprite.height / 2;
  return Studio.willCollidableTouchWall(sprite, xCenter, yCenter);
};

/**
 * Test to see if an actor sprite will be beyond its given playspace boundaries
 * if it is moved to a given X/Y position.
 * @param {Sprite} sprite
 * @param {number} xPos
 * @param {number} yPos
 */
Studio.willSpriteLeavePlayspace = function (sprite, xPos, yPos) {
  var boundary = Studio.getPlayspaceBoundaries(sprite);
  return (xPos < boundary.left) || (xPos > boundary.right) ||
      (yPos < boundary.top) || (yPos > boundary.bottom);
};

/**
 * Get a wall value (either a SquareType.WALL value or a specific row/col tile
 * from a 16x16 grid shifted into bits 16-23).
 */

Studio.getWallValue = function (row, col) {
  if (row < 0 || row >= Studio.ROWS || col < 0 || col >= Studio.COLS) {
    return 0;
  }

  if (Studio.wallMap) {
    return skin[Studio.wallMap] ? (skin[Studio.wallMap][row][col] << constants.WallCoordsShift): 0;
  } else {
    return Studio.map[row][col] & constants.WallAnyMask;
  }
};

/**
 * Test to see if a collidable will be touching a wall given particular X/Y
 * position coordinates (center)
 */

Studio.willCollidableTouchWall = function (collidable, xCenter, yCenter) {
  var collidableHeight = collidable.height;
  var collidableWidth = collidable.width;

  if (!level.gridAlignedMovement) {
    xCenter += skin.wallCollisionRectOffsetX;
    yCenter += skin.wallCollisionRectOffsetY;
    collidableHeight = skin.wallCollisionRectHeight || collidableHeight;
    collidableWidth = skin.wallCollisionRectWidth || collidableWidth;
  }

  Studio.drawDebugRect("avatarCollision", xCenter, yCenter, collidableWidth, collidableHeight);

  var colsOffset = Math.floor(xCenter) + 1;
  var rowsOffset = Math.floor(yCenter) + 1;
  var xGrid = Math.floor(xCenter / Studio.SQUARE_SIZE);
  var iYGrid = Math.floor(yCenter / Studio.SQUARE_SIZE);

  var collisionRects = null;
  if (skin.customObstacleZones &&
      skin.customObstacleZones[Studio.background] &&
      skin.customObstacleZones[Studio.background][Studio.wallMapRequested]) {
    collisionRects = skin.customObstacleZones[Studio.background][Studio.wallMapRequested];
  }

  if (collisionRects) {
    // Compare against a set of specific rectangles.
    for (var i = 0; i < collisionRects.length; i++) {
      var rect = collisionRects[i];
      var rectWidth = rect.maxX-rect.minX+1;
      var rectHeight = rect.maxY-rect.minY+1;
      var rectCenterX = rect.minX + rectWidth/2;
      var rectCenterY = rect.minY + rectHeight/2;
      Studio.drawDebugRect("avatarCollision", rectCenterX, rectCenterY, rectWidth, rectHeight);
      if (overlappingTest(xCenter,
                          rectCenterX,
                          rectWidth / 2 + collidableWidth / 2,
                          yCenter,
                          rectCenterY,
                          rectHeight / 2 + collidableHeight / 2)) {
        return true;
      }
    }
  } else {
    // Compare against regular wall tiles.
    for (var col = Math.max(0, xGrid - colsOffset);
         col < Math.min(Studio.COLS, xGrid + colsOffset);
         col++) {
      for (var row = Math.max(0, iYGrid - rowsOffset);
           row < Math.min(Studio.ROWS, iYGrid + rowsOffset);
           row++) {
        if (Studio.getWallValue(row, col)) {
          Studio.drawDebugRect("avatarCollision",
                               (col + 0.5) * Studio.SQUARE_SIZE,
                               (row + 0.5) * Studio.SQUARE_SIZE,
                               Studio.SQUARE_SIZE,
                               Studio.SQUARE_SIZE);
          if (overlappingTest(xCenter,
                              (col + 0.5) * Studio.SQUARE_SIZE,
                              Studio.SQUARE_SIZE / 2 + collidableWidth / 2,
                              yCenter,
                              (row + 0.5) * Studio.SQUARE_SIZE,
                              Studio.SQUARE_SIZE / 2 + collidableHeight / 2)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

Studio.onSvgDrag = function(e) {
  if (Studio.tickCount > 0) {
    Studio.gesturesObserved[e.gesture.direction] =
      Math.round(e.gesture.distance / DRAG_DISTANCE_TO_MOVE_RATIO);
    e.gesture.preventDefault();
  }
};

Studio.onKey = function(e) {
  // Store the most recent event type per-key
  Studio.keyState[e.keyCode] = e.type;

  // If we are actively running our tick loop, suppress default event handling
  if (Studio.tickCount > 0 &&
      e.keyCode >= KeyCodes.LEFT && e.keyCode <= KeyCodes.DOWN) {
    e.preventDefault();
  }
};

Studio.onArrowButtonDown = function(e, idBtn) {
  // Store the most recent event type per-button
  Studio.btnState[idBtn] = ButtonState.DOWN;
  e.preventDefault();  // Stop normal events so we see mouseup later.
};

Studio.onSpriteClicked = function(e, spriteIndex) {
  // If we are "running", call the event handler if registered.
  if (Studio.tickCount > 0) {
    callHandler('whenSpriteClicked-' + spriteIndex);
  }
  e.preventDefault();  // Stop normal events.
};

Studio.onSvgClicked = function(e) {
  if (level.tapSvgToRunAndReset && Studio.gameState === Studio.GameStates.WAITING) {
    Studio.runButtonClick();
  } else if (level.tapSvgToRunAndReset && Studio.gameState === Studio.GameStates.OVER) {
    studioApp.resetButtonClick();
  } else if (Studio.tickCount > 0) {
    // If we are "running", check the cmdQueues.
    // Check the first command in all of the cmdQueues to see if there is a
    // pending "wait for click" command
    Studio.eventHandlers.forEach(function (handler) {
      var cmd = handler.cmdQueue[0];

      if (cmd && cmd.opts.waitForClick && !cmd.opts.complete) {
        if (cmd.opts.waitCallback) {
          cmd.opts.waitCallback();
        }
        cmd.opts.complete = true;
      }
    });
  }
  e.preventDefault();  // Stop normal events.
};

Studio.onArrowButtonUp = function(e, idBtn) {
  // Store the most recent event type per-button
  Studio.btnState[idBtn] = ButtonState.UP;
};

Studio.onMouseUp = function(e) {
  // Reset btnState on mouse up
  Studio.btnState = {};
};

Studio.initSprites = function () {
  Studio.spriteCount = 0;
  Studio.sprite = [];
  Studio.startTime = null;

  Studio.spriteGoals_ = [];

  // Locate the start and finish positions.
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      if (Studio.map[row][col] & SquareType.SPRITEFINISH) {
        Studio.spriteGoals_.push({x: col * Studio.SQUARE_SIZE,
                                  y: row * Studio.SQUARE_SIZE,
                                  finished: false});
      } else if (Studio.map[row][col] & SquareType.SPRITESTART) {
        if (0 === Studio.spriteCount) {
          Studio.spriteStart_ = [];
        }
        Studio.spriteStart_[Studio.spriteCount] = {x: col * Studio.SQUARE_SIZE,
                                                   y: row * Studio.SQUARE_SIZE};
        Studio.spriteCount++;
      }
    }
  }

  if (studioApp.isUsingBlockly()) {
    // Update the sprite count in the blocks:
    blocks.setSpriteCount(Blockly, Studio.spriteCount);
    blocks.setStartAvatars(Studio.startAvatars);

    if (level.projectileCollisions) {
      blocks.enableProjectileCollisions(Blockly);
    }

    if (level.edgeCollisions) {
      blocks.enableEdgeCollisions(Blockly);
    }

    if (level.allowSpritesOutsidePlayspace) {
      blocks.enableSpritesOutsidePlayspace(Blockly);
    }
  }
};

/**
 * Initialize Blockly and Studio for read-only (blocks feedback).
 * Called on iframe load for read-only.
 */
Studio.initReadonly = function(config) {
  // Do some minimal level loading and sprite initialization so that
  // we can ensure that the blocks are appropriately modified for this level
  skin = config.skin;
  level = config.level;

  // Initialize paramLists with skin and level data:
  paramLists.initWithSkinAndLevel(skin, level);

  loadLevel();

  config.appMsg = studioMsg;

  Studio.initSprites();

  studioApp.initReadonly(config);
};

/**
 * Initialize Blockly and the Studio app.  Called on page load.
 */
Studio.init = function(config) {
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  // Set focus on the run button so key events can be handled
  // right from the start without requiring the user to adjust focus.
  // (Required for IE11 at least, and takes focus away from text mode editor
  // in droplet.)
  $(window).on('run_button_pressed', function () {
    document.getElementById('runButton').focus();
  });

  Studio.projectiles = [];
  Studio.items = [];
  Studio.itemSpeed = {};
  Studio.itemActivity = {};
  Studio.eventHandlers = [];
  Studio.perExecutionTimeouts = [];
  Studio.tickIntervalId = null;
  Studio.tiles = [];
  Studio.tilesDrawn = false;

  Studio.cloudStep = 0;

  Studio.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  consoleLogger = new JsInterpreterLogger(window.console);

  // Allow any studioMsg string to be re-mapped on a per-level basis:
  for (var prop in level.msgStringOverrides) {
    studioMsg[prop] = studioMsg[level.msgStringOverrides[prop]];
  }

  // Initialize paramLists with skin and level data:
  paramLists.initWithSkinAndLevel(skin, level);

  // In our Algebra course, we want to gray out undeletable blocks. I'm not sure
  // whether or not that's desired in our other courses.
  var isAlgebraLevel = !!level.useContractEditor;
  config.grayOutUndeletableBlocks = isAlgebraLevel;

  loadLevel();

  Studio.background = getDefaultBackgroundName();

  if (Studio.customLogic) {
    // We don't want icons in instructions for our custom logic base games
    skin.staticAvatar = null;
    skin.smallStaticAvatar = null;
    skin.failureAvatar = null;
    skin.winAvatar = null;
  }

  window.addEventListener("keydown", Studio.onKey, false);
  window.addEventListener("keyup", Studio.onKey, false);

  var showFinishButton = !level.isProjectLevel;
  var finishButtonFirstLine = _.isEmpty(level.softButtons);
  var firstControlsRow = require('./controls.html.ejs')({
    assetUrl: studioApp.assetUrl,
    finishButton: finishButtonFirstLine && showFinishButton
  });
  var extraControlRows = require('./extraControlRows.html.ejs')({
    assetUrl: studioApp.assetUrl,
    finishButton: !finishButtonFirstLine && showFinishButton
  });

  var levelTracks = [];
  if (level.music && skin.musicMetadata) {
    levelTracks = skin.musicMetadata.filter(function(trackMetadata) {
      return level.music.indexOf(trackMetadata.name) !== -1;
    });
  }

  Studio.makeThrottledPlaySound();

  /**
   * Helper that handles music loading/playing/crossfading for the level.
   * @type {MusicController}
   */
  Studio.musicController = new MusicController(
      studioApp.cdoSounds, skin.assetUrl, levelTracks);

  /**
   * Defines the set of possible movement sound effects for each playlab actor.
   * Populated just-in-time by setSprite to avoid preparing audio for actors
   * we never use.
   * @type {Object}
   */
  Studio.movementAudioEffects = {};

  config.loadAudio = function() {
    var soundFileNames = [];
    // We want to load the built-in sounds in the skin
    soundFileNames.push.apply(soundFileNames, skin.builtinSounds);
    // We also want to load the student accessible list of effects available in the skin
    soundFileNames.push.apply(soundFileNames, skin.sounds);
    // We also want to load the movement sounds used in hoc2015
    soundFileNames.push.apply(soundFileNames, Studio.getMovementSoundFileNames(skin));
    // No need to load anything twice, so de-dupe our list.
    soundFileNames = _.uniq(soundFileNames);

    skin.soundFiles = {};
    soundFileNames.forEach(function (sound) {
      sound = sound.toLowerCase();
      skin.soundFiles[sound] = [skin.assetUrl(sound + '.mp3'), skin.assetUrl(sound + '.ogg')];
      studioApp.loadAudio(skin.soundFiles[sound], sound);
    });

    // Handle music separately - the music controller does its own preloading.
    Studio.musicController.preload();
  };

  // Play music when the instructions are shown
  var playOnce = function () {
    document.removeEventListener('instructionsShown', playOnce);
    if (studioApp.cdoSounds) {
      studioApp.cdoSounds.whenAudioUnlocked(function () {
        Studio.musicController.play();
      });
    }
  };
  document.addEventListener('instructionsShown', playOnce);

  config.afterInject = function() {
    // Connect up arrow button event handlers
    for (var btn in ArrowIds) {
      dom.addMouseUpTouchEvent(document.getElementById(ArrowIds[btn]),
                               delegate(this,
                                        Studio.onArrowButtonUp,
                                        ArrowIds[btn]));
      dom.addMouseDownTouchEvent(document.getElementById(ArrowIds[btn]),
                                 delegate(this,
                                          Studio.onArrowButtonDown,
                                          ArrowIds[btn]));
    }
    document.addEventListener('mouseup', Studio.onMouseUp, false);

    if (studioApp.isUsingBlockly()) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Studio.scale.snapRadius;

      if (Blockly.contractEditor) {
        Blockly.contractEditor.registerTestHandler(Studio.getStudioExampleFailure);
      }
    }

    drawMap();

    if (!!config.level.projectTemplateLevelName) {
      studioApp.displayWorkspaceAlert('warning', <div>{commonMsg.projectWarning()}</div>);
    }
  };

  config.afterClearPuzzle = function() {
    studioApp.resetButtonClick();
  };

  // Since we allow "show code" for some blockly levels with move blocks,
  // we supply a polishCodeHook function here to make the generated code look
  // more readable:
  config.polishCodeHook = function (code) {
    if (studioApp.isUsingBlockly()) {
      var regexpMoveUpBlock = /Studio.move\('\S*', 0, 1\);/g;
      code = code.replace(regexpMoveUpBlock, "moveUp();");
      var regexpMoveRightBlock = /Studio.move\('\S*', 0, 2\);/g;
      code = code.replace(regexpMoveRightBlock, "moveRight();");
      var regexpMoveDownBlock = /Studio.move\('\S*', 0, 4\);/g;
      code = code.replace(regexpMoveDownBlock, "moveDown();");
      var regexpMoveLeftBlock = /Studio.move\('\S*', 0, 8\);/g;
      code = code.replace(regexpMoveLeftBlock, "moveLeft();");
    }
    return code;
  };

  config.twitter = skin.twitterOptions || twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = studioMsg.makeYourOwn();
  config.makeUrl = "http://code.org/studio";
  config.makeImage = studioApp.assetUrl('media/promo.png');

  // Disable "show code" button in feedback dialog and workspace if blockly,
  // unless the level specifically requests it
  config.enableShowCode =
    studioApp.editCode ? true : utils.valueOr(level.enableShowCode, false);
  config.varsInGlobals = true;
  config.dropletConfig = dropletConfig;
  config.dropIntoAceAtLineStart = true;
  config.showDropdownInPalette = true;
  config.unusedConfig = [];
  for (prop in skin.AutohandlerTouchItems) {
    AUTO_HANDLER_MAP[prop] =
        'whenSpriteCollided-' +
        (Studio.protagonistSpriteIndex || 0) + '-' + skin.AutohandlerTouchItems[prop];
  }
  for (prop in skin.AutohandlerGetAllItems) {
    AUTO_HANDLER_MAP[prop] = 'whenGetAll-' + skin.AutohandlerGetAllItems[prop];
  }
  for (prop in level.autohandlerOverrides) {
    AUTO_HANDLER_MAP[prop] = level.autohandlerOverrides[prop];
  }
  for (var handlerName in AUTO_HANDLER_MAP) {
    config.unusedConfig.push(handlerName);
  }

  config.appMsg = studioMsg;

  Studio.initSprites();

  Studio.makeThrottledSpriteWallCollisionHelpers();

  var generateCodeWorkspaceHtmlFromEjs = function () {
    return codeWorkspaceEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  };

  var generateVisualizationColumnHtmlFromEjs = function () {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: firstControlsRow,
        extraControlRows: extraControlRows,
        inputOutputTable: level.inputOutputTable
      }
    });
  };

  var onMount = function () {
    studioApp.init(config);

    var finishButton = document.getElementById('finishButton');
    if (finishButton) {
      dom.addClickTouchEvent(finishButton, Studio.onPuzzleComplete);
    }

    // pre-load images asynchronously
    // (to reduce the likelihood that there is a delay when images
    //  are changed at runtime)
    if (config.skin.preloadAssets) {
      preloadActorImages();
      preloadProjectileAndItemImages();
      preloadBackgroundImages();
    }
  };

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    generateCodeWorkspaceHtml: generateCodeWorkspaceHtmlFromEjs,
    generateVisualizationColumnHtml: generateVisualizationColumnHtmlFromEjs,
    onMount: onMount
  }), document.getElementById(config.containerId));
};

/**
 * Get a flattened list of all the sound file names (sans extensions)
 * specified in the skin for avatar movement (these may be omitted from the
 * skin.sounds list because we don't want them accessible to the player).
 * @param {Object} level skin from which to extract sound effect names.
 * @returns {string[]} which may contain duplicates but will not have any
 *          undefined entries.
 */
Studio.getMovementSoundFileNames = function (fromSkin) {
  var avatarList = fromSkin.avatarList || [];
  return avatarList.map(function (avatarName) {
    var movementAudio = fromSkin[avatarName].movementAudio || [];
    return movementAudio.reduce(function (memo, nextOption) {
      return memo.concat([nextOption.begin, nextOption.loop, nextOption.end]);
    }, []);
  }).reduce(function (memo, next) {
    return memo.concat(next);
  }, []).filter(function (fileName) {
    return fileName !== undefined;
  });
};

var preloadImage = function(url) {
  if (url) {
    var img = new Image();
    img.src = url;
  }
};

var preloadBackgroundImages = function() {
  var imageChoices = skin.backgroundChoicesK1;
  for (var i = 0; i < imageChoices.length; i++) {
    preloadImage(imageChoices[i][0]);
  }
};

var preloadProjectileAndItemImages = function() {
  for (var i = 0; i < skin.ProjectileClassNames.length; i++) {
    preloadImage(skin[skin.ProjectileClassNames[i]]);
  }
  for (i = 0; i < skin.ItemClassNames.length; i++) {
    preloadImage(skin[skin.ItemClassNames[i]]);
  }
};

var preloadActorImages = function() {
  for (var i = 0; i < skin.avatarList.length; i++) {
    preloadImage(skin[skin.avatarList[i]].sprite);
    preloadImage(skin[skin.avatarList[i]].walk);
  }
};

/**
 * Clean up a list of Items or Projectiles.
 */
function resetItemOrProjectileList (list) {
  for (var i = 0; i < list.length; i++) {
    list[i].removeElement();
  }
  // Set length because list = [] will not modify array passed in by reference
  list.length = 0;
}

/**
 * Clear the event handlers and stop the onTick timer.
 */
Studio.clearEventHandlersKillTickLoop = function() {
  // Check the first command in all of the cmdQueues and clear the timeout
  // if there is a pending wait command
  Studio.eventHandlers.forEach(function (handler) {
    var cmd = handler.cmdQueue[0];

    if (cmd && cmd.opts.waitTimeout && !cmd.opts.complete) {
      // Note: not calling waitCallback() or setting complete = true
      window.clearTimeout(cmd.opts.waitTimeout);
    }
  });
  Studio.eventHandlers = [];
  Studio.perExecutionTimeouts.forEach(function (timeout) {
    clearTimeout(timeout);
  });
  clearInterval(Studio.tickIntervalId);
  Studio.perExecutionTimeouts = [];
  Studio.tickCount = 0;
  for (var i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i] && Studio.sprite[i].bubbleTimeout) {
      window.clearTimeout(Studio.sprite[i].bubbleTimeout);
    }
  }
};


/**
 * Return the name (can be dereferenced as skin[name]) of the default background
 * (1st priority is to force to grid if specified by the level, the 2nd priority
 * is to honor the level-specific background value, the 3rd priority is to
 * fall back to the skin's value, which is also used for the blockly block).
 */
function getDefaultBackgroundName() {
  return level.coordinateGridBackground ? 'grid' :
          (level.background || skin.defaultBackground);
}

function getDefaultMapName() {
  return level.wallMapCollisions ? level.wallMap : undefined;
}

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Studio.reset = function(first) {
  var i;
  Studio.clearEventHandlersKillTickLoop();
  Studio.gameState = Studio.GameStates.WAITING;

  resetItemOrProjectileList(Studio.projectiles);
  resetItemOrProjectileList(Studio.items);

  var svg = document.getElementById('svgStudio');

  if (Studio.customLogic) {
    Studio.customLogic.reset();
  }

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Studio.softButtons_.length; i++) {
    document.getElementById(Studio.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    $('#soft-buttons').removeClass('soft-buttons-none').addClass('soft-buttons-' + softButtonCount);
  }

  // True if we should fail before execution, even if freeplay
  Studio.preExecutionFailure = false;
  Studio.message = null;
  Studio.pauseInterpreter = false;

   // True if we have set testResults using level progressConditions
  Studio.progressConditionTestResult = false;

  // Reset the score and title screen.
  Studio.playerScore = 0;
  Studio.scoreText = null;
  Studio.victoryText = '';
  document.getElementById('score')
    .setAttribute('visibility', 'hidden');
  document.getElementById('victoryText')
    .setAttribute('visibility', 'hidden');
  if (dom.isMobile() || dom.isWindowsTouch()) {
    var resetTextA = document.getElementById('resetTextA');
    var resetTextB = document.getElementById('resetTextB');
    if (level.tapSvgToRunAndReset) {
      resetTextA.textContent = studioMsg.tapToPlay();
      resetTextB.textContent = studioMsg.swipeToMove();
      resetTextA.setAttribute('visibility', 'visible');
      resetTextB.setAttribute('visibility', 'visible');
      $('#overlayGroup *').attr('visibility', 'visible');
    } else {
      resetTextA.setAttribute('visibility', 'hidden');
      resetTextB.setAttribute('visibility', 'hidden');
      $('#overlayGroup *').attr('visibility', 'hidden');
    }
  } else {
    var resetText = document.getElementById('resetText');
    if (level.tapSvgToRunAndReset) {
      resetText.textContent = studioMsg.tapOrClickToPlay();
      resetText.setAttribute('visibility', 'visible');
    } else {
      resetText.setAttribute('visibility', 'hidden');
    }
  }
  if (level.floatingScore) {
    document.getElementById('floatingScore')
      .setAttribute('visibility', 'hidden');
  }
  document.getElementById('titleScreenTitle')
    .setAttribute('visibility', 'hidden');
  document.getElementById('titleScreenTextGroup')
    .setAttribute('visibility', 'hidden');

  // Reset configurable variables
  Studio.background = null;
  Studio.wallMap = null;
  Studio.wallMapRequested = null;
  Studio.setBackground({value: getDefaultBackgroundName()});

  // Reset currentCmdQueue and various counts:
  Studio.gesturesObserved = {};
  Studio.currentCmdQueue = null;
  // Number of things that have been said.  Used to validate level completion.
  Studio.sayComplete = 0;
  Studio.playSoundCount = 0;

  // More things used to validate level completion.
  Studio.trackedBehavior = {
    removedItemCount: 0,
    touchedHazardCount: 0,
    setActivityRecord: null,
    hasSetSprite: false,
    hasSetDroidSpeed: false,
    hasSetBackground: false,
    hasSetMap: false,
    hasAddedItem: false,
    hasWonGame: false,
    hasLostGame: false,
    allGoalsVisited: false,
    timedOut: false,
    gotAllItems: false,
    removedItems: {},
    createdItems: {},
    hasSetEmotion: false,
    hasThrownProjectile: false
  };

  // Reset the record of the last direction that the user moved the sprite.
  Studio.lastMoveSingleDir = null;

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Studio.Globals = {};

  if (consoleLogger) {
    consoleLogger.detach();
  }

  // Reset execution state:
  Studio.yieldExecutionTicks = 0;
  if (studioApp.editCode) {
    Studio.executionError = null;
    if (Studio.JSInterpreter) {
      Studio.JSInterpreter.deinitialize();
      Studio.JSInterpreter = null;
    }
  }

  var renderOffset = {
    x: 0,
    y: 0
  };
  if (level.gridAlignedMovement) {
    renderOffset.x = skin.gridSpriteRenderOffsetX || 0;
    renderOffset.y = skin.gridSpriteRenderOffsetY || 0;
  }
  // Move sprites into position.
  for (i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i]) {
      Studio.sprite[i].removeElement();
    }
    Studio.sprite[i] = new Sprite({
      x: Studio.spriteStart_[i].x,
      y: Studio.spriteStart_[i].y,
      displayX: Studio.spriteStart_[i].x,
      displayY: Studio.spriteStart_[i].y,
      loop: true,
      speed: constants.DEFAULT_SPRITE_SPEED,
      size: constants.DEFAULT_SPRITE_SIZE,
      dir: Direction.NONE,
      displayDir: Direction.SOUTH,
      emotion: level.defaultEmotion || Emotions.NORMAL,
      renderOffset: renderOffset,
      // tickCount of last time sprite moved,
      lastMove: Infinity,
      // overridden as soon as we call setSprite
      visible: !level.spritesHiddenToStart
    });

    var opts = {
      spriteIndex: i,
      value: Studio.startAvatars[i % Studio.startAvatars.length],
      forceHidden: level.spritesHiddenToStart
    };
    Studio.setSprite(opts);
    Studio.displaySprite(i);
    document.getElementById('speechBubble' + i)
      .setAttribute('visibility', 'hidden');

    Studio.sprite[i].setOpacity(1);

    var explosion = document.getElementById('explosion' + i);
    if (explosion) {
      explosion.setAttribute('visibility', 'hidden');
    }
  }

  Studio.itemSpeed = {};
  for (var className in skin.specialItemProperties) {
    Studio.itemSpeed[className] = skin.specialItemProperties[className].speed;
  }
  Studio.itemActivity = {};
  for (className in skin.specialItemProperties) {
    Studio.itemActivity[className] = skin.specialItemProperties[className].activity;
  }
  // Create Items that are specified on the map:
  Studio.createLevelItems(svg);

  // Now that sprites are in place, we can set up a map, which might move
  // sprites around.
  var defaultMap = getDefaultMapName();
  if (defaultMap) {
    Studio.setMap({value: getDefaultMapName()});
  }

  // Setting up walls might have moved the sprites, so draw them once more.
  for (i = 0; i < Studio.spriteCount; i++) {
    Studio.displaySprite(i);
  }
  this.resetGoalSprites();
  sortDrawOrder();

  // A little flag for script-based code to consume.
  Studio.levelRestarted = true;

  // Reset whether level has succeeded.
  Studio.succeededTime = null;

  // Stop any current movement sounds
  Studio.movementAudioOff();
};

/**
 * Move all goal sprites to their original positions, and reset their completion
 * state, both visual and logical.
 */
Studio.resetGoalSprites = function () {
  Studio.touchAllGoalsEventFired = false;
  for (var i = 0; i < Studio.spriteGoals_.length; i++) {
    // Mark each finish as incomplete.
    Studio.spriteGoals_[i].finished = false;
    Studio.spriteGoals_[i].startFadeTime = null;

    // Move the finish icons into position.
    var goalOverride = utils.valueOr(level.goalOverride, {});
    var offsetX = utils.valueOr(goalOverride.goalRenderOffsetX,
        utils.valueOr(skin.goalRenderOffsetX, 0));
    var offsetY = utils.valueOr(goalOverride.goalRenderOffsetY,
        utils.valueOr(skin.goalRenderOffsetY, 0));
    var spriteFinishIcon = document.getElementById('spriteFinish' + i);
    spriteFinishIcon.setAttribute('x', Studio.spriteGoals_[i].x + offsetX);
    spriteFinishIcon.setAttribute('y', Studio.spriteGoals_[i].y + offsetY);
    spriteFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Studio.getGoalAssetFromSkin());
    spriteFinishIcon.setAttribute('opacity', 1);
    var finishClipRect = document.getElementById('finishClipRect' + i);
    finishClipRect.setAttribute('x', Studio.spriteGoals_[i].x + offsetX);
    finishClipRect.setAttribute('y', Studio.spriteGoals_[i].y + offsetY);
  }
};

/** @returns {string} URL of the asset to use for goal objects */
Studio.getGoalAssetFromSkin = function () {
  var goalAsset = skin.goal;
  if (level.goalOverride) {
    if (level.goalOverride.goalAnimation) {
      goalAsset = skin[level.goalOverride.goalAnimation];
    } else if (level.goalOverride.goalImage) {
      goalAsset = skin[level.goalOverride.goalImage];
    }
  }
  return goalAsset;
};

/**
 * Runs test of a given example
 * @param exampleBlock
 * @returns {string} string to display after example execution
 */
Studio.getStudioExampleFailure = function (exampleBlock) {
  try {
    var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
    var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");

    studioApp.feedback_.throwOnInvalidExampleBlocks(actualBlock, expectedBlock);

    var defCode = Blockly.Generator.blockSpaceToCode('JavaScript', ['functional_definition']);
    var exampleCode = Blockly.Generator.blocksToCode('JavaScript', [exampleBlock]);
    if (exampleCode) {
      var resultBoolean = codegen.evalWith(defCode + '; return' + exampleCode, {
        StudioApp: studioApp,
        Studio: api,
        Globals: Studio.Globals
      });
      return resultBoolean ? null : "Does not match definition.";
    } else {
      return "No example code.";
    }
  } catch (error) {
    return "Execution error: " + error.message;
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Studio.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  studioApp.toggleRunReset('reset');
  if (studioApp.isUsingBlockly()) {
    Blockly.mainBlockSpace.traceOn(true);
  }

  // Stop the music the first time the run button is pressed (hoc2015)
  Studio.musicController.fadeOut();
  // Remove goal filter effects the first time the run button is pressed
  Studio.removeGoalEffect();

  studioApp.reset(false);
  studioApp.attempts++;
  Studio.startTime = new Date();
  Studio.execute();
  Studio.gameState = Studio.GameStates.ACTIVE;

  if (level.freePlay && !level.isProjectLevel &&
      (!studioApp.hideSource || level.showFinish)) {
    var shareCell = document.getElementById('share-cell');
    if (shareCell.className !== 'share-cell-enabled') {
      shareCell.className = 'share-cell-enabled';
      studioApp.onResize();

      // Fire a custom event on the document so that other code can respond
      // to the finish button being shown.
      var event = document.createEvent('Event');
      event.initEvent('finishButtonShown', true, true);
      document.dispatchEvent(event);
    }
  }

  if (level.showZeroScore) {
    Studio.displayScore();
  }
};

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function() {
  var tryAgainText;
  // For free play, show keep playing, unless it's a big game level
  if (level.freePlay && !(Studio.customLogic instanceof BigGameLogic)) {
    tryAgainText = commonMsg.keepPlaying();
  } else {
    tryAgainText = commonMsg.tryAgain();
  }

  // Let the level override feedback dialog strings.
  var stringFunctions = $.extend({
    continueText: level.freePlay ? commonMsg.nextPuzzle : function () {},
    reinfFeedbackMsg: studioMsg.reinfFeedbackMsg,
    sharingText: studioMsg.shareGame
  }, level.appStringsFunctions);
  var appStrings = {
    continueText: stringFunctions.continueText(),
    reinfFeedbackMsg: stringFunctions.reinfFeedbackMsg({backButton: tryAgainText}),
    sharingText: stringFunctions.sharingText()
  };

  if (!Studio.waitingForReport) {
    studioApp.displayFeedback({
      app: 'studio', //XXX
      skin: skin.id,
      feedbackType: Studio.testResults,
      executionError: Studio.executionError,
      tryAgainText: tryAgainText,
      continueText: appStrings.continueText,
      response: Studio.response,
      level: level,
      showingSharing: !level.disableSharing && level.freePlay && !Studio.preExecutionFailure &&
          !level.projectTemplateLevelName,
      feedbackImage: Studio.feedbackImage,
      twitter: skin.twitterOptions || twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Studio.response && Studio.response.save_to_gallery_url,
      message: Studio.message,
      appStrings: appStrings,
      disablePrinting: level.disablePrinting
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Studio.onReportComplete = function(response) {
  Studio.response = response;
  Studio.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

var registerEventHandler = function (handlers, name, func) {
  handlers.push({
    name: name,
    func: func,
    cmdQueue: []});
};

var registerHandlers =
      function (handlers, blockName, eventNameBase,
                nameParam1, matchParam1Val,
                nameParam2, matchParam2Val) {
  var blocks = Blockly.mainBlockSpace.getTopBlocks();
  for (var x = 0; blocks[x]; x++) {
    var block = blocks[x];
    // default title values to '0' for case when there is only one sprite
    // and no title value is set through a dropdown
    var titleVal1 = block.getTitleValue(nameParam1) || '0';
    var titleVal2 = block.getTitleValue(nameParam2) || '0';
    if (block.type === blockName &&
        (!nameParam1 ||
         matchParam1Val === titleVal1) &&
        (!nameParam2 ||
         matchParam2Val === titleVal2)) {
      var code = Blockly.Generator.blocksToCode('JavaScript', [block]);
      if (code) {
        var func = codegen.functionFromCode(code, {
                                            StudioApp: studioApp,
                                            Studio: api,
                                            Globals: Studio.Globals} );
        var eventName = eventNameBase;
        if (nameParam1) {
          eventName += '-' + matchParam1Val;
        }
        if (nameParam2) {
          eventName += '-' + matchParam2Val;
        }
        registerEventHandler(handlers, eventName, func);
      }
    }
  }
};

var registerHandlersWithSingleSpriteParam =
      function (handlers, blockName, eventNameBase, blockParam) {
  for (var i = 0; i < Studio.spriteCount; i++) {
    registerHandlers(handlers, blockName, eventNameBase, blockParam, String(i));
  }
};

var registerHandlersWithTitleParam =
      function (handlers, blockName, eventNameBase, titleParam, values) {
  for (var i = 0; i < values.length; i++) {
    registerHandlers(handlers, blockName, eventNameBase, titleParam, values[i]);
  }
};

var registerHandlersWithMultipleSpriteParams =
      function (handlers, blockName, eventNameBase, blockParam1, blockParam2) {
  var i;
  var registerHandlersForClassName = function (className) {
    registerHandlers(handlers,
                     blockName,
                     eventNameBase,
                     blockParam1,
                     String(i),
                     blockParam2,
                     className);
  };
  for (i = 0; i < Studio.spriteCount; i++) {
    for (var j = 0; j < Studio.spriteCount; j++) {
      if (i === j) {
        continue;
      }
      registerHandlers(handlers,
                       blockName,
                       eventNameBase,
                       blockParam1,
                       String(i),
                       blockParam2,
                       String(j));
    }
    skin.ProjectileClassNames.forEach(registerHandlersForClassName);
    skin.ItemClassNames.forEach(registerHandlersForClassName);
    EdgeClassNames.forEach(registerHandlersForClassName);
    registerHandlers(handlers, blockName, eventNameBase, blockParam1, String(i),
      blockParam2, 'any_actor');
    registerHandlers(handlers, blockName, eventNameBase, blockParam1, String(i),
      blockParam2, 'any_edge');
    registerHandlers(handlers, blockName, eventNameBase, blockParam1, String(i),
      blockParam2, 'any_projectile');
    registerHandlers(handlers, blockName, eventNameBase, blockParam1, String(i),
      blockParam2, 'anything');
  }
};

//
// Generates code with user-generated function definitions and evals that code
// so these can be called from event handlers. This should be called for each
// block type that defines functions.
//

var defineProcedures = function (blockType) {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', blockType);
  try {
    codegen.evalWith(code, {
      StudioApp: studioApp,
      Studio: api,
      Globals: Studio.Globals
    });
  } catch (e) { }
};

/**
 * Looks for failures that should prevent execution in blockly mode.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForBlocklyPreExecutionFailure = function () {
  if (studioApp.hasUnfilledFunctionalBlock()) {
    Studio.result = false;
    Studio.testResults = TestResults.EMPTY_FUNCTIONAL_BLOCK;
    // Some of our levels (i.e. big game) have a different top level block, but
    // those should be undeletable/unmovable and not hit this. If they do,
    // they'll still get the generic unfilled block message
    Studio.message = studioApp.getUnfilledFunctionalBlockError('functional_start_setValue');
    Studio.preExecutionFailure = true;
    return true;
  }

  if (studioApp.hasExtraTopBlocks()) {
    Studio.result = false;
    Studio.testResults = TestResults.EXTRA_TOP_BLOCKS_FAIL;
    Studio.preExecutionFailure = true;
    return true;
  }

  if (studioApp.hasEmptyFunctionOrVariableName()) {
    Studio.result = false;
    Studio.testResults = TestResults.EMPTY_FUNCTION_NAME;
    Studio.message = commonMsg.unnamedFunction();
    Studio.preExecutionFailure = true;
    return true;
  }

  var outcome = Studio.checkExamples_();
  if (outcome.result !== undefined) {
    $.extend(Studio, outcome);
    Studio.preExecutionFailure = true;
    return true;
  }

  return false;
};

/**
 * @returns {Object} outcome
 * @returns {boolean} outcome.result
 * @returns {number} outcome.testResults
 * @returns {string} outcome.message
 */
Studio.checkExamples_ = function () {
  var outcome = {};
  if (!level.examplesRequired) {
    return outcome;
  }

  var exampleless = studioApp.getFunctionWithoutTwoExamples();
  if (exampleless) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({functionName: exampleless});
    return outcome;
  }

  var unfilled = studioApp.getUnfilledFunctionalExample();
  if (unfilled) {
    outcome.result = ResultType.FAILURE;
    outcome.testResults = TestResults.EXAMPLE_FAILED;

    var name = unfilled.getRootBlock().getInputTargetBlock('ACTUAL')
      .getTitleValue('NAME');
    outcome.message = commonMsg.emptyExampleBlockErrorMsg({functionName: name});
    return outcome;
  }

  var failingBlockName = studioApp.checkForFailingExamples(Studio.getStudioExampleFailure);
  if (failingBlockName) {
    outcome.result = false;
    outcome.testResults = TestResults.EXAMPLE_FAILED;
    outcome.message = commonMsg.exampleErrorMessage({functionName: failingBlockName});
  }

  return outcome;
};

/**
 * Looks for failures that should prevent execution in editCode mode.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForEditCodePreExecutionFailure = function () {
  var funcName = Studio.hasUnexpectedFunction_();
  if (funcName) {
    Studio.result = false;
    Studio.testResults = TestResults.EXTRA_FUNCTION_FAIL;
    Studio.message = studioMsg.extraFunction({
      funcName: funcName + '()'
    });
    Studio.preExecutionFailure = true;
    return true;
  }

  funcName = Studio.hasUnexpectedLocalFunction_();
  if (funcName) {
    Studio.result = false;
    Studio.testResults = TestResults.LOCAL_FUNCTION_FAIL;
    Studio.message = studioMsg.localFunction({
      funcName: funcName + '()'
    });
    Studio.preExecutionFailure = true;
    return true;
  }

  return false;
};

/**
 * @returns {string} the name of the first unexpected function found
 */
Studio.hasUnexpectedFunction_ = function () {
  if (studioApp.editCode &&
      level.preventUserDefinedFunctions &&
      Studio.JSInterpreter) {
    var funcNames = Studio.JSInterpreter.getGlobalFunctionNames();
    for (var name in AUTO_HANDLER_MAP) {
      var index = funcNames.indexOf(name);
      if (index != -1) {
        funcNames.splice(index, 1);
      }
    }
    if (funcNames.length > 0) {
      return funcNames[0];
    }
  }
};

/**
 * @returns {string} the name of the first unexpected local function found
 */
Studio.hasUnexpectedLocalFunction_ = function () {
  if (studioApp.editCode &&
      Studio.JSInterpreter) {
    var funcNames = Studio.JSInterpreter.getLocalFunctionNames();
    for (var name in AUTO_HANDLER_MAP) {
      var index = funcNames.indexOf(name);
      if (index != -1) {
        return name;
      }
    }
  }
};

var ErrorLevel = {
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

/**
 * Output error to console and gutter as appropriate
 * @param {string} warning Text for warning
 * @param {ErrorLevel} level
 * @param {number} lineNum One indexed line number
 */
function outputError(warning, level, lineNum) {
  var text = level + ': ';
  if (lineNum !== undefined) {
    text += 'Line: ' + lineNum + ': ';
  }
  text += warning;
  // TODO: consider how to notify the user without a debug console output area
  if (consoleLogger) {
    consoleLogger.log(text);
  }
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }
}

function handleExecutionError(err, lineNumber) {
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Studio.executionError = {err: err, lineNumber: lineNumber};

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
}

/**
 * Execute the story
 */
Studio.execute = function() {
  Studio.result = studioApp.UNSET;
  Studio.testResults = TestResults.NO_TESTS_RUN;
  Studio.waitingForReport = false;
  Studio.response = null;

  var handlers = [];
  if (studioApp.isUsingBlockly()) {
    if (Studio.checkForBlocklyPreExecutionFailure()) {
      return Studio.onPuzzleComplete();
    }

    registerHandlers(handlers, 'when_run', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setSpeeds', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setBackgroundAndSpeeds',
        'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setFuncs', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setValue', 'whenGameStarts');
    registerHandlers(handlers, 'studio_whenLeft', 'when-left');
    registerHandlers(handlers, 'studio_whenRight', 'when-right');
    registerHandlers(handlers, 'studio_whenUp', 'when-up');
    registerHandlers(handlers, 'studio_whenDown', 'when-down');
    registerHandlersWithTitleParam(handlers,
                                    'studio_whenArrow',
                                    'when',
                                    'VALUE',
                                    ['left', 'right', 'up', 'down']);
    registerHandlers(handlers, 'studio_repeatForever', 'repeatForever');
    registerHandlers(handlers,
                     'studio_whenTouchCharacter',
                     'whenSpriteCollided-' +
                       (Studio.protagonistSpriteIndex || 0) +
                       '-any_item');
    registerHandlers(handlers,
                     'studio_whenGetAllCharacters',
                     'whenGetAllItems');
    registerHandlersWithTitleParam(handlers,
                                   'studio_whenGetAllCharacterClass',
                                   'whenGetAll',
                                   'VALUE',
                                   skin.ItemClassNames);
    registerHandlersWithTitleParam(handlers,
                                   'studio_whenGetCharacter',
                                   'whenSpriteCollided-' +
                                     (Studio.protagonistSpriteIndex || 0),
                                   'VALUE',
                                   ['any_item'].concat(skin.ItemClassNames));
    registerHandlers(handlers, 'studio_whenTouchGoal', 'whenTouchGoal');
    if (level.wallMapCollisions) {
      registerHandlers(handlers,
                       'studio_whenTouchObstacle',
                       'whenSpriteCollided-' +
                         (Studio.protagonistSpriteIndex || 0) +
                         '-wall');
    }
    registerHandlersWithSingleSpriteParam(handlers,
                                    'studio_whenSpriteClicked',
                                    'whenSpriteClicked',
                                    'SPRITE');
    registerHandlersWithMultipleSpriteParams(handlers,
                                     'studio_whenSpriteCollided',
                                     'whenSpriteCollided',
                                     'SPRITE1',
                                     'SPRITE2');
  }

  if (utils.valueOr(level.playStartSound, true)) {
    Studio.playSound({soundName: 'start'});
  }

  studioApp.reset(false);
  studioApp.clearAndAttachRuntimeAnnotations();

  if (level.editCode) {
    var codeWhenRun = studioApp.getCode();
    Studio.JSInterpreter = new JSInterpreter({
      studioApp: studioApp
    });
    Studio.JSInterpreter.onExecutionError.register(handleExecutionError);
    if (consoleLogger) {
      consoleLogger.attachTo(Studio.JSInterpreter);
    }
    Studio.JSInterpreter.parse({
      code: codeWhenRun,
      blocks: dropletConfig.blocks,
      blockFilter: level.executePaletteApisOnly && level.codeFunctions,
      enableEvents: true
    });
    if (!Studio.JSInterpreter.initialized()) {
        return;
    }
    if (Studio.checkForEditCodePreExecutionFailure()) {
      return Studio.onPuzzleComplete();
    }
    Studio.initAutoHandlers(AUTO_HANDLER_MAP);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Studio.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');
    defineProcedures('functional_definition');

    // Set event handlers and start the onTick timer
    Studio.eventHandlers = handlers;
  }

  $('#resetText, #resetTextA, #resetTextB, #overlayGroup *').attr('visibility', 'hidden');

  Studio.perExecutionTimeouts = [];
  Studio.tickIntervalId = window.setInterval(Studio.onTick, Studio.scale.stepSpeed);
};

Studio.feedbackImage = '';
Studio.encodedFeedbackImage = '';

Studio.onPuzzleComplete = function() {
  if (Studio.executionError) {
    Studio.result = ResultType.ERROR;
  } else if (level.freePlay && !Studio.preExecutionFailure) {
    Studio.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Studio.clearEventHandlersKillTickLoop();
  Studio.movementAudioOff();

  if (level.gridAlignedMovement && Studio.JSInterpreter) {
    // If we've been selecting code as we run, we need to call selectCurrentCode()
    // one last time to remove the highlight on the last line of code:
    Studio.JSInterpreter.selectCurrentCode();
  }

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (Studio.result === ResultType.SUCCESS);

  // If preExecutionFailure or progressConditionTestResult, then testResults
  // should already be set
  if (!Studio.preExecutionFailure && ! Studio.progressConditionTestResult) {
    // If the current level is a free play, always return the free play
    // result type
    Studio.testResults = level.freePlay ? TestResults.FREE_PLAY :
      studioApp.getTestResults(levelComplete, {executionError: Studio.executionError});
  }

  if (Studio.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
    Studio.playSound({soundName: 'win'});
  } else {
    Studio.playSound({soundName: 'failure'});
  }

  var program;
  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp.getCode();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Studio.waitingForReport = true;

  var sendReport = function() {
    studioApp.report({
      app: 'studio',
      level: level.id,
      result: Studio.result === ResultType.SUCCESS,
      testResult: Studio.testResults,
      program: encodeURIComponent(program),
      image: Studio.encodedFeedbackImage,
      onComplete: Studio.onReportComplete
    });
  };

  // don't try it if function is not defined, which should probably only be
  // true in our test environment
  if (typeof document.getElementById('svgStudio').toDataURL === 'undefined') {
    sendReport();
  } else {
    document.getElementById('svgStudio').toDataURL("image/jpeg", {
      callback: function(pngDataUrl) {
        Studio.feedbackImage = pngDataUrl;
        Studio.encodedFeedbackImage = encodeURIComponent(Studio.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

/* Return the frame count for items or projectiles
*/
function getFrameCount (className, exceptionList, defaultCount) {
  if (/.gif$/.test(skin[className])) {
    return 1;
  } else if (exceptionList && exceptionList[className] && exceptionList[className].frames) {
    return exceptionList[className].frames;
  }
  return defaultCount;
}

function cellId(prefix, row, col) {
  return prefix + '_' + row + '_' + col;
}

/**
 * Draw a debug rectangle centered on the given location, using the given
 * CSS class name.
 */

Studio.drawDebugRect = function(className, x, y, width, height) {
  if (!showDebugInfo) {
    return;
  }

  var svg = document.getElementById('svgStudio');
  var group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', className + " debugRect");
  var background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('width', width);
  background.setAttribute('height', height);
  background.setAttribute('x', x - width/2);
  background.setAttribute('y', y - height/2);
  background.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
  background.setAttribute('stroke', '#000000');
  background.setAttribute('stroke-width', 1);
  group.appendChild(background);
  svg.appendChild(group);
};

/**
 * Draw a debug line from point to point using the given CSS class name.
 * @param {string} className
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} [color] - defaults to black
 */
Studio.drawDebugLine = function(className, x1, y1, x2, y2, color) {
  if (!showDebugInfo) {
    return;
  }

  color = utils.valueOr(color, '#000000');

  var svg = document.getElementById('svgStudio');
  var group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', className + " debugLine");
  var line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', 2);
  group.appendChild(line);
  svg.appendChild(group);
};

/**
 * Draw a timeout rectangle across the bottom of the play area.
 * It doesn't appear until halfway through the level, and briefly fades in
 * when first appearing.
 * level.showTimeoutRect should be a valid color that can be passed to an SVG
 * 'fill'.
 */
Studio.drawTimeoutRect = function() {
  if (!level.showTimeoutRect || Studio.timeoutFailureTick === Infinity) {
    return;
  }

  $(".timeoutRect").remove();

  // The fraction of the entire level duration that we start and end the
  // fade-in.
  var startFadeInAt = 0.5;
  var endFadeInAt = 0.4;

  var timeRemaining = Studio.timeoutFailureTick - Studio.tickCount;
  var currentFraction = timeRemaining / Studio.timeoutFailureTick;

  if (currentFraction <= startFadeInAt) {
    var opacity = currentFraction < endFadeInAt ? 1 :
      1 - (currentFraction - endFadeInAt) / (startFadeInAt - endFadeInAt);

    var width = timeRemaining * Studio.MAZE_WIDTH / (Studio.timeoutFailureTick * startFadeInAt);
    var height = 6;

    if (width > 0) {
      var svg = document.getElementById('svgStudio');
      var group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class', "timeoutRect");
      var background = document.createElementNS(SVG_NS, 'rect');
      background.setAttribute('opacity', opacity);
      background.setAttribute('width', width);
      background.setAttribute('height', height);
      background.setAttribute('x', 0);
      background.setAttribute('y', Studio.MAZE_HEIGHT - height);
      background.setAttribute('fill', level.showTimeoutRect);
      group.appendChild(background);
      svg.appendChild(group);
    }
  }
};

/**
 * Clear the debug rectangles.
 */

Studio.clearDebugElements = function() {
  $(".debugRect").remove();
  $(".debugLine").remove();
};

Studio.drawWallTile = function (svg, wallVal, row, col) {
  var srcRow, srcCol;

  // Defaults for regular tiles:
  var tiles = skin.tiles;
  var srcWallType = 0;
  var tileSize = Studio.SQUARE_SIZE;
  var addOffset = 0;  // Added to X & Y to offset drawn tile.
  var numSrcRows = 8;
  var numSrcCols = 8;

  // We usually won't try jumbo size.
  var jumboSize = false;

  if (wallVal == SquareType.WALL) {
    // use a random coordinate
    // TODO (cpirich): these should probably be chosen once at level load time
    // and we should allow the level/skin to set specific row/col max values
    // to ensure that reasonable tiles are chosen at random
    srcRow = Math.floor(Math.random() * constants.WallRandomCoordMax);
    // Since [0,0] is not a valid wall tile, ensure that we avoid column zero
    // when row zero was chosen at random
    srcCol = srcRow ?
                Math.floor(Math.random() * constants.WallRandomCoordMax) :
                1 + Math.floor(Math.random() * (constants.WallRandomCoordMax - 1));
  } else {
    // This wall value has been explicitly set.  It encodes the row & col from
    // the spritesheet of wall tile images.
    srcRow = (wallVal & constants.WallCoordRowMask) >> constants.WallCoordRowShift;
    srcCol = (wallVal & constants.WallCoordColMask) >> constants.WallCoordColShift;
    srcWallType = (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

    if (srcWallType === constants.WallType.JUMBO_SIZE) {
      // Jumbo tiles come from a separate sprite sheet which has oversize tiles
      // which are drawn in an overlapping fashion, though centered on the
      // regular tiles' centers.
      jumboSize = true;
      tileSize = skin[Studio.background].jumboTilesSize;
      numSrcRows = skin[Studio.background].jumboTilesRows;
      numSrcCols = skin[Studio.background].jumboTilesCols;
    } else if (srcWallType === constants.WallType.DOUBLE_SIZE) {
      // Double-size tiles are just a regular tile expanded to cover 2x2 tiles.
      tileSize = 2 * Studio.SQUARE_SIZE;
    }
  }

  // Attempt to load tiles that match the current background, if specified.
  if (Studio.background && !jumboSize && skin[Studio.background].tiles) {
    tiles = skin[Studio.background].tiles;
  } else if (Studio.background && jumboSize && skin[Studio.background].jumboTiles) {
    tiles = skin[Studio.background].jumboTiles;
    addOffset = skin[Studio.background].jumboTilesAddOffset;
  }

  var clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'tile_clippath_' + Studio.tiles.length;
  clipPath.setAttribute('id', clipId);
  clipPath.setAttribute('class', "tile");
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', tileSize);
  rect.setAttribute('height', tileSize);
  rect.setAttribute('x', col * Studio.SQUARE_SIZE + addOffset);
  rect.setAttribute('y', row * Studio.SQUARE_SIZE + addOffset);
  clipPath.appendChild(rect);
  svg.appendChild(clipPath);

  var tile = document.createElementNS(SVG_NS, 'image');
  var tileId = 'tile_' + (Studio.tiles.length);
  tile.setAttribute('id', tileId);
  tile.setAttribute('class', "tileClip");
  tile.setAttribute('width', numSrcCols * tileSize);
  tile.setAttribute('height', numSrcRows * tileSize);
  tile.setAttribute('x', col * Studio.SQUARE_SIZE - srcCol * tileSize + addOffset);
  tile.setAttribute('y', row * Studio.SQUARE_SIZE - srcRow * tileSize + addOffset);
  tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', tiles);
  svg.appendChild(tile);

  tile.setAttribute('clip-path', 'url(#' + clipId + ')');

  var tileEntry = {};
  tileEntry.bottomY = row * Studio.SQUARE_SIZE + addOffset + tileSize;
  Studio.tiles.push(tileEntry);
};

Studio.createLevelItems = function (svg) {
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      var mapVal = Studio.map[row][col];
      for (var index = 0; index < skin.ItemClassNames.length; index++) {
        if (constants.squareHasItemClass(index, mapVal)) {
          // Create item:
          var classOptions = Studio.getItemOptionsForItemClass(skin.ItemClassNames[index]);
          var itemOptions = $.extend({}, classOptions, {
            x: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * col,
            y: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * row
          });
          var item = new Item(itemOptions);

          item.createElement(svg);
          // Display immediately (we can't assume it will be updated in onTick
          // right away since this is called after 'Reset' as well as 'Run'
          item.display();
          Studio.items.push(item);
        }
      }
    }
  }
};

Studio.drawMapTiles = function (svg) {

  // If we're just using the level's own map, then draw it only once.
  if (!Studio.wallMap && Studio.tilesDrawn) {
    return;
  }

  Studio.tilesDrawn = true;

  var row, col;

  var tilesDrawn = [];
  for (row = 0; row < Studio.ROWS; row++) {
    tilesDrawn[row] = [];
    for (col = 0; col < Studio.COLS; col++) {
      tilesDrawn[row][col] = false;
    }
  }

  var spriteLayer = document.getElementById('backgroundLayer');

  for (row = 0; row < Studio.ROWS; row++) {
    for (col = 0; col < Studio.COLS; col++) {
      var wallVal = Studio.getWallValue(row, col);
      if (wallVal) {
        // Skip if we've already drawn a large tile that covers this square.
        if (tilesDrawn[row][col]) {
          continue;
        }

        var srcWallType = (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

        if (srcWallType === constants.WallType.DOUBLE_SIZE) {
          tilesDrawn[row][col] = true;
          tilesDrawn[row][col+1] = true;
          tilesDrawn[row+1][col] = true;
          tilesDrawn[row+1][col+1] = true;
        }

        Studio.drawWallTile(spriteLayer, wallVal, row, col);
      }
    }
  }
};

var updateSpeechBubblePath = function (element) {
  var height = +element.getAttribute('height');
  var onTop = 'true' === element.getAttribute('onTop');
  var onRight = 'true' === element.getAttribute('onRight');
  element.setAttribute('d',
                       createSpeechBubblePath(0,
                                              0,
                                              SPEECH_BUBBLE_WIDTH,
                                              height,
                                              SPEECH_BUBBLE_RADIUS,
                                              onTop,
                                              onRight));
};

Studio.displaySprite = function (i) {
  var sprite = Studio.sprite[i];

  // avoid lots of unnecessary changes to hidden sprites
  if (sprite.value === 'hidden') {
    return;
  }

  var extraOffsetX = 0;
  var extraOffsetY = 0;

  if (level.gridAlignedMovement) {
    extraOffsetX = skin.gridSpriteRenderOffsetX || 0;
    extraOffsetY = skin.gridSpriteRenderOffsetY || 0;
  }
  if (sprite.hasActions()) {
    sprite.updateActions();
  } else {
    // TODO (cpirich): move this into Sprite object

    var newDir = Direction.NONE;
    var lastDrawPos = sprite.lastDrawPosition;

    sprite.displayX = sprite.x;
    sprite.displayY = sprite.y;

    var curDrawPos = sprite.getCurrentDrawPosition();

    if ((curDrawPos.x !== lastDrawPos.x) || (curDrawPos.y !== lastDrawPos.y)) {
      if (curDrawPos.x < lastDrawPos.x) {
        newDir |= Direction.WEST;
      } else if (curDrawPos.x > lastDrawPos.x) {
        newDir |= Direction.EAST;
      }
      if (curDrawPos.y < lastDrawPos.y) {
        newDir |= Direction.NORTH;
      } else if (curDrawPos.y > lastDrawPos.y) {
        newDir |= Direction.SOUTH;
      }
    }

    if (newDir !== Direction.NONE || sprite.lastMove === Infinity) {
      // Don't change to Direction.NONE here once we've captured a lastMove
      // value, allow the ticksBeforeFaceSouth code to handle that later...
      sprite.setDirection(newDir);
    }
  }

  // Turn sprite toward target direction after evaluating actions.
  if (sprite.dir !== sprite.displayDir) {
    // Every other frame, assign a new displayDir from state table
    // (only one turn at a time):
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      sprite.displayDir = NextTurn[sprite.displayDir][sprite.dir];
    }
  }

  // TODO (cpirich): (may be redundant with displayCollidables(Studio.sprite)
  // in onTick loop)
  sprite.display();

  var speechBubble = document.getElementById('speechBubble' + i);
  var speechBubblePath = document.getElementById('speechBubblePath' + i);
  var bblHeight = +speechBubblePath.getAttribute('height');
  var wasOnTop = 'true' === speechBubblePath.getAttribute('onTop');
  var wasOnRight = 'true' === speechBubblePath.getAttribute('onRight');
  var nowOnTop = true;
  var nowOnRight = true;
  var ySpeech = sprite.y - (bblHeight + SPEECH_BUBBLE_PADDING);
  if (ySpeech < 0) {
    ySpeech = sprite.y + sprite.height + SPEECH_BUBBLE_PADDING;
    nowOnTop = false;
  }
  var xSpeech = sprite.x + SPEECH_BUBBLE_H_OFFSET;
  if (xSpeech > Studio.MAZE_WIDTH - SPEECH_BUBBLE_WIDTH) {
    xSpeech = sprite.x + sprite.width -
                (SPEECH_BUBBLE_WIDTH + SPEECH_BUBBLE_H_OFFSET);
    nowOnRight = false;
  }
  speechBubblePath.setAttribute('onTop', nowOnTop);
  speechBubblePath.setAttribute('onRight', nowOnRight);

  if (wasOnTop !== nowOnTop || wasOnRight !== nowOnRight) {
    updateSpeechBubblePath(speechBubblePath);
  }

  speechBubble.setAttribute('transform', 'translate(' + xSpeech + ',' +
    ySpeech + ')');
};

Studio.displayScore = function() {
  var score = document.getElementById('score');
  if (Studio.scoreText) {
    score.textContent = Studio.scoreText;
  } else {
    score.textContent = studioMsg.scoreText({
      playerScore: Studio.playerScore
    });
  }
  score.setAttribute('visibility', 'visible');
};

Studio.displayVictoryText = function() {
  var victoryText = document.getElementById('victoryText');
  victoryText.textContent = Studio.victoryText;
  victoryText.setAttribute('visibility', 'visible');
  if (dom.isMobile() || dom.isWindowsTouch()) {
    var resetTextA = document.getElementById('resetTextA');
    var resetTextB = document.getElementById('resetTextB');
    resetTextB.textContent = studioMsg.tapToReset();
    resetTextA.setAttribute('visibility', 'hidden');
    resetTextB.setAttribute('visibility', 'visible');
    $('#overlayGroup image, #overlayGroup rect').attr('visibility', 'hidden');
  } else {
    var resetText = document.getElementById('resetText');
    resetText.textContent = studioMsg.tapOrClickToReset();
    resetText.setAttribute('visibility', 'visible');
  }
};

Studio.animateGoals = function() {
  var currentTime = new Date();

  var animate = level.goalOverride && level.goalOverride.goalAnimation;
  var fade = skin.fadeOutGoal;

  var elapsed, numFrames, frameDuration, frameWidth;

  if (animate) {
    elapsed = currentTime - Studio.startTime;
    numFrames = skin.animatedGoalFrames;
    frameDuration = skin.timePerGoalAnimationFrame;
    frameWidth = skin.goalSpriteWidth;
  }

  // We want each goal animation to play at an offset so they're not all in
  // sync.  By offsetting the frame by (goal index * 7) we ensure that each goal's
  // animation is significantly out of sync.
  var animationOffset = 7;

  for (var i = 0; i < Studio.spriteGoals_.length; i++) {
    var goal = Studio.spriteGoals_[i];
    // Keep animating the goal unless it's finished and we're not fading out.
    if (!goal.finished || goal.startFadeTime) {
      var goalSprite = document.getElementById('spriteFinish' + i);
      var goalClipRect = document.getElementById('finishClipRect' + i);

      if (animate) {
        var baseX = parseInt(goalClipRect.getAttribute('x'), 10);
        var frame = (i * animationOffset + Math.floor(elapsed / frameDuration)) % numFrames;

        goalSprite.setAttribute('x', baseX - frame * frameWidth);
      }

      if (fade) {
        var fadeTime = constants.GOAL_FADE_TIME;

        if (goal.startFadeTime) {
          var opacity = 1 - (currentTime - goal.startFadeTime) / fadeTime;

          if (opacity < 0) {
            opacity = 0;
            goal.startFadeTime = null;
          }

          goalSprite.setAttribute('opacity', opacity);
        }
      }
    }
  }
};


/**
 * Load clouds for the current background if it features them, or hide
 * them if they shouldn't currently be shown.
 */
Studio.loadClouds = function() {
  var cloud, i;
  var showClouds = Studio.background && skin[Studio.background].clouds;

  if (!showClouds) {
    // Hide the clouds offscreen.
    for (i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
      cloud = document.getElementById('cloud' + i);
      cloud.setAttribute('x', -constants.CLOUD_SIZE);
      cloud.setAttribute('y', -constants.CLOUD_SIZE);
    }
  } else {
    // Set up the right clouds.
    for (i = 0; i < skin[Studio.background].clouds.length; i++) {
      cloud = document.getElementById('cloud' + i);
      cloud.setAttribute('width', constants.CLOUD_SIZE);
      cloud.setAttribute('height', constants.CLOUD_SIZE);
      cloud.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        skin[Studio.background].clouds[i]);
      cloud.setAttribute('opacity', constants.CLOUD_OPACITY);

      var location = Studio.getCloudLocation(i);
      cloud.setAttribute('x', location.x);
      cloud.setAttribute('y', location.y);
    }
  }
};


/**
 * Animate clouds if the current background features them.
 */
Studio.animateClouds = function() {
  var showClouds = Studio.background && skin[Studio.background].clouds;
  if (!showClouds) {
    return;
  }

  Studio.cloudStep++;

  for (var i = 0; i < skin[Studio.background].clouds.length; i++) {
    var location = Studio.getCloudLocation(i);
    var cloud = document.getElementById('cloud' + i);
    cloud.setAttribute('x', Math.round(location.x));
    cloud.setAttribute('y', Math.round(location.y));
  }
};


/** Gets the current location of a specified cloud.
 * @param {number} cloudIndex
 * @returns {Object} location
 * @returns {number} location.x
 * @returns {number} location.y
 */
Studio.getCloudLocation = function(cloudIndex) {
  // How many milliseconds to move one pixel.  Higher values mean slower clouds,
  // and making them different causes the clouds to animate out of sync.
  var intervals = [50, 60];

  // How many pixels a cloud moves before it loops.  This value is big enough to
  // make a cloud move entirely aross the game area, looping when completely
  // out of view.
  var distance = Studio.MAZE_WIDTH + constants.CLOUD_SIZE;

  var totalTime = Studio.cloudStep * 30;
  var xOffset = totalTime / intervals[cloudIndex] % distance;

  var x, y;

  if (cloudIndex === 0) {
    // The first cloud animates from top-left to bottom-right, in the upper-right
    // half of the screen.
    x = xOffset - Studio.MAZE_WIDTH/4;
    y = x - Studio.MAZE_HEIGHT/2;
  } else {
    // The second cloud animates from bottom-right to top-left, in the lower-left
    // half of the screen.
    x = Studio.MAZE_WIDTH - xOffset;
    y = x + Studio.MAZE_HEIGHT/2;
  }

  return {x: x, y: y};
};


/**
 * Start showing an upwards-floating score at the location of sprite 0.
 * The floatingScore level property should only be set to true if this
 * is desired.
 @param {number} changeValue The value that is displayed.
 */

Studio.displayFloatingScore = function(changeValue) {
  if (!level.floatingScore) {
    return;
  }

  var sprite = Studio.sprite[0];
  var floatingScore = document.getElementById('floatingScore');
  floatingScore.textContent = changeValue > 0 ? ("+" + changeValue) : changeValue;
  floatingScore.setAttribute('x', sprite.x + sprite.width/2);
  floatingScore.setAttribute('y', sprite.y + sprite.height/2);
  floatingScore.setAttribute('opacity', 1);
  floatingScore.setAttribute('visibility', 'visible');
};

Studio.updateFloatingScore = function() {
  if (!level.floatingScore) {
    return;
  }

  var floatingScore = document.getElementById('floatingScore');
  var y = parseInt(floatingScore.getAttribute('y'));
  var opacity = parseFloat(floatingScore.getAttribute('opacity'));
  if (opacity > 0) {
    opacity += constants.floatingScoreChangeOpacity;
    floatingScore.setAttribute('opacity', opacity);
    y += constants.floatingScoreChangeY;
    floatingScore.setAttribute('y', y);
  }
};

Studio.showCoordinates = function() {
  var sprite = Studio.sprite[Studio.protagonistSpriteIndex || 0];
  if (!sprite) {
    return;
  }
  // convert to math coordinates, with the origin at the bottom left
  // corner of the grid, and distances measured from the center of the
  // sprite.
  var x = sprite.x + 50;
  var y = 350 - sprite.y;
  Studio.setScoreText({text: 'x: ' + x + ' y: ' + y});
};

Studio.queueCmd = function (id, name, opts) {
  var cmd = {
    'id': id,
    'name': name,
    'opts': opts
  };
  if (studioApp.isUsingBlockly() && Studio.currentCmdQueue) {
    if (Studio.currentEventParams) {
      for (var prop in Studio.currentEventParams) {
        cmd.opts[prop] = Studio.currentEventParams[prop];
      }
    }
    Studio.currentCmdQueue.push(cmd);
  } else {
    // in editCode/interpreter mode or if we don't have a current cmdQueue
    // (e.g. move from autoArrowSteer), commands are executed immediately:
    Studio.callCmd(cmd);
  }
};

//
// Execute an entire command queue (specified with the name parameter)
//
// If Studio.yieldExecutionTicks is positive, execution of commands will stop
//

Studio.executeQueue = function (name, oneOnly) {
  Studio.eventHandlers.forEach(function (handler) {
    if (Studio.yieldExecutionTicks > 0) {
      return;
    }
    if (handler.name === name && handler.cmdQueue.length) {
      for (var cmd = handler.cmdQueue[0]; cmd; cmd = handler.cmdQueue[0]) {
        if (Studio.callCmd(cmd)) {
          // Command executed immediately, remove from queue and continue
          handler.cmdQueue.shift();
        } else {
          break;
        }
        if (Studio.yieldExecutionTicks > 0) {
          break;
        }
      }
    }
  });
};

//
// Execute a command from a command queue
//
// Return false if the command is not complete (it will remain in the queue)
// and this function will be called again with the same command later
//
// Return true if the command is complete
//

Studio.callCmd = function (cmd) {
  switch (cmd.name) {
    case 'endGame':
      studioApp.highlight(cmd.id);
      Studio.endGame(cmd.opts);
      break;
    case 'setBackground':
      studioApp.highlight(cmd.id);
      Studio.setBackground(cmd.opts);
      Studio.trackedBehavior.hasSetBackground = true;
      break;
    case 'setMap':
      studioApp.highlight(cmd.id);
      Studio.setMap(cmd.opts);
      Studio.trackedBehavior.hasSetMap = true;
      break;
    case 'setSprite':
      studioApp.highlight(cmd.id);
      Studio.setSprite(cmd.opts);
      Studio.trackedBehavior.hasSetSprite = true;
      break;
    case 'saySprite':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
      }
      return Studio.saySprite(cmd.opts);
    case 'setSpriteEmotion':
      studioApp.highlight(cmd.id);
      Studio.setSpriteEmotion(cmd.opts);
      Studio.trackedBehavior.hasSetEmotion = true;
      break;
    case 'setSpriteSpeed':
      studioApp.highlight(cmd.id);
      Studio.setSpriteSpeed(cmd.opts);
      break;
    case 'setDroidSpeed':
      studioApp.highlight(cmd.id);
      Studio.setDroidSpeed(cmd.opts);
      Studio.trackedBehavior.hasSetDroidSpeed = true;
      break;
    case 'setSpriteSize':
      studioApp.highlight(cmd.id);
      Studio.setSpriteSize(cmd.opts);
      break;
    case 'setSpritePosition':
      studioApp.highlight(cmd.id);
      Studio.setSpritePosition(cmd.opts);
      break;
    case 'setSpriteXY':
      studioApp.highlight(cmd.id);
      Studio.setSpriteXY(cmd.opts);
      break;
    case 'playSound':
      studioApp.highlight(cmd.id);
      Studio.playSound(cmd.opts);
      break;
    case 'showTitleScreen':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
      }
      return Studio.showTitleScreen(cmd.opts);
    case 'move':
      studioApp.highlight(cmd.id);
      Studio.moveSingle(cmd.opts);
      break;
    case 'moveRight':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.EAST,
      });
      break;
    case 'moveLeft':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.WEST,
      });
      break;
    case 'moveUp':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.NORTH,
      });
      break;
    case 'moveDown':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.SOUTH,
      });
      break;
    case 'moveDistance':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
      }
      return Studio.moveDistance(cmd.opts);
    case 'stop':
      studioApp.highlight(cmd.id);
      Studio.stop(cmd.opts);
      break;
    case 'throwProjectile':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
      }
      Studio.trackedBehavior.hasThrownProjectile = true;
      return Studio.throwProjectile(cmd.opts);
    case 'makeProjectile':
      studioApp.highlight(cmd.id);
      Studio.makeProjectile(cmd.opts);
      break;
    case 'changeScore':
      studioApp.highlight(cmd.id);
      Studio.changeScore(cmd.opts);
      break;
    case 'reduceScore':
      studioApp.highlight(cmd.id);
      Studio.reduceScore(cmd.opts);
      break;
    case 'setScoreText':
      studioApp.highlight(cmd.id);
      Studio.setScoreText(cmd.opts);
      break;
    case 'showCoordinates':
      studioApp.highlight(cmd.id);
      Studio.showCoordinates();
      break;
    case 'wait':
      if (!cmd.opts.started) {
        studioApp.highlight(cmd.id);
      }
      return Studio.wait(cmd.opts);
    case 'vanish':
      studioApp.highlight(cmd.id);
      Studio.vanishActor(cmd.opts);
      break;
    case 'addItem':
      studioApp.highlight(cmd.id);
      Studio.addItem(cmd.opts);
      Studio.trackedBehavior.hasAddedItem = true;
      break;
    case 'setItemActivity':
      studioApp.highlight(cmd.id);
      Studio.setItemActivity(cmd.opts);
      break;
    case 'setItemSpeed':
      studioApp.highlight(cmd.id);
      Studio.setItemSpeed(cmd.opts);
      break;
    case 'showDebugInfo':
      studioApp.highlight(cmd.id);
      Studio.showDebugInfo(cmd.opts);
      break;
    case 'onEvent':
      studioApp.highlight(cmd.id);
      Studio.onEvent(cmd.opts);
      break;
  }
  return true;
};

Studio.makeThrottledPlaySound = function() {
  Studio.throttledPlaySound = _.throttle(studioApp.playAudio.bind(studioApp),
    constants.SOUND_THROTTLE_TIME);
};

Studio.makeThrottledSpriteWallCollisionHelpers = function () {
  Studio.throttledCollideSpriteWithWallFunctions = [];

  var makeCollideHelper = function (spriteIndex) {
    return function () {
      // For the case where this is used (blockMovingIntoWalls), we prevented
      // the wall collision, so we need to queue a wall collision event and
      // immediately reset the collision state since we didn't actually overlap:
      Studio.collideSpriteWith(spriteIndex, 'wall');
      Studio.sprite[spriteIndex].endCollision('wall');
    };
  };

  for (var i = 0; i < Studio.spriteCount; i++) {
    Studio.throttledCollideSpriteWithWallFunctions[i] =
      _.throttle(makeCollideHelper(i), constants.TOUCH_OBSTACLE_THROTTLE_TIME);
  }
};

Studio.playSound = function (opts) {

  if (typeof opts.soundName !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.soundName);
  }

  var soundVal = opts.soundName.toLowerCase().trim();
  // Get all non-random values
  var allValues = paramLists.getPlaySoundValues(false);

  if (soundVal === constants.RANDOM_VALUE) {
    // Choose a sound at random:
    soundVal = allValues[Math.floor(Math.random() * allValues.length)].toLowerCase();
  } else {
    var isInAllValues = function (value) {
      return allValues.indexOf(value) != -1;
    };
    for (var group in skin.soundGroups) {
      var groupData = skin.soundGroups[group];
      if (soundVal === groupData.randomValue.toLowerCase()) {
        // Choose a sound at random from this group (intersect sounds in this group
        // based on the suffix range with the allValues array)
        var groupValues = [];
        for (var suffix = groupData.minSuffix; suffix <= groupData.maxSuffix; suffix++) {
          groupValues.push(group + suffix);
        }
        groupValues.filter(isInAllValues);
        soundVal = groupValues[Math.floor(Math.random() * groupValues.length)].toLowerCase();
        break;
      }
    }
  }

  if (!skin.soundFiles[soundVal]) {
    throw new RangeError("Incorrect parameter: " + opts.soundName);
  }

  var skinSoundMetadata = utils.valueOr(skin.soundMetadata, []);
  var playbackOptions = $.extend({
    volume: 1.0
  }, _.find(skinSoundMetadata, function (metadata) {
    return metadata.name.toLowerCase().trim() === soundVal;
  }));

  Studio.throttledPlaySound(soundVal, playbackOptions);
  Studio.playSoundCount++;
};

/**
 * De-duplicated legwork of finding appropriate options for the given item
 * class.  Does not set things like position and direction - those should
 * be applied on top of the returned options object.
 * @param {string} itemClass
 * @returns {Object} options object that can be passed to item constructor.
 */
Studio.getItemOptionsForItemClass = function (itemClass) {
  var classProperties = utils.valueOr(skin.specialItemProperties[itemClass], {});
  return {
    className: itemClass,
    image: skin[itemClass],
    frames: getFrameCount(itemClass, skin.specialItemProperties, skin.itemFrames),
    loop: true,
    width: classProperties.width,
    height: classProperties.height,
    dir: Direction.NONE,
    speed: Studio.itemSpeed[itemClass],
    normalSpeed: classProperties.speed,
    activity: utils.valueOr(Studio.itemActivity[itemClass], "roam"),
    isHazard: classProperties.isHazard,
    spritesCounterclockwise: classProperties.spritesCounterclockwise,
    renderOffset: utils.valueOr(classProperties.renderOffset, {x: 0, y: 0}),
    renderScale: utils.valueOr(classProperties.scale, 1),
    animationFrameDuration: classProperties.animationFrameDuration
  };
};

Studio.addItem = function (opts) {

  if (typeof opts.className !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
        skin.ItemClassNames[Math.floor(Math.random() * skin.ItemClassNames.length)];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError("Incorrect parameter: " + opts.className);
  }

  var directions = [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
    Direction.NORTHEAST,
    Direction.SOUTHEAST,
    Direction.SOUTHWEST,
    Direction.NORTHWEST,
  ];

  // Create stationary, grid-aligned items when level.gridAlignedMovement,
  // otherwise, create randomly placed items travelling in a random direction.
  // Assumes that sprite[0] is in use, and avoids placing the item too close
  // to that sprite.

  var generateRandomItemPosition = function () {
    // TODO (cpirich): check for edge collisions? (currently avoided by placing
    // the items within the coordinate space (x/y min of Studio.HALF_SQUARE,
    // max of max - Studio.HALF_SQUARE)

    var pos = {};
    if (level.itemGridAlignedMovement) {
      pos.x = Studio.HALF_SQUARE +
                Studio.SQUARE_SIZE * Math.floor(Math.random() * Studio.COLS);
      pos.y = Studio.HALF_SQUARE +
                Studio.SQUARE_SIZE * Math.floor(Math.random() * Studio.ROWS);
    } else {
      pos.x = Studio.HALF_SQUARE +
                Math.floor(Math.random() * (Studio.MAZE_WIDTH - Studio.SQUARE_SIZE));
      pos.y = Studio.HALF_SQUARE +
                Math.floor(Math.random() * (Studio.MAZE_HEIGHT - Studio.SQUARE_SIZE));
    }
    return pos;
  };

  var pos = generateRandomItemPosition();
  var dir = level.itemGridAlignedMovement ? Direction.NONE :
      directions[Math.floor(Math.random() * directions.length)];
  var itemOptions = $.extend({}, Studio.getItemOptionsForItemClass(itemClass), {
    x: pos.x,
    y: pos.y,
    dir: dir
  });
  var item = new Item(itemOptions);

  if (level.blockMovingIntoWalls) {
    // TODO (cpirich): just move within the map looking for open spaces instead
    // of randomly retrying random numbers

    var numTries = 0;
    var minDistanceFromSprite = 100;
    while (Studio.willCollidableTouchWall(item, item.x, item.y) ||
           Studio.getDistance(Studio.sprite[0].x + Studio.sprite[0].width/2,
                              Studio.sprite[0].y + Studio.sprite[0].height/2,
                              item.x, item.y) < minDistanceFromSprite) {
      var newPos = generateRandomItemPosition();
      item.x = newPos.x;
      item.y = newPos.y;
      numTries++;
      if (numTries > 100) {
        break;
      }
    }
  }

  item.createElement(document.getElementById('spriteLayer'));
  Studio.items.push(item);
};


Studio.getDistance = function(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
};


Studio.setItemActivity = function (opts) {

  if (typeof opts.className !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
        skin.ItemClassNames[Math.floor(Math.random() * skin.ItemClassNames.length)];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError("Incorrect parameter: " + opts.className);
  }

  if (opts.type === "roam" || opts.type === "chase" ||
      opts.type === "flee" || opts.type === "none") {
    // retain this activity type for items of this class created in the future:
    Studio.itemActivity[itemClass] = opts.type;
    Studio.items.forEach(function (item) {
      if (item.className === itemClass) {
        item.setActivity(opts.type);

        // For verifying success, record this combination of activity type and
        // item type.

        if (!Studio.trackedBehavior.setActivityRecord) {
          Studio.trackedBehavior.setActivityRecord = [];
        }

        if (!Studio.trackedBehavior.setActivityRecord[itemClass]) {
          Studio.trackedBehavior.setActivityRecord[itemClass] = [];
        }

        Studio.trackedBehavior.setActivityRecord[itemClass][opts.type] = true;
      }
    });
  }
};

Studio.setItemSpeed = function (opts) {

  if (typeof opts.className !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.className);
  }

  var itemClass = opts.className.toLowerCase().trim();

  if (itemClass === constants.RANDOM_VALUE) {
    itemClass =
        skin.ItemClassNames[Math.floor(Math.random() * skin.ItemClassNames.length)];
  }

  var skinItem = skin[itemClass];
  if (!skinItem) {
    throw new RangeError("Incorrect parameter: " + opts.className);
  }

  // convert speed string parameter to appropriate numerical speed for this class:
  var newSpeed = utils.valueOr(skin.specialItemProperties[itemClass].speed,
      constants.DEFAULT_ITEM_SPEED);

  if (opts.speed.toLowerCase() === 'fast') {
    newSpeed = Math.floor(newSpeed * 2);
  } else if (opts.speed.toLowerCase() === 'slow') {
    newSpeed = Math.floor(newSpeed / 2);
  }

  // retain this speed value for items of this class created in the future:
  Studio.itemSpeed[itemClass] = newSpeed;
  Studio.items.forEach(function (item) {
    if (item.className === itemClass) {
      item.setSpeed(newSpeed);
    }
  });
};

Studio.showDebugInfo = function (opts) {
  showDebugInfo = opts.value;
};

Studio.vanishActor = function (opts) {
  var spriteLayer = document.getElementById('spriteLayer');

  var spriteIndex = opts.spriteIndex;
  if (spriteIndex < 0 || spriteIndex >= Studio.spriteCount) {
    throw new RangeError("Incorrect parameter: " + spriteIndex);
  }
  var sprite = Studio.sprite[spriteIndex];
  var spriteShowing = sprite.visible || sprite.isFading();

  if (!spriteShowing) {
    return;
  }

  var explosion = document.getElementById('explosion' + spriteIndex);
  var explosionClipRect;
  if (!explosion) {
    var explosionClipPath = document.createElementNS(SVG_NS, 'clipPath');
    explosionClipPath.setAttribute('id', 'explosionClipPath' + spriteIndex);
    explosionClipRect = document.createElementNS(SVG_NS, 'rect');
    explosionClipRect.setAttribute('id', 'explosionClipRect' + spriteIndex);
    // TODO (cpirich): sprite size may change later, so this needs to be fixed
    explosionClipRect.setAttribute('width', sprite.height);
    explosionClipRect.setAttribute('height', sprite.width);
    explosionClipPath.appendChild(explosionClipRect);
    spriteLayer.appendChild(explosionClipPath);

    explosion = document.createElementNS(SVG_NS, 'image');
    explosion.setAttribute('id', 'explosion' + spriteIndex);
    explosion.setAttribute('visibility', 'hidden');
    explosion.setAttribute('clip-path', 'url(#explosionClipPath' + spriteIndex + ')');
    spriteLayer.insertBefore(explosion,
        sprite.getElement() || sprite.getLegacyElement());
  }

  // TODO (cpirich): use displayWidth / displayHeight to make vanish explosions
  // compatible with sprites that are scaled
  var frameWidth = sprite.width;
  var numFrames = skin.explosionFrames;

  var centerPos = sprite.getCurrentDrawPosition();
  var topLeftPos = {
    x: centerPos.x - sprite.width / 2,
    y: centerPos.y - sprite.height / 2
  };

  explosion.setAttribute('height', sprite.height);
  explosion.setAttribute('width', numFrames * frameWidth);
  explosion.setAttribute('x', topLeftPos.x);
  explosion.setAttribute('y', topLeftPos.y);

  explosion.setAttribute('visibility', 'visible');

  explosionClipRect = document.getElementById('explosionClipRect' + spriteIndex);
  explosionClipRect.setAttribute('x', topLeftPos.x);
  explosionClipRect.setAttribute('y', topLeftPos.y);

  if (skin.fadeExplosion) {
    sprite.startFade(skin.explosionFrames * skin.timePerExplosionFrame);
  } else {
    Studio.setSprite({
      spriteIndex: spriteIndex,
      value: 'hidden'
    });
  }

  _.range(0, numFrames).forEach(function (i) {
    Studio.perExecutionTimeouts.push(setTimeout(function () {
      explosion.setAttribute('x', topLeftPos.x - i * frameWidth);
    }, i * skin.timePerExplosionFrame));
  });
  Studio.perExecutionTimeouts.push(setTimeout(function () {
    explosion.setAttribute('visibility', 'hidden');
    if (skin.fadeExplosion) {
      // hide the sprite
      Studio.setSprite({
        spriteIndex: spriteIndex,
        value: 'hidden'
      });
      // restore the normal opacity
      sprite.setOpacity(1);
    }
  }, skin.timePerExplosionFrame * (numFrames + 1)));

  // we append the url with the spriteIndex so that each sprites explosion gets
  // treated as being different, otherwise chrome will animate all existing
  // explosions anytime we try to animate one of them
  explosion.setAttributeNS('http://www.w3.org/1999/xlink',
    'xlink:href', skin.explosion + "?spriteIndex=" + spriteIndex);
};

Studio.setSpriteEmotion = function (opts) {
  Studio.sprite[opts.spriteIndex].emotion = opts.value;
};

Studio.setSpriteSpeed = function (opts) {
  var speed = Math.min(Math.max(opts.value, constants.SpriteSpeed.SLOW),
      constants.SpriteSpeed.VERY_FAST);
  Studio.sprite[opts.spriteIndex].setSpeed(speed);
};

var DROID_SPEEDS = {
  slow: constants.SpriteSpeed.SLOW,
  normal: constants.SpriteSpeed.NORMAL,
  fast: constants.SpriteSpeed.VERY_FAST
};

Studio.setDroidSpeed = function (opts) {

  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var speedValue = opts.value.toLowerCase().trim();

  if (speedValue === constants.RANDOM_VALUE) {
    speedValue = utils.randomKey(DROID_SPEEDS);
  }

  var speedNumericVal = DROID_SPEEDS[speedValue];
  if (typeof speedNumericVal === 'undefined') {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  opts.value = speedNumericVal;
  opts.spriteIndex = Studio.protaganistSpriteIndex || 0;
  Studio.setSpriteSpeed(opts);
};

Studio.setSpriteSize = function (opts) {
  if (Studio.sprite[opts.spriteIndex].size === opts.value) {
    return;
  }

  Studio.sprite[opts.spriteIndex].size = opts.value;
  var curSpriteValue = Studio.sprite[opts.spriteIndex].value;

  if (curSpriteValue !== 'hidden') {
    // Unset .image and .legacyImage so that setSprite's calls to
    // setImage and setLegacyImage will complete.
    // In the future, an implementation that allows for setSpriteSize to
    // update the display more precisely would be valuable.
    // TODO because we skip this step when the sprite is hidden, the
    // following case will not work:
    //    setSprite 'witch'
    //    setSprite 'hidden'
    //    setSpriteSize 0.5
    //    setSprite 'visible'
    // Since setSpriteSize and 'visible' are currently never in the same
    // level, this is not a problem right now, but it would be good to
    // eventually address.
    Studio.sprite[opts.spriteIndex].image = undefined;
    Studio.sprite[opts.spriteIndex].legacyImage = undefined;
    // call setSprite with existing index/value now that we changed the size
    Studio.setSprite({
      spriteIndex: opts.spriteIndex,
      value: curSpriteValue
    });
  }
};

Studio.changeScore = function (opts) {

  if (typeof opts.value !== 'number' &&
      (typeof opts.value !== 'string' || isNaN(opts.value))) {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  Studio.adjustScore(Number(opts.value));
};

Studio.reduceScore = function (opts) {

  if (typeof opts.value !== 'number' &&
      (typeof opts.value !== 'string' || isNaN(opts.value))) {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  Studio.adjustScore(-Number(opts.value));
};

Studio.adjustScore = function(value) {

  Studio.playerScore += value;
  Studio.displayScore();

  Studio.displayFloatingScore(value);

  if (Studio.playerScore - value < 1000 && Studio.playerScore >= 1000) {
    callHandler('whenScore1000');
  }
};


Studio.setScoreText = function (opts) {
  Studio.scoreText = opts.text;
  Studio.displayScore();
};

Studio.setVictoryText = function (opts) {
  Studio.victoryText = opts.text;
  Studio.displayVictoryText();
};

Studio.endGame = function(opts) {
  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var winValue = opts.value.toLowerCase().trim();

  if (winValue == "win") {
    Studio.trackedBehavior.hasWonGame = true;
    Studio.setVictoryText({text: studioMsg.winMessage()});
  } else if (winValue== "lose") {
    Studio.trackedBehavior.hasLostGame = true;
    Studio.setVictoryText({text: studioMsg.loseMessage()});
  } else {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  Studio.gameState = Studio.GameStates.OVER;
};

Studio.setBackground = function (opts) {

  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var backgroundValue = opts.value.toLowerCase().trim();

  if (backgroundValue === constants.RANDOM_VALUE) {
    // NOTE: never select the last item from backgroundChoicesK1, since it is
    // presumed to be the "random" item for blockly
    // NOTE: the [1] index in the array contains the name parameter with an
    // additional set of quotes
    var quotedBackground = skin.backgroundChoicesK1[
        Math.floor(Math.random() * (skin.backgroundChoicesK1.length - 1))][1];
    // Remove the outer quotes:
    backgroundValue = quotedBackground.replace(/^"(.*)"$/, '$1');
  }

  var skinBackground = skin[backgroundValue];
  if (!skinBackground) {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  if (backgroundValue !== Studio.background) {
    Studio.background = backgroundValue;

    var element = document.getElementById('background');
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skinBackground.background);

    // Draw the tiles (again) now that we know which background we're using.
    if (level.wallMapCollisions) {
      // Changing background can cause a change in the map used internally,
      // since we might use a different map to suit this background, so set
      // the map again.
      if (Studio.wallMapRequested) {
        Studio.setMap({value: Studio.wallMapRequested, forceRedraw: true});
      }
    }

    Studio.loadClouds();
  }
};

/**
 * Set the wall map.
 * @param {string} opts.value - The name of the wall map.
 * @param {boolean} opts.forceRedraw - Force drawing map, even if it's already set.
 */
Studio.setMap = function (opts) {

  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var mapValue = opts.value.toLowerCase().trim();

  if (mapValue === constants.RANDOM_VALUE) {
    // NOTE: never select the first item from mapChoices, since it is
    // presumed to be the "random" item for blockly
    // NOTE: the [1] index in the array contains the name parameter with an
    // additional set of quotes
    var quotedMap = skin.mapChoices[
        Math.floor(1 + Math.random() * (skin.mapChoices.length - 1))][1];
    // Remove the outer quotes:
    mapValue = quotedMap.replace(/^"(.*)"$/, '$1');
  }

  var useMap;

  if (mapValue === 'default') {
    // Treat 'default' as resetting to the level's map (Studio.wallMap = null)
    useMap = null;
  } else if (skin.getMap) {
    // Give the skin a chance to adjust the map name depending upon the
    // background name.
    useMap = skin.getMap(Studio.background, mapValue);
  } else {
    useMap = mapValue;
  }

  if (useMap !== null && !skin[useMap]) {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  if (!opts.forceRedraw && useMap === Studio.wallMap) {
    return;
  }

  // Use the actual map for collisions, rendering, etc.
  Studio.wallMap = useMap;

  // Remember the requested name so that we can reuse it next time the
  // background is changed.
  Studio.wallMapRequested = opts.value;

  // Draw the tiles (again) now that we know which background we're using.
  $(".tileClip").remove();
  $(".tile").remove();
  Studio.tiles = [];
  Studio.drawMapTiles();

  Studio.fixSpriteLocation();

  sortDrawOrder();
};

/**
 * A call to setMap might place a wall on top of the sprite.  In that case,
 * find a new nearby location for the sprite that doesn't have a wall.
 * Currently a work in progress with known issues.
 */
Studio.fixSpriteLocation = function () {
  if (level.wallMapCollisions && level.blockMovingIntoWalls) {

    var spriteIndex = 0;

    if (Studio.sprite.length <= spriteIndex) {
      return;
    }

    var sprite = Studio.sprite[spriteIndex];
    var xPos = getNextPosition(spriteIndex, false, false);
    var yPos = getNextPosition(spriteIndex, true, false);

    if (Studio.willSpriteTouchWall(sprite, xPos, yPos)) {

      // Let's assume that one of the surrounding 8 squares is available.
      // (Note: this is a major assumption predicated on level design.)

      var xCenter = xPos + sprite.width / 2;
      var yCenter = yPos + sprite.height / 2;

      xCenter += skin.wallCollisionRectOffsetX + skin.wallCollisionRectWidth / 2;
      yCenter += skin.wallCollisionRectOffsetY + skin.wallCollisionRectHeight / 2;

      var xGrid = Math.floor(xCenter / Studio.SQUARE_SIZE);
      var yGrid = Math.floor(yCenter / Studio.SQUARE_SIZE);

      var minRow = Math.max(yGrid - 1, 0);
      var maxRow = Math.min(yGrid + 1, Studio.ROWS - 1);
      var minCol = Math.max(xGrid - 1, 0);
      var maxCol = Math.min(xGrid + 1, Studio.COLS - 1);

      for (var row = minRow; row <= maxRow; row++) {
        for (var col = minCol; col <= maxCol; col++) {
          if (! Studio.getWallValue(row, col)) {

            sprite.x = Studio.HALF_SQUARE + Studio.SQUARE_SIZE * col - sprite.width / 2 -
              skin.wallCollisionRectOffsetX;
            sprite.y = Studio.HALF_SQUARE + Studio.SQUARE_SIZE * row - sprite.height / 2 -
              skin.wallCollisionRectOffsetY;
            sprite.setDirection(Direction.NONE);

            return;
          }
        }
      }
    }
  }
};

/**
 * Sets an actor to be a specific sprite, or alternatively to be hidden.
 * @param opts.value {string} Name of sprite, or 'hidden'
 * @param opts.spriteIndex {number} Index of the sprite
 */
Studio.setSprite = function (opts) {

  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var spriteValue = opts.value.toLowerCase().trim();

  if (spriteValue === constants.RANDOM_VALUE) {
    spriteValue = skin.avatarList[Math.floor(Math.random() * skin.avatarList.length)];
  }

  var skinSprite = skin[spriteValue];
  if (!skinSprite && spriteValue !== 'hidden' && spriteValue !== 'visible') {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  var spriteIndex = opts.spriteIndex;
  if (spriteIndex < 0 || spriteIndex >= Studio.spriteCount) {
    throw new RangeError("Incorrect parameter: " + spriteIndex);
  }
  var sprite = Studio.sprite[spriteIndex];

  sprite.visible = (spriteValue !== 'hidden' && !opts.forceHidden);

  sprite.value = opts.forceHidden ? 'hidden' : spriteValue;
  if (spriteValue === 'hidden' || spriteValue === 'visible') {
    return;
  }

  sprite.frameCounts = skinSprite.frameCounts;
  sprite.setNormalFrameDuration(skinSprite.animationFrameDuration);
  sprite.drawScale = utils.valueOr(skinSprite.drawScale, 1);
  // Reset height and width:
  if (level.gridAlignedMovement) {
    // This mode only works properly with square sprites
    sprite.height = sprite.width = Studio.SQUARE_SIZE;
    sprite.size = sprite.width / skin.spriteWidth;

    sprite.drawHeight = sprite.drawScale * sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.drawScale * sprite.size * skin.spriteWidth;
  } else {
    sprite.drawHeight = sprite.height =
        sprite.drawScale * sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.width =
        sprite.drawScale * sprite.size * skin.spriteWidth;
  }
  if (skin.projectileSpriteHeight) {
    sprite.projectileSpriteHeight = sprite.size * skin.projectileSpriteHeight;
  }
  if (skin.projectileSpriteWidth) {
    sprite.projectileSpriteWidth = sprite.size * skin.projectileSpriteWidth;
  }

  sprite.setImage(skinSprite.walk, sprite.frameCounts);
  sprite.setLegacyImage(skinSprite.sprite, sprite.frameCounts);

  sprite.createElement(document.getElementById('spriteLayer'));

  var element = sprite.getLegacyElement();
  if (element) {
    dom.addMouseDownTouchEvent(sprite.getLegacyElement(),
        delegate(this, Studio.onSpriteClicked, spriteIndex));
  }
  element = sprite.getElement();
  if (element) {
    dom.addMouseDownTouchEvent(sprite.getElement(),
        delegate(this, Studio.onSpriteClicked, spriteIndex));
  }

  // Set up movement audio for the selected sprite (clips should be preloaded)
  // First, stop any movement audio for the current character.
  Studio.movementAudioOff();
  if (!Studio.movementAudioEffects[spriteValue] && skin.avatarList) {
    var spriteSkin = skin[spriteValue] || {};
    var audioConfig = spriteSkin.movementAudio || [];
    Studio.movementAudioEffects[spriteValue] = [];
    if (studioApp.cdoSounds) {
      Studio.movementAudioEffects[spriteValue] = audioConfig.map(function (audioOption) {
        return new ThreeSliceAudio(studioApp.cdoSounds, audioOption);
      });
    }
  }
  Studio.currentSpriteMovementAudioEffects = Studio.movementAudioEffects[spriteValue];

  // call display right away since the frame number may have changed:
  Studio.displaySprite(spriteIndex);
};

var moveAudioState = false;
Studio.isMovementAudioOn = function () {
  return moveAudioState;
};

Studio.movementAudioOn = function () {
  Studio.movementAudioOff();
  Studio.currentMovementAudio = Studio.currentSpriteMovementAudioEffects[
      Math.floor(Math.random() * Studio.currentSpriteMovementAudioEffects.length)];
  if (Studio.currentMovementAudio) {
    Studio.currentMovementAudio.on();
  }
  moveAudioState = true;
};

Studio.movementAudioOff = function () {
  if (Studio.currentMovementAudio) {
    Studio.currentMovementAudio.off();
  }
  moveAudioState = false;
};

var p = function (x,y) {
  return x + " " + y + " ";
};

var TIP_HEIGHT = 15;
var TIP_WIDTH = 25;
var TIP_X_SHIFT = 10;

//
// createSpeechBubblePath creates a SVG path that looks like a rounded rect
// plus a 'tip' that points back to the sprite.
//
// x, y is the top left position. w, h, r are width/height/radius (for corners)
// onTop, onRight are booleans that are used to tell this function if the
//     bubble is appearing on top and on the right of the sprite.
//
// Thanks to Remy for the original rounded rect path function
/*
http://www.remy-mellet.com/blog/179-draw-rectangle-with-123-or-4-rounded-corner/
*/

var createSpeechBubblePath = function (x, y, w, h, r, onTop, onRight) {
  var strPath = "M"+p(x+r,y); //A
  if (!onTop) {
    if (onRight) {
      strPath+="L"+p(x+r-TIP_X_SHIFT,y-TIP_HEIGHT)+"L"+p(x+r+TIP_WIDTH,y);
    } else {
      strPath+="L"+p(x+w-r-TIP_WIDTH,y)+"L"+p(x+w-TIP_X_SHIFT,y-TIP_HEIGHT);
    }
  }
  strPath+="L"+p(x+w-r,y);
  strPath+="Q"+p(x+w,y)+p(x+w,y+r); //B
  strPath+="L"+p(x+w,y+h-r)+"Q"+p(x+w,y+h)+p(x+w-r,y+h); //C
  if (onTop) {
    if (onRight) {
      strPath+="L"+p(x+r+TIP_WIDTH,y+h)+"L"+p(x+r-TIP_X_SHIFT,y+h+TIP_HEIGHT);
    } else {
      strPath+="L"+p(x+w-TIP_X_SHIFT,y+h+TIP_HEIGHT)+"L"+p(x+w-r-TIP_WIDTH,y+h);
    }
  }
  strPath+="L"+p(x+r,y+h);
  strPath+="Q"+p(x,y+h)+p(x,y+h-r); //D
  strPath+="L"+p(x,y+r)+"Q"+p(x,y)+p(x+r,y); //A
  strPath+="Z";
  return strPath;
};

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

Studio.hideTitleScreen = function (opts) {
  var tsTitle = document.getElementById('titleScreenTitle');
  var tsTextGroup = document.getElementById('titleScreenTextGroup');
  tsTitle.setAttribute('visibility', 'hidden');
  tsTextGroup.setAttribute('visibility', 'hidden');

  opts.complete = true;
};

Studio.showTitleScreen = function (opts) {
  if (!opts.started) {
    opts.started = true;
    var tsTitle = document.getElementById('titleScreenTitle');
    var tsTextGroup = document.getElementById('titleScreenTextGroup');
    var tsText = document.getElementById('titleScreenText');
    var tsTextRect = document.getElementById('titleScreenTextRect');
    tsTitle.textContent = opts.title;
    var svgTextOpts = {
      'svgText': tsText,
      'text': opts.text,
      'width': TITLE_SCREEN_TEXT_WIDTH,
      'lineHeight': TITLE_SCREEN_TEXT_LINE_HEIGHT,
      'topMargin': TITLE_SCREEN_TEXT_TOP_MARGIN,
      'sideMargin': TITLE_SCREEN_TEXT_SIDE_MARGIN,
      'maxLines': TITLE_SCREEN_TEXT_MAX_LINES,
      'fullHeight': TITLE_SCREEN_TEXT_HEIGHT
    };
    var tsTextHeight = setSvgText(svgTextOpts);
    tsTextRect.setAttribute('height', tsTextHeight);

    tsTitle.setAttribute('visibility', 'visible');
    tsTextGroup.setAttribute('visibility', 'visible');

    // Wait for a click or a timeout
    opts.waitForClick = true;
    opts.waitCallback = delegate(this, Studio.hideTitleScreen, opts);
    opts.waitTimeout = window.setTimeout(
        delegate(this, onWaitComplete, opts),
        TITLE_SCREEN_TIMEOUT);
  }

  return opts.complete;
};

Studio.isCmdCurrentInQueue = function (cmdName, queueName) {
  var foundCmd = false;
  Studio.eventHandlers.forEach(function (handler) {
    if (handler.name === queueName) {
      var cmd = handler.cmdQueue[0];

      if (cmd && cmd.name === cmdName) {
        foundCmd = true;
        // would like to break, but can't do that in forEach
      }
    }
  });
  return foundCmd;
};

Studio.hideSpeechBubble = function (opts) {
  var speechBubble = document.getElementById('speechBubble' + opts.spriteIndex);
  speechBubble.setAttribute('visibility', 'hidden');
  speechBubble.removeAttribute('onTop');
  speechBubble.removeAttribute('onRight');
  speechBubble.removeAttribute('height');
  opts.complete = true;
  delete Studio.sprite[opts.spriteIndex].bubbleTimeoutFunc;
  Studio.sayComplete++;
};

Studio.saySprite = function (opts) {
  if (opts.started) {
    return opts.complete;
  }

  var spriteIndex = opts.spriteIndex;
  var sprite = Studio.sprite[spriteIndex];
  if (!sprite) {
    return;
  }

  opts.started = true;

  // Remove any existing speech bubble on this sprite:
  if (sprite.bubbleTimeoutFunc) {
    sprite.bubbleTimeoutFunc();
  }
  window.clearTimeout(sprite.bubbleTimeout);

  if (!sprite.visible) {
    opts.complete = true;
    return opts.complete;
  }

  // Start creating the new speech bubble:
  var bblText = document.getElementById('speechBubbleText' + spriteIndex);

  var svgTextOpts = {
    'svgText': bblText,
    'text': opts.text,
    'width': SPEECH_BUBBLE_WIDTH,
    'lineHeight': SPEECH_BUBBLE_LINE_HEIGHT,
    'topMargin': SPEECH_BUBBLE_TOP_MARGIN,
    'sideMargin': SPEECH_BUBBLE_SIDE_MARGIN,
    'maxLines': SPEECH_BUBBLE_MAX_LINES,
    'fullHeight': SPEECH_BUBBLE_HEIGHT
  };
  var bblHeight = setSvgText(svgTextOpts);
  var speechBubblePath = document.getElementById('speechBubblePath' + spriteIndex);
  var speechBubble = document.getElementById('speechBubble' + spriteIndex);

  speechBubblePath.setAttribute('height', bblHeight);
  updateSpeechBubblePath(speechBubblePath);

  // displaySprite will reposition the bubble
  Studio.displaySprite(opts.spriteIndex);
  speechBubble.setAttribute('visibility', 'visible');

  sprite.bubbleTimeoutFunc = delegate(this, Studio.hideSpeechBubble, opts);
  sprite.bubbleTimeout = window.setTimeout(sprite.bubbleTimeoutFunc,
    opts.seconds * 1000);

  return opts.complete;
};

Studio.stop = function (opts) {
  cancelQueuedMovements(opts.spriteIndex, true);
  cancelQueuedMovements(opts.spriteIndex, false);

  if (!opts.dontResetCollisions) {
    // Reset collisionMasks so the next movement will fire another collision
    // event against the same sprite if needed. This makes it easier to write code
    // that says "when sprite X touches Y" => "stop sprite X", and have it do what
    // you expect it to do...
    var sprite = Studio.sprite[opts.spriteIndex];
    if (!sprite) {
      return;
    }
    sprite.clearCollisions();
    for (var i = 0; i < Studio.spriteCount; i++) {
      if (i === opts.spriteIndex) {
        continue;
      }
      Studio.sprite[i].endCollision(opts.spriteIndex);
    }
  }
};

/**
 * Launch a projectile from the sprite at options.spriteIndex. If the source
 * sprite isn't visible, do nothing.
 */
Studio.throwProjectile = function (options) {
  if (options.started) {
    return options.complete;
  }
  options.started = true;
  options.complete = false;
  window.setTimeout(function () {
    options.complete = true;
  }, MIN_TIME_BETWEEN_PROJECTILES);

  var sourceSprite = Studio.sprite[options.spriteIndex];
  if (!sourceSprite.visible) {
    return;
  }

  var preventLoop = skin.preventProjectileLoop && skin.preventProjectileLoop(options.className);

  var projectileOptions = {
    frames: getFrameCount(options.className, skin.specialProjectileProperties, skin.projectileFrames),
    className: options.className,
    dir: options.dir,
    image: skin[options.className],
    loop: !preventLoop,
    spriteX: sourceSprite.x,
    spriteY: sourceSprite.y,
    spriteHeight: sourceSprite.projectileSpriteHeight || sourceSprite.height,
    spriteWidth: sourceSprite.projectileSpriteWidth || sourceSprite.width,
  };

  var projectile = new Projectile(projectileOptions);
  projectile.createElement(document.getElementById('svgStudio'));
  Studio.projectiles.push(projectile);
};

//
// Internal helper to handle makeProjectile calls on a single projectile
//
// Return value: true if projectile was removed from the projectiles array
//

var doMakeProjectile = function (projectile, action) {
  if (action === 'bounce') {
    projectile.bounce();
  } else if (action === 'disappear') {
    projectile.removeElement();
    var pos = Studio.projectiles.indexOf(projectile);
    if (-1 !== pos) {
      Studio.projectiles.splice(pos, 1);
      return true;
    }
  } else {
    throw "unknown action in doMakeProjectile";
  }
  return false;
};

Studio.makeProjectile = function (opts) {
  // opts.eventObject will be set when we've had a collision with a particular
  // projectile, otherwise we operate all all of that class
  if (opts.eventObject) {
    doMakeProjectile(opts.eventObject, opts.action);
  } else {
    // No "current" projectile, so apply action to all of them of this class
    for (var i = 0; i < Studio.projectiles.length; i++) {
      if (Studio.projectiles[i].className === opts.className &&
          doMakeProjectile(Studio.projectiles[i], opts.action)) {
        // if this returned true, the projectile was deleted

        // decrement i because we just removed an item from the array. We want
        // to keep i as the same value for the next iteration through this loop
        i--;
      }
    }
  }
};

//
// xFromPosition: return left-most point of sprite given position constant
//

var xFromPosition = function (sprite, position) {
  switch (position) {
    case constants.Position.OUTTOPOUTLEFT:
    case constants.Position.TOPOUTLEFT:
    case constants.Position.MIDDLEOUTLEFT:
    case constants.Position.BOTTOMOUTLEFT:
    case constants.Position.OUTBOTTOMOUTLEFT:
      return -sprite.width;
    case constants.Position.OUTTOPLEFT:
    case constants.Position.TOPLEFT:
    case constants.Position.MIDDLELEFT:
    case constants.Position.BOTTOMLEFT:
    case constants.Position.OUTBOTTOMLEFT:
      return 0;
    case constants.Position.OUTTOPCENTER:
    case constants.Position.TOPCENTER:
    case constants.Position.MIDDLECENTER:
    case constants.Position.BOTTOMCENTER:
    case constants.Position.OUTBOTTOMCENTER:
      return (Studio.MAZE_WIDTH - sprite.width) / 2;
    case constants.Position.OUTTOPRIGHT:
    case constants.Position.TOPRIGHT:
    case constants.Position.MIDDLERIGHT:
    case constants.Position.BOTTOMRIGHT:
    case constants.Position.OUTBOTTOMRIGHT:
      return Studio.MAZE_WIDTH - sprite.width;
    case constants.Position.OUTTOPOUTRIGHT:
    case constants.Position.TOPOUTRIGHT:
    case constants.Position.MIDDLEOUTRIGHT:
    case constants.Position.BOTTOMOUTRIGHT:
    case constants.Position.OUTBOTTOMOUTRIGHT:
      return Studio.MAZE_WIDTH;
  }
};

//
// yFromPosition: return top-most point of sprite given position constant
//

var yFromPosition = function (sprite, position) {
  switch (position) {
    case constants.Position.OUTTOPOUTLEFT:
    case constants.Position.OUTTOPLEFT:
    case constants.Position.OUTTOPCENTER:
    case constants.Position.OUTTOPRIGHT:
    case constants.Position.OUTTOPOUTRIGHT:
      return -sprite.height;
    case constants.Position.TOPOUTLEFT:
    case constants.Position.TOPLEFT:
    case constants.Position.TOPCENTER:
    case constants.Position.TOPRIGHT:
    case constants.Position.TOPOUTRIGHT:
      return 0;
    case constants.Position.MIDDLEOUTLEFT:
    case constants.Position.MIDDLELEFT:
    case constants.Position.MIDDLECENTER:
    case constants.Position.MIDDLERIGHT:
    case constants.Position.MIDDLEOUTRIGHT:
      return (Studio.MAZE_HEIGHT - sprite.height) / 2;
    case constants.Position.BOTTOMOUTLEFT:
    case constants.Position.BOTTOMLEFT:
    case constants.Position.BOTTOMCENTER:
    case constants.Position.BOTTOMRIGHT:
    case constants.Position.BOTTOMOUTRIGHT:
      return Studio.MAZE_HEIGHT - sprite.height;
    case constants.Position.OUTBOTTOMOUTLEFT:
    case constants.Position.OUTBOTTOMLEFT:
    case constants.Position.OUTBOTTOMCENTER:
    case constants.Position.OUTBOTTOMRIGHT:
    case constants.Position.OUTBOTTOMOUTRIGHT:
      return Studio.MAZE_HEIGHT;
  }
};

/**
 * Actors have a class name in the form "0". Returns true if this class is
 * an actor
 */
function isActorClass(className) {
  return (/^\d*$/).test(className);
}

function isEdgeClass(className) {
  return EdgeClassNames.indexOf(className) !== -1;
}

function isProjectileClass(className) {
  return skin.ProjectileClassNames.indexOf(className) !== -1;
}

function isItemClass(className) {
  return skin.ItemClassNames.indexOf(className) !== -1;
}

/**
 * Call the handler for an actor (src) colliding with target
 */
function handleCollision(src, target, allowQueueExtension) {
  var prefix = 'whenSpriteCollided-' + src + '-';

  callHandler(prefix + target, allowQueueExtension);
  callHandler(prefix + 'anything', allowQueueExtension);
  // If dest is just a number, we're colliding with another actor
  if (isActorClass(target)) {
    callHandler(prefix + 'any_actor', allowQueueExtension);
  } else if (isEdgeClass(target)) {
    callHandler(prefix + 'any_edge', allowQueueExtension);
  } else if (isProjectileClass(target)) {
    callHandler(prefix + 'any_projectile', allowQueueExtension);
  } else if (isItemClass(target)) {
    callHandler(prefix + 'any_item', allowQueueExtension);
  }
}

/**
 * Call the handler for an item colliding with target
 */
function handleItemCollision(src, target, allowQueueExtension) {
  var prefix = 'whenItemCollided-' + src + '-';

  callHandler(prefix + target, allowQueueExtension);

  if (isEdgeClass(target)) {
    callHandler(prefix + 'any_edge', allowQueueExtension);
  }
}

/**
 * Execute the code for an item colliding with target
 */
function executeItemCollision(src, target) {
  var prefix = 'whenItemCollided-' + src + '-';

  Studio.executeQueue(prefix + target);

  if (isEdgeClass(target)) {
    Studio.executeQueue(prefix + 'any_edge');
  }
}

/**
 * Execute the code for an actor (src) colliding with target
 */
function executeCollision(src, target) {
  var srcPrefix = 'whenSpriteCollided-' + src + '-';

  Studio.executeQueue(srcPrefix + target);

  // src is always an actor
  Studio.executeQueue(srcPrefix + 'any_actor');
  Studio.executeQueue(srcPrefix + 'anything');

  if (isEdgeClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_edge');
  } else if (isProjectileClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_projectile');
  } else if (isItemClass(target)) {
    Studio.executeQueue(srcPrefix + 'any_item');
  }
}

/**
 * Looks to see if the item is already colliding with target.  If it
 * isn't, it starts the collision and calls the relevant code.
 * @param {Collidable} item colliding
 * @param {string/number} target Class name of the target. String for classes,
 *   index if colliding with another sprite.
 * @param {boolean} allowQueueExtension Passed on to callHandler
 */
Studio.collideItemWith = function (item, target, allowQueueExtension) {
  if (item.startCollision(target)) {
    handleItemCollision(item.className, target, allowQueueExtension);
  }
};

/**
 * Looks to see if the sprite is already colliding with target.  If it isn't, it
 * starts the collision and calls the relevant code.
 * @param {Collidable} spriteIndex colliding
 * @param {string/number} target Class name of the target. String for classes,
 *   index if colliding with another sprite.
 * @param {boolean} allowQueueExtension Passed on to callHandler
 */
Studio.collideSpriteWith = function (spriteIndex, target, allowQueueExtension) {
  var sprite = Studio.sprite[spriteIndex];
  if (sprite.startCollision(target)) {
    handleCollision(spriteIndex, target, allowQueueExtension);
  }
};

Studio.setSpritePosition = function (opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  if (opts.value) {
    // fill in .x and .y from the constants.Position value in opts.value
    opts.x = xFromPosition(sprite, opts.value);
    opts.y = yFromPosition(sprite, opts.value);
  }
  var samePosition = (sprite.x === opts.x && sprite.y === opts.y);

  // Don't reset collisions inside stop() if we're in the same position
  Studio.stop({'spriteIndex': opts.spriteIndex,
               'dontResetCollisions': samePosition});
  sprite.displayX = sprite.x = opts.x;
  sprite.displayY = sprite.y = opts.y;
  // Reset to "no direction" so no turn animation will take place
  sprite.setDirection(Direction.NONE);
};

Studio.setSpriteXY = function (opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  var x = opts.x - sprite.width / 2;
  var y = opts.y - sprite.height / 2;
  var samePosition = (sprite.x === x && sprite.y === y);

  // Don't reset collisions inside stop() if we're in the same position
  Studio.stop({
    'spriteIndex': opts.spriteIndex,
    'dontResetCollisions': samePosition
  });
  sprite.displayX = sprite.x = x;
  sprite.displayY = sprite.y = y;
  // Reset to "no direction" so no turn animation will take place
  sprite.setDirection(Direction.NONE);
};

Studio.getPlayspaceBoundaries = function(sprite) {
  var boundaries;

  if (skin.wallCollisionRectWidth && skin.wallCollisionRectHeight && !level.gridAlignedMovement) {
    boundaries = {
      top: 0 - (sprite.height - skin.wallCollisionRectHeight)/2 - skin.wallCollisionRectOffsetY,
      right: Studio.MAZE_WIDTH - skin.wallCollisionRectWidth - (sprite.width - skin.wallCollisionRectWidth)/2 - skin.wallCollisionRectOffsetX,
      bottom: Studio.MAZE_HEIGHT - skin.wallCollisionRectHeight - (sprite.height - skin.wallCollisionRectHeight)/2 - skin.wallCollisionRectOffsetY,
      left: 0 - (sprite.width - skin.wallCollisionRectWidth)/2 - skin.wallCollisionRectOffsetX
    };
  } else {
    boundaries = {
      top: 0,
      right: Studio.MAZE_WIDTH - sprite.width,
      bottom: Studio.MAZE_HEIGHT - sprite.height,
      left: 0
    };
  }

  return boundaries;
};

Studio.getSkin = function() {
  return skin;
};

/**
 * For executing a single "goLeft" or "goNorth" sort of command in student code.
 * Moves the avatar by a different amount.
 * Has slightly different behaviors depending on whether the level is configured
 * for discrete, grid-based movement or free movement.
 * @param {Object} opts
 * @param {Direction} opts.dir - The direction in which the sprite should move.
 * @param {number} opts.spriteIndex
 */
Studio.moveSingle = function (opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  var lastMove = sprite.lastMove;
  sprite.lastMove = Studio.tickCount;
  var distance = level.gridAlignedMovement ? Studio.SQUARE_SIZE : sprite.speed;
  var wallCollision = false;
  var playspaceEdgeCollision = false;
  var deltaX = 0, deltaY = 0;

  switch (opts.dir) {
    case Direction.NORTH:
      deltaY = -distance;
      break;
    case Direction.EAST:
      deltaX = distance;
      break;
    case Direction.SOUTH:
      deltaY = distance;
      break;
    case Direction.WEST:
      deltaX = -distance;
      break;
  }

  var projectedX = sprite.x + deltaX;
  var projectedY = sprite.y + deltaY;

  if (level.blockMovingIntoWalls &&
      Studio.willSpriteTouchWall(sprite, projectedX, projectedY)) {
    wallCollision = true;

    // Since we never overlap the wall/obstacle when blockMovingIntoWalls
    // is set, throttle the event so it doesn't fire every frame while
    // attempting to move into a wall:

    Studio.throttledCollideSpriteWithWallFunctions[opts.spriteIndex]();
  }

  if (!level.allowSpritesOutsidePlayspace &&
      Studio.willSpriteLeavePlayspace(sprite, projectedX, projectedY)) {
    playspaceEdgeCollision = true;
  }

  if (level.gridAlignedMovement) {
    if (wallCollision || playspaceEdgeCollision) {
      sprite.addAction(new spriteActions.GridMoveAndCancel(
          deltaX, deltaY, level.slowExecutionFactor));
    } else {
      sprite.addAction(new spriteActions.GridMove(
          deltaX, deltaY, level.slowExecutionFactor));
    }

    Studio.yieldExecutionTicks += (1 + Studio.gridAlignedExtraPauseSteps);
    if (Studio.JSInterpreter) {
      // Stop executing the interpreter in a tight loop and yield the current
      // execution tick:
      Studio.JSInterpreter.yield();
      // Highlight the code in the editor so the student can see the progress
      // of their program:
      Studio.JSInterpreter.selectCurrentCode();
    }

    Studio.movementAudioOn();
  } else {
    if (!wallCollision) {
      if (playspaceEdgeCollision) {
        var boundary = Studio.getPlayspaceBoundaries(sprite);
        projectedX = Math.max(boundary.left, Math.min(boundary.right, projectedX));
        projectedY = Math.max(boundary.top, Math.min(boundary.bottom, projectedY));
      }
      sprite.x = projectedX;
      sprite.y = projectedY;
    }

    if (!Studio.isMovementAudioOn()) {
      Studio.movementAudioOn();
    }
  }

  Studio.lastMoveSingleDir = opts.dir;
};

Studio.moveDistance = function (opts) {
  if (!opts.started) {
    opts.started = true;
    if (level.gridAlignedMovement) {
      opts.distance =
        Math.ceil(opts.distance / Studio.SQUARE_SIZE) * Studio.SQUARE_SIZE;
    }
    opts.queuedDistance = opts.distance;
  }

  return (0 === opts.queuedDistance);
};

Studio.onEvent = function (opts) {
  registerEventHandler(Studio.eventHandlers, opts.eventName, opts.func);
};

/**
 * Return true if all of the blocks underneath when_run blocks have had their
 * commands executed
 */
Studio.allWhenRunBlocksComplete = function () {
  for (var i = 0; i < Studio.eventHandlers.length; i++) {
    if (Studio.eventHandlers[i].name === 'whenGameStarts' &&
        Studio.eventHandlers[i].cmdQueue.length !== 0) {
      return false;
    }
  }
  return true;
};

Studio.timedOut = function() {
  if (level.timeoutAfterWhenRun) {
    if (level.editCode) {
      // If the interpreter has started handling events, the main body of the
      // program is complete:
      return Studio.JSInterpreter && Studio.JSInterpreter.startedHandlingEvents;
    } else if (Studio.eventHandlers.length === 0 ||
               (Studio.eventHandlers.length === 1 &&
                  Studio.eventHandlers[0].name === 'whenGameStarts' &&
                  Studio.allWhenRunBlocksComplete())) {
      // If the only event block that had children is when_run, and those commands
      // are finished executing, don't wait for the timeout.
      // If we have additional event blocks that DO have children, we don't timeout
      // until timeoutFailureTick
      return true;
    }
  }

  return Studio.tickCount > Studio.timeoutFailureTick;
};

/**
 * Tests whether the sprite is currently at the goal sprite.
 */
function spriteAtGoal(sprite, goal) {
  var goalWidth = utils.valueOr(skin.goalSpriteWidth, Studio.MARKER_WIDTH);
  var goalHeight = utils.valueOr(skin.goalSpriteHeight, Studio.MARKER_HEIGHT);

  var goalCollisionWidth = skin.goalCollisionRectWidth || Studio.MARKER_WIDTH;
  var goalCollisionHeight = skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;

  var spriteCollisionWidth = skin.itemCollisionRectWidth || sprite.width;
  var spriteCollisionHeight = skin.itemCollisionRectHeight || sprite.height;

  var xSpriteCenter = sprite.x + sprite.width / 2;
  var ySpriteCenter = sprite.y + sprite.height / 2;

  var xFinCenter = goal.x + goalWidth / 2 + utils.valueOr(skin.goalRenderOffsetX, 0);
  var yFinCenter = goal.y + goalHeight / 2 + utils.valueOr(skin.goalRenderOffsetY, 0);

  var distanceScaling =
    utils.valueOr(skin.finishCollideDistanceScaling, constants.FINISH_COLLIDE_DISTANCE_SCALING);

  Studio.drawDebugRect("goalCollisionSprite",
                       xSpriteCenter,
                       ySpriteCenter,
                       distanceScaling * spriteCollisionWidth,
                       distanceScaling * spriteCollisionHeight);

  Studio.drawDebugRect("goalCollisionGoal",
                       xFinCenter,
                       yFinCenter,
                       distanceScaling * goalCollisionWidth,
                       distanceScaling * goalCollisionHeight);

  var finishCollisionDistance = function (yAxis) {
    var dim1 = yAxis ? spriteCollisionHeight : spriteCollisionWidth;
    var dim2 = yAxis ? goalCollisionHeight : goalCollisionWidth;


    return distanceScaling * (dim1 + dim2) / 2;
  };

  return collisionTest(xSpriteCenter,
    xFinCenter,
    finishCollisionDistance(false),
    ySpriteCenter,
    yFinCenter,
    finishCollisionDistance(true));
}

Studio.allGoalsVisited = function() {
  var i, playSound;
  // If protagonistSpriteIndex is set, the sprite with this index must navigate
  // to the goals.  Otherwise any sprite can navigate to each goal.
  var protagonistSprite = Studio.sprite[Studio.protagonistSpriteIndex];
  var finishedGoals = 0;

  // Can't visit all goals if we don't have any
  if (Studio.spriteGoals_.length === 0) {
    return false;
  }

  // Can't visit all the goals if the specified sprite doesn't exist
  if (Studio.protagonistSpriteIndex && !protagonistSprite) {
    return false;
  }

  for (i = 0; i < Studio.spriteGoals_.length; i++) {
    var goal = Studio.spriteGoals_[i];
    if (!goal.finished) {
      if (protagonistSprite) {
        var wasGoalFinished = goal.finished;

        goal.finished = spriteAtGoal(protagonistSprite, goal);

        // If goal was just finished, then call the "when actor touches anything handler"
        if (!wasGoalFinished && goal.finished) {
          var allowQueueExtension = false;
          var prefix = 'whenSpriteCollided-' + Studio.protagonistSpriteIndex + '-';
          callHandler(prefix + 'anything', allowQueueExtension);
        }

      } else {
        goal.finished = false;
        for (var j = 0; j < Studio.sprite.length; j++) {
          if (spriteAtGoal(Studio.sprite[j], goal)) {
            goal.finished = true;
            if (skin.fadeOutGoal) {
              goal.startFadeTime = new Date().getTime();
            }

            callHandler('whenTouchGoal');

            break;
          }
        }
      }
      playSound = goal.finished;
    }

    if (goal.finished) {
      finishedGoals++;

      // Play a sound unless we've hit the last flag (though that can be
      // overridden by the skin)
      if (playSound &&
          (finishedGoals !== Studio.spriteGoals_.length || skin.playFinalGoalSound)) {
        Studio.playSound({soundName: 'flag'});
      }

      if (skin.goalSuccess) {
        // Change the finish icon to goalSuccess.
        var successAsset = skin.goalSuccess;
        if (level.goalOverride && level.goalOverride.successImage) {
          successAsset = skin[level.goalOverride.successImage];
        }
        var spriteFinishIcon = document.getElementById('spriteFinish' + i);
        spriteFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink',
          'xlink:href', successAsset);
      }
    }
  }

  var retVal = finishedGoals === Studio.spriteGoals_.length;

  if (retVal && !Studio.touchAllGoalsEventFired) {
    Studio.touchAllGoalsEventFired = true;
    callHandler('whenTouchAllGoals');
  }

  return retVal;
};

/**
 * Returns true if the specified criteria, provided as an Object, is satisfied.
 */
Studio.conditionSatisfied = function(required) {
  var tracked = Studio.trackedBehavior;
  var valueNames = Object.keys(required);

  for (var k = 0; k < valueNames.length; k++) {
    var valueName = valueNames[k];
    var value = required[valueName];

    if (valueName === 'timedOut' && tracked.timedOut != value) {
      return false;
    }

    if (valueName === 'collectedItemsAtOrAbove' && tracked.removedItemCount < value) {
      return false;
    }

    if (valueName === 'collectedItemsBelow' && tracked.removedItemCount >= value) {
      return false;
    }

    if (valueName === 'collectedSpecificItemsAtOrAbove' &&
        (tracked.removedItems[value.className] === undefined ||
         tracked.removedItems[value.className] < value.count)) {
      return false;
    }

    if (valueName == 'collectedSpecificItemsBelow' &&
        tracked.removedItems[value.className] !== undefined &&
        tracked.removedItems[value.className] >= value.count) {
      return false;
    }

    if (valueName === 'createdSpecificItemsAtOrAbove' &&
        (tracked.createdItems[value.className] === undefined ||
         tracked.createdItems[value.className] < value.count)) {
      return false;
    }

    if (valueName == 'createdSpecificItemsBelow' &&
        tracked.createdItems[value.className] !== undefined &&
        tracked.createdItems[value.className] >= value.count) {
      return false;
    }

    if (valueName == 'gotAllItems' && tracked.gotAllItems !== value) {
      return false;
    }

    if (valueName === 'touchedHazardsAtOrAbove' && tracked.touchedHazardCount < value) {
      return false;
    }

    if (valueName === 'currentPointsAtOrAbove' && Studio.playerScore < value) {
      return false;
    }

    if (valueName === 'currentPointsBelow' && Studio.playerScore >= value) {
      return false;
    }

    if (valueName === 'allGoalsVisited' && tracked.allGoalsVisited !== value) {
      return false;
    }

    if (valueName === 'setMap' && tracked.hasSetMap !== value) {
      return false;
    }

    if (valueName === 'setSprite' && tracked.hasSetSprite !== value) {
      return false;
    }

    if (valueName === 'setDroidSpeed' && tracked.hasSetDroidSpeed !== value) {
      return false;
    }

    if (valueName === 'throwProjectile' && tracked.hasThrownProjectile !== value) {
      return false;
    }

    if (valueName === 'setEmotion' && tracked.hasSetEmotion !== value) {
      return false;
    }
  }

  return true;
};

/**
 * @typedef {Object} ProgressConditionOutcome
 * @property {boolean} success
 * @property {string} message
 */

/**
 * A level can provide zero or more progress conditions which are special cases
 * that we test to see if the level has succeeded or failed.  This function
 * evaluates the state of these criteria.  It returns false if none of the
 * criteria affects progress, otherwise an object that contains information
 * about the specific succeeding or failing criteria.
 *
 * @param {Array} conditions.
 * @returns {ProgressConditionOutcome|null}
 */
Studio.checkProgressConditions = function() {
  if (!level.progressConditions) {
    return null;
  }

  for (var i = 0; i < level.progressConditions.length; i++) {
    var condition = level.progressConditions[i];

    if (Studio.conditionSatisfied(condition.required)) {
      return condition.result;
    }
  }

  return null;
};

var checkFinished = function () {

  var hasGoals = Studio.spriteGoals_.length !== 0;
  var achievedGoals = Studio.allGoalsVisited();
  var progressConditionResult = Studio.checkProgressConditions();
  var hasSuccessCondition = level.goal && level.goal.successCondition ? true : false;
  var achievedOptionalSuccessCondition = !hasSuccessCondition || utils.valueOr(level.goal.successCondition(), true);
  var achievedRequiredSuccessCondition = hasSuccessCondition && utils.valueOr(level.goal.successCondition(), false);

  if (progressConditionResult) {
    Studio.result = progressConditionResult.success ? ResultType.SUCCESS : ResultType.FAILURE;
    if (!progressConditionResult.success && progressConditionResult.canPass) {
      Studio.testResults = TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
      Studio.progressConditionTestResult = true;
    }
    var progressMessage = progressConditionResult.message;
    if (studioApp.isUsingBlockly()) {
      progressMessage = progressConditionResult.blocklyMessage || progressMessage;
    }
    Studio.message = utils.valueOr(progressMessage, null);
    Studio.pauseInterpreter = utils.valueOr(progressConditionResult.pauseInterpreter, false);
    return true;
  }

  // Levels with goals (usually images that need to be touched) can have an optional success
  // condition that can explicitly return false to prevent the level from completing.
  // In very rare cases, a level might have goals but not care whether they're touched or not
  // to succeed, relying instead solely on the success function.  In such a case, the level should
  // have completeOnSuccessConditionNotGoals set to true.
  // In the remainder of levels which do not have goals, they simply require a success condition
  // that returns true.

  if ((hasGoals && achievedGoals && achievedOptionalSuccessCondition) ||
      (hasGoals && level.completeOnSuccessConditionNotGoals && achievedRequiredSuccessCondition) ||
      (!hasGoals && achievedRequiredSuccessCondition)) {
    Studio.result = ResultType.SUCCESS;
    return true;
  }

  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Studio.result = ResultType.FAILURE;
    return true;
  }

  // Don't process timedOut condition here if we have progressConditions to take care of
  // things, which can include a timedOut.  This avoids having this condition kick in earlier
  // than level.progressConditions can take care of a timedOut.
  if (!level.progressConditions) {
    if (Studio.timedOut()) {
      Studio.result = ResultType.FAILURE;
      return true;
    }
  }

  return false;
};
