/**
 * Blockly App: Bounce
 *
 * Copyright 2013 Code.org
 *
 */
var React = require('react');
var ReactDOM = require('react-dom');
var studioApp = require('../StudioApp').singleton;
var bounceMsg = require('./locale');
var tiles = require('./tiles');
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
var api = require('./api');
var Provider = require('react-redux').Provider;
import AppView from '../templates/AppView';
var BounceVisualizationColumn = require('./BounceVisualizationColumn');
var dom = require('../dom');
var Hammer = require("../third-party/hammer");
import {getStore} from '../redux';
import {getRandomDonorTwitter} from '../util/twitterHelper';
import {KeyCodes, TestResults, ResultType} from '../constants';

var SquareType = tiles.SquareType;


import '../util/svgelement-polyfill';
import {SignInState} from '../code-studio/progressRedux';

/**
 * Create a namespace for the application.
 */
var Bounce = module.exports;

Bounce.keyState = {};
Bounce.gesturesObserved = {};
Bounce.btnState = {};

var ButtonState = {
  UP: 0,
  DOWN: 1
};

Bounce.BallFlags = {
  MISSED_PADDLE: 1,
  IN_GOAL: 2,
  LAUNCHING: 4
};

var ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

var DRAG_DISTANCE_TO_MOVE_RATIO = 25;

var level;
var skin;

//TODO: Make configurable.
studioApp().setCheckForEmptyBlocks(true);

// Default Scalings
Bounce.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var twitterOptions = {
  text: bounceMsg.shareBounceTwitterDonor({donor: getRandomDonorTwitter()}),
  hashtag: "BounceCode"
};

var loadLevel = function () {
  // Load maps.
  Bounce.map = level.map;
  Bounce.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Bounce.minWorkspaceHeight = level.minWorkspaceHeight;
  Bounce.softButtons_ = level.softButtons || [];
  Bounce.respawnBalls = level.respawnBalls || false;
  Bounce.failOnBallExit = level.failOnBallExit || false;
  Bounce.goal = level.useFlagGoal ? skin.flagGoal : skin.goal;
  Bounce.goalSuccess = level.useFlagGoal ? skin.flagGoalSuccess : skin.goalSuccess;

  // Override scalars.
  for (var key in level.scale) {
    Bounce.scale[key] = level.scale[key];
  }

  // Measure maze dimensions and set sizes.
  // ROWS: Number of tiles down.
  Bounce.ROWS = Bounce.map.length;
  // COLS: Number of tiles across.
  Bounce.COLS = Bounce.map[0].length;
  // Initialize the wallMap.
  initWallMap();
  // Pixel height and width of each maze square (i.e. tile).
  Bounce.SQUARE_SIZE = 50;
  Bounce.PEGMAN_HEIGHT = skin.pegmanHeight;
  Bounce.PEGMAN_WIDTH = skin.pegmanWidth;
  Bounce.BALL_Y_OFFSET = skin.ballYOffset;
  Bounce.PADDLE_Y_OFFSET = skin.paddleYOffset;
  // Height and width of the goal and obstacles.
  Bounce.MARKER_HEIGHT = skin.markerHeight;
  Bounce.MARKER_WIDTH = skin.markerWidth;
  Bounce.GOAL_HEIGHT = level.useFlagGoal ? skin.flagHeight : skin.markerHeight;
  Bounce.GOAL_WIDTH = level.useFlagGoal ? skin.flagWidth : skin.markerWidth;

  Bounce.MAZE_WIDTH = Bounce.SQUARE_SIZE * Bounce.COLS;
  Bounce.MAZE_HEIGHT = Bounce.SQUARE_SIZE * Bounce.ROWS;
  Bounce.PATH_WIDTH = Bounce.SQUARE_SIZE / 3;
};


var initWallMap = function () {
  Bounce.wallMap = new Array(Bounce.ROWS);
  for (var y = 0; y < Bounce.ROWS; y++) {
    Bounce.wallMap[y] = new Array(Bounce.COLS);
  }
};

/**
 * PIDs of async tasks currently executing.
 */
import * as timeoutList from '../lib/util/timeoutList';

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/East/South/West squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
var WALL_TILE_SHAPES = {
  '1X101': [1, 0],  // Horiz top
  '11X10': [2, 1],  // Vert right
  '11XX0': [2, 1],  // Bottom right corner
  '1XX11': [2, 0],  // Top right corner
  '1X001': [1, 0],  // Top horiz right end
  '1X100': [1, 0],  // Top horiz left end
  '1101X': [0, 1],  // Vert left
  '110XX': [0, 1],  // Bottom left corner
  '1X11X': [0, 0],  // Top left corner
  'null0': [1, 1]   // Empty
};

var GOAL_TILE_SHAPES = {
  '1X101': [2, 3],  // Horiz top
  '1XX11': [3, 3],  // Top right corner
  '1X001': [3, 3],  // Top horiz right end
  '1X11X': [0, 2],  // Top left corner
  '1X100': [0, 2],  // Top horiz left end
  'null0': [1, 1]   // Empty
};

// Return a value of '0' if the specified square is not a wall, '1' for
// a wall, 'X' for out of bounds
var wallNormalize = function (x, y) {
  return ((Bounce.map[y] === undefined) ||
          (Bounce.map[y][x] === undefined)) ? 'X' :
            (Bounce.map[y][x] & SquareType.WALL) ? '1' : '0';
};

// Return a value of '0' if the specified square is not a wall, '1' for
// a wall, 'X' for out of bounds
var goalNormalize = function (x, y) {
  return ((Bounce.map[y] === undefined) ||
          (Bounce.map[y][x] === undefined)) ? 'X' :
            (Bounce.map[y][x] & SquareType.GOAL) ? '1' : '0';
};

