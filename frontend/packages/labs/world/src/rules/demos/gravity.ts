// "Has Gravity" — a ball falls and lands on the ground.
//
// The simplest thing the rule is for, and the one that reads worst as a still:
// a ball above some ground could be falling, risen or sitting there, and only
// the motion says which (specs/RULE_DEMOS.md).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const gravityDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/solid', 'rules/gravity'],
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('gravity', modules, gravityDemo.rules);
    const ball = new ActorBuilder({id: 'ball', name: 'ball'})
      .useTraits([of('rules/gravity', 'AffectedByGravityTrait')])
      .set(PositionProperty, new Vector(96, 16))
      .instantiate('ball');
    world.addActor(ball);
    // Wide and flat, so the ball has somewhere to land and the frame reads as
    // a floor rather than as two things meeting.
    const ground = new ActorBuilder({id: 'ground', name: 'ground'})
      .useTraits([
        of('rules/gravity', 'ActsAsGroundTrait'),
        of('rules/solid', 'SolidTrait'),
      ])
      .set(PositionProperty, new Vector(96, 112))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(150, 16))
      .instantiate('ground');
    world.addActor(ground);
    return {world, cast: {ball, ground}};
  },

  look(id: string) {
    return id === 'ground'
      ? {width: 160, height: 16, colour: '#5a7d5a'}
      : {width: 16, height: 16, colour: '#f6c453'};
  },
};
