// Spaces: the root, the World, and what a Viewport owns
// (specs/ONE_WORLD_PLAN.md; `core/Space`, `rules/viewport`).
//
// The claims pinned here: an actor is in one space; a Viewport gets one of
// its own, which is its camera and window onto the World; what the world is
// asked without an actor is answered for the actor in hand's space; a map a
// Viewport is given lands in the World, with each Viewport's camera inside
// it; and a Viewport removed leaves the World as it was.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {Actor} from '../core/Actor';
import {each, filtered, inThisSpace, one} from '../core/actorValue';
import {Vector} from '../core/Vector';
import type {World, WorldMap} from '../core/World';
import {
  IntrinsicSizeProperty,
  PositionProperty,
  ScaleProperty,
} from '../rules/spatial';
import {ViewportShowsMapEvent, ViewportTrait} from '../rules/viewport';

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

/** A coin placed on the screen, where a world block never puts one. */
const onScreen = (world: World, id: string, at?: Vector) =>
  world.loadScreen({
    actors: [
      {
        type: 'actors/coin',
        id,
        ...(at
          ? {properties: {positional: {position: {x: at.x, y: at.y}}}}
          : {}),
      },
    ],
  })[0];

/** The World a Viewport shows, which is where its maps are loaded. */
const levelOf = (world: World, window: Actor) =>
  world.viewportSpaceOf(window)!.mirrorOf!;

describe('an actor is in one space', () => {
  it('is in the World by default, and a Viewport owns one of its own', () => {
    const world = makeWorld();
    const coin = world.addActor(Coin.instantiate('c', 'actors/coin'));
    const window = placeWindow(world);

    expect(world.spaceOf(coin).id).toBe('world');
    expect(world.spaceOf(window).id).toBe('main');
    const space = world.viewportSpaceOf(window)!;
    expect(space.owner).toBe(window);
    expect(space.id).toBe('main/win');
    expect(world.spaces).toEqual([space]);
    expect(space.mirrorOf!.id).toBe('world');
    // As big as the window until a map says otherwise; camera at its middle.
    expect(space.bounds).toEqual(new Vector(100, 80));
    expect(space.camera!.position).toEqual(new Vector(50, 40));
  });

  it('takes its parent’s space when it is given a parent', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadWorldMap(LEVEL);
    const child = onScreen(world, 'child');
    expect(world.spaceOf(child).id).toBe('main');

    child.setParent(inside);

    expect(world.spaceOf(child)).toBe(levelOf(world, window));
  });
});

