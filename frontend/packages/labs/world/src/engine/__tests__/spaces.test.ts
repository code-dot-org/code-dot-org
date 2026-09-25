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
import {each, filtered, inThisSpace, one} from '../core/actorValue';
import {Vector} from '../core/Vector';
import type {World, WorldMap} from '../core/World';
import {
  IntrinsicSizeProperty,
  PositionProperty,
  ScaleProperty,
} from '../rules/spatial';
import {
  ViewportMapProperty,
  ViewportMirrorsProperty,
  ViewportMirrorsTheWorldProperty,
  ViewportScrollProperty,
  ViewportShowsMapEvent,
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
/** `Follows` in miniature: aim at the first coin IN THIS SPACE, else stay. */
const FollowsACoin = Aiming.addTrait({
  id: 'followsACoin',
  name: 'Follows a Coin',
});
Aiming.addStepIn('follow a coin', 'aim', world => {
  for (const camera of world.cameras.with(FollowsACoin)) {
    world.withActor(camera, () => {
      const found = [...inThisSpace(world, world.actors.ofType('actors/coin'))];
      if (found.length) {
        const at = one(found).get(PositionProperty) as Vector;
        const offset = Number(camera.get(Offset) ?? 0);
        camera.position = new Vector(at.x + offset, at.y);
      }
    });
  }
});
/** …and one with a property, to watch it lent from the Viewport to its camera. */
const Offset = FollowsACoin.addProperty('followsCoinOffset', 'number', 0);
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
        // A box holding a level of its own, not a mirror of any scene
        // (specs/MIRRORING_PLAN.md).
        mirrors: undefined,
        mirrorsRoot: false,
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
    world.defineCamera({id: 'wide', viewport: 'win'});

    const space = world.viewportSpaceOf(win)!;
    expect(space.cameras.map(camera => camera.name)).toEqual(['main', 'wide']);
    // The id carries the space so a list of every camera tells two `wide`s
    // apart; the NAME is what an author wrote.
    expect(space.cameraNamed('wide')!.id).toBe('win:wide');
    expect(space.cameraNamed('wide')!.space).toBe(space);
    // …and the world's own list is untouched by it: `wide` is in no world list,
    // and `World.camera` finds it only by looking through the spaces, which is
    // what binds `camera` inside a `define camera ⟨…⟩ of ⟨…⟩` mouth.
    expect(world.cameras.with(ViewportTrait)).toEqual([]);
    expect(world.camera('wide').id).toBe('win:wide');
    expect(world.camera('nothing by that name').id).toBe('main');
  });

  it('refuses a camera for something that is not a Viewport, loudly', () => {
    // AN EARLIER VERSION HELD IT, forever and in silence, so that a world's
    // prologue could declare a camera before the main map placed its Viewports.
    // The place to declare a Viewport's camera is that Viewport's own `on
    // create`, where it exists and `this actor` is it — so there is nothing to
    // wait for, and a name that resolves to no Viewport is a mistake to say out
    // loud (specs/SPACE_CAMERAS_PLAN.md).
    const world = makeWorld();
    expect(() => world.defineCamera({id: 'wide', viewport: 'win'})).toThrow(
      /not a Viewport/,
    );
    // …and by ACTOR too, which is what the block passes.
    const coin = world.addActor(Coin.instantiate('c1', 'actors/coin'));
    expect(() => world.defineCamera({id: 'wide', viewport: coin})).toThrow(
      /not a Viewport/,
    );
    expect([...world.cameras]).toHaveLength(1);
  });

  it('takes the Viewport itself, which is what `this actor` gives it', () => {
    // The shape the block generates: `define camera ⟨wide⟩ for ⟨this actor⟩` in
    // a Viewport placement's `on create`.
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'wide', viewport: win});
    expect(
      world.viewportSpaceOf(win)!.cameras.map(camera => camera.name),
    ).toEqual(['main', 'wide']);
  });

  it('declares the same camera twice as once, so a reload cannot stack them', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'wide', viewport: 'win'});
    world.defineCamera({id: 'wide', viewport: 'win'});
    expect(world.viewportSpaceOf(win)!.cameras).toHaveLength(2);
  });

  it('keeps two spaces’ cameras apart, positions and all', () => {
    const world = makeWorld();
    const one = placeWindow(world);
    const two = world.addActor(Window.instantiate('win2', 'actors/window'));
    world.defineCamera({id: 'wide', viewport: 'win'});
    world.defineCamera({id: 'wide', viewport: 'win2'});

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
    world.defineCamera({id: 'wide', viewport: 'win'});
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
    world.defineCamera({id: 'chase', viewport: 'win'});
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

  it('is what `look through camera` sets, for a Viewport’s camera too', () => {
    // The block generates `world.setActiveCamera(id)`, which used to search
    // the world's own list alone and refuse a Viewport's camera in silence —
    // so a box told to look through its chase camera kept looking through
    // its main one. Found by the declared id, as `camera()` finds it, and
    // written to `shows through` so the tick does not undo it.
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineCamera({id: 'chase', viewport: win});
    const space = world.viewportSpaceOf(win)!;

    world.setActiveCamera('chase');
    expect(space.camera).toBe(space.cameraNamed('chase'));
    expect(win.get(ViewportShowsThroughProperty)).toBe('chase');
    world.tick(0);
    expect(space.camera).toBe(space.cameraNamed('chase'));
    // …and the world's own view is untouched by it.
    expect(world.activeCamera().id).toBe('main');

    // An id nothing has still leaves every view where it was.
    world.setActiveCamera('nothing by that name');
    expect(space.camera).toBe(space.cameraNamed('chase'));
    expect(world.activeCamera().id).toBe('main');
  });

  it('keeps two Viewports’ choices apart', () => {
    const world = makeWorld();
    const one = placeWindow(world);
    const two = world.addActor(Window.instantiate('win2', 'actors/window'));
    world.defineCamera({id: 'chase', viewport: 'win'});
    world.defineCamera({id: 'chase', viewport: 'win2'});

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
    world.defineCamera({
      id: 'corner',
      viewport: 'win',
      traits: [AimsAtTheCorner],
    });
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
    world.defineCamera({
      id: 'corner',
      viewport: 'win',
      traits: [AimsAtTheCorner],
    });
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
    world.defineCamera({
      id: 'corner',
      viewport: 'win',
      traits: [AimsAtTheCorner],
    });
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
    world.defineCamera({
      id: 'corner',
      viewport: 'win',
      traits: [AimsAtTheCorner],
    });
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

describe('following, from a camera in a Viewport', () => {
  // The scenario that found the gap: the same level loaded in the main world
  // AND in a Viewport, and the Viewport's camera told to follow `any ⟨Pilot⟩`.
  // Every Pilot is in every space, and the first is the root's
  // (specs/SPACE_CAMERAS_PLAN.md).

  it('follows the coin in ITS space, while the world’s camera follows the root’s', () => {
    const world = makeWorld();
    const rootCoin = world.addActor(Coin.instantiate('rc', 'actors/coin'));
    rootCoin.set(PositionProperty, new Vector(11, 12));
    const win = placeWindow(world);
    const [held] = world.loadMapInto(win, {
      actors: [
        {
          type: 'actors/coin',
          id: 'hc',
          properties: {positional: {position: {x: 300, y: 200}}},
        },
      ],
    });
    world.defineCamera({id: 'chase', traits: [FollowsACoin]});
    world.defineCamera({id: 'chase', viewport: win, traits: [FollowsACoin]});
    win.set(ViewportShowsThroughProperty, 'chase');

    world.tick(0);
    expect(world.camera('chase').position).toEqual(new Vector(11, 12));
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      held.get(PositionProperty),
    );
  });

  it('stays where it is when nothing of the kind is in its space', () => {
    const world = makeWorld();
    world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const win = placeWindow(world);
    world.defineCamera({id: 'chase', viewport: win, traits: [FollowsACoin]});
    win.set(ViewportShowsThroughProperty, 'chase');
    const before = world.viewportSpaceOf(win)!.camera!.position;

    world.tick(0);
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(before);
  });
});

describe('when a Viewport shows a map', () => {
  // THE MOMENT ITS CAMERA CAN BE AIMED. `set actor to follow` in `on create`
  // runs before the map has loaded and stores a snapshot, so it freezes to the
  // root's Pilots or to nobody. This is the hat for the moment the map lands
  // (specs/SPACE_CAMERAS_PLAN.md, step 12).

  it('is raised for a load by value, once the actors are there', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const heard: Array<{value: unknown; coins: number}> = [];
    win.on(ViewportShowsMapEvent, (w, actor, value) => {
      const camera = w.viewportSpaceOf(actor)!.camera!;
      heard.push({
        value,
        // Asked with the Viewport's camera in hand, as a camera step would: the
        // map's actors are in its space by the time this runs.
        coins: w.withActor(
          camera,
          () => [...inThisSpace(w, w.actors.ofType('actors/coin'))].length,
        ),
      });
    });

    world.loadMapInto(win, LEVEL);
    expect(heard).toEqual([]);
    world.tick(0);
    expect(heard).toEqual([{value: '', coins: 3}]);
  });

  it('is raised for a load by path, carrying the path', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineMap('maps/level1', LEVEL);
    const values: unknown[] = [];
    win.on(ViewportShowsMapEvent, (_w, _actor, value) => values.push(value));

    win.set(ViewportMapProperty, 'maps/level1');
    world.tick(0);
    world.tick(0);
    expect(values).toEqual(['maps/level1']);
  });

  it('is not raised for an unload, nor for a path that names no map', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const values: unknown[] = [];
    win.on(ViewportShowsMapEvent, (_w, _actor, value) => values.push(value));

    world.loadMapInto(win, LEVEL);
    world.tick(0);
    world.unloadViewport(win);
    world.tick(0);
    world.loadMapInto(win, 'maps/missing');
    world.tick(0);
    expect(values).toEqual(['']);
  });

  it('lets a handler aim the camera at what the map brought', () => {
    // The Jetpack setup: the same level in the main world and in a Viewport,
    // and the Viewport told to follow a coin. In `on create` the snapshot is
    // the root's coin; here it is the Viewport's own.
    const world = makeWorld();
    const rootCoin = world.addActor(Coin.instantiate('rc', 'actors/coin'));
    rootCoin.set(PositionProperty, new Vector(11, 12));
    const win = placeWindow(world);
    world.defineCamera({id: 'chase', viewport: win, traits: [FollowsACoin]});
    win.set(ViewportShowsThroughProperty, 'chase');
    win.on(ViewportShowsMapEvent, () => undefined);

    world.loadMapInto(win, LEVEL);
    world.tick(0);
    const held = [...world.actors].find(actor => actor.id === 'a')!;
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      held.get(PositionProperty),
    );
  });
});

