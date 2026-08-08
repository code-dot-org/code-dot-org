// An actor that leaves the world takes its drawing with it.
//
// The engine can remove an actor mid-game (`World.removeActor` — "when the
// player touches a coin, remove the coin"), and the binding keeps one Phaser
// object per actor. Without a sweep the object stays on screen, still filtered
// and still lit, belonging to nothing.
//
// Phaser is a fake here, as in the backdrop tests: what matters is what is left
// in the scene, not what WebGL did.

import {beforeEach, describe, expect, it, vi} from 'vitest';

interface FakeObject {
  key: string;
  destroyed: boolean;
}
let objects: FakeObject[] = [];
let released = 0;
let scene: {update(time: number, delta: number): void} | null = null;

vi.mock('phaser', () => {
  class Image {
    record: FakeObject;
    constructor(record: FakeObject) {
      this.record = record;
    }
    setDepth() {
      return this;
    }
    setTexture() {
      return this;
    }
    setDisplaySize() {
      return this;
    }
    setPosition() {
      return this;
    }
    setScale() {
      return this;
    }
    setRotation() {
      return this;
    }
    destroy() {
      this.record.destroyed = true;
    }
  }
  const fakeScene = {
    cameras: {main: {setBackgroundColor: () => {}}},
    textures: {exists: () => false},
    add: {
      image: () => new Image({key: 'image', destroyed: false}),
      rectangle: (x: number, y: number) => {
        const record: FakeObject = {key: `rect@${x},${y}`, destroyed: false};
        objects.push(record);
        return new Image(record);
      },
      // The per-layer container actors are parented into.
      container: () => ({
        setDepth() {
          return this;
        },
        setPosition() {
          return this;
        },
        sort() {
          return this;
        },
        add() {
          return this;
        },
        destroy() {},
      }),
    },
  };
  class Game {
    constructor(config: {
      parent: HTMLElement;
      scene: {create(): void; update(time: number, delta: number): void};
    }) {
      config.parent.appendChild(document.createElement('canvas'));
      config.scene.create.call(fakeScene);
      scene = {
        update: (time, delta) =>
          config.scene.update.call(fakeScene, time, delta),
      };
    }
    destroy(): void {}
  }
  const Phaser = {
    WEBGL: 2,
    Scale: {FIT: 3},
    Game,
    Display: {Color: {GetColor32: () => 0}},
    GameObjects: {Components: {TransformMatrix: class {}}, Image},
  };
  return {default: Phaser, ...Phaser};
});

vi.mock('../effects', () => ({
  EffectRegistry: class {
    reconcile() {}
    reconcileCamera() {}
    release() {
      released++;
    }
  },
}));

import {PhaserBinding} from '../PhaserBinding';

/** A world whose actor list a test can shorten. */
const world = (actors: string[]) => {
  const live = [...actors];
  return {
    stub: {
      setInput: () => {},
      tick: () => {},
      effects: () => [],
      backdropSnapshot: () => [
        {effects: [], offset: {x: 0, y: 0}, repeat: false},
      ],
      foregroundSnapshot: () => [
        {effects: [], offset: {x: 0, y: 0}, repeat: false},
      ],
      backdropColor: () => [0, 0, 0, 1],
      // Only the backdrop code reads it; one viewport is a world with no map.
      mapBounds: () => ({x: 320, y: 320}),
      layerSnapshot: () => [
        {id: 'main', effects: [], parallax: {x: 1, y: 1}, fit: false},
      ],
      cameraSnapshot: () => [
        {id: 'main', position: {x: 0, y: 0}, active: true},
      ],
      renderSnapshot: () =>
        live.map((id, index) => ({
          actor: id,
          x: index * 10,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          skew: 0,
          effects: [],
        })),
      snapshot: () => ({world: {}}),
    } as never,
    remove: (id: string) => live.splice(live.indexOf(id), 1),
  };
};

const pane = () => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
};

describe('an actor that leaves the world', () => {
  beforeEach(() => {
    objects = [];
    released = 0;
    scene = null;
    document.body.innerHTML = '';
    HTMLCanvasElement.prototype.getContext = (() => ({
      getExtension: () => ({loseContext: () => {}}),
    })) as never;
  });

  it('takes its drawing with it', () => {
    const {stub, remove} = world(['player', 'coin']);
    new PhaserBinding(stub, pane());
    expect(objects.filter(object => !object.destroyed)).toHaveLength(2);

    remove('coin');
    scene?.update(0, 16);

    expect(objects.filter(object => !object.destroyed)).toHaveLength(1);
    // And its filters are let go, not left attached to a destroyed object.
    expect(released).toBe(1);
  });

  it('leaves the others alone', () => {
    const {stub, remove} = world(['player', 'coin', 'gem']);
    new PhaserBinding(stub, pane());
    const player = objects[0];

    remove('coin');
    scene?.update(0, 16);

    expect(player.destroyed).toBe(false);
    expect(objects.filter(object => !object.destroyed)).toHaveLength(2);
  });

  it('draws nothing new when nothing left', () => {
    // The sweep costs a Set of every actor; it should not be built every frame
    // for a world where nothing has changed.
    const {stub} = world(['player']);
    new PhaserBinding(stub, pane());
    const before = objects.length;

    scene?.update(0, 16);
    scene?.update(0, 16);

    expect(objects).toHaveLength(before);
    expect(objects.filter(object => object.destroyed)).toHaveLength(0);
  });
});
