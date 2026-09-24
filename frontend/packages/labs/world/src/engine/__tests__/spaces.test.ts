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
import {
  ViewportMapProperty,
  ViewportScrollProperty,
  ViewportShowsThroughProperty,
  ViewportTrait,
} from '../rules/viewport';

const Ping = new RuleBuilder({id: 'pinger', name: 'Pinger'}).addEvent('ping');

/**
 * A camera rule, in miniature: one trait and one step that aims the camera.
 *
 * The real ones are stock `.rule` files compiled from `scripts/rules/camera*`,
 * and what is being checked here is not their arithmetic but whether a
 * camera-scoped step reaches a SPACE's camera at all — so the step is the
 * smallest thing that shows it ran, and it asks the world the two questions
 * `Camera Confined to the Map` asks (specs/SPACE_CAMERAS_PLAN.md).
 */
const Aiming = new RuleBuilder({id: 'aiming', name: 'Aiming'});
const AimsAtTheCorner = Aiming.addTrait({
  id: 'aimsAtTheCorner',
  name: 'Aims at the Corner',
});
/** Where each camera the step ran for was told about, by camera id. */
const aimed = new Map<string, {map: Vector; view: Vector}>();
Aiming.addStepIn('aim at the corner', 'aim', world => {
  for (const camera of world.cameras.with(AimsAtTheCorner)) {
    world.withActor(camera, () => {
      // No argument, exactly as a generated camera body asks: what the world is
      // asked without a subject is answered for the space the thing in hand is
      // in.
      aimed.set(camera.id, {map: world.mapBounds(), view: world.viewSize()});
      camera.position = new Vector(0, 0);
    });
  }
});
const AimingRule = Aiming.build();
const Coin = new ActorBuilder({id: 'coin', name: 'Coin'}).set(
  IntrinsicSizeProperty,
  new Vector(16, 16),
);
/** A 100 by 80 window onto a map, placed with its middle at (200, 160). */
const Window = new ActorBuilder({id: 'window', name: 'Window'})
  .useTraits([ViewportTrait])
  .set(IntrinsicSizeProperty, new Vector(100, 80));

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([AimingRule])
    .instantiate();
  world.define('actors/coin', Coin);
  world.define('actors/window', Window);
  return world;
};

/** Three coins across a 20-by-10-tile level. */
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
  it('places the map in the Viewport’s space, sized', () => {
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
    // AND NOT FOLLOWING ANYTHING, which a map no longer says. Its camera is at
    // the middle of its own window, where a load puts it and where the
    // Viewport's `scroll` of zero keeps it (specs/SPACE_CAMERAS_PLAN.md).
    expect(space.camera!.position).toEqual(new Vector(50, 40));
    expect(world.viewSize(added[0])).toEqual(new Vector(100, 80));
  });

  it('keeps the camera inside the map as the Viewport scrolls it', () => {
    // WHAT THIS USED TO SAY was that the camera followed the actor a map named,
    // and that the engine clamped it. The following is gone — it is `Follows`
    // on a camera now, elected like anything else — and the clamping stays,
    // because a scroll view's `scroll` promises a reading of where it actually
    // stopped (specs/SCROLLING_PLAN.md).
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadMapInto(window, LEVEL);
    const space = world.viewportSpaceOf(window)!;

    window.set(ViewportScrollProperty, new Vector(0, 0));
    world.tick(0);
    expect(space.camera!.position).toEqual(new Vector(50, 40));

    // Past the end on both axes: a 640 by 320 level seen through 100 by 80
    // stops half a window from each far edge.
    window.set(ViewportScrollProperty, new Vector(900, 900));
    world.tick(0);
    expect(space.camera!.position).toEqual(new Vector(590, 280));
    // …and the clamped answer is what the project reads back.
    expect(window.get(ViewportScrollProperty)).toEqual(new Vector(540, 240));
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
    const [a] = world.loadMapInto(window, LEVEL);
    // The space's camera is where a load leaves it: the middle of its own
    // window, since a map no longer says what to follow and nothing has
    // scrolled it (specs/SPACE_CAMERAS_PLAN.md).
    window.set(ViewportScrollProperty, new Vector(270, 120));
    world.tick(0);
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
        // The middle of the window: a load leaves the camera there, and a map
        // no longer says to follow anything (specs/SPACE_CAMERAS_PLAN.md).
        camera: {x: 50, y: 40},
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

describe('declaring a camera against a space', () => {
  // A world declares cameras; a Viewport's space could not have any beyond the
  // main one it is made with. `define camera ⟨wide⟩ of ⟨the Minimap⟩` is what
  // this is the engine half of (specs/SPACE_CAMERAS_PLAN.md).

  it('puts a camera in the space that was named', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'wide', space: 'win'});

    const space = world.viewportSpaceOf(win)!;
    expect(space.cameras.map(camera => camera.name)).toEqual(['main', 'wide']);
    // The id carries the space so a list of every camera tells two `wide`s
    // apart; the NAME is what an author wrote.
    expect(space.cameraNamed('wide')!.id).toBe('win:wide');
    expect(space.cameraNamed('wide')!.space).toBe(space);
    // …and the world's own list is untouched by it.
    expect(world.camera('win:wide').id).toBe('main');
  });

  it('holds a camera declared before its Viewport is placed', () => {
    // The order a world actually runs in: the body's prologue declares, and the
    // main map places the Viewport afterwards
    // (specs/MAP_BEFORE_ROWS_PLAN.md). Refusing here would refuse silently.
    const world = makeWorld();
    world.defineCamera({id: 'wide', space: 'win'});
    expect([...world.cameras]).toHaveLength(1);

    const win = placeWindow(world);
    expect(
      world.viewportSpaceOf(win)!.cameras.map(camera => camera.name),
    ).toEqual(['main', 'wide']);
  });

  it('declares the same camera twice as once, so a reload cannot stack them', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'wide', space: 'win'});
    world.defineCamera({id: 'wide', space: 'win'});
    expect(world.viewportSpaceOf(win)!.cameras).toHaveLength(2);
  });

  it('keeps two spaces’ cameras apart, positions and all', () => {
    const world = makeWorld();
    const one = placeWindow(world);
    const two = world.addActor(Window.instantiate('win2', 'actors/window'));
    world.defineCamera({id: 'wide', space: 'win'});
    world.defineCamera({id: 'wide', space: 'win2'});

    const a = world.viewportSpaceOf(one)!.cameraNamed('wide')!;
    const b = world.viewportSpaceOf(two)!.cameraNamed('wide')!;
    expect(a).not.toBe(b);
    expect([a.id, b.id]).toEqual(['win:wide', 'win2:wide']);

    a.position = new Vector(7, 7);
    expect(b.position).toEqual(new Vector(50, 40));
  });

  it('starts a space’s camera in the middle of that space’s window', () => {
    // As the space's main camera does, and for the reason the world's rest in
    // the middle of the world's view.
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'wide', space: 'win'});
    expect(world.viewportSpaceOf(win)!.cameraNamed('wide')!.position).toEqual(
      new Vector(50, 40),
    );
  });

  it('still declares a world’s own camera exactly as before', () => {
    const world = makeWorld();
    world.defineCamera({id: 'wide'});
    expect(world.camera('wide').id).toBe('wide');
    expect(world.camera('wide').space).toBeUndefined();
  });
});

