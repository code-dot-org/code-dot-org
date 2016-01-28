require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/maze/main.js":[function(require,module,exports){
(function (global){
'use strict';

var appMain = require('../appMain');
window.Maze = require('./maze');
if (typeof global !== 'undefined') {
  global.Maze = window.Maze;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.mazeMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  appMain(window.Maze, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL21hemUvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7QUFDakMsUUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0NBQzNCO0FBQ0QsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBUyxPQUFPLEVBQUU7QUFDbEMsU0FBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBTyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7O0FBRTlCLFNBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUN2QyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbndpbmRvdy5NYXplID0gcmVxdWlyZSgnLi9tYXplJyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLk1hemUgPSB3aW5kb3cuTWF6ZTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5tYXplTWFpbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcblxuICBhcHBNYWluKHdpbmRvdy5NYXplLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcbiJdfQ==
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/maze/blocks.js","./levels":"/home/ubuntu/staging/apps/build/js/maze/levels.js","./maze":"/home/ubuntu/staging/apps/build/js/maze/maze.js","./skins":"/home/ubuntu/staging/apps/build/js/maze/skins.js"}],"/home/ubuntu/staging/apps/build/js/maze/skins.js":[function(require,module,exports){
/**
 * Load Skin for Maze.
 */
// tiles: A 250x200 set of 20 map images.
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// look: Colour of sonar-like look icon.

'use strict';

var skinsBase = require('../skins');
var utils = require('../utils');
var _ = utils.getLodash();

var CONFIGS = {
  letters: {
    nonDisappearingPegmanHittingObstacle: true,
    pegmanHeight: 50,
    pegmanWidth: 50,
    danceOnLoad: false,
    goal: '',
    idlePegmanAnimation: 'idle_avatar.gif',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    hideInstructions: true
  },

  bee: {
    obstacleAnimation: '',
    obstacleIdle: 'obstacle.png',
    redFlower: 'redFlower.png',
    purpleFlower: 'purpleFlower.png',
    honey: 'honey.png',
    cloud: 'cloud.png',
    cloudAnimation: 'cloud_hide.gif',
    beeSound: true,
    nectarSound: 'getNectar.mp3',
    honeySound: 'makeHoney.mp3',

    look: '#000',
    nonDisappearingPegmanHittingObstacle: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    hittingWallAnimation: 'wall.gif',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    actionSpeedScale: {
      nectar: 1
    },
    pegmanYOffset: 0,
    tileSheetWidth: 5,
    pegmanHeight: 50,
    pegmanWidth: 50
  },

  farmer: {
    obstacleIdle: 'obstacle.png',

    dirt: 'dirt.png',
    fillSound: 'fill.mp3',
    digSound: 'dig.mp3',

    look: '#000',
    transparentTileEnding: true,
    nonDisappearingPegmanHittingObstacle: true,
    background: 'background' + _.sample([0, 1, 2, 3]) + '.png',
    dirtSound: true,
    pegmanYOffset: -8,
    danceOnLoad: true
  },

  pvz: {
    goalIdle: 'goalIdle.gif',
    obstacleIdle: 'obstacleIdle.gif',

    goalAnimation: 'goal.gif',
    maze_forever: 'maze_forever.png',

    obstacleScale: 1.4,
    pegmanYOffset: -8,
    danceOnLoad: true
  },

  birds: {
    goalIdle: 'goalIdle.gif',
    obstacleIdle: 'obstacle.png',

    goalAnimation: 'goal.gif',
    maze_forever: 'maze_forever.png',
    largerObstacleAnimationTiles: 'tiles-broken.png',

    obstacleScale: 1.2,
    additionalSound: true,
    idlePegmanAnimation: 'idle_avatar.gif',
    wallPegmanAnimation: 'wall_avatar.png',
    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,
    hittingWallAnimation: 'wall.gif',
    approachingGoalAnimation: 'close_goal.png',
    pegmanHeight: 68,
    pegmanWidth: 51,
    pegmanYOffset: -14,
    turnAfterVictory: true
  },

  scrat: {
    goalIdle: 'goal.png',
    obstacleIdle: 'obstacle.png',

    goalAnimation: 'goal.png',
    maze_forever: 'maze_forever.png',
    largerObstacleAnimationTiles: 'tiles-broken.png',

    obstacleScale: 1.2,
    additionalSound: true,
    idlePegmanAnimation: 'idle_avatar_sheet.png',
    idlePegmanAnimationSpeedScale: 1.5,
    idlePegmanCol: 4,
    idlePegmanRow: 11,

    hittingWallAnimation: 'wall_avatar_sheet.png',
    hittingWallAnimationFrameNumber: 20,
    hittingWallAnimationSpeedScale: 1.5,
    hittingWallPegmanCol: 1,
    hittingWallPegmanRow: 20,

    celebrateAnimation: 'jump_acorn_sheet.png',
    celebratePegmanCol: 1,
    celebratePegmanRow: 9,

    movePegmanAnimation: 'move_avatar.png',
    movePegmanAnimationSpeedScale: 1.5,
    // This is required when move pegman animation is set
    movePegmanAnimationFrameNumber: 9,

    approachingGoalAnimation: 'close_goal.png',
    pegmanHeight: 107,
    pegmanWidth: 80,
    pegmanXOffset: -12,
    pegmanYOffset: -30,
    turnAfterVictory: true
  }
};

// night skins are effectively the same, but will have some different assets
// in their respective folders blockly/static/skins/<skin name>
CONFIGS.bee_night = CONFIGS.bee;
CONFIGS.farmer_night = CONFIGS.farmer;

/**
 * Given the mp3 sound, generates a list containing both the mp3 and ogg sounds
 */
function soundAssetUrls(skin, mp3Sound) {
  var base = mp3Sound.match(/^(.*)\.mp3$/)[1];
  return [skin.assetUrl(mp3Sound), skin.assetUrl(base + '.ogg')];
}

exports.load = function (assetUrl, id) {
  // The skin has properties from three locations
  // (1) skinBase - properties common across Blockly apps
  // (2) here - properties common across all maze skins
  // (3) config - properties particular to a maze skin
  // If a property is defined in multiple locations, the more specific location
  // takes precedence

  // (1) Properties common across Blockly apps
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  // (2) Default values for properties common across maze skins.
  skin.obstacleScale = 1.0;
  skin.obstacleAnimation = skin.assetUrl('obstacle.gif');
  skin.movePegmanAnimationSpeedScale = 1;
  skin.look = '#FFF';
  skin.background = skin.assetUrl('background.png');
  skin.tiles = skin.assetUrl('tiles.png');
  skin.pegmanHeight = 52;
  skin.pegmanWidth = 49;
  skin.pegmanYOffset = 0;
  // do we turn to the direction we're facing after performing our victory
  // animation?
  skin.turnAfterVictory = false;
  skin.danceOnLoad = false;

  // Sounds
  skin.obstacleSound = soundAssetUrls(skin, 'obstacle.mp3');
  skin.wallSound = soundAssetUrls(skin, 'wall.mp3');
  skin.winGoalSound = soundAssetUrls(skin, 'win_goal.mp3');
  skin.wall0Sound = soundAssetUrls(skin, 'wall0.mp3');
  skin.wall1Sound = soundAssetUrls(skin, 'wall1.mp3');
  skin.wall2Sound = soundAssetUrls(skin, 'wall2.mp3');
  skin.wall3Sound = soundAssetUrls(skin, 'wall3.mp3');
  skin.wall4Sound = soundAssetUrls(skin, 'wall4.mp3');

  // (3) Get properties from config
  var isAsset = /\.\S{3}$/; // ends in dot followed by three non-whitespace chars
  var isSound = /^(.*)\.mp3$/; // something.mp3
  for (var prop in config) {
    var val = config[prop];
    if (isSound.test(val)) {
      val = soundAssetUrls(skin, val);
    } else if (isAsset.test(val)) {
      val = skin.assetUrl(val);
    }
    skin[prop] = val;
  }

  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/maze/maze.js":[function(require,module,exports){
/**
 * Blockly Apps: Maze
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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

/**
 * @fileoverview JavaScript for Blockly's Maze application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var tiles = require('./tiles');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var mazeUtils = require('./mazeUtils');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');

var Bee = require('./bee');
var WordSearch = require('./wordsearch');
var scrat = require('./scrat');

var DirtDrawer = require('./dirtDrawer');
var BeeItemDrawer = require('./beeItemDrawer');

var ExecutionInfo = require('./executionInfo');

var Direction = tiles.Direction;
var SquareType = tiles.SquareType;
var TurnDirection = tiles.TurnDirection;
var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

var SVG_NS = require('../constants').SVG_NS;

/**
 * Create a namespace for the application.
 */
var Maze = module.exports;

var level;
var skin;

/**
 * Milliseconds between each animation frame.
 */
var stepSpeed = 100;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var getTile = function getTile(map, x, y) {
  if (map && map[y]) {
    return map[y][x];
  }
};

// Default Scalings
Maze.scale = {
  'snapRadius': 1,
  'stepSpeed': 5
};

var loadLevel = function loadLevel() {
  // Load maps.
  Maze.map = level.map;
  Maze.initialDirtMap = level.initialDirt;
  Maze.startDirection = level.startDirection;

  Maze.animating_ = false;

  // Override scalars.
  for (var key in level.scale) {
    Maze.scale[key] = level.scale[key];
  }

  if (level.fastGetNectarAnimation) {
    skin.actionSpeedScale.nectar = 0.5;
  }
  // Measure maze dimensions and set sizes.
  // ROWS: Number of tiles down.
  Maze.ROWS = Maze.map.length;
  // COLS: Number of tiles across.
  Maze.COLS = Maze.map[0].length;
  // Initialize the wallMap.
  initWallMap();
  // Pixel height and width of each maze square (i.e. tile).
  Maze.SQUARE_SIZE = 50;
  Maze.PEGMAN_HEIGHT = skin.pegmanHeight;
  Maze.PEGMAN_WIDTH = skin.pegmanWidth;
  Maze.PEGMAN_X_OFFSET = skin.pegmanXOffset || 0;
  Maze.PEGMAN_Y_OFFSET = skin.pegmanYOffset;
  // Height and width of the goal and obstacles.
  Maze.MARKER_HEIGHT = 43;
  Maze.MARKER_WIDTH = 50;

  Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.COLS;
  Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.ROWS;
  Maze.PATH_WIDTH = Maze.SQUARE_SIZE / 3;

  if (Maze.initialDirtMap) {
    Maze.dirt_ = new Array(Maze.ROWS);
  }
};

/**
 * Initialize the wallMap.  For any cell at location x,y Maze.wallMap[y][x] will
 * be the index of which wall tile to use for that cell.  If the cell is not a
 * wall, Maze.wallMap[y][x] is undefined.
 */
var initWallMap = function initWallMap() {
  Maze.wallMap = new Array(Maze.ROWS);
  for (var y = 0; y < Maze.ROWS; y++) {
    Maze.wallMap[y] = new Array(Maze.COLS);
  }
};

/**
 * PIDs of animation tasks currently executing.
 */
var timeoutList = require('../timeoutList');

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
var TILE_SHAPES = {
  '10010': [4, 0], // Dead ends
  '10001': [3, 3],
  '11000': [0, 1],
  '10100': [0, 2],
  '11010': [4, 1], // Vertical
  '10101': [3, 2], // Horizontal
  '10110': [0, 0], // Elbows
  '10011': [2, 0],
  '11001': [4, 2],
  '11100': [2, 3],
  '11110': [1, 1], // Junctions
  '10111': [1, 0],
  '11011': [2, 1],
  '11101': [1, 2],
  '11111': [2, 2], // Cross
  'null0': [4, 3], // Empty
  'null1': [3, 0],
  'null2': [3, 1],
  'null3': [0, 3],
  'null4': [1, 3]
};

function drawMap() {
  var svg = document.getElementById('svgMaze');
  var x, y, k, tile;

  // Draw the outer square.
  var square = document.createElementNS(SVG_NS, 'rect');
  square.setAttribute('width', Maze.MAZE_WIDTH);
  square.setAttribute('height', Maze.MAZE_HEIGHT);
  square.setAttribute('fill', '#F1EEE7');
  square.setAttribute('stroke-width', 1);
  square.setAttribute('stroke', '#CCB');
  svg.appendChild(square);

  // Adjust outer element size.
  svg.setAttribute('width', Maze.MAZE_WIDTH);
  svg.setAttribute('height', Maze.MAZE_HEIGHT);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Maze.MAZE_WIDTH + 'px';

  if (skin.background) {
    tile = document.createElementNS(SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.background);
    tile.setAttribute('height', Maze.MAZE_HEIGHT);
    tile.setAttribute('width', Maze.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  drawMapTiles(svg);

  // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
  var pegmanClip = document.createElementNS(SVG_NS, 'clipPath');
  pegmanClip.setAttribute('id', 'pegmanClipPath');
  var clipRect = document.createElementNS(SVG_NS, 'rect');
  clipRect.setAttribute('id', 'clipRect');
  clipRect.setAttribute('width', Maze.PEGMAN_WIDTH);
  clipRect.setAttribute('height', Maze.PEGMAN_HEIGHT);
  pegmanClip.appendChild(clipRect);
  svg.appendChild(pegmanClip);

  // Add pegman.
  var pegmanIcon = document.createElementNS(SVG_NS, 'image');
  pegmanIcon.setAttribute('id', 'pegman');
  pegmanIcon.setAttribute('class', 'pegman-location');
  pegmanIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.avatar);
  pegmanIcon.setAttribute('height', Maze.PEGMAN_HEIGHT);
  pegmanIcon.setAttribute('width', Maze.PEGMAN_WIDTH * 21); // 49 * 21 = 1029
  pegmanIcon.setAttribute('clip-path', 'url(#pegmanClipPath)');
  svg.appendChild(pegmanIcon);

  var pegmanFadeoutAnimation = document.createElementNS(SVG_NS, 'animate');
  pegmanFadeoutAnimation.setAttribute('id', 'pegmanFadeoutAnimation');
  pegmanFadeoutAnimation.setAttribute('attributeType', 'CSS');
  pegmanFadeoutAnimation.setAttribute('attributeName', 'opacity');
  pegmanFadeoutAnimation.setAttribute('from', 1);
  pegmanFadeoutAnimation.setAttribute('to', 0);
  pegmanFadeoutAnimation.setAttribute('dur', '1s');
  pegmanFadeoutAnimation.setAttribute('begin', 'indefinite');
  pegmanIcon.appendChild(pegmanFadeoutAnimation);

  if (Maze.finish_ && skin.goalIdle) {
    // Add finish marker.
    var finishMarker = document.createElementNS(SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalIdle);
    finishMarker.setAttribute('height', Maze.MARKER_HEIGHT);
    finishMarker.setAttribute('width', Maze.MARKER_WIDTH);
    svg.appendChild(finishMarker);
  }

  // Add wall hitting animation
  if (skin.hittingWallAnimation) {
    var wallAnimationIcon = document.createElementNS(SVG_NS, 'image');
    wallAnimationIcon.setAttribute('id', 'wallAnimation');
    wallAnimationIcon.setAttribute('height', Maze.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('width', Maze.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('visibility', 'hidden');
    svg.appendChild(wallAnimationIcon);
  }

  // Add obstacles.
  var obsId = 0;
  for (y = 0; y < Maze.ROWS; y++) {
    for (x = 0; x < Maze.COLS; x++) {
      if (Maze.map[y][x] == SquareType.OBSTACLE) {
        var obsIcon = document.createElementNS(SVG_NS, 'image');
        obsIcon.setAttribute('id', 'obstacle' + obsId);
        obsIcon.setAttribute('height', Maze.MARKER_HEIGHT * skin.obstacleScale);
        obsIcon.setAttribute('width', Maze.MARKER_WIDTH * skin.obstacleScale);
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacleIdle);
        obsIcon.setAttribute('x', Maze.SQUARE_SIZE * (x + 0.5) - obsIcon.getAttribute('width') / 2);
        obsIcon.setAttribute('y', Maze.SQUARE_SIZE * (y + 0.9) - obsIcon.getAttribute('height'));
        svg.appendChild(obsIcon);
      }
      ++obsId;
    }
  }

  // Add idle pegman.
  if (skin.idlePegmanAnimation) {
    createPegmanAnimation({
      idStr: 'idle',
      pegmanImage: skin.idlePegmanAnimation,
      row: Maze.start_.y,
      col: Maze.start_.x,
      direction: Maze.startDirection,
      numColPegman: skin.idlePegmanCol,
      numRowPegman: skin.idlePegmanRow
    });

    if (skin.idlePegmanCol > 1 || skin.idlePegmanRow > 1) {
      // our idle is a sprite sheet instead of a gif. schedule cycling through
      // the frames
      var numFrames = skin.idlePegmanRow;
      var idlePegmanIcon = document.getElementById('idlePegman');
      var timePerFrame = 600; // timeForAnimation / numFrames;
      var idleAnimationFrame = 0;

      setInterval(function () {
        if (idlePegmanIcon.getAttribute('visibility') === 'visible') {
          updatePegmanAnimation({
            idStr: 'idle',
            row: Maze.start_.y,
            col: Maze.start_.x,
            direction: Maze.startDirection,
            animationRow: idleAnimationFrame
          });
          idleAnimationFrame = (idleAnimationFrame + 1) % numFrames;
        }
      }, timePerFrame);
    }
  }

  if (skin.celebrateAnimation) {
    createPegmanAnimation({
      idStr: 'celebrate',
      pegmanImage: skin.celebrateAnimation,
      row: Maze.start_.y,
      col: Maze.start_.x,
      direction: Direction.NORTH,
      numColPegman: skin.celebratePegmanCol,
      numRowPegman: skin.celebratePegmanRow
    });
  }

  // Add the hidden dazed pegman when hitting the wall.
  if (skin.wallPegmanAnimation) {
    createPegmanAnimation({
      idStr: 'wall',
      pegmanImage: skin.wallPegmanAnimation
    });
  }

  // create element for our hitting wall spritesheet
  if (skin.hittingWallAnimation && skin.hittingWallAnimationFrameNumber) {
    createPegmanAnimation({
      idStr: 'wall',
      pegmanImage: skin.hittingWallAnimation,
      numColPegman: skin.hittingWallPegmanCol,
      numRowPegman: skin.hittingWallPegmanRow
    });
    document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
  }

  // Add the hidden moving pegman animation.
  if (skin.movePegmanAnimation) {
    createPegmanAnimation({
      idStr: 'move',
      pegmanImage: skin.movePegmanAnimation,
      numColPegman: 4,
      numRowPegman: 9
    });
  }
}

// Returns true if the tile at x,y is either a wall or out of bounds
function isWallOrOutOfBounds(x, y) {
  return Maze.map[y] === undefined || Maze.map[y][x] === undefined || Maze.map[y][x] === SquareType.WALL;
}

// Return a value of '0' if the specified square is wall or out of bounds '1'
// otherwise (empty, obstacle, start, finish).
function isOnPathStr(x, y) {
  return isWallOrOutOfBounds(x, y) ? "0" : "1";
}

// Draw the tiles making up the maze map.
function drawMapTiles(svg) {
  if (Maze.wordSearch) {
    return Maze.wordSearch.drawMapTiles(svg);
  } else if (mazeUtils.isScratSkin(skin.id)) {
    return scrat.drawMapTiles(svg);
  }

  // Compute and draw the tile for each square.
  var tileId = 0;
  var tile, origTile;
  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      // Compute the tile index.
      tile = isOnPathStr(x, y) + isOnPathStr(x, y - 1) + // North.
      isOnPathStr(x + 1, y) + // West.
      isOnPathStr(x, y + 1) + // South.
      isOnPathStr(x - 1, y); // East.

      var adjacentToPath = tile !== '00000';

      // Draw the tile.
      if (!TILE_SHAPES[tile]) {
        // We have an empty square. Handle it differently based on skin.
        if (mazeUtils.isBeeSkin(skin.id)) {
          // begin with three trees
          var tileChoices = ['null3', 'null4', 'null0'];
          var noTree = 'null1';
          // want it to be more likely to have a tree when adjacent to path
          var n = adjacentToPath ? tileChoices.length * 2 : tileChoices.length * 6;
          for (var i = 0; i < n; i++) {
            tileChoices.push(noTree);
          }

          tile = _.sample(tileChoices);
        } else {
          // Empty square.  Use null0 for large areas, with null1-4 for borders.
          if (!adjacentToPath && Math.random() > 0.3) {
            Maze.wallMap[y][x] = 0;
            tile = 'null0';
          } else {
            var wallIdx = Math.floor(1 + Math.random() * 4);
            Maze.wallMap[y][x] = wallIdx;
            tile = 'null' + wallIdx;
          }

          // For the first 3 levels in maze, only show the null0 image.
          if (level.id == '2_1' || level.id == '2_2' || level.id == '2_3') {
            Maze.wallMap[y][x] = 0;
            tile = 'null0';
          }
        }
      }

      Maze.drawTile(svg, TILE_SHAPES[tile], y, x, tileId);

      // Draw checkerboard for bee.
      if (Maze.gridItemDrawer instanceof BeeItemDrawer && (x + y) % 2 === 0) {
        var isPath = !/null/.test(tile);
        Maze.gridItemDrawer.addCheckerboardTile(y, x, isPath);
      }

      tileId++;
    }
  }
}

/**
 * Draw the given tile at row, col
 */
Maze.drawTile = function (svg, tileSheetLocation, row, col, tileId) {
  var left = tileSheetLocation[0];
  var top = tileSheetLocation[1];

  var tileSheetWidth = Maze.SQUARE_SIZE * 5;
  var tileSheetHeight = Maze.SQUARE_SIZE * 4;

  // Tile's clipPath element.
  var tileClip = document.createElementNS(SVG_NS, 'clipPath');
  tileClip.setAttribute('id', 'tileClipPath' + tileId);
  var tileClipRect = document.createElementNS(SVG_NS, 'rect');
  tileClipRect.setAttribute('width', Maze.SQUARE_SIZE);
  tileClipRect.setAttribute('height', Maze.SQUARE_SIZE);

  tileClipRect.setAttribute('x', col * Maze.SQUARE_SIZE);
  tileClipRect.setAttribute('y', row * Maze.SQUARE_SIZE);
  tileClip.appendChild(tileClipRect);
  svg.appendChild(tileClip);

  // Tile sprite.
  var tileElement = document.createElementNS(SVG_NS, 'image');
  tileElement.setAttribute('id', 'tileElement' + tileId);
  tileElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.tiles);
  tileElement.setAttribute('height', tileSheetHeight);
  tileElement.setAttribute('width', tileSheetWidth);
  tileElement.setAttribute('clip-path', 'url(#tileClipPath' + tileId + ')');
  tileElement.setAttribute('x', (col - left) * Maze.SQUARE_SIZE);
  tileElement.setAttribute('y', (row - top) * Maze.SQUARE_SIZE);
  svg.appendChild(tileElement);
  // Tile animation
  var tileAnimation = document.createElementNS(SVG_NS, 'animate');
  tileAnimation.setAttribute('id', 'tileAnimation' + tileId);
  tileAnimation.setAttribute('attributeType', 'CSS');
  tileAnimation.setAttribute('attributeName', 'opacity');
  tileAnimation.setAttribute('from', 1);
  tileAnimation.setAttribute('to', 0);
  tileAnimation.setAttribute('dur', '1s');
  tileAnimation.setAttribute('begin', 'indefinite');
  tileElement.appendChild(tileAnimation);
};

function resetDirt() {
  if (!Maze.initialDirtMap) {
    return;
  }
  // Locate the dirt in dirt_map
  for (var y = 0; y < Maze.ROWS; y++) {
    Maze.dirt_[y] = Maze.initialDirtMap[y].slice(0);
  }
}

/**
 * Redraw all dirt images
 * @param {boolean} running Whether or not user program is currently running
 */
function resetDirtImages(running) {
  var x = 1;
  for (var row = 0; row < Maze.ROWS; row++) {
    for (var col = 0; col < Maze.COLS; col++) {
      if (getTile(Maze.dirt_, col, row) !== undefined) {
        Maze.gridItemDrawer.updateItemImage(row, col, running);
      }
    }
  }
}

/**
 * Initialize Blockly and the maze.  Called on page load.
 */
Maze.init = function (config) {
  // replace studioApp methods with our own
  studioApp.runButtonClick = this.runButtonClick.bind(this);
  studioApp.reset = this.reset.bind(this);

  var extraControlRows = null;

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'when_run';
  config.dropletConfig = dropletConfig;

  if (mazeUtils.isBeeSkin(config.skinId)) {
    Maze.bee = new Bee(Maze, studioApp, config);
    // Override default stepSpeed
    Maze.scale.stepSpeed = 2;
  } else if (config.skinId === 'letters') {
    Maze.wordSearch = new WordSearch(level.searchWord, level.map, Maze.drawTile);
    extraControlRows = require('./extraControlRows.html.ejs')({
      assetUrl: studioApp.assetUrl,
      searchWord: level.searchWord
    });
  }

  loadLevel();

  Maze.cachedBlockStates = [];

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html.ejs')(),
      controls: require('./controls.html.ejs')({
        assetUrl: studioApp.assetUrl,
        showStepButton: level.step && !level.edit_blocks
      }),
      extraControlRows: extraControlRows,
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default',
      readonlyWorkspace: config.readonlyWorkspace
    },
    hideRunButton: level.stepOnly && !level.edit_blocks
  });

  config.loadAudio = function () {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
    studioApp.loadAudio(skin.obstacleSound, 'obstacle');
    // Load wall sounds.
    studioApp.loadAudio(skin.wallSound, 'wall');

    // todo - longterm, instead of having sound related flags we should just
    // have the skin tell us the set of sounds it needs
    if (skin.additionalSound) {
      studioApp.loadAudio(skin.wall0Sound, 'wall0');
      studioApp.loadAudio(skin.wall1Sound, 'wall1');
      studioApp.loadAudio(skin.wall2Sound, 'wall2');
      studioApp.loadAudio(skin.wall3Sound, 'wall3');
      studioApp.loadAudio(skin.wall4Sound, 'wall4');
      studioApp.loadAudio(skin.winGoalSound, 'winGoal');
    }
    if (skin.dirtSound) {
      studioApp.loadAudio(skin.fillSound, 'fill');
      studioApp.loadAudio(skin.digSound, 'dig');
    }
    if (skin.beeSound) {
      studioApp.loadAudio(skin.nectarSound, 'nectar');
      studioApp.loadAudio(skin.honeySound, 'honey');
    }
  };

  config.afterInject = function () {
    if (studioApp.isUsingBlockly()) {
      /**
       * The richness of block colours, regardless of the hue.
       * MOOC blocks should be brighter (target audience is younger).
       * Must be in the range of 0 (inclusive) to 1 (exclusive).
       * Blockly's default is 0.45.
       */
      Blockly.HSV_SATURATION = 0.6;

      Blockly.SNAP_RADIUS *= Maze.scale.snapRadius;
      Blockly.JavaScript.INFINITE_LOOP_TRAP = codegen.loopHighlight("Maze");
    }

    Maze.start_ = undefined;
    Maze.finish_ = undefined;

    // Locate the start and finish squares.
    for (var y = 0; y < Maze.ROWS; y++) {
      for (var x = 0; x < Maze.COLS; x++) {
        var cell = Maze.map[y][x];
        if (cell == SquareType.START) {
          Maze.start_ = { x: x, y: y };
        } else if (cell === SquareType.FINISH) {
          Maze.finish_ = { x: x, y: y };
        } else if (cell == SquareType.STARTANDFINISH) {
          Maze.start_ = { x: x, y: y };
          Maze.finish_ = { x: x, y: y };
        }
      }
    }

    resetDirt();

    if (mazeUtils.isBeeSkin(config.skinId)) {
      Maze.gridItemDrawer = new BeeItemDrawer(Maze.dirt_, skin, Maze.bee);
    } else {
      Maze.gridItemDrawer = new DirtDrawer(Maze.dirt_, skin.dirt);
    }

    drawMap();

    var stepButton = document.getElementById('stepButton');
    dom.addClickTouchEvent(stepButton, stepButtonClick);

    // base's studioApp.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Maze.resetButtonClick);

    if (skin.hideInstructions) {
      document.getElementById("bubble").style.display = "none";
    }
  };

  studioApp.init(config);
};

/**
 * Handle a click on the step button.  If we're already animating, we should
 * perform a single step.  Otherwise, we call beginAttempt which will do
 * some initial setup, and then perform the first step.
 */
function stepButtonClick() {
  var stepButton = document.getElementById('stepButton');
  stepButton.setAttribute('disabled', '');

  if (Maze.animating_) {
    Maze.scheduleAnimations(true);
  } else {
    Maze.execute(true);
  }
}

/**
 * Calculate the y coordinates for pegman sprite.
 */
var getPegmanYForRow = function getPegmanYForRow(mazeRow) {
  var y = Maze.SQUARE_SIZE * (mazeRow + 0.5) - Maze.PEGMAN_HEIGHT / 2 + Maze.PEGMAN_Y_OFFSET;
  return Math.floor(y);
};

/**
 * Calculate the Y offset within the sheet
 */
var getPegmanFrameOffsetY = function getPegmanFrameOffsetY(animationRow) {
  animationRow = animationRow || 0;
  return animationRow * Maze.PEGMAN_HEIGHT;
};

/**
  * Create sprite assets for pegman.
  * @param options Specify different features of the pegman animation.
  * idStr required identifier for the pegman.
  * pegmanImage required which image to use for the animation.
  * col which column the pegman is at.
  * row which row the pegman is at.
  * direction which direction the pegman is facing at.
  * numColPegman number of the pegman in each row, default is 4.
  * numRowPegman number of the pegman in each column, default is 1.
  */
var createPegmanAnimation = function createPegmanAnimation(options) {
  var svg = document.getElementById('svgMaze');
  // Create clip path.
  var clip = document.createElementNS(SVG_NS, 'clipPath');
  clip.setAttribute('id', options.idStr + 'PegmanClip');
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('id', options.idStr + 'PegmanClipRect');
  if (options.col !== undefined) {
    rect.setAttribute('x', options.col * Maze.SQUARE_SIZE + 1 + Maze.PEGMAN_X_OFFSET);
  }
  if (options.row !== undefined) {
    rect.setAttribute('y', getPegmanYForRow(options.row));
  }
  rect.setAttribute('width', Maze.PEGMAN_WIDTH);
  rect.setAttribute('height', Maze.PEGMAN_HEIGHT);
  clip.appendChild(rect);
  svg.appendChild(clip);
  // Create image.
  var imgSrc = options.pegmanImage;
  var img = document.createElementNS(SVG_NS, 'image');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgSrc);
  img.setAttribute('height', Maze.PEGMAN_HEIGHT * (options.numRowPegman || 1));
  img.setAttribute('width', Maze.PEGMAN_WIDTH * (options.numColPegman || 4));
  img.setAttribute('clip-path', 'url(#' + options.idStr + 'PegmanClip)');
  img.setAttribute('id', options.idStr + 'Pegman');
  svg.appendChild(img);
  // Update pegman icon & clip path.
  if (options.col !== undefined && options.direction !== undefined) {
    var x = Maze.SQUARE_SIZE * options.col - options.direction * Maze.PEGMAN_WIDTH + 1 + Maze.PEGMAN_X_OFFSET;
    img.setAttribute('x', x);
  }
  if (options.row !== undefined) {
    img.setAttribute('y', getPegmanYForRow(options.row));
  }
};

/**
  * Update sprite assets for pegman.
  * @param options Specify different features of the pegman animation.
  * idStr required identifier for the pegman.
  * col required which column the pegman is at.
  * row required which row the pegman is at.
  * direction required which direction the pegman is facing at.
  * animationRow which row of the sprite sheet the pegman animation needs
  */
var updatePegmanAnimation = function updatePegmanAnimation(options) {
  var rect = document.getElementById(options.idStr + 'PegmanClipRect');
  rect.setAttribute('x', options.col * Maze.SQUARE_SIZE + 1 + Maze.PEGMAN_X_OFFSET);
  rect.setAttribute('y', getPegmanYForRow(options.row));
  var img = document.getElementById(options.idStr + 'Pegman');
  var x = Maze.SQUARE_SIZE * options.col - options.direction * Maze.PEGMAN_WIDTH + 1 + Maze.PEGMAN_X_OFFSET;
  img.setAttribute('x', x);
  var y = getPegmanYForRow(options.row) - getPegmanFrameOffsetY(options.animationRow);
  img.setAttribute('y', y);
  img.setAttribute('visibility', 'visible');
};

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Maze.reset = function (first) {
  if (Maze.bee) {
    // Bee needs to reset itself and still run studioApp.reset logic
    Maze.bee.reset();
  }

  var i;
  // Kill all tasks.
  timeoutList.clearTimeouts();

  Maze.animating_ = false;

  // Move Pegman into position.
  Maze.pegmanX = Maze.start_.x;
  Maze.pegmanY = Maze.start_.y;

  Maze.pegmanD = Maze.startDirection;
  if (first) {
    // Dance consists of 5 animations, each of which get 150ms
    var danceTime = 150 * 5;
    if (skin.danceOnLoad) {
      scheduleDance(false, danceTime);
    }
    timeoutList.setTimeout(function () {
      stepSpeed = 100;
      Maze.scheduleTurn(Maze.startDirection);
    }, danceTime + 150);
  } else {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, tiles.directionToFrame(Maze.pegmanD));
  }

  var svg = document.getElementById('svgMaze');

  var finishIcon = document.getElementById('finish');
  if (finishIcon) {
    // Move the finish icon into position.
    finishIcon.setAttribute('x', Maze.SQUARE_SIZE * (Maze.finish_.x + 0.5) - finishIcon.getAttribute('width') / 2);
    finishIcon.setAttribute('y', Maze.SQUARE_SIZE * (Maze.finish_.y + 0.9) - finishIcon.getAttribute('height'));
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalIdle);
    finishIcon.setAttribute('visibility', 'visible');
  }

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  lookIcon.parentNode.appendChild(lookIcon);
  var paths = lookIcon.getElementsByTagName('path');
  for (i = 0; i < paths.length; i++) {
    var path = paths[i];
    path.setAttribute('stroke', skin.look);
  }

  // Reset pegman's visibility.
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('opacity', 1);

  if (skin.idlePegmanAnimation) {
    pegmanIcon.setAttribute('visibility', 'hidden');
    var idlePegmanIcon = document.getElementById('idlePegman');
    idlePegmanIcon.setAttribute('visibility', 'visible');
  } else {
    pegmanIcon.setAttribute('visibility', 'visible');
  }

  if (skin.wallPegmanAnimation) {
    var wallPegmanIcon = document.getElementById('wallPegman');
    wallPegmanIcon.setAttribute('visibility', 'hidden');
  }

  if (skin.movePegmanAnimation) {
    var movePegmanIcon = document.getElementById('movePegman');
    movePegmanIcon.setAttribute('visibility', 'hidden');
  }

  if (skin.celebrateAnimation) {
    var celebrateAnimation = document.getElementById('celebratePegman');
    celebrateAnimation.setAttribute('visibility', 'hidden');
  }

  // Move the init dirt marker icons into position.
  resetDirt();
  resetDirtImages(false);

  // Reset the obstacle image.
  var obsId = 0;
  var x, y;
  for (y = 0; y < Maze.ROWS; y++) {
    for (x = 0; x < Maze.COLS; x++) {
      var obsIcon = document.getElementById('obstacle' + obsId);
      if (obsIcon) {
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacleIdle);
      }
      ++obsId;
    }
  }

  if (Maze.wordSearch) {
    Maze.wordSearch.resetTiles();
  } else {
    resetTiles();
  }
};

function resetTiles() {
  // Reset the tiles
  var tileId = 0;
  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      // Tile's clipPath element.
      var tileClip = document.getElementById('tileClipPath' + tileId);
      tileClip.setAttribute('visibility', 'visible');
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      tileElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.tiles);
      tileElement.setAttribute('opacity', 1);
      tileId++;
    }
  }
}

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Maze.runButtonClick = function () {
  var stepButton = document.getElementById('stepButton');
  if (stepButton) {
    stepButton.setAttribute('disabled', '');
  }
  Maze.execute(false);
};

function beginAttempt() {
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
}

/**
 * App specific reset button click logic.  studioApp.resetButtonClick will be
 * called first.
 */
Maze.resetButtonClick = function () {
  var stepButton = document.getElementById('stepButton');
  stepButton.removeAttribute('disabled');

  reenableCachedBlockStates();
};

function reenableCachedBlockStates() {
  if (Maze.cachedBlockStates) {
    // restore moveable/deletable/editable state from before we started stepping
    Maze.cachedBlockStates.forEach(function (cached) {
      cached.block.setMovable(cached.movable);
      cached.block.setDeletable(cached.deletable);
      cached.block.setEditable(cached.editable);
    });
    Maze.cachedBlockStates = [];
  }
}

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function displayFeedback() {
  if (Maze.waitingForReport || Maze.animating_) {
    return;
  }
  var options = {
    app: 'maze', //XXX
    skin: skin.id,
    feedbackType: Maze.testResults,
    response: Maze.response,
    level: level
  };
  // If there was an app-specific error (currently only possible for Bee),
  // add it to the options passed to studioApp.displayFeedback().
  if (Maze.testResults === TestResults.APP_SPECIFIC_FAIL && Maze.bee) {
    var message = Maze.bee.getMessage(Maze.executionInfo.terminationValue());
    if (message) {
      options.message = message;
    }
  }
  studioApp.displayFeedback(options);
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Maze.onReportComplete = function (response) {
  Maze.response = response;
  Maze.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

/**
 * Perform some basic initialization/resetting operations before
 * execution. This function should be idempotent, as it can be called
 * during execution when running multiple trials.
 */
Maze.prepareForExecution = function () {
  Maze.executionInfo = new ExecutionInfo({ ticks: 100 });
  Maze.result = ResultType.UNSET;
  Maze.testResults = TestResults.NO_TESTS_RUN;
  Maze.waitingForReport = false;
  Maze.animating_ = false;
  Maze.response = null;
};

/**
 * Execute the user's code.  Heaven help us...
 */
Maze.execute = function (stepMode) {
  beginAttempt();
  Maze.prepareForExecution();

  var code;
  if (studioApp.isUsingBlockly()) {
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = dropletUtils.generateCodeAliases(dropletConfig, 'Maze');
    code += studioApp.editor.getValue();
  }

  // Try running the user's code.  There are a few possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], executionInfo's termination
  //    value is set to true.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    the termination value is set to Infinity
  // 3. If the program terminated because of hitting a wall/obstacle, the
  //    termination value is set to false and the ResultType is ERROR
  // 4. If the program finishes without meeting success condition, we have no
  //    termination value and set ResultType to FAILURE
  // 5. The only other time we should fail should be if an exception is thrown
  //    during execution, in which case we set ResultType to ERROR.
  // The animation should be fast if execution was successful, slow otherwise
  // to help the user see the mistake.
  studioApp.playAudio('start');
  try {
    // don't bother running code if we're just editting required blocks. all
    // we care about is the contents of report.
    var runCode = !level.edit_blocks;

    if (runCode) {
      if (Maze.bee && Maze.bee.staticGrids.length > 1) {
        // If this level is a Bee level with multiple possible grids, we
        // need to run against all grids and sort them into successes
        // and failures
        var successes = [];
        var failures = [];

        Maze.bee.staticGrids.forEach(function (grid, i) {
          Maze.bee.useGridWithId(i);

          // Run trial
          codegen.evalWith(code, {
            StudioApp: studioApp,
            Maze: api,
            executionInfo: Maze.executionInfo
          });

          // Sort static grids based on trial result
          Maze.onExecutionFinish();
          if (Maze.executionInfo.terminationValue() === true) {
            successes.push(i);
          } else {
            failures.push(i);
          }

          // Reset for next trial
          Maze.gridItemDrawer.resetClouded();
          Maze.prepareForExecution();
          studioApp.reset(false);
        });

        // The user's code needs to succeed against all possible grids
        // to be considered actually successful; if there are any
        // failures, randomly select one of the failing grids to be the
        // "real" state of the map. If all grids are successful,
        // randomly select any one of them.
        var i = failures.length > 0 ? _.sample(failures) : _.sample(successes);
        Maze.bee.useGridWithId(i);
      }

      codegen.evalWith(code, {
        StudioApp: studioApp,
        Maze: api,
        executionInfo: Maze.executionInfo
      });
    }

    Maze.onExecutionFinish();

    switch (Maze.executionInfo.terminationValue()) {
      case null:
        // didn't terminate
        Maze.executionInfo.queueAction('finish', null);
        Maze.result = ResultType.FAILURE;
        stepSpeed = 150;
        break;
      case Infinity:
        // Detected an infinite loop.  Animate what we have as quickly as
        // possible
        Maze.result = ResultType.TIMEOUT;
        stepSpeed = 0;
        break;
      case true:
        Maze.result = ResultType.SUCCESS;
        stepSpeed = 100;
        break;
      case false:
        Maze.result = ResultType.ERROR;
        stepSpeed = 150;
        break;
      default:
        // App-specific failure.
        Maze.result = ResultType.ERROR;
        if (Maze.bee) {
          Maze.testResults = Maze.bee.getTestResults(Maze.executionInfo.terminationValue());
        }
        break;
    }
  } catch (e) {
    // Syntax error, can't happen.
    Maze.result = ResultType.ERROR;
    console.error("Unexpected exception: " + e + "\n" + e.stack);
    // call window.onerror so that we get new relic collection.  prepend with
    // UserCode so that it's clear this is in eval'ed code.
    if (window.onerror) {
      window.onerror("UserCode:" + e.message, document.URL, 0);
    }
    return;
  }

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the successful run
  var levelComplete = Maze.result === ResultType.SUCCESS;

  // Set testResults unless app-specific results were set in the default
  // branch of the above switch statement.
  if (Maze.testResults === TestResults.NO_TESTS_RUN) {
    Maze.testResults = studioApp.getTestResults(levelComplete);
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

  Maze.waitingForReport = true;

  // Report result to server.
  studioApp.report({
    app: 'maze',
    level: level.id,
    result: Maze.result === ResultType.SUCCESS,
    testResult: Maze.testResults,
    program: encodeURIComponent(program),
    onComplete: Maze.onReportComplete
  });

  // Maze. now contains a transcript of all the user's actions.
  // Reset the maze and animate the transcript.
  studioApp.reset(false);
  resetDirtImages(true);

  // if we have extra top blocks, don't even bother animating
  if (Maze.testResults === TestResults.EXTRA_TOP_BLOCKS_FAIL) {
    Maze.result = ResultType.ERROR;
    displayFeedback();
    return;
  }

  Maze.animating_ = true;

  if (studioApp.isUsingBlockly()) {
    // Disable toolbox while running
    Blockly.mainBlockSpaceEditor.setEnableToolbox(false);

    if (stepMode) {
      if (Maze.cachedBlockStates.length !== 0) {
        throw new Error('Unexpected cachedBlockStates');
      }
      // Disable all blocks, caching their state first
      Blockly.mainBlockSpace.getAllBlocks().forEach(function (block) {
        Maze.cachedBlockStates.push({
          block: block,
          movable: block.isMovable(),
          deletable: block.isDeletable(),
          editable: block.isEditable()
        });
        block.setMovable(false);
        block.setDeletable(false);
        block.setEditable(false);
      });
    }
  }

  // Removing the idle animation and replace with pegman sprite
  if (skin.idlePegmanAnimation) {
    var pegmanIcon = document.getElementById('pegman');
    var idlePegmanIcon = document.getElementById('idlePegman');
    idlePegmanIcon.setAttribute('visibility', 'hidden');
    pegmanIcon.setAttribute('visibility', 'visible');
  }

  // Speeding up specific levels
  var scaledStepSpeed = stepSpeed * Maze.scale.stepSpeed * skin.movePegmanAnimationSpeedScale;
  timeoutList.setTimeout(function () {
    Maze.scheduleAnimations(stepMode);
  }, scaledStepSpeed);
};

/**
 * Perform our animations, either all of them or those of a single step
 */
Maze.scheduleAnimations = function (singleStep) {
  var stepButton = document.getElementById('stepButton');

  timeoutList.clearTimeouts();

  var timePerAction = stepSpeed * Maze.scale.stepSpeed * skin.movePegmanAnimationSpeedScale;
  // get a flat list of actions we want to schedule
  var actions = Maze.executionInfo.getActions(singleStep);

  scheduleSingleAnimation(0);

  // schedule animations in sequence
  // The reason we do this recursively instead of iteratively is that we want to
  // ensure that we finish scheduling action1 before starting to schedule
  // action2. Otherwise we get into trouble when stepSpeed is 0.
  function scheduleSingleAnimation(index) {
    if (index >= actions.length) {
      finishAnimations();
      return;
    }

    animateAction(actions[index], singleStep, timePerAction);

    var command = actions[index] && actions[index].command;
    var timeModifier = skin.actionSpeedScale && skin.actionSpeedScale[command] || 1;
    var timeForThisAction = Math.round(timePerAction * timeModifier);

    timeoutList.setTimeout(function () {
      scheduleSingleAnimation(index + 1);
    }, timeForThisAction);
  }

  // Once animations are complete, we want to reenable the step button if we
  // have steps left, otherwise we're done with this execution.
  function finishAnimations() {
    var stepsRemaining = Maze.executionInfo.stepsRemaining();

    // allow time for  additional pause if we're completely done
    var waitTime = stepsRemaining ? 0 : 1000;

    // run after all animations
    timeoutList.setTimeout(function () {
      if (stepsRemaining) {
        stepButton.removeAttribute('disabled');
      } else {
        Maze.animating_ = false;
        if (studioApp.isUsingBlockly()) {
          // reenable toolbox
          Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
        }
        // If stepping and we failed, we want to retain highlighting until
        // clicking reset.  Otherwise we can clear highlighting/disabled
        // blocks now
        if (!singleStep || Maze.result === ResultType.SUCCESS) {
          reenableCachedBlockStates();
          studioApp.clearHighlighting();
        }
        displayFeedback();
      }
    }, waitTime);
  }
};

/**
 * Animates a single action
 * @param {string} action The action to animate
 * @param {boolean} spotlightBlocks Whether or not we should highlight entire blocks
 * @param {integer} timePerStep How much time we have allocated before the next step
 */
function animateAction(action, spotlightBlocks, timePerStep) {
  if (action.blockId) {
    studioApp.highlight(String(action.blockId), spotlightBlocks);
  }

  switch (action.command) {
    case 'north':
      animatedMove(Direction.NORTH, timePerStep);
      break;
    case 'east':
      animatedMove(Direction.EAST, timePerStep);
      break;
    case 'south':
      animatedMove(Direction.SOUTH, timePerStep);
      break;
    case 'west':
      animatedMove(Direction.WEST, timePerStep);
      break;
    case 'look_north':
      Maze.scheduleLook(Direction.NORTH);
      break;
    case 'look_east':
      Maze.scheduleLook(Direction.EAST);
      break;
    case 'look_south':
      Maze.scheduleLook(Direction.SOUTH);
      break;
    case 'look_west':
      Maze.scheduleLook(Direction.WEST);
      break;
    case 'fail_forward':
      Maze.scheduleFail(true);
      break;
    case 'fail_backward':
      Maze.scheduleFail(false);
      break;
    case 'left':
      var newDirection = Maze.pegmanD + TurnDirection.LEFT;
      Maze.scheduleTurn(newDirection);
      Maze.pegmanD = tiles.constrainDirection4(newDirection);
      break;
    case 'right':
      newDirection = Maze.pegmanD + TurnDirection.RIGHT;
      Maze.scheduleTurn(newDirection);
      Maze.pegmanD = tiles.constrainDirection4(newDirection);
      break;
    case 'finish':
      // Only schedule victory animation for certain conditions:
      switch (Maze.testResults) {
        case TestResults.FREE_PLAY:
        case TestResults.TOO_MANY_BLOCKS_FAIL:
        case TestResults.ALL_PASS:
          scheduleDance(true, timePerStep);
          break;
        default:
          timeoutList.setTimeout(function () {
            studioApp.playAudio('failure');
          }, stepSpeed);
          break;
      }
      break;
    case 'putdown':
      Maze.scheduleFill();
      break;
    case 'pickup':
      Maze.scheduleDig();
      break;
    case 'nectar':
      Maze.bee.animateGetNectar();
      break;
    case 'honey':
      Maze.bee.animateMakeHoney();
      break;
    default:
      // action[0] is null if generated by studioApp.checkTimeout().
      break;
  }
}

function animatedMove(direction, timeForMove) {
  var positionChange = tiles.directionToDxDy(direction);
  var newX = Maze.pegmanX + positionChange.dx;
  var newY = Maze.pegmanY + positionChange.dy;
  scheduleMove(newX, newY, timeForMove);
  Maze.pegmanX = newX;
  Maze.pegmanY = newY;
}

/**
 * Schedule a movement animating using a spritesheet.
 */
Maze.scheduleSheetedMovement = function (start, delta, numFrames, timePerFrame, idStr, direction, hidePegman) {
  var pegmanIcon = document.getElementById('pegman');
  utils.range(0, numFrames - 1).forEach(function (frame) {
    timeoutList.setTimeout(function () {
      if (hidePegman) {
        pegmanIcon.setAttribute('visibility', 'hidden');
      }
      updatePegmanAnimation({
        idStr: idStr,
        col: start.x + delta.x * frame / numFrames,
        row: start.y + delta.y * frame / numFrames,
        direction: direction,
        animationRow: frame
      });
    }, timePerFrame * frame);
  });
};

/**
 * Schedule the animations for a move from the current position
 * @param {number} endX X coordinate of the target position
 * @param {number} endY Y coordinate of the target position
 */
function scheduleMove(endX, endY, timeForAnimation) {
  var startX = Maze.pegmanX;
  var startY = Maze.pegmanY;
  var direction = Maze.pegmanD;

  var deltaX = endX - startX;
  var deltaY = endY - startY;
  var numFrames;
  var timePerFrame;

  if (skin.movePegmanAnimation) {
    numFrames = skin.movePegmanAnimationFrameNumber;
    // If move animation of pegman is set, and this is not a turn.
    // Show the animation.
    var pegmanIcon = document.getElementById('pegman');
    var movePegmanIcon = document.getElementById('movePegman');
    timePerFrame = timeForAnimation / numFrames;

    Maze.scheduleSheetedMovement({ x: startX, y: startY }, { x: deltaX, y: deltaY }, numFrames, timePerFrame, 'move', direction, true);

    // Hide movePegman and set pegman to the end position.
    timeoutList.setTimeout(function () {
      movePegmanIcon.setAttribute('visibility', 'hidden');
      pegmanIcon.setAttribute('visibility', 'visible');
      Maze.displayPegman(endX, endY, tiles.directionToFrame(direction));
      if (Maze.wordSearch) {
        Maze.wordSearch.markTileVisited(endY, endX, true);
      }
    }, timePerFrame * numFrames);
  } else {
    // we don't have an animation, so just move the x/y pos
    numFrames = 4;
    timePerFrame = timeForAnimation / numFrames;
    utils.range(1, numFrames).forEach(function (frame) {
      timeoutList.setTimeout(function () {
        Maze.displayPegman(startX + deltaX * frame / numFrames, startY + deltaY * frame / numFrames, tiles.directionToFrame(direction));
      }, timePerFrame * frame);
    });
  }

  if (skin.approachingGoalAnimation) {
    var finishIcon = document.getElementById('finish');
    // If pegman is close to the goal
    // Replace the goal file with approachingGoalAnimation
    if (Maze.finish_ && Math.abs(endX - Maze.finish_.x) <= 1 && Math.abs(endY - Maze.finish_.y) <= 1) {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.approachingGoalAnimation);
    } else {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalIdle);
    }
  }
}

/**
 * Schedule the animations for a turn from the current direction
 * @param {number} endDirection The direction we're turning to
 */
Maze.scheduleTurn = function (endDirection) {
  var numFrames = 4;
  var startDirection = Maze.pegmanD;
  var deltaDirection = endDirection - startDirection;
  utils.range(1, numFrames).forEach(function (frame) {
    timeoutList.setTimeout(function () {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, tiles.directionToFrame(startDirection + deltaDirection * frame / numFrames));
    }, stepSpeed * (frame - 1));
  });
};

/**
 * Replace the tiles surrounding the obstacle with broken tiles.
 */
Maze.updateSurroundingTiles = function (obstacleY, obstacleX, brokenTiles) {
  var tileCoords = [[obstacleY - 1, obstacleX - 1], [obstacleY - 1, obstacleX], [obstacleY - 1, obstacleX + 1], [obstacleY, obstacleX - 1], [obstacleY, obstacleX], [obstacleY, obstacleX + 1], [obstacleY + 1, obstacleX - 1], [obstacleY + 1, obstacleX], [obstacleY + 1, obstacleX + 1]];
  for (var idx = 0; idx < tileCoords.length; ++idx) {
    var tileIdx = tileCoords[idx][1] + Maze.COLS * tileCoords[idx][0];
    var tileElement = document.getElementById('tileElement' + tileIdx);
    if (tileElement) {
      tileElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', brokenTiles);
    }
  }
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Maze.scheduleFail = function (forward) {
  var dxDy = tiles.directionToDxDy(Maze.pegmanD);
  var deltaX = dxDy.dx;
  var deltaY = dxDy.dy;

  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }

  var targetX = Maze.pegmanX + deltaX;
  var targetY = Maze.pegmanY + deltaY;
  var frame = tiles.directionToFrame(Maze.pegmanD);
  Maze.displayPegman(Maze.pegmanX + deltaX / 4, Maze.pegmanY + deltaY / 4, frame);
  // Play sound and animation for hitting wall or obstacle
  var squareType = Maze.map[targetY] && Maze.map[targetY][targetX];
  if (squareType === SquareType.WALL || squareType === undefined) {
    // Play the sound
    studioApp.playAudio('wall');
    if (squareType !== undefined) {
      // Check which type of wall pegman is hitting
      studioApp.playAudio('wall' + Maze.wallMap[targetY][targetX]);
    }

    // Play the animation of hitting the wall
    if (skin.hittingWallAnimation) {
      var wallAnimationIcon = document.getElementById('wallAnimation');
      var numFrames = skin.hittingWallAnimationFrameNumber || 0;

      if (numFrames > 1) {

        // The Scrat "wall" animation has him falling backwards into the water.
        // This looks great when he falls into the water above him, but looks a
        // little off when falling to the side/forward. Tune that by bumping the
        // deltaY by one. Hacky, but looks much better
        if (deltaY >= 0) {
          deltaY += 1;
        }
        // animate our sprite sheet
        var timePerFrame = 100;
        Maze.scheduleSheetedMovement({ x: Maze.pegmanX, y: Maze.pegmanY }, { x: deltaX, y: deltaY }, numFrames, timePerFrame, 'wall', Direction.NORTH, true);
        setTimeout(function () {
          document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
        }, numFrames * timePerFrame);
      } else {
        // active our gif
        timeoutList.setTimeout(function () {
          wallAnimationIcon.setAttribute('x', Maze.SQUARE_SIZE * (Maze.pegmanX + 0.5 + deltaX * 0.5) - wallAnimationIcon.getAttribute('width') / 2);
          wallAnimationIcon.setAttribute('y', Maze.SQUARE_SIZE * (Maze.pegmanY + 1 + deltaY * 0.5) - wallAnimationIcon.getAttribute('height'));
          wallAnimationIcon.setAttribute('visibility', 'visible');
          wallAnimationIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.hittingWallAnimation);
        }, stepSpeed / 2);
      }
    }
    timeoutList.setTimeout(function () {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, frame);
    }, stepSpeed);
    timeoutList.setTimeout(function () {
      Maze.displayPegman(Maze.pegmanX + deltaX / 4, Maze.pegmanY + deltaY / 4, frame);
      studioApp.playAudio('failure');
    }, stepSpeed * 2);
    timeoutList.setTimeout(function () {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, frame);
    }, stepSpeed * 3);

    if (skin.wallPegmanAnimation) {
      timeoutList.setTimeout(function () {
        var pegmanIcon = document.getElementById('pegman');
        pegmanIcon.setAttribute('visibility', 'hidden');
        updatePegmanAnimation({
          idStr: 'wall',
          row: Maze.pegmanY,
          col: Maze.pegmanX,
          direction: Maze.pegmanD
        });
      }, stepSpeed * 4);
    }
  } else if (squareType == SquareType.OBSTACLE) {
    // Play the sound
    studioApp.playAudio('obstacle');

    // Play the animation
    var obsId = targetX + Maze.COLS * targetY;
    var obsIcon = document.getElementById('obstacle' + obsId);
    obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacleAnimation);
    timeoutList.setTimeout(function () {
      Maze.displayPegman(Maze.pegmanX + deltaX / 2, Maze.pegmanY + deltaY / 2, frame);
    }, stepSpeed);

    // Replace the objects around obstacles with broken objects
    if (skin.largerObstacleAnimationTiles) {
      timeoutList.setTimeout(function () {
        Maze.updateSurroundingTiles(targetY, targetX, skin.largerObstacleAnimationTiles);
      }, stepSpeed);
    }

    // Remove pegman
    if (!skin.nonDisappearingPegmanHittingObstacle) {
      var svgMaze = document.getElementById('svgMaze');
      var pegmanIcon = document.getElementById('pegman');

      timeoutList.setTimeout(function () {
        pegmanIcon.setAttribute('visibility', 'hidden');
      }, stepSpeed * 2);
    }
    timeoutList.setTimeout(function () {
      studioApp.playAudio('failure');
    }, stepSpeed);
  }
};

/**
 * Set the tiles to be transparent gradually.
 */
function setTileTransparent() {
  var tileId = 0;
  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      var tileAnimation = document.getElementById('tileAnimation' + tileId);
      if (tileElement) {
        tileElement.setAttribute('opacity', 0);
      }
      if (tileAnimation && tileAnimation.beginElement) {
        // IE doesn't support beginElement, so check for it.
        tileAnimation.beginElement();
      }
      tileId++;
    }
  }
}

function setPegmanTransparent() {
  var pegmanFadeoutAnimation = document.getElementById('pegmanFadeoutAnimation');
  var pegmanIcon = document.getElementById('pegman');
  if (pegmanIcon) {
    pegmanIcon.setAttribute('opacity', 0);
  }
  if (pegmanFadeoutAnimation && pegmanFadeoutAnimation.beginElement) {
    // IE doesn't support beginElement, so check for it.
    pegmanFadeoutAnimation.beginElement();
  }
}

/**
 * Schedule the animations and sound for a dance.
 * @param {boolean} victoryDance This is a victory dance after completing the
 *   puzzle (vs. dancing on load).
 * @param {integer} timeAlloted How much time we have for our animations
 */
function scheduleDance(victoryDance, timeAlloted) {
  if (mazeUtils.isScratSkin(skin.id)) {
    scrat.scheduleDance(victoryDance, timeAlloted, skin);
    return;
  }

  var originalFrame = tiles.directionToFrame(Maze.pegmanD);
  Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);

  // If victoryDance == true, play the goal animation, else reset it
  var finishIcon = document.getElementById('finish');
  if (victoryDance && finishIcon) {
    studioApp.playAudio('winGoal');
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalAnimation);
  }

  if (victoryDance) {
    studioApp.playAudio('win');
  }

  var danceSpeed = timeAlloted / 5;
  timeoutList.setTimeout(function () {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
  }, danceSpeed);
  timeoutList.setTimeout(function () {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 20);
  }, danceSpeed * 2);
  timeoutList.setTimeout(function () {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
  }, danceSpeed * 3);
  timeoutList.setTimeout(function () {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 20);
  }, danceSpeed * 4);

  timeoutList.setTimeout(function () {
    if (!victoryDance || skin.turnAfterVictory) {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, originalFrame);
    }

    if (victoryDance && skin.transparentTileEnding) {
      setTileTransparent();
    }

    if (Maze.wordSearch) {
      setPegmanTransparent();
    }
  }, danceSpeed * 5);
}

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} frame Direction (0 - 15) or dance (16 - 17).
 */
Maze.displayPegman = function (x, y, frame) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x', x * Maze.SQUARE_SIZE - frame * Maze.PEGMAN_WIDTH + 1 + Maze.PEGMAN_X_OFFSET);
  pegmanIcon.setAttribute('y', getPegmanYForRow(y));

  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Maze.SQUARE_SIZE + 1 + Maze.PEGMAN_X_OFFSET);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

var scheduleDirtChange = function scheduleDirtChange(options) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.dirt_[row][col] += options.amount;
  Maze.gridItemDrawer.updateItemImage(row, col, true);
  studioApp.playAudio(options.sound);
};

/**
 * Schedule to add dirt at pegman's current position.
 */
Maze.scheduleFill = function () {
  scheduleDirtChange({
    amount: 1,
    sound: 'fill'
  });
};

/**
 * Schedule to remove dirt at pegman's current location.
 */
Maze.scheduleDig = function () {
  scheduleDirtChange({
    amount: -1,
    sound: 'dig'
  });
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Direction} d Direction (0 - 3).
 */
Maze.scheduleLook = function (d) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  switch (d) {
    case Direction.NORTH:
      x += 0.5;
      break;
    case Direction.EAST:
      x += 1;
      y += 0.5;
      break;
    case Direction.SOUTH:
      x += 0.5;
      y += 1;
      break;
    case Direction.WEST:
      y += 0.5;
      break;
  }
  x *= Maze.SQUARE_SIZE;
  y *= Maze.SQUARE_SIZE;
  d = d * 90 - 45;

  var lookIcon = document.getElementById('look');
  lookIcon.setAttribute('transform', 'translate(' + x + ', ' + y + ') ' + 'rotate(' + d + ' 0 0) scale(.4)');
  var paths = lookIcon.getElementsByTagName('path');
  lookIcon.style.display = 'inline';
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    Maze.scheduleLookStep(path, stepSpeed * i);
  }
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Maze.scheduleLookStep = function (path, delay) {
  timeoutList.setTimeout(function () {
    path.style.display = 'inline';
    window.setTimeout(function () {
      path.style.display = 'none';
    }, stepSpeed * 2);
  }, delay);
};

function atFinish() {
  return !Maze.finish_ || Maze.pegmanX == Maze.finish_.x && Maze.pegmanY == Maze.finish_.y;
}

function isDirtCorrect() {
  if (!Maze.dirt_) {
    return true;
  }

  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      if (getTile(Maze.dirt_, x, y) !== 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check whether all goals have been accomplished
 */
Maze.checkSuccess = function () {
  var finished;
  if (!atFinish()) {
    finished = false;
  } else if (Maze.bee) {
    finished = Maze.bee.finished();
  } else if (Maze.wordSearch) {
    finished = Maze.wordSearch.finished();
  } else {
    finished = isDirtCorrect();
  }

  if (finished) {
    // Finished.  Terminate the user's program.
    Maze.executionInfo.queueAction('finish', null);
    Maze.executionInfo.terminateWithValue(true);
  }
  return finished;
};

/**
 * Called after user's code has finished being executed, giving us one more
 * chance to check if we've accomplished our goals. This is required in part
 * because elsewhere we only check for success after movement.
 */
Maze.onExecutionFinish = function () {
  // If we haven't terminated, make one last check for success
  if (!Maze.executionInfo.isTerminated()) {
    Maze.checkSuccess();
  }

  if (Maze.bee) {
    Maze.bee.onExecutionFinish();
  }
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/maze/api.js","./bee":"/home/ubuntu/staging/apps/build/js/maze/bee.js","./beeItemDrawer":"/home/ubuntu/staging/apps/build/js/maze/beeItemDrawer.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/controls.html.ejs","./dirtDrawer":"/home/ubuntu/staging/apps/build/js/maze/dirtDrawer.js","./dropletConfig":"/home/ubuntu/staging/apps/build/js/maze/dropletConfig.js","./executionInfo":"/home/ubuntu/staging/apps/build/js/maze/executionInfo.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/extraControlRows.html.ejs","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js","./scrat":"/home/ubuntu/staging/apps/build/js/maze/scrat.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/visualization.html.ejs","./wordsearch":"/home/ubuntu/staging/apps/build/js/maze/wordsearch.js"}],"/home/ubuntu/staging/apps/build/js/maze/wordsearch.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var cellId = require('./mazeUtils').cellId;

var SquareType = require('./tiles').SquareType;

var SVG_NS = require('../constants').SVG_NS;

/**
 * Create a new WordSearch.
 */
var WordSearch = module.exports = function (goal, map, drawTileFn) {
  this.goal_ = goal;
  this.visited_ = '';
  this.map_ = map;
};

var ALL_CHARS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

var START_CHAR = '-';
var EMPTY_CHAR = '_';

// this should match with Maze.SQUARE_SIZE
var SQUARE_SIZE = 50;

/**
 * Generate random tiles for walls (with some restrictions) and draw them to
 * the svg.
 */
WordSearch.prototype.drawMapTiles = function (svg) {
  var letter;
  var restricted;

  for (var row = 0; row < this.map_.length; row++) {
    for (var col = 0; col < this.map_[row].length; col++) {
      var mapVal = this.map_[row][col];
      if (mapVal === EMPTY_CHAR) {
        restricted = this.restrictedValues_(row, col);
        letter = randomLetter(restricted);
      } else {
        letter = letterValue(mapVal, true);
      }

      this.drawTile_(svg, letter, row, col);
    }
  }
};

/**
 * Returns true if we've spelled the right word.
 */
WordSearch.prototype.finished = function () {
  return this.visited_ === this.goal_;
};

/**
 * Returns true if the given row,col is both on the grid and not a wall
 */
WordSearch.prototype.isOpen_ = function (row, col) {
  var map = this.map_;
  return map[row] !== undefined && map[row][col] !== undefined && map[row][col] !== SquareType.WALL;
};

/**
 * Given a row and col, returns the row, col pair of any non-wall neighbors
 */
WordSearch.prototype.openNeighbors_ = function (row, col) {
  var neighbors = [];
  if (this.isOpen_(row + 1, col)) {
    neighbors.push([row + 1, col]);
  }
  if (this.isOpen_(row - 1, col)) {
    neighbors.push([row - 1, col]);
  }
  if (this.isOpen_(row, col + 1)) {
    neighbors.push([row, col + 1]);
  }
  if (this.isOpen_(row, col - 1)) {
    neighbors.push([row, col - 1]);
  }

  return neighbors;
};

/**
 * We never want to have a branch where either direction gets you the next
 * correct letter.  As such, a "wall" space should never have the same value as
 * an open neighbor of an neighbor (i.e. if my non-wall neighbor has a non-wall
 * neighbor whose value is E, I can't also be E)
 */
WordSearch.prototype.restrictedValues_ = function (row, col) {
  var map = this.map_;
  var neighbors = this.openNeighbors_(row, col);
  var values = [];
  for (var i = 0; i < neighbors.length; i++) {
    var secondNeighbors = this.openNeighbors_(neighbors[i][0], neighbors[i][1]);
    for (var j = 0; j < secondNeighbors.length; j++) {
      var neighborRow = secondNeighbors[j][0];
      var neighborCol = secondNeighbors[j][1];
      // push value to restricted list
      var val = letterValue(map[neighborRow][neighborCol], false);
      values.push(val, false);
    }
  }
  return values;
};

/**
 * Draw a given tile.  Overrides the logic of Maze.drawTile
 */
WordSearch.prototype.drawTile_ = function (svg, letter, row, col) {
  var backgroundId = cellId('backgroundLetter', row, col);
  var textId = cellId('letter', row, col);

  var group = document.createElementNS(SVG_NS, 'g');
  var background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('id', backgroundId);
  background.setAttribute('width', SQUARE_SIZE);
  background.setAttribute('height', SQUARE_SIZE);
  background.setAttribute('x', col * SQUARE_SIZE);
  background.setAttribute('y', row * SQUARE_SIZE);
  background.setAttribute('stroke', '#000000');
  background.setAttribute('stroke-width', 3);
  group.appendChild(background);

  var text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('id', textId);
  text.setAttribute('class', 'search-letter');
  text.setAttribute('width', SQUARE_SIZE);
  text.setAttribute('height', SQUARE_SIZE);
  text.setAttribute('x', (col + 0.5) * SQUARE_SIZE);
  text.setAttribute('y', (row + 0.5) * SQUARE_SIZE);
  text.setAttribute('font-size', 32);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-family', 'Verdana');
  text.textContent = letter;
  group.appendChild(text);
  svg.appendChild(group);
};

/**
 * Reset all tiles to beginning state
 */
WordSearch.prototype.resetTiles = function () {
  for (var row = 0; row < this.map_.length; row++) {
    for (var col = 0; col < this.map_[row].length; col++) {
      this.updateTileHighlight_(row, col, false);
    }
  }
  document.getElementById('currentWordContents').textContent = '';
  this.visited_ = '';
};

/**
 * Update a tile's highlighting. If we've flown over it, it should be green.
 * Otherwise we have a checkboard approach.
 */
WordSearch.prototype.updateTileHighlight_ = function (row, col, highlighted) {
  var backColor = (row + col) % 2 === 0 ? '#dae3f3' : '#ffffff';
  var textColor = highlighted ? 'white' : 'black';
  if (highlighted) {
    backColor = '#00b050';
  }
  var backgroundId = cellId('backgroundLetter', row, col);
  var textId = cellId('letter', row, col);

  document.getElementById(backgroundId).setAttribute('fill', backColor);
  var text = document.getElementById(textId);
  text.setAttribute('fill', textColor);

  // should only be false in unit tests
  if (text.getBBox) {
    // center text.
    var bbox = text.getBBox();
    var heightDiff = SQUARE_SIZE - bbox.height;
    var targetTopY = row * SQUARE_SIZE + heightDiff / 2;
    var offset = targetTopY - bbox.y;

    text.setAttribute("transform", "translate(0, " + offset + ")");
  }
};

/**
 * Mark that we've visited a tile
 * @param {number} row Row visited
 * @param {number} col Column visited
 * @param {boolean} animating True if this is while animating
 */
WordSearch.prototype.markTileVisited = function (row, col, animating) {
  var letter = document.getElementById(cellId('letter', row, col)).textContent;
  this.visited_ += letter;

  if (animating) {
    this.updateTileHighlight_(row, col, true);
    document.getElementById('currentWordContents').textContent = this.visited_;
  }
};

/**
 * For wordsearch, values in Maze.map can take the form of a number (i.e. 2 means
 * start), a letter ('A' means A), or a letter followed by x ('Nx' means N and
 * that this is the finish.  This function will strip the x, and will convert
 * number values to START_CHAR
 */
function letterValue(val) {
  if (typeof val === "number") {
    return START_CHAR;
  }

  if (typeof val === "string") {
    // temporary hack to allow us to have 4 as a letter
    if (val.length === 2 && val[0] === '_') {
      return val[1];
    }
    return val[0];
  }

  throw new Error("unexpected value for letterValue");
}

/**
 * Return a random uppercase letter that isn't in the list of restrictions
 */
function randomLetter(restrictions) {
  var letterPool;
  if (restrictions) {
    // args consists of ALL_CHARS followed by the set of restricted letters
    var args = restrictions || [];
    args.unshift(ALL_CHARS);
    letterPool = _.without.apply(null, args);
  } else {
    letterPool = ALL_CHARS;
  }

  return _.sample(letterPool);
}

/* start-test-block */
// export private function(s) to expose to unit testing
WordSearch.__testonly__ = {
  letterValue: letterValue,
  randomLetter: randomLetter,
  START_CHAR: START_CHAR,
  EMPTY_CHAR: EMPTY_CHAR
};
/* end-test-block */

},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze">\n  <g id="look">\n    <path d="M 0,-15 a 15 15 0 0 1 15 15" />\n    <path d="M 0,-35 a 35 35 0 0 1 35 35" />\n    <path d="M 0,-55 a 55 55 0 0 1 55 55" />\n  </g>\n</svg>\n<div id="capacityBubble">\n  <div id="capacity"></div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/scrat.js":[function(require,module,exports){
'use strict';

var SquareType = require('./tiles').SquareType;
var Direction = require('./tiles').Direction;
var utils = require('../utils');
var _ = utils.getLodash();
var studioApp = require('../StudioApp').singleton;

var TILE_SHAPES = {
  'log': [0, 0],
  'lily1': [1, 0],
  'land1': [2, 0],
  'island_start': [0, 1],
  'island_topRight': [1, 1],
  'island_botLeft': [0, 2],
  'island_botRight': [1, 2],
  'water': [4, 0],

  'lily2': [2, 1],
  'lily3': [3, 1],
  'lily4': [2, 2],
  'lily5': [3, 2],

  'ice': [3, 0],

  'empty': [4, 0]
};

// Returns true if the tile at x,y is either a water tile or out of bounds
function isWaterOrOutOfBounds(x, y) {
  return Maze.map[y] === undefined || Maze.map[y][x] === undefined || Maze.map[y][x] === SquareType.WALL;
}

// Returns true if the tile at x,y is a water tile that is in bounds.
function isWater(x, y) {
  return Maze.map[y] !== undefined && Maze.map[y][x] === SquareType.WALL;
}

/**
 * Override maze's drawMapTiles
 */
module.exports.drawMapTiles = function (svg) {
  var row, col;

  // first figure out where we want to put the island
  var possibleIslandLocations = [];
  for (row = 0; row < Maze.ROWS; row++) {
    for (col = 0; col < Maze.COLS; col++) {
      if (!isWater(col, row) || !isWater(col + 1, row) || !isWater(col, row + 1) || !isWater(col + 1, row + 1)) {
        continue;
      }
      possibleIslandLocations.push({ row: row, col: col });
    }
  }
  var island = _.sample(possibleIslandLocations);
  var preFilled = {};
  if (island) {
    preFilled[island.row + 0 + "_" + (island.col + 0)] = 'island_start';
    preFilled[island.row + 1 + "_" + (island.col + 0)] = 'island_botLeft';
    preFilled[island.row + 0 + "_" + (island.col + 1)] = 'island_topRight';
    preFilled[island.row + 1 + "_" + (island.col + 1)] = 'island_botRight';
  }

  var tileId = 0;
  var tile;
  for (row = 0; row < Maze.ROWS; row++) {
    for (col = 0; col < Maze.COLS; col++) {
      if (!isWaterOrOutOfBounds(col, row)) {
        tile = 'ice';
      } else {
        var adjacentToPath = !isWaterOrOutOfBounds(col, row - 1) || !isWaterOrOutOfBounds(col + 1, row) || !isWaterOrOutOfBounds(col, row + 1) || !isWaterOrOutOfBounds(col - 1, row);

        // if next to the path, always just have water. otherwise, there's
        // a chance of one of our other tiles
        tile = 'water';

        tile = preFilled[row + "_" + col];
        if (!tile) {
          tile = _.sample(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2', 'lily3', 'lily4', 'lily5', 'lily1', 'log', 'lily1', 'land1']);
        }

        if (adjacentToPath && tile === 'land1') {
          tile = 'empty';
        }
      }
      Maze.drawTile(svg, TILE_SHAPES[tile], row, col, tileId);
      tileId++;
    }
  }
};

/**
 * Schedule the animations for Scrat dancing.
 * @param {integer} timeAlloted How much time we have for our animations
 */
module.exports.scheduleDance = function (victoryDance, timeAlloted, skin) {
  var finishIcon = document.getElementById('finish');
  if (finishIcon) {
    finishIcon.setAttribute('visibility', 'hidden');
  }

  var numFrames = skin.celebratePegmanRow;
  var timePerFrame = timeAlloted / numFrames;
  var start = { x: Maze.pegmanX, y: Maze.pegmanY };

  Maze.scheduleSheetedMovement({ x: start.x, y: start.y }, { x: 0, y: 0 }, numFrames, timePerFrame, 'celebrate', Direction.NORTH, true);

  studioApp.playAudio('win');
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/levels.js":[function(require,module,exports){
'use strict';

var Direction = require('./tiles').Direction;
var karelLevels = require('./karelLevels');
var wordsearchLevels = require('./wordsearchLevels');
var reqBlocks = require('./requiredBlocks');
var blockUtils = require('../block_utils');
var utils = require('../utils');
var mazeMsg = require('./locale');

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function toolbox(page, level) {
  return require('./toolboxes/maze.xml.ejs')({
    page: page,
    level: level
  });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function startBlocks(page, level) {
  return require('./startBlocks.xml.ejs')({
    page: page,
    level: level
  });
};

/*
 * Configuration for all levels.
 */
module.exports = {

  // Formerly Page 2

  '2_1': {
    'toolbox': toolbox(2, 1),
    'ideal': 4,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 1, 1, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 1)
  },
  'k1_demo': {
    'toolbox': blockUtils.createToolbox(blockUtils.blockOfType('maze_moveNorth') + blockUtils.blockOfType('maze_moveSouth') + blockUtils.blockOfType('maze_moveEast') + blockUtils.blockOfType('maze_moveWest') + blockUtils.blockOfType('controls_repeat_simplified')),
    'ideal': 4,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 1, 1, 3, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 1)
  },
  '2_2': {
    'toolbox': toolbox(2, 2),
    'ideal': 3,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD]],
    'startDirection': Direction.SOUTH,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 2, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 3, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 2)
  },
  '2_2_5': {
    'toolbox': toolbox(2, 3),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 4, 0, 0, 0], [0, 0, 2, 1, 1, 0, 0, 0], [0, 0, 4, 0, 3, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 3)
  },
  '2_3': {
    'toolbox': toolbox(2, 3),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 4, 1, 3, 0, 0, 0], [0, 0, 2, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 3)
  },
  '2_4': {
    'toolbox': toolbox(2, 4),
    'ideal': 9,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 4, 0, 3, 0, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_5': {
    'toolbox': toolbox(2, 5),
    'ideal': 3,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.FOR_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 1, 1, 1, 1, 3, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_6': {
    'toolbox': toolbox(2, 6),
    'ideal': 4,
    'requiredBlocks': [[reqBlocks.TURN_RIGHT], [reqBlocks.MOVE_FORWARD], [reqBlocks.FOR_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 2, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 3, 0, 0, 0]]
  },
  '2_7': {
    'toolbox': toolbox(2, 7),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.FOR_LOOP], [reqBlocks.TURN_LEFT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 3, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 2, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_8': {
    'toolbox': toolbox(2, 8),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.FOR_LOOP], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 3, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startBlocks': startBlocks(2, 8),
    'levelIncompleteError': mazeMsg.repeatCarefullyError(),
    'tooFewBlocksMsg': mazeMsg.repeatCarefullyError()
  },
  '2_9': {
    'toolbox': toolbox(2, 9),
    'ideal': 3,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 1, 1, 1, 1, 3, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_10': {
    'toolbox': toolbox(2, 10),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 3, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 2, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_11': {
    'toolbox': toolbox(2, 11),
    'ideal': 6,
    'scale': {
      'stepSpeed': 3
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.WHILE_LOOP], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 3, 1], [0, 0, 0, 0, 0, 1, 1, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [2, 1, 0, 0, 0, 0, 0, 0]]
  },
  '2_12': {
    'toolbox': toolbox(2, 12),
    'ideal': 6,
    'scale': {
      'stepSpeed': 3
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.WHILE_LOOP], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[1, 0, 0, 0, 0, 0, 0, 0], [1, 2, 4, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 1, 3, 0], [0, 0, 0, 0, 0, 0, 1, 1]]
  },
  '2_13': {
    'toolbox': toolbox(2, 13),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.TURN_LEFT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 3, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 2, 1, 1, 0, 0], [0, 0, 0, 0, 0, 4, 0, 0]],
    'startBlocks': startBlocks(2, 13)
  },
  '2_14': {
    'toolbox': toolbox(2, 14),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_RIGHT], [reqBlocks.IS_PATH_RIGHT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 4, 0, 0, 0, 0], [0, 0, 0, 1, 0, 1, 0, 0], [0, 0, 2, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 1, 4], [0, 0, 0, 0, 0, 1, 0, 0], [0, 3, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'levelIncompleteError': mazeMsg.ifInRepeatError(),
    'showPreviousLevelButton': true
  },
  '2_15': {
    'toolbox': toolbox(2, 15),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.IS_PATH_LEFT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.NORTH,
    'map': [[0, 0, 0, 4, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 0], [0, 1, 0, 0, 0, 1, 0, 0], [0, 1, 0, 3, 0, 1, 0, 0], [0, 1, 0, 1, 0, 1, 1, 4], [0, 1, 1, 1, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_16': {
    'toolbox': toolbox(2, 16),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_RIGHT], [reqBlocks.IS_PATH_RIGHT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.SOUTH,
    'map': [[0, 0, 0, 4, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 1, 1, 1, 2, 0, 0], [0, 0, 0, 0, 0, 1, 1, 4], [0, 1, 1, 3, 0, 1, 0, 4], [0, 1, 0, 0, 0, 1, 0, 1], [0, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_17': {
    'toolbox': toolbox(2, 17),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.IS_PATH_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 4, 1, 1, 1, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [3, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 1, 0, 0, 1, 0], [1, 1, 1, 4, 1, 0, 1, 0], [0, 1, 0, 1, 0, 2, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_18': {
    'toolbox': toolbox(2, 18),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.IS_PATH_FORWARD], [reqBlocks.TURN_RIGHT], [reqBlocks.WHILE_LOOP]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 4, 0, 4, 0, 4, 0], [0, 0, 1, 0, 1, 0, 1, 0], [0, 2, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 0, 1, 1, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 1, 0, 1, 1, 0], [0, 1, 3, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '2_19': {
    'toolbox': toolbox(2, 19),
    'ideal': 7,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.NORTH,
    'map': [[1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1], [1, 0, 1, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 1, 1, 1], [1, 0, 1, 0, 3, 0, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1], [2, 0, 1, 1, 1, 1, 1, 1]],
    'startBlocks': startBlocks(2, 19)
  },

  // Copied levels with editCode enabled
  '3_1': {
    'toolbox': toolbox(3, 1),
    'ideal': 3,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 1, 3, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '3_2': {
    'toolbox': toolbox(3, 2),
    'ideal': 4,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD]],
    'startDirection': Direction.SOUTH,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 2, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 3, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '3_3': {
    'toolbox': toolbox(3, 3),
    'ideal': 6,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT], [reqBlocks.TURN_RIGHT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 4, 1, 3, 0, 0, 0], [0, 0, 2, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  '3_4': {
    'toolbox': toolbox(3, 4),
    'ideal': 8,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null
    },
    'requiredBlocks': [[reqBlocks.MOVE_FORWARD], [reqBlocks.TURN_LEFT]],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 4, 3, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },
  'custom': {
    'toolbox': toolbox(3, 4),
    'requiredBlocks': [],
    'startDirection': Direction.EAST,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 2, 4, 3, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  }
};

// Merge in Karel levels.
for (var levelId in karelLevels) {
  module.exports['karel_' + levelId] = karelLevels[levelId];
}

// Merge in Wordsearch levels.
for (var levelId in wordsearchLevels) {
  module.exports['wordsearch_' + levelId] = wordsearchLevels[levelId];
}

// Add some step levels
function cloneWithStep(level, step, stepOnly) {
  var obj = utils.extend({}, module.exports[level]);

  obj.step = step;
  obj.stepOnly = stepOnly;
  module.exports[level + '_step'] = obj;
}

cloneWithStep('2_1', true, true);
cloneWithStep('2_2', true, false);
cloneWithStep('2_17', true, false);
cloneWithStep('karel_1_9', true, false);
cloneWithStep('karel_2_9', true, false);

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./karelLevels":"/home/ubuntu/staging/apps/build/js/maze/karelLevels.js","./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","./requiredBlocks":"/home/ubuntu/staging/apps/build/js/maze/requiredBlocks.js","./startBlocks.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/startBlocks.xml.ejs","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js","./toolboxes/maze.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/toolboxes/maze.xml.ejs","./wordsearchLevels":"/home/ubuntu/staging/apps/build/js/maze/wordsearchLevels.js"}],"/home/ubuntu/staging/apps/build/js/maze/wordsearchLevels.js":[function(require,module,exports){
'use strict';

var Direction = require('./tiles').Direction;
var reqBlocks = require('./requiredBlocks');
var blockUtils = require('../block_utils');

var wordSearchToolbox = function wordSearchToolbox() {
  return blockUtils.createToolbox(blockUtils.blockOfType('maze_moveNorth') + blockUtils.blockOfType('maze_moveSouth') + blockUtils.blockOfType('maze_moveEast') + blockUtils.blockOfType('maze_moveWest'));
};

/*
 * Configuration for all levels.
 */
module.exports = {
  'k_1': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.moveEast]],
    'startDirection': Direction.EAST,
    'searchWord': 'EAST',
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', 2, 'E', 'A', 'S', 'T', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', 'K', 'E', 'L', 'L', 'Y', 'B', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']],
    'startBlocks': blockUtils.blockOfType('maze_moveEast')
  },
  'k_2': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveSouth]],
    'searchWord': 'SOUTH',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['A', 'N', 'G', 'I', 'E', 'D', 'O', 'G'], ['_', '_', '_', 2, '_', '_', '_', '_'], ['_', '_', '_', 'S', '_', '_', '_', '_'], ['_', '_', '_', 'O', '_', '_', '_', '_'], ['_', '_', '_', 'U', '_', '_', '_', '_'], ['_', '_', '_', 'T', '_', '_', '_', '_'], ['_', '_', '_', 'H', '_', '_', '_', '_']],
    'startBlocks': blockUtils.blockOfType('maze_moveSouth')
  },
  'k_3': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.moveWest]],
    'searchWord': 'WEST',
    'startDirection': Direction.WEST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['L', 'E', 'V', 'E', 'N', 'S', 'O', 'N'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', 'T', 'S', 'E', 'W', 2, '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']],
    'startBlocks': blockUtils.blockOfType('maze_moveWest')
  },
  'k_4': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveNorth]],
    'searchWord': 'NORTH',
    'startDirection': Direction.NORTH,
    step: true,
    // When this gets removed, also remove the hack from letterValue
    map: [['_', '_', '_', '_', 'G', '_', '_', '_'], ['_', '_', 'H', '_', 'O', '_', '_', '_'], ['_', '_', 'T', '_', '_4', '_', '_', '_'], ['_', '_', 'R', '_', 'I', '_', '_', '_'], ['_', '_', 'O', '_', 'T', '_', '_', '_'], ['_', '_', 'N', '_', 'J', '_', '_', '_'], ['_', '_', 2, '_', 'R', '_', '_', '_'], ['_', '_', '_', '_', 'F', '_', '_', '_']]
  },
  'k_6': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.moveEast], [reqBlocks.moveSouth]],
    'searchWord': 'JUMP',
    'startDirection': Direction.EAST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['S', '_', '_', '_', '_', '_', '_', '_'], ['A', '_', '_', '_', '_', '_', '_', '_'], ['Y', '_', 2, 'J', 'U', 'M', '_', '_'], ['E', '_', '_', '_', '_', 'P', '_', '_'], ['E', '_', '_', '_', '_', '_', '_', '_'], ['D', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  },
  'k_9': {
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [[reqBlocks.moveEast], [reqBlocks.moveNorth]],
    'searchWord': 'CODE',
    'startDirection': Direction.EAST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', 'M', '_'], ['_', '_', '_', '_', '_', '_', 'A', '_'], ['_', '_', '_', '_', '_', '_', 'R', '_'], ['_', '_', '_', 'D', 'E', '_', 'K', '_'], ['_', 2, 'C', 'O', '_', '_', 'N', '_'], ['_', '_', '_', '_', '_', '_', 'P', '_'], ['_', '_', '_', '_', '_', '_', 'A', '_'], ['_', '_', '_', '_', '_', '_', 'M', '_']]
  },
  'k_13': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveEast], [reqBlocks.moveSouth]],
    'searchWord': 'DEBUG',
    'startDirection': Direction.EAST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', 2, 'D', 'E', '_', '_', '_', '_'], ['_', '_', '_', 'B', '_', '_', '_', '_'], ['_', '_', '_', 'U', 'G', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', 'H', 'E', 'N', 'R', 'Y'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  },
  'k_15': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveSouth], [reqBlocks.moveEast]],
    'searchWord': 'ABOVE',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', 2, '_', '_', '_', '_', '_'], ['_', '_', 'A', '_', '_', '_', '_', '_'], ['_', '_', 'B', 'O', '_', '_', '_', '_'], ['_', '_', '_', 'V', 'E', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  },
  'k_16': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveEast], [reqBlocks.moveNorth]],
    'searchWord': 'BELOW',
    'startDirection': Direction.EAST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', 'W', '_', '_', '_'], ['_', '_', '_', '_', 'O', '_', '_', '_'], ['_', '_', '_', 'E', 'L', '_', '_', '_'], ['_', '_', 2, 'B', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  },
  'k_20': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [[reqBlocks.moveEast], [reqBlocks.moveSouth]],
    'searchWord': 'STORY',
    'startDirection': Direction.EAST,
    step: true,
    map: [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', 2, 'S', 'T', '_', '_', '_'], ['_', '_', '_', '_', 'O', '_', '_', '_'], ['_', '_', '_', '_', 'R', '_', '_', '_'], ['_', '_', '_', '_', 'Y', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  }

};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","./requiredBlocks":"/home/ubuntu/staging/apps/build/js/maze/requiredBlocks.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/toolboxes/maze.xml.ejs":[function(require,module,exports){
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
 buf.push('<xml id="toolbox" style="display: none;">\n  <block type="maze_moveForward"></block>\n  <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n  <block type="maze_turn"><title name="DIR">turnRight</title></block>\n  ');5; if (page == 1) {; buf.push('    ');5; if (level > 2) {; buf.push('      <block type="maze_forever"></block>\n      ');6; if (level == 5) {; buf.push('        <block type="maze_if"><title name="DIR">isPathLeft</title></block>\n      ');7; } else if (level > 5 && level < 9) {; buf.push('        <block type="maze_if"></block>\n      ');8; }; buf.push('      ');8; if (level > 8) {; buf.push('       <block type="maze_ifElse"></block>\n      ');9; }; buf.push('    ');9; }; buf.push('  ');9; } else if (page == 2) {; buf.push('    ');9; if (level > 4 && level < 9) {; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">5</title>\n      </block>\n    ');12; }; buf.push('    ');12; if (level > 8) {; buf.push('      <block type="maze_forever"></block>\n      ');13; if (level == 13 || level == 15) {; buf.push('        <block type="maze_if"><title name="DIR">isPathLeft</title></block>\n      ');14; } else if (level == 14 || level == 16) {; buf.push('        <block type="maze_if"><title name="DIR">isPathRight</title></block>\n      ');15; }; buf.push('      ');15; if (level > 16) {; buf.push('       <block type="maze_ifElse"></block>\n      ');16; }; buf.push('    ');16; }; buf.push('  ');16; }; buf.push('</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/startBlocks.xml.ejs":[function(require,module,exports){
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
 buf.push('');1; if (page == 2) {; buf.push('  ');1; if (level < 4) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');2; } else if (level == 8) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false"\n      deletable="false">\n      <title name="TIMES">3</title>\n    </block>\n  ');6; } else if (level == 13) {; buf.push('    <block type="maze_forever" x="20" y="70" editable="false" deletable="false">\n      <statement name="DO">\n        <block type="maze_moveForward" editable="false" deletable="false">\n          <next>\n            <block type="maze_if" editable="false" deletable="false">\n              <title name="DIR">isPathLeft</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');17; } else if (level == 19) {; buf.push('    <block type="maze_forever" x="20" y="70" editable="false" deletable="false">\n      <statement name="DO">\n        <block type="maze_ifElse" editable="false" deletable="false">\n          <title name="DIR">isPathForward</title>\n          <statement name="ELSE">\n            <block type="maze_ifElse" editable="false" deletable="false">\n              <title name="DIR">isPathRight</title>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');29; }; buf.push('');29; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/requiredBlocks.js":[function(require,module,exports){
'use strict';

var requiredBlockUtils = require('../required_block_utils');

var MOVE_FORWARD = { 'test': 'moveForward', 'type': 'maze_moveForward' };
var TURN_LEFT = { 'test': 'turnLeft', 'type': 'maze_turn', 'titles': { 'DIR': 'turnLeft' } };
var TURN_RIGHT = { 'test': 'turnRight', 'type': 'maze_turn', 'titles': { 'DIR': 'turnRight' } };
var WHILE_LOOP = { 'test': 'while', 'type': 'maze_forever' };
var IS_PATH_LEFT = { 'test': 'isPathLeft', 'type': 'maze_if', 'titles': { 'DIR': 'isPathLeft' } };
var IS_PATH_RIGHT = { 'test': 'isPathRight', 'type': 'maze_if', 'titles': { 'DIR': 'isPathRight' } };
var IS_PATH_FORWARD = { 'test': 'isPathForward', 'type': 'maze_ifElse', 'titles': { 'DIR': 'isPathForward' } };
var FOR_LOOP = { 'test': 'for', 'type': 'controls_repeat', titles: { TIMES: '???' } };

module.exports = {
  moveNorth: requiredBlockUtils.simpleBlock('maze_moveNorth'),
  moveSouth: requiredBlockUtils.simpleBlock('maze_moveSouth'),
  moveEast: requiredBlockUtils.simpleBlock('maze_moveEast'),
  moveWest: requiredBlockUtils.simpleBlock('maze_moveWest'),
  controls_repeat_simplified: requiredBlockUtils.repeatSimpleBlock('???'),
  MOVE_FORWARD: MOVE_FORWARD,
  TURN_LEFT: TURN_LEFT,
  TURN_RIGHT: TURN_RIGHT,
  WHILE_LOOP: WHILE_LOOP,
  IS_PATH_LEFT: IS_PATH_LEFT,
  IS_PATH_RIGHT: IS_PATH_RIGHT,
  IS_PATH_FORWARD: IS_PATH_FORWARD,
  FOR_LOOP: FOR_LOOP
};

},{"../required_block_utils":"/home/ubuntu/staging/apps/build/js/required_block_utils.js"}],"/home/ubuntu/staging/apps/build/js/maze/karelLevels.js":[function(require,module,exports){
/*jshint multistr: true */

'use strict';

var levelBase = require('../level_base');
var Direction = require('./tiles').Direction;
var msg = require('./locale');
var blockUtils = require('../block_utils');

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function toolbox(page, level) {
  var template;
  // Must use switch, since browserify only works on requires with literals.
  switch (page) {
    case 1:
      template = require('./toolboxes/karel1.xml.ejs');
      break;
    case 2:
      template = require('./toolboxes/karel2.xml.ejs');
      break;
    case 3:
      template = require('./toolboxes/karel3.xml.ejs');
      break;
  }
  return template({ level: level });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function startBlocks(page, level) {
  return require('./karelStartBlocks.xml.ejs')({
    page: page,
    level: level
  });
};

// This tests for and creates the "move_forward" block.
var MOVE_FORWARD = {
  'test': function test(block) {
    return block.type == 'maze_moveForward';
  },
  'type': 'maze_moveForward'
};

// This tests for and creates the "dig" block.
var DIG = { 'test': 'dig', 'type': 'maze_dig' };

// This tests for and creates the "fill" block.
var FILL = { 'test': 'fill', 'type': 'maze_fill' };

// This tests for and creates the "controls_repeat" block.
var REPEAT = {
  'test': function test(block) {
    return block.type == 'controls_repeat';
  },
  'type': 'controls_repeat',
  'titles': { 'TIMES': '???' }
};

// This tests for and creates the "controls_repeat_ext" block.
var REPEAT_EXT = {
  'test': function test(block) {
    return block.type == 'controls_repeat_ext';
  },
  'type': 'controls_repeat_ext'
};

// This tests for and creates the "controls_for" block.
var CONTROLS_FOR = {
  'test': function test(block) {
    return block.type == 'controls_for';
  },
  'type': 'controls_for'
};

// This tests for and creates the "variables_get" block.
var VARIABLES_GET = {
  'test': function test(block) {
    return block.type == 'variables_get';
  },
  'type': 'variables_get',
  'titles': { 'VAR': 'i' }
};

// This tests for and creates the "maze_turn" block turning left.
var TURN_LEFT = {
  'test': 'turnLeft',
  'type': 'maze_turn',
  'titles': { 'DIR': 'turnLeft' }
};

// This tests for and creates the "maze_turn" block turning right.
var TURN_RIGHT = {
  'test': 'turnRight',
  'type': 'maze_turn',
  'titles': { 'DIR': 'turnRight' }
};

// This tests for and creates the "maze_untilBlocked" block.
var UNTIL_BLOCKED = {
  'test': 'while (Maze.isPathForward',
  'type': 'maze_untilBlocked'
};

// This tests for and creates the "maze_untilBlockedOrNotClear" block with the option "pilePresent" selected.
var WHILE_OPT_PILE_PRESENT = {
  'test': 'while (Maze.pilePresent',
  'type': 'maze_untilBlockedOrNotClear',
  'titles': { 'DIR': 'pilePresent' }
};

// This tests for and creates the "maze_untilBlockedOrNotClear" block with the option "holePresent" selected.
var WHILE_OPT_HOLE_PRESENT = {
  'test': 'while (Maze.holePresent',
  'type': 'maze_untilBlockedOrNotClear',
  'titles': { 'DIR': 'holePresent' }
};

// This tests for and creates the "maze_untilBlockedOrNotClear" block with the option "isPathForward" selected.
var WHILE_OPT_PATH_AHEAD = {
  'test': 'while (Maze.isPathForward',
  'type': 'maze_untilBlockedOrNotClear',
  'titles': { 'DIR': 'isPathForward' }
};

// This tests for and creates the "karel_if" block.
var IF = { 'test': 'if', 'type': 'karel_if' };

// This tests for and creates the "karel_if" block with the option "pilePresent" selected.
var IF_OPT_PILE_PRESENT = {
  'test': 'if (Maze.pilePresent',
  'type': 'karel_if',
  'titles': { 'DIR': 'pilePresent' }
};

// This tests for and creates the "karel_if" block with the option "holePresent" selected.
var IF_OPT_HOLE_PRESENT = {
  'test': 'if (Maze.holePresent',
  'type': 'karel_if',
  'titles': { 'DIR': 'holePresent' }
};

// This tests for and creates the "karel_ifElse" block.
var IF_ELSE = { 'test': '} else {', 'type': 'karel_ifElse' };

// This tests for and creates the "fill num" block.
var fill = function fill(num) {
  return { 'test': function test(block) {
      return block.getTitleValue('NAME') == msg.fillN({ shovelfuls: num });
    },
    'type': 'procedures_callnoreturn',
    'titles': { 'NAME': msg.fillN({ shovelfuls: num }) } };
};

// This tests for and creates the "remove num" blcok.
var remove = function remove(num) {
  return { 'test': function test(block) {
      return block.getTitleValue('NAME') == msg.removeN({ shovelfuls: num });
    },
    'type': 'procedures_callnoreturn',
    'titles': { 'NAME': msg.removeN({ shovelfuls: num }) } };
};

// This tests for and creates the "avoid the cow and remove 1" block.
var AVOID_OBSTACLE_AND_REMOVE = {
  'test': function test(block) {
    return block.getTitleValue('NAME') == msg.avoidCowAndRemove();
  },
  'type': 'procedures_callnoreturn',
  'titles': { 'NAME': msg.avoidCowAndRemove() }
};

// This tests for and creates the "remove 1 and avoid the cow" block.
var REMOVE_AND_AVOID_OBSTACLE = {
  'test': function test(block) {
    return block.getTitleValue('NAME') == msg.removeAndAvoidTheCow();
  },
  'type': 'procedures_callnoreturn',
  'titles': { 'NAME': msg.removeAndAvoidTheCow() }
};

// This tests for and creates the "remove piles" block.
var REMOVE_PILES = {
  'test': function test(block) {
    return block.getTitleValue('NAME') == msg.removeStack({ shovelfuls: 4 });
  },
  'type': 'procedures_callnoreturn',
  'titles': { 'NAME': msg.removeStack({ shovelfuls: 4 }) }
};

// This tests for and creates the "fill holes" block.
var FILL_HOLES = {
  'test': function test(block) {
    return block.getTitleValue('NAME') == msg.fillStack({ shovelfuls: 2 });
  },
  'type': 'procedures_callnoreturn',
  'titles': { 'NAME': msg.fillStack({ shovelfuls: 2 }) }
};

module.exports = {

  // Formerly page 1
  '1_1': {
    'toolbox': toolbox(1, 1),
    'startBlocks': startBlocks(1, 1),
    'ideal': 6,
    'requiredBlocks': [[MOVE_FORWARD], [DIG]],
    'scale': {
      'snapRadius': 2.0
    },
    'map': [[0, 0, 0, 0, 0, 1, 1, 1], [0, 1, 1, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [2, 1, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_2': {
    'toolbox': toolbox(1, 2),
    'startBlocks': startBlocks(1, 2),
    'ideal': 4,
    'requiredBlocks': [[MOVE_FORWARD], [FILL]],
    'map': [[0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 0, 0, 0, 0], [0, 1, 2, 1, 0, 0, 0, 0], [0, 1, 1, 1, 0, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, -2, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_3': {
    'toolbox': toolbox(1, 3),
    'startBlocks': startBlocks(1, 3),
    'ideal': 4,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [REPEAT]],
    'map': [[1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 1, 1, 1, 0], [0, 0, 0, 0, 1, 2, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.SOUTH,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 10, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_4': {
    'toolbox': toolbox(1, 4),
    'ideal': 5,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [TURN_LEFT], [REPEAT]],
    'map': [[0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_5': {
    'toolbox': toolbox(1, 5),
    'startBlocks': startBlocks(1, 5),
    'ideal': 6,
    'requiredBlocks': [[MOVE_FORWARD], [FILL], [REPEAT], [UNTIL_BLOCKED]],
    'scale': {
      'stepSpeed': 2
    },
    'map': [[1, 1, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [2, 1, 1, 1, 1, 1, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, -5, -5, -5, -5, -5, 0, 0]]
  },

  '1_6': {
    'toolbox': toolbox(1, 6),
    'ideal': 4,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [WHILE_OPT_PILE_PRESENT, REPEAT, WHILE_OPT_PATH_AHEAD]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[1, 1, 0, 1, 1, 0, 1, 1], [1, 1, 0, 2, 1, 0, 1, 1], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [1, 1, 0, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 0, 1, 1]],
    'startDirection': Direction.SOUTH,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_7': {
    'toolbox': toolbox(1, 7),
    'startBlocks': startBlocks(1, 7),
    'ideal': 5,
    'requiredBlocks': [[TURN_RIGHT], [MOVE_FORWARD], [FILL], [WHILE_OPT_HOLE_PRESENT]],
    'scale': {
      'stepSpeed': 2
    },
    'map': [[1, 1, 0, 0, 0, 0, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1], [0, 1, 1, 2, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0], [1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 0, 0, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, -18, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_8': {
    'toolbox': toolbox(1, 8),
    'ideal': 4,
    'requiredBlocks': [[MOVE_FORWARD], [FILL], [WHILE_OPT_PATH_AHEAD, REPEAT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1], [2, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_9': {
    'toolbox': toolbox(1, 9),
    'ideal': 10,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [WHILE_OPT_PATH_AHEAD, REPEAT], [TURN_LEFT]],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [[0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [2, 1, 1, 1, 1, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 0]]
  },

  '1_10': {
    'toolbox': toolbox(1, 10),
    'startBlocks': startBlocks(1, 10),
    'ideal': 5,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [IF_OPT_PILE_PRESENT], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [[1, 1, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [2, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '1_11': {
    'toolbox': toolbox(1, 11),
    'startBlocks': startBlocks(1, 11),
    'ideal': 7,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [FILL], [IF_OPT_PILE_PRESENT], [IF_OPT_HOLE_PRESENT], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [[1, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0], [2, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 0, 0, 1, 1], [1, 1, 1, 0, 0, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, -1, 0, 0, -1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  // Formerly page 2

  '2_1': {
    'toolbox': toolbox(2, 1),
    'startBlocks': startBlocks(2, 1),
    'ideal': null,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [FILL], [TURN_LEFT, TURN_RIGHT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 0], [2, 1, 1, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 0, 0, 0, 0], [1, 0, 1, 0, 0, 0, 0, 0], [1, -1, 1, 0, 0, 0, 0, 0], [1, -1, 1, 0, 0, 0, 0, 0]]
  },

  '2_2': {
    'toolbox': toolbox(2, 2),
    'startBlocks': startBlocks(2, 2),
    'ideal': 6,
    'requiredBlocks': [[MOVE_FORWARD], [fill(5)]],
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 1, 0], [0, 1, 0, 0, 0, 0, 1, 0], [0, 1, 0, 2, 1, 0, 1, 0], [0, 1, 0, 1, 1, 0, 1, 0], [0, 1, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, -5, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_3': {
    'toolbox': toolbox(2, 3),
    'startBlocks': startBlocks(2, 3),
    'ideal': 8,
    'requiredBlocks': [[MOVE_FORWARD], [fill(5)], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 2
    },
    'map': [[0, 1, 1, 1, 1, 1, 1, 0], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [0, 2, 1, 1, 1, 1, 1, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, -5, -5, -5, -5, -5, 0]]
  },

  '2_4': {
    'toolbox': toolbox(2, 4),
    'startBlocks': startBlocks(2, 4),
    'ideal': 13,
    'requiredBlocks': [[DIG], [REPEAT], [remove(7)], [MOVE_FORWARD], [TURN_LEFT], [TURN_RIGHT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 1, 0, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1, 1, 0], [1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0, 0, 1], [0, 1, 2, 1, 0, 0, 1, 1], [1, 1, 1, 0, 0, 1, 1, 1], [1, 1, 0, 0, 1, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 7, 0, 0], [0, 0, 0, 0, 7, 0, 0, 0], [0, 0, 0, 7, 0, 0, 0, 0], [0, 0, 7, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_5': {
    'toolbox': toolbox(2, 5),
    'startBlocks': startBlocks(2, 5),
    'ideal': 8,
    'requiredBlocks': [[DIG], [REPEAT], [remove(6)], [MOVE_FORWARD]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [1, 2, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 6, 0, 6, 0, 6, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_6': {
    'toolbox': toolbox(2, 6),
    'startBlocks': startBlocks(2, 6),
    'ideal': 11,
    'requiredBlocks': [[remove(8)], [fill(8)], [MOVE_FORWARD], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [2, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1, 1, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [8, 0, 0, 0, 0, 0, 0, -8], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_7': {
    'toolbox': toolbox(2, 7),
    'startBlocks': startBlocks(2, 7),
    'ideal': 11,
    'requiredBlocks': [[TURN_LEFT], [MOVE_FORWARD], [TURN_RIGHT], [DIG]],
    'map': [[1, 1, 0, 0, 0, 1, 1, 1], [1, 1, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 2, 4, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_8': {
    'toolbox': toolbox(2, 8),
    'startBlocks': startBlocks(2, 8),
    'ideal': 13,
    'requiredBlocks': [[REPEAT], [AVOID_OBSTACLE_AND_REMOVE]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1], [2, 4, 1, 4, 1, 4, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  '2_9': {
    'toolbox': toolbox(2, 9),
    'startBlocks': startBlocks(2, 9),
    'ideal': 14,
    'requiredBlocks': [[REMOVE_PILES], [MOVE_FORWARD], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [2, 1, 1, 1, 1, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 0, 0], [1, 1, 1, 1, 1, 1, 0, 0], [1, 1, 1, 1, 1, 1, 0, 0], [1, 1, 1, 1, 1, 1, 0, 0]]
  },

  '2_10': {
    'toolbox': toolbox(2, 10),
    'startBlocks': startBlocks(2, 10),
    'ideal': 27,
    'requiredBlocks': [[REMOVE_PILES], [MOVE_FORWARD], [FILL_HOLES], [IF_OPT_PILE_PRESENT, IF_ELSE], [UNTIL_BLOCKED, REPEAT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [2, 1, 1, 1, 1, 1, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 0, 1, 0, 0], [1, 0, 1, 0, 0, 1, 0, 0], [1, -1, 1, -1, -1, 1, -1, 0], [1, -1, 1, -1, -1, 1, -1, 0]]
  },

  // Page 3 to Debug

  'debug_seq_1': {
    'toolbox': toolbox(3, 1),
    'startBlocks': startBlocks(3, 1),
    'ideal': 8,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [FILL], [TURN_LEFT], [TURN_RIGHT]],
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 4, 1, 1, 0, 0, 0], [0, 0, 2, 1, 4, 0, 0, 0], [1, 1, 0, 0, 0, 1, 1, 0], [1, 1, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, -1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_seq_2': {
    'toolbox': toolbox(3, 2),
    'startBlocks': startBlocks(3, 2),
    'ideal': 7,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [TURN_LEFT]],
    'map': [[1, 1, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 2, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 0, 0, 0, 1]],
    'startDirection': Direction.SOUTH,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_repeat': {
    'toolbox': toolbox(3, 3),
    'startBlocks': startBlocks(3, 3),
    'ideal': 12,
    'requiredBlocks': [[MOVE_FORWARD], [DIG], [TURN_LEFT], [TURN_RIGHT], [REPEAT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1], [1, 0, 1, 2, 1, 1, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1]],
    'startDirection': Direction.SOUTH,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 5, 0, 0, 0], [0, 0, 0, 0, 0, 7, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_while': {
    'toolbox': toolbox(3, 4),
    'startBlocks': startBlocks(3, 4),
    'ideal': 5,
    'requiredBlocks': [[MOVE_FORWARD], [REPEAT], [FILL], [WHILE_OPT_HOLE_PRESENT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, -15, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_if': {
    'toolbox': toolbox(3, 5),
    'startBlocks': startBlocks(3, 5),
    'ideal': 8,
    'requiredBlocks': [[MOVE_FORWARD], [TURN_LEFT], [TURN_RIGHT], [REPEAT], [DIG], [IF_OPT_PILE_PRESENT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 1, 1, 0], [0, 0, 0, 0, 1, 1, 0, 1], [0, 0, 0, 1, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 1, 0, 1], [2, 1, 0, 1, 1, 0, 1, 1]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_if_else': {
    'toolbox': toolbox(3, 6),
    'startBlocks': startBlocks(3, 6),
    'ideal': 10,
    'requiredBlocks': [[MOVE_FORWARD], [TURN_LEFT], [TURN_RIGHT], [REPEAT], [DIG], [FILL], [IF_ELSE, IF_OPT_HOLE_PRESENT]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 1, 1, 0, 1], [0, 0, 0, 1, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 1, 0, 1], [1, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 0, 1, 1, 0], [0, 1, 1, 0, 1, 1, 0, 0], [2, 1, 0, 1, 1, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, -1], [0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, -1, 0, 0, 0], [0, 0, 0, -1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, -1, 0, 0, 0, 0, 0, 0]]
  },

  'debug_function_1': {
    'toolbox': toolbox(3, 7),
    'startBlocks': startBlocks(3, 7),
    'ideal': 8,
    'requiredBlocks': [[MOVE_FORWARD], [TURN_LEFT], [REPEAT], [DIG]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0], [0, 0, 2, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_function_2': {
    'toolbox': toolbox(3, 8),
    'startBlocks': startBlocks(3, 8),
    'ideal': 17,
    'requiredBlocks': [[MOVE_FORWARD], [TURN_LEFT], [REPEAT], [DIG], [FILL], [levelBase.call(msg.fillSquare())], [levelBase.call(msg.removeSquare())]],
    'scale': {
      'stepSpeed': 3
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1], [2, 1, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 0, 0, -1, -1, -1], [1, 0, 1, 0, 0, -1, 0, -1], [1, 1, 1, 0, 0, -1, -1, -1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'debug_function_3': {
    'toolbox': toolbox(3, 9),
    'startBlocks': startBlocks(3, 9),
    'ideal': 12,
    'requiredBlocks': [[MOVE_FORWARD], [REPEAT_EXT], [DIG], [CONTROLS_FOR], [levelBase.callWithArg(msg.removePile(), msg.heightParameter())], [VARIABLES_GET]],
    'scale': {
      'stepSpeed': 2
    },
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [1, 2, 1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 2, 3, 4, 5, 6, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  },

  'bee_1': {
    'toolbox': blockUtils.createToolbox('\
      <block type="maze_moveForward"></block>\
      <block type="maze_turn"><title name="DIR">turnLeft</title></block>\
      <block type="maze_turn"><title name="DIR">turnRight</title></block>\
      <block type="maze_nectar"></block>\
      <block type="maze_honey"></block>\
      <block type="math_number"><title name="NUM">0</title></block>\
      <block type="bee_ifNectarAmount"></block>\
      <block type="bee_ifTotalNectar"></block>\
      <block type="bee_ifFlower"></block>\
      <block type="bee_ifOnlyFlower"></block>\
      <block type="bee_whileNectarAmount"></block>'),
    'startBlocks': startBlocks(1, 1),
    'requiredBlocks': [],
    'scale': {
      'snapRadius': 2.0
    },
    honeyGoal: 1,
    // nectarGoal: 2,
    step: true,
    'map': [[0, 0, 0, 0, 0, 1, 1, 1], [0, 1, 1, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0], [2, 'P', 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0]],
    'startDirection': Direction.EAST,
    'initialDirt': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 3, -1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
  }
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../level_base":"/home/ubuntu/staging/apps/build/js/level_base.js","./karelStartBlocks.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/karelStartBlocks.xml.ejs","./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js","./toolboxes/karel1.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel1.xml.ejs","./toolboxes/karel2.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel2.xml.ejs","./toolboxes/karel3.xml.ejs":"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel3.xml.ejs"}],"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel3.xml.ejs":[function(require,module,exports){
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
 buf.push('');1;

var msg = require('../../locale');

/**
 * Add the procedures category to the toolbox.
 */
var addProcedures = function() {; buf.push('  <category name="', escape((8,  msg.catProcedures() )), '" custom="PROCEDURE"></category>\n  <category name="', escape((9,  msg.catLogic() )), '">\n    <block type="karel_if"></block>\n    <block type="karel_ifElse"></block>\n  </category>\n');13; };; buf.push('\n');14;
/**
 * Options:
 * @param doStatement An optional statement for the do statement in the loop.
 * @param upperLimit The upper limit of the for loop.
 */
var controlsFor = function(doStatement, upperLimit) {; buf.push('  <block type="controls_for">\n    <value name="FROM">\n      <block type="math_number">\n        <title name="NUM">1</title>\n      </block>\n    </value>\n    <value name="TO">\n      <block type="math_number">\n        <title name="NUM">\n          ', escape((29,  upperLimit || 10)), '        </title>\n      </block>\n    </value>\n    <value name="BY">\n      <block type="math_number">\n        <title name="NUM">1</title>\n      </block>\n    </value>\n    ');37; if (doStatement) {; buf.push('      <statement name="DO">\n        ');38; doStatement() ; buf.push('\n      </statement>\n    ');40; }; buf.push('  </block>\n');41; };; buf.push('\n<xml id="toolbox" style="display: none;">\n  <category name="', escape((43,  msg.catActions() )), '">\n    <block type="maze_moveForward"></block>\n    <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n    <block type="maze_turn"><title name="DIR">turnRight</title></block>\n    <block type="maze_dig"></block>\n    <block type="maze_fill"></block>\n  </category>\n  ');50; addProcedures(); buf.push('  <category name="', escape((50,  msg.catLoops() )), '">\n    <block type="maze_untilBlockedOrNotClear"></block>\n    ');52; if (level < 9) {; buf.push('      <block type="controls_repeat"></block>\n    ');53; } else {; buf.push('      <block type="controls_repeat_ext">\n        <value name="TIMES">\n          <block type="math_number">\n            <title name="NUM">10</title>\n          </block>\n        </value>\n      </block>\n    ');60; }; buf.push('    ');60; controlsFor(); buf.push('  </category>\n  <category name="', escape((61,  msg.catMath() )), '">\n    <block type="math_number"></block>\n  </category>\n  <category name="', escape((64,  msg.catVariables() )), '" custom="VARIABLE">\n  </category>\n</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel2.xml.ejs":[function(require,module,exports){
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
 buf.push('');1;

var commonMsg = require('../../locale');
var mazeMsg = require('.././locale');

var addProcedures = function() {; buf.push('  ');6; if (level > 3) {; buf.push('    <category name="', escape((6,  commonMsg.catProcedures() )), '" custom="PROCEDURE"></category>\n  ');7; } else if (level == 2 || level == 3) {; buf.push('    <category name="', escape((7,  commonMsg.catProcedures() )), '">\n      <block type="procedures_callnoreturn">\n        <mutation name="', escape((9,  mazeMsg.fillN({shovelfuls: 5}) )), '"></mutation>\n      </block>\n    </category>\n  ');12; }; buf.push('  ');12; if (level < 9) {; buf.push('    <category name="', escape((12,  commonMsg.catLogic() )), '">\n      <block type="karel_if"></block>\n    </category>\n  ');15; } else if (level > 8) {; buf.push('    <category name="', escape((15,  commonMsg.catLogic() )), '">\n      <block type="karel_if"></block>\n      <block type="karel_ifElse"></block>\n    </category>\n  ');19; }; buf.push('');19; };; buf.push('\n<xml id="toolbox" style="display: none;">\n  <category name="', escape((21,  commonMsg.catActions() )), '">\n    <block type="maze_moveForward"></block>\n    <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n    <block type="maze_turn"><title name="DIR">turnRight</title></block>\n    <block type="maze_dig"></block>\n    <block type="maze_fill"></block>\n  </category>\n  ');28; addProcedures(); buf.push('  <category name="', escape((28,  commonMsg.catLoops() )), '">\n    <block type="maze_untilBlocked"></block>\n    <block type="controls_repeat"></block>\n  </category>\n</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale":"/home/ubuntu/staging/apps/build/js/locale.js",".././locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/toolboxes/karel1.xml.ejs":[function(require,module,exports){
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
 buf.push('<xml id="toolbox" style="display: none;">\n  <block type="maze_moveForward"></block>\n  <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n  <block type="maze_turn"><title name="DIR">turnRight</title></block>\n  <block type="maze_dig"></block>\n  ');6; if (level > 1) {; buf.push('    <block type="maze_fill"></block>\n    ');7; if (level > 2) {; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">5</title>\n      </block>\n      ');10; if (level > 9) {; buf.push('        <block type="karel_if"></block>\n      ');11; }; buf.push('    ');11; }; buf.push('    ');11; if (level == 5 || level == 10 || level == 11) {; buf.push('      <block type="maze_untilBlocked"></block>\n    ');12; }; buf.push('    ');12; if (level > 5 && level < 8) {; buf.push('      <block type="maze_untilBlockedOrNotClear"></block>\n    ');13; }; buf.push('    ');13; if (level == 8 || level == 9) {; buf.push('      <block type="maze_untilBlockedOrNotClear">\n        <title name="DIR">isPathForward</title>\n      </block>\n    ');16; }; buf.push('  ');16; }; buf.push('</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/karelStartBlocks.xml.ejs":[function(require,module,exports){
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
 buf.push('');1;

var msg = require('./locale');

/**
 * Template to create function for filling in shovels.
 */
var fillShovelfuls = function(n) {; buf.push('  <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n    deletable="false">\n    <mutation></mutation>\n    <title name="NAME">', escape((11,  msg.fillN({shovelfuls: n}) )), '</title>\n    <statement name="STACK">\n      <block type="controls_repeat" editable="false" deletable="false">\n        <title name="TIMES">', escape((14,  n )), '</title>\n        <statement name="DO">\n          <block type="maze_fill" editable="false" deletable="false">\n          </block>\n        </statement>\n       </block>\n    </statement>\n  </block>\n');22; };; buf.push('\n');23;
/**
 * Template to create function for removing in shovels.
 */
var removeShovelfuls = function(n) {; buf.push('  <block type="procedures_defnoreturn" x="300" y="200" editable="false"\n    deletable="false">\n    <mutation></mutation>\n    <title name="NAME">', escape((30,  msg.removeN({shovelfuls: n}) )), '</title>\n    <statement name="STACK">\n      <block type="controls_repeat" editable="false" deletable="false">\n        <title name="TIMES">', escape((33,  n )), '</title>\n        <statement name="DO">\n          <block type="maze_dig" editable="false" deletable="false">\n          </block>\n        </statement>\n       </block>\n    </statement>\n  </block>\n');41; }; ; buf.push('\n\n');43; if (page == 1) {; buf.push('  ');43; if (level == 1) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');44; } else if (level == 2) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');45; } else if (level == 3) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');46; } else if (level == 4) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');47; } else if (level == 5) {; buf.push('    <block type="maze_untilBlocked" x="70" y="70"></block>\n  ');48; } else if (level == 6) {; buf.push('    <block type="maze_dig" x="70" y="70"></block>\n  ');49; } else if (level == 7) {; buf.push('    <block type="maze_turn" x="70" y="70">\n          <title name="DIR">turnRight</title>\n    </block>\n  ');52; } else if (level == 8) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');53; } else if (level == 9) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');54; } else if (level == 10) {; buf.push('    <block type="maze_untilBlocked" x="70" y="70"></block>\n  ');55; } else if (level == 11) {; buf.push('    <block type="maze_untilBlocked" x="70" y="70"></block>\n  ');56; }; buf.push('');56; } else if (page == 2) {; buf.push('  ');56; if (level == 2) {; buf.push('    <block type="maze_moveForward" x="20" y="70"></block>\n    ');57; fillShovelfuls(5); buf.push('  ');57; } else if (level == 3) {; buf.push('    ');57; fillShovelfuls(5); buf.push('  ');57; } else if (level == 4) {; buf.push('    ');57; fillShovelfuls(5); buf.push('    <block type="procedures_defnoreturn" x="300" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((60,  msg.removeN({shovelfuls: 7}) )), '</title>\n    </block>\n  ');62; } else if (level == 5) {; buf.push('    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((65,  msg.removeN({shovelfuls: 6}) )), '</title>\n    </block>\n  ');67; } else if (level == 6) {; buf.push('    ');67; fillShovelfuls(8); buf.push('    ');67; removeShovelfuls(8); buf.push('  ');67; } else if (level == 7) {; buf.push('    <block type="procedures_callnoreturn" x="20" y="70" editable="false"\n      deletable="false">\n      <mutation name="', escape((69,  msg.avoidCowAndRemove() )), '"></mutation>\n    </block>\n    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((74,  msg.avoidCowAndRemove() )), '</title>\n    </block>\n  ');76; } else if (level == 8) {; buf.push('    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((79,  msg.avoidCowAndRemove() )), '</title>\n      <statement name="STACK">\n        <block type="maze_turn" editable="false" deletable="false">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="maze_moveForward" editable="false" deletable="false">\n              <next>\n                <block type="maze_turn" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <next>\n                    <block type="maze_moveForward" editable="false"\n                      deletable="false">\n                      <next>\n                        <block type="maze_moveForward" editable="false"\n                          deletable="false">\n                          <next>\n                            <block type="maze_turn" editable="false"\n                              deletable="false">\n                              <title name="DIR">turnRight</title>\n                              <next>\n                                <block type="maze_moveForward"\n                                  editable="false" deletable="false">\n                                  <next>\n                                    <block type="maze_dig"\n                                      editable="false" deletable="false">\n                                      <next>\n                                        <block type="maze_turn"\n                                          editable="false" deletable="false">\n                                          <title name="DIR">turnLeft</title>\n                                        </block>\n                                      </next>\n                                    </block>\n                                  </next>\n                                </block>\n                              </next>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');127; } else if (level == 9) {; buf.push('    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((130,  msg.removeStack({shovelfuls: 4}) )), '</title>\n      <statement name="STACK">\n        <block type="maze_turn" editable="false" deletable="false">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">4</title>\n              <statement name="DO">\n                <block type="maze_dig" editable="false"\n                  deletable="false">\n                  <next>\n                    <block type="maze_moveForward" editable="false"\n                      deletable="false"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <next>\n                    <block type="maze_turn" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="controls_repeat" editable="false"\n                          deletable="false">\n                          <title name="TIMES">4</title>\n                          <statement name="DO">\n                            <block type="maze_moveForward" editable="false"\n                              deletable="false"></block>\n                          </statement>\n                          <next>\n                            <block type="maze_turn" editable="false"\n                              deletable="false">\n                              <title name="DIR">turnLeft</title>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');177; } else if (level == 10) {; buf.push('    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((180,  msg.removeStack({shovelfuls: 4}) )), '</title>\n      <statement name="STACK">\n        <block type="maze_turn" editable="false" deletable="false">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">4</title>\n              <statement name="DO">\n                <block type="maze_dig" editable="false"\n                  deletable="false">\n                  <next>\n                    <block type="maze_moveForward" editable="false"\n                      deletable="false"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <next>\n                    <block type="maze_turn" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="controls_repeat" editable="false"\n                          deletable="false">\n                          <title name="TIMES">4</title>\n                          <statement name="DO">\n                            <block type="maze_moveForward" editable="false"\n                              deletable="false"></block>\n                          </statement>\n                          <next>\n                            <block type="maze_turn" editable="false"\n                              deletable="false">\n                              <title name="DIR">turnLeft</title>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="300" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((230,  msg.fillStack({shovelfuls: 2}) )), '</title>\n      <statement name="STACK">\n        <block type="maze_turn" editable="false" deletable="false">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="controls_repeat" editable="false" deletable="false">\n              <title name="TIMES">2</title>\n              <statement name="DO">\n                <block type="maze_fill" editable="false"\n                  deletable="false">\n                  <next>\n                    <block type="maze_moveForward" editable="false"\n                      deletable="false"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn" editable="false" deletable="false">\n                  <title name="DIR">turnRight</title>\n                  <next>\n                    <block type="maze_turn" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="controls_repeat" editable="false"\n                          deletable="false">\n                          <title name="TIMES">2</title>\n                          <statement name="DO">\n                            <block type="maze_moveForward" editable="false"\n                              deletable="false"></block>\n                          </statement>\n                          <next>\n                            <block type="maze_turn" editable="false"\n                              deletable="false">\n                              <title name="DIR">turnLeft</title>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');277; } else if (level == 11) {; buf.push('    <block type="procedures_defnoreturn" x="20" y="200" editable="false"\n      deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((280,  msg.removeAndAvoidTheCow() )), '</title>\n      <statement name="STACK">\n        <block type="maze_dig" editable="false" deletable="false">\n          <next>\n            <block type="maze_turn" editable="false" deletable="false">\n              <title name="DIR">turnLeft</title>\n              <next>\n                <block type="maze_moveForward" editable="false"\n                  deletable="false">\n                  <next>\n                    <block type="maze_turn" editable="false" deletable="false">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="maze_moveForward" editable="false"\n                          deletable="false">\n                          <next>\n                            <block type="maze_moveForward" editable="false"\n                              deletable="false">\n                              <next>\n                                <block type="maze_turn" editable="false"\n                                  deletable="false">\n                                  <title name="DIR">turnRight</title>\n                                  <next>\n                                    <block type="maze_moveForward"\n                                      editable="false" deletable="false">\n                                      <next>\n                                        <block type="maze_turn"\n                                          editable="false" deletable="false">\n                                          <title name="DIR">turnLeft\n                                          </title>\n                                        </block>\n                                      </next>\n                                    </block>\n                                  </next>\n                                </block>\n                              </next>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');329; }; buf.push('');329; } else if (page == 3) {; buf.push('  ');329; if (level == 1) {; buf.push('    <block type="maze_moveForward" x="70" y="70">\n      <next>\n        <block type="maze_turn">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="maze_moveForward">\n              <next>\n                <block type="maze_dig">\n                  <next>\n                    <block type="maze_turn">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="maze_moveForward">\n                          <next>\n                            <block type="maze_fill"></block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');356; } else if (level == 2) {; buf.push('    <block type="maze_moveForward" x="70" y="70">\n      <next>\n        <block type="maze_moveForward">\n          <next>\n            <block type="maze_moveForward">\n              <next>\n                <block type="maze_moveForward">\n                  <next>\n                    <block type="maze_dig"></block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');373; } else if (level == 3) {; buf.push('    <block type="maze_moveForward" x="70" y="70">\n      <next>\n        <block type="maze_turn">\n          <title name="DIR">turnLeft</title>\n          <next>\n            <block type="maze_moveForward">\n              <next>\n                <block type="controls_repeat">\n                  <title name="TIMES">10</title>\n                  <statement name="DO">\n                    <block type="maze_dig"></block>\n                  </statement>\n                  <next>\n                    <block type="maze_turn">\n                      <title name="DIR">turnRight</title>\n                      <next>\n                        <block type="maze_moveForward">\n                          <next>\n                            <block type="maze_turn">\n                              <title name="DIR">turnLeft</title>\n                              <next>\n                                <block type="maze_moveForward">\n                                  <next>\n                                    <block type="controls_repeat">\n                                      <title name="TIMES">10</title>\n                                      <statement name="DO">\n                                        <block type="maze_dig"></block>\n                                      </statement>\n                                    </block>\n                                  </next>\n                                </block>\n                              </next>\n                            </block>\n                          </next>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n  ');418; } else if (level == 4) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">5</title>\n      <statement name="DO">\n        <block type="maze_moveForward"></block>\n      </statement>\n      <next>\n        <block type="maze_untilBlockedOrNotClear">\n          <title name="DIR">pilePresent</title>\n          <statement name="DO">\n            <block type="maze_fill"></block>\n          </statement>\n        </block>\n      </next>\n    </block>\n  ');432; } else if (level == 5) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">7</title>\n      <statement name="DO">\n        <block type="maze_moveForward">\n          <next>\n            <block type="maze_dig">\n              <next>\n                <block type="maze_turn">\n                  <title name="DIR">turnLeft</title>\n                  <next>\n                    <block type="maze_moveForward">\n                      <next>\n                        <block type="maze_turn">\n                          <title name="DIR">turnRight</title>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');457; } else if (level == 6) {; buf.push('    <block type="controls_repeat" x="70" y="70">\n      <title name="TIMES">7</title>\n      <statement name="DO">\n        <block type="maze_moveForward">\n          <next>\n            <block type="karel_if">\n              <title name="DIR">pilePresent</title>\n              <statement name="DO">\n                <block type="maze_dig"></block>\n              </statement>\n              <next>\n                <block type="maze_turn">\n                  <title name="DIR">turnLeft</title>\n                  <next>\n                    <block type="maze_moveForward">\n                      <next>\n                        <block type="maze_turn">\n                          <title name="DIR">turnRight</title>\n                        </block>\n                      </next>\n                    </block>\n                  </next>\n                </block>\n              </next>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');486; } else if (level == 7) {; buf.push('    <block type="procedures_callnoreturn" x="20" y="70"\n      editable="false" deletable="false">\n      <mutation name="', escape((488,  msg.removeSquare() )), '"></mutation>\n    </block>\n    <block type="procedures_defnoreturn" x="20" y="200" editable="false" deletable="false">\n      <mutation></mutation>\n      <title name="NAME">', escape((492,  msg.removeSquare() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">4</title>\n          <statement name="DO">\n            <block type="controls_repeat">\n              <title name="TIMES">2</title>\n              <statement name="DO">\n                <block type="maze_moveForward">\n                  <next>\n                    <block type="maze_dig"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn">\n                  <title name="DIR">turnLeft</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');516; } else if (level == 8) {; buf.push('    <block type="procedures_callnoreturn" x="20" y="70">\n      <mutation name="', escape((517,  msg.fillSquare() )), '"></mutation>\n      <next>\n        <block type="controls_repeat">\n          <title name="TIMES">5</title>\n          <statement name="DO">\n            <block type="maze_moveForward"></block>\n          </statement>\n          <next>\n            <block type="procedures_callnoreturn">\n              <mutation name="', escape((526,  msg.removeSquare() )), '"></mutation>\n            </block>\n          </next>\n        </block>\n      </next>\n    </block>\n    <block type="procedures_defnoreturn" deletable="false"\n      editable="false" x="20" y="250">\n      <mutation></mutation>\n      <title name="NAME">', escape((535,  msg.removeSquare() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">4</title>\n          <statement name="DO">\n            <block type="controls_repeat">\n              <title name="TIMES">2</title>\n              <statement name="DO">\n                <block type="maze_moveForward">\n                  <next>\n                    <block type="maze_dig"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn">\n                  <title name="DIR">turnLeft</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" deletable="false"\n      editable="false" x="350" y="250">\n      <mutation></mutation>\n      <title name="NAME">', escape((562,  msg.fillSquare() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat">\n          <title name="TIMES">4</title>\n          <statement name="DO">\n            <block type="controls_repeat">\n              <title name="TIMES">2</title>\n              <statement name="DO">\n                <block type="maze_moveForward">\n                  <next>\n                    <block type="maze_fill"></block>\n                  </next>\n                </block>\n              </statement>\n              <next>\n                <block type="maze_turn">\n                  <title name="DIR">turnLeft</title>\n                </block>\n              </next>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');586; } else if (level == 9) {; buf.push('    <block type="controls_for" inline="true" x="20" y="70">\n      <title name="VAR">counter</title>\n      <value name="FROM">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <value name="TO">\n        <block type="math_number">\n          <title name="NUM">6</title>\n        </block>\n      </value>\n      <value name="BY">\n        <block type="math_number">\n          <title name="NUM">1</title>\n        </block>\n      </value>\n      <statement name="DO">\n        <block type="procedures_callnoreturn" inline="false">\n          <mutation name="', escape((605,  msg.removePile() )), '">\n            <arg name="', escape((606,  msg.heightParameter() )), '"></arg>\n          </mutation>\n          <value name="ARG0">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <next>\n            <block type="maze_moveForward"></block>\n          </next>\n        </block>\n      </statement>\n    </block>\n    <block type="procedures_defnoreturn" x="20" y="250" editable="false" deletable="false">\n      <mutation>\n        <arg name="', escape((621,  msg.heightParameter() )), '"></arg>\n      </mutation>\n      <title name="NAME">', escape((623,  msg.removePile() )), '</title>\n      <statement name="STACK">\n        <block type="controls_repeat_ext" inline="true">\n          <value name="TIMES">\n            <block type="math_number">\n              <title name="NUM">1</title>\n            </block>\n          </value>\n          <statement name="DO">\n            <block type="maze_dig"></block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');637; }; buf.push('');637; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/extraControlRows.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('./locale') ; buf.push('\n<div id="spelling-table-wrapper">\n  <table id="spelling-table" class="float-right">\n    <tr>\n      <td class="spellingTextCell">', escape((5,  msg.word() )), ':</td>\n      <td class="spellingButtonCell">\n        <button id="searchWord" class="spellingButton" disabled>\n          ');8; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n          <img src="', escape((9,  assetUrl('media/1x1.gif') )), '"/>', escape((9,  searchWord )), '\n        </button>\n      </td>\n    </tr>\n    <tr>\n      <td class="spellingTextCell">', escape((14,  msg.youSpelled() )), ':</td>\n      <td class="spellingButtonCell">\n        <button id="currentWord" class="spellingButton" disabled>\n          ');17; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n          <img src="', escape((18,  assetUrl('media/1x1.gif') )), '"><span id="currentWordContents"></span>\n        </button>\n      </td>\n    </tr>\n  </table>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/executionInfo.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();

/**
 * Stores information about a current Maze execution.  Execution consists of a
 * series of steps, where each step may contain one or more actions.
 */
var ExecutionInfo = function ExecutionInfo(options) {
  options = options || {};
  this.terminated_ = false;
  this.terminationValue_ = null; // See terminateWithValue method.
  this.steps_ = [];
  this.ticks = options.ticks || Infinity;
  this.collection_ = null;
};

module.exports = ExecutionInfo;

/**
 * Sets termination value to one of the following:
 * - Infinity: Program timed out.
 * - True: Program succeeded (goal was reached).
 * - False: Program failed for unspecified reason.
 * - Any other value: app-specific failure.
 * @param {object} value the termination value
 */
ExecutionInfo.prototype.terminateWithValue = function (value) {
  if (!this.terminated_) {
    this.terminationValue_ = value;
  }
  this.terminated_ = true;
};

ExecutionInfo.prototype.isTerminated = function () {
  return this.terminated_;
};

ExecutionInfo.prototype.terminationValue = function () {
  return this.terminationValue_;
};

ExecutionInfo.prototype.queueAction = function (command, blockId) {
  var action = { command: command, blockId: blockId };
  if (this.collection_) {
    this.collection_.push(action);
  } else {
    // single action step (most common case)
    this.steps_.push([action]);
  }
};

/**
 * Creates a flat list of actions, which get removed from our queue.  If single
 * step is true, the list will contain the actions for one step, otherwise it
 * will be the entire queue.
 */
ExecutionInfo.prototype.getActions = function (singleStep) {
  var actions = [];
  if (singleStep) {
    actions.push(this.steps_.shift());
    // dont leave queue with just a finish in it
    if (onLastStep(this.steps_)) {
      actions.push(this.steps_.splice(0));
    }
  } else {
    actions.push(this.steps_.splice(0));
  }
  // Some steps will contain multiple actions.  For example a K1 North block can
  // consist of a turn and a move. We instead want to return a flat list of
  // all actions, regardless of which step they were in.
  return _.flatten(actions);
};

ExecutionInfo.prototype.stepsRemaining = function () {
  return this.steps_.length > 0;
};

/**
 * If we have no steps left, or our only remaining step is a single finish action
 * we're done executing, and if we're in step mode won't want to wait around
 * for another step press.
 */
function onLastStep(steps) {
  if (steps.length === 0) {
    return true;
  }

  if (steps.length === 1) {
    var step = steps[0];
    if (step.length === 1 && step[0].command === 'finish') {
      return true;
    }
  }
  return false;
}

/**
 * Collect all actions queued up between now and the call to stopCollecting,
 * and put them in a single step
 */
ExecutionInfo.prototype.collectActions = function () {
  if (this.collection_) {
    throw new Error("Already collecting");
  }
  this.collection_ = [];
};

ExecutionInfo.prototype.stopCollecting = function () {
  if (!this.collection_) {
    throw new Error("Not currently collecting");
  }
  this.steps_.push(this.collection_);
  this.collection_ = null;
};

/**
 * If the user has executed too many actions, we're probably in an infinite
 * loop.  Set termination value to Infinity
 */
ExecutionInfo.prototype.checkTimeout = function () {
  if (this.ticks-- < 0) {
    this.terminateWithValue(Infinity);
  }
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/maze/dropletConfig.js":[function(require,module,exports){
'use strict';

var msg = require('./locale');

module.exports.blocks = [{ 'func': 'moveForward', 'category': 'Movement' }, { 'func': 'turnLeft', 'category': 'Movement' }, { 'func': 'turnRight', 'category': 'Movement' }];

module.exports.categories = {
  'Movement': {
    'color': 'red',
    'blocks': []
  }
};

},{"./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js"}],"/home/ubuntu/staging/apps/build/js/maze/controls.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('./locale') ; buf.push('\n\n<button id="stepButton" class="launch ', escape((3,  showStepButton ? '' : 'hide' )), ' float-right">\n  ');4; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n  <img src="', escape((5,  assetUrl('media/1x1.gif') )), '">', escape((5,  msg.step() )), '\n</button>\n\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/maze/blocks.js":[function(require,module,exports){
/**
 * Blockly Demo: Maze
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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

/**
 * @fileoverview Demonstration of Blockly: Solving a maze.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('./locale');
var commonMsg = require('../locale');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');
var mazeUtils = require('./mazeUtils');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  if (mazeUtils.isBeeSkin(skin.id)) {
    require('./beeBlocks').install(blockly, blockInstallOptions);
  }

  var SimpleMove = {
    DIRECTION_CONFIGS: {
      West: { letter: commonMsg.directionWestLetter(), image: skin.leftArrow, tooltip: msg.moveWestTooltip() },
      East: { letter: commonMsg.directionEastLetter(), image: skin.rightArrow, tooltip: msg.moveEastTooltip() },
      North: { letter: commonMsg.directionNorthLetter(), image: skin.upArrow, tooltip: msg.moveNorthTooltip() },
      South: { letter: commonMsg.directionSouthLetter(), image: skin.downArrow, tooltip: msg.moveSouthTooltip() }
    },
    generateBlocksForAllDirections: function generateBlocksForAllDirections() {
      SimpleMove.generateBlocksForDirection("North");
      SimpleMove.generateBlocksForDirection("South");
      SimpleMove.generateBlocksForDirection("West");
      SimpleMove.generateBlocksForDirection("East");
    },
    generateBlocksForDirection: function generateBlocksForDirection(direction) {
      generator["maze_move" + direction] = SimpleMove.generateCodeGenerator(direction);
      blockly.Blocks['maze_move' + direction] = SimpleMove.generateMoveBlock(direction);
    },
    generateMoveBlock: function generateMoveBlock(direction) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      return {
        helpUrl: '',
        init: function init() {
          this.setHSV(184, 1.00, 0.74);
          this.appendDummyInput().appendTitle(new blockly.FieldLabel(directionConfig.letter, { fixedSize: { width: 12, height: 18 } })).appendTitle(new blockly.FieldImage(directionConfig.image));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    },
    generateCodeGenerator: function generateCodeGenerator(direction) {
      return function () {
        return 'Maze.move' + direction + '(\'block_id_' + this.id + '\');\n';
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  // Block for moving forward.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_moveForward',
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    title: msg.moveForward(),
    tooltip: msg.moveForwardTooltip(),
    functionName: 'Maze.moveForward'
  });

  // Block for putting dirt on to a tile.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_fill',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PutDown',
    title: msg.fill(),
    tooltip: msg.fillTooltip(),
    functionName: 'Maze.fill'
  });

  // Block for putting for removing dirt from a tile.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_dig',
    helpUrl: 'http://code.google.com/p/blockly/wiki/PickUp',
    title: msg.dig(),
    tooltip: msg.digTooltip(),
    functionName: 'Maze.dig'
  });

  blockly.Blocks.maze_move = {
    // Block for moving forward/backward
    helpUrl: 'http://code.google.com/p/blockly/wiki/Move',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.maze_move.DIRECTIONS = [[msg.moveForward(), 'moveForward'], [msg.moveBackward(), 'moveBackward']];

  generator.maze_move = function () {
    // Generate JavaScript for moving forward/backward
    var dir = this.getTitleValue('DIR');
    return 'Maze.' + dir + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.maze_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.maze_turn.DIRECTIONS = [[msg.turnLeft() + ' ↺', 'turnLeft'], [msg.turnRight() + ' ↻', 'turnRight']];

  generator.maze_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    return 'Maze.' + dir + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.maze_isPath = {
    // Block for checking if there a path.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.setOutput(true, blockly.BlockValueType.NUMBER);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setTooltip(msg.isPathTooltip());
    }
  };

  blockly.Blocks.maze_isPath.DIRECTIONS = [[msg.ifPathAhead(), 'isPathForward'], [msg.pathLeft() + ' ↺', 'isPathLeft'], [msg.pathRight() + ' ↻', 'isPathRight']];

  generator.maze_isPath = function () {
    // Generate JavaScript for checking if there is a path.
    var code = 'Maze.' + this.getTitleValue('DIR') + '()';
    return [code, generator.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.maze_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.maze_if.DIRECTIONS = blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_if = function () {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.maze_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.maze_ifElse.DIRECTIONS = blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_ifElse = function () {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.karel_if = function () {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.karel_if.DIRECTIONS = [[msg.pilePresent(), 'pilePresent'], [msg.holePresent(), 'holePresent'], [msg.pathAhead(), 'isPathForward']
  //     [msg.noPathAhead(), 'noPathForward']
  ];

  blockly.Blocks.karel_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.karel_ifElse = function () {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_ifElse.DIRECTIONS = blockly.Blocks.karel_if.DIRECTIONS;

  blockly.Blocks.maze_whileNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function init() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_whileNotClear = function () {
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_whileNotClear.DIRECTIONS = [[msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'], [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent']];

  blockly.Blocks.maze_untilBlocked = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function init() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle(msg.repeatUntilBlocked());
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_untilBlocked = function () {
    var argument = 'Maze.isPathForward' + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_forever = {
    // Do forever loop.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function init() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle(msg.repeatUntil()).appendTitle(new blockly.FieldImage(skin.maze_forever, 35, 35));
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_forever = function () {
    // Generate JavaScript for do forever loop.
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + codegen.loopHighlight('Maze', this.id) + branch;
    return 'while (Maze.notFinished()) {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function init() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_untilBlockedOrNotClear = function () {
    var argument = 'Maze.' + this.getTitleValue('DIR') + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear.DIRECTIONS = [[msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'], [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent'], [msg.repeatUntilBlocked(), 'isPathForward']];

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./beeBlocks":"/home/ubuntu/staging/apps/build/js/maze/beeBlocks.js","./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js"}],"/home/ubuntu/staging/apps/build/js/maze/beeItemDrawer.js":[function(require,module,exports){
/*jshint -W086 */

'use strict';

var DirtDrawer = require('./dirtDrawer');
require('../utils');

var cellId = require('./mazeUtils').cellId;

var SVG_NS = require('../constants').SVG_NS;
var SQUARE_SIZE = 50;

/**
 * Inherits DirtDrawer to draw flowers/honeycomb for bee.
 * @param dirtMap The dirtMap from the maze, which shows the current state of
 *   the dirt (or flowers/honey in this case).
 * @param skin The app's skin, used to get URLs for our images
 * @param bee The maze's Bee object.
 */
function BeeItemDrawer(dirtMap, skin, bee) {
  this.__base = BeeItemDrawer.superPrototype;

  DirtDrawer.call(this, dirtMap, '');

  this.skin_ = skin;
  this.bee_ = bee;

  this.honeyImages_ = [];
  this.nectarImages_ = [];
  this.svg_ = null;
  this.pegman_ = null;

  // is item currently covered by a cloud?
  this.clouded_ = undefined;
  this.resetClouded();
}

BeeItemDrawer.inherits(DirtDrawer);
module.exports = BeeItemDrawer;

/**
 * Resets our tracking of clouded/revealed squares. Used on
 * initialization and also to reset the drawer between randomized
 * conditionals runs.
 */
BeeItemDrawer.prototype.resetClouded = function () {
  this.clouded_ = this.bee_.currentStaticGrid.map(function (row) {
    return [];
  });
};

/**
 * Override DirtDrawer's updateItemImage.
 * @param {number} row
 * @param {number} col
 * @param {boolean} running Is user code currently running
 */
BeeItemDrawer.prototype.updateItemImage = function (row, col, running) {
  var baseImage = {
    href: null,
    unclippedWidth: SQUARE_SIZE
  };

  if (this.bee_.isHive(row, col, false)) {
    baseImage.href = this.skin_.honey;
  } else if (this.bee_.isFlower(row, col, false)) {
    baseImage.href = this.flowerImageHref_(row, col);
  }

  var isCloudable = this.bee_.isCloudable(row, col);
  var isClouded = !running && isCloudable;
  var wasClouded = isCloudable && this.clouded_[row][col] === true;

  var counterText;
  var ABS_VALUE_UNLIMITED = 99; // Repesents unlimited nectar/honey.
  var ABS_VALUE_ZERO = 98; // Represents zero nectar/honey.
  var absVal = Math.abs(this.bee_.getValue(row, col));
  if (isClouded) {
    counterText = "";
  } else if (!running && baseImage.href === this.skin_.purpleFlower) {
    // Initially, hide counter values of purple flowers.
    counterText = "?";
  } else if (absVal === ABS_VALUE_UNLIMITED) {
    counterText = "";
  } else if (absVal === ABS_VALUE_ZERO) {
    counterText = "0";
  } else {
    counterText = "" + absVal;
  }

  // Display the images.
  if (baseImage.href) {
    this.updateImageWithIndex_('beeItem', row, col, baseImage, 0);
    this.updateCounter_('counter', row, col, counterText);
  } else {
    this.updateImageWithIndex_('beeItem', row, col, baseImage, -1);
    this.updateCounter_('counter', row, col, "");
  }

  if (isClouded) {
    this.showCloud_(row, col);
    this.clouded_[row][col] = true;
  } else if (wasClouded) {
    this.hideCloud_(row, col);
    this.clouded_[row][col] = false;
  }
};

/**
 * Update the counter at the given row,col with the provided counterText.
 */
BeeItemDrawer.prototype.updateCounter_ = function (prefix, row, col, counterText) {
  var counterElement = document.getElementById(cellId(prefix, row, col));
  if (!counterElement) {
    // we want an element, so let's create one
    counterElement = createText(prefix, row, col, counterText);
  }
  counterElement.firstChild.nodeValue = counterText;
};

function createText(prefix, row, col, counterText) {
  var pegmanElement = document.getElementsByClassName('pegman-location')[0];
  var svg = document.getElementById('svgMaze');

  // Create text.
  var hPadding = 2;
  var vPadding = 2;
  var text = document.createElementNS(SVG_NS, 'text');
  // Position text just inside the bottom right corner.
  text.setAttribute('x', (col + 1) * SQUARE_SIZE - hPadding);
  text.setAttribute('y', (row + 1) * SQUARE_SIZE - vPadding);
  text.setAttribute('id', cellId(prefix, row, col));
  text.setAttribute('class', 'bee-counter-text');
  text.appendChild(document.createTextNode(counterText));
  svg.insertBefore(text, pegmanElement);

  return text;
}

BeeItemDrawer.prototype.createCounterImage_ = function (prefix, i, row, href) {
  var id = prefix + (i + 1);
  var image = document.createElementNS(SVG_NS, 'image');
  image.setAttribute('id', id);
  image.setAttribute('width', SQUARE_SIZE);
  image.setAttribute('height', SQUARE_SIZE);
  image.setAttribute('y', row * SQUARE_SIZE);

  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);

  this.getSvg_().insertBefore(image, this.getPegmanElement_());

  return image;
};

BeeItemDrawer.prototype.flowerImageHref_ = function (row, col) {
  return this.bee_.isRedFlower(row, col) ? this.skin_.redFlower : this.skin_.purpleFlower;
};

BeeItemDrawer.prototype.updateHoneyCounter = function (honeyCount) {
  for (var i = 0; i < honeyCount; i++) {
    if (!this.honeyImages_[i]) {
      this.honeyImages_[i] = this.createCounterImage_('honey', i, 1, this.skin_.honey);
    }

    var deltaX = SQUARE_SIZE;
    if (honeyCount > 8) {
      deltaX = (8 - 1) * SQUARE_SIZE / (honeyCount - 1);
    }
    this.honeyImages_[i].setAttribute('x', i * deltaX);
  }

  for (i = 0; i < this.honeyImages_.length; i++) {
    this.honeyImages_[i].setAttribute('display', i < honeyCount ? 'block' : 'none');
  }
};

BeeItemDrawer.prototype.updateNectarCounter = function (nectars) {
  var nectarCount = nectars.length;
  // create any needed images
  for (var i = 0; i < nectarCount; i++) {
    var href = this.flowerImageHref_(nectars[i].row, nectars[i].col);

    if (!this.nectarImages_[i]) {
      this.nectarImages_[i] = this.createCounterImage_('nectar', i, 0, href);
    }

    var deltaX = SQUARE_SIZE;
    if (nectarCount > 8) {
      deltaX = (8 - 1) * SQUARE_SIZE / (nectarCount - 1);
    }
    this.nectarImages_[i].setAttribute('x', i * deltaX);
    this.nectarImages_[i].setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
  }

  for (i = 0; i < this.nectarImages_.length; i++) {
    this.nectarImages_[i].setAttribute('display', i < nectarCount ? 'block' : 'none');
  }
};

/**
 * Cache svg element
 */
BeeItemDrawer.prototype.getSvg_ = function () {
  if (!this.svg_) {
    this.svg_ = document.getElementById('svgMaze');
  }
  return this.svg_;
};

/**
 * Cache pegman element
 */
BeeItemDrawer.prototype.getPegmanElement_ = function () {
  if (!this.pegman_) {
    this.pegman_ = document.getElementsByClassName('pegman-location')[0];
  }
  return this.pegman_;
};

/**
 * Show the cloud icon.
 */
BeeItemDrawer.prototype.showCloud_ = function (row, col) {
  var cloudImageInfo = {
    href: this.skin_.cloud,
    unclippedWidth: 50
  };
  this.updateImageWithIndex_('cloud', row, col, cloudImageInfo, 0);

  // Make sure the animation is cached by the browser.
  this.displayCloudAnimation_(row, col, false /* animate */);
};

/**
 * Hide the cloud icon, and display the cloud hiding animation.
 */
BeeItemDrawer.prototype.hideCloud_ = function (row, col) {
  var cloudElement = document.getElementById(cellId('cloud', row, col));
  if (cloudElement) {
    cloudElement.setAttribute('visibility', 'hidden');
  }

  this.displayCloudAnimation_(row, col, true /* animate */);
};

/**
 * Create the cloud animation element, and perform the animation if necessary
 */
BeeItemDrawer.prototype.displayCloudAnimation_ = function (row, col, animate) {
  var id = cellId('cloudAnimation', row, col);

  var cloudAnimation = document.getElementById(id);

  if (!cloudAnimation) {
    var pegmanElement = document.getElementsByClassName('pegman-location')[0];
    var svg = document.getElementById('svgMaze');
    cloudAnimation = document.createElementNS(SVG_NS, 'image');
    cloudAnimation.setAttribute('id', id);
    cloudAnimation.setAttribute('height', SQUARE_SIZE);
    cloudAnimation.setAttribute('width', SQUARE_SIZE);
    cloudAnimation.setAttribute('x', col * SQUARE_SIZE);
    cloudAnimation.setAttribute('y', row * SQUARE_SIZE);
    cloudAnimation.setAttribute('visibility', 'hidden');
    svg.appendChild(cloudAnimation, pegmanElement);
  }

  // We want to create the element event if we're not animating yet so that we
  // can make sure it gets loaded.
  cloudAnimation.setAttribute('visibility', animate ? 'visible' : 'hidden');
  cloudAnimation.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.skin_.cloudAnimation);
};

/**
 * Draw our checkerboard tile, making path tiles lighter. For non-path tiles, we
 * want to be sure that the checkerboard square is below the tile element (i.e.
 * the trees).
 */
BeeItemDrawer.prototype.addCheckerboardTile = function (row, col, isPath) {
  var svg = document.getElementById('svgMaze');
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('width', SQUARE_SIZE);
  rect.setAttribute('height', SQUARE_SIZE);
  rect.setAttribute('x', col * SQUARE_SIZE);
  rect.setAttribute('y', row * SQUARE_SIZE);
  rect.setAttribute('fill', '#78bb29');
  rect.setAttribute('opacity', isPath ? 0.2 : 0.5);
  if (isPath) {
    svg.appendChild(rect);
  } else {
    var tile = document.getElementById('tileElement' + (row * 8 + col));
    svg.insertBefore(rect, tile);
  }
};

},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./dirtDrawer":"/home/ubuntu/staging/apps/build/js/maze/dirtDrawer.js","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js"}],"/home/ubuntu/staging/apps/build/js/maze/dirtDrawer.js":[function(require,module,exports){
'use strict';

var cellId = require('./mazeUtils').cellId;

// The number line is [-inf, min, min+1, ... no zero ..., max-1, max, +inf]
var DIRT_MAX = 10;
var DIRT_COUNT = DIRT_MAX * 2 + 2;

// Duplicated from maze.js so that I don't need a dependency
var SQUARE_SIZE = 50;

var SVG_NS = require('../constants').SVG_NS;

var DirtDrawer = module.exports = function (dirtMap, dirtAsset) {
  this.dirtMap_ = dirtMap;

  this.dirtImageInfo_ = {
    href: dirtAsset,
    unclippedWidth: SQUARE_SIZE * DIRT_COUNT
  };
};

/**
 * Update the image at the given row,col by determining the spriteIndex for the
 * current value
 */
DirtDrawer.prototype.updateItemImage = function (row, col, running) {
  var val = this.dirtMap_[row][col];
  this.updateImageWithIndex_('dirt', row, col, this.dirtImageInfo_, spriteIndexForDirt(val));
};

/**
 * Update the image at the given row,col with the provided spriteIndex.
 */
DirtDrawer.prototype.updateImageWithIndex_ = function (prefix, row, col, imageInfo, spriteIndex) {
  var hiddenImage = spriteIndex < 0 || imageInfo.href === null;

  var img = document.getElementById(cellId(prefix, row, col));
  if (!img) {
    // we don't need any image
    if (hiddenImage) {
      return;
    }
    // we want an image, so let's create one
    img = createImage(prefix, row, col, imageInfo);
  } else if (imageInfo.href) {
    //update img
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageInfo.href);
  }

  img.setAttribute('visibility', hiddenImage ? 'hidden' : 'visible');
  if (!hiddenImage) {
    img.setAttribute('x', SQUARE_SIZE * (col - spriteIndex));
    img.setAttribute('y', SQUARE_SIZE * row);
  }
};

function createImage(prefix, row, col, imageInfo) {
  var pegmanElement = document.getElementsByClassName('pegman-location')[0];
  var svg = document.getElementById('svgMaze');

  var clipId = cellId(prefix + 'Clip', row, col);
  var imgId = cellId(prefix, row, col);

  // Create clip path.
  var clip = document.createElementNS(SVG_NS, 'clipPath');
  clip.setAttribute('id', clipId);
  var rect = document.createElementNS(SVG_NS, 'rect');
  rect.setAttribute('x', col * SQUARE_SIZE);
  rect.setAttribute('y', row * SQUARE_SIZE);
  rect.setAttribute('width', SQUARE_SIZE);
  rect.setAttribute('height', SQUARE_SIZE);
  clip.appendChild(rect);
  svg.insertBefore(clip, pegmanElement);
  // Create image.
  var img = document.createElementNS(SVG_NS, 'image');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageInfo.href);
  img.setAttribute('height', SQUARE_SIZE);
  img.setAttribute('width', imageInfo.unclippedWidth);
  img.setAttribute('clip-path', 'url(#' + clipId + ')');
  img.setAttribute('id', imgId);
  svg.insertBefore(img, pegmanElement);

  return img;
}

/**
 * Given a dirt value, returns the index of the sprite to use in our spritesheet.
 * Returns -1 if we want to display no sprite.
 */
function spriteIndexForDirt(val) {
  var spriteIndex;

  if (val === 0) {
    spriteIndex = -1;
  } else if (val < -DIRT_MAX) {
    spriteIndex = 0;
  } else if (val < 0) {
    spriteIndex = DIRT_MAX + val + 1;
  } else if (val > DIRT_MAX) {
    spriteIndex = DIRT_COUNT - 1;
  } else if (val > 0) {
    spriteIndex = DIRT_MAX + val;
  }

  return spriteIndex;
}

/* start-test-block */
// export private function(s) to expose to unit testing
DirtDrawer.__testonly__ = {
  spriteIndexForDirt: spriteIndexForDirt,
  createImage: createImage
};
/* end-test-block */

},{"../constants":"/home/ubuntu/staging/apps/build/js/constants.js","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js"}],"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js":[function(require,module,exports){
/**
 * Generalized function for generating ids for cells in a table
 */
'use strict';

exports.cellId = function (prefix, row, col) {
  return prefix + '_' + row + '_' + col;
};

/**
 * Is skin either bee or bee_night
 */
exports.isBeeSkin = function (skinId) {
  return (/bee(_night)?/.test(skinId)
  );
};

/**
 * Is skin scrat
 */
exports.isScratSkin = function (skinId) {
  return (/scrat/.test(skinId)
  );
};

},{}],"/home/ubuntu/staging/apps/build/js/maze/beeBlocks.js":[function(require,module,exports){
/**
 * Blocks specific to Bee
 */

'use strict';

var msg = require('./locale');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');

var OPERATORS = [['=', '=='], ['<', '<'], ['>', '>']];

var TOOLTIPS = {
  '==': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
  '<': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
  '>': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  addIfOnlyFlower(blockly, generator);
  addIfFlowerHive(blockly, generator);
  addIfElseFlowerHive(blockly, generator);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifNectarAmount', 'if', [[msg.nectarRemaining(), 'nectarRemaining'], [msg.honeyAvailable(), 'honeyAvailable']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifelseNectarAmount', 'ifelse', [[msg.nectarRemaining(), 'nectarRemaining'], [msg.honeyAvailable(), 'honeyAvailable']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifTotalNectar', 'if', [[msg.totalNectar(), 'nectarCollected'], [msg.totalHoney(), 'honeyCreated']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifelseTotalNectar', 'ifelse', [[msg.totalNectar(), 'nectarCollected'], [msg.totalHoney(), 'honeyCreated']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_whileNectarAmount', 'while', [[msg.nectarRemaining(), 'nectarRemaining'], [msg.honeyAvailable(), 'honeyAvailable']]);

  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_nectar',
    helpUrl: '',
    title: isK1 ? msg.get() : msg.nectar(),
    titleImage: isK1 ? skin.redFlower : undefined,
    tooltip: msg.nectarTooltip(),
    functionName: 'Maze.getNectar'
  });

  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_honey',
    helpUrl: '',
    title: isK1 ? msg.make() : msg.honey(),
    titleImage: isK1 ? skin.honey : undefined,
    tooltip: msg.honeyTooltip(),
    functionName: 'Maze.makeHoney'
  });
};

/**
 * Are we at a flower
 */
function addIfOnlyFlower(blockly, generator) {
  blockly.Blocks.bee_ifOnlyFlower = {
    helpUrl: '',
    init: function init() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(msg.atFlower());
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifOnlyFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLE:
  // if (Maze.atFlower()) { code }
  generator.bee_ifOnlyFlower = function () {
    // Generate JavaScript for 'if' conditional if we're at a flower
    var argument = 'Maze.atFlower' + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };
}

/**
 * Are we at a flower or a hive
 */
function addIfFlowerHive(blockly, generator) {
  blockly.Blocks.bee_ifFlower = {
    helpUrl: '',
    init: function init() {
      var LOCATIONS = [[msg.atFlower(), 'atFlower'], [msg.atHoneycomb(), 'atHoneycomb']];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(LOCATIONS), 'LOC');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code }
  // if (Maze.atHoneycomb()) { code }
  generator.bee_ifFlower = function () {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument = 'Maze.' + this.getTitleValue('LOC') + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };
}

/**
 * Are we at a flower or a hive with else
 */
function addIfElseFlowerHive(blockly, generator) {
  blockly.Blocks.bee_ifElseFlower = {
    helpUrl: '',
    init: function init() {
      var LOCATIONS = [[msg.atFlower(), 'atFlower'], [msg.atHoneycomb(), 'atHoneycomb']];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(LOCATIONS), 'LOC');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code } else { morecode }
  // if (Maze.atHoneycomb()) { code } else { morecode }
  generator.bee_ifElseFlower = function () {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument = 'Maze.' + this.getTitleValue('LOC') + '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };
}

function addConditionalComparisonBlock(blockly, generator, name, type, arg1) {
  blockly.Blocks[name] = {
    helpUrl: '',
    init: function init() {
      var self = this;

      var conditionalMsg;
      switch (type) {
        case 'if':
          conditionalMsg = msg.ifCode();
          this.setHSV(196, 1.0, 0.79);
          break;
        case 'ifelse':
          conditionalMsg = msg.ifCode();
          this.setHSV(196, 1.0, 0.79);
          break;
        case 'while':
          conditionalMsg = msg.whileMsg();
          this.setHSV(322, 0.90, 0.95);
          break;
        default:
          throw 'Unexpcted type for addConditionalComparisonBlock';
      }

      this.appendDummyInput().appendTitle(conditionalMsg);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(arg1), 'ARG1');
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(OPERATORS), 'OP');
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput().appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'ARG2');
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      if (type === "ifelse") {
        this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);

      this.setTooltip(function () {
        var op = self.getTitleValue('OP');
        return TOOLTIPS[op];
      });
    }
  };

  // if (Maze.nectarCollected() > 0) { code }
  // if (Maze.honeyCreated() == 1) { code }
  generator[name] = function () {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument1 = 'Maze.' + this.getTitleValue('ARG1') + '(\'block_id_' + this.id + '\')';
    var operator = this.getTitleValue('OP');
    var order = operator === '==' || operator === '!=' ? Blockly.JavaScript.ORDER_EQUALITY : Blockly.JavaScript.ORDER_RELATIONAL;
    var argument2 = this.getTitleValue('ARG2');
    var branch0 = generator.statementToCode(this, 'DO');
    var elseBlock = "";
    if (type === "ifelse") {
      var branch1 = generator.statementToCode(this, 'ELSE');
      elseBlock = ' else {\n' + branch1 + '}';
    }

    var command = type;
    if (type === "ifelse") {
      command = "if";
    }

    return command + ' (' + argument1 + ' ' + operator + ' ' + argument2 + ') {\n' + branch0 + '}' + elseBlock + '\n';
  };
}

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js"}],"/home/ubuntu/staging/apps/build/js/maze/api.js":[function(require,module,exports){
'use strict';

var tiles = require('./tiles');
var Direction = tiles.Direction;
var MoveDirection = tiles.MoveDirection;
var TurnDirection = tiles.TurnDirection;
var SquareType = tiles.SquareType;
var utils = require('../utils');
var Bee = require('./bee');

/**
 * Only call API functions if we haven't yet terminated execution
 */
var API_FUNCTION = function API_FUNCTION(fn) {
  return utils.executeIfConditional(function () {
    return !Maze.executionInfo.isTerminated();
  }, fn);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Maze.move().
 * @return {boolean} True if there is a path.
 */
var isPath = function isPath(direction, id) {
  var effectiveDirection = Maze.pegmanD + direction;
  var square;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = Maze.map[Maze.pegmanY - 1] && Maze.map[Maze.pegmanY - 1][Maze.pegmanX];
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.map[Maze.pegmanY][Maze.pegmanX + 1];
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.map[Maze.pegmanY + 1] && Maze.map[Maze.pegmanY + 1][Maze.pegmanX];
      command = 'look_south';
      break;
    case Direction.WEST:
      square = Maze.map[Maze.pegmanY][Maze.pegmanX - 1];
      command = 'look_west';
      break;
  }
  if (id) {
    Maze.executionInfo.queueAction(command, id);
  }
  return square !== SquareType.WALL && square !== SquareType.OBSTACLE && square !== undefined;
};

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
var move = function move(direction, id) {
  if (!isPath(direction, null)) {
    Maze.executionInfo.queueAction('fail_' + (direction ? 'backward' : 'forward'), id);
    Maze.executionInfo.terminateWithValue(false);
    return;
  }
  // If moving backward, flip the effective direction.
  var effectiveDirection = Maze.pegmanD + direction;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      Maze.pegmanY--;
      command = 'north';
      break;
    case Direction.EAST:
      Maze.pegmanX++;
      command = 'east';
      break;
    case Direction.SOUTH:
      Maze.pegmanY++;
      command = 'south';
      break;
    case Direction.WEST:
      Maze.pegmanX--;
      command = 'west';
      break;
  }
  Maze.executionInfo.queueAction(command, id);
  if (Maze.wordSearch) {
    Maze.wordSearch.markTileVisited(Maze.pegmanY, Maze.pegmanX, false);
    // wordsearch doesnt check for success until it has finished running completely
    return;
  }
  Maze.checkSuccess();
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
var turn = function turn(direction, id) {
  if (direction == TurnDirection.RIGHT) {
    // Right turn (clockwise).
    Maze.pegmanD += TurnDirection.RIGHT;
    Maze.executionInfo.queueAction('right', id);
  } else {
    // Left turn (counterclockwise).
    Maze.pegmanD += TurnDirection.LEFT;
    Maze.executionInfo.queueAction('left', id);
  }
  Maze.pegmanD = tiles.constrainDirection4(Maze.pegmanD);
};

/**
 * Turn pegman towards a given direction, turning through stage front (south)
 * when possible.
 * @param {number} newDirection Direction to turn to (e.g., Direction.NORTH)
 * @param {string} id ID of block that triggered this action.
 */
var turnTo = function turnTo(newDirection, id) {
  var currentDirection = Maze.pegmanD;
  if (isTurnAround(currentDirection, newDirection)) {
    var shouldTurnCWToPreferStageFront = currentDirection - newDirection < 0;
    var relativeTurnDirection = shouldTurnCWToPreferStageFront ? TurnDirection.RIGHT : TurnDirection.LEFT;
    turn(relativeTurnDirection, id);
    turn(relativeTurnDirection, id);
  } else if (isRightTurn(currentDirection, newDirection)) {
    turn(TurnDirection.RIGHT, id);
  } else if (isLeftTurn(currentDirection, newDirection)) {
    turn(TurnDirection.LEFT, id);
  }
};

function isLeftTurn(direction, newDirection) {
  return newDirection === tiles.constrainDirection4(direction + TurnDirection.LEFT);
}

function isRightTurn(direction, newDirection) {
  return newDirection === tiles.constrainDirection4(direction + TurnDirection.RIGHT);
}

/**
 * Returns whether turning from direction to newDirection would be a 180° turn
 * @param {number} direction
 * @param {number} newDirection
 * @returns {boolean}
 */
function isTurnAround(direction, newDirection) {
  return Math.abs(direction - newDirection) == MoveDirection.BACKWARD;
}

function moveAbsoluteDirection(direction, id) {
  Maze.executionInfo.collectActions();
  turnTo(direction, id);
  move(MoveDirection.FORWARD, id);
  Maze.executionInfo.stopCollecting();
}

exports.moveForward = API_FUNCTION(function (id) {
  move(MoveDirection.FORWARD, id);
});

exports.moveBackward = API_FUNCTION(function (id) {
  move(MoveDirection.BACKWARD, id);
});

exports.moveNorth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.NORTH, id);
});

exports.moveSouth = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.SOUTH, id);
});

exports.moveEast = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.EAST, id);
});

exports.moveWest = API_FUNCTION(function (id) {
  moveAbsoluteDirection(Direction.WEST, id);
});

exports.turnLeft = API_FUNCTION(function (id) {
  turn(TurnDirection.LEFT, id);
});

exports.turnRight = API_FUNCTION(function (id) {
  turn(TurnDirection.RIGHT, id);
});

exports.isPathForward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.FORWARD, id);
});
exports.noPathForward = API_FUNCTION(function (id) {
  return !isPath(MoveDirection.FORWARD, id);
});

exports.isPathRight = API_FUNCTION(function (id) {
  return isPath(MoveDirection.RIGHT, id);
});

exports.isPathBackward = API_FUNCTION(function (id) {
  return isPath(MoveDirection.BACKWARD, id);
});

exports.isPathLeft = API_FUNCTION(function (id) {
  return isPath(MoveDirection.LEFT, id);
});

exports.pilePresent = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] > 0;
});

exports.holePresent = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] < 0;
});

exports.currentPositionNotClear = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] !== 0;
});

exports.fill = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] + 1;
});

exports.dig = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] - 1;
});

exports.notFinished = API_FUNCTION(function () {
  return !Maze.checkSuccess();
});

// The code for this API should get stripped when showing code
exports.loopHighlight = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('null', id);
});

/**
 * Bee related API functions. If better modularized, we could potentially
 * separate these out, but as things stand right now they will be loaded
 * whether or not we're a Bee level
 */
exports.getNectar = API_FUNCTION(function (id) {
  Maze.bee.getNectar(id);
});

exports.makeHoney = API_FUNCTION(function (id) {
  Maze.bee.makeHoney(id);
});

exports.atFlower = API_FUNCTION(function (id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_flower", id);
  return Maze.bee.isFlower(row, col, true);
});

exports.atHoneycomb = API_FUNCTION(function (id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_honeycomb", id);
  return Maze.bee.isHive(row, col, true);
});

exports.nectarRemaining = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("nectar_remaining", id);
  return Maze.bee.nectarRemaining(true);
});

exports.honeyAvailable = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("honey_available", id);
  return Maze.bee.honeyAvailable();
});

exports.nectarCollected = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("nectar_collected", id);
  return Maze.bee.nectars_.length;
});

exports.honeyCreated = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction("honey_created", id);
  return Maze.bee.honey_;
});

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./bee":"/home/ubuntu/staging/apps/build/js/maze/bee.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/tiles.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');

var Tiles = module.exports;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Tiles.Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

/**
 * The types of squares in the Maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Tiles.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3,
  OBSTACLE: 4,
  STARTANDFINISH: 5
};

Tiles.TurnDirection = { LEFT: -1, RIGHT: 1 };
Tiles.MoveDirection = { FORWARD: 0, RIGHT: 1, BACKWARD: 2, LEFT: 3 };

Tiles.directionToDxDy = function (direction) {
  switch (direction) {
    case Tiles.Direction.NORTH:
      return { dx: 0, dy: -1 };
    case Tiles.Direction.EAST:
      return { dx: 1, dy: 0 };
    case Tiles.Direction.SOUTH:
      return { dx: 0, dy: 1 };
    case Tiles.Direction.WEST:
      return { dx: -1, dy: 0 };
  }
  throw new Error('Invalid direction value' + direction);
};

Tiles.directionToFrame = function (direction4) {
  return utils.mod(direction4 * 4, 16);
};

/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Tiles.constrainDirection4 = function (d) {
  return utils.mod(d, 4);
};

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}],"/home/ubuntu/staging/apps/build/js/maze/bee.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');
var mazeMsg = require('./locale');
var Cell = require('./beeCell');
var TestResults = require('../constants.js').TestResults;
var TerminationValue = require('../constants.js').BeeTerminationValue;

var UNLIMITED_HONEY = -99;
var UNLIMITED_NECTAR = 99;

var EMPTY_HONEY = -98; // Hive with 0 honey
var EMPTY_NECTAR = 98; // flower with 0 honey

var Bee = function Bee(maze, studioApp, config) {
  this.maze_ = maze;
  this.studioApp_ = studioApp;
  this.skin_ = config.skin;
  this.defaultFlowerColor_ = config.level.flowerType === 'redWithNectar' ? 'red' : 'purple';
  if (this.defaultFlowerColor_ === 'purple' && config.level.flowerType !== 'purpleNectarHidden') {
    throw new Error('bad flowerType for Bee: ' + config.level.flowerType);
  }

  this.nectarGoal_ = config.level.nectarGoal || 0;
  this.honeyGoal_ = config.level.honeyGoal || 0;

  // at each location, tracks whether user checked to see if it was a flower or
  // honeycomb using an if block
  this.userChecks_ = [];

  // The "raw dirt" represents the raw values as entered into the
  // levelbuilder UI. They are a grid of either integers or strings,
  // and can represent "variable" values, which means any given cell can
  // theoretically contain one of a variety of objects.
  //
  // We parse the strings into objects, then turn the "variable" grid
  // into a list of "static" grids, representing all the possible
  // combinations of objects.
  //
  // We also initialize a "values" grid, which for objects that have
  // values (hives and flowers) keeps track of their current state.
  var rawDirt_ = config.level.rawDirt;
  var variableGrid = rawDirt_.map(function (row) {
    return row.map(Cell.parse);
  });
  this.staticGrids = Bee.getAllStaticGrids(variableGrid);

  this.currentStaticGridId = 0;
  this.currentStaticGrid = this.staticGrids[0];
};

module.exports = Bee;

/**
 * Clones the given grid of BeeCells by calling BeeCell.clone
 * @param {BeeCell[][]} grid
 * @return {BeeCell[][]} grid
 */
Bee.cloneGrid = function (grid) {
  return grid.map(function (row) {
    return row.map(function (cell) {
      return cell.clone();
    });
  });
};

/**
 * Given a single grid of BeeCells, some of which may be "variable"
 * cells, return a list of grids of non-variable BeeCells representing
 * all possible variable combinations.
 * @param {BeeCell[][]} variableGrid
 * @return {BeeCell[][][]} grids
 */
Bee.getAllStaticGrids = function (variableGrid) {
  var grids = [variableGrid];
  variableGrid.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      if (cell.isVariableCloud()) {
        var possibleAssets = cell.getPossibleGridAssets();
        var newGrids = [];
        possibleAssets.forEach(function (asset) {
          grids.forEach(function (grid) {
            var newMap = Bee.cloneGrid(grid);
            newMap[x][y] = asset;
            newGrids.push(newMap);
          });
        });
        grids = newGrids;
      }
    });
  });
  return grids;
};

/**
 * Simple passthrough that calls resetCurrntValue for every BeeCell in
 * this.currentStaticGrid
 */
Bee.prototype.resetCurrentValues = function () {
  this.currentStaticGrid.forEach(function (row) {
    row.forEach(function (cell) {
      cell.resetCurrentValue();
    });
  });
};

/**
 * Resets current state, for easy reexecution of tests
 */
Bee.prototype.reset = function () {
  this.honey_ = 0;
  // list of the locations we've grabbed nectar from
  this.nectars_ = [];
  for (var i = 0; i < this.currentStaticGrid.length; i++) {
    this.userChecks_[i] = [];
    for (var j = 0; j < this.currentStaticGrid[i].length; j++) {
      this.userChecks_[i][j] = {
        checkedForFlower: false,
        checkedForHive: false,
        checkedForNectar: false
      };
    }
  }
  if (this.maze_.gridItemDrawer) {
    this.maze_.gridItemDrawer.updateNectarCounter(this.nectars_);
    this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
  }
  this.resetCurrentValues();
};

/**
 * Assigns this.currentStaticGrid to the appropriate grid and resets all
 * current values
 * @param {Number} id
 */
Bee.prototype.useGridWithId = function (id) {
  this.currentStaticGridId = id;
  this.currentStaticGrid = this.staticGrids[id];
  this.resetCurrentValues();
  this.reset();
};

/**
 * @param {Number} row
 * @param {Number} col
 * @returns {Number} val
 */
Bee.prototype.getValue = function (row, col) {
  return this.currentStaticGrid[row][col].getCurrentValue();
};

/**
 * @param {Number} row
 * @param {Number} col
 * @param {Number} val
 */
Bee.prototype.setValue = function (row, col, val) {
  this.currentStaticGrid[row][col].setCurrentValue(val);
};

/**
 * Did we reach our total nectar/honey goals, and accomplish any specific
 * hiveGoals?
 */
Bee.prototype.finished = function () {
  // nectar/honey goals
  if (this.honey_ < this.honeyGoal_ || this.nectars_.length < this.nectarGoal_) {
    return false;
  }

  if (!this.checkedAllClouded() || !this.checkedAllPurple()) {
    return false;
  }

  return true;
};

/**
 * Called after user's code has finished executing. Gives us a chance to
 * terminate with app-specific values, such as unchecked cloud/purple flowers.
 */
Bee.prototype.onExecutionFinish = function () {
  var executionInfo = this.maze_.executionInfo;
  if (executionInfo.isTerminated()) {
    return;
  }
  if (this.finished()) {
    return;
  }

  // we didn't finish. look to see if we need to give an app specific error
  if (this.nectars_.length < this.nectarGoal_) {
    executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_NECTAR);
  } else if (this.honey_ < this.honeyGoal_) {
    executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_HONEY);
  } else if (!this.checkedAllClouded()) {
    executionInfo.terminateWithValue(TerminationValue.UNCHECKED_CLOUD);
  } else if (!this.checkedAllPurple()) {
    executionInfo.terminateWithValue(TerminationValue.UNCHECKED_PURPLE);
  }
};

/**
 * Did we check every flower/honey that was covered by a cloud?
 */
Bee.prototype.checkedAllClouded = function () {
  for (var row = 0; row < this.currentStaticGrid.length; row++) {
    for (var col = 0; col < this.currentStaticGrid[row].length; col++) {
      if (this.isCloudable(row, col) && !this.checkedCloud(row, col)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Did we check every purple flower
 */
Bee.prototype.checkedAllPurple = function () {
  for (var row = 0; row < this.currentStaticGrid.length; row++) {
    for (var col = 0; col < this.currentStaticGrid[row].length; col++) {
      if (this.isPurpleFlower(row, col) && !this.userChecks_[row][col].checkedForNectar) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Get the test results based on the termination value.  If there is
 * no app-specific failure, this returns StudioApp.getTestResults().
 */
Bee.prototype.getTestResults = function (terminationValue) {
  switch (terminationValue) {
    case TerminationValue.NOT_AT_FLOWER:
    case TerminationValue.FLOWER_EMPTY:
    case TerminationValue.NOT_AT_HONEYCOMB:
    case TerminationValue.HONEYCOMB_FULL:
      return TestResults.APP_SPECIFIC_FAIL;

    case TerminationValue.UNCHECKED_CLOUD:
    case TerminationValue.UNCHECKED_PURPLE:
    case TerminationValue.INSUFFICIENT_NECTAR:
    case TerminationValue.INSUFFICIENT_HONEY:
      var testResults = this.studioApp_.getTestResults(true);
      // If we have a non-app specific failure, we want that to take precedence.
      // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
      // a suboptimal solution, so in those cases we want to return our
      // app specific fail
      if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
        testResults = TestResults.APP_SPECIFIC_FAIL;
      }
      return testResults;
  }

  return this.studioApp_.getTestResults(false);
};

/**
 * Get any app-specific message, based on the termination value,
 * or return null if none applies.
 */
Bee.prototype.getMessage = function (terminationValue) {
  switch (terminationValue) {
    case TerminationValue.NOT_AT_FLOWER:
      return mazeMsg.notAtFlowerError();
    case TerminationValue.FLOWER_EMPTY:
      return mazeMsg.flowerEmptyError();
    case TerminationValue.NOT_AT_HONEYCOMB:
      return mazeMsg.notAtHoneycombError();
    case TerminationValue.HONEYCOMB_FULL:
      return mazeMsg.honeycombFullError();
    case TerminationValue.UNCHECKED_CLOUD:
      return mazeMsg.uncheckedCloudError();
    case TerminationValue.UNCHECKED_PURPLE:
      return mazeMsg.uncheckedPurpleError();
    case TerminationValue.INSUFFICIENT_NECTAR:
      return mazeMsg.insufficientNectar();
    case TerminationValue.INSUFFICIENT_HONEY:
      return mazeMsg.insufficientHoney();
    default:
      return null;
  }
};

/**
 * @param {boolean} userCheck Is this being called from user code
 */
Bee.prototype.isHive = function (row, col, userCheck) {
  userCheck = userCheck || false;
  if (userCheck) {
    this.userChecks_[row][col].checkedForHive = true;
  }
  var cell = this.currentStaticGrid[row][col];
  return cell.isHive();
};

/**
 * @param {boolean} userCheck Is this being called from user code
 */
Bee.prototype.isFlower = function (row, col, userCheck) {
  userCheck = userCheck || false;
  if (userCheck) {
    this.userChecks_[row][col].checkedForFlower = true;
  }
  var cell = this.currentStaticGrid[row][col];
  return cell.isFlower();
};

/**
 * Returns true if cell should be clovered by a cloud while running
 */
Bee.prototype.isCloudable = function (row, col) {
  return this.currentStaticGrid[row][col].isStaticCloud();
};

/**
 * Returns true if cell has been checked for either a flower or a hive
 */
Bee.prototype.checkedCloud = function (row, col) {
  return this.userChecks_[row][col].checkedForFlower || this.userChecks_[row][col].checkedForHive;
};

/**
 * Flowers are either red or purple. This function returns true if a flower is red.
 */
Bee.prototype.isRedFlower = function (row, col) {
  if (!this.isFlower(row, col, false)) {
    return false;
  }

  // If the flower has been overridden to be red, return true.
  // Otherwise, if the flower has been overridden to be purple, return
  // false. If neither of those are true, then the flower is whatever
  // the default flower color is.
  if (this.currentStaticGrid[row][col].isRedFlower()) {
    return true;
  } else if (this.currentStaticGrid[row][col].isPurpleFlower()) {
    return false;
  } else {
    return this.defaultFlowerColor_ === 'red';
  }
};

/**
 * Row, col contains a flower that is purple
 */
Bee.prototype.isPurpleFlower = function (row, col) {
  return this.isFlower(row, col, false) && !this.isRedFlower(row, col);
};

/**
 * See isHive comment.
 */
Bee.prototype.hiveGoal = function (row, col) {
  var val = this.getValue(row, col);
  if (val >= -1) {
    return 0;
  }

  return Math.abs(val) - 1;
};

/**
 * How much more honey can the hive at (row, col) produce before it hits the goal
 */
Bee.prototype.hiveRemainingCapacity = function (row, col) {
  if (!this.isHive(row, col)) {
    return 0;
  }

  var val = this.getValue(row, col);
  if (val === UNLIMITED_HONEY) {
    return Infinity;
  }
  if (val === EMPTY_HONEY) {
    return 0;
  }
  return -val;
};

/**
 * How much more nectar can be collected from the flower at (row, col)
 */
Bee.prototype.flowerRemainingCapacity = function (row, col) {
  var val = this.getValue(row, col);
  if (val < 0) {
    // not a flower
    return 0;
  }

  if (val === UNLIMITED_NECTAR) {
    return Infinity;
  }
  if (val === EMPTY_NECTAR) {
    return 0;
  }
  return val;
};

/**
 * Update model to represent made honey.  Does no validation
 */
Bee.prototype.madeHoneyAt = function (row, col) {
  if (this.getValue(row, col) !== UNLIMITED_HONEY) {
    this.setValue(row, col, this.getValue(row, col) + 1);
  }

  this.honey_ += 1;
};

/**
 * Update model to represent gathered nectar. Does no validation
 */
Bee.prototype.gotNectarAt = function (row, col) {
  if (this.getValue(row, col) !== UNLIMITED_NECTAR) {
    this.setValue(row, col, this.getValue(row, col) - 1);
  }

  this.nectars_.push({ row: row, col: col });
};

// API

Bee.prototype.getNectar = function (id) {
  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  // Make sure we're at a flower.
  if (!this.isFlower(row, col)) {
    this.maze_.executionInfo.terminateWithValue(TerminationValue.NOT_AT_FLOWER);
    return;
  }
  // Nectar is positive.  Make sure we have it.
  if (this.flowerRemainingCapacity(row, col) === 0) {
    this.maze_.executionInfo.terminateWithValue(TerminationValue.FLOWER_EMPTY);
    return;
  }

  this.maze_.executionInfo.queueAction('nectar', id);
  this.gotNectarAt(row, col);
};

// Note that this deliberately does not check whether bee has gathered nectar.
Bee.prototype.makeHoney = function (id) {
  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  if (!this.isHive(row, col)) {
    this.maze_.executionInfo.terminateWithValue(TerminationValue.NOT_AT_HONEYCOMB);
    return;
  }
  if (this.hiveRemainingCapacity(row, col) === 0) {
    this.maze_.executionInfo.terminateWithValue(TerminationValue.HONEYCOMB_FULL);
    return;
  }

  this.maze_.executionInfo.queueAction('honey', id);
  this.madeHoneyAt(row, col);
};

Bee.prototype.nectarRemaining = function (userCheck) {
  userCheck = userCheck || false;

  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  if (userCheck) {
    this.userChecks_[row][col].checkedForNectar = true;
  }

  return this.flowerRemainingCapacity(row, col);
};

Bee.prototype.honeyAvailable = function () {
  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  return this.hiveRemainingCapacity(row, col);
};

// ANIMATIONS
Bee.prototype.playAudio_ = function (sound) {
  // Check for StudioApp, which will often be undefined in unit tests
  if (this.studioApp_) {
    this.studioApp_.playAudio(sound);
  }
};

Bee.prototype.animateGetNectar = function () {
  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  if (this.getValue(row, col) <= 0) {
    throw new Error("Shouldn't be able to end up with a nectar animation if " + "there was no nectar to be had");
  }

  this.playAudio_('nectar');
  this.gotNectarAt(row, col);

  this.maze_.gridItemDrawer.updateItemImage(row, col, true);
  this.maze_.gridItemDrawer.updateNectarCounter(this.nectars_);
};

Bee.prototype.animateMakeHoney = function () {
  var col = this.maze_.pegmanX;
  var row = this.maze_.pegmanY;

  if (!this.isHive(row, col)) {
    throw new Error("Shouldn't be able to end up with a honey animation if " + "we arent at a hive or dont have nectar");
  }

  this.playAudio_('honey');
  this.madeHoneyAt(row, col);

  this.maze_.gridItemDrawer.updateItemImage(row, col, true);

  this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
};

},{"../constants.js":"/home/ubuntu/staging/apps/build/js/constants.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./beeCell":"/home/ubuntu/staging/apps/build/js/maze/beeCell.js","./locale":"/home/ubuntu/staging/apps/build/js/maze/locale.js"}],"/home/ubuntu/staging/apps/build/js/maze/locale.js":[function(require,module,exports){
// locale for maze
"use strict";

module.exports = window.blockly.maze_locale;

},{}],"/home/ubuntu/staging/apps/build/js/maze/beeCell.js":[function(require,module,exports){
/**
 * @overview BeeCell represents the contets of the grid elements for Bee.
 * Bee BeeCells are more complex than many other kinds of cell; they can be
 * "hidden" with clouds, they can represent multiple different kinds of
 * element (flower, hive), some of which can be multiple colors (red,
 * purple), and which can have a range of possible values.
 *
 * Some cells can also be "variable", meaning that their contents are
 * not static but can in fact be randomized between runs.
 */

// FC is short for FlowerComb, which we were originally using instead of cloud
'use strict';

var CLOUD = {
  STATIC: 'FC',
  VARIABLE: 'C',
  ANY: 'Cany'
};
var FLOWER = {
  RED: 'R',
  PURPLE: 'P'
};
var PREFIX = {
  FLOWER: '+',
  HIVE: '-'
};

var BeeCell = function BeeCell(value, clouded, prefix, color) {
  /**
   * @type {String}
   */
  this.clouded_ = clouded;

  /**
   * @type {String}
   */
  this.prefix_ = prefix;

  /**
   * @type {String}
   */
  this.color_ = color;

  /**
   * @type {Number}
   */
  this.originalValue_ = value;

  /**
   * @type {Number}
   */
  this.currentValue_ = undefined;
  this.resetCurrentValue();
};

module.exports = BeeCell;

/**
 * Returns a new BeeCell that's an exact replica of this one
 * @return {BeeCell}
 */
BeeCell.prototype.clone = function () {
  var newBeeCell = new BeeCell(this.originalValue_, this.clouded_, this.prefix_, this.color_);
  newBeeCell.setCurrentValue(this.currentValue_);
  return newBeeCell;
};

/**
 * @return {Number}
 */
BeeCell.prototype.getCurrentValue = function () {
  return this.currentValue_;
};

/**
 * @param {Number}
 */
BeeCell.prototype.setCurrentValue = function (val) {
  this.currentValue_ = val;
};

BeeCell.prototype.resetCurrentValue = function () {
  if (this.prefix_) {
    this.currentValue_ = parseInt(this.prefix_ + this.originalValue_);
  } else {
    this.currentValue_ = 0;
  }
};

BeeCell.prototype.isFlower = function () {
  return this.prefix_ === PREFIX.FLOWER;
};

BeeCell.prototype.isHive = function () {
  return this.prefix_ === PREFIX.HIVE;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isRedFlower = function () {
  return this.isFlower() && this.color_ === FLOWER.RED;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isPurpleFlower = function () {
  return this.isFlower() && this.color_ === FLOWER.PURPLE;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isStaticCloud = function () {
  return this.clouded_ === CLOUD.STATIC;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isVariableCloud = function () {
  return this.clouded_ === CLOUD.VARIABLE || this.clouded_ === CLOUD.ANY;
};

/**
 * Variable cells can represent multiple possible kinds of grid assets,
 * whereas non-variable cells can represent only a single kind. This
 * method returns an array of non-variable BeeCells based on this BeeCell's
 * configuration.
 * @return {BeeCell[]}
 */
BeeCell.prototype.getPossibleGridAssets = function () {
  // Variable configurations are:
  //   Flower or nothing: +nC
  //   Honeycomb or nothing: -nC
  //   Flower or Honeycomb: nC
  //   Flower, Honeycomb, or Nothing: nCany

  if (this.isVariableCloud()) {
    var possibilities = [];

    if (this.isFlower() || !this.prefix_) {
      possibilities.push(new BeeCell(this.originalValue_, CLOUD.STATIC, PREFIX.FLOWER, this.color_));
    }

    if (this.isHive() || !this.prefix_) {
      possibilities.push(new BeeCell(this.originalValue_, CLOUD.STATIC, PREFIX.HIVE));
    }

    if (this.clouded_ === CLOUD.ANY || this.prefix_) {
      possibilities.push(new BeeCell(0, CLOUD.STATIC));
    }

    return possibilities;
  }

  return [this];
};

/**
 * Generates a new BeeCell from a config string, as provided by
 * Levelbuilder.
 * @return {BeeCell}
 */
BeeCell.parse = function (string) {
  var matches = string.match && string.match(/^(\+|-)?(\d+)(R|P)?(FC|C|Cany)?$/);
  var value, clouded, prefix, color;
  if (matches) {
    prefix = matches[1];
    value = parseInt(matches[2]);
    color = matches[3];
    clouded = matches[4];
  } else {
    value = string;
  }

  // TODO: when we add numeric ranges, this becomes:
  /*
  var matches = cell.match && cell.match(/^(\+|-)?(\d+)(,\d+)?(R|P)?(FC|C|Cany)?$/);
  return {
    prefix: matches[1],
    value: matches[2],
    range: matches[3],
    color: matches[4],
    clouded: matches[5],
  };
  */

  return new BeeCell(value, clouded, prefix, color);
};

},{}]},{},["/home/ubuntu/staging/apps/build/js/maze/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9tYXplL21haW4uanMiLCJidWlsZC9qcy9tYXplL3NraW5zLmpzIiwiYnVpbGQvanMvbWF6ZS9tYXplLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoLmpzIiwiYnVpbGQvanMvbWF6ZS92aXN1YWxpemF0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zY3JhdC5qcyIsImJ1aWxkL2pzL21hemUvbGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoTGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMvbWF6ZS54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zdGFydEJsb2Nrcy54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUva2FyZWxMZXZlbHMuanMiLCJidWlsZC9qcy9tYXplL3Rvb2xib3hlcy9rYXJlbDMueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvdG9vbGJveGVzL2thcmVsMi54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMva2FyZWwxLnhtbC5lanMiLCJidWlsZC9qcy9tYXplL2thcmVsU3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXhlY3V0aW9uSW5mby5qcyIsImJ1aWxkL2pzL21hemUvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL21hemUvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9tYXplL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUvYmVlSXRlbURyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvZGlydERyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvbWF6ZVV0aWxzLmpzIiwiYnVpbGQvanMvbWF6ZS9iZWVCbG9ja3MuanMiLCJidWlsZC9qcy9tYXplL2FwaS5qcyIsImJ1aWxkL2pzL21hemUvdGlsZXMuanMiLCJidWlsZC9qcy9tYXplL2JlZS5qcyIsImJ1aWxkL2pzL21hemUvbG9jYWxlLmpzIiwiYnVpbGQvanMvbWF6ZS9iZWVDZWxsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDWEEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTFCLElBQUksT0FBTyxHQUFHO0FBQ1osU0FBTyxFQUFFO0FBQ1Asd0NBQW9DLEVBQUUsSUFBSTtBQUMxQyxnQkFBWSxFQUFFLEVBQUU7QUFDaEIsZUFBVyxFQUFFLEVBQUU7QUFDZixlQUFXLEVBQUUsS0FBSztBQUNsQixRQUFJLEVBQUUsRUFBRTtBQUNSLHVCQUFtQixFQUFFLGlCQUFpQjtBQUN0Qyx1QkFBbUIsRUFBRSxpQkFBaUI7QUFDdEMsaUNBQTZCLEVBQUUsR0FBRzs7QUFFbEMsa0NBQThCLEVBQUUsQ0FBQztBQUNqQyxvQkFBZ0IsRUFBRSxJQUFJO0dBQ3ZCOztBQUVELEtBQUcsRUFBRTtBQUNILHFCQUFpQixFQUFFLEVBQUU7QUFDckIsZ0JBQVksRUFBRSxjQUFjO0FBQzVCLGFBQVMsRUFBRSxlQUFlO0FBQzFCLGdCQUFZLEVBQUUsa0JBQWtCO0FBQ2hDLFNBQUssRUFBRSxXQUFXO0FBQ2xCLFNBQUssRUFBRSxXQUFXO0FBQ2xCLGtCQUFjLEVBQUUsZ0JBQWdCO0FBQ2hDLFlBQVEsRUFBRSxJQUFJO0FBQ2QsZUFBVyxFQUFFLGVBQWU7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QVMsQ0FBQyxVQUFVLENBQUMsQ0FDdkI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFB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RCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekIsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FB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QUFDO0tBQ2Y7QUFDRCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFDeEIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQ3JCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUN2QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxLQUFLO0FBQ2pDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMs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Q0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQ3ZCO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUNoQztBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsS0FBSztBQUNqQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQzdDO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUNsRDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUNoQztHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUN2RDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxLQUFLO0FBQ2pDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFVBQVUsQ0FBQyxFQUNaLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxJQUFJLENBQUMsRUFDTixDQUFDLHNCQUFzQixDQUFDLENBQ3pCO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxJQUFJLENBQUMsRUFDTixDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUMvQjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsR0FBRyxDQUFDLEVBQ0wsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsRUFDOUIsQ0FBQyxTQUFTLENBQUMsQ0FDWjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsR0FBRztLQUNqQjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELFFBQU0sRUFBRTtBQUNOLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN6QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2pDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsbUJBQW1CLENBQUMsRUFDckIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ3hCO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxHQUFHO0tBQ2pCO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsUUFBTSxFQUFFO0FBQ04sYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3pCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsR0FBRyxDQUFDLEVBQ0wsQ0FBQyxJQUFJLENBQUMsRUFDTixDQUFDLG1CQUFtQixDQUFDLEVBQ3JCLENBQUMsbUJBQW1CLENBQUMsRUFDckIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ3hCO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxHQUFHO0tBQ2pCO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOzs7O0FBSUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLElBQUk7QUFDYixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FDdkQ7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDNUI7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDMUI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUNuRDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUNoQztHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLE1BQU0sQ0FBQyxFQUNSLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLFNBQVMsQ0FBQyxFQUNYLENBQUMsVUFBVSxDQUFDLENBQ2I7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLE1BQU0sQ0FBQyxFQUNSLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1gsQ0FBQyxZQUFZLENBQUMsQ0FDZjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDaEU7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUNqRDtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLENBQ3RDO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELFFBQU0sRUFBRTtBQUNOLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN6QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2pDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsVUFBVSxDQUFDLEVBQ1osQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsRUFDOUIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ3hCO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzlCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQy9CO0dBQ0Y7Ozs7QUFJRCxlQUFhLEVBQUU7QUFDYixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FDekQ7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELGVBQWEsRUFBRTtBQUNiLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQ25DO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxLQUFLO0FBQ2pDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBRTtBQUNkLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUMzRDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxLQUFLO0FBQ2pDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFO0FBQ2IsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQzNEO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELFlBQVUsRUFBRTtBQUNWLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQ3pDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQ3ZDO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxpQkFBZSxFQUFFO0FBQ2YsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDekMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FDeEQ7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzVCO0dBQ0Y7O0FBRUQsb0JBQWtCLEVBQUU7QUFDbEIsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUM3QztBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsb0JBQWtCLEVBQUU7QUFDbEIsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQ3BELENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUNsQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FDckM7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLEVBQzdCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFFLEVBQzdCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxvQkFBa0IsRUFBRTtBQUNsQixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQ25ELENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDaEUsQ0FBQyxhQUFhLENBQUMsQ0FDaEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELFNBQU8sRUFBRTtBQUNQLGFBQVMsRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDOzs7Ozs7Ozs7OzttREFXVyxDQUM5QztBQUNELGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsb0JBQWdCLEVBQUUsRUFDakI7QUFDRCxXQUFPLEVBQUU7QUFDUCxrQkFBWSxFQUFFLEdBQUc7S0FDbEI7QUFDRCxhQUFTLEVBQUUsQ0FBQzs7QUFFWixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBRTdCO0dBQ0Y7Q0FDRixDQUFDOzs7QUNodUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JCQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7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IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93Lk1hemUgPSByZXF1aXJlKCcuL21hemUnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuTWF6ZSA9IHdpbmRvdy5NYXplO1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93Lm1hemVNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcblxuICBhcHBNYWluKHdpbmRvdy5NYXplLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMjFoZW1VdmJXRnBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN1FVRkJRU3hKUVVGSkxFOUJRVThzUjBGQlJ5eFBRVUZQTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1FVRkRjRU1zVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03UVVGRGFFTXNTVUZCU1N4UFFVRlBMRTFCUVUwc1MwRkJTeXhYUVVGWExFVkJRVVU3UVVGRGFrTXNVVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETzBOQlF6TkNPMEZCUTBRc1NVRkJTU3hOUVVGTkxFZEJRVWNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMEZCUTJwRExFbEJRVWtzVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRCUVVOcVF5eEpRVUZKTEV0QlFVc3NSMEZCUnl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03TzBGQlJTOUNMRTFCUVUwc1EwRkJReXhSUVVGUkxFZEJRVWNzVlVGQlV5eFBRVUZQTEVWQlFVVTdRVUZEYkVNc1UwRkJUeXhEUVVGRExGZEJRVmNzUjBGQlJ5eExRVUZMTEVOQlFVTTdRVUZETlVJc1UwRkJUeXhEUVVGRExGbEJRVmtzUjBGQlJ5eE5RVUZOTEVOQlFVTTdPMEZCUlRsQ0xGTkJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dERRVU4yUXl4RFFVRkRJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKMllYSWdZWEJ3VFdGcGJpQTlJSEpsY1hWcGNtVW9KeTR1TDJGd2NFMWhhVzRuS1R0Y2JuZHBibVJ2ZHk1TllYcGxJRDBnY21WeGRXbHlaU2duTGk5dFlYcGxKeWs3WEc1cFppQW9kSGx3Wlc5bUlHZHNiMkpoYkNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdaMnh2WW1Gc0xrMWhlbVVnUFNCM2FXNWtiM2N1VFdGNlpUdGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NXRZWHBsVFdGcGJpQTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTXBJSHRjYmlBZ2IzQjBhVzl1Y3k1emEybHVjMDF2WkhWc1pTQTlJSE5yYVc1ek8xeHVJQ0J2Y0hScGIyNXpMbUpzYjJOcmMwMXZaSFZzWlNBOUlHSnNiMk5yY3p0Y2JseHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NU5ZWHBsTENCc1pYWmxiSE1zSUc5d2RHbHZibk1wTzF4dWZUdGNiaUpkZlE9PSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBNYXplLlxuICovXG4vLyB0aWxlczogQSAyNTB4MjAwIHNldCBvZiAyMCBtYXAgaW1hZ2VzLlxuLy8gZ29hbDogQSAyMHgzNCBnb2FsIGltYWdlLlxuLy8gYmFja2dyb3VuZDogTnVtYmVyIG9mIDQwMHg0MDAgYmFja2dyb3VuZCBpbWFnZXMuIFJhbmRvbWx5IHNlbGVjdCBvbmUgaWZcbi8vIHNwZWNpZmllZCwgb3RoZXJ3aXNlLCB1c2UgYmFja2dyb3VuZC5wbmcuXG4vLyBsb29rOiBDb2xvdXIgb2Ygc29uYXItbGlrZSBsb29rIGljb24uXG5cbnZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbnZhciBDT05GSUdTID0ge1xuICBsZXR0ZXJzOiB7XG4gICAgbm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlOiB0cnVlLFxuICAgIHBlZ21hbkhlaWdodDogNTAsXG4gICAgcGVnbWFuV2lkdGg6IDUwLFxuICAgIGRhbmNlT25Mb2FkOiBmYWxzZSxcbiAgICBnb2FsOiAnJyxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXIuZ2lmJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuICAgIGhpZGVJbnN0cnVjdGlvbnM6IHRydWVcbiAgfSxcblxuICBiZWU6IHtcbiAgICBvYnN0YWNsZUFuaW1hdGlvbjogJycsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGUucG5nJyxcbiAgICByZWRGbG93ZXI6ICdyZWRGbG93ZXIucG5nJyxcbiAgICBwdXJwbGVGbG93ZXI6ICdwdXJwbGVGbG93ZXIucG5nJyxcbiAgICBob25leTogJ2hvbmV5LnBuZycsXG4gICAgY2xvdWQ6ICdjbG91ZC5wbmcnLFxuICAgIGNsb3VkQW5pbWF0aW9uOiAnY2xvdWRfaGlkZS5naWYnLFxuICAgIGJlZVNvdW5kOiB0cnVlLFxuICAgIG5lY3RhclNvdW5kOiAnZ2V0TmVjdGFyLm1wMycsXG4gICAgaG9uZXlTb3VuZDogJ21ha2VIb25leS5tcDMnLFxuXG4gICAgbG9vazogJyMwMDAnLFxuICAgIG5vbkRpc2FwcGVhcmluZ1BlZ21hbkhpdHRpbmdPYnN0YWNsZTogdHJ1ZSxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXIuZ2lmJyxcbiAgICB3YWxsUGVnbWFuQW5pbWF0aW9uOiAnd2FsbF9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGwuZ2lmJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuICAgIGFjdGlvblNwZWVkU2NhbGU6IHtcbiAgICAgIG5lY3RhcjogMSxcbiAgICB9LFxuICAgIHBlZ21hbllPZmZzZXQ6IDAsXG4gICAgdGlsZVNoZWV0V2lkdGg6IDUsXG4gICAgcGVnbWFuSGVpZ2h0OiA1MCxcbiAgICBwZWdtYW5XaWR0aDogNTBcbiAgfSxcblxuICBmYXJtZXI6IHtcbiAgICBvYnN0YWNsZUlkbGU6ICdvYnN0YWNsZS5wbmcnLFxuXG4gICAgZGlydDogJ2RpcnQucG5nJyxcbiAgICBmaWxsU291bmQ6ICdmaWxsLm1wMycsXG4gICAgZGlnU291bmQ6ICdkaWcubXAzJyxcblxuICAgIGxvb2s6ICcjMDAwJyxcbiAgICB0cmFuc3BhcmVudFRpbGVFbmRpbmc6IHRydWUsXG4gICAgbm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlOiB0cnVlLFxuICAgIGJhY2tncm91bmQ6ICdiYWNrZ3JvdW5kJyArIF8uc2FtcGxlKFswLCAxLCAyLCAzXSkgKyAnLnBuZycsXG4gICAgZGlydFNvdW5kOiB0cnVlLFxuICAgIHBlZ21hbllPZmZzZXQ6IC04LFxuICAgIGRhbmNlT25Mb2FkOiB0cnVlXG4gIH0sXG5cbiAgcHZ6OiB7XG4gICAgZ29hbElkbGU6ICdnb2FsSWRsZS5naWYnLFxuICAgIG9ic3RhY2xlSWRsZTogJ29ic3RhY2xlSWRsZS5naWYnLFxuXG4gICAgZ29hbEFuaW1hdGlvbjogJ2dvYWwuZ2lmJyxcbiAgICBtYXplX2ZvcmV2ZXI6ICdtYXplX2ZvcmV2ZXIucG5nJyxcblxuICAgIG9ic3RhY2xlU2NhbGU6IDEuNCxcbiAgICBwZWdtYW5ZT2Zmc2V0OiAtOCxcbiAgICBkYW5jZU9uTG9hZDogdHJ1ZVxuICB9LFxuXG4gIGJpcmRzOiB7XG4gICAgZ29hbElkbGU6ICdnb2FsSWRsZS5naWYnLFxuICAgIG9ic3RhY2xlSWRsZTogJ29ic3RhY2xlLnBuZycsXG5cbiAgICBnb2FsQW5pbWF0aW9uOiAnZ29hbC5naWYnLFxuICAgIG1hemVfZm9yZXZlcjogJ21hemVfZm9yZXZlci5wbmcnLFxuICAgIGxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXM6ICd0aWxlcy1icm9rZW4ucG5nJyxcblxuICAgIG9ic3RhY2xlU2NhbGU6IDEuMixcbiAgICBhZGRpdGlvbmFsU291bmQ6IHRydWUsXG4gICAgaWRsZVBlZ21hbkFuaW1hdGlvbjogJ2lkbGVfYXZhdGFyLmdpZicsXG4gICAgd2FsbFBlZ21hbkFuaW1hdGlvbjogJ3dhbGxfYXZhdGFyLnBuZycsXG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbjogJ21vdmVfYXZhdGFyLnBuZycsXG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvblNwZWVkU2NhbGU6IDEuNSxcbiAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIHdoZW4gbW92ZSBwZWdtYW4gYW5pbWF0aW9uIGlzIHNldFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb25GcmFtZU51bWJlcjogOSxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGwuZ2lmJyxcbiAgICBhcHByb2FjaGluZ0dvYWxBbmltYXRpb246ICdjbG9zZV9nb2FsLnBuZycsXG4gICAgcGVnbWFuSGVpZ2h0OiA2OCxcbiAgICBwZWdtYW5XaWR0aDogNTEsXG4gICAgcGVnbWFuWU9mZnNldDogLTE0LFxuICAgIHR1cm5BZnRlclZpY3Rvcnk6IHRydWVcbiAgfSxcblxuIHNjcmF0OiB7XG4gICAgZ29hbElkbGU6ICdnb2FsLnBuZycsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGUucG5nJyxcblxuICAgIGdvYWxBbmltYXRpb246ICdnb2FsLnBuZycsXG4gICAgbWF6ZV9mb3JldmVyOiAnbWF6ZV9mb3JldmVyLnBuZycsXG4gICAgbGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlczogJ3RpbGVzLWJyb2tlbi5wbmcnLFxuXG4gICAgb2JzdGFjbGVTY2FsZTogMS4yLFxuICAgIGFkZGl0aW9uYWxTb3VuZDogdHJ1ZSxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXJfc2hlZXQucG5nJyxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIGlkbGVQZWdtYW5Db2w6IDQsXG4gICAgaWRsZVBlZ21hblJvdzogMTEsXG5cbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGxfYXZhdGFyX3NoZWV0LnBuZycsXG4gICAgaGl0dGluZ1dhbGxBbmltYXRpb25GcmFtZU51bWJlcjogMjAsXG4gICAgaGl0dGluZ1dhbGxBbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgaGl0dGluZ1dhbGxQZWdtYW5Db2w6IDEsXG4gICAgaGl0dGluZ1dhbGxQZWdtYW5Sb3c6IDIwLFxuXG4gICAgY2VsZWJyYXRlQW5pbWF0aW9uOiAnanVtcF9hY29ybl9zaGVldC5wbmcnLFxuICAgIGNlbGVicmF0ZVBlZ21hbkNvbDogMSxcbiAgICBjZWxlYnJhdGVQZWdtYW5Sb3c6IDksXG5cbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuXG4gICAgYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uOiAnY2xvc2VfZ29hbC5wbmcnLFxuICAgIHBlZ21hbkhlaWdodDogMTA3LFxuICAgIHBlZ21hbldpZHRoOiA4MCxcbiAgICBwZWdtYW5YT2Zmc2V0OiAtMTIsXG4gICAgcGVnbWFuWU9mZnNldDogLTMwLFxuICAgIHR1cm5BZnRlclZpY3Rvcnk6IHRydWVcbiAgfVxufTtcblxuLy8gbmlnaHQgc2tpbnMgYXJlIGVmZmVjdGl2ZWx5IHRoZSBzYW1lLCBidXQgd2lsbCBoYXZlIHNvbWUgZGlmZmVyZW50IGFzc2V0c1xuLy8gaW4gdGhlaXIgcmVzcGVjdGl2ZSBmb2xkZXJzIGJsb2NrbHkvc3RhdGljL3NraW5zLzxza2luIG5hbWU+XG5DT05GSUdTLmJlZV9uaWdodCA9IENPTkZJR1MuYmVlO1xuQ09ORklHUy5mYXJtZXJfbmlnaHQgPSBDT05GSUdTLmZhcm1lcjtcblxuLyoqXG4gKiBHaXZlbiB0aGUgbXAzIHNvdW5kLCBnZW5lcmF0ZXMgYSBsaXN0IGNvbnRhaW5pbmcgYm90aCB0aGUgbXAzIGFuZCBvZ2cgc291bmRzXG4gKi9cbmZ1bmN0aW9uIHNvdW5kQXNzZXRVcmxzKHNraW4sIG1wM1NvdW5kKSB7XG4gIHZhciBiYXNlID0gbXAzU291bmQubWF0Y2goL14oLiopXFwubXAzJC8pWzFdO1xuICByZXR1cm4gW3NraW4uYXNzZXRVcmwobXAzU291bmQpLCBza2luLmFzc2V0VXJsKGJhc2UgKyAnLm9nZycpXTtcbn1cblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oYXNzZXRVcmwsIGlkKSB7XG4gIC8vIFRoZSBza2luIGhhcyBwcm9wZXJ0aWVzIGZyb20gdGhyZWUgbG9jYXRpb25zXG4gIC8vICgxKSBza2luQmFzZSAtIHByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBCbG9ja2x5IGFwcHNcbiAgLy8gKDIpIGhlcmUgLSBwcm9wZXJ0aWVzIGNvbW1vbiBhY3Jvc3MgYWxsIG1hemUgc2tpbnNcbiAgLy8gKDMpIGNvbmZpZyAtIHByb3BlcnRpZXMgcGFydGljdWxhciB0byBhIG1hemUgc2tpblxuICAvLyBJZiBhIHByb3BlcnR5IGlzIGRlZmluZWQgaW4gbXVsdGlwbGUgbG9jYXRpb25zLCB0aGUgbW9yZSBzcGVjaWZpYyBsb2NhdGlvblxuICAvLyB0YWtlcyBwcmVjZWRlbmNlXG5cbiAgLy8gKDEpIFByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBCbG9ja2x5IGFwcHNcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICAvLyAoMikgRGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBtYXplIHNraW5zLlxuICBza2luLm9ic3RhY2xlU2NhbGUgPSAxLjA7XG4gIHNraW4ub2JzdGFjbGVBbmltYXRpb24gPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5naWYnKTtcbiAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZSA9IDE7XG4gIHNraW4ubG9vayA9ICcjRkZGJztcbiAgc2tpbi5iYWNrZ3JvdW5kID0gc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZC5wbmcnKTtcbiAgc2tpbi50aWxlcyA9IHNraW4uYXNzZXRVcmwoJ3RpbGVzLnBuZycpO1xuICBza2luLnBlZ21hbkhlaWdodCA9IDUyO1xuICBza2luLnBlZ21hbldpZHRoID0gNDk7XG4gIHNraW4ucGVnbWFuWU9mZnNldCA9IDA7XG4gIC8vIGRvIHdlIHR1cm4gdG8gdGhlIGRpcmVjdGlvbiB3ZSdyZSBmYWNpbmcgYWZ0ZXIgcGVyZm9ybWluZyBvdXIgdmljdG9yeVxuICAvLyBhbmltYXRpb24/XG4gIHNraW4udHVybkFmdGVyVmljdG9yeSA9IGZhbHNlO1xuICBza2luLmRhbmNlT25Mb2FkID0gZmFsc2U7XG5cbiAgLy8gU291bmRzXG4gIHNraW4ub2JzdGFjbGVTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICdvYnN0YWNsZS5tcDMnKTtcbiAgc2tpbi53YWxsU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbC5tcDMnKTtcbiAgc2tpbi53aW5Hb2FsU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2luX2dvYWwubXAzJyk7XG4gIHNraW4ud2FsbDBTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsMC5tcDMnKTtcbiAgc2tpbi53YWxsMVNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGwxLm1wMycpO1xuICBza2luLndhbGwyU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbDIubXAzJyk7XG4gIHNraW4ud2FsbDNTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsMy5tcDMnKTtcbiAgc2tpbi53YWxsNFNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGw0Lm1wMycpO1xuXG4gIC8vICgzKSBHZXQgcHJvcGVydGllcyBmcm9tIGNvbmZpZ1xuICB2YXIgaXNBc3NldCA9IC9cXC5cXFN7M30kLzsgLy8gZW5kcyBpbiBkb3QgZm9sbG93ZWQgYnkgdGhyZWUgbm9uLXdoaXRlc3BhY2UgY2hhcnNcbiAgdmFyIGlzU291bmQgPSAvXiguKilcXC5tcDMkLzsgLy8gc29tZXRoaW5nLm1wM1xuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuICAgIHZhciB2YWwgPSBjb25maWdbcHJvcF07XG4gICAgaWYgKGlzU291bmQudGVzdCh2YWwpKSB7XG4gICAgICB2YWwgPSBzb3VuZEFzc2V0VXJscyhza2luLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBc3NldC50ZXN0KHZhbCkpIHtcbiAgICAgIHZhbCA9IHNraW4uYXNzZXRVcmwodmFsKTtcbiAgICB9XG4gICAgc2tpbltwcm9wXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBBcHBzOiBNYXplXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEphdmFTY3JpcHQgZm9yIEJsb2NrbHkncyBNYXplIGFwcGxpY2F0aW9uLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgcGFnZSA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9wYWdlLmh0bWwuZWpzJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIG1hemVVdGlscyA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcblxudmFyIEJlZSA9IHJlcXVpcmUoJy4vYmVlJyk7XG52YXIgV29yZFNlYXJjaCA9IHJlcXVpcmUoJy4vd29yZHNlYXJjaCcpO1xudmFyIHNjcmF0ID0gcmVxdWlyZSgnLi9zY3JhdCcpO1xuXG52YXIgRGlydERyYXdlciA9IHJlcXVpcmUoJy4vZGlydERyYXdlcicpO1xudmFyIEJlZUl0ZW1EcmF3ZXIgPSByZXF1aXJlKCcuL2JlZUl0ZW1EcmF3ZXInKTtcblxudmFyIEV4ZWN1dGlvbkluZm8gPSByZXF1aXJlKCcuL2V4ZWN1dGlvbkluZm8nKTtcblxudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcbnZhciBUdXJuRGlyZWN0aW9uID0gdGlsZXMuVHVybkRpcmVjdGlvbjtcbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG5cbnZhciBTVkdfTlMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKS5TVkdfTlM7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBNYXplID0gbW9kdWxlLmV4cG9ydHM7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG4vKipcbiAqIE1pbGxpc2Vjb25kcyBiZXR3ZWVuIGVhY2ggYW5pbWF0aW9uIGZyYW1lLlxuICovXG52YXIgc3RlcFNwZWVkID0gMTAwO1xuXG4vL1RPRE86IE1ha2UgY29uZmlndXJhYmxlLlxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG5cbnZhciBnZXRUaWxlID0gZnVuY3Rpb24obWFwLCB4LCB5KSB7XG4gIGlmIChtYXAgJiYgbWFwW3ldKSB7XG4gICAgcmV0dXJuIG1hcFt5XVt4XTtcbiAgfVxufTtcblxuLy8gRGVmYXVsdCBTY2FsaW5nc1xuTWF6ZS5zY2FsZSA9IHtcbiAgJ3NuYXBSYWRpdXMnOiAxLFxuICAnc3RlcFNwZWVkJzogNVxufTtcblxudmFyIGxvYWRMZXZlbCA9IGZ1bmN0aW9uKCkge1xuICAvLyBMb2FkIG1hcHMuXG4gIE1hemUubWFwID0gbGV2ZWwubWFwO1xuICBNYXplLmluaXRpYWxEaXJ0TWFwID0gbGV2ZWwuaW5pdGlhbERpcnQ7XG4gIE1hemUuc3RhcnREaXJlY3Rpb24gPSBsZXZlbC5zdGFydERpcmVjdGlvbjtcblxuICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcblxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBNYXplLnNjYWxlW2tleV0gPSBsZXZlbC5zY2FsZVtrZXldO1xuICB9XG5cbiAgaWYgKGxldmVsLmZhc3RHZXROZWN0YXJBbmltYXRpb24pIHtcbiAgICBza2luLmFjdGlvblNwZWVkU2NhbGUubmVjdGFyID0gMC41O1xuICB9XG4gIC8vIE1lYXN1cmUgbWF6ZSBkaW1lbnNpb25zIGFuZCBzZXQgc2l6ZXMuXG4gIC8vIFJPV1M6IE51bWJlciBvZiB0aWxlcyBkb3duLlxuICBNYXplLlJPV1MgPSBNYXplLm1hcC5sZW5ndGg7XG4gIC8vIENPTFM6IE51bWJlciBvZiB0aWxlcyBhY3Jvc3MuXG4gIE1hemUuQ09MUyA9IE1hemUubWFwWzBdLmxlbmd0aDtcbiAgLy8gSW5pdGlhbGl6ZSB0aGUgd2FsbE1hcC5cbiAgaW5pdFdhbGxNYXAoKTtcbiAgLy8gUGl4ZWwgaGVpZ2h0IGFuZCB3aWR0aCBvZiBlYWNoIG1hemUgc3F1YXJlIChpLmUuIHRpbGUpLlxuICBNYXplLlNRVUFSRV9TSVpFID0gNTA7XG4gIE1hemUuUEVHTUFOX0hFSUdIVCA9IHNraW4ucGVnbWFuSGVpZ2h0O1xuICBNYXplLlBFR01BTl9XSURUSCA9IHNraW4ucGVnbWFuV2lkdGg7XG4gIE1hemUuUEVHTUFOX1hfT0ZGU0VUID0gc2tpbi5wZWdtYW5YT2Zmc2V0IHx8IDA7XG4gIE1hemUuUEVHTUFOX1lfT0ZGU0VUID0gc2tpbi5wZWdtYW5ZT2Zmc2V0O1xuICAvLyBIZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSBnb2FsIGFuZCBvYnN0YWNsZXMuXG4gIE1hemUuTUFSS0VSX0hFSUdIVCA9IDQzO1xuICBNYXplLk1BUktFUl9XSURUSCA9IDUwO1xuXG4gIE1hemUuTUFaRV9XSURUSCA9IE1hemUuU1FVQVJFX1NJWkUgKiBNYXplLkNPTFM7XG4gIE1hemUuTUFaRV9IRUlHSFQgPSBNYXplLlNRVUFSRV9TSVpFICogTWF6ZS5ST1dTO1xuICBNYXplLlBBVEhfV0lEVEggPSBNYXplLlNRVUFSRV9TSVpFIC8gMztcblxuICBpZiAoTWF6ZS5pbml0aWFsRGlydE1hcCkge1xuICAgIE1hemUuZGlydF8gPSBuZXcgQXJyYXkoTWF6ZS5ST1dTKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHdhbGxNYXAuICBGb3IgYW55IGNlbGwgYXQgbG9jYXRpb24geCx5IE1hemUud2FsbE1hcFt5XVt4XSB3aWxsXG4gKiBiZSB0aGUgaW5kZXggb2Ygd2hpY2ggd2FsbCB0aWxlIHRvIHVzZSBmb3IgdGhhdCBjZWxsLiAgSWYgdGhlIGNlbGwgaXMgbm90IGFcbiAqIHdhbGwsIE1hemUud2FsbE1hcFt5XVt4XSBpcyB1bmRlZmluZWQuXG4gKi9cbnZhciBpbml0V2FsbE1hcCA9IGZ1bmN0aW9uKCkge1xuICBNYXplLndhbGxNYXAgPSBuZXcgQXJyYXkoTWF6ZS5ST1dTKTtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLlJPV1M7IHkrKykge1xuICAgIE1hemUud2FsbE1hcFt5XSA9IG5ldyBBcnJheShNYXplLkNPTFMpO1xuICB9XG59O1xuXG4vKipcbiAqIFBJRHMgb2YgYW5pbWF0aW9uIHRhc2tzIGN1cnJlbnRseSBleGVjdXRpbmcuXG4gKi9cbnZhciB0aW1lb3V0TGlzdCA9IHJlcXVpcmUoJy4uL3RpbWVvdXRMaXN0Jyk7XG5cbi8vIE1hcCBlYWNoIHBvc3NpYmxlIHNoYXBlIHRvIGEgc3ByaXRlLlxuLy8gSW5wdXQ6IEJpbmFyeSBzdHJpbmcgcmVwcmVzZW50aW5nIENlbnRyZS9Ob3J0aC9XZXN0L1NvdXRoL0Vhc3Qgc3F1YXJlcy5cbi8vIE91dHB1dDogW3gsIHldIGNvb3JkaW5hdGVzIG9mIGVhY2ggdGlsZSdzIHNwcml0ZSBpbiB0aWxlcy5wbmcuXG52YXIgVElMRV9TSEFQRVMgPSB7XG4gICcxMDAxMCc6IFs0LCAwXSwgIC8vIERlYWQgZW5kc1xuICAnMTAwMDEnOiBbMywgM10sXG4gICcxMTAwMCc6IFswLCAxXSxcbiAgJzEwMTAwJzogWzAsIDJdLFxuICAnMTEwMTAnOiBbNCwgMV0sICAvLyBWZXJ0aWNhbFxuICAnMTAxMDEnOiBbMywgMl0sICAvLyBIb3Jpem9udGFsXG4gICcxMDExMCc6IFswLCAwXSwgIC8vIEVsYm93c1xuICAnMTAwMTEnOiBbMiwgMF0sXG4gICcxMTAwMSc6IFs0LCAyXSxcbiAgJzExMTAwJzogWzIsIDNdLFxuICAnMTExMTAnOiBbMSwgMV0sICAvLyBKdW5jdGlvbnNcbiAgJzEwMTExJzogWzEsIDBdLFxuICAnMTEwMTEnOiBbMiwgMV0sXG4gICcxMTEwMSc6IFsxLCAyXSxcbiAgJzExMTExJzogWzIsIDJdLCAgLy8gQ3Jvc3NcbiAgJ251bGwwJzogWzQsIDNdLCAgLy8gRW1wdHlcbiAgJ251bGwxJzogWzMsIDBdLFxuICAnbnVsbDInOiBbMywgMV0sXG4gICdudWxsMyc6IFswLCAzXSxcbiAgJ251bGw0JzogWzEsIDNdLFxufTtcblxuZnVuY3Rpb24gZHJhd01hcCAoKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuICB2YXIgeCwgeSwgaywgdGlsZTtcblxuICAvLyBEcmF3IHRoZSBvdXRlciBzcXVhcmUuXG4gIHZhciBzcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICBzcXVhcmUuc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFaRV9XSURUSCk7XG4gIHNxdWFyZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFaRV9IRUlHSFQpO1xuICBzcXVhcmUuc2V0QXR0cmlidXRlKCdmaWxsJywgJyNGMUVFRTcnKTtcbiAgc3F1YXJlLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgMSk7XG4gIHNxdWFyZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjQ0NCJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChzcXVhcmUpO1xuXG4gIC8vIEFkanVzdCBvdXRlciBlbGVtZW50IHNpemUuXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5NQVpFX1dJRFRIKTtcbiAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5NQVpFX0hFSUdIVCk7XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9IE1hemUuTUFaRV9XSURUSCArICdweCc7XG5cbiAgaWYgKHNraW4uYmFja2dyb3VuZCkge1xuICAgIHRpbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5iYWNrZ3JvdW5kKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5NQVpFX0hFSUdIVCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5NQVpFX1dJRFRIKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneCcsIDApO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd5JywgMCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHRpbGUpO1xuICB9XG5cbiAgZHJhd01hcFRpbGVzKHN2Zyk7XG5cbiAgLy8gUGVnbWFuJ3MgY2xpcFBhdGggZWxlbWVudCwgd2hvc2UgKHgsIHkpIGlzIHJlc2V0IGJ5IE1hemUuZGlzcGxheVBlZ21hblxuICB2YXIgcGVnbWFuQ2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdjbGlwUGF0aCcpO1xuICBwZWdtYW5DbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAncGVnbWFuQ2xpcFBhdGgnKTtcbiAgdmFyIGNsaXBSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCdpZCcsICdjbGlwUmVjdCcpO1xuICBjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5QRUdNQU5fV0lEVEgpO1xuICBjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuUEVHTUFOX0hFSUdIVCk7XG4gIHBlZ21hbkNsaXAuYXBwZW5kQ2hpbGQoY2xpcFJlY3QpO1xuICBzdmcuYXBwZW5kQ2hpbGQocGVnbWFuQ2xpcCk7XG5cbiAgLy8gQWRkIHBlZ21hbi5cbiAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3BlZ21hbicpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAncGVnbWFuLWxvY2F0aW9uJyk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5hdmF0YXIpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5QRUdNQU5fSEVJR0hUKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5QRUdNQU5fV0lEVEggKiAyMSk7IC8vIDQ5ICogMjEgPSAxMDI5XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCNwZWdtYW5DbGlwUGF0aCknKTtcbiAgc3ZnLmFwcGVuZENoaWxkKHBlZ21hbkljb24pO1xuXG4gIHZhciBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2FuaW1hdGUnKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3BlZ21hbkZhZGVvdXRBbmltYXRpb24nKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZVR5cGUnLCAnQ1NTJyk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJywgJ29wYWNpdHknKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2Zyb20nLCAxKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3RvJywgMCk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdkdXInLCAnMXMnKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2JlZ2luJywgJ2luZGVmaW5pdGUnKTtcbiAgcGVnbWFuSWNvbi5hcHBlbmRDaGlsZChwZWdtYW5GYWRlb3V0QW5pbWF0aW9uKTtcblxuICBpZiAoTWF6ZS5maW5pc2hfICYmIHNraW4uZ29hbElkbGUpIHtcbiAgICAvLyBBZGQgZmluaXNoIG1hcmtlci5cbiAgICB2YXIgZmluaXNoTWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gICAgZmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaWQnLCAnZmluaXNoJyk7XG4gICAgZmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdvYWxJZGxlKTtcbiAgICBmaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLk1BUktFUl9IRUlHSFQpO1xuICAgIGZpbmlzaE1hcmtlci5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5NQVJLRVJfV0lEVEgpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChmaW5pc2hNYXJrZXIpO1xuICB9XG5cbiAgLy8gQWRkIHdhbGwgaGl0dGluZyBhbmltYXRpb25cbiAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24pIHtcbiAgICB2YXIgd2FsbEFuaW1hdGlvbkljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3dhbGxBbmltYXRpb24nKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuU1FVQVJFX1NJWkUpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHdhbGxBbmltYXRpb25JY29uKTtcbiAgfVxuXG4gIC8vIEFkZCBvYnN0YWNsZXMuXG4gIHZhciBvYnNJZCA9IDA7XG4gIGZvciAoeSA9IDA7IHkgPCBNYXplLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBNYXplLkNPTFM7IHgrKykge1xuICAgICAgaWYgKE1hemUubWFwW3ldW3hdID09IFNxdWFyZVR5cGUuT0JTVEFDTEUpIHtcbiAgICAgICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFSS0VSX0hFSUdIVCAqIHNraW4ub2JzdGFjbGVTY2FsZSk7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFSS0VSX1dJRFRIICogc2tpbi5vYnN0YWNsZVNjYWxlKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi5vYnN0YWNsZUlkbGUpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoeCArIDAuNSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgneScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoeSArIDAuOSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQob2JzSWNvbik7XG4gICAgICB9XG4gICAgICArK29ic0lkO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZCBpZGxlIHBlZ21hbi5cbiAgaWYgKHNraW4uaWRsZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ2lkbGUnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4uaWRsZVBlZ21hbkFuaW1hdGlvbixcbiAgICAgIHJvdzogTWF6ZS5zdGFydF8ueSxcbiAgICAgIGNvbDogTWF6ZS5zdGFydF8ueCxcbiAgICAgIGRpcmVjdGlvbjogTWF6ZS5zdGFydERpcmVjdGlvbixcbiAgICAgIG51bUNvbFBlZ21hbjogc2tpbi5pZGxlUGVnbWFuQ29sLFxuICAgICAgbnVtUm93UGVnbWFuOiBza2luLmlkbGVQZWdtYW5Sb3dcbiAgICB9KTtcblxuXG4gICAgaWYgKHNraW4uaWRsZVBlZ21hbkNvbCA+IDEgfHwgc2tpbi5pZGxlUGVnbWFuUm93ID4gMSkge1xuICAgICAgLy8gb3VyIGlkbGUgaXMgYSBzcHJpdGUgc2hlZXQgaW5zdGVhZCBvZiBhIGdpZi4gc2NoZWR1bGUgY3ljbGluZyB0aHJvdWdoXG4gICAgICAvLyB0aGUgZnJhbWVzXG4gICAgICB2YXIgbnVtRnJhbWVzID0gc2tpbi5pZGxlUGVnbWFuUm93O1xuICAgICAgdmFyIGlkbGVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lkbGVQZWdtYW4nKTtcbiAgICAgIHZhciB0aW1lUGVyRnJhbWUgPSA2MDA7IC8vIHRpbWVGb3JBbmltYXRpb24gLyBudW1GcmFtZXM7XG4gICAgICB2YXIgaWRsZUFuaW1hdGlvbkZyYW1lID0gMDtcblxuICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpZGxlUGVnbWFuSWNvbi5nZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnKSB7XG4gICAgICAgICAgdXBkYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgICAgICAgIGlkU3RyOiAnaWRsZScsXG4gICAgICAgICAgICByb3c6IE1hemUuc3RhcnRfLnksXG4gICAgICAgICAgICBjb2w6IE1hemUuc3RhcnRfLngsXG4gICAgICAgICAgICBkaXJlY3Rpb246IE1hemUuc3RhcnREaXJlY3Rpb24sXG4gICAgICAgICAgICBhbmltYXRpb25Sb3c6IGlkbGVBbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlkbGVBbmltYXRpb25GcmFtZSA9IChpZGxlQW5pbWF0aW9uRnJhbWUgKyAxKSAlIG51bUZyYW1lcztcbiAgICAgICAgfVxuICAgICAgfSwgdGltZVBlckZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2tpbi5jZWxlYnJhdGVBbmltYXRpb24pIHtcbiAgICBjcmVhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgaWRTdHI6ICdjZWxlYnJhdGUnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4uY2VsZWJyYXRlQW5pbWF0aW9uLFxuICAgICAgcm93OiBNYXplLnN0YXJ0Xy55LFxuICAgICAgY29sOiBNYXplLnN0YXJ0Xy54LFxuICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24uTk9SVEgsXG4gICAgICBudW1Db2xQZWdtYW46IHNraW4uY2VsZWJyYXRlUGVnbWFuQ29sLFxuICAgICAgbnVtUm93UGVnbWFuOiBza2luLmNlbGVicmF0ZVBlZ21hblJvd1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBoaWRkZW4gZGF6ZWQgcGVnbWFuIHdoZW4gaGl0dGluZyB0aGUgd2FsbC5cbiAgaWYgKHNraW4ud2FsbFBlZ21hbkFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ3dhbGwnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4ud2FsbFBlZ21hbkFuaW1hdGlvblxuICAgIH0pO1xuICB9XG5cbiAgLy8gY3JlYXRlIGVsZW1lbnQgZm9yIG91ciBoaXR0aW5nIHdhbGwgc3ByaXRlc2hlZXRcbiAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24gJiYgc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbkZyYW1lTnVtYmVyKSB7XG4gICAgY3JlYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgIGlkU3RyOiAnd2FsbCcsXG4gICAgICBwZWdtYW5JbWFnZTogc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbixcbiAgICAgIG51bUNvbFBlZ21hbjogc2tpbi5oaXR0aW5nV2FsbFBlZ21hbkNvbCxcbiAgICAgIG51bVJvd1BlZ21hbjogc2tpbi5oaXR0aW5nV2FsbFBlZ21hblJvd1xuICAgIH0pO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsUGVnbWFuJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBoaWRkZW4gbW92aW5nIHBlZ21hbiBhbmltYXRpb24uXG4gIGlmIChza2luLm1vdmVQZWdtYW5BbmltYXRpb24pIHtcbiAgICBjcmVhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgaWRTdHI6ICdtb3ZlJyxcbiAgICAgIHBlZ21hbkltYWdlOiBza2luLm1vdmVQZWdtYW5BbmltYXRpb24sXG4gICAgICBudW1Db2xQZWdtYW46IDQsXG4gICAgICBudW1Sb3dQZWdtYW46IDlcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRpbGUgYXQgeCx5IGlzIGVpdGhlciBhIHdhbGwgb3Igb3V0IG9mIGJvdW5kc1xuZnVuY3Rpb24gaXNXYWxsT3JPdXRPZkJvdW5kcyAoeCwgeSkge1xuICByZXR1cm4gTWF6ZS5tYXBbeV0gPT09IHVuZGVmaW5lZCB8fCBNYXplLm1hcFt5XVt4XSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgTWF6ZS5tYXBbeV1beF0gPT09IFNxdWFyZVR5cGUuV0FMTDtcbn1cblxuLy8gUmV0dXJuIGEgdmFsdWUgb2YgJzAnIGlmIHRoZSBzcGVjaWZpZWQgc3F1YXJlIGlzIHdhbGwgb3Igb3V0IG9mIGJvdW5kcyAnMSdcbi8vIG90aGVyd2lzZSAoZW1wdHksIG9ic3RhY2xlLCBzdGFydCwgZmluaXNoKS5cbmZ1bmN0aW9uIGlzT25QYXRoU3RyICh4LCB5KSB7XG4gIHJldHVybiBpc1dhbGxPck91dE9mQm91bmRzKHgsIHkpID8gXCIwXCIgOiBcIjFcIjtcbn1cblxuLy8gRHJhdyB0aGUgdGlsZXMgbWFraW5nIHVwIHRoZSBtYXplIG1hcC5cbmZ1bmN0aW9uIGRyYXdNYXBUaWxlcyhzdmcpIHtcbiAgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgIHJldHVybiBNYXplLndvcmRTZWFyY2guZHJhd01hcFRpbGVzKHN2Zyk7XG4gIH0gZWxzZSBpZiAobWF6ZVV0aWxzLmlzU2NyYXRTa2luKHNraW4uaWQpKSB7XG4gICAgcmV0dXJuIHNjcmF0LmRyYXdNYXBUaWxlcyhzdmcpO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSBhbmQgZHJhdyB0aGUgdGlsZSBmb3IgZWFjaCBzcXVhcmUuXG4gIHZhciB0aWxlSWQgPSAwO1xuICB2YXIgdGlsZSwgb3JpZ1RpbGU7XG4gIGZvciAodmFyIHkgPSAwOyB5IDwgTWF6ZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IE1hemUuQ09MUzsgeCsrKSB7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgdGlsZSA9IGlzT25QYXRoU3RyKHgsIHkpICtcbiAgICAgICAgaXNPblBhdGhTdHIoeCwgeSAtIDEpICsgIC8vIE5vcnRoLlxuICAgICAgICBpc09uUGF0aFN0cih4ICsgMSwgeSkgKyAgLy8gV2VzdC5cbiAgICAgICAgaXNPblBhdGhTdHIoeCwgeSArIDEpICsgIC8vIFNvdXRoLlxuICAgICAgICBpc09uUGF0aFN0cih4IC0gMSwgeSk7ICAgLy8gRWFzdC5cblxuICAgICAgdmFyIGFkamFjZW50VG9QYXRoID0gKHRpbGUgIT09ICcwMDAwMCcpO1xuXG4gICAgICAvLyBEcmF3IHRoZSB0aWxlLlxuICAgICAgaWYgKCFUSUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICAvLyBXZSBoYXZlIGFuIGVtcHR5IHNxdWFyZS4gSGFuZGxlIGl0IGRpZmZlcmVudGx5IGJhc2VkIG9uIHNraW4uXG4gICAgICAgIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKHNraW4uaWQpKSB7XG4gICAgICAgICAgLy8gYmVnaW4gd2l0aCB0aHJlZSB0cmVlc1xuICAgICAgICAgIHZhciB0aWxlQ2hvaWNlcyA9IFsnbnVsbDMnLCAnbnVsbDQnLCAnbnVsbDAnXTtcbiAgICAgICAgICB2YXIgbm9UcmVlID0gJ251bGwxJztcbiAgICAgICAgICAvLyB3YW50IGl0IHRvIGJlIG1vcmUgbGlrZWx5IHRvIGhhdmUgYSB0cmVlIHdoZW4gYWRqYWNlbnQgdG8gcGF0aFxuICAgICAgICAgIHZhciBuID0gYWRqYWNlbnRUb1BhdGggPyB0aWxlQ2hvaWNlcy5sZW5ndGggKiAyIDogdGlsZUNob2ljZXMubGVuZ3RoICogNjtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdGlsZUNob2ljZXMucHVzaChub1RyZWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRpbGUgPSBfLnNhbXBsZSh0aWxlQ2hvaWNlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRW1wdHkgc3F1YXJlLiAgVXNlIG51bGwwIGZvciBsYXJnZSBhcmVhcywgd2l0aCBudWxsMS00IGZvciBib3JkZXJzLlxuICAgICAgICAgIGlmICghYWRqYWNlbnRUb1BhdGggJiYgTWF0aC5yYW5kb20oKSA+IDAuMykge1xuICAgICAgICAgICAgTWF6ZS53YWxsTWFwW3ldW3hdID0gMDtcbiAgICAgICAgICAgIHRpbGUgPSAnbnVsbDAnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgd2FsbElkeCA9IE1hdGguZmxvb3IoMSArIE1hdGgucmFuZG9tKCkgKiA0KTtcbiAgICAgICAgICAgIE1hemUud2FsbE1hcFt5XVt4XSA9IHdhbGxJZHg7XG4gICAgICAgICAgICB0aWxlID0gJ251bGwnICsgd2FsbElkeDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGb3IgdGhlIGZpcnN0IDMgbGV2ZWxzIGluIG1hemUsIG9ubHkgc2hvdyB0aGUgbnVsbDAgaW1hZ2UuXG4gICAgICAgICAgaWYgKGxldmVsLmlkID09ICcyXzEnIHx8IGxldmVsLmlkID09ICcyXzInIHx8IGxldmVsLmlkID09ICcyXzMnKSB7XG4gICAgICAgICAgICBNYXplLndhbGxNYXBbeV1beF0gPSAwO1xuICAgICAgICAgICAgdGlsZSA9ICdudWxsMCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE1hemUuZHJhd1RpbGUoc3ZnLCBUSUxFX1NIQVBFU1t0aWxlXSwgeSwgeCwgdGlsZUlkKTtcblxuICAgICAgLy8gRHJhdyBjaGVja2VyYm9hcmQgZm9yIGJlZS5cbiAgICAgIGlmIChNYXplLmdyaWRJdGVtRHJhd2VyIGluc3RhbmNlb2YgQmVlSXRlbURyYXdlciAmJiAoeCArIHkpICUgMiA9PT0gMCkge1xuICAgICAgICB2YXIgaXNQYXRoID0gIS9udWxsLy50ZXN0KHRpbGUpO1xuICAgICAgICBNYXplLmdyaWRJdGVtRHJhd2VyLmFkZENoZWNrZXJib2FyZFRpbGUoeSwgeCwgaXNQYXRoKTtcbiAgICAgIH1cblxuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRHJhdyB0aGUgZ2l2ZW4gdGlsZSBhdCByb3csIGNvbFxuICovXG5NYXplLmRyYXdUaWxlID0gZnVuY3Rpb24gKHN2ZywgdGlsZVNoZWV0TG9jYXRpb24sIHJvdywgY29sLCB0aWxlSWQpIHtcbiAgdmFyIGxlZnQgPSB0aWxlU2hlZXRMb2NhdGlvblswXTtcbiAgdmFyIHRvcCA9IHRpbGVTaGVldExvY2F0aW9uWzFdO1xuXG4gIHZhciB0aWxlU2hlZXRXaWR0aCA9IE1hemUuU1FVQVJFX1NJWkUgKiA1O1xuICB2YXIgdGlsZVNoZWV0SGVpZ2h0ID0gTWF6ZS5TUVVBUkVfU0laRSAqIDQ7XG5cbiAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gIHZhciB0aWxlQ2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdjbGlwUGF0aCcpO1xuICB0aWxlQ2xpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQpO1xuICB2YXIgdGlsZUNsaXBSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlNRVUFSRV9TSVpFKTtcbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5TUVVBUkVfU0laRSk7XG5cbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIE1hemUuU1FVQVJFX1NJWkUpO1xuICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd5Jywgcm93ICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHRpbGVDbGlwLmFwcGVuZENoaWxkKHRpbGVDbGlwUmVjdCk7XG4gIHN2Zy5hcHBlbmRDaGlsZCh0aWxlQ2xpcCk7XG5cbiAgLy8gVGlsZSBzcHJpdGUuXG4gIHZhciB0aWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLnRpbGVzKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aWxlU2hlZXRIZWlnaHQpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGlsZVNoZWV0V2lkdGgpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAndXJsKCN0aWxlQ2xpcFBhdGgnICsgdGlsZUlkICsgJyknKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd4JywgKGNvbCAtIGxlZnQpICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgneScsIChyb3cgLSB0b3ApICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHN2Zy5hcHBlbmRDaGlsZCh0aWxlRWxlbWVudCk7XG4gIC8vIFRpbGUgYW5pbWF0aW9uXG4gIHZhciB0aWxlQW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2FuaW1hdGUnKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVBbmltYXRpb24nICsgdGlsZUlkKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZVR5cGUnLCAnQ1NTJyk7XG4gIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJywgJ29wYWNpdHknKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2Zyb20nLCAxKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3RvJywgMCk7XG4gIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdkdXInLCAnMXMnKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2JlZ2luJywgJ2luZGVmaW5pdGUnKTtcbiAgdGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGlsZUFuaW1hdGlvbik7XG59O1xuXG5mdW5jdGlvbiByZXNldERpcnQoKSB7XG4gIGlmICghTWF6ZS5pbml0aWFsRGlydE1hcCkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBMb2NhdGUgdGhlIGRpcnQgaW4gZGlydF9tYXBcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLlJPV1M7IHkrKykge1xuICAgIE1hemUuZGlydF9beV0gPSBNYXplLmluaXRpYWxEaXJ0TWFwW3ldLnNsaWNlKDApO1xuICB9XG59XG5cbi8qKlxuICogUmVkcmF3IGFsbCBkaXJ0IGltYWdlc1xuICogQHBhcmFtIHtib29sZWFufSBydW5uaW5nIFdoZXRoZXIgb3Igbm90IHVzZXIgcHJvZ3JhbSBpcyBjdXJyZW50bHkgcnVubmluZ1xuICovXG5mdW5jdGlvbiByZXNldERpcnRJbWFnZXMocnVubmluZykge1xuICB2YXIgeCA9IDE7XG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IE1hemUuUk9XUzsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBNYXplLkNPTFM7IGNvbCsrKSB7XG4gICAgICBpZiAoZ2V0VGlsZShNYXplLmRpcnRfLCBjb2wsIHJvdykgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBNYXplLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgcnVubmluZyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgbWF6ZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbk1hemUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucnVuQnV0dG9uQ2xpY2sgPSB0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5yZXNldCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcblxuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IG51bGw7XG5cbiAgc2tpbiA9IGNvbmZpZy5za2luO1xuICBsZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBjb25maWcuZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzID0gdHJ1ZTtcbiAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2sgPSAnd2hlbl9ydW4nO1xuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG5cbiAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oY29uZmlnLnNraW5JZCkpIHtcbiAgICBNYXplLmJlZSA9IG5ldyBCZWUoTWF6ZSwgc3R1ZGlvQXBwLCBjb25maWcpO1xuICAgIC8vIE92ZXJyaWRlIGRlZmF1bHQgc3RlcFNwZWVkXG4gICAgTWF6ZS5zY2FsZS5zdGVwU3BlZWQgPSAyO1xuICB9IGVsc2UgaWYgKGNvbmZpZy5za2luSWQgPT09ICdsZXR0ZXJzJykge1xuICAgIE1hemUud29yZFNlYXJjaCA9IG5ldyBXb3JkU2VhcmNoKGxldmVsLnNlYXJjaFdvcmQsIGxldmVsLm1hcCwgTWF6ZS5kcmF3VGlsZSk7XG4gICAgZXh0cmFDb250cm9sUm93cyA9IHJlcXVpcmUoJy4vZXh0cmFDb250cm9sUm93cy5odG1sLmVqcycpKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBzZWFyY2hXb3JkOiBsZXZlbC5zZWFyY2hXb3JkXG4gICAgfSk7XG4gIH1cblxuICBsb2FkTGV2ZWwoKTtcblxuICBNYXplLmNhY2hlZEJsb2NrU3RhdGVzID0gW107XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgICBzaG93U3RlcEJ1dHRvbjogbGV2ZWwuc3RlcCAmJiAhbGV2ZWwuZWRpdF9ibG9ja3NcbiAgICAgIH0pLFxuICAgICAgZXh0cmFDb250cm9sUm93czogZXh0cmFDb250cm9sUm93cyxcbiAgICAgIGJsb2NrVXNlZDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlcjogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3M6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH0sXG4gICAgaGlkZVJ1bkJ1dHRvbjogbGV2ZWwuc3RlcE9ubHkgJiYgIWxldmVsLmVkaXRfYmxvY2tzXG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ub2JzdGFjbGVTb3VuZCwgJ29ic3RhY2xlJyk7XG4gICAgLy8gTG9hZCB3YWxsIHNvdW5kcy5cbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbFNvdW5kLCAnd2FsbCcpO1xuXG4gICAgLy8gdG9kbyAtIGxvbmd0ZXJtLCBpbnN0ZWFkIG9mIGhhdmluZyBzb3VuZCByZWxhdGVkIGZsYWdzIHdlIHNob3VsZCBqdXN0XG4gICAgLy8gaGF2ZSB0aGUgc2tpbiB0ZWxsIHVzIHRoZSBzZXQgb2Ygc291bmRzIGl0IG5lZWRzXG4gICAgaWYgKHNraW4uYWRkaXRpb25hbFNvdW5kKSB7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDBTb3VuZCwgJ3dhbGwwJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDFTb3VuZCwgJ3dhbGwxJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDJTb3VuZCwgJ3dhbGwyJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDNTb3VuZCwgJ3dhbGwzJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDRTb3VuZCwgJ3dhbGw0Jyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luR29hbFNvdW5kLCAnd2luR29hbCcpO1xuICAgIH1cbiAgICBpZiAoc2tpbi5kaXJ0U291bmQpIHtcbiAgICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5maWxsU291bmQsICdmaWxsJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZGlnU291bmQsICdkaWcnKTtcbiAgICB9XG4gICAgaWYgKHNraW4uYmVlU291bmQpIHtcbiAgICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5uZWN0YXJTb3VuZCwgJ25lY3RhcicpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmhvbmV5U291bmQsICdob25leScpO1xuICAgIH1cbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3R1ZGlvQXBwLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHJpY2huZXNzIG9mIGJsb2NrIGNvbG91cnMsIHJlZ2FyZGxlc3Mgb2YgdGhlIGh1ZS5cbiAgICAgICAqIE1PT0MgYmxvY2tzIHNob3VsZCBiZSBicmlnaHRlciAodGFyZ2V0IGF1ZGllbmNlIGlzIHlvdW5nZXIpLlxuICAgICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAgICogQmxvY2tseSdzIGRlZmF1bHQgaXMgMC40NS5cbiAgICAgICAqL1xuICAgICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgICAgQmxvY2tseS5TTkFQX1JBRElVUyAqPSBNYXplLnNjYWxlLnNuYXBSYWRpdXM7XG4gICAgICBCbG9ja2x5LkphdmFTY3JpcHQuSU5GSU5JVEVfTE9PUF9UUkFQID0gY29kZWdlbi5sb29wSGlnaGxpZ2h0KFwiTWF6ZVwiKTtcbiAgICB9XG5cbiAgICBNYXplLnN0YXJ0XyA9IHVuZGVmaW5lZDtcbiAgICBNYXplLmZpbmlzaF8gPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBMb2NhdGUgdGhlIHN0YXJ0IGFuZCBmaW5pc2ggc3F1YXJlcy5cbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IE1hemUuUk9XUzsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IE1hemUuQ09MUzsgeCsrKSB7XG4gICAgICAgIHZhciBjZWxsID0gTWF6ZS5tYXBbeV1beF07XG4gICAgICAgIGlmIChjZWxsID09IFNxdWFyZVR5cGUuU1RBUlQpIHtcbiAgICAgICAgICBNYXplLnN0YXJ0XyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfSBlbHNlIGlmIChjZWxsID09PSBTcXVhcmVUeXBlLkZJTklTSCkge1xuICAgICAgICAgIE1hemUuZmluaXNoXyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfSBlbHNlIGlmIChjZWxsID09IFNxdWFyZVR5cGUuU1RBUlRBTkRGSU5JU0gpIHtcbiAgICAgICAgICBNYXplLnN0YXJ0XyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgICBNYXplLmZpbmlzaF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldERpcnQoKTtcblxuICAgIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKGNvbmZpZy5za2luSWQpKSB7XG4gICAgICBNYXplLmdyaWRJdGVtRHJhd2VyID0gbmV3IEJlZUl0ZW1EcmF3ZXIoTWF6ZS5kaXJ0Xywgc2tpbiwgTWF6ZS5iZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBNYXplLmdyaWRJdGVtRHJhd2VyID0gbmV3IERpcnREcmF3ZXIoTWF6ZS5kaXJ0Xywgc2tpbi5kaXJ0KTtcbiAgICB9XG5cbiAgICBkcmF3TWFwKCk7XG5cbiAgICB2YXIgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGVwQnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChzdGVwQnV0dG9uLCBzdGVwQnV0dG9uQ2xpY2spO1xuXG4gICAgLy8gYmFzZSdzIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmUgY2FsbGVkIGZpcnN0XG4gICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChyZXNldEJ1dHRvbiwgTWF6ZS5yZXNldEJ1dHRvbkNsaWNrKTtcblxuICAgIGlmIChza2luLmhpZGVJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnViYmxlXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gIH07XG5cbiAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIGEgY2xpY2sgb24gdGhlIHN0ZXAgYnV0dG9uLiAgSWYgd2UncmUgYWxyZWFkeSBhbmltYXRpbmcsIHdlIHNob3VsZFxuICogcGVyZm9ybSBhIHNpbmdsZSBzdGVwLiAgT3RoZXJ3aXNlLCB3ZSBjYWxsIGJlZ2luQXR0ZW1wdCB3aGljaCB3aWxsIGRvXG4gKiBzb21lIGluaXRpYWwgc2V0dXAsIGFuZCB0aGVuIHBlcmZvcm0gdGhlIGZpcnN0IHN0ZXAuXG4gKi9cbmZ1bmN0aW9uIHN0ZXBCdXR0b25DbGljaygpIHtcbiAgdmFyIHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpO1xuICBzdGVwQnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG5cbiAgaWYgKE1hemUuYW5pbWF0aW5nXykge1xuICAgIE1hemUuc2NoZWR1bGVBbmltYXRpb25zKHRydWUpO1xuICB9IGVsc2Uge1xuICAgIE1hemUuZXhlY3V0ZSh0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgeSBjb29yZGluYXRlcyBmb3IgcGVnbWFuIHNwcml0ZS5cbiAqL1xudmFyIGdldFBlZ21hbllGb3JSb3cgPSBmdW5jdGlvbiAobWF6ZVJvdykge1xuICB2YXIgeSA9IE1hemUuU1FVQVJFX1NJWkUgKiAobWF6ZVJvdyArIDAuNSkgLSBNYXplLlBFR01BTl9IRUlHSFQgLyAyICtcbiAgICBNYXplLlBFR01BTl9ZX09GRlNFVDtcbiAgcmV0dXJuIE1hdGguZmxvb3IoeSk7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgWSBvZmZzZXQgd2l0aGluIHRoZSBzaGVldFxuICovXG52YXIgZ2V0UGVnbWFuRnJhbWVPZmZzZXRZID0gZnVuY3Rpb24gKGFuaW1hdGlvblJvdykge1xuICBhbmltYXRpb25Sb3cgPSBhbmltYXRpb25Sb3cgfHwgMDtcbiAgcmV0dXJuIGFuaW1hdGlvblJvdyAqIE1hemUuUEVHTUFOX0hFSUdIVDtcbn07XG5cbi8qKlxuICAqIENyZWF0ZSBzcHJpdGUgYXNzZXRzIGZvciBwZWdtYW4uXG4gICogQHBhcmFtIG9wdGlvbnMgU3BlY2lmeSBkaWZmZXJlbnQgZmVhdHVyZXMgb2YgdGhlIHBlZ21hbiBhbmltYXRpb24uXG4gICogaWRTdHIgcmVxdWlyZWQgaWRlbnRpZmllciBmb3IgdGhlIHBlZ21hbi5cbiAgKiBwZWdtYW5JbWFnZSByZXF1aXJlZCB3aGljaCBpbWFnZSB0byB1c2UgZm9yIHRoZSBhbmltYXRpb24uXG4gICogY29sIHdoaWNoIGNvbHVtbiB0aGUgcGVnbWFuIGlzIGF0LlxuICAqIHJvdyB3aGljaCByb3cgdGhlIHBlZ21hbiBpcyBhdC5cbiAgKiBkaXJlY3Rpb24gd2hpY2ggZGlyZWN0aW9uIHRoZSBwZWdtYW4gaXMgZmFjaW5nIGF0LlxuICAqIG51bUNvbFBlZ21hbiBudW1iZXIgb2YgdGhlIHBlZ21hbiBpbiBlYWNoIHJvdywgZGVmYXVsdCBpcyA0LlxuICAqIG51bVJvd1BlZ21hbiBudW1iZXIgb2YgdGhlIHBlZ21hbiBpbiBlYWNoIGNvbHVtbiwgZGVmYXVsdCBpcyAxLlxuICAqL1xudmFyIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIC8vIENyZWF0ZSBjbGlwIHBhdGguXG4gIHZhciBjbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2NsaXBQYXRoJyk7XG4gIGNsaXAuc2V0QXR0cmlidXRlKCdpZCcsIG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuQ2xpcCcpO1xuICB2YXIgcmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdyZWN0Jyk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdpZCcsIG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuQ2xpcFJlY3QnKTtcbiAgaWYgKG9wdGlvbnMuY29sICE9PSB1bmRlZmluZWQpIHtcbiAgICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIG9wdGlvbnMuY29sICogTWF6ZS5TUVVBUkVfU0laRSArIDEgKyBNYXplLlBFR01BTl9YX09GRlNFVCk7XG4gIH1cbiAgaWYgKG9wdGlvbnMucm93ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZWN0LnNldEF0dHJpYnV0ZSgneScsIGdldFBlZ21hbllGb3JSb3cob3B0aW9ucy5yb3cpKTtcbiAgfVxuICByZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlBFR01BTl9XSURUSCk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlBFR01BTl9IRUlHSFQpO1xuICBjbGlwLmFwcGVuZENoaWxkKHJlY3QpO1xuICBzdmcuYXBwZW5kQ2hpbGQoY2xpcCk7XG4gIC8vIENyZWF0ZSBpbWFnZS5cbiAgdmFyIGltZ1NyYyA9IG9wdGlvbnMucGVnbWFuSW1hZ2U7XG4gIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgaW1nLnNldEF0dHJpYnV0ZU5TKFxuICAgICAgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsIGltZ1NyYyk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuUEVHTUFOX0hFSUdIVCAqIChvcHRpb25zLm51bVJvd1BlZ21hbiB8fCAxKSk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5QRUdNQU5fV0lEVEggKiAob3B0aW9ucy5udW1Db2xQZWdtYW4gfHwgNCkpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgb3B0aW9ucy5pZFN0ciArICdQZWdtYW5DbGlwKScpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdpZCcsIG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChpbWcpO1xuICAvLyBVcGRhdGUgcGVnbWFuIGljb24gJiBjbGlwIHBhdGguXG4gIGlmIChvcHRpb25zLmNvbCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgeCA9IE1hemUuU1FVQVJFX1NJWkUgKiBvcHRpb25zLmNvbCAtXG4gICAgICBvcHRpb25zLmRpcmVjdGlvbiAqIE1hemUuUEVHTUFOX1dJRFRIICsgMSAgKyBNYXplLlBFR01BTl9YX09GRlNFVDtcbiAgICBpbWcuc2V0QXR0cmlidXRlKCd4JywgeCk7XG4gIH1cbiAgaWYgKG9wdGlvbnMucm93ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbWcuc2V0QXR0cmlidXRlKCd5JywgZ2V0UGVnbWFuWUZvclJvdyhvcHRpb25zLnJvdykpO1xuICB9XG59O1xuXG4vKipcbiAgKiBVcGRhdGUgc3ByaXRlIGFzc2V0cyBmb3IgcGVnbWFuLlxuICAqIEBwYXJhbSBvcHRpb25zIFNwZWNpZnkgZGlmZmVyZW50IGZlYXR1cmVzIG9mIHRoZSBwZWdtYW4gYW5pbWF0aW9uLlxuICAqIGlkU3RyIHJlcXVpcmVkIGlkZW50aWZpZXIgZm9yIHRoZSBwZWdtYW4uXG4gICogY29sIHJlcXVpcmVkIHdoaWNoIGNvbHVtbiB0aGUgcGVnbWFuIGlzIGF0LlxuICAqIHJvdyByZXF1aXJlZCB3aGljaCByb3cgdGhlIHBlZ21hbiBpcyBhdC5cbiAgKiBkaXJlY3Rpb24gcmVxdWlyZWQgd2hpY2ggZGlyZWN0aW9uIHRoZSBwZWdtYW4gaXMgZmFjaW5nIGF0LlxuICAqIGFuaW1hdGlvblJvdyB3aGljaCByb3cgb2YgdGhlIHNwcml0ZSBzaGVldCB0aGUgcGVnbWFuIGFuaW1hdGlvbiBuZWVkc1xuICAqL1xudmFyIHVwZGF0ZVBlZ21hbkFuaW1hdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHJlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRpb25zLmlkU3RyICsgJ1BlZ21hbkNsaXBSZWN0Jyk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd4Jywgb3B0aW9ucy5jb2wgKiBNYXplLlNRVUFSRV9TSVpFICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCBnZXRQZWdtYW5ZRm9yUm93KG9wdGlvbnMucm93KSk7XG4gIHZhciBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRpb25zLmlkU3RyICsgJ1BlZ21hbicpO1xuICB2YXIgeCA9IE1hemUuU1FVQVJFX1NJWkUgKiBvcHRpb25zLmNvbCAtXG4gICAgICBvcHRpb25zLmRpcmVjdGlvbiAqIE1hemUuUEVHTUFOX1dJRFRIICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUO1xuICBpbWcuc2V0QXR0cmlidXRlKCd4JywgeCk7XG4gIHZhciB5ID0gZ2V0UGVnbWFuWUZvclJvdyhvcHRpb25zLnJvdykgLSBnZXRQZWdtYW5GcmFtZU9mZnNldFkob3B0aW9ucy5hbmltYXRpb25Sb3cpO1xuICBpbWcuc2V0QXR0cmlidXRlKCd5JywgeSk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgbWF6ZSB0byB0aGUgc3RhcnQgcG9zaXRpb24gYW5kIGtpbGwgYW55IHBlbmRpbmcgYW5pbWF0aW9uIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBmaXJzdCBUcnVlIGlmIGFuIG9wZW5pbmcgYW5pbWF0aW9uIGlzIHRvIGJlIHBsYXllZC5cbiAqL1xuTWF6ZS5yZXNldCA9IGZ1bmN0aW9uKGZpcnN0KSB7XG4gIGlmIChNYXplLmJlZSkge1xuICAgIC8vIEJlZSBuZWVkcyB0byByZXNldCBpdHNlbGYgYW5kIHN0aWxsIHJ1biBzdHVkaW9BcHAucmVzZXQgbG9naWNcbiAgICBNYXplLmJlZS5yZXNldCgpO1xuICB9XG5cbiAgdmFyIGk7XG4gIC8vIEtpbGwgYWxsIHRhc2tzLlxuICB0aW1lb3V0TGlzdC5jbGVhclRpbWVvdXRzKCk7XG5cbiAgTWF6ZS5hbmltYXRpbmdfID0gZmFsc2U7XG5cbiAgLy8gTW92ZSBQZWdtYW4gaW50byBwb3NpdGlvbi5cbiAgTWF6ZS5wZWdtYW5YID0gTWF6ZS5zdGFydF8ueDtcbiAgTWF6ZS5wZWdtYW5ZID0gTWF6ZS5zdGFydF8ueTtcblxuICBNYXplLnBlZ21hbkQgPSBNYXplLnN0YXJ0RGlyZWN0aW9uO1xuICBpZiAoZmlyc3QpIHtcbiAgICAvLyBEYW5jZSBjb25zaXN0cyBvZiA1IGFuaW1hdGlvbnMsIGVhY2ggb2Ygd2hpY2ggZ2V0IDE1MG1zXG4gICAgdmFyIGRhbmNlVGltZSA9IDE1MCAqIDU7XG4gICAgaWYgKHNraW4uZGFuY2VPbkxvYWQpIHtcbiAgICAgIHNjaGVkdWxlRGFuY2UoZmFsc2UsIGRhbmNlVGltZSk7XG4gICAgfVxuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBzdGVwU3BlZWQgPSAxMDA7XG4gICAgICBNYXplLnNjaGVkdWxlVHVybihNYXplLnN0YXJ0RGlyZWN0aW9uKTtcbiAgICB9LCBkYW5jZVRpbWUgKyAxNTApO1xuICB9IGVsc2Uge1xuICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgdGlsZXMuZGlyZWN0aW9uVG9GcmFtZShNYXplLnBlZ21hbkQpKTtcbiAgfVxuXG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuXG4gIHZhciBmaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmlzaCcpO1xuICBpZiAoZmluaXNoSWNvbikge1xuICAgIC8vIE1vdmUgdGhlIGZpbmlzaCBpY29uIGludG8gcG9zaXRpb24uXG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLCBNYXplLlNRVUFSRV9TSVpFICogKE1hemUuZmluaXNoXy54ICsgMC41KSAtXG4gICAgICBmaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlKCd5JywgTWF6ZS5TUVVBUkVfU0laRSAqIChNYXplLmZpbmlzaF8ueSArIDAuOSkgLVxuICAgICAgZmluaXNoSWNvbi5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcbiAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgc2tpbi5nb2FsSWRsZSk7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICB9XG5cbiAgLy8gTWFrZSAnbG9vaycgaWNvbiBpbnZpc2libGUgYW5kIHByb21vdGUgdG8gdG9wLlxuICB2YXIgbG9va0ljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9vaycpO1xuICBsb29rSWNvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBsb29rSWNvbi5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGxvb2tJY29uKTtcbiAgdmFyIHBhdGhzID0gbG9va0ljb24uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhdGgnKTtcbiAgZm9yIChpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgc2tpbi5sb29rKTtcbiAgfVxuXG4gIC8vIFJlc2V0IHBlZ21hbidzIHZpc2liaWxpdHkuXG4gIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIDEpO1xuXG4gIGlmIChza2luLmlkbGVQZWdtYW5BbmltYXRpb24pIHtcbiAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICB2YXIgaWRsZVBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWRsZVBlZ21hbicpO1xuICAgIGlkbGVQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIH0gZWxzZSB7XG4gICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICB9XG5cbiAgaWYgKHNraW4ud2FsbFBlZ21hbkFuaW1hdGlvbikge1xuICAgIHZhciB3YWxsUGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsUGVnbWFuJyk7XG4gICAgd2FsbFBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgaWYgKHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIHZhciBtb3ZlUGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb3ZlUGVnbWFuJyk7XG4gICAgbW92ZVBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgaWYgKHNraW4uY2VsZWJyYXRlQW5pbWF0aW9uKSB7XG4gICAgdmFyIGNlbGVicmF0ZUFuaW1hdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZWxlYnJhdGVQZWdtYW4nKTtcbiAgICBjZWxlYnJhdGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgLy8gTW92ZSB0aGUgaW5pdCBkaXJ0IG1hcmtlciBpY29ucyBpbnRvIHBvc2l0aW9uLlxuICByZXNldERpcnQoKTtcbiAgcmVzZXREaXJ0SW1hZ2VzKGZhbHNlKTtcblxuICAvLyBSZXNldCB0aGUgb2JzdGFjbGUgaW1hZ2UuXG4gIHZhciBvYnNJZCA9IDA7XG4gIHZhciB4LCB5O1xuICBmb3IgKHkgPSAwOyB5IDwgTWF6ZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHggPSAwOyB4IDwgTWF6ZS5DT0xTOyB4KyspIHtcbiAgICAgIHZhciBvYnNJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICAgIGlmIChvYnNJY29uKSB7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5vYnN0YWNsZUlkbGUpO1xuICAgICAgfVxuICAgICAgKytvYnNJZDtcbiAgICB9XG4gIH1cblxuICBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgTWF6ZS53b3JkU2VhcmNoLnJlc2V0VGlsZXMoKTtcbiAgfSBlbHNlIHtcbiAgICByZXNldFRpbGVzKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlc2V0VGlsZXMoKSB7XG4gIC8vIFJlc2V0IHRoZSB0aWxlc1xuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLlJPV1M7IHkrKykge1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgTWF6ZS5DT0xTOyB4KyspIHtcbiAgICAgIC8vIFRpbGUncyBjbGlwUGF0aCBlbGVtZW50LlxuICAgICAgdmFyIHRpbGVDbGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQpO1xuICAgICAgdGlsZUNsaXAuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi50aWxlcyk7XG4gICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxKTtcbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbi8vIFhYWCBUaGlzIGlzIHRoZSBvbmx5IG1ldGhvZCB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZXMhXG5NYXplLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKTtcbiAgaWYgKHN0ZXBCdXR0b24pIHtcbiAgICBzdGVwQnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gIH1cbiAgTWF6ZS5leGVjdXRlKGZhbHNlKTtcbn07XG5cbmZ1bmN0aW9uIGJlZ2luQXR0ZW1wdCAoKSB7XG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyByZXNldCBidXR0b24gY2xpY2sgbG9naWMuICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlXG4gKiBjYWxsZWQgZmlyc3QuXG4gKi9cbk1hemUucmVzZXRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpO1xuICBzdGVwQnV0dG9uLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICByZWVuYWJsZUNhY2hlZEJsb2NrU3RhdGVzKCk7XG59O1xuXG5mdW5jdGlvbiByZWVuYWJsZUNhY2hlZEJsb2NrU3RhdGVzICgpIHtcbiAgaWYgKE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMpIHtcbiAgICAvLyByZXN0b3JlIG1vdmVhYmxlL2RlbGV0YWJsZS9lZGl0YWJsZSBzdGF0ZSBmcm9tIGJlZm9yZSB3ZSBzdGFydGVkIHN0ZXBwaW5nXG4gICAgTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWNoZWQpIHtcbiAgICAgIGNhY2hlZC5ibG9jay5zZXRNb3ZhYmxlKGNhY2hlZC5tb3ZhYmxlKTtcbiAgICAgIGNhY2hlZC5ibG9jay5zZXREZWxldGFibGUoY2FjaGVkLmRlbGV0YWJsZSk7XG4gICAgICBjYWNoZWQuYmxvY2suc2V0RWRpdGFibGUoY2FjaGVkLmVkaXRhYmxlKTtcbiAgICB9KTtcbiAgICBNYXplLmNhY2hlZEJsb2NrU3RhdGVzID0gW107XG4gIH1cbn1cblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbnZhciBkaXNwbGF5RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKE1hemUud2FpdGluZ0ZvclJlcG9ydCB8fCBNYXplLmFuaW1hdGluZ18pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgYXBwOiAnbWF6ZScsIC8vWFhYXG4gICAgc2tpbjogc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IE1hemUudGVzdFJlc3VsdHMsXG4gICAgcmVzcG9uc2U6IE1hemUucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH07XG4gIC8vIElmIHRoZXJlIHdhcyBhbiBhcHAtc3BlY2lmaWMgZXJyb3IgKGN1cnJlbnRseSBvbmx5IHBvc3NpYmxlIGZvciBCZWUpLFxuICAvLyBhZGQgaXQgdG8gdGhlIG9wdGlvbnMgcGFzc2VkIHRvIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soKS5cbiAgaWYgKE1hemUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMICYmXG4gICAgICBNYXplLmJlZSkge1xuICAgIHZhciBtZXNzYWdlID0gTWF6ZS5iZWUuZ2V0TWVzc2FnZShNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpKTtcbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgb3B0aW9ucy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gIH1cbiAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayhvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbk1hemUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIE1hemUucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgTWF6ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBiYXNpYyBpbml0aWFsaXphdGlvbi9yZXNldHRpbmcgb3BlcmF0aW9ucyBiZWZvcmVcbiAqIGV4ZWN1dGlvbi4gVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgaWRlbXBvdGVudCwgYXMgaXQgY2FuIGJlIGNhbGxlZFxuICogZHVyaW5nIGV4ZWN1dGlvbiB3aGVuIHJ1bm5pbmcgbXVsdGlwbGUgdHJpYWxzLlxuICovXG5NYXplLnByZXBhcmVGb3JFeGVjdXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mbyA9IG5ldyBFeGVjdXRpb25JbmZvKHt0aWNrczogMTAwfSk7XG4gIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5VTlNFVDtcbiAgTWF6ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgTWF6ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIE1hemUuYW5pbWF0aW5nXyA9IGZhbHNlO1xuICBNYXplLnJlc3BvbnNlID0gbnVsbDtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5NYXplLmV4ZWN1dGUgPSBmdW5jdGlvbihzdGVwTW9kZSkge1xuICBiZWdpbkF0dGVtcHQoKTtcbiAgTWF6ZS5wcmVwYXJlRm9yRXhlY3V0aW9uKCk7XG5cblxuICB2YXIgY29kZTtcbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIHtcbiAgICBjb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMoZHJvcGxldENvbmZpZywgJ01hemUnKTtcbiAgICBjb2RlICs9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIFRyeSBydW5uaW5nIHRoZSB1c2VyJ3MgY29kZS4gIFRoZXJlIGFyZSBhIGZldyBwb3NzaWJsZSBvdXRjb21lczpcbiAgLy8gMS4gSWYgcGVnbWFuIHJlYWNoZXMgdGhlIGZpbmlzaCBbU1VDQ0VTU10sIGV4ZWN1dGlvbkluZm8ncyB0ZXJtaW5hdGlvblxuICAvLyAgICB2YWx1ZSBpcyBzZXQgdG8gdHJ1ZS5cbiAgLy8gMi4gSWYgdGhlIHByb2dyYW0gaXMgdGVybWluYXRlZCBkdWUgdG8gcnVubmluZyB0b28gbG9uZyBbVElNRU9VVF0sXG4gIC8vICAgIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZSBpcyBzZXQgdG8gSW5maW5pdHlcbiAgLy8gMy4gSWYgdGhlIHByb2dyYW0gdGVybWluYXRlZCBiZWNhdXNlIG9mIGhpdHRpbmcgYSB3YWxsL29ic3RhY2xlLCB0aGVcbiAgLy8gICAgdGVybWluYXRpb24gdmFsdWUgaXMgc2V0IHRvIGZhbHNlIGFuZCB0aGUgUmVzdWx0VHlwZSBpcyBFUlJPUlxuICAvLyA0LiBJZiB0aGUgcHJvZ3JhbSBmaW5pc2hlcyB3aXRob3V0IG1lZXRpbmcgc3VjY2VzcyBjb25kaXRpb24sIHdlIGhhdmUgbm9cbiAgLy8gICAgdGVybWluYXRpb24gdmFsdWUgYW5kIHNldCBSZXN1bHRUeXBlIHRvIEZBSUxVUkVcbiAgLy8gNS4gVGhlIG9ubHkgb3RoZXIgdGltZSB3ZSBzaG91bGQgZmFpbCBzaG91bGQgYmUgaWYgYW4gZXhjZXB0aW9uIGlzIHRocm93blxuICAvLyAgICBkdXJpbmcgZXhlY3V0aW9uLCBpbiB3aGljaCBjYXNlIHdlIHNldCBSZXN1bHRUeXBlIHRvIEVSUk9SLlxuICAvLyBUaGUgYW5pbWF0aW9uIHNob3VsZCBiZSBmYXN0IGlmIGV4ZWN1dGlvbiB3YXMgc3VjY2Vzc2Z1bCwgc2xvdyBvdGhlcndpc2VcbiAgLy8gdG8gaGVscCB0aGUgdXNlciBzZWUgdGhlIG1pc3Rha2UuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG4gIHRyeSB7XG4gICAgLy8gZG9uJ3QgYm90aGVyIHJ1bm5pbmcgY29kZSBpZiB3ZSdyZSBqdXN0IGVkaXR0aW5nIHJlcXVpcmVkIGJsb2Nrcy4gYWxsXG4gICAgLy8gd2UgY2FyZSBhYm91dCBpcyB0aGUgY29udGVudHMgb2YgcmVwb3J0LlxuICAgIHZhciBydW5Db2RlID0gIWxldmVsLmVkaXRfYmxvY2tzO1xuXG4gICAgaWYgKHJ1bkNvZGUpIHtcbiAgICAgIGlmIChNYXplLmJlZSAmJiBNYXplLmJlZS5zdGF0aWNHcmlkcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIElmIHRoaXMgbGV2ZWwgaXMgYSBCZWUgbGV2ZWwgd2l0aCBtdWx0aXBsZSBwb3NzaWJsZSBncmlkcywgd2VcbiAgICAgICAgLy8gbmVlZCB0byBydW4gYWdhaW5zdCBhbGwgZ3JpZHMgYW5kIHNvcnQgdGhlbSBpbnRvIHN1Y2Nlc3Nlc1xuICAgICAgICAvLyBhbmQgZmFpbHVyZXNcbiAgICAgICAgdmFyIHN1Y2Nlc3NlcyA9IFtdO1xuICAgICAgICB2YXIgZmFpbHVyZXMgPSBbXTtcblxuICAgICAgICBNYXplLmJlZS5zdGF0aWNHcmlkcy5mb3JFYWNoKGZ1bmN0aW9uKGdyaWQsIGkpIHtcbiAgICAgICAgICBNYXplLmJlZS51c2VHcmlkV2l0aElkKGkpO1xuXG4gICAgICAgICAgLy8gUnVuIHRyaWFsXG4gICAgICAgICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgIE1hemU6IGFwaSxcbiAgICAgICAgICAgIGV4ZWN1dGlvbkluZm86IE1hemUuZXhlY3V0aW9uSW5mb1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU29ydCBzdGF0aWMgZ3JpZHMgYmFzZWQgb24gdHJpYWwgcmVzdWx0XG4gICAgICAgICAgTWF6ZS5vbkV4ZWN1dGlvbkZpbmlzaCgpO1xuICAgICAgICAgIGlmIChNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdWNjZXNzZXMucHVzaChpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbHVyZXMucHVzaChpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZXNldCBmb3IgbmV4dCB0cmlhbFxuICAgICAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIucmVzZXRDbG91ZGVkKCk7XG4gICAgICAgICAgTWF6ZS5wcmVwYXJlRm9yRXhlY3V0aW9uKCk7XG4gICAgICAgICAgc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb2RlIG5lZWRzIHRvIHN1Y2NlZWQgYWdhaW5zdCBhbGwgcG9zc2libGUgZ3JpZHNcbiAgICAgICAgLy8gdG8gYmUgY29uc2lkZXJlZCBhY3R1YWxseSBzdWNjZXNzZnVsOyBpZiB0aGVyZSBhcmUgYW55XG4gICAgICAgIC8vIGZhaWx1cmVzLCByYW5kb21seSBzZWxlY3Qgb25lIG9mIHRoZSBmYWlsaW5nIGdyaWRzIHRvIGJlIHRoZVxuICAgICAgICAvLyBcInJlYWxcIiBzdGF0ZSBvZiB0aGUgbWFwLiBJZiBhbGwgZ3JpZHMgYXJlIHN1Y2Nlc3NmdWwsXG4gICAgICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBhbnkgb25lIG9mIHRoZW0uXG4gICAgICAgIHZhciBpID0gKGZhaWx1cmVzLmxlbmd0aCA+IDApID8gXy5zYW1wbGUoZmFpbHVyZXMpIDogXy5zYW1wbGUoc3VjY2Vzc2VzKTtcbiAgICAgICAgTWF6ZS5iZWUudXNlR3JpZFdpdGhJZChpKTtcbiAgICAgIH1cblxuICAgICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICBNYXplOiBhcGksXG4gICAgICAgIGV4ZWN1dGlvbkluZm86IE1hemUuZXhlY3V0aW9uSW5mb1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgTWF6ZS5vbkV4ZWN1dGlvbkZpbmlzaCgpO1xuXG4gICAgc3dpdGNoIChNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpKSB7XG4gICAgICBjYXNlIG51bGw6XG4gICAgICAgIC8vIGRpZG4ndCB0ZXJtaW5hdGVcbiAgICAgICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdmaW5pc2gnLCBudWxsKTtcbiAgICAgICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgICAgIHN0ZXBTcGVlZCA9IDE1MDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEluZmluaXR5OlxuICAgICAgICAvLyBEZXRlY3RlZCBhbiBpbmZpbml0ZSBsb29wLiAgQW5pbWF0ZSB3aGF0IHdlIGhhdmUgYXMgcXVpY2tseSBhc1xuICAgICAgICAvLyBwb3NzaWJsZVxuICAgICAgICBNYXplLnJlc3VsdCA9IFJlc3VsdFR5cGUuVElNRU9VVDtcbiAgICAgICAgc3RlcFNwZWVkID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgICAgICBzdGVwU3BlZWQgPSAxMDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgICAgICBzdGVwU3BlZWQgPSAxNTA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gQXBwLXNwZWNpZmljIGZhaWx1cmUuXG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5FUlJPUjtcbiAgICAgICAgaWYgKE1hemUuYmVlKSB7XG4gICAgICAgICAgTWF6ZS50ZXN0UmVzdWx0cyA9IE1hemUuYmVlLmdldFRlc3RSZXN1bHRzKFxuICAgICAgICAgICAgTWF6ZS5leGVjdXRpb25JbmZvLnRlcm1pbmF0aW9uVmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gU3ludGF4IGVycm9yLCBjYW4ndCBoYXBwZW4uXG4gICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmV4cGVjdGVkIGV4Y2VwdGlvbjogXCIgKyBlICsgXCJcXG5cIiArIGUuc3RhY2spO1xuICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiB3ZSBrbm93IHRoZXkgc3VjY2VlZGVkLCBtYXJrIGxldmVsQ29tcGxldGUgdHJ1ZVxuICAvLyBOb3RlIHRoYXQgd2UgaGF2ZSBub3QgeWV0IGFuaW1hdGVkIHRoZSBzdWNjZXNzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChNYXplLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKTtcblxuICAvLyBTZXQgdGVzdFJlc3VsdHMgdW5sZXNzIGFwcC1zcGVjaWZpYyByZXN1bHRzIHdlcmUgc2V0IGluIHRoZSBkZWZhdWx0XG4gIC8vIGJyYW5jaCBvZiB0aGUgYWJvdmUgc3dpdGNoIHN0YXRlbWVudC5cbiAgaWYgKE1hemUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTikge1xuICAgIE1hemUudGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG4gIH1cblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIE1hemUud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG5cbiAgLy8gUmVwb3J0IHJlc3VsdCB0byBzZXJ2ZXIuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgIGFwcDogJ21hemUnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICByZXN1bHQ6IE1hemUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgdGVzdFJlc3VsdDogTWF6ZS50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogTWF6ZS5vblJlcG9ydENvbXBsZXRlXG4gIH0pO1xuXG4gIC8vIE1hemUuIG5vdyBjb250YWlucyBhIHRyYW5zY3JpcHQgb2YgYWxsIHRoZSB1c2VyJ3MgYWN0aW9ucy5cbiAgLy8gUmVzZXQgdGhlIG1hemUgYW5kIGFuaW1hdGUgdGhlIHRyYW5zY3JpcHQuXG4gIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gIHJlc2V0RGlydEltYWdlcyh0cnVlKTtcblxuICAvLyBpZiB3ZSBoYXZlIGV4dHJhIHRvcCBibG9ja3MsIGRvbid0IGV2ZW4gYm90aGVyIGFuaW1hdGluZ1xuICBpZiAoTWF6ZS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuRVhUUkFfVE9QX0JMT0NLU19GQUlMKSB7XG4gICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgIGRpc3BsYXlGZWVkYmFjaygpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIE1hemUuYW5pbWF0aW5nXyA9IHRydWU7XG5cbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuXG4gICAgaWYgKHN0ZXBNb2RlKSB7XG4gICAgICBpZiAoTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGNhY2hlZEJsb2NrU3RhdGVzJyk7XG4gICAgICB9XG4gICAgICAvLyBEaXNhYmxlIGFsbCBibG9ja3MsIGNhY2hpbmcgdGhlaXIgc3RhdGUgZmlyc3RcbiAgICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0QWxsQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgICAgTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5wdXNoKHtcbiAgICAgICAgICBibG9jazogYmxvY2ssXG4gICAgICAgICAgbW92YWJsZTogYmxvY2suaXNNb3ZhYmxlKCksXG4gICAgICAgICAgZGVsZXRhYmxlOiBibG9jay5pc0RlbGV0YWJsZSgpLFxuICAgICAgICAgIGVkaXRhYmxlOiBibG9jay5pc0VkaXRhYmxlKClcbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLnNldE1vdmFibGUoZmFsc2UpO1xuICAgICAgICBibG9jay5zZXREZWxldGFibGUoZmFsc2UpO1xuICAgICAgICBibG9jay5zZXRFZGl0YWJsZShmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmluZyB0aGUgaWRsZSBhbmltYXRpb24gYW5kIHJlcGxhY2Ugd2l0aCBwZWdtYW4gc3ByaXRlXG4gIGlmIChza2luLmlkbGVQZWdtYW5BbmltYXRpb24pIHtcbiAgICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgICB2YXIgaWRsZVBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWRsZVBlZ21hbicpO1xuICAgIGlkbGVQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIH1cblxuICAvLyBTcGVlZGluZyB1cCBzcGVjaWZpYyBsZXZlbHNcbiAgdmFyIHNjYWxlZFN0ZXBTcGVlZCA9IHN0ZXBTcGVlZCAqIE1hemUuc2NhbGUuc3RlcFNwZWVkICpcbiAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgTWF6ZS5zY2hlZHVsZUFuaW1hdGlvbnMoc3RlcE1vZGUpO1xuICB9LCBzY2FsZWRTdGVwU3BlZWQpO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIG91ciBhbmltYXRpb25zLCBlaXRoZXIgYWxsIG9mIHRoZW0gb3IgdGhvc2Ugb2YgYSBzaW5nbGUgc3RlcFxuICovXG5NYXplLnNjaGVkdWxlQW5pbWF0aW9ucyA9IGZ1bmN0aW9uIChzaW5nbGVTdGVwKSB7XG4gIHZhciBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKTtcblxuICB0aW1lb3V0TGlzdC5jbGVhclRpbWVvdXRzKCk7XG5cbiAgdmFyIHRpbWVQZXJBY3Rpb24gPSBzdGVwU3BlZWQgKiBNYXplLnNjYWxlLnN0ZXBTcGVlZCAqXG4gICAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTtcbiAgLy8gZ2V0IGEgZmxhdCBsaXN0IG9mIGFjdGlvbnMgd2Ugd2FudCB0byBzY2hlZHVsZVxuICB2YXIgYWN0aW9ucyA9IE1hemUuZXhlY3V0aW9uSW5mby5nZXRBY3Rpb25zKHNpbmdsZVN0ZXApO1xuXG4gIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uKDApO1xuXG4gIC8vIHNjaGVkdWxlIGFuaW1hdGlvbnMgaW4gc2VxdWVuY2VcbiAgLy8gVGhlIHJlYXNvbiB3ZSBkbyB0aGlzIHJlY3Vyc2l2ZWx5IGluc3RlYWQgb2YgaXRlcmF0aXZlbHkgaXMgdGhhdCB3ZSB3YW50IHRvXG4gIC8vIGVuc3VyZSB0aGF0IHdlIGZpbmlzaCBzY2hlZHVsaW5nIGFjdGlvbjEgYmVmb3JlIHN0YXJ0aW5nIHRvIHNjaGVkdWxlXG4gIC8vIGFjdGlvbjIuIE90aGVyd2lzZSB3ZSBnZXQgaW50byB0cm91YmxlIHdoZW4gc3RlcFNwZWVkIGlzIDAuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uIChpbmRleCkge1xuICAgIGlmIChpbmRleCA+PSBhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgZmluaXNoQW5pbWF0aW9ucygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFuaW1hdGVBY3Rpb24oYWN0aW9uc1tpbmRleF0sIHNpbmdsZVN0ZXAsIHRpbWVQZXJBY3Rpb24pO1xuXG4gICAgdmFyIGNvbW1hbmQgPSBhY3Rpb25zW2luZGV4XSAmJiBhY3Rpb25zW2luZGV4XS5jb21tYW5kO1xuICAgIHZhciB0aW1lTW9kaWZpZXIgPSAoc2tpbi5hY3Rpb25TcGVlZFNjYWxlICYmIHNraW4uYWN0aW9uU3BlZWRTY2FsZVtjb21tYW5kXSkgfHwgMTtcbiAgICB2YXIgdGltZUZvclRoaXNBY3Rpb24gPSBNYXRoLnJvdW5kKHRpbWVQZXJBY3Rpb24gKiB0aW1lTW9kaWZpZXIpO1xuXG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uKGluZGV4ICsgMSk7XG4gICAgfSwgdGltZUZvclRoaXNBY3Rpb24pO1xuICB9XG5cbiAgLy8gT25jZSBhbmltYXRpb25zIGFyZSBjb21wbGV0ZSwgd2Ugd2FudCB0byByZWVuYWJsZSB0aGUgc3RlcCBidXR0b24gaWYgd2VcbiAgLy8gaGF2ZSBzdGVwcyBsZWZ0LCBvdGhlcndpc2Ugd2UncmUgZG9uZSB3aXRoIHRoaXMgZXhlY3V0aW9uLlxuICBmdW5jdGlvbiBmaW5pc2hBbmltYXRpb25zKCkge1xuICAgIHZhciBzdGVwc1JlbWFpbmluZyA9IE1hemUuZXhlY3V0aW9uSW5mby5zdGVwc1JlbWFpbmluZygpO1xuXG4gICAgLy8gYWxsb3cgdGltZSBmb3IgIGFkZGl0aW9uYWwgcGF1c2UgaWYgd2UncmUgY29tcGxldGVseSBkb25lXG4gICAgdmFyIHdhaXRUaW1lID0gKHN0ZXBzUmVtYWluaW5nID8gMCA6IDEwMDApO1xuXG4gICAgLy8gcnVuIGFmdGVyIGFsbCBhbmltYXRpb25zXG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc3RlcHNSZW1haW5pbmcpIHtcbiAgICAgICAgc3RlcEJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcbiAgICAgICAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICAgICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgICAgICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBzdGVwcGluZyBhbmQgd2UgZmFpbGVkLCB3ZSB3YW50IHRvIHJldGFpbiBoaWdobGlnaHRpbmcgdW50aWxcbiAgICAgICAgLy8gY2xpY2tpbmcgcmVzZXQuICBPdGhlcndpc2Ugd2UgY2FuIGNsZWFyIGhpZ2hsaWdodGluZy9kaXNhYmxlZFxuICAgICAgICAvLyBibG9ja3Mgbm93XG4gICAgICAgIGlmICghc2luZ2xlU3RlcCB8fCBNYXplLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKSB7XG4gICAgICAgICAgcmVlbmFibGVDYWNoZWRCbG9ja1N0YXRlcygpO1xuICAgICAgICAgIHN0dWRpb0FwcC5jbGVhckhpZ2hsaWdodGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BsYXlGZWVkYmFjaygpO1xuICAgICAgfVxuICAgIH0sIHdhaXRUaW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBbmltYXRlcyBhIHNpbmdsZSBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gVGhlIGFjdGlvbiB0byBhbmltYXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNwb3RsaWdodEJsb2NrcyBXaGV0aGVyIG9yIG5vdCB3ZSBzaG91bGQgaGlnaGxpZ2h0IGVudGlyZSBibG9ja3NcbiAqIEBwYXJhbSB7aW50ZWdlcn0gdGltZVBlclN0ZXAgSG93IG11Y2ggdGltZSB3ZSBoYXZlIGFsbG9jYXRlZCBiZWZvcmUgdGhlIG5leHQgc3RlcFxuICovXG5mdW5jdGlvbiBhbmltYXRlQWN0aW9uIChhY3Rpb24sIHNwb3RsaWdodEJsb2NrcywgdGltZVBlclN0ZXApIHtcbiAgaWYgKGFjdGlvbi5ibG9ja0lkKSB7XG4gICAgc3R1ZGlvQXBwLmhpZ2hsaWdodChTdHJpbmcoYWN0aW9uLmJsb2NrSWQpLCBzcG90bGlnaHRCbG9ja3MpO1xuICB9XG5cbiAgc3dpdGNoIChhY3Rpb24uY29tbWFuZCkge1xuICAgIGNhc2UgJ25vcnRoJzpcbiAgICAgIGFuaW1hdGVkTW92ZShEaXJlY3Rpb24uTk9SVEgsIHRpbWVQZXJTdGVwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Vhc3QnOlxuICAgICAgYW5pbWF0ZWRNb3ZlKERpcmVjdGlvbi5FQVNULCB0aW1lUGVyU3RlcCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzb3V0aCc6XG4gICAgICBhbmltYXRlZE1vdmUoRGlyZWN0aW9uLlNPVVRILCB0aW1lUGVyU3RlcCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3ZXN0JzpcbiAgICAgIGFuaW1hdGVkTW92ZShEaXJlY3Rpb24uV0VTVCwgdGltZVBlclN0ZXApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9va19ub3J0aCc6XG4gICAgICBNYXplLnNjaGVkdWxlTG9vayhEaXJlY3Rpb24uTk9SVEgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9va19lYXN0JzpcbiAgICAgIE1hemUuc2NoZWR1bGVMb29rKERpcmVjdGlvbi5FQVNUKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfc291dGgnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUxvb2soRGlyZWN0aW9uLlNPVVRIKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfd2VzdCc6XG4gICAgICBNYXplLnNjaGVkdWxlTG9vayhEaXJlY3Rpb24uV0VTVCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsX2ZvcndhcmQnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUZhaWwodHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsX2JhY2t3YXJkJzpcbiAgICAgIE1hemUuc2NoZWR1bGVGYWlsKGZhbHNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgdmFyIG5ld0RpcmVjdGlvbiA9IE1hemUucGVnbWFuRCArIFR1cm5EaXJlY3Rpb24uTEVGVDtcbiAgICAgIE1hemUuc2NoZWR1bGVUdXJuKG5ld0RpcmVjdGlvbik7XG4gICAgICBNYXplLnBlZ21hbkQgPSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KG5ld0RpcmVjdGlvbik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICBuZXdEaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQgKyBUdXJuRGlyZWN0aW9uLlJJR0hUO1xuICAgICAgTWF6ZS5zY2hlZHVsZVR1cm4obmV3RGlyZWN0aW9uKTtcbiAgICAgIE1hemUucGVnbWFuRCA9IHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQobmV3RGlyZWN0aW9uKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpbmlzaCc6XG4gICAgICAvLyBPbmx5IHNjaGVkdWxlIHZpY3RvcnkgYW5pbWF0aW9uIGZvciBjZXJ0YWluIGNvbmRpdGlvbnM6XG4gICAgICBzd2l0Y2ggKE1hemUudGVzdFJlc3VsdHMpIHtcbiAgICAgICAgY2FzZSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk6XG4gICAgICAgIGNhc2UgVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUw6XG4gICAgICAgIGNhc2UgVGVzdFJlc3VsdHMuQUxMX1BBU1M6XG4gICAgICAgICAgc2NoZWR1bGVEYW5jZSh0cnVlLCB0aW1lUGVyU3RlcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgICAgICAgICB9LCBzdGVwU3BlZWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHV0ZG93bic6XG4gICAgICBNYXplLnNjaGVkdWxlRmlsbCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGlja3VwJzpcbiAgICAgIE1hemUuc2NoZWR1bGVEaWcoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25lY3Rhcic6XG4gICAgICBNYXplLmJlZS5hbmltYXRlR2V0TmVjdGFyKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdob25leSc6XG4gICAgICBNYXplLmJlZS5hbmltYXRlTWFrZUhvbmV5KCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gYWN0aW9uWzBdIGlzIG51bGwgaWYgZ2VuZXJhdGVkIGJ5IHN0dWRpb0FwcC5jaGVja1RpbWVvdXQoKS5cbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGVkTW92ZSAoZGlyZWN0aW9uLCB0aW1lRm9yTW92ZSkge1xuICB2YXIgcG9zaXRpb25DaGFuZ2UgPSB0aWxlcy5kaXJlY3Rpb25Ub0R4RHkoZGlyZWN0aW9uKTtcbiAgdmFyIG5ld1ggPSBNYXplLnBlZ21hblggKyBwb3NpdGlvbkNoYW5nZS5keDtcbiAgdmFyIG5ld1kgPSBNYXplLnBlZ21hblkgKyBwb3NpdGlvbkNoYW5nZS5keTtcbiAgc2NoZWR1bGVNb3ZlKG5ld1gsIG5ld1ksIHRpbWVGb3JNb3ZlKTtcbiAgTWF6ZS5wZWdtYW5YID0gbmV3WDtcbiAgTWF6ZS5wZWdtYW5ZID0gbmV3WTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhIG1vdmVtZW50IGFuaW1hdGluZyB1c2luZyBhIHNwcml0ZXNoZWV0LlxuICovXG5NYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50ID0gZnVuY3Rpb24gKHN0YXJ0LCBkZWx0YSwgbnVtRnJhbWVzLCB0aW1lUGVyRnJhbWUsXG4gICAgaWRTdHIsIGRpcmVjdGlvbiwgaGlkZVBlZ21hbikge1xuICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgdXRpbHMucmFuZ2UoMCwgbnVtRnJhbWVzIC0gMSkuZm9yRWFjaChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGhpZGVQZWdtYW4pIHtcbiAgICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICB9XG4gICAgICB1cGRhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgICBpZFN0cjogaWRTdHIsXG4gICAgICAgIGNvbDogc3RhcnQueCArIGRlbHRhLnggKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgcm93OiBzdGFydC55ICsgZGVsdGEueSAqIGZyYW1lIC8gbnVtRnJhbWVzLFxuICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgYW5pbWF0aW9uUm93OiBmcmFtZVxuICAgICAgfSk7XG4gICAgfSwgdGltZVBlckZyYW1lICogZnJhbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgZm9yIGEgbW92ZSBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWCBYIGNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldCBwb3NpdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGVuZFkgWSBjb29yZGluYXRlIG9mIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAqL1xuIGZ1bmN0aW9uIHNjaGVkdWxlTW92ZShlbmRYLCBlbmRZLCB0aW1lRm9yQW5pbWF0aW9uKSB7XG4gIHZhciBzdGFydFggPSBNYXplLnBlZ21hblg7XG4gIHZhciBzdGFydFkgPSBNYXplLnBlZ21hblk7XG4gIHZhciBkaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQ7XG5cbiAgdmFyIGRlbHRhWCA9IChlbmRYIC0gc3RhcnRYKTtcbiAgdmFyIGRlbHRhWSA9IChlbmRZIC0gc3RhcnRZKTtcbiAgdmFyIG51bUZyYW1lcztcbiAgdmFyIHRpbWVQZXJGcmFtZTtcblxuICBpZiAoc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgbnVtRnJhbWVzID0gc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uRnJhbWVOdW1iZXI7XG4gICAgLy8gSWYgbW92ZSBhbmltYXRpb24gb2YgcGVnbWFuIGlzIHNldCwgYW5kIHRoaXMgaXMgbm90IGEgdHVybi5cbiAgICAvLyBTaG93IHRoZSBhbmltYXRpb24uXG4gICAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gICAgdmFyIG1vdmVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vdmVQZWdtYW4nKTtcbiAgICB0aW1lUGVyRnJhbWUgPSB0aW1lRm9yQW5pbWF0aW9uIC8gbnVtRnJhbWVzO1xuXG4gICAgTWF6ZS5zY2hlZHVsZVNoZWV0ZWRNb3ZlbWVudCh7eDogc3RhcnRYLCB5OiBzdGFydFl9LCB7eDogZGVsdGFYLCB5OiBkZWx0YVkgfSxcbiAgICAgIG51bUZyYW1lcywgdGltZVBlckZyYW1lLCAnbW92ZScsIGRpcmVjdGlvbiwgdHJ1ZSk7XG5cbiAgICAvLyBIaWRlIG1vdmVQZWdtYW4gYW5kIHNldCBwZWdtYW4gdG8gdGhlIGVuZCBwb3NpdGlvbi5cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbW92ZVBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKGVuZFgsIGVuZFksIHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoZGlyZWN0aW9uKSk7XG4gICAgICBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgICAgIE1hemUud29yZFNlYXJjaC5tYXJrVGlsZVZpc2l0ZWQoZW5kWSwgZW5kWCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSwgdGltZVBlckZyYW1lICogbnVtRnJhbWVzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGFuIGFuaW1hdGlvbiwgc28ganVzdCBtb3ZlIHRoZSB4L3kgcG9zXG4gICAgbnVtRnJhbWVzID0gNDtcbiAgICB0aW1lUGVyRnJhbWUgPSB0aW1lRm9yQW5pbWF0aW9uIC8gbnVtRnJhbWVzO1xuICAgIHV0aWxzLnJhbmdlKDEsIG51bUZyYW1lcykuZm9yRWFjaChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIE1hemUuZGlzcGxheVBlZ21hbihcbiAgICAgICAgICBzdGFydFggKyBkZWx0YVggKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgICBzdGFydFkgKyBkZWx0YVkgKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgICB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKGRpcmVjdGlvbikpO1xuICAgICAgfSwgdGltZVBlckZyYW1lICogZnJhbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHNraW4uYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uKSB7XG4gICAgdmFyIGZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluaXNoJyk7XG4gICAgLy8gSWYgcGVnbWFuIGlzIGNsb3NlIHRvIHRoZSBnb2FsXG4gICAgLy8gUmVwbGFjZSB0aGUgZ29hbCBmaWxlIHdpdGggYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uXG4gICAgaWYgKE1hemUuZmluaXNoXyAmJiBNYXRoLmFicyhlbmRYIC0gTWF6ZS5maW5pc2hfLngpIDw9IDEgJiZcbiAgICAgICAgTWF0aC5hYnMoZW5kWSAtIE1hemUuZmluaXNoXy55KSA8PSAxKSB7XG4gICAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgIHNraW4uZ29hbElkbGUpO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgZm9yIGEgdHVybiBmcm9tIHRoZSBjdXJyZW50IGRpcmVjdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGVuZERpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHdlJ3JlIHR1cm5pbmcgdG9cbiAqL1xuTWF6ZS5zY2hlZHVsZVR1cm4gPSBmdW5jdGlvbiAoZW5kRGlyZWN0aW9uKSB7XG4gIHZhciBudW1GcmFtZXMgPSA0O1xuICB2YXIgc3RhcnREaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQ7XG4gIHZhciBkZWx0YURpcmVjdGlvbiA9IGVuZERpcmVjdGlvbiAtIHN0YXJ0RGlyZWN0aW9uO1xuICB1dGlscy5yYW5nZSgxLCBudW1GcmFtZXMpLmZvckVhY2goZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihcbiAgICAgICAgTWF6ZS5wZWdtYW5YLFxuICAgICAgICBNYXplLnBlZ21hblksXG4gICAgICAgIHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoc3RhcnREaXJlY3Rpb24gKyBkZWx0YURpcmVjdGlvbiAqIGZyYW1lIC8gbnVtRnJhbWVzKSk7XG4gICAgfSwgc3RlcFNwZWVkICogKGZyYW1lIC0gMSkpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVwbGFjZSB0aGUgdGlsZXMgc3Vycm91bmRpbmcgdGhlIG9ic3RhY2xlIHdpdGggYnJva2VuIHRpbGVzLlxuICovXG5NYXplLnVwZGF0ZVN1cnJvdW5kaW5nVGlsZXMgPSBmdW5jdGlvbihvYnN0YWNsZVksIG9ic3RhY2xlWCwgYnJva2VuVGlsZXMpIHtcbiAgdmFyIHRpbGVDb29yZHMgPSBbXG4gICAgW29ic3RhY2xlWSAtIDEsIG9ic3RhY2xlWCAtIDFdLFxuICAgIFtvYnN0YWNsZVkgLSAxLCBvYnN0YWNsZVhdLFxuICAgIFtvYnN0YWNsZVkgLSAxLCBvYnN0YWNsZVggKyAxXSxcbiAgICBbb2JzdGFjbGVZLCBvYnN0YWNsZVggLSAxXSxcbiAgICBbb2JzdGFjbGVZLCBvYnN0YWNsZVhdLFxuICAgIFtvYnN0YWNsZVksIG9ic3RhY2xlWCArIDFdLFxuICAgIFtvYnN0YWNsZVkgKyAxLCBvYnN0YWNsZVggLSAxXSxcbiAgICBbb2JzdGFjbGVZICsgMSwgb2JzdGFjbGVYXSxcbiAgICBbb2JzdGFjbGVZICsgMSwgb2JzdGFjbGVYICsgMV1cbiAgXTtcbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgdGlsZUNvb3Jkcy5sZW5ndGg7ICsraWR4KSB7XG4gICAgdmFyIHRpbGVJZHggPSB0aWxlQ29vcmRzW2lkeF1bMV0gKyBNYXplLkNPTFMgKiB0aWxlQ29vcmRzW2lkeF1bMF07XG4gICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZHgpO1xuICAgIGlmICh0aWxlRWxlbWVudCkge1xuICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsIGJyb2tlblRpbGVzKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgYW5kIHNvdW5kcyBmb3IgYSBmYWlsZWQgbW92ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yd2FyZCBUcnVlIGlmIGZvcndhcmQsIGZhbHNlIGlmIGJhY2t3YXJkLlxuICovXG5NYXplLnNjaGVkdWxlRmFpbCA9IGZ1bmN0aW9uKGZvcndhcmQpIHtcbiAgdmFyIGR4RHkgPSB0aWxlcy5kaXJlY3Rpb25Ub0R4RHkoTWF6ZS5wZWdtYW5EKTtcbiAgdmFyIGRlbHRhWCA9IGR4RHkuZHg7XG4gIHZhciBkZWx0YVkgPSBkeER5LmR5O1xuXG4gIGlmICghZm9yd2FyZCkge1xuICAgIGRlbHRhWCA9IC1kZWx0YVg7XG4gICAgZGVsdGFZID0gLWRlbHRhWTtcbiAgfVxuXG4gIHZhciB0YXJnZXRYID0gTWF6ZS5wZWdtYW5YICsgZGVsdGFYO1xuICB2YXIgdGFyZ2V0WSA9IE1hemUucGVnbWFuWSArIGRlbHRhWTtcbiAgdmFyIGZyYW1lID0gdGlsZXMuZGlyZWN0aW9uVG9GcmFtZShNYXplLnBlZ21hbkQpO1xuICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YICsgZGVsdGFYIC8gNCxcbiAgICAgICAgICAgICAgICAgICAgIE1hemUucGVnbWFuWSArIGRlbHRhWSAvIDQsXG4gICAgICAgICAgICAgICAgICAgICBmcmFtZSk7XG4gIC8vIFBsYXkgc291bmQgYW5kIGFuaW1hdGlvbiBmb3IgaGl0dGluZyB3YWxsIG9yIG9ic3RhY2xlXG4gIHZhciBzcXVhcmVUeXBlID0gTWF6ZS5tYXBbdGFyZ2V0WV0gJiYgTWF6ZS5tYXBbdGFyZ2V0WV1bdGFyZ2V0WF07XG4gIGlmIChzcXVhcmVUeXBlID09PSBTcXVhcmVUeXBlLldBTEwgfHwgc3F1YXJlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gUGxheSB0aGUgc291bmRcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3YWxsJyk7XG4gICAgaWYgKHNxdWFyZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQ2hlY2sgd2hpY2ggdHlwZSBvZiB3YWxsIHBlZ21hbiBpcyBoaXR0aW5nXG4gICAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3YWxsJyArIE1hemUud2FsbE1hcFt0YXJnZXRZXVt0YXJnZXRYXSk7XG4gICAgfVxuXG4gICAgLy8gUGxheSB0aGUgYW5pbWF0aW9uIG9mIGhpdHRpbmcgdGhlIHdhbGxcbiAgICBpZiAoc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbikge1xuICAgICAgdmFyIHdhbGxBbmltYXRpb25JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxBbmltYXRpb24nKTtcbiAgICAgIHZhciBudW1GcmFtZXMgPSBza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uRnJhbWVOdW1iZXIgfHwgMDtcblxuICAgICAgaWYgKG51bUZyYW1lcyA+IDEpIHtcblxuICAgICAgICAvLyBUaGUgU2NyYXQgXCJ3YWxsXCIgYW5pbWF0aW9uIGhhcyBoaW0gZmFsbGluZyBiYWNrd2FyZHMgaW50byB0aGUgd2F0ZXIuXG4gICAgICAgIC8vIFRoaXMgbG9va3MgZ3JlYXQgd2hlbiBoZSBmYWxscyBpbnRvIHRoZSB3YXRlciBhYm92ZSBoaW0sIGJ1dCBsb29rcyBhXG4gICAgICAgIC8vIGxpdHRsZSBvZmYgd2hlbiBmYWxsaW5nIHRvIHRoZSBzaWRlL2ZvcndhcmQuIFR1bmUgdGhhdCBieSBidW1waW5nIHRoZVxuICAgICAgICAvLyBkZWx0YVkgYnkgb25lLiBIYWNreSwgYnV0IGxvb2tzIG11Y2ggYmV0dGVyXG4gICAgICAgIGlmIChkZWx0YVkgPj0gMCkge1xuICAgICAgICAgIGRlbHRhWSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFuaW1hdGUgb3VyIHNwcml0ZSBzaGVldFxuICAgICAgICB2YXIgdGltZVBlckZyYW1lID0gMTAwO1xuICAgICAgICBNYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50KHt4OiBNYXplLnBlZ21hblgsIHk6IE1hemUucGVnbWFuWX0sXG4gICAgICAgICAge3g6IGRlbHRhWCwgeTogZGVsdGFZIH0sIG51bUZyYW1lcywgdGltZVBlckZyYW1lLCAnd2FsbCcsXG4gICAgICAgICAgRGlyZWN0aW9uLk5PUlRILCB0cnVlKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxQZWdtYW4nKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIH0sIG51bUZyYW1lcyAqIHRpbWVQZXJGcmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhY3RpdmUgb3VyIGdpZlxuICAgICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgICAgICAgICBNYXplLlNRVUFSRV9TSVpFICogKE1hemUucGVnbWFuWCArIDAuNSArIGRlbHRhWCAqIDAuNSkgLVxuICAgICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uZ2V0QXR0cmlidXRlKCd3aWR0aCcpIC8gMik7XG4gICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd5JyxcbiAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoTWF6ZS5wZWdtYW5ZICsgMSArIGRlbHRhWSAqIDAuNSkgLVxuICAgICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbik7XG4gICAgICAgIH0sIHN0ZXBTcGVlZCAvIDIpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCBmcmFtZSk7XG4gICAgfSwgc3RlcFNwZWVkKTtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCArIGRlbHRhWCAvIDQsIE1hemUucGVnbWFuWSArIGRlbHRhWSAvIDQsXG4gICAgICAgZnJhbWUpO1xuICAgICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICAgIH0sIHN0ZXBTcGVlZCAqIDIpO1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIGZyYW1lKTtcbiAgICB9LCBzdGVwU3BlZWQgKiAzKTtcblxuICAgIGlmIChza2luLndhbGxQZWdtYW5BbmltYXRpb24pIHtcbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICAgICAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgdXBkYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgICAgICBpZFN0cjogJ3dhbGwnLFxuICAgICAgICAgIHJvdzogTWF6ZS5wZWdtYW5ZLFxuICAgICAgICAgIGNvbDogTWF6ZS5wZWdtYW5YLFxuICAgICAgICAgIGRpcmVjdGlvbjogTWF6ZS5wZWdtYW5EXG4gICAgICAgIH0pO1xuICAgICAgfSwgc3RlcFNwZWVkICogNCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHNxdWFyZVR5cGUgPT0gU3F1YXJlVHlwZS5PQlNUQUNMRSkge1xuICAgIC8vIFBsYXkgdGhlIHNvdW5kXG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnb2JzdGFjbGUnKTtcblxuICAgIC8vIFBsYXkgdGhlIGFuaW1hdGlvblxuICAgIHZhciBvYnNJZCA9IHRhcmdldFggKyBNYXplLkNPTFMgKiB0YXJnZXRZO1xuICAgIHZhciBvYnNJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICBvYnNJY29uLnNldEF0dHJpYnV0ZU5TKFxuICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgc2tpbi5vYnN0YWNsZUFuaW1hdGlvbik7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblggKyBkZWx0YVggLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgIE1hemUucGVnbWFuWSArIGRlbHRhWSAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWUpO1xuICAgIH0sIHN0ZXBTcGVlZCk7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBvYmplY3RzIGFyb3VuZCBvYnN0YWNsZXMgd2l0aCBicm9rZW4gb2JqZWN0c1xuICAgIGlmIChza2luLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMpIHtcbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIE1hemUudXBkYXRlU3Vycm91bmRpbmdUaWxlcyhcbiAgICAgICAgICAgIHRhcmdldFksIHRhcmdldFgsIHNraW4ubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcyk7XG4gICAgICB9LCBzdGVwU3BlZWQpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBwZWdtYW5cbiAgICBpZiAoIXNraW4ubm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlKSB7XG4gICAgICB2YXIgc3ZnTWF6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gICAgICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcblxuICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICB9LCBzdGVwU3BlZWQgKiAyKTtcbiAgICB9XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgICB9LCBzdGVwU3BlZWQpO1xuICB9XG59O1xuXG4vKipcbiAqIFNldCB0aGUgdGlsZXMgdG8gYmUgdHJhbnNwYXJlbnQgZ3JhZHVhbGx5LlxuICovXG5mdW5jdGlvbiBzZXRUaWxlVHJhbnNwYXJlbnQgKCkge1xuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLlJPV1M7IHkrKykge1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgTWF6ZS5DT0xTOyB4KyspIHtcbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICB2YXIgdGlsZUFuaW1hdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlQW5pbWF0aW9uJyArIHRpbGVJZCk7XG4gICAgICBpZiAodGlsZUVsZW1lbnQpIHtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMCk7XG4gICAgICB9XG4gICAgICBpZiAodGlsZUFuaW1hdGlvbiAmJiB0aWxlQW5pbWF0aW9uLmJlZ2luRWxlbWVudCkge1xuICAgICAgICAvLyBJRSBkb2Vzbid0IHN1cHBvcnQgYmVnaW5FbGVtZW50LCBzbyBjaGVjayBmb3IgaXQuXG4gICAgICAgIHRpbGVBbmltYXRpb24uYmVnaW5FbGVtZW50KCk7XG4gICAgICB9XG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UGVnbWFuVHJhbnNwYXJlbnQoKSB7XG4gIHZhciBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbkZhZGVvdXRBbmltYXRpb24nKTtcbiAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gIGlmIChwZWdtYW5JY29uKSB7XG4gICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAwKTtcbiAgfVxuICBpZiAocGVnbWFuRmFkZW91dEFuaW1hdGlvbiAmJiBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLmJlZ2luRWxlbWVudCkge1xuICAgIC8vIElFIGRvZXNuJ3Qgc3VwcG9ydCBiZWdpbkVsZW1lbnQsIHNvIGNoZWNrIGZvciBpdC5cbiAgICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLmJlZ2luRWxlbWVudCgpO1xuICB9XG59XG5cblxuXG5cblxuLyoqXG4gKiBTY2hlZHVsZSB0aGUgYW5pbWF0aW9ucyBhbmQgc291bmQgZm9yIGEgZGFuY2UuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHZpY3RvcnlEYW5jZSBUaGlzIGlzIGEgdmljdG9yeSBkYW5jZSBhZnRlciBjb21wbGV0aW5nIHRoZVxuICogICBwdXp6bGUgKHZzLiBkYW5jaW5nIG9uIGxvYWQpLlxuICogQHBhcmFtIHtpbnRlZ2VyfSB0aW1lQWxsb3RlZCBIb3cgbXVjaCB0aW1lIHdlIGhhdmUgZm9yIG91ciBhbmltYXRpb25zXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlRGFuY2UodmljdG9yeURhbmNlLCB0aW1lQWxsb3RlZCkge1xuICBpZiAobWF6ZVV0aWxzLmlzU2NyYXRTa2luKHNraW4uaWQpKSB7XG4gICAgc2NyYXQuc2NoZWR1bGVEYW5jZSh2aWN0b3J5RGFuY2UsIHRpbWVBbGxvdGVkLCBza2luKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgb3JpZ2luYWxGcmFtZSA9IHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoTWF6ZS5wZWdtYW5EKTtcbiAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAxNik7XG5cbiAgLy8gSWYgdmljdG9yeURhbmNlID09IHRydWUsIHBsYXkgdGhlIGdvYWwgYW5pbWF0aW9uLCBlbHNlIHJlc2V0IGl0XG4gIHZhciBmaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmlzaCcpO1xuICBpZiAodmljdG9yeURhbmNlICYmIGZpbmlzaEljb24pIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW5Hb2FsJyk7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW4uZ29hbEFuaW1hdGlvbik7XG4gIH1cblxuICBpZiAodmljdG9yeURhbmNlKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG4gIH1cblxuICB2YXIgZGFuY2VTcGVlZCA9IHRpbWVBbGxvdGVkIC8gNTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIDE4KTtcbiAgfSwgZGFuY2VTcGVlZCk7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAyMCk7XG4gIH0sIGRhbmNlU3BlZWQgKiAyKTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIDE4KTtcbiAgfSwgZGFuY2VTcGVlZCAqIDMpO1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgMjApO1xuICB9LCBkYW5jZVNwZWVkICogNCk7XG5cbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF2aWN0b3J5RGFuY2UgfHwgc2tpbi50dXJuQWZ0ZXJWaWN0b3J5KSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIG9yaWdpbmFsRnJhbWUpO1xuICAgIH1cblxuICAgIGlmICh2aWN0b3J5RGFuY2UgJiYgc2tpbi50cmFuc3BhcmVudFRpbGVFbmRpbmcpIHtcbiAgICAgIHNldFRpbGVUcmFuc3BhcmVudCgpO1xuICAgIH1cblxuICAgIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICAgIHNldFBlZ21hblRyYW5zcGFyZW50KCk7XG4gICAgfVxuICB9LCBkYW5jZVNwZWVkICogNSk7XG59XG5cbi8qKlxuICogRGlzcGxheSBQZWdtYW4gYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbiwgZmFjaW5nIHRoZSBzcGVjaWZpZWQgZGlyZWN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHggSG9yaXpvbnRhbCBncmlkIChvciBmcmFjdGlvbiB0aGVyZW9mKS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFZlcnRpY2FsIGdyaWQgKG9yIGZyYWN0aW9uIHRoZXJlb2YpLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lIERpcmVjdGlvbiAoMCAtIDE1KSBvciBkYW5jZSAoMTYgLSAxNykuXG4gKi9cbk1hemUuZGlzcGxheVBlZ21hbiA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKSB7XG4gIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgeCAqIE1hemUuU1FVQVJFX1NJWkUgLSBmcmFtZSAqIE1hemUuUEVHTUFOX1dJRFRIICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLCBnZXRQZWdtYW5ZRm9yUm93KHkpKTtcblxuICB2YXIgY2xpcFJlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcFJlY3QnKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCd4JywgeCAqIE1hemUuU1FVQVJFX1NJWkUgKyAxICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQpO1xuICBjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCBwZWdtYW5JY29uLmdldEF0dHJpYnV0ZSgneScpKTtcbn07XG5cbnZhciBzY2hlZHVsZURpcnRDaGFuZ2UgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBjb2wgPSBNYXplLnBlZ21hblg7XG4gIHZhciByb3cgPSBNYXplLnBlZ21hblk7XG4gIE1hemUuZGlydF9bcm93XVtjb2xdICs9IG9wdGlvbnMuYW1vdW50O1xuICBNYXplLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgdHJ1ZSk7XG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8ob3B0aW9ucy5zb3VuZCk7XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRvIGFkZCBkaXJ0IGF0IHBlZ21hbidzIGN1cnJlbnQgcG9zaXRpb24uXG4gKi9cbk1hemUuc2NoZWR1bGVGaWxsID0gZnVuY3Rpb24oKSB7XG4gIHNjaGVkdWxlRGlydENoYW5nZSh7XG4gICAgYW1vdW50OiAxLFxuICAgIHNvdW5kOiAnZmlsbCdcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRvIHJlbW92ZSBkaXJ0IGF0IHBlZ21hbidzIGN1cnJlbnQgbG9jYXRpb24uXG4gKi9cbk1hemUuc2NoZWR1bGVEaWcgPSBmdW5jdGlvbigpIHtcbiAgc2NoZWR1bGVEaXJ0Q2hhbmdlKHtcbiAgICBhbW91bnQ6IC0xLFxuICAgIHNvdW5kOiAnZGlnJ1xuICB9KTtcbn07XG5cbi8qKlxuICogRGlzcGxheSB0aGUgbG9vayBpY29uIGF0IFBlZ21hbidzIGN1cnJlbnQgbG9jYXRpb24sXG4gKiBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdGlvbi5cbiAqIEBwYXJhbSB7IURpcmVjdGlvbn0gZCBEaXJlY3Rpb24gKDAgLSAzKS5cbiAqL1xuTWF6ZS5zY2hlZHVsZUxvb2sgPSBmdW5jdGlvbihkKSB7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgc3dpdGNoIChkKSB7XG4gICAgY2FzZSBEaXJlY3Rpb24uTk9SVEg6XG4gICAgICB4ICs9IDAuNTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLkVBU1Q6XG4gICAgICB4ICs9IDE7XG4gICAgICB5ICs9IDAuNTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLlNPVVRIOlxuICAgICAgeCArPSAwLjU7XG4gICAgICB5ICs9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5XRVNUOlxuICAgICAgeSArPSAwLjU7XG4gICAgICBicmVhaztcbiAgfVxuICB4ICo9IE1hemUuU1FVQVJFX1NJWkU7XG4gIHkgKj0gTWF6ZS5TUVVBUkVfU0laRTtcbiAgZCA9IGQgKiA5MCAtIDQ1O1xuXG4gIHZhciBsb29rSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb29rJyk7XG4gIGxvb2tJY29uLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyxcbiAgICAgICd0cmFuc2xhdGUoJyArIHggKyAnLCAnICsgeSArICcpICcgK1xuICAgICAgJ3JvdGF0ZSgnICsgZCArICcgMCAwKSBzY2FsZSguNCknKTtcbiAgdmFyIHBhdGhzID0gbG9va0ljb24uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhdGgnKTtcbiAgbG9va0ljb24uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICBNYXplLnNjaGVkdWxlTG9va1N0ZXAocGF0aCwgc3RlcFNwZWVkICogaSk7XG4gIH1cbn07XG5cbi8qKlxuICogU2NoZWR1bGUgb25lIG9mIHRoZSAnbG9vaycgaWNvbidzIHdhdmVzIHRvIGFwcGVhciwgdGhlbiBkaXNhcHBlYXIuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYXRoIEVsZW1lbnQgdG8gbWFrZSBhcHBlYXIuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsYXkgTWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIG1ha2luZyB3YXZlIGFwcGVhci5cbiAqL1xuTWF6ZS5zY2hlZHVsZUxvb2tTdGVwID0gZnVuY3Rpb24ocGF0aCwgZGVsYXkpIHtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBwYXRoLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHBhdGguc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9LCBzdGVwU3BlZWQgKiAyKTtcbiAgfSwgZGVsYXkpO1xufTtcblxuZnVuY3Rpb24gYXRGaW5pc2ggKCkge1xuICByZXR1cm4gIU1hemUuZmluaXNoXyB8fFxuICAgICAgKE1hemUucGVnbWFuWCA9PSBNYXplLmZpbmlzaF8ueCAmJiBNYXplLnBlZ21hblkgPT0gTWF6ZS5maW5pc2hfLnkpO1xufVxuXG5mdW5jdGlvbiBpc0RpcnRDb3JyZWN0ICgpIHtcbiAgaWYoIU1hemUuZGlydF8pIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZvciAodmFyIHkgPSAwOyB5IDwgTWF6ZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IE1hemUuQ09MUzsgeCsrKSB7XG4gICAgICBpZiAoZ2V0VGlsZShNYXplLmRpcnRfLCB4LCB5KSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYWxsIGdvYWxzIGhhdmUgYmVlbiBhY2NvbXBsaXNoZWRcbiAqL1xuTWF6ZS5jaGVja1N1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZpbmlzaGVkO1xuICBpZiAoIWF0RmluaXNoKCkpIHtcbiAgICBmaW5pc2hlZCA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKE1hemUuYmVlKSB7XG4gICAgZmluaXNoZWQgPSBNYXplLmJlZS5maW5pc2hlZCgpO1xuICB9IGVsc2UgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgIGZpbmlzaGVkID0gTWF6ZS53b3JkU2VhcmNoLmZpbmlzaGVkKCk7XG4gIH0gZWxzZSB7XG4gICAgZmluaXNoZWQgPSBpc0RpcnRDb3JyZWN0KCk7XG4gIH1cblxuICBpZiAoZmluaXNoZWQpIHtcbiAgICAvLyBGaW5pc2hlZC4gIFRlcm1pbmF0ZSB0aGUgdXNlcidzIHByb2dyYW0uXG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdmaW5pc2gnLCBudWxsKTtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKHRydWUpO1xuICB9XG4gIHJldHVybiBmaW5pc2hlZDtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGFmdGVyIHVzZXIncyBjb2RlIGhhcyBmaW5pc2hlZCBiZWluZyBleGVjdXRlZCwgZ2l2aW5nIHVzIG9uZSBtb3JlXG4gKiBjaGFuY2UgdG8gY2hlY2sgaWYgd2UndmUgYWNjb21wbGlzaGVkIG91ciBnb2Fscy4gVGhpcyBpcyByZXF1aXJlZCBpbiBwYXJ0XG4gKiBiZWNhdXNlIGVsc2V3aGVyZSB3ZSBvbmx5IGNoZWNrIGZvciBzdWNjZXNzIGFmdGVyIG1vdmVtZW50LlxuICovXG5NYXplLm9uRXhlY3V0aW9uRmluaXNoID0gZnVuY3Rpb24gKCkge1xuICAvLyBJZiB3ZSBoYXZlbid0IHRlcm1pbmF0ZWQsIG1ha2Ugb25lIGxhc3QgY2hlY2sgZm9yIHN1Y2Nlc3NcbiAgaWYgKCFNYXplLmV4ZWN1dGlvbkluZm8uaXNUZXJtaW5hdGVkKCkpIHtcbiAgICBNYXplLmNoZWNrU3VjY2VzcygpO1xuICB9XG5cbiAgaWYgKE1hemUuYmVlKSB7XG4gICAgTWF6ZS5iZWUub25FeGVjdXRpb25GaW5pc2goKTtcbiAgfVxufTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGNlbGxJZCA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJykuY2VsbElkO1xuXG52YXIgU3F1YXJlVHlwZSA9IHJlcXVpcmUoJy4vdGlsZXMnKS5TcXVhcmVUeXBlO1xuXG52YXIgU1ZHX05TID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJykuU1ZHX05TO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBXb3JkU2VhcmNoLlxuICovXG52YXIgV29yZFNlYXJjaCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGdvYWwsIG1hcCwgZHJhd1RpbGVGbikge1xuICB0aGlzLmdvYWxfID0gZ29hbDtcbiAgdGhpcy52aXNpdGVkXyA9ICcnO1xuICB0aGlzLm1hcF8gPSBtYXA7XG59O1xuXG52YXIgQUxMX0NIQVJTID0gW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJGXCIsIFwiR1wiLCBcIkhcIiwgXCJJXCIsIFwiSlwiLCBcIktcIiwgXCJMXCIsXG4gIFwiTVwiLCBcIk5cIiwgXCJPXCIsIFwiUFwiLCBcIlFcIiwgXCJSXCIsIFwiU1wiLCBcIlRcIiwgXCJVXCIsIFwiVlwiLCBcIldcIiwgXCJYXCIsIFwiWVwiLCBcIlpcIl07XG5cbnZhciBTVEFSVF9DSEFSID0gJy0nO1xudmFyIEVNUFRZX0NIQVIgPSAnXyc7XG5cbi8vIHRoaXMgc2hvdWxkIG1hdGNoIHdpdGggTWF6ZS5TUVVBUkVfU0laRVxudmFyIFNRVUFSRV9TSVpFID0gNTA7XG5cbi8qKlxuICogR2VuZXJhdGUgcmFuZG9tIHRpbGVzIGZvciB3YWxscyAod2l0aCBzb21lIHJlc3RyaWN0aW9ucykgYW5kIGRyYXcgdGhlbSB0b1xuICogdGhlIHN2Zy5cbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUuZHJhd01hcFRpbGVzID0gZnVuY3Rpb24gKHN2Zykge1xuICB2YXIgbGV0dGVyO1xuICB2YXIgcmVzdHJpY3RlZDtcblxuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLm1hcF8ubGVuZ3RoOyByb3crKykge1xuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMubWFwX1tyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgIHZhciBtYXBWYWwgPSB0aGlzLm1hcF9bcm93XVtjb2xdO1xuICAgICAgaWYgKG1hcFZhbCA9PT0gRU1QVFlfQ0hBUikge1xuICAgICAgICByZXN0cmljdGVkID0gdGhpcy5yZXN0cmljdGVkVmFsdWVzXyhyb3csIGNvbCk7XG4gICAgICAgIGxldHRlciA9IHJhbmRvbUxldHRlcihyZXN0cmljdGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldHRlciA9IGxldHRlclZhbHVlKG1hcFZhbCwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZHJhd1RpbGVfKHN2ZywgbGV0dGVyLCByb3csIGNvbCk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB3ZSd2ZSBzcGVsbGVkIHRoZSByaWdodCB3b3JkLlxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5maW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudmlzaXRlZF8gPT09IHRoaXMuZ29hbF87XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gcm93LGNvbCBpcyBib3RoIG9uIHRoZSBncmlkIGFuZCBub3QgYSB3YWxsXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLmlzT3Blbl8gPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgdmFyIG1hcCA9IHRoaXMubWFwXztcbiAgcmV0dXJuICgobWFwW3Jvd10gIT09IHVuZGVmaW5lZCkgJiZcbiAgICAobWFwW3Jvd11bY29sXSAhPT0gdW5kZWZpbmVkKSAmJlxuICAgIChtYXBbcm93XVtjb2xdICE9PSBTcXVhcmVUeXBlLldBTEwpKTtcbn07XG5cbi8qKlxuICogR2l2ZW4gYSByb3cgYW5kIGNvbCwgcmV0dXJucyB0aGUgcm93LCBjb2wgcGFpciBvZiBhbnkgbm9uLXdhbGwgbmVpZ2hib3JzXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLm9wZW5OZWlnaGJvcnNfID1mdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgdmFyIG5laWdoYm9ycyA9IFtdO1xuICBpZiAodGhpcy5pc09wZW5fKHJvdyArIDEsIGNvbCkpIHtcbiAgICBuZWlnaGJvcnMucHVzaChbcm93ICsgMSwgY29sXSk7XG4gIH1cbiAgaWYgKHRoaXMuaXNPcGVuXyhyb3cgLSAxLCBjb2wpKSB7XG4gICAgbmVpZ2hib3JzLnB1c2goW3JvdyAtIDEsIGNvbF0pO1xuICB9XG4gIGlmICh0aGlzLmlzT3Blbl8ocm93LCBjb2wgKyAxKSkge1xuICAgIG5laWdoYm9ycy5wdXNoKFtyb3csIGNvbCArIDFdKTtcbiAgfVxuICBpZiAodGhpcy5pc09wZW5fKHJvdywgY29sIC0gMSkpIHtcbiAgICBuZWlnaGJvcnMucHVzaChbcm93LCBjb2wgLSAxXSk7XG4gIH1cblxuICByZXR1cm4gbmVpZ2hib3JzO1xufTtcblxuLyoqXG4gKiBXZSBuZXZlciB3YW50IHRvIGhhdmUgYSBicmFuY2ggd2hlcmUgZWl0aGVyIGRpcmVjdGlvbiBnZXRzIHlvdSB0aGUgbmV4dFxuICogY29ycmVjdCBsZXR0ZXIuICBBcyBzdWNoLCBhIFwid2FsbFwiIHNwYWNlIHNob3VsZCBuZXZlciBoYXZlIHRoZSBzYW1lIHZhbHVlIGFzXG4gKiBhbiBvcGVuIG5laWdoYm9yIG9mIGFuIG5laWdoYm9yIChpLmUuIGlmIG15IG5vbi13YWxsIG5laWdoYm9yIGhhcyBhIG5vbi13YWxsXG4gKiBuZWlnaGJvciB3aG9zZSB2YWx1ZSBpcyBFLCBJIGNhbid0IGFsc28gYmUgRSlcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUucmVzdHJpY3RlZFZhbHVlc18gPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgdmFyIG1hcCA9IHRoaXMubWFwXztcbiAgdmFyIG5laWdoYm9ycyA9IHRoaXMub3Blbk5laWdoYm9yc18ocm93LCBjb2wpO1xuICB2YXIgdmFsdWVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbmVpZ2hib3JzLmxlbmd0aDsgaSArKykge1xuICAgIHZhciBzZWNvbmROZWlnaGJvcnMgPSB0aGlzLm9wZW5OZWlnaGJvcnNfKG5laWdoYm9yc1tpXVswXSwgbmVpZ2hib3JzW2ldWzFdKTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNlY29uZE5laWdoYm9ycy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIG5laWdoYm9yUm93ID0gc2Vjb25kTmVpZ2hib3JzW2pdWzBdO1xuICAgICAgdmFyIG5laWdoYm9yQ29sID0gc2Vjb25kTmVpZ2hib3JzW2pdWzFdO1xuICAgICAgLy8gcHVzaCB2YWx1ZSB0byByZXN0cmljdGVkIGxpc3RcbiAgICAgIHZhciB2YWwgPSBsZXR0ZXJWYWx1ZShtYXBbbmVpZ2hib3JSb3ddW25laWdoYm9yQ29sXSwgZmFsc2UpO1xuICAgICAgdmFsdWVzLnB1c2godmFsLCBmYWxzZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG4vKipcbiAqIERyYXcgYSBnaXZlbiB0aWxlLiAgT3ZlcnJpZGVzIHRoZSBsb2dpYyBvZiBNYXplLmRyYXdUaWxlXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLmRyYXdUaWxlXyA9IGZ1bmN0aW9uIChzdmcsIGxldHRlciwgcm93LCBjb2wpIHtcbiAgdmFyIGJhY2tncm91bmRJZCA9IGNlbGxJZCgnYmFja2dyb3VuZExldHRlcicsIHJvdywgY29sKTtcbiAgdmFyIHRleHRJZCA9IGNlbGxJZCgnbGV0dGVyJywgcm93LCBjb2wpO1xuXG4gIHZhciBncm91cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdnJyk7XG4gIHZhciBiYWNrZ3JvdW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ2lkJywgYmFja2dyb3VuZElkKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCdzdHJva2UnLCAnIzAwMDAwMCcpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgMyk7XG4gIGdyb3VwLmFwcGVuZENoaWxkKGJhY2tncm91bmQpO1xuXG4gIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3RleHQnKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGV4dElkKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3NlYXJjaC1sZXR0ZXInKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgneCcsIChjb2wgKyAwLjUpICogU1FVQVJFX1NJWkUpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgneScsIChyb3cgKyAwLjUpICogU1FVQVJFX1NJWkUpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnZm9udC1zaXplJywgMzIpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgndGV4dC1hbmNob3InLCAnbWlkZGxlJyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdmb250LWZhbWlseScsICdWZXJkYW5hJyk7XG4gIHRleHQudGV4dENvbnRlbnQgPSBsZXR0ZXI7XG4gIGdyb3VwLmFwcGVuZENoaWxkKHRleHQpO1xuICBzdmcuYXBwZW5kQ2hpbGQoZ3JvdXApO1xufTtcblxuLyoqXG4gKiBSZXNldCBhbGwgdGlsZXMgdG8gYmVnaW5uaW5nIHN0YXRlXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLnJlc2V0VGlsZXMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMubWFwXy5sZW5ndGg7IHJvdysrKSB7XG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5tYXBfW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgdGhpcy51cGRhdGVUaWxlSGlnaGxpZ2h0Xyhyb3csIGNvbCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudFdvcmRDb250ZW50cycpLnRleHRDb250ZW50ID0gJyc7XG4gIHRoaXMudmlzaXRlZF8gPSAnJztcbn07XG5cbi8qKlxuICogVXBkYXRlIGEgdGlsZSdzIGhpZ2hsaWdodGluZy4gSWYgd2UndmUgZmxvd24gb3ZlciBpdCwgaXQgc2hvdWxkIGJlIGdyZWVuLlxuICogT3RoZXJ3aXNlIHdlIGhhdmUgYSBjaGVja2JvYXJkIGFwcHJvYWNoLlxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS51cGRhdGVUaWxlSGlnaGxpZ2h0XyA9IGZ1bmN0aW9uIChyb3csIGNvbCwgaGlnaGxpZ2h0ZWQpIHtcbiAgdmFyIGJhY2tDb2xvciA9IChyb3cgKyBjb2wpICUgMiA9PT0gMCA/ICcjZGFlM2YzJyA6ICcjZmZmZmZmJztcbiAgdmFyIHRleHRDb2xvciA9IGhpZ2hsaWdodGVkID8gJ3doaXRlJyA6ICdibGFjayc7XG4gIGlmIChoaWdobGlnaHRlZCkge1xuICAgIGJhY2tDb2xvciA9ICcjMDBiMDUwJztcbiAgfVxuICB2YXIgYmFja2dyb3VuZElkID0gY2VsbElkKCdiYWNrZ3JvdW5kTGV0dGVyJywgcm93LCBjb2wpO1xuICB2YXIgdGV4dElkID0gY2VsbElkKCdsZXR0ZXInLCByb3csIGNvbCk7XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYmFja2dyb3VuZElkKS5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBiYWNrQ29sb3IpO1xuICB2YXIgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRleHRJZCk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdmaWxsJywgdGV4dENvbG9yKTtcblxuICAvLyBzaG91bGQgb25seSBiZSBmYWxzZSBpbiB1bml0IHRlc3RzXG4gIGlmICh0ZXh0LmdldEJCb3gpIHtcbiAgICAvLyBjZW50ZXIgdGV4dC5cbiAgICB2YXIgYmJveCA9IHRleHQuZ2V0QkJveCgpO1xuICAgIHZhciBoZWlnaHREaWZmID0gU1FVQVJFX1NJWkUgLSBiYm94LmhlaWdodDtcbiAgICB2YXIgdGFyZ2V0VG9wWSA9IHJvdyAqIFNRVUFSRV9TSVpFICsgaGVpZ2h0RGlmZiAvIDI7XG4gICAgdmFyIG9mZnNldCA9IHRhcmdldFRvcFkgLSBiYm94Lnk7XG5cbiAgICB0ZXh0LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIG9mZnNldCArIFwiKVwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXJrIHRoYXQgd2UndmUgdmlzaXRlZCBhIHRpbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByb3cgUm93IHZpc2l0ZWRcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2wgQ29sdW1uIHZpc2l0ZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW5pbWF0aW5nIFRydWUgaWYgdGhpcyBpcyB3aGlsZSBhbmltYXRpbmdcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUubWFya1RpbGVWaXNpdGVkID0gZnVuY3Rpb24gKHJvdywgY29sLCBhbmltYXRpbmcpIHtcbiAgdmFyIGxldHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNlbGxJZCgnbGV0dGVyJywgcm93LCBjb2wpKS50ZXh0Q29udGVudDtcbiAgdGhpcy52aXNpdGVkXyArPSBsZXR0ZXI7XG5cbiAgaWYgKGFuaW1hdGluZykge1xuICAgIHRoaXMudXBkYXRlVGlsZUhpZ2hsaWdodF8ocm93LCBjb2wsIHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50V29yZENvbnRlbnRzJykudGV4dENvbnRlbnQgPSB0aGlzLnZpc2l0ZWRfO1xuICB9XG59O1xuXG4vKipcbiAqIEZvciB3b3Jkc2VhcmNoLCB2YWx1ZXMgaW4gTWF6ZS5tYXAgY2FuIHRha2UgdGhlIGZvcm0gb2YgYSBudW1iZXIgKGkuZS4gMiBtZWFuc1xuICogc3RhcnQpLCBhIGxldHRlciAoJ0EnIG1lYW5zIEEpLCBvciBhIGxldHRlciBmb2xsb3dlZCBieSB4ICgnTngnIG1lYW5zIE4gYW5kXG4gKiB0aGF0IHRoaXMgaXMgdGhlIGZpbmlzaC4gIFRoaXMgZnVuY3Rpb24gd2lsbCBzdHJpcCB0aGUgeCwgYW5kIHdpbGwgY29udmVydFxuICogbnVtYmVyIHZhbHVlcyB0byBTVEFSVF9DSEFSXG4gKi9cbmZ1bmN0aW9uIGxldHRlclZhbHVlKHZhbCkge1xuICBpZiAodHlwZW9mKHZhbCkgPT09IFwibnVtYmVyXCIpIHtcbiAgICByZXR1cm4gU1RBUlRfQ0hBUjtcbiAgfVxuXG4gIGlmICh0eXBlb2YodmFsKSA9PT0gXCJzdHJpbmdcIikge1xuICAgIC8vIHRlbXBvcmFyeSBoYWNrIHRvIGFsbG93IHVzIHRvIGhhdmUgNCBhcyBhIGxldHRlclxuICAgIGlmICh2YWwubGVuZ3RoID09PSAyICYmIHZhbFswXSA9PT0gJ18nKSB7XG4gICAgICByZXR1cm4gdmFsWzFdO1xuICAgIH1cbiAgICByZXR1cm4gdmFsWzBdO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKFwidW5leHBlY3RlZCB2YWx1ZSBmb3IgbGV0dGVyVmFsdWVcIik7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgcmFuZG9tIHVwcGVyY2FzZSBsZXR0ZXIgdGhhdCBpc24ndCBpbiB0aGUgbGlzdCBvZiByZXN0cmljdGlvbnNcbiAqL1xuZnVuY3Rpb24gcmFuZG9tTGV0dGVyIChyZXN0cmljdGlvbnMpIHtcbiAgdmFyIGxldHRlclBvb2w7XG4gIGlmIChyZXN0cmljdGlvbnMpIHtcbiAgICAvLyBhcmdzIGNvbnNpc3RzIG9mIEFMTF9DSEFSUyBmb2xsb3dlZCBieSB0aGUgc2V0IG9mIHJlc3RyaWN0ZWQgbGV0dGVyc1xuICAgIHZhciBhcmdzID0gcmVzdHJpY3Rpb25zIHx8IFtdO1xuICAgIGFyZ3MudW5zaGlmdChBTExfQ0hBUlMpO1xuICAgIGxldHRlclBvb2wgPSBfLndpdGhvdXQuYXBwbHkobnVsbCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgbGV0dGVyUG9vbCA9IEFMTF9DSEFSUztcbiAgfVxuXG4gIHJldHVybiBfLnNhbXBsZShsZXR0ZXJQb29sKTtcbn1cblxuXG5cbi8qIHN0YXJ0LXRlc3QtYmxvY2sgKi9cbi8vIGV4cG9ydCBwcml2YXRlIGZ1bmN0aW9uKHMpIHRvIGV4cG9zZSB0byB1bml0IHRlc3RpbmdcbldvcmRTZWFyY2guX190ZXN0b25seV9fID0ge1xuICBsZXR0ZXJWYWx1ZTogbGV0dGVyVmFsdWUsXG4gIHJhbmRvbUxldHRlcjogcmFuZG9tTGV0dGVyLFxuICBTVEFSVF9DSEFSOiBTVEFSVF9DSEFSLFxuICBFTVBUWV9DSEFSOiBFTVBUWV9DSEFSXG59O1xuLyogZW5kLXRlc3QtYmxvY2sgKi9cbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnTWF6ZVwiPlxcbiAgPGcgaWQ9XCJsb29rXCI+XFxuICAgIDxwYXRoIGQ9XCJNIDAsLTE1IGEgMTUgMTUgMCAwIDEgMTUgMTVcIiAvPlxcbiAgICA8cGF0aCBkPVwiTSAwLC0zNSBhIDM1IDM1IDAgMCAxIDM1IDM1XCIgLz5cXG4gICAgPHBhdGggZD1cIk0gMCwtNTUgYSA1NSA1NSAwIDAgMSA1NSA1NVwiIC8+XFxuICA8L2c+XFxuPC9zdmc+XFxuPGRpdiBpZD1cImNhcGFjaXR5QnViYmxlXCI+XFxuICA8ZGl2IGlkPVwiY2FwYWNpdHlcIj48L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgU3F1YXJlVHlwZSA9IHJlcXVpcmUoJy4vdGlsZXMnKS5TcXVhcmVUeXBlO1xudmFyIERpcmVjdGlvbiA9IHJlcXVpcmUoJy4vdGlsZXMnKS5EaXJlY3Rpb247XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG5cbnZhciBUSUxFX1NIQVBFUyA9IHtcbiAgJ2xvZyc6ICAgICAgICAgICAgIFswLCAwXSxcbiAgJ2xpbHkxJzogICAgICAgICAgIFsxLCAwXSxcbiAgJ2xhbmQxJzogICAgICAgICAgIFsyLCAwXSxcbiAgJ2lzbGFuZF9zdGFydCc6ICAgIFswLCAxXSxcbiAgJ2lzbGFuZF90b3BSaWdodCc6IFsxLCAxXSxcbiAgJ2lzbGFuZF9ib3RMZWZ0JzogIFswLCAyXSxcbiAgJ2lzbGFuZF9ib3RSaWdodCc6IFsxLCAyXSxcbiAgJ3dhdGVyJzogWzQsIDBdLFxuXG4gICdsaWx5Mic6IFsyLCAxXSxcbiAgJ2xpbHkzJzogWzMsIDFdLFxuICAnbGlseTQnOiBbMiwgMl0sXG4gICdsaWx5NSc6IFszLCAyXSxcblxuICAnaWNlJzogWzMsIDBdLFxuXG4gICdlbXB0eSc6IFs0LCAwXVxufTtcblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSB0aWxlIGF0IHgseSBpcyBlaXRoZXIgYSB3YXRlciB0aWxlIG9yIG91dCBvZiBib3VuZHNcbmZ1bmN0aW9uIGlzV2F0ZXJPck91dE9mQm91bmRzICh4LCB5KSB7XG4gIHJldHVybiBNYXplLm1hcFt5XSA9PT0gdW5kZWZpbmVkIHx8IE1hemUubWFwW3ldW3hdID09PSB1bmRlZmluZWQgfHxcbiAgICBNYXplLm1hcFt5XVt4XSA9PT0gU3F1YXJlVHlwZS5XQUxMO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRpbGUgYXQgeCx5IGlzIGEgd2F0ZXIgdGlsZSB0aGF0IGlzIGluIGJvdW5kcy5cbmZ1bmN0aW9uIGlzV2F0ZXIgKHgsIHkpIHtcbiAgcmV0dXJuIE1hemUubWFwW3ldICE9PSB1bmRlZmluZWQgJiYgTWF6ZS5tYXBbeV1beF0gPT09IFNxdWFyZVR5cGUuV0FMTDtcbn1cblxuLyoqXG4gKiBPdmVycmlkZSBtYXplJ3MgZHJhd01hcFRpbGVzXG4gKi9cbm1vZHVsZS5leHBvcnRzLmRyYXdNYXBUaWxlcyA9IGZ1bmN0aW9uIChzdmcpIHtcbiAgdmFyIHJvdywgY29sO1xuXG4gIC8vIGZpcnN0IGZpZ3VyZSBvdXQgd2hlcmUgd2Ugd2FudCB0byBwdXQgdGhlIGlzbGFuZFxuICB2YXIgcG9zc2libGVJc2xhbmRMb2NhdGlvbnMgPSBbXTtcbiAgZm9yIChyb3cgPSAwOyByb3cgPCBNYXplLlJPV1M7IHJvdysrKSB7XG4gICAgZm9yIChjb2wgPSAwOyBjb2wgPCBNYXplLkNPTFM7IGNvbCsrKSB7XG4gICAgICBpZiAoIWlzV2F0ZXIoY29sLCByb3cpIHx8ICFpc1dhdGVyKGNvbCArIDEsIHJvdykgfHxcbiAgICAgICAgIWlzV2F0ZXIoY29sLCByb3cgKyAxKSB8fCAhaXNXYXRlcihjb2wgKyAxLCByb3cgKyAxKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHBvc3NpYmxlSXNsYW5kTG9jYXRpb25zLnB1c2goe3Jvdzogcm93LCBjb2w6IGNvbH0pO1xuICAgIH1cbiAgfVxuICB2YXIgaXNsYW5kID0gXy5zYW1wbGUocG9zc2libGVJc2xhbmRMb2NhdGlvbnMpO1xuICB2YXIgcHJlRmlsbGVkID0ge307XG4gIGlmIChpc2xhbmQpIHtcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAwKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAwKV0gPSAnaXNsYW5kX3N0YXJ0JztcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAxKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAwKV0gPSAnaXNsYW5kX2JvdExlZnQnO1xuICAgIHByZUZpbGxlZFsoaXNsYW5kLnJvdyArIDApICsgXCJfXCIgKyAoaXNsYW5kLmNvbCArIDEpXSA9ICdpc2xhbmRfdG9wUmlnaHQnO1xuICAgIHByZUZpbGxlZFsoaXNsYW5kLnJvdyArIDEpICsgXCJfXCIgKyAoaXNsYW5kLmNvbCArIDEpXSA9ICdpc2xhbmRfYm90UmlnaHQnO1xuICB9XG5cbiAgdmFyIHRpbGVJZCA9IDA7XG4gIHZhciB0aWxlO1xuICBmb3IgKHJvdyA9IDA7IHJvdyA8IE1hemUuUk9XUzsgcm93KyspIHtcbiAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IE1hemUuQ09MUzsgY29sKyspIHtcbiAgICAgIGlmICghaXNXYXRlck9yT3V0T2ZCb3VuZHMoY29sLCByb3cpKSB7XG4gICAgICAgIHRpbGUgPSAnaWNlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhZGphY2VudFRvUGF0aCA9ICFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wsIHJvdyAtIDEpIHx8XG4gICAgICAgICAgIWlzV2F0ZXJPck91dE9mQm91bmRzKGNvbCArIDEsIHJvdykgfHxcbiAgICAgICAgICAhaXNXYXRlck9yT3V0T2ZCb3VuZHMoY29sLCByb3cgKyAxKSB8fFxuICAgICAgICAgICFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wgLSAxLCByb3cpO1xuXG4gICAgICAgIC8vIGlmIG5leHQgdG8gdGhlIHBhdGgsIGFsd2F5cyBqdXN0IGhhdmUgd2F0ZXIuIG90aGVyd2lzZSwgdGhlcmUnc1xuICAgICAgICAvLyBhIGNoYW5jZSBvZiBvbmUgb2Ygb3VyIG90aGVyIHRpbGVzXG4gICAgICAgIHRpbGUgPSAnd2F0ZXInO1xuXG4gICAgICAgIHRpbGUgPSBwcmVGaWxsZWRbcm93ICsgXCJfXCIgKyBjb2xdO1xuICAgICAgICBpZiAoIXRpbGUpIHtcbiAgICAgICAgICB0aWxlID0gXy5zYW1wbGUoWydlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdsaWx5MicsXG4gICAgICAgICAgICAnbGlseTMnLCAnbGlseTQnLCAnbGlseTUnLCAnbGlseTEnLCAnbG9nJywgJ2xpbHkxJywgJ2xhbmQxJ10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFkamFjZW50VG9QYXRoICYmIHRpbGUgPT09ICdsYW5kMScpIHtcbiAgICAgICAgICB0aWxlID0gJ2VtcHR5JztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgTWF6ZS5kcmF3VGlsZShzdmcsIFRJTEVfU0hBUEVTW3RpbGVdLCByb3csIGNvbCwgdGlsZUlkKTtcbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTY2hlZHVsZSB0aGUgYW5pbWF0aW9ucyBmb3IgU2NyYXQgZGFuY2luZy5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gdGltZUFsbG90ZWQgSG93IG11Y2ggdGltZSB3ZSBoYXZlIGZvciBvdXIgYW5pbWF0aW9uc1xuICovXG5tb2R1bGUuZXhwb3J0cy5zY2hlZHVsZURhbmNlID0gZnVuY3Rpb24gKHZpY3RvcnlEYW5jZSwgdGltZUFsbG90ZWQsIHNraW4pIHtcbiAgdmFyIGZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluaXNoJyk7XG4gIGlmIChmaW5pc2hJY29uKSB7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICB2YXIgbnVtRnJhbWVzID0gc2tpbi5jZWxlYnJhdGVQZWdtYW5Sb3c7XG4gIHZhciB0aW1lUGVyRnJhbWUgPSB0aW1lQWxsb3RlZCAvIG51bUZyYW1lcztcbiAgdmFyIHN0YXJ0ID0ge3g6IE1hemUucGVnbWFuWCwgeTogTWF6ZS5wZWdtYW5ZfTtcblxuICBNYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50KHt4OiBzdGFydC54LCB5OiBzdGFydC55fSwge3g6IDAsIHk6IDAgfSxcbiAgICBudW1GcmFtZXMsIHRpbWVQZXJGcmFtZSwgJ2NlbGVicmF0ZScsIERpcmVjdGlvbi5OT1JUSCwgdHJ1ZSk7XG5cbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG59O1xuIiwidmFyIERpcmVjdGlvbiA9IHJlcXVpcmUoJy4vdGlsZXMnKS5EaXJlY3Rpb247XG52YXIga2FyZWxMZXZlbHMgPSByZXF1aXJlKCcuL2thcmVsTGV2ZWxzJyk7XG52YXIgd29yZHNlYXJjaExldmVscyA9IHJlcXVpcmUoJy4vd29yZHNlYXJjaExldmVscycpO1xudmFyIHJlcUJsb2NrcyA9IHJlcXVpcmUoJy4vcmVxdWlyZWRCbG9ja3MnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbWF6ZU1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgdG9vbGJveC5cbnZhciB0b29sYm94ID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vdG9vbGJveGVzL21hemUueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgc3RhcnRCbG9ja3MuXG52YXIgc3RhcnRCbG9ja3MgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi9zdGFydEJsb2Nrcy54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIEZvcm1lcmx5IFBhZ2UgMlxuXG4gICcyXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDMsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxKVxuICB9LFxuICAnazFfZGVtbyc6IHtcbiAgICAndG9vbGJveCc6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZU5vcnRoJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlU291dGgnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVFYXN0JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlV2VzdCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ2NvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkJylcbiAgICApLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDMsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxKVxuICB9LFxuICAnMl8yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAyKSxcbiAgICAnaWRlYWwnOiAzLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMiwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMywgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDIpXG4gIH0sXG4gICcyXzJfNSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMyksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDQsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDQsIDAsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAzKVxuICB9LFxuICAnMl8zJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAzKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgNCwgMSwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDMpXG4gIH0sXG4gICcyXzQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDQpLFxuICAgICdpZGVhbCc6IDksXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCA0LCAwLCAzLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfNSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNSksXG4gICAgJ2lkZWFsJzogMyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLkZPUl9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAyLCAxLCAxLCAxLCAxLCAzLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfNic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNiksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5GT1JfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMiwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMywgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzcnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDcpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5GT1JfTE9PUF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMywgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzgnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5GT1JfTE9PUF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDMsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA4KSxcbiAgICAnbGV2ZWxJbmNvbXBsZXRlRXJyb3InOiBtYXplTXNnLnJlcGVhdENhcmVmdWxseUVycm9yKCksXG4gICAgJ3Rvb0Zld0Jsb2Nrc01zZyc6IG1hemVNc2cucmVwZWF0Q2FyZWZ1bGx5RXJyb3IoKVxuICB9LFxuICAnMl85Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA5KSxcbiAgICAnaWRlYWwnOiAzLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMiwgMSwgMSwgMSwgMSwgMywgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzEwJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxMCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDMsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTEpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDMsIDFdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDEsIDEsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzIsIDEsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTIpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzEsIDIsIDQsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDEsIDEsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDMsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDFdXG4gICAgXVxuICB9LFxuICAnMl8xMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTMpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDMsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDIsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDQsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxMylcbiAgfSxcbiAgJzJfMTQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE0KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5JU19QQVRIX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgNCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMSwgNF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMywgMSwgMSwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdsZXZlbEluY29tcGxldGVFcnJvcic6IG1hemVNc2cuaWZJblJlcGVhdEVycm9yKCksXG4gICAgJ3Nob3dQcmV2aW91c0xldmVsQnV0dG9uJzogdHJ1ZVxuICB9LFxuICAnMl8xNSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTUpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuSVNfUEFUSF9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5OT1JUSCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDQsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDEsIDEsIDEsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDEsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDEsIDAsIDMsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDEsIDAsIDEsIDAsIDEsIDEsIDRdLFxuICAgICAgWzAsIDEsIDEsIDEsIDAsIDIsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xNic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTYpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLklTX1BBVEhfUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgNCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMSwgMiwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMSwgNF0sXG4gICAgICBbMCwgMSwgMSwgMywgMCwgMSwgMCwgNF0sXG4gICAgICBbMCwgMSwgMCwgMCwgMCwgMSwgMCwgMV0sXG4gICAgICBbMCwgMSwgMSwgMSwgMSwgMSwgMSwgMV0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzE3Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxNyksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5JU19QQVRIX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAxLCA0LCAxLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFszLCAxLCAxLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgIFswLCAxLCAwLCAxLCAwLCAwLCAxLCAwXSxcbiAgICAgIFsxLCAxLCAxLCA0LCAxLCAwLCAxLCAwXSxcbiAgICAgIFswLCAxLCAwLCAxLCAwLCAyLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTgnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE4KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLklTX1BBVEhfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCA0LCAwLCA0LCAwLCA0LCAwXSxcbiAgICAgIFswLCAwLCAxLCAwLCAxLCAwLCAxLCAwXSxcbiAgICAgIFswLCAyLCAxLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAwLCAxLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAwLCAxLCAxLCAwXSxcbiAgICAgIFswLCAxLCAzLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTknOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE5KSxcbiAgICAnaWRlYWwnOiA3LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uTk9SVEgsXG4gICAgJ21hcCc6IFtcbiAgICAgIFsxLCAxLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgICAgIFsxLCAwLCAxLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFsxLCAwLCAxLCAwLCAxLCAxLCAxLCAxXSxcbiAgICAgIFsxLCAwLCAxLCAwLCAzLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAxLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsyLCAwLCAxLCAxLCAxLCAxLCAxLCAxXVxuICAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDE5KVxuICAgfSxcblxuICAvLyBDb3BpZWQgbGV2ZWxzIHdpdGggZWRpdENvZGUgZW5hYmxlZFxuICAnM18xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAxKSxcbiAgICAnaWRlYWwnOiAzLFxuICAgICdlZGl0Q29kZSc6IHRydWUsXG4gICAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICAgJ3R1cm5MZWZ0JzogbnVsbCxcbiAgICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXVxuICAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICczXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDIpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgICAndHVybkxlZnQnOiBudWxsLFxuICAgICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdXG4gICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMiwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMywgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICczXzMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDMpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgICAndHVybkxlZnQnOiBudWxsLFxuICAgICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDQsIDEsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnM180Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA0KSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdlZGl0Q29kZSc6IHRydWUsXG4gICAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICAgJ3R1cm5MZWZ0JzogbnVsbCxcbiAgICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDQsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnY3VzdG9tJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA0KSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDQsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9XG59O1xuXG5cbi8vIE1lcmdlIGluIEthcmVsIGxldmVscy5cbmZvciAodmFyIGxldmVsSWQgaW4ga2FyZWxMZXZlbHMpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2thcmVsXycgKyBsZXZlbElkXSA9IGthcmVsTGV2ZWxzW2xldmVsSWRdO1xufVxuXG4vLyBNZXJnZSBpbiBXb3Jkc2VhcmNoIGxldmVscy5cbmZvciAodmFyIGxldmVsSWQgaW4gd29yZHNlYXJjaExldmVscykge1xuICBtb2R1bGUuZXhwb3J0c1snd29yZHNlYXJjaF8nICsgbGV2ZWxJZF0gPSB3b3Jkc2VhcmNoTGV2ZWxzW2xldmVsSWRdO1xufVxuXG4vLyBBZGQgc29tZSBzdGVwIGxldmVsc1xuZnVuY3Rpb24gY2xvbmVXaXRoU3RlcChsZXZlbCwgc3RlcCwgc3RlcE9ubHkpIHtcbiAgdmFyIG9iaiA9IHV0aWxzLmV4dGVuZCh7fSwgbW9kdWxlLmV4cG9ydHNbbGV2ZWxdKTtcblxuICBvYmouc3RlcCA9IHN0ZXA7XG4gIG9iai5zdGVwT25seSA9IHN0ZXBPbmx5O1xuICBtb2R1bGUuZXhwb3J0c1tsZXZlbCArICdfc3RlcCddID0gb2JqO1xufVxuXG5jbG9uZVdpdGhTdGVwKCcyXzEnLCB0cnVlLCB0cnVlKTtcbmNsb25lV2l0aFN0ZXAoJzJfMicsIHRydWUsIGZhbHNlKTtcbmNsb25lV2l0aFN0ZXAoJzJfMTcnLCB0cnVlLCBmYWxzZSk7XG5jbG9uZVdpdGhTdGVwKCdrYXJlbF8xXzknLCB0cnVlLCBmYWxzZSk7XG5jbG9uZVdpdGhTdGVwKCdrYXJlbF8yXzknLCB0cnVlLCBmYWxzZSk7XG4iLCJ2YXIgRGlyZWN0aW9uID0gcmVxdWlyZSgnLi90aWxlcycpLkRpcmVjdGlvbjtcbnZhciByZXFCbG9ja3MgPSByZXF1aXJlKCcuL3JlcXVpcmVkQmxvY2tzJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG5cbnZhciB3b3JkU2VhcmNoVG9vbGJveCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveChcbiAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVOb3J0aCcpICtcbiAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVTb3V0aCcpICtcbiAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVFYXN0JykgK1xuICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVdlc3QnKVxuICApO1xufTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAna18xJzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdzZWFyY2hXb3JkJzogJ0VBU1QnLFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgIDIsICdFJywgJ0EnLCAnUycsICdUJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnSycsICdFJywgJ0wnLCAnTCcsICdZJywgJ0InLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlRWFzdCcpXG4gIH0sXG4gICdrXzInOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZVNvdXRoXSxcbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ1NPVVRIJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ0EnLCAnTicsICdHJywgJ0knLCAnRScsICdEJywgJ08nLCAnRyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICAgMiwgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnUycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ08nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdVJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnVCcsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ0gnLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVTb3V0aCcpXG4gIH0sXG4gICdrXzMnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZVdlc3RdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdXRVNUJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uV0VTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ0wnLCAnRScsICdWJywgJ0UnLCAnTicsICdTJywgJ08nLCAnTiddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgICdUJywgJ1MnLCAnRScsICdXJywgMiwgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlV2VzdCcpXG4gIH0sXG4gICdrXzQnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZU5vcnRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnTk9SVEgnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5OT1JUSCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIC8vIFdoZW4gdGhpcyBnZXRzIHJlbW92ZWQsIGFsc28gcmVtb3ZlIHRoZSBoYWNrIGZyb20gbGV0dGVyVmFsdWVcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdHJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdIJywgJ18nLCAnTycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnVCcsICdfJywgJ180JywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdSJywgJ18nLCAnSScsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnTycsICdfJywgJ1QnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ04nLCAnXycsICdKJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAyICwgJ18nLCAnUicsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ0YnLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfNic6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVTb3V0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ0pVTVAnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydTJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnQScsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ1knLCAnXycsICAgMiwgJ0onLCAnVScsICdNJywgJ18nLCAnXyddLFxuICAgICAgWydFJywgJ18nLCAnXycsICdfJywgJ18nLCAnUCcsICdfJywgJ18nXSxcbiAgICAgIFsnRScsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ0QnLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfOSc6IHtcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZU5vcnRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnQ09ERScsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnTScsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ0EnLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdSJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnRCcsICdFJywgJ18nLCAnSycsICdfJ10sXG4gICAgICBbJ18nLCAgIDIsICdDJywgJ08nLCAnXycsICdfJywgJ04nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdQJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnQScsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ00nLCAnXyddXG4gICAgXVxuICB9LFxuICAna18xMyc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVTb3V0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ0RFQlVHJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAgIDIsICdEJywgJ0UnLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdCJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnVScsICdHJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdIJywgJ0UnLCAnTicsICdSJywgJ1knXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzE1Jzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVTb3V0aF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnQUJPVkUnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAgMiwgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnQScsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ0InLCAnTycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ1YnLCAnRScsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzE2Jzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZU5vcnRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnQkVMT1cnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdXJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnTycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdFJywgJ0wnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgICAyLCAnQicsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfMjAnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlU291dGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdTVE9SWScsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgIDIsICdTJywgJ1QnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdPJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnUicsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ1knLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9XG5cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxuICAnKTs1OyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAgICcpOzU7IGlmIChsZXZlbCA+IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZm9yZXZlclwiPjwvYmxvY2s+XFxuICAgICAgJyk7NjsgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZlwiPjx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgICAnKTs3OyB9IGVsc2UgaWYgKGxldmVsID4gNSAmJiBsZXZlbCA8IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZlwiPjwvYmxvY2s+XFxuICAgICAgJyk7ODsgfTsgYnVmLnB1c2goJyAgICAgICcpOzg7IGlmIChsZXZlbCA+IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmRWxzZVwiPjwvYmxvY2s+XFxuICAgICAgJyk7OTsgfTsgYnVmLnB1c2goJyAgICAnKTs5OyB9OyBidWYucHVzaCgnICAnKTs5OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMikgezsgYnVmLnB1c2goJyAgICAnKTs5OyBpZiAobGV2ZWwgPiA0ICYmIGxldmVsIDwgOSkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTI7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTI7IGlmIChsZXZlbCA+IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZm9yZXZlclwiPjwvYmxvY2s+XFxuICAgICAgJyk7MTM7IGlmIChsZXZlbCA9PSAxMyB8fCBsZXZlbCA9PSAxNSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmXCI+PHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhMZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgICAgICcpOzE0OyB9IGVsc2UgaWYgKGxldmVsID09IDE0IHx8IGxldmVsID09IDE2KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZcIj48dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aFJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcbiAgICAgICcpOzE1OyB9OyBidWYucHVzaCgnICAgICAgJyk7MTU7IGlmIChsZXZlbCA+IDE2KSB7OyBidWYucHVzaCgnICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZkVsc2VcIj48L2Jsb2NrPlxcbiAgICAgICcpOzE2OyB9OyBidWYucHVzaCgnICAgICcpOzE2OyB9OyBidWYucHVzaCgnICAnKTsxNjsgfTsgYnVmLnB1c2goJzwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgaWYgKHBhZ2UgPT0gMikgezsgYnVmLnB1c2goJyAgJyk7MTsgaWYgKGxldmVsIDwgNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7MjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2OyB9IGVsc2UgaWYgKGxldmVsID09IDEzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9mb3JldmVyXCIgeD1cIjIwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE3OyB9IGVsc2UgaWYgKGxldmVsID09IDE5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9mb3JldmVyXCIgeD1cIjIwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZkVsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhGb3J3YXJkPC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRUxTRVwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZkVsc2VcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI5OyB9OyBidWYucHVzaCgnJyk7Mjk7IH07IGJ1Zi5wdXNoKCcnKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgcmVxdWlyZWRCbG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vcmVxdWlyZWRfYmxvY2tfdXRpbHMnKTtcblxudmFyIE1PVkVfRk9SV0FSRCA9IHsndGVzdCc6ICdtb3ZlRm9yd2FyZCcsICd0eXBlJzogJ21hemVfbW92ZUZvcndhcmQnfTtcbnZhciBUVVJOX0xFRlQgPSB7J3Rlc3QnOiAndHVybkxlZnQnLCAndHlwZSc6ICdtYXplX3R1cm4nLCAndGl0bGVzJzogeydESVInOiAndHVybkxlZnQnfX07XG52YXIgVFVSTl9SSUdIVCA9IHsndGVzdCc6ICd0dXJuUmlnaHQnLCAndHlwZSc6ICdtYXplX3R1cm4nLCAndGl0bGVzJzogeydESVInOiAndHVyblJpZ2h0J319O1xudmFyIFdISUxFX0xPT1AgPSB7J3Rlc3QnOiAnd2hpbGUnLCAndHlwZSc6ICdtYXplX2ZvcmV2ZXInfTtcbnZhciBJU19QQVRIX0xFRlQgPSB7J3Rlc3QnOiAnaXNQYXRoTGVmdCcsICd0eXBlJzogJ21hemVfaWYnLCAndGl0bGVzJzogeydESVInOiAnaXNQYXRoTGVmdCd9fTtcbnZhciBJU19QQVRIX1JJR0hUID0geyd0ZXN0JzogJ2lzUGF0aFJpZ2h0JywgJ3R5cGUnOiAnbWF6ZV9pZicsICd0aXRsZXMnOiB7J0RJUic6ICdpc1BhdGhSaWdodCd9fTtcbnZhciBJU19QQVRIX0ZPUldBUkQgPSB7J3Rlc3QnOiAnaXNQYXRoRm9yd2FyZCcsICd0eXBlJzogJ21hemVfaWZFbHNlJywgJ3RpdGxlcyc6IHsnRElSJzogJ2lzUGF0aEZvcndhcmQnfX07XG52YXIgRk9SX0xPT1AgPSB7J3Rlc3QnOiAnZm9yJywgJ3R5cGUnOiAnY29udHJvbHNfcmVwZWF0JywgdGl0bGVzOiB7VElNRVM6ICc/Pz8nfX07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtb3ZlTm9ydGg6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jaygnbWF6ZV9tb3ZlTm9ydGgnKSxcbiAgbW92ZVNvdXRoOiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2soJ21hemVfbW92ZVNvdXRoJyksXG4gIG1vdmVFYXN0OiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2soJ21hemVfbW92ZUVhc3QnKSxcbiAgbW92ZVdlc3Q6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jaygnbWF6ZV9tb3ZlV2VzdCcpLFxuICBjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZDogcmVxdWlyZWRCbG9ja1V0aWxzLnJlcGVhdFNpbXBsZUJsb2NrKCc/Pz8nKSxcbiAgTU9WRV9GT1JXQVJEOiBNT1ZFX0ZPUldBUkQsXG4gIFRVUk5fTEVGVDogVFVSTl9MRUZULFxuICBUVVJOX1JJR0hUOiBUVVJOX1JJR0hULFxuICBXSElMRV9MT09QOiBXSElMRV9MT09QLFxuICBJU19QQVRIX0xFRlQ6IElTX1BBVEhfTEVGVCxcbiAgSVNfUEFUSF9SSUdIVDogSVNfUEFUSF9SSUdIVCxcbiAgSVNfUEFUSF9GT1JXQVJEOiBJU19QQVRIX0ZPUldBUkQsXG4gIEZPUl9MT09QOiBGT1JfTE9PUFxufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBsZXZlbEJhc2UgPSByZXF1aXJlKCcuLi9sZXZlbF9iYXNlJyk7XG52YXIgRGlyZWN0aW9uID0gcmVxdWlyZSgnLi90aWxlcycpLkRpcmVjdGlvbjtcbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHRvb2xib3guXG52YXIgdG9vbGJveCA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHZhciB0ZW1wbGF0ZTtcbiAgLy8gTXVzdCB1c2Ugc3dpdGNoLCBzaW5jZSBicm93c2VyaWZ5IG9ubHkgd29ya3Mgb24gcmVxdWlyZXMgd2l0aCBsaXRlcmFscy5cbiAgc3dpdGNoIChwYWdlKSB7XG4gICAgY2FzZSAxOlxuICAgICAgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2xib3hlcy9rYXJlbDEueG1sLmVqcycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2xib3hlcy9rYXJlbDIueG1sLmVqcycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3Rvb2xib3hlcy9rYXJlbDMueG1sLmVqcycpO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRlbXBsYXRlKHtsZXZlbDogbGV2ZWx9KTtcbn07XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgc3RhcnRCbG9ja3MuXG52YXIgc3RhcnRCbG9ja3MgPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi9rYXJlbFN0YXJ0QmxvY2tzLnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtb3ZlX2ZvcndhcmRcIiBibG9jay5cbnZhciBNT1ZFX0ZPUldBUkQgPSB7XG4gICAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ21hemVfbW92ZUZvcndhcmQnO30sXG4gICAgJ3R5cGUnOiAnbWF6ZV9tb3ZlRm9yd2FyZCdcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImRpZ1wiIGJsb2NrLlxudmFyIERJRyA9IHsndGVzdCc6ICdkaWcnLCAndHlwZSc6ICdtYXplX2RpZyd9O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJmaWxsXCIgYmxvY2suXG52YXIgRklMTCA9IHsndGVzdCc6ICdmaWxsJywgJ3R5cGUnOiAnbWF6ZV9maWxsJ307XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImNvbnRyb2xzX3JlcGVhdFwiIGJsb2NrLlxudmFyIFJFUEVBVCA9IHtcbiAgICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnY29udHJvbHNfcmVwZWF0Jzt9LFxuICAgICd0eXBlJzogJ2NvbnRyb2xzX3JlcGVhdCcsXG4gICAgJ3RpdGxlcyc6IHsnVElNRVMnOiAnPz8/J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImNvbnRyb2xzX3JlcGVhdF9leHRcIiBibG9jay5cbnZhciBSRVBFQVRfRVhUID0ge1xuICAgICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdjb250cm9sc19yZXBlYXRfZXh0Jzt9LFxuICAgICd0eXBlJzogJ2NvbnRyb2xzX3JlcGVhdF9leHQnXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJjb250cm9sc19mb3JcIiBibG9jay5cbnZhciBDT05UUk9MU19GT1IgPSB7XG4gICAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2NvbnRyb2xzX2Zvcic7fSxcbiAgICAndHlwZSc6ICdjb250cm9sc19mb3InXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJ2YXJpYWJsZXNfZ2V0XCIgYmxvY2suXG52YXIgVkFSSUFCTEVTX0dFVCA9IHtcbiAgICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAndmFyaWFibGVzX2dldCc7fSxcbiAgICAndHlwZSc6ICd2YXJpYWJsZXNfZ2V0JyxcbiAgICAndGl0bGVzJzogeydWQVInOiAnaSd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3R1cm5cIiBibG9jayB0dXJuaW5nIGxlZnQuXG52YXIgVFVSTl9MRUZUID0ge1xuICAndGVzdCc6ICd0dXJuTGVmdCcsXG4gICd0eXBlJzogJ21hemVfdHVybicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICd0dXJuTGVmdCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3R1cm5cIiBibG9jayB0dXJuaW5nIHJpZ2h0LlxudmFyIFRVUk5fUklHSFQgPSB7XG4gICd0ZXN0JzogJ3R1cm5SaWdodCcsXG4gICd0eXBlJzogJ21hemVfdHVybicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICd0dXJuUmlnaHQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV91bnRpbEJsb2NrZWRcIiBibG9jay5cbnZhciBVTlRJTF9CTE9DS0VEID0ge1xuICAndGVzdCc6ICd3aGlsZSAoTWF6ZS5pc1BhdGhGb3J3YXJkJyxcbiAgJ3R5cGUnOiAnbWF6ZV91bnRpbEJsb2NrZWQnXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIiBibG9jayB3aXRoIHRoZSBvcHRpb24gXCJwaWxlUHJlc2VudFwiIHNlbGVjdGVkLlxudmFyIFdISUxFX09QVF9QSUxFX1BSRVNFTlQgPSB7XG4gICd0ZXN0JzogJ3doaWxlIChNYXplLnBpbGVQcmVzZW50JyxcbiAgJ3R5cGUnOiAnbWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ3BpbGVQcmVzZW50J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiIGJsb2NrIHdpdGggdGhlIG9wdGlvbiBcImhvbGVQcmVzZW50XCIgc2VsZWN0ZWQuXG52YXIgV0hJTEVfT1BUX0hPTEVfUFJFU0VOVCA9IHtcbiAgJ3Rlc3QnOiAnd2hpbGUgKE1hemUuaG9sZVByZXNlbnQnLFxuICAndHlwZSc6ICdtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXInLFxuICAndGl0bGVzJzogeydESVInOiAnaG9sZVByZXNlbnQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCIgYmxvY2sgd2l0aCB0aGUgb3B0aW9uIFwiaXNQYXRoRm9yd2FyZFwiIHNlbGVjdGVkLlxudmFyIFdISUxFX09QVF9QQVRIX0FIRUFEID0ge1xuICAndGVzdCc6ICd3aGlsZSAoTWF6ZS5pc1BhdGhGb3J3YXJkJyxcbiAgJ3R5cGUnOiAnbWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ2lzUGF0aEZvcndhcmQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwia2FyZWxfaWZcIiBibG9jay5cbnZhciBJRiA9IHsndGVzdCc6ICdpZicsICd0eXBlJzogJ2thcmVsX2lmJ307XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImthcmVsX2lmXCIgYmxvY2sgd2l0aCB0aGUgb3B0aW9uIFwicGlsZVByZXNlbnRcIiBzZWxlY3RlZC5cbnZhciBJRl9PUFRfUElMRV9QUkVTRU5UID0ge1xuICAndGVzdCc6ICdpZiAoTWF6ZS5waWxlUHJlc2VudCcsXG4gICd0eXBlJzogJ2thcmVsX2lmJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ3BpbGVQcmVzZW50J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImthcmVsX2lmXCIgYmxvY2sgd2l0aCB0aGUgb3B0aW9uIFwiaG9sZVByZXNlbnRcIiBzZWxlY3RlZC5cbnZhciBJRl9PUFRfSE9MRV9QUkVTRU5UID0ge1xuICAndGVzdCc6ICdpZiAoTWF6ZS5ob2xlUHJlc2VudCcsXG4gICd0eXBlJzogJ2thcmVsX2lmJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ2hvbGVQcmVzZW50J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImthcmVsX2lmRWxzZVwiIGJsb2NrLlxudmFyIElGX0VMU0UgPSB7J3Rlc3QnOiAnfSBlbHNlIHsnLCAndHlwZSc6ICdrYXJlbF9pZkVsc2UnfTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiZmlsbCBudW1cIiBibG9jay5cbnZhciBmaWxsID0gZnVuY3Rpb24obnVtKSB7XG4gIHJldHVybiB7J3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBtc2cuZmlsbE4oe3Nob3ZlbGZ1bHM6IG51bX0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAgICAgICAgICd0aXRsZXMnOiB7J05BTUUnOiBtc2cuZmlsbE4oe3Nob3ZlbGZ1bHM6IG51bX0pfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJyZW1vdmUgbnVtXCIgYmxjb2suXG52YXIgcmVtb3ZlID0gZnVuY3Rpb24obnVtKSB7XG4gIHJldHVybiB7J3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PVxuICAgICAgICAgICAgICAgIG1zZy5yZW1vdmVOKHtzaG92ZWxmdWxzOiBudW19KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgICAgICAgICAndGl0bGVzJzogeydOQU1FJzogbXNnLnJlbW92ZU4oe3Nob3ZlbGZ1bHM6IG51bX0pfX07XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJhdm9pZCB0aGUgY293IGFuZCByZW1vdmUgMVwiIGJsb2NrLlxudmFyIEFWT0lEX09CU1RBQ0xFX0FORF9SRU1PVkUgPSB7XG4gICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IG1zZy5hdm9pZENvd0FuZFJlbW92ZSgpO1xuICB9LFxuICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICd0aXRsZXMnOiB7J05BTUUnOiBtc2cuYXZvaWRDb3dBbmRSZW1vdmUoKX1cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcInJlbW92ZSAxIGFuZCBhdm9pZCB0aGUgY293XCIgYmxvY2suXG52YXIgUkVNT1ZFX0FORF9BVk9JRF9PQlNUQUNMRSA9IHtcbiAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gbXNnLnJlbW92ZUFuZEF2b2lkVGhlQ293KCk7XG4gIH0sXG4gICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5yZW1vdmVBbmRBdm9pZFRoZUNvdygpfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwicmVtb3ZlIHBpbGVzXCIgYmxvY2suXG52YXIgUkVNT1ZFX1BJTEVTID0ge1xuICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBtc2cucmVtb3ZlU3RhY2soe3Nob3ZlbGZ1bHM6IDR9KTtcbiAgfSxcbiAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAndGl0bGVzJzogeydOQU1FJzogbXNnLnJlbW92ZVN0YWNrKHtzaG92ZWxmdWxzOiA0fSl9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJmaWxsIGhvbGVzXCIgYmxvY2suXG52YXIgRklMTF9IT0xFUyA9IHtcbiAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gbXNnLmZpbGxTdGFjayh7c2hvdmVsZnVsczogMn0pO1xuICB9LFxuICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICd0aXRsZXMnOiB7J05BTUUnOiBtc2cuZmlsbFN0YWNrKHtzaG92ZWxmdWxzOiAyfSl9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBGb3JtZXJseSBwYWdlIDFcbiAgJzFfMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgMSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMSksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR11cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMi4wXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV8yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCAyKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAyKSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRklMTF1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMiwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAxLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgLTIsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV8zJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCAzKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAzKSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW1JFUEVBVF1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDIsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfNCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgNCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtUVVJOX0xFRlRdLCBbUkVQRUFUXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAyLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfNSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgNSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgNSksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0ZJTExdLCBbUkVQRUFUXSwgW1VOVElMX0JMT0NLRURdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAtNSwgLTUsIC01LCAtNSwgLTUsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV82Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA2KSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0RJR10sXG4gICAgICBbV0hJTEVfT1BUX1BJTEVfUFJFU0VOVCwgUkVQRUFULCBXSElMRV9PUFRfUEFUSF9BSEVBRF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAxLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDIsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAxLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDEsIDEsIDAsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfNyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgNyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgNyksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbVFVSTl9SSUdIVF0sXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtGSUxMXSxcbiAgICAgIFtXSElMRV9PUFRfSE9MRV9QUkVTRU5UXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAxLCAxLCAyLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIC0xOCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfOCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgOCksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtGSUxMXSxcbiAgICAgIFtXSElMRV9PUFRfUEFUSF9BSEVBRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAtMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV85Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA5KSxcbiAgICAnaWRlYWwnOiAxMCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtESUddLFxuICAgICAgW1dISUxFX09QVF9QQVRIX0FIRUFELCBSRVBFQVRdLFxuICAgICAgW1RVUk5fTEVGVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyLjVcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMSwgMSwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzEwJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCAxMCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMTApLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRElHXSxcbiAgICAgIFtJRl9PUFRfUElMRV9QUkVTRU5UXSxcbiAgICAgIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMi41XG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDAsIDAsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV8xMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgMTEpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDExKSxcbiAgICAnaWRlYWwnOiA3LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0RJR10sXG4gICAgICBbRklMTF0sXG4gICAgICBbSUZfT1BUX1BJTEVfUFJFU0VOVF0sXG4gICAgICBbSUZfT1BUX0hPTEVfUFJFU0VOVF0sXG4gICAgICBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDIuNVxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgLTEsIDAsIDAsIC0xLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAvLyBGb3JtZXJseSBwYWdlIDJcblxuICAnMl8xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxKSxcbiAgICAnaWRlYWwnOiBudWxsLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW0ZJTExdLCBbVFVSTl9MRUZULCBUVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIC0xLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIC0xLCAxLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMiksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMiksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW2ZpbGwoNSldXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAwLCAyLCAxLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDAsIDEsIDEsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAxLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAtNSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMyksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW2ZpbGwoNSldLCBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMiwgMSwgMSwgMSwgMSwgMSwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgLTUsIC01LCAtNSwgLTUsIC01LCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfNCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgNCksXG4gICAgJ2lkZWFsJzogMTMsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW0RJR10sXG4gICAgICBbUkVQRUFUXSxcbiAgICAgIFtyZW1vdmUoNyldLFxuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbVFVSTl9MRUZUXSxcbiAgICAgIFtUVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDEsIDEsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAxLCAyLCAxLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCA3LCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDcsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgNywgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCA3LCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDUpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDUpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW0RJR10sXG4gICAgICBbUkVQRUFUXSxcbiAgICAgIFtyZW1vdmUoNildLFxuICAgICAgW01PVkVfRk9SV0FSRF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAyLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCA2LCAwLCA2LCAwLCA2LCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl82Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA2KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA2KSxcbiAgICAnaWRlYWwnOiAxMSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVtb3ZlKDgpXSwgW2ZpbGwoOCldLCBbTU9WRV9GT1JXQVJEXSwgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyA4LCAwLCAwLCAwLCAwLCAwLCAwLCAtOCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfNyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgNyksXG4gICAgJ2lkZWFsJzogMTEsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW1RVUk5fTEVGVF0sIFtNT1ZFX0ZPUldBUkRdLCBbVFVSTl9SSUdIVF0sIFtESUddXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDIsIDQsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl84Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA4KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA4KSxcbiAgICAnaWRlYWwnOiAxMyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbUkVQRUFUXSwgW0FWT0lEX09CU1RBQ0xFX0FORF9SRU1PVkVdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAyLCA0LCAxLCA0LCAxLCA0LCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAxLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfOSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgOSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgOSksXG4gICAgJ2lkZWFsJzogMTQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW1JFTU9WRV9QSUxFU10sXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfMTAnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEwKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxMCksXG4gICAgJ2lkZWFsJzogMjcsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW1JFTU9WRV9QSUxFU10sXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtGSUxMX0hPTEVTXSxcbiAgICAgIFtJRl9PUFRfUElMRV9QUkVTRU5ULCBJRl9FTFNFXSxcbiAgICAgIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMSwgLTEsIDEsIC0xLCAtMSwgMSwgLTEsIDAgXSxcbiAgICAgIFsgMSwgLTEsIDEsIC0xLCAtMSwgMSwgLTEsIDAgXVxuICAgIF1cbiAgfSxcblxuICAvLyBQYWdlIDMgdG8gRGVidWdcblxuICAnZGVidWdfc2VxXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDEpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDEpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbRklMTF0sIFtUVVJOX0xFRlRdLCBbVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgNCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAyLCAxLCA0LCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgLTEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfc2VxXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDIpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDIpLFxuICAgICdpZGVhbCc6IDcsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbVFVSTl9MRUZUXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMiwgMSwgMSwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19yZXBlYXQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDMpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDMpLFxuICAgICdpZGVhbCc6IDEyLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW1RVUk5fTEVGVF0sIFtUVVJOX1JJR0hUXSwgW1JFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMSwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAyLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDEsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMSwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCA1LCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDcsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX3doaWxlJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA0KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA0KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbUkVQRUFUXSwgW0ZJTExdLCBbV0hJTEVfT1BUX0hPTEVfUFJFU0VOVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDIsIDEsIDEsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIC0xNSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19pZic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgNSksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1RVUk5fTEVGVF0sIFtUVVJOX1JJR0hUXSxcbiAgICAgIFtSRVBFQVRdLCBbRElHXSwgW0lGX09QVF9QSUxFX1BSRVNFTlRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAyLCAxLCAwLCAxLCAxLCAwLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX2lmX2Vsc2UnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDYpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDYpLFxuICAgICdpZGVhbCc6IDEwLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbVFVSTl9MRUZUXSwgW1RVUk5fUklHSFRdLFxuICAgICAgW1JFUEVBVF0sIFtESUddLCBbRklMTF0sIFtJRl9FTFNFLCBJRl9PUFRfSE9MRV9QUkVTRU5UXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMSwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAxLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMCwgMSwgMSwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgLTEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIC0xLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIC0xLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgLTEsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfZnVuY3Rpb25fMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgNyksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1RVUk5fTEVGVF0sIFtSRVBFQVRdLCBbRElHXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAyLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19mdW5jdGlvbl8yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA4KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA4KSxcbiAgICAnaWRlYWwnOiAxNyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1RVUk5fTEVGVF0sIFtSRVBFQVRdLCBbRElHXSwgW0ZJTExdLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5maWxsU3F1YXJlKCkpXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cucmVtb3ZlU3F1YXJlKCkpXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgMSwgMCwgMSBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIC0xLCAtMSwgLTEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgLTEsIDAsIC0xIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIC0xLCAtMSwgLTEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX2Z1bmN0aW9uXzMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDkpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDkpLFxuICAgICdpZGVhbCc6IDEyLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbUkVQRUFUX0VYVF0sIFtESUddLCBbQ09OVFJPTFNfRk9SXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbFdpdGhBcmcobXNnLnJlbW92ZVBpbGUoKSwgbXNnLmhlaWdodFBhcmFtZXRlcigpKV0sXG4gICAgICBbVkFSSUFCTEVTX0dFVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMiwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMiwgMywgNCwgNSwgNiwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnYmVlXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goJ1xcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9uZWN0YXJcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaG9uZXlcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PHRpdGxlIG5hbWU9XCJOVU1cIj4wPC90aXRsZT48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJlZV9pZk5lY3RhckFtb3VudFwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwiYmVlX2lmVG90YWxOZWN0YXJcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJlZV9pZkZsb3dlclwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwiYmVlX2lmT25seUZsb3dlclwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwiYmVlX3doaWxlTmVjdGFyQW1vdW50XCI+PC9ibG9jaz4nXG4gICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAxKSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDIuMFxuICAgIH0sXG4gICAgaG9uZXlHb2FsOiAxLFxuICAgIC8vIG5lY3RhckdvYWw6IDIsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsICdQJywgMSwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAzLCAtMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdXG5cbiAgICBdXG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuLi8uLi9sb2NhbGUnKTtcblxuLyoqXG4gKiBBZGQgdGhlIHByb2NlZHVyZXMgY2F0ZWdvcnkgdG8gdGhlIHRvb2xib3guXG4gKi9cbnZhciBhZGRQcm9jZWR1cmVzID0gZnVuY3Rpb24oKSB7OyBidWYucHVzaCgnICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoOCwgIG1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDksICBtc2cuY2F0TG9naWMoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZkVsc2VcIj48L2Jsb2NrPlxcbiAgPC9jYXRlZ29yeT5cXG4nKTsxMzsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTsxNDtcbi8qKlxuICogT3B0aW9uczpcbiAqIEBwYXJhbSBkb1N0YXRlbWVudCBBbiBvcHRpb25hbCBzdGF0ZW1lbnQgZm9yIHRoZSBkbyBzdGF0ZW1lbnQgaW4gdGhlIGxvb3AuXG4gKiBAcGFyYW0gdXBwZXJMaW1pdCBUaGUgdXBwZXIgbGltaXQgb2YgdGhlIGZvciBsb29wLlxuICovXG52YXIgY29udHJvbHNGb3IgPSBmdW5jdGlvbihkb1N0YXRlbWVudCwgdXBwZXJMaW1pdCkgezsgYnVmLnB1c2goJyAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JcIj5cXG4gICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L3ZhbHVlPlxcbiAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj5cXG4gICAgICAgICAgJywgZXNjYXBlKCgyOSwgIHVwcGVyTGltaXQgfHwgMTApKSwgJyAgICAgICAgPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L3ZhbHVlPlxcbiAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L3ZhbHVlPlxcbiAgICAnKTszNzsgaWYgKGRvU3RhdGVtZW50KSB7OyBidWYucHVzaCgnICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICcpOzM4OyBkb1N0YXRlbWVudCgpIDsgYnVmLnB1c2goJ1xcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAnKTs0MDsgfTsgYnVmLnB1c2goJyAgPC9ibG9jaz5cXG4nKTs0MTsgfTs7IGJ1Zi5wdXNoKCdcXG48eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg0MywgIG1zZy5jYXRBY3Rpb25zKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgPC9jYXRlZ29yeT5cXG4gICcpOzUwOyBhZGRQcm9jZWR1cmVzKCk7IGJ1Zi5wdXNoKCcgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg1MCwgIG1zZy5jYXRMb29wcygpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCI+PC9ibG9jaz5cXG4gICAgJyk7NTI7IGlmIChsZXZlbCA8IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPjwvYmxvY2s+XFxuICAgICcpOzUzOyB9IGVsc2UgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiPlxcbiAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xMDwvdGl0bGU+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3ZhbHVlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzYwOyB9OyBidWYucHVzaCgnICAgICcpOzYwOyBjb250cm9sc0ZvcigpOyBidWYucHVzaCgnICA8L2NhdGVnb3J5PlxcbiAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDYxLCAgbXNnLmNhdE1hdGgoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+PC9ibG9jaz5cXG4gIDwvY2F0ZWdvcnk+XFxuICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNjQsICBtc2cuY2F0VmFyaWFibGVzKCkgKSksICdcIiBjdXN0b209XCJWQVJJQUJMRVwiPlxcbiAgPC9jYXRlZ29yeT5cXG48L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi8uLi9sb2NhbGUnKTtcbnZhciBtYXplTXNnID0gcmVxdWlyZSgnLi4vLi9sb2NhbGUnKTtcblxudmFyIGFkZFByb2NlZHVyZXMgPSBmdW5jdGlvbigpIHs7IGJ1Zi5wdXNoKCcgICcpOzY7IGlmIChsZXZlbCA+IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDYsICBjb21tb25Nc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gICcpOzc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMiB8fCBsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg3LCAgY29tbW9uTXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg5LCAgbWF6ZU1zZy5maWxsTih7c2hvdmVsZnVsczogNX0pICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgJyk7MTI7IH07IGJ1Zi5wdXNoKCcgICcpOzEyOyBpZiAobGV2ZWwgPCA5KSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxMiwgIGNvbW1vbk1zZy5jYXRMb2dpYygpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZlwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAnKTsxNTsgfSBlbHNlIGlmIChsZXZlbCA+IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDE1LCAgY29tbW9uTXNnLmNhdExvZ2ljKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmXCI+PC9ibG9jaz5cXG4gICAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmRWxzZVwiPjwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAnKTsxOTsgfTsgYnVmLnB1c2goJycpOzE5OyB9OzsgYnVmLnB1c2goJ1xcbjx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDIxLCAgY29tbW9uTXNnLmNhdEFjdGlvbnMoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICA8L2NhdGVnb3J5PlxcbiAgJyk7Mjg7IGFkZFByb2NlZHVyZXMoKTsgYnVmLnB1c2goJyAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDI4LCAgY29tbW9uTXNnLmNhdExvb3BzKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+PC9ibG9jaz5cXG4gIDwvY2F0ZWdvcnk+XFxuPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAnKTs2OyBpZiAobGV2ZWwgPiAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gICAgJyk7NzsgaWYgKGxldmVsID4gMikgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgICAnKTsxMDsgaWYgKGxldmVsID4gOSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZlwiPjwvYmxvY2s+XFxuICAgICAgJyk7MTE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTE7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTE7IGlmIChsZXZlbCA9PSA1IHx8IGxldmVsID09IDEwIHx8IGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZFwiPjwvYmxvY2s+XFxuICAgICcpOzEyOyB9OyBidWYucHVzaCgnICAgICcpOzEyOyBpZiAobGV2ZWwgPiA1ICYmIGxldmVsIDwgOCkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCI+PC9ibG9jaz5cXG4gICAgJyk7MTM7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTM7IGlmIChsZXZlbCA9PSA4IHx8IGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhGb3J3YXJkPC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxNjsgfTsgYnVmLnB1c2goJyAgJyk7MTY7IH07IGJ1Zi5wdXNoKCc8L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG4vKipcbiAqIFRlbXBsYXRlIHRvIGNyZWF0ZSBmdW5jdGlvbiBmb3IgZmlsbGluZyBpbiBzaG92ZWxzLlxuICovXG52YXIgZmlsbFNob3ZlbGZ1bHMgPSBmdW5jdGlvbihuKSB7OyBidWYucHVzaCgnICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDExLCAgbXNnLmZpbGxOKHtzaG92ZWxmdWxzOiBufSkgKSksICc8L3RpdGxlPlxcbiAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+JywgZXNjYXBlKCgxNCwgIG4gKSksICc8L3RpdGxlPlxcbiAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICA8L2Jsb2NrPlxcbiAgICA8L3N0YXRlbWVudD5cXG4gIDwvYmxvY2s+XFxuJyk7MjI7IH07OyBidWYucHVzaCgnXFxuJyk7MjM7XG4vKipcbiAqIFRlbXBsYXRlIHRvIGNyZWF0ZSBmdW5jdGlvbiBmb3IgcmVtb3ZpbmcgaW4gc2hvdmVscy5cbiAqL1xudmFyIHJlbW92ZVNob3ZlbGZ1bHMgPSBmdW5jdGlvbihuKSB7OyBidWYucHVzaCgnICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMzAwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgzMCwgIG1zZy5yZW1vdmVOKHtzaG92ZWxmdWxzOiBufSkgKSksICc8L3RpdGxlPlxcbiAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+JywgZXNjYXBlKCgzMywgIG4gKSksICc8L3RpdGxlPlxcbiAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgIDwvYmxvY2s+XFxuICAgIDwvc3RhdGVtZW50PlxcbiAgPC9ibG9jaz5cXG4nKTs0MTsgfTsgOyBidWYucHVzaCgnXFxuXFxuJyk7NDM7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICcpOzQzOyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDU7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ4OyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0OTsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzUyOyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzUzOyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzU0OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NTU7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs1NjsgfTsgYnVmLnB1c2goJycpOzU2OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMikgezsgYnVmLnB1c2goJyAgJyk7NTY7IGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCIyMFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAgICcpOzU3OyBmaWxsU2hvdmVsZnVscyg1KTsgYnVmLnB1c2goJyAgJyk7NTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICAnKTs1NzsgZmlsbFNob3ZlbGZ1bHMoNSk7IGJ1Zi5wdXNoKCcgICcpOzU3OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7NTc7IGZpbGxTaG92ZWxmdWxzKDUpOyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIzMDBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDYwLCAgbXNnLnJlbW92ZU4oe3Nob3ZlbGZ1bHM6IDd9KSApKSwgJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2MjsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNjUsICBtc2cucmVtb3ZlTih7c2hvdmVsZnVsczogNn0pICkpLCAnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzY3OyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7Njc7IGZpbGxTaG92ZWxmdWxzKDgpOyBidWYucHVzaCgnICAgICcpOzY3OyByZW1vdmVTaG92ZWxmdWxzKDgpOyBidWYucHVzaCgnICAnKTs2NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg2OSwgIG1zZy5hdm9pZENvd0FuZFJlbW92ZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg3NCwgIG1zZy5hdm9pZENvd0FuZFJlbW92ZSgpICkpLCAnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzc2OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg3OSwgIG1zZy5hdm9pZENvd0FuZFJlbW92ZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxMjc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDEzMCwgIG1zZy5yZW1vdmVTdGFjayh7c2hvdmVsZnVsczogNH0pICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNzc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgxODAsICBtc2cucmVtb3ZlU3RhY2soe3Nob3ZlbGZ1bHM6IDR9KSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMzAwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyMzAsICBtc2cuZmlsbFN0YWNrKHtzaG92ZWxmdWxzOiAyfSkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4yPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjI8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyNzc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgyODAsICBtc2cucmVtb3ZlQW5kQXZvaWRUaGVDb3coKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnRcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszMjk7IH07IGJ1Zi5wdXNoKCcnKTszMjk7IH0gZWxzZSBpZiAocGFnZSA9PSAzKSB7OyBidWYucHVzaCgnICAnKTszMjk7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MzU2OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszNzM7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQxODsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5waWxlUHJlc2VudDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDMyOyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0NTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj43PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+cGlsZVByZXNlbnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ4NjsgfSBlbHNlIGlmIChsZXZlbCA9PSA3KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiNzBcIlxcbiAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg0ODgsICBtc2cucmVtb3ZlU3F1YXJlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg0OTIsICBtc2cucmVtb3ZlU3F1YXJlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4yPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1MTY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjcwXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDUxNywgIG1zZy5maWxsU3F1YXJlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoNTI2LCAgbXNnLnJlbW92ZVNxdWFyZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjUwXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg1MzUsICBtc2cucmVtb3ZlU3F1YXJlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4yPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIGRlbGV0YWJsZT1cImZhbHNlXCJcXG4gICAgICBlZGl0YWJsZT1cImZhbHNlXCIgeD1cIjM1MFwiIHk9XCIyNTBcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDU2MiwgIG1zZy5maWxsU3F1YXJlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4yPC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTg2OyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19mb3JcIiBpbmxpbmU9XCJ0cnVlXCIgeD1cIjIwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJWQVJcIj5jb3VudGVyPC90aXRsZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIlRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+NjwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgaW5saW5lPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDYwNSwgIG1zZy5yZW1vdmVQaWxlKCkgKSksICdcIj5cXG4gICAgICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDYwNiwgIG1zZy5oZWlnaHRQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgICAgICA8L211dGF0aW9uPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIkFSRzBcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyNTBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+XFxuICAgICAgICA8YXJnIG5hbWU9XCInLCBlc2NhcGUoKDYyMSwgIG1zZy5oZWlnaHRQYXJhbWV0ZXIoKSApKSwgJ1wiPjwvYXJnPlxcbiAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg2MjMsICBtc2cucmVtb3ZlUGlsZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCIgaW5saW5lPVwidHJ1ZVwiPlxcbiAgICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2Mzc7IH07IGJ1Zi5wdXNoKCcnKTs2Mzc7IH07IGJ1Zi5wdXNoKCcnKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbjxkaXYgaWQ9XCJzcGVsbGluZy10YWJsZS13cmFwcGVyXCI+XFxuICA8dGFibGUgaWQ9XCJzcGVsbGluZy10YWJsZVwiIGNsYXNzPVwiZmxvYXQtcmlnaHRcIj5cXG4gICAgPHRyPlxcbiAgICAgIDx0ZCBjbGFzcz1cInNwZWxsaW5nVGV4dENlbGxcIj4nLCBlc2NhcGUoKDUsICBtc2cud29yZCgpICkpLCAnOjwvdGQ+XFxuICAgICAgPHRkIGNsYXNzPVwic3BlbGxpbmdCdXR0b25DZWxsXCI+XFxuICAgICAgICA8YnV0dG9uIGlkPVwic2VhcmNoV29yZFwiIGNsYXNzPVwic3BlbGxpbmdCdXR0b25cIiBkaXNhYmxlZD5cXG4gICAgICAgICAgJyk7ODsgLy8gc3BsaXR0aW5nIHRoZXNlIGxpbmVzIGNhdXNlcyBhbiBleHRyYSBzcGFjZSB0byBzaG93IHVwIGluIGZyb250IG9mIHRoZSB3b3JkLCBicmVha2luZyBjZW50ZXJpbmcgXG47IGJ1Zi5wdXNoKCdcXG4gICAgICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDksICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIvPicsIGVzY2FwZSgoOSwgIHNlYXJjaFdvcmQgKSksICdcXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvdGQ+XFxuICAgIDwvdHI+XFxuICAgIDx0cj5cXG4gICAgICA8dGQgY2xhc3M9XCJzcGVsbGluZ1RleHRDZWxsXCI+JywgZXNjYXBlKCgxNCwgIG1zZy55b3VTcGVsbGVkKCkgKSksICc6PC90ZD5cXG4gICAgICA8dGQgY2xhc3M9XCJzcGVsbGluZ0J1dHRvbkNlbGxcIj5cXG4gICAgICAgIDxidXR0b24gaWQ9XCJjdXJyZW50V29yZFwiIGNsYXNzPVwic3BlbGxpbmdCdXR0b25cIiBkaXNhYmxlZD5cXG4gICAgICAgICAgJyk7MTc7IC8vIHNwbGl0dGluZyB0aGVzZSBsaW5lcyBjYXVzZXMgYW4gZXh0cmEgc3BhY2UgdG8gc2hvdyB1cCBpbiBmcm9udCBvZiB0aGUgd29yZCwgYnJlYWtpbmcgY2VudGVyaW5nIFxuOyBidWYucHVzaCgnXFxuICAgICAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxOCwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj48c3BhbiBpZD1cImN1cnJlbnRXb3JkQ29udGVudHNcIj48L3NwYW4+XFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICA8L3RkPlxcbiAgICA8L3RyPlxcbiAgPC90YWJsZT5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxuLyoqXG4gKiBTdG9yZXMgaW5mb3JtYXRpb24gYWJvdXQgYSBjdXJyZW50IE1hemUgZXhlY3V0aW9uLiAgRXhlY3V0aW9uIGNvbnNpc3RzIG9mIGFcbiAqIHNlcmllcyBvZiBzdGVwcywgd2hlcmUgZWFjaCBzdGVwIG1heSBjb250YWluIG9uZSBvciBtb3JlIGFjdGlvbnMuXG4gKi9cbnZhciBFeGVjdXRpb25JbmZvID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMudGVybWluYXRlZF8gPSBmYWxzZTtcbiAgdGhpcy50ZXJtaW5hdGlvblZhbHVlXyA9IG51bGw7ICAvLyBTZWUgdGVybWluYXRlV2l0aFZhbHVlIG1ldGhvZC5cbiAgdGhpcy5zdGVwc18gPSBbXTtcbiAgdGhpcy50aWNrcyA9IG9wdGlvbnMudGlja3MgfHwgSW5maW5pdHk7XG4gIHRoaXMuY29sbGVjdGlvbl8gPSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFeGVjdXRpb25JbmZvO1xuXG4vKipcbiAqIFNldHMgdGVybWluYXRpb24gdmFsdWUgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gKiAtIEluZmluaXR5OiBQcm9ncmFtIHRpbWVkIG91dC5cbiAqIC0gVHJ1ZTogUHJvZ3JhbSBzdWNjZWVkZWQgKGdvYWwgd2FzIHJlYWNoZWQpLlxuICogLSBGYWxzZTogUHJvZ3JhbSBmYWlsZWQgZm9yIHVuc3BlY2lmaWVkIHJlYXNvbi5cbiAqIC0gQW55IG90aGVyIHZhbHVlOiBhcHAtc3BlY2lmaWMgZmFpbHVyZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSB2YWx1ZSB0aGUgdGVybWluYXRpb24gdmFsdWVcbiAqL1xuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUudGVybWluYXRlV2l0aFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICghdGhpcy50ZXJtaW5hdGVkXykge1xuICAgIHRoaXMudGVybWluYXRpb25WYWx1ZV8gPSB2YWx1ZTtcbiAgfVxuICB0aGlzLnRlcm1pbmF0ZWRfID0gdHJ1ZTtcbn07XG5cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLmlzVGVybWluYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudGVybWluYXRlZF87XG59O1xuXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS50ZXJtaW5hdGlvblZhbHVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50ZXJtaW5hdGlvblZhbHVlXztcbn07XG5cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLnF1ZXVlQWN0aW9uID0gZnVuY3Rpb24gKGNvbW1hbmQsIGJsb2NrSWQpIHtcbiAgdmFyIGFjdGlvbiA9IHtjb21tYW5kOiBjb21tYW5kLCBibG9ja0lkOiBibG9ja0lkfTtcbiAgaWYgKHRoaXMuY29sbGVjdGlvbl8pIHtcbiAgICB0aGlzLmNvbGxlY3Rpb25fLnB1c2goYWN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBzaW5nbGUgYWN0aW9uIHN0ZXAgKG1vc3QgY29tbW9uIGNhc2UpXG4gICAgdGhpcy5zdGVwc18ucHVzaChbYWN0aW9uXSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZsYXQgbGlzdCBvZiBhY3Rpb25zLCB3aGljaCBnZXQgcmVtb3ZlZCBmcm9tIG91ciBxdWV1ZS4gIElmIHNpbmdsZVxuICogc3RlcCBpcyB0cnVlLCB0aGUgbGlzdCB3aWxsIGNvbnRhaW4gdGhlIGFjdGlvbnMgZm9yIG9uZSBzdGVwLCBvdGhlcndpc2UgaXRcbiAqIHdpbGwgYmUgdGhlIGVudGlyZSBxdWV1ZS5cbiAqL1xuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuZ2V0QWN0aW9ucyA9IGZ1bmN0aW9uIChzaW5nbGVTdGVwKSB7XG4gIHZhciBhY3Rpb25zID0gW107XG4gIGlmIChzaW5nbGVTdGVwKSB7XG4gICAgYWN0aW9ucy5wdXNoKHRoaXMuc3RlcHNfLnNoaWZ0KCkpO1xuICAgIC8vIGRvbnQgbGVhdmUgcXVldWUgd2l0aCBqdXN0IGEgZmluaXNoIGluIGl0XG4gICAgaWYgKG9uTGFzdFN0ZXAodGhpcy5zdGVwc18pKSB7XG4gICAgICBhY3Rpb25zLnB1c2godGhpcy5zdGVwc18uc3BsaWNlKDApKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYWN0aW9ucy5wdXNoKHRoaXMuc3RlcHNfLnNwbGljZSgwKSk7XG4gIH1cbiAgLy8gU29tZSBzdGVwcyB3aWxsIGNvbnRhaW4gbXVsdGlwbGUgYWN0aW9ucy4gIEZvciBleGFtcGxlIGEgSzEgTm9ydGggYmxvY2sgY2FuXG4gIC8vIGNvbnNpc3Qgb2YgYSB0dXJuIGFuZCBhIG1vdmUuIFdlIGluc3RlYWQgd2FudCB0byByZXR1cm4gYSBmbGF0IGxpc3Qgb2ZcbiAgLy8gYWxsIGFjdGlvbnMsIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggc3RlcCB0aGV5IHdlcmUgaW4uXG4gIHJldHVybiBfLmZsYXR0ZW4oYWN0aW9ucyk7XG59O1xuXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5zdGVwc1JlbWFpbmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc3RlcHNfLmxlbmd0aCA+IDA7XG59O1xuXG4vKipcbiAqIElmIHdlIGhhdmUgbm8gc3RlcHMgbGVmdCwgb3Igb3VyIG9ubHkgcmVtYWluaW5nIHN0ZXAgaXMgYSBzaW5nbGUgZmluaXNoIGFjdGlvblxuICogd2UncmUgZG9uZSBleGVjdXRpbmcsIGFuZCBpZiB3ZSdyZSBpbiBzdGVwIG1vZGUgd29uJ3Qgd2FudCB0byB3YWl0IGFyb3VuZFxuICogZm9yIGFub3RoZXIgc3RlcCBwcmVzcy5cbiAqL1xuZnVuY3Rpb24gb25MYXN0U3RlcChzdGVwcykge1xuICBpZiAoc3RlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoc3RlcHMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHN0ZXAgPSBzdGVwc1swXTtcbiAgICBpZiAoc3RlcC5sZW5ndGggPT09IDEgJiYgc3RlcFswXS5jb21tYW5kID09PSAnZmluaXNoJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2xsZWN0IGFsbCBhY3Rpb25zIHF1ZXVlZCB1cCBiZXR3ZWVuIG5vdyBhbmQgdGhlIGNhbGwgdG8gc3RvcENvbGxlY3RpbmcsXG4gKiBhbmQgcHV0IHRoZW0gaW4gYSBzaW5nbGUgc3RlcFxuICovXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5jb2xsZWN0QWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuY29sbGVjdGlvbl8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBbHJlYWR5IGNvbGxlY3RpbmdcIik7XG4gIH1cbiAgdGhpcy5jb2xsZWN0aW9uXyA9IFtdO1xufTtcblxuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuc3RvcENvbGxlY3RpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb2xsZWN0aW9uXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBjdXJyZW50bHkgY29sbGVjdGluZ1wiKTtcbiAgfVxuICB0aGlzLnN0ZXBzXy5wdXNoKHRoaXMuY29sbGVjdGlvbl8pO1xuICB0aGlzLmNvbGxlY3Rpb25fID0gbnVsbDtcbn07XG5cbi8qKlxuICogSWYgdGhlIHVzZXIgaGFzIGV4ZWN1dGVkIHRvbyBtYW55IGFjdGlvbnMsIHdlJ3JlIHByb2JhYmx5IGluIGFuIGluZmluaXRlXG4gKiBsb29wLiAgU2V0IHRlcm1pbmF0aW9uIHZhbHVlIHRvIEluZmluaXR5XG4gKi9cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLmNoZWNrVGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy50aWNrcy0tIDwgMCkge1xuICAgIHRoaXMudGVybWluYXRlV2l0aFZhbHVlKEluZmluaXR5KTtcbiAgfVxufTtcbiIsInZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG5tb2R1bGUuZXhwb3J0cy5ibG9ja3MgPSBbXG4gIHsnZnVuYyc6ICdtb3ZlRm9yd2FyZCcsICdjYXRlZ29yeSc6ICdNb3ZlbWVudCcgfSxcbiAgeydmdW5jJzogJ3R1cm5MZWZ0JywgJ2NhdGVnb3J5JzogJ01vdmVtZW50JyB9LFxuICB7J2Z1bmMnOiAndHVyblJpZ2h0JywgJ2NhdGVnb3J5JzogJ01vdmVtZW50JyB9LFxuXTtcblxubW9kdWxlLmV4cG9ydHMuY2F0ZWdvcmllcyA9IHtcbiAgJ01vdmVtZW50Jzoge1xuICAgICdjb2xvcic6ICdyZWQnLFxuICAgICdibG9ja3MnOiBbXVxuICB9LFxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuXFxuPGJ1dHRvbiBpZD1cInN0ZXBCdXR0b25cIiBjbGFzcz1cImxhdW5jaCAnLCBlc2NhcGUoKDMsICBzaG93U3RlcEJ1dHRvbiA/ICcnIDogJ2hpZGUnICkpLCAnIGZsb2F0LXJpZ2h0XCI+XFxuICAnKTs0OyAvLyBzcGxpdHRpbmcgdGhlc2UgbGluZXMgY2F1c2VzIGFuIGV4dHJhIHNwYWNlIHRvIHNob3cgdXAgaW4gZnJvbnQgb2YgdGhlIHdvcmQsIGJyZWFraW5nIGNlbnRlcmluZyBcbjsgYnVmLnB1c2goJ1xcbiAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg1LCAgbXNnLnN0ZXAoKSApKSwgJ1xcbjwvYnV0dG9uPlxcblxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQmxvY2tseSBEZW1vOiBNYXplXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlbW9uc3RyYXRpb24gb2YgQmxvY2tseTogU29sdmluZyBhIG1hemUuXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIG1hemVVdGlscyA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJyk7XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oc2tpbi5pZCkpIHtcbiAgICByZXF1aXJlKCcuL2JlZUJsb2NrcycpLmluc3RhbGwoYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucyk7XG4gIH1cblxuICB2YXIgU2ltcGxlTW92ZSA9IHtcbiAgICBESVJFQ1RJT05fQ09ORklHUzoge1xuICAgICAgV2VzdDogeyBsZXR0ZXI6IGNvbW1vbk1zZy5kaXJlY3Rpb25XZXN0TGV0dGVyKCksIGltYWdlOiBza2luLmxlZnRBcnJvdywgdG9vbHRpcDogbXNnLm1vdmVXZXN0VG9vbHRpcCgpIH0sXG4gICAgICBFYXN0OiB7IGxldHRlcjogY29tbW9uTXNnLmRpcmVjdGlvbkVhc3RMZXR0ZXIoKSwgaW1hZ2U6IHNraW4ucmlnaHRBcnJvdywgdG9vbHRpcDogbXNnLm1vdmVFYXN0VG9vbHRpcCgpIH0sXG4gICAgICBOb3J0aDogeyBsZXR0ZXI6IGNvbW1vbk1zZy5kaXJlY3Rpb25Ob3J0aExldHRlcigpLCBpbWFnZTogc2tpbi51cEFycm93LCB0b29sdGlwOiBtc2cubW92ZU5vcnRoVG9vbHRpcCgpIH0sXG4gICAgICBTb3V0aDogeyBsZXR0ZXI6IGNvbW1vbk1zZy5kaXJlY3Rpb25Tb3V0aExldHRlcigpLCBpbWFnZTogc2tpbi5kb3duQXJyb3csIHRvb2x0aXA6IG1zZy5tb3ZlU291dGhUb29sdGlwKCkgfVxuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JBbGxEaXJlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJOb3J0aFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJTb3V0aFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJXZXN0XCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcIkVhc3RcIik7XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbjogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICBnZW5lcmF0b3JbXCJtYXplX21vdmVcIiArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlQ29kZUdlbmVyYXRvcihkaXJlY3Rpb24pO1xuICAgICAgYmxvY2tseS5CbG9ja3NbJ21hemVfbW92ZScgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZU1vdmVCbG9jayhkaXJlY3Rpb24pO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVNb3ZlQmxvY2s6IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgdmFyIGRpcmVjdGlvbkNvbmZpZyA9IFNpbXBsZU1vdmUuRElSRUNUSU9OX0NPTkZJR1NbZGlyZWN0aW9uXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlbHBVcmw6ICcnLFxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkTGFiZWwoZGlyZWN0aW9uQ29uZmlnLmxldHRlciwge2ZpeGVkU2l6ZToge3dpZHRoOiAxMiwgaGVpZ2h0OiAxOH19KSlcbiAgICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKGRpcmVjdGlvbkNvbmZpZy5pbWFnZSkpO1xuICAgICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgICAgIHRoaXMuc2V0VG9vbHRpcChkaXJlY3Rpb25Db25maWcudG9vbHRpcCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSxcbiAgICBnZW5lcmF0ZUNvZGVHZW5lcmF0b3I6IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ01hemUubW92ZScgKyBkaXJlY3Rpb24gKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JBbGxEaXJlY3Rpb25zKCk7XG5cbiAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkLlxuICBibG9ja1V0aWxzLmdlbmVyYXRlU2ltcGxlQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgbmFtZTogJ21hemVfbW92ZUZvcndhcmQnLFxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL01vdmUnLFxuICAgIHRpdGxlOiBtc2cubW92ZUZvcndhcmQoKSxcbiAgICB0b29sdGlwOiBtc2cubW92ZUZvcndhcmRUb29sdGlwKCksXG4gICAgZnVuY3Rpb25OYW1lOiAnTWF6ZS5tb3ZlRm9yd2FyZCdcbiAgfSk7XG5cbiAgLy8gQmxvY2sgZm9yIHB1dHRpbmcgZGlydCBvbiB0byBhIHRpbGUuXG4gIGJsb2NrVXRpbHMuZ2VuZXJhdGVTaW1wbGVCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBuYW1lOiAnbWF6ZV9maWxsJyxcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9QdXREb3duJyxcbiAgICB0aXRsZTogbXNnLmZpbGwoKSxcbiAgICB0b29sdGlwOiBtc2cuZmlsbFRvb2x0aXAoKSxcbiAgICBmdW5jdGlvbk5hbWU6ICdNYXplLmZpbGwnXG4gIH0pO1xuXG4gIC8vIEJsb2NrIGZvciBwdXR0aW5nIGZvciByZW1vdmluZyBkaXJ0IGZyb20gYSB0aWxlLlxuICBibG9ja1V0aWxzLmdlbmVyYXRlU2ltcGxlQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgbmFtZTogJ21hemVfZGlnJyxcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9QaWNrVXAnLFxuICAgIHRpdGxlOiBtc2cuZGlnKCksXG4gICAgdG9vbHRpcDogbXNnLmRpZ1Rvb2x0aXAoKSxcbiAgICBmdW5jdGlvbk5hbWU6ICdNYXplLmRpZydcbiAgfSk7XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9tb3ZlID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZC9iYWNrd2FyZFxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL01vdmUnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cubW92ZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfbW92ZS5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLm1vdmVGb3J3YXJkKCksICdtb3ZlRm9yd2FyZCddLFxuICAgICAgIFttc2cubW92ZUJhY2t3YXJkKCksICdtb3ZlQmFja3dhcmQnXV07XG5cbiAgZ2VuZXJhdG9yLm1hemVfbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBmb3J3YXJkL2JhY2t3YXJkXG4gICAgdmFyIGRpciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJyk7XG4gICAgcmV0dXJuICdNYXplLicgKyBkaXIgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3R1cm4gPSB7XG4gICAgLy8gQmxvY2sgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9UdXJuJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnR1cm5Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3R1cm4uRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy50dXJuTGVmdCgpICsgJyBcXHUyMUJBJywgJ3R1cm5MZWZ0J10sXG4gICAgICAgW21zZy50dXJuUmlnaHQoKSArICcgXFx1MjFCQicsICd0dXJuUmlnaHQnXV07XG5cbiAgZ2VuZXJhdG9yLm1hemVfdHVybiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIHR1cm5pbmcgbGVmdCBvciByaWdodC5cbiAgICB2YXIgZGlyID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKTtcbiAgICByZXR1cm4gJ01hemUuJyArIGRpciArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaXNQYXRoID0ge1xuICAgIC8vIEJsb2NrIGZvciBjaGVja2luZyBpZiB0aGVyZSBhIHBhdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLnNldE91dHB1dCh0cnVlLCBibG9ja2x5LkJsb2NrVmFsdWVUeXBlLk5VTUJFUik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaXNQYXRoVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pc1BhdGguRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5pZlBhdGhBaGVhZCgpLCAnaXNQYXRoRm9yd2FyZCddLFxuICAgICAgIFttc2cucGF0aExlZnQoKSArICcgXFx1MjFCQScsICdpc1BhdGhMZWZ0J10sXG4gICAgICAgW21zZy5wYXRoUmlnaHQoKSArICcgXFx1MjFCQicsICdpc1BhdGhSaWdodCddXTtcblxuICBnZW5lcmF0b3IubWF6ZV9pc1BhdGggPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBjaGVja2luZyBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgdmFyIGNvZGUgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArICcoKSc7XG4gICAgcmV0dXJuIFtjb2RlLCBnZW5lcmF0b3IuT1JERVJfRlVOQ1RJT05fQ0FMTF07XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pZiA9IHtcbiAgICAvLyBCbG9jayBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZlRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lmLkRJUkVDVElPTlMgPVxuICAgICAgYmxvY2tseS5CbG9ja3MubWF6ZV9pc1BhdGguRElSRUNUSU9OUztcblxuICBnZW5lcmF0b3IubWF6ZV9pZiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pZkVsc2UgPSB7XG4gICAgLy8gQmxvY2sgZm9yICdpZi9lbHNlJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRUxTRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5lbHNlQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZlbHNlVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaWZFbHNlLkRJUkVDVElPTlMgPVxuICAgICAgYmxvY2tseS5CbG9ja3MubWF6ZV9pc1BhdGguRElSRUNUSU9OUztcblxuICBnZW5lcmF0b3IubWF6ZV9pZkVsc2UgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYvZWxzZScgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoMCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJyYW5jaDEgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdFTFNFJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoMCArXG4gICAgICAgICAgICAgICAnfSBlbHNlIHtcXG4nICsgYnJhbmNoMSArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5rYXJlbF9pZiA9IHtcbiAgICAvLyBCbG9jayBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaWZDb2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmthcmVsX2lmID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5rYXJlbF9pZi5ESVJFQ1RJT05TID0gW1xuICAgICAgIFttc2cucGlsZVByZXNlbnQoKSwgJ3BpbGVQcmVzZW50J10sXG4gICAgICAgW21zZy5ob2xlUHJlc2VudCgpLCAnaG9sZVByZXNlbnQnXSxcbiAgICAgICBbbXNnLnBhdGhBaGVhZCgpLCAnaXNQYXRoRm9yd2FyZCddXG4gIC8vICAgICBbbXNnLm5vUGF0aEFoZWFkKCksICdub1BhdGhGb3J3YXJkJ11cbiAgXTtcblxuICBibG9ja2x5LkJsb2Nrcy5rYXJlbF9pZkVsc2UgPSB7XG4gICAgLy8gQmxvY2sgZm9yICdpZi9lbHNlJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaWZDb2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0VMU0UnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZWxzZUNvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmZWxzZVRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3Iua2FyZWxfaWZFbHNlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmL2Vsc2UnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaDAgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBicmFuY2gxID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRUxTRScpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaDAgK1xuICAgICAgICAgICAgICAgJ30gZWxzZSB7XFxuJyArIGJyYW5jaDEgKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3Mua2FyZWxfaWZFbHNlLkRJUkVDVElPTlMgPVxuICAgICAgYmxvY2tseS5CbG9ja3Mua2FyZWxfaWYuRElSRUNUSU9OUztcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3doaWxlTm90Q2xlYXIgPSB7XG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUmVwZWF0JyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoaWxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLm1hemVfd2hpbGVOb3RDbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgYnJhbmNoID0gY29kZWdlbi5sb29wVHJhcCgpICsgYnJhbmNoO1xuICAgIHJldHVybiAnd2hpbGUgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfd2hpbGVOb3RDbGVhci5ESVJFQ1RJT05TID0gW1xuICAgIFttc2cud2hpbGVNc2coKSArICcgJyArIG1zZy5waWxlUHJlc2VudCgpLCAncGlsZVByZXNlbnQnXSxcbiAgICBbbXNnLndoaWxlTXNnKCkgKyAnICcgKyBtc2cuaG9sZVByZXNlbnQoKSwgJ2hvbGVQcmVzZW50J11cbiAgXTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3VudGlsQmxvY2tlZCA9IHtcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9SZXBlYXQnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5yZXBlYXRVbnRpbEJsb2NrZWQoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGlsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5tYXplX3VudGlsQmxvY2tlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLmlzUGF0aEZvcndhcmQnICsgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICBicmFuY2ggPSBjb2RlZ2VuLmxvb3BUcmFwKCkgKyBicmFuY2g7XG4gICAgcmV0dXJuICd3aGlsZSAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9mb3JldmVyID0ge1xuICAgIC8vIERvIGZvcmV2ZXIgbG9vcC5cbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9SZXBlYXQnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5yZXBlYXRVbnRpbCgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4ubWF6ZV9mb3JldmVyLCAzNSwgMzUpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoaWxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLm1hemVfZm9yZXZlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGRvIGZvcmV2ZXIgbG9vcC5cbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICBicmFuY2ggPSBjb2RlZ2VuLmxvb3BUcmFwKCkgKyBjb2RlZ2VuLmxvb3BIaWdobGlnaHQoJ01hemUnLCB0aGlzLmlkKSArIGJyYW5jaDtcbiAgICByZXR1cm4gJ3doaWxlIChNYXplLm5vdEZpbmlzaGVkKCkpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhciA9IHtcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9SZXBlYXQnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hpbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IubWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIGJyYW5jaCA9IGNvZGVnZW4ubG9vcFRyYXAoKSArIGJyYW5jaDtcbiAgICByZXR1cm4gJ3doaWxlICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXIuRElSRUNUSU9OUyA9IFtcbiAgICAgICBbbXNnLndoaWxlTXNnKCkgKyAnICcgKyBtc2cucGlsZVByZXNlbnQoKSwgJ3BpbGVQcmVzZW50J10sXG4gICAgICAgW21zZy53aGlsZU1zZygpICsgJyAnICsgbXNnLmhvbGVQcmVzZW50KCksICdob2xlUHJlc2VudCddLFxuICAgICAgIFttc2cucmVwZWF0VW50aWxCbG9ja2VkKCksICdpc1BhdGhGb3J3YXJkJ11cbiAgXTtcblxuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19kZWZyZXR1cm47XG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2lmcmV0dXJuO1xuXG59O1xuIiwiLypqc2hpbnQgLVcwODYgKi9cblxudmFyIERpcnREcmF3ZXIgPSByZXF1aXJlKCcuL2RpcnREcmF3ZXInKTtcbnJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBjZWxsSWQgPSByZXF1aXJlKCcuL21hemVVdGlscycpLmNlbGxJZDtcblxudmFyIFNWR19OUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpLlNWR19OUztcbnZhciBTUVVBUkVfU0laRSA9IDUwO1xuXG4vKipcbiAqIEluaGVyaXRzIERpcnREcmF3ZXIgdG8gZHJhdyBmbG93ZXJzL2hvbmV5Y29tYiBmb3IgYmVlLlxuICogQHBhcmFtIGRpcnRNYXAgVGhlIGRpcnRNYXAgZnJvbSB0aGUgbWF6ZSwgd2hpY2ggc2hvd3MgdGhlIGN1cnJlbnQgc3RhdGUgb2ZcbiAqICAgdGhlIGRpcnQgKG9yIGZsb3dlcnMvaG9uZXkgaW4gdGhpcyBjYXNlKS5cbiAqIEBwYXJhbSBza2luIFRoZSBhcHAncyBza2luLCB1c2VkIHRvIGdldCBVUkxzIGZvciBvdXIgaW1hZ2VzXG4gKiBAcGFyYW0gYmVlIFRoZSBtYXplJ3MgQmVlIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gQmVlSXRlbURyYXdlcihkaXJ0TWFwLCBza2luLCBiZWUpIHtcbiAgdGhpcy5fX2Jhc2UgPSBCZWVJdGVtRHJhd2VyLnN1cGVyUHJvdG90eXBlO1xuXG4gIERpcnREcmF3ZXIuY2FsbCh0aGlzLCBkaXJ0TWFwLCAnJyk7XG5cbiAgdGhpcy5za2luXyA9IHNraW47XG4gIHRoaXMuYmVlXyA9IGJlZTtcblxuICB0aGlzLmhvbmV5SW1hZ2VzXyA9IFtdO1xuICB0aGlzLm5lY3RhckltYWdlc18gPSBbXTtcbiAgdGhpcy5zdmdfID0gbnVsbDtcbiAgdGhpcy5wZWdtYW5fID0gbnVsbDtcblxuICAvLyBpcyBpdGVtIGN1cnJlbnRseSBjb3ZlcmVkIGJ5IGEgY2xvdWQ/XG4gIHRoaXMuY2xvdWRlZF8gPSB1bmRlZmluZWQ7XG4gIHRoaXMucmVzZXRDbG91ZGVkKCk7XG59XG5cbkJlZUl0ZW1EcmF3ZXIuaW5oZXJpdHMoRGlydERyYXdlcik7XG5tb2R1bGUuZXhwb3J0cyA9IEJlZUl0ZW1EcmF3ZXI7XG5cbi8qKlxuICogUmVzZXRzIG91ciB0cmFja2luZyBvZiBjbG91ZGVkL3JldmVhbGVkIHNxdWFyZXMuIFVzZWQgb25cbiAqIGluaXRpYWxpemF0aW9uIGFuZCBhbHNvIHRvIHJlc2V0IHRoZSBkcmF3ZXIgYmV0d2VlbiByYW5kb21pemVkXG4gKiBjb25kaXRpb25hbHMgcnVucy5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUucmVzZXRDbG91ZGVkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNsb3VkZWRfID0gdGhpcy5iZWVfLmN1cnJlbnRTdGF0aWNHcmlkLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9KTtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgRGlydERyYXdlcidzIHVwZGF0ZUl0ZW1JbWFnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcnVubmluZyBJcyB1c2VyIGNvZGUgY3VycmVudGx5IHJ1bm5pbmdcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlSXRlbUltYWdlID0gZnVuY3Rpb24gKHJvdywgY29sLCBydW5uaW5nKSB7XG4gIHZhciBiYXNlSW1hZ2UgPSB7XG4gICAgaHJlZjogbnVsbCxcbiAgICB1bmNsaXBwZWRXaWR0aDogU1FVQVJFX1NJWkVcbiAgfTtcblxuICBpZiAodGhpcy5iZWVfLmlzSGl2ZShyb3csIGNvbCwgZmFsc2UpKSB7XG4gICAgYmFzZUltYWdlLmhyZWYgPSB0aGlzLnNraW5fLmhvbmV5O1xuICB9IGVsc2UgaWYgKHRoaXMuYmVlXy5pc0Zsb3dlcihyb3csIGNvbCwgZmFsc2UpKSB7XG4gICAgYmFzZUltYWdlLmhyZWYgPSB0aGlzLmZsb3dlckltYWdlSHJlZl8ocm93LCBjb2wpO1xuICB9XG5cbiAgdmFyIGlzQ2xvdWRhYmxlID0gdGhpcy5iZWVfLmlzQ2xvdWRhYmxlKHJvdywgY29sKTtcbiAgdmFyIGlzQ2xvdWRlZCA9ICFydW5uaW5nICYmIGlzQ2xvdWRhYmxlO1xuICB2YXIgd2FzQ2xvdWRlZCA9IGlzQ2xvdWRhYmxlICYmICh0aGlzLmNsb3VkZWRfW3Jvd11bY29sXSA9PT0gdHJ1ZSk7XG5cbiAgdmFyIGNvdW50ZXJUZXh0O1xuICB2YXIgQUJTX1ZBTFVFX1VOTElNSVRFRCA9IDk5OyAgLy8gUmVwZXNlbnRzIHVubGltaXRlZCBuZWN0YXIvaG9uZXkuXG4gIHZhciBBQlNfVkFMVUVfWkVSTyA9IDk4OyAgLy8gUmVwcmVzZW50cyB6ZXJvIG5lY3Rhci9ob25leS5cbiAgdmFyIGFic1ZhbCA9IE1hdGguYWJzKHRoaXMuYmVlXy5nZXRWYWx1ZShyb3csIGNvbCkpO1xuICBpZiAoaXNDbG91ZGVkKSB7XG4gICAgY291bnRlclRleHQgPSBcIlwiO1xuICB9IGVsc2UgaWYgKCFydW5uaW5nICYmIGJhc2VJbWFnZS5ocmVmID09PSB0aGlzLnNraW5fLnB1cnBsZUZsb3dlcikge1xuICAgIC8vIEluaXRpYWxseSwgaGlkZSBjb3VudGVyIHZhbHVlcyBvZiBwdXJwbGUgZmxvd2Vycy5cbiAgICBjb3VudGVyVGV4dCA9IFwiP1wiO1xuICB9IGVsc2UgaWYgKGFic1ZhbCA9PT0gQUJTX1ZBTFVFX1VOTElNSVRFRCkge1xuICAgIGNvdW50ZXJUZXh0ID0gXCJcIjtcbiAgfSBlbHNlIGlmIChhYnNWYWwgPT09IEFCU19WQUxVRV9aRVJPKSB7XG4gICAgY291bnRlclRleHQgPSBcIjBcIjtcbiAgfSBlbHNlIHtcbiAgICBjb3VudGVyVGV4dCA9IFwiXCIgKyBhYnNWYWw7XG4gIH1cblxuICAvLyBEaXNwbGF5IHRoZSBpbWFnZXMuXG4gIGlmIChiYXNlSW1hZ2UuaHJlZikge1xuICAgIHRoaXMudXBkYXRlSW1hZ2VXaXRoSW5kZXhfKCdiZWVJdGVtJywgcm93LCBjb2wsIGJhc2VJbWFnZSwgMCk7XG4gICAgdGhpcy51cGRhdGVDb3VudGVyXygnY291bnRlcicsIHJvdywgY29sLCBjb3VudGVyVGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2JlZUl0ZW0nLCByb3csIGNvbCwgYmFzZUltYWdlLCAtMSk7XG4gICAgdGhpcy51cGRhdGVDb3VudGVyXygnY291bnRlcicsIHJvdywgY29sLCBcIlwiKTtcbiAgfVxuXG4gIGlmIChpc0Nsb3VkZWQpIHtcbiAgICB0aGlzLnNob3dDbG91ZF8ocm93LCBjb2wpO1xuICAgIHRoaXMuY2xvdWRlZF9bcm93XVtjb2xdID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh3YXNDbG91ZGVkKSB7XG4gICAgdGhpcy5oaWRlQ2xvdWRfKHJvdywgY29sKTtcbiAgICB0aGlzLmNsb3VkZWRfW3Jvd11bY29sXSA9IGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY291bnRlciBhdCB0aGUgZ2l2ZW4gcm93LGNvbCB3aXRoIHRoZSBwcm92aWRlZCBjb3VudGVyVGV4dC5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlQ291bnRlcl8gPSBmdW5jdGlvbiAocHJlZml4LCByb3csIGNvbCwgY291bnRlclRleHQpIHtcbiAgdmFyIGNvdW50ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2VsbElkKHByZWZpeCwgcm93LCBjb2wpKTtcbiAgaWYgKCFjb3VudGVyRWxlbWVudCkge1xuICAgIC8vIHdlIHdhbnQgYW4gZWxlbWVudCwgc28gbGV0J3MgY3JlYXRlIG9uZVxuICAgIGNvdW50ZXJFbGVtZW50ID0gY3JlYXRlVGV4dChwcmVmaXgsIHJvdywgY29sLCBjb3VudGVyVGV4dCk7XG4gIH1cbiAgY291bnRlckVsZW1lbnQuZmlyc3RDaGlsZC5ub2RlVmFsdWUgPSBjb3VudGVyVGV4dDtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHQgKHByZWZpeCwgcm93LCBjb2wsIGNvdW50ZXJUZXh0KSB7XG4gIHZhciBwZWdtYW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuXG4gIC8vIENyZWF0ZSB0ZXh0LlxuICB2YXIgaFBhZGRpbmcgPSAyO1xuICB2YXIgdlBhZGRpbmcgPSAyO1xuICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICd0ZXh0Jyk7XG4gIC8vIFBvc2l0aW9uIHRleHQganVzdCBpbnNpZGUgdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXG4gIHRleHQuc2V0QXR0cmlidXRlKCd4JywgKGNvbCArIDEpICogU1FVQVJFX1NJWkUgLSBoUGFkZGluZyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd5JywgKHJvdyArIDEpICogU1FVQVJFX1NJWkUgLSB2UGFkZGluZyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdpZCcsIGNlbGxJZChwcmVmaXgsIHJvdywgY29sKSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdiZWUtY291bnRlci10ZXh0Jyk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY291bnRlclRleHQpKTtcbiAgc3ZnLmluc2VydEJlZm9yZSh0ZXh0LCBwZWdtYW5FbGVtZW50KTtcblxuICByZXR1cm4gdGV4dDtcbn1cblxuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuY3JlYXRlQ291bnRlckltYWdlXyA9IGZ1bmN0aW9uIChwcmVmaXgsIGksIHJvdywgaHJlZikge1xuICB2YXIgaWQgPSBwcmVmaXggKyAoaSArIDEpO1xuICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCd3aWR0aCcsIFNRVUFSRV9TSVpFKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIGltYWdlLnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcblxuICBpbWFnZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaHJlZik7XG5cbiAgdGhpcy5nZXRTdmdfKCkuaW5zZXJ0QmVmb3JlKGltYWdlLCB0aGlzLmdldFBlZ21hbkVsZW1lbnRfKCkpO1xuXG4gIHJldHVybiBpbWFnZTtcbn07XG5cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLmZsb3dlckltYWdlSHJlZl8gPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMuYmVlXy5pc1JlZEZsb3dlcihyb3csIGNvbCkgPyB0aGlzLnNraW5fLnJlZEZsb3dlciA6XG4gICAgdGhpcy5za2luXy5wdXJwbGVGbG93ZXI7XG59O1xuXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS51cGRhdGVIb25leUNvdW50ZXIgPSBmdW5jdGlvbiAoaG9uZXlDb3VudCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbmV5Q291bnQ7IGkrKykge1xuICAgIGlmICghdGhpcy5ob25leUltYWdlc19baV0pIHtcbiAgICAgIHRoaXMuaG9uZXlJbWFnZXNfW2ldID0gdGhpcy5jcmVhdGVDb3VudGVySW1hZ2VfKCdob25leScsIGksIDEsXG4gICAgICAgIHRoaXMuc2tpbl8uaG9uZXkpO1xuICAgIH1cblxuICAgIHZhciBkZWx0YVggPSBTUVVBUkVfU0laRTtcbiAgICBpZiAoaG9uZXlDb3VudCA+IDgpIHtcbiAgICAgIGRlbHRhWCA9ICg4IC0gMSkgKiBTUVVBUkVfU0laRSAvIChob25leUNvdW50IC0gMSk7XG4gICAgfVxuICAgIHRoaXMuaG9uZXlJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZSgneCcsIGkgKiBkZWx0YVgpO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHRoaXMuaG9uZXlJbWFnZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5ob25leUltYWdlc19baV0uc2V0QXR0cmlidXRlKCdkaXNwbGF5JywgaSA8IGhvbmV5Q291bnQgPyAnYmxvY2snIDogJ25vbmUnKTtcbiAgfVxufTtcblxuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlTmVjdGFyQ291bnRlciA9IGZ1bmN0aW9uIChuZWN0YXJzKSB7XG4gIHZhciBuZWN0YXJDb3VudCA9IG5lY3RhcnMubGVuZ3RoO1xuICAvLyBjcmVhdGUgYW55IG5lZWRlZCBpbWFnZXNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZWN0YXJDb3VudDsgaSsrKSB7XG4gICAgdmFyIGhyZWYgPSB0aGlzLmZsb3dlckltYWdlSHJlZl8obmVjdGFyc1tpXS5yb3csIG5lY3RhcnNbaV0uY29sKTtcblxuICAgIGlmICghdGhpcy5uZWN0YXJJbWFnZXNfW2ldKSB7XG4gICAgICB0aGlzLm5lY3RhckltYWdlc19baV0gPSB0aGlzLmNyZWF0ZUNvdW50ZXJJbWFnZV8oJ25lY3RhcicsIGksIDAsIGhyZWYpO1xuICAgIH1cblxuICAgIHZhciBkZWx0YVggPSBTUVVBUkVfU0laRTtcbiAgICBpZiAobmVjdGFyQ291bnQgPiA4KSB7XG4gICAgICBkZWx0YVggPSAoOCAtIDEpICogU1FVQVJFX1NJWkUgLyAobmVjdGFyQ291bnQgLSAxKTtcbiAgICB9XG4gICAgdGhpcy5uZWN0YXJJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZSgneCcsIGkgKiBkZWx0YVgpO1xuICAgIHRoaXMubmVjdGFySW1hZ2VzX1tpXS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAneGxpbms6aHJlZicsIGhyZWYpO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHRoaXMubmVjdGFySW1hZ2VzXy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMubmVjdGFySW1hZ2VzX1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc3BsYXknLCBpIDwgbmVjdGFyQ291bnQgPyAnYmxvY2snIDogJ25vbmUnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDYWNoZSBzdmcgZWxlbWVudFxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5nZXRTdmdfID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuc3ZnXykge1xuICAgIHRoaXMuc3ZnXyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuc3ZnXztcbn07XG5cbi8qKlxuICogQ2FjaGUgcGVnbWFuIGVsZW1lbnRcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuZ2V0UGVnbWFuRWxlbWVudF8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5wZWdtYW5fKSB7XG4gICAgdGhpcy5wZWdtYW5fID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gIH1cbiAgcmV0dXJuIHRoaXMucGVnbWFuXztcbn07XG5cbi8qKlxuICogU2hvdyB0aGUgY2xvdWQgaWNvbi5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuc2hvd0Nsb3VkXyA9IGZ1bmN0aW9uKHJvdywgY29sKSB7XG4gIHZhciBjbG91ZEltYWdlSW5mbyAgPSB7XG4gICAgaHJlZjogdGhpcy5za2luXy5jbG91ZCxcbiAgICB1bmNsaXBwZWRXaWR0aDogNTBcbiAgfTtcbiAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2Nsb3VkJywgcm93LCBjb2wsIGNsb3VkSW1hZ2VJbmZvLCAwKTtcblxuICAvLyBNYWtlIHN1cmUgdGhlIGFuaW1hdGlvbiBpcyBjYWNoZWQgYnkgdGhlIGJyb3dzZXIuXG4gIHRoaXMuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyhyb3csIGNvbCwgZmFsc2UgLyogYW5pbWF0ZSAqLyk7XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIGNsb3VkIGljb24sIGFuZCBkaXNwbGF5IHRoZSBjbG91ZCBoaWRpbmcgYW5pbWF0aW9uLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5oaWRlQ2xvdWRfID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgdmFyIGNsb3VkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNlbGxJZCgnY2xvdWQnLCByb3csIGNvbCkpO1xuICBpZiAoY2xvdWRFbGVtZW50KSB7XG4gICAgY2xvdWRFbGVtZW50LnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIHRoaXMuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyhyb3csIGNvbCwgdHJ1ZSAvKiBhbmltYXRlICovKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBjbG91ZCBhbmltYXRpb24gZWxlbWVudCwgYW5kIHBlcmZvcm0gdGhlIGFuaW1hdGlvbiBpZiBuZWNlc3NhcnlcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyA9IGZ1bmN0aW9uKHJvdywgY29sLCBhbmltYXRlKSB7XG4gIHZhciBpZCA9IGNlbGxJZCgnY2xvdWRBbmltYXRpb24nLCByb3csIGNvbCk7XG5cbiAgdmFyIGNsb3VkQW5pbWF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gIGlmICghY2xvdWRBbmltYXRpb24pIHtcbiAgICB2YXIgcGVnbWFuRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BlZ21hbi1sb2NhdGlvbicpWzBdO1xuICAgIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuICAgIGNsb3VkQW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gICAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICAgIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gICAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjbG91ZEFuaW1hdGlvbiwgcGVnbWFuRWxlbWVudCk7XG4gIH1cblxuICAvLyBXZSB3YW50IHRvIGNyZWF0ZSB0aGUgZWxlbWVudCBldmVudCBpZiB3ZSdyZSBub3QgYW5pbWF0aW5nIHlldCBzbyB0aGF0IHdlXG4gIC8vIGNhbiBtYWtlIHN1cmUgaXQgZ2V0cyBsb2FkZWQuXG4gIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsIGFuaW1hdGUgPyAndmlzaWJsZScgOiAnaGlkZGVuJyk7XG4gIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICd4bGluazpocmVmJywgdGhpcy5za2luXy5jbG91ZEFuaW1hdGlvbik7XG59O1xuXG4vKipcbiAqIERyYXcgb3VyIGNoZWNrZXJib2FyZCB0aWxlLCBtYWtpbmcgcGF0aCB0aWxlcyBsaWdodGVyLiBGb3Igbm9uLXBhdGggdGlsZXMsIHdlXG4gKiB3YW50IHRvIGJlIHN1cmUgdGhhdCB0aGUgY2hlY2tlcmJvYXJkIHNxdWFyZSBpcyBiZWxvdyB0aGUgdGlsZSBlbGVtZW50IChpLmUuXG4gKiB0aGUgdHJlZXMpLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5hZGRDaGVja2VyYm9hcmRUaWxlID0gZnVuY3Rpb24gKHJvdywgY29sLCBpc1BhdGgpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIHZhciByZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdmaWxsJywgJyM3OGJiMjknKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCBpc1BhdGggPyAwLjIgOiAwLjUpO1xuICBpZiAoaXNQYXRoKSB7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHJlY3QpO1xuICB9IGVsc2Uge1xuICAgIHZhciB0aWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIChyb3cgKiA4ICsgY29sKSk7XG4gICAgc3ZnLmluc2VydEJlZm9yZShyZWN0LCB0aWxlKTtcbiAgfVxufTtcbiIsInZhciBjZWxsSWQgPSByZXF1aXJlKCcuL21hemVVdGlscycpLmNlbGxJZDtcblxuLy8gVGhlIG51bWJlciBsaW5lIGlzIFstaW5mLCBtaW4sIG1pbisxLCAuLi4gbm8gemVybyAuLi4sIG1heC0xLCBtYXgsICtpbmZdXG52YXIgRElSVF9NQVggPSAxMDtcbnZhciBESVJUX0NPVU5UID0gRElSVF9NQVggKiAyICsgMjtcblxuLy8gRHVwbGljYXRlZCBmcm9tIG1hemUuanMgc28gdGhhdCBJIGRvbid0IG5lZWQgYSBkZXBlbmRlbmN5XG52YXIgU1FVQVJFX1NJWkUgPSA1MDtcblxudmFyIFNWR19OUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpLlNWR19OUztcblxudmFyIERpcnREcmF3ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkaXJ0TWFwLCBkaXJ0QXNzZXQpIHtcbiAgdGhpcy5kaXJ0TWFwXyA9IGRpcnRNYXA7XG5cbiAgdGhpcy5kaXJ0SW1hZ2VJbmZvXyA9IHtcbiAgICBocmVmOiBkaXJ0QXNzZXQsXG4gICAgdW5jbGlwcGVkV2lkdGg6IFNRVUFSRV9TSVpFICogRElSVF9DT1VOVFxuICB9O1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGltYWdlIGF0IHRoZSBnaXZlbiByb3csY29sIGJ5IGRldGVybWluaW5nIHRoZSBzcHJpdGVJbmRleCBmb3IgdGhlXG4gKiBjdXJyZW50IHZhbHVlXG4gKi9cbkRpcnREcmF3ZXIucHJvdG90eXBlLnVwZGF0ZUl0ZW1JbWFnZSA9IGZ1bmN0aW9uIChyb3csIGNvbCwgcnVubmluZykge1xuICB2YXIgdmFsID0gdGhpcy5kaXJ0TWFwX1tyb3ddW2NvbF07XG4gIHRoaXMudXBkYXRlSW1hZ2VXaXRoSW5kZXhfKCdkaXJ0Jywgcm93LCBjb2wsIHRoaXMuZGlydEltYWdlSW5mb18sXG4gICAgc3ByaXRlSW5kZXhGb3JEaXJ0KHZhbCkpO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGltYWdlIGF0IHRoZSBnaXZlbiByb3csY29sIHdpdGggdGhlIHByb3ZpZGVkIHNwcml0ZUluZGV4LlxuICovXG5EaXJ0RHJhd2VyLnByb3RvdHlwZS51cGRhdGVJbWFnZVdpdGhJbmRleF8gPSBmdW5jdGlvbiAocHJlZml4LCByb3csIGNvbCwgaW1hZ2VJbmZvLCBzcHJpdGVJbmRleCkge1xuICB2YXIgaGlkZGVuSW1hZ2UgPSAoc3ByaXRlSW5kZXggPCAwIHx8IGltYWdlSW5mby5ocmVmID09PSBudWxsKTtcblxuICB2YXIgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2VsbElkKHByZWZpeCwgcm93LCBjb2wpKTtcbiAgaWYgKCFpbWcpIHtcbiAgICAvLyB3ZSBkb24ndCBuZWVkIGFueSBpbWFnZVxuICAgIGlmIChoaWRkZW5JbWFnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB3ZSB3YW50IGFuIGltYWdlLCBzbyBsZXQncyBjcmVhdGUgb25lXG4gICAgaW1nID0gY3JlYXRlSW1hZ2UocHJlZml4LCByb3csIGNvbCwgaW1hZ2VJbmZvKTtcbiAgfSBlbHNlIGlmIChpbWFnZUluZm8uaHJlZikge1xuICAgIC8vdXBkYXRlIGltZ1xuICAgIGltZy5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaW1hZ2VJbmZvLmhyZWYpO1xuICB9XG5cbiAgaW1nLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsIGhpZGRlbkltYWdlID8gJ2hpZGRlbicgOiAndmlzaWJsZScpO1xuICBpZiAoIWhpZGRlbkltYWdlKSB7XG4gICAgaW1nLnNldEF0dHJpYnV0ZSgneCcsIFNRVUFSRV9TSVpFICogKGNvbCAtIHNwcml0ZUluZGV4KSk7XG4gICAgaW1nLnNldEF0dHJpYnV0ZSgneScsIFNRVUFSRV9TSVpFICogcm93KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY3JlYXRlSW1hZ2UgKHByZWZpeCwgcm93LCBjb2wsIGltYWdlSW5mbykge1xuICB2YXIgcGVnbWFuRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BlZ21hbi1sb2NhdGlvbicpWzBdO1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcblxuICB2YXIgY2xpcElkID0gY2VsbElkKHByZWZpeCArICdDbGlwJywgcm93LCBjb2wpO1xuICB2YXIgaW1nSWQgPSBjZWxsSWQocHJlZml4LCByb3csIGNvbCk7XG5cbiAgLy8gQ3JlYXRlIGNsaXAgcGF0aC5cbiAgdmFyIGNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnY2xpcFBhdGgnKTtcbiAgY2xpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgY2xpcElkKTtcbiAgdmFyIHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgY2xpcC5hcHBlbmRDaGlsZChyZWN0KTtcbiAgc3ZnLmluc2VydEJlZm9yZShjbGlwLCBwZWdtYW5FbGVtZW50KTtcbiAgLy8gQ3JlYXRlIGltYWdlLlxuICB2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gIGltZy5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaW1hZ2VJbmZvLmhyZWYpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgaW1hZ2VJbmZvLnVuY2xpcHBlZFdpZHRoKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJywgJ3VybCgjJyArIGNsaXBJZCArICcpJyk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2lkJywgaW1nSWQpO1xuICBzdmcuaW5zZXJ0QmVmb3JlKGltZywgcGVnbWFuRWxlbWVudCk7XG5cbiAgcmV0dXJuIGltZztcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGRpcnQgdmFsdWUsIHJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBzcHJpdGUgdG8gdXNlIGluIG91ciBzcHJpdGVzaGVldC5cbiAqIFJldHVybnMgLTEgaWYgd2Ugd2FudCB0byBkaXNwbGF5IG5vIHNwcml0ZS5cbiAqL1xuIGZ1bmN0aW9uIHNwcml0ZUluZGV4Rm9yRGlydCAodmFsKSB7XG4gIHZhciBzcHJpdGVJbmRleDtcblxuICBpZiAodmFsID09PSAwKSB7XG4gICAgc3ByaXRlSW5kZXggPSAtMTtcbiAgfSBlbHNlIGlmKHZhbCA8IC1ESVJUX01BWCkge1xuICAgIHNwcml0ZUluZGV4ID0gMDtcbiAgfSBlbHNlIGlmICh2YWwgPCAwKSB7XG4gICAgc3ByaXRlSW5kZXggPSBESVJUX01BWCArIHZhbCArIDE7XG4gIH0gZWxzZSBpZiAodmFsID4gRElSVF9NQVgpIHtcbiAgICBzcHJpdGVJbmRleCA9IERJUlRfQ09VTlQgLSAxO1xuICB9IGVsc2UgaWYgKHZhbCA+IDApIHtcbiAgICBzcHJpdGVJbmRleCA9IERJUlRfTUFYICsgdmFsO1xuICB9XG5cbiAgcmV0dXJuIHNwcml0ZUluZGV4O1xufVxuXG4vKiBzdGFydC10ZXN0LWJsb2NrICovXG4vLyBleHBvcnQgcHJpdmF0ZSBmdW5jdGlvbihzKSB0byBleHBvc2UgdG8gdW5pdCB0ZXN0aW5nXG5EaXJ0RHJhd2VyLl9fdGVzdG9ubHlfXyA9IHtcbiAgc3ByaXRlSW5kZXhGb3JEaXJ0OiBzcHJpdGVJbmRleEZvckRpcnQsXG4gIGNyZWF0ZUltYWdlOiBjcmVhdGVJbWFnZVxufTtcbi8qIGVuZC10ZXN0LWJsb2NrICovXG4iLCIvKipcbiAqIEdlbmVyYWxpemVkIGZ1bmN0aW9uIGZvciBnZW5lcmF0aW5nIGlkcyBmb3IgY2VsbHMgaW4gYSB0YWJsZVxuICovXG5leHBvcnRzLmNlbGxJZCA9IGZ1bmN0aW9uIChwcmVmaXgsIHJvdywgY29sKSB7XG4gIHJldHVybiBwcmVmaXggKyAnXycgKyByb3cgKyAnXycgKyBjb2w7XG59O1xuXG4vKipcbiAqIElzIHNraW4gZWl0aGVyIGJlZSBvciBiZWVfbmlnaHRcbiAqL1xuZXhwb3J0cy5pc0JlZVNraW4gPSBmdW5jdGlvbiAoc2tpbklkKSB7XG4gIHJldHVybiAoL2JlZShfbmlnaHQpPy8pLnRlc3Qoc2tpbklkKTtcbn07XG5cbi8qKlxuICogSXMgc2tpbiBzY3JhdFxuICovXG5leHBvcnRzLmlzU2NyYXRTa2luID0gZnVuY3Rpb24gKHNraW5JZCkge1xuICByZXR1cm4gKC9zY3JhdC8pLnRlc3Qoc2tpbklkKTtcbn07XG4iLCIvKipcbiAqIEJsb2NrcyBzcGVjaWZpYyB0byBCZWVcbiAqL1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xuXG52YXIgT1BFUkFUT1JTID0gW1xuICBbJz0nLCAnPT0nXSxcbiAgWyc8JywgJzwnXSxcbiAgWyc+JywgJz4nXVxuXTtcblxudmFyIFRPT0xUSVBTID0ge1xuICAnPT0nOiBCbG9ja2x5Lk1zZy5MT0dJQ19DT01QQVJFX1RPT0xUSVBfRVEsXG4gICc8JzogQmxvY2tseS5Nc2cuTE9HSUNfQ09NUEFSRV9UT09MVElQX0xULFxuICAnPic6IEJsb2NrbHkuTXNnLkxPR0lDX0NPTVBBUkVfVE9PTFRJUF9HVFxufTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuICB2YXIgaXNLMSA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuaXNLMTtcblxuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICBhZGRJZk9ubHlGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yKTtcbiAgYWRkSWZGbG93ZXJIaXZlKGJsb2NrbHksIGdlbmVyYXRvcik7XG4gIGFkZElmRWxzZUZsb3dlckhpdmUoYmxvY2tseSwgZ2VuZXJhdG9yKTtcblxuICBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsICdiZWVfaWZOZWN0YXJBbW91bnQnLCAnaWYnLFxuICAgIFtbbXNnLm5lY3RhclJlbWFpbmluZygpLCAnbmVjdGFyUmVtYWluaW5nJ10sXG4gICAgIFttc2cuaG9uZXlBdmFpbGFibGUoKSwgJ2hvbmV5QXZhaWxhYmxlJ11dKTtcblxuICBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsICdiZWVfaWZlbHNlTmVjdGFyQW1vdW50JywgJ2lmZWxzZScsXG4gICAgW1ttc2cubmVjdGFyUmVtYWluaW5nKCksICduZWN0YXJSZW1haW5pbmcnXSxcbiAgICAgW21zZy5ob25leUF2YWlsYWJsZSgpLCAnaG9uZXlBdmFpbGFibGUnXV0pO1xuXG4gIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgJ2JlZV9pZlRvdGFsTmVjdGFyJywgJ2lmJyxcbiAgICBbW21zZy50b3RhbE5lY3RhcigpLCAnbmVjdGFyQ29sbGVjdGVkJ10sXG4gICAgIFttc2cudG90YWxIb25leSgpLCAnaG9uZXlDcmVhdGVkJ11dKTtcblxuICBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsICdiZWVfaWZlbHNlVG90YWxOZWN0YXInLCAnaWZlbHNlJyxcbiAgICBbW21zZy50b3RhbE5lY3RhcigpLCAnbmVjdGFyQ29sbGVjdGVkJ10sXG4gICAgIFttc2cudG90YWxIb25leSgpLCAnaG9uZXlDcmVhdGVkJ11dKTtcblxuICBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsICdiZWVfd2hpbGVOZWN0YXJBbW91bnQnLCAnd2hpbGUnLFxuICAgIFtbbXNnLm5lY3RhclJlbWFpbmluZygpLCAnbmVjdGFyUmVtYWluaW5nJ10sXG4gICAgIFttc2cuaG9uZXlBdmFpbGFibGUoKSwgJ2hvbmV5QXZhaWxhYmxlJ11dKTtcblxuICBibG9ja1V0aWxzLmdlbmVyYXRlU2ltcGxlQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgbmFtZTogJ21hemVfbmVjdGFyJyxcbiAgICBoZWxwVXJsOiAnJyxcbiAgICB0aXRsZTogaXNLMSA/IG1zZy5nZXQoKSA6IG1zZy5uZWN0YXIoKSxcbiAgICB0aXRsZUltYWdlOiBpc0sxID8gc2tpbi5yZWRGbG93ZXIgOiB1bmRlZmluZWQsXG4gICAgdG9vbHRpcDogbXNnLm5lY3RhclRvb2x0aXAoKSxcbiAgICBmdW5jdGlvbk5hbWU6ICdNYXplLmdldE5lY3RhcidcbiAgfSk7XG5cbiAgYmxvY2tVdGlscy5nZW5lcmF0ZVNpbXBsZUJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIG5hbWU6ICdtYXplX2hvbmV5JyxcbiAgICBoZWxwVXJsOiAnJyxcbiAgICB0aXRsZTogaXNLMSA/IG1zZy5tYWtlKCkgOiBtc2cuaG9uZXkoKSxcbiAgICB0aXRsZUltYWdlOiBpc0sxID8gc2tpbi5ob25leSA6IHVuZGVmaW5lZCxcbiAgICB0b29sdGlwOiBtc2cuaG9uZXlUb29sdGlwKCksXG4gICAgZnVuY3Rpb25OYW1lOiAnTWF6ZS5tYWtlSG9uZXknXG4gIH0pO1xufTtcblxuLyoqXG4gKiBBcmUgd2UgYXQgYSBmbG93ZXJcbiAqL1xuZnVuY3Rpb24gYWRkSWZPbmx5Rmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvcikge1xuICBibG9ja2x5LkJsb2Nrcy5iZWVfaWZPbmx5Rmxvd2VyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmlmQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5hdEZsb3dlcigpKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZk9ubHlGbG93ZXJUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRVhBTVBMRTpcbiAgLy8gaWYgKE1hemUuYXRGbG93ZXIoKSkgeyBjb2RlIH1cbiAgZ2VuZXJhdG9yLmJlZV9pZk9ubHlGbG93ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHdlJ3JlIGF0IGEgZmxvd2VyXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuYXRGbG93ZXInICsgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG59XG5cbi8qKlxuICogQXJlIHdlIGF0IGEgZmxvd2VyIG9yIGEgaGl2ZVxuICovXG5mdW5jdGlvbiBhZGRJZkZsb3dlckhpdmUoYmxvY2tseSwgZ2VuZXJhdG9yKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmJlZV9pZkZsb3dlciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBMT0NBVElPTlMgPSBbXG4gICAgICAgIFttc2cuYXRGbG93ZXIoKSwgJ2F0Rmxvd2VyJ10sXG4gICAgICAgIFttc2cuYXRIb25leWNvbWIoKSwgJ2F0SG9uZXljb21iJ11cbiAgICAgIF07XG5cbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pZkNvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKExPQ0FUSU9OUyksICdMT0MnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZkZsb3dlclRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICAvLyBFWEFNUExFUzpcbiAgLy8gaWYgKE1hemUuYXRGbG93ZXIoKSkgeyBjb2RlIH1cbiAgLy8gaWYgKE1hemUuYXRIb25leWNvbWIoKSkgeyBjb2RlIH1cbiAgZ2VuZXJhdG9yLmJlZV9pZkZsb3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgd2UncmUgYXQgYSBmbG93ZXIvaGl2ZVxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0xPQycpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG59XG5cbi8qKlxuICogQXJlIHdlIGF0IGEgZmxvd2VyIG9yIGEgaGl2ZSB3aXRoIGVsc2VcbiAqL1xuZnVuY3Rpb24gYWRkSWZFbHNlRmxvd2VySGl2ZShibG9ja2x5LCBnZW5lcmF0b3IpIHtcbiAgYmxvY2tseS5CbG9ja3MuYmVlX2lmRWxzZUZsb3dlciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBMT0NBVElPTlMgPSBbXG4gICAgICAgIFttc2cuYXRGbG93ZXIoKSwgJ2F0Rmxvd2VyJ10sXG4gICAgICAgIFttc2cuYXRIb25leWNvbWIoKSwgJ2F0SG9uZXljb21iJ11cbiAgICAgIF07XG5cbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pZkNvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKExPQ0FUSU9OUyksICdMT0MnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRUxTRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5lbHNlQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZlbHNlRmxvd2VyVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIEVYQU1QTEVTOlxuICAvLyBpZiAoTWF6ZS5hdEZsb3dlcigpKSB7IGNvZGUgfSBlbHNlIHsgbW9yZWNvZGUgfVxuICAvLyBpZiAoTWF6ZS5hdEhvbmV5Y29tYigpKSB7IGNvZGUgfSBlbHNlIHsgbW9yZWNvZGUgfVxuICBnZW5lcmF0b3IuYmVlX2lmRWxzZUZsb3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgd2UncmUgYXQgYSBmbG93ZXIvaGl2ZVxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0xPQycpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoMCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJyYW5jaDEgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdFTFNFJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoMCArXG4gICAgICAnfSBlbHNlIHtcXG4nICsgYnJhbmNoMSArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCBuYW1lLCB0eXBlLCBhcmcxKSB7XG4gIGJsb2NrbHkuQmxvY2tzW25hbWVdID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgY29uZGl0aW9uYWxNc2c7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnaWYnOlxuICAgICAgICAgIGNvbmRpdGlvbmFsTXNnID0gbXNnLmlmQ29kZSgpO1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaWZlbHNlJzpcbiAgICAgICAgICBjb25kaXRpb25hbE1zZyA9IG1zZy5pZkNvZGUoKTtcbiAgICAgICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3doaWxlJzpcbiAgICAgICAgICBjb25kaXRpb25hbE1zZyA9IG1zZy53aGlsZU1zZygpO1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgJ1VuZXhwY3RlZCB0eXBlIGZvciBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbmRpdGlvbmFsTXNnKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oYXJnMSksICdBUkcxJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZSgnICcpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihPUEVSQVRPUlMpLCAnT1AnKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKCcgJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdBUkcyJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIGlmICh0eXBlID09PSBcImlmZWxzZVwiKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0VMU0UnKVxuICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5lbHNlQ29kZSgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG5cbiAgICAgIHRoaXMuc2V0VG9vbHRpcChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wID0gc2VsZi5nZXRUaXRsZVZhbHVlKCdPUCcpO1xuICAgICAgICByZXR1cm4gVE9PTFRJUFNbb3BdO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGlmIChNYXplLm5lY3RhckNvbGxlY3RlZCgpID4gMCkgeyBjb2RlIH1cbiAgLy8gaWYgKE1hemUuaG9uZXlDcmVhdGVkKCkgPT0gMSkgeyBjb2RlIH1cbiAgZ2VuZXJhdG9yW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB3ZSdyZSBhdCBhIGZsb3dlci9oaXZlXG4gICAgdmFyIGFyZ3VtZW50MSA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0FSRzEnKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIG9wZXJhdG9yID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdPUCcpO1xuICAgIHZhciBvcmRlciA9IChvcGVyYXRvciA9PT0gJz09JyB8fCBvcGVyYXRvciA9PT0gJyE9JykgP1xuICAgICAgQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX0VRVUFMSVRZIDogQmxvY2tseS5KYXZhU2NyaXB0Lk9SREVSX1JFTEFUSU9OQUw7XG4gICAgdmFyIGFyZ3VtZW50MiA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnQVJHMicpO1xuICAgIHZhciBicmFuY2gwID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgZWxzZUJsb2NrID0gXCJcIjtcbiAgICBpZiAodHlwZSA9PT0gXCJpZmVsc2VcIikge1xuICAgICAgdmFyIGJyYW5jaDEgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdFTFNFJyk7XG4gICAgICBlbHNlQmxvY2sgPSAnIGVsc2Uge1xcbicgKyBicmFuY2gxICsgJ30nO1xuICAgIH1cblxuICAgIHZhciBjb21tYW5kID0gdHlwZTtcbiAgICBpZiAodHlwZSA9PT0gXCJpZmVsc2VcIikge1xuICAgICAgY29tbWFuZCA9IFwiaWZcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tbWFuZCArICcgKCcgKyBhcmd1bWVudDEgKyAnICcgKyBvcGVyYXRvciAgKyAnICcgKyBhcmd1bWVudDIgKyAnKSB7XFxuJyArXG4gICAgICBicmFuY2gwICsgJ30nICsgZWxzZUJsb2NrICsgJ1xcbic7XG4gIH07XG59XG4iLCJ2YXIgdGlsZXMgPSByZXF1aXJlKCcuL3RpbGVzJyk7XG52YXIgRGlyZWN0aW9uID0gdGlsZXMuRGlyZWN0aW9uO1xudmFyIE1vdmVEaXJlY3Rpb24gPSB0aWxlcy5Nb3ZlRGlyZWN0aW9uO1xudmFyIFR1cm5EaXJlY3Rpb24gPSB0aWxlcy5UdXJuRGlyZWN0aW9uO1xudmFyIFNxdWFyZVR5cGUgPSB0aWxlcy5TcXVhcmVUeXBlO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBCZWUgPSByZXF1aXJlKCcuL2JlZScpO1xuXG4vKipcbiAqIE9ubHkgY2FsbCBBUEkgZnVuY3Rpb25zIGlmIHdlIGhhdmVuJ3QgeWV0IHRlcm1pbmF0ZWQgZXhlY3V0aW9uXG4gKi9cbnZhciBBUElfRlVOQ1RJT04gPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIHV0aWxzLmV4ZWN1dGVJZkNvbmRpdGlvbmFsKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gIU1hemUuZXhlY3V0aW9uSW5mby5pc1Rlcm1pbmF0ZWQoKTtcbiAgfSwgZm4pO1xufTtcblxuLyoqXG4gKiBJcyB0aGVyZSBhIHBhdGggbmV4dCB0byBwZWdtYW4/XG4gKiBAcGFyYW0ge251bWJlcn0gZGlyZWN0aW9uIERpcmVjdGlvbiB0byBsb29rXG4gKiAgICAgKDAgPSBmb3J3YXJkLCAxID0gcmlnaHQsIDIgPSBiYWNrd2FyZCwgMyA9IGxlZnQpLlxuICogQHBhcmFtIHs/c3RyaW5nfSBpZCBJRCBvZiBibG9jayB0aGF0IHRyaWdnZXJlZCB0aGlzIGFjdGlvbi5cbiAqICAgICBOdWxsIGlmIGNhbGxlZCBhcyBhIGhlbHBlciBmdW5jdGlvbiBpbiBNYXplLm1vdmUoKS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICovXG52YXIgaXNQYXRoID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICB2YXIgZWZmZWN0aXZlRGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EICsgZGlyZWN0aW9uO1xuICB2YXIgc3F1YXJlO1xuICB2YXIgY29tbWFuZDtcbiAgc3dpdGNoICh0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGVmZmVjdGl2ZURpcmVjdGlvbikpIHtcbiAgICBjYXNlIERpcmVjdGlvbi5OT1JUSDpcbiAgICAgIHNxdWFyZSA9IE1hemUubWFwW01hemUucGVnbWFuWSAtIDFdICYmXG4gICAgICAgICAgTWF6ZS5tYXBbTWF6ZS5wZWdtYW5ZIC0gMV1bTWF6ZS5wZWdtYW5YXTtcbiAgICAgIGNvbW1hbmQgPSAnbG9va19ub3J0aCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5FQVNUOlxuICAgICAgc3F1YXJlID0gTWF6ZS5tYXBbTWF6ZS5wZWdtYW5ZXVtNYXplLnBlZ21hblggKyAxXTtcbiAgICAgIGNvbW1hbmQgPSAnbG9va19lYXN0JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLlNPVVRIOlxuICAgICAgc3F1YXJlID0gTWF6ZS5tYXBbTWF6ZS5wZWdtYW5ZICsgMV0gJiZcbiAgICAgICAgICBNYXplLm1hcFtNYXplLnBlZ21hblkgKyAxXVtNYXplLnBlZ21hblhdO1xuICAgICAgY29tbWFuZCA9ICdsb29rX3NvdXRoJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLldFU1Q6XG4gICAgICBzcXVhcmUgPSBNYXplLm1hcFtNYXplLnBlZ21hblldW01hemUucGVnbWFuWCAtIDFdO1xuICAgICAgY29tbWFuZCA9ICdsb29rX3dlc3QnO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGlkKSB7XG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKGNvbW1hbmQsIGlkKTtcbiAgfVxuICByZXR1cm4gc3F1YXJlICE9PSBTcXVhcmVUeXBlLldBTEwgJiZcbiAgICAgICAgc3F1YXJlICE9PSBTcXVhcmVUeXBlLk9CU1RBQ0xFICYmXG4gICAgICAgIHNxdWFyZSAhPT0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBBdHRlbXB0IHRvIG1vdmUgcGVnbWFuIGZvcndhcmQgb3IgYmFja3dhcmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZGlyZWN0aW9uIERpcmVjdGlvbiB0byBtb3ZlICgwID0gZm9yd2FyZCwgMiA9IGJhY2t3YXJkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBJRCBvZiBibG9jayB0aGF0IHRyaWdnZXJlZCB0aGlzIGFjdGlvbi5cbiAqIEB0aHJvd3Mge3RydWV9IElmIHRoZSBlbmQgb2YgdGhlIG1hemUgaXMgcmVhY2hlZC5cbiAqIEB0aHJvd3Mge2ZhbHNlfSBJZiBQZWdtYW4gY29sbGlkZXMgd2l0aCBhIHdhbGwuXG4gKi9cbnZhciBtb3ZlID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBpZiAoIWlzUGF0aChkaXJlY3Rpb24sIG51bGwpKSB7XG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdmYWlsXycgKyAoZGlyZWN0aW9uID8gJ2JhY2t3YXJkJyA6ICdmb3J3YXJkJyksIGlkKTtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKGZhbHNlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgbW92aW5nIGJhY2t3YXJkLCBmbGlwIHRoZSBlZmZlY3RpdmUgZGlyZWN0aW9uLlxuICB2YXIgZWZmZWN0aXZlRGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EICsgZGlyZWN0aW9uO1xuICB2YXIgY29tbWFuZDtcbiAgc3dpdGNoICh0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGVmZmVjdGl2ZURpcmVjdGlvbikpIHtcbiAgICBjYXNlIERpcmVjdGlvbi5OT1JUSDpcbiAgICAgIE1hemUucGVnbWFuWS0tO1xuICAgICAgY29tbWFuZCA9ICdub3J0aCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5FQVNUOlxuICAgICAgTWF6ZS5wZWdtYW5YKys7XG4gICAgICBjb21tYW5kID0gJ2Vhc3QnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uU09VVEg6XG4gICAgICBNYXplLnBlZ21hblkrKztcbiAgICAgIGNvbW1hbmQgPSAnc291dGgnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uV0VTVDpcbiAgICAgIE1hemUucGVnbWFuWC0tO1xuICAgICAgY29tbWFuZCA9ICd3ZXN0JztcbiAgICAgIGJyZWFrO1xuICB9XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihjb21tYW5kLCBpZCk7XG4gIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICBNYXplLndvcmRTZWFyY2gubWFya1RpbGVWaXNpdGVkKE1hemUucGVnbWFuWSwgTWF6ZS5wZWdtYW5YLCBmYWxzZSk7XG4gICAgLy8gd29yZHNlYXJjaCBkb2VzbnQgY2hlY2sgZm9yIHN1Y2Nlc3MgdW50aWwgaXQgaGFzIGZpbmlzaGVkIHJ1bm5pbmcgY29tcGxldGVseVxuICAgIHJldHVybjtcbiAgfVxuICBNYXplLmNoZWNrU3VjY2VzcygpO1xufTtcblxuLyoqXG4gKiBUdXJuIHBlZ21hbiBsZWZ0IG9yIHJpZ2h0LlxuICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiBEaXJlY3Rpb24gdG8gdHVybiAoMCA9IGxlZnQsIDEgPSByaWdodCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgSUQgb2YgYmxvY2sgdGhhdCB0cmlnZ2VyZWQgdGhpcyBhY3Rpb24uXG4gKi9cbnZhciB0dXJuID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBpZiAoZGlyZWN0aW9uID09IFR1cm5EaXJlY3Rpb24uUklHSFQpIHtcbiAgICAvLyBSaWdodCB0dXJuIChjbG9ja3dpc2UpLlxuICAgIE1hemUucGVnbWFuRCArPSBUdXJuRGlyZWN0aW9uLlJJR0hUO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbigncmlnaHQnLCBpZCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTGVmdCB0dXJuIChjb3VudGVyY2xvY2t3aXNlKS5cbiAgICBNYXplLnBlZ21hbkQgKz0gVHVybkRpcmVjdGlvbi5MRUZUO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignbGVmdCcsIGlkKTtcbiAgfVxuICBNYXplLnBlZ21hbkQgPSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KE1hemUucGVnbWFuRCk7XG59O1xuXG4vKipcbiAqIFR1cm4gcGVnbWFuIHRvd2FyZHMgYSBnaXZlbiBkaXJlY3Rpb24sIHR1cm5pbmcgdGhyb3VnaCBzdGFnZSBmcm9udCAoc291dGgpXG4gKiB3aGVuIHBvc3NpYmxlLlxuICogQHBhcmFtIHtudW1iZXJ9IG5ld0RpcmVjdGlvbiBEaXJlY3Rpb24gdG8gdHVybiB0byAoZS5nLiwgRGlyZWN0aW9uLk5PUlRIKVxuICogQHBhcmFtIHtzdHJpbmd9IGlkIElEIG9mIGJsb2NrIHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICovXG52YXIgdHVyblRvID0gZnVuY3Rpb24obmV3RGlyZWN0aW9uLCBpZCkge1xuICB2YXIgY3VycmVudERpcmVjdGlvbiA9IE1hemUucGVnbWFuRDtcbiAgaWYgKGlzVHVybkFyb3VuZChjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdmFyIHNob3VsZFR1cm5DV1RvUHJlZmVyU3RhZ2VGcm9udCA9IGN1cnJlbnREaXJlY3Rpb24gLSBuZXdEaXJlY3Rpb24gPCAwO1xuICAgIHZhciByZWxhdGl2ZVR1cm5EaXJlY3Rpb24gPSBzaG91bGRUdXJuQ1dUb1ByZWZlclN0YWdlRnJvbnQgPyBUdXJuRGlyZWN0aW9uLlJJR0hUIDogVHVybkRpcmVjdGlvbi5MRUZUO1xuICAgIHR1cm4ocmVsYXRpdmVUdXJuRGlyZWN0aW9uLCBpZCk7XG4gICAgdHVybihyZWxhdGl2ZVR1cm5EaXJlY3Rpb24sIGlkKTtcbiAgfSBlbHNlIGlmIChpc1JpZ2h0VHVybihjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdHVybihUdXJuRGlyZWN0aW9uLlJJR0hULCBpZCk7XG4gIH0gZWxzZSBpZiAoaXNMZWZ0VHVybihjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdHVybihUdXJuRGlyZWN0aW9uLkxFRlQsIGlkKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gaXNMZWZ0VHVybihkaXJlY3Rpb24sIG5ld0RpcmVjdGlvbikge1xuICByZXR1cm4gbmV3RGlyZWN0aW9uID09PSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGRpcmVjdGlvbiArIFR1cm5EaXJlY3Rpb24uTEVGVCk7XG59XG5cbmZ1bmN0aW9uIGlzUmlnaHRUdXJuKGRpcmVjdGlvbiwgbmV3RGlyZWN0aW9uKSB7XG4gIHJldHVybiBuZXdEaXJlY3Rpb24gPT09IHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQoZGlyZWN0aW9uICsgVHVybkRpcmVjdGlvbi5SSUdIVCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHR1cm5pbmcgZnJvbSBkaXJlY3Rpb24gdG8gbmV3RGlyZWN0aW9uIHdvdWxkIGJlIGEgMTgwwrAgdHVyblxuICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IG5ld0RpcmVjdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVHVybkFyb3VuZChkaXJlY3Rpb24sIG5ld0RpcmVjdGlvbikge1xuICByZXR1cm4gTWF0aC5hYnMoZGlyZWN0aW9uIC0gbmV3RGlyZWN0aW9uKSA9PSBNb3ZlRGlyZWN0aW9uLkJBQ0tXQVJEO1xufVxuXG5mdW5jdGlvbiBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8uY29sbGVjdEFjdGlvbnMoKTtcbiAgdHVyblRvKGRpcmVjdGlvbiwgaWQpO1xuICBtb3ZlKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xuICBNYXplLmV4ZWN1dGlvbkluZm8uc3RvcENvbGxlY3RpbmcoKTtcbn1cblxuZXhwb3J0cy5tb3ZlRm9yd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMubW92ZUJhY2t3YXJkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmUoTW92ZURpcmVjdGlvbi5CQUNLV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMubW92ZU5vcnRoID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmVBYnNvbHV0ZURpcmVjdGlvbihEaXJlY3Rpb24uTk9SVEgsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVTb3V0aCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLlNPVVRILCBpZCk7XG59KTtcblxuZXhwb3J0cy5tb3ZlRWFzdCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLkVBU1QsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVXZXN0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmVBYnNvbHV0ZURpcmVjdGlvbihEaXJlY3Rpb24uV0VTVCwgaWQpO1xufSk7XG5cbmV4cG9ydHMudHVybkxlZnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdHVybihUdXJuRGlyZWN0aW9uLkxFRlQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLnR1cm5SaWdodCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB0dXJuKFR1cm5EaXJlY3Rpb24uUklHSFQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLmlzUGF0aEZvcndhcmQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLkZPUldBUkQsIGlkKTtcbn0pO1xuZXhwb3J0cy5ub1BhdGhGb3J3YXJkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiAhaXNQYXRoKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMuaXNQYXRoUmlnaHQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLlJJR0hULCBpZCk7XG59KTtcblxuZXhwb3J0cy5pc1BhdGhCYWNrd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICByZXR1cm4gaXNQYXRoKE1vdmVEaXJlY3Rpb24uQkFDS1dBUkQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLmlzUGF0aExlZnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLkxFRlQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLnBpbGVQcmVzZW50ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgcmV0dXJuIE1hemUuZGlydF9beV1beF0gPiAwO1xufSk7XG5cbmV4cG9ydHMuaG9sZVByZXNlbnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIHggPSBNYXplLnBlZ21hblg7XG4gIHZhciB5ID0gTWF6ZS5wZWdtYW5ZO1xuICByZXR1cm4gTWF6ZS5kaXJ0X1t5XVt4XSA8IDA7XG59KTtcblxuZXhwb3J0cy5jdXJyZW50UG9zaXRpb25Ob3RDbGVhciA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB2YXIgeCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHkgPSBNYXplLnBlZ21hblk7XG4gIHJldHVybiBNYXplLmRpcnRfW3ldW3hdICE9PSAwO1xufSk7XG5cbmV4cG9ydHMuZmlsbCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ3B1dGRvd24nLCBpZCk7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5kaXJ0X1t5XVt4XSA9IE1hemUuZGlydF9beV1beF0gKyAxO1xufSk7XG5cbmV4cG9ydHMuZGlnID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbigncGlja3VwJywgaWQpO1xuICB2YXIgeCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHkgPSBNYXplLnBlZ21hblk7XG4gIE1hemUuZGlydF9beV1beF0gPSBNYXplLmRpcnRfW3ldW3hdIC0gMTtcbn0pO1xuXG5leHBvcnRzLm5vdEZpbmlzaGVkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIU1hemUuY2hlY2tTdWNjZXNzKCk7XG59KTtcblxuLy8gVGhlIGNvZGUgZm9yIHRoaXMgQVBJIHNob3VsZCBnZXQgc3RyaXBwZWQgd2hlbiBzaG93aW5nIGNvZGVcbmV4cG9ydHMubG9vcEhpZ2hsaWdodCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbiAoaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdudWxsJywgaWQpO1xufSk7XG5cblxuXG4vKipcbiAqIEJlZSByZWxhdGVkIEFQSSBmdW5jdGlvbnMuIElmIGJldHRlciBtb2R1bGFyaXplZCwgd2UgY291bGQgcG90ZW50aWFsbHlcbiAqIHNlcGFyYXRlIHRoZXNlIG91dCwgYnV0IGFzIHRoaW5ncyBzdGFuZCByaWdodCBub3cgdGhleSB3aWxsIGJlIGxvYWRlZFxuICogd2hldGhlciBvciBub3Qgd2UncmUgYSBCZWUgbGV2ZWxcbiAqL1xuZXhwb3J0cy5nZXROZWN0YXIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgTWF6ZS5iZWUuZ2V0TmVjdGFyKGlkKTtcbn0pO1xuXG5leHBvcnRzLm1ha2VIb25leSA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmJlZS5tYWtlSG9uZXkoaWQpO1xufSk7XG5cbmV4cG9ydHMuYXRGbG93ZXIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIGNvbCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHJvdyA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwiYXRfZmxvd2VyXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLmlzRmxvd2VyKHJvdywgY29sLCB0cnVlKTtcbn0pO1xuXG5leHBvcnRzLmF0SG9uZXljb21iID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHZhciBjb2wgPSBNYXplLnBlZ21hblg7XG4gIHZhciByb3cgPSBNYXplLnBlZ21hblk7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcImF0X2hvbmV5Y29tYlwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5pc0hpdmUocm93LCBjb2wsIHRydWUpO1xufSk7XG5cbmV4cG9ydHMubmVjdGFyUmVtYWluaW5nID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJuZWN0YXJfcmVtYWluaW5nXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLm5lY3RhclJlbWFpbmluZyh0cnVlKTtcbn0pO1xuXG5leHBvcnRzLmhvbmV5QXZhaWxhYmxlID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJob25leV9hdmFpbGFibGVcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUuaG9uZXlBdmFpbGFibGUoKTtcbn0pO1xuXG5leHBvcnRzLm5lY3RhckNvbGxlY3RlZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbiAoaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwibmVjdGFyX2NvbGxlY3RlZFwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5uZWN0YXJzXy5sZW5ndGg7XG59KTtcblxuZXhwb3J0cy5ob25leUNyZWF0ZWQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24gKGlkKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcImhvbmV5X2NyZWF0ZWRcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUuaG9uZXlfO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBUaWxlcyA9IG1vZHVsZS5leHBvcnRzO1xuXG4vKipcbiAqIENvbnN0YW50cyBmb3IgY2FyZGluYWwgZGlyZWN0aW9ucy4gIFN1YnNlcXVlbnQgY29kZSBhc3N1bWVzIHRoZXNlIGFyZVxuICogaW4gdGhlIHJhbmdlIDAuLjMgYW5kIHRoYXQgb3Bwb3NpdGVzIGhhdmUgYW4gYWJzb2x1dGUgZGlmZmVyZW5jZSBvZiAyLlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuVGlsZXMuRGlyZWN0aW9uID0ge1xuICBOT1JUSDogMCxcbiAgRUFTVDogMSxcbiAgU09VVEg6IDIsXG4gIFdFU1Q6IDNcbn07XG5cbi8qKlxuICogVGhlIHR5cGVzIG9mIHNxdWFyZXMgaW4gdGhlIE1hemUsIHdoaWNoIGlzIHJlcHJlc2VudGVkXG4gKiBhcyBhIDJEIGFycmF5IG9mIFNxdWFyZVR5cGUgdmFsdWVzLlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuVGlsZXMuU3F1YXJlVHlwZSA9IHtcbiAgV0FMTDogMCxcbiAgT1BFTjogMSxcbiAgU1RBUlQ6IDIsXG4gIEZJTklTSDogMyxcbiAgT0JTVEFDTEU6IDQsXG4gIFNUQVJUQU5ERklOSVNIOiA1XG59O1xuXG5UaWxlcy5UdXJuRGlyZWN0aW9uID0geyBMRUZUOiAtMSwgUklHSFQ6IDF9O1xuVGlsZXMuTW92ZURpcmVjdGlvbiA9IHsgRk9SV0FSRDogMCwgUklHSFQ6IDEsIEJBQ0tXQVJEOiAyLCBMRUZUOiAzfTtcblxuVGlsZXMuZGlyZWN0aW9uVG9EeER5ID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgY2FzZSBUaWxlcy5EaXJlY3Rpb24uTk9SVEg6XG4gICAgICByZXR1cm4ge2R4OiAwLCBkeTogLTF9O1xuICAgIGNhc2UgVGlsZXMuRGlyZWN0aW9uLkVBU1Q6XG4gICAgICByZXR1cm4ge2R4OiAxLCBkeTogMH07XG4gICAgY2FzZSBUaWxlcy5EaXJlY3Rpb24uU09VVEg6XG4gICAgICByZXR1cm4ge2R4OiAwLCBkeTogMX07XG4gICAgY2FzZSBUaWxlcy5EaXJlY3Rpb24uV0VTVDpcbiAgICAgIHJldHVybiB7ZHg6IC0xLCBkeTogMH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRpcmVjdGlvbiB2YWx1ZScgKyBkaXJlY3Rpb24pO1xufTtcblxuVGlsZXMuZGlyZWN0aW9uVG9GcmFtZSA9IGZ1bmN0aW9uKGRpcmVjdGlvbjQpIHtcbiAgcmV0dXJuIHV0aWxzLm1vZChkaXJlY3Rpb240ICogNCwgMTYpO1xufTtcblxuLyoqXG4gKiBLZWVwIHRoZSBkaXJlY3Rpb24gd2l0aGluIDAtMywgd3JhcHBpbmcgYXQgYm90aCBlbmRzLlxuICogQHBhcmFtIHtudW1iZXJ9IGQgUG90ZW50aWFsbHkgb3V0LW9mLWJvdW5kcyBkaXJlY3Rpb24gdmFsdWUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IExlZ2FsIGRpcmVjdGlvbiB2YWx1ZS5cbiAqL1xuVGlsZXMuY29uc3RyYWluRGlyZWN0aW9uNCA9IGZ1bmN0aW9uKGQpIHtcbiAgcmV0dXJuIHV0aWxzLm1vZChkLCA0KTtcbn07XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIG1hemVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIENlbGwgPSByZXF1aXJlKCcuL2JlZUNlbGwnKTtcbnZhciBUZXN0UmVzdWx0cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy5qcycpLlRlc3RSZXN1bHRzO1xudmFyIFRlcm1pbmF0aW9uVmFsdWUgPSByZXF1aXJlKCcuLi9jb25zdGFudHMuanMnKS5CZWVUZXJtaW5hdGlvblZhbHVlO1xuXG52YXIgVU5MSU1JVEVEX0hPTkVZID0gLTk5O1xudmFyIFVOTElNSVRFRF9ORUNUQVIgPSA5OTtcblxudmFyIEVNUFRZX0hPTkVZID0gLTk4OyAvLyBIaXZlIHdpdGggMCBob25leVxudmFyIEVNUFRZX05FQ1RBUiA9IDk4OyAvLyBmbG93ZXIgd2l0aCAwIGhvbmV5XG5cbnZhciBCZWUgPSBmdW5jdGlvbiAobWF6ZSwgc3R1ZGlvQXBwLCBjb25maWcpIHtcbiAgdGhpcy5tYXplXyA9IG1hemU7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5za2luXyA9IGNvbmZpZy5za2luO1xuICB0aGlzLmRlZmF1bHRGbG93ZXJDb2xvcl8gPSAoY29uZmlnLmxldmVsLmZsb3dlclR5cGUgPT09ICdyZWRXaXRoTmVjdGFyJyA/XG4gICAgJ3JlZCcgOiAncHVycGxlJyk7XG4gIGlmICh0aGlzLmRlZmF1bHRGbG93ZXJDb2xvcl8gPT09ICdwdXJwbGUnICYmXG4gICAgY29uZmlnLmxldmVsLmZsb3dlclR5cGUgIT09ICdwdXJwbGVOZWN0YXJIaWRkZW4nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgZmxvd2VyVHlwZSBmb3IgQmVlOiAnICsgY29uZmlnLmxldmVsLmZsb3dlclR5cGUpO1xuICB9XG5cbiAgdGhpcy5uZWN0YXJHb2FsXyA9IGNvbmZpZy5sZXZlbC5uZWN0YXJHb2FsIHx8IDA7XG4gIHRoaXMuaG9uZXlHb2FsXyA9IGNvbmZpZy5sZXZlbC5ob25leUdvYWwgfHwgMDtcblxuICAvLyBhdCBlYWNoIGxvY2F0aW9uLCB0cmFja3Mgd2hldGhlciB1c2VyIGNoZWNrZWQgdG8gc2VlIGlmIGl0IHdhcyBhIGZsb3dlciBvclxuICAvLyBob25leWNvbWIgdXNpbmcgYW4gaWYgYmxvY2tcbiAgdGhpcy51c2VyQ2hlY2tzXyA9IFtdO1xuXG4gIC8vIFRoZSBcInJhdyBkaXJ0XCIgcmVwcmVzZW50cyB0aGUgcmF3IHZhbHVlcyBhcyBlbnRlcmVkIGludG8gdGhlXG4gIC8vIGxldmVsYnVpbGRlciBVSS4gVGhleSBhcmUgYSBncmlkIG9mIGVpdGhlciBpbnRlZ2VycyBvciBzdHJpbmdzLFxuICAvLyBhbmQgY2FuIHJlcHJlc2VudCBcInZhcmlhYmxlXCIgdmFsdWVzLCB3aGljaCBtZWFucyBhbnkgZ2l2ZW4gY2VsbCBjYW5cbiAgLy8gdGhlb3JldGljYWxseSBjb250YWluIG9uZSBvZiBhIHZhcmlldHkgb2Ygb2JqZWN0cy5cbiAgLy9cbiAgLy8gV2UgcGFyc2UgdGhlIHN0cmluZ3MgaW50byBvYmplY3RzLCB0aGVuIHR1cm4gdGhlIFwidmFyaWFibGVcIiBncmlkXG4gIC8vIGludG8gYSBsaXN0IG9mIFwic3RhdGljXCIgZ3JpZHMsIHJlcHJlc2VudGluZyBhbGwgdGhlIHBvc3NpYmxlXG4gIC8vIGNvbWJpbmF0aW9ucyBvZiBvYmplY3RzLlxuICAvL1xuICAvLyBXZSBhbHNvIGluaXRpYWxpemUgYSBcInZhbHVlc1wiIGdyaWQsIHdoaWNoIGZvciBvYmplY3RzIHRoYXQgaGF2ZVxuICAvLyB2YWx1ZXMgKGhpdmVzIGFuZCBmbG93ZXJzKSBrZWVwcyB0cmFjayBvZiB0aGVpciBjdXJyZW50IHN0YXRlLlxuICB2YXIgcmF3RGlydF8gPSBjb25maWcubGV2ZWwucmF3RGlydDtcbiAgdmFyIHZhcmlhYmxlR3JpZCA9IHJhd0RpcnRfLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoQ2VsbC5wYXJzZSk7XG4gIH0pO1xuICB0aGlzLnN0YXRpY0dyaWRzID0gQmVlLmdldEFsbFN0YXRpY0dyaWRzKHZhcmlhYmxlR3JpZCk7XG5cbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZElkID0gMDtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZCA9IHRoaXMuc3RhdGljR3JpZHNbMF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJlZTtcblxuLyoqXG4gKiBDbG9uZXMgdGhlIGdpdmVuIGdyaWQgb2YgQmVlQ2VsbHMgYnkgY2FsbGluZyBCZWVDZWxsLmNsb25lXG4gKiBAcGFyYW0ge0JlZUNlbGxbXVtdfSBncmlkXG4gKiBAcmV0dXJuIHtCZWVDZWxsW11bXX0gZ3JpZFxuICovXG5CZWUuY2xvbmVHcmlkID0gZnVuY3Rpb24gKGdyaWQpIHtcbiAgcmV0dXJuIGdyaWQubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgcmV0dXJuIGNlbGwuY2xvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgc2luZ2xlIGdyaWQgb2YgQmVlQ2VsbHMsIHNvbWUgb2Ygd2hpY2ggbWF5IGJlIFwidmFyaWFibGVcIlxuICogY2VsbHMsIHJldHVybiBhIGxpc3Qgb2YgZ3JpZHMgb2Ygbm9uLXZhcmlhYmxlIEJlZUNlbGxzIHJlcHJlc2VudGluZ1xuICogYWxsIHBvc3NpYmxlIHZhcmlhYmxlIGNvbWJpbmF0aW9ucy5cbiAqIEBwYXJhbSB7QmVlQ2VsbFtdW119IHZhcmlhYmxlR3JpZFxuICogQHJldHVybiB7QmVlQ2VsbFtdW11bXX0gZ3JpZHNcbiAqL1xuQmVlLmdldEFsbFN0YXRpY0dyaWRzID0gZnVuY3Rpb24gKHZhcmlhYmxlR3JpZCkge1xuICB2YXIgZ3JpZHMgPSBbIHZhcmlhYmxlR3JpZCBdO1xuICB2YXJpYWJsZUdyaWQuZm9yRWFjaChmdW5jdGlvbiAocm93LCB4KSB7XG4gICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIHkpIHtcbiAgICAgIGlmIChjZWxsLmlzVmFyaWFibGVDbG91ZCgpKSB7XG4gICAgICAgIHZhciBwb3NzaWJsZUFzc2V0cyA9IGNlbGwuZ2V0UG9zc2libGVHcmlkQXNzZXRzKCk7XG4gICAgICAgIHZhciBuZXdHcmlkcyA9IFtdO1xuICAgICAgICBwb3NzaWJsZUFzc2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGFzc2V0KSB7XG4gICAgICAgICAgZ3JpZHMuZm9yRWFjaChmdW5jdGlvbihncmlkKSB7XG4gICAgICAgICAgICB2YXIgbmV3TWFwID0gQmVlLmNsb25lR3JpZChncmlkKTtcbiAgICAgICAgICAgIG5ld01hcFt4XVt5XSA9IGFzc2V0O1xuICAgICAgICAgICAgbmV3R3JpZHMucHVzaChuZXdNYXApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JpZHMgPSBuZXdHcmlkcztcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBncmlkcztcbn07XG5cbi8qKlxuICogU2ltcGxlIHBhc3N0aHJvdWdoIHRoYXQgY2FsbHMgcmVzZXRDdXJybnRWYWx1ZSBmb3IgZXZlcnkgQmVlQ2VsbCBpblxuICogdGhpcy5jdXJyZW50U3RhdGljR3JpZFxuICovXG5CZWUucHJvdG90eXBlLnJlc2V0Q3VycmVudFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZC5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgY2VsbC5yZXNldEN1cnJlbnRWYWx1ZSgpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVzZXRzIGN1cnJlbnQgc3RhdGUsIGZvciBlYXN5IHJlZXhlY3V0aW9uIG9mIHRlc3RzXG4gKi9cbkJlZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuaG9uZXlfID0gMDtcbiAgLy8gbGlzdCBvZiB0aGUgbG9jYXRpb25zIHdlJ3ZlIGdyYWJiZWQgbmVjdGFyIGZyb21cbiAgdGhpcy5uZWN0YXJzXyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY3VycmVudFN0YXRpY0dyaWQubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnVzZXJDaGVja3NfW2ldID0gW107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aGlzLnVzZXJDaGVja3NfW2ldW2pdID0ge1xuICAgICAgICBjaGVja2VkRm9yRmxvd2VyOiBmYWxzZSxcbiAgICAgICAgY2hlY2tlZEZvckhpdmU6IGZhbHNlLFxuICAgICAgICBjaGVja2VkRm9yTmVjdGFyOiBmYWxzZVxuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIpIHtcbiAgICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZU5lY3RhckNvdW50ZXIodGhpcy5uZWN0YXJzXyk7XG4gICAgdGhpcy5tYXplXy5ncmlkSXRlbURyYXdlci51cGRhdGVIb25leUNvdW50ZXIodGhpcy5ob25leV8pO1xuICB9XG4gIHRoaXMucmVzZXRDdXJyZW50VmFsdWVzKCk7XG59O1xuXG4vKipcbiAqIEFzc2lnbnMgdGhpcy5jdXJyZW50U3RhdGljR3JpZCB0byB0aGUgYXBwcm9wcmlhdGUgZ3JpZCBhbmQgcmVzZXRzIGFsbFxuICogY3VycmVudCB2YWx1ZXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICovXG5CZWUucHJvdG90eXBlLnVzZUdyaWRXaXRoSWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZElkID0gaWQ7XG4gIHRoaXMuY3VycmVudFN0YXRpY0dyaWQgPSB0aGlzLnN0YXRpY0dyaWRzW2lkXTtcbiAgdGhpcy5yZXNldEN1cnJlbnRWYWx1ZXMoKTtcbiAgdGhpcy5yZXNldCgpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge051bWJlcn0gcm93XG4gKiBAcGFyYW0ge051bWJlcn0gY29sXG4gKiBAcmV0dXJucyB7TnVtYmVyfSB2YWxcbiAqL1xuQmVlLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uZ2V0Q3VycmVudFZhbHVlKCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2xcbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWxcbiAqL1xuQmVlLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsKSB7XG4gIHRoaXMuY3VycmVudFN0YXRpY0dyaWRbcm93XVtjb2xdLnNldEN1cnJlbnRWYWx1ZSh2YWwpO1xufTtcblxuLyoqXG4gKiBEaWQgd2UgcmVhY2ggb3VyIHRvdGFsIG5lY3Rhci9ob25leSBnb2FscywgYW5kIGFjY29tcGxpc2ggYW55IHNwZWNpZmljXG4gKiBoaXZlR29hbHM/XG4gKi9cbkJlZS5wcm90b3R5cGUuZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIG5lY3Rhci9ob25leSBnb2Fsc1xuICBpZiAodGhpcy5ob25leV8gPCB0aGlzLmhvbmV5R29hbF8gfHwgdGhpcy5uZWN0YXJzXy5sZW5ndGggPCB0aGlzLm5lY3RhckdvYWxfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF0aGlzLmNoZWNrZWRBbGxDbG91ZGVkKCkgfHwgIXRoaXMuY2hlY2tlZEFsbFB1cnBsZSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIENhbGxlZCBhZnRlciB1c2VyJ3MgY29kZSBoYXMgZmluaXNoZWQgZXhlY3V0aW5nLiBHaXZlcyB1cyBhIGNoYW5jZSB0b1xuICogdGVybWluYXRlIHdpdGggYXBwLXNwZWNpZmljIHZhbHVlcywgc3VjaCBhcyB1bmNoZWNrZWQgY2xvdWQvcHVycGxlIGZsb3dlcnMuXG4gKi9cbkJlZS5wcm90b3R5cGUub25FeGVjdXRpb25GaW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBleGVjdXRpb25JbmZvID0gdGhpcy5tYXplXy5leGVjdXRpb25JbmZvO1xuICBpZiAoZXhlY3V0aW9uSW5mby5pc1Rlcm1pbmF0ZWQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5maW5pc2hlZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gd2UgZGlkbid0IGZpbmlzaC4gbG9vayB0byBzZWUgaWYgd2UgbmVlZCB0byBnaXZlIGFuIGFwcCBzcGVjaWZpYyBlcnJvclxuICBpZiAodGhpcy5uZWN0YXJzXy5sZW5ndGggPCB0aGlzLm5lY3RhckdvYWxfKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfTkVDVEFSKTtcbiAgfSBlbHNlIGlmICh0aGlzLmhvbmV5XyA8IHRoaXMuaG9uZXlHb2FsXykge1xuICAgIGV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX0hPTkVZKTtcbiAgfSBlbHNlICBpZiAoIXRoaXMuY2hlY2tlZEFsbENsb3VkZWQoKSkge1xuICAgIGV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX0NMT1VEKTtcbiAgfSBlbHNlIGlmICghdGhpcy5jaGVja2VkQWxsUHVycGxlKCkpIHtcbiAgICBleGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLlVOQ0hFQ0tFRF9QVVJQTEUpO1xuICB9XG59O1xuXG4vKipcbiAqIERpZCB3ZSBjaGVjayBldmVyeSBmbG93ZXIvaG9uZXkgdGhhdCB3YXMgY292ZXJlZCBieSBhIGNsb3VkP1xuICovXG5CZWUucHJvdG90eXBlLmNoZWNrZWRBbGxDbG91ZGVkID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkLmxlbmd0aDsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgaWYgKHRoaXMuaXNDbG91ZGFibGUocm93LCBjb2wpICYmICF0aGlzLmNoZWNrZWRDbG91ZChyb3csIGNvbCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogRGlkIHdlIGNoZWNrIGV2ZXJ5IHB1cnBsZSBmbG93ZXJcbiAqL1xuQmVlLnByb3RvdHlwZS5jaGVja2VkQWxsUHVycGxlID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkLmxlbmd0aDsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgaWYgKHRoaXMuaXNQdXJwbGVGbG93ZXIocm93LCBjb2wpICYmICF0aGlzLnVzZXJDaGVja3NfW3Jvd11bY29sXS5jaGVja2VkRm9yTmVjdGFyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdGVzdCByZXN1bHRzIGJhc2VkIG9uIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZS4gIElmIHRoZXJlIGlzXG4gKiBubyBhcHAtc3BlY2lmaWMgZmFpbHVyZSwgdGhpcyByZXR1cm5zIFN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cygpLlxuICovXG5CZWUucHJvdG90eXBlLmdldFRlc3RSZXN1bHRzID0gZnVuY3Rpb24gKHRlcm1pbmF0aW9uVmFsdWUpIHtcbiAgc3dpdGNoICh0ZXJtaW5hdGlvblZhbHVlKSB7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9GTE9XRVI6XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkZMT1dFUl9FTVBUWTpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0hPTkVZQ09NQjpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSE9ORVlDT01CX0ZVTEw6XG4gICAgICByZXR1cm4gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG5cbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX0NMT1VEOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfUFVSUExFOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfTkVDVEFSOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfSE9ORVk6XG4gICAgICB2YXIgdGVzdFJlc3VsdHMgPSB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHModHJ1ZSk7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgbm9uLWFwcCBzcGVjaWZpYyBmYWlsdXJlLCB3ZSB3YW50IHRoYXQgdG8gdGFrZSBwcmVjZWRlbmNlLlxuICAgICAgLy8gVmFsdWVzIG92ZXIgVE9PX01BTllfQkxPQ0tTX0ZBSUwgYXJlIG5vdCB0cnVlIGZhaWx1cmVzLCBidXQgaW5kaWNhdGVcbiAgICAgIC8vIGEgc3Vib3B0aW1hbCBzb2x1dGlvbiwgc28gaW4gdGhvc2UgY2FzZXMgd2Ugd2FudCB0byByZXR1cm4gb3VyXG4gICAgICAvLyBhcHAgc3BlY2lmaWMgZmFpbFxuICAgICAgaWYgKHRlc3RSZXN1bHRzID49IFRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMKSB7XG4gICAgICAgIHRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVzdFJlc3VsdHM7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKGZhbHNlKTtcbn07XG5cbi8qKlxuICogR2V0IGFueSBhcHAtc3BlY2lmaWMgbWVzc2FnZSwgYmFzZWQgb24gdGhlIHRlcm1pbmF0aW9uIHZhbHVlLFxuICogb3IgcmV0dXJuIG51bGwgaWYgbm9uZSBhcHBsaWVzLlxuICovXG5CZWUucHJvdG90eXBlLmdldE1lc3NhZ2UgPSBmdW5jdGlvbiAodGVybWluYXRpb25WYWx1ZSkge1xuICBzd2l0Y2ggKHRlcm1pbmF0aW9uVmFsdWUpIHtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0ZMT1dFUjpcbiAgICAgIHJldHVybiBtYXplTXNnLm5vdEF0Rmxvd2VyRXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuRkxPV0VSX0VNUFRZOlxuICAgICAgcmV0dXJuIG1hemVNc2cuZmxvd2VyRW1wdHlFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5OT1RfQVRfSE9ORVlDT01COlxuICAgICAgcmV0dXJuIG1hemVNc2cubm90QXRIb25leWNvbWJFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5IT05FWUNPTUJfRlVMTDpcbiAgICAgIHJldHVybiBtYXplTXNnLmhvbmV5Y29tYkZ1bGxFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfQ0xPVUQ6XG4gICAgICByZXR1cm4gbWF6ZU1zZy51bmNoZWNrZWRDbG91ZEVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLlVOQ0hFQ0tFRF9QVVJQTEU6XG4gICAgICByZXR1cm4gbWF6ZU1zZy51bmNoZWNrZWRQdXJwbGVFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfTkVDVEFSOlxuICAgICAgcmV0dXJuIG1hemVNc2cuaW5zdWZmaWNpZW50TmVjdGFyKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLklOU1VGRklDSUVOVF9IT05FWTpcbiAgICAgIHJldHVybiBtYXplTXNnLmluc3VmZmljaWVudEhvbmV5KCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlckNoZWNrIElzIHRoaXMgYmVpbmcgY2FsbGVkIGZyb20gdXNlciBjb2RlXG4gKi9cbkJlZS5wcm90b3R5cGUuaXNIaXZlID0gZnVuY3Rpb24gKHJvdywgY29sLCB1c2VyQ2hlY2spIHtcbiAgdXNlckNoZWNrID0gdXNlckNoZWNrIHx8IGZhbHNlO1xuICBpZiAodXNlckNoZWNrKSB7XG4gICAgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckhpdmUgPSB0cnVlO1xuICB9XG4gIHZhciBjZWxsID0gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF07XG4gIHJldHVybiBjZWxsLmlzSGl2ZSgpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVzZXJDaGVjayBJcyB0aGlzIGJlaW5nIGNhbGxlZCBmcm9tIHVzZXIgY29kZVxuICovXG5CZWUucHJvdG90eXBlLmlzRmxvd2VyID0gZnVuY3Rpb24gKHJvdywgY29sLCB1c2VyQ2hlY2spIHtcbiAgdXNlckNoZWNrID0gdXNlckNoZWNrIHx8IGZhbHNlO1xuICBpZiAodXNlckNoZWNrKSB7XG4gICAgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckZsb3dlciA9IHRydWU7XG4gIH1cbiAgdmFyIGNlbGwgPSB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXTtcbiAgcmV0dXJuIGNlbGwuaXNGbG93ZXIoKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGNlbGwgc2hvdWxkIGJlIGNsb3ZlcmVkIGJ5IGEgY2xvdWQgd2hpbGUgcnVubmluZ1xuICovXG5CZWUucHJvdG90eXBlLmlzQ2xvdWRhYmxlID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXS5pc1N0YXRpY0Nsb3VkKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBjZWxsIGhhcyBiZWVuIGNoZWNrZWQgZm9yIGVpdGhlciBhIGZsb3dlciBvciBhIGhpdmVcbiAqL1xuQmVlLnByb3RvdHlwZS5jaGVja2VkQ2xvdWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMudXNlckNoZWNrc19bcm93XVtjb2xdLmNoZWNrZWRGb3JGbG93ZXIgfHwgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckhpdmU7XG59O1xuXG4vKipcbiAqIEZsb3dlcnMgYXJlIGVpdGhlciByZWQgb3IgcHVycGxlLiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiBhIGZsb3dlciBpcyByZWQuXG4gKi9cbkJlZS5wcm90b3R5cGUuaXNSZWRGbG93ZXIgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKCF0aGlzLmlzRmxvd2VyKHJvdywgY29sLCBmYWxzZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB0aGUgZmxvd2VyIGhhcyBiZWVuIG92ZXJyaWRkZW4gdG8gYmUgcmVkLCByZXR1cm4gdHJ1ZS5cbiAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgZmxvd2VyIGhhcyBiZWVuIG92ZXJyaWRkZW4gdG8gYmUgcHVycGxlLCByZXR1cm5cbiAgLy8gZmFsc2UuIElmIG5laXRoZXIgb2YgdGhvc2UgYXJlIHRydWUsIHRoZW4gdGhlIGZsb3dlciBpcyB3aGF0ZXZlclxuICAvLyB0aGUgZGVmYXVsdCBmbG93ZXIgY29sb3IgaXMuXG4gIGlmICh0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXS5pc1JlZEZsb3dlcigpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uaXNQdXJwbGVGbG93ZXIoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0Rmxvd2VyQ29sb3JfID09PSAncmVkJztcbiAgfVxufTtcblxuLyoqXG4gKiBSb3csIGNvbCBjb250YWlucyBhIGZsb3dlciB0aGF0IGlzIHB1cnBsZVxuICovXG5CZWUucHJvdG90eXBlLmlzUHVycGxlRmxvd2VyID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmlzRmxvd2VyKHJvdywgY29sLCBmYWxzZSkgJiYgIXRoaXMuaXNSZWRGbG93ZXIocm93LCBjb2wpO1xufTtcblxuLyoqXG4gKiBTZWUgaXNIaXZlIGNvbW1lbnQuXG4gKi9cbkJlZS5wcm90b3R5cGUuaGl2ZUdvYWwgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgdmFyIHZhbCA9IHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpO1xuICBpZiAodmFsID49IC0xKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICByZXR1cm4gTWF0aC5hYnModmFsKSAtIDE7XG59O1xuXG5cbi8qKlxuICogSG93IG11Y2ggbW9yZSBob25leSBjYW4gdGhlIGhpdmUgYXQgKHJvdywgY29sKSBwcm9kdWNlIGJlZm9yZSBpdCBoaXRzIHRoZSBnb2FsXG4gKi9cbkJlZS5wcm90b3R5cGUuaGl2ZVJlbWFpbmluZ0NhcGFjaXR5ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIGlmICghdGhpcy5pc0hpdmUocm93LCBjb2wpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgdmFsID0gdGhpcy5nZXRWYWx1ZShyb3csIGNvbCk7XG4gIGlmICh2YWwgPT09IFVOTElNSVRFRF9IT05FWSkge1xuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuICBpZiAodmFsID09PSBFTVBUWV9IT05FWSkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiAtdmFsO1xufTtcblxuLyoqXG4gKiBIb3cgbXVjaCBtb3JlIG5lY3RhciBjYW4gYmUgY29sbGVjdGVkIGZyb20gdGhlIGZsb3dlciBhdCAocm93LCBjb2wpXG4gKi9cbkJlZS5wcm90b3R5cGUuZmxvd2VyUmVtYWluaW5nQ2FwYWNpdHkgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgdmFyIHZhbCA9IHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpO1xuICBpZiAodmFsIDwgMCkge1xuICAgIC8vIG5vdCBhIGZsb3dlclxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gVU5MSU1JVEVEX05FQ1RBUikge1xuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuICBpZiAodmFsID09PSBFTVBUWV9ORUNUQVIpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbW9kZWwgdG8gcmVwcmVzZW50IG1hZGUgaG9uZXkuICBEb2VzIG5vIHZhbGlkYXRpb25cbiAqL1xuQmVlLnByb3RvdHlwZS5tYWRlSG9uZXlBdCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICBpZiAodGhpcy5nZXRWYWx1ZShyb3csIGNvbCkgIT09IFVOTElNSVRFRF9IT05FWSkge1xuICAgIHRoaXMuc2V0VmFsdWUocm93LCBjb2wsIHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpICsgMSk7XG4gIH1cblxuICB0aGlzLmhvbmV5XyArPSAxO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbW9kZWwgdG8gcmVwcmVzZW50IGdhdGhlcmVkIG5lY3Rhci4gRG9lcyBubyB2YWxpZGF0aW9uXG4gKi9cbkJlZS5wcm90b3R5cGUuZ290TmVjdGFyQXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpICE9PSBVTkxJTUlURURfTkVDVEFSKSB7XG4gICAgdGhpcy5zZXRWYWx1ZShyb3csIGNvbCwgdGhpcy5nZXRWYWx1ZShyb3csIGNvbCkgLSAxKTtcbiAgfVxuXG4gIHRoaXMubmVjdGFyc18ucHVzaCh7cm93OiByb3csIGNvbDogY29sfSk7XG59O1xuXG4vLyBBUElcblxuQmVlLnByb3RvdHlwZS5nZXROZWN0YXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICAvLyBNYWtlIHN1cmUgd2UncmUgYXQgYSBmbG93ZXIuXG4gIGlmICghdGhpcy5pc0Zsb3dlcihyb3csIGNvbCkpIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0ZMT1dFUik7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIE5lY3RhciBpcyBwb3NpdGl2ZS4gIE1ha2Ugc3VyZSB3ZSBoYXZlIGl0LlxuICBpZiAodGhpcy5mbG93ZXJSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCkgPT09IDApIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuRkxPV0VSX0VNUFRZKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ25lY3RhcicsIGlkKTtcbiAgdGhpcy5nb3ROZWN0YXJBdChyb3csIGNvbCk7XG59O1xuXG4vLyBOb3RlIHRoYXQgdGhpcyBkZWxpYmVyYXRlbHkgZG9lcyBub3QgY2hlY2sgd2hldGhlciBiZWUgaGFzIGdhdGhlcmVkIG5lY3Rhci5cbkJlZS5wcm90b3R5cGUubWFrZUhvbmV5ID0gZnVuY3Rpb24gKGlkKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgaWYgKCF0aGlzLmlzSGl2ZShyb3csIGNvbCkpIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0hPTkVZQ09NQik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLmhpdmVSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCkgPT09IDApIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuSE9ORVlDT01CX0ZVTEwpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMubWF6ZV8uZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignaG9uZXknLCBpZCk7XG4gIHRoaXMubWFkZUhvbmV5QXQocm93LCBjb2wpO1xufTtcblxuQmVlLnByb3RvdHlwZS5uZWN0YXJSZW1haW5pbmcgPSBmdW5jdGlvbiAodXNlckNoZWNrKSB7XG4gIHVzZXJDaGVjayA9IHVzZXJDaGVjayB8fCBmYWxzZTtcblxuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIGlmICh1c2VyQ2hlY2spIHtcbiAgICB0aGlzLnVzZXJDaGVja3NfW3Jvd11bY29sXS5jaGVja2VkRm9yTmVjdGFyID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZsb3dlclJlbWFpbmluZ0NhcGFjaXR5KHJvdywgY29sKTtcbn07XG5cbkJlZS5wcm90b3R5cGUuaG9uZXlBdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgcmV0dXJuIHRoaXMuaGl2ZVJlbWFpbmluZ0NhcGFjaXR5KHJvdywgY29sKTtcbn07XG5cbi8vIEFOSU1BVElPTlNcbkJlZS5wcm90b3R5cGUucGxheUF1ZGlvXyA9IGZ1bmN0aW9uIChzb3VuZCkge1xuICAvLyBDaGVjayBmb3IgU3R1ZGlvQXBwLCB3aGljaCB3aWxsIG9mdGVuIGJlIHVuZGVmaW5lZCBpbiB1bml0IHRlc3RzXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKHNvdW5kKTtcbiAgfVxufTtcblxuQmVlLnByb3RvdHlwZS5hbmltYXRlR2V0TmVjdGFyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIGlmICh0aGlzLmdldFZhbHVlKHJvdywgY29sKSA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU2hvdWxkbid0IGJlIGFibGUgdG8gZW5kIHVwIHdpdGggYSBuZWN0YXIgYW5pbWF0aW9uIGlmIFwiICtcbiAgICAgIFwidGhlcmUgd2FzIG5vIG5lY3RhciB0byBiZSBoYWRcIik7XG4gIH1cblxuICB0aGlzLnBsYXlBdWRpb18oJ25lY3RhcicpO1xuICB0aGlzLmdvdE5lY3RhckF0KHJvdywgY29sKTtcblxuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgdHJ1ZSk7XG4gIHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlTmVjdGFyQ291bnRlcih0aGlzLm5lY3RhcnNfKTtcbn07XG5cbkJlZS5wcm90b3R5cGUuYW5pbWF0ZU1ha2VIb25leSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICBpZiAoIXRoaXMuaXNIaXZlKHJvdywgY29sKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNob3VsZG4ndCBiZSBhYmxlIHRvIGVuZCB1cCB3aXRoIGEgaG9uZXkgYW5pbWF0aW9uIGlmIFwiICtcbiAgICAgIFwid2UgYXJlbnQgYXQgYSBoaXZlIG9yIGRvbnQgaGF2ZSBuZWN0YXJcIik7XG4gIH1cblxuICB0aGlzLnBsYXlBdWRpb18oJ2hvbmV5Jyk7XG4gIHRoaXMubWFkZUhvbmV5QXQocm93LCBjb2wpO1xuXG4gIHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlSXRlbUltYWdlKHJvdywgY29sLCB0cnVlKTtcblxuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUhvbmV5Q291bnRlcih0aGlzLmhvbmV5Xyk7XG59O1xuIiwiLy8gbG9jYWxlIGZvciBtYXplXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5Lm1hemVfbG9jYWxlO1xuIiwiLyoqXG4gKiBAb3ZlcnZpZXcgQmVlQ2VsbCByZXByZXNlbnRzIHRoZSBjb250ZXRzIG9mIHRoZSBncmlkIGVsZW1lbnRzIGZvciBCZWUuXG4gKiBCZWUgQmVlQ2VsbHMgYXJlIG1vcmUgY29tcGxleCB0aGFuIG1hbnkgb3RoZXIga2luZHMgb2YgY2VsbDsgdGhleSBjYW4gYmVcbiAqIFwiaGlkZGVuXCIgd2l0aCBjbG91ZHMsIHRoZXkgY2FuIHJlcHJlc2VudCBtdWx0aXBsZSBkaWZmZXJlbnQga2luZHMgb2ZcbiAqIGVsZW1lbnQgKGZsb3dlciwgaGl2ZSksIHNvbWUgb2Ygd2hpY2ggY2FuIGJlIG11bHRpcGxlIGNvbG9ycyAocmVkLFxuICogcHVycGxlKSwgYW5kIHdoaWNoIGNhbiBoYXZlIGEgcmFuZ2Ugb2YgcG9zc2libGUgdmFsdWVzLlxuICpcbiAqIFNvbWUgY2VsbHMgY2FuIGFsc28gYmUgXCJ2YXJpYWJsZVwiLCBtZWFuaW5nIHRoYXQgdGhlaXIgY29udGVudHMgYXJlXG4gKiBub3Qgc3RhdGljIGJ1dCBjYW4gaW4gZmFjdCBiZSByYW5kb21pemVkIGJldHdlZW4gcnVucy5cbiAqL1xuXG4vLyBGQyBpcyBzaG9ydCBmb3IgRmxvd2VyQ29tYiwgd2hpY2ggd2Ugd2VyZSBvcmlnaW5hbGx5IHVzaW5nIGluc3RlYWQgb2YgY2xvdWRcbnZhciBDTE9VRCA9IHtcbiAgU1RBVElDOiAnRkMnLFxuICBWQVJJQUJMRTogJ0MnLFxuICBBTlk6ICdDYW55J1xufTtcbnZhciBGTE9XRVIgPSB7XG4gIFJFRDogJ1InLFxuICBQVVJQTEU6ICdQJ1xufTtcbnZhciBQUkVGSVggPSB7XG4gIEZMT1dFUjogJysnLFxuICBISVZFOiAnLSdcbn07XG5cbnZhciBCZWVDZWxsID0gZnVuY3Rpb24gKHZhbHVlLCBjbG91ZGVkLCBwcmVmaXgsIGNvbG9yKSB7XG4gIC8qKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgdGhpcy5jbG91ZGVkXyA9IGNsb3VkZWQ7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICB0aGlzLnByZWZpeF8gPSBwcmVmaXg7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICB0aGlzLmNvbG9yXyA9IGNvbG9yO1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhpcy5vcmlnaW5hbFZhbHVlXyA9IHZhbHVlO1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhpcy5jdXJyZW50VmFsdWVfID0gdW5kZWZpbmVkO1xuICB0aGlzLnJlc2V0Q3VycmVudFZhbHVlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJlZUNlbGw7XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBCZWVDZWxsIHRoYXQncyBhbiBleGFjdCByZXBsaWNhIG9mIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtCZWVDZWxsfVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5ld0JlZUNlbGwgPSBuZXcgQmVlQ2VsbCh0aGlzLm9yaWdpbmFsVmFsdWVfLCB0aGlzLmNsb3VkZWRfLCB0aGlzLnByZWZpeF8sIHRoaXMuY29sb3JfKTtcbiAgbmV3QmVlQ2VsbC5zZXRDdXJyZW50VmFsdWUodGhpcy5jdXJyZW50VmFsdWVfKTtcbiAgcmV0dXJuIG5ld0JlZUNlbGw7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuZ2V0Q3VycmVudFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50VmFsdWVfO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge051bWJlcn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuc2V0Q3VycmVudFZhbHVlID0gZnVuY3Rpb24gKHZhbCkge1xuICB0aGlzLmN1cnJlbnRWYWx1ZV8gPSB2YWw7XG59O1xuXG5CZWVDZWxsLnByb3RvdHlwZS5yZXNldEN1cnJlbnRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMucHJlZml4Xykge1xuICAgIHRoaXMuY3VycmVudFZhbHVlXyA9IHBhcnNlSW50KHRoaXMucHJlZml4XyArIHRoaXMub3JpZ2luYWxWYWx1ZV8pO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuY3VycmVudFZhbHVlXyA9IDA7XG4gIH1cbn07XG5cbkJlZUNlbGwucHJvdG90eXBlLmlzRmxvd2VyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5wcmVmaXhfID09PSBQUkVGSVguRkxPV0VSO1xufTtcblxuQmVlQ2VsbC5wcm90b3R5cGUuaXNIaXZlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5wcmVmaXhfID09PSBQUkVGSVguSElWRTtcbn07XG5cbi8qKlxuICogRmxvd2VycyBjYW4gYmUgcmVkLCBwdXJwbGUsIG9yIHVuZGVmaW5lZC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzUmVkRmxvd2VyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5pc0Zsb3dlcigpICYmIHRoaXMuY29sb3JfID09PSBGTE9XRVIuUkVEO1xufTtcblxuLyoqXG4gKiBGbG93ZXJzIGNhbiBiZSByZWQsIHB1cnBsZSwgb3IgdW5kZWZpbmVkLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNQdXJwbGVGbG93ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmlzRmxvd2VyKCkgJiYgdGhpcy5jb2xvcl8gPT09IEZMT1dFUi5QVVJQTEU7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzU3RhdGljQ2xvdWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmNsb3VkZWRfID09PSBDTE9VRC5TVEFUSUM7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzVmFyaWFibGVDbG91ZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICh0aGlzLmNsb3VkZWRfID09PSBDTE9VRC5WQVJJQUJMRSB8fCB0aGlzLmNsb3VkZWRfID09PSBDTE9VRC5BTlkpO1xufTtcblxuLyoqXG4gKiBWYXJpYWJsZSBjZWxscyBjYW4gcmVwcmVzZW50IG11bHRpcGxlIHBvc3NpYmxlIGtpbmRzIG9mIGdyaWQgYXNzZXRzLFxuICogd2hlcmVhcyBub24tdmFyaWFibGUgY2VsbHMgY2FuIHJlcHJlc2VudCBvbmx5IGEgc2luZ2xlIGtpbmQuIFRoaXNcbiAqIG1ldGhvZCByZXR1cm5zIGFuIGFycmF5IG9mIG5vbi12YXJpYWJsZSBCZWVDZWxscyBiYXNlZCBvbiB0aGlzIEJlZUNlbGwnc1xuICogY29uZmlndXJhdGlvbi5cbiAqIEByZXR1cm4ge0JlZUNlbGxbXX1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuZ2V0UG9zc2libGVHcmlkQXNzZXRzID0gZnVuY3Rpb24gKCkge1xuICAvLyBWYXJpYWJsZSBjb25maWd1cmF0aW9ucyBhcmU6XG4gIC8vICAgRmxvd2VyIG9yIG5vdGhpbmc6ICtuQ1xuICAvLyAgIEhvbmV5Y29tYiBvciBub3RoaW5nOiAtbkNcbiAgLy8gICBGbG93ZXIgb3IgSG9uZXljb21iOiBuQ1xuICAvLyAgIEZsb3dlciwgSG9uZXljb21iLCBvciBOb3RoaW5nOiBuQ2FueVxuXG4gIGlmICh0aGlzLmlzVmFyaWFibGVDbG91ZCgpKSB7XG4gICAgdmFyIHBvc3NpYmlsaXRpZXMgPSBbXTtcblxuICAgIGlmICh0aGlzLmlzRmxvd2VyKCkgfHwgIXRoaXMucHJlZml4Xykge1xuICAgICAgcG9zc2liaWxpdGllcy5wdXNoKG5ldyBCZWVDZWxsKHRoaXMub3JpZ2luYWxWYWx1ZV8sIENMT1VELlNUQVRJQywgUFJFRklYLkZMT1dFUiwgdGhpcy5jb2xvcl8pKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0hpdmUoKSB8fCAhdGhpcy5wcmVmaXhfKSB7XG4gICAgICBwb3NzaWJpbGl0aWVzLnB1c2gobmV3IEJlZUNlbGwodGhpcy5vcmlnaW5hbFZhbHVlXywgQ0xPVUQuU1RBVElDLCBQUkVGSVguSElWRSkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNsb3VkZWRfID09PSBDTE9VRC5BTlkgfHwgdGhpcy5wcmVmaXhfKSB7XG4gICAgICBwb3NzaWJpbGl0aWVzLnB1c2gobmV3IEJlZUNlbGwoMCwgQ0xPVUQuU1RBVElDKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc3NpYmlsaXRpZXM7XG4gIH1cblxuICByZXR1cm4gW3RoaXNdO1xufTtcblxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyBCZWVDZWxsIGZyb20gYSBjb25maWcgc3RyaW5nLCBhcyBwcm92aWRlZCBieVxuICogTGV2ZWxidWlsZGVyLlxuICogQHJldHVybiB7QmVlQ2VsbH1cbiAqL1xuQmVlQ2VsbC5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgdmFyIG1hdGNoZXMgPSBzdHJpbmcubWF0Y2ggJiYgc3RyaW5nLm1hdGNoKC9eKFxcK3wtKT8oXFxkKykoUnxQKT8oRkN8Q3xDYW55KT8kLyk7XG4gIHZhciB2YWx1ZSwgY2xvdWRlZCwgcHJlZml4LCBjb2xvcjtcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICBwcmVmaXggPSBtYXRjaGVzWzFdO1xuICAgIHZhbHVlID0gcGFyc2VJbnQobWF0Y2hlc1syXSk7XG4gICAgY29sb3IgPSBtYXRjaGVzWzNdO1xuICAgIGNsb3VkZWQgPSBtYXRjaGVzWzRdO1xuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gc3RyaW5nO1xuICB9XG5cbiAgLy8gVE9ETzogd2hlbiB3ZSBhZGQgbnVtZXJpYyByYW5nZXMsIHRoaXMgYmVjb21lczpcbiAgLypcbiAgdmFyIG1hdGNoZXMgPSBjZWxsLm1hdGNoICYmIGNlbGwubWF0Y2goL14oXFwrfC0pPyhcXGQrKSgsXFxkKyk/KFJ8UCk/KEZDfEN8Q2FueSk/JC8pO1xuICByZXR1cm4ge1xuICAgIHByZWZpeDogbWF0Y2hlc1sxXSxcbiAgICB2YWx1ZTogbWF0Y2hlc1syXSxcbiAgICByYW5nZTogbWF0Y2hlc1szXSxcbiAgICBjb2xvcjogbWF0Y2hlc1s0XSxcbiAgICBjbG91ZGVkOiBtYXRjaGVzWzVdLFxuICB9O1xuICAqL1xuXG4gIHJldHVybiBuZXcgQmVlQ2VsbCh2YWx1ZSwgY2xvdWRlZCwgcHJlZml4LCBjb2xvcik7XG59O1xuIl19
