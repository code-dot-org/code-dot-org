// Spaces: what a map is loaded into, and what a Viewport owns
// (specs/VIEWPORT_PLAN.md; `core/Space`, `rules/viewport`).
//
// The claims pinned here: an actor is in one space; a Viewport gets one of
// its own; what the world is asked without an actor is answered for the
// actor in hand's space; a map loaded into a Viewport lands in its space,
// with the space's camera on what the map names and inside the map; and a
// Viewport unloaded or removed takes what it holds with it.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {each, filtered} from '../core/actorValue';
import {Vector} from '../core/Vector';
import type {World, WorldMap} from '../core/World';
import {
  IntrinsicSizeProperty,
  PositionProperty,
  ScaleProperty,
} from '../rules/spatial';
import {ViewportMapProperty, ViewportTrait} from '../rules/viewport';

const Ping = new RuleBuilder({id: 'pinger', name: 'Pinger'}).addEvent('ping');
const Coin = new ActorBuilder({id: 'coin', name: 'Coin'}).set(
  IntrinsicSizeProperty,
  new Vector(16, 16),
);
/** A 100 by 80 window onto a map, placed with its middle at (200, 160). */
const Window = new ActorBuilder({id: 'window', name: 'Window'})
  .useTraits([ViewportTrait])
  .set(IntrinsicSizeProperty, new Vector(100, 80));

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  world.define('actors/coin', Coin);
  world.define('actors/window', Window);
  return world;
};

/** Three coins across a 20-by-10-tile level, following the middle one. */
const LEVEL: WorldMap = {
  size: {width: 20, height: 10},
  tile: {width: 32, height: 32},
  actors: [
    {
      type: 'actors/coin',
      id: 'a',
      properties: {positional: {position: {x: 48, y: 48}}},
    },
    {
      type: 'actors/coin',
      id: 'b',
      properties: {positional: {position: {x: 320, y: 160}}},
    },
    {
      type: 'actors/coin',
      id: 'c',
      properties: {positional: {position: {x: 600, y: 300}}},
    },
  ],
  camera: {follows: 'b'},
};

const placeWindow = (world: World) =>
  world.addActor(Window.instantiate('win', 'actors/window'));

describe('an actor is in one space', () => {
  it('is in the root by default, and a Viewport owns one of its own', () => {
    const world = makeWorld();
    const coin = world.addActor(Coin.instantiate('c', 'actors/coin'));
    const window = placeWindow(world);

    expect(world.spaceOf(coin).id).toBe('main');
    expect(world.spaceOf(window).id).toBe('main');
    const space = world.viewportSpaceOf(window)!;
    expect(space.owner).toBe(window);
    expect(space.id).toBe('main/win');
    expect(world.spaces).toEqual([space]);
    // As big as the window until a map says otherwise; camera at its middle.
    expect(space.bounds).toEqual(new Vector(100, 80));
    expect(space.camera!.position).toEqual(new Vector(50, 40));
  });

  it('takes its parent’s space when it is given a parent', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadMapInto(window, LEVEL);
    const child = world.addActor(Coin.instantiate('child', 'actors/coin'));
    expect(world.spaceOf(child).id).toBe('main');

    child.setParent(inside);

    expect(world.spaceOf(child)).toBe(world.viewportSpaceOf(window));
  });
});