// Create ball elements
Bounce.createBallElements = function (i) {
  var svg = document.getElementById('svgBounce');
  // Ball's clipPath element, whose (x, y) is reset by Bounce.displayBall
  var ballClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
  ballClip.setAttribute('id', 'ballClipPath' + i);
  var ballClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
  ballClipRect.setAttribute('id', 'ballClipRect' + i);
  ballClipRect.setAttribute('width', Bounce.PEGMAN_WIDTH);
  ballClipRect.setAttribute('height', Bounce.PEGMAN_HEIGHT);
  ballClip.appendChild(ballClipRect);
  svg.appendChild(ballClip);

  // Add ball.
  var ballIcon = document.createElementNS(Blockly.SVG_NS, 'image');
  ballIcon.setAttribute('id', 'ball' + i);
  ballIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                          Bounce.ballImage);
  ballIcon.setAttribute('height', Bounce.PEGMAN_HEIGHT);
  ballIcon.setAttribute('width', Bounce.PEGMAN_WIDTH);
  ballIcon.setAttribute('clip-path', 'url(#ballClipPath' + i + ')');
  svg.appendChild(ballIcon);
};

// Delete ball elements
Bounce.deleteBallElements = function (i) {
  var ballClipPath = document.getElementById('ballClipPath' + i);
  ballClipPath.parentNode.removeChild(ballClipPath);

  var ballIcon = document.getElementById('ball' + i);
  ballIcon.parentNode.removeChild(ballIcon);
};

var drawMap = function () {
  var svg = document.getElementById('svgBounce');
  var i, x, y, tile;

  // Adjust outer element size.
  svg.setAttribute('width', Bounce.MAZE_WIDTH);
  svg.setAttribute('height', Bounce.MAZE_HEIGHT);

  // Attach drag handler.
  var hammerSvg = new Hammer(svg);
  hammerSvg.on("drag", Bounce.onSvgDrag);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Bounce.MAZE_WIDTH + 'px';

  if (skin.background) {
    tile = document.createElementNS(Blockly.SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                        skin.background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Bounce.MAZE_HEIGHT);
    tile.setAttribute('width', Bounce.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  // Draw the tiles making up the maze map.

  // Compute and draw the tile for each square.
  var tileId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      var left;
      var top;
      var image;
      // Compute the tile index.
      tile = wallNormalize(x, y) +
          wallNormalize(x, y - 1) +  // North.
          wallNormalize(x + 1, y) +  // East.
          wallNormalize(x, y + 1) +  // South.
          wallNormalize(x - 1, y);   // West.

      // Draw the tile.
      if (WALL_TILE_SHAPES[tile]) {
        left = WALL_TILE_SHAPES[tile][0];
        top = WALL_TILE_SHAPES[tile][1];
        image = skin.tiles;
      } else {
        // Compute the tile index.
        tile = goalNormalize(x, y) +
            goalNormalize(x, y - 1) +  // North.
            goalNormalize(x + 1, y) +  // East.
            goalNormalize(x, y + 1) +  // South.
            goalNormalize(x - 1, y);   // West.

        if (!GOAL_TILE_SHAPES[tile]) {
          // Empty square.  Use null0.
          tile = 'null0';
        }
        left = GOAL_TILE_SHAPES[tile][0];
        top = GOAL_TILE_SHAPES[tile][1];
        image = skin.goalTiles;
      }
      if (tile !== 'null0' && Bounce.drawTiles) {
        // Tile's clipPath element.
        var tileClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
        tileClip.setAttribute('id', 'tileClipPath' + tileId);
        var tileClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
        tileClipRect.setAttribute('width', Bounce.SQUARE_SIZE);
        tileClipRect.setAttribute('height', Bounce.SQUARE_SIZE);

        tileClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
        tileClipRect.setAttribute('y', y * Bounce.SQUARE_SIZE);

        tileClip.appendChild(tileClipRect);
        svg.appendChild(tileClip);
        // Tile sprite.
        var tileElement = document.createElementNS(Blockly.SVG_NS, 'image');
        tileElement.setAttribute('id', 'tileElement' + tileId);
        tileElement.setAttributeNS('http://www.w3.org/1999/xlink',
                                   'xlink:href',
                                   image);
        tileElement.setAttribute('height', Bounce.SQUARE_SIZE * 4);
        tileElement.setAttribute('width', Bounce.SQUARE_SIZE * 5);
        tileElement.setAttribute('clip-path',
                                 'url(#tileClipPath' + tileId + ')');
        tileElement.setAttribute('x', (x - left) * Bounce.SQUARE_SIZE);
        tileElement.setAttribute('y', (y - top) * Bounce.SQUARE_SIZE);
        svg.appendChild(tileElement);
        // Tile animation
        var tileAnimation = document.createElementNS(Blockly.SVG_NS,
                                                     'animate');
        tileAnimation.setAttribute('id', 'tileAnimation' + tileId);
        tileAnimation.setAttribute('attributeType', 'CSS');
        tileAnimation.setAttribute('attributeName', 'opacity');
        tileAnimation.setAttribute('from', 1);
        tileAnimation.setAttribute('to', 0);
        tileAnimation.setAttribute('dur', '1s');
        tileAnimation.setAttribute('begin', 'indefinite');
        tileElement.appendChild(tileAnimation);
      }

      tileId++;
    }
  }

  Bounce.ballImage = level.theme ? skin[level.theme].ball : skin.ball;
  for (i = 0; i < Bounce.ballCount; i++) {
    Bounce.createBallElements(i);
  }

  if (Bounce.paddleStart_) {
    // Paddle's clipPath element, whose (x, y) is reset by Bounce.displayPaddle
    var paddleClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
    paddleClip.setAttribute('id', 'paddleClipPath');
    var paddleClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
    paddleClipRect.setAttribute('id', 'paddleClipRect');
    paddleClipRect.setAttribute('width', Bounce.PEGMAN_WIDTH);
    paddleClipRect.setAttribute('height', Bounce.PEGMAN_HEIGHT);
    paddleClip.appendChild(paddleClipRect);
    svg.appendChild(paddleClip);

    // Add paddle.
    var paddleIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    paddleIcon.setAttribute('id', 'paddle');
    paddleIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.paddle);
    paddleIcon.setAttribute('height', Bounce.PEGMAN_HEIGHT);
    paddleIcon.setAttribute('width', Bounce.PEGMAN_WIDTH);
    paddleIcon.setAttribute('clip-path', 'url(#paddleClipPath)');
    svg.appendChild(paddleIcon);
  }

  if (Bounce.paddleFinish_) {
    for (i = 0; i < Bounce.paddleFinishCount; i++) {
      // Add finish markers.
      var paddleFinishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
      paddleFinishMarker.setAttribute('id', 'paddlefinish' + i);
      paddleFinishMarker.setAttributeNS('http://www.w3.org/1999/xlink',
                                        'xlink:href',
                                        Bounce.goal);
      paddleFinishMarker.setAttribute('height', Bounce.GOAL_HEIGHT);
      paddleFinishMarker.setAttribute('width', Bounce.GOAL_WIDTH);
      svg.appendChild(paddleFinishMarker);
    }
  }

  if (Bounce.ballFinish_) {
    // Add ball finish marker.
    var ballFinishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
    ballFinishMarker.setAttribute('id', 'ballfinish');
    ballFinishMarker.setAttributeNS('http://www.w3.org/1999/xlink',
                                    'xlink:href',
                                    Bounce.goal);
    ballFinishMarker.setAttribute('height', Bounce.GOAL_HEIGHT);
    ballFinishMarker.setAttribute('width', Bounce.GOAL_WIDTH);
    svg.appendChild(ballFinishMarker);
  }

  var score = document.createElementNS(Blockly.SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'bounce-score');
  score.setAttribute('x', Bounce.MAZE_WIDTH / 2);
  score.setAttribute('y', 60);
  score.appendChild(document.createTextNode('0'));
  score.setAttribute('visibility', 'hidden');
  svg.appendChild(score);

  // Add wall hitting animation
  if (skin.hittingWallAnimation) {
    var wallAnimationIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    wallAnimationIcon.setAttribute('id', 'wallAnimation');
    wallAnimationIcon.setAttribute('height', Bounce.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('width', Bounce.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('visibility', 'hidden');
    svg.appendChild(wallAnimationIcon);
  }

  // Add obstacles.
  var obsId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      if (Bounce.map[y][x] === SquareType.OBSTACLE) {
        var obsIcon = document.createElementNS(Blockly.SVG_NS, 'image');
        obsIcon.setAttribute('id', 'obstacle' + obsId);
        obsIcon.setAttribute('height', Bounce.MARKER_HEIGHT * skin.obstacleScale);
        obsIcon.setAttribute('width', Bounce.MARKER_WIDTH * skin.obstacleScale);
        obsIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle);
        obsIcon.setAttribute('x',
                             Bounce.SQUARE_SIZE * (x + 0.5) -
                             obsIcon.getAttribute('width') / 2);
        obsIcon.setAttribute('y',
                             Bounce.SQUARE_SIZE * (y + 0.9) -
                             obsIcon.getAttribute('height'));
        svg.appendChild(obsIcon);
      }
      ++obsId;
    }
  }
};

