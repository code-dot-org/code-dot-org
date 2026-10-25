// "is created" and "is removed" — the two events every actor gets for nothing.
//
// The lifecycle pair the engine raises itself. What they have to get right is
// WHEN: a handler that ran while the actor was being placed would be running
// inside whatever placed it, and the commonest thing such a handler does is add
// another actor — or, at the other end, take one away
// (specs/ENHANCEMENTS.md). And `is created` runs before the actor is first
// drawn, since it is where an actor is set up (specs/ACTORS_AS_DATA_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {CreatedEvent, PositionalTrait, RemovedEvent} from '../rules/spatial';

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
  it('hears about it before it is drawn, not while it is being placed', () => {
    const {heard, template} = counter();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();

    world.addActor(template, 'one');
    // Nothing yet: a handler cannot run inside the call that placed the
    // actor.
    expect(heard).toEqual([]);

    // …and before the first picture, which a driver takes before any tick.
    world.renderSnapshot();
    expect(heard).toEqual(['one']);
  });

  it('is set up before the first tick’s steps read it', () => {
    const seen: boolean[] = [];
    let ready = false;
    const template = new ActorBuilder({id: 'thing', name: 'Thing'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, () => {
        ready = true;
      });
    template.defineStep('look', 'decide', () => {
      seen.push(ready);
    });
    const world = new WorldBuilder({id: 'w', name: 'w'}).getWorld();
    world.addActor(template, 'one', 'things');

    world.tick(1 / 60);

    expect(seen).toEqual([true]);
  });

  it('is set up in the tick a handler made it in', () => {
    // A handler runs after the steps; what it makes is drawn after this
    // tick, so it is told before then rather than on the next one.
    const heard: string[] = [];
    const made = new ActorBuilder({id: 'made', name: 'Made'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, (_world, actor) => {
        heard.push(actor.id);
      });
    const maker = new ActorBuilder({id: 'maker', name: 'Maker'})
      .useTraits([PositionalTrait])
      .on(RemovedEvent, world => {
        world.addActor(made, 'made');
      });
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(maker, 'maker');
    world.tick(1 / 60);

    world.removeActor('maker');
    world.tick(1 / 60);

    expect(heard).toEqual(['made']);
  });

  it('tells what a creation handler makes in the same breath', () => {
    const heard: string[] = [];
    const bar = new ActorBuilder({id: 'bar', name: 'Bar'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, (_world, actor) => {
        heard.push(actor.id);
      });
    const template = new ActorBuilder({id: 'thing', name: 'Thing'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, (world, actor) => {
        heard.push(actor.id);
        world.addActor(bar, `${actor.id}'s bar`);
      });
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');

    world.renderSnapshot();

    expect(heard).toEqual(['one', "one's bar"]);
  });

  it('makes an actor that makes itself one frame’s worth at a time', () => {
    // A round per generation, and a bound on the rounds, so a picture is
    // never waited on forever.
    let made = 0;
    const template: ActorBuilder = new ActorBuilder({id: 'egg', name: 'Egg'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, world => {
        made++;
        world.addActor(template);
      });
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'first');

    world.renderSnapshot();
    const once = made;
    world.renderSnapshot();

    expect(once).toBeGreaterThan(1);
    expect(once).toBeLessThan(100);
    // The rest were not lost: the next call goes on from there.
    expect(made).toBe(once * 2);
  });

  it('is not told once it is gone', () => {
    const {heard, template} = counter();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');
    world.removeActor('one');

    world.tick(1 / 60);

    expect(heard).toEqual([]);
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
    // Placed before there is a tick, which is where the starter's actors
    // come from: told at the first tick, if nothing drew it first.
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

/** An actor that counts the times it hears it is going. */
const leaver = () => {
  const heard: string[] = [];
  const template = new ActorBuilder({id: 'thing', name: 'Thing'})
    .useTraits([PositionalTrait])
    .on(RemovedEvent, (_world, actor) => {
      heard.push(actor.id);
    });
  return {heard, template};
};

describe('an actor being removed', () => {
  it('hears about it on the tick after it goes', () => {
    const {heard, template} = leaver();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');
    world.tick(1 / 60);

    world.removeActor('one');
    expect(heard).toEqual([]);

    world.tick(1 / 60);
    expect(heard).toEqual(['one']);
  });

  it('hears it once when a handler removes it mid-tick', () => {
    // The ordinary way an actor goes: something in a handler or a step takes
    // it out, which defers the removal to the end of that tick. Both paths
    // pass through `detach`, and neither may raise this twice.
    const {heard, template} = leaver();
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    const actor = world.addActor(template, 'one');
    actor.on(CreatedEvent, one => {
      one.removeActor(actor);
    });

    for (let frame = 0; frame < 5; frame++) {
      world.tick(1 / 60);
    }

    expect(heard).toEqual(['one']);
  });

  it('lets a handler take its company with it', () => {
    // The case the event exists for: an actor that placed something when it
    // arrived removes it when it goes, and the world is left with neither.
    const bar = new ActorBuilder({id: 'bar', name: 'Bar'}).useTraits([
      PositionalTrait,
    ]);
    let placed: {id: string} | undefined;
    const template = new ActorBuilder({id: 'thing', name: 'Thing'})
      .useTraits([PositionalTrait])
      .on(CreatedEvent, world => {
        placed = world.addActor(bar);
      })
      .on(RemovedEvent, world => {
        if (placed) {
          world.removeActor(placed as never);
        }
      });
    const world = new WorldBuilder({id: 'w', name: 'w'}).instantiate();
    world.addActor(template, 'one');
    world.tick(1 / 60);
    expect([...world.actors].length).toBe(2);

    world.removeActor('one');
    world.tick(1 / 60);
    world.tick(1 / 60);

    expect([...world.actors].length).toBe(0);
  });
});
