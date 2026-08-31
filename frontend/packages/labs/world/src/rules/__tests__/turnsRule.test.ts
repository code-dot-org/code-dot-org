// "Takes Turns" — what it declares, read rather than run.
//
// The shape worth pinning is how little there is: a count, a trait, and one
// action a project calls. Nothing watches for a move, because what counts as a
// move differs between a sokoban, a card game and a roguelike.
// `stockRulesRun` covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {turnsRule} from '../stock/turns';

const meta = parseRuleMeta('rules/turns', turnsRule)!;

describe('rules/turns.rule', () => {
  it('counts turns where nobody can wind the clock by hand', () => {
    const count = meta.properties.find(
      property => property.id === 'turns_taken',
    );

    expect(count?.scope).toBe('world');
    expect(count?.readonly).toBe(true);
  });

  it('puts how often an actor acts on the actor', () => {
    // Writable, unlike the count: a snail's slowness is a setting, and a game
    // that freezes something sets it to zero.
    const often = meta.properties.find(
      property => property.id === 'turns_per_move',
    );

    expect(often?.scope).toBe('actor');
    expect(often?.readonly).toBe(false);
    expect(often?.type).toBe('number');
  });

  it('offers one way to advance the game, and one to start it over', () => {
    expect(meta.actions.map(action => action.id).sort()).toEqual([
      'end_the_turn',
      'start_the_turns_again',
    ]);
    expect(meta.queries.map(query => query.id)).toEqual(['every_turns_']);
  });

  it('tells each taker, and then tells the world', () => {
    expect(
      meta.events.filter(event => event.scope === 'actor').map(e => e.id),
    ).toEqual(['takes_its_turn']);
    expect(
      meta.events.filter(event => event.scope === 'world').map(e => e.id),
    ).toEqual(['a_turn_passes']);
  });

  it('runs no steps at all', () => {
    // Nothing happens every frame, which is the point: a turn is a thing the
    // project says has happened, and a step would be this rule guessing.
    expect(meta.steps).toEqual([]);
  });
});
