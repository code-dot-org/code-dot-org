// A property whose value is actors (specs/COLLISION.md).
//
// The kind that is not plain data: what a rule works out about who is where —
// a contact set, a group. Three things have to hold, and none of them is true
// of the other property kinds.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, RuleBuilder, WorldBuilder} from '..';

const rule = new RuleBuilder({id: 'touch', name: 'Touching'});
const Touching = rule.addTrait({id: 'touching', name: 'Can Touch'});
const ContactsProperty = Touching.addProperty<unknown>(
  'contacts',
  'actors',
  [],
);
const TouchRule = rule.build();

const world = () =>
  new WorldBuilder({id: 'w', name: 'W'}).useRules([TouchRule]).instantiate();
const actor = (id: string) =>
  new ActorBuilder({id, name: id}).useTraits([Touching]).instantiate(id);

describe('an actors property', () => {
  it('starts holding no actors', () => {
    expect(actor('a').get(ContactsProperty)).toEqual([]);
  });

  it('gives each actor its own list', () => {
    // A declaration's default is ONE value and every actor is seeded from it,
    // so sharing it would make one actor's contacts every actor's.
    const a = actor('a');
    const b = actor('b');

    (a.get(ContactsProperty) as unknown[]).push(actor('x'));

    expect(b.get(ContactsProperty)).toEqual([]);
  });

  it('holds a list even when set to one actor', () => {
    const a = actor('a');
    const other = actor('b');

    a.set(ContactsProperty, other);

    expect(a.get(ContactsProperty)).toEqual([other]);
  });

  it('keeps its own copy of what it is set to', () => {
    // So a rule that keeps filling the local it built the list in does not
    // keep changing what the property holds.
    const a = actor('a');
    const built = [actor('b')];

    a.set(ContactsProperty, built);
    built.push(actor('c'));

    expect(a.get(ContactsProperty)).toHaveLength(1);
  });
});

describe('the hot-reload baseline', () => {
  it('leaves actors properties out of it', () => {
    // An actor holds the world and the world holds its actors, so a baseline
    // containing one could not be stringified — and a set worked out this tick
    // is scratch, not state a rebuild should carry.
    const built = world();
    const a = actor('a');
    built.addActor(a);
    a.set(ContactsProperty, [actor('b')]);

    const snapshot = built.snapshot();

    expect(snapshot.actors.a).not.toHaveProperty('touching.contacts');
    // The whole point: this is what the reconciler does to it.
    expect(() => JSON.stringify(snapshot)).not.toThrow();
  });
});
