/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */

 /* global $*/

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

var AUTO_HANDLER_MAP = {
  whenRun: 'whenGameStarts',
  whenDown: 'when-down',
  whenUp: 'when-up',
  whenLeft: 'when-left',
  whenRight: 'when-right',
  whenTouchItem: 'whenSpriteCollided-' +
                  (Studio.protagonistSpriteIndex || 0) +
                  '-any_item',
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
  Studio.slowJsExecutionFactor = level.slowJsExecutionFactor || 1;
  Studio.ticksBeforeFaceSouth = Studio.slowJsExecutionFactor +
                                  IDLE_TICKS_BEFORE_FACE_SOUTH;
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

  if (level.wallMapCollisions) {
    Studio.drawMapTiles(svg);
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

function overlappingTest(x1, x2, xVariance, y1, y2, yVariance) {
  return (Math.abs(x1 - x2) < xVariance) && (Math.abs(y1 - y2) < yVariance);
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
        Studio.JSInterpreter.queueEvent(handler.func);
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
 */
function performItemOrProjectileMoves (list) {
  for (var i = list.length - 1; i >= 0; i--) {
    list[i].moveToNextPosition();
    if (list[i].outOfBounds()) {
      list[i].removeElement();
      list.splice(i, 1);
    } else {
      list[i].display();
    }
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

  var animationOnlyFrame = false;

  if (Studio.customLogic) {
    Studio.customLogic.onTick();
  }

  if (Studio.tickCount === 1) {
    callHandler('whenGameStarts');
  }
  Studio.executeQueue('whenGameStarts');

  if (Studio.JSInterpreter) {
    animationOnlyFrame = 0 !== (Studio.tickCount - 1) % Studio.slowJsExecutionFactor;
  }

  callHandler('repeatForever');
  Studio.executeQueue('repeatForever');

  for (var i = 0; i < Studio.spriteCount; i++) {
    Studio.executeQueue('whenSpriteClicked-' + i);
  }

  if (!animationOnlyFrame) {
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
  }

  checkForCollisions();

  if (Studio.JSInterpreter && !animationOnlyFrame) {
    Studio.JSInterpreter.executeInterpreter(Studio.tickCount === 1);
  }

  for (i = 0; i < Studio.spriteCount; i++) {
    if (!animationOnlyFrame) {
      performQueuedMoves(i);
    }

    var isWalking = true;

    // After 5 ticks of no movement, turn sprite forward.
    if (Studio.tickCount - Studio.sprite[i].lastMove > Studio.ticksBeforeFaceSouth) {
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

  performItemOrProjectileMoves(Studio.projectiles);
  performItemOrProjectileMoves(Studio.items);

  if (checkFinished()) {
    Studio.onPuzzleComplete();
  }
};

function spriteCollisionDistance  (i1, i2, yAxis) {
  var dim1 = yAxis ? Studio.sprite[i1].height : Studio.sprite[i1].width;
  var dim2 = yAxis ? Studio.sprite[i2].height : Studio.sprite[i2].width;
  return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
}

function spriteCollidableCollisionDistance (iS, collidable, yAxis) {
  var dim1 = yAxis ? Studio.sprite[iS].height : Studio.sprite[iS].width;
  var dim2 = yAxis ? collidable.height : collidable.width;
  return constants.SPRITE_COLLIDE_DISTANCE_SCALING * (dim1 + dim2) / 2;
}

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
          collidable.removeElement();
          list.splice(i, 1);
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
    }
  }
}

/* Create an edge collision handler callback for a specific item
 */
function createItemEdgeCollisionHandler (item) {
  return function (edgeClass) {
    if (level.blockMovingIntoWalls) {
      // TODO: Find a real direction!!
      item.bounce();
    }
    Studio.currentEventParams = { eventObject: item };
    // Allow cmdQueue extension (pass true) since this handler
    // may be called for multiple items before executing the queue
    // below
    handleItemCollision(item.className, edgeClass, true);
    Studio.currentEventParams = null;
  };
}

function checkForItemCollisions () {
  for (var i = 0; i < Studio.items.length; i++) {
    var item = Studio.items[i];
    var next = item.getNextPosition();

    if (level.wallMapCollisions) {
      if (Studio.willCollidableTouchWall(item, next.x, next.y)) {
        if (level.blockMovingIntoWalls) {
          // TODO: Find a real direction!!
          item.bounce();
        }
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
 * Test to see if a collidable will be touching a wall given particular X/Y
 * position coordinates (center)
 */

Studio.willCollidableTouchWall = function (collidable, xCenter, yCenter) {
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
      if (Studio.map[row][col] & SquareType.WALL) {
        if (overlappingTest(xCenter,
                            (col + 0.5) * Studio.SQUARE_SIZE,
                            Studio.SQUARE_SIZE / 2 + collidable.width / 2,
                            yCenter,
                            (row + 0.5) * Studio.SQUARE_SIZE,
                            Studio.SQUARE_SIZE / 2 + collidable.height / 2)) {
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
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Studio.projectiles = [];
  Studio.items = [];
  Studio.eventHandlers = [];
  Studio.perExecutionTimeouts = [];

  Studio.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  // In our Algebra course, we want to gray out undeletable blocks. I'm not sure
  // whether or not that's desired in our other courses.
  var isAlgebraLevel = !!level.useContractEditor;
  config.grayOutUndeletableBlocks = isAlgebraLevel;

  loadLevel();

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
  config.dropletConfig = dropletConfig;
  config.unusedConfig = [];
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
    clearInterval(timeout);
  });
  Studio.perExecutionTimeouts = [];
  Studio.tickCount = 0;
  for (var i = 0; i < Studio.spriteCount; i++) {
    if (Studio.sprite[i] && Studio.sprite[i].bubbleTimeout) {
      window.clearTimeout(Studio.sprite[i].bubbleTimeout);
    }
  }
  // Reset the projectiles and items (they include animation timers)
  resetItemOrProjectileList(Studio.projectiles);
  resetItemOrProjectileList(Studio.items);
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Studio.reset = function(first) {
  var i;
  Studio.clearEventHandlersKillTickLoop();
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

    document.getElementById('sprite' + i).removeAttribute('opacity');

    var explosion = document.getElementById('explosion' + i);
    if (explosion) {
      explosion.setAttribute('visibility', 'hidden');
    }
  }

  // Create Items that are specified on the map:
  Studio.createLevelItems(svg);

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
 * Runs test of a given example
 * @param exampleBlock
 * @returns {string} string to display after example execution
 */
Studio.getStudioExampleFailure = function (exampleBlock) {
  try {
    var actualBlock = exampleBlock.getInputTargetBlock("ACTUAL");
    var expectedBlock = exampleBlock.getInputTargetBlock("EXPECTED");

    if (!actualBlock) {
      throw new Error('Invalid Call Block');
    }

    if (!expectedBlock) {
      throw new Error('Invalid Result Block');
    }

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
  var tryAgainText;
  // For free play, show keep playing, unless it's a big game level
  if (level.freePlay && !Studio.customLogic instanceof BigGameLogic) {
    tryAgainText = commonMsg.keepPlaying();
  }
  else {
    tryAgainText = commonMsg.tryAgain();
  }


  if (!Studio.waitingForReport) {
    studioApp.displayFeedback({
      app: 'studio', //XXX
      skin: skin.id,
      feedbackType: Studio.testResults,
      tryAgainText: tryAgainText,
      continueText: level.freePlay ? commonMsg.nextPuzzle() : undefined,
      response: Studio.response,
      level: level,
      showingSharing: !level.disableSharing && level.freePlay && !Studio.preExecutionFailure &&
          !level.projectTemplateLevelName,
      feedbackImage: Studio.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Studio.response && Studio.response.save_to_gallery_url,
      message: Studio.message,
      appStrings: {
        reinfFeedbackMsg: studioMsg.reinfFeedbackMsg({backButton: tryAgainText}),
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

  var exampleless = studioApp.getFunctionWithoutExample();
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

  // TODO - what of this belongs in studio app?
  var failingBlockName = '';
  Blockly.mainBlockSpace.findFunctionExamples().forEach(function (exampleBlock) {
    var failure = Studio.getStudioExampleFailure(exampleBlock, true);

    // Update the example result. No-op if we're not currently editing this
    // function.
    Blockly.contractEditor.updateExampleResult(exampleBlock, failure);

    if (failure) {
      failingBlockName = exampleBlock.getInputTargetBlock('ACTUAL')
        .getTitleValue('NAME');
    }
  });

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
    // TODO: connect this up
    // annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }
}

function handleExecutionError(err, lineNumber) {
  if (!lineNumber && err instanceof SyntaxError) {
    // syntax errors came before execution (during parsing), so we need
    // to determine the proper line number by looking at the exception
    lineNumber = err.loc.line;
    // Now select this location in the editor, since we know we didn't hit
    // this while executing (in which case, it would already have been selected)

    codegen.selectEditorRowCol(studioApp.editor, lineNumber - 1, err.loc.column);
  }
  if (!lineNumber && Studio.JSInterpreter) {
    lineNumber = 1 + Studio.JSInterpreter.getNearestUserCodeLine();
  }
  outputError(String(err), ErrorLevel.ERROR, lineNumber);
  Studio.executionError = err;

  // Call onPuzzleComplete() if we're not on a freeplay level:
  if (!level.freePlay) {
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
    var codeWhenRun = studioApp.editor.getValue();
    Studio.JSInterpreter = new JSInterpreter({
      code: codeWhenRun,
      blocks: dropletConfig.blocks,
      enableEvents: true,
      studioApp: studioApp,
      onExecutionError: handleExecutionError,
    });
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

  // If preExecutionFailure testResults should already be set
  if (!Studio.preExecutionFailure) {
    // If the current level is a free play, always return the free play
    // result type
    Studio.testResults = level.freePlay ? TestResults.FREE_PLAY :
      studioApp.getTestResults(levelComplete);
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

/* Return the frame count for items or projectiles
*/
function getFrameCount (className, exceptionList, defaultCount) {
  if (/.gif$/.test(skin[className])) {
    return 1;
  } else if (exceptionList && exceptionList[className]) {
    return exceptionList[className];
  }
  return defaultCount;
}

function cellId(prefix, row, col) {
  return prefix + '_' + row + '_' + col;
}

Studio.drawWallTile = function (svg, row, col) {

  // Placeholder implementation: just drawing boxes with X's in them for now:

  var backgroundId = cellId('wallBackground', row, col);
  var textId = cellId('wallLetter', row, col);

  var group = document.createElementNS(SVG_NS, 'g');
  var background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('id', backgroundId);
  background.setAttribute('width', Studio.SQUARE_SIZE);
  background.setAttribute('height', Studio.SQUARE_SIZE);
  background.setAttribute('x', col * Studio.SQUARE_SIZE);
  background.setAttribute('y', row * Studio.SQUARE_SIZE);
  background.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
  background.setAttribute('stroke', '#000000');
  background.setAttribute('stroke-width', 1);
  group.appendChild(background);

  var text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('id', textId);
  text.setAttribute('class', 'wall-letter');
  text.setAttribute('width', Studio.SQUARE_SIZE);
  text.setAttribute('height', Studio.SQUARE_SIZE);
  text.setAttribute('x', (col + 0.5) * Studio.SQUARE_SIZE);
  text.setAttribute('y', (row + 1) * Studio.SQUARE_SIZE - 12);
  text.setAttribute('font-size', 32);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-family', 'Verdana');
  text.textContent = 'X';
  group.appendChild(text);
  svg.appendChild(group);
};

Studio.createLevelItems = function (svg) {
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      var mapVal = Studio.map[row][col];
      for (var index = 0; index < skin.ItemClassNames.length; index++) {
        if (constants.squareHasItemClass(index, mapVal)) {
          var className = skin.ItemClassNames[index];
          // Create item:
          var itemOptions = {
            frames: getFrameCount(className, skin.specialItemFrames, skin.itemFrames),
            className: className,
            dir: Direction.NONE,
            image: skin[className],
            loop: true,
            x: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * col,
            y: Studio.HALF_SQUARE + Studio.SQUARE_SIZE * row,
          };

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
  for (var row = 0; row < Studio.ROWS; row++) {
    for (var col = 0; col < Studio.COLS; col++) {
      var mapVal = Studio.map[row][col];
      if (mapVal & SquareType.WALL) {
        Studio.drawWallTile(svg, row, col);
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

  if (level.gridAlignedMovement) {
    if (sprite.x > sprite.displayX) {
      sprite.displayX += Studio.SQUARE_SIZE / level.slowJsExecutionFactor;
    } else if (sprite.x < sprite.displayX) {
      sprite.displayX -= Studio.SQUARE_SIZE / level.slowJsExecutionFactor;
    }
    if (sprite.y > sprite.displayY) {
      sprite.displayY += Studio.SQUARE_SIZE / level.slowJsExecutionFactor;
    } else if (sprite.y < sprite.displayY) {
      sprite.displayY -= Studio.SQUARE_SIZE / level.slowJsExecutionFactor;
    }
  } else {
    sprite.displayX = sprite.x;
    sprite.displayY = sprite.y;
  }

  spriteIcon.setAttribute('x', sprite.displayX - xOffset);
  spriteIcon.setAttribute('y', sprite.displayY - yOffset);

  spriteClipRect.setAttribute('x', sprite.displayX);
  spriteClipRect.setAttribute('y', sprite.displayY);

  // Update the other clip rect too, so that calculations involving
  // inter-frame differences (just above, to calculate sprite.dir)
  // are correct when we transition between spritesheets.
  unusedSpriteClipRect.setAttribute('x', sprite.displayX);
  unusedSpriteClipRect.setAttribute('y', sprite.displayY);

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
    case 'moveEast':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.EAST,
      });
      break;
    case 'moveWest':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.WEST,
      });
      break;
    case 'moveNorth':
      studioApp.highlight(cmd.id);
      Studio.moveSingle({
          spriteIndex: Studio.protagonistSpriteIndex || 0,
          dir: Direction.NORTH,
      });
      break;
    case 'moveSouth':
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
    case 'addItemsToScene':
      studioApp.highlight(cmd.id);
      Studio.addItemsToScene(cmd.opts);
      break;
    case 'onEvent':
      studioApp.highlight(cmd.id);
      Studio.onEvent(cmd.opts);
      break;
  }
  return true;
};

Studio.addItemsToScene = function (opts) {
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
  // otherwise, create randomly placed items travelling in a random direction

  var generateRandomItemPosition = function () {
    // TODO (cpirich): check for edge collisions? (currently avoided by placing
    // the items within the coordinate space (x/y min of Studio.HALF_SQUARE,
    // max of max - Studio.HALF_SQUARE)

    var pos = {};
    if (level.gridAlignedMovement) {
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

  for (var i = 0; i < opts.number; i++) {
    var direction = level.gridAlignedMovement ? Direction.NONE :
                      directions[Math.floor(Math.random() * directions.length)];
    var pos = generateRandomItemPosition();
    var itemOptions = {
      frames: getFrameCount(opts.className, skin.specialItemFrames, skin.itemFrames),
      className: opts.className,
      dir: direction,
      image: skin[opts.className],
      loop: true,
      x: pos.x,
      y: pos.y,
    };

    var item = new Item(itemOptions);

    if (level.blockMovingIntoWalls) {
      // TODO (cpirich): just move within the map looking for open spaces instead
      // of randomly retrying random numbers

      var numTries = 0;
      while (Studio.willCollidableTouchWall(item, item.x, item.y)) {
        var newPos = generateRandomItemPosition();
        item.x = newPos.x;
        item.y = newPos.y;
        numTries++;
        if (numTries > 100) {
          break;
        }
      }
    }

    item.createElement(document.getElementById('svgStudio'));
    Studio.items.push(item);
  }
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
  if (level.gridAlignedMovement) {
    // This mode only works properly with square sprites
    sprite.height = sprite.width = Studio.SQUARE_SIZE;
    sprite.size = sprite.width / skin.spriteWidth;
  } else {
    sprite.height = sprite.size * skin.spriteHeight;
    sprite.width = sprite.size * skin.spriteWidth;
  }
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

  var projectileOptions = {
    frames: getFrameCount(options.className, skin.specialProjectileFrames, skin.projectileFrames),
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
 * @param {Collidable} Collidable colliding
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
 * @param {Collidable} Collidable colliding
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

Studio.moveSingle = function (opts) {
  var sprite = Studio.sprite[opts.spriteIndex];
  sprite.lastMove = Studio.tickCount;
  var distance = level.gridAlignedMovement ? Studio.SQUARE_SIZE : sprite.speed;
  switch (opts.dir) {
    case Direction.NORTH:
      if (level.blockMovingIntoWalls &&
          Studio.willSpriteTouchWall(sprite, sprite.x, sprite.y - distance)) {
        break;
      }
      sprite.y -= distance;
      if (sprite.y < 0 && !level.allowSpritesOutsidePlayspace) {
        sprite.y = 0;
      }
      break;
    case Direction.EAST:
      if (level.blockMovingIntoWalls &&
          Studio.willSpriteTouchWall(sprite, sprite.x + distance, sprite.y)) {
        break;
      }
      sprite.x += distance;
      var rightBoundary = Studio.MAZE_WIDTH - sprite.width;
      if (sprite.x > rightBoundary && !level.allowSpritesOutsidePlayspace) {
        sprite.x = rightBoundary;
      }
      break;
    case Direction.SOUTH:
      if (level.blockMovingIntoWalls &&
          Studio.willSpriteTouchWall(sprite, sprite.x, sprite.y + distance)) {
        break;
      }
      sprite.y += distance;
      var bottomBoundary = Studio.MAZE_HEIGHT - sprite.height;
      if (sprite.y > bottomBoundary && !level.allowSpritesOutsidePlayspace) {
        sprite.y = bottomBoundary;
      }
      break;
    case Direction.WEST:
      if (level.blockMovingIntoWalls &&
          Studio.willSpriteTouchWall(sprite, sprite.x - distance, sprite.y)) {
        break;
      }
      sprite.x -= distance;
      if (sprite.x < 0 && !level.allowSpritesOutsidePlayspace) {
        sprite.x = 0;
      }
      break;
  }
  if (level.gridAlignedMovement && Studio.JSInterpreter) {
    Studio.JSInterpreter.yield();
  }
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
