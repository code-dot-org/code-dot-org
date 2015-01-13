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
var codegen = require('../codegen');
var api = require('./api');
var blocks = require('./blocks');
var page = require('../templates/page.html');
var dom = require('../dom');
var Collidable = require('./collidable');
var Projectile = require('./projectile');
var parseXmlElement = require('../xml').parseElement;
var utils = require('../utils');
var _ = utils.getLodash();
var Hammer = utils.getHammer();

if (typeof SVGElement !== 'undefined') { // tests don't have svgelement??
  var rgbcolor = require('../canvg/rgbcolor.js');
  var stackBlur = require('../canvg/StackBlur.js');
  var canvg = require('../canvg/canvg.js');
  var svgToDataUrl = require('../canvg/svg_todataurl');
}

var Direction = constants.Direction;
var NextTurn = constants.NextTurn;
var SquareType = constants.SquareType;
var Emotions = constants.Emotions;
var KeyCodes = constants.KeyCodes;

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

var ProjectileClassNames = [
  'blue_fireball',
  'purple_fireball',
  'red_fireball',
  'purple_hearts',
  'red_hearts',
  'yellow_hearts',
];

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

//The number of blocks to show as feedback.
studioApp.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

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
    if (studioApp.usingBlockly) {
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

Studio.onTick = function() {
  Studio.tickCount++;

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
        Studio.keyState[KeyCodes[key]] == "keydown") {
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
        Studio.btnState[ArrowIds[btn]] == ButtonState.DOWN) {
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

    // After 5 ticks of no movement, turn sprite forward
    if (Studio.tickCount - Studio.sprite[i].lastMove > TICKS_BEFORE_FACE_SOUTH) {
      Studio.sprite[i].dir = Direction.SOUTH;
    }

    // Display sprite:
    Studio.displaySprite(i);
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
    for (j = 0; j < ProjectileClassNames.length; j++) {
      executeCollision(i, ProjectileClassNames[j]);
    }
  }
}

Studio.onSvgDrag = function(e) {
  if (Studio.intervalId) {
    Studio.gesturesObserved[e.gesture.direction] =
      Math.round(e.gesture.distance / DRAG_DISTANCE_TO_MOVE_RATIO);
    e.gesture.preventDefault();
  }
};