describe('loading into a Viewport', () => {
  it('places the map in the World, sized', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));

    const added = world.loadWorldMap(LEVEL);
    const space = world.viewportSpaceOf(window)!;

    expect(added.map(actor => actor.id)).toEqual(['a', 'b', 'c']);
    expect(added.every(actor => actor.space === levelOf(world, window))).toBe(
      true,
    );
    // The level's positions are the level's, whatever the window's.
    expect(added[1].get(PositionProperty)).toEqual(new Vector(320, 160));
    expect(space.bounds).toEqual(new Vector(640, 320));
    expect(world.mapBounds(added[0])).toEqual(new Vector(640, 320));
    // …which is what is asked with nothing in hand: the World's.
    expect(world.mapBounds()).toEqual(new Vector(640, 320));
    // AND NOT FOLLOWING ANYTHING, which a map no longer says. Its camera is at
    // the middle of its own window, where a load puts it and where the
    // Viewport's `scroll` of zero keeps it (specs/SPACE_CAMERAS_PLAN.md).
    expect(space.camera!.position).toEqual(new Vector(50, 40));
    expect(world.viewSize(added[0])).toEqual(new Vector(100, 80));
  });

  it('replaces what the World held, and can be emptied', () => {
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap(LEVEL);
    world.loadWorldMap({actors: [{type: 'actors/coin', id: 'd'}]});
    expect([...world.actors].map(actor => actor.id)).toEqual(['win', 'd']);

    world.loadWorldMap({actors: []});
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);
  });

  it('loads by the path a map was registered under, or nothing', () => {
    const world = makeWorld();
    placeWindow(world);
    world.defineMap('maps/level1', LEVEL);

    expect(world.loadWorldMap('maps/level1')).toHaveLength(3);
    expect(world.loadWorldMap('maps/missing')).toEqual([]);
    expect([...world.actors]).toHaveLength(1);
  });

  it('loads the map the World starts with, by path, before the screen', () => {
    // What a Main Screen's module does: the World's map, then the screen's
    // placements, so a Viewport placed after it shows it at once
    // (specs/ONE_WORLD_PLAN.md).
    const world = makeWorld();
    world.defineMap('maps/level1', LEVEL);
    world.loadWorldMap('maps/level1');
    const window = placeWindow(world);
    expect([...world.actors].map(actor => actor.id)).toEqual([
      'a',
      'b',
      'c',
      'win',
    ]);
    expect(world.viewportSpaceOf(window)!.bounds).toEqual(new Vector(640, 320));
    expect(world.loadWorldMap('maps/missing')).toEqual([]);
    expect([...world.actors].map(actor => actor.id)).toEqual(['win']);
  });

  it('puts a Viewport added by code on the screen, and anything else in the World', () => {
    // A Viewport in the World would be a window onto the thing it is in.
    const world = makeWorld();
    const window = placeWindow(world);
    const coin = world.addActor(Coin.instantiate('c', 'actors/coin'));
    expect(world.spaceOf(window).id).toBe('main');
    expect(world.spaceOf(coin).id).toBe('world');
  });

  it('stays when the Viewport goes, which was a window onto it', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadWorldMap(LEVEL);

    world.removeActor(window);

    expect([...world.actors].map(actor => actor.id)).toEqual(['a', 'b', 'c']);
    expect(world.spaces).toHaveLength(0);
  });

  it('is one World for every Viewport, so a second shows the first’s map', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadWorldMap(LEVEL);
    const second = world.addActor(Window.instantiate('mini', 'actors/window'));
    world.tick(0);

    expect(levelOf(world, second)).toBe(levelOf(world, window));
    expect(world.viewportSpaceOf(second)!.bounds).toEqual(new Vector(640, 320));
    // …and a map given to either replaces the World's.
    world.loadWorldMap({actors: [{type: 'actors/coin', id: 'd'}]});
    expect(
      [...world.actors].filter(actor => actor.type === 'actors/coin'),
    ).toHaveLength(1);
  });
});

describe('the actor in hand', () => {
  it('is the handler’s subject: a spawn lands in its space', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadWorldMap(LEVEL);
    inside.on(Ping, (w, actor) => {
      w.addActor(Coin, 'spawned');
      expect(w.mapBounds()).toEqual(new Vector(640, 320));
      expect(w.actorInHand()).toBe(actor);
    });

    world.emit(Ping, inside);
    world.tick(0);

    const spawned = [...world.actors].find(actor => actor.id === 'spawned')!;
    expect(spawned.space).toBe(levelOf(world, window));
    expect(world.actorInHand()).toBeUndefined();
  });

  it('is the loop’s actor and the predicate’s candidate', () => {
    const world = makeWorld();
    placeWindow(world);
    const [inside] = world.loadWorldMap(LEVEL);
    const outside = onScreen(world, 'out');
    const seen: string[] = [];

    each([inside, outside], actor => {
      seen.push(`${actor.id}:${world.mapBounds().x}`);
    });
    const wide = [
      ...filtered([inside, outside], () => world.mapBounds().x > 400),
    ];

    expect(seen).toEqual(['a:640', 'out:320']);
    expect(wide).toEqual([inside]);
    world.enter(outside);
    expect(world.mapBounds().x).toBe(320);
    world.leave();
    expect(world.mapBounds().x).toBe(640);
  });

  it('keeps a near query inside one space', () => {
    const world = makeWorld();
    placeWindow(world);
    const [a] = world.loadWorldMap(LEVEL);
    // A screen coin at the same coordinates as the level's `a`.
    const twin = onScreen(world, 'twin', new Vector(48, 48));

    expect(world.actorsNear({x: 48, y: 48}, 10)).toEqual([a]);
    expect(world.actorsNear({x: 48, y: 48}, 10, undefined, twin)).toEqual([
      twin,
    ]);
    expect(
      world.withActor(twin, () => world.actorsNear({x: 48, y: 48}, 10)),
    ).toEqual([twin]);
  });
});

