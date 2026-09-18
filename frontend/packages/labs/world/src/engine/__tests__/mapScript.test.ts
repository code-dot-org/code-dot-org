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
import type {MapLoad, WorldMap} from '../core/World';

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
