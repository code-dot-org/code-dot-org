// A placement's overrides land on the actor drawn for it — the kind's own
// properties included, which is the case that was silently skipped.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../../engine/builders/ActorBuilder';
import {AppearanceTrait, SpriteProperty} from '../../engine/rules/animation';
import {applyPlacementOverrides, placementSlots} from '../placementOverrides';

const template = (id: string) => new ActorBuilder({id, name: id});

describe('applyPlacementOverrides', () => {
  it('sets a property the kind declared for itself', () => {
    // THE BUG. A Label's `text` belongs to no trait, and a lookup over the
    // actor's traits alone never found it: every Label on a map drew the
    // kind's default words whatever its placement said.
    const label = template('Label');
    const Text = label.defineProperty('text', 'string', 'LABEL');
    const actor = label.instantiate('a');
    applyPlacementOverrides(actor, {Label: {text: 'WHAT IS YOUR NAME?'}});
    expect(actor.get(Text)).toBe('WHAT IS YOUR NAME?');
  });

  it('finds an inherited property under the kind that declared it', () => {
    // A Button ACTS LIKE a Label, and its `text` is keyed under `Label` in a
    // map — where `acts like` found it, and where the inspector writes it.
    const label = template('Label');
    const Text = label.defineProperty('text', 'string', 'LABEL');
    const button = template('Button').actsLike(label);
    const actor = button.instantiate('b');
    applyPlacementOverrides(actor, {Label: {text: 'SAY HELLO'}});
    expect(actor.get(Text)).toBe('SAY HELLO');
  });

  it('still sets a trait’s property, by its owner', () => {
    const actor = template('Coin')
      .useTraits([AppearanceTrait])
      .instantiate('c');
    const key = `${SpriteProperty.ownerId}.${SpriteProperty.id}`;
    expect(placementSlots(actor).has(key)).toBe(true);
    applyPlacementOverrides(actor, {
      [SpriteProperty.ownerId]: {[SpriteProperty.id]: 'coin.png'},
    });
    expect(actor.get(SpriteProperty)).toBe('coin.png');
  });

  it('skips a path the actor has no slot for', () => {
    // A placement saved against a rule the project has since dropped is a
    // picture to draw anyway, not an error to raise.
    const label = template('Label');
    const Text = label.defineProperty('text', 'string', 'LABEL');
    const actor = label.instantiate('a');
    expect(() =>
      applyPlacementOverrides(actor, {
        Patrol: {speed: 3},
        Label: {colour: '#fff', text: 'KEPT'},
      }),
    ).not.toThrow();
    expect(actor.get(Text)).toBe('KEPT');
  });

  it('leaves an actor-typed value alone, since it names a placement', () => {
    const bar = template('Health_Bar');
    const Subject = bar.defineProperty('subject', 'actor', '');
    const actor = bar.instantiate('h');
    const before = actor.get(Subject);
    applyPlacementOverrides(actor, {Health_Bar: {subject: 'Hero'}});
    expect(actor.get(Subject)).toEqual(before);
  });

  it('takes nothing as no overrides', () => {
    const actor = template('Label').instantiate('a');
    expect(() => applyPlacementOverrides(actor, undefined)).not.toThrow();
  });
});
