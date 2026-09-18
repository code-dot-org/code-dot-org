// A Viewport's space, drawn (specs/VIEWPORT_PLAN.md): a masked container pair
// inside the Viewport's own group, the outer at the Viewport's top-left
// corner, the inner shifted by the space's camera, the space's actors inside
// it and not in any layer's container, and the clip drawn where the outer
// container is on screen. Against a stand-in Phaser that records containers,
// their parents and the mask's rectangle, and nothing else.

import {beforeEach, describe, expect, it, vi} from 'vitest';

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
    setTexture() {
      return this;
    }
    setDisplaySize() {
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
      },
    },
    scale: {
      displaySize: {setAspectRatio() {}},
      resize() {},
      refresh() {},
    },
    textures: {exists: () => false},
    input: {mouse: {disableContextMenu() {}}, activePointer: pointer()},
    add: {
      image: (x: number, y: number) => new Image(node('image', x, y)),
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
      TileSprite: Image,
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

/** A world with one Viewport at (160,160), 100 by 80, showing a coin. */
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
        ? [state(WINDOW, 160, 160), state(COIN, 48, 48, {space: 'main/win'})]
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
            },
          ]
        : [],
  }) as never;

const pane = (): HTMLElement => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

const containers = () =>
  nodes.filter(n => n.kind === 'container' && !n.destroyed);
const masked = () => containers().find(n => n.masked);

describe('drawing a Viewport’s space', () => {
  beforeEach(() => {
    nodes = [];
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  it('puts a masked container in the Viewport’s group, at its corner', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const outer = masked()!;
    expect(outer.x).toBe(-50);
    expect(outer.y).toBe(-40);
    // Its parent is the Viewport's group: the container holding the
    // Viewport's own image, itself in the layer's container.
    const group = outer.parent!;
    expect(group.kind).toBe('container');
    expect(group.x).toBe(160);
    expect(group.y).toBe(160);
    expect(group.children.some(child => child.kind === 'image')).toBe(true);
    expect(group.parent!.depth).toBe(0);
  });

  it('shifts the space by its camera and holds the space’s actors', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const outer = masked()!;
    const inner = outer.children.find(child => child.kind === 'container')!;
    expect(inner.x).toBe(-(320 - 50));
    expect(inner.y).toBe(-(160 - 40));
    const coin = inner.children.find(child => child.kind === 'image')!;
    expect(coin.x).toBe(48);
    expect(coin.y).toBe(48);
    // …and nowhere else: the layer's container holds the group, not the coin.
    const layer = outer.parent!.parent!;
    expect(layer.children.filter(child => child.kind === 'image')).toEqual([]);
  });

  it('clips to the Viewport’s rectangle on screen', () => {
    new PhaserBinding(world({spaces: true}), pane());
    runFrame();

    const mask = nodes.find(n => n.kind === 'graphics')!;
    expect(mask.visible).toBe(false);
    // Layer at (0,0), group at (160,160), outer at (-50,-40): the corner.
    expect(mask.rects).toEqual([[110, 120, 100, 80]]);
  });

  it('takes the containers down with a Viewport that is gone', () => {
    const held = {spaces: true};
    new PhaserBinding(world(held), pane());
    runFrame();
    expect(masked()).toBeDefined();

    held.spaces = false;
    runFrame();

    expect(masked()).toBeUndefined();
    expect(nodes.find(n => n.kind === 'graphics')!.destroyed).toBe(true);
  });
});
