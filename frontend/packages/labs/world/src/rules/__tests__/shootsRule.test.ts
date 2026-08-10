// "Shoots" — a rate limit, and an event where the bullet would be.
//
// The rule exists at the seam a property type cannot cross: there is no kind of
// property that holds an actor TEMPLATE, so a stock rule has no way to name a
// Bullet a project invented. What these pin is that the split is honoured — the
// rule knows about time and nothing about ammunition.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {shootsRule} from '../stock/shoots';

const meta = parseRuleMeta('rules/shoots', shootsRule)!;

describe('rules/shoots.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual(['Shoots']);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('carries the rate and the last shot, per actor', () => {
    // Per actor and not per rule: two ships sharing one cooldown would make the
    // second one unable to fire whenever the first just had.
    const ids = meta.properties.map(property => property.id);

    expect(ids).toContain('reload_time');
    expect(ids).toContain('last_fired');
    expect(meta.properties.every(property => property.scope === 'actor')).toBe(
      true,
    );
  });

  it('lets the first shot happen immediately', () => {
    // A `last fired` of 0 would leave an actor reloading for the first quarter
    // second of the game, which presents as "the fire key does not work yet".
    const lastFired = meta.properties.find(p => p.id === 'last_fired');

    expect(lastFired!.default as number).toBeLessThan(0);
  });

  it('keeps the clock reading out of a project’s hands', () => {
    // Read-only: the rule's own action writes it, and a project setting it by
    // hand would be setting a clock reading, which is never a thing to mean.
    expect(meta.properties.find(p => p.id === 'last_fired')?.readonly).toBe(
      true,
    );
  });

  it('measures against the world clock, not the frame time', () => {
    // `time` counts ticks rather than reading a wall clock, so a paused game
    // does not reload and a cooldown means the same on a 30Hz screen as a
    // 120Hz one. `delta` would measure one frame, which is not a cooldown.
    expect(shootsRule).toContain('world_time');
    expect(shootsRule).not.toContain('world_step_delta');
  });

  it('raises an event rather than spawning anything', () => {
    // The whole seam. A rule that spawned would have to name a kind of actor,
    // and no property type holds one — so what a shot IS belongs to the
    // project's handler.
    expect(meta.events.map(event => event.name).join(' ')).toMatch(/fires/i);
    expect(shootsRule).not.toContain('world_add_actor');
  });

  it('asks and fires in one block, so the two cannot come apart', () => {
    // An ACTION, not a query — asking is the firing. A question would let a
    // learner be told "yes" and forget to write down that they fired, which is
    // a gun that reloads instantly.
    expect(meta.actions.map(action => action.name)).toContain('make fire');
    expect(meta.queries).toEqual([]);
  });

  it('writes down the time before telling anyone', () => {
    // The handler for `fires` runs with the actor already reloaded. Emitting
    // first would let a handler that fires again see the OLD `last fired` and
    // slip a second shot through the same cooldown.
    const setAt = shootsRule.indexOf('LastFiredProperty');
    const emitAt = shootsRule.indexOf('FiresEvent');

    expect(setAt).toBeGreaterThan(-1);
    expect(emitAt).toBeGreaterThan(-1);
    expect(setAt).toBeLessThan(emitAt);
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'shoots')?.provides).toEqual([
      'Shoots',
    ]);
  });
});
