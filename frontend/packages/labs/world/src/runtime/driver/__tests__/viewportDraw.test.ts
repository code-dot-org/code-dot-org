// The World, drawn through a Viewport (specs/ONE_WORLD_PLAN.md): a container
// at the top of the scene holding the World's actors and layers, drawn by
// each Viewport's Phaser camera into that Viewport's rectangle on the canvas
// and by no other; the main camera looks past it. Against a stand-in Phaser
// that records containers, their parents and each camera's viewport, zoom,
// centre, visibility and ignore list, and nothing else.

import {beforeEach, describe, expect, it, vi} from 'vitest';

interface FakeCamera {
  /** The bit a game object's `cameraFilter` carries to be passed over. */
  id: number;
  visible: boolean;
  viewport: number[];
  zoom: number;
  center: number[];
  ignored: FakeNode[];
  removed: boolean;
}
let cameras: FakeCamera[] = [];
let mainIgnored: FakeNode[] = [];
/** The scene's camera list, in the order it would draw them. */
let drawOrder: Array<{id: number; record?: FakeCamera}> = [];
/** The main camera's bit; a `const` would not exist yet inside the mock. */
const MAIN_ID = 1;

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
  /** The cameras that pass it over, as Phaser keeps them: a bit each. */
  filter: number;
  /** What it was last scaled by, both ways. */
  scale?: number;
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
      filter: 0,
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
    set cameraFilter(filter: number) {
      this.record.filter = filter;
    }
    get x() {
      return this.record.x;
    }
    get y() {
      return this.record.y;
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
    setScale(scale: number) {
      this.record.scale = scale;
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
  class Rectangle extends Base {
    setSize(width: number, height: number) {
      this.record.size = [width, height];
      return this;
    }
    setFillStyle() {
      return this;
    }
  }
  class Container extends Base {
    list: Base[] = [];
    add(child: Base) {
      child.parentContainer = this;
      child.record.parent = this.record;
      this.record.children.push(child.record);
      this.list.push(child);
      return this;
    }
    addAt(child: Base, index: number) {
      child.parentContainer = this;
      child.record.parent = this.record;
      this.record.children.splice(index, 0, child.record);
      this.list.splice(index, 0, child);
      return this;
    }
    remove(child: Base) {
      child.parentContainer = null;
      child.record.parent = null;
      this.list = this.list.filter(held => held !== child);
      this.record.children = this.record.children.filter(
        held => held !== child.record,
      );
      return this;
    }
    sort() {
      return this;
    }
    getIndex(child: Base) {
      return this.list.indexOf(child);
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
      id: 1 << (cameras.length + 1),
      visible: true,
      viewport: [],
      zoom: 1,
      center: [],
      ignored: [],
      removed: false,
    };
    cameras.push(record);
    return {
      record,
      id: record.id,
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
      setBackgroundColor() {
        return this;
      },
      setVisible(visible: boolean) {
        record.visible = visible;
        return this;
      },
      ignore(entry: Base) {
        record.ignored.push(entry.record);
        return this;
      },
    };
  };
  const main = {
    id: 1,
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
  };
  const scene = {
    cameras: {
      get cameras() {
        if (!drawOrder.length) {
          drawOrder.push(main);
        }
        return drawOrder;
      },
      main,
      add() {
        const made = fakeCamera();
        this.cameras.push(made);
        return made;
      },
      remove(camera: {record: FakeCamera}) {
        camera.record.removed = true;
        drawOrder = drawOrder.filter(held => held !== camera);
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
/** A second Viewport onto the same World. */
const MINI = {id: 'mini'};
const COIN = {id: 'a'};
/** Root actors either side of the Viewport in the draw order. */
const FLOOR = {id: 'floor'};
const SCORE = {id: 'score'};
/** Carried by the floor, and placed last. */
const BADGE = {id: 'badge'};
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

/** The World's layers: a half-speed `sky` with a backdrop, and `main`. */
const layersOf = (weather?: boolean) => [
  {
    id: 'sky',
    parallax: {x: 0.5, y: 0},
    background: slot('sky.png'),
  },
  {
    id: 'main',
    parallax: {x: 1, y: 1},
    background: slot(),
  },
  ...(weather
    ? [
        {
          id: 'weather',
          parallax: {x: 0, y: 0},
          background: slot(),
        },
      ]
    : []),
];

/**
 * A world with one Viewport at (160,160), 100 by 80, onto a World with a coin
 * on its `main` layer in front of a half-speed `sky` with a backdrop.
 */
const world = (held: {
  spaces: boolean;
  /** Whether the Viewport is there; the World stays without it. */
  window?: boolean;
  around?: boolean;
  carried?: boolean;
  /** A second Viewport at (60,60), onto the same World. */
  mini?: boolean;
  /** The box's camera's zoom, and a still layer over its map. */
  zoom?: number;
  weather?: boolean;
  /** A half-clear screen over the game, whose first actor is the Score. */
  screen?: boolean;
}) => {
  const shown = () => held.window !== false;
  const camera = () => ({x: 320, y: 160, zoom: held.zoom ?? 1});
  return {
    useTextMetrics: () => {},
    setInput: () => {},
    setPointer: () => {},
    tick: () => {},
    effects: () => [],
    drainSounds: () => [],
    music: () => undefined,
    screenBackdropSnapshot: () => [
      {effects: [], offset: {x: 0, y: 0}, repeat: false},
    ],
    screenColor: () => [0, 0, 0, 1],
    screenColors: () =>
      held.screen ? [{id: 7, color: [0, 0, 0, 0.5], first: SCORE.id}] : [],
    mapBounds: () => ({x: 320, y: 320}),
    viewSize: () => ({x: 320, y: 320}),
    screenSize: () => ({x: 320, y: 320}),
    screenLayerSnapshot: () => [
      {
        id: 'main',
        effects: [],
        parallax: {x: 1, y: 1},
      },
    ],
    cameraSnapshot: () => [
      {id: 'main', position: {x: 160, y: 160}, active: true},
    ],
    snapshot: () => ({world: {}}),
    // The clock the binding lends at set-up (specs/CLOCK_PLAN.md).
    useClock: () => {},
    renderSnapshot: () => [
      ...(held.around ? [state(FLOOR, 10, 10)] : []),
      ...(shown() ? [state(WINDOW, 160, 160)] : []),
      ...(held.mini ? [state(MINI, 60, 60)] : []),
      ...(held.spaces ? [state(COIN, 48, 48, {space: 'world', layer: 1})] : []),
      ...(held.around ? [state(SCORE, 160, 20)] : []),
      ...(held.carried
        ? [
            state(BADGE, 12, 12, {
              parent: FLOOR,
              local: {x: 2, y: 2, scaleX: 1, scaleY: 1, rotation: 0},
            }),
          ]
        : []),
    ],
    spaceSnapshot: () =>
      held.spaces
        ? [
            {
              id: 'world',
              owner: '',
              mirrors: undefined,
              camera: camera(),
              view: {x: 100, y: 80},
              bounds: {x: 640, y: 320},
              layers: layersOf(held.weather),
            },
            ...(shown()
              ? [
                  {
                    id: 'main/win',
                    owner: 'win',
                    mirrors: 'world',
                    camera: camera(),
                    view: {x: 100, y: 80},
                    bounds: {x: 640, y: 320},
                    layers: [],
                  },
                ]
              : []),
            ...(held.mini
              ? [
                  {
                    id: 'main/mini',
                    owner: 'mini',
                    mirrors: 'world',
                    camera: {x: 50, y: 40, zoom: 1},
                    view: {x: 100, y: 80},
                    bounds: {x: 640, y: 320},
                    layers: [],
                  },
                ]
              : []),
          ]
        : [],
  } as never;
};

const pane = (): HTMLElement => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

describe('drawing the World through a Viewport', () => {
  beforeEach(() => {
    nodes = [];
    cameras = [];
    mainIgnored = [];
    drawOrder = [];
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  /** The World's container, which the main camera was told to skip first. */
  const inner = () => cameras[0] && mainIgnored[0];
  /** The Viewport's camera: after the World's two, which draw nothing. */
  const box = () => cameras[2];

  it('draws the World with the Viewport’s camera, into the Viewport’s box', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    // The World's two, which draw nothing; the Viewport's, and the one that
    // draws what is in front of it.
    expect(cameras).toHaveLength(4);
    expect(cameras.map(camera => camera.visible)).toEqual([
      false,
      false,
      true,
      true,
    ]);
    const camera = box();
    // The Viewport is at (160,160), 100 by 80: its corner is (110,120), and
    // the canvas is the world at the render scale.
    expect(camera.viewport).toEqual([110 * 3, 120 * 3, 100 * 3, 80 * 3]);
    expect(camera.zoom).toBe(3);
    expect(camera.center).toEqual([320, 160]);
  });

  it('zooms the box’s camera, and measures its layers from what it shows', () => {
    // At 2 the camera at (320,160) takes in 50 by 40, from (295,140)
    // (specs/MIRRORING_PLAN.md, step 7).
    new PhaserBinding(world({spaces: true, zoom: 2, weather: true}), pane());
    runFrame();

    expect(box().zoom).toBe(3 * 2);
    const [sky, main, weather] = inner()!.children;
    expect([main.x, main.y]).toEqual([0, 0]);
    // Half the travel across, none up, from the corner the zoom shows.
    expect([sky.x, sky.y]).toEqual([147.5, 140]);
    // A layer at (0, 0) stays at the corner the zoom shows, and is never
    // scaled back: it zooms with the camera, which is what weather in the
    // scene wants (specs/ONE_WORLD_PLAN.md).
    expect([weather.x, weather.y]).toEqual([295, 140]);
    expect(weather.scale).toBeUndefined();
  });

  it('holds the World’s actors in a container the main camera ignores', () => {
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
    // The Viewport's camera looks past the root's layers…
    expect(box().ignored).toContain(layer);
    // …and its own empty container…
    expect(box().ignored).toContain(mainIgnored[1]);
    // …and draws the World's, which is the whole of what it is for.
    expect(box().ignored).not.toContain(container);
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

  it('takes a Viewport’s cameras down with it, and leaves the World', () => {
    const held = {spaces: true, window: true};
    new PhaserBinding(world(held), pane());
    runFrame();
    const container = inner()!;

    held.window = false;
    runFrame();

    expect(cameras.map(camera => camera.removed)).toEqual([
      false,
      false,
      true,
      true,
    ]);
    expect(container.destroyed).toBe(false);
  });
});

describe('what the root holds around a Viewport', () => {
  beforeEach(() => {
    nodes = [];
    cameras = [];
    mainIgnored = [];
    drawOrder = [];
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  /** The world layer's children, in the order they were placed. */
  const rootChildren = () =>
    nodes.find(
      n =>
        n.kind === 'container' && n.parent === null && !mainIgnored.includes(n),
    )!.children;

  it('is drawn by the main camera up to the Viewport, and by its `over` camera after', () => {
    new PhaserBinding(world({spaces: true, around: true}), pane());
    runFrame();

    const [, , , over] = cameras;
    const [floor, viewport, score] = rootChildren();
    // A filter names the cameras that pass a thing over. Behind the
    // Viewport, and the Viewport's own face: the main camera's, so `over`
    // passes. In front: the other way about.
    expect(floor.filter).toBe(over.id);
    expect(viewport.filter).toBe(over.id);
    expect(score.filter).toBe(MAIN_ID);
  });

  it('paints a screen’s color just before its first actor, over the World', () => {
    // specs/SCREEN_STACK_PLAN.md, step 2: a half-clear screen over the game
    // dims the Viewport's window too, so its color is drawn by `over`.
    const held = {spaces: true, around: true, screen: true};
    new PhaserBinding(world(held), pane());
    runFrame();

    const [, , , over] = cameras;
    const [, viewport, fill, score] = rootChildren();
    expect(fill.size).toEqual([320, 320]);
    expect([fill.x, fill.y]).toEqual([160, 160]);
    expect(viewport.filter).toBe(over.id);
    expect(fill.filter).toBe(MAIN_ID);
    expect(score.filter).toBe(MAIN_ID);

    // …and it goes with the screen.
    held.screen = false;
    runFrame();
    expect(fill.destroyed).toBe(true);
  });

  it('draws the cameras in band order: main, the space, then what is over it', () => {
    new PhaserBinding(world({spaces: true, around: true}), pane());
    runFrame();

    const [worldCamera, worldOver, space, over] = cameras;
    // …and the World's two after, which draw nothing.
    expect(drawOrder.map(camera => camera.id)).toEqual([
      MAIN_ID,
      space.id,
      over.id,
      worldCamera.id,
      worldOver.id,
    ]);
    // The `over` camera is the main camera again: the whole canvas, fitted
    // to the view, and blind to the World and to the Viewport's container.
    expect(over.viewport).toEqual([0, 0, 320 * 3, 320 * 3]);
    expect(over.zoom).toBe(3);
    expect(over.center).toEqual([160, 160]);
    expect(new Set(over.ignored)).toEqual(
      new Set([mainIgnored[0], mainIgnored[1]]),
    );
  });

  it('keeps a parent where it was when its first child makes it a group', () => {
    const held = {spaces: true, around: true, carried: false};
    new PhaserBinding(world(held), pane());
    runFrame();
    const [floor] = rootChildren();
    expect(floor.kind).toBe('image');

    // The floor gains a child: it is drawn through a group from here on,
    // and the group is where the floor was — behind the Viewport, and so
    // still the main camera's.
    held.carried = true;
    runFrame();
    const [group, , score] = rootChildren();
    expect(group.kind).toBe('container');
    expect(group.children).toContain(floor);
    expect(group.filter).toBe(cameras[3].id);
    expect(score.filter).toBe(MAIN_ID);
  });

  it('hands everything back to the main camera once the Viewport is gone', () => {
    const held = {spaces: true, around: true};
    new PhaserBinding(world(held), pane());
    runFrame();
    held.spaces = false;
    runFrame();

    expect(rootChildren().map(child => child.filter)).toEqual([0, 0, 0]);
    expect(drawOrder.map(camera => camera.id)).toEqual([MAIN_ID]);
  });
});

describe('two Viewports onto one World', () => {
  // A minimap, or split screen: each Viewport's camera draws the World's
  // container, and neither draws the other's (specs/ONE_WORLD_PLAN.md).
  beforeEach(() => {
    nodes = [];
    cameras = [];
    mainIgnored = [];
    drawOrder = [];
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  it('draws the World in both, each through its own camera', () => {
    new PhaserBinding(world({spaces: true, mini: true}), pane());
    runFrame();

    expect(cameras).toHaveLength(6);
    const [, , box, , mini] = cameras;
    const [worldInner, boxInner, miniInner] = mainIgnored;
    for (const camera of [box, mini]) {
      expect(camera.ignored).not.toContain(worldInner);
      expect(camera.ignored).toContain(boxInner);
      expect(camera.ignored).toContain(miniInner);
    }
    // Placed like any box: at (60,60), 100 by 80, looking through its camera.
    expect(mini.viewport).toEqual([10 * 3, 20 * 3, 100 * 3, 80 * 3]);
    expect(mini.center).toEqual([50, 40]);
    expect(box.center).toEqual([320, 160]);
  });
});
