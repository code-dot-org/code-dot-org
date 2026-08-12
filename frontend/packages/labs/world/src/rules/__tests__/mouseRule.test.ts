// "Responds to the Mouse" — the keyboard's rule, one noun along.
//
// The point of these is the PARITY. `rules/input.rule` is checked in
// blockly/__tests__/inputRule, and everything here has a line there answering
// to it: two world events for the thing that happened to nobody, a trait for
// the actors that asked to hear it, and one step in `sense`. What is checked is
// that the mouse really is the same shape and not merely described as it —
// because if it drifts, a learner who has read one rule has to read the other.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta, ruleMetaToModule} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {mouseRule} from '../stock/mouse';

const meta = parseRuleMeta('rules/mouse', mouseRule)!;
const module_ = ruleMetaToModule(meta);

describe('rules/mouse.rule', () => {
  it('declares the button events at rule level, so they are the world’s', () => {
    // A click belongs to nobody until somebody claims it, exactly as a keypress
    // does: raised once a frame, handled with no actor handed over.
    expect(meta.name).toBe('Mouse');
    expect(meta.ability).toBe('Responds to the Mouse');
    const worldEvents = meta.events.filter(event => event.scope === 'world');
    expect(worldEvents.map(event => event.ref.exportName)).toEqual([
      'IsPressedEvent',
      'IsReleasedEvent',
    ]);
    expect(module_).toContain('export const IsPressedEvent = rule.addEvent(');
  });

  it('signs its events with the button, so a handler filters on one', () => {
    // The button is a parameter typed by an enum, which is what makes the hat
    // carry a dropdown and run for that button alone (specs/ENUMS.md).
    expect(meta.events[0].parts).toEqual([
      {
        kind: 'param',
        name: 'pressed button',
        type: 'enum:Engine#MouseButton',
      },
      {kind: 'label', text: 'is pressed'},
    ]);
  });

  it('offers a trait for an actor that wants to hear them too', () => {
    // The subscription, and the reason it exists: only the actors that elected
    // it are walked. Without it the step would raise a click on every actor in
    // the level every frame just to have somebody to raise it for.
    expect(meta.traits.map(trait => trait.name)).toEqual(['Takes Mouse Input']);
    const own = meta.events.filter(event => event.scope === 'actor');
    expect(own.map(event => event.name)).toEqual([
      'presses mouse button',
      'releases mouse button',
    ]);
    expect(own.map(event => event.ownerTraitId)).toEqual([
      'Takes_Mouse_Input',
      'Takes_Mouse_Input',
    ]);
  });

  it('senses, before anything decides on what it found', () => {
    const [step] = meta.steps;
    expect(meta.steps).toHaveLength(1);
    expect(step.order).toEqual({kind: 'phase', phase: 'sense'});
  });

  it('reads the buttons that changed, not the keys', () => {
    // The mistake this catches is a copied `forEachKey`, which would compile,
    // run, and raise a mouse event on every keystroke.
    expect(mouseRule).toContain('world_for_each_button');
    expect(mouseRule).not.toContain('world_for_each_key');
  });

  it('needs no other rule, and no world needs to name it', () => {
    // Reading the mouse is the World's, as the keyboard is, so this rule
    // requires nothing. And no world names it: holding the file is what puts a
    // rule in play (blockly/projectModules), which is why the flag that used
    // to say so for the input rules alone is gone.
    expect(meta.requires).toEqual([]);
    const stock = STOCK_RULES.find(rule => rule.id === 'mouse');
    expect(stock?.provides).toEqual(['Takes Mouse Input']);
  });
});
