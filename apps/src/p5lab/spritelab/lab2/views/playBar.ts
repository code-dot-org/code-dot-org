// The on-screen game controls under the playspace: which set a scene wants,
// and how a button press reaches the game.

import {KeyCodes} from '@cdo/apps/constants';

/** What the engine reports about the scene now running. */
export interface ControlsState {
  /** A platform scene, where the player jumps against gravity. */
  platformer: boolean;
  gravity: number;
}

/** Which arrow jumps: the up arrow under gravity, the down arrow when
    gravity pulls up (the player stands on the ceiling); none, with all four
    steering, when there is no gravity; or no arrows at all. */
export type ArrowSet = 'jump' | 'jumpDown' | 'steer' | 'none';

/** A story scene has nothing to steer. */
export function arrowSetFor(state: ControlsState): ArrowSet {
  if (!state.platformer) {
    return 'none';
  }
  if (state.gravity === 0) {
    return 'steer';
  }
  return state.gravity > 0 ? 'jump' : 'jumpDown';
}

export type GameKey = 'left' | 'right' | 'up' | 'down';

const KEY_EVENT_INIT: Record<GameKey, KeyboardEventInit> = {
  left: {keyCode: KeyCodes.LEFT, key: 'ArrowLeft', code: 'ArrowLeft'},
  right: {keyCode: KeyCodes.RIGHT, key: 'ArrowRight', code: 'ArrowRight'},
  up: {keyCode: KeyCodes.UP, key: 'ArrowUp', code: 'ArrowUp'},
  down: {keyCode: KeyCodes.DOWN, key: 'ArrowDown', code: 'ArrowDown'},
};

/**
 * Press or release a game key as if from the keyboard. p5 listens on window
 * and reads the legacy keyCode (as `which`), so the event carries it as well
 * as the modern key names.
 */
export function dispatchGameKey(type: 'keydown' | 'keyup', key: GameKey) {
  const init = KEY_EVENT_INIT[key];
  window.dispatchEvent(
    new KeyboardEvent(type, {...init, which: init.keyCode, bubbles: true})
  );
}
