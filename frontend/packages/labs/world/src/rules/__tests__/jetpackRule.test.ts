// "Flies with a Jetpack" — what it declares, and where the work sits.
//
// `stockRulesRun` covers what it does. What this pins is the shape, because
// three of the decisions in it look like style and are not: which moment the
// thrust happens in, which side of the seam the flame is on, and that the ask
// is a statement rather than a question.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';
import {jetpackRule} from '../stock/jetpack';

const meta = parseRuleMeta('rules/jetpack', jetpackRule)!;

describe('rules/jetpack.rule', () => {
  it('is one trait an actor elects', () => {
    expect(meta.traits.map(trait => trait.id)).toEqual([
      'Flies_with_a_Jetpack',
    ]);
    expect(meta.traits[0].subject).toBe('actor');
  });

  it('pushes in the moment forces are added', () => {
    // The decision that makes it a jetpack rather than a lift. `push` is where
    // gravity's own acceleration goes, so the two are added in the same moment
    // and the net of them is what moves the actor. It is also the only moment
    // that knows how long a frame is — which is why the ACTION cannot do this.
    const thrust = meta.steps.find(step => step.id === 'thrust');

    expect(thrust?.order).toEqual({kind: 'phase', phase: 'push'});
  });

  it('keeps everything a pilot might set, settable', () => {
    // The four numbers a level tunes: how hard it pushes, how fast it may
    // climb, what is in the tank and how big the tank is. A rule whose defaults
    // could not be changed would be one level's jetpack rather than a rule.
    const settable = meta.properties
      .filter(property => !property.readonly)
      .map(property => property.id)
      .sort();

    expect(settable).toEqual([
      'fuel',
      'fuel_per_second',
      'most_fuel',
      'thrust',
      'top_flying_speed',
    ]);
  });

  it('keeps the switch itself out of a project’s hands', () => {
    // `flying` is the state, and the only way to change it is the two blocks —
    // which is what keeps `starts flying` and `stops flying` honest. A project
    // that could set it would turn the thrust on with nothing said.
    const own = meta.properties
      .filter(property => property.readonly)
      .map(property => property.id);

    expect(own).toEqual(['flying']);
  });

  it('measures fuel and thrust against the clock, not the frame', () => {
    // A rule that burned a fixed amount per frame would empty the tank twice
    // as fast on a 120Hz screen, and fly twice as far on the way.
    expect(jetpackRule).toContain('world_step_delta');
  });

  it('is switched rather than pumped', () => {
    // The decision the whole shape rests on. A block that thrusted once would
    // have to be called sixty times a second, and a learner has no good way to
    // say "every frame this key is held" — the keyboard gives them presses and
    // releases, which are exactly these two.
    expect(meta.actions.map(action => action.name).sort()).toEqual([
      'give fuel',
      'start flying',
      'stop flying',
    ]);
  });

  it('offers the two things a project reads and cannot work out', () => {
    // `has fuel?` is what makes the fallback jump the right answer, and the
    // fraction is what a gauge is drawn from. Both are derived from properties
    // a project can already see, and both are a division or a comparison a
    // learner would otherwise get subtly wrong.
    expect(meta.queries.map(query => query.name).sort()).toEqual([
      'fuel fraction',
      'has fuel?',
    ]);
  });

  it('says what happened rather than drawing it', () => {
    // The same seam Zaps draws. The flame, the sound and the animation are the
    // project's; these three are how it hears about them, and the rule names
    // no picture at all.
    expect(meta.events.map(event => event.name).sort()).toEqual([
      'runs out of fuel',
      'starts flying',
      'stops flying',
    ]);
    expect(jetpackRule).not.toContain('world_set_animation');
  });

  it('is offered in the library', () => {
    expect(STOCK_RULES.find(stock => stock.id === 'jetpack')?.provides).toEqual(
      ['Flies with a Jetpack'],
    );
  });
});