describe('a Viewport onto the world’s own scene', () => {
  // A MIRROR: the Viewport's `map` names the world, and it is bound to the
  // root space rather than loading a copy — so a minimap shows the one game
  // there is (specs/MIRRORING_PLAN.md, step 1).
  const mirror = (world: ReturnType<typeof makeWorld>) => {
    const win = placeWindow(world);
    win.set(ViewportMirrorsTheWorldProperty, true);
    world.tick(0);
    return win;
  };

  it('holds no copy, and sees the root’s actors through its camera', () => {
    const world = makeWorld();
    const rootCoin = world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const win = mirror(world);
    const space = world.viewportSpaceOf(win)!;

    expect(space.mirrors).toBe(true);
    expect(space.loads).toEqual([]);
    expect([...world.actors].map(actor => actor.id)).toEqual(['rc', 'win']);
    // With its camera in hand, "this space" is the root.
    expect(
      world.withActor(space.camera!, () => [
        ...inThisSpace(world, world.actors.ofType('actors/coin')),
      ]),
    ).toEqual([rootCoin]);
  });

  it('measures the map by the root and the view by its own window', () => {
    const world = makeWorld();
    world.setViewSize(26, 16);
    const win = mirror(world);
    const camera = world.viewportSpaceOf(win)!.camera!;
    expect(world.mapBounds(camera)).toEqual(world.mapBounds());
    expect(world.viewSize(camera)).toEqual(new Vector(100, 80));
    expect(world.viewSize(camera)).not.toEqual(world.viewSize());
  });

  it('keeps its bounds the root’s as the root grows', () => {
    const world = makeWorld();
    const win = mirror(world);
    world.loadMap(LEVEL);
    world.tick(0);
    expect(world.viewportSpaceOf(win)!.bounds).toEqual(world.mapBounds());
  });

  it('stops mirroring when told to, and shows the map it names', () => {
    const world = makeWorld();
    world.defineMap('maps/level1', LEVEL);
    const win = mirror(world);
    const space = world.viewportSpaceOf(win)!;

    // The map is what it WOULD show; while it mirrors, it does not.
    win.set(ViewportMapProperty, 'maps/level1');
    world.tick(0);
    expect(space.mirrors).toBe(true);
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);

    win.set(ViewportMirrorsTheWorldProperty, false);
    world.tick(0);
    expect(space.mirrors).toBe(false);
    expect(space.camera!.space).toBe(space);
    expect([...world.actors].map(actor => actor.id)).toEqual([
      'win',
      'a',
      'b',
      'c',
    ]);

    win.set(ViewportMirrorsTheWorldProperty, true);
    world.tick(0);
    expect(space.mirrors).toBe(true);
    expect(space.camera!.space).toBe(world.spaceOf(undefined));
    // The copy went with the level.
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);
  });

  it('leaves the root alone when unloaded', () => {
    const world = makeWorld();
    world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const win = mirror(world);
    world.unloadViewport(win);
    expect(world.viewportSpaceOf(win)!.mirrors).toBe(false);
    expect([...world.actors].map(actor => actor.id)).toEqual(['rc', 'win']);
  });

  it('tells the driver which scene, by its space’s id, and no layers', () => {
    // No layers of its own: what it shows is the target's scene through the
    // target's containers, and a second set of backdrops inside the box would
    // be drawn over the first.
    const world = makeWorld();
    const win = mirror(world);
    expect(world.spaceSnapshot()).toEqual([
      expect.objectContaining({
        owner: win.id,
        mirrors: 'main',
        mirrorsRoot: true,
        layers: [],
      }),
    ]);
  });

  it('is still a box for a level, which still gets a copy', () => {
    const world = makeWorld();
    world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const win = placeWindow(world);
    world.loadMapInto(win, LEVEL);
    expect(world.viewportSpaceOf(win)!.mirrors).toBe(false);
    expect([...world.actors]).toHaveLength(5);
  });
});

