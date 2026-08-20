// "Moves with Arrow Keys" — a held key walks, and letting go stops.
//
// The first demo with hands in it. What makes it a demonstration rather than a
// box wandering is that the cluster in the corner lights as the box goes: the
// cause is in the frame, one key at a time, and the box stops DEAD in the gap
// where nothing is held, which is the other half of what the rule says.
//
// BOTH DIRECTIONS, which is what the rule's two traits are for: a platformer
// elects across and leaves the vertical to gravity, a top-down game elects
// both. This demo is the top-down case, since a strip that only ever went
// sideways would look like a rule that only goes sideways — which is what the
// rule was before it was split, and what an early cut of this demo recorded: a
// box sitting perfectly still with the down arrow lit.
//
// Slow speeds, because the frame is 192 by 128 and the default 1.5 crosses it
// in a second and a bit.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {ARROW_CAPS, addCaps, capLook, keyboard} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const arrowsDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/arrows'],
  seconds: 2.5,
  input: keyboard([
    [0, 0.7, ['right arrow']],
    // A gap on purpose: nothing held, and the box stands dead still.
    [1.0, 1.6, ['down arrow']],
    // Two at once, which the two steps have to agree about: they share a
    // moment, so a diagonal is the proof they commute.
    [1.9, 2.5, ['left arrow', 'up arrow']],
  ]),
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('arrows', modules, arrowsDemo.rules);
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/arrows', 'MovesAcrossTrait'),
        of('rules/arrows', 'MovesDownTrait'),
      ])
      .set(of('rules/arrows', 'AcrossSpeedProperty'), 0.8)
      .set(of('rules/arrows', 'DownSpeedProperty'), 0.8)
      .set(PositionProperty, new Vector(70, 34))
      .instantiate('player');
    world.addActor(player);
    addCaps(world, ARROW_CAPS);
    return {world, cast: {player}};
  },
  look(id, _actor, world) {
    return (
      capLook(id, world, ARROW_CAPS) ?? {
        width: 18,
        height: 18,
        colour: '#61afef',
      }
    );
  },
};
