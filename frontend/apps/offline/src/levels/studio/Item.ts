import ShakeActor from './actions/ShakeActor';
import Collidable, {CollidableSerialization} from './Collidable';
import {
  Behavior,
  NextTurn,
  UNIT_VECTOR,
  DirectionTable,
  Direction,
} from './constants';
import * as constants from './constants';
import type Studio from './Studio';
import StudioAnimation from './StudioAnimation';
import StudioSpriteSheet from './StudioSpriteSheet';

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export interface Candidate {
  gridX: number;
  gridY: number;
  score: number;
}

export interface ItemSerialization extends CollidableSerialization {
  className?: string;
  renderScale?: number;
  renderOffset?: {
    x: number;
    y: number;
  };
  normalSpeed?: number;
  normalFrameDuration?: number;
  animationFrameDuration?: number;
  isHazard?: boolean;
  spritesCounterclockwise?: boolean;
  displayDir?: Direction;
  opacity?: number;
  loop?: boolean;
}

/**
 * An Item is a type of Collidable.
 * Note: x/y represent x/y of center in gridspace
 */
class Item extends Collidable {
  protected className?: string;
  /**
   * Rendering offset for item animation vs display position - applied as
   * late as possible.
   */
  renderOffset: {
    x: number;
    y: number;
  };
  renderScale: number = 0;
  drawScale: number = 1;
  opacity: number = 1.0;
  loop: boolean = false;
  displayDir?: Direction = Direction.SOUTH;
  protected startFadeTime?: number;
  protected fadeTime: number = constants.ITEM_FADE_TIME;
  protected targetSpriteIndex: number = 0;
  protected animation?: StudioAnimation;
  protected normalSpeed: number = constants.DEFAULT_ITEM_SPEED;
  protected normalFrameDuration: number =
    constants.DEFAULT_ITEM_ANIMATION_FRAME_DURATION;
  protected isHazard: boolean = false;
  protected spritesCounterclockwise: boolean = false;
  protected destGridX?: number;
  protected destGridY?: number;

  constructor(studio: Studio, options: ItemSerialization) {
    // call collidable constructor
    super(studio, options as CollidableSerialization);

    this.height = options.height || 50;
    this.width = options.width || 50;

    this.className = options.className || '';

    if (
      this.studio.trackedBehavior.createdItems[this.className] === undefined
    ) {
      this.studio.trackedBehavior.createdItems[this.className] = 0;
    }
    this.studio.trackedBehavior.createdItems[this.className]++;

    this.renderOffset = options.renderOffset || {x: 0, y: 0};
    this.renderScale = options.renderScale || 0;

    this.loop = !!options.loop;
    this.speed = options.speed || constants.DEFAULT_ITEM_SPEED;
    this.normalSpeed = options.normalSpeed || constants.DEFAULT_ITEM_SPEED;
    this.normalFrameDuration =
      options.animationFrameDuration ||
      constants.DEFAULT_ITEM_ANIMATION_FRAME_DURATION;
    this.displayDir = options.displayDir || Direction.NONE;

    this.animation = new StudioAnimation({
      ...options,
      spriteSheet: new StudioSpriteSheet({
        assetPath: options.image || '',
        defaultFramesPerAnimation: options.frames || 0,
        frameWidth: this.width || 0,
        frameHeight: this.height || 0,
        animations: [
          {
            type: 'direction',
            count: 8,
          },
          {
            type: 'idle',
            count: 1,
          },
        ],
      }),
      animationFrameDuration: this.getAnimationFrameDuration(),
    });

    this.spritesCounterclockwise = !!options.spritesCounterclockwise;
    this.isHazard = !!options.isHazard;
    this.opacity = options.opacity === undefined ? 1.0 : options.opacity;
  }

  getElement(): SVGImageElement | undefined {
    return this.animation?.getElement();
  }

