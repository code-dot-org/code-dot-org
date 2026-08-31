// "Has an Ending" — what it declares, read rather than run.
//
// The state, the two moments and the way back, and the one thing that makes it
// a rule rather than a pair of flags: both endings are guarded in one place.
// `stockRulesRun` covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {goalsRule} from '../stock/goals';
import {scoreRule} from '../stock/score';

const meta = parseRuleMeta('rules/goals', goalsRule)!;

describe('rules/goals.rule', () => {
  it('keeps the ending where nobody can write it by hand', () => {
    // Read-only, both: `win the game` is the way, and a project that set these
    // directly would move the state without anything being told — which is
    // exactly what the events exist to prevent.
    const flags = meta.properties.filter(property =>
      ['won', 'lost'].includes(property.id),
    );

    expect(flags).toHaveLength(2);
    expect(flags.every(property => property.readonly)).toBe(true);
    expect(flags.every(property => property.scope === 'world')).toBe(true);
  });

  it('offers the ending as actions rather than as a flag to set', () => {
    expect(meta.actions.map(action => action.id).sort()).toEqual([
      'lose_the_game',
      'start_again',
      'win_the_game',
    ]);
  });

  it('says both endings and the way back', () => {
    const world = meta.events
      .filter(event => event.scope === 'world')
      .map(event => event.id);

    expect(world.sort()).toEqual([
      'the_game_is_lost',
      'the_game_is_won',
      'the_game_starts_again',
    ]);
  });

  it('declares its events twice, the way Scoring does', () => {
    // A world event registers on the world and an `.actor` file has no binding
    // for one, so a banner — which is an actor — could not hear the thing it
    // exists to show. Scoring learned this first; the shape is deliberately
    // the same one.
    const actorEvents = meta.events.filter(event => event.scope === 'actor');
    const score = parseRuleMeta('rules/score', scoreRule)!;

    expect(actorEvents).toHaveLength(3);
    expect(meta.traits.map(trait => trait.id)).toEqual(['Watches_the_Ending']);
    expect(score.traits.map(trait => trait.id)).toEqual(['Watches_the_Score']);
  });

  it('runs no steps at all', () => {
    // Nothing happens every frame here. An ending is a moment somebody else
    // decides, and this rule is where that moment is remembered — a step would
    // mean it was watching for something, which would be policy.
    expect(meta.steps).toEqual([]);
  });
});
