// "Shoots" — asked constantly, it fires at its own rate.
//
// The rule owns the RATE and nothing else: it raises "fires" and a project
// decides what a shot is (`rules/shoots`). So this demo is both halves — a
// timer asking every frame, and a handler that makes a bullet — and what the
// strip shows is the gap between them. The gun is asked sixty times a second
// and answers four, which is the reload time made visible as the spacing of
// the bullets.
//
// A timer with a period under one frame is the honest way to ask constantly.
// The alternative is a key nobody is pressing, which is the device problem
// these demos are deliberately not solving yet (specs/RULE_DEMOS.md).
//
// The bullets expire rather than accumulate. They would otherwise cross the
// frame and keep going, which is an actor loose outside the picture and a
// demo world to fix.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Seconds between shots — four a second, so six bullets in the strip. */
const RELOAD = 0.25;

export const shootsDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/time', 'rules/expires', 'rules/shoots'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('shoots', modules, shootsDemo.rules);
    // A rule's block compiles to an action DESCRIPTOR, not a function; the
    // world is what runs one. `make ⟨who⟩ fire` is the block a project would
    // put under a key press, and this is that same block called by hand.
    const fire = () => world.act(of('rules/shoots', 'MakeFireAction'), gun);

    let shots = 0;
    const gun = new ActorBuilder({id: 'gun', name: 'gun'})
      .useTraits([
        of('rules/shoots', 'ShootsTrait'),
        of('rules/time', 'HasATimerTrait'),
      ])
      .set(of('rules/shoots', 'ReloadTimeProperty'), RELOAD)
      // Under a frame, so the ask happens every tick and the ANSWER is the
      // only thing deciding when a bullet appears.
      .set(of('rules/time', 'TimerPeriodProperty'), 0.001)
      .set(PositionProperty, new Vector(24, 64))
      .on(of('rules/time', 'TimerFiresEvent'), fire)
      .on(of('rules/shoots', 'FiresEvent'), () => {
        const id = `shot${shots++}`;
        world.addActor(
          new ActorBuilder({id, name: 'shot'})
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
      .instantiate('gun');
    world.addActor(gun);

    return {world, cast: {gun}};
  },
  look(id: string) {
    return id === 'gun'
      ? {width: 24, height: 24, colour: '#98c379'}
      : {width: 10, height: 6, colour: '#e06c75'};
  },
};
