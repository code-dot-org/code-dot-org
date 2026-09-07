// "Zaps" — asked constantly, it answers at its own rate.
//
// The rule owns the RATE and nothing else: it raises "zaps" and a project
// decides what a zap sends (`rules/zaps`). So this demo is both halves — a
// timer asking every frame, and a handler that sends an energy ball — and what
// strip shows is the gap between them. The zapper is asked sixty times a second
// and answers four, which is the reload time made visible as the spacing of
// the balls.
//
// A timer with a period under one frame is the honest way to ask constantly.
// The alternative is a key nobody is pressing, which is the device problem
// these demos are deliberately not solving yet (specs/RULE_DEMOS.md).
//
// The balls expire rather than accumulate. They would otherwise cross the
// frame and keep going, which is an actor loose outside the picture and a
// demo world to fix.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Seconds between zaps — four a second, so six balls in the strip. */
const RECHARGE = 0.25;

export const zapsDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/time', 'rules/expires', 'rules/zaps'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('zaps', modules, zapsDemo.rules);
    // A rule's block compiles to an action DESCRIPTOR, not a function; the
    // world is what runs one. `make ⟨who⟩ zap` is the block a project would
    // put under a key press, and this is that same block called by hand.
    const zap = () => world.act(of('rules/zaps', 'MakeZapAction'), zapper);

    let sent = 0;
    const zapper = new ActorBuilder({id: 'zapper', name: 'zapper'})
      .useTraits([
        of('rules/zaps', 'ZapsTrait'),
        of('rules/time', 'HasATimerTrait'),
      ])
      .set(of('rules/zaps', 'RechargeTimeProperty'), RECHARGE)
      // Under a frame, so the ask happens every tick and the ANSWER is the
      // only thing deciding when a ball appears.
      .set(of('rules/time', 'TimerPeriodProperty'), 0.001)
      .set(PositionProperty, new Vector(24, 64))
      .on(of('rules/time', 'TimerFiresEvent'), zap)
      .on(of('rules/zaps', 'ZapsEvent'), () => {
        const id = `ball${sent++}`;
        world.addActor(
          new ActorBuilder({id, name: 'ball'})
            .useTraits([
              of('rules/motion', 'CanMoveTrait'),
              of('rules/expires', 'ExpiresTrait'),
            ])
            .set(PositionProperty, new Vector(40, 64))
            .set(of('rules/motion', 'VelocityProperty'), new Vector(1.2, 0))
            // Just long enough to cross the frame and go out at the far side.
            .set(of('rules/expires', 'LifetimeProperty'), 1.3)
            .instantiate(id),
        );
      })
      .instantiate('zapper');
    world.addActor(zapper);

    return {world, cast: {zapper}};
  },
  look(id: string) {
    return id === 'zapper'
      ? {width: 24, height: 24, color: '#98c379'}
      : // A ball rather than a bolt: round is what an energy ball is, and a
        // box is all this recorder draws (specs/RULE_DEMOS.md).
        {width: 8, height: 8, color: '#61d8ff'};
  },
};
