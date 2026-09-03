// "Chooses Only at a Junction" — what it declares, and why it is not Steering.
//
// `stockRulesRun` covers what it does. What this pins is the shape, and the
// shape IS the idea: an enemy that reads its quarry every frame is a different
// rule from one that reads it three times a level, and the difference is
// entirely in when the step looks.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {prowlingRule} from '../stock/prowling';

const meta = parseRuleMeta('rules/prowling', prowlingRule)!;

describe('rules/prowling.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual(['Prowls']);
  });

  it('names what it hunts rather than what kind of thing that is', () => {
    // Steering's shape: a project points it at `first actor in ⟨any Player⟩`
    // and the robot never learns the word "player".
    const quarry = meta.properties.find(
      property => property.id === 'actor_to_hunt',
    );

    expect(quarry?.type).toBe('actor');
    expect(quarry?.readonly).toBeFalsy();
  });

  it('remembers exactly what a junction needs, and nothing else', () => {
    // Three booleans, and each is the previous frame's answer to a question
    // this frame can ask. A junction is a CHANGE, and a change is the one
    // thing a step running every frame cannot see for itself.
    const own = meta.properties
      .filter(property => property.readonly)
      .map(property => property.id)
      .sort();

    expect(own).toEqual([
      'was_at',
      'was_climbing',
      'was_falling',
      'was_on_a_ladder',
    ]);
  });

  it('lets a level aim it, and say how fast and how fussy', () => {
    // `going` is settable for the reason `Turning`'s heading is: which way an
    // enemy sets off is a fact about where a level put it — and here it
    // matters more, because a robot's first junction can arrive before the
    // handler naming its quarry has.
    const settable = meta.properties
      .filter(property => !property.readonly)
      .map(property => property.id)
      .sort();

    expect(settable).toEqual([
      'actor_to_hunt',
      'close_enough',
      'going',
      'prowl_speed',
    ]);
  });

  it('takes a ladder with the trait a player takes one with', () => {
    // Not its own idea of a ladder. What a robot can climb is exactly what a
    // player can, so a level that adds a ladder has added it for both.
    expect(prowlingRule).toContain('Climbing#ClimbsTrait');
    expect(prowlingRule).toContain('world_do_Climbing_StartClimbingUpAction');
    expect(prowlingRule).toContain('world_do_Climbing_StartClimbingDownAction');
  });

  it('decides in `decide`, which is where intent belongs', () => {
    const step = meta.steps.find(one => one.id === 'choose_at_a_junction');

    expect(step?.order).toEqual({kind: 'phase', phase: 'decide'});
    expect(step?.ownerTraitId).toBe('Prowls');
  });

  it('says when it thinks, which is the event worth having', () => {
    // Not "when it moves" — it moves every frame. The moment worth handling
    // is the rare one, which is what makes an animation or a sound possible.
    expect(meta.events.map(event => event.name)).toEqual(['chooses']);
  });

  it('is offered in the library', () => {
    expect(
      STOCK_RULES.find(stock => stock.id === 'prowling')?.provides,
    ).toEqual(['Prowls']);
  });
});
