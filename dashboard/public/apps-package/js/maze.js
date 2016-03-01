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
var AppView = require('../templates/AppView.jsx');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
var dom = require('../dom');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var mazeUtils = require('./mazeUtils');
var _ = utils.getLodash();
var dropletConfig = require('./dropletConfig');

var MazeMap = require('./mazeMap');
var Bee = require('./bee');
var Cell = require('./cell');
var BeeCell = require('./beeCell');
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

// Default Scalings
Maze.scale = {
  'snapRadius': 1,
  'stepSpeed': 5
};

var loadLevel = function loadLevel() {
  // Load maps.
  // "serializedMaze" is the new way of storing maps; it's a JSON array
  // containing complex map data.
  // "map" plus optionally "levelDirt" is the old way of storing maps;
  // they are each arrays of a combination of strings and ints with
  // their own complex syntax. This way is deprecated for new levels,
  // and only exists for backwards compatibility for not-yet-updated
  // levels.
  if (level.serializedMaze) {
    Maze.map = MazeMap.deserialize(level.serializedMaze, Maze.cellClass);
  } else {
    Maze.map = MazeMap.parseFromOldValues(level.map, level.initialDirt, Maze.cellClass);
  }

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

  Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.map.COLS;
  Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.map.ROWS;
  Maze.PATH_WIDTH = Maze.SQUARE_SIZE / 3;
};

/**
 * Initialize the wallMap.  For any cell at location x,y Maze.wallMap[y][x] will
 * be the index of which wall tile to use for that cell.  If the cell is not a
 * wall, Maze.wallMap[y][x] is undefined.
 */
var initWallMap = function initWallMap() {
  Maze.wallMap = new Array(Maze.map.ROWS);
  for (var y = 0; y < Maze.map.ROWS; y++) {
    Maze.wallMap[y] = new Array(Maze.map.COLS);
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
  for (y = 0; y < Maze.map.ROWS; y++) {
    for (x = 0; x < Maze.map.COLS; x++) {
      if (Maze.map.getTile(y, x) == SquareType.OBSTACLE) {
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
function isWallOrOutOfBounds(col, row) {
  return Maze.map.getTile(row, col) === SquareType.WALL || Maze.map.getTile(row, col) === undefined;
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
  for (var y = 0; y < Maze.map.ROWS; y++) {
    for (var x = 0; x < Maze.map.COLS; x++) {
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

/**
 * Redraw all dirt images
 * @param {boolean} running Whether or not user program is currently running
 */
function resetDirtImages(running) {
  Maze.map.forEachCell(function (cell, row, col) {
    if (cell.isDirt()) {
      Maze.gridItemDrawer.updateItemImage(row, col, running);
    }
  });
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
  if (mazeUtils.isBeeSkin(config.skinId)) {
    Maze.cellClass = BeeCell;
  } else {
    Maze.cellClass = Cell;
  }

  loadLevel();

  Maze.cachedBlockStates = [];

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
    for (var y = 0; y < Maze.map.ROWS; y++) {
      for (var x = 0; x < Maze.map.COLS; x++) {
        var cell = Maze.map.getTile(y, x);
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

    Maze.map.resetDirt();

    if (mazeUtils.isBeeSkin(config.skinId)) {
      Maze.gridItemDrawer = new BeeItemDrawer(Maze.map, skin, Maze.bee);
    } else {
      Maze.gridItemDrawer = new DirtDrawer(Maze.map, skin.dirt);
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

  var renderCodeWorkspace = function renderCodeWorkspace() {
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

  var renderVisualizationColumn = function renderVisualizationColumn() {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: require('./controls.html.ejs')({
          assetUrl: studioApp.assetUrl,
          showStepButton: level.step && !level.edit_blocks
        }),
        extraControlRows: extraControlRows
      },
      hideRunButton: level.stepOnly && !level.edit_blocks
    });
  };

  React.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
    onMount: studioApp.init.bind(studioApp, config)
  }), document.getElementById(config.containerId));
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
  Maze.map.resetDirt();
  resetDirtImages(false);

  // Reset the obstacle image.
  var obsId = 0;
  var x, y;
  for (y = 0; y < Maze.map.ROWS; y++) {
    for (x = 0; x < Maze.map.COLS; x++) {
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
  for (var y = 0; y < Maze.map.ROWS; y++) {
    for (var x = 0; x < Maze.map.COLS; x++) {
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
 * Helper class, passthrough to level-specific hasMultiplePossibleGrids
 * call
 * @return {boolean}
 */
Maze.hasMultiplePossibleGrids = function () {
  return Maze.bee && Maze.bee.hasMultiplePossibleGrids();
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
      if (Maze.hasMultiplePossibleGrids()) {
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
    var tileIdx = tileCoords[idx][1] + Maze.map.COLS * tileCoords[idx][0];
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
  var squareType = Maze.map.getTile(targetY, targetX);
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
    var obsId = targetX + Maze.map.COLS * targetY;
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
  for (var y = 0; y < Maze.map.ROWS; y++) {
    for (var x = 0; x < Maze.map.COLS; x++) {
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
  Maze.map.setValue(row, col, Maze.map.getValue(row, col) + options.amount);
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
  for (var row = 0; row < Maze.map.ROWS; row++) {
    for (var col = 0; col < Maze.map.COLS; col++) {
      if (Maze.map.isDirt(row, col) && Maze.map.getValue(row, col) !== 0) {
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/maze/api.js","./bee":"/home/ubuntu/staging/apps/build/js/maze/bee.js","./beeCell":"/home/ubuntu/staging/apps/build/js/maze/beeCell.js","./beeItemDrawer":"/home/ubuntu/staging/apps/build/js/maze/beeItemDrawer.js","./cell":"/home/ubuntu/staging/apps/build/js/maze/cell.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/controls.html.ejs","./dirtDrawer":"/home/ubuntu/staging/apps/build/js/maze/dirtDrawer.js","./dropletConfig":"/home/ubuntu/staging/apps/build/js/maze/dropletConfig.js","./executionInfo":"/home/ubuntu/staging/apps/build/js/maze/executionInfo.js","./extraControlRows.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/extraControlRows.html.ejs","./mazeMap":"/home/ubuntu/staging/apps/build/js/maze/mazeMap.js","./mazeUtils":"/home/ubuntu/staging/apps/build/js/maze/mazeUtils.js","./scrat":"/home/ubuntu/staging/apps/build/js/maze/scrat.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/maze/visualization.html.ejs","./wordsearch":"/home/ubuntu/staging/apps/build/js/maze/wordsearch.js"}],"/home/ubuntu/staging/apps/build/js/maze/wordsearch.js":[function(require,module,exports){
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
function isWaterOrOutOfBounds(col, row) {
  return Maze.map.getTile(row, col) === SquareType.WALL || Maze.map.getTile(row, col) === undefined;
}

// Returns true if the tile at x,y is a water tile that is in bounds.
function isWater(col, row) {
  return Maze.map.getTile(row, col) === SquareType.WALL;
}

/**
 * Override maze's drawMapTiles
 */
module.exports.drawMapTiles = function (svg) {
  var row, col;

  // first figure out where we want to put the island
  var possibleIslandLocations = [];
  for (row = 0; row < Maze.map.ROWS; row++) {
    for (col = 0; col < Maze.map.COLS; col++) {
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
  for (row = 0; row < Maze.map.ROWS; row++) {
    for (col = 0; col < Maze.map.COLS; col++) {
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/mazeMap.js":[function(require,module,exports){
"use strict";

var MazeMap = function MazeMap(grid) {
  this.grid_ = grid;

  this.ROWS = this.grid_.length;
  this.COLS = this.grid_[0].length;
};
module.exports = MazeMap;

MazeMap.prototype.resetDirt = function () {
  this.forEachCell(function (cell) {
    if (cell.isDirt()) {
      cell.resetCurrentValue();
    }
  });
};

MazeMap.prototype.forEachCell = function (cb) {
  this.grid_.forEach(function (row, x) {
    row.forEach(function (cell, y) {
      cb(cell, x, y);
    });
  });
};

MazeMap.prototype.isDirt = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].isDirt();
};

MazeMap.prototype.getTile = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].getTile();
};

MazeMap.prototype.getValue = function (x, y) {
  return this.grid_[x] && this.grid_[x][y] && this.grid_[x][y].getCurrentValue();
};

MazeMap.prototype.setValue = function (x, y, val) {
  if (this.grid_[x] && this.grid_[x][y]) {
    this.grid_[x][y].setCurrentValue(val);
  }
};

MazeMap.prototype.clone = function () {
  return this.grid_.map(function (row) {
    return row.map(function (cell) {
      return cell.clone();
    });
  });
};

MazeMap.deserialize = function (serializedValues, cellClass) {
  return new MazeMap(serializedValues.map(function (row) {
    return row.map(cellClass.deserialize);
  }));
};

MazeMap.parseFromOldValues = function (map, initialDirt, cellClass) {
  return new MazeMap(map.map(function (row, x) {
    return row.map(function (mapCell, y) {
      var initialDirtCell = initialDirt && initialDirt[x][y];
      return cellClass.parseFromOldValues(mapCell, initialDirtCell);
    });
  }));
};

},{}],"/home/ubuntu/staging/apps/build/js/maze/levels.js":[function(require,module,exports){
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
function BeeItemDrawer(map, skin, bee) {
  this.__base = BeeItemDrawer.superPrototype;

  DirtDrawer.call(this, map, '');

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

var DirtDrawer = module.exports = function (map, dirtAsset) {
  this.map_ = map;

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
  var val = this.map_.getValue(row, col);
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
      square = Maze.map.getTile(Maze.pegmanY - 1, Maze.pegmanX);
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.map.getTile(Maze.pegmanY, Maze.pegmanX + 1);
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.map.getTile(Maze.pegmanY + 1, Maze.pegmanX);
      command = 'look_south';
      break;
    case Direction.WEST:
      square = Maze.map.getTile(Maze.pegmanY, Maze.pegmanX - 1);
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
  } else if (Maze.hasMultiplePossibleGrids()) {
    // neither do quantum maps
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
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) > 0;
});

exports.holePresent = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) < 0;
});

exports.currentPositionNotClear = API_FUNCTION(function (id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.map.isDirt(y, x) && Maze.map.getValue(y, x) !== 0;
});

exports.fill = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.map.setValue(y, x, Maze.map.getValue(y, x) + 1);
});

exports.dig = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.map.setValue(y, x, Maze.map.getValue(y, x) - 1);
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

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./bee":"/home/ubuntu/staging/apps/build/js/maze/bee.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/bee.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');
var mazeMsg = require('./locale');
var BeeCell = require('./beeCell');
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

  // Initialize the map grid
  //
  // "serializedMaze" is the new way of storing maps; it's a JSON array
  // containing complex map data.
  //
  // "map" plus optionally "levelDirt" is the old way of storing maps;
  // they are each arrays of a combination of strings and ints with
  // their own complex syntax. This way is deprecated for new levels,
  // and only exists for backwards compatibility for not-yet-updated
  // levels.
  //
  // Either way, we turn what we have into a grid of BeeCells, any one
  // of which may represent a number of possible "static" cells. We then
  // turn that variable grid of BeeCells into a set of static grids.
  this.variableGrid = undefined;
  if (config.level.serializedMaze) {
    this.variableGrid = config.level.serializedMaze.map(function (row) {
      return row.map(BeeCell.deserialize);
    });
  } else {
    this.variableGrid = config.level.map.map(function (row, x) {
      return row.map(function (mapCell, y) {
        var initialDirtCell = config.level.initialDirt[x][y];
        return BeeCell.parseFromOldValues(mapCell, initialDirtCell);
      });
    });
  }
  this.staticGrids = Bee.getAllStaticGrids(this.variableGrid);

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
      if (cell.isVariableCloud() || cell.isVariableRange()) {
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
 * @return {boolean}
 */
Bee.prototype.hasMultiplePossibleGrids = function () {
  return this.staticGrids.length > 1;
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
 * Did we reach our total nectar/honey goals?
 * @return {boolean}
 */
Bee.prototype.finished = function () {
  // nectar/honey goals
  if (this.honey_ < this.honeyGoal_ || this.nectars_.length < this.nectarGoal_) {
    return false;
  }

  if (!this.checkedAllClouded() || !this.checkedAllPurple()) {
    return false;
  }

  if (!this.collectedEverything()) {
    return false;
  }

  return true;
};

/**
 * @return {boolean}
 */
Bee.prototype.collectedEverything = function () {
  // quantum maps implicity require "collect everything", non-quantum
  // maps don't really care
  if (!this.hasMultiplePossibleGrids()) {
    return true;
  }

  var missedSomething = this.currentStaticGrid.some(function (row) {
    return row.some(function (cell) {
      return cell.isDirt() && cell.getCurrentValue() > 0;
    });
  });

  return !missedSomething;
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
  } else if (!this.collectedEverything()) {
    executionInfo.terminateWithValue(TerminationValue.DID_NOT_COLLECT_EVERYTHING);
  }
};

/**
 * Did we check every flower/honey that was covered by a cloud?
 */
Bee.prototype.checkedAllClouded = function () {
  for (var row = 0; row < this.currentStaticGrid.length; row++) {
    for (var col = 0; col < this.currentStaticGrid[row].length; col++) {
      if (this.shouldCheckCloud(row, col) && !this.checkedCloud(row, col)) {
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
    case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
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
    case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
      return mazeMsg.didNotCollectEverything();
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
 * The only clouds we care about checking are clouds that were defined
 * as static clouds in the original grid; quantum clouds will handle
 * 'requiring' checks through their quantum nature.
 */
Bee.prototype.shouldCheckCloud = function (row, col) {
  return this.variableGrid[row][col].isStaticCloud();
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
  return val;
};

/**
 * How much more nectar can be collected from the flower at (row, col)
 */
Bee.prototype.flowerRemainingCapacity = function (row, col) {
  if (!this.isFlower(row, col)) {
    return 0;
  }

  var val = this.getValue(row, col);
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
    this.setValue(row, col, this.getValue(row, col) - 1);
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

'use strict';

var Cell = require('./cell');

var tiles = require('./tiles');
var SquareType = tiles.SquareType;

var BeeCell = function BeeCell(tileType, featureType, value, cloudType, flowerColor, range) {

  // BeeCells require features to have values
  if (featureType === BeeCell.FeatureType.NONE) {
    value = undefined;
    range = undefined;
  }

  Cell.call(this, tileType, value);

  /**
   * @type {Number}
   */
  this.featureType_ = featureType;

  /**
   * @type {Number}
   */
  this.flowerColor_ = flowerColor;

  /**
   * @type {Number}
   */
  this.cloudType_ = cloudType;

  /**
   * @type {Number}
   */
  this.range_ = range && range > value ? range : value;
};

BeeCell.inherits(Cell);
module.exports = BeeCell;

var FeatureType = BeeCell.FeatureType = {
  NONE: undefined,
  HIVE: 0,
  FLOWER: 1,
  VARIABLE: 2
};

var CloudType = BeeCell.CloudType = {
  NONE: undefined,
  STATIC: 0,
  HIVE_OR_FLOWER: 1,
  FLOWER_OR_NOTHING: 2,
  HIVE_OR_NOTHING: 3,
  ANY: 4
};

var FlowerColor = BeeCell.FlowerColor = {
  DEFAULT: undefined,
  RED: 0,
  PURPLE: 1
};

/**
 * Returns a new BeeCell that's an exact replica of this one
 * @return {BeeCell}
 * @override
 */
BeeCell.prototype.clone = function () {
  var newBeeCell = new BeeCell(this.tileType_, this.featureType_, this.originalValue_, this.cloudType_, this.flowerColor_, this.range_);
  newBeeCell.setCurrentValue(this.currentValue_);
  return newBeeCell;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isFlower = function () {
  return this.featureType_ === FeatureType.FLOWER;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isHive = function () {
  return this.featureType_ === FeatureType.HIVE;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isRedFlower = function () {
  return this.isFlower() && this.flowerColor_ === FlowerColor.RED;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isPurpleFlower = function () {
  return this.isFlower() && this.flowerColor_ === FlowerColor.PURPLE;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isStaticCloud = function () {
  return this.cloudType_ === CloudType.STATIC;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isVariableCloud = function () {
  if (this.cloudType_ === CloudType.NONE || this.cloudType_ === CloudType.STATIC) {
    return false;
  }
  return true;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isVariableRange = function () {
  return this.range_ && this.range_ > this.originalValue_;
};

/**
 * Variable cells can represent multiple possible kinds of grid assets,
 * whereas non-variable cells can represent only a single kind. This
 * method returns an array of non-variable BeeCells based on this BeeCell's
 * configuration.
 * @return {BeeCell[]}
 */
BeeCell.prototype.getPossibleGridAssets = function () {
  var possibilities = [];
  if (this.isVariableCloud()) {
    var flower = new BeeCell(this.tileType_, FeatureType.FLOWER, this.originalValue_, CloudType.STATIC, this.flowerColor_);
    var hive = new BeeCell(this.tileType_, FeatureType.HIVE, this.originalValue_, CloudType.STATIC);
    var nothing = new BeeCell(this.tileType_, FeatureType.NONE, undefined, CloudType.STATIC);
    switch (this.cloudType_) {
      case CloudType.HIVE_OR_FLOWER:
        possibilities = [flower, hive];
        break;
      case CloudType.FLOWER_OR_NOTHING:
        possibilities = [flower, nothing];
        break;
      case CloudType.HIVE_OR_NOTHING:
        possibilities = [hive, nothing];
        break;
      case CloudType.ANY:
        possibilities = [flower, hive, nothing];
        break;
    }
  } else if (this.isVariableRange()) {
    for (var i = this.originalValue_; i <= this.range_; i++) {
      possibilities.push(new BeeCell(this.tileType_, FeatureType.FLOWER, i, CloudType.NONE, FlowerColor.PURPLE));
    }
  } else {
    possibilities.push(this);
  }

  return possibilities;
};

/**
 * Serializes this BeeCell into JSON
 * @return {Object}
 * @override
 */
BeeCell.prototype.serialize = function () {
  return {
    tileType: this.tileType_,
    featureType: this.featureType_,
    value: this.originalValue_,
    cloudType: this.cloudType_,
    flowerColor: this.flowerColor_,
    range: this.range_
  };
};

/**
 * Creates a new BeeCell from serialized JSON
 * @param {Object}
 * @return {BeeCell}
 * @override
 */
BeeCell.deserialize = function (serialized) {
  return new BeeCell(serialized.tileType, serialized.featureType, serialized.value, serialized.cloudType, serialized.flowerColor, serialized.range);
};

/**
 * @param {String|Number} mapCell
 * @param {String|Number} initialDirtCell
 * @return {BeeCell}
 * @override
 * @see Cell.parseFromOldValues
 */
BeeCell.parseFromOldValues = function (mapCell, initialDirtCell) {
  mapCell = mapCell.toString();
  initialDirtCell = parseInt(initialDirtCell);
  var tileType, featureType, value, cloudType, flowerColor;

  if (!isNaN(initialDirtCell) && mapCell.match(/[1|R|P|FC]/) && initialDirtCell !== 0) {
    tileType = SquareType.OPEN;
    featureType = initialDirtCell > 0 ? FeatureType.FLOWER : FeatureType.HIVE;
    value = Math.abs(initialDirtCell);
    cloudType = mapCell === 'FC' ? CloudType.STATIC : CloudType.NONE;
    flowerColor = mapCell === 'R' ? FlowerColor.RED : mapCell === 'P' ? FlowerColor.PURPLE : FlowerColor.DEFAULT;
  } else {
    tileType = parseInt(mapCell);
  }
  return new BeeCell(tileType, featureType, value, cloudType, flowerColor);
};

},{"./cell":"/home/ubuntu/staging/apps/build/js/maze/cell.js","./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/cell.js":[function(require,module,exports){
'use strict';

var tiles = require('./tiles');
var SquareType = tiles.SquareType;

var Cell = function Cell(tileType, value) {

  /**
   * @type {Number}
   */
  this.tileType_ = tileType;

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

module.exports = Cell;

/**
 * Returns a new Cell that's an exact replica of this one
 * @return {Cell}
 */
Cell.prototype.clone = function () {
  var newCell = new Cell(this.tileType_, this.originalValue_);
  newCell.setCurrentValue(this.currentValue_);
  return newCell;
};

/**
 * @return {Number}
 */
Cell.prototype.getTile = function () {
  return this.tileType_;
};

/**
 * @return {boolean}
 */
Cell.prototype.isDirt = function () {
  return this.originalValue_ !== undefined;
};

/**
 * @return {Number}
 */
Cell.prototype.getCurrentValue = function () {
  return this.currentValue_;
};

/**
 * @param {Number}
 */
Cell.prototype.setCurrentValue = function (val) {
  this.currentValue_ = val;
};

Cell.prototype.resetCurrentValue = function () {
  this.currentValue_ = this.originalValue_;
};

/**
 * Serializes this Cell into JSON
 * @return {Object}
 */
Cell.prototype.serialize = function () {
  return {
    tileType: this.tileType_,
    value: this.originalValue_
  };
};

/**
 * Creates a new Cell from serialized JSON
 * @param {Object}
 * @return {Cell}
 */
Cell.deserialize = function (serialized) {
  return new Cell(serialized.tileType, serialized.value);
};

/**
 * Creates a new Cell from a mapCell and an initialDirtCell. This
 * represents the old style of storing map data, and should not be used
 * for any new levels. Note that this style does not support new
 * features such as dynamic ranges or new cloud types. Only used for
 * backwards compatibility.
 * @param {String|Number} mapCell
 * @param {String|Number} initialDirtCell
 * @return {Cell}
 * @override
 */
Cell.parseFromOldValues = function (mapCell, initialDirtCell) {
  mapCell = parseInt(mapCell);
  initialDirtCell = parseInt(initialDirtCell);

  var tileType, value;

  tileType = parseInt(mapCell);
  if (!isNaN(initialDirtCell) && initialDirtCell !== 0) {
    value = initialDirtCell;
  }

  return new Cell(tileType, value);
};

},{"./tiles":"/home/ubuntu/staging/apps/build/js/maze/tiles.js"}],"/home/ubuntu/staging/apps/build/js/maze/tiles.js":[function(require,module,exports){
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

},{"../utils":"/home/ubuntu/staging/apps/build/js/utils.js"}]},{},["/home/ubuntu/staging/apps/build/js/maze/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9tYXplL21haW4uanMiLCJidWlsZC9qcy9tYXplL3NraW5zLmpzIiwiYnVpbGQvanMvbWF6ZS9tYXplLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoLmpzIiwiYnVpbGQvanMvbWF6ZS92aXN1YWxpemF0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zY3JhdC5qcyIsImJ1aWxkL2pzL21hemUvbWF6ZU1hcC5qcyIsImJ1aWxkL2pzL21hemUvbGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoTGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMvbWF6ZS54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zdGFydEJsb2Nrcy54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUva2FyZWxMZXZlbHMuanMiLCJidWlsZC9qcy9tYXplL3Rvb2xib3hlcy9rYXJlbDMueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvdG9vbGJveGVzL2thcmVsMi54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMva2FyZWwxLnhtbC5lanMiLCJidWlsZC9qcy9tYXplL2thcmVsU3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXhlY3V0aW9uSW5mby5qcyIsImJ1aWxkL2pzL21hemUvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL21hemUvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9tYXplL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUvYmVlSXRlbURyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvZGlydERyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvbWF6ZVV0aWxzLmpzIiwiYnVpbGQvanMvbWF6ZS9iZWVCbG9ja3MuanMiLCJidWlsZC9qcy9tYXplL2FwaS5qcyIsImJ1aWxkL2pzL21hemUvYmVlLmpzIiwiYnVpbGQvanMvbWF6ZS9sb2NhbGUuanMiLCJidWlsZC9qcy9tYXplL2JlZUNlbGwuanMiLCJidWlsZC9qcy9tYXplL2NlbGwuanMiLCJidWlsZC9qcy9tYXplL3RpbGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDWEEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTFCLElBQUksT0FBTyxHQUFHO0FBQ1osU0FBTyxFQUFFO0FBQ1Asd0NBQW9DLEVBQUUsSUFBSTtBQUMxQyxnQkFBWSxFQUFFLEVBQUU7QUFDaEIsZUFBVyxFQUFFLEVBQUU7QUFDZixlQUFXLEVBQUUsS0FBSztBQUNsQixRQUFJLEVBQUUsRUFBRTtBQUNSLHVCQUFtQixFQUFFLGlCQUFpQjtBQUN0Qyx1QkFBbUIsRUFBRSxpQkFBaUI7QUFDdEMsaUNBQTZCLEVBQUUsR0FBRzs7QUFFbEMsa0NBQThCLEVBQUUsQ0FBQztBQUNqQyxvQkFBZ0IsRUFBRSxJQUFJO0dBQ3ZCOztBQUVELEtBQUcsRUFBRTtBQUNILHFCQUFpQixFQUFFLEVBQUU7QUFDckIsZ0JBQVksRUFBRSxjQUFjO0FBQzVCLGFBQVMsRUFBRSxlQUFlO0FBQzFCLGdCQUFZLEVBQUUsa0JBQWtCO0FBQ2hDLFNBQUssRUFBRSxXQUFXO0FBQ2xCLFNBQUssRUFBRSxXQUFXO0FBQ2xCLGtCQUFjLEVB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LENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNoQixDQUFDOztBQUVGLFNBQVMsT0FBTyxHQUFJO0FBQ2xCLE1BQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7OztBQUdsQixNQUFJLE1BQU0sR0FBRyxRQUFRLENB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RUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzFDLFNBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDeEUsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUNoRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7QUFDaEQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckMsUUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdkM7Q0FDRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVk7QUFDcEMsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNuQyxXQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDN0IsYUFBTyxJQUFJLENBQUMsS0FBSyxFQUFF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LENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QjtBQUNELGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDakM7QUFDRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FDekI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsS0FBSztBQUNqQyxT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Z0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFDeEIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQ3RCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUNyQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FDdkI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekIsV0FBTyxFQUFFLENBQUM7QUFDVixXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN4QixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFDdEIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQ3JCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUN2QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekI7R0FDRjtBQUNELFFBQU0sRUFBRTtBQUNOLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN6QixXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUN0QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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b0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQ3hCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxFQUMzQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFDckIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQ3ZCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsU0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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LFVBQVUsQ0FBQyxDQUN2QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekI7R0FDRjtBQUNELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsQ0FBQztBQUNWLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLG1CQUFlLEVBQUU7QUFDZixtQkFBYSxFQUFFLElBQUk7QUFDbkIsZ0JBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFXLEVBQUUsSUFBSTtLQUNsQjtBQUNELG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN4QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FDdEI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxVQUFRLEVBQUU7QUFDUixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsb0JBQWdCLEVBQUUsRUFBRTtBQUNwQixvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFB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RSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FDdkI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFB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RSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FDN0M7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQ2xEO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQ2hDO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxF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Q0FBQyxFQUNOLENBQUMsc0JBQXNCLENBQUMsQ0FDekI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLElBQUksQ0FBQyxFQUNOLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQy9CO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxFQUM5QixDQUFDLFNBQVMsQ0FBQyxDQUNaO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxHQUFHO0tBQ2pCO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsUUFBTSxFQUFFO0FBQ04sYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3pCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsR0FBRyxDQUFDLEVBQ0wsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLEdBQUc7S0FDakI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNqQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLElBQUksQ0FBQyxFQUNOLENBQUMsbUJBQW1CLENBQUMsRUFDckIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLEdBQUc7S0FDakI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7Ozs7QUFJRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsSUFBSTtBQUNiLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUN2RDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUM1QjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMxQjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ25EO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQ2hDO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsTUFBTSxDQUFDLEVBQ1IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsU0FBUyxDQUFDLEVBQ1gsQ0FBQyxVQUFVLENBQUMsQ0FDYjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsTUFBTSxDQUFDLEVBQ1IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLFlBQVksQ0FBQyxDQUNmO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUNoRTtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQ2pEO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FDdEM7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUN4QjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsUUFBTSxFQUFFO0FBQ04sYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3pCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxVQUFVLENBQUMsRUFDWixDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDOUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDL0I7R0FDRjs7OztBQUlELGVBQWEsRUFBRTtBQUNiLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUN6RDtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFO0FBQ2IsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FDbkM7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLEtBQUs7QUFDakMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxnQkFBYyxFQUFFO0FBQ2QsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQzNEO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLEtBQUs7QUFDakMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxlQUFhLEVBQUU7QUFDYixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FDM0Q7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsWUFBVSxFQUFFO0FBQ1YsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDekMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FDdkM7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELGlCQUFlLEVBQUU7QUFDZixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUN6QyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUN4RDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDNUI7R0FDRjs7QUFFRCxvQkFBa0IsRUFBRTtBQUNsQixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQzdDO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxvQkFBa0IsRUFBRTtBQUNsQixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFDcEQsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQ2xDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUNyQztBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDN0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDN0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELG9CQUFrQixFQUFFO0FBQ2xCLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDbkQsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUNoRSxDQUFDLGFBQWEsQ0FBQyxDQUNoQjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsU0FBTyxFQUFFO0FBQ1AsYUFBUyxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUM7Ozs7Ozs7Ozs7O21EQVdXLENBQzlDO0FBQ0QsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxvQkFBZ0IsRUFBRSxFQUNqQjtBQUNELFdBQU8sRUFBRTtBQUNQLGtCQUFZLEVBQUUsR0FBRztLQUNsQjtBQUNELGFBQVMsRUFBRSxDQUFDOztBQUVaLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FFN0I7R0FDRjtDQUNGLENBQUM7OztBQ2h1Q0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7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QU8sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsR0FDMUI7QUFDRCxRQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxDQUFDO0NBQ3hELENBQUM7O0FBRUYsS0FBSyxDQUFDLGdCQUFnQixHQUFHLFVBQVMsVUFBVSxFQUFFO0FBQzVDLFNBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ3RDLENBQUM7Ozs7Ozs7QUFPRixLQUFLLENBQUMsbUJBQW1CLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDdEMsU0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN4QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuTWF6ZSA9IHJlcXVpcmUoJy4vbWF6ZScpO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5NYXplID0gd2luZG93Lk1hemU7XG59XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xuXG53aW5kb3cubWF6ZU1haW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuXG4gIGFwcE1haW4od2luZG93Lk1hemUsIGxldmVscywgb3B0aW9ucyk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltSjFhV3hrTDJwekwyMWhlbVV2YldGcGJpNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3UVVGQlFTeEpRVUZKTEU5QlFVOHNSMEZCUnl4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExFTkJRVU03UVVGRGNFTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdRVUZEYUVNc1NVRkJTU3hQUVVGUExFMUJRVTBzUzBGQlN5eFhRVUZYTEVWQlFVVTdRVUZEYWtNc1VVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRPME5CUXpOQ08wRkJRMFFzU1VGQlNTeE5RVUZOTEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wRkJRMnBETEVsQlFVa3NUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU5xUXl4SlFVRkpMRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdPMEZCUlM5Q0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVkQlFVY3NWVUZCVXl4UFFVRlBMRVZCUVVVN1FVRkRiRU1zVTBGQlR5eERRVUZETEZkQlFWY3NSMEZCUnl4TFFVRkxMRU5CUVVNN1FVRkROVUlzVTBGQlR5eERRVUZETEZsQlFWa3NSMEZCUnl4TlFVRk5MRU5CUVVNN08wRkJSVGxDTEZOQlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hGUVVGRkxFMUJRVTBzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXp0RFFVTjJReXhEUVVGRElpd2labWxzWlNJNkltZGxibVZ5WVhSbFpDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUoyWVhJZ1lYQndUV0ZwYmlBOUlISmxjWFZwY21Vb0p5NHVMMkZ3Y0UxaGFXNG5LVHRjYm5kcGJtUnZkeTVOWVhwbElEMGdjbVZ4ZFdseVpTZ25MaTl0WVhwbEp5azdYRzVwWmlBb2RIbHdaVzltSUdkc2IySmhiQ0FoUFQwZ0ozVnVaR1ZtYVc1bFpDY3BJSHRjYmlBZ1oyeHZZbUZzTGsxaGVtVWdQU0IzYVc1a2IzY3VUV0Y2WlR0Y2JuMWNiblpoY2lCaWJHOWphM01nUFNCeVpYRjFhWEpsS0NjdUwySnNiMk5yY3ljcE8xeHVkbUZ5SUd4bGRtVnNjeUE5SUhKbGNYVnBjbVVvSnk0dmJHVjJaV3h6SnlrN1hHNTJZWElnYzJ0cGJuTWdQU0J5WlhGMWFYSmxLQ2N1TDNOcmFXNXpKeWs3WEc1Y2JuZHBibVJ2ZHk1dFlYcGxUV0ZwYmlBOUlHWjFibU4wYVc5dUtHOXdkR2x2Ym5NcElIdGNiaUFnYjNCMGFXOXVjeTV6YTJsdWMwMXZaSFZzWlNBOUlITnJhVzV6TzF4dUlDQnZjSFJwYjI1ekxtSnNiMk5yYzAxdlpIVnNaU0E5SUdKc2IyTnJjenRjYmx4dUlDQmhjSEJOWVdsdUtIZHBibVJ2ZHk1TllYcGxMQ0JzWlhabGJITXNJRzl3ZEdsdmJuTXBPMXh1ZlR0Y2JpSmRmUT09IiwiLyoqXG4gKiBMb2FkIFNraW4gZm9yIE1hemUuXG4gKi9cbi8vIHRpbGVzOiBBIDI1MHgyMDAgc2V0IG9mIDIwIG1hcCBpbWFnZXMuXG4vLyBnb2FsOiBBIDIweDM0IGdvYWwgaW1hZ2UuXG4vLyBiYWNrZ3JvdW5kOiBOdW1iZXIgb2YgNDAweDQwMCBiYWNrZ3JvdW5kIGltYWdlcy4gUmFuZG9tbHkgc2VsZWN0IG9uZSBpZlxuLy8gc3BlY2lmaWVkLCBvdGhlcndpc2UsIHVzZSBiYWNrZ3JvdW5kLnBuZy5cbi8vIGxvb2s6IENvbG91ciBvZiBzb25hci1saWtlIGxvb2sgaWNvbi5cblxudmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcblxudmFyIENPTkZJR1MgPSB7XG4gIGxldHRlcnM6IHtcbiAgICBub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGU6IHRydWUsXG4gICAgcGVnbWFuSGVpZ2h0OiA1MCxcbiAgICBwZWdtYW5XaWR0aDogNTAsXG4gICAgZGFuY2VPbkxvYWQ6IGZhbHNlLFxuICAgIGdvYWw6ICcnLFxuICAgIGlkbGVQZWdtYW5BbmltYXRpb246ICdpZGxlX2F2YXRhci5naWYnLFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb246ICdtb3ZlX2F2YXRhci5wbmcnLFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgLy8gVGhpcyBpcyByZXF1aXJlZCB3aGVuIG1vdmUgcGVnbWFuIGFuaW1hdGlvbiBpcyBzZXRcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uRnJhbWVOdW1iZXI6IDksXG4gICAgaGlkZUluc3RydWN0aW9uczogdHJ1ZVxuICB9LFxuXG4gIGJlZToge1xuICAgIG9ic3RhY2xlQW5pbWF0aW9uOiAnJyxcbiAgICBvYnN0YWNsZUlkbGU6ICdvYnN0YWNsZS5wbmcnLFxuICAgIHJlZEZsb3dlcjogJ3JlZEZsb3dlci5wbmcnLFxuICAgIHB1cnBsZUZsb3dlcjogJ3B1cnBsZUZsb3dlci5wbmcnLFxuICAgIGhvbmV5OiAnaG9uZXkucG5nJyxcbiAgICBjbG91ZDogJ2Nsb3VkLnBuZycsXG4gICAgY2xvdWRBbmltYXRpb246ICdjbG91ZF9oaWRlLmdpZicsXG4gICAgYmVlU291bmQ6IHRydWUsXG4gICAgbmVjdGFyU291bmQ6ICdnZXROZWN0YXIubXAzJyxcbiAgICBob25leVNvdW5kOiAnbWFrZUhvbmV5Lm1wMycsXG5cbiAgICBsb29rOiAnIzAwMCcsXG4gICAgbm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlOiB0cnVlLFxuICAgIGlkbGVQZWdtYW5BbmltYXRpb246ICdpZGxlX2F2YXRhci5naWYnLFxuICAgIHdhbGxQZWdtYW5BbmltYXRpb246ICd3YWxsX2F2YXRhci5wbmcnLFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb246ICdtb3ZlX2F2YXRhci5wbmcnLFxuICAgIGhpdHRpbmdXYWxsQW5pbWF0aW9uOiAnd2FsbC5naWYnLFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgLy8gVGhpcyBpcyByZXF1aXJlZCB3aGVuIG1vdmUgcGVnbWFuIGFuaW1hdGlvbiBpcyBzZXRcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uRnJhbWVOdW1iZXI6IDksXG4gICAgYWN0aW9uU3BlZWRTY2FsZToge1xuICAgICAgbmVjdGFyOiAxLFxuICAgIH0sXG4gICAgcGVnbWFuWU9mZnNldDogMCxcbiAgICB0aWxlU2hlZXRXaWR0aDogNSxcbiAgICBwZWdtYW5IZWlnaHQ6IDUwLFxuICAgIHBlZ21hbldpZHRoOiA1MFxuICB9LFxuXG4gIGZhcm1lcjoge1xuICAgIG9ic3RhY2xlSWRsZTogJ29ic3RhY2xlLnBuZycsXG5cbiAgICBkaXJ0OiAnZGlydC5wbmcnLFxuICAgIGZpbGxTb3VuZDogJ2ZpbGwubXAzJyxcbiAgICBkaWdTb3VuZDogJ2RpZy5tcDMnLFxuXG4gICAgbG9vazogJyMwMDAnLFxuICAgIHRyYW5zcGFyZW50VGlsZUVuZGluZzogdHJ1ZSxcbiAgICBub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGU6IHRydWUsXG4gICAgYmFja2dyb3VuZDogJ2JhY2tncm91bmQnICsgXy5zYW1wbGUoWzAsIDEsIDIsIDNdKSArICcucG5nJyxcbiAgICBkaXJ0U291bmQ6IHRydWUsXG4gICAgcGVnbWFuWU9mZnNldDogLTgsXG4gICAgZGFuY2VPbkxvYWQ6IHRydWVcbiAgfSxcblxuICBwdno6IHtcbiAgICBnb2FsSWRsZTogJ2dvYWxJZGxlLmdpZicsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGVJZGxlLmdpZicsXG5cbiAgICBnb2FsQW5pbWF0aW9uOiAnZ29hbC5naWYnLFxuICAgIG1hemVfZm9yZXZlcjogJ21hemVfZm9yZXZlci5wbmcnLFxuXG4gICAgb2JzdGFjbGVTY2FsZTogMS40LFxuICAgIHBlZ21hbllPZmZzZXQ6IC04LFxuICAgIGRhbmNlT25Mb2FkOiB0cnVlXG4gIH0sXG5cbiAgYmlyZHM6IHtcbiAgICBnb2FsSWRsZTogJ2dvYWxJZGxlLmdpZicsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGUucG5nJyxcblxuICAgIGdvYWxBbmltYXRpb246ICdnb2FsLmdpZicsXG4gICAgbWF6ZV9mb3JldmVyOiAnbWF6ZV9mb3JldmVyLnBuZycsXG4gICAgbGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlczogJ3RpbGVzLWJyb2tlbi5wbmcnLFxuXG4gICAgb2JzdGFjbGVTY2FsZTogMS4yLFxuICAgIGFkZGl0aW9uYWxTb3VuZDogdHJ1ZSxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXIuZ2lmJyxcbiAgICB3YWxsUGVnbWFuQW5pbWF0aW9uOiAnd2FsbF9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuICAgIGhpdHRpbmdXYWxsQW5pbWF0aW9uOiAnd2FsbC5naWYnLFxuICAgIGFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbjogJ2Nsb3NlX2dvYWwucG5nJyxcbiAgICBwZWdtYW5IZWlnaHQ6IDY4LFxuICAgIHBlZ21hbldpZHRoOiA1MSxcbiAgICBwZWdtYW5ZT2Zmc2V0OiAtMTQsXG4gICAgdHVybkFmdGVyVmljdG9yeTogdHJ1ZVxuICB9LFxuXG4gc2NyYXQ6IHtcbiAgICBnb2FsSWRsZTogJ2dvYWwucG5nJyxcbiAgICBvYnN0YWNsZUlkbGU6ICdvYnN0YWNsZS5wbmcnLFxuXG4gICAgZ29hbEFuaW1hdGlvbjogJ2dvYWwucG5nJyxcbiAgICBtYXplX2ZvcmV2ZXI6ICdtYXplX2ZvcmV2ZXIucG5nJyxcbiAgICBsYXJnZXJPYnN0YWNsZUFuaW1hdGlvblRpbGVzOiAndGlsZXMtYnJva2VuLnBuZycsXG5cbiAgICBvYnN0YWNsZVNjYWxlOiAxLjIsXG4gICAgYWRkaXRpb25hbFNvdW5kOiB0cnVlLFxuICAgIGlkbGVQZWdtYW5BbmltYXRpb246ICdpZGxlX2F2YXRhcl9zaGVldC5wbmcnLFxuICAgIGlkbGVQZWdtYW5BbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgaWRsZVBlZ21hbkNvbDogNCxcbiAgICBpZGxlUGVnbWFuUm93OiAxMSxcblxuICAgIGhpdHRpbmdXYWxsQW5pbWF0aW9uOiAnd2FsbF9hdmF0YXJfc2hlZXQucG5nJyxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbkZyYW1lTnVtYmVyOiAyMCxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvblNwZWVkU2NhbGU6IDEuNSxcbiAgICBoaXR0aW5nV2FsbFBlZ21hbkNvbDogMSxcbiAgICBoaXR0aW5nV2FsbFBlZ21hblJvdzogMjAsXG5cbiAgICBjZWxlYnJhdGVBbmltYXRpb246ICdqdW1wX2Fjb3JuX3NoZWV0LnBuZycsXG4gICAgY2VsZWJyYXRlUGVnbWFuQ29sOiAxLFxuICAgIGNlbGVicmF0ZVBlZ21hblJvdzogOSxcblxuICAgIG1vdmVQZWdtYW5BbmltYXRpb246ICdtb3ZlX2F2YXRhci5wbmcnLFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgLy8gVGhpcyBpcyByZXF1aXJlZCB3aGVuIG1vdmUgcGVnbWFuIGFuaW1hdGlvbiBpcyBzZXRcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uRnJhbWVOdW1iZXI6IDksXG5cbiAgICBhcHByb2FjaGluZ0dvYWxBbmltYXRpb246ICdjbG9zZV9nb2FsLnBuZycsXG4gICAgcGVnbWFuSGVpZ2h0OiAxMDcsXG4gICAgcGVnbWFuV2lkdGg6IDgwLFxuICAgIHBlZ21hblhPZmZzZXQ6IC0xMixcbiAgICBwZWdtYW5ZT2Zmc2V0OiAtMzAsXG4gICAgdHVybkFmdGVyVmljdG9yeTogdHJ1ZVxuICB9XG59O1xuXG4vLyBuaWdodCBza2lucyBhcmUgZWZmZWN0aXZlbHkgdGhlIHNhbWUsIGJ1dCB3aWxsIGhhdmUgc29tZSBkaWZmZXJlbnQgYXNzZXRzXG4vLyBpbiB0aGVpciByZXNwZWN0aXZlIGZvbGRlcnMgYmxvY2tseS9zdGF0aWMvc2tpbnMvPHNraW4gbmFtZT5cbkNPTkZJR1MuYmVlX25pZ2h0ID0gQ09ORklHUy5iZWU7XG5DT05GSUdTLmZhcm1lcl9uaWdodCA9IENPTkZJR1MuZmFybWVyO1xuXG4vKipcbiAqIEdpdmVuIHRoZSBtcDMgc291bmQsIGdlbmVyYXRlcyBhIGxpc3QgY29udGFpbmluZyBib3RoIHRoZSBtcDMgYW5kIG9nZyBzb3VuZHNcbiAqL1xuZnVuY3Rpb24gc291bmRBc3NldFVybHMoc2tpbiwgbXAzU291bmQpIHtcbiAgdmFyIGJhc2UgPSBtcDNTb3VuZC5tYXRjaCgvXiguKilcXC5tcDMkLylbMV07XG4gIHJldHVybiBbc2tpbi5hc3NldFVybChtcDNTb3VuZCksIHNraW4uYXNzZXRVcmwoYmFzZSArICcub2dnJyldO1xufVxuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgLy8gVGhlIHNraW4gaGFzIHByb3BlcnRpZXMgZnJvbSB0aHJlZSBsb2NhdGlvbnNcbiAgLy8gKDEpIHNraW5CYXNlIC0gcHJvcGVydGllcyBjb21tb24gYWNyb3NzIEJsb2NrbHkgYXBwc1xuICAvLyAoMikgaGVyZSAtIHByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBhbGwgbWF6ZSBza2luc1xuICAvLyAoMykgY29uZmlnIC0gcHJvcGVydGllcyBwYXJ0aWN1bGFyIHRvIGEgbWF6ZSBza2luXG4gIC8vIElmIGEgcHJvcGVydHkgaXMgZGVmaW5lZCBpbiBtdWx0aXBsZSBsb2NhdGlvbnMsIHRoZSBtb3JlIHNwZWNpZmljIGxvY2F0aW9uXG4gIC8vIHRha2VzIHByZWNlZGVuY2VcblxuICAvLyAoMSkgUHJvcGVydGllcyBjb21tb24gYWNyb3NzIEJsb2NrbHkgYXBwc1xuICB2YXIgc2tpbiA9IHNraW5zQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG4gIC8vICgyKSBEZWZhdWx0IHZhbHVlcyBmb3IgcHJvcGVydGllcyBjb21tb24gYWNyb3NzIG1hemUgc2tpbnMuXG4gIHNraW4ub2JzdGFjbGVTY2FsZSA9IDEuMDtcbiAgc2tpbi5vYnN0YWNsZUFuaW1hdGlvbiA9IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlLmdpZicpO1xuICBza2luLm1vdmVQZWdtYW5BbmltYXRpb25TcGVlZFNjYWxlID0gMTtcbiAgc2tpbi5sb29rID0gJyNGRkYnO1xuICBza2luLmJhY2tncm91bmQgPSBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kLnBuZycpO1xuICBza2luLnRpbGVzID0gc2tpbi5hc3NldFVybCgndGlsZXMucG5nJyk7XG4gIHNraW4ucGVnbWFuSGVpZ2h0ID0gNTI7XG4gIHNraW4ucGVnbWFuV2lkdGggPSA0OTtcbiAgc2tpbi5wZWdtYW5ZT2Zmc2V0ID0gMDtcbiAgLy8gZG8gd2UgdHVybiB0byB0aGUgZGlyZWN0aW9uIHdlJ3JlIGZhY2luZyBhZnRlciBwZXJmb3JtaW5nIG91ciB2aWN0b3J5XG4gIC8vIGFuaW1hdGlvbj9cbiAgc2tpbi50dXJuQWZ0ZXJWaWN0b3J5ID0gZmFsc2U7XG4gIHNraW4uZGFuY2VPbkxvYWQgPSBmYWxzZTtcblxuICAvLyBTb3VuZHNcbiAgc2tpbi5vYnN0YWNsZVNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ29ic3RhY2xlLm1wMycpO1xuICBza2luLndhbGxTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsLm1wMycpO1xuICBza2luLndpbkdvYWxTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3aW5fZ29hbC5tcDMnKTtcbiAgc2tpbi53YWxsMFNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGwwLm1wMycpO1xuICBza2luLndhbGwxU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbDEubXAzJyk7XG4gIHNraW4ud2FsbDJTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsMi5tcDMnKTtcbiAgc2tpbi53YWxsM1NvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGwzLm1wMycpO1xuICBza2luLndhbGw0U291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbDQubXAzJyk7XG5cbiAgLy8gKDMpIEdldCBwcm9wZXJ0aWVzIGZyb20gY29uZmlnXG4gIHZhciBpc0Fzc2V0ID0gL1xcLlxcU3szfSQvOyAvLyBlbmRzIGluIGRvdCBmb2xsb3dlZCBieSB0aHJlZSBub24td2hpdGVzcGFjZSBjaGFyc1xuICB2YXIgaXNTb3VuZCA9IC9eKC4qKVxcLm1wMyQvOyAvLyBzb21ldGhpbmcubXAzXG4gIGZvciAodmFyIHByb3AgaW4gY29uZmlnKSB7XG4gICAgdmFyIHZhbCA9IGNvbmZpZ1twcm9wXTtcbiAgICBpZiAoaXNTb3VuZC50ZXN0KHZhbCkpIHtcbiAgICAgIHZhbCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0Fzc2V0LnRlc3QodmFsKSkge1xuICAgICAgdmFsID0gc2tpbi5hc3NldFVybCh2YWwpO1xuICAgIH1cbiAgICBza2luW3Byb3BdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IEFwcHM6IE1hemVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgSmF2YVNjcmlwdCBmb3IgQmxvY2tseSdzIE1hemUgYXBwbGljYXRpb24uXG4gKiBAYXV0aG9yIGZyYXNlckBnb29nbGUuY29tIChOZWlsIEZyYXNlcilcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIHRpbGVzID0gcmVxdWlyZSgnLi90aWxlcycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBBcHBWaWV3ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL0FwcFZpZXcuanN4Jyk7XG52YXIgY29kZVdvcmtzcGFjZUVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jb2RlV29ya3NwYWNlLmh0bWwuZWpzJyk7XG52YXIgdmlzdWFsaXphdGlvbkNvbHVtbkVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy92aXN1YWxpemF0aW9uQ29sdW1uLmh0bWwuZWpzJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xudmFyIG1hemVVdGlscyA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIGRyb3BsZXRDb25maWcgPSByZXF1aXJlKCcuL2Ryb3BsZXRDb25maWcnKTtcblxudmFyIE1hemVNYXAgPSByZXF1aXJlKCcuL21hemVNYXAnKTtcbnZhciBCZWUgPSByZXF1aXJlKCcuL2JlZScpO1xudmFyIENlbGwgPSByZXF1aXJlKCcuL2NlbGwnKTtcbnZhciBCZWVDZWxsID0gcmVxdWlyZSgnLi9iZWVDZWxsJyk7XG52YXIgV29yZFNlYXJjaCA9IHJlcXVpcmUoJy4vd29yZHNlYXJjaCcpO1xudmFyIHNjcmF0ID0gcmVxdWlyZSgnLi9zY3JhdCcpO1xuXG52YXIgRGlydERyYXdlciA9IHJlcXVpcmUoJy4vZGlydERyYXdlcicpO1xudmFyIEJlZUl0ZW1EcmF3ZXIgPSByZXF1aXJlKCcuL2JlZUl0ZW1EcmF3ZXInKTtcblxudmFyIEV4ZWN1dGlvbkluZm8gPSByZXF1aXJlKCcuL2V4ZWN1dGlvbkluZm8nKTtcblxudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcbnZhciBUdXJuRGlyZWN0aW9uID0gdGlsZXMuVHVybkRpcmVjdGlvbjtcbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG5cbnZhciBTVkdfTlMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKS5TVkdfTlM7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBNYXplID0gbW9kdWxlLmV4cG9ydHM7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG4vKipcbiAqIE1pbGxpc2Vjb25kcyBiZXR3ZWVuIGVhY2ggYW5pbWF0aW9uIGZyYW1lLlxuICovXG52YXIgc3RlcFNwZWVkID0gMTAwO1xuXG4vL1RPRE86IE1ha2UgY29uZmlndXJhYmxlLlxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG5cbi8vIERlZmF1bHQgU2NhbGluZ3Ncbk1hemUuc2NhbGUgPSB7XG4gICdzbmFwUmFkaXVzJzogMSxcbiAgJ3N0ZXBTcGVlZCc6IDVcbn07XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIExvYWQgbWFwcy5cbiAgLy8gXCJzZXJpYWxpemVkTWF6ZVwiIGlzIHRoZSBuZXcgd2F5IG9mIHN0b3JpbmcgbWFwczsgaXQncyBhIEpTT04gYXJyYXlcbiAgLy8gY29udGFpbmluZyBjb21wbGV4IG1hcCBkYXRhLlxuICAvLyBcIm1hcFwiIHBsdXMgb3B0aW9uYWxseSBcImxldmVsRGlydFwiIGlzIHRoZSBvbGQgd2F5IG9mIHN0b3JpbmcgbWFwcztcbiAgLy8gdGhleSBhcmUgZWFjaCBhcnJheXMgb2YgYSBjb21iaW5hdGlvbiBvZiBzdHJpbmdzIGFuZCBpbnRzIHdpdGhcbiAgLy8gdGhlaXIgb3duIGNvbXBsZXggc3ludGF4LiBUaGlzIHdheSBpcyBkZXByZWNhdGVkIGZvciBuZXcgbGV2ZWxzLFxuICAvLyBhbmQgb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZvciBub3QteWV0LXVwZGF0ZWRcbiAgLy8gbGV2ZWxzLlxuICBpZiAobGV2ZWwuc2VyaWFsaXplZE1hemUpIHtcbiAgICBNYXplLm1hcCA9IE1hemVNYXAuZGVzZXJpYWxpemUobGV2ZWwuc2VyaWFsaXplZE1hemUsIE1hemUuY2VsbENsYXNzKTtcbiAgfSBlbHNlIHtcbiAgICBNYXplLm1hcCA9IE1hemVNYXAucGFyc2VGcm9tT2xkVmFsdWVzKGxldmVsLm1hcCwgbGV2ZWwuaW5pdGlhbERpcnQsIE1hemUuY2VsbENsYXNzKTtcbiAgfVxuXG4gIE1hemUuc3RhcnREaXJlY3Rpb24gPSBsZXZlbC5zdGFydERpcmVjdGlvbjtcblxuICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcblxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBNYXplLnNjYWxlW2tleV0gPSBsZXZlbC5zY2FsZVtrZXldO1xuICB9XG5cbiAgaWYgKGxldmVsLmZhc3RHZXROZWN0YXJBbmltYXRpb24pIHtcbiAgICBza2luLmFjdGlvblNwZWVkU2NhbGUubmVjdGFyID0gMC41O1xuICB9XG4gIC8vIE1lYXN1cmUgbWF6ZSBkaW1lbnNpb25zIGFuZCBzZXQgc2l6ZXMuXG4gIC8vIEluaXRpYWxpemUgdGhlIHdhbGxNYXAuXG4gIGluaXRXYWxsTWFwKCk7XG4gIC8vIFBpeGVsIGhlaWdodCBhbmQgd2lkdGggb2YgZWFjaCBtYXplIHNxdWFyZSAoaS5lLiB0aWxlKS5cbiAgTWF6ZS5TUVVBUkVfU0laRSA9IDUwO1xuICBNYXplLlBFR01BTl9IRUlHSFQgPSBza2luLnBlZ21hbkhlaWdodDtcbiAgTWF6ZS5QRUdNQU5fV0lEVEggPSBza2luLnBlZ21hbldpZHRoO1xuICBNYXplLlBFR01BTl9YX09GRlNFVCA9IHNraW4ucGVnbWFuWE9mZnNldCB8fCAwO1xuICBNYXplLlBFR01BTl9ZX09GRlNFVCA9IHNraW4ucGVnbWFuWU9mZnNldDtcbiAgLy8gSGVpZ2h0IGFuZCB3aWR0aCBvZiB0aGUgZ29hbCBhbmQgb2JzdGFjbGVzLlxuICBNYXplLk1BUktFUl9IRUlHSFQgPSA0MztcbiAgTWF6ZS5NQVJLRVJfV0lEVEggPSA1MDtcblxuICBNYXplLk1BWkVfV0lEVEggPSBNYXplLlNRVUFSRV9TSVpFICogTWF6ZS5tYXAuQ09MUztcbiAgTWF6ZS5NQVpFX0hFSUdIVCA9IE1hemUuU1FVQVJFX1NJWkUgKiBNYXplLm1hcC5ST1dTO1xuICBNYXplLlBBVEhfV0lEVEggPSBNYXplLlNRVUFSRV9TSVpFIC8gMztcbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSB3YWxsTWFwLiAgRm9yIGFueSBjZWxsIGF0IGxvY2F0aW9uIHgseSBNYXplLndhbGxNYXBbeV1beF0gd2lsbFxuICogYmUgdGhlIGluZGV4IG9mIHdoaWNoIHdhbGwgdGlsZSB0byB1c2UgZm9yIHRoYXQgY2VsbC4gIElmIHRoZSBjZWxsIGlzIG5vdCBhXG4gKiB3YWxsLCBNYXplLndhbGxNYXBbeV1beF0gaXMgdW5kZWZpbmVkLlxuICovXG52YXIgaW5pdFdhbGxNYXAgPSBmdW5jdGlvbigpIHtcbiAgTWF6ZS53YWxsTWFwID0gbmV3IEFycmF5KE1hemUubWFwLlJPV1MpO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgIE1hemUud2FsbE1hcFt5XSA9IG5ldyBBcnJheShNYXplLm1hcC5DT0xTKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQSURzIG9mIGFuaW1hdGlvbiB0YXNrcyBjdXJyZW50bHkgZXhlY3V0aW5nLlxuICovXG52YXIgdGltZW91dExpc3QgPSByZXF1aXJlKCcuLi90aW1lb3V0TGlzdCcpO1xuXG4vLyBNYXAgZWFjaCBwb3NzaWJsZSBzaGFwZSB0byBhIHNwcml0ZS5cbi8vIElucHV0OiBCaW5hcnkgc3RyaW5nIHJlcHJlc2VudGluZyBDZW50cmUvTm9ydGgvV2VzdC9Tb3V0aC9FYXN0IHNxdWFyZXMuXG4vLyBPdXRwdXQ6IFt4LCB5XSBjb29yZGluYXRlcyBvZiBlYWNoIHRpbGUncyBzcHJpdGUgaW4gdGlsZXMucG5nLlxudmFyIFRJTEVfU0hBUEVTID0ge1xuICAnMTAwMTAnOiBbNCwgMF0sICAvLyBEZWFkIGVuZHNcbiAgJzEwMDAxJzogWzMsIDNdLFxuICAnMTEwMDAnOiBbMCwgMV0sXG4gICcxMDEwMCc6IFswLCAyXSxcbiAgJzExMDEwJzogWzQsIDFdLCAgLy8gVmVydGljYWxcbiAgJzEwMTAxJzogWzMsIDJdLCAgLy8gSG9yaXpvbnRhbFxuICAnMTAxMTAnOiBbMCwgMF0sICAvLyBFbGJvd3NcbiAgJzEwMDExJzogWzIsIDBdLFxuICAnMTEwMDEnOiBbNCwgMl0sXG4gICcxMTEwMCc6IFsyLCAzXSxcbiAgJzExMTEwJzogWzEsIDFdLCAgLy8gSnVuY3Rpb25zXG4gICcxMDExMSc6IFsxLCAwXSxcbiAgJzExMDExJzogWzIsIDFdLFxuICAnMTExMDEnOiBbMSwgMl0sXG4gICcxMTExMSc6IFsyLCAyXSwgIC8vIENyb3NzXG4gICdudWxsMCc6IFs0LCAzXSwgIC8vIEVtcHR5XG4gICdudWxsMSc6IFszLCAwXSxcbiAgJ251bGwyJzogWzMsIDFdLFxuICAnbnVsbDMnOiBbMCwgM10sXG4gICdudWxsNCc6IFsxLCAzXSxcbn07XG5cbmZ1bmN0aW9uIGRyYXdNYXAgKCkge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcbiAgdmFyIHgsIHksIGssIHRpbGU7XG5cbiAgLy8gRHJhdyB0aGUgb3V0ZXIgc3F1YXJlLlxuICB2YXIgc3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgc3F1YXJlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLk1BWkVfV0lEVEgpO1xuICBzcXVhcmUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLk1BWkVfSEVJR0hUKTtcbiAgc3F1YXJlLnNldEF0dHJpYnV0ZSgnZmlsbCcsICcjRjFFRUU3Jyk7XG4gIHNxdWFyZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIDEpO1xuICBzcXVhcmUuc2V0QXR0cmlidXRlKCdzdHJva2UnLCAnI0NDQicpO1xuICBzdmcuYXBwZW5kQ2hpbGQoc3F1YXJlKTtcblxuICAvLyBBZGp1c3Qgb3V0ZXIgZWxlbWVudCBzaXplLlxuICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFaRV9XSURUSCk7XG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFaRV9IRUlHSFQpO1xuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSBNYXplLk1BWkVfV0lEVEggKyAncHgnO1xuXG4gIGlmIChza2luLmJhY2tncm91bmQpIHtcbiAgICB0aWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYmFja2dyb3VuZCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFaRV9IRUlHSFQpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFaRV9XSURUSCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3gnLCAwKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneScsIDApO1xuICAgIHN2Zy5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgfVxuXG4gIGRyYXdNYXBUaWxlcyhzdmcpO1xuXG4gIC8vIFBlZ21hbidzIGNsaXBQYXRoIGVsZW1lbnQsIHdob3NlICh4LCB5KSBpcyByZXNldCBieSBNYXplLmRpc3BsYXlQZWdtYW5cbiAgdmFyIHBlZ21hbkNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnY2xpcFBhdGgnKTtcbiAgcGVnbWFuQ2xpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3BlZ21hbkNsaXBQYXRoJyk7XG4gIHZhciBjbGlwUmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdyZWN0Jyk7XG4gIGNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnY2xpcFJlY3QnKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuUEVHTUFOX1dJRFRIKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlBFR01BTl9IRUlHSFQpO1xuICBwZWdtYW5DbGlwLmFwcGVuZENoaWxkKGNsaXBSZWN0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKHBlZ21hbkNsaXApO1xuXG4gIC8vIEFkZCBwZWdtYW4uXG4gIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdpZCcsICdwZWdtYW4nKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3BlZ21hbi1sb2NhdGlvbicpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXZhdGFyKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuUEVHTUFOX0hFSUdIVCk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuUEVHTUFOX1dJRFRIICogMjEpOyAvLyA0OSAqIDIxID0gMTAyOVxuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJywgJ3VybCgjcGVnbWFuQ2xpcFBhdGgpJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChwZWdtYW5JY29uKTtcblxuICB2YXIgcGVnbWFuRmFkZW91dEFuaW1hdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdhbmltYXRlJyk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdpZCcsICdwZWdtYW5GYWRlb3V0QW5pbWF0aW9uJyk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVUeXBlJywgJ0NTUycpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlTmFtZScsICdvcGFjaXR5Jyk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdmcm9tJywgMSk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCd0bycsIDApO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnZHVyJywgJzFzJyk7XG4gIHBlZ21hbkZhZGVvdXRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdiZWdpbicsICdpbmRlZmluaXRlJyk7XG4gIHBlZ21hbkljb24uYXBwZW5kQ2hpbGQocGVnbWFuRmFkZW91dEFuaW1hdGlvbik7XG5cbiAgaWYgKE1hemUuZmluaXNoXyAmJiBza2luLmdvYWxJZGxlKSB7XG4gICAgLy8gQWRkIGZpbmlzaCBtYXJrZXIuXG4gICAgdmFyIGZpbmlzaE1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICAgIGZpbmlzaE1hcmtlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2ZpbmlzaCcpO1xuICAgIGZpbmlzaE1hcmtlci5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nb2FsSWRsZSk7XG4gICAgZmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5NQVJLRVJfSEVJR0hUKTtcbiAgICBmaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFSS0VSX1dJRFRIKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoZmluaXNoTWFya2VyKTtcbiAgfVxuXG4gIC8vIEFkZCB3YWxsIGhpdHRpbmcgYW5pbWF0aW9uXG4gIGlmIChza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uKSB7XG4gICAgdmFyIHdhbGxBbmltYXRpb25JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCdpZCcsICd3YWxsQW5pbWF0aW9uJyk7XG4gICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5TUVVBUkVfU0laRSk7XG4gICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZCh3YWxsQW5pbWF0aW9uSWNvbik7XG4gIH1cblxuICAvLyBBZGQgb2JzdGFjbGVzLlxuICB2YXIgb2JzSWQgPSAwO1xuICBmb3IgKHkgPSAwOyB5IDwgTWF6ZS5tYXAuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh4ID0gMDsgeCA8IE1hemUubWFwLkNPTFM7IHgrKykge1xuICAgICAgaWYgKE1hemUubWFwLmdldFRpbGUoeSwgeCkgPT0gU3F1YXJlVHlwZS5PQlNUQUNMRSkge1xuICAgICAgICB2YXIgb2JzSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGUnICsgb2JzSWQpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5NQVJLRVJfSEVJR0hUICogc2tpbi5vYnN0YWNsZVNjYWxlKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5NQVJLRVJfV0lEVEggKiBza2luLm9ic3RhY2xlU2NhbGUpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZU5TKFxuICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBza2luLm9ic3RhY2xlSWRsZSk7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF6ZS5TUVVBUkVfU0laRSAqICh4ICsgMC41KSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic0ljb24uZ2V0QXR0cmlidXRlKCd3aWR0aCcpIC8gMik7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF6ZS5TUVVBUkVfU0laRSAqICh5ICsgMC45KSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic0ljb24uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgICAgIHN2Zy5hcHBlbmRDaGlsZChvYnNJY29uKTtcbiAgICAgIH1cbiAgICAgICsrb2JzSWQ7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGlkbGUgcGVnbWFuLlxuICBpZiAoc2tpbi5pZGxlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgY3JlYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgIGlkU3RyOiAnaWRsZScsXG4gICAgICBwZWdtYW5JbWFnZTogc2tpbi5pZGxlUGVnbWFuQW5pbWF0aW9uLFxuICAgICAgcm93OiBNYXplLnN0YXJ0Xy55LFxuICAgICAgY29sOiBNYXplLnN0YXJ0Xy54LFxuICAgICAgZGlyZWN0aW9uOiBNYXplLnN0YXJ0RGlyZWN0aW9uLFxuICAgICAgbnVtQ29sUGVnbWFuOiBza2luLmlkbGVQZWdtYW5Db2wsXG4gICAgICBudW1Sb3dQZWdtYW46IHNraW4uaWRsZVBlZ21hblJvd1xuICAgIH0pO1xuXG5cbiAgICBpZiAoc2tpbi5pZGxlUGVnbWFuQ29sID4gMSB8fCBza2luLmlkbGVQZWdtYW5Sb3cgPiAxKSB7XG4gICAgICAvLyBvdXIgaWRsZSBpcyBhIHNwcml0ZSBzaGVldCBpbnN0ZWFkIG9mIGEgZ2lmLiBzY2hlZHVsZSBjeWNsaW5nIHRocm91Z2hcbiAgICAgIC8vIHRoZSBmcmFtZXNcbiAgICAgIHZhciBudW1GcmFtZXMgPSBza2luLmlkbGVQZWdtYW5Sb3c7XG4gICAgICB2YXIgaWRsZVBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWRsZVBlZ21hbicpO1xuICAgICAgdmFyIHRpbWVQZXJGcmFtZSA9IDYwMDsgLy8gdGltZUZvckFuaW1hdGlvbiAvIG51bUZyYW1lcztcbiAgICAgIHZhciBpZGxlQW5pbWF0aW9uRnJhbWUgPSAwO1xuXG4gICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlkbGVQZWdtYW5JY29uLmdldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScpID09PSAndmlzaWJsZScpIHtcbiAgICAgICAgICB1cGRhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgICAgICAgaWRTdHI6ICdpZGxlJyxcbiAgICAgICAgICAgIHJvdzogTWF6ZS5zdGFydF8ueSxcbiAgICAgICAgICAgIGNvbDogTWF6ZS5zdGFydF8ueCxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogTWF6ZS5zdGFydERpcmVjdGlvbixcbiAgICAgICAgICAgIGFuaW1hdGlvblJvdzogaWRsZUFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWRsZUFuaW1hdGlvbkZyYW1lID0gKGlkbGVBbmltYXRpb25GcmFtZSArIDEpICUgbnVtRnJhbWVzO1xuICAgICAgICB9XG4gICAgICB9LCB0aW1lUGVyRnJhbWUpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChza2luLmNlbGVicmF0ZUFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ2NlbGVicmF0ZScsXG4gICAgICBwZWdtYW5JbWFnZTogc2tpbi5jZWxlYnJhdGVBbmltYXRpb24sXG4gICAgICByb3c6IE1hemUuc3RhcnRfLnksXG4gICAgICBjb2w6IE1hemUuc3RhcnRfLngsXG4gICAgICBkaXJlY3Rpb246IERpcmVjdGlvbi5OT1JUSCxcbiAgICAgIG51bUNvbFBlZ21hbjogc2tpbi5jZWxlYnJhdGVQZWdtYW5Db2wsXG4gICAgICBudW1Sb3dQZWdtYW46IHNraW4uY2VsZWJyYXRlUGVnbWFuUm93XG4gICAgfSk7XG4gIH1cblxuICAvLyBBZGQgdGhlIGhpZGRlbiBkYXplZCBwZWdtYW4gd2hlbiBoaXR0aW5nIHRoZSB3YWxsLlxuICBpZiAoc2tpbi53YWxsUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgY3JlYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgIGlkU3RyOiAnd2FsbCcsXG4gICAgICBwZWdtYW5JbWFnZTogc2tpbi53YWxsUGVnbWFuQW5pbWF0aW9uXG4gICAgfSk7XG4gIH1cblxuICAvLyBjcmVhdGUgZWxlbWVudCBmb3Igb3VyIGhpdHRpbmcgd2FsbCBzcHJpdGVzaGVldFxuICBpZiAoc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbiAmJiBza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uRnJhbWVOdW1iZXIpIHtcbiAgICBjcmVhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgaWRTdHI6ICd3YWxsJyxcbiAgICAgIHBlZ21hbkltYWdlOiBza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uLFxuICAgICAgbnVtQ29sUGVnbWFuOiBza2luLmhpdHRpbmdXYWxsUGVnbWFuQ29sLFxuICAgICAgbnVtUm93UGVnbWFuOiBza2luLmhpdHRpbmdXYWxsUGVnbWFuUm93XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxQZWdtYW4nKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICAvLyBBZGQgdGhlIGhpZGRlbiBtb3ZpbmcgcGVnbWFuIGFuaW1hdGlvbi5cbiAgaWYgKHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ21vdmUnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvbixcbiAgICAgIG51bUNvbFBlZ21hbjogNCxcbiAgICAgIG51bVJvd1BlZ21hbjogOVxuICAgIH0pO1xuICB9XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgdGlsZSBhdCB4LHkgaXMgZWl0aGVyIGEgd2FsbCBvciBvdXQgb2YgYm91bmRzXG5mdW5jdGlvbiBpc1dhbGxPck91dE9mQm91bmRzIChjb2wsIHJvdykge1xuICByZXR1cm4gTWF6ZS5tYXAuZ2V0VGlsZShyb3csIGNvbCkgPT09IFNxdWFyZVR5cGUuV0FMTCB8fFxuICAgICAgTWF6ZS5tYXAuZ2V0VGlsZShyb3csIGNvbCkgPT09IHVuZGVmaW5lZDtcbn1cblxuLy8gUmV0dXJuIGEgdmFsdWUgb2YgJzAnIGlmIHRoZSBzcGVjaWZpZWQgc3F1YXJlIGlzIHdhbGwgb3Igb3V0IG9mIGJvdW5kcyAnMSdcbi8vIG90aGVyd2lzZSAoZW1wdHksIG9ic3RhY2xlLCBzdGFydCwgZmluaXNoKS5cbmZ1bmN0aW9uIGlzT25QYXRoU3RyICh4LCB5KSB7XG4gIHJldHVybiBpc1dhbGxPck91dE9mQm91bmRzKHgsIHkpID8gXCIwXCIgOiBcIjFcIjtcbn1cblxuLy8gRHJhdyB0aGUgdGlsZXMgbWFraW5nIHVwIHRoZSBtYXplIG1hcC5cbmZ1bmN0aW9uIGRyYXdNYXBUaWxlcyhzdmcpIHtcbiAgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgIHJldHVybiBNYXplLndvcmRTZWFyY2guZHJhd01hcFRpbGVzKHN2Zyk7XG4gIH0gZWxzZSBpZiAobWF6ZVV0aWxzLmlzU2NyYXRTa2luKHNraW4uaWQpKSB7XG4gICAgcmV0dXJuIHNjcmF0LmRyYXdNYXBUaWxlcyhzdmcpO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSBhbmQgZHJhdyB0aGUgdGlsZSBmb3IgZWFjaCBzcXVhcmUuXG4gIHZhciB0aWxlSWQgPSAwO1xuICB2YXIgdGlsZSwgb3JpZ1RpbGU7XG4gIGZvciAodmFyIHkgPSAwOyB5IDwgTWF6ZS5tYXAuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgIC8vIENvbXB1dGUgdGhlIHRpbGUgaW5kZXguXG4gICAgICB0aWxlID0gaXNPblBhdGhTdHIoeCwgeSkgK1xuICAgICAgICBpc09uUGF0aFN0cih4LCB5IC0gMSkgKyAgLy8gTm9ydGguXG4gICAgICAgIGlzT25QYXRoU3RyKHggKyAxLCB5KSArICAvLyBXZXN0LlxuICAgICAgICBpc09uUGF0aFN0cih4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgIGlzT25QYXRoU3RyKHggLSAxLCB5KTsgICAvLyBFYXN0LlxuXG4gICAgICB2YXIgYWRqYWNlbnRUb1BhdGggPSAodGlsZSAhPT0gJzAwMDAwJyk7XG5cbiAgICAgIC8vIERyYXcgdGhlIHRpbGUuXG4gICAgICBpZiAoIVRJTEVfU0hBUEVTW3RpbGVdKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgYW4gZW1wdHkgc3F1YXJlLiBIYW5kbGUgaXQgZGlmZmVyZW50bHkgYmFzZWQgb24gc2tpbi5cbiAgICAgICAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oc2tpbi5pZCkpIHtcbiAgICAgICAgICAvLyBiZWdpbiB3aXRoIHRocmVlIHRyZWVzXG4gICAgICAgICAgdmFyIHRpbGVDaG9pY2VzID0gWydudWxsMycsICdudWxsNCcsICdudWxsMCddO1xuICAgICAgICAgIHZhciBub1RyZWUgPSAnbnVsbDEnO1xuICAgICAgICAgIC8vIHdhbnQgaXQgdG8gYmUgbW9yZSBsaWtlbHkgdG8gaGF2ZSBhIHRyZWUgd2hlbiBhZGphY2VudCB0byBwYXRoXG4gICAgICAgICAgdmFyIG4gPSBhZGphY2VudFRvUGF0aCA/IHRpbGVDaG9pY2VzLmxlbmd0aCAqIDIgOiB0aWxlQ2hvaWNlcy5sZW5ndGggKiA2O1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB0aWxlQ2hvaWNlcy5wdXNoKG5vVHJlZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGlsZSA9IF8uc2FtcGxlKHRpbGVDaG9pY2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFbXB0eSBzcXVhcmUuICBVc2UgbnVsbDAgZm9yIGxhcmdlIGFyZWFzLCB3aXRoIG51bGwxLTQgZm9yIGJvcmRlcnMuXG4gICAgICAgICAgaWYgKCFhZGphY2VudFRvUGF0aCAmJiBNYXRoLnJhbmRvbSgpID4gMC4zKSB7XG4gICAgICAgICAgICBNYXplLndhbGxNYXBbeV1beF0gPSAwO1xuICAgICAgICAgICAgdGlsZSA9ICdudWxsMCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB3YWxsSWR4ID0gTWF0aC5mbG9vcigxICsgTWF0aC5yYW5kb20oKSAqIDQpO1xuICAgICAgICAgICAgTWF6ZS53YWxsTWFwW3ldW3hdID0gd2FsbElkeDtcbiAgICAgICAgICAgIHRpbGUgPSAnbnVsbCcgKyB3YWxsSWR4O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZvciB0aGUgZmlyc3QgMyBsZXZlbHMgaW4gbWF6ZSwgb25seSBzaG93IHRoZSBudWxsMCBpbWFnZS5cbiAgICAgICAgICBpZiAobGV2ZWwuaWQgPT0gJzJfMScgfHwgbGV2ZWwuaWQgPT0gJzJfMicgfHwgbGV2ZWwuaWQgPT0gJzJfMycpIHtcbiAgICAgICAgICAgIE1hemUud2FsbE1hcFt5XVt4XSA9IDA7XG4gICAgICAgICAgICB0aWxlID0gJ251bGwwJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgTWF6ZS5kcmF3VGlsZShzdmcsIFRJTEVfU0hBUEVTW3RpbGVdLCB5LCB4LCB0aWxlSWQpO1xuXG4gICAgICAvLyBEcmF3IGNoZWNrZXJib2FyZCBmb3IgYmVlLlxuICAgICAgaWYgKE1hemUuZ3JpZEl0ZW1EcmF3ZXIgaW5zdGFuY2VvZiBCZWVJdGVtRHJhd2VyICYmICh4ICsgeSkgJSAyID09PSAwKSB7XG4gICAgICAgIHZhciBpc1BhdGggPSAhL251bGwvLnRlc3QodGlsZSk7XG4gICAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIuYWRkQ2hlY2tlcmJvYXJkVGlsZSh5LCB4LCBpc1BhdGgpO1xuICAgICAgfVxuXG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEcmF3IHRoZSBnaXZlbiB0aWxlIGF0IHJvdywgY29sXG4gKi9cbk1hemUuZHJhd1RpbGUgPSBmdW5jdGlvbiAoc3ZnLCB0aWxlU2hlZXRMb2NhdGlvbiwgcm93LCBjb2wsIHRpbGVJZCkge1xuICB2YXIgbGVmdCA9IHRpbGVTaGVldExvY2F0aW9uWzBdO1xuICB2YXIgdG9wID0gdGlsZVNoZWV0TG9jYXRpb25bMV07XG5cbiAgdmFyIHRpbGVTaGVldFdpZHRoID0gTWF6ZS5TUVVBUkVfU0laRSAqIDU7XG4gIHZhciB0aWxlU2hlZXRIZWlnaHQgPSBNYXplLlNRVUFSRV9TSVpFICogNDtcblxuICAvLyBUaWxlJ3MgY2xpcFBhdGggZWxlbWVudC5cbiAgdmFyIHRpbGVDbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2NsaXBQYXRoJyk7XG4gIHRpbGVDbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAndGlsZUNsaXBQYXRoJyArIHRpbGVJZCk7XG4gIHZhciB0aWxlQ2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuU1FVQVJFX1NJWkUpO1xuICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlNRVUFSRV9TSVpFKTtcblxuICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd4JywgY29sICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHRpbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBNYXplLlNRVUFSRV9TSVpFKTtcbiAgdGlsZUNsaXAuYXBwZW5kQ2hpbGQodGlsZUNsaXBSZWN0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKHRpbGVDbGlwKTtcblxuICAvLyBUaWxlIHNwcml0ZS5cbiAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAndGlsZUVsZW1lbnQnICsgdGlsZUlkKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4udGlsZXMpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRpbGVTaGVldEhlaWdodCk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aWxlU2hlZXRXaWR0aCk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cmwoI3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQgKyAnKScpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3gnLCAoY29sIC0gbGVmdCkgKiBNYXplLlNRVUFSRV9TSVpFKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd5JywgKHJvdyAtIHRvcCkgKiBNYXplLlNRVUFSRV9TSVpFKTtcbiAgc3ZnLmFwcGVuZENoaWxkKHRpbGVFbGVtZW50KTtcbiAgLy8gVGlsZSBhbmltYXRpb25cbiAgdmFyIHRpbGVBbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnYW5pbWF0ZScpO1xuICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnaWQnLCAndGlsZUFuaW1hdGlvbicgKyB0aWxlSWQpO1xuICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlVHlwZScsICdDU1MnKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZU5hbWUnLCAnb3BhY2l0eScpO1xuICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnZnJvbScsIDEpO1xuICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgndG8nLCAwKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2R1cicsICcxcycpO1xuICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYmVnaW4nLCAnaW5kZWZpbml0ZScpO1xuICB0aWxlRWxlbWVudC5hcHBlbmRDaGlsZCh0aWxlQW5pbWF0aW9uKTtcbn07XG5cbi8qKlxuICogUmVkcmF3IGFsbCBkaXJ0IGltYWdlc1xuICogQHBhcmFtIHtib29sZWFufSBydW5uaW5nIFdoZXRoZXIgb3Igbm90IHVzZXIgcHJvZ3JhbSBpcyBjdXJyZW50bHkgcnVubmluZ1xuICovXG5mdW5jdGlvbiByZXNldERpcnRJbWFnZXMocnVubmluZykge1xuICBNYXplLm1hcC5mb3JFYWNoQ2VsbChmdW5jdGlvbiAoY2VsbCwgcm93LCBjb2wpIHtcbiAgICBpZiAoY2VsbC5pc0RpcnQoKSkge1xuICAgICAgTWF6ZS5ncmlkSXRlbURyYXdlci51cGRhdGVJdGVtSW1hZ2Uocm93LCBjb2wsIHJ1bm5pbmcpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBCbG9ja2x5IGFuZCB0aGUgbWF6ZS4gIENhbGxlZCBvbiBwYWdlIGxvYWQuXG4gKi9cbk1hemUuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucnVuQnV0dG9uQ2xpY2sgPSB0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5yZXNldCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcblxuICB2YXIgZXh0cmFDb250cm9sUm93cyA9IG51bGw7XG5cbiAgc2tpbiA9IGNvbmZpZy5za2luO1xuICBsZXZlbCA9IGNvbmZpZy5sZXZlbDtcblxuICBjb25maWcuZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzID0gdHJ1ZTtcbiAgY29uZmlnLmZvcmNlSW5zZXJ0VG9wQmxvY2sgPSAnd2hlbl9ydW4nO1xuICBjb25maWcuZHJvcGxldENvbmZpZyA9IGRyb3BsZXRDb25maWc7XG5cbiAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oY29uZmlnLnNraW5JZCkpIHtcbiAgICBNYXplLmJlZSA9IG5ldyBCZWUoTWF6ZSwgc3R1ZGlvQXBwLCBjb25maWcpO1xuICAgIC8vIE92ZXJyaWRlIGRlZmF1bHQgc3RlcFNwZWVkXG4gICAgTWF6ZS5zY2FsZS5zdGVwU3BlZWQgPSAyO1xuICB9IGVsc2UgaWYgKGNvbmZpZy5za2luSWQgPT09ICdsZXR0ZXJzJykge1xuICAgIE1hemUud29yZFNlYXJjaCA9IG5ldyBXb3JkU2VhcmNoKGxldmVsLnNlYXJjaFdvcmQsIGxldmVsLm1hcCwgTWF6ZS5kcmF3VGlsZSk7XG4gICAgZXh0cmFDb250cm9sUm93cyA9IHJlcXVpcmUoJy4vZXh0cmFDb250cm9sUm93cy5odG1sLmVqcycpKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBzZWFyY2hXb3JkOiBsZXZlbC5zZWFyY2hXb3JkXG4gICAgfSk7XG4gIH1cbiAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oY29uZmlnLnNraW5JZCkpIHtcbiAgICBNYXplLmNlbGxDbGFzcyA9IEJlZUNlbGw7XG4gIH0gZWxzZSB7XG4gICAgTWF6ZS5jZWxsQ2xhc3MgPSBDZWxsO1xuICB9XG5cbiAgbG9hZExldmVsKCk7XG5cbiAgTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcyA9IFtdO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ub2JzdGFjbGVTb3VuZCwgJ29ic3RhY2xlJyk7XG4gICAgLy8gTG9hZCB3YWxsIHNvdW5kcy5cbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbFNvdW5kLCAnd2FsbCcpO1xuXG4gICAgLy8gdG9kbyAtIGxvbmd0ZXJtLCBpbnN0ZWFkIG9mIGhhdmluZyBzb3VuZCByZWxhdGVkIGZsYWdzIHdlIHNob3VsZCBqdXN0XG4gICAgLy8gaGF2ZSB0aGUgc2tpbiB0ZWxsIHVzIHRoZSBzZXQgb2Ygc291bmRzIGl0IG5lZWRzXG4gICAgaWYgKHNraW4uYWRkaXRpb25hbFNvdW5kKSB7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDBTb3VuZCwgJ3dhbGwwJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDFTb3VuZCwgJ3dhbGwxJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDJTb3VuZCwgJ3dhbGwyJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDNTb3VuZCwgJ3dhbGwzJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbDRTb3VuZCwgJ3dhbGw0Jyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luR29hbFNvdW5kLCAnd2luR29hbCcpO1xuICAgIH1cbiAgICBpZiAoc2tpbi5kaXJ0U291bmQpIHtcbiAgICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5maWxsU291bmQsICdmaWxsJyk7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZGlnU291bmQsICdkaWcnKTtcbiAgICB9XG4gICAgaWYgKHNraW4uYmVlU291bmQpIHtcbiAgICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5uZWN0YXJTb3VuZCwgJ25lY3RhcicpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmhvbmV5U291bmQsICdob25leScpO1xuICAgIH1cbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoc3R1ZGlvQXBwLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHJpY2huZXNzIG9mIGJsb2NrIGNvbG91cnMsIHJlZ2FyZGxlc3Mgb2YgdGhlIGh1ZS5cbiAgICAgICAqIE1PT0MgYmxvY2tzIHNob3VsZCBiZSBicmlnaHRlciAodGFyZ2V0IGF1ZGllbmNlIGlzIHlvdW5nZXIpLlxuICAgICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAgICogQmxvY2tseSdzIGRlZmF1bHQgaXMgMC40NS5cbiAgICAgICAqL1xuICAgICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgICAgQmxvY2tseS5TTkFQX1JBRElVUyAqPSBNYXplLnNjYWxlLnNuYXBSYWRpdXM7XG4gICAgICBCbG9ja2x5LkphdmFTY3JpcHQuSU5GSU5JVEVfTE9PUF9UUkFQID0gY29kZWdlbi5sb29wSGlnaGxpZ2h0KFwiTWF6ZVwiKTtcbiAgICB9XG5cbiAgICBNYXplLnN0YXJ0XyA9IHVuZGVmaW5lZDtcbiAgICBNYXplLmZpbmlzaF8gPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBMb2NhdGUgdGhlIHN0YXJ0IGFuZCBmaW5pc2ggc3F1YXJlcy5cbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgICAgdmFyIGNlbGwgPSBNYXplLm1hcC5nZXRUaWxlKHksIHgpO1xuICAgICAgICBpZiAoY2VsbCA9PSBTcXVhcmVUeXBlLlNUQVJUKSB7XG4gICAgICAgICAgTWF6ZS5zdGFydF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgIH0gZWxzZSBpZiAoY2VsbCA9PT0gU3F1YXJlVHlwZS5GSU5JU0gpIHtcbiAgICAgICAgICBNYXplLmZpbmlzaF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgIH0gZWxzZSBpZiAoY2VsbCA9PSBTcXVhcmVUeXBlLlNUQVJUQU5ERklOSVNIKSB7XG4gICAgICAgICAgTWF6ZS5zdGFydF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgICAgTWF6ZS5maW5pc2hfID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgTWF6ZS5tYXAucmVzZXREaXJ0KCk7XG5cbiAgICBpZiAobWF6ZVV0aWxzLmlzQmVlU2tpbihjb25maWcuc2tpbklkKSkge1xuICAgICAgTWF6ZS5ncmlkSXRlbURyYXdlciA9IG5ldyBCZWVJdGVtRHJhd2VyKE1hemUubWFwLCBza2luLCBNYXplLmJlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIgPSBuZXcgRGlydERyYXdlcihNYXplLm1hcCwgc2tpbi5kaXJ0KTtcbiAgICB9XG5cbiAgICBkcmF3TWFwKCk7XG5cbiAgICB2YXIgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGVwQnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChzdGVwQnV0dG9uLCBzdGVwQnV0dG9uQ2xpY2spO1xuXG4gICAgLy8gYmFzZSdzIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmUgY2FsbGVkIGZpcnN0XG4gICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChyZXNldEJ1dHRvbiwgTWF6ZS5yZXNldEJ1dHRvbkNsaWNrKTtcblxuICAgIGlmIChza2luLmhpZGVJbnN0cnVjdGlvbnMpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnViYmxlXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHJlbmRlckNvZGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNvZGVXb3Jrc3BhY2VFanMoe1xuICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgIGJsb2NrVXNlZDogdW5kZWZpbmVkLFxuICAgICAgICBpZGVhbEJsb2NrTnVtYmVyOiB1bmRlZmluZWQsXG4gICAgICAgIGVkaXRDb2RlOiBsZXZlbC5lZGl0Q29kZSxcbiAgICAgICAgYmxvY2tDb3VudGVyQ2xhc3M6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlbmRlclZpc3VhbGl6YXRpb25Db2x1bW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZpc3VhbGl6YXRpb25Db2x1bW5FanMoe1xuICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7XG4gICAgICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgICAgICBzaG93U3RlcEJ1dHRvbjogbGV2ZWwuc3RlcCAmJiAhbGV2ZWwuZWRpdF9ibG9ja3NcbiAgICAgICAgfSksXG4gICAgICAgIGV4dHJhQ29udHJvbFJvd3M6IGV4dHJhQ29udHJvbFJvd3NcbiAgICAgIH0sXG4gICAgICBoaWRlUnVuQnV0dG9uOiBsZXZlbC5zdGVwT25seSAmJiAhbGV2ZWwuZWRpdF9ibG9ja3NcbiAgICB9KTtcbiAgfTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiBzdHVkaW9BcHAuaW5pdC5iaW5kKHN0dWRpb0FwcCwgY29uZmlnKVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSBhIGNsaWNrIG9uIHRoZSBzdGVwIGJ1dHRvbi4gIElmIHdlJ3JlIGFscmVhZHkgYW5pbWF0aW5nLCB3ZSBzaG91bGRcbiAqIHBlcmZvcm0gYSBzaW5nbGUgc3RlcC4gIE90aGVyd2lzZSwgd2UgY2FsbCBiZWdpbkF0dGVtcHQgd2hpY2ggd2lsbCBkb1xuICogc29tZSBpbml0aWFsIHNldHVwLCBhbmQgdGhlbiBwZXJmb3JtIHRoZSBmaXJzdCBzdGVwLlxuICovXG5mdW5jdGlvbiBzdGVwQnV0dG9uQ2xpY2soKSB7XG4gIHZhciBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKTtcbiAgc3RlcEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpO1xuXG4gIGlmIChNYXplLmFuaW1hdGluZ18pIHtcbiAgICBNYXplLnNjaGVkdWxlQW5pbWF0aW9ucyh0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBNYXplLmV4ZWN1dGUodHJ1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHkgY29vcmRpbmF0ZXMgZm9yIHBlZ21hbiBzcHJpdGUuXG4gKi9cbnZhciBnZXRQZWdtYW5ZRm9yUm93ID0gZnVuY3Rpb24gKG1hemVSb3cpIHtcbiAgdmFyIHkgPSBNYXplLlNRVUFSRV9TSVpFICogKG1hemVSb3cgKyAwLjUpIC0gTWF6ZS5QRUdNQU5fSEVJR0hUIC8gMiArXG4gICAgTWF6ZS5QRUdNQU5fWV9PRkZTRVQ7XG4gIHJldHVybiBNYXRoLmZsb29yKHkpO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIFkgb2Zmc2V0IHdpdGhpbiB0aGUgc2hlZXRcbiAqL1xudmFyIGdldFBlZ21hbkZyYW1lT2Zmc2V0WSA9IGZ1bmN0aW9uIChhbmltYXRpb25Sb3cpIHtcbiAgYW5pbWF0aW9uUm93ID0gYW5pbWF0aW9uUm93IHx8IDA7XG4gIHJldHVybiBhbmltYXRpb25Sb3cgKiBNYXplLlBFR01BTl9IRUlHSFQ7XG59O1xuXG4vKipcbiAgKiBDcmVhdGUgc3ByaXRlIGFzc2V0cyBmb3IgcGVnbWFuLlxuICAqIEBwYXJhbSBvcHRpb25zIFNwZWNpZnkgZGlmZmVyZW50IGZlYXR1cmVzIG9mIHRoZSBwZWdtYW4gYW5pbWF0aW9uLlxuICAqIGlkU3RyIHJlcXVpcmVkIGlkZW50aWZpZXIgZm9yIHRoZSBwZWdtYW4uXG4gICogcGVnbWFuSW1hZ2UgcmVxdWlyZWQgd2hpY2ggaW1hZ2UgdG8gdXNlIGZvciB0aGUgYW5pbWF0aW9uLlxuICAqIGNvbCB3aGljaCBjb2x1bW4gdGhlIHBlZ21hbiBpcyBhdC5cbiAgKiByb3cgd2hpY2ggcm93IHRoZSBwZWdtYW4gaXMgYXQuXG4gICogZGlyZWN0aW9uIHdoaWNoIGRpcmVjdGlvbiB0aGUgcGVnbWFuIGlzIGZhY2luZyBhdC5cbiAgKiBudW1Db2xQZWdtYW4gbnVtYmVyIG9mIHRoZSBwZWdtYW4gaW4gZWFjaCByb3csIGRlZmF1bHQgaXMgNC5cbiAgKiBudW1Sb3dQZWdtYW4gbnVtYmVyIG9mIHRoZSBwZWdtYW4gaW4gZWFjaCBjb2x1bW4sIGRlZmF1bHQgaXMgMS5cbiAgKi9cbnZhciBjcmVhdGVQZWdtYW5BbmltYXRpb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuICAvLyBDcmVhdGUgY2xpcCBwYXRoLlxuICB2YXIgY2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdjbGlwUGF0aCcpO1xuICBjbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCBvcHRpb25zLmlkU3RyICsgJ1BlZ21hbkNsaXAnKTtcbiAgdmFyIHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnaWQnLCBvcHRpb25zLmlkU3RyICsgJ1BlZ21hbkNsaXBSZWN0Jyk7XG4gIGlmIChvcHRpb25zLmNvbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCBvcHRpb25zLmNvbCAqIE1hemUuU1FVQVJFX1NJWkUgKyAxICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQpO1xuICB9XG4gIGlmIChvcHRpb25zLnJvdyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCBnZXRQZWdtYW5ZRm9yUm93KG9wdGlvbnMucm93KSk7XG4gIH1cbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5QRUdNQU5fV0lEVEgpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5QRUdNQU5fSEVJR0hUKTtcbiAgY2xpcC5hcHBlbmRDaGlsZChyZWN0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKGNsaXApO1xuICAvLyBDcmVhdGUgaW1hZ2UuXG4gIHZhciBpbWdTcmMgPSBvcHRpb25zLnBlZ21hbkltYWdlO1xuICB2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gIGltZy5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBpbWdTcmMpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlBFR01BTl9IRUlHSFQgKiAob3B0aW9ucy5udW1Sb3dQZWdtYW4gfHwgMSkpO1xuICBpbWcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuUEVHTUFOX1dJRFRIICogKG9wdGlvbnMubnVtQ29sUGVnbWFuIHx8IDQpKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJywgJ3VybCgjJyArIG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuQ2xpcCknKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnaWQnLCBvcHRpb25zLmlkU3RyICsgJ1BlZ21hbicpO1xuICBzdmcuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgLy8gVXBkYXRlIHBlZ21hbiBpY29uICYgY2xpcCBwYXRoLlxuICBpZiAob3B0aW9ucy5jb2wgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmRpcmVjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHggPSBNYXplLlNRVUFSRV9TSVpFICogb3B0aW9ucy5jb2wgLVxuICAgICAgb3B0aW9ucy5kaXJlY3Rpb24gKiBNYXplLlBFR01BTl9XSURUSCArIDEgICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQ7XG4gICAgaW1nLnNldEF0dHJpYnV0ZSgneCcsIHgpO1xuICB9XG4gIGlmIChvcHRpb25zLnJvdyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaW1nLnNldEF0dHJpYnV0ZSgneScsIGdldFBlZ21hbllGb3JSb3cob3B0aW9ucy5yb3cpKTtcbiAgfVxufTtcblxuLyoqXG4gICogVXBkYXRlIHNwcml0ZSBhc3NldHMgZm9yIHBlZ21hbi5cbiAgKiBAcGFyYW0gb3B0aW9ucyBTcGVjaWZ5IGRpZmZlcmVudCBmZWF0dXJlcyBvZiB0aGUgcGVnbWFuIGFuaW1hdGlvbi5cbiAgKiBpZFN0ciByZXF1aXJlZCBpZGVudGlmaWVyIGZvciB0aGUgcGVnbWFuLlxuICAqIGNvbCByZXF1aXJlZCB3aGljaCBjb2x1bW4gdGhlIHBlZ21hbiBpcyBhdC5cbiAgKiByb3cgcmVxdWlyZWQgd2hpY2ggcm93IHRoZSBwZWdtYW4gaXMgYXQuXG4gICogZGlyZWN0aW9uIHJlcXVpcmVkIHdoaWNoIGRpcmVjdGlvbiB0aGUgcGVnbWFuIGlzIGZhY2luZyBhdC5cbiAgKiBhbmltYXRpb25Sb3cgd2hpY2ggcm93IG9mIHRoZSBzcHJpdGUgc2hlZXQgdGhlIHBlZ21hbiBhbmltYXRpb24gbmVlZHNcbiAgKi9cbnZhciB1cGRhdGVQZWdtYW5BbmltYXRpb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciByZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0aW9ucy5pZFN0ciArICdQZWdtYW5DbGlwUmVjdCcpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIG9wdGlvbnMuY29sICogTWF6ZS5TUVVBUkVfU0laRSArIDEgKyBNYXplLlBFR01BTl9YX09GRlNFVCk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd5JywgZ2V0UGVnbWFuWUZvclJvdyhvcHRpb25zLnJvdykpO1xuICB2YXIgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0aW9ucy5pZFN0ciArICdQZWdtYW4nKTtcbiAgdmFyIHggPSBNYXplLlNRVUFSRV9TSVpFICogb3B0aW9ucy5jb2wgLVxuICAgICAgb3B0aW9ucy5kaXJlY3Rpb24gKiBNYXplLlBFR01BTl9XSURUSCArIDEgKyBNYXplLlBFR01BTl9YX09GRlNFVDtcbiAgaW1nLnNldEF0dHJpYnV0ZSgneCcsIHgpO1xuICB2YXIgeSA9IGdldFBlZ21hbllGb3JSb3cob3B0aW9ucy5yb3cpIC0gZ2V0UGVnbWFuRnJhbWVPZmZzZXRZKG9wdGlvbnMuYW5pbWF0aW9uUm93KTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgneScsIHkpO1xuICBpbWcuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIG1hemUgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uIGFuZCBraWxsIGFueSBwZW5kaW5nIGFuaW1hdGlvbiB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlyc3QgVHJ1ZSBpZiBhbiBvcGVuaW5nIGFuaW1hdGlvbiBpcyB0byBiZSBwbGF5ZWQuXG4gKi9cbk1hemUucmVzZXQgPSBmdW5jdGlvbihmaXJzdCkge1xuICBpZiAoTWF6ZS5iZWUpIHtcbiAgICAvLyBCZWUgbmVlZHMgdG8gcmVzZXQgaXRzZWxmIGFuZCBzdGlsbCBydW4gc3R1ZGlvQXBwLnJlc2V0IGxvZ2ljXG4gICAgTWF6ZS5iZWUucmVzZXQoKTtcbiAgfVxuXG4gIHZhciBpO1xuICAvLyBLaWxsIGFsbCB0YXNrcy5cbiAgdGltZW91dExpc3QuY2xlYXJUaW1lb3V0cygpO1xuXG4gIE1hemUuYW5pbWF0aW5nXyA9IGZhbHNlO1xuXG4gIC8vIE1vdmUgUGVnbWFuIGludG8gcG9zaXRpb24uXG4gIE1hemUucGVnbWFuWCA9IE1hemUuc3RhcnRfLng7XG4gIE1hemUucGVnbWFuWSA9IE1hemUuc3RhcnRfLnk7XG5cbiAgTWF6ZS5wZWdtYW5EID0gTWF6ZS5zdGFydERpcmVjdGlvbjtcbiAgaWYgKGZpcnN0KSB7XG4gICAgLy8gRGFuY2UgY29uc2lzdHMgb2YgNSBhbmltYXRpb25zLCBlYWNoIG9mIHdoaWNoIGdldCAxNTBtc1xuICAgIHZhciBkYW5jZVRpbWUgPSAxNTAgKiA1O1xuICAgIGlmIChza2luLmRhbmNlT25Mb2FkKSB7XG4gICAgICBzY2hlZHVsZURhbmNlKGZhbHNlLCBkYW5jZVRpbWUpO1xuICAgIH1cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgc3RlcFNwZWVkID0gMTAwO1xuICAgICAgTWF6ZS5zY2hlZHVsZVR1cm4oTWF6ZS5zdGFydERpcmVjdGlvbik7XG4gICAgfSwgZGFuY2VUaW1lICsgMTUwKTtcbiAgfSBlbHNlIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoTWF6ZS5wZWdtYW5EKSk7XG4gIH1cblxuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcblxuICB2YXIgZmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gnKTtcbiAgaWYgKGZpbmlzaEljb24pIHtcbiAgICAvLyBNb3ZlIHRoZSBmaW5pc2ggaWNvbiBpbnRvIHBvc2l0aW9uLlxuICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlKCd4JywgTWF6ZS5TUVVBUkVfU0laRSAqIChNYXplLmZpbmlzaF8ueCArIDAuNSkgLVxuICAgICAgZmluaXNoSWNvbi5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykgLyAyKTtcbiAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZSgneScsIE1hemUuU1FVQVJFX1NJWkUgKiAoTWF6ZS5maW5pc2hfLnkgKyAwLjkpIC1cbiAgICAgIGZpbmlzaEljb24uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW4uZ29hbElkbGUpO1xuICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgfVxuXG4gIC8vIE1ha2UgJ2xvb2snIGljb24gaW52aXNpYmxlIGFuZCBwcm9tb3RlIHRvIHRvcC5cbiAgdmFyIGxvb2tJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvb2snKTtcbiAgbG9va0ljb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgbG9va0ljb24ucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChsb29rSWNvbik7XG4gIHZhciBwYXRocyA9IGxvb2tJY29uLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwYXRoJyk7XG4gIGZvciAoaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwYXRoID0gcGF0aHNbaV07XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIHNraW4ubG9vayk7XG4gIH1cblxuICAvLyBSZXNldCBwZWdtYW4ncyB2aXNpYmlsaXR5LlxuICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxKTtcblxuICBpZiAoc2tpbi5pZGxlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgdmFyIGlkbGVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lkbGVQZWdtYW4nKTtcbiAgICBpZGxlUGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICB9IGVsc2Uge1xuICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgfVxuXG4gIGlmIChza2luLndhbGxQZWdtYW5BbmltYXRpb24pIHtcbiAgICB2YXIgd2FsbFBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2FsbFBlZ21hbicpO1xuICAgIHdhbGxQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIGlmIChza2luLm1vdmVQZWdtYW5BbmltYXRpb24pIHtcbiAgICB2YXIgbW92ZVBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW92ZVBlZ21hbicpO1xuICAgIG1vdmVQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIGlmIChza2luLmNlbGVicmF0ZUFuaW1hdGlvbikge1xuICAgIHZhciBjZWxlYnJhdGVBbmltYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2VsZWJyYXRlUGVnbWFuJyk7XG4gICAgY2VsZWJyYXRlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIC8vIE1vdmUgdGhlIGluaXQgZGlydCBtYXJrZXIgaWNvbnMgaW50byBwb3NpdGlvbi5cbiAgTWF6ZS5tYXAucmVzZXREaXJ0KCk7XG4gIHJlc2V0RGlydEltYWdlcyhmYWxzZSk7XG5cbiAgLy8gUmVzZXQgdGhlIG9ic3RhY2xlIGltYWdlLlxuICB2YXIgb2JzSWQgPSAwO1xuICB2YXIgeCwgeTtcbiAgZm9yICh5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgIHZhciBvYnNJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICAgIGlmIChvYnNJY29uKSB7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5vYnN0YWNsZUlkbGUpO1xuICAgICAgfVxuICAgICAgKytvYnNJZDtcbiAgICB9XG4gIH1cblxuICBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgTWF6ZS53b3JkU2VhcmNoLnJlc2V0VGlsZXMoKTtcbiAgfSBlbHNlIHtcbiAgICByZXNldFRpbGVzKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlc2V0VGlsZXMoKSB7XG4gIC8vIFJlc2V0IHRoZSB0aWxlc1xuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLm1hcC5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IE1hemUubWFwLkNPTFM7IHgrKykge1xuICAgICAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gICAgICB2YXIgdGlsZUNsaXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUNsaXBQYXRoJyArIHRpbGVJZCk7XG4gICAgICB0aWxlQ2xpcC5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgLy8gVGlsZSBzcHJpdGUuXG4gICAgICB2YXIgdGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUVsZW1lbnQnICsgdGlsZUlkKTtcbiAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZU5TKFxuICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBza2luLnRpbGVzKTtcbiAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIDEpO1xuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuLy8gWFhYIFRoaXMgaXMgdGhlIG9ubHkgbWV0aG9kIHVzZWQgYnkgdGhlIHRlbXBsYXRlcyFcbk1hemUucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpO1xuICBpZiAoc3RlcEJ1dHRvbikge1xuICAgIHN0ZXBCdXR0b24uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcbiAgfVxuICBNYXplLmV4ZWN1dGUoZmFsc2UpO1xufTtcblxuZnVuY3Rpb24gYmVnaW5BdHRlbXB0ICgpIHtcbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gIC8vIEVuc3VyZSB0aGF0IFJlc2V0IGJ1dHRvbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIFJ1biBidXR0b24uXG4gIGlmICghcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGgpIHtcbiAgICByZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCA9IHJ1bkJ1dHRvbi5vZmZzZXRXaWR0aCArICdweCc7XG4gIH1cbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBpZiAoc3R1ZGlvQXBwLmlzVXNpbmdCbG9ja2x5KCkpIHtcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIH1cbiAgc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG59XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIHJlc2V0IGJ1dHRvbiBjbGljayBsb2dpYy4gIHN0dWRpb0FwcC5yZXNldEJ1dHRvbkNsaWNrIHdpbGwgYmVcbiAqIGNhbGxlZCBmaXJzdC5cbiAqL1xuTWF6ZS5yZXNldEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGVwQnV0dG9uJyk7XG4gIHN0ZXBCdXR0b24ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuXG4gIHJlZW5hYmxlQ2FjaGVkQmxvY2tTdGF0ZXMoKTtcbn07XG5cbmZ1bmN0aW9uIHJlZW5hYmxlQ2FjaGVkQmxvY2tTdGF0ZXMgKCkge1xuICBpZiAoTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcykge1xuICAgIC8vIHJlc3RvcmUgbW92ZWFibGUvZGVsZXRhYmxlL2VkaXRhYmxlIHN0YXRlIGZyb20gYmVmb3JlIHdlIHN0YXJ0ZWQgc3RlcHBpbmdcbiAgICBNYXplLmNhY2hlZEJsb2NrU3RhdGVzLmZvckVhY2goZnVuY3Rpb24gKGNhY2hlZCkge1xuICAgICAgY2FjaGVkLmJsb2NrLnNldE1vdmFibGUoY2FjaGVkLm1vdmFibGUpO1xuICAgICAgY2FjaGVkLmJsb2NrLnNldERlbGV0YWJsZShjYWNoZWQuZGVsZXRhYmxlKTtcbiAgICAgIGNhY2hlZC5ibG9jay5zZXRFZGl0YWJsZShjYWNoZWQuZWRpdGFibGUpO1xuICAgIH0pO1xuICAgIE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMgPSBbXTtcbiAgfVxufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICBpZiAoTWF6ZS53YWl0aW5nRm9yUmVwb3J0IHx8IE1hemUuYW5pbWF0aW5nXykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBhcHA6ICdtYXplJywgLy9YWFhcbiAgICBza2luOiBza2luLmlkLFxuICAgIGZlZWRiYWNrVHlwZTogTWF6ZS50ZXN0UmVzdWx0cyxcbiAgICByZXNwb25zZTogTWF6ZS5yZXNwb25zZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfTtcbiAgLy8gSWYgdGhlcmUgd2FzIGFuIGFwcC1zcGVjaWZpYyBlcnJvciAoY3VycmVudGx5IG9ubHkgcG9zc2libGUgZm9yIEJlZSksXG4gIC8vIGFkZCBpdCB0byB0aGUgb3B0aW9ucyBwYXNzZWQgdG8gc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjaygpLlxuICBpZiAoTWF6ZS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUwgJiZcbiAgICAgIE1hemUuYmVlKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBNYXplLmJlZS5nZXRNZXNzYWdlKE1hemUuZXhlY3V0aW9uSW5mby50ZXJtaW5hdGlvblZhbHVlKCkpO1xuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICBvcHRpb25zLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgfVxuICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuTWF6ZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgTWF6ZS5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBNYXplLndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgc3R1ZGlvQXBwLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn07XG5cbi8qKlxuICogSGVscGVyIGNsYXNzLCBwYXNzdGhyb3VnaCB0byBsZXZlbC1zcGVjaWZpYyBoYXNNdWx0aXBsZVBvc3NpYmxlR3JpZHNcbiAqIGNhbGxcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbk1hemUuaGFzTXVsdGlwbGVQb3NzaWJsZUdyaWRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gTWF6ZS5iZWUgJiYgTWF6ZS5iZWUuaGFzTXVsdGlwbGVQb3NzaWJsZUdyaWRzKCk7XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBiYXNpYyBpbml0aWFsaXphdGlvbi9yZXNldHRpbmcgb3BlcmF0aW9ucyBiZWZvcmVcbiAqIGV4ZWN1dGlvbi4gVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgaWRlbXBvdGVudCwgYXMgaXQgY2FuIGJlIGNhbGxlZFxuICogZHVyaW5nIGV4ZWN1dGlvbiB3aGVuIHJ1bm5pbmcgbXVsdGlwbGUgdHJpYWxzLlxuICovXG5NYXplLnByZXBhcmVGb3JFeGVjdXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mbyA9IG5ldyBFeGVjdXRpb25JbmZvKHt0aWNrczogMTAwfSk7XG4gIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5VTlNFVDtcbiAgTWF6ZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgTWF6ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIE1hemUuYW5pbWF0aW5nXyA9IGZhbHNlO1xuICBNYXplLnJlc3BvbnNlID0gbnVsbDtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5NYXplLmV4ZWN1dGUgPSBmdW5jdGlvbihzdGVwTW9kZSkge1xuICBiZWdpbkF0dGVtcHQoKTtcbiAgTWF6ZS5wcmVwYXJlRm9yRXhlY3V0aW9uKCk7XG5cblxuICB2YXIgY29kZTtcbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIHtcbiAgICBjb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMoZHJvcGxldENvbmZpZywgJ01hemUnKTtcbiAgICBjb2RlICs9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIC8vIFRyeSBydW5uaW5nIHRoZSB1c2VyJ3MgY29kZS4gIFRoZXJlIGFyZSBhIGZldyBwb3NzaWJsZSBvdXRjb21lczpcbiAgLy8gMS4gSWYgcGVnbWFuIHJlYWNoZXMgdGhlIGZpbmlzaCBbU1VDQ0VTU10sIGV4ZWN1dGlvbkluZm8ncyB0ZXJtaW5hdGlvblxuICAvLyAgICB2YWx1ZSBpcyBzZXQgdG8gdHJ1ZS5cbiAgLy8gMi4gSWYgdGhlIHByb2dyYW0gaXMgdGVybWluYXRlZCBkdWUgdG8gcnVubmluZyB0b28gbG9uZyBbVElNRU9VVF0sXG4gIC8vICAgIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZSBpcyBzZXQgdG8gSW5maW5pdHlcbiAgLy8gMy4gSWYgdGhlIHByb2dyYW0gdGVybWluYXRlZCBiZWNhdXNlIG9mIGhpdHRpbmcgYSB3YWxsL29ic3RhY2xlLCB0aGVcbiAgLy8gICAgdGVybWluYXRpb24gdmFsdWUgaXMgc2V0IHRvIGZhbHNlIGFuZCB0aGUgUmVzdWx0VHlwZSBpcyBFUlJPUlxuICAvLyA0LiBJZiB0aGUgcHJvZ3JhbSBmaW5pc2hlcyB3aXRob3V0IG1lZXRpbmcgc3VjY2VzcyBjb25kaXRpb24sIHdlIGhhdmUgbm9cbiAgLy8gICAgdGVybWluYXRpb24gdmFsdWUgYW5kIHNldCBSZXN1bHRUeXBlIHRvIEZBSUxVUkVcbiAgLy8gNS4gVGhlIG9ubHkgb3RoZXIgdGltZSB3ZSBzaG91bGQgZmFpbCBzaG91bGQgYmUgaWYgYW4gZXhjZXB0aW9uIGlzIHRocm93blxuICAvLyAgICBkdXJpbmcgZXhlY3V0aW9uLCBpbiB3aGljaCBjYXNlIHdlIHNldCBSZXN1bHRUeXBlIHRvIEVSUk9SLlxuICAvLyBUaGUgYW5pbWF0aW9uIHNob3VsZCBiZSBmYXN0IGlmIGV4ZWN1dGlvbiB3YXMgc3VjY2Vzc2Z1bCwgc2xvdyBvdGhlcndpc2VcbiAgLy8gdG8gaGVscCB0aGUgdXNlciBzZWUgdGhlIG1pc3Rha2UuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG4gIHRyeSB7XG4gICAgLy8gZG9uJ3QgYm90aGVyIHJ1bm5pbmcgY29kZSBpZiB3ZSdyZSBqdXN0IGVkaXR0aW5nIHJlcXVpcmVkIGJsb2Nrcy4gYWxsXG4gICAgLy8gd2UgY2FyZSBhYm91dCBpcyB0aGUgY29udGVudHMgb2YgcmVwb3J0LlxuICAgIHZhciBydW5Db2RlID0gIWxldmVsLmVkaXRfYmxvY2tzO1xuXG4gICAgaWYgKHJ1bkNvZGUpIHtcbiAgICAgIGlmIChNYXplLmhhc011bHRpcGxlUG9zc2libGVHcmlkcygpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgbGV2ZWwgaXMgYSBCZWUgbGV2ZWwgd2l0aCBtdWx0aXBsZSBwb3NzaWJsZSBncmlkcywgd2VcbiAgICAgICAgLy8gbmVlZCB0byBydW4gYWdhaW5zdCBhbGwgZ3JpZHMgYW5kIHNvcnQgdGhlbSBpbnRvIHN1Y2Nlc3Nlc1xuICAgICAgICAvLyBhbmQgZmFpbHVyZXNcbiAgICAgICAgdmFyIHN1Y2Nlc3NlcyA9IFtdO1xuICAgICAgICB2YXIgZmFpbHVyZXMgPSBbXTtcblxuICAgICAgICBNYXplLmJlZS5zdGF0aWNHcmlkcy5mb3JFYWNoKGZ1bmN0aW9uKGdyaWQsIGkpIHtcbiAgICAgICAgICBNYXplLmJlZS51c2VHcmlkV2l0aElkKGkpO1xuXG4gICAgICAgICAgLy8gUnVuIHRyaWFsXG4gICAgICAgICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgIE1hemU6IGFwaSxcbiAgICAgICAgICAgIGV4ZWN1dGlvbkluZm86IE1hemUuZXhlY3V0aW9uSW5mb1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU29ydCBzdGF0aWMgZ3JpZHMgYmFzZWQgb24gdHJpYWwgcmVzdWx0XG4gICAgICAgICAgTWF6ZS5vbkV4ZWN1dGlvbkZpbmlzaCgpO1xuICAgICAgICAgIGlmIChNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdWNjZXNzZXMucHVzaChpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbHVyZXMucHVzaChpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZXNldCBmb3IgbmV4dCB0cmlhbFxuICAgICAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIucmVzZXRDbG91ZGVkKCk7XG4gICAgICAgICAgTWF6ZS5wcmVwYXJlRm9yRXhlY3V0aW9uKCk7XG4gICAgICAgICAgc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb2RlIG5lZWRzIHRvIHN1Y2NlZWQgYWdhaW5zdCBhbGwgcG9zc2libGUgZ3JpZHNcbiAgICAgICAgLy8gdG8gYmUgY29uc2lkZXJlZCBhY3R1YWxseSBzdWNjZXNzZnVsOyBpZiB0aGVyZSBhcmUgYW55XG4gICAgICAgIC8vIGZhaWx1cmVzLCByYW5kb21seSBzZWxlY3Qgb25lIG9mIHRoZSBmYWlsaW5nIGdyaWRzIHRvIGJlIHRoZVxuICAgICAgICAvLyBcInJlYWxcIiBzdGF0ZSBvZiB0aGUgbWFwLiBJZiBhbGwgZ3JpZHMgYXJlIHN1Y2Nlc3NmdWwsXG4gICAgICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBhbnkgb25lIG9mIHRoZW0uXG4gICAgICAgIHZhciBpID0gKGZhaWx1cmVzLmxlbmd0aCA+IDApID8gXy5zYW1wbGUoZmFpbHVyZXMpIDogXy5zYW1wbGUoc3VjY2Vzc2VzKTtcbiAgICAgICAgTWF6ZS5iZWUudXNlR3JpZFdpdGhJZChpKTtcbiAgICAgIH1cblxuICAgICAgY29kZWdlbi5ldmFsV2l0aChjb2RlLCB7XG4gICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICBNYXplOiBhcGksXG4gICAgICAgIGV4ZWN1dGlvbkluZm86IE1hemUuZXhlY3V0aW9uSW5mb1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgTWF6ZS5vbkV4ZWN1dGlvbkZpbmlzaCgpO1xuXG4gICAgc3dpdGNoIChNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpKSB7XG4gICAgICBjYXNlIG51bGw6XG4gICAgICAgIC8vIGRpZG4ndCB0ZXJtaW5hdGVcbiAgICAgICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdmaW5pc2gnLCBudWxsKTtcbiAgICAgICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgICAgIHN0ZXBTcGVlZCA9IDE1MDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEluZmluaXR5OlxuICAgICAgICAvLyBEZXRlY3RlZCBhbiBpbmZpbml0ZSBsb29wLiAgQW5pbWF0ZSB3aGF0IHdlIGhhdmUgYXMgcXVpY2tseSBhc1xuICAgICAgICAvLyBwb3NzaWJsZVxuICAgICAgICBNYXplLnJlc3VsdCA9IFJlc3VsdFR5cGUuVElNRU9VVDtcbiAgICAgICAgc3RlcFNwZWVkID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgICAgICBzdGVwU3BlZWQgPSAxMDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgICAgICBzdGVwU3BlZWQgPSAxNTA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gQXBwLXNwZWNpZmljIGZhaWx1cmUuXG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5FUlJPUjtcbiAgICAgICAgaWYgKE1hemUuYmVlKSB7XG4gICAgICAgICAgTWF6ZS50ZXN0UmVzdWx0cyA9IE1hemUuYmVlLmdldFRlc3RSZXN1bHRzKFxuICAgICAgICAgICAgTWF6ZS5leGVjdXRpb25JbmZvLnRlcm1pbmF0aW9uVmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gU3ludGF4IGVycm9yLCBjYW4ndCBoYXBwZW4uXG4gICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmV4cGVjdGVkIGV4Y2VwdGlvbjogXCIgKyBlICsgXCJcXG5cIiArIGUuc3RhY2spO1xuICAgIC8vIGNhbGwgd2luZG93Lm9uZXJyb3Igc28gdGhhdCB3ZSBnZXQgbmV3IHJlbGljIGNvbGxlY3Rpb24uICBwcmVwZW5kIHdpdGhcbiAgICAvLyBVc2VyQ29kZSBzbyB0aGF0IGl0J3MgY2xlYXIgdGhpcyBpcyBpbiBldmFsJ2VkIGNvZGUuXG4gICAgaWYgKHdpbmRvdy5vbmVycm9yKSB7XG4gICAgICB3aW5kb3cub25lcnJvcihcIlVzZXJDb2RlOlwiICsgZS5tZXNzYWdlLCBkb2N1bWVudC5VUkwsIDApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiB3ZSBrbm93IHRoZXkgc3VjY2VlZGVkLCBtYXJrIGxldmVsQ29tcGxldGUgdHJ1ZVxuICAvLyBOb3RlIHRoYXQgd2UgaGF2ZSBub3QgeWV0IGFuaW1hdGVkIHRoZSBzdWNjZXNzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChNYXplLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKTtcblxuICAvLyBTZXQgdGVzdFJlc3VsdHMgdW5sZXNzIGFwcC1zcGVjaWZpYyByZXN1bHRzIHdlcmUgc2V0IGluIHRoZSBkZWZhdWx0XG4gIC8vIGJyYW5jaCBvZiB0aGUgYWJvdmUgc3dpdGNoIHN0YXRlbWVudC5cbiAgaWYgKE1hemUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTikge1xuICAgIE1hemUudGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSk7XG4gIH1cblxuICB2YXIgcHJvZ3JhbTtcbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgLy8gSWYgd2Ugd2FudCB0byBcIm5vcm1hbGl6ZVwiIHRoZSBKYXZhU2NyaXB0IHRvIGF2b2lkIHByb2xpZmVyYXRpb24gb2YgbmVhcmx5XG4gICAgLy8gaWRlbnRpY2FsIHZlcnNpb25zIG9mIHRoZSBjb2RlIG9uIHRoZSBzZXJ2aWNlLCB3ZSBjb3VsZCBkbyBlaXRoZXIgb2YgdGhlc2U6XG5cbiAgICAvLyBkbyBhbiBhY29ybi5wYXJzZSBhbmQgdGhlbiB1c2UgZXNjb2RlZ2VuIHRvIGdlbmVyYXRlIGJhY2sgYSBcImNsZWFuXCIgdmVyc2lvblxuICAgIC8vIG9yIG1pbmlmeSAodWdsaWZ5anMpIGFuZCB0aGF0IG9yIGpzLWJlYXV0aWZ5IHRvIHJlc3RvcmUgYSBcImNsZWFuXCIgdmVyc2lvblxuXG4gICAgcHJvZ3JhbSA9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICAgIHByb2dyYW0gPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcbiAgfVxuXG4gIE1hemUud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG5cbiAgLy8gUmVwb3J0IHJlc3VsdCB0byBzZXJ2ZXIuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgIGFwcDogJ21hemUnLFxuICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICByZXN1bHQ6IE1hemUucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgdGVzdFJlc3VsdDogTWF6ZS50ZXN0UmVzdWx0cyxcbiAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQocHJvZ3JhbSksXG4gICAgb25Db21wbGV0ZTogTWF6ZS5vblJlcG9ydENvbXBsZXRlXG4gIH0pO1xuXG4gIC8vIE1hemUuIG5vdyBjb250YWlucyBhIHRyYW5zY3JpcHQgb2YgYWxsIHRoZSB1c2VyJ3MgYWN0aW9ucy5cbiAgLy8gUmVzZXQgdGhlIG1hemUgYW5kIGFuaW1hdGUgdGhlIHRyYW5zY3JpcHQuXG4gIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gIHJlc2V0RGlydEltYWdlcyh0cnVlKTtcblxuICAvLyBpZiB3ZSBoYXZlIGV4dHJhIHRvcCBibG9ja3MsIGRvbid0IGV2ZW4gYm90aGVyIGFuaW1hdGluZ1xuICBpZiAoTWF6ZS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuRVhUUkFfVE9QX0JMT0NLU19GQUlMKSB7XG4gICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkVSUk9SO1xuICAgIGRpc3BsYXlGZWVkYmFjaygpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIE1hemUuYW5pbWF0aW5nXyA9IHRydWU7XG5cbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgLy8gRGlzYWJsZSB0b29sYm94IHdoaWxlIHJ1bm5pbmdcbiAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3goZmFsc2UpO1xuXG4gICAgaWYgKHN0ZXBNb2RlKSB7XG4gICAgICBpZiAoTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGNhY2hlZEJsb2NrU3RhdGVzJyk7XG4gICAgICB9XG4gICAgICAvLyBEaXNhYmxlIGFsbCBibG9ja3MsIGNhY2hpbmcgdGhlaXIgc3RhdGUgZmlyc3RcbiAgICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0QWxsQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgICAgTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5wdXNoKHtcbiAgICAgICAgICBibG9jazogYmxvY2ssXG4gICAgICAgICAgbW92YWJsZTogYmxvY2suaXNNb3ZhYmxlKCksXG4gICAgICAgICAgZGVsZXRhYmxlOiBibG9jay5pc0RlbGV0YWJsZSgpLFxuICAgICAgICAgIGVkaXRhYmxlOiBibG9jay5pc0VkaXRhYmxlKClcbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLnNldE1vdmFibGUoZmFsc2UpO1xuICAgICAgICBibG9jay5zZXREZWxldGFibGUoZmFsc2UpO1xuICAgICAgICBibG9jay5zZXRFZGl0YWJsZShmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmluZyB0aGUgaWRsZSBhbmltYXRpb24gYW5kIHJlcGxhY2Ugd2l0aCBwZWdtYW4gc3ByaXRlXG4gIGlmIChza2luLmlkbGVQZWdtYW5BbmltYXRpb24pIHtcbiAgICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgICB2YXIgaWRsZVBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWRsZVBlZ21hbicpO1xuICAgIGlkbGVQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIH1cblxuICAvLyBTcGVlZGluZyB1cCBzcGVjaWZpYyBsZXZlbHNcbiAgdmFyIHNjYWxlZFN0ZXBTcGVlZCA9IHN0ZXBTcGVlZCAqIE1hemUuc2NhbGUuc3RlcFNwZWVkICpcbiAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgTWF6ZS5zY2hlZHVsZUFuaW1hdGlvbnMoc3RlcE1vZGUpO1xuICB9LCBzY2FsZWRTdGVwU3BlZWQpO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIG91ciBhbmltYXRpb25zLCBlaXRoZXIgYWxsIG9mIHRoZW0gb3IgdGhvc2Ugb2YgYSBzaW5nbGUgc3RlcFxuICovXG5NYXplLnNjaGVkdWxlQW5pbWF0aW9ucyA9IGZ1bmN0aW9uIChzaW5nbGVTdGVwKSB7XG4gIHZhciBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKTtcblxuICB0aW1lb3V0TGlzdC5jbGVhclRpbWVvdXRzKCk7XG5cbiAgdmFyIHRpbWVQZXJBY3Rpb24gPSBzdGVwU3BlZWQgKiBNYXplLnNjYWxlLnN0ZXBTcGVlZCAqXG4gICAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTtcbiAgLy8gZ2V0IGEgZmxhdCBsaXN0IG9mIGFjdGlvbnMgd2Ugd2FudCB0byBzY2hlZHVsZVxuICB2YXIgYWN0aW9ucyA9IE1hemUuZXhlY3V0aW9uSW5mby5nZXRBY3Rpb25zKHNpbmdsZVN0ZXApO1xuXG4gIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uKDApO1xuXG4gIC8vIHNjaGVkdWxlIGFuaW1hdGlvbnMgaW4gc2VxdWVuY2VcbiAgLy8gVGhlIHJlYXNvbiB3ZSBkbyB0aGlzIHJlY3Vyc2l2ZWx5IGluc3RlYWQgb2YgaXRlcmF0aXZlbHkgaXMgdGhhdCB3ZSB3YW50IHRvXG4gIC8vIGVuc3VyZSB0aGF0IHdlIGZpbmlzaCBzY2hlZHVsaW5nIGFjdGlvbjEgYmVmb3JlIHN0YXJ0aW5nIHRvIHNjaGVkdWxlXG4gIC8vIGFjdGlvbjIuIE90aGVyd2lzZSB3ZSBnZXQgaW50byB0cm91YmxlIHdoZW4gc3RlcFNwZWVkIGlzIDAuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uIChpbmRleCkge1xuICAgIGlmIChpbmRleCA+PSBhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgZmluaXNoQW5pbWF0aW9ucygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFuaW1hdGVBY3Rpb24oYWN0aW9uc1tpbmRleF0sIHNpbmdsZVN0ZXAsIHRpbWVQZXJBY3Rpb24pO1xuXG4gICAgdmFyIGNvbW1hbmQgPSBhY3Rpb25zW2luZGV4XSAmJiBhY3Rpb25zW2luZGV4XS5jb21tYW5kO1xuICAgIHZhciB0aW1lTW9kaWZpZXIgPSAoc2tpbi5hY3Rpb25TcGVlZFNjYWxlICYmIHNraW4uYWN0aW9uU3BlZWRTY2FsZVtjb21tYW5kXSkgfHwgMTtcbiAgICB2YXIgdGltZUZvclRoaXNBY3Rpb24gPSBNYXRoLnJvdW5kKHRpbWVQZXJBY3Rpb24gKiB0aW1lTW9kaWZpZXIpO1xuXG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHNjaGVkdWxlU2luZ2xlQW5pbWF0aW9uKGluZGV4ICsgMSk7XG4gICAgfSwgdGltZUZvclRoaXNBY3Rpb24pO1xuICB9XG5cbiAgLy8gT25jZSBhbmltYXRpb25zIGFyZSBjb21wbGV0ZSwgd2Ugd2FudCB0byByZWVuYWJsZSB0aGUgc3RlcCBidXR0b24gaWYgd2VcbiAgLy8gaGF2ZSBzdGVwcyBsZWZ0LCBvdGhlcndpc2Ugd2UncmUgZG9uZSB3aXRoIHRoaXMgZXhlY3V0aW9uLlxuICBmdW5jdGlvbiBmaW5pc2hBbmltYXRpb25zKCkge1xuICAgIHZhciBzdGVwc1JlbWFpbmluZyA9IE1hemUuZXhlY3V0aW9uSW5mby5zdGVwc1JlbWFpbmluZygpO1xuXG4gICAgLy8gYWxsb3cgdGltZSBmb3IgIGFkZGl0aW9uYWwgcGF1c2UgaWYgd2UncmUgY29tcGxldGVseSBkb25lXG4gICAgdmFyIHdhaXRUaW1lID0gKHN0ZXBzUmVtYWluaW5nID8gMCA6IDEwMDApO1xuXG4gICAgLy8gcnVuIGFmdGVyIGFsbCBhbmltYXRpb25zXG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc3RlcHNSZW1haW5pbmcpIHtcbiAgICAgICAgc3RlcEJ1dHRvbi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcbiAgICAgICAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICAgICAgLy8gcmVlbmFibGUgdG9vbGJveFxuICAgICAgICAgIEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3Iuc2V0RW5hYmxlVG9vbGJveCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBzdGVwcGluZyBhbmQgd2UgZmFpbGVkLCB3ZSB3YW50IHRvIHJldGFpbiBoaWdobGlnaHRpbmcgdW50aWxcbiAgICAgICAgLy8gY2xpY2tpbmcgcmVzZXQuICBPdGhlcndpc2Ugd2UgY2FuIGNsZWFyIGhpZ2hsaWdodGluZy9kaXNhYmxlZFxuICAgICAgICAvLyBibG9ja3Mgbm93XG4gICAgICAgIGlmICghc2luZ2xlU3RlcCB8fCBNYXplLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTKSB7XG4gICAgICAgICAgcmVlbmFibGVDYWNoZWRCbG9ja1N0YXRlcygpO1xuICAgICAgICAgIHN0dWRpb0FwcC5jbGVhckhpZ2hsaWdodGluZygpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BsYXlGZWVkYmFjaygpO1xuICAgICAgfVxuICAgIH0sIHdhaXRUaW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBbmltYXRlcyBhIHNpbmdsZSBhY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gVGhlIGFjdGlvbiB0byBhbmltYXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNwb3RsaWdodEJsb2NrcyBXaGV0aGVyIG9yIG5vdCB3ZSBzaG91bGQgaGlnaGxpZ2h0IGVudGlyZSBibG9ja3NcbiAqIEBwYXJhbSB7aW50ZWdlcn0gdGltZVBlclN0ZXAgSG93IG11Y2ggdGltZSB3ZSBoYXZlIGFsbG9jYXRlZCBiZWZvcmUgdGhlIG5leHQgc3RlcFxuICovXG5mdW5jdGlvbiBhbmltYXRlQWN0aW9uIChhY3Rpb24sIHNwb3RsaWdodEJsb2NrcywgdGltZVBlclN0ZXApIHtcbiAgaWYgKGFjdGlvbi5ibG9ja0lkKSB7XG4gICAgc3R1ZGlvQXBwLmhpZ2hsaWdodChTdHJpbmcoYWN0aW9uLmJsb2NrSWQpLCBzcG90bGlnaHRCbG9ja3MpO1xuICB9XG5cbiAgc3dpdGNoIChhY3Rpb24uY29tbWFuZCkge1xuICAgIGNhc2UgJ25vcnRoJzpcbiAgICAgIGFuaW1hdGVkTW92ZShEaXJlY3Rpb24uTk9SVEgsIHRpbWVQZXJTdGVwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Vhc3QnOlxuICAgICAgYW5pbWF0ZWRNb3ZlKERpcmVjdGlvbi5FQVNULCB0aW1lUGVyU3RlcCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzb3V0aCc6XG4gICAgICBhbmltYXRlZE1vdmUoRGlyZWN0aW9uLlNPVVRILCB0aW1lUGVyU3RlcCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3ZXN0JzpcbiAgICAgIGFuaW1hdGVkTW92ZShEaXJlY3Rpb24uV0VTVCwgdGltZVBlclN0ZXApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9va19ub3J0aCc6XG4gICAgICBNYXplLnNjaGVkdWxlTG9vayhEaXJlY3Rpb24uTk9SVEgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9va19lYXN0JzpcbiAgICAgIE1hemUuc2NoZWR1bGVMb29rKERpcmVjdGlvbi5FQVNUKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfc291dGgnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUxvb2soRGlyZWN0aW9uLlNPVVRIKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfd2VzdCc6XG4gICAgICBNYXplLnNjaGVkdWxlTG9vayhEaXJlY3Rpb24uV0VTVCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsX2ZvcndhcmQnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUZhaWwodHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsX2JhY2t3YXJkJzpcbiAgICAgIE1hemUuc2NoZWR1bGVGYWlsKGZhbHNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgdmFyIG5ld0RpcmVjdGlvbiA9IE1hemUucGVnbWFuRCArIFR1cm5EaXJlY3Rpb24uTEVGVDtcbiAgICAgIE1hemUuc2NoZWR1bGVUdXJuKG5ld0RpcmVjdGlvbik7XG4gICAgICBNYXplLnBlZ21hbkQgPSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KG5ld0RpcmVjdGlvbik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICBuZXdEaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQgKyBUdXJuRGlyZWN0aW9uLlJJR0hUO1xuICAgICAgTWF6ZS5zY2hlZHVsZVR1cm4obmV3RGlyZWN0aW9uKTtcbiAgICAgIE1hemUucGVnbWFuRCA9IHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQobmV3RGlyZWN0aW9uKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpbmlzaCc6XG4gICAgICAvLyBPbmx5IHNjaGVkdWxlIHZpY3RvcnkgYW5pbWF0aW9uIGZvciBjZXJ0YWluIGNvbmRpdGlvbnM6XG4gICAgICBzd2l0Y2ggKE1hemUudGVzdFJlc3VsdHMpIHtcbiAgICAgICAgY2FzZSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk6XG4gICAgICAgIGNhc2UgVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUw6XG4gICAgICAgIGNhc2UgVGVzdFJlc3VsdHMuQUxMX1BBU1M6XG4gICAgICAgICAgc2NoZWR1bGVEYW5jZSh0cnVlLCB0aW1lUGVyU3RlcCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgICAgICAgICB9LCBzdGVwU3BlZWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHV0ZG93bic6XG4gICAgICBNYXplLnNjaGVkdWxlRmlsbCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGlja3VwJzpcbiAgICAgIE1hemUuc2NoZWR1bGVEaWcoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25lY3Rhcic6XG4gICAgICBNYXplLmJlZS5hbmltYXRlR2V0TmVjdGFyKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdob25leSc6XG4gICAgICBNYXplLmJlZS5hbmltYXRlTWFrZUhvbmV5KCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gYWN0aW9uWzBdIGlzIG51bGwgaWYgZ2VuZXJhdGVkIGJ5IHN0dWRpb0FwcC5jaGVja1RpbWVvdXQoKS5cbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGVkTW92ZSAoZGlyZWN0aW9uLCB0aW1lRm9yTW92ZSkge1xuICB2YXIgcG9zaXRpb25DaGFuZ2UgPSB0aWxlcy5kaXJlY3Rpb25Ub0R4RHkoZGlyZWN0aW9uKTtcbiAgdmFyIG5ld1ggPSBNYXplLnBlZ21hblggKyBwb3NpdGlvbkNoYW5nZS5keDtcbiAgdmFyIG5ld1kgPSBNYXplLnBlZ21hblkgKyBwb3NpdGlvbkNoYW5nZS5keTtcbiAgc2NoZWR1bGVNb3ZlKG5ld1gsIG5ld1ksIHRpbWVGb3JNb3ZlKTtcbiAgTWF6ZS5wZWdtYW5YID0gbmV3WDtcbiAgTWF6ZS5wZWdtYW5ZID0gbmV3WTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhIG1vdmVtZW50IGFuaW1hdGluZyB1c2luZyBhIHNwcml0ZXNoZWV0LlxuICovXG5NYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50ID0gZnVuY3Rpb24gKHN0YXJ0LCBkZWx0YSwgbnVtRnJhbWVzLCB0aW1lUGVyRnJhbWUsXG4gICAgaWRTdHIsIGRpcmVjdGlvbiwgaGlkZVBlZ21hbikge1xuICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgdXRpbHMucmFuZ2UoMCwgbnVtRnJhbWVzIC0gMSkuZm9yRWFjaChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGhpZGVQZWdtYW4pIHtcbiAgICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICB9XG4gICAgICB1cGRhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgICBpZFN0cjogaWRTdHIsXG4gICAgICAgIGNvbDogc3RhcnQueCArIGRlbHRhLnggKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgcm93OiBzdGFydC55ICsgZGVsdGEueSAqIGZyYW1lIC8gbnVtRnJhbWVzLFxuICAgICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbixcbiAgICAgICAgYW5pbWF0aW9uUm93OiBmcmFtZVxuICAgICAgfSk7XG4gICAgfSwgdGltZVBlckZyYW1lICogZnJhbWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgZm9yIGEgbW92ZSBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWCBYIGNvb3JkaW5hdGUgb2YgdGhlIHRhcmdldCBwb3NpdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGVuZFkgWSBjb29yZGluYXRlIG9mIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAqL1xuIGZ1bmN0aW9uIHNjaGVkdWxlTW92ZShlbmRYLCBlbmRZLCB0aW1lRm9yQW5pbWF0aW9uKSB7XG4gIHZhciBzdGFydFggPSBNYXplLnBlZ21hblg7XG4gIHZhciBzdGFydFkgPSBNYXplLnBlZ21hblk7XG4gIHZhciBkaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQ7XG5cbiAgdmFyIGRlbHRhWCA9IChlbmRYIC0gc3RhcnRYKTtcbiAgdmFyIGRlbHRhWSA9IChlbmRZIC0gc3RhcnRZKTtcbiAgdmFyIG51bUZyYW1lcztcbiAgdmFyIHRpbWVQZXJGcmFtZTtcblxuICBpZiAoc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgbnVtRnJhbWVzID0gc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uRnJhbWVOdW1iZXI7XG4gICAgLy8gSWYgbW92ZSBhbmltYXRpb24gb2YgcGVnbWFuIGlzIHNldCwgYW5kIHRoaXMgaXMgbm90IGEgdHVybi5cbiAgICAvLyBTaG93IHRoZSBhbmltYXRpb24uXG4gICAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gICAgdmFyIG1vdmVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vdmVQZWdtYW4nKTtcbiAgICB0aW1lUGVyRnJhbWUgPSB0aW1lRm9yQW5pbWF0aW9uIC8gbnVtRnJhbWVzO1xuXG4gICAgTWF6ZS5zY2hlZHVsZVNoZWV0ZWRNb3ZlbWVudCh7eDogc3RhcnRYLCB5OiBzdGFydFl9LCB7eDogZGVsdGFYLCB5OiBkZWx0YVkgfSxcbiAgICAgIG51bUZyYW1lcywgdGltZVBlckZyYW1lLCAnbW92ZScsIGRpcmVjdGlvbiwgdHJ1ZSk7XG5cbiAgICAvLyBIaWRlIG1vdmVQZWdtYW4gYW5kIHNldCBwZWdtYW4gdG8gdGhlIGVuZCBwb3NpdGlvbi5cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbW92ZVBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKGVuZFgsIGVuZFksIHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoZGlyZWN0aW9uKSk7XG4gICAgICBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgICAgIE1hemUud29yZFNlYXJjaC5tYXJrVGlsZVZpc2l0ZWQoZW5kWSwgZW5kWCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSwgdGltZVBlckZyYW1lICogbnVtRnJhbWVzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB3ZSBkb24ndCBoYXZlIGFuIGFuaW1hdGlvbiwgc28ganVzdCBtb3ZlIHRoZSB4L3kgcG9zXG4gICAgbnVtRnJhbWVzID0gNDtcbiAgICB0aW1lUGVyRnJhbWUgPSB0aW1lRm9yQW5pbWF0aW9uIC8gbnVtRnJhbWVzO1xuICAgIHV0aWxzLnJhbmdlKDEsIG51bUZyYW1lcykuZm9yRWFjaChmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIE1hemUuZGlzcGxheVBlZ21hbihcbiAgICAgICAgICBzdGFydFggKyBkZWx0YVggKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgICBzdGFydFkgKyBkZWx0YVkgKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgICB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKGRpcmVjdGlvbikpO1xuICAgICAgfSwgdGltZVBlckZyYW1lICogZnJhbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHNraW4uYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uKSB7XG4gICAgdmFyIGZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluaXNoJyk7XG4gICAgLy8gSWYgcGVnbWFuIGlzIGNsb3NlIHRvIHRoZSBnb2FsXG4gICAgLy8gUmVwbGFjZSB0aGUgZ29hbCBmaWxlIHdpdGggYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uXG4gICAgaWYgKE1hemUuZmluaXNoXyAmJiBNYXRoLmFicyhlbmRYIC0gTWF6ZS5maW5pc2hfLngpIDw9IDEgJiZcbiAgICAgICAgTWF0aC5hYnMoZW5kWSAtIE1hemUuZmluaXNoXy55KSA8PSAxKSB7XG4gICAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgIHNraW4uZ29hbElkbGUpO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgZm9yIGEgdHVybiBmcm9tIHRoZSBjdXJyZW50IGRpcmVjdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGVuZERpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHdlJ3JlIHR1cm5pbmcgdG9cbiAqL1xuTWF6ZS5zY2hlZHVsZVR1cm4gPSBmdW5jdGlvbiAoZW5kRGlyZWN0aW9uKSB7XG4gIHZhciBudW1GcmFtZXMgPSA0O1xuICB2YXIgc3RhcnREaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQ7XG4gIHZhciBkZWx0YURpcmVjdGlvbiA9IGVuZERpcmVjdGlvbiAtIHN0YXJ0RGlyZWN0aW9uO1xuICB1dGlscy5yYW5nZSgxLCBudW1GcmFtZXMpLmZvckVhY2goZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihcbiAgICAgICAgTWF6ZS5wZWdtYW5YLFxuICAgICAgICBNYXplLnBlZ21hblksXG4gICAgICAgIHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoc3RhcnREaXJlY3Rpb24gKyBkZWx0YURpcmVjdGlvbiAqIGZyYW1lIC8gbnVtRnJhbWVzKSk7XG4gICAgfSwgc3RlcFNwZWVkICogKGZyYW1lIC0gMSkpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVwbGFjZSB0aGUgdGlsZXMgc3Vycm91bmRpbmcgdGhlIG9ic3RhY2xlIHdpdGggYnJva2VuIHRpbGVzLlxuICovXG5NYXplLnVwZGF0ZVN1cnJvdW5kaW5nVGlsZXMgPSBmdW5jdGlvbihvYnN0YWNsZVksIG9ic3RhY2xlWCwgYnJva2VuVGlsZXMpIHtcbiAgdmFyIHRpbGVDb29yZHMgPSBbXG4gICAgW29ic3RhY2xlWSAtIDEsIG9ic3RhY2xlWCAtIDFdLFxuICAgIFtvYnN0YWNsZVkgLSAxLCBvYnN0YWNsZVhdLFxuICAgIFtvYnN0YWNsZVkgLSAxLCBvYnN0YWNsZVggKyAxXSxcbiAgICBbb2JzdGFjbGVZLCBvYnN0YWNsZVggLSAxXSxcbiAgICBbb2JzdGFjbGVZLCBvYnN0YWNsZVhdLFxuICAgIFtvYnN0YWNsZVksIG9ic3RhY2xlWCArIDFdLFxuICAgIFtvYnN0YWNsZVkgKyAxLCBvYnN0YWNsZVggLSAxXSxcbiAgICBbb2JzdGFjbGVZICsgMSwgb2JzdGFjbGVYXSxcbiAgICBbb2JzdGFjbGVZICsgMSwgb2JzdGFjbGVYICsgMV1cbiAgXTtcbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgdGlsZUNvb3Jkcy5sZW5ndGg7ICsraWR4KSB7XG4gICAgdmFyIHRpbGVJZHggPSB0aWxlQ29vcmRzW2lkeF1bMV0gKyBNYXplLm1hcC5DT0xTICogdGlsZUNvb3Jkc1tpZHhdWzBdO1xuICAgIHZhciB0aWxlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlRWxlbWVudCcgKyB0aWxlSWR4KTtcbiAgICBpZiAodGlsZUVsZW1lbnQpIHtcbiAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZU5TKFxuICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBicm9rZW5UaWxlcyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRoZSBhbmltYXRpb25zIGFuZCBzb3VuZHMgZm9yIGEgZmFpbGVkIG1vdmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZvcndhcmQgVHJ1ZSBpZiBmb3J3YXJkLCBmYWxzZSBpZiBiYWNrd2FyZC5cbiAqL1xuTWF6ZS5zY2hlZHVsZUZhaWwgPSBmdW5jdGlvbihmb3J3YXJkKSB7XG4gIHZhciBkeER5ID0gdGlsZXMuZGlyZWN0aW9uVG9EeER5KE1hemUucGVnbWFuRCk7XG4gIHZhciBkZWx0YVggPSBkeER5LmR4O1xuICB2YXIgZGVsdGFZID0gZHhEeS5keTtcblxuICBpZiAoIWZvcndhcmQpIHtcbiAgICBkZWx0YVggPSAtZGVsdGFYO1xuICAgIGRlbHRhWSA9IC1kZWx0YVk7XG4gIH1cblxuICB2YXIgdGFyZ2V0WCA9IE1hemUucGVnbWFuWCArIGRlbHRhWDtcbiAgdmFyIHRhcmdldFkgPSBNYXplLnBlZ21hblkgKyBkZWx0YVk7XG4gIHZhciBmcmFtZSA9IHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoTWF6ZS5wZWdtYW5EKTtcbiAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCArIGRlbHRhWCAvIDQsXG4gICAgICAgICAgICAgICAgICAgICBNYXplLnBlZ21hblkgKyBkZWx0YVkgLyA0LFxuICAgICAgICAgICAgICAgICAgICAgZnJhbWUpO1xuICAvLyBQbGF5IHNvdW5kIGFuZCBhbmltYXRpb24gZm9yIGhpdHRpbmcgd2FsbCBvciBvYnN0YWNsZVxuICB2YXIgc3F1YXJlVHlwZSA9IE1hemUubWFwLmdldFRpbGUodGFyZ2V0WSwgdGFyZ2V0WCk7XG4gIGlmIChzcXVhcmVUeXBlID09PSBTcXVhcmVUeXBlLldBTEwgfHwgc3F1YXJlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gUGxheSB0aGUgc291bmRcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3YWxsJyk7XG4gICAgaWYgKHNxdWFyZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQ2hlY2sgd2hpY2ggdHlwZSBvZiB3YWxsIHBlZ21hbiBpcyBoaXR0aW5nXG4gICAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3YWxsJyArIE1hemUud2FsbE1hcFt0YXJnZXRZXVt0YXJnZXRYXSk7XG4gICAgfVxuXG4gICAgLy8gUGxheSB0aGUgYW5pbWF0aW9uIG9mIGhpdHRpbmcgdGhlIHdhbGxcbiAgICBpZiAoc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbikge1xuICAgICAgdmFyIHdhbGxBbmltYXRpb25JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxBbmltYXRpb24nKTtcbiAgICAgIHZhciBudW1GcmFtZXMgPSBza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uRnJhbWVOdW1iZXIgfHwgMDtcblxuICAgICAgaWYgKG51bUZyYW1lcyA+IDEpIHtcblxuICAgICAgICAvLyBUaGUgU2NyYXQgXCJ3YWxsXCIgYW5pbWF0aW9uIGhhcyBoaW0gZmFsbGluZyBiYWNrd2FyZHMgaW50byB0aGUgd2F0ZXIuXG4gICAgICAgIC8vIFRoaXMgbG9va3MgZ3JlYXQgd2hlbiBoZSBmYWxscyBpbnRvIHRoZSB3YXRlciBhYm92ZSBoaW0sIGJ1dCBsb29rcyBhXG4gICAgICAgIC8vIGxpdHRsZSBvZmYgd2hlbiBmYWxsaW5nIHRvIHRoZSBzaWRlL2ZvcndhcmQuIFR1bmUgdGhhdCBieSBidW1waW5nIHRoZVxuICAgICAgICAvLyBkZWx0YVkgYnkgb25lLiBIYWNreSwgYnV0IGxvb2tzIG11Y2ggYmV0dGVyXG4gICAgICAgIGlmIChkZWx0YVkgPj0gMCkge1xuICAgICAgICAgIGRlbHRhWSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFuaW1hdGUgb3VyIHNwcml0ZSBzaGVldFxuICAgICAgICB2YXIgdGltZVBlckZyYW1lID0gMTAwO1xuICAgICAgICBNYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50KHt4OiBNYXplLnBlZ21hblgsIHk6IE1hemUucGVnbWFuWX0sXG4gICAgICAgICAge3g6IGRlbHRhWCwgeTogZGVsdGFZIH0sIG51bUZyYW1lcywgdGltZVBlckZyYW1lLCAnd2FsbCcsXG4gICAgICAgICAgRGlyZWN0aW9uLk5PUlRILCB0cnVlKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxQZWdtYW4nKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIH0sIG51bUZyYW1lcyAqIHRpbWVQZXJGcmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhY3RpdmUgb3VyIGdpZlxuICAgICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgICAgICAgICBNYXplLlNRVUFSRV9TSVpFICogKE1hemUucGVnbWFuWCArIDAuNSArIGRlbHRhWCAqIDAuNSkgLVxuICAgICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uZ2V0QXR0cmlidXRlKCd3aWR0aCcpIC8gMik7XG4gICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd5JyxcbiAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoTWF6ZS5wZWdtYW5ZICsgMSArIGRlbHRhWSAqIDAuNSkgLVxuICAgICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbik7XG4gICAgICAgIH0sIHN0ZXBTcGVlZCAvIDIpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCBmcmFtZSk7XG4gICAgfSwgc3RlcFNwZWVkKTtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCArIGRlbHRhWCAvIDQsIE1hemUucGVnbWFuWSArIGRlbHRhWSAvIDQsXG4gICAgICAgZnJhbWUpO1xuICAgICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICAgIH0sIHN0ZXBTcGVlZCAqIDIpO1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIGZyYW1lKTtcbiAgICB9LCBzdGVwU3BlZWQgKiAzKTtcblxuICAgIGlmIChza2luLndhbGxQZWdtYW5BbmltYXRpb24pIHtcbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICAgICAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgdXBkYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgICAgICBpZFN0cjogJ3dhbGwnLFxuICAgICAgICAgIHJvdzogTWF6ZS5wZWdtYW5ZLFxuICAgICAgICAgIGNvbDogTWF6ZS5wZWdtYW5YLFxuICAgICAgICAgIGRpcmVjdGlvbjogTWF6ZS5wZWdtYW5EXG4gICAgICAgIH0pO1xuICAgICAgfSwgc3RlcFNwZWVkICogNCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHNxdWFyZVR5cGUgPT0gU3F1YXJlVHlwZS5PQlNUQUNMRSkge1xuICAgIC8vIFBsYXkgdGhlIHNvdW5kXG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnb2JzdGFjbGUnKTtcblxuICAgIC8vIFBsYXkgdGhlIGFuaW1hdGlvblxuICAgIHZhciBvYnNJZCA9IHRhcmdldFggKyBNYXplLm1hcC5DT0xTICogdGFyZ2V0WTtcbiAgICB2YXIgb2JzSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnN0YWNsZScgKyBvYnNJZCk7XG4gICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgIHNraW4ub2JzdGFjbGVBbmltYXRpb24pO1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YICsgZGVsdGFYIC8gMixcbiAgICAgICAgICAgICAgICAgICAgICAgICBNYXplLnBlZ21hblkgKyBkZWx0YVkgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lKTtcbiAgICB9LCBzdGVwU3BlZWQpO1xuXG4gICAgLy8gUmVwbGFjZSB0aGUgb2JqZWN0cyBhcm91bmQgb2JzdGFjbGVzIHdpdGggYnJva2VuIG9iamVjdHNcbiAgICBpZiAoc2tpbi5sYXJnZXJPYnN0YWNsZUFuaW1hdGlvblRpbGVzKSB7XG4gICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBNYXplLnVwZGF0ZVN1cnJvdW5kaW5nVGlsZXMoXG4gICAgICAgICAgICB0YXJnZXRZLCB0YXJnZXRYLCBza2luLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMpO1xuICAgICAgfSwgc3RlcFNwZWVkKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgcGVnbWFuXG4gICAgaWYgKCFza2luLm5vbkRpc2FwcGVhcmluZ1BlZ21hbkhpdHRpbmdPYnN0YWNsZSkge1xuICAgICAgdmFyIHN2Z01hemUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuICAgICAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG5cbiAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgfSwgc3RlcFNwZWVkICogMik7XG4gICAgfVxuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gICAgfSwgc3RlcFNwZWVkKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgdGhlIHRpbGVzIHRvIGJlIHRyYW5zcGFyZW50IGdyYWR1YWxseS5cbiAqL1xuZnVuY3Rpb24gc2V0VGlsZVRyYW5zcGFyZW50ICgpIHtcbiAgdmFyIHRpbGVJZCA9IDA7XG4gIGZvciAodmFyIHkgPSAwOyB5IDwgTWF6ZS5tYXAuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICB2YXIgdGlsZUFuaW1hdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlQW5pbWF0aW9uJyArIHRpbGVJZCk7XG4gICAgICBpZiAodGlsZUVsZW1lbnQpIHtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMCk7XG4gICAgICB9XG4gICAgICBpZiAodGlsZUFuaW1hdGlvbiAmJiB0aWxlQW5pbWF0aW9uLmJlZ2luRWxlbWVudCkge1xuICAgICAgICAvLyBJRSBkb2Vzbid0IHN1cHBvcnQgYmVnaW5FbGVtZW50LCBzbyBjaGVjayBmb3IgaXQuXG4gICAgICAgIHRpbGVBbmltYXRpb24uYmVnaW5FbGVtZW50KCk7XG4gICAgICB9XG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0UGVnbWFuVHJhbnNwYXJlbnQoKSB7XG4gIHZhciBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbkZhZGVvdXRBbmltYXRpb24nKTtcbiAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gIGlmIChwZWdtYW5JY29uKSB7XG4gICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAwKTtcbiAgfVxuICBpZiAocGVnbWFuRmFkZW91dEFuaW1hdGlvbiAmJiBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLmJlZ2luRWxlbWVudCkge1xuICAgIC8vIElFIGRvZXNuJ3Qgc3VwcG9ydCBiZWdpbkVsZW1lbnQsIHNvIGNoZWNrIGZvciBpdC5cbiAgICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLmJlZ2luRWxlbWVudCgpO1xuICB9XG59XG5cblxuXG5cblxuLyoqXG4gKiBTY2hlZHVsZSB0aGUgYW5pbWF0aW9ucyBhbmQgc291bmQgZm9yIGEgZGFuY2UuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHZpY3RvcnlEYW5jZSBUaGlzIGlzIGEgdmljdG9yeSBkYW5jZSBhZnRlciBjb21wbGV0aW5nIHRoZVxuICogICBwdXp6bGUgKHZzLiBkYW5jaW5nIG9uIGxvYWQpLlxuICogQHBhcmFtIHtpbnRlZ2VyfSB0aW1lQWxsb3RlZCBIb3cgbXVjaCB0aW1lIHdlIGhhdmUgZm9yIG91ciBhbmltYXRpb25zXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlRGFuY2UodmljdG9yeURhbmNlLCB0aW1lQWxsb3RlZCkge1xuICBpZiAobWF6ZVV0aWxzLmlzU2NyYXRTa2luKHNraW4uaWQpKSB7XG4gICAgc2NyYXQuc2NoZWR1bGVEYW5jZSh2aWN0b3J5RGFuY2UsIHRpbWVBbGxvdGVkLCBza2luKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgb3JpZ2luYWxGcmFtZSA9IHRpbGVzLmRpcmVjdGlvblRvRnJhbWUoTWF6ZS5wZWdtYW5EKTtcbiAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAxNik7XG5cbiAgLy8gSWYgdmljdG9yeURhbmNlID09IHRydWUsIHBsYXkgdGhlIGdvYWwgYW5pbWF0aW9uLCBlbHNlIHJlc2V0IGl0XG4gIHZhciBmaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmlzaCcpO1xuICBpZiAodmljdG9yeURhbmNlICYmIGZpbmlzaEljb24pIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW5Hb2FsJyk7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW4uZ29hbEFuaW1hdGlvbik7XG4gIH1cblxuICBpZiAodmljdG9yeURhbmNlKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG4gIH1cblxuICB2YXIgZGFuY2VTcGVlZCA9IHRpbWVBbGxvdGVkIC8gNTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIDE4KTtcbiAgfSwgZGFuY2VTcGVlZCk7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAyMCk7XG4gIH0sIGRhbmNlU3BlZWQgKiAyKTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIDE4KTtcbiAgfSwgZGFuY2VTcGVlZCAqIDMpO1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgMjApO1xuICB9LCBkYW5jZVNwZWVkICogNCk7XG5cbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF2aWN0b3J5RGFuY2UgfHwgc2tpbi50dXJuQWZ0ZXJWaWN0b3J5KSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIG9yaWdpbmFsRnJhbWUpO1xuICAgIH1cblxuICAgIGlmICh2aWN0b3J5RGFuY2UgJiYgc2tpbi50cmFuc3BhcmVudFRpbGVFbmRpbmcpIHtcbiAgICAgIHNldFRpbGVUcmFuc3BhcmVudCgpO1xuICAgIH1cblxuICAgIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICAgIHNldFBlZ21hblRyYW5zcGFyZW50KCk7XG4gICAgfVxuICB9LCBkYW5jZVNwZWVkICogNSk7XG59XG5cbi8qKlxuICogRGlzcGxheSBQZWdtYW4gYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbiwgZmFjaW5nIHRoZSBzcGVjaWZpZWQgZGlyZWN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHggSG9yaXpvbnRhbCBncmlkIChvciBmcmFjdGlvbiB0aGVyZW9mKS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFZlcnRpY2FsIGdyaWQgKG9yIGZyYWN0aW9uIHRoZXJlb2YpLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lIERpcmVjdGlvbiAoMCAtIDE1KSBvciBkYW5jZSAoMTYgLSAxNykuXG4gKi9cbk1hemUuZGlzcGxheVBlZ21hbiA9IGZ1bmN0aW9uKHgsIHksIGZyYW1lKSB7XG4gIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgeCAqIE1hemUuU1FVQVJFX1NJWkUgLSBmcmFtZSAqIE1hemUuUEVHTUFOX1dJRFRIICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLCBnZXRQZWdtYW5ZRm9yUm93KHkpKTtcblxuICB2YXIgY2xpcFJlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpcFJlY3QnKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCd4JywgeCAqIE1hemUuU1FVQVJFX1NJWkUgKyAxICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQpO1xuICBjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCBwZWdtYW5JY29uLmdldEF0dHJpYnV0ZSgneScpKTtcbn07XG5cbnZhciBzY2hlZHVsZURpcnRDaGFuZ2UgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBjb2wgPSBNYXplLnBlZ21hblg7XG4gIHZhciByb3cgPSBNYXplLnBlZ21hblk7XG4gIE1hemUubWFwLnNldFZhbHVlKHJvdywgY29sLCBNYXplLm1hcC5nZXRWYWx1ZShyb3csIGNvbCkgKyBvcHRpb25zLmFtb3VudCk7XG4gIE1hemUuZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlSXRlbUltYWdlKHJvdywgY29sLCB0cnVlKTtcbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhvcHRpb25zLnNvdW5kKTtcbn07XG5cbi8qKlxuICogU2NoZWR1bGUgdG8gYWRkIGRpcnQgYXQgcGVnbWFuJ3MgY3VycmVudCBwb3NpdGlvbi5cbiAqL1xuTWF6ZS5zY2hlZHVsZUZpbGwgPSBmdW5jdGlvbigpIHtcbiAgc2NoZWR1bGVEaXJ0Q2hhbmdlKHtcbiAgICBhbW91bnQ6IDEsXG4gICAgc291bmQ6ICdmaWxsJ1xuICB9KTtcbn07XG5cbi8qKlxuICogU2NoZWR1bGUgdG8gcmVtb3ZlIGRpcnQgYXQgcGVnbWFuJ3MgY3VycmVudCBsb2NhdGlvbi5cbiAqL1xuTWF6ZS5zY2hlZHVsZURpZyA9IGZ1bmN0aW9uKCkge1xuICBzY2hlZHVsZURpcnRDaGFuZ2Uoe1xuICAgIGFtb3VudDogLTEsXG4gICAgc291bmQ6ICdkaWcnXG4gIH0pO1xufTtcblxuLyoqXG4gKiBEaXNwbGF5IHRoZSBsb29rIGljb24gYXQgUGVnbWFuJ3MgY3VycmVudCBsb2NhdGlvbixcbiAqIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0aW9uLlxuICogQHBhcmFtIHshRGlyZWN0aW9ufSBkIERpcmVjdGlvbiAoMCAtIDMpLlxuICovXG5NYXplLnNjaGVkdWxlTG9vayA9IGZ1bmN0aW9uKGQpIHtcbiAgdmFyIHggPSBNYXplLnBlZ21hblg7XG4gIHZhciB5ID0gTWF6ZS5wZWdtYW5ZO1xuICBzd2l0Y2ggKGQpIHtcbiAgICBjYXNlIERpcmVjdGlvbi5OT1JUSDpcbiAgICAgIHggKz0gMC41O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uRUFTVDpcbiAgICAgIHggKz0gMTtcbiAgICAgIHkgKz0gMC41O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uU09VVEg6XG4gICAgICB4ICs9IDAuNTtcbiAgICAgIHkgKz0gMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLldFU1Q6XG4gICAgICB5ICs9IDAuNTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHggKj0gTWF6ZS5TUVVBUkVfU0laRTtcbiAgeSAqPSBNYXplLlNRVUFSRV9TSVpFO1xuICBkID0gZCAqIDkwIC0gNDU7XG5cbiAgdmFyIGxvb2tJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvb2snKTtcbiAgbG9va0ljb24uc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLFxuICAgICAgJ3RyYW5zbGF0ZSgnICsgeCArICcsICcgKyB5ICsgJykgJyArXG4gICAgICAncm90YXRlKCcgKyBkICsgJyAwIDApIHNjYWxlKC40KScpO1xuICB2YXIgcGF0aHMgPSBsb29rSWNvbi5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGF0aCcpO1xuICBsb29rSWNvbi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0aCA9IHBhdGhzW2ldO1xuICAgIE1hemUuc2NoZWR1bGVMb29rU3RlcChwYXRoLCBzdGVwU3BlZWQgKiBpKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTY2hlZHVsZSBvbmUgb2YgdGhlICdsb29rJyBpY29uJ3Mgd2F2ZXMgdG8gYXBwZWFyLCB0aGVuIGRpc2FwcGVhci5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhdGggRWxlbWVudCB0byBtYWtlIGFwcGVhci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWxheSBNaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgbWFraW5nIHdhdmUgYXBwZWFyLlxuICovXG5NYXplLnNjaGVkdWxlTG9va1N0ZXAgPSBmdW5jdGlvbihwYXRoLCBkZWxheSkge1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHBhdGguc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcGF0aC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0sIHN0ZXBTcGVlZCAqIDIpO1xuICB9LCBkZWxheSk7XG59O1xuXG5mdW5jdGlvbiBhdEZpbmlzaCAoKSB7XG4gIHJldHVybiAhTWF6ZS5maW5pc2hfIHx8XG4gICAgICAoTWF6ZS5wZWdtYW5YID09IE1hemUuZmluaXNoXy54ICYmIE1hemUucGVnbWFuWSA9PSBNYXplLmZpbmlzaF8ueSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlydENvcnJlY3QgKCkge1xuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBNYXplLm1hcC5ST1dTOyByb3crKykge1xuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IE1hemUubWFwLkNPTFM7IGNvbCsrKSB7XG4gICAgICBpZiAoTWF6ZS5tYXAuaXNEaXJ0KHJvdywgY29sKSAmJiBNYXplLm1hcC5nZXRWYWx1ZShyb3csIGNvbCkgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFsbCBnb2FscyBoYXZlIGJlZW4gYWNjb21wbGlzaGVkXG4gKi9cbk1hemUuY2hlY2tTdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmaW5pc2hlZDtcbiAgaWYgKCFhdEZpbmlzaCgpKSB7XG4gICAgZmluaXNoZWQgPSBmYWxzZTtcbiAgfSBlbHNlIGlmIChNYXplLmJlZSkge1xuICAgIGZpbmlzaGVkID0gTWF6ZS5iZWUuZmluaXNoZWQoKTtcbiAgfSBlbHNlIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICBmaW5pc2hlZCA9IE1hemUud29yZFNlYXJjaC5maW5pc2hlZCgpO1xuICB9IGVsc2Uge1xuICAgIGZpbmlzaGVkID0gaXNEaXJ0Q29ycmVjdCgpO1xuICB9XG5cbiAgaWYgKGZpbmlzaGVkKSB7XG4gICAgLy8gRmluaXNoZWQuICBUZXJtaW5hdGUgdGhlIHVzZXIncyBwcm9ncmFtLlxuICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignZmluaXNoJywgbnVsbCk7XG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZSh0cnVlKTtcbiAgfVxuICByZXR1cm4gZmluaXNoZWQ7XG59O1xuXG4vKipcbiAqIENhbGxlZCBhZnRlciB1c2VyJ3MgY29kZSBoYXMgZmluaXNoZWQgYmVpbmcgZXhlY3V0ZWQsIGdpdmluZyB1cyBvbmUgbW9yZVxuICogY2hhbmNlIHRvIGNoZWNrIGlmIHdlJ3ZlIGFjY29tcGxpc2hlZCBvdXIgZ29hbHMuIFRoaXMgaXMgcmVxdWlyZWQgaW4gcGFydFxuICogYmVjYXVzZSBlbHNld2hlcmUgd2Ugb25seSBjaGVjayBmb3Igc3VjY2VzcyBhZnRlciBtb3ZlbWVudC5cbiAqL1xuTWF6ZS5vbkV4ZWN1dGlvbkZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gSWYgd2UgaGF2ZW4ndCB0ZXJtaW5hdGVkLCBtYWtlIG9uZSBsYXN0IGNoZWNrIGZvciBzdWNjZXNzXG4gIGlmICghTWF6ZS5leGVjdXRpb25JbmZvLmlzVGVybWluYXRlZCgpKSB7XG4gICAgTWF6ZS5jaGVja1N1Y2Nlc3MoKTtcbiAgfVxuXG4gIGlmIChNYXplLmJlZSkge1xuICAgIE1hemUuYmVlLm9uRXhlY3V0aW9uRmluaXNoKCk7XG4gIH1cbn07XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBjZWxsSWQgPSByZXF1aXJlKCcuL21hemVVdGlscycpLmNlbGxJZDtcblxudmFyIFNxdWFyZVR5cGUgPSByZXF1aXJlKCcuL3RpbGVzJykuU3F1YXJlVHlwZTtcblxudmFyIFNWR19OUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpLlNWR19OUztcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgV29yZFNlYXJjaC5cbiAqL1xudmFyIFdvcmRTZWFyY2ggPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChnb2FsLCBtYXAsIGRyYXdUaWxlRm4pIHtcbiAgdGhpcy5nb2FsXyA9IGdvYWw7XG4gIHRoaXMudmlzaXRlZF8gPSAnJztcbiAgdGhpcy5tYXBfID0gbWFwO1xufTtcblxudmFyIEFMTF9DSEFSUyA9IFtcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIsIFwiRlwiLCBcIkdcIiwgXCJIXCIsIFwiSVwiLCBcIkpcIiwgXCJLXCIsIFwiTFwiLFxuICBcIk1cIiwgXCJOXCIsIFwiT1wiLCBcIlBcIiwgXCJRXCIsIFwiUlwiLCBcIlNcIiwgXCJUXCIsIFwiVVwiLCBcIlZcIiwgXCJXXCIsIFwiWFwiLCBcIllcIiwgXCJaXCJdO1xuXG52YXIgU1RBUlRfQ0hBUiA9ICctJztcbnZhciBFTVBUWV9DSEFSID0gJ18nO1xuXG4vLyB0aGlzIHNob3VsZCBtYXRjaCB3aXRoIE1hemUuU1FVQVJFX1NJWkVcbnZhciBTUVVBUkVfU0laRSA9IDUwO1xuXG4vKipcbiAqIEdlbmVyYXRlIHJhbmRvbSB0aWxlcyBmb3Igd2FsbHMgKHdpdGggc29tZSByZXN0cmljdGlvbnMpIGFuZCBkcmF3IHRoZW0gdG9cbiAqIHRoZSBzdmcuXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLmRyYXdNYXBUaWxlcyA9IGZ1bmN0aW9uIChzdmcpIHtcbiAgdmFyIGxldHRlcjtcbiAgdmFyIHJlc3RyaWN0ZWQ7XG5cbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5tYXBfLmxlbmd0aDsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLm1hcF9bcm93XS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICB2YXIgbWFwVmFsID0gdGhpcy5tYXBfW3Jvd11bY29sXTtcbiAgICAgIGlmIChtYXBWYWwgPT09IEVNUFRZX0NIQVIpIHtcbiAgICAgICAgcmVzdHJpY3RlZCA9IHRoaXMucmVzdHJpY3RlZFZhbHVlc18ocm93LCBjb2wpO1xuICAgICAgICBsZXR0ZXIgPSByYW5kb21MZXR0ZXIocmVzdHJpY3RlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXR0ZXIgPSBsZXR0ZXJWYWx1ZShtYXBWYWwsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdUaWxlXyhzdmcsIGxldHRlciwgcm93LCBjb2wpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgd2UndmUgc3BlbGxlZCB0aGUgcmlnaHQgd29yZC5cbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUuZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnZpc2l0ZWRfID09PSB0aGlzLmdvYWxfO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHJvdyxjb2wgaXMgYm90aCBvbiB0aGUgZ3JpZCBhbmQgbm90IGEgd2FsbFxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5pc09wZW5fID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHZhciBtYXAgPSB0aGlzLm1hcF87XG4gIHJldHVybiAoKG1hcFtyb3ddICE9PSB1bmRlZmluZWQpICYmXG4gICAgKG1hcFtyb3ddW2NvbF0gIT09IHVuZGVmaW5lZCkgJiZcbiAgICAobWFwW3Jvd11bY29sXSAhPT0gU3F1YXJlVHlwZS5XQUxMKSk7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgcm93IGFuZCBjb2wsIHJldHVybnMgdGhlIHJvdywgY29sIHBhaXIgb2YgYW55IG5vbi13YWxsIG5laWdoYm9yc1xuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5vcGVuTmVpZ2hib3JzXyA9ZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHZhciBuZWlnaGJvcnMgPSBbXTtcbiAgaWYgKHRoaXMuaXNPcGVuXyhyb3cgKyAxLCBjb2wpKSB7XG4gICAgbmVpZ2hib3JzLnB1c2goW3JvdyArIDEsIGNvbF0pO1xuICB9XG4gIGlmICh0aGlzLmlzT3Blbl8ocm93IC0gMSwgY29sKSkge1xuICAgIG5laWdoYm9ycy5wdXNoKFtyb3cgLSAxLCBjb2xdKTtcbiAgfVxuICBpZiAodGhpcy5pc09wZW5fKHJvdywgY29sICsgMSkpIHtcbiAgICBuZWlnaGJvcnMucHVzaChbcm93LCBjb2wgKyAxXSk7XG4gIH1cbiAgaWYgKHRoaXMuaXNPcGVuXyhyb3csIGNvbCAtIDEpKSB7XG4gICAgbmVpZ2hib3JzLnB1c2goW3JvdywgY29sIC0gMV0pO1xuICB9XG5cbiAgcmV0dXJuIG5laWdoYm9ycztcbn07XG5cbi8qKlxuICogV2UgbmV2ZXIgd2FudCB0byBoYXZlIGEgYnJhbmNoIHdoZXJlIGVpdGhlciBkaXJlY3Rpb24gZ2V0cyB5b3UgdGhlIG5leHRcbiAqIGNvcnJlY3QgbGV0dGVyLiAgQXMgc3VjaCwgYSBcIndhbGxcIiBzcGFjZSBzaG91bGQgbmV2ZXIgaGF2ZSB0aGUgc2FtZSB2YWx1ZSBhc1xuICogYW4gb3BlbiBuZWlnaGJvciBvZiBhbiBuZWlnaGJvciAoaS5lLiBpZiBteSBub24td2FsbCBuZWlnaGJvciBoYXMgYSBub24td2FsbFxuICogbmVpZ2hib3Igd2hvc2UgdmFsdWUgaXMgRSwgSSBjYW4ndCBhbHNvIGJlIEUpXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLnJlc3RyaWN0ZWRWYWx1ZXNfID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHZhciBtYXAgPSB0aGlzLm1hcF87XG4gIHZhciBuZWlnaGJvcnMgPSB0aGlzLm9wZW5OZWlnaGJvcnNfKHJvdywgY29sKTtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5laWdoYm9ycy5sZW5ndGg7IGkgKyspIHtcbiAgICB2YXIgc2Vjb25kTmVpZ2hib3JzID0gdGhpcy5vcGVuTmVpZ2hib3JzXyhuZWlnaGJvcnNbaV1bMF0sIG5laWdoYm9yc1tpXVsxXSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZWNvbmROZWlnaGJvcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBuZWlnaGJvclJvdyA9IHNlY29uZE5laWdoYm9yc1tqXVswXTtcbiAgICAgIHZhciBuZWlnaGJvckNvbCA9IHNlY29uZE5laWdoYm9yc1tqXVsxXTtcbiAgICAgIC8vIHB1c2ggdmFsdWUgdG8gcmVzdHJpY3RlZCBsaXN0XG4gICAgICB2YXIgdmFsID0gbGV0dGVyVmFsdWUobWFwW25laWdoYm9yUm93XVtuZWlnaGJvckNvbF0sIGZhbHNlKTtcbiAgICAgIHZhbHVlcy5wdXNoKHZhbCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufTtcblxuLyoqXG4gKiBEcmF3IGEgZ2l2ZW4gdGlsZS4gIE92ZXJyaWRlcyB0aGUgbG9naWMgb2YgTWF6ZS5kcmF3VGlsZVxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5kcmF3VGlsZV8gPSBmdW5jdGlvbiAoc3ZnLCBsZXR0ZXIsIHJvdywgY29sKSB7XG4gIHZhciBiYWNrZ3JvdW5kSWQgPSBjZWxsSWQoJ2JhY2tncm91bmRMZXR0ZXInLCByb3csIGNvbCk7XG4gIHZhciB0ZXh0SWQgPSBjZWxsSWQoJ2xldHRlcicsIHJvdywgY29sKTtcblxuICB2YXIgZ3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnZycpO1xuICB2YXIgYmFja2dyb3VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdyZWN0Jyk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCdpZCcsIGJhY2tncm91bmRJZCk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd3aWR0aCcsIFNRVUFSRV9TSVpFKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3gnLCBjb2wgKiBTUVVBUkVfU0laRSk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd5Jywgcm93ICogU1FVQVJFX1NJWkUpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJyMwMDAwMDAnKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIDMpO1xuICBncm91cC5hcHBlbmRDaGlsZChiYWNrZ3JvdW5kKTtcblxuICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICd0ZXh0Jyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdpZCcsIHRleHRJZCk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzZWFyY2gtbGV0dGVyJyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd3aWR0aCcsIFNRVUFSRV9TSVpFKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3gnLCAoY29sICsgMC41KSAqIFNRVUFSRV9TSVpFKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3knLCAocm93ICsgMC41KSAqIFNRVUFSRV9TSVpFKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2ZvbnQtc2l6ZScsIDMyKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnZm9udC1mYW1pbHknLCAnVmVyZGFuYScpO1xuICB0ZXh0LnRleHRDb250ZW50ID0gbGV0dGVyO1xuICBncm91cC5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKGdyb3VwKTtcbn07XG5cbi8qKlxuICogUmVzZXQgYWxsIHRpbGVzIHRvIGJlZ2lubmluZyBzdGF0ZVxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5yZXNldFRpbGVzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLm1hcF8ubGVuZ3RoOyByb3crKykge1xuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMubWFwX1tyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgIHRoaXMudXBkYXRlVGlsZUhpZ2hsaWdodF8ocm93LCBjb2wsIGZhbHNlKTtcbiAgICB9XG4gIH1cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnRXb3JkQ29udGVudHMnKS50ZXh0Q29udGVudCA9ICcnO1xuICB0aGlzLnZpc2l0ZWRfID0gJyc7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBhIHRpbGUncyBoaWdobGlnaHRpbmcuIElmIHdlJ3ZlIGZsb3duIG92ZXIgaXQsIGl0IHNob3VsZCBiZSBncmVlbi5cbiAqIE90aGVyd2lzZSB3ZSBoYXZlIGEgY2hlY2tib2FyZCBhcHByb2FjaC5cbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUudXBkYXRlVGlsZUhpZ2hsaWdodF8gPSBmdW5jdGlvbiAocm93LCBjb2wsIGhpZ2hsaWdodGVkKSB7XG4gIHZhciBiYWNrQ29sb3IgPSAocm93ICsgY29sKSAlIDIgPT09IDAgPyAnI2RhZTNmMycgOiAnI2ZmZmZmZic7XG4gIHZhciB0ZXh0Q29sb3IgPSBoaWdobGlnaHRlZCA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICBpZiAoaGlnaGxpZ2h0ZWQpIHtcbiAgICBiYWNrQ29sb3IgPSAnIzAwYjA1MCc7XG4gIH1cbiAgdmFyIGJhY2tncm91bmRJZCA9IGNlbGxJZCgnYmFja2dyb3VuZExldHRlcicsIHJvdywgY29sKTtcbiAgdmFyIHRleHRJZCA9IGNlbGxJZCgnbGV0dGVyJywgcm93LCBjb2wpO1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJhY2tncm91bmRJZCkuc2V0QXR0cmlidXRlKCdmaWxsJywgYmFja0NvbG9yKTtcbiAgdmFyIHRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZXh0SWQpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnZmlsbCcsIHRleHRDb2xvcik7XG5cbiAgLy8gc2hvdWxkIG9ubHkgYmUgZmFsc2UgaW4gdW5pdCB0ZXN0c1xuICBpZiAodGV4dC5nZXRCQm94KSB7XG4gICAgLy8gY2VudGVyIHRleHQuXG4gICAgdmFyIGJib3ggPSB0ZXh0LmdldEJCb3goKTtcbiAgICB2YXIgaGVpZ2h0RGlmZiA9IFNRVUFSRV9TSVpFIC0gYmJveC5oZWlnaHQ7XG4gICAgdmFyIHRhcmdldFRvcFkgPSByb3cgKiBTUVVBUkVfU0laRSArIGhlaWdodERpZmYgLyAyO1xuICAgIHZhciBvZmZzZXQgPSB0YXJnZXRUb3BZIC0gYmJveC55O1xuXG4gICAgdGV4dC5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwgXCIgKyBvZmZzZXQgKyBcIilcIik7XG4gIH1cbn07XG5cbi8qKlxuICogTWFyayB0aGF0IHdlJ3ZlIHZpc2l0ZWQgYSB0aWxlXG4gKiBAcGFyYW0ge251bWJlcn0gcm93IFJvdyB2aXNpdGVkXG4gKiBAcGFyYW0ge251bWJlcn0gY29sIENvbHVtbiB2aXNpdGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGFuaW1hdGluZyBUcnVlIGlmIHRoaXMgaXMgd2hpbGUgYW5pbWF0aW5nXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLm1hcmtUaWxlVmlzaXRlZCA9IGZ1bmN0aW9uIChyb3csIGNvbCwgYW5pbWF0aW5nKSB7XG4gIHZhciBsZXR0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjZWxsSWQoJ2xldHRlcicsIHJvdywgY29sKSkudGV4dENvbnRlbnQ7XG4gIHRoaXMudmlzaXRlZF8gKz0gbGV0dGVyO1xuXG4gIGlmIChhbmltYXRpbmcpIHtcbiAgICB0aGlzLnVwZGF0ZVRpbGVIaWdobGlnaHRfKHJvdywgY29sLCB0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudFdvcmRDb250ZW50cycpLnRleHRDb250ZW50ID0gdGhpcy52aXNpdGVkXztcbiAgfVxufTtcblxuLyoqXG4gKiBGb3Igd29yZHNlYXJjaCwgdmFsdWVzIGluIE1hemUubWFwIGNhbiB0YWtlIHRoZSBmb3JtIG9mIGEgbnVtYmVyIChpLmUuIDIgbWVhbnNcbiAqIHN0YXJ0KSwgYSBsZXR0ZXIgKCdBJyBtZWFucyBBKSwgb3IgYSBsZXR0ZXIgZm9sbG93ZWQgYnkgeCAoJ054JyBtZWFucyBOIGFuZFxuICogdGhhdCB0aGlzIGlzIHRoZSBmaW5pc2guICBUaGlzIGZ1bmN0aW9uIHdpbGwgc3RyaXAgdGhlIHgsIGFuZCB3aWxsIGNvbnZlcnRcbiAqIG51bWJlciB2YWx1ZXMgdG8gU1RBUlRfQ0hBUlxuICovXG5mdW5jdGlvbiBsZXR0ZXJWYWx1ZSh2YWwpIHtcbiAgaWYgKHR5cGVvZih2YWwpID09PSBcIm51bWJlclwiKSB7XG4gICAgcmV0dXJuIFNUQVJUX0NIQVI7XG4gIH1cblxuICBpZiAodHlwZW9mKHZhbCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAvLyB0ZW1wb3JhcnkgaGFjayB0byBhbGxvdyB1cyB0byBoYXZlIDQgYXMgYSBsZXR0ZXJcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMiAmJiB2YWxbMF0gPT09ICdfJykge1xuICAgICAgcmV0dXJuIHZhbFsxXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbFswXTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcInVuZXhwZWN0ZWQgdmFsdWUgZm9yIGxldHRlclZhbHVlXCIpO1xufVxuXG4vKipcbiAqIFJldHVybiBhIHJhbmRvbSB1cHBlcmNhc2UgbGV0dGVyIHRoYXQgaXNuJ3QgaW4gdGhlIGxpc3Qgb2YgcmVzdHJpY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHJhbmRvbUxldHRlciAocmVzdHJpY3Rpb25zKSB7XG4gIHZhciBsZXR0ZXJQb29sO1xuICBpZiAocmVzdHJpY3Rpb25zKSB7XG4gICAgLy8gYXJncyBjb25zaXN0cyBvZiBBTExfQ0hBUlMgZm9sbG93ZWQgYnkgdGhlIHNldCBvZiByZXN0cmljdGVkIGxldHRlcnNcbiAgICB2YXIgYXJncyA9IHJlc3RyaWN0aW9ucyB8fCBbXTtcbiAgICBhcmdzLnVuc2hpZnQoQUxMX0NIQVJTKTtcbiAgICBsZXR0ZXJQb29sID0gXy53aXRob3V0LmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIGxldHRlclBvb2wgPSBBTExfQ0hBUlM7XG4gIH1cblxuICByZXR1cm4gXy5zYW1wbGUobGV0dGVyUG9vbCk7XG59XG5cblxuXG4vKiBzdGFydC10ZXN0LWJsb2NrICovXG4vLyBleHBvcnQgcHJpdmF0ZSBmdW5jdGlvbihzKSB0byBleHBvc2UgdG8gdW5pdCB0ZXN0aW5nXG5Xb3JkU2VhcmNoLl9fdGVzdG9ubHlfXyA9IHtcbiAgbGV0dGVyVmFsdWU6IGxldHRlclZhbHVlLFxuICByYW5kb21MZXR0ZXI6IHJhbmRvbUxldHRlcixcbiAgU1RBUlRfQ0hBUjogU1RBUlRfQ0hBUixcbiAgRU1QVFlfQ0hBUjogRU1QVFlfQ0hBUlxufTtcbi8qIGVuZC10ZXN0LWJsb2NrICovXG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cInN2Z01hemVcIj5cXG4gIDxnIGlkPVwibG9va1wiPlxcbiAgICA8cGF0aCBkPVwiTSAwLC0xNSBhIDE1IDE1IDAgMCAxIDE1IDE1XCIgLz5cXG4gICAgPHBhdGggZD1cIk0gMCwtMzUgYSAzNSAzNSAwIDAgMSAzNSAzNVwiIC8+XFxuICAgIDxwYXRoIGQ9XCJNIDAsLTU1IGEgNTUgNTUgMCAwIDEgNTUgNTVcIiAvPlxcbiAgPC9nPlxcbjwvc3ZnPlxcbjxkaXYgaWQ9XCJjYXBhY2l0eUJ1YmJsZVwiPlxcbiAgPGRpdiBpZD1cImNhcGFjaXR5XCI+PC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIFNxdWFyZVR5cGUgPSByZXF1aXJlKCcuL3RpbGVzJykuU3F1YXJlVHlwZTtcbnZhciBEaXJlY3Rpb24gPSByZXF1aXJlKCcuL3RpbGVzJykuRGlyZWN0aW9uO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG52YXIgVElMRV9TSEFQRVMgPSB7XG4gICdsb2cnOiAgICAgICAgICAgICBbMCwgMF0sXG4gICdsaWx5MSc6ICAgICAgICAgICBbMSwgMF0sXG4gICdsYW5kMSc6ICAgICAgICAgICBbMiwgMF0sXG4gICdpc2xhbmRfc3RhcnQnOiAgICBbMCwgMV0sXG4gICdpc2xhbmRfdG9wUmlnaHQnOiBbMSwgMV0sXG4gICdpc2xhbmRfYm90TGVmdCc6ICBbMCwgMl0sXG4gICdpc2xhbmRfYm90UmlnaHQnOiBbMSwgMl0sXG4gICd3YXRlcic6IFs0LCAwXSxcblxuICAnbGlseTInOiBbMiwgMV0sXG4gICdsaWx5Myc6IFszLCAxXSxcbiAgJ2xpbHk0JzogWzIsIDJdLFxuICAnbGlseTUnOiBbMywgMl0sXG5cbiAgJ2ljZSc6IFszLCAwXSxcblxuICAnZW1wdHknOiBbNCwgMF1cbn07XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgdGlsZSBhdCB4LHkgaXMgZWl0aGVyIGEgd2F0ZXIgdGlsZSBvciBvdXQgb2YgYm91bmRzXG5mdW5jdGlvbiBpc1dhdGVyT3JPdXRPZkJvdW5kcyAoY29sLCByb3cpIHtcbiAgcmV0dXJuIE1hemUubWFwLmdldFRpbGUocm93LCBjb2wpID09PSBTcXVhcmVUeXBlLldBTEwgfHxcbiAgICAgIE1hemUubWFwLmdldFRpbGUocm93LCBjb2wpID09PSB1bmRlZmluZWQ7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgdGlsZSBhdCB4LHkgaXMgYSB3YXRlciB0aWxlIHRoYXQgaXMgaW4gYm91bmRzLlxuZnVuY3Rpb24gaXNXYXRlciAoY29sLCByb3cpIHtcbiAgcmV0dXJuIE1hemUubWFwLmdldFRpbGUocm93LCBjb2wpID09PSBTcXVhcmVUeXBlLldBTEw7XG59XG5cbi8qKlxuICogT3ZlcnJpZGUgbWF6ZSdzIGRyYXdNYXBUaWxlc1xuICovXG5tb2R1bGUuZXhwb3J0cy5kcmF3TWFwVGlsZXMgPSBmdW5jdGlvbiAoc3ZnKSB7XG4gIHZhciByb3csIGNvbDtcblxuICAvLyBmaXJzdCBmaWd1cmUgb3V0IHdoZXJlIHdlIHdhbnQgdG8gcHV0IHRoZSBpc2xhbmRcbiAgdmFyIHBvc3NpYmxlSXNsYW5kTG9jYXRpb25zID0gW107XG4gIGZvciAocm93ID0gMDsgcm93IDwgTWF6ZS5tYXAuUk9XUzsgcm93KyspIHtcbiAgICBmb3IgKGNvbCA9IDA7IGNvbCA8IE1hemUubWFwLkNPTFM7IGNvbCsrKSB7XG4gICAgICBpZiAoIWlzV2F0ZXIoY29sLCByb3cpIHx8ICFpc1dhdGVyKGNvbCArIDEsIHJvdykgfHxcbiAgICAgICAgIWlzV2F0ZXIoY29sLCByb3cgKyAxKSB8fCAhaXNXYXRlcihjb2wgKyAxLCByb3cgKyAxKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHBvc3NpYmxlSXNsYW5kTG9jYXRpb25zLnB1c2goe3Jvdzogcm93LCBjb2w6IGNvbH0pO1xuICAgIH1cbiAgfVxuICB2YXIgaXNsYW5kID0gXy5zYW1wbGUocG9zc2libGVJc2xhbmRMb2NhdGlvbnMpO1xuICB2YXIgcHJlRmlsbGVkID0ge307XG4gIGlmIChpc2xhbmQpIHtcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAwKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAwKV0gPSAnaXNsYW5kX3N0YXJ0JztcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAxKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAwKV0gPSAnaXNsYW5kX2JvdExlZnQnO1xuICAgIHByZUZpbGxlZFsoaXNsYW5kLnJvdyArIDApICsgXCJfXCIgKyAoaXNsYW5kLmNvbCArIDEpXSA9ICdpc2xhbmRfdG9wUmlnaHQnO1xuICAgIHByZUZpbGxlZFsoaXNsYW5kLnJvdyArIDEpICsgXCJfXCIgKyAoaXNsYW5kLmNvbCArIDEpXSA9ICdpc2xhbmRfYm90UmlnaHQnO1xuICB9XG5cbiAgdmFyIHRpbGVJZCA9IDA7XG4gIHZhciB0aWxlO1xuICBmb3IgKHJvdyA9IDA7IHJvdyA8IE1hemUubWFwLlJPV1M7IHJvdysrKSB7XG4gICAgZm9yIChjb2wgPSAwOyBjb2wgPCBNYXplLm1hcC5DT0xTOyBjb2wrKykge1xuICAgICAgaWYgKCFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wsIHJvdykpIHtcbiAgICAgICAgdGlsZSA9ICdpY2UnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGFkamFjZW50VG9QYXRoID0gIWlzV2F0ZXJPck91dE9mQm91bmRzKGNvbCwgcm93IC0gMSkgfHxcbiAgICAgICAgICAhaXNXYXRlck9yT3V0T2ZCb3VuZHMoY29sICsgMSwgcm93KSB8fFxuICAgICAgICAgICFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wsIHJvdyArIDEpIHx8XG4gICAgICAgICAgIWlzV2F0ZXJPck91dE9mQm91bmRzKGNvbCAtIDEsIHJvdyk7XG5cbiAgICAgICAgLy8gaWYgbmV4dCB0byB0aGUgcGF0aCwgYWx3YXlzIGp1c3QgaGF2ZSB3YXRlci4gb3RoZXJ3aXNlLCB0aGVyZSdzXG4gICAgICAgIC8vIGEgY2hhbmNlIG9mIG9uZSBvZiBvdXIgb3RoZXIgdGlsZXNcbiAgICAgICAgdGlsZSA9ICd3YXRlcic7XG5cbiAgICAgICAgdGlsZSA9IHByZUZpbGxlZFtyb3cgKyBcIl9cIiArIGNvbF07XG4gICAgICAgIGlmICghdGlsZSkge1xuICAgICAgICAgIHRpbGUgPSBfLnNhbXBsZShbJ2VtcHR5JywgJ2VtcHR5JywgJ2VtcHR5JywgJ2VtcHR5JywgJ2VtcHR5JywgJ2xpbHkyJyxcbiAgICAgICAgICAgICdsaWx5MycsICdsaWx5NCcsICdsaWx5NScsICdsaWx5MScsICdsb2cnLCAnbGlseTEnLCAnbGFuZDEnXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWRqYWNlbnRUb1BhdGggJiYgdGlsZSA9PT0gJ2xhbmQxJykge1xuICAgICAgICAgIHRpbGUgPSAnZW1wdHknO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBNYXplLmRyYXdUaWxlKHN2ZywgVElMRV9TSEFQRVNbdGlsZV0sIHJvdywgY29sLCB0aWxlSWQpO1xuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRoZSBhbmltYXRpb25zIGZvciBTY3JhdCBkYW5jaW5nLlxuICogQHBhcmFtIHtpbnRlZ2VyfSB0aW1lQWxsb3RlZCBIb3cgbXVjaCB0aW1lIHdlIGhhdmUgZm9yIG91ciBhbmltYXRpb25zXG4gKi9cbm1vZHVsZS5leHBvcnRzLnNjaGVkdWxlRGFuY2UgPSBmdW5jdGlvbiAodmljdG9yeURhbmNlLCB0aW1lQWxsb3RlZCwgc2tpbikge1xuICB2YXIgZmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gnKTtcbiAgaWYgKGZpbmlzaEljb24pIHtcbiAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIHZhciBudW1GcmFtZXMgPSBza2luLmNlbGVicmF0ZVBlZ21hblJvdztcbiAgdmFyIHRpbWVQZXJGcmFtZSA9IHRpbWVBbGxvdGVkIC8gbnVtRnJhbWVzO1xuICB2YXIgc3RhcnQgPSB7eDogTWF6ZS5wZWdtYW5YLCB5OiBNYXplLnBlZ21hbll9O1xuXG4gIE1hemUuc2NoZWR1bGVTaGVldGVkTW92ZW1lbnQoe3g6IHN0YXJ0LngsIHk6IHN0YXJ0Lnl9LCB7eDogMCwgeTogMCB9LFxuICAgIG51bUZyYW1lcywgdGltZVBlckZyYW1lLCAnY2VsZWJyYXRlJywgRGlyZWN0aW9uLk5PUlRILCB0cnVlKTtcblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW4nKTtcbn07XG4iLCJ2YXIgTWF6ZU1hcCA9IGZ1bmN0aW9uIChncmlkKSB7XG4gIHRoaXMuZ3JpZF8gPSBncmlkO1xuXG4gIHRoaXMuUk9XUyA9IHRoaXMuZ3JpZF8ubGVuZ3RoO1xuICB0aGlzLkNPTFMgPSB0aGlzLmdyaWRfWzBdLmxlbmd0aDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IE1hemVNYXA7XG5cbk1hemVNYXAucHJvdG90eXBlLnJlc2V0RGlydCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5mb3JFYWNoQ2VsbChmdW5jdGlvbiAoY2VsbCkge1xuICAgIGlmIChjZWxsLmlzRGlydCgpKSB7XG4gICAgICBjZWxsLnJlc2V0Q3VycmVudFZhbHVlKCk7XG4gICAgfVxuICB9KTtcbn07XG5cbk1hemVNYXAucHJvdG90eXBlLmZvckVhY2hDZWxsID0gZnVuY3Rpb24gKGNiKSB7XG4gIHRoaXMuZ3JpZF8uZm9yRWFjaChmdW5jdGlvbiAocm93LCB4KSB7XG4gICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIHkpIHtcbiAgICAgIGNiKGNlbGwsIHgsIHkpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbk1hemVNYXAucHJvdG90eXBlLmlzRGlydCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHJldHVybiB0aGlzLmdyaWRfW3hdICYmIHRoaXMuZ3JpZF9beF1beV0gJiYgdGhpcy5ncmlkX1t4XVt5XS5pc0RpcnQoKTtcbn07XG5cbk1hemVNYXAucHJvdG90eXBlLmdldFRpbGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICByZXR1cm4gdGhpcy5ncmlkX1t4XSAmJiB0aGlzLmdyaWRfW3hdW3ldICYmIHRoaXMuZ3JpZF9beF1beV0uZ2V0VGlsZSgpO1xufTtcblxuTWF6ZU1hcC5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICByZXR1cm4gdGhpcy5ncmlkX1t4XSAmJiB0aGlzLmdyaWRfW3hdW3ldICYmIHRoaXMuZ3JpZF9beF1beV0uZ2V0Q3VycmVudFZhbHVlKCk7XG59O1xuXG5NYXplTWFwLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICh4LCB5LCB2YWwpIHtcbiAgaWYgKHRoaXMuZ3JpZF9beF0gJiYgdGhpcy5ncmlkX1t4XVt5XSkge1xuICAgIHRoaXMuZ3JpZF9beF1beV0uc2V0Q3VycmVudFZhbHVlKHZhbCk7XG4gIH1cbn07XG5cbk1hemVNYXAucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5ncmlkXy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICByZXR1cm4gY2VsbC5jbG9uZSgpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbk1hemVNYXAuZGVzZXJpYWxpemUgPSBmdW5jdGlvbiAoc2VyaWFsaXplZFZhbHVlcywgY2VsbENsYXNzKSB7XG4gIHJldHVybiBuZXcgTWF6ZU1hcChzZXJpYWxpemVkVmFsdWVzLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoY2VsbENsYXNzLmRlc2VyaWFsaXplKTtcbiAgfSkpO1xufTtcblxuTWF6ZU1hcC5wYXJzZUZyb21PbGRWYWx1ZXMgPSBmdW5jdGlvbiAobWFwLCBpbml0aWFsRGlydCwgY2VsbENsYXNzKSB7XG4gIHJldHVybiBuZXcgTWF6ZU1hcChtYXAubWFwKGZ1bmN0aW9uIChyb3csIHgpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmdW5jdGlvbiAobWFwQ2VsbCwgeSkge1xuICAgICAgdmFyIGluaXRpYWxEaXJ0Q2VsbCA9IGluaXRpYWxEaXJ0ICYmIGluaXRpYWxEaXJ0W3hdW3ldO1xuICAgICAgcmV0dXJuIGNlbGxDbGFzcy5wYXJzZUZyb21PbGRWYWx1ZXMobWFwQ2VsbCwgaW5pdGlhbERpcnRDZWxsKTtcbiAgICB9KTtcbiAgfSkpO1xufTtcbiIsInZhciBEaXJlY3Rpb24gPSByZXF1aXJlKCcuL3RpbGVzJykuRGlyZWN0aW9uO1xudmFyIGthcmVsTGV2ZWxzID0gcmVxdWlyZSgnLi9rYXJlbExldmVscycpO1xudmFyIHdvcmRzZWFyY2hMZXZlbHMgPSByZXF1aXJlKCcuL3dvcmRzZWFyY2hMZXZlbHMnKTtcbnZhciByZXFCbG9ja3MgPSByZXF1aXJlKCcuL3JlcXVpcmVkQmxvY2tzJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIG1hemVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHRvb2xib3guXG52YXIgdG9vbGJveCA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3Rvb2xib3hlcy9tYXplLnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHN0YXJ0QmxvY2tzLlxudmFyIHN0YXJ0QmxvY2tzID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vc3RhcnRCbG9ja3MueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBGb3JtZXJseSBQYWdlIDJcblxuICAnMl8xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxKSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAzLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMSlcbiAgfSxcbiAgJ2sxX2RlbW8nOiB7XG4gICAgJ3Rvb2xib3gnOiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVOb3J0aCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVNvdXRoJykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlRWFzdCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVdlc3QnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdjb250cm9sc19yZXBlYXRfc2ltcGxpZmllZCcpXG4gICAgKSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAzLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMSlcbiAgfSxcbiAgJzJfMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMiksXG4gICAgJ2lkZWFsJzogMyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDIsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDMsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAyKVxuICB9LFxuICAnMl8yXzUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDMpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCA0LCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCA0LCAwLCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMylcbiAgfSxcbiAgJzJfMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMyksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDQsIDEsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAzKVxuICB9LFxuICAnMl80Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA0KSxcbiAgICAnaWRlYWwnOiA5LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgNCwgMCwgMywgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDUpLFxuICAgICdpZGVhbCc6IDMsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5GT1JfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMiwgMSwgMSwgMSwgMSwgMywgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzYnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDYpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuRk9SX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDIsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDEsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDMsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl83Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA3KSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuRk9SX0xPT1BdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDMsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl84Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA4KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuRk9SX0xPT1BdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAzLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgOCksXG4gICAgJ2xldmVsSW5jb21wbGV0ZUVycm9yJzogbWF6ZU1zZy5yZXBlYXRDYXJlZnVsbHlFcnJvcigpLFxuICAgICd0b29GZXdCbG9ja3NNc2cnOiBtYXplTXNnLnJlcGVhdENhcmVmdWxseUVycm9yKClcbiAgfSxcbiAgJzJfOSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgOSksXG4gICAgJ2lkZWFsJzogMyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDIsIDEsIDEsIDEsIDEsIDMsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xMCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTApLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAzLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDExKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAzLCAxXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAxLCAxLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFsyLCAxLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEyKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFsxLCAyLCA0LCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAxLCAxLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAzLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAxXVxuICAgIF1cbiAgfSxcbiAgJzJfMTMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEzKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAzLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAyLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCA0LCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMTMpXG4gIH0sXG4gICcyXzE0Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxNCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuSVNfUEFUSF9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDQsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDEsIDRdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDAsIDBdLFxuICAgICAgWzAsIDMsIDEsIDEsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAnbGV2ZWxJbmNvbXBsZXRlRXJyb3InOiBtYXplTXNnLmlmSW5SZXBlYXRFcnJvcigpLFxuICAgICdzaG93UHJldmlvdXNMZXZlbEJ1dHRvbic6IHRydWVcbiAgfSxcbiAgJzJfMTUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE1KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLklTX1BBVEhfTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uTk9SVEgsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCA0LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAxLCAxLCAxLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAxLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAxLCAwLCAzLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAxLCAwLCAxLCAwLCAxLCAxLCA0XSxcbiAgICAgIFswLCAxLCAxLCAxLCAwLCAyLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTYnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE2KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5JU19QQVRIX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDQsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDEsIDIsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDEsIDEsIDRdLFxuICAgICAgWzAsIDEsIDEsIDMsIDAsIDEsIDAsIDRdLFxuICAgICAgWzAsIDEsIDAsIDAsIDAsIDEsIDAsIDFdLFxuICAgICAgWzAsIDEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xNyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTcpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuSVNfUEFUSF9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMSwgNCwgMSwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMywgMSwgMSwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICBbMCwgMSwgMCwgMSwgMCwgMCwgMSwgMF0sXG4gICAgICBbMSwgMSwgMSwgNCwgMSwgMCwgMSwgMF0sXG4gICAgICBbMCwgMSwgMCwgMSwgMCwgMiwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzE4Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxOCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5JU19QQVRIX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgNCwgMCwgNCwgMCwgNCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMCwgMSwgMCwgMSwgMF0sXG4gICAgICBbMCwgMiwgMSwgMSwgMSwgMSwgMSwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMCwgMSwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMCwgMSwgMSwgMF0sXG4gICAgICBbMCwgMSwgMywgMSwgMSwgMSwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzE5Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxOSksXG4gICAgJ2lkZWFsJzogNyxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLk5PUlRILFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMSwgMSwgMSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgMSwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMSwgMCwgMSwgMCwgMSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgMSwgMCwgMywgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMSwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMiwgMCwgMSwgMSwgMSwgMSwgMSwgMV1cbiAgICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAxOSlcbiAgIH0sXG5cbiAgLy8gQ29waWVkIGxldmVscyB3aXRoIGVkaXRDb2RlIGVuYWJsZWRcbiAgJzNfMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMSksXG4gICAgJ2lkZWFsJzogMyxcbiAgICAnZWRpdENvZGUnOiB0cnVlLFxuICAgICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAgICd0dXJuTGVmdCc6IG51bGwsXG4gICAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF1cbiAgICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDEsIDMsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnM18yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAyKSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdlZGl0Q29kZSc6IHRydWUsXG4gICAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICAgJ3R1cm5MZWZ0JzogbnVsbCxcbiAgICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXVxuICAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDIsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDEsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDMsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnM18zJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAzKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdlZGl0Q29kZSc6IHRydWUsXG4gICAgJ2NvZGVGdW5jdGlvbnMnOiB7XG4gICAgICAnbW92ZUZvcndhcmQnOiBudWxsLFxuICAgICAgJ3R1cm5MZWZ0JzogbnVsbCxcbiAgICAgICd0dXJuUmlnaHQnOiBudWxsLFxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCA0LCAxLCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzNfNCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNCksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAnZWRpdENvZGUnOiB0cnVlLFxuICAgICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAgICd0dXJuTGVmdCc6IG51bGwsXG4gICAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCA0LCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJ2N1c3RvbSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNCksXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCA0LCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfVxufTtcblxuXG4vLyBNZXJnZSBpbiBLYXJlbCBsZXZlbHMuXG5mb3IgKHZhciBsZXZlbElkIGluIGthcmVsTGV2ZWxzKSB7XG4gIG1vZHVsZS5leHBvcnRzWydrYXJlbF8nICsgbGV2ZWxJZF0gPSBrYXJlbExldmVsc1tsZXZlbElkXTtcbn1cblxuLy8gTWVyZ2UgaW4gV29yZHNlYXJjaCBsZXZlbHMuXG5mb3IgKHZhciBsZXZlbElkIGluIHdvcmRzZWFyY2hMZXZlbHMpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ3dvcmRzZWFyY2hfJyArIGxldmVsSWRdID0gd29yZHNlYXJjaExldmVsc1tsZXZlbElkXTtcbn1cblxuLy8gQWRkIHNvbWUgc3RlcCBsZXZlbHNcbmZ1bmN0aW9uIGNsb25lV2l0aFN0ZXAobGV2ZWwsIHN0ZXAsIHN0ZXBPbmx5KSB7XG4gIHZhciBvYmogPSB1dGlscy5leHRlbmQoe30sIG1vZHVsZS5leHBvcnRzW2xldmVsXSk7XG5cbiAgb2JqLnN0ZXAgPSBzdGVwO1xuICBvYmouc3RlcE9ubHkgPSBzdGVwT25seTtcbiAgbW9kdWxlLmV4cG9ydHNbbGV2ZWwgKyAnX3N0ZXAnXSA9IG9iajtcbn1cblxuY2xvbmVXaXRoU3RlcCgnMl8xJywgdHJ1ZSwgdHJ1ZSk7XG5jbG9uZVdpdGhTdGVwKCcyXzInLCB0cnVlLCBmYWxzZSk7XG5jbG9uZVdpdGhTdGVwKCcyXzE3JywgdHJ1ZSwgZmFsc2UpO1xuY2xvbmVXaXRoU3RlcCgna2FyZWxfMV85JywgdHJ1ZSwgZmFsc2UpO1xuY2xvbmVXaXRoU3RlcCgna2FyZWxfMl85JywgdHJ1ZSwgZmFsc2UpO1xuIiwidmFyIERpcmVjdGlvbiA9IHJlcXVpcmUoJy4vdGlsZXMnKS5EaXJlY3Rpb247XG52YXIgcmVxQmxvY2tzID0gcmVxdWlyZSgnLi9yZXF1aXJlZEJsb2NrcycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xuXG52YXIgd29yZFNlYXJjaFRvb2xib3ggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBibG9ja1V0aWxzLmNyZWF0ZVRvb2xib3goXG4gICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlTm9ydGgnKSArXG4gICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlU291dGgnKSArXG4gICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlRWFzdCcpICtcbiAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVXZXN0JylcbiAgKTtcbn07XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2tfMSc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnc2VhcmNoV29yZCc6ICdFQVNUJyxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgICAyLCAnRScsICdBJywgJ1MnLCAnVCcsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ0snLCAnRScsICdMJywgJ0wnLCAnWScsICdCJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZUVhc3QnKVxuICB9LFxuICAna18yJzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVTb3V0aF0sXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdTT1VUSCcsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydBJywgJ04nLCAnRycsICdJJywgJ0UnLCAnRCcsICdPJywgJ0cnXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAgIDIsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ1MnLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdPJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnVScsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ1QnLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdIJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlU291dGgnKVxuICB9LFxuICAna18zJzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVXZXN0XVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnV0VTVCcsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLldFU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydMJywgJ0UnLCAnVicsICdFJywgJ04nLCAnUycsICdPJywgJ04nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAnVCcsICdTJywgJ0UnLCAnVycsIDIsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVdlc3QnKVxuICB9LFxuICAna180Jzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVOb3J0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ05PUlRIJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uTk9SVEgsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICAvLyBXaGVuIHRoaXMgZ2V0cyByZW1vdmVkLCBhbHNvIHJlbW92ZSB0aGUgaGFjayBmcm9tIGxldHRlclZhbHVlXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnRycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnSCcsICdfJywgJ08nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ1QnLCAnXycsICdfNCcsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnUicsICdfJywgJ0knLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ08nLCAnXycsICdUJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdOJywgJ18nLCAnSicsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgMiAsICdfJywgJ1InLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdGJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzYnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlU291dGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdKVU1QJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnUycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ0EnLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydZJywgJ18nLCAgIDIsICdKJywgJ1UnLCAnTScsICdfJywgJ18nXSxcbiAgICAgIFsnRScsICdfJywgJ18nLCAnXycsICdfJywgJ1AnLCAnXycsICdfJ10sXG4gICAgICBbJ0UnLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydEJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzknOiB7XG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVOb3J0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ0NPREUnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ00nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdBJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnUicsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ0QnLCAnRScsICdfJywgJ0snLCAnXyddLFxuICAgICAgWydfJywgICAyLCAnQycsICdPJywgJ18nLCAnXycsICdOJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnUCcsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ0EnLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdNJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfMTMnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlU291dGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdERUJVRycsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgICAyLCAnRCcsICdFJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnQicsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ1UnLCAnRycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnSCcsICdFJywgJ04nLCAnUicsICdZJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9LFxuICAna18xNSc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlU291dGhdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ0FCT1ZFJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgIDIsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ0EnLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdCJywgJ08nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdWJywgJ0UnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9LFxuICAna18xNic6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVOb3J0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ0JFTE9XJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnVycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ08nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnRScsICdMJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAgMiwgJ0InLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzIwJzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZVNvdXRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnU1RPUlknLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgICAyLCAnUycsICdUJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnTycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ1InLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdZJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfVxuXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcbiAgJyk7NTsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgICAnKTs1OyBpZiAobGV2ZWwgPiAyKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZvcmV2ZXJcIj48L2Jsb2NrPlxcbiAgICAgICcpOzY7IGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZcIj48dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aExlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgICAgJyk7NzsgfSBlbHNlIGlmIChsZXZlbCA+IDUgJiYgbGV2ZWwgPCA5KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZcIj48L2Jsb2NrPlxcbiAgICAgICcpOzg7IH07IGJ1Zi5wdXNoKCcgICAgICAnKTs4OyBpZiAobGV2ZWwgPiA4KSB7OyBidWYucHVzaCgnICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZkVsc2VcIj48L2Jsb2NrPlxcbiAgICAgICcpOzk7IH07IGJ1Zi5wdXNoKCcgICAgJyk7OTsgfTsgYnVmLnB1c2goJyAgJyk7OTsgfSBlbHNlIGlmIChwYWdlID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7OTsgaWYgKGxldmVsID4gNCAmJiBsZXZlbCA8IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzEyOyB9OyBidWYucHVzaCgnICAgICcpOzEyOyBpZiAobGV2ZWwgPiA4KSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZvcmV2ZXJcIj48L2Jsb2NrPlxcbiAgICAgICcpOzEzOyBpZiAobGV2ZWwgPT0gMTMgfHwgbGV2ZWwgPT0gMTUpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZlwiPjx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgICAnKTsxNDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxNCB8fCBsZXZlbCA9PSAxNikgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmXCI+PHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhSaWdodDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgICAnKTsxNTsgfTsgYnVmLnB1c2goJyAgICAgICcpOzE1OyBpZiAobGV2ZWwgPiAxNikgezsgYnVmLnB1c2goJyAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZFbHNlXCI+PC9ibG9jaz5cXG4gICAgICAnKTsxNjsgfTsgYnVmLnB1c2goJyAgICAnKTsxNjsgfTsgYnVmLnB1c2goJyAgJyk7MTY7IH07IGJ1Zi5wdXNoKCc8L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IGlmIChwYWdlID09IDIpIHs7IGJ1Zi5wdXNoKCcgICcpOzE7IGlmIChsZXZlbCA8IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjM8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfZm9yZXZlclwiIHg9XCIyMFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aExlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsxNzsgfSBlbHNlIGlmIChsZXZlbCA9PSAxOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfZm9yZXZlclwiIHg9XCIyMFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZFbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkVMU0VcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZFbHNlXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aFJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTsyOTsgfTsgYnVmLnB1c2goJycpOzI5OyB9OyBidWYucHVzaCgnJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIHJlcXVpcmVkQmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL3JlcXVpcmVkX2Jsb2NrX3V0aWxzJyk7XG5cbnZhciBNT1ZFX0ZPUldBUkQgPSB7J3Rlc3QnOiAnbW92ZUZvcndhcmQnLCAndHlwZSc6ICdtYXplX21vdmVGb3J3YXJkJ307XG52YXIgVFVSTl9MRUZUID0geyd0ZXN0JzogJ3R1cm5MZWZ0JywgJ3R5cGUnOiAnbWF6ZV90dXJuJywgJ3RpdGxlcyc6IHsnRElSJzogJ3R1cm5MZWZ0J319O1xudmFyIFRVUk5fUklHSFQgPSB7J3Rlc3QnOiAndHVyblJpZ2h0JywgJ3R5cGUnOiAnbWF6ZV90dXJuJywgJ3RpdGxlcyc6IHsnRElSJzogJ3R1cm5SaWdodCd9fTtcbnZhciBXSElMRV9MT09QID0geyd0ZXN0JzogJ3doaWxlJywgJ3R5cGUnOiAnbWF6ZV9mb3JldmVyJ307XG52YXIgSVNfUEFUSF9MRUZUID0geyd0ZXN0JzogJ2lzUGF0aExlZnQnLCAndHlwZSc6ICdtYXplX2lmJywgJ3RpdGxlcyc6IHsnRElSJzogJ2lzUGF0aExlZnQnfX07XG52YXIgSVNfUEFUSF9SSUdIVCA9IHsndGVzdCc6ICdpc1BhdGhSaWdodCcsICd0eXBlJzogJ21hemVfaWYnLCAndGl0bGVzJzogeydESVInOiAnaXNQYXRoUmlnaHQnfX07XG52YXIgSVNfUEFUSF9GT1JXQVJEID0geyd0ZXN0JzogJ2lzUGF0aEZvcndhcmQnLCAndHlwZSc6ICdtYXplX2lmRWxzZScsICd0aXRsZXMnOiB7J0RJUic6ICdpc1BhdGhGb3J3YXJkJ319O1xudmFyIEZPUl9MT09QID0geyd0ZXN0JzogJ2ZvcicsICd0eXBlJzogJ2NvbnRyb2xzX3JlcGVhdCcsIHRpdGxlczoge1RJTUVTOiAnPz8/J319O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW92ZU5vcnRoOiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2soJ21hemVfbW92ZU5vcnRoJyksXG4gIG1vdmVTb3V0aDogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrKCdtYXplX21vdmVTb3V0aCcpLFxuICBtb3ZlRWFzdDogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrKCdtYXplX21vdmVFYXN0JyksXG4gIG1vdmVXZXN0OiByZXF1aXJlZEJsb2NrVXRpbHMuc2ltcGxlQmxvY2soJ21hemVfbW92ZVdlc3QnKSxcbiAgY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWQ6IHJlcXVpcmVkQmxvY2tVdGlscy5yZXBlYXRTaW1wbGVCbG9jaygnPz8/JyksXG4gIE1PVkVfRk9SV0FSRDogTU9WRV9GT1JXQVJELFxuICBUVVJOX0xFRlQ6IFRVUk5fTEVGVCxcbiAgVFVSTl9SSUdIVDogVFVSTl9SSUdIVCxcbiAgV0hJTEVfTE9PUDogV0hJTEVfTE9PUCxcbiAgSVNfUEFUSF9MRUZUOiBJU19QQVRIX0xFRlQsXG4gIElTX1BBVEhfUklHSFQ6IElTX1BBVEhfUklHSFQsXG4gIElTX1BBVEhfRk9SV0FSRDogSVNfUEFUSF9GT1JXQVJELFxuICBGT1JfTE9PUDogRk9SX0xPT1Bcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG52YXIgbGV2ZWxCYXNlID0gcmVxdWlyZSgnLi4vbGV2ZWxfYmFzZScpO1xudmFyIERpcmVjdGlvbiA9IHJlcXVpcmUoJy4vdGlsZXMnKS5EaXJlY3Rpb247XG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCB0b29sYm94LlxudmFyIHRvb2xib3ggPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICB2YXIgdGVtcGxhdGU7XG4gIC8vIE11c3QgdXNlIHN3aXRjaCwgc2luY2UgYnJvd3NlcmlmeSBvbmx5IHdvcmtzIG9uIHJlcXVpcmVzIHdpdGggbGl0ZXJhbHMuXG4gIHN3aXRjaCAocGFnZSkge1xuICAgIGNhc2UgMTpcbiAgICAgIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sYm94ZXMva2FyZWwxLnhtbC5lanMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sYm94ZXMva2FyZWwyLnhtbC5lanMnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMzpcbiAgICAgIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90b29sYm94ZXMva2FyZWwzLnhtbC5lanMnKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB0ZW1wbGF0ZSh7bGV2ZWw6IGxldmVsfSk7XG59O1xuXG4vL1RPRE86IEZpeCBoYWNreSBsZXZlbC1udW1iZXItZGVwZW5kZW50IHN0YXJ0QmxvY2tzLlxudmFyIHN0YXJ0QmxvY2tzID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4va2FyZWxTdGFydEJsb2Nrcy54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibW92ZV9mb3J3YXJkXCIgYmxvY2suXG52YXIgTU9WRV9GT1JXQVJEID0ge1xuICAgICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdtYXplX21vdmVGb3J3YXJkJzt9LFxuICAgICd0eXBlJzogJ21hemVfbW92ZUZvcndhcmQnXG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJkaWdcIiBibG9jay5cbnZhciBESUcgPSB7J3Rlc3QnOiAnZGlnJywgJ3R5cGUnOiAnbWF6ZV9kaWcnfTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiZmlsbFwiIGJsb2NrLlxudmFyIEZJTEwgPSB7J3Rlc3QnOiAnZmlsbCcsICd0eXBlJzogJ21hemVfZmlsbCd9O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJjb250cm9sc19yZXBlYXRcIiBibG9jay5cbnZhciBSRVBFQVQgPSB7XG4gICAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2NvbnRyb2xzX3JlcGVhdCc7fSxcbiAgICAndHlwZSc6ICdjb250cm9sc19yZXBlYXQnLFxuICAgICd0aXRsZXMnOiB7J1RJTUVTJzogJz8/Pyd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJjb250cm9sc19yZXBlYXRfZXh0XCIgYmxvY2suXG52YXIgUkVQRUFUX0VYVCA9IHtcbiAgICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnY29udHJvbHNfcmVwZWF0X2V4dCc7fSxcbiAgICAndHlwZSc6ICdjb250cm9sc19yZXBlYXRfZXh0J1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiY29udHJvbHNfZm9yXCIgYmxvY2suXG52YXIgQ09OVFJPTFNfRk9SID0ge1xuICAgICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdjb250cm9sc19mb3InO30sXG4gICAgJ3R5cGUnOiAnY29udHJvbHNfZm9yJ1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwidmFyaWFibGVzX2dldFwiIGJsb2NrLlxudmFyIFZBUklBQkxFU19HRVQgPSB7XG4gICAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ3ZhcmlhYmxlc19nZXQnO30sXG4gICAgJ3R5cGUnOiAndmFyaWFibGVzX2dldCcsXG4gICAgJ3RpdGxlcyc6IHsnVkFSJzogJ2knfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV90dXJuXCIgYmxvY2sgdHVybmluZyBsZWZ0LlxudmFyIFRVUk5fTEVGVCA9IHtcbiAgJ3Rlc3QnOiAndHVybkxlZnQnLFxuICAndHlwZSc6ICdtYXplX3R1cm4nLFxuICAndGl0bGVzJzogeydESVInOiAndHVybkxlZnQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV90dXJuXCIgYmxvY2sgdHVybmluZyByaWdodC5cbnZhciBUVVJOX1JJR0hUID0ge1xuICAndGVzdCc6ICd0dXJuUmlnaHQnLFxuICAndHlwZSc6ICdtYXplX3R1cm4nLFxuICAndGl0bGVzJzogeydESVInOiAndHVyblJpZ2h0J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdW50aWxCbG9ja2VkXCIgYmxvY2suXG52YXIgVU5USUxfQkxPQ0tFRCA9IHtcbiAgJ3Rlc3QnOiAnd2hpbGUgKE1hemUuaXNQYXRoRm9yd2FyZCcsXG4gICd0eXBlJzogJ21hemVfdW50aWxCbG9ja2VkJ1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCIgYmxvY2sgd2l0aCB0aGUgb3B0aW9uIFwicGlsZVByZXNlbnRcIiBzZWxlY3RlZC5cbnZhciBXSElMRV9PUFRfUElMRV9QUkVTRU5UID0ge1xuICAndGVzdCc6ICd3aGlsZSAoTWF6ZS5waWxlUHJlc2VudCcsXG4gICd0eXBlJzogJ21hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhcicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICdwaWxlUHJlc2VudCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIiBibG9jayB3aXRoIHRoZSBvcHRpb24gXCJob2xlUHJlc2VudFwiIHNlbGVjdGVkLlxudmFyIFdISUxFX09QVF9IT0xFX1BSRVNFTlQgPSB7XG4gICd0ZXN0JzogJ3doaWxlIChNYXplLmhvbGVQcmVzZW50JyxcbiAgJ3R5cGUnOiAnbWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ2hvbGVQcmVzZW50J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiIGJsb2NrIHdpdGggdGhlIG9wdGlvbiBcImlzUGF0aEZvcndhcmRcIiBzZWxlY3RlZC5cbnZhciBXSElMRV9PUFRfUEFUSF9BSEVBRCA9IHtcbiAgJ3Rlc3QnOiAnd2hpbGUgKE1hemUuaXNQYXRoRm9yd2FyZCcsXG4gICd0eXBlJzogJ21hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhcicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICdpc1BhdGhGb3J3YXJkJ31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImthcmVsX2lmXCIgYmxvY2suXG52YXIgSUYgPSB7J3Rlc3QnOiAnaWYnLCAndHlwZSc6ICdrYXJlbF9pZid9O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJrYXJlbF9pZlwiIGJsb2NrIHdpdGggdGhlIG9wdGlvbiBcInBpbGVQcmVzZW50XCIgc2VsZWN0ZWQuXG52YXIgSUZfT1BUX1BJTEVfUFJFU0VOVCA9IHtcbiAgJ3Rlc3QnOiAnaWYgKE1hemUucGlsZVByZXNlbnQnLFxuICAndHlwZSc6ICdrYXJlbF9pZicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICdwaWxlUHJlc2VudCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJrYXJlbF9pZlwiIGJsb2NrIHdpdGggdGhlIG9wdGlvbiBcImhvbGVQcmVzZW50XCIgc2VsZWN0ZWQuXG52YXIgSUZfT1BUX0hPTEVfUFJFU0VOVCA9IHtcbiAgJ3Rlc3QnOiAnaWYgKE1hemUuaG9sZVByZXNlbnQnLFxuICAndHlwZSc6ICdrYXJlbF9pZicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICdob2xlUHJlc2VudCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJrYXJlbF9pZkVsc2VcIiBibG9jay5cbnZhciBJRl9FTFNFID0geyd0ZXN0JzogJ30gZWxzZSB7JywgJ3R5cGUnOiAna2FyZWxfaWZFbHNlJ307XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImZpbGwgbnVtXCIgYmxvY2suXG52YXIgZmlsbCA9IGZ1bmN0aW9uKG51bSkge1xuICByZXR1cm4geyd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gbXNnLmZpbGxOKHtzaG92ZWxmdWxzOiBudW19KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgICAgICAgICAndGl0bGVzJzogeydOQU1FJzogbXNnLmZpbGxOKHtzaG92ZWxmdWxzOiBudW19KX19O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwicmVtb3ZlIG51bVwiIGJsY29rLlxudmFyIHJlbW92ZSA9IGZ1bmN0aW9uKG51bSkge1xuICByZXR1cm4geyd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgICAgICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT1cbiAgICAgICAgICAgICAgICBtc2cucmVtb3ZlTih7c2hvdmVsZnVsczogbnVtfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICAgICAgICAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5yZW1vdmVOKHtzaG92ZWxmdWxzOiBudW19KX19O1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiYXZvaWQgdGhlIGNvdyBhbmQgcmVtb3ZlIDFcIiBibG9jay5cbnZhciBBVk9JRF9PQlNUQUNMRV9BTkRfUkVNT1ZFID0ge1xuICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBtc2cuYXZvaWRDb3dBbmRSZW1vdmUoKTtcbiAgfSxcbiAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAndGl0bGVzJzogeydOQU1FJzogbXNnLmF2b2lkQ293QW5kUmVtb3ZlKCl9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJyZW1vdmUgMSBhbmQgYXZvaWQgdGhlIGNvd1wiIGJsb2NrLlxudmFyIFJFTU9WRV9BTkRfQVZPSURfT0JTVEFDTEUgPSB7XG4gICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IG1zZy5yZW1vdmVBbmRBdm9pZFRoZUNvdygpO1xuICB9LFxuICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICd0aXRsZXMnOiB7J05BTUUnOiBtc2cucmVtb3ZlQW5kQXZvaWRUaGVDb3coKX1cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcInJlbW92ZSBwaWxlc1wiIGJsb2NrLlxudmFyIFJFTU9WRV9QSUxFUyA9IHtcbiAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gbXNnLnJlbW92ZVN0YWNrKHtzaG92ZWxmdWxzOiA0fSk7XG4gIH0sXG4gICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5yZW1vdmVTdGFjayh7c2hvdmVsZnVsczogNH0pfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiZmlsbCBob2xlc1wiIGJsb2NrLlxudmFyIEZJTExfSE9MRVMgPSB7XG4gICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IG1zZy5maWxsU3RhY2soe3Nob3ZlbGZ1bHM6IDJ9KTtcbiAgfSxcbiAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAndGl0bGVzJzogeydOQU1FJzogbXNnLmZpbGxTdGFjayh7c2hvdmVsZnVsczogMn0pfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRm9ybWVybHkgcGFnZSAxXG4gICcxXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDEpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDEpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDIuMFxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgMiksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMiksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0ZJTExdXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDIsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMSwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIC0yLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgMyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMyksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtSRVBFQVRdXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAyLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDQpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbVFVSTl9MRUZUXSwgW1JFUEVBVF1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMiwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDUpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDUpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtGSUxMXSwgW1JFUEVBVF0sIFtVTlRJTF9CTE9DS0VEXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgLTUsIC01LCAtNSwgLTUsIC01LCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfNic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgNiksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtESUddLFxuICAgICAgW1dISUxFX09QVF9QSUxFX1BSRVNFTlQsIFJFUEVBVCwgV0hJTEVfT1BUX1BBVEhfQUhFQURdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMSwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAyLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMSwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAxLCAxLCAwLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzcnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDcpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDcpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW1RVUk5fUklHSFRdLFxuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRklMTF0sXG4gICAgICBbV0hJTEVfT1BUX0hPTEVfUFJFU0VOVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMSwgMSwgMiwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAtMTgsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzgnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDgpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRklMTF0sXG4gICAgICBbV0hJTEVfT1BUX1BBVEhfQUhFQUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgLTEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfOSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgOSksXG4gICAgJ2lkZWFsJzogMTAsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRElHXSxcbiAgICAgIFtXSElMRV9PUFRfUEFUSF9BSEVBRCwgUkVQRUFUXSxcbiAgICAgIFtUVVJOX0xFRlRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMi41XG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDEsIDEsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV8xMCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMSwgMTApLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDEwKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0RJR10sXG4gICAgICBbSUZfT1BUX1BJTEVfUFJFU0VOVF0sXG4gICAgICBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDIuNVxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAwLCAwLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfMTEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDExKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAxMSksXG4gICAgJ2lkZWFsJzogNyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtESUddLFxuICAgICAgW0ZJTExdLFxuICAgICAgW0lGX09QVF9QSUxFX1BSRVNFTlRdLFxuICAgICAgW0lGX09QVF9IT0xFX1BSRVNFTlRdLFxuICAgICAgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyLjVcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIC0xLCAwLCAwLCAtMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgLy8gRm9ybWVybHkgcGFnZSAyXG5cbiAgJzJfMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMSksXG4gICAgJ2lkZWFsJzogbnVsbCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtGSUxMXSwgW1RVUk5fTEVGVCwgVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAtMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAtMSwgMSwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDIpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDIpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtmaWxsKDUpXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAxLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMCwgMiwgMSwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAwLCAxLCAxLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMSwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgLTUsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDMpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDMpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtmaWxsKDUpXSwgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAxLCAxLCAxLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDIsIDEsIDEsIDEsIDEsIDEsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIC01LCAtNSwgLTUsIC01LCAtNSwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDQpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDQpLFxuICAgICdpZGVhbCc6IDEzLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtESUddLFxuICAgICAgW1JFUEVBVF0sXG4gICAgICBbcmVtb3ZlKDcpXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW1RVUk5fTEVGVF0sXG4gICAgICBbVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAxLCAxLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMSwgMiwgMSwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgNywgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCA3LCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDcsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgNywgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl81Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA1KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA1KSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtESUddLFxuICAgICAgW1JFUEVBVF0sXG4gICAgICBbcmVtb3ZlKDYpXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMiwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgNiwgMCwgNiwgMCwgNiwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfNic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNiksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgNiksXG4gICAgJ2lkZWFsJzogMTEsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlbW92ZSg4KV0sIFtmaWxsKDgpXSwgW01PVkVfRk9SV0FSRF0sIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAxLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgOCwgMCwgMCwgMCwgMCwgMCwgMCwgLTggXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzcnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDcpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDcpLFxuICAgICdpZGVhbCc6IDExLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtUVVJOX0xFRlRdLCBbTU9WRV9GT1JXQVJEXSwgW1RVUk5fUklHSFRdLCBbRElHXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAyLCA0LCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfOCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgOCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgOCksXG4gICAgJ2lkZWFsJzogMTMsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW1JFUEVBVF0sIFtBVk9JRF9PQlNUQUNMRV9BTkRfUkVNT1ZFXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMiwgNCwgMSwgNCwgMSwgNCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMSwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzknOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDkpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDkpLFxuICAgICdpZGVhbCc6IDE0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtSRU1PVkVfUElMRVNdLFxuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzEwJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxMCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMTApLFxuICAgICdpZGVhbCc6IDI3LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtSRU1PVkVfUElMRVNdLFxuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRklMTF9IT0xFU10sXG4gICAgICBbSUZfT1BUX1BJTEVfUFJFU0VOVCwgSUZfRUxTRV0sXG4gICAgICBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDEsIC0xLCAxLCAtMSwgLTEsIDEsIC0xLCAwIF0sXG4gICAgICBbIDEsIC0xLCAxLCAtMSwgLTEsIDEsIC0xLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgLy8gUGFnZSAzIHRvIERlYnVnXG5cbiAgJ2RlYnVnX3NlcV8xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAxKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCAxKSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW0ZJTExdLCBbVFVSTl9MRUZUXSwgW1RVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDQsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMiwgMSwgNCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIC0xLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX3NlcV8yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAyKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCAyKSxcbiAgICAnaWRlYWwnOiA3LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW1RVUk5fTEVGVF1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDIsIDEsIDEsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfcmVwZWF0Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCAzKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCAzKSxcbiAgICAnaWRlYWwnOiAxMixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtUVVJOX0xFRlRdLCBbVFVSTl9SSUdIVF0sIFtSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDEsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMiwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAxLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDEsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgNSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCA3LCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z193aGlsZSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgNCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1JFUEVBVF0sIFtGSUxMXSwgW1dISUxFX09QVF9IT0xFX1BSRVNFTlRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAyLCAxLCAxLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAtMTUsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfaWYnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDUpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDUpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtUVVJOX0xFRlRdLCBbVFVSTl9SSUdIVF0sXG4gICAgICBbUkVQRUFUXSwgW0RJR10sIFtJRl9PUFRfUElMRV9QUkVTRU5UXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMiwgMSwgMCwgMSwgMSwgMCwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19pZl9lbHNlJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA2KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA2KSxcbiAgICAnaWRlYWwnOiAxMCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1RVUk5fTEVGVF0sIFtUVVJOX1JJR0hUXSxcbiAgICAgIFtSRVBFQVRdLCBbRElHXSwgW0ZJTExdLCBbSUZfRUxTRSwgSUZfT1BUX0hPTEVfUFJFU0VOVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDEsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMSwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDAsIDEsIDEsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIC0xIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAtMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAtMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIC0xLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX2Z1bmN0aW9uXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDcpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDcpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtUVVJOX0xFRlRdLCBbUkVQRUFUXSwgW0RJR11cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMiwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfZnVuY3Rpb25fMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgOCksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgOCksXG4gICAgJ2lkZWFsJzogMTcsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtUVVJOX0xFRlRdLCBbUkVQRUFUXSwgW0RJR10sIFtGSUxMXSxcbiAgICAgIFtsZXZlbEJhc2UuY2FsbChtc2cuZmlsbFNxdWFyZSgpKV0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLnJlbW92ZVNxdWFyZSgpKV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIDEsIDAsIDEgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAtMSwgLTEsIC0xIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIC0xLCAwLCAtMSBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAtMSwgLTEsIC0xIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19mdW5jdGlvbl8zJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA5KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA5KSxcbiAgICAnaWRlYWwnOiAxMixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW1JFUEVBVF9FWFRdLCBbRElHXSwgW0NPTlRST0xTX0ZPUl0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGxXaXRoQXJnKG1zZy5yZW1vdmVQaWxlKCksIG1zZy5oZWlnaHRQYXJhbWV0ZXIoKSldLFxuICAgICAgW1ZBUklBQkxFU19HRVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDIsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2JlZV8xJzoge1xuICAgICd0b29sYm94JzogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KCdcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbmVjdGFyXCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2hvbmV5XCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjx0aXRsZSBuYW1lPVwiTlVNXCI+MDwvdGl0bGU+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJiZWVfaWZOZWN0YXJBbW91bnRcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJlZV9pZlRvdGFsTmVjdGFyXCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJiZWVfaWZGbG93ZXJcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJlZV9pZk9ubHlGbG93ZXJcIj48L2Jsb2NrPlxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJlZV93aGlsZU5lY3RhckFtb3VudFwiPjwvYmxvY2s+J1xuICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMSksXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyLjBcbiAgICB9LFxuICAgIGhvbmV5R29hbDogMSxcbiAgICAvLyBuZWN0YXJHb2FsOiAyLFxuICAgIHN0ZXA6IHRydWUsXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAnUCcsIDEsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMywgLTEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXVxuXG4gICAgXVxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi4vLi4vbG9jYWxlJyk7XG5cbi8qKlxuICogQWRkIHRoZSBwcm9jZWR1cmVzIGNhdGVnb3J5IHRvIHRoZSB0b29sYm94LlxuICovXG52YXIgYWRkUHJvY2VkdXJlcyA9IGZ1bmN0aW9uKCkgezsgYnVmLnB1c2goJyAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDgsICBtc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCIgY3VzdG9tPVwiUFJPQ0VEVVJFXCI+PC9jYXRlZ29yeT5cXG4gIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg5LCAgbXNnLmNhdExvZ2ljKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZlwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZFbHNlXCI+PC9ibG9jaz5cXG4gIDwvY2F0ZWdvcnk+XFxuJyk7MTM7IH07OyBidWYucHVzaCgnXFxuJyk7MTQ7XG4vKipcbiAqIE9wdGlvbnM6XG4gKiBAcGFyYW0gZG9TdGF0ZW1lbnQgQW4gb3B0aW9uYWwgc3RhdGVtZW50IGZvciB0aGUgZG8gc3RhdGVtZW50IGluIHRoZSBsb29wLlxuICogQHBhcmFtIHVwcGVyTGltaXQgVGhlIHVwcGVyIGxpbWl0IG9mIHRoZSBmb3IgbG9vcC5cbiAqL1xudmFyIGNvbnRyb2xzRm9yID0gZnVuY3Rpb24oZG9TdGF0ZW1lbnQsIHVwcGVyTGltaXQpIHs7IGJ1Zi5wdXNoKCcgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yXCI+XFxuICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC92YWx1ZT5cXG4gICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+XFxuICAgICAgICAgICcsIGVzY2FwZSgoMjksICB1cHBlckxpbWl0IHx8IDEwKSksICcgICAgICAgIDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC92YWx1ZT5cXG4gICAgPHZhbHVlIG5hbWU9XCJCWVwiPlxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC92YWx1ZT5cXG4gICAgJyk7Mzc7IGlmIChkb1N0YXRlbWVudCkgezsgYnVmLnB1c2goJyAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAnKTszODsgZG9TdGF0ZW1lbnQoKSA7IGJ1Zi5wdXNoKCdcXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgJyk7NDA7IH07IGJ1Zi5wdXNoKCcgIDwvYmxvY2s+XFxuJyk7NDE7IH07OyBidWYucHVzaCgnXFxuPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNDMsICBtc2cuY2F0QWN0aW9ucygpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gIDwvY2F0ZWdvcnk+XFxuICAnKTs1MDsgYWRkUHJvY2VkdXJlcygpOyBidWYucHVzaCgnICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNTAsICBtc2cuY2F0TG9vcHMoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiPjwvYmxvY2s+XFxuICAgICcpOzUyOyBpZiAobGV2ZWwgPCA5KSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj48L2Jsb2NrPlxcbiAgICAnKTs1MzsgfSBlbHNlIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIj5cXG4gICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC92YWx1ZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTs2MDsgfTsgYnVmLnB1c2goJyAgICAnKTs2MDsgY29udHJvbHNGb3IoKTsgYnVmLnB1c2goJyAgPC9jYXRlZ29yeT5cXG4gIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg2MSwgIG1zZy5jYXRNYXRoKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPjwvYmxvY2s+XFxuICA8L2NhdGVnb3J5PlxcbiAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDY0LCAgbXNnLmNhdFZhcmlhYmxlcygpICkpLCAnXCIgY3VzdG9tPVwiVkFSSUFCTEVcIj5cXG4gIDwvY2F0ZWdvcnk+XFxuPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vLi4vbG9jYWxlJyk7XG52YXIgbWF6ZU1zZyA9IHJlcXVpcmUoJy4uLy4vbG9jYWxlJyk7XG5cbnZhciBhZGRQcm9jZWR1cmVzID0gZnVuY3Rpb24oKSB7OyBidWYucHVzaCgnICAnKTs2OyBpZiAobGV2ZWwgPiAzKSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg2LCAgY29tbW9uTXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICAnKTs3OyB9IGVsc2UgaWYgKGxldmVsID09IDIgfHwgbGV2ZWwgPT0gMykgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNywgIGNvbW1vbk1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCI+XFxuICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoOSwgIG1hemVNc2cuZmlsbE4oe3Nob3ZlbGZ1bHM6IDV9KSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICcpOzEyOyB9OyBidWYucHVzaCgnICAnKTsxMjsgaWYgKGxldmVsIDwgOSkgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTIsICBjb21tb25Nc2cuY2F0TG9naWMoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgJyk7MTU7IH0gZWxzZSBpZiAobGV2ZWwgPiA4KSB7OyBidWYucHVzaCgnICAgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgxNSwgIGNvbW1vbk1zZy5jYXRMb2dpYygpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZlwiPjwvYmxvY2s+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZkVsc2VcIj48L2Jsb2NrPlxcbiAgICA8L2NhdGVnb3J5PlxcbiAgJyk7MTk7IH07IGJ1Zi5wdXNoKCcnKTsxOTsgfTs7IGJ1Zi5wdXNoKCdcXG48eG1sIGlkPVwidG9vbGJveFwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIj5cXG4gIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyMSwgIGNvbW1vbk1zZy5jYXRBY3Rpb25zKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgPC9jYXRlZ29yeT5cXG4gICcpOzI4OyBhZGRQcm9jZWR1cmVzKCk7IGJ1Zi5wdXNoKCcgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCgyOCwgIGNvbW1vbk1zZy5jYXRMb29wcygpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPjwvYmxvY2s+XFxuICA8L2NhdGVnb3J5PlxcbjwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+PC9ibG9jaz5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgJyk7NjsgaWYgKGxldmVsID4gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICAgICcpOzc7IGlmIChsZXZlbCA+IDIpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjU8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICAgJyk7MTA7IGlmIChsZXZlbCA+IDkpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZcIj48L2Jsb2NrPlxcbiAgICAgICcpOzExOyB9OyBidWYucHVzaCgnICAgICcpOzExOyB9OyBidWYucHVzaCgnICAgICcpOzExOyBpZiAobGV2ZWwgPT0gNSB8fCBsZXZlbCA9PSAxMCB8fCBsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRcIj48L2Jsb2NrPlxcbiAgICAnKTsxMjsgfTsgYnVmLnB1c2goJyAgICAnKTsxMjsgaWYgKGxldmVsID4gNSAmJiBsZXZlbCA8IDgpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiPjwvYmxvY2s+XFxuICAgICcpOzEzOyB9OyBidWYucHVzaCgnICAgICcpOzEzOyBpZiAobGV2ZWwgPT0gOCB8fCBsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoRm9yd2FyZDwvdGl0bGU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7MTY7IH07IGJ1Zi5wdXNoKCcgICcpOzE2OyB9OyBidWYucHVzaCgnPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxuLyoqXG4gKiBUZW1wbGF0ZSB0byBjcmVhdGUgZnVuY3Rpb24gZm9yIGZpbGxpbmcgaW4gc2hvdmVscy5cbiAqL1xudmFyIGZpbGxTaG92ZWxmdWxzID0gZnVuY3Rpb24obikgezsgYnVmLnB1c2goJyAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgxMSwgIG1zZy5maWxsTih7c2hvdmVsZnVsczogbn0pICkpLCAnPC90aXRsZT5cXG4gICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicsIGVzY2FwZSgoMTQsICBuICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgPC9ibG9jaz5cXG4gICAgPC9zdGF0ZW1lbnQ+XFxuICA8L2Jsb2NrPlxcbicpOzIyOyB9OzsgYnVmLnB1c2goJ1xcbicpOzIzO1xuLyoqXG4gKiBUZW1wbGF0ZSB0byBjcmVhdGUgZnVuY3Rpb24gZm9yIHJlbW92aW5nIGluIHNob3ZlbHMuXG4gKi9cbnZhciByZW1vdmVTaG92ZWxmdWxzID0gZnVuY3Rpb24obikgezsgYnVmLnB1c2goJyAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjMwMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMzAsICBtc2cucmVtb3ZlTih7c2hvdmVsZnVsczogbn0pICkpLCAnPC90aXRsZT5cXG4gICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPicsIGVzY2FwZSgoMzMsICBuICkpLCAnPC90aXRsZT5cXG4gICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICA8L2Jsb2NrPlxcbiAgICA8L3N0YXRlbWVudD5cXG4gIDwvYmxvY2s+XFxuJyk7NDE7IH07IDsgYnVmLnB1c2goJ1xcblxcbicpOzQzOyBpZiAocGFnZSA9PSAxKSB7OyBidWYucHVzaCgnICAnKTs0MzsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ0OyB9IGVsc2UgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ1OyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ2OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ3OyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0ODsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDk7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1MjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs1MzsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs1NDsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzU1OyB9IGVsc2UgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NTY7IH07IGJ1Zi5wdXNoKCcnKTs1NjsgfSBlbHNlIGlmIChwYWdlID09IDIpIHs7IGJ1Zi5wdXNoKCcgICcpOzU2OyBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiMjBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgICAnKTs1NzsgZmlsbFNob3ZlbGZ1bHMoNSk7IGJ1Zi5wdXNoKCcgICcpOzU3OyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7NTc7IGZpbGxTaG92ZWxmdWxzKDUpOyBidWYucHVzaCgnICAnKTs1NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgICcpOzU3OyBmaWxsU2hvdmVsZnVscyg1KTsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMzAwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg2MCwgIG1zZy5yZW1vdmVOKHtzaG92ZWxmdWxzOiA3fSkgKSksICc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDY1LCAgbXNnLnJlbW92ZU4oe3Nob3ZlbGZ1bHM6IDZ9KSApKSwgJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs2NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgICcpOzY3OyBmaWxsU2hvdmVsZnVscyg4KTsgYnVmLnB1c2goJyAgICAnKTs2NzsgcmVtb3ZlU2hvdmVsZnVscyg4KTsgYnVmLnB1c2goJyAgJyk7Njc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjcwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoNjksICBtc2cuYXZvaWRDb3dBbmRSZW1vdmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNzQsICBtc2cuYXZvaWRDb3dBbmRSZW1vdmUoKSApKSwgJzwvdGl0bGU+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs3NjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNzksICBtc2cuYXZvaWRDb3dBbmRSZW1vdmUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTI3OyB9IGVsc2UgaWYgKGxldmVsID09IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCgxMzAsICBtc2cucmVtb3ZlU3RhY2soe3Nob3ZlbGZ1bHM6IDR9KSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTc3OyB9IGVsc2UgaWYgKGxldmVsID09IDEwKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMTgwLCAgbXNnLnJlbW92ZVN0YWNrKHtzaG92ZWxmdWxzOiA0fSkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjMwMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjMwLCAgbXNnLmZpbGxTdGFjayh7c2hvdmVsZnVsczogMn0pICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MjwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4yPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjc3OyB9IGVsc2UgaWYgKGxldmVsID09IDExKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMjgwLCAgbXNnLnJlbW92ZUFuZEF2b2lkVGhlQ293KCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MzI5OyB9OyBidWYucHVzaCgnJyk7MzI5OyB9IGVsc2UgaWYgKHBhZ2UgPT0gMykgezsgYnVmLnB1c2goJyAgJyk7MzI5OyBpZiAobGV2ZWwgPT0gMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM1NjsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MzczOyB9IGVsc2UgaWYgKGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MTA8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0MTg7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+cGlsZVByZXNlbnQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQzMjsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDU3OyB9IGVsc2UgaWYgKGxldmVsID09IDYpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnBpbGVQcmVzZW50PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0ODY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNykgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfY2FsbG5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjcwXCJcXG4gICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoNDg4LCAgbXNnLnJlbW92ZVNxdWFyZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNDkyLCAgbXNnLnJlbW92ZVNxdWFyZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MjwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTE2OyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIHg9XCIyMFwiIHk9XCI3MFwiPlxcbiAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg1MTcsICBtc2cuZmlsbFNxdWFyZSgpICkpLCAnXCI+PC9tdXRhdGlvbj5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDUyNiwgIG1zZy5yZW1vdmVTcXVhcmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIGRlbGV0YWJsZT1cImZhbHNlXCJcXG4gICAgICBlZGl0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjI1MFwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNTM1LCAgbXNnLnJlbW92ZVNxdWFyZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MjwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiBkZWxldGFibGU9XCJmYWxzZVwiXFxuICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIHg9XCIzNTBcIiB5PVwiMjUwXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg1NjIsICBtc2cuZmlsbFNxdWFyZSgpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MjwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzU4NjsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfZm9yXCIgaW5saW5lPVwidHJ1ZVwiIHg9XCIyMFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVkFSXCI+Y291bnRlcjwvdGl0bGU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJGUk9NXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHZhbHVlIG5hbWU9XCJUT1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjY8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIGlubGluZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg2MDUsICBtc2cucmVtb3ZlUGlsZSgpICkpLCAnXCI+XFxuICAgICAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg2MDYsICBtc2cuaGVpZ2h0UGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJBUkcwXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj4xPC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3ZhbHVlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjUwXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPlxcbiAgICAgICAgPGFyZyBuYW1lPVwiJywgZXNjYXBlKCg2MjEsICBtc2cuaGVpZ2h0UGFyYW1ldGVyKCkgKSksICdcIj48L2FyZz5cXG4gICAgICA8L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNjIzLCAgbXNnLnJlbW92ZVBpbGUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0X2V4dFwiIGlubGluZT1cInRydWVcIj5cXG4gICAgICAgICAgPHZhbHVlIG5hbWU9XCJUSU1FU1wiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NjM3OyB9OyBidWYucHVzaCgnJyk7NjM3OyB9OyBidWYucHVzaCgnJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG48ZGl2IGlkPVwic3BlbGxpbmctdGFibGUtd3JhcHBlclwiPlxcbiAgPHRhYmxlIGlkPVwic3BlbGxpbmctdGFibGVcIiBjbGFzcz1cImZsb2F0LXJpZ2h0XCI+XFxuICAgIDx0cj5cXG4gICAgICA8dGQgY2xhc3M9XCJzcGVsbGluZ1RleHRDZWxsXCI+JywgZXNjYXBlKCg1LCAgbXNnLndvcmQoKSApKSwgJzo8L3RkPlxcbiAgICAgIDx0ZCBjbGFzcz1cInNwZWxsaW5nQnV0dG9uQ2VsbFwiPlxcbiAgICAgICAgPGJ1dHRvbiBpZD1cInNlYXJjaFdvcmRcIiBjbGFzcz1cInNwZWxsaW5nQnV0dG9uXCIgZGlzYWJsZWQ+XFxuICAgICAgICAgICcpOzg7IC8vIHNwbGl0dGluZyB0aGVzZSBsaW5lcyBjYXVzZXMgYW4gZXh0cmEgc3BhY2UgdG8gc2hvdyB1cCBpbiBmcm9udCBvZiB0aGUgd29yZCwgYnJlYWtpbmcgY2VudGVyaW5nIFxuOyBidWYucHVzaCgnXFxuICAgICAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg5LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiLz4nLCBlc2NhcGUoKDksICBzZWFyY2hXb3JkICkpLCAnXFxuICAgICAgICA8L2J1dHRvbj5cXG4gICAgICA8L3RkPlxcbiAgICA8L3RyPlxcbiAgICA8dHI+XFxuICAgICAgPHRkIGNsYXNzPVwic3BlbGxpbmdUZXh0Q2VsbFwiPicsIGVzY2FwZSgoMTQsICBtc2cueW91U3BlbGxlZCgpICkpLCAnOjwvdGQ+XFxuICAgICAgPHRkIGNsYXNzPVwic3BlbGxpbmdCdXR0b25DZWxsXCI+XFxuICAgICAgICA8YnV0dG9uIGlkPVwiY3VycmVudFdvcmRcIiBjbGFzcz1cInNwZWxsaW5nQnV0dG9uXCIgZGlzYWJsZWQ+XFxuICAgICAgICAgICcpOzE3OyAvLyBzcGxpdHRpbmcgdGhlc2UgbGluZXMgY2F1c2VzIGFuIGV4dHJhIHNwYWNlIHRvIHNob3cgdXAgaW4gZnJvbnQgb2YgdGhlIHdvcmQsIGJyZWFraW5nIGNlbnRlcmluZyBcbjsgYnVmLnB1c2goJ1xcbiAgICAgICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTgsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+PHNwYW4gaWQ9XCJjdXJyZW50V29yZENvbnRlbnRzXCI+PC9zcGFuPlxcbiAgICAgICAgPC9idXR0b24+XFxuICAgICAgPC90ZD5cXG4gICAgPC90cj5cXG4gIDwvdGFibGU+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbi8qKlxuICogU3RvcmVzIGluZm9ybWF0aW9uIGFib3V0IGEgY3VycmVudCBNYXplIGV4ZWN1dGlvbi4gIEV4ZWN1dGlvbiBjb25zaXN0cyBvZiBhXG4gKiBzZXJpZXMgb2Ygc3RlcHMsIHdoZXJlIGVhY2ggc3RlcCBtYXkgY29udGFpbiBvbmUgb3IgbW9yZSBhY3Rpb25zLlxuICovXG52YXIgRXhlY3V0aW9uSW5mbyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnRlcm1pbmF0ZWRfID0gZmFsc2U7XG4gIHRoaXMudGVybWluYXRpb25WYWx1ZV8gPSBudWxsOyAgLy8gU2VlIHRlcm1pbmF0ZVdpdGhWYWx1ZSBtZXRob2QuXG4gIHRoaXMuc3RlcHNfID0gW107XG4gIHRoaXMudGlja3MgPSBvcHRpb25zLnRpY2tzIHx8IEluZmluaXR5O1xuICB0aGlzLmNvbGxlY3Rpb25fID0gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXhlY3V0aW9uSW5mbztcblxuLyoqXG4gKiBTZXRzIHRlcm1pbmF0aW9uIHZhbHVlIHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuICogLSBJbmZpbml0eTogUHJvZ3JhbSB0aW1lZCBvdXQuXG4gKiAtIFRydWU6IFByb2dyYW0gc3VjY2VlZGVkIChnb2FsIHdhcyByZWFjaGVkKS5cbiAqIC0gRmFsc2U6IFByb2dyYW0gZmFpbGVkIGZvciB1bnNwZWNpZmllZCByZWFzb24uXG4gKiAtIEFueSBvdGhlciB2YWx1ZTogYXBwLXNwZWNpZmljIGZhaWx1cmUuXG4gKiBAcGFyYW0ge29iamVjdH0gdmFsdWUgdGhlIHRlcm1pbmF0aW9uIHZhbHVlXG4gKi9cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLnRlcm1pbmF0ZVdpdGhWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAoIXRoaXMudGVybWluYXRlZF8pIHtcbiAgICB0aGlzLnRlcm1pbmF0aW9uVmFsdWVfID0gdmFsdWU7XG4gIH1cbiAgdGhpcy50ZXJtaW5hdGVkXyA9IHRydWU7XG59O1xuXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5pc1Rlcm1pbmF0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRlcm1pbmF0ZWRfO1xufTtcblxuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUudGVybWluYXRpb25WYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudGVybWluYXRpb25WYWx1ZV87XG59O1xuXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5xdWV1ZUFjdGlvbiA9IGZ1bmN0aW9uIChjb21tYW5kLCBibG9ja0lkKSB7XG4gIHZhciBhY3Rpb24gPSB7Y29tbWFuZDogY29tbWFuZCwgYmxvY2tJZDogYmxvY2tJZH07XG4gIGlmICh0aGlzLmNvbGxlY3Rpb25fKSB7XG4gICAgdGhpcy5jb2xsZWN0aW9uXy5wdXNoKGFjdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgLy8gc2luZ2xlIGFjdGlvbiBzdGVwIChtb3N0IGNvbW1vbiBjYXNlKVxuICAgIHRoaXMuc3RlcHNfLnB1c2goW2FjdGlvbl0pO1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmbGF0IGxpc3Qgb2YgYWN0aW9ucywgd2hpY2ggZ2V0IHJlbW92ZWQgZnJvbSBvdXIgcXVldWUuICBJZiBzaW5nbGVcbiAqIHN0ZXAgaXMgdHJ1ZSwgdGhlIGxpc3Qgd2lsbCBjb250YWluIHRoZSBhY3Rpb25zIGZvciBvbmUgc3RlcCwgb3RoZXJ3aXNlIGl0XG4gKiB3aWxsIGJlIHRoZSBlbnRpcmUgcXVldWUuXG4gKi9cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLmdldEFjdGlvbnMgPSBmdW5jdGlvbiAoc2luZ2xlU3RlcCkge1xuICB2YXIgYWN0aW9ucyA9IFtdO1xuICBpZiAoc2luZ2xlU3RlcCkge1xuICAgIGFjdGlvbnMucHVzaCh0aGlzLnN0ZXBzXy5zaGlmdCgpKTtcbiAgICAvLyBkb250IGxlYXZlIHF1ZXVlIHdpdGgganVzdCBhIGZpbmlzaCBpbiBpdFxuICAgIGlmIChvbkxhc3RTdGVwKHRoaXMuc3RlcHNfKSkge1xuICAgICAgYWN0aW9ucy5wdXNoKHRoaXMuc3RlcHNfLnNwbGljZSgwKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGFjdGlvbnMucHVzaCh0aGlzLnN0ZXBzXy5zcGxpY2UoMCkpO1xuICB9XG4gIC8vIFNvbWUgc3RlcHMgd2lsbCBjb250YWluIG11bHRpcGxlIGFjdGlvbnMuICBGb3IgZXhhbXBsZSBhIEsxIE5vcnRoIGJsb2NrIGNhblxuICAvLyBjb25zaXN0IG9mIGEgdHVybiBhbmQgYSBtb3ZlLiBXZSBpbnN0ZWFkIHdhbnQgdG8gcmV0dXJuIGEgZmxhdCBsaXN0IG9mXG4gIC8vIGFsbCBhY3Rpb25zLCByZWdhcmRsZXNzIG9mIHdoaWNoIHN0ZXAgdGhleSB3ZXJlIGluLlxuICByZXR1cm4gXy5mbGF0dGVuKGFjdGlvbnMpO1xufTtcblxuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuc3RlcHNSZW1haW5pbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnN0ZXBzXy5sZW5ndGggPiAwO1xufTtcblxuLyoqXG4gKiBJZiB3ZSBoYXZlIG5vIHN0ZXBzIGxlZnQsIG9yIG91ciBvbmx5IHJlbWFpbmluZyBzdGVwIGlzIGEgc2luZ2xlIGZpbmlzaCBhY3Rpb25cbiAqIHdlJ3JlIGRvbmUgZXhlY3V0aW5nLCBhbmQgaWYgd2UncmUgaW4gc3RlcCBtb2RlIHdvbid0IHdhbnQgdG8gd2FpdCBhcm91bmRcbiAqIGZvciBhbm90aGVyIHN0ZXAgcHJlc3MuXG4gKi9cbmZ1bmN0aW9uIG9uTGFzdFN0ZXAoc3RlcHMpIHtcbiAgaWYgKHN0ZXBzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHN0ZXBzLmxlbmd0aCA9PT0gMSkge1xuICAgIHZhciBzdGVwID0gc3RlcHNbMF07XG4gICAgaWYgKHN0ZXAubGVuZ3RoID09PSAxICYmIHN0ZXBbMF0uY29tbWFuZCA9PT0gJ2ZpbmlzaCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29sbGVjdCBhbGwgYWN0aW9ucyBxdWV1ZWQgdXAgYmV0d2VlbiBub3cgYW5kIHRoZSBjYWxsIHRvIHN0b3BDb2xsZWN0aW5nLFxuICogYW5kIHB1dCB0aGVtIGluIGEgc2luZ2xlIHN0ZXBcbiAqL1xuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuY29sbGVjdEFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLmNvbGxlY3Rpb25fKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBjb2xsZWN0aW5nXCIpO1xuICB9XG4gIHRoaXMuY29sbGVjdGlvbl8gPSBbXTtcbn07XG5cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLnN0b3BDb2xsZWN0aW5nID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuY29sbGVjdGlvbl8pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgY3VycmVudGx5IGNvbGxlY3RpbmdcIik7XG4gIH1cbiAgdGhpcy5zdGVwc18ucHVzaCh0aGlzLmNvbGxlY3Rpb25fKTtcbiAgdGhpcy5jb2xsZWN0aW9uXyA9IG51bGw7XG59O1xuXG4vKipcbiAqIElmIHRoZSB1c2VyIGhhcyBleGVjdXRlZCB0b28gbWFueSBhY3Rpb25zLCB3ZSdyZSBwcm9iYWJseSBpbiBhbiBpbmZpbml0ZVxuICogbG9vcC4gIFNldCB0ZXJtaW5hdGlvbiB2YWx1ZSB0byBJbmZpbml0eVxuICovXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5jaGVja1RpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMudGlja3MtLSA8IDApIHtcbiAgICB0aGlzLnRlcm1pbmF0ZVdpdGhWYWx1ZShJbmZpbml0eSk7XG4gIH1cbn07XG4iLCJ2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxubW9kdWxlLmV4cG9ydHMuYmxvY2tzID0gW1xuICB7J2Z1bmMnOiAnbW92ZUZvcndhcmQnLCAnY2F0ZWdvcnknOiAnTW92ZW1lbnQnIH0sXG4gIHsnZnVuYyc6ICd0dXJuTGVmdCcsICdjYXRlZ29yeSc6ICdNb3ZlbWVudCcgfSxcbiAgeydmdW5jJzogJ3R1cm5SaWdodCcsICdjYXRlZ29yeSc6ICdNb3ZlbWVudCcgfSxcbl07XG5cbm1vZHVsZS5leHBvcnRzLmNhdGVnb3JpZXMgPSB7XG4gICdNb3ZlbWVudCc6IHtcbiAgICAnY29sb3InOiAncmVkJyxcbiAgICAnYmxvY2tzJzogW11cbiAgfSxcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcblxcbjxidXR0b24gaWQ9XCJzdGVwQnV0dG9uXCIgY2xhc3M9XCJsYXVuY2ggJywgZXNjYXBlKCgzLCAgc2hvd1N0ZXBCdXR0b24gPyAnJyA6ICdoaWRlJyApKSwgJyBmbG9hdC1yaWdodFwiPlxcbiAgJyk7NDsgLy8gc3BsaXR0aW5nIHRoZXNlIGxpbmVzIGNhdXNlcyBhbiBleHRyYSBzcGFjZSB0byBzaG93IHVwIGluIGZyb250IG9mIHRoZSB3b3JkLCBicmVha2luZyBjZW50ZXJpbmcgXG47IGJ1Zi5wdXNoKCdcXG4gIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoNSwgIG1zZy5zdGVwKCkgKSksICdcXG48L2J1dHRvbj5cXG5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgRGVtbzogTWF6ZVxuICpcbiAqIENvcHlyaWdodCAyMDEyIEdvb2dsZSBJbmMuXG4gKiBodHRwOi8vYmxvY2tseS5nb29nbGVjb2RlLmNvbS9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZW1vbnN0cmF0aW9uIG9mIEJsb2NrbHk6IFNvbHZpbmcgYSBtYXplLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciBtYXplVXRpbHMgPSByZXF1aXJlKCcuL21hemVVdGlscycpO1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKHNraW4uaWQpKSB7XG4gICAgcmVxdWlyZSgnLi9iZWVCbG9ja3MnKS5pbnN0YWxsKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIFNpbXBsZU1vdmUgPSB7XG4gICAgRElSRUNUSU9OX0NPTkZJR1M6IHtcbiAgICAgIFdlc3Q6IHsgbGV0dGVyOiBjb21tb25Nc2cuZGlyZWN0aW9uV2VzdExldHRlcigpLCBpbWFnZTogc2tpbi5sZWZ0QXJyb3csIHRvb2x0aXA6IG1zZy5tb3ZlV2VzdFRvb2x0aXAoKSB9LFxuICAgICAgRWFzdDogeyBsZXR0ZXI6IGNvbW1vbk1zZy5kaXJlY3Rpb25FYXN0TGV0dGVyKCksIGltYWdlOiBza2luLnJpZ2h0QXJyb3csIHRvb2x0aXA6IG1zZy5tb3ZlRWFzdFRvb2x0aXAoKSB9LFxuICAgICAgTm9ydGg6IHsgbGV0dGVyOiBjb21tb25Nc2cuZGlyZWN0aW9uTm9ydGhMZXR0ZXIoKSwgaW1hZ2U6IHNraW4udXBBcnJvdywgdG9vbHRpcDogbXNnLm1vdmVOb3J0aFRvb2x0aXAoKSB9LFxuICAgICAgU291dGg6IHsgbGV0dGVyOiBjb21tb25Nc2cuZGlyZWN0aW9uU291dGhMZXR0ZXIoKSwgaW1hZ2U6IHNraW4uZG93bkFycm93LCB0b29sdGlwOiBtc2cubW92ZVNvdXRoVG9vbHRpcCgpIH1cbiAgICB9LFxuICAgIGdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiTm9ydGhcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiU291dGhcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiV2VzdFwiKTtcbiAgICAgIFNpbXBsZU1vdmUuZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb24oXCJFYXN0XCIpO1xuICAgIH0sXG4gICAgZ2VuZXJhdGVCbG9ja3NGb3JEaXJlY3Rpb246IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICAgICAgZ2VuZXJhdG9yW1wibWF6ZV9tb3ZlXCIgKyBkaXJlY3Rpb25dID0gU2ltcGxlTW92ZS5nZW5lcmF0ZUNvZGVHZW5lcmF0b3IoZGlyZWN0aW9uKTtcbiAgICAgIGJsb2NrbHkuQmxvY2tzWydtYXplX21vdmUnICsgZGlyZWN0aW9uXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVNb3ZlQmxvY2soZGlyZWN0aW9uKTtcbiAgICB9LFxuICAgIGdlbmVyYXRlTW92ZUJsb2NrOiBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgIHZhciBkaXJlY3Rpb25Db25maWcgPSBTaW1wbGVNb3ZlLkRJUkVDVElPTl9DT05GSUdTW2RpcmVjdGlvbl07XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoZWxwVXJsOiAnJyxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZExhYmVsKGRpcmVjdGlvbkNvbmZpZy5sZXR0ZXIsIHtmaXhlZFNpemU6IHt3aWR0aDogMTIsIGhlaWdodDogMTh9fSkpXG4gICAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShkaXJlY3Rpb25Db25maWcuaW1hZ2UpKTtcbiAgICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgICAgICB0aGlzLnNldFRvb2x0aXAoZGlyZWN0aW9uQ29uZmlnLnRvb2x0aXApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgZ2VuZXJhdGVDb2RlR2VuZXJhdG9yOiBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdNYXplLm1vdmUnICsgZGlyZWN0aW9uICsgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yQWxsRGlyZWN0aW9ucygpO1xuXG4gIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZC5cbiAgYmxvY2tVdGlscy5nZW5lcmF0ZVNpbXBsZUJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIG5hbWU6ICdtYXplX21vdmVGb3J3YXJkJyxcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9Nb3ZlJyxcbiAgICB0aXRsZTogbXNnLm1vdmVGb3J3YXJkKCksXG4gICAgdG9vbHRpcDogbXNnLm1vdmVGb3J3YXJkVG9vbHRpcCgpLFxuICAgIGZ1bmN0aW9uTmFtZTogJ01hemUubW92ZUZvcndhcmQnXG4gIH0pO1xuXG4gIC8vIEJsb2NrIGZvciBwdXR0aW5nIGRpcnQgb24gdG8gYSB0aWxlLlxuICBibG9ja1V0aWxzLmdlbmVyYXRlU2ltcGxlQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgbmFtZTogJ21hemVfZmlsbCcsXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUHV0RG93bicsXG4gICAgdGl0bGU6IG1zZy5maWxsKCksXG4gICAgdG9vbHRpcDogbXNnLmZpbGxUb29sdGlwKCksXG4gICAgZnVuY3Rpb25OYW1lOiAnTWF6ZS5maWxsJ1xuICB9KTtcblxuICAvLyBCbG9jayBmb3IgcHV0dGluZyBmb3IgcmVtb3ZpbmcgZGlydCBmcm9tIGEgdGlsZS5cbiAgYmxvY2tVdGlscy5nZW5lcmF0ZVNpbXBsZUJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIG5hbWU6ICdtYXplX2RpZycsXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUGlja1VwJyxcbiAgICB0aXRsZTogbXNnLmRpZygpLFxuICAgIHRvb2x0aXA6IG1zZy5kaWdUb29sdGlwKCksXG4gICAgZnVuY3Rpb25OYW1lOiAnTWF6ZS5kaWcnXG4gIH0pO1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfbW92ZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQvYmFja3dhcmRcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9Nb3ZlJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX21vdmUuRElSRUNUSU9OUyA9XG4gICAgICBbW21zZy5tb3ZlRm9yd2FyZCgpLCAnbW92ZUZvcndhcmQnXSxcbiAgICAgICBbbXNnLm1vdmVCYWNrd2FyZCgpLCAnbW92ZUJhY2t3YXJkJ11dO1xuXG4gIGdlbmVyYXRvci5tYXplX21vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZC9iYWNrd2FyZFxuICAgIHZhciBkaXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpO1xuICAgIHJldHVybiAnTWF6ZS4nICsgZGlyICsgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV90dXJuID0ge1xuICAgIC8vIEJsb2NrIGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvVHVybicsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy50dXJuVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV90dXJuLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cudHVybkxlZnQoKSArICcgXFx1MjFCQScsICd0dXJuTGVmdCddLFxuICAgICAgIFttc2cudHVyblJpZ2h0KCkgKyAnIFxcdTIxQkInLCAndHVyblJpZ2h0J11dO1xuXG4gIGdlbmVyYXRvci5tYXplX3R1cm4gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciB0dXJuaW5nIGxlZnQgb3IgcmlnaHQuXG4gICAgdmFyIGRpciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJyk7XG4gICAgcmV0dXJuICdNYXplLicgKyBkaXIgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lzUGF0aCA9IHtcbiAgICAvLyBCbG9jayBmb3IgY2hlY2tpbmcgaWYgdGhlcmUgYSBwYXRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5zZXRPdXRwdXQodHJ1ZSwgYmxvY2tseS5CbG9ja1ZhbHVlVHlwZS5OVU1CRVIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlzUGF0aFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaXNQYXRoLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cuaWZQYXRoQWhlYWQoKSwgJ2lzUGF0aEZvcndhcmQnXSxcbiAgICAgICBbbXNnLnBhdGhMZWZ0KCkgKyAnIFxcdTIxQkEnLCAnaXNQYXRoTGVmdCddLFxuICAgICAgIFttc2cucGF0aFJpZ2h0KCkgKyAnIFxcdTIxQkInLCAnaXNQYXRoUmlnaHQnXV07XG5cbiAgZ2VuZXJhdG9yLm1hemVfaXNQYXRoID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgY2hlY2tpbmcgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIHZhciBjb2RlID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgKyAnKCknO1xuICAgIHJldHVybiBbY29kZSwgZ2VuZXJhdG9yLk9SREVSX0ZVTkNUSU9OX0NBTExdO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaWYgPSB7XG4gICAgLy8gQmxvY2sgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pZi5ESVJFQ1RJT05TID1cbiAgICAgIGJsb2NrbHkuQmxvY2tzLm1hemVfaXNQYXRoLkRJUkVDVElPTlM7XG5cbiAgZ2VuZXJhdG9yLm1hemVfaWYgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaWZFbHNlID0ge1xuICAgIC8vIEJsb2NrIGZvciAnaWYvZWxzZScgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0VMU0UnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZWxzZUNvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmZWxzZVRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lmRWxzZS5ESVJFQ1RJT05TID1cbiAgICAgIGJsb2NrbHkuQmxvY2tzLm1hemVfaXNQYXRoLkRJUkVDVElPTlM7XG5cbiAgZ2VuZXJhdG9yLm1hemVfaWZFbHNlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmL2Vsc2UnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaDAgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBicmFuY2gxID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRUxTRScpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaDAgK1xuICAgICAgICAgICAgICAgJ30gZWxzZSB7XFxuJyArIGJyYW5jaDEgKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3Mua2FyZWxfaWYgPSB7XG4gICAgLy8gQmxvY2sgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmlmQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5rYXJlbF9pZiA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3Mua2FyZWxfaWYuRElSRUNUSU9OUyA9IFtcbiAgICAgICBbbXNnLnBpbGVQcmVzZW50KCksICdwaWxlUHJlc2VudCddLFxuICAgICAgIFttc2cuaG9sZVByZXNlbnQoKSwgJ2hvbGVQcmVzZW50J10sXG4gICAgICAgW21zZy5wYXRoQWhlYWQoKSwgJ2lzUGF0aEZvcndhcmQnXVxuICAvLyAgICAgW21zZy5ub1BhdGhBaGVhZCgpLCAnbm9QYXRoRm9yd2FyZCddXG4gIF07XG5cbiAgYmxvY2tseS5CbG9ja3Mua2FyZWxfaWZFbHNlID0ge1xuICAgIC8vIEJsb2NrIGZvciAnaWYvZWxzZScgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmlmQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdFTFNFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmVsc2VDb2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZmVsc2VUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmthcmVsX2lmRWxzZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZi9lbHNlJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2gwID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYnJhbmNoMSA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0VMU0UnKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2gwICtcbiAgICAgICAgICAgICAgICd9IGVsc2Uge1xcbicgKyBicmFuY2gxICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmthcmVsX2lmRWxzZS5ESVJFQ1RJT05TID1cbiAgICAgIGJsb2NrbHkuQmxvY2tzLmthcmVsX2lmLkRJUkVDVElPTlM7XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV93aGlsZU5vdENsZWFyID0ge1xuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1JlcGVhdCcsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGlsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5tYXplX3doaWxlTm90Q2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIGJyYW5jaCA9IGNvZGVnZW4ubG9vcFRyYXAoKSArIGJyYW5jaDtcbiAgICByZXR1cm4gJ3doaWxlICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3doaWxlTm90Q2xlYXIuRElSRUNUSU9OUyA9IFtcbiAgICBbbXNnLndoaWxlTXNnKCkgKyAnICcgKyBtc2cucGlsZVByZXNlbnQoKSwgJ3BpbGVQcmVzZW50J10sXG4gICAgW21zZy53aGlsZU1zZygpICsgJyAnICsgbXNnLmhvbGVQcmVzZW50KCksICdob2xlUHJlc2VudCddXG4gIF07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV91bnRpbEJsb2NrZWQgPSB7XG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUmVwZWF0JyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cucmVwZWF0VW50aWxCbG9ja2VkKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hpbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IubWF6ZV91bnRpbEJsb2NrZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS5pc1BhdGhGb3J3YXJkJyArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgYnJhbmNoID0gY29kZWdlbi5sb29wVHJhcCgpICsgYnJhbmNoO1xuICAgIHJldHVybiAnd2hpbGUgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfZm9yZXZlciA9IHtcbiAgICAvLyBEbyBmb3JldmVyIGxvb3AuXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUmVwZWF0JyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cucmVwZWF0VW50aWwoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLm1hemVfZm9yZXZlciwgMzUsIDM1KSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGlsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5tYXplX2ZvcmV2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBkbyBmb3JldmVyIGxvb3AuXG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgYnJhbmNoID0gY29kZWdlbi5sb29wVHJhcCgpICsgY29kZWdlbi5sb29wSGlnaGxpZ2h0KCdNYXplJywgdGhpcy5pZCkgKyBicmFuY2g7XG4gICAgcmV0dXJuICd3aGlsZSAoTWF6ZS5ub3RGaW5pc2hlZCgpKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXIgPSB7XG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvUmVwZWF0JyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMyMiwgMC45MCwgMC45NSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoaWxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICBicmFuY2ggPSBjb2RlZ2VuLmxvb3BUcmFwKCkgKyBicmFuY2g7XG4gICAgcmV0dXJuICd3aGlsZSAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyLkRJUkVDVElPTlMgPSBbXG4gICAgICAgW21zZy53aGlsZU1zZygpICsgJyAnICsgbXNnLnBpbGVQcmVzZW50KCksICdwaWxlUHJlc2VudCddLFxuICAgICAgIFttc2cud2hpbGVNc2coKSArICcgJyArIG1zZy5ob2xlUHJlc2VudCgpLCAnaG9sZVByZXNlbnQnXSxcbiAgICAgICBbbXNnLnJlcGVhdFVudGlsQmxvY2tlZCgpLCAnaXNQYXRoRm9yd2FyZCddXG4gIF07XG5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcblxufTtcbiIsIi8qanNoaW50IC1XMDg2ICovXG5cbnZhciBEaXJ0RHJhd2VyID0gcmVxdWlyZSgnLi9kaXJ0RHJhd2VyJyk7XG5yZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgY2VsbElkID0gcmVxdWlyZSgnLi9tYXplVXRpbHMnKS5jZWxsSWQ7XG5cbnZhciBTVkdfTlMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKS5TVkdfTlM7XG52YXIgU1FVQVJFX1NJWkUgPSA1MDtcblxuLyoqXG4gKiBJbmhlcml0cyBEaXJ0RHJhd2VyIHRvIGRyYXcgZmxvd2Vycy9ob25leWNvbWIgZm9yIGJlZS5cbiAqIEBwYXJhbSBkaXJ0TWFwIFRoZSBkaXJ0TWFwIGZyb20gdGhlIG1hemUsIHdoaWNoIHNob3dzIHRoZSBjdXJyZW50IHN0YXRlIG9mXG4gKiAgIHRoZSBkaXJ0IChvciBmbG93ZXJzL2hvbmV5IGluIHRoaXMgY2FzZSkuXG4gKiBAcGFyYW0gc2tpbiBUaGUgYXBwJ3Mgc2tpbiwgdXNlZCB0byBnZXQgVVJMcyBmb3Igb3VyIGltYWdlc1xuICogQHBhcmFtIGJlZSBUaGUgbWF6ZSdzIEJlZSBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIEJlZUl0ZW1EcmF3ZXIobWFwLCBza2luLCBiZWUpIHtcbiAgdGhpcy5fX2Jhc2UgPSBCZWVJdGVtRHJhd2VyLnN1cGVyUHJvdG90eXBlO1xuXG4gIERpcnREcmF3ZXIuY2FsbCh0aGlzLCBtYXAsICcnKTtcblxuICB0aGlzLnNraW5fID0gc2tpbjtcbiAgdGhpcy5iZWVfID0gYmVlO1xuXG4gIHRoaXMuaG9uZXlJbWFnZXNfID0gW107XG4gIHRoaXMubmVjdGFySW1hZ2VzXyA9IFtdO1xuICB0aGlzLnN2Z18gPSBudWxsO1xuICB0aGlzLnBlZ21hbl8gPSBudWxsO1xuXG4gIC8vIGlzIGl0ZW0gY3VycmVudGx5IGNvdmVyZWQgYnkgYSBjbG91ZD9cbiAgdGhpcy5jbG91ZGVkXyA9IHVuZGVmaW5lZDtcbiAgdGhpcy5yZXNldENsb3VkZWQoKTtcbn1cblxuQmVlSXRlbURyYXdlci5pbmhlcml0cyhEaXJ0RHJhd2VyKTtcbm1vZHVsZS5leHBvcnRzID0gQmVlSXRlbURyYXdlcjtcblxuLyoqXG4gKiBSZXNldHMgb3VyIHRyYWNraW5nIG9mIGNsb3VkZWQvcmV2ZWFsZWQgc3F1YXJlcy4gVXNlZCBvblxuICogaW5pdGlhbGl6YXRpb24gYW5kIGFsc28gdG8gcmVzZXQgdGhlIGRyYXdlciBiZXR3ZWVuIHJhbmRvbWl6ZWRcbiAqIGNvbmRpdGlvbmFscyBydW5zLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5yZXNldENsb3VkZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY2xvdWRlZF8gPSB0aGlzLmJlZV8uY3VycmVudFN0YXRpY0dyaWQubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByZXR1cm4gW107XG4gIH0pO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBEaXJ0RHJhd2VyJ3MgdXBkYXRlSXRlbUltYWdlLlxuICogQHBhcmFtIHtudW1iZXJ9IHJvd1xuICogQHBhcmFtIHtudW1iZXJ9IGNvbFxuICogQHBhcmFtIHtib29sZWFufSBydW5uaW5nIElzIHVzZXIgY29kZSBjdXJyZW50bHkgcnVubmluZ1xuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS51cGRhdGVJdGVtSW1hZ2UgPSBmdW5jdGlvbiAocm93LCBjb2wsIHJ1bm5pbmcpIHtcbiAgdmFyIGJhc2VJbWFnZSA9IHtcbiAgICBocmVmOiBudWxsLFxuICAgIHVuY2xpcHBlZFdpZHRoOiBTUVVBUkVfU0laRVxuICB9O1xuXG4gIGlmICh0aGlzLmJlZV8uaXNIaXZlKHJvdywgY29sLCBmYWxzZSkpIHtcbiAgICBiYXNlSW1hZ2UuaHJlZiA9IHRoaXMuc2tpbl8uaG9uZXk7XG4gIH0gZWxzZSBpZiAodGhpcy5iZWVfLmlzRmxvd2VyKHJvdywgY29sLCBmYWxzZSkpIHtcbiAgICBiYXNlSW1hZ2UuaHJlZiA9IHRoaXMuZmxvd2VySW1hZ2VIcmVmXyhyb3csIGNvbCk7XG4gIH1cblxuICB2YXIgaXNDbG91ZGFibGUgPSB0aGlzLmJlZV8uaXNDbG91ZGFibGUocm93LCBjb2wpO1xuICB2YXIgaXNDbG91ZGVkID0gIXJ1bm5pbmcgJiYgaXNDbG91ZGFibGU7XG4gIHZhciB3YXNDbG91ZGVkID0gaXNDbG91ZGFibGUgJiYgKHRoaXMuY2xvdWRlZF9bcm93XVtjb2xdID09PSB0cnVlKTtcblxuICB2YXIgY291bnRlclRleHQ7XG4gIHZhciBBQlNfVkFMVUVfVU5MSU1JVEVEID0gOTk7ICAvLyBSZXBlc2VudHMgdW5saW1pdGVkIG5lY3Rhci9ob25leS5cbiAgdmFyIEFCU19WQUxVRV9aRVJPID0gOTg7ICAvLyBSZXByZXNlbnRzIHplcm8gbmVjdGFyL2hvbmV5LlxuICB2YXIgYWJzVmFsID0gTWF0aC5hYnModGhpcy5iZWVfLmdldFZhbHVlKHJvdywgY29sKSk7XG4gIGlmIChpc0Nsb3VkZWQpIHtcbiAgICBjb3VudGVyVGV4dCA9IFwiXCI7XG4gIH0gZWxzZSBpZiAoIXJ1bm5pbmcgJiYgYmFzZUltYWdlLmhyZWYgPT09IHRoaXMuc2tpbl8ucHVycGxlRmxvd2VyKSB7XG4gICAgLy8gSW5pdGlhbGx5LCBoaWRlIGNvdW50ZXIgdmFsdWVzIG9mIHB1cnBsZSBmbG93ZXJzLlxuICAgIGNvdW50ZXJUZXh0ID0gXCI/XCI7XG4gIH0gZWxzZSBpZiAoYWJzVmFsID09PSBBQlNfVkFMVUVfVU5MSU1JVEVEKSB7XG4gICAgY291bnRlclRleHQgPSBcIlwiO1xuICB9IGVsc2UgaWYgKGFic1ZhbCA9PT0gQUJTX1ZBTFVFX1pFUk8pIHtcbiAgICBjb3VudGVyVGV4dCA9IFwiMFwiO1xuICB9IGVsc2Uge1xuICAgIGNvdW50ZXJUZXh0ID0gXCJcIiArIGFic1ZhbDtcbiAgfVxuXG4gIC8vIERpc3BsYXkgdGhlIGltYWdlcy5cbiAgaWYgKGJhc2VJbWFnZS5ocmVmKSB7XG4gICAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2JlZUl0ZW0nLCByb3csIGNvbCwgYmFzZUltYWdlLCAwKTtcbiAgICB0aGlzLnVwZGF0ZUNvdW50ZXJfKCdjb3VudGVyJywgcm93LCBjb2wsIGNvdW50ZXJUZXh0KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnVwZGF0ZUltYWdlV2l0aEluZGV4XygnYmVlSXRlbScsIHJvdywgY29sLCBiYXNlSW1hZ2UsIC0xKTtcbiAgICB0aGlzLnVwZGF0ZUNvdW50ZXJfKCdjb3VudGVyJywgcm93LCBjb2wsIFwiXCIpO1xuICB9XG5cbiAgaWYgKGlzQ2xvdWRlZCkge1xuICAgIHRoaXMuc2hvd0Nsb3VkXyhyb3csIGNvbCk7XG4gICAgdGhpcy5jbG91ZGVkX1tyb3ddW2NvbF0gPSB0cnVlO1xuICB9IGVsc2UgaWYgKHdhc0Nsb3VkZWQpIHtcbiAgICB0aGlzLmhpZGVDbG91ZF8ocm93LCBjb2wpO1xuICAgIHRoaXMuY2xvdWRlZF9bcm93XVtjb2xdID0gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjb3VudGVyIGF0IHRoZSBnaXZlbiByb3csY29sIHdpdGggdGhlIHByb3ZpZGVkIGNvdW50ZXJUZXh0LlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS51cGRhdGVDb3VudGVyXyA9IGZ1bmN0aW9uIChwcmVmaXgsIHJvdywgY29sLCBjb3VudGVyVGV4dCkge1xuICB2YXIgY291bnRlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjZWxsSWQocHJlZml4LCByb3csIGNvbCkpO1xuICBpZiAoIWNvdW50ZXJFbGVtZW50KSB7XG4gICAgLy8gd2Ugd2FudCBhbiBlbGVtZW50LCBzbyBsZXQncyBjcmVhdGUgb25lXG4gICAgY291bnRlckVsZW1lbnQgPSBjcmVhdGVUZXh0KHByZWZpeCwgcm93LCBjb2wsIGNvdW50ZXJUZXh0KTtcbiAgfVxuICBjb3VudGVyRWxlbWVudC5maXJzdENoaWxkLm5vZGVWYWx1ZSA9IGNvdW50ZXJUZXh0O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlVGV4dCAocHJlZml4LCByb3csIGNvbCwgY291bnRlclRleHQpIHtcbiAgdmFyIHBlZ21hbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwZWdtYW4tbG9jYXRpb24nKVswXTtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG5cbiAgLy8gQ3JlYXRlIHRleHQuXG4gIHZhciBoUGFkZGluZyA9IDI7XG4gIHZhciB2UGFkZGluZyA9IDI7XG4gIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3RleHQnKTtcbiAgLy8gUG9zaXRpb24gdGV4dCBqdXN0IGluc2lkZSB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3gnLCAoY29sICsgMSkgKiBTUVVBUkVfU0laRSAtIGhQYWRkaW5nKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ3knLCAocm93ICsgMSkgKiBTUVVBUkVfU0laRSAtIHZQYWRkaW5nKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2lkJywgY2VsbElkKHByZWZpeCwgcm93LCBjb2wpKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2JlZS1jb3VudGVyLXRleHQnKTtcbiAgdGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjb3VudGVyVGV4dCkpO1xuICBzdmcuaW5zZXJ0QmVmb3JlKHRleHQsIHBlZ21hbkVsZW1lbnQpO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5jcmVhdGVDb3VudGVySW1hZ2VfID0gZnVuY3Rpb24gKHByZWZpeCwgaSwgcm93LCBocmVmKSB7XG4gIHZhciBpZCA9IHByZWZpeCArIChpICsgMSk7XG4gIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCd5Jywgcm93ICogU1FVQVJFX1NJWkUpO1xuXG4gIGltYWdlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBocmVmKTtcblxuICB0aGlzLmdldFN2Z18oKS5pbnNlcnRCZWZvcmUoaW1hZ2UsIHRoaXMuZ2V0UGVnbWFuRWxlbWVudF8oKSk7XG5cbiAgcmV0dXJuIGltYWdlO1xufTtcblxuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuZmxvd2VySW1hZ2VIcmVmXyA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5iZWVfLmlzUmVkRmxvd2VyKHJvdywgY29sKSA/IHRoaXMuc2tpbl8ucmVkRmxvd2VyIDpcbiAgICB0aGlzLnNraW5fLnB1cnBsZUZsb3dlcjtcbn07XG5cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLnVwZGF0ZUhvbmV5Q291bnRlciA9IGZ1bmN0aW9uIChob25leUNvdW50KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaG9uZXlDb3VudDsgaSsrKSB7XG4gICAgaWYgKCF0aGlzLmhvbmV5SW1hZ2VzX1tpXSkge1xuICAgICAgdGhpcy5ob25leUltYWdlc19baV0gPSB0aGlzLmNyZWF0ZUNvdW50ZXJJbWFnZV8oJ2hvbmV5JywgaSwgMSxcbiAgICAgICAgdGhpcy5za2luXy5ob25leSk7XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhWCA9IFNRVUFSRV9TSVpFO1xuICAgIGlmIChob25leUNvdW50ID4gOCkge1xuICAgICAgZGVsdGFYID0gKDggLSAxKSAqIFNRVUFSRV9TSVpFIC8gKGhvbmV5Q291bnQgLSAxKTtcbiAgICB9XG4gICAgdGhpcy5ob25leUltYWdlc19baV0uc2V0QXR0cmlidXRlKCd4JywgaSAqIGRlbHRhWCk7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ob25leUltYWdlc18ubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLmhvbmV5SW1hZ2VzX1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc3BsYXknLCBpIDwgaG9uZXlDb3VudCA/ICdibG9jaycgOiAnbm9uZScpO1xuICB9XG59O1xuXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS51cGRhdGVOZWN0YXJDb3VudGVyID0gZnVuY3Rpb24gKG5lY3RhcnMpIHtcbiAgdmFyIG5lY3RhckNvdW50ID0gbmVjdGFycy5sZW5ndGg7XG4gIC8vIGNyZWF0ZSBhbnkgbmVlZGVkIGltYWdlc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5lY3RhckNvdW50OyBpKyspIHtcbiAgICB2YXIgaHJlZiA9IHRoaXMuZmxvd2VySW1hZ2VIcmVmXyhuZWN0YXJzW2ldLnJvdywgbmVjdGFyc1tpXS5jb2wpO1xuXG4gICAgaWYgKCF0aGlzLm5lY3RhckltYWdlc19baV0pIHtcbiAgICAgIHRoaXMubmVjdGFySW1hZ2VzX1tpXSA9IHRoaXMuY3JlYXRlQ291bnRlckltYWdlXygnbmVjdGFyJywgaSwgMCwgaHJlZik7XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhWCA9IFNRVUFSRV9TSVpFO1xuICAgIGlmIChuZWN0YXJDb3VudCA+IDgpIHtcbiAgICAgIGRlbHRhWCA9ICg4IC0gMSkgKiBTUVVBUkVfU0laRSAvIChuZWN0YXJDb3VudCAtIDEpO1xuICAgIH1cbiAgICB0aGlzLm5lY3RhckltYWdlc19baV0uc2V0QXR0cmlidXRlKCd4JywgaSAqIGRlbHRhWCk7XG4gICAgdGhpcy5uZWN0YXJJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICd4bGluazpocmVmJywgaHJlZik7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5uZWN0YXJJbWFnZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5uZWN0YXJJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZSgnZGlzcGxheScsIGkgPCBuZWN0YXJDb3VudCA/ICdibG9jaycgOiAnbm9uZScpO1xuICB9XG59O1xuXG4vKipcbiAqIENhY2hlIHN2ZyBlbGVtZW50XG4gKi9cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLmdldFN2Z18gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5zdmdfKSB7XG4gICAgdGhpcy5zdmdfID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcbiAgfVxuICByZXR1cm4gdGhpcy5zdmdfO1xufTtcblxuLyoqXG4gKiBDYWNoZSBwZWdtYW4gZWxlbWVudFxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5nZXRQZWdtYW5FbGVtZW50XyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnBlZ21hbl8pIHtcbiAgICB0aGlzLnBlZ21hbl8gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwZWdtYW4tbG9jYXRpb24nKVswXTtcbiAgfVxuICByZXR1cm4gdGhpcy5wZWdtYW5fO1xufTtcblxuLyoqXG4gKiBTaG93IHRoZSBjbG91ZCBpY29uLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5zaG93Q2xvdWRfID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgdmFyIGNsb3VkSW1hZ2VJbmZvICA9IHtcbiAgICBocmVmOiB0aGlzLnNraW5fLmNsb3VkLFxuICAgIHVuY2xpcHBlZFdpZHRoOiA1MFxuICB9O1xuICB0aGlzLnVwZGF0ZUltYWdlV2l0aEluZGV4XygnY2xvdWQnLCByb3csIGNvbCwgY2xvdWRJbWFnZUluZm8sIDApO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGUgYW5pbWF0aW9uIGlzIGNhY2hlZCBieSB0aGUgYnJvd3Nlci5cbiAgdGhpcy5kaXNwbGF5Q2xvdWRBbmltYXRpb25fKHJvdywgY29sLCBmYWxzZSAvKiBhbmltYXRlICovKTtcbn07XG5cbi8qKlxuICogSGlkZSB0aGUgY2xvdWQgaWNvbiwgYW5kIGRpc3BsYXkgdGhlIGNsb3VkIGhpZGluZyBhbmltYXRpb24uXG4gKi9cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLmhpZGVDbG91ZF8gPSBmdW5jdGlvbihyb3csIGNvbCkge1xuICB2YXIgY2xvdWRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2VsbElkKCdjbG91ZCcsIHJvdywgY29sKSk7XG4gIGlmIChjbG91ZEVsZW1lbnQpIHtcbiAgICBjbG91ZEVsZW1lbnQuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgdGhpcy5kaXNwbGF5Q2xvdWRBbmltYXRpb25fKHJvdywgY29sLCB0cnVlIC8qIGFuaW1hdGUgKi8pO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGNsb3VkIGFuaW1hdGlvbiBlbGVtZW50LCBhbmQgcGVyZm9ybSB0aGUgYW5pbWF0aW9uIGlmIG5lY2Vzc2FyeVxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5kaXNwbGF5Q2xvdWRBbmltYXRpb25fID0gZnVuY3Rpb24ocm93LCBjb2wsIGFuaW1hdGUpIHtcbiAgdmFyIGlkID0gY2VsbElkKCdjbG91ZEFuaW1hdGlvbicsIHJvdywgY29sKTtcblxuICB2YXIgY2xvdWRBbmltYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cbiAgaWYgKCFjbG91ZEFuaW1hdGlvbikge1xuICAgIHZhciBwZWdtYW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gICAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gICAgY2xvdWRBbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICAgIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBTUVVBUkVfU0laRSk7XG4gICAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCd4JywgY29sICogU1FVQVJFX1NJWkUpO1xuICAgIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGNsb3VkQW5pbWF0aW9uLCBwZWdtYW5FbGVtZW50KTtcbiAgfVxuXG4gIC8vIFdlIHdhbnQgdG8gY3JlYXRlIHRoZSBlbGVtZW50IGV2ZW50IGlmIHdlJ3JlIG5vdCBhbmltYXRpbmcgeWV0IHNvIHRoYXQgd2VcbiAgLy8gY2FuIG1ha2Ugc3VyZSBpdCBnZXRzIGxvYWRlZC5cbiAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgYW5pbWF0ZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKTtcbiAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgJ3hsaW5rOmhyZWYnLCB0aGlzLnNraW5fLmNsb3VkQW5pbWF0aW9uKTtcbn07XG5cbi8qKlxuICogRHJhdyBvdXIgY2hlY2tlcmJvYXJkIHRpbGUsIG1ha2luZyBwYXRoIHRpbGVzIGxpZ2h0ZXIuIEZvciBub24tcGF0aCB0aWxlcywgd2VcbiAqIHdhbnQgdG8gYmUgc3VyZSB0aGF0IHRoZSBjaGVja2VyYm9hcmQgc3F1YXJlIGlzIGJlbG93IHRoZSB0aWxlIGVsZW1lbnQgKGkuZS5cbiAqIHRoZSB0cmVlcykuXG4gKi9cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLmFkZENoZWNrZXJib2FyZFRpbGUgPSBmdW5jdGlvbiAocm93LCBjb2wsIGlzUGF0aCkge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcbiAgdmFyIHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd4JywgY29sICogU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCAnIzc4YmIyOScpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIGlzUGF0aCA/IDAuMiA6IDAuNSk7XG4gIGlmIChpc1BhdGgpIHtcbiAgICBzdmcuYXBwZW5kQ2hpbGQocmVjdCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUVsZW1lbnQnICsgKHJvdyAqIDggKyBjb2wpKTtcbiAgICBzdmcuaW5zZXJ0QmVmb3JlKHJlY3QsIHRpbGUpO1xuICB9XG59O1xuIiwidmFyIGNlbGxJZCA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJykuY2VsbElkO1xuXG4vLyBUaGUgbnVtYmVyIGxpbmUgaXMgWy1pbmYsIG1pbiwgbWluKzEsIC4uLiBubyB6ZXJvIC4uLiwgbWF4LTEsIG1heCwgK2luZl1cbnZhciBESVJUX01BWCA9IDEwO1xudmFyIERJUlRfQ09VTlQgPSBESVJUX01BWCAqIDIgKyAyO1xuXG4vLyBEdXBsaWNhdGVkIGZyb20gbWF6ZS5qcyBzbyB0aGF0IEkgZG9uJ3QgbmVlZCBhIGRlcGVuZGVuY3lcbnZhciBTUVVBUkVfU0laRSA9IDUwO1xuXG52YXIgU1ZHX05TID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJykuU1ZHX05TO1xuXG52YXIgRGlydERyYXdlciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1hcCwgZGlydEFzc2V0KSB7XG4gIHRoaXMubWFwXyA9IG1hcDtcblxuICB0aGlzLmRpcnRJbWFnZUluZm9fID0ge1xuICAgIGhyZWY6IGRpcnRBc3NldCxcbiAgICB1bmNsaXBwZWRXaWR0aDogU1FVQVJFX1NJWkUgKiBESVJUX0NPVU5UXG4gIH07XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgaW1hZ2UgYXQgdGhlIGdpdmVuIHJvdyxjb2wgYnkgZGV0ZXJtaW5pbmcgdGhlIHNwcml0ZUluZGV4IGZvciB0aGVcbiAqIGN1cnJlbnQgdmFsdWVcbiAqL1xuRGlydERyYXdlci5wcm90b3R5cGUudXBkYXRlSXRlbUltYWdlID0gZnVuY3Rpb24gKHJvdywgY29sLCBydW5uaW5nKSB7XG4gIHZhciB2YWwgPSB0aGlzLm1hcF8uZ2V0VmFsdWUocm93LCBjb2wpO1xuICB0aGlzLnVwZGF0ZUltYWdlV2l0aEluZGV4XygnZGlydCcsIHJvdywgY29sLCB0aGlzLmRpcnRJbWFnZUluZm9fLFxuICAgIHNwcml0ZUluZGV4Rm9yRGlydCh2YWwpKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBpbWFnZSBhdCB0aGUgZ2l2ZW4gcm93LGNvbCB3aXRoIHRoZSBwcm92aWRlZCBzcHJpdGVJbmRleC5cbiAqL1xuRGlydERyYXdlci5wcm90b3R5cGUudXBkYXRlSW1hZ2VXaXRoSW5kZXhfID0gZnVuY3Rpb24gKHByZWZpeCwgcm93LCBjb2wsIGltYWdlSW5mbywgc3ByaXRlSW5kZXgpIHtcbiAgdmFyIGhpZGRlbkltYWdlID0gKHNwcml0ZUluZGV4IDwgMCB8fCBpbWFnZUluZm8uaHJlZiA9PT0gbnVsbCk7XG5cbiAgdmFyIGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNlbGxJZChwcmVmaXgsIHJvdywgY29sKSk7XG4gIGlmICghaW1nKSB7XG4gICAgLy8gd2UgZG9uJ3QgbmVlZCBhbnkgaW1hZ2VcbiAgICBpZiAoaGlkZGVuSW1hZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gd2Ugd2FudCBhbiBpbWFnZSwgc28gbGV0J3MgY3JlYXRlIG9uZVxuICAgIGltZyA9IGNyZWF0ZUltYWdlKHByZWZpeCwgcm93LCBjb2wsIGltYWdlSW5mbyk7XG4gIH0gZWxzZSBpZiAoaW1hZ2VJbmZvLmhyZWYpIHtcbiAgICAvL3VwZGF0ZSBpbWdcbiAgICBpbWcuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsIGltYWdlSW5mby5ocmVmKTtcbiAgfVxuXG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCBoaWRkZW5JbWFnZSA/ICdoaWRkZW4nIDogJ3Zpc2libGUnKTtcbiAgaWYgKCFoaWRkZW5JbWFnZSkge1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3gnLCBTUVVBUkVfU0laRSAqIChjb2wgLSBzcHJpdGVJbmRleCkpO1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3knLCBTUVVBUkVfU0laRSAqIHJvdyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUltYWdlIChwcmVmaXgsIHJvdywgY29sLCBpbWFnZUluZm8pIHtcbiAgdmFyIHBlZ21hbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwZWdtYW4tbG9jYXRpb24nKVswXTtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG5cbiAgdmFyIGNsaXBJZCA9IGNlbGxJZChwcmVmaXggKyAnQ2xpcCcsIHJvdywgY29sKTtcbiAgdmFyIGltZ0lkID0gY2VsbElkKHByZWZpeCwgcm93LCBjb2wpO1xuXG4gIC8vIENyZWF0ZSBjbGlwIHBhdGguXG4gIHZhciBjbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2NsaXBQYXRoJyk7XG4gIGNsaXAuc2V0QXR0cmlidXRlKCdpZCcsIGNsaXBJZCk7XG4gIHZhciByZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCBjb2wgKiBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd5Jywgcm93ICogU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIGNsaXAuYXBwZW5kQ2hpbGQocmVjdCk7XG4gIHN2Zy5pbnNlcnRCZWZvcmUoY2xpcCwgcGVnbWFuRWxlbWVudCk7XG4gIC8vIENyZWF0ZSBpbWFnZS5cbiAgdmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICBpbWcuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsIGltYWdlSW5mby5ocmVmKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICBpbWcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGltYWdlSW5mby51bmNsaXBwZWRXaWR0aCk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBjbGlwSWQgKyAnKScpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdpZCcsIGltZ0lkKTtcbiAgc3ZnLmluc2VydEJlZm9yZShpbWcsIHBlZ21hbkVsZW1lbnQpO1xuXG4gIHJldHVybiBpbWc7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBkaXJ0IHZhbHVlLCByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgc3ByaXRlIHRvIHVzZSBpbiBvdXIgc3ByaXRlc2hlZXQuXG4gKiBSZXR1cm5zIC0xIGlmIHdlIHdhbnQgdG8gZGlzcGxheSBubyBzcHJpdGUuXG4gKi9cbiBmdW5jdGlvbiBzcHJpdGVJbmRleEZvckRpcnQgKHZhbCkge1xuICB2YXIgc3ByaXRlSW5kZXg7XG5cbiAgaWYgKHZhbCA9PT0gMCkge1xuICAgIHNwcml0ZUluZGV4ID0gLTE7XG4gIH0gZWxzZSBpZih2YWwgPCAtRElSVF9NQVgpIHtcbiAgICBzcHJpdGVJbmRleCA9IDA7XG4gIH0gZWxzZSBpZiAodmFsIDwgMCkge1xuICAgIHNwcml0ZUluZGV4ID0gRElSVF9NQVggKyB2YWwgKyAxO1xuICB9IGVsc2UgaWYgKHZhbCA+IERJUlRfTUFYKSB7XG4gICAgc3ByaXRlSW5kZXggPSBESVJUX0NPVU5UIC0gMTtcbiAgfSBlbHNlIGlmICh2YWwgPiAwKSB7XG4gICAgc3ByaXRlSW5kZXggPSBESVJUX01BWCArIHZhbDtcbiAgfVxuXG4gIHJldHVybiBzcHJpdGVJbmRleDtcbn1cblxuLyogc3RhcnQtdGVzdC1ibG9jayAqL1xuLy8gZXhwb3J0IHByaXZhdGUgZnVuY3Rpb24ocykgdG8gZXhwb3NlIHRvIHVuaXQgdGVzdGluZ1xuRGlydERyYXdlci5fX3Rlc3Rvbmx5X18gPSB7XG4gIHNwcml0ZUluZGV4Rm9yRGlydDogc3ByaXRlSW5kZXhGb3JEaXJ0LFxuICBjcmVhdGVJbWFnZTogY3JlYXRlSW1hZ2Vcbn07XG4vKiBlbmQtdGVzdC1ibG9jayAqL1xuIiwiLyoqXG4gKiBHZW5lcmFsaXplZCBmdW5jdGlvbiBmb3IgZ2VuZXJhdGluZyBpZHMgZm9yIGNlbGxzIGluIGEgdGFibGVcbiAqL1xuZXhwb3J0cy5jZWxsSWQgPSBmdW5jdGlvbiAocHJlZml4LCByb3csIGNvbCkge1xuICByZXR1cm4gcHJlZml4ICsgJ18nICsgcm93ICsgJ18nICsgY29sO1xufTtcblxuLyoqXG4gKiBJcyBza2luIGVpdGhlciBiZWUgb3IgYmVlX25pZ2h0XG4gKi9cbmV4cG9ydHMuaXNCZWVTa2luID0gZnVuY3Rpb24gKHNraW5JZCkge1xuICByZXR1cm4gKC9iZWUoX25pZ2h0KT8vKS50ZXN0KHNraW5JZCk7XG59O1xuXG4vKipcbiAqIElzIHNraW4gc2NyYXRcbiAqL1xuZXhwb3J0cy5pc1NjcmF0U2tpbiA9IGZ1bmN0aW9uIChza2luSWQpIHtcbiAgcmV0dXJuICgvc2NyYXQvKS50ZXN0KHNraW5JZCk7XG59O1xuIiwiLyoqXG4gKiBCbG9ja3Mgc3BlY2lmaWMgdG8gQmVlXG4gKi9cblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxudmFyIE9QRVJBVE9SUyA9IFtcbiAgWyc9JywgJz09J10sXG4gIFsnPCcsICc8J10sXG4gIFsnPicsICc+J11cbl07XG5cbnZhciBUT09MVElQUyA9IHtcbiAgJz09JzogQmxvY2tseS5Nc2cuTE9HSUNfQ09NUEFSRV9UT09MVElQX0VRLFxuICAnPCc6IEJsb2NrbHkuTXNnLkxPR0lDX0NPTVBBUkVfVE9PTFRJUF9MVCxcbiAgJz4nOiBCbG9ja2x5Lk1zZy5MT0dJQ19DT01QQVJFX1RPT0xUSVBfR1Rcbn07XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcbiAgdmFyIGlzSzEgPSBibG9ja0luc3RhbGxPcHRpb25zLmlzSzE7XG5cbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG5cbiAgYWRkSWZPbmx5Rmxvd2VyKGJsb2NrbHksIGdlbmVyYXRvcik7XG4gIGFkZElmRmxvd2VySGl2ZShibG9ja2x5LCBnZW5lcmF0b3IpO1xuICBhZGRJZkVsc2VGbG93ZXJIaXZlKGJsb2NrbHksIGdlbmVyYXRvcik7XG5cbiAgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCAnYmVlX2lmTmVjdGFyQW1vdW50JywgJ2lmJyxcbiAgICBbW21zZy5uZWN0YXJSZW1haW5pbmcoKSwgJ25lY3RhclJlbWFpbmluZyddLFxuICAgICBbbXNnLmhvbmV5QXZhaWxhYmxlKCksICdob25leUF2YWlsYWJsZSddXSk7XG5cbiAgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCAnYmVlX2lmZWxzZU5lY3RhckFtb3VudCcsICdpZmVsc2UnLFxuICAgIFtbbXNnLm5lY3RhclJlbWFpbmluZygpLCAnbmVjdGFyUmVtYWluaW5nJ10sXG4gICAgIFttc2cuaG9uZXlBdmFpbGFibGUoKSwgJ2hvbmV5QXZhaWxhYmxlJ11dKTtcblxuICBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsICdiZWVfaWZUb3RhbE5lY3RhcicsICdpZicsXG4gICAgW1ttc2cudG90YWxOZWN0YXIoKSwgJ25lY3RhckNvbGxlY3RlZCddLFxuICAgICBbbXNnLnRvdGFsSG9uZXkoKSwgJ2hvbmV5Q3JlYXRlZCddXSk7XG5cbiAgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCAnYmVlX2lmZWxzZVRvdGFsTmVjdGFyJywgJ2lmZWxzZScsXG4gICAgW1ttc2cudG90YWxOZWN0YXIoKSwgJ25lY3RhckNvbGxlY3RlZCddLFxuICAgICBbbXNnLnRvdGFsSG9uZXkoKSwgJ2hvbmV5Q3JlYXRlZCddXSk7XG5cbiAgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCAnYmVlX3doaWxlTmVjdGFyQW1vdW50JywgJ3doaWxlJyxcbiAgICBbW21zZy5uZWN0YXJSZW1haW5pbmcoKSwgJ25lY3RhclJlbWFpbmluZyddLFxuICAgICBbbXNnLmhvbmV5QXZhaWxhYmxlKCksICdob25leUF2YWlsYWJsZSddXSk7XG5cbiAgYmxvY2tVdGlscy5nZW5lcmF0ZVNpbXBsZUJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIG5hbWU6ICdtYXplX25lY3RhcicsXG4gICAgaGVscFVybDogJycsXG4gICAgdGl0bGU6IGlzSzEgPyBtc2cuZ2V0KCkgOiBtc2cubmVjdGFyKCksXG4gICAgdGl0bGVJbWFnZTogaXNLMSA/IHNraW4ucmVkRmxvd2VyIDogdW5kZWZpbmVkLFxuICAgIHRvb2x0aXA6IG1zZy5uZWN0YXJUb29sdGlwKCksXG4gICAgZnVuY3Rpb25OYW1lOiAnTWF6ZS5nZXROZWN0YXInXG4gIH0pO1xuXG4gIGJsb2NrVXRpbHMuZ2VuZXJhdGVTaW1wbGVCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBuYW1lOiAnbWF6ZV9ob25leScsXG4gICAgaGVscFVybDogJycsXG4gICAgdGl0bGU6IGlzSzEgPyBtc2cubWFrZSgpIDogbXNnLmhvbmV5KCksXG4gICAgdGl0bGVJbWFnZTogaXNLMSA/IHNraW4uaG9uZXkgOiB1bmRlZmluZWQsXG4gICAgdG9vbHRpcDogbXNnLmhvbmV5VG9vbHRpcCgpLFxuICAgIGZ1bmN0aW9uTmFtZTogJ01hemUubWFrZUhvbmV5J1xuICB9KTtcbn07XG5cbi8qKlxuICogQXJlIHdlIGF0IGEgZmxvd2VyXG4gKi9cbmZ1bmN0aW9uIGFkZElmT25seUZsb3dlcihibG9ja2x5LCBnZW5lcmF0b3IpIHtcbiAgYmxvY2tseS5CbG9ja3MuYmVlX2lmT25seUZsb3dlciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pZkNvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuYXRGbG93ZXIoKSk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZPbmx5Rmxvd2VyVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIEVYQU1QTEU6XG4gIC8vIGlmIChNYXplLmF0Rmxvd2VyKCkpIHsgY29kZSB9XG4gIGdlbmVyYXRvci5iZWVfaWZPbmx5Rmxvd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB3ZSdyZSBhdCBhIGZsb3dlclxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLmF0Rmxvd2VyJyArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xufVxuXG4vKipcbiAqIEFyZSB3ZSBhdCBhIGZsb3dlciBvciBhIGhpdmVcbiAqL1xuZnVuY3Rpb24gYWRkSWZGbG93ZXJIaXZlKGJsb2NrbHksIGdlbmVyYXRvcikge1xuICBibG9ja2x5LkJsb2Nrcy5iZWVfaWZGbG93ZXIgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgTE9DQVRJT05TID0gW1xuICAgICAgICBbbXNnLmF0Rmxvd2VyKCksICdhdEZsb3dlciddLFxuICAgICAgICBbbXNnLmF0SG9uZXljb21iKCksICdhdEhvbmV5Y29tYiddXG4gICAgICBdO1xuXG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaWZDb2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihMT0NBVElPTlMpLCAnTE9DJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZGbG93ZXJUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRVhBTVBMRVM6XG4gIC8vIGlmIChNYXplLmF0Rmxvd2VyKCkpIHsgY29kZSB9XG4gIC8vIGlmIChNYXplLmF0SG9uZXljb21iKCkpIHsgY29kZSB9XG4gIGdlbmVyYXRvci5iZWVfaWZGbG93ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHdlJ3JlIGF0IGEgZmxvd2VyL2hpdmVcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdMT0MnKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xufVxuXG4vKipcbiAqIEFyZSB3ZSBhdCBhIGZsb3dlciBvciBhIGhpdmUgd2l0aCBlbHNlXG4gKi9cbmZ1bmN0aW9uIGFkZElmRWxzZUZsb3dlckhpdmUoYmxvY2tseSwgZ2VuZXJhdG9yKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmJlZV9pZkVsc2VGbG93ZXIgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgTE9DQVRJT05TID0gW1xuICAgICAgICBbbXNnLmF0Rmxvd2VyKCksICdhdEZsb3dlciddLFxuICAgICAgICBbbXNnLmF0SG9uZXljb21iKCksICdhdEhvbmV5Y29tYiddXG4gICAgICBdO1xuXG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaWZDb2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihMT0NBVElPTlMpLCAnTE9DJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0VMU0UnKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZWxzZUNvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmZWxzZUZsb3dlclRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICAvLyBFWEFNUExFUzpcbiAgLy8gaWYgKE1hemUuYXRGbG93ZXIoKSkgeyBjb2RlIH0gZWxzZSB7IG1vcmVjb2RlIH1cbiAgLy8gaWYgKE1hemUuYXRIb25leWNvbWIoKSkgeyBjb2RlIH0gZWxzZSB7IG1vcmVjb2RlIH1cbiAgZ2VuZXJhdG9yLmJlZV9pZkVsc2VGbG93ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHdlJ3JlIGF0IGEgZmxvd2VyL2hpdmVcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdMT0MnKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaDAgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBicmFuY2gxID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRUxTRScpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaDAgK1xuICAgICAgJ30gZWxzZSB7XFxuJyArIGJyYW5jaDEgKyAnfVxcbic7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgbmFtZSwgdHlwZSwgYXJnMSkge1xuICBibG9ja2x5LkJsb2Nrc1tuYW1lXSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIGNvbmRpdGlvbmFsTXNnO1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2lmJzpcbiAgICAgICAgICBjb25kaXRpb25hbE1zZyA9IG1zZy5pZkNvZGUoKTtcbiAgICAgICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2lmZWxzZSc6XG4gICAgICAgICAgY29uZGl0aW9uYWxNc2cgPSBtc2cuaWZDb2RlKCk7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3aGlsZSc6XG4gICAgICAgICAgY29uZGl0aW9uYWxNc2cgPSBtc2cud2hpbGVNc2coKTtcbiAgICAgICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93ICdVbmV4cGN0ZWQgdHlwZSBmb3IgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2snO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb25kaXRpb25hbE1zZyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKGFyZzEpLCAnQVJHMScpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUoJyAnKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oT1BFUkFUT1JTKSwgJ09QJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZSgnICcpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLFxuICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnQVJHMicpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICBpZiAodHlwZSA9PT0gXCJpZmVsc2VcIikge1xuICAgICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdFTFNFJylcbiAgICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZWxzZUNvZGUoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuXG4gICAgICB0aGlzLnNldFRvb2x0aXAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcCA9IHNlbGYuZ2V0VGl0bGVWYWx1ZSgnT1AnKTtcbiAgICAgICAgcmV0dXJuIFRPT0xUSVBTW29wXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBpZiAoTWF6ZS5uZWN0YXJDb2xsZWN0ZWQoKSA+IDApIHsgY29kZSB9XG4gIC8vIGlmIChNYXplLmhvbmV5Q3JlYXRlZCgpID09IDEpIHsgY29kZSB9XG4gIGdlbmVyYXRvcltuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgd2UncmUgYXQgYSBmbG93ZXIvaGl2ZVxuICAgIHZhciBhcmd1bWVudDEgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdBUkcxJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBvcGVyYXRvciA9IHRoaXMuZ2V0VGl0bGVWYWx1ZSgnT1AnKTtcbiAgICB2YXIgb3JkZXIgPSAob3BlcmF0b3IgPT09ICc9PScgfHwgb3BlcmF0b3IgPT09ICchPScpID9cbiAgICAgIEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9FUVVBTElUWSA6IEJsb2NrbHkuSmF2YVNjcmlwdC5PUkRFUl9SRUxBVElPTkFMO1xuICAgIHZhciBhcmd1bWVudDIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0FSRzInKTtcbiAgICB2YXIgYnJhbmNoMCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGVsc2VCbG9jayA9IFwiXCI7XG4gICAgaWYgKHR5cGUgPT09IFwiaWZlbHNlXCIpIHtcbiAgICAgIHZhciBicmFuY2gxID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRUxTRScpO1xuICAgICAgZWxzZUJsb2NrID0gJyBlbHNlIHtcXG4nICsgYnJhbmNoMSArICd9JztcbiAgICB9XG5cbiAgICB2YXIgY29tbWFuZCA9IHR5cGU7XG4gICAgaWYgKHR5cGUgPT09IFwiaWZlbHNlXCIpIHtcbiAgICAgIGNvbW1hbmQgPSBcImlmXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbW1hbmQgKyAnICgnICsgYXJndW1lbnQxICsgJyAnICsgb3BlcmF0b3IgICsgJyAnICsgYXJndW1lbnQyICsgJykge1xcbicgK1xuICAgICAgYnJhbmNoMCArICd9JyArIGVsc2VCbG9jayArICdcXG4nO1xuICB9O1xufVxuIiwidmFyIHRpbGVzID0gcmVxdWlyZSgnLi90aWxlcycpO1xudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBNb3ZlRGlyZWN0aW9uID0gdGlsZXMuTW92ZURpcmVjdGlvbjtcbnZhciBUdXJuRGlyZWN0aW9uID0gdGlsZXMuVHVybkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgQmVlID0gcmVxdWlyZSgnLi9iZWUnKTtcblxuLyoqXG4gKiBPbmx5IGNhbGwgQVBJIGZ1bmN0aW9ucyBpZiB3ZSBoYXZlbid0IHlldCB0ZXJtaW5hdGVkIGV4ZWN1dGlvblxuICovXG52YXIgQVBJX0ZVTkNUSU9OID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiB1dGlscy5leGVjdXRlSWZDb25kaXRpb25hbChmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICFNYXplLmV4ZWN1dGlvbkluZm8uaXNUZXJtaW5hdGVkKCk7XG4gIH0sIGZuKTtcbn07XG5cbi8qKlxuICogSXMgdGhlcmUgYSBwYXRoIG5leHQgdG8gcGVnbWFuP1xuICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiBEaXJlY3Rpb24gdG8gbG9va1xuICogICAgICgwID0gZm9yd2FyZCwgMSA9IHJpZ2h0LCAyID0gYmFja3dhcmQsIDMgPSBsZWZ0KS5cbiAqIEBwYXJhbSB7P3N0cmluZ30gaWQgSUQgb2YgYmxvY2sgdGhhdCB0cmlnZ2VyZWQgdGhpcyBhY3Rpb24uXG4gKiAgICAgTnVsbCBpZiBjYWxsZWQgYXMgYSBoZWxwZXIgZnVuY3Rpb24gaW4gTWF6ZS5tb3ZlKCkuXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAqL1xudmFyIGlzUGF0aCA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaWQpIHtcbiAgdmFyIGVmZmVjdGl2ZURpcmVjdGlvbiA9IE1hemUucGVnbWFuRCArIGRpcmVjdGlvbjtcbiAgdmFyIHNxdWFyZTtcbiAgdmFyIGNvbW1hbmQ7XG4gIHN3aXRjaCAodGlsZXMuY29uc3RyYWluRGlyZWN0aW9uNChlZmZlY3RpdmVEaXJlY3Rpb24pKSB7XG4gICAgY2FzZSBEaXJlY3Rpb24uTk9SVEg6XG4gICAgICBzcXVhcmUgPSBNYXplLm1hcC5nZXRUaWxlKE1hemUucGVnbWFuWSAtIDEsIE1hemUucGVnbWFuWCk7XG4gICAgICBjb21tYW5kID0gJ2xvb2tfbm9ydGgnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uRUFTVDpcbiAgICAgIHNxdWFyZSA9IE1hemUubWFwLmdldFRpbGUoTWF6ZS5wZWdtYW5ZLCBNYXplLnBlZ21hblggKyAxKTtcbiAgICAgIGNvbW1hbmQgPSAnbG9va19lYXN0JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLlNPVVRIOlxuICAgICAgc3F1YXJlID0gTWF6ZS5tYXAuZ2V0VGlsZShNYXplLnBlZ21hblkgKyAxLCBNYXplLnBlZ21hblgpO1xuICAgICAgY29tbWFuZCA9ICdsb29rX3NvdXRoJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLldFU1Q6XG4gICAgICBzcXVhcmUgPSBNYXplLm1hcC5nZXRUaWxlKE1hemUucGVnbWFuWSwgTWF6ZS5wZWdtYW5YIC0gMSk7XG4gICAgICBjb21tYW5kID0gJ2xvb2tfd2VzdCc7XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoaWQpIHtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oY29tbWFuZCwgaWQpO1xuICB9XG4gIHJldHVybiBzcXVhcmUgIT09IFNxdWFyZVR5cGUuV0FMTCAmJlxuICAgICAgICBzcXVhcmUgIT09IFNxdWFyZVR5cGUuT0JTVEFDTEUgJiZcbiAgICAgICAgc3F1YXJlICE9PSB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIEF0dGVtcHQgdG8gbW92ZSBwZWdtYW4gZm9yd2FyZCBvciBiYWNrd2FyZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXJlY3Rpb24gRGlyZWN0aW9uIHRvIG1vdmUgKDAgPSBmb3J3YXJkLCAyID0gYmFja3dhcmQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIElEIG9mIGJsb2NrIHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICogQHRocm93cyB7dHJ1ZX0gSWYgdGhlIGVuZCBvZiB0aGUgbWF6ZSBpcyByZWFjaGVkLlxuICogQHRocm93cyB7ZmFsc2V9IElmIFBlZ21hbiBjb2xsaWRlcyB3aXRoIGEgd2FsbC5cbiAqL1xudmFyIG1vdmUgPSBmdW5jdGlvbihkaXJlY3Rpb24sIGlkKSB7XG4gIGlmICghaXNQYXRoKGRpcmVjdGlvbiwgbnVsbCkpIHtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ2ZhaWxfJyArIChkaXJlY3Rpb24gPyAnYmFja3dhcmQnIDogJ2ZvcndhcmQnKSwgaWQpO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoZmFsc2UpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBJZiBtb3ZpbmcgYmFja3dhcmQsIGZsaXAgdGhlIGVmZmVjdGl2ZSBkaXJlY3Rpb24uXG4gIHZhciBlZmZlY3RpdmVEaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQgKyBkaXJlY3Rpb247XG4gIHZhciBjb21tYW5kO1xuICBzd2l0Y2ggKHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQoZWZmZWN0aXZlRGlyZWN0aW9uKSkge1xuICAgIGNhc2UgRGlyZWN0aW9uLk5PUlRIOlxuICAgICAgTWF6ZS5wZWdtYW5ZLS07XG4gICAgICBjb21tYW5kID0gJ25vcnRoJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLkVBU1Q6XG4gICAgICBNYXplLnBlZ21hblgrKztcbiAgICAgIGNvbW1hbmQgPSAnZWFzdCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5TT1VUSDpcbiAgICAgIE1hemUucGVnbWFuWSsrO1xuICAgICAgY29tbWFuZCA9ICdzb3V0aCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5XRVNUOlxuICAgICAgTWF6ZS5wZWdtYW5YLS07XG4gICAgICBjb21tYW5kID0gJ3dlc3QnO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKGNvbW1hbmQsIGlkKTtcbiAgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgIE1hemUud29yZFNlYXJjaC5tYXJrVGlsZVZpc2l0ZWQoTWF6ZS5wZWdtYW5ZLCBNYXplLnBlZ21hblgsIGZhbHNlKTtcbiAgICAvLyB3b3Jkc2VhcmNoIGRvZXNudCBjaGVjayBmb3Igc3VjY2VzcyB1bnRpbCBpdCBoYXMgZmluaXNoZWQgcnVubmluZyBjb21wbGV0ZWx5XG4gICAgcmV0dXJuO1xuICB9IGVsc2UgaWYgKE1hemUuaGFzTXVsdGlwbGVQb3NzaWJsZUdyaWRzKCkpIHtcbiAgICAvLyBuZWl0aGVyIGRvIHF1YW50dW0gbWFwc1xuICAgIHJldHVybjtcbiAgfVxuICBNYXplLmNoZWNrU3VjY2VzcygpO1xufTtcblxuLyoqXG4gKiBUdXJuIHBlZ21hbiBsZWZ0IG9yIHJpZ2h0LlxuICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvbiBEaXJlY3Rpb24gdG8gdHVybiAoMCA9IGxlZnQsIDEgPSByaWdodCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgSUQgb2YgYmxvY2sgdGhhdCB0cmlnZ2VyZWQgdGhpcyBhY3Rpb24uXG4gKi9cbnZhciB0dXJuID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBpZiAoZGlyZWN0aW9uID09IFR1cm5EaXJlY3Rpb24uUklHSFQpIHtcbiAgICAvLyBSaWdodCB0dXJuIChjbG9ja3dpc2UpLlxuICAgIE1hemUucGVnbWFuRCArPSBUdXJuRGlyZWN0aW9uLlJJR0hUO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbigncmlnaHQnLCBpZCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTGVmdCB0dXJuIChjb3VudGVyY2xvY2t3aXNlKS5cbiAgICBNYXplLnBlZ21hbkQgKz0gVHVybkRpcmVjdGlvbi5MRUZUO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignbGVmdCcsIGlkKTtcbiAgfVxuICBNYXplLnBlZ21hbkQgPSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KE1hemUucGVnbWFuRCk7XG59O1xuXG4vKipcbiAqIFR1cm4gcGVnbWFuIHRvd2FyZHMgYSBnaXZlbiBkaXJlY3Rpb24sIHR1cm5pbmcgdGhyb3VnaCBzdGFnZSBmcm9udCAoc291dGgpXG4gKiB3aGVuIHBvc3NpYmxlLlxuICogQHBhcmFtIHtudW1iZXJ9IG5ld0RpcmVjdGlvbiBEaXJlY3Rpb24gdG8gdHVybiB0byAoZS5nLiwgRGlyZWN0aW9uLk5PUlRIKVxuICogQHBhcmFtIHtzdHJpbmd9IGlkIElEIG9mIGJsb2NrIHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICovXG52YXIgdHVyblRvID0gZnVuY3Rpb24obmV3RGlyZWN0aW9uLCBpZCkge1xuICB2YXIgY3VycmVudERpcmVjdGlvbiA9IE1hemUucGVnbWFuRDtcbiAgaWYgKGlzVHVybkFyb3VuZChjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdmFyIHNob3VsZFR1cm5DV1RvUHJlZmVyU3RhZ2VGcm9udCA9IGN1cnJlbnREaXJlY3Rpb24gLSBuZXdEaXJlY3Rpb24gPCAwO1xuICAgIHZhciByZWxhdGl2ZVR1cm5EaXJlY3Rpb24gPSBzaG91bGRUdXJuQ1dUb1ByZWZlclN0YWdlRnJvbnQgPyBUdXJuRGlyZWN0aW9uLlJJR0hUIDogVHVybkRpcmVjdGlvbi5MRUZUO1xuICAgIHR1cm4ocmVsYXRpdmVUdXJuRGlyZWN0aW9uLCBpZCk7XG4gICAgdHVybihyZWxhdGl2ZVR1cm5EaXJlY3Rpb24sIGlkKTtcbiAgfSBlbHNlIGlmIChpc1JpZ2h0VHVybihjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdHVybihUdXJuRGlyZWN0aW9uLlJJR0hULCBpZCk7XG4gIH0gZWxzZSBpZiAoaXNMZWZ0VHVybihjdXJyZW50RGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pKSB7XG4gICAgdHVybihUdXJuRGlyZWN0aW9uLkxFRlQsIGlkKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gaXNMZWZ0VHVybihkaXJlY3Rpb24sIG5ld0RpcmVjdGlvbikge1xuICByZXR1cm4gbmV3RGlyZWN0aW9uID09PSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGRpcmVjdGlvbiArIFR1cm5EaXJlY3Rpb24uTEVGVCk7XG59XG5cbmZ1bmN0aW9uIGlzUmlnaHRUdXJuKGRpcmVjdGlvbiwgbmV3RGlyZWN0aW9uKSB7XG4gIHJldHVybiBuZXdEaXJlY3Rpb24gPT09IHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQoZGlyZWN0aW9uICsgVHVybkRpcmVjdGlvbi5SSUdIVCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHR1cm5pbmcgZnJvbSBkaXJlY3Rpb24gdG8gbmV3RGlyZWN0aW9uIHdvdWxkIGJlIGEgMTgwwrAgdHVyblxuICogQHBhcmFtIHtudW1iZXJ9IGRpcmVjdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IG5ld0RpcmVjdGlvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVHVybkFyb3VuZChkaXJlY3Rpb24sIG5ld0RpcmVjdGlvbikge1xuICByZXR1cm4gTWF0aC5hYnMoZGlyZWN0aW9uIC0gbmV3RGlyZWN0aW9uKSA9PSBNb3ZlRGlyZWN0aW9uLkJBQ0tXQVJEO1xufVxuXG5mdW5jdGlvbiBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8uY29sbGVjdEFjdGlvbnMoKTtcbiAgdHVyblRvKGRpcmVjdGlvbiwgaWQpO1xuICBtb3ZlKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xuICBNYXplLmV4ZWN1dGlvbkluZm8uc3RvcENvbGxlY3RpbmcoKTtcbn1cblxuZXhwb3J0cy5tb3ZlRm9yd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMubW92ZUJhY2t3YXJkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmUoTW92ZURpcmVjdGlvbi5CQUNLV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMubW92ZU5vcnRoID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmVBYnNvbHV0ZURpcmVjdGlvbihEaXJlY3Rpb24uTk9SVEgsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVTb3V0aCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLlNPVVRILCBpZCk7XG59KTtcblxuZXhwb3J0cy5tb3ZlRWFzdCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLkVBU1QsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVXZXN0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIG1vdmVBYnNvbHV0ZURpcmVjdGlvbihEaXJlY3Rpb24uV0VTVCwgaWQpO1xufSk7XG5cbmV4cG9ydHMudHVybkxlZnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdHVybihUdXJuRGlyZWN0aW9uLkxFRlQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLnR1cm5SaWdodCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB0dXJuKFR1cm5EaXJlY3Rpb24uUklHSFQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLmlzUGF0aEZvcndhcmQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLkZPUldBUkQsIGlkKTtcbn0pO1xuZXhwb3J0cy5ub1BhdGhGb3J3YXJkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiAhaXNQYXRoKE1vdmVEaXJlY3Rpb24uRk9SV0FSRCwgaWQpO1xufSk7XG5cbmV4cG9ydHMuaXNQYXRoUmlnaHQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLlJJR0hULCBpZCk7XG59KTtcblxuZXhwb3J0cy5pc1BhdGhCYWNrd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICByZXR1cm4gaXNQYXRoKE1vdmVEaXJlY3Rpb24uQkFDS1dBUkQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLmlzUGF0aExlZnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLkxFRlQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLnBpbGVQcmVzZW50ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgcmV0dXJuIE1hemUubWFwLmlzRGlydCh5LCB4KSAmJiBNYXplLm1hcC5nZXRWYWx1ZSh5LCB4KSA+IDA7XG59KTtcblxuZXhwb3J0cy5ob2xlUHJlc2VudCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB2YXIgeCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHkgPSBNYXplLnBlZ21hblk7XG4gIHJldHVybiBNYXplLm1hcC5pc0RpcnQoeSwgeCkgJiYgTWF6ZS5tYXAuZ2V0VmFsdWUoeSwgeCkgPCAwO1xufSk7XG5cbmV4cG9ydHMuY3VycmVudFBvc2l0aW9uTm90Q2xlYXIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIHggPSBNYXplLnBlZ21hblg7XG4gIHZhciB5ID0gTWF6ZS5wZWdtYW5ZO1xuICByZXR1cm4gTWF6ZS5tYXAuaXNEaXJ0KHksIHgpICYmIE1hemUubWFwLmdldFZhbHVlKHksIHgpICE9PSAwO1xufSk7XG5cbmV4cG9ydHMuZmlsbCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ3B1dGRvd24nLCBpZCk7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5tYXAuc2V0VmFsdWUoeSwgeCwgTWF6ZS5tYXAuZ2V0VmFsdWUoeSwgeCkgKyAxKTtcbn0pO1xuXG5leHBvcnRzLmRpZyA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ3BpY2t1cCcsIGlkKTtcbiAgdmFyIHggPSBNYXplLnBlZ21hblg7XG4gIHZhciB5ID0gTWF6ZS5wZWdtYW5ZO1xuICBNYXplLm1hcC5zZXRWYWx1ZSh5LCB4LCBNYXplLm1hcC5nZXRWYWx1ZSh5LCB4KSAtIDEpO1xufSk7XG5cbmV4cG9ydHMubm90RmluaXNoZWQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhTWF6ZS5jaGVja1N1Y2Nlc3MoKTtcbn0pO1xuXG4vLyBUaGUgY29kZSBmb3IgdGhpcyBBUEkgc2hvdWxkIGdldCBzdHJpcHBlZCB3aGVuIHNob3dpbmcgY29kZVxuZXhwb3J0cy5sb29wSGlnaGxpZ2h0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ251bGwnLCBpZCk7XG59KTtcblxuXG5cbi8qKlxuICogQmVlIHJlbGF0ZWQgQVBJIGZ1bmN0aW9ucy4gSWYgYmV0dGVyIG1vZHVsYXJpemVkLCB3ZSBjb3VsZCBwb3RlbnRpYWxseVxuICogc2VwYXJhdGUgdGhlc2Ugb3V0LCBidXQgYXMgdGhpbmdzIHN0YW5kIHJpZ2h0IG5vdyB0aGV5IHdpbGwgYmUgbG9hZGVkXG4gKiB3aGV0aGVyIG9yIG5vdCB3ZSdyZSBhIEJlZSBsZXZlbFxuICovXG5leHBvcnRzLmdldE5lY3RhciA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmJlZS5nZXROZWN0YXIoaWQpO1xufSk7XG5cbmV4cG9ydHMubWFrZUhvbmV5ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIE1hemUuYmVlLm1ha2VIb25leShpZCk7XG59KTtcblxuZXhwb3J0cy5hdEZsb3dlciA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB2YXIgY29sID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgcm93ID0gTWF6ZS5wZWdtYW5ZO1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJhdF9mbG93ZXJcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUuaXNGbG93ZXIocm93LCBjb2wsIHRydWUpO1xufSk7XG5cbmV4cG9ydHMuYXRIb25leWNvbWIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIGNvbCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHJvdyA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwiYXRfaG9uZXljb21iXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLmlzSGl2ZShyb3csIGNvbCwgdHJ1ZSk7XG59KTtcblxuZXhwb3J0cy5uZWN0YXJSZW1haW5pbmcgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24gKGlkKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcIm5lY3Rhcl9yZW1haW5pbmdcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUubmVjdGFyUmVtYWluaW5nKHRydWUpO1xufSk7XG5cbmV4cG9ydHMuaG9uZXlBdmFpbGFibGUgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24gKGlkKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcImhvbmV5X2F2YWlsYWJsZVwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5ob25leUF2YWlsYWJsZSgpO1xufSk7XG5cbmV4cG9ydHMubmVjdGFyQ29sbGVjdGVkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJuZWN0YXJfY29sbGVjdGVkXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLm5lY3RhcnNfLmxlbmd0aDtcbn0pO1xuXG5leHBvcnRzLmhvbmV5Q3JlYXRlZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbiAoaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwiaG9uZXlfY3JlYXRlZFwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5ob25leV87XG59KTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbWF6ZU1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgQmVlQ2VsbCA9IHJlcXVpcmUoJy4vYmVlQ2VsbCcpO1xudmFyIFRlc3RSZXN1bHRzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzLmpzJykuVGVzdFJlc3VsdHM7XG52YXIgVGVybWluYXRpb25WYWx1ZSA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy5qcycpLkJlZVRlcm1pbmF0aW9uVmFsdWU7XG5cbnZhciBVTkxJTUlURURfSE9ORVkgPSAtOTk7XG52YXIgVU5MSU1JVEVEX05FQ1RBUiA9IDk5O1xuXG52YXIgRU1QVFlfSE9ORVkgPSAtOTg7IC8vIEhpdmUgd2l0aCAwIGhvbmV5XG52YXIgRU1QVFlfTkVDVEFSID0gOTg7IC8vIGZsb3dlciB3aXRoIDAgaG9uZXlcblxudmFyIEJlZSA9IGZ1bmN0aW9uIChtYXplLCBzdHVkaW9BcHAsIGNvbmZpZykge1xuICB0aGlzLm1hemVfID0gbWF6ZTtcbiAgdGhpcy5zdHVkaW9BcHBfID0gc3R1ZGlvQXBwO1xuICB0aGlzLnNraW5fID0gY29uZmlnLnNraW47XG4gIHRoaXMuZGVmYXVsdEZsb3dlckNvbG9yXyA9IChjb25maWcubGV2ZWwuZmxvd2VyVHlwZSA9PT0gJ3JlZFdpdGhOZWN0YXInID9cbiAgICAncmVkJyA6ICdwdXJwbGUnKTtcbiAgaWYgKHRoaXMuZGVmYXVsdEZsb3dlckNvbG9yXyA9PT0gJ3B1cnBsZScgJiZcbiAgICBjb25maWcubGV2ZWwuZmxvd2VyVHlwZSAhPT0gJ3B1cnBsZU5lY3RhckhpZGRlbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBmbG93ZXJUeXBlIGZvciBCZWU6ICcgKyBjb25maWcubGV2ZWwuZmxvd2VyVHlwZSk7XG4gIH1cblxuICB0aGlzLm5lY3RhckdvYWxfID0gY29uZmlnLmxldmVsLm5lY3RhckdvYWwgfHwgMDtcbiAgdGhpcy5ob25leUdvYWxfID0gY29uZmlnLmxldmVsLmhvbmV5R29hbCB8fCAwO1xuXG4gIC8vIGF0IGVhY2ggbG9jYXRpb24sIHRyYWNrcyB3aGV0aGVyIHVzZXIgY2hlY2tlZCB0byBzZWUgaWYgaXQgd2FzIGEgZmxvd2VyIG9yXG4gIC8vIGhvbmV5Y29tYiB1c2luZyBhbiBpZiBibG9ja1xuICB0aGlzLnVzZXJDaGVja3NfID0gW107XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgbWFwIGdyaWRcbiAgLy9cbiAgLy8gXCJzZXJpYWxpemVkTWF6ZVwiIGlzIHRoZSBuZXcgd2F5IG9mIHN0b3JpbmcgbWFwczsgaXQncyBhIEpTT04gYXJyYXlcbiAgLy8gY29udGFpbmluZyBjb21wbGV4IG1hcCBkYXRhLlxuICAvL1xuICAvLyBcIm1hcFwiIHBsdXMgb3B0aW9uYWxseSBcImxldmVsRGlydFwiIGlzIHRoZSBvbGQgd2F5IG9mIHN0b3JpbmcgbWFwcztcbiAgLy8gdGhleSBhcmUgZWFjaCBhcnJheXMgb2YgYSBjb21iaW5hdGlvbiBvZiBzdHJpbmdzIGFuZCBpbnRzIHdpdGhcbiAgLy8gdGhlaXIgb3duIGNvbXBsZXggc3ludGF4LiBUaGlzIHdheSBpcyBkZXByZWNhdGVkIGZvciBuZXcgbGV2ZWxzLFxuICAvLyBhbmQgb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IGZvciBub3QteWV0LXVwZGF0ZWRcbiAgLy8gbGV2ZWxzLlxuICAvL1xuICAvLyBFaXRoZXIgd2F5LCB3ZSB0dXJuIHdoYXQgd2UgaGF2ZSBpbnRvIGEgZ3JpZCBvZiBCZWVDZWxscywgYW55IG9uZVxuICAvLyBvZiB3aGljaCBtYXkgcmVwcmVzZW50IGEgbnVtYmVyIG9mIHBvc3NpYmxlIFwic3RhdGljXCIgY2VsbHMuIFdlIHRoZW5cbiAgLy8gdHVybiB0aGF0IHZhcmlhYmxlIGdyaWQgb2YgQmVlQ2VsbHMgaW50byBhIHNldCBvZiBzdGF0aWMgZ3JpZHMuXG4gIHRoaXMudmFyaWFibGVHcmlkID0gdW5kZWZpbmVkO1xuICBpZiAoY29uZmlnLmxldmVsLnNlcmlhbGl6ZWRNYXplKSB7XG4gICAgdGhpcy52YXJpYWJsZUdyaWQgPSBjb25maWcubGV2ZWwuc2VyaWFsaXplZE1hemUubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgIHJldHVybiByb3cubWFwKEJlZUNlbGwuZGVzZXJpYWxpemUpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRoaXMudmFyaWFibGVHcmlkID0gY29uZmlnLmxldmVsLm1hcC5tYXAoZnVuY3Rpb24gKHJvdywgeCkge1xuICAgICAgcmV0dXJuIHJvdy5tYXAoZnVuY3Rpb24gKG1hcENlbGwsIHkpIHtcbiAgICAgICAgdmFyIGluaXRpYWxEaXJ0Q2VsbCA9IGNvbmZpZy5sZXZlbC5pbml0aWFsRGlydFt4XVt5XTtcbiAgICAgICAgcmV0dXJuIEJlZUNlbGwucGFyc2VGcm9tT2xkVmFsdWVzKG1hcENlbGwsIGluaXRpYWxEaXJ0Q2VsbCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICB0aGlzLnN0YXRpY0dyaWRzID0gQmVlLmdldEFsbFN0YXRpY0dyaWRzKHRoaXMudmFyaWFibGVHcmlkKTtcblxuICB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkSWQgPSAwO1xuICB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkID0gdGhpcy5zdGF0aWNHcmlkc1swXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmVlO1xuXG4vKipcbiAqIENsb25lcyB0aGUgZ2l2ZW4gZ3JpZCBvZiBCZWVDZWxscyBieSBjYWxsaW5nIEJlZUNlbGwuY2xvbmVcbiAqIEBwYXJhbSB7QmVlQ2VsbFtdW119IGdyaWRcbiAqIEByZXR1cm4ge0JlZUNlbGxbXVtdfSBncmlkXG4gKi9cbkJlZS5jbG9uZUdyaWQgPSBmdW5jdGlvbiAoZ3JpZCkge1xuICByZXR1cm4gZ3JpZC5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICByZXR1cm4gY2VsbC5jbG9uZSgpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2l2ZW4gYSBzaW5nbGUgZ3JpZCBvZiBCZWVDZWxscywgc29tZSBvZiB3aGljaCBtYXkgYmUgXCJ2YXJpYWJsZVwiXG4gKiBjZWxscywgcmV0dXJuIGEgbGlzdCBvZiBncmlkcyBvZiBub24tdmFyaWFibGUgQmVlQ2VsbHMgcmVwcmVzZW50aW5nXG4gKiBhbGwgcG9zc2libGUgdmFyaWFibGUgY29tYmluYXRpb25zLlxuICogQHBhcmFtIHtCZWVDZWxsW11bXX0gdmFyaWFibGVHcmlkXG4gKiBAcmV0dXJuIHtCZWVDZWxsW11bXVtdfSBncmlkc1xuICovXG5CZWUuZ2V0QWxsU3RhdGljR3JpZHMgPSBmdW5jdGlvbiAodmFyaWFibGVHcmlkKSB7XG4gIHZhciBncmlkcyA9IFsgdmFyaWFibGVHcmlkIF07XG4gIHZhcmlhYmxlR3JpZC5mb3JFYWNoKGZ1bmN0aW9uIChyb3csIHgpIHtcbiAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCwgeSkge1xuICAgICAgaWYgKGNlbGwuaXNWYXJpYWJsZUNsb3VkKCkgfHwgY2VsbC5pc1ZhcmlhYmxlUmFuZ2UoKSkge1xuICAgICAgICB2YXIgcG9zc2libGVBc3NldHMgPSBjZWxsLmdldFBvc3NpYmxlR3JpZEFzc2V0cygpO1xuICAgICAgICB2YXIgbmV3R3JpZHMgPSBbXTtcbiAgICAgICAgcG9zc2libGVBc3NldHMuZm9yRWFjaChmdW5jdGlvbihhc3NldCkge1xuICAgICAgICAgIGdyaWRzLmZvckVhY2goZnVuY3Rpb24oZ3JpZCkge1xuICAgICAgICAgICAgdmFyIG5ld01hcCA9IEJlZS5jbG9uZUdyaWQoZ3JpZCk7XG4gICAgICAgICAgICBuZXdNYXBbeF1beV0gPSBhc3NldDtcbiAgICAgICAgICAgIG5ld0dyaWRzLnB1c2gobmV3TWFwKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdyaWRzID0gbmV3R3JpZHM7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZ3JpZHM7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZS5wcm90b3R5cGUuaGFzTXVsdGlwbGVQb3NzaWJsZUdyaWRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zdGF0aWNHcmlkcy5sZW5ndGggPiAxO1xufTtcblxuLyoqXG4gKiBTaW1wbGUgcGFzc3Rocm91Z2ggdGhhdCBjYWxscyByZXNldEN1cnJudFZhbHVlIGZvciBldmVyeSBCZWVDZWxsIGluXG4gKiB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkXG4gKi9cbkJlZS5wcm90b3R5cGUucmVzZXRDdXJyZW50VmFsdWVzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICBjZWxsLnJlc2V0Q3VycmVudFZhbHVlKCk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXNldHMgY3VycmVudCBzdGF0ZSwgZm9yIGVhc3kgcmVleGVjdXRpb24gb2YgdGVzdHNcbiAqL1xuQmVlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5ob25leV8gPSAwO1xuICAvLyBsaXN0IG9mIHRoZSBsb2NhdGlvbnMgd2UndmUgZ3JhYmJlZCBuZWN0YXIgZnJvbVxuICB0aGlzLm5lY3RhcnNfID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jdXJyZW50U3RhdGljR3JpZC5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMudXNlckNoZWNrc19baV0gPSBbXTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY3VycmVudFN0YXRpY0dyaWRbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgIHRoaXMudXNlckNoZWNrc19baV1bal0gPSB7XG4gICAgICAgIGNoZWNrZWRGb3JGbG93ZXI6IGZhbHNlLFxuICAgICAgICBjaGVja2VkRm9ySGl2ZTogZmFsc2UsXG4gICAgICAgIGNoZWNrZWRGb3JOZWN0YXI6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBpZiAodGhpcy5tYXplXy5ncmlkSXRlbURyYXdlcikge1xuICAgIHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlTmVjdGFyQ291bnRlcih0aGlzLm5lY3RhcnNfKTtcbiAgICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUhvbmV5Q291bnRlcih0aGlzLmhvbmV5Xyk7XG4gIH1cbiAgdGhpcy5yZXNldEN1cnJlbnRWYWx1ZXMoKTtcbn07XG5cbi8qKlxuICogQXNzaWducyB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkIHRvIHRoZSBhcHByb3ByaWF0ZSBncmlkIGFuZCByZXNldHMgYWxsXG4gKiBjdXJyZW50IHZhbHVlc1xuICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gKi9cbkJlZS5wcm90b3R5cGUudXNlR3JpZFdpdGhJZCA9IGZ1bmN0aW9uIChpZCkge1xuICB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkSWQgPSBpZDtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZCA9IHRoaXMuc3RhdGljR3JpZHNbaWRdO1xuICB0aGlzLnJlc2V0Q3VycmVudFZhbHVlcygpO1xuICB0aGlzLnJlc2V0KCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2xcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHZhbFxuICovXG5CZWUucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXS5nZXRDdXJyZW50VmFsdWUoKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtOdW1iZXJ9IHJvd1xuICogQHBhcmFtIHtOdW1iZXJ9IGNvbFxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbFxuICovXG5CZWUucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHJvdywgY29sLCB2YWwpIHtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uc2V0Q3VycmVudFZhbHVlKHZhbCk7XG59O1xuXG4vKipcbiAqIERpZCB3ZSByZWFjaCBvdXIgdG90YWwgbmVjdGFyL2hvbmV5IGdvYWxzP1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlLnByb3RvdHlwZS5maW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gbmVjdGFyL2hvbmV5IGdvYWxzXG4gIGlmICh0aGlzLmhvbmV5XyA8IHRoaXMuaG9uZXlHb2FsXyB8fCB0aGlzLm5lY3RhcnNfLmxlbmd0aCA8IHRoaXMubmVjdGFyR29hbF8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIXRoaXMuY2hlY2tlZEFsbENsb3VkZWQoKSB8fCAhdGhpcy5jaGVja2VkQWxsUHVycGxlKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIXRoaXMuY29sbGVjdGVkRXZlcnl0aGluZygpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZS5wcm90b3R5cGUuY29sbGVjdGVkRXZlcnl0aGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gcXVhbnR1bSBtYXBzIGltcGxpY2l0eSByZXF1aXJlIFwiY29sbGVjdCBldmVyeXRoaW5nXCIsIG5vbi1xdWFudHVtXG4gIC8vIG1hcHMgZG9uJ3QgcmVhbGx5IGNhcmVcbiAgaWYgKCF0aGlzLmhhc011bHRpcGxlUG9zc2libGVHcmlkcygpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgbWlzc2VkU29tZXRoaW5nID0gdGhpcy5jdXJyZW50U3RhdGljR3JpZC5zb21lKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByZXR1cm4gcm93LnNvbWUoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgIHJldHVybiBjZWxsLmlzRGlydCgpICYmIGNlbGwuZ2V0Q3VycmVudFZhbHVlKCkgPiAwO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gIW1pc3NlZFNvbWV0aGluZztcbn07XG5cbi8qKlxuICogQ2FsbGVkIGFmdGVyIHVzZXIncyBjb2RlIGhhcyBmaW5pc2hlZCBleGVjdXRpbmcuIEdpdmVzIHVzIGEgY2hhbmNlIHRvXG4gKiB0ZXJtaW5hdGUgd2l0aCBhcHAtc3BlY2lmaWMgdmFsdWVzLCBzdWNoIGFzIHVuY2hlY2tlZCBjbG91ZC9wdXJwbGUgZmxvd2Vycy5cbiAqL1xuQmVlLnByb3RvdHlwZS5vbkV4ZWN1dGlvbkZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV4ZWN1dGlvbkluZm8gPSB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm87XG4gIGlmIChleGVjdXRpb25JbmZvLmlzVGVybWluYXRlZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLmZpbmlzaGVkKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB3ZSBkaWRuJ3QgZmluaXNoLiBsb29rIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIGdpdmUgYW4gYXBwIHNwZWNpZmljIGVycm9yXG4gIGlmICh0aGlzLm5lY3RhcnNfLmxlbmd0aCA8IHRoaXMubmVjdGFyR29hbF8pIHtcbiAgICBleGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLklOU1VGRklDSUVOVF9ORUNUQVIpO1xuICB9IGVsc2UgaWYgKHRoaXMuaG9uZXlfIDwgdGhpcy5ob25leUdvYWxfKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfSE9ORVkpO1xuICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrZWRBbGxDbG91ZGVkKCkpIHtcbiAgICBleGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLlVOQ0hFQ0tFRF9DTE9VRCk7XG4gIH0gZWxzZSBpZiAoIXRoaXMuY2hlY2tlZEFsbFB1cnBsZSgpKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfUFVSUExFKTtcbiAgfSBlbHNlIGlmICghdGhpcy5jb2xsZWN0ZWRFdmVyeXRoaW5nKCkpIHtcbiAgICBleGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLkRJRF9OT1RfQ09MTEVDVF9FVkVSWVRISU5HKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEaWQgd2UgY2hlY2sgZXZlcnkgZmxvd2VyL2hvbmV5IHRoYXQgd2FzIGNvdmVyZWQgYnkgYSBjbG91ZD9cbiAqL1xuQmVlLnByb3RvdHlwZS5jaGVja2VkQWxsQ2xvdWRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5jdXJyZW50U3RhdGljR3JpZC5sZW5ndGg7IHJvdysrKSB7XG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgIGlmICh0aGlzLnNob3VsZENoZWNrQ2xvdWQocm93LCBjb2wpICYmICF0aGlzLmNoZWNrZWRDbG91ZChyb3csIGNvbCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogRGlkIHdlIGNoZWNrIGV2ZXJ5IHB1cnBsZSBmbG93ZXJcbiAqL1xuQmVlLnByb3RvdHlwZS5jaGVja2VkQWxsUHVycGxlID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkLmxlbmd0aDsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgaWYgKHRoaXMuaXNQdXJwbGVGbG93ZXIocm93LCBjb2wpICYmICF0aGlzLnVzZXJDaGVja3NfW3Jvd11bY29sXS5jaGVja2VkRm9yTmVjdGFyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdGVzdCByZXN1bHRzIGJhc2VkIG9uIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZS4gIElmIHRoZXJlIGlzXG4gKiBubyBhcHAtc3BlY2lmaWMgZmFpbHVyZSwgdGhpcyByZXR1cm5zIFN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cygpLlxuICovXG5CZWUucHJvdG90eXBlLmdldFRlc3RSZXN1bHRzID0gZnVuY3Rpb24gKHRlcm1pbmF0aW9uVmFsdWUpIHtcbiAgc3dpdGNoICh0ZXJtaW5hdGlvblZhbHVlKSB7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9GTE9XRVI6XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkZMT1dFUl9FTVBUWTpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0hPTkVZQ09NQjpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSE9ORVlDT01CX0ZVTEw6XG4gICAgICByZXR1cm4gVGVzdFJlc3VsdHMuQVBQX1NQRUNJRklDX0ZBSUw7XG5cbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX0NMT1VEOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfUFVSUExFOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfTkVDVEFSOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfSE9ORVk6XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkRJRF9OT1RfQ09MTEVDVF9FVkVSWVRISU5HOlxuICAgICAgdmFyIHRlc3RSZXN1bHRzID0gdGhpcy5zdHVkaW9BcHBfLmdldFRlc3RSZXN1bHRzKHRydWUpO1xuICAgICAgLy8gSWYgd2UgaGF2ZSBhIG5vbi1hcHAgc3BlY2lmaWMgZmFpbHVyZSwgd2Ugd2FudCB0aGF0IHRvIHRha2UgcHJlY2VkZW5jZS5cbiAgICAgIC8vIFZhbHVlcyBvdmVyIFRPT19NQU5ZX0JMT0NLU19GQUlMIGFyZSBub3QgdHJ1ZSBmYWlsdXJlcywgYnV0IGluZGljYXRlXG4gICAgICAvLyBhIHN1Ym9wdGltYWwgc29sdXRpb24sIHNvIGluIHRob3NlIGNhc2VzIHdlIHdhbnQgdG8gcmV0dXJuIG91clxuICAgICAgLy8gYXBwIHNwZWNpZmljIGZhaWxcbiAgICAgIGlmICh0ZXN0UmVzdWx0cyA+PSBUZXN0UmVzdWx0cy5UT09fTUFOWV9CTE9DS1NfRkFJTCkge1xuICAgICAgICB0ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRlc3RSZXN1bHRzO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyhmYWxzZSk7XG59O1xuXG4vKipcbiAqIEdldCBhbnkgYXBwLXNwZWNpZmljIG1lc3NhZ2UsIGJhc2VkIG9uIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZSxcbiAqIG9yIHJldHVybiBudWxsIGlmIG5vbmUgYXBwbGllcy5cbiAqL1xuQmVlLnByb3RvdHlwZS5nZXRNZXNzYWdlID0gZnVuY3Rpb24gKHRlcm1pbmF0aW9uVmFsdWUpIHtcbiAgc3dpdGNoICh0ZXJtaW5hdGlvblZhbHVlKSB7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9GTE9XRVI6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5ub3RBdEZsb3dlckVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkZMT1dFUl9FTVBUWTpcbiAgICAgIHJldHVybiBtYXplTXNnLmZsb3dlckVtcHR5RXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0hPTkVZQ09NQjpcbiAgICAgIHJldHVybiBtYXplTXNnLm5vdEF0SG9uZXljb21iRXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSE9ORVlDT01CX0ZVTEw6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5ob25leWNvbWJGdWxsRXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX0NMT1VEOlxuICAgICAgcmV0dXJuIG1hemVNc2cudW5jaGVja2VkQ2xvdWRFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfUFVSUExFOlxuICAgICAgcmV0dXJuIG1hemVNc2cudW5jaGVja2VkUHVycGxlRXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX05FQ1RBUjpcbiAgICAgIHJldHVybiBtYXplTXNnLmluc3VmZmljaWVudE5lY3RhcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfSE9ORVk6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5pbnN1ZmZpY2llbnRIb25leSgpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5ESURfTk9UX0NPTExFQ1RfRVZFUllUSElORzpcbiAgICAgIHJldHVybiBtYXplTXNnLmRpZE5vdENvbGxlY3RFdmVyeXRoaW5nKCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlckNoZWNrIElzIHRoaXMgYmVpbmcgY2FsbGVkIGZyb20gdXNlciBjb2RlXG4gKi9cbkJlZS5wcm90b3R5cGUuaXNIaXZlID0gZnVuY3Rpb24gKHJvdywgY29sLCB1c2VyQ2hlY2spIHtcbiAgdXNlckNoZWNrID0gdXNlckNoZWNrIHx8IGZhbHNlO1xuICBpZiAodXNlckNoZWNrKSB7XG4gICAgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckhpdmUgPSB0cnVlO1xuICB9XG4gIHZhciBjZWxsID0gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF07XG4gIHJldHVybiBjZWxsLmlzSGl2ZSgpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVzZXJDaGVjayBJcyB0aGlzIGJlaW5nIGNhbGxlZCBmcm9tIHVzZXIgY29kZVxuICovXG5CZWUucHJvdG90eXBlLmlzRmxvd2VyID0gZnVuY3Rpb24gKHJvdywgY29sLCB1c2VyQ2hlY2spIHtcbiAgdXNlckNoZWNrID0gdXNlckNoZWNrIHx8IGZhbHNlO1xuICBpZiAodXNlckNoZWNrKSB7XG4gICAgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckZsb3dlciA9IHRydWU7XG4gIH1cbiAgdmFyIGNlbGwgPSB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXTtcbiAgcmV0dXJuIGNlbGwuaXNGbG93ZXIoKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGNlbGwgc2hvdWxkIGJlIGNsb3ZlcmVkIGJ5IGEgY2xvdWQgd2hpbGUgcnVubmluZ1xuICovXG5CZWUucHJvdG90eXBlLmlzQ2xvdWRhYmxlID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXS5pc1N0YXRpY0Nsb3VkKCk7XG59O1xuXG4vKipcbiAqIFRoZSBvbmx5IGNsb3VkcyB3ZSBjYXJlIGFib3V0IGNoZWNraW5nIGFyZSBjbG91ZHMgdGhhdCB3ZXJlIGRlZmluZWRcbiAqIGFzIHN0YXRpYyBjbG91ZHMgaW4gdGhlIG9yaWdpbmFsIGdyaWQ7IHF1YW50dW0gY2xvdWRzIHdpbGwgaGFuZGxlXG4gKiAncmVxdWlyaW5nJyBjaGVja3MgdGhyb3VnaCB0aGVpciBxdWFudHVtIG5hdHVyZS5cbiAqL1xuQmVlLnByb3RvdHlwZS5zaG91bGRDaGVja0Nsb3VkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLnZhcmlhYmxlR3JpZFtyb3ddW2NvbF0uaXNTdGF0aWNDbG91ZCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgY2VsbCBoYXMgYmVlbiBjaGVja2VkIGZvciBlaXRoZXIgYSBmbG93ZXIgb3IgYSBoaXZlXG4gKi9cbkJlZS5wcm90b3R5cGUuY2hlY2tlZENsb3VkID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLnVzZXJDaGVja3NfW3Jvd11bY29sXS5jaGVja2VkRm9yRmxvd2VyIHx8IHRoaXMudXNlckNoZWNrc19bcm93XVtjb2xdLmNoZWNrZWRGb3JIaXZlO1xufTtcblxuLyoqXG4gKiBGbG93ZXJzIGFyZSBlaXRoZXIgcmVkIG9yIHB1cnBsZS4gVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgaWYgYSBmbG93ZXIgaXMgcmVkLlxuICovXG5CZWUucHJvdG90eXBlLmlzUmVkRmxvd2VyID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIGlmICghdGhpcy5pc0Zsb3dlcihyb3csIGNvbCwgZmFsc2UpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgdGhlIGZsb3dlciBoYXMgYmVlbiBvdmVycmlkZGVuIHRvIGJlIHJlZCwgcmV0dXJuIHRydWUuXG4gIC8vIE90aGVyd2lzZSwgaWYgdGhlIGZsb3dlciBoYXMgYmVlbiBvdmVycmlkZGVuIHRvIGJlIHB1cnBsZSwgcmV0dXJuXG4gIC8vIGZhbHNlLiBJZiBuZWl0aGVyIG9mIHRob3NlIGFyZSB0cnVlLCB0aGVuIHRoZSBmbG93ZXIgaXMgd2hhdGV2ZXJcbiAgLy8gdGhlIGRlZmF1bHQgZmxvd2VyIGNvbG9yIGlzLlxuICBpZiAodGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uaXNSZWRGbG93ZXIoKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudFN0YXRpY0dyaWRbcm93XVtjb2xdLmlzUHVycGxlRmxvd2VyKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdEZsb3dlckNvbG9yXyA9PT0gJ3JlZCc7XG4gIH1cbn07XG5cbi8qKlxuICogUm93LCBjb2wgY29udGFpbnMgYSBmbG93ZXIgdGhhdCBpcyBwdXJwbGVcbiAqL1xuQmVlLnByb3RvdHlwZS5pc1B1cnBsZUZsb3dlciA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5pc0Zsb3dlcihyb3csIGNvbCwgZmFsc2UpICYmICF0aGlzLmlzUmVkRmxvd2VyKHJvdywgY29sKTtcbn07XG5cbi8qKlxuICogSG93IG11Y2ggbW9yZSBob25leSBjYW4gdGhlIGhpdmUgYXQgKHJvdywgY29sKSBwcm9kdWNlIGJlZm9yZSBpdCBoaXRzIHRoZSBnb2FsXG4gKi9cbkJlZS5wcm90b3R5cGUuaGl2ZVJlbWFpbmluZ0NhcGFjaXR5ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIGlmICghdGhpcy5pc0hpdmUocm93LCBjb2wpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgdmFsID0gdGhpcy5nZXRWYWx1ZShyb3csIGNvbCk7XG4gIGlmICh2YWwgPT09IFVOTElNSVRFRF9IT05FWSkge1xuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuICBpZiAodmFsID09PSBFTVBUWV9IT05FWSkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIEhvdyBtdWNoIG1vcmUgbmVjdGFyIGNhbiBiZSBjb2xsZWN0ZWQgZnJvbSB0aGUgZmxvd2VyIGF0IChyb3csIGNvbClcbiAqL1xuQmVlLnByb3RvdHlwZS5mbG93ZXJSZW1haW5pbmdDYXBhY2l0eSA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICBpZiAoIXRoaXMuaXNGbG93ZXIocm93LCBjb2wpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgdmFsID0gdGhpcy5nZXRWYWx1ZShyb3csIGNvbCk7XG4gIGlmICh2YWwgPT09IFVOTElNSVRFRF9ORUNUQVIpIHtcbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbiAgaWYgKHZhbCA9PT0gRU1QVFlfTkVDVEFSKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogVXBkYXRlIG1vZGVsIHRvIHJlcHJlc2VudCBtYWRlIGhvbmV5LiAgRG9lcyBubyB2YWxpZGF0aW9uXG4gKi9cbkJlZS5wcm90b3R5cGUubWFkZUhvbmV5QXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpICE9PSBVTkxJTUlURURfSE9ORVkpIHtcbiAgICB0aGlzLnNldFZhbHVlKHJvdywgY29sLCB0aGlzLmdldFZhbHVlKHJvdywgY29sKSAtIDEpO1xuICB9XG5cbiAgdGhpcy5ob25leV8gKz0gMTtcbn07XG5cbi8qKlxuICogVXBkYXRlIG1vZGVsIHRvIHJlcHJlc2VudCBnYXRoZXJlZCBuZWN0YXIuIERvZXMgbm8gdmFsaWRhdGlvblxuICovXG5CZWUucHJvdG90eXBlLmdvdE5lY3RhckF0ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIGlmICh0aGlzLmdldFZhbHVlKHJvdywgY29sKSAhPT0gVU5MSU1JVEVEX05FQ1RBUikge1xuICAgIHRoaXMuc2V0VmFsdWUocm93LCBjb2wsIHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpIC0gMSk7XG4gIH1cblxuICB0aGlzLm5lY3RhcnNfLnB1c2goe3Jvdzogcm93LCBjb2w6IGNvbH0pO1xufTtcblxuLy8gQVBJXG5cbkJlZS5wcm90b3R5cGUuZ2V0TmVjdGFyID0gZnVuY3Rpb24gKGlkKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgLy8gTWFrZSBzdXJlIHdlJ3JlIGF0IGEgZmxvd2VyLlxuICBpZiAoIXRoaXMuaXNGbG93ZXIocm93LCBjb2wpKSB7XG4gICAgdGhpcy5tYXplXy5leGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9GTE9XRVIpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBOZWN0YXIgaXMgcG9zaXRpdmUuICBNYWtlIHN1cmUgd2UgaGF2ZSBpdC5cbiAgaWYgKHRoaXMuZmxvd2VyUmVtYWluaW5nQ2FwYWNpdHkocm93LCBjb2wpID09PSAwKSB7XG4gICAgdGhpcy5tYXplXy5leGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLkZMT1dFUl9FTVBUWSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5tYXplXy5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCduZWN0YXInLCBpZCk7XG4gIHRoaXMuZ290TmVjdGFyQXQocm93LCBjb2wpO1xufTtcblxuLy8gTm90ZSB0aGF0IHRoaXMgZGVsaWJlcmF0ZWx5IGRvZXMgbm90IGNoZWNrIHdoZXRoZXIgYmVlIGhhcyBnYXRoZXJlZCBuZWN0YXIuXG5CZWUucHJvdG90eXBlLm1ha2VIb25leSA9IGZ1bmN0aW9uIChpZCkge1xuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIGlmICghdGhpcy5pc0hpdmUocm93LCBjb2wpKSB7XG4gICAgdGhpcy5tYXplXy5leGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9IT05FWUNPTUIpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5oaXZlUmVtYWluaW5nQ2FwYWNpdHkocm93LCBjb2wpID09PSAwKSB7XG4gICAgdGhpcy5tYXplXy5leGVjdXRpb25JbmZvLnRlcm1pbmF0ZVdpdGhWYWx1ZShUZXJtaW5hdGlvblZhbHVlLkhPTkVZQ09NQl9GVUxMKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ2hvbmV5JywgaWQpO1xuICB0aGlzLm1hZGVIb25leUF0KHJvdywgY29sKTtcbn07XG5cbkJlZS5wcm90b3R5cGUubmVjdGFyUmVtYWluaW5nID0gZnVuY3Rpb24gKHVzZXJDaGVjaykge1xuICB1c2VyQ2hlY2sgPSB1c2VyQ2hlY2sgfHwgZmFsc2U7XG5cbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICBpZiAodXNlckNoZWNrKSB7XG4gICAgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvck5lY3RhciA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gdGhpcy5mbG93ZXJSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCk7XG59O1xuXG5CZWUucHJvdG90eXBlLmhvbmV5QXZhaWxhYmxlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIHJldHVybiB0aGlzLmhpdmVSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCk7XG59O1xuXG4vLyBBTklNQVRJT05TXG5CZWUucHJvdG90eXBlLnBsYXlBdWRpb18gPSBmdW5jdGlvbiAoc291bmQpIHtcbiAgLy8gQ2hlY2sgZm9yIFN0dWRpb0FwcCwgd2hpY2ggd2lsbCBvZnRlbiBiZSB1bmRlZmluZWQgaW4gdW5pdCB0ZXN0c1xuICBpZiAodGhpcy5zdHVkaW9BcHBfKSB7XG4gICAgdGhpcy5zdHVkaW9BcHBfLnBsYXlBdWRpbyhzb3VuZCk7XG4gIH1cbn07XG5cbkJlZS5wcm90b3R5cGUuYW5pbWF0ZUdldE5lY3RhciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICBpZiAodGhpcy5nZXRWYWx1ZShyb3csIGNvbCkgPD0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNob3VsZG4ndCBiZSBhYmxlIHRvIGVuZCB1cCB3aXRoIGEgbmVjdGFyIGFuaW1hdGlvbiBpZiBcIiArXG4gICAgICBcInRoZXJlIHdhcyBubyBuZWN0YXIgdG8gYmUgaGFkXCIpO1xuICB9XG5cbiAgdGhpcy5wbGF5QXVkaW9fKCduZWN0YXInKTtcbiAgdGhpcy5nb3ROZWN0YXJBdChyb3csIGNvbCk7XG5cbiAgdGhpcy5tYXplXy5ncmlkSXRlbURyYXdlci51cGRhdGVJdGVtSW1hZ2Uocm93LCBjb2wsIHRydWUpO1xuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZU5lY3RhckNvdW50ZXIodGhpcy5uZWN0YXJzXyk7XG59O1xuXG5CZWUucHJvdG90eXBlLmFuaW1hdGVNYWtlSG9uZXkgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgaWYgKCF0aGlzLmlzSGl2ZShyb3csIGNvbCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTaG91bGRuJ3QgYmUgYWJsZSB0byBlbmQgdXAgd2l0aCBhIGhvbmV5IGFuaW1hdGlvbiBpZiBcIiArXG4gICAgICBcIndlIGFyZW50IGF0IGEgaGl2ZSBvciBkb250IGhhdmUgbmVjdGFyXCIpO1xuICB9XG5cbiAgdGhpcy5wbGF5QXVkaW9fKCdob25leScpO1xuICB0aGlzLm1hZGVIb25leUF0KHJvdywgY29sKTtcblxuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgdHJ1ZSk7XG5cbiAgdGhpcy5tYXplXy5ncmlkSXRlbURyYXdlci51cGRhdGVIb25leUNvdW50ZXIodGhpcy5ob25leV8pO1xufTtcbiIsIi8vIGxvY2FsZSBmb3IgbWF6ZVxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5tYXplX2xvY2FsZTtcbiIsIi8qKlxuICogQG92ZXJ2aWV3IEJlZUNlbGwgcmVwcmVzZW50cyB0aGUgY29udGV0cyBvZiB0aGUgZ3JpZCBlbGVtZW50cyBmb3IgQmVlLlxuICogQmVlIEJlZUNlbGxzIGFyZSBtb3JlIGNvbXBsZXggdGhhbiBtYW55IG90aGVyIGtpbmRzIG9mIGNlbGw7IHRoZXkgY2FuIGJlXG4gKiBcImhpZGRlblwiIHdpdGggY2xvdWRzLCB0aGV5IGNhbiByZXByZXNlbnQgbXVsdGlwbGUgZGlmZmVyZW50IGtpbmRzIG9mXG4gKiBlbGVtZW50IChmbG93ZXIsIGhpdmUpLCBzb21lIG9mIHdoaWNoIGNhbiBiZSBtdWx0aXBsZSBjb2xvcnMgKHJlZCxcbiAqIHB1cnBsZSksIGFuZCB3aGljaCBjYW4gaGF2ZSBhIHJhbmdlIG9mIHBvc3NpYmxlIHZhbHVlcy5cbiAqXG4gKiBTb21lIGNlbGxzIGNhbiBhbHNvIGJlIFwidmFyaWFibGVcIiwgbWVhbmluZyB0aGF0IHRoZWlyIGNvbnRlbnRzIGFyZVxuICogbm90IHN0YXRpYyBidXQgY2FuIGluIGZhY3QgYmUgcmFuZG9taXplZCBiZXR3ZWVuIHJ1bnMuXG4gKi9cblxudmFyIENlbGwgPSByZXF1aXJlKCcuL2NlbGwnKTtcblxudmFyIHRpbGVzID0gcmVxdWlyZSgnLi90aWxlcycpO1xudmFyIFNxdWFyZVR5cGUgPSB0aWxlcy5TcXVhcmVUeXBlO1xuXG52YXIgQmVlQ2VsbCA9IGZ1bmN0aW9uICh0aWxlVHlwZSwgZmVhdHVyZVR5cGUsIHZhbHVlLCBjbG91ZFR5cGUsIGZsb3dlckNvbG9yLCByYW5nZSkge1xuXG4gIC8vIEJlZUNlbGxzIHJlcXVpcmUgZmVhdHVyZXMgdG8gaGF2ZSB2YWx1ZXNcbiAgaWYgKGZlYXR1cmVUeXBlID09PSBCZWVDZWxsLkZlYXR1cmVUeXBlLk5PTkUpIHtcbiAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICByYW5nZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIENlbGwuY2FsbCh0aGlzLCB0aWxlVHlwZSwgdmFsdWUpO1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhpcy5mZWF0dXJlVHlwZV8gPSBmZWF0dXJlVHlwZTtcblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMuZmxvd2VyQ29sb3JfID0gZmxvd2VyQ29sb3I7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aGlzLmNsb3VkVHlwZV8gPSBjbG91ZFR5cGU7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aGlzLnJhbmdlXyA9IChyYW5nZSAmJiByYW5nZSA+IHZhbHVlKSA/IHJhbmdlIDogdmFsdWU7XG59O1xuXG5CZWVDZWxsLmluaGVyaXRzKENlbGwpO1xubW9kdWxlLmV4cG9ydHMgPSBCZWVDZWxsO1xuXG52YXIgRmVhdHVyZVR5cGUgPSBCZWVDZWxsLkZlYXR1cmVUeXBlID0ge1xuICBOT05FOiB1bmRlZmluZWQsXG4gIEhJVkU6IDAsXG4gIEZMT1dFUjogMSxcbiAgVkFSSUFCTEU6IDJcbn07XG5cbnZhciBDbG91ZFR5cGUgPSBCZWVDZWxsLkNsb3VkVHlwZSA9IHtcbiAgTk9ORTogdW5kZWZpbmVkLFxuICBTVEFUSUM6IDAsXG4gIEhJVkVfT1JfRkxPV0VSOiAxLFxuICBGTE9XRVJfT1JfTk9USElORzogMixcbiAgSElWRV9PUl9OT1RISU5HOiAzLFxuICBBTlk6IDRcbn07XG5cbnZhciBGbG93ZXJDb2xvciA9IEJlZUNlbGwuRmxvd2VyQ29sb3IgPSB7XG4gIERFRkFVTFQ6IHVuZGVmaW5lZCxcbiAgUkVEOiAwLFxuICBQVVJQTEU6IDFcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBCZWVDZWxsIHRoYXQncyBhbiBleGFjdCByZXBsaWNhIG9mIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtCZWVDZWxsfVxuICogQG92ZXJyaWRlXG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbmV3QmVlQ2VsbCA9IG5ldyBCZWVDZWxsKFxuICAgIHRoaXMudGlsZVR5cGVfLFxuICAgIHRoaXMuZmVhdHVyZVR5cGVfLFxuICAgIHRoaXMub3JpZ2luYWxWYWx1ZV8sXG4gICAgdGhpcy5jbG91ZFR5cGVfLFxuICAgIHRoaXMuZmxvd2VyQ29sb3JfLFxuICAgIHRoaXMucmFuZ2VfXG4gICk7XG4gIG5ld0JlZUNlbGwuc2V0Q3VycmVudFZhbHVlKHRoaXMuY3VycmVudFZhbHVlXyk7XG4gIHJldHVybiBuZXdCZWVDZWxsO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5pc0Zsb3dlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZmVhdHVyZVR5cGVfID09PSBGZWF0dXJlVHlwZS5GTE9XRVI7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzSGl2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZmVhdHVyZVR5cGVfID09PSBGZWF0dXJlVHlwZS5ISVZFO1xufTtcblxuLyoqXG4gKiBGbG93ZXJzIGNhbiBiZSByZWQsIHB1cnBsZSwgb3IgdW5kZWZpbmVkLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNSZWRGbG93ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmlzRmxvd2VyKCkgJiYgdGhpcy5mbG93ZXJDb2xvcl8gPT09IEZsb3dlckNvbG9yLlJFRDtcbn07XG5cbi8qKlxuICogRmxvd2VycyBjYW4gYmUgcmVkLCBwdXJwbGUsIG9yIHVuZGVmaW5lZC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzUHVycGxlRmxvd2VyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5pc0Zsb3dlcigpICYmIHRoaXMuZmxvd2VyQ29sb3JfID09PSBGbG93ZXJDb2xvci5QVVJQTEU7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzU3RhdGljQ2xvdWQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmNsb3VkVHlwZV8gPT09IENsb3VkVHlwZS5TVEFUSUM7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzVmFyaWFibGVDbG91ZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuY2xvdWRUeXBlXyA9PT0gQ2xvdWRUeXBlLk5PTkUgfHwgdGhpcy5jbG91ZFR5cGVfID09PSBDbG91ZFR5cGUuU1RBVElDKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5pc1ZhcmlhYmxlUmFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnJhbmdlXyAmJiB0aGlzLnJhbmdlXyA+IHRoaXMub3JpZ2luYWxWYWx1ZV87XG59O1xuXG4vKipcbiAqIFZhcmlhYmxlIGNlbGxzIGNhbiByZXByZXNlbnQgbXVsdGlwbGUgcG9zc2libGUga2luZHMgb2YgZ3JpZCBhc3NldHMsXG4gKiB3aGVyZWFzIG5vbi12YXJpYWJsZSBjZWxscyBjYW4gcmVwcmVzZW50IG9ubHkgYSBzaW5nbGUga2luZC4gVGhpc1xuICogbWV0aG9kIHJldHVybnMgYW4gYXJyYXkgb2Ygbm9uLXZhcmlhYmxlIEJlZUNlbGxzIGJhc2VkIG9uIHRoaXMgQmVlQ2VsbCdzXG4gKiBjb25maWd1cmF0aW9uLlxuICogQHJldHVybiB7QmVlQ2VsbFtdfVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5nZXRQb3NzaWJsZUdyaWRBc3NldHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwb3NzaWJpbGl0aWVzID0gW107XG4gIGlmICh0aGlzLmlzVmFyaWFibGVDbG91ZCgpKSB7XG4gICAgdmFyIGZsb3dlciA9IG5ldyBCZWVDZWxsKHRoaXMudGlsZVR5cGVfLCBGZWF0dXJlVHlwZS5GTE9XRVIsIHRoaXMub3JpZ2luYWxWYWx1ZV8sIENsb3VkVHlwZS5TVEFUSUMsIHRoaXMuZmxvd2VyQ29sb3JfKTtcbiAgICB2YXIgaGl2ZSA9IG5ldyBCZWVDZWxsKHRoaXMudGlsZVR5cGVfLCBGZWF0dXJlVHlwZS5ISVZFLCB0aGlzLm9yaWdpbmFsVmFsdWVfLCBDbG91ZFR5cGUuU1RBVElDKTtcbiAgICB2YXIgbm90aGluZyA9IG5ldyBCZWVDZWxsKHRoaXMudGlsZVR5cGVfLCBGZWF0dXJlVHlwZS5OT05FLCB1bmRlZmluZWQsIENsb3VkVHlwZS5TVEFUSUMpO1xuICAgIHN3aXRjaCAodGhpcy5jbG91ZFR5cGVfKSB7XG4gICAgICBjYXNlIENsb3VkVHlwZS5ISVZFX09SX0ZMT1dFUjpcbiAgICAgICAgcG9zc2liaWxpdGllcyA9IFtmbG93ZXIsIGhpdmVdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2xvdWRUeXBlLkZMT1dFUl9PUl9OT1RISU5HOlxuICAgICAgICBwb3NzaWJpbGl0aWVzID0gW2Zsb3dlciwgbm90aGluZ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDbG91ZFR5cGUuSElWRV9PUl9OT1RISU5HOlxuICAgICAgICBwb3NzaWJpbGl0aWVzID0gW2hpdmUsIG5vdGhpbmddO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2xvdWRUeXBlLkFOWTpcbiAgICAgICAgcG9zc2liaWxpdGllcyA9IFtmbG93ZXIsIGhpdmUsIG5vdGhpbmddO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5pc1ZhcmlhYmxlUmFuZ2UoKSkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLm9yaWdpbmFsVmFsdWVfOyBpIDw9IHRoaXMucmFuZ2VfOyBpKyspIHtcbiAgICAgIHBvc3NpYmlsaXRpZXMucHVzaChuZXcgQmVlQ2VsbCh0aGlzLnRpbGVUeXBlXywgRmVhdHVyZVR5cGUuRkxPV0VSLCBpLCBDbG91ZFR5cGUuTk9ORSwgRmxvd2VyQ29sb3IuUFVSUExFKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBvc3NpYmlsaXRpZXMucHVzaCh0aGlzKTtcbiAgfVxuXG4gIHJldHVybiBwb3NzaWJpbGl0aWVzO1xufTtcblxuLyoqXG4gKiBTZXJpYWxpemVzIHRoaXMgQmVlQ2VsbCBpbnRvIEpTT05cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBvdmVycmlkZVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdGlsZVR5cGU6IHRoaXMudGlsZVR5cGVfLFxuICAgIGZlYXR1cmVUeXBlOiB0aGlzLmZlYXR1cmVUeXBlXyxcbiAgICB2YWx1ZTogdGhpcy5vcmlnaW5hbFZhbHVlXyxcbiAgICBjbG91ZFR5cGU6IHRoaXMuY2xvdWRUeXBlXyxcbiAgICBmbG93ZXJDb2xvcjogdGhpcy5mbG93ZXJDb2xvcl8sXG4gICAgcmFuZ2U6IHRoaXMucmFuZ2VfLFxuICB9O1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IEJlZUNlbGwgZnJvbSBzZXJpYWxpemVkIEpTT05cbiAqIEBwYXJhbSB7T2JqZWN0fVxuICogQHJldHVybiB7QmVlQ2VsbH1cbiAqIEBvdmVycmlkZVxuICovXG5CZWVDZWxsLmRlc2VyaWFsaXplID0gZnVuY3Rpb24gKHNlcmlhbGl6ZWQpIHtcbiAgcmV0dXJuIG5ldyBCZWVDZWxsKFxuICAgIHNlcmlhbGl6ZWQudGlsZVR5cGUsXG4gICAgc2VyaWFsaXplZC5mZWF0dXJlVHlwZSxcbiAgICBzZXJpYWxpemVkLnZhbHVlLFxuICAgIHNlcmlhbGl6ZWQuY2xvdWRUeXBlLFxuICAgIHNlcmlhbGl6ZWQuZmxvd2VyQ29sb3IsXG4gICAgc2VyaWFsaXplZC5yYW5nZVxuICApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IG1hcENlbGxcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gaW5pdGlhbERpcnRDZWxsXG4gKiBAcmV0dXJuIHtCZWVDZWxsfVxuICogQG92ZXJyaWRlXG4gKiBAc2VlIENlbGwucGFyc2VGcm9tT2xkVmFsdWVzXG4gKi9cbkJlZUNlbGwucGFyc2VGcm9tT2xkVmFsdWVzID0gZnVuY3Rpb24gKG1hcENlbGwsIGluaXRpYWxEaXJ0Q2VsbCkge1xuICBtYXBDZWxsID0gbWFwQ2VsbC50b1N0cmluZygpO1xuICBpbml0aWFsRGlydENlbGwgPSBwYXJzZUludChpbml0aWFsRGlydENlbGwpO1xuICB2YXIgdGlsZVR5cGUsIGZlYXR1cmVUeXBlLCB2YWx1ZSwgY2xvdWRUeXBlLCBmbG93ZXJDb2xvcjtcblxuICBpZiAoIWlzTmFOKGluaXRpYWxEaXJ0Q2VsbCkgJiYgbWFwQ2VsbC5tYXRjaCgvWzF8UnxQfEZDXS8pICYmIGluaXRpYWxEaXJ0Q2VsbCAhPT0gMCkge1xuICAgIHRpbGVUeXBlID0gU3F1YXJlVHlwZS5PUEVOO1xuICAgIGZlYXR1cmVUeXBlID0gaW5pdGlhbERpcnRDZWxsID4gMCA/IEZlYXR1cmVUeXBlLkZMT1dFUiA6IEZlYXR1cmVUeXBlLkhJVkU7XG4gICAgdmFsdWUgPSBNYXRoLmFicyhpbml0aWFsRGlydENlbGwpO1xuICAgIGNsb3VkVHlwZSA9IChtYXBDZWxsID09PSAnRkMnKSA/IENsb3VkVHlwZS5TVEFUSUMgOiBDbG91ZFR5cGUuTk9ORTtcbiAgICBmbG93ZXJDb2xvciA9IChtYXBDZWxsID09PSAnUicpID8gRmxvd2VyQ29sb3IuUkVEIDogKG1hcENlbGwgPT09ICdQJykgPyBGbG93ZXJDb2xvci5QVVJQTEUgOiBGbG93ZXJDb2xvci5ERUZBVUxUO1xuICB9IGVsc2Uge1xuICAgIHRpbGVUeXBlID0gcGFyc2VJbnQobWFwQ2VsbCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCZWVDZWxsKHRpbGVUeXBlLCBmZWF0dXJlVHlwZSwgdmFsdWUsIGNsb3VkVHlwZSwgZmxvd2VyQ29sb3IpO1xufTtcbiIsInZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcblxudmFyIENlbGwgPSBmdW5jdGlvbiAodGlsZVR5cGUsIHZhbHVlKSB7XG4gIFxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMudGlsZVR5cGVfID0gdGlsZVR5cGU7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aGlzLm9yaWdpbmFsVmFsdWVfID0gdmFsdWU7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aGlzLmN1cnJlbnRWYWx1ZV8gPSB1bmRlZmluZWQ7XG4gIHRoaXMucmVzZXRDdXJyZW50VmFsdWUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IENlbGwgdGhhdCdzIGFuIGV4YWN0IHJlcGxpY2Egb2YgdGhpcyBvbmVcbiAqIEByZXR1cm4ge0NlbGx9XG4gKi9cbkNlbGwucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbmV3Q2VsbCA9IG5ldyBDZWxsKHRoaXMudGlsZVR5cGVfLCB0aGlzLm9yaWdpbmFsVmFsdWVfKTtcbiAgbmV3Q2VsbC5zZXRDdXJyZW50VmFsdWUodGhpcy5jdXJyZW50VmFsdWVfKTtcbiAgcmV0dXJuIG5ld0NlbGw7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuQ2VsbC5wcm90b3R5cGUuZ2V0VGlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMudGlsZVR5cGVfO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5DZWxsLnByb3RvdHlwZS5pc0RpcnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm9yaWdpbmFsVmFsdWVfICE9PSB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuQ2VsbC5wcm90b3R5cGUuZ2V0Q3VycmVudFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50VmFsdWVfO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge051bWJlcn1cbiAqL1xuQ2VsbC5wcm90b3R5cGUuc2V0Q3VycmVudFZhbHVlID0gZnVuY3Rpb24gKHZhbCkge1xuICB0aGlzLmN1cnJlbnRWYWx1ZV8gPSB2YWw7XG59O1xuXG5DZWxsLnByb3RvdHlwZS5yZXNldEN1cnJlbnRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jdXJyZW50VmFsdWVfID0gdGhpcy5vcmlnaW5hbFZhbHVlXztcbn07XG5cbi8qKlxuICogU2VyaWFsaXplcyB0aGlzIENlbGwgaW50byBKU09OXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkNlbGwucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0aWxlVHlwZTogdGhpcy50aWxlVHlwZV8sXG4gICAgdmFsdWU6IHRoaXMub3JpZ2luYWxWYWx1ZV8sXG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgQ2VsbCBmcm9tIHNlcmlhbGl6ZWQgSlNPTlxuICogQHBhcmFtIHtPYmplY3R9XG4gKiBAcmV0dXJuIHtDZWxsfVxuICovXG5DZWxsLmRlc2VyaWFsaXplID0gZnVuY3Rpb24gKHNlcmlhbGl6ZWQpIHtcbiAgcmV0dXJuIG5ldyBDZWxsKFxuICAgIHNlcmlhbGl6ZWQudGlsZVR5cGUsXG4gICAgc2VyaWFsaXplZC52YWx1ZVxuICApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IENlbGwgZnJvbSBhIG1hcENlbGwgYW5kIGFuIGluaXRpYWxEaXJ0Q2VsbC4gVGhpc1xuICogcmVwcmVzZW50cyB0aGUgb2xkIHN0eWxlIG9mIHN0b3JpbmcgbWFwIGRhdGEsIGFuZCBzaG91bGQgbm90IGJlIHVzZWRcbiAqIGZvciBhbnkgbmV3IGxldmVscy4gTm90ZSB0aGF0IHRoaXMgc3R5bGUgZG9lcyBub3Qgc3VwcG9ydCBuZXdcbiAqIGZlYXR1cmVzIHN1Y2ggYXMgZHluYW1pYyByYW5nZXMgb3IgbmV3IGNsb3VkIHR5cGVzLiBPbmx5IHVzZWQgZm9yXG4gKiBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gbWFwQ2VsbFxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBpbml0aWFsRGlydENlbGxcbiAqIEByZXR1cm4ge0NlbGx9XG4gKiBAb3ZlcnJpZGVcbiAqL1xuQ2VsbC5wYXJzZUZyb21PbGRWYWx1ZXMgPSBmdW5jdGlvbiAobWFwQ2VsbCwgaW5pdGlhbERpcnRDZWxsKSB7XG4gIG1hcENlbGwgPSBwYXJzZUludChtYXBDZWxsKTtcbiAgaW5pdGlhbERpcnRDZWxsID0gcGFyc2VJbnQoaW5pdGlhbERpcnRDZWxsKTtcblxuICB2YXIgdGlsZVR5cGUsIHZhbHVlO1xuXG4gIHRpbGVUeXBlID0gcGFyc2VJbnQobWFwQ2VsbCk7XG4gIGlmICghaXNOYU4oaW5pdGlhbERpcnRDZWxsKSAmJiBpbml0aWFsRGlydENlbGwgIT09IDApIHtcbiAgICB2YWx1ZSA9IGluaXRpYWxEaXJ0Q2VsbDtcbiAgfVxuXG4gIHJldHVybiBuZXcgQ2VsbCh0aWxlVHlwZSwgdmFsdWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIFRpbGVzID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8qKlxuICogQ29uc3RhbnRzIGZvciBjYXJkaW5hbCBkaXJlY3Rpb25zLiAgU3Vic2VxdWVudCBjb2RlIGFzc3VtZXMgdGhlc2UgYXJlXG4gKiBpbiB0aGUgcmFuZ2UgMC4uMyBhbmQgdGhhdCBvcHBvc2l0ZXMgaGF2ZSBhbiBhYnNvbHV0ZSBkaWZmZXJlbmNlIG9mIDIuXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5UaWxlcy5EaXJlY3Rpb24gPSB7XG4gIE5PUlRIOiAwLFxuICBFQVNUOiAxLFxuICBTT1VUSDogMixcbiAgV0VTVDogM1xufTtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2Ygc3F1YXJlcyBpbiB0aGUgTWF6ZSwgd2hpY2ggaXMgcmVwcmVzZW50ZWRcbiAqIGFzIGEgMkQgYXJyYXkgb2YgU3F1YXJlVHlwZSB2YWx1ZXMuXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5UaWxlcy5TcXVhcmVUeXBlID0ge1xuICBXQUxMOiAwLFxuICBPUEVOOiAxLFxuICBTVEFSVDogMixcbiAgRklOSVNIOiAzLFxuICBPQlNUQUNMRTogNCxcbiAgU1RBUlRBTkRGSU5JU0g6IDVcbn07XG5cblRpbGVzLlR1cm5EaXJlY3Rpb24gPSB7IExFRlQ6IC0xLCBSSUdIVDogMX07XG5UaWxlcy5Nb3ZlRGlyZWN0aW9uID0geyBGT1JXQVJEOiAwLCBSSUdIVDogMSwgQkFDS1dBUkQ6IDIsIExFRlQ6IDN9O1xuXG5UaWxlcy5kaXJlY3Rpb25Ub0R4RHkgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICBjYXNlIFRpbGVzLkRpcmVjdGlvbi5OT1JUSDpcbiAgICAgIHJldHVybiB7ZHg6IDAsIGR5OiAtMX07XG4gICAgY2FzZSBUaWxlcy5EaXJlY3Rpb24uRUFTVDpcbiAgICAgIHJldHVybiB7ZHg6IDEsIGR5OiAwfTtcbiAgICBjYXNlIFRpbGVzLkRpcmVjdGlvbi5TT1VUSDpcbiAgICAgIHJldHVybiB7ZHg6IDAsIGR5OiAxfTtcbiAgICBjYXNlIFRpbGVzLkRpcmVjdGlvbi5XRVNUOlxuICAgICAgcmV0dXJuIHtkeDogLTEsIGR5OiAwfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGlyZWN0aW9uIHZhbHVlJyArIGRpcmVjdGlvbik7XG59O1xuXG5UaWxlcy5kaXJlY3Rpb25Ub0ZyYW1lID0gZnVuY3Rpb24oZGlyZWN0aW9uNCkge1xuICByZXR1cm4gdXRpbHMubW9kKGRpcmVjdGlvbjQgKiA0LCAxNik7XG59O1xuXG4vKipcbiAqIEtlZXAgdGhlIGRpcmVjdGlvbiB3aXRoaW4gMC0zLCB3cmFwcGluZyBhdCBib3RoIGVuZHMuXG4gKiBAcGFyYW0ge251bWJlcn0gZCBQb3RlbnRpYWxseSBvdXQtb2YtYm91bmRzIGRpcmVjdGlvbiB2YWx1ZS5cbiAqIEByZXR1cm4ge251bWJlcn0gTGVnYWwgZGlyZWN0aW9uIHZhbHVlLlxuICovXG5UaWxlcy5jb25zdHJhaW5EaXJlY3Rpb240ID0gZnVuY3Rpb24oZCkge1xuICByZXR1cm4gdXRpbHMubW9kKGQsIDQpO1xufTtcbiJdfQ==
