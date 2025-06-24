import type Collidable from '../Collidable';
import {DEFAULT_ACTOR_FADE_TIME} from '../constants';
import type Sprite from '../Sprite';
import type SpriteAction from '../SpriteAction';

/**
 * Fade an actor out to nothing.
 */
class FadeActor implements SpriteAction {
  private startFadeTime?: number;
  private fadeDurationMs: number;

  /**
   * @param fadeDuration - How long it should take to fade out, in
   *        milliseconds. Default: 1 second.
   */
  constructor(fadeDuration?: number) {
    this.fadeDurationMs =
      fadeDuration === undefined ? DEFAULT_ACTOR_FADE_TIME : fadeDuration;
  }

  /**
   * Apply a single frame of change to the given sprite.
   */
  update(sprite: Collidable) {
    if (!this.startFadeTime) {
      // First frame of fade
      this.startFadeTime = new Date().getTime();
    }

    const currentTime = new Date().getTime();
    let opacity = 1 - (currentTime - this.startFadeTime) / this.fadeDurationMs;
    opacity = Math.max(opacity, 0);
    if ((sprite as Sprite).setOpacity) {
      (sprite as Sprite).setOpacity(opacity);
    }
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
      !!this.startFadeTime &&
      currentTime > (this.startFadeTime || 0) + this.fadeDurationMs
    );
  }
}

export default FadeActor;
