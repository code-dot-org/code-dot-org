// Blips for what happens on the ground; being off it is heightTone's.

import {isMoving} from './characterAnimations';
import {PlayerSoundEvent} from './playerSounds';

// Pixels walked between footsteps, so the beat follows the player's speed.
const STEP_DISTANCE = 16;

// Rise a block has to swallow to count as a bump, not as a graze.
const BUMP_REFUSED_PX = 0.5;

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
  intoWall: boolean;
  intoBlock: boolean;
  stride: number;
}

export function initialPlayerEventState(): PlayerEventState {
  return {
    intoWall: false,
    intoBlock: false,
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

  // Two latches, or a wall held in the air masks the ceiling above it. A
  // wall keeps refusing while held; a block only clips one frame's rise.
  const intoWall = isMoving(frame.requested) && !isMoving(frame.moved);
  const intoBlock =
    frame.requestedUp > 0 &&
    frame.requestedUp - frame.movedUp > BUMP_REFUSED_PX;
  if ((intoWall && !state.intoWall) || (intoBlock && !state.intoBlock)) {
    events.push('blocked');
  }
  state.intoWall = intoWall;
  state.intoBlock = intoBlock;

  return events;
}
