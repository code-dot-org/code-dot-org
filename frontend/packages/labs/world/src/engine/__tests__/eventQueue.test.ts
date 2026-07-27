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