describe('which camera a Viewport shows through', () => {
  // A PROPERTY, because a Viewport is a placement: a field in the inspector and
  // a `set` block come with it, so cutting to another camera is an ordinary set
  // (specs/SPACE_CAMERAS_PLAN.md). The world has `setActiveCamera` instead, for
  // want of a placement to hang a field on.

  it('is its main camera when it says nothing', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const space = world.viewportSpaceOf(win)!;
    expect(win.get(ViewportShowsThroughProperty)).toBe('');
    expect(space.camera).toBe(space.cameraNamed('main'));
  });

  it('cuts to another camera on the next tick, and back', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'chase', space: 'win'});
    const space = world.viewportSpaceOf(win)!;

    win.set(ViewportShowsThroughProperty, 'chase');
    world.tick(0);
    expect(space.camera).toBe(space.cameraNamed('chase'));

    // …and back, which is the whole point of it being a value rather than
    // structure: switching moves a transform and rebuilds nothing.
    win.set(ViewportShowsThroughProperty, '');
    world.tick(0);
    expect(space.camera).toBe(space.cameraNamed('main'));
  });

  it('shows through its main camera for a name no camera has', () => {
    // The name arrives from a field or from generated code, so an unknown one is
    // the default rather than a black screen — the answer `World.camera` already
    // gives for an unknown id.
    const world = makeWorld();
    const win = placeWindow(world);
    const space = world.viewportSpaceOf(win)!;

    win.set(ViewportShowsThroughProperty, 'nothing by that name');
    world.tick(0);
    expect(space.camera).toBe(space.cameraNamed('main'));
  });

  it('keeps two Viewports’ choices apart', () => {
    const world = makeWorld();
    const one = placeWindow(world);
    const two = world.addActor(Window.instantiate('win2', 'actors/window'));
    world.defineCamera({id: 'chase', space: 'win'});
    world.defineCamera({id: 'chase', space: 'win2'});

    one.set(ViewportShowsThroughProperty, 'chase');
    world.tick(0);
    expect(world.viewportSpaceOf(one)!.camera!.id).toBe('win:chase');
    expect(world.viewportSpaceOf(two)!.camera!.id).toBe('win2:main');
  });
});

