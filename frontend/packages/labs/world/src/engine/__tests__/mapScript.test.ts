// A map's script: what the map DOES, run once per load (`WorldMap.script`,
// `MapLoad`, specs/MAP_FIRST.md "What a map script looks like").
//
// The script is handed the actors the load placed, by the id the map gave
// each entry, and the load itself. Two loads of one map are two calls with two
// tables, so a menu's Resume closes its own menu.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import type {MapLoad, WorldMap} from '../core/World';
import {PositionProperty} from '../rules/spatial';

const Ping = new RuleBuilder({id: 'pinger', name: 'Pinger'}).addEvent('ping');
const Button = new ActorBuilder({id: 'button', name: 'Button'});

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  world.define('actors/button', Button);
  return world;
};

const menu = (script: WorldMap['script']): WorldMap => ({
  actors: [
    {type: 'actors/button', id: 'Resume'},
    {type: 'actors/button', id: 'Quit'},
  ],
  script,
});

describe('a map script', () => {
  it('runs once per load, over the actors that load placed', () => {
    const world = makeWorld();
    const seen: string[][] = [];
    const map = menu((_world, placed) => {
      seen.push(Object.keys(placed));
    });

    world.loadMap(map);
    world.loadMap(map);

    // By the MAP's ids, not the resolved ones: the second load's buttons are
    // `Resume#2` and `Quit#2` in the world and `Resume` and `Quit` here.
    expect(seen).toEqual([
      ['Resume', 'Quit'],
      ['Resume', 'Quit'],
    ]);
  });

  it('registers on the placed actor, so a hat about it fires', () => {
    const world = makeWorld();
    const heard: string[] = [];
    const [resume] = world.loadMap(
      menu((_world, placed) => {
        placed.Resume.on(Ping, (_w, actor) => heard.push(actor.id));
      }),
    );
    const [, quit] = [...world.actors];

    world.emit(Ping, quit);
    world.emit(Ping, resume);
    world.tick(0);

    expect(heard).toEqual(['Resume']);
  });

  it('unloads what it placed, and only that', () => {
    const world = makeWorld();
    let load: MapLoad | undefined;
    world.loadMap(
      menu((_world, _placed, map) => {
        load = map;
      }),
    );
    world.loadMap(menu(undefined));
    expect([...world.actors].map(actor => actor.id)).toEqual([
      'Resume',
      'Quit',
      'Resume#2',
      'Quit#2',
    ]);

    load!.unload();

    expect([...world.actors].map(actor => actor.id)).toEqual([
      'Resume#2',
      'Quit#2',
    ]);
  });

  it('tells its unload handlers first, and skips an actor already gone', () => {
    const world = makeWorld();
    const order: string[] = [];
    let load: MapLoad | undefined;
    world.loadMap(
      menu((_world, placed, map) => {
        load = map;
        map.onUnload(() => order.push(`unloading:${world.actorCount()}`));
        world.removeActor(placed.Quit);
      }),
    );

    load!.unload();

    expect(order).toEqual(['unloading:1']);
    expect(world.actorCount()).toBe(0);
  });

  it('is deferred to the end of a tick, as any removal is', () => {
    const world = makeWorld();
    let load: MapLoad | undefined;
    const [resume] = world.loadMap(
      menu((_world, placed, map) => {
        load = map;
        placed.Resume.on(Ping, () => map.unload());
      }),
    );

    world.emit(Ping, resume);
    world.tick(0);

    expect(load).toBeDefined();
    expect(world.actorCount()).toBe(0);
  });
});

// The stack a screen sits on (specs/SCREENS_PLAN.md). `load map` ADDS one over
// what is there, so the loads a space holds are a stack already; what was
// missing is closing the one on top from OUTSIDE it, which is the whole of
// what "back" means.
describe('closing the newest map', () => {
  it('takes back the last one loaded, and leaves the ones under it', () => {
    const world = makeWorld();
    world.loadMap(menu(undefined));
    world.loadMap(menu(undefined));

    expect(world.unloadNewestMap()).toBe(true);
    world.tick(1 / 60);

    // Two buttons left, which is the first load's — the second is gone.
    expect([...world.actors]).toHaveLength(2);
  });

  it('goes back down to nothing, one at a time', () => {
    const world = makeWorld();
    world.loadMap(menu(undefined));
    world.loadMap(menu(undefined));

    expect(world.unloadNewestMap()).toBe(true);
    expect(world.unloadNewestMap()).toBe(true);
    // …and says so when there is nothing left to close, which is what lets a
    // rule keep a floor under its own stack.
    expect(world.unloadNewestMap()).toBe(false);
    world.tick(1 / 60);

    expect([...world.actors]).toHaveLength(0);
  });

  it('does not count a load that has already gone', () => {
    // A load used to stay on its space's list after unloading itself, which
    // nothing noticed because nothing asked which was on top. `unload this
    // map` from inside a script is the ordinary way one goes.
    const world = makeWorld();
    let held: MapLoad | undefined;
    world.loadMap(menu((_world, _placed, load) => (held = load)));
    world.loadMap(menu(undefined));
    held!.unload();
    world.tick(1 / 60);

    // The first is gone; the newest is the second, and after it there is
    // nothing — not a stale entry reporting itself as the top.
    expect(world.unloadNewestMap()).toBe(true);
    expect(world.unloadNewestMap()).toBe(false);
  });
});

