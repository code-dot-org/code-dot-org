// The player's actions as program events: a walk beat, a jump, a landing,
// a bump. The engine feeds one frame per tick; the tracker keeps the frame
// before it.

import {refused} from './audioFeedback/movementEvents';
import {ObservedFrame} from './audioFeedback/playerObserver';
import {isMoving} from './characterAnimations';
import {isSupported} from './platformPhysics';

export const PLAYER_ACTIONS = ['walk', 'jump', 'land', 'bump'] as const;
export type PlayerAction = (typeof PLAYER_ACTIONS)[number];

export function isPlayerAction(value: unknown): value is PlayerAction {
  return (
    typeof value === 'string' &&
    (PLAYER_ACTIONS as readonly string[]).includes(value)
  );
}

// A walk fires on its first frame, then each time the walk animation
// changes frame; a character with one frame falls back to this beat.
export const WALK_PERIOD_MS = 333;

export interface PlayerFrame extends ObservedFrame {
  /** The frame the character's animation shows, and how many it has. */
  animationFrame?: number;
  animationFrames?: number;
}

export interface PlayerActionTracker {
  /** The actions this frame holds. `nowMs` paces a one-frame walk. */
  observe(frame: PlayerFrame, nowMs: number): Set<PlayerAction>;
  /** No player: the next frame starts fresh. */
  forget(): void;
}

export function createPlayerActionTracker(): PlayerActionTracker {
  let previous: {x: number; y: number; grounded: boolean} | null = null;
  let walking: {at: number; frame: number | undefined} | null = null;
  let intoWall = false;
  let intoBlock = false;

  return {
    observe(
      {
        sprite,
        requestedX,
        requestedY,
        gravity,
        walls,
        view,
        animationFrame,
        animationFrames,
      },
      nowMs
    ) {
      const actions = new Set<PlayerAction>();
      const weightless = gravity === 0;
      const grounded = weightless || isSupported(sprite, walls, view, gravity);
      const {x, y} = sprite.position;
      const last = previous;
      previous = {x, y, grounded};
      if (!last) {
        return actions;
      }
      const moved = x - last.x;
      const requested = requestedX - last.x;
      const up = weightless
        ? Math.sign(requestedY - last.y)
        : -Math.sign(gravity);
      const movedUp = (y - last.y) * up;
      const requestedUp = (requestedY - last.y) * up;

      if (grounded && isMoving(moved)) {
        const animated = (animationFrames ?? 1) > 1;
        const beat = animated
          ? walking !== null && animationFrame !== walking.frame
          : walking !== null && nowMs - walking.at >= WALK_PERIOD_MS;
        if (walking === null || beat) {
          actions.add('walk');
          walking = {at: nowMs, frame: animationFrame};
        } else {
          walking.frame = animationFrame;
        }
      } else {
        walking = null;
      }

      if (last.grounded && !grounded && movedUp > 0) {
        actions.add('jump');
      }
      if (!last.grounded && grounded) {
        actions.add('land');
      }

      const wall = isMoving(requested) && refused(requested, moved);
      const block = requestedUp > 0 && refused(requestedUp, movedUp);
      if ((wall && !intoWall) || (block && !intoBlock)) {
        actions.add('bump');
      }
      intoWall = wall;
      intoBlock = block;
      return actions;
    },

    forget() {
      previous = null;
      walking = null;
      intoWall = false;
      intoBlock = false;
    },
  };
}
