// "Climbs Ladders" — what it declares, and the three splits in it.
//
// `stockRulesRun` covers what it does. What this pins is the shape, because
// each of the three traits exists for a reason that is invisible once the rule
// works: a ladder that carries nothing, a climber that has no keyboard, and a
// control scheme that is neither.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {climbRule} from '../stock/climb';

const meta = parseRuleMeta('rules/climb', climbRule)!;

describe('rules/climb.rule', () => {
  it('splits the ladder, the climber and the controls', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Can_Be_Climbed',
      'Climbs',
      'Climbs_with_Arrow_Keys',
    ]);
  });

  it('gives a ladder nothing to carry', () => {
    // A ladder has no speed of its own and no opinion about who climbs it.
    // Every property here belongs to the climber, which is what lets one
    // ladder serve a player and a robot that disagree about everything else.
    const ladder = meta.properties.filter(
      property => property.ownerTraitId === 'Can_Be_Climbed',
    );

    expect(ladder).toEqual([]);
  });

  it('keeps the keyboard out of the mechanic', () => {
    // The split that matters most. An enemy takes ladders (JETPACK.md, phase
    // three) and has no keys, so a `Climbs` that read the arrows would have
    // shut that out — and the control scheme has to live somewhere, so it
    // lives in a trait of its own that an enemy simply does not elect.
    const keyed = meta.steps.find(step => step.id === 'read_the_arrows');
    const climb = meta.steps.find(step => step.id === 'climb');

    expect(keyed?.ownerTraitId).toBe('Climbs_with_Arrow_Keys');
    expect(climb?.ownerTraitId).toBe('Climbs');
  });

  it('climbs after everything has moved', () => {
    // `adjust` and not `push`. The climb sets a POSITION, which is only a
    // sensible thing to do once positions have been integrated — and doing it
    // as a force would mean racing gravity's own `push`, whose loser leaks a
    // frame of falling into every frame of climbing.
    const climb = meta.steps.find(step => step.id === 'climb');

    expect(climb?.order).toEqual({kind: 'phase', phase: 'adjust'});
  });

  it('is switched rather than pumped, in two directions and one stop', () => {
    expect(meta.actions.map(action => action.name).sort()).toEqual([
      'start climbing down',
      'start climbing up',
      'stop climbing',
    ]);
  });

  it('keeps the climb itself out of a project’s hands', () => {
    // Both flags are read-only, which is what keeps `starts climbing` and
    // `stops climbing` honest — and what stops a project setting `climbing`
    // in mid-air, which is a flight key with extra steps.
    const own = meta.properties
      .filter(property => property.readonly)
      .map(property => property.id)
      .sort();

    expect(own).toEqual(['climbing', 'climbing_up']);
  });

  it('asks the contact set rather than looking around', () => {
    // A ladder you are ON, not a ladder that is near: Collisions has already
    // worked out what is touching what, and a rule that searched by distance
    // would find the ladder through a wall.
    expect(climbRule).toContain('world_get_Collisions_ContactsProperty');
    expect(climbRule).not.toContain('world_near_place_trait');
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'climb')?.provides).toEqual([
      'Can Be Climbed',
      'Climbs',
      'Climbs with Arrow Keys',
    ]);
  });
});
