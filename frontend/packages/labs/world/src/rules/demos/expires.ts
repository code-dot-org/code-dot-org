// "Expires" — things put into the world go away again.
//
// Five boxes with staggered lifetimes, so the frame empties left to right
// rather than all at once: one vanishing is an event, five vanishing in
// sequence is a rule.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const expiresDemo: RuleDemo = {
  rules: ['rules/expires'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('expires', modules, expiresDemo.rules);
    const cast: Record<string, unknown> = {};
    [26, 62, 96, 130, 164].forEach((x, n) => {
      const id = `spark${n}`;
      const actor = new ActorBuilder({id, name: id})
        .useTraits([of('rules/expires', 'ExpiresTrait')])
        .set(PositionProperty, new Vector(x, 64))
        .set(of('rules/expires', 'LifetimeProperty'), 0.4 + n * 0.4)
        .instantiate(id);
      world.addActor(actor);
      cast[id] = actor;
    });
    return {world, cast};
  },
  look() {
    return {width: 16, height: 16, colour: '#d19a66'};
  },
};
