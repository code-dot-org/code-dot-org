// Blips for what happens on the ground; being off it is heightTone's.

import {isMoving} from '../characterAnimations';

import {PlayerSoundEvent} from './playerSounds';

// Pixels walked between footsteps, so the beat follows the player's speed.
const STEP_DISTANCE = 16;

// A bump, not a graze: px of a move the walls must swallow to count.
const REFUSED_PX = 0.5;

// Signed along the way it was asked for, so leftward reads like rightward.
function refused(asked: number, got: number): boolean {
  return Math.abs(asked) - got * Math.sign(asked) > REFUSED_PX;
}

export interface MovementFrame {
  moved: number;
  // What the keys asked for; its gap from `moved` is a wall.
  requested: number;
  // The same pair against gravity, so their gap is a block overhead.
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

  // Two latches, or a wall held in the air masks the ceiling above it. A
  // move that came back short counts: release the key and no later frame
  // would catch it.
  const intoWall =
    isMoving(frame.requested) && refused(frame.requested, frame.moved);
  const intoBlock =
    frame.requestedUp > 0 && refused(frame.requestedUp, frame.movedUp);
  if ((intoWall && !state.intoWall) || (intoBlock && !state.intoBlock)) {
    events.push('blocked');
  }
  state.intoWall = intoWall;
  state.intoBlock = intoBlock;

  return events;
}
