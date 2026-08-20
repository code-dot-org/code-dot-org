// "Has Health" — walk into a spike and lose some.
//
// Health is a NUMBER, and a demonstration of losing it has to be visible. So
// this is the demo that made `look` take the actor as well as its id: the
// player shrinks as its health goes, which is why it reads at all
// (specs/RULE_DEMOS.md).
//
// It walks INTO the spike rather than starting in it, so the recording has a
// before as well as an after — and then stays, so the mercy time shows as a
// rhythm rather than as one hit.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` — the property the box's size comes from. */
let healthOf: unknown;

export const healthDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/health'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    healthOf = of('rules/health', 'HealthProperty');
    const world = demoWorld('health', modules, healthDemo.rules);
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/health', 'HasHealthTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, new Vector(40, 64))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.4, 0))
      .instantiate('player');
    world.addActor(player);
    const spike = new ActorBuilder({id: 'spike', name: 'spike'})
      .useTraits([of('rules/health', 'DealsDamageTrait')])
      .set(PositionProperty, new Vector(90, 64))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(24, 24))
      .instantiate('spike');
    world.addActor(spike);
    return {world, cast: {player, spike}};
  },
  look(id: string, actor: unknown) {
    if (id === 'spike') {
      return {width: 24, height: 24, colour: '#e06c75'};
    }
    // Three health is a full box; nothing left is a sliver. The size IS the
    // health bar, because a demo of a number needs the number to be visible.
    const left = (actor as {get(p: unknown): number}).get(healthOf as never);
    const side = 8 + Math.max(0, left) * 4;
    return {width: side, height: side, colour: '#98c379'};
  },
};
