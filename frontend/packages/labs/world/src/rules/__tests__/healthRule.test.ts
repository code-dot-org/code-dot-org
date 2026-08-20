// The stock `Health` rule — things can be hurt, and can run out.
//
// A library rule rather than a starter one, so it is read straight off the
// shelf. What these pin is the shape a learner meets: two abilities, so a spike
// and a player need know nothing about each other; a mercy time, without which
// contact damage is sixty hits a second; and `dies` as an EVENT, because what
// dying means is the game's to say and not this rule's.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {healthRule, stockRule} from '../stock';

const meta = parseRuleMeta('rules/health', healthRule)!;

const trait = (name: string) => meta.traits.find(one => one.name === name);

/** A property by name, checked to belong to the trait that should own it. */
const propertyOf = (traitName: string, property: string) => {
  const owner = trait(traitName);
  const found = meta.properties.find(one => one.name === property);
  expect(found?.ownerTraitId).toBe(owner?.id);
  return found;
};

describe('rules/health.rule', () => {
  it('parses as a rule the editor can offer', () => {
    expect(meta.name).toBe('Health');
    expect(meta.ability).toBe('Has Health');
  });

  it('names the two sides separately', () => {
    // The Collection split, and the same reason: a bullet, a spike and a
    // patrolling enemy are dangerous without knowing who to.
    expect(trait('Has Health')).toBeDefined();
    expect(trait('Deals Damage')).toBeDefined();
  });

  it('needs Collisions, because being hurt happens on contact', () => {
    // A trait dependency rather than something left to the learner: an actor
    // that elects "Deals Damage" and is never touched would be a rule that
    // silently does nothing.
    expect(meta.requires).toContain('Collisions');
  });

  it('starts with health a learner can lose three times', () => {
    expect(propertyOf('Has Health', 'health')?.default).toBe(3);
  });

  it('spaces contact damage with a mercy time', () => {
    // Without it, touching an enemy for half a second is sixty frames and
    // sixty damage. Half a second is roughly what a platformer gives you.
    expect(propertyOf('Has Health', 'mercy time')?.default).toBe(0.5);
  });

  it('keeps the mercy clock read-only', () => {
    // A time, not a countdown, so nothing has to tick it down — and a step
    // owns it, so it is not a knob.
    expect(propertyOf('Has Health', 'unhurt until')?.readonly).toBe(true);
  });

  it('lets the dangerous thing say how much it takes off', () => {
    expect(propertyOf('Deals Damage', 'damage')?.default).toBe(1);
  });

  it('raises events rather than removing anything', () => {
    // The bargain that keeps this a mechanic rather than a policy: games
    // disagree about what dying means, and gravity makes the same one with
    // `starts falling`.
    const events = meta.events.map(one => one.name);
    expect(events).toContain('is hurt');
    expect(events).toContain('dies');
    expect(healthRule).not.toContain('world_remove_actor');
  });

  it('tells the attacker what it hit', () => {
    // The other side of the pair, so a spike can react to hurting somebody —
    // Collection's `is collected by` one channel over.
    const hurts = meta.events.find(one => one.name.startsWith('hurts'));
    expect(hurts).toBeDefined();
  });

  it('asks its question and applies its damage as blocks', () => {
    const said = [...meta.queries, ...meta.actions].map(one => one.name);
    expect(said.some(name => name.includes('alive'))).toBe(true);
    expect(said.some(name => name.includes('damage'))).toBe(true);
  });

  it('reacts after contacts are known, once per hurtable actor', () => {
    // `react`, like Collection's, so it reads `contacts` (written in `touch`)
    // rather than another rule's output from its own phase. And declared UNDER
    // the trait, so the step runs for each actor that has it with that actor
    // bound, rather than opening with a loop that says the same thing.
    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].order).toMatchObject({phase: 'react'});
    expect(meta.steps[0].scope).toBe('actor');
  });

  it('is on the shelf, with both abilities named', () => {
    const shelved = stockRule('health');

    expect(shelved?.provides).toEqual(['Has Health', 'Deals Damage']);
    expect(shelved?.description).toContain('mercy');
  });
});
