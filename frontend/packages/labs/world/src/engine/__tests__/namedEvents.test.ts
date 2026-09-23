// A world's events, named by the maps that raise them
// (specs/MAP_EVENTS_PLAN.md).
//
// A map cannot import the world's module — the world LOADS the map, so the
// import would be a cycle — so the world REGISTERS what it declares under a
// name and a map says the word. Three things follow, and this pins them: many
// maps raising one event is one declaration and one handler, which is the
// sentence the old design could not say; a name nothing declares raises
// nothing; and the mismatch is found when the map is LOADED rather than when
// somebody finally presses the button.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {World, WorldMap} from '../core/World';

const QuitEvent = new RuleBuilder({
  id: 'quitting',
  name: 'Quitting',
}).addEvent('quit');

const Button = new ActorBuilder({id: 'button', name: 'Button'});

const makeWorld = (declaring = true): World => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  world.define('actors/button', Button);
  if (declaring) {
    world.defineEvent('quit', QuitEvent);
  }
  return world;
};

/** A map that says it raises `quit`, and whose script raises it. */
const menu = (id: string): WorldMap => ({
  name: id,
  raises: ['quit'],
  actors: [{type: 'actors/button', id: 'Quit'}],
  script: world => {
    world.emitNamed('quit');
  },
});

describe('a world’s named events', () => {
  it('are raised by name, and reach the one handler', () => {
    const world = makeWorld();
    const heard: number[] = [];
    world.on(QuitEvent, () => heard.push(1));

    world.loadMap(menu('a'));
    world.tick(1 / 60);
    expect(heard).toHaveLength(1);
  });

  it('are ONE handler however many maps raise them', () => {
    // The whole reason for the inversion. Under the old design each map
    // declared its own `quit` and a world that loaded three of them needed
    // three hats saying the same thing.
    const world = makeWorld();
    const heard: string[] = [];
    world.on(QuitEvent, () => heard.push('quit'));

    for (const id of ['pause', 'confirm', 'level']) {
      world.loadMap(menu(id));
    }
    world.tick(1 / 60);
    expect(heard).toEqual(['quit', 'quit', 'quit']);
    expect(world.unheardEventNames()).toEqual([]);
  });

  it('raise nothing under a name the world does not declare, and say so', () => {
    const world = makeWorld(false);
    expect(world.emitNamed('quit')).toBe(false);
    expect(world.unheardEventNames()).toEqual(['quit']);
  });

  it('are checked when the map LOADS, before anything is pressed', () => {
    const world = makeWorld(false);
    // Nothing has raised anything: the map merely said it would.
    world.loadMap({name: 'Pause Menu', raises: ['quit'], actors: []});
    expect(world.unheardEventNames()).toEqual(['quit']);
  });

  it('say nothing about a map whose raises the world declares', () => {
    const world = makeWorld();
    world.loadMap({name: 'Pause Menu', raises: ['quit'], actors: []});
    expect(world.unheardEventNames()).toEqual([]);
  });

  it('list what the world declares, for the editor to offer', () => {
    expect(makeWorld().eventNames()).toEqual(['quit']);
  });
});
