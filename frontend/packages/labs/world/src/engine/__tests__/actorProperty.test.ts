// `actor` and `actors`: the same stored value, told apart by what they SAY.
//
// The distinction is there for the block surface — a list gets `add … to` and
// `remove … from`, one actor does not — and the trap is letting that difference
// leak into how the value is held. It is not held differently. What these pin
// is the narrowing that makes "one" true, and the two ways it could quietly
// stop being true.

import {describe, expect, it} from 'vitest';

import type {ActorValue} from '../core/actorValue';
import {ActorBuilder, RuleBuilder, WorldBuilder, all} from '../index';

function makeWorld() {
  const rule = new RuleBuilder({id: 'r', name: 'R'});
  const trait = rule.addTrait({id: 't', name: 'T'});
  // Typed through `ActorValue`, which is what both properties hold: the empty
  // default is a list either way, and `set` takes one actor or several.
  const one = trait.addProperty<ActorValue>('one', 'actor', [], {name: 'one'});
  const many = trait.addProperty<ActorValue>('many', 'actors', [], {
    name: 'many',
  });
  rule.build();

  const builder = new WorldBuilder({id: 'w', name: 'W'});
  builder.getWorld();
  const holder = builder.addActor(
    new ActorBuilder({id: 'holder', name: 'Holder'}).useTraits([trait]),
  );
  const a = builder.addActor(new ActorBuilder({id: 'a', name: 'A'}));
  const b = builder.addActor(new ActorBuilder({id: 'b', name: 'B'}));
  return {holder, a, b, one, many};
}

describe('an `actor` property', () => {
  it('keeps one of the actors it is handed', () => {
    // `set actor to follow of ⟨camera⟩ to ⟨any Player⟩` is a reasonable thing
    // to write in a game with one player, and nothing stops it in a game with
    // three. Taking one is the reasonable answer; holding three under a name
    // that says one is not.
    const {holder, a, b, one} = makeWorld();

    holder.set(one, [a, b]);

    expect(all(holder.get(one))).toEqual([a]);
  });

  it('holds it as a list, like `actors` does', () => {
    // Not a bare Actor, and this is the reason: `WorldLab.all` wraps a non-array
    // in `[value]`, so an EMPTY one held as `undefined` reads back as one actor
    // that is not an actor. A camera would have a target when it has none.
    const {holder, one} = makeWorld();

    expect(Array.isArray(holder.get(one))).toBe(true);
    expect(all(holder.get(one))).toEqual([]);
  });

  it('takes one actor as readily as a list of one', () => {
    const {holder, a, one} = makeWorld();

    holder.set(one, a);

    expect(all(holder.get(one))).toEqual([a]);
  });

  it('holds nothing when handed nothing', () => {
    const {holder, one} = makeWorld();

    holder.set(one, []);

    expect(all(holder.get(one))).toEqual([]);
  });

  it('leaves `actors` holding everything', () => {
    // The other half of the same statement: narrowing is what `actor` is for,
    // and a contact set that lost all but the first would be useless.
    const {holder, a, b, many} = makeWorld();

    holder.set(many, [a, b]);

    expect(all(holder.get(many))).toEqual([a, b]);
  });

  it('is left out of the snapshot, like `actors`', () => {
    // An actor reaches the world and the world reaches its actors, so a
    // baseline holding one could not be stringified. Adding a second
    // actor-shaped type and forgetting this line is how that comes back.
    const {holder, a, one} = makeWorld();
    holder.set(one, a);

    expect(() => JSON.stringify(holder.world!.snapshot())).not.toThrow();
    expect(JSON.stringify(holder.world!.snapshot())).not.toContain('"one"');
  });
});
