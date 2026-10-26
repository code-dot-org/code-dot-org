// `world.act(…)` where `world` is the DESCRIPTION rather than the game.
//
// A rule's world action generates `world.act(ref, …)`, and inside a `.world`
// file that name is a `WorldBuilder`. It had no `act`, so every world action
// every rule offers — `add ⟨1⟩ to the score`, `win the game`, `make ⟨the box⟩
// say the next thing — was a block the palette handed over and the module threw
// on the moment a learner ran it: `world.act is not a function`. Nothing warned,
// because `worldContextExtension` asks whether `world` is BOUND and it is,
// to the wrong thing (specs/PROGRESSION.md).
//
// `builderSurface` now refuses the method being absent at all. What is here is
// the half a surface check cannot see: WHEN an action belongs to the
// description and when it is merely something that happened while the game ran.

import {describe, expect, it} from 'vitest';

import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../index';

/** A rule with one world action and one step, both of which count their calls. */
const countingRule = () => {
  const rule = new RuleBuilder({id: 'counting', name: 'Counts'});
  const done: string[] = [];
  const bump = rule.addAction('bump', () => {
    done.push('bump');
  });
  let duringTick: (() => void) | undefined;
  rule.addStep('run', () => {
    duringTick?.();
  });
  return {
    rule: rule.build(),
    bump,
    done,
    /** Run `body` from inside a tick, which is where a handler runs. */
    inTick: (body: () => void) => {
      duringTick = body;
    },
  };
};

describe('a world action taken while the world is described', () => {
  it('happens, rather than throwing at the block that asked', () => {
    // Deferred like every other described call, so it lands when the world it
    // describes exists — which is before anything can observe the difference,
    // since a `define world` body has no way to look at the world it is still
    // describing.
    const {rule, bump, done} = countingRule();
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([rule]);

    expect(() => builder.act(bump)).not.toThrow();
    builder.getWorld();

    expect(done).toEqual(['bump']);
  });

  it('is part of what the world IS, so a fresh one gets it too', () => {
    // The reason it has to be logged: a check runs `instantiate()` rather than
    // the world the learner has been playing, and a setup that added ten to the
    // score has to have added ten there as well.
    const {rule, bump, done} = countingRule();
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([rule]);

    builder.act(bump);
    done.length = 0;
    builder.instantiate();

    expect(done).toEqual(['bump']);
  });
});

describe('a world action taken while the world is running', () => {
  it('happens once and is not remembered', () => {
    // A `.world` file's handler closes over the same builder, so `add 1 to the
    // score` on every click lands here. Logging those would grow the
    // description by one entry per click for the life of the game, and replay
    // every one of them into the next world made from it.
    const {rule, bump, done, inTick} = countingRule();
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([rule]);
    const world = builder.getWorld();
    inTick(() => {
      builder.act(bump);
    });

    for (let frame = 0; frame < 5; frame++) {
      world.tick(1 / 60);
    }
    expect(done).toEqual(['bump', 'bump', 'bump', 'bump', 'bump']);

    done.length = 0;
    builder.instantiate();
    expect(done).toEqual([]);
  });
});
