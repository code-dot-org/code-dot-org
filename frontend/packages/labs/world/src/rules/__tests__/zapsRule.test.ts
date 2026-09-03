// "Zaps" — a rate limit, and an event where the energy ball would be.
//
// The rule exists at the seam a property type cannot cross: there is no kind of
// property that holds an actor TEMPLATE, so a stock rule has no way to name a
// Energy Ball a project invented. What these pin is that the split is honoured — the
// rule knows about time and nothing about ammunition.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {zapsRule} from '../stock/zaps';

const meta = parseRuleMeta('rules/zaps', zapsRule)!;

describe('rules/zaps.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual(['Zaps']);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('carries the rate and the last zap, per actor', () => {
    // Per actor and not per rule: two ships sharing one cooldown would make the
    // second one unable to zap whenever the first just had.
    const ids = meta.properties.map(property => property.id);

    expect(ids).toContain('recharge_time');
    expect(ids).toContain('last_zapped');
    expect(meta.properties.every(property => property.scope === 'actor')).toBe(
      true,
    );
  });

  it('lets the first zap happen immediately', () => {
    // A `last zapped` of 0 would leave an actor recharging for the first quarter
    // second of the game, which presents as "the zap key does not work yet".
    const lastZapped = meta.properties.find(p => p.id === 'last_zapped');

    expect(lastZapped!.default as number).toBeLessThan(0);
  });

  it('keeps the clock reading out of a project’s hands', () => {
    // Read-only: the rule's own action writes it, and a project setting it by
    // hand would be setting a clock reading, which is never a thing to mean.
    expect(meta.properties.find(p => p.id === 'last_zapped')?.readonly).toBe(
      true,
    );
  });

  it('measures against the world clock, not the frame time', () => {
    // `time` counts ticks rather than reading a wall clock, so a paused game
    // does not recharge and a cooldown means the same on a 30Hz screen as a
    // 120Hz one. `delta` would measure one frame, which is not a cooldown.
    expect(zapsRule).toContain('world_time');
    expect(zapsRule).not.toContain('world_step_delta');
  });

  it('raises an event rather than spawning anything', () => {
    // The whole seam. A rule that spawned would have to name a kind of actor,
    // and no property type holds one — so what a zap SENDS belongs to the
    // project's handler.
    expect(meta.events.map(event => event.name).join(' ')).toMatch(/zaps/i);
    expect(zapsRule).not.toContain('world_add_actor');
  });

  it('asks and zaps in one block, so the two cannot come apart', () => {
    // An ACTION, not a query — asking is the firing. A question would let a
    // learner be told "yes" and forget to write down that they did, which is
    // a zapper that recharges instantly.
    expect(meta.actions.map(action => action.name)).toContain('make zap');
    expect(meta.queries).toEqual([]);
  });

  it('writes down the time before telling anyone', () => {
    // The handler for `zaps` runs with the actor already recharged. Emitting
    // first would let a handler that zaps again see the OLD `last zapped` and
    // slip a second one through the same cooldown.
    const setAt = zapsRule.indexOf('LastZappedProperty');
    const emitAt = zapsRule.indexOf('ZapsEvent');

    expect(setAt).toBeGreaterThan(-1);
    expect(emitAt).toBeGreaterThan(-1);
    expect(setAt).toBeLessThan(emitAt);
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'zaps')?.provides).toEqual([
      'Zaps',
    ]);
  });
});