Bounce.calcDistance = function (xDist, yDist) {
  return Math.sqrt(xDist * xDist + yDist * yDist);
};

var essentiallyEqual = function (float1, float2, opt_variance) {
  var variance = opt_variance || 0.01;
  return (Math.abs(float1 - float2) < variance);
};

Bounce.isBallOutOfBounds = function (i) {
  if (Bounce.ballX[i] < 0) {
    return true;
  }
  if (Bounce.ballX[i] > Bounce.COLS - 1) {
    return true;
  }
  if (Bounce.ballY[i] < tiles.Y_TOP_BOUNDARY) {
    return true;
  }
  if (Bounce.ballY[i] > Bounce.ROWS - 1) {
    return true;
  }
  return false;
};

/**
 * @param scope Object :  The scope in which to execute the delegated function.
 * @param func Function : The function to execute
 * @param data Object or Array : The data to pass to the function. If the function is also passed arguments, the data is appended to the arguments list. If the data is an Array, each item is appended as a new argument.
 */
var delegate = function (scope, func, data) {
  return function () {
    var args = Array.prototype.slice.apply(arguments).concat(data);
    func.apply(scope, args);
  };
};

/**
 * We want to swallow exceptions when executing user generated code. This provides
 * a single place to do so.
 */
Bounce.callUserGeneratedCode = function (fn) {
  try {
    fn.call(Bounce, api);
  } catch (e) {
    // swallow error. should we also log this somewhere?
    if (console) {
      console.log(e);
    }
  }
};


