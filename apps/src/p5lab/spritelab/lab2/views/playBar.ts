// The on-screen game controls under the playspace: which set a scene wants,
// and how a button press reaches the game.

import {KeyCodes} from '@cdo/apps/constants';

/** What the engine reports about the scene now running. */
export interface ControlsState {
  /** A platform scene, where the player jumps against gravity. */
  platformer: boolean;
  gravity: number;
}

/** Left and right plus Jump, or left, right, up and down. */
export type ArrowSet = 'jump' | 'steer';

/** A weightless platform scene steers up and down like a story scene. */
export function arrowSetFor(state: ControlsState): ArrowSet {
  return state.platformer && state.gravity !== 0 ? 'jump' : 'steer';
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
