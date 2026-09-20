import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';

// Events are queued during a tick and dispatched after it (DESIGN.md), so a
// handler never runs while the simulation is still mutating state.
describe('deferred event dispatch', () => {
  it('runs handlers after the tick, not during the emitting step', () => {
    let handlerRan = false;
    let observedDuringStep: boolean | null = null;

    const r = new RuleBuilder({id: 'emitter', name: 'Emitter'});
    const Marked = r.addTrait({id: 'marked', name: 'Marked'});
    const Ping = r.addEvent('ping');
    r.addStep('emit', world => {
      for (const actor of world.actors.with(Marked)) {
        world.emit(Ping, actor);
      }
      // The handler must not have run yet — the emit only queued it.
      observedDuringStep = handlerRan;
    });
    const Rule = r.build();

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([Marked])
      .instantiate();
    world.addActor(actor);
    actor.on(Ping, () => {
      handlerRan = true;
    });

    world.tick(1);
    expect(observedDuringStep).toBe(false);
    expect(handlerRan).toBe(true);
  });

  it('defers an event raised inside a handler to the next tick', () => {
    let runs = 0;
    let stepEmits = true;

    const r = new RuleBuilder({id: 'emitter2', name: 'Emitter2'});
    const Marked = r.addTrait({id: 'marked', name: 'Marked'});
    const Ping = r.addEvent('ping');
    r.addStep('emit', world => {
      if (!stepEmits) {
        return;
      }
      stepEmits = false; // emit from the step only on the first tick
      for (const actor of world.actors.with(Marked)) {
        world.emit(Ping, actor);
      }
    });
    const Rule = r.build();

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([Marked])
      .instantiate();
    world.addActor(actor);
    // Each handler run re-emits; the re-emit must land on the NEXT tick's flush.
    actor.on(Ping, () => {
      runs += 1;
      world.emit(Ping, actor);
    });

    world.tick(1);
    expect(runs).toBe(1); // the step's emit, dispatched once
    world.tick(1);
    expect(runs).toBe(2); // the handler's re-emit, dispatched now — not looped
  });
});

// An event carries as many values as its signature names
// (specs/EVENT_VALUES_PLAN.md). The queue holds a list; a handler is called
// with it spread, so one value is the call every rule in the library makes and
// several is the same call with more in it.
describe('what an event carries', () => {
  it('hands an actor handler every value, in order', () => {
    const seen: unknown[][] = [];

    const r = new RuleBuilder({id: 'carrier', name: 'Carrier'});
    const Marked = r.addTrait({id: 'marked', name: 'Marked'});
    const Damaged = r.addEvent('damaged');
    const Rule = r.build();

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([Marked])
      .instantiate();
    world.addActor(actor);
    actor.on(Damaged, (_world, _actor, ...values) => {
      seen.push(values);
    });

    world.emit(Damaged, actor, 'spikes', 3);
    world.tick(1);
    expect(seen).toEqual([['spikes', 3]]);
  });

  it('hands a world handler every value, with no subject in front', () => {
    const seen: unknown[][] = [];

    const r = new RuleBuilder({id: 'carrier2', name: 'Carrier2'});
    const Cleared = r.addEvent('cleared');
    const Rule = r.build();

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .instantiate();
    world.on(Cleared, (_world, ...values) => {
      seen.push(values);
    });

    world.emitToWorld(Cleared, 2, 'fast');
    world.tick(1);
    expect(seen).toEqual([[2, 'fast']]);
  });

  it('carries nothing, and one thing, as it always did', () => {
    const seen: unknown[][] = [];

    const r = new RuleBuilder({id: 'carrier3', name: 'Carrier3'});
    const Marked = r.addTrait({id: 'marked', name: 'Marked'});
    const Ping = r.addEvent('ping');
    const Rule = r.build();

    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([Marked])
      .instantiate();
    world.addActor(actor);
    actor.on(Ping, (_world, _actor, ...values) => {
      seen.push(values);
    });

    world.emit(Ping, actor);
    world.emit(Ping, actor, 7);
    world.tick(1);
    // Nothing is an empty list, not a list holding `undefined`: a handler
    // asking `arguments.length` gets the truth about what was raised.
    expect(seen).toEqual([[], [7]]);
  });
});
