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

var BlocklyApps = require('../base');
var commonMsg = require('../../locale/current/common');
var skins = require('../skins');
var tiles = require('./tiles');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var utils = require('../utils');
var mazeUtils = require('./mazeUtils');
var _ = utils.getLodash();

var Bee = require('./bee');
var WordSearch = require('./wordsearch');
var DirtDrawer = require('./dirtDrawer');
var BeeItemDrawer = require('./beeItemDrawer');

var ExecutionInfo = require('./executionInfo');

var Direction = tiles.Direction;
var SquareType = tiles.SquareType;
var TurnDirection = tiles.TurnDirection;

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
BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;

var getTile = function(map, x, y) {
  if (map && map[y]) {
    return map[y][x];
  }
};

//The number of blocks to show as feedback.
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

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
  'null4': [1, 3]
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

  if (Maze.finish_ && skin.goal) {
    // Add finish marker.
    var finishMarker = document.createElementNS(SVG_NS, 'image');
    finishMarker.setAttribute('id', 'finish');
    finishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                                skin.goal);
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
          'http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle);
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
      direction: Maze.startDirection
    });
  }

  // Add the hidden dazed pegman when hitting the wall.
  if (skin.wallPegmanAnimation) {
    createPegmanAnimation({
      idStr: 'wall',
      pegmanImage: skin.wallPegmanAnimation
    });
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

function drawMapTiles(svg) {
  if (Maze.wordSearch) {
    return Maze.wordSearch.drawMapTiles(svg);
  }

  // Draw the tiles making up the maze map.

  // Return a value of '0' if the specified square is wall or out of bounds '1'
  // otherwise (empty, obstacle, start, finish).
  var normalize = function(x, y) {
    return ((Maze.map[y] === undefined) ||
            (Maze.map[y][x] === undefined) ||
            (Maze.map[y][x] == SquareType.WALL)) ? '0' : '1';
  };

  // Compute and draw the tile for each square.
  var tileId = 0;
  var tile, origTile;
  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      // Compute the tile index.
      tile = normalize(x, y) +
        normalize(x, y - 1) +  // North.
        normalize(x + 1, y) +  // West.
        normalize(x, y + 1) +  // South.
        normalize(x - 1, y);   // East.
      var adjacentToPath = (tile !== '00000');

      // Draw the tile.
      if (!TILE_SHAPES[tile]) {
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

  if (mazeUtils.isBeeSkin(config.skinId)) {
    Maze.bee = new Bee(Maze, config);
    // Override default stepSpeed
    Maze.scale.stepSpeed = 2;
  } else if (config.skinId === 'letters') {
    Maze.wordSearch = new WordSearch(level.searchWord, level.map, Maze.drawTile);
    extraControlRows = require('./extraControlRows.html')({
      assetUrl: BlocklyApps.assetUrl,
      searchWord: level.searchWord
    });
  }

  loadLevel();

  Maze.cachedBlockStates = [];

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({
        assetUrl: BlocklyApps.assetUrl,
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
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
    Blockly.loadAudio_(skin.obstacleSound, 'obstacle');
    // Load wall sounds.
    Blockly.loadAudio_(skin.wallSound, 'wall');

    // todo - longterm, instead of having sound related flags we should just
    // have the skin tell us the set of sounds it needs
    if (skin.additionalSound) {
      Blockly.loadAudio_(skin.wall0Sound, 'wall0');
      Blockly.loadAudio_(skin.wall1Sound, 'wall1');
      Blockly.loadAudio_(skin.wall2Sound, 'wall2');
      Blockly.loadAudio_(skin.wall3Sound, 'wall3');
      Blockly.loadAudio_(skin.wall4Sound, 'wall4');
      Blockly.loadAudio_(skin.winGoalSound, 'winGoal');
    }
    if (skin.dirtSound) {
      Blockly.loadAudio_(skin.fillSound, 'fill');
      Blockly.loadAudio_(skin.digSound, 'dig');
    }
    if (skin.beeSound) {
      Blockly.loadAudio_(skin.nectarSound, 'nectar');
      Blockly.loadAudio_(skin.honeySound, 'honey');
    }
  };

  config.afterInject = function() {
    if (BlocklyApps.usingBlockly) {
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

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Maze.resetButtonClick);

    if (skin.hideInstructions) {
      document.getElementById("bubble").style.display = "none";
    }
  };

  BlocklyApps.init(config);
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
    rect.setAttribute('x', options.col * Maze.SQUARE_SIZE + 1);
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
        options.direction * Maze.PEGMAN_WIDTH + 1;
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
  rect.setAttribute('x', options.col * Maze.SQUARE_SIZE + 1);
  rect.setAttribute('y', getPegmanYForRow(options.row));
  var img = document.getElementById(options.idStr + 'Pegman');
  var x = Maze.SQUARE_SIZE * options.col -
      options.direction * Maze.PEGMAN_WIDTH + 1;
  img.setAttribute('x', x);
  var y = getPegmanYForRow(options.row) - getPegmanFrameOffsetY(options.animationRow);
  img.setAttribute('y', y);
  img.setAttribute('visibility', 'visible');
};

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
BlocklyApps.reset = function(first) {
  if (Maze.bee) {
    // Bee needs to reset itself and still run BlocklyApps.reset logic
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
      Maze.scheduleDance(false, danceTime);
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
                              skin.goal);
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
                               skin.obstacle);
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
BlocklyApps.runButtonClick = function() {
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
  BlocklyApps.toggleRunReset('reset');
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpace.traceOn(true);
  }
  BlocklyApps.reset(false);
  BlocklyApps.attempts++;
}

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
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
 * BlocklyApps.displayFeedback when appropriate
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
  // add it to the options passed to BlocklyApps.displayFeedback().
  if (Maze.testResults === BlocklyApps.TestResults.APP_SPECIFIC_FAIL &&
      Maze.bee) {
    var message = Maze.bee.getMessage(Maze.executionInfo.terminationValue());
    if (message) {
      options.message = message;
    }
  }
  BlocklyApps.displayFeedback(options);
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
  Maze.result = BlocklyApps.ResultType.UNSET;
  Maze.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Maze.waitingForReport = false;
  Maze.animating_ = false;
  Maze.response = null;

  var code;
  if (BlocklyApps.usingBlockly) {
    code = Blockly.Generator.blockSpaceToCode('JavaScript');
  } else {
    code = utils.generateCodeAliases(level.codeFunctions, 'Maze');
    code += BlocklyApps.editor.getValue();
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
  BlocklyApps.playAudio('start');
  try {
    // don't bother running code if we're just editting required blocks. all
    // we care about is the contents of report.
    var runCode = !level.edit_blocks;

    if (runCode) {
      codegen.evalWith(code, {
        BlocklyApps: BlocklyApps,
        Maze: api,
        executionInfo: Maze.executionInfo
      });
    }

    Maze.onExecutionFinish();

    switch (Maze.executionInfo.terminationValue()) {
      case null:
        // didn't terminate
        Maze.executionInfo.queueAction('finish', null);
        Maze.result = BlocklyApps.ResultType.FAILURE;
        stepSpeed = 150;
        break;
      case Infinity:
        // Detected an infinite loop.  Animate what we have as quickly as
        // possible
        Maze.result = BlocklyApps.ResultType.TIMEOUT;
        stepSpeed = 0;
        break;
      case true:
        Maze.result = BlocklyApps.ResultType.SUCCESS;
        stepSpeed = 100;
        break;
      case false:
        Maze.result = BlocklyApps.ResultType.ERROR;
        stepSpeed = 150;
        break;
      default:
        // App-specific failure.
        Maze.result = BlocklyApps.ResultType.ERROR;
        if (Maze.bee) {
          Maze.testResults = Maze.bee.getTestResults(
            Maze.executionInfo.terminationValue());
        }
        break;
    }
  } catch (e) {
    // Syntax error, can't happen.
    Maze.result = BlocklyApps.ResultType.ERROR;
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
  var levelComplete = (Maze.result === BlocklyApps.ResultType.SUCCESS);

  // Set testResults unless app-specific results were set in the default
  // branch of the above switch statement.
  if (Maze.testResults === BlocklyApps.TestResults.NO_TESTS_RUN) {
    Maze.testResults = BlocklyApps.getTestResults(levelComplete);
  }

  var program;
  if (level.editCode) {
    // If we want to "normalize" the JavaScript to avoid proliferation of nearly
    // identical versions of the code on the service, we could do either of these:

    // do an acorn.parse and then use escodegen to generate back a "clean" version
    // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

    program = BlocklyApps.editor.getValue();
  } else {
    var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
    program = Blockly.Xml.domToText(xml);
  }

  Maze.waitingForReport = true;

  // Report result to server.
  BlocklyApps.report({
    app: 'maze',
    level: level.id,
    result: Maze.result === BlocklyApps.ResultType.SUCCESS,
    testResult: Maze.testResults,
    program: encodeURIComponent(program),
    onComplete: Maze.onReportComplete
  });

  // Maze. now contains a transcript of all the user's actions.
  // Reset the maze and animate the transcript.
  BlocklyApps.reset(false);
  resetDirtImages(true);

  // if we have extra top blocks, don't even bother animating
  if (Maze.testResults === BlocklyApps.TestResults.EXTRA_TOP_BLOCKS_FAIL) {
    Maze.result = BlocklyApps.ResultType.ERROR;
    displayFeedback();
    return;
  }

  Maze.animating_ = true;

  if (BlocklyApps.usingBlockly) {
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
        if (BlocklyApps.usingBlockly) {
          // reenable toolbox
          Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
        }
        // If stepping and we failed, we want to retain highlighting until
        // clicking reset.  Otherwise we can clear highlighting/disabled
        // blocks now
        if (!singleStep || Maze.result === BlocklyApps.ResultType.SUCCESS) {
          reenableCachedBlockStates();
          BlocklyApps.clearHighlighting();
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
    BlocklyApps.highlight(String(action.blockId), spotlightBlocks);
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
        case BlocklyApps.TestResults.FREE_PLAY:
        case BlocklyApps.TestResults.TOO_MANY_BLOCKS_FAIL:
        case BlocklyApps.TestResults.ALL_PASS:
          Maze.scheduleDance(true, timePerStep);
          break;
        default:
          timeoutList.setTimeout(function() {
            BlocklyApps.playAudio('failure');
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
      // action[0] is null if generated by BlocklyApps.checkTimeout().
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

    utils.range(0, numFrames - 1).forEach(function (frame) {
      timeoutList.setTimeout(function() {
        pegmanIcon.setAttribute('visibility', 'hidden');
        updatePegmanAnimation({
          idStr: 'move',
          col: startX + deltaX * frame / numFrames,
          row: startY + deltaY * frame / numFrames,
          direction: direction,
          animationRow: frame
        });
      }, timePerFrame * frame);
    });

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
        skin.goal);
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
    BlocklyApps.playAudio('wall');
    if (squareType !== undefined) {
      // Check which type of wall pegman is hitting
      BlocklyApps.playAudio('wall' + Maze.wallMap[targetY][targetX]);
    }

    // Play the animation of hitting the wall
    if (skin.hittingWallAnimation) {
      timeoutList.setTimeout(function() {
        var wallAnimationIcon = document.getElementById('wallAnimation');
        wallAnimationIcon.setAttribute(
            'x',
            Maze.SQUARE_SIZE * (Maze.pegmanX + 0.5 + deltaX * 0.5) -
            wallAnimationIcon.getAttribute('width') / 2);
        wallAnimationIcon.setAttribute(
            'y',
            Maze.SQUARE_SIZE * (Maze.pegmanY + 1 + deltaY * 0.5) -
            wallAnimationIcon.getAttribute('height'));
        wallAnimationIcon.setAttribute('visibility', 'visible');
        wallAnimationIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href',
          skin.hittingWallAnimation);
      }, stepSpeed / 2);
    }
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX,
                         Maze.pegmanY,
                         frame);
    }, stepSpeed);
    timeoutList.setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX + deltaX / 4,
                         Maze.pegmanY + deltaY / 4,
                         frame);
      BlocklyApps.playAudio('failure');
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
    BlocklyApps.playAudio('obstacle');

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
      BlocklyApps.playAudio('failure');
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
Maze.scheduleDance = function(victoryDance, timeAlloted) {
  var originalFrame = tiles.directionToFrame(Maze.pegmanD);
  Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);

  // If victoryDance == true, play the goal animation, else reset it
  var finishIcon = document.getElementById('finish');
  if (victoryDance && finishIcon) {
    BlocklyApps.playAudio('winGoal');
    finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.goalAnimation);
  }

  if (victoryDance) {
    BlocklyApps.playAudio('win');
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
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} frame Direction (0 - 15) or dance (16 - 17).
 */
Maze.displayPegman = function(x, y, frame) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Maze.SQUARE_SIZE - frame * Maze.PEGMAN_WIDTH + 1);
  pegmanIcon.setAttribute('y', getPegmanYForRow(y));

  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Maze.SQUARE_SIZE + 1);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

var scheduleDirtChange = function(options) {
  var col = Maze.pegmanX;
  var row = Maze.pegmanY;
  Maze.dirt_[row][col] += options.amount;
  Maze.gridItemDrawer.updateItemImage(row, col, true);
  BlocklyApps.playAudio(options.sound);
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
