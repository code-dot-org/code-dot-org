// "Slows Down" — what makes a car a car rather than a spaceship.
//
// The rule exists because acceleration is NOT what separates the two. Both
// models add a thrust per second while a key is held and add nothing when it is
// released; what differs is whether the speed that built up ever goes away.
// These pin that, and pin the arithmetic that does it safely.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {dragRule} from '../stock/drag';
import {gravityRule} from '../stock/gravity';

const meta = parseRuleMeta('rules/drag', dragRule)!;

describe('rules/drag.rule', () => {
  it('is one trait an actor elects for itself', () => {
    // Not a knob on the driving rule: a thrown ball and a sliding puck want
    // this and want nothing to do with the arrow keys.
    expect(meta.traits.map(trait => trait.id)).toEqual(['Slows_Down']);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('offers one knob, and no top speed beside it', () => {
    // A top speed is not a separate setting because it is not a separate idea:
    // speed grows while thrust beats drag and stops when they balance, so the
    // cap is already `thrust / drag`. A knob for it could disagree with the
    // arithmetic, and then one of the two would be lying.
    expect(meta.properties.map(property => property.id)).toEqual(['drag']);
    expect(meta.properties[0].default).toBe(0.5);
  });

  it('slows in `push`, the moment named for changing velocity', () => {
    // After `decide` has read the keys and before `move` turns velocity into
    // position — so a frame's thrust is felt before it is bled off, and the
    // position that gets drawn reflects both.
    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].order).toEqual({kind: 'phase', phase: 'push'});
  });

  it('shares that moment with gravity, which is deliberate', () => {
    // Stated because they do NOT commute — gravity adds where this multiplies.
    // The disagreement is second order in the frame time and stays there, so
    // neither is given a moment of its own. If that ever stops being true this
    // test is where to start.
    expect(parseRuleMeta('rules/gravity', gravityRule)!.steps).toContainEqual(
      expect.objectContaining({order: {kind: 'phase', phase: 'push'}}),
    );
  });

  it('multiplies the speed rather than subtracting from it', () => {
    // Subtracting overshoots through zero on a slow frame and leaves the actor
    // travelling backwards. Multiplying by a fraction cannot reach zero from
    // above, let alone cross it.
    expect(dragRule).toContain('"OP": "MULTIPLY"');
    expect(dragRule).toContain('"OP": "POWER"');
  });

  it('raises the kept fraction to the frame time, so the rate is per second', () => {
    // The point of the power: the per-frame factors over one second multiply to
    // `kept¹` however many frames it took, so a 120Hz screen slows exactly as
    // fast as a 30Hz one. A plain per-frame multiply would slow four times as
    // hard on the fast screen.
    expect(dragRule).toContain('world_step_delta');
  });

  it('treats more than total loss as a dead stop, not a reversal', () => {
    // `(1 - drag)` goes negative past 1, and a negative raised to a fractional
    // power is NaN — which reaches the actor's position and removes it from the
    // world with nothing thrown. The guard is a real one, not a nicety.
    const said = meta.queries.map(query => query.name).join(' ');

    expect(said).toMatch(/what is left/i);
    expect(dragRule).toContain('controls_if');
  });

  it('names the fraction on the rule, so anything decaying can borrow it', () => {
    // Same reason `wrap` exposes its one axis: a fading score or a dwindling
    // fuel tank is the same arithmetic, and a copy is a place for the two to
    // drift.
    expect(meta.queries).toHaveLength(1);
    // On the rule, not on the trait — which is what world scope means here:
    // callable by anything, whether or not it is an actor that slows down.
    expect(meta.queries[0].scope).toBe('world');
  });

  it('is offered in the library, next to the rule that needs it', () => {
    // The import dialog is where a learner meets it, and it is listed straight
    // after the driving rule because that is the pairing it exists for.
    const ids = STOCK_RULES.map(stock => stock.id);

    expect(ids).toContain('drag');
    expect(ids.indexOf('drag')).toBe(ids.indexOf('drive') + 1);
    expect(STOCK_RULES.find(stock => stock.id === 'drag')?.provides).toEqual([
      'Slows Down',
    ]);
  });
});
