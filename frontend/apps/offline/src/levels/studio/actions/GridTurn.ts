import type Collidable from '../Collidable';
import type SpriteAction from '../SpriteAction';

/**
 * Turn sprite toward a desired direction. Note that although this action can
 * take place over the course of several steps/ticks, we only set the direction
 * on the first tick; the sprite's own animation logic will take care of the
 * rest.
 */
class GridTurn implements SpriteAction {
  private towardDir: number;
  private totalSteps: number;
  private elapsedSteps: number = 0;

  constructor(towardDir: number, totalSteps: number) {
    this.towardDir = towardDir;
    this.totalSteps = totalSteps;
  }

  update(sprite: Collidable) {
    if (this.elapsedSteps === 0) {
      sprite.setDirection(this.towardDir);
    }

    this.elapsedSteps++;
  }

  isDone() {
    return this.elapsedSteps >= this.totalSteps;
  }
}

export default GridTurn;