describe('loading into a Viewport', () => {
  it('places the map in the Viewport’s space, sized and followed', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));

    const added = world.loadMapInto(window, LEVEL);
    const space = world.viewportSpaceOf(window)!;

    expect(added.map(actor => actor.id)).toEqual(['a', 'b', 'c']);
    expect(added.every(actor => actor.space === space)).toBe(true);
    // The level's positions are the level's, whatever the window's.
    expect(added[1].get(PositionProperty)).toEqual(new Vector(320, 160));
    expect(space.bounds).toEqual(new Vector(640, 320));
    expect(world.mapBounds(added[0])).toEqual(new Vector(640, 320));
    expect(world.mapBounds()).toEqual(new Vector(320, 320));
    // On the coin it follows, which is inside the level, so unclamped.
    expect(space.camera!.position).toEqual(new Vector(320, 160));
    expect(world.viewSize(added[0])).toEqual(new Vector(100, 80));
  });

  it('keeps the camera inside the map as what it follows moves', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [, middle] = world.loadMapInto(window, LEVEL);

    middle.set(PositionProperty, new Vector(10, 10));
    world.tick(0);
    expect(world.viewportSpaceOf(window)!.camera!.position).toEqual(
      new Vector(50, 40),
    );

    middle.set(PositionProperty, new Vector(900, 900));
    world.tick(0);
    expect(world.viewportSpaceOf(window)!.camera!.position).toEqual(
      new Vector(590, 280),
    );
  });

  it('replaces what the Viewport held, and can be emptied', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadMapInto(window, LEVEL);
    world.loadMapInto(window, {actors: [{type: 'actors/coin', id: 'd'}]});
    expect([...world.actors].map(actor => actor.id)).toEqual(['win', 'd']);

    world.unloadViewport(window);
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);
  });

  it('loads by the path a map was registered under, or nothing', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.defineMap('maps/level1', LEVEL);

    expect(world.loadMapInto(window, 'maps/level1')).toHaveLength(3);
    expect(world.loadMapInto(window, 'maps/missing')).toEqual([]);
    expect([...world.actors]).toHaveLength(1);
  });

  it('keeps showing a map loaded by path, which its property then names', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.defineMap('maps/level1', LEVEL);
    world.defineMap('maps/level2', {
      actors: [{type: 'actors/coin', id: 'z'}],
    });
    window.set(ViewportMapProperty, 'maps/level1');
    world.tick(0);
    expect([...world.actors].map(actor => actor.id)).toContain('a');

    // The property named level1 when this ran. Were it left saying so, the
    // next tick would see a Viewport not showing what its property names
    // and load level1 back.
    world.loadMapInto(window, 'maps/level2');
    world.tick(16);
    world.tick(16);
    expect([...world.actors].map(actor => actor.id)).toEqual(['win', 'z']);
    expect(window.get(ViewportMapProperty)).toBe('maps/level2');

    // …and an unloaded Viewport names nothing, so naming level1 again is a
    // change, and loads it.
    world.unloadViewport(window);
    world.tick(16);
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);
    expect(window.get(ViewportMapProperty)).toBe('');
    window.set(ViewportMapProperty, 'maps/level1');
    world.tick(16);
    expect([...world.actors].map(actor => actor.id)).toContain('a');
  });

  it('refuses an actor that is no Viewport', () => {
    const world = makeWorld();
    const coin = world.addActor(Coin.instantiate('c', 'actors/coin'));
    expect(() => world.loadMapInto(coin, LEVEL)).toThrow(/not a Viewport/);
  });

  it('goes when the Viewport goes', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadMapInto(window, LEVEL);

    world.removeActor(window);

    expect([...world.actors]).toHaveLength(0);
    expect(world.spaces).toHaveLength(0);
  });
});

describe('the actor in hand', () => {
  it('is the handler’s subject: a spawn lands in its space', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadMapInto(window, LEVEL);
    inside.on(Ping, (w, actor) => {
      w.addActor(Coin, 'spawned');
      expect(w.mapBounds()).toEqual(new Vector(640, 320));
      expect(w.actorInHand()).toBe(actor);
    });

    world.emit(Ping, inside);
    world.tick(0);

    const spawned = [...world.actors].find(actor => actor.id === 'spawned')!;
    expect(spawned.space).toBe(world.viewportSpaceOf(window));
    expect(world.actorInHand()).toBeUndefined();
  });

  it('is the loop’s actor and the predicate’s candidate', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadMapInto(window, LEVEL);
    const outside = world.addActor(Coin.instantiate('out', 'actors/coin'));
    const seen: string[] = [];

    each([inside, outside], actor => {
      seen.push(`${actor.id}:${world.mapBounds().x}`);
    });
    const wide = [
      ...filtered([inside, outside], () => world.mapBounds().x > 400),
    ];

    expect(seen).toEqual(['a:640', 'out:320']);
    expect(wide).toEqual([inside]);
    world.enter(inside);
    expect(world.mapBounds().x).toBe(640);
    world.leave();
    expect(world.mapBounds().x).toBe(320);
  });

  it('keeps a near query inside one space', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [a] = world.loadMapInto(window, LEVEL);
    // A root coin at the same coordinates as the level's `a`.
    const twin = world.addActor(
      Coin.instantiate('twin', 'actors/coin').set(
        PositionProperty,
        new Vector(48, 48),
      ),
    );

    expect(world.actorsNear({x: 48, y: 48}, 10)).toEqual([twin]);
    expect(world.actorsNear({x: 48, y: 48}, 10, undefined, a)).toEqual([a]);
    expect(
      world.withActor(a, () => world.actorsNear({x: 48, y: 48}, 10)),
    ).toEqual([a]);
  });
});

