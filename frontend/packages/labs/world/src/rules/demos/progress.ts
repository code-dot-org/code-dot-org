// "Shows Progress" — a fraction, and the bar that is drawn from it.
//
// A bar filling in five steps, in the rule's own two colors. The step is the
// demonstration: a bar that slid up smoothly would be a bar with a speed, and
// this rule has no speed and no step of its own — what moves a fraction is a
// project's handler, a coin taken or a hit landed, and each beat here stands
// for one of those.
//
// THE COLOURS ARE READ OFF THE RULE, not chosen here. `bar color` and `track
// color` are the rule's properties, so a demo that painted its own would be a
// picture of a bar rather than a picture of this rule.
//
// The bar's WIDTH is its fraction, which is the whole of what a Progress Bar
// does with one — and the left edge is held still as it grows, because a bar
// that filled from its middle outwards is not a bar anybody has seen.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look`. */
let fractionOf: unknown;
let barColorOf: unknown;
let trackColorOf: unknown;

/** The track: where it starts, and how long a full bar is. */
const LEFT = 36;
const FULL = 120;
const STEPS = 5;
const PERIOD = 0.4;

export const progressDemo: RuleDemo = {
  rules: ['rules/time', 'rules/progress'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    fractionOf = of('rules/progress', 'FractionProperty');
    barColorOf = of('rules/progress', 'BarColorProperty');
    trackColorOf = of('rules/progress', 'TrackColorProperty');
    const world = demoWorld('progress', modules, progressDemo.rules);

    // The empty track is a bar of its own, showing nothing: the rule ships the
    // color for exactly this, so that an empty bar reads as a bar rather than
    // as nothing at all.
    const track = new ActorBuilder({id: 'track', name: 'track'})
      .useTraits([of('rules/progress', 'ShowsProgressTrait')])
      .set(PositionProperty, new Vector(LEFT + FULL / 2, 64))
      .instantiate('track');
    world.addActor(track);

    const bar = new ActorBuilder({id: 'bar', name: 'bar'})
      .useTraits([of('rules/progress', 'ShowsProgressTrait')])
      .set(fractionOf as never, 0 as never)
      .set(PositionProperty, new Vector(LEFT, 64))
      .instantiate('bar');
    world.addActor(bar);

    let done = 0;
    const clock = new ActorBuilder({id: 'clock', name: 'clock'})
      .useTraits([of('rules/time', 'HasATimerTrait')])
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(96, 30))
      .on(of('rules/time', 'TimerFiresEvent'), () => {
        // What a project's own handler does: one more of the five things is
        // finished, so the fraction is one fifth further along.
        done = Math.min(STEPS, done + 1);
        bar.set(fractionOf as never, (done / STEPS) as never);
        // Held at its left edge as it grows — the recorder draws a box around
        // its position, so a bar that filled from the middle would be one that
        // grew both ways.
        const width = (done / STEPS) * FULL;
        bar.set(PositionProperty, new Vector(LEFT + width / 2, 64));
      })
      .instantiate('clock');
    world.addActor(clock);

    return {world, cast: {bar, clock, fraction: fractionOf}};
  },
  look(id: string, actor: unknown) {
    if (id === 'clock') {
      return {width: 12, height: 12, color: '#c678dd'};
    }
    const read = (property: unknown) =>
      (actor as {get(p: unknown): unknown}).get(property as never);
    if (id === 'track') {
      return {
        width: FULL,
        height: 22,
        color: read(trackColorOf) as string,
      };
    }
    const filled = read(fractionOf) as number;
    return {
      width: Math.max(0, filled * FULL),
      height: 22,
      color: read(barColorOf) as string,
    };
  },
};
