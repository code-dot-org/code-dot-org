require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({218:[function(require,module,exports){
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
},{"../appMain":5,"./blocks":210,"./levels":217,"./skins":222,"./studio":223}],223:[function(require,module,exports){
/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../../locale/current/common');
var studioMsg = require('../../locale/current/studio');
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
var BigGameLogic = require('./bigGameLogic');
var RocketHeightLogic = require('./rocketHeightLogic');
var SamBatLogic = require('./samBatLogic');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');
var Hammer = utils.getHammer();

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

var SVG_NS = "http://www.w3.org/2000/svg";

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

Studio.BLOCK_X_COORDINATE = 20;
Studio.BLOCK_Y_COORDINATE = 20;

var MAX_INTERPRETER_STEPS_PER_TICK = 200;

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

var SCORE_TEXT_Y_POSITION = 60; // bottom of text

var MIN_TIME_BETWEEN_PROJECTILES = 500; // time in ms

var twitterOptions = {
  text: studioMsg.shareStudioTwitter(),
  hashtag: "StudioCode"
};

function loadLevel() {
  // Load maps.
  Studio.map = level.map;
  Studio.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Studio.minWorkspaceHeight = level.minWorkspaceHeight;
  Studio.softButtons_ = level.softButtons || {};
  // protagonistSpriteIndex was originally mispelled. accept either spelling.
  Studio.protagonistSpriteIndex = level.protagonistSpriteIndex || level.protaganistSpriteIndex;

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
  // Height and width of the goal and obstacles.
  Studio.MARKER_HEIGHT = 100;
  Studio.MARKER_WIDTH = 100;

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

  if (skin.background) {
    var tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                        skin.background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Studio.MAZE_HEIGHT);
    tile.setAttribute('width', Studio.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  if (level.coordinateGridBackground) {
    studioApp.createCoordinateGridBackground({
      svg: 'svgStudio',
      origin: 0,
      firstLabel: 100,
      lastLabel: 300,
      increment: 100
    });
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
      svg.appendChild(spriteClip);

      // Add sprite (not setting href, height, or width until displaySprite).
      var spriteIcon = document.createElementNS(SVG_NS, 'image');
      spriteIcon.setAttribute('id', 'sprite' + i);
      spriteIcon.setAttribute('clip-path', 'url(#spriteClipPath' + i + ')');
      svg.appendChild(spriteIcon);

      // Add support for walking spritesheet.
      var spriteWalkIcon = document.createElementNS(SVG_NS, 'image');
      spriteWalkIcon.setAttribute('id', 'spriteWalk' + i);
      spriteWalkIcon.setAttribute('clip-path', 'url(#spriteWalkClipPath' + i + ')');
      svg.appendChild(spriteWalkIcon);

      var spriteWalkClip = document.createElementNS(SVG_NS, 'clipPath');
      spriteWalkClip.setAttribute('id', 'spriteWalkClipPath' + i);
      var spriteWalkClipRect = document.createElementNS(SVG_NS, 'rect');
      spriteWalkClipRect.setAttribute('id', 'spriteWalkClipRect' + i);
      spriteWalkClip.appendChild(spriteWalkClipRect);
      svg.appendChild(spriteWalkClip);

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

  if (Studio.spriteGoals_) {
    for (i = 0; i < Studio.spriteGoals_.length; i++) {
      // Add finish markers.
      var finishClipPath = document.createElementNS(SVG_NS, 'clipPath');
      finishClipPath.setAttribute('id', 'finishClipPath' + i);
      var finishClipRect = document.createElementNS(SVG_NS, 'rect');
      finishClipRect.setAttribute('id', 'finishClipRect' + i);
      finishClipRect.setAttribute('width', Studio.MARKER_WIDTH);
      finishClipRect.setAttribute('height', Studio.MARKER_HEIGHT);
      finishClipPath.appendChild(finishClipRect);
      svg.appendChild(finishClipPath);

      var spriteFinishMarker = document.createElementNS(SVG_NS, 'image');
      spriteFinishMarker.setAttribute('id', 'spriteFinish' + i);
      spriteFinishMarker.setAttribute('height', Studio.MARKER_HEIGHT);
      spriteFinishMarker.setAttribute('width', (level.goalOverride &&
        level.goalOverride.imageWidth) || Studio.MARKER_WIDTH);
      spriteFinishMarker.setAttribute('clip-path', 'url(#finishClipPath' + i + ')');
      svg.appendChild(spriteFinishMarker);
    }
  }

  var score = document.createElementNS(SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'studio-score');
  score.setAttribute('x', Studio.MAZE_WIDTH / 2);
  score.setAttribute('y', SCORE_TEXT_Y_POSITION);
  score.appendChild(document.createTextNode(''));
  score.setAttribute('visibility', 'hidden');
  svg.appendChild(score);

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
    // Clamp nextX to boundaries as newX:
    var newX = Math.min(Studio.MAZE_WIDTH - sprite.width,
                        Math.max(0, nextX));
    if (nextX != newX) {
      cancelQueuedMovements(i, false);
    }
    sprite.x = newX;

    // Clamp nextY to boundaries as newY:
    var newY = Math.min(Studio.MAZE_HEIGHT - sprite.height,
                        Math.max(0, nextY));
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
 */
function callHandler (name, allowQueueExtension) {
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
        Studio.eventQueue.push({'fn': handler.func});
      }
    }
  });
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

  if (Studio.customLogic) {
    Studio.customLogic.onTick();
  }

  if (Studio.interpreter) {
    var doneUserCodeStep = false;
    // In each tick, we will step the interpreter multiple times in a tight
    // loop as long as we are interpreting code that the user can't see
    // (function aliases at the beginning, getCallback event loop at the end)
    for (var stepsThisTick = 0;
         stepsThisTick < MAX_INTERPRETER_STEPS_PER_TICK && !doneUserCodeStep;
         stepsThisTick++) {
      var userCodeRow = codegen.selectCurrentCode(Studio.interpreter,
                                                  Studio.cumulativeLength,
                                                  Studio.userCodeStartOffset,
                                                  Studio.userCodeLength,
                                                  studioApp.editor);
      try {
        Studio.interpreter.step();
        doneUserCodeStep = (-1 !== userCodeRow) &&
                            Studio.interpreter.stateStack[0] &&
                            Studio.interpreter.stateStack[0].done;
      }
      catch(err) {
        Studio.executionError = err;
        Studio.onPuzzleComplete();
        return;
      }
    }
  } else {
    if (Studio.tickCount === 1) {
      callHandler('whenGameStarts');
    }
    Studio.executeQueue('whenGameStarts');
  }

  callHandler('repeatForever');
  Studio.executeQueue('repeatForever');

  for (var i = 0; i < Studio.spriteCount; i++) {
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

  checkForCollisions();

  for (i = 0; i < Studio.spriteCount; i++) {
    performQueuedMoves(i);

    var isWalking = true;

    // After 5 ticks of no movement, turn sprite forward.
    if (Studio.tickCount - Studio.sprite[i].lastMove > TICKS_BEFORE_FACE_SOUTH) {
      Studio.sprite[i].dir = Direction.SOUTH;
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
  }

  for (i = 0; i < Studio.projectiles.length; i++) {
    Studio.projectiles[i].moveToNextPosition();
    if (Studio.projectiles[i].outOfBounds()) {
      Studio.projectiles[i].removeElement();
      Studio.projectiles.splice(i, 1);
      // decrement i because we just removed an item from the array. We want to
      // keep i as the same value for the next iteration through this loop
      i--;
    } else {
      Studio.projectiles[i].display();
    }
  }

  if (checkFinished()) {
    Studio.onPuzzleComplete();
  }
};

/* Check for collisions (note that we use the positions they are about
 * to attain with queued moves - this allows the moves to be canceled before
 * the actual movements take place)
 */
function checkForCollisions() {
  var spriteCollisionDistance = function (i1, i2, yAxis) {
    var dim1 = yAxis ? Studio.sprite[i1].height : Studio.sprite[i1].width;
    var dim2 = yAxis ? Studio.sprite[i2].height : Studio.sprite[i2].width;
    return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
  };
  var projectileCollisionDistance = function (iS, iP, yAxis) {
    var dim1 = yAxis ? Studio.sprite[iS].height : Studio.sprite[iS].width;
    var dim2 = yAxis ?
                  Studio.projectiles[iP].height :
                  Studio.projectiles[iP].width;
    return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
  };
  var edgeCollisionDistance = function (iS, edgeName, yAxis) {
    var dim1 = yAxis ? Studio.sprite[iS].height : Studio.sprite[iS].width;
    var dim2;
    if (edgeName === 'left' || edgeName === 'right') {
      dim2 = yAxis ? Studio.MAZE_HEIGHT : 0;
    } else {
      dim2 = yAxis ? 0 : Studio.MAZE_WIDTH;
    }
    return (dim1 + dim2) / 2;
  };

  for (var i = 0; i < Studio.spriteCount; i++) {
    var sprite = Studio.sprite[i];
    if (!sprite.visible) {
      // hidden sprite can't collide with anything
      continue;
    }
    var iHalfWidth = sprite.width / 2;
    var iHalfHeight = sprite.height / 2;
    var iXCenter = getNextPosition(i, false, false) + iHalfWidth;
    var iYCenter = getNextPosition(i, true, false) + iHalfHeight;
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
    for (j = 0; j < Studio.projectiles.length; j++) {
      var projectile = Studio.projectiles[j];
      var next = projectile.getNextPosition();
      if (collisionTest(iXCenter,
                        next.x,
                        projectileCollisionDistance(i, j, false),
                        iYCenter,
                        next.y,
                        projectileCollisionDistance(i, j, true))) {
        if (projectile.startCollision(i)) {
          Studio.currentEventParams = { projectile: projectile };
          // Allow cmdQueue extension (pass true) since this handler
          // may be called for multiple projectiles before executing the queue
          // below

          // NOTE: not using collideSpriteWith() because collision state is
          // tracked on the projectile in this case
          handleCollision(i, projectile.className, true);
          Studio.currentEventParams = null;
        }
      } else {
        projectile.endCollision(i);
      }
    }

    for (j = 0; j < EdgeClassNames.length && level.edgeCollisions; j++) {
      var edgeXCenter, edgeYCenter;
      var edgeClass = EdgeClassNames[j];
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
      if (collisionTest(iXCenter,
                        edgeXCenter,
                        edgeCollisionDistance(i, edgeClass, false),
                        iYCenter,
                        edgeYCenter,
                        edgeCollisionDistance(i, edgeClass, true))) {
        Studio.collideSpriteWith(i, edgeClass);
      } else {
        sprite.endCollision(edgeClass);
      }
    }

    // Don't execute projectile collision queue(s) until we've handled all edge
    // collisions. Not sure this is strictly necessary, but it means the code is
    // the same as it was before this change.
    for (j = 0; j < EdgeClassNames.length; j++) {
      executeCollision(i, EdgeClassNames[j]);
    }
    for (j = 0; j < skin.ProjectileClassNames.length; j++) {
      executeCollision(i, skin.ProjectileClassNames[j]);
    }
  }
}

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
  // If we are "running", check the cmdQueues.
  if (Studio.tickCount > 0){
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
  Studio.projectiles = [];
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

  Studio.initSprites();

  studioApp.initReadonly(config);
};

/**
 * Arrange the start blocks to spread them out in the workspace.
 * This uses unique logic for studio - spread event blocks vertically even
 * over the total height of the workspace.
 */
var arrangeStartBlocks = function (config) {
  var xml = parseXmlElement(config.level.startBlocks);
  var numUnplacedElementNodes = 0;
  // sort the blocks by visibility
  var xmlChildNodes = studioApp.sortBlocksByVisibility(xml.childNodes);
  // do a first pass to count the nodes
  for (var x = 0, xmlChild; xmlChildNodes && x < xmlChildNodes.length; x++) {
    xmlChild = xmlChildNodes[x];

    // Only look at element nodes without a y coordinate:
    if (xmlChild.nodeType === 1 && !xmlChild.getAttribute('y')) {
      numUnplacedElementNodes++;
    }
  }
  // do a second pass to place the nodes
  if (numUnplacedElementNodes) {
    var numberOfPlacedBlocks = 0;
    var totalHeightAvail =
        (config.level.minWorkspaceHeight || 800) - Studio.BLOCK_Y_COORDINATE;
    var yCoordInterval = totalHeightAvail / numUnplacedElementNodes;
    for (x = 0, xmlChild; xmlChildNodes && x < xmlChildNodes.length; x++) {
      xmlChild = xmlChildNodes[x];

      // Only look at element nodes without a y coordinate:
      if (xmlChild.nodeType === 1 && !xmlChild.getAttribute('y')) {
        xmlChild.setAttribute(
            'x',
            xmlChild.getAttribute('x') || Studio.BLOCK_X_COORDINATE);
        xmlChild.setAttribute(
            'y',
            Studio.BLOCK_Y_COORDINATE + yCoordInterval * numberOfPlacedBlocks);
        numberOfPlacedBlocks += 1;
      }
    }
    // replace the startBlocks since we changed the attributes in the xml dom:
    config.level.startBlocks = Blockly.Xml.domToText(xml);
  }
};

/**
 * Initialize Blockly and the Studio app.  Called on page load.
 */
Studio.init = function(config) {
  Studio.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  // In our Algebra course, we want to gray out undeletable blocks. I'm not sure
  // whether or not that's desired in our other courses.
  var isAlgebraLevel = !!level.useContractEditor;
  config.grayOutUndeletableBlocks = isAlgebraLevel;

  loadLevel();

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
      inputOutputTable: level.inputOutputTable
    }
  });

  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
    studioApp.loadAudio(skin.rubberSound, 'rubber');
    studioApp.loadAudio(skin.crunchSound, 'crunch');
    studioApp.loadAudio(skin.flagSound, 'flag');
    studioApp.loadAudio(skin.winPointSound, 'winpoint');
    studioApp.loadAudio(skin.winPoint2Sound, 'winpoint2');
    studioApp.loadAudio(skin.losePointSound, 'losepoint');
    studioApp.loadAudio(skin.losePoint2Sound, 'losepoint2');
    studioApp.loadAudio(skin.goal1Sound, 'goal1');
    studioApp.loadAudio(skin.goal2Sound, 'goal2');
    studioApp.loadAudio(skin.woodSound, 'wood');
    studioApp.loadAudio(skin.retroSound, 'retro');
    studioApp.loadAudio(skin.slapSound, 'slap');
    studioApp.loadAudio(skin.hitSound, 'hit');
  };

  config.afterInject = function() {
    // Connect up arrow button event handlers
    for (var btn in ArrowIds) {
      dom.addClickTouchEvent(document.getElementById(ArrowIds[btn]),
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
    }

    drawMap();
  };

  if (studioApp.isUsingBlockly() && config.level.edit_blocks != 'toolbox_blocks') {
    arrangeStartBlocks(config);
  }

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
  config.generateFunctionPassBlocks = !!config.level.generateFunctionPassBlocks;
  config.dropletConfig = dropletConfig;

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
    preloadProjectileImages();
    preloadBackgroundImages();
  }
};

var preloadImage = function(url) {
  var img = new Image();
  img.src = url;
};

var preloadBackgroundImages = function() {
  // TODO (cpirich): preload for non-blockly
  if (studioApp.isUsingBlockly()) {
    var imageChoices = skin.backgroundChoicesK1;
    for (var i = 0; i < imageChoices.length; i++) {
      preloadImage(imageChoices[i][0]);
    }
  }
};

var preloadProjectileImages = function() {
  for (var i = 0; i < skin.ProjectileClassNames.length; i++) {
    preloadImage(skin[skin.ProjectileClassNames[i]]);
  }
};

var preloadActorImages = function() {
  for (var i = 0; i < skin.avatarList.length; i++) {
    preloadImage(skin[skin.avatarList[i]].sprite);
  }
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Studio.clearEventHandlersKillTickLoop = function() {
  if (Studio.eventHandlers) {
    // Check the first command in all of the cmdQueues and clear the timeout
    // if there is a pending wait command
    Studio.eventHandlers.forEach(function (handler) {
      var cmd = handler.cmdQueue[0];

      if (cmd && cmd.opts.waitTimeout && !cmd.opts.complete) {
        // Note: not calling waitCallback() or setting complete = true
        window.clearTimeout(cmd.opts.waitTimeout);
      }
    });
  }
  Studio.eventHandlers = [];
  if (Studio.perExecutionTimeouts) {
    Studio.perExecutionTimeouts.forEach(function (timeout) {
      clearInterval(timeout);
    });
   }
  Studio.perExecutionTimeouts = [];
  Studio.tickCount = 0;
  for (var i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i] && Studio.sprite[i].bubbleTimeout) {
      window.clearTimeout(Studio.sprite[i].bubbleTimeout);
    }
  }
  if (Studio.projectiles) {
    for (i = 0; i < Studio.projectiles.length; i++) {
      Studio.projectiles[i].removeElement();
    }
    Studio.projectiles = [];
  }
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
studioApp.reset = function(first) {
  var i;
  Studio.clearEventHandlersKillTickLoop();
  var svg = document.getElementById('svgStudio');

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

  // Reset the dynamic sprites list
  while (Studio.projectiles.length) {
    var projectile = Studio.projectiles.pop();
    projectile.removeElement();
  }

  // True if we should fail before execution, even if freeplay
  Studio.preExecutionFailure = false;
  Studio.message = null;

  // Reset the score and title screen.
  Studio.playerScore = 0;
  Studio.scoreText = null;
  document.getElementById('score')
    .setAttribute('visibility', 'hidden');
  document.getElementById('titleScreenTitle')
    .setAttribute('visibility', 'hidden');
  document.getElementById('titleScreenTextGroup')
    .setAttribute('visibility', 'hidden');

  // Reset configurable variables
  if (level.coordinateGridBackground) {
    Studio.setBackground({value: 'grid'});
  } else {
    Studio.setBackground({value: level.background || skin.defaultBackground});
  }

  // Reset currentCmdQueue and various counts:
  Studio.gesturesObserved = {};
  Studio.currentCmdQueue = null;
  // Number of things that have been said.  Used to validate level completion.
  Studio.sayComplete = 0;
  Studio.playSoundCount = 0;

  // Reset goal successState:
  if (level.goal) {
    level.goal.successState = {};
  }

  // Reset the Globals object used to contain program variables:
  Studio.Globals = {};
  if (studioApp.editCode) {
    Studio.eventQueue = [];
    Studio.executionError = null;
    Studio.interpreter = null;
  }

  // Move sprites into position.
  for (i = 0; i < Studio.spriteCount; i++) {
    Studio.sprite[i] = new Collidable({
      x: Studio.spriteStart_[i].x,
      y: Studio.spriteStart_[i].y,
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

    document.getElementById('sprite' + i).removeAttribute('opacity');

    var explosion = document.getElementById('explosion' + i);
    if (explosion) {
      explosion.setAttribute('visibility', 'hidden');
    }
  }

  var goalAsset = skin.goal;
  if (level.goalOverride && level.goalOverride.goal) {
    goalAsset = skin[level.goalOverride.goal];
  }
  for (i = 0; i < Studio.spriteGoals_.length; i++) {
    // Mark each finish as incomplete.
    Studio.spriteGoals_[i].finished = false;

    // Move the finish icons into position.
    var spriteFinishIcon = document.getElementById('spriteFinish' + i);
    spriteFinishIcon.setAttribute('x', Studio.spriteGoals_[i].x);
    spriteFinishIcon.setAttribute('y', Studio.spriteGoals_[i].y);
    spriteFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', goalAsset);
    var finishClipRect = document.getElementById('finishClipRect' + i);
    finishClipRect.setAttribute('x', Studio.spriteGoals_[i].x);
    finishClipRect.setAttribute('y', Studio.spriteGoals_[i].y);
  }

  // A little flag for script-based code to consume.
  Studio.levelRestarted = true;
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
studioApp.runButtonClick = function() {
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
  studioApp.reset(false);
  studioApp.attempts++;
  Studio.startTime = new Date();
  Studio.execute();

  if (level.freePlay && !level.isProjectLevel &&
      (!studioApp.hideSource || level.showFinish)) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
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
  if (!Studio.waitingForReport) {
    studioApp.displayFeedback({
      app: 'studio', //XXX
      skin: skin.id,
      feedbackType: Studio.testResults,
      tryAgainText: level.freePlay ? commonMsg.keepPlaying() : undefined,
      continueText: level.freePlay ? commonMsg.nextPuzzle() : undefined,
      response: Studio.response,
      level: level,
      showingSharing: !level.disableSharing && level.freePlay && !Studio.preExecutionFailure,
      feedbackImage: Studio.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Studio.response && Studio.response.save_to_gallery_url,
      message: Studio.message,
      appStrings: {
        reinfFeedbackMsg: studioMsg.reinfFeedbackMsg(),
        sharingText: studioMsg.shareGame()
      }
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
 * A miniature runtime in the interpreted world calls this function repeatedly
 * to check to see if it should invoke any callbacks from within the
 * interpreted world. If the eventQueue is not empty, we will return an object
 * that contains an interpreted callback function (stored in "fn") and,
 * optionally, callback arguments (stored in "arguments")
 */
var nativeGetCallback = function () {
  return Studio.eventQueue.shift();
};

/**
 * Looks for failures that should prevent execution.
 * @returns {boolean} True if we have a pre-execution failure
 */
Studio.checkForPreExecutionFailure = function () {
  if (studioApp.hasUnfilledFunctionalBlock()) {
    Studio.result = false;
    Studio.testResults = TestResults.EMPTY_FUNCTIONAL_BLOCK;
    Studio.message = commonMsg.emptyFunctionalBlock();
    Studio.preExecutionFailure = true;
    return true;
  }

  if (studioApp.hasExtraTopBlocks()) {
    Studio.result = false;
    Studio.testResults = TestResults.EXTRA_TOP_BLOCKS_FAIL;
    Studio.preExecutionFailure = true;
    return true;
  }

  return false;
};

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

  studioApp.playAudio('start');

  studioApp.reset(false);

  if (level.editCode) {
    var codeWhenRun = dropletUtils.generateCodeAliases(dropletConfig, 'Studio');
    Studio.userCodeStartOffset = codeWhenRun.length;
    codeWhenRun += studioApp.editor.getValue();
    Studio.userCodeLength = codeWhenRun.length - Studio.userCodeStartOffset;
    // Append our mini-runtime after the user's code. This will spin and process
    // callback functions:
    codeWhenRun += '\nwhile (true) { var obj = getCallback(); ' +
      'if (obj) { obj.fn.apply(null, obj.arguments ? obj.arguments : null); }}';
    var session = studioApp.editor.aceEditor.getSession();
    Studio.cumulativeLength = codegen.aceCalculateCumulativeLength(session);

    // Use JS interpreter on editCode levels
    var initFunc = function(interpreter, scope) {
      codegen.initJSInterpreter(interpreter, scope, {
                                        StudioApp: studioApp,
                                        Studio: api,
                                        Globals: Studio.Globals } );


      var getCallbackObj = interpreter.createObject(interpreter.FUNCTION);
      var wrapper = codegen.makeNativeMemberFunction({
          interpreter: interpreter,
          nativeFunc: nativeGetCallback,
      });
      interpreter.setProperty(scope,
                              'getCallback',
                              interpreter.createNativeFunction(wrapper));
    };
    Studio.interpreter = new window.Interpreter(codeWhenRun, initFunc);
  } else {
    // Define any top-level procedures the user may have created
    // (must be after reset(), which resets the Studio.Globals namespace)
    defineProcedures('procedures_defreturn');
    defineProcedures('procedures_defnoreturn');
    defineProcedures('functional_definition');

    // Set event handlers and start the onTick timer
    Studio.eventHandlers = handlers;
  }

  Studio.perExecutionTimeouts = [];
  Studio.perExecutionTimeouts.push(window.setInterval(Studio.onTick, Studio.scale.stepSpeed));
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

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (Studio.result === ResultType.SUCCESS);

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    if (!Studio.preExecutionFailure) {
      Studio.testResults = TestResults.FREE_PLAY;
    }
    // If preExecutionFailure testResults should already be set
  } else {
    Studio.testResults = studioApp.getTestResults(levelComplete);
  }

  if (Studio.testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
    studioApp.playAudio('win');
  } else {
    studioApp.playAudio('failure');
  }

  var program;
  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = studioApp.editor.getValue();
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
    document.getElementById('svgStudio').toDataURL("image/png", {
      callback: function(pngDataUrl) {
        Studio.feedbackImage = pngDataUrl;
        Studio.encodedFeedbackImage = encodeURIComponent(Studio.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

var frameDirTable = {};
frameDirTable[Direction.SOUTHEAST]  = 0;
frameDirTable[Direction.EAST]       = 1;
frameDirTable[Direction.NORTHEAST]  = 2;
frameDirTable[Direction.NORTH]      = 3;
frameDirTable[Direction.NORTHWEST]  = 4;
frameDirTable[Direction.WEST]       = 5;
frameDirTable[Direction.SOUTHWEST]  = 6;

var frameDirTableWalking = {};
frameDirTableWalking[Direction.SOUTH]      = 0;
frameDirTableWalking[Direction.SOUTHEAST]  = 1;
frameDirTableWalking[Direction.EAST]       = 2;
frameDirTableWalking[Direction.NORTHEAST]  = 3;
frameDirTableWalking[Direction.NORTH]      = 4;
frameDirTableWalking[Direction.NORTHWEST]  = 5;
frameDirTableWalking[Direction.WEST]       = 6;
frameDirTableWalking[Direction.SOUTHWEST]  = 7;

var ANIM_RATE = 6;
var ANIM_OFFSET = 7; // Each sprite animates at a slightly different time
var ANIM_AFTER_NUM_NORMAL_FRAMES = 8;
// Number of ticks between the last time the sprite moved and when we reset them
// to face south.
var TICKS_BEFORE_FACE_SOUTH = 5;

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
    return frameDirTableWalking[sprite.displayDir];
  }
  else if (opts && opts.walkFrame && sprite.timePerFrame) {
    return Math.floor(elapsed / sprite.timePerFrame) % sprite.frameCounts.walk;
  }

  if ((sprite.frameCounts.turns === 8) && sprite.displayDir !== Direction.SOUTH) {
    // turn frames start after normal and animation frames
    return sprite.frameCounts.normal + sprite.frameCounts.animation + 1 +
      frameDirTable[sprite.displayDir];
  }
  if ((sprite.frameCounts.turns === 7) && sprite.displayDir !== Direction.SOUTH) {
    // turn frames start after normal and animation frames
    return sprite.frameCounts.normal + sprite.frameCounts.animation +
      frameDirTable[sprite.displayDir];
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

    xOffset = sprite.width * spriteFrameNumber(i, {walkDirection: true});
    yOffset = sprite.height * spriteFrameNumber(i, {walkFrame: true});

    spriteIcon = spriteWalkIcon;
    spriteClipRect = document.getElementById('spriteWalkClipRect' + i);
    unusedSpriteClipRect = document.getElementById('spriteClipRect' + i);

  } else {
    // Show regular sprite, and hide walk sprite.
    spriteRegularIcon.setAttribute('visibility', 'visible');
    spriteWalkIcon.setAttribute('visibility', 'hidden');

    xOffset = sprite.width * spriteFrameNumber(i);
    yOffset = 0;

    spriteIcon = spriteRegularIcon;
    spriteClipRect = document.getElementById('spriteClipRect' + i);
    unusedSpriteClipRect = document.getElementById('spriteWalkClipRect' + i);
  }

  var xCoordPrev = spriteClipRect.getAttribute('x');
  var yCoordPrev = spriteClipRect.getAttribute('y');

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

  if (sprite.dir !== sprite.displayDir) {
    // Every other frame, assign a new displayDir from state table
    // (only one turn at a time):
    if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
      sprite.displayDir = NextTurn[sprite.displayDir][sprite.dir];
    }
  }

  spriteIcon.setAttribute('x', sprite.x - xOffset);
  spriteIcon.setAttribute('y', sprite.y - yOffset);

  spriteClipRect.setAttribute('x', sprite.x);
  spriteClipRect.setAttribute('y', sprite.y);

  // Update the other clip rect too, so that calculations involving
  // inter-frame differences (just above, to calculate sprite.dir)
  // are correct when we transition between spritesheets.
  unusedSpriteClipRect.setAttribute('x', sprite.x);
  unusedSpriteClipRect.setAttribute('y', sprite.y);

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
  if (studioApp.isUsingBlockly()) {
    if (Studio.currentEventParams) {
      for (var prop in Studio.currentEventParams) {
        cmd.opts[prop] = Studio.currentEventParams[prop];
      }
    }
    Studio.currentCmdQueue.push(cmd);
  } else {
    // in editCode/interpreter mode, all commands are executed immediately:
    Studio.callCmd(cmd);
  }
};

Studio.executeQueue = function (name) {
  Studio.eventHandlers.forEach(function (handler) {
    if (handler.name === name && handler.cmdQueue.length) {
      for (var cmd = handler.cmdQueue[0]; cmd; cmd = handler.cmdQueue[0]) {
        if (Studio.callCmd(cmd)) {
          // Command executed immediately, remove from queue and continue
          handler.cmdQueue.shift();
        } else {
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
    case 'setBackground':
      studioApp.highlight(cmd.id);
      Studio.setBackground(cmd.opts);
      break;
    case 'setSprite':
      studioApp.highlight(cmd.id);
      Studio.setSprite(cmd.opts);
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
      studioApp.playAudio(cmd.opts.soundName, { volume: 1.0 });
      Studio.playSoundCount++;
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
    case 'onEvent':
      studioApp.highlight(cmd.id);
      Studio.onEvent(cmd.opts);
      break;
  }
  return true;
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

  explosion.setAttribute('height', Studio.sprite[opts.spriteIndex].height);
  explosion.setAttribute('width', Studio.sprite[opts.spriteIndex].width);
  explosion.setAttribute('x', spriteClipRect.getAttribute('x'));
  explosion.setAttribute('y', spriteClipRect.getAttribute('y'));
  explosion.setAttribute('visibility', 'visible');

  var baseX = parseInt(spriteClipRect.getAttribute('x'), 10);
  var numFrames = skin.explosionFrames;
  if (numFrames && numFrames > 1) {
    explosion.setAttribute('clip-path', 'url(#spriteClipPath' + opts.spriteIndex + ')');
    explosion.setAttribute('width', numFrames * 100);
    _.range(0, numFrames).forEach(function (i) {
      Studio.perExecutionTimeouts.push(setTimeout(function () {
        explosion.setAttribute('x', baseX - i * 100);
        sprite.setAttribute('opacity', (numFrames - i) / numFrames);
      }, i * 100));
    });
    Studio.perExecutionTimeouts.push(setTimeout(function () {
      explosion.setAttribute('visibility', 'hidden');
      // hide the sprite
      Studio.setSprite({
        spriteIndex: opts.spriteIndex,
        value: 'hidden'
      });
      sprite.removeAttribute('opacity');

    }, 100 * (numFrames + 1)));
  } else {
    // hide the sprite
    Studio.setSprite({
      spriteIndex: opts.spriteIndex,
      value: 'hidden'
    });
  }

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
  var speed = Math.min(Math.max(opts.value, 2), 12);
  Studio.sprite[opts.spriteIndex].speed = speed;
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
  Studio.playerScore += Number(opts.value);
  Studio.displayScore();
};

Studio.setScoreText = function (opts) {
  Studio.scoreText = opts.text;
  Studio.displayScore();
};

Studio.setBackground = function (opts) {
  var element = document.getElementById('background');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skin[opts.value].background);
};

/**
 * Sets an actor to be a specific sprite, or alternatively to be hidden.
 * @param opts.value {string} Name of sprite, or 'hidden'
 * @param opts.spriteIndex {number} Index of the sprite
 */
Studio.setSprite = function (opts) {
  var spriteIndex = opts.spriteIndex;
  var sprite = Studio.sprite[spriteIndex];
  var spriteValue = opts.value;

  var spriteIcon = document.getElementById('sprite' + spriteIndex);
  if (!spriteIcon) {
    return;
  }

  // If this skin has walking spritesheet, then load that too.
  var spriteWalk = null;
  if (spriteValue !== undefined && skin[spriteValue] && skin[spriteValue].walk) {
    spriteWalk = document.getElementById('spriteWalk' + spriteIndex);
    if (!spriteWalk) {
      return;
    }

    // Hide the walking sprite at this stage.
    spriteWalk.setAttribute('visibility', 'hidden');
  }

  sprite.visible = (spriteValue !== 'hidden' && !opts.forceHidden);
  spriteIcon.setAttribute('visibility', sprite.visible ? 'visible' : 'hidden');
  sprite.value = opts.forceHidden ? 'hidden' : opts.value;
  if (spriteValue === 'hidden' || spriteValue === 'visible') {
    return;
  }

  sprite.frameCounts = skin[spriteValue].frameCounts;
  sprite.timePerFrame = skin[spriteValue].timePerFrame;
  // Reset height and width:
  sprite.height = sprite.size * skin.spriteHeight;
  sprite.width = sprite.size * skin.spriteWidth;
  if (skin.projectileSpriteHeight) {
    sprite.projectileSpriteHeight = sprite.size * skin.projectileSpriteHeight;
  }
  if (skin.projectileSpriteWidth) {
    sprite.projectileSpriteWidth = sprite.size * skin.projectileSpriteWidth;
  }

  var spriteClipRect = document.getElementById('spriteClipRect' + spriteIndex);
  spriteClipRect.setAttribute('width', sprite.width);
  spriteClipRect.setAttribute('height', sprite.height);

  spriteIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skin[spriteValue].sprite);
  spriteIcon.setAttribute('width', sprite.width * spriteTotalFrames(spriteIndex));
  spriteIcon.setAttribute('height', sprite.height);

  if (spriteWalk) {
    // And set up the cliprect so we can show the right item from the spritesheet.
    var spriteWalkClipRect = document.getElementById('spriteWalkClipRect' + spriteIndex);
    spriteWalkClipRect.setAttribute('width', sprite.width);
    spriteWalkClipRect.setAttribute('height', sprite.height);

    spriteWalk.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin[spriteValue].walk);
    var spriteFramecounts = Studio.sprite[spriteIndex].frameCounts;
    spriteWalk.setAttribute('width', sprite.width * spriteFramecounts.turns); // 800
    spriteWalk.setAttribute('height', sprite.height * spriteFramecounts.walk); // 1200
  }

  // call display right away since the frame number may have changed:
  Studio.displaySprite(spriteIndex);
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

  var frames;

  if (/.gif$/.test(skin[options.className])) {
    frames = 1;
  } else if (skin.specialProjectileFrames && skin.specialProjectileFrames[options.className]) {
    frames = skin.specialProjectileFrames[options.className];
  } else {
    frames = skin.projectileFrames;
  }

  var projectileOptions = {
    frames: frames,
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
  // opts.projectile will be set when we've had a collision with a particular
  // projectile, otherwise we operate all all of that class
  if (opts.projectile) {
    doMakeProjectile(opts.projectile, opts.action);
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

/**
 * Call the handler for src colliding with target
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
  }
}

/**
 * Execute the code for src colliding with target
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
  }
}

/**
 * Looks to see if sprite is already colliding with target.  If it isn't, it
 * starts the collision and calls the relevant code.
 * @param {number} spriteIndex Index of the sprite colliding
 * @param {string/number} target Class name of the target. String for edges,
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
  sprite.x = opts.x;
  sprite.y = opts.y;
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
  sprite.x = x;
  sprite.y = y;
  // Reset to "no direction" so no turn animation will take place
  sprite.dir = Direction.NONE;
};

Studio.moveSingle = function (opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  sprite.lastMove = Studio.tickCount;
  switch (opts.dir) {
    case Direction.NORTH:
      sprite.y -= sprite.speed;
      if (sprite.y < 0 && !level.allowSpritesOutsidePlayspace) {
        sprite.y = 0;
      }
      break;
    case Direction.EAST:
      sprite.x += sprite.speed;
      var rightBoundary = Studio.MAZE_WIDTH - sprite.width;
      if (sprite.x > rightBoundary && !level.allowSpritesOutsidePlayspace) {
        sprite.x = rightBoundary;
      }
      break;
    case Direction.SOUTH:
      sprite.y += sprite.speed;
      var bottomBoundary = Studio.MAZE_HEIGHT - sprite.height;
      if (sprite.y > bottomBoundary && !level.allowSpritesOutsidePlayspace) {
        sprite.y = bottomBoundary;
      }
      break;
    case Direction.WEST:
      sprite.x -= sprite.speed;
      if (sprite.x < 0 && !level.allowSpritesOutsidePlayspace) {
        sprite.x = 0;
      }
      break;
  }
};

Studio.moveDistance = function (opts) {
  if (!opts.started) {
    opts.started = true;
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
  // If the only event block that had children is when_run, and those commands
  // are finished executing, don't wait for the timeout.
  // If we have additional event blocks that DO have children, we don't timeout
  // until timeoutFailureTick
  if (level.timeoutAfterWhenRun) {
    if (Studio.eventHandlers.length === 0 || (Studio.eventHandlers.length === 1 &&
        Studio.eventHandlers[0].name === 'whenGameStarts' &&
        Studio.allWhenRunBlocksComplete())) {
    return true;
    }
  }

  return Studio.tickCount > Studio.timeoutFailureTick;
};

/**
 * Tests whether the sprite is currently at the goal sprite.
 */
function spriteAtGoal(sprite, goal) {
  var finishCollisionDistance = function (yAxis) {
    var dim1 = yAxis ? sprite.height : sprite.width;
    var dim2 = yAxis ? Studio.MARKER_HEIGHT : Studio.MARKER_WIDTH;
    return constants.FINISH_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
  };

  var xSpriteCenter = sprite.x + sprite.width / 2;
  var ySpriteCenter = sprite.y + sprite.height / 2;

  var xFinCenter = goal.x + Studio.MARKER_WIDTH / 2;
  var yFinCenter = goal.y + Studio.MARKER_HEIGHT / 2;
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
            break;
          }
        }
      }
      playSound = goal.finished;
    }

    if (goal.finished) {
      finishedGoals++;

      // Play a sound unless we've hit the last flag
      if (playSound && finishedGoals !== Studio.spriteGoals_.length) {
        studioApp.playAudio('flag');
      }

      // Change the finish icon to goalSuccess.
      var successAsset = skin.goalSuccess;
      if (level.goalOverride && level.goalOverride.success) {
        successAsset = skin[level.goalOverride.success];
      }
      var spriteFinishIcon = document.getElementById('spriteFinish' + i);
      spriteFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', successAsset);
    }
  }

  return finishedGoals === Studio.spriteGoals_.length;
};

var checkFinished = function () {

  var hasGoals = Studio.spriteGoals_.length !== 0;
  var achievedGoals = Studio.allGoalsVisited();
  var hasSuccessCondition = level.goal && level.goal.successCondition ? true : false;
  var achievedOptionalSuccessCondition = !hasSuccessCondition || utils.valueOr(level.goal.successCondition(), true);
  var achievedRequiredSuccessCondition = hasSuccessCondition && utils.valueOr(level.goal.successCondition(), false);

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

},{"../../locale/current/common":257,"../../locale/current/studio":263,"../StudioApp":4,"../canvg/StackBlur.js":50,"../canvg/canvg.js":51,"../canvg/rgbcolor.js":52,"../canvg/svg_todataurl":53,"../codegen":55,"../constants":57,"../dom":58,"../dropletUtils":59,"../skins":206,"../templates/page.html.ejs":231,"../utils":252,"../xml":253,"./api":208,"./bigGameLogic":209,"./blocks":210,"./collidable":211,"./constants":212,"./controls.html.ejs":213,"./dropletConfig":215,"./extraControlRows.html.ejs":216,"./projectile":219,"./rocketHeightLogic":220,"./samBatLogic":221,"./visualization.html.ejs":224}],224:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
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
},{"ejs":273}],221:[function(require,module,exports){
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

},{"../codegen":55,"../constants":57,"./api":208,"./constants":212,"./customGameLogic":214}],220:[function(require,module,exports){
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

},{"../codegen":55,"./api":208,"./constants":212,"./customGameLogic":214}],219:[function(require,module,exports){
var Collidable = require('./collidable');
var Direction = require('./constants').Direction;
var constants = require('./constants');

var SVG_NS = "http://www.w3.org/2000/svg";

// uniqueId that increments by 1 each time an element is created
var uniqueId = 0;

// mapping of how much we should rotate based on direction
var DIR_TO_ROTATION = {};
DIR_TO_ROTATION[Direction.EAST] = 0;
DIR_TO_ROTATION[Direction.SOUTH] = 90;
DIR_TO_ROTATION[Direction.WEST] = 180;
DIR_TO_ROTATION[Direction.NORTH] = 270;

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


/**
 * A Projectile is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 */
var Projectile = function (options) {
  // call collidable constructor
  Collidable.apply(this, arguments);

  this.height = options.height || 50;
  this.width = options.width || 50;
  this.speed = options.speed || constants.DEFAULT_SPRITE_SPEED / 2;

  this.currentFrame_ = 0;
  var self = this;
  this.animator_ = window.setInterval(function () {
    if (self.loop || self.currentFrame_ + 1 < self.frames) {
      self.currentFrame_ = (self.currentFrame_ + 1) % self.frames;
    }
  }, 50);

  // origin is at an offset from sprite location
  this.x = options.spriteX + OFFSET_CENTER[options.dir].x +
            (options.spriteWidth * OFFSET_FROM_SPRITE[options.dir].x);
  this.y = options.spriteY + OFFSET_CENTER[options.dir].y +
            (options.spriteHeight * OFFSET_FROM_SPRITE[options.dir].y);
};

// inherit from Collidable
Projectile.prototype = new Collidable();

module.exports = Projectile;

/**
 * Create an image element with a clip path
 */
Projectile.prototype.createElement = function (parentElement) {
  // create our clipping path/rect
  this.clipPath = document.createElementNS(SVG_NS, 'clipPath');
  var clipId = 'projectile_clippath_' + (uniqueId++);
  this.clipPath.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);
  this.clipPath.appendChild(rect);

  parentElement.appendChild(this.clipPath);

  this.element = document.createElementNS(SVG_NS, 'image');
  this.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    this.image);
  this.element.setAttribute('height', this.height);
  this.element.setAttribute('width', this.width * this.frames);
  parentElement.appendChild(this.element);

  this.element.setAttribute('clip-path', 'url(#' + clipId + ')');
};

/**
 * Remove our element/clipPath/animator
 */
Projectile.prototype.removeElement = function () {
  if (this.element) {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  }

  // remove clip path element
  if (this.clipPath) {
    this.clipPath.parentNode.removeChild(this.clipPath);
    this.clipPath = null;
  }

  if (this.animator_) {
    window.clearInterval(this.animator_);
    this.animator_ = null;
  }
};

/**
 * Display our projectile at it's current location, rotating as necessary
 */
Projectile.prototype.display = function () {
  var topLeft = {
    x: this.x - this.width / 2,
    y: this.y - this.height / 2
  };

  this.element.setAttribute('x', topLeft.x - this.width * this.currentFrame_);
  this.element.setAttribute('y', topLeft.y);

  var clipRect = this.clipPath.childNodes[0];
  clipRect.setAttribute('x', topLeft.x);
  clipRect.setAttribute('y', topLeft.y);

  if (this.frames > 1) {
    this.element.setAttribute('transform', 'rotate(' + DIR_TO_ROTATION[this.dir] +
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

},{"./collidable":211,"./constants":212}],222:[function(require,module,exports){
/**
 * Load Skin for Studio.
 */
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.

var skinsBase = require('../skins');
var msg = require('../../locale/current/studio');
var constants = require('./constants');

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;


function loadInfinity(skin, assetUrl) {
  skin.preloadAssets = true;

  skin.defaultBackground = 'leafy';
  skin.projectileFrames = 10;

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

  skin.specialProjectileFrames = {
    'projectile_cherry': 13,
    'projectile_ice': 12,
    'projectile_duck': 12
  };

  skin.explosion = skin.assetUrl('vanish.png');
  skin.explosionFrames = 17;

  skin.projectileSpriteWidth = 70;
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

  skin.projectile_hiro = skin.assetUrl('projectile_hiro.png');
  skin.projectile_anna = skin.assetUrl('projectile_anna.png');
  skin.projectile_elsa = skin.assetUrl('projectile_elsa.png');
  skin.projectile_baymax = skin.assetUrl('projectile_baymax.png');
  skin.projectile_rapunzel = skin.assetUrl('projectile_rapunzel.png');
  skin.projectile_cherry = skin.assetUrl('projectile_cherry.png');
  skin.projectile_ice = skin.assetUrl('projectile_ice.png');
  skin.projectile_duck = skin.assetUrl('projectile_duck.png');

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
}

function loadStudio(skin, assetUrl) {
  skin.defaultBackground = 'cave';
  skin.projectileFrames = 8;

  skin.explosion = skin.assetUrl('explosion.gif');
  skin.explosionThumbnail = skin.assetUrl('explosion_thumb.png');

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

  // Images
  skin.yellow_hearts = skin.assetUrl('yellow_hearts.gif');
  skin.purple_hearts = skin.assetUrl('purple_hearts.gif');
  skin.red_hearts = skin.assetUrl('red_hearts.gif');
  skin.blue_fireball = skin.assetUrl('blue_fireball.png');
  skin.purple_fireball = skin.assetUrl('purple_fireball.png');
  skin.red_fireball = skin.assetUrl('red_fireball.png');

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
  skin.rubberSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.flagSound = [skin.assetUrl('win_goal.mp3'),
                    skin.assetUrl('win_goal.ogg')];
  skin.crunchSound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];
  skin.winPointSound = [skin.assetUrl('1_we_win.mp3'),
                        skin.assetUrl('1_we_win.ogg')];
  skin.winPoint2Sound = [skin.assetUrl('2_we_win.mp3'),
                         skin.assetUrl('2_we_win.ogg')];
  skin.losePointSound = [skin.assetUrl('1_we_lose.mp3'),
                         skin.assetUrl('1_we_lose.ogg')];
  skin.losePoint2Sound = [skin.assetUrl('2_we_lose.mp3'),
                          skin.assetUrl('2_we_lose.ogg')];
  skin.goal1Sound = [skin.assetUrl('1_goal.mp3'), skin.assetUrl('1_goal.ogg')];
  skin.goal2Sound = [skin.assetUrl('2_goal.mp3'), skin.assetUrl('2_goal.ogg')];
  skin.woodSound = [skin.assetUrl('1_paddle_bounce.mp3'),
                    skin.assetUrl('1_paddle_bounce.ogg')];
  skin.retroSound = [skin.assetUrl('2_paddle_bounce.mp3'),
                     skin.assetUrl('2_paddle_bounce.ogg')];
  skin.slapSound = [skin.assetUrl('1_wall_bounce.mp3'),
                    skin.assetUrl('1_wall_bounce.ogg')];
  skin.hitSound = [skin.assetUrl('2_wall_bounce.mp3'),
                   skin.assetUrl('2_wall_bounce.ogg')];

  // Settings
  skin.background = skin.assetUrl('background.png');
  skin.spriteHeight = 100;
  skin.spriteWidth = 100;
  skin.dropdownThumbnailWidth = 50;
  skin.dropdownThumbnailHeight = 50;
  skin.preloadAssets = true;

  // take care of items specific to skins
  switch (skin.id) {
    case 'infinity':
      loadInfinity(skin, assetUrl);
      break;
    case 'studio':
      loadStudio(skin, assetUrl);
      break;
  }

  return skin;
};

},{"../../locale/current/studio":263,"../skins":206,"./constants":212}],217:[function(require,module,exports){
/*jshint multistr: true */

var msg = require('../../locale/current/studio');
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
 * @returns test definition suitable for feedback.js::getMissingRequiredBlocks
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

function whenMoveBlocks(yOffset) {
  return '<block type="studio_whenLeft" deletable="false" x="20" y="' + (20 + yOffset).toString() + '"> \
   <next><block type="studio_moveWest"></block> \
   </next></block> \
 <block type="studio_whenRight" deletable="false" x="20" y="'+ (150 + yOffset).toString() +'"> \
   <next><block type="studio_moveEast"></block> \
   </next></block> \
 <block type="studio_whenUp" deletable="false" x="20" y="' + (280 + yOffset).toString() + '"> \
   <next><block type="studio_moveNorth"></block> \
   </next></block> \
 <block type="studio_whenDown" deletable="false" x="20" y="' + (410 + yOffset).toString() + '"> \
   <next><block type="studio_moveSouth"></block> \
   </next></block>';
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
    goal: 'red_fireball',
    success: 'blue_fireball',
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
  'codeFunctions': {
    // Play Lab
    "setSprite": null,
    "setBackground": null,
    "move": null,
    "playSound": null,
    "changeScore": null,
    "setSpritePosition": null,
    "setSpriteSpeed": null,
    "setSpriteEmotion": null,
    "throwProjectile": null,
    "vanish": null,
    "onEvent": null,

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

},{"../../locale/current/studio":263,"../block_utils":27,"../utils":252,"./constants":212}],216:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/current/common') ; buf.push('\n\n');3; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((6,  assetUrl('media/1x1.gif') )), '">', escape((6,  msg.finish() )), '\n    </button>\n  </div>\n');9; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":257,"ejs":273}],215:[function(require,module,exports){
var msg = require('../../locale/current/studio');

module.exports.blocks = [
  {'func': 'setSprite', 'category': 'Play Lab', 'params': ["0", "'cat'"] },
  {'func': 'setBackground', 'category': 'Play Lab', 'params': ["'night'"] },
  {'func': 'move', 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'playSound', 'category': 'Play Lab', 'params': ["'slap'"] },
  {'func': 'changeScore', 'category': 'Play Lab', 'params': ["1"] },
  {'func': 'setSpritePosition', 'category': 'Play Lab', 'params': ["0", "7"] },
  {'func': 'setSpriteSpeed', 'category': 'Play Lab', 'params': ["0", "8"] },
  {'func': 'setSpriteEmotion', 'category': 'Play Lab', 'params': ["0", "1"] },
  {'func': 'throwProjectile', 'category': 'Play Lab', 'params': ["0", "1", "'blue_fireball'"] },
  {'func': 'vanish', 'category': 'Play Lab', 'params': ["0"] },
  {'func': 'onEvent', 'category': 'Play Lab', 'params': ["'when-left'", "function() {\n  \n}"] },
];

module.exports.categories = {
  'Play Lab': {
    'color': 'red',
    'blocks': []
  },
};

},{"../../locale/current/studio":263}],213:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/current/common') ; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" class="arrow">\n    <img src="', escape((5,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" class="arrow">\n    <img src="', escape((8,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" class="arrow">\n    <img src="', escape((11,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" class="arrow">\n    <img src="', escape((14,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n\n');18; if (finishButton) { ; buf.push('\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((21,  assetUrl('media/1x1.gif') )), '">', escape((21,  msg.finish() )), '\n    </button>\n  </div>\n');24; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":257,"ejs":273}],211:[function(require,module,exports){
/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var Direction = require('./constants').Direction;

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
  for (var prop in opts) {
    this[prop] = opts[prop];
  }
  this.visible = this.visible || true;
  this.flags = 0;
  // hash table of other sprites we're currently colliding with
  this.collidingWith_ = {};

  // default num frames is 1
  this.frames = this.frames || 1;
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
  }
};

/**
 * Assumes x/y are center coords (true for projectiles)
 * outOfBounds() returns true if the object is entirely "off screen"
 */
Collidable.prototype.outOfBounds = function () {
  return (this.x < -(this.width / 2)) ||
         (this.x > studioApp.MAZE_WIDTH + (this.width / 2)) ||
         (this.y < -(this.height / 2)) ||
         (this.y > studioApp.MAZE_HEIGHT + (this.height / 2));
};

},{"../StudioApp":4,"./constants":212}],210:[function(require,module,exports){
/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */
'use strict';
/* global Studio */

var studioApp = require('../StudioApp').singleton;
var msg = require('../../locale/current/studio');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
var commonMsg = require('../../locale/current/common');
var codegen = require('../codegen');
var constants = require('./constants');
var utils = require('../utils');
var _ = utils.getLodash();

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
          .appendTitle(new blockly.FieldDropdown(this.K1_SOUNDS, onSoundSelected), 'SOUND');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.SOUNDS, onSoundSelected), 'SOUND');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.studio_playSound.K1_SOUNDS =
      [[msg.soundHit(), 'hit'],
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

  blockly.Blocks.studio_playSound.SOUNDS =
      [[msg.playSoundHit(), 'hit'],
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
        this.VALUES = skin.spriteChoices;
        var dropdown = new blockly.FieldDropdown(skin.spriteChoices);
        // default to first item after random/hidden
        dropdown.setValue(skin.spriteChoices[2][1]);

        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(msg.setSprite());
        }
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

},{"../../locale/current/common":257,"../../locale/current/studio":263,"../StudioApp":4,"../codegen":55,"../sharedFunctionalBlocks":205,"../utils":252,"./constants":212}],263:[function(require,module,exports){
/*studio*/ module.exports = window.blockly.appLocale;
},{}],209:[function(require,module,exports){
var CustomGameLogic = require('./customGameLogic');
var studioConstants = require('./constants');
var Direction = studioConstants.Direction;
var Position = studioConstants.Position;
var codegen = require('../codegen');
var api = require('./api');


/**
 * Custom logic for the MSM BigGame
 * @constructor
 * @implements CustomGameLogic
 */
var BigGameLogic = function (studio) {
  CustomGameLogic.apply(this, arguments);

  this.playerSpriteIndex = 0;
  this.targetSpriteIndex = 1;
  this.dangerSpriteIndex = 2;
};
BigGameLogic.inherits(CustomGameLogic);

BigGameLogic.prototype.onTick = function () {
  if (this.studio_.tickCount === 1) {
    this.onFirstTick_();
    this.studio_.playerScore = 100;
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
    }).bind(this), 500);
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
      this.studio_.vanishActor({spriteIndex:i});
    }
  } else {
    this.studio_.displayScore();
  }
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
      value:"visible"});
  }
};