  /**
   * Returns the frame of the spritesheet for the current walking direction.
   */
  getDirectionFrame(): number {
    // Every other frame, if we aren't yet rendering in the correct direction,
    // assign a new displayDir from state table; only one turn at a time.

    if (this.dir !== this.displayDir && this.displayDir !== undefined) {
      if (this.studio.tickCount && 0 === this.studio.tickCount % 2) {
        this.displayDir = NextTurn[this.displayDir][this.dir];
      }
    }

    const frameDirTable: DirectionTable = this.spritesCounterclockwise
      ? constants.FrameDirTableWalkingWithIdleCounterClockwise
      : constants.FrameDirTableWalkingWithIdleClockwise;

    return frameDirTable[this.displayDir || Direction.NONE];
  }

  /**
   * Create an image element with a clip path
   */
  createElement(parentElement: SVGElement) {
    this.animation?.createElement(parentElement);
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
    if (this.gridX === undefined || this.gridY === undefined) {
      this.gridX = Math.floor(this.x / this.studio.SQUARE_SIZE);
      this.gridY = Math.floor(this.y / this.studio.SQUARE_SIZE);
    }

    // Have we reached the destination grid position?
    // If not, we're still sliding towards it.
    let reachedDestinationGridPosition = false;

    // Draw the item's current location.
    this.studio.drawDebugRect('itemCenter', this.x, this.y, 3, 3);

    if (
      this.activity === Behavior.WATCH_ACTOR ||
      this.activity === Behavior.GRID_ALIGNED
    ) {
      // In this stationary activity case, we don't need to do any of this
      // update logic (facing the actor is handled every frame in display())
      return;
    } else if (this.activity === Behavior.STOP) {
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
      this.studio.drawDebugRect(
        'roamGridDest',
        (this.destGridX || 0) * this.studio.SQUARE_SIZE +
          this.studio.HALF_SQUARE,
        (this.destGridY || 0) * this.studio.SQUARE_SIZE +
          this.studio.HALF_SQUARE,
        this.studio.SQUARE_SIZE,
        this.studio.SQUARE_SIZE,
      );
    }
    const center = this.getCenterPos();

    // Has the item reached its destination grid position?
    // (There is a small margin of error to allow for per-update movements greater
    // than a single pixel.)
    if (this.destGridX !== undefined) {
      const speed = this.speed || 0;
      const dirUnit = UNIT_VECTOR[this.dir];
      const destVector = {
        x:
          (this.destGridX || 0) * this.studio.SQUARE_SIZE +
          this.studio.HALF_SQUARE -
          center.x,
        y:
          (this.destGridY || 0) * this.studio.SQUARE_SIZE +
          this.studio.HALF_SQUARE -
          center.y,
      };
      // Take the dot product of dirUnit and destVector to see if continuing to
      // move in that direction will bring the item any closer to its
      // destination.
      if (dirUnit.x * destVector.x + dirUnit.y * destVector.y <= speed) {
        this.gridX = this.destGridX || 0;
        this.gridY = this.destGridY || 0;
        reachedDestinationGridPosition = true;
      }
    }

    // Are we missing a destination location in grid coords?
    // Or have we already reached our prior destination location in grid coords?
    // If not, determine it.
    if (this.destGridX === undefined || reachedDestinationGridPosition) {
      const sprite = this.studio.sprite[this.targetSpriteIndex];

      const spriteX = sprite.x + sprite.width / 2;
      const spriteY = sprite.y + sprite.height / 2;

      // let's try scoring each square
      let candidates: Candidate[] = [];

      const bufferDistance = 60;

      // The item can just go up/down/left/right.. no diagonals.
      const candidateGridLocations = [
        {row: -1, col: 0},
        {row: +1, col: 0},
        {row: 0, col: -1},
        {row: 0, col: +1},
      ];

      for (const location of candidateGridLocations) {
        const candidateX = this.gridX + location.col;
        const candidateY = this.gridY + location.row;

        const candidate: Candidate = {
          gridX: candidateX,
          gridY: candidateY,
          score: 0,
        };

        if (this.activity === Behavior.WANDER) {
          candidate.score++;
        } else if (this.activity === Behavior.CHASE) {
          if (
            candidateY === this.gridY - 1 &&
            spriteY < center.y - bufferDistance
          ) {
            candidate.score += 2;
          } else if (
            candidateY === this.gridY + 1 &&
            spriteY > center.y + bufferDistance
          ) {
            candidate.score += 2;
          } else {
            candidate.score += 1;
          }

          if (
            candidateX === this.gridX - 1 &&
            spriteX < center.x - bufferDistance
          ) {
            candidate.score++;
          } else if (
            candidateX === this.gridX + 1 &&
            spriteX > center.x + bufferDistance
          ) {
            candidate.score++;
          }
        } else if (this.activity === Behavior.FLEE) {
          candidate.score = 1;
          if (
            candidateY === this.gridY - 1 &&
            spriteY > center.y - bufferDistance
          ) {
            candidate.score++;
          } else if (
            candidateY === this.gridY + 1 &&
            spriteY < center.y + bufferDistance
          ) {
            candidate.score++;
          }

          if (
            candidateX === this.gridX - 1 &&
            spriteX > center.x - bufferDistance
          ) {
            candidate.score++;
          } else if (
            candidateX === this.gridX + 1 &&
            spriteX < center.x + bufferDistance
          ) {
            candidate.score++;
          }
        }

        if (candidate.score > 0) {
          this.studio.drawDebugRect(
            'roamGridPossibleDest',
            candidateX * this.studio.SQUARE_SIZE + this.studio.HALF_SQUARE,
            candidateY * this.studio.SQUARE_SIZE + this.studio.HALF_SQUARE,
            this.studio.SQUARE_SIZE,
            this.studio.SQUARE_SIZE,
          );
        }

        candidates.push(candidate);
      }

      // cull candidates that won't be possible
      for (let i = candidates.length - 1; i >= 0; i--) {
        const candidate = candidates[i];
        if (
          candidate.score === 0 ||
          this.atEdge(candidate) ||
          this.hasWall(candidate)
        ) {
          candidates.splice(i, 1);
        }
      }

      let newDirection = Direction.NONE;
      if (candidates.length > 0) {
        // Shuffle everything (so that even scored items are shuffled, even after the sort)
        candidates = shuffle(candidates);

        // Then sort everything based on score.
        candidates.sort((a, b) => b.score - a.score);

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

  atEdge(candidate: Candidate): boolean {
    return (
      candidate.gridX < 0 ||
      candidate.gridX >= this.studio.COLS ||
      candidate.gridY < 0 ||
      candidate.gridY >= this.studio.ROWS
    );
  }

  hasWall(candidate: Candidate): boolean {
    return !!this.studio.getWallValue(candidate.gridY, candidate.gridX);
  }

  /**
   * Isolated update logic for "watchActor" activity where the "item" keeps
   * turning to look at the actor with the given sprite index.
   */
  turnToFaceActor(targetSpriteIndex: number) {
    // Pick a target direction closest to the relative direction toward the target.
    const target = this.studio.sprite[targetSpriteIndex];
    if (!target) {
      return;
    }

    // Actor positions are the top-left of their square (or their "feet" square
    // in the 'isometric' case) - we should look at the middle of their square
    const actorGroundCenterX = target.displayX + this.studio.HALF_SQUARE;
    const actorGroundCenterY = target.displayY + this.studio.HALF_SQUARE;
    const deltaX = actorGroundCenterX - this.x;
    const deltaY = actorGroundCenterY - this.y;

    // We shouldn't adjust our direction if the actor is sufficiently close that
    // relative direction doesn't make much sense
    // Basically, avoid thrashing when moving into their space.
    const SQUARED_MINIMUM_DISTANCE = 25;
    if (deltaX * deltaX + deltaY * deltaY > SQUARED_MINIMUM_DISTANCE) {
      this.studio.drawDebugLine(
        'watchActor',
        this.x,
        this.y,
        actorGroundCenterX,
        actorGroundCenterY,
        '#ffff00',
      );
      this.setDirection(constants.getClosestDirection(deltaX, deltaY));
    }
  }

  /**
   * Sets the activity property for this item.
   * @param type - Valid options are: none, watchActor, roam, chase, flee, or grid
   * @param targetSpriteIndex - optional target sprite used with chase and flee
   */
  setActivity(type: Behavior, targetSpriteIndex?: number) {
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
    this.animation?.removeElement();

    this.studio.trackedBehavior.removedItemCount++;

    if (this.className) {
      if (
        this.studio.trackedBehavior.removedItems[this.className] === undefined
      ) {
        this.studio.trackedBehavior.removedItems[this.className] = 0;
      }
      this.studio.trackedBehavior.removedItems[this.className]++;
    }
  }

  /**
   * Retrieve animation frame duration (frames per tick)
   */
  getAnimationFrameDuration() {
    if (this.dir === Direction.NONE) {
      return this.normalFrameDuration;
    } else {
      return (this.normalFrameDuration * this.normalSpeed) / this.speed;
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
    const currentTime = new Date().getTime();

    return (
      this.startFadeTime && currentTime > this.startFadeTime + this.fadeTime
    );
  }

  /**
   * Whether or not this sprite will turn to face south after
   * this.studio.ticksBeforeFaceSouth ticks of no movement
   *
   * @returns {boolean}
   * @see Studio.onTick
   */
  shouldFaceSouthOnIdle() {
    return this.activity !== Behavior.GRID_ALIGNED;
  }

  /**
   * Display our item at its current location
   */
  display() {
    const currentTime = new Date().getTime();
    let opacity = 1;
    if (this.startFadeTime) {
      opacity = 1 - (currentTime - this.startFadeTime) / this.fadeTime;
      opacity = Math.max(opacity, 0);
      this.animation?.setOpacity(opacity);
    }

    // Watch behavior does not change logical position, should update every frame
    if (this.activity === Behavior.WATCH_ACTOR) {
      this.turnToFaceActor(this.studio.protagonistSpriteIndex || 0);
    }

    this.animation?.setCurrentAnimation('direction', this.getDirectionFrame());
    this.animation?.redrawCenteredAt(
      {
        x: this.x + this.renderOffset.x,
        y: this.y + this.renderOffset.y,
      },
      this.studio.tickCount,
    );
  }

  getCenterPos() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * Whether or not this sprite should automatically move on each tick.
   * @see Studio.onTick
   */
  shouldMove(): boolean {
    const standstillBehaviors = [
      Behavior.STOP,
      Behavior.WATCH_ACTOR,
      Behavior.GRID_ALIGNED,
    ];
    return !standstillBehaviors.includes(this.activity);
  }

  getNextPosition(): {
    x: number;
    y: number;
  } {
    const unit = UNIT_VECTOR[this.dir];
    const speed = this.shouldMove() ? this.speed : 0;

    return {
      x: this.x + speed * unit.x,
      y: this.y + speed * unit.y,
    };
  }

  moveToNextPosition() {
    const next = this.getNextPosition();
    this.x = next.x;
    this.y = next.y;
  }

  updateAnimationFrameDuration() {
    this.animation?.setAnimationFrameDuration(this.getAnimationFrameDuration());
  }

  /**
   * Sets the speed and changes the animation frame duration to match.
   * @param speed - Number of pixels to move per tick
   */
  setSpeed(speed: number) {
    this.speed = speed;
    this.updateAnimationFrameDuration();
  }

  /**
   * Sets the direction and changes the animation frame duration to match.
   */
  setDirection(direction: number) {
    super.setDirection(direction);

    // Update this because animation speed may change as we alter direction:
    this.updateAnimationFrameDuration();
  }

  /**
   * Mark that we're colliding with object represented by key.
   * Here, override base implemention to special on-collision logic for certain
   * item classes.
   * @param key - A unique key representing the object we're colliding with
   * @returns True if collision is started, false if we're already colliding
   */
  startCollision(key: number): boolean {
    const newCollisionStarted = super.startCollision(key);
    if (newCollisionStarted) {
      if (this.isHazard && key === (this.studio.protagonistSpriteIndex || 0)) {
        this.studio.trackedBehavior.touchedHazardCount++;
        const actor = this.studio.sprite[key];
        if (actor) {
          actor.addAction(new ShakeActor(constants.TOUCH_HAZARD_EFFECT_TIME));
        }
      }
    }

    return newCollisionStarted;
  }

  /**
   * Change visible opacity of this item.
   * @param newOpacity - The new opacity (between 0.0 and 1.0)
   */
  setOpacity(newOpacity: number) {
    this.animation?.setOpacity(newOpacity);
  }
}

export default Item;
