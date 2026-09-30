// Keyboard and mouse edge states (input.md, INP-). Raw events change the
// down set and the pointer state at any time; tracked edge states change
// only in updateInputStates, which the lifecycle runs first in every pre
// phase. The pointer state is this module's own (INP-29): p5's mouse fields
// are neither read nor written.
import type p5 from 'p5';

export type KeyName = number | string;

export type EdgeState = 'UP' | 'WENT_DOWN' | 'DOWN' | 'WENT_UP';

/** Per-instance keyboard and mouse state (INP-7, INP-18). */
export interface InputState {
  /** The down set of numeric key codes (INP-1). */
  readonly down: Set<number>;
  /** Tracked keys; `null` is the single "no key" entry (INP-14). */
  readonly keys: Map<number | null, EdgeState>;
  readonly buttons: Map<unknown, EdgeState>;
  /** The pointer state (INP-29). */
  mouseX: number;
  mouseY: number;
  mouseIsPressed: boolean;
  /** `'left'`, `'right'` or `'center'`: the button of the last inside mousedown. */
  mouseButton: string;
  touchIsDown: boolean;
  /** The canvas the instance's `createCanvas` last made (INP-19). */
  canvas: HTMLElement | null;
}

/** The instance members input.md specifies. */
export interface InputMembers {
  keyDown(key: KeyName): boolean;
  keyWentDown(key: KeyName): boolean;
  keyWentUp(key: KeyName): boolean;
  mouseDown(button?: string): boolean;
  mouseUp(button?: string): boolean;
  mouseWentDown(button?: string): boolean;
  mouseWentUp(button?: string): boolean;
  /** INP-6: a keydown with this `which`, for hosts without a DOM event. */
  pressKey(code: number): void;
  /** INP-6: a keyup with this `which`. */
  releaseKey(code: number): void;
}

export function createInputState(): InputState {
  return {
    down: new Set(),
    keys: new Map(),
    buttons: new Map(),
    mouseX: 0,
    mouseY: 0,
    mouseIsPressed: false,
    mouseButton: 'left',
    touchIsDown: false,
    canvas: null,
  };
}

/** INP-10. */
const KEY_CODES: ReadonlyMap<string, number> = (() => {
  const table = new Map<string, number>([
    ['BACKSPACE', 8],
    ['TAB', 9],
    ['ENTER', 13],
    ['SHIFT', 16],
    ['CTRL', 17],
    ['ALT', 18],
    ['PAUSE', 19],
    ['CAPS_LOCK', 20],
    ['ESC', 27],
    ['SPACE', 32],
    [' ', 32],
    ['PAGE_UP', 33],
    ['PAGE_DOWN', 34],
    ['END', 35],
    ['HOME', 36],
    ['LEFT_ARROW', 37],
    ['LEFT', 37],
    ['UP_ARROW', 38],
    ['UP', 38],
    ['RIGHT_ARROW', 39],
    ['RIGHT', 39],
    ['DOWN_ARROW', 40],
    ['DOWN', 40],
    ['INSERT', 45],
    ['DELETE', 46],
    ['MULTIPLY', 106],
    ['PLUS', 107],
    ['MINUS', 109],
    ['DOT', 110],
    ['SLASH1', 111],
    ['EQUAL', 187],
    ['COMMA', 188],
    ['SLASH', 191],
    ['BACKSLASH', 220],
  ]);
  for (let i = 0; i <= 9; i++) {
    table.set(String(i), 48 + i);
    table.set(`${i}NUMPAD`, 96 + i);
  }
  for (let i = 0; i < 26; i++) {
    table.set(String.fromCharCode(65 + i), 65 + i);
  }
  for (let i = 1; i <= 12; i++) {
    table.set(`F${i}`, 111 + i);
  }
  return table;
})();

/** INP-9. */
const DEPRECATED_KEYS: ReadonlyMap<string, string> = new Map([
  ['MINUT', 'MINUS'],
  ['COMA', 'COMMA'],
]);

/** INP-8: the key code `key` names, or null for no key. */
export function keyCode(key: unknown): number | null {
  if (typeof key === 'number') {
    return key;
  }
  if (typeof key !== 'string') {
    return null;
  }
  let alias = key.toUpperCase();
  const replacement = DEPRECATED_KEYS.get(alias);
  if (replacement !== undefined) {
    console.warn(
      `Key literal "${alias}" is deprecated and may be removed in a future version of p5.play. Please use "${replacement}" instead.`,
    );
    alias = replacement;
  }
  return KEY_CODES.get(alias) ?? null;
}

/** INP-23. */
const BUTTON_ALIASES: ReadonlyMap<unknown, string> = new Map([
  [undefined, 'left'],
  ['leftButton', 'left'],
  ['rightButton', 'right'],
  ['centerButton', 'center'],
]);

function buttonName(button: unknown): unknown {
  return BUTTON_ALIASES.has(button) ? BUTTON_ALIASES.get(button) : button;
}

/** INP-22. */
function buttonPressed(state: InputState, button: unknown): boolean {
  return (
    (state.mouseIsPressed && state.mouseButton === button) ||
    (state.touchIsDown && button === 'left')
  );
}