/**
 * Update the player sprite, using the user provided function.
 */
BigGameLogic.prototype.handleUpdatePlayer_ = function (key) {
  var playerSprite = this.studio_.sprite[this.playerSpriteIndex];

  // sprite.y is the top. get the center
  var centerY = playerSprite.y + playerSprite.height / 2;
  
  // invert Y
  var userSpaceY = this.studio_.MAZE_HEIGHT - centerY;

  var newUserSpaceY = this.update_player(key, userSpaceY);

  // reinvertY
  playerSprite.y = this.studio_.MAZE_HEIGHT - newUserSpaceY - playerSprite.height / 2;
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
    value:"hidden"});
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

},{"../codegen":55,"./api":208,"./constants":212,"./customGameLogic":214}],214:[function(require,module,exports){
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

},{"../codegen":55,"./api":208,"./constants":212}],208:[function(require,module,exports){
var constants = require('./constants');

exports.SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  NORMAL: 5,
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

var SPEECH_BUBBLE_TIME = 3;

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {'value': value});
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

exports.changeScore = function(id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
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

},{"./constants":212}],212:[function(require,module,exports){
'use strict';

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
 * Given a direction, returns the unit vector for it. Currently only supports
 * cardinal directions.
 */
var UNIT_VECTOR = {};
UNIT_VECTOR[Dir.NORTH] = { x: 0, y:-1};
UNIT_VECTOR[Dir.EAST]  = { x: 1, y: 0};
UNIT_VECTOR[Dir.SOUTH] = { x: 0, y: 1};
UNIT_VECTOR[Dir.WEST]  = { x:-1, y: 0};
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
exports.NextTurn[Dir.NORTH][Dir.WEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTH][Dir.SOUTHWEST] = Dir.NORTHWEST;
exports.NextTurn[Dir.NORTH][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.EAST] = {};
exports.NextTurn[Dir.EAST][Dir.NORTH] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.EAST][Dir.SOUTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.WEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.SOUTHWEST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.EAST][Dir.NORTHWEST] = Dir.NORTHEAST;

exports.NextTurn[Dir.SOUTH] = {};
exports.NextTurn[Dir.SOUTH][Dir.NORTH] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.EAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTH][Dir.WEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTH][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTH][Dir.NORTHWEST] = Dir.SOUTHWEST;

