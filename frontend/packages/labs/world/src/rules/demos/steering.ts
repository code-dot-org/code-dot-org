// "Chases and Flees" — one actor goes after another and stops when close.
//
// The hunter starts across the frame from the prey, so the chase is the whole
// of what happens. `keep distance` is what makes it stop rather than climb onto
// it, and a still taken at any point is two boxes at some distance.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const steeringDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/solid', 'rules/steering'],
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('steering', modules, steeringDemo.rules);
    const prey = new ActorBuilder({id: 'prey', name: 'prey'})
      .set(PositionProperty, new Vector(150, 64))
      .instantiate('prey');
    world.addActor(prey);
    const hunter = new ActorBuilder({id: 'hunter', name: 'hunter'})
      .useTraits([of('rules/steering', 'ChasesTrait')])
      .set(PositionProperty, new Vector(24, 100))
      .set(of('rules/steering', 'KeepDistanceProperty'), 20)
      .instantiate('hunter');
    world.addActor(hunter);
    // The target is set after both exist, which is how a game does it too:
    // `set actor to chase of ⟨…⟩ to ⟨the nearest Player⟩`.
    hunter.set(of('rules/steering', 'ActorToChaseProperty'), prey as never);
    return {world, cast: {hunter, prey}};
  },

  look(id: string) {
    // The hunter warm and the prey cool, so which is chasing which is legible
    // in a single frame even though the chase is not.
    return id === 'hunter'
      ? {width: 16, height: 16, colour: '#e06c75'}
      : {width: 16, height: 16, colour: '#7fd1b9'};
  },
};
