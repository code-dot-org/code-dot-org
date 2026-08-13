// "Shows Text" — a rule that declares state and runs nothing.
//
// The first of those in the lab, and the thing worth pinning: a rule with no
// steps parses, generates a module, and can be elected. Nothing forbade it and
// nothing had done it, so the shape was unproven until the stock Label needed
// it (specs/UI_ACTORS.md).

import {describe, expect, it} from 'vitest';

import {parseRuleMeta, ruleMetaToModule} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {textRule} from '../stock/text';

const meta = parseRuleMeta('rules/text', textRule)!;

describe('rules/text.rule', () => {
  it('runs nothing at all', () => {
    // Nothing about text happens over time. What an actor DOES with its words
    // is its own `define drawing`, which is why the Label and the Button are
    // ordinary actors rather than anything this rule knows about.
    expect(meta.name).toBe('Text');
    expect(meta.ability).toBe('Shows Text');
    expect(meta.steps).toEqual([]);
    expect(meta.events).toEqual([]);
    expect(meta.requires).toEqual([]);
  });

  it('declares one trait, and every property on it', () => {
    // ACTOR-SCOPED, all four, which is what makes them per-instance: two
    // Labels of one kind can say different things, and the map editor's
    // inspector shows a field for each with no editor work (`describeActor`).
    expect(meta.traits.map(trait => trait.name)).toEqual(['Shows Text']);
    expect(
      meta.properties.map(property => [property.name, property.type]),
    ).toEqual([
      ['text', 'string'],
      ['text size', 'number'],
      ['text color', 'string'],
      ['text anchor', 'string'],
    ]);
    for (const property of meta.properties) {
      expect(property.scope).toBe('actor');
      expect(property.ownerTraitId).toBe('Shows_Text');
    }
  });

  it('generates a module a project can import', () => {
    // The half a rule with no steps could have failed at: `ruleMetaToModule`
    // writes a builder and its members, and an empty step list must produce a
    // module rather than nothing.
    const module_ = ruleMetaToModule(meta);

    expect(module_).toContain('export const ShowsTextTrait = rule.addTrait(');
    expect(module_).toContain('export const TextProperty =');
    expect(module_).toContain('export default rule.build()');
  });

  it('starts empty, at a readable size, in white, centred', () => {
    // An actor that has not been given words has none — a Label placed and left
    // alone draws nothing rather than the word "text". The rest are defaults a
    // learner overrides per placement.
    const defaults = Object.fromEntries(
      meta.properties.map(property => [property.name, property.default]),
    );
    expect(defaults).toEqual({
      text: '',
      'text size': 12,
      'text color': '#ffffff',
      'text anchor': 'centre',
    });
  });

  it('is in the library, and says what it gives', () => {
    const stock = STOCK_RULES.find(rule => rule.id === 'text');

    expect(stock?.provides).toEqual(['Shows Text']);
  });
});
