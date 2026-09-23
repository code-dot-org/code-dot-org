// Turns the player's frame-by-frame state into what the audio needs: sound
// events, height, and distances to hazards. The engine supplies the frame;
// this keeps the previous one and decides what to report.

import {isMoving, nextFacing} from '../characterAnimations';
import {
  distanceToEdgeAhead,
  distanceToWallAhead,
  isSupported,
  PhysicsBox,
  PhysicsSprite,
} from '../platformPhysics';

import {PlayerHeight} from './heightTone';
import {
  initialMovementEventState,
  movementEvents,
  MovementEventState,
} from './movementEvents';
import {PlayerSoundEvent} from './playerSounds';
import {ProximityDistances} from './proximityAudio';

/** What the engine knows about the player after this frame's physics. */
export interface ObservedFrame {
  sprite: PhysicsSprite;
  /** Where the keys asked the player to be, before collisions were resolved. */
  requestedX: number;
  requestedY: number;
  gravity: number;
  walls: PhysicsBox[];
  view: {width: number; height: number};
}

/** Each is optional; the work behind an absent one is skipped. */
export interface PlayerObserverListeners {
  onSound?: (event: PlayerSoundEvent) => void;
  onHeight?: (height: PlayerHeight) => void;
  onProximity?: (distances: ProximityDistances) => void;
}

export interface PlayerObserver {
  readonly listeners: PlayerObserverListeners;
  observe(frame: ObservedFrame): void;
  /** No player to describe: held tones go quiet and the history clears. */
  forget(): void;
}

const SILENT_HEIGHT: PlayerHeight = {above: 0, airborne: false};
const NOTHING_NEAR: ProximityDistances = {wall: Infinity, edge: Infinity};

export function createPlayerObserver(
  listeners: PlayerObserverListeners
): PlayerObserver {
  let previous: {x: number; y: number} | null = null;
  let facing: 'left' | 'right' = 'right';
  let events: MovementEventState = initialMovementEventState();

  return {
    listeners,

    observe({sprite, requestedX, requestedY, gravity, walls, view}) {
      // With no gravity the player steers freely: there is no ground to stand
      // on or fall from.
      const weightless = gravity === 0;
      const grounded = weightless || isSupported(sprite, walls, view, gravity);
      const first = previous === null;
      const previousX = first ? sprite.position.x : previous!.x;
      const previousY = first ? sprite.position.y : previous!.y;
      previous = {x: sprite.position.x, y: sprite.position.y};
      const moved = sprite.position.x - previousX;
      // The first frame has no previous position, so nothing was requested.
      const requested = first ? 0 : requestedX - previousX;
      // Positive is away from the ground, whichever way gravity points. With
      // no gravity it is the direction the keys asked for, so a refused move
      // up or down is a bump either way.
      const up = weightless
        ? Math.sign(requestedY - previousY)
        : -Math.sign(gravity);
      // Facing follows the key when a move was refused, so a player pressed
      // against a wall faces it, and holds while still, so the warning tone
      // holds too.
      facing = nextFacing(facing, isMoving(moved) ? moved : requested);
      const direction = facing === 'left' ? -1 : 1;

      if (listeners.onSound) {
        movementEvents(events, {
          moved,
          requested,
          movedUp: (sprite.position.y - previousY) * up,
          requestedUp: first ? 0 : (requestedY - previousY) * up,
          grounded,
        }).forEach(listeners.onSound);
      }
      if (listeners.onHeight) {
        // Measured from the feet, so standing on the floor is 0 whatever the
        // costume's height, and two players on one row sound the same note.
        const feet = sprite.position.y + (sprite.height * sprite.scale) / 2;
        listeners.onHeight({
          above: (view.height - feet) / view.height,
          airborne: !grounded,
        });
      }
      if (listeners.onProximity) {
        listeners.onProximity({
          wall: distanceToWallAhead(sprite, direction, walls, view, gravity),
          // In the air the drop ahead is being jumped over, not approached.
          edge:
            grounded && !weightless
              ? distanceToEdgeAhead(sprite, direction, walls, view, gravity)
              : Infinity,
        });
      }
    },

    forget() {
      if (previous === null) {
        return;
      }
      listeners.onHeight?.(SILENT_HEIGHT);
      listeners.onProximity?.(NOTHING_NEAR);
      previous = null;
      facing = 'right';
      events = initialMovementEventState();
    },
  };
}
