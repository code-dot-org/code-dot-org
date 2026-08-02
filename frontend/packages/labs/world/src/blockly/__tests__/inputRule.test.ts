// The default project's `rules/input.rule` — the keyboard, turned into events.
//
// It is the smallest rule in the stock library and the reason the Engine
// category exists: the World knows which keys changed since the last frame, and
// nothing else can. Everything above that — "a key is pressed", fanned out to
// every actor, carrying which key it was — is written in blocks now, so this
// checks the rule really declares those events and really emits them.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../../constants';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

const source = DEFAULT_PROJECT.source.files.inputRule.contents;
const meta = parseRuleMeta('rules/input', source)!;
const module_ = ruleMetaToModule(meta);

describe('rules/input.rule', () => {
  it('ships as a .rule, not a shim', () => {
    expect(DEFAULT_PROJECT.source.files.inputRule.name).toBe('input.rule');
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
      'AKeyIsPressedEvent',
      'AKeyIsReleasedEvent',
    ]);
    expect(module_).toContain(
      'export const AKeyIsPressedEvent = rule.addEvent(',
    );
  });

  it('runs every tick, unordered — it reports, it does not act', () => {
    const [step] = meta.steps;
    expect(meta.steps).toHaveLength(1);
    expect(step.order.kind).toBe('free');
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
