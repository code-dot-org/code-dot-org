// A Viewport's space, drawn (specs/VIEWPORT_PLAN.md): a container of its own
// at the top of the scene holding the space's actors, drawn by a Phaser
// camera of its own into the Viewport's rectangle on the canvas and by no
// other; the main camera looks past it. Against a stand-in Phaser that
// records containers, their parents and each camera's viewport, zoom, centre
// and ignore list, and nothing else.

import {beforeEach, describe, expect, it, vi} from 'vitest';

interface FakeCamera {
  viewport: number[];
  zoom: number;
  center: number[];
  ignored: FakeNode[];
  removed: boolean;
}
let cameras: FakeCamera[] = [];
let mainIgnored: FakeNode[] = [];

interface FakeNode {
  kind: 'image' | 'container' | 'graphics';
  x: number;
  y: number;
  depth: number;
  children: FakeNode[];
  parent: FakeNode | null;
  destroyed: boolean;
  masked?: boolean;
  visible: boolean;
  /** For a graphics: the rectangles filled since the last clear. */
  rects: number[][];
  /** For a slot image: its texture and the size it was stretched to. */
  key?: string;
  size?: number[];
}
let nodes: FakeNode[] = [];
let lastScene: {
  config: {scene: {update(time: number, delta: number): void}};
  scene: unknown;
} | null = null;
export const runFrame = () =>
  lastScene?.config.scene.update.call(lastScene.scene, 0, 16);

vi.mock('phaser', () => {
  const node = (kind: FakeNode['kind'], x = 0, y = 0): FakeNode => {
    const made: FakeNode = {
      kind,
      x,
      y,
      depth: 0,
      children: [],
      parent: null,
      destroyed: false,
      visible: true,
      rects: [],
    };
    nodes.push(made);
    return made;
  };
  /** What every game object answers; the record is the assertion surface. */
  class Base {
    record: FakeNode;
    parentContainer: Base | null = null;
    constructor(record: FakeNode) {
      this.record = record;
    }
    setDepth(depth: number) {
      this.record.depth = depth;
      return this;
    }
    setPosition(x: number, y: number) {
      this.record.x = x;
      this.record.y = y;
      return this;
    }
    setScale() {
      return this;
    }
    setRotation() {
      return this;
    }
    setAlpha() {
      return this;
    }
    setVisible(visible: boolean) {
      this.record.visible = visible;
      return this;
    }
    setTexture(key: string) {
      this.record.key = key;
      return this;
    }
    setDisplaySize(width: number, height: number) {
      this.record.size = [width, height];
      return this;
    }
    destroy() {
      this.record.destroyed = true;
      for (const child of this.record.children) {
        child.destroyed = true;
      }
    }
  }
  class Image extends Base {}
  class TileSprite extends Image {
    setSize() {
      return this;
    }
    setTilePosition() {
      return this;
    }
  }
  class Rectangle extends Base {}
  class Container extends Base {
    add(child: Base) {
      child.parentContainer = this;
      child.record.parent = this.record;
      this.record.children.push(child.record);
      return this;
    }
    remove(child: Base) {
      child.parentContainer = null;
      child.record.parent = null;
      this.record.children = this.record.children.filter(
        held => held !== child.record,
      );
      return this;
    }
    sort() {
      return this;
    }
    setMask() {
      this.record.masked = true;
      return this;
    }
    /** The sum of positions up the chain, at scale 1: what a mask reads. */
    getWorldTransformMatrix() {
      let tx = 0;
      let ty = 0;
      for (let at: FakeNode | null = this.record; at; at = at.parent) {
        tx += at.x;
        ty += at.y;
      }
      return {tx, ty, scaleX: 1, scaleY: 1};
    }
  }
  class Graphics extends Base {
    clear() {
      this.record.rects = [];
      return this;
    }
    fillStyle() {
      return this;
    }
    fillRect(x: number, y: number, w: number, h: number) {
      this.record.rects.push([x, y, w, h]);
      return this;
    }
    createGeometryMask() {
      return {};
    }
  }
  const pointer = () => ({
    x: 0,
    y: 0,
    leftButtonDown: () => false,
    middleButtonDown: () => false,
    rightButtonDown: () => false,
  });
  const fakeCamera = () => {
    const record: FakeCamera = {
      viewport: [],
      zoom: 1,
      center: [],
      ignored: [],
      removed: false,
    };
    cameras.push(record);
    return {
      record,
      setViewport(x: number, y: number, w: number, h: number) {
        record.viewport = [x, y, w, h];
        return this;
      },
      setZoom(zoom: number) {
        record.zoom = zoom;
        return this;
      },
      centerOn(x: number, y: number) {
        record.center = [x, y];
        return this;
      },
      ignore(entry: Base) {
        record.ignored.push(entry.record);
        return this;
      },
    };
  };
  const scene = {
    cameras: {
      main: {
        setBackgroundColor() {},
        setZoom() {
          return this;
        },
        centerOn() {
          return this;
        },
        ignore(entry: Base) {
          mainIgnored.push(entry.record);
          return this;
        },
      },
      add: () => fakeCamera(),
      remove(camera: {record: FakeCamera}) {
        camera.record.removed = true;
      },
    },
    scale: {
      displaySize: {setAspectRatio() {}},
      resize() {},
      refresh() {},
    },
    textures: {exists: (key: string) => key === 'sky.png'},
    input: {mouse: {disableContextMenu() {}}, activePointer: pointer()},
    add: {
      image: (x: number, y: number, key?: string) => {
        const made = new Image(node('image', x, y));
        made.record.key = key;
        return made;
      },
      tileSprite: (x: number, y: number) => new TileSprite(node('image', x, y)),
      rectangle: (x: number, y: number) => new Rectangle(node('image', x, y)),
      container: (x: number, y: number) =>
        new Container(node('container', x, y)),
      graphics: () => new Graphics(node('graphics')),
    },
  };
  class Game {
    canvas: HTMLCanvasElement;
    constructor(config: {
      parent: HTMLElement;
      scene: {create(): void; update(time: number, delta: number): void};
    }) {
      this.canvas = document.createElement('canvas');
      config.parent.appendChild(this.canvas);
      config.scene.create.call(scene);
      lastScene = {config, scene};
    }
    destroy(): void {}
  }
  const Phaser = {
    WEBGL: 2,
    Scale: {FIT: 3},
    Game,
    Display: {Color: {GetColor32: () => 0}},
    GameObjects: {
      Components: {TransformMatrix: class {}},
      Image,
      TileSprite,
      Rectangle,
      Container,
      Graphics,
    },
  };
  return {default: Phaser, ...Phaser};
});

