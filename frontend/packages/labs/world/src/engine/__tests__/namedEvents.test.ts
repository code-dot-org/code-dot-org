// A world's events, named by the maps that raise them
// (specs/MAP_EVENTS_PLAN.md).
//
// A map cannot import the world's module — the world LOADS the map, so the
// import would be a cycle — so the world REGISTERS what it declares under a
// name and a map says the word. What this pins is the sentence the old design
// could not say: many maps raising one event is one declaration and one
// handler.

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

/** A map whose script raises `quit`. */
const menu = (): WorldMap => ({
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

    world.loadMap(menu());
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

    // Three maps, as a pause menu, a confirm and a level's own would be.
    world.loadMap(menu());
    world.loadMap(menu());
    world.loadMap(menu());
    world.tick(1 / 60);
    expect(heard).toEqual(['quit', 'quit', 'quit']);
  });

  it('raise nothing under a name the world does not declare', () => {
    const world = makeWorld(false);
    expect(world.emitNamed('quit')).toBe(false);
  });
});
