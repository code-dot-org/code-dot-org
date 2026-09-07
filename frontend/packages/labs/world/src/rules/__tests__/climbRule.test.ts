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
  it('splits the ladder from the climber, and stops there', () => {
    // What a ladder is, and what climbing one is. There is no third trait for
    // the controls: steering a climb is an actor enhancement, so this rule
    // never reads a key and never depends on Input.
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Can_Be_Climbed',
      'Climbs',
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

  it('keeps the keyboard out of the mechanic entirely', () => {
    // The split that matters most. An enemy takes ladders (JETPACK.md, phase
    // three) and has no keys, so a `Climbs` that read the arrows would shut
    // that out. It used to live in a trait of its own here; it lives in the
    // ACTOR now (`actors/enhance/climbArrows`), which is a stronger form of
    // the same split — the rule cannot read a key even if somebody tries, and
    // a learner can see and rebind the ones it does read.
    const climb = meta.steps.find(step => step.id === 'climb');

    expect(meta.steps.map(step => step.id)).not.toContain('read_the_arrows');
    expect(climb?.ownerTraitId).toBe('Climbs');
    expect(meta.requires).not.toContain('Input');
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
    // Every read-only one is the rule's own account of a climb in progress,
    // which is what keeps `starts climbing` and `stops climbing` honest — and
    // what stops a project setting `climbing` in mid-air, which is a flight
    // key with extra steps.
    //
    // `climbing from` was here too, holding the height a climb began at,
    // because `position before` was worked out from the velocity and a climb
    // that parks its speed could not trust it. Physics records the place now.
    // `climb measured` stays, and it is the half that was never about the
    // position: a climb can start in `touch`, after `adjust` has been and
    // gone, so on that frame no climb has happened and no measurement of one
    // would mean anything.
    const own = meta.properties
      .filter(property => property.readonly)
      .map(property => property.id)
      .sort();

    expect(own).toEqual([
      'climb_measured',
      'climbing',
      'climbing_up',
      'top_rung',
    ]);
  });

  it('leaves the two dials a level would turn', () => {
    // How fast, and whether a climb pulls you on to the middle of the ladder —
    // which is off for a wide one and on for a ladder in a one-tile gap.
    const settable = meta.properties
      .filter(property => !property.readonly)
      .map(property => property.id)
      .sort();

    expect(settable).toEqual(['centers_on_the_ladder', 'climb_speed']);
  });

  it('asks the contact set rather than looking around', () => {
    // A ladder you are ON, not a ladder that is near: Collisions has already
    // worked out what is touching what, and a rule that searched by distance
    // would find the ladder through a wall.
    expect(climbRule).toContain('world_get_Collisions_ContactsProperty');
    expect(climbRule).not.toContain('world_near_place_trait');
  });

  it('is offered in the library', () => {
    // Two traits: what a ladder is, and what climbing one is. The control
    // scheme is not among them — steering a climb with the arrow keys is an
    // actor enhancement (`actors/enhance/climbArrows`), so that this rule need
    // not depend on Input and the key bindings are blocks a learner can read.
    expect(STOCK_RULES.find(stock => stock.id === 'climb')?.provides).toEqual([
      'Can Be Climbed',
      'Climbs',
    ]);
  });
});