vi.mock('../effects', () => ({
  EffectRegistry: class {
    reconcile() {}
    reconcileCamera() {}
    release() {}
  },
}));

import {PhaserBinding} from '../PhaserBinding';

const WINDOW = {id: 'win'};
const COIN = {id: 'a'};
const state = (actor: object, x: number, y: number, more = {}) => ({
  actor,
  x,
  y,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skew: 0,
  opacity: 1,
  effects: [],
  layer: 0,
  ...more,
});

const slot = (sprite?: string) => ({
  ...(sprite ? {sprite} : {}),
  effects: [],
  offset: {x: 0, y: 0},
  repeat: false,
});

/**
 * A world with one Viewport at (160,160), 100 by 80, showing a coin on the
 * map's `main` layer in front of a half-speed `sky` with a backdrop.
 */
const world = (held: {spaces: boolean}) =>
  ({
    useTextMetrics: () => {},
    setInput: () => {},
    setPointer: () => {},
    tick: () => {},
    effects: () => [],
    drainSounds: () => [],
    music: () => undefined,
    backdropSnapshot: () => [
      {effects: [], offset: {x: 0, y: 0}, repeat: false},
    ],
    foregroundSnapshot: () => [
      {effects: [], offset: {x: 0, y: 0}, repeat: false},
    ],
    backdropColor: () => [0, 0, 0, 1],
    mapBounds: () => ({x: 320, y: 320}),
    viewSize: () => ({x: 320, y: 320}),
    layerSnapshot: () => [
      {id: 'main', effects: [], parallax: {x: 1, y: 1}, fit: false},
    ],
    cameraSnapshot: () => [
      {id: 'main', position: {x: 160, y: 160}, active: true},
    ],
    snapshot: () => ({world: {}}),
    renderSnapshot: () =>
      held.spaces
        ? [
            state(WINDOW, 160, 160),
            state(COIN, 48, 48, {space: 'main/win', layer: 1}),
          ]
        : [state(WINDOW, 160, 160)],
    spaceSnapshot: () =>
      held.spaces
        ? [
            {
              id: 'main/win',
              owner: 'win',
              camera: {x: 320, y: 160},
              view: {x: 100, y: 80},
              bounds: {x: 640, y: 320},
              layers: [
                {
                  id: 'sky',
                  parallax: {x: 0.5, y: 0},
                  fit: false,
                  background: slot('sky.png'),
                  foreground: slot(),
                },
                {
                  id: 'main',
                  parallax: {x: 1, y: 1},
                  fit: false,
                  background: slot(),
                  foreground: slot(),
                },
              ],
            },
          ]
        : [],
  }) as never;

