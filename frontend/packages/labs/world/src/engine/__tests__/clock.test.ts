// The world's clock, and an actor's age measured against it.
//
// The one primitive a spawned thing needs to stop existing. A bullet, a spark,
// an invulnerability window and a fire-rate cooldown are all the same
// comparison against one of these two numbers, which is why they are numbers
// and not a timer.
//
// What these pin is mostly what the clock is NOT: not the wall clock, not
// re-read per step, and not started by making an actor.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../index';

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

describe('the world’s clock', () => {
  it('starts at zero', () => {
    expect(makeWorld().time()).toBe(0);
  });

  it('is the sum of the deltas it was ticked by', () => {
    // Not a reading of `performance.now()`. It has to agree exactly with
    // anything integrated from `delta` — a bullet that has flown `speed × 2`
    // must be two seconds old — and a clock sampled separately would drift from
    // that by however long each frame took to draw.
    const world = makeWorld();

    world.tick(0.5);
    world.tick(0.25);
    world.tick(0.25);

    expect(world.time()).toBe(1);
  });

  it('does not move while the world is not ticking', () => {
    // What "two seconds later" means to a learner: two seconds of game, not two
    // seconds of a paused tab. A paused world is one nobody ticks.
    const world = makeWorld();
    world.tick(0.5);

    expect(world.time()).toBe(0.5);
    expect(world.time()).toBe(0.5);
  });

  it('reads the same from every step in one frame', () => {
    // Load-bearing for the phase model: steps sharing a moment must commute, so
    // two steps that both ask the time have to get the same answer whichever
    // order the scheduler ran them in. A clock sampled per step would give them
    // different answers and make the order observable.
    const rule = new RuleBuilder({id: 'clock', name: 'Clock'});
    const seen: number[] = [];
    rule.addStepIn('first', 'decide', world => void seen.push(world.time()));
    rule.addStepIn('second', 'decide', world => void seen.push(world.time()));

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule.build()])
      .getWorld();
    world.tick(0.25);

    expect(seen).toEqual([0.25, 0.25]);
  });

  it('has already advanced when the frame’s steps run', () => {
    // The frame's steps compute the state at the END of the frame, so the time
    // they read is the time that state belongs to. Reading 0 during the first
    // tick would make an actor placed in it appear to be born in the future.
    const rule = new RuleBuilder({id: 'clock', name: 'Clock'});
    let during = -1;
    rule.addStepIn('read', 'decide', world => {
      during = world.time();
    });

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule.build()])
      .getWorld();
    world.tick(0.25);

    expect(during).toBe(0.25);
  });
});

describe('how old an actor is', () => {
  const place = (world: ReturnType<typeof makeWorld>, id: string) =>
    world.addActor(new ActorBuilder({id, name: id}));

  it('is zero the moment it is placed', () => {
    const world = makeWorld();
    world.tick(2);

    expect(place(world, 'a').age()).toBe(0);
  });

  it('counts from placement, not from the start of the world', () => {
    // The whole point for a spawned thing: an asteroid that appears at minute
    // three is newborn, not three minutes old.
    const world = makeWorld();
    world.tick(2);
    const late = place(world, 'late');
    world.tick(0.5);

    expect(late.age()).toBe(0.5);
    expect(world.time()).toBe(2.5);
  });

  it('is as old as the game for an actor placed before it started', () => {
    // What a `.world` file describes is placed before the first tick, so
    // something that has been there the whole time is as old as the game. Zero
    // would be wrong and undefined would be worse.
    const world = makeWorld();
    const early = place(world, 'early');
    world.tick(3);

    expect(early.age()).toBe(3);
  });

  it('gives two actors from one template different ages', () => {
    // Placement starts the clock, not instantiation — otherwise every bullet
    // fired from one definition would share a birthday.
    const world = makeWorld();
    const first = place(world, 'first');
    world.tick(1);
    const second = place(world, 'second');

    expect(first.age()).toBe(1);
    expect(second.age()).toBe(0);
  });

  it('is zero for an actor no world holds', () => {
    // Asking something that is not in the world how long it has been in the
    // world has a true answer, and it is none. Not a throw: the block reaches
    // here whenever a learner holds on to an actor that has been removed.
    const loose = new ActorBuilder({id: 'loose', name: 'Loose'}).instantiate();

    expect(loose.age()).toBe(0);
  });
});
