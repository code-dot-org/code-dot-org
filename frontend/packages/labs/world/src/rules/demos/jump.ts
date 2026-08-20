// "Jumps" — the verb that makes a platformer.
//
// A walker crossing a floor with a gap in it, holding right the whole way and
// tapping the space bar twice: once to clear the gap, once for nothing in
// particular. What the strip has to show is that the SECOND tap in the air
// does nothing — a jump with no limit is what a learner writes by hand, so a
// demo that only ever jumped from the ground would demonstrate the wrong half
// of the rule.
//
// The floor is two actors with a hole between them rather than one, because a
// gap is what a jump is FOR. A jump over flat ground is an actor bobbing.
//
// A gentler jump than the default: three units clears about fifty pixels,
// which fits a 128-pixel frame. The default four is sized for a real level,
// which is ten tiles tall rather than four.
//
// The floor sits high in the frame so the space bar has somewhere to be. It
// was at the bottom to begin with, and the bar — which is a wide dark box at
// the bottom middle — landed exactly across the hole and filled it in. The
// strip showed a box hopping over nothing.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {SPACE_CAP, addCaps, capLook} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `input` — asking to jump is a world action. */
let jumpAction: unknown;

export const jumpDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/gravity', 'rules/jump'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    jumpAction = of('rules/jump', 'MakeJumpAction');
    const world = demoWorld('jump', modules, jumpDemo.rules);

    const ground = (id: string, x: number, width: number) =>
      world.addActor(
        new ActorBuilder({id, name: 'ground'})
          .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
          .set(PositionProperty, new Vector(x, 88))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(width, 16))
          .instantiate(id),
      );
    // A one-tile hole between them, at 96 to 128.
    ground('left', 48, 96);
    ground('right', 160, 64);

    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/jump', 'JumpsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(of('rules/jump', 'JumpStrengthProperty'), 3)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .set(PositionProperty, new Vector(14, 64))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.6, 0))
      .instantiate('player');
    world.addActor(player);
    addCaps(world, SPACE_CAP);

    return {world, cast: {player}};
  },
  // Twice. The first is on the lip of the hole and clears it; the second is in
  // mid-air with nothing left, and the rule refuses it — which is the half of
  // the rule a jumping box does not show.
  input(world: World, seconds: number) {
    const held = [
      [1.3, 1.42],
      [1.6, 1.72],
    ].some(([from, to]) => seconds >= from && seconds < to);
    world.setInput(held ? ['space'] : []);
    if (!held) {
      return;
    }
    // `make ⟨who⟩ jump` is a block, which compiles to an action the WORLD
    // runs; this is the line a project would put under the key press. Asked
    // on EVERY frame the bar is down, because the rule is what says no — a
    // demo that asked once per press would be doing the rule's job for it.
    const player = [...world.actors].find(one => one.id === 'player');
    if (player) {
      world.act(jumpAction as never, player as never);
    }
  },
  look(id, _actor, world) {
    if (id === 'player') {
      return {width: 16, height: 16, colour: '#61afef'};
    }
    return (
      capLook(id, world, SPACE_CAP) ?? {
        width: id === 'left' ? 96 : 64,
        height: 16,
        colour: '#5a7d5a',
      }
    );
  },
};