describe('the mouse, through a mirror', () => {
  // Two cameras look at the root now: the world's over the whole view, and a
  // mirror's over its own rectangle. A pointer inside that rectangle is a
  // pointer on the world THROUGH the mirror, which is what hit-testing asks
  // one candidate at a time (specs/MIRRORING_PLAN.md, step 3).
  const mirrored = () => {
    const world = makeWorld();
    const coin = world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const win = placeWindow(world);
    win.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    win.set(ViewportMirrorsTheWorldProperty, true);
    world.tick(0);
    // The mirror looks somewhere the world's camera does not.
    const camera = world.viewportSpaceOf(win)!.camera!;
    camera.position = new Vector(500, 300);
    return {world, coin, win, camera};
  };

  it('maps a root actor’s pointer through the mirror when it is over the box', () => {
    const {world, coin} = mirrored();
    world.setPointer({x: 160, y: 130}, []); // 10 in from the box's corner
    // Camera at (500,300) over a 100x80 window shows (450..550, 260..340).
    expect(world.mousePosition(coin)).toEqual(new Vector(460, 270));
    expect(world.withActor(coin, () => world.mousePosition())).toEqual(
      new Vector(460, 270),
    );
  });

  it('maps it through the world’s camera when it is not', () => {
    const {world, coin} = mirrored();
    world.setPointer({x: 20, y: 20}, []);
    expect(world.mousePosition(coin)).toEqual(new Vector(20, 20));
  });

  it('asks a mirror’s own camera through its window, wherever the pointer is', () => {
    const {world, camera} = mirrored();
    world.setPointer({x: 20, y: 20}, []); // outside the box
    // (20,20) is 130 left and 100 up of the box's corner (150,120).
    expect(world.mousePosition(camera)).toEqual(new Vector(320, 160));
  });

  it('prefers the topmost mirror where two overlap', () => {
    const {world, coin} = mirrored();
    const above = world.addActor(Window.instantiate('win2', 'actors/window'));
    above.set(PositionProperty, new Vector(200, 160));
    above.set(ViewportMirrorsTheWorldProperty, true);
    world.tick(0);
    world.viewportSpaceOf(above)!.camera!.position = new Vector(900, 900);
    world.setPointer({x: 160, y: 130}, []);
    expect(world.mousePosition(coin)).toEqual(new Vector(860, 870));
  });

  it('leaves a box holding a level as it was', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    win.set(PositionProperty, new Vector(200, 160));
    const [a] = world.loadMapInto(win, LEVEL);
    world.setPointer({x: 160, y: 130}, []);
    // Its camera at the middle of its window, (50,40): the corner is (0,0).
    expect(world.mousePosition(a)).toEqual(new Vector(10, 10));
  });
});