Bounce.onTick = function () {
  Bounce.tickCount++;

  if (Bounce.tickCount === 1) {
    Bounce.callUserGeneratedCode(Bounce.whenGameStarts);
  }

  // Run key event handlers for any keys that are down:
  for (var key in KeyCodes) {
    if (Bounce.keyState[KeyCodes[key]] &&
        Bounce.keyState[KeyCodes[key]] === "keydown") {
      switch (KeyCodes[key]) {
        case KeyCodes.LEFT:
          Bounce.callUserGeneratedCode(Bounce.whenLeft);
          break;
        case KeyCodes.UP:
          Bounce.callUserGeneratedCode(Bounce.whenUp);
          break;
        case KeyCodes.RIGHT:
          Bounce.callUserGeneratedCode(Bounce.whenRight);
          break;
        case KeyCodes.DOWN:
          Bounce.callUserGeneratedCode(Bounce.whenDown);
          break;
      }
    }
  }

  for (var btn in ArrowIds) {
    if (Bounce.btnState[ArrowIds[btn]] &&
        Bounce.btnState[ArrowIds[btn]] === ButtonState.DOWN) {
      switch (ArrowIds[btn]) {
        case ArrowIds.LEFT:
          Bounce.callUserGeneratedCode(Bounce.whenLeft);
          break;
        case ArrowIds.UP:
          Bounce.callUserGeneratedCode(Bounce.whenUp);
          break;
        case ArrowIds.RIGHT:
          Bounce.callUserGeneratedCode(Bounce.whenRight);
          break;
        case ArrowIds.DOWN:
          Bounce.callUserGeneratedCode(Bounce.whenDown);
          break;
      }
    }
  }

  for (var gesture in Bounce.gesturesObserved) {
    switch (gesture) {
      case 'left':
        Bounce.callUserGeneratedCode(Bounce.whenLeft);
        break;
      case 'up':
        Bounce.callUserGeneratedCode(Bounce.whenUp);
        break;
      case 'right':
        Bounce.callUserGeneratedCode(Bounce.whenRight);
        break;
      case 'down':
        Bounce.callUserGeneratedCode(Bounce.whenDown);
        break;
    }
    if (0 === Bounce.gesturesObserved[gesture]--) {
      delete Bounce.gesturesObserved[gesture];
    }
  }

  for (var i = 0; i < Bounce.ballCount; i++) {
    var deltaX = Bounce.ballSpeed[i] * Math.sin(Bounce.ballDir[i]);
    var deltaY = -Bounce.ballSpeed[i] * Math.cos(Bounce.ballDir[i]);

    var wasXOK = Bounce.ballX[i] >= 0 && Bounce.ballX[i] <= Bounce.COLS - 1;
    var wasYOK = Bounce.ballY[i] >= tiles.Y_TOP_BOUNDARY;
    var wasYAboveBottom = Bounce.ballY[i] <= Bounce.ROWS - 1;

    Bounce.ballX[i] += deltaX;
    Bounce.ballY[i] += deltaY;
    Bounce.ballRotation[i] += Bounce.ballRotationSpeed;

    if (0 === (Bounce.ballFlags[i] &
               (Bounce.BallFlags.MISSED_PADDLE | Bounce.BallFlags.IN_GOAL))) {
      var nowXOK = Bounce.ballX[i] >= 0 && Bounce.ballX[i] <= Bounce.COLS - 1;
      var nowYOK = Bounce.ballY[i] >= tiles.Y_TOP_BOUNDARY;
      var nowYAboveBottom = Bounce.ballY[i] <= Bounce.ROWS - 1;

      if (wasYOK && wasXOK && !nowXOK) {
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenWallCollided);
      }

      if (wasXOK && wasYOK && !nowYOK) {
        if (Bounce.map[0][Math.round(Bounce.ballX[i])] & SquareType.GOAL) {
          //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
          Bounce.callUserGeneratedCode(Bounce.whenBallInGoal);
          Bounce.ballFlags[i] |= Bounce.BallFlags.IN_GOAL;
          timeoutList.setTimeout(
              delegate(this, Bounce.moveBallOffscreen, i),
              1000);
          if (Bounce.respawnBalls) {
            Bounce.launchBall(i);
          }
        } else {
          //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
          Bounce.callUserGeneratedCode(Bounce.whenWallCollided);
        }
      }

      var xPaddleBall = Bounce.ballX[i] - Bounce.paddleX;
      var yPaddleBall = Bounce.ballY[i] - Bounce.paddleY;
      var distPaddleBall = Bounce.calcDistance(xPaddleBall, yPaddleBall);

      if (distPaddleBall < tiles.PADDLE_BALL_COLLIDE_DISTANCE) {
        // paddle ball collision
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenPaddleCollided);
      } else if (wasYAboveBottom && !nowYAboveBottom) {
        // ball missed paddle
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenBallMissesPaddle);
        Bounce.ballFlags[i] |= Bounce.BallFlags.MISSED_PADDLE;
        timeoutList.setTimeout(
            delegate(this, Bounce.moveBallOffscreen, i),
            1000);
        if (Bounce.respawnBalls) {
          Bounce.launchBall(i);
        } else if (Bounce.failOnBallExit) {
          Bounce.result = ResultType.FAILURE;
          Bounce.onPuzzleComplete();
        }
      }
    }

    Bounce.displayBall(i, Bounce.ballX[i], Bounce.ballY[i], Bounce.ballRotation[i]);
  }

  Bounce.displayPaddle(Bounce.paddleX, Bounce.paddleY);

  if (checkFinished()) {
    Bounce.onPuzzleComplete();
  }
};

Bounce.onSvgDrag = function (e) {
  if (Bounce.intervalId) {
    Bounce.gesturesObserved[e.gesture.direction] =
      Math.round(e.gesture.distance / DRAG_DISTANCE_TO_MOVE_RATIO);
    e.gesture.preventDefault();
  }
};

Bounce.onKey = function (e) {
  // Store the most recent event type per-key
  Bounce.keyState[e.keyCode] = e.type;

  // If we are actively running our tick loop, suppress default event handling
  if (Bounce.intervalId &&
      e.keyCode >= KeyCodes.LEFT && e.keyCode <= KeyCodes.DOWN) {
    e.preventDefault();
  }
};

Bounce.onArrowButtonDown = function (e, idBtn) {
  // Store the most recent event type per-button
  Bounce.btnState[idBtn] = ButtonState.DOWN;
  e.preventDefault();  // Stop normal events so we see mouseup later.
};

Bounce.onArrowButtonUp = function (e, idBtn) {
  // Store the most recent event type per-button
  Bounce.btnState[idBtn] = ButtonState.UP;
};

