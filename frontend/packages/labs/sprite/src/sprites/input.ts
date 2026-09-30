// Keyboard and mouse edge states (input.md, INP-). Raw events change the
// down set and the raw mouse fields at any time; tracked edge states change
// only in updateInputStates, which the lifecycle runs first in every pre
// phase. The instance's mouseX, mouseY, mouseIsPressed, mouseButton and
// touchIsDown are accessors over this module's raw state, because p5 2.x's
// pointer handlers would otherwise overwrite them with INP-19's outside and
// unrounded values.
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
  mouseX: number;
  mouseY: number;
  mouseIsPressed: boolean;
  mouseButton: string;
  touchIsDown: boolean;
  /** Nonzero while p5's own pointer handlers run; their writes are dropped. */
  p5Writing: number;
  /** p5's window blur listener, which runs after ours, clears mouseIsPressed; INP-20 does not. */
  blurPending: boolean;
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
}

/** Raw mouse fields that p5 2.x lacks or types differently (INP-20, INP-21). */
export interface RawMouseMembers {
  /** `'left'`, `'right'` or `'center'`: the button of the last inside mousedown. */
  mouseButton: string;
  touchIsDown: boolean;
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
    p5Writing: 0,
    blurPending: false,
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
function canvasPoint(p: p5, e: PointLike): {x: number; y: number} | null {
  const canvas = (p as unknown as {_curElement?: {elt?: HTMLElement} | null})
    ._curElement?.elt;
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
    x: Math.round((dx * canvas.offsetWidth) / rect.width),
    y: Math.round((dy * canvas.offsetHeight) / rect.height),
  };
}

function moveMouse(p: p5, state: InputState, e: PointLike): boolean {
  const point = canvasPoint(p, e);
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

function firstInsideTouch(p: p5, e: Event): {x: number; y: number} | null {
  const touches = (e as unknown as {touches?: ArrayLike<PointLike>}).touches;
  if (!touches) {
    return null;
  }
  for (let i = 0; i < touches.length; i++) {
    const point = canvasPoint(p, touches[i]);
    if (point) {
      return point;
    }
  }
  return null;
}

const RAW_MOUSE_FIELDS = [
  'mouseX',
  'mouseY',
  'mouseIsPressed',
  'mouseButton',
  'touchIsDown',
] as const;

// p5 2.x binds `this._on<event>` for these at presetup, after attachment.
const P5_POINTER_HANDLERS = [
  'pointerdown',
  'pointerup',
  'pointercancel',
  'pointermove',
  'dragend',
  'dragover',
  'click',
  'dblclick',
  'wheel',
] as const;

type Handler = (this: p5, e: unknown) => unknown;

function defineMember(p: p5, name: string, descriptor: PropertyDescriptor) {
  Object.defineProperty(p, name, {
    configurable: true,
    enumerable: true,
    ...descriptor,
  });
}

/** Makes the instance's raw mouse fields accessors over `state` (INP-19..INP-22). */
function installRawMouse(p: p5, state: InputState): void {
  const target = p as unknown as Record<string, unknown>;
  for (const name of RAW_MOUSE_FIELDS) {
    defineMember(p, name, {
      get: () => state[name],
      set: (value: never) => {
        if (state.p5Writing > 0) {
          return;
        }
        if (name === 'mouseIsPressed' && state.blurPending && !value) {
          state.blurPending = false;
          return;
        }
        state[name] = value;
      },
    });
  }
  // p5 2.x's version assigns properties of an object-valued mouseButton.
  defineMember(p, '_setMouseButton', {value: () => {}, writable: true});
  for (const event of P5_POINTER_HANDLERS) {
    const original = target[`_on${event}`] as Handler | undefined;
    if (typeof original !== 'function') {
      continue;
    }
    defineMember(p, `_on${event}`, {
      writable: true,
      value: function (this: p5, e: unknown) {
        state.p5Writing++;
        try {
          return original.call(this, e);
        } finally {
          state.p5Writing--;
        }
      },
    });
  }
}

/**
 * INP-6: Code.org's mobile controls call the key handlers with a plain
 * object carrying `which`. Real events reach the down set through the
 * library's own listeners, so here only non-events do.
 */
function installKeyHandlers(p: p5, state: InputState): void {
  const target = p as unknown as Record<string, unknown>;
  for (const [name, apply] of [
    ['_onkeydown', keyPressed],
    ['_onkeyup', keyReleased],
  ] as const) {
    const original = target[name] as Handler | undefined;
    defineMember(p, name, {
      writable: true,
      value: function (this: p5, e: KeyLike) {
        if (!(e instanceof Event)) {
          apply(state, e);
        }
        return original?.call(this, e);
      },
    });
  }
}

function addListeners(p: p5, state: InputState, signal: AbortSignal): void {
  const options = {signal};
  window.addEventListener('keydown', e => keyPressed(state, e), options);
  window.addEventListener('keyup', e => keyReleased(state, e), options);
  window.addEventListener(
    'blur',
    () => {
      state.down.clear();
      state.blurPending = true;
    },
    options,
  );
  window.addEventListener(
    'mousedown',
    e => {
      if (moveMouse(p, state, e)) {
        state.mouseIsPressed = true;
        state.mouseButton = mouseButtonName(e.button);
        state.blurPending = false;
      }
    },
    options,
  );
  window.addEventListener(
    'mouseup',
    e => {
      moveMouse(p, state, e);
      state.mouseIsPressed = false;
      state.blurPending = false;
    },
    options,
  );
  window.addEventListener('mousemove', e => moveMouse(p, state, e), options);
  window.addEventListener(
    'touchstart',
    e => {
      const point = firstInsideTouch(p, e);
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
      if (!firstInsideTouch(p, e)) {
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
  p: p5,
  state: InputState,
  signal: AbortSignal,
): InputMembers {
  state.mouseX = p.mouseX;
  state.mouseY = p.mouseY;
  installRawMouse(p, state);
  installKeyHandlers(p, state);
  addListeners(p, state, signal);
  return {
    keyDown: key => keyState(state, key) === 'DOWN',
    keyWentDown: key => keyState(state, key) === 'WENT_DOWN',
    keyWentUp: key => keyState(state, key) === 'WENT_UP',
    mouseDown: button => buttonState(state, button) === 'DOWN',
    mouseUp: button => buttonState(state, button) === 'UP',
    mouseWentDown: button => buttonState(state, button) === 'WENT_DOWN',
    mouseWentUp: button => buttonState(state, button) === 'WENT_UP',
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
