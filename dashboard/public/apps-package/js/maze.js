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

  ReactDOM.render(React.createElement(AppView, {
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
      if (this.shouldCheckPurple(row, col) && !this.userChecks_[row][col].checkedForNectar) {
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
 * Likewise, the only flowers we care about checking are flowers that
 * were defined as purple flowers without a variable range in the
 * original grid; variable range flowers will handle 'requiring' checks
 * through their quantum nature.
 */
Bee.prototype.shouldCheckPurple = function (row, col) {
  return this.isPurpleFlower(row, col) && !this.variableGrid[row][col].isVariableRange();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9tYXplL21haW4uanMiLCJidWlsZC9qcy9tYXplL3NraW5zLmpzIiwiYnVpbGQvanMvbWF6ZS9tYXplLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoLmpzIiwiYnVpbGQvanMvbWF6ZS92aXN1YWxpemF0aW9uLmh0bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zY3JhdC5qcyIsImJ1aWxkL2pzL21hemUvbWF6ZU1hcC5qcyIsImJ1aWxkL2pzL21hemUvbGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS93b3Jkc2VhcmNoTGV2ZWxzLmpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMvbWF6ZS54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9zdGFydEJsb2Nrcy54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS9yZXF1aXJlZEJsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUva2FyZWxMZXZlbHMuanMiLCJidWlsZC9qcy9tYXplL3Rvb2xib3hlcy9rYXJlbDMueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvdG9vbGJveGVzL2thcmVsMi54bWwuZWpzIiwiYnVpbGQvanMvbWF6ZS90b29sYm94ZXMva2FyZWwxLnhtbC5lanMiLCJidWlsZC9qcy9tYXplL2thcmVsU3RhcnRCbG9ja3MueG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXh0cmFDb250cm9sUm93cy5odG1sLmVqcyIsImJ1aWxkL2pzL21hemUvZXhlY3V0aW9uSW5mby5qcyIsImJ1aWxkL2pzL21hemUvZHJvcGxldENvbmZpZy5qcyIsImJ1aWxkL2pzL21hemUvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9tYXplL2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL21hemUvYmVlSXRlbURyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvZGlydERyYXdlci5qcyIsImJ1aWxkL2pzL21hemUvbWF6ZVV0aWxzLmpzIiwiYnVpbGQvanMvbWF6ZS9iZWVCbG9ja3MuanMiLCJidWlsZC9qcy9tYXplL2FwaS5qcyIsImJ1aWxkL2pzL21hemUvYmVlLmpzIiwiYnVpbGQvanMvbWF6ZS9sb2NhbGUuanMiLCJidWlsZC9qcy9tYXplL2JlZUNlbGwuanMiLCJidWlsZC9qcy9tYXplL2NlbGwuanMiLCJidWlsZC9qcy9tYXplL3RpbGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDWEEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTFCLElBQUksT0FBTyxHQUFHO0FBQ1osU0FBTyxFQUFFO0FBQ1Asd0NBQW9DLEVBQUUsSUFBSTtBQUMxQyxnQkFBWSxFQUFFLEVBQUU7QUFDaEIsZUFBVyxFQUFFLEVBQUU7QUFDZixlQUFXLEVBQUUsS0FBSztBQUNsQixRQUFJLEVBQUUsRUFBRTtBQUNSLHVCQUFtQixFQUFFLGlCQUFpQjtBQUN0Qyx1QkFBbUIsRUFBRSxpQkFBaUI7QUFDdEMsaUNBQTZCLEVBQUUsR0FBRzs7QUFFbEMsa0NBQThCLEVBQUUsQ0FBQztBQUNqQyxvQkFBZ0IsRUFBRSxJQUFJO0dBQ3ZCOztBQUVELEtBQUcsRUFBRTtBQUNILHFCQUFpQixFQUFFLEVBQUU7QUFDckIsZ0JBQVksRUFBRSxjQUFjO0FBQzVCLGFBQVMsRUFBRSxlQUFlO0FBQzFCLGdCQUFZLEVBQUUsa0JBQWtCO0FBQ2hDLFNBQUssRUFBRSxXQUFXO0FBQ2xCLFNBQUssRUFBRSxXQUFXO0FBQ2xCLGtCQUFjLEVB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LENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLFNBQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixTQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsU0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNoQixDQUFDOztBQUVGLFNBQVMsT0FBTyxHQUFJO0FBQ2xCLE1BQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDN0MsTUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7OztBQUdsQixNQUFJLE1BQU0sR0FBRyxRQUFRLENB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RUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzFDLFNBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDeEUsQ0FBQzs7QUFFRixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDM0MsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUNoRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7QUFDaEQsTUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckMsUUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdkM7Q0FDRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVk7QUFDcEMsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNuQyxXQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDN0IsYUFBTyxJQUFJLENBQUMsS0FBSyxFQUFF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LENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUN6QjtBQUNELGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDakM7QUFDRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FDekI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsS0FBSztBQUNqQyxT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Z0IsRUFBRSxDQUNoQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFDeEIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQ3RCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUNyQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FDdkI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekIsV0FBTyxFQUFFLENBQUM7QUFDVixXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN4QixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFDdEIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQ3JCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUN2QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekI7R0FDRjtBQUNELFFBQU0sRUFBRTtBQUNOLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN6QixXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUN0QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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b0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQ3hCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxFQUMzQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFDckIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQ3ZCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsU0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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LFVBQVUsQ0FBQyxDQUN2QjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFNBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDekI7R0FDRjtBQUNELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsQ0FBQztBQUNWLGNBQVUsRUFBRSxJQUFJO0FBQ2hCLG1CQUFlLEVBQUU7QUFDZixtQkFBYSxFQUFFLElBQUk7QUFDbkIsZ0JBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFXLEVBQUUsSUFBSTtLQUNsQjtBQUNELG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUN4QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FDdEI7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3pCO0dBQ0Y7QUFDRCxVQUFRLEVBQUU7QUFDUixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsb0JBQWdCLEVBQUUsRUFBRTtBQUNwQixvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxTQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFB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RSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FDdkI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFB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RSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FDN0M7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQ2xEO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQ2hDO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxF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Q0FBQyxFQUNOLENBQUMsc0JBQXNCLENBQUMsQ0FDekI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLElBQUksQ0FBQyxFQUNOLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQy9CO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxFQUM5QixDQUFDLFNBQVMsQ0FBQyxDQUNaO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxHQUFHO0tBQ2pCO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsUUFBTSxFQUFFO0FBQ04sYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3pCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsR0FBRyxDQUFDLEVBQ0wsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLEdBQUc7S0FDakI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNqQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLElBQUksQ0FBQyxFQUNOLENBQUMsbUJBQW1CLENBQUMsRUFDckIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNyQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLEdBQUc7S0FDakI7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7Ozs7QUFJRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsSUFBSTtBQUNiLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUN2RDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUM1QjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMxQjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQ25EO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQ2hDO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsTUFBTSxDQUFDLEVBQ1IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsU0FBUyxDQUFDLEVBQ1gsQ0FBQyxVQUFVLENBQUMsQ0FDYjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLEdBQUcsQ0FBQyxFQUNMLENBQUMsTUFBTSxDQUFDLEVBQ1IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDWCxDQUFDLFlBQVksQ0FBQyxDQUNmO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUNoRTtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxPQUFLLEVBQUU7QUFDTCxhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQ2pEO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsT0FBSyxFQUFFO0FBQ0wsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FDdEM7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELE9BQUssRUFBRTtBQUNMLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFDZCxDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUN4QjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsUUFBTSxFQUFFO0FBQ04sYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3pCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDakMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUNkLENBQUMsWUFBWSxDQUFDLEVBQ2QsQ0FBQyxVQUFVLENBQUMsRUFDWixDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxFQUM5QixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FDeEI7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDOUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDL0I7R0FDRjs7OztBQUlELGVBQWEsRUFBRTtBQUNiLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxDQUFDO0FBQ1Ysb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUN6RDtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzNCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFO0FBQ2IsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FDbkM7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLEtBQUs7QUFDakMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxnQkFBYyxFQUFFO0FBQ2QsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLEVBQUU7QUFDWCxvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQzNEO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLEtBQUs7QUFDakMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxlQUFhLEVBQUU7QUFDYixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FDM0Q7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsWUFBVSxFQUFFO0FBQ1YsYUFBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsV0FBTyxFQUFFLENBQUM7QUFDVixvQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFDekMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FDdkM7QUFDRCxXQUFPLEVBQUU7QUFDUCxpQkFBVyxFQUFFLENBQUM7S0FDZjtBQUNELFNBQUssRUFBRSxDQUNMLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7QUFDRCxvQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUNoQyxpQkFBYSxFQUFFLENBQ2IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELGlCQUFlLEVBQUU7QUFDZixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUN6QyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUN4RDtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMzQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDNUI7R0FDRjs7QUFFRCxvQkFBa0IsRUFBRTtBQUNsQixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsQ0FBQztBQUNWLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQzdDO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsaUJBQVcsRUFBRSxDQUFDO0tBQ2Y7QUFDRCxTQUFLLEVBQUUsQ0FDTCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0FBQ0Qsb0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDaEMsaUJBQWEsRUFBRSxDQUNiLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FDM0I7R0FDRjs7QUFFRCxvQkFBa0IsRUFBRTtBQUNsQixhQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxXQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFnQixFQUFFLENBQ2hCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFDcEQsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQ2xDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUNyQztBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDN0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsRUFDN0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtHQUNGOztBQUVELG9CQUFrQixFQUFFO0FBQ2xCLGFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixpQkFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsb0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDbkQsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUNoRSxDQUFDLGFBQWEsQ0FBQyxDQUNoQjtBQUNELFdBQU8sRUFBRTtBQUNQLGlCQUFXLEVBQUUsQ0FBQztLQUNmO0FBQ0QsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQzNCO0dBQ0Y7O0FBRUQsU0FBTyxFQUFFO0FBQ1AsYUFBUyxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUM7Ozs7Ozs7Ozs7O21EQVdXLENBQzlDO0FBQ0QsaUJBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxvQkFBZ0IsRUFBRSxFQUNqQjtBQUNELFdBQU8sRUFBRTtBQUNQLGtCQUFZLEVBQUUsR0FBRztLQUNsQjtBQUNELGFBQVMsRUFBRSxDQUFDOztBQUVaLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFLENBQ0wsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUMxQixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUMzQjtBQUNELG9CQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLGlCQUFhLEVBQUUsQ0FDYixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDNUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsRUFDM0IsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFLEVBQzVCLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxFQUM1QixDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FFN0I7R0FDRjtDQUNGLENBQUM7OztBQ2h1Q0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7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QixhQUFPLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxBQUN4QixTQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSztBQUN4QixhQUFPLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxBQUN4QixTQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUN2QixhQUFPLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLEdBQzFCO0FBQ0QsUUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxTQUFTLENBQUMsQ0FBQztDQUN4RCxDQUFDOztBQUVGLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxVQUFTLFVBQVUsRUFBRTtBQUM1QyxTQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUN0QyxDQUFDOzs7Ozs7O0FBT0YsS0FBSyxDQUFDLG1CQUFtQixHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQ3RDLFNBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDeEIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93Lk1hemUgPSByZXF1aXJlKCcuL21hemUnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuTWF6ZSA9IHdpbmRvdy5NYXplO1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93Lm1hemVNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcblxuICBhcHBNYWluKHdpbmRvdy5NYXplLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMjFoZW1VdmJXRnBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN1FVRkJRU3hKUVVGSkxFOUJRVThzUjBGQlJ5eFBRVUZQTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1FVRkRjRU1zVFVGQlRTeERRVUZETEVsQlFVa3NSMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03UVVGRGFFTXNTVUZCU1N4UFFVRlBMRTFCUVUwc1MwRkJTeXhYUVVGWExFVkJRVVU3UVVGRGFrTXNVVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETzBOQlF6TkNPMEZCUTBRc1NVRkJTU3hOUVVGTkxFZEJRVWNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMEZCUTJwRExFbEJRVWtzVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRCUVVOcVF5eEpRVUZKTEV0QlFVc3NSMEZCUnl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03TzBGQlJTOUNMRTFCUVUwc1EwRkJReXhSUVVGUkxFZEJRVWNzVlVGQlV5eFBRVUZQTEVWQlFVVTdRVUZEYkVNc1UwRkJUeXhEUVVGRExGZEJRVmNzUjBGQlJ5eExRVUZMTEVOQlFVTTdRVUZETlVJc1UwRkJUeXhEUVVGRExGbEJRVmtzUjBGQlJ5eE5RVUZOTEVOQlFVTTdPMEZCUlRsQ0xGTkJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dERRVU4yUXl4RFFVRkRJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKMllYSWdZWEJ3VFdGcGJpQTlJSEpsY1hWcGNtVW9KeTR1TDJGd2NFMWhhVzRuS1R0Y2JuZHBibVJ2ZHk1TllYcGxJRDBnY21WeGRXbHlaU2duTGk5dFlYcGxKeWs3WEc1cFppQW9kSGx3Wlc5bUlHZHNiMkpoYkNBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdaMnh2WW1Gc0xrMWhlbVVnUFNCM2FXNWtiM2N1VFdGNlpUdGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NXRZWHBsVFdGcGJpQTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTXBJSHRjYmlBZ2IzQjBhVzl1Y3k1emEybHVjMDF2WkhWc1pTQTlJSE5yYVc1ek8xeHVJQ0J2Y0hScGIyNXpMbUpzYjJOcmMwMXZaSFZzWlNBOUlHSnNiMk5yY3p0Y2JseHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NU5ZWHBsTENCc1pYWmxiSE1zSUc5d2RHbHZibk1wTzF4dWZUdGNiaUpkZlE9PSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBNYXplLlxuICovXG4vLyB0aWxlczogQSAyNTB4MjAwIHNldCBvZiAyMCBtYXAgaW1hZ2VzLlxuLy8gZ29hbDogQSAyMHgzNCBnb2FsIGltYWdlLlxuLy8gYmFja2dyb3VuZDogTnVtYmVyIG9mIDQwMHg0MDAgYmFja2dyb3VuZCBpbWFnZXMuIFJhbmRvbWx5IHNlbGVjdCBvbmUgaWZcbi8vIHNwZWNpZmllZCwgb3RoZXJ3aXNlLCB1c2UgYmFja2dyb3VuZC5wbmcuXG4vLyBsb29rOiBDb2xvdXIgb2Ygc29uYXItbGlrZSBsb29rIGljb24uXG5cbnZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG5cbnZhciBDT05GSUdTID0ge1xuICBsZXR0ZXJzOiB7XG4gICAgbm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlOiB0cnVlLFxuICAgIHBlZ21hbkhlaWdodDogNTAsXG4gICAgcGVnbWFuV2lkdGg6IDUwLFxuICAgIGRhbmNlT25Mb2FkOiBmYWxzZSxcbiAgICBnb2FsOiAnJyxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXIuZ2lmJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuICAgIGhpZGVJbnN0cnVjdGlvbnM6IHRydWVcbiAgfSxcblxuICBiZWU6IHtcbiAgICBvYnN0YWNsZUFuaW1hdGlvbjogJycsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGUucG5nJyxcbiAgICByZWRGbG93ZXI6ICdyZWRGbG93ZXIucG5nJyxcbiAgICBwdXJwbGVGbG93ZXI6ICdwdXJwbGVGbG93ZXIucG5nJyxcbiAgICBob25leTogJ2hvbmV5LnBuZycsXG4gICAgY2xvdWQ6ICdjbG91ZC5wbmcnLFxuICAgIGNsb3VkQW5pbWF0aW9uOiAnY2xvdWRfaGlkZS5naWYnLFxuICAgIGJlZVNvdW5kOiB0cnVlLFxuICAgIG5lY3RhclNvdW5kOiAnZ2V0TmVjdGFyLm1wMycsXG4gICAgaG9uZXlTb3VuZDogJ21ha2VIb25leS5tcDMnLFxuXG4gICAgbG9vazogJyMwMDAnLFxuICAgIG5vbkRpc2FwcGVhcmluZ1BlZ21hbkhpdHRpbmdPYnN0YWNsZTogdHJ1ZSxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXIuZ2lmJyxcbiAgICB3YWxsUGVnbWFuQW5pbWF0aW9uOiAnd2FsbF9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGwuZ2lmJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuICAgIGFjdGlvblNwZWVkU2NhbGU6IHtcbiAgICAgIG5lY3RhcjogMSxcbiAgICB9LFxuICAgIHBlZ21hbllPZmZzZXQ6IDAsXG4gICAgdGlsZVNoZWV0V2lkdGg6IDUsXG4gICAgcGVnbWFuSGVpZ2h0OiA1MCxcbiAgICBwZWdtYW5XaWR0aDogNTBcbiAgfSxcblxuICBmYXJtZXI6IHtcbiAgICBvYnN0YWNsZUlkbGU6ICdvYnN0YWNsZS5wbmcnLFxuXG4gICAgZGlydDogJ2RpcnQucG5nJyxcbiAgICBmaWxsU291bmQ6ICdmaWxsLm1wMycsXG4gICAgZGlnU291bmQ6ICdkaWcubXAzJyxcblxuICAgIGxvb2s6ICcjMDAwJyxcbiAgICB0cmFuc3BhcmVudFRpbGVFbmRpbmc6IHRydWUsXG4gICAgbm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlOiB0cnVlLFxuICAgIGJhY2tncm91bmQ6ICdiYWNrZ3JvdW5kJyArIF8uc2FtcGxlKFswLCAxLCAyLCAzXSkgKyAnLnBuZycsXG4gICAgZGlydFNvdW5kOiB0cnVlLFxuICAgIHBlZ21hbllPZmZzZXQ6IC04LFxuICAgIGRhbmNlT25Mb2FkOiB0cnVlXG4gIH0sXG5cbiAgcHZ6OiB7XG4gICAgZ29hbElkbGU6ICdnb2FsSWRsZS5naWYnLFxuICAgIG9ic3RhY2xlSWRsZTogJ29ic3RhY2xlSWRsZS5naWYnLFxuXG4gICAgZ29hbEFuaW1hdGlvbjogJ2dvYWwuZ2lmJyxcbiAgICBtYXplX2ZvcmV2ZXI6ICdtYXplX2ZvcmV2ZXIucG5nJyxcblxuICAgIG9ic3RhY2xlU2NhbGU6IDEuNCxcbiAgICBwZWdtYW5ZT2Zmc2V0OiAtOCxcbiAgICBkYW5jZU9uTG9hZDogdHJ1ZVxuICB9LFxuXG4gIGJpcmRzOiB7XG4gICAgZ29hbElkbGU6ICdnb2FsSWRsZS5naWYnLFxuICAgIG9ic3RhY2xlSWRsZTogJ29ic3RhY2xlLnBuZycsXG5cbiAgICBnb2FsQW5pbWF0aW9uOiAnZ29hbC5naWYnLFxuICAgIG1hemVfZm9yZXZlcjogJ21hemVfZm9yZXZlci5wbmcnLFxuICAgIGxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXM6ICd0aWxlcy1icm9rZW4ucG5nJyxcblxuICAgIG9ic3RhY2xlU2NhbGU6IDEuMixcbiAgICBhZGRpdGlvbmFsU291bmQ6IHRydWUsXG4gICAgaWRsZVBlZ21hbkFuaW1hdGlvbjogJ2lkbGVfYXZhdGFyLmdpZicsXG4gICAgd2FsbFBlZ21hbkFuaW1hdGlvbjogJ3dhbGxfYXZhdGFyLnBuZycsXG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbjogJ21vdmVfYXZhdGFyLnBuZycsXG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvblNwZWVkU2NhbGU6IDEuNSxcbiAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIHdoZW4gbW92ZSBwZWdtYW4gYW5pbWF0aW9uIGlzIHNldFxuICAgIG1vdmVQZWdtYW5BbmltYXRpb25GcmFtZU51bWJlcjogOSxcbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGwuZ2lmJyxcbiAgICBhcHByb2FjaGluZ0dvYWxBbmltYXRpb246ICdjbG9zZV9nb2FsLnBuZycsXG4gICAgcGVnbWFuSGVpZ2h0OiA2OCxcbiAgICBwZWdtYW5XaWR0aDogNTEsXG4gICAgcGVnbWFuWU9mZnNldDogLTE0LFxuICAgIHR1cm5BZnRlclZpY3Rvcnk6IHRydWVcbiAgfSxcblxuIHNjcmF0OiB7XG4gICAgZ29hbElkbGU6ICdnb2FsLnBuZycsXG4gICAgb2JzdGFjbGVJZGxlOiAnb2JzdGFjbGUucG5nJyxcblxuICAgIGdvYWxBbmltYXRpb246ICdnb2FsLnBuZycsXG4gICAgbWF6ZV9mb3JldmVyOiAnbWF6ZV9mb3JldmVyLnBuZycsXG4gICAgbGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlczogJ3RpbGVzLWJyb2tlbi5wbmcnLFxuXG4gICAgb2JzdGFjbGVTY2FsZTogMS4yLFxuICAgIGFkZGl0aW9uYWxTb3VuZDogdHJ1ZSxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uOiAnaWRsZV9hdmF0YXJfc2hlZXQucG5nJyxcbiAgICBpZGxlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIGlkbGVQZWdtYW5Db2w6IDQsXG4gICAgaWRsZVBlZ21hblJvdzogMTEsXG5cbiAgICBoaXR0aW5nV2FsbEFuaW1hdGlvbjogJ3dhbGxfYXZhdGFyX3NoZWV0LnBuZycsXG4gICAgaGl0dGluZ1dhbGxBbmltYXRpb25GcmFtZU51bWJlcjogMjAsXG4gICAgaGl0dGluZ1dhbGxBbmltYXRpb25TcGVlZFNjYWxlOiAxLjUsXG4gICAgaGl0dGluZ1dhbGxQZWdtYW5Db2w6IDEsXG4gICAgaGl0dGluZ1dhbGxQZWdtYW5Sb3c6IDIwLFxuXG4gICAgY2VsZWJyYXRlQW5pbWF0aW9uOiAnanVtcF9hY29ybl9zaGVldC5wbmcnLFxuICAgIGNlbGVicmF0ZVBlZ21hbkNvbDogMSxcbiAgICBjZWxlYnJhdGVQZWdtYW5Sb3c6IDksXG5cbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uOiAnbW92ZV9hdmF0YXIucG5nJyxcbiAgICBtb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZTogMS41LFxuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgd2hlbiBtb3ZlIHBlZ21hbiBhbmltYXRpb24gaXMgc2V0XG4gICAgbW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyOiA5LFxuXG4gICAgYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uOiAnY2xvc2VfZ29hbC5wbmcnLFxuICAgIHBlZ21hbkhlaWdodDogMTA3LFxuICAgIHBlZ21hbldpZHRoOiA4MCxcbiAgICBwZWdtYW5YT2Zmc2V0OiAtMTIsXG4gICAgcGVnbWFuWU9mZnNldDogLTMwLFxuICAgIHR1cm5BZnRlclZpY3Rvcnk6IHRydWVcbiAgfVxufTtcblxuLy8gbmlnaHQgc2tpbnMgYXJlIGVmZmVjdGl2ZWx5IHRoZSBzYW1lLCBidXQgd2lsbCBoYXZlIHNvbWUgZGlmZmVyZW50IGFzc2V0c1xuLy8gaW4gdGhlaXIgcmVzcGVjdGl2ZSBmb2xkZXJzIGJsb2NrbHkvc3RhdGljL3NraW5zLzxza2luIG5hbWU+XG5DT05GSUdTLmJlZV9uaWdodCA9IENPTkZJR1MuYmVlO1xuQ09ORklHUy5mYXJtZXJfbmlnaHQgPSBDT05GSUdTLmZhcm1lcjtcblxuLyoqXG4gKiBHaXZlbiB0aGUgbXAzIHNvdW5kLCBnZW5lcmF0ZXMgYSBsaXN0IGNvbnRhaW5pbmcgYm90aCB0aGUgbXAzIGFuZCBvZ2cgc291bmRzXG4gKi9cbmZ1bmN0aW9uIHNvdW5kQXNzZXRVcmxzKHNraW4sIG1wM1NvdW5kKSB7XG4gIHZhciBiYXNlID0gbXAzU291bmQubWF0Y2goL14oLiopXFwubXAzJC8pWzFdO1xuICByZXR1cm4gW3NraW4uYXNzZXRVcmwobXAzU291bmQpLCBza2luLmFzc2V0VXJsKGJhc2UgKyAnLm9nZycpXTtcbn1cblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oYXNzZXRVcmwsIGlkKSB7XG4gIC8vIFRoZSBza2luIGhhcyBwcm9wZXJ0aWVzIGZyb20gdGhyZWUgbG9jYXRpb25zXG4gIC8vICgxKSBza2luQmFzZSAtIHByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBCbG9ja2x5IGFwcHNcbiAgLy8gKDIpIGhlcmUgLSBwcm9wZXJ0aWVzIGNvbW1vbiBhY3Jvc3MgYWxsIG1hemUgc2tpbnNcbiAgLy8gKDMpIGNvbmZpZyAtIHByb3BlcnRpZXMgcGFydGljdWxhciB0byBhIG1hemUgc2tpblxuICAvLyBJZiBhIHByb3BlcnR5IGlzIGRlZmluZWQgaW4gbXVsdGlwbGUgbG9jYXRpb25zLCB0aGUgbW9yZSBzcGVjaWZpYyBsb2NhdGlvblxuICAvLyB0YWtlcyBwcmVjZWRlbmNlXG5cbiAgLy8gKDEpIFByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBCbG9ja2x5IGFwcHNcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICAvLyAoMikgRGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BlcnRpZXMgY29tbW9uIGFjcm9zcyBtYXplIHNraW5zLlxuICBza2luLm9ic3RhY2xlU2NhbGUgPSAxLjA7XG4gIHNraW4ub2JzdGFjbGVBbmltYXRpb24gPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5naWYnKTtcbiAgc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uU3BlZWRTY2FsZSA9IDE7XG4gIHNraW4ubG9vayA9ICcjRkZGJztcbiAgc2tpbi5iYWNrZ3JvdW5kID0gc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZC5wbmcnKTtcbiAgc2tpbi50aWxlcyA9IHNraW4uYXNzZXRVcmwoJ3RpbGVzLnBuZycpO1xuICBza2luLnBlZ21hbkhlaWdodCA9IDUyO1xuICBza2luLnBlZ21hbldpZHRoID0gNDk7XG4gIHNraW4ucGVnbWFuWU9mZnNldCA9IDA7XG4gIC8vIGRvIHdlIHR1cm4gdG8gdGhlIGRpcmVjdGlvbiB3ZSdyZSBmYWNpbmcgYWZ0ZXIgcGVyZm9ybWluZyBvdXIgdmljdG9yeVxuICAvLyBhbmltYXRpb24/XG4gIHNraW4udHVybkFmdGVyVmljdG9yeSA9IGZhbHNlO1xuICBza2luLmRhbmNlT25Mb2FkID0gZmFsc2U7XG5cbiAgLy8gU291bmRzXG4gIHNraW4ub2JzdGFjbGVTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICdvYnN0YWNsZS5tcDMnKTtcbiAgc2tpbi53YWxsU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbC5tcDMnKTtcbiAgc2tpbi53aW5Hb2FsU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2luX2dvYWwubXAzJyk7XG4gIHNraW4ud2FsbDBTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsMC5tcDMnKTtcbiAgc2tpbi53YWxsMVNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGwxLm1wMycpO1xuICBza2luLndhbGwyU291bmQgPSBzb3VuZEFzc2V0VXJscyhza2luLCAnd2FsbDIubXAzJyk7XG4gIHNraW4ud2FsbDNTb3VuZCA9IHNvdW5kQXNzZXRVcmxzKHNraW4sICd3YWxsMy5tcDMnKTtcbiAgc2tpbi53YWxsNFNvdW5kID0gc291bmRBc3NldFVybHMoc2tpbiwgJ3dhbGw0Lm1wMycpO1xuXG4gIC8vICgzKSBHZXQgcHJvcGVydGllcyBmcm9tIGNvbmZpZ1xuICB2YXIgaXNBc3NldCA9IC9cXC5cXFN7M30kLzsgLy8gZW5kcyBpbiBkb3QgZm9sbG93ZWQgYnkgdGhyZWUgbm9uLXdoaXRlc3BhY2UgY2hhcnNcbiAgdmFyIGlzU291bmQgPSAvXiguKilcXC5tcDMkLzsgLy8gc29tZXRoaW5nLm1wM1xuICBmb3IgKHZhciBwcm9wIGluIGNvbmZpZykge1xuICAgIHZhciB2YWwgPSBjb25maWdbcHJvcF07XG4gICAgaWYgKGlzU291bmQudGVzdCh2YWwpKSB7XG4gICAgICB2YWwgPSBzb3VuZEFzc2V0VXJscyhza2luLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBc3NldC50ZXN0KHZhbCkpIHtcbiAgICAgIHZhbCA9IHNraW4uYXNzZXRVcmwodmFsKTtcbiAgICB9XG4gICAgc2tpbltwcm9wXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBBcHBzOiBNYXplXG4gKlxuICogQ29weXJpZ2h0IDIwMTIgR29vZ2xlIEluYy5cbiAqIGh0dHA6Ly9ibG9ja2x5Lmdvb2dsZWNvZGUuY29tL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEphdmFTY3JpcHQgZm9yIEJsb2NrbHkncyBNYXplIGFwcGxpY2F0aW9uLlxuICogQGF1dGhvciBmcmFzZXJAZ29vZ2xlLmNvbSAoTmVpbCBGcmFzZXIpXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIGNvZGVXb3Jrc3BhY2VFanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvY29kZVdvcmtzcGFjZS5odG1sLmVqcycpO1xudmFyIHZpc3VhbGl6YXRpb25Db2x1bW5FanMgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvdmlzdWFsaXphdGlvbkNvbHVtbi5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBtYXplVXRpbHMgPSByZXF1aXJlKCcuL21hemVVdGlscycpO1xudmFyIF8gPSB1dGlscy5nZXRMb2Rhc2goKTtcbnZhciBkcm9wbGV0Q29uZmlnID0gcmVxdWlyZSgnLi9kcm9wbGV0Q29uZmlnJyk7XG5cbnZhciBNYXplTWFwID0gcmVxdWlyZSgnLi9tYXplTWFwJyk7XG52YXIgQmVlID0gcmVxdWlyZSgnLi9iZWUnKTtcbnZhciBDZWxsID0gcmVxdWlyZSgnLi9jZWxsJyk7XG52YXIgQmVlQ2VsbCA9IHJlcXVpcmUoJy4vYmVlQ2VsbCcpO1xudmFyIFdvcmRTZWFyY2ggPSByZXF1aXJlKCcuL3dvcmRzZWFyY2gnKTtcbnZhciBzY3JhdCA9IHJlcXVpcmUoJy4vc2NyYXQnKTtcblxudmFyIERpcnREcmF3ZXIgPSByZXF1aXJlKCcuL2RpcnREcmF3ZXInKTtcbnZhciBCZWVJdGVtRHJhd2VyID0gcmVxdWlyZSgnLi9iZWVJdGVtRHJhd2VyJyk7XG5cbnZhciBFeGVjdXRpb25JbmZvID0gcmVxdWlyZSgnLi9leGVjdXRpb25JbmZvJyk7XG5cbnZhciBEaXJlY3Rpb24gPSB0aWxlcy5EaXJlY3Rpb247XG52YXIgU3F1YXJlVHlwZSA9IHRpbGVzLlNxdWFyZVR5cGU7XG52YXIgVHVybkRpcmVjdGlvbiA9IHRpbGVzLlR1cm5EaXJlY3Rpb247XG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG52YXIgU1ZHX05TID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJykuU1ZHX05TO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgTWF6ZSA9IG1vZHVsZS5leHBvcnRzO1xuXG52YXIgbGV2ZWw7XG52YXIgc2tpbjtcblxuLyoqXG4gKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBlYWNoIGFuaW1hdGlvbiBmcmFtZS5cbiAqL1xudmFyIHN0ZXBTcGVlZCA9IDEwMDtcblxuLy9UT0RPOiBNYWtlIGNvbmZpZ3VyYWJsZS5cbnN0dWRpb0FwcC5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xuXG4vLyBEZWZhdWx0IFNjYWxpbmdzXG5NYXplLnNjYWxlID0ge1xuICAnc25hcFJhZGl1cyc6IDEsXG4gICdzdGVwU3BlZWQnOiA1XG59O1xuXG52YXIgbG9hZExldmVsID0gZnVuY3Rpb24gKCkge1xuICAvLyBMb2FkIG1hcHMuXG4gIC8vIFwic2VyaWFsaXplZE1hemVcIiBpcyB0aGUgbmV3IHdheSBvZiBzdG9yaW5nIG1hcHM7IGl0J3MgYSBKU09OIGFycmF5XG4gIC8vIGNvbnRhaW5pbmcgY29tcGxleCBtYXAgZGF0YS5cbiAgLy8gXCJtYXBcIiBwbHVzIG9wdGlvbmFsbHkgXCJsZXZlbERpcnRcIiBpcyB0aGUgb2xkIHdheSBvZiBzdG9yaW5nIG1hcHM7XG4gIC8vIHRoZXkgYXJlIGVhY2ggYXJyYXlzIG9mIGEgY29tYmluYXRpb24gb2Ygc3RyaW5ncyBhbmQgaW50cyB3aXRoXG4gIC8vIHRoZWlyIG93biBjb21wbGV4IHN5bnRheC4gVGhpcyB3YXkgaXMgZGVwcmVjYXRlZCBmb3IgbmV3IGxldmVscyxcbiAgLy8gYW5kIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBmb3Igbm90LXlldC11cGRhdGVkXG4gIC8vIGxldmVscy5cbiAgaWYgKGxldmVsLnNlcmlhbGl6ZWRNYXplKSB7XG4gICAgTWF6ZS5tYXAgPSBNYXplTWFwLmRlc2VyaWFsaXplKGxldmVsLnNlcmlhbGl6ZWRNYXplLCBNYXplLmNlbGxDbGFzcyk7XG4gIH0gZWxzZSB7XG4gICAgTWF6ZS5tYXAgPSBNYXplTWFwLnBhcnNlRnJvbU9sZFZhbHVlcyhsZXZlbC5tYXAsIGxldmVsLmluaXRpYWxEaXJ0LCBNYXplLmNlbGxDbGFzcyk7XG4gIH1cblxuICBNYXplLnN0YXJ0RGlyZWN0aW9uID0gbGV2ZWwuc3RhcnREaXJlY3Rpb247XG5cbiAgTWF6ZS5hbmltYXRpbmdfID0gZmFsc2U7XG5cbiAgLy8gT3ZlcnJpZGUgc2NhbGFycy5cbiAgZm9yICh2YXIga2V5IGluIGxldmVsLnNjYWxlKSB7XG4gICAgTWF6ZS5zY2FsZVtrZXldID0gbGV2ZWwuc2NhbGVba2V5XTtcbiAgfVxuXG4gIGlmIChsZXZlbC5mYXN0R2V0TmVjdGFyQW5pbWF0aW9uKSB7XG4gICAgc2tpbi5hY3Rpb25TcGVlZFNjYWxlLm5lY3RhciA9IDAuNTtcbiAgfVxuICAvLyBNZWFzdXJlIG1hemUgZGltZW5zaW9ucyBhbmQgc2V0IHNpemVzLlxuICAvLyBJbml0aWFsaXplIHRoZSB3YWxsTWFwLlxuICBpbml0V2FsbE1hcCgpO1xuICAvLyBQaXhlbCBoZWlnaHQgYW5kIHdpZHRoIG9mIGVhY2ggbWF6ZSBzcXVhcmUgKGkuZS4gdGlsZSkuXG4gIE1hemUuU1FVQVJFX1NJWkUgPSA1MDtcbiAgTWF6ZS5QRUdNQU5fSEVJR0hUID0gc2tpbi5wZWdtYW5IZWlnaHQ7XG4gIE1hemUuUEVHTUFOX1dJRFRIID0gc2tpbi5wZWdtYW5XaWR0aDtcbiAgTWF6ZS5QRUdNQU5fWF9PRkZTRVQgPSBza2luLnBlZ21hblhPZmZzZXQgfHwgMDtcbiAgTWF6ZS5QRUdNQU5fWV9PRkZTRVQgPSBza2luLnBlZ21hbllPZmZzZXQ7XG4gIC8vIEhlaWdodCBhbmQgd2lkdGggb2YgdGhlIGdvYWwgYW5kIG9ic3RhY2xlcy5cbiAgTWF6ZS5NQVJLRVJfSEVJR0hUID0gNDM7XG4gIE1hemUuTUFSS0VSX1dJRFRIID0gNTA7XG5cbiAgTWF6ZS5NQVpFX1dJRFRIID0gTWF6ZS5TUVVBUkVfU0laRSAqIE1hemUubWFwLkNPTFM7XG4gIE1hemUuTUFaRV9IRUlHSFQgPSBNYXplLlNRVUFSRV9TSVpFICogTWF6ZS5tYXAuUk9XUztcbiAgTWF6ZS5QQVRIX1dJRFRIID0gTWF6ZS5TUVVBUkVfU0laRSAvIDM7XG59O1xuXG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgd2FsbE1hcC4gIEZvciBhbnkgY2VsbCBhdCBsb2NhdGlvbiB4LHkgTWF6ZS53YWxsTWFwW3ldW3hdIHdpbGxcbiAqIGJlIHRoZSBpbmRleCBvZiB3aGljaCB3YWxsIHRpbGUgdG8gdXNlIGZvciB0aGF0IGNlbGwuICBJZiB0aGUgY2VsbCBpcyBub3QgYVxuICogd2FsbCwgTWF6ZS53YWxsTWFwW3ldW3hdIGlzIHVuZGVmaW5lZC5cbiAqL1xudmFyIGluaXRXYWxsTWFwID0gZnVuY3Rpb24oKSB7XG4gIE1hemUud2FsbE1hcCA9IG5ldyBBcnJheShNYXplLm1hcC5ST1dTKTtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLm1hcC5ST1dTOyB5KyspIHtcbiAgICBNYXplLndhbGxNYXBbeV0gPSBuZXcgQXJyYXkoTWF6ZS5tYXAuQ09MUyk7XG4gIH1cbn07XG5cbi8qKlxuICogUElEcyBvZiBhbmltYXRpb24gdGFza3MgY3VycmVudGx5IGV4ZWN1dGluZy5cbiAqL1xudmFyIHRpbWVvdXRMaXN0ID0gcmVxdWlyZSgnLi4vdGltZW91dExpc3QnKTtcblxuLy8gTWFwIGVhY2ggcG9zc2libGUgc2hhcGUgdG8gYSBzcHJpdGUuXG4vLyBJbnB1dDogQmluYXJ5IHN0cmluZyByZXByZXNlbnRpbmcgQ2VudHJlL05vcnRoL1dlc3QvU291dGgvRWFzdCBzcXVhcmVzLlxuLy8gT3V0cHV0OiBbeCwgeV0gY29vcmRpbmF0ZXMgb2YgZWFjaCB0aWxlJ3Mgc3ByaXRlIGluIHRpbGVzLnBuZy5cbnZhciBUSUxFX1NIQVBFUyA9IHtcbiAgJzEwMDEwJzogWzQsIDBdLCAgLy8gRGVhZCBlbmRzXG4gICcxMDAwMSc6IFszLCAzXSxcbiAgJzExMDAwJzogWzAsIDFdLFxuICAnMTAxMDAnOiBbMCwgMl0sXG4gICcxMTAxMCc6IFs0LCAxXSwgIC8vIFZlcnRpY2FsXG4gICcxMDEwMSc6IFszLCAyXSwgIC8vIEhvcml6b250YWxcbiAgJzEwMTEwJzogWzAsIDBdLCAgLy8gRWxib3dzXG4gICcxMDAxMSc6IFsyLCAwXSxcbiAgJzExMDAxJzogWzQsIDJdLFxuICAnMTExMDAnOiBbMiwgM10sXG4gICcxMTExMCc6IFsxLCAxXSwgIC8vIEp1bmN0aW9uc1xuICAnMTAxMTEnOiBbMSwgMF0sXG4gICcxMTAxMSc6IFsyLCAxXSxcbiAgJzExMTAxJzogWzEsIDJdLFxuICAnMTExMTEnOiBbMiwgMl0sICAvLyBDcm9zc1xuICAnbnVsbDAnOiBbNCwgM10sICAvLyBFbXB0eVxuICAnbnVsbDEnOiBbMywgMF0sXG4gICdudWxsMic6IFszLCAxXSxcbiAgJ251bGwzJzogWzAsIDNdLFxuICAnbnVsbDQnOiBbMSwgM10sXG59O1xuXG5mdW5jdGlvbiBkcmF3TWFwICgpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIHZhciB4LCB5LCBrLCB0aWxlO1xuXG4gIC8vIERyYXcgdGhlIG91dGVyIHNxdWFyZS5cbiAgdmFyIHNxdWFyZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdyZWN0Jyk7XG4gIHNxdWFyZS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgTWF6ZS5NQVpFX1dJRFRIKTtcbiAgc3F1YXJlLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5NQVpFX0hFSUdIVCk7XG4gIHNxdWFyZS5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCAnI0YxRUVFNycpO1xuICBzcXVhcmUuc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAxKTtcbiAgc3F1YXJlLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgJyNDQ0InKTtcbiAgc3ZnLmFwcGVuZENoaWxkKHNxdWFyZSk7XG5cbiAgLy8gQWRqdXN0IG91dGVyIGVsZW1lbnQgc2l6ZS5cbiAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLk1BWkVfV0lEVEgpO1xuICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLk1BWkVfSEVJR0hUKTtcblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gTWF6ZS5NQVpFX1dJRFRIICsgJ3B4JztcblxuICBpZiAoc2tpbi5iYWNrZ3JvdW5kKSB7XG4gICAgdGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBza2luLmJhY2tncm91bmQpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLk1BWkVfSEVJR0hUKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLk1BWkVfV0lEVEgpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd4JywgMCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3knLCAwKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQodGlsZSk7XG4gIH1cblxuICBkcmF3TWFwVGlsZXMoc3ZnKTtcblxuICAvLyBQZWdtYW4ncyBjbGlwUGF0aCBlbGVtZW50LCB3aG9zZSAoeCwgeSkgaXMgcmVzZXQgYnkgTWF6ZS5kaXNwbGF5UGVnbWFuXG4gIHZhciBwZWdtYW5DbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2NsaXBQYXRoJyk7XG4gIHBlZ21hbkNsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdwZWdtYW5DbGlwUGF0aCcpO1xuICB2YXIgY2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICBjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2NsaXBSZWN0Jyk7XG4gIGNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlBFR01BTl9XSURUSCk7XG4gIGNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5QRUdNQU5fSEVJR0hUKTtcbiAgcGVnbWFuQ2xpcC5hcHBlbmRDaGlsZChjbGlwUmVjdCk7XG4gIHN2Zy5hcHBlbmRDaGlsZChwZWdtYW5DbGlwKTtcblxuICAvLyBBZGQgcGVnbWFuLlxuICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAncGVnbWFuJyk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdwZWdtYW4tbG9jYXRpb24nKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmF2YXRhcik7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBNYXplLlBFR01BTl9IRUlHSFQpO1xuICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlBFR01BTl9XSURUSCAqIDIxKTsgLy8gNDkgKiAyMSA9IDEwMjlcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoI3BlZ21hbkNsaXBQYXRoKScpO1xuICBzdmcuYXBwZW5kQ2hpbGQocGVnbWFuSWNvbik7XG5cbiAgdmFyIHBlZ21hbkZhZGVvdXRBbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnYW5pbWF0ZScpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnaWQnLCAncGVnbWFuRmFkZW91dEFuaW1hdGlvbicpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlVHlwZScsICdDU1MnKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZU5hbWUnLCAnb3BhY2l0eScpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnZnJvbScsIDEpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgndG8nLCAwKTtcbiAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2R1cicsICcxcycpO1xuICBwZWdtYW5GYWRlb3V0QW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYmVnaW4nLCAnaW5kZWZpbml0ZScpO1xuICBwZWdtYW5JY29uLmFwcGVuZENoaWxkKHBlZ21hbkZhZGVvdXRBbmltYXRpb24pO1xuXG4gIGlmIChNYXplLmZpbmlzaF8gJiYgc2tpbi5nb2FsSWRsZSkge1xuICAgIC8vIEFkZCBmaW5pc2ggbWFya2VyLlxuICAgIHZhciBmaW5pc2hNYXJrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBmaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCdpZCcsICdmaW5pc2gnKTtcbiAgICBmaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uZ29hbElkbGUpO1xuICAgIGZpbmlzaE1hcmtlci5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFSS0VSX0hFSUdIVCk7XG4gICAgZmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLk1BUktFUl9XSURUSCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGZpbmlzaE1hcmtlcik7XG4gIH1cblxuICAvLyBBZGQgd2FsbCBoaXR0aW5nIGFuaW1hdGlvblxuICBpZiAoc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbikge1xuICAgIHZhciB3YWxsQW5pbWF0aW9uSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnd2FsbEFuaW1hdGlvbicpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5TUVVBUkVfU0laRSk7XG4gICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuU1FVQVJFX1NJWkUpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQod2FsbEFuaW1hdGlvbkljb24pO1xuICB9XG5cbiAgLy8gQWRkIG9ic3RhY2xlcy5cbiAgdmFyIG9ic0lkID0gMDtcbiAgZm9yICh5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgIGlmIChNYXplLm1hcC5nZXRUaWxlKHksIHgpID09IFNxdWFyZVR5cGUuT0JTVEFDTEUpIHtcbiAgICAgICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuTUFSS0VSX0hFSUdIVCAqIHNraW4ub2JzdGFjbGVTY2FsZSk7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuTUFSS0VSX1dJRFRIICogc2tpbi5vYnN0YWNsZVNjYWxlKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi5vYnN0YWNsZUlkbGUpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoeCArIDAuNSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgneScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hemUuU1FVQVJFX1NJWkUgKiAoeSArIDAuOSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQob2JzSWNvbik7XG4gICAgICB9XG4gICAgICArK29ic0lkO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFkZCBpZGxlIHBlZ21hbi5cbiAgaWYgKHNraW4uaWRsZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ2lkbGUnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4uaWRsZVBlZ21hbkFuaW1hdGlvbixcbiAgICAgIHJvdzogTWF6ZS5zdGFydF8ueSxcbiAgICAgIGNvbDogTWF6ZS5zdGFydF8ueCxcbiAgICAgIGRpcmVjdGlvbjogTWF6ZS5zdGFydERpcmVjdGlvbixcbiAgICAgIG51bUNvbFBlZ21hbjogc2tpbi5pZGxlUGVnbWFuQ29sLFxuICAgICAgbnVtUm93UGVnbWFuOiBza2luLmlkbGVQZWdtYW5Sb3dcbiAgICB9KTtcblxuXG4gICAgaWYgKHNraW4uaWRsZVBlZ21hbkNvbCA+IDEgfHwgc2tpbi5pZGxlUGVnbWFuUm93ID4gMSkge1xuICAgICAgLy8gb3VyIGlkbGUgaXMgYSBzcHJpdGUgc2hlZXQgaW5zdGVhZCBvZiBhIGdpZi4gc2NoZWR1bGUgY3ljbGluZyB0aHJvdWdoXG4gICAgICAvLyB0aGUgZnJhbWVzXG4gICAgICB2YXIgbnVtRnJhbWVzID0gc2tpbi5pZGxlUGVnbWFuUm93O1xuICAgICAgdmFyIGlkbGVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lkbGVQZWdtYW4nKTtcbiAgICAgIHZhciB0aW1lUGVyRnJhbWUgPSA2MDA7IC8vIHRpbWVGb3JBbmltYXRpb24gLyBudW1GcmFtZXM7XG4gICAgICB2YXIgaWRsZUFuaW1hdGlvbkZyYW1lID0gMDtcblxuICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpZGxlUGVnbWFuSWNvbi5nZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnKSB7XG4gICAgICAgICAgdXBkYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgICAgICAgIGlkU3RyOiAnaWRsZScsXG4gICAgICAgICAgICByb3c6IE1hemUuc3RhcnRfLnksXG4gICAgICAgICAgICBjb2w6IE1hemUuc3RhcnRfLngsXG4gICAgICAgICAgICBkaXJlY3Rpb246IE1hemUuc3RhcnREaXJlY3Rpb24sXG4gICAgICAgICAgICBhbmltYXRpb25Sb3c6IGlkbGVBbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlkbGVBbmltYXRpb25GcmFtZSA9IChpZGxlQW5pbWF0aW9uRnJhbWUgKyAxKSAlIG51bUZyYW1lcztcbiAgICAgICAgfVxuICAgICAgfSwgdGltZVBlckZyYW1lKTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2tpbi5jZWxlYnJhdGVBbmltYXRpb24pIHtcbiAgICBjcmVhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgaWRTdHI6ICdjZWxlYnJhdGUnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4uY2VsZWJyYXRlQW5pbWF0aW9uLFxuICAgICAgcm93OiBNYXplLnN0YXJ0Xy55LFxuICAgICAgY29sOiBNYXplLnN0YXJ0Xy54LFxuICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24uTk9SVEgsXG4gICAgICBudW1Db2xQZWdtYW46IHNraW4uY2VsZWJyYXRlUGVnbWFuQ29sLFxuICAgICAgbnVtUm93UGVnbWFuOiBza2luLmNlbGVicmF0ZVBlZ21hblJvd1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBoaWRkZW4gZGF6ZWQgcGVnbWFuIHdoZW4gaGl0dGluZyB0aGUgd2FsbC5cbiAgaWYgKHNraW4ud2FsbFBlZ21hbkFuaW1hdGlvbikge1xuICAgIGNyZWF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICBpZFN0cjogJ3dhbGwnLFxuICAgICAgcGVnbWFuSW1hZ2U6IHNraW4ud2FsbFBlZ21hbkFuaW1hdGlvblxuICAgIH0pO1xuICB9XG5cbiAgLy8gY3JlYXRlIGVsZW1lbnQgZm9yIG91ciBoaXR0aW5nIHdhbGwgc3ByaXRlc2hlZXRcbiAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24gJiYgc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbkZyYW1lTnVtYmVyKSB7XG4gICAgY3JlYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgIGlkU3RyOiAnd2FsbCcsXG4gICAgICBwZWdtYW5JbWFnZTogc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbixcbiAgICAgIG51bUNvbFBlZ21hbjogc2tpbi5oaXR0aW5nV2FsbFBlZ21hbkNvbCxcbiAgICAgIG51bVJvd1BlZ21hbjogc2tpbi5oaXR0aW5nV2FsbFBlZ21hblJvd1xuICAgIH0pO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsUGVnbWFuJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICB9XG5cbiAgLy8gQWRkIHRoZSBoaWRkZW4gbW92aW5nIHBlZ21hbiBhbmltYXRpb24uXG4gIGlmIChza2luLm1vdmVQZWdtYW5BbmltYXRpb24pIHtcbiAgICBjcmVhdGVQZWdtYW5BbmltYXRpb24oe1xuICAgICAgaWRTdHI6ICdtb3ZlJyxcbiAgICAgIHBlZ21hbkltYWdlOiBza2luLm1vdmVQZWdtYW5BbmltYXRpb24sXG4gICAgICBudW1Db2xQZWdtYW46IDQsXG4gICAgICBudW1Sb3dQZWdtYW46IDlcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRpbGUgYXQgeCx5IGlzIGVpdGhlciBhIHdhbGwgb3Igb3V0IG9mIGJvdW5kc1xuZnVuY3Rpb24gaXNXYWxsT3JPdXRPZkJvdW5kcyAoY29sLCByb3cpIHtcbiAgcmV0dXJuIE1hemUubWFwLmdldFRpbGUocm93LCBjb2wpID09PSBTcXVhcmVUeXBlLldBTEwgfHxcbiAgICAgIE1hemUubWFwLmdldFRpbGUocm93LCBjb2wpID09PSB1bmRlZmluZWQ7XG59XG5cbi8vIFJldHVybiBhIHZhbHVlIG9mICcwJyBpZiB0aGUgc3BlY2lmaWVkIHNxdWFyZSBpcyB3YWxsIG9yIG91dCBvZiBib3VuZHMgJzEnXG4vLyBvdGhlcndpc2UgKGVtcHR5LCBvYnN0YWNsZSwgc3RhcnQsIGZpbmlzaCkuXG5mdW5jdGlvbiBpc09uUGF0aFN0ciAoeCwgeSkge1xuICByZXR1cm4gaXNXYWxsT3JPdXRPZkJvdW5kcyh4LCB5KSA/IFwiMFwiIDogXCIxXCI7XG59XG5cbi8vIERyYXcgdGhlIHRpbGVzIG1ha2luZyB1cCB0aGUgbWF6ZSBtYXAuXG5mdW5jdGlvbiBkcmF3TWFwVGlsZXMoc3ZnKSB7XG4gIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICByZXR1cm4gTWF6ZS53b3JkU2VhcmNoLmRyYXdNYXBUaWxlcyhzdmcpO1xuICB9IGVsc2UgaWYgKG1hemVVdGlscy5pc1NjcmF0U2tpbihza2luLmlkKSkge1xuICAgIHJldHVybiBzY3JhdC5kcmF3TWFwVGlsZXMoc3ZnKTtcbiAgfVxuXG4gIC8vIENvbXB1dGUgYW5kIGRyYXcgdGhlIHRpbGUgZm9yIGVhY2ggc3F1YXJlLlxuICB2YXIgdGlsZUlkID0gMDtcbiAgdmFyIHRpbGUsIG9yaWdUaWxlO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgTWF6ZS5tYXAuQ09MUzsgeCsrKSB7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgdGlsZSA9IGlzT25QYXRoU3RyKHgsIHkpICtcbiAgICAgICAgaXNPblBhdGhTdHIoeCwgeSAtIDEpICsgIC8vIE5vcnRoLlxuICAgICAgICBpc09uUGF0aFN0cih4ICsgMSwgeSkgKyAgLy8gV2VzdC5cbiAgICAgICAgaXNPblBhdGhTdHIoeCwgeSArIDEpICsgIC8vIFNvdXRoLlxuICAgICAgICBpc09uUGF0aFN0cih4IC0gMSwgeSk7ICAgLy8gRWFzdC5cblxuICAgICAgdmFyIGFkamFjZW50VG9QYXRoID0gKHRpbGUgIT09ICcwMDAwMCcpO1xuXG4gICAgICAvLyBEcmF3IHRoZSB0aWxlLlxuICAgICAgaWYgKCFUSUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICAvLyBXZSBoYXZlIGFuIGVtcHR5IHNxdWFyZS4gSGFuZGxlIGl0IGRpZmZlcmVudGx5IGJhc2VkIG9uIHNraW4uXG4gICAgICAgIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKHNraW4uaWQpKSB7XG4gICAgICAgICAgLy8gYmVnaW4gd2l0aCB0aHJlZSB0cmVlc1xuICAgICAgICAgIHZhciB0aWxlQ2hvaWNlcyA9IFsnbnVsbDMnLCAnbnVsbDQnLCAnbnVsbDAnXTtcbiAgICAgICAgICB2YXIgbm9UcmVlID0gJ251bGwxJztcbiAgICAgICAgICAvLyB3YW50IGl0IHRvIGJlIG1vcmUgbGlrZWx5IHRvIGhhdmUgYSB0cmVlIHdoZW4gYWRqYWNlbnQgdG8gcGF0aFxuICAgICAgICAgIHZhciBuID0gYWRqYWNlbnRUb1BhdGggPyB0aWxlQ2hvaWNlcy5sZW5ndGggKiAyIDogdGlsZUNob2ljZXMubGVuZ3RoICogNjtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdGlsZUNob2ljZXMucHVzaChub1RyZWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRpbGUgPSBfLnNhbXBsZSh0aWxlQ2hvaWNlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRW1wdHkgc3F1YXJlLiAgVXNlIG51bGwwIGZvciBsYXJnZSBhcmVhcywgd2l0aCBudWxsMS00IGZvciBib3JkZXJzLlxuICAgICAgICAgIGlmICghYWRqYWNlbnRUb1BhdGggJiYgTWF0aC5yYW5kb20oKSA+IDAuMykge1xuICAgICAgICAgICAgTWF6ZS53YWxsTWFwW3ldW3hdID0gMDtcbiAgICAgICAgICAgIHRpbGUgPSAnbnVsbDAnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgd2FsbElkeCA9IE1hdGguZmxvb3IoMSArIE1hdGgucmFuZG9tKCkgKiA0KTtcbiAgICAgICAgICAgIE1hemUud2FsbE1hcFt5XVt4XSA9IHdhbGxJZHg7XG4gICAgICAgICAgICB0aWxlID0gJ251bGwnICsgd2FsbElkeDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGb3IgdGhlIGZpcnN0IDMgbGV2ZWxzIGluIG1hemUsIG9ubHkgc2hvdyB0aGUgbnVsbDAgaW1hZ2UuXG4gICAgICAgICAgaWYgKGxldmVsLmlkID09ICcyXzEnIHx8IGxldmVsLmlkID09ICcyXzInIHx8IGxldmVsLmlkID09ICcyXzMnKSB7XG4gICAgICAgICAgICBNYXplLndhbGxNYXBbeV1beF0gPSAwO1xuICAgICAgICAgICAgdGlsZSA9ICdudWxsMCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE1hemUuZHJhd1RpbGUoc3ZnLCBUSUxFX1NIQVBFU1t0aWxlXSwgeSwgeCwgdGlsZUlkKTtcblxuICAgICAgLy8gRHJhdyBjaGVja2VyYm9hcmQgZm9yIGJlZS5cbiAgICAgIGlmIChNYXplLmdyaWRJdGVtRHJhd2VyIGluc3RhbmNlb2YgQmVlSXRlbURyYXdlciAmJiAoeCArIHkpICUgMiA9PT0gMCkge1xuICAgICAgICB2YXIgaXNQYXRoID0gIS9udWxsLy50ZXN0KHRpbGUpO1xuICAgICAgICBNYXplLmdyaWRJdGVtRHJhd2VyLmFkZENoZWNrZXJib2FyZFRpbGUoeSwgeCwgaXNQYXRoKTtcbiAgICAgIH1cblxuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRHJhdyB0aGUgZ2l2ZW4gdGlsZSBhdCByb3csIGNvbFxuICovXG5NYXplLmRyYXdUaWxlID0gZnVuY3Rpb24gKHN2ZywgdGlsZVNoZWV0TG9jYXRpb24sIHJvdywgY29sLCB0aWxlSWQpIHtcbiAgdmFyIGxlZnQgPSB0aWxlU2hlZXRMb2NhdGlvblswXTtcbiAgdmFyIHRvcCA9IHRpbGVTaGVldExvY2F0aW9uWzFdO1xuXG4gIHZhciB0aWxlU2hlZXRXaWR0aCA9IE1hemUuU1FVQVJFX1NJWkUgKiA1O1xuICB2YXIgdGlsZVNoZWV0SGVpZ2h0ID0gTWF6ZS5TUVVBUkVfU0laRSAqIDQ7XG5cbiAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gIHZhciB0aWxlQ2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdjbGlwUGF0aCcpO1xuICB0aWxlQ2xpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQpO1xuICB2YXIgdGlsZUNsaXBSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlNRVUFSRV9TSVpFKTtcbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5TUVVBUkVfU0laRSk7XG5cbiAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIE1hemUuU1FVQVJFX1NJWkUpO1xuICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd5Jywgcm93ICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHRpbGVDbGlwLmFwcGVuZENoaWxkKHRpbGVDbGlwUmVjdCk7XG4gIHN2Zy5hcHBlbmRDaGlsZCh0aWxlQ2xpcCk7XG5cbiAgLy8gVGlsZSBzcHJpdGUuXG4gIHZhciB0aWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLnRpbGVzKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aWxlU2hlZXRIZWlnaHQpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGlsZVNoZWV0V2lkdGgpO1xuICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAndXJsKCN0aWxlQ2xpcFBhdGgnICsgdGlsZUlkICsgJyknKTtcbiAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd4JywgKGNvbCAtIGxlZnQpICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgneScsIChyb3cgLSB0b3ApICogTWF6ZS5TUVVBUkVfU0laRSk7XG4gIHN2Zy5hcHBlbmRDaGlsZCh0aWxlRWxlbWVudCk7XG4gIC8vIFRpbGUgYW5pbWF0aW9uXG4gIHZhciB0aWxlQW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2FuaW1hdGUnKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RpbGVBbmltYXRpb24nICsgdGlsZUlkKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZVR5cGUnLCAnQ1NTJyk7XG4gIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJywgJ29wYWNpdHknKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2Zyb20nLCAxKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3RvJywgMCk7XG4gIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdkdXInLCAnMXMnKTtcbiAgdGlsZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2JlZ2luJywgJ2luZGVmaW5pdGUnKTtcbiAgdGlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGlsZUFuaW1hdGlvbik7XG59O1xuXG4vKipcbiAqIFJlZHJhdyBhbGwgZGlydCBpbWFnZXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcnVubmluZyBXaGV0aGVyIG9yIG5vdCB1c2VyIHByb2dyYW0gaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAqL1xuZnVuY3Rpb24gcmVzZXREaXJ0SW1hZ2VzKHJ1bm5pbmcpIHtcbiAgTWF6ZS5tYXAuZm9yRWFjaENlbGwoZnVuY3Rpb24gKGNlbGwsIHJvdywgY29sKSB7XG4gICAgaWYgKGNlbGwuaXNEaXJ0KCkpIHtcbiAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlSXRlbUltYWdlKHJvdywgY29sLCBydW5uaW5nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIG1hemUuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5NYXplLmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gcmVwbGFjZSBzdHVkaW9BcHAgbWV0aG9kcyB3aXRoIG91ciBvd25cbiAgc3R1ZGlvQXBwLnJ1bkJ1dHRvbkNsaWNrID0gdGhpcy5ydW5CdXR0b25DbGljay5iaW5kKHRoaXMpO1xuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG5cbiAgdmFyIGV4dHJhQ29udHJvbFJvd3MgPSBudWxsO1xuXG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IHRydWU7XG4gIGNvbmZpZy5mb3JjZUluc2VydFRvcEJsb2NrID0gJ3doZW5fcnVuJztcbiAgY29uZmlnLmRyb3BsZXRDb25maWcgPSBkcm9wbGV0Q29uZmlnO1xuXG4gIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKGNvbmZpZy5za2luSWQpKSB7XG4gICAgTWF6ZS5iZWUgPSBuZXcgQmVlKE1hemUsIHN0dWRpb0FwcCwgY29uZmlnKTtcbiAgICAvLyBPdmVycmlkZSBkZWZhdWx0IHN0ZXBTcGVlZFxuICAgIE1hemUuc2NhbGUuc3RlcFNwZWVkID0gMjtcbiAgfSBlbHNlIGlmIChjb25maWcuc2tpbklkID09PSAnbGV0dGVycycpIHtcbiAgICBNYXplLndvcmRTZWFyY2ggPSBuZXcgV29yZFNlYXJjaChsZXZlbC5zZWFyY2hXb3JkLCBsZXZlbC5tYXAsIE1hemUuZHJhd1RpbGUpO1xuICAgIGV4dHJhQ29udHJvbFJvd3MgPSByZXF1aXJlKCcuL2V4dHJhQ29udHJvbFJvd3MuaHRtbC5lanMnKSh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgc2VhcmNoV29yZDogbGV2ZWwuc2VhcmNoV29yZFxuICAgIH0pO1xuICB9XG4gIGlmIChtYXplVXRpbHMuaXNCZWVTa2luKGNvbmZpZy5za2luSWQpKSB7XG4gICAgTWF6ZS5jZWxsQ2xhc3MgPSBCZWVDZWxsO1xuICB9IGVsc2Uge1xuICAgIE1hemUuY2VsbENsYXNzID0gQ2VsbDtcbiAgfVxuXG4gIGxvYWRMZXZlbCgpO1xuXG4gIE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMgPSBbXTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gZnVuY3Rpb24oKSB7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblNvdW5kLCAnd2luJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLm9ic3RhY2xlU291bmQsICdvYnN0YWNsZScpO1xuICAgIC8vIExvYWQgd2FsbCBzb3VuZHMuXG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGxTb3VuZCwgJ3dhbGwnKTtcblxuICAgIC8vIHRvZG8gLSBsb25ndGVybSwgaW5zdGVhZCBvZiBoYXZpbmcgc291bmQgcmVsYXRlZCBmbGFncyB3ZSBzaG91bGQganVzdFxuICAgIC8vIGhhdmUgdGhlIHNraW4gdGVsbCB1cyB0aGUgc2V0IG9mIHNvdW5kcyBpdCBuZWVkc1xuICAgIGlmIChza2luLmFkZGl0aW9uYWxTb3VuZCkge1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwwU291bmQsICd3YWxsMCcpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwxU291bmQsICd3YWxsMScpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwyU291bmQsICd3YWxsMicpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwzU291bmQsICd3YWxsMycpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGw0U291bmQsICd3YWxsNCcpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpbkdvYWxTb3VuZCwgJ3dpbkdvYWwnKTtcbiAgICB9XG4gICAgaWYgKHNraW4uZGlydFNvdW5kKSB7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmlsbFNvdW5kLCAnZmlsbCcpO1xuICAgICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmRpZ1NvdW5kLCAnZGlnJyk7XG4gICAgfVxuICAgIGlmIChza2luLmJlZVNvdW5kKSB7XG4gICAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ubmVjdGFyU291bmQsICduZWN0YXInKTtcbiAgICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5ob25leVNvdW5kLCAnaG9uZXknKTtcbiAgICB9XG4gIH07XG5cbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSByaWNobmVzcyBvZiBibG9jayBjb2xvdXJzLCByZWdhcmRsZXNzIG9mIHRoZSBodWUuXG4gICAgICAgKiBNT09DIGJsb2NrcyBzaG91bGQgYmUgYnJpZ2h0ZXIgKHRhcmdldCBhdWRpZW5jZSBpcyB5b3VuZ2VyKS5cbiAgICAgICAqIE11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIDAgKGluY2x1c2l2ZSkgdG8gMSAoZXhjbHVzaXZlKS5cbiAgICAgICAqIEJsb2NrbHkncyBkZWZhdWx0IGlzIDAuNDUuXG4gICAgICAgKi9cbiAgICAgIEJsb2NrbHkuSFNWX1NBVFVSQVRJT04gPSAwLjY7XG5cbiAgICAgIEJsb2NrbHkuU05BUF9SQURJVVMgKj0gTWF6ZS5zY2FsZS5zbmFwUmFkaXVzO1xuICAgICAgQmxvY2tseS5KYXZhU2NyaXB0LklORklOSVRFX0xPT1BfVFJBUCA9IGNvZGVnZW4ubG9vcEhpZ2hsaWdodChcIk1hemVcIik7XG4gICAgfVxuXG4gICAgTWF6ZS5zdGFydF8gPSB1bmRlZmluZWQ7XG4gICAgTWF6ZS5maW5pc2hfID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gTG9jYXRlIHRoZSBzdGFydCBhbmQgZmluaXNoIHNxdWFyZXMuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBNYXplLm1hcC5ST1dTOyB5KyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgTWF6ZS5tYXAuQ09MUzsgeCsrKSB7XG4gICAgICAgIHZhciBjZWxsID0gTWF6ZS5tYXAuZ2V0VGlsZSh5LCB4KTtcbiAgICAgICAgaWYgKGNlbGwgPT0gU3F1YXJlVHlwZS5TVEFSVCkge1xuICAgICAgICAgIE1hemUuc3RhcnRfID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB9IGVsc2UgaWYgKGNlbGwgPT09IFNxdWFyZVR5cGUuRklOSVNIKSB7XG4gICAgICAgICAgTWF6ZS5maW5pc2hfID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB9IGVsc2UgaWYgKGNlbGwgPT0gU3F1YXJlVHlwZS5TVEFSVEFOREZJTklTSCkge1xuICAgICAgICAgIE1hemUuc3RhcnRfID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICAgIE1hemUuZmluaXNoXyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIE1hemUubWFwLnJlc2V0RGlydCgpO1xuXG4gICAgaWYgKG1hemVVdGlscy5pc0JlZVNraW4oY29uZmlnLnNraW5JZCkpIHtcbiAgICAgIE1hemUuZ3JpZEl0ZW1EcmF3ZXIgPSBuZXcgQmVlSXRlbURyYXdlcihNYXplLm1hcCwgc2tpbiwgTWF6ZS5iZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBNYXplLmdyaWRJdGVtRHJhd2VyID0gbmV3IERpcnREcmF3ZXIoTWF6ZS5tYXAsIHNraW4uZGlydCk7XG4gICAgfVxuXG4gICAgZHJhd01hcCgpO1xuXG4gICAgdmFyIHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoc3RlcEJ1dHRvbiwgc3RlcEJ1dHRvbkNsaWNrKTtcblxuICAgIC8vIGJhc2UncyBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlIGNhbGxlZCBmaXJzdFxuICAgIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmVzZXRCdXR0b24sIE1hemUucmVzZXRCdXR0b25DbGljayk7XG5cbiAgICBpZiAoc2tpbi5oaWRlSW5zdHJ1Y3Rpb25zKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ1YmJsZVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZW5kZXJDb2RlV29ya3NwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjb2RlV29ya3NwYWNlRWpzKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgICBibG9ja1VzZWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgaWRlYWxCbG9ja051bWJlcjogdW5kZWZpbmVkLFxuICAgICAgICBlZGl0Q29kZTogbGV2ZWwuZWRpdENvZGUsXG4gICAgICAgIGJsb2NrQ291bnRlckNsYXNzOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZW5kZXJWaXN1YWxpemF0aW9uQ29sdW1uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2aXN1YWxpemF0aW9uQ29sdW1uRWpzKHtcbiAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHZpc3VhbGl6YXRpb246IHJlcXVpcmUoJy4vdmlzdWFsaXphdGlvbi5odG1sLmVqcycpKCksXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe1xuICAgICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICAgICAgc2hvd1N0ZXBCdXR0b246IGxldmVsLnN0ZXAgJiYgIWxldmVsLmVkaXRfYmxvY2tzXG4gICAgICAgIH0pLFxuICAgICAgICBleHRyYUNvbnRyb2xSb3dzOiBleHRyYUNvbnRyb2xSb3dzXG4gICAgICB9LFxuICAgICAgaGlkZVJ1bkJ1dHRvbjogbGV2ZWwuc3RlcE9ubHkgJiYgIWxldmVsLmVkaXRfYmxvY2tzXG4gICAgfSk7XG4gIH07XG5cbiAgUmVhY3RET00ucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlldywge1xuICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgaXNFbWJlZFZpZXc6ICEhY29uZmlnLmVtYmVkLFxuICAgIGlzU2hhcmVWaWV3OiAhIWNvbmZpZy5zaGFyZSxcbiAgICByZW5kZXJDb2RlV29ya3NwYWNlOiByZW5kZXJDb2RlV29ya3NwYWNlLFxuICAgIHJlbmRlclZpc3VhbGl6YXRpb25Db2x1bW46IHJlbmRlclZpc3VhbGl6YXRpb25Db2x1bW4sXG4gICAgb25Nb3VudDogc3R1ZGlvQXBwLmluaXQuYmluZChzdHVkaW9BcHAsIGNvbmZpZylcbiAgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5jb250YWluZXJJZCkpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgYSBjbGljayBvbiB0aGUgc3RlcCBidXR0b24uICBJZiB3ZSdyZSBhbHJlYWR5IGFuaW1hdGluZywgd2Ugc2hvdWxkXG4gKiBwZXJmb3JtIGEgc2luZ2xlIHN0ZXAuICBPdGhlcndpc2UsIHdlIGNhbGwgYmVnaW5BdHRlbXB0IHdoaWNoIHdpbGwgZG9cbiAqIHNvbWUgaW5pdGlhbCBzZXR1cCwgYW5kIHRoZW4gcGVyZm9ybSB0aGUgZmlyc3Qgc3RlcC5cbiAqL1xuZnVuY3Rpb24gc3RlcEJ1dHRvbkNsaWNrKCkge1xuICB2YXIgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGVwQnV0dG9uJyk7XG4gIHN0ZXBCdXR0b24uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICcnKTtcblxuICBpZiAoTWF6ZS5hbmltYXRpbmdfKSB7XG4gICAgTWF6ZS5zY2hlZHVsZUFuaW1hdGlvbnModHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgTWF6ZS5leGVjdXRlKHRydWUpO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSB5IGNvb3JkaW5hdGVzIGZvciBwZWdtYW4gc3ByaXRlLlxuICovXG52YXIgZ2V0UGVnbWFuWUZvclJvdyA9IGZ1bmN0aW9uIChtYXplUm93KSB7XG4gIHZhciB5ID0gTWF6ZS5TUVVBUkVfU0laRSAqIChtYXplUm93ICsgMC41KSAtIE1hemUuUEVHTUFOX0hFSUdIVCAvIDIgK1xuICAgIE1hemUuUEVHTUFOX1lfT0ZGU0VUO1xuICByZXR1cm4gTWF0aC5mbG9vcih5KTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBZIG9mZnNldCB3aXRoaW4gdGhlIHNoZWV0XG4gKi9cbnZhciBnZXRQZWdtYW5GcmFtZU9mZnNldFkgPSBmdW5jdGlvbiAoYW5pbWF0aW9uUm93KSB7XG4gIGFuaW1hdGlvblJvdyA9IGFuaW1hdGlvblJvdyB8fCAwO1xuICByZXR1cm4gYW5pbWF0aW9uUm93ICogTWF6ZS5QRUdNQU5fSEVJR0hUO1xufTtcblxuLyoqXG4gICogQ3JlYXRlIHNwcml0ZSBhc3NldHMgZm9yIHBlZ21hbi5cbiAgKiBAcGFyYW0gb3B0aW9ucyBTcGVjaWZ5IGRpZmZlcmVudCBmZWF0dXJlcyBvZiB0aGUgcGVnbWFuIGFuaW1hdGlvbi5cbiAgKiBpZFN0ciByZXF1aXJlZCBpZGVudGlmaWVyIGZvciB0aGUgcGVnbWFuLlxuICAqIHBlZ21hbkltYWdlIHJlcXVpcmVkIHdoaWNoIGltYWdlIHRvIHVzZSBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgKiBjb2wgd2hpY2ggY29sdW1uIHRoZSBwZWdtYW4gaXMgYXQuXG4gICogcm93IHdoaWNoIHJvdyB0aGUgcGVnbWFuIGlzIGF0LlxuICAqIGRpcmVjdGlvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHBlZ21hbiBpcyBmYWNpbmcgYXQuXG4gICogbnVtQ29sUGVnbWFuIG51bWJlciBvZiB0aGUgcGVnbWFuIGluIGVhY2ggcm93LCBkZWZhdWx0IGlzIDQuXG4gICogbnVtUm93UGVnbWFuIG51bWJlciBvZiB0aGUgcGVnbWFuIGluIGVhY2ggY29sdW1uLCBkZWZhdWx0IGlzIDEuXG4gICovXG52YXIgY3JlYXRlUGVnbWFuQW5pbWF0aW9uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcbiAgLy8gQ3JlYXRlIGNsaXAgcGF0aC5cbiAgdmFyIGNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnY2xpcFBhdGgnKTtcbiAgY2xpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgb3B0aW9ucy5pZFN0ciArICdQZWdtYW5DbGlwJyk7XG4gIHZhciByZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgb3B0aW9ucy5pZFN0ciArICdQZWdtYW5DbGlwUmVjdCcpO1xuICBpZiAob3B0aW9ucy5jb2wgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKCd4Jywgb3B0aW9ucy5jb2wgKiBNYXplLlNRVUFSRV9TSVpFICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUKTtcbiAgfVxuICBpZiAob3B0aW9ucy5yb3cgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKCd5JywgZ2V0UGVnbWFuWUZvclJvdyhvcHRpb25zLnJvdykpO1xuICB9XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIE1hemUuUEVHTUFOX1dJRFRIKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIE1hemUuUEVHTUFOX0hFSUdIVCk7XG4gIGNsaXAuYXBwZW5kQ2hpbGQocmVjdCk7XG4gIHN2Zy5hcHBlbmRDaGlsZChjbGlwKTtcbiAgLy8gQ3JlYXRlIGltYWdlLlxuICB2YXIgaW1nU3JjID0gb3B0aW9ucy5wZWdtYW5JbWFnZTtcbiAgdmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdpbWFnZScpO1xuICBpbWcuc2V0QXR0cmlidXRlTlMoXG4gICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaW1nU3JjKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgTWF6ZS5QRUdNQU5fSEVJR0hUICogKG9wdGlvbnMubnVtUm93UGVnbWFuIHx8IDEpKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBNYXplLlBFR01BTl9XSURUSCAqIChvcHRpb25zLm51bUNvbFBlZ21hbiB8fCA0KSk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoIycgKyBvcHRpb25zLmlkU3RyICsgJ1BlZ21hbkNsaXApJyk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2lkJywgb3B0aW9ucy5pZFN0ciArICdQZWdtYW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGltZyk7XG4gIC8vIFVwZGF0ZSBwZWdtYW4gaWNvbiAmIGNsaXAgcGF0aC5cbiAgaWYgKG9wdGlvbnMuY29sICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5kaXJlY3Rpb24gIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciB4ID0gTWF6ZS5TUVVBUkVfU0laRSAqIG9wdGlvbnMuY29sIC1cbiAgICAgIG9wdGlvbnMuZGlyZWN0aW9uICogTWF6ZS5QRUdNQU5fV0lEVEggKyAxICArIE1hemUuUEVHTUFOX1hfT0ZGU0VUO1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3gnLCB4KTtcbiAgfVxuICBpZiAob3B0aW9ucy5yb3cgIT09IHVuZGVmaW5lZCkge1xuICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3knLCBnZXRQZWdtYW5ZRm9yUm93KG9wdGlvbnMucm93KSk7XG4gIH1cbn07XG5cbi8qKlxuICAqIFVwZGF0ZSBzcHJpdGUgYXNzZXRzIGZvciBwZWdtYW4uXG4gICogQHBhcmFtIG9wdGlvbnMgU3BlY2lmeSBkaWZmZXJlbnQgZmVhdHVyZXMgb2YgdGhlIHBlZ21hbiBhbmltYXRpb24uXG4gICogaWRTdHIgcmVxdWlyZWQgaWRlbnRpZmllciBmb3IgdGhlIHBlZ21hbi5cbiAgKiBjb2wgcmVxdWlyZWQgd2hpY2ggY29sdW1uIHRoZSBwZWdtYW4gaXMgYXQuXG4gICogcm93IHJlcXVpcmVkIHdoaWNoIHJvdyB0aGUgcGVnbWFuIGlzIGF0LlxuICAqIGRpcmVjdGlvbiByZXF1aXJlZCB3aGljaCBkaXJlY3Rpb24gdGhlIHBlZ21hbiBpcyBmYWNpbmcgYXQuXG4gICogYW5pbWF0aW9uUm93IHdoaWNoIHJvdyBvZiB0aGUgc3ByaXRlIHNoZWV0IHRoZSBwZWdtYW4gYW5pbWF0aW9uIG5lZWRzXG4gICovXG52YXIgdXBkYXRlUGVnbWFuQW5pbWF0aW9uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgcmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuQ2xpcFJlY3QnKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCBvcHRpb25zLmNvbCAqIE1hemUuU1FVQVJFX1NJWkUgKyAxICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneScsIGdldFBlZ21hbllGb3JSb3cob3B0aW9ucy5yb3cpKTtcbiAgdmFyIGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbnMuaWRTdHIgKyAnUGVnbWFuJyk7XG4gIHZhciB4ID0gTWF6ZS5TUVVBUkVfU0laRSAqIG9wdGlvbnMuY29sIC1cbiAgICAgIG9wdGlvbnMuZGlyZWN0aW9uICogTWF6ZS5QRUdNQU5fV0lEVEggKyAxICsgTWF6ZS5QRUdNQU5fWF9PRkZTRVQ7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3gnLCB4KTtcbiAgdmFyIHkgPSBnZXRQZWdtYW5ZRm9yUm93KG9wdGlvbnMucm93KSAtIGdldFBlZ21hbkZyYW1lT2Zmc2V0WShvcHRpb25zLmFuaW1hdGlvblJvdyk7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3knLCB5KTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBtYXplIHRvIHRoZSBzdGFydCBwb3NpdGlvbiBhbmQga2lsbCBhbnkgcGVuZGluZyBhbmltYXRpb24gdGFza3MuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZpcnN0IFRydWUgaWYgYW4gb3BlbmluZyBhbmltYXRpb24gaXMgdG8gYmUgcGxheWVkLlxuICovXG5NYXplLnJlc2V0ID0gZnVuY3Rpb24oZmlyc3QpIHtcbiAgaWYgKE1hemUuYmVlKSB7XG4gICAgLy8gQmVlIG5lZWRzIHRvIHJlc2V0IGl0c2VsZiBhbmQgc3RpbGwgcnVuIHN0dWRpb0FwcC5yZXNldCBsb2dpY1xuICAgIE1hemUuYmVlLnJlc2V0KCk7XG4gIH1cblxuICB2YXIgaTtcbiAgLy8gS2lsbCBhbGwgdGFza3MuXG4gIHRpbWVvdXRMaXN0LmNsZWFyVGltZW91dHMoKTtcblxuICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcblxuICAvLyBNb3ZlIFBlZ21hbiBpbnRvIHBvc2l0aW9uLlxuICBNYXplLnBlZ21hblggPSBNYXplLnN0YXJ0Xy54O1xuICBNYXplLnBlZ21hblkgPSBNYXplLnN0YXJ0Xy55O1xuXG4gIE1hemUucGVnbWFuRCA9IE1hemUuc3RhcnREaXJlY3Rpb247XG4gIGlmIChmaXJzdCkge1xuICAgIC8vIERhbmNlIGNvbnNpc3RzIG9mIDUgYW5pbWF0aW9ucywgZWFjaCBvZiB3aGljaCBnZXQgMTUwbXNcbiAgICB2YXIgZGFuY2VUaW1lID0gMTUwICogNTtcbiAgICBpZiAoc2tpbi5kYW5jZU9uTG9hZCkge1xuICAgICAgc2NoZWR1bGVEYW5jZShmYWxzZSwgZGFuY2VUaW1lKTtcbiAgICB9XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHN0ZXBTcGVlZCA9IDEwMDtcbiAgICAgIE1hemUuc2NoZWR1bGVUdXJuKE1hemUuc3RhcnREaXJlY3Rpb24pO1xuICAgIH0sIGRhbmNlVGltZSArIDE1MCk7XG4gIH0gZWxzZSB7XG4gICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKE1hemUucGVnbWFuRCkpO1xuICB9XG5cbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG5cbiAgdmFyIGZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluaXNoJyk7XG4gIGlmIChmaW5pc2hJY29uKSB7XG4gICAgLy8gTW92ZSB0aGUgZmluaXNoIGljb24gaW50byBwb3NpdGlvbi5cbiAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZSgneCcsIE1hemUuU1FVQVJFX1NJWkUgKiAoTWF6ZS5maW5pc2hfLnggKyAwLjUpIC1cbiAgICAgIGZpbmlzaEljb24uZ2V0QXR0cmlidXRlKCd3aWR0aCcpIC8gMik7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLCBNYXplLlNRVUFSRV9TSVpFICogKE1hemUuZmluaXNoXy55ICsgMC45KSAtXG4gICAgICBmaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICBza2luLmdvYWxJZGxlKTtcbiAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIH1cblxuICAvLyBNYWtlICdsb29rJyBpY29uIGludmlzaWJsZSBhbmQgcHJvbW90ZSB0byB0b3AuXG4gIHZhciBsb29rSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb29rJyk7XG4gIGxvb2tJY29uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGxvb2tJY29uLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobG9va0ljb24pO1xuICB2YXIgcGF0aHMgPSBsb29rSWNvbi5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGF0aCcpO1xuICBmb3IgKGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0aCA9IHBhdGhzW2ldO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKCdzdHJva2UnLCBza2luLmxvb2spO1xuICB9XG5cbiAgLy8gUmVzZXQgcGVnbWFuJ3MgdmlzaWJpbGl0eS5cbiAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMSk7XG5cbiAgaWYgKHNraW4uaWRsZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgIHZhciBpZGxlUGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZGxlUGVnbWFuJyk7XG4gICAgaWRsZVBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgfSBlbHNlIHtcbiAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIH1cblxuICBpZiAoc2tpbi53YWxsUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgdmFyIHdhbGxQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dhbGxQZWdtYW4nKTtcbiAgICB3YWxsUGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICBpZiAoc2tpbi5tb3ZlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgdmFyIG1vdmVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vdmVQZWdtYW4nKTtcbiAgICBtb3ZlUGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICBpZiAoc2tpbi5jZWxlYnJhdGVBbmltYXRpb24pIHtcbiAgICB2YXIgY2VsZWJyYXRlQW5pbWF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NlbGVicmF0ZVBlZ21hbicpO1xuICAgIGNlbGVicmF0ZUFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICAvLyBNb3ZlIHRoZSBpbml0IGRpcnQgbWFya2VyIGljb25zIGludG8gcG9zaXRpb24uXG4gIE1hemUubWFwLnJlc2V0RGlydCgpO1xuICByZXNldERpcnRJbWFnZXMoZmFsc2UpO1xuXG4gIC8vIFJlc2V0IHRoZSBvYnN0YWNsZSBpbWFnZS5cbiAgdmFyIG9ic0lkID0gMDtcbiAgdmFyIHgsIHk7XG4gIGZvciAoeSA9IDA7IHkgPCBNYXplLm1hcC5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHggPSAwOyB4IDwgTWF6ZS5tYXAuQ09MUzsgeCsrKSB7XG4gICAgICB2YXIgb2JzSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnN0YWNsZScgKyBvYnNJZCk7XG4gICAgICBpZiAob2JzSWNvbikge1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4ub2JzdGFjbGVJZGxlKTtcbiAgICAgIH1cbiAgICAgICsrb2JzSWQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgIE1hemUud29yZFNlYXJjaC5yZXNldFRpbGVzKCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzZXRUaWxlcygpO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZXNldFRpbGVzKCkge1xuICAvLyBSZXNldCB0aGUgdGlsZXNcbiAgdmFyIHRpbGVJZCA9IDA7XG4gIGZvciAodmFyIHkgPSAwOyB5IDwgTWF6ZS5tYXAuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBNYXplLm1hcC5DT0xTOyB4KyspIHtcbiAgICAgIC8vIFRpbGUncyBjbGlwUGF0aCBlbGVtZW50LlxuICAgICAgdmFyIHRpbGVDbGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQpO1xuICAgICAgdGlsZUNsaXAuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi50aWxlcyk7XG4gICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxKTtcbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbi8vIFhYWCBUaGlzIGlzIHRoZSBvbmx5IG1ldGhvZCB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZXMhXG5NYXplLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0ZXBCdXR0b24nKTtcbiAgaWYgKHN0ZXBCdXR0b24pIHtcbiAgICBzdGVwQnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gIH1cbiAgTWF6ZS5leGVjdXRlKGZhbHNlKTtcbn07XG5cbmZ1bmN0aW9uIGJlZ2luQXR0ZW1wdCAoKSB7XG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgaWYgKHN0dWRpb0FwcC5pc1VzaW5nQmxvY2tseSgpKSB7XG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICB9XG4gIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyByZXNldCBidXR0b24gY2xpY2sgbG9naWMuICBzdHVkaW9BcHAucmVzZXRCdXR0b25DbGljayB3aWxsIGJlXG4gKiBjYWxsZWQgZmlyc3QuXG4gKi9cbk1hemUucmVzZXRCdXR0b25DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RlcEJ1dHRvbicpO1xuICBzdGVwQnV0dG9uLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcblxuICByZWVuYWJsZUNhY2hlZEJsb2NrU3RhdGVzKCk7XG59O1xuXG5mdW5jdGlvbiByZWVuYWJsZUNhY2hlZEJsb2NrU3RhdGVzICgpIHtcbiAgaWYgKE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMpIHtcbiAgICAvLyByZXN0b3JlIG1vdmVhYmxlL2RlbGV0YWJsZS9lZGl0YWJsZSBzdGF0ZSBmcm9tIGJlZm9yZSB3ZSBzdGFydGVkIHN0ZXBwaW5nXG4gICAgTWF6ZS5jYWNoZWRCbG9ja1N0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWNoZWQpIHtcbiAgICAgIGNhY2hlZC5ibG9jay5zZXRNb3ZhYmxlKGNhY2hlZC5tb3ZhYmxlKTtcbiAgICAgIGNhY2hlZC5ibG9jay5zZXREZWxldGFibGUoY2FjaGVkLmRlbGV0YWJsZSk7XG4gICAgICBjYWNoZWQuYmxvY2suc2V0RWRpdGFibGUoY2FjaGVkLmVkaXRhYmxlKTtcbiAgICB9KTtcbiAgICBNYXplLmNhY2hlZEJsb2NrU3RhdGVzID0gW107XG4gIH1cbn1cblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbnZhciBkaXNwbGF5RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKE1hemUud2FpdGluZ0ZvclJlcG9ydCB8fCBNYXplLmFuaW1hdGluZ18pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgYXBwOiAnbWF6ZScsIC8vWFhYXG4gICAgc2tpbjogc2tpbi5pZCxcbiAgICBmZWVkYmFja1R5cGU6IE1hemUudGVzdFJlc3VsdHMsXG4gICAgcmVzcG9uc2U6IE1hemUucmVzcG9uc2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH07XG4gIC8vIElmIHRoZXJlIHdhcyBhbiBhcHAtc3BlY2lmaWMgZXJyb3IgKGN1cnJlbnRseSBvbmx5IHBvc3NpYmxlIGZvciBCZWUpLFxuICAvLyBhZGQgaXQgdG8gdGhlIG9wdGlvbnMgcGFzc2VkIHRvIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soKS5cbiAgaWYgKE1hemUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMICYmXG4gICAgICBNYXplLmJlZSkge1xuICAgIHZhciBtZXNzYWdlID0gTWF6ZS5iZWUuZ2V0TWVzc2FnZShNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRpb25WYWx1ZSgpKTtcbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgb3B0aW9ucy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gIH1cbiAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayhvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbk1hemUub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIE1hemUucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgTWF6ZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59O1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcywgcGFzc3Rocm91Z2ggdG8gbGV2ZWwtc3BlY2lmaWMgaGFzTXVsdGlwbGVQb3NzaWJsZUdyaWRzXG4gKiBjYWxsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5NYXplLmhhc011bHRpcGxlUG9zc2libGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE1hemUuYmVlICYmIE1hemUuYmVlLmhhc011bHRpcGxlUG9zc2libGVHcmlkcygpO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgYmFzaWMgaW5pdGlhbGl6YXRpb24vcmVzZXR0aW5nIG9wZXJhdGlvbnMgYmVmb3JlXG4gKiBleGVjdXRpb24uIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIGlkZW1wb3RlbnQsIGFzIGl0IGNhbiBiZSBjYWxsZWRcbiAqIGR1cmluZyBleGVjdXRpb24gd2hlbiBydW5uaW5nIG11bHRpcGxlIHRyaWFscy5cbiAqL1xuTWF6ZS5wcmVwYXJlRm9yRXhlY3V0aW9uID0gZnVuY3Rpb24gKCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8gPSBuZXcgRXhlY3V0aW9uSW5mbyh7dGlja3M6IDEwMH0pO1xuICBNYXplLnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIE1hemUudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIE1hemUud2FpdGluZ0ZvclJlcG9ydCA9IGZhbHNlO1xuICBNYXplLmFuaW1hdGluZ18gPSBmYWxzZTtcbiAgTWF6ZS5yZXNwb25zZSA9IG51bGw7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuTWF6ZS5leGVjdXRlID0gZnVuY3Rpb24oc3RlcE1vZGUpIHtcbiAgYmVnaW5BdHRlbXB0KCk7XG4gIE1hemUucHJlcGFyZUZvckV4ZWN1dGlvbigpO1xuXG5cbiAgdmFyIGNvZGU7XG4gIGlmIChzdHVkaW9BcHAuaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0Jyk7XG4gIH0gZWxzZSB7XG4gICAgY29kZSA9IGRyb3BsZXRVdGlscy5nZW5lcmF0ZUNvZGVBbGlhc2VzKGRyb3BsZXRDb25maWcsICdNYXplJyk7XG4gICAgY29kZSArPSBzdHVkaW9BcHAuZWRpdG9yLmdldFZhbHVlKCk7XG4gIH1cblxuICAvLyBUcnkgcnVubmluZyB0aGUgdXNlcidzIGNvZGUuICBUaGVyZSBhcmUgYSBmZXcgcG9zc2libGUgb3V0Y29tZXM6XG4gIC8vIDEuIElmIHBlZ21hbiByZWFjaGVzIHRoZSBmaW5pc2ggW1NVQ0NFU1NdLCBleGVjdXRpb25JbmZvJ3MgdGVybWluYXRpb25cbiAgLy8gICAgdmFsdWUgaXMgc2V0IHRvIHRydWUuXG4gIC8vIDIuIElmIHRoZSBwcm9ncmFtIGlzIHRlcm1pbmF0ZWQgZHVlIHRvIHJ1bm5pbmcgdG9vIGxvbmcgW1RJTUVPVVRdLFxuICAvLyAgICB0aGUgdGVybWluYXRpb24gdmFsdWUgaXMgc2V0IHRvIEluZmluaXR5XG4gIC8vIDMuIElmIHRoZSBwcm9ncmFtIHRlcm1pbmF0ZWQgYmVjYXVzZSBvZiBoaXR0aW5nIGEgd2FsbC9vYnN0YWNsZSwgdGhlXG4gIC8vICAgIHRlcm1pbmF0aW9uIHZhbHVlIGlzIHNldCB0byBmYWxzZSBhbmQgdGhlIFJlc3VsdFR5cGUgaXMgRVJST1JcbiAgLy8gNC4gSWYgdGhlIHByb2dyYW0gZmluaXNoZXMgd2l0aG91dCBtZWV0aW5nIHN1Y2Nlc3MgY29uZGl0aW9uLCB3ZSBoYXZlIG5vXG4gIC8vICAgIHRlcm1pbmF0aW9uIHZhbHVlIGFuZCBzZXQgUmVzdWx0VHlwZSB0byBGQUlMVVJFXG4gIC8vIDUuIFRoZSBvbmx5IG90aGVyIHRpbWUgd2Ugc2hvdWxkIGZhaWwgc2hvdWxkIGJlIGlmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd25cbiAgLy8gICAgZHVyaW5nIGV4ZWN1dGlvbiwgaW4gd2hpY2ggY2FzZSB3ZSBzZXQgUmVzdWx0VHlwZSB0byBFUlJPUi5cbiAgLy8gVGhlIGFuaW1hdGlvbiBzaG91bGQgYmUgZmFzdCBpZiBleGVjdXRpb24gd2FzIHN1Y2Nlc3NmdWwsIHNsb3cgb3RoZXJ3aXNlXG4gIC8vIHRvIGhlbHAgdGhlIHVzZXIgc2VlIHRoZSBtaXN0YWtlLlxuICBzdHVkaW9BcHAucGxheUF1ZGlvKCdzdGFydCcpO1xuICB0cnkge1xuICAgIC8vIGRvbid0IGJvdGhlciBydW5uaW5nIGNvZGUgaWYgd2UncmUganVzdCBlZGl0dGluZyByZXF1aXJlZCBibG9ja3MuIGFsbFxuICAgIC8vIHdlIGNhcmUgYWJvdXQgaXMgdGhlIGNvbnRlbnRzIG9mIHJlcG9ydC5cbiAgICB2YXIgcnVuQ29kZSA9ICFsZXZlbC5lZGl0X2Jsb2NrcztcblxuICAgIGlmIChydW5Db2RlKSB7XG4gICAgICBpZiAoTWF6ZS5oYXNNdWx0aXBsZVBvc3NpYmxlR3JpZHMoKSkge1xuICAgICAgICAvLyBJZiB0aGlzIGxldmVsIGlzIGEgQmVlIGxldmVsIHdpdGggbXVsdGlwbGUgcG9zc2libGUgZ3JpZHMsIHdlXG4gICAgICAgIC8vIG5lZWQgdG8gcnVuIGFnYWluc3QgYWxsIGdyaWRzIGFuZCBzb3J0IHRoZW0gaW50byBzdWNjZXNzZXNcbiAgICAgICAgLy8gYW5kIGZhaWx1cmVzXG4gICAgICAgIHZhciBzdWNjZXNzZXMgPSBbXTtcbiAgICAgICAgdmFyIGZhaWx1cmVzID0gW107XG5cbiAgICAgICAgTWF6ZS5iZWUuc3RhdGljR3JpZHMuZm9yRWFjaChmdW5jdGlvbihncmlkLCBpKSB7XG4gICAgICAgICAgTWF6ZS5iZWUudXNlR3JpZFdpdGhJZChpKTtcblxuICAgICAgICAgIC8vIFJ1biB0cmlhbFxuICAgICAgICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICBNYXplOiBhcGksXG4gICAgICAgICAgICBleGVjdXRpb25JbmZvOiBNYXplLmV4ZWN1dGlvbkluZm9cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFNvcnQgc3RhdGljIGdyaWRzIGJhc2VkIG9uIHRyaWFsIHJlc3VsdFxuICAgICAgICAgIE1hemUub25FeGVjdXRpb25GaW5pc2goKTtcbiAgICAgICAgICBpZiAoTWF6ZS5leGVjdXRpb25JbmZvLnRlcm1pbmF0aW9uVmFsdWUoKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc3VjY2Vzc2VzLnB1c2goaSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZhaWx1cmVzLnB1c2goaSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVzZXQgZm9yIG5leHQgdHJpYWxcbiAgICAgICAgICBNYXplLmdyaWRJdGVtRHJhd2VyLnJlc2V0Q2xvdWRlZCgpO1xuICAgICAgICAgIE1hemUucHJlcGFyZUZvckV4ZWN1dGlvbigpO1xuICAgICAgICAgIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29kZSBuZWVkcyB0byBzdWNjZWVkIGFnYWluc3QgYWxsIHBvc3NpYmxlIGdyaWRzXG4gICAgICAgIC8vIHRvIGJlIGNvbnNpZGVyZWQgYWN0dWFsbHkgc3VjY2Vzc2Z1bDsgaWYgdGhlcmUgYXJlIGFueVxuICAgICAgICAvLyBmYWlsdXJlcywgcmFuZG9tbHkgc2VsZWN0IG9uZSBvZiB0aGUgZmFpbGluZyBncmlkcyB0byBiZSB0aGVcbiAgICAgICAgLy8gXCJyZWFsXCIgc3RhdGUgb2YgdGhlIG1hcC4gSWYgYWxsIGdyaWRzIGFyZSBzdWNjZXNzZnVsLFxuICAgICAgICAvLyByYW5kb21seSBzZWxlY3QgYW55IG9uZSBvZiB0aGVtLlxuICAgICAgICB2YXIgaSA9IChmYWlsdXJlcy5sZW5ndGggPiAwKSA/IF8uc2FtcGxlKGZhaWx1cmVzKSA6IF8uc2FtcGxlKHN1Y2Nlc3Nlcyk7XG4gICAgICAgIE1hemUuYmVlLnVzZUdyaWRXaXRoSWQoaSk7XG4gICAgICB9XG5cbiAgICAgIGNvZGVnZW4uZXZhbFdpdGgoY29kZSwge1xuICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgTWF6ZTogYXBpLFxuICAgICAgICBleGVjdXRpb25JbmZvOiBNYXplLmV4ZWN1dGlvbkluZm9cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIE1hemUub25FeGVjdXRpb25GaW5pc2goKTtcblxuICAgIHN3aXRjaCAoTWF6ZS5leGVjdXRpb25JbmZvLnRlcm1pbmF0aW9uVmFsdWUoKSkge1xuICAgICAgY2FzZSBudWxsOlxuICAgICAgICAvLyBkaWRuJ3QgdGVybWluYXRlXG4gICAgICAgIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignZmluaXNoJywgbnVsbCk7XG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgICAgICBzdGVwU3BlZWQgPSAxNTA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBJbmZpbml0eTpcbiAgICAgICAgLy8gRGV0ZWN0ZWQgYW4gaW5maW5pdGUgbG9vcC4gIEFuaW1hdGUgd2hhdCB3ZSBoYXZlIGFzIHF1aWNrbHkgYXNcbiAgICAgICAgLy8gcG9zc2libGVcbiAgICAgICAgTWF6ZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlRJTUVPVVQ7XG4gICAgICAgIHN0ZXBTcGVlZCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgICBNYXplLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICAgICAgc3RlcFNwZWVkID0gMTAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZmFsc2U6XG4gICAgICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5FUlJPUjtcbiAgICAgICAgc3RlcFNwZWVkID0gMTUwO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEFwcC1zcGVjaWZpYyBmYWlsdXJlLlxuICAgICAgICBNYXplLnJlc3VsdCA9IFJlc3VsdFR5cGUuRVJST1I7XG4gICAgICAgIGlmIChNYXplLmJlZSkge1xuICAgICAgICAgIE1hemUudGVzdFJlc3VsdHMgPSBNYXplLmJlZS5nZXRUZXN0UmVzdWx0cyhcbiAgICAgICAgICAgIE1hemUuZXhlY3V0aW9uSW5mby50ZXJtaW5hdGlvblZhbHVlKCkpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIFN5bnRheCBlcnJvciwgY2FuJ3QgaGFwcGVuLlxuICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5FUlJPUjtcbiAgICBjb25zb2xlLmVycm9yKFwiVW5leHBlY3RlZCBleGNlcHRpb246IFwiICsgZSArIFwiXFxuXCIgKyBlLnN0YWNrKTtcbiAgICAvLyBjYWxsIHdpbmRvdy5vbmVycm9yIHNvIHRoYXQgd2UgZ2V0IG5ldyByZWxpYyBjb2xsZWN0aW9uLiAgcHJlcGVuZCB3aXRoXG4gICAgLy8gVXNlckNvZGUgc28gdGhhdCBpdCdzIGNsZWFyIHRoaXMgaXMgaW4gZXZhbCdlZCBjb2RlLlxuICAgIGlmICh3aW5kb3cub25lcnJvcikge1xuICAgICAgd2luZG93Lm9uZXJyb3IoXCJVc2VyQ29kZTpcIiArIGUubWVzc2FnZSwgZG9jdW1lbnQuVVJMLCAwKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgd2Uga25vdyB0aGV5IHN1Y2NlZWRlZCwgbWFyayBsZXZlbENvbXBsZXRlIHRydWVcbiAgLy8gTm90ZSB0aGF0IHdlIGhhdmUgbm90IHlldCBhbmltYXRlZCB0aGUgc3VjY2Vzc2Z1bCBydW5cbiAgdmFyIGxldmVsQ29tcGxldGUgPSAoTWF6ZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG5cbiAgLy8gU2V0IHRlc3RSZXN1bHRzIHVubGVzcyBhcHAtc3BlY2lmaWMgcmVzdWx0cyB3ZXJlIHNldCBpbiB0aGUgZGVmYXVsdFxuICAvLyBicmFuY2ggb2YgdGhlIGFib3ZlIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIGlmIChNYXplLnRlc3RSZXN1bHRzID09PSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU4pIHtcbiAgICBNYXplLnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuICB9XG5cbiAgdmFyIHByb2dyYW07XG4gIGlmIChsZXZlbC5lZGl0Q29kZSkge1xuICAgIC8vIElmIHdlIHdhbnQgdG8gXCJub3JtYWxpemVcIiB0aGUgSmF2YVNjcmlwdCB0byBhdm9pZCBwcm9saWZlcmF0aW9uIG9mIG5lYXJseVxuICAgIC8vIGlkZW50aWNhbCB2ZXJzaW9ucyBvZiB0aGUgY29kZSBvbiB0aGUgc2VydmljZSwgd2UgY291bGQgZG8gZWl0aGVyIG9mIHRoZXNlOlxuXG4gICAgLy8gZG8gYW4gYWNvcm4ucGFyc2UgYW5kIHRoZW4gdXNlIGVzY29kZWdlbiB0byBnZW5lcmF0ZSBiYWNrIGEgXCJjbGVhblwiIHZlcnNpb25cbiAgICAvLyBvciBtaW5pZnkgKHVnbGlmeWpzKSBhbmQgdGhhdCBvciBqcy1iZWF1dGlmeSB0byByZXN0b3JlIGEgXCJjbGVhblwiIHZlcnNpb25cblxuICAgIHByb2dyYW0gPSBzdHVkaW9BcHAuZWRpdG9yLmdldFZhbHVlKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgICBwcm9ncmFtID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG4gIH1cblxuICBNYXplLndhaXRpbmdGb3JSZXBvcnQgPSB0cnVlO1xuXG4gIC8vIFJlcG9ydCByZXN1bHQgdG8gc2VydmVyLlxuICBzdHVkaW9BcHAucmVwb3J0KHtcbiAgICBhcHA6ICdtYXplJyxcbiAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgcmVzdWx0OiBNYXplLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTLFxuICAgIHRlc3RSZXN1bHQ6IE1hemUudGVzdFJlc3VsdHMsXG4gICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHByb2dyYW0pLFxuICAgIG9uQ29tcGxldGU6IE1hemUub25SZXBvcnRDb21wbGV0ZVxuICB9KTtcblxuICAvLyBNYXplLiBub3cgY29udGFpbnMgYSB0cmFuc2NyaXB0IG9mIGFsbCB0aGUgdXNlcidzIGFjdGlvbnMuXG4gIC8vIFJlc2V0IHRoZSBtYXplIGFuZCBhbmltYXRlIHRoZSB0cmFuc2NyaXB0LlxuICBzdHVkaW9BcHAucmVzZXQoZmFsc2UpO1xuICByZXNldERpcnRJbWFnZXModHJ1ZSk7XG5cbiAgLy8gaWYgd2UgaGF2ZSBleHRyYSB0b3AgYmxvY2tzLCBkb24ndCBldmVuIGJvdGhlciBhbmltYXRpbmdcbiAgaWYgKE1hemUudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkVYVFJBX1RPUF9CTE9DS1NfRkFJTCkge1xuICAgIE1hemUucmVzdWx0ID0gUmVzdWx0VHlwZS5FUlJPUjtcbiAgICBkaXNwbGF5RmVlZGJhY2soKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBNYXplLmFuaW1hdGluZ18gPSB0cnVlO1xuXG4gIGlmIChzdHVkaW9BcHAuaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgIC8vIERpc2FibGUgdG9vbGJveCB3aGlsZSBydW5uaW5nXG4gICAgQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5zZXRFbmFibGVUb29sYm94KGZhbHNlKTtcblxuICAgIGlmIChzdGVwTW9kZSkge1xuICAgICAgaWYgKE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBjYWNoZWRCbG9ja1N0YXRlcycpO1xuICAgICAgfVxuICAgICAgLy8gRGlzYWJsZSBhbGwgYmxvY2tzLCBjYWNoaW5nIHRoZWlyIHN0YXRlIGZpcnN0XG4gICAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldEFsbEJsb2NrcygpLmZvckVhY2goZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgICAgIE1hemUuY2FjaGVkQmxvY2tTdGF0ZXMucHVzaCh7XG4gICAgICAgICAgYmxvY2s6IGJsb2NrLFxuICAgICAgICAgIG1vdmFibGU6IGJsb2NrLmlzTW92YWJsZSgpLFxuICAgICAgICAgIGRlbGV0YWJsZTogYmxvY2suaXNEZWxldGFibGUoKSxcbiAgICAgICAgICBlZGl0YWJsZTogYmxvY2suaXNFZGl0YWJsZSgpXG4gICAgICAgIH0pO1xuICAgICAgICBibG9jay5zZXRNb3ZhYmxlKGZhbHNlKTtcbiAgICAgICAgYmxvY2suc2V0RGVsZXRhYmxlKGZhbHNlKTtcbiAgICAgICAgYmxvY2suc2V0RWRpdGFibGUoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVtb3ZpbmcgdGhlIGlkbGUgYW5pbWF0aW9uIGFuZCByZXBsYWNlIHdpdGggcGVnbWFuIHNwcml0ZVxuICBpZiAoc2tpbi5pZGxlUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gICAgdmFyIGlkbGVQZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lkbGVQZWdtYW4nKTtcbiAgICBpZGxlUGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICB9XG5cbiAgLy8gU3BlZWRpbmcgdXAgc3BlY2lmaWMgbGV2ZWxzXG4gIHZhciBzY2FsZWRTdGVwU3BlZWQgPSBzdGVwU3BlZWQgKiBNYXplLnNjYWxlLnN0ZXBTcGVlZCAqXG4gIHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvblNwZWVkU2NhbGU7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIE1hemUuc2NoZWR1bGVBbmltYXRpb25zKHN0ZXBNb2RlKTtcbiAgfSwgc2NhbGVkU3RlcFNwZWVkKTtcbn07XG5cbi8qKlxuICogUGVyZm9ybSBvdXIgYW5pbWF0aW9ucywgZWl0aGVyIGFsbCBvZiB0aGVtIG9yIHRob3NlIG9mIGEgc2luZ2xlIHN0ZXBcbiAqL1xuTWF6ZS5zY2hlZHVsZUFuaW1hdGlvbnMgPSBmdW5jdGlvbiAoc2luZ2xlU3RlcCkge1xuICB2YXIgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGVwQnV0dG9uJyk7XG5cbiAgdGltZW91dExpc3QuY2xlYXJUaW1lb3V0cygpO1xuXG4gIHZhciB0aW1lUGVyQWN0aW9uID0gc3RlcFNwZWVkICogTWF6ZS5zY2FsZS5zdGVwU3BlZWQgKlxuICAgIHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvblNwZWVkU2NhbGU7XG4gIC8vIGdldCBhIGZsYXQgbGlzdCBvZiBhY3Rpb25zIHdlIHdhbnQgdG8gc2NoZWR1bGVcbiAgdmFyIGFjdGlvbnMgPSBNYXplLmV4ZWN1dGlvbkluZm8uZ2V0QWN0aW9ucyhzaW5nbGVTdGVwKTtcblxuICBzY2hlZHVsZVNpbmdsZUFuaW1hdGlvbigwKTtcblxuICAvLyBzY2hlZHVsZSBhbmltYXRpb25zIGluIHNlcXVlbmNlXG4gIC8vIFRoZSByZWFzb24gd2UgZG8gdGhpcyByZWN1cnNpdmVseSBpbnN0ZWFkIG9mIGl0ZXJhdGl2ZWx5IGlzIHRoYXQgd2Ugd2FudCB0b1xuICAvLyBlbnN1cmUgdGhhdCB3ZSBmaW5pc2ggc2NoZWR1bGluZyBhY3Rpb24xIGJlZm9yZSBzdGFydGluZyB0byBzY2hlZHVsZVxuICAvLyBhY3Rpb24yLiBPdGhlcndpc2Ugd2UgZ2V0IGludG8gdHJvdWJsZSB3aGVuIHN0ZXBTcGVlZCBpcyAwLlxuICBmdW5jdGlvbiBzY2hlZHVsZVNpbmdsZUFuaW1hdGlvbiAoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPj0gYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGZpbmlzaEFuaW1hdGlvbnMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhbmltYXRlQWN0aW9uKGFjdGlvbnNbaW5kZXhdLCBzaW5nbGVTdGVwLCB0aW1lUGVyQWN0aW9uKTtcblxuICAgIHZhciBjb21tYW5kID0gYWN0aW9uc1tpbmRleF0gJiYgYWN0aW9uc1tpbmRleF0uY29tbWFuZDtcbiAgICB2YXIgdGltZU1vZGlmaWVyID0gKHNraW4uYWN0aW9uU3BlZWRTY2FsZSAmJiBza2luLmFjdGlvblNwZWVkU2NhbGVbY29tbWFuZF0pIHx8IDE7XG4gICAgdmFyIHRpbWVGb3JUaGlzQWN0aW9uID0gTWF0aC5yb3VuZCh0aW1lUGVyQWN0aW9uICogdGltZU1vZGlmaWVyKTtcblxuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBzY2hlZHVsZVNpbmdsZUFuaW1hdGlvbihpbmRleCArIDEpO1xuICAgIH0sIHRpbWVGb3JUaGlzQWN0aW9uKTtcbiAgfVxuXG4gIC8vIE9uY2UgYW5pbWF0aW9ucyBhcmUgY29tcGxldGUsIHdlIHdhbnQgdG8gcmVlbmFibGUgdGhlIHN0ZXAgYnV0dG9uIGlmIHdlXG4gIC8vIGhhdmUgc3RlcHMgbGVmdCwgb3RoZXJ3aXNlIHdlJ3JlIGRvbmUgd2l0aCB0aGlzIGV4ZWN1dGlvbi5cbiAgZnVuY3Rpb24gZmluaXNoQW5pbWF0aW9ucygpIHtcbiAgICB2YXIgc3RlcHNSZW1haW5pbmcgPSBNYXplLmV4ZWN1dGlvbkluZm8uc3RlcHNSZW1haW5pbmcoKTtcblxuICAgIC8vIGFsbG93IHRpbWUgZm9yICBhZGRpdGlvbmFsIHBhdXNlIGlmIHdlJ3JlIGNvbXBsZXRlbHkgZG9uZVxuICAgIHZhciB3YWl0VGltZSA9IChzdGVwc1JlbWFpbmluZyA/IDAgOiAxMDAwKTtcblxuICAgIC8vIHJ1biBhZnRlciBhbGwgYW5pbWF0aW9uc1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHN0ZXBzUmVtYWluaW5nKSB7XG4gICAgICAgIHN0ZXBCdXR0b24ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgTWF6ZS5hbmltYXRpbmdfID0gZmFsc2U7XG4gICAgICAgIGlmIChzdHVkaW9BcHAuaXNVc2luZ0Jsb2NrbHkoKSkge1xuICAgICAgICAgIC8vIHJlZW5hYmxlIHRvb2xib3hcbiAgICAgICAgICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlRWRpdG9yLnNldEVuYWJsZVRvb2xib3godHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgc3RlcHBpbmcgYW5kIHdlIGZhaWxlZCwgd2Ugd2FudCB0byByZXRhaW4gaGlnaGxpZ2h0aW5nIHVudGlsXG4gICAgICAgIC8vIGNsaWNraW5nIHJlc2V0LiAgT3RoZXJ3aXNlIHdlIGNhbiBjbGVhciBoaWdobGlnaHRpbmcvZGlzYWJsZWRcbiAgICAgICAgLy8gYmxvY2tzIG5vd1xuICAgICAgICBpZiAoIXNpbmdsZVN0ZXAgfHwgTWF6ZS5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUykge1xuICAgICAgICAgIHJlZW5hYmxlQ2FjaGVkQmxvY2tTdGF0ZXMoKTtcbiAgICAgICAgICBzdHVkaW9BcHAuY2xlYXJIaWdobGlnaHRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBkaXNwbGF5RmVlZGJhY2soKTtcbiAgICAgIH1cbiAgICB9LCB3YWl0VGltZSk7XG4gIH1cbn07XG5cbi8qKlxuICogQW5pbWF0ZXMgYSBzaW5nbGUgYWN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIFRoZSBhY3Rpb24gdG8gYW5pbWF0ZVxuICogQHBhcmFtIHtib29sZWFufSBzcG90bGlnaHRCbG9ja3MgV2hldGhlciBvciBub3Qgd2Ugc2hvdWxkIGhpZ2hsaWdodCBlbnRpcmUgYmxvY2tzXG4gKiBAcGFyYW0ge2ludGVnZXJ9IHRpbWVQZXJTdGVwIEhvdyBtdWNoIHRpbWUgd2UgaGF2ZSBhbGxvY2F0ZWQgYmVmb3JlIHRoZSBuZXh0IHN0ZXBcbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZUFjdGlvbiAoYWN0aW9uLCBzcG90bGlnaHRCbG9ja3MsIHRpbWVQZXJTdGVwKSB7XG4gIGlmIChhY3Rpb24uYmxvY2tJZCkge1xuICAgIHN0dWRpb0FwcC5oaWdobGlnaHQoU3RyaW5nKGFjdGlvbi5ibG9ja0lkKSwgc3BvdGxpZ2h0QmxvY2tzKTtcbiAgfVxuXG4gIHN3aXRjaCAoYWN0aW9uLmNvbW1hbmQpIHtcbiAgICBjYXNlICdub3J0aCc6XG4gICAgICBhbmltYXRlZE1vdmUoRGlyZWN0aW9uLk5PUlRILCB0aW1lUGVyU3RlcCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlYXN0JzpcbiAgICAgIGFuaW1hdGVkTW92ZShEaXJlY3Rpb24uRUFTVCwgdGltZVBlclN0ZXApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc291dGgnOlxuICAgICAgYW5pbWF0ZWRNb3ZlKERpcmVjdGlvbi5TT1VUSCwgdGltZVBlclN0ZXApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd2VzdCc6XG4gICAgICBhbmltYXRlZE1vdmUoRGlyZWN0aW9uLldFU1QsIHRpbWVQZXJTdGVwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfbm9ydGgnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUxvb2soRGlyZWN0aW9uLk5PUlRIKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvb2tfZWFzdCc6XG4gICAgICBNYXplLnNjaGVkdWxlTG9vayhEaXJlY3Rpb24uRUFTVCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb29rX3NvdXRoJzpcbiAgICAgIE1hemUuc2NoZWR1bGVMb29rKERpcmVjdGlvbi5TT1VUSCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb29rX3dlc3QnOlxuICAgICAgTWF6ZS5zY2hlZHVsZUxvb2soRGlyZWN0aW9uLldFU1QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmFpbF9mb3J3YXJkJzpcbiAgICAgIE1hemUuc2NoZWR1bGVGYWlsKHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmFpbF9iYWNrd2FyZCc6XG4gICAgICBNYXplLnNjaGVkdWxlRmFpbChmYWxzZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHZhciBuZXdEaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQgKyBUdXJuRGlyZWN0aW9uLkxFRlQ7XG4gICAgICBNYXplLnNjaGVkdWxlVHVybihuZXdEaXJlY3Rpb24pO1xuICAgICAgTWF6ZS5wZWdtYW5EID0gdGlsZXMuY29uc3RyYWluRGlyZWN0aW9uNChuZXdEaXJlY3Rpb24pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgbmV3RGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EICsgVHVybkRpcmVjdGlvbi5SSUdIVDtcbiAgICAgIE1hemUuc2NoZWR1bGVUdXJuKG5ld0RpcmVjdGlvbik7XG4gICAgICBNYXplLnBlZ21hbkQgPSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KG5ld0RpcmVjdGlvbik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmaW5pc2gnOlxuICAgICAgLy8gT25seSBzY2hlZHVsZSB2aWN0b3J5IGFuaW1hdGlvbiBmb3IgY2VydGFpbiBjb25kaXRpb25zOlxuICAgICAgc3dpdGNoIChNYXplLnRlc3RSZXN1bHRzKSB7XG4gICAgICAgIGNhc2UgVGVzdFJlc3VsdHMuRlJFRV9QTEFZOlxuICAgICAgICBjYXNlIFRlc3RSZXN1bHRzLlRPT19NQU5ZX0JMT0NLU19GQUlMOlxuICAgICAgICBjYXNlIFRlc3RSZXN1bHRzLkFMTF9QQVNTOlxuICAgICAgICAgIHNjaGVkdWxlRGFuY2UodHJ1ZSwgdGltZVBlclN0ZXApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gICAgICAgICAgfSwgc3RlcFNwZWVkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3B1dGRvd24nOlxuICAgICAgTWF6ZS5zY2hlZHVsZUZpbGwoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BpY2t1cCc6XG4gICAgICBNYXplLnNjaGVkdWxlRGlnKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduZWN0YXInOlxuICAgICAgTWF6ZS5iZWUuYW5pbWF0ZUdldE5lY3RhcigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaG9uZXknOlxuICAgICAgTWF6ZS5iZWUuYW5pbWF0ZU1ha2VIb25leSgpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGFjdGlvblswXSBpcyBudWxsIGlmIGdlbmVyYXRlZCBieSBzdHVkaW9BcHAuY2hlY2tUaW1lb3V0KCkuXG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmltYXRlZE1vdmUgKGRpcmVjdGlvbiwgdGltZUZvck1vdmUpIHtcbiAgdmFyIHBvc2l0aW9uQ2hhbmdlID0gdGlsZXMuZGlyZWN0aW9uVG9EeER5KGRpcmVjdGlvbik7XG4gIHZhciBuZXdYID0gTWF6ZS5wZWdtYW5YICsgcG9zaXRpb25DaGFuZ2UuZHg7XG4gIHZhciBuZXdZID0gTWF6ZS5wZWdtYW5ZICsgcG9zaXRpb25DaGFuZ2UuZHk7XG4gIHNjaGVkdWxlTW92ZShuZXdYLCBuZXdZLCB0aW1lRm9yTW92ZSk7XG4gIE1hemUucGVnbWFuWCA9IG5ld1g7XG4gIE1hemUucGVnbWFuWSA9IG5ld1k7XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYSBtb3ZlbWVudCBhbmltYXRpbmcgdXNpbmcgYSBzcHJpdGVzaGVldC5cbiAqL1xuTWF6ZS5zY2hlZHVsZVNoZWV0ZWRNb3ZlbWVudCA9IGZ1bmN0aW9uIChzdGFydCwgZGVsdGEsIG51bUZyYW1lcywgdGltZVBlckZyYW1lLFxuICAgIGlkU3RyLCBkaXJlY3Rpb24sIGhpZGVQZWdtYW4pIHtcbiAgdmFyIHBlZ21hbkljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGVnbWFuJyk7XG4gIHV0aWxzLnJhbmdlKDAsIG51bUZyYW1lcyAtIDEpLmZvckVhY2goZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoaWRlUGVnbWFuKSB7XG4gICAgICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgfVxuICAgICAgdXBkYXRlUGVnbWFuQW5pbWF0aW9uKHtcbiAgICAgICAgaWRTdHI6IGlkU3RyLFxuICAgICAgICBjb2w6IHN0YXJ0LnggKyBkZWx0YS54ICogZnJhbWUgLyBudW1GcmFtZXMsXG4gICAgICAgIHJvdzogc3RhcnQueSArIGRlbHRhLnkgKiBmcmFtZSAvIG51bUZyYW1lcyxcbiAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24sXG4gICAgICAgIGFuaW1hdGlvblJvdzogZnJhbWVcbiAgICAgIH0pO1xuICAgIH0sIHRpbWVQZXJGcmFtZSAqIGZyYW1lKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRoZSBhbmltYXRpb25zIGZvciBhIG1vdmUgZnJvbSB0aGUgY3VycmVudCBwb3NpdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IGVuZFggWCBjb29yZGluYXRlIG9mIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmRZIFkgY29vcmRpbmF0ZSBvZiB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gKi9cbiBmdW5jdGlvbiBzY2hlZHVsZU1vdmUoZW5kWCwgZW5kWSwgdGltZUZvckFuaW1hdGlvbikge1xuICB2YXIgc3RhcnRYID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgc3RhcnRZID0gTWF6ZS5wZWdtYW5ZO1xuICB2YXIgZGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EO1xuXG4gIHZhciBkZWx0YVggPSAoZW5kWCAtIHN0YXJ0WCk7XG4gIHZhciBkZWx0YVkgPSAoZW5kWSAtIHN0YXJ0WSk7XG4gIHZhciBudW1GcmFtZXM7XG4gIHZhciB0aW1lUGVyRnJhbWU7XG5cbiAgaWYgKHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvbikge1xuICAgIG51bUZyYW1lcyA9IHNraW4ubW92ZVBlZ21hbkFuaW1hdGlvbkZyYW1lTnVtYmVyO1xuICAgIC8vIElmIG1vdmUgYW5pbWF0aW9uIG9mIHBlZ21hbiBpcyBzZXQsIGFuZCB0aGlzIGlzIG5vdCBhIHR1cm4uXG4gICAgLy8gU2hvdyB0aGUgYW5pbWF0aW9uLlxuICAgIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICAgIHZhciBtb3ZlUGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb3ZlUGVnbWFuJyk7XG4gICAgdGltZVBlckZyYW1lID0gdGltZUZvckFuaW1hdGlvbiAvIG51bUZyYW1lcztcblxuICAgIE1hemUuc2NoZWR1bGVTaGVldGVkTW92ZW1lbnQoe3g6IHN0YXJ0WCwgeTogc3RhcnRZfSwge3g6IGRlbHRhWCwgeTogZGVsdGFZIH0sXG4gICAgICBudW1GcmFtZXMsIHRpbWVQZXJGcmFtZSwgJ21vdmUnLCBkaXJlY3Rpb24sIHRydWUpO1xuXG4gICAgLy8gSGlkZSBtb3ZlUGVnbWFuIGFuZCBzZXQgcGVnbWFuIHRvIHRoZSBlbmQgcG9zaXRpb24uXG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIG1vdmVQZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihlbmRYLCBlbmRZLCB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKGRpcmVjdGlvbikpO1xuICAgICAgaWYgKE1hemUud29yZFNlYXJjaCkge1xuICAgICAgICBNYXplLndvcmRTZWFyY2gubWFya1RpbGVWaXNpdGVkKGVuZFksIGVuZFgsIHRydWUpO1xuICAgICAgfVxuICAgIH0sIHRpbWVQZXJGcmFtZSAqIG51bUZyYW1lcyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gd2UgZG9uJ3QgaGF2ZSBhbiBhbmltYXRpb24sIHNvIGp1c3QgbW92ZSB0aGUgeC95IHBvc1xuICAgIG51bUZyYW1lcyA9IDQ7XG4gICAgdGltZVBlckZyYW1lID0gdGltZUZvckFuaW1hdGlvbiAvIG51bUZyYW1lcztcbiAgICB1dGlscy5yYW5nZSgxLCBudW1GcmFtZXMpLmZvckVhY2goZnVuY3Rpb24gKGZyYW1lKSB7XG4gICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBNYXplLmRpc3BsYXlQZWdtYW4oXG4gICAgICAgICAgc3RhcnRYICsgZGVsdGFYICogZnJhbWUgLyBudW1GcmFtZXMsXG4gICAgICAgICAgc3RhcnRZICsgZGVsdGFZICogZnJhbWUgLyBudW1GcmFtZXMsXG4gICAgICAgICAgdGlsZXMuZGlyZWN0aW9uVG9GcmFtZShkaXJlY3Rpb24pKTtcbiAgICAgIH0sIHRpbWVQZXJGcmFtZSAqIGZyYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbikge1xuICAgIHZhciBmaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbmlzaCcpO1xuICAgIC8vIElmIHBlZ21hbiBpcyBjbG9zZSB0byB0aGUgZ29hbFxuICAgIC8vIFJlcGxhY2UgdGhlIGdvYWwgZmlsZSB3aXRoIGFwcHJvYWNoaW5nR29hbEFuaW1hdGlvblxuICAgIGlmIChNYXplLmZpbmlzaF8gJiYgTWF0aC5hYnMoZW5kWCAtIE1hemUuZmluaXNoXy54KSA8PSAxICYmXG4gICAgICAgIE1hdGguYWJzKGVuZFkgLSBNYXplLmZpbmlzaF8ueSkgPD0gMSkge1xuICAgICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgc2tpbi5hcHByb2FjaGluZ0dvYWxBbmltYXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaW5pc2hJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmdvYWxJZGxlKTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFNjaGVkdWxlIHRoZSBhbmltYXRpb25zIGZvciBhIHR1cm4gZnJvbSB0aGUgY3VycmVudCBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmREaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB3ZSdyZSB0dXJuaW5nIHRvXG4gKi9cbk1hemUuc2NoZWR1bGVUdXJuID0gZnVuY3Rpb24gKGVuZERpcmVjdGlvbikge1xuICB2YXIgbnVtRnJhbWVzID0gNDtcbiAgdmFyIHN0YXJ0RGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EO1xuICB2YXIgZGVsdGFEaXJlY3Rpb24gPSBlbmREaXJlY3Rpb24gLSBzdGFydERpcmVjdGlvbjtcbiAgdXRpbHMucmFuZ2UoMSwgbnVtRnJhbWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChmcmFtZSkge1xuICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBNYXplLmRpc3BsYXlQZWdtYW4oXG4gICAgICAgIE1hemUucGVnbWFuWCxcbiAgICAgICAgTWF6ZS5wZWdtYW5ZLFxuICAgICAgICB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKHN0YXJ0RGlyZWN0aW9uICsgZGVsdGFEaXJlY3Rpb24gKiBmcmFtZSAvIG51bUZyYW1lcykpO1xuICAgIH0sIHN0ZXBTcGVlZCAqIChmcmFtZSAtIDEpKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlcGxhY2UgdGhlIHRpbGVzIHN1cnJvdW5kaW5nIHRoZSBvYnN0YWNsZSB3aXRoIGJyb2tlbiB0aWxlcy5cbiAqL1xuTWF6ZS51cGRhdGVTdXJyb3VuZGluZ1RpbGVzID0gZnVuY3Rpb24ob2JzdGFjbGVZLCBvYnN0YWNsZVgsIGJyb2tlblRpbGVzKSB7XG4gIHZhciB0aWxlQ29vcmRzID0gW1xuICAgIFtvYnN0YWNsZVkgLSAxLCBvYnN0YWNsZVggLSAxXSxcbiAgICBbb2JzdGFjbGVZIC0gMSwgb2JzdGFjbGVYXSxcbiAgICBbb2JzdGFjbGVZIC0gMSwgb2JzdGFjbGVYICsgMV0sXG4gICAgW29ic3RhY2xlWSwgb2JzdGFjbGVYIC0gMV0sXG4gICAgW29ic3RhY2xlWSwgb2JzdGFjbGVYXSxcbiAgICBbb2JzdGFjbGVZLCBvYnN0YWNsZVggKyAxXSxcbiAgICBbb2JzdGFjbGVZICsgMSwgb2JzdGFjbGVYIC0gMV0sXG4gICAgW29ic3RhY2xlWSArIDEsIG9ic3RhY2xlWF0sXG4gICAgW29ic3RhY2xlWSArIDEsIG9ic3RhY2xlWCArIDFdXG4gIF07XG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IHRpbGVDb29yZHMubGVuZ3RoOyArK2lkeCkge1xuICAgIHZhciB0aWxlSWR4ID0gdGlsZUNvb3Jkc1tpZHhdWzFdICsgTWF6ZS5tYXAuQ09MUyAqIHRpbGVDb29yZHNbaWR4XVswXTtcbiAgICB2YXIgdGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUVsZW1lbnQnICsgdGlsZUlkeCk7XG4gICAgaWYgKHRpbGVFbGVtZW50KSB7XG4gICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgYnJva2VuVGlsZXMpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTY2hlZHVsZSB0aGUgYW5pbWF0aW9ucyBhbmQgc291bmRzIGZvciBhIGZhaWxlZCBtb3ZlLlxuICogQHBhcmFtIHtib29sZWFufSBmb3J3YXJkIFRydWUgaWYgZm9yd2FyZCwgZmFsc2UgaWYgYmFja3dhcmQuXG4gKi9cbk1hemUuc2NoZWR1bGVGYWlsID0gZnVuY3Rpb24oZm9yd2FyZCkge1xuICB2YXIgZHhEeSA9IHRpbGVzLmRpcmVjdGlvblRvRHhEeShNYXplLnBlZ21hbkQpO1xuICB2YXIgZGVsdGFYID0gZHhEeS5keDtcbiAgdmFyIGRlbHRhWSA9IGR4RHkuZHk7XG5cbiAgaWYgKCFmb3J3YXJkKSB7XG4gICAgZGVsdGFYID0gLWRlbHRhWDtcbiAgICBkZWx0YVkgPSAtZGVsdGFZO1xuICB9XG5cbiAgdmFyIHRhcmdldFggPSBNYXplLnBlZ21hblggKyBkZWx0YVg7XG4gIHZhciB0YXJnZXRZID0gTWF6ZS5wZWdtYW5ZICsgZGVsdGFZO1xuICB2YXIgZnJhbWUgPSB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKE1hemUucGVnbWFuRCk7XG4gIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblggKyBkZWx0YVggLyA0LFxuICAgICAgICAgICAgICAgICAgICAgTWF6ZS5wZWdtYW5ZICsgZGVsdGFZIC8gNCxcbiAgICAgICAgICAgICAgICAgICAgIGZyYW1lKTtcbiAgLy8gUGxheSBzb3VuZCBhbmQgYW5pbWF0aW9uIGZvciBoaXR0aW5nIHdhbGwgb3Igb2JzdGFjbGVcbiAgdmFyIHNxdWFyZVR5cGUgPSBNYXplLm1hcC5nZXRUaWxlKHRhcmdldFksIHRhcmdldFgpO1xuICBpZiAoc3F1YXJlVHlwZSA9PT0gU3F1YXJlVHlwZS5XQUxMIHx8IHNxdWFyZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIFBsYXkgdGhlIHNvdW5kXG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2FsbCcpO1xuICAgIGlmIChzcXVhcmVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIENoZWNrIHdoaWNoIHR5cGUgb2Ygd2FsbCBwZWdtYW4gaXMgaGl0dGluZ1xuICAgICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2FsbCcgKyBNYXplLndhbGxNYXBbdGFyZ2V0WV1bdGFyZ2V0WF0pO1xuICAgIH1cblxuICAgIC8vIFBsYXkgdGhlIGFuaW1hdGlvbiBvZiBoaXR0aW5nIHRoZSB3YWxsXG4gICAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24pIHtcbiAgICAgIHZhciB3YWxsQW5pbWF0aW9uSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsQW5pbWF0aW9uJyk7XG4gICAgICB2YXIgbnVtRnJhbWVzID0gc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbkZyYW1lTnVtYmVyIHx8IDA7XG5cbiAgICAgIGlmIChudW1GcmFtZXMgPiAxKSB7XG5cbiAgICAgICAgLy8gVGhlIFNjcmF0IFwid2FsbFwiIGFuaW1hdGlvbiBoYXMgaGltIGZhbGxpbmcgYmFja3dhcmRzIGludG8gdGhlIHdhdGVyLlxuICAgICAgICAvLyBUaGlzIGxvb2tzIGdyZWF0IHdoZW4gaGUgZmFsbHMgaW50byB0aGUgd2F0ZXIgYWJvdmUgaGltLCBidXQgbG9va3MgYVxuICAgICAgICAvLyBsaXR0bGUgb2ZmIHdoZW4gZmFsbGluZyB0byB0aGUgc2lkZS9mb3J3YXJkLiBUdW5lIHRoYXQgYnkgYnVtcGluZyB0aGVcbiAgICAgICAgLy8gZGVsdGFZIGJ5IG9uZS4gSGFja3ksIGJ1dCBsb29rcyBtdWNoIGJldHRlclxuICAgICAgICBpZiAoZGVsdGFZID49IDApIHtcbiAgICAgICAgICBkZWx0YVkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhbmltYXRlIG91ciBzcHJpdGUgc2hlZXRcbiAgICAgICAgdmFyIHRpbWVQZXJGcmFtZSA9IDEwMDtcbiAgICAgICAgTWF6ZS5zY2hlZHVsZVNoZWV0ZWRNb3ZlbWVudCh7eDogTWF6ZS5wZWdtYW5YLCB5OiBNYXplLnBlZ21hbll9LFxuICAgICAgICAgIHt4OiBkZWx0YVgsIHk6IGRlbHRhWSB9LCBudW1GcmFtZXMsIHRpbWVQZXJGcmFtZSwgJ3dhbGwnLFxuICAgICAgICAgIERpcmVjdGlvbi5OT1JUSCwgdHJ1ZSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3YWxsUGVnbWFuJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgICAgICB9LCBudW1GcmFtZXMgKiB0aW1lUGVyRnJhbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWN0aXZlIG91ciBnaWZcbiAgICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLFxuICAgICAgICAgICAgTWF6ZS5TUVVBUkVfU0laRSAqIChNYXplLnBlZ21hblggKyAwLjUgKyBkZWx0YVggKiAwLjUpIC1cbiAgICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgneScsXG4gICAgICAgICAgICBNYXplLlNRVUFSRV9TSVpFICogKE1hemUucGVnbWFuWSArIDEgKyBkZWx0YVkgKiAwLjUpIC1cbiAgICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgd2FsbEFuaW1hdGlvbkljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgIHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24pO1xuICAgICAgICB9LCBzdGVwU3BlZWQgLyAyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgZnJhbWUpO1xuICAgIH0sIHN0ZXBTcGVlZCk7XG4gICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblggKyBkZWx0YVggLyA0LCBNYXplLnBlZ21hblkgKyBkZWx0YVkgLyA0LFxuICAgICAgIGZyYW1lKTtcbiAgICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgICB9LCBzdGVwU3BlZWQgKiAyKTtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCBmcmFtZSk7XG4gICAgfSwgc3RlcFNwZWVkICogMyk7XG5cbiAgICBpZiAoc2tpbi53YWxsUGVnbWFuQW5pbWF0aW9uKSB7XG4gICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgICAgICAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIHVwZGF0ZVBlZ21hbkFuaW1hdGlvbih7XG4gICAgICAgICAgaWRTdHI6ICd3YWxsJyxcbiAgICAgICAgICByb3c6IE1hemUucGVnbWFuWSxcbiAgICAgICAgICBjb2w6IE1hemUucGVnbWFuWCxcbiAgICAgICAgICBkaXJlY3Rpb246IE1hemUucGVnbWFuRFxuICAgICAgICB9KTtcbiAgICAgIH0sIHN0ZXBTcGVlZCAqIDQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzcXVhcmVUeXBlID09IFNxdWFyZVR5cGUuT0JTVEFDTEUpIHtcbiAgICAvLyBQbGF5IHRoZSBzb3VuZFxuICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ29ic3RhY2xlJyk7XG5cbiAgICAvLyBQbGF5IHRoZSBhbmltYXRpb25cbiAgICB2YXIgb2JzSWQgPSB0YXJnZXRYICsgTWF6ZS5tYXAuQ09MUyAqIHRhcmdldFk7XG4gICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzdGFjbGUnICsgb2JzSWQpO1xuICAgIG9ic0ljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLm9ic3RhY2xlQW5pbWF0aW9uKTtcbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCArIGRlbHRhWCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgTWF6ZS5wZWdtYW5ZICsgZGVsdGFZIC8gMixcbiAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZSk7XG4gICAgfSwgc3RlcFNwZWVkKTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIG9iamVjdHMgYXJvdW5kIG9ic3RhY2xlcyB3aXRoIGJyb2tlbiBvYmplY3RzXG4gICAgaWYgKHNraW4ubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcykge1xuICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgTWF6ZS51cGRhdGVTdXJyb3VuZGluZ1RpbGVzKFxuICAgICAgICAgICAgdGFyZ2V0WSwgdGFyZ2V0WCwgc2tpbi5sYXJnZXJPYnN0YWNsZUFuaW1hdGlvblRpbGVzKTtcbiAgICAgIH0sIHN0ZXBTcGVlZCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHBlZ21hblxuICAgIGlmICghc2tpbi5ub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGUpIHtcbiAgICAgIHZhciBzdmdNYXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z01hemUnKTtcbiAgICAgIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuXG4gICAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwZWdtYW5JY29uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgIH0sIHN0ZXBTcGVlZCAqIDIpO1xuICAgIH1cbiAgICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICAgIH0sIHN0ZXBTcGVlZCk7XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IHRoZSB0aWxlcyB0byBiZSB0cmFuc3BhcmVudCBncmFkdWFsbHkuXG4gKi9cbmZ1bmN0aW9uIHNldFRpbGVUcmFuc3BhcmVudCAoKSB7XG4gIHZhciB0aWxlSWQgPSAwO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IE1hemUubWFwLlJPV1M7IHkrKykge1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgTWF6ZS5tYXAuQ09MUzsgeCsrKSB7XG4gICAgICAvLyBUaWxlIHNwcml0ZS5cbiAgICAgIHZhciB0aWxlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlRWxlbWVudCcgKyB0aWxlSWQpO1xuICAgICAgdmFyIHRpbGVBbmltYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUFuaW1hdGlvbicgKyB0aWxlSWQpO1xuICAgICAgaWYgKHRpbGVFbGVtZW50KSB7XG4gICAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIDApO1xuICAgICAgfVxuICAgICAgaWYgKHRpbGVBbmltYXRpb24gJiYgdGlsZUFuaW1hdGlvbi5iZWdpbkVsZW1lbnQpIHtcbiAgICAgICAgLy8gSUUgZG9lc24ndCBzdXBwb3J0IGJlZ2luRWxlbWVudCwgc28gY2hlY2sgZm9yIGl0LlxuICAgICAgICB0aWxlQW5pbWF0aW9uLmJlZ2luRWxlbWVudCgpO1xuICAgICAgfVxuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFBlZ21hblRyYW5zcGFyZW50KCkge1xuICB2YXIgcGVnbWFuRmFkZW91dEFuaW1hdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW5GYWRlb3V0QW5pbWF0aW9uJyk7XG4gIHZhciBwZWdtYW5JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BlZ21hbicpO1xuICBpZiAocGVnbWFuSWNvbikge1xuICAgIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMCk7XG4gIH1cbiAgaWYgKHBlZ21hbkZhZGVvdXRBbmltYXRpb24gJiYgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5iZWdpbkVsZW1lbnQpIHtcbiAgICAvLyBJRSBkb2Vzbid0IHN1cHBvcnQgYmVnaW5FbGVtZW50LCBzbyBjaGVjayBmb3IgaXQuXG4gICAgcGVnbWFuRmFkZW91dEFuaW1hdGlvbi5iZWdpbkVsZW1lbnQoKTtcbiAgfVxufVxuXG5cblxuXG5cbi8qKlxuICogU2NoZWR1bGUgdGhlIGFuaW1hdGlvbnMgYW5kIHNvdW5kIGZvciBhIGRhbmNlLlxuICogQHBhcmFtIHtib29sZWFufSB2aWN0b3J5RGFuY2UgVGhpcyBpcyBhIHZpY3RvcnkgZGFuY2UgYWZ0ZXIgY29tcGxldGluZyB0aGVcbiAqICAgcHV6emxlICh2cy4gZGFuY2luZyBvbiBsb2FkKS5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gdGltZUFsbG90ZWQgSG93IG11Y2ggdGltZSB3ZSBoYXZlIGZvciBvdXIgYW5pbWF0aW9uc1xuICovXG5mdW5jdGlvbiBzY2hlZHVsZURhbmNlKHZpY3RvcnlEYW5jZSwgdGltZUFsbG90ZWQpIHtcbiAgaWYgKG1hemVVdGlscy5pc1NjcmF0U2tpbihza2luLmlkKSkge1xuICAgIHNjcmF0LnNjaGVkdWxlRGFuY2UodmljdG9yeURhbmNlLCB0aW1lQWxsb3RlZCwgc2tpbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsRnJhbWUgPSB0aWxlcy5kaXJlY3Rpb25Ub0ZyYW1lKE1hemUucGVnbWFuRCk7XG4gIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgMTYpO1xuXG4gIC8vIElmIHZpY3RvcnlEYW5jZSA9PSB0cnVlLCBwbGF5IHRoZSBnb2FsIGFuaW1hdGlvbiwgZWxzZSByZXNldCBpdFxuICB2YXIgZmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gnKTtcbiAgaWYgKHZpY3RvcnlEYW5jZSAmJiBmaW5pc2hJY29uKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luR29hbCcpO1xuICAgIGZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICBza2luLmdvYWxBbmltYXRpb24pO1xuICB9XG5cbiAgaWYgKHZpY3RvcnlEYW5jZSkge1xuICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3dpbicpO1xuICB9XG5cbiAgdmFyIGRhbmNlU3BlZWQgPSB0aW1lQWxsb3RlZCAvIDU7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAxOCk7XG4gIH0sIGRhbmNlU3BlZWQpO1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIE1hemUuZGlzcGxheVBlZ21hbihNYXplLnBlZ21hblgsIE1hemUucGVnbWFuWSwgMjApO1xuICB9LCBkYW5jZVNwZWVkICogMik7XG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCAxOCk7XG4gIH0sIGRhbmNlU3BlZWQgKiAzKTtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBNYXplLmRpc3BsYXlQZWdtYW4oTWF6ZS5wZWdtYW5YLCBNYXplLnBlZ21hblksIDIwKTtcbiAgfSwgZGFuY2VTcGVlZCAqIDQpO1xuXG4gIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlmICghdmljdG9yeURhbmNlIHx8IHNraW4udHVybkFmdGVyVmljdG9yeSkge1xuICAgICAgTWF6ZS5kaXNwbGF5UGVnbWFuKE1hemUucGVnbWFuWCwgTWF6ZS5wZWdtYW5ZLCBvcmlnaW5hbEZyYW1lKTtcbiAgICB9XG5cbiAgICBpZiAodmljdG9yeURhbmNlICYmIHNraW4udHJhbnNwYXJlbnRUaWxlRW5kaW5nKSB7XG4gICAgICBzZXRUaWxlVHJhbnNwYXJlbnQoKTtcbiAgICB9XG5cbiAgICBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgICBzZXRQZWdtYW5UcmFuc3BhcmVudCgpO1xuICAgIH1cbiAgfSwgZGFuY2VTcGVlZCAqIDUpO1xufVxuXG4vKipcbiAqIERpc3BsYXkgUGVnbWFuIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb24sIGZhY2luZyB0aGUgc3BlY2lmaWVkIGRpcmVjdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEhvcml6b250YWwgZ3JpZCAob3IgZnJhY3Rpb24gdGhlcmVvZikuXG4gKiBAcGFyYW0ge251bWJlcn0geSBWZXJ0aWNhbCBncmlkIChvciBmcmFjdGlvbiB0aGVyZW9mKS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBmcmFtZSBEaXJlY3Rpb24gKDAgLSAxNSkgb3IgZGFuY2UgKDE2IC0gMTcpLlxuICovXG5NYXplLmRpc3BsYXlQZWdtYW4gPSBmdW5jdGlvbih4LCB5LCBmcmFtZSkge1xuICB2YXIgcGVnbWFuSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwZWdtYW4nKTtcbiAgcGVnbWFuSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLFxuICAgIHggKiBNYXplLlNRVUFSRV9TSVpFIC0gZnJhbWUgKiBNYXplLlBFR01BTl9XSURUSCArIDEgKyBNYXplLlBFR01BTl9YX09GRlNFVCk7XG4gIHBlZ21hbkljb24uc2V0QXR0cmlidXRlKCd5JywgZ2V0UGVnbWFuWUZvclJvdyh5KSk7XG5cbiAgdmFyIGNsaXBSZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXBSZWN0Jyk7XG4gIGNsaXBSZWN0LnNldEF0dHJpYnV0ZSgneCcsIHggKiBNYXplLlNRVUFSRV9TSVpFICsgMSArIE1hemUuUEVHTUFOX1hfT0ZGU0VUKTtcbiAgY2xpcFJlY3Quc2V0QXR0cmlidXRlKCd5JywgcGVnbWFuSWNvbi5nZXRBdHRyaWJ1dGUoJ3knKSk7XG59O1xuXG52YXIgc2NoZWR1bGVEaXJ0Q2hhbmdlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgY29sID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgcm93ID0gTWF6ZS5wZWdtYW5ZO1xuICBNYXplLm1hcC5zZXRWYWx1ZShyb3csIGNvbCwgTWF6ZS5tYXAuZ2V0VmFsdWUocm93LCBjb2wpICsgb3B0aW9ucy5hbW91bnQpO1xuICBNYXplLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgdHJ1ZSk7XG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8ob3B0aW9ucy5zb3VuZCk7XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRvIGFkZCBkaXJ0IGF0IHBlZ21hbidzIGN1cnJlbnQgcG9zaXRpb24uXG4gKi9cbk1hemUuc2NoZWR1bGVGaWxsID0gZnVuY3Rpb24oKSB7XG4gIHNjaGVkdWxlRGlydENoYW5nZSh7XG4gICAgYW1vdW50OiAxLFxuICAgIHNvdW5kOiAnZmlsbCdcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlIHRvIHJlbW92ZSBkaXJ0IGF0IHBlZ21hbidzIGN1cnJlbnQgbG9jYXRpb24uXG4gKi9cbk1hemUuc2NoZWR1bGVEaWcgPSBmdW5jdGlvbigpIHtcbiAgc2NoZWR1bGVEaXJ0Q2hhbmdlKHtcbiAgICBhbW91bnQ6IC0xLFxuICAgIHNvdW5kOiAnZGlnJ1xuICB9KTtcbn07XG5cbi8qKlxuICogRGlzcGxheSB0aGUgbG9vayBpY29uIGF0IFBlZ21hbidzIGN1cnJlbnQgbG9jYXRpb24sXG4gKiBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdGlvbi5cbiAqIEBwYXJhbSB7IURpcmVjdGlvbn0gZCBEaXJlY3Rpb24gKDAgLSAzKS5cbiAqL1xuTWF6ZS5zY2hlZHVsZUxvb2sgPSBmdW5jdGlvbihkKSB7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgc3dpdGNoIChkKSB7XG4gICAgY2FzZSBEaXJlY3Rpb24uTk9SVEg6XG4gICAgICB4ICs9IDAuNTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLkVBU1Q6XG4gICAgICB4ICs9IDE7XG4gICAgICB5ICs9IDAuNTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLlNPVVRIOlxuICAgICAgeCArPSAwLjU7XG4gICAgICB5ICs9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5XRVNUOlxuICAgICAgeSArPSAwLjU7XG4gICAgICBicmVhaztcbiAgfVxuICB4ICo9IE1hemUuU1FVQVJFX1NJWkU7XG4gIHkgKj0gTWF6ZS5TUVVBUkVfU0laRTtcbiAgZCA9IGQgKiA5MCAtIDQ1O1xuXG4gIHZhciBsb29rSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb29rJyk7XG4gIGxvb2tJY29uLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyxcbiAgICAgICd0cmFuc2xhdGUoJyArIHggKyAnLCAnICsgeSArICcpICcgK1xuICAgICAgJ3JvdGF0ZSgnICsgZCArICcgMCAwKSBzY2FsZSguNCknKTtcbiAgdmFyIHBhdGhzID0gbG9va0ljb24uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhdGgnKTtcbiAgbG9va0ljb24uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICBNYXplLnNjaGVkdWxlTG9va1N0ZXAocGF0aCwgc3RlcFNwZWVkICogaSk7XG4gIH1cbn07XG5cbi8qKlxuICogU2NoZWR1bGUgb25lIG9mIHRoZSAnbG9vaycgaWNvbidzIHdhdmVzIHRvIGFwcGVhciwgdGhlbiBkaXNhcHBlYXIuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYXRoIEVsZW1lbnQgdG8gbWFrZSBhcHBlYXIuXG4gKiBAcGFyYW0ge251bWJlcn0gZGVsYXkgTWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIG1ha2luZyB3YXZlIGFwcGVhci5cbiAqL1xuTWF6ZS5zY2hlZHVsZUxvb2tTdGVwID0gZnVuY3Rpb24ocGF0aCwgZGVsYXkpIHtcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBwYXRoLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHBhdGguc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9LCBzdGVwU3BlZWQgKiAyKTtcbiAgfSwgZGVsYXkpO1xufTtcblxuZnVuY3Rpb24gYXRGaW5pc2ggKCkge1xuICByZXR1cm4gIU1hemUuZmluaXNoXyB8fFxuICAgICAgKE1hemUucGVnbWFuWCA9PSBNYXplLmZpbmlzaF8ueCAmJiBNYXplLnBlZ21hblkgPT0gTWF6ZS5maW5pc2hfLnkpO1xufVxuXG5mdW5jdGlvbiBpc0RpcnRDb3JyZWN0ICgpIHtcbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgTWF6ZS5tYXAuUk9XUzsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBNYXplLm1hcC5DT0xTOyBjb2wrKykge1xuICAgICAgaWYgKE1hemUubWFwLmlzRGlydChyb3csIGNvbCkgJiYgTWF6ZS5tYXAuZ2V0VmFsdWUocm93LCBjb2wpICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbGwgZ29hbHMgaGF2ZSBiZWVuIGFjY29tcGxpc2hlZFxuICovXG5NYXplLmNoZWNrU3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmluaXNoZWQ7XG4gIGlmICghYXRGaW5pc2goKSkge1xuICAgIGZpbmlzaGVkID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoTWF6ZS5iZWUpIHtcbiAgICBmaW5pc2hlZCA9IE1hemUuYmVlLmZpbmlzaGVkKCk7XG4gIH0gZWxzZSBpZiAoTWF6ZS53b3JkU2VhcmNoKSB7XG4gICAgZmluaXNoZWQgPSBNYXplLndvcmRTZWFyY2guZmluaXNoZWQoKTtcbiAgfSBlbHNlIHtcbiAgICBmaW5pc2hlZCA9IGlzRGlydENvcnJlY3QoKTtcbiAgfVxuXG4gIGlmIChmaW5pc2hlZCkge1xuICAgIC8vIEZpbmlzaGVkLiAgVGVybWluYXRlIHRoZSB1c2VyJ3MgcHJvZ3JhbS5cbiAgICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ2ZpbmlzaCcsIG51bGwpO1xuICAgIE1hemUuZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUodHJ1ZSk7XG4gIH1cbiAgcmV0dXJuIGZpbmlzaGVkO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgYWZ0ZXIgdXNlcidzIGNvZGUgaGFzIGZpbmlzaGVkIGJlaW5nIGV4ZWN1dGVkLCBnaXZpbmcgdXMgb25lIG1vcmVcbiAqIGNoYW5jZSB0byBjaGVjayBpZiB3ZSd2ZSBhY2NvbXBsaXNoZWQgb3VyIGdvYWxzLiBUaGlzIGlzIHJlcXVpcmVkIGluIHBhcnRcbiAqIGJlY2F1c2UgZWxzZXdoZXJlIHdlIG9ubHkgY2hlY2sgZm9yIHN1Y2Nlc3MgYWZ0ZXIgbW92ZW1lbnQuXG4gKi9cbk1hemUub25FeGVjdXRpb25GaW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gIC8vIElmIHdlIGhhdmVuJ3QgdGVybWluYXRlZCwgbWFrZSBvbmUgbGFzdCBjaGVjayBmb3Igc3VjY2Vzc1xuICBpZiAoIU1hemUuZXhlY3V0aW9uSW5mby5pc1Rlcm1pbmF0ZWQoKSkge1xuICAgIE1hemUuY2hlY2tTdWNjZXNzKCk7XG4gIH1cblxuICBpZiAoTWF6ZS5iZWUpIHtcbiAgICBNYXplLmJlZS5vbkV4ZWN1dGlvbkZpbmlzaCgpO1xuICB9XG59O1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgY2VsbElkID0gcmVxdWlyZSgnLi9tYXplVXRpbHMnKS5jZWxsSWQ7XG5cbnZhciBTcXVhcmVUeXBlID0gcmVxdWlyZSgnLi90aWxlcycpLlNxdWFyZVR5cGU7XG5cbnZhciBTVkdfTlMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKS5TVkdfTlM7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IFdvcmRTZWFyY2guXG4gKi9cbnZhciBXb3JkU2VhcmNoID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZ29hbCwgbWFwLCBkcmF3VGlsZUZuKSB7XG4gIHRoaXMuZ29hbF8gPSBnb2FsO1xuICB0aGlzLnZpc2l0ZWRfID0gJyc7XG4gIHRoaXMubWFwXyA9IG1hcDtcbn07XG5cbnZhciBBTExfQ0hBUlMgPSBbXCJBXCIsIFwiQlwiLCBcIkNcIiwgXCJEXCIsIFwiRVwiLCBcIkZcIiwgXCJHXCIsIFwiSFwiLCBcIklcIiwgXCJKXCIsIFwiS1wiLCBcIkxcIixcbiAgXCJNXCIsIFwiTlwiLCBcIk9cIiwgXCJQXCIsIFwiUVwiLCBcIlJcIiwgXCJTXCIsIFwiVFwiLCBcIlVcIiwgXCJWXCIsIFwiV1wiLCBcIlhcIiwgXCJZXCIsIFwiWlwiXTtcblxudmFyIFNUQVJUX0NIQVIgPSAnLSc7XG52YXIgRU1QVFlfQ0hBUiA9ICdfJztcblxuLy8gdGhpcyBzaG91bGQgbWF0Y2ggd2l0aCBNYXplLlNRVUFSRV9TSVpFXG52YXIgU1FVQVJFX1NJWkUgPSA1MDtcblxuLyoqXG4gKiBHZW5lcmF0ZSByYW5kb20gdGlsZXMgZm9yIHdhbGxzICh3aXRoIHNvbWUgcmVzdHJpY3Rpb25zKSBhbmQgZHJhdyB0aGVtIHRvXG4gKiB0aGUgc3ZnLlxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5kcmF3TWFwVGlsZXMgPSBmdW5jdGlvbiAoc3ZnKSB7XG4gIHZhciBsZXR0ZXI7XG4gIHZhciByZXN0cmljdGVkO1xuXG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMubWFwXy5sZW5ndGg7IHJvdysrKSB7XG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5tYXBfW3Jvd10ubGVuZ3RoOyBjb2wrKykge1xuICAgICAgdmFyIG1hcFZhbCA9IHRoaXMubWFwX1tyb3ddW2NvbF07XG4gICAgICBpZiAobWFwVmFsID09PSBFTVBUWV9DSEFSKSB7XG4gICAgICAgIHJlc3RyaWN0ZWQgPSB0aGlzLnJlc3RyaWN0ZWRWYWx1ZXNfKHJvdywgY29sKTtcbiAgICAgICAgbGV0dGVyID0gcmFuZG9tTGV0dGVyKHJlc3RyaWN0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0dGVyID0gbGV0dGVyVmFsdWUobWFwVmFsLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5kcmF3VGlsZV8oc3ZnLCBsZXR0ZXIsIHJvdywgY29sKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHdlJ3ZlIHNwZWxsZWQgdGhlIHJpZ2h0IHdvcmQuXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy52aXNpdGVkXyA9PT0gdGhpcy5nb2FsXztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiByb3csY29sIGlzIGJvdGggb24gdGhlIGdyaWQgYW5kIG5vdCBhIHdhbGxcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUuaXNPcGVuXyA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICB2YXIgbWFwID0gdGhpcy5tYXBfO1xuICByZXR1cm4gKChtYXBbcm93XSAhPT0gdW5kZWZpbmVkKSAmJlxuICAgIChtYXBbcm93XVtjb2xdICE9PSB1bmRlZmluZWQpICYmXG4gICAgKG1hcFtyb3ddW2NvbF0gIT09IFNxdWFyZVR5cGUuV0FMTCkpO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIHJvdyBhbmQgY29sLCByZXR1cm5zIHRoZSByb3csIGNvbCBwYWlyIG9mIGFueSBub24td2FsbCBuZWlnaGJvcnNcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUub3Blbk5laWdoYm9yc18gPWZ1bmN0aW9uIChyb3csIGNvbCkge1xuICB2YXIgbmVpZ2hib3JzID0gW107XG4gIGlmICh0aGlzLmlzT3Blbl8ocm93ICsgMSwgY29sKSkge1xuICAgIG5laWdoYm9ycy5wdXNoKFtyb3cgKyAxLCBjb2xdKTtcbiAgfVxuICBpZiAodGhpcy5pc09wZW5fKHJvdyAtIDEsIGNvbCkpIHtcbiAgICBuZWlnaGJvcnMucHVzaChbcm93IC0gMSwgY29sXSk7XG4gIH1cbiAgaWYgKHRoaXMuaXNPcGVuXyhyb3csIGNvbCArIDEpKSB7XG4gICAgbmVpZ2hib3JzLnB1c2goW3JvdywgY29sICsgMV0pO1xuICB9XG4gIGlmICh0aGlzLmlzT3Blbl8ocm93LCBjb2wgLSAxKSkge1xuICAgIG5laWdoYm9ycy5wdXNoKFtyb3csIGNvbCAtIDFdKTtcbiAgfVxuXG4gIHJldHVybiBuZWlnaGJvcnM7XG59O1xuXG4vKipcbiAqIFdlIG5ldmVyIHdhbnQgdG8gaGF2ZSBhIGJyYW5jaCB3aGVyZSBlaXRoZXIgZGlyZWN0aW9uIGdldHMgeW91IHRoZSBuZXh0XG4gKiBjb3JyZWN0IGxldHRlci4gIEFzIHN1Y2gsIGEgXCJ3YWxsXCIgc3BhY2Ugc2hvdWxkIG5ldmVyIGhhdmUgdGhlIHNhbWUgdmFsdWUgYXNcbiAqIGFuIG9wZW4gbmVpZ2hib3Igb2YgYW4gbmVpZ2hib3IgKGkuZS4gaWYgbXkgbm9uLXdhbGwgbmVpZ2hib3IgaGFzIGEgbm9uLXdhbGxcbiAqIG5laWdoYm9yIHdob3NlIHZhbHVlIGlzIEUsIEkgY2FuJ3QgYWxzbyBiZSBFKVxuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5yZXN0cmljdGVkVmFsdWVzXyA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICB2YXIgbWFwID0gdGhpcy5tYXBfO1xuICB2YXIgbmVpZ2hib3JzID0gdGhpcy5vcGVuTmVpZ2hib3JzXyhyb3csIGNvbCk7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZWlnaGJvcnMubGVuZ3RoOyBpICsrKSB7XG4gICAgdmFyIHNlY29uZE5laWdoYm9ycyA9IHRoaXMub3Blbk5laWdoYm9yc18obmVpZ2hib3JzW2ldWzBdLCBuZWlnaGJvcnNbaV1bMV0pO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2Vjb25kTmVpZ2hib3JzLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgbmVpZ2hib3JSb3cgPSBzZWNvbmROZWlnaGJvcnNbal1bMF07XG4gICAgICB2YXIgbmVpZ2hib3JDb2wgPSBzZWNvbmROZWlnaGJvcnNbal1bMV07XG4gICAgICAvLyBwdXNoIHZhbHVlIHRvIHJlc3RyaWN0ZWQgbGlzdFxuICAgICAgdmFyIHZhbCA9IGxldHRlclZhbHVlKG1hcFtuZWlnaGJvclJvd11bbmVpZ2hib3JDb2xdLCBmYWxzZSk7XG4gICAgICB2YWx1ZXMucHVzaCh2YWwsIGZhbHNlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8qKlxuICogRHJhdyBhIGdpdmVuIHRpbGUuICBPdmVycmlkZXMgdGhlIGxvZ2ljIG9mIE1hemUuZHJhd1RpbGVcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUuZHJhd1RpbGVfID0gZnVuY3Rpb24gKHN2ZywgbGV0dGVyLCByb3csIGNvbCkge1xuICB2YXIgYmFja2dyb3VuZElkID0gY2VsbElkKCdiYWNrZ3JvdW5kTGV0dGVyJywgcm93LCBjb2wpO1xuICB2YXIgdGV4dElkID0gY2VsbElkKCdsZXR0ZXInLCByb3csIGNvbCk7XG5cbiAgdmFyIGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2cnKTtcbiAgdmFyIGJhY2tncm91bmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAncmVjdCcpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgnaWQnLCBiYWNrZ3JvdW5kSWQpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBTUVVBUkVfU0laRSk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCd4JywgY29sICogU1FVQVJFX1NJWkUpO1xuICBiYWNrZ3JvdW5kLnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcbiAgYmFja2dyb3VuZC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsICcjMDAwMDAwJyk7XG4gIGJhY2tncm91bmQuc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLCAzKTtcbiAgZ3JvdXAuYXBwZW5kQ2hpbGQoYmFja2dyb3VuZCk7XG5cbiAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAndGV4dCcpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnaWQnLCB0ZXh0SWQpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnc2VhcmNoLWxldHRlcicpO1xuICB0ZXh0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBTUVVBUkVfU0laRSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd4JywgKGNvbCArIDAuNSkgKiBTUVVBUkVfU0laRSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd5JywgKHJvdyArIDAuNSkgKiBTUVVBUkVfU0laRSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdmb250LXNpemUnLCAzMik7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2ZvbnQtZmFtaWx5JywgJ1ZlcmRhbmEnKTtcbiAgdGV4dC50ZXh0Q29udGVudCA9IGxldHRlcjtcbiAgZ3JvdXAuYXBwZW5kQ2hpbGQodGV4dCk7XG4gIHN2Zy5hcHBlbmRDaGlsZChncm91cCk7XG59O1xuXG4vKipcbiAqIFJlc2V0IGFsbCB0aWxlcyB0byBiZWdpbm5pbmcgc3RhdGVcbiAqL1xuV29yZFNlYXJjaC5wcm90b3R5cGUucmVzZXRUaWxlcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5tYXBfLmxlbmd0aDsgcm93KyspIHtcbiAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCB0aGlzLm1hcF9bcm93XS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICB0aGlzLnVwZGF0ZVRpbGVIaWdobGlnaHRfKHJvdywgY29sLCBmYWxzZSk7XG4gICAgfVxuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50V29yZENvbnRlbnRzJykudGV4dENvbnRlbnQgPSAnJztcbiAgdGhpcy52aXNpdGVkXyA9ICcnO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgYSB0aWxlJ3MgaGlnaGxpZ2h0aW5nLiBJZiB3ZSd2ZSBmbG93biBvdmVyIGl0LCBpdCBzaG91bGQgYmUgZ3JlZW4uXG4gKiBPdGhlcndpc2Ugd2UgaGF2ZSBhIGNoZWNrYm9hcmQgYXBwcm9hY2guXG4gKi9cbldvcmRTZWFyY2gucHJvdG90eXBlLnVwZGF0ZVRpbGVIaWdobGlnaHRfID0gZnVuY3Rpb24gKHJvdywgY29sLCBoaWdobGlnaHRlZCkge1xuICB2YXIgYmFja0NvbG9yID0gKHJvdyArIGNvbCkgJSAyID09PSAwID8gJyNkYWUzZjMnIDogJyNmZmZmZmYnO1xuICB2YXIgdGV4dENvbG9yID0gaGlnaGxpZ2h0ZWQgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgaWYgKGhpZ2hsaWdodGVkKSB7XG4gICAgYmFja0NvbG9yID0gJyMwMGIwNTAnO1xuICB9XG4gIHZhciBiYWNrZ3JvdW5kSWQgPSBjZWxsSWQoJ2JhY2tncm91bmRMZXR0ZXInLCByb3csIGNvbCk7XG4gIHZhciB0ZXh0SWQgPSBjZWxsSWQoJ2xldHRlcicsIHJvdywgY29sKTtcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChiYWNrZ3JvdW5kSWQpLnNldEF0dHJpYnV0ZSgnZmlsbCcsIGJhY2tDb2xvcik7XG4gIHZhciB0ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGV4dElkKTtcbiAgdGV4dC5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCB0ZXh0Q29sb3IpO1xuXG4gIC8vIHNob3VsZCBvbmx5IGJlIGZhbHNlIGluIHVuaXQgdGVzdHNcbiAgaWYgKHRleHQuZ2V0QkJveCkge1xuICAgIC8vIGNlbnRlciB0ZXh0LlxuICAgIHZhciBiYm94ID0gdGV4dC5nZXRCQm94KCk7XG4gICAgdmFyIGhlaWdodERpZmYgPSBTUVVBUkVfU0laRSAtIGJib3guaGVpZ2h0O1xuICAgIHZhciB0YXJnZXRUb3BZID0gcm93ICogU1FVQVJFX1NJWkUgKyBoZWlnaHREaWZmIC8gMjtcbiAgICB2YXIgb2Zmc2V0ID0gdGFyZ2V0VG9wWSAtIGJib3gueTtcblxuICAgIHRleHQuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsIFwiICsgb2Zmc2V0ICsgXCIpXCIpO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcmsgdGhhdCB3ZSd2ZSB2aXNpdGVkIGEgdGlsZVxuICogQHBhcmFtIHtudW1iZXJ9IHJvdyBSb3cgdmlzaXRlZFxuICogQHBhcmFtIHtudW1iZXJ9IGNvbCBDb2x1bW4gdmlzaXRlZFxuICogQHBhcmFtIHtib29sZWFufSBhbmltYXRpbmcgVHJ1ZSBpZiB0aGlzIGlzIHdoaWxlIGFuaW1hdGluZ1xuICovXG5Xb3JkU2VhcmNoLnByb3RvdHlwZS5tYXJrVGlsZVZpc2l0ZWQgPSBmdW5jdGlvbiAocm93LCBjb2wsIGFuaW1hdGluZykge1xuICB2YXIgbGV0dGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2VsbElkKCdsZXR0ZXInLCByb3csIGNvbCkpLnRleHRDb250ZW50O1xuICB0aGlzLnZpc2l0ZWRfICs9IGxldHRlcjtcblxuICBpZiAoYW5pbWF0aW5nKSB7XG4gICAgdGhpcy51cGRhdGVUaWxlSGlnaGxpZ2h0Xyhyb3csIGNvbCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnRXb3JkQ29udGVudHMnKS50ZXh0Q29udGVudCA9IHRoaXMudmlzaXRlZF87XG4gIH1cbn07XG5cbi8qKlxuICogRm9yIHdvcmRzZWFyY2gsIHZhbHVlcyBpbiBNYXplLm1hcCBjYW4gdGFrZSB0aGUgZm9ybSBvZiBhIG51bWJlciAoaS5lLiAyIG1lYW5zXG4gKiBzdGFydCksIGEgbGV0dGVyICgnQScgbWVhbnMgQSksIG9yIGEgbGV0dGVyIGZvbGxvd2VkIGJ5IHggKCdOeCcgbWVhbnMgTiBhbmRcbiAqIHRoYXQgdGhpcyBpcyB0aGUgZmluaXNoLiAgVGhpcyBmdW5jdGlvbiB3aWxsIHN0cmlwIHRoZSB4LCBhbmQgd2lsbCBjb252ZXJ0XG4gKiBudW1iZXIgdmFsdWVzIHRvIFNUQVJUX0NIQVJcbiAqL1xuZnVuY3Rpb24gbGV0dGVyVmFsdWUodmFsKSB7XG4gIGlmICh0eXBlb2YodmFsKSA9PT0gXCJudW1iZXJcIikge1xuICAgIHJldHVybiBTVEFSVF9DSEFSO1xuICB9XG5cbiAgaWYgKHR5cGVvZih2YWwpID09PSBcInN0cmluZ1wiKSB7XG4gICAgLy8gdGVtcG9yYXJ5IGhhY2sgdG8gYWxsb3cgdXMgdG8gaGF2ZSA0IGFzIGEgbGV0dGVyXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDIgJiYgdmFsWzBdID09PSAnXycpIHtcbiAgICAgIHJldHVybiB2YWxbMV07XG4gICAgfVxuICAgIHJldHVybiB2YWxbMF07XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmV4cGVjdGVkIHZhbHVlIGZvciBsZXR0ZXJWYWx1ZVwiKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20gdXBwZXJjYXNlIGxldHRlciB0aGF0IGlzbid0IGluIHRoZSBsaXN0IG9mIHJlc3RyaWN0aW9uc1xuICovXG5mdW5jdGlvbiByYW5kb21MZXR0ZXIgKHJlc3RyaWN0aW9ucykge1xuICB2YXIgbGV0dGVyUG9vbDtcbiAgaWYgKHJlc3RyaWN0aW9ucykge1xuICAgIC8vIGFyZ3MgY29uc2lzdHMgb2YgQUxMX0NIQVJTIGZvbGxvd2VkIGJ5IHRoZSBzZXQgb2YgcmVzdHJpY3RlZCBsZXR0ZXJzXG4gICAgdmFyIGFyZ3MgPSByZXN0cmljdGlvbnMgfHwgW107XG4gICAgYXJncy51bnNoaWZ0KEFMTF9DSEFSUyk7XG4gICAgbGV0dGVyUG9vbCA9IF8ud2l0aG91dC5hcHBseShudWxsLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBsZXR0ZXJQb29sID0gQUxMX0NIQVJTO1xuICB9XG5cbiAgcmV0dXJuIF8uc2FtcGxlKGxldHRlclBvb2wpO1xufVxuXG5cblxuLyogc3RhcnQtdGVzdC1ibG9jayAqL1xuLy8gZXhwb3J0IHByaXZhdGUgZnVuY3Rpb24ocykgdG8gZXhwb3NlIHRvIHVuaXQgdGVzdGluZ1xuV29yZFNlYXJjaC5fX3Rlc3Rvbmx5X18gPSB7XG4gIGxldHRlclZhbHVlOiBsZXR0ZXJWYWx1ZSxcbiAgcmFuZG9tTGV0dGVyOiByYW5kb21MZXR0ZXIsXG4gIFNUQVJUX0NIQVI6IFNUQVJUX0NIQVIsXG4gIEVNUFRZX0NIQVI6IEVNUFRZX0NIQVJcbn07XG4vKiBlbmQtdGVzdC1ibG9jayAqL1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJzdmdNYXplXCI+XFxuICA8ZyBpZD1cImxvb2tcIj5cXG4gICAgPHBhdGggZD1cIk0gMCwtMTUgYSAxNSAxNSAwIDAgMSAxNSAxNVwiIC8+XFxuICAgIDxwYXRoIGQ9XCJNIDAsLTM1IGEgMzUgMzUgMCAwIDEgMzUgMzVcIiAvPlxcbiAgICA8cGF0aCBkPVwiTSAwLC01NSBhIDU1IDU1IDAgMCAxIDU1IDU1XCIgLz5cXG4gIDwvZz5cXG48L3N2Zz5cXG48ZGl2IGlkPVwiY2FwYWNpdHlCdWJibGVcIj5cXG4gIDxkaXYgaWQ9XCJjYXBhY2l0eVwiPjwvZGl2PlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciBTcXVhcmVUeXBlID0gcmVxdWlyZSgnLi90aWxlcycpLlNxdWFyZVR5cGU7XG52YXIgRGlyZWN0aW9uID0gcmVxdWlyZSgnLi90aWxlcycpLkRpcmVjdGlvbjtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcblxudmFyIFRJTEVfU0hBUEVTID0ge1xuICAnbG9nJzogICAgICAgICAgICAgWzAsIDBdLFxuICAnbGlseTEnOiAgICAgICAgICAgWzEsIDBdLFxuICAnbGFuZDEnOiAgICAgICAgICAgWzIsIDBdLFxuICAnaXNsYW5kX3N0YXJ0JzogICAgWzAsIDFdLFxuICAnaXNsYW5kX3RvcFJpZ2h0JzogWzEsIDFdLFxuICAnaXNsYW5kX2JvdExlZnQnOiAgWzAsIDJdLFxuICAnaXNsYW5kX2JvdFJpZ2h0JzogWzEsIDJdLFxuICAnd2F0ZXInOiBbNCwgMF0sXG5cbiAgJ2xpbHkyJzogWzIsIDFdLFxuICAnbGlseTMnOiBbMywgMV0sXG4gICdsaWx5NCc6IFsyLCAyXSxcbiAgJ2xpbHk1JzogWzMsIDJdLFxuXG4gICdpY2UnOiBbMywgMF0sXG5cbiAgJ2VtcHR5JzogWzQsIDBdXG59O1xuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRpbGUgYXQgeCx5IGlzIGVpdGhlciBhIHdhdGVyIHRpbGUgb3Igb3V0IG9mIGJvdW5kc1xuZnVuY3Rpb24gaXNXYXRlck9yT3V0T2ZCb3VuZHMgKGNvbCwgcm93KSB7XG4gIHJldHVybiBNYXplLm1hcC5nZXRUaWxlKHJvdywgY29sKSA9PT0gU3F1YXJlVHlwZS5XQUxMIHx8XG4gICAgICBNYXplLm1hcC5nZXRUaWxlKHJvdywgY29sKSA9PT0gdW5kZWZpbmVkO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHRpbGUgYXQgeCx5IGlzIGEgd2F0ZXIgdGlsZSB0aGF0IGlzIGluIGJvdW5kcy5cbmZ1bmN0aW9uIGlzV2F0ZXIgKGNvbCwgcm93KSB7XG4gIHJldHVybiBNYXplLm1hcC5nZXRUaWxlKHJvdywgY29sKSA9PT0gU3F1YXJlVHlwZS5XQUxMO1xufVxuXG4vKipcbiAqIE92ZXJyaWRlIG1hemUncyBkcmF3TWFwVGlsZXNcbiAqL1xubW9kdWxlLmV4cG9ydHMuZHJhd01hcFRpbGVzID0gZnVuY3Rpb24gKHN2Zykge1xuICB2YXIgcm93LCBjb2w7XG5cbiAgLy8gZmlyc3QgZmlndXJlIG91dCB3aGVyZSB3ZSB3YW50IHRvIHB1dCB0aGUgaXNsYW5kXG4gIHZhciBwb3NzaWJsZUlzbGFuZExvY2F0aW9ucyA9IFtdO1xuICBmb3IgKHJvdyA9IDA7IHJvdyA8IE1hemUubWFwLlJPV1M7IHJvdysrKSB7XG4gICAgZm9yIChjb2wgPSAwOyBjb2wgPCBNYXplLm1hcC5DT0xTOyBjb2wrKykge1xuICAgICAgaWYgKCFpc1dhdGVyKGNvbCwgcm93KSB8fCAhaXNXYXRlcihjb2wgKyAxLCByb3cpIHx8XG4gICAgICAgICFpc1dhdGVyKGNvbCwgcm93ICsgMSkgfHwgIWlzV2F0ZXIoY29sICsgMSwgcm93ICsgMSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBwb3NzaWJsZUlzbGFuZExvY2F0aW9ucy5wdXNoKHtyb3c6IHJvdywgY29sOiBjb2x9KTtcbiAgICB9XG4gIH1cbiAgdmFyIGlzbGFuZCA9IF8uc2FtcGxlKHBvc3NpYmxlSXNsYW5kTG9jYXRpb25zKTtcbiAgdmFyIHByZUZpbGxlZCA9IHt9O1xuICBpZiAoaXNsYW5kKSB7XG4gICAgcHJlRmlsbGVkWyhpc2xhbmQucm93ICsgMCkgKyBcIl9cIiArIChpc2xhbmQuY29sICsgMCldID0gJ2lzbGFuZF9zdGFydCc7XG4gICAgcHJlRmlsbGVkWyhpc2xhbmQucm93ICsgMSkgKyBcIl9cIiArIChpc2xhbmQuY29sICsgMCldID0gJ2lzbGFuZF9ib3RMZWZ0JztcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAwKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAxKV0gPSAnaXNsYW5kX3RvcFJpZ2h0JztcbiAgICBwcmVGaWxsZWRbKGlzbGFuZC5yb3cgKyAxKSArIFwiX1wiICsgKGlzbGFuZC5jb2wgKyAxKV0gPSAnaXNsYW5kX2JvdFJpZ2h0JztcbiAgfVxuXG4gIHZhciB0aWxlSWQgPSAwO1xuICB2YXIgdGlsZTtcbiAgZm9yIChyb3cgPSAwOyByb3cgPCBNYXplLm1hcC5ST1dTOyByb3crKykge1xuICAgIGZvciAoY29sID0gMDsgY29sIDwgTWF6ZS5tYXAuQ09MUzsgY29sKyspIHtcbiAgICAgIGlmICghaXNXYXRlck9yT3V0T2ZCb3VuZHMoY29sLCByb3cpKSB7XG4gICAgICAgIHRpbGUgPSAnaWNlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhZGphY2VudFRvUGF0aCA9ICFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wsIHJvdyAtIDEpIHx8XG4gICAgICAgICAgIWlzV2F0ZXJPck91dE9mQm91bmRzKGNvbCArIDEsIHJvdykgfHxcbiAgICAgICAgICAhaXNXYXRlck9yT3V0T2ZCb3VuZHMoY29sLCByb3cgKyAxKSB8fFxuICAgICAgICAgICFpc1dhdGVyT3JPdXRPZkJvdW5kcyhjb2wgLSAxLCByb3cpO1xuXG4gICAgICAgIC8vIGlmIG5leHQgdG8gdGhlIHBhdGgsIGFsd2F5cyBqdXN0IGhhdmUgd2F0ZXIuIG90aGVyd2lzZSwgdGhlcmUnc1xuICAgICAgICAvLyBhIGNoYW5jZSBvZiBvbmUgb2Ygb3VyIG90aGVyIHRpbGVzXG4gICAgICAgIHRpbGUgPSAnd2F0ZXInO1xuXG4gICAgICAgIHRpbGUgPSBwcmVGaWxsZWRbcm93ICsgXCJfXCIgKyBjb2xdO1xuICAgICAgICBpZiAoIXRpbGUpIHtcbiAgICAgICAgICB0aWxlID0gXy5zYW1wbGUoWydlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdlbXB0eScsICdsaWx5MicsXG4gICAgICAgICAgICAnbGlseTMnLCAnbGlseTQnLCAnbGlseTUnLCAnbGlseTEnLCAnbG9nJywgJ2xpbHkxJywgJ2xhbmQxJ10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFkamFjZW50VG9QYXRoICYmIHRpbGUgPT09ICdsYW5kMScpIHtcbiAgICAgICAgICB0aWxlID0gJ2VtcHR5JztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgTWF6ZS5kcmF3VGlsZShzdmcsIFRJTEVfU0hBUEVTW3RpbGVdLCByb3csIGNvbCwgdGlsZUlkKTtcbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTY2hlZHVsZSB0aGUgYW5pbWF0aW9ucyBmb3IgU2NyYXQgZGFuY2luZy5cbiAqIEBwYXJhbSB7aW50ZWdlcn0gdGltZUFsbG90ZWQgSG93IG11Y2ggdGltZSB3ZSBoYXZlIGZvciBvdXIgYW5pbWF0aW9uc1xuICovXG5tb2R1bGUuZXhwb3J0cy5zY2hlZHVsZURhbmNlID0gZnVuY3Rpb24gKHZpY3RvcnlEYW5jZSwgdGltZUFsbG90ZWQsIHNraW4pIHtcbiAgdmFyIGZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmluaXNoJyk7XG4gIGlmIChmaW5pc2hJY29uKSB7XG4gICAgZmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH1cblxuICB2YXIgbnVtRnJhbWVzID0gc2tpbi5jZWxlYnJhdGVQZWdtYW5Sb3c7XG4gIHZhciB0aW1lUGVyRnJhbWUgPSB0aW1lQWxsb3RlZCAvIG51bUZyYW1lcztcbiAgdmFyIHN0YXJ0ID0ge3g6IE1hemUucGVnbWFuWCwgeTogTWF6ZS5wZWdtYW5ZfTtcblxuICBNYXplLnNjaGVkdWxlU2hlZXRlZE1vdmVtZW50KHt4OiBzdGFydC54LCB5OiBzdGFydC55fSwge3g6IDAsIHk6IDAgfSxcbiAgICBudW1GcmFtZXMsIHRpbWVQZXJGcmFtZSwgJ2NlbGVicmF0ZScsIERpcmVjdGlvbi5OT1JUSCwgdHJ1ZSk7XG5cbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG59O1xuIiwidmFyIE1hemVNYXAgPSBmdW5jdGlvbiAoZ3JpZCkge1xuICB0aGlzLmdyaWRfID0gZ3JpZDtcblxuICB0aGlzLlJPV1MgPSB0aGlzLmdyaWRfLmxlbmd0aDtcbiAgdGhpcy5DT0xTID0gdGhpcy5ncmlkX1swXS5sZW5ndGg7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBNYXplTWFwO1xuXG5NYXplTWFwLnByb3RvdHlwZS5yZXNldERpcnQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZm9yRWFjaENlbGwoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICBpZiAoY2VsbC5pc0RpcnQoKSkge1xuICAgICAgY2VsbC5yZXNldEN1cnJlbnRWYWx1ZSgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5NYXplTWFwLnByb3RvdHlwZS5mb3JFYWNoQ2VsbCA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLmdyaWRfLmZvckVhY2goZnVuY3Rpb24gKHJvdywgeCkge1xuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCB5KSB7XG4gICAgICBjYihjZWxsLCB4LCB5KTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5NYXplTWFwLnByb3RvdHlwZS5pc0RpcnQgPSBmdW5jdGlvbiAoeCwgeSkge1xuICByZXR1cm4gdGhpcy5ncmlkX1t4XSAmJiB0aGlzLmdyaWRfW3hdW3ldICYmIHRoaXMuZ3JpZF9beF1beV0uaXNEaXJ0KCk7XG59O1xuXG5NYXplTWFwLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgcmV0dXJuIHRoaXMuZ3JpZF9beF0gJiYgdGhpcy5ncmlkX1t4XVt5XSAmJiB0aGlzLmdyaWRfW3hdW3ldLmdldFRpbGUoKTtcbn07XG5cbk1hemVNYXAucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgcmV0dXJuIHRoaXMuZ3JpZF9beF0gJiYgdGhpcy5ncmlkX1t4XVt5XSAmJiB0aGlzLmdyaWRfW3hdW3ldLmdldEN1cnJlbnRWYWx1ZSgpO1xufTtcblxuTWF6ZU1hcC5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAoeCwgeSwgdmFsKSB7XG4gIGlmICh0aGlzLmdyaWRfW3hdICYmIHRoaXMuZ3JpZF9beF1beV0pIHtcbiAgICB0aGlzLmdyaWRfW3hdW3ldLnNldEN1cnJlbnRWYWx1ZSh2YWwpO1xuICB9XG59O1xuXG5NYXplTWFwLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZ3JpZF8ubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgcmV0dXJuIGNlbGwuY2xvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5NYXplTWFwLmRlc2VyaWFsaXplID0gZnVuY3Rpb24gKHNlcmlhbGl6ZWRWYWx1ZXMsIGNlbGxDbGFzcykge1xuICByZXR1cm4gbmV3IE1hemVNYXAoc2VyaWFsaXplZFZhbHVlcy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGNlbGxDbGFzcy5kZXNlcmlhbGl6ZSk7XG4gIH0pKTtcbn07XG5cbk1hemVNYXAucGFyc2VGcm9tT2xkVmFsdWVzID0gZnVuY3Rpb24gKG1hcCwgaW5pdGlhbERpcnQsIGNlbGxDbGFzcykge1xuICByZXR1cm4gbmV3IE1hemVNYXAobWFwLm1hcChmdW5jdGlvbiAocm93LCB4KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoZnVuY3Rpb24gKG1hcENlbGwsIHkpIHtcbiAgICAgIHZhciBpbml0aWFsRGlydENlbGwgPSBpbml0aWFsRGlydCAmJiBpbml0aWFsRGlydFt4XVt5XTtcbiAgICAgIHJldHVybiBjZWxsQ2xhc3MucGFyc2VGcm9tT2xkVmFsdWVzKG1hcENlbGwsIGluaXRpYWxEaXJ0Q2VsbCk7XG4gICAgfSk7XG4gIH0pKTtcbn07XG4iLCJ2YXIgRGlyZWN0aW9uID0gcmVxdWlyZSgnLi90aWxlcycpLkRpcmVjdGlvbjtcbnZhciBrYXJlbExldmVscyA9IHJlcXVpcmUoJy4va2FyZWxMZXZlbHMnKTtcbnZhciB3b3Jkc2VhcmNoTGV2ZWxzID0gcmVxdWlyZSgnLi93b3Jkc2VhcmNoTGV2ZWxzJyk7XG52YXIgcmVxQmxvY2tzID0gcmVxdWlyZSgnLi9yZXF1aXJlZEJsb2NrcycpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBtYXplTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCB0b29sYm94LlxudmFyIHRvb2xib3ggPSBmdW5jdGlvbihwYWdlLCBsZXZlbCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi90b29sYm94ZXMvbWF6ZS54bWwuZWpzJykoe1xuICAgIHBhZ2U6IHBhZ2UsXG4gICAgbGV2ZWw6IGxldmVsXG4gIH0pO1xufTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCBzdGFydEJsb2Nrcy5cbnZhciBzdGFydEJsb2NrcyA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL3N0YXJ0QmxvY2tzLnhtbC5lanMnKSh7XG4gICAgcGFnZTogcGFnZSxcbiAgICBsZXZlbDogbGV2ZWxcbiAgfSk7XG59O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRm9ybWVybHkgUGFnZSAyXG5cbiAgJzJfMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMSksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMywgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDEpXG4gIH0sXG4gICdrMV9kZW1vJzoge1xuICAgICd0b29sYm94JzogYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlTm9ydGgnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVTb3V0aCcpICtcbiAgICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZUVhc3QnKSArXG4gICAgICBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVXZXN0JykgK1xuICAgICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnY29udHJvbHNfcmVwZWF0X3NpbXBsaWZpZWQnKVxuICAgICksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMywgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDEpXG4gIH0sXG4gICcyXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDIpLFxuICAgICdpZGVhbCc6IDMsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAyLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAzLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMilcbiAgfSxcbiAgJzJfMl81Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAzKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgNCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgNCwgMCwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDMpXG4gIH0sXG4gICcyXzMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDMpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCA0LCAxLCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMylcbiAgfSxcbiAgJzJfNCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNCksXG4gICAgJ2lkZWFsJzogOSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDIsIDQsIDAsIDMsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl81Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA1KSxcbiAgICAnaWRlYWwnOiAzLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuRk9SX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDIsIDEsIDEsIDEsIDEsIDMsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl82Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA2KSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLkZPUl9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAyLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAxLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAzLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfNyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNyksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLkZPUl9MT09QXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAzLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAxLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAxLCAxLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfOCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgOCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLkZPUl9MT09QXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMywgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDgpLFxuICAgICdsZXZlbEluY29tcGxldGVFcnJvcic6IG1hemVNc2cucmVwZWF0Q2FyZWZ1bGx5RXJyb3IoKSxcbiAgICAndG9vRmV3QmxvY2tzTXNnJzogbWF6ZU1zZy5yZXBlYXRDYXJlZnVsbHlFcnJvcigpXG4gIH0sXG4gICcyXzknOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDkpLFxuICAgICdpZGVhbCc6IDMsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAyLCAxLCAxLCAxLCAxLCAzLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTAnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEwKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuV0hJTEVfTE9PUF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMywgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzExJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxMSksXG4gICAgJ2lkZWFsJzogNixcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMywgMV0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMSwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMSwgMSwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMiwgMSwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzEyJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxMiksXG4gICAgJ2lkZWFsJzogNixcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMSwgMiwgNCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMSwgMSwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMywgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMSwgMV1cbiAgICBdXG4gIH0sXG4gICcyXzEzJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxMyksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMywgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMiwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgNCwgMCwgMF1cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDEzKVxuICB9LFxuICAnMl8xNCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTQpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLklTX1BBVEhfUklHSFRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCA0LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAxLCA0XSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAwLCAwXSxcbiAgICAgIFswLCAzLCAxLCAxLCAxLCAxLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ2xldmVsSW5jb21wbGV0ZUVycm9yJzogbWF6ZU1zZy5pZkluUmVwZWF0RXJyb3IoKSxcbiAgICAnc2hvd1ByZXZpb3VzTGV2ZWxCdXR0b24nOiB0cnVlXG4gIH0sXG4gICcyXzE1Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxNSksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5JU19QQVRIX0xFRlRdLFxuICAgICAgW3JlcUJsb2Nrcy5XSElMRV9MT09QXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLk5PUlRILFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgNCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMSwgMSwgMSwgMSwgMSwgMCwgMF0sXG4gICAgICBbMCwgMSwgMCwgMCwgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMSwgMCwgMywgMCwgMSwgMCwgMF0sXG4gICAgICBbMCwgMSwgMCwgMSwgMCwgMSwgMSwgNF0sXG4gICAgICBbMCwgMSwgMSwgMSwgMCwgMiwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICcyXzE2Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAxNiksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdLFxuICAgICAgW3JlcUJsb2Nrcy5UVVJOX1JJR0hUXSxcbiAgICAgIFtyZXFCbG9ja3MuSVNfUEFUSF9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCA0LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAxLCAxLCAxLCAyLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAxLCAxLCA0XSxcbiAgICAgIFswLCAxLCAxLCAzLCAwLCAxLCAwLCA0XSxcbiAgICAgIFswLCAxLCAwLCAwLCAwLCAxLCAwLCAxXSxcbiAgICAgIFswLCAxLCAxLCAxLCAxLCAxLCAxLCAxXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzJfMTcnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDE3KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLklTX1BBVEhfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDEsIDQsIDEsIDEsIDEsIDAsIDBdLFxuICAgICAgWzAsIDAsIDEsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzMsIDEsIDEsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgWzAsIDEsIDAsIDEsIDAsIDAsIDEsIDBdLFxuICAgICAgWzEsIDEsIDEsIDQsIDEsIDAsIDEsIDBdLFxuICAgICAgWzAsIDEsIDAsIDEsIDAsIDIsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xOCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuSVNfUEFUSF9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF0sXG4gICAgICBbcmVxQmxvY2tzLldISUxFX0xPT1BdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDQsIDAsIDQsIDAsIDQsIDBdLFxuICAgICAgWzAsIDAsIDEsIDAsIDEsIDAsIDEsIDBdLFxuICAgICAgWzAsIDIsIDEsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDAsIDEsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDEsIDBdLFxuICAgICAgWzAsIDAsIDEsIDEsIDAsIDEsIDEsIDBdLFxuICAgICAgWzAsIDEsIDMsIDEsIDEsIDEsIDEsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXVxuICB9LFxuICAnMl8xOSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTkpLFxuICAgICdpZGVhbCc6IDcsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5OT1JUSCxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDEsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzEsIDAsIDEsIDAsIDEsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDEsIDAsIDMsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDEsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzIsIDAsIDEsIDEsIDEsIDEsIDEsIDFdXG4gICAgIF0sXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgMTkpXG4gICB9LFxuXG4gIC8vIENvcGllZCBsZXZlbHMgd2l0aCBlZGl0Q29kZSBlbmFibGVkXG4gICczXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDEpLFxuICAgICdpZGVhbCc6IDMsXG4gICAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgICAndHVybkxlZnQnOiBudWxsLFxuICAgICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICAgW3JlcUJsb2Nrcy5NT1ZFX0ZPUldBUkRdXG4gICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAyLCAxLCAzLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzNfMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMiksXG4gICAgJ2lkZWFsJzogNCxcbiAgICAnZWRpdENvZGUnOiB0cnVlLFxuICAgICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAgICd0dXJuTGVmdCc6IG51bGwsXG4gICAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF1cbiAgICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAyLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAxLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAzLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF1cbiAgfSxcbiAgJzNfMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMyksXG4gICAgJ2lkZWFsJzogNixcbiAgICAnZWRpdENvZGUnOiB0cnVlLFxuICAgICdjb2RlRnVuY3Rpb25zJzoge1xuICAgICAgJ21vdmVGb3J3YXJkJzogbnVsbCxcbiAgICAgICd0dXJuTGVmdCc6IG51bGwsXG4gICAgICAndHVyblJpZ2h0JzogbnVsbCxcbiAgICB9LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MuTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9MRUZUXSxcbiAgICAgIFtyZXFCbG9ja3MuVFVSTl9SSUdIVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgNCwgMSwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgMSwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICczXzQnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDQpLFxuICAgICdpZGVhbCc6IDgsXG4gICAgJ2VkaXRDb2RlJzogdHJ1ZSxcbiAgICAnY29kZUZ1bmN0aW9ucyc6IHtcbiAgICAgICdtb3ZlRm9yd2FyZCc6IG51bGwsXG4gICAgICAndHVybkxlZnQnOiBudWxsLFxuICAgICAgJ3R1cm5SaWdodCc6IG51bGwsXG4gICAgfSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLk1PVkVfRk9SV0FSRF0sXG4gICAgICBbcmVxQmxvY2tzLlRVUk5fTEVGVF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgNCwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH0sXG4gICdjdXN0b20nOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDQpLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMiwgNCwgMywgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMSwgMSwgMSwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdXG4gIH1cbn07XG5cblxuLy8gTWVyZ2UgaW4gS2FyZWwgbGV2ZWxzLlxuZm9yICh2YXIgbGV2ZWxJZCBpbiBrYXJlbExldmVscykge1xuICBtb2R1bGUuZXhwb3J0c1sna2FyZWxfJyArIGxldmVsSWRdID0ga2FyZWxMZXZlbHNbbGV2ZWxJZF07XG59XG5cbi8vIE1lcmdlIGluIFdvcmRzZWFyY2ggbGV2ZWxzLlxuZm9yICh2YXIgbGV2ZWxJZCBpbiB3b3Jkc2VhcmNoTGV2ZWxzKSB7XG4gIG1vZHVsZS5leHBvcnRzWyd3b3Jkc2VhcmNoXycgKyBsZXZlbElkXSA9IHdvcmRzZWFyY2hMZXZlbHNbbGV2ZWxJZF07XG59XG5cbi8vIEFkZCBzb21lIHN0ZXAgbGV2ZWxzXG5mdW5jdGlvbiBjbG9uZVdpdGhTdGVwKGxldmVsLCBzdGVwLCBzdGVwT25seSkge1xuICB2YXIgb2JqID0gdXRpbHMuZXh0ZW5kKHt9LCBtb2R1bGUuZXhwb3J0c1tsZXZlbF0pO1xuXG4gIG9iai5zdGVwID0gc3RlcDtcbiAgb2JqLnN0ZXBPbmx5ID0gc3RlcE9ubHk7XG4gIG1vZHVsZS5leHBvcnRzW2xldmVsICsgJ19zdGVwJ10gPSBvYmo7XG59XG5cbmNsb25lV2l0aFN0ZXAoJzJfMScsIHRydWUsIHRydWUpO1xuY2xvbmVXaXRoU3RlcCgnMl8yJywgdHJ1ZSwgZmFsc2UpO1xuY2xvbmVXaXRoU3RlcCgnMl8xNycsIHRydWUsIGZhbHNlKTtcbmNsb25lV2l0aFN0ZXAoJ2thcmVsXzFfOScsIHRydWUsIGZhbHNlKTtcbmNsb25lV2l0aFN0ZXAoJ2thcmVsXzJfOScsIHRydWUsIGZhbHNlKTtcbiIsInZhciBEaXJlY3Rpb24gPSByZXF1aXJlKCcuL3RpbGVzJykuRGlyZWN0aW9uO1xudmFyIHJlcUJsb2NrcyA9IHJlcXVpcmUoJy4vcmVxdWlyZWRCbG9ja3MnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcblxudmFyIHdvcmRTZWFyY2hUb29sYm94ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gYmxvY2tVdGlscy5jcmVhdGVUb29sYm94KFxuICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZU5vcnRoJykgK1xuICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVNvdXRoJykgK1xuICAgIGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZUVhc3QnKSArXG4gICAgYmxvY2tVdGlscy5ibG9ja09mVHlwZSgnbWF6ZV9tb3ZlV2VzdCcpXG4gICk7XG59O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICdrXzEnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ3NlYXJjaFdvcmQnOiAnRUFTVCcsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAgMiwgJ0UnLCAnQScsICdTJywgJ1QnLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdLJywgJ0UnLCAnTCcsICdMJywgJ1knLCAnQicsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVFYXN0JylcbiAgfSxcbiAgJ2tfMic6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlU291dGhdLFxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnU09VVEgnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnQScsICdOJywgJ0cnLCAnSScsICdFJywgJ0QnLCAnTycsICdHJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgICAyLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdTJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnTycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ1UnLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdUJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnSCcsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdLFxuICAgICdzdGFydEJsb2Nrcyc6IGJsb2NrVXRpbHMuYmxvY2tPZlR5cGUoJ21hemVfbW92ZVNvdXRoJylcbiAgfSxcbiAgJ2tfMyc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlV2VzdF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ1dFU1QnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5XRVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnTCcsICdFJywgJ1YnLCAnRScsICdOJywgJ1MnLCAnTycsICdOJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgJ1QnLCAnUycsICdFJywgJ1cnLCAyLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXSxcbiAgICAnc3RhcnRCbG9ja3MnOiBibG9ja1V0aWxzLmJsb2NrT2ZUeXBlKCdtYXplX21vdmVXZXN0JylcbiAgfSxcbiAgJ2tfNCc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlTm9ydGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdOT1JUSCcsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLk5PUlRILFxuICAgIHN0ZXA6IHRydWUsXG4gICAgLy8gV2hlbiB0aGlzIGdldHMgcmVtb3ZlZCwgYWxzbyByZW1vdmUgdGhlIGhhY2sgZnJvbSBsZXR0ZXJWYWx1ZVxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ0cnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ0gnLCAnXycsICdPJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdUJywgJ18nLCAnXzQnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ1InLCAnXycsICdJJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdPJywgJ18nLCAnVCcsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnTicsICdfJywgJ0onLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgIDIgLCAnXycsICdSJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnRicsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9LFxuICAna182Jzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZVNvdXRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnSlVNUCcsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ1MnLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydBJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnWScsICdfJywgICAyLCAnSicsICdVJywgJ00nLCAnXycsICdfJ10sXG4gICAgICBbJ0UnLCAnXycsICdfJywgJ18nLCAnXycsICdQJywgJ18nLCAnXyddLFxuICAgICAgWydFJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnRCcsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9LFxuICAna185Jzoge1xuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlTm9ydGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdDT0RFJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdNJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnQScsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ1InLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdEJywgJ0UnLCAnXycsICdLJywgJ18nXSxcbiAgICAgIFsnXycsICAgMiwgJ0MnLCAnTycsICdfJywgJ18nLCAnTicsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ1AnLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdBJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnTScsICdfJ11cbiAgICBdXG4gIH0sXG4gICdrXzEzJzoge1xuICAgICdpc0sxJzogdHJ1ZSxcbiAgICAndG9vbGJveCc6IHdvcmRTZWFyY2hUb29sYm94KCksXG4gICAgJ2lkZWFsJzogNixcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbcmVxQmxvY2tzLm1vdmVFYXN0XSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZVNvdXRoXVxuICAgIF0sXG4gICAgJ3NlYXJjaFdvcmQnOiAnREVCVUcnLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICAgMiwgJ0QnLCAnRScsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ0InLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdVJywgJ0cnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ0gnLCAnRScsICdOJywgJ1InLCAnWSddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfMTUnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZVNvdXRoXSxcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdBQk9WRScsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgIHN0ZXA6IHRydWUsXG4gICAgbWFwOiBbXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgICAyLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdBJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnQicsICdPJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnVicsICdFJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXVxuICAgIF1cbiAgfSxcbiAgJ2tfMTYnOiB7XG4gICAgJ2lzSzEnOiB0cnVlLFxuICAgICd0b29sYm94Jzogd29yZFNlYXJjaFRvb2xib3goKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZXFCbG9ja3MubW92ZUVhc3RdLFxuICAgICAgW3JlcUJsb2Nrcy5tb3ZlTm9ydGhdXG4gICAgXSxcbiAgICAnc2VhcmNoV29yZCc6ICdCRUxPVycsXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgc3RlcDogdHJ1ZSxcbiAgICBtYXA6IFtcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ1cnLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdPJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ0UnLCAnTCcsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAgIDIsICdCJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXyddXG4gICAgXVxuICB9LFxuICAna18yMCc6IHtcbiAgICAnaXNLMSc6IHRydWUsXG4gICAgJ3Rvb2xib3gnOiB3b3JkU2VhcmNoVG9vbGJveCgpLFxuICAgICdpZGVhbCc6IDYsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3JlcUJsb2Nrcy5tb3ZlRWFzdF0sXG4gICAgICBbcmVxQmxvY2tzLm1vdmVTb3V0aF1cbiAgICBdLFxuICAgICdzZWFyY2hXb3JkJzogJ1NUT1JZJyxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICBzdGVwOiB0cnVlLFxuICAgIG1hcDogW1xuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICAgMiwgJ1MnLCAnVCcsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ08nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdSJywgJ18nLCAnXycsICdfJ10sXG4gICAgICBbJ18nLCAnXycsICdfJywgJ18nLCAnWScsICdfJywgJ18nLCAnXyddLFxuICAgICAgWydfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nXSxcbiAgICAgIFsnXycsICdfJywgJ18nLCAnXycsICdfJywgJ18nLCAnXycsICdfJ11cbiAgICBdXG4gIH1cblxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+PC9ibG9jaz5cXG4gICcpOzU7IGlmIChwYWdlID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgJyk7NTsgaWYgKGxldmVsID4gMikgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9mb3JldmVyXCI+PC9ibG9jaz5cXG4gICAgICAnKTs2OyBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmXCI+PHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhMZWZ0PC90aXRsZT48L2Jsb2NrPlxcbiAgICAgICcpOzc7IH0gZWxzZSBpZiAobGV2ZWwgPiA1ICYmIGxldmVsIDwgOSkgezsgYnVmLnB1c2goJyAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmXCI+PC9ibG9jaz5cXG4gICAgICAnKTs4OyB9OyBidWYucHVzaCgnICAgICAgJyk7ODsgaWYgKGxldmVsID4gOCkgezsgYnVmLnB1c2goJyAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZFbHNlXCI+PC9ibG9jaz5cXG4gICAgICAnKTs5OyB9OyBidWYucHVzaCgnICAgICcpOzk7IH07IGJ1Zi5wdXNoKCcgICcpOzk7IH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7OyBidWYucHVzaCgnICAgICcpOzk7IGlmIChsZXZlbCA+IDQgJiYgbGV2ZWwgPCA5KSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAnKTsxMjsgfTsgYnVmLnB1c2goJyAgICAnKTsxMjsgaWYgKGxldmVsID4gOCkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9mb3JldmVyXCI+PC9ibG9jaz5cXG4gICAgICAnKTsxMzsgaWYgKGxldmVsID09IDEzIHx8IGxldmVsID09IDE1KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfaWZcIj48dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aExlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgICAgJyk7MTQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTQgfHwgbGV2ZWwgPT0gMTYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZlwiPjx0aXRsZSBuYW1lPVwiRElSXCI+aXNQYXRoUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgICAgJyk7MTU7IH07IGJ1Zi5wdXNoKCcgICAgICAnKTsxNTsgaWYgKGxldmVsID4gMTYpIHs7IGJ1Zi5wdXNoKCcgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmRWxzZVwiPjwvYmxvY2s+XFxuICAgICAgJyk7MTY7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTY7IH07IGJ1Zi5wdXNoKCcgICcpOzE2OyB9OyBidWYucHVzaCgnPC94bWw+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyBpZiAocGFnZSA9PSAyKSB7OyBidWYucHVzaCgnICAnKTsxOyBpZiAobGV2ZWwgPCA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTsyOyB9IGVsc2UgaWYgKGxldmVsID09IDgpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4zPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTMpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZvcmV2ZXJcIiB4PVwiMjBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9pZlwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhMZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7MTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTkpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZvcmV2ZXJcIiB4PVwiMjBcIiB5PVwiNzBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmRWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aEZvcndhcmQ8L3RpdGxlPlxcbiAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJFTFNFXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2lmRWxzZVwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5pc1BhdGhSaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Mjk7IH07IGJ1Zi5wdXNoKCcnKTsyOTsgfTsgYnVmLnB1c2goJycpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciByZXF1aXJlZEJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9yZXF1aXJlZF9ibG9ja191dGlscycpO1xuXG52YXIgTU9WRV9GT1JXQVJEID0geyd0ZXN0JzogJ21vdmVGb3J3YXJkJywgJ3R5cGUnOiAnbWF6ZV9tb3ZlRm9yd2FyZCd9O1xudmFyIFRVUk5fTEVGVCA9IHsndGVzdCc6ICd0dXJuTGVmdCcsICd0eXBlJzogJ21hemVfdHVybicsICd0aXRsZXMnOiB7J0RJUic6ICd0dXJuTGVmdCd9fTtcbnZhciBUVVJOX1JJR0hUID0geyd0ZXN0JzogJ3R1cm5SaWdodCcsICd0eXBlJzogJ21hemVfdHVybicsICd0aXRsZXMnOiB7J0RJUic6ICd0dXJuUmlnaHQnfX07XG52YXIgV0hJTEVfTE9PUCA9IHsndGVzdCc6ICd3aGlsZScsICd0eXBlJzogJ21hemVfZm9yZXZlcid9O1xudmFyIElTX1BBVEhfTEVGVCA9IHsndGVzdCc6ICdpc1BhdGhMZWZ0JywgJ3R5cGUnOiAnbWF6ZV9pZicsICd0aXRsZXMnOiB7J0RJUic6ICdpc1BhdGhMZWZ0J319O1xudmFyIElTX1BBVEhfUklHSFQgPSB7J3Rlc3QnOiAnaXNQYXRoUmlnaHQnLCAndHlwZSc6ICdtYXplX2lmJywgJ3RpdGxlcyc6IHsnRElSJzogJ2lzUGF0aFJpZ2h0J319O1xudmFyIElTX1BBVEhfRk9SV0FSRCA9IHsndGVzdCc6ICdpc1BhdGhGb3J3YXJkJywgJ3R5cGUnOiAnbWF6ZV9pZkVsc2UnLCAndGl0bGVzJzogeydESVInOiAnaXNQYXRoRm9yd2FyZCd9fTtcbnZhciBGT1JfTE9PUCA9IHsndGVzdCc6ICdmb3InLCAndHlwZSc6ICdjb250cm9sc19yZXBlYXQnLCB0aXRsZXM6IHtUSU1FUzogJz8/Pyd9fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVOb3J0aDogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrKCdtYXplX21vdmVOb3J0aCcpLFxuICBtb3ZlU291dGg6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jaygnbWF6ZV9tb3ZlU291dGgnKSxcbiAgbW92ZUVhc3Q6IHJlcXVpcmVkQmxvY2tVdGlscy5zaW1wbGVCbG9jaygnbWF6ZV9tb3ZlRWFzdCcpLFxuICBtb3ZlV2VzdDogcmVxdWlyZWRCbG9ja1V0aWxzLnNpbXBsZUJsb2NrKCdtYXplX21vdmVXZXN0JyksXG4gIGNvbnRyb2xzX3JlcGVhdF9zaW1wbGlmaWVkOiByZXF1aXJlZEJsb2NrVXRpbHMucmVwZWF0U2ltcGxlQmxvY2soJz8/PycpLFxuICBNT1ZFX0ZPUldBUkQ6IE1PVkVfRk9SV0FSRCxcbiAgVFVSTl9MRUZUOiBUVVJOX0xFRlQsXG4gIFRVUk5fUklHSFQ6IFRVUk5fUklHSFQsXG4gIFdISUxFX0xPT1A6IFdISUxFX0xPT1AsXG4gIElTX1BBVEhfTEVGVDogSVNfUEFUSF9MRUZULFxuICBJU19QQVRIX1JJR0hUOiBJU19QQVRIX1JJR0hULFxuICBJU19QQVRIX0ZPUldBUkQ6IElTX1BBVEhfRk9SV0FSRCxcbiAgRk9SX0xPT1A6IEZPUl9MT09QXG59O1xuIiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIGxldmVsQmFzZSA9IHJlcXVpcmUoJy4uL2xldmVsX2Jhc2UnKTtcbnZhciBEaXJlY3Rpb24gPSByZXF1aXJlKCcuL3RpbGVzJykuRGlyZWN0aW9uO1xudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG5cbi8vVE9ETzogRml4IGhhY2t5IGxldmVsLW51bWJlci1kZXBlbmRlbnQgdG9vbGJveC5cbnZhciB0b29sYm94ID0gZnVuY3Rpb24ocGFnZSwgbGV2ZWwpIHtcbiAgdmFyIHRlbXBsYXRlO1xuICAvLyBNdXN0IHVzZSBzd2l0Y2gsIHNpbmNlIGJyb3dzZXJpZnkgb25seSB3b3JrcyBvbiByZXF1aXJlcyB3aXRoIGxpdGVyYWxzLlxuICBzd2l0Y2ggKHBhZ2UpIHtcbiAgICBjYXNlIDE6XG4gICAgICB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbGJveGVzL2thcmVsMS54bWwuZWpzJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDI6XG4gICAgICB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbGJveGVzL2thcmVsMi54bWwuZWpzJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbGJveGVzL2thcmVsMy54bWwuZWpzJyk7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gdGVtcGxhdGUoe2xldmVsOiBsZXZlbH0pO1xufTtcblxuLy9UT0RPOiBGaXggaGFja3kgbGV2ZWwtbnVtYmVyLWRlcGVuZGVudCBzdGFydEJsb2Nrcy5cbnZhciBzdGFydEJsb2NrcyA9IGZ1bmN0aW9uKHBhZ2UsIGxldmVsKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL2thcmVsU3RhcnRCbG9ja3MueG1sLmVqcycpKHtcbiAgICBwYWdlOiBwYWdlLFxuICAgIGxldmVsOiBsZXZlbFxuICB9KTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1vdmVfZm9yd2FyZFwiIGJsb2NrLlxudmFyIE1PVkVfRk9SV0FSRCA9IHtcbiAgICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnbWF6ZV9tb3ZlRm9yd2FyZCc7fSxcbiAgICAndHlwZSc6ICdtYXplX21vdmVGb3J3YXJkJ1xufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiZGlnXCIgYmxvY2suXG52YXIgRElHID0geyd0ZXN0JzogJ2RpZycsICd0eXBlJzogJ21hemVfZGlnJ307XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImZpbGxcIiBibG9jay5cbnZhciBGSUxMID0geyd0ZXN0JzogJ2ZpbGwnLCAndHlwZSc6ICdtYXplX2ZpbGwnfTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiY29udHJvbHNfcmVwZWF0XCIgYmxvY2suXG52YXIgUkVQRUFUID0ge1xuICAgICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICdjb250cm9sc19yZXBlYXQnO30sXG4gICAgJ3R5cGUnOiAnY29udHJvbHNfcmVwZWF0JyxcbiAgICAndGl0bGVzJzogeydUSU1FUyc6ICc/Pz8nfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwiY29udHJvbHNfcmVwZWF0X2V4dFwiIGJsb2NrLlxudmFyIFJFUEVBVF9FWFQgPSB7XG4gICAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgcmV0dXJuIGJsb2NrLnR5cGUgPT0gJ2NvbnRyb2xzX3JlcGVhdF9leHQnO30sXG4gICAgJ3R5cGUnOiAnY29udHJvbHNfcmVwZWF0X2V4dCdcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImNvbnRyb2xzX2ZvclwiIGJsb2NrLlxudmFyIENPTlRST0xTX0ZPUiA9IHtcbiAgICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICByZXR1cm4gYmxvY2sudHlwZSA9PSAnY29udHJvbHNfZm9yJzt9LFxuICAgICd0eXBlJzogJ2NvbnRyb2xzX2Zvcidcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcInZhcmlhYmxlc19nZXRcIiBibG9jay5cbnZhciBWQVJJQUJMRVNfR0VUID0ge1xuICAgICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICAgIHJldHVybiBibG9jay50eXBlID09ICd2YXJpYWJsZXNfZ2V0Jzt9LFxuICAgICd0eXBlJzogJ3ZhcmlhYmxlc19nZXQnLFxuICAgICd0aXRsZXMnOiB7J1ZBUic6ICdpJ31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdHVyblwiIGJsb2NrIHR1cm5pbmcgbGVmdC5cbnZhciBUVVJOX0xFRlQgPSB7XG4gICd0ZXN0JzogJ3R1cm5MZWZ0JyxcbiAgJ3R5cGUnOiAnbWF6ZV90dXJuJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ3R1cm5MZWZ0J31cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdHVyblwiIGJsb2NrIHR1cm5pbmcgcmlnaHQuXG52YXIgVFVSTl9SSUdIVCA9IHtcbiAgJ3Rlc3QnOiAndHVyblJpZ2h0JyxcbiAgJ3R5cGUnOiAnbWF6ZV90dXJuJyxcbiAgJ3RpdGxlcyc6IHsnRElSJzogJ3R1cm5SaWdodCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3VudGlsQmxvY2tlZFwiIGJsb2NrLlxudmFyIFVOVElMX0JMT0NLRUQgPSB7XG4gICd0ZXN0JzogJ3doaWxlIChNYXplLmlzUGF0aEZvcndhcmQnLFxuICAndHlwZSc6ICdtYXplX3VudGlsQmxvY2tlZCdcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiIGJsb2NrIHdpdGggdGhlIG9wdGlvbiBcInBpbGVQcmVzZW50XCIgc2VsZWN0ZWQuXG52YXIgV0hJTEVfT1BUX1BJTEVfUFJFU0VOVCA9IHtcbiAgJ3Rlc3QnOiAnd2hpbGUgKE1hemUucGlsZVByZXNlbnQnLFxuICAndHlwZSc6ICdtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXInLFxuICAndGl0bGVzJzogeydESVInOiAncGlsZVByZXNlbnQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCIgYmxvY2sgd2l0aCB0aGUgb3B0aW9uIFwiaG9sZVByZXNlbnRcIiBzZWxlY3RlZC5cbnZhciBXSElMRV9PUFRfSE9MRV9QUkVTRU5UID0ge1xuICAndGVzdCc6ICd3aGlsZSAoTWF6ZS5ob2xlUHJlc2VudCcsXG4gICd0eXBlJzogJ21hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhcicsXG4gICd0aXRsZXMnOiB7J0RJUic6ICdob2xlUHJlc2VudCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIiBibG9jayB3aXRoIHRoZSBvcHRpb24gXCJpc1BhdGhGb3J3YXJkXCIgc2VsZWN0ZWQuXG52YXIgV0hJTEVfT1BUX1BBVEhfQUhFQUQgPSB7XG4gICd0ZXN0JzogJ3doaWxlIChNYXplLmlzUGF0aEZvcndhcmQnLFxuICAndHlwZSc6ICdtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXInLFxuICAndGl0bGVzJzogeydESVInOiAnaXNQYXRoRm9yd2FyZCd9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJrYXJlbF9pZlwiIGJsb2NrLlxudmFyIElGID0geyd0ZXN0JzogJ2lmJywgJ3R5cGUnOiAna2FyZWxfaWYnfTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwia2FyZWxfaWZcIiBibG9jayB3aXRoIHRoZSBvcHRpb24gXCJwaWxlUHJlc2VudFwiIHNlbGVjdGVkLlxudmFyIElGX09QVF9QSUxFX1BSRVNFTlQgPSB7XG4gICd0ZXN0JzogJ2lmIChNYXplLnBpbGVQcmVzZW50JyxcbiAgJ3R5cGUnOiAna2FyZWxfaWYnLFxuICAndGl0bGVzJzogeydESVInOiAncGlsZVByZXNlbnQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwia2FyZWxfaWZcIiBibG9jayB3aXRoIHRoZSBvcHRpb24gXCJob2xlUHJlc2VudFwiIHNlbGVjdGVkLlxudmFyIElGX09QVF9IT0xFX1BSRVNFTlQgPSB7XG4gICd0ZXN0JzogJ2lmIChNYXplLmhvbGVQcmVzZW50JyxcbiAgJ3R5cGUnOiAna2FyZWxfaWYnLFxuICAndGl0bGVzJzogeydESVInOiAnaG9sZVByZXNlbnQnfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwia2FyZWxfaWZFbHNlXCIgYmxvY2suXG52YXIgSUZfRUxTRSA9IHsndGVzdCc6ICd9IGVsc2UgeycsICd0eXBlJzogJ2thcmVsX2lmRWxzZSd9O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJmaWxsIG51bVwiIGJsb2NrLlxudmFyIGZpbGwgPSBmdW5jdGlvbihudW0pIHtcbiAgcmV0dXJuIHsndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IG1zZy5maWxsTih7c2hvdmVsZnVsczogbnVtfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICAgICAgICAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5maWxsTih7c2hvdmVsZnVsczogbnVtfSl9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcInJlbW92ZSBudW1cIiBibGNvay5cbnZhciByZW1vdmUgPSBmdW5jdGlvbihudW0pIHtcbiAgcmV0dXJuIHsndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09XG4gICAgICAgICAgICAgICAgbXNnLnJlbW92ZU4oe3Nob3ZlbGZ1bHM6IG51bX0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAgICAgICAgICd0aXRsZXMnOiB7J05BTUUnOiBtc2cucmVtb3ZlTih7c2hvdmVsZnVsczogbnVtfSl9fTtcbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImF2b2lkIHRoZSBjb3cgYW5kIHJlbW92ZSAxXCIgYmxvY2suXG52YXIgQVZPSURfT0JTVEFDTEVfQU5EX1JFTU9WRSA9IHtcbiAgJ3Rlc3QnOiBmdW5jdGlvbihibG9jaykge1xuICAgIHJldHVybiBibG9jay5nZXRUaXRsZVZhbHVlKCdOQU1FJykgPT0gbXNnLmF2b2lkQ293QW5kUmVtb3ZlKCk7XG4gIH0sXG4gICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5hdm9pZENvd0FuZFJlbW92ZSgpfVxufTtcblxuLy8gVGhpcyB0ZXN0cyBmb3IgYW5kIGNyZWF0ZXMgdGhlIFwicmVtb3ZlIDEgYW5kIGF2b2lkIHRoZSBjb3dcIiBibG9jay5cbnZhciBSRU1PVkVfQU5EX0FWT0lEX09CU1RBQ0xFID0ge1xuICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBtc2cucmVtb3ZlQW5kQXZvaWRUaGVDb3coKTtcbiAgfSxcbiAgJ3R5cGUnOiAncHJvY2VkdXJlc19jYWxsbm9yZXR1cm4nLFxuICAndGl0bGVzJzogeydOQU1FJzogbXNnLnJlbW92ZUFuZEF2b2lkVGhlQ293KCl9XG59O1xuXG4vLyBUaGlzIHRlc3RzIGZvciBhbmQgY3JlYXRlcyB0aGUgXCJyZW1vdmUgcGlsZXNcIiBibG9jay5cbnZhciBSRU1PVkVfUElMRVMgPSB7XG4gICd0ZXN0JzogZnVuY3Rpb24oYmxvY2spIHtcbiAgICByZXR1cm4gYmxvY2suZ2V0VGl0bGVWYWx1ZSgnTkFNRScpID09IG1zZy5yZW1vdmVTdGFjayh7c2hvdmVsZnVsczogNH0pO1xuICB9LFxuICAndHlwZSc6ICdwcm9jZWR1cmVzX2NhbGxub3JldHVybicsXG4gICd0aXRsZXMnOiB7J05BTUUnOiBtc2cucmVtb3ZlU3RhY2soe3Nob3ZlbGZ1bHM6IDR9KX1cbn07XG5cbi8vIFRoaXMgdGVzdHMgZm9yIGFuZCBjcmVhdGVzIHRoZSBcImZpbGwgaG9sZXNcIiBibG9jay5cbnZhciBGSUxMX0hPTEVTID0ge1xuICAndGVzdCc6IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgcmV0dXJuIGJsb2NrLmdldFRpdGxlVmFsdWUoJ05BTUUnKSA9PSBtc2cuZmlsbFN0YWNrKHtzaG92ZWxmdWxzOiAyfSk7XG4gIH0sXG4gICd0eXBlJzogJ3Byb2NlZHVyZXNfY2FsbG5vcmV0dXJuJyxcbiAgJ3RpdGxlcyc6IHsnTkFNRSc6IG1zZy5maWxsU3RhY2soe3Nob3ZlbGZ1bHM6IDJ9KX1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIEZvcm1lcmx5IHBhZ2UgMVxuICAnMV8xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCAxKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAxKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyLjBcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDIpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDIpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtGSUxMXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAyLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDEsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAtMiwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzMnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDMpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDMpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbUkVQRUFUXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMiwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5TT1VUSCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMTAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV80Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA0KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRElHXSwgW1RVUk5fTEVGVF0sIFtSRVBFQVRdXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDIsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV81Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA1KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCA1KSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbRklMTF0sIFtSRVBFQVRdLCBbVU5USUxfQkxPQ0tFRF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIC01LCAtNSwgLTUsIC01LCAtNSwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzYnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDYpLFxuICAgICdpZGVhbCc6IDQsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRElHXSxcbiAgICAgIFtXSElMRV9PUFRfUElMRV9QUkVTRU5ULCBSRVBFQVQsIFdISUxFX09QVF9QQVRIX0FIRUFEXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDEsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMiwgMSwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDEsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMSwgMSwgMCwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV83Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA3KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCA3KSxcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtUVVJOX1JJR0hUXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0ZJTExdLFxuICAgICAgW1dISUxFX09QVF9IT0xFX1BSRVNFTlRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDEsIDEsIDIsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgLTE4LCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMV84Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCA4KSxcbiAgICAnaWRlYWwnOiA0LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0ZJTExdLFxuICAgICAgW1dISUxFX09QVF9QQVRIX0FIRUFELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIC0xIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzknOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDkpLFxuICAgICdpZGVhbCc6IDEwLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0RJR10sXG4gICAgICBbV0hJTEVfT1BUX1BBVEhfQUhFQUQsIFJFUEVBVF0sXG4gICAgICBbVFVSTl9MRUZUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDIuNVxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAxLCAxLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzFfMTAnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDEsIDEwKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygxLCAxMCksXG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtESUddLFxuICAgICAgW0lGX09QVF9QSUxFX1BSRVNFTlRdLFxuICAgICAgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAyLjVcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMCwgMCwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcxXzExJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgxLCAxMSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMSwgMTEpLFxuICAgICdpZGVhbCc6IDcsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sXG4gICAgICBbRElHXSxcbiAgICAgIFtGSUxMXSxcbiAgICAgIFtJRl9PUFRfUElMRV9QUkVTRU5UXSxcbiAgICAgIFtJRl9PUFRfSE9MRV9QUkVTRU5UXSxcbiAgICAgIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMi41XG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAtMSwgMCwgMCwgLTEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gIC8vIEZvcm1lcmx5IHBhZ2UgMlxuXG4gICcyXzEnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDEpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDEpLFxuICAgICdpZGVhbCc6IG51bGwsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbRklMTF0sIFtUVVJOX0xFRlQsIFRVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAxLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgLTEsIDEsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgLTEsIDEsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl8yJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAyKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAyKSxcbiAgICAnaWRlYWwnOiA2LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbZmlsbCg1KV1cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMSwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDAsIDIsIDEsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMCwgMSwgMSwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDEsIDEsIDEsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIC01LCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl8zJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCAzKSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCAzKSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbZmlsbCg1KV0sIFtVTlRJTF9CTE9DS0VELCBSRVBFQVRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogMlxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMSwgMSwgMSwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAwLCAyLCAxLCAxLCAxLCAxLCAxLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAtNSwgLTUsIC01LCAtNSwgLTUsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl80Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA0KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA0KSxcbiAgICAnaWRlYWwnOiAxMyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbRElHXSxcbiAgICAgIFtSRVBFQVRdLFxuICAgICAgW3JlbW92ZSg3KV0sXG4gICAgICBbTU9WRV9GT1JXQVJEXSxcbiAgICAgIFtUVVJOX0xFRlRdLFxuICAgICAgW1RVUk5fUklHSFRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMSwgMSwgMSwgMSwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMSwgMCwgMCwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAxLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDEsIDIsIDEsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAxLCAxLCAxLCAxIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDcsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgNywgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCA3LCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDcsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJzJfNSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgNSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMiwgNSksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbRElHXSxcbiAgICAgIFtSRVBFQVRdLFxuICAgICAgW3JlbW92ZSg2KV0sXG4gICAgICBbTU9WRV9GT1JXQVJEXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDIsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMSwgMSwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDYsIDAsIDYsIDAsIDYsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzYnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDYpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDYpLFxuICAgICdpZGVhbCc6IDExLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtyZW1vdmUoOCldLCBbZmlsbCg4KV0sIFtNT1ZFX0ZPUldBUkRdLCBbVU5USUxfQkxPQ0tFRCwgUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDgsIDAsIDAsIDAsIDAsIDAsIDAsIC04IF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl83Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA3KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA3KSxcbiAgICAnaWRlYWwnOiAxMSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbVFVSTl9MRUZUXSwgW01PVkVfRk9SV0FSRF0sIFtUVVJOX1JJR0hUXSwgW0RJR11cbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMiwgNCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICcyXzgnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDIsIDgpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDgpLFxuICAgICdpZGVhbCc6IDEzLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtSRVBFQVRdLCBbQVZPSURfT0JTVEFDTEVfQU5EX1JFTU9WRV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDIsIDQsIDEsIDQsIDEsIDQsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDAsIDEsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl85Jzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgyLCA5KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygyLCA5KSxcbiAgICAnaWRlYWwnOiAxNCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbUkVNT1ZFX1BJTEVTXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnMl8xMCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMiwgMTApLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDIsIDEwKSxcbiAgICAnaWRlYWwnOiAyNyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbUkVNT1ZFX1BJTEVTXSxcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLFxuICAgICAgW0ZJTExfSE9MRVNdLFxuICAgICAgW0lGX09QVF9QSUxFX1BSRVNFTlQsIElGX0VMU0VdLFxuICAgICAgW1VOVElMX0JMT0NLRUQsIFJFUEVBVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDAsIDEsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMSwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAxLCAtMSwgMSwgLTEsIC0xLCAxLCAtMSwgMCBdLFxuICAgICAgWyAxLCAtMSwgMSwgLTEsIC0xLCAxLCAtMSwgMCBdXG4gICAgXVxuICB9LFxuXG4gIC8vIFBhZ2UgMyB0byBEZWJ1Z1xuXG4gICdkZWJ1Z19zZXFfMSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgMSksXG4gICAgJ2lkZWFsJzogOCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtGSUxMXSwgW1RVUk5fTEVGVF0sIFtUVVJOX1JJR0hUXVxuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCA0LCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDIsIDEsIDQsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAtMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19zZXFfMic6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMiksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgMiksXG4gICAgJ2lkZWFsJzogNyxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbTU9WRV9GT1JXQVJEXSwgW0RJR10sIFtUVVJOX0xFRlRdXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAxLCAxLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAyLCAxLCAxLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDAsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMSwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLlNPVVRILFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX3JlcGVhdCc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgMyksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgMyksXG4gICAgJ2lkZWFsJzogMTIsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtESUddLCBbVFVSTl9MRUZUXSwgW1RVUk5fUklHSFRdLCBbUkVQRUFUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMSwgMCwgMCwgMCwgMCwgMCwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAxLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDIsIDEsIDEsIDAsIDEgXSxcbiAgICAgIFsgMSwgMCwgMSwgMSwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAxLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDEsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uU09VVEgsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDUsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgNywgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfd2hpbGUnOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDQpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDQpLFxuICAgICdpZGVhbCc6IDUsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtSRVBFQVRdLCBbRklMTF0sIFtXSElMRV9PUFRfSE9MRV9QUkVTRU5UXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDNcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMiwgMSwgMSwgMSwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDEsIDEsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgLTE1LCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX2lmJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA1KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA1KSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbVFVSTl9MRUZUXSwgW1RVUk5fUklHSFRdLFxuICAgICAgW1JFUEVBVF0sIFtESUddLCBbSUZfT1BUX1BJTEVfUFJFU0VOVF1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzdGVwU3BlZWQnOiAzXG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDEsIDEsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMSwgMSwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAxLCAxLCAwLCAxIF0sXG4gICAgICBbIDIsIDEsIDAsIDEsIDEsIDAsIDEsIDEgXVxuICAgIF0sXG4gICAgJ3N0YXJ0RGlyZWN0aW9uJzogRGlyZWN0aW9uLkVBU1QsXG4gICAgJ2luaXRpYWxEaXJ0JzogW1xuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfaWZfZWxzZSc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgNiksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgNiksXG4gICAgJ2lkZWFsJzogMTAsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtUVVJOX0xFRlRdLCBbVFVSTl9SSUdIVF0sXG4gICAgICBbUkVQRUFUXSwgW0RJR10sIFtGSUxMXSwgW0lGX0VMU0UsIElGX09QVF9IT0xFX1BSRVNFTlRdXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAxLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMSwgMSwgMCwgMSBdLFxuICAgICAgWyAxLCAxLCAwLCAxLCAxLCAwLCAxLCAxIF0sXG4gICAgICBbIDEsIDAsIDEsIDEsIDAsIDEsIDEsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMSwgMSwgMCwgMCBdLFxuICAgICAgWyAyLCAxLCAwLCAxLCAxLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAtMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAxLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgLTEsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgLTEsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAtMSwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdkZWJ1Z19mdW5jdGlvbl8xJzoge1xuICAgICd0b29sYm94JzogdG9vbGJveCgzLCA3KSxcbiAgICAnc3RhcnRCbG9ja3MnOiBzdGFydEJsb2NrcygzLCA3KSxcbiAgICAnaWRlYWwnOiA4LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbVFVSTl9MRUZUXSwgW1JFUEVBVF0sIFtESUddXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDIsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDEsIDEsIDEsIDEsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdXG4gIH0sXG5cbiAgJ2RlYnVnX2Z1bmN0aW9uXzInOiB7XG4gICAgJ3Rvb2xib3gnOiB0b29sYm94KDMsIDgpLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDMsIDgpLFxuICAgICdpZGVhbCc6IDE3LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFtNT1ZFX0ZPUldBUkRdLCBbVFVSTl9MRUZUXSwgW1JFUEVBVF0sIFtESUddLCBbRklMTF0sXG4gICAgICBbbGV2ZWxCYXNlLmNhbGwobXNnLmZpbGxTcXVhcmUoKSldLFxuICAgICAgW2xldmVsQmFzZS5jYWxsKG1zZy5yZW1vdmVTcXVhcmUoKSldXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc3RlcFNwZWVkJzogM1xuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAxLCAwLCAxIF0sXG4gICAgICBbIDIsIDEsIDEsIDEsIDEsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgLTEsIC0xLCAtMSBdLFxuICAgICAgWyAxLCAwLCAxLCAwLCAwLCAtMSwgMCwgLTEgXSxcbiAgICAgIFsgMSwgMSwgMSwgMCwgMCwgLTEsIC0xLCAtMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXVxuICAgIF1cbiAgfSxcblxuICAnZGVidWdfZnVuY3Rpb25fMyc6IHtcbiAgICAndG9vbGJveCc6IHRvb2xib3goMywgOSksXG4gICAgJ3N0YXJ0QmxvY2tzJzogc3RhcnRCbG9ja3MoMywgOSksXG4gICAgJ2lkZWFsJzogMTIsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW01PVkVfRk9SV0FSRF0sIFtSRVBFQVRfRVhUXSwgW0RJR10sIFtDT05UUk9MU19GT1JdLFxuICAgICAgW2xldmVsQmFzZS5jYWxsV2l0aEFyZyhtc2cucmVtb3ZlUGlsZSgpLCBtc2cuaGVpZ2h0UGFyYW1ldGVyKCkpXSxcbiAgICAgIFtWQVJJQUJMRVNfR0VUXVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3N0ZXBTcGVlZCc6IDJcbiAgICB9LFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAxLCAwLCAwLCAwLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAxLCAyLCAxLCAxLCAxLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMSwgMSwgMCwgMCBdXG4gICAgXSxcbiAgICAnc3RhcnREaXJlY3Rpb24nOiBEaXJlY3Rpb24uRUFTVCxcbiAgICAnaW5pdGlhbERpcnQnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAxLCAyLCAzLCA0LCA1LCA2LCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCBdXG4gICAgXVxuICB9LFxuXG4gICdiZWVfMSc6IHtcbiAgICAndG9vbGJveCc6IGJsb2NrVXRpbHMuY3JlYXRlVG9vbGJveCgnXFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX25lY3RhclwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9ob25leVwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48dGl0bGUgbmFtZT1cIk5VTVwiPjA8L3RpdGxlPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwiYmVlX2lmTmVjdGFyQW1vdW50XCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJiZWVfaWZUb3RhbE5lY3RhclwiPjwvYmxvY2s+XFxcbiAgICAgIDxibG9jayB0eXBlPVwiYmVlX2lmRmxvd2VyXCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJiZWVfaWZPbmx5Rmxvd2VyXCI+PC9ibG9jaz5cXFxuICAgICAgPGJsb2NrIHR5cGU9XCJiZWVfd2hpbGVOZWN0YXJBbW91bnRcIj48L2Jsb2NrPidcbiAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6IHN0YXJ0QmxvY2tzKDEsIDEpLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMi4wXG4gICAgfSxcbiAgICBob25leUdvYWw6IDEsXG4gICAgLy8gbmVjdGFyR29hbDogMixcbiAgICBzdGVwOiB0cnVlLFxuICAgICdtYXAnOiBbXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEgXSxcbiAgICAgIFsgMCwgMSwgMSwgMCwgMCwgMSwgMSwgMSBdLFxuICAgICAgWyAwLCAwLCAwLCAwLCAwLCAxLCAxLCAxIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMiwgJ1AnLCAxLCAxLCAxLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgMSwgMSwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAxLCAxLCAwLCAwLCAwLCAwIF1cbiAgICBdLFxuICAgICdzdGFydERpcmVjdGlvbic6IERpcmVjdGlvbi5FQVNULFxuICAgICdpbml0aWFsRGlydCc6IFtcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDMsIC0xLCAwLCAwLCAwLCAwLCAwIF0sXG4gICAgICBbIDAsIDAsICAwLCAgMCwgMCwgMCwgMCwgMCBdLFxuICAgICAgWyAwLCAwLCAgMCwgIDAsIDAsIDAsIDAsIDAgXSxcbiAgICAgIFsgMCwgMCwgIDAsICAwLCAwLCAwLCAwLCAwIF1cblxuICAgIF1cbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4uLy4uL2xvY2FsZScpO1xuXG4vKipcbiAqIEFkZCB0aGUgcHJvY2VkdXJlcyBjYXRlZ29yeSB0byB0aGUgdG9vbGJveC5cbiAqL1xudmFyIGFkZFByb2NlZHVyZXMgPSBmdW5jdGlvbigpIHs7IGJ1Zi5wdXNoKCcgIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg4LCAgbXNnLmNhdFByb2NlZHVyZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlBST0NFRFVSRVwiPjwvY2F0ZWdvcnk+XFxuICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoOSwgIG1zZy5jYXRMb2dpYygpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmRWxzZVwiPjwvYmxvY2s+XFxuICA8L2NhdGVnb3J5PlxcbicpOzEzOyB9OzsgYnVmLnB1c2goJ1xcbicpOzE0O1xuLyoqXG4gKiBPcHRpb25zOlxuICogQHBhcmFtIGRvU3RhdGVtZW50IEFuIG9wdGlvbmFsIHN0YXRlbWVudCBmb3IgdGhlIGRvIHN0YXRlbWVudCBpbiB0aGUgbG9vcC5cbiAqIEBwYXJhbSB1cHBlckxpbWl0IFRoZSB1cHBlciBsaW1pdCBvZiB0aGUgZm9yIGxvb3AuXG4gKi9cbnZhciBjb250cm9sc0ZvciA9IGZ1bmN0aW9uKGRvU3RhdGVtZW50LCB1cHBlckxpbWl0KSB7OyBidWYucHVzaCgnICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2ZvclwiPlxcbiAgICA8dmFsdWUgbmFtZT1cIkZST01cIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvdmFsdWU+XFxuICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPlxcbiAgICAgICAgICAnLCBlc2NhcGUoKDI5LCAgdXBwZXJMaW1pdCB8fCAxMCkpLCAnICAgICAgICA8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvdmFsdWU+XFxuICAgIDx2YWx1ZSBuYW1lPVwiQllcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvdmFsdWU+XFxuICAgICcpOzM3OyBpZiAoZG9TdGF0ZW1lbnQpIHs7IGJ1Zi5wdXNoKCcgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgJyk7Mzg7IGRvU3RhdGVtZW50KCkgOyBidWYucHVzaCgnXFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICcpOzQwOyB9OyBidWYucHVzaCgnICA8L2Jsb2NrPlxcbicpOzQxOyB9OzsgYnVmLnB1c2goJ1xcbjx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDQzLCAgbXNnLmNhdEFjdGlvbnMoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPjx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICA8L2NhdGVnb3J5PlxcbiAgJyk7NTA7IGFkZFByb2NlZHVyZXMoKTsgYnVmLnB1c2goJyAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDUwLCAgbXNnLmNhdExvb3BzKCkgKSksICdcIj5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIj48L2Jsb2NrPlxcbiAgICAnKTs1MjsgaWYgKGxldmVsIDwgOSkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+PC9ibG9jaz5cXG4gICAgJyk7NTM7IH0gZWxzZSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRfZXh0XCI+XFxuICAgICAgICA8dmFsdWUgbmFtZT1cIlRJTUVTXCI+XFxuICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjEwPC90aXRsZT5cXG4gICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgIDwvdmFsdWU+XFxuICAgICAgPC9ibG9jaz5cXG4gICAgJyk7NjA7IH07IGJ1Zi5wdXNoKCcgICAgJyk7NjA7IGNvbnRyb2xzRm9yKCk7IGJ1Zi5wdXNoKCcgIDwvY2F0ZWdvcnk+XFxuICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNjEsICBtc2cuY2F0TWF0aCgpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj48L2Jsb2NrPlxcbiAgPC9jYXRlZ29yeT5cXG4gIDxjYXRlZ29yeSBuYW1lPVwiJywgZXNjYXBlKCg2NCwgIG1zZy5jYXRWYXJpYWJsZXMoKSApKSwgJ1wiIGN1c3RvbT1cIlZBUklBQkxFXCI+XFxuICA8L2NhdGVnb3J5PlxcbjwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uLy4uL2xvY2FsZScpO1xudmFyIG1hemVNc2cgPSByZXF1aXJlKCcuLi8uL2xvY2FsZScpO1xuXG52YXIgYWRkUHJvY2VkdXJlcyA9IGZ1bmN0aW9uKCkgezsgYnVmLnB1c2goJyAgJyk7NjsgaWYgKGxldmVsID4gMykgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoNiwgIGNvbW1vbk1zZy5jYXRQcm9jZWR1cmVzKCkgKSksICdcIiBjdXN0b209XCJQUk9DRURVUkVcIj48L2NhdGVnb3J5PlxcbiAgJyk7NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAyIHx8IGxldmVsID09IDMpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDcsICBjb21tb25Nc2cuY2F0UHJvY2VkdXJlcygpICkpLCAnXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiPlxcbiAgICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDksICBtYXplTXNnLmZpbGxOKHtzaG92ZWxmdWxzOiA1fSkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgIDwvY2F0ZWdvcnk+XFxuICAnKTsxMjsgfTsgYnVmLnB1c2goJyAgJyk7MTI7IGlmIChsZXZlbCA8IDkpIHs7IGJ1Zi5wdXNoKCcgICAgPGNhdGVnb3J5IG5hbWU9XCInLCBlc2NhcGUoKDEyLCAgY29tbW9uTXNnLmNhdExvZ2ljKCkgKSksICdcIj5cXG4gICAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmXCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICcpOzE1OyB9IGVsc2UgaWYgKGxldmVsID4gOCkgezsgYnVmLnB1c2goJyAgICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMTUsICBjb21tb25Nc2cuY2F0TG9naWMoKSApKSwgJ1wiPlxcbiAgICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZcIj48L2Jsb2NrPlxcbiAgICAgIDxibG9jayB0eXBlPVwia2FyZWxfaWZFbHNlXCI+PC9ibG9jaz5cXG4gICAgPC9jYXRlZ29yeT5cXG4gICcpOzE5OyB9OyBidWYucHVzaCgnJyk7MTk7IH07OyBidWYucHVzaCgnXFxuPHhtbCBpZD1cInRvb2xib3hcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XFxuICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjEsICBjb21tb25Nc2cuY2F0QWN0aW9ucygpICkpLCAnXCI+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj48dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwibWF6ZV9maWxsXCI+PC9ibG9jaz5cXG4gIDwvY2F0ZWdvcnk+XFxuICAnKTsyODsgYWRkUHJvY2VkdXJlcygpOyBidWYucHVzaCgnICA8Y2F0ZWdvcnkgbmFtZT1cIicsIGVzY2FwZSgoMjgsICBjb21tb25Nc2cuY2F0TG9vcHMoKSApKSwgJ1wiPlxcbiAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkXCI+PC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj48L2Jsb2NrPlxcbiAgPC9jYXRlZ29yeT5cXG48L3htbD5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzx4bWwgaWQ9XCJ0b29sYm94XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxcbiAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+PC9ibG9jaz5cXG4gIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+PHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPjwvYmxvY2s+XFxuICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICcpOzY7IGlmIChsZXZlbCA+IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIj48L2Jsb2NrPlxcbiAgICAnKTs3OyBpZiAobGV2ZWwgPiAyKSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj41PC90aXRsZT5cXG4gICAgICA8L2Jsb2NrPlxcbiAgICAgICcpOzEwOyBpZiAobGV2ZWwgPiA5KSB7OyBidWYucHVzaCgnICAgICAgICA8YmxvY2sgdHlwZT1cImthcmVsX2lmXCI+PC9ibG9jaz5cXG4gICAgICAnKTsxMTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMTsgfTsgYnVmLnB1c2goJyAgICAnKTsxMTsgaWYgKGxldmVsID09IDUgfHwgbGV2ZWwgPT0gMTAgfHwgbGV2ZWwgPT0gMTEpIHs7IGJ1Zi5wdXNoKCcgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkXCI+PC9ibG9jaz5cXG4gICAgJyk7MTI7IH07IGJ1Zi5wdXNoKCcgICAgJyk7MTI7IGlmIChsZXZlbCA+IDUgJiYgbGV2ZWwgPCA4KSB7OyBidWYucHVzaCgnICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXJcIj48L2Jsb2NrPlxcbiAgICAnKTsxMzsgfTsgYnVmLnB1c2goJyAgICAnKTsxMzsgaWYgKGxldmVsID09IDggfHwgbGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyXCI+XFxuICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPmlzUGF0aEZvcndhcmQ8L3RpdGxlPlxcbiAgICAgIDwvYmxvY2s+XFxuICAgICcpOzE2OyB9OyBidWYucHVzaCgnICAnKTsxNjsgfTsgYnVmLnB1c2goJzwveG1sPlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTtcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbi8qKlxuICogVGVtcGxhdGUgdG8gY3JlYXRlIGZ1bmN0aW9uIGZvciBmaWxsaW5nIGluIHNob3ZlbHMuXG4gKi9cbnZhciBmaWxsU2hvdmVsZnVscyA9IGZ1bmN0aW9uKG4pIHs7IGJ1Zi5wdXNoKCcgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMTEsICBtc2cuZmlsbE4oe3Nob3ZlbGZ1bHM6IG59KSApKSwgJzwvdGl0bGU+XFxuICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nLCBlc2NhcGUoKDE0LCAgbiApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgIDwvYmxvY2s+XFxuICAgIDwvc3RhdGVtZW50PlxcbiAgPC9ibG9jaz5cXG4nKTsyMjsgfTs7IGJ1Zi5wdXNoKCdcXG4nKTsyMztcbi8qKlxuICogVGVtcGxhdGUgdG8gY3JlYXRlIGZ1bmN0aW9uIGZvciByZW1vdmluZyBpbiBzaG92ZWxzLlxuICovXG52YXIgcmVtb3ZlU2hvdmVsZnVscyA9IGZ1bmN0aW9uKG4pIHs7IGJ1Zi5wdXNoKCcgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIzMDBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDMwLCAgbXNnLnJlbW92ZU4oe3Nob3ZlbGZ1bHM6IG59KSApKSwgJzwvdGl0bGU+XFxuICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4nLCBlc2NhcGUoKDMzLCAgbiApKSwgJzwvdGl0bGU+XFxuICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgPC9ibG9jaz5cXG4gICAgPC9zdGF0ZW1lbnQ+XFxuICA8L2Jsb2NrPlxcbicpOzQxOyB9OyA7IGJ1Zi5wdXNoKCdcXG5cXG4nKTs0MzsgaWYgKHBhZ2UgPT0gMSkgezsgYnVmLnB1c2goJyAgJyk7NDM7IGlmIChsZXZlbCA9PSAxKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0NDsgfSBlbHNlIGlmIChsZXZlbCA9PSAyKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0NTsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0NjsgfSBlbHNlIGlmIChsZXZlbCA9PSA0KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs0NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA1KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV91bnRpbEJsb2NrZWRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NDg7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzQ5OyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NTI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NTM7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj48L2Jsb2NrPlxcbiAgJyk7NTQ7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMTApIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX3VudGlsQmxvY2tlZFwiIHg9XCI3MFwiIHk9XCI3MFwiPjwvYmxvY2s+XFxuICAnKTs1NTsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkXCIgeD1cIjcwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICcpOzU2OyB9OyBidWYucHVzaCgnJyk7NTY7IH0gZWxzZSBpZiAocGFnZSA9PSAyKSB7OyBidWYucHVzaCgnICAnKTs1NjsgaWYgKGxldmVsID09IDIpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjIwXCIgeT1cIjcwXCI+PC9ibG9jaz5cXG4gICAgJyk7NTc7IGZpbGxTaG92ZWxmdWxzKDUpOyBidWYucHVzaCgnICAnKTs1NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgICcpOzU3OyBmaWxsU2hvdmVsZnVscyg1KTsgYnVmLnB1c2goJyAgJyk7NTc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNCkgezsgYnVmLnB1c2goJyAgICAnKTs1NzsgZmlsbFNob3ZlbGZ1bHMoNSk7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjMwMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNjAsICBtc2cucmVtb3ZlTih7c2hvdmVsZnVsczogN30pICkpLCAnPC90aXRsZT5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzYyOyB9IGVsc2UgaWYgKGxldmVsID09IDUpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjIwMFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uPjwvbXV0YXRpb24+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJOQU1FXCI+JywgZXNjYXBlKCg2NSwgIG1zZy5yZW1vdmVOKHtzaG92ZWxmdWxzOiA2fSkgKSksICc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7Njc7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNikgezsgYnVmLnB1c2goJyAgICAnKTs2NzsgZmlsbFNob3ZlbGZ1bHMoOCk7IGJ1Zi5wdXNoKCcgICAgJyk7Njc7IHJlbW92ZVNob3ZlbGZ1bHMoOCk7IGJ1Zi5wdXNoKCcgICcpOzY3OyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIHg9XCIyMFwiIHk9XCI3MFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDY5LCAgbXNnLmF2b2lkQ293QW5kUmVtb3ZlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDc0LCAgbXNnLmF2b2lkQ293QW5kUmVtb3ZlKCkgKSksICc8L3RpdGxlPlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NzY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDc5LCAgbXNnLmF2b2lkQ293QW5kUmVtb3ZlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzEyNzsgfSBlbHNlIGlmIChsZXZlbCA9PSA5KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoMTMwLCAgbXNnLnJlbW92ZVN0YWNrKHtzaG92ZWxmdWxzOiA0fSkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzE3NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMCkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDE4MCwgIG1zZy5yZW1vdmVTdGFjayh7c2hvdmVsZnVsczogNH0pICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIzMDBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDIzMCwgIG1zZy5maWxsU3RhY2soe3Nob3ZlbGZ1bHM6IDJ9KSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjI8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2ZpbGxcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+MjwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiBlZGl0YWJsZT1cImZhbHNlXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzI3NzsgfSBlbHNlIGlmIChsZXZlbCA9PSAxMSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiMjAwXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDI4MCwgIG1zZy5yZW1vdmVBbmRBdm9pZFRoZUNvdygpICkpLCAnPC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJTVEFDS1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCIgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgZWRpdGFibGU9XCJmYWxzZVwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiIGVkaXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzMyOTsgfTsgYnVmLnB1c2goJycpOzMyOTsgfSBlbHNlIGlmIChwYWdlID09IDMpIHs7IGJ1Zi5wdXNoKCcgICcpOzMyOTsgaWYgKGxldmVsID09IDEpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuUmlnaHQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTszNTY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gMikgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8bmV4dD5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj48L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvbmV4dD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzM3MzsgfSBlbHNlIGlmIChsZXZlbCA9PSAzKSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDxuZXh0PlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjEwPC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj4xMDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDE4OyB9IGVsc2UgaWYgKGxldmVsID09IDQpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJjb250cm9sc19yZXBlYXRcIiB4PVwiNzBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9tb3ZlRm9yd2FyZFwiPjwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnBpbGVQcmVzZW50PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L25leHQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs0MzI7IH0gZWxzZSBpZiAobGV2ZWwgPT0gNSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiIHg9XCI3MFwiIHk9XCI3MFwiPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj43PC90aXRsZT5cXG4gICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV9kaWdcIj5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5SaWdodDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzQ1NzsgfSBlbHNlIGlmIChsZXZlbCA9PSA2KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCIgeD1cIjcwXCIgeT1cIjcwXCI+XFxuICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJrYXJlbF9pZlwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj5waWxlUHJlc2VudDwvdGl0bGU+XFxuICAgICAgICAgICAgICA8c3RhdGVtZW50IG5hbWU9XCJET1wiPlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF6ZV90dXJuXCI+XFxuICAgICAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJESVJcIj50dXJuTGVmdDwvdGl0bGU+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfbW92ZUZvcndhcmRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVyblJpZ2h0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L25leHQ+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvc3RhdGVtZW50PlxcbiAgICA8L2Jsb2NrPlxcbiAgJyk7NDg2OyB9IGVsc2UgaWYgKGxldmVsID09IDcpIHs7IGJ1Zi5wdXNoKCcgICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2NhbGxub3JldHVyblwiIHg9XCIyMFwiIHk9XCI3MFwiXFxuICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIGRlbGV0YWJsZT1cImZhbHNlXCI+XFxuICAgICAgPG11dGF0aW9uIG5hbWU9XCInLCBlc2NhcGUoKDQ4OCwgIG1zZy5yZW1vdmVTcXVhcmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgIDwvYmxvY2s+XFxuICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19kZWZub3JldHVyblwiIHg9XCIyMFwiIHk9XCIyMDBcIiBlZGl0YWJsZT1cImZhbHNlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDQ5MiwgIG1zZy5yZW1vdmVTcXVhcmUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjI8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzUxNjsgfSBlbHNlIGlmIChsZXZlbCA9PSA4KSB7OyBidWYucHVzaCgnICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiB4PVwiMjBcIiB5PVwiNzBcIj5cXG4gICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoNTE3LCAgbXNnLmZpbGxTcXVhcmUoKSApKSwgJ1wiPjwvbXV0YXRpb24+XFxuICAgICAgPG5leHQ+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIlRJTUVTXCI+NTwvdGl0bGU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIj5cXG4gICAgICAgICAgICAgIDxtdXRhdGlvbiBuYW1lPVwiJywgZXNjYXBlKCg1MjYsICBtc2cucmVtb3ZlU3F1YXJlKCkgKSksICdcIj48L211dGF0aW9uPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9uZXh0PlxcbiAgICA8L2Jsb2NrPlxcbiAgICA8YmxvY2sgdHlwZT1cInByb2NlZHVyZXNfZGVmbm9yZXR1cm5cIiBkZWxldGFibGU9XCJmYWxzZVwiXFxuICAgICAgZWRpdGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyNTBcIj5cXG4gICAgICA8bXV0YXRpb24+PC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDUzNSwgIG1zZy5yZW1vdmVTcXVhcmUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjI8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZGlnXCI+PC9ibG9jaz5cXG4gICAgICAgICAgICAgICAgICA8L25leHQ+XFxuICAgICAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgICAgICAgIDxuZXh0PlxcbiAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfdHVyblwiPlxcbiAgICAgICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiRElSXCI+dHVybkxlZnQ8L3RpdGxlPlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIlxcbiAgICAgIGVkaXRhYmxlPVwiZmFsc2VcIiB4PVwiMzUwXCIgeT1cIjI1MFwiPlxcbiAgICAgIDxtdXRhdGlvbj48L211dGF0aW9uPlxcbiAgICAgIDx0aXRsZSBuYW1lPVwiTkFNRVwiPicsIGVzY2FwZSgoNTYyLCAgbXNnLmZpbGxTcXVhcmUoKSApKSwgJzwvdGl0bGU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiU1RBQ0tcIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwiY29udHJvbHNfcmVwZWF0XCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiVElNRVNcIj40PC90aXRsZT5cXG4gICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdFwiPlxcbiAgICAgICAgICAgICAgPHRpdGxlIG5hbWU9XCJUSU1FU1wiPjI8L3RpdGxlPlxcbiAgICAgICAgICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+XFxuICAgICAgICAgICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hemVfZmlsbFwiPjwvYmxvY2s+XFxuICAgICAgICAgICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgICAgICAgICAgICA8bmV4dD5cXG4gICAgICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX3R1cm5cIj5cXG4gICAgICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIkRJUlwiPnR1cm5MZWZ0PC90aXRsZT5cXG4gICAgICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgICAgIDwvbmV4dD5cXG4gICAgICAgICAgICA8L2Jsb2NrPlxcbiAgICAgICAgICA8L3N0YXRlbWVudD5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC9zdGF0ZW1lbnQ+XFxuICAgIDwvYmxvY2s+XFxuICAnKTs1ODY7IH0gZWxzZSBpZiAobGV2ZWwgPT0gOSkgezsgYnVmLnB1c2goJyAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX2ZvclwiIGlubGluZT1cInRydWVcIiB4PVwiMjBcIiB5PVwiNzBcIj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIlZBUlwiPmNvdW50ZXI8L3RpdGxlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiRlJPTVwiPlxcbiAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXRoX251bWJlclwiPlxcbiAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3ZhbHVlPlxcbiAgICAgIDx2YWx1ZSBuYW1lPVwiVE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgPHRpdGxlIG5hbWU9XCJOVU1cIj42PC90aXRsZT5cXG4gICAgICAgIDwvYmxvY2s+XFxuICAgICAgPC92YWx1ZT5cXG4gICAgICA8dmFsdWUgbmFtZT1cIkJZXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICA8L2Jsb2NrPlxcbiAgICAgIDwvdmFsdWU+XFxuICAgICAgPHN0YXRlbWVudCBuYW1lPVwiRE9cIj5cXG4gICAgICAgIDxibG9jayB0eXBlPVwicHJvY2VkdXJlc19jYWxsbm9yZXR1cm5cIiBpbmxpbmU9XCJmYWxzZVwiPlxcbiAgICAgICAgICA8bXV0YXRpb24gbmFtZT1cIicsIGVzY2FwZSgoNjA1LCAgbXNnLnJlbW92ZVBpbGUoKSApKSwgJ1wiPlxcbiAgICAgICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoNjA2LCAgbXNnLmhlaWdodFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgICAgIDwvbXV0YXRpb24+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiQVJHMFwiPlxcbiAgICAgICAgICAgIDxibG9jayB0eXBlPVwibWF0aF9udW1iZXJcIj5cXG4gICAgICAgICAgICAgIDx0aXRsZSBuYW1lPVwiTlVNXCI+MTwvdGl0bGU+XFxuICAgICAgICAgICAgPC9ibG9jaz5cXG4gICAgICAgICAgPC92YWx1ZT5cXG4gICAgICAgICAgPG5leHQ+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX21vdmVGb3J3YXJkXCI+PC9ibG9jaz5cXG4gICAgICAgICAgPC9uZXh0PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICAgPGJsb2NrIHR5cGU9XCJwcm9jZWR1cmVzX2RlZm5vcmV0dXJuXCIgeD1cIjIwXCIgeT1cIjI1MFwiIGVkaXRhYmxlPVwiZmFsc2VcIiBkZWxldGFibGU9XCJmYWxzZVwiPlxcbiAgICAgIDxtdXRhdGlvbj5cXG4gICAgICAgIDxhcmcgbmFtZT1cIicsIGVzY2FwZSgoNjIxLCAgbXNnLmhlaWdodFBhcmFtZXRlcigpICkpLCAnXCI+PC9hcmc+XFxuICAgICAgPC9tdXRhdGlvbj5cXG4gICAgICA8dGl0bGUgbmFtZT1cIk5BTUVcIj4nLCBlc2NhcGUoKDYyMywgIG1zZy5yZW1vdmVQaWxlKCkgKSksICc8L3RpdGxlPlxcbiAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIlNUQUNLXCI+XFxuICAgICAgICA8YmxvY2sgdHlwZT1cImNvbnRyb2xzX3JlcGVhdF9leHRcIiBpbmxpbmU9XCJ0cnVlXCI+XFxuICAgICAgICAgIDx2YWx1ZSBuYW1lPVwiVElNRVNcIj5cXG4gICAgICAgICAgICA8YmxvY2sgdHlwZT1cIm1hdGhfbnVtYmVyXCI+XFxuICAgICAgICAgICAgICA8dGl0bGUgbmFtZT1cIk5VTVwiPjE8L3RpdGxlPlxcbiAgICAgICAgICAgIDwvYmxvY2s+XFxuICAgICAgICAgIDwvdmFsdWU+XFxuICAgICAgICAgIDxzdGF0ZW1lbnQgbmFtZT1cIkRPXCI+XFxuICAgICAgICAgICAgPGJsb2NrIHR5cGU9XCJtYXplX2RpZ1wiPjwvYmxvY2s+XFxuICAgICAgICAgIDwvc3RhdGVtZW50PlxcbiAgICAgICAgPC9ibG9jaz5cXG4gICAgICA8L3N0YXRlbWVudD5cXG4gICAgPC9ibG9jaz5cXG4gICcpOzYzNzsgfTsgYnVmLnB1c2goJycpOzYzNzsgfTsgYnVmLnB1c2goJycpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuPGRpdiBpZD1cInNwZWxsaW5nLXRhYmxlLXdyYXBwZXJcIj5cXG4gIDx0YWJsZSBpZD1cInNwZWxsaW5nLXRhYmxlXCIgY2xhc3M9XCJmbG9hdC1yaWdodFwiPlxcbiAgICA8dHI+XFxuICAgICAgPHRkIGNsYXNzPVwic3BlbGxpbmdUZXh0Q2VsbFwiPicsIGVzY2FwZSgoNSwgIG1zZy53b3JkKCkgKSksICc6PC90ZD5cXG4gICAgICA8dGQgY2xhc3M9XCJzcGVsbGluZ0J1dHRvbkNlbGxcIj5cXG4gICAgICAgIDxidXR0b24gaWQ9XCJzZWFyY2hXb3JkXCIgY2xhc3M9XCJzcGVsbGluZ0J1dHRvblwiIGRpc2FibGVkPlxcbiAgICAgICAgICAnKTs4OyAvLyBzcGxpdHRpbmcgdGhlc2UgbGluZXMgY2F1c2VzIGFuIGV4dHJhIHNwYWNlIHRvIHNob3cgdXAgaW4gZnJvbnQgb2YgdGhlIHdvcmQsIGJyZWFraW5nIGNlbnRlcmluZyBcbjsgYnVmLnB1c2goJ1xcbiAgICAgICAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoOSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIi8+JywgZXNjYXBlKCg5LCAgc2VhcmNoV29yZCApKSwgJ1xcbiAgICAgICAgPC9idXR0b24+XFxuICAgICAgPC90ZD5cXG4gICAgPC90cj5cXG4gICAgPHRyPlxcbiAgICAgIDx0ZCBjbGFzcz1cInNwZWxsaW5nVGV4dENlbGxcIj4nLCBlc2NhcGUoKDE0LCAgbXNnLnlvdVNwZWxsZWQoKSApKSwgJzo8L3RkPlxcbiAgICAgIDx0ZCBjbGFzcz1cInNwZWxsaW5nQnV0dG9uQ2VsbFwiPlxcbiAgICAgICAgPGJ1dHRvbiBpZD1cImN1cnJlbnRXb3JkXCIgY2xhc3M9XCJzcGVsbGluZ0J1dHRvblwiIGRpc2FibGVkPlxcbiAgICAgICAgICAnKTsxNzsgLy8gc3BsaXR0aW5nIHRoZXNlIGxpbmVzIGNhdXNlcyBhbiBleHRyYSBzcGFjZSB0byBzaG93IHVwIGluIGZyb250IG9mIHRoZSB3b3JkLCBicmVha2luZyBjZW50ZXJpbmcgXG47IGJ1Zi5wdXNoKCdcXG4gICAgICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE4LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPjxzcGFuIGlkPVwiY3VycmVudFdvcmRDb250ZW50c1wiPjwvc3Bhbj5cXG4gICAgICAgIDwvYnV0dG9uPlxcbiAgICAgIDwvdGQ+XFxuICAgIDwvdHI+XFxuICA8L3RhYmxlPlxcbjwvZGl2PlxcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xuXG4vKipcbiAqIFN0b3JlcyBpbmZvcm1hdGlvbiBhYm91dCBhIGN1cnJlbnQgTWF6ZSBleGVjdXRpb24uICBFeGVjdXRpb24gY29uc2lzdHMgb2YgYVxuICogc2VyaWVzIG9mIHN0ZXBzLCB3aGVyZSBlYWNoIHN0ZXAgbWF5IGNvbnRhaW4gb25lIG9yIG1vcmUgYWN0aW9ucy5cbiAqL1xudmFyIEV4ZWN1dGlvbkluZm8gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy50ZXJtaW5hdGVkXyA9IGZhbHNlO1xuICB0aGlzLnRlcm1pbmF0aW9uVmFsdWVfID0gbnVsbDsgIC8vIFNlZSB0ZXJtaW5hdGVXaXRoVmFsdWUgbWV0aG9kLlxuICB0aGlzLnN0ZXBzXyA9IFtdO1xuICB0aGlzLnRpY2tzID0gb3B0aW9ucy50aWNrcyB8fCBJbmZpbml0eTtcbiAgdGhpcy5jb2xsZWN0aW9uXyA9IG51bGw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV4ZWN1dGlvbkluZm87XG5cbi8qKlxuICogU2V0cyB0ZXJtaW5hdGlvbiB2YWx1ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAqIC0gSW5maW5pdHk6IFByb2dyYW0gdGltZWQgb3V0LlxuICogLSBUcnVlOiBQcm9ncmFtIHN1Y2NlZWRlZCAoZ29hbCB3YXMgcmVhY2hlZCkuXG4gKiAtIEZhbHNlOiBQcm9ncmFtIGZhaWxlZCBmb3IgdW5zcGVjaWZpZWQgcmVhc29uLlxuICogLSBBbnkgb3RoZXIgdmFsdWU6IGFwcC1zcGVjaWZpYyBmYWlsdXJlLlxuICogQHBhcmFtIHtvYmplY3R9IHZhbHVlIHRoZSB0ZXJtaW5hdGlvbiB2YWx1ZVxuICovXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS50ZXJtaW5hdGVXaXRoVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKCF0aGlzLnRlcm1pbmF0ZWRfKSB7XG4gICAgdGhpcy50ZXJtaW5hdGlvblZhbHVlXyA9IHZhbHVlO1xuICB9XG4gIHRoaXMudGVybWluYXRlZF8gPSB0cnVlO1xufTtcblxuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuaXNUZXJtaW5hdGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50ZXJtaW5hdGVkXztcbn07XG5cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLnRlcm1pbmF0aW9uVmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRlcm1pbmF0aW9uVmFsdWVfO1xufTtcblxuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUucXVldWVBY3Rpb24gPSBmdW5jdGlvbiAoY29tbWFuZCwgYmxvY2tJZCkge1xuICB2YXIgYWN0aW9uID0ge2NvbW1hbmQ6IGNvbW1hbmQsIGJsb2NrSWQ6IGJsb2NrSWR9O1xuICBpZiAodGhpcy5jb2xsZWN0aW9uXykge1xuICAgIHRoaXMuY29sbGVjdGlvbl8ucHVzaChhY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIC8vIHNpbmdsZSBhY3Rpb24gc3RlcCAobW9zdCBjb21tb24gY2FzZSlcbiAgICB0aGlzLnN0ZXBzXy5wdXNoKFthY3Rpb25dKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZmxhdCBsaXN0IG9mIGFjdGlvbnMsIHdoaWNoIGdldCByZW1vdmVkIGZyb20gb3VyIHF1ZXVlLiAgSWYgc2luZ2xlXG4gKiBzdGVwIGlzIHRydWUsIHRoZSBsaXN0IHdpbGwgY29udGFpbiB0aGUgYWN0aW9ucyBmb3Igb25lIHN0ZXAsIG90aGVyd2lzZSBpdFxuICogd2lsbCBiZSB0aGUgZW50aXJlIHF1ZXVlLlxuICovXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5nZXRBY3Rpb25zID0gZnVuY3Rpb24gKHNpbmdsZVN0ZXApIHtcbiAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgaWYgKHNpbmdsZVN0ZXApIHtcbiAgICBhY3Rpb25zLnB1c2godGhpcy5zdGVwc18uc2hpZnQoKSk7XG4gICAgLy8gZG9udCBsZWF2ZSBxdWV1ZSB3aXRoIGp1c3QgYSBmaW5pc2ggaW4gaXRcbiAgICBpZiAob25MYXN0U3RlcCh0aGlzLnN0ZXBzXykpIHtcbiAgICAgIGFjdGlvbnMucHVzaCh0aGlzLnN0ZXBzXy5zcGxpY2UoMCkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBhY3Rpb25zLnB1c2godGhpcy5zdGVwc18uc3BsaWNlKDApKTtcbiAgfVxuICAvLyBTb21lIHN0ZXBzIHdpbGwgY29udGFpbiBtdWx0aXBsZSBhY3Rpb25zLiAgRm9yIGV4YW1wbGUgYSBLMSBOb3J0aCBibG9jayBjYW5cbiAgLy8gY29uc2lzdCBvZiBhIHR1cm4gYW5kIGEgbW92ZS4gV2UgaW5zdGVhZCB3YW50IHRvIHJldHVybiBhIGZsYXQgbGlzdCBvZlxuICAvLyBhbGwgYWN0aW9ucywgcmVnYXJkbGVzcyBvZiB3aGljaCBzdGVwIHRoZXkgd2VyZSBpbi5cbiAgcmV0dXJuIF8uZmxhdHRlbihhY3Rpb25zKTtcbn07XG5cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLnN0ZXBzUmVtYWluaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zdGVwc18ubGVuZ3RoID4gMDtcbn07XG5cbi8qKlxuICogSWYgd2UgaGF2ZSBubyBzdGVwcyBsZWZ0LCBvciBvdXIgb25seSByZW1haW5pbmcgc3RlcCBpcyBhIHNpbmdsZSBmaW5pc2ggYWN0aW9uXG4gKiB3ZSdyZSBkb25lIGV4ZWN1dGluZywgYW5kIGlmIHdlJ3JlIGluIHN0ZXAgbW9kZSB3b24ndCB3YW50IHRvIHdhaXQgYXJvdW5kXG4gKiBmb3IgYW5vdGhlciBzdGVwIHByZXNzLlxuICovXG5mdW5jdGlvbiBvbkxhc3RTdGVwKHN0ZXBzKSB7XG4gIGlmIChzdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChzdGVwcy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgc3RlcCA9IHN0ZXBzWzBdO1xuICAgIGlmIChzdGVwLmxlbmd0aCA9PT0gMSAmJiBzdGVwWzBdLmNvbW1hbmQgPT09ICdmaW5pc2gnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvbGxlY3QgYWxsIGFjdGlvbnMgcXVldWVkIHVwIGJldHdlZW4gbm93IGFuZCB0aGUgY2FsbCB0byBzdG9wQ29sbGVjdGluZyxcbiAqIGFuZCBwdXQgdGhlbSBpbiBhIHNpbmdsZSBzdGVwXG4gKi9cbkV4ZWN1dGlvbkluZm8ucHJvdG90eXBlLmNvbGxlY3RBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5jb2xsZWN0aW9uXykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFscmVhZHkgY29sbGVjdGluZ1wiKTtcbiAgfVxuICB0aGlzLmNvbGxlY3Rpb25fID0gW107XG59O1xuXG5FeGVjdXRpb25JbmZvLnByb3RvdHlwZS5zdG9wQ29sbGVjdGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLmNvbGxlY3Rpb25fKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGN1cnJlbnRseSBjb2xsZWN0aW5nXCIpO1xuICB9XG4gIHRoaXMuc3RlcHNfLnB1c2godGhpcy5jb2xsZWN0aW9uXyk7XG4gIHRoaXMuY29sbGVjdGlvbl8gPSBudWxsO1xufTtcblxuLyoqXG4gKiBJZiB0aGUgdXNlciBoYXMgZXhlY3V0ZWQgdG9vIG1hbnkgYWN0aW9ucywgd2UncmUgcHJvYmFibHkgaW4gYW4gaW5maW5pdGVcbiAqIGxvb3AuICBTZXQgdGVybWluYXRpb24gdmFsdWUgdG8gSW5maW5pdHlcbiAqL1xuRXhlY3V0aW9uSW5mby5wcm90b3R5cGUuY2hlY2tUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLnRpY2tzLS0gPCAwKSB7XG4gICAgdGhpcy50ZXJtaW5hdGVXaXRoVmFsdWUoSW5maW5pdHkpO1xuICB9XG59O1xuIiwidmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzLmJsb2NrcyA9IFtcbiAgeydmdW5jJzogJ21vdmVGb3J3YXJkJywgJ2NhdGVnb3J5JzogJ01vdmVtZW50JyB9LFxuICB7J2Z1bmMnOiAndHVybkxlZnQnLCAnY2F0ZWdvcnknOiAnTW92ZW1lbnQnIH0sXG4gIHsnZnVuYyc6ICd0dXJuUmlnaHQnLCAnY2F0ZWdvcnknOiAnTW92ZW1lbnQnIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cy5jYXRlZ29yaWVzID0ge1xuICAnTW92ZW1lbnQnOiB7XG4gICAgJ2NvbG9yJzogJ3JlZCcsXG4gICAgJ2Jsb2Nrcyc6IFtdXG4gIH0sXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG5cXG48YnV0dG9uIGlkPVwic3RlcEJ1dHRvblwiIGNsYXNzPVwibGF1bmNoICcsIGVzY2FwZSgoMywgIHNob3dTdGVwQnV0dG9uID8gJycgOiAnaGlkZScgKSksICcgZmxvYXQtcmlnaHRcIj5cXG4gICcpOzQ7IC8vIHNwbGl0dGluZyB0aGVzZSBsaW5lcyBjYXVzZXMgYW4gZXh0cmEgc3BhY2UgdG8gc2hvdyB1cCBpbiBmcm9udCBvZiB0aGUgd29yZCwgYnJlYWtpbmcgY2VudGVyaW5nIFxuOyBidWYucHVzaCgnXFxuICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoNSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDUsICBtc2cuc3RlcCgpICkpLCAnXFxuPC9idXR0b24+XFxuXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBCbG9ja2x5IERlbW86IE1hemVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBHb29nbGUgSW5jLlxuICogaHR0cDovL2Jsb2NrbHkuZ29vZ2xlY29kZS5jb20vXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGVtb25zdHJhdGlvbiBvZiBCbG9ja2x5OiBTb2x2aW5nIGEgbWF6ZS5cbiAqIEBhdXRob3IgZnJhc2VyQGdvb2dsZS5jb20gKE5laWwgRnJhc2VyKVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG52YXIgbWF6ZVV0aWxzID0gcmVxdWlyZSgnLi9tYXplVXRpbHMnKTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICBpZiAobWF6ZVV0aWxzLmlzQmVlU2tpbihza2luLmlkKSkge1xuICAgIHJlcXVpcmUoJy4vYmVlQmxvY2tzJykuaW5zdGFsbChibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKTtcbiAgfVxuXG4gIHZhciBTaW1wbGVNb3ZlID0ge1xuICAgIERJUkVDVElPTl9DT05GSUdTOiB7XG4gICAgICBXZXN0OiB7IGxldHRlcjogY29tbW9uTXNnLmRpcmVjdGlvbldlc3RMZXR0ZXIoKSwgaW1hZ2U6IHNraW4ubGVmdEFycm93LCB0b29sdGlwOiBtc2cubW92ZVdlc3RUb29sdGlwKCkgfSxcbiAgICAgIEVhc3Q6IHsgbGV0dGVyOiBjb21tb25Nc2cuZGlyZWN0aW9uRWFzdExldHRlcigpLCBpbWFnZTogc2tpbi5yaWdodEFycm93LCB0b29sdGlwOiBtc2cubW92ZUVhc3RUb29sdGlwKCkgfSxcbiAgICAgIE5vcnRoOiB7IGxldHRlcjogY29tbW9uTXNnLmRpcmVjdGlvbk5vcnRoTGV0dGVyKCksIGltYWdlOiBza2luLnVwQXJyb3csIHRvb2x0aXA6IG1zZy5tb3ZlTm9ydGhUb29sdGlwKCkgfSxcbiAgICAgIFNvdXRoOiB7IGxldHRlcjogY29tbW9uTXNnLmRpcmVjdGlvblNvdXRoTGV0dGVyKCksIGltYWdlOiBza2luLmRvd25BcnJvdywgdG9vbHRpcDogbXNnLm1vdmVTb3V0aFRvb2x0aXAoKSB9XG4gICAgfSxcbiAgICBnZW5lcmF0ZUJsb2Nrc0ZvckFsbERpcmVjdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcIk5vcnRoXCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcIlNvdXRoXCIpO1xuICAgICAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckRpcmVjdGlvbihcIldlc3RcIik7XG4gICAgICBTaW1wbGVNb3ZlLmdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uKFwiRWFzdFwiKTtcbiAgICB9LFxuICAgIGdlbmVyYXRlQmxvY2tzRm9yRGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgIGdlbmVyYXRvcltcIm1hemVfbW92ZVwiICsgZGlyZWN0aW9uXSA9IFNpbXBsZU1vdmUuZ2VuZXJhdGVDb2RlR2VuZXJhdG9yKGRpcmVjdGlvbik7XG4gICAgICBibG9ja2x5LkJsb2Nrc1snbWF6ZV9tb3ZlJyArIGRpcmVjdGlvbl0gPSBTaW1wbGVNb3ZlLmdlbmVyYXRlTW92ZUJsb2NrKGRpcmVjdGlvbik7XG4gICAgfSxcbiAgICBnZW5lcmF0ZU1vdmVCbG9jazogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uQ29uZmlnID0gU2ltcGxlTW92ZS5ESVJFQ1RJT05fQ09ORklHU1tkaXJlY3Rpb25dO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGVscFVybDogJycsXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRMYWJlbChkaXJlY3Rpb25Db25maWcubGV0dGVyLCB7Zml4ZWRTaXplOiB7d2lkdGg6IDEyLCBoZWlnaHQ6IDE4fX0pKVxuICAgICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2UoZGlyZWN0aW9uQ29uZmlnLmltYWdlKSk7XG4gICAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICAgICAgdGhpcy5zZXRUb29sdGlwKGRpcmVjdGlvbkNvbmZpZy50b29sdGlwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LFxuICAgIGdlbmVyYXRlQ29kZUdlbmVyYXRvcjogZnVuY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnTWF6ZS5tb3ZlJyArIGRpcmVjdGlvbiArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgU2ltcGxlTW92ZS5nZW5lcmF0ZUJsb2Nrc0ZvckFsbERpcmVjdGlvbnMoKTtcblxuICAvLyBCbG9jayBmb3IgbW92aW5nIGZvcndhcmQuXG4gIGJsb2NrVXRpbHMuZ2VuZXJhdGVTaW1wbGVCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBuYW1lOiAnbWF6ZV9tb3ZlRm9yd2FyZCcsXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvTW92ZScsXG4gICAgdGl0bGU6IG1zZy5tb3ZlRm9yd2FyZCgpLFxuICAgIHRvb2x0aXA6IG1zZy5tb3ZlRm9yd2FyZFRvb2x0aXAoKSxcbiAgICBmdW5jdGlvbk5hbWU6ICdNYXplLm1vdmVGb3J3YXJkJ1xuICB9KTtcblxuICAvLyBCbG9jayBmb3IgcHV0dGluZyBkaXJ0IG9uIHRvIGEgdGlsZS5cbiAgYmxvY2tVdGlscy5nZW5lcmF0ZVNpbXBsZUJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwge1xuICAgIG5hbWU6ICdtYXplX2ZpbGwnLFxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1B1dERvd24nLFxuICAgIHRpdGxlOiBtc2cuZmlsbCgpLFxuICAgIHRvb2x0aXA6IG1zZy5maWxsVG9vbHRpcCgpLFxuICAgIGZ1bmN0aW9uTmFtZTogJ01hemUuZmlsbCdcbiAgfSk7XG5cbiAgLy8gQmxvY2sgZm9yIHB1dHRpbmcgZm9yIHJlbW92aW5nIGRpcnQgZnJvbSBhIHRpbGUuXG4gIGJsb2NrVXRpbHMuZ2VuZXJhdGVTaW1wbGVCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBuYW1lOiAnbWF6ZV9kaWcnLFxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1BpY2tVcCcsXG4gICAgdGl0bGU6IG1zZy5kaWcoKSxcbiAgICB0b29sdGlwOiBtc2cuZGlnVG9vbHRpcCgpLFxuICAgIGZ1bmN0aW9uTmFtZTogJ01hemUuZGlnJ1xuICB9KTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX21vdmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkL2JhY2t3YXJkXG4gICAgaGVscFVybDogJ2h0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9ibG9ja2x5L3dpa2kvTW92ZScsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9tb3ZlLkRJUkVDVElPTlMgPVxuICAgICAgW1ttc2cubW92ZUZvcndhcmQoKSwgJ21vdmVGb3J3YXJkJ10sXG4gICAgICAgW21zZy5tb3ZlQmFja3dhcmQoKSwgJ21vdmVCYWNrd2FyZCddXTtcblxuICBnZW5lcmF0b3IubWF6ZV9tb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQvYmFja3dhcmRcbiAgICB2YXIgZGlyID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKTtcbiAgICByZXR1cm4gJ01hemUuJyArIGRpciArICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfdHVybiA9IHtcbiAgICAvLyBCbG9jayBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1R1cm4nLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cudHVyblRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfdHVybi5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLnR1cm5MZWZ0KCkgKyAnIFxcdTIxQkEnLCAndHVybkxlZnQnXSxcbiAgICAgICBbbXNnLnR1cm5SaWdodCgpICsgJyBcXHUyMUJCJywgJ3R1cm5SaWdodCddXTtcblxuICBnZW5lcmF0b3IubWF6ZV90dXJuID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgdHVybmluZyBsZWZ0IG9yIHJpZ2h0LlxuICAgIHZhciBkaXIgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpO1xuICAgIHJldHVybiAnTWF6ZS4nICsgZGlyICsgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pc1BhdGggPSB7XG4gICAgLy8gQmxvY2sgZm9yIGNoZWNraW5nIGlmIHRoZXJlIGEgcGF0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuc2V0T3V0cHV0KHRydWUsIGJsb2NrbHkuQmxvY2tWYWx1ZVR5cGUuTlVNQkVSKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pc1BhdGhUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lzUGF0aC5ESVJFQ1RJT05TID1cbiAgICAgIFtbbXNnLmlmUGF0aEFoZWFkKCksICdpc1BhdGhGb3J3YXJkJ10sXG4gICAgICAgW21zZy5wYXRoTGVmdCgpICsgJyBcXHUyMUJBJywgJ2lzUGF0aExlZnQnXSxcbiAgICAgICBbbXNnLnBhdGhSaWdodCgpICsgJyBcXHUyMUJCJywgJ2lzUGF0aFJpZ2h0J11dO1xuXG4gIGdlbmVyYXRvci5tYXplX2lzUGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGNoZWNraW5nIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICB2YXIgY29kZSA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICsgJygpJztcbiAgICByZXR1cm4gW2NvZGUsIGdlbmVyYXRvci5PUkRFUl9GVU5DVElPTl9DQUxMXTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lmID0ge1xuICAgIC8vIEJsb2NrIGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfaWYuRElSRUNUSU9OUyA9XG4gICAgICBibG9ja2x5LkJsb2Nrcy5tYXplX2lzUGF0aC5ESVJFQ1RJT05TO1xuXG4gIGdlbmVyYXRvci5tYXplX2lmID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2lmRWxzZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgJ2lmL2Vsc2UnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdFTFNFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmVsc2VDb2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZmVsc2VUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV9pZkVsc2UuRElSRUNUSU9OUyA9XG4gICAgICBibG9ja2x5LkJsb2Nrcy5tYXplX2lzUGF0aC5ESVJFQ1RJT05TO1xuXG4gIGdlbmVyYXRvci5tYXplX2lmRWxzZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZi9lbHNlJyBjb25kaXRpb25hbCBpZiB0aGVyZSBpcyBhIHBhdGguXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2gwID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYnJhbmNoMSA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0VMU0UnKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2gwICtcbiAgICAgICAgICAgICAgICd9IGVsc2Uge1xcbicgKyBicmFuY2gxICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmthcmVsX2lmID0ge1xuICAgIC8vIEJsb2NrIGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pZkNvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZlRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3Iua2FyZWxfaWYgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmthcmVsX2lmLkRJUkVDVElPTlMgPSBbXG4gICAgICAgW21zZy5waWxlUHJlc2VudCgpLCAncGlsZVByZXNlbnQnXSxcbiAgICAgICBbbXNnLmhvbGVQcmVzZW50KCksICdob2xlUHJlc2VudCddLFxuICAgICAgIFttc2cucGF0aEFoZWFkKCksICdpc1BhdGhGb3J3YXJkJ11cbiAgLy8gICAgIFttc2cubm9QYXRoQWhlYWQoKSwgJ25vUGF0aEZvcndhcmQnXVxuICBdO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmthcmVsX2lmRWxzZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgJ2lmL2Vsc2UnIGNvbmRpdGlvbmFsIGlmIHRoZXJlIGlzIGEgcGF0aC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pZkNvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuRElSRUNUSU9OUyksICdESVInKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRUxTRScpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5lbHNlQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaWZlbHNlVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5rYXJlbF9pZkVsc2UgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYvZWxzZScgY29uZGl0aW9uYWwgaWYgdGhlcmUgaXMgYSBwYXRoLlxuICAgIHZhciBhcmd1bWVudCA9ICdNYXplLicgKyB0aGlzLmdldFRpdGxlVmFsdWUoJ0RJUicpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoMCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgdmFyIGJyYW5jaDEgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdFTFNFJyk7XG4gICAgdmFyIGNvZGUgPSAnaWYgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoMCArXG4gICAgICAgICAgICAgICAnfSBlbHNlIHtcXG4nICsgYnJhbmNoMSArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5rYXJlbF9pZkVsc2UuRElSRUNUSU9OUyA9XG4gICAgICBibG9ja2x5LkJsb2Nrcy5rYXJlbF9pZi5ESVJFQ1RJT05TO1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfd2hpbGVOb3RDbGVhciA9IHtcbiAgICBoZWxwVXJsOiAnaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Jsb2NrbHkvd2lraS9SZXBlYXQnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5ESVJFQ1RJT05TKSwgJ0RJUicpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hpbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IubWF6ZV93aGlsZU5vdENsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnRElSJykgK1xuICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgYnJhbmNoID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICBicmFuY2ggPSBjb2RlZ2VuLmxvb3BUcmFwKCkgKyBicmFuY2g7XG4gICAgcmV0dXJuICd3aGlsZSAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV93aGlsZU5vdENsZWFyLkRJUkVDVElPTlMgPSBbXG4gICAgW21zZy53aGlsZU1zZygpICsgJyAnICsgbXNnLnBpbGVQcmVzZW50KCksICdwaWxlUHJlc2VudCddLFxuICAgIFttc2cud2hpbGVNc2coKSArICcgJyArIG1zZy5ob2xlUHJlc2VudCgpLCAnaG9sZVByZXNlbnQnXVxuICBdO1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfdW50aWxCbG9ja2VkID0ge1xuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1JlcGVhdCcsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnJlcGVhdFVudGlsQmxvY2tlZCgpKTtcbiAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ0RPJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmRvQ29kZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoaWxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLm1hemVfdW50aWxCbG9ja2VkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuaXNQYXRoRm9yd2FyZCcgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIGJyYW5jaCA9IGNvZGVnZW4ubG9vcFRyYXAoKSArIGJyYW5jaDtcbiAgICByZXR1cm4gJ3doaWxlICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5tYXplX2ZvcmV2ZXIgPSB7XG4gICAgLy8gRG8gZm9yZXZlciBsb29wLlxuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1JlcGVhdCcsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnJlcGVhdFVudGlsKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5tYXplX2ZvcmV2ZXIsIDM1LCAzNSkpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hpbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IubWF6ZV9mb3JldmVyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgZG8gZm9yZXZlciBsb29wLlxuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIGJyYW5jaCA9IGNvZGVnZW4ubG9vcFRyYXAoKSArIGNvZGVnZW4ubG9vcEhpZ2hsaWdodCgnTWF6ZScsIHRoaXMuaWQpICsgYnJhbmNoO1xuICAgIHJldHVybiAnd2hpbGUgKE1hemUubm90RmluaXNoZWQoKSkge1xcbicgKyBicmFuY2ggKyAnfVxcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MubWF6ZV91bnRpbEJsb2NrZWRPck5vdENsZWFyID0ge1xuICAgIGhlbHBVcmw6ICdodHRwOi8vY29kZS5nb29nbGUuY29tL3AvYmxvY2tseS93aWtpL1JlcGVhdCcsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMjIsIDAuOTAsIDAuOTUpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLkRJUkVDVElPTlMpLCAnRElSJyk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGlsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5tYXplX3VudGlsQmxvY2tlZE9yTm90Q2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS4nICsgdGhpcy5nZXRUaXRsZVZhbHVlKCdESVInKSArXG4gICAgICAgICcoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKSc7XG4gICAgdmFyIGJyYW5jaCA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0RPJyk7XG4gICAgYnJhbmNoID0gY29kZWdlbi5sb29wVHJhcCgpICsgYnJhbmNoO1xuICAgIHJldHVybiAnd2hpbGUgKCcgKyBhcmd1bWVudCArICcpIHtcXG4nICsgYnJhbmNoICsgJ31cXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLm1hemVfdW50aWxCbG9ja2VkT3JOb3RDbGVhci5ESVJFQ1RJT05TID0gW1xuICAgICAgIFttc2cud2hpbGVNc2coKSArICcgJyArIG1zZy5waWxlUHJlc2VudCgpLCAncGlsZVByZXNlbnQnXSxcbiAgICAgICBbbXNnLndoaWxlTXNnKCkgKyAnICcgKyBtc2cuaG9sZVByZXNlbnQoKSwgJ2hvbGVQcmVzZW50J10sXG4gICAgICAgW21zZy5yZXBlYXRVbnRpbEJsb2NrZWQoKSwgJ2lzUGF0aEZvcndhcmQnXVxuICBdO1xuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG5cbn07XG4iLCIvKmpzaGludCAtVzA4NiAqL1xuXG52YXIgRGlydERyYXdlciA9IHJlcXVpcmUoJy4vZGlydERyYXdlcicpO1xucmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGNlbGxJZCA9IHJlcXVpcmUoJy4vbWF6ZVV0aWxzJykuY2VsbElkO1xuXG52YXIgU1ZHX05TID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzJykuU1ZHX05TO1xudmFyIFNRVUFSRV9TSVpFID0gNTA7XG5cbi8qKlxuICogSW5oZXJpdHMgRGlydERyYXdlciB0byBkcmF3IGZsb3dlcnMvaG9uZXljb21iIGZvciBiZWUuXG4gKiBAcGFyYW0gZGlydE1hcCBUaGUgZGlydE1hcCBmcm9tIHRoZSBtYXplLCB3aGljaCBzaG93cyB0aGUgY3VycmVudCBzdGF0ZSBvZlxuICogICB0aGUgZGlydCAob3IgZmxvd2Vycy9ob25leSBpbiB0aGlzIGNhc2UpLlxuICogQHBhcmFtIHNraW4gVGhlIGFwcCdzIHNraW4sIHVzZWQgdG8gZ2V0IFVSTHMgZm9yIG91ciBpbWFnZXNcbiAqIEBwYXJhbSBiZWUgVGhlIG1hemUncyBCZWUgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBCZWVJdGVtRHJhd2VyKG1hcCwgc2tpbiwgYmVlKSB7XG4gIHRoaXMuX19iYXNlID0gQmVlSXRlbURyYXdlci5zdXBlclByb3RvdHlwZTtcblxuICBEaXJ0RHJhd2VyLmNhbGwodGhpcywgbWFwLCAnJyk7XG5cbiAgdGhpcy5za2luXyA9IHNraW47XG4gIHRoaXMuYmVlXyA9IGJlZTtcblxuICB0aGlzLmhvbmV5SW1hZ2VzXyA9IFtdO1xuICB0aGlzLm5lY3RhckltYWdlc18gPSBbXTtcbiAgdGhpcy5zdmdfID0gbnVsbDtcbiAgdGhpcy5wZWdtYW5fID0gbnVsbDtcblxuICAvLyBpcyBpdGVtIGN1cnJlbnRseSBjb3ZlcmVkIGJ5IGEgY2xvdWQ/XG4gIHRoaXMuY2xvdWRlZF8gPSB1bmRlZmluZWQ7XG4gIHRoaXMucmVzZXRDbG91ZGVkKCk7XG59XG5cbkJlZUl0ZW1EcmF3ZXIuaW5oZXJpdHMoRGlydERyYXdlcik7XG5tb2R1bGUuZXhwb3J0cyA9IEJlZUl0ZW1EcmF3ZXI7XG5cbi8qKlxuICogUmVzZXRzIG91ciB0cmFja2luZyBvZiBjbG91ZGVkL3JldmVhbGVkIHNxdWFyZXMuIFVzZWQgb25cbiAqIGluaXRpYWxpemF0aW9uIGFuZCBhbHNvIHRvIHJlc2V0IHRoZSBkcmF3ZXIgYmV0d2VlbiByYW5kb21pemVkXG4gKiBjb25kaXRpb25hbHMgcnVucy5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUucmVzZXRDbG91ZGVkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmNsb3VkZWRfID0gdGhpcy5iZWVfLmN1cnJlbnRTdGF0aWNHcmlkLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9KTtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgRGlydERyYXdlcidzIHVwZGF0ZUl0ZW1JbWFnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcnVubmluZyBJcyB1c2VyIGNvZGUgY3VycmVudGx5IHJ1bm5pbmdcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlSXRlbUltYWdlID0gZnVuY3Rpb24gKHJvdywgY29sLCBydW5uaW5nKSB7XG4gIHZhciBiYXNlSW1hZ2UgPSB7XG4gICAgaHJlZjogbnVsbCxcbiAgICB1bmNsaXBwZWRXaWR0aDogU1FVQVJFX1NJWkVcbiAgfTtcblxuICBpZiAodGhpcy5iZWVfLmlzSGl2ZShyb3csIGNvbCwgZmFsc2UpKSB7XG4gICAgYmFzZUltYWdlLmhyZWYgPSB0aGlzLnNraW5fLmhvbmV5O1xuICB9IGVsc2UgaWYgKHRoaXMuYmVlXy5pc0Zsb3dlcihyb3csIGNvbCwgZmFsc2UpKSB7XG4gICAgYmFzZUltYWdlLmhyZWYgPSB0aGlzLmZsb3dlckltYWdlSHJlZl8ocm93LCBjb2wpO1xuICB9XG5cbiAgdmFyIGlzQ2xvdWRhYmxlID0gdGhpcy5iZWVfLmlzQ2xvdWRhYmxlKHJvdywgY29sKTtcbiAgdmFyIGlzQ2xvdWRlZCA9ICFydW5uaW5nICYmIGlzQ2xvdWRhYmxlO1xuICB2YXIgd2FzQ2xvdWRlZCA9IGlzQ2xvdWRhYmxlICYmICh0aGlzLmNsb3VkZWRfW3Jvd11bY29sXSA9PT0gdHJ1ZSk7XG5cbiAgdmFyIGNvdW50ZXJUZXh0O1xuICB2YXIgQUJTX1ZBTFVFX1VOTElNSVRFRCA9IDk5OyAgLy8gUmVwZXNlbnRzIHVubGltaXRlZCBuZWN0YXIvaG9uZXkuXG4gIHZhciBBQlNfVkFMVUVfWkVSTyA9IDk4OyAgLy8gUmVwcmVzZW50cyB6ZXJvIG5lY3Rhci9ob25leS5cbiAgdmFyIGFic1ZhbCA9IE1hdGguYWJzKHRoaXMuYmVlXy5nZXRWYWx1ZShyb3csIGNvbCkpO1xuICBpZiAoaXNDbG91ZGVkKSB7XG4gICAgY291bnRlclRleHQgPSBcIlwiO1xuICB9IGVsc2UgaWYgKCFydW5uaW5nICYmIGJhc2VJbWFnZS5ocmVmID09PSB0aGlzLnNraW5fLnB1cnBsZUZsb3dlcikge1xuICAgIC8vIEluaXRpYWxseSwgaGlkZSBjb3VudGVyIHZhbHVlcyBvZiBwdXJwbGUgZmxvd2Vycy5cbiAgICBjb3VudGVyVGV4dCA9IFwiP1wiO1xuICB9IGVsc2UgaWYgKGFic1ZhbCA9PT0gQUJTX1ZBTFVFX1VOTElNSVRFRCkge1xuICAgIGNvdW50ZXJUZXh0ID0gXCJcIjtcbiAgfSBlbHNlIGlmIChhYnNWYWwgPT09IEFCU19WQUxVRV9aRVJPKSB7XG4gICAgY291bnRlclRleHQgPSBcIjBcIjtcbiAgfSBlbHNlIHtcbiAgICBjb3VudGVyVGV4dCA9IFwiXCIgKyBhYnNWYWw7XG4gIH1cblxuICAvLyBEaXNwbGF5IHRoZSBpbWFnZXMuXG4gIGlmIChiYXNlSW1hZ2UuaHJlZikge1xuICAgIHRoaXMudXBkYXRlSW1hZ2VXaXRoSW5kZXhfKCdiZWVJdGVtJywgcm93LCBjb2wsIGJhc2VJbWFnZSwgMCk7XG4gICAgdGhpcy51cGRhdGVDb3VudGVyXygnY291bnRlcicsIHJvdywgY29sLCBjb3VudGVyVGV4dCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2JlZUl0ZW0nLCByb3csIGNvbCwgYmFzZUltYWdlLCAtMSk7XG4gICAgdGhpcy51cGRhdGVDb3VudGVyXygnY291bnRlcicsIHJvdywgY29sLCBcIlwiKTtcbiAgfVxuXG4gIGlmIChpc0Nsb3VkZWQpIHtcbiAgICB0aGlzLnNob3dDbG91ZF8ocm93LCBjb2wpO1xuICAgIHRoaXMuY2xvdWRlZF9bcm93XVtjb2xdID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh3YXNDbG91ZGVkKSB7XG4gICAgdGhpcy5oaWRlQ2xvdWRfKHJvdywgY29sKTtcbiAgICB0aGlzLmNsb3VkZWRfW3Jvd11bY29sXSA9IGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY291bnRlciBhdCB0aGUgZ2l2ZW4gcm93LGNvbCB3aXRoIHRoZSBwcm92aWRlZCBjb3VudGVyVGV4dC5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlQ291bnRlcl8gPSBmdW5jdGlvbiAocHJlZml4LCByb3csIGNvbCwgY291bnRlclRleHQpIHtcbiAgdmFyIGNvdW50ZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2VsbElkKHByZWZpeCwgcm93LCBjb2wpKTtcbiAgaWYgKCFjb3VudGVyRWxlbWVudCkge1xuICAgIC8vIHdlIHdhbnQgYW4gZWxlbWVudCwgc28gbGV0J3MgY3JlYXRlIG9uZVxuICAgIGNvdW50ZXJFbGVtZW50ID0gY3JlYXRlVGV4dChwcmVmaXgsIHJvdywgY29sLCBjb3VudGVyVGV4dCk7XG4gIH1cbiAgY291bnRlckVsZW1lbnQuZmlyc3RDaGlsZC5ub2RlVmFsdWUgPSBjb3VudGVyVGV4dDtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHQgKHByZWZpeCwgcm93LCBjb2wsIGNvdW50ZXJUZXh0KSB7XG4gIHZhciBwZWdtYW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuXG4gIC8vIENyZWF0ZSB0ZXh0LlxuICB2YXIgaFBhZGRpbmcgPSAyO1xuICB2YXIgdlBhZGRpbmcgPSAyO1xuICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICd0ZXh0Jyk7XG4gIC8vIFBvc2l0aW9uIHRleHQganVzdCBpbnNpZGUgdGhlIGJvdHRvbSByaWdodCBjb3JuZXIuXG4gIHRleHQuc2V0QXR0cmlidXRlKCd4JywgKGNvbCArIDEpICogU1FVQVJFX1NJWkUgLSBoUGFkZGluZyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCd5JywgKHJvdyArIDEpICogU1FVQVJFX1NJWkUgLSB2UGFkZGluZyk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdpZCcsIGNlbGxJZChwcmVmaXgsIHJvdywgY29sKSk7XG4gIHRleHQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdiZWUtY291bnRlci10ZXh0Jyk7XG4gIHRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY291bnRlclRleHQpKTtcbiAgc3ZnLmluc2VydEJlZm9yZSh0ZXh0LCBwZWdtYW5FbGVtZW50KTtcblxuICByZXR1cm4gdGV4dDtcbn1cblxuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuY3JlYXRlQ291bnRlckltYWdlXyA9IGZ1bmN0aW9uIChwcmVmaXgsIGksIHJvdywgaHJlZikge1xuICB2YXIgaWQgPSBwcmVmaXggKyAoaSArIDEpO1xuICB2YXIgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCd3aWR0aCcsIFNRVUFSRV9TSVpFKTtcbiAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBTUVVBUkVfU0laRSk7XG4gIGltYWdlLnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcblxuICBpbWFnZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaHJlZik7XG5cbiAgdGhpcy5nZXRTdmdfKCkuaW5zZXJ0QmVmb3JlKGltYWdlLCB0aGlzLmdldFBlZ21hbkVsZW1lbnRfKCkpO1xuXG4gIHJldHVybiBpbWFnZTtcbn07XG5cbkJlZUl0ZW1EcmF3ZXIucHJvdG90eXBlLmZsb3dlckltYWdlSHJlZl8gPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMuYmVlXy5pc1JlZEZsb3dlcihyb3csIGNvbCkgPyB0aGlzLnNraW5fLnJlZEZsb3dlciA6XG4gICAgdGhpcy5za2luXy5wdXJwbGVGbG93ZXI7XG59O1xuXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS51cGRhdGVIb25leUNvdW50ZXIgPSBmdW5jdGlvbiAoaG9uZXlDb3VudCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGhvbmV5Q291bnQ7IGkrKykge1xuICAgIGlmICghdGhpcy5ob25leUltYWdlc19baV0pIHtcbiAgICAgIHRoaXMuaG9uZXlJbWFnZXNfW2ldID0gdGhpcy5jcmVhdGVDb3VudGVySW1hZ2VfKCdob25leScsIGksIDEsXG4gICAgICAgIHRoaXMuc2tpbl8uaG9uZXkpO1xuICAgIH1cblxuICAgIHZhciBkZWx0YVggPSBTUVVBUkVfU0laRTtcbiAgICBpZiAoaG9uZXlDb3VudCA+IDgpIHtcbiAgICAgIGRlbHRhWCA9ICg4IC0gMSkgKiBTUVVBUkVfU0laRSAvIChob25leUNvdW50IC0gMSk7XG4gICAgfVxuICAgIHRoaXMuaG9uZXlJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZSgneCcsIGkgKiBkZWx0YVgpO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHRoaXMuaG9uZXlJbWFnZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5ob25leUltYWdlc19baV0uc2V0QXR0cmlidXRlKCdkaXNwbGF5JywgaSA8IGhvbmV5Q291bnQgPyAnYmxvY2snIDogJ25vbmUnKTtcbiAgfVxufTtcblxuQmVlSXRlbURyYXdlci5wcm90b3R5cGUudXBkYXRlTmVjdGFyQ291bnRlciA9IGZ1bmN0aW9uIChuZWN0YXJzKSB7XG4gIHZhciBuZWN0YXJDb3VudCA9IG5lY3RhcnMubGVuZ3RoO1xuICAvLyBjcmVhdGUgYW55IG5lZWRlZCBpbWFnZXNcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZWN0YXJDb3VudDsgaSsrKSB7XG4gICAgdmFyIGhyZWYgPSB0aGlzLmZsb3dlckltYWdlSHJlZl8obmVjdGFyc1tpXS5yb3csIG5lY3RhcnNbaV0uY29sKTtcblxuICAgIGlmICghdGhpcy5uZWN0YXJJbWFnZXNfW2ldKSB7XG4gICAgICB0aGlzLm5lY3RhckltYWdlc19baV0gPSB0aGlzLmNyZWF0ZUNvdW50ZXJJbWFnZV8oJ25lY3RhcicsIGksIDAsIGhyZWYpO1xuICAgIH1cblxuICAgIHZhciBkZWx0YVggPSBTUVVBUkVfU0laRTtcbiAgICBpZiAobmVjdGFyQ291bnQgPiA4KSB7XG4gICAgICBkZWx0YVggPSAoOCAtIDEpICogU1FVQVJFX1NJWkUgLyAobmVjdGFyQ291bnQgLSAxKTtcbiAgICB9XG4gICAgdGhpcy5uZWN0YXJJbWFnZXNfW2ldLnNldEF0dHJpYnV0ZSgneCcsIGkgKiBkZWx0YVgpO1xuICAgIHRoaXMubmVjdGFySW1hZ2VzX1tpXS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAneGxpbms6aHJlZicsIGhyZWYpO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHRoaXMubmVjdGFySW1hZ2VzXy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMubmVjdGFySW1hZ2VzX1tpXS5zZXRBdHRyaWJ1dGUoJ2Rpc3BsYXknLCBpIDwgbmVjdGFyQ291bnQgPyAnYmxvY2snIDogJ25vbmUnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDYWNoZSBzdmcgZWxlbWVudFxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5nZXRTdmdfID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuc3ZnXykge1xuICAgIHRoaXMuc3ZnXyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuc3ZnXztcbn07XG5cbi8qKlxuICogQ2FjaGUgcGVnbWFuIGVsZW1lbnRcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuZ2V0UGVnbWFuRWxlbWVudF8gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5wZWdtYW5fKSB7XG4gICAgdGhpcy5wZWdtYW5fID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gIH1cbiAgcmV0dXJuIHRoaXMucGVnbWFuXztcbn07XG5cbi8qKlxuICogU2hvdyB0aGUgY2xvdWQgaWNvbi5cbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuc2hvd0Nsb3VkXyA9IGZ1bmN0aW9uKHJvdywgY29sKSB7XG4gIHZhciBjbG91ZEltYWdlSW5mbyAgPSB7XG4gICAgaHJlZjogdGhpcy5za2luXy5jbG91ZCxcbiAgICB1bmNsaXBwZWRXaWR0aDogNTBcbiAgfTtcbiAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2Nsb3VkJywgcm93LCBjb2wsIGNsb3VkSW1hZ2VJbmZvLCAwKTtcblxuICAvLyBNYWtlIHN1cmUgdGhlIGFuaW1hdGlvbiBpcyBjYWNoZWQgYnkgdGhlIGJyb3dzZXIuXG4gIHRoaXMuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyhyb3csIGNvbCwgZmFsc2UgLyogYW5pbWF0ZSAqLyk7XG59O1xuXG4vKipcbiAqIEhpZGUgdGhlIGNsb3VkIGljb24sIGFuZCBkaXNwbGF5IHRoZSBjbG91ZCBoaWRpbmcgYW5pbWF0aW9uLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5oaWRlQ2xvdWRfID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgdmFyIGNsb3VkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNlbGxJZCgnY2xvdWQnLCByb3csIGNvbCkpO1xuICBpZiAoY2xvdWRFbGVtZW50KSB7XG4gICAgY2xvdWRFbGVtZW50LnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfVxuXG4gIHRoaXMuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyhyb3csIGNvbCwgdHJ1ZSAvKiBhbmltYXRlICovKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBjbG91ZCBhbmltYXRpb24gZWxlbWVudCwgYW5kIHBlcmZvcm0gdGhlIGFuaW1hdGlvbiBpZiBuZWNlc3NhcnlcbiAqL1xuQmVlSXRlbURyYXdlci5wcm90b3R5cGUuZGlzcGxheUNsb3VkQW5pbWF0aW9uXyA9IGZ1bmN0aW9uKHJvdywgY29sLCBhbmltYXRlKSB7XG4gIHZhciBpZCA9IGNlbGxJZCgnY2xvdWRBbmltYXRpb24nLCByb3csIGNvbCk7XG5cbiAgdmFyIGNsb3VkQW5pbWF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gIGlmICghY2xvdWRBbmltYXRpb24pIHtcbiAgICB2YXIgcGVnbWFuRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BlZ21hbi1sb2NhdGlvbicpWzBdO1xuICAgIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuICAgIGNsb3VkQW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ2ltYWdlJyk7XG4gICAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICAgIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgICBjbG91ZEFuaW1hdGlvbi5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gICAgY2xvdWRBbmltYXRpb24uc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChjbG91ZEFuaW1hdGlvbiwgcGVnbWFuRWxlbWVudCk7XG4gIH1cblxuICAvLyBXZSB3YW50IHRvIGNyZWF0ZSB0aGUgZWxlbWVudCBldmVudCBpZiB3ZSdyZSBub3QgYW5pbWF0aW5nIHlldCBzbyB0aGF0IHdlXG4gIC8vIGNhbiBtYWtlIHN1cmUgaXQgZ2V0cyBsb2FkZWQuXG4gIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsIGFuaW1hdGUgPyAndmlzaWJsZScgOiAnaGlkZGVuJyk7XG4gIGNsb3VkQW5pbWF0aW9uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICd4bGluazpocmVmJywgdGhpcy5za2luXy5jbG91ZEFuaW1hdGlvbik7XG59O1xuXG4vKipcbiAqIERyYXcgb3VyIGNoZWNrZXJib2FyZCB0aWxlLCBtYWtpbmcgcGF0aCB0aWxlcyBsaWdodGVyLiBGb3Igbm9uLXBhdGggdGlsZXMsIHdlXG4gKiB3YW50IHRvIGJlIHN1cmUgdGhhdCB0aGUgY2hlY2tlcmJvYXJkIHNxdWFyZSBpcyBiZWxvdyB0aGUgdGlsZSBlbGVtZW50IChpLmUuXG4gKiB0aGUgdHJlZXMpLlxuICovXG5CZWVJdGVtRHJhd2VyLnByb3RvdHlwZS5hZGRDaGVja2VyYm9hcmRUaWxlID0gZnVuY3Rpb24gKHJvdywgY29sLCBpc1BhdGgpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdNYXplJyk7XG4gIHZhciByZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgJ3JlY3QnKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneCcsIGNvbCAqIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByb3cgKiBTUVVBUkVfU0laRSk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCdmaWxsJywgJyM3OGJiMjknKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCBpc1BhdGggPyAwLjIgOiAwLjUpO1xuICBpZiAoaXNQYXRoKSB7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHJlY3QpO1xuICB9IGVsc2Uge1xuICAgIHZhciB0aWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIChyb3cgKiA4ICsgY29sKSk7XG4gICAgc3ZnLmluc2VydEJlZm9yZShyZWN0LCB0aWxlKTtcbiAgfVxufTtcbiIsInZhciBjZWxsSWQgPSByZXF1aXJlKCcuL21hemVVdGlscycpLmNlbGxJZDtcblxuLy8gVGhlIG51bWJlciBsaW5lIGlzIFstaW5mLCBtaW4sIG1pbisxLCAuLi4gbm8gemVybyAuLi4sIG1heC0xLCBtYXgsICtpbmZdXG52YXIgRElSVF9NQVggPSAxMDtcbnZhciBESVJUX0NPVU5UID0gRElSVF9NQVggKiAyICsgMjtcblxuLy8gRHVwbGljYXRlZCBmcm9tIG1hemUuanMgc28gdGhhdCBJIGRvbid0IG5lZWQgYSBkZXBlbmRlbmN5XG52YXIgU1FVQVJFX1NJWkUgPSA1MDtcblxudmFyIFNWR19OUyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cycpLlNWR19OUztcblxudmFyIERpcnREcmF3ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtYXAsIGRpcnRBc3NldCkge1xuICB0aGlzLm1hcF8gPSBtYXA7XG5cbiAgdGhpcy5kaXJ0SW1hZ2VJbmZvXyA9IHtcbiAgICBocmVmOiBkaXJ0QXNzZXQsXG4gICAgdW5jbGlwcGVkV2lkdGg6IFNRVUFSRV9TSVpFICogRElSVF9DT1VOVFxuICB9O1xufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIGltYWdlIGF0IHRoZSBnaXZlbiByb3csY29sIGJ5IGRldGVybWluaW5nIHRoZSBzcHJpdGVJbmRleCBmb3IgdGhlXG4gKiBjdXJyZW50IHZhbHVlXG4gKi9cbkRpcnREcmF3ZXIucHJvdG90eXBlLnVwZGF0ZUl0ZW1JbWFnZSA9IGZ1bmN0aW9uIChyb3csIGNvbCwgcnVubmluZykge1xuICB2YXIgdmFsID0gdGhpcy5tYXBfLmdldFZhbHVlKHJvdywgY29sKTtcbiAgdGhpcy51cGRhdGVJbWFnZVdpdGhJbmRleF8oJ2RpcnQnLCByb3csIGNvbCwgdGhpcy5kaXJ0SW1hZ2VJbmZvXyxcbiAgICBzcHJpdGVJbmRleEZvckRpcnQodmFsKSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgaW1hZ2UgYXQgdGhlIGdpdmVuIHJvdyxjb2wgd2l0aCB0aGUgcHJvdmlkZWQgc3ByaXRlSW5kZXguXG4gKi9cbkRpcnREcmF3ZXIucHJvdG90eXBlLnVwZGF0ZUltYWdlV2l0aEluZGV4XyA9IGZ1bmN0aW9uIChwcmVmaXgsIHJvdywgY29sLCBpbWFnZUluZm8sIHNwcml0ZUluZGV4KSB7XG4gIHZhciBoaWRkZW5JbWFnZSA9IChzcHJpdGVJbmRleCA8IDAgfHwgaW1hZ2VJbmZvLmhyZWYgPT09IG51bGwpO1xuXG4gIHZhciBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjZWxsSWQocHJlZml4LCByb3csIGNvbCkpO1xuICBpZiAoIWltZykge1xuICAgIC8vIHdlIGRvbid0IG5lZWQgYW55IGltYWdlXG4gICAgaWYgKGhpZGRlbkltYWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHdlIHdhbnQgYW4gaW1hZ2UsIHNvIGxldCdzIGNyZWF0ZSBvbmVcbiAgICBpbWcgPSBjcmVhdGVJbWFnZShwcmVmaXgsIHJvdywgY29sLCBpbWFnZUluZm8pO1xuICB9IGVsc2UgaWYgKGltYWdlSW5mby5ocmVmKSB7XG4gICAgLy91cGRhdGUgaW1nXG4gICAgaW1nLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBpbWFnZUluZm8uaHJlZik7XG4gIH1cblxuICBpbWcuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgaGlkZGVuSW1hZ2UgPyAnaGlkZGVuJyA6ICd2aXNpYmxlJyk7XG4gIGlmICghaGlkZGVuSW1hZ2UpIHtcbiAgICBpbWcuc2V0QXR0cmlidXRlKCd4JywgU1FVQVJFX1NJWkUgKiAoY29sIC0gc3ByaXRlSW5kZXgpKTtcbiAgICBpbWcuc2V0QXR0cmlidXRlKCd5JywgU1FVQVJFX1NJWkUgKiByb3cpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVJbWFnZSAocHJlZml4LCByb3csIGNvbCwgaW1hZ2VJbmZvKSB7XG4gIHZhciBwZWdtYW5FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGVnbWFuLWxvY2F0aW9uJylbMF07XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnTWF6ZScpO1xuXG4gIHZhciBjbGlwSWQgPSBjZWxsSWQocHJlZml4ICsgJ0NsaXAnLCByb3csIGNvbCk7XG4gIHZhciBpbWdJZCA9IGNlbGxJZChwcmVmaXgsIHJvdywgY29sKTtcblxuICAvLyBDcmVhdGUgY2xpcCBwYXRoLlxuICB2YXIgY2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdjbGlwUGF0aCcpO1xuICBjbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCBjbGlwSWQpO1xuICB2YXIgcmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsICdyZWN0Jyk7XG4gIHJlY3Quc2V0QXR0cmlidXRlKCd4JywgY29sICogU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgneScsIHJvdyAqIFNRVUFSRV9TSVpFKTtcbiAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgU1FVQVJFX1NJWkUpO1xuICByZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU1FVQVJFX1NJWkUpO1xuICBjbGlwLmFwcGVuZENoaWxkKHJlY3QpO1xuICBzdmcuaW5zZXJ0QmVmb3JlKGNsaXAsIHBlZ21hbkVsZW1lbnQpO1xuICAvLyBDcmVhdGUgaW1hZ2UuXG4gIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCAnaW1hZ2UnKTtcbiAgaW1nLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBpbWFnZUluZm8uaHJlZik7XG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIFNRVUFSRV9TSVpFKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBpbWFnZUluZm8udW5jbGlwcGVkV2lkdGgpO1xuICBpbWcuc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCMnICsgY2xpcElkICsgJyknKTtcbiAgaW1nLnNldEF0dHJpYnV0ZSgnaWQnLCBpbWdJZCk7XG4gIHN2Zy5pbnNlcnRCZWZvcmUoaW1nLCBwZWdtYW5FbGVtZW50KTtcblxuICByZXR1cm4gaW1nO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgZGlydCB2YWx1ZSwgcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHNwcml0ZSB0byB1c2UgaW4gb3VyIHNwcml0ZXNoZWV0LlxuICogUmV0dXJucyAtMSBpZiB3ZSB3YW50IHRvIGRpc3BsYXkgbm8gc3ByaXRlLlxuICovXG4gZnVuY3Rpb24gc3ByaXRlSW5kZXhGb3JEaXJ0ICh2YWwpIHtcbiAgdmFyIHNwcml0ZUluZGV4O1xuXG4gIGlmICh2YWwgPT09IDApIHtcbiAgICBzcHJpdGVJbmRleCA9IC0xO1xuICB9IGVsc2UgaWYodmFsIDwgLURJUlRfTUFYKSB7XG4gICAgc3ByaXRlSW5kZXggPSAwO1xuICB9IGVsc2UgaWYgKHZhbCA8IDApIHtcbiAgICBzcHJpdGVJbmRleCA9IERJUlRfTUFYICsgdmFsICsgMTtcbiAgfSBlbHNlIGlmICh2YWwgPiBESVJUX01BWCkge1xuICAgIHNwcml0ZUluZGV4ID0gRElSVF9DT1VOVCAtIDE7XG4gIH0gZWxzZSBpZiAodmFsID4gMCkge1xuICAgIHNwcml0ZUluZGV4ID0gRElSVF9NQVggKyB2YWw7XG4gIH1cblxuICByZXR1cm4gc3ByaXRlSW5kZXg7XG59XG5cbi8qIHN0YXJ0LXRlc3QtYmxvY2sgKi9cbi8vIGV4cG9ydCBwcml2YXRlIGZ1bmN0aW9uKHMpIHRvIGV4cG9zZSB0byB1bml0IHRlc3RpbmdcbkRpcnREcmF3ZXIuX190ZXN0b25seV9fID0ge1xuICBzcHJpdGVJbmRleEZvckRpcnQ6IHNwcml0ZUluZGV4Rm9yRGlydCxcbiAgY3JlYXRlSW1hZ2U6IGNyZWF0ZUltYWdlXG59O1xuLyogZW5kLXRlc3QtYmxvY2sgKi9cbiIsIi8qKlxuICogR2VuZXJhbGl6ZWQgZnVuY3Rpb24gZm9yIGdlbmVyYXRpbmcgaWRzIGZvciBjZWxscyBpbiBhIHRhYmxlXG4gKi9cbmV4cG9ydHMuY2VsbElkID0gZnVuY3Rpb24gKHByZWZpeCwgcm93LCBjb2wpIHtcbiAgcmV0dXJuIHByZWZpeCArICdfJyArIHJvdyArICdfJyArIGNvbDtcbn07XG5cbi8qKlxuICogSXMgc2tpbiBlaXRoZXIgYmVlIG9yIGJlZV9uaWdodFxuICovXG5leHBvcnRzLmlzQmVlU2tpbiA9IGZ1bmN0aW9uIChza2luSWQpIHtcbiAgcmV0dXJuICgvYmVlKF9uaWdodCk/LykudGVzdChza2luSWQpO1xufTtcblxuLyoqXG4gKiBJcyBza2luIHNjcmF0XG4gKi9cbmV4cG9ydHMuaXNTY3JhdFNraW4gPSBmdW5jdGlvbiAoc2tpbklkKSB7XG4gIHJldHVybiAoL3NjcmF0LykudGVzdChza2luSWQpO1xufTtcbiIsIi8qKlxuICogQmxvY2tzIHNwZWNpZmljIHRvIEJlZVxuICovXG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYmxvY2tVdGlscyA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJyk7XG5cbnZhciBPUEVSQVRPUlMgPSBbXG4gIFsnPScsICc9PSddLFxuICBbJzwnLCAnPCddLFxuICBbJz4nLCAnPiddXG5dO1xuXG52YXIgVE9PTFRJUFMgPSB7XG4gICc9PSc6IEJsb2NrbHkuTXNnLkxPR0lDX0NPTVBBUkVfVE9PTFRJUF9FUSxcbiAgJzwnOiBCbG9ja2x5Lk1zZy5MT0dJQ19DT01QQVJFX1RPT0xUSVBfTFQsXG4gICc+JzogQmxvY2tseS5Nc2cuTE9HSUNfQ09NUEFSRV9UT09MVElQX0dUXG59O1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG4gIHZhciBpc0sxID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5pc0sxO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIGFkZElmT25seUZsb3dlcihibG9ja2x5LCBnZW5lcmF0b3IpO1xuICBhZGRJZkZsb3dlckhpdmUoYmxvY2tseSwgZ2VuZXJhdG9yKTtcbiAgYWRkSWZFbHNlRmxvd2VySGl2ZShibG9ja2x5LCBnZW5lcmF0b3IpO1xuXG4gIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgJ2JlZV9pZk5lY3RhckFtb3VudCcsICdpZicsXG4gICAgW1ttc2cubmVjdGFyUmVtYWluaW5nKCksICduZWN0YXJSZW1haW5pbmcnXSxcbiAgICAgW21zZy5ob25leUF2YWlsYWJsZSgpLCAnaG9uZXlBdmFpbGFibGUnXV0pO1xuXG4gIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgJ2JlZV9pZmVsc2VOZWN0YXJBbW91bnQnLCAnaWZlbHNlJyxcbiAgICBbW21zZy5uZWN0YXJSZW1haW5pbmcoKSwgJ25lY3RhclJlbWFpbmluZyddLFxuICAgICBbbXNnLmhvbmV5QXZhaWxhYmxlKCksICdob25leUF2YWlsYWJsZSddXSk7XG5cbiAgYWRkQ29uZGl0aW9uYWxDb21wYXJpc29uQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCAnYmVlX2lmVG90YWxOZWN0YXInLCAnaWYnLFxuICAgIFtbbXNnLnRvdGFsTmVjdGFyKCksICduZWN0YXJDb2xsZWN0ZWQnXSxcbiAgICAgW21zZy50b3RhbEhvbmV5KCksICdob25leUNyZWF0ZWQnXV0pO1xuXG4gIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgJ2JlZV9pZmVsc2VUb3RhbE5lY3RhcicsICdpZmVsc2UnLFxuICAgIFtbbXNnLnRvdGFsTmVjdGFyKCksICduZWN0YXJDb2xsZWN0ZWQnXSxcbiAgICAgW21zZy50b3RhbEhvbmV5KCksICdob25leUNyZWF0ZWQnXV0pO1xuXG4gIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrKGJsb2NrbHksIGdlbmVyYXRvciwgJ2JlZV93aGlsZU5lY3RhckFtb3VudCcsICd3aGlsZScsXG4gICAgW1ttc2cubmVjdGFyUmVtYWluaW5nKCksICduZWN0YXJSZW1haW5pbmcnXSxcbiAgICAgW21zZy5ob25leUF2YWlsYWJsZSgpLCAnaG9uZXlBdmFpbGFibGUnXV0pO1xuXG4gIGJsb2NrVXRpbHMuZ2VuZXJhdGVTaW1wbGVCbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIHtcbiAgICBuYW1lOiAnbWF6ZV9uZWN0YXInLFxuICAgIGhlbHBVcmw6ICcnLFxuICAgIHRpdGxlOiBpc0sxID8gbXNnLmdldCgpIDogbXNnLm5lY3RhcigpLFxuICAgIHRpdGxlSW1hZ2U6IGlzSzEgPyBza2luLnJlZEZsb3dlciA6IHVuZGVmaW5lZCxcbiAgICB0b29sdGlwOiBtc2cubmVjdGFyVG9vbHRpcCgpLFxuICAgIGZ1bmN0aW9uTmFtZTogJ01hemUuZ2V0TmVjdGFyJ1xuICB9KTtcblxuICBibG9ja1V0aWxzLmdlbmVyYXRlU2ltcGxlQmxvY2soYmxvY2tseSwgZ2VuZXJhdG9yLCB7XG4gICAgbmFtZTogJ21hemVfaG9uZXknLFxuICAgIGhlbHBVcmw6ICcnLFxuICAgIHRpdGxlOiBpc0sxID8gbXNnLm1ha2UoKSA6IG1zZy5ob25leSgpLFxuICAgIHRpdGxlSW1hZ2U6IGlzSzEgPyBza2luLmhvbmV5IDogdW5kZWZpbmVkLFxuICAgIHRvb2x0aXA6IG1zZy5ob25leVRvb2x0aXAoKSxcbiAgICBmdW5jdGlvbk5hbWU6ICdNYXplLm1ha2VIb25leSdcbiAgfSk7XG59O1xuXG4vKipcbiAqIEFyZSB3ZSBhdCBhIGZsb3dlclxuICovXG5mdW5jdGlvbiBhZGRJZk9ubHlGbG93ZXIoYmxvY2tseSwgZ2VuZXJhdG9yKSB7XG4gIGJsb2NrbHkuQmxvY2tzLmJlZV9pZk9ubHlGbG93ZXIgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxOTYsIDEuMCwgMC43OSk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaWZDb2RlKCkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmF0Rmxvd2VyKCkpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmT25seUZsb3dlclRvb2x0aXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcblxuICAvLyBFWEFNUExFOlxuICAvLyBpZiAoTWF6ZS5hdEZsb3dlcigpKSB7IGNvZGUgfVxuICBnZW5lcmF0b3IuYmVlX2lmT25seUZsb3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yICdpZicgY29uZGl0aW9uYWwgaWYgd2UncmUgYXQgYSBmbG93ZXJcbiAgICB2YXIgYXJndW1lbnQgPSAnTWF6ZS5hdEZsb3dlcicgKyAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBcmUgd2UgYXQgYSBmbG93ZXIgb3IgYSBoaXZlXG4gKi9cbmZ1bmN0aW9uIGFkZElmRmxvd2VySGl2ZShibG9ja2x5LCBnZW5lcmF0b3IpIHtcbiAgYmxvY2tseS5CbG9ja3MuYmVlX2lmRmxvd2VyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIExPQ0FUSU9OUyA9IFtcbiAgICAgICAgW21zZy5hdEZsb3dlcigpLCAnYXRGbG93ZXInXSxcbiAgICAgICAgW21zZy5hdEhvbmV5Y29tYigpLCAnYXRIb25leWNvbWInXVxuICAgICAgXTtcblxuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmlmQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oTE9DQVRJT05TKSwgJ0xPQycpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmlmRmxvd2VyVG9vbHRpcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIEVYQU1QTEVTOlxuICAvLyBpZiAoTWF6ZS5hdEZsb3dlcigpKSB7IGNvZGUgfVxuICAvLyBpZiAoTWF6ZS5hdEhvbmV5Y29tYigpKSB7IGNvZGUgfVxuICBnZW5lcmF0b3IuYmVlX2lmRmxvd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB3ZSdyZSBhdCBhIGZsb3dlci9oaXZlXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnTE9DJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2ggPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBjb2RlID0gJ2lmICgnICsgYXJndW1lbnQgKyAnKSB7XFxuJyArIGJyYW5jaCArICd9XFxuJztcbiAgICByZXR1cm4gY29kZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBcmUgd2UgYXQgYSBmbG93ZXIgb3IgYSBoaXZlIHdpdGggZWxzZVxuICovXG5mdW5jdGlvbiBhZGRJZkVsc2VGbG93ZXJIaXZlKGJsb2NrbHksIGdlbmVyYXRvcikge1xuICBibG9ja2x5LkJsb2Nrcy5iZWVfaWZFbHNlRmxvd2VyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIExPQ0FUSU9OUyA9IFtcbiAgICAgICAgW21zZy5hdEZsb3dlcigpLCAnYXRGbG93ZXInXSxcbiAgICAgICAgW21zZy5hdEhvbmV5Y29tYigpLCAnYXRIb25leWNvbWInXVxuICAgICAgXTtcblxuICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmlmQ29kZSgpKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24oTE9DQVRJT05TKSwgJ0xPQycpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdETycpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5kb0NvZGUoKSk7XG4gICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdFTFNFJylcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmVsc2VDb2RlKCkpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pZmVsc2VGbG93ZXJUb29sdGlwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRVhBTVBMRVM6XG4gIC8vIGlmIChNYXplLmF0Rmxvd2VyKCkpIHsgY29kZSB9IGVsc2UgeyBtb3JlY29kZSB9XG4gIC8vIGlmIChNYXplLmF0SG9uZXljb21iKCkpIHsgY29kZSB9IGVsc2UgeyBtb3JlY29kZSB9XG4gIGdlbmVyYXRvci5iZWVfaWZFbHNlRmxvd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgJ2lmJyBjb25kaXRpb25hbCBpZiB3ZSdyZSBhdCBhIGZsb3dlci9oaXZlXG4gICAgdmFyIGFyZ3VtZW50ID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnTE9DJykgK1xuICAgICAgICAnKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyknO1xuICAgIHZhciBicmFuY2gwID0gZ2VuZXJhdG9yLnN0YXRlbWVudFRvQ29kZSh0aGlzLCAnRE8nKTtcbiAgICB2YXIgYnJhbmNoMSA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0VMU0UnKTtcbiAgICB2YXIgY29kZSA9ICdpZiAoJyArIGFyZ3VtZW50ICsgJykge1xcbicgKyBicmFuY2gwICtcbiAgICAgICd9IGVsc2Uge1xcbicgKyBicmFuY2gxICsgJ31cXG4nO1xuICAgIHJldHVybiBjb2RlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbENvbXBhcmlzb25CbG9jayhibG9ja2x5LCBnZW5lcmF0b3IsIG5hbWUsIHR5cGUsIGFyZzEpIHtcbiAgYmxvY2tseS5CbG9ja3NbbmFtZV0gPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBjb25kaXRpb25hbE1zZztcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdpZic6XG4gICAgICAgICAgY29uZGl0aW9uYWxNc2cgPSBtc2cuaWZDb2RlKCk7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMTk2LCAxLjAsIDAuNzkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpZmVsc2UnOlxuICAgICAgICAgIGNvbmRpdGlvbmFsTXNnID0gbXNnLmlmQ29kZSgpO1xuICAgICAgICAgIHRoaXMuc2V0SFNWKDE5NiwgMS4wLCAwLjc5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnd2hpbGUnOlxuICAgICAgICAgIGNvbmRpdGlvbmFsTXNnID0gbXNnLndoaWxlTXNnKCk7XG4gICAgICAgICAgdGhpcy5zZXRIU1YoMzIyLCAwLjkwLCAwLjk1KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyAnVW5leHBjdGVkIHR5cGUgZm9yIGFkZENvbmRpdGlvbmFsQ29tcGFyaXNvbkJsb2NrJztcbiAgICAgIH1cblxuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29uZGl0aW9uYWxNc2cpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bihhcmcxKSwgJ0FSRzEnKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKCcgJyk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKE9QRVJBVE9SUyksICdPUCcpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUoJyAnKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkVGV4dElucHV0KCcwJyxcbiAgICAgICAgICAgIGJsb2NrbHkuRmllbGRUZXh0SW5wdXQubnVtYmVyVmFsaWRhdG9yKSwgJ0FSRzInKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRE8nKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuZG9Db2RlKCkpO1xuICAgICAgaWYgKHR5cGUgPT09IFwiaWZlbHNlXCIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnRUxTRScpXG4gICAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmVsc2VDb2RlKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcblxuICAgICAgdGhpcy5zZXRUb29sdGlwKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3AgPSBzZWxmLmdldFRpdGxlVmFsdWUoJ09QJyk7XG4gICAgICAgIHJldHVybiBUT09MVElQU1tvcF07XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gaWYgKE1hemUubmVjdGFyQ29sbGVjdGVkKCkgPiAwKSB7IGNvZGUgfVxuICAvLyBpZiAoTWF6ZS5ob25leUNyZWF0ZWQoKSA9PSAxKSB7IGNvZGUgfVxuICBnZW5lcmF0b3JbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciAnaWYnIGNvbmRpdGlvbmFsIGlmIHdlJ3JlIGF0IGEgZmxvd2VyL2hpdmVcbiAgICB2YXIgYXJndW1lbnQxID0gJ01hemUuJyArIHRoaXMuZ2V0VGl0bGVWYWx1ZSgnQVJHMScpICtcbiAgICAgICAgJyhcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpJztcbiAgICB2YXIgb3BlcmF0b3IgPSB0aGlzLmdldFRpdGxlVmFsdWUoJ09QJyk7XG4gICAgdmFyIG9yZGVyID0gKG9wZXJhdG9yID09PSAnPT0nIHx8IG9wZXJhdG9yID09PSAnIT0nKSA/XG4gICAgICBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfRVFVQUxJVFkgOiBCbG9ja2x5LkphdmFTY3JpcHQuT1JERVJfUkVMQVRJT05BTDtcbiAgICB2YXIgYXJndW1lbnQyID0gdGhpcy5nZXRUaXRsZVZhbHVlKCdBUkcyJyk7XG4gICAgdmFyIGJyYW5jaDAgPSBnZW5lcmF0b3Iuc3RhdGVtZW50VG9Db2RlKHRoaXMsICdETycpO1xuICAgIHZhciBlbHNlQmxvY2sgPSBcIlwiO1xuICAgIGlmICh0eXBlID09PSBcImlmZWxzZVwiKSB7XG4gICAgICB2YXIgYnJhbmNoMSA9IGdlbmVyYXRvci5zdGF0ZW1lbnRUb0NvZGUodGhpcywgJ0VMU0UnKTtcbiAgICAgIGVsc2VCbG9jayA9ICcgZWxzZSB7XFxuJyArIGJyYW5jaDEgKyAnfSc7XG4gICAgfVxuXG4gICAgdmFyIGNvbW1hbmQgPSB0eXBlO1xuICAgIGlmICh0eXBlID09PSBcImlmZWxzZVwiKSB7XG4gICAgICBjb21tYW5kID0gXCJpZlwiO1xuICAgIH1cblxuICAgIHJldHVybiBjb21tYW5kICsgJyAoJyArIGFyZ3VtZW50MSArICcgJyArIG9wZXJhdG9yICArICcgJyArIGFyZ3VtZW50MiArICcpIHtcXG4nICtcbiAgICAgIGJyYW5jaDAgKyAnfScgKyBlbHNlQmxvY2sgKyAnXFxuJztcbiAgfTtcbn1cbiIsInZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBEaXJlY3Rpb24gPSB0aWxlcy5EaXJlY3Rpb247XG52YXIgTW92ZURpcmVjdGlvbiA9IHRpbGVzLk1vdmVEaXJlY3Rpb247XG52YXIgVHVybkRpcmVjdGlvbiA9IHRpbGVzLlR1cm5EaXJlY3Rpb247XG52YXIgU3F1YXJlVHlwZSA9IHRpbGVzLlNxdWFyZVR5cGU7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIEJlZSA9IHJlcXVpcmUoJy4vYmVlJyk7XG5cbi8qKlxuICogT25seSBjYWxsIEFQSSBmdW5jdGlvbnMgaWYgd2UgaGF2ZW4ndCB5ZXQgdGVybWluYXRlZCBleGVjdXRpb25cbiAqL1xudmFyIEFQSV9GVU5DVElPTiA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gdXRpbHMuZXhlY3V0ZUlmQ29uZGl0aW9uYWwoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhTWF6ZS5leGVjdXRpb25JbmZvLmlzVGVybWluYXRlZCgpO1xuICB9LCBmbik7XG59O1xuXG4vKipcbiAqIElzIHRoZXJlIGEgcGF0aCBuZXh0IHRvIHBlZ21hbj9cbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXJlY3Rpb24gRGlyZWN0aW9uIHRvIGxvb2tcbiAqICAgICAoMCA9IGZvcndhcmQsIDEgPSByaWdodCwgMiA9IGJhY2t3YXJkLCAzID0gbGVmdCkuXG4gKiBAcGFyYW0gez9zdHJpbmd9IGlkIElEIG9mIGJsb2NrIHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICogICAgIE51bGwgaWYgY2FsbGVkIGFzIGEgaGVscGVyIGZ1bmN0aW9uIGluIE1hemUubW92ZSgpLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGVyZSBpcyBhIHBhdGguXG4gKi9cbnZhciBpc1BhdGggPSBmdW5jdGlvbihkaXJlY3Rpb24sIGlkKSB7XG4gIHZhciBlZmZlY3RpdmVEaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQgKyBkaXJlY3Rpb247XG4gIHZhciBzcXVhcmU7XG4gIHZhciBjb21tYW5kO1xuICBzd2l0Y2ggKHRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQoZWZmZWN0aXZlRGlyZWN0aW9uKSkge1xuICAgIGNhc2UgRGlyZWN0aW9uLk5PUlRIOlxuICAgICAgc3F1YXJlID0gTWF6ZS5tYXAuZ2V0VGlsZShNYXplLnBlZ21hblkgLSAxLCBNYXplLnBlZ21hblgpO1xuICAgICAgY29tbWFuZCA9ICdsb29rX25vcnRoJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRGlyZWN0aW9uLkVBU1Q6XG4gICAgICBzcXVhcmUgPSBNYXplLm1hcC5nZXRUaWxlKE1hemUucGVnbWFuWSwgTWF6ZS5wZWdtYW5YICsgMSk7XG4gICAgICBjb21tYW5kID0gJ2xvb2tfZWFzdCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5TT1VUSDpcbiAgICAgIHNxdWFyZSA9IE1hemUubWFwLmdldFRpbGUoTWF6ZS5wZWdtYW5ZICsgMSwgTWF6ZS5wZWdtYW5YKTtcbiAgICAgIGNvbW1hbmQgPSAnbG9va19zb3V0aCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5XRVNUOlxuICAgICAgc3F1YXJlID0gTWF6ZS5tYXAuZ2V0VGlsZShNYXplLnBlZ21hblksIE1hemUucGVnbWFuWCAtIDEpO1xuICAgICAgY29tbWFuZCA9ICdsb29rX3dlc3QnO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGlkKSB7XG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKGNvbW1hbmQsIGlkKTtcbiAgfVxuICByZXR1cm4gc3F1YXJlICE9PSBTcXVhcmVUeXBlLldBTEwgJiZcbiAgICAgICAgc3F1YXJlICE9PSBTcXVhcmVUeXBlLk9CU1RBQ0xFICYmXG4gICAgICAgIHNxdWFyZSAhPT0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBBdHRlbXB0IHRvIG1vdmUgcGVnbWFuIGZvcndhcmQgb3IgYmFja3dhcmQuXG4gKiBAcGFyYW0ge251bWJlcn0gZGlyZWN0aW9uIERpcmVjdGlvbiB0byBtb3ZlICgwID0gZm9yd2FyZCwgMiA9IGJhY2t3YXJkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBJRCBvZiBibG9jayB0aGF0IHRyaWdnZXJlZCB0aGlzIGFjdGlvbi5cbiAqIEB0aHJvd3Mge3RydWV9IElmIHRoZSBlbmQgb2YgdGhlIG1hemUgaXMgcmVhY2hlZC5cbiAqIEB0aHJvd3Mge2ZhbHNlfSBJZiBQZWdtYW4gY29sbGlkZXMgd2l0aCBhIHdhbGwuXG4gKi9cbnZhciBtb3ZlID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBpZCkge1xuICBpZiAoIWlzUGF0aChkaXJlY3Rpb24sIG51bGwpKSB7XG4gICAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdmYWlsXycgKyAoZGlyZWN0aW9uID8gJ2JhY2t3YXJkJyA6ICdmb3J3YXJkJyksIGlkKTtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKGZhbHNlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgbW92aW5nIGJhY2t3YXJkLCBmbGlwIHRoZSBlZmZlY3RpdmUgZGlyZWN0aW9uLlxuICB2YXIgZWZmZWN0aXZlRGlyZWN0aW9uID0gTWF6ZS5wZWdtYW5EICsgZGlyZWN0aW9uO1xuICB2YXIgY29tbWFuZDtcbiAgc3dpdGNoICh0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGVmZmVjdGl2ZURpcmVjdGlvbikpIHtcbiAgICBjYXNlIERpcmVjdGlvbi5OT1JUSDpcbiAgICAgIE1hemUucGVnbWFuWS0tO1xuICAgICAgY29tbWFuZCA9ICdub3J0aCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIERpcmVjdGlvbi5FQVNUOlxuICAgICAgTWF6ZS5wZWdtYW5YKys7XG4gICAgICBjb21tYW5kID0gJ2Vhc3QnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uU09VVEg6XG4gICAgICBNYXplLnBlZ21hblkrKztcbiAgICAgIGNvbW1hbmQgPSAnc291dGgnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBEaXJlY3Rpb24uV0VTVDpcbiAgICAgIE1hemUucGVnbWFuWC0tO1xuICAgICAgY29tbWFuZCA9ICd3ZXN0JztcbiAgICAgIGJyZWFrO1xuICB9XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihjb21tYW5kLCBpZCk7XG4gIGlmIChNYXplLndvcmRTZWFyY2gpIHtcbiAgICBNYXplLndvcmRTZWFyY2gubWFya1RpbGVWaXNpdGVkKE1hemUucGVnbWFuWSwgTWF6ZS5wZWdtYW5YLCBmYWxzZSk7XG4gICAgLy8gd29yZHNlYXJjaCBkb2VzbnQgY2hlY2sgZm9yIHN1Y2Nlc3MgdW50aWwgaXQgaGFzIGZpbmlzaGVkIHJ1bm5pbmcgY29tcGxldGVseVxuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmIChNYXplLmhhc011bHRpcGxlUG9zc2libGVHcmlkcygpKSB7XG4gICAgLy8gbmVpdGhlciBkbyBxdWFudHVtIG1hcHNcbiAgICByZXR1cm47XG4gIH1cbiAgTWF6ZS5jaGVja1N1Y2Nlc3MoKTtcbn07XG5cbi8qKlxuICogVHVybiBwZWdtYW4gbGVmdCBvciByaWdodC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXJlY3Rpb24gRGlyZWN0aW9uIHRvIHR1cm4gKDAgPSBsZWZ0LCAxID0gcmlnaHQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIElEIG9mIGJsb2NrIHRoYXQgdHJpZ2dlcmVkIHRoaXMgYWN0aW9uLlxuICovXG52YXIgdHVybiA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgaWQpIHtcbiAgaWYgKGRpcmVjdGlvbiA9PSBUdXJuRGlyZWN0aW9uLlJJR0hUKSB7XG4gICAgLy8gUmlnaHQgdHVybiAoY2xvY2t3aXNlKS5cbiAgICBNYXplLnBlZ21hbkQgKz0gVHVybkRpcmVjdGlvbi5SSUdIVDtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ3JpZ2h0JywgaWQpO1xuICB9IGVsc2Uge1xuICAgIC8vIExlZnQgdHVybiAoY291bnRlcmNsb2Nrd2lzZSkuXG4gICAgTWF6ZS5wZWdtYW5EICs9IFR1cm5EaXJlY3Rpb24uTEVGVDtcbiAgICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ2xlZnQnLCBpZCk7XG4gIH1cbiAgTWF6ZS5wZWdtYW5EID0gdGlsZXMuY29uc3RyYWluRGlyZWN0aW9uNChNYXplLnBlZ21hbkQpO1xufTtcblxuLyoqXG4gKiBUdXJuIHBlZ21hbiB0b3dhcmRzIGEgZ2l2ZW4gZGlyZWN0aW9uLCB0dXJuaW5nIHRocm91Z2ggc3RhZ2UgZnJvbnQgKHNvdXRoKVxuICogd2hlbiBwb3NzaWJsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZXdEaXJlY3Rpb24gRGlyZWN0aW9uIHRvIHR1cm4gdG8gKGUuZy4sIERpcmVjdGlvbi5OT1JUSClcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBJRCBvZiBibG9jayB0aGF0IHRyaWdnZXJlZCB0aGlzIGFjdGlvbi5cbiAqL1xudmFyIHR1cm5UbyA9IGZ1bmN0aW9uKG5ld0RpcmVjdGlvbiwgaWQpIHtcbiAgdmFyIGN1cnJlbnREaXJlY3Rpb24gPSBNYXplLnBlZ21hbkQ7XG4gIGlmIChpc1R1cm5Bcm91bmQoY3VycmVudERpcmVjdGlvbiwgbmV3RGlyZWN0aW9uKSkge1xuICAgIHZhciBzaG91bGRUdXJuQ1dUb1ByZWZlclN0YWdlRnJvbnQgPSBjdXJyZW50RGlyZWN0aW9uIC0gbmV3RGlyZWN0aW9uIDwgMDtcbiAgICB2YXIgcmVsYXRpdmVUdXJuRGlyZWN0aW9uID0gc2hvdWxkVHVybkNXVG9QcmVmZXJTdGFnZUZyb250ID8gVHVybkRpcmVjdGlvbi5SSUdIVCA6IFR1cm5EaXJlY3Rpb24uTEVGVDtcbiAgICB0dXJuKHJlbGF0aXZlVHVybkRpcmVjdGlvbiwgaWQpO1xuICAgIHR1cm4ocmVsYXRpdmVUdXJuRGlyZWN0aW9uLCBpZCk7XG4gIH0gZWxzZSBpZiAoaXNSaWdodFR1cm4oY3VycmVudERpcmVjdGlvbiwgbmV3RGlyZWN0aW9uKSkge1xuICAgIHR1cm4oVHVybkRpcmVjdGlvbi5SSUdIVCwgaWQpO1xuICB9IGVsc2UgaWYgKGlzTGVmdFR1cm4oY3VycmVudERpcmVjdGlvbiwgbmV3RGlyZWN0aW9uKSkge1xuICAgIHR1cm4oVHVybkRpcmVjdGlvbi5MRUZULCBpZCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGlzTGVmdFR1cm4oZGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pIHtcbiAgcmV0dXJuIG5ld0RpcmVjdGlvbiA9PT0gdGlsZXMuY29uc3RyYWluRGlyZWN0aW9uNChkaXJlY3Rpb24gKyBUdXJuRGlyZWN0aW9uLkxFRlQpO1xufVxuXG5mdW5jdGlvbiBpc1JpZ2h0VHVybihkaXJlY3Rpb24sIG5ld0RpcmVjdGlvbikge1xuICByZXR1cm4gbmV3RGlyZWN0aW9uID09PSB0aWxlcy5jb25zdHJhaW5EaXJlY3Rpb240KGRpcmVjdGlvbiArIFR1cm5EaXJlY3Rpb24uUklHSFQpO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0dXJuaW5nIGZyb20gZGlyZWN0aW9uIHRvIG5ld0RpcmVjdGlvbiB3b3VsZCBiZSBhIDE4MMKwIHR1cm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZXdEaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1R1cm5Bcm91bmQoZGlyZWN0aW9uLCBuZXdEaXJlY3Rpb24pIHtcbiAgcmV0dXJuIE1hdGguYWJzKGRpcmVjdGlvbiAtIG5ld0RpcmVjdGlvbikgPT0gTW92ZURpcmVjdGlvbi5CQUNLV0FSRDtcbn1cblxuZnVuY3Rpb24gbW92ZUFic29sdXRlRGlyZWN0aW9uKGRpcmVjdGlvbiwgaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLmNvbGxlY3RBY3Rpb25zKCk7XG4gIHR1cm5UbyhkaXJlY3Rpb24sIGlkKTtcbiAgbW92ZShNb3ZlRGlyZWN0aW9uLkZPUldBUkQsIGlkKTtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnN0b3BDb2xsZWN0aW5nKCk7XG59XG5cbmV4cG9ydHMubW92ZUZvcndhcmQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgbW92ZShNb3ZlRGlyZWN0aW9uLkZPUldBUkQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVCYWNrd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlKE1vdmVEaXJlY3Rpb24uQkFDS1dBUkQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLm1vdmVOb3J0aCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLk5PUlRILCBpZCk7XG59KTtcblxuZXhwb3J0cy5tb3ZlU291dGggPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgbW92ZUFic29sdXRlRGlyZWN0aW9uKERpcmVjdGlvbi5TT1VUSCwgaWQpO1xufSk7XG5cbmV4cG9ydHMubW92ZUVhc3QgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgbW92ZUFic29sdXRlRGlyZWN0aW9uKERpcmVjdGlvbi5FQVNULCBpZCk7XG59KTtcblxuZXhwb3J0cy5tb3ZlV2VzdCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBtb3ZlQWJzb2x1dGVEaXJlY3Rpb24oRGlyZWN0aW9uLldFU1QsIGlkKTtcbn0pO1xuXG5leHBvcnRzLnR1cm5MZWZ0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHR1cm4oVHVybkRpcmVjdGlvbi5MRUZULCBpZCk7XG59KTtcblxuZXhwb3J0cy50dXJuUmlnaHQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdHVybihUdXJuRGlyZWN0aW9uLlJJR0hULCBpZCk7XG59KTtcblxuZXhwb3J0cy5pc1BhdGhGb3J3YXJkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBpc1BhdGgoTW92ZURpcmVjdGlvbi5GT1JXQVJELCBpZCk7XG59KTtcbmV4cG9ydHMubm9QYXRoRm9yd2FyZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICByZXR1cm4gIWlzUGF0aChNb3ZlRGlyZWN0aW9uLkZPUldBUkQsIGlkKTtcbn0pO1xuXG5leHBvcnRzLmlzUGF0aFJpZ2h0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBpc1BhdGgoTW92ZURpcmVjdGlvbi5SSUdIVCwgaWQpO1xufSk7XG5cbmV4cG9ydHMuaXNQYXRoQmFja3dhcmQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGlzUGF0aChNb3ZlRGlyZWN0aW9uLkJBQ0tXQVJELCBpZCk7XG59KTtcblxuZXhwb3J0cy5pc1BhdGhMZWZ0ID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiBpc1BhdGgoTW92ZURpcmVjdGlvbi5MRUZULCBpZCk7XG59KTtcblxuZXhwb3J0cy5waWxlUHJlc2VudCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICB2YXIgeCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHkgPSBNYXplLnBlZ21hblk7XG4gIHJldHVybiBNYXplLm1hcC5pc0RpcnQoeSwgeCkgJiYgTWF6ZS5tYXAuZ2V0VmFsdWUoeSwgeCkgPiAwO1xufSk7XG5cbmV4cG9ydHMuaG9sZVByZXNlbnQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIHggPSBNYXplLnBlZ21hblg7XG4gIHZhciB5ID0gTWF6ZS5wZWdtYW5ZO1xuICByZXR1cm4gTWF6ZS5tYXAuaXNEaXJ0KHksIHgpICYmIE1hemUubWFwLmdldFZhbHVlKHksIHgpIDwgMDtcbn0pO1xuXG5leHBvcnRzLmN1cnJlbnRQb3NpdGlvbk5vdENsZWFyID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgcmV0dXJuIE1hemUubWFwLmlzRGlydCh5LCB4KSAmJiBNYXplLm1hcC5nZXRWYWx1ZSh5LCB4KSAhPT0gMDtcbn0pO1xuXG5leHBvcnRzLmZpbGwgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdwdXRkb3duJywgaWQpO1xuICB2YXIgeCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHkgPSBNYXplLnBlZ21hblk7XG4gIE1hemUubWFwLnNldFZhbHVlKHksIHgsIE1hemUubWFwLmdldFZhbHVlKHksIHgpICsgMSk7XG59KTtcblxuZXhwb3J0cy5kaWcgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdwaWNrdXAnLCBpZCk7XG4gIHZhciB4ID0gTWF6ZS5wZWdtYW5YO1xuICB2YXIgeSA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5tYXAuc2V0VmFsdWUoeSwgeCwgTWF6ZS5tYXAuZ2V0VmFsdWUoeSwgeCkgLSAxKTtcbn0pO1xuXG5leHBvcnRzLm5vdEZpbmlzaGVkID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIU1hemUuY2hlY2tTdWNjZXNzKCk7XG59KTtcblxuLy8gVGhlIGNvZGUgZm9yIHRoaXMgQVBJIHNob3VsZCBnZXQgc3RyaXBwZWQgd2hlbiBzaG93aW5nIGNvZGVcbmV4cG9ydHMubG9vcEhpZ2hsaWdodCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbiAoaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKCdudWxsJywgaWQpO1xufSk7XG5cblxuXG4vKipcbiAqIEJlZSByZWxhdGVkIEFQSSBmdW5jdGlvbnMuIElmIGJldHRlciBtb2R1bGFyaXplZCwgd2UgY291bGQgcG90ZW50aWFsbHlcbiAqIHNlcGFyYXRlIHRoZXNlIG91dCwgYnV0IGFzIHRoaW5ncyBzdGFuZCByaWdodCBub3cgdGhleSB3aWxsIGJlIGxvYWRlZFxuICogd2hldGhlciBvciBub3Qgd2UncmUgYSBCZWUgbGV2ZWxcbiAqL1xuZXhwb3J0cy5nZXROZWN0YXIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgTWF6ZS5iZWUuZ2V0TmVjdGFyKGlkKTtcbn0pO1xuXG5leHBvcnRzLm1ha2VIb25leSA9IEFQSV9GVU5DVElPTihmdW5jdGlvbihpZCkge1xuICBNYXplLmJlZS5tYWtlSG9uZXkoaWQpO1xufSk7XG5cbmV4cG9ydHMuYXRGbG93ZXIgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24oaWQpIHtcbiAgdmFyIGNvbCA9IE1hemUucGVnbWFuWDtcbiAgdmFyIHJvdyA9IE1hemUucGVnbWFuWTtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwiYXRfZmxvd2VyXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLmlzRmxvd2VyKHJvdywgY29sLCB0cnVlKTtcbn0pO1xuXG5leHBvcnRzLmF0SG9uZXljb21iID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uKGlkKSB7XG4gIHZhciBjb2wgPSBNYXplLnBlZ21hblg7XG4gIHZhciByb3cgPSBNYXplLnBlZ21hblk7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcImF0X2hvbmV5Y29tYlwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5pc0hpdmUocm93LCBjb2wsIHRydWUpO1xufSk7XG5cbmV4cG9ydHMubmVjdGFyUmVtYWluaW5nID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJuZWN0YXJfcmVtYWluaW5nXCIsIGlkKTtcbiAgcmV0dXJuIE1hemUuYmVlLm5lY3RhclJlbWFpbmluZyh0cnVlKTtcbn0pO1xuXG5leHBvcnRzLmhvbmV5QXZhaWxhYmxlID0gQVBJX0ZVTkNUSU9OKGZ1bmN0aW9uIChpZCkge1xuICBNYXplLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oXCJob25leV9hdmFpbGFibGVcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUuaG9uZXlBdmFpbGFibGUoKTtcbn0pO1xuXG5leHBvcnRzLm5lY3RhckNvbGxlY3RlZCA9IEFQSV9GVU5DVElPTihmdW5jdGlvbiAoaWQpIHtcbiAgTWF6ZS5leGVjdXRpb25JbmZvLnF1ZXVlQWN0aW9uKFwibmVjdGFyX2NvbGxlY3RlZFwiLCBpZCk7XG4gIHJldHVybiBNYXplLmJlZS5uZWN0YXJzXy5sZW5ndGg7XG59KTtcblxuZXhwb3J0cy5ob25leUNyZWF0ZWQgPSBBUElfRlVOQ1RJT04oZnVuY3Rpb24gKGlkKSB7XG4gIE1hemUuZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbihcImhvbmV5X2NyZWF0ZWRcIiwgaWQpO1xuICByZXR1cm4gTWF6ZS5iZWUuaG9uZXlfO1xufSk7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIG1hemVNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIEJlZUNlbGwgPSByZXF1aXJlKCcuL2JlZUNlbGwnKTtcbnZhciBUZXN0UmVzdWx0cyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy5qcycpLlRlc3RSZXN1bHRzO1xudmFyIFRlcm1pbmF0aW9uVmFsdWUgPSByZXF1aXJlKCcuLi9jb25zdGFudHMuanMnKS5CZWVUZXJtaW5hdGlvblZhbHVlO1xuXG52YXIgVU5MSU1JVEVEX0hPTkVZID0gLTk5O1xudmFyIFVOTElNSVRFRF9ORUNUQVIgPSA5OTtcblxudmFyIEVNUFRZX0hPTkVZID0gLTk4OyAvLyBIaXZlIHdpdGggMCBob25leVxudmFyIEVNUFRZX05FQ1RBUiA9IDk4OyAvLyBmbG93ZXIgd2l0aCAwIGhvbmV5XG5cbnZhciBCZWUgPSBmdW5jdGlvbiAobWF6ZSwgc3R1ZGlvQXBwLCBjb25maWcpIHtcbiAgdGhpcy5tYXplXyA9IG1hemU7XG4gIHRoaXMuc3R1ZGlvQXBwXyA9IHN0dWRpb0FwcDtcbiAgdGhpcy5za2luXyA9IGNvbmZpZy5za2luO1xuICB0aGlzLmRlZmF1bHRGbG93ZXJDb2xvcl8gPSAoY29uZmlnLmxldmVsLmZsb3dlclR5cGUgPT09ICdyZWRXaXRoTmVjdGFyJyA/XG4gICAgJ3JlZCcgOiAncHVycGxlJyk7XG4gIGlmICh0aGlzLmRlZmF1bHRGbG93ZXJDb2xvcl8gPT09ICdwdXJwbGUnICYmXG4gICAgY29uZmlnLmxldmVsLmZsb3dlclR5cGUgIT09ICdwdXJwbGVOZWN0YXJIaWRkZW4nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgZmxvd2VyVHlwZSBmb3IgQmVlOiAnICsgY29uZmlnLmxldmVsLmZsb3dlclR5cGUpO1xuICB9XG5cbiAgdGhpcy5uZWN0YXJHb2FsXyA9IGNvbmZpZy5sZXZlbC5uZWN0YXJHb2FsIHx8IDA7XG4gIHRoaXMuaG9uZXlHb2FsXyA9IGNvbmZpZy5sZXZlbC5ob25leUdvYWwgfHwgMDtcblxuICAvLyBhdCBlYWNoIGxvY2F0aW9uLCB0cmFja3Mgd2hldGhlciB1c2VyIGNoZWNrZWQgdG8gc2VlIGlmIGl0IHdhcyBhIGZsb3dlciBvclxuICAvLyBob25leWNvbWIgdXNpbmcgYW4gaWYgYmxvY2tcbiAgdGhpcy51c2VyQ2hlY2tzXyA9IFtdO1xuXG4gIC8vIEluaXRpYWxpemUgdGhlIG1hcCBncmlkXG4gIC8vXG4gIC8vIFwic2VyaWFsaXplZE1hemVcIiBpcyB0aGUgbmV3IHdheSBvZiBzdG9yaW5nIG1hcHM7IGl0J3MgYSBKU09OIGFycmF5XG4gIC8vIGNvbnRhaW5pbmcgY29tcGxleCBtYXAgZGF0YS5cbiAgLy9cbiAgLy8gXCJtYXBcIiBwbHVzIG9wdGlvbmFsbHkgXCJsZXZlbERpcnRcIiBpcyB0aGUgb2xkIHdheSBvZiBzdG9yaW5nIG1hcHM7XG4gIC8vIHRoZXkgYXJlIGVhY2ggYXJyYXlzIG9mIGEgY29tYmluYXRpb24gb2Ygc3RyaW5ncyBhbmQgaW50cyB3aXRoXG4gIC8vIHRoZWlyIG93biBjb21wbGV4IHN5bnRheC4gVGhpcyB3YXkgaXMgZGVwcmVjYXRlZCBmb3IgbmV3IGxldmVscyxcbiAgLy8gYW5kIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBmb3Igbm90LXlldC11cGRhdGVkXG4gIC8vIGxldmVscy5cbiAgLy9cbiAgLy8gRWl0aGVyIHdheSwgd2UgdHVybiB3aGF0IHdlIGhhdmUgaW50byBhIGdyaWQgb2YgQmVlQ2VsbHMsIGFueSBvbmVcbiAgLy8gb2Ygd2hpY2ggbWF5IHJlcHJlc2VudCBhIG51bWJlciBvZiBwb3NzaWJsZSBcInN0YXRpY1wiIGNlbGxzLiBXZSB0aGVuXG4gIC8vIHR1cm4gdGhhdCB2YXJpYWJsZSBncmlkIG9mIEJlZUNlbGxzIGludG8gYSBzZXQgb2Ygc3RhdGljIGdyaWRzLlxuICB0aGlzLnZhcmlhYmxlR3JpZCA9IHVuZGVmaW5lZDtcbiAgaWYgKGNvbmZpZy5sZXZlbC5zZXJpYWxpemVkTWF6ZSkge1xuICAgIHRoaXMudmFyaWFibGVHcmlkID0gY29uZmlnLmxldmVsLnNlcmlhbGl6ZWRNYXplLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgICByZXR1cm4gcm93Lm1hcChCZWVDZWxsLmRlc2VyaWFsaXplKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnZhcmlhYmxlR3JpZCA9IGNvbmZpZy5sZXZlbC5tYXAubWFwKGZ1bmN0aW9uIChyb3csIHgpIHtcbiAgICAgIHJldHVybiByb3cubWFwKGZ1bmN0aW9uIChtYXBDZWxsLCB5KSB7XG4gICAgICAgIHZhciBpbml0aWFsRGlydENlbGwgPSBjb25maWcubGV2ZWwuaW5pdGlhbERpcnRbeF1beV07XG4gICAgICAgIHJldHVybiBCZWVDZWxsLnBhcnNlRnJvbU9sZFZhbHVlcyhtYXBDZWxsLCBpbml0aWFsRGlydENlbGwpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgdGhpcy5zdGF0aWNHcmlkcyA9IEJlZS5nZXRBbGxTdGF0aWNHcmlkcyh0aGlzLnZhcmlhYmxlR3JpZCk7XG5cbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZElkID0gMDtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZCA9IHRoaXMuc3RhdGljR3JpZHNbMF07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJlZTtcblxuLyoqXG4gKiBDbG9uZXMgdGhlIGdpdmVuIGdyaWQgb2YgQmVlQ2VsbHMgYnkgY2FsbGluZyBCZWVDZWxsLmNsb25lXG4gKiBAcGFyYW0ge0JlZUNlbGxbXVtdfSBncmlkXG4gKiBAcmV0dXJuIHtCZWVDZWxsW11bXX0gZ3JpZFxuICovXG5CZWUuY2xvbmVHcmlkID0gZnVuY3Rpb24gKGdyaWQpIHtcbiAgcmV0dXJuIGdyaWQubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgcmV0dXJuIGNlbGwuY2xvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgc2luZ2xlIGdyaWQgb2YgQmVlQ2VsbHMsIHNvbWUgb2Ygd2hpY2ggbWF5IGJlIFwidmFyaWFibGVcIlxuICogY2VsbHMsIHJldHVybiBhIGxpc3Qgb2YgZ3JpZHMgb2Ygbm9uLXZhcmlhYmxlIEJlZUNlbGxzIHJlcHJlc2VudGluZ1xuICogYWxsIHBvc3NpYmxlIHZhcmlhYmxlIGNvbWJpbmF0aW9ucy5cbiAqIEBwYXJhbSB7QmVlQ2VsbFtdW119IHZhcmlhYmxlR3JpZFxuICogQHJldHVybiB7QmVlQ2VsbFtdW11bXX0gZ3JpZHNcbiAqL1xuQmVlLmdldEFsbFN0YXRpY0dyaWRzID0gZnVuY3Rpb24gKHZhcmlhYmxlR3JpZCkge1xuICB2YXIgZ3JpZHMgPSBbIHZhcmlhYmxlR3JpZCBdO1xuICB2YXJpYWJsZUdyaWQuZm9yRWFjaChmdW5jdGlvbiAocm93LCB4KSB7XG4gICAgcm93LmZvckVhY2goZnVuY3Rpb24gKGNlbGwsIHkpIHtcbiAgICAgIGlmIChjZWxsLmlzVmFyaWFibGVDbG91ZCgpIHx8IGNlbGwuaXNWYXJpYWJsZVJhbmdlKCkpIHtcbiAgICAgICAgdmFyIHBvc3NpYmxlQXNzZXRzID0gY2VsbC5nZXRQb3NzaWJsZUdyaWRBc3NldHMoKTtcbiAgICAgICAgdmFyIG5ld0dyaWRzID0gW107XG4gICAgICAgIHBvc3NpYmxlQXNzZXRzLmZvckVhY2goZnVuY3Rpb24oYXNzZXQpIHtcbiAgICAgICAgICBncmlkcy5mb3JFYWNoKGZ1bmN0aW9uKGdyaWQpIHtcbiAgICAgICAgICAgIHZhciBuZXdNYXAgPSBCZWUuY2xvbmVHcmlkKGdyaWQpO1xuICAgICAgICAgICAgbmV3TWFwW3hdW3ldID0gYXNzZXQ7XG4gICAgICAgICAgICBuZXdHcmlkcy5wdXNoKG5ld01hcCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBncmlkcyA9IG5ld0dyaWRzO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdyaWRzO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5CZWUucHJvdG90eXBlLmhhc011bHRpcGxlUG9zc2libGVHcmlkcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc3RhdGljR3JpZHMubGVuZ3RoID4gMTtcbn07XG5cbi8qKlxuICogU2ltcGxlIHBhc3N0aHJvdWdoIHRoYXQgY2FsbHMgcmVzZXRDdXJybnRWYWx1ZSBmb3IgZXZlcnkgQmVlQ2VsbCBpblxuICogdGhpcy5jdXJyZW50U3RhdGljR3JpZFxuICovXG5CZWUucHJvdG90eXBlLnJlc2V0Q3VycmVudFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZC5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbiAgICByb3cuZm9yRWFjaChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgY2VsbC5yZXNldEN1cnJlbnRWYWx1ZSgpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVzZXRzIGN1cnJlbnQgc3RhdGUsIGZvciBlYXN5IHJlZXhlY3V0aW9uIG9mIHRlc3RzXG4gKi9cbkJlZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuaG9uZXlfID0gMDtcbiAgLy8gbGlzdCBvZiB0aGUgbG9jYXRpb25zIHdlJ3ZlIGdyYWJiZWQgbmVjdGFyIGZyb21cbiAgdGhpcy5uZWN0YXJzXyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY3VycmVudFN0YXRpY0dyaWQubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnVzZXJDaGVja3NfW2ldID0gW107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aGlzLnVzZXJDaGVja3NfW2ldW2pdID0ge1xuICAgICAgICBjaGVja2VkRm9yRmxvd2VyOiBmYWxzZSxcbiAgICAgICAgY2hlY2tlZEZvckhpdmU6IGZhbHNlLFxuICAgICAgICBjaGVja2VkRm9yTmVjdGFyOiBmYWxzZVxuICAgICAgfTtcbiAgICB9XG4gIH1cbiAgaWYgKHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIpIHtcbiAgICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZU5lY3RhckNvdW50ZXIodGhpcy5uZWN0YXJzXyk7XG4gICAgdGhpcy5tYXplXy5ncmlkSXRlbURyYXdlci51cGRhdGVIb25leUNvdW50ZXIodGhpcy5ob25leV8pO1xuICB9XG4gIHRoaXMucmVzZXRDdXJyZW50VmFsdWVzKCk7XG59O1xuXG4vKipcbiAqIEFzc2lnbnMgdGhpcy5jdXJyZW50U3RhdGljR3JpZCB0byB0aGUgYXBwcm9wcmlhdGUgZ3JpZCBhbmQgcmVzZXRzIGFsbFxuICogY3VycmVudCB2YWx1ZXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICovXG5CZWUucHJvdG90eXBlLnVzZUdyaWRXaXRoSWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdGhpcy5jdXJyZW50U3RhdGljR3JpZElkID0gaWQ7XG4gIHRoaXMuY3VycmVudFN0YXRpY0dyaWQgPSB0aGlzLnN0YXRpY0dyaWRzW2lkXTtcbiAgdGhpcy5yZXNldEN1cnJlbnRWYWx1ZXMoKTtcbiAgdGhpcy5yZXNldCgpO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge051bWJlcn0gcm93XG4gKiBAcGFyYW0ge051bWJlcn0gY29sXG4gKiBAcmV0dXJucyB7TnVtYmVyfSB2YWxcbiAqL1xuQmVlLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uZ2V0Q3VycmVudFZhbHVlKCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2xcbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWxcbiAqL1xuQmVlLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdmFsKSB7XG4gIHRoaXMuY3VycmVudFN0YXRpY0dyaWRbcm93XVtjb2xdLnNldEN1cnJlbnRWYWx1ZSh2YWwpO1xufTtcblxuLyoqXG4gKiBEaWQgd2UgcmVhY2ggb3VyIHRvdGFsIG5lY3Rhci9ob25leSBnb2Fscz9cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZS5wcm90b3R5cGUuZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIG5lY3Rhci9ob25leSBnb2Fsc1xuICBpZiAodGhpcy5ob25leV8gPCB0aGlzLmhvbmV5R29hbF8gfHwgdGhpcy5uZWN0YXJzXy5sZW5ndGggPCB0aGlzLm5lY3RhckdvYWxfKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF0aGlzLmNoZWNrZWRBbGxDbG91ZGVkKCkgfHwgIXRoaXMuY2hlY2tlZEFsbFB1cnBsZSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF0aGlzLmNvbGxlY3RlZEV2ZXJ5dGhpbmcoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5CZWUucHJvdG90eXBlLmNvbGxlY3RlZEV2ZXJ5dGhpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHF1YW50dW0gbWFwcyBpbXBsaWNpdHkgcmVxdWlyZSBcImNvbGxlY3QgZXZlcnl0aGluZ1wiLCBub24tcXVhbnR1bVxuICAvLyBtYXBzIGRvbid0IHJlYWxseSBjYXJlXG4gIGlmICghdGhpcy5oYXNNdWx0aXBsZVBvc3NpYmxlR3JpZHMoKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIG1pc3NlZFNvbWV0aGluZyA9IHRoaXMuY3VycmVudFN0YXRpY0dyaWQuc29tZShmdW5jdGlvbiAocm93KSB7XG4gICAgcmV0dXJuIHJvdy5zb21lKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICByZXR1cm4gY2VsbC5pc0RpcnQoKSAmJiBjZWxsLmdldEN1cnJlbnRWYWx1ZSgpID4gMDtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuICFtaXNzZWRTb21ldGhpbmc7XG59O1xuXG4vKipcbiAqIENhbGxlZCBhZnRlciB1c2VyJ3MgY29kZSBoYXMgZmluaXNoZWQgZXhlY3V0aW5nLiBHaXZlcyB1cyBhIGNoYW5jZSB0b1xuICogdGVybWluYXRlIHdpdGggYXBwLXNwZWNpZmljIHZhbHVlcywgc3VjaCBhcyB1bmNoZWNrZWQgY2xvdWQvcHVycGxlIGZsb3dlcnMuXG4gKi9cbkJlZS5wcm90b3R5cGUub25FeGVjdXRpb25GaW5pc2ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBleGVjdXRpb25JbmZvID0gdGhpcy5tYXplXy5leGVjdXRpb25JbmZvO1xuICBpZiAoZXhlY3V0aW9uSW5mby5pc1Rlcm1pbmF0ZWQoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5maW5pc2hlZCgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gd2UgZGlkbid0IGZpbmlzaC4gbG9vayB0byBzZWUgaWYgd2UgbmVlZCB0byBnaXZlIGFuIGFwcCBzcGVjaWZpYyBlcnJvclxuICBpZiAodGhpcy5uZWN0YXJzXy5sZW5ndGggPCB0aGlzLm5lY3RhckdvYWxfKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5JTlNVRkZJQ0lFTlRfTkVDVEFSKTtcbiAgfSBlbHNlIGlmICh0aGlzLmhvbmV5XyA8IHRoaXMuaG9uZXlHb2FsXykge1xuICAgIGV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX0hPTkVZKTtcbiAgfSBlbHNlIGlmICghdGhpcy5jaGVja2VkQWxsQ2xvdWRlZCgpKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5VTkNIRUNLRURfQ0xPVUQpO1xuICB9IGVsc2UgaWYgKCF0aGlzLmNoZWNrZWRBbGxQdXJwbGUoKSkge1xuICAgIGV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX1BVUlBMRSk7XG4gIH0gZWxzZSBpZiAoIXRoaXMuY29sbGVjdGVkRXZlcnl0aGluZygpKSB7XG4gICAgZXhlY3V0aW9uSW5mby50ZXJtaW5hdGVXaXRoVmFsdWUoVGVybWluYXRpb25WYWx1ZS5ESURfTk9UX0NPTExFQ1RfRVZFUllUSElORyk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlkIHdlIGNoZWNrIGV2ZXJ5IGZsb3dlci9ob25leSB0aGF0IHdhcyBjb3ZlcmVkIGJ5IGEgY2xvdWQ/XG4gKi9cbkJlZS5wcm90b3R5cGUuY2hlY2tlZEFsbENsb3VkZWQgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHRoaXMuY3VycmVudFN0YXRpY0dyaWQubGVuZ3RoOyByb3crKykge1xuICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IHRoaXMuY3VycmVudFN0YXRpY0dyaWRbcm93XS5sZW5ndGg7IGNvbCsrKSB7XG4gICAgICBpZiAodGhpcy5zaG91bGRDaGVja0Nsb3VkKHJvdywgY29sKSAmJiAhdGhpcy5jaGVja2VkQ2xvdWQocm93LCBjb2wpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIERpZCB3ZSBjaGVjayBldmVyeSBwdXJwbGUgZmxvd2VyXG4gKi9cbkJlZS5wcm90b3R5cGUuY2hlY2tlZEFsbFB1cnBsZSA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5jdXJyZW50U3RhdGljR3JpZC5sZW5ndGg7IHJvdysrKSB7XG4gICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddLmxlbmd0aDsgY29sKyspIHtcbiAgICAgIGlmICh0aGlzLnNob3VsZENoZWNrUHVycGxlKHJvdywgY29sKSAmJiAhdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvck5lY3Rhcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHRlc3QgcmVzdWx0cyBiYXNlZCBvbiB0aGUgdGVybWluYXRpb24gdmFsdWUuICBJZiB0aGVyZSBpc1xuICogbm8gYXBwLXNwZWNpZmljIGZhaWx1cmUsIHRoaXMgcmV0dXJucyBTdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMoKS5cbiAqL1xuQmVlLnByb3RvdHlwZS5nZXRUZXN0UmVzdWx0cyA9IGZ1bmN0aW9uICh0ZXJtaW5hdGlvblZhbHVlKSB7XG4gIHN3aXRjaCAodGVybWluYXRpb25WYWx1ZSkge1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5OT1RfQVRfRkxPV0VSOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5GTE9XRVJfRU1QVFk6XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9IT05FWUNPTUI6XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkhPTkVZQ09NQl9GVUxMOlxuICAgICAgcmV0dXJuIFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuXG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLlVOQ0hFQ0tFRF9DTE9VRDpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX1BVUlBMRTpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX05FQ1RBUjpcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX0hPTkVZOlxuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5ESURfTk9UX0NPTExFQ1RfRVZFUllUSElORzpcbiAgICAgIHZhciB0ZXN0UmVzdWx0cyA9IHRoaXMuc3R1ZGlvQXBwXy5nZXRUZXN0UmVzdWx0cyh0cnVlKTtcbiAgICAgIC8vIElmIHdlIGhhdmUgYSBub24tYXBwIHNwZWNpZmljIGZhaWx1cmUsIHdlIHdhbnQgdGhhdCB0byB0YWtlIHByZWNlZGVuY2UuXG4gICAgICAvLyBWYWx1ZXMgb3ZlciBUT09fTUFOWV9CTE9DS1NfRkFJTCBhcmUgbm90IHRydWUgZmFpbHVyZXMsIGJ1dCBpbmRpY2F0ZVxuICAgICAgLy8gYSBzdWJvcHRpbWFsIHNvbHV0aW9uLCBzbyBpbiB0aG9zZSBjYXNlcyB3ZSB3YW50IHRvIHJldHVybiBvdXJcbiAgICAgIC8vIGFwcCBzcGVjaWZpYyBmYWlsXG4gICAgICBpZiAodGVzdFJlc3VsdHMgPj0gVGVzdFJlc3VsdHMuVE9PX01BTllfQkxPQ0tTX0ZBSUwpIHtcbiAgICAgICAgdGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZXN0UmVzdWx0cztcbiAgfVxuXG4gIHJldHVybiB0aGlzLnN0dWRpb0FwcF8uZ2V0VGVzdFJlc3VsdHMoZmFsc2UpO1xufTtcblxuLyoqXG4gKiBHZXQgYW55IGFwcC1zcGVjaWZpYyBtZXNzYWdlLCBiYXNlZCBvbiB0aGUgdGVybWluYXRpb24gdmFsdWUsXG4gKiBvciByZXR1cm4gbnVsbCBpZiBub25lIGFwcGxpZXMuXG4gKi9cbkJlZS5wcm90b3R5cGUuZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uICh0ZXJtaW5hdGlvblZhbHVlKSB7XG4gIHN3aXRjaCAodGVybWluYXRpb25WYWx1ZSkge1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5OT1RfQVRfRkxPV0VSOlxuICAgICAgcmV0dXJuIG1hemVNc2cubm90QXRGbG93ZXJFcnJvcigpO1xuICAgIGNhc2UgVGVybWluYXRpb25WYWx1ZS5GTE9XRVJfRU1QVFk6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5mbG93ZXJFbXB0eUVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLk5PVF9BVF9IT05FWUNPTUI6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5ub3RBdEhvbmV5Y29tYkVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLkhPTkVZQ09NQl9GVUxMOlxuICAgICAgcmV0dXJuIG1hemVNc2cuaG9uZXljb21iRnVsbEVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLlVOQ0hFQ0tFRF9DTE9VRDpcbiAgICAgIHJldHVybiBtYXplTXNnLnVuY2hlY2tlZENsb3VkRXJyb3IoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuVU5DSEVDS0VEX1BVUlBMRTpcbiAgICAgIHJldHVybiBtYXplTXNnLnVuY2hlY2tlZFB1cnBsZUVycm9yKCk7XG4gICAgY2FzZSBUZXJtaW5hdGlvblZhbHVlLklOU1VGRklDSUVOVF9ORUNUQVI6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5pbnN1ZmZpY2llbnROZWN0YXIoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuSU5TVUZGSUNJRU5UX0hPTkVZOlxuICAgICAgcmV0dXJuIG1hemVNc2cuaW5zdWZmaWNpZW50SG9uZXkoKTtcbiAgICBjYXNlIFRlcm1pbmF0aW9uVmFsdWUuRElEX05PVF9DT0xMRUNUX0VWRVJZVEhJTkc6XG4gICAgICByZXR1cm4gbWF6ZU1zZy5kaWROb3RDb2xsZWN0RXZlcnl0aGluZygpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVzZXJDaGVjayBJcyB0aGlzIGJlaW5nIGNhbGxlZCBmcm9tIHVzZXIgY29kZVxuICovXG5CZWUucHJvdG90eXBlLmlzSGl2ZSA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdXNlckNoZWNrKSB7XG4gIHVzZXJDaGVjayA9IHVzZXJDaGVjayB8fCBmYWxzZTtcbiAgaWYgKHVzZXJDaGVjaykge1xuICAgIHRoaXMudXNlckNoZWNrc19bcm93XVtjb2xdLmNoZWNrZWRGb3JIaXZlID0gdHJ1ZTtcbiAgfVxuICB2YXIgY2VsbCA9IHRoaXMuY3VycmVudFN0YXRpY0dyaWRbcm93XVtjb2xdO1xuICByZXR1cm4gY2VsbC5pc0hpdmUoKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufSB1c2VyQ2hlY2sgSXMgdGhpcyBiZWluZyBjYWxsZWQgZnJvbSB1c2VyIGNvZGVcbiAqL1xuQmVlLnByb3RvdHlwZS5pc0Zsb3dlciA9IGZ1bmN0aW9uIChyb3csIGNvbCwgdXNlckNoZWNrKSB7XG4gIHVzZXJDaGVjayA9IHVzZXJDaGVjayB8fCBmYWxzZTtcbiAgaWYgKHVzZXJDaGVjaykge1xuICAgIHRoaXMudXNlckNoZWNrc19bcm93XVtjb2xdLmNoZWNrZWRGb3JGbG93ZXIgPSB0cnVlO1xuICB9XG4gIHZhciBjZWxsID0gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF07XG4gIHJldHVybiBjZWxsLmlzRmxvd2VyKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBjZWxsIHNob3VsZCBiZSBjbG92ZXJlZCBieSBhIGNsb3VkIHdoaWxlIHJ1bm5pbmdcbiAqL1xuQmVlLnByb3RvdHlwZS5pc0Nsb3VkYWJsZSA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uaXNTdGF0aWNDbG91ZCgpO1xufTtcblxuLyoqXG4gKiBUaGUgb25seSBjbG91ZHMgd2UgY2FyZSBhYm91dCBjaGVja2luZyBhcmUgY2xvdWRzIHRoYXQgd2VyZSBkZWZpbmVkXG4gKiBhcyBzdGF0aWMgY2xvdWRzIGluIHRoZSBvcmlnaW5hbCBncmlkOyBxdWFudHVtIGNsb3VkcyB3aWxsIGhhbmRsZVxuICogJ3JlcXVpcmluZycgY2hlY2tzIHRocm91Z2ggdGhlaXIgcXVhbnR1bSBuYXR1cmUuXG4gKi9cbkJlZS5wcm90b3R5cGUuc2hvdWxkQ2hlY2tDbG91ZCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICByZXR1cm4gdGhpcy52YXJpYWJsZUdyaWRbcm93XVtjb2xdLmlzU3RhdGljQ2xvdWQoKTtcbn07XG5cbi8qKlxuICogTGlrZXdpc2UsIHRoZSBvbmx5IGZsb3dlcnMgd2UgY2FyZSBhYm91dCBjaGVja2luZyBhcmUgZmxvd2VycyB0aGF0XG4gKiB3ZXJlIGRlZmluZWQgYXMgcHVycGxlIGZsb3dlcnMgd2l0aG91dCBhIHZhcmlhYmxlIHJhbmdlIGluIHRoZVxuICogb3JpZ2luYWwgZ3JpZDsgdmFyaWFibGUgcmFuZ2UgZmxvd2VycyB3aWxsIGhhbmRsZSAncmVxdWlyaW5nJyBjaGVja3NcbiAqIHRocm91Z2ggdGhlaXIgcXVhbnR1bSBuYXR1cmUuXG4gKi9cbkJlZS5wcm90b3R5cGUuc2hvdWxkQ2hlY2tQdXJwbGUgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMuaXNQdXJwbGVGbG93ZXIocm93LCBjb2wpICYmICF0aGlzLnZhcmlhYmxlR3JpZFtyb3ddW2NvbF0uaXNWYXJpYWJsZVJhbmdlKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBjZWxsIGhhcyBiZWVuIGNoZWNrZWQgZm9yIGVpdGhlciBhIGZsb3dlciBvciBhIGhpdmVcbiAqL1xuQmVlLnByb3RvdHlwZS5jaGVja2VkQ2xvdWQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgcmV0dXJuIHRoaXMudXNlckNoZWNrc19bcm93XVtjb2xdLmNoZWNrZWRGb3JGbG93ZXIgfHwgdGhpcy51c2VyQ2hlY2tzX1tyb3ddW2NvbF0uY2hlY2tlZEZvckhpdmU7XG59O1xuXG4vKipcbiAqIEZsb3dlcnMgYXJlIGVpdGhlciByZWQgb3IgcHVycGxlLiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiBhIGZsb3dlciBpcyByZWQuXG4gKi9cbkJlZS5wcm90b3R5cGUuaXNSZWRGbG93ZXIgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKCF0aGlzLmlzRmxvd2VyKHJvdywgY29sLCBmYWxzZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB0aGUgZmxvd2VyIGhhcyBiZWVuIG92ZXJyaWRkZW4gdG8gYmUgcmVkLCByZXR1cm4gdHJ1ZS5cbiAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgZmxvd2VyIGhhcyBiZWVuIG92ZXJyaWRkZW4gdG8gYmUgcHVycGxlLCByZXR1cm5cbiAgLy8gZmFsc2UuIElmIG5laXRoZXIgb2YgdGhvc2UgYXJlIHRydWUsIHRoZW4gdGhlIGZsb3dlciBpcyB3aGF0ZXZlclxuICAvLyB0aGUgZGVmYXVsdCBmbG93ZXIgY29sb3IgaXMuXG4gIGlmICh0aGlzLmN1cnJlbnRTdGF0aWNHcmlkW3Jvd11bY29sXS5pc1JlZEZsb3dlcigpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50U3RhdGljR3JpZFtyb3ddW2NvbF0uaXNQdXJwbGVGbG93ZXIoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0Rmxvd2VyQ29sb3JfID09PSAncmVkJztcbiAgfVxufTtcblxuLyoqXG4gKiBSb3csIGNvbCBjb250YWlucyBhIGZsb3dlciB0aGF0IGlzIHB1cnBsZVxuICovXG5CZWUucHJvdG90eXBlLmlzUHVycGxlRmxvd2VyID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIHJldHVybiB0aGlzLmlzRmxvd2VyKHJvdywgY29sLCBmYWxzZSkgJiYgIXRoaXMuaXNSZWRGbG93ZXIocm93LCBjb2wpO1xufTtcblxuLyoqXG4gKiBIb3cgbXVjaCBtb3JlIGhvbmV5IGNhbiB0aGUgaGl2ZSBhdCAocm93LCBjb2wpIHByb2R1Y2UgYmVmb3JlIGl0IGhpdHMgdGhlIGdvYWxcbiAqL1xuQmVlLnByb3RvdHlwZS5oaXZlUmVtYWluaW5nQ2FwYWNpdHkgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKCF0aGlzLmlzSGl2ZShyb3csIGNvbCkpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzLmdldFZhbHVlKHJvdywgY29sKTtcbiAgaWYgKHZhbCA9PT0gVU5MSU1JVEVEX0hPTkVZKSB7XG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG4gIGlmICh2YWwgPT09IEVNUFRZX0hPTkVZKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogSG93IG11Y2ggbW9yZSBuZWN0YXIgY2FuIGJlIGNvbGxlY3RlZCBmcm9tIHRoZSBmbG93ZXIgYXQgKHJvdywgY29sKVxuICovXG5CZWUucHJvdG90eXBlLmZsb3dlclJlbWFpbmluZ0NhcGFjaXR5ID0gZnVuY3Rpb24gKHJvdywgY29sKSB7XG4gIGlmICghdGhpcy5pc0Zsb3dlcihyb3csIGNvbCkpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzLmdldFZhbHVlKHJvdywgY29sKTtcbiAgaWYgKHZhbCA9PT0gVU5MSU1JVEVEX05FQ1RBUikge1xuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuICBpZiAodmFsID09PSBFTVBUWV9ORUNUQVIpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbW9kZWwgdG8gcmVwcmVzZW50IG1hZGUgaG9uZXkuICBEb2VzIG5vIHZhbGlkYXRpb25cbiAqL1xuQmVlLnByb3RvdHlwZS5tYWRlSG9uZXlBdCA9IGZ1bmN0aW9uIChyb3csIGNvbCkge1xuICBpZiAodGhpcy5nZXRWYWx1ZShyb3csIGNvbCkgIT09IFVOTElNSVRFRF9IT05FWSkge1xuICAgIHRoaXMuc2V0VmFsdWUocm93LCBjb2wsIHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpIC0gMSk7XG4gIH1cblxuICB0aGlzLmhvbmV5XyArPSAxO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgbW9kZWwgdG8gcmVwcmVzZW50IGdhdGhlcmVkIG5lY3Rhci4gRG9lcyBubyB2YWxpZGF0aW9uXG4gKi9cbkJlZS5wcm90b3R5cGUuZ290TmVjdGFyQXQgPSBmdW5jdGlvbiAocm93LCBjb2wpIHtcbiAgaWYgKHRoaXMuZ2V0VmFsdWUocm93LCBjb2wpICE9PSBVTkxJTUlURURfTkVDVEFSKSB7XG4gICAgdGhpcy5zZXRWYWx1ZShyb3csIGNvbCwgdGhpcy5nZXRWYWx1ZShyb3csIGNvbCkgLSAxKTtcbiAgfVxuXG4gIHRoaXMubmVjdGFyc18ucHVzaCh7cm93OiByb3csIGNvbDogY29sfSk7XG59O1xuXG4vLyBBUElcblxuQmVlLnByb3RvdHlwZS5nZXROZWN0YXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICAvLyBNYWtlIHN1cmUgd2UncmUgYXQgYSBmbG93ZXIuXG4gIGlmICghdGhpcy5pc0Zsb3dlcihyb3csIGNvbCkpIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0ZMT1dFUik7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIE5lY3RhciBpcyBwb3NpdGl2ZS4gIE1ha2Ugc3VyZSB3ZSBoYXZlIGl0LlxuICBpZiAodGhpcy5mbG93ZXJSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCkgPT09IDApIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuRkxPV0VSX0VNUFRZKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8ucXVldWVBY3Rpb24oJ25lY3RhcicsIGlkKTtcbiAgdGhpcy5nb3ROZWN0YXJBdChyb3csIGNvbCk7XG59O1xuXG4vLyBOb3RlIHRoYXQgdGhpcyBkZWxpYmVyYXRlbHkgZG9lcyBub3QgY2hlY2sgd2hldGhlciBiZWUgaGFzIGdhdGhlcmVkIG5lY3Rhci5cbkJlZS5wcm90b3R5cGUubWFrZUhvbmV5ID0gZnVuY3Rpb24gKGlkKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgaWYgKCF0aGlzLmlzSGl2ZShyb3csIGNvbCkpIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuTk9UX0FUX0hPTkVZQ09NQik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLmhpdmVSZW1haW5pbmdDYXBhY2l0eShyb3csIGNvbCkgPT09IDApIHtcbiAgICB0aGlzLm1hemVfLmV4ZWN1dGlvbkluZm8udGVybWluYXRlV2l0aFZhbHVlKFRlcm1pbmF0aW9uVmFsdWUuSE9ORVlDT01CX0ZVTEwpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMubWF6ZV8uZXhlY3V0aW9uSW5mby5xdWV1ZUFjdGlvbignaG9uZXknLCBpZCk7XG4gIHRoaXMubWFkZUhvbmV5QXQocm93LCBjb2wpO1xufTtcblxuQmVlLnByb3RvdHlwZS5uZWN0YXJSZW1haW5pbmcgPSBmdW5jdGlvbiAodXNlckNoZWNrKSB7XG4gIHVzZXJDaGVjayA9IHVzZXJDaGVjayB8fCBmYWxzZTtcblxuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIGlmICh1c2VyQ2hlY2spIHtcbiAgICB0aGlzLnVzZXJDaGVja3NfW3Jvd11bY29sXS5jaGVja2VkRm9yTmVjdGFyID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmZsb3dlclJlbWFpbmluZ0NhcGFjaXR5KHJvdywgY29sKTtcbn07XG5cbkJlZS5wcm90b3R5cGUuaG9uZXlBdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb2wgPSB0aGlzLm1hemVfLnBlZ21hblg7XG4gIHZhciByb3cgPSB0aGlzLm1hemVfLnBlZ21hblk7XG5cbiAgcmV0dXJuIHRoaXMuaGl2ZVJlbWFpbmluZ0NhcGFjaXR5KHJvdywgY29sKTtcbn07XG5cbi8vIEFOSU1BVElPTlNcbkJlZS5wcm90b3R5cGUucGxheUF1ZGlvXyA9IGZ1bmN0aW9uIChzb3VuZCkge1xuICAvLyBDaGVjayBmb3IgU3R1ZGlvQXBwLCB3aGljaCB3aWxsIG9mdGVuIGJlIHVuZGVmaW5lZCBpbiB1bml0IHRlc3RzXG4gIGlmICh0aGlzLnN0dWRpb0FwcF8pIHtcbiAgICB0aGlzLnN0dWRpb0FwcF8ucGxheUF1ZGlvKHNvdW5kKTtcbiAgfVxufTtcblxuQmVlLnByb3RvdHlwZS5hbmltYXRlR2V0TmVjdGFyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29sID0gdGhpcy5tYXplXy5wZWdtYW5YO1xuICB2YXIgcm93ID0gdGhpcy5tYXplXy5wZWdtYW5ZO1xuXG4gIGlmICh0aGlzLmdldFZhbHVlKHJvdywgY29sKSA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU2hvdWxkbid0IGJlIGFibGUgdG8gZW5kIHVwIHdpdGggYSBuZWN0YXIgYW5pbWF0aW9uIGlmIFwiICtcbiAgICAgIFwidGhlcmUgd2FzIG5vIG5lY3RhciB0byBiZSBoYWRcIik7XG4gIH1cblxuICB0aGlzLnBsYXlBdWRpb18oJ25lY3RhcicpO1xuICB0aGlzLmdvdE5lY3RhckF0KHJvdywgY29sKTtcblxuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUl0ZW1JbWFnZShyb3csIGNvbCwgdHJ1ZSk7XG4gIHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlTmVjdGFyQ291bnRlcih0aGlzLm5lY3RhcnNfKTtcbn07XG5cbkJlZS5wcm90b3R5cGUuYW5pbWF0ZU1ha2VIb25leSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbCA9IHRoaXMubWF6ZV8ucGVnbWFuWDtcbiAgdmFyIHJvdyA9IHRoaXMubWF6ZV8ucGVnbWFuWTtcblxuICBpZiAoIXRoaXMuaXNIaXZlKHJvdywgY29sKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlNob3VsZG4ndCBiZSBhYmxlIHRvIGVuZCB1cCB3aXRoIGEgaG9uZXkgYW5pbWF0aW9uIGlmIFwiICtcbiAgICAgIFwid2UgYXJlbnQgYXQgYSBoaXZlIG9yIGRvbnQgaGF2ZSBuZWN0YXJcIik7XG4gIH1cblxuICB0aGlzLnBsYXlBdWRpb18oJ2hvbmV5Jyk7XG4gIHRoaXMubWFkZUhvbmV5QXQocm93LCBjb2wpO1xuXG4gIHRoaXMubWF6ZV8uZ3JpZEl0ZW1EcmF3ZXIudXBkYXRlSXRlbUltYWdlKHJvdywgY29sLCB0cnVlKTtcblxuICB0aGlzLm1hemVfLmdyaWRJdGVtRHJhd2VyLnVwZGF0ZUhvbmV5Q291bnRlcih0aGlzLmhvbmV5Xyk7XG59O1xuIiwiLy8gbG9jYWxlIGZvciBtYXplXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5Lm1hemVfbG9jYWxlO1xuIiwiLyoqXG4gKiBAb3ZlcnZpZXcgQmVlQ2VsbCByZXByZXNlbnRzIHRoZSBjb250ZXRzIG9mIHRoZSBncmlkIGVsZW1lbnRzIGZvciBCZWUuXG4gKiBCZWUgQmVlQ2VsbHMgYXJlIG1vcmUgY29tcGxleCB0aGFuIG1hbnkgb3RoZXIga2luZHMgb2YgY2VsbDsgdGhleSBjYW4gYmVcbiAqIFwiaGlkZGVuXCIgd2l0aCBjbG91ZHMsIHRoZXkgY2FuIHJlcHJlc2VudCBtdWx0aXBsZSBkaWZmZXJlbnQga2luZHMgb2ZcbiAqIGVsZW1lbnQgKGZsb3dlciwgaGl2ZSksIHNvbWUgb2Ygd2hpY2ggY2FuIGJlIG11bHRpcGxlIGNvbG9ycyAocmVkLFxuICogcHVycGxlKSwgYW5kIHdoaWNoIGNhbiBoYXZlIGEgcmFuZ2Ugb2YgcG9zc2libGUgdmFsdWVzLlxuICpcbiAqIFNvbWUgY2VsbHMgY2FuIGFsc28gYmUgXCJ2YXJpYWJsZVwiLCBtZWFuaW5nIHRoYXQgdGhlaXIgY29udGVudHMgYXJlXG4gKiBub3Qgc3RhdGljIGJ1dCBjYW4gaW4gZmFjdCBiZSByYW5kb21pemVkIGJldHdlZW4gcnVucy5cbiAqL1xuXG52YXIgQ2VsbCA9IHJlcXVpcmUoJy4vY2VsbCcpO1xuXG52YXIgdGlsZXMgPSByZXF1aXJlKCcuL3RpbGVzJyk7XG52YXIgU3F1YXJlVHlwZSA9IHRpbGVzLlNxdWFyZVR5cGU7XG5cbnZhciBCZWVDZWxsID0gZnVuY3Rpb24gKHRpbGVUeXBlLCBmZWF0dXJlVHlwZSwgdmFsdWUsIGNsb3VkVHlwZSwgZmxvd2VyQ29sb3IsIHJhbmdlKSB7XG5cbiAgLy8gQmVlQ2VsbHMgcmVxdWlyZSBmZWF0dXJlcyB0byBoYXZlIHZhbHVlc1xuICBpZiAoZmVhdHVyZVR5cGUgPT09IEJlZUNlbGwuRmVhdHVyZVR5cGUuTk9ORSkge1xuICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHJhbmdlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgQ2VsbC5jYWxsKHRoaXMsIHRpbGVUeXBlLCB2YWx1ZSk7XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aGlzLmZlYXR1cmVUeXBlXyA9IGZlYXR1cmVUeXBlO1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhpcy5mbG93ZXJDb2xvcl8gPSBmbG93ZXJDb2xvcjtcblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMuY2xvdWRUeXBlXyA9IGNsb3VkVHlwZTtcblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMucmFuZ2VfID0gKHJhbmdlICYmIHJhbmdlID4gdmFsdWUpID8gcmFuZ2UgOiB2YWx1ZTtcbn07XG5cbkJlZUNlbGwuaW5oZXJpdHMoQ2VsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IEJlZUNlbGw7XG5cbnZhciBGZWF0dXJlVHlwZSA9IEJlZUNlbGwuRmVhdHVyZVR5cGUgPSB7XG4gIE5PTkU6IHVuZGVmaW5lZCxcbiAgSElWRTogMCxcbiAgRkxPV0VSOiAxLFxuICBWQVJJQUJMRTogMlxufTtcblxudmFyIENsb3VkVHlwZSA9IEJlZUNlbGwuQ2xvdWRUeXBlID0ge1xuICBOT05FOiB1bmRlZmluZWQsXG4gIFNUQVRJQzogMCxcbiAgSElWRV9PUl9GTE9XRVI6IDEsXG4gIEZMT1dFUl9PUl9OT1RISU5HOiAyLFxuICBISVZFX09SX05PVEhJTkc6IDMsXG4gIEFOWTogNFxufTtcblxudmFyIEZsb3dlckNvbG9yID0gQmVlQ2VsbC5GbG93ZXJDb2xvciA9IHtcbiAgREVGQVVMVDogdW5kZWZpbmVkLFxuICBSRUQ6IDAsXG4gIFBVUlBMRTogMVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbmV3IEJlZUNlbGwgdGhhdCdzIGFuIGV4YWN0IHJlcGxpY2Egb2YgdGhpcyBvbmVcbiAqIEByZXR1cm4ge0JlZUNlbGx9XG4gKiBAb3ZlcnJpZGVcbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuZXdCZWVDZWxsID0gbmV3IEJlZUNlbGwoXG4gICAgdGhpcy50aWxlVHlwZV8sXG4gICAgdGhpcy5mZWF0dXJlVHlwZV8sXG4gICAgdGhpcy5vcmlnaW5hbFZhbHVlXyxcbiAgICB0aGlzLmNsb3VkVHlwZV8sXG4gICAgdGhpcy5mbG93ZXJDb2xvcl8sXG4gICAgdGhpcy5yYW5nZV9cbiAgKTtcbiAgbmV3QmVlQ2VsbC5zZXRDdXJyZW50VmFsdWUodGhpcy5jdXJyZW50VmFsdWVfKTtcbiAgcmV0dXJuIG5ld0JlZUNlbGw7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzRmxvd2VyID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5mZWF0dXJlVHlwZV8gPT09IEZlYXR1cmVUeXBlLkZMT1dFUjtcbn07XG5cbi8qKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNIaXZlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5mZWF0dXJlVHlwZV8gPT09IEZlYXR1cmVUeXBlLkhJVkU7XG59O1xuXG4vKipcbiAqIEZsb3dlcnMgY2FuIGJlIHJlZCwgcHVycGxlLCBvciB1bmRlZmluZWQuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5CZWVDZWxsLnByb3RvdHlwZS5pc1JlZEZsb3dlciA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuaXNGbG93ZXIoKSAmJiB0aGlzLmZsb3dlckNvbG9yXyA9PT0gRmxvd2VyQ29sb3IuUkVEO1xufTtcblxuLyoqXG4gKiBGbG93ZXJzIGNhbiBiZSByZWQsIHB1cnBsZSwgb3IgdW5kZWZpbmVkLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNQdXJwbGVGbG93ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmlzRmxvd2VyKCkgJiYgdGhpcy5mbG93ZXJDb2xvcl8gPT09IEZsb3dlckNvbG9yLlBVUlBMRTtcbn07XG5cbi8qKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNTdGF0aWNDbG91ZCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY2xvdWRUeXBlXyA9PT0gQ2xvdWRUeXBlLlNUQVRJQztcbn07XG5cbi8qKlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuQmVlQ2VsbC5wcm90b3R5cGUuaXNWYXJpYWJsZUNsb3VkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5jbG91ZFR5cGVfID09PSBDbG91ZFR5cGUuTk9ORSB8fCB0aGlzLmNsb3VkVHlwZV8gPT09IENsb3VkVHlwZS5TVEFUSUMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmlzVmFyaWFibGVSYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2VfICYmIHRoaXMucmFuZ2VfID4gdGhpcy5vcmlnaW5hbFZhbHVlXztcbn07XG5cbi8qKlxuICogVmFyaWFibGUgY2VsbHMgY2FuIHJlcHJlc2VudCBtdWx0aXBsZSBwb3NzaWJsZSBraW5kcyBvZiBncmlkIGFzc2V0cyxcbiAqIHdoZXJlYXMgbm9uLXZhcmlhYmxlIGNlbGxzIGNhbiByZXByZXNlbnQgb25seSBhIHNpbmdsZSBraW5kLiBUaGlzXG4gKiBtZXRob2QgcmV0dXJucyBhbiBhcnJheSBvZiBub24tdmFyaWFibGUgQmVlQ2VsbHMgYmFzZWQgb24gdGhpcyBCZWVDZWxsJ3NcbiAqIGNvbmZpZ3VyYXRpb24uXG4gKiBAcmV0dXJuIHtCZWVDZWxsW119XG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLmdldFBvc3NpYmxlR3JpZEFzc2V0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBvc3NpYmlsaXRpZXMgPSBbXTtcbiAgaWYgKHRoaXMuaXNWYXJpYWJsZUNsb3VkKCkpIHtcbiAgICB2YXIgZmxvd2VyID0gbmV3IEJlZUNlbGwodGhpcy50aWxlVHlwZV8sIEZlYXR1cmVUeXBlLkZMT1dFUiwgdGhpcy5vcmlnaW5hbFZhbHVlXywgQ2xvdWRUeXBlLlNUQVRJQywgdGhpcy5mbG93ZXJDb2xvcl8pO1xuICAgIHZhciBoaXZlID0gbmV3IEJlZUNlbGwodGhpcy50aWxlVHlwZV8sIEZlYXR1cmVUeXBlLkhJVkUsIHRoaXMub3JpZ2luYWxWYWx1ZV8sIENsb3VkVHlwZS5TVEFUSUMpO1xuICAgIHZhciBub3RoaW5nID0gbmV3IEJlZUNlbGwodGhpcy50aWxlVHlwZV8sIEZlYXR1cmVUeXBlLk5PTkUsIHVuZGVmaW5lZCwgQ2xvdWRUeXBlLlNUQVRJQyk7XG4gICAgc3dpdGNoICh0aGlzLmNsb3VkVHlwZV8pIHtcbiAgICAgIGNhc2UgQ2xvdWRUeXBlLkhJVkVfT1JfRkxPV0VSOlxuICAgICAgICBwb3NzaWJpbGl0aWVzID0gW2Zsb3dlciwgaGl2ZV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDbG91ZFR5cGUuRkxPV0VSX09SX05PVEhJTkc6XG4gICAgICAgIHBvc3NpYmlsaXRpZXMgPSBbZmxvd2VyLCBub3RoaW5nXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENsb3VkVHlwZS5ISVZFX09SX05PVEhJTkc6XG4gICAgICAgIHBvc3NpYmlsaXRpZXMgPSBbaGl2ZSwgbm90aGluZ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDbG91ZFR5cGUuQU5ZOlxuICAgICAgICBwb3NzaWJpbGl0aWVzID0gW2Zsb3dlciwgaGl2ZSwgbm90aGluZ107XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0aGlzLmlzVmFyaWFibGVSYW5nZSgpKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMub3JpZ2luYWxWYWx1ZV87IGkgPD0gdGhpcy5yYW5nZV87IGkrKykge1xuICAgICAgcG9zc2liaWxpdGllcy5wdXNoKG5ldyBCZWVDZWxsKHRoaXMudGlsZVR5cGVfLCBGZWF0dXJlVHlwZS5GTE9XRVIsIGksIENsb3VkVHlwZS5OT05FLCBGbG93ZXJDb2xvci5QVVJQTEUpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcG9zc2liaWxpdGllcy5wdXNoKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHBvc3NpYmlsaXRpZXM7XG59O1xuXG4vKipcbiAqIFNlcmlhbGl6ZXMgdGhpcyBCZWVDZWxsIGludG8gSlNPTlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQG92ZXJyaWRlXG4gKi9cbkJlZUNlbGwucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0aWxlVHlwZTogdGhpcy50aWxlVHlwZV8sXG4gICAgZmVhdHVyZVR5cGU6IHRoaXMuZmVhdHVyZVR5cGVfLFxuICAgIHZhbHVlOiB0aGlzLm9yaWdpbmFsVmFsdWVfLFxuICAgIGNsb3VkVHlwZTogdGhpcy5jbG91ZFR5cGVfLFxuICAgIGZsb3dlckNvbG9yOiB0aGlzLmZsb3dlckNvbG9yXyxcbiAgICByYW5nZTogdGhpcy5yYW5nZV8sXG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgQmVlQ2VsbCBmcm9tIHNlcmlhbGl6ZWQgSlNPTlxuICogQHBhcmFtIHtPYmplY3R9XG4gKiBAcmV0dXJuIHtCZWVDZWxsfVxuICogQG92ZXJyaWRlXG4gKi9cbkJlZUNlbGwuZGVzZXJpYWxpemUgPSBmdW5jdGlvbiAoc2VyaWFsaXplZCkge1xuICByZXR1cm4gbmV3IEJlZUNlbGwoXG4gICAgc2VyaWFsaXplZC50aWxlVHlwZSxcbiAgICBzZXJpYWxpemVkLmZlYXR1cmVUeXBlLFxuICAgIHNlcmlhbGl6ZWQudmFsdWUsXG4gICAgc2VyaWFsaXplZC5jbG91ZFR5cGUsXG4gICAgc2VyaWFsaXplZC5mbG93ZXJDb2xvcixcbiAgICBzZXJpYWxpemVkLnJhbmdlXG4gICk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gbWFwQ2VsbFxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBpbml0aWFsRGlydENlbGxcbiAqIEByZXR1cm4ge0JlZUNlbGx9XG4gKiBAb3ZlcnJpZGVcbiAqIEBzZWUgQ2VsbC5wYXJzZUZyb21PbGRWYWx1ZXNcbiAqL1xuQmVlQ2VsbC5wYXJzZUZyb21PbGRWYWx1ZXMgPSBmdW5jdGlvbiAobWFwQ2VsbCwgaW5pdGlhbERpcnRDZWxsKSB7XG4gIG1hcENlbGwgPSBtYXBDZWxsLnRvU3RyaW5nKCk7XG4gIGluaXRpYWxEaXJ0Q2VsbCA9IHBhcnNlSW50KGluaXRpYWxEaXJ0Q2VsbCk7XG4gIHZhciB0aWxlVHlwZSwgZmVhdHVyZVR5cGUsIHZhbHVlLCBjbG91ZFR5cGUsIGZsb3dlckNvbG9yO1xuXG4gIGlmICghaXNOYU4oaW5pdGlhbERpcnRDZWxsKSAmJiBtYXBDZWxsLm1hdGNoKC9bMXxSfFB8RkNdLykgJiYgaW5pdGlhbERpcnRDZWxsICE9PSAwKSB7XG4gICAgdGlsZVR5cGUgPSBTcXVhcmVUeXBlLk9QRU47XG4gICAgZmVhdHVyZVR5cGUgPSBpbml0aWFsRGlydENlbGwgPiAwID8gRmVhdHVyZVR5cGUuRkxPV0VSIDogRmVhdHVyZVR5cGUuSElWRTtcbiAgICB2YWx1ZSA9IE1hdGguYWJzKGluaXRpYWxEaXJ0Q2VsbCk7XG4gICAgY2xvdWRUeXBlID0gKG1hcENlbGwgPT09ICdGQycpID8gQ2xvdWRUeXBlLlNUQVRJQyA6IENsb3VkVHlwZS5OT05FO1xuICAgIGZsb3dlckNvbG9yID0gKG1hcENlbGwgPT09ICdSJykgPyBGbG93ZXJDb2xvci5SRUQgOiAobWFwQ2VsbCA9PT0gJ1AnKSA/IEZsb3dlckNvbG9yLlBVUlBMRSA6IEZsb3dlckNvbG9yLkRFRkFVTFQ7XG4gIH0gZWxzZSB7XG4gICAgdGlsZVR5cGUgPSBwYXJzZUludChtYXBDZWxsKTtcbiAgfVxuICByZXR1cm4gbmV3IEJlZUNlbGwodGlsZVR5cGUsIGZlYXR1cmVUeXBlLCB2YWx1ZSwgY2xvdWRUeXBlLCBmbG93ZXJDb2xvcik7XG59O1xuIiwidmFyIHRpbGVzID0gcmVxdWlyZSgnLi90aWxlcycpO1xudmFyIFNxdWFyZVR5cGUgPSB0aWxlcy5TcXVhcmVUeXBlO1xuXG52YXIgQ2VsbCA9IGZ1bmN0aW9uICh0aWxlVHlwZSwgdmFsdWUpIHtcbiAgXG4gIC8qKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhpcy50aWxlVHlwZV8gPSB0aWxlVHlwZTtcblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMub3JpZ2luYWxWYWx1ZV8gPSB2YWx1ZTtcblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRoaXMuY3VycmVudFZhbHVlXyA9IHVuZGVmaW5lZDtcbiAgdGhpcy5yZXNldEN1cnJlbnRWYWx1ZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDZWxsO1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgQ2VsbCB0aGF0J3MgYW4gZXhhY3QgcmVwbGljYSBvZiB0aGlzIG9uZVxuICogQHJldHVybiB7Q2VsbH1cbiAqL1xuQ2VsbC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuZXdDZWxsID0gbmV3IENlbGwodGhpcy50aWxlVHlwZV8sIHRoaXMub3JpZ2luYWxWYWx1ZV8pO1xuICBuZXdDZWxsLnNldEN1cnJlbnRWYWx1ZSh0aGlzLmN1cnJlbnRWYWx1ZV8pO1xuICByZXR1cm4gbmV3Q2VsbDtcbn07XG5cbi8qKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5DZWxsLnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50aWxlVHlwZV87XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbkNlbGwucHJvdG90eXBlLmlzRGlydCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMub3JpZ2luYWxWYWx1ZV8gIT09IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5DZWxsLnByb3RvdHlwZS5nZXRDdXJyZW50VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmN1cnJlbnRWYWx1ZV87XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfVxuICovXG5DZWxsLnByb3RvdHlwZS5zZXRDdXJyZW50VmFsdWUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHRoaXMuY3VycmVudFZhbHVlXyA9IHZhbDtcbn07XG5cbkNlbGwucHJvdG90eXBlLnJlc2V0Q3VycmVudFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN1cnJlbnRWYWx1ZV8gPSB0aGlzLm9yaWdpbmFsVmFsdWVfO1xufTtcblxuLyoqXG4gKiBTZXJpYWxpemVzIHRoaXMgQ2VsbCBpbnRvIEpTT05cbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuQ2VsbC5wcm90b3R5cGUuc2VyaWFsaXplID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHRpbGVUeXBlOiB0aGlzLnRpbGVUeXBlXyxcbiAgICB2YWx1ZTogdGhpcy5vcmlnaW5hbFZhbHVlXyxcbiAgfTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBDZWxsIGZyb20gc2VyaWFsaXplZCBKU09OXG4gKiBAcGFyYW0ge09iamVjdH1cbiAqIEByZXR1cm4ge0NlbGx9XG4gKi9cbkNlbGwuZGVzZXJpYWxpemUgPSBmdW5jdGlvbiAoc2VyaWFsaXplZCkge1xuICByZXR1cm4gbmV3IENlbGwoXG4gICAgc2VyaWFsaXplZC50aWxlVHlwZSxcbiAgICBzZXJpYWxpemVkLnZhbHVlXG4gICk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgQ2VsbCBmcm9tIGEgbWFwQ2VsbCBhbmQgYW4gaW5pdGlhbERpcnRDZWxsLiBUaGlzXG4gKiByZXByZXNlbnRzIHRoZSBvbGQgc3R5bGUgb2Ygc3RvcmluZyBtYXAgZGF0YSwgYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogZm9yIGFueSBuZXcgbGV2ZWxzLiBOb3RlIHRoYXQgdGhpcyBzdHlsZSBkb2VzIG5vdCBzdXBwb3J0IG5ld1xuICogZmVhdHVyZXMgc3VjaCBhcyBkeW5hbWljIHJhbmdlcyBvciBuZXcgY2xvdWQgdHlwZXMuIE9ubHkgdXNlZCBmb3JcbiAqIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBtYXBDZWxsXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IGluaXRpYWxEaXJ0Q2VsbFxuICogQHJldHVybiB7Q2VsbH1cbiAqIEBvdmVycmlkZVxuICovXG5DZWxsLnBhcnNlRnJvbU9sZFZhbHVlcyA9IGZ1bmN0aW9uIChtYXBDZWxsLCBpbml0aWFsRGlydENlbGwpIHtcbiAgbWFwQ2VsbCA9IHBhcnNlSW50KG1hcENlbGwpO1xuICBpbml0aWFsRGlydENlbGwgPSBwYXJzZUludChpbml0aWFsRGlydENlbGwpO1xuXG4gIHZhciB0aWxlVHlwZSwgdmFsdWU7XG5cbiAgdGlsZVR5cGUgPSBwYXJzZUludChtYXBDZWxsKTtcbiAgaWYgKCFpc05hTihpbml0aWFsRGlydENlbGwpICYmIGluaXRpYWxEaXJ0Q2VsbCAhPT0gMCkge1xuICAgIHZhbHVlID0gaW5pdGlhbERpcnRDZWxsO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDZWxsKHRpbGVUeXBlLCB2YWx1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgVGlsZXMgPSBtb2R1bGUuZXhwb3J0cztcblxuLyoqXG4gKiBDb25zdGFudHMgZm9yIGNhcmRpbmFsIGRpcmVjdGlvbnMuICBTdWJzZXF1ZW50IGNvZGUgYXNzdW1lcyB0aGVzZSBhcmVcbiAqIGluIHRoZSByYW5nZSAwLi4zIGFuZCB0aGF0IG9wcG9zaXRlcyBoYXZlIGFuIGFic29sdXRlIGRpZmZlcmVuY2Ugb2YgMi5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblRpbGVzLkRpcmVjdGlvbiA9IHtcbiAgTk9SVEg6IDAsXG4gIEVBU1Q6IDEsXG4gIFNPVVRIOiAyLFxuICBXRVNUOiAzXG59O1xuXG4vKipcbiAqIFRoZSB0eXBlcyBvZiBzcXVhcmVzIGluIHRoZSBNYXplLCB3aGljaCBpcyByZXByZXNlbnRlZFxuICogYXMgYSAyRCBhcnJheSBvZiBTcXVhcmVUeXBlIHZhbHVlcy5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblRpbGVzLlNxdWFyZVR5cGUgPSB7XG4gIFdBTEw6IDAsXG4gIE9QRU46IDEsXG4gIFNUQVJUOiAyLFxuICBGSU5JU0g6IDMsXG4gIE9CU1RBQ0xFOiA0LFxuICBTVEFSVEFOREZJTklTSDogNVxufTtcblxuVGlsZXMuVHVybkRpcmVjdGlvbiA9IHsgTEVGVDogLTEsIFJJR0hUOiAxfTtcblRpbGVzLk1vdmVEaXJlY3Rpb24gPSB7IEZPUldBUkQ6IDAsIFJJR0hUOiAxLCBCQUNLV0FSRDogMiwgTEVGVDogM307XG5cblRpbGVzLmRpcmVjdGlvblRvRHhEeSA9IGZ1bmN0aW9uKGRpcmVjdGlvbikge1xuICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgIGNhc2UgVGlsZXMuRGlyZWN0aW9uLk5PUlRIOlxuICAgICAgcmV0dXJuIHtkeDogMCwgZHk6IC0xfTtcbiAgICBjYXNlIFRpbGVzLkRpcmVjdGlvbi5FQVNUOlxuICAgICAgcmV0dXJuIHtkeDogMSwgZHk6IDB9O1xuICAgIGNhc2UgVGlsZXMuRGlyZWN0aW9uLlNPVVRIOlxuICAgICAgcmV0dXJuIHtkeDogMCwgZHk6IDF9O1xuICAgIGNhc2UgVGlsZXMuRGlyZWN0aW9uLldFU1Q6XG4gICAgICByZXR1cm4ge2R4OiAtMSwgZHk6IDB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkaXJlY3Rpb24gdmFsdWUnICsgZGlyZWN0aW9uKTtcbn07XG5cblRpbGVzLmRpcmVjdGlvblRvRnJhbWUgPSBmdW5jdGlvbihkaXJlY3Rpb240KSB7XG4gIHJldHVybiB1dGlscy5tb2QoZGlyZWN0aW9uNCAqIDQsIDE2KTtcbn07XG5cbi8qKlxuICogS2VlcCB0aGUgZGlyZWN0aW9uIHdpdGhpbiAwLTMsIHdyYXBwaW5nIGF0IGJvdGggZW5kcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkIFBvdGVudGlhbGx5IG91dC1vZi1ib3VuZHMgZGlyZWN0aW9uIHZhbHVlLlxuICogQHJldHVybiB7bnVtYmVyfSBMZWdhbCBkaXJlY3Rpb24gdmFsdWUuXG4gKi9cblRpbGVzLmNvbnN0cmFpbkRpcmVjdGlvbjQgPSBmdW5jdGlvbihkKSB7XG4gIHJldHVybiB1dGlscy5tb2QoZCwgNCk7XG59O1xuIl19
