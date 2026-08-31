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

  it('names a carried thing in the game’s own word', () => {
    // A string, and writable: what a thing IS is the project's to set, on the
    // actor or in the map editor, and two kinds of key is a distinction only
    // the game can draw.
    const name = meta.properties.find(property => property.id === 'what_it_is');

    expect(name?.type).toBe('string');
    expect(name?.readonly).toBe(false);
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

  it('offers having, counting and spending', () => {
    expect(meta.actions.map(action => action.id).sort()).toEqual([
      'spends_a',
      'takes',
    ]);
    expect(meta.queries.map(query => query.id).sort()).toEqual([
      'has_a',
      'has_how_many',
    ]);
  });

  it('says when a thing is used, and not when one is taken', () => {
    // Taking is something the project just did, and telling it what it has
    // done is noise. Spending is a moment a door has been waiting for.
    expect(meta.events.map(event => event.id)).toEqual(['uses_a']);
  });

  it('runs no steps at all', () => {
    // Nothing happens every frame: a bag is state, and everything that changes
    // it is something the project said.
    expect(meta.steps).toEqual([]);
  });
});
