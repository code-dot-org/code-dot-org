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
import {
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

  it('keeps the camera inside the map as the Viewport scrolls it', () => {
    // WHAT THIS USED TO SAY was that the camera followed the actor a map named,
    // and that the engine clamped it. The following is gone — it is `Follows`
    // on a camera now, elected like anything else — and the clamping stays,
    // because a scroll view's `scroll` promises a reading of where it actually
    // stopped (specs/SCROLLING_PLAN.md).
    const world = makeWorld();
    const window = placeWindow(world);
    world.loadWorldMap(LEVEL);
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
    // The space's camera is where a load leaves it: the middle of its own
    // window, since a map no longer says what to follow and nothing has
    // scrolled it (specs/SPACE_CAMERAS_PLAN.md).
    window.set(ViewportScrollProperty, new Vector(270, 120));
    world.tick(0);
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
    world.defineCamera({id: 'wide', viewport: win, zoom: 0.5});
    world.defineCamera({id: 'close', viewport: win, zoom: 2});
    const space = world.viewportSpaceOf(win)!;

    // The Window kind is 100 by 80.
    expect(world.viewSize(space.cameraNamed('wide')!)).toEqual(
      new Vector(200, 160),
    );
    expect(world.viewSize(space.cameraNamed('close')!)).toEqual(
      new Vector(50, 40),
    );
    // …and its main camera, which says none, takes in its window.
    expect(world.viewSize(space.camera!)).toEqual(new Vector(100, 80));
  });

  it('maps the pointer through it', () => {
    const world = makeWorld();
    const window = placeWindow(world);
    window.set(PositionProperty, new Vector(200, 160)); // corner at (150, 120)
    const [a] = world.loadWorldMap(LEVEL);
    window.set(ViewportScrollProperty, new Vector(270, 120));
    world.tick(0);
    world.viewportSpaceOf(window)!.camera!.zoom = 2;
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
    for (const [id, zoom] of [
      ['none', 0],
      ['less', -2],
      ['nan', Number.NaN],
    ] as const) {
      world.defineCamera({id, viewport: win, zoom});
      expect(world.viewportSpaceOf(win)!.cameraNamed(id)!.zoom).toBe(1);
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
      {id: 'fog', fit: true, background: {sprite: 'fog.png'}},
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
        fit: false,
        background: expect.objectContaining({
          sprite: 'sky.png',
          repeat: true,
          offset: {x: 4, y: 0},
        }),
      },
      expect.objectContaining({id: 'main', parallax: {x: 1, y: 1}}),
      expect.objectContaining({
        id: 'fog',
        fit: true,
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

  it('resolve against the screen’s layers when loaded onto the screen', () => {
    // The screen's layer list is fixed when the world is built, so a map
    // loaded onto it adds none; a placement naming one it has lands on it.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    builder.defineScreenLayer({id: 'sky'});
    const world = builder.getWorld();
    world.define('actors/coin', Coin);

    const [far, near, lost] = world.loadScreen(LAYERED);

    expect(far.layer).toBe('sky');
    expect(near.layer).toBe('main');
    expect(lost.layer).toBe('main');
    expect(world.screenLayerSnapshot().map(layer => layer.id)).toEqual([
      'main',
      'sky',
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
    world.loadWorldMap(LEVEL);

    const space = world.viewportSpaceOf(win)!;
    const camera = space.camera!;
    // The level is 20 by 10 tiles of 32 — the World grew to fit it — where
    // the screen, which the world's own camera looks at, is the default.
    expect(world.mapBounds(camera)).toEqual(new Vector(640, 320));
    expect(world.mapBounds(world.camera('main'))).toEqual(new Vector(320, 320));
  });

  it('answers with the Viewport’s window, not the world’s view', () => {
    const world = makeWorld();
    const win = placeWindow(world);
    const camera = world.viewportSpaceOf(win)!.camera!;
    // The Window kind is 100 by 80; the screen's view is the default.
    expect(world.viewSize(camera)).toEqual(new Vector(100, 80));
    expect(world.viewSize(camera)).not.toEqual(
      world.viewSize(world.camera('main')),
    );
  });

  it('leaves the world’s own cameras looking at the screen', () => {
    // They name no space, and `spaceOf` answers with the screen for a camera
    // that names none — so the world's cameras behave as they always have.
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap(LEVEL);
    const own = world.camera('main');
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
    // …looking at the World, which is what the Viewport shows.
    expect(space.cameraNamed('wide')!.space).toBe(space.mirrorOf);
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
    placeWindow(world);
    world.loadWorldMap(LEVEL);
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

  it('leaves the world’s own cameras asking about the screen', () => {
    const world = makeWorld();
    placeWindow(world);
    world.defineCamera({id: 'corner', traits: [AimsAtTheCorner]});
    aimed.clear();

    world.tick(0);
    expect(aimed.get('corner')).toEqual({
      map: new Vector(320, 320),
      view: new Vector(320, 320),
    });
  });

  it('runs for both at once, each about its own space', () => {
    const world = makeWorld();
    placeWindow(world);
    world.loadWorldMap(LEVEL);
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
    world.loadWorldMap(LEVEL);
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
    world.loadWorldMap(LEVEL);

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
    world.loadWorldMap(LEVEL);
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
    world.loadWorldMap(LEVEL);
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

  it('follows the coin in ITS space, while the world’s camera follows the screen’s', () => {
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
    onScreen(world, 'rc');
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
    world.defineCamera({id: 'chase', viewport: win, traits: [FollowsACoin]});
    win.set(ViewportShowsThroughProperty, 'chase');
    win.on(ViewportShowsMapEvent, () => undefined);

    world.loadWorldMap(LEVEL);
    world.tick(0);
    const held = [...world.actors].find(actor => actor.id === 'a')!;
    expect(world.viewportSpaceOf(win)!.camera!.position).toEqual(
      held.get(PositionProperty),
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
    world.loadWorldMap(LEVEL);
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
    expect(world.mapBounds(world.camera('main'))).not.toEqual(space.bounds);
  });

  it('replaces the World’s map from code in it, and leaves the screen', () => {
    // A level change, a restart and the overworld are all `load map` from
    // the level (specs/ONE_WORLD_PLAN.md).
    const {world, coin, space} = loaded();
    const before = world.spaceOf(world.camera('main')).loads.length;
    const [door] = world.withActor(coin, () =>
      world.loadMap({actors: [{type: 'actors/coin', id: 'door'}]}),
    );
    expect(world.spaceOf(door)).toBe(space);
    expect(space.loads).toHaveLength(1);
    expect(coin.world).toBeUndefined();
    expect(world.spaceOf(world.camera('main')).loads).toHaveLength(before);
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
  it('looks through its chosen camera from the first frame, on the level', () => {
    // The World's map is loaded before the screen is, so a camera the
    // screen's script declares can be aimed at what the level holds; and the
    // camera it names is the one it looks through before any tick
    // (specs/SCREEN_MAP_PLAN.md, step three; specs/ONE_WORLD_PLAN.md).
    const world = makeWorld();
    world.defineMap('maps/level', LEVEL);
    world.loadWorldMap('maps/level');
    const order: string[] = [];
    world.loadScreen({
      actors: [
        {
          type: 'actors/window',
          id: 'win',
          properties: {
            [ViewportShowsThroughProperty.ownerId]: {
              [ViewportShowsThroughProperty.id]: 'chase',
            },
          },
        },
      ],
      script: (running, placed) => {
        const space = levelOf(running, placed.win);
        order.push(`level holds ${space.loads[0]?.actors.length ?? 0}`);
        running.defineCamera({
          id: 'chase',
          name: 'chase',
          viewport: placed.win,
          traits: [FollowsACoin],
        });
      },
    });
    expect(order).toEqual(['level holds 3']);

    const win = [...world.actors].find(actor => actor.id === 'win')!;
    const space = world.viewportSpaceOf(win)!;
    expect(space.camera!.name).toBe('chase');

    world.tick(0);
    const coin = [...world.actors].find(actor => actor.id === 'a')!;
    expect(space.camera!.position).toEqual(coin.get(PositionProperty));
  });
});
