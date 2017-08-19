import Collidable from './collidable';
import * as constants from './constants';
import _ from 'lodash';
import { ShakeActor } from './spriteActions';
import Studio from './studio';
import StudioAnimation from './StudioAnimation';
import StudioSpriteSheet from './StudioSpriteSheet';
import { valueOr } from '../utils';

const Direction = constants.Direction;
const NextTurn = constants.NextTurn;

/**
 * An Item is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 * @extends {Collidable}
 */
export default class Item extends Collidable {
  constructor(options) {
    // call collidable constructor
    super(options);

    this.height = options.height || 50;
    this.width = options.width || 50;

    this.className = options.className;

    if (Studio.trackedBehavior.createdItems[this.className] === undefined) {
      Studio.trackedBehavior.createdItems[this.className] = 0;
    }
    Studio.trackedBehavior.createdItems[this.className]++;

    /**
     * Rendering offset for item animation vs display position - applied as
     * late as possible.
     * @type {{x: number, y: number}}
     */
    this.renderOffset = options.renderOffset || { x: 0, y: 0 };

    this.speed = options.speed || constants.DEFAULT_ITEM_SPEED;
    this.normalSpeed = options.normalSpeed || constants.DEFAULT_ITEM_SPEED;
    this.normalFrameDuration = options.animationFrameDuration ||
        constants.DEFAULT_ITEM_ANIMATION_FRAME_DURATION;
    this.displayDir = Direction.SOUTH;
    this.startFadeTime = null;
    this.fadeTime = constants.ITEM_FADE_TIME;
    this.targetSpriteIndex = 0;

    /** @private {StudioAnimation} */
    this.animation_ = new StudioAnimation(Object.assign({}, options, {
      spriteSheet: new StudioSpriteSheet({
        assetPath: options.image,
        defaultFramesPerAnimation: options.frames,
        frameWidth: this.width,
        frameHeight: this.height,
        animations: [
          {
            type: 'direction',
            count: 8
          },
          {
            type: 'idle',
            count: 1
          }
        ]
      }),
      animationFrameDuration: this.getAnimationFrameDuration()
    }));
  }

  /** @returns {SVGImageElement} */
  getElement() {
    return this.animation_.getElement();
  }

  /**
   * Returns the frame of the spritesheet for the current walking direction.
   */
  getDirectionFrame() {
    // Every other frame, if we aren't yet rendering in the correct direction,
    // assign a new displayDir from state table; only one turn at a time.

    if (this.dir !== this.displayDir && this.displayDir !== undefined) {
      if (Studio.tickCount && (0 === Studio.tickCount % 2)) {
        this.displayDir = NextTurn[this.displayDir][this.dir];
      }
    }

    var frameDirTable = this.spritesCounterclockwise ?
      constants.frameDirTableWalkingWithIdleCounterclockwise :
      constants.frameDirTableWalkingWithIdleClockwise;

    return frameDirTable[this.displayDir];
  }

  /**
   * Create an image element with a clip path
   */
  createElement(parentElement) {
    this.animation_.createElement(parentElement);
  }