describe('a Viewport onto another Viewport’s scene', () => {
  // WHY NOT ONLY THE WORLD: the app progression puts the game itself in a box
  // on a menu screen, so a minimap of that game has to mirror the box, not
  // the world, whose root holds the menu (specs/MIRRORING_PLAN.md).
  const boxed = () => {
    const world = makeWorld();
    world.addActor(Coin.instantiate('rc', 'actors/coin'));
    const game = placeWindow(world);
    const [held] = world.loadMapInto(game, LEVEL);
    const minimap = world.addActor(Window.instantiate('mini', 'actors/window'));
    minimap.set(ViewportMirrorsProperty, [game]);
    world.tick(0);
    return {world, game, held, minimap};
  };

  it('shows the box’s scene: its space, its actors, its bounds', () => {
    const {world, game, held, minimap} = boxed();
    const mine = world.viewportSpaceOf(minimap)!;
    const theirs = world.viewportSpaceOf(game)!;
    expect(mine.mirrorOf).toBe(theirs);
    expect(mine.bounds).toEqual(theirs.bounds);
    expect(
      world.withActor(mine.camera!, () => [
        ...inThisSpace(world, world.actors.ofType('actors/coin')),
      ])[0],
    ).toBe(held);
    expect(world.spaceSnapshot()).toEqual([
      expect.objectContaining({owner: 'win', mirrors: undefined}),
      expect.objectContaining({owner: 'mini', mirrors: theirs.id}),
    ]);
  });

  it('routes a pointer over the minimap into the box’s scene', () => {
    const {world, held, minimap} = boxed();
    minimap.set(PositionProperty, new Vector(200, 160)); // corner (150,120)
    world.viewportSpaceOf(minimap)!.camera!.position = new Vector(500, 300);
    world.setPointer({x: 160, y: 130}, []);
    expect(world.mousePosition(held)).toEqual(new Vector(460, 270));
  });

  it('follows a chain to its end, and shows nothing for a cycle', () => {
    const {world, game, minimap} = boxed();
    const third = world.addActor(Window.instantiate('third', 'actors/window'));
    third.set(ViewportMirrorsProperty, [minimap]);
    world.tick(0);
    expect(world.viewportSpaceOf(third)!.mirrorOf).toBe(
      world.viewportSpaceOf(game),
    );

    // A cycle: the game now mirrors the third, which mirrors the minimap,
    // which mirrors the game. None of them shows anything.
    game.set(ViewportMirrorsProperty, [third]);
    world.tick(0);
    for (const each of [game, minimap, third]) {
      expect(world.viewportSpaceOf(each)!.mirrors).toBe(false);
    }
  });

  it('prefers the Viewport it names over the world when both are set', () => {
    const {world, game, minimap} = boxed();
    minimap.set(ViewportMirrorsTheWorldProperty, true);
    world.tick(0);
    expect(world.viewportSpaceOf(minimap)!.mirrorOf).toBe(
      world.viewportSpaceOf(game),
    );
  });
});

