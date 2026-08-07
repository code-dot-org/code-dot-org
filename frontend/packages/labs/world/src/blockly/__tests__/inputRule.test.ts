// The default project's `rules/input.rule` — the keyboard, turned into events.
//
// It is the smallest rule in the stock library and the reason the Engine
// category exists: the World knows which keys changed since the last frame, and
// nothing else can. Everything above that — "a key is pressed", fanned out to
// every actor, carrying which key it was — is written in blocks now, so this
// checks the rule really declares those events and really emits them.

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

// Its `use rule`s name other rules of this project, which have to be registered
// before a module can be generated from it — the same call the editor makes.
registerDefaultProjectRules();

const source = starterFile('inputRule').contents;
const meta = parseRuleMeta('rules/input', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/input.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(starterFile('inputRule').name).toBe('input.rule');
    expect(source).not.toContain('world-lab');
  });

  it('declares the key events at rule level, with no trait to elect', () => {
    // A key press belongs to nobody. Every actor can hear these, which is why
    // they hang off the rule rather than off a trait — and why the parser has
    // to read a `define event` chained under the rule root at all.
    expect(meta.name).toBe('Input');
    expect(meta.ability).toBe('Responds to Input');
    expect(meta.traits).toEqual([]);
    expect(meta.events.map(event => event.ref.exportName)).toEqual([
      'IsPressedEvent',
      'IsReleasedEvent',
    ]);
    expect(module_).toContain('export const IsPressedEvent = rule.addEvent(');
  });

  it('signs its events with the key, so a handler filters on one', () => {
    // The phrasing is "⟨a key⟩ is pressed" — a choice from `Engine#Key` and
    // then the wording — so the hat carries a dropdown and the handler it
    // generates runs for that key alone (specs/ENUMS.md).
    expect(meta.events[0].parts).toEqual([
      {kind: 'param', name: 'pressed key', type: 'enum:Engine#Key'},
      {kind: 'label', text: 'is pressed'},
    ]);
    expect(meta.events[1].parts?.[1]).toEqual({
      kind: 'label',
      text: 'is released',
    });
  });

  it('senses, before anything decides on what it found', () => {
    // It reports and does not act, which used to be said by leaving it
    // unordered — and left it unordered against everything that READS the keys,
    // working only because this rule happened to load first. `sense` is the
    // first moment of the frame, so now it is said rather than relied upon.
    const [step] = meta.steps;
    expect(meta.steps).toHaveLength(1);
    expect(step.order.kind).toBe('phase');
    expect(step.order.phase).toBe('sense');
  });
});

describe('the emitted module', () => {
  // The body is generated from blocks by the headless generator, not here, so
  // what this file can check is the declarations the project references. The
  // emitting itself is checked in the browser (a key press reaching a handler).
  it('needs no other rule', () => {
    // Reading the keyboard is the World's, not a rule's: `rules/arrows` polls
    // it without requiring this, and this requires nothing to raise events.
    expect(meta.requires).toEqual([]);
  });
});
