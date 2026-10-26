// "Flies with a Jetpack" — held thrust, and what it costs.
//
// A jump is one impulse and a jetpack is a force you keep applying, and the
// difference is only visible over time: the rise CONTINUES for a moment after
// the bar comes up, because thrust is an acceleration rather than a speed.
// That overshoot is the frame or two this demo exists for, so the bar is
// released well before the end of the recording and the pilot is still going
// up when it happens.
//
// The key cap is in the frame for the same reason it is in the Jump demo: the
// cause of the rise is a hand on a key, and a strip without it is a box that
// rises for no reason anybody can see (`demos/arrows`).

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {SPACE_CAP, addCaps, capLook} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `input` — flying is switched on and off. */
let startFlying: unknown;
let stopFlying: unknown;

export const jetpackDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/gravity', 'rules/jetpack'],
  // Stops while the pilot is still coming down. Two and a half seconds put it
  // back on the floor at exactly the height it started from, which is a strip
  // whose first and last cells are the same picture.
  seconds: 2.2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    startFlying = of('rules/jetpack', 'StartFlyingAction');
    stopFlying = of('rules/jetpack', 'StopFlyingAction');
    const world = demoWorld('jetpack', modules, jetpackDemo.rules);

    world.addActor(
      new ActorBuilder({id: 'floor', name: 'floor'})
        .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
        .set(PositionProperty, new Vector(96, 112))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(192, 16))
        .instantiate('floor'),
    );

    const pilot = new ActorBuilder({id: 'pilot', name: 'pilot'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/jetpack', 'FliesWithAJetpackTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      // Gentler than the default eighteen, which is sized for a level ten
      // tiles tall: at that thrust the pilot is off the top of a 128-pixel
      // frame before the bar has been down half a second. It still has to
      // BEAT GRAVITY, whose default pull is nine — the first cut of this used
      // eight, and recorded a jetpack that fired and barely lifted.
      .set(of('rules/jetpack', 'ThrustProperty'), 14)
      .set(of('rules/jetpack', 'TopFlyingSpeedProperty'), 1.5)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .set(PositionProperty, new Vector(96, 96))
      .instantiate('pilot');
    world.addActor(pilot);
    addCaps(world, SPACE_CAP);

    return {world, cast: {pilot}};
  },
  // Twice, so the strip shows the rhythm a jetpack is played with rather than
  // one long climb — and each release leaves a moment of rise behind it.
  input(world: World, seconds: number) {
    const burst = (at: number) =>
      [
        [0.35, 0.85],
        // The second burst is SHORTER than the first, and stops before the
        // recording does. Held to the end it took the pilot off the top of the
        // frame; ending it early leaves the strip on the fall, which is the
        // other half of a jetpack anyway — and the first and last cells still
        // differ, which is what the check that a demo does anything compares.
        [1.5, 1.9],
      ].some(([from, to]) => at >= from && at < to);
    const held = burst(seconds);
    world.setInput(held ? ['space'] : []);
    const pilot = [...world.actors].find(one => one.id === 'pilot');
    if (!pilot) {
      return;
    }
    // The rule's own two actions, which is what a key handler in a project
    // calls. Asked on the edges only: `start flying` on every frame of a held
    // bar would be a project saying the same thing sixty times a second, and
    // the rule is entitled to assume nobody does that.
    const before = burst(seconds - 1 / 60);
    if (held && !before) {
      world.act(startFlying as never, pilot as never);
    }
    if (!held && before) {
      world.act(stopFlying as never, pilot as never);
    }
  },
  look(id, _actor, world) {
    if (id === 'pilot') {
      return {width: 16, height: 16, color: '#c678dd'};
    }
    return (
      capLook(id, world, SPACE_CAP) ?? {
        width: 192,
        height: 16,
        color: '#5a7d5a',
      }
    );
  },
};
