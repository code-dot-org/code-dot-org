// Tearing a game down, when the game is in no state to be torn down.
//
// A crash and a rebuild go together: the learner breaks something, the preview
// reports it, they fix it, and the preview starts a new game in the same pane.
// That only works if stopping the old one is unconditional. A `destroy` that
// throws — which a game whose scene died mid-`create` can do — used to abandon
// the teardown halfway, leaving the dead canvas in the pane for the next game's
// canvas to stack on top of. That is the "phantom canvas" a crash leaves behind,
// and it is what these pin.
//
// Phaser is a fake here: what matters is what the pane contains afterwards, not
// what WebGL did.

import {beforeEach, describe, expect, it, vi} from 'vitest';

/** Whether the fake game's `destroy` blows up, as a crashed one's can. */
let destroyThrows = false;
/** Whether the fake game leaves its canvas behind, as a crashed one does. */
let destroyLeavesCanvas = false;

vi.mock('phaser', () => {
  class Game {
    readonly parent: HTMLElement;
    readonly canvas: HTMLCanvasElement;
    constructor(config: {parent: HTMLElement}) {
      this.parent = config.parent;
      this.canvas = document.createElement('canvas');
      this.parent.appendChild(this.canvas);
    }
    destroy(): void {
      if (!destroyLeavesCanvas) {
        this.canvas.remove();
      }
      if (destroyThrows) {
        throw new Error('Cannot read properties of null (reading "renderer")');
      }
    }
  }
  const Phaser = {
    WEBGL: 2,
    Scale: {FIT: 3},
    Game,
    GameObjects: {
      Components: {TransformMatrix: class {}},
      Image: class {},
    },
  };
  return {default: Phaser, ...Phaser};
});

vi.mock('../effects', () => ({
  EffectRegistry: class {
    reconcile() {}
    reconcileCamera() {}
  },
}));

import {PhaserBinding} from '../PhaserBinding';

/** A World stub: the binding only calls these while a frame is running. */
const world = (over: Record<string, unknown> = {}) =>
  ({
    // A real World is lent one of these at set-up so a caret can be placed
    // after the last letter (`World.useTextMetrics`); a stub takes it and
    // ignores it, as it does the keyboard.
    useTextMetrics: () => {},
    setInput: () => {},
    setPointer: () => {},
    tick: () => {},
    effects: () => [],
    renderSnapshot: () => [],
    // Drained after every tick (specs/SOUND.md).
    drainSounds: () => [],
    music: () => undefined,
    snapshot: () => ({world: {}}),
    // Which keys this world has asked the browser to leave alone, and the
    // moment it took the keyboard — both read by the listeners the binding
    // attaches to the game's element (`World.captureKey`).
    capturedKeys: () => new Set<string>(),
    gainedKeyboard: () => {},
    ...over,
  }) as never;

