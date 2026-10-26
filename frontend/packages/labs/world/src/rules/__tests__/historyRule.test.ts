// "Undoes Moves" — what it declares, read rather than run.
//
// The tape was eight named properties, because a rule's state was a fixed set
// of named slots and there was no list of places in the vocabulary. It is one
// list now (specs/LISTS.md), and what is worth pinning is that shape: one
// read-only list per actor, and one number saying how long it is.
// `stockRulesRun` covers what it does.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {historyRule} from '../stock/history';

const meta = parseRuleMeta('rules/history', historyRule)!;

describe('rules/history.rule', () => {
  it('keeps the tape as one list, and nothing else', () => {
    // Eight properties became one, which is the whole of what a list bought
    // here: no depth to choose, and no paragraph explaining the number eight.
    const tape = meta.properties.find(
      property => property.id === 'where_it_was',
    );

    expect(tape?.type).toBe('vectors');
    expect(tape?.scope).toBe('actor');
    expect(tape?.readonly).toBe(true);
    expect(meta.properties.map(property => property.id).sort()).toEqual([
      'moves_remembered',
      'where_it_was',
    ]);
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
