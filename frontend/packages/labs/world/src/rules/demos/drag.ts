// "Slows Down" — a thing thrown across the frame comes to rest.
//
// Two boxes with the same push and different drag, because slowing is a
// comparison: one box decelerating is hard to tell from one box moving, and
// two side by side make the rule the difference between them.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const dragDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/drag'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('drag', modules, dragDemo.rules);
    const cast: Record<string, unknown> = {};
    for (const [id, y, drag] of [
      ['sticky', 44, 0.95],
      ['slippy', 86, 0.6],
    ] as const) {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/motion', 'CanMoveTrait'),
          of('rules/drag', 'SlowsDownTrait'),
        ])
        .set(PositionProperty, new Vector(20, y))
        .set(of('rules/motion', 'VelocityProperty'), new Vector(1.1, 0))
        .set(of('rules/drag', 'DragProperty'), drag)
        .instantiate(id);
      world.addActor(actor);
      cast[id] = actor;
    }
    return {world, cast};
  },
  look(id: string) {
    return id === 'sticky'
      ? {width: 16, height: 16, colour: '#e06c75'}
      : {width: 16, height: 16, colour: '#61afef'};
  },
};
