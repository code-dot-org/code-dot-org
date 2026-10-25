// What every stock rule and enhancement is for (specs/PURPOSE_PLAN.md,
// step 1).

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../../rules/stock';
import type {ActorPurpose} from '../actorPurpose';
import {ENHANCEMENTS} from '../enhance/enhancements';
import {STOCK_ACTORS} from '../stock';

const PURPOSES = new Set(['game', 'interface', 'both']);

describe('what the shelves hold is for', () => {
  it('says so for every stock rule', () => {
    for (const rule of STOCK_RULES) {
      expect(PURPOSES.has(rule.for), rule.name).toBe(true);
    }
    const of = (purpose: ActorPurpose) =>
      STOCK_RULES.filter(rule => rule.for === purpose).map(rule => rule.name);
    expect(of('interface')).toEqual(['Screens', 'Tab Navigation']);
    expect(of('both')).toEqual([
      'Health',
      'Time',
      'Conversation',
      'Scoring',
      'Input',
      'Mouse',
      'Gestures',
      'History',
    ]);
  });

  it('says so for every enhancement, each one a choice made', () => {
    // The whole list, so an enhancement added later has to be placed here
    // and is not a game's by default without anybody deciding it.
    expect(
      Object.fromEntries(ENHANCEMENTS.map(one => [one.id, one.for])),
    ).toEqual({
      'platformer-controls': 'game',
      'top-down-controls': 'game',
      drives: 'game',
      'climbs-with-arrows': 'game',
      jetpack: 'game',
      shoots: 'game',
      'wraps-across': 'game',
      'wraps-down': 'game',
      falls: 'game',
      'holds-things-up': 'game',
      carries: 'game',
      rides: 'game',
      slippery: 'game',
      conveys: 'game',
      slows: 'game',
      'walks-on-surfaces': 'game',
      health: 'game',
      collects: 'game',
      'carries-things': 'game',
      'can-be-carried': 'game',
      typesOutText: 'interface',
      patrols: 'game',
      'deals-damage': 'game',
      chases: 'game',
      prowls: 'game',
      flaps: 'game',
      'shoots-at': 'game',
      expires: 'game',
      'teleport-pad': 'game',
      'uses-teleport-pads': 'game',
      'taken-by-any-pad': 'game',
      'is-a-switch': 'game',
      'is-a-switched-wall': 'game',
      cameraFollow: 'game',
      scoreboard: 'both',
    });
  });

  it('agrees with each stock actor about the rules it needs', () => {
    // A game actor needing an interface's rule, or the other way round, is a
    // mistake in one of the two flags.
    const mismatched = STOCK_ACTORS.flatMap(actor =>
      actor.requires
        .map(name => STOCK_RULES.find(rule => rule.name === name))
        .filter(
          rule =>
            rule &&
            actor.for !== 'both' &&
            rule.for !== 'both' &&
            rule.for !== actor.for,
        )
        .map(
          rule =>
            `${actor.id} (${actor.for}) needs ${rule!.name} (${rule!.for})`,
        ),
    );
    expect(mismatched).toEqual([]);
  });
});
