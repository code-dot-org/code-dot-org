require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/studio/main.js":[function(require,module,exports){
(function (global){
var appMain = require('../appMain');
window.Studio = require('./studio');
if (typeof global !== 'undefined') {
  global.Studio = window.Studio;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.studioMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Studio, levels, options);
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/studio/blocks.js","./levels":"/home/ubuntu/staging/apps/build/js/studio/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/studio/skins.js","./studio":"/home/ubuntu/staging/apps/build/js/studio/studio.js"}],"/home/ubuntu/staging/apps/build/js/studio/studio.js":[function(require,module,exports){
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
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var Collidable = require('./collidable');
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
var annotationList = require('../acemode/annotationList');
var spriteActions = require('./spriteActions');
var ImageFilterFactory = require('./ImageFilterFactory');
var ThreeSliceAudio = require('./ThreeSliceAudio');
var MusicController = require('./MusicController');
var paramLists = require('./paramLists.js');

// tests don't have svgelement
if (typeof SVGElement !== 'undefined') {
  // Loading these modules extends SVGElement and puts canvg in the global
  // namespace
  require('../canvg/rgbcolor.js');
  require('../canvg/StackBlur.js');
  require('../canvg/canvg.js');
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

function loadLevel() {
  // Load maps.
  Studio.map = level.map;
  Studio.wallMap = null;  // The map name actually being used.
  Studio.wallMapRequested = null; // The map name requested by the caller.
  Studio.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Studio.slowJsExecutionFactor = level.slowJsExecutionFactor || 1;
  Studio.ticksBeforeFaceSouth = Studio.slowJsExecutionFactor +
                                  utils.valueOr(level.ticksBeforeFaceSouth, IDLE_TICKS_BEFORE_FACE_SOUTH);
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
      // Sprite clipPath element
      // (not setting x, y, height, or width until displaySprite)
      var spriteClip = document.createElementNS(SVG_NS, 'clipPath');
      spriteClip.setAttribute('id', 'spriteClipPath' + i);
      var spriteClipRect = document.createElementNS(SVG_NS, 'rect');
      spriteClipRect.setAttribute('id', 'spriteClipRect' + i);
      spriteClip.appendChild(spriteClipRect);
      spriteLayer.appendChild(spriteClip);

      // Add sprite (not setting href, height, or width until displaySprite).
      var spriteIcon = document.createElementNS(SVG_NS, 'image');
      spriteIcon.setAttribute('id', 'sprite' + i);
      spriteIcon.setAttribute('clip-path', 'url(#spriteClipPath' + i + ')');
      spriteLayer.appendChild(spriteIcon);

      // Add support for walking spritesheet.
      var spriteWalkIcon = document.createElementNS(SVG_NS, 'image');
      spriteWalkIcon.setAttribute('id', 'spriteWalk' + i);
      spriteWalkIcon.setAttribute('clip-path', 'url(#spriteWalkClipPath' + i + ')');
      spriteLayer.appendChild(spriteWalkIcon);

      var spriteWalkClip = document.createElementNS(SVG_NS, 'clipPath');
      spriteWalkClip.setAttribute('id', 'spriteWalkClipPath' + i);
      var spriteWalkClipRect = document.createElementNS(SVG_NS, 'rect');
      spriteWalkClipRect.setAttribute('id', 'spriteWalkClipRect' + i);
      spriteWalkClip.appendChild(spriteWalkClipRect);
      spriteLayer.appendChild(spriteWalkClip);

      dom.addMouseDownTouchEvent(spriteIcon,
        delegate(this, Studio.onSpriteClicked, i));
    }
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

  var resetText = document.createElementNS(SVG_NS, 'text');
  resetText.setAttribute('id', 'resetText');
  resetText.setAttribute('class', 'studio-reset-text');
  resetText.setAttribute('x', Studio.MAZE_WIDTH / 2);
  resetText.setAttribute('y', RESET_TEXT_Y_POSITION);
  resetText.appendChild(document.createTextNode(studioMsg.tapOrClickToReset()));
  resetText.setAttribute('visibility', 'visible');
  gameTextGroup.appendChild(resetText);

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
var delegate = function(scope, func, data)
{
  return function()
  {
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
        Studio.JSInterpreter.queueEvent(handler.func, extraArgs);
      }
    }
  });
}

Studio.initAutoHandlers = function (map) {
  for (var funcName in map) {
    var func = Studio.JSInterpreter.findGlobalFunction(funcName);
    if (func) {
      registerEventHandler(Studio.eventHandlers, map[funcName], func);
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
 * Triggers display update on a list of Projectiles or Items - for updating
 * position and/or animation frames.
 * @param {Item[]|Projectile[]} list
 */
function displayItemsOrProjectiles (list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].display();
  }
}

/**
 * Sort the draw order of sprites, items, and tiles so that items higher on
 * the screen are drawn before the ones in front, for a simple form of
 * z-sorting.
 */
function sortDrawOrder() {
  if (!level.sortDrawOrder) {
    return;
  }

  var spriteLayer = document.getElementById('spriteLayer');

  var itemsArray = [];

  // Add items.
  for (var i = 0; i < Studio.items.length; i++) {
    var item = {};
    item.element = Studio.items[i].getElement();
    item.y = Studio.items[i].y + Studio.items[i].height/2 + Studio.items[i].renderOffset.y;
    itemsArray.push(item);

    Studio.drawDebugRect("itemLocation", Studio.items[i].x, Studio.items[i].y, 4, 4);
    Studio.drawDebugRect("itemBottom", Studio.items[i].x, item.y, 4, 4);
  }

  // Add sprites, both walking and non-walking.
  for (i = 0; i < Studio.sprite.length; i++) {
    var sprite = {};
    sprite.element = document.getElementById('sprite' + i);
    sprite.y = Studio.sprite[i].displayY + Studio.sprite[i].height;
    itemsArray.push(sprite);

    sprite = {};
    sprite.element = document.getElementById('spriteWalk' + i);
    sprite.y = Studio.sprite[i].displayY + Studio.sprite[i].height;
    itemsArray.push(sprite);

    Studio.drawDebugRect("spriteBottom", Studio.sprite[i].x, sprite.y, 4, 4);
  }

  // Add wall tiles.
  for (i = 0; i < Studio.tiles.length; i++) {
    var tile = {};
    tile.element = document.getElementById('tile_' + i);
    tile.y = Studio.tiles[i].bottomY;
    itemsArray.push(tile);
  }

  // Add goals.
  for (i = 0; i < Studio.spriteGoals_.length; i++) {
    var goal = {};
    goal.element = document.getElementById('spriteFinish' + i);
    var goalHeight = skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;
    goal.y = Studio.spriteGoals_[i].y + goalHeight;
    itemsArray.push(goal);
  }

  // Now sort everything by y.
  itemsArray = _.sortBy(itemsArray, 'y');

  // Carefully place the elements back in the DOM starting at the end of the
  // spriteLayer and, one by one, insert them before the previous one
  // (this prevents flashing in Safari vs. an in-order appendChild() loop)
  var prevNode;
  for (i = itemsArray.length - 1; i >= 0; i--) {
    if (prevNode) {
      spriteLayer.insertBefore(itemsArray[i].element, prevNode);
    } else {
      spriteLayer.appendChild(itemsArray[i].element);
    }
    prevNode = itemsArray[i].element;
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
      (0 !== (Studio.tickCount - 1) % Studio.slowJsExecutionFactor);
  Studio.yieldThisTick = false;

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

  if (Studio.JSInterpreter && !animationOnlyFrame) {
    Studio.JSInterpreter.executeInterpreter(Studio.tickCount === 1);
  }

  var spritesNeedMoreAnimationFrames = false;

  for (i = 0; i < Studio.spriteCount; i++) {
    if (!animationOnlyFrame) {
      performQueuedMoves(i);
    }

    var isWalking = true;

    // After 5 ticks of no movement, turn sprite forward.
    var ticksBeforeFaceSouth = utils.valueOr(level.ticksBeforeFaceSouth, Studio.ticksBeforeFaceSouth);
    if (Studio.tickCount - Studio.sprite[i].lastMove > Studio.ticksBeforeFaceSouth) {
      Studio.sprite[i].dir = Direction.SOUTH;
      Studio.movementAudioOff();
      isWalking = false;
    }

    // Also if the character has never moved, they are also not walking.
    // Separate to the above case because we don't want to force them to
    // face south in this case.  They are still allowed to face a different
    // direction even if they've never walked.
    if (Studio.sprite[i].lastMove === Infinity) {
      isWalking = false;
    }

    // Display sprite:
    Studio.displaySprite(i, isWalking);

    // Animate goals
    Studio.animateGoals();

    // Animate clouds
    Studio.animateClouds();

    var sprite = Studio.sprite[i];
    if (sprite.hasActions()) {
      spritesNeedMoreAnimationFrames = true;
    }

    Studio.drawDebugRect("spriteCenter", Studio.sprite[i].x, Studio.sprite[i].y, 5, 5);
  }

  if (!animationOnlyFrame) {
    performItemOrProjectileMoves(Studio.projectiles);
    performItemOrProjectileMoves(Studio.items);
  }
  displayItemsOrProjectiles(Studio.projectiles);
  displayItemsOrProjectiles(Studio.items);

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
};

/**
 * Returns the distance between two sprites on the specified axis.
 * @param {number} i1 The index of the first sprite.
 * @param {number} i2 The index of the second sprite.
 * @param {boolean} Whether this is for the Y axis.  If false, then X axis.
 */
function spriteCollisionDistance  (i1, i2, yAxis) {
  var dim1 = yAxis ? Studio.sprite[i1].height : Studio.sprite[i1].width;
  var dim2 = yAxis ? Studio.sprite[i2].height : Studio.sprite[i2].width;
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
           spriteIndex, xCenter, yCenter, list, autoDisappear)
{
  // Traverse the list in reverse order because we may remove elements from the
  // list while inside the loop:
  for (var i = list.length - 1; i >= 0; i--) {
    var collidable = list[i];
    var next = collidable.getNextPosition();

    if (collidable.isFading && collidable.isFading()) {
      continue;
    }

    Studio.drawDebugRect("itemCollision",
      next.x,
      next.y,
      skin.itemCollisionRectWidth || collidable.width,
      skin.itemCollisionRectHeight || collidable.height);
    Studio.drawDebugRect("spriteCollision",
      xCenter,
      yCenter,
      skin.spriteCollisionRectWidth || Studio.sprite[spriteIndex].width,
      skin.spriteCollisionRectHeight || Studio.sprite[spriteIndex].height);

    if (collisionTest(
          xCenter,
          next.x,
          spriteCollidableCollisionDistance(spriteIndex, collidable, false),
          yCenter,
          next.y,
          spriteCollidableCollisionDistance(spriteIndex, collidable, true))) {
      if (collidable.startCollision(spriteIndex)) {
        Studio.currentEventParams = { eventObject: collidable };
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
                        spriteCollisionDistance(i, j, true)))
      {
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
        }
        Studio.collideSpriteWith(i, 'wall');
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
        Studio.executeQueue('whenGetAllCharacterClass-' + skin.ItemClassNames[j]);
      }
    }
    if (level.removeItemsWhenActorCollides) {
      Studio.executeQueue('whenGetAllCharacters');
    }
  }
}

/* Create an edge collision handler callback for a specific item
 */
function createItemEdgeCollisionHandler (item) {
  return function (edgeClass) {
    Studio.currentEventParams = { eventObject: item };
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

    if (item.hasCompletedFade && item.hasCompletedFade()) {
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
        Studio.currentEventParams = { eventObject: item };
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
 * @param {Collidable} sprite
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
  for (var col = Math.max(0, xGrid - colsOffset);
       col < Math.min(Studio.COLS, xGrid + colsOffset);
       col++) {
    for (var row = Math.max(0, iYGrid - rowsOffset);
         row < Math.min(Studio.ROWS, iYGrid + rowsOffset);
         row++) {
      if (Studio.getWallValue(row, col)) {
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
  var extraControlsRow = require('./extraControlRows.html.ejs')({
    assetUrl: studioApp.assetUrl,
    finishButton: !finishButtonFirstLine && showFinishButton
  });

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html.ejs')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default',
      inputOutputTable: level.inputOutputTable,
      readonlyWorkspace: config.readonlyWorkspace
    }
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

  if (studioApp.cdoSounds && !studioApp.cdoSounds.isAudioUnlocked()) {
    // Would use addClickTouchEvent, but iOS9 does not let you unlock audio
    // on touchstart, only on touchend.
    var removeEvent = dom.addMouseUpTouchEvent(document, function () {
      studioApp.cdoSounds.unlockAudio();
      removeEvent();
    });
  }

  // Play music when the instructions are shown
  var playOnce = function () {
    if (studioApp.cdoSounds && studioApp.cdoSounds.isAudioUnlocked()) {
      Studio.musicController.play();
      document.removeEventListener('instructionsShown', playOnce);
      document.removeEventListener('instructionsHidden', playOnce);
    }
  };
  document.addEventListener('instructionsShown', playOnce);
  document.addEventListener('instructionsHidden', playOnce);

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
  };

  config.afterClearPuzzle = function() {
    studioApp.resetButtonClick();
    annotationList.clearRuntimeAnnotations();
  };

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = studioMsg.makeYourOwn();
  config.makeUrl = "http://code.org/studio";
  config.makeImage = studioApp.assetUrl('media/promo.png');

  // Disable "show code" button in feedback dialog and workspace if blockly.
  // Note - if turned back on, be sure it remains hidden when config.level.embed
  config.enableShowCode = utils.valueOr(studioApp.editCode, false);
  config.varsInGlobals = true;
  config.dropletConfig = dropletConfig;
  config.dropIntoAceAtLineStart = true;
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
  var img = new Image();
  img.src = url;
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
 * Freeze a list of Items or Projectiles by telling them to stop animating.
 */
function freezeItemOrProjectileList (list) {
  for (var i = 0; i < list.length; i++) {
    list[i].stopAnimations();
  }
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
  // Freeze the projectiles and items (stop the animation timers)
  freezeItemOrProjectileList(Studio.projectiles);
  freezeItemOrProjectileList(Studio.items);
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
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  // True if we should fail before execution, even if freeplay
  Studio.preExecutionFailure = false;
  Studio.message = null;
  Studio.pauseInterpreter = false;

  // Reset the score and title screen.
  Studio.playerScore = 0;
  Studio.scoreText = null;
  Studio.victoryText = '';
  document.getElementById('score')
    .setAttribute('visibility', 'hidden');
  document.getElementById('victoryText')
    .setAttribute('visibility', 'hidden');
  var resetText = document.getElementById('resetText');
  if (level.tapSvgToRunAndReset) {
    resetText.textContent = studioMsg.tapOrClickToPlay();
    resetText.setAttribute('visibility', 'visible');
  } else {
    resetText.setAttribute('visibility', 'hidden');
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
    hasSetDroid: false,
    hasSetDroidSpeed: false,
    hasSetBackground: false,
    hasSetMap: false,
    hasAddedItem: false,
    hasWonGame: false,
    hasLostGame: false
  };

  // Reset the record of the last direction that the user moved the sprite.
  Studio.lastMoveSingleDir = null;

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Studio.Globals = {};
  if (studioApp.editCode) {
    Studio.executionError = null;
    Studio.JSInterpreter = null;
  }

  // Move sprites into position.
  for (i = 0; i < Studio.spriteCount; i++) {
    Studio.sprite[i] = new Collidable({
      x: Studio.spriteStart_[i].x,
      y: Studio.spriteStart_[i].y,
      displayX: Studio.spriteStart_[i].x,
      displayY: Studio.spriteStart_[i].y,
      speed: constants.DEFAULT_SPRITE_SPEED,
      size: constants.DEFAULT_SPRITE_SIZE,
      dir: Direction.NONE,
      displayDir: Direction.SOUTH,
      emotion: level.defaultEmotion || Emotions.NORMAL,
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
    var exampleCode = Blockly.Generator.blocksToCode('JavaScript', [ exampleBlock ]);
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
  }
  else {
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
      hideIcon: skin.hideIconInClearPuzzle,
      feedbackType: Studio.testResults,
      executionError: Studio.executionError,
      tryAgainText: tryAgainText,
      continueText: appStrings.continueText,
      response: Studio.response,
      level: level,
      showingSharing: !level.disableSharing && level.freePlay && !Studio.preExecutionFailure &&
          !level.projectTemplateLevelName,
      feedbackImage: Studio.feedbackImage,
      twitter: twitterOptions,
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
      var code = Blockly.Generator.blocksToCode('JavaScript', [ block ]);
      if (code) {
        var func = codegen.functionFromCode(code, {
                                            StudioApp: studioApp,
                                            Studio: api,
                                            Globals: Studio.Globals } );
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
  try { codegen.evalWith(code, {
                         StudioApp: studioApp,
                         Studio: api,
                         Globals: Studio.Globals } ); } catch (e) { }
};

/**
 * Looks for failures that should prevent execution.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForPreExecutionFailure = function () {
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
  if (console.log) {
    console.log(text);
  }
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }
}

function handleExecutionError(err, lineNumber) {
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
    if (Studio.checkForPreExecutionFailure()) {
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

  Studio.playSound({ soundName: 'start' });

  studioApp.reset(false);

  if (level.editCode) {
    var codeWhenRun = studioApp.getCode();
    if (!studioApp.hideSource) {
      // Our ace worker also calls attachToSession, but it won't run on IE9:
      var session = studioApp.editor.aceEditor.getSession();
      annotationList.attachToSession(session, studioApp.editor);
      annotationList.clearRuntimeAnnotations();
    }
    Studio.JSInterpreter = new JSInterpreter({
      code: codeWhenRun,
      blocks: dropletConfig.blocks,
      enableEvents: true,
      studioApp: studioApp,
      shouldRunAtMaxSpeed: function() { return Studio.slowJsExecutionFactor === 1; },
      onExecutionError: handleExecutionError,
    });
    if (!Studio.JSInterpreter.initialized()) {
        return;
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

  var resetText = document.getElementById('resetText');
  resetText.setAttribute('visibility', 'hidden');

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

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (Studio.result === ResultType.SUCCESS);

  // If preExecutionFailure testResults should already be set
  if (!Studio.preExecutionFailure) {
    // If the current level is a free play, always return the free play
    // result type
    Studio.testResults = level.freePlay ? TestResults.FREE_PLAY :
      studioApp.getTestResults(levelComplete, { executionError: Studio.executionError });
  }

  if (Studio.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
    Studio.playSound({ soundName: 'win' });
  } else {
    Studio.playSound({ soundName: 'failure' });
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


var ANIM_RATE = 6;
var ANIM_OFFSET = 7; // Each sprite animates at a slightly different time
var ANIM_AFTER_NUM_NORMAL_FRAMES = 8;
// Number of extra ticks between the last time the sprite moved and when we
// reset them to face south.
var IDLE_TICKS_BEFORE_FACE_SOUTH = 4;


/**
 * Given direction/emotion/tickCount, calculate which frame number we should
 * display for sprite.
 * @param {boolean} opts.walkDirection - Return walking direction (0-7)
 * @param {boolean} opts.walkFrame - Return walking animation frame
 */
function spriteFrameNumber (index, opts) {
  var sprite = Studio.sprite[index];
  var frameNum = 0;

  var currentTime = new Date();
  var elapsed = currentTime - Studio.startTime;

  if (opts && opts.walkDirection) {
    var direction = constants.frameDirTableWalking[sprite.displayDir];

    // If there are extra emotions sprites, and the actor is facing forward,
    // use the emotion sprites (last columns of the walking sprite sheet).
    if (direction === 0 && sprite.frameCounts.extraEmotions > 0 && sprite.emotion !== 0) {
      return sprite.frameCounts.turns + sprite.emotion - 1;
    }
    return direction;
  }
  else if (opts && opts.walkFrame && sprite.timePerFrame) {
    return Math.floor(elapsed / sprite.timePerFrame) % sprite.frameCounts.walk;
  }

  if ((sprite.frameCounts.turns === 8) && sprite.displayDir !== Direction.SOUTH) {
    // turn frames start after normal and animation frames
    return sprite.frameCounts.normal + sprite.frameCounts.animation + 1 +
      constants.frameDirTable[sprite.displayDir];
  }
  if ((sprite.frameCounts.turns === 7) && sprite.displayDir !== Direction.SOUTH) {
    // turn frames start after normal and animation frames
    return sprite.frameCounts.normal + sprite.frameCounts.animation +
      constants.frameDirTable[sprite.displayDir];
  }
  if (sprite.frameCounts.animation === 1 && Studio.tickCount) {
    // we only support two-frame animation for base playlab, the 2nd frame is
    // only up for 1/8th of the time (since it is a blink of the eyes)
    if (1 === Math.round((Studio.tickCount + index * ANIM_OFFSET) / ANIM_RATE) %
        ANIM_AFTER_NUM_NORMAL_FRAMES) {
      // animation frame is the first frame after all the normal frames
      frameNum = sprite.frameCounts.normal;
    }
  }

  if (sprite.frameCounts.normal > 1 && sprite.timePerFrame) {
    // Use elapsed time instead of tickCount
    frameNum = Math.floor(elapsed / sprite.timePerFrame) % sprite.frameCounts.normal;
  }

  if (!frameNum && sprite.emotion !== Emotions.NORMAL &&
    sprite.frameCounts.emotions > 0) {
    // emotion frames precede normal, animation, turn frames
    frameNum = sprite.frameCounts.normal + sprite.frameCounts.animation +
      sprite.frameCounts.turns + (sprite.emotion - 1);
  }

  return frameNum;
}

function spriteTotalFrames (index) {
  var sprite = Studio.sprite[index];
  return sprite.frameCounts.normal + sprite.frameCounts.animation +
    sprite.frameCounts.turns + sprite.frameCounts.emotions;
}

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
      background.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
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

Studio.displaySprite = function(i, isWalking) {
  var sprite = Studio.sprite[i];

  // avoid lots of unnecessary changes to hidden sprites
  if (sprite.value === 'hidden') {
    return;
  }

  var spriteRegularIcon = document.getElementById('sprite' + i);
  var spriteWalkIcon = document.getElementById('spriteWalk' + i);

  var spriteIcon, spriteClipRect, unusedSpriteClipRect;
  var xOffset, yOffset;

  if (sprite.value !== undefined && skin[sprite.value] && skin[sprite.value].walk && isWalking) {

    // One exception: don't show the walk sprite if we're already playing an explosion animation for
    // that sprite.  (Ideally, we would show the sprite in place while explosion plays over the top,
    // but this is not a common case for now and this keeps the change small.)
    var explosion = document.getElementById('explosion' + i);
    if (explosion && explosion.getAttribute('visibility') !== 'hidden') {
      spriteWalkIcon.setAttribute('visibility', 'hidden');
      return;
    }

    // Show walk sprite, and hide regular sprite.
    spriteRegularIcon.setAttribute('visibility', 'hidden');
    spriteWalkIcon.setAttribute('visibility', 'visible');

    xOffset = sprite.drawWidth * spriteFrameNumber(i, {walkDirection: true});
    yOffset = sprite.drawHeight * spriteFrameNumber(i, {walkFrame: true});

    spriteIcon = spriteWalkIcon;
    spriteClipRect = document.getElementById('spriteWalkClipRect' + i);
    unusedSpriteClipRect = document.getElementById('spriteClipRect' + i);
  } else {
    // Show regular sprite, and hide walk sprite.
    spriteRegularIcon.setAttribute('visibility', 'visible');
    spriteWalkIcon.setAttribute('visibility', 'hidden');

    xOffset = sprite.drawWidth * spriteFrameNumber(i);

    // For new versions of sprites (iceage/gumball), there are additional rows of
    // idle animations for each emotion.
    if (sprite.frameCounts.extraEmotions > 0) {
      yOffset = sprite.drawHeight * sprite.emotion;
    } else {
      yOffset = 0;
    }

    spriteIcon = spriteRegularIcon;
    spriteClipRect = document.getElementById('spriteClipRect' + i);
    unusedSpriteClipRect = document.getElementById('spriteWalkClipRect' + i);
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
    var xCoordPrev = spriteClipRect.getAttribute('x') - extraOffsetX;
    var yCoordPrev = spriteClipRect.getAttribute('y') - extraOffsetY;

    var dirPrev = sprite.dir;
    if (dirPrev === Direction.NONE) {
      // direction not yet set, start at SOUTH (forward facing)
      sprite.dir = Direction.SOUTH;
    }
    else if ((sprite.x != xCoordPrev) || (sprite.y != yCoordPrev)) {
      sprite.dir = Direction.NONE;
      if (sprite.x < xCoordPrev) {
        sprite.dir |= Direction.WEST;
      } else if (sprite.x > xCoordPrev) {
        sprite.dir |= Direction.EAST;
      }
      if (sprite.y < yCoordPrev) {
        sprite.dir |= Direction.NORTH;
      } else if (sprite.y > yCoordPrev) {
        sprite.dir |= Direction.SOUTH;
      }
    }

    sprite.displayX = sprite.x;
    sprite.displayY = sprite.y;
  }

  // Turn sprite toward target direction after evaluating actions.
  if (sprite.dir !== sprite.displayDir) {
    // Every other frame, assign a new displayDir from state table
    // (only one turn at a time):
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      sprite.displayDir = NextTurn[sprite.displayDir][sprite.dir];
    }
  }

  spriteIcon.setAttribute('x', sprite.displayX - xOffset + extraOffsetX);
  spriteIcon.setAttribute('y', sprite.displayY - yOffset + extraOffsetY);

  spriteClipRect.setAttribute('x', sprite.displayX + extraOffsetX);
  spriteClipRect.setAttribute('y', sprite.displayY + extraOffsetY);

  // Update the other clip rect too, so that calculations involving
  // inter-frame differences (just above, to calculate sprite.dir)
  // are correct when we transition between spritesheets.
  unusedSpriteClipRect.setAttribute('x', sprite.displayX + extraOffsetX);
  unusedSpriteClipRect.setAttribute('y', sprite.displayY + extraOffsetY);

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
  var resetText = document.getElementById('resetText');
  resetText.textContent = studioMsg.tapOrClickToReset();
  resetText.setAttribute('visibility', 'visible');
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

  for (var i = 0; i < Studio.spriteGoals_.length; i++) {
    var goal = Studio.spriteGoals_[i];
    // Keep animating the goal unless it's finished and we're not fading out.
    if (!goal.finished || goal.startFadeTime) {
      var goalSprite = document.getElementById('spriteFinish' + i);
      var goalClipRect = document.getElementById('finishClipRect' + i);

      if (animate) {
        var baseX = parseInt(goalClipRect.getAttribute('x'), 10);
        var frame = Math.floor(elapsed / frameDuration) % numFrames;

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
  var intervals = [ 50, 60 ];

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

  return { x: x, y: y };
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
  }
  y += constants.floatingScoreChangeY;
  floatingScore.setAttribute('y', y);
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
// If Studio.yieldThisTick is true, execution of commands will stop
//

Studio.executeQueue = function (name, oneOnly) {
  Studio.eventHandlers.forEach(function (handler) {
    if (Studio.yieldThisTick) {
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
        if (Studio.yieldThisTick) {
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

Studio.playSound = function (opts) {

  if (typeof opts.soundName !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.soundName);
  }

  var soundVal = opts.soundName.toLowerCase().trim();

  if (soundVal === constants.RANDOM_VALUE) {
    // Get all non-random values and choose one at random:
    var allValues = paramLists.getPlaySoundValues(false);
    soundVal = allValues[Math.floor(Math.random() * allValues.length)].toLowerCase();
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
    activity: utils.valueOr(Studio.itemActivity[itemClass], "roam"),
    isHazard: classProperties.isHazard,
    spritesCounterclockwise: classProperties.spritesCounterclockwise,
    renderOffset: utils.valueOr(classProperties.renderOffset, { x: 0, y: 0 }),
    renderScale: utils.valueOr(classProperties.scale, 1),
    animationRate: classProperties.animationRate
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

  // retain this speed value for items of this class created in the future:
  Studio.itemSpeed[itemClass] = opts.speed;
  Studio.items.forEach(function (item) {
    if (item.className === itemClass) {
      item.speed = opts.speed;
    }
  });
};

Studio.showDebugInfo = function (opts) {
  showDebugInfo = opts.value;
};

Studio.vanishActor = function (opts) {
  var svg = document.getElementById('svgStudio');

  var sprite = document.getElementById('sprite' + opts.spriteIndex);
  var spriteShowing = sprite && sprite.getAttribute('visibility') !== 'hidden';
  var spriteWalk = document.getElementById('spriteWalk' + opts.spriteIndex);
  var spriteWalkShowing = spriteWalk && spriteWalk.getAttribute('visibility') !== 'hidden';

  if (!spriteShowing && !spriteWalkShowing) {
    return;
  }

  var explosion = document.getElementById('explosion' + opts.spriteIndex);
  if (!explosion) {
    explosion = document.createElementNS(SVG_NS, 'image');
    explosion.setAttribute('id', 'explosion' + opts.spriteIndex);
    explosion.setAttribute('visibility', 'hidden');
    svg.appendChild(explosion, sprite);
  }

  var spriteClipRect = document.getElementById('spriteClipRect' + opts.spriteIndex);

  var frameWidth = Studio.sprite[opts.spriteIndex].width;

  explosion.setAttribute('height', Studio.sprite[opts.spriteIndex].height);
  explosion.setAttribute('x', spriteClipRect.getAttribute('x'));

  explosion.setAttribute('visibility', 'visible');

  var baseX = parseInt(spriteClipRect.getAttribute('x'), 10);
  var numFrames = skin.explosionFrames;
  explosion.setAttribute('clip-path', 'url(#spriteClipPath' + opts.spriteIndex + ')');
  explosion.setAttribute('width', numFrames * frameWidth);

  if (!skin.fadeExplosion) {
    Studio.setSprite({
      spriteIndex: opts.spriteIndex,
      value: 'hidden'
    });
  }

  _.range(0, numFrames).forEach(function (i) {
    Studio.perExecutionTimeouts.push(setTimeout(function () {
      explosion.setAttribute('x', baseX - i * frameWidth);
      if (i === 0) {
        // Sometimes the spriteClipRect still moves a bit before our explosion
        // starts, so wait until first frame to set y.
        explosion.setAttribute('y', spriteClipRect.getAttribute('y'));
      }

      if (skin.fadeExplosion) {
        sprite.setAttribute('opacity', (numFrames - i) / numFrames);
      }
    }, i * skin.timePerExplosionFrame));
  });
  Studio.perExecutionTimeouts.push(setTimeout(function () {
    explosion.setAttribute('visibility', 'hidden');
    if (skin.fadeAnimation) {
      // hide the sprite
      Studio.setSprite({
        spriteIndex: opts.spriteIndex,
        value: 'hidden'
      });
      sprite.removeAttribute('opacity');
    }
  }, skin.timePerExplosionFrame * (numFrames + 1)));

  // we append the url with the spriteIndex so that each sprites explosion gets
  // treated as being different, otherwise chrome will animate all existing
  // explosions anytime we try to animate one of them
  explosion.setAttributeNS('http://www.w3.org/1999/xlink',
    'xlink:href', skin.explosion + "?spriteIndex=" + opts.spriteIndex);
};

Studio.setSpriteEmotion = function (opts) {
  Studio.sprite[opts.spriteIndex].emotion = opts.value;
};

Studio.setSpriteSpeed = function (opts) {
  var speed = Math.min(Math.max(opts.value, constants.SpriteSpeed.SLOW),
      constants.SpriteSpeed.VERY_FAST);
  Studio.sprite[opts.spriteIndex].speed = speed;
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
  Studio.sprite[opts.spriteIndex].size = opts.value;
  var curSpriteValue = Studio.sprite[opts.spriteIndex].value;

  if (curSpriteValue !== 'hidden') {
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
            sprite.dir = Direction.NONE;

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
  var spriteIndex = opts.spriteIndex;
  var sprite = Studio.sprite[spriteIndex];

  if (typeof opts.value !== 'string') {
    throw new TypeError("Incorrect parameter: " + opts.value);
  }

  var spriteValue = opts.value.toLowerCase().trim();

  if (spriteValue === constants.RANDOM_VALUE) {
    spriteValue = skin.avatarList[Math.floor(Math.random() * skin.avatarList.length)];
  }

  var spriteIcon = document.getElementById('sprite' + spriteIndex);
  if (!spriteIcon) {
    return;
    // TODO (cpirich): We should probably throw here, but since our JS tutorials
    // don't allow the student to set the spriteIndex, we will fail silently
    // in case existing blockly tutorials expect this error to fail quietly

    // throw new RangeError("Incorrect parameter: " + spriteIndex);
  }

  var skinSprite = skin[spriteValue];
  if (!skinSprite && spriteValue !== 'hidden' && spriteValue !== 'visible') {
    throw new RangeError("Incorrect parameter: " + opts.value);
  }

  sprite.visible = (spriteValue !== 'hidden' && !opts.forceHidden);
  spriteIcon.setAttribute('visibility', sprite.visible ? 'visible' : 'hidden');
  sprite.value = opts.forceHidden ? 'hidden' : spriteValue;
  if (spriteValue === 'hidden' || spriteValue === 'visible') {
    return;
  }

  // If this skin has walking spritesheet, then load that too.
  var spriteWalk = null;
  if (spriteValue !== undefined && skinSprite.walk) {
    spriteWalk = document.getElementById('spriteWalk' + spriteIndex);
    if (!spriteWalk) {
      return;
    }

    // Hide the walking sprite at this stage.
    spriteWalk.setAttribute('visibility', 'hidden');
  }

  sprite.frameCounts = skinSprite.frameCounts;
  sprite.timePerFrame = skinSprite.timePerFrame;
  // Reset height and width:
  if (level.gridAlignedMovement) {
    // This mode only works properly with square sprites
    sprite.height = sprite.width = Studio.SQUARE_SIZE;
    sprite.size = 1; //sprite.width / skin.spriteWidth;

    sprite.drawHeight = sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.size * skin.spriteWidth;
  } else {
    sprite.drawHeight = sprite.height = sprite.size * skin.spriteHeight;
    sprite.drawWidth = sprite.width = sprite.size * skin.spriteWidth;
  }
  if (skin.projectileSpriteHeight) {
    sprite.projectileSpriteHeight = sprite.size * skin.projectileSpriteHeight;
  }
  if (skin.projectileSpriteWidth) {
    sprite.projectileSpriteWidth = sprite.size * skin.projectileSpriteWidth;
  }

  var spriteClipRect = document.getElementById('spriteClipRect' + spriteIndex);
  spriteClipRect.setAttribute('width', sprite.drawWidth);
  spriteClipRect.setAttribute('height', sprite.drawHeight);

  spriteIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinSprite.sprite);
  spriteIcon.setAttribute('width', sprite.drawWidth * spriteTotalFrames(spriteIndex));
  var extraHeight = (sprite.frameCounts.extraEmotions || 0) * sprite.drawHeight;
  spriteIcon.setAttribute('height', sprite.drawHeight + extraHeight);

  if (spriteWalk) {
    // And set up the cliprect so we can show the right item from the spritesheet.
    var spriteWalkClipRect = document.getElementById('spriteWalkClipRect' + spriteIndex);
    spriteWalkClipRect.setAttribute('width', sprite.drawWidth);
    spriteWalkClipRect.setAttribute('height', sprite.drawHeight);

    spriteWalk.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinSprite.walk);

    var extraWidth = (sprite.frameCounts.extraEmotions || 0) * sprite.drawWidth;
    spriteWalk.setAttribute('width', extraWidth + sprite.drawWidth * sprite.frameCounts.turns); // 800
    spriteWalk.setAttribute('height', sprite.drawHeight * sprite.frameCounts.walk); // 1200
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
  sprite.dir = Direction.NONE;
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
  sprite.dir = Direction.NONE;
};

Studio.getPlayspaceBoundaries = function(sprite)
{
  var boundaries;

  if (skin.wallCollisionRectWidth && skin.wallCollisionRectHeight && !level.gridAlignedMovement) {
    boundaries = {
      top:    0 - (sprite.height - skin.wallCollisionRectHeight)/2 - skin.wallCollisionRectOffsetY,
      right:  Studio.MAZE_WIDTH - skin.wallCollisionRectWidth - (sprite.width - skin.wallCollisionRectWidth)/2 - skin.wallCollisionRectOffsetX,
      bottom: Studio.MAZE_HEIGHT - skin.wallCollisionRectHeight - (sprite.height - skin.wallCollisionRectHeight)/2 - skin.wallCollisionRectOffsetY,
      left:   0 - (sprite.width - skin.wallCollisionRectWidth)/2 - skin.wallCollisionRectOffsetX
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

    // We prevented the wall collision, but queue a wall collision event and
    // immediately reset the collision state since we didn't actually overlap:
    Studio.collideSpriteWith(opts.spriteIndex, 'wall');
    sprite.endCollision('wall');
  }

  if (!level.allowSpritesOutsidePlayspace &&
      Studio.willSpriteLeavePlayspace(sprite, projectedX, projectedY)) {
    playspaceEdgeCollision = true;
  }

  if (level.gridAlignedMovement) {
    if (wallCollision || playspaceEdgeCollision) {
      sprite.addAction(new spriteActions.GridMoveAndCancel(
          deltaX, deltaY, level.slowJsExecutionFactor));
    } else {
      sprite.addAction(new spriteActions.GridMove(
          deltaX, deltaY, level.slowJsExecutionFactor));
    }

    Studio.yieldThisTick = true;
    if (Studio.JSInterpreter) {
      Studio.JSInterpreter.yield();
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
  var goalWidth = skin.goalCollisionRectWidth || Studio.MARKER_WIDTH;
  var goalHeight = skin.goalCollisionRectHeight || Studio.MARKER_HEIGHT;

  var finishCollisionDistance = function (yAxis) {
    var dim1 = yAxis ? sprite.height : sprite.width;
    var dim2 = yAxis ? goalHeight : goalWidth;

    return constants.FINISH_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
  };

  var xSpriteCenter = sprite.x + (skin.itemCollisionRectWidth || sprite.width) / 2;
  var ySpriteCenter = sprite.y + (skin.itemCollisionRectHeight || sprite.height) / 2;

  var xFinCenter = goal.x + goalWidth / 2;
  var yFinCenter = goal.y + goalHeight / 2;

  Studio.drawDebugRect("goalCollisionSprite", xSpriteCenter, ySpriteCenter, sprite.width, sprite.height);
  Studio.drawDebugRect("goalCollisionGoal", xFinCenter, yFinCenter, goalWidth, goalHeight);

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
        Studio.playSound({ soundName: 'flag' });
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

    if (valueName === 'timedOut' && Studio.timedOut() != value) {
      return false;
    }

    if (valueName === 'collectedItemsAtOrAbove' && tracked.removedItemCount < value) {
      return false;
    }

    if (valueName === 'collectedItemsBelow' && tracked.removedItemCount >= value) {
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

    if (valueName === 'allGoalsVisited' && Studio.allGoalsVisited() !== value) {
      return false;
    }

    if (valueName === 'setMap' && tracked.hasSetMap !== value) {
      return false;
    }

    if (valueName === 'setDroidSpeed' && tracked.hasSetDroidSpeed !== value) {
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
    Studio.message = utils.valueOr(progressConditionResult.message, null);
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

  if (Studio.timedOut()) {
    Studio.result = ResultType.FAILURE;
    return true;
  }

  return false;
};


},{"../JSInterpreter":"/home/ubuntu/staging/apps/build/js/JSInterpreter.js","../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../acemode/annotationList":"/home/ubuntu/staging/apps/build/js/acemode/annotationList.js","../canvg/StackBlur.js":"/home/ubuntu/staging/apps/build/js/canvg/StackBlur.js","../canvg/canvg.js":"/home/ubuntu/staging/apps/build/js/canvg/canvg.js","../canvg/rgbcolor.js":"/home/ubuntu/staging/apps/build/js/canvg/rgbcolor.js","../canvg/svg_todataurl":"/home/ubuntu/staging/apps/build/js/canvg/svg_todataurl.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","../xml":"/home/ubuntu/staging/apps/build/js/xml.js","./ImageFilterFactory":"/home/ubuntu/staging/apps/build/js/studio/ImageFilterFactory.js","./Item":"/home/ubuntu/staging/apps/build/js/studio/Item.js","./MusicController":"/home/ubuntu/staging/apps/build/js/studio/MusicController.js","./ThreeSliceAudio":"/home/ubuntu/staging/apps/build/js/studio/ThreeSliceAudio.js","./api":"/home/ubuntu/staging/apps/build/js/studio/api.js","./bigGameLogic":"/home/ubuntu/staging/apps/build/js/studio/bigGameLogic.js","./blocks":"/home/ubuntu/staging/apps/build/js/studio/blocks.js","./collidable":"/home/ubuntu/staging/apps/build/js/studio/collidable.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/studio/controls.html.ejs","./dropletConfig":"/home/ubuntu/staging/apps/build/js/studio/dropletConfig.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/studio/extraControlRows.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js","./paramLists.js":"/home/ubuntu/staging/apps/build/js/studio/paramLists.js","./projectile":"/home/ubuntu/staging/apps/build/js/studio/projectile.js","./rocketHeightLogic":"/home/ubuntu/staging/apps/build/js/studio/rocketHeightLogic.js","./samBatLogic":"/home/ubuntu/staging/apps/build/js/studio/samBatLogic.js","./spriteActions":"/home/ubuntu/staging/apps/build/js/studio/spriteActions.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/studio/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/studio/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgStudio">\n</svg>\n<div id="capacityBubble">\n  <div id="capacity"></div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/studio/samBatLogic.js":[function(require,module,exports){
var CustomGameLogic = require('./customGameLogic');
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var KeyCodes = require('../constants').KeyCodes;
var codegen = require('../codegen');
var api = require('./api');

/**
 * Custom logic for the Sam the Bat levels
 * @constructor
 * @implements CustomGameLogic
 */
var SamBatLogic = function (studio) {
  CustomGameLogic.apply(this, arguments);
  this.samIndex = 0;
  this.sam = null;
  // Has the onscreen? stopped Sam on a given side?
  this.stopped = {left: false, up: false, right: false, down: false};
};
SamBatLogic.inherits(CustomGameLogic);

SamBatLogic.prototype.onTick = function () {
  this.sam = this.studio_.sprite[this.samIndex];

  // Move Sam with arrow keys
  for (var key in KeyCodes) {
    if (this.studio_.keyState[KeyCodes[key]] &&
        this.studio_.keyState[KeyCodes[key]] === "keydown") {
      switch (KeyCodes[key]) {
        case KeyCodes.LEFT:
          this.updateSam_(Direction.WEST);
          break;
        case KeyCodes.UP:
          this.updateSam_(Direction.NORTH);
          break;
        case KeyCodes.RIGHT:
          this.updateSam_(Direction.EAST);
          break;
        case KeyCodes.DOWN:
          this.updateSam_(Direction.SOUTH);
          break;
      }
    }
  }

  // Move Sam with arrow buttons
  for (var btn in this.studio_.btnState) {
    if (this.studio_.btnState[btn]) {
      switch (btn) {
        case 'leftButton':
          this.updateSam_(Direction.WEST);
          break;
        case 'upButton':
          this.updateSam_(Direction.NORTH);
          break;
        case 'rightButton':
          this.updateSam_(Direction.EAST);
          break;
        case 'downButton':
          this.updateSam_(Direction.SOUTH);
          break;
      }
    }
  }

  // Display Sam's coordinates, with y inverted
  var centerX = this.sam.x + this.sam.width / 2;
  var centerY = this.studio_.MAZE_HEIGHT - (this.sam.y + this.sam.height / 2);
  this.studio_.scoreText = '(' + centerX + ', ' + centerY + ')';
  this.studio_.displayScore();
};

/**
 * Before moving, check if Sam would still be onscreen?
 * If move would take Sam offscreen, set dir to None
 */
SamBatLogic.prototype.updateSam_ = function (dir) {
  var centerX = this.sam.x + this.sam.width / 2;
  //invert Y
  var centerY = this.studio_.MAZE_HEIGHT - (this.sam.y + this.sam.height / 2);
  
  switch (dir) {
    case Direction.WEST:
      if (!this.onscreen(centerX - this.sam.speed, centerY)) {
        dir = Direction.NONE;
        this.stopped.left = true;
      }
      break;
    case Direction.NORTH:
      if (!this.onscreen(centerX, centerY + this.sam.speed)) {
        dir = Direction.NONE;
        this.stopped.up = true;
      }
      break;
    case Direction.EAST:
      if (!this.onscreen(centerX + this.sam.speed, centerY)) {
        dir = Direction.NONE;
        this.stopped.right = true;
      }
      break;
    case Direction.SOUTH:
      if (!this.onscreen(centerX, centerY - this.sam.speed)) {
        dir = Direction.NONE;
        this.stopped.down = true;
      }
      break;
  }
  this.studio_.moveSingle({spriteIndex: this.samIndex, dir: dir});
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x Current x location of Sam
 * @param {number} y Current y location of Sam (optional)
 * @returns {boolean} True if coordinate is onscreen?
 */
SamBatLogic.prototype.onscreen = function (x, y) {
  return this.resolveCachedBlock_('VALUE')(x, y);
};

module.exports = SamBatLogic;


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","./api":"/home/ubuntu/staging/apps/build/js/studio/api.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./customGameLogic":"/home/ubuntu/staging/apps/build/js/studio/customGameLogic.js"}],"/home/ubuntu/staging/apps/build/js/studio/rocketHeightLogic.js":[function(require,module,exports){
var CustomGameLogic = require('./customGameLogic');
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var codegen = require('../codegen');
var api = require('./api');

/**
 * Custom logic for the Rocket Height levels
 * @constructor
 * @implements CustomGameLogic
 */
var RocketHeightLogic = function (studio) {
  CustomGameLogic.apply(this, arguments);
  this.rocketIndex = 0;
  this.last = Date.now();
  this.seconds = 0;
  // rocket and height for use in success/failure checking
  this.rocket = null;
  this.height = 0;

  // Use by successCondition/failureCondition
  this.SECONDS_TO_RUN = 8;
};
RocketHeightLogic.inherits(CustomGameLogic);

RocketHeightLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    // Make sure fields are properly initialized, for example if we've run
    // and then reset.
    this.last = Date.now();
    this.seconds = 0;
    this.rocket = this.studio_.sprite[this.rocketIndex];
    this.height = 0;
    this.studio_.setBackground({value: 'space'});
  }

  // Update the rocket once a second
  if (Date.now() - this.last < 1000) {
    return;
  }
  this.last = Date.now();
  this.seconds++;

  // Display the rocket height and time elapsed
  this.height = this.rocket_height(this.seconds) || 0;
  this.rocket.y = this.studio_.MAZE_HEIGHT - (this.height + this.rocket.height);
  this.rocket.dir = Direction.NONE;
  this.studio_.scoreText = 'Time: ' + this.seconds + ' | Height: ' + this.height;
  this.studio_.displayScore();
};

/**
 * Calls the user provided rocket-height function, or no-op if none was provided.
 * @param {number} seconds Time elapsed since rocket launch
 * @returns {number} Height of rocket after seconds
 */
RocketHeightLogic.prototype.rocket_height = function (seconds) {
  return this.resolveCachedBlock_('VALUE')(seconds);
};

module.exports = RocketHeightLogic;


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","./api":"/home/ubuntu/staging/apps/build/js/studio/api.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./customGameLogic":"/home/ubuntu/staging/apps/build/js/studio/customGameLogic.js"}],"/home/ubuntu/staging/apps/build/js/studio/projectile.js":[function(require,module,exports){
var Collidable = require('./collidable');
var Direction = require('./constants').Direction;
var constants = require('./constants');
var utils = require('../utils');
var StudioAnimation = require('./StudioAnimation');
var StudioSpriteSheet = require('./StudioSpriteSheet');

// mapping of how much we should rotate based on direction
var DIR_TO_ROTATION = {};
DIR_TO_ROTATION[Direction.EAST] = 0;
DIR_TO_ROTATION[Direction.SOUTH] = 90;
DIR_TO_ROTATION[Direction.WEST] = 180;
DIR_TO_ROTATION[Direction.NORTH] = 270;
DIR_TO_ROTATION[Direction.NORTHEAST] = 45;
DIR_TO_ROTATION[Direction.SOUTHEAST] = 135;
DIR_TO_ROTATION[Direction.SOUTHWEST] = 225;
DIR_TO_ROTATION[Direction.NORTHWEST] = 315;

// Origin of projectile relative to sprite, based on direction
// (a scale factor to be multiplied by sprite width and height)
// fromSprite coords are left, top
var OFFSET_FROM_SPRITE = {};
OFFSET_FROM_SPRITE[Direction.NORTH] = {
  x: 0.5,
  y: 0
};
OFFSET_FROM_SPRITE[Direction.EAST] = {
  x: 1,
  y: 0.5
};
OFFSET_FROM_SPRITE[Direction.SOUTH] = {
  x: 0.5,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.WEST] = {
  x: 0,
  y: 0.5
};
OFFSET_FROM_SPRITE[Direction.NORTHEAST] = {
  x: 1,
  y: 0
};
OFFSET_FROM_SPRITE[Direction.SOUTHEAST] = {
  x: 1,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.SOUTHWEST] = {
  x: 0,
  y: 1
};
OFFSET_FROM_SPRITE[Direction.NORTHWEST] = {
  x: 0,
  y: 0
};

// Origin of projectile, based on direction
// assumes projectile is always 50x50 in size
// projectile coords are center, center
var OFFSET_CENTER = {};
OFFSET_CENTER[Direction.NORTH] = {
  x: 0,
  y: -25
};
OFFSET_CENTER[Direction.EAST] = {
  x: 25,
  y: 0
};
OFFSET_CENTER[Direction.SOUTH] = {
  x: 0,
  y: 25
};
OFFSET_CENTER[Direction.WEST] = {
  x: -25,
  y: 0
};
OFFSET_CENTER[Direction.NORTHEAST] = {
  x: 25,
  y: -25
};
OFFSET_CENTER[Direction.SOUTHEAST] = {
  x: 25,
  y: 25
};
OFFSET_CENTER[Direction.SOUTHWEST] = {
  x: -25,
  y: 25
};
OFFSET_CENTER[Direction.NORTHWEST] = {
  x: -25,
  y: -25
};


/**
 * A Projectile is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
var Projectile = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;
  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED / 2;

  // origin is at an offset from sprite location
  this.x = options.spriteX + OFFSET_CENTER[options.dir].x +
            (options.spriteWidth * OFFSET_FROM_SPRITE[options.dir].x);
  this.y = options.spriteY + OFFSET_CENTER[options.dir].y +
            (options.spriteHeight * OFFSET_FROM_SPRITE[options.dir].y);

  /** @private {StudioSpriteSheet} */
  this.spriteSheet_ = new StudioSpriteSheet($.extend({}, options, {
    width: options.spriteWidth,
    height: options.spriteHeight,
    horizontalAnimation: true,
    totalAnimations: 1
  }));

  /** @private {StudioAnimation} */
  this.animation_ = new StudioAnimation($.extend({}, options, {
    spriteSheet: this.spriteSheet_
  }));
};
Projectile.inherits(Collidable);
module.exports = Projectile;

/** @returns {SVGImageElement} */
Projectile.prototype.getElement = function () {
  return this.animation_.getElement();
};

/**
 * Create an image element with a clip path
 */
Projectile.prototype.createElement = function (parentElement) {
  this.animation_.createElement(parentElement);
};

/**
 * Stop our animations
 */
Projectile.prototype.stopAnimations = function() {
  this.animation_.stopAnimator();
};

/**
 * Remove our element/clipPath/animator
 */
Projectile.prototype.removeElement = function () {
  this.animation_.removeElement();
};

/**
 * Display our projectile at it's current location, rotating as necessary
 */
Projectile.prototype.display = function () {
  var topLeft = {
    x: this.x - this.width / 2,
    y: this.y - this.height / 2
  };

  this.animation_.redrawCenteredAt({
    x: this.x,
    y: this.y
  });

  if (this.spriteSheet_.framesPerAnimation > 1) {
    this.getElement().setAttribute('transform', 'rotate(' + DIR_TO_ROTATION[this.dir] +
     ', ' + this.x + ', ' + this.y + ')');
  }
};

Projectile.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  return {
    x: this.x + this.speed * unit.x,
    y: this.y + this.speed * unit.y
  };
};

Projectile.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};

/**
 * Change visible opacity of this projectile.
 * @param {number} newOpacity (between 0 and 1)
 * @override
 */
Projectile.prototype.setOpacity = function (newOpacity) {
  this.animation_.setOpacity(newOpacity);
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./StudioAnimation":"/home/ubuntu/staging/apps/build/js/studio/StudioAnimation.js","./StudioSpriteSheet":"/home/ubuntu/staging/apps/build/js/studio/StudioSpriteSheet.js","./collidable":"/home/ubuntu/staging/apps/build/js/studio/collidable.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/skins.js":[function(require,module,exports){
/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

var skinsBase = require('../skins');
var msg = require('./locale');
var constants = require('./constants');
var studioApp = require('../StudioApp').singleton;

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;


function loadGumball(skin, assetUrl) {
  skin.defaultBackground = 'dots';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'projectile_banana',
    'projectile_dodgeball',
    'projectile_donkey',
    'projectile_handbag',
    'projectile_hotdog',
    'projectile_pompom',
    'projectile_toaster',
    'projectile_waterball',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_projectile_banana',
    'item_projectile_dodgeball',
    'item_projectile_donkey',
    'item_projectile_handbag',
    'item_projectile_hotdog',
    'item_projectile_pompom',
    'item_projectile_toaster',
    'item_projectile_waterball',
  ];

  // Images
  skin.projectile_banana = skin.assetUrl('projectile_banana.png');
  skin.projectile_dodgeball = skin.assetUrl('projectile_dodgeball.png');
  skin.projectile_donkey = skin.assetUrl('projectile_donkey.png');
  skin.projectile_handbag = skin.assetUrl('projectile_handbag.png');
  skin.projectile_hotdog = skin.assetUrl('projectile_hotdog.png');
  skin.projectile_pompom = skin.assetUrl('projectile_pompom.png');
  skin.projectile_toaster = skin.assetUrl('projectile_toaster.png');
  skin.projectile_waterball = skin.assetUrl('projectile_waterball.png');

  // TODO: proper item class names
  skin.item_projectile_banana = skin.assetUrl('projectile_banana.png');
  skin.item_projectile_dodgeball = skin.assetUrl('projectile_dodgeball.png');
  skin.item_projectile_donkey = skin.assetUrl('projectile_donkey.png');
  skin.item_projectile_handbag = skin.assetUrl('projectile_handbag.png');
  skin.item_projectile_hotdog = skin.assetUrl('projectile_hotdog.png');
  skin.item_projectile_pompom = skin.assetUrl('projectile_pompom.png');
  skin.item_projectile_toaster = skin.assetUrl('projectile_toaster.png');
  skin.item_projectile_waterball = skin.assetUrl('projectile_waterball.png');

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 40;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 20;

  skin.characters = {
    background: skin.assetUrl('background_characters.png'),
  };
  skin.checkers = {
    background: skin.assetUrl('background_checkers.png'),
  };
  skin.clouds = {
    background: skin.assetUrl('background_clouds.png'),
  };
  skin.cornered = {
    background: skin.assetUrl('background_cornered.png'),
  };
  skin.dots = {
    background: skin.assetUrl('background_dots.png'),
  };
  skin.graffiti = {
    background: skin.assetUrl('background_graffiti.png'),
  };
  skin.space = {
    background: skin.assetUrl('background_space.png'),
  };
  skin.squares = {
    background: skin.assetUrl('background_squares.png'),
  };
  skin.wood = {
    background: skin.assetUrl('background_wood.png'),
  };

  skin.avatarList = ["anais", "antony", "bananajoe", "darwin", "gumball", "nicole", "penny", "richard"];
  skin.walkValues = [8, 8, 8, 12, 12, 8, 10, 12];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name, i) {
    skin[name] = {
      sprite: skin.assetUrl('idle_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: skin.walkValues[i],
        emotionCycles: 0,
        extraEmotions: 3
      },
      timePerFrame: 100
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundCharacters(), '"characters"'],
    [msg.setBackgroundCheckers(), '"checkers"'],
    [msg.setBackgroundClouds(), '"clouds"'],
    [msg.setBackgroundCornered(), '"cornered"'],
    [msg.setBackgroundDots(), '"dots"'],
    [msg.setBackgroundGraffiti(), '"graffiti"'],
    [msg.setBackgroundSpace(), '"space"'],
    [msg.setBackgroundSquares(), '"squares"'],
    [msg.setBackgroundWood(), '"wood"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.characters.background, '"characters"'],
    [skin.checkers.background, '"checkers"'],
    [skin.clouds.background, '"clouds"'],
    [skin.cornered.background, '"cornered"'],
    [skin.dots.background, '"dots"'],
    [skin.graffiti.background, '"graffiti"'],
    [skin.space.background, '"space"'],
    [skin.squares.background, '"squares"'],
    [skin.wood.background, '"wood"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteAnais(), '"anais"'],
    [msg.setSpriteAntony(), '"antony"'],
    [msg.setSpriteBananajoe(), '"bananajoe"'],
    [msg.setSpriteDarwin(), '"darwin"'],
    [msg.setSpriteGumball(), '"gumball"'],
    [msg.setSpriteNicole(), '"nicole"'],
    [msg.setSpritePenny(), '"penny"'],
    [msg.setSpriteRichard(), '"richard"']];

  skin.projectileChoices = [
    [msg.projectileBanana(), '"projectile_banana"'],
    [msg.projectileDodgeball(), '"projectile_dodgeball"'],
    [msg.projectileDonkey(), '"projectile_donkey"'],
    [msg.projectileHandbag(), '"projectile_handbag"'],
    [msg.projectileHotdog(), '"projectile_hotdog"'],
    [msg.projectilePompom(), '"projectile_pompom"'],
    [msg.projectileToaster(), '"projectile_toaster"'],
    [msg.projectileWaterball(), '"projectile_waterball"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemProjectileBanana(), '"item_projectile_banana"'],
    [msg.itemProjectileDodgeball(), '"item_projectile_dodgeball"'],
    [msg.itemProjectileDonkey(), '"item_projectile_donkey"'],
    [msg.itemProjectileHandbag(), '"item_projectile_handbag"'],
    [msg.itemProjectileHotdog(), '"item_projectile_hotdog"'],
    [msg.itemProjectilePompom(), '"item_projectile_pompom"'],
    [msg.itemProjectileToaster(), '"item_projectile_toaster"'],
    [msg.itemProjectileWaterball(), '"item_projectile_waterball"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadIceAge(skin, assetUrl) {
  skin.defaultBackground = 'icy';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'ia_projectile_1',
    'ia_projectile_2',
    'ia_projectile_3',
    'ia_projectile_4',
    'ia_projectile_5',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_ia_projectile_1',
    'item_ia_projectile_2',
    'item_ia_projectile_3',
    'item_ia_projectile_4',
    'item_ia_projectile_5',
  ];

  // Images
  skin.ia_projectile_1 = skin.assetUrl('ia_projectile_1.png');
  skin.ia_projectile_2 = skin.assetUrl('ia_projectile_2.png');
  skin.ia_projectile_3 = skin.assetUrl('ia_projectile_3.png');
  skin.ia_projectile_4 = skin.assetUrl('ia_projectile_4.png');
  skin.ia_projectile_5 = skin.assetUrl('ia_projectile_5.png');

  // TODO: proper item class names
  skin.item_ia_projectile_1 = skin.assetUrl('ia_projectile_1.png');
  skin.item_ia_projectile_2 = skin.assetUrl('ia_projectile_2.png');
  skin.item_ia_projectile_3 = skin.assetUrl('ia_projectile_3.png');
  skin.item_ia_projectile_4 = skin.assetUrl('ia_projectile_4.png');
  skin.item_ia_projectile_5 = skin.assetUrl('ia_projectile_5.png');

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 17;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 40;

  skin.grassy = {
    background: skin.assetUrl('background.jpg'),
  };
  skin.tile = {
    background: skin.assetUrl('background_tile.jpg'),
  };
  skin.leafy = {
    background: skin.assetUrl('background_leafy.jpg'),
  };
  skin.icy = {
    background: skin.assetUrl('background_icy.jpg'),
  };
  skin.flower = {
    background: skin.assetUrl('background_flower.jpg'),
  };

  skin.avatarList = ["manny", "sid", "scrat", "diego", "granny"];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: 12,
        emotionCycles: 0,
        extraEmotions: 3
      },
      timePerFrame: 100
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundGrassy(), '"grassy"'],
    [msg.setBackgroundTile(), '"tile"'],
    [msg.setBackgroundLeafy(), '"leafy"'],
    [msg.setBackgroundIcy(), '"icy"'],
    [msg.setBackgroundFlower(), '"flower"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.grassy.background, '"grassy"'],
    [skin.tile.background, '"tile"'],
    [skin.leafy.background, '"leafy"'],
    [skin.icy.background, '"icy"'],
    [skin.flower.background, '"flower"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteManny(), '"manny"'],
    [msg.setSpriteSid(), '"sid"'],
    [msg.setSpriteScrat(), '"scrat"'],
    [msg.setSpriteDiego(), '"diego"'],
    [msg.setSpriteGranny(), '"granny"']];

  skin.projectileChoices = [
    [msg.projectileIAProjectile1(), '"ia_projectile_1"'],
    [msg.projectileIAProjectile2(), '"ia_projectile_2"'],
    [msg.projectileIAProjectile3(), '"ia_projectile_3"'],
    [msg.projectileIAProjectile4(), '"ia_projectile_4"'],
    [msg.projectileIAProjectile5(), '"ia_projectile_5"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemIAProjectile1(), '"item_ia_projectile_1"'],
    [msg.itemIAProjectile2(), '"item_ia_projectile_2"'],
    [msg.itemIAProjectile3(), '"item_ia_projectile_3"'],
    [msg.itemIAProjectile4(), '"item_ia_projectile_4"'],
    [msg.itemIAProjectile5(), '"item_ia_projectile_5"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadInfinity(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.defaultBackground = 'leafy';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'projectile_hiro',
    'projectile_anna',
    'projectile_elsa',
    'projectile_baymax',
    'projectile_rapunzel',
    'projectile_cherry',
    'projectile_ice',
    'projectile_duck'
  ];

  skin.specialProjectileProperties = {
    'projectile_cherry': { frames: 13 },
    'projectile_ice': { frames: 12 },
    'projectile_duck': { frames: 12 }
  };

  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_hiro',
    'item_anna',
    'item_elsa',
    'item_baymax',
    'item_rapunzel',
    'item_cherry',
    'item_ice',
    'item_duck'
  ];

  skin.specialItemProperties = {
    'item_cherry': { frames: 13 },
    'item_ice': { frames: 12 },
    'item_duck': { frames: 12 }
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;
  skin.fadeExplosion = true;
  skin.timePerExplosionFrame = 100;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  skin.avatarList = ['anna', 'elsa', 'hiro', 'baymax', 'rapunzel'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 19,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: 12
      },
      timePerFrame: 100
    };
  });

  skin.preventProjectileLoop = function (className) {
    return className === 'projectile_hiro';
  };

  skin.preventItemLoop = function (className) {
    return className === 'item_hiro';
  };

  skin.projectile_hiro = skin.assetUrl('projectile_hiro.png');
  skin.projectile_anna = skin.assetUrl('projectile_anna.png');
  skin.projectile_elsa = skin.assetUrl('projectile_elsa.png');
  skin.projectile_baymax = skin.assetUrl('projectile_baymax.png');
  skin.projectile_rapunzel = skin.assetUrl('projectile_rapunzel.png');
  skin.projectile_cherry = skin.assetUrl('projectile_cherry.png');
  skin.projectile_ice = skin.assetUrl('projectile_ice.png');
  skin.projectile_duck = skin.assetUrl('projectile_duck.png');

  // TODO: Create actual item choices
  skin.item_hiro = skin.assetUrl('projectile_hiro.png');
  skin.item_anna = skin.assetUrl('projectile_anna.png');
  skin.item_elsa = skin.assetUrl('projectile_elsa.png');
  skin.item_baymax = skin.assetUrl('projectile_baymax.png');
  skin.item_rapunzel = skin.assetUrl('projectile_rapunzel.png');
  skin.item_cherry = skin.assetUrl('projectile_cherry.png');
  skin.item_ice = skin.assetUrl('projectile_ice.png');
  skin.item_duck = skin.assetUrl('projectile_duck.png');

  skin.leafy = {
    background: skin.assetUrl('background_leafy.jpg')
  };
  skin.grassy = {
    background: skin.assetUrl('background_grassy.jpg')
  };
  skin.flower = {
    background: skin.assetUrl('background_flower.jpg')
  };
  skin.tile = {
    background: skin.assetUrl('background_tile.jpg')
  };
  skin.icy = {
    background: skin.assetUrl('background_icy.jpg')
  };
  skin.snowy = {
    background: skin.assetUrl('background_snowy.jpg')
  };

  // These are used by blocks.js to customize our dropdown blocks across skins
  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundLeafy(), '"leafy"'],
    [msg.setBackgroundGrassy(), '"grassy"'],
    [msg.setBackgroundFlower(), '"flower"'],
    [msg.setBackgroundTile(), '"tile"'],
    [msg.setBackgroundIcy(), '"icy"'],
    [msg.setBackgroundSnowy(), '"snowy"'],
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.leafy.background, '"leafy"'],
    [skin.grassy.background, '"grassy"'],
    [skin.flower.background, '"flower"'],
    [skin.tile.background, '"tile"'],
    [skin.icy.background, '"icy"'],
    [skin.snowy.background, '"snowy"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
    ];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteAnna(), '"anna"'],
    [msg.setSpriteElsa(), '"elsa"'],
    [msg.setSpriteHiro(), '"hiro"'],
    [msg.setSpriteBaymax(), '"baymax"'],
    [msg.setSpriteRapunzel(), '"rapunzel"']];

  skin.projectileChoices = [
    [msg.projectileHiro(), '"projectile_hiro"'],
    [msg.projectileAnna(), '"projectile_anna"'],
    [msg.projectileElsa(), '"projectile_elsa"'],
    [msg.projectileBaymax(), '"projectile_baymax"'],
    [msg.projectileRapunzel(), '"projectile_rapunzel"'],
    [msg.projectileCherry(), '"projectile_cherry"'],
    [msg.projectileIce(), '"projectile_ice"'],
    [msg.projectileDuck(), '"projectile_duck"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemHiro(), '"item_hiro"'],
    [msg.itemAnna(), '"item_anna"'],
    [msg.itemElsa(), '"item_elsa"'],
    [msg.itemBaymax(), '"item_baymax"'],
    [msg.itemRapunzel(), '"item_rapunzel"'],
    [msg.itemCherry(), '"item_cherry"'],
    [msg.itemIce(), '"item_ice"'],
    [msg.itemDuck(), '"item_duck"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadHoc2015(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.hideIconInClearPuzzle = true;

  skin.defaultBackground = 'endor';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  skin.ItemClassNames = [
    'pufferpig',
    'stormtrooper',
    'tauntaun',
    'mynock',
    'probot',
    'mousedroid',
    'rebelpilot'
  ];

  skin.AutohandlerTouchItems = {
    whenTouchPufferPig: 'pufferpig',
    whenTouchStormtrooper: 'stormtrooper',
    whenTouchTauntaun: 'tauntaun',
    whenTouchMynock: 'mynock',
    whenTouchProbot: 'probot',
    whenTouchMouseDroid: 'mousedroid',
    whenTouchRebelPilot: 'rebelpilot',
    whenGetPufferPig: 'pufferpig',
    whenGetStormtrooper: 'stormtrooper',
    whenGetTauntaun: 'tauntaun',
    whenGetMynock: 'mynock',
    whenGetProbot: 'probot',
    whenGetMouseDroid: 'mousedroid',
    whenGetRebelPilot: 'rebelpilot',
  };

  skin.AutohandlerGetAllItems = {
    whenGetAllPufferPigs: 'pufferpig',
    whenGetAllStormtroopers: 'stormtrooper',
    whenGetAllTauntauns: 'tauntaun',
    whenGetAllMynocks: 'mynock',
    whenGetAllProbots: 'probot',
    whenGetAllMouseDroids: 'mousedroid',
    whenGetAllRebelPilots: 'rebelpilot',
  };

  skin.specialItemProperties = {
    'pufferpig':       { frames: 12, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true },
    'stormtrooper':    { frames: 12, width: 100, height: 100, scale: 1.1, renderOffset: { x: 0, y: -25}, activity: 'chase', speed: constants.SpriteSpeed.VERY_SLOW, spritesCounterclockwise: true  },
    'tauntaun':        { frames: 15, width: 100, height: 100, scale: 1.6, renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'mynock':          { frames:  8, width: 100, height: 100, scale: 0.9, renderOffset: { x: 0, y: -25}, activity: 'roam',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
    'probot':          { frames: 12, width: 100, height: 100, scale: 1.2, renderOffset: { x: 0, y: -25}, activity: 'chase', speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'mousedroid':      { frames:  1, width: 100, height: 100, scale: 0.5, renderOffset: { x: 0, y: -25}, activity: 'flee',  speed: constants.SpriteSpeed.LITTLE_SLOW, spritesCounterclockwise: true },
    'rebelpilot':      { frames: 13, width: 100, height: 100, scale: 1,   renderOffset: { x: 0, y: -25}, activity: 'flee',  speed: constants.SpriteSpeed.SLOW, spritesCounterclockwise: true },
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;

  // Spritesheet for animated goal.
  skin.animatedGoal = skin.assetUrl('goal_idle.png');

  // Dimensions of the goal sprite.
  skin.goalSpriteWidth = 100;
  skin.goalSpriteHeight = 100;

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 16;

  // How long to show each frame of the optional goal animation.
  skin.timePerGoalAnimationFrame = 100;

  // For a smaller collision region on a goal.
  skin.goalCollisionRectWidth = 50;
  skin.goalCollisionRectHeight = 50;

  // Whether that goal should fade out when touched.  If true, then the
  // success image is never shown.
  skin.fadeOutGoal = true;
  skin.goalSuccess = null;

  // Draw a goal an an offset to its usual location, useful for oversize goal
  // images, such as a person standing taller than a single grid square whose
  // feet should still be planted in that grid square.
  skin.goalRenderOffsetX = -25;
  skin.goalRenderOffsetY = -45;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  // Dimensions of a rectangle in collidable center in which item collisions occur.
  skin.itemCollisionRectWidth  = 50;
  skin.itemCollisionRectHeight = 50;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 50;
  skin.spriteCollisionRectHeight = 50;

  // Offset & dimensions of a rectangle in collidable in which wall collisions occur.
  // For isometric-style rendering, this would normally be the feet.
  skin.wallCollisionRectOffsetX = 0;
  skin.wallCollisionRectOffsetY = 24;
  skin.wallCollisionRectWidth  = 30;
  skin.wallCollisionRectHeight = 20;

  // When movement is grid aligned, sprite coordinates are the top-left corner
  // of the sprite, and match the top-left corner of the grid square in question.
  // When we draw the sprites bigger, this means the sprite's "feet" will usually
  // be too far to the right and below that square.  These offsets are a chance
  // to move the rendering of the sprite up and to the left, when negative, so
  // that the "feet" are planted at the bottom center of the grid square.
  skin.gridSpriteRenderOffsetX = -30;
  skin.gridSpriteRenderOffsetY = -40;

  skin.avatarList = ['r2-d2', 'c-3po'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: name == 'r2-d2' ? 14 : 16,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: name == 'r2-d2' ? 14 : 8
      },
      timePerFrame: 100
    };
  });

  skin['r2-d2'].movementAudio = [
    { begin: 'r2-d2_move1_start', loop: 'r2-d2_move1_loop', end: 'r2-d2_move1_end', volume: 2.2 },
    { begin: 'r2-d2_move2_start', loop: 'r2-d2_move2_loop', end: 'r2-d2_move2_end', volume: 2.2 },
    { begin: 'r2-d2_move3_start', loop: 'r2-d2_move3_loop', end: 'r2-d2_move3_end', volume: 2.2 }
  ];
  skin['c-3po'].movementAudio = [
    { loop: 'c-3po_move_loop', end: 'c-3po_move_end', volume: 0.6 }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === '';
  };

  // No failure avatar for this skin.
  skin.failureAvatar = null;

  skin.pufferpig = skin.assetUrl('walk_pufferpig.png');
  skin.stormtrooper = skin.assetUrl('walk_stormtrooper.png');
  skin.tauntaun = skin.assetUrl('walk_tauntaun.png');
  skin.mynock = skin.assetUrl('walk_mynock.png');
  skin.probot = skin.assetUrl('walk_probot.png');
  skin.mousedroid = skin.assetUrl('walk_mousedroid.png');
  skin.rebelpilot = skin.assetUrl('walk_rebelpilot.png');

  skin.endor = {
    background: skin.assetUrl('background_endor.jpg'),
    tiles: skin.assetUrl('tiles_endor.png'),
    jumboTiles: skin.assetUrl('jumbotiles_endor.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4,
    clouds: [skin.assetUrl('cloud_light.png'), skin.assetUrl('cloud_light2.png')]
  };
  skin.hoth = {
    background: skin.assetUrl('background_hoth.jpg'),
    tiles: skin.assetUrl('tiles_hoth.png'),
    jumboTiles: skin.assetUrl('jumbotiles_hoth.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4,
    clouds: [skin.assetUrl('cloud_dark.png'), skin.assetUrl('cloud_dark2.png')]
  };
  skin.starship = {
    background: skin.assetUrl('background_starship.jpg'),
    tiles: skin.assetUrl('tiles_starship.png'),
    jumboTiles: skin.assetUrl('jumbotiles_starship.png'),
    jumboTilesAddOffset: -5,
    jumboTilesSize: 60,
    jumboTilesRows: 4,
    jumboTilesCols: 4
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Since we don't have jumbo tiles for our "Hoth" background, in the case
  // of the two maps that use jumbo pieces ("circle" and "horizontal") we
  // return a special version of the map that just uses regular tile pieces.

  skin.getMap = function(background, map) {
    if (background == "hoth" && (map == "circle" || map == "horizontal")) {
      return map + "_nonjumbo";
    }
    else {
      return map;
    }
  };

  skin.blank =
    [[0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0],
     [0,  0,  0,  0,  0,  0,  0,  0]];

  skin.circle_nonjumbo =
    [[0x00, 0x00, 0x00, 0x00,  0x00,  0x00, 0x00, 0x00],
     [0x00, 0x11, 0x02, 0x03,  0x00,  0x44, 0x45, 0x00],
     [0x00, 0x04, 0x00, 0x00,  0x00,  0x00, 0x03, 0x00],
     [0x00, 0x14, 0x00, 0x121, 0x121, 0x00, 0x05, 0x00],
     [0x00, 0x02, 0x00, 0x121, 0x121, 0x00, 0x15, 0x00],
     [0x00, 0x03, 0x00, 0x00,  0x00,  0x00, 0x02, 0x00],
     [0x00, 0x24, 0x25, 0x02,  0x00,  0x34, 0x35, 0x00],
     [0x00, 0x00, 0x00, 0x00,  0x00,  0x00, 0x00, 0x00]];

  skin.circle =
    [[0x00, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0x00, 0x200, 0x213, 0x213, 0x00,  0x213, 0x201, 0x00],
     [0x00, 0x212, 0x00,  0x00,  0x00,  0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x121, 0x121, 0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x121, 0x121, 0x00,  0x212, 0x00],
     [0x00, 0x212, 0x00,  0x00,  0x00,  0x00,  0x212, 0x00],
     [0x00, 0x202, 0x213, 0x213, 0x00,  0x213, 0x203, 0x00],
     [0x00, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00]];

  skin.horizontal_nonjumbo =
    [[0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x02, 0x03, 0x04, 0x00, 0x24, 0x25, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x10, 0x00, 0x34, 0x35, 0x20, 0x23, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x03, 0x02, 0x22, 0x20, 0x21, 0x00, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];

  skin.horizontal =
    [[0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x213, 0x213, 0x213, 0x00,  0x213, 0x213, 0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x10,  0x00,  0x213, 0x213, 0x213, 0x213, 0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x213, 0x213, 0x213, 0x213, 0x213, 0x00,  0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00],
     [0, 0x00,  0x00,  0x00,  0x00,  0x00,  0x00,  0x00]];

  skin.grid =
    [[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x21, 0x00, 0x10, 0x00, 0x20, 0x00, 0x03],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x02, 0x00, 0x11, 0x00, 0x21, 0x00, 0x02],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x03, 0x00, 0x20, 0x00, 0x22, 0x00, 0x11],
     [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
     [0x00, 0x10, 0x00, 0x21, 0x00, 0x23, 0x00, 0x10]];

  skin.blobs =
    [[0x00, 0x00,  0x00,  0x00,  0x00, 0x00,  0x00,  0x00],
     [0x00, 0x103, 0x103, 0x00,  0x00, 0x00,  0x22,  0x00],
     [0x00, 0x103, 0x103, 0x00,  0x00, 0x110, 0x110, 0x00],
     [0x00, 0x00,  0x00,  0x00,  0x00, 0x110, 0x110, 0x00],
     [0x00, 0x00,  0x102, 0x102, 0x00, 0x00,  0x00,  0x00],
     [0x00, 0x00,  0x102, 0x102, 0x00, 0x00,  0x00,  0x23],
     [0x00, 0x00,  0x03,  0x00,  0x00, 0x00,  0x121, 0x121],
     [0x00, 0x00,  0x00,  0x00,  0x00, 0x00,  0x121, 0x121]];

  // Sounds.
  skin.sounds = [
    'R2-D2sound1', 'R2-D2sound2', 'R2-D2sound3', 'R2-D2sound4',
    'R2-D2sound5', 'R2-D2sound6', 'R2-D2sound7', 'R2-D2sound8',
    'R2-D2sound9',
    'C-3POsound1', 'C-3POsound2', 'C-3POsound3', 'C-3POsound4',
    'PufferPigSound1', 'PufferPigSound2', 'PufferPigSound3', 'PufferPigSound4',
    'TauntaunSound1', 'TauntaunSound2', 'TauntaunSound3', 'TauntaunSound4',
    'MynockSound1', 'MynockSound2', 'MynockSound3',
    'ProbotSound1', 'ProbotSound2', 'ProbotSound3',
    'MouseDroidSound1', 'MouseDroidSound2', 'MouseDroidSound3',
    'alert1', 'alert2', 'alert3', 'alert4',
    'applause'
  ];

  skin.soundChoices = [
    [msg.playSoundRandom(), RANDOM_VALUE],
    [msg.playSoundR2D2Sound1(), 'R2-D2sound1'],
    [msg.playSoundR2D2Sound2(), 'R2-D2sound2'],
    [msg.playSoundR2D2Sound3(), 'R2-D2sound3'],
    [msg.playSoundR2D2Sound4(), 'R2-D2sound4'],
    [msg.playSoundR2D2Sound5(), 'R2-D2sound5'],
    [msg.playSoundR2D2Sound6(), 'R2-D2sound6'],
    [msg.playSoundR2D2Sound7(), 'R2-D2sound7'],
    [msg.playSoundR2D2Sound8(), 'R2-D2sound8'],
    [msg.playSoundR2D2Sound9(), 'R2-D2sound9'],
    [msg.playSoundC3POSound1(), 'C3-POsound1'],
    [msg.playSoundC3POSound2(), 'C3-POsound2'],
    [msg.playSoundC3POSound3(), 'C3-POsound3'],
    [msg.playSoundC3POSound4(), 'C3-POsound4'],
    [msg.playSoundPufferPigSound1(), 'PufferPigSound1'],
    [msg.playSoundPufferPigSound2(), 'PufferPigSound2'],
    [msg.playSoundPufferPigSound3(), 'PufferPigSound3'],
    [msg.playSoundPufferPigSound4(), 'PufferPigSound4'],
    [msg.playSoundTauntaunSound1(), 'TauntaunSound1'],
    [msg.playSoundTauntaunSound2(), 'TauntaunSound2'],
    [msg.playSoundTauntaunSound3(), 'TauntaunSound3'],
    [msg.playSoundTauntaunSound4(), 'TauntaunSound4'],
    [msg.playSoundMynockSound1(), 'MynockSound1'],
    [msg.playSoundMynockSound2(), 'MynockSound2'],
    [msg.playSoundMynockSound3(), 'MynockSound3'],
    [msg.playSoundProbotSound1(), 'ProbotSound1'],
    [msg.playSoundProbotSound2(), 'ProbotSound2'],
    [msg.playSoundProbotSound3(), 'ProbotSound3'],
    [msg.playSoundMouseDroidSound1(), 'MouseDroidSound1'],
    [msg.playSoundMouseDroidSound2(), 'MouseDroidSound2'],
    [msg.playSoundMouseDroidSound3(), 'MouseDroidSound3'],
    [msg.playSoundAlert1(), 'alert1'],
    [msg.playSoundAlert2(), 'alert2'],
    [msg.playSoundAlert3(), 'alert3'],
    [msg.playSoundAlert4(), 'alert4'],
    [msg.playSoundApplause(), 'applause']];

  skin.soundChoicesK1 = [
  ];

  skin.soundMetadata = [
    {name: 'start', volume: 0.2},
    {name: 'win', volume: 0.2},
    {name: 'failure', volume: 0.2},
    {name: 'flag', volume: 0.2},
    {name: 'R2-D2sound1', volume: 0.2},
    {name: 'R2-D2sound2', volume: 0.2},
    {name: 'R2-D2sound3', volume: 0.2},
    {name: 'R2-D2sound4', volume: 0.2},
    {name: 'R2-D2sound5', volume: 0.2},
    {name: 'R2-D2sound6', volume: 0.2},
    {name: 'R2-D2sound7', volume: 0.2},
    {name: 'R2-D2sound8', volume: 0.2},
    {name: 'R2-D2sound9', volume: 0.2},
    {name: 'C-3POsound1', volume: 0.2},
    {name: 'C-3POsound2', volume: 0.2},
    {name: 'C-3POsound3', volume: 0.2},
    {name: 'C-3POsound4', volume: 0.2},
    {name: 'PufferPigSound1', volume: 0.2},
    {name: 'PufferPigSound2', volume: 0.2},
    {name: 'PufferPigSound3', volume: 0.2},
    {name: 'PufferPigSound4', volume: 0.2},
    {name: 'TauntaunSound1', volume: 0.2},
    {name: 'TauntaunSound2', volume: 0.2},
    {name: 'TauntaunSound3', volume: 0.2},
    {name: 'TauntaunSound4', volume: 0.2},
    {name: 'MynockSound1', volume: 0.2},
    {name: 'MynockSound2', volume: 0.2},
    {name: 'MynockSound3', volume: 0.2},
    {name: 'ProbotSound1', volume: 0.2},
    {name: 'ProbotSound2', volume: 0.2},
    {name: 'ProbotSound3', volume: 0.2},
    {name: 'MouseDroidSound1', volume: 0.2},
    {name: 'MouseDroidSound2', volume: 0.2},
    {name: 'MouseDroidSound3', volume: 0.2},
    {name: 'alert1', volume: 0.2},
    {name: 'alert2', volume: 0.2},
    {name: 'alert3', volume: 0.2},
    {name: 'alert4', volume: 0.2},
    {name: 'applause', volume: 0.2}
  ];

  skin.musicMetadata = HOC2015_MUSIC_METADATA;

  // Normally the sound isn't played for the final goal, but this forces it
  // to be played.
  skin.playFinalGoalSound = true;

  // These are used by blocks.js to customize our dropdown blocks across skins
  // NOTE: map names must have double quotes inside single quotes
  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    [msg.setMapRandom(), RANDOM_VALUE],
    [msg.setMapBlank(), '"blank"'],
    [msg.setMapCircle(), '"circle"'],
    [msg.setMapHorizontal(), '"horizontal"'],
    [msg.setMapGrid(), '"grid"'],
    [msg.setMapBlobs(), '"blobs"']
    ];

  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundEndor(), '"endor"'],
    [msg.setBackgroundHoth(), '"hoth"'],
    [msg.setBackgroundStarship(), '"starship"']
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.endor.background, '"endor"'],
    [skin.hoth.background, '"hoth"'],
    [skin.starship.background, '"starship"'],
    [skin.randomPurpleIcon, RANDOM_VALUE],
    ];

  skin.spriteChoices = [
    [msg.setDroidHidden(), HIDDEN_VALUE],
    [msg.setDroidRandom(), RANDOM_VALUE],
    [msg.setDroidR2D2(), '"r2-d2"'],
    [msg.setDroidC3PO(), '"c-3po"']];

  skin.setSpritePrefix = msg.setDroid();

  skin.projectileChoices = [];

  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemStormtrooper(), '"stormtrooper"'],
    [msg.itemRebelPilot(), '"rebelpilot"'],
    [msg.itemPufferPig(), '"pufferpig"'],
    [msg.itemMynock(), '"mynock"'],
    [msg.itemMouseDroid(), '"mousedroid"'],
    [msg.itemTauntaun(), '"tauntaun"'],
    [msg.itemProbot(), '"probot"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}

function loadHoc2015x(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.hideIconInClearPuzzle = true;

  skin.defaultBackground = 'main';
  skin.projectileFrames = 10;
  skin.itemFrames = 10;

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
  ];

  skin.ItemClassNames = [
    'hazard'
  ];

  skin.AutohandlerTouchItems = {
  };

  skin.AutohandlerGetAllItems = {
  };

  skin.specialItemProperties = {
    'hazard': { frames: 13, animationRate: 5, width: 100, height: 100, scale: 1.3, renderOffset: { x: 0, y: -25}, activity: 'watchActor', speed: constants.SpriteSpeed.VERY_SLOW, isHazard: true }
  };

  // Spritesheet for animated goal.
  skin.goal1 = skin.assetUrl('goal1.png');
  skin.goal2 = skin.assetUrl('goal2.png');

  // Dimensions of the goal sprite.
  skin.goalSpriteWidth = 50;
  skin.goalSpriteHeight = 50;

  // How many frames in the animated goal spritesheet.
  skin.animatedGoalFrames = 1;
  skin.disableClipRectOnGoals = true;

  // Special effect applied to goal sprites
  skin.goalEffect = 'glow';

  // How long to show each frame of the optional goal animation.
  skin.timePerGoalAnimationFrame = 100;

  // For a smaller collision region on a goal.
  skin.goalCollisionRectWidth = 50;
  skin.goalCollisionRectHeight = 50;

  // Whether that goal should fade out when touched.  If true, then the
  // success image is never shown.
  skin.fadeOutGoal = true;
  skin.goalSuccess = null;

  // Draw a goal an an offset to its usual location, useful for oversize goal
  // images, such as a person standing taller than a single grid square whose
  // feet should still be planted in that grid square.
  skin.goalRenderOffsetX = 0;
  skin.goalRenderOffsetY = 0;

  // Dimensions of a rectangle in collidable center from which projectiles begin.
  skin.projectileSpriteWidth  = 70;
  skin.projectileSpriteHeight = 70;

  // Dimensions of a rectangle in collidable center in which item collisions occur.
  skin.itemCollisionRectWidth  = 50;
  skin.itemCollisionRectHeight = 50;

  // Dimensions of a rectangle in sprite center in which item collisions occur.
  skin.spriteCollisionRectWidth  = 50;
  skin.spriteCollisionRectHeight = 50;

  // Offset & dimensions of a rectangle in collidable in which wall collisions occur.
  // For isometric-style rendering, this would normally be the feet.
  skin.wallCollisionRectOffsetX = 0;
  skin.wallCollisionRectOffsetY = 24;
  skin.wallCollisionRectWidth  = 30;
  skin.wallCollisionRectHeight = 20;

  // When movement is grid aligned, sprite coordinates are the top-left corner
  // of the sprite, and match the top-left corner of the grid square in question.
  // When we draw the sprites bigger, this means the sprite's "feet" will usually
  // be too far to the right and below that square.  These offsets are a chance
  // to move the rendering of the sprite up and to the left, when negative, so
  // that the "feet" are planted at the bottom center of the grid square.
  skin.gridSpriteRenderOffsetX = -20;
  skin.gridSpriteRenderOffsetY = -40;

  skin.avatarList = ['bb-8'];
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl('avatar_' + name + '.png'),
      walk: skin.assetUrl('walk_' + name + '.png'),
      dropdownThumbnail: skin.assetUrl('avatar_' + name + '_thumb.png'),
      frameCounts: {
        normal: 21,
        animation: 0,
        turns: 8,
        emotions: 0,
        walk: 19
      },
      timePerFrame: 100
    };
  });
  skin['bb-8'].movementAudio = [
    { begin: 'move1', volume: 0.3 },
    { begin: 'move2', volume: 0.3 },
    { begin: 'move3', volume: 0.3 },
    { begin: 'move4', volume: 0.3 }
  ];

  skin.preventProjectileLoop = function (className) {
    return className === '';
  };

  skin.preventItemLoop = function (className) {
    return className === '';
  };

  skin.hazard = skin.assetUrl('hazard_idle.png');

  skin.main = {
    background: skin.assetUrl('background_background1.jpg'),
    tiles: skin.assetUrl('tiles_background1.png'),
    clouds: [skin.assetUrl('cloud_light.png'), skin.assetUrl('cloud_light2.png')]
  };

  // It's possible to enlarge the rendering of some wall tiles so that they
  // overlap each other a little.  Define a bounding rectangle for the source
  // tiles that get this treatment.

  skin.enlargeWallTiles = { minCol: 0, maxCol: 3, minRow: 3, maxRow: 5 };

  // Sounds.
  skin.sounds = [ 'move1', 'move2', 'move3', 'move4' ];

  skin.soundChoices = [
    ];

  skin.soundChoicesK1 = [
  ];

  skin.musicMetadata = HOC2015_MUSIC_METADATA;

  // Normally the sound isn't played for the final goal, but this forces it
  // to be played.
  skin.playFinalGoalSound = true;

  // These are used by blocks.js to customize our dropdown blocks across skins
  // NOTE: map names must have double quotes inside single quotes
  // NOTE: first item must be RANDOM_VALUE
  skin.mapChoices = [
    ];

  skin.backgroundChoices = [
    ];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    ];

  skin.spriteChoices = [
    [msg.setDroidHidden(), HIDDEN_VALUE],
    [msg.setDroidRandom(), RANDOM_VALUE],
    [msg.setDroidBB8(), '"bb-8"']];

  skin.setSpritePrefix = msg.setDroid();

  skin.projectileChoices = [];

  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    ];
}

/**
 * Music tracks and associated metadata for both hoc2015 and hoc2015x tutorials.
 * Individual levels don't load all of these, only the subset they request.
 * @const {MusicTrackDefinition[]}
 */
var HOC2015_MUSIC_METADATA = [
  { name: 'song1', volume: 0.5 },
  { name: 'song2', volume: 0.5 },
  { name: 'song3', volume: 0.5 },
  { name: 'song4', volume: 0.4 },
  { name: 'song5', volume: 0.4 },
  { name: 'song6', volume: 0.5 },
  { name: 'song7', volume: 0.4 },
  { name: 'song8', volume: 0.4 },
  { name: 'song9', volume: 0.4 },
  { name: 'song10', volume: 0.5 },
  { name: 'song11', volume: 0.45 },
  { name: 'song12', volume: 0.4 },
  { name: 'song13', volume: 0.4 },
  { name: 'song14', volume: 0.5 },
  { name: 'song15', volume: 0.55 }
];

function loadStudio(skin, assetUrl) {
  skin.defaultBackground = 'cave';
  skin.projectileFrames = 8;
  skin.itemFrames = 8;

  skin.explosion = skin.assetUrl('explosion.png');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');
  skin.explosionFrames = 20;
  skin.fadeExplosion = false;
  skin.timePerExplosionFrame = 40;

  skin.hardcourt = {
    background: skin.assetUrl('background.png'),
  };
  skin.black = {
    background: skin.assetUrl('retro_background.png'),
  };
  skin.cave = {
    background: skin.assetUrl('background_cave.png'),
  };
  skin.night = {
    background: skin.assetUrl('background_santa.png'),
  };
  skin.cloudy = {
    background: skin.assetUrl('background_scifi.png'),
  };
  skin.underwater = {
    background: skin.assetUrl('background_underwater.png'),
  };
  skin.city = {
    background: skin.assetUrl('background_city.png'),
  };
  skin.desert = {
    background: skin.assetUrl('background_desert.png'),
  };
  skin.rainbow = {
    background: skin.assetUrl('background_rainbow.png'),
  };
  skin.soccer = {
    background: skin.assetUrl('background_soccer.png'),
  };
  skin.space = {
    background: skin.assetUrl('background_space.png'),
  };
  skin.tennis = {
    background: skin.assetUrl('background_tennis.png'),
  };
  skin.winter = {
    background: skin.assetUrl('background_winter.png'),
  };
  skin.grid = {
    background: skin.assetUrl('background_grid.png'),
  };

  skin.avatarList = [ "dog", "cat", "penguin", "dinosaur", "octopus", "witch",
    "bat", "bird", "dragon", "squirrel", "wizard", "alien", "ghost", "monster",
    "robot", "unicorn", "zombie", "knight", "ninja", "pirate", "caveboy",
    "cavegirl", "princess", "spacebot", "soccergirl", "soccerboy", "tennisgirl",
    "tennisboy"];

  /**
   * Sprite thumbs generated with:
   * `brew install graphicsmagick`
   * `gm convert +adjoin -crop 200x200 -resize 100x100 *spritesheet* output%02d.png`
   */
  skin.avatarList.forEach(function (name) {
    skin[name] = {
      sprite: skin.assetUrl(name + '_spritesheet_200px.png'),
      dropdownThumbnail: skin.assetUrl(name + '_thumb.png'),
      frameCounts: {
        normal: 1,
        animation: 1,
        turns: 7,
        emotions: 3
      }
    };
  });


  skin.backgroundChoices = [
    [msg.setBackgroundRandom(), RANDOM_VALUE],
    [msg.setBackgroundCave(), '"cave"'],
    [msg.setBackgroundNight(), '"night"'],
    [msg.setBackgroundCloudy(), '"cloudy"'],
    [msg.setBackgroundUnderwater(), '"underwater"'],
    [msg.setBackgroundHardcourt(), '"hardcourt"'],
    [msg.setBackgroundBlack(), '"black"'],
    [msg.setBackgroundCity(), '"city"'],
    [msg.setBackgroundDesert(), '"desert"'],
    [msg.setBackgroundRainbow(), '"rainbow"'],
    [msg.setBackgroundSoccer(), '"soccer"'],
    [msg.setBackgroundSpace(), '"space"'],
    [msg.setBackgroundTennis(), '"tennis"'],
    [msg.setBackgroundWinter(), '"winter"']];

  // NOTE: background names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.backgroundChoicesK1 = [
    [skin.cave.background, '"cave"'],
    [skin.night.background, '"night"'],
    [skin.cloudy.background, '"cloudy"'],
    [skin.underwater.background, '"underwater"'],
    [skin.hardcourt.background, '"hardcourt"'],
    [skin.black.background, '"black"'],
    [skin.city.background, '"city"'],
    [skin.desert.background, '"desert"'],
    [skin.rainbow.background, '"rainbow"'],
    [skin.soccer.background, '"soccer"'],
    [skin.space.background, '"space"'],
    [skin.tennis.background, '"tennis"'],
    [skin.winter.background, '"winter"'],
    [skin.randomPurpleIcon, RANDOM_VALUE]];

  skin.spriteChoices = [
    [msg.setSpriteHidden(), HIDDEN_VALUE],
    [msg.setSpriteRandom(), RANDOM_VALUE],
    [msg.setSpriteWitch(), '"witch"'],
    [msg.setSpriteCat(), '"cat"'],
    [msg.setSpriteDinosaur(), '"dinosaur"'],
    [msg.setSpriteDog(), '"dog"'],
    [msg.setSpriteOctopus(), '"octopus"'],
    [msg.setSpritePenguin(), '"penguin"'],
    [msg.setSpriteBat(), '"bat"'],
    [msg.setSpriteBird(), '"bird"'],
    [msg.setSpriteDragon(), '"dragon"'],
    [msg.setSpriteSquirrel(), '"squirrel"'],
    [msg.setSpriteWizard(), '"wizard"'],
    [msg.setSpriteAlien(), '"alien"'],
    [msg.setSpriteGhost(), '"ghost"'],
    [msg.setSpriteMonster(), '"monster"'],
    [msg.setSpriteRobot(), '"robot"'],
    [msg.setSpriteUnicorn(), '"unicorn"'],
    [msg.setSpriteZombie(), '"zombie"'],
    [msg.setSpriteKnight(), '"knight"'],
    [msg.setSpriteNinja(), '"ninja"'],
    [msg.setSpritePirate(), '"pirate"'],
    [msg.setSpriteCaveBoy(), '"caveboy"'],
    [msg.setSpriteCaveGirl(), '"cavegirl"'],
    [msg.setSpritePrincess(), '"princess"'],
    [msg.setSpriteSpacebot(), '"spacebot"'],
    [msg.setSpriteSoccerGirl(), '"soccergirl"'],
    [msg.setSpriteSoccerBoy(), '"soccerboy"'],
    [msg.setSpriteTennisGirl(), '"tennisgirl"'],
    [msg.setSpriteTennisBoy(), '"tennisboy"']];

  skin.projectileChoices = [
    [msg.projectileBlueFireball(), '"blue_fireball"'],
    [msg.projectilePurpleFireball(), '"purple_fireball"'],
    [msg.projectileRedFireball(), '"red_fireball"'],
    [msg.projectileYellowHearts(), '"yellow_hearts"'],
    [msg.projectilePurpleHearts(), '"purple_hearts"'],
    [msg.projectileRedHearts(), '"red_hearts"'],
    [msg.projectileRandom(), RANDOM_VALUE]];

  // TODO: Create actual item choices
  // NOTE: item names must have double quotes inside single quotes
  // NOTE: last item must be RANDOM_VALUE
  skin.itemChoices = [
    [msg.itemBlueFireball(), '"item_blue_fireball"'],
    [msg.itemPurpleFireball(), '"item_purple_fireball"'],
    [msg.itemRedFireball(), '"item_red_fireball"'],
    [msg.itemYellowHearts(), '"item_yellow_hearts"'],
    [msg.itemPurpleHearts(), '"item_purple_hearts"'],
    [msg.itemRedHearts(), '"item_red_hearts"'],
    [msg.itemRandom(), RANDOM_VALUE]];
}


exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);

  // NOTE: all class names should be unique.  eventhandler naming won't work
  // if we name a projectile class 'left' for example.
  skin.ProjectileClassNames = [
    'blue_fireball',
    'purple_fireball',
    'red_fireball',
    'purple_hearts',
    'red_hearts',
    'yellow_hearts',
  ];
  // TODO: proper item class names
  skin.ItemClassNames = [
    'item_blue_fireball',
    'item_purple_fireball',
    'item_red_fireball',
    'item_purple_hearts',
    'item_red_hearts',
    'item_yellow_hearts',
  ];

  // Images
  skin.yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.red_hearts = skin.assetUrl('red_hearts.gif');
  skin.blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.red_fireball = skin.assetUrl('red_fireball.png');

  // TODO: proper item class names
  skin.item_yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.item_purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.item_red_hearts = skin.assetUrl('red_hearts.gif');
  skin.item_blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.item_purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.item_red_fireball = skin.assetUrl('red_fireball.png');

  skin.whenUp = skin.assetUrl('when-up.png');
  skin.whenDown = skin.assetUrl('when-down.png');
  skin.whenLeft = skin.assetUrl('when-left.png');
  skin.whenRight = skin.assetUrl('when-right.png');
  skin.collide = skin.assetUrl('when-sprite-collide.png');
  skin.emotionAngry = skin.assetUrl('emotion-angry.png');
  skin.emotionNormal = skin.assetUrl('emotion-nothing.png');
  skin.emotionSad = skin.assetUrl('emotion-sad.png');
  skin.emotionHappy = skin.assetUrl('emotion-happy.png');
  skin.speechBubble = skin.assetUrl('say-sprite.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');

  // Sounds
  skin.builtinSounds = [ 'start', 'win', 'failure', 'flag' ];
  skin.sounds = [
    'rubber', 'crunch', 'goal1', 'goal2', 'wood', 'retro', 'slap', 'hit',
    'winpoint', 'winpoint2', 'losepoint', 'losepoint2'
  ];

  skin.soundChoices = [
    [msg.playSoundRandom(), RANDOM_VALUE],
    [msg.playSoundHit(), 'hit'],
    [msg.playSoundWood(), 'wood'],
    [msg.playSoundRetro(), 'retro'],
    [msg.playSoundSlap(), 'slap'],
    [msg.playSoundRubber(), 'rubber'],
    [msg.playSoundCrunch(), 'crunch'],
    [msg.playSoundWinPoint(), 'winpoint'],
    [msg.playSoundWinPoint2(), 'winpoint2'],
    [msg.playSoundLosePoint(), 'losepoint'],
    [msg.playSoundLosePoint2(), 'losepoint2'],
    [msg.playSoundGoal1(), 'goal1'],
    [msg.playSoundGoal2(), 'goal2']];

  skin.soundChoicesK1 = [
    [msg.soundRandom(), RANDOM_VALUE],
    [msg.soundHit(), 'hit'],
    [msg.soundWood(), 'wood'],
    [msg.soundRetro(), 'retro'],
    [msg.soundSlap(), 'slap'],
    [msg.soundRubber(), 'rubber'],
    [msg.soundCrunch(), 'crunch'],
    [msg.soundWinPoint(), 'winpoint'],
    [msg.soundWinPoint2(), 'winpoint2'],
    [msg.soundLosePoint(), 'losepoint'],
    [msg.soundLosePoint2(), 'losepoint2'],
    [msg.soundGoal1(), 'goal1'],
    [msg.soundGoal2(), 'goal2']];

  // Settings
  skin.background = skin.assetUrl('background.png');
  skin.spriteHeight = 100;
  skin.spriteWidth = 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  skin.preloadAssets = true;

  skin.setSpritePrefix = msg.setSprite();

  skin.activityChoices = [
    [msg.setActivityRandom(), RANDOM_VALUE],
    [msg.setActivityRoam(), '"roam"'],
    [msg.setActivityChase(), '"chase"'],
    [msg.setActivityFlee(), '"flee"'],
    [msg.setActivityNone(), '"none"'],
    ];

  // take care of items specific to skins
  switch (skin.id) {
    case 'gumball':
      loadGumball(skin, assetUrl);
      break;
    case 'iceage':
      loadIceAge(skin, assetUrl);
      break;
    case 'infinity':
      loadInfinity(skin, assetUrl);
      break;
    case 'hoc2015':
      loadHoc2015(skin, assetUrl);
      break;
    case 'hoc2015x':
      loadHoc2015x(skin, assetUrl);
      break;
    case 'studio':
      loadStudio(skin, assetUrl);
      break;
  }

  return skin;
};


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js"}],"/home/ubuntu/staging/apps/build/js/studio/levels.js":[function(require,module,exports){
/*jshint multistr: true */

var msg = require('./locale');
var utils = require('../utils');
var blockUtils = require('../block_utils');
var constants = require('./constants');
var Direction = constants.Direction;
var Emotions = constants.Emotions;
var tb = blockUtils.createToolbox;
var blockOfType = blockUtils.blockOfType;
var createCategory = blockUtils.createCategory;

/**
 * Constructs a required block definition to match "Say [sprite] [text]" blocks
 * @param options (all optional):
 *          sprite (string): zero-indexed string ID of sprite, e.g., "1"
 *          notDefaultText (boolean): require changing the text from the default
 *          requiredText (string): text must change from default. we show
 *            requiredText in feedback blocks
 * @returns test definition suitable for feedback.js::getMissingBlocks
 *          required block processing
 */
function saySpriteRequiredBlock(options) {
  var titles = {};
  if (options.sprite) {
    titles.SPRITE = options.sprite;
  }
  if (options.requiredText) {
    titles.TEXT = options.requiredText;
  }
  if (options.notDefaultText) {
    titles.TEXT = msg.helloWorld();
  }

  return [
    {
      test: function (block) {
        if (block.type !== 'studio_saySprite') {
          return false;
        }
        if (options.sprite && block.getTitleValue("SPRITE") !== options.sprite) {
          return false;
        }
        if ((options.notDefaultText || options.requiredText) && block.getTitleValue("TEXT") === msg.defaultSayText()) {
          return false;
        }

        return true;
      },
      type: 'studio_saySprite',
      titles: titles
    }
  ];
}

/**
 * Constructs a required block definition to match "move [sprite] [dir]" blocks
 * @param {string} [options.sprite] zero-indexed string ID of sprite, e.g., "1"
 * @param {string} [options.dir] string of Direction constant. We show
 *        the direction in feedback blocks
 * @returns {Array} test definition suitable for getMissingRequiredBlocks
 *          required block processing
 * @see FeedbackUtils#getMissingRequiredBlocks
 */
function moveRequiredBlock(options) {
  var titles = {};
  if (options.sprite) {
    titles.SPRITE = options.sprite;
  }
  if (options.dir) {
    titles.DIR = options.dir;
  }

  return [
    {
      test: function (block) {
        if (block.type !== 'studio_move') {
          return false;
        }
        if (options.sprite && block.getTitleValue("SPRITE") !== options.sprite) {
          return false;
        }
        if (options.dir && block.getTitleValue("DIR") !== options.dir) {
          return false;
        }

        return true;
      },
      type: 'studio_move',
      titles: titles
    }
  ];
}

function moveNorthRequiredBlock() {
  return moveRequiredBlock({ dir: '1' });
}

function moveSouthRequiredBlock() {
  return moveRequiredBlock({ dir: '4' });
}

function moveEastRequiredBlock() {
  return moveRequiredBlock({ dir: '2' });
}

function moveWestRequiredBlock() {
  return moveRequiredBlock({ dir: '8' });
}

/**
 * Hoc2015 blockly helpers. We base hoc2015 blockly levels off of hoc2015 droplet
 * levels, marking them as editCode=false and overriding the startBlocks,
 * requiredBlocks and toolboxes as appropriate for the blockly progression
 */

var hocMoveNSEW = '<block type="studio_move"><title name="DIR">1</title></block> \
  <block type="studio_move"><title name="DIR">4</title></block> \
  <block type="studio_move"><title name="DIR">8</title></block> \
  <block type="studio_move"><title name="DIR">2</title></block>';

var hocMoveNS = '<block type="studio_move"><title name="DIR">1</title></block> \
  <block type="studio_move"><title name="DIR">4</title></block>';

var whenRunMoveEast = '<block type="when_run"><next> \
  <block type="studio_move"><title name="DIR">2</title></block></next> \
  </block>';

var whenRunMoveSouth = '<block type="when_run"><next> \
  <block type="studio_move"><title name="DIR">4</title></block></next> \
  </block>';

var whenUpDown = '<block type="studio_whenUp" deletable="false" x="20" y="20"></block> \
  <block type="studio_whenDown" deletable="false" x="20" y="150"></block>';

var whenUpDownLeftRight = '<block type="studio_whenUp" deletable="false" x="20" y="20"></block> \
  <block type="studio_whenDown" deletable="false" x="20" y="150"></block> \
  <block type="studio_whenLeft" deletable="false" x="20" y="280"></block> \
  <block type="studio_whenRight" deletable="false" x="20" y="410"></block>';

/**
 * K1 helpers. We base k1 levels off of existing non-k1 levels, marking them as isK1 and
 * overriding the requiredBlocks and toolboxes as appropriate for the k1 progression
 */

var moveDistanceNSEW = blockOfType('studio_moveNorthDistance') +
  blockOfType('studio_moveEastDistance') +
  blockOfType('studio_moveSouthDistance') +
  blockOfType('studio_moveWestDistance');

var moveNSEW = blockOfType('studio_moveNorth') +
  blockOfType('studio_moveEast') +
  blockOfType('studio_moveSouth') +
  blockOfType('studio_moveWest');

function whenArrowBlocks(yOffset, yDelta) {
  return '<block type="studio_whenUp" deletable="false" x="20" y="' + (yOffset).toString() + '"></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="'+ (yDelta + yOffset).toString() +'"></block> \
    <block type="studio_whenLeft" deletable="false" x="20" y="' + (2 * yDelta + yOffset).toString() + '"></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="' + (3 * yDelta + yOffset).toString() + '"></block>';
}

function foreverUpAndDownBlocks(yPosition) {
  return '<block type="studio_repeatForever" deletable="false" x="20" y="' + yPosition + '"> \
      <statement name="DO"><block type="studio_moveDistance"> \
        <title name="SPRITE">1</title> \
        <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
          <title name="SPRITE">1</title> \
          <title name="DISTANCE">400</title> \
          <title name="DIR">4</title></block> \
        </next></block> \
      </statement></block>';
}

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

// Base config for levels created via levelbuilder
levels.custom = {
  'ideal': Infinity,
  'requiredBlocks': [],
  'scale': {
    'snapRadius': 2
  },
  'startBlocks': ''
};

// Can you make this dog say "hello world"
levels.dog_hello = {
  'ideal': 2,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      notDefaultText: true
    }),
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return (Studio.sayComplete > 0);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb(blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_1 = utils.extend(levels.dog_hello,  {
  'isK1': true,
  'toolbox': tb(blockOfType('studio_saySprite'))
});
levels.c2_1 = utils.extend(levels.dog_hello);
levels.c3_story_1 = utils.extend(levels.dog_hello);
levels.playlab_1 = utils.extend(levels.dog_hello, {
  background: 'winter',
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  firstSpriteIndex: 2, // penguin
  goal: {
    successCondition: function () {
      return Studio.allWhenRunBlocksComplete() && Studio.sayComplete > 0;
    }
  },
  // difference is we say hello instead of hello world
  requiredBlocks: [
    saySpriteRequiredBlock({
      requiredText: msg.hello()
    }),
  ]
});

levels.iceage_1 = utils.extend(levels.playlab_1, {
  background: 'icy',
  firstSpriteIndex: 0, // manny
});
levels.gumball_1 = utils.extend(levels.playlab_1, {
  background: 'dots',
  firstSpriteIndex: 0, // manny
});

// Can you make the dog say something and then have the cat say something afterwards?
levels.dog_and_cat_hello =  {
  'ideal': 3,
  'requiredBlocks': [
    // make sure each sprite says something
    saySpriteRequiredBlock({
      sprite: "0",
      notDefaultText: true
    }),
    saySpriteRequiredBlock({
      sprite: "1",
      notDefaultText: true
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return (Studio.sayComplete > 1);
    }
  },
  'timeoutFailureTick': 200,
  'toolbox':
    tb(blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_2 = utils.extend(levels.dog_and_cat_hello, {
  'isK1': true,
  'toolbox': tb(blockOfType('studio_saySprite'))
});
levels.c2_2 = utils.extend(levels.dog_and_cat_hello, {});
levels.c3_story_2 = utils.extend(levels.dog_and_cat_hello, {});
levels.playlab_2 = utils.extend(levels.dog_and_cat_hello, {
  background: 'desert',
  firstSpriteIndex: 20, // cave boy
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  defaultEmotion: Emotions.HAPPY,
  goal: {
    successCondition: function () {
      return Studio.allWhenRunBlocksComplete() && Studio.sayComplete > 1;
    }
  },
  requiredBlocks: [
    // make sure each sprite says something
    saySpriteRequiredBlock({
      sprite: "0",
      requiredText: msg.hello()
    }),
    saySpriteRequiredBlock({
      sprite: "1",
      requiredText: msg.hello()
    })
  ],
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
});
levels.iceage_2 = utils.extend(levels.playlab_2, {
  background: 'leafy',
  firstSpriteIndex: 3, // diego
});
levels.gumball_2 = utils.extend(levels.playlab_2, {
  background: 'dots',
  firstSpriteIndex: 3, // diego
});

// extended by: k1_3
// Can you write a program to make this dog move to the cat?
levels.dog_move_cat =  {
  'ideal': 2,
  'requiredBlocks': [
    [{'test': 'moveDistance', 'type': 'studio_moveDistance', 'titles': {'DIR': '2'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0, 16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_3 = utils.extend(levels.dog_move_cat,  {
  'isK1': true,
  'requiredBlocks': [
    [{
      test: function(block) {
        return block.type == 'studio_moveEastDistance';
      },
      type: 'studio_moveEastDistance'}]
  ],
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_saySprite')),
});
levels.c2_3 = utils.extend(levels.dog_move_cat, {});
levels.c3_story_3 = utils.extend(levels.dog_move_cat, {});

levels.playlab_3 = {
  ideal: 2,
  requiredBlocks: [
    [{
      test: 'moveDistance',
      type: 'studio_moveDistance',
      titles: { DIR: '2', DISTANCE: '200'}
    }]
  ],
  timeoutFailureTick: null,
  timeoutAfterWhenRun: true,
  scale: {
    snapRadius: 2
  },
  background: 'tennis',
  firstSpriteIndex: 26, // tennis girl
  toolbox:
    tb(
      '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">200</title></block>'
       ),
  startBlocks: '<block type="when_run" deletable="false" x="20" y="20"></block>',
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
};
levels.iceage_3 = utils.extend(levels.playlab_3, {
  background: 'grassy',
  firstSpriteIndex: 2, // scrat
});
levels.gumball_3 = utils.extend(levels.playlab_3, {
  background: 'clouds',
  firstSpriteIndex: 2, // scrat
});


// Can you write a program that makes the dog move to the cat, and have the cat
// say "hello" when the dog reaches him?
levels.dog_move_cat_hello =  {
  'ideal': 4,
  'requiredBlocks': [
    [{'test': 'moveDistance', 'type': 'studio_moveDistance', 'titles': {'DIR': '2', 'DISTANCE': '100'}}],
    saySpriteRequiredBlock({
      sprite: "1",
      requiredText: msg.hello()
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'goal': {
    successCondition: function () {
      return ((Studio.sayComplete > 0) && Studio.sprite[0].isCollidingWith(1));
    }
  },
  'timeoutFailureTick': 200,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="120"></block>'
};
levels.k1_4 = utils.extend(levels.dog_move_cat_hello,  {
  'isK1': true,
  'requiredBlocks': [
    [{
      test: function(block) {
        return block.type == 'studio_moveEastDistance';
      },
      type: 'studio_moveEastDistance',
    }],
    [{
      test: function(block) {
        // Make sure they have the right block, and have changed the default
        // text
        return block.type == 'studio_saySprite' &&
          block.getTitleValue("SPRITE") === '1' &&
          block.getTitleValue("TEXT") !== msg.defaultSayText();
      },
      type: 'studio_saySprite',
      titles: {'TEXT': msg.hello(), 'SPRITE': '1'}
    }]
  ],
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_saySprite')),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20"></block> \
     <block type="studio_whenSpriteCollided" deletable="false" x="20" y="140"></block>'
});
levels.c2_4 = utils.extend(levels.dog_move_cat_hello, {});
levels.c3_story_4 = utils.extend(levels.dog_move_cat_hello, {});

levels.playlab_4 = {
  ideal: 4,
  scale: {
    snapRadius: 2
  },
  background: 'tennis',
  avatarList: ['tennisboy', 'tennisgirl'],
  defaultEmotion: Emotions.SAD,
  requiredBlocks: [
    [{
      test: 'moveDistance',
      type: 'studio_moveDistance',
      titles: { DIR: '4', DISTANCE: '200'}
    }],
    [{
      test: 'playSound',
      type: 'studio_playSound',
      titles: { SOUND: 'goal1'}
    }]
  ],
  // timeout when we've hit 100 OR we had only when run commands and finished them
  timeoutFailureTick: 100,
  timeoutAfterWhenRun: true,
  goal: {
    successCondition: function () {
      return Studio.playSoundCount > 0 && Studio.sprite[0].isCollidingWith(1);
    }
  },
  toolbox:
    tb(
      '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">200</title></block>' +
      '<block type="studio_playSound"><title name="SOUND">goal1</title></block>'
       ),
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="120"></block>',
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
};
levels.iceage_4 = utils.extend(levels.playlab_4, {
  background: 'grassy',
  avatarList: ['scrat', 'granny']
});
levels.gumball_4 = utils.extend(levels.playlab_4, {
  background: 'checkers',
  avatarList: ['gumball', 'darwin']
});

// Can you write a program to make the octopus say "hello" when it is clicked?
levels.click_hello =  {
  'ideal': 3,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      requiredText: msg.hello()
    })
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 4,
  'goal': {
    successCondition: function () {
      if (!this.successState.seenCmd) {
        this.successState.seenCmd = Studio.isCmdCurrentInQueue('saySprite', 'whenSpriteClicked-0');
      }
      return (Studio.sayComplete > 0 && this.successState.seenCmd);
    }
  },
  'timeoutFailureTick': 300,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenSpriteClicked" deletable="false" x="20" y="120"></block>'
};
levels.c2_5 = utils.extend(levels.click_hello, {});
levels.c3_game_1 = utils.extend(levels.click_hello, {});
levels.playlab_5 = utils.extend(levels.click_hello, {
  background: 'space',
  firstSpriteIndex: 23, // spacebot
  timeoutAfterWhenRun: true,
  defaultEmotion: Emotions.HAPPY,
  toolbox: tb(blockOfType('studio_saySprite')),
  startBlocks:
   '<block type="studio_whenSpriteClicked" deletable="false" x="20" y="20"></block>'
});
levels.iceage_5 = utils.extend(levels.playlab_5, {
  background: 'icy',
  firstSpriteIndex: 1, // sid
});
levels.gumball_5 = utils.extend(levels.playlab_5, {
  background: 'characters',
  firstSpriteIndex: 1, // sid
});

levels.octopus_happy =  {
  'ideal': 2,
  'requiredBlocks': [
    [{'test': 'setSpriteEmotion', 'type': 'studio_setSpriteEmotion'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 4,
  'goal': {
    successCondition: function () {
      return (Studio.sprite[0].emotion === Emotions.HAPPY) &&
             (Studio.tickCount >= 50);
    }
  },
  'timeoutFailureTick': 100,
  'toolbox':
    tb('<block type="studio_moveDistance"><title name="DIR">2</title></block>' +
       blockOfType('studio_setSpriteEmotion')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.k1_5 = utils.extend(levels.octopus_happy,  {
  'isK1': true,
  'toolbox': tb(moveDistanceNSEW + blockOfType('studio_setSpriteEmotion'))
});
levels.c3_story_5 = utils.extend(levels.octopus_happy, {});

// Create your own story. When you're done, click Finish to let friends try your
// story on their phones.
levels.c3_story_6 = {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': false,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(blockOfType('studio_setSprite') +
       blockOfType('studio_setBackground') +
       blockOfType('studio_whenSpriteCollided') +
       blockOfType('studio_repeatForever') +
       blockOfType('studio_showTitleScreen') +
       blockOfType('studio_move') +
       blockOfType('studio_moveDistance') +
       blockOfType('studio_stop') +
       blockOfType('studio_wait') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore') +
       blockOfType('studio_saySprite') +
       blockOfType('studio_setSpritePosition') +
       blockOfType('studio_setSpriteSpeed') +
       blockOfType('studio_setSpriteEmotion')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

// Can you write a program to make this penguin move around using the up / down /
// left /right keys to hit all of the targets?
levels.move_penguin =  {
  'ideal': 8,
  'requiredBlocks': [
    [{'test': 'move', 'type': 'studio_move'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,16, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'toolbox':
    tb(blockOfType('studio_move') +
       blockOfType('studio_saySprite')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"></block> \
    <block type="studio_whenRight" deletable="false" x="180" y="20"></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="120"></block> \
    <block type="studio_whenDown" deletable="false" x="180" y="120"></block>'
};
levels.c2_6 = utils.extend(levels.move_penguin, {});
levels.c3_game_2 = utils.extend(levels.move_penguin, {});
levels.playlab_6 = utils.extend(levels.move_penguin, {
  background: 'cave',
  firstSpriteIndex: 5, // witch
  goalOverride: {
    goalImage: 'red_fireball',
    successImage: 'blue_fireball',
    imageWidth: 800
  },
  defaultEmotion: Emotions.ANGRY,
  toolbox:
    tb(
      blockOfType('studio_move', {DIR: 8}) +
      blockOfType('studio_move', {DIR: 2}) +
      blockOfType('studio_move', {DIR: 1}) +
      blockOfType('studio_move', {DIR: 4})
    ),
  map: [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 16,0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
});
levels.iceage_6 = utils.extend(levels.playlab_6, {
  background: 'tile',
  firstSpriteIndex: 3, // diego
  goalOverride: {} // This prevents the override from original playlab from being used
});
levels.gumball_6 = utils.extend(levels.playlab_6, {
  background: 'cornered',
  firstSpriteIndex: 3, // diego
  goalOverride: {} // This prevents the override from original playlab from being used
});

// The "repeat forever" block allows you to run code continuously. Can you
// attach blocks to move this dinosaur up and down repeatedly?
levels.dino_up_and_down =  {
  'ideal': 11,
  'requiredBlocks': [
    [{'test': 'moveDistance',
      'type': 'studio_moveDistance',
      'titles': {'SPRITE': '1', 'DISTANCE': '400'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'protagonistSpriteIndex': 1,
  'timeoutFailureTick': 150,
  'minWorkspaceHeight': 800,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       '<block type="studio_saySprite"> \
         <title name="SPRITE">1</title></block>'),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"></block>'
};
levels.c2_7 = utils.extend(levels.dino_up_and_down, {});
levels.c3_game_3 = utils.extend(levels.dino_up_and_down, {});

levels.playlab_7 = {
  ideal: 3,
  background: 'rainbow',
  firstSpriteIndex: 10, // wizard
  scale: {
    snapRadius: 2
  },
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  defaultEmotion: Emotions.HAPPY,
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  goal: {
    successCondition: function () {
      // successful after a given period of time as long as we've used all
      // required blocks. this number has us go back and forth twice, and end
      // facing forward
      return Studio.tickCount === 252;
    },
  },
  timeoutFailureTick: 253,
  minWorkspaceHeight: 800,
  toolbox: tb(
    '<block type="studio_moveDistance"><title name="DIR">1</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">2</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">4</title><title name="DISTANCE">400</title></block>' +
    '<block type="studio_moveDistance"><title name="DIR">8</title><title name="DISTANCE">400</title></block>'
  ),
  startBlocks: '<block type="studio_repeatForever" deletable="false" x="20" y="20"></block>',
  requiredBlocks: [
    [{
      test: function (b) {
        return b.type === 'studio_moveDistance' && b.getTitleValue('DIR') === '2';
      },
      type: 'studio_moveDistance',
      titles: {DIR: 2, DISTANCE: '400'}
    }],
    [{
      test: function (b) {
        return b.type === 'studio_moveDistance' && b.getTitleValue('DIR') === '8';
      },
      type: 'studio_moveDistance',
      titles: {DIR: 8, DISTANCE: '400'}
    }]
  ],
};
levels.iceage_7 = utils.extend(levels.playlab_7, {
  background: 'icy',
  firstSpriteIndex: 1, // sid
});
levels.gumball_7 = utils.extend(levels.playlab_7, {
  background: 'graffiti',
  firstSpriteIndex: 1, // sid
});

// Can you have the penguin say "Ouch!" and play a "hit" sound if he runs into
// the dinosaur, and then move him with the arrows to make that happen?
levels.penguin_ouch =  {
  'ideal': 14,
  'requiredBlocks': [
    saySpriteRequiredBlock({
      sprite: "0",
      requiredText: msg.ouchExclamation()
    }),
    [{'test': 'playSound', 'type': 'studio_playSound'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 900,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  'timeoutFailureTick': 300,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       blockOfType('studio_saySprite') +
       blockOfType('studio_playSound')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"> \
      <statement name="DO"><block type="studio_moveDistance"> \
              <title name="SPRITE">1</title> \
              <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
                <title name="SPRITE">1</title> \
                <title name="DISTANCE">400</title> \
                <title name="DIR">4</title></block> \
        </next></block> \
    </statement></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="730"></block>'
};
levels.c2_8 = utils.extend(levels.penguin_ouch, {});
levels.c3_game_4 = utils.extend(levels.penguin_ouch, {});

// Can you add a block to score a point when the penguin runs into the octopus,
// and then move him with the arrows until you score?
levels.penguin_touch_octopus = {
  'ideal': 16,
  'requiredBlocks': [
    [{'test': 'changeScore', 'type': 'studio_changeScore'}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 1050,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(2);
    }
  },
  'timeoutFailureTick': 600,
  'toolbox':
    tb('<block type="studio_moveDistance"> \
         <title name="DISTANCE">400</title> \
         <title name="SPRITE">1</title></block>' +
       blockOfType('studio_saySprite') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore')),
  'startBlocks':
   '<block type="studio_whenLeft" deletable="false" x="20" y="20"> \
      <next><block type="studio_move"> \
              <title name="DIR">8</title></block> \
      </next></block> \
    <block type="studio_whenRight" deletable="false" x="20" y="150"> \
      <next><block type="studio_move"> \
              <title name="DIR">2</title></block> \
      </next></block> \
    <block type="studio_whenUp" deletable="false" x="20" y="280"> \
      <next><block type="studio_move"> \
              <title name="DIR">1</title></block> \
      </next></block> \
    <block type="studio_whenDown" deletable="false" x="20" y="410"> \
      <next><block type="studio_move"> \
              <title name="DIR">4</title></block> \
      </next></block> \
    <block type="studio_repeatForever" deletable="false" x="20" y="540"> \
      <statement name="DO"><block type="studio_moveDistance"> \
              <title name="SPRITE">1</title> \
              <title name="DISTANCE">400</title> \
        <next><block type="studio_moveDistance"> \
                <title name="SPRITE">1</title> \
                <title name="DISTANCE">400</title> \
                <title name="DIR">4</title></block> \
        </next></block> \
    </statement></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="730"> \
      <next><block type="studio_playSound"> \
      <next><block type="studio_saySprite"> \
              <title name="TEXT">Ouch!</title></block> \
      </next></block> \
      </next></block> \
    <block type="studio_whenSpriteCollided" deletable="false" x="20" y="860"> \
     <title name="SPRITE2">2</title></block>'
};
levels.c2_9 = utils.extend(levels.penguin_touch_octopus, {});
levels.c3_game_5 = utils.extend(levels.penguin_touch_octopus, {});

levels.playlab_8 = {
  background: 'rainbow',
  ideal: 16,
  requiredBlocks: [
    [{test: 'changeScore', type: 'studio_changeScore'}],
    [{test: 'playSound', type: 'studio_playSound', titles: {SOUND: 'winpoint'}}]
  ],
  scale: {
    snapRadius: 2
  },
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0,16, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  avatarList: ['unicorn', 'wizard'],
  defaultEmotion: Emotions.HAPPY,
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1) && Studio.playerScore === 1;
    },
    failureCondition: function () {
      return Studio.sprite[0].isCollidingWith(1) && Studio.playerScore !== 1;
    }
  },
  timeoutFailureTick: 600,
  toolbox: tb(
    blockOfType('studio_changeScore') +
    '<block type="studio_playSound"><title name="SOUND">winpoint</title></block>'
  ),
  startBlocks:
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', { SPRITE: 1, DIR: 2, DISTANCE: 400},
          blockOfType('studio_moveDistance', { SPRITE: 1, DIR: 8, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="300"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 8}) +
    '</next></block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="400"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 2}) +
    '</next></block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="500"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 1}) +
    '</next></block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="600"><next>' +
      blockOfType('studio_move', { SPRITE: 0, DIR: 4}) +
    '</next></block>'

};
levels.iceage_8 = utils.extend(levels.playlab_8, {
  background: 'icy',
  avatarList: ['manny', 'sid']
});
levels.gumball_8 = utils.extend(levels.playlab_8, {
  background: 'wood',
  avatarList: ['bananajoe', 'antony']
});

// Can you add blocks to change the background and the speed of the penguin, and
// then move him with the arrows until you score?
levels.change_background_and_speed =  {
  'ideal': 19,
  'requiredBlocks': [
    [{'test': 'setBackground',
      'type': 'studio_setBackground',
      'titles': {'VALUE': '"night"'}}],
    [{'test': 'setSpriteSpeed',
      'type': 'studio_setSpriteSpeed',
      'titles': {'VALUE': 'Studio.SpriteSpeed.FAST'}}]
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0,16, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'firstSpriteIndex': 2,
  'minWorkspaceHeight': 1250,
  'goal': {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(2);
    }
  },
  'timeoutFailureTick': 600,
  'toolbox':
    tb(
      blockOfType('studio_setBackground', {VALUE: '"night"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound') +
      blockOfType('studio_changeScore') +
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'})
    ),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="200">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="330">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="460">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="590">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="720">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="880">' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {},
          blockOfType('studio_saySprite', {TEXT: msg.ouchExclamation()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="1040">' +
      '<title name="SPRITE2">2</title>' +
      '<next>' +
        blockOfType('studio_changeScore') +
      '</next>' +
    '</block>'
};
levels.c2_10 = utils.extend(levels.change_background_and_speed, {});
levels.c3_game_6 = utils.extend(levels.change_background_and_speed, {});

levels.playlab_9 = {
  background: 'black',
  requiredBlocks: [
    [{test: 'setBackground',
      type: 'studio_setBackground',
      titles: {VALUE: '"space"'}}],
    [{test: 'setSpriteSpeed',
      type: 'studio_setSpriteSpeed',
      titles: {VALUE: 'Studio.SpriteSpeed.FAST'}}]
  ],
  timeoutFailureTick: 400,
  scale: {
    snapRadius: 2
  },
  defaultEmotion: Emotions.ANGRY,
  softButtons: [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  avatarList: ['spacebot', 'alien'],
  goal: {
    successCondition: function () {
      return Studio.sprite[0].isCollidingWith(1);
    }
  },
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [16,0, 0, 0, 0, 0,16, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  toolbox:
    tb(
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'}) +
      blockOfType('studio_setBackground', {VALUE: '"space"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound', {SOUND: 'winpoint2'}) +
      blockOfType('studio_changeScore')
    ),
  minWorkspaceHeight: 1250,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="290">' +
      '<title name="SPRITE2">0</title>' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {SOUND: 'winpoint2'},
          blockOfType('studio_saySprite', {TEXT: msg.alienInvasion()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="410">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="510">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="610">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="710">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>'
};

levels.iceage_9 = utils.extend(levels.playlab_9, {
  background: 'flower',
  toolbox:
    tb(
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'}) +
      blockOfType('studio_setBackground', {VALUE: '"icy"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound', {SOUND: 'winpoint2'}) +
      blockOfType('studio_changeScore')
    ),
  requiredBlocks: [
    [{test: 'setBackground',
      type: 'studio_setBackground',
      titles: {VALUE: '"grassy"'}}],
    [{test: 'setSpriteSpeed',
      type: 'studio_setSpriteSpeed',
      titles: {VALUE: 'Studio.SpriteSpeed.FAST'}}]
  ],
  avatarList: ['sid', 'granny'],
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="290">' +
      '<title name="SPRITE2">0</title>' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {SOUND: 'winpoint2'},
          blockOfType('studio_saySprite', {TEXT: msg.iceAge()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="410">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="510">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="610">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="710">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>'
});
levels.gumball_9 = utils.extend(levels.playlab_9, {
  background: 'space',
  toolbox:
    tb(
      blockOfType('studio_setSpriteSpeed', {VALUE: 'Studio.SpriteSpeed.FAST'}) +
      blockOfType('studio_setBackground', {VALUE: '"icy"'}) +
      blockOfType('studio_moveDistance', {DISTANCE: 400, SPRITE: 1}) +
      blockOfType('studio_saySprite') +
      blockOfType('studio_playSound', {SOUND: 'winpoint2'}) +
      blockOfType('studio_changeScore')
    ),
  requiredBlocks: [
    [{test: 'setBackground',
      type: 'studio_setBackground',
      titles: {VALUE: '"space"'}}],
    [{test: 'setSpriteSpeed',
      type: 'studio_setSpriteSpeed',
      titles: {VALUE: 'Studio.SpriteSpeed.FAST'}}]
  ],
  avatarList: ['nicole', 'penny'],
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"></block>' +
    '<block type="studio_repeatForever" deletable="false" x="20" y="150">' +
      '<statement name="DO">' +
        blockUtils.blockWithNext('studio_moveDistance', {SPRITE: 1, DIR: 1, DISTANCE: 400},
          blockOfType('studio_moveDistance', {SPRITE: 1, DIR: 4, DISTANCE: 400})
        ) +
      '</statement>' +
    '</block>' +
    '<block type="studio_whenSpriteCollided" deletable="false" x="20" y="290">' +
      '<title name="SPRITE2">0</title>' +
      '<title name="SPRITE2">1</title>' +
      '<next>' +
        blockUtils.blockWithNext('studio_playSound', {SOUND: 'winpoint2'},
          blockOfType('studio_saySprite', {TEXT: msg.iceAge()})
        ) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenLeft" deletable="false" x="20" y="410">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 8}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenRight" deletable="false" x="20" y="510">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 2}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenUp" deletable="false" x="20" y="610">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 1}) +
      '</next>' +
    '</block>' +
    '<block type="studio_whenDown" deletable="false" x="20" y="710">' +
      '<next>' +
        blockOfType('studio_move', {DIR: 4}) +
      '</next>' +
    '</block>'
});

// Create your own game. When you're done, click Finish to let friends try your story on their phones.
levels.sandbox =  {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': false,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(blockOfType('studio_setSprite') +
       blockOfType('studio_setBackground') +
       blockOfType('studio_whenArrow') +
       blockOfType('studio_whenSpriteClicked') +
       blockOfType('studio_whenSpriteCollided') +
       blockOfType('studio_repeatForever') +
       blockOfType('studio_showTitleScreen') +
       blockOfType('studio_move') +
       blockOfType('studio_moveDistance') +
       blockOfType('studio_stop') +
       blockOfType('studio_wait') +
       blockOfType('studio_playSound') +
       blockOfType('studio_changeScore') +
       blockOfType('studio_saySprite') +
       blockOfType('studio_setSpritePosition') +
       blockOfType('studio_throw') +
       blockOfType('studio_makeProjectile') +
       blockOfType('studio_setSpriteSpeed') +
       blockOfType('studio_setSpriteEmotion') +
       blockOfType('studio_vanish')),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};
levels.c2_11 = utils.extend(levels.sandbox, {});
levels.c3_game_7 = utils.extend(levels.sandbox, {});
levels.playlab_10 = utils.extend(levels.sandbox, {});
levels.iceage_10 = utils.extend(levels.playlab_10, {});
levels.gumball_10 = utils.extend(levels.playlab_10, {});

// Create your own story! Move around the cat and dog, and make them say things.
levels.k1_6 = {
  'ideal': Infinity,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'minWorkspaceHeight': 1500,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16, 0,16, 0,16, 0,16, 0],
    [ 0,16, 0,16, 0,16, 0, 0],
    [16,16,16,16,16,16,16, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'isK1': true,
  softButtons: [],
  'toolbox':
    tb(
      blockOfType('studio_setSprite') +
      blockOfType('studio_saySprite') +
      moveDistanceNSEW +
      blockOfType('studio_whenSpriteCollided') +
      blockOfType('studio_setBackground') +
      blockOfType('studio_setSpriteSpeed') +
      blockOfType('studio_setSpriteEmotion') +
      blockOfType('studio_playSound') +
      blockOfType('studio_vanish')),
  'startBlocks':
    '<block type="when_run" deletable="false" x="20" y="20">\
      <next><block type="studio_setSprite"> \
        <title name="SPRITE">0</title></block> \
      </next></block>'
};

levels.k1_block_test = utils.extend(levels['99'], {
  'toolbox':
    tb(
      blockOfType('studio_setSprite') +
      blockOfType('studio_moveNorth') +
      blockOfType('studio_moveSouth') +
      blockOfType('studio_moveEast') +
      blockOfType('studio_moveWest') +
      blockOfType('studio_moveNorth_length') +
      blockOfType('studio_moveSouth_length') +
      blockOfType('studio_moveEast_length') +
      blockOfType('studio_moveWest_length')
    ),
  'isK1': true
});

// you can get here via http://learn.code.org/2014/11, which is semi-hidden
levels.full_sandbox =  {
  'scrollbars' : true,
  'requiredBlocks': [
  ],
  'scale': {
    'snapRadius': 2
  },
  'softButtons': [
    'leftButton',
    'rightButton',
    'downButton',
    'upButton'
  ],
  'minWorkspaceHeight': 1400,
  'edgeCollisions': true,
  'projectileCollisions': true,
  'allowSpritesOutsidePlayspace': true,
  'spritesHiddenToStart': true,
  'freePlay': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'toolbox':
    tb(createCategory(msg.catActions(),
                        blockOfType('studio_setSprite') +
                        blockOfType('studio_setBackground') +
                      '<block type="studio_showTitleScreenParams"> \
                        <value name="TITLE"><block type="text"></block> \
                        </value> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                        blockOfType('studio_move') +
                    '<block type="studio_moveDistanceParams" inline="true"> \
                      <value name="DISTANCE"><block type="math_number"> \
                              <title name="NUM">25</title></block> \
                      </value></block>' +
                        blockOfType('studio_stop') +
                      '<block type="studio_waitParams" inline="true"> \
                        <value name="VALUE"><block type="math_number"> \
                                <title name="NUM">1</title></block> \
                        </value></block>' +
                        blockOfType('studio_playSound') +
                      '<block type="studio_setScoreText" inline="true"> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                      '<block type="studio_saySpriteParams" inline="true"> \
                        <value name="TEXT"><block type="text"></block> \
                        </value></block>' +
                        blockOfType('studio_setSpritePosition') +
                        blockOfType('studio_addCharacter') +
                        blockOfType('studio_throw') +
                        blockOfType('studio_makeProjectile') +
                        blockOfType('studio_setSpriteSpeed') +
                        blockOfType('studio_setSpriteEmotion') +
                        blockOfType('studio_vanish') +
                        blockOfType('studio_setSpriteSize') +
                        blockOfType('studio_showCoordinates')) +
       createCategory(msg.catEvents(),
                        blockOfType('studio_whenArrow') +
                        blockOfType('studio_whenSpriteClicked') +
                        blockOfType('studio_whenSpriteCollided')) +
       createCategory(msg.catControl(),
                        blockOfType('studio_repeatForever') +
                       '<block type="controls_repeat_ext"> \
                          <value name="TIMES"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_whileUntil') +
                       '<block type="controls_for"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">10</title> \
                            </block> \
                          </value> \
                          <value name="BY"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('controls_flow_statements')) +
       createCategory(msg.catLogic(),
                        blockOfType('controls_if') +
                        blockOfType('logic_compare') +
                        blockOfType('logic_operation') +
                        blockOfType('logic_negate') +
                        blockOfType('logic_boolean')) +
       createCategory(msg.catMath(),
                        blockOfType('math_number') +
                       '<block type="math_change"> \
                          <value name="DELTA"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                        </block>' +
                       '<block type="math_random_int"> \
                          <value name="FROM"> \
                            <block type="math_number"> \
                              <title name="NUM">1</title> \
                            </block> \
                          </value> \
                          <value name="TO"> \
                            <block type="math_number"> \
                              <title name="NUM">100</title> \
                            </block> \
                          </value> \
                        </block>' +
                        blockOfType('math_arithmetic')) +
       createCategory(msg.catText(),
                        blockOfType('text') +
                        blockOfType('text_join') +
                       '<block type="text_append"> \
                          <value name="TEXT"> \
                            <block type="text"></block> \
                          </value> \
                        </block>') +
       createCategory(msg.catVariables(), '', 'VARIABLE') +
       createCategory(msg.catProcedures(), '', 'PROCEDURE') +
       createCategory('Functional',
           blockOfType('functional_string') +
           blockOfType('functional_background_string_picker') +
           blockOfType('functional_math_number') +
           '<block type="functional_math_number_dropdown">' +
             '<title name="NUM" config="2,3,4,5,6,7,8,9,10,11,12">???</title>' +
           '</block>') +
       createCategory('Functional Start',
           blockOfType('functional_start_setSpeeds') +
           blockOfType('functional_start_setBackgroundAndSpeeds')) +
       createCategory('Functional Logic',
           blockOfType('functional_greater_than') +
           blockOfType('functional_less_than') +
           blockOfType('functional_number_equals') +
           blockOfType('functional_string_equals') +
           blockOfType('functional_logical_and') +
           blockOfType('functional_logical_or') +
           blockOfType('functional_logical_not') +
           blockOfType('functional_boolean'))),
  'startBlocks':
   '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

levels.full_sandbox_infinity = utils.extend(levels.full_sandbox, {});

levels.ec_sandbox = utils.extend(levels.sandbox, {
  'editCode': true,
  'map': [
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0,16, 0, 0, 0,16, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'codeFunctions': {
    // Play Lab
    "setSprite": { 'category': 'Play Lab' },
    "setBackground": { 'category': 'Play Lab' },
    "move": { 'category': 'Play Lab' },
    "playSound": { 'category': 'Play Lab' },
    "changeScore": { 'category': 'Play Lab' },
    "setSpritePosition": { 'category': 'Play Lab' },
    "setSpriteSpeed": { 'category': 'Play Lab' },
    "setSpriteEmotion": { 'category': 'Play Lab' },
    "throwProjectile": { 'category': 'Play Lab' },
    "vanish": { 'category': 'Play Lab' },
    "onEvent": { 'category': 'Play Lab' },

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
    "lessThanOperator": null,
    "andOperator": null,
    "orOperator": null,
    "notOperator": null,
    "randomNumber_max": null,
    "randomNumber_min_max": null,
    "mathRound": null,
    "mathAbs": null,
    "mathMax": null,
    "mathMin": null,

    // Variables
    "declareAssign_x": null,
    "assign_x": null,
    "declareAssign_x_array_1_4": null,
    "declareAssign_x_prompt": null,

    // Functions
    "functionParams_none": null,
    "functionParams_n": null,
    "callMyFunction": null,
    "callMyFunction_n": null,
  },
  'startBlocks': "",
});

/* ******* Hour of Code 2015 ********/

levels.js_hoc2015_move_right = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song1' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x1020000, 0x1020000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000],
     [0x1020000, 0x1020000, 0x0000000, 0x0010000, 0x0020000, 0x0100000, 0x00, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0000010, 0x0000000, 0x0000001, 0x00, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000],
     [0x0000000, 0x0000000, 0x0000000, 0x0100000, 0x0010000, 0x0120000, 0x00, 0x0000000],
     [0x0000000, 0x1120000, 0x1120000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0100000],
     [0x0000000, 0x1120000, 0x1120000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x0000000]],

  instructions: msg.hoc2015_move_right_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutFailureTick': 100,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1'
  },
  "callouts": [
    {
      "id": "playlab:js_hoc2015_move_right:runButton",
      "element_id": "#runButton",
      "qtip_config": {
        "content": {
          "text": msg.calloutMoveRightRunButton(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
          'adjust': {
            'x': 0,
            'y': 0
          }
        }
      }
    }
  ],
  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};

levels.js_hoc2015_move_right_down = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song2' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x1100000, 0x1100000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x1100000, 0x1100000, 0x00, 0x0000010, 0x0000000, 0x0000001, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x1010000, 0x1010000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x1010000, 0x1010000, 0x0000001, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00]],
  instructions: msg.hoc2015_move_right_down_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2'
  },
  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


levels.js_hoc2015_move_diagonal = {
  'editCode': true,
  'textModeAtStart': true,
  'background': 'main',
  'music': [ 'song3' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveDown();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0010000, 0x0000010, 0x0000000, 0x00],
     [0x00, 0x1100000, 0x1100000, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x00],
     [0x00, 0x1100000, 0x1100000, 0x0000001, 0x0240000, 0x0250000, 0x0000000, 0x00],
     [0x00, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x1340000, 0x1340000, 0x1350000, 0x1350000, 0x20],
     [0x00, 0x0000000, 0x0000000, 0x1340000, 0x1340000, 0x1350000, 0x1350000, 0x00]],
  'embed': 'false',
  instructions: msg.hoc2015_move_diagonal_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1'
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ],
  "callouts": [
    {
      'id': 'playlab:js_hoc2015_move_diagonal:showCodeToggle',
      'element_id': '#show-code-header',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowCodeToggle(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top right',
          'at': 'bottom left',
          'adjust': {
            'x': 0,
            'y': 0
          }
        }
      }
    }
  ]
};


levels.js_hoc2015_move_backtrack = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song4' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0010000, 0x0000001, 0x0020000, 0x00, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0000010, 0x0000000, 0x0000001, 0x00, 0x00],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x1100000, 0x1100000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x1100000, 0x1100000, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00],
     [0x00, 0x0000000, 0x0000020, 0x0000000, 0x0000000, 0x0000000, 0x00, 0x00]],
  instructions: msg.hoc2015_move_backtrack_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal1'
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};

levels.js_hoc2015_move_around = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song5' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveRight();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0000010, 0x0000000, 0x0000001, 0x0010000, 0x00],
     [0x0000000, 0x0000000, 0x00, 0x0040000, 0x0020000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000000, 0x20, 0x0140000, 0x0000000, 0x0000001, 0x0000000, 0x00],
     [0x1120000, 0x1120000, 0x00, 0x0000000, 0x0000001, 0x0000000, 0x0000000, 0x00],
     [0x1120000, 0x1120000, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00],
     [0x0000000, 0x0000020, 0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x00]],
  'embed': 'false',
  instructions: msg.hoc2015_move_around_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2'
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


levels.js_hoc2015_move_finale = {
  'editCode': true,
  'background': 'main',
  'music': [ 'song6' ],
  'codeFunctions': {
    'moveRight': null,
    'moveLeft': null,
    'moveUp': null,
    'moveDown': null,
  },
  'startBlocks': [
    'moveDown();',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'gridAlignedMovement': true,
  'itemGridAlignedMovement': true,
  'slowJsExecutionFactor': 10,
  'removeItemsWhenActorCollides': false,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map':
    [[0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000],
     [0x00, 0x0000000, 0x0000010, 0x0020000, 0x0000001, 0x0100000, 0x0000020, 0x0000000],
     [0x00, 0x0000000, 0x0000000, 0x0000001, 0x0000000, 0x0000001, 0x0000000, 0x0000000],
     [0x00, 0x0000000, 0x0000001, 0x0120000, 0x0000000, 0x0000000, 0x0000000, 0x0000000],
     [0x00, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x1020000, 0x1020000],
     [0x00, 0x1010000, 0x1010000, 0x0000020, 0x0000000, 0x0000000, 0x1020000, 0x1020000],
     [0x00, 0x1010000, 0x1010000, 0x0000000, 0x0000000, 0x0000000, 0x0000000, 0x0000000]],
  'embed': 'false',
  instructions: msg.hoc2015_move_finale_instructions(),
  'ticksBeforeFaceSouth': 9,
  'timeoutAfterWhenRun': true,
  'goalOverride': {
    'goalImage': 'goal2'
  },
  'progressConditions' : [
    { required: { 'touchedHazardsAtOrAbove': 1 },
      result: { success: false, message: msg.failedAvoidHazard(), pauseInterpreter: true } },
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successHasAllGoals() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false },
      result: { success: false, message: msg.failedHasAllGoals() } }
  ]
};


/* ** level 7 ** */

levels.js_hoc2015_event_two_items = {
  'editCode': true,
  'background': 'hoth',
  'music': [ 'song7' ],
  'wallMap': 'blank',
  'softButtons': ['downButton', 'upButton'],
  'codeFunctions': {
    'goUp': null,
    'goDown': null,

    'whenUp': null,
    'whenDown': null
  },
  'startBlocks': [
    'function whenUp() {',
    '  ',
    '}',
    'function whenDown() {',
    '  ',
    '}'].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]],
  'pinWorkspaceToBottom': 'true',
  'embed': 'false',
  instructions: msg.hoc2015_event_two_items_instructions(),
  instructions2: msg.hoc2015_event_two_items_instructions2(),
  'timeoutFailureTick': 600, // 20 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal',
    'goalRenderOffsetX': 0
  },
  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true },
      result: { success: false, message: msg.failedTwoItemsTimeout() } }
  ],
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_event_two_items:placeCommandsHere',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowPlaceGoUpHere(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'bottom right',
          'adjust': {
            'x': 30,
            'y': -10
          }
        }
      }
    },
    {
      'id': 'playlab:js_hoc2015_event_two_items:arrowsCallout',
      'element_id': '#upButton',
      'hide_target_selector': '#soft-buttons',
      'qtip_config': {
        'content': {
          'text': msg.calloutUseArrowButtons(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
        }
      }
    }
  ]
};

levels.js_hoc2015_event_four_items = {
  'editCode': true,
  'background': 'hoth',
  'music': [ 'song8' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'goRight': null,
    'goLeft': null,
    'goUp': null,
    'goDown': null,

    'whenLeft': null,
    'whenRight': null,
    'whenUp': null,
    'whenDown': null
  },
  'startBlocks': [
    'function whenUp() {',
    '  ',
    '}',
    'function whenDown() {',
    '  ',
    '}'].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]],
  'embed': 'false',
  instructions: msg.hoc2015_event_four_items_instructions(),
  instructions2: msg.hoc2015_event_four_items_instructions2(),
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal'
  },

  'progressConditions' : [
    { required: { 'allGoalsVisited': true },
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true },
      result: { success: false, message: msg.failedFourItemsTimeout() } }
  ]
};


levels.js_hoc2015_score =
{
  'avatarList': ['R2-D2'],
  'editCode': true,
  'background': 'hoth',
  'music': [ 'song10' ],
  'wallMap': 'circle',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'autohandlerOverrides': {
    'whenGetRebelPilot': 'whenTouchGoal'
  },
  'codeFunctions': {
    'playSound': null,
    'addPoints': { params: ["100"] },

    'whenGetRebelPilot': null
  },
  'startBlocks': [
    'function whenGetRebelPilot() {',
    '  playSound("R2-D2sound1");',
    '}',
    ].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'edgeCollisions': 'true',
  'map': [
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [1, 0, 0, 16, 0, 0, 0, 1],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 1,  0, 0, 0, 0]],
  instructions: msg.hoc2015_score_instructions(),
  instructions2: msg.hoc2015_score_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 600, // 20 seconds
  'showTimeoutRect': true,
  'goalOverride': {
    'goalAnimation': 'animatedGoal'
  },
  'goal': {
    // The level uses completeOnSuccessConditionNotGoals, so make sure this
    // returns null  The progressConditions will take care of completion.
    successCondition: function () { return false; }
  },
  'progressConditions' : [
    { required: { 'timedOut': true, 'allGoalsVisited': false, 'currentPointsBelow': 300 },
      result: { success: false, message: msg.failedScoreTimeout() } },
    { required: { 'timedOut': true, 'allGoalsVisited': true, 'currentPointsBelow': 300 },
      result: { success: false, message: msg.failedScoreScore() } },
    { required: { 'timedOut': true, 'allGoalsVisited': false, 'currentPointsAtOrAbove': 300 },
      result: { success: false, message: msg.failedScoreGoals() } },
    { required: { 'allGoalsVisited': true, 'currentPointsAtOrAbove': 300 },
      result: { success: true, message: msg.successCharacter1() } }
  ],
  'completeOnSuccessConditionNotGoals': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_score:arrowsAutoSteerCallout',
      'element_id': '#upButton',
      'hide_target_selector': '#soft-buttons',
      'qtip_config': {
        'content': {
          'text': msg.calloutUseArrowButtonsAutoSteer(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
        }
      }
    },
    {
      'id': 'playlab:js_hoc2015_score:placeCommandsAtTop',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-main-scroller',
      'qtip_config': {
        'content': {
          'text': msg.calloutShowPlaySound(),
        },
        'position': {
          'my': 'top center',
          'at': 'bottom center',
          'adjust': {
            'x': 170,
            'y': 0
          }
        }
      }
    }
  ],
};



levels.js_hoc2015_win_lose = {
  'editCode': true,
  'background': 'endor',
  'music': [ 'song9' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'playSound': null,
    'addPoints': { params: ["100"] },
    'removePoints': { params: ["100"] },
    'whenGetRebelPilot': null,
    'whenGetStormtrooper': null,
    'whenGetMynock': null,
  },
  'startBlocks': [].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x040, 0x040, 0x000, 0x000, 0x000],
    [0x800, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x800],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x010, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000],
    [0x000, 0x100, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000]],
  'embed': 'false',
  instructions: msg.hoc2015_win_lose_instructions(),
  instructions2: msg.hoc2015_win_lose_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_win_lose:instructions',
      'element_id': '#prompt-table',
      'qtip_config': {
        'content': {
          'text': msg.calloutInstructions(),
        },
        'position': {
          'my': 'bottom left',
          'at': 'top right',
          'adjust': {
            'x': -40,
            'y': 0
          }
        }
      }
    }
  ],

  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 2, 'currentPointsBelow': 200 },
      result: { success: false, message: msg.failedWinLoseTimeout() } },
    { required: { 'timedOut': true, 'collectedItemsAtOrAbove': 2, 'currentPointsBelow': 200 },
      result: { success: false, message: msg.failedWinLoseScore() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 2, 'currentPointsAtOrAbove': 200 },
      result: { success: false, message: msg.failedWinLoseGoals() } },
    { required: { 'collectedItemsAtOrAbove': 2, 'currentPointsAtOrAbove': 200 },
      result: { success: true, message: msg.successCharacter1() } }
  ]
};


levels.js_hoc2015_add_characters = {
  'editCode': true,
  'background': 'endor',
  'music': [ 'song11' ],
  'wallMap': 'circle',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': { params: ['"PufferPig"'] },
    'addPoints': { params: ["1000"] },
    'removePoints': { params: ["1000"] },
    'playSound': null,

    'whenGetPufferPig': null,
  },
  'startBlocks': [
    'playSound("R2-D2sound1");',
    'addCharacter("PufferPig");',
    '',
    'function whenGetPufferPig() {',
    '  playSound("PufferPigSound1");',
    '  addPoints(1000);',
    '}',
    ].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true,
      'PufferPigSound1': true,
      'PufferPigSound2': true
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 16, 0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0],
    [0, 0, 0, 0,  0, 0, 0, 0]],
  'embed': 'false',
  instructions: msg.hoc2015_add_characters_instructions(),
  instructions2: msg.hoc2015_add_characters_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_add_characters:calloutPutCommandsHereRunStart',
      'element_id': '.droplet-gutter-line:nth-of-type(2)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content' : {
          'text': msg.calloutPutCommandsHereRunStart(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'center right',
        }
      }
    }
  ],
  'progressConditions' : [
    { required: { 'collectedItemsAtOrAbove': 3 },
      result: { success: true, message: msg.successCharacter1() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 3 },
      result: { success: false, message: msg.failedAddCharactersTimeout() } }
  ]
};


levels.js_hoc2015_chain_characters = {
  'editCode': true,
  'background': 'starship',
  'music': [ 'song12' ],
  'wallMap': 'grid',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': { params: ['"MouseDroid"'] },
    'playSound': null,
    'addPoints': null,
    'removePoints': null,

    'whenGetMouseDroid': null,
  },
  'startBlocks': [
    'addCharacter("MouseDroid");',
    'playSound("R2-D2sound3");',
    '',
    'function whenGetMouseDroid() {',
    '  playSound("MouseDroidSound2");',
    '  addPoints(100);',
    '',
    '}',
    ].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true,
      'MouseDroidSound1': true,
      'MouseDroidSound2': true,
      'MouseDroidSound3': true
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  instructions: msg.hoc2015_chain_characters_instructions(),
  instructions2: msg.hoc2015_chain_characters_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 1350, // 45 seconds
  'showTimeoutRect': true,
  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 20, 'currentPointsBelow': 2000 },
      result: { success: false, message: msg.failedChainCharactersTimeout() } },
    { required: { 'timedOut': true, 'collectedItemsAtOrAbove': 20, 'currentPointsBelow': 2000 },
      result: { success: false, message: msg.failedChainCharactersScore() } },
    { required: { 'timedOut': true, 'collectedItemsBelow': 20, 'currentPointsAtOrAbove': 2000 },
      result: { success: false, message: msg.failedChainCharactersItems() } },
    { required: { 'collectedItemsAtOrAbove': 20, 'currentPointsAtOrAbove': 2000 },
      result: { success: true, message: msg.successCharacter1() } }
  ],
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_chain_characters:calloutPlaceTwo',
      'element_id': '.droplet-gutter-line:nth-of-type(7)',
      'hide_target_selector': '.droplet-drag-cover',
      'qtip_config': {
        'content' : {
          'text': msg.calloutPlaceTwo(),
        },
        'hide': {
          'event': 'mouseup touchend',
        },
        'position': {
          'my': 'top left',
          'at': 'center right',
          'adjust': {
            'x': 40,
            'y': 10
          }
        }
      }
    }
  ]
};

levels.js_hoc2015_chain_characters_2 = {
  'editCode': true,
  'background': 'starship',
  'music': [ 'song13' ],
  'wallMap': 'horizontal',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'addCharacter': { params: ['"MouseDroid"'] },
    'addPoints': null,
    'removePoints': null,
    'playSound': null,

    'whenGetTauntaun': null,
    'whenGetMouseDroid': null,
    'whenGetMynock': null
  },
  'startBlocks': [
    'addCharacter("Tauntaun");',
    'addCharacter("Tauntaun");',
    'function whenGetTauntaun() {',
    '  playSound("TauntaunSound4");',
    '  addPoints(50);',
    '  addCharacter("Mynock");',
    '  addCharacter("Mynock");',
    '}',
    'function whenGetMouseDroid() {',
    '  playSound("MouseDroidSound2");',
    '  addPoints(100);',
    '}',
    ].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true,
      'TauntaunSound1': true,
      'TauntaunSound2': true,
      'TauntaunSound3': true,
      'TauntaunSound4': true,
      'MouseDroidSound1': true,
      'MouseDroidSound2': true,
      'MouseDroidSound3': true,
      'MynockSound1': true,
      'MynockSound2': true,
      'MynockSound3': true,
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  instructions: msg.hoc2015_chain_characters2_instructions(),
  instructions2: msg.hoc2015_chain_characters2_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 1350, // 45 seconds
  'showTimeoutRect': true,
  'progressConditions' : [
    { required: { 'timedOut': true, 'collectedItemsBelow': 14 },
      result: { success: false, message: msg.failedChainCharacters2Timeout() } },
    { required: { 'collectedItemsAtOrAbove': 14 },
      result: { success: true, message: msg.successCharacter1() } }
  ],
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_chain_characters_2:calloutPlaceTwoWhenMynock',
      'element_id': '#droplet_palette_block_whenGetMynock',
      'qtip_config': {
        'content' : {
          'text': msg.calloutPlaceTwoWhenMynock(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
        }
      }
    }
  ]
};

levels.js_hoc2015_change_setting = {
  'editCode': true,
  'background': 'starship',
  'music': [ 'song14' ],
  'wallMap': 'blobs',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'setDroid': null,
    'setBackground': null,
    'setDroidSpeed': null,
    'setMap': null,
    'playSound': null,
    'addCharacter': null,
    'addPoints': null,
    'removePoints': null,

    'whenGetRebelPilot': null,
  },
  'startBlocks': [
    'addCharacter("RebelPilot");',
    'addCharacter("RebelPilot");',
    'addCharacter("RebelPilot");',
    'playSound("R2-D2sound4");',
    'setDroid("R2-D2");',
    '',
    'function whenGetRebelPilot() {',
    '  addPoints(400);',
    '  setBackground("random");',
    '  ',
    '}',
    ''].join('\n'),
  paramRestrictions: {
    playSound: {
      'random': true,
      'C-3POsound1': true,
      'C-3POsound2': true,
      'C-3POsound3': true,
      'C-3POsound4': true,
      'R2-D2sound1': true,
      'R2-D2sound2': true,
      'R2-D2sound3': true,
      'R2-D2sound4': true,
      'PufferPigSound1': true,
      'PufferPigSound2': true,
      'PufferPigSound3': true,
      'TauntaunSound1': true,
      'TauntaunSound2': true,
      'TauntaunSound3': true,
      'MouseDroidSound1': true,
      'MouseDroidSound2': true,
      'MouseDroidSound3': true,
      'MynockSound1': true,
      'MynockSound2': true,
      'MynockSound3': true,
      'ProbotSound1': true,
      'ProbotSound2': true,
      'ProbotSound3': true,
    }
  },
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  instructions: msg.hoc2015_change_setting_instructions(),
  instructions2: msg.hoc2015_change_setting_instructions2(),
  'autoArrowSteer': true,
  'timeoutFailureTick': 900, // 30 seconds
  'showTimeoutRect': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_change_setting:setMap',
      'element_id': '#droplet_palette_block_setMap',
      'qtip_config': {
        'content' : {
          'text': msg.calloutSetMapAndSpeed(),
        },
        'position': {
          'my': 'center left',
          'at': 'center right',
        }
      }
    }
  ],
  'progressConditions' : [
    // Collected all the items and set the right properties?  Success.
    { required: { 'setMap': true, 'setDroidSpeed': true, 'collectedItemsAtOrAbove': 3 },
      result: { success: true, message: msg.successGenericCharacter() } },
    // Special message for timing out when not enough items collected.
    { required: { 'timedOut': true, 'collectedItemsBelow': 3 },
      result: { success: false, message: msg.failedChangeSettingTimeout() } },
    // If all items are collected, but either property not set?  Failure.
    { required: { 'setMap': false, 'collectedItemsAtOrAbove': 3 },
      result: { success: false, message: msg.failedChangeSettingSettings() } },
    { required: { 'setDroidSpeed': false, 'collectedItemsAtOrAbove': 3 },
      result: { success: false, message: msg.failedChangeSettingSettings() } }
  ]
};

var js_hoc2015_event_free_markdown = [
  '<span class="character-text">' + msg.hoc2015_event_free_instructions() + '</span>',
  '',
  '<span class="instructions2">' + msg.hoc2015_event_free_instructions2() + '</span>',
  '',
  '<details class="hoc2015">',
  '<summary>Example project ideas</summary>',
  '<p>**Example 1**',
  '<br />Add five random characters in the scene, and play a different sound each time R2-D2 collides with one of them.</p>',
  '',
  '<p>**Example 2**',
  '<br />Add ten Stormtroopers to chase C-3PO. See if you can outrun them by running at high speed.</p>',
  '',
  '<p>**Example 3**',
  '<br />Add five Puffer Pigs that are running away from R2-D2. Make him scream each time he catches one.</p>',
  '',
  '</details>',
  '<details class="hoc2015">',
  '<summary>Extra credit project ideas</summary>',
  '',
  '<p>**Example 1**',
  '<br />Add a Mouse Droid and a Stormtrooper. Every time R2-D2 catches a Mouse Droid, score some ' +
      'points and then add another Mouse Droid and another Stormtrooper.  End the game if a ' +
      'Stormtrooper catches R2-D2.</p>',
  '',
  '</details>',
  '<details class="hoc2015">',
  '<summary>For JavaScript programmers</summary>',
  '<p>You can create more complex JavaScript programs if you program in “text” mode. ' +
      'Feel free to use `for` loops, `if` statements, variables, or other JavaScript ' +
      'commands to make much more complex games. And _please_: document and share ' +
      'the code you wrote for others to learn too!</p>',
  '',
  '</details>'
].join('\r\n');

levels.js_hoc2015_event_free = {
  'editCode': true,
  'freePlay': true,
  'background': 'endor',
  'music': [ 'song15' ],
  'wallMap': 'blank',
  'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
  'codeFunctions': {
    'setDroid': { 'category': 'Commands' },
    'setBackground': { 'category': 'Commands' },
    'setDroidSpeed': { 'category': 'Commands' },
    'setMap': { 'category': 'Commands' },
    'playSound': { 'category': 'Commands' },
    'addCharacter': { 'category': 'Commands' },
    'moveSlow': { 'category': 'Commands' },
    'moveNormal': { 'category': 'Commands' },
    'moveFast': { 'category': 'Commands' },
    'addPoints': { 'category': 'Commands' },
    'removePoints': { 'category': 'Commands' },
    'endGame': { 'category': 'Commands' },

    'goRight': { 'category': 'Commands' },
    'goLeft': { 'category': 'Commands' },
    'goUp': { 'category': 'Commands' },
    'goDown': { 'category': 'Commands' },

    'whenLeft': { 'category': 'Events' },
    'whenRight': { 'category': 'Events' },
    'whenUp': { 'category': 'Events' },
    'whenDown': { 'category': 'Events' },

    'whenTouchObstacle': { 'category': 'Events' },
    'whenGetStormtrooper': { 'category': 'Events' },
    'whenGetRebelPilot': { 'category': 'Events' },
    'whenGetPufferPig': { 'category': 'Events' },
    'whenGetMynock': { 'category': 'Events' },
    'whenGetMouseDroid': { 'category': 'Events' },
    'whenGetTauntaun': { 'category': 'Events' },
    'whenGetProbot': { 'category': 'Events' },
    'whenGetCharacter': { 'category': 'Events' },

    'whenGetAllStormtroopers': { 'category': 'Events' },
    'whenGetAllRebelPilots': { 'category': 'Events' },
    'whenGetAllPufferPigs': { 'category': 'Events' },
    'whenGetAllMynocks': { 'category': 'Events' },
    'whenGetAllMouseDroids': { 'category': 'Events' },
    'whenGetAllTauntauns': { 'category': 'Events' },
    'whenGetAllProbots': { 'category': 'Events' },
    'whenGetAllCharacters': { 'category': 'Events' }
  },
  'startBlocks': [
    'setBackground("Endor");',
    'setMap("circle");',
    'setDroid("R2-D2");',
    'setDroidSpeed("normal");',
    'playSound("R2-D2sound5");',
    'function whenUp() {',
    '  goUp();',
    '}',
    'function whenDown() {',
    '  goDown();',
    '}',
    'function whenLeft() {',
    '  goLeft();',
    '}',
    'function whenRight() {',
    '  goRight();',
    '}',
    ''].join('\n'),
  'sortDrawOrder': true,
  'wallMapCollisions': true,
  'blockMovingIntoWalls': true,
  'itemGridAlignedMovement': true,
  'removeItemsWhenActorCollides': true,
  'tapSvgToRunAndReset': true,
  'delayCompletion': 2000,
  'floatingScore': true,
  'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0,16,0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
  'embed': 'false',
  'instructions': msg.hoc2015_event_free_instructions(),
  'instructions2': msg.hoc2015_event_free_instructions2(),
  'markdownInstructions': js_hoc2015_event_free_markdown,
  'markdownInstructionsWithClassicMargins': true,
  'callouts': [
    {
      'id': 'playlab:js_hoc2015_event_free:clickCategory',
      'element_id': '.droplet-palette-group-header.green',
      'qtip_config': {
        'content' : {
          'text': msg.calloutClickEvents(),
        },
        'position': {
          'my': 'top center',
          'at': 'bottom center',
        }
      }
    },
    {
      'id': 'playlab:js_hoc2015_event_free:finishButton',
      'element_id': '#finishButton',
      'on': 'finishButtonShown',
      'qtip_config': {
        'content' : {
          'text': msg.calloutFinishButton(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom right',
        }
      }
    }
  ],
  appStringsFunctions: {
    continueText: msg.hoc2015_lastLevel_continueText,
    reinfFeedbackMsg: msg.hoc2015_reinfFeedbackMsg,
    sharingText: msg.hoc2015_shareGame
  },
  disablePrinting: true,
  disableSaveToGallery: true
};

levels.hoc2015_blockly_1 = utils.extend(levels.js_hoc2015_move_right,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
  ],
});

levels.hoc2015_blockly_2 = utils.extend(levels.js_hoc2015_move_right_down,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
});

levels.hoc2015_blockly_3 = utils.extend(levels.js_hoc2015_move_diagonal,  {
  editCode: false,
  callouts: null,
  startBlocks: whenRunMoveSouth,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_4 = utils.extend(levels.js_hoc2015_move_backtrack,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
});

levels.hoc2015_blockly_5 = utils.extend(levels.js_hoc2015_move_around,  {
  editCode: false,
  startBlocks: whenRunMoveEast,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveEastRequiredBlock(),
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_6 = utils.extend(levels.js_hoc2015_move_finale,  {
  editCode: false,
  startBlocks: whenRunMoveSouth,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_7 = utils.extend(levels.js_hoc2015_event_two_items,  {
  editCode: false,
  startBlocks: whenUpDown,
  toolbox: tb(hocMoveNS),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
  ],
  'callouts': [
    {
      id: 'playlab:hoc2015_blockly_7:placeCommandsHere',
      element_id: '[block-id="3"]',
      hide_target_selector: '.blocklyDraggable',
      qtip_config: {
        content: {
          text: msg.calloutBlocklyPlaceGoUpHere(),
        },
        position: {
          my: 'top left',
          at: 'bottom left',
          adjust: {
            x: 22,
            y: 0
          }
        }
      }
    },
    {
      'id': 'playlab:hoc2015_blockly_7:arrowsCallout',
      'element_id': '#upButton',
      'hide_target_selector': '#soft-buttons',
      'qtip_config': {
        'content': {
          'text': msg.calloutUseArrowButtons(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
        }
      }
    }
  ]
});

levels.hoc2015_blockly_8 = utils.extend(levels.js_hoc2015_event_four_items,  {
  editCode: false,
  startBlocks: whenUpDownLeftRight,
  toolbox: tb(hocMoveNSEW),
  requiredBlocks: [
    moveNorthRequiredBlock(),
    moveSouthRequiredBlock(),
    moveEastRequiredBlock(),
    moveWestRequiredBlock(),
  ],
});

levels.hoc2015_blockly_9 = utils.extend(levels.js_hoc2015_score,  {
  editCode: false,
  msgStringOverrides: {
    whenTouchGoal: 'whenGetCharacterRebelPilot'
  },
  startBlocks:
    '<block type="studio_whenTouchGoal" deletable="false"> \
      <next><block type="studio_playSound"><title name="SOUND">R2-D2sound1</title></block> \
      </next></block>',
  toolbox:
    tb('<block type="studio_playSound"></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block>'),
  requiredBlocks: [
    // TODO: addPoints
  ],
  callouts: [
    {
      'id': 'playlab:hoc2015_blockly_9:arrowsAutoSteerCallout',
      'element_id': '#upButton',
      'hide_target_selector': '#soft-buttons',
      'qtip_config': {
        'content': {
          'text': msg.calloutUseArrowButtonsAutoSteer(),
        },
        'position': {
          'my': 'top left',
          'at': 'bottom center',
        }
      }
    },
    {
      id: 'playlab:hoc2015_blockly_9:placeCommandsAtTop',
      element_id: '[block-id="4"]',
      qtip_config: {
        content: {
          text: msg.calloutShowPlaySound(),
        },
        position: {
          my: 'top center',
          at: 'bottom center',
        }
      }
    }
  ],
});

levels.hoc2015_blockly_10 = utils.extend(levels.js_hoc2015_win_lose,  {
  editCode: false,
  startBlocks: '',
  toolbox:
    tb('<block type="studio_playSound"></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        <block type="studio_removePoints"><title name="VALUE">100</title></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">rebelpilot</title></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">stormtrooper</title></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">mynock</title></block>'),
  requiredBlocks: [
    // TODO: addPoints, removePoints, whenGetPilot, whenGetMan
  ],
});

levels.hoc2015_blockly_11 = utils.extend(levels.js_hoc2015_add_characters,  {
  editCode: false,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"> \
      <next> \
       <block type="studio_playSound"><title name="SOUND">R2-D2sound1</title> \
        <next> \
         <block type="studio_addCharacter"><title name="VALUE">"pufferpig"</title></block> \
        </next> \
       </block> \
      </next> \
     </block> \
     <block type="studio_whenGetCharacter" deletable="false" x="20" y="200"> \
      <title name="VALUE">pufferpig</title> \
      <next> \
       <block type="studio_playSound"><title name="SOUND">PufferPigSound1</title> \
        <next> \
         <block type="studio_addPoints"><title name="VALUE">1000</title></block> \
        </next> \
       </block> \
      </next> \
     </block>',
  toolbox:
    tb('<block type="studio_addCharacter"><title name="VALUE">"pufferpig"</title></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        <block type="studio_removePoints"><title name="VALUE">100</title></block> \
        <block type="studio_playSound"></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">pufferpig</title></block>'),
  callouts: [
    {
      id: 'playlab:hoc2015_blockly_11:calloutPutCommandsHereRunStart',
      element_id: '[block-id="8"]',
      hide_target_selector: '.blocklyDraggable',
      qtip_config: {
        content: {
          text: msg.calloutPutCommandsHereRunStart(),
        },
        position: {
          my: 'top left',
          at: 'bottom left',
          adjust: {
            x: 22,
            y: 0
          }
        }
      }
    }
  ],
  requiredBlocks: [
    // TODO: addCharacter
  ],
});

levels.hoc2015_blockly_12 = utils.extend(levels.js_hoc2015_chain_characters,  {
  editCode: false,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"> \
      <next> \
       <block type="studio_addCharacter"><title name="VALUE">"mousedroid"</title> \
        <next> \
         <block type="studio_playSound"><title name="SOUND">R2-D2sound3</title></block> \
        </next> \
       </block> \
      </next> \
     </block> \
     <block type="studio_whenGetCharacter" deletable="false" x="20" y="200"> \
      <title name="VALUE">mousedroid</title> \
      <next> \
       <block type="studio_playSound"><title name="SOUND">MouseDroidSound2</title> \
        <next> \
         <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        </next> \
       </block> \
      </next> \
     </block>',
  toolbox:
    tb('<block type="studio_addCharacter"><title name="VALUE">"mousedroid"</title></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        <block type="studio_removePoints"><title name="VALUE">100</title></block> \
        <block type="studio_playSound"></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">mousedroid</title></block>'),
  requiredBlocks: [
    // TODO: addCharacter, addPoints
  ],
  callouts: [
    {
      id: 'playlab:hoc2015_blockly_12:calloutPlaceTwo',
      element_id: '[block-id="11"]',
      hide_target_selector: '.blocklyDraggable',
      qtip_config: {
        content: {
          text: msg.calloutPlaceTwo(),
        },
        position: {
          my: 'top left',
          at: 'bottom left',
          adjust: {
            x: 22,
            y: 0
          }
        }
      }
    }
  ]
});

levels.hoc2015_blockly_13 = utils.extend(levels.js_hoc2015_chain_characters_2,  {
  editCode: false,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"> \
      <next> \
       <block type="studio_addCharacter"><title name="VALUE">"tauntaun"</title> \
        <next> \
         <block type="studio_addCharacter"><title name="VALUE">"tauntaun"</title></block> \
        </next> \
       </block> \
      </next> \
     </block> \
     <block type="studio_whenGetCharacter" deletable="false" x="20" y="130"> \
      <title name="VALUE">tauntaun</title> \
      <next> \
       <block type="studio_playSound"><title name="SOUND">TauntaunSound4</title> \
        <next> \
         <block type="studio_addPoints"><title name="VALUE">50</title> \
          <next> \
           <block type="studio_addCharacter"><title name="VALUE">"mynock"</title> \
            <next> \
             <block type="studio_addCharacter"><title name="VALUE">"mynock"</title></block> \
            </next> \
           </block> \
          </next> \
         </block> \
        </next> \
       </block> \
      </next> \
     </block> \
     <block type="studio_whenGetCharacter" deletable="false" x="20" y="300"> \
      <title name="VALUE">mousedroid</title> \
      <next> \
       <block type="studio_playSound"><title name="SOUND">MouseDroidSound2</title> \
        <next> \
         <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        </next> \
       </block> \
      </next> \
     </block>',
  toolbox:
    tb('<block type="studio_addCharacter"><title name="VALUE">"mousedroid"</title></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        <block type="studio_removePoints"><title name="VALUE">100</title></block> \
        <block type="studio_playSound"></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">tauntaun</title></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">mousedroid</title></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">mynock</title></block>'),
  requiredBlocks: [
    // TODO: addCharacter (check for mouse param?), addPoints
  ],
  callouts: [
    {
      id: 'playlab:hoc2015_blockly_13:calloutPlaceTwoWhenMynock',
      element_id: '[block-id="7"]',
      qtip_config: {
        content: {
          text: msg.calloutPlaceTwoWhenMynock(),
        },
        position: {
          my: 'top left',
          at: 'bottom center',
        }
      }
    }
  ]
});

levels.hoc2015_blockly_14 = utils.extend(levels.js_hoc2015_change_setting,  {
  editCode: false,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"> \
      <next> \
       <block type="studio_addCharacter"><title name="VALUE">"rebelpilot"</title> \
        <next> \
         <block type="studio_addCharacter"><title name="VALUE">"rebelpilot"</title> \
          <next> \
           <block type="studio_addCharacter"><title name="VALUE">"rebelpilot"</title> \
            <next> \
             <block type="studio_playSound"><title name="SOUND">R2-D2sound4</title> \
              <next> \
               <block type="studio_setSprite"><title name="VALUE">"r2-d2"</title></block> \
              </next> \
             </block> \
            </next> \
           </block> \
          </next> \
         </block> \
        </next> \
       </block> \
      </next> \
     </block> \
     <block type="studio_whenGetCharacter" deletable="false" x="20" y="300"> \
      <title name="VALUE">rebelpilot</title> \
      <next> \
       <block type="studio_addPoints"><title name="VALUE">400</title> \
        <next> \
         <block type="studio_setBackground"><title name="VALUE">random</title></block> \
        </next> \
       </block> \
      </next> \
     </block>',
  // TODO: create setDroid block to improve the readability of the block?
  // TODO: skin override of playSound dropdown (with paramsList filtering & random)
  toolbox:
    tb('<block type="studio_setSprite"></block> \
        <block type="studio_setBackground"></block> \
        <block type="studio_setDroidSpeed"></block> \
        <block type="studio_setMap"></block> \
        <block type="studio_addCharacter"><title name="VALUE">"mousedroid"</title></block> \
        <block type="studio_addPoints"><title name="VALUE">100</title></block> \
        <block type="studio_removePoints"><title name="VALUE">100</title></block> \
        <block type="studio_playSound"></block> \
        <block type="studio_whenGetCharacter"><title name="VALUE">rebelpilot</title></block>'),
  requiredBlocks: [
    // TODO: setMap, setDroidSpeed
  ],
  callouts: [
    {
      id: 'playlab:hoc2015_blockly_14:setMap',
      element_id: '[block-id="4"]',
      qtip_config: {
        content: {
          text: msg.calloutSetMapAndSpeed(),
        },
        position: {
          my: 'center left',
          at: 'center right',
        }
      }
    }
  ],
});

levels.hoc2015_blockly_15 = utils.extend(levels.js_hoc2015_event_free,  {
  editCode: false,
  markdownInstructions: null,
  markdownInstructionsWithClassicMargins: false,
  startBlocks:
    '<block type="when_run" deletable="false" x="20" y="20"> \
      <next> \
       <block type="studio_setBackground"><title name="VALUE">"endor"</title> \
        <next> \
         <block type="studio_setMap"><title name="VALUE">"circle"</title> \
          <next> \
           <block type="studio_setSprite"><title name="VALUE">"r2-d2"</title> \
            <next> \
             <block type="studio_setDroidSpeed"><title name="VALUE">normal</title> \
              <next> \
               <block type="studio_playSound"><title name="SOUND">R2-D2sound5</title></block> \
              </next> \
             </block> \
            </next> \
           </block> \
          </next> \
         </block> \
        </next> \
       </block> \
      </next> \
     </block>' +
      whenArrowBlocks(200, 80),
  toolbox: tb(
    createCategory(msg.catCommands(),
                    hocMoveNSEW +
                    blockOfType('studio_setSprite') +
                    blockOfType('studio_setBackground') +
                    blockOfType('studio_setDroidSpeed') +
                    blockOfType('studio_setMap') +
                    blockOfType('studio_playSound') +
                    blockOfType('studio_addCharacter') +
                    blockOfType('studio_setItemSpeed') +
                    blockOfType('studio_addPoints') +
                    blockOfType('studio_removePoints') +
                    blockOfType('studio_endGame')) +
    createCategory(msg.catEvents(),
                    blockOfType('when_run') +
                    blockOfType('studio_whenUp') +
                    blockOfType('studio_whenDown') +
                    blockOfType('studio_whenLeft') +
                    blockOfType('studio_whenRight') +
                    blockOfType('studio_whenGetCharacter') +
                    blockOfType('studio_whenGetAllCharacters') +
                    blockOfType('studio_whenGetAllCharacterClass') +
                    blockOfType('studio_whenTouchObstacle'))),

});


},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js"}],"/home/ubuntu/staging/apps/build/js/studio/extraControlRows.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n\n');3; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((6,  assetUrl('media/1x1.gif') )), '">', escape((6,  msg.finish() )), '\n    </button>\n  </div>\n');9; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/studio/dropletConfig.js":[function(require,module,exports){
var msg = require('./locale');
var api = require('./apiJavascript.js');
var paramLists = require('./paramLists.js');

module.exports.blocks = [
  {func: 'setDroid', parent: api, category: '', params: ['"R2-D2"'], dropdown: { 0: [ '"random"', '"R2-D2"', '"C-3PO"' ] } },
  {func: 'setDroidSpeed', parent: api, category: '', params: ['"fast"'], dropdown: { 0: [ '"random"', '"slow"', '"normal"', '"fast"' ] } },
  {func: 'setBackground', parent: api, category: '', params: ['"Hoth"'], dropdown: { 0: [ '"random"', '"Endor"', '"Hoth"', '"Starship"' ] } },
  {func: 'setMap', parent: api, category: '', params: ['"blank"'], dropdown: { 0: [ '"random"', '"blank"', '"circle"', '"horizontal"', '"grid"', '"blobs"'] } },
  {func: 'moveRight', parent: api, category: '', },
  {func: 'moveLeft', parent: api, category: '', },
  {func: 'moveUp', parent: api, category: '', },
  {func: 'moveDown', parent: api, category: '', },
  {func: 'goRight', parent: api, category: '', },
  {func: 'goLeft', parent: api, category: '', },
  {func: 'goUp', parent: api, category: '', },
  {func: 'goDown', parent: api, category: '', },
  {func: 'playSound', parent: api, category: '', params: ['"R2-D2sound1"'], dropdown: { 0: paramLists.playSoundDropdown } },

  {func: 'endGame', parent: api, category: '', params: ['"win"'], dropdown: { 0: ['"win"', '"lose"' ] } },
  {func: 'addPoints', parent: api, category: '', params: ["100"] },
  {func: 'removePoints', parent: api, category: '', params: ["100"] },
  {func: 'changeScore', parent: api, category: '', params: ["1"] },
  {func: 'addCharacter', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'setToChase', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'setToFlee', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'setToRoam', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'setToStop', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'moveFast', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'moveNormal', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },
  {func: 'moveSlow', parent: api, category: '', params: ['"PufferPig"'], dropdown: { 0: [ '"random"', '"Stormtrooper"', '"RebelPilot"', '"PufferPig"', '"Mynock"', '"MouseDroid"', '"Tauntaun"', '"Probot"' ] } },

  {func: 'whenTouchGoal', block: 'function whenTouchGoal() {}', expansion: 'function whenTouchGoal() {\n  __;\n}', category: '' },
  {func: 'whenTouchAllGoals', block: 'function whenTouchAllGoals() {}', expansion: 'function whenTouchAllGoals() {\n  __;\n}', category: '' },
  {func: 'whenScore1000', block: 'function whenScore1000() {}', expansion: 'function whenScore1000() {\n  __;\n}', category: '' },

  {func: 'whenLeft', block: 'function whenLeft() {}', expansion: 'function whenLeft() {\n  __;\n}', category: '' },
  {func: 'whenRight', block: 'function whenRight() {}', expansion: 'function whenRight() {\n  __;\n}', category: '' },
  {func: 'whenUp', block: 'function whenUp() {}', expansion: 'function whenUp() {\n  __;\n}', category: '' },
  {func: 'whenDown', block: 'function whenDown() {}', expansion: 'function whenDown() {\n  __;\n}', category: '' },
  {func: 'whenTouchObstacle', block: 'function whenTouchObstacle() {}', expansion: 'function whenTouchObstacle() {\n  __;\n}', category: '' },

  {func: 'whenGetCharacter', block: 'function whenGetCharacter() {}', expansion: 'function whenGetCharacter() {\n  __;\n}', category: '' },
  {func: 'whenTouchCharacter', block: 'function whenTouchCharacter() {}', expansion: 'function whenTouchCharacter() {\n  __;\n}', category: '' },

  {func: 'whenGetStormtrooper', block: 'function whenGetStormtrooper() {}', expansion: 'function whenGetStormtrooper() {\n  __;\n}', category: '' },
  {func: 'whenGetRebelPilot', block: 'function whenGetRebelPilot() {}', expansion: 'function whenGetRebelPilot() {\n  __;\n}', category: '' },
  {func: 'whenGetPufferPig', block: 'function whenGetPufferPig() {}', expansion: 'function whenGetPufferPig() {\n  __;\n}', category: '' },
  {func: 'whenGetMynock', block: 'function whenGetMynock() {}', expansion: 'function whenGetMynock() {\n  __;\n}', category: '' },
  {func: 'whenGetMouseDroid', block: 'function whenGetMouseDroid() {}', expansion: 'function whenGetMouseDroid() {\n  __;\n}', category: '' },
  {func: 'whenGetTauntaun', block: 'function whenGetTauntaun() {}', expansion: 'function whenGetTauntaun() {\n  __;\n}', category: '' },
  {func: 'whenGetProbot', block: 'function whenGetProbot() {}', expansion: 'function whenGetProbot() {\n  __;\n}', category: '' },

  {func: 'whenTouchStormtrooper', block: 'function whenTouchStormtrooper() {}', expansion: 'function whenTouchStormtrooper() {\n  __;\n}', category: '' },
  {func: 'whenTouchRebelPilot', block: 'function whenTouchRebelPilot() {}', expansion: 'function whenTouchRebelPilot() {\n  __;\n}', category: '' },
  {func: 'whenTouchPufferPig', block: 'function whenTouchPufferPig() {}', expansion: 'function whenTouchPufferPig() {\n  __;\n}', category: '' },
  {func: 'whenTouchMynock', block: 'function whenTouchMynock() {}', expansion: 'function whenTouchMynock() {\n  __;\n}', category: '' },
  {func: 'whenTouchMouseDroid', block: 'function whenTouchMouseDroid() {}', expansion: 'function whenTouchMouseDroid() {\n  __;\n}', category: '' },
  {func: 'whenTouchTauntaun', block: 'function whenTouchTauntaun() {}', expansion: 'function whenTouchTauntaun() {\n  __;\n}', category: '' },
  {func: 'whenTouchProbot', block: 'function whenTouchProbot() {}', expansion: 'function whenTouchProbot() {\n  __;\n}', category: '' },

  {func: 'whenGetAllCharacters', block: 'function whenGetAllCharacters() {}', expansion: 'function whenGetAllCharacters() {\n  __;\n}', category: '' },

  {func: 'whenGetAllStormtroopers', block: 'function whenGetAllStormtroopers() {}', expansion: 'function whenGetAllStormtroopers() {\n  __;\n}', category: '' },
  {func: 'whenGetAllRebelPilots', block: 'function whenGetAllRebelPilots() {}', expansion: 'function whenGetAllRebelPilots() {\n  __;\n}', category: '' },
  {func: 'whenGetAllPufferPigs', block: 'function whenGetAllPufferPigs() {}', expansion: 'function whenGetAllPufferPigs() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMynocks', block: 'function whenGetAllMynocks() {}', expansion: 'function whenGetAllMynocks() {\n  __;\n}', category: '' },
  {func: 'whenGetAllMouseDroids', block: 'function whenGetAllMouseDroids() {}', expansion: 'function whenGetAllMouseDroids() {\n  __;\n}', category: '' },
  {func: 'whenGetAllTauntauns', block: 'function whenGetAllTauntauns() {}', expansion: 'function whenGetAllTauntauns() {\n  __;\n}', category: '' },
  {func: 'whenGetAllProbots', block: 'function whenGetAllProbots() {}', expansion: 'function whenGetAllProbots() {\n  __;\n}', category: '' },

  // Functions hidden from autocomplete - not used in hoc2015:
  {func: 'setSprite', parent: api, category: '', params: ['0', '"R2-D2"'], dropdown: { 1: [ '"random"', '"R2-D2"', '"C-3PO"' ] } },
  {func: 'setSpritePosition', parent: api, category: '', params: ["0", "7"], noAutocomplete: true },
  {func: 'setSpriteSpeed', parent: api, category: '', params: ["0", "8"], noAutocomplete: true },
  {func: 'setSpriteEmotion', parent: api, category: '', params: ["0", "1"], noAutocomplete: true },
  {func: 'throwProjectile', parent: api, category: '', params: ["0", "1", '"blue_fireball"'], noAutocomplete: true },
  {func: 'vanish', parent: api, category: '', params: ["0"], noAutocomplete: true },
  {func: 'move', parent: api, category: '', params: ["0", "1"], noAutocomplete: true },
  {func: 'showDebugInfo', parent: api, category: '', params: ["false"], noAutocomplete: true },
  {func: 'onEvent', parent: api, category: '', params: ["'when-left'", "function() {\n  \n}"], noAutocomplete: true },
];

module.exports.categories = {
  '': {
    color: 'red',
    blocks: []
  },
  'Play Lab': {
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
  },
};

module.exports.autocompleteFunctionsWithParens = true;

module.exports.showParamDropdowns = true;


},{"./apiJavascript.js":"/home/ubuntu/staging/apps/build/js/studio/apiJavascript.js","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js","./paramLists.js":"/home/ubuntu/staging/apps/build/js/studio/paramLists.js"}],"/home/ubuntu/staging/apps/build/js/studio/controls.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" disabled=true class="arrow">\n    <img src="', escape((5,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" disabled=true class="arrow">\n    <img src="', escape((8,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" disabled=true class="arrow">\n    <img src="', escape((11,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" disabled=true class="arrow">\n    <img src="', escape((14,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n\n');18; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((21,  assetUrl('media/1x1.gif') )), '">', escape((21,  msg.finish() )), '\n    </button>\n  </div>\n');24; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/studio/blocks.js":[function(require,module,exports){
/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */
'use strict';
/* global Studio */

var studioApp = require('../StudioApp').singleton;
var msg = require('./locale');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
var commonMsg = require('../locale');
var codegen = require('../codegen');
var constants = require('./constants');
var utils = require('../utils');
var _ = utils.getLodash();
var paramLists = require('./paramLists');

var Direction = constants.Direction;
var Position = constants.Position;
var Emotions = constants.Emotions;

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;

var generateSetterCode = function (opts) {
  var value = opts.value || opts.ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(opts.ctx.VALUES)
        .map(function (item) { return item[1]; })
        .without(RANDOM_VALUE, HIDDEN_VALUE, CLICK_VALUE);
    value = 'Studio.random([' + possibleValues + '])';
  }

  if (opts.returnValue) {
    return value;
  }

  return 'Studio.' + opts.name + '(\'block_id_' + opts.ctx.id + '\', ' +
    (opts.extraParams ? opts.extraParams + ', ' : '') + value + ');\n';
};

// These are set to the default values, but may be overridden
var spriteCount = 6;
var projectileCollisions = false;
var edgeCollisions = false;
var allowSpritesOutsidePlayspace = false;
var startAvatars = [];

var customGameLogic = null;

exports.setSpriteCount = function(blockly, count) {
  spriteCount = count;
};

exports.enableProjectileCollisions = function(blockly) {
  projectileCollisions = true;
};

exports.enableEdgeCollisions = function(blockly) {
  edgeCollisions = true;
};

exports.enableSpritesOutsidePlayspace = function(blockly) {
  allowSpritesOutsidePlayspace = true;
};

exports.setStartAvatars = function (avatarList) {
  startAvatars = avatarList.slice(0);
};

exports.registerCustomGameLogic = function (customGameLogicToRegister) {
  customGameLogic = customGameLogicToRegister;
};

/**
 * @param {function} stringGenerator A function that takes a spriteIndex and
 *   creates a string from it.
 * @returns {Array} An array of string, index pairs
 */
function spriteNumberTextArray(stringGenerator) {
  var spriteNumbers = _.range(0, spriteCount);
  return _.map(spriteNumbers, function (index) {
    return [stringGenerator({spriteIndex: index + 1}), index.toString()];
  });
}

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;
  startAvatars = skin.avatarList.slice(0); // copy avatar list

  generator.studio_eventHandlerPrologue = function() {
    return '\n';
  };

  /**
   * Creates a dropdown with options for each sprite number
   * @param {function} stringGenerator A function that takes a spriteIndex and
   *   creates a string from it.
   * @returns {Blockly.FieldDropdown}
   */
  function spriteNumberTextDropdown(stringGenerator) {
    return new blockly.FieldDropdown(spriteNumberTextArray(stringGenerator));
  }

  /**
   * Creates a dropdown with thumbnails for each starting sprite
   * @returns {Blockly.FieldImageDropdown}
   */
  function startingSpriteImageDropdown() {
    var spriteNumbers = _.range(0, spriteCount);
    var choices = _.map(spriteNumbers, function (index) {
      var skinId = startAvatars[index];
      return [skin[skinId].dropdownThumbnail, index.toString()];
    });
    return new blockly.FieldImageDropdown(choices, skin.dropdownThumbnailWidth,
      skin.dropdownThumbnailHeight);
  }

  /**
   * Get the value of the 'SPRITE' input, converting 1->0 indexed.
   * @param block
   * @returns {string}
   */
  function getSpriteIndex(block) {
    var index = Blockly.JavaScript.valueToCode(block, 'SPRITE',
        Blockly.JavaScript.ORDER_NONE) || '1';
    return index + '-1';
  }

  // started separating block generation for each block into it's own function
  installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions);

  generator.studio_eventHandlerPrologue = function() {
    return '\n';
  };

  blockly.Blocks.studio_whenLeft = {
    // Block to handle event when the Left arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenLeft));
      } else {
        this.appendDummyInput().appendTitle(msg.whenLeft());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenLeftTooltip());
    }
  };

  generator.studio_whenLeft = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenRight = {
    // Block to handle event when the Right arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenRight));
      } else {
        this.appendDummyInput().appendTitle(msg.whenRight());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenRightTooltip());
    }
  };

  generator.studio_whenRight = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenUp = {
    // Block to handle event when the Up arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenUp));
      } else {
        this.appendDummyInput().appendTitle(msg.whenUp());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenUpTooltip());
    }
  };

  generator.studio_whenUp = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenDown = {
    // Block to handle event when the Down arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenDown));
      } else {
        this.appendDummyInput().appendTitle(msg.whenDown());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenDownTooltip());
    }
  };

  generator.studio_whenDown = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenArrow = {
    // Block to handle event when an arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(commonMsg.when());
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_VALUES), 'VALUE');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      }
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenArrowTooltip());
    }
  };

  blockly.Blocks.studio_whenArrow.K1_VALUES =
    [[skin.whenUp, 'up'],
     [skin.whenRight, 'right'],
     [skin.whenDown, 'down'],
     [skin.whenLeft, 'left']];

  blockly.Blocks.studio_whenArrow.VALUES =
      [[msg.whenArrowUp(),    'up'],
       [msg.whenArrowDown(),  'down'],
       [msg.whenArrowLeft(),  'left'],
       [msg.whenArrowRight(), 'right']];

  generator.studio_whenArrow = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_repeatForever = {
    // Block to handle the repeating tick event while the game is running.
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.repeat());
        this.appendStatementInput('DO')
          .appendTitle(new blockly.FieldImage(skin.repeatImage));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.repeatForever());
        this.appendStatementInput('DO')
          .appendTitle(msg.repeatDo());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setTooltip(msg.repeatForeverTooltip());
    }
  };

  generator.studio_repeatForever = function () {
    var branch = Blockly.JavaScript.statementToCode(this, 'DO');
    return generator.studio_eventHandlerPrologue() + branch;
  };

  blockly.Blocks.studio_whenSpriteClicked = {
    // Block to handle event when sprite is clicked.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.whenSpriteClickedN),
                       'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.whenSpriteClicked());
      }
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenSpriteClickedTooltip());
    }
  };

  generator.studio_whenSpriteClicked = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenTouchCharacter = {
    // Block to handle event when sprite touches an item.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchCharacter());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchCharacterTooltip());
    }
  };

  generator.studio_whenTouchCharacter = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenTouchObstacle = {
    // Block to handle event when sprite touches a wall.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchObstacle());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchObstacleTooltip());
    }
  };

  generator.studio_whenTouchObstacle = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenTouchGoal = {
    // Block to handle event when sprite touches a goal.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchGoal());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchGoalTooltip());
    }
  };

  generator.studio_whenTouchGoal = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetCharacter = {
    // Block to handle event when the primary sprite gets a character.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetCharacterTooltip());
    }
  };

  blockly.Blocks.studio_whenGetCharacter.VALUES =
      [[msg.whenGetCharacterAnyItem(),      'any_item'],
       [msg.whenGetCharacterPufferPig(),    'pufferpig'],
       [msg.whenGetCharacterStormtrooper(), 'stormtrooper'],
       [msg.whenGetCharacterTauntaun(),     'tauntaun'],
       [msg.whenGetCharacterMynock(),       'mynock'],
       [msg.whenGetCharacterProbot(),       'probot'],
       [msg.whenGetCharacterMouseDroid(),   'mousedroid'],
       [msg.whenGetCharacterRebelPilot(),   'rebelpilot']];

  generator.studio_whenGetCharacter = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetAllCharacters = {
    // Block to handle event when the primary sprite gets all characters.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenGetAllCharacters());
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetAllCharactersTooltip());
    }
  };

  generator.studio_whenGetAllCharacters = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetAllCharacterClass = {
    // Block to handle event when the primary sprite gets all characters of a class.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetAllCharacterClassTooltip());
    }
  };

  blockly.Blocks.studio_whenGetAllCharacterClass.VALUES =
      [[msg.whenGetAllCharacterPufferPig(),    'pufferpig'],
       [msg.whenGetAllCharacterStormtrooper(), 'stormtrooper'],
       [msg.whenGetAllCharacterTauntaun(),     'tauntaun'],
       [msg.whenGetAllCharacterMynock(),       'mynock'],
       [msg.whenGetAllCharacterProbot(),       'probot'],
       [msg.whenGetAllCharacterMouseDroid(),   'mousedroid'],
       [msg.whenGetAllCharacterRebelPilot(),   'rebelpilot']];

  generator.studio_whenGetAllCharacterClass = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenSpriteCollided = {
    // Block to handle event when sprite collides with another sprite.
    helpUrl: '',
    init: function() {
      var dropdown1;
      var dropdown2;
      this.setHSV(140, 1.00, 0.74);

      if (isK1) {
        // NOTE: K1 block does not yet support projectile or edge collisions
        dropdown1 = startingSpriteImageDropdown();
        dropdown2 = startingSpriteImageDropdown();
        this.appendDummyInput().appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.collide))
          .appendTitle(dropdown1, 'SPRITE1');
        this.appendDummyInput()
          .appendTitle(commonMsg.and())
          .appendTitle(dropdown2, 'SPRITE2');
      } else {
        dropdown1 = spriteNumberTextDropdown(msg.whenSpriteCollidedN);
        var dropdownArray2 = [this.GROUPINGS[0]];
        dropdownArray2 = dropdownArray2.concat(
          spriteNumberTextArray(msg.whenSpriteCollidedWithN));
        dropdownArray2.unshift(this.GROUPINGS[1]);
        if (projectileCollisions) {
          dropdownArray2 = dropdownArray2.concat([this.GROUPINGS[2]]);
          dropdownArray2 = dropdownArray2.concat(this.PROJECTILES);
        }
        if (edgeCollisions) {
          dropdownArray2 = dropdownArray2.concat([this.GROUPINGS[3]]);
          dropdownArray2 = dropdownArray2.concat(this.EDGES);
        }
        dropdown2 = new blockly.FieldDropdown(dropdownArray2);
        this.appendDummyInput().appendTitle(dropdown1, 'SPRITE1');
        this.appendDummyInput().appendTitle(dropdown2, 'SPRITE2');
      }
      if (spriteCount > 1) {
        // default second dropdown to actor 2
        dropdown2.setValue('1');
      }

      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenSpriteCollidedTooltip());
    }
  };

  // todo (brent) - per skin
  blockly.Blocks.studio_whenSpriteCollided.GROUPINGS =
      [[msg.whenSpriteCollidedWithAnything(), 'anything'],
       [msg.whenSpriteCollidedWithAnyActor(), 'any_actor'],
       [msg.whenSpriteCollidedWithAnyProjectile(), 'any_projectile'],
       [msg.whenSpriteCollidedWithAnyEdge(), 'any_edge']];

  blockly.Blocks.studio_whenSpriteCollided.PROJECTILES =
      [[msg.whenSpriteCollidedWithBlueFireball(), 'blue_fireball'],
       [msg.whenSpriteCollidedWithPurpleFireball(), 'purple_fireball'],
       [msg.whenSpriteCollidedWithRedFireball(), 'red_fireball'],
       [msg.whenSpriteCollidedWithYellowHearts(), 'yellow_hearts'],
       [msg.whenSpriteCollidedWithPurpleHearts(), 'purple_hearts'],
       [msg.whenSpriteCollidedWithRedHearts(), 'red_hearts']];

  blockly.Blocks.studio_whenSpriteCollided.EDGES =
      [[msg.whenSpriteCollidedWithTopEdge(), 'top'],
       [msg.whenSpriteCollidedWithLeftEdge(), 'left'],
       [msg.whenSpriteCollidedWithBottomEdge(), 'bottom'],
       [msg.whenSpriteCollidedWithRightEdge(), 'right']];

  generator.studio_whenSpriteCollided = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_stop = {
    // Block for stopping the movement of a sprite.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.stopSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.stopSprite());
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.stopTooltip());
    }
  };

  blockly.Blocks.studio_stopSprite = {
    // Block for stopping the movement of a sprite.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE')
          .setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.stopSpriteN({spriteIndex: ''}));
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.stopTooltip());
    }
  };

  generator.studio_stop = function() {
    // Generate JavaScript for stopping the movement of a sprite.
    return 'Studio.stop(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ');\n';
  };

  generator.studio_stopSprite = function() {
    // Generate JavaScript for stopping the movement of a sprite.
    var spriteParam = getSpriteIndex(this);
    return 'Studio.stop(\'block_id_' + this.id + '\', ' +
        spriteParam + ');\n';
  };

  blockly.Blocks.studio_addCharacter = {
    // Block for adding a character to the scene.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.addCharacter());
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.addCharacterTooltip());
    }
  };

  generator.studio_addCharacter = function() {
    // Generate JavaScript for adding a character to the scene.
    var allValues = skin.itemChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }

    return 'Studio.addCharacter(\'block_id_' + this.id + '\', ' + valParam + ');\n';
  };

  blockly.Blocks.studio_setItemActivity = {
    // Block for setting the activity type on a class of items.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.activityChoices), 'TYPE');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setActivityTooltip());
    }
  };

  generator.studio_setItemActivity = function() {
    // Generate JavaScript for adding items to a scene.
    var allValues = skin.itemChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }
    var allTypes = skin.activityChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var typeParam = this.getTitleValue('TYPE');
    if (typeParam === 'random') {
      typeParam = 'Studio.random([' + allTypes + '])';
    }

    return 'Studio.setItemActivity(\'block_id_' + this.id +
        '\', ' +
        valParam + ', ' +
        typeParam + ');\n';
  };

  blockly.Blocks.studio_setItemSpeed = {
    // Block for setting item speed
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);

      this.appendDummyInput().appendTitle(msg.setItemSpeedSet());
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'CLASS');

      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to slow
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setItemSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setItemSpeed.VALUES =
      [[msg.setSpriteSpeedRandom(), RANDOM_VALUE],
       [msg.setSpriteSpeedSlow(), 'Studio.SpriteSpeed.VERY_SLOW'],
       [msg.setSpriteSpeedNormal(), 'Studio.SpriteSpeed.SLOW'],
       [msg.setSpriteSpeedFast(), 'Studio.SpriteSpeed.FAST']];

  generator.studio_setItemSpeed = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: this.getTitleValue('CLASS'),
      name: 'setItemSpeed'});
  };

  blockly.Blocks.studio_throw = {
    // Block for throwing a projectile from a sprite.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.throwSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.throwSprite());
      }
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.projectileChoices), 'VALUE');
      this.appendDummyInput()
        .appendTitle('\t');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.throwTooltip());
    }
  };

  blockly.Blocks.studio_throw.DIR =
        [[msg.moveDirectionUp(), Direction.NORTH.toString()],
         [msg.moveDirectionDown(), Direction.SOUTH.toString()],
         [msg.moveDirectionLeft(), Direction.WEST.toString()],
         [msg.moveDirectionRight(), Direction.EAST.toString()],
         [msg.moveDirectionRandom(), 'random']];

  generator.studio_throw = function() {
    // Generate JavaScript for throwing a projectile from a sprite.
    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var allValues = skin.projectileChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }

    return 'Studio.throwProjectile(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        valParam + ');\n';
  };

  // Note: this block is for causing an action to happen to a projectile, not
  // to create a projectile
  blockly.Blocks.studio_makeProjectile = {
    // Block for making a projectile bounce or disappear.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.appendDummyInput()
        .appendTitle('\t');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.ACTIONS), 'ACTION');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.makeProjectileTooltip());
    }
  };

  blockly.Blocks.studio_makeProjectile.VALUES =
      [[msg.makeProjectileBlueFireball(), '"blue_fireball"'],
       [msg.makeProjectilePurpleFireball(), '"purple_fireball"'],
       [msg.makeProjectileRedFireball(), '"red_fireball"'],
       [msg.makeProjectileYellowHearts(), '"yellow_hearts"'],
       [msg.makeProjectilePurpleHearts(), '"purple_hearts"'],
       [msg.makeProjectileRedHearts(), '"red_hearts"']];

  blockly.Blocks.studio_makeProjectile.ACTIONS =
        [[msg.makeProjectileBounce(), '"bounce"'],
         [msg.makeProjectileDisappear(), '"disappear"']];

  generator.studio_makeProjectile = function() {
    // Generate JavaScript for making a projectile bounce or disappear.
    return 'Studio.makeProjectile(\'block_id_' + this.id + '\', ' +
        this.getTitleValue('VALUE') + ', ' +
        this.getTitleValue('ACTION') + ');\n';
  };

  blockly.Blocks.studio_setSpritePosition = {
    // Block for jumping a sprite to different position.
    helpUrl: '',
    init: function() {
      var dropdown;
      if (allowSpritesOutsidePlayspace) {
        dropdown = new blockly.FieldDropdown(this.VALUES_EXTENDED);
        dropdown.setValue(this.VALUES_EXTENDED[4][1]); // default to top-left
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[1][1]); // default to top-left
      }
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }
      this.appendDummyInput()
        .appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpritePositionTooltip());
    }
  };

  // 9 possible positions in playspace (+ random):
  blockly.Blocks.studio_setSpritePosition.VALUES =
      [[msg.positionRandom(), RANDOM_VALUE],
       [msg.positionTopLeft(), Position.TOPLEFT.toString()],
       [msg.positionTopCenter(), Position.TOPCENTER.toString()],
       [msg.positionTopRight(), Position.TOPRIGHT.toString()],
       [msg.positionMiddleLeft(), Position.MIDDLELEFT.toString()],
       [msg.positionMiddleCenter(), Position.MIDDLECENTER.toString()],
       [msg.positionMiddleRight(), Position.MIDDLERIGHT.toString()],
       [msg.positionBottomLeft(), Position.BOTTOMLEFT.toString()],
       [msg.positionBottomCenter(), Position.BOTTOMCENTER.toString()],
       [msg.positionBottomRight(), Position.BOTTOMRIGHT.toString()]];

  // Still a slightly reduced set of 17 out of 25 possible positions (+ random):
  blockly.Blocks.studio_setSpritePosition.VALUES_EXTENDED =
      [[msg.positionRandom(), RANDOM_VALUE],
       [msg.positionOutTopLeft(), Position.OUTTOPLEFT.toString()],
       [msg.positionOutTopRight(), Position.OUTTOPRIGHT.toString()],
       [msg.positionTopOutLeft(), Position.TOPOUTLEFT.toString()],
       [msg.positionTopLeft(), Position.TOPLEFT.toString()],
       [msg.positionTopCenter(), Position.TOPCENTER.toString()],
       [msg.positionTopRight(), Position.TOPRIGHT.toString()],
       [msg.positionTopOutRight(), Position.TOPOUTRIGHT.toString()],
       [msg.positionMiddleLeft(), Position.MIDDLELEFT.toString()],
       [msg.positionMiddleCenter(), Position.MIDDLECENTER.toString()],
       [msg.positionMiddleRight(), Position.MIDDLERIGHT.toString()],
       [msg.positionBottomOutLeft(), Position.BOTTOMOUTLEFT.toString()],
       [msg.positionBottomLeft(), Position.BOTTOMLEFT.toString()],
       [msg.positionBottomCenter(), Position.BOTTOMCENTER.toString()],
       [msg.positionBottomRight(), Position.BOTTOMRIGHT.toString()],
       [msg.positionBottomOutRight(), Position.BOTTOMOUTRIGHT.toString()],
       [msg.positionOutBottomLeft(), Position.OUTBOTTOMLEFT.toString()],
       [msg.positionOutBottomRight(), Position.OUTBOTTOMRIGHT.toString()]];

  generator.studio_setSpritePosition = function() {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpritePosition'});
  };

  blockly.Blocks.studio_setSpriteXY = {
    // Block for jumping a sprite to specific XY location.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendValueInput('SPRITE')
          .setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.moveSpriteN({spriteIndex: ''}));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }
      this.appendDummyInput()
        .appendTitle(msg.toXY());
      this.appendValueInput('XPOS')
        .setCheck(blockly.BlockValueType.NUMBER);
      this.appendValueInput('YPOS')
        .setCheck(blockly.BlockValueType.NUMBER);
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
    }
  };

  generator.studio_setSpriteXY = function() {
    var spriteParam = getSpriteIndex(this);
    var xParam = Blockly.JavaScript.valueToCode(this, 'XPOS',
        Blockly.JavaScript.ORDER_NONE) || '0';
    var yParam = Blockly.JavaScript.valueToCode(this, 'YPOS',
        Blockly.JavaScript.ORDER_NONE) || '0';
    return 'Studio.setSpriteXY(\'block_id_' + this.id +
      '\', ' +
      spriteParam + ', ' +
      xParam + ', ' +
      yParam + ');\n';
  };


  var SimpleMove = {
    DIRECTION_CONFIGS: {
      West: {
        letter: commonMsg.directionWestLetter(),
        image: skin.leftArrow,
        studioValue: Direction.WEST.toString(),
        tooltip: msg.moveLeftTooltip()
      },
      East: {
        letter: commonMsg.directionEastLetter(),
        image: skin.rightArrow,
        studioValue: Direction.EAST.toString(),
        tooltip: msg.moveRightTooltip()
      },
      North: {
        letter: commonMsg.directionNorthLetter(),
        image: skin.upArrow,
        studioValue: Direction.NORTH.toString(),
        tooltip: msg.moveUpTooltip()
      },
      South: { letter: commonMsg.directionSouthLetter(),
        image: skin.downArrow,
        studioValue: Direction.SOUTH.toString(),
        tooltip: msg.moveDownTooltip()
      }
    },
    DISTANCES: [
      [skin.shortLine, '25'],
      [skin.longLine, '400']
    ],
    DEFAULT_MOVE_DISTANCE: '100',
    generateBlocksForAllDirections: function() {
      SimpleMove.generateBlocksForDirection("North");
      SimpleMove.generateBlocksForDirection("South");
      SimpleMove.generateBlocksForDirection("West");
      SimpleMove.generateBlocksForDirection("East");
    },
    generateBlocksForDirection: function(direction) {
      generator["studio_move" + direction] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks['studio_move' + direction] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "Distance"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "Distance"] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "_length"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "_length"] = SimpleMove.generateMoveBlock(direction, true);
    },
    generateMoveBlock: function(direction, hasLengthInput) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];

      return {
        helpUrl: '',
        init: function () {
          this.setHSV(184, 1.00, 0.74);
          this.appendDummyInput()
            .appendTitle(msg.moveSprite()) // move
            .appendTitle(new blockly.FieldImage(directionConfig.image)) // arrow
            .appendTitle(directionConfig.letter); // NESW

          if (spriteCount > 1) {
            this.appendDummyInput().appendTitle(startingSpriteImageDropdown(), 'SPRITE');
          }

          if (hasLengthInput) {
            this.appendDummyInput().appendTitle(new blockly.FieldImageDropdown(SimpleMove.DISTANCES), 'DISTANCE');
          }

          this.setPreviousStatement(true);
          this.setInputsInline(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    },
    generateCodeGenerator: function(direction, isEventMove) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];

      return function() {
        var sprite = this.getTitleValue('SPRITE') || '0';
        var direction = directionConfig.studioValue;
        var methodName = isEventMove ? 'move' : 'moveDistance';
        var distance = this.getTitleValue('DISTANCE') || SimpleMove.DEFAULT_MOVE_DISTANCE;
        return 'Studio.' + methodName + '(\'block_id_' + this.id + '\'' +
          ', ' + sprite +
          ', ' + direction +
          (isEventMove ? '' : (', ' + distance)) +
          ');\n';
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  blockly.Blocks.studio_move = {
    // Block for moving one frame a time.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.moveSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.moveSpriteN), 'SPRITE');
        }
        this.appendDummyInput()
          .appendTitle('\t');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.moveSprite());
      }

      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_DIR), 'DIR');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.studio_move.K1_DIR =
      [[skin.upArrow, Direction.NORTH.toString()],
       [skin.rightArrow, Direction.EAST.toString()],
       [skin.downArrow, Direction.SOUTH.toString()],
       [skin.leftArrow, Direction.WEST.toString()]];

  blockly.Blocks.studio_move.DIR =
      [[msg.moveDirectionUp(), Direction.NORTH.toString()],
       [msg.moveDirectionDown(), Direction.SOUTH.toString()],
       [msg.moveDirectionLeft(), Direction.WEST.toString()],
       [msg.moveDirectionRight(), Direction.EAST.toString()]];

  generator.studio_move = function() {
    // Generate JavaScript for moving.
    return 'Studio.move(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        this.getTitleValue('DIR') + ');\n';
  };

  var initMoveDistanceBlock = function (options) {
    var block = {};
    // Block for moving/gliding a specific distance.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (options.sprite) {
        this.appendValueInput('SPRITE')
            .setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.moveSpriteN({spriteIndex: ''}));
      } else if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.moveSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.moveSpriteN), 'SPRITE');
        }
        this.appendDummyInput()
          .appendTitle('\t');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.moveSprite());
      }

      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_DIR), 'DIR');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      }

      this.appendDummyInput()
        .appendTitle('\t');
      if (options.params) {
        this.appendValueInput('DISTANCE')
          .setCheck(blockly.BlockValueType.NUMBER);
        this.appendDummyInput()
          .appendTitle(msg.moveDistancePixels());
      } else {
        if (isK1) {
          this.appendDummyInput()
            .appendTitle(new blockly.FieldImageDropdown(this.K1_DISTANCE), 'DISTANCE');
        } else {
          this.appendDummyInput()
            .appendTitle(new blockly.FieldDropdown(this.DISTANCE), 'DISTANCE');
        }
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveDistanceTooltip());
    };

    block.K1_DIR =
        [[skin.upArrow, Direction.NORTH.toString()],
          [skin.rightArrow, Direction.EAST.toString()],
          [skin.downArrow, Direction.SOUTH.toString()],
          [skin.leftArrow, Direction.WEST.toString()]];

    block.DIR =
        [[msg.moveDirectionUp(), Direction.NORTH.toString()],
         [msg.moveDirectionDown(), Direction.SOUTH.toString()],
         [msg.moveDirectionLeft(), Direction.WEST.toString()],
         [msg.moveDirectionRight(), Direction.EAST.toString()],
         [msg.moveDirectionRandom(), 'random']];

    if (!options.params) {
      block.DISTANCE =
          [[msg.moveDistance25(), '25'],
           [msg.moveDistance50(), '50'],
           [msg.moveDistance100(), '100'],
           [msg.moveDistance200(), '200'],
           [msg.moveDistance400(), '400'],
           [msg.moveDistanceRandom(), 'random']];

      block.K1_DISTANCE =
        [[skin.shortLine, '25'],
        [skin.longLine, '400']];
    }

    return block;
  };

  blockly.Blocks.studio_moveDistance = initMoveDistanceBlock({});
  blockly.Blocks.studio_moveDistanceParams = initMoveDistanceBlock({
    'params': true
  });
  blockly.Blocks.studio_moveDistanceParamsSprite = initMoveDistanceBlock({
    'params': true,
    'sprite': true
  });

  generator.studio_moveDistance = function() {
    // Generate JavaScript for moving.

    var allDistances = this.DISTANCE.slice(0, -1).map(function (item) {
      return item[1];
    });
    var distParam = this.getTitleValue('DISTANCE');
    if (distParam === 'random') {
      distParam = 'Studio.random([' + allDistances + '])';
    }
    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }

    return 'Studio.moveDistance(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        distParam + ');\n';
  };

  generator.studio_moveDistanceParams = function() {
    // Generate JavaScript for moving (params version).

    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var distParam = Blockly.JavaScript.valueToCode(this, 'DISTANCE',
        Blockly.JavaScript.ORDER_NONE) || '0';

    return 'Studio.moveDistance(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        distParam + ');\n';
  };

  generator.studio_moveDistanceParamsSprite = function() {
    // Generate JavaScript for moving (params version).

    var spriteParam = getSpriteIndex(this);

    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var distParam = Blockly.JavaScript.valueToCode(this, 'DISTANCE',
        Blockly.JavaScript.ORDER_NONE) || '0';

    return 'Studio.moveDistance(\'block_id_' + this.id + '\', ' +
        spriteParam + ', ' + dirParam + ', ' + distParam + ');\n';
  };

  function onSoundSelected(soundValue) {
    if (soundValue === RANDOM_VALUE) {
      return;
    }
    studioApp.playAudio(utils.stripQuotes(soundValue), {volume: 1.0});
  }

  blockly.Blocks.studio_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.play())
          .appendTitle(new blockly.FieldImage(skin.soundIcon))
          .appendTitle(new blockly.FieldDropdown(this.soundChoices(), onSoundSelected), 'SOUND');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.soundChoices(), onSoundSelected), 'SOUND');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.studio_playSound.soundChoices = function () {
    var fullChoices = isK1 ? skin.soundChoicesK1 : skin.soundChoices;
    var permittedValues = paramLists.getPlaySoundValues(true);
    return fullChoices.filter(function (choice) {
      for (var i = 0; i < permittedValues.length; i++) {
        if (choice[1] === permittedValues[i]) {
          return true;
        }
      }
      return false;
    });
  };

  generator.studio_playSound = function() {
    // Generate JavaScript for playing a sound.
    return 'Studio.playSound(\'block_id_' + this.id + '\', \'' +
               this.getTitleValue('SOUND') + '\');\n';
  };

  blockly.Blocks.studio_changeScore = {
    // Block for changing the score.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.score())
          .appendTitle(new blockly.FieldImage(skin.scoreCard));
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(isK1 ?
                        msg.changeScoreTooltipK1() :
                        msg.changeScoreTooltip());
    }
  };

  blockly.Blocks.studio_changeScore.VALUES =
      [[msg.incrementPlayerScore(), '1'],
       [msg.decrementPlayerScore(), '-1']];

  generator.studio_changeScore = function() {
    // Generate JavaScript for changing the score.
    return 'Studio.changeScore(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_addPoints = {
    // Block for adding points.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.addPointsTooltip());
    }
  };

  blockly.Blocks.studio_addPoints.VALUES =
      [[msg.addPoints10(),   '10'],
       [msg.addPoints50(),   '50'],
       [msg.addPoints100(),  '100'],
       [msg.addPoints400(),  '400'],
       [msg.addPoints1000(), '1000']];

  generator.studio_addPoints = function() {
    // Generate JavaScript for adding points.
    return 'Studio.addPoints(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_removePoints = {
    // Block for removing points.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.removePointsTooltip());
    }
  };

  blockly.Blocks.studio_removePoints.VALUES =
      [[msg.removePoints10(),   '10'],
       [msg.removePoints50(),   '50'],
       [msg.removePoints100(),  '100'],
       [msg.removePoints400(),  '400'],
       [msg.removePoints1000(), '1000']];

  generator.studio_removePoints = function() {
    // Generate JavaScript for removing points.
    return 'Studio.removePoints(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_setScoreText = {
    // Block for setting the score text.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('TEXT')
        .appendTitle(msg.setScoreText());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setScoreTextTooltip());
    }
  };

  generator.studio_setScoreText = function() {
    // Generate JavaScript for setting the score text.
    var arg = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.setScoreText(\'block_id_' + this.id + '\', ' + arg + ');\n';
  };

  blockly.Blocks.studio_showCoordinates = {
    // Block for showing the protagonist's coordinates.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput().appendTitle(msg.showCoordinates());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.showCoordinatesTooltip());
    }
  };

  generator.studio_showCoordinates = function() {
    // Generate JavaScript for showing the protagonist's coordinates.
    return 'Studio.showCoordinates(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.studio_setDroidSpeed = {
    // Block for setting droid speed
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[2][1]); // default to normal
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setDroidSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setDroidSpeed.VALUES =
      [[msg.setDroidSpeedRandom(), 'random'],
       [msg.setDroidSpeedSlow(), 'slow'],
       [msg.setDroidSpeedNormal(), 'normal'],
       [msg.setDroidSpeedFast(), 'fast']];

  generator.studio_setDroidSpeed = function () {
    return 'Studio.setDroidSpeed(\'block_id_' + this.id + '\', "' +
      this.getTitleValue('VALUE') + '");\n';
  };

  blockly.Blocks.studio_setSpriteSpeed = {
    // Block for setting sprite speed
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);

      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.setSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES);
        fieldImageDropdown.setValue(this.K1_VALUES[1][1]); // default to normal
        this.appendDummyInput()
          .appendTitle(msg.speed())
          .appendTitle(fieldImageDropdown, 'VALUE');
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[3][1]); // default to normal
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSpeedParams = {
    // Block for setting sprite speed
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.speed());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSpeed.K1_VALUES =
      [[skin.speedSlow, 'Studio.SpriteSpeed.SLOW'],
       [skin.speedMedium, 'Studio.SpriteSpeed.NORMAL'],
       [skin.speedFast, 'Studio.SpriteSpeed.FAST']];

  blockly.Blocks.studio_setSpriteSpeed.VALUES =
      [[msg.setSpriteSpeedRandom(), RANDOM_VALUE],
       [msg.setSpriteSpeedVerySlow(), 'Studio.SpriteSpeed.VERY_SLOW'],
       [msg.setSpriteSpeedSlow(), 'Studio.SpriteSpeed.SLOW'],
       [msg.setSpriteSpeedNormal(), 'Studio.SpriteSpeed.NORMAL'],
       [msg.setSpriteSpeedFast(), 'Studio.SpriteSpeed.FAST'],
       [msg.setSpriteSpeedVeryFast(), 'Studio.SpriteSpeed.VERY_FAST']];

  generator.studio_setSpriteSpeed = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteSpeed'});
  };

  generator.studio_setSpriteSpeedParams = function () {
    // Generate JavaScript for setting sprite speed.
    var spriteParam = getSpriteIndex(this);
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '5';
    return 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\', ' +
        spriteParam + ',' + valueParam + ');\n';
  };

  blockly.Blocks.studio_setSpriteSize = {
    // Block for setting sprite size
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);

      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSizeTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSizeParams = {
    // Block for setting sprite size
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.size());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSizeTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSize.VALUES =
      [[msg.setSpriteSizeRandom(), RANDOM_VALUE],
       [msg.setSpriteSizeVerySmall(), 'Studio.SpriteSize.VERY_SMALL'],
       [msg.setSpriteSizeSmall(), 'Studio.SpriteSize.SMALL'],
       [msg.setSpriteSizeNormal(), 'Studio.SpriteSize.NORMAL'],
       [msg.setSpriteSizeLarge(), 'Studio.SpriteSize.LARGE'],
       [msg.setSpriteSizeVeryLarge(), 'Studio.SpriteSize.VERY_LARGE']];

  generator.studio_setSpriteSize = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteSize'});
  };

  generator.studio_setSpriteSizeParams = function () {
    // Generate JavaScript for setting sprite speed.
    var spriteParam = getSpriteIndex(this);
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '5';
    return 'Studio.setSpriteSize(\'block_id_' + this.id + '\', ' +
        spriteParam + ',' + valueParam + ');\n';
  };

  /**
   * setBackground
   */
  blockly.Blocks.studio_setBackground = {
    helpUrl: '',
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = [];

      var dropdown;
      if (isK1) {
        this.VALUES = skin.backgroundChoicesK1;
        dropdown = new blockly.FieldImageDropdown(
                                  skin.backgroundChoicesK1,
                                  skin.dropdownThumbnailWidth,
                                  skin.dropdownThumbnailHeight);
        this.appendDummyInput()
          .appendTitle(msg.setBackground())
          .appendTitle(dropdown, 'VALUE');
      } else {
        this.VALUES = skin.backgroundChoices;
        dropdown = new blockly.FieldDropdown(skin.backgroundChoices);
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }
      dropdown.setValue('"' + skin.defaultBackground + '"');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  blockly.Blocks.studio_setBackgroundParam = {
    helpUrl: '',
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = skin.backgroundChoices;

      this.appendDummyInput()
        .appendTitle(msg.setBackground());
      this.appendValueInput('VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  generator.studio_setBackground = function() {
    return generateSetterCode({ctx: this, name: 'setBackground'});
  };
  generator.studio_setBackgroundParam = function () {
    var backgroundValue = blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_NONE);

    return generateSetterCode({
      value: backgroundValue,
      ctx: this,
      name: 'setBackground'});
  };

  /**
   * setMap
   */
  blockly.Blocks.studio_setMap = {
    helpUrl: '',
    init: function() {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = skin.mapChoices;

      var dropdown = new blockly.FieldDropdown(skin.mapChoices);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      // default to first item after random
      dropdown.setValue(skin.mapChoices[1][1]);
      
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setMapTooltip());
    }
  };

  generator.studio_setMap = function() {
    return generateSetterCode({ctx: this, name: 'setMap'});
  };

  /**
   * showTitleScreen
   */
  var initShowTitleScreenBlock = function (options) {
    var block = {};

    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.showTitleScreen());
      if (options.params) {
        this.appendValueInput('TITLE')
          .setCheck(blockly.BlockValueType.STRING)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(msg.showTitleScreenTitle());
        this.appendValueInput('TEXT')
          .setCheck(blockly.BlockValueType.STRING)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(msg.showTitleScreenText());
      } else {
        this.appendDummyInput()
          .appendTitle(msg.showTitleScreenTitle())
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(
              msg.showTSDefTitle()),
              'TITLE')
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote1.png'), 12, 12));
        this.appendDummyInput()
          .appendTitle(msg.showTitleScreenText())
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(msg.showTSDefText()), 'TEXT')
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote1.png'), 12, 12));
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.showTitleScreenTooltip());
    };
    return block;
  };

  blockly.Blocks.studio_showTitleScreen = initShowTitleScreenBlock({});
  blockly.Blocks.studio_showTitleScreenParams = initShowTitleScreenBlock({
    'params': true
  });

  generator.studio_showTitleScreen = function() {
    // Generate JavaScript for showing title screen.
    return 'Studio.showTitleScreen(\'block_id_' + this.id +
               '\', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TITLE')) + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_showTitleScreenParams = function() {
    // Generate JavaScript for showing title screen (param version).
    var titleParam = Blockly.JavaScript.valueToCode(this, 'TITLE',
        Blockly.JavaScript.ORDER_NONE) || '';
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.showTitleScreen(\'block_id_' + this.id +
               '\', ' + titleParam + ', ' + textParam + ');\n';
  };

  if (isK1) {
    /**
     * setSprite (K1 version: only sets visible/hidden)
     */
    blockly.Blocks.studio_setSprite = {
      helpUrl: '',
      init: function() {
        this.setHSV(312, 0.32, 0.62);
        var visibilityTextDropdown = new blockly.FieldDropdown(this.VALUES);
        visibilityTextDropdown.setValue(VISIBLE_VALUE);  // default to visible
        this.appendDummyInput().appendTitle(visibilityTextDropdown, 'VALUE');
        if (spriteCount > 1) {
            this.appendDummyInput()
              .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        }
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteK1Tooltip());
      }
    };

    blockly.Blocks.studio_setSprite.VALUES =
        [[msg.setSpriteHideK1(), HIDDEN_VALUE],
         [msg.setSpriteShowK1(), VISIBLE_VALUE]];
  } else {
    /**
     * setSprite
     */
    blockly.Blocks.studio_setSprite = {
      helpUrl: '',
      init: function() {
        // shallow copy array:
        this.VALUES = [].concat(skin.spriteChoices);
        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          // Modify the dropdownValues array to contain combined text
          // (blockly renders this better than two adjacent text blocks)
          var prefix = skin.setSpritePrefix + ' ';
          for (var i = 0; i < this.VALUES.length; i++) {
            // shallow copy this array within the larger array, then modify
            // the string to be displayed to include the prefix:
            this.VALUES[i] = [].concat(skin.spriteChoices[i]);
            this.VALUES[i][0] = prefix + this.VALUES[i][0];
          }
        }
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        // default to first item after random/hidden
        dropdown.setValue(skin.spriteChoices[2][1]);
        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };

    blockly.Blocks.studio_setSpriteParams = {
      helpUrl: '',
      init: function() {
        this.VALUES = skin.spriteChoices;
        var dropdown = new blockly.FieldDropdown(skin.spriteChoices);
        // default to first item after random/hidden
        dropdown.setValue(skin.spriteChoices[2][1]);

        this.setHSV(312, 0.32, 0.62);
        this.appendValueInput('SPRITE')
            .setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.setSpriteN({spriteIndex: ''}));
        this.appendDummyInput()
            .appendTitle(dropdown, 'VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };

    blockly.Blocks.studio_setSpriteParamValue = {
      helpUrl: '',
      init: function() {
        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(msg.setSprite());
        }
        this.appendValueInput('VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };
  }

  generator.studio_setSprite = function() {
    var indexString = this.getTitleValue('SPRITE') || '0';
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  generator.studio_setSpriteParams = function() {
    var indexString = getSpriteIndex(this);
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  generator.studio_setSpriteParamValue = function() {
    var indexString = this.getTitleValue('SPRITE') || '0';
    var spriteValue = blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_NONE);

    return generateSetterCode({
      value: spriteValue,
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  blockly.Blocks.studio_setSpriteEmotion = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.setSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES, 34, 34);
        fieldImageDropdown.setValue(this.K1_VALUES[0][1]); // default to normal
        this.appendDummyInput()
          .appendTitle(msg.emotion())
          .appendTitle(fieldImageDropdown, 'VALUE');
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[1][1]);  // default to normal
        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteEmotionTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteEmotionParams = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]);  // default to normal
      this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteEmotionTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteEmotion.VALUES =
      blockly.Blocks.studio_setSpriteEmotionParams.VALUES =
      [[msg.setSpriteEmotionRandom(), RANDOM_VALUE],
       [msg.setSpriteEmotionNormal(), Emotions.NORMAL.toString()],
       [msg.setSpriteEmotionHappy(), Emotions.HAPPY.toString()],
       [msg.setSpriteEmotionAngry(), Emotions.ANGRY.toString()],
       [msg.setSpriteEmotionSad(), Emotions.SAD.toString()]];

  blockly.Blocks.studio_setSpriteEmotion.K1_VALUES =
      [[skin.emotionNormal, Emotions.NORMAL.toString()],
       [skin.emotionHappy, Emotions.HAPPY.toString()],
       [skin.emotionAngry, Emotions.ANGRY.toString()],
       [skin.emotionSad, Emotions.SAD.toString()],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.studio_setSpriteEmotion = function() {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteEmotion'});
  };

  generator.studio_setSpriteEmotionParams = function() {
    var indexString = getSpriteIndex(this);
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSpriteEmotion'});
  };

  var initSayBlock = function (options) {
    var block = {};
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (options.time) {
        this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.actor());
        this.appendDummyInput()
            .appendTitle(msg.saySprite());
      } else if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.saySprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.saySpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.saySprite());
      }
      if (options.restrictedDialog) {
        var functionArray = [];
        var numRestrictedSayChoices = 59;
        for (var i = 0; i < numRestrictedSayChoices; i++) {
          var functionElement = functionArray[i] = [];
          var string = msg["saySpriteChoices_" + i]();
          functionElement[0] = functionElement[1] = string;
        }
        var dropdown = new blockly.FieldDropdown(functionArray);
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }
      else if (options.params) {
        this.appendValueInput('TEXT');
      } else {
        var quotedTextInput = this.appendDummyInput();
        if (isK1) {
          quotedTextInput.appendTitle(new Blockly.FieldImage(skin.speechBubble));
        }
        quotedTextInput.appendTitle(new Blockly.FieldImage(
              Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(msg.defaultSayText()), 'TEXT')
          .appendTitle(new Blockly.FieldImage(
              Blockly.assetUrl('media/quote1.png'), 12, 12));
      }
      if (options.time) {
        this.appendValueInput('TIME').setCheck(blockly.BlockValueType.NUMBER).appendTitle(msg.for());
        this.appendDummyInput().appendTitle(msg.waitSeconds());
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.saySpriteTooltip());
    };

    return block;
  };

  blockly.Blocks.studio_saySprite = initSayBlock({});
  blockly.Blocks.studio_saySpriteChoices = initSayBlock({'restrictedDialog': true});
  blockly.Blocks.studio_saySpriteParams = initSayBlock({'params': true});
  blockly.Blocks.studio_saySpriteParamsTime = initSayBlock({'params': true, 'time': true});

  generator.studio_saySprite = function() {
    // Generate JavaScript for saying.
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_saySpriteChoices = function() {
    // Generate JavaScript for saying (choices version).
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', \'' +
               (this.getTitleValue('VALUE') || ' ') + '\');\n';
  };

  generator.studio_saySpriteParams = function() {
    // Generate JavaScript for saying (param version).
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               textParam + ');\n';
  };

  generator.studio_saySpriteParamsTime = function() {
    // Generate JavaScript for saying (param version).
    var spriteParam = getSpriteIndex(this);
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    var secondsParam = Blockly.JavaScript.valueToCode(this, 'TIME',
        Blockly.JavaScript.ORDER_NONE) || 1;
    return 'Studio.saySprite(\'block_id_' + this.id + '\', ' +
        spriteParam + ', ' + textParam + ',' + secondsParam + ');\n';
  };

  var initWaitBlock = function (options) {
    var block = {};
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (options.params) {
        this.appendDummyInput()
          .appendTitle(msg.waitFor());
        this.appendValueInput('VALUE')
          .setCheck(blockly.BlockValueType.NUMBER);
        this.appendDummyInput()
          .appendTitle(msg.waitSeconds());
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[2][1]);  // default to half second

        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(options.params ? msg.waitParamsTooltip() :
        msg.waitTooltip());
    };

    if (!options.params) {
      block.VALUES =
        [[msg.waitForClick(), '"click"'],
         [msg.waitForRandom(), 'random'],
         [msg.waitForHalfSecond(), '500'],
         [msg.waitFor1Second(), '1000'],
         [msg.waitFor2Seconds(), '2000'],
         [msg.waitFor5Seconds(), '5000'],
         [msg.waitFor10Seconds(), '10000']];
    }

    return block;
  };

  blockly.Blocks.studio_wait = initWaitBlock({});
  blockly.Blocks.studio_waitParams = initWaitBlock({ 'params': true });

  generator.studio_wait = function() {
    return generateSetterCode({
      ctx: this,
      name: 'wait'});
  };

  generator.studio_waitParams = function() {
    // Generate JavaScript for wait (params version).
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '0';
    return 'Studio.wait(\'block_id_' + this.id +
        '\', (' + valueParam + ' * 1000));\n';
  };

  blockly.Blocks.studio_endGame = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[0][1]); // default to win
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.endGameTooltip());
    }
  };

  blockly.Blocks.studio_endGame.VALUES =
    [[msg.endGameWin(), 'win'],
     [msg.endGameLose(), 'lose']];

  generator.studio_endGame = function() {
    // Generate JavaScript for ending the game.
    return 'Studio.endGame(\'block_id_' + this.id + '\',\'' +
      this.getTitleValue('VALUE') + '\');\n';
  };

  //
  // Install functional start blocks
  //

  blockly.Blocks.functional_start_setValue = {
    init: function() {
      var blockName = msg.startSetValue();
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [{name: 'VALUE', type: blockly.BlockValueType.FUNCTION}];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setValue = function() {
    // For each of our inputs (i.e. update-target, update-danger, etc.) get
    // the attached block and figure out what it's function name is. Store
    // that on BigGameLogic so we can know what functions to call later.
    if (customGameLogic) {
      customGameLogic.cacheBlock('VALUE', this.getInputTargetBlock('VALUE'));
    } else {
      throw new Error('must register custom game logic');
    }
  };

  blockly.Blocks.functional_start_setVars = {
    init: function() {
      var blockName = msg.startSetVars();
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'title', type: blockly.BlockValueType.STRING},
        {name: 'subtitle', type: blockly.BlockValueType.STRING},
        {name: 'background', type: blockly.BlockValueType.IMAGE},
        {name: 'player', type: blockly.BlockValueType.IMAGE},
        {name: 'target', type: blockly.BlockValueType.IMAGE},
        {name: 'danger', type: blockly.BlockValueType.IMAGE}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setVars = function() {
    // For the current design, this doesn't need to generate any code.
    // Though we pass in a function, we're not actually using that passed in
    // function, and instead depend on a function of the required name existing
    // in the global space. This may change in the future.
  };

  /**
   * functional_start_setFuncs
   * Even those this is called setFuncs, we are passed both functions and
   * variables. Our generator stashes the passed values on our customLogic
   * object (which is BigGameLogic).
   */
  blockly.Blocks.functional_start_setFuncs = {
    init: function() {
      this.blockArgs = [
        {name: 'title', type: blockly.BlockValueType.STRING},
        {name: 'subtitle', type: blockly.BlockValueType.STRING},
        {name: 'background', type: blockly.BlockValueType.IMAGE},
        {name: 'target', type: blockly.BlockValueType.IMAGE},
        {name: 'danger', type: blockly.BlockValueType.IMAGE},
        {name: 'player', type: blockly.BlockValueType.IMAGE},
        {name: 'update-target', type: blockly.BlockValueType.FUNCTION},
        {name: 'update-danger', type: blockly.BlockValueType.FUNCTION},
        {name: 'update-player', type: blockly.BlockValueType.FUNCTION},
        {name: 'collide?', type: blockly.BlockValueType.FUNCTION},
        {name: 'on-screen?', type: blockly.BlockValueType.FUNCTION}
      ];
      this.setFunctional(true, {
        headerHeight: 30
      });
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.NONE]);

      var options = {
        fixedSize: { height: 35 }
      };

      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('game_funcs', options))
        .setAlign(Blockly.ALIGN_LEFT);

      var rows = [
        'title, subtitle, background',
        [this.blockArgs[0], this.blockArgs[1], this.blockArgs[2]],
        'target, danger, player',
        [this.blockArgs[3], this.blockArgs[4], this.blockArgs[5]],
        'update-target, update-danger, update-player',
        [this.blockArgs[6], this.blockArgs[7], this.blockArgs[8]],
        'collide?, onscreen?',
        [this.blockArgs[9], this.blockArgs[10]]
      ];

      rows.forEach(function (row) {
        if (typeof(row) === 'string') {
          this.appendDummyInput()
            .appendTitle(new Blockly.FieldLabel(row));
        } else {
          row.forEach(function (blockArg, index) {
            var input = this.appendFunctionalInput(blockArg.name);
            if (index !== 0) {
              input.setInline(true);
            }
            input.setHSV.apply(input, blockly.FunctionalTypeColors[blockArg.type]);
            input.setCheck(blockArg.type);
            input.setAlign(Blockly.ALIGN_LEFT);
          }, this);
        }
      }, this);

      this.setFunctionalOutput(false);
    }
  };

  generator.functional_start_setFuncs = function() {
    if (!customGameLogic) {
      throw new Error('must register custom game logic');
    }

    // For each of our inputs (i.e. update-target, update-danger, etc.) get
    // the attached block and figure out what it's function name is. Store
    // that on BigGameLogic so we can know what functions to call later.
    this.blockArgs.forEach(function (arg) {
      var inputBlock = this.getInputTargetBlock(arg.name);
      if (!inputBlock) {
        return;
      }

      customGameLogic.cacheBlock(arg.name, inputBlock);
    }, this);
  };

  blockly.Blocks.functional_start_setSpeeds = {
    init: function() {
      var blockName = 'start (player-speed, enemy-speed)';
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'PLAYER_SPEED', type: 'Number'},
        {name: 'ENEMY_SPEED', type: 'Number'}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setSpeeds = function() {
    var defaultSpeed = 7;
    var playerSpeed = Blockly.JavaScript.statementToCode(this, 'PLAYER_SPEED', false) || defaultSpeed;
    var enemySpeed = Blockly.JavaScript.statementToCode(this, 'ENEMY_SPEED', false) || defaultSpeed;
    var playerSpriteIndex = '0';
    var enemySpriteIndex = '1';
    var code = 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',' +
        playerSpriteIndex + ',' + playerSpeed + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',' +
        enemySpriteIndex + ',' + enemySpeed + ');\n';
    return code;
  };

  blockly.Blocks.functional_start_setBackgroundAndSpeeds = {
    init: function() {
      var blockName = 'start (background, player-speed, enemy-speed)';
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'BACKGROUND', type: blockly.BlockValueType.STRING},
        {name: 'PLAYER_SPEED', type: 'Number'},
        {name: 'ENEMY_SPEED', type: 'Number'}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setBackgroundAndSpeeds = function() {
    var background = Blockly.JavaScript.statementToCode(this, 'BACKGROUND', false) || 'cave';
    var defaultSpeed = 7;
    var playerSpeed = Blockly.JavaScript.statementToCode(this, 'PLAYER_SPEED', false) || defaultSpeed;
    var enemySpeed = Blockly.JavaScript.statementToCode(this, 'ENEMY_SPEED', false) || defaultSpeed;
    var code =  'Studio.setBackground(\'block_id_' + this.id + '\'' +
        ',' + background + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',0' +
        ',' + playerSpeed + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',1' +
        ',' + enemySpeed + ');\n';
    return code;
  };

  // install number and string
  sharedFunctionalBlocks.install(blockly, generator);

  // Note: in other languages, the translated values won't be accepted
  // as valid backgrounds if they are typed in as free text. Also this
  // block will have the effect of translating the selected text to
  // english if not connected to the functional_setBackground block.
  // TODO(i18n): translate these strings in the Studio.setBackground
  // API instead of here.
  var functional_background_values = skin.backgroundChoices.slice(1);

  blockly.FunctionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_background_string_picker',
    values: functional_background_values
  });

  blockly.Blocks.studio_vanishSprite = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.vanishActorN({spriteIndex: ''}));
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.vanishTooltip());
    }
  };

  generator.studio_vanishSprite = function() {
    var spriteParam = getSpriteIndex(this);
    return 'Studio.vanish(\'block_id_' + this.id + '\', ' + spriteParam +
        ');\n';
  };

  /**
   * functional_sprite_dropdown
   */
  blockly.Blocks.functional_sprite_dropdown = {
    helpUrl: '',
    init: function() {
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.IMAGE]);

      this.VALUES = skin.spriteChoices;

      var choices = _.map(startAvatars, function (skinId) {
        return [skin[skinId].dropdownThumbnail, skinId];
      });
      var dropdown = new blockly.FieldImageDropdown(choices,
        skin.dropdownThumbnailWidth, skin.dropdownThumbnailHeight);

      this.appendDummyInput()
        .appendTitle(dropdown, 'SPRITE_INDEX');

      this.setFunctionalOutput(true);
    }
  };

  generator.functional_sprite_dropdown = function () {
    // returns the sprite index
    return blockly.JavaScript.quote_(this.getTitleValue('SPRITE_INDEX'));
  };

  /**
   * functional_background_dropdown
   */
  blockly.Blocks.functional_background_dropdown = {
    helpUrl: '',
    init: function() {
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.IMAGE]);

      this.VALUES = skin.backgroundChoicesK1;
      var dropdown = new blockly.FieldImageDropdown(skin.backgroundChoicesK1,
        skin.dropdownThumbnailWidth, skin.dropdownThumbnailHeight);

      this.appendDummyInput()
        .appendTitle(dropdown, 'BACKGROUND');

      this.setFunctionalOutput(true);
    }
  };

  generator.functional_background_dropdown = function () {
    // returns the sprite index
    return generateSetterCode({
      value: this.getTitleValue('BACKGROUND'),
      ctx: this,
      returnValue: true
    });
  };

  /**
   * functional_keydown
   */
  blockly.Blocks.functional_keydown = {
    helpUrl: '',
    init: function() {
      // todo = localize
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, 'keydown?', blockly.BlockValueType.BOOLEAN, [
        { name: 'ARG1', type: 'Number' }
      ]);
    }
  };

  generator.functional_keydown = function() {
    var keyCode = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || - 1;
    return 'Studio.isKeyDown(' + keyCode + ');';
  };
};

function installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions) {
  blockly.Blocks.studio_vanish = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (blockInstallOptions.isK1) {
        this.appendDummyInput()
          .appendTitle(msg.vanish())
          .appendTitle(new blockly.FieldImage(blockInstallOptions.skin.explosionThumbnail))
          .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.vanishActorN), 'SPRITE');
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.vanishTooltip());
    }
  };

  generator.studio_vanish = function() {
    var sprite = this.getTitleValue('SPRITE');
    return 'Studio.vanish(\'block_id_' + this.id + '\', ' + sprite + ');\n';
  };
}


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../sharedFunctionalBlocks":"/home/ubuntu/staging/apps/build/js/sharedFunctionalBlocks.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js","./paramLists":"/home/ubuntu/staging/apps/build/js/studio/paramLists.js"}],"/home/ubuntu/staging/apps/build/js/studio/paramLists.js":[function(require,module,exports){
var skin, level;

exports.initWithSkinAndLevel = function (skinData, levelData) {
  skin = skinData;
  level = levelData;
};

exports.getPlaySoundValues = function (withRandom) {
  var names;
  if (withRandom) {
    names = ['random'];
  } else {
    names = [];
  }
  names = names.concat(skin.sounds);
  var restrictions = level.paramRestrictions && level.paramRestrictions.playSound;
  if (restrictions) {
    names = names.filter(function(name) {
      return restrictions[name];
    });
  }
  return names;
};

exports.playSoundDropdown = function () {
  return exports.getPlaySoundValues(true).map(function (sound) {
    return '"' + sound + '"';
  });
};


},{}],"/home/ubuntu/staging/apps/build/js/studio/bigGameLogic.js":[function(require,module,exports){
var CustomGameLogic = require('./customGameLogic');
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var codegen = require('../codegen');
var api = require('./api');
var utils = require('../utils');


/**
 * Custom logic for the MSM BigGame
 * @constructor
 * @implements CustomGameLogic
 */
var BigGameLogic = function (studio, options) {
  options = options || {};

  CustomGameLogic.apply(this, arguments);

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;

  this.finished = false;
  // If set to true, player always faces forward
  this.staticPlayer = utils.valueOr(options.staticPlayer, false);
};
BigGameLogic.inherits(CustomGameLogic);

BigGameLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    this.onFirstTick_();
    this.studio_.playerScore = 100;
    return;
  }

  if (this.finished) {
    return;
  }

   // Don't start until the title is over
  var titleScreenTitle = document.getElementById('titleScreenTitle');
  if (titleScreenTitle.getAttribute('visibility') === "visible") {
    return;
  }

  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];
  var targetSprite = this.studio_.sprite[this.targetSpriteIndex];
  var dangerSprite = this.studio_.sprite[this.dangerSpriteIndex];

  // Update target, using onscreen and update_target
  this.updateSpriteX_(this.targetSpriteIndex, this.update_target.bind(this));
  // Update danger, using onscreen and update_danger
  this.updateSpriteX_(this.dangerSpriteIndex, this.update_danger.bind(this));

  // For every key and button down, call update_player
  for (var key in this.studio_.keyState) {
    if (this.studio_.keyState[key] === 'keydown') {
      this.handleUpdatePlayer_(key);
    }
  }

  for (var btn in this.studio_.btnState) {
    if (this.studio_.btnState[btn]) {
      if (btn === 'leftButton') {
        this.handleUpdatePlayer_(37);
      } else if (btn === 'upButton') {
        this.handleUpdatePlayer_(38);
      } else if (btn === 'rightButton') {
        this.handleUpdatePlayer_(39);
      } else if (btn === 'downButton') {
        this.handleUpdatePlayer_(40);
      }
    }
  }

  if (playerSprite.visible && dangerSprite.visible &&
      this.collide(playerSprite.x, playerSprite.y,
                   dangerSprite.x, dangerSprite.y)) {
    this.studio_.vanishActor({spriteIndex:this.playerSpriteIndex});
    setTimeout((function ()  {
      this.studio_.setSprite({
        spriteIndex: this.playerSpriteIndex,
        value:"visible"
      });
    }).bind(this), 20 * 40 + 50); // 40ms for each of 20 frames, plus some buffer
    this.studio_.playerScore -= 20;

    // send sprite back offscreen
    this.resetSprite_(dangerSprite);
  }

  if (playerSprite.visible && targetSprite.visible &&
      this.collide(playerSprite.x, playerSprite.y,
                   targetSprite.x, targetSprite.y)) {
    this.studio_.playerScore += 10;

    // send sprite back offscreen
    this.resetSprite_(targetSprite);
  }

  if (this.studio_.playerScore <= 0) {
    var score = document.getElementById('score');
    score.setAttribute('visibility', 'hidden');
    this.studio_.showTitleScreen({title:'Game Over', text:'Click Reset to Play Again'});
    for (var i = 0; i < this.studio_.spriteCount; i++) {
      this.studio_.setSprite({
        spriteIndex: i,
        value:"hidden"
      });
    }
    this.finished = true;
  } else {
    this.studio_.displayScore();
  }
};

BigGameLogic.prototype.reset = function () {
  this.finished = false;
};

/**
 * When game starts logic
 */
BigGameLogic.prototype.onFirstTick_ = function () {
  var func = function (StudioApp, Studio, Globals) {
    Studio.setBackground(null, this.getVar_('background'));
    Studio.setSpritePosition(null, this.playerSpriteIndex, Position.MIDDLECENTER);
    Studio.setSprite(null, this.playerSpriteIndex, this.getVar_('player'));
    Studio.setSpritePosition(null, this.targetSpriteIndex, Position.TOPLEFT);
    Studio.setSprite(null, this.targetSpriteIndex, this.getVar_('target'));
    Studio.setSpritePosition(null, this.dangerSpriteIndex, Position.BOTTOMRIGHT);
    Studio.setSprite(null, this.dangerSpriteIndex, this.getVar_('danger'));
    Studio.showTitleScreen(null, this.getVar_('title'), this.getVar_('subtitle'));
  }.bind(this);
  this.studio_.callApiCode('BigGame.onFirstTick', func);
};

/**
 * Update a sprite's x coordinates using the user updateFunction. If
 * sprite goes of screen, we reset to the other side of the screen.
 */
BigGameLogic.prototype.updateSpriteX_ = function (spriteIndex, updateFunction) {
  var sprite = this.studio_.sprite[spriteIndex];
  // sprite.x is the left. get the center
  var centerX = sprite.x + sprite.width / 2;

  var newCenterX = updateFunction(centerX);
  sprite.x = newCenterX - sprite.width / 2;

  // Current behavior is that as soon as we go offscreen, we reset to the other
  // side. We could add a delay if we want.
  if (!this.onscreen(newCenterX)) {
    // reset to other side if it is visible
    if (sprite.visible) {
      this.resetSprite_(sprite);
    }
  } else if (!sprite.visible) {
    // sprite has returned to screen, make it visible again
    this.studio_.setSprite({
      spriteIndex: this.studio_.sprite.indexOf(sprite),
      value:"visible"
    });
  }
};

/**
 * Update the player sprite, using the user provided function.
 */
BigGameLogic.prototype.handleUpdatePlayer_ = function (key) {
  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];
  if (!playerSprite.visible) {
    return;
  }

  // sprite.y is the top. get the center
  var centerY = playerSprite.y + playerSprite.height / 2;

  // invert Y
  var userSpaceY = this.studio_.MAZE_HEIGHT - centerY;

  var newUserSpaceY = this.update_player(key, userSpaceY);

  // reinvertY
  playerSprite.y = this.studio_.MAZE_HEIGHT - newUserSpaceY - playerSprite.height / 2;
  if (this.staticPlayer) {
    playerSprite.dir = studioConstants.Direction.NONE;
  }
};

/**
 * Reset sprite to the opposite side of the screen
 */
BigGameLogic.prototype.resetSprite_ = function (sprite) {
  if (sprite.dir === Direction.EAST) {
    sprite.x = 0 - sprite.width;
  } else {
    sprite.x = this.studio_.MAZE_WIDTH;
  }

  sprite.y = Math.floor(Math.random() * (this.studio_.MAZE_HEIGHT - sprite.height));
  this.studio_.setSprite({
    spriteIndex: this.studio_.sprite.indexOf(sprite),
    value:"hidden"
  });
};

/**
 * Calls the user provided update_target function, or no-op if none was provided.
 * @param {number} x Current x location of target
 * @returns {number} New x location of target
 */
BigGameLogic.prototype.update_target = function (x) {
  return this.getFunc_('update-target')(x);
};

/**
 * Calls the user provided update_danger function, or no-op if none was provided.
 * @param {number} x Current x location of the danger sprite
 * @returns {number} New x location of the danger target
 */
BigGameLogic.prototype.update_danger = function (x) {
  return this.getFunc_('update-danger')(x);
};

/**
 * Calls the user provided update_player function, or no-op if none was provided.
 * @param {number} key KeyCode of key that is down
 * @param {number} y Current y location of player. (is this in an inverted coordinate space?)
 * @returns {number} New y location of the player
 */
BigGameLogic.prototype.update_player = function (key, y) {
  return this.getFunc_('update-player')(key, y);
};

/**
 * Calls the user provided onscreen? function, or no-op if none was provided.
 * @param {number} x An x location
 * @returns {boolean} True if x location is onscreen?
 */
BigGameLogic.prototype.onscreen = function (x) {
  return this.getFunc_('on-screen?')(x);
};

/**
 * Calls the user provided collide? function, or no-op if none was provided.
 * @param {number} px Player's x location
 * @param {number} py Player's y location
 * @param {number} cx Collider's x location
 * @param {number} cy Collider's y location
 * @returns {boolean} True if objects collide
 */
BigGameLogic.prototype.collide = function (px, py, cx, cy) {
  return this.getFunc_('collide?')(px, py, cx, cy);
};


module.exports = BigGameLogic;


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/studio/api.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./customGameLogic":"/home/ubuntu/staging/apps/build/js/studio/customGameLogic.js"}],"/home/ubuntu/staging/apps/build/js/studio/customGameLogic.js":[function(require,module,exports){
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var codegen = require('../codegen');
var api = require('./api');

/**
 * Interface for a set of custom game logic for playlab
 * @param {Studio} studio Reference to global studio object
 * @interface CustomGameLogic
 */
var CustomGameLogic = function (studio) {
  this.studio_ = studio;
  this.cached_ = {};
};

/**
 * Logic to be run once per playlab tick
 *
 * @function
 * @name CustomGameLogic#onTick
 */

CustomGameLogic.prototype.onTick = function () {
  throw new Error('should be overridden by child');
};

/**
 * Logic to be run when game is reset
 */
CustomGameLogic.prototype.reset = function () {
};

/**
 * Store a block in our cache, so that it can be called elsewhere
 */
CustomGameLogic.prototype.cacheBlock = function (key, block) {
  this.cached_[key] = block;
};

/**
 * Takes a cached block for a function of variable, and calculates the value
 * @returns The result of calling the code for the cached block. If the cached
 *   block was a function_pass, this means we get back a function that can
 *   now be called.
 */
CustomGameLogic.prototype.resolveCachedBlock_ = function (key) {
  var result = '';
  var block = this.cached_[key];
  if (!block) {
    return result;
  }

  var code = 'return ' + Blockly.JavaScript.blockToCode(block);
  result = codegen.evalWith(code, {
    Studio: api,
    Globals: Studio.Globals
  });
  return result;
};

/**
 * getVar/getFunc just call resolveCachedBlock_, but are provided for clarity
 */
CustomGameLogic.prototype.getVar_ = function (key) {
  return this.resolveCachedBlock_(key);
};

CustomGameLogic.prototype.getFunc_ = function (key) {
  return this.resolveCachedBlock_(key) || function () {};
};

module.exports = CustomGameLogic;


},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","./api":"/home/ubuntu/staging/apps/build/js/studio/api.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/apiJavascript.js":[function(require,module,exports){
var constants = require('./constants');

// API definitions for functions exposed for JavaScript (droplet/ace) levels:

exports.endGame = function(value) {
  Studio.queueCmd(null, 'endGame', {'value': value});
};

exports.setBackground = function (value) {
  Studio.queueCmd(null, 'setBackground', {'value': value});
};

exports.setMap = function (value) {
  Studio.queueCmd(null, 'setMap', {'value': value});
};

exports.setSprite = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSprite', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteEmotion = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteEmotion', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteSpeed = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSpeed', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

exports.setDroid = function (value) {
  Studio.queueCmd(null, 'setSprite', {
    'spriteIndex': 0,
    'value': value
  });
};

exports.setDroidSpeed = function (value) {
  Studio.queueCmd(null, 'setDroidSpeed', {
    'value': value
  });
};

/*
exports.setSpriteSize = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSize', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};
*/

exports.setSpritePosition = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpritePosition', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

/*
exports.setSpriteXY = function (spriteIndex, xpos, ypos) {
  Studio.queueCmd(null, 'setSpriteXY', {
    'spriteIndex': spriteIndex,
    'x': xpos,
    'y': ypos
  });
};
*/

exports.playSound = function(soundName) {
  Studio.queueCmd(null, 'playSound', {'soundName': soundName});
};

exports.throwProjectile = function(spriteIndex, dir, className) {
  Studio.queueCmd(null, 'throwProjectile', {
    'spriteIndex': spriteIndex,
    'dir': dir,
    'className': className
  });
};

/*
exports.makeProjectile = function(className, action) {
  Studio.queueCmd(null, 'makeProjectile', {
    'className': className,
    'action': action
  });
};
*/

exports.move = function(spriteIndex, dir) {
  Studio.queueCmd(null, 'move', {
    'spriteIndex': spriteIndex,
    'dir': dir
  });
};

exports.moveRight = function() {
  Studio.queueCmd(null, 'moveRight');
};

exports.moveLeft = function() {
  Studio.queueCmd(null, 'moveLeft');
};

exports.moveUp = function() {
  Studio.queueCmd(null, 'moveUp');
};

exports.moveDown = function() {
  Studio.queueCmd(null, 'moveDown');
};

// goUp/Down/LeftRight are wrappers for moveUp/Down/Left/Right (used by hoc2015)
exports.goRight = function() {
  Studio.queueCmd(null, 'moveRight');
};

exports.goLeft = function() {
  Studio.queueCmd(null, 'moveLeft');
};

exports.goUp = function() {
  Studio.queueCmd(null, 'moveUp');
};

exports.goDown = function() {
  Studio.queueCmd(null, 'moveDown');
};

// addPoints is a wrapper for changeScore (used by hoc2015)

exports.addPoints = function(value) {
  Studio.queueCmd(null, 'changeScore', {'value': value});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

exports.removePoints = function(value) {
  Studio.queueCmd(null, 'reduceScore', {'value': value});
};

exports.changeScore = function(value) {
  Studio.queueCmd(null, 'changeScore', {'value': value});
};

exports.addCharacter = function(className) {
  Studio.queueCmd(null, 'addItem', {
    'className': className
  });
};

exports.setToChase = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'chase'
  });
};

exports.setToFlee = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'flee'
  });
};

exports.setToRoam = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'roam'
  });
};

exports.setToStop = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'none'
  });
};

exports.moveFast = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.FAST
  });
};

exports.moveNormal = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.SLOW
  });
};

exports.moveSlow = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.VERY_SLOW
  });
};

exports.showDebugInfo = function(value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    'value': value
  });
};

/*
exports.setScoreText = function(text) {
  Studio.queueCmd(null, 'setScoreText', {'text': text});
};

exports.showCoordinates = function() {
  Studio.queueCmd(null, 'showCoordinates', {});
};
*/

exports.vanish = function (spriteIndex) {
  Studio.queueCmd(null, 'vanish', {spriteIndex: spriteIndex});
};

exports.onEvent = function (eventName, func) {
  Studio.queueCmd(null, 'onEvent', {
    'eventName': eventName,
    'func': func
  });
};


},{"./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/api.js":[function(require,module,exports){
var constants = require('./constants');

exports.SpriteSpeed = constants.SpriteSpeed;
exports.SpriteSize = constants.SpriteSize;

var SPEECH_BUBBLE_TIME = 3;

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.endGame = function(id, value) {
  Studio.queueCmd(id, 'endGame', {'value': value});
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {'value': value});
};

exports.setMap = function (id, value) {
  Studio.queueCmd(id, 'setMap', {'value': value});
};

exports.setSprite = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSprite', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.saySprite = function (id, spriteIndex, text, seconds) {
  if (seconds === undefined) {
    seconds = SPEECH_BUBBLE_TIME;
  }
  Studio.queueCmd(id, 'saySprite', {
    'spriteIndex': spriteIndex,
    'text': text,
    'seconds': seconds
  });
};

exports.showTitleScreen = function (id, title, text) {
  Studio.queueCmd(id, 'showTitleScreen', {
    'title': title,
    'text': text
  });
};

exports.setSpriteEmotion = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteEmotion', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteSpeed = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSpeed', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

exports.setDroid = function (id, value) {
  Studio.queueCmd(id, 'setSprite', {
    'spriteIndex': 0,
    'value': value
  });
};

exports.setDroidSpeed = function (id, value) {
  Studio.queueCmd(id, 'setDroidSpeed', {
    'value': value
  });
};

exports.setSpriteSize = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSize', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpritePosition = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpritePosition', {
    'spriteIndex': spriteIndex,
    'value': Number(value)
  });
};

exports.setSpriteXY = function (id, spriteIndex, xpos, ypos) {
  Studio.queueCmd(id, 'setSpriteXY', {
    'spriteIndex': spriteIndex,
    'x': Number(xpos),
    'y': Number(ypos)
  });
};

exports.playSound = function(id, soundName) {
  Studio.queueCmd(id, 'playSound', {'soundName': soundName});
};

exports.stop = function(id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {'spriteIndex': spriteIndex});
};

exports.throwProjectile = function(id, spriteIndex, dir, className) {
  Studio.queueCmd(id, 'throwProjectile', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir),
    'className': String(className)
  });
};

exports.makeProjectile = function(id, className, action) {
  Studio.queueCmd(id, 'makeProjectile', {
    'className': className,
    'action': action
  });
};

exports.move = function(id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir)
  });
};

exports.moveDistance = function(id, spriteIndex, dir, distance) {
  Studio.queueCmd(id, 'moveDistance', {
    'spriteIndex': spriteIndex,
    'dir': dir,
    'distance': distance
  });
};

// addPoints is a wrapper for changeScore (used by hoc2015)

exports.addPoints = function(id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

exports.removePoints = function(id, value) {
  Studio.queueCmd(id, 'reduceScore', {'value': value});
};

exports.changeScore = function(id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

exports.addCharacter = function(id, className) {
  Studio.queueCmd(id, 'addItem', {
    'className': className
  });
};

exports.setItemActivity = function(id, className, type) {
  Studio.queueCmd(id, 'setItemActivity', {
    'className': className,
    'type': type
  });
};

exports.setItemSpeed = function(id, className, speed) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': speed
  });
};

exports.moveFast = function(id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.FAST
  });
};

exports.moveNormal = function(id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.SLOW
  });
};

exports.moveSlow = function(id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.VERY_SLOW
  });
};

exports.showDebugInfo = function(value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    'value': value
  });
};

exports.setScoreText = function(id, text) {
  Studio.queueCmd(id, 'setScoreText', {'text': text});
};

exports.showCoordinates = function(id) {
  Studio.queueCmd(id, 'showCoordinates', {});
};

exports.wait = function(id, value) {
  Studio.queueCmd(id, 'wait', {'value': value});
};

exports.vanish = function (id, spriteIndex) {
  Studio.queueCmd(id, 'vanish', {spriteIndex: spriteIndex});
};

exports.onEvent = function (id, eventName, func) {
  Studio.queueCmd(id, 'onEvent', {
    'eventName': String(eventName),
    'func': func
  });
};

/**
 * @param {number} keyCode
 * @returns {boolean} True if key is currently down
 */
exports.isKeyDown = function (keyCode) {
  return Studio.keyState[keyCode] === 'keydown';
};


},{"./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/ThreeSliceAudio.js":[function(require,module,exports){
/** @file A three-part loopable audio effect (start-loop-end). */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');

var debugLogging = false;
function debug(msg) {
  if (debugLogging && console && console.info) {
    console.info('Audio: ' + msg);
  }
}

/** @enum {number} */
var PlaybackState = {
  NONE: 'none',
  BEGIN: 'begin',
  LOOP: 'loop',
  END: 'end'
};

/**
 * A loopable audio effect defined with three parts (start, middle, end) so that
 * you can get a smooth start/finish effect.
 *
 * Assumes the audio clips in question have already been preloaded by another
 * system.
 *
 * @param {AudioPlayer} audioPlayer
 * @param {Object} options
 * @param {string} [options.begin] - Audio clip name for start of sound.
 * @param {string} [options.loop] - Audio clip name for loopable part of sound.
 * @param {string} [options.end] - Audio clip name for end of sound.
 * @param {number} [options.volume] - Playback volume for the whole effect
 *        (applied to each individual clip), default to 1 which is normal gain.
 * @constructor
 */
var ThreeSliceAudio = function (audioPlayer, options) {
  options = utils.valueOr(options, {});
  /** @private {PlaybackState} */
  this.state_ = PlaybackState.NONE;

  /** @private {AudioPlayer} */
  this.audioPlayer_ = audioPlayer;

  /** @private {string} */
  this.beginClipName_ = options.begin;

  /** @private {string} */
  this.loopClipName_ = options.loop;

  /** @private {string} */
  this.endClipName_ = options.end;

  /** @private {number} */
  this.volume_ = utils.valueOr(options.volume, 1);
};
module.exports = ThreeSliceAudio;

/**
 * Turn on the audio effect, causing it to begin and then transition to the loop.
 * Will do nothing if the effect is already playing, so safe to call often (on
 * a key-repeat, for example).
 */
ThreeSliceAudio.prototype.on = function () {
  if (this.state_ === PlaybackState.NONE || this.state_ === PlaybackState.END) {
    debug('on');
    this.enterState_(PlaybackState.BEGIN);
  }
};

/**
 * Turn off the audio effect.  If the loop has not started yet (the sound is
 * still starting up) then it will just stop immediately.  If the loop has
 * started, the end effect will be played and then the audio will stop.
 */
ThreeSliceAudio.prototype.off = function () {
  debug('off');
  if (this.state_ === PlaybackState.BEGIN || this.state_ === PlaybackState.LOOP) {
    this.enterState_(PlaybackState.END);
  }
};

ThreeSliceAudio.prototype.enterState_ = function (state) {
  this.exitState_(this.state_);
  debug(this.state_ + ' -> ' + state);
  this.state_ = state;
  var callback = this.whenSoundStopped_.bind(this, state);
  if (state === PlaybackState.BEGIN) {
    if (this.beginClipName_) {
      this.audioPlayer_.play(this.beginClipName_, {
        volume: this.volume_,
        onEnded: callback
      });
    } else {
      this.enterState_(PlaybackState.LOOP);
    }
  } else if (state === PlaybackState.LOOP) {
    if (this.loopClipName_) {
      this.audioPlayer_.play(this.loopClipName_, {
        volume: this.volume_,
        loop: true,
        onEnded: callback
      });
    } else {
      this.enterState_(PlaybackState.END);
    }
  } else if (state === PlaybackState.END) {
    if (this.endClipName_) {
      this.audioPlayer_.play(this.endClipName_, {
        volume: this.volume_,
        onEnded: callback
      });
    } else {
      this.enterState_(PlaybackState.NONE);
    }
  }
};

ThreeSliceAudio.prototype.exitState_ = function (state) {
  if (state === PlaybackState.BEGIN && this.beginClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.beginClipName_);
  } else if (state === PlaybackState.LOOP && this.loopClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.loopClipName_);
  } else if (state === PlaybackState.END && this.endClipName_) {
    this.audioPlayer_.stopLoopingAudio(this.endClipName_);
  }
};

ThreeSliceAudio.prototype.whenSoundStopped_ = function (stoppedState) {
  debug('soundStopped (' + stoppedState + ')');
  if (stoppedState === PlaybackState.BEGIN && this.state_ === PlaybackState.BEGIN) {
    this.enterState_(PlaybackState.LOOP);
  } else if (stoppedState === PlaybackState.END && this.state_ === PlaybackState.END) {
    this.enterState_(PlaybackState.NONE);
  }
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/studio/MusicController.js":[function(require,module,exports){
/** @file The maestro! Helper that knows which music tracks can be played, and
 *        which one is playing now, and selects and plays them appropriately. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();

var debugLogging = false;
function debug(msg) {
  if (debugLogging && console && console.info) {
    console.info('MusicController: ' + msg);
  }
}

/**
 * @typedef {Object} MusicTrackDefinition
 * External track representation, used to define track info in skins.js.
 *
 * @property {string} name - corresponds to music filenames
 * @property {number} volume - on a 0..1 scale
 */

/**
 * @typedef {Object} MusicTrack
 * Internal track representation, includes track metadata and references to
 * loaded sound object.
 *
 * @property {string} name
 * @property {string[]} assetUrls
 * @property {number} volume
 * @property {Sound} sound
 * @property {boolean} isLoaded
 */

/**
 * A helper class that handles loading, choosing, playing and stopping
 * background music for Playlab.
 *
 * @param {AudioPlayer} audioPlayer - Reference to the Sounds object.
 * @param {function} assetUrl - Function for generating paths to static assets
 *        for the current skin.
 * @param {MusicTrackDefinition[]} [trackDefinitions] - List of music assets and
 *        general info about how they should be played. Can be omitted or empty
 *        if no music should be played.
 * @constructor
 */
var MusicController = function (audioPlayer, assetUrl, trackDefinitions) {
  /** @private {AudioPlayer} */
  this.audioPlayer_ = audioPlayer;

  /** @private {function} */
  this.assetUrl_ = assetUrl;

  /** @private {MusicTrack[]} */
  this.trackList_ = buildTrackData(trackDefinitions, assetUrl);

  /** @private {string} */
  this.nowPlaying_ = null;

  /** @private {string} Name of track to play on load */
  this.playOnLoad_ = null;

  // If the video player gets pulled up, make sure we stop the music.
  document.addEventListener('videoShown', function () {
    this.fadeOut();
  }.bind(this));

  debug('constructed');
};
module.exports = MusicController;

/**
 * Build up initial internal track metadata.
 * @param {MusicTrackDefinition[]} trackDefinitions
 * @param {function} assetUrl
 * @return {MusicTrack[]}
 */
function buildTrackData(trackDefinitions, assetUrl) {
  trackDefinitions = utils.valueOr(trackDefinitions, []);
  return trackDefinitions.map(function (trackDef) {
    return {
      name: trackDef.name,
      assetUrls: [ assetUrl(trackDef.name + '.mp3') ],
      volume: utils.valueOr(trackDef.volume, 1),
      sound: null,
      isLoaded: false
    };
  });
}

/**
 * Preload all music assets,
 */
MusicController.prototype.preload = function () {
  if (!this.audioPlayer_) {
    return;
  }

  this.trackList_.forEach(function (track) {
    track.sound = this.audioPlayer_.registerByFilenamesAndID(
        track.assetUrls, track.name);
    track.sound.onLoad = function () {
      debug('done loading ' + track.name);
      track.isLoaded = true;
      if (this.playOnLoad_ === track.name) {
        this.play(track.name);
      }
    }.bind(this);
  }, this);
};

/**
 * Begins playing a particular piece of music immediately.
 * @param {string} trackName
 */
MusicController.prototype.play = function (trackName) {
  debug('play ' + trackName);
  if (!this.audioPlayer_) {
    return;
  }

  var track;
  if (trackName) {
    track = this.getTrackByName_(trackName);
  } else {
    track = this.getRandomTrack_();
  }

  if (!track) {
    // No track to play - throw an exception?
    return;
  }

  if (track.sound && track.isLoaded) {
    debug('playing now');
    var callback = this.whenMusicStopped_.bind(this, track.name);
    track.sound.play({ volume: track.volume, onEnded: callback });
    this.nowPlaying_ = track.name;
  } else {
    debug('not done loading, playing after load');
    this.playOnLoad_ = track.name;
  }
};

/**
 * Stops playing whatever music is currently playing, immediately.
 */
MusicController.prototype.stop = function () {
  if (!this.nowPlaying_) {
    return;
  }

  var sound = this.audioPlayer_.get(this.nowPlaying_);
  if (sound) {
    sound.stop();
  }
};

/**
 * Fades music to nothing, then stops it.
 * @param {number} [durationSeconds] in seconds.  Default 3.
 */
MusicController.prototype.fadeOut = function (durationSeconds) {
  if (!this.nowPlaying_) {
    return;
  }

  durationSeconds = utils.valueOr(durationSeconds, 3);

  // Trigger a fade
  var sound = this.audioPlayer_.get(this.nowPlaying_);
  if (sound) {
    sound.fadeToGain(0, durationSeconds);
  }

  // Stop the audio after the fade.
  // Add a small margin due to poor fade granularity on fallback player.
  setTimeout(function () {
    this.stop();
  }.bind(this), 1000 * durationSeconds + 100);
};

/**
 * Callback for when music stops, to update internal state.
 * @param {string} musicName that was playing.  Should be bound when music
 *        is started.
 * @private
 */
MusicController.prototype.whenMusicStopped_ = function (musicName) {
  if (this.nowPlaying_ === musicName) {
    this.nowPlaying_ = null;
  }
};

/**
 * @param {string} name
 * @returns {MusicTrack|undefined}
 * @private
 */
MusicController.prototype.getTrackByName_ = function (name) {
  return _.find(this.trackList_, function (track) {
    return track.name === name;
  });
};

/**
 * @returns {MusicTrack|undefined}
 * @private
 */
MusicController.prototype.getRandomTrack_ = function () {
  return this.trackList_[Math.floor(Math.random(this.trackList_.length))];
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/studio/Item.js":[function(require,module,exports){
var Collidable = require('./collidable');
var constants = require('./constants');
var studioMsg = require('./locale');
var spriteActions = require('./spriteActions');
var Direction = constants.Direction;
var NextTurn = constants.NextTurn;
var utils = require('../utils');
var _ = utils.getLodash();
var StudioAnimation = require('./StudioAnimation');
var StudioSpriteSheet = require('./StudioSpriteSheet');

/**
 * An Item is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
var Item = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;

  this.spritesCounterclockwise = options.spritesCounterclockwise || false;

  /**
   * Rendering offset for item animation vs display position - applied as
   * late as possible.
   * @type {{x: number, y: number}}
   */
  this.renderOffset = options.renderOffset || { x: 0, y: 0 };

  this.speed = options.speed || constants.DEFAULT_ITEM_SPEED;
  this.displayDir = Direction.SOUTH;
  this.startFadeTime = null;
  this.fadeTime = constants.ITEM_FADE_TIME;

  /** @private {StudioAnimation} */
  this.animation_ = new StudioAnimation($.extend({}, options, {
    spriteSheet: new StudioSpriteSheet(options)
  }));
};
Item.inherits(Collidable);
module.exports = Item;

/** @returns {SVGImageElement} */
Item.prototype.getElement = function () {
  return this.animation_.getElement();
};

/**
 * Returns the frame of the spritesheet for the current walking direction.
 */
Item.prototype.getDirectionFrame = function() {

  // Every other frame, if we aren't yet rendering in the correct direction,
  // assign a new displayDir from state table; only one turn at a time.

  if (this.dir !== this.displayDir && this.displayDir !== undefined) {
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      this.displayDir = NextTurn[this.displayDir][this.dir];
    }
  }

  var frameDirTable = this.spritesCounterclockwise ? 
    constants.frameDirTableWalkingWithIdleCounterclockwise : 
    constants.frameDirTableWalkingWithIdleClockwise;

  return frameDirTable[this.displayDir];
};

/**
 * Create an image element with a clip path
 */
Item.prototype.createElement = function (parentElement) {
  this.animation_.createElement(parentElement);
};


/**
 * This function should be called every frame, and moves the item around.
 * It moves the item smoothly, but between fixed points on the grid.
 * Each time the item reaches its destination fixed point, it reevaluates
 * its next destination location based on the type of movement specified.
 * It generally evalutes all possible destination locations, prioritizes
 * the best possible moves, and chooses randomly between evenly-scored
 * options.
 */
Item.prototype.update = function () {
  
  // Do we have an active location in grid coords?  If not, determine it.
  if (this.gridX === undefined) {
    this.gridX = Math.floor(this.x / Studio.SQUARE_SIZE);
    this.gridY = Math.floor(this.y / Studio.SQUARE_SIZE);
  }

  // Have we reached the destination grid position?
  // If not, we're still sliding towards it.
  var reachedDestinationGridPosition = false;

  // Draw the item's current location.
  Studio.drawDebugRect("itemCenter", this.x, this.y, 3, 3);

  // In this stationary activity case, we don't need to do any of this
  // update logic (facing the actor is handled every frame in display())
  if (this.activity === 'watchActor') {
    return;
  }

  if (this.destGridX !== undefined) {
    // Draw the item's destination grid square.
    Studio.drawDebugRect(
      "roamGridDest", 
      this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
      Studio.SQUARE_SIZE, 
      Studio.SQUARE_SIZE);
  }

  // Has the item reached its destination grid position?
  // (There is a small margin of error to allow for per-update movements greater
  // than a single pixel.)
  var speed = utils.valueOr(this.speed, 0);
  if (this.destGridX !== undefined &&
      (Math.abs(this.x - (this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) <= speed &&
       Math.abs(this.y - (this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE)) <= speed)) {
    this.gridX = this.destGridX;
    this.gridY = this.destGridY;
    reachedDestinationGridPosition = true;
  }

  // Are we missing a destination location in grid coords?
  // Or have we already reached our prior destination location in grid coords?
  // If not, determine it.
  if (this.destGridX === undefined || reachedDestinationGridPosition) {

    if (this.activity === 'none') {
      this.dir = Direction.NONE;
      this.destGridX = undefined;
      this.destGridY = undefined;
      return;
    }

    var sprite = Studio.sprite[0];

    var spriteX = sprite.x + sprite.width/2;
    var spriteY = sprite.y + sprite.height/2;

    // let's try scoring each square
    var candidates = [];

    var bufferDistance = 60;

    // The item can just go up/down/left/right.. no diagonals.
    var candidateGridLocations = [ 
      {row: -1, col: 0}, 
      {row: +1, col: 0},
      {row: 0, col: -1}, 
      {row: 0, col: +1}];

    for (var candidateIndex = 0; candidateIndex < candidateGridLocations.length; candidateIndex++) {
      var candidateX = this.gridX + candidateGridLocations[candidateIndex].col;
      var candidateY = this.gridY + candidateGridLocations[candidateIndex].row;

      candidate = {gridX: candidateX, gridY: candidateY};
      candidate.score = 0;

      if (this.activity === "roam") {
        candidate.score ++;
      } else if (this.activity === "chase") {
        if (candidateY == this.gridY - 1 && spriteY < this.y - bufferDistance) {
          candidate.score += 2;
        } else if (candidateY == this.gridY + 1 && spriteY > this.y + bufferDistance) {
          candidate.score += 2;
        }
        else {
          candidate.score += 1;
        }

        if (candidateX == this.gridX - 1 && spriteX < this.x - bufferDistance) {
          candidate.score ++;
        } else if (candidateX == this.gridX + 1 && spriteX > this.x + bufferDistance) {
          candidate.score ++;
        }
      } else if (this.activity === "flee") {
        candidate.score = 1;
        if (candidateY == this.gridY - 1 && spriteY > this.y - bufferDistance) {
          candidate.score ++;
        } else if (candidateY == this.gridY + 1 && spriteY < this.y + bufferDistance) {
          candidate.score ++;
        }

        if (candidateX == this.gridX - 1 && spriteX > this.x - bufferDistance) {
          candidate.score ++;
        } else if (candidateX == this.gridX + 1 && spriteX < this.x + bufferDistance) {
          candidate.score ++;
        }
      }

      if (candidate.score > 0) {
        Studio.drawDebugRect(
          "roamGridPossibleDest", 
          candidateX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
          candidateY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE, 
          Studio.SQUARE_SIZE, 
          Studio.SQUARE_SIZE);
      }
      candidates.push(candidate);
    }

    // cull candidates that won't be possible
    for (var i = candidates.length-1; i >= 0; i--) {
      var candidate = candidates[i];
      var atEdge = candidate.gridX < 0 || candidate.gridX >= Studio.COLS ||
                   candidate.gridY < 0 || candidate.gridY >= Studio.ROWS;
      var hasWall = !atEdge && Studio.getWallValue(candidate.gridY, candidate.gridX);
      if (atEdge || hasWall || candidate.score === 0) {
        candidates.splice(i, 1);
      }
    }

    if (candidates.length > 0) {
      // shuffle everything (so that even scored items are shuffled, even after the sort)
      candidates = _.shuffle(candidates);

      // then sort everything based on score.
      candidates.sort(function (a, b) {
        return b.score - a.score;
      });

      this.destGridX = candidates[0].gridX;
      this.destGridY = candidates[0].gridY;

      // update towards the next location
      if (this.destGridX > this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHEAST;
      } else if (this.destGridX > this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHEAST;
      } else if (this.destGridX < this.gridX && this.destGridY > this.gridY) {
        this.dir = Direction.SOUTHWEST;
      } else if (this.destGridX < this.gridX && this.destGridY < this.gridY) {
        this.dir = Direction.NORTHWEST;
      } else if (this.destGridX > this.gridX) {
        this.dir = Direction.EAST;
      } else if (this.destGridX < this.gridX) {
        this.dir = Direction.WEST;
      } else if (this.destGridY > this.gridY) {
        this.dir = Direction.SOUTH;
      } else if (this.destGridY < this.gridY) {
        this.dir = Direction.NORTH;
      } else {
        this.dir = Direction.NONE;
      }
    } else {
      this.dir = Direction.NONE;
    }
  }
};

/**
 * Isolated update logic for "watchActor" activity where the "item" keeps
 * turning to look at the actor with the given sprite index.
 * @param {number} targetSpriteIndex
 */
Item.prototype.turnToFaceActor = function (targetSpriteIndex) {
  // Pick a target direction closest to the relative direction toward the target.
  var target = Studio.sprite[targetSpriteIndex];
  if (!target) {
    return;
  }

  // Actor positions are the top-left of their square (or their "feet" square
  // in the 'isometric' case) - we should look at the middle of their square
  var actorGroundCenterX = target.displayX + Studio.HALF_SQUARE;
  var actorGroundCenterY = target.displayY + Studio.HALF_SQUARE;
  var deltaX = actorGroundCenterX - this.x;
  var deltaY = actorGroundCenterY - this.y;

  // We shouldn't adjust our direction if the actor is sufficiently close that
  // relative direction doesn't make much sense
  // Basically, avoid thrashing when moving into their space.
  var SQUARED_MINIMUM_DISTANCE = 25;
  if (deltaX * deltaX + deltaY * deltaY > SQUARED_MINIMUM_DISTANCE) {
    Studio.drawDebugLine("watchActor", this.x, this.y, actorGroundCenterX, actorGroundCenterY, '#ffff00');
    this.dir = constants.getClosestDirection(deltaX, deltaY);
  }
};

/**
 * Begin a fade out.
 */
Item.prototype.beginRemoveElement = function () {
  this.startFadeTime = new Date().getTime();
};

/**
 * Remove our element/clipPath/animator
 */
Item.prototype.removeElement = function() {
  this.animation_.removeElement();
  Studio.trackedBehavior.removedItemCount++;
};

/**
 * Stop our animations
 */
Item.prototype.stopAnimations = function() {
  this.animation_.stopAnimator();
};

/**
 * Returns true if the item is currently fading away.
 */
Item.prototype.isFading = function() {
  return !!this.startFadeTime;
};


/**
 * Returns true if the item has finished fading away.  The caller will usually
 * then call removeElement to destroy this item's assets.
 */
Item.prototype.hasCompletedFade = function() {
  var currentTime = new Date().getTime();

  return this.startFadeTime && currentTime > this.startFadeTime + this.fadeTime;
};

/**
 * Display our item at its current location
 */
Item.prototype.display = function () {
  var currentTime = new Date().getTime();
  var opacity = 1;
  if (this.startFadeTime) {
    opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
    opacity = Math.max(opacity, 0);
    this.animation_.setOpacity(opacity);
  }

  // Watch behavior does not change logical position, should update every frame
  if (this.activity === "watchActor") {
    this.turnToFaceActor(Studio.protagonistSpriteIndex || 0);
  }

  this.animation_.setCurrentAnimation(this.getDirectionFrame());
  this.animation_.redrawCenteredAt({
    x: this.x + this.renderOffset.x,
    y: this.y + this.renderOffset.y
  });
};

Item.prototype.getNextPosition = function () {
  var unit = Direction.getUnitVector(this.dir);
  var speed = this.speed;
  // TODO: Better concept of which actions actually move the actor
  // Projected position should not be in front of you if you are not moving!
  if (this.activity === "none" || this.activity === "watchActor") {
    speed = 0;
  }
  return {
    x: this.x + speed * unit.x,
    y: this.y + speed * unit.y
  };
};

Item.prototype.moveToNextPosition = function () {
  var next = this.getNextPosition();
  this.x = next.x;
  this.y = next.y;
};

/**
 * Mark that we're colliding with object represented by key.
 * Here, override base implemention to special on-collision logic for certain
 * item classes.
 * @param key A unique key representing the object we're colliding with
 * @returns {boolean} True if collision is started, false if we're already colliding
 * @override
 */
Item.prototype.startCollision = function (key) {
  var newCollisionStarted = Item.superPrototype.startCollision.call(this, key);
  if (newCollisionStarted) {
    if (this.isHazard && key === (Studio.protagonistSpriteIndex || 0)) {
      Studio.trackedBehavior.touchedHazardCount++;
      var actor = Studio.sprite[key];
      if (actor) {
        actor.addAction(new spriteActions.ShakeActor(constants.TOUCH_HAZARD_EFFECT_TIME));
      }
    }
  }
  return newCollisionStarted;
};

/**
 * Change visible opacity of this item.
 * @param {number} newOpacity (between 0 and 1)
 * @override
 */
Item.prototype.setOpacity = function (newOpacity) {
  this.animation_.setOpacity(newOpacity);
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./StudioAnimation":"/home/ubuntu/staging/apps/build/js/studio/StudioAnimation.js","./StudioSpriteSheet":"/home/ubuntu/staging/apps/build/js/studio/StudioSpriteSheet.js","./collidable":"/home/ubuntu/staging/apps/build/js/studio/collidable.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js","./locale":"/home/ubuntu/staging/apps/build/js/studio/locale.js","./spriteActions":"/home/ubuntu/staging/apps/build/js/studio/spriteActions.js"}],"/home/ubuntu/staging/apps/build/js/studio/spriteActions.js":[function(require,module,exports){
/** @file Actions that can be given to a playlab sprite to execute over a set time. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var constants = require('./constants');
var Direction = constants.Direction;

/**
 * Work/animation for a sprite to do that will require more than one tick/frame.
 *
 * See Collidable#queueAction and Collidable#updateActions for usage.
 *
 * Note: All sprite actions must, for now, be able to complete in a provided
 * number of steps/frames, instead of blocking until they complete.  The latter
 * is a larger change that we'll save until later.
 *
 * @interface SpriteAction
 */

/**
 * Perform one tick/frame step of the action on the given sprite.
 *
 * @function
 * @name SpriteAction#update
 * @param {Collidable} sprite - the sprite the action is being performed on
 */

/**
 * Perform one tick/frame step of the action on the given sprite.
 *
 * @function
 * @name SpriteAction#isDone
 * @returns {boolean} whether the action is finished running.
 */

/**
 * Move sprite by a desired delta over a certain number of steps/ticks.
 * Used to provide discrete grid movement in playlab's continuous interpreted
 * environment.
 * @constructor
 * @implements {SpriteAction}
 * @param {number} towardDeltaX
 * @param {number} towardDeltaY
 * @param {number} totalSteps
 */
exports.GridMove = function (towardDeltaX, towardDeltaY, totalSteps) {
  this.towardDeltaX_ = towardDeltaX;
  this.towardDeltaY_ = towardDeltaY;
  this.totalSteps_ = totalSteps;
  this.elapsedSteps_ = 0;

  /** @private {number} How much of the full distance to travel. */
  this.percentBeforeReverse_ = 0.3;
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.GridMove.prototype.update = function (sprite) {
  // Logically snap the sprite to its final position on the first frame,
  // the interpolation is for display only.
  if (this.elapsedSteps_ === 0) {
    this.startX_ = sprite.x;
    this.startY_ = sprite.y;
    sprite.x += this.towardDeltaX_;
    sprite.y += this.towardDeltaY_;
  }
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  sprite.displayX = this.startX_ + this.towardDeltaX_ * normalizedProgress;
  sprite.displayY = this.startY_ + this.towardDeltaY_ * normalizedProgress;
  sprite.dir = getDirection(this.towardDeltaX_, this.towardDeltaY_);
  this.elapsedSteps_++;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          animation is complete, based on the number of steps that have
 *          elapsed.
 */
exports.GridMove.prototype.isDone = function () {
  return this.elapsedSteps_ >= this.totalSteps_;
};

/**
 * Move sprite partway toward a desired destination position, but have it
 * stop and reverse to its original position after a moment, as if it was
 * bouncing off a wall.
 * @constructor
 * @implements {SpriteAction}
 * @param {number} towardDeltaX - the relative target X position, if the motion
 *        was completed instead of cancelled (e.g. one grid-space away).
 * @param {number} towardDeltaY - as above.
 * @param {number} totalSteps - the number of steps (or frames) to take for the
 *        animation.
 */
exports.GridMoveAndCancel = function (towardDeltaX, towardDeltaY, totalSteps) {
  this.towardDeltaX_ = towardDeltaX;
  this.towardDeltaY_ = towardDeltaY;
  this.totalSteps_ = totalSteps;
  this.elapsedSteps_ = 0;

  /** @private {number} How much of the full distance to travel. */
  this.percentBeforeReverse_ = 0.3;
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.GridMoveAndCancel.prototype.update = function (sprite) {
  // Note: The sprite's logical position (sprite.x, sprite.y) never changes
  //       for this action.
  var normalizedProgress = (this.elapsedSteps_ + 1) / this.totalSteps_;
  var percentOffset = (2 * this.percentBeforeReverse_) *
      (normalizedProgress < 0.5 ? normalizedProgress : (1 - normalizedProgress));
  sprite.displayX = sprite.x + this.towardDeltaX_ * percentOffset;
  sprite.displayY = sprite.y + this.towardDeltaY_ * percentOffset;
  sprite.dir = getDirection(this.towardDeltaX_, this.towardDeltaY_);
  // Could do a forced reversal of animation here, depends on how it looks
  // with the real assets.
  this.elapsedSteps_++;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          animation is complete, based on the number of steps that have
 *          elapsed.
 */
exports.GridMoveAndCancel.prototype.isDone = function () {
  return this.elapsedSteps_ >= this.totalSteps_;
};

/**
 * Given a 2D vector (x and y) provides the approximate animation direction
 * given in our Direction enum.  Does not calculate 'closest' direction or
 * anything like that - you'll always get a diagonal if both x and y are nonzero.
 * @param {number} x
 * @param {number} y
 * @returns {Direction}
 */
function getDirection(x, y) {
  var dir = Direction.NONE;
  if (x < 0) {
    dir |= Direction.WEST;
  } else if (x > 0) {
    dir |= Direction.EAST;
  }
  if (y < 0) {
    dir |= Direction.NORTH;
  } else if (y > 0) {
    dir |= Direction.SOUTH;
  }
  return dir;
}

/**
 * Fade an actor out to nothing.
 * @param {number} [fadeDuration] how long it should take to fade out, in
 *        milliseconds.  Default to 1 second.
 * @constructor
 * @implements {SpriteAction}
 */
exports.FadeActor = function (fadeDuration) {
  /** @private {number} */
  this.startFadeTime_ = null;

  /** @private {number} */
  this.fadeDurationMs_ = utils.valueOr(fadeDuration, constants.DEFAULT_ACTOR_FADE_TIME);
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.FadeActor.prototype.update = function (sprite) {
  if (!this.startFadeTime_) {
    // First frame of fade
    this.startFadeTime_ = new Date().getTime();
  }

  var currentTime = new Date().getTime();
  var opacity = 1 - (currentTime - this.startFadeTime_) / this.fadeDurationMs_;
  opacity = Math.max(opacity, 0);
  sprite.setOpacity(opacity);
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          fade is complete, based on the elapsed time.
 */
exports.FadeActor.prototype.isDone = function () {
  var currentTime = new Date().getTime();
  return this.startFadeTime_ && currentTime > this.startFadeTime_ + this.fadeDurationMs_;
};

/**
 * Shake an actor left and right for a moment.
 * @param {number} [shakeDuration] how long it should take to fade out, in
 *        milliseconds.  Default to 1 second.
 * @constructor
 * @implements {SpriteAction}
 */
exports.ShakeActor = function (shakeDuration) {
  /** @private {number} */
  this.startShakeTime_ = null;

  /** @private {number} How long to shake, in milliseconds */
  this.shakeDurationMs_ = utils.valueOr(shakeDuration,
      constants.SHAKE_DEFAULT_DURATION);

  /** @private {number} How many complete back-and-forth shakes occur */
  this.cycleCount_ = constants.SHAKE_DEFAULT_CYCLES;

  /** @private {number} max shake distance from real position */
  this.amplitude_ = constants.SHAKE_DEFAULT_DISTANCE;

  /** @private {number} precalculated angular frequency of sine wave equation. */
  this.angularFrequency_ = 2 * Math.PI * (this.cycleCount_ / this.shakeDurationMs_);
};

/**
 * Apply a single frame of change to the given sprite.
 * @param {Collidable} sprite
 */
exports.ShakeActor.prototype.update = function (sprite) {
  if (!this.startShakeTime_) {
    // First frame of fade
    this.startShakeTime_ = new Date().getTime();
  }

  var elapsedTime = new Date().getTime() - this.startShakeTime_;
  var offset = this.amplitude_ * Math.sin(this.angularFrequency_ * elapsedTime);

  sprite.displayX = sprite.x + offset;
};

/**
 * @returns {boolean} whether the action is done; in this case, whether the
 *          fade is complete, based on the elapsed time.
 */
exports.ShakeActor.prototype.isDone = function () {
  var currentTime = new Date().getTime();
  return this.startShakeTime_ &&
      currentTime > this.startShakeTime_ +this.shakeDurationMs_;
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/locale.js":[function(require,module,exports){
// locale for studio

module.exports = window.blockly.studio_locale;


},{}],"/home/ubuntu/staging/apps/build/js/studio/collidable.js":[function(require,module,exports){
/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var Direction = require('./constants').Direction;
var constants = require('./constants');
var SquareType = constants.SquareType;

//
// Collidable constructor
//
// opts.image (URL)
// opts.width (pixels)
// opts.height (pixels)
// opts.x
// opts.y
// opts.dir (direction)
// opts.speed (speed)
// opts.frames
//

var Collidable = function (opts) {
  this.gridX = undefined;
  this.gridY = undefined;

  this.activity = "none";

  for (var prop in opts) {
    this[prop] = opts[prop];
  }
  this.visible = this.visible || true;
  this.flags = 0;
  // hash table of other sprites we're currently colliding with
  this.collidingWith_ = {};

  // default num frames is 1
  this.frames = this.frames || 1;

  /** @private {SpriteAction[]} */
  this.actions_ = [];
};

module.exports = Collidable;

/**
 * Clear all current collisions
 */
Collidable.prototype.clearCollisions = function () {
  this.collidingWith_ = {};
};

/**
 * Mark that we're colliding with object represented by key
 * @param key A unique key representing the object we're colliding with
 * @returns {boolean} True if collision is started, false if we're already colliding
 */
Collidable.prototype.startCollision = function (key) {
  if (this.isCollidingWith(key)) {
    return false;
  }

  this.collidingWith_[key] = true;
  return true;
};

/**
 * Mark that we're no longer colliding with object represented by key
 * @param key A unique key representing the object we're querying
 */
Collidable.prototype.endCollision = function (key) {
  this.collidingWith_[key] = false;
};

/**
 * Are we colliding with the object represented by key?
 * @param key A unique key representing the object we're querying
 */
Collidable.prototype.isCollidingWith = function (key) {
  return this.collidingWith_[key] === true;
};

Collidable.prototype.bounce = function () {
  switch (this.dir) {
    case Direction.NORTH:
      this.dir = Direction.SOUTH;
      break;
    case Direction.WEST:
      this.dir = Direction.EAST;
      break;
    case Direction.SOUTH:
      this.dir = Direction.NORTH;
      break;
    case Direction.EAST:
      this.dir = Direction.WEST;
      break;
    case Direction.NORTHEAST:
      this.dir = Direction.SOUTHWEST;
      break;
    case Direction.SOUTHEAST:
      this.dir = Direction.NORTHWEST;
      break;
    case Direction.SOUTHWEST:
      this.dir = Direction.NORTHEAST;
      break;
    case Direction.NORTHWEST:
      this.dir = Direction.SOUTHEAST;
      break;
  }
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Collidable.prototype.setActivity = function(type) {
  this.activity = type;
};

/**
 * Assumes x/y are center coords (true for projectiles and items)
 * outOfBounds() returns true if the object is entirely "off screen"
 */
Collidable.prototype.outOfBounds = function () {
  return (this.x < -(this.width / 2)) ||
         (this.x > studioApp.MAZE_WIDTH + (this.width / 2)) ||
         (this.y < -(this.height / 2)) ||
         (this.y > studioApp.MAZE_HEIGHT + (this.height / 2));
};

/**
 * Add an action (probably an animation) for this sprite to run.
 * Note: This is a 'sprouted' new system for updating sprites, separate from
 *       how older playlab stuff works.  For now it's driving the discrete
 *       movement hoc2015 levels.
 * @param {SpriteAction} action
 */
Collidable.prototype.addAction = function (action) {
  this.actions_.push(action);
};

/**
 * @returns {boolean} whether this sprite is currently running any actions.
 */
Collidable.prototype.hasActions = function () {
  return this.actions_.length > 0;
};

/**
 * Causes this sprite to update all actions it's currently running, and then
 * remove any that are complete.
 */
Collidable.prototype.updateActions = function () {
  this.actions_.forEach(function (action) {
    action.update(this);
  }, this);

  // Splice completed actions out of the current action list, iterating
  // backwards so we don't skip anything.
  for (var i = this.actions_.length - 1; i >= 0; i--) {
    if (this.actions_[i].isDone()) {
      this.actions_.splice(i, 1);
    }
  }
};

/**
 * Change visible opacity of this collidable sprite.
 * @param {number} newOpacity (between 0 and 1)
 */
Collidable.prototype.setOpacity = function (newOpacity) {
  var spriteIndex = Studio.sprite.indexOf(this);
  if (spriteIndex < 0) {
    return;
  }

  var spriteRegularIcon = document.getElementById('sprite' + spriteIndex);
  var spriteWalkIcon = document.getElementById('spriteWalk' + spriteIndex);
  if (spriteRegularIcon) {
    spriteRegularIcon.setAttribute('opacity', newOpacity);
  }
  if (spriteWalkIcon) {
    spriteWalkIcon.setAttribute('opacity', newOpacity);
  }
};


},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/StudioSpriteSheet.js":[function(require,module,exports){
/** @file A utility that can help find particular frames within a spritesheet,
 * given certain metadata about that spritesheet */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');

/**
 * Provider of metadata about a particular sprite sheet, to help find frames
 * within it.
 *
 * Assumptions:
 * All frames are the same size, and are arranged in a grid.
 * All animations are the same number of frames.
 * Each animation is a single column or a single row
 *
 * @constructor
 * @param {!Object} options
 * @param {!string} options.image - URL of the sprite sheet asset.
 * @param {number} [options.width] - frame width in original asset.  Default 50.
 * @param {number} [options.height] - frame height in original asset. Default 50.
 * @param {number} [options.totalAnimations] - How many animations (columns)
 *        there are in the sprite sheet. Default 9.
 * @param {number} [options.frames] - How many frames (rows) there are per
 *        animation. Default 1.
 * @param {boolean} [options.horizontalAnimation] - If animation frames run in
 *        rows instead of columns.
 */
var StudioSpriteSheet = module.exports = function (options) {
  /** @type {string} spritesheet asset path */
  this.assetPath = options.image;

  /** @type {number} */
  this.frameWidth = utils.valueOr(options.width, 50); // TODO: Magic Number

  /** @type {number} */
  this.frameHeight = utils.valueOr(options.height, 50); // TODO: Magic Number

  /** @type {number} animations in sheet / width in frames of sprite sheet */
  this.totalAnimations = utils.valueOr(options.totalAnimations, 9);

  /** @type {number} frames per animation / height in frames of sprite sheet */
  this.framesPerAnimation = utils.valueOr(options.frames, 1);

  /** @type {boolean} Whether animation frames run in rows, not columns */
  this.horizontalAnimation = utils.valueOr(options.horizontalAnimation, false);
};

/** @return {number} original height of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetWidth = function () {
    return this.frameWidth * (this.horizontalAnimation ?
            this.framesPerAnimation : this.totalAnimations);
};

/** @return {number} original width of the whole sprite sheet. */
StudioSpriteSheet.prototype.assetHeight = function () {
  return this.frameHeight * (this.horizontalAnimation ?
          this.totalAnimations : this.framesPerAnimation);
};

/**
 * Get the framing rect for a particular animation and frame within the
 * sprite sheet.
 * @param {number} animationIndex - Which animation to look up.
 * @param {number} frameIndex - Which frame in the animation to look up.
 * @returns {Object} a frame rect at spritesheet scale relative to the sheet's
 *          top-left corner.
 */
StudioSpriteSheet.prototype.getFrame = function (animationIndex, frameIndex) {
  var x = this.frameWidth * (this.horizontalAnimation ? frameIndex : animationIndex);
  var y = this.frameHeight * (this.horizontalAnimation ? animationIndex : frameIndex);
  return {
    x: x,
    y: y,
    width: this.frameWidth,
    height: this.frameHeight,
    top: y,
    left: x,
    right: x + this.frameWidth,
    bottom: y + this.frameHeight
  };
};


},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/studio/StudioAnimation.js":[function(require,module,exports){
/** @file An animated image, which handles frame counts, rates and offsets
 * internally and exposes simple methods for rendering at the desired position. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var constants = require('./constants');

// Unique element ID that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * A StudioAnimation represents an animation asset that can be created,
 * positioned and rendered by other code.  It tries to hide away all the
 * details of actually rendering the correct frame at the correct offset
 * and advancing frames at the correct rate.
 * @constructor
 * @param {!Object} options
 * @param {!StudioSpriteSheet} spriteSheet - The source asset for this animation,
 *        wrapped in necessary metadata.
 * @param {number} [options.renderScale] - Default 1.
 * @param {number} [options.opacity] - Opacity on a 0-1 scale.  Default 1.
 * @param {number} [options.animationRate] - How fast the animation should be
 *        played, in frames per second.  Default 20.
 * @param {boolean} [options.loop] - Whether the animation should loop
 *        automatically.  Default false.
 */
var StudioAnimation = module.exports = function (options) {
  /** @private {StudioSpriteSheet} */
  this.spriteSheet_ = options.spriteSheet;

  /** @private {number} render scale */
  this.renderScale_ = utils.valueOr(options.renderScale, 1);

  /** @private {number} opacity on a scale of 0 (transparent) to 1 (opaque) */
  this.opacity_ = utils.valueOr(options.opacity, 1);

  /**
   * Which animation (which column in the sprite sheet) is currently playing.
   * @private {number}
   */
  this.currentAnimation_ = 0;

  /** @private {number} index of current frame in the current animation. */
  this.currentFrame_ = 0;

  /** @private {boolean} whether the animation should loop automatically. */
  this.loop_ = utils.valueOr(options.loop, false);

  /** @private {SVGImageElement} */
  this.element_ = null;

  /** @private {SVGElement} */
  this.clipPath_ = null;

  // Setting the animation rate here initializes the setInterval that keeps
  // the current frame changing at the framerate.
  this.setAnimationRate(utils.valueOr(options.animationRate,
      constants.DEFAULT_ANIMATION_RATE));
};

/**
 * Test only function so that we can start our id count over.
 */
StudioAnimation.__resetIds = function () {
  uniqueId = 0;
};

/** @returns {SVGImageElement} */
StudioAnimation.prototype.getElement = function () {
  return this.element_;
};

/**
 * Create an image element with a clip path
 */
StudioAnimation.prototype.createElement = function (parentElement) {
  var nextId = (uniqueId++);

  // create our clipping path/rect
  this.clipPath_ = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'studioanimation_clippath_' + nextId;
  this.clipPath_.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.spriteSheet_.frameWidth * this.renderScale_);
  rect.setAttribute('height', this.spriteSheet_.frameHeight * this.renderScale_);
  this.clipPath_.appendChild(rect);
  parentElement.appendChild(this.clipPath_);

  var itemId = 'studioanimation_' + nextId;
  this.element_ = document.createElementNS(SVG_NS, 'image');
  this.element_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
     this.spriteSheet_.assetPath);
  this.element_.setAttribute('id', itemId);
  this.element_.setAttribute('height',
      this.spriteSheet_.assetHeight() * this.renderScale_);
  this.element_.setAttribute('width',
      this.spriteSheet_.assetWidth() * this.renderScale_);
  parentElement.appendChild(this.element_);

  this.element_.setAttribute('clip-path', 'url(#' + clipId + ')');
};

/**
 * Remove our element/clipPath/animator
 */
StudioAnimation.prototype.removeElement = function() {

  if (this.element_) {
    this.element_.parentNode.removeChild(this.element_);
    this.element_ = null;
  }

  // remove clip path element
  if (this.clipPath_) {
    this.clipPath_.parentNode.removeChild(this.clipPath_);
    this.clipPath_ = null;
  }

  this.stopAnimator();
};

/**
 * Stop the animator (used when we freeze in onPuzzleComplete)
 */
StudioAnimation.prototype.stopAnimator = function() {
  if (this.animator_) {
    window.clearInterval(this.animator_);
    this.animator_ = null;
  }
};

/**
 * Display the current frame at the given location
 */
StudioAnimation.prototype.redrawCenteredAt = function (center) {
  var frame = this.spriteSheet_.getFrame(this.currentAnimation_, this.currentFrame_);
  var scale = this.renderScale_;

  // Preserved behavior: When scaling a sprite up, we actually scale around the
  //       bottom-center of the sprite (so feet stay planted in the same place)
  //       rather than actually around its center.
  //       That's what the (2 * scale - 1) bit is about; just change that to
  //       (scale) if you want to scale about the sprite center again.
  // TODO: Improve this by scaling around an explicitly encoded 'sprite center'
  var topLeft = {
    x: center.x - (frame.width / 2) * scale,
    y: center.y - (frame.height / 2) * (2 * scale - 1)
  };

  // Offset the spritesheet DOM element by the inverse of the offset of the
  // frame we want to display.
  this.element_.setAttribute('x', topLeft.x - frame.left * scale);
  this.element_.setAttribute('y', topLeft.y - frame.top * scale);
  this.element_.setAttribute('opacity', this.opacity_);

  // Then set the clip rect to the position where we want to display it, so
  // only the frame that's now positioned correctly is shown.
  var clipRect = this.clipPath_.childNodes[0];
  clipRect.setAttribute('x', topLeft.x);
  clipRect.setAttribute('y', topLeft.y);
};

/**
 * Sets which animation to play out of the sprite sheet.
 * Animations are indexed by their position in the sprite sheet, where each
 * animation is its own column and animation zero is the far-left column.
 * @param {!number} animationIndex
 */
StudioAnimation.prototype.setCurrentAnimation = function (animationIndex) {
  this.currentAnimation_ = animationIndex;
};

/**
 * Set the animation rate for this item's sprite.
 * @param {number} framesPerSecond
 */
StudioAnimation.prototype.setAnimationRate = function (framesPerSecond) {
  if (this.animator_) {
    window.clearInterval(this.animator_);
  }
  this.animator_ = window.setInterval(function () {
    if (this.loop_ || this.currentFrame_ + 1 < this.spriteSheet_.framesPerAnimation) {
      this.currentFrame_ = (this.currentFrame_ + 1) %
          this.spriteSheet_.framesPerAnimation;
    }
  }.bind(this), Math.round(1000 / framesPerSecond));
};

/**
 * Change visible opacity of this animation..
 * @param {number} newOpacity (between 0 and 1)
 */
StudioAnimation.prototype.setOpacity = function (newOpacity) {
  this.opacity_ = newOpacity;
};


},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./constants":"/home/ubuntu/staging/apps/build/js/studio/constants.js"}],"/home/ubuntu/staging/apps/build/js/studio/constants.js":[function(require,module,exports){
'use strict';

exports.SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  LITTLE_SLOW: 4,
  NORMAL: 5,
  LITTLE_FAST: 6,
  FAST: 8,
  VERY_FAST: 12,
};

exports.SpriteSize = {
  VERY_SMALL: 0.5,
  SMALL: 0.75,
  NORMAL: 1,
  LARGE: 1.5,
  VERY_LARGE: 2
};

exports.Direction = {
  NONE: 0,
  NORTH: 1,
  EAST: 2,
  SOUTH: 4,
  WEST: 8,
  NORTHEAST: 3,
  SOUTHEAST: 6,
  SOUTHWEST: 12,
  NORTHWEST: 9
};

var Dir = exports.Direction;

/**
 * Mapping number of steps away from north to direction enum.
 * @type {Direction[]}
 */
exports.ClockwiseDirectionsFromNorth = [
  Dir.NORTH,
  Dir.NORTHEAST,
  Dir.EAST,
  Dir.SOUTHEAST,
  Dir.SOUTH,
  Dir.SOUTHWEST,
  Dir.WEST,
  Dir.NORTHWEST
];

/**
 * Given a 2D vector (x and y) provides the closest animation direction
 * given in our Direction enum.
 * @param {number} x
 * @param {number} y
 * @returns {Direction}
 */
exports.getClosestDirection = function (x, y) {
  // Y is inverted between our playlab coordinate space and what atan2 expects.
  var radiansFromNorth = Math.atan2(x, -y);
  var stepRadians = Math.PI / 4;
  // Snap positive index of nearest 45° where 0 is North, 1 is NE, etc...
  var stepsFromNorth = (Math.round(radiansFromNorth / stepRadians) + 8) % 8;
  // At this point we should have an int between 0 and 7
  return exports.ClockwiseDirectionsFromNorth[stepsFromNorth];
};

var frameDirTable = {};
frameDirTable[Dir.SOUTHEAST]  = 0;
frameDirTable[Dir.EAST]       = 1;
frameDirTable[Dir.NORTHEAST]  = 2;
frameDirTable[Dir.NORTH]      = 3;
frameDirTable[Dir.NORTHWEST]  = 4;
frameDirTable[Dir.WEST]       = 5;
frameDirTable[Dir.SOUTHWEST]  = 6;

exports.frameDirTable = frameDirTable;

var frameDirTableWalking = {};
frameDirTableWalking[Dir.NONE]       = 0;
frameDirTableWalking[Dir.SOUTH]      = 0;
frameDirTableWalking[Dir.SOUTHEAST]  = 1;
frameDirTableWalking[Dir.EAST]       = 2;
frameDirTableWalking[Dir.NORTHEAST]  = 3;
frameDirTableWalking[Dir.NORTH]      = 4;
frameDirTableWalking[Dir.NORTHWEST]  = 5;
frameDirTableWalking[Dir.WEST]       = 6;
frameDirTableWalking[Dir.SOUTHWEST]  = 7;

exports.frameDirTableWalking = frameDirTableWalking;


// Forward-to-left (clockwise)
var frameDirTableWalkingWithIdleClockwise = {};
frameDirTableWalkingWithIdleClockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHEAST]  = 1;
frameDirTableWalkingWithIdleClockwise[Dir.EAST]       = 2;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHEAST]  = 3;
frameDirTableWalkingWithIdleClockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleClockwise[Dir.NORTHWEST]  = 5;
frameDirTableWalkingWithIdleClockwise[Dir.WEST]       = 6;
frameDirTableWalkingWithIdleClockwise[Dir.SOUTHWEST]  = 7;

exports.frameDirTableWalkingWithIdleClockwise = frameDirTableWalkingWithIdleClockwise;

// Forward-to-right (counter-clockwise)
var frameDirTableWalkingWithIdleCounterclockwise = {};
frameDirTableWalkingWithIdleCounterclockwise[Dir.NONE]       = 8;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTH]      = 0;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHEAST]  = 7;
frameDirTableWalkingWithIdleCounterclockwise[Dir.EAST]       = 6;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHEAST]  = 5;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTH]      = 4;
frameDirTableWalkingWithIdleCounterclockwise[Dir.NORTHWEST]  = 3;
frameDirTableWalkingWithIdleCounterclockwise[Dir.WEST]       = 2;
frameDirTableWalkingWithIdleCounterclockwise[Dir.SOUTHWEST]  = 1;

exports.frameDirTableWalkingWithIdleCounterclockwise = frameDirTableWalkingWithIdleCounterclockwise;

/**
 * Given a direction, returns the unit vector for it.
 */
var UNIT_VECTOR = {};
UNIT_VECTOR[Dir.NONE] =  { x: 0, y: 0};
UNIT_VECTOR[Dir.NORTH] = { x: 0, y:-1};
UNIT_VECTOR[Dir.EAST]  = { x: 1, y: 0};
UNIT_VECTOR[Dir.SOUTH] = { x: 0, y: 1};
UNIT_VECTOR[Dir.WEST]  = { x:-1, y: 0};
UNIT_VECTOR[Dir.NORTHEAST] = { x: 1, y:-1};
UNIT_VECTOR[Dir.SOUTHEAST] = { x: 1, y: 1};
UNIT_VECTOR[Dir.SOUTHWEST] = { x:-1, y: 1};
UNIT_VECTOR[Dir.NORTHWEST] = { x:-1, y:-1};
exports.Direction.getUnitVector = function (dir) {
  return UNIT_VECTOR[dir];
};


exports.Position = {
  OUTTOPOUTLEFT:    1,
  OUTTOPLEFT:       2,
  OUTTOPCENTER:     3,
  OUTTOPRIGHT:      4,
  OUTTOPOUTRIGHT:   5,
  TOPOUTLEFT:       6,
  TOPLEFT:          7,
  TOPCENTER:        8,
  TOPRIGHT:         9,
  TOPOUTRIGHT:      10,
  MIDDLEOUTLEFT:    11,
  MIDDLELEFT:       12,
  MIDDLECENTER:     13,
  MIDDLERIGHT:      14,
  MIDDLEOUTRIGHT:   15,
  BOTTOMOUTLEFT:    16,
  BOTTOMLEFT:       17,
  BOTTOMCENTER:     18,
  BOTTOMRIGHT:      19,
  BOTTOMOUTRIGHT:   20,
  OUTBOTTOMOUTLEFT: 21,
  OUTBOTTOMLEFT:    22,
  OUTBOTTOMCENTER:  23,
  OUTBOTTOMRIGHT:   24,
  OUTBOTTOMOUTRIGHT:25
};

//
// Turn state machine, use as NextTurn[fromDir][toDir]
//

exports.NextTurn = {};

exports.NextTurn[Dir.NORTH] = {};
exports.NextTurn[Dir.NORTH][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTH][Dir.EAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.NONE] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.WEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHWEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.EAST] = {};
exports.NextTurn[Dir.EAST][Dir.NORTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.EAST][Dir.SOUTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NONE] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.WEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHWEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHWEST] = Dir.NORTHEAST;

exports.NextTurn[Dir.SOUTH] = {};
exports.NextTurn[Dir.SOUTH][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTH][Dir.NONE] = Dir.NONE;
exports.NextTurn[Dir.SOUTH][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.NextTurn[Dir.WEST] = {};
exports.NextTurn[Dir.WEST][Dir.NORTH] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.EAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTH] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NONE] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.WEST][Dir.NORTHEAST] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHEAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NORTHEAST] = {};
exports.NextTurn[Dir.NORTHEAST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTH] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NONE] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.WEST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHEAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHWEST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHWEST] = Dir.NORTH;

exports.NextTurn[Dir.SOUTHEAST] = {};
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTH] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NONE] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.WEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHEAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHWEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHWEST] = Dir.SOUTH;

exports.NextTurn[Dir.SOUTHWEST] = {};
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTH] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.EAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.NONE] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHWEST] = Dir.WEST;

exports.NextTurn[Dir.NORTHWEST] = {};
exports.NextTurn[Dir.NORTHWEST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.EAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTH] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NONE] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHEAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHEAST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHWEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NONE] = {};
exports.NextTurn[Dir.NONE][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.NONE][Dir.NONE] = Dir.NONE;
exports.NextTurn[Dir.NONE][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.NONE][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.NONE][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.NONE][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.Emotions = {
  NORMAL: 0,
  HAPPY: 1,
  ANGRY: 2,
  SAD: 3
};

// scale the collision bounding box to make it so they need to overlap a touch:
exports.FINISH_COLLIDE_DISTANCE_SCALING = 0.75;
exports.SPRITE_COLLIDE_DISTANCE_SCALING = 0.9;

exports.DEFAULT_SPRITE_SPEED = exports.SpriteSpeed.NORMAL;
exports.DEFAULT_SPRITE_SIZE = 1;

exports.DEFAULT_ITEM_SPEED = exports.SpriteSpeed.SLOW;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
exports.SquareType = {
  OPEN:         0,
  SPRITEFINISH: 1,
  NOT_USED_2:   2,
  WALL:         4,  // random wall tile
  NOT_USED_8:   8,
  SPRITESTART:  16,
  ITEM_CLASS_0: 32, // Must stay in sync with SquareItemClassShift below
  ITEM_CLASS_1: 64,
  ITEM_CLASS_2: 128,
  ITEM_CLASS_3: 256,
  ITEM_CLASS_4: 512,
  ITEM_CLASS_5: 1024,
  ITEM_CLASS_6: 2048,
  ITEM_CLASS_7: 4096,
  NOT_USED_8K:  8192,
  NOT_USED_16K: 16384,
  NOT_USED_32K: 32768
  // Walls specifically retrieved from an 16x16 grid are stored in bits 16-27.
};

exports.SquareItemClassMask =
  exports.SquareType.ITEM_CLASS_0 |
  exports.SquareType.ITEM_CLASS_1 |
  exports.SquareType.ITEM_CLASS_2 |
  exports.SquareType.ITEM_CLASS_3 |
  exports.SquareType.ITEM_CLASS_4 |
  exports.SquareType.ITEM_CLASS_5 |
  exports.SquareType.ITEM_CLASS_6 |
  exports.SquareType.ITEM_CLASS_7;

exports.SquareItemClassShift = 5;

exports.squareHasItemClass = function (itemClassIndex, squareValue) {
  var classesEnabled =
    (squareValue & exports.SquareItemClassMask) >>> exports.SquareItemClassShift;
  return Math.pow(2, itemClassIndex) & classesEnabled;
};

/**
 * The types of walls in the maze.
 * @enum {number}
 */
exports.WallType = {
  NORMAL_SIZE: 0,
  DOUBLE_SIZE: 1,
  JUMBO_SIZE: 2
};

exports.WallTypeMask     = 0x0F000000;
exports.WallCoordRowMask = 0x00F00000;
exports.WallCoordColMask = 0x000F0000;

exports.WallCoordsMask =
  exports.WallTypeMask | exports.WallCoordRowMask | exports.WallCoordColMask;
exports.WallCoordsShift = 16;
exports.WallCoordColShift  = exports.WallCoordsShift;
exports.WallCoordRowShift  = exports.WallCoordsShift + 4;
exports.WallTypeShift      = exports.WallCoordsShift + 8;
exports.WallCoordMax = 16; // indicates a 16x16 grid, which requires 8 bits
exports.WallRandomCoordMax = 2; // how many rows/cols we randomly select tiles from

exports.WallAnyMask = exports.WallCoordsMask | exports.SquareType.WALL;

// Floating score: change opacity and Y coordinate by these values each tick.
exports.floatingScoreChangeOpacity = -0.025;
exports.floatingScoreChangeY = -1;

exports.RANDOM_VALUE = 'random';
exports.HIDDEN_VALUE = '"hidden"';
exports.CLICK_VALUE = '"click"';
exports.VISIBLE_VALUE = '"visible"';

/** @type {number} animation rate in frames per second. */
exports.DEFAULT_ANIMATION_RATE = 20;

// Fade durations (in milliseconds)
exports.GOAL_FADE_TIME = 200;
exports.ITEM_FADE_TIME = 200;
exports.DEFAULT_ACTOR_FADE_TIME = 1000;
exports.TOUCH_HAZARD_EFFECT_TIME = 1500;

// Other defaults for actions
exports.SHAKE_DEFAULT_DURATION = 1000;
exports.SHAKE_DEFAULT_CYCLES = 6;
exports.SHAKE_DEFAULT_DISTANCE = 5;

// Maximum number of clouds that can be displayed.
exports.MAX_NUM_CLOUDS = 2;

// Width & height of a cloud.
exports.CLOUD_SIZE = 300;

// The opacity of a cloud.
exports.CLOUD_OPACITY = 0.7;

// How many milliseconds to throttle between playing sounds.
exports.SOUND_THROTTLE_TIME = 200;


},{}],"/home/ubuntu/staging/apps/build/js/studio/ImageFilterFactory.js":[function(require,module,exports){
/** @file Helper for getting or creating image filters by name (so we can
 *        specify them in plain level definitions or skins) */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var GlowFilter = require('./GlowFilter');
var PulseFilter = require('./PulseFilter');
var ShineFilter = require('./ShineFilter');

/**
 * Given a type name, constructs and returns a filter of the given type.
 * @param {!string} filterTypeName
 * @param {!SVGSVGElement} svg
 * @returns {ImageFilter} or null if the type name is not found.
 */
exports.makeFilterOfType = function (filterTypeName, svg) {
  if (filterTypeName === 'pulse') {
    return new PulseFilter(svg);
  }

  if (filterTypeName === 'shine') {
    return new ShineFilter(svg);
  }

  if (filterTypeName === 'glow') {
    return new GlowFilter(svg);
  }

  return null;
};


},{"./GlowFilter":"/home/ubuntu/staging/apps/build/js/studio/GlowFilter.js","./PulseFilter":"/home/ubuntu/staging/apps/build/js/studio/PulseFilter.js","./ShineFilter":"/home/ubuntu/staging/apps/build/js/studio/ShineFilter.js"}],"/home/ubuntu/staging/apps/build/js/studio/ShineFilter.js":[function(require,module,exports){
/** @file Runs a specular spotlight across the image from top-left to bottom-right. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/** @const {number} determines "height" of light above play area */
var POINT_LIGHT_Z = 200;

/**
 * Runs a specular spotlight across the image from top-left to bottom-right,
 * not hitting alpha'd areas, generating a looping "shine" effect.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var ShineFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.fePointLight_ = null;

  // TODO: Find a way to not depend on the Studio global.
  /** @private {function} */
  this.curve_ = ImageFilter.makeRepeatingOneThirdLinearInterpolation(
      2000, -POINT_LIGHT_Z, Studio.MAZE_WIDTH + POINT_LIGHT_Z);
};
ShineFilter.inherits(ImageFilter);
module.exports = ShineFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
ShineFilter.prototype.createFilterSteps_ = function () {
  // 1. Blur the source image to get softer light
  // 2. Generate a specular point light
  // 3. Mask out specular light that doesn't fall atop the original alpha mask.
  // 4. Composite the specular light over the original image

  var feGaussianBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  var blurResult = this.id_ + '-blur';
  feGaussianBlur.setAttribute('stdDeviation', 6);
  feGaussianBlur.setAttribute('result', blurResult);

  var feSpecularLighting = document.createElementNS(SVG_NS, 'feSpecularLighting');
  var specularResult = this.id_ + '-specular';
  feSpecularLighting.setAttribute('in', blurResult);
  feSpecularLighting.setAttribute('specularExponent', 60);
  feSpecularLighting.setAttribute('lighting-color', 'white');
  feSpecularLighting.setAttribute('result', specularResult);

  this.fePointLight_ = document.createElementNS(SVG_NS, 'fePointLight');
  this.fePointLight_.setAttribute('x', 0);
  this.fePointLight_.setAttribute('y', 0);
  this.fePointLight_.setAttribute('z', POINT_LIGHT_Z);
  feSpecularLighting.appendChild(this.fePointLight_);

  var feCompositeMask = document.createElementNS(SVG_NS, 'feComposite');
  var maskedSpecularId = specularResult + '-masked';
  feCompositeMask.setAttribute('in', specularResult);
  feCompositeMask.setAttribute('operator', 'in');
  feCompositeMask.setAttribute('in2', 'SourceAlpha');
  feCompositeMask.setAttribute('result', maskedSpecularId);

  var feCompositeLayer = document.createElementNS(SVG_NS, 'feComposite');
  feCompositeLayer.setAttribute('in', maskedSpecularId);
  feCompositeLayer.setAttribute('operator', 'over');
  feCompositeLayer.setAttribute('in2', 'SourceGraphic');


  return [
    feGaussianBlur,
    feSpecularLighting,
    feCompositeMask,
    feCompositeLayer
  ];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
ShineFilter.prototype.update = function (timeMs) {
  if (this.fePointLight_) {
    var newValue = this.curve_(timeMs);
    this.fePointLight_.setAttribute('x', newValue);
    this.fePointLight_.setAttribute('y', newValue);
  }
};


},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./ImageFilter":"/home/ubuntu/staging/apps/build/js/studio/ImageFilter.js"}],"/home/ubuntu/staging/apps/build/js/studio/PulseFilter.js":[function(require,module,exports){
/** @file Increases the brightness of the image up to pure white and back. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/**
 * Increases the brightness of the image up to pure white (still respecting
 * the alpha channel) then decreases it back to normal.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var PulseFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.feFuncR_ = null;

  /** @private {SVGElement} */
  this.feFuncG_ = null;

  /** @private {SVGElement} */
  this.feFuncB_ = null;

  /** @private {function} */
  this.curve_ = ImageFilter.makeBellCurveOscillation(2000, 2, 0, 0.5);
};
PulseFilter.inherits(ImageFilter);
module.exports = PulseFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
PulseFilter.prototype.createFilterSteps_ = function () {
  // Only one step in this filter: Increase brightness of all channels.
  var feComponentTransfer = document.createElementNS(SVG_NS, 'feComponentTransfer');
  this.feFuncR_ = document.createElementNS(SVG_NS, 'feFuncR');
  this.feFuncG_ = document.createElementNS(SVG_NS, 'feFuncG');
  this.feFuncB_ = document.createElementNS(SVG_NS, 'feFuncB');
  [this.feFuncR_, this.feFuncG_, this.feFuncB_].forEach(function (feFunc) {
    feFunc.setAttribute('type', 'linear');
    feFunc.setAttribute('slope', '1');
    feFunc.setAttribute('intercept', '0');
    feComponentTransfer.appendChild(feFunc);
  });

  return [feComponentTransfer];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
PulseFilter.prototype.update = function (timeMs) {
  var newValue = this.curve_(timeMs);
  [this.feFuncR_, this.feFuncG_, this.feFuncB_].forEach(function (feFunc) {
    if (feFunc) {
      feFunc.setAttribute('intercept', newValue);
    }
  });
};


},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./ImageFilter":"/home/ubuntu/staging/apps/build/js/studio/ImageFilter.js"}],"/home/ubuntu/staging/apps/build/js/studio/GlowFilter.js":[function(require,module,exports){
/** @file Filter that adds a white glowing outline to an image. */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var SVG_NS = require('../constants').SVG_NS;
var ImageFilter = require('./ImageFilter');

/**
 * Adds a white glowing outline to the image.
 * @param {SVGSVGElement} svg
 * @constructor
 * @extends {ImageFilter}
 */
var GlowFilter = function (svg) {
  ImageFilter.call(this, svg);

  /** @private {SVGElement} */
  this.feCompositeLayers_ = null;

  /** @private {function} */
  this.curve_ = ImageFilter.makeBellCurveOscillation(3000, 3, 0.1, 1.0);
};
GlowFilter.inherits(ImageFilter);
module.exports = GlowFilter;

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 * @override
 */
GlowFilter.prototype.createFilterSteps_ = function () {
  // 1. Flood-fill the glow color (white)
  // 2. Dilate (grow) the source alpha mask
  // 3. Combine to get a silhouette in the correct color
  // 4. Blur the silhouette for a soft glow
  // 5. Mask out the object's original alpha channel
  // 6. Composite the glow and original image, with varying glow alpha

  var feFloodWhite = document.createElementNS(SVG_NS, 'feFlood');
  var feFloodWhiteResult = this.id_ + '-flood-white';
  feFloodWhite.setAttribute('flood-color', 'white');
  feFloodWhite.setAttribute('result', feFloodWhiteResult);

  var feMorphology = document.createElementNS(SVG_NS, 'feMorphology');
  var feMorphologyResult = this.id_ + '-morphology';
  feMorphology.setAttribute('in', 'SourceAlpha');
  feMorphology.setAttribute('operator', 'dilate');
  feMorphology.setAttribute('radius', 2);
  feMorphology.setAttribute('result', feMorphologyResult);

  var feCompositeSilhouette = document.createElementNS(SVG_NS, 'feComposite');
  var feCompositeSilhouetteResult = this.id_ + '-silhouette';
  feCompositeSilhouette.setAttribute('in', feFloodWhiteResult);
  feCompositeSilhouette.setAttribute('operator', 'in');
  feCompositeSilhouette.setAttribute('in2', feMorphologyResult);
  feCompositeSilhouette.setAttribute('result', feCompositeSilhouetteResult);

  var feGaussianBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  var feGaussianBlurResult = this.id_ + '-blur';
  feGaussianBlur.setAttribute('in', feCompositeSilhouetteResult);
  feGaussianBlur.setAttribute('stdDeviation', 1);
  feGaussianBlur.setAttribute('result', feGaussianBlurResult);

  var feCompositeMaskedGlow = document.createElementNS(SVG_NS, 'feComposite');
  var feCompositeMaskedGlowResult = this.id_ + '-masked-glow';
  feCompositeMaskedGlow.setAttribute('in', feGaussianBlurResult);
  feCompositeMaskedGlow.setAttribute('operator', 'out');
  feCompositeMaskedGlow.setAttribute('in2', 'SourceAlpha');
  feCompositeMaskedGlow.setAttribute('result', feCompositeMaskedGlowResult);

  var feCompositeLayers = document.createElementNS(SVG_NS, 'feComposite');
  feCompositeLayers.setAttribute('in', 'SourceGraphic');
  feCompositeLayers.setAttribute('operator', 'arithmetic');
  feCompositeLayers.setAttribute('in2', feCompositeMaskedGlowResult);
  feCompositeLayers.setAttribute('k1', 0);
  feCompositeLayers.setAttribute('k2', 1); // Always show 100% of original image
  feCompositeLayers.setAttribute('k3', 0);
  feCompositeLayers.setAttribute('k4', 0);
  this.feCompositeLayers_ = feCompositeLayers;

  return [
    feFloodWhite,
    feMorphology,
    feCompositeSilhouette,
    feGaussianBlur,
    feCompositeMaskedGlow,
    feCompositeLayers
  ];
};

/**
 * Update this effect's animation for the current time.
 * @param {number} timeMs
 * @override
 */
GlowFilter.prototype.update = function (timeMs) {
  if (this.feCompositeLayers_) {
    this.feCompositeLayers_.setAttribute('k3', this.curve_(timeMs));
  }
};


},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./ImageFilter":"/home/ubuntu/staging/apps/build/js/studio/ImageFilter.js"}],"/home/ubuntu/staging/apps/build/js/studio/ImageFilter.js":[function(require,module,exports){
/** @file Wrapper for an SVG filter definition with animation capabilities */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

var SVG_NS = require('../constants').SVG_NS;
var utils = require('../utils');

// Unique element ID that increments by 1 each time an element is created
var uniqueId = 0;

/**
 * Base class for defining complex SVG <filter>s that can be applied to
 * any number of elements in playlab, but are primarily designed for use with
 * image/sprite elements.
 *
 * The filter behaviors are defined here in code, but are added dynamically to
 * the DOM as late as possible to avoid adding them when they are not needed.
 *
 * Wrapping the filters this way also provides an easy place to dynamically
 * manipulate their properties, generating filter animation.
 *
 * @constructor
 * @param {!SVGSVGElement} svg - Every filter must belong to a single SVG
 *        root element, because it gets defined inside that SVG's defs tag.
 *        Note: The filter is not created right away, but we hold the SVG
 *        reference so we can late-create the filter when it's needed.
 */
var ImageFilter = function (svg) {
  /** @private {SVGSVGElement} */
  this.svg_ = svg;

  /** @private {string} */
  this.id_ = 'image-filter-' + uniqueId++;

  /** @private {number} how many elements are currently using this filter. */
  this.applyCount_ = 0;

  /** @private {?} setInterval key */
  this.intervalId_ = null;

};
module.exports = ImageFilter;

/**
 * Set the passed element to use this filter (replaces other filters it may
 * be using.)
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.applyTo = function (svgElement) {
  if (!this.checkBrowserSupport_()) {
    return;
  }

  if (this.applyCount_ === 0) {
    this.createInDom_();
  }
  svgElement.setAttribute('filter', 'url("#' + this.id_ + '")');
  this.applyCount_++;
};

/**
 * If the passed element is using this filter, removes the filter.
 * @param {SVGElement} svgElement
 */
ImageFilter.prototype.removeFrom = function (svgElement) {
  // Different browsers clean the filter attribute differently
  // This matches
  //   url(#filter-id)
  //   url("#filter-id")
  var regex = new RegExp("url\\([\"']?#" + this.id_ + "[\"']?\\)", 'i');
  if (regex.test(svgElement.getAttribute('filter'))) {
    svgElement.removeAttribute('filter');
    this.applyCount_--;
  }
  if (this.applyCount_ === 0) {
    this.removeFromDom_();
  }
};

/* jshint unused: false */
/**
 * Update this effect's animation for the current time.
 * Called by effect's own interval (not Studio.onTick) so that we can run
 * effects even when the studio simulation is not running.
 * @param {number} timeMs
 */
ImageFilter.prototype.update = function (timeMs) {
  // No default operation here.  Subclasses may override this to implement
  // animation.
};
/* jshint unused: true */

/**
 * Generates the necessary elements and adds this filter to the parent SVG
 * under the <defs> tag.
 * @private
 */
ImageFilter.prototype.createInDom_ = function () {
  var filter = document.getElementById(this.id_);
  if (filter) {
    return;
  }

  // Make a new filter element
  filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', this.id_);

  // Add the filter steps (expected to be different for each filter type)
  var steps = this.createFilterSteps_();
  steps.forEach(function (step) {
    filter.appendChild(step);
  });

  // Put the filter in the SVG Defs node.
  var defs = this.getDefsNode_();
  defs.appendChild(filter);

  // Establish 30FPS update interval
  if (!this.intervalId_) {
    this.intervalId_ = window.setInterval(function () {
      this.update(new Date().getTime());
    }.bind(this), 1000/30);
  }
};

/**
 * Removes this SVG filter from the <defs> tag.
 * @private
 */
ImageFilter.prototype.removeFromDom_ = function () {
  if (this.intervalId_) {
    window.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }

  var filter = document.getElementById(this.id_);
  if (filter) {
    filter.parentNode.removeChild(filter);
  }
};

/**
 * Build an ordered set of filter operations that define the behavior of this
 * filter type.
 * @returns {SVGElement[]}
 * @private
 */
ImageFilter.prototype.createFilterSteps_ = function () {
  return [];
};

/**
 * Get the Defs tag for our SVG, creating it if it doesn't exist.
 * @returns {SVGDefsElement}
 * @private
 */
ImageFilter.prototype.getDefsNode_ = function () {
  var defs = this.svg_.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    this.svg_.appendChild(defs);
  }
  return defs;
};

/**
 * Check whether the current browser is likely to support SVG filter effects.
 * Can be overridden by subclasses needing specific support.
 * @returns {boolean}
 * @private
 */
ImageFilter.prototype.checkBrowserSupport_ = function () {
  // Disable filter effects in Safari right now, since they seem to take a
  // long time to render and often cause issues.
  // Chrome also contains 'Safari' in its user agent string, so check for
  // 'Safari' but not 'Chrome'
  // See http://stackoverflow.com/a/7768006/5000129
  if (navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1) {
    return false;
  }

  // Check suggested by http://stackoverflow.com/a/9771153/5000129
  return typeof window.SVGFEColorMatrixElement !== 'undefined' &&
      SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;
};

/**
 * Generates a function that given a time value "t" will produce a number
 * between zero and one (inclusive) following a given curve between them.
 *
 * @param {number} period - the t-value for one complete cycle, from max to
 *        min and back to max.  Must be nonzero.
 * @param {number} [exponent] - Determines the sharpness of the curve in the
 *        oscillation.
 *        2 (default) gives a traditional bell curve.
 *        1 gives a triangle wave (no curve, just linear interpolation).
 *        0-1 gives a curve that spends more time above halfway than below it.
 *        1+ gives a curve that spends more time below halfway than above it
 *             (like a repeated y=x*x curve).
 *        May not work well for certain values of curve - make sure to test!
 * @param {number} [min] - Smallest value of oscillation, default 0
 * @param {number} [max] - Largest value of oscillation, default 1
 */
ImageFilter.makeBellCurveOscillation = function (period, exponent, min, max) {
  exponent = utils.valueOr(exponent, 2);
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);
  var delta = max - min;
  var coefficient = delta * Math.pow(2 / period, exponent);
  var halfPeriod = period / 2;
  return function (t) {
    return min + coefficient * Math.abs(Math.pow((t % period) - halfPeriod, exponent));
  };
};

/**
 * Generates a function for a repeating pattern as follows:
 *  * Spend the first 1/3 of the period at {min}
 *  * Spend the second 1/3 of the period doing a linear interpolation from
 *    {min} to {max}
 *  * Spend the final 1/3 of the period at {max}
 *
 * @param {number} period - time units before this pattern repeats
 * @param {number} [min] - Lowest value, default zero
 * @param {number} [max] - Highest value, default one
 */
ImageFilter.makeRepeatingOneThirdLinearInterpolation = function (period, min, max) {
  min = utils.valueOr(min, 0);
  max = utils.valueOr(max, 1);

  var slope = 3 * (max - min) / period;
  var intercept = 2 * min - max;
  return function (t) {
    return Math.min(max, Math.max(min, slope * (t % period) + intercept));
  };
};


},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}]},{},["/home/ubuntu/staging/apps/build/js/studio/main.js"]);
