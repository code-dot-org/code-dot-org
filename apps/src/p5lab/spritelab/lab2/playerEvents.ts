// Which blips a frame of the player earns. Only things that happen on the
// ground: being off it is the height tone's to report (heightTone.ts).

import {isMoving} from './characterAnimations';
import {PlayerSoundEvent} from './playerSounds';

// Pixels walked between footsteps, so the beat follows the player's speed.
const STEP_DISTANCE = 16;

// Rise a block has to swallow to count as a bump, not as a graze.
const BUMP_REFUSED_PX = 0.5;

/** One frame of the player, as the platform resolver left it. */
export interface PlayerFrame {
  moved: number;
  // What the keys asked for; its gap from `moved` is a wall.
  requested: number;
  // The same pair against gravity, so their gap is a block overhead.
  movedUp: number;
  requestedUp: number;
  grounded: boolean;
}

export interface PlayerEventState {
  blocked: boolean;
  stride: number;
}

export function initialPlayerEventState(): PlayerEventState {
  return {
    blocked: false,
    // Primed, so the first step of a walk sounds at once.
    stride: STEP_DISTANCE,
  };
}

export function playerEvents(
  state: PlayerEventState,
  frame: PlayerFrame
): PlayerSoundEvent[] {
  const events: PlayerSoundEvent[] = [];

  if (frame.grounded && isMoving(frame.moved)) {
    state.stride += Math.abs(frame.moved);
    if (state.stride >= STEP_DISTANCE) {
      state.stride -= STEP_DISTANCE;
      events.push('step');
    }
  } else {
    state.stride = STEP_DISTANCE;
  }

  // Asked to move and refused. A wall keeps refusing while the key is
  // held, but a block overhead only clips one frame of the rise, so it
  // shows up as a rise that came back short rather than one that failed.
  const blocked = frame.grounded
    ? isMoving(frame.requested) && !isMoving(frame.moved)
    : frame.requestedUp > 0 &&
      frame.requestedUp - frame.movedUp > BUMP_REFUSED_PX;
  if (blocked && !state.blocked) {
    events.push('blocked');
  }
  state.blocked = blocked;

  return events;
}
