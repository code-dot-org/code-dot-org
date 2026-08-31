// "Can Be Taken Back" — what it declares, read rather than run.
//
// The tape is eight named properties because a rule cannot hold a list of
// places, so the thing worth pinning here is the shape of the tape: eight
// slots, all read-only, one number saying how many of them mean anything.
// `stockRulesRun` covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {historyRule} from '../stock/history';

const meta = parseRuleMeta('rules/history', historyRule)!;

describe('rules/history.rule', () => {
  it('is eight moves deep, in slots a project can read', () => {
    // Written out because there is no list of places in the vocabulary. That
    // they are readable is the consolation: `three moves ago of ⟨Crate⟩` is a
    // question worth being able to ask.
    const slots = meta.properties.filter(property =>
      property.id.endsWith('_ago'),
    );

    expect(slots.map(property => property.id)).toEqual([
      'one_move_ago',
      'two_moves_ago',
      'three_moves_ago',
      'four_moves_ago',
      'five_moves_ago',
      'six_moves_ago',
      'seven_moves_ago',
      'eight_moves_ago',
    ]);
    expect(slots.every(property => property.type === 'point')).toBe(true);
    expect(slots.every(property => property.readonly)).toBe(true);
    expect(slots.every(property => property.scope === 'actor')).toBe(true);
  });

  it('counts the tape on the world, where a move belongs', () => {
    // Every remembering actor is written on the same push, so one number
    // describes them all — and an actor that carried its own count would take
    // it with it when it left.
    const count = meta.properties.find(
      property => property.id === 'moves_remembered',
    );

    expect(count?.scope).toBe('world');
    expect(count?.type).toBe('number');
    expect(count?.readonly).toBe(true);
  });

  it('offers the tape as verbs rather than as slots to write', () => {
    expect(meta.actions.map(action => action.id).sort()).toEqual([
      'forget_everything',
      'remember_this_move',
      'take_back_a_move',
    ]);
    expect(meta.queries.map(query => query.id)).toEqual([
      'is_there_a_move_to_take_back_',
    ]);
  });

  it('says a move was taken back twice: to the world and to each actor', () => {
    // The world event is where a project puts a tally right; the actor event
    // is what an `.actor` file can hear, and is how a crate flashes when it
    // moves back.
    expect(
      meta.events.filter(event => event.scope === 'world').map(e => e.id),
    ).toEqual(['a_move_is_taken_back']);
    expect(
      meta.events.filter(event => event.scope === 'actor').map(e => e.id),
    ).toEqual(['is_put_back']);
  });

  it('runs no steps at all', () => {
    // Nothing happens every frame. A move is a decision the project makes,
    // and a step would mean this rule was guessing when one had happened.
    expect(meta.steps).toEqual([]);
  });
});