Bounce.onMouseUp = function (e) {
  // Reset btnState on mouse up
  Bounce.btnState = {};
};

/**
 * Initialize Blockly and the Bounce app.  Called on page load.
 */
Bounce.init = function (config) {
  // replace studioApp() methods with our own
  studioApp().reset = this.reset.bind(this);
  studioApp().runButtonClick = this.runButtonClick.bind(this);

  Bounce.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  loadLevel();

  window.addEventListener("keydown", Bounce.onKey, false);
  window.addEventListener("keyup", Bounce.onKey, false);

  config.loadAudio = function () {
    studioApp().loadAudio(skin.winSound, 'win');
    studioApp().loadAudio(skin.startSound, 'start');
    studioApp().loadAudio(skin.failureSound, 'failure');

    for (var sound in skin.customSounds) {
      studioApp().loadAudio(skin.customSounds[sound].urls, sound);
    }
  };

  config.afterInject = function () {
    // Connect up arrow button event handlers
    for (var btn in ArrowIds) {
      dom.addMouseUpTouchEvent(document.getElementById(ArrowIds[btn]),
                               delegate(this,
                                        Bounce.onArrowButtonUp,
                                        ArrowIds[btn]));
      dom.addMouseDownTouchEvent(document.getElementById(ArrowIds[btn]),
                                 delegate(this,
                                          Bounce.onArrowButtonDown,
                                          ArrowIds[btn]));
    }
    document.addEventListener('mouseup', Bounce.onMouseUp, false);

    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    Blockly.SNAP_RADIUS *= Bounce.scale.snapRadius;

    Bounce.ballStart_ = [];
    Bounce.ballX = [];
    Bounce.ballY = [];
    Bounce.ballRotation = [];
    Bounce.ballDir = [];
    Bounce.ballSpeed = [];
    Bounce.ballFlags = [];
    Bounce.ballCount = 0;
    Bounce.originalBallCount = 0;
    Bounce.paddleFinishCount = 0;
    Bounce.ballRotationSpeed = 0;
    Bounce.defaultBallSpeed = level.ballSpeed || tiles.DEFAULT_BALL_SPEED;
    Bounce.defaultBallDir = level.ballDirection || tiles.DEFAULT_BALL_DIRECTION;
    Bounce.drawTiles = level.theme ? skin[level.theme].drawTiles : skin.drawTiles;

    // Locate the start and finish squares.
    for (var y = 0; y < Bounce.ROWS; y++) {
      for (var x = 0; x < Bounce.COLS; x++) {
        if (Bounce.map[y][x] & SquareType.PADDLEFINISH) {
          if (0 === Bounce.paddleFinishCount) {
            Bounce.paddleFinish_ = [];
          }
          Bounce.paddleFinish_[Bounce.paddleFinishCount] = {x: x, y: y};
          Bounce.paddleFinishCount++;
        } else if (Bounce.map[y][x] & SquareType.BALLSTART) {
          Bounce.ballStart_[Bounce.ballCount] = { x: x, y: y};
          Bounce.ballCount++;
        } else if (Bounce.map[y][x] & SquareType.PADDLESTART) {
          Bounce.paddleStart_ = {x: x, y: y};
        } else if (Bounce.map[y][x] & SquareType.BALLFINISH) {
          Bounce.ballFinish_ = {x: x, y: y};
        } else if (Bounce.map[y][x] & SquareType.GOAL) {
          Bounce.goalLocated_ = true;
        }
      }
    }

    Bounce.originalBallCount = Bounce.ballCount;

    drawMap();
  };

  // Block placement default (used as fallback in the share levels)
  config.blockArrangement = {
    'when_run': { x: 20, y: 20},
    'bounce_whenLeft': { x: 20, y: 220},
    'bounce_whenRight': { x: 180, y: 220},
    'bounce_whenPaddleCollided': { x: 20, y: 310},
    'bounce_whenWallCollided': { x: 20, y: 410},
    'bounce_whenBallInGoal': { x: 20, y: 510},
    'bounce_whenBallMissesPaddle': { x: 20, y: 630}
  };

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = bounceMsg.makeYourOwn();
  config.makeUrl = "http://code.org/bounce";
  config.makeImage = studioApp().assetUrl('media/promo.png');

  config.enableShowCode = false;
  config.enableShowBlockCount = false;

  if (
    config.embed &&
    config.level.markdownInstructions &&
    !config.level.instructions
  ) {
    // if we are an embedded level with markdown instructions but no regular
    // instructions, we want to display CSP-style instructions and not be
    // centered
    config.noInstructionsWhenCollapsed = true;
    config.centerEmbedded = false;
  }

  var onMount = function () {
    studioApp().init(config);

    var finishButton = document.getElementById('finishButton');
    dom.addClickTouchEvent(finishButton, Bounce.onPuzzleComplete);
  };

  studioApp().setPageConstants(config);

  ReactDOM.render(
    <Provider store={getStore()}>
      <AppView
        visualizationColumn={<BounceVisualizationColumn/>}
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Bounce.clearEventHandlersKillTickLoop = function () {
  Bounce.whenWallCollided = null;
  Bounce.whenBallInGoal = null;
  Bounce.whenBallMissesPaddle = null;
  Bounce.whenPaddleCollided = null;
  Bounce.whenDown = null;
  Bounce.whenLeft = null;
  Bounce.whenRight = null;
  Bounce.whenUp = null;
  Bounce.whenGameStarts = null;
  if (Bounce.intervalId) {
    window.clearInterval(Bounce.intervalId);
  }
  Bounce.intervalId = 0;
  // Kill all tasks.
  timeoutList.clearTimeouts();
};

/**
 * Move ball to a safe place off of the screen.
 * @param {int} i Index of ball to be moved.
 */
Bounce.moveBallOffscreen = function (i) {
  Bounce.ballX[i] = 100;
  Bounce.ballY[i] = 100;
  Bounce.ballDir[i] = 0;
  Bounce.ballRotation[i] = 0;
  // stop the ball from moving if we're not planning to respawn:
  Bounce.ballSpeed[i] = 0;
};

/**
 * Play a start sound and reset the ball at index i and redraw it.
 * @param {int} i Index of ball to be reset.
 */
Bounce.playSoundAndResetBall = function (i) {
  Bounce.resetBall(i, { randomPosition: true } );
  studioApp().playAudio('ballstart');
};

/**
 * Launch the ball from index i from a start position and launch it.
 * @param {int} i Index of ball to be launched.
 */
Bounce.launchBall = function (i) {
  Bounce.ballFlags[i] |= Bounce.BallFlags.LAUNCHING;
  timeoutList.setTimeout(delegate(this, Bounce.playSoundAndResetBall, i), 3000);
};

/**
 * Reset the ball from index i to the start position and redraw it.
 * @param {int} i Index of ball to be reset.
 * @param {options} randomPosition: random start
 */
Bounce.resetBall = function (i, options) {
  var randStart = options.randomPosition ||
                  typeof Bounce.ballStart_[i] === 'undefined';
  Bounce.ballX[i] =  randStart ? Math.floor(Math.random() * Bounce.COLS) :
                                 Bounce.ballStart_[i].x;
  Bounce.ballY[i] =  randStart ? tiles.DEFAULT_BALL_START_Y :
                                 Bounce.ballStart_[i].y;
  Bounce.ballRotation[i] = 0;
  Bounce.ballDir[i] = randStart ?
                        (Math.random() * Math.PI / 2) + Math.PI * 0.75 :
                        Bounce.defaultBallDir;
  Bounce.ballSpeed[i] = Bounce.currentBallSpeed;
  Bounce.ballFlags[i] = 0;

  Bounce.displayBall(i, Bounce.ballX[i], Bounce.ballY[i], Bounce.ballRotation[i]);
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Bounce.reset = function (first) {
  var i;
  Bounce.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Bounce.softButtons_.length; i++) {
    document.getElementById(Bounce.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  Bounce.gesturesObserved = {};

  // Reset the score.
  Bounce.playerScore = 0;
  Bounce.opponentScore = 0;
  document.getElementById('score').setAttribute('visibility', 'hidden');

  // Reset configurable variables
  var theme = level.theme || 'hardcourt';
  Bounce.setBackground(theme);
  Bounce.setBall(theme);
  Bounce.setPaddle(theme);
  Bounce.currentBallSpeed = Bounce.defaultBallSpeed;

  // Remove any extra balls that were created dynamically.
  for (i = Bounce.originalBallCount; i < Bounce.ballCount; i++) {
    Bounce.deleteBallElements(i);
  }
  // Reset ballCount back to the original value
  Bounce.ballCount = Bounce.originalBallCount;
  // Move ball(s) into position.
  for (i = 0; i < Bounce.ballCount; i++) {
    Bounce.resetBall(i, {});
  }

  // Move Paddle into position.
  Bounce.paddleX = Bounce.paddleStart_.x;
  Bounce.paddleY = Bounce.paddleStart_.y;
  Bounce.paddleSpeed = tiles.DEFAULT_PADDLE_SPEED;

  Bounce.displayPaddle(Bounce.paddleX, Bounce.paddleY);

  if (Bounce.paddleFinish_) {
    for (i = 0; i < Bounce.paddleFinishCount; i++) {
      // Mark each finish as incomplete.
      Bounce.paddleFinish_[i].finished = false;

      // Move the finish icons into position.
      var paddleFinishIcon = document.getElementById('paddlefinish' + i);
      paddleFinishIcon.setAttribute(
          'x',
          Bounce.SQUARE_SIZE * (Bounce.paddleFinish_[i].x + 0.5) -
          paddleFinishIcon.getAttribute('width') / 2);
      paddleFinishIcon.setAttribute(
          'y',
          Bounce.SQUARE_SIZE * (Bounce.paddleFinish_[i].y + 0.9) -
          paddleFinishIcon.getAttribute('height'));
      paddleFinishIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          Bounce.goal);
    }
  }

  if (Bounce.ballFinish_) {
    // Move the finish icon into position.
    var ballFinishIcon = document.getElementById('ballfinish');
    ballFinishIcon.setAttribute(
        'x',
        Bounce.SQUARE_SIZE * (Bounce.ballFinish_.x + 0.5) -
        ballFinishIcon.getAttribute('width') / 2);
    ballFinishIcon.setAttribute(
        'y',
        Bounce.SQUARE_SIZE * (Bounce.ballFinish_.y + 0.9) -
        ballFinishIcon.getAttribute('height'));
    ballFinishIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        Bounce.goal);
  }

  // Reset the obstacle image.
  var obsId = 0;
  var x, y;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      var obsIcon = document.getElementById('obstacle' + obsId);
      if (obsIcon) {
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                               skin.obstacle);
      }
      ++obsId;
    }
  }

  // Reset the tiles
  var tileId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      // Tile's clipPath element.
      var tileClip = document.getElementById('tileClipPath' + tileId);
      if (tileClip) {
        tileClip.setAttribute('visibility', 'visible');
      }
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      if (tileElement) {
        tileElement.setAttribute('opacity', 1);
      }
      tileId++;
    }
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Bounce.runButtonClick = function () {
  if (level.edit_blocks) {
    Bounce.onPuzzleComplete();
  }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  studioApp().toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp().reset(false);
  studioApp().attempts++;
  Bounce.execute();

  if (level.freePlay && !level.isProjectLevel && !studioApp().hideSource) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
  }
  if (Bounce.goalLocated_) {
    document.getElementById('score').setAttribute('visibility', 'visible');
    Bounce.displayScore();
  }
};

