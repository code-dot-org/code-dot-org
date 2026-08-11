// Watching a property change — the alternative to a step that checks every
// actor every frame and remembers what it saw last time (core/watchProperty).

import {describe, expect, it} from 'vitest';

import {watchProperty} from '../core/watchProperty';
import {ActorBuilder, RuleBuilder, Vector, WorldBuilder} from '../index';

// A rule of this test's own, so the watchers it registers are not left on a
// property the rest of the suite shares. A watcher is registered against the
// PROPERTY and never unsubscribed, which is the whole reason for that care.
function makeTrait(id: string) {
  const rule = new RuleBuilder({id: `r_${id}`, name: `R ${id}`});
  const trait = rule.addTrait({id: `t_${id}`, name: `T ${id}`});
  return {rule, trait};
}

function placed(trait: ReturnType<typeof makeTrait>['trait'], rule: unknown) {
  void rule;
  const builder = new WorldBuilder({id: `w_${trait.id}`, name: 'W'});
  builder.getWorld();
  return builder.addActor(
    new ActorBuilder({id: `a_${trait.id}`, name: 'A'}).useTraits([trait]),
  );
}

describe('watchProperty', () => {
  it('reports the value before and the value after', () => {
    const {rule, trait} = makeTrait('before_after');
    const score = trait.addProperty('score', 'number', 0);
    const seen: Array<[number, number]> = [];
    watchProperty(score, (_actor, previous, next) => {
      seen.push([previous, next]);
    });
    rule.build();

    const actor = placed(trait, rule);
    actor.set(score, 3);
    actor.set(score, 7);

    expect(seen).toEqual([
      [0, 3],
      [3, 7],
    ]);
  });

  it('reports the STORED values, not what was handed to set', () => {
    // `Traited.set` coerces, and a watcher comparing the two must be comparing
    // stored values or it sees changes that did not happen — a point property
    // handed a plain `{x, y}` would otherwise look different from the Vector
    // sitting in the slot every single time.
    const {rule, trait} = makeTrait('coerced');
    const where = trait.addProperty('where', 'point', new Vector(0, 0));
    const seen: Array<[unknown, unknown]> = [];
    watchProperty(where, (_actor, previous, next) => {
      seen.push([previous, next]);
    });
    rule.build();

    const actor = placed(trait, rule);
    actor.set(where, {x: 4, y: 5} as unknown as Vector);

    const [[previous, next]] = seen;
    expect(previous).toBeInstanceOf(Vector);
    expect(next).toBeInstanceOf(Vector);
    expect((next as Vector).x).toBe(4);
  });

  it('is told about the actor it happened to', () => {
    const {rule, trait} = makeTrait('subject');
    const flag = trait.addProperty('flag', 'boolean', false);
    const who: string[] = [];
    watchProperty(flag, actor => who.push(actor.id));
    rule.build();

    placed(trait, rule).set(flag, true);

    expect(who).toEqual(['a_t_subject']);
  });

  it('runs every watcher on the property, in registration order', () => {
    const {rule, trait} = makeTrait('several');
    const count = trait.addProperty('count', 'number', 0);
    const order: string[] = [];
    watchProperty(count, () => order.push('first'));
    watchProperty(count, () => order.push('second'));
    rule.build();

    placed(trait, rule).set(count, 1);

    expect(order).toEqual(['first', 'second']);
  });

  it('leaves an unwatched property alone', () => {
    // The case the hot path is for: `Actor.set` on a property nobody watches
    // reads one field and does what it always did.
    const {rule, trait} = makeTrait('unwatched');
    const plain = trait.addProperty('plain', 'number', 0);
    rule.build();

    const actor = placed(trait, rule);
    actor.set(plain, 9);

    expect(plain.watch).toBeUndefined();
    expect(actor.get(plain)).toBe(9);
  });
});