const pane = (): HTMLElement => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

describe('drawing a Viewport’s space', () => {
  beforeEach(() => {
    nodes = [];
    cameras = [];
    mainIgnored = [];
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  const inner = () => cameras[0] && mainIgnored[0];

  it('draws the space with a camera of its own, into the Viewport’s box', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    expect(cameras).toHaveLength(1);
    const camera = cameras[0];
    // The Viewport is at (160,160), 100 by 80: its corner is (110,120), and
    // the canvas is the world at the render scale.
    expect(camera.viewport).toEqual([110 * 3, 120 * 3, 100 * 3, 80 * 3]);
    expect(camera.zoom).toBe(3);
    expect(camera.center).toEqual([320, 160]);
  });

  it('holds the space’s actors in a container the main camera ignores', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const container = inner()!;
    expect(container.kind).toBe('container');
    expect(container.parent).toBeNull();
    // In the map's `main` layer, the second of the space's two.
    const [, main] = container.children;
    const coin = main.children.find(child => child.kind === 'image')!;
    expect(coin.x).toBe(48);
    expect(coin.y).toBe(48);
    // …and nowhere else: the layer's container holds the Viewport's group,
    // not the coin.
    const layer = nodes.find(
      n =>
        n.kind === 'container' &&
        n.depth === 0 &&
        n.parent === null &&
        n !== container,
    )!;
    expect(layer.children.filter(child => child.kind === 'image')).toEqual([]);
    // The space camera looks past the layers.
    expect(cameras[0].ignored).toContain(layer);
  });

  it('gives the space its map’s layers, each moved for its factor', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const [sky, main] = inner()!.children;
    expect([sky.depth, main.depth]).toEqual([0, 1]);
    // The space camera scrolls by the whole offset, (270,120). A layer at
    // factor 1 is left where it is; one at (0.5, 0) is given back half of x
    // and all of y, so it nets half the camera's travel across and none up.
    expect([main.x, main.y]).toEqual([0, 0]);
    expect([sky.x, sky.y]).toEqual([135, 120]);
  });

  it('draws a layer’s background inside it, stretched over the map', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const [sky] = inner()!.children;
    const backdrop = sky.children.find(child => child.key === 'sky.png')!;
    expect(backdrop.depth).toBe(0);
    // `stretchedPlacement`: the view plus the factor's share of what the
    // camera can travel — (640−100) across at 0.5, none up at 0.
    expect(backdrop.size).toEqual([100 + 0.5 * 540, 80]);
    expect([backdrop.x, backdrop.y]).toEqual([(100 + 0.5 * 540) / 2, 40]);
  });

  it('takes the camera and container down with a Viewport that is gone', () => {
    const held = {spaces: true};
    new PhaserBinding(world(held), pane());
    runFrame();
    const container = inner()!;

    held.spaces = false;
    runFrame();

    expect(cameras[0].removed).toBe(true);
    expect(container.destroyed).toBe(true);
  });
});