/**
 * App specific displayFeedback function that calls into
 * studioApp().displayFeedback when appropriate
 */
var displayFeedback = function () {
  const isSignedIn = getStore().getState().progress.signInState === SignInState.SignedIn;
  if (!Bounce.waitingForReport) {
    studioApp().displayFeedback({
      feedbackType: Bounce.testResults,
      response: Bounce.response,
      level: level,
      showingSharing: level.freePlay,
      feedbackImage: Bounce.feedbackImage,
      twitter: twitterOptions,
      appStrings: {
        reinfFeedbackMsg: bounceMsg.reinfFeedbackMsg(),
        sharingText: bounceMsg.shareGame()
      },
      saveToProjectGallery: true,
      disableSaveToGallery: !isSignedIn,
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {MilestoneResponse} response - JSON response (if available)
 */
Bounce.onReportComplete = function (response) {
  Bounce.response = response;
  Bounce.waitingForReport = false;
  studioApp().onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Bounce.execute = function () {
  Bounce.result = ResultType.UNSET;
  Bounce.testResults = TestResults.NO_TESTS_RUN;
  Bounce.waitingForReport = false;
  Bounce.response = null;

  // Map event handler hooks (e.g. Bounce.whenLeft) to the generated code.
  const generator = Blockly.Generator.blockSpaceToCode.bind(Blockly.Generator, 'JavaScript');
  const events = {
    whenWallCollided: {code: generator('bounce_whenWallCollided')},
    whenBallInGoal: {code: generator('bounce_whenBallInGoal')},
    whenBallMissesPaddle: {code: generator('bounce_whenBallMissesPaddle')},
    whenPaddleCollided: {code: generator('bounce_whenPaddleCollided')},
    whenLeft: {code: generator('bounce_whenLeft')},
    whenRight: {code: generator('bounce_whenRight')},
    whenUp: {code: generator('bounce_whenUp')},
    whenDown: {code: generator('bounce_whenDown')},
    whenGameStarts: {code: generator('when_run')}
  };

  studioApp().playAudio(Bounce.ballCount > 0 ? 'ballstart' : 'start');
  studioApp().reset(false);

  CustomMarshalingInterpreter.evalWithEvents({Bounce: api}, events).hooks.forEach(hook => {
    Bounce[hook.name] = hook.func;
  });

  Bounce.tickCount = 0;
  Bounce.intervalId = window.setInterval(Bounce.onTick, Bounce.scale.stepSpeed);
};

Bounce.onPuzzleComplete = function () {
  if (level.freePlay) {
    Bounce.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Bounce.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Bounce.result === ResultType.SUCCESS);

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Bounce.testResults = TestResults.FREE_PLAY;
  } else {
    Bounce.testResults = studioApp().getTestResults(levelComplete);
  }

  if (Bounce.testResults >= TestResults.FREE_PLAY) {
    studioApp().playAudioOnWin();
  } else {
    studioApp().playAudioOnFailure();
  }

  if (level.editCode) {
    Bounce.testResults = levelComplete ?
      TestResults.ALL_PASS :
      TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Bounce.waitingForReport = true;

  const sendReport = function () {
    // Report result to server.
    studioApp().report({
      app: 'bounce',
      level: level.id,
      result: Bounce.result === ResultType.SUCCESS,
      testResult: Bounce.testResults,
      program: encodeURIComponent(textBlocks),
      image: Bounce.encodedFeedbackImage,
      onComplete: Bounce.onReportComplete
    });
  };

  if (typeof document.getElementById('svgBounce').toDataURL === 'undefined') {
    sendReport();
  } else {
    document.getElementById('svgBounce').toDataURL("image/jpeg", {
      callback: function (imageDataUrl) {
        Bounce.feedbackImage = imageDataUrl;
        Bounce.encodedFeedbackImage = encodeURIComponent(Bounce.feedbackImage.split(',')[1]);

        sendReport();
      }
    });
  }
};

/**
 * Set the tiles to be transparent gradually.
 */
Bounce.setTileTransparent = function () {
  var tileId = 0;
  for (var y = 0; y < Bounce.ROWS; y++) {
    for (var x = 0; x < Bounce.COLS; x++) {
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      var tileAnimation = document.getElementById('tileAnimation' + tileId);
      if (tileElement) {
        tileElement.setAttribute('opacity', 0);
      }
      if (tileAnimation) {
        tileAnimation.beginElement();
      }
      tileId++;
    }
  }
};

/**
 * Display Ball at the specified location, facing the specified direction.
 * @param {number} i Ball index..
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 */
Bounce.displayBall = function (i, x, y, rotation) {
  var ballIcon = document.getElementById('ball' + i);
  ballIcon.setAttribute('x',
                        x * Bounce.SQUARE_SIZE);
  ballIcon.setAttribute('y',
                        y * Bounce.SQUARE_SIZE + Bounce.BALL_Y_OFFSET);

  var xCenter = (x * Bounce.SQUARE_SIZE) + (Bounce.PEGMAN_WIDTH / 2);
  var yCenter = (y * Bounce.SQUARE_SIZE) + Bounce.BALL_Y_OFFSET + (Bounce.PEGMAN_HEIGHT / 2);
  ballIcon.setAttribute('transform', `rotate(${rotation} ${xCenter} ${yCenter})`);

  var ballClipRect = document.getElementById('ballClipRect' + i);
  ballClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
  ballClipRect.setAttribute('y', ballIcon.getAttribute('y'));
};

/**
 * Display Paddle at the specified location
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 */
Bounce.displayPaddle = function (x, y) {
  var paddleIcon = document.getElementById('paddle');
  paddleIcon.setAttribute('x',
                          x * Bounce.SQUARE_SIZE);
  paddleIcon.setAttribute('y',
                          y * Bounce.SQUARE_SIZE + Bounce.PADDLE_Y_OFFSET);

  var paddleClipRect = document.getElementById('paddleClipRect');
  paddleClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
  paddleClipRect.setAttribute('y', paddleIcon.getAttribute('y'));
};

Bounce.displayScore = function () {
  var score = document.getElementById('score');
  score.textContent = bounceMsg.scoreText({
    playerScore: Bounce.playerScore,
    opponentScore: Bounce.opponentScore
  });
};

var skinTheme = function (value) {
  if (value === 'hardcourt' || value === 'basketball') {
    return skin;
  }
  return skin[value];
};

Bounce.setTeam = function (value) {
  Bounce.setBackgroundImage(skin.teamBackgrounds[value]);
  Bounce.loadTiles(skin.tiles, skin.goalTiles);
};

Bounce.setBackground = function (value) {
  var theme = skinTheme(value);
  Bounce.drawTiles = theme.drawTiles === undefined ? skin.drawTiles : theme.drawTiles;
  if (level.maps) {
    Bounce.map = level.maps[value === 'hardcourt' ? 'basketball' : value];
  }
  Bounce.setBackgroundImage(theme.background);
  Bounce.loadTiles(theme.tiles, theme.goalTiles);
};

Bounce.setBackgroundImage = function (backgroundUrl) {
  var element = document.getElementById('background');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    backgroundUrl);
};

Bounce.loadTiles = function (tiles, goalTiles) {
  // Recompute all of the tiles to determine if they are walls, goals, or empty
  // TODO: do this once during init and cache the result
  var tileId = 0;
  for (var y = 0; y < Bounce.ROWS; y++) {
    for (var x = 0; x < Bounce.COLS; x++) {
      var empty = false;
      var image;
      // Compute the tile index.
      var tile = wallNormalize(x, y) +
          wallNormalize(x, y - 1) +  // North.
          wallNormalize(x + 1, y) +  // East.
          wallNormalize(x, y + 1) +  // South.
          wallNormalize(x - 1, y);   // West.

      // Draw the tile.
      if (WALL_TILE_SHAPES[tile]) {
        image = tiles;
      } else {
        // Compute the tile index.
        tile = goalNormalize(x, y) +
            goalNormalize(x, y - 1) +  // North.
            goalNormalize(x + 1, y) +  // East.
            goalNormalize(x, y + 1) +  // South.
            goalNormalize(x - 1, y);   // West.

        if (!GOAL_TILE_SHAPES[tile]) {
          empty = true;
        }
        image = goalTiles;
      }
      var element = document.getElementById('tileElement' + tileId);
      if (!empty && Bounce.drawTiles) {
        element.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href', image);
        element.setAttribute('visibility', 'visible');
      } else if (element) {
        element.setAttribute('visibility', 'hidden');
      }
      tileId++;
    }
  }
};

Bounce.setBall = function (value) {
  var theme = skinTheme(value);
  Bounce.ballImage = theme.ball;
  Bounce.ballRotationSpeed = theme.rotateBall ? 10 : 0;
  for (var i = 0; i < Bounce.ballCount; i++) {
    var element = document.getElementById('ball' + i);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Bounce.ballImage);
    if (!theme.rotateBall) {
      Bounce.ballRotation[i] = 0;
    }
  }
};

Bounce.setPaddle = function (value) {
  var element = document.getElementById('paddle');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skinTheme(value).paddle);
};

Bounce.timedOut = function () {
  return Bounce.tickCount > Bounce.timeoutFailureTick;
};

Bounce.allFinishesComplete = function () {
  var i;
  if (Bounce.paddleFinish_) {
    var finished, playSound;
    for (i = 0, finished = 0; i < Bounce.paddleFinishCount; i++) {
      if (!Bounce.paddleFinish_[i].finished) {
        if (essentiallyEqual(Bounce.paddleX,
                             Bounce.paddleFinish_[i].x,
                             tiles.FINISH_COLLIDE_DISTANCE) &&
            essentiallyEqual(Bounce.paddleY,
                             Bounce.paddleFinish_[i].y,
                             tiles.FINISH_COLLIDE_DISTANCE)) {
          Bounce.paddleFinish_[i].finished = true;
          finished++;
          playSound = true;

          // Change the finish icon to goalSuccess.
          var paddleFinishIcon = document.getElementById('paddlefinish' + i);
          paddleFinishIcon.setAttributeNS(
              'http://www.w3.org/1999/xlink',
              'xlink:href',
              Bounce.goalSuccess);
        }
      } else {
        finished++;
      }
    }
    if (playSound && finished !== Bounce.paddleFinishCount) {
      // Play a sound unless we've hit the last flag
      studioApp().playAudio('flag');
    }
    return (finished === Bounce.paddleFinishCount);
  }
  if (Bounce.ballFinish_) {
    for (i = 0; i < Bounce.ballCount; i++) {
      if (essentiallyEqual(Bounce.ballX[i],
                           Bounce.ballFinish_.x,
                           tiles.FINISH_COLLIDE_DISTANCE) &&
          essentiallyEqual(Bounce.ballY[i],
                           Bounce.ballFinish_.y,
                           tiles.FINISH_COLLIDE_DISTANCE)) {
        // Change the finish icon to goalSuccess.
        var ballFinishIcon = document.getElementById('ballfinish');
        ballFinishIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            Bounce.goalSuccess);
        return true;
      }
    }
  }
  return false;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Bounce.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Bounce.result = ResultType.FAILURE;
    return true;
  }

  if (Bounce.allFinishesComplete()) {
    Bounce.result = ResultType.SUCCESS;
    return true;
  }

  if (Bounce.timedOut()) {
    Bounce.result = ResultType.FAILURE;
    return true;
  }

  return false;
};
