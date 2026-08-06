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
  /** Set on the repeating kind, with the texture scroll it was given. */
  tiled?: boolean;
  tileX?: number;
  tileY?: number;
}
let images: FakeImage[] = [];
/** The most recent game's scene, so a test can run frames against it. */
let lastScene: {
  config: {scene: {update(time: number, delta: number): void}};
  scene: unknown;
} | null = null;
export const runFrame = () =>
  lastScene?.config.scene.update.call(lastScene.scene, 0, 16);
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
    setPosition(x: number, y: number) {
      this.record.x = x;
      this.record.y = y;
      return this;
    }
    destroy() {
      this.record.destroyed = true;
    }
  }
  /** The repeating kind: same record, plus the texture scroll a tile has. */
  class TileSprite extends Image {
    setSize(width: number, height: number) {
      this.record.width = width;
      this.record.height = height;
      return this;
    }
    setTilePosition(x: number, y: number) {
      this.record.tileX = x;
      this.record.tileY = y;
      return this;
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
      tileSprite(x: number, y: number, _w: number, _h: number, key: string) {
        const record: FakeImage = {
          key,
          x,
          y,
          depth: 0,
          width: 0,
          height: 0,
          destroyed: false,
          tiled: true,
        };
        images.push(record);
        return new TileSprite(record);
      },
      rectangle: () => ({setDepth: () => {}}),
    },
  };
  class Game {
    constructor(config: {
      parent: HTMLElement;
      scene: {create(): void; update(time: number, delta: number): void};
    }) {
      config.parent.appendChild(document.createElement('canvas'));
      // Run the scene, which is the point of this fake — and keep `update`, so
      // a test can advance a frame.
      config.scene.create.call(scene);
      lastScene = {config, scene};
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
      TileSprite,
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
  backdrops: Array<{
    sprite?: string;
    offset?: {x: number; y: number};
    repeat?: boolean;
  }>,
  clearColor: [number, number, number, number] = [0, 0, 0, 1],
) =>
  ({
    setInput: () => {},
    tick: () => {},
    effects: () => [],
    renderSnapshot: () => [],
    backdropSnapshot: () =>
      backdrops.map(backdrop => ({
        offset: {x: 0, y: 0},
        repeat: false,
        ...backdrop,
        effects: [],
      })),
    foregroundSnapshot: () =>
      backdrops.map(() => ({effects: [], offset: {x: 0, y: 0}, repeat: false})),
    // One sky, the world's — not the bottom layer's (BACKGROUNDS.md).
    backdropColor: () => clearColor,
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
    new PhaserBinding(world([{sprite: 'cave.png'}]), pane());

    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({
      key: 'cave.png',
      x: VIEWPORT_WIDTH / 2,
      y: VIEWPORT_HEIGHT / 2,
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    });
  });

  it('puts each background below its own layer, and the layers in order', () => {
    new PhaserBinding(
      world([{sprite: 'cave.png'}, {sprite: 'trees.png'}]),
      pane(),
    );

    // Each background sits at the base of its own layer's depth span, so it is
    // below that layer's actors and above everything in the layer beneath.
    // Explicit depths rather than creation order: a background set mid-game is
    // made after the actors and would otherwise cover them.
    expect(images.map(image => image.depth)).toEqual([0, 10]);
  });

  it('slides a stretched slot bodily, which is where the gap comes from', () => {
    // Offset is motion the author owns, and on a stretched image it moves the
    // picture off its own edge. Legal, and almost always a sign that `repeat`
    // was wanted (core/Layer).
    new PhaserBinding(
      world([{sprite: 'cave.png', offset: {x: 12, y: -4}}]),
      pane(),
    );

    expect(images[0]).toMatchObject({
      x: VIEWPORT_WIDTH / 2 + 12,
      y: VIEWPORT_HEIGHT / 2 - 4,
    });
  });

  it('tiles a repeating slot, scrolling the texture under it', () => {
    // A TileSprite rather than an Image, because only that wraps — so the slot
    // stays put covering the surface and the picture moves inside it.
    new PhaserBinding(
      world([{sprite: 'cave.png', repeat: true, offset: {x: 8, y: 0}}]),
      pane(),
    );

    expect(images[0]).toMatchObject({
      tiled: true,
      x: VIEWPORT_WIDTH / 2,
      y: VIEWPORT_HEIGHT / 2,
      // Negated, so a rising offset moves the picture the way a rising
      // position moves an actor.
      tileX: -8,
      tileY: -0,
    });
  });

  it('draws nothing for a layer with no image, or an image the project lost', () => {
    new PhaserBinding(world([{}, {sprite: 'gone.png'}]), pane());

    expect(images).toHaveLength(0);
  });

  it('sets the camera colour from the world, not from a layer', () => {
    new PhaserBinding(world([{}], [1, 0, 0.5, 1]), pane());

    // 255,0,128 at full alpha, through the fake's GetColor32.
    expect(cameraColor).toBe((255 << 24) | (255 << 16) | (0 << 8) | 128);
  });
});
