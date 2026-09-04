// "Turns When It Hits Something" — what it declares, and the two orderings.
//
// `stockRulesRun` covers what it does. What this pins is the shape, because
// the whole rule is two steps in two moments and one number, and each of the
// three is a decision that reads as arbitrary once it works.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {turningRule} from '../stock/turning';

const meta = parseRuleMeta('rules/turning', turningRule)!;

describe('rules/turning.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Turns_When_It_Hits_Something',
    ]);
  });

  it('goes before the forces and looks after everything', () => {
    // Both halves matter. The heading is written in `decide`, before gravity
    // adds anything, so a fall lands on top of it rather than under it; and
    // the question "did I get there" is asked in `react`, after Solid has
    // pushed and after everything has moved.
    const moment = (id: string) =>
      meta.steps.find(step => step.id === id)?.order;

    expect(moment('go_the_way_it_is_facing')).toEqual({
      kind: 'phase',
      phase: 'decide',
    });
    expect(moment('turn_if_it_got_nowhere')).toEqual({
      kind: 'phase',
      phase: 'react',
    });
  });

  it('leaves a level five dials and no more', () => {
    // Which way it starts, how fast, what kind of enemy it is; whether the
    // drawing turns with it, which is a fact about the picture rather than
    // about the movement — a ball is round and a rocket has a nose; and
    // whether it reflects instead of turning, which is a switch rather than
    // another value for `turn by` because a mirror is not a number. A
    // room full of these all setting off rightwards reads as one enemy
    // copied, which is why the heading is settable rather than the rule's own.
    const settable = meta.properties
      .filter(property => !property.readonly)
      .map(property => property.id)
      .sort();

    expect(settable).toEqual([
      'bounces_off_what_stops_it',
      'heading',
      'points_where_it_goes',
      'travel_speed',
      'turn_by',
    ]);
  });

  it('remembers where it was, and that it has been anywhere', () => {
    // The flag is not redundant. Every position is a place an actor might
    // really be, so nothing could stand for "not yet" — and without it the
    // distance from the origin is read as travel that did not happen, and
    // every actor of this kind turns round on its first frame.
    const own = meta.properties
      .filter(property => property.readonly)
      .map(property => property.id)
      .sort();

    expect(own).toEqual(['measured', 'was_at']);
  });

  it('asks whether it arrived rather than what is in front of it', () => {
    // Looking ahead means asking which of the things being touched is on the
    // side it is going — a dot product and a threshold that gets corners
    // wrong. Measuring travel is one subtraction and catches every way of
    // being stopped, so the rule never asks about a contact at all.
    expect(turningRule).not.toContain('world_get_Collisions_ContactsProperty');
    expect(turningRule).toContain('world_get_Space_PositionProperty');
  });

  it('says when it turns, and does not say what that looks like', () => {
    expect(meta.events.map(event => event.name)).toEqual(['turns']);
    expect(turningRule).not.toContain('world_play_animation');
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'turning')?.provides).toEqual(
      ['Turns When It Hits Something'],
    );
  });
});
