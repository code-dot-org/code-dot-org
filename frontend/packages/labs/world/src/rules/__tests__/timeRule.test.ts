// The stock `Time` rule — things that happen every so often.
//
// The library had no scheduling of any kind before this, and the interesting
// decision is where the clock lives: a timer is a TRAIT, held by an actor,
// rather than a hat the world fires. What these pin is that decision and the
// two rules that keep it from misbehaving — the next firing is scheduled before
// the event is raised, and it is scheduled from NOW rather than from when it
// was due.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {stockRule, timeRule} from '../stock';

const meta = parseRuleMeta('rules/time', timeRule)!;

const trait = (name: string) => meta.traits.find(one => one.name === name);
const propertyOf = (traitName: string, property: string) => {
  const owner = trait(traitName);
  const found = meta.properties.find(one => one.name === property);
  expect(found?.ownerTraitId).toBe(owner?.id);
  return found;
};

describe('rules/time.rule', () => {
  it('parses as a rule the editor can offer', () => {
    expect(meta.name).toBe('Time');
    expect(meta.ability).toBe('Keeps Time');
  });

  it('hangs the clock on an actor rather than on the world', () => {
    // The design decision. A hat the CLOCK fires would be the first event in
    // the language with no subject, and there is no machinery for one: an event
    // is about an actor and a handler is registered on a kind. Hanging it on an
    // actor also gives a game several clocks, which every game with a wave
    // timer and a blinking lamp needs.
    expect(trait('Has a Timer')).toBeDefined();
    expect(meta.events.map(one => one.name)).toContain('timer fires');
  });

  it('needs no other rule', () => {
    // Nothing physical about a clock. It reads `world time` and writes its own
    // property, which is why this is the smallest rule in the library.
    expect(meta.requires).toEqual([]);
  });

  it('runs and repeats by default', () => {
    expect(propertyOf('Has a Timer', 'timer period')?.default).toBe(1);
    expect(propertyOf('Has a Timer', 'timer runs')?.default).toBe(true);
    expect(propertyOf('Has a Timer', 'timer repeats')?.default).toBe(true);
  });

  it('keeps the schedule read-only, and starting at zero', () => {
    // Zero is the default because the clock starts at zero — which is what
    // makes a fresh timer fire on the first frame without a sentinel standing
    // for "never started".
    const next = propertyOf('Has a Timer', 'next fire at');
    expect(next?.readonly).toBe(true);
    expect(next?.default).toBe(0);
  });

  it('writes its own loop, because `sense` is a world moment', () => {
    // `phasesFor` offers a TRAIT step only the actor phases, so a trait step
    // naming `sense` names something the editor would never have offered — it
    // survives a round trip only because a live dropdown keeps a value its
    // options lack, and then draws a label for a different phase. Gravity
    // writes its loops out for the same reason.
    expect(timeRule).toContain('world_actors_with_trait');
    expect(timeRule).not.toContain('world_trait_step');
  });

  it('senses the time before anything decides or moves', () => {
    // `sense` is where the mouse works out which buttons changed, and its own
    // summary names timers. A timer is the same shape of fact — something the
    // frame noticed — and firing it later would mean a handler's effects
    // landed a frame after the beat.
    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].order).toMatchObject({phase: 'sense'});
  });

  it('answers a cooldown with a question and a start', () => {
    // The same idea with the sides swapped, and it needs no step at all.
    expect(trait('Has a Cooldown')).toBeDefined();
    const said = [...meta.actions, ...meta.queries].map(one => one.name);
    expect(said.some(name => name.includes('is ready?'))).toBe(true);
    expect(said.some(name => name.includes('start the cooldown'))).toBe(true);
  });

  it('starts a cooldown ready', () => {
    // Something you have never done is something you can do.
    expect(propertyOf('Has a Cooldown', 'ready at')?.default).toBe(0);
  });

  it('is on the shelf, with both abilities named', () => {
    const shelved = stockRule('time');

    expect(shelved?.provides).toEqual(['Has a Timer', 'Has a Cooldown']);
    expect(shelved?.description).toContain('cooldown');
  });
});