describe('the mouse, through a Viewport', () => {
  it('is mapped into the space by the window’s corner and the camera', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    const [a] = world.loadWorldMap(LEVEL);
    world.setViewportCamera(window, {position: new Vector(320, 160)});
    world.setPointer({x: 160, y: 130}, []); // 10 in from the corner
    const screenCoin = onScreen(world, 'screen');

    expect(world.mousePosition(screenCoin)).toEqual(new Vector(160, 130));
    // Camera at (320,160) over a 100x80 window shows (270..370, 120..200).
    expect(world.mousePosition(a)).toEqual(new Vector(280, 130));
    // …and with nothing in hand, the World's.
    expect(world.mousePosition()).toEqual(new Vector(280, 130));
    expect(world.withActor(a, () => world.mousePosition())).toEqual(
      new Vector(280, 130),
    );
  });

  it('is mapped through whichever Viewport it is over, the first when none', () => {
    // Two windows onto one World: the pointer over the second is on the
    // World through the second's camera, and over neither it is read
    // through the first.
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    const [a] = world.loadWorldMap(LEVEL);
    const mini = world.addActor(Window.instantiate('mini', 'actors/window'));
    mini.set(PositionProperty, new Vector(60, 50)); // corner at (10, 10)
    world.tick(0);

    world.setPointer({x: 20, y: 20}, []); // 10 in from the second's corner
    expect(world.mousePosition(a)).toEqual(new Vector(10, 10));
    world.setPointer({x: 160, y: 130}, []); // 10 in from the first's
    expect(world.mousePosition(a)).toEqual(new Vector(10, 10));
    world.setPointer({x: 300, y: 300}, []); // over neither
    expect(world.mousePosition(a)).toEqual(new Vector(150, 180));
  });

  it('follows the window’s scale', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));
    window.set(ScaleProperty, new Vector(2, 2)); // 200x160 on screen
    const [a] = world.loadWorldMap(LEVEL);
    expect(world.viewSize(a)).toEqual(new Vector(200, 160));
  });
});

describe('a camera’s zoom', () => {
  // How much of its window a camera takes in (specs/MIRRORING_PLAN.md, step
  // 7). What it sees is its window over its zoom, so a rule measuring the
  // view is right at any zoom, and the pointer is mapped through it.

  it('takes in its window over its zoom', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const camera = world.cameraOf(win)!;
    // The Window kind is 100 by 80, which a camera that says no zoom takes in.
    expect(world.viewSize(camera)).toEqual(new Vector(100, 80));
    world.setViewportCamera(win, {zoom: 0.5});
    expect(world.viewSize(camera)).toEqual(new Vector(200, 160));
    world.setViewportCamera(win, {zoom: 2});
    expect(world.viewSize(camera)).toEqual(new Vector(50, 40));
  });

  it('maps the pointer through it', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    const [a] = world.loadWorldMap(LEVEL);
    world.setViewportCamera(window, {position: new Vector(320, 160), zoom: 2});
    world.setPointer({x: 160, y: 130}, []); // 10 in from the corner

    // At 2 the camera at (320, 160) shows 50 by 40: (295..345, 140..180),
    // and 10 pixels in is 5 into that.
    expect(world.mousePosition(a)).toEqual(new Vector(300, 145));
  });

  it('is told to the driver', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.viewportSpaceOf(win)!.camera!.zoom = 3;
    expect(world.spaceSnapshot()[0].camera.zoom).toBe(3);
    expect(world.cameraSnapshot()[0].zoom).toBe(1);
  });

  it('is never zero, negative or not a number', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    for (const zoom of [0, -2, Number.NaN]) {
      world.setViewportCamera(win, {zoom});
      expect(world.cameraOf(win)!.zoom).toBe(1);
    }
  });
});