describe('stopping a game', () => {
  beforeEach(() => {
    destroyThrows = false;
    destroyLeavesCanvas = false;
    document.body.innerHTML = '';
    // jsdom has no WebGL; the binding refuses to start without it (assertWebGL).
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  const pane = (): HTMLElement => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    return element;
  };

  it('leaves the pane empty', () => {
    const parent = pane();
    new PhaserBinding(world(), parent).stop();
    expect(parent.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('leaves the pane empty even when destroy refuses', () => {
    // The case that produced phantom canvases: teardown threw, the caller
    // carried on, and the next game's canvas joined the dead one.
    destroyThrows = true;
    destroyLeavesCanvas = true;
    const parent = pane();
    const binding = new PhaserBinding(world(), parent);
    expect(() => binding.stop()).not.toThrow();
    expect(parent.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('leaves one canvas when a game is stopped and another started', () => {
    destroyThrows = true;
    destroyLeavesCanvas = true;
    const parent = pane();
    new PhaserBinding(world(), parent).stop();
    new PhaserBinding(world(), parent);
    expect(parent.querySelectorAll('canvas')).toHaveLength(1);
  });
});

// WHICH KEYS THE GAME TAKES FROM THE BROWSER, and when it gives them back.
//
// The accessibility claim, and the one that is invisible when it breaks: a
// canvas that swallows Tab is somewhere a keyboard user can arrive and not
// leave. `SCROLL_KEYS` is the floor — a platformer must not scroll the page —
// and everything past it is the WORLD's to ask for, one moment at a time,
// because Tab belongs to the game only while one of its own controls holds the
// focus (specs/UI_ACTORS.md, `rules/tabNavigation`).
describe('the keys the game takes from the browser', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  /** A game on a fresh element, and the element's keydown. */
  const game = (captured: string[] = []) => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    new PhaserBinding(world({capturedKeys: () => new Set(captured)}), parent);
    return {
      parent,
      /** Whether the browser's own action for `key` was suppressed. */
      swallows: (key: string) => {
        const event = new KeyboardEvent('keydown', {key, cancelable: true});
        parent.dispatchEvent(event);
        return event.defaultPrevented;
      },
    };
  };

  it('always takes the keys that would scroll the page', () => {
    // The floor, and a constant: a game holding the arrows or space is not
    // asking for anything unusual, and a page scrolling under a platformer is
    // never what anybody meant.
    expect(game().swallows('ArrowUp')).toBe(true);
    expect(game().swallows(' ')).toBe(true);
  });

  it('leaves Tab to the page while the world has not asked for it', () => {
    // THE TRAP, avoided. With nothing focused inside the game, Tab is how the
    // player gets past the canvas.
    expect(game().swallows('Tab')).toBe(false);
  });

  it('takes Tab once the world asks for it', () => {
    // …and it asks while one of its own controls holds the focus, which is the
    // only time it should have it.
    expect(game(['tab']).swallows('Tab')).toBe(true);
  });

  it('asks about OUR name for the key, not the browser’s', () => {
    // The gap that made backspace unreachable for a whole commit: the DOM says
    // `Tab` and everything inland says `tab`, and a check on the wrong side of
    // `keyName` compares two strings that never match (`engine/core/keys`).
    expect(game(['Tab']).swallows('Tab')).toBe(false);
  });
});

// ARRIVING AT THE GAME, which is not the same as pressing a key in it.
describe('taking the keyboard', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  const game = () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    let arrivals = 0;
    new PhaserBinding(world({gainedKeyboard: () => (arrivals += 1)}), parent);
    return {parent, arrived: () => arrivals};
  };

  it('tells the world when the player tabs onto it', () => {
    // The Tab that carried them here was pressed while the page still had the
    // keyboard, so no key the game sees can stand for this.
    const {parent, arrived} = game();

    parent.dispatchEvent(new FocusEvent('focus'));

    expect(arrived()).toBe(1);
  });

  it('says nothing when the player CLICKS onto it', () => {
    // A click says where it landed, so bringing the focus to the first control
    // would move it off whatever was clicked. The DOM focus event cannot tell
    // the two apart; the pointer says so on its way past.
    const {parent, arrived} = game();

    // The pointerdown handler focuses the element itself, so the browser's own
    // focus event follows from this one line — which is the whole point: the
    // flag is set before the event it has to be read by.
    //
    // jsdom has no `PointerEvent`; the binding listens by NAME and reads
    // nothing off the event, so a plain one is the same thing to it.
    parent.dispatchEvent(new Event('pointerdown'));

    expect(arrived()).toBe(0);
  });

  it('does not stay in click mode afterwards', () => {
    // The flag is a fact about ONE arrival. Left set, the first click would
    // make every later tab-in silent.
    const {parent, arrived} = game();
    parent.dispatchEvent(new Event('pointerdown'));

    parent.dispatchEvent(new FocusEvent('focus'));

    expect(arrived()).toBe(1);
  });

  it('says what it is and how to leave it', () => {
    // A canvas tells a screen reader nothing. The half that matters is the way
    // OUT: a player who cannot find it is in a trap.
    const {parent} = game();

    expect(parent.getAttribute('role')).toBe('application');
    expect(parent.getAttribute('aria-label')).toContain('Escape');
  });
});
