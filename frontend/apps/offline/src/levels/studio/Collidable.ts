import {Behavior, Direction, DEFAULT_SPRITE_SIZE} from './constants';
import type SpriteAction from './SpriteAction';
import type Studio from './Studio';

export interface CollidableSerialization {
  image?: string;
  x: number;
  y: number;
  displayX?: number;
  displayY?: number;
  width?: number;
  height?: number;
  dir?: Direction;
  direction?: Direction;
  speed?: number;
  frames?: number;
  size?: number;
  visible?: boolean;
  activity?: Behavior;
}

class Collidable {
  /** A reference to the game controller */
  protected studio: Studio;
  /** X coordinate of the sprite */
  x: number;
  /** Y coordinate of the sprite */
  y: number;
  displayX: number = 0;
  displayY: number = 0;
  /** Direction of the sprite */
  dir: Direction;
  /** Speed of the sprite */
  speed: number;
  /** Height of the width */
  width: number;
  /** Height of the sprite */
  height: number;
  /** Size of the sprite */
  size: number;
  /** Image URL */
  protected image: string;
  /** Number of animation frames */
  protected frames: number;
  /** Location of the item column, if in the map grid */
  protected gridX?: number;
  /** Location of the item row, if in the map grid */
  protected gridY?: number;
  /** Current behavior state of the item */
  activity: Behavior;
  /** Whether or not the item is visible */
  visible: boolean = true;
  /** Other item flags */
  protected flags: number = 0;
  /** Hash table of other sprites we're currently colliding with */
  protected collidingWith: {
    [key: number]: boolean;
  } = {};
  /** Actions tracks by this item */
  protected actions: SpriteAction[] = [];

  /**
   * Collidable constructor opts
   */
  constructor(studio: Studio, opts: CollidableSerialization) {
    this.studio = studio;

    this.activity = opts.activity || Behavior.STOP;

    this.x = opts.x;
    this.y = opts.y;
    this.displayX = opts.displayX || 0;
    this.displayY = opts.displayY || 0;
    this.width = opts.width || 50;
    this.height = opts.height || 50;
    this.dir = opts.dir || opts.direction || Direction.NONE;
    this.speed = opts.speed || 0;
    this.image = opts.image || '';
    this.size = opts.size || DEFAULT_SPRITE_SIZE;
    this.visible = !!opts.visible;

    // default num frames is 1 (and it cannot be 0)
    this.frames = opts.frames || 1;
  }

  /**
   * Clear all current collisions
   */
  clearCollisions() {
    this.collidingWith = {};
  }

  /**
   * Mark that we're colliding with object represented by key
   * @param key - A unique key representing the object we're colliding with
   * @returns True if collision is started, false if we're already colliding
   */
  startCollision(key: number): boolean {
    if (this.isCollidingWith(key)) {
      return false;
    }

    this.collidingWith[key] = true;
    return true;
  }

  /**
   * Mark that we're no longer colliding with object represented by key
   * @param key - A unique key representing the object we're querying
   */
  endCollision(key: number) {
    this.collidingWith[key] = false;
  }

  /**
   * Are we colliding with the object represented by key?
   * @param key - A unique key representing the object we're querying
   */
  isCollidingWith(key: number): boolean {
    return this.collidingWith[key] === true;
  }

  /**
   * Assumes x/y are center coords (true for projectiles and items)
   * outOfBounds() returns true if the object is entirely "off screen"
   */
  outOfBounds(): boolean {
    return (
      this.x < -(this.width / 2) ||
      this.x > this.studio.MAZE_WIDTH + this.width / 2 ||
      this.y < -(this.height / 2) ||
      this.y > this.studio.MAZE_HEIGHT + this.height / 2
    );
  }

  /**
   * Add an action (probably an animation) for this sprite to run.
   * Note: This is a 'sprouted' new system for updating sprites, separate from
   *       how older playlab stuff works.  For now it's driving the discrete
   *       movement hoc2015 levels.
   * @param action
   */
  addAction(action: SpriteAction) {
    this.actions.push(action);
  }

  /**
   * @returns Whether this sprite is currently running any actions.
   */
  hasActions(): boolean {
    return this.actions.length > 0;
  }

  /**
   * Causes this sprite to update all actions it's currently running, and then
   * remove any that are complete.
   */
  updateActions() {
    this.actions.forEach(action => {
      action.update(this);
    });

    // Splice completed actions out of the current action list, iterating
    // backwards so we don't skip anything.
    for (let i = this.actions.length - 1; i >= 0; i--) {
      if (this.actions[i].isDone()) {
        this.actions.splice(i, 1);
      }
    }
  }

  /**
   * Sets the direction and changes the animation frame duration to match.
   */
  setDirection(direction: number) {
    this.dir = direction;
  }
}

export default Collidable;
