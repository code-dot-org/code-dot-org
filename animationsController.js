const {SVG_NS, pegmanElements} = require('./constants');
const drawMap = require('./drawMap');
const displayPegman = drawMap.displayPegman;
const getPegmanYForRow = drawMap.getPegmanYForRow;
const addNewPegman = drawMap.addNewPegman;
const timeoutList = require('./timeoutList');
const utils = require('./utils');
const tiles = require('./tiles');

module.exports = class AnimationsController {
  constructor(maze, svg) {
    this.maze = maze;
    this.svg = svg;

    this.createAnimations_();
  }

  createAnimations_(pegmanId) {
    // Add idle pegman.
    if (this.maze.skin.idlePegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.IDLE,
        pegmanImage: this.maze.skin.idlePegmanAnimation,
        row: this.maze.subtype.start.y,
        col: this.maze.subtype.start.x,
        direction: this.maze.startDirection,
        numColPegman: this.maze.skin.idlePegmanCol,
        numRowPegman: this.maze.skin.idlePegmanRow,
        pegmanId: pegmanId
      });

      if (this.maze.skin.idlePegmanCol > 1 || this.maze.skin.idlePegmanRow > 1) {
        // our idle is a sprite sheet instead of a gif. schedule cycling through
        // the frames
        // GLOBAL ANIMATION DISABLE: Force numFrames to 1 to prevent animation loop
        var numFrames = 1; // this.maze.skin.idlePegmanRow;
        var idlePegmanIcon = document.getElementById(
          utils.getPegmanElementId(pegmanElements.IDLE, pegmanId)
        );
        var timePerFrame = 600; // timeForAnimation / numFrames;
        var idleAnimationFrame = 0;

        // GLOBAL ANIMATION DISABLE: Commented out setInterval to prevent animation loop
        // setInterval(() => {
        //   if (idlePegmanIcon.getAttribute('visibility') === 'visible') {
        //     this.updatePegmanAnimation_({
        //       type: pegmanElements.IDLE,
        //       row: this.maze.subtype.start.y,
        //       col: this.maze.subtype.start.x,
        //       direction: this.maze.startDirection,
        //       animationRow: idleAnimationFrame,
        //       pegmanId: pegmanId
        //     });
        //     idleAnimationFrame = (idleAnimationFrame + 1) % numFrames;
        //   }
        // }, timePerFrame);
      }
    }

    if (this.maze.skin.celebrateAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.CELEBRATE,
        pegmanImage: this.maze.skin.celebrateAnimation,
        row: this.maze.subtype.start.y,
        col: this.maze.subtype.start.x,
        direction: tiles.Direction.NORTH,
        numColPegman: this.maze.skin.celebratePegmanCol,
        numRowPegman: this.maze.skin.celebratePegmanRow,
        pegmanId: pegmanId
      });
    }

    // Add the hidden dazed pegman when hitting the wall.
    if (this.maze.skin.wallPegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.WALL,
        pegmanImage: this.maze.skin.wallPegmanAnimation,
        pegmanId: pegmanId
      });
    }

    // create element for our hitting wall spritesheet
    if (this.maze.skin.hittingWallAnimation && this.maze.skin.hittingWallAnimationFrameNumber) {
      this.createPegmanAnimation_({
        type: pegmanElements.WALL,
        pegmanImage: this.maze.skin.hittingWallAnimation,
        numColPegman: this.maze.skin.hittingWallPegmanCol,
        numRowPegman: this.maze.skin.hittingWallPegmanRow,
        pegmanId: pegmanId
      });
      document.getElementById(
        utils.getPegmanElementId(pegmanElements.WALL, pegmanId)
      ).setAttribute('visibility', 'hidden');
    }

    // Add the hidden moving pegman animation.
    if (this.maze.skin.movePegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.MOVE,
        pegmanImage: this.maze.skin.movePegmanAnimation,
        numColPegman: this.maze.skin.movePegmanCol || 4,
        numRowPegman: this.maze.skin.movePegmanRow || (this.maze.skin.movePegmanAnimationFrameNumber || 9),
        pegmanId: pegmanId
      });
    }

    // Add wall hitting animation
    if (this.maze.skin.hittingWallAnimation) {
      var wallAnimationIcon = document.createElementNS(SVG_NS, 'image');
      wallAnimationIcon.setAttribute(
        'id',
        utils.getPegmanElementId(pegmanElements.WALL_ANIMATION, pegmanId)
      );
      wallAnimationIcon.setAttribute('height', this.maze.SQUARE_SIZE);
      wallAnimationIcon.setAttribute('width', this.maze.SQUARE_SIZE);
      wallAnimationIcon.setAttribute('visibility', 'hidden');
      this.svg.appendChild(wallAnimationIcon);
    }
  }

  reset(first) {
    if (first) {
      // Dance consists of 5 animations, each of which get 150ms
      var danceTime = 150 * 5;
      if (this.maze.skin.danceOnLoad) {
        this.scheduleDance(false, danceTime);
      }
      timeoutList.setTimeout(() => {
        this.maze.stepSpeed = 100;
        this.scheduleTurn(this.maze.startDirection);
      }, danceTime + 150);
    } else {
      // Reset the pegman for a maze with 1 pegman. Mazes that allow multiple
      // pegmen will only show/hide a static default, which is 
      // reset by the maze controller.
      if (!this.maze.subtype.allowMultiplePegmen()) {
        this.displayPegman(this.maze.getPegmanX(), this.maze.getPegmanY(), tiles.directionToFrame(this.maze.getPegmanD()));
      }
      const finishIcon = document.getElementById('finish');
      if (finishIcon) {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.maze.skin.goalIdle);

        // skins with a celebration animation (like scrat) hide the finish icon
        // after finishing; to support resetting those, we need to restore the
        // finish icon here
        finishIcon.setAttribute('visibility', 'visible');
      }
    }

    // Make 'look' icon invisible and promote to top.
    var lookIcon = document.getElementById('look');
    lookIcon.style.display = 'none';
    lookIcon.parentNode.appendChild(lookIcon);
    var paths = lookIcon.getElementsByTagName('path');
    for (let i = 0; i < paths.length; i++) {
      var path = paths[i];
      path.setAttribute('stroke', this.maze.skin.look);
    }

    // Reset pegman's visibility if there is only one pegman
    const pegmanIcon = this.getPegmanIcon();
    if (!this.maze.subtype.allowMultiplePegmen()) {
      pegmanIcon.setAttribute('opacity', 1);
    }

    if (this.maze.skin.idlePegmanAnimation) {
      pegmanIcon.setAttribute('visibility', 'hidden');
      var idlePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.IDLE)
      );
      idlePegmanIcon.setAttribute('visibility', 'visible');
    } else if (!this.maze.subtype.allowMultiplePegmen()) {
      pegmanIcon.setAttribute('visibility', 'visible');
    }

    if (this.maze.skin.wallPegmanAnimation) {
      var wallPegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.WALL)
      );
      wallPegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.movePegmanAnimation) {
      var movePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.MOVE)
      );
      movePegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.celebrateAnimation) {
      var celebrateAnimation = document.getElementById(
        utils.getPegmanElementId(pegmanElements.CELEBRATE)
      );
      celebrateAnimation.setAttribute('visibility', 'hidden');
    }
  }

  /**
   * Create sprite assets for pegman.
   * @param options Specify different features of the pegman animation.
   * type required type for the pegman (movePegman, celebratePegman, etc.).
   * pegmanImage required which image to use for the animation.
   * col which column the pegman is at.
   * row which row the pegman is at.
   * direction which direction the pegman is facing at.
   * numColPegman number of the pegman in each row, default is 4.
   * numRowPegman number of the pegman in each column, default is 1.
   * pegmanId id of pegman to create animation for. If no id is provided, the default will
   *   be used.
   */
  createPegmanAnimation_(options) {
    // Create clip path.
    var clip = document.createElementNS(SVG_NS, 'clipPath');
    const pegmanClipId = utils.getPegmanElementId(`${options.type}Clip`, options.pegmanId);
    clip.setAttribute('id', pegmanClipId);
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('id', utils.getPegmanElementId(`${options.type}ClipRect`, options.pegmanId));
    if (options.col !== undefined) {
      rect.setAttribute('x', options.col * this.maze.SQUARE_SIZE + 1 + this.maze.PEGMAN_X_OFFSET);
    }
    if (options.row !== undefined) {
      rect.setAttribute('y', getPegmanYForRow(this.maze.skin, options.row, this.maze.SQUARE_SIZE));
    }
    rect.setAttribute('width', this.maze.PEGMAN_WIDTH);
    rect.setAttribute('height', this.maze.PEGMAN_HEIGHT);
    clip.appendChild(rect);
    this.svg.appendChild(clip);
    // Create image.
    var imgSrc = options.pegmanImage;
    var img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'xlink:href', imgSrc);
    // For single-column sprites, use actual dimensions; for multi-column, calculate from columns
    var imgWidth, imgHeight;
    if (options.numColPegman === 1) {
      // Single column: use actual sprite dimensions
      imgWidth = this.maze.PEGMAN_WIDTH;
      imgHeight = this.maze.PEGMAN_HEIGHT;
    } else {
      // Multi-column sprite sheet: calculate from columns/rows
      imgWidth = this.maze.PEGMAN_WIDTH * (options.numColPegman || 4);
      imgHeight = this.maze.PEGMAN_HEIGHT * (options.numRowPegman || 1);
    }
    img.setAttribute('width', imgWidth);
    img.setAttribute('height', imgHeight);
    // Only apply clip path for multi-column sprites (single column doesn't need clipping)
    if (options.numColPegman !== 1) {
      img.setAttribute('clip-path', 'url(#' + pegmanClipId + ')');
    }
    img.setAttribute('id', utils.getPegmanElementId(options.type, options.pegmanId));
    // Set initial visibility - IDLE should be visible, others hidden initially
    if (options.type === pegmanElements.IDLE) {
      img.setAttribute('visibility', 'visible');
    } else {
      img.setAttribute('visibility', 'hidden');
    }
    this.svg.appendChild(img);
    // Update pegman icon & clip path.
    if (options.col !== undefined) {
      var x;
      if (options.numColPegman === 1) {
        // Single-column sprites: center the image, no direction offset
        x = this.maze.SQUARE_SIZE * options.col + (this.maze.SQUARE_SIZE - this.maze.PEGMAN_WIDTH) / 2 + 1 + this.maze.PEGMAN_X_OFFSET;
      } else if (options.direction !== undefined) {
        // Multi-column sprite sheet: use direction offset
        // Note: actual column width will be calculated in updatePegmanAnimation_ after image loads
        var directionOffset = options.direction * this.maze.PEGMAN_WIDTH;
        x = this.maze.SQUARE_SIZE * options.col - directionOffset + 1 + this.maze.PEGMAN_X_OFFSET;
      } else {
        // No direction specified: just position at column
        x = this.maze.SQUARE_SIZE * options.col + 1 + this.maze.PEGMAN_X_OFFSET;
      }
      img.setAttribute('x', x);
    }
    if (options.row !== undefined) {
      var y = getPegmanYForRow(this.maze.skin, options.row, this.maze.SQUARE_SIZE);
      img.setAttribute('y', y);
    }
  }

  /**
   * Calculate the Y offset within the sheet
   */
  getPegmanFrameOffsetY_(animationRow) {
    animationRow = animationRow || 0;
    return animationRow * this.maze.PEGMAN_HEIGHT;
  }

  /**
    * Update sprite assets for pegman.
    * @param options Specify different features of the pegman animation.
    * type required identifier for the pegman.
    * col required which column the pegman is at.
    * row required which row the pegman is at.
    * direction required which direction the pegman is facing at.
    * animationRow which row of the sprite sheet the pegman animation needs
    * pegmanId id of pegman to create animation for. If no id is provided, the default will
    *   be used.
    */
  updatePegmanAnimation_(options) {
    var rect = document.getElementById(utils.getPegmanElementId(`${options.type}ClipRect`, options.pegmanId));
    if (!rect) {
      return;
    }
    rect.setAttribute('x', options.col * this.maze.SQUARE_SIZE + 1 + this.maze.PEGMAN_X_OFFSET);
    rect.setAttribute('y', getPegmanYForRow(this.maze.skin, options.row, this.maze.SQUARE_SIZE));
    var img = document.getElementById(utils.getPegmanElementId(options.type, options.pegmanId));
    if (!img) {
      return;
    }
    // Calculate x position - for single-column, center it; for multi-column, use direction offset
    var x, directionOffset;
    if (options.type === pegmanElements.IDLE) {
      // IDLE: Use original behavior (offset by direction)
      directionOffset = options.direction * this.maze.PEGMAN_WIDTH;
      x = this.maze.SQUARE_SIZE * options.col - directionOffset + 1 + this.maze.PEGMAN_X_OFFSET;
    } else {
      // Multi-column sprite sheet: use direction offset
      directionOffset = options.direction * this.maze.PEGMAN_WIDTH;
      x = this.maze.SQUARE_SIZE * options.col - directionOffset + 1 + this.maze.PEGMAN_X_OFFSET;
    }
    img.setAttribute('x', x);
    // GLOBAL ANIMATION DISABLE: Always use animationRow 0 (first frame)
    var y = getPegmanYForRow(this.maze.skin, options.row, this.maze.SQUARE_SIZE) - this.getPegmanFrameOffsetY_(0); // options.animationRow
    img.setAttribute('y', y);
    
    // Remove any transform (we're not using rotation for now)
    img.removeAttribute('transform');
    
    img.setAttribute('visibility', 'visible');
  }

  /**
   * Schedule a movement animating using a spritesheet.
   */
  scheduleSheetedMovement_(start, delta, numFrames, timePerFrame, type, direction, hidePegman, pegmanId) {
    // GLOBAL ANIMATION DISABLE: Force numFrames to 1 to show only first frame
    numFrames = 1;
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    utils.range(0, numFrames - 1).forEach((frame) => {
      timeoutList.setTimeout(() => {
        if (hidePegman) {
          pegmanIcon.setAttribute('visibility', 'hidden');
        }
        this.updatePegmanAnimation_({
          type: type,
          col: start.x + delta.x * frame / numFrames,
          row: start.y + delta.y * frame / numFrames,
          direction: direction,
          animationRow: 0, // GLOBAL ANIMATION DISABLE: Always use frame 0
          pegmanId
        });
      }, timePerFrame * frame);
    });
  }

  /**
   * Schedule the animations for a move from the current position
   * @param {number} endX X coordinate of the target position
   * @param {number} endY Y coordinate of the target position  
   * @param {string} pegmanId Optional id of pegman. If no id is provided,
   *   will schedule move for default pegman.
   */
  scheduleMove(endX, endY, timeForAnimation, pegmanId) {
    const startX = this.maze.getPegmanX(pegmanId);
    const startY = this.maze.getPegmanY(pegmanId);
    const direction = this.maze.getPegmanD(pegmanId);

    const deltaX = (endX - startX);
    const deltaY = (endY - startY);
    var numFrames;
    var timePerFrame;

    if (this.maze.skin.movePegmanAnimation) {
      // GLOBAL ANIMATION DISABLE: Force numFrames to 1
      numFrames = 1; // this.maze.skin.movePegmanAnimationFrameNumber;
      // If move animation of pegman is set, and this is not a turn.
      // Show the animation.
      var pegmanIcon = this.getPegmanIcon(pegmanId);
      var movePegmanIcon = document.getElementById(utils.getPegmanElementId(pegmanElements.MOVE, pegmanId));
      timePerFrame = timeForAnimation / numFrames;

      this.scheduleSheetedMovement_({
          x: startX,
          y: startY
        }, {
          x: deltaX,
          y: deltaY
        },
        numFrames, timePerFrame, pegmanElements.MOVE, direction, true, pegmanId);

      // Hide movePegman and show pegman icon (like at the beginning)
      timeoutList.setTimeout(() => {
        movePegmanIcon.setAttribute('visibility', 'hidden');
        // Hide idle animation and show pegman icon
        var idlePegmanIcon = document.getElementById(
          utils.getPegmanElementId(pegmanElements.IDLE, pegmanId)
        );
        if (idlePegmanIcon) {
          idlePegmanIcon.setAttribute('visibility', 'hidden');
        }
        // Force pegman icon to be visible
        pegmanIcon.setAttribute('visibility', 'visible');
        pegmanIcon.setAttribute('opacity', '1');
        this.displayPegman(endX, endY, tiles.directionToFrame(direction), pegmanId);
        // Double-check after a short delay
        timeoutList.setTimeout(() => {
          pegmanIcon.setAttribute('visibility', 'visible');
          pegmanIcon.setAttribute('opacity', '1');
        }, 50);
        if (this.maze.subtype.isWordSearch()) {
          this.maze.subtype.markTileVisited(endY, endX, true);
        }
      }, timePerFrame * numFrames);
    } else {
      // we don't have an animation, so just move the x/y pos
      numFrames = 4;
      timePerFrame = timeForAnimation / numFrames;
      utils.range(1, numFrames).forEach((frame) => {
        timeoutList.setTimeout(() => {
          this.displayPegman(
            startX + deltaX * frame / numFrames,
            startY + deltaY * frame / numFrames,
            tiles.directionToFrame(direction),
            pegmanId);
        }, timePerFrame * frame);
      });
    }

    if (this.maze.skin.approachingGoalAnimation) {
      var finishIcon = document.getElementById('finish');
      // If pegman is close to the goal
      // Replace the goal file with approachingGoalAnimation
      if (this.maze.subtype.finish && Math.abs(endX - this.maze.subtype.finish.x) <= 1 &&
          Math.abs(endY - this.maze.subtype.finish.y) <= 1) {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          this.maze.skin.approachingGoalAnimation);
      } else {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          this.maze.skin.goalIdle);
      }
    }
  }

  /**
   * Schedule the animations for a turn from the current direction
   * DISABLED: Turn animation disabled - instantly switch to end direction
   * @param {number} endDirection The direction we're turning to  
   * @param {string} pegmanId Optional id of pegman. If no id is provided,
   *   will schedule turn for default pegman.
   */
  scheduleTurn(endDirection, pegmanId) {
    // DISABLED: Turn animations completely - just update direction without clip_rect manipulation
    // Use direction directly as frame (0=N, 1=E, 2=S, 3=W) for 4-column sprite sheets
    var x = this.maze.getPegmanX(pegmanId);
    var y = this.maze.getPegmanY(pegmanId);
    // Use direction directly as column index (0, 1, 2, 3) instead of directionToFrame
    var frame = tiles.constrainDirection4(endDirection);
    this.displayPegman(x, y, frame, pegmanId);
  }

  /**
   * Schedule the animations for a turn to the given direction, without
   * animating any of the intermediate frames.
   * @param {number} endDirection The direction we're turning to  
   * @param {string} pegmanId Optional id of pegman. If no id is provided,
   *   will schedule turn for default pegman.
   */
  simpleTurn(endDirection, pegmanId) {
    // DISABLED: Turn animations for bird/scrat - instant update (0 seconds)
    // Use direction directly as frame (0=N, 1=E, 2=S, 3=W) for 4-column sprite sheets
    // Just update the display immediately without any animation frames
    var frame = tiles.constrainDirection4(endDirection);
    this.displayPegman(
      this.maze.getPegmanX(pegmanId),
      this.maze.getPegmanY(pegmanId),
      frame,
      pegmanId);
    // COMMENTED OUT: Original animation code with frames and timeouts
    // var numFrames = 2;
    // utils.range(1, numFrames).forEach((frame) => {
    //   timeoutList.setTimeout(() => {
    //     this.displayPegman(
    //       this.maze.getPegmanX(pegmanId),
    //       this.maze.getPegmanY(pegmanId),
    //       tiles.directionToFrame(endDirection),
    //       pegmanId);
    //     }, this.maze.stepSpeed * (frame - 1));
    // });    
  }

  crackSurroundingIce(targetX, targetY) {
    // Remove cracked ice, replace surrounding ice with cracked ice.
    this.updateSurroundingTiles_(targetY, targetX, (tileElement, cell) => {
      if (cell.getTile() === tiles.SquareType.OPEN) {
        tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href',
          this.maze.skin.largerObstacleAnimationTiles
        );
      } else if (cell.getTile() === tiles.SquareType.OBSTACLE) {
        tileElement.setAttribute('opacity', 0);
      }
    });
  }

  /**
   * Replace the tiles surrounding the obstacle with broken tiles.
   */
  updateSurroundingTiles_(obstacleY, obstacleX, callback) {
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
    for (let idx = 0; idx < tileCoords.length; ++idx) {
      const row = tileCoords[idx][1];
      const col = tileCoords[idx][0];
      const tileIdx = row + this.maze.map.COLS * col;
      const tileElement = document.getElementById('tileElement' + tileIdx);
      if (tileElement) {
        callback(tileElement, this.maze.map.getCell(col, row));
      }
    }
  }

  scheduleWallHit(targetX, targetY, deltaX, deltaY, frame, pegmanId) {
    // Play the animation of hitting the wall
    const pegmanX = this.maze.getPegmanX(pegmanId);
    const pegmanY = this.maze.getPegmanY(pegmanId);
    if (this.maze.skin.hittingWallAnimation) {
      var wallAnimationIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.WALL_ANIMATION, pegmanId)
      );
      // GLOBAL ANIMATION DISABLE: Force numFrames to 1
      var numFrames = 1; // this.maze.skin.hittingWallAnimationFrameNumber || 0;

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
        this.scheduleSheetedMovement_({
            x: pegmanX,
            y: pegmanY
          }, {
            x: deltaX,
            y: deltaY
          }, numFrames, timePerFrame, pegmanElements.WALL,
          tiles.Direction.NORTH, true, pegmanId);
        setTimeout(function () {
          document.getElementById(
            utils.getPegmanElementId(pegmanElements.WALL, pegmanId)
          ).setAttribute('visibility', 'hidden');
        }, numFrames * timePerFrame);
      } else {
        // active our gif
        timeoutList.setTimeout(() => {
          wallAnimationIcon.setAttribute('x',
            this.maze.SQUARE_SIZE * (pegmanX + 0.5 + deltaX * 0.5) -
            wallAnimationIcon.getAttribute('width') / 2);
          wallAnimationIcon.setAttribute('y',
            this.maze.SQUARE_SIZE * (pegmanY + 1 + deltaY * 0.5) -
            wallAnimationIcon.getAttribute('height'));
          wallAnimationIcon.setAttribute('visibility', 'visible');
          wallAnimationIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href',
            this.maze.skin.hittingWallAnimation);
        }, this.maze.stepSpeed / 2);
      }
    }
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, frame, pegmanId);
    }, this.maze.stepSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX + deltaX / 4, pegmanY + deltaY / 4,
        frame, pegmanId);
    }, this.maze.stepSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, frame, pegmanId);
    }, this.maze.stepSpeed * 3);

    if (this.maze.skin.wallPegmanAnimation) {
      timeoutList.setTimeout(() => {
        var pegmanIcon = this.getPegmanIcon(pegmanId);
        pegmanIcon.setAttribute('visibility', 'hidden');
        this.updatePegmanAnimation_({
          type: pegmanElements.WALL,
          row: pegmanY,
          col: pegmanX,
          direction: this.maze.getPegmanD(pegmanId)
        });
      }, this.maze.stepSpeed * 4);
    }
  }

  scheduleObstacleHit(targetX, targetY, deltaX, deltaY, frame, pegmanId) {
    // Play the animation
    var obsId = targetX + this.maze.map.COLS * targetY;
    var obsIcon = document.getElementById('obstacle' + obsId);
    obsIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'xlink:href',
        this.maze.skin.obstacleAnimation);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.maze.getPegmanX(pegmanId) + deltaX / 2,
                        this.maze.getPegmanY(pegmanId)+ deltaY / 2,
                        frame);
    }, this.maze.stepSpeed);

    // Replace the objects around obstacles with broken objects
    if (this.maze.skin.largerObstacleAnimationTiles) {
      timeoutList.setTimeout(() => {
        this.updateSurroundingTiles_(targetY, targetX, tileElement => (
          tileElement.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href',
            this.maze.skin.largerObstacleAnimationTiles
          )
        ));
      }, this.maze.stepSpeed);
    }

    // Remove pegman
    if (!this.maze.skin.nonDisappearingPegmanHittingObstacle) {
      var pegmanIcon = this.getPegmanIcon(pegmanId);

      timeoutList.setTimeout(function () {
        pegmanIcon.setAttribute('visibility', 'hidden');
      }, this.maze.stepSpeed * 2);
    }
  }

  scheduleLook(x, y, d) {
    var lookIcon = document.getElementById('look');
    lookIcon.setAttribute('transform',
        'translate(' + x + ', ' + y + ') ' +
        'rotate(' + d + ' 0 0) scale(.4)');
    var paths = lookIcon.getElementsByTagName('path');
    lookIcon.style.display = 'inline';
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      this.scheduleLookStep_(path, this.maze.stepSpeed * i);
    }
  }

  /**
   * Schedule one of the 'look' icon's waves to appear, then disappear.
   * @param {!Element} path Element to make appear.
   * @param {number} delay Milliseconds to wait before making wave appear.
   */
  scheduleLookStep_(path, delay) {
    timeoutList.setTimeout(() => {
      path.style.display = 'inline';
      window.setTimeout(function () {
        path.style.display = 'none';
      }, this.maze.stepSpeed * 2);
    }, delay);
  }

  stopIdling(pegmanId) {
    // Removing the idle animation and replace with pegman sprite
    if (this.maze.skin.idlePegmanAnimation) {
      var pegmanIcon = this.getPegmanIcon(pegmanId);
      var idlePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.IDLE, pegmanId)
      );
      idlePegmanIcon.setAttribute('visibility', 'hidden');
      pegmanIcon.setAttribute('visibility', 'visible');
    }
  }

  hidePegman(pegmanId) {
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    pegmanIcon.setAttribute('visibility', 'hidden');
  }

  showPegman(pegmanId) {
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    pegmanIcon.setAttribute('visibility', 'visible');
  }

  /**
   * Schedule the animations and sound for a dance.
   * @param {boolean} victoryDance This is a victory dance after completing the
   *   puzzle (vs. dancing on load).
   * @param {integer} timeAlloted How much time we have for our animations
   * @param {string} pegmanId Optional id of pegman. If no id is provided, will schedule
   *   dance for default pegman.
   */
  scheduleDance(victoryDance, timeAlloted, pegmanId) {
    const finishIcon = document.getElementById('finish');
    const pegmanX = this.maze.getPegmanX(pegmanId);
    const pegmanY = this.maze.getPegmanY(pegmanId);

    // Some skins (like scrat) have custom celebration animations we want to
    // suport
    if (victoryDance && this.maze.skin.celebrateAnimation) {
      if (finishIcon) {
        finishIcon.setAttribute('visibility', 'visible');
      }
      // GLOBAL ANIMATION DISABLE: Force numFrames to 1
      const numFrames = 1; // this.maze.skin.celebratePegmanRow;
      const timePerFrame = timeAlloted / numFrames;
      const start = { x: pegmanX, y: pegmanY };

      this.scheduleSheetedMovement_(
        { x: start.x, y: start.y },
        { x: 0, y: 0 },
        numFrames,
        timePerFrame,
        pegmanElements.CELEBRATE,
        tiles.Direction.NORTH,
        true,
        pegmanId
      );
      
      // After celebrate animation completes, show pegman icon
      timeoutList.setTimeout(() => {
        var celebratePegmanIcon = document.getElementById(
          utils.getPegmanElementId(pegmanElements.CELEBRATE, pegmanId)
        );
        var idlePegmanIcon = document.getElementById(
          utils.getPegmanElementId(pegmanElements.IDLE, pegmanId)
        );
        var pegmanIcon = this.getPegmanIcon(pegmanId);
        
        if (celebratePegmanIcon) {
          celebratePegmanIcon.setAttribute('visibility', 'hidden');
        }
        if (idlePegmanIcon) {
          idlePegmanIcon.setAttribute('visibility', 'hidden');
        }
        // Force pegman icon to be visible
        if (pegmanIcon) {
          pegmanIcon.setAttribute('visibility', 'visible');
          pegmanIcon.setAttribute('opacity', '1');
          var originalFrame = tiles.directionToFrame(this.maze.getPegmanD(pegmanId));
          this.displayPegman(pegmanX, pegmanY, originalFrame, pegmanId);
          // Double-check after a short delay
          timeoutList.setTimeout(() => {
            pegmanIcon.setAttribute('visibility', 'visible');
            pegmanIcon.setAttribute('opacity', '1');
          }, 100);
        }
      }, timePerFrame * numFrames);
      return;
    }

    // Show pegman icon (like at the beginning) - hide idle animation
    var idlePegmanIcon = document.getElementById(
      utils.getPegmanElementId(pegmanElements.IDLE, pegmanId)
    );
    var movePegmanIcon = document.getElementById(
      utils.getPegmanElementId(pegmanElements.MOVE, pegmanId)
    );
    var celebratePegmanIcon = document.getElementById(
      utils.getPegmanElementId(pegmanElements.CELEBRATE, pegmanId)
    );
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    
    // Hide all animation icons
    if (idlePegmanIcon) {
      idlePegmanIcon.setAttribute('visibility', 'hidden');
    }
    if (movePegmanIcon) {
      movePegmanIcon.setAttribute('visibility', 'hidden');
    }
    if (celebratePegmanIcon) {
      celebratePegmanIcon.setAttribute('visibility', 'hidden');
    }
    
    // Force pegman icon to be visible - AGGRESSIVE: multiple checks
    if (pegmanIcon) {
      pegmanIcon.setAttribute('visibility', 'visible');
      pegmanIcon.setAttribute('opacity', '1');
      var originalFrame = tiles.directionToFrame(this.maze.getPegmanD(pegmanId));
      this.displayPegman(pegmanX, pegmanY, originalFrame, pegmanId);
      
      // Multiple timeouts to ensure it stays visible (in case something tries to hide it)
      [50, 100, 200, 500, 1000].forEach(delay => {
        timeoutList.setTimeout(() => {
          if (pegmanIcon) {
            pegmanIcon.setAttribute('visibility', 'visible');
            pegmanIcon.setAttribute('opacity', '1');
            if (idlePegmanIcon) {
              idlePegmanIcon.setAttribute('visibility', 'hidden');
            }
            if (movePegmanIcon) {
              movePegmanIcon.setAttribute('visibility', 'hidden');
            }
            if (celebratePegmanIcon) {
              celebratePegmanIcon.setAttribute('visibility', 'hidden');
            }
          }
        }, delay);
      });
    }

    // If victoryDance === true, play the goal animation, else reset it
    if (victoryDance && finishIcon) {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        this.maze.skin.goalAnimation);
    }

    var danceSpeed = timeAlloted / 5;
    timeoutList.setTimeout(() => {
      if (victoryDance && this.maze.skin.transparentTileEnding) {
        this.setTileTransparent_();
      }

      if (this.maze.subtype.isWordSearch()) {
        this.setPegmanTransparent_();
      }
    }, danceSpeed * 5);
  }

  /**
   * Set the tiles to be transparent gradually.
   */
  setTileTransparent_() {
    var tileId = 0;
    for (var y = 0; y < this.maze.map.ROWS; y++) {
      for (var x = 0; x < this.maze.map.COLS; x++) {
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

  setPegmanTransparent_(pegmanId) {
    var pegmanFadeoutAnimation = document.getElementById(utils.getPegmanElementId(pegmanElements.FADEOUT, pegmanId));
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    if (pegmanIcon) {
      pegmanIcon.setAttribute('opacity', 0);
    }
    if (pegmanFadeoutAnimation && pegmanFadeoutAnimation.beginElement) {
      // IE doesn't support beginElement, so check for it.
      pegmanFadeoutAnimation.beginElement();
    }
  }

  /**
   * Display Pegman at the specified location, facing the specified direction.
   * @param {number} x Horizontal grid (or fraction thereof).
   * @param {number} y Vertical grid (or fraction thereof).
   * @param {number} frame Direction (0 - 15) or dance (16 - 17). * 
   * @param {string} id Optional id of pegman. If no id is provided,
   *   will display default pegman.
   */
  displayPegman(x, y, frame, pegmanId) {
    var pegmanIcon = this.getPegmanIcon(pegmanId);
    var clipRect = document.getElementById(utils.getPegmanElementId(pegmanElements.CLIP_RECT, pegmanId));
    displayPegman(this.maze.skin, pegmanIcon, clipRect, x, y, frame, this.maze.SQUARE_SIZE);
  }

  getPegmanIcon(pegmanId) {
    return document.getElementById(utils.getPegmanElementId(pegmanElements.PEGMAN, pegmanId));
  }

  addNewPegman(pegmanId, x, y, d) {
    addNewPegman(this.maze.skin, pegmanId, x, y, d, this.svg, this.maze.SQUARE_SIZE);
  }
};
