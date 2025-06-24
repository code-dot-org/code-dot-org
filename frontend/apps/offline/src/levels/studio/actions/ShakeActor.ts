import type Collidable from '../Collidable';
import {
  SHAKE_DEFAULT_DURATION,
  SHAKE_DEFAULT_CYCLES,
  SHAKE_DEFAULT_DISTANCE,
} from '../constants';
import type SpriteAction from '../SpriteAction';

/**
 * Shake an actor left and right for a moment.
 */
class ShakeActor implements SpriteAction {
  private startShakeTime?: number;
  /** How long to fade out in milliseconds. Default: 1 second */
  private shakeDurationMs: number;
  /** How many complete back-and-forth shakes occur */
  private cycleCount: number = SHAKE_DEFAULT_CYCLES;
  /** Max shake distance from real position */
  private amplitude: number = SHAKE_DEFAULT_DISTANCE;
  /** Precalculated angular frequency of sine wave equation. */
  private angularFrequency: number;

  /**
   * Constructs the action.
   *
   * @param shakeDuration - how long it should take to fade out, in
   *        milliseconds.  Default to 1 second.
   */
  constructor(shakeDuration?: number) {
    this.shakeDurationMs =
      shakeDuration === undefined ? SHAKE_DEFAULT_DURATION : shakeDuration;
    this.angularFrequency =
      2 * Math.PI * (this.cycleCount / this.shakeDurationMs);
  }

  /**
   * Apply a single frame of change to the given sprite.
   */
  update(sprite: Collidable) {
    if (!this.startShakeTime) {
      // First frame of fade
      this.startShakeTime = new Date().getTime();
    }

    const elapsedTime = new Date().getTime() - this.startShakeTime;
    const offset =
      this.amplitude * Math.sin(this.angularFrequency * elapsedTime);

    sprite.displayX = sprite.x + offset;
  }

  /**
   * Whether the action is done.
   *
   * @returns In this case, whether the fade is complete, based on the elapsed
   *          time.
   */
  isDone(): boolean {
    const currentTime = new Date().getTime();

    return (
      !!this.startShakeTime &&
      currentTime > (this.startShakeTime || 0) + this.shakeDurationMs
    );
  }
}

export default ShakeActor;
