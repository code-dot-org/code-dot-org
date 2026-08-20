// "Has Physics" — a thing with a speed goes somewhere.
//
// The rule that looked unfilmable, and is not: having physics IS a box that
// drifts, and every other demo here is one of these with something added
// (specs/RULE_DEMOS.md). Two boxes at different speeds, so the frame says
// "speed" rather than merely "motion".

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const physicsDemo: RuleDemo = {
  rules: ['rules/motion'],
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('physics', modules, physicsDemo.rules);
    const cast: Record<string, unknown> = {};
    for (const [id, y, speed] of [
      ['fast', 44, 0.7],
      ['slow', 86, 0.3],
    ] as const) {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([of('rules/motion', 'CanMoveTrait')])
        .set(PositionProperty, new Vector(20, y))
        .set(of('rules/motion', 'VelocityProperty'), new Vector(speed, 0))
        .instantiate(id);
      world.addActor(actor);
      cast[id] = actor;
    }
    return {world, cast};
  },
  look(id: string) {
    return id === 'fast'
      ? {width: 16, height: 16, colour: '#61afef'}
      : {width: 16, height: 16, colour: '#4b6b8a'};
  },
};
