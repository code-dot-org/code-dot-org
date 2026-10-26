// "Flaps and Glides" — height bought in beats, and spent gliding.
//
// A bat hunting something above and to the side of it, in a room with no
// gravity and no floor: every pixel of height in the strip is a flap, because
// there is nothing else here that lifts anything. What the recording shows is
// the RHYTHM — a few quick climbs, then a long shallow drift — which is the
// whole difference between this and an actor that simply flies toward a target.
//
// The quarry sits still. A demo where both things move is a demo of two rules,
// and the one being shown is the bat's.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const flappingDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/flapping'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('flapping', modules, flappingDemo.rules);

    const prey = new ActorBuilder({id: 'prey', name: 'prey'})
      .set(PositionProperty, new Vector(160, 32))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(12, 12))
      .instantiate('prey');
    world.addActor(prey);

    const bat = new ActorBuilder({id: 'bat', name: 'bat'})
      .useTraits([
        of('rules/flapping', 'FlapsAndGlidesTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      // Gentler than the defaults, which are sized for a level ten tiles tall:
      // at the shipped lift a bat crosses this frame vertically in a beat and
      // a half, and the glide it is being contrasted with never shows.
      .set(of('rules/flapping', 'FlapLiftProperty'), 0.9)
      .set(of('rules/flapping', 'FlapSpeedProperty'), 0.5)
      .set(of('rules/flapping', 'GlideSpeedProperty'), 0.6)
      .set(of('rules/flapping', 'SecondsBetweenFlapsProperty'), 0.3)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(30, 100))
      .instantiate('bat');
    bat.set(of('rules/flapping', 'ActorToHuntProperty'), prey as never);
    world.addActor(bat);

    return {world, cast: {bat, prey}};
  },
  look(id) {
    return id === 'bat'
      ? {width: 14, height: 14, color: '#c678dd'}
      : {width: 12, height: 12, color: '#e5c07b'};
  },
};