  /**
   * This function should be called every frame, and moves the item around.
   * It moves the item smoothly, but between fixed points on the grid.
   * Each time the item reaches its destination fixed point, it reevaluates
   * its next destination location based on the type of movement specified.
   * It generally evalutes all possible destination locations, prioritizes
   * the best possible moves, and chooses randomly between evenly-scored
   * options.
   */
  update() {

    // Do we have an active location in grid coords?  If not, determine it.
    if (this.gridX === undefined) {
      this.gridX = Math.floor(this.x / Studio.SQUARE_SIZE);
      this.gridY = Math.floor(this.y / Studio.SQUARE_SIZE);
    }

    // Have we reached the destination grid position?
    // If not, we're still sliding towards it.
    var reachedDestinationGridPosition = false;

    // Draw the item's current location.
    Studio.drawDebugRect("itemCenter", this.x, this.y, 3, 3);

    if (
      this.activity === constants.BEHAVIOR_WATCH_ACTOR ||
      this.activity === constants.BEHAVIOR_GRID_ALIGNED
    ) {
      // In this stationary activity case, we don't need to do any of this
      // update logic (facing the actor is handled every frame in display())
      return;
    } else if (this.activity === constants.BEHAVIOR_STOP) {
      // In this stationary activity case, we override the actor's facing and
      // movement to force a "stop"
      this.setDirection(Direction.NONE);

      this.destGridX = undefined;
      this.destGridY = undefined;
      return;
    }

    if (!this.visible) {
      return;
    }

    if (this.destGridX !== undefined) {
      // Draw the item's destination grid square.
      Studio.drawDebugRect(
        "roamGridDest",
        this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE,
        this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE,
        Studio.SQUARE_SIZE,
        Studio.SQUARE_SIZE);
    }
    var center = this.getCenterPos();

    // Has the item reached its destination grid position?
    // (There is a small margin of error to allow for per-update movements greater
    // than a single pixel.)
    if (this.destGridX !== undefined) {
      var speed = valueOr(this.speed, 0);
      var dirUnit = Direction.getUnitVector(this.dir);
      var destVector = {
        x: (this.destGridX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE) - center.x,
        y: (this.destGridY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE) - center.y
      };
      // Take the dot product of dirUnit and destVector to see if continuing to
      // move in that direction will bring the item any closer to its
      // destination.
      if (dirUnit.x * destVector.x + dirUnit.y * destVector.y <= speed) {
        this.gridX = this.destGridX;
        this.gridY = this.destGridY;
        reachedDestinationGridPosition = true;
      }
    }

    // Are we missing a destination location in grid coords?
    // Or have we already reached our prior destination location in grid coords?
    // If not, determine it.
    if (this.destGridX === undefined || reachedDestinationGridPosition) {

      var sprite = Studio.sprite[this.targetSpriteIndex];

      var spriteX = sprite.x + sprite.width/2;
      var spriteY = sprite.y + sprite.height/2;

      // let's try scoring each square
      var candidates = [];

      var bufferDistance = 60;

      // The item can just go up/down/left/right.. no diagonals.
      var candidateGridLocations = [
        {row: -1, col: 0},
        {row: +1, col: 0},
        {row: 0, col: -1},
        {row: 0, col: +1}];

      for (var candidateIndex = 0; candidateIndex < candidateGridLocations.length; candidateIndex++) {
        var candidateX = this.gridX + candidateGridLocations[candidateIndex].col;
        var candidateY = this.gridY + candidateGridLocations[candidateIndex].row;

        candidate = {gridX: candidateX, gridY: candidateY};
        candidate.score = 0;

        if (this.activity === constants.BEHAVIOR_WANDER) {
          candidate.score ++;
        } else if (this.activity === constants.BEHAVIOR_CHASE) {
          if (candidateY === this.gridY - 1 && spriteY < center.y - bufferDistance) {
            candidate.score += 2;
          } else if (candidateY === this.gridY + 1 && spriteY > center.y + bufferDistance) {
            candidate.score += 2;
          } else {
            candidate.score += 1;
          }

          if (candidateX === this.gridX - 1 && spriteX < center.x - bufferDistance) {
            candidate.score ++;
          } else if (candidateX === this.gridX + 1 && spriteX > center.x + bufferDistance) {
            candidate.score ++;
          }
        } else if (this.activity === constants.BEHAVIOR_FLEE) {
          candidate.score = 1;
          if (candidateY === this.gridY - 1 && spriteY > center.y - bufferDistance) {
            candidate.score ++;
          } else if (candidateY === this.gridY + 1 && spriteY < center.y + bufferDistance) {
            candidate.score ++;
          }

          if (candidateX === this.gridX - 1 && spriteX > center.x - bufferDistance) {
            candidate.score ++;
          } else if (candidateX === this.gridX + 1 && spriteX < center.x + bufferDistance) {
            candidate.score ++;
          }
        }

        if (candidate.score > 0) {
          Studio.drawDebugRect(
            "roamGridPossibleDest",
            candidateX * Studio.SQUARE_SIZE + Studio.HALF_SQUARE,
            candidateY * Studio.SQUARE_SIZE + Studio.HALF_SQUARE,
            Studio.SQUARE_SIZE,
            Studio.SQUARE_SIZE);
        }
        candidates.push(candidate);
      }

      // cull candidates that won't be possible
      for (var i = candidates.length-1; i >= 0; i--) {
        var candidate = candidates[i];
        if (candidate.score === 0 || this.atEdge(candidate) || this.hasWall(candidate)) {
          candidates.splice(i, 1);
        }
      }

      var newDirection = Direction.NONE;
      if (candidates.length > 0) {
        // shuffle everything (so that even scored items are shuffled, even after the sort)
        candidates = _.shuffle(candidates);

        // then sort everything based on score.
        candidates.sort(function (a, b) {
          return b.score - a.score;
        });

        this.destGridX = candidates[0].gridX;
        this.destGridY = candidates[0].gridY;

        // update towards the next location
        if (this.destGridX > this.gridX && this.destGridY > this.gridY) {
          newDirection = Direction.SOUTHEAST;
        } else if (this.destGridX > this.gridX && this.destGridY < this.gridY) {
          newDirection = Direction.NORTHEAST;
        } else if (this.destGridX < this.gridX && this.destGridY > this.gridY) {
          newDirection = Direction.SOUTHWEST;
        } else if (this.destGridX < this.gridX && this.destGridY < this.gridY) {
          newDirection = Direction.NORTHWEST;
        } else if (this.destGridX > this.gridX) {
          newDirection = Direction.EAST;
        } else if (this.destGridX < this.gridX) {
          newDirection = Direction.WEST;
        } else if (this.destGridY > this.gridY) {
          newDirection = Direction.SOUTH;
        } else if (this.destGridY < this.gridY) {
          newDirection = Direction.NORTH;
        }
      }
      this.setDirection(newDirection);
    }
  }

