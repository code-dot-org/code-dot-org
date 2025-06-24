import type Collidable from './Collidable';
import {Direction} from './constants';

/**
 * Given a 2D vector (x and y) provides the approximate animation direction
 * given in our Direction enum.  Does not calculate 'closest' direction or
 * anything like that - you'll always get a diagonal if both x and y are nonzero.
 * @param x - X delta
 * @param y - Y delta
 * @param backward - if true, instead returns the direction away from
 *        the vector
 * @returns Direction
 */
export function getDirection(
  x: number,
  y: number,
  backward: boolean,
): Direction {
  if (backward) {
    x *= -1;
    y *= -1;
  }

  let dir: Direction = Direction.NONE;

  if (x < 0) {
    dir |= Direction.WEST;
  } else if (x > 0) {
    dir |= Direction.EAST;
  }

  if (y < 0) {
    dir |= Direction.NORTH;
  } else if (y > 0) {
    dir |= Direction.SOUTH;
  }

  return dir;
}

/**
 * An abstract class for all implementers of actions.
 *
 * Work/animation for a sprite to do that will require more than one tick/frame.
 *
 * See Collidable#queueAction and Collidable#updateActions for usage.
 *
 * Note: All sprite actions must, for now, be able to complete in a provided
 * number of steps/frames, instead of blocking until they complete.  The latter
 * is a larger change that we'll save until later.
 */
abstract class SpriteAction {
  /**
   * Perform one tick/frame step of the action on the given sprite.
   * @param sprite - the sprite the action is being performed on.
   */
  abstract update(sprite: Collidable): void;

  /**
   * Perform one tick/frame step of the action on the given sprite.
   * @returns whether the action is finished running.
   */
  abstract isDone(): boolean;
}

export default SpriteAction;
