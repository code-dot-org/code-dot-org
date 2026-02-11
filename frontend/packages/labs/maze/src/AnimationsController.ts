import Cell from './Cell';
import {SVG_NS, pegmanElements} from './constants';
import {displayPegman, getPegmanYForRow, addNewPegman} from './drawMap';
import type MazeController from './MazeController';
import type {Point} from './Subtype';
import * as tiles from './tiles';
import * as timeoutList from './timeoutList';
import * as utils from './utils';
import type WordSearch from './WordSearch';

/**
 * The options that can be provided when creating a new animation.
 */
export interface AnimationOptions {
  /** Type for the pegman (movePegman, celebratePegman, etc.). */
  type: string;
  /** Which image to use for the animation. */
  pegmanImage: string;
  /** Which column the pegman is at. */
  col?: number;
  /** Which row the pegman is at. */
  row?: number;
  /** Which direction the pegman is facing. */
  direction?: number;
  /** The number of the pegman in each row, default is 4. */
  numColPegman?: number;
  /** The number of the pegman in each column, default is 1. */
  numRowPegman?: number;
  /**
   * The pegman id to create the animation for.
   * If no id is provided, the default will be used.
   */
  pegmanId?: string;
  /** Which row of the sprite sheet the pegman animation needs */
  animationRow?: number;
}

class AnimationsController {
  maze: MazeController;
  svg: SVGSVGElement;

  constructor(maze: MazeController, svg: SVGSVGElement) {
    this.maze = maze;
    this.svg = svg;

    this.createAnimations_();
  }

  createAnimations_(pegmanId?: string) {
    // Add idle pegman.
    if (this.maze.skin.idlePegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.IDLE,
        pegmanImage: this.maze.skin.idlePegmanAnimation,
        row: this.maze.subtype.start?.y || 0,
        col: this.maze.subtype.start?.x || 0,
        direction: this.maze.startDirection,
        numColPegman: this.maze.skin.idlePegmanCol,
        numRowPegman: this.maze.skin.idlePegmanRow,
        pegmanId: pegmanId,
      });