// One map, two worlds of different shapes (specs/ANCHORS_PLAN.md). The trigger
// the interface spec named: a stock interface map is loaded over whatever
// world asked for it, and a panel placed at a corner has to stay at one.
describe('an anchored placement', () => {
  /** A 10x10 map of 32-pixel tiles: 320 by 320, with one card in a corner. */
  const cornered = (anchor?: string) => ({
    size: {width: 10, height: 10},
    tile: {width: 32, height: 32},
    actors: [
      {
        type: 'actors/button',
        id: 'card',
        anchor,
        properties: {positional: {position: {x: 300, y: 300}}},
      },
    ],
  });

  const placed = (world: ReturnType<typeof makeWorld>) =>
    [...world.actors].find(one => one.id === 'card')!.get(PositionProperty);

  it('holds its distance from the corner in a wider window', () => {
    const world = makeWorld();
    // Twenty tiles across and ten down: 640 by 320, where the map is square.
    world.setViewSize(20, 10);

    world.loadMap(cornered('bottom right') as never);

    // Twenty in from the right and twenty up from the bottom, as it was.
    expect(placed(world)).toMatchObject({x: 620, y: 300});
  });

  it('stays exactly where it was put when nothing anchors it', () => {
    const world = makeWorld();
    world.setViewSize(20, 10);

    world.loadMap(cornered(undefined) as never);

    expect(placed(world)).toMatchObject({x: 300, y: 300});
  });

  it('moves nothing when the window is the map’s own shape', () => {
    const world = makeWorld();
    world.setViewSize(10, 10);

    world.loadMap(cornered('bottom right') as never);

    expect(placed(world)).toMatchObject({x: 300, y: 300});
  });

  it('follows a window RESIZED after the map loaded', () => {
    // THE ORDER A WORLD ACTUALLY RUNS IN, and the one every test above has
    // backwards. A world's main map is loaded between its prologue and its
    // rows, so that a row can name what the map placed
    // (specs/MAP_BEFORE_ROWS_PLAN.md) — which means `set view size` in the
    // world's body runs AFTER the load, and the anchors were measured against
    // the default window and never measured again.
    //
    // Notes met it: NEW NOTE is anchored to the bottom of a 320x576 map, was
    // placed against the default 320x320 window at y=264, and stayed there
    // when the body made the window 576 tall — which is the middle of it.
    const world = makeWorld();
    world.loadMap(cornered('bottom right') as never);
    expect(placed(world)).toMatchObject({x: 300, y: 300});

    world.setViewSize(20, 10);

    expect(placed(world)).toMatchObject({x: 620, y: 300});
  });

  it('is left where a block PUT it, when the window then changes', () => {
    // The same rule the cameras follow through a resize: one still where it
    // was declared follows the window, one that has been moved is left alone.
    // Re-anchoring a thing a program has since dragged somewhere would undo
    // the program.
    const world = makeWorld();
    world.loadMap(cornered('bottom right') as never);
    const card = [...world.actors].find(one => one.id === 'card')!;
    card.set(PositionProperty, new Vector(10, 10));

    world.setViewSize(20, 10);

    expect(placed(world)).toMatchObject({x: 10, y: 10});
  });

  it('ignores an anchor it does not know', () => {
    // A map is JSON and may say anything. A word nothing recognises has to
    // mean "not anchored" rather than take the whole level away.
    const world = makeWorld();
    world.setViewSize(20, 10);

    world.loadMap(cornered('middle') as never);

    expect(placed(world)).toMatchObject({x: 300, y: 300});
  });
});