describe('a Viewport that elects a camera trait', () => {
  // THE SIMPLE CASE MADE SIMPLE. A Viewport wants to follow something, and the
  // way to say so was: declare a camera for it, give that camera the trait,
  // set the trait's property on it, and look through it. Four blocks, two of
  // them ceremony. A kind that shows a map may elect the camera trait itself;
  // it goes to the space's main camera, and the property is the Viewport's —
  // a field in its inspector (specs/SPACE_CAMERAS_PLAN.md, "simplifying").
  const Follower = new ActorBuilder({id: 'follower', name: 'Follower'})
    .useTraits([ViewportTrait])
    .useCameraTraits([FollowsACoin])
    .set(IntrinsicSizeProperty, new Vector(100, 80));
  const built = () => {
    const world = makeWorld();
    world.define('actors/follower', Follower);
    const win = world.addActor(Follower.instantiate('f1', 'actors/follower'));
    world.loadMapInto(win, LEVEL);
    return {world, win};
  };

  it('gives the trait to its main camera, and the camera follows', () => {
    const {world, win} = built();
    const space = world.viewportSpaceOf(win)!;
    expect(space.cameras.map(camera => camera.name)).toEqual(['main']);
    expect(space.camera!.has(FollowsACoin)).toBe(true);

    world.tick(0);
    const held = [...world.actors].find(actor => actor.id === 'a')!;
    expect(space.camera!.position).toEqual(held.get(PositionProperty));
  });

  it('lends the trait’s properties from the Viewport to the camera each tick', () => {
    // Set on the ACTOR, which is what the inspector writes and what
    // `set … of ⟨this actor⟩` does; read by the rule off the camera.
    const {world, win} = built();
    win.set(Offset, 7);
    world.tick(0);
    const held = [...world.actors].find(actor => actor.id === 'a')!;
    const at = held.get(PositionProperty) as Vector;
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      new Vector(at.x + 7, at.y),
    );
  });

  it('holds the trait itself too, so the property has a slot', () => {
    const {win} = built();
    expect(win.has(FollowsACoin)).toBe(true);
    expect(win.get(Offset)).toBe(0);
  });
});