  atEdge(candidate) {
    return candidate.gridX < 0 || candidate.gridX >= Studio.COLS ||
        candidate.gridY < 0 || candidate.gridY >= Studio.ROWS;
  }

  hasWall(candidate) {
    return Studio.getWallValue(candidate.gridY, candidate.gridX);
  }

  /**
   * Isolated update logic for "watchActor" activity where the "item" keeps
   * turning to look at the actor with the given sprite index.
   * @param {number} targetSpriteIndex
   */
  turnToFaceActor(targetSpriteIndex) {
    // Pick a target direction closest to the relative direction toward the target.
    var target = Studio.sprite[targetSpriteIndex];
    if (!target) {
      return;
    }

    // Actor positions are the top-left of their square (or their "feet" square
    // in the 'isometric' case) - we should look at the middle of their square
    var actorGroundCenterX = target.displayX + Studio.HALF_SQUARE;
    var actorGroundCenterY = target.displayY + Studio.HALF_SQUARE;
    var deltaX = actorGroundCenterX - this.x;
    var deltaY = actorGroundCenterY - this.y;

    // We shouldn't adjust our direction if the actor is sufficiently close that
    // relative direction doesn't make much sense
    // Basically, avoid thrashing when moving into their space.
    var SQUARED_MINIMUM_DISTANCE = 25;
    if (deltaX * deltaX + deltaY * deltaY > SQUARED_MINIMUM_DISTANCE) {
      Studio.drawDebugLine("watchActor", this.x, this.y, actorGroundCenterX, actorGroundCenterY, '#ffff00');
      this.setDirection(constants.getClosestDirection(deltaX, deltaY));
    }
  }

  /**
   * Sets the activity property for this item.
   * @param {string} type Valid options are: none, watchActor, roam, chase,
   *        flee, or grid
   * @param {number} targetSpriteIndex optional target sprite used with chase and flee
   */
  setActivity(type, targetSpriteIndex) {
    this.activity = type;
    if (targetSpriteIndex !== undefined) {
      this.targetSpriteIndex = targetSpriteIndex;
    }
  }

  /**
   * Begin a fade out.
   */
  beginRemoveElement() {
    this.startFadeTime = new Date().getTime();
  }

  /**
   * Remove our element/clipPath/animator
   */
  removeElement() {
    this.animation_.removeElement();

    Studio.trackedBehavior.removedItemCount++;

    if (Studio.trackedBehavior.removedItems[this.className] === undefined) {
      Studio.trackedBehavior.removedItems[this.className] = 0;
    }
    Studio.trackedBehavior.removedItems[this.className]++;
  }

