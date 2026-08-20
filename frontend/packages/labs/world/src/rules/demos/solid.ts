// "Has Solid Bodies" — a moving thing cannot pass through a still one.
//
// The demonstration is the STOP, so the mover starts well clear of the wall
// and arrives during the recording. A demo where it began touching would be a
// demo of two boxes not moving.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const solidDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/solid'],
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('solid', modules, solidDemo.rules);
    const mover = new ActorBuilder({id: 'mover', name: 'mover'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/solid', 'SolidTrait'),
      ])
      .set(PositionProperty, new Vector(20, 64))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.9, 0))
      .instantiate('mover');
    world.addActor(mover);
    const wall = new ActorBuilder({id: 'wall', name: 'wall'})
      .useTraits([of('rules/solid', 'SolidTrait')])
      .set(PositionProperty, new Vector(150, 64))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 80))
      .instantiate('wall');
    world.addActor(wall);
    return {world, cast: {mover, wall}};
  },
  look(id: string) {
    return id === 'wall'
      ? {width: 16, height: 90, colour: '#5a7d5a'}
      : {width: 16, height: 16, colour: '#61afef'};
  },
};