exports.NextTurn[Dir.WEST] = {};
exports.NextTurn[Dir.WEST][Dir.NORTH] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.EAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTH] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.WEST][Dir.NORTHEAST] = Dir.NORTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHEAST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.WEST][Dir.NORTHWEST] = Dir.NORTHWEST;

exports.NextTurn[Dir.NORTHEAST] = {};
exports.NextTurn[Dir.NORTHEAST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTH] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.WEST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHEAST] = Dir.NORTHEAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHEAST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.SOUTHWEST] = Dir.EAST;
exports.NextTurn[Dir.NORTHEAST][Dir.NORTHWEST] = Dir.NORTH;

exports.NextTurn[Dir.SOUTHEAST] = {};
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTH] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.EAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.WEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHEAST] = Dir.EAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHEAST] = Dir.SOUTHEAST;
exports.NextTurn[Dir.SOUTHEAST][Dir.SOUTHWEST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHEAST][Dir.NORTHWEST] = Dir.SOUTH;

exports.NextTurn[Dir.SOUTHWEST] = {};
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTH] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.EAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTH] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHEAST] = Dir.SOUTH;
exports.NextTurn[Dir.SOUTHWEST][Dir.SOUTHWEST] = Dir.SOUTHWEST;
exports.NextTurn[Dir.SOUTHWEST][Dir.NORTHWEST] = Dir.WEST;

exports.NextTurn[Dir.NORTHWEST] = {};
exports.NextTurn[Dir.NORTHWEST][Dir.NORTH] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.EAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTH] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.WEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHEAST] = Dir.NORTH;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHEAST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.SOUTHWEST] = Dir.WEST;
exports.NextTurn[Dir.NORTHWEST][Dir.NORTHWEST] = Dir.NORTHWEST;


exports.Emotions = {
  NORMAL: 0,
  HAPPY: 1,
  ANGRY: 2,
  SAD: 3
};

// scale the collision bounding box to make it so they need to overlap a touch:
exports.FINISH_COLLIDE_DISTANCE_SCALING = 0.75;
exports.SPRITE_COLLIDE_DISTANCE_SCALING = 0.9;
exports.DEFAULT_SPRITE_SPEED = 5;
exports.DEFAULT_SPRITE_SIZE = 1;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
exports.SquareType = {
  OPEN: 0,
  SPRITEFINISH: 1,
  SPRITESTART: 16
};


exports.RANDOM_VALUE = 'random';
exports.HIDDEN_VALUE = '"hidden"';
exports.CLICK_VALUE = '"click"';
exports.VISIBLE_VALUE = '"visible"';

},{}]},{},[218]);