/** INP-15. */
function nextState(previous: EdgeState, pressed: boolean): EdgeState {
  if (pressed) {
    return previous === 'UP' ? 'WENT_DOWN' : 'DOWN';
  }
  return previous === 'DOWN' ? 'WENT_UP' : 'UP';
}

function keyState(state: InputState, key: unknown): EdgeState {
  const code = keyCode(key);
  let current = state.keys.get(code);
  if (current === undefined) {
    current = code !== null && state.down.has(code) ? 'DOWN' : 'UP';
    state.keys.set(code, current);
  }
  return current;
}

function buttonState(state: InputState, button: unknown): EdgeState {
  const name = buttonName(button);
  let current = state.buttons.get(name);
  if (current === undefined) {
    current = buttonPressed(state, name) ? 'DOWN' : 'UP';
    state.buttons.set(name, current);
  }
  return current;
}

interface KeyLike {
  which?: number;
  keyCode?: number;
}

/** INP-2, and input.md Open question 3's fallback to `keyCode`. */
function eventCode(e: KeyLike): number {
  return e.which || e.keyCode || 0;
}

function keyPressed(state: InputState, e: KeyLike): void {
  state.down.add(eventCode(e));
}

function keyReleased(state: InputState, e: KeyLike): void {
  state.down.delete(eventCode(e));
}

interface PointLike {
  clientX: number;
  clientY: number;
}

/** INP-19: the canvas point of an inside event, or null for an outside one. */
function canvasPoint(
  state: InputState,
  e: PointLike,
): {x: number; y: number} | null {
  const canvas = state.canvas;
  if (!canvas) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  const dx = e.clientX - rect.left;
  const dy = e.clientY - rect.top;
  if (!(dx >= 0 && dx < rect.width && dy >= 0 && dy < rect.height)) {
    return null;
  }
  return {
    x: (dx * canvas.offsetWidth) / rect.width,
    y: (dy * canvas.offsetHeight) / rect.height,
  };
}

function moveMouse(state: InputState, e: PointLike): boolean {
  const point = canvasPoint(state, e);
  if (!point) {
    return false;
  }
  state.mouseX = point.x;
  state.mouseY = point.y;
  return true;
}

/** INP-20's `button` numbers. */
function mouseButtonName(button: number): string {
  if (button === 1) {
    return 'center';
  }
  return button === 2 ? 'right' : 'left';
}

function firstInsideTouch(
  state: InputState,
  e: Event,
): {x: number; y: number} | null {
  const touches = (e as unknown as {touches?: ArrayLike<PointLike>}).touches;
  if (!touches) {
    return null;
  }
  for (let i = 0; i < touches.length; i++) {
    const point = canvasPoint(state, touches[i]);
    if (point) {
      return point;
    }
  }
  return null;
}

function addListeners(state: InputState, signal: AbortSignal): void {
  const options = {signal};
  window.addEventListener('keydown', e => keyPressed(state, e), options);
  window.addEventListener('keyup', e => keyReleased(state, e), options);
  window.addEventListener(
    'blur',
    () => {
      state.down.clear();
      state.mouseIsPressed = false;
    },
    options,
  );
  window.addEventListener(
    'mousedown',
    e => {
      if (moveMouse(state, e)) {
        state.mouseIsPressed = true;
        state.mouseButton = mouseButtonName(e.button);
      }
    },
    options,
  );
  window.addEventListener(
    'mouseup',
    e => {
      moveMouse(state, e);
      state.mouseIsPressed = false;
    },
    options,
  );
  window.addEventListener('mousemove', e => moveMouse(state, e), options);
  window.addEventListener(
    'touchstart',
    e => {
      const point = firstInsideTouch(state, e);
      if (point) {
        state.touchIsDown = true;
        state.mouseX = point.x;
        state.mouseY = point.y;
      }
    },
    options,
  );
  window.addEventListener(
    'touchend',
    e => {
      if (!firstInsideTouch(state, e)) {
        state.touchIsDown = false;
      }
    },
    options,
  );
}

/**
 * Called once at attachment, before setup. `signal` aborts when the
 * instance is removed.
 */
export function installInput(
  state: InputState,
  signal: AbortSignal,
): InputMembers {
  addListeners(state, signal);
  return {
    keyDown: key => keyState(state, key) === 'DOWN',
    keyWentDown: key => keyState(state, key) === 'WENT_DOWN',
    keyWentUp: key => keyState(state, key) === 'WENT_UP',
    mouseDown: button => buttonState(state, button) === 'DOWN',
    mouseUp: button => buttonState(state, button) === 'UP',
    mouseWentDown: button => buttonState(state, button) === 'WENT_DOWN',
    mouseWentUp: button => buttonState(state, button) === 'WENT_UP',
    pressKey: code => keyPressed(state, {which: code}),
    releaseKey: code => keyReleased(state, {which: code}),
  };
}

/** LIF-10 item 1 and INP-15: runs first in every pre phase. */
export function updateInputStates(_p: p5, state: InputState): void {
  for (const [code, previous] of state.keys) {
    state.keys.set(
      code,
      nextState(previous, code !== null && state.down.has(code)),
    );
  }
  for (const [button, previous] of state.buttons) {
    state.buttons.set(
      button,
      nextState(previous, buttonPressed(state, button)),
    );
  }
}