describe('the mouse, through a Viewport', () => {
  it('is mapped into the space by the window’s corner and the camera', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    const [a] = world.loadMapInto(window, LEVEL); // camera on b: (320, 160)
    world.setPointer({x: 160, y: 130}, []); // 10 in from the corner

    expect(world.mousePosition()).toEqual(new Vector(160, 130));
    // Camera at (320,160) over a 100x80 window shows (270..370, 120..200).
    expect(world.mousePosition(a)).toEqual(new Vector(280, 130));
    expect(world.withActor(a, () => world.mousePosition())).toEqual(
      new Vector(280, 130),
    );
  });

  it('follows the window’s scale', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));
    window.set(ScaleProperty, new Vector(2, 2)); // 200x160 on screen
    const [a] = world.loadMapInto(window, LEVEL);
    expect(world.viewSize(a)).toEqual(new Vector(200, 160));
  });
});

describe('what the driver is told', () => {
  it('names each actor’s space, and describes each Viewport’s', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));
    world.loadMapInto(window, LEVEL);
    world.addActor(Coin.instantiate('root', 'actors/coin'));

    const spaces = world
      .renderSnapshot()
      .map(state => [state.actor.id, state.space]);
    expect(spaces).toEqual([
      ['win', undefined],
      ['a', 'main/win'],
      ['b', 'main/win'],
      ['c', 'main/win'],
      ['root', undefined],
    ]);
    expect(world.spaceSnapshot()).toEqual([
      {
        id: 'main/win',
        owner: 'win',
        camera: {x: 320, y: 160},
        view: {x: 100, y: 80},
        bounds: {x: 640, y: 320},
        // A map that names no layers has the one every world has.
        layers: [expect.objectContaining({id: 'main'})],
      },
    ]);
  });
});

describe('a map’s layers', () => {
  const LAYERED: WorldMap = {
    size: {width: 20, height: 10},
    tile: {width: 32, height: 32},
    layers: [
      {
        id: 'sky',
        name: 'Sky',
        parallax: {x: 0.2, y: 0},
        background: {sprite: 'sky.png', repeat: true, offset: {x: 4, y: 0}},
      },
      {id: 'main'},
      {id: 'fog', fit: true, foreground: {sprite: 'fog.png'}},
    ],
    actors: [
      {type: 'actors/coin', id: 'far', layer: 'sky'},
      {type: 'actors/coin', id: 'near'},
      {type: 'actors/coin', id: 'lost', layer: 'nowhere'},
    ],
  };

  it('become the space’s own when the map is loaded into a Viewport', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [far, near, lost] = world.loadMapInto(window, LAYERED);

    expect(far.layer).toBe('sky');
    expect(near.layer).toBe('main');
    // A layer the map does not have is the default, as a world's is.
    expect(lost.layer).toBe('main');
    const depths = world
      .renderSnapshot()
      .filter(state => state.space)
      .map(state => [state.actor.id, state.layer]);
    expect(depths).toEqual([
      ['far', 0],
      ['near', 1],
      ['lost', 1],
    ]);
    expect(world.spaceSnapshot()[0].layers).toEqual([
      {
        id: 'sky',
        parallax: {x: 0.2, y: 0},
        fit: false,
        background: expect.objectContaining({
          sprite: 'sky.png',
          repeat: true,
          offset: {x: 4, y: 0},
        }),
        foreground: expect.objectContaining({repeat: false}),
      },
      expect.objectContaining({id: 'main', parallax: {x: 1, y: 1}}),
      expect.objectContaining({
        id: 'fog',
        fit: true,
        foreground: expect.objectContaining({sprite: 'fog.png'}),
      }),
    ]);
  });

  it('puts the default at the back of a map that does not place it', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadMapInto(window, {layers: [{id: 'front'}], actors: []});
    expect(world.spaceSnapshot()[0].layers.map(layer => layer.id)).toEqual([
      'main',
      'front',
    ]);
  });

  it('resolve against the world’s layers when loaded into the root', () => {
    // A world's layer list is fixed when it is built, so a map loaded into
    // the root adds none; a placement naming one the world has lands on it.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    builder.defineLayer({id: 'sky'});
    const world = builder.getWorld();
    world.define('actors/coin', Coin);

    const [far, near, lost] = world.loadMap(LAYERED);

    expect(far.layer).toBe('sky');
    expect(near.layer).toBe('main');
    expect(lost.layer).toBe('main');
    expect(world.layers.map(layer => layer.id)).toEqual(['main', 'sky']);
  });

  it('start over when another map replaces the first', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadMapInto(window, LAYERED);
    world.loadMapInto(window, LEVEL);
    expect(world.spaceSnapshot()[0].layers.map(layer => layer.id)).toEqual([
      'main',
    ]);
  });
});