Studio.onKey = function(e) {
  // Store the most recent event type per-key
  Studio.keyState[e.keyCode] = e.type;

  // If we are actively running our tick loop, suppress default event handling
  if (Studio.intervalId &&
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
  if (Studio.intervalId) {
    callHandler('whenSpriteClicked-' + spriteIndex);
  }
  e.preventDefault();  // Stop normal events.
};

Studio.onSvgClicked = function(e) {
  // If we are "running", check the cmdQueues.
  if (Studio.intervalId) {
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

  if (studioApp.usingBlockly) {
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

  loadLevel();

  window.addEventListener("keydown", Studio.onKey, false);
  window.addEventListener("keyup", Studio.onKey, false);

  var finishButtonFirstLine = _.isEmpty(level.softButtons);
  var firstControlsRow = require('./controls.html')({
    assetUrl: studioApp.assetUrl,
    finishButton: finishButtonFirstLine
  });
  var extraControlsRow = require('./extraControlRows.html')({
    assetUrl: studioApp.assetUrl,
    finishButton: !finishButtonFirstLine
  });

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: firstControlsRow,
      extraControlRows: extraControlsRow,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
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

    if (studioApp.usingBlockly) {
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

  if (studioApp.usingBlockly && config.level.edit_blocks != 'toolbox_blocks') {
    arrangeStartBlocks(config);
  }

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = studioMsg.makeYourOwn();
  config.makeUrl = "http://code.org/studio";
  config.makeImage = studioApp.assetUrl('media/promo.png');

  // Disable "show code" button in feedback dialog when workspace is hidden
  config.enableShowCode = !config.level.embed && studioApp.editCode;
  config.varsInGlobals = true;

  Studio.initSprites();

  studioApp.init(config);

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Studio.onPuzzleComplete);

  // pre-load images asynchronously
  // (to reduce the likelihood that there is a delay when images
  //  are changed at runtime)
  preloadActorImages();
  preloadProjectileImages();
  preloadBackgroundImages();
};

var preloadImage = function(url) {
  var img = new Image();
  img.src = url;
};

var preloadBackgroundImages = function() {
  // TODO (cpirich): preload for non-blockly
  if (studioApp.usingBlockly) {
    var imageChoices = skin.backgroundChoicesK1;
    for (var i = 0; i < imageChoices.length; i++) {
      preloadImage(imageChoices[i][0]);
    }
  }
};

var preloadProjectileImages = function() {
  for (var i = 0; i < ProjectileClassNames.length; i++) {
    preloadImage(skin[ProjectileClassNames[i]]);
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
  if (Studio.intervalId) {
    window.clearInterval(Studio.intervalId);
  }
  Studio.tickCount = 0;
  Studio.intervalId = 0;
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
  }

  var svg = document.getElementById('svgStudio');

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
  if (studioApp.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  studioApp.reset(false);
  studioApp.attempts++;
  Studio.startTime = new Date();
  Studio.execute();

  if (level.freePlay && (!studioApp.hideSource || level.showFinish)) {
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
      response: Studio.response,
      level: level,
      showingSharing: !level.disableSharing && (level.freePlay),
      feedbackImage: Studio.feedbackImage,
      twitter: twitterOptions,
      // allow users to save freeplay levels to their gallery (impressive non-freeplay levels are autosaved)
      saveToGalleryUrl: level.freePlay && Studio.response && Studio.response.save_to_gallery_url,
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
    ProjectileClassNames.forEach(registerHandlersForClassName);
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
 * Execute the story
 */
Studio.execute = function() {
  var code;
  Studio.result = studioApp.UNSET;
  Studio.testResults = TestResults.NO_TESTS_RUN;
  Studio.waitingForReport = false;
  Studio.response = null;
  var i;

  if (level.editCode) {
    code = utils.generateCodeAliases(level.codeFunctions, 'Studio');
    code += studioApp.editor.getValue();
  }

  var handlers = [];
  if (studioApp.usingBlockly) {
    registerHandlers(handlers, 'when_run', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setValue', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setBackground', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setSpeeds', 'whenGameStarts');
    registerHandlers(handlers, 'functional_start_setBackgroundAndSpeeds',
        'whenGameStarts');
    registerHandlers(handlers, 'functional_start_dummyOnMove',
        'whenGameStarts');
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
    var codeWhenRun = utils.generateCodeAliases(level.codeFunctions, 'Studio');
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
      var wrapper = codegen.makeNativeMemberFunction(interpreter,
                                                     nativeGetCallback,
                                                     null);
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

  Studio.intervalId = window.setInterval(Studio.onTick, Studio.scale.stepSpeed);
};

Studio.feedbackImage = '';
Studio.encodedFeedbackImage = '';

Studio.onPuzzleComplete = function() {
  if (Studio.executionError) {
    Studio.result = ResultType.ERROR;
  } else if (level.freePlay) {
    Studio.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Studio.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  var levelComplete = (Studio.result === ResultType.SUCCESS);

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Studio.testResults = TestResults.FREE_PLAY;
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

  if (typeof document.getElementById('svgStudio').toDataURL === 'undefined') { // don't try it if function is not defined
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

var ANIM_RATE = 6;
var ANIM_OFFSET = 7; // Each sprite animates at a slightly different time
var ANIM_AFTER_NUM_NORMAL_FRAMES = 8;
// Number of ticks between the last time the sprite moved and when we reset them
// to face south.
var TICKS_BEFORE_FACE_SOUTH = 5;

/**
 * Given direction/emotion/tickCount, calculate which frame number we should
 * display for sprite.
 */
function spriteFrameNumber (index) {
  var sprite = Studio.sprite[index];
  var frameNum = 0;
  if (sprite.frameCounts.turns === 7 && sprite.displayDir !== Direction.SOUTH) {
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
    var currentTime = new Date();
    var ellapsed = currentTime - Studio.startTime;

    // Use ellapsed time instead of tickCount
    frameNum = Math.floor(ellapsed / sprite.timePerFrame) % sprite.frameCounts.normal;
  }

  if (!frameNum && sprite.emotion !== Emotions.NORMAL &&
    sprite.frameCounts.emotions > 0) {
    // emotion frames proceed normal, animation, turn frames
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

Studio.displaySprite = function(i) {
  var sprite = Studio.sprite[i];
  var xOffset = sprite.width * spriteFrameNumber(i);

  var spriteIcon = document.getElementById('sprite' + i);
  var spriteClipRect = document.getElementById('spriteClipRect' + i);

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
  spriteIcon.setAttribute('y', sprite.y);

  spriteClipRect.setAttribute('x', sprite.x);
  spriteClipRect.setAttribute('y', sprite.y);

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
  if (studioApp.usingBlockly) {
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
    case 'attachEventHandler':
      studioApp.highlight(cmd.id);
      Studio.attachEventHandler(cmd.opts);
      break;
  }
  return true;
};

Studio.vanishActor = function (opts) {
  var svg = document.getElementById('svgStudio');
  var sprite = document.getElementById('sprite' + opts.spriteIndex);
  if (!sprite || sprite.getAttribute('visibility') === 'hidden') {
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

  // hide the sprite
  Studio.setSprite({
    spriteIndex: opts.spriteIndex,
    value: 'hidden'
  });
  // we append the url with the spriteIndex so that each sprites explosion gets
  // treated as being differently, otherwise chrome will animate all existing
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
  sprite.visible = (spriteValue !== 'hidden' && !opts.forceHidden);
  spriteIcon.setAttribute('visibility', sprite.visible ? 'visible' : 'hidden');
  if (spriteValue === 'hidden' || spriteValue === 'visible') {
    return;
  }

  sprite.frameCounts = skin[spriteValue].frameCounts;
  sprite.timePerFrame = skin[spriteValue].timePerFrame;
  // Reset height and width:
  sprite.height = sprite.size * skin.spriteHeight;
  sprite.width = sprite.size * skin.spriteWidth;
  sprite.value = opts.forceHidden ? 'hidden' : opts.value;

  var spriteClipRect = document.getElementById('spriteClipRect' + spriteIndex);
  spriteClipRect.setAttribute('width', sprite.width);
  spriteClipRect.setAttribute('height', sprite.height);

  spriteIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skin[spriteValue].sprite);
  spriteIcon.setAttribute('width', sprite.width * spriteTotalFrames(spriteIndex));
  spriteIcon.setAttribute('height', sprite.height);
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
    frames: /.gif$/.test(skin[options.className]) ? 1 : skin.projectileFrames,
    className: options.className,
    dir: options.dir,
    image: skin[options.className],
    loop: !preventLoop,
    spriteX: sourceSprite.x,
    spriteY: sourceSprite.y,
    spriteHeight: sourceSprite.height,
    spriteWidth: sourceSprite.width
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
  return ProjectileClassNames.indexOf(className) !== -1;
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

Studio.attachEventHandler = function (opts) {
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
        goal.finished = spriteAtGoal(protagonistSprite, goal);
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
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Studio.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Studio.result = ResultType.FAILURE;
    return true;
  }

  if (Studio.allGoalsVisited()) {
    Studio.result = ResultType.SUCCESS;
    return true;
  }

  if (Studio.timedOut()) {
    Studio.result = ResultType.FAILURE;
    return true;
  }

  return false;
};
