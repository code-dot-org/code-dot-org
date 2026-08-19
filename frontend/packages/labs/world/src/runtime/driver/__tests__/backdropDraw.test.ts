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
/** One per engine layer — the container its drawing is parented into. */
interface FakeLayer {
  depth: number;
  /** Where the camera put it — the parallax transform. */
  x: number;
  y: number;
  children: Array<FakeImage | undefined>;
  destroyed: boolean;
}
let layers: FakeLayer[] = [];
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
  /** A pointer at rest with nothing held — the binding reads one every frame. */
  const pointer = () => ({
    x: 0,
    y: 0,
    leftButtonDown: () => false,
    middleButtonDown: () => false,
    rightButtonDown: () => false,
  });
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
    // The mouse: `create` claims the right button and `update` reads the
    // pointer, so a scene without one is not a scene the binding can run.
    input: {mouse: {disableContextMenu() {}}, activePointer: pointer()},
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
      /** The per-layer container everything is parented into. */
      container() {
        const record: FakeLayer = {
          depth: 0,
          x: 0,
          y: 0,
          children: [],
          destroyed: false,
        };
        layers.push(record);
        return {
          setDepth(depth: number) {
            record.depth = depth;
            return this;
          },
          setPosition(x: number, y: number) {
            record.x = x;
            record.y = y;
            return this;
          },
          sort() {
            return this;
          },
          add(child: {record?: FakeImage}) {
            record.children.push(child.record);
            return this;
          },
          destroy() {
            record.destroyed = true;
          },
        };
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
  /** Where the one camera looks from, and how each layer responds to it. */
  // Resting, as a real World's default camera is: its position is the point it
  // shows at the MIDDLE of the view (core/Camera), so (0, 0) is a camera that
  // has been moved half a viewport up and left, not one left alone.
  camera: {x: number; y: number} = {
    x: VIEWPORT_WIDTH / 2,
    y: VIEWPORT_HEIGHT / 2,
  },
  parallaxes: Array<{x: number; y: number}> = [],
  fits: boolean[] = [],
  /** How big the level is. One viewport, as a world with no map really is. */
  map: {x: number; y: number} = {x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT},
) =>
  ({
    setInput: () => {},
    setPointer: () => {},
    tick: () => {},
    effects: () => [],
    renderSnapshot: () => [],
    // Drained after every tick (specs/SOUND.md).
    drainSounds: () => [],
    music: () => undefined,
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
    // What a stretched slot covers: the level, not the window onto it.
    mapBounds: () => map,
    layerSnapshot: () =>
      backdrops.map((_, index) => ({
        id: index === 0 ? 'main' : `layer${index}`,
        effects: [],
        parallax: parallaxes[index] ?? {x: 1, y: 1},
        fit: fits[index] ?? false,
      })),
    cameraSnapshot: () => [
      // An inactive camera first, so a driver that took `[0]` rather than the
      // active one would draw through the wrong view.
      {id: 'unused', position: {x: -999, y: -999}, active: false},
      {id: 'main', position: camera, active: true},
    ],
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
    layers = [];
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

  it('parents each background into its own layer, and stacks the layers', () => {
    new PhaserBinding(
      world([{sprite: 'cave.png'}, {sprite: 'trees.png'}]),
      pane(),
    );

    // Depth is now split in two. Each layer's CONTAINER carries its place in
    // the stack, so the containers ascend; each background sits at depth 0
    // INSIDE its own container, below that layer's actors and above everything
    // in the layer beneath. Explicit depths rather than creation order: a
    // background set mid-game is made after the actors and would otherwise
    // cover them.
    expect(layers.map(layer => layer.depth)).toEqual([0, 1]);
    expect(images.map(image => image.depth)).toEqual([0, 0]);
    // And each went into its own layer, not into one shared display list.
    expect(layers.map(layer => layer.children.length)).toEqual([1, 1]);
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
      tileY: 0,
    });
  });

  it('keeps a tiled slot over the viewport when the camera moves', () => {
    // THE regression, and the reason a tiled slot is placed in two steps. It is
    // a child of its layer's container, and the camera slides that container —
    // so a finite rectangle of one viewport used to ride along and run out. A
    // quarter-viewport pan put a quarter-viewport band of bare clear-colour on
    // screen, which is the exact opposite of what "tiled" promises.
    //
    // Asserted as the container and the sprite TOGETHER, because either alone
    // is meaningless: what has to be true is where the two put it.
    const east = {x: VIEWPORT_WIDTH / 2 + 80, y: VIEWPORT_HEIGHT / 2};
    new PhaserBinding(
      world([{sprite: 'cave.png', repeat: true}], [0, 0, 0, 1], east),
      pane(),
    );

    expect(layers[0].x + images[0].x).toBe(VIEWPORT_WIDTH / 2);
    expect(layers[0].y + images[0].y).toBe(VIEWPORT_HEIGHT / 2);
    // …and the picture still tracks the world, out of a surface with no edge:
    // staying put would otherwise nail the background to the screen.
    expect(images[0]).toMatchObject({tiled: true, tileX: 80, tileY: 0});
  });

  it('stretches a slot over the MAP, not over the window onto it', () => {
    // A background belongs to the level. Sized to the viewport it covered
    // exactly one camera position, and a world three screens wide showed bare
    // clear-colour for the other two.
    const map = {x: VIEWPORT_WIDTH * 3, y: VIEWPORT_HEIGHT};
    new PhaserBinding(
      world([{sprite: 'cave.png'}], [0, 0, 0, 1], undefined, [], [], map),
      pane(),
    );

    expect(images[0]).toMatchObject({
      width: map.x,
      height: map.y,
      x: map.x / 2,
      y: map.y / 2,
    });
  });

  it('covers the window with that slot from the far end of the map', () => {
    // The point of the sizing, asserted where it is visible: container plus
    // image, against the window.
    const map = {x: VIEWPORT_WIDTH * 3, y: VIEWPORT_HEIGHT};
    // As far right as a camera confined to the map can look.
    const far = {x: map.x - VIEWPORT_WIDTH / 2, y: VIEWPORT_HEIGHT / 2};
    new PhaserBinding(
      world([{sprite: 'cave.png'}], [0, 0, 0, 1], far, [], [], map),
      pane(),
    );

    const left = layers[0].x + images[0].x - images[0].width / 2;

    expect(left).toBeLessThanOrEqual(0);
    expect(left + images[0].width).toBeGreaterThanOrEqual(VIEWPORT_WIDTH);
  });

  it('lets a camera pushed past the world take a stretched slot away', () => {
    // The limit that remains, stated rather than left to be discovered. A
    // stretched slot is one picture sized to the map, so it covers every
    // camera position INSIDE the map and none beyond it — the world below is
    // one screen, and the camera is looking a quarter-screen past its edge.
    // The tiled kind has no edge to reach and does not care.
    const east = {x: VIEWPORT_WIDTH / 2 + 80, y: VIEWPORT_HEIGHT / 2};
    new PhaserBinding(
      world([{sprite: 'cave.png'}], [0, 0, 0, 1], east),
      pane(),
    );

    expect(layers[0].x + images[0].x).toBe(VIEWPORT_WIDTH / 2 - 80);
  });

  it('makes a container per layer even when it draws no image', () => {
    // A layer with an effect and nothing in it yet is still a layer, and the
    // effect has to have something to attach to.
    new PhaserBinding(world([{}, {}]), pane());

    expect(layers).toHaveLength(2);
    expect(layers.map(layer => layer.depth)).toEqual([0, 1]);
  });

  it('moves each layer opposite the camera, scaled by its own parallax', () => {
    // The whole of what parallax means. Opposite, because moving the view right
    // moves the world left; per axis, because the commonest setting in a
    // side-scroller is horizontal only.
    //
    // Measured from where the camera RESTS, the middle of the view, because
    // that is what its position names (core/Camera). The camera below sits one
    // whole viewport right and down from the middle, so the game layer moves a
    // viewport the other way and the sky moves a fifth of that horizontally.
    const away = {x: VIEWPORT_WIDTH * 1.5, y: VIEWPORT_HEIGHT * 1.5};
    new PhaserBinding(
      world([{}, {}], [0, 0, 0, 1], away, [
        {x: 0.2, y: 0},
        {x: 1, y: 1},
      ]),
      pane(),
    );

    expect(layers.map(layer => [layer.x, layer.y])).toEqual([
      [-VIEWPORT_WIDTH * 0.2, -0],
      [-VIEWPORT_WIDTH, -VIEWPORT_HEIGHT],
    ]);
  });

  it('moves nothing at all while the camera rests', () => {
    // The reason the centre is folded in BEFORE the parallax factor. A world
    // that never mentions a camera has one, sitting in the middle of the view,
    // and it must draw exactly where it drew before cameras existed — including
    // a layer at factor 0, which `centre - camera * 0` would have shoved half a
    // screen sideways.
    new PhaserBinding(
      world([{}, {}], [0, 0, 0, 1], undefined, [
        {x: 0, y: 0},
        {x: 1, y: 1},
      ]),
      pane(),
    );

    expect(layers.map(layer => [layer.x, layer.y])).toEqual([
      [-0, -0],
      [-0, -0],
    ]);
  });

  it('leaves a layer fixed to the screen where it is', () => {
    // What an interface layer is: it does not consult the camera at all.
    new PhaserBinding(
      world([{}, {}], [0, 0, 0, 1], {x: 100, y: 50}, [], [false, true]),
      pane(),
    );

    expect(layers[1]).toMatchObject({x: -0, y: -0});
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
