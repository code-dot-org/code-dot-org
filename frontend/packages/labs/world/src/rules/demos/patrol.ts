// "Walks Back and Forth" — a guard on its beat and a lift on its track.
//
// Both traits in one frame, because that is the argument for there being two:
// across and down are not halves of one thing, they are different things to
// want. The guard walks a corridor and the platform rides up and down beside
// it, and neither is a special case of the other.
//
// A THIRD ONE TAKES BOTH, which is the claim the other two cannot make: the
// steps share a moment, so they have to commute, and an actor walking a
// rectangle is what that looks like. Nothing in the rule arranges it.
//
// Short periods, because a strip is two and a half seconds and a beat you
// cannot see the end of is a box sliding off the edge.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const patrolDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/patrol'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('patrol', modules, patrolDemo.rules);

    const walker = (
      id: string,
      at: Vector,
      traits: string[],
      period: number,
      speed: number,
    ) => {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/motion', 'CanMoveTrait'),
          ...traits.map(name => of('rules/patrol', name)),
        ])
        .set(PositionProperty, at)
        .instantiate(id);
      for (const trait of traits) {
        const which = trait === 'PatrolsAcrossTrait' ? 'Across' : 'Down';
        actor.set(of('rules/patrol', `${which}TimeProperty`), period as never);
        actor.set(of('rules/patrol', `${which}SpeedProperty`), speed as never);
      }
      world.addActor(actor);
      return actor;
    };

    return {
      world,
      cast: {
        // One long leg out and one back, which is the whole beat inside the
        // strip rather than a box appearing to jitter.
        guard: walker(
          'guard',
          new Vector(28, 26),
          ['PatrolsAcrossTrait'],
          1.1,
          0.9,
        ),
        lift: walker(
          'lift',
          new Vector(168, 24),
          ['PatrolsDownTrait'],
          0.9,
          0.7,
        ),
        // Four short legs, so the rectangle closes inside the recording.
        rover: walker(
          'rover',
          new Vector(40, 84),
          ['PatrolsAcrossTrait', 'PatrolsDownTrait'],
          0.6,
          0.6,
        ),
      },
    };
  },
  look(id: string) {
    if (id === 'lift') {
      return {width: 34, height: 10, colour: '#5a7d5a'};
    }
    return id === 'guard'
      ? {width: 16, height: 16, colour: '#e06c75'}
      : {width: 14, height: 14, colour: '#61afef'};
  },
};
