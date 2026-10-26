// "Sends Things" — a wave that closes up, and then stops.
//
// The two facts this rule has that a timer does not, in one row of marks. Each
// mark is dropped where the CLOCK was when it was sent — x from the time, not
// from the count — so the row itself is the beat: evenly spaced would be a
// timer, and these bunch to the right because each gap is seven tenths of the
// one before.
//
// AND THEN NOTHING. Five is the limit, so the last second of the strip is a row
// that has stopped growing, which is the other half of the rule and the half a
// still frame can actually show. A timer would still be going.
//
// The handler is written here rather than in blocks, because that is what a
// project writes: the rule raises "sends something" and owns nothing about what
// is sent (`rules/spawner`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** The first gap, and what each one is multiplied by after it. */
const FIRST_GAP = 0.5;
const CLOSER = 0.7;
/** How many in all — the limit that makes the tail of the strip empty. */
const HOW_MANY = 5;
/**
 * Pixels per second of the row.
 *
 * The five sends land at about 0, 0.52, 0.87, 1.11 and 1.28 seconds, so 120
 * puts the last of them near x=170 in a 192-wide frame: the row fills it and
 * the final mark still has a margin rather than being clipped by the edge.
 */
const ACROSS = 120;

export const spawnerDemo: RuleDemo = {
  rules: ['rules/spawner'],
  seconds: 2.2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('spawner', modules, spawnerDemo.rules);

    let count = 0;
    const source = new ActorBuilder({id: 'source', name: 'source'})
      .useTraits([of('rules/spawner', 'SendsThingsTrait')])
      .set(of('rules/spawner', 'SecondsApartProperty'), FIRST_GAP)
      .set(of('rules/spawner', 'CloserEachTimeProperty'), CLOSER)
      .set(of('rules/spawner', 'HowManyToSendProperty'), HOW_MANY)
      .set(PositionProperty, new Vector(96, 40))
      .on(of('rules/spawner', 'SendsSomethingEvent'), () => {
        const id = `wave${count}`;
        world.addActor(
          new ActorBuilder({id, name: 'wave'})
            .set(PositionProperty, new Vector(16 + world.time() * ACROSS, 88))
            .instantiate(id),
        );
        count++;
      })
      .instantiate('source');
    world.addActor(source);

    return {world, cast: {source}};
  },
  look(id: string) {
    return id === 'source'
      ? {width: 20, height: 20, color: '#c678dd'}
      : {width: 14, height: 14, color: '#e06c75'};
  },
};
