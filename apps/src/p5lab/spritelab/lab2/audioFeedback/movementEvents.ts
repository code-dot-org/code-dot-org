// Decides from one frame of movement whether a footstep or a bump should
// sound. Height while airborne is heightTone's.

import {isMoving} from '../characterAnimations';

import {PlayerSoundEvent} from './playerSounds';

// Pixels walked between footsteps, so the beat follows the player's speed.
const STEP_DISTANCE = 16;

// A move cut short by less than this is rounding, not a bump.
const REFUSED_PX = 0.5;

// Compared in the direction asked for, so a leftward move is judged like a
// rightward one.
function refused(asked: number, got: number): boolean {
  return Math.abs(asked) - got * Math.sign(asked) > REFUSED_PX;
}

export interface MovementFrame {
  moved: number;
  // The move the keys asked for. Less `moved` than this means a wall.
  requested: number;
  // The same two measured against gravity, so a shortfall means a block
  // overhead.
  movedUp: number;
  requestedUp: number;
  grounded: boolean;
}

export interface MovementEventState {
  intoWall: boolean;
  intoBlock: boolean;
  stride: number;
}

export function initialMovementEventState(): MovementEventState {
  return {
    intoWall: false,
    intoBlock: false,
    // Primed, so the first step of a walk sounds at once.
    stride: STEP_DISTANCE,
  };
}

export function movementEvents(
  state: MovementEventState,
  frame: MovementFrame
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

  // A move that fell short counts this frame: once the key is released, no
  // later frame shows the refusal.
  const intoWall =
    isMoving(frame.requested) && refused(frame.requested, frame.moved);
  const intoBlock =
    frame.requestedUp > 0 && refused(frame.requestedUp, frame.movedUp);
  // One flag per direction, so a bump sounds once per contact, and a wall
  // held against does not hide a block overhead.
  if ((intoWall && !state.intoWall) || (intoBlock && !state.intoBlock)) {
    events.push('blocked');
  }
  state.intoWall = intoWall;
  state.intoBlock = intoBlock;

  return events;
}
