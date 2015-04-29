require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({111:[function(require,module,exports){
(function (global){
var appMain = require('../appMain');
window.Maze = require('./maze');
if (typeof global !== 'undefined') {
  global.Maze = window.Maze;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.mazeMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  appMain(window.Maze, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../appMain":5,"./blocks":102,"./levels":110,"./maze":112,"./skins":116}],116:[function(require,module,exports){
/**
 * Load Skin for Maze.
 */
// tiles: A 250x200 set of 20 map images.
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// look: Colour of sonar-like look icon.

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

exports.load = function(assetUrl, id) {
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

},{"../skins":207,"../utils":253}],112:[function(require,module,exports){
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
var commonMsg = require('../../locale/current/common');
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

var SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Create a namespace for the application.
 */
var Maze = module.exports;

var level;
var skin;

/**
 * Milliseconds between each animation frame.
 */
var stepSpeed;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var getTile = function(map, x, y) {
  if (map && map[y]) {
    return map[y][x];
  }
};

// Default Scalings
Maze.scale = {
  'snapRadius': 1,
  'stepSpeed': 5
};

var loadLevel = function() {
  // Load maps.
  Maze.map = level.map;
  Maze.initialDirtMap = level.initialDirt;
  Maze.startDirection = level.startDirection;

  Maze.animating_ = false;

  // Override scalars.
  for (var key in level.scale) {
    Maze.scale[key] = level.scale[key];
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
var initWallMap = function() {
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
  '10010': [4, 0],  // Dead ends
  '10001': [3, 3],
  '11000': [0, 1],
  '10100': [0, 2],
  '11010': [4, 1],  // Vertical
  '10101': [3, 2],  // Horizontal
  '10110': [0, 0],  // Elbows
  '10011': [2, 0],
  '11001': [4, 2],
  '11100': [2, 3],
  '11110': [1, 1],  // Junctions
  '10111': [1, 0],
  '11011': [2, 1],
  '11101': [1, 2],
  '11111': [2, 2],  // Cross
  'null0': [4, 3],  // Empty
  'null1': [3, 0],
  'null2': [3, 1],
  'null3': [0, 3],
  'null4': [1, 3],
};

function drawMap () {
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
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                        skin.background);
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
  pegmanIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                            skin.avatar);
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
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                                skin.goalIdle);
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
        obsIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacleIdle);
        obsIcon.setAttribute('x',
                             Maze.SQUARE_SIZE * (x + 0.5) -
                             obsIcon.getAttribute('width') / 2);
        obsIcon.setAttribute('y',
                             Maze.SQUARE_SIZE * (y + 0.9) -
                             obsIcon.getAttribute('height'));
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

      setInterval(function() {
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
function isWallOrOutOfBounds (x, y) {
  return Maze.map[y] === undefined || Maze.map[y][x] === undefined ||
    Maze.map[y][x] === SquareType.WALL;
}

// Return a value of '0' if the specified square is wall or out of bounds '1'
// otherwise (empty, obstacle, start, finish).
function isOnPathStr (x, y) {
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
      tile = isOnPathStr(x, y) +
        isOnPathStr(x, y - 1) +  // North.
        isOnPathStr(x + 1, y) +  // West.
        isOnPathStr(x, y + 1) +  // South.
        isOnPathStr(x - 1, y);   // East.

      var adjacentToPath = (tile !== '00000');

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
  tileElement.setAttributeNS('http://www.w3.org/1999/xlink',
                             'xlink:href',
                             skin.tiles);
  tileElement.setAttribute('height', tileSheetHeight);
  tileElement.setAttribute('width', tileSheetWidth);
  tileElement.setAttribute('clip-path',
                           'url(#tileClipPath' + tileId + ')');
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
Maze.init = function(config) {
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
      blockCounterClass: 'block-counter-default'
    },
    hideRunButton: level.stepOnly && !level.edit_blocks
  });

  config.loadAudio = function() {
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

  config.afterInject = function() {
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
          Maze.start_ = {x: x, y: y};
        } else if (cell === SquareType.FINISH) {
          Maze.finish_ = {x: x, y: y};
        } else if (cell == SquareType.STARTANDFINISH) {
          Maze.start_ = {x: x, y: y};
          Maze.finish_ = {x: x, y: y};
        }
      }
    }

    resetDirt();

    if (mazeUtils.isBeeSkin(config.skinId)) {
      Maze.gridItemDrawer = new BeeItemDrawer(Maze.dirt_, skin, Maze.initialDirtMap, Maze.bee);
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
var getPegmanYForRow = function (mazeRow) {
  var y = Maze.SQUARE_SIZE * (mazeRow + 0.5) - Maze.PEGMAN_HEIGHT / 2 +
    Maze.PEGMAN_Y_OFFSET;
  return Math.floor(y);
};

/**
 * Calculate the Y offset within the sheet
 */
var getPegmanFrameOffsetY = function (animationRow) {
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
var createPegmanAnimation = function(options) {
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
  // Add a random number to force it to reload everytime.
  var imgSrc = options.pegmanImage + '?time=' + (new Date()).getTime();
  var img = document.createElementNS(SVG_NS, 'image');
  img.setAttributeNS(
      'http://www.w3.org/1999/xlink', 'xlink:href', imgSrc);
  img.setAttribute('height', Maze.PEGMAN_HEIGHT * (options.numRowPegman || 1));
  img.setAttribute('width', Maze.PEGMAN_WIDTH * (options.numColPegman || 4));
  img.setAttribute('clip-path', 'url(#' + options.idStr + 'PegmanClip)');
  img.setAttribute('id', options.idStr + 'Pegman');
  svg.appendChild(img);
  // Update pegman icon & clip path.
  if (options.col !== undefined && options.direction !== undefined) {
    var x = Maze.SQUARE_SIZE * options.col -
      options.direction * Maze.PEGMAN_WIDTH + 1  + Maze.PEGMAN_X_OFFSET;
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
var updatePegmanAnimation = function(options) {
  var rect = document.getElementById(options.idStr + 'PegmanClipRect');
  rect.setAttribute('x', options.col * Maze.SQUARE_SIZE + 1 + Maze.PEGMAN_X_OFFSET);
  rect.setAttribute('y', getPegmanYForRow(options.row));
  var img = document.getElementById(options.idStr + 'Pegman');
  var x = Maze.SQUARE_SIZE * options.col -
      options.direction * Maze.PEGMAN_WIDTH + 1 + Maze.PEGMAN_X_OFFSET;
  img.setAttribute('x', x);
  var y = getPegmanYForRow(options.row) - getPegmanFrameOffsetY(options.animationRow);
  img.setAttribute('y', y);
  img.setAttribute('visibility', 'visible');
};

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
studioApp.reset = function(first) {
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
    timeoutList.setTimeout(function() {
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
    finishIcon.setAttribute('x', Maze.SQUARE_SIZE * (Maze.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
    finishIcon.setAttribute('y', Maze.SQUARE_SIZE * (Maze.finish_.y + 0.9) -
      finishIcon.getAttribute('height'));
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.goalIdle);
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
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                               skin.obstacleIdle);
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
      tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href', skin.tiles);
      tileElement.setAttribute('opacity', 1);
      tileId++;
    }
  }
}

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
studioApp.runButtonClick = function() {
  var stepButton = document.getElementById('stepButton');
  if (stepButton) {
    stepButton.setAttribute('disabled', '');
  }
  Maze.execute(false);
};

function beginAttempt () {
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

function reenableCachedBlockStates () {
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
var displayFeedback = function() {
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
  if (Maze.testResults === TestResults.APP_SPECIFIC_FAIL &&
      Maze.bee) {
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
Maze.onReportComplete = function(response) {
  Maze.response = response;
  Maze.waitingForReport = false;
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Maze.execute = function(stepMode) {
  beginAttempt();

  Maze.executionInfo = new ExecutionInfo({ticks: 100});
  Maze.result = ResultType.UNSET;
  Maze.testResults = TestResults.NO_TESTS_RUN;
  Maze.waitingForReport = false;
  Maze.animating_ = false;
  Maze.response = null;

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
          Maze.testResults = Maze.bee.getTestResults(
            Maze.executionInfo.terminationValue());
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
  var levelComplete = (Maze.result === ResultType.SUCCESS);

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
  var scaledStepSpeed = stepSpeed * Maze.scale.stepSpeed *
  skin.movePegmanAnimationSpeedScale;

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

  var timePerAction = stepSpeed * Maze.scale.stepSpeed *
    skin.movePegmanAnimationSpeedScale;

  // get a flat list of actions we want to schedule
  var actions = Maze.executionInfo.getActions(singleStep);

  scheduleSingleAnimation(0);

  // schedule animations in sequence
  // The reason we do this recursively instead of iteratively is that we want to
  // ensure that we finish scheduling action1 before starting to schedule
  // action2. Otherwise we get into trouble when stepSpeed is 0.
  function scheduleSingleAnimation (index) {
    if (index >= actions.length) {
      finishAnimations();
      return;
    }

    animateAction(actions[index], singleStep, timePerAction);
    timeoutList.setTimeout(function() {
      scheduleSingleAnimation(index + 1);
    }, timePerAction);
  }

  // Once animations are complete, we want to reenable the step button if we
  // have steps left, otherwise we're done with this execution.
  function finishAnimations() {
    var stepsRemaining = Maze.executionInfo.stepsRemaining();

    // allow time for  additional pause if we're completely done
    var waitTime = (stepsRemaining ? 0 : 1000);

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
function animateAction (action, spotlightBlocks, timePerStep) {
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
          timeoutList.setTimeout(function() {
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

function animatedMove (direction, timeForMove) {
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
function scheduleSheetedMovement(start, delta, numFrames, timePerFrame,
    idStr, direction, hidePegman) {
  var pegmanIcon = document.getElementById('pegman');
  utils.range(0, numFrames - 1).forEach(function (frame) {
    timeoutList.setTimeout(function() {
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
}

/**
 * Schedule the animations for a move from the current position
 * @param {number} endX X coordinate of the target position
 * @param {number} endY Y coordinate of the target position
 */
 function scheduleMove(endX, endY, timeForAnimation) {
  var startX = Maze.pegmanX;
  var startY = Maze.pegmanY;
  var direction = Maze.pegmanD;

  var deltaX = (endX - startX);
  var deltaY = (endY - startY);
  var numFrames;
  var timePerFrame;

  if (skin.movePegmanAnimation) {
    numFrames = skin.movePegmanAnimationFrameNumber;
    // If move animation of pegman is set, and this is not a turn.
    // Show the animation.
    var pegmanIcon = document.getElementById('pegman');
    var movePegmanIcon = document.getElementById('movePegman');
    timePerFrame = timeForAnimation / numFrames;

    scheduleSheetedMovement({x: startX, y: startY}, {x: deltaX, y: deltaY },
      numFrames, timePerFrame, 'move', direction, true);

    // Hide movePegman and set pegman to the end position.
    timeoutList.setTimeout(function() {
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
      timeoutList.setTimeout(function() {
        Maze.displayPegman(
          startX + deltaX * frame / numFrames,
          startY + deltaY * frame / numFrames,
          tiles.directionToFrame(direction));
      }, timePerFrame * frame);
    });
  }

  if (skin.approachingGoalAnimation) {
    var finishIcon = document.getElementById('finish');
    // If pegman is close to the goal
    // Replace the goal file with approachingGoalAnimation
    if (Maze.finish_ && Math.abs(endX - Maze.finish_.x) <= 1 &&
        Math.abs(endY - Maze.finish_.y) <= 1) {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        skin.approachingGoalAnimation);
    } else {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        skin.goalIdle);
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
    timeoutList.setTimeout(function() {
      Maze.displayPegman(
        Maze.pegmanX,
        Maze.pegmanY,
        tiles.directionToFrame(startDirection + deltaDirection * frame / numFrames));
    }, stepSpeed * (frame - 1));
  });
};

/**
 * Replace the tiles surrounding the obstacle with broken tiles.
 */
Maze.updateSurroundingTiles = function(obstacleY, obstacleX, brokenTiles) {
  var tileCoords = [
    [obstacleY - 1, obstacleX - 1],
    [obstacleY - 1, obstacleX],
    [obstacleY - 1, obstacleX + 1],
    [obstacleY, obstacleX - 1],
    [obstacleY, obstacleX],
    [obstacleY, obstacleX + 1],
    [obstacleY + 1, obstacleX - 1],
    [obstacleY + 1, obstacleX],
    [obstacleY + 1, obstacleX + 1]
  ];
  for (var idx = 0; idx < tileCoords.length; ++idx) {
    var tileIdx = tileCoords[idx][1] + Maze.COLS * tileCoords[idx][0];
    var tileElement = document.getElementById('tileElement' + tileIdx);
    if (tileElement) {
      tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href', brokenTiles);
    }
  }
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Maze.scheduleFail = function(forward) {
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
  Maze.displayPegman(Maze.pegmanX + deltaX / 4,
                     Maze.pegmanY + deltaY / 4,
                     frame);
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
        scheduleSheetedMovement({x: Maze.pegmanX, y: Maze.pegmanY},
          {x: deltaX, y: deltaY }, numFrames, timePerFrame, 'wall',
          Direction.NORTH, true);
        setTimeout(function () {
          document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
        }, numFrames * timePerFrame);
      } else {
        // active our gif
        timeoutList.setTimeout(function() {
          wallAnimationIcon.setAttribute('x',
            Maze.SQUARE_SIZE * (Maze.pegmanX + 0.5 + deltaX * 0.5) -
            wallAnimationIcon.getAttribute('width') / 2);
          wallAnimationIcon.setAttribute('y',
            Maze.SQUARE_SIZE * (Maze.pegmanY + 1 + deltaY * 0.5) -
            wallAnimationIcon.getAttribute('height'));
          wallAnimationIcon.setAttribute('visibility', 'visible');
          wallAnimationIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href',
            skin.hittingWallAnimation);
        }, stepSpeed / 2);
      }
    }
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, frame);
    }, stepSpeed);
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX + deltaX / 4, Maze.pegmanY + deltaY / 4,
       frame);
      studioApp.playAudio('failure');
    }, stepSpeed * 2);
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, frame);
    }, stepSpeed * 3);

    if (skin.wallPegmanAnimation) {
      timeoutList.setTimeout(function() {
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
    obsIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'xlink:href',
        skin.obstacleAnimation);
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX + deltaX / 2,
                         Maze.pegmanY + deltaY / 2,
                         frame);
    }, stepSpeed);

    // Replace the objects around obstacles with broken objects
    if (skin.largerObstacleAnimationTiles) {
      timeoutList.setTimeout(function() {
        Maze.updateSurroundingTiles(
            targetY, targetX, skin.largerObstacleAnimationTiles);
      }, stepSpeed);
    }

    // Remove pegman
    if (!skin.nonDisappearingPegmanHittingObstacle) {
      var svgMaze = document.getElementById('svgMaze');
      var pegmanIcon = document.getElementById('pegman');

      timeoutList.setTimeout(function() {
        pegmanIcon.setAttribute('visibility', 'hidden');
      }, stepSpeed * 2);
    }
    timeoutList.setTimeout(function() {
      studioApp.playAudio('failure');
    }, stepSpeed);
  }
};

/**
 * Set the tiles to be transparent gradually.
 */
function setTileTransparent () {
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
  if (mazeUtils.isScratSkin()) {
    scrat.scheduleDance(victoryDance, timeAlloted);
    return;
  }

  var originalFrame = tiles.directionToFrame(Maze.pegmanD);
  Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);

  // If victoryDance == true, play the goal animation, else reset it
  var finishIcon = document.getElementById('finish');
  if (victoryDance && finishIcon) {
    studioApp.playAudio('winGoal');
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skin.goalAnimation);
  }

  if (victoryDance) {
    studioApp.playAudio('win');
  }

  var danceSpeed = timeAlloted / 5;
  timeoutList.setTimeout(function() {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
  }, danceSpeed);
  timeoutList.setTimeout(function() {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 20);
  }, danceSpeed * 2);
  timeoutList.setTimeout(function() {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
  }, danceSpeed * 3);
  timeoutList.setTimeout(function() {
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
Maze.displayPegman = function(x, y, frame) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
    x * Maze.SQUARE_SIZE - frame * Maze.PEGMAN_WIDTH + 1 + Maze.PEGMAN_X_OFFSET);
  pegmanIcon.setAttribute('y', getPegmanYForRow(y));

  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Maze.SQUARE_SIZE + 1 + Maze.PEGMAN_X_OFFSET);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

var scheduleDirtChange = function(options) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.dirt_[row][col] += options.amount;
  Maze.gridItemDrawer.updateItemImage(row, col, true);
  studioApp.playAudio(options.sound);
};

/**
 * Schedule to add dirt at pegman's current position.
 */
Maze.scheduleFill = function() {
  scheduleDirtChange({
    amount: 1,
    sound: 'fill'
  });
};

/**
 * Schedule to remove dirt at pegman's current location.
 */
Maze.scheduleDig = function() {
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
Maze.scheduleLook = function(d) {
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
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(' + d + ' 0 0) scale(.4)');
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
Maze.scheduleLookStep = function(path, delay) {
  timeoutList.setTimeout(function() {
    path.style.display = 'inline';
    window.setTimeout(function() {
      path.style.display = 'none';
    }, stepSpeed * 2);
  }, delay);
};

function atFinish () {
  return !Maze.finish_ ||
      (Maze.pegmanX == Maze.finish_.x && Maze.pegmanY == Maze.finish_.y);
}

function isDirtCorrect () {
  if(!Maze.dirt_) {
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
Maze.checkSuccess = function() {
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

},{"../../locale/current/common":258,"../StudioApp":4,"../codegen":55,"../dom":58,"../dropletUtils":59,"../templates/page.html.ejs":232,"../timeoutList":238,"../utils":253,"./api":98,"./bee":99,"./beeItemDrawer":101,"./controls.html.ejs":103,"./dirtDrawer":104,"./dropletConfig":105,"./executionInfo":106,"./extraControlRows.html.ejs":107,"./mazeUtils":113,"./scrat":115,"./tiles":118,"./visualization.html.ejs":123,"./wordsearch":124}],124:[function(require,module,exports){
var utils = require('../utils');
var _ = utils.getLodash();
var cellId = require('./mazeUtils').cellId;

var SquareType = require('./tiles').SquareType;

var SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Create a new WordSearch.
 */
var WordSearch = module.exports = function (goal, map, drawTileFn) {
  this.goal_ = goal;
  this.visited_ = '';
  this.map_ = map;
};

var ALL_CHARS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

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
  return ((map[row] !== undefined) &&
    (map[row][col] !== undefined) &&
    (map[row][col] !== SquareType.WALL));
};

/**
 * Given a row and col, returns the row, col pair of any non-wall neighbors
 */
WordSearch.prototype.openNeighbors_ =function (row, col) {
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
  for (var i = 0; i < neighbors.length; i ++) {
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
  if (typeof(val) === "number") {
    return START_CHAR;
  }

  if (typeof(val) === "string") {
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
function randomLetter (restrictions) {
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

},{"../utils":253,"./mazeUtils":113,"./tiles":118}],123:[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze">\n  <g id="look">\n    <path d="M 0,-15 a 15 15 0 0 1 15 15" />\n    <path d="M 0,-35 a 35 35 0 0 1 35 35" />\n    <path d="M 0,-55 a 55 55 0 0 1 55 55" />\n  </g>\n</svg>\n<div id="capacityBubble">\n  <div id="capacity"></div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":274}],115:[function(require,module,exports){
var SquareType = require('./tiles').SquareType;
var utils = require('../utils');
var _ = utils.getLodash();

var TILE_SHAPES = {
  'log':             [0, 0],
  'lily1':           [1, 0],
  'land1':           [2, 0],
  'island_start':    [0, 1],
  'island_topRight': [1, 1],
  'island_botLeft':  [0, 2],
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
function isWaterOrOutOfBounds (x, y) {
  return Maze.map[y] === undefined || Maze.map[y][x] === undefined ||
    Maze.map[y][x] === SquareType.WALL;
}

// Returns true if the tile at x,y is a water tile that is in bounds.
function isWater (x, y) {
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
      if (!isWater(col, row) || !isWater(col + 1, row) ||
        !isWater(col, row + 1) || !isWater(col + 1, row + 1)) {
        continue;
      }
      possibleIslandLocations.push({row: row, col: col});
    }
  }
  var island = _.sample(possibleIslandLocations);
  var preFilled = {};
  if (island) {
    preFilled[(island.row + 0) + "_" + (island.col + 0)] = 'island_start';
    preFilled[(island.row + 1) + "_" + (island.col + 0)] = 'island_botLeft';
    preFilled[(island.row + 0) + "_" + (island.col + 1)] = 'island_topRight';
    preFilled[(island.row + 1) + "_" + (island.col + 1)] = 'island_botRight';
  }

  var tileId = 0;
  var tile;
  for (row = 0; row < Maze.ROWS; row++) {
    for (col = 0; col < Maze.COLS; col++) {
      if (!isWaterOrOutOfBounds(col, row)) {
        tile = 'ice';
      } else {
        var adjacentToPath = !isWaterOrOutOfBounds(col, row - 1) ||
          !isWaterOrOutOfBounds(col + 1, row) ||
          !isWaterOrOutOfBounds(col, row + 1) ||
          !isWaterOrOutOfBounds(col - 1, row);

        // if next to the path, always just have water. otherwise, there's
        // a chance of one of our other tiles
        tile = 'water';

        tile = preFilled[row + "_" + col];
        if (!tile) {
          tile = _.sample(['empty', 'empty', 'empty', 'empty', 'empty', 'lily2',
            'lily3', 'lily4', 'lily5', 'lily1', 'log', 'lily1', 'land1']);
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
module.exports.scheduleDance = function (victoryDance, timeAlloted) {
  var finishIcon = document.getElementById('finish');
  if (finishIcon) {
    finishIcon.setAttribute('visibility', 'hidden');
  }

  var numFrames = skin.celebratePegmanRow;
  var timePerFrame = timeAlloted / numFrames;
  var start = {x: Maze.pegmanX, y: Maze.pegmanY};

  scheduleSheetedMovement({x: start.x, y: start.y}, {x: 0, y: 0 },
    numFrames, timePerFrame, 'celebrate', Direction.NORTH, true);
};

},{"../utils":253,"./tiles":118}],110:[function(require,module,exports){
var Direction = require('./tiles').Direction;
var karelLevels = require('./karelLevels');
var wordsearchLevels = require('./wordsearchLevels');
var reqBlocks = require('./requiredBlocks');
var blockUtils = require('../block_utils');
var utils = require('../utils');
var mazeMsg = require('../../locale/current/maze');

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function(page, level) {
  return require('./toolboxes/maze.xml.ejs')({
    page: page,
    level: level
  });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function(page, level) {
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
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 1)
  },
  'k1_demo': {
    'toolbox': blockUtils.createToolbox(
      blockUtils.blockOfType('maze_moveNorth') +
      blockUtils.blockOfType('maze_moveSouth') +
      blockUtils.blockOfType('maze_moveEast') +
      blockUtils.blockOfType('maze_moveWest') +
      blockUtils.blockOfType('controls_repeat_simplified')
    ),
    'ideal': 4,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 1)
  },
  '2_2': {
    'toolbox': toolbox(2, 2),
    'ideal': 3,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD]
    ],
    'startDirection': Direction.SOUTH,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 2)
  },
  '2_2_5': {
    'toolbox': toolbox(2, 3),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0],
      [0, 0, 2, 1, 1, 0, 0, 0],
      [0, 0, 4, 0, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 3)
  },
  '2_3': {
    'toolbox': toolbox(2, 3),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 1, 3, 0, 0, 0],
      [0, 0, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 3)
  },
  '2_4': {
    'toolbox': toolbox(2, 4),
    'ideal': 9,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 4, 0, 3, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_5': {
    'toolbox': toolbox(2, 5),
    'ideal': 3,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.FOR_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_6': {
    'toolbox': toolbox(2, 6),
    'ideal': 4,
    'requiredBlocks': [
      [reqBlocks.TURN_RIGHT],
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.FOR_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 3, 0, 0, 0]
    ]
  },
  '2_7': {
    'toolbox': toolbox(2, 7),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.FOR_LOOP],
      [reqBlocks.TURN_LEFT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 2, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_8': {
    'toolbox': toolbox(2, 8),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.FOR_LOOP],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 3, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'startBlocks': startBlocks(2, 8),
    'levelIncompleteError': mazeMsg.repeatCarefullyError(),
    'tooFewBlocksMsg': mazeMsg.repeatCarefullyError()
  },
  '2_9': {
    'toolbox': toolbox(2, 9),
    'ideal': 3,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_10': {
    'toolbox': toolbox(2, 10),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 2, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_11': {
    'toolbox': toolbox(2, 11),
    'ideal': 6,
    'scale': {
      'stepSpeed': 3
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.WHILE_LOOP],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 3, 1],
      [0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0],
      [2, 1, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_12': {
    'toolbox': toolbox(2, 12),
    'ideal': 6,
    'scale': {
      'stepSpeed': 3
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.WHILE_LOOP],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [1, 0, 0, 0, 0, 0, 0, 0],
      [1, 2, 4, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 1, 1]
    ]
  },
  '2_13': {
    'toolbox': toolbox(2, 13),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.TURN_LEFT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 2, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 4, 0, 0]
    ],
    'startBlocks': startBlocks(2, 13)
  },
  '2_14': {
    'toolbox': toolbox(2, 14),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_RIGHT],
      [reqBlocks.IS_PATH_RIGHT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0],
      [0, 0, 2, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 4],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 3, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'levelIncompleteError': mazeMsg.ifInRepeatError(),
    'showPreviousLevelButton': true
  },
  '2_15': {
    'toolbox': toolbox(2, 15),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.IS_PATH_LEFT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.NORTH,
    'map': [
      [0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 3, 0, 1, 0, 0],
      [0, 1, 0, 1, 0, 1, 1, 4],
      [0, 1, 1, 1, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_16': {
    'toolbox': toolbox(2, 16),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_RIGHT],
      [reqBlocks.IS_PATH_RIGHT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.SOUTH,
    'map': [
      [0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 4],
      [0, 1, 1, 3, 0, 1, 0, 4],
      [0, 1, 0, 0, 0, 1, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_17': {
    'toolbox': toolbox(2, 17),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.IS_PATH_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 4, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0],
      [3, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 0, 1, 0],
      [1, 1, 1, 4, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 2, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_18': {
    'toolbox': toolbox(2, 18),
    'ideal': 5,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.IS_PATH_FORWARD],
      [reqBlocks.TURN_RIGHT],
      [reqBlocks.WHILE_LOOP]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 4, 0, 4, 0, 4, 0],
      [0, 0, 1, 0, 1, 0, 1, 0],
      [0, 2, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 1, 0, 1, 1, 0],
      [0, 1, 3, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '2_19': {
    'toolbox': toolbox(2, 19),
    'ideal': 7,
    'scale': {
      'stepSpeed': 2
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.NORTH,
    'map': [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 3, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1],
      [2, 0, 1, 1, 1, 1, 1, 1]
     ],
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
      'turnRight': null,
    },
    'requiredBlocks': [
       [reqBlocks.MOVE_FORWARD]
     ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '3_2': {
    'toolbox': toolbox(3, 2),
    'ideal': 4,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null,
    },
    'requiredBlocks': [
       [reqBlocks.MOVE_FORWARD]
     ],
    'startDirection': Direction.SOUTH,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '3_3': {
    'toolbox': toolbox(3, 3),
    'ideal': 6,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null,
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT],
      [reqBlocks.TURN_RIGHT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 1, 3, 0, 0, 0],
      [0, 0, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  '3_4': {
    'toolbox': toolbox(3, 4),
    'ideal': 8,
    'editCode': true,
    'codeFunctions': {
      'moveForward': null,
      'turnLeft': null,
      'turnRight': null,
    },
    'requiredBlocks': [
      [reqBlocks.MOVE_FORWARD],
      [reqBlocks.TURN_LEFT]
    ],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 4, 3, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  'custom': {
    'toolbox': toolbox(3, 4),
    'requiredBlocks': [],
    'startDirection': Direction.EAST,
    'map': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 4, 3, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
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

},{"../../locale/current/maze":262,"../block_utils":27,"../utils":253,"./karelLevels":108,"./requiredBlocks":114,"./startBlocks.xml.ejs":117,"./tiles":118,"./toolboxes/maze.xml.ejs":122,"./wordsearchLevels":125}],125:[function(require,module,exports){
var Direction = require('./tiles').Direction;
var reqBlocks = require('./requiredBlocks');
var blockUtils = require('../block_utils');

var wordSearchToolbox = function () {
  return blockUtils.createToolbox(
    blockUtils.blockOfType('maze_moveNorth') +
    blockUtils.blockOfType('maze_moveSouth') +
    blockUtils.blockOfType('maze_moveEast') +
    blockUtils.blockOfType('maze_moveWest')
  );
};

/*
 * Configuration for all levels.
 */
module.exports = {
  'k_1': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
    ],
    'startDirection': Direction.EAST,
    'searchWord': 'EAST',
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, 'E', 'A', 'S', 'T', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', 'K', 'E', 'L', 'L', 'Y', 'B', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveEast')
  },
  'k_2': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveSouth],
    ],
    'searchWord': 'SOUTH',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['A', 'N', 'G', 'I', 'E', 'D', 'O', 'G'],
      ['_', '_', '_',   2, '_', '_', '_', '_'],
      ['_', '_', '_', 'S', '_', '_', '_', '_'],
      ['_', '_', '_', 'O', '_', '_', '_', '_'],
      ['_', '_', '_', 'U', '_', '_', '_', '_'],
      ['_', '_', '_', 'T', '_', '_', '_', '_'],
      ['_', '_', '_', 'H', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveSouth')
  },
  'k_3': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveWest]
    ],
    'searchWord': 'WEST',
    'startDirection': Direction.WEST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['L', 'E', 'V', 'E', 'N', 'S', 'O', 'N'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',  'T', 'S', 'E', 'W', 2, '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ],
    'startBlocks': blockUtils.blockOfType('maze_moveWest')
  },
  'k_4': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'NORTH',
    'startDirection': Direction.NORTH,
    step: true,
    // When this gets removed, also remove the hack from letterValue
    map: [
      ['_', '_', '_', '_', 'G', '_', '_', '_'],
      ['_', '_', 'H', '_', 'O', '_', '_', '_'],
      ['_', '_', 'T', '_', '_4', '_', '_', '_'],
      ['_', '_', 'R', '_', 'I', '_', '_', '_'],
      ['_', '_', 'O', '_', 'T', '_', '_', '_'],
      ['_', '_', 'N', '_', 'J', '_', '_', '_'],
      ['_', '_',  2 , '_', 'R', '_', '_', '_'],
      ['_', '_', '_', '_', 'F', '_', '_', '_']
    ]
  },
  'k_6': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'JUMP',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['S', '_', '_', '_', '_', '_', '_', '_'],
      ['A', '_', '_', '_', '_', '_', '_', '_'],
      ['Y', '_',   2, 'J', 'U', 'M', '_', '_'],
      ['E', '_', '_', '_', '_', 'P', '_', '_'],
      ['E', '_', '_', '_', '_', '_', '_', '_'],
      ['D', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_9': {
    'toolbox': wordSearchToolbox(),
    'ideal': 5,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'CODE',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', 'M', '_'],
      ['_', '_', '_', '_', '_', '_', 'A', '_'],
      ['_', '_', '_', '_', '_', '_', 'R', '_'],
      ['_', '_', '_', 'D', 'E', '_', 'K', '_'],
      ['_',   2, 'C', 'O', '_', '_', 'N', '_'],
      ['_', '_', '_', '_', '_', '_', 'P', '_'],
      ['_', '_', '_', '_', '_', '_', 'A', '_'],
      ['_', '_', '_', '_', '_', '_', 'M', '_']
    ]
  },
  'k_13': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'DEBUG',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_',   2, 'D', 'E', '_', '_', '_', '_'],
      ['_', '_', '_', 'B', '_', '_', '_', '_'],
      ['_', '_', '_', 'U', 'G', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', 'H', 'E', 'N', 'R', 'Y'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_15': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveSouth],
      [reqBlocks.moveEast]
    ],
    'searchWord': 'ABOVE',
    'startDirection': Direction.SOUTH,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, '_', '_', '_', '_', '_'],
      ['_', '_', 'A', '_', '_', '_', '_', '_'],
      ['_', '_', 'B', 'O', '_', '_', '_', '_'],
      ['_', '_', '_', 'V', 'E', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_16': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveNorth]
    ],
    'searchWord': 'BELOW',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', 'W', '_', '_', '_'],
      ['_', '_', '_', '_', 'O', '_', '_', '_'],
      ['_', '_', '_', 'E', 'L', '_', '_', '_'],
      ['_', '_',   2, 'B', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  },
  'k_20': {
    'isK1': true,
    'toolbox': wordSearchToolbox(),
    'ideal': 6,
    'requiredBlocks': [
      [reqBlocks.moveEast],
      [reqBlocks.moveSouth]
    ],
    'searchWord': 'STORY',
    'startDirection': Direction.EAST,
    step: true,
    map: [
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_',   2, 'S', 'T', '_', '_', '_'],
      ['_', '_', '_', '_', 'O', '_', '_', '_'],
      ['_', '_', '_', '_', 'R', '_', '_', '_'],
      ['_', '_', '_', '_', 'Y', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_'],
      ['_', '_', '_', '_', '_', '_', '_', '_']
    ]
  }

};

},{"../block_utils":27,"./requiredBlocks":114,"./tiles":118}],122:[function(require,module,exports){
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
 buf.push('<xml id="toolbox" style="display: none;">\n  <block type="maze_moveForward"></block>\n  <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n  <block type="maze_turn"><title name="DIR">turnRight</title></block>\n  ');5; if (page == 1) {; buf.push('    ');5; if (level > 2) {; buf.push('      <block type="maze_forever"></block>\n      ');6; if (level == 5) {; buf.push('        <block type="maze_if"><title name="DIR">isPathLeft</title></block>\n      ');7; } else if (level > 5 && level < 9) {; buf.push('        <block type="maze_if"></block>\n      ');8; }; buf.push('      ');8; if (level > 8) {; buf.push('       <block type="maze_ifElse"></block>\n      ');9; }; buf.push('    ');9; }; buf.push('  ');9; } else if (page == 2) {; buf.push('    ');9; if (level > 4 && level < 9) {; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">5</title>\n      </block>\n    ');12; }; buf.push('    ');12; if (level > 8) {; buf.push('      <block type="maze_forever"></block>\n      ');13; if (level == 13 || level == 15) {; buf.push('        <block type="maze_if"><title name="DIR">isPathLeft</title></block>\n      ');14; } else if (level == 14 || level == 16) {; buf.push('        <block type="maze_if"><title name="DIR">isPathRight</title></block>\n      ');15; }; buf.push('      ');15; if (level > 16) {; buf.push('       <block type="maze_ifElse"></block>\n      ');16; }; buf.push('    ');16; }; buf.push('  ');16; }; buf.push('</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":274}],117:[function(require,module,exports){
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
 buf.push('');1; if (page == 2) {; buf.push('  ');1; if (level < 4) {; buf.push('    <block type="maze_moveForward" x="70" y="70"></block>\n  ');2; } else if (level == 8) {; buf.push('    <block type="controls_repeat" x="70" y="70" editable="false"\n      deletable="false">\n      <title name="TIMES">3</title>\n    </block>\n  ');6; } else if (level == 13) {; buf.push('    <block type="maze_forever" x="20" y="70" editable="false" deletable="false">\n      <statement name="DO">\n        <block type="maze_moveForward" editable="false" deletable="false">\n          <next>\n            <block type="maze_if" editable="false" deletable="false">\n              <title name="DIR">isPathLeft</title>\n            </block>\n          </next>\n        </block>\n      </statement>\n    </block>\n  ');17; } else if (level == 19) {; buf.push('    <block type="maze_forever" x="20" y="70" editable="false" deletable="false">\n      <statement name="DO">\n        <block type="maze_ifElse" editable="false" deletable="false">\n          <title name="DIR">isPathForward</title>\n          <statement name="ELSE">\n            <block type="maze_ifElse" editable="false" deletable="false">\n              <title name="DIR">isPathRight</title>\n            </block>\n          </statement>\n        </block>\n      </statement>\n    </block>\n  ');29; }; buf.push('');29; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":274}],114:[function(require,module,exports){
var requiredBlockUtils = require('../required_block_utils');

var MOVE_FORWARD = {'test': 'moveForward', 'type': 'maze_moveForward'};
var TURN_LEFT = {'test': 'turnLeft', 'type': 'maze_turn', 'titles': {'DIR': 'turnLeft'}};
var TURN_RIGHT = {'test': 'turnRight', 'type': 'maze_turn', 'titles': {'DIR': 'turnRight'}};
var WHILE_LOOP = {'test': 'while', 'type': 'maze_forever'};
var IS_PATH_LEFT = {'test': 'isPathLeft', 'type': 'maze_if', 'titles': {'DIR': 'isPathLeft'}};
var IS_PATH_RIGHT = {'test': 'isPathRight', 'type': 'maze_if', 'titles': {'DIR': 'isPathRight'}};
var IS_PATH_FORWARD = {'test': 'isPathForward', 'type': 'maze_ifElse', 'titles': {'DIR': 'isPathForward'}};
var FOR_LOOP = {'test': 'for', 'type': 'controls_repeat', titles: {TIMES: '???'}};

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

},{"../required_block_utils":205}],108:[function(require,module,exports){
/*jshint multistr: true */

var levelBase = require('../level_base');
var Direction = require('./tiles').Direction;
var msg = require('../../locale/current/maze');
var blockUtils = require('../block_utils');

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function(page, level) {
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
  return template({level: level});
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function(page, level) {
  return require('./karelStartBlocks.xml.ejs')({
    page: page,
    level: level
  });
};

// This tests for and creates the "move_forward" block.
var MOVE_FORWARD = {
    'test': function(block) {
      return block.type == 'maze_moveForward';},
    'type': 'maze_moveForward'
};

// This tests for and creates the "dig" block.
var DIG = {'test': 'dig', 'type': 'maze_dig'};

// This tests for and creates the "fill" block.
var FILL = {'test': 'fill', 'type': 'maze_fill'};

// This tests for and creates the "controls_repeat" block.
var REPEAT = {
    'test': function(block) {
      return block.type == 'controls_repeat';},
    'type': 'controls_repeat',
    'titles': {'TIMES': '???'}
};

// This tests for and creates the "controls_repeat_ext" block.
var REPEAT_EXT = {
    'test': function(block) {
      return block.type == 'controls_repeat_ext';},
    'type': 'controls_repeat_ext'
};

// This tests for and creates the "controls_for" block.
var CONTROLS_FOR = {
    'test': function(block) {
      return block.type == 'controls_for';},
    'type': 'controls_for'
};

// This tests for and creates the "variables_get" block.
var VARIABLES_GET = {
    'test': function(block) {
      return block.type == 'variables_get';},
    'type': 'variables_get',
    'titles': {'VAR': 'i'}
};

// This tests for and creates the "maze_turn" block turning left.
var TURN_LEFT = {
  'test': 'turnLeft',
  'type': 'maze_turn',
  'titles': {'DIR': 'turnLeft'}
};

// This tests for and creates the "maze_turn" block turning right.
var TURN_RIGHT = {
  'test': 'turnRight',
  'type': 'maze_turn',
  'titles': {'DIR': 'turnRight'}
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
  'titles': {'DIR': 'pilePresent'}
};

// This tests for and creates the "maze_untilBlockedOrNotClear" block with the option "holePresent" selected.
var WHILE_OPT_HOLE_PRESENT = {
  'test': 'while (Maze.holePresent',
  'type': 'maze_untilBlockedOrNotClear',
  'titles': {'DIR': 'holePresent'}
};

// This tests for and creates the "maze_untilBlockedOrNotClear" block with the option "isPathForward" selected.
var WHILE_OPT_PATH_AHEAD = {
  'test': 'while (Maze.isPathForward',
  'type': 'maze_untilBlockedOrNotClear',
  'titles': {'DIR': 'isPathForward'}
};

// This tests for and creates the "karel_if" block.
var IF = {'test': 'if', 'type': 'karel_if'};

// This tests for and creates the "karel_if" block with the option "pilePresent" selected.
var IF_OPT_PILE_PRESENT = {
  'test': 'if (Maze.pilePresent',
  'type': 'karel_if',
  'titles': {'DIR': 'pilePresent'}
};

// This tests for and creates the "karel_if" block with the option "holePresent" selected.
var IF_OPT_HOLE_PRESENT = {
  'test': 'if (Maze.holePresent',
  'type': 'karel_if',
  'titles': {'DIR': 'holePresent'}
};

// This tests for and creates the "karel_ifElse" block.
var IF_ELSE = {'test': '} else {', 'type': 'karel_ifElse'};

// This tests for and creates the "fill num" block.
var fill = function(num) {
  return {'test': function(block) {
            return block.getTitleValue('NAME') == msg.fillN({shovelfuls: num});
          },
          'type': 'procedures_callnoreturn',
          'titles': {'NAME': msg.fillN({shovelfuls: num})}};
};

// This tests for and creates the "remove num" blcok.
var remove = function(num) {
  return {'test': function(block) {
            return block.getTitleValue('NAME') ==
                msg.removeN({shovelfuls: num});
          },
          'type': 'procedures_callnoreturn',
          'titles': {'NAME': msg.removeN({shovelfuls: num})}};
};

// This tests for and creates the "avoid the cow and remove 1" block.
var AVOID_OBSTACLE_AND_REMOVE = {
  'test': function(block) {
    return block.getTitleValue('NAME') == msg.avoidCowAndRemove();
  },
  'type': 'procedures_callnoreturn',
  'titles': {'NAME': msg.avoidCowAndRemove()}
};

// This tests for and creates the "remove 1 and avoid the cow" block.
var REMOVE_AND_AVOID_OBSTACLE = {
  'test': function(block) {
    return block.getTitleValue('NAME') == msg.removeAndAvoidTheCow();
  },
  'type': 'procedures_callnoreturn',
  'titles': {'NAME': msg.removeAndAvoidTheCow()}
};

// This tests for and creates the "remove piles" block.
var REMOVE_PILES = {
  'test': function(block) {
    return block.getTitleValue('NAME') == msg.removeStack({shovelfuls: 4});
  },
  'type': 'procedures_callnoreturn',
  'titles': {'NAME': msg.removeStack({shovelfuls: 4})}
};

// This tests for and creates the "fill holes" block.
var FILL_HOLES = {
  'test': function(block) {
    return block.getTitleValue('NAME') == msg.fillStack({shovelfuls: 2});
  },
  'type': 'procedures_callnoreturn',
  'titles': {'NAME': msg.fillStack({shovelfuls: 2})}
};

module.exports = {

  // Formerly page 1
  '1_1': {
    'toolbox': toolbox(1, 1),
    'startBlocks': startBlocks(1, 1),
    'ideal': 6,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG]
    ],
    'scale': {
      'snapRadius': 2.0
    },
    'map': [
      [ 0, 0, 0, 0, 0, 1, 1, 1 ],
      [ 0, 1, 1, 0, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_2': {
    'toolbox': toolbox(1, 2),
    'startBlocks': startBlocks(1, 2),
    'ideal': 4,
    'requiredBlocks': [
      [MOVE_FORWARD], [FILL]
    ],
    'map': [
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 1, 0, 0, 0, 0 ],
      [ 0, 1, 2, 1, 0, 0, 0, 0 ],
      [ 0, 1, 1, 1, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, -2, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_3': {
    'toolbox': toolbox(1, 3),
    'startBlocks': startBlocks(1, 3),
    'ideal': 4,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [REPEAT]
    ],
    'map': [
      [ 1, 1, 1, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 1, 2, 1, 0 ],
      [ 0, 0, 0, 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.SOUTH,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 10, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_4': {
    'toolbox': toolbox(1, 4),
    'ideal': 5,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [TURN_LEFT], [REPEAT]
    ],
    'map': [
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 2, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_5': {
    'toolbox': toolbox(1, 5),
    'startBlocks': startBlocks(1, 5),
    'ideal': 6,
    'requiredBlocks': [
      [MOVE_FORWARD], [FILL], [REPEAT], [UNTIL_BLOCKED]
    ],
    'scale': {
      'stepSpeed': 2
    },
    'map': [
      [ 1, 1, 0, 0, 0, 0, 0, 0 ],
      [ 1, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 1, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, -5, -5, -5, -5, -5, 0, 0 ]
    ]
  },

  '1_6': {
    'toolbox': toolbox(1, 6),
    'ideal': 4,
    'requiredBlocks': [
      [MOVE_FORWARD],
      [DIG],
      [WHILE_OPT_PILE_PRESENT, REPEAT, WHILE_OPT_PATH_AHEAD]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 1, 1, 0, 1, 1, 0, 1, 1 ],
      [ 1, 1, 0, 2, 1, 0, 1, 1 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 1, 1, 0, 1, 1, 0, 1, 1 ],
      [ 1, 1, 0, 1, 1, 0, 1, 1 ]
    ],
    'startDirection': Direction.SOUTH,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_7': {
    'toolbox': toolbox(1, 7),
    'startBlocks': startBlocks(1, 7),
    'ideal': 5,
    'requiredBlocks': [
      [TURN_RIGHT],
      [MOVE_FORWARD],
      [FILL],
      [WHILE_OPT_HOLE_PRESENT]
    ],
    'scale': {
      'stepSpeed': 2
    },
    'map': [
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 1, 1, 1, 0, 0, 0, 0, 1 ],
      [ 0, 1, 1, 2, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 1, 0 ],
      [ 1, 0, 0, 0, 0, 1, 1, 1 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, -18, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_8': {
    'toolbox': toolbox(1, 8),
    'ideal': 4,
    'requiredBlocks': [
      [MOVE_FORWARD],
      [FILL],
      [WHILE_OPT_PATH_AHEAD, REPEAT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, -1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_9': {
    'toolbox': toolbox(1, 9),
    'ideal': 10,
    'requiredBlocks': [
      [MOVE_FORWARD],
      [DIG],
      [WHILE_OPT_PATH_AHEAD, REPEAT],
      [TURN_LEFT]
    ],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 1, 1, 0, 1, 0, 0, 0 ],
      [ 0, 1, 1, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 1, 1, 1, 1, 0, 0, 0 ]
    ]
  },

  '1_10': {
    'toolbox': toolbox(1, 10),
    'startBlocks': startBlocks(1, 10),
    'ideal': 5,
    'requiredBlocks': [
      [MOVE_FORWARD],
      [DIG],
      [IF_OPT_PILE_PRESENT],
      [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 0, 0, 1, 1, 0, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '1_11': {
    'toolbox': toolbox(1, 11),
    'startBlocks': startBlocks(1, 11),
    'ideal': 7,
    'requiredBlocks': [
      [MOVE_FORWARD],
      [DIG],
      [FILL],
      [IF_OPT_PILE_PRESENT],
      [IF_OPT_HOLE_PRESENT],
      [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 2.5
    },
    'map': [
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 1, 1, 1, 0, 0, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, -1, 0, 0, -1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  // Formerly page 2

  '2_1': {
    'toolbox': toolbox(2, 1),
    'startBlocks': startBlocks(2, 1),
    'ideal': null,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [FILL], [TURN_LEFT, TURN_RIGHT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 0, 1, 0, 0, 0, 0, 0 ],
      [ 1, 0, 1, 0, 0, 0, 0, 0 ],
      [ 1, -1, 1, 0, 0, 0, 0, 0 ],
      [ 1, -1, 1, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_2': {
    'toolbox': toolbox(2, 2),
    'startBlocks': startBlocks(2, 2),
    'ideal': 6,
    'requiredBlocks': [
      [MOVE_FORWARD], [fill(5)]
    ],
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 1, 1, 1, 1, 0 ],
      [ 0, 1, 0, 0, 0, 0, 1, 0 ],
      [ 0, 1, 0, 2, 1, 0, 1, 0 ],
      [ 0, 1, 0, 1, 1, 0, 1, 0 ],
      [ 0, 1, 0, 0, 0, 0, 1, 0 ],
      [ 0, 1, 1, 1, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, -5, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_3': {
    'toolbox': toolbox(2, 3),
    'startBlocks': startBlocks(2, 3),
    'ideal': 8,
    'requiredBlocks': [
      [MOVE_FORWARD], [fill(5)], [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 2
    },
    'map': [
      [ 0, 1, 1, 1, 1, 1, 1, 0 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 0, 2, 1, 1, 1, 1, 1, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, -5, -5, -5, -5, -5, 0 ]
    ]
  },

  '2_4': {
    'toolbox': toolbox(2, 4),
    'startBlocks': startBlocks(2, 4),
    'ideal': 13,
    'requiredBlocks': [
      [DIG],
      [REPEAT],
      [remove(7)],
      [MOVE_FORWARD],
      [TURN_LEFT],
      [TURN_RIGHT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 1, 1, 1, 1, 0, 0, 1, 1 ],
      [ 1, 1, 1, 0, 0, 1, 1, 1 ],
      [ 1, 1, 0, 0, 1, 1, 1, 0 ],
      [ 1, 0, 0, 1, 1, 1, 0, 0 ],
      [ 0, 0, 1, 1, 1, 0, 0, 1 ],
      [ 0, 1, 2, 1, 0, 0, 1, 1 ],
      [ 1, 1, 1, 0, 0, 1, 1, 1 ],
      [ 1, 1, 0, 0, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 7, 0, 0 ],
      [ 0, 0, 0, 0, 7, 0, 0, 0 ],
      [ 0, 0, 0, 7, 0, 0, 0, 0 ],
      [ 0, 0, 7, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_5': {
    'toolbox': toolbox(2, 5),
    'startBlocks': startBlocks(2, 5),
    'ideal': 8,
    'requiredBlocks': [
      [DIG],
      [REPEAT],
      [remove(6)],
      [MOVE_FORWARD]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 1, 2, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 6, 0, 6, 0, 6, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_6': {
    'toolbox': toolbox(2, 6),
    'startBlocks': startBlocks(2, 6),
    'ideal': 11,
    'requiredBlocks': [
      [remove(8)], [fill(8)], [MOVE_FORWARD], [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 1, 1, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 1, 1, 1, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 8, 0, 0, 0, 0, 0, 0, -8 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_7': {
    'toolbox': toolbox(2, 7),
    'startBlocks': startBlocks(2, 7),
    'ideal': 11,
    'requiredBlocks': [
      [TURN_LEFT], [MOVE_FORWARD], [TURN_RIGHT], [DIG]
    ],
    'map': [
      [ 1, 1, 0, 0, 0, 1, 1, 1 ],
      [ 1, 1, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 1, 0, 0, 0 ],
      [ 0, 0, 2, 4, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_8': {
    'toolbox': toolbox(2, 8),
    'startBlocks': startBlocks(2, 8),
    'ideal': 13,
    'requiredBlocks': [
      [REPEAT], [AVOID_OBSTACLE_AND_REMOVE]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 2, 4, 1, 4, 1, 4, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 0, 1, 0, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  '2_9': {
    'toolbox': toolbox(2, 9),
    'startBlocks': startBlocks(2, 9),
    'ideal': 14,
    'requiredBlocks': [
      [REMOVE_PILES],
      [MOVE_FORWARD],
      [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 0, 0 ]
    ]
  },

  '2_10': {
    'toolbox': toolbox(2, 10),
    'startBlocks': startBlocks(2, 10),
    'ideal': 27,
    'requiredBlocks': [
      [REMOVE_PILES],
      [MOVE_FORWARD],
      [FILL_HOLES],
      [IF_OPT_PILE_PRESENT, IF_ELSE],
      [UNTIL_BLOCKED, REPEAT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 0, 1, 0, 0, 1, 0, 0 ],
      [ 1, 0, 1, 0, 0, 1, 0, 0 ],
      [ 1, -1, 1, -1, -1, 1, -1, 0 ],
      [ 1, -1, 1, -1, -1, 1, -1, 0 ]
    ]
  },

  // Page 3 to Debug

  'debug_seq_1': {
    'toolbox': toolbox(3, 1),
    'startBlocks': startBlocks(3, 1),
    'ideal': 8,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [FILL], [TURN_LEFT], [TURN_RIGHT]
    ],
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 4, 1, 1, 0, 0, 0 ],
      [ 0, 0, 2, 1, 4, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 1, 1, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, -1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_seq_2': {
    'toolbox': toolbox(3, 2),
    'startBlocks': startBlocks(3, 2),
    'ideal': 7,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [TURN_LEFT]
    ],
    'map': [
      [ 1, 1, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 1, 0 ],
      [ 0, 0, 2, 1, 1, 0, 1, 0 ],
      [ 0, 0, 1, 1, 1, 0, 1, 0 ],
      [ 0, 0, 1, 1, 1, 0, 0, 0 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 1, 0, 0, 0, 0, 0, 1 ]
    ],
    'startDirection': Direction.SOUTH,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_repeat': {
    'toolbox': toolbox(3, 3),
    'startBlocks': startBlocks(3, 3),
    'ideal': 12,
    'requiredBlocks': [
      [MOVE_FORWARD], [DIG], [TURN_LEFT], [TURN_RIGHT], [REPEAT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 1, 1, 1, 1, 0, 1 ],
      [ 1, 0, 1, 2, 1, 1, 0, 1 ],
      [ 1, 0, 1, 1, 1, 1, 0, 1 ],
      [ 1, 0, 1, 1, 1, 1, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ]
    ],
    'startDirection': Direction.SOUTH,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 5, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 7, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_while': {
    'toolbox': toolbox(3, 4),
    'startBlocks': startBlocks(3, 4),
    'ideal': 5,
    'requiredBlocks': [
      [MOVE_FORWARD], [REPEAT], [FILL], [WHILE_OPT_HOLE_PRESENT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 1, 0, 0, 1, 1, 0 ],
      [ 0, 0, 1, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 2, 1, 1, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, -15, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_if': {
    'toolbox': toolbox(3, 5),
    'startBlocks': startBlocks(3, 5),
    'ideal': 8,
    'requiredBlocks': [
      [MOVE_FORWARD], [TURN_LEFT], [TURN_RIGHT],
      [REPEAT], [DIG], [IF_OPT_PILE_PRESENT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 1 ],
      [ 0, 0, 0, 1, 1, 0, 1, 1 ],
      [ 0, 0, 1, 1, 0, 1, 1, 0 ],
      [ 0, 1, 1, 0, 1, 1, 0, 1 ],
      [ 2, 1, 0, 1, 1, 0, 1, 1 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 1, 0, 0 ],
      [ 0, 0, 0, 0, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_if_else': {
    'toolbox': toolbox(3, 6),
    'startBlocks': startBlocks(3, 6),
    'ideal': 10,
    'requiredBlocks': [
      [MOVE_FORWARD], [TURN_LEFT], [TURN_RIGHT],
      [REPEAT], [DIG], [FILL], [IF_ELSE, IF_OPT_HOLE_PRESENT]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 1, 1, 0, 1 ],
      [ 0, 0, 0, 1, 1, 0, 1, 1 ],
      [ 0, 0, 1, 1, 0, 1, 1, 0 ],
      [ 0, 1, 1, 0, 1, 1, 0, 1 ],
      [ 1, 1, 0, 1, 1, 0, 1, 1 ],
      [ 1, 0, 1, 1, 0, 1, 1, 0 ],
      [ 0, 1, 1, 0, 1, 1, 0, 0 ],
      [ 2, 1, 0, 1, 1, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, -1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 0 ],
      [ 0, 0, 0, 0, 0, 1, 0, 0 ],
      [ 0, 0, 0, 0, -1, 0, 0, 0 ],
      [ 0, 0, 0, -1, 0, 0, 0, 0 ],
      [ 0, 0, 1, 0, 0, 0, 0, 0 ],
      [ 0, -1, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_function_1': {
    'toolbox': toolbox(3, 7),
    'startBlocks': startBlocks(3, 7),
    'ideal': 8,
    'requiredBlocks': [
      [MOVE_FORWARD], [TURN_LEFT], [REPEAT], [DIG]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 1, 1, 0, 0 ],
      [ 0, 0, 1, 0, 0, 1, 0, 0 ],
      [ 0, 0, 1, 0, 0, 1, 0, 0 ],
      [ 0, 0, 2, 1, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 1, 1, 0, 0 ],
      [ 0, 0, 1, 0, 0, 1, 0, 0 ],
      [ 0, 0, 1, 0, 0, 1, 0, 0 ],
      [ 0, 0, 1, 1, 1, 1, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_function_2': {
    'toolbox': toolbox(3, 8),
    'startBlocks': startBlocks(3, 8),
    'ideal': 17,
    'requiredBlocks': [
      [MOVE_FORWARD], [TURN_LEFT], [REPEAT], [DIG], [FILL],
      [levelBase.call(msg.fillSquare())],
      [levelBase.call(msg.removeSquare())]
    ],
    'scale': {
      'stepSpeed': 3
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 0, 1, 0, 0, 1, 0, 1 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 1, 1, 0, 0, -1, -1, -1 ],
      [ 1, 0, 1, 0, 0, -1, 0, -1 ],
      [ 1, 1, 1, 0, 0, -1, -1, -1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
  },

  'debug_function_3': {
    'toolbox': toolbox(3, 9),
    'startBlocks': startBlocks(3, 9),
    'ideal': 12,
    'requiredBlocks': [
      [MOVE_FORWARD], [REPEAT_EXT], [DIG], [CONTROLS_FOR],
      [levelBase.callWithArg(msg.removePile(), msg.heightParameter())],
      [VARIABLES_GET]
    ],
    'scale': {
      'stepSpeed': 2
    },
    'map': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 1, 2, 1, 1, 1, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 1, 1, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 2, 3, 4, 5, 6, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ]
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
      <block type="bee_whileNectarAmount"></block>'
    ),
    'startBlocks': startBlocks(1, 1),
    'requiredBlocks': [
    ],
    'scale': {
      'snapRadius': 2.0
    },
    honeyGoal: 1,
    // nectarGoal: 2,
    step: true,
    'map': [
      [ 0, 0, 0, 0, 0, 1, 1, 1 ],
      [ 0, 1, 1, 0, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 1, 1, 1 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 2, 'P', 1, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ],
      [ 0, 0, 1, 1, 0, 0, 0, 0 ]
    ],
    'startDirection': Direction.EAST,
    'initialDirt': [
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 3, -1, 0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ],
      [ 0, 0,  0,  0, 0, 0, 0, 0 ]

    ]
  }
};

},{"../../locale/current/maze":262,"../block_utils":27,"../level_base":96,"./karelStartBlocks.xml.ejs":109,"./tiles":118,"./toolboxes/karel1.xml.ejs":119,"./toolboxes/karel2.xml.ejs":120,"./toolboxes/karel3.xml.ejs":121}],121:[function(require,module,exports){
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
 buf.push('');1;

var msg = require('../../../locale/current/common');

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
},{"../../../locale/current/common":258,"ejs":274}],120:[function(require,module,exports){
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
 buf.push('');1;

var commonMsg = require('../../../locale/current/common');
var mazeMsg = require('../../../locale/current/maze');

var addProcedures = function() {; buf.push('  ');6; if (level > 3) {; buf.push('    <category name="', escape((6,  commonMsg.catProcedures() )), '" custom="PROCEDURE"></category>\n  ');7; } else if (level == 2 || level == 3) {; buf.push('    <category name="', escape((7,  commonMsg.catProcedures() )), '">\n      <block type="procedures_callnoreturn">\n        <mutation name="', escape((9,  mazeMsg.fillN({shovelfuls: 5}) )), '"></mutation>\n      </block>\n    </category>\n  ');12; }; buf.push('  ');12; if (level < 9) {; buf.push('    <category name="', escape((12,  commonMsg.catLogic() )), '">\n      <block type="karel_if"></block>\n    </category>\n  ');15; } else if (level > 8) {; buf.push('    <category name="', escape((15,  commonMsg.catLogic() )), '">\n      <block type="karel_if"></block>\n      <block type="karel_ifElse"></block>\n    </category>\n  ');19; }; buf.push('');19; };; buf.push('\n<xml id="toolbox" style="display: none;">\n  <category name="', escape((21,  commonMsg.catActions() )), '">\n    <block type="maze_moveForward"></block>\n    <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n    <block type="maze_turn"><title name="DIR">turnRight</title></block>\n    <block type="maze_dig"></block>\n    <block type="maze_fill"></block>\n  </category>\n  ');28; addProcedures(); buf.push('  <category name="', escape((28,  commonMsg.catLoops() )), '">\n    <block type="maze_untilBlocked"></block>\n    <block type="controls_repeat"></block>\n  </category>\n</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../../locale/current/common":258,"../../../locale/current/maze":262,"ejs":274}],119:[function(require,module,exports){
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
 buf.push('<xml id="toolbox" style="display: none;">\n  <block type="maze_moveForward"></block>\n  <block type="maze_turn"><title name="DIR">turnLeft</title></block>\n  <block type="maze_turn"><title name="DIR">turnRight</title></block>\n  <block type="maze_dig"></block>\n  ');6; if (level > 1) {; buf.push('    <block type="maze_fill"></block>\n    ');7; if (level > 2) {; buf.push('      <block type="controls_repeat">\n        <title name="TIMES">5</title>\n      </block>\n      ');10; if (level > 9) {; buf.push('        <block type="karel_if"></block>\n      ');11; }; buf.push('    ');11; }; buf.push('    ');11; if (level == 5 || level == 10 || level == 11) {; buf.push('      <block type="maze_untilBlocked"></block>\n    ');12; }; buf.push('    ');12; if (level > 5 && level < 8) {; buf.push('      <block type="maze_untilBlockedOrNotClear"></block>\n    ');13; }; buf.push('    ');13; if (level == 8 || level == 9) {; buf.push('      <block type="maze_untilBlockedOrNotClear">\n        <title name="DIR">isPathForward</title>\n      </block>\n    ');16; }; buf.push('  ');16; }; buf.push('</xml>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":274}],109:[function(require,module,exports){
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
 buf.push('');1;

var msg = require('../../locale/current/maze');

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
},{"../../locale/current/maze":262,"ejs":274}],107:[function(require,module,exports){
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
 buf.push('');1; var msg = require('../../locale/current/maze') ; buf.push('\n<div id="spelling-table-wrapper">\n  <table id="spelling-table" class="float-right">\n    <tr>\n      <td class="spellingTextCell">', escape((5,  msg.word() )), ':</td>\n      <td class="spellingButtonCell">\n        <button id="searchWord" class="spellingButton" disabled>\n          ');8; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n          <img src="', escape((9,  assetUrl('media/1x1.gif') )), '"/>', escape((9,  searchWord )), '\n        </button>\n      </td>\n    </tr>\n    <tr>\n      <td class="spellingTextCell">', escape((14,  msg.youSpelled() )), ':</td>\n      <td class="spellingButtonCell">\n        <button id="currentWord" class="spellingButton" disabled>\n          ');17; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n          <img src="', escape((18,  assetUrl('media/1x1.gif') )), '"><span id="currentWordContents"></span>\n        </button>\n      </td>\n    </tr>\n  </table>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/maze":262,"ejs":274}],106:[function(require,module,exports){
var utils = require('../utils');
var _ = utils.getLodash();

/**
 * Stores information about a current Maze execution.  Execution consists of a
 * series of steps, where each step may contain one or more actions.
 */
var ExecutionInfo = function (options) {
  options = options || {};
  this.terminated_ = false;
  this.terminationValue_ = null;  // See terminateWithValue method.
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
  var action = {command: command, blockId: blockId};
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
ExecutionInfo.prototype.checkTimeout = function() {
  if (this.ticks-- < 0) {
    this.terminateWithValue(Infinity);
  }
};

},{"../utils":253}],105:[function(require,module,exports){
var msg = require('../../locale/current/maze');

module.exports.blocks = [
  {'func': 'moveForward', 'category': 'Movement' },
  {'func': 'turnLeft', 'category': 'Movement' },
  {'func': 'turnRight', 'category': 'Movement' },
];

module.exports.categories = {
  'Movement': {
    'color': 'red',
    'blocks': []
  },
};

},{"../../locale/current/maze":262}],103:[function(require,module,exports){
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
 buf.push('');1; var msg = require('../../locale/current/maze') ; buf.push('\n\n<button id="stepButton" class="launch ', escape((3,  showStepButton ? '' : 'hide' )), ' float-right">\n  ');4; // splitting these lines causes an extra space to show up in front of the word, breaking centering 
; buf.push('\n  <img src="', escape((5,  assetUrl('media/1x1.gif') )), '">', escape((5,  msg.step() )), '\n</button>\n\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/maze":262,"ejs":274}],102:[function(require,module,exports){
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

var msg = require('../../locale/current/maze');
var commonMsg = require('../../locale/current/common');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');
var mazeUtils = require('./mazeUtils');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
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
    generateBlocksForAllDirections: function() {
      SimpleMove.generateBlocksForDirection("North");
      SimpleMove.generateBlocksForDirection("South");
      SimpleMove.generateBlocksForDirection("West");
      SimpleMove.generateBlocksForDirection("East");
    },
    generateBlocksForDirection: function(direction) {
      generator["maze_move" + direction] = SimpleMove.generateCodeGenerator(direction);
      blockly.Blocks['maze_move' + direction] = SimpleMove.generateMoveBlock(direction);
    },
    generateMoveBlock: function(direction) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];
      return {
        helpUrl: '',
        init: function () {
          this.setHSV(184, 1.00, 0.74);
          this.appendDummyInput()
            .appendTitle(new blockly.FieldLabel(directionConfig.letter, {fixedSize: {width: 12, height: 18}}))
            .appendTitle(new blockly.FieldImage(directionConfig.image));
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    },
    generateCodeGenerator: function(direction) {
      return function() {
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
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.maze_move.DIRECTIONS =
      [[msg.moveForward(), 'moveForward'],
       [msg.moveBackward(), 'moveBackward']];

  generator.maze_move = function() {
    // Generate JavaScript for moving forward/backward
    var dir = this.getTitleValue('DIR');
    return 'Maze.' + dir + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.maze_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnTooltip());
    }
  };

  blockly.Blocks.maze_turn.DIRECTIONS =
      [[msg.turnLeft() + ' \u21BA', 'turnLeft'],
       [msg.turnRight() + ' \u21BB', 'turnRight']];

  generator.maze_turn = function() {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    return 'Maze.' + dir + '(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.maze_isPath = {
    // Block for checking if there a path.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.setOutput(true, blockly.BlockValueType.NUMBER);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setTooltip(msg.isPathTooltip());
    }
  };

  blockly.Blocks.maze_isPath.DIRECTIONS =
      [[msg.ifPathAhead(), 'isPathForward'],
       [msg.pathLeft() + ' \u21BA', 'isPathLeft'],
       [msg.pathRight() + ' \u21BB', 'isPathRight']];

  generator.maze_isPath = function() {
    // Generate JavaScript for checking if there is a path.
    var code = 'Maze.' + this.getTitleValue('DIR') + '()';
    return [code, generator.ORDER_FUNCTION_CALL];
  };

  blockly.Blocks.maze_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.maze_if.DIRECTIONS =
      blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_if = function() {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') +
        '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.maze_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.appendStatementInput('ELSE')
          .appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.maze_ifElse.DIRECTIONS =
      blockly.Blocks.maze_isPath.DIRECTIONS;

  generator.maze_ifElse = function() {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') +
        '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 +
               '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode());
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.karel_if = function() {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') +
        '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.karel_if.DIRECTIONS = [
       [msg.pilePresent(), 'pilePresent'],
       [msg.holePresent(), 'holePresent'],
       [msg.pathAhead(), 'isPathForward']
  //     [msg.noPathAhead(), 'noPathForward']
  ];

  blockly.Blocks.karel_ifElse = {
    // Block for 'if/else' conditional if there is a path.
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode());
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.appendStatementInput('ELSE')
          .appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.karel_ifElse = function() {
    // Generate JavaScript for 'if/else' conditional if there is a path.
    var argument = 'Maze.' + this.getTitleValue('DIR') +
        '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 +
               '} else {\n' + branch1 + '}\n';
    return code;
  };

  blockly.Blocks.karel_ifElse.DIRECTIONS =
      blockly.Blocks.karel_if.DIRECTIONS;

  blockly.Blocks.maze_whileNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_whileNotClear = function() {
    var argument = 'Maze.' + this.getTitleValue('DIR') +
      '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_whileNotClear.DIRECTIONS = [
    [msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'],
    [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent']
  ];

  blockly.Blocks.maze_untilBlocked = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(msg.repeatUntilBlocked());
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_untilBlocked = function() {
    var argument = 'Maze.isPathForward' + '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_forever = {
    // Do forever loop.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(msg.repeatUntil())
          .appendTitle(new blockly.FieldImage(skin.maze_forever, 35, 35));
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_forever = function() {
    // Generate JavaScript for do forever loop.
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + codegen.loopHighlight('Maze', this.id) + branch;
    return 'while (Maze.notFinished()) {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIRECTIONS), 'DIR');
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.maze_untilBlockedOrNotClear = function() {
    var argument = 'Maze.' + this.getTitleValue('DIR') +
        '(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };

  blockly.Blocks.maze_untilBlockedOrNotClear.DIRECTIONS = [
       [msg.whileMsg() + ' ' + msg.pilePresent(), 'pilePresent'],
       [msg.whileMsg() + ' ' + msg.holePresent(), 'holePresent'],
       [msg.repeatUntilBlocked(), 'isPathForward']
  ];

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;

};

},{"../../locale/current/common":258,"../../locale/current/maze":262,"../block_utils":27,"../codegen":55,"./beeBlocks":100,"./mazeUtils":113}],101:[function(require,module,exports){
/*jshint -W086 */

var DirtDrawer = require('./dirtDrawer');
require('../utils');

var cellId = require('./mazeUtils').cellId;

var SQUARE_SIZE = 50;
var SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Inherits DirtDrawer to draw flowers/honeycomb for bee.
 * @param dirtMap The dirtMap from the maze, which shows the current state of
 *   the dirt (or flowers/honey in this case).
 * @param skin The app's skin, used to get URLs for our images
 * @param initialDirtMap The state of the dirtMap at start time.
 * @param bee The maze's Bee object.
 */
function BeeItemDrawer(dirtMap, skin, initialDirtMap, bee) {
  this.__base = BeeItemDrawer.superPrototype;

  DirtDrawer.call(this, dirtMap, '');

  this.skin_ = skin;
  this.initialDirt_ = initialDirtMap;

  this.bee_ = bee;

  this.honeyImages_ = [];
  this.nectarImages_ = [];
  this.svg_ = null;
  this.pegman_ = null;

  // is item currently covered by a cloud?
  this.clouded_ = dirtMap.map(function (row) {
    return [];
  });
}

BeeItemDrawer.inherits(DirtDrawer);
module.exports = BeeItemDrawer;

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
  // Negative values represent honey, positive values represent nectar.
  if (this.initialDirt_[row][col] < 0) {
    baseImage.href = this.skin_.honey;
  } else if (this.initialDirt_[row][col] > 0) {
    baseImage.href = this.flowerImageHref_(row, col);
  }

  var isCloudable = this.bee_.isCloudable(row, col);
  var isClouded = !running && isCloudable;
  var wasClouded = isCloudable && (this.clouded_[row][col] === true);

  var counterText;
  var ABS_VALUE_UNLIMITED = 99;  // Repesents unlimited nectar/honey.
  var ABS_VALUE_ZERO = 98;  // Represents zero nectar/honey.
  var absVal = Math.abs(this.dirtMap_[row][col]);
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

    if (isClouded) {
      this.showCloud_(row, col);
      this.clouded_[row][col] = true;
    } else if (wasClouded) {
      this.hideCloud_(row, col);
      this.clouded_[row][col] = false;
    }
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

function createText (prefix, row, col, counterText) {
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
  return this.bee_.isRedFlower(row, col) ? this.skin_.redFlower :
    this.skin_.purpleFlower;
};

BeeItemDrawer.prototype.updateHoneyCounter = function (honeyCount) {
  for (var i = 0; i < honeyCount; i++) {
    if (!this.honeyImages_[i]) {
      this.honeyImages_[i] = this.createCounterImage_('honey', i, 1,
        this.skin_.honey);
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
    this.nectarImages_[i].setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', href);
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
BeeItemDrawer.prototype.showCloud_ = function(row, col) {
  var cloudImageInfo  = {
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
BeeItemDrawer.prototype.hideCloud_ = function(row, col) {
  var cloudElement = document.getElementById(cellId('cloud', row, col));
  if (cloudElement) {
    cloudElement.setAttribute('visibility', 'hidden');
  }

  this.displayCloudAnimation_(row, col, true /* animate */);
};

/**
 * Create the cloud animation element, and perform the animation if necessary
 */
BeeItemDrawer.prototype.displayCloudAnimation_ = function(row, col, animate) {
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
  cloudAnimation.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.skin_.cloudAnimation);
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

},{"../utils":253,"./dirtDrawer":104,"./mazeUtils":113}],104:[function(require,module,exports){
var cellId = require('./mazeUtils').cellId;

// The number line is [-inf, min, min+1, ... no zero ..., max-1, max, +inf]
var DIRT_MAX = 10;
var DIRT_COUNT = DIRT_MAX * 2 + 2;

// Duplicated from maze.js so that I don't need a dependency
var SQUARE_SIZE = 50;

var SVG_NS = "http://www.w3.org/2000/svg";

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
  this.updateImageWithIndex_('dirt', row, col, this.dirtImageInfo_,
    spriteIndexForDirt(val));
};

/**
 * Update the image at the given row,col with the provided spriteIndex.
 */
DirtDrawer.prototype.updateImageWithIndex_ = function (prefix, row, col, imageInfo, spriteIndex) {
  var hiddenImage = spriteIndex < 0;

  var img = document.getElementById(cellId(prefix, row, col));
  if (!img) {
    // we don't need any image
    if (hiddenImage) {
      return;
    }
    // we want an image, so let's create one
    img = createImage(prefix, row, col, imageInfo);
  }

  img.setAttribute('visibility', hiddenImage ? 'hidden' : 'visible');
  if (!hiddenImage) {
    img.setAttribute('x', SQUARE_SIZE * (col - spriteIndex));
    img.setAttribute('y', SQUARE_SIZE * row);
  }
};

function createImage (prefix, row, col, imageInfo) {
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
 function spriteIndexForDirt (val) {
  var spriteIndex;

  if (val === 0) {
    spriteIndex = -1;
  } else if(val < -DIRT_MAX) {
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

},{"./mazeUtils":113}],113:[function(require,module,exports){
/**
 * Generalized function for generating ids for cells in a table
 */
exports.cellId = function (prefix, row, col) {
  return prefix + '_' + row + '_' + col;
};

/**
 * Is skin either bee or bee_night
 */
exports.isBeeSkin = function (skinId) {
  return (/bee(_night)?/).test(skinId);
};

/**
 * Is skin scrat
 */
exports.isScratSkin = function (skinId) {
  return (/scrat/).test(skinId);
};

},{}],100:[function(require,module,exports){
/**
 * Blocks specific to Bee
 */

var msg = require('../../locale/current/maze');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');

var OPERATORS = [
  ['=', '=='],
  ['<', '<'],
  ['>', '>']
];

var TOOLTIPS = {
  '==': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
  '<': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
  '>': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  addIfFlowerHive(blockly, generator);
  addIfElseFlowerHive(blockly, generator);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifNectarAmount', 'if',
    [[msg.nectarRemaining(), 'nectarRemaining'],
     [msg.honeyAvailable(), 'honeyAvailable']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifelseNectarAmount', 'ifelse',
    [[msg.nectarRemaining(), 'nectarRemaining'],
     [msg.honeyAvailable(), 'honeyAvailable']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifTotalNectar', 'if',
    [[msg.totalNectar(), 'nectarCollected'],
     [msg.totalHoney(), 'honeyCreated']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_ifelseTotalNectar', 'ifelse',
    [[msg.totalNectar(), 'nectarCollected'],
     [msg.totalHoney(), 'honeyCreated']]);

  addConditionalComparisonBlock(blockly, generator, 'bee_whileNectarAmount', 'while',
    [[msg.nectarRemaining(), 'nectarRemaining'],
     [msg.honeyAvailable(), 'honeyAvailable']]);

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
 * Are we at a flower or a hive
 */
function addIfFlowerHive(blockly, generator) {
  blockly.Blocks.bee_ifFlower = {
    helpUrl: '',
    init: function() {
      var LOCATIONS = [
        [msg.atFlower(), 'atFlower'],
        [msg.atHoneycomb(), 'atHoneycomb']
      ];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode());
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(LOCATIONS), 'LOC');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setTooltip(msg.ifFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code }
  // if (Maze.atHoneycomb()) { code }
  generator.bee_ifFlower = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument = 'Maze.' + this.getTitleValue('LOC') +
        '(\'block_id_' + this.id + '\')';
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
    init: function() {
      var LOCATIONS = [
        [msg.atFlower(), 'atFlower'],
        [msg.atHoneycomb(), 'atHoneycomb']
      ];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode());
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(LOCATIONS), 'LOC');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.appendStatementInput('ELSE')
          .appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code } else { morecode }
  // if (Maze.atHoneycomb()) { code } else { morecode }
  generator.bee_ifElseFlower = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument = 'Maze.' + this.getTitleValue('LOC') +
        '(\'block_id_' + this.id + '\')';
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code = 'if (' + argument + ') {\n' + branch0 +
      '} else {\n' + branch1 + '}\n';
    return code;
  };
}

function addConditionalComparisonBlock(blockly, generator, name, type, arg1) {
  blockly.Blocks[name] = {
    helpUrl: '',
    init: function() {
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

      this.appendDummyInput()
          .appendTitle(conditionalMsg);
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(arg1), 'ARG1');
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(OPERATORS), 'OP');
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput()
          .appendTitle(new blockly.FieldTextInput('0',
            blockly.FieldTextInput.numberValidator), 'ARG2');
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      if (type === "ifelse") {
        this.appendStatementInput('ELSE')
            .appendTitle(msg.elseCode());
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);

      this.setTooltip(function() {
        var op = self.getTitleValue('OP');
        return TOOLTIPS[op];
      });
    }
  };

  // if (Maze.nectarCollected() > 0) { code }
  // if (Maze.honeyCreated() == 1) { code }
  generator[name] = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument1 = 'Maze.' + this.getTitleValue('ARG1') +
        '(\'block_id_' + this.id + '\')';
    var operator = this.getTitleValue('OP');
    var order = (operator === '==' || operator === '!=') ?
      Blockly.JavaScript.ORDER_EQUALITY : Blockly.JavaScript.ORDER_RELATIONAL;
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

    return command + ' (' + argument1 + ' ' + operator  + ' ' + argument2 + ') {\n' +
      branch0 + '}' + elseBlock + '\n';
  };
}

},{"../../locale/current/maze":262,"../block_utils":27,"../codegen":55}],98:[function(require,module,exports){
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
var API_FUNCTION = function (fn) {
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
var isPath = function(direction, id) {
  var effectiveDirection = Maze.pegmanD + direction;
  var square;
  var command;
  switch (tiles.constrainDirection4(effectiveDirection)) {
    case Direction.NORTH:
      square = Maze.map[Maze.pegmanY - 1] &&
          Maze.map[Maze.pegmanY - 1][Maze.pegmanX];
      command = 'look_north';
      break;
    case Direction.EAST:
      square = Maze.map[Maze.pegmanY][Maze.pegmanX + 1];
      command = 'look_east';
      break;
    case Direction.SOUTH:
      square = Maze.map[Maze.pegmanY + 1] &&
          Maze.map[Maze.pegmanY + 1][Maze.pegmanX];
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
  return square !== SquareType.WALL &&
        square !== SquareType.OBSTACLE &&
        square !== undefined;
};

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
var move = function(direction, id) {
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
var turn = function(direction, id) {
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
var turnTo = function(newDirection, id) {
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

exports.moveForward = API_FUNCTION(function(id) {
  move(MoveDirection.FORWARD, id);
});

exports.moveBackward = API_FUNCTION(function(id) {
  move(MoveDirection.BACKWARD, id);
});

exports.moveNorth = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.NORTH, id);
});

exports.moveSouth = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.SOUTH, id);
});

exports.moveEast = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.EAST, id);
});

exports.moveWest = API_FUNCTION(function(id) {
  moveAbsoluteDirection(Direction.WEST, id);
});

exports.turnLeft = API_FUNCTION(function(id) {
  turn(TurnDirection.LEFT, id);
});

exports.turnRight = API_FUNCTION(function(id) {
  turn(TurnDirection.RIGHT, id);
});

exports.isPathForward = API_FUNCTION(function(id) {
  return isPath(MoveDirection.FORWARD, id);
});
exports.noPathForward = API_FUNCTION(function(id) {
  return !isPath(MoveDirection.FORWARD, id);
});

exports.isPathRight = API_FUNCTION(function(id) {
  return isPath(MoveDirection.RIGHT, id);
});

exports.isPathBackward = API_FUNCTION(function(id) {
  return isPath(MoveDirection.BACKWARD, id);
});

exports.isPathLeft = API_FUNCTION(function(id) {
  return isPath(MoveDirection.LEFT, id);
});

exports.pilePresent = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] > 0;
});

exports.holePresent = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] < 0;
});

exports.currentPositionNotClear = API_FUNCTION(function(id) {
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  return Maze.dirt_[y][x] !== 0;
});

exports.fill = API_FUNCTION(function(id) {
  Maze.executionInfo.queueAction('putdown', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] + 1;
});

exports.dig = API_FUNCTION(function(id) {
  Maze.executionInfo.queueAction('pickup', id);
  var x = Maze.pegmanX;
  var y = Maze.pegmanY;
  Maze.dirt_[y][x] = Maze.dirt_[y][x] - 1;
});

exports.notFinished = API_FUNCTION(function() {
  return !Maze.checkSuccess();
});

// The code for this API should get stripped when showing code
exports.loopHighlight = API_FUNCTION(function (id) {
  Maze.executionInfo.queueAction('null', id);
});


for (var functionName in Bee.api) {
  exports[functionName] = API_FUNCTION(Bee.api[functionName]);
}

},{"../utils":253,"./bee":99,"./tiles":118}],118:[function(require,module,exports){
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

Tiles.TurnDirection = { LEFT: -1, RIGHT: 1};
Tiles.MoveDirection = { FORWARD: 0, RIGHT: 1, BACKWARD: 2, LEFT: 3};

Tiles.directionToDxDy = function(direction) {
  switch (direction) {
    case Tiles.Direction.NORTH:
      return {dx: 0, dy: -1};
    case Tiles.Direction.EAST:
      return {dx: 1, dy: 0};
    case Tiles.Direction.SOUTH:
      return {dx: 0, dy: 1};
    case Tiles.Direction.WEST:
      return {dx: -1, dy: 0};
  }
  throw new Error('Invalid direction value' + direction);
};

Tiles.directionToFrame = function(direction4) {
  return utils.mod(direction4 * 4, 16);
};

/**
 * Keep the direction within 0-3, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Tiles.constrainDirection4 = function(d) {
  return utils.mod(d, 4);
};

},{"../utils":253}],99:[function(require,module,exports){
var utils = require('../utils');
var mazeMsg = require('../../locale/current/maze');
var TestResults = require('../constants.js').TestResults;
var TerminationValue = require('../constants.js').BeeTerminationValue;

var UNLIMITED_HONEY = -99;
var UNLIMITED_NECTAR = 99;

var EMPTY_HONEY = -98; // Hive with 0 honey
var EMPTY_NECTAR = 98; // flower with 0 honey

// FC is short for FlowerComb, which we were originally using instead of cloud
var CLOUD_MARKER = 'FC';

var Bee = function (maze, studioApp, config) {
  this.maze_ = maze;
  this.studioApp_ = studioApp;
  this.skin_ = config.skin;
  this.defaultFlowerColor_ = (config.level.flowerType === 'redWithNectar' ?
    'red' : 'purple');
  if (this.defaultFlowerColor_ === 'purple' &&
    config.level.flowerType !== 'purpleNectarHidden') {
    throw new Error('bad flowerType for Bee: ' + config.level.flowerType);
  }

  this.nectarGoal_ = config.level.nectarGoal || 0;
  this.honeyGoal_ = config.level.honeyGoal || 0;

  // Create our own copy to ensure that it's not changing underneath us
  this.initialDirt_ = utils.cloneWithoutFunctions(config.level.initialDirt);

  // at each location, tracks whether user checked to see if it was a flower or
  // honeycomb using an if block
  this.userChecks_ = [];
};

module.exports = Bee;

Bee.prototype.reset = function () {
  this.honey_ = 0;
  // list of the locations we've grabbed nectar from
  this.nectars_ = [];
  for (var i = 0; i < this.initialDirt_.length; i++) {
    this.userChecks_[i] = [];
    for (var j = 0; j < this.initialDirt_[i].length; j++) {
      this.userChecks_[i][j] = {
        checkedForFlower: false,
        checkedForNectar: false
      };
    }
  }
  this.maze_.gridItemDrawer.updateNectarCounter(this.nectars_);
  this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
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
  } else  if (!this.checkedAllClouded()) {
    executionInfo.terminateWithValue(TerminationValue.UNCHECKED_CLOUD);
  } else if (!this.checkedAllPurple()) {
    executionInfo.terminateWithValue(TerminationValue.UNCHECKED_PURPLE);
  }
};

/**
 * Did we check every flower/honey that was covered by a cloud?
 */
Bee.prototype.checkedAllClouded = function () {
  for (var row = 0; row < this.initialDirt_.length; row++) {
    for (var col = 0; col < this.initialDirt_[row].length; col++) {
      if (this.isCloudable(row, col) &&  !this.userChecks_[row][col].checkedForFlower) {
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
  for (var row = 0; row < this.initialDirt_.length; row++) {
    for (var col = 0; col < this.initialDirt_[row].length; col++) {
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
 * Each cell of initialDirt is below zero if it's a hive. The number represents
 * how much honey can be made at the hive.
 * @param {boolean} userCheck Is this being called from user code
 */
Bee.prototype.isHive = function (row, col, userCheck) {
  userCheck = userCheck || false;
  if (userCheck) {
    this.userChecks_[row][col].checkedForFlower = true;
  }
  return this.initialDirt_[row][col] < 0;
};

/**
 * @param {boolean} userCheck Is this being called from user code
 */
Bee.prototype.isFlower = function (row, col, userCheck) {
  userCheck = userCheck || false;
  if (userCheck) {
    this.userChecks_[row][col].checkedForFlower = true;
  }
  return this.initialDirt_[row][col] > 0;
};

/**
 * Returns true if cell should be clovered by a cloud while running
 */
Bee.prototype.isCloudable = function (row, col) {
  return this.maze_.map[row][col] === CLOUD_MARKER;
};

/**
 * Flowers are either red or purple. This function returns true if a flower is red.
 */
Bee.prototype.isRedFlower = function (row, col) {
  if (!this.isFlower(row, col)) {
    return false;
  }

  // The default flower type is overriden by setting Maze.map[row][col] to
  // the type you want ('R' for red, 'P' for purple, 'FC' for cloud).  Clouds
  // are ignored here.
  var override = /^R|P$/.exec(this.maze_.map[row][col]);
  if (override && override[0] === 'R') {
    return true;
  }
  if (!override && this.defaultFlowerColor_ === 'red') {
    return true;
  }

  return false;
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
  var val = this.initialDirt_[row][col];
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

  var val = this.maze_.dirt_[row][col];
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
  var val = this.maze_.dirt_[row][col];
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
  if (this.maze_.dirt_[row][col] !== UNLIMITED_HONEY) {
    this.maze_.dirt_[row][col] += 1; // update progress towards goal
  }

  this.honey_ += 1;
};

/**
 * Update model to represent gathered nectar. Does no validation
 */
Bee.prototype.gotNectarAt = function (row, col) {
  if (this.maze_.dirt_[row][col] !== UNLIMITED_NECTAR) {
    this.maze_.dirt_[row][col] -= 1; // update progress towards goal
  }

  this.nectars_.push({row: row, col: col});
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

  if (this.maze_.dirt_[row][col] <= 0) {
    throw new Error("Shouldn't be able to end up with a nectar animation if " +
      "there was no nectar to be had");
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
    throw new Error("Shouldn't be able to end up with a honey animation if " +
      "we arent at a hive or dont have nectar");
  }

  this.playAudio_('honey');
  this.madeHoneyAt(row, col);

  this.maze_.gridItemDrawer.updateItemImage(row, col, true);

  this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
};

/**
 * Bee related API functions
 */
Bee.api = {};
Bee.api.getNectar = function(id) {
  Maze.bee.getNectar(id);
};

Bee.api.makeHoney = function(id) {
  Maze.bee.makeHoney(id);
};

Bee.api.atFlower = function(id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_flower", id);
  return Maze.bee.isFlower(row, col, true);
};

Bee.api.atHoneycomb = function(id) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.executionInfo.queueAction("at_honeycomb", id);
  return Maze.bee.isHive(row, col, true);
};

Bee.api.nectarRemaining = function (id) {
  Maze.executionInfo.queueAction("nectar_remaining", id);
  return Maze.bee.nectarRemaining(true);
};

Bee.api.honeyAvailable = function (id) {
  Maze.executionInfo.queueAction("honey_available", id);
  return Maze.bee.honeyAvailable();
};

Bee.api.nectarCollected = function (id) {
  Maze.executionInfo.queueAction("nectar_collected", id);
  return Maze.bee.nectars_.length;
};

Bee.api.honeyCreated = function (id) {
  Maze.executionInfo.queueAction("honey_created", id);
  return Maze.bee.honey_;
};

},{"../../locale/current/maze":262,"../constants.js":57,"../utils":253}],262:[function(require,module,exports){
/*maze*/ module.exports = window.blockly.appLocale;
},{}]},{},[111]);
