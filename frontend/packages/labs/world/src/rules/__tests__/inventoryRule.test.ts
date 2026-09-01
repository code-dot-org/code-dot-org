// "Carries Things" — what it declares, read rather than run.
//
// The shape worth pinning is the split from Collection: a record that only
// grows there, a bag that can go down here, and a name on the thing rather than
// a kind, because a rule cannot say the kinds a project invented.
// `stockRulesRun` covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {collectRule} from '../stock/collect';
import {inventoryRule} from '../stock/inventory';

const meta = parseRuleMeta('rules/inventory', inventoryRule)!;

describe('rules/inventory.rule', () => {
  it('keeps the bag where only the two verbs can change it', () => {
    const bag = meta.properties.find(property => property.id === 'things');

    expect(bag?.type).toBe('actors');
    expect(bag?.scope).toBe('actor');
    expect(bag?.readonly).toBe(true);
  });

  it('gives a carried thing no properties at all', () => {
    // What sort of thing it is, is its KIND — the same dropdown `is a ⟨Key⟩`
    // and `how many ⟨Coin⟩ in ⟨…⟩` offer. It was a string on the thing first,
    // and a string can be typed two ways with only the game running to say so.
    expect(meta.traits.map(trait => trait.id)).toContain('Can_Be_Carried');
    // The bag is the holder's and is the rule's only property; the thing being
    // carried has none of its own.
    expect(meta.properties.map(property => property.id)).toEqual(['things']);
  });

  it('takes a kind where it used to take a word', () => {
    // The parameter type that made this possible: a socket that is a dropdown
    // of the project's kinds, on a block a rule declared (`blockly/enums`,
    // ParamType).
    const asked = [...meta.actions, ...meta.queries].filter(member =>
      ['spends_a', 'has_a'].includes(member.id),
    );

    expect(asked).toHaveLength(2);
    for (const member of asked) {
      expect(
        member.params.map(param => param.type),
        member.id,
      ).toEqual(['kind']);
    }
  });

  it('has two sides, like the rule it is written beside', () => {
    // Collection's shape: one trait for the actor that does it and one for the
    // thing it is done to, so neither has to know about the other.
    expect(meta.traits.map(trait => trait.id).sort()).toEqual([
      'Can_Be_Carried',
      'Carries',
    ]);
    expect(
      parseRuleMeta('rules/collect', collectRule)!
        .traits.map(trait => trait.id)
        .sort(),
    ).toEqual(['Can_Be_Collected', 'Collects']);
  });

  it('offers having and spending, and leaves counting to the vocabulary', () => {
    // NO `has how many`: `how many ⟨Key⟩ in ⟨things of ⟨Player⟩⟩` says it
    // already, in a block a learner meets counting bricks, and a rule that
    // answered it again would be a private vocabulary beside the public one.
    expect(meta.actions.map(action => action.id).sort()).toEqual([
      'spends_a',
      'takes',
    ]);
    expect(meta.queries.map(query => query.id)).toEqual(['has_a']);
  });

  it('says when a thing is used, and not when one is taken', () => {
    // Taking is something the project just did, and telling it what it has
    // done is noise. Spending is a moment a door has been waiting for — and
    // what it carries is the THING, so a handler can show the key that opened
    // the door rather than a word for it.
    expect(meta.events.map(event => event.id)).toEqual(['uses_a_thing']);
    // …carrying the thing itself: an event's shape is its `parts`, and the one
    // parameter among them is an actor.
    expect(
      (meta.events[0].parts ?? [])
        .filter(part => part.kind === 'param')
        .map(part => (part as {type: string}).type),
    ).toEqual(['actor']);
  });

  it('runs no steps at all', () => {
    // Nothing happens every frame: a bag is state, and everything that changes
    // it is something the project said.
    expect(meta.steps).toEqual([]);
  });
});
