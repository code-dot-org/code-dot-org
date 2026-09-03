// "is created" — the event every actor gets for nothing.
//
// The one lifecycle event the engine raises itself. What it has to get right is
// WHEN: a handler that ran while the actor was being placed would be running
// inside whatever placed it, and the commonest thing such a handler does is add
// another actor (specs/ENHANCEMENTS.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {CreatedEvent, PositionalTrait} from '../rules/spatial';

/** An actor that counts the times it hears about its own creation. */
const counter = () => {
  const heard: string[] = [];
  const template = new ActorBuilder({id: 'thing', name: 'Thing'})
    .useTraits([PositionalTrait])
    .on(CreatedEvent, (_world, actor) => {
      heard.push(actor.id);
    });
  return {heard, template};
};

describe('an actor being created', () => {
  it('hears about it on the first tick, not while it is being placed', () => {
    const {heard, template} = counter();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();

    world.addActor(template, 'one');
    // Nothing yet: the event is queued, like every other one, so a handler
    // cannot run inside the call that placed the actor.
    expect(heard).toEqual([]);

    world.tick(1 / 60);
    expect(heard).toEqual(['one']);
  });

  it('hears it once, however long the world runs', () => {
    const {heard, template} = counter();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');

    for (let frame = 0; frame < 10; frame++) {
      world.tick(1 / 60);
    }

    expect(heard).toEqual(['one']);
  });

  it('reaches every instance of a kind, one each', () => {
    // What makes this worth having: a template's handler is every instance's,
    // so an actor that brings company brings one each rather than one between
    // them.
    const {heard, template} = counter();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');
    world.addActor(template, 'two');

    world.tick(1 / 60);

    expect(heard.sort()).toEqual(['one', 'two']);
  });

  it('lets a handler add another actor', () => {
    // The case the event exists for. Placing an actor from a handler grows the
    // world's list, which is exactly why this is queued rather than raised
    // where the placement happens.
    const bar = new ActorBuilder({id: 'bar', name: 'Bar'}).useTraits([
      PositionalTrait,
    ]);
    const template = new ActorBuilder({id: 'thing', name: 'Thing'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, world => {
        world.addActor(bar);
      });
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');
    world.addActor(template, 'two');

    world.tick(1 / 60);

    // One each, and the world is still walkable afterwards.
    expect([...world.actors].length).toBe(4);
  });

  it('reaches an actor the world was built with', () => {
    // Placed before there is a tick to queue against, which is where the
    // starter's actors come from: the event waits for the first one.
    const {heard, template} = counter();
    // Through the BUILDER, which is where a `.world` file's `add actor` lands
    // while the world is being described — and which hands the placement
    // straight to the live world (`WorldBuilder.addActor`).
    const builder = new WorldBuilder({id: 'w', name: 'w'});
    builder.addActor(template, 'one');

    builder.getWorld().tick(1 / 60);

    expect(heard).toEqual(['one']);
  });
});