      if (
        (this.maze.skin.idlePegmanCol || 0) > 1 ||
        (this.maze.skin.idlePegmanRow || 0) > 1
      ) {
        // our idle is a sprite sheet instead of a gif. schedule cycling through
        // the frames
        const numFrames = this.maze.skin.idlePegmanRow || 1;
        const idlePegmanIcon = document.getElementById(
          utils.getPegmanElementId(pegmanElements.IDLE, pegmanId),
        );
        const timePerFrame = 600; // timeForAnimation / numFrames;
        let idleAnimationFrame = 0;

        timeoutList.setInterval(() => {
          if (idlePegmanIcon?.getAttribute('visibility') === 'visible') {
            this.updatePegmanAnimation_({
              type: pegmanElements.IDLE,
              row: this.maze.subtype.start?.y || 0,
              col: this.maze.subtype.start?.x || 0,
              direction: this.maze.startDirection,
              animationRow: idleAnimationFrame,
              pegmanId: pegmanId,
            });
            idleAnimationFrame = (idleAnimationFrame + 1) % numFrames;
          }
        }, timePerFrame);
      }
    }

    if (this.maze.skin.celebrateAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.CELEBRATE,
        pegmanImage: this.maze.skin.celebrateAnimation,
        row: this.maze.subtype.start?.y || 0,
        col: this.maze.subtype.start?.x || 0,
        direction: tiles.Direction.NORTH,
        numColPegman: this.maze.skin.celebratePegmanCol,
        numRowPegman: this.maze.skin.celebratePegmanRow,
        pegmanId: pegmanId,
      });
    }

    // Add the hidden dazed pegman when hitting the wall.
    if (this.maze.skin.wallPegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.WALL,
        pegmanImage: this.maze.skin.wallPegmanAnimation,
        pegmanId: pegmanId,
      });
    }

    // create element for our hitting wall spritesheet
    if (
      this.maze.skin.hittingWallAnimation &&
      this.maze.skin.hittingWallAnimationFrameNumber
    ) {
      this.createPegmanAnimation_({
        type: pegmanElements.WALL,
        pegmanImage: this.maze.skin.hittingWallAnimation,
        numColPegman: this.maze.skin.hittingWallPegmanCol,
        numRowPegman: this.maze.skin.hittingWallPegmanRow,
        pegmanId: pegmanId,
      });
      document
        .getElementById(utils.getPegmanElementId(pegmanElements.WALL, pegmanId))
        ?.setAttribute('visibility', 'hidden');
    }

    // Add the hidden moving pegman animation.
    if (this.maze.skin.movePegmanAnimation) {
      this.createPegmanAnimation_({
        type: pegmanElements.MOVE,
        pegmanImage: this.maze.skin.movePegmanAnimation,
        numColPegman: 4,
        numRowPegman: this.maze.skin.movePegmanAnimationFrameNumber || 9,
        pegmanId: pegmanId,
      });
    }

    // Add wall hitting animation
    if (this.maze.skin.hittingWallAnimation) {
      const wallAnimationIcon = document.createElementNS(SVG_NS, 'image');
      wallAnimationIcon?.setAttribute(
        'id',
        utils.getPegmanElementId(pegmanElements.WALL_ANIMATION, pegmanId),
      );
      wallAnimationIcon?.setAttribute(
        'height',
        this.maze.SQUARE_SIZE.toString(),
      );
      wallAnimationIcon?.setAttribute(
        'width',
        this.maze.SQUARE_SIZE.toString(),
      );
      wallAnimationIcon?.setAttribute('visibility', 'hidden');
      this.svg.appendChild(wallAnimationIcon);
    }
  }

  reset(first: boolean) {
    if (first) {
      // Dance consists of 5 animations, each of which get 150ms
      const danceTime = 150 * 5;
      if (this.maze.skin.danceOnLoad) {
        this.scheduleDance(false, danceTime);
      }
      timeoutList.setTimeout(() => {
        this.maze.stepSpeed = 100;
        this.scheduleTurn(this.maze.startDirection || 0);
      }, danceTime + 150);
    } else {
      // Reset the pegman for a maze with 1 pegman. Mazes that allow multiple
      // pegmen will only show/hide a static default, which is
      // reset by the maze controller.
      if (!this.maze.subtype.allowMultiplePegmen()) {
        this.displayPegman(
          this.maze.getPegmanX() || 0,
          this.maze.getPegmanY() || 0,
          tiles.directionToFrame(this.maze.getPegmanD() || 0),
        );
      }
      const finishIcon = document.getElementById('finish');
      if (finishIcon) {
        finishIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.maze.skin.goalIdle || '',
        );

        // skins with a celebration animation (like scrat) hide the finish icon
        // after finishing; to support resetting those, we need to restore the
        // finish icon here
        finishIcon.setAttribute('visibility', 'visible');
      }
    }

    // Make 'look' icon invisible and promote to top.
    const lookIcon = document.getElementById('look');
    if (lookIcon) {
      lookIcon.style.display = 'none';
      lookIcon.parentNode?.appendChild(lookIcon);
      const paths = lookIcon.getElementsByTagName('path');
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        path?.setAttribute('stroke', this.maze.skin.look || '');
      }
    }

    // Reset pegman's visibility if there is only one pegman
    const pegmanIcon = this.getPegmanIcon();
    if (!this.maze.subtype.allowMultiplePegmen()) {
      pegmanIcon?.setAttribute('opacity', '1');
    }

    if (this.maze.skin.idlePegmanAnimation) {
      pegmanIcon?.setAttribute('visibility', 'hidden');
      const idlePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.IDLE),
      );
      idlePegmanIcon?.setAttribute('visibility', 'visible');
    } else if (!this.maze.subtype.allowMultiplePegmen()) {
      pegmanIcon?.setAttribute('visibility', 'visible');
    }

    if (this.maze.skin.wallPegmanAnimation) {
      const wallPegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.WALL),
      );
      wallPegmanIcon?.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.movePegmanAnimation) {
      const movePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.MOVE),
      );
      movePegmanIcon?.setAttribute('visibility', 'hidden');
    }

    if (this.maze.skin.celebrateAnimation) {
      const celebrateAnimation = document.getElementById(
        utils.getPegmanElementId(pegmanElements.CELEBRATE),
      );
      celebrateAnimation?.setAttribute('visibility', 'hidden');
    }
  }

  /**
   * Create sprite assets for pegman.
   * @param options - Specify different features of the pegman animation.
   */
  createPegmanAnimation_(options: AnimationOptions) {
    // Create clip path.
    const clip = document.createElementNS(SVG_NS, 'clipPath');
    const pegmanClipId = utils.getPegmanElementId(
      `${options.type}Clip`,
      options.pegmanId,
    );
    clip?.setAttribute('id', pegmanClipId);
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect?.setAttribute(
      'id',
      utils.getPegmanElementId(`${options.type}ClipRect`, options.pegmanId),
    );
    if (options.col !== undefined) {
      rect?.setAttribute(
        'x',
        (
          options.col * this.maze.SQUARE_SIZE +
          1 +
          this.maze.PEGMAN_X_OFFSET
        ).toString(),
      );
    }
    if (options.row !== undefined) {
      rect?.setAttribute(
        'y',
        getPegmanYForRow(
          this.maze.skin,
          options.row,
          this.maze.SQUARE_SIZE,
        ).toString(),
      );
    }
    rect?.setAttribute('width', this.maze.PEGMAN_WIDTH.toString());
    rect?.setAttribute('height', this.maze.PEGMAN_HEIGHT.toString());
    if (rect) {
      clip?.appendChild(rect);
    }
    if (clip) {
      this.svg.appendChild(clip);
    }
    // Create image.
    const imgSrc = options.pegmanImage;
    const img = document.createElementNS(SVG_NS, 'image');
    img?.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imgSrc);
    img?.setAttribute(
      'height',
      (this.maze.PEGMAN_HEIGHT * (options.numRowPegman || 1)).toString(),
    );
    img?.setAttribute(
      'width',
      (this.maze.PEGMAN_WIDTH * (options.numColPegman || 4)).toString(),
    );
    img?.setAttribute('clip-path', 'url(#' + pegmanClipId + ')');
    img?.setAttribute(
      'id',
      utils.getPegmanElementId(options.type, options.pegmanId),
    );
    if (img) {
      this.svg.appendChild(img);
    }
    // Update pegman icon & clip path.
    if (options.col !== undefined && options.direction !== undefined) {
      const x =
        this.maze.SQUARE_SIZE * options.col -
        options.direction * this.maze.PEGMAN_WIDTH +
        1 +
        this.maze.PEGMAN_X_OFFSET;
      img.setAttribute('x', x.toString());
    }
    if (options.row !== undefined) {
      img.setAttribute(
        'y',
        getPegmanYForRow(
          this.maze.skin,
          options.row,
          this.maze.SQUARE_SIZE,
        ).toString(),
      );
    }
  }

  /**
   * Calculate the Y offset within the sheet
   */
  getPegmanFrameOffsetY_(animationRow?: number) {
    animationRow = animationRow || 0;
    return animationRow * this.maze.PEGMAN_HEIGHT;
  }

  /**
   * Update sprite assets for pegman.
   * @param options - Specify different features of the pegman animation.
   */
  updatePegmanAnimation_(options: Omit<AnimationOptions, 'pegmanImage'>) {
    const rect = document.getElementById(
      utils.getPegmanElementId(`${options.type}ClipRect`, options.pegmanId),
    );
    if (!rect) {
      return;
    }
    rect.setAttribute(
      'x',
      (
        (options.col || 0) * this.maze.SQUARE_SIZE +
        1 +
        this.maze.PEGMAN_X_OFFSET
      ).toString(),
    );
    rect.setAttribute(
      'y',
      getPegmanYForRow(
        this.maze.skin,
        options.row || 0,
        this.maze.SQUARE_SIZE,
      ).toString(),
    );
    const img = document.getElementById(
      utils.getPegmanElementId(options.type, options.pegmanId),
    );
    if (!img) {
      return;
    }
    const x =
      this.maze.SQUARE_SIZE * (options.col || 0) -
      (options.direction || 0) * this.maze.PEGMAN_WIDTH +
      1 +
      this.maze.PEGMAN_X_OFFSET;
    img.setAttribute('x', x.toString());
    const y =
      getPegmanYForRow(
        this.maze.skin,
        options.row || 0,
        this.maze.SQUARE_SIZE,
      ) - this.getPegmanFrameOffsetY_(options.animationRow);
    img.setAttribute('y', y.toString());
    img.setAttribute('visibility', 'visible');
  }

  /**
   * Schedule a movement animating using a spritesheet.
   */
  scheduleSheetedMovement_(
    start: Point,
    delta: Point,
    numFrames: number,
    timePerFrame: number,
    type: string,
    direction: number,
    hidePegman: boolean,
    pegmanId?: string,
  ) {
    const pegmanIcon = this.getPegmanIcon(pegmanId);

    utils.range(0, numFrames - 1).forEach(frame => {
      timeoutList.setTimeout(() => {
        if (hidePegman) {
          pegmanIcon?.setAttribute('visibility', 'hidden');
        }

        this.updatePegmanAnimation_({
          type: type,
          col: start.x + (delta.x * frame) / numFrames,
          row: start.y + (delta.y * frame) / numFrames,
          direction: direction,
          animationRow: frame,
          pegmanId,
        });
      }, timePerFrame * frame);
    });
  }

  /**
   * Schedule the animations for a move from the current position
   * @param endX X coordinate of the target position
   * @param endY Y coordinate of the target position
   * @param pegmanId Optional id of pegman. If no id is provided,
   *   will schedule move for default pegman.
   */
  scheduleMove(
    endX: number,
    endY: number,
    timeForAnimation: number,
    pegmanId?: string,
  ) {
    const startX = this.maze.getPegmanX(pegmanId) || 0;
    const startY = this.maze.getPegmanY(pegmanId) || 0;
    const direction = this.maze.getPegmanD(pegmanId) || 0;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    let numFrames: number = 0;
    let timePerFrame: number = 0;

    if (this.maze.skin.movePegmanAnimation) {
      numFrames = this.maze.skin.movePegmanAnimationFrameNumber || 0;
      // If move animation of pegman is set, and this is not a turn.
      // Show the animation.
      const pegmanIcon = this.getPegmanIcon(pegmanId);
      const movePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.MOVE, pegmanId),
      );
      timePerFrame = timeForAnimation / numFrames;

      this.scheduleSheetedMovement_(
        {
          x: startX,
          y: startY,
        },
        {
          x: deltaX,
          y: deltaY,
        },
        numFrames,
        timePerFrame,
        pegmanElements.MOVE,
        direction,
        true,
        pegmanId,
      );

      // Hide movePegman and set pegman to the end position.
      timeoutList.setTimeout(() => {
        movePegmanIcon?.setAttribute('visibility', 'hidden');
        pegmanIcon?.setAttribute('visibility', 'visible');
        this.displayPegman(
          endX,
          endY,
          tiles.directionToFrame(direction),
          pegmanId,
        );
        if (this.maze.subtype.isWordSearch()) {
          (this.maze.subtype as WordSearch).markTileVisited(endY, endX, true);
        }
      }, timePerFrame * numFrames);
    } else {
      // we don't have an animation, so just move the x/y pos
      numFrames = 4;
      timePerFrame = timeForAnimation / numFrames;
      utils.range(1, numFrames).forEach(frame => {
        timeoutList.setTimeout(() => {
          this.displayPegman(
            startX + (deltaX * frame) / numFrames,
            startY + (deltaY * frame) / numFrames,
            tiles.directionToFrame(direction),
            pegmanId,
          );
        }, timePerFrame * frame);
      });
    }

    if (this.maze.skin.approachingGoalAnimation) {
      const finishIcon = document.getElementById('finish');
      // If pegman is close to the goal
      // Replace the goal file with approachingGoalAnimation
      if (
        this.maze.subtype.finish &&
        Math.abs(endX - this.maze.subtype.finish.x) <= 1 &&
        Math.abs(endY - this.maze.subtype.finish.y) <= 1
      ) {
        finishIcon?.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.maze.skin.approachingGoalAnimation || '',
        );
      } else {
        finishIcon?.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.maze.skin.goalIdle || '',
        );
      }
    }
  }

  /**
   * Schedule the animations for a turn from the current direction
   * @param endDirection - The direction we're turning to
   * @param pegmanId - (Optional) id of pegman. If no id is provided,
   *   will schedule turn for default pegman.
   */
  scheduleTurn(endDirection: number, pegmanId?: string) {
    const numFrames = 4;
    const startDirection = this.maze.getPegmanD(pegmanId) || 0;
    const deltaDirection = endDirection - startDirection;
    utils.range(1, numFrames).forEach(frame => {
      timeoutList.setTimeout(
        () => {
          this.displayPegman(
            this.maze.getPegmanX(pegmanId) || 0,
            this.maze.getPegmanY(pegmanId) || 0,
            tiles.directionToFrame(
              startDirection + (deltaDirection * frame) / numFrames,
            ),
            pegmanId,
          );
        },
        this.maze.stepSpeed * (frame - 1),
      );
    });
  }

  /**
   * Schedule the animations for a turn to the given direction, without
   * animating any of the intermediate frames.
   * @param endDirection - The direction we're turning to
   * @param pegmanId - (Optional) id of pegman. If no id is provided,
   *   will schedule turn for default pegman.
   */
  simpleTurn(endDirection: number, pegmanId?: string) {
    const numFrames = 2;
    utils.range(1, numFrames).forEach(frame => {
      timeoutList.setTimeout(
        () => {
          this.displayPegman(
            this.maze.getPegmanX(pegmanId) || 0,
            this.maze.getPegmanY(pegmanId) || 0,
            tiles.directionToFrame(endDirection),
            pegmanId,
          );
        },
        this.maze.stepSpeed * (frame - 1),
      );
    });
  }

  crackSurroundingIce(targetX: number, targetY: number) {
    // Remove cracked ice, replace surrounding ice with cracked ice.
    this.updateSurroundingTiles_(targetY, targetX, (tileElement, cell) => {
      if (cell?.getTile() === tiles.SquareType.OPEN) {
        tileElement.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.maze.skin.largerObstacleAnimationTiles || '',
        );
      } else if (cell?.getTile() === tiles.SquareType.OBSTACLE) {
        tileElement.setAttribute('opacity', '0');
      }
    });
  }

  /**
   * Replace the tiles surrounding the obstacle with broken tiles.
   */
  updateSurroundingTiles_(
    obstacleY: number,
    obstacleX: number,
    callback: (element: Element, cell?: Cell) => void,
  ) {
    const tileCoords = [
      [obstacleY - 1, obstacleX - 1],
      [obstacleY - 1, obstacleX],
      [obstacleY - 1, obstacleX + 1],
      [obstacleY, obstacleX - 1],
      [obstacleY, obstacleX],
      [obstacleY, obstacleX + 1],
      [obstacleY + 1, obstacleX - 1],
      [obstacleY + 1, obstacleX],
      [obstacleY + 1, obstacleX + 1],
    ];

    for (let idx = 0; idx < tileCoords.length; ++idx) {
      const row = tileCoords[idx][1];
      const col = tileCoords[idx][0];
      const tileIdx = row + (this.maze.map?.COLS || 8) * col;
      const tileElement = document.getElementById('tileElement' + tileIdx);
      if (tileElement) {
        const cell = this.maze.map?.getCell(col, row);
        callback(tileElement, cell);
      }
    }
  }

  scheduleWallHit(
    _targetX: number,
    _targetY: number,
    deltaX: number,
    deltaY: number,
    frame: number,
    pegmanId?: string,
  ) {
    // Play the animation of hitting the wall
    const pegmanX = this.maze.getPegmanX(pegmanId) || 0;
    const pegmanY = this.maze.getPegmanY(pegmanId) || 0;
    if (this.maze.skin.hittingWallAnimation) {
      const wallAnimationIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.WALL_ANIMATION, pegmanId),
      );
      const numFrames = this.maze.skin.hittingWallAnimationFrameNumber || 0;

      if (numFrames > 1) {
        // The Scrat "wall" animation has him falling backwards into the water.
        // This looks great when he falls into the water above him, but looks a
        // little off when falling to the side/forward. Tune that by bumping the
        // deltaY by one. Hacky, but looks much better
        if (deltaY >= 0) {
          deltaY += 1;
        }
        // animate our sprite sheet
        const timePerFrame = 100;
        this.scheduleSheetedMovement_(
          {
            x: pegmanX,
            y: pegmanY,
          },
          {
            x: deltaX,
            y: deltaY,
          },
          numFrames,
          timePerFrame,
          pegmanElements.WALL,
          tiles.Direction.NORTH,
          true,
          pegmanId,
        );
        timeoutList.setTimeout(function () {
          document
            .getElementById(
              utils.getPegmanElementId(pegmanElements.WALL, pegmanId),
            )
            ?.setAttribute('visibility', 'hidden');
        }, numFrames * timePerFrame);
      } else {
        // active our gif
        timeoutList.setTimeout(() => {
          wallAnimationIcon?.setAttribute(
            'x',
            (
              this.maze.SQUARE_SIZE * (pegmanX + 0.5 + deltaX * 0.5) -
              parseInt(wallAnimationIcon?.getAttribute('width') || '0') / 2
            ).toString(),
          );
          wallAnimationIcon?.setAttribute(
            'y',
            (
              this.maze.SQUARE_SIZE * (pegmanY + 1 + deltaY * 0.5) -
              parseInt(wallAnimationIcon?.getAttribute('height') || '0')
            ).toString(),
          );
          wallAnimationIcon?.setAttribute('visibility', 'visible');
          wallAnimationIcon?.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.maze.skin.hittingWallAnimation || '',
          );
        }, this.maze.stepSpeed / 2);
      }
    }
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, frame, pegmanId);
    }, this.maze.stepSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(
        pegmanX + deltaX / 4,
        pegmanY + deltaY / 4,
        frame,
        pegmanId,
      );
    }, this.maze.stepSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, frame, pegmanId);
    }, this.maze.stepSpeed * 3);

    if (this.maze.skin.wallPegmanAnimation) {
      timeoutList.setTimeout(() => {
        const pegmanIcon = this.getPegmanIcon(pegmanId);
        pegmanIcon?.setAttribute('visibility', 'hidden');
        this.updatePegmanAnimation_({
          type: pegmanElements.WALL,
          row: pegmanY,
          col: pegmanX,
          direction: this.maze.getPegmanD(pegmanId) || 0,
        });
      }, this.maze.stepSpeed * 4);
    }
  }

  scheduleObstacleHit(
    targetX: number,
    targetY: number,
    deltaX: number,
    deltaY: number,
    frame: number,
    pegmanId?: string,
  ) {
    // Play the animation
    const obsId = targetX + (this.maze.map?.COLS || 8) * targetY;
    const obsIcon = document.getElementById('obstacle' + obsId);
    obsIcon?.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      this.maze.skin.obstacleAnimation || '',
    );
    timeoutList.setTimeout(() => {
      this.displayPegman(
        (this.maze.getPegmanX(pegmanId) || 0) + deltaX / 2,
        (this.maze.getPegmanY(pegmanId) || 0) + deltaY / 2,
        frame,
      );
    }, this.maze.stepSpeed);

    // Replace the objects around obstacles with broken objects
    if (this.maze.skin.largerObstacleAnimationTiles) {
      timeoutList.setTimeout(() => {
        this.updateSurroundingTiles_(targetY, targetX, tileElement =>
          tileElement.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.maze.skin.largerObstacleAnimationTiles || '',
          ),
        );
      }, this.maze.stepSpeed);
    }

    // Remove pegman
    if (!this.maze.skin.nonDisappearingPegmanHittingObstacle) {
      const pegmanIcon = this.getPegmanIcon(pegmanId);

      timeoutList.setTimeout(function () {
        pegmanIcon?.setAttribute('visibility', 'hidden');
      }, this.maze.stepSpeed * 2);
    }
  }

  scheduleLook(x: number, y: number, d: number) {
    const lookIcon = document.getElementById('look');
    if (!lookIcon) {
      return;
    }

    lookIcon.setAttribute(
      'transform',
      'translate(' + x + ', ' + y + ') ' + 'rotate(' + d + ' 0 0) scale(.4)',
    );
    const paths = lookIcon.getElementsByTagName('path');
    lookIcon.style.display = 'inline';
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      this.scheduleLookStep_(path, this.maze.stepSpeed * i);
    }
  }

  /**
   * Schedule one of the 'look' icon's waves to appear, then disappear.
   * @param path - Element to make appear.
   * @param delay - Milliseconds to wait before making wave appear.
   */
  scheduleLookStep_(path: SVGElement, delay: number) {
    timeoutList.setTimeout(() => {
      path.style.display = 'inline';
      window.setTimeout(function () {
        path.style.display = 'none';
      }, this.maze.stepSpeed * 2);
    }, delay);
  }

  stopIdling(pegmanId?: string) {
    // Removing the idle animation and replace with pegman sprite
    if (this.maze.skin.idlePegmanAnimation) {
      const pegmanIcon = this.getPegmanIcon(pegmanId);
      const idlePegmanIcon = document.getElementById(
        utils.getPegmanElementId(pegmanElements.IDLE, pegmanId),
      );
      idlePegmanIcon?.setAttribute('visibility', 'hidden');
      pegmanIcon?.setAttribute('visibility', 'visible');
    }
  }

  hidePegman(pegmanId?: string) {
    const pegmanIcon = this.getPegmanIcon(pegmanId);
    pegmanIcon?.setAttribute('visibility', 'hidden');
  }

  showPegman(pegmanId?: string) {
    const pegmanIcon = this.getPegmanIcon(pegmanId);
    pegmanIcon?.setAttribute('visibility', 'visible');
  }

  /**
   * Schedule the animations and sound for a dance.
   * @param {boolean} victoryDance This is a victory dance after completing the
   *   puzzle (vs. dancing on load).
   * @param {integer} timeAlloted How much time we have for our animations
   * @param {string} pegmanId Optional id of pegman. If no id is provided, will schedule
   *   dance for default pegman.
   */
  scheduleDance(victoryDance: boolean, timeAlloted: number, pegmanId?: string) {
    const finishIcon = document.getElementById('finish');
    const pegmanX = this.maze.getPegmanX(pegmanId) || 0;
    const pegmanY = this.maze.getPegmanY(pegmanId) || 0;

    // Some skins (like scrat) have custom celebration animations we want to
    // suport
    if (victoryDance && this.maze.skin.celebrateAnimation) {
      finishIcon?.setAttribute('visibility', 'hidden');
      const numFrames = this.maze.skin.celebratePegmanRow || 1;
      const timePerFrame = timeAlloted / numFrames;
      const start = {x: pegmanX, y: pegmanY};

      this.scheduleSheetedMovement_(
        {x: start.x, y: start.y},
        {x: 0, y: 0},
        numFrames,
        timePerFrame,
        pegmanElements.CELEBRATE,
        tiles.Direction.NORTH,
        true,
        pegmanId,
      );
      return;
    }

    const originalFrame = tiles.directionToFrame(
      this.maze.getPegmanD(pegmanId) || 0,
    );
    this.displayPegman(pegmanX, pegmanY, 16, pegmanId);

    // If victoryDance === true, play the goal animation, else reset it
    if (victoryDance && finishIcon) {
      finishIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        this.maze.skin.goalAnimation || '',
      );
    }

    const danceSpeed = timeAlloted / 5;
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, 18, pegmanId);
    }, danceSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, 20, pegmanId);
    }, danceSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, 18, pegmanId);
    }, danceSpeed * 3);
    timeoutList.setTimeout(() => {
      this.displayPegman(pegmanX, pegmanY, 20, pegmanId);
    }, danceSpeed * 4);

    timeoutList.setTimeout(() => {
      if (!victoryDance || this.maze.skin.turnAfterVictory) {
        this.displayPegman(pegmanX, pegmanY, originalFrame, pegmanId);
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
    let tileId = 0;
    for (let y = 0; y < (this.maze.map?.ROWS || 0); y++) {
      for (let x = 0; x < (this.maze.map?.COLS || 0); x++) {
        // Tile sprite.
        const tileElement = document.getElementById('tileElement' + tileId);
        const tileAnimation = document.getElementById(
          'tileAnimation' + tileId,
        ) as SVGAnimationElement | null;
        if (tileElement) {
          tileElement.setAttribute('opacity', '0');
        }
        if (tileAnimation?.beginElement) {
          // IE doesn't support beginElement, so check for it.
          tileAnimation.beginElement();
        }
        tileId++;
      }
    }
  }

  setPegmanTransparent_(pegmanId?: string) {
    const pegmanFadeoutAnimation = document.getElementById(
      utils.getPegmanElementId(pegmanElements.FADEOUT, pegmanId),
    ) as SVGAnimationElement | null;
    const pegmanIcon = this.getPegmanIcon(pegmanId);
    if (pegmanIcon) {
      pegmanIcon.setAttribute('opacity', '0');
    }
    if (pegmanFadeoutAnimation?.beginElement) {
      // IE doesn't support beginElement, so check for it.
      pegmanFadeoutAnimation.beginElement();
    }
  }

  /**
   * Display Pegman at the specified location, facing the specified direction.
   * @param x - Horizontal grid (or fraction thereof).
   * @param y - Vertical grid (or fraction thereof).
   * @param frame - Direction (0 - 15) or dance (16 - 17). *
   * @param id - (Optional) id of pegman. If no id is provided,
   *   will display default pegman.
   */
  displayPegman(x: number, y: number, frame: number, pegmanId?: string) {
    const pegmanIcon = this.getPegmanIcon(pegmanId);
    const clipRect = document.getElementById(
      utils.getPegmanElementId(pegmanElements.CLIP_RECT, pegmanId),
    ) as SVGRectElement | null;
    if (pegmanIcon && clipRect) {
      displayPegman(
        this.maze.skin,
        pegmanIcon,
        clipRect,
        x,
        y,
        frame,
        this.maze.SQUARE_SIZE,
      );
    }
  }

  getPegmanIcon(pegmanId?: string): SVGImageElement | undefined {
    return (document.getElementById(
      utils.getPegmanElementId(pegmanElements.PEGMAN, pegmanId),
    ) || undefined) as SVGImageElement | undefined;
  }

  addNewPegman(pegmanId: string, x: number, y: number, d: number) {
    addNewPegman(
      this.maze.skin,
      pegmanId,
      x,
      y,
      d,
      this.svg,
      this.maze.SQUARE_SIZE,
    );
  }
}

export default AnimationsController;
