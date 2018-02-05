import { SVG_NS } from '../constants';
import { displayPegman, getPegmanYForRow } from './drawMap';
import * as timeoutList from '../lib/util/timeoutList';
import * as utils from '../utils';
import {
  Direction,
  SquareType,
  directionToFrame,
} from './tiles';

export default class AnimationsController {
  constructor(maze, svg) {
    this.maze = maze;
    this.svg = svg;

    this.createAnimations_();
  }

  createAnimations_() {
    // Add idle pegman.
    if (this.maze.skin.idlePegmanAnimation) {
      this.createPegmanAnimation_({
        idStr: 'idle',
        pegmanImage: this.maze.skin.idlePegmanAnimation,
        row: this.maze.subtype.start.y,
        col: this.maze.subtype.start.x,
        direction: this.maze.startDirection,
        numColPegman: this.maze.skin.idlePegmanCol,
        numRowPegman: this.maze.skin.idlePegmanRow
      });

      if (this.maze.skin.idlePegmanCol > 1 || this.maze.skin.idlePegmanRow > 1) {
        // our idle is a sprite sheet instead of a gif. schedule cycling through
        // the frames
        var numFrames = this.maze.skin.idlePegmanRow;
        var idlePegmanIcon = document.getElementById('idlePegman');
        var timePerFrame = 600; // timeForAnimation / numFrames;
        var idleAnimationFrame = 0;

        setInterval(() => {
          if (idlePegmanIcon.getAttribute('visibility') === 'visible') {
            this.updatePegmanAnimation_({
              idStr: 'idle',
              row: this.maze.subtype.start.y,
              col: this.maze.subtype.start.x,
              direction: this.maze.startDirection,
              animationRow: idleAnimationFrame
            });
            idleAnimationFrame = (idleAnimationFrame + 1) % numFrames;
          }
        }, timePerFrame);
      }
    }

    if (this.maze.skin.celebrateAnimation) {
      this.createPegmanAnimation_({
        idStr: 'celebrate',
        pegmanImage: this.maze.skin.celebrateAnimation,
        row: this.maze.subtype.start.y,
        col: this.maze.subtype.start.x,
        direction: Direction.NORTH,
        numColPegman: this.maze.skin.celebratePegmanCol,
        numRowPegman: this.maze.skin.celebratePegmanRow
      });
    }

    // Add the hidden dazed pegman when hitting the wall.
    if (this.maze.skin.wallPegmanAnimation) {
      this.createPegmanAnimation_({
        idStr: 'wall',
        pegmanImage: this.maze.skin.wallPegmanAnimation
      });
    }

    // create element for our hitting wall spritesheet
    if (this.maze.skin.hittingWallAnimation && this.maze.skin.hittingWallAnimationFrameNumber) {
      this.createPegmanAnimation_({
        idStr: 'wall',
        pegmanImage: this.maze.skin.hittingWallAnimation,
        numColPegman: this.maze.skin.hittingWallPegmanCol,
        numRowPegman: this.maze.skin.hittingWallPegmanRow
      });
      document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
    }

    // Add the hidden moving pegman animation.
    if (this.maze.skin.movePegmanAnimation) {
      this.createPegmanAnimation_({
        idStr: 'move',
        pegmanImage: this.maze.skin.movePegmanAnimation,
        numColPegman: 4,
        numRowPegman: (this.maze.skin.movePegmanAnimationFrameNumber || 9)
      });
    }

    // Add wall hitting animation
    if (this.maze.skin.hittingWallAnimation) {
      var wallAnimationIcon = document.createElementNS(SVG_NS, 'image');
      wallAnimationIcon.setAttribute('id', 'wallAnimation');
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
        this.scheduleTurn_(this.maze.startDirection);
      }, danceTime + 150);
    } else {
      this.displayPegman(this.pegmanX, this.pegmanY, directionToFrame(this.pegmanD));

      const finishIcon = document.getElementById('finish');
      if (finishIcon) {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.maze.skin.goalIdle);
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

    // Reset pegman's visibility.
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.setAttribute('opacity', 1);

    if (this.maze.skin.idlePegmanAnimation) {
      pegmanIcon.setAttribute('visibility', 'hidden');
      var idlePegmanIcon = document.getElementById('idlePegman');
      idlePegmanIcon.setAttribute('visibility', 'visible');
    } else {
      pegmanIcon.setAttribute('visibility', 'visible');
    }

    if (this.maze.skin.wallPegmanAnimation) {
      var wallPegmanIcon = document.getElementById('wallPegman');
      wallPegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.movePegmanAnimation) {
      var movePegmanIcon = document.getElementById('movePegman');
      movePegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.celebrateAnimation) {
      var celebrateAnimation = document.getElementById('celebratePegman');
      celebrateAnimation.setAttribute('visibility', 'hidden');
    }
  }

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
  createPegmanAnimation_(options) {
    // Create clip path.
    var clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', options.idStr + 'PegmanClip');
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('id', options.idStr + 'PegmanClipRect');
    if (options.col !== undefined) {
      rect.setAttribute('x', options.col * this.maze.SQUARE_SIZE + 1 + this.maze.PEGMAN_X_OFFSET);
    }
    if (options.row !== undefined) {
      rect.setAttribute('y', getPegmanYForRow(this.maze.skin, options.row));
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
    img.setAttribute('height', this.maze.PEGMAN_HEIGHT * (options.numRowPegman || 1));
    img.setAttribute('width', this.maze.PEGMAN_WIDTH * (options.numColPegman || 4));
    img.setAttribute('clip-path', 'url(#' + options.idStr + 'PegmanClip)');
    img.setAttribute('id', options.idStr + 'Pegman');
    this.svg.appendChild(img);
    // Update pegman icon & clip path.
    if (options.col !== undefined && options.direction !== undefined) {
      var x = this.maze.SQUARE_SIZE * options.col -
        options.direction * this.maze.PEGMAN_WIDTH + 1 + this.maze.PEGMAN_X_OFFSET;
      img.setAttribute('x', x);
    }
    if (options.row !== undefined) {
      img.setAttribute('y', getPegmanYForRow(this.maze.skin, options.row));
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
    * idStr required identifier for the pegman.
    * col required which column the pegman is at.
    * row required which row the pegman is at.
    * direction required which direction the pegman is facing at.
    * animationRow which row of the sprite sheet the pegman animation needs
    */
  updatePegmanAnimation_(options) {
    var rect = document.getElementById(options.idStr + 'PegmanClipRect');
    rect.setAttribute('x', options.col * this.maze.SQUARE_SIZE + 1 + this.maze.PEGMAN_X_OFFSET);
    rect.setAttribute('y', getPegmanYForRow(this.maze.skin, options.row));
    var img = document.getElementById(options.idStr + 'Pegman');
    var x = this.maze.SQUARE_SIZE * options.col -
        options.direction * this.maze.PEGMAN_WIDTH + 1 + this.maze.PEGMAN_X_OFFSET;
    img.setAttribute('x', x);
    var y = getPegmanYForRow(this.maze.skin, options.row) - this.getPegmanFrameOffsetY_(options.animationRow);
    img.setAttribute('y', y);
    img.setAttribute('visibility', 'visible');
  }

  /**
   * Schedule a movement animating using a spritesheet.
   */
  scheduleSheetedMovement_(start, delta, numFrames, timePerFrame, idStr, direction, hidePegman) {
    var pegmanIcon = document.getElementById('pegman');
    utils.range(0, numFrames - 1).forEach((frame) => {
      timeoutList.setTimeout(() => {
        if (hidePegman) {
          pegmanIcon.setAttribute('visibility', 'hidden');
        }
        this.updatePegmanAnimation_({
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
  scheduleMove(endX, endY, timeForAnimation) {
    var startX = this.pegmanX;
    var startY = this.pegmanY;
    var direction = this.pegmanD;

    var deltaX = (endX - startX);
    var deltaY = (endY - startY);
    var numFrames;
    var timePerFrame;

    if (this.maze.skin.movePegmanAnimation) {
      numFrames = this.maze.skin.movePegmanAnimationFrameNumber;
      // If move animation of pegman is set, and this is not a turn.
      // Show the animation.
      var pegmanIcon = document.getElementById('pegman');
      var movePegmanIcon = document.getElementById('movePegman');
      timePerFrame = timeForAnimation / numFrames;

      this.scheduleSheetedMovement_({
          x: startX,
          y: startY
        }, {
          x: deltaX,
          y: deltaY
        },
        numFrames, timePerFrame, 'move', direction, true);

      // Hide movePegman and set pegman to the end position.
      timeoutList.setTimeout(() => {
        movePegmanIcon.setAttribute('visibility', 'hidden');
        pegmanIcon.setAttribute('visibility', 'visible');
        this.displayPegman(endX, endY, directionToFrame(direction));
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
            directionToFrame(direction));
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
   * @param {number} endDirection The direction we're turning to
   */
  scheduleTurn(endDirection) {
    var numFrames = 4;
    var startDirection = this.pegmanD;
    var deltaDirection = endDirection - startDirection;
    utils.range(1, numFrames).forEach((frame) => {
      timeoutList.setTimeout(() => {
        this.displayPegman(
          this.pegmanX,
          this.pegmanY,
          directionToFrame(startDirection + deltaDirection * frame / numFrames));
      }, this.maze.stepSpeed * (frame - 1));
    });
  }

  crackSurroundingIce(targetX, targetY) {
    // Remove cracked ice, replace surrounding ice with cracked ice.
    this.updateSurroundingTiles_(targetY, targetX, (tileElement, cell) => {
      if (cell.getTile() === SquareType.OPEN) {
        tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href',
          this.maze.skin.largerObstacleAnimationTiles
        );
      } else if (cell.getTile() === SquareType.OBSTACLE) {
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

  scheduleWallHit(targetX, targetY, deltaX, deltaY, frame) {
    // Play the animation of hitting the wall
    if (this.maze.skin.hittingWallAnimation) {
      var wallAnimationIcon = document.getElementById('wallAnimation');
      var numFrames = this.maze.skin.hittingWallAnimationFrameNumber || 0;

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
            x: this.pegmanX,
            y: this.pegmanY
          }, {
            x: deltaX,
            y: deltaY
          }, numFrames, timePerFrame, 'wall',
          Direction.NORTH, true);
        setTimeout(function () {
          document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
        }, numFrames * timePerFrame);
      } else {
        // active our gif
        timeoutList.setTimeout(() => {
          wallAnimationIcon.setAttribute('x',
            this.maze.SQUARE_SIZE * (this.pegmanX + 0.5 + deltaX * 0.5) -
            wallAnimationIcon.getAttribute('width') / 2);
          wallAnimationIcon.setAttribute('y',
            this.maze.SQUARE_SIZE * (this.pegmanY + 1 + deltaY * 0.5) -
            wallAnimationIcon.getAttribute('height'));
          wallAnimationIcon.setAttribute('visibility', 'visible');
          wallAnimationIcon.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href',
            this.maze.skin.hittingWallAnimation);
        }, this.maze.stepSpeed / 2);
      }
    }
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, frame);
    }, this.maze.stepSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX + deltaX / 4, this.pegmanY + deltaY / 4,
        frame);
    }, this.maze.stepSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, frame);
    }, this.maze.stepSpeed * 3);

    if (this.maze.skin.wallPegmanAnimation) {
      timeoutList.setTimeout(() => {
        var pegmanIcon = document.getElementById('pegman');
        pegmanIcon.setAttribute('visibility', 'hidden');
        this.updatePegmanAnimation_({
          idStr: 'wall',
          row: this.pegmanY,
          col: this.pegmanX,
          direction: this.pegmanD
        });
      }, this.maze.stepSpeed * 4);
    }
  }

  scheduleObstacleHit(targetX, targetY, deltaX, deltaY, frame) {
    // Play the animation
    var obsId = targetX + this.maze.map.COLS * targetY;
    var obsIcon = document.getElementById('obstacle' + obsId);
    obsIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'xlink:href',
        this.maze.skin.obstacleAnimation);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX + deltaX / 2,
                        this.pegmanY + deltaY / 2,
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
      var pegmanIcon = document.getElementById('pegman');

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

  /**
   * Perform our animations, either all of them or those of a single step
   */
  scheduleAnimations(singleStep, onAnimationEnd) {
    timeoutList.clearTimeouts();

    var timePerAction = this.maze.stepSpeed * this.scale.stepSpeed *
      this.maze.skin.movePegmanAnimationSpeedScale;
    // get a flat list of actions we want to schedule
    var actions = this.executionInfo.getActions(singleStep);

    this.scheduleSingleAnimation_(0, actions, singleStep, timePerAction, onAnimationEnd);
  }

  /**
   * schedule animations in sequence
   * The reason we do this recursively instead of iteratively is that we want to
   * ensure that we finish scheduling action1 before starting to schedule
   * action2. Otherwise we get into trouble when stepSpeed is 0.
   */
  scheduleSingleAnimation_(index, actions, singleStep, timePerAction, onAnimationEnd) {
    if (index >= actions.length) {
      this.finishAnimations_(singleStep, onAnimationEnd);
      return;
    }

    this.animateAction_(actions[index], singleStep, timePerAction);

    var command = actions[index] && actions[index].command;
    var timeModifier = (this.maze.skin.actionSpeedScale && this.maze.skin.actionSpeedScale[command]) || 1;
    var timeForThisAction = Math.round(timePerAction * timeModifier);

    timeoutList.setTimeout(() => {
      this.scheduleSingleAnimation_(index + 1, actions, singleStep, timePerAction);
    }, timeForThisAction);
  }

  /**
   * Once animations are complete, we want to reenable the step button if we
   * have steps left, otherwise we're done with this execution.
   */
  finishAnimations_(singleStep, onAnimationEnd) {
    var stepsRemaining = this.executionInfo.stepsRemaining();
    var stepButton = document.getElementById('stepButton');

    // allow time for  additional pause if we're completely done
    var waitTime = (stepsRemaining ? 0 : 1000);

    // run after all animations
    timeoutList.setTimeout(() => {
      if (stepsRemaining) {
        stepButton.removeAttribute('disabled');
      } else {
        onAnimationEnd(singleStep);
      }
    }, waitTime);
  }

  stopIdling() {
    // Removing the idle animation and replace with pegman sprite
    if (this.maze.skin.idlePegmanAnimation) {
      var pegmanIcon = document.getElementById('pegman');
      var idlePegmanIcon = document.getElementById('idlePegman');
      idlePegmanIcon.setAttribute('visibility', 'hidden');
      pegmanIcon.setAttribute('visibility', 'visible');
    }
  }

  /**
   * Schedule the animations and sound for a dance.
   * @param {boolean} victoryDance This is a victory dance after completing the
   *   puzzle (vs. dancing on load).
   * @param {integer} timeAlloted How much time we have for our animations
   */
  scheduleDance(victoryDance, timeAlloted) {
    if (this.maze.subtype.scheduleDance) {
      this.maze.subtype.scheduleDance(victoryDance, timeAlloted, this.maze.skin);
      return;
    }

    var originalFrame = directionToFrame(this.pegmanD);
    this.displayPegman(this.pegmanX, this.pegmanY, 16);

    // If victoryDance === true, play the goal animation, else reset it
    var finishIcon = document.getElementById('finish');
    if (victoryDance && finishIcon) {
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        this.maze.skin.goalAnimation);
    }

    var danceSpeed = timeAlloted / 5;
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 18);
    }, danceSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 20);
    }, danceSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 18);
    }, danceSpeed * 3);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 20);
    }, danceSpeed * 4);

    timeoutList.setTimeout(() => {
      if (!victoryDance || this.maze.skin.turnAfterVictory) {
        this.displayPegman(this.pegmanX, this.pegmanY, originalFrame);
      }

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

  setPegmanTransparent_() {
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
   * Display Pegman at the specified location, facing the specified direction.
   * @param {number} x Horizontal grid (or fraction thereof).
   * @param {number} y Vertical grid (or fraction thereof).
   * @param {number} frame Direction (0 - 15) or dance (16 - 17).
   */
  displayPegman(x, y, frame) {
    var pegmanIcon = document.getElementById('pegman');
    var clipRect = document.getElementById('clipRect');
    displayPegman(this.maze.skin, pegmanIcon, clipRect, x, y, frame);
  }
}
