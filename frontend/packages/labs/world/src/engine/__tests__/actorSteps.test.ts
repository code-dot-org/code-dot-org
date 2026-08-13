// What a KIND of actor does every frame, without a rule to do it in.
//
// The behaviour half of `ActorBuilder.defineProperty`, and the same bargain it
// struck: a rule is what you write when the thing is shared between kinds,
// elected, or answerable by `has trait`, and a `.rule` file is more ceremony
// than a thing that is none of those deserves. An actor could already remember
// something without a rule; now it can DO something without one.
//
// What these pin is the part that is easy to get wrong and invisible when it
// is: how many times a step runs, when it joins the order, and whether it is
// still there when the actors of its kind arrive later.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';

/** A kind that counts its own frames in a property of its own. */
const counter = (id: string) => {
  const template = new ActorBuilder({id, name: id});
  const ticks = template.defineProperty(`${id}_ticks`, 'number', 0);
  template.defineStep('count', 'decide', actor => {
    actor.set(ticks, actor.get(ticks) + 1);
  });
  return {template, ticks};
};

describe('an actor kind’s own steps', () => {
  it('runs once per actor of the kind, per frame', () => {
    const {template, ticks} = counter('mote');
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    const first = world.addActor(template, 'a', 'motes');
    const second = world.addActor(template, 'b', 'motes');

    world.tick(0.1);
    world.tick(0.1);

    expect(first.get(ticks)).toBe(2);
    expect(second.get(ticks)).toBe(2);
  });

  it('is ONE entry in the order however many actors there are', () => {
    // Thirty-one ground tiles are one step that walks them, not thirty-one
    // steps: the order is a topological sort and a scheduler full of identical
    // entries is a scheduler nobody can read.
    const {template} = counter('tile');
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    const before = world.stepOrder().length;
    for (let i = 0; i < 5; i++) {
      world.addActor(template, `t${i}`, 'tiles');
    }

    expect(world.stepOrder().length).toBe(before + 1);
  });

  it('sweeps up an actor placed after the step was registered', () => {
    // The reason the step walks `ofType` rather than closing over a list: a
    // spawn is the commonest way an actor arrives, and a body that only ever
    // ran for the actors present at load would be a mechanic that stops working
    // the moment the game does something.
    const {template, ticks} = counter('spark');
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    world.addActor(template, 'first', 'sparks');
    world.tick(0.1);

    const late = world.addActor(template, 'second', 'sparks');
    world.tick(0.1);

    expect(late.get(ticks)).toBe(1);
  });

  it('binds the actor, the world and the frame time', () => {
    // What a body written in an `.actor` file needs to mean what it says:
    // `this actor` is this one, and `delta` is this frame.
    const seen: Array<[string, string, number]> = [];
    const template = new ActorBuilder({id: 'probe', name: 'Probe'});
    template.defineStep('look', 'decide', (actor, world, delta) => {
      seen.push([actor.id, world.id, delta]);
    });
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    world.addActor(template, 'one', 'probes');

    world.tick(0.25);

    expect(seen).toEqual([['one', 'w', 0.25]]);
  });

  it('runs in the phase it named, among the rules’ own steps', () => {
    // The whole reason a step names a phase rather than a neighbour. A kind
    // that moves itself has to run before the movement is drawn, and saying
    // "during decide" is how it says so without knowing Physics exists.
    const template = new ActorBuilder({id: 'walker', name: 'Walker'});
    template.defineStep('walk', 'decide', actor => {
      actor.set(
        PositionProperty,
        new Vector(actor.get(PositionProperty).x + 1, 0),
      );
    });
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    const walker = world.addActor(template, 'w1', 'walkers');

    world.tick(0.1);

    expect(walker.get(PositionProperty).x).toBe(1);
    expect(
      world
        .stepOrder()
        .filter(step => step.ownerId === 'walkers')
        .map(step => step.order),
    ).toEqual([{kind: 'phase', phase: 'decide'}]);
  });

  it('adds nothing for a kind that declared none', () => {
    // Every actor goes through this path, so the common answer has to cost
    // nothing and leave the order alone.
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    const before = world.stepOrder().length;
    world.addActor(new ActorBuilder({id: 'plain', name: 'Plain'}), 'p');

    expect(world.stepOrder().length).toBe(before);
  });
});