describe('the cameras a world has', () => {
  // A CAMERA RULE FINDS ITS SUBJECTS THROUGH `world.cameras`, and a Viewport's
  // camera was never in it: the collection wrapped the world's own list alone,
  // so following a subject had to be written a second time in the engine
  // (specs/SPACE_CAMERAS_PLAN.md). These are the claims that make the second
  // copy removable.

  it('includes a Viewport’s, which the collection could not see', () => {
    const world = makeWorld();
    expect([...world.cameras]).toHaveLength(1);

    placeWindow(world);
    const cameras = [...world.cameras];
    expect(cameras).toHaveLength(2);
    // The world's own first, then each space's — the order the collection
    // walks, so a world reading its cameras finds the familiar one first.
    expect(cameras[0].id).toBe('main');
    expect(cameras[1].id).toBe('win:main');
  });

  it('answers about the Viewports there are NOW, not when it was built', () => {
    // The collection is made once, in the constructor, and Viewports are placed
    // as a world runs. It holds a function for that reason.
    const world = makeWorld();
    const before = [...world.cameras].length;
    placeWindow(world);
    expect([...world.cameras].length).toBe(before + 1);
  });

  it('gives every space a main camera that is its own', () => {
    // A camera's position belongs to a space and means nothing in another, so a
    // Viewport showing a different scene cannot share the world's. Its main
    // camera starts at the middle of its own window, not of the world's view.
    const world = makeWorld();
    const win = placeWindow(world);
    const space = world.viewportSpaceOf(win)!;
    expect(space.cameras).toHaveLength(1);
    expect(space.camera).toBe(space.cameras[0]);
    expect(space.camera!.position).toEqual(new Vector(50, 40));
    expect(world.camera('main').position).not.toEqual(space.camera!.position);
  });

  it('leaves the root space’s cameras to the world', () => {
    // The root has none of its own: the world owns them directly, having no
    // placement to own them for it. `space.camera` is undefined there, and the
    // view is taken through the world's active camera as it always was.
    const world = makeWorld();
    const root = world.spaceOf(undefined);
    expect(root.cameras).toEqual([]);
    expect(root.camera).toBeUndefined();
    expect(world.activeCamera().id).toBe('main');
  });

  it('filters by trait across every space at once', () => {
    // What a camera rule actually calls. Nothing elects a camera trait on a
    // Viewport yet, so this asks the question the way a rule does and expects
    // the world's answer to be unchanged — the guard that step one is invisible.
    const world = makeWorld();
    placeWindow(world);
    expect(world.cameras.with(ViewportTrait)).toEqual([]);
  });
});

describe('what a camera step is told about its space', () => {
  // A CAMERA STEP RUNS WITH ITS CAMERA IN HAND — `world.enter(camera)`, from
  // the loop a camera-scoped trait step generates — and what the world is asked
  // without a subject is answered for the space the thing in hand is in. So a
  // camera that does not know its space is a camera whose `Confined to the Map`
  // would clamp against the wrong map (specs/SPACE_CAMERAS_PLAN.md).

  it('answers with the space’s bounds, not the world’s', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);

    const space = world.viewportSpaceOf(win)!;
    const camera = space.camera!;
    // The level is 20 by 10 tiles of 32 — the space grew to fit it — where the
    // root is still the default window.
    expect(world.mapBounds(camera)).toEqual(new Vector(640, 320));
    expect(world.mapBounds()).toEqual(new Vector(320, 320));
  });

  it('answers with the Viewport’s window, not the world’s view', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const camera = world.viewportSpaceOf(win)!.camera!;
    // The Window kind is 100 by 80; the world's view is the default.
    expect(world.viewSize(camera)).toEqual(new Vector(100, 80));
    expect(world.viewSize(camera)).not.toEqual(world.viewSize());
  });

  it('leaves the world’s own cameras looking at the root', () => {
    // They name no space, and `spaceOf` answers with the root for anything that
    // names none — so the world's cameras behave exactly as they always have.
    const world = makeWorld();
    placeWindow(world);
    const own = world.camera('main');
    expect(own.space).toBeUndefined();
    expect(world.mapBounds(own)).toEqual(world.mapBounds());
    expect(world.viewSize(own)).toEqual(world.viewSize());
  });

  it('gives a space’s camera the world a camera body reads', () => {
    // `const world = camera.world` is what a generated camera body binds. A
    // space's camera never had one set, so the first body to run on one would
    // have read undefined.
    const world = makeWorld();
    const win = placeWindow(world);
    expect(world.viewportSpaceOf(win)!.camera!.world).toBe(world);
  });
});
