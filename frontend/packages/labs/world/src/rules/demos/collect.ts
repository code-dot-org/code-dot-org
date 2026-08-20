// "Collects Things" — a walker takes the coin it walks into.
//
// The demo whose point is something LEAVING, which is exactly what a single
// frame cannot show: a still is a walker beside a coin, or a walker beside
// nothing, and neither says a coin was collected (specs/RULE_DEMOS.md).

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
} from '../../engine';

import type {RuleDemo, RuleModules} from './types';

export const collectDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/collect'],
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = new WorldBuilder({id: 'collect', name: 'Collection'})
      .useRules([modules['rules/collect'].default as never])
      .instantiate();
    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      // Can Move as well as Collects: Collection does not imply motion, and a
      // collector that cannot move never reaches a coin. Getting this wrong is
      // what a demo world costs — the first attempt recorded nothing happening.
      .useTraits([
        of('rules/collect', 'CollectsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, new Vector(20, 70))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(1.6, 0))
      .instantiate('walker');
    world.addActor(walker);
    const coins = [70, 120, 170].map((x, n) => {
      const coin = new ActorBuilder({id: `coin${n}`, name: 'coin'})
        .useTraits([of('rules/collect', 'CanBeCollectedTrait')])
        .set(PositionProperty, new Vector(x, 70))
        .instantiate(`coin${n}`);
      world.addActor(coin);
      return coin;
    });
    return {world, cast: {walker, coins}};
  },

  look(id: string) {
    return id === 'walker'
      ? {width: 16, height: 16, colour: '#c678dd'}
      : {width: 12, height: 12, colour: '#f6c453'};
  },
};
