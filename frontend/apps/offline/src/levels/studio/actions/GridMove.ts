import type Collidable from '../Collidable';
import {getDirection} from '../SpriteAction';
import type SpriteAction from '../SpriteAction';

/**
 * Move sprite by a desired delta over a certain number of steps/ticks.
 * Used to provide discrete grid movement in playlab's continuous interpreted
 * environment.
 */
class GridMove implements SpriteAction {
  private towardDeltaX: number;
  private towardDeltaY: number;
  private totalSteps: number;
  private elapsedSteps: number = 0;
  private direction: number;
  /** How much of the full distance to travel. */
  private percentBeforeReverse: number = 0.3;
  private startX: number = 0;
  private startY: number = 0;

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
    // Logically snap the sprite to its final position on the first frame,
    // the interpolation is for display only.
    if (this.elapsedSteps === 0) {
      this.startX = sprite.x;
      this.startY = sprite.y;
      sprite.x += this.towardDeltaX;
      sprite.y += this.towardDeltaY;
      sprite.setDirection?.(this.direction);
    }
    const normalizedProgress = (this.elapsedSteps + 1) / this.totalSteps;
    sprite.displayX = this.startX + this.towardDeltaX * normalizedProgress;
    sprite.displayY = this.startY + this.towardDeltaY * normalizedProgress;
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

export default GridMove;
