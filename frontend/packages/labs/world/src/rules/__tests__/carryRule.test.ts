// "Carries What Stands On It" — the rule that makes a moving platform work.
//
// What it declares, read rather than run: the two traits and which is which,
// and the two moments, which are the whole of the design. `stockRulesRun`
// covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {carryRule} from '../stock/carry';

const meta = parseRuleMeta('rules/carry', carryRule)!;

describe('rules/carry.rule', () => {
  it('splits the platform from the rider', () => {
    // Two traits and not one, because the two are different jobs on different
    // actors: a lift knows how far it went, and a player goes with it. One
    // trait would mean a platform that rides itself.
    expect(meta.traits.map(trait => trait.id)).toEqual(['Carries', 'Rides']);
  });

  it('measures a frame before it is used', () => {
    // The ordering the rule turns on. A carrier measures at the top of the
    // frame and a rider moves after `move` — different moments, so the answer
    // is the same every frame. Both in one moment would be unordered, and a
    // rider would read this frame's movement or the last one at random.
    const moment = (id: string) =>
      meta.steps.find(step => step.id === id)?.order;

    expect(moment('measure_the_carry')).toEqual({
      kind: 'phase',
      phase: 'decide',
    });
    expect(moment('ride_along')).toEqual({kind: 'phase', phase: 'adjust'});
  });

  it('rides before anything works out what is touching what', () => {
    // `adjust` is one moment before `touch`, so a rider the platform pushed
    // into a wall is pushed back out in the same frame by Solid Bodies. In
    // `react` — after the pushing — it would spend a frame inside the wall.
    const phases = ['adjust', 'touch', 'settle', 'react'];
    const ride = meta.steps.find(step => step.id === 'ride_along')?.order;

    expect(ride).toEqual({kind: 'phase', phase: 'adjust'});
    expect(phases.indexOf('adjust')).toBeLessThan(phases.indexOf('touch'));
  });

  it('keeps its own bookkeeping to itself', () => {
    // All three of the carrier's properties are read-only: a project that set
    // `moved by` would be lying to its riders about where the floor went, and
    // one that set `was at` would make the next frame's difference nonsense.
    const carrier = meta.properties.filter(
      property => property.ownerTraitId === 'Carries',
    );

    expect(carrier.map(property => property.id).sort()).toEqual([
      'measured',
      'moved_by',
      'was_at',
    ]);
    expect(carrier.every(property => property.readonly)).toBe(true);
  });

  it('names its two steps apart', () => {
    // A step's name becomes an exported identifier, so two steps called the
    // same thing in one rule is a module with two exports of one name.
    const ids = meta.steps.map(step => step.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
