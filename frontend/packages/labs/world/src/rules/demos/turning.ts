// "Turns at Walls" — go until something stops you, then go the other way.
//
// A corridor with a wall at each end and a box crossing it. What the strip has
// to show is the TURN, which is a thing that only exists in the frames either
// side of it: a box travelling left is a box travelling left, and only what it
// did a moment ago says whether it was sent that way or simply started there.
//
// So the corridor is short enough to cross twice inside the recording. A demo
// with one turn in it reads as a box that stopped and started again.
//
// No gravity here, and the walls are Solid rather than ground. What turns the
// box is being STOPPED, and Solid is what stops it; gravity would add a fall
// to a strip whose subject is horizontal.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const turningDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/solid', 'rules/turning'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('turning', modules, turningDemo.rules);

    const wall = (id: string, x: number) =>
      world.addActor(
        new ActorBuilder({id, name: 'wall'})
          .useTraits([
            of('rules/solid', 'SolidTrait'),
            of('rules/collisions', 'CanCollideTrait'),
          ])
          .set(PositionProperty, new Vector(x, 64))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 96))
          .instantiate(id),
      );
    wall('west', 16);
    wall('east', 176);

    const mover = new ActorBuilder({id: 'mover', name: 'mover'})
      .useTraits([
        of('rules/turning', 'TurnsWhenItHitsSomethingTrait'),
        of('rules/collisions', 'CanCollideTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      // Fast enough to reach a wall twice in two and a half seconds: the
      // corridor is 144 pixels of clear floor and this crosses it in 1.2.
      .set(of('rules/turning', 'TravelSpeedProperty'), 1.2)
      .set(of('rules/turning', 'TurnByProperty'), 180)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .set(PositionProperty, new Vector(64, 64))
      .instantiate('mover');
    world.addActor(mover);

    return {world, cast: {mover}};
  },
  look(id) {
    return id === 'mover'
      ? {width: 16, height: 16, color: '#e06c75'}
      : {width: 16, height: 96, color: '#5a7d5a'};
  },
};
