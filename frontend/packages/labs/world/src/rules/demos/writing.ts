// "Shows Text" — an actor that says something, and says something else later.
//
// The demo that could not be recorded until the strip writer learned a font.
// Every other rule here is demonstrated by moving a box; this one puts a
// STRING on an actor, and no arrangement of rectangles says "SCORE"
// (specs/RULE_DEMOS.md).
//
// TWO of them, because half of what the rule does is hold still. A label that
// never changes and a number that does are the same trait doing the two things
// a game asks of it, and a strip with only the counter in it would look like a
// rule about numbers.
//
// The counter is driven by a timer, which is how a project would drive it: the
// rule owns the text and owns nothing about when it changes. And `look` READS
// the text off the actor rather than keeping its own copy — the rule is the
// only place it lives, so a demo cannot drift from what the rule holds.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` — the property the letters come from. */
let textOf: unknown;

/** Seconds between points. Six of them in a two-and-a-half second strip. */
const PERIOD = 0.4;
/** What each one is worth — round numbers, and a widening string. */
const STEP = 25;

export const writingDemo: RuleDemo = {
  rules: ['rules/writing', 'rules/time'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const text = (textOf = of('rules/writing', 'TextProperty'));
    const world = demoWorld('writing', modules, writingDemo.rules);

    const label = new ActorBuilder({id: 'label', name: 'label'})
      .useTraits([of('rules/writing', 'ShowsTextTrait')])
      .set(text, 'SCORE')
      .set(PositionProperty, new Vector(96, 46))
      .instantiate('label');
    world.addActor(label);

    let score = 0;
    const counter = new ActorBuilder({id: 'counter', name: 'counter'})
      .useTraits([
        of('rules/writing', 'ShowsTextTrait'),
        of('rules/time', 'HasATimerTrait'),
      ])
      .set(text, '0')
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(96, 76))
      .on(of('rules/time', 'TimerFiresEvent'), () => {
        counter.set(text, String((score += STEP)));
      })
      .instantiate('counter');
    world.addActor(counter);

    return {world, cast: {label, counter, text}};
  },
  look(id: string, actor: unknown) {
    // Read off the actor, not kept here: the rule owns the text, so a strip
    // cannot show a number the rule does not hold.
    const shown = (actor as {get(p: unknown): string}).get(textOf as never);
    return id === 'label'
      ? {width: 0, height: 0, colour: '#5c6370', text: shown, textScale: 2}
      : {width: 0, height: 0, colour: '#e5c07b', text: shown, textScale: 3};
  },
};
