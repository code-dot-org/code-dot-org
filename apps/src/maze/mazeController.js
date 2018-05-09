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

const timeoutList = require('../lib/util/timeoutList');

const AnimationsController = require('./animationsController');
const MazeMap = require('./mazeMap');
const drawMap = require('./drawMap');
const getSubtypeForSkin = require('./mazeUtils').getSubtypeForSkin;
const tiles = require('./tiles');

module.exports = class MazeController {
  constructor(level, skin, config, options = {}) {

    this.stepSpeed = 100;

    this.level = level;
    this.skin = skin;
    this.startDirection = null;

    this.subtype = null;
    this.map = null;
    this.animationsController = null;
    this.store = null;

    this.pegmanD = null;
    this.pegmanX = null;
    this.pegmanY = null;

    this.MAZE_HEIGHT = null;
    this.MAZE_WIDTH = null;
    this.PATH_WIDTH = null;
    this.PEGMAN_HEIGHT = null;
    this.PEGMAN_WIDTH = null;
    this.PEGMAN_X_OFFSET = null;
    this.PEGMAN_Y_OFFSET = null;
    this.SQUARE_SIZE = null;

    if (options.reduxStore) {
      this.addReduxStore(options.reduxStore);
    }

    if (options.methods) {
      this.rebindMethods(options.methods);
    }

    const Type = getSubtypeForSkin(config.skinId);
    this.subtype = new Type(this, config);
    this.loadLevel_();
  }

  /**
   * A few placeholder methods intended to be rebound
   */
  playAudio() {}
  playAudioOnFailure() {}
  loadAudio() {}
  getTestResults() {}

  rebindMethods(methods) {
    this.playAudio = methods.playAudio || this.playAudio;
    this.playAudioOnFailure = methods.playAudioOnFailure || this.playAudioOnFailure;
    this.loadAudio = methods.loadAudio || this.loadAudio;
    this.getTestResults = methods.getTestResults || this.getTestResults;
  }

  addReduxStore(store) {
    this.store = store;
  }

  initWithSvg(svg) {
    // Adjust outer element size.
    svg.setAttribute('width', this.MAZE_WIDTH);
    svg.setAttribute('height', this.MAZE_HEIGHT);

    drawMap.default(svg, this.skin, this.subtype, this.map, this.SQUARE_SIZE);
    this.animationsController = new AnimationsController(this, svg);
  }

  loadLevel_() {
    // Load maps.
    //
    // "serializedMaze" is the new way of storing maps; it's a JSON array
    // containing complex map data.
    //
    // "map" plus optionally "levelDirt" is the old way of storing maps;
    // they are each arrays of a combination of strings and ints with
    // their own complex syntax. This way is deprecated for new levels,
    // and only exists for backwards compatibility for not-yet-updated
    // levels.
    if (this.level.serializedMaze) {
      this.map = MazeMap.deserialize(
        this.level.serializedMaze,
        this.subtype.getCellClass(),
      );
    } else {
      this.map = MazeMap.parseFromOldValues(
        this.level.map,
        this.level.initialDirt,
        this.subtype.getCellClass(),
      );
    }

    // this could possibly be eliminated in favor of just always referencing
    // this.level.startDirection
    this.startDirection = this.level.startDirection;

    // this could probably be moved to the constructor

    if (this.level.fastGetNectarAnimation) {
      this.skin.actionSpeedScale.nectar = 0.5;
    }

    // Pixel height and width of each maze square (i.e. tile).
    this.SQUARE_SIZE = 50;
    this.PEGMAN_HEIGHT = this.skin.pegmanHeight;
    this.PEGMAN_WIDTH = this.skin.pegmanWidth;
    this.PEGMAN_X_OFFSET = this.skin.pegmanXOffset || 0;
    this.PEGMAN_Y_OFFSET = this.skin.pegmanYOffset;

    this.MAZE_WIDTH = this.SQUARE_SIZE * this.map.COLS;
    this.MAZE_HEIGHT = this.SQUARE_SIZE * this.map.ROWS;
    this.PATH_WIDTH = this.SQUARE_SIZE / 3;
  }

  /**
   * Redraw all dirt images
   * @param {boolean} running Whether or not user program is currently running
   */
  resetDirtImages(running) {
    this.map.forEachCell((cell, row, col) => {
      this.subtype.drawer.updateItemImage(row, col, running);
    });
  }

  /**
   * Initialize Blockly and the maze.  Called on page load.
   */
  gridNumberToPosition_(n) {
    return (n + 0.5) * this.SQUARE_SIZE;
  }

  /**
   * @param svg
   * @param {Array<Array>} coordinates An array of x and y grid coordinates.
   */
  drawHintPath(svg, coordinates) {
    const path = svg.getElementById('hintPath');
    path.setAttribute('d', 'M' + coordinates.map(([x, y]) => {
      return `${this.gridNumberToPosition_(x)},${this.gridNumberToPosition_(y)}`;
    }).join(' '));
  }

  /**
   * Reset the maze to the start position and kill any pending animation tasks.
   * @param {boolean} first True if an opening animation is to be played.
   */
  reset(first) {
    this.subtype.reset();

    // Kill all tasks.
    timeoutList.clearTimeouts();

    // Move Pegman into position.
    this.pegmanX = this.subtype.start.x;
    this.pegmanY = this.subtype.start.y;

    this.pegmanD = this.startDirection;
    this.animationsController.reset(first);

    // Move the init dirt marker icons into position.
    this.map.resetDirt();
    this.resetDirtImages(false);

    // Reset the obstacle image.
    var obsId = 0;
    var x, y;
    for (y = 0; y < this.map.ROWS; y++) {
      for (x = 0; x < this.map.COLS; x++) {
        var obsIcon = document.getElementById('obstacle' + obsId);
        if (obsIcon) {
          obsIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.skin.obstacleIdle,
          );
        }
        ++obsId;
      }
    }

    if (this.subtype.resetTiles) {
      this.subtype.resetTiles();
    } else {
      this.resetTiles_();
    }
  }

  resetTiles_() {
    // Reset the tiles
    var tileId = 0;
    for (var y = 0; y < this.map.ROWS; y++) {
      for (var x = 0; x < this.map.COLS; x++) {
        // Tile's clipPath element.
        var tileClip = document.getElementById('tileClipPath' + tileId);
        tileClip.setAttribute('visibility', 'visible');
        // Tile sprite.
        var tileElement = document.getElementById('tileElement' + tileId);
        tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.skin.tiles,
        );
        tileElement.setAttribute('opacity', 1);
        tileId++;
      }
    }
  }

  animatedFinish(timePerStep) {
    this.animationsController.scheduleDance(true, timePerStep);
  }

  animatedMove(direction, timeForMove) {
    var positionChange = tiles.directionToDxDy(direction);
    var newX = this.pegmanX + positionChange.dx;
    var newY = this.pegmanY + positionChange.dy;
    this.animationsController.scheduleMove(newX, newY, timeForMove);
    this.playAudio('walk');
    this.pegmanX = newX;
    this.pegmanY = newY;
  }

  animatedTurn(direction) {
    var newDirection = this.pegmanD + direction;
    this.animationsController.scheduleTurn(newDirection);
    this.pegmanD = tiles.constrainDirection4(newDirection);
  }

  animatedFail(forward) {
    var dxDy = tiles.directionToDxDy(this.pegmanD);
    var deltaX = dxDy.dx;
    var deltaY = dxDy.dy;

    if (!forward) {
      deltaX = -deltaX;
      deltaY = -deltaY;
    }

    var targetX = this.pegmanX + deltaX;
    var targetY = this.pegmanY + deltaY;
    var frame = tiles.directionToFrame(this.pegmanD);
    this.animationsController.displayPegman(
      this.pegmanX + deltaX / 4,
      this.pegmanY + deltaY / 4,
      frame,
    );
    // Play sound and animation for hitting wall or obstacle
    var squareType = this.map.getTile(targetY, targetX);
    if (
      squareType === tiles.SquareType.WALL ||
      squareType === undefined ||
      (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE)
    ) {
      // Play the sound
      this.playAudio('wall');
      if (squareType !== undefined) {
        // Check which type of wall pegman is hitting
        this.playAudio('wall' + this.subtype.wallMap[targetY][targetX]);
      }

      if (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE) {
        this.animationsController.crackSurroundingIce(targetX, targetY);
      }

      this.animationsController.scheduleWallHit(targetX, targetY, deltaX, deltaY, frame);
      timeoutList.setTimeout(() => {
        this.playAudioOnFailure();
      }, this.stepSpeed * 2);
    } else if (squareType === tiles.SquareType.OBSTACLE) {
      // Play the sound
      this.playAudio('obstacle');
      this.animationsController.scheduleObstacleHit(targetX, targetY, deltaX, deltaY, frame);
      timeoutList.setTimeout(() => {
        this.playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  /**
   * Display the look icon at Pegman's current location,
   * in the specified direction.
   * @param {!Direction} direction Direction (0 - 3).
   */
  animatedLook(direction) {
    var x = this.pegmanX;
    var y = this.pegmanY;
    switch (direction) {
      case tiles.Direction.NORTH:
        x += 0.5;
        break;
      case tiles.Direction.EAST:
        x += 1;
        y += 0.5;
        break;
      case tiles.Direction.SOUTH:
        x += 0.5;
        y += 1;
        break;
      case tiles.Direction.WEST:
        y += 0.5;
        break;
    }
    x *= this.SQUARE_SIZE;
    y *= this.SQUARE_SIZE;
    var d = direction * 90 - 45;

    this.animationsController.scheduleLook(x, y, d);
  }

  scheduleDirtChange_(options) {
    var col = this.pegmanX;
    var row = this.pegmanY;

    // cells that started as "flat" will be undefined
    var previousValue = this.map.getValue(row, col) || 0;

    this.map.setValue(row, col, previousValue + options.amount);
    this.subtype.scheduleDirtChange(row, col);
    this.playAudio(options.sound);
  }

  /**
   * Schedule to add dirt at pegman's current position.
   */
  scheduleFill() {
    this.scheduleDirtChange_({
      amount: 1,
      sound: 'fill',
    });
  }

  /**
   * Schedule to remove dirt at pegman's current location.
   */
  scheduleDig() {
    this.scheduleDirtChange_({
      amount: -1,
      sound: 'dig',
    });
  }
};
