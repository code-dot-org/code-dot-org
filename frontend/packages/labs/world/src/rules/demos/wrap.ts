// "Wraps at the Edges" — leave one side, arrive at the other.
//
// The one rule whose demonstration is unmistakable in motion and completely
// invisible in a still: a box at the left edge is a box at the left edge, and
// only the frames before it say whether it walked there or came round.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const wrapDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/wrap'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('wrap', modules, wrapDemo.rules);
    const rover = new ActorBuilder({id: 'rover', name: 'rover'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/wrap', 'WrapsAcrossTrait'),
      ])
      // Fast enough to go round more than once in the recording, so the loop
      // reads as a loop rather than as one lucky crossing.
      .set(PositionProperty, new Vector(30, 64))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(2.4, 0))
      .instantiate('rover');
    world.addActor(rover);
    return {world, cast: {rover}};
  },
  look() {
    return {width: 16, height: 16, colour: '#e5c07b'};
  },
};
