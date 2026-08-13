// "Shows Text" — a rule that declares state and runs nothing.
//
// Named `Writing` rather than `Text`, because a rule's name is its toolbox
// category and the toolbox already has a Text one — Blockly's, with the string
// literal in it.
//
// The first of those in the lab, and the thing worth pinning: a rule with no
// steps parses, generates a module, and can be elected. Nothing forbade it and
// nothing had done it, so the shape was unproven until the stock Label needed
// it (specs/UI_ACTORS.md).

import {describe, expect, it} from 'vitest';

import {
  parseDefault,
  parseRuleMeta,
  PROPERTY_TYPES,
  ruleMetaToModule,
} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {writingRule} from '../stock/writing';

const meta = parseRuleMeta('rules/writing', writingRule)!;

describe('rules/writing.rule', () => {
  it('runs nothing at all', () => {
    // Nothing about text happens over time. What an actor DOES with its words
    // is its own `define drawing`, which is why the Label and the Button are
    // ordinary actors rather than anything this rule knows about.
    expect(meta.name).toBe('Writing');
    expect(meta.ability).toBe('Shows Text');
    expect(meta.steps).toEqual([]);
    expect(meta.events).toEqual([]);
    expect(meta.requires).toEqual([]);
  });

  it('declares one trait, and every property on it', () => {
    // ACTOR-SCOPED, all four, which is what makes them per-instance: two
    // Labels of one kind can say different things, and the map editor's
    // inspector shows a field for each with no editor work (`describeActor`).
    //
    // The colour is its own TYPE rather than a string holding one, which is
    // what makes its getter report `Colour` and its inspector field a swatch.
    expect(meta.traits.map(trait => trait.name)).toEqual(['Shows Text']);
    expect(
      meta.properties.map(property => [property.name, property.type]),
    ).toEqual([
      ['text', 'string'],
      ['text size', 'number'],
      ['text color', 'color'],
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
    const stock = STOCK_RULES.find(rule => rule.id === 'writing');

    expect(stock?.provides).toEqual(['Shows Text']);
  });
});

describe('the color property type', () => {
  it('is a type, not a string that happens to hold one', () => {
    // What the type buys is the two places that ask what a property IS. A
    // block's socket takes a swatch and the getter reports `Colour`, so
    // `text color` plugs straight into `set fill`; and the map editor draws a
    // picker rather than six characters to type by hand.
    const color = meta.properties.find(
      property => property.name === 'text color',
    )!;

    expect(color.type).toBe('color');
    expect(color.default).toBe('#ffffff');
  });

  it('is offered when a learner declares one', () => {
    // A `define property` in any rule can be a colour, which is what makes this
    // a type in the language rather than a special case for one stock rule.
    expect(PROPERTY_TYPES.has('color')).toBe(true);
  });

  it('reads and writes it as the string it is', () => {
    // The engine is never told about colours: `#rrggbb` is what every colour
    // block produces and what `core/color` converts (engine/core/types).
    expect(parseDefault('#ff8800', 'color')).toBe('#ff8800');
    expect(ruleMetaToModule(meta)).toContain('"#ffffff"');
  });
});
