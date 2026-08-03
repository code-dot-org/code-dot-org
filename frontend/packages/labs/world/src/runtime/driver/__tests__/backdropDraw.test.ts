// Drawing the backdrop: what the binding puts on the scene, and where.
//
// Three things the engine cannot check and a browser would be a heavy way to
// ask: the image is STRETCHED to the viewport rather than fitted, it sits BELOW
// the actors even when it arrives after them, and clearing it removes the image
// rather than leaving the last sky hanging.
//
// Phaser is a fake, and unlike the teardown test's it runs the scene: the game
// calls `preload` and `create`, and `create` is where the binding's first sync
// happens.

import {beforeEach, describe, expect, it, vi} from 'vitest';

/** Every image the fake scene was asked to add, in order. */
interface FakeImage {
  key: string;
  x: number;
  y: number;
  depth: number;
  width: number;
  height: number;
  destroyed: boolean;
}
let images: FakeImage[] = [];
let cameraColor = 0;
/** Texture keys the fake scene claims to hold. */
let textures = new Set<string>();

vi.mock('phaser', () => {
  class Image {
    record: FakeImage;
    constructor(record: FakeImage) {
      this.record = record;
    }
    setDepth(depth: number) {
      this.record.depth = depth;
      return this;
    }
    setTexture(key: string) {
      this.record.key = key;
      return this;
    }
    setDisplaySize(width: number, height: number) {
      this.record.width = width;
      this.record.height = height;
      return this;
    }
    destroy() {
      this.record.destroyed = true;
    }
  }
  const scene = {
    cameras: {
      main: {setBackgroundColor: (color: number) => (cameraColor = color)},
    },
    textures: {exists: (key: string) => textures.has(key)},
    add: {
      image(x: number, y: number, key: string) {
        const record: FakeImage = {
          key,
          x,
          y,
          depth: 0,
          width: 0,
          height: 0,
          destroyed: false,
        };
        images.push(record);
        return new Image(record);
      },
      rectangle: () => ({setDepth: () => {}}),
    },
  };
  class Game {
    constructor(config: {parent: HTMLElement; scene: {create(): void}}) {
      config.parent.appendChild(document.createElement('canvas'));
      // Run the scene, which is the point of this fake.
      config.scene.create.call(scene);
    }
    destroy(): void {}
  }
  const Phaser = {
    WEBGL: 2,
    Scale: {FIT: 3},
    Game,
    Display: {
      Color: {
        GetColor32: (r: number, g: number, b: number, a: number) =>
          (a << 24) | (r << 16) | (g << 8) | b,
      },
    },
    GameObjects: {
      Components: {TransformMatrix: class {}},
      Image,
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

// Below the mocks, like the teardown test's: the module under test must not be
// imported before `vi.mock` has replaced what it imports.
import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../../viewport';
import {PhaserBinding} from '../PhaserBinding';

/** A World stub whose backdrop is whatever a test says it is. */
const world = (
  backdrops: Array<{sprite?: string; color: [number, number, number, number]}>,
) =>
  ({
    setInput: () => {},
    tick: () => {},
    effects: () => [],
    renderSnapshot: () => [],
    backdropSnapshot: () =>
      backdrops.map(backdrop => ({...backdrop, effects: []})),
    snapshot: () => ({world: {}}),
  }) as never;

const pane = (): HTMLElement => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

describe('drawing the backdrop', () => {
  beforeEach(() => {
    images = [];
    cameraColor = 0;
    textures = new Set(['cave.png', 'trees.png']);
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  it('stretches the image over the whole viewport, centred', () => {
    new PhaserBinding(
      world([{sprite: 'cave.png', color: [0, 0, 0, 1]}]),
      pane(),
    );

    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({
      key: 'cave.png',
      x: VIEWPORT_WIDTH / 2,
      y: VIEWPORT_HEIGHT / 2,
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    });
  });

  it('puts it below the actors, and the layers in order', () => {
    new PhaserBinding(
      world([
        {sprite: 'cave.png', color: [0, 0, 0, 1]},
        {sprite: 'trees.png', color: [0, 0, 0, 0]},
      ]),
      pane(),
    );

    // Negative, so a background set mid-game still lands behind actors that
    // were created before it; ascending, so layer 1 draws over layer 0.
    expect(images.map(image => image.depth)).toEqual([-1000, -999]);
    expect(images.every(image => image.depth < 0)).toBe(true);
  });

  it('draws nothing for a layer with no image, or an image the project lost', () => {
    new PhaserBinding(
      world([{color: [0, 0, 0, 1]}, {sprite: 'gone.png', color: [0, 0, 0, 0]}]),
      pane(),
    );

    expect(images).toHaveLength(0);
  });

  it('sets the camera colour from layer 0', () => {
    new PhaserBinding(world([{color: [1, 0, 0.5, 1]}]), pane());

    // 255,0,128 at full alpha, through the fake's GetColor32.
    expect(cameraColor).toBe((255 << 24) | (255 << 16) | (0 << 8) | 128);
  });
});