  /**
   * Retrieve animation frame duration (frames per tick)
   */
  getAnimationFrameDuration() {
    if (this.dir === Direction.NONE) {
      return this.normalFrameDuration;
    } else {
      return this.normalFrameDuration * this.normalSpeed / this.speed;
    }
  }

  /**
   * Returns true if the item is currently fading away.
   */
  isFading() {
    return !!this.startFadeTime;
  }


  /**
   * Returns true if the item has finished fading away.  The caller will usually
   * then call removeElement to destroy this item's assets.
   */
  hasCompletedFade() {
    var currentTime = new Date().getTime();

    return this.startFadeTime && currentTime > this.startFadeTime + this.fadeTime;
  }

  /**
   * Whether or not this sprite will turn to face south after
   * Studio.ticksBeforeFaceSouth ticks of no movement
   *
   * @returns {boolean}
   * @see Studio.onTick
   */
  shouldFaceSouthOnIdle() {
    return this.activity !== constants.BEHAVIOR_GRID_ALIGNED;
  }

  /**
   * Display our item at its current location
   */
  display() {
    var currentTime = new Date().getTime();
    var opacity = 1;
    if (this.startFadeTime) {
      opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
      opacity = Math.max(opacity, 0);
      this.animation_.setOpacity(opacity);
    }

    // Watch behavior does not change logical position, should update every frame
    if (this.activity === constants.BEHAVIOR_WATCH_ACTOR) {
      this.turnToFaceActor(Studio.protagonistSpriteIndex || 0);
    }

    this.animation_.setCurrentAnimation('direction', this.getDirectionFrame());
    this.animation_.redrawCenteredAt({
          x: this.x + this.renderOffset.x,
          y: this.y + this.renderOffset.y
        },
        Studio.tickCount);
  }

  getCenterPos() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * Whether or not this sprite should automatically move on each tick.
   *
   * @returns {boolean}
   * @see Studio.onTick
   */
  shouldMove() {
    const standstillBehaviors = [
      constants.BEHAVIOR_STOP,
      constants.BEHAVIOR_WATCH_ACTOR,
      constants.BEHAVIOR_GRID_ALIGNED
    ];
    return !standstillBehaviors.includes(this.activity);
  }

  getNextPosition() {
    const unit = Direction.getUnitVector(this.dir);
    const speed = this.shouldMove() ? this.speed : 0;

    return {
      x: this.x + speed * unit.x,
      y: this.y + speed * unit.y
    };
  }

  moveToNextPosition() {
    var next = this.getNextPosition();
    this.x = next.x;
    this.y = next.y;
  }

  updateAnimationFrameDuration_() {
    this.animation_.setAnimationFrameDuration(this.getAnimationFrameDuration());
  }

  /**
   * Sets the speed and changes the animation frame duration to match.
   * @param {number} speed Number of pixels to move per tick
   */
  setSpeed(speed) {
    this.speed = speed;
    this.updateAnimationFrameDuration_();
  }

  /**
   * Sets the direction and changes the animation frame duration to match.
   * @param {number} direction
   */
  setDirection(direction) {
    this.dir = direction;
    // Update this because animation speed may change as we alter direction:
    this.updateAnimationFrameDuration_();
  }

  /**
   * Mark that we're colliding with object represented by key.
   * Here, override base implemention to special on-collision logic for certain
   * item classes.
   * @param key A unique key representing the object we're colliding with
   * @returns {boolean} True if collision is started, false if we're already colliding
   * @override
   */
  startCollision(key) {
    var newCollisionStarted = super.startCollision(key);
    if (newCollisionStarted) {
      if (this.isHazard && key === (Studio.protagonistSpriteIndex || 0)) {
        Studio.trackedBehavior.touchedHazardCount++;
        var actor = Studio.sprite[key];
        if (actor) {
          actor.addAction(new ShakeActor(constants.TOUCH_HAZARD_EFFECT_TIME));
        }
      }
    }
    return newCollisionStarted;
  }

  /**
   * Change visible opacity of this item.
   * @param {number} newOpacity (between 0 and 1)
   * @override
   */
  setOpacity(newOpacity) {
    this.animation_.setOpacity(newOpacity);
  }
}
