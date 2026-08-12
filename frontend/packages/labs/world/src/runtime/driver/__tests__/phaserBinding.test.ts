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
const world = () =>
  ({
    setInput: () => {},
    setPointer: () => {},
    tick: () => {},
    effects: () => [],
    renderSnapshot: () => [],
    snapshot: () => ({world: {}}),
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