describe('what the driver is told', () => {
  it('names each actor’s space, and describes each Viewport’s', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160));
    world.loadWorldMap(LEVEL);
    onScreen(world, 'root');

    const spaces = world
      .renderSnapshot()
      .map(state => [state.actor.id, state.space]);
    expect(spaces).toEqual([
      ['win', undefined],
      ['a', 'world'],
      ['b', 'world'],
      ['c', 'world'],
      ['root', undefined],
    ]);
    expect(world.spaceSnapshot()).toEqual([
      {
        // The World first, which nobody owns: its layers are the map's, and
        // its camera and view are the first Viewport's.
        id: 'world',
        owner: '',
        mirrors: undefined,
        camera: {x: 50, y: 40, zoom: 1},
        view: {x: 100, y: 80},
        bounds: {x: 640, y: 320},
        clearColor: undefined,
        // A map that names no layers has the one every world has.
        layers: [expect.objectContaining({id: 'main'})],
      },
      {
        id: 'main/win',
        owner: 'win',
        // A window onto the World, with no layers of its own.
        mirrors: 'world',
        // The middle of the window: a load leaves the camera there, and a map
        // no longer says to follow anything (specs/SPACE_CAMERAS_PLAN.md).
        camera: {x: 50, y: 40, zoom: 1},
        view: {x: 100, y: 80},
        bounds: {x: 640, y: 320},
        clearColor: undefined,
        layers: [],
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
      // Fog over the game: a layer above it, with a background of its own.
      {id: 'fog', background: {sprite: 'fog.png'}},
    ],
    actors: [
      {type: 'actors/coin', id: 'far', layer: 'sky'},
      {type: 'actors/coin', id: 'near'},
      {type: 'actors/coin', id: 'lost', layer: 'nowhere'},
    ],
  };

  it('become the World’s when the map is loaded into it', () => {
    const world = makeWorld();
    placeWindow(world);
    const [far, near, lost] = world.loadWorldMap(LAYERED);

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
        background: expect.objectContaining({
          sprite: 'sky.png',
          repeat: true,
          offset: {x: 4, y: 0},
        }),
      },
      expect.objectContaining({id: 'main', parallax: {x: 1, y: 1}}),
      expect.objectContaining({
        id: 'fog',
        background: expect.objectContaining({sprite: 'fog.png'}),
      }),
    ]);
  });

  it('puts the default at the back of a map that does not place it', () => {
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap({layers: [{id: 'front'}], actors: []});
    expect(world.spaceSnapshot()[0].layers.map(layer => layer.id)).toEqual([
      'main',
      'front',
    ]);
  });

  it('are not the screen’s when loaded onto it, which is flat', () => {
    // The screen has one layer, so a map loaded onto it adds none, and every
    // placement lands on that one (specs/ONE_WORLD_PLAN.md).
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    world.define('actors/coin', Coin);

    const placed = world.loadScreen(LAYERED);

    expect(placed.map(coin => coin.layer)).toEqual(['main', 'main', 'main']);
    expect(world.screenLayerSnapshot().map(layer => layer.id)).toEqual([
      'main',
    ]);
  });

  it('start over when another map replaces the first', () => {
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap(LAYERED);
    world.loadWorldMap(LEVEL);
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

  it('gives every Viewport one camera that is its own', () => {
    // It starts at the middle of its own window, not of the screen's.
    const world = makeWorld();
    const win = placeWindow(world);
    const space = world.viewportSpaceOf(win)!;
    expect(world.cameraOf(win)).toBe(space.camera);
    expect(space.camera!.position).toEqual(new Vector(50, 40));
    expect(world.camera().position).not.toEqual(space.camera!.position);
  });

  it('leaves the screen’s camera to the world', () => {
    // Neither the screen nor the World has a camera of its own space; the
    // screen is seen through the world's one camera.
    const world = makeWorld();
    expect(world.spaceOf(world.camera()).camera).toBeUndefined();
    expect(world.spaceOf(undefined).camera).toBeUndefined();
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
    world.loadWorldMap(LEVEL);

    const space = world.viewportSpaceOf(win)!;
    const camera = space.camera!;
    // The level is 20 by 10 tiles of 32 — the World grew to fit it — where
    // the screen, which the world's own camera looks at, is the default.
    expect(world.mapBounds(camera)).toEqual(new Vector(640, 320));
    expect(world.mapBounds(world.camera())).toEqual(new Vector(320, 320));
  });

  it('answers with the Viewport’s window, not the world’s view', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const camera = world.viewportSpaceOf(win)!.camera!;
    // The Window kind is 100 by 80; the screen's view is the default.
    expect(world.viewSize(camera)).toEqual(new Vector(100, 80));
    expect(world.viewSize(camera)).not.toEqual(world.viewSize(world.camera()));
  });

  it('leaves the world’s own cameras looking at the screen', () => {
    // They name no space, and `spaceOf` answers with the screen for a camera
    // that names none — so the world's cameras behave as they always have.
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap(LEVEL);
    const own = world.camera();
    expect(own.space).toBeUndefined();
    expect(world.mapBounds(own)).toEqual(new Vector(320, 320));
    expect(world.viewSize(own)).toEqual(new Vector(320, 320));
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

describe('a camera trait, on a Viewport’s camera', () => {
  // A camera rule's step walks `world.cameras.with(trait)`, and a Viewport's
  // camera is in that collection — so following, easing, leading and
  // confining reach it by being elected rather than by being written a second
  // time in the engine (specs/SPACE_CAMERAS_PLAN.md).

  it('runs for a Viewport’s camera', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.setViewportCamera(win, {traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect([...aimed.keys()]).toEqual(['win:main']);
  });

  it('asks the world about the World while it runs', () => {
    // A step that asks `map size` with no subject gets the World's bounds and
    // the Viewport's window, which is what `Confined to the Map` needs.
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadWorldMap(LEVEL);
    world.setViewportCamera(win, {traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect(aimed.get('win:main')).toEqual({
      map: new Vector(640, 320),
      view: new Vector(100, 80),
    });
  });

  it('runs for two Viewports at once, each through its own window', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const mini = world.addActor(Window.instantiate('mini', 'actors/window'));
    world.loadWorldMap(LEVEL);
    world.setViewportCamera(win, {traits: [AimsAtTheCorner]});
    world.setViewportCamera(mini, {traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect([...aimed.keys()].sort()).toEqual(['mini:main', 'win:main']);
  });
});

describe('what the engine does to a camera a trait has aimed', () => {
  it('leaves where the trait put it', () => {
    // The trait aims the camera in the `aim` phase, and nothing in the engine
    // writes over it at the end of the tick (specs/SPACE_CAMERAS_PLAN.md).
    const world = makeWorld();
    const win = placeWindow(world);
    world.loadWorldMap(LEVEL);
    world.setViewportCamera(win, {traits: [AimsAtTheCorner]});

    world.tick(0);
    // EXACTLY WHERE THE STEP PUT IT, and not clamped: this trait does not
    // elect `Confined to the Map`, so nothing confines it.
    expect(world.cameraOf(win)!.position).toEqual(new Vector(0, 0));
  });
});

describe('following, from a camera in a Viewport', () => {
  // The scenario that found the gap: a coin on the screen AND in the World,
  // and the Viewport's camera told to follow the first coin in its space
  // (specs/SPACE_CAMERAS_PLAN.md).

  it('follows the coin in the World, not the one on the screen', () => {
    const world = makeWorld();
    onScreen(world, 'rc', new Vector(11, 12));
    const win = placeWindow(world);
    const [held] = world.loadWorldMap({
      actors: [
        {
          type: 'actors/coin',
          id: 'hc',
          properties: {positional: {position: {x: 300, y: 200}}},
        },
      ],
    });
    world.setViewportCamera(win, {traits: [FollowsACoin]});

    world.tick(0);
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      held.get(PositionProperty),
    );
  });

  it('stays where it is when nothing of the kind is in its space', () => {
    const world = makeWorld();
    onScreen(world, 'rc');
    const win = placeWindow(world);
    world.setViewportCamera(win, {traits: [FollowsACoin]});
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

    world.loadWorldMap(LEVEL);
    expect(heard).toEqual([]);
    world.tick(0);
    expect(heard).toEqual([{value: '', coins: 3}]);
  });

  it('adds to the World from a Viewport’s own handler', () => {
    // A Viewport is the screen's, and what its handlers add is the World's,
    // as from any code (specs/ONE_WORLD_PLAN.md).
    const world = makeWorld();
    const win = placeWindow(world);
    let added: Actor | undefined;
    win.on(ViewportShowsMapEvent, w => {
      added = w.addActor(Coin.instantiate('here', 'actors/coin'));
    });

    world.loadWorldMap(LEVEL);
    world.tick(0);
    expect(added!.space).toBe(levelOf(world, win));
  });

  it('is raised for a load by path, carrying the path', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    world.defineMap('maps/level1', LEVEL);
    const values: unknown[] = [];
    win.on(ViewportShowsMapEvent, (_w, _actor, value) => values.push(value));

    world.loadWorldMap('maps/level1');
    world.tick(0);
    expect(values).toEqual(['maps/level1']);
  });

  it('is raised for a Viewport placed after the World has its map', () => {
    // So it means the same whichever came first: a Main Screen's module
    // loads the World's map before it places the screen.
    const world = makeWorld();
    world.defineMap('maps/level1', LEVEL);
    world.loadWorldMap('maps/level1');
    const values: unknown[] = [];
    const win = placeWindow(world);
    win.on(ViewportShowsMapEvent, (_w, _actor, value) => values.push(value));
    world.tick(0);
    expect(values).toEqual(['maps/level1']);
  });

  it('is not raised for a path that names no map', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const values: unknown[] = [];
    win.on(ViewportShowsMapEvent, (_w, _actor, value) => values.push(value));

    world.loadWorldMap(LEVEL);
    world.tick(0);
    world.loadWorldMap('maps/missing');
    world.tick(0);
    expect(values).toEqual(['']);
  });

  it('lets a handler aim the camera at what the map brought', () => {
    // The Jetpack setup: the same level in the main world and in a Viewport,
    // and the Viewport told to follow a coin. In `on create` the snapshot is
    // the screen's coin; here it is the World's.
    const world = makeWorld();
    onScreen(world, 'rc', new Vector(11, 12));
    const win = placeWindow(world);
    world.setViewportCamera(win, {traits: [FollowsACoin]});
    win.on(ViewportShowsMapEvent, () => undefined);

    world.loadWorldMap(LEVEL);
    world.tick(0);
    const held = [...world.actors].find(actor => actor.id === 'a')!;
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      held.get(PositionProperty),
    );
  });
});

describe('what a world block acts on', () => {
  it('is the World with nothing in hand', () => {
    const world = makeWorld();
    expect(world.here()).toEqual({space: world.spaceOf(undefined)});
    expect(world.here().space.id).toBe('world');
  });

  it('is the World with a screen actor in hand, too', () => {
    // A Button's handler adds to the game (specs/ONE_WORLD_PLAN.md).
    const world = makeWorld();
    const coin = onScreen(world, 'screen');
    expect(world.withActor(coin, () => world.here().space.id)).toBe('world');
  });

  it('is an actor’s space and layer while it is in hand', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [inside] = world.loadWorldMap(LEVEL);
    const here = world.withActor(inside, () => world.here());
    expect(here.space).toBe(levelOf(world, window));
    expect(here.layer).toBe(inside.layer);
  });

  it('is the World while a map loaded into it runs its script', () => {
    // Nothing is in hand while a map's script runs, and it used to be in the
    // root for that reason even when the map was a Viewport's. What it spawns
    // lands beside what the map placed.
    const world = makeWorld();
    placeWindow(world);
    const seen: {here?: string; inHand?: unknown; spawned?: string} = {};
    world.loadWorldMap({
      ...LEVEL,
      script: (running, _placed, load) => {
        seen.here = running.here().space.id;
        seen.inHand = running.actorInHand();
        const spawned = running.addActor(Coin.instantiate('s', 'actors/coin'));
        seen.spawned = running.spaceOf(spawned).id;
        expect(load.space).toBe(running.here().space);
      },
    });
    expect(seen).toEqual({
      here: 'world',
      inHand: undefined,
      spawned: 'world',
    });
    // …and still the World after.
    expect(world.here().space.id).toBe('world');
  });

  it('is the screen while a map loaded onto it runs its script', () => {
    const world = makeWorld();
    let here = '';
    world.loadScreen({
      ...LEVEL,
      script: running => {
        here = running.here().space.id;
      },
    });
    expect(here).toBe('main');
  });
});

describe('world blocks act on the World', () => {
  // From any code (specs/ONE_WORLD_PLAN.md): a World actor's on the layer it
  // is in, anything else's on the World's default. The screen is set only by
  // the calls its own module makes (`setScreenBackground` and the rest).

  /** A level of two layers, with a coin on the front one. */
  const LAYERED: WorldMap = {
    ...LEVEL,
    layers: [{id: 'main'}, {id: 'front'}],
    actors: [{...LEVEL.actors[0], layer: 'front'}],
  };

  const loaded = (script?: WorldMap['script']) => {
    const world = makeWorld();
    const window = placeWindow(world);
    const [coin] = world.loadWorldMap({...LAYERED, script});
    return {world, window, coin, space: levelOf(world, window)};
  };

  const sprites = (layers: readonly {background: {sprite?: string}}[]) =>
    layers.map(layer => layer.background.sprite);

  it('sets a level’s background from the level’s own code', () => {
    const {world, space} = loaded(running => {
      running.setBackground('cave.png');
    });
    expect(sprites(space.layers)).toEqual(['cave.png', undefined]);
    expect(world.screenBackdropSnapshot()[0].sprite).toBeUndefined();
  });

  it('sets the background of the layer an actor is in, from its code', () => {
    const {world, coin, space} = loaded();
    world.withActor(coin, () => world.setBackground('stars.png'));
    expect(sprites(space.layers)).toEqual([undefined, 'stars.png']);
    // …and a layer named outright is still the one named.
    world.withActor(coin, () => world.setBackground('cave.png', 'main'));
    expect(sprites(space.layers)).toEqual(['cave.png', 'stars.png']);
  });

  it('sets the World’s background with nothing in hand, and the screen’s only by name', () => {
    const {world, space} = loaded();
    world.setBackground('level.png');
    expect(sprites(space.layers)).toEqual(['level.png', undefined]);
    expect(world.screenBackdropSnapshot()[0].sprite).toBeUndefined();
    world.setScreenBackground('screen.png');
    expect(world.screenBackdropSnapshot()[0].sprite).toBe('screen.png');
    expect(sprites(space.layers)).toEqual(['level.png', undefined]);
  });

  it('gives the World a sky, and leaves it see-through until then', () => {
    const {world, coin, space} = loaded();
    const screen = world.screenColor();
    expect(world.spaceSnapshot()[0].clearColor).toBeUndefined();

    world.withActor(coin, () => world.setBackgroundColor('#ff0000'));
    expect(world.spaceSnapshot()[0].clearColor).toEqual([1, 0, 0, 1]);
    // …which every Viewport onto it paints.
    expect(world.spaceSnapshot()[1].clearColor).toEqual([1, 0, 0, 1]);
    expect(space.clearColor).toEqual([1, 0, 0, 1]);
    expect(world.screenColor()).toEqual(screen);
  });

  it('sizes the level, not the screen', () => {
    const {world, space} = loaded(running => running.setMapSize(30, 12));
    expect(space.bounds).toEqual(new Vector(30 * 32, 12 * 32));
    expect(world.mapBounds(world.camera())).not.toEqual(space.bounds);
  });

  it('replaces the World’s map from code in it, and leaves the screen', () => {
    // A level change, a restart and the overworld are all `load map` from
    // the level (specs/ONE_WORLD_PLAN.md).
    const {world, coin, space} = loaded();
    const before = world.spaceOf(world.camera()).loads.length;
    const [door] = world.withActor(coin, () =>
      world.loadMap({actors: [{type: 'actors/coin', id: 'door'}]}),
    );
    expect(world.spaceOf(door)).toBe(space);
    expect(space.loads).toHaveLength(1);
    expect(coin.world).toBeUndefined();
    expect(world.spaceOf(world.camera()).loads).toHaveLength(before);
  });

  it('puts a map up over the screen by name, and takes the newest back', () => {
    // The screen's stack until screens are (specs/SCREEN_STACK_PLAN.md).
    const {world, coin, space} = loaded();
    world.defineMap('maps/menu', {actors: [{type: 'actors/coin', id: 'm'}]});
    const [menu] = world.withActor(coin, () => world.loadMapNamed('maps/menu'));
    expect(world.spaceOf(menu).id).toBe('main');
    expect(space.loads).toHaveLength(1);
    expect(world.withActor(coin, () => world.unloadNewestMap())).toBe(true);
    expect(menu.world).toBeUndefined();
    expect(space.loads).toHaveLength(1);
  });
});

describe('a Viewport placed by a map', () => {
  it('has its camera set up from the first frame, on the level', () => {
    // The World's map is loaded before the screen is, so a camera the
    // screen's script declares can be aimed at what the level holds; and the
    // camera it names is the one it looks through before any tick
    // (specs/SCREEN_MAP_PLAN.md, step three; specs/ONE_WORLD_PLAN.md).
    const world = makeWorld();
    world.defineMap('maps/level', LEVEL);
    world.loadWorldMap('maps/level');
    const order: string[] = [];
    world.loadScreen({
      actors: [{type: 'actors/window', id: 'win'}],
      script: (running, placed) => {
        const space = levelOf(running, placed.win);
        order.push(`level holds ${space.loads[0]?.actors.length ?? 0}`);
        running.setViewportCamera(placed.win, {traits: [FollowsACoin]});
      },
    });
    expect(order).toEqual(['level holds 3']);

    const win = [...world.actors].find(actor => actor.id === 'win')!;
    const space = world.viewportSpaceOf(win)!;

    world.tick(0);
    const coin = [...world.actors].find(actor => actor.id === 'a')!;
    expect(space.camera!.position).toEqual(coin.get(PositionProperty));
  });
});
