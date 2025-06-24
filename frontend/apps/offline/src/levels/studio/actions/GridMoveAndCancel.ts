import type Collidable from '../Collidable';
import {getDirection} from '../SpriteAction';
import type SpriteAction from '../SpriteAction';

/**
 * Move sprite partway toward a desired destination position, but have it
 * stop and reverse to its original position after a moment, as if it was
 * bouncing off a wall.
 */
class GridMoveAndCancel implements SpriteAction {
  private towardDeltaX: number;
  private towardDeltaY: number;
  private totalSteps: number;
  private elapsedSteps: number = 0;
  private direction: number;
  /** How much of the full distance to travel. */
  private percentBeforeReverse: number = 0.3;

  constructor(
    towardDeltaX: number,
    towardDeltaY: number,
    totalSteps: number,
    backward: boolean,
  ) {
    this.towardDeltaX = towardDeltaX;
    this.towardDeltaY = towardDeltaY;
    this.totalSteps = totalSteps;
    this.direction = getDirection(towardDeltaX, towardDeltaY, backward);
  }

  /**
   * Apply a single frame of change to the given sprite.
   */
  update(sprite: Collidable) {
    // Note: The sprite's logical position (sprite.x, sprite.y) never changes
    //       for this action.
    if (this.elapsedSteps === 0) {
      sprite.setDirection?.(this.direction);
    }

    const normalizedProgress = (this.elapsedSteps + 1) / this.totalSteps;
    const percentOffset =
      2 *
      this.percentBeforeReverse *
      (normalizedProgress < 0.5 ? normalizedProgress : 1 - normalizedProgress);

    sprite.displayX = sprite.x + this.towardDeltaX * percentOffset;
    sprite.displayY = sprite.y + this.towardDeltaY * percentOffset;

    // Could do a forced reversal of animation here, depends on how it looks
    // with the real assets.
    this.elapsedSteps++;
  }

  /**
   * Whether the action is done.
   *
   * @returns In this case, whether the animation is complete, based on the
   *          number of steps that have elapsed.
   */
  isDone(): boolean {
    return this.elapsedSteps >= this.totalSteps;
  }
}

export default GridMoveAndCancel;
