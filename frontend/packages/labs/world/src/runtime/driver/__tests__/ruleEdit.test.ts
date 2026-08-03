// An edited `.rule` must not run its old code.
//
// The sibling of `handlerRemoval.test.ts`, and the same trap: a patch keeps the
// RUNNING world, which holds the Rule objects it was built with — steps the
// scheduler already ordered, actions the learner's blocks already point at.
// `ruleIds` says which rules are in play, so a rule that was EDITED rather than
// added or removed compares equal, and a rebuild carrying one patchable change
// alongside it would patch: the learner watches the game keep running the code
// they just replaced, told that the change was applied live.

import {describe, expect, it} from 'vitest';

import {WorldBuilder, type World} from '../../../engine';
import {RuleBuilder} from '../../../engine/builders/RuleBuilder';
import {reconcile} from '../reconcile';

/**
 * A one-rule world whose single step is `run`, with `count` as a world property
 * a rebuild can differ in.
 *
 * The property is the point: a rebuild with nothing patchable in it restarts
 * anyway, so the hole only opens when an ordinary value change rides along.
 */
function build(run: () => void, count = 1): World {
  const rule = new RuleBuilder({id: 'counter', name: 'Counts'});
  const property = rule.addProperty('count', 'number', 0, {name: 'count'});
  rule.addStep('tick', run);
  const built = rule.build();
  return new WorldBuilder({id: 'w', name: 'W'})
    .useRules([built])
    .set(property, count)
    .instantiate();
}

describe('editing a rule', () => {
  it('restarts rather than patching, so the old step stops', () => {
    let ran = 0;
    const running = build(() => {
      ran++;
    });
    const baseline = running.snapshot();

    // The rebuild: same rule, new step body, and one value changed with it.
    const incoming = build(() => undefined, 2);

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
    // On a restart the caller drops `running` for `incoming`, whose step is the
    // new one. Ticking the old world is what a patch would have left us doing.
    incoming.tick(1 / 60);
    expect(ran).toBe(0);
  });

  it('restarts when a step only MOVED', () => {
    // Same two steps, same bodies, opposite order. The scheduler resolved the
    // running world's order once, at build; nothing patches a total order.
    const twoSteps = (anchorFirst: boolean, count: number): World => {
      const rule = new RuleBuilder({id: 'counter', name: 'Counts'});
      const property = rule.addProperty('count', 'number', 0, {name: 'count'});
      const anchor = rule.addStep('anchor', () => undefined);
      const move = anchorFirst ? rule.addStepAfter : rule.addStepBefore;
      move.call(rule, 'other', anchor, () => undefined);
      return new WorldBuilder({id: 'w', name: 'W'})
        .useRules([rule.build()])
        .set(property, count)
        .instantiate();
    };
    // The value change rides along, as above: without one this would restart
    // whatever the step order, and prove nothing.
    const running = twoSteps(true, 1);

    expect(
      reconcile(running, twoSteps(false, 2), running.snapshot()).mode,
    ).toBe('restarted');
  });

  it('still patches when the rule is untouched', () => {
    // Narrow, like the handler guard: two builds of an unchanged file hash the
    // same, and a value edit still reaches the running game.
    const running = build(() => undefined);
    const baseline = running.snapshot();

    const incoming = build(() => undefined, 2);

    expect(reconcile(running, incoming, baseline).mode).toBe('reconciled');
    expect(running.snapshot().world['counter.count']).toBe(2);
  });
});
