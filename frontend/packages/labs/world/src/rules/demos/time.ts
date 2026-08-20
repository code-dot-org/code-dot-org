// "Has a Timer" — something happens on a beat.
//
// A metronome that leaves a mark every time its timer fires, so the strip
// fills left to right with EVENLY SPACED marks. The spacing is the whole
// demonstration: a timer that fired every frame would fill the row in the
// first two frames, which is exactly the bug this rule's tests were written
// against.
//
// The handler is written here rather than in blocks, because that is what a
// project would write: the rule raises "timer fires" and owns nothing about
// what firing means (`rules/time`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Seconds between beats — six of them in a two-and-a-half second strip. */
const PERIOD = 0.4;

export const timeDemo: RuleDemo = {
  rules: ['rules/time'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('time', modules, timeDemo.rules);

    let beats = 0;
    const metronome = new ActorBuilder({id: 'metronome', name: 'metronome'})
      .useTraits([of('rules/time', 'HasATimerTrait')])
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(96, 40))
      .on(of('rules/time', 'TimerFiresEvent'), () => {
        const id = `beat${beats}`;
        world.addActor(
          new ActorBuilder({id, name: 'beat'})
            .set(PositionProperty, new Vector(24 + beats * 28, 88))
            .instantiate(id),
        );
        beats++;
      })
      .instantiate('metronome');
    world.addActor(metronome);

    return {world, cast: {metronome}};
  },
  look(id: string) {
    return id === 'metronome'
      ? {width: 20, height: 20, colour: '#c678dd'}
      : {width: 14, height: 14, colour: '#e5c07b'};
  },
};