describe('a camera trait, on a space’s camera', () => {
  // WHERE THE PLAN STOPS BEING INVISIBLE. A camera rule's step walks
  // `world.cameras.with(trait)`, and a Viewport's camera is in that collection
  // now — so following, easing, leading and confining reach a Viewport's camera
  // by being elected rather than by being written a second time in the engine
  // (specs/SPACE_CAMERAS_PLAN.md).

  it('runs for a camera a space owns, not only the world’s', () => {
    const world = makeWorld();
    placeWindow(world);
    world.defineCamera({id: 'corner', space: 'win', traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect([...aimed.keys()]).toEqual(['win:corner']);
  });

  it('asks the world about ITS space while it runs', () => {
    // The whole of why a camera knows its space. A step that asks `map size`
    // with no subject gets the space's bounds and the Viewport's window, which
    // is what `Confined to the Map` needs to mean something here.
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    world.defineCamera({id: 'corner', space: 'win', traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect(aimed.get('win:corner')).toEqual({
      map: new Vector(640, 320),
      view: new Vector(100, 80),
    });
  });

  it('leaves the world’s own cameras asking about the world', () => {
    const world = makeWorld();
    placeWindow(world);
    world.defineCamera({id: 'corner', traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect(aimed.get('corner')).toEqual({
      map: new Vector(320, 320),
      view: world.viewSize(),
    });
  });

  it('runs for both at once, each about its own space', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    world.defineCamera({id: 'corner', traits: [AimsAtTheCorner]});
    world.defineCamera({id: 'corner', space: 'win', traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect([...aimed.keys()].sort()).toEqual(['corner', 'win:corner']);
    expect(aimed.get('corner')!.map).not.toEqual(aimed.get('win:corner')!.map);
  });
});

describe('what the engine does to a camera a trait has aimed', () => {
  it('leaves where the trait put it', () => {
    // THE CLAIM STEP 6 IS FOR. The trait aims the camera in the `aim` phase; the
    // engine's own follow-and-clamp runs at the end of the tick and writes the
    // camera position from the map's `camera.follows` or the Viewport's scroll.
    // Two things writing one value, and the later one wins — so a Viewport's
    // camera cannot be aimed by a rule while that branch exists
    // (specs/SPACE_CAMERAS_PLAN.md).
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    world.defineCamera({id: 'corner', space: 'win', traits: [AimsAtTheCorner]});
    win.set(ViewportShowsThroughProperty, 'corner');

    world.tick(0);
    const camera = world.viewportSpaceOf(win)!.cameraNamed('corner')!;
    // EXACTLY WHERE THE STEP PUT IT, and not clamped. This trait does not elect
    // `Confined to the Map`, so nothing confines it — which is how the world's
    // cameras have always behaved, and is the difference between the engine
    // helping and the engine overruling.
    expect(camera.position).toEqual(new Vector(0, 0));
  });

  it('still scrolls a camera that elects nothing, and clamps that', () => {
    // The other half of the same rule. A camera with no traits is the
    // Viewport's to scroll, because a scroll view is the Viewport deciding
    // about the scene it shows — and `scroll` promises a reading of where it
    // actually stopped, so that path clamps (specs/SCROLLING_PLAN.md).
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);

    win.set(ViewportScrollProperty, new Vector(900, 900));
    world.tick(0);
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      new Vector(590, 280),
    );
  });
});

describe('what a camera that elects nothing looks at', () => {
  // THE TOP LEFT OF WHAT IT SHOWS, in every space alike — and it already did.
  // specs/SPACE_CAMERAS_PLAN.md proposed changing the default to this and was
  // describing the existing behaviour by mistake: a camera's position is the
  // MIDDLE of the view, so one resting half a view in frames the first
  // screenful from the corner. Nothing asserted it, which is how the plan came
  // to argue with it, so these are the assertions.

  /** Where the top-left corner of the view sits, given a camera and a window. */
  const shows = (at: Vector, view: Vector) =>
    new Vector(at.x - view.x / 2, at.y - view.y / 2);

  it('is the corner of the world, for the world’s own camera', () => {
    const world = makeWorld();
    expect(shows(world.activeCamera().position, world.viewSize())).toEqual(
      new Vector(0, 0),
    );
  });

  it('stays the corner when the world says how wide it is', () => {
    // `set size of view` sweeps a camera that is still where it was declared,
    // so the framing survives a resize rather than jumping a quarter of a level.
    const world = makeWorld();
    world.setViewSize(26, 16);
    expect(shows(world.activeCamera().position, world.viewSize())).toEqual(
      new Vector(0, 0),
    );
  });

  it('is the corner of the space, for a Viewport’s camera', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    const camera = world.viewportSpaceOf(win)!.camera!;
    expect(shows(camera.position, world.viewSize(camera))).toEqual(
      new Vector(0, 0),
    );
  });

  it('is still the corner after a tick, which is what settles a space', () => {
    // A scroll of nothing is the corner, and that is what the engine writes when
    // a camera elects nothing (specs/SPACE_CAMERAS_PLAN.md step 6).
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    world.tick(0);
    const camera = world.viewportSpaceOf(win)!.camera!;
    expect(shows(camera.position, world.viewSize(camera))).toEqual(
      new Vector(0, 0),
    );
  });
});
