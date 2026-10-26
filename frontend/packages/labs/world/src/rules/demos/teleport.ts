// "Has Teleport Pads" — step on one, arrive at the other.
//
// The pads are the SAME COLOR, because that is how the rule links them: a pad
// sends a traveler to another pad of its own color, so a demo with two colors
// in it would be a demo of two rules that never meet.
//
// The far pad is BEHIND the walker rather than in front, which is what keeps
// the loop inside the frame. Walking right onto the near pad and appearing at
// the far one on the left means the box crosses the picture, vanishes, and
// comes back — twice in the recording, so what happened is unmistakable. Pads
// laid out the other way round would have sent it off the right-hand edge,
// where a recording cannot follow it (`demos/types.filmed`).
//
// `takes any pad it touches` is what makes it automatic. The player's half of
// this rule is a key handler calling `use the pad`; an enemy has no choice,
// and an enemy is what a demonstration can film without hands in it.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` — the color a pad says it is. */
let padColor: unknown;

export const teleportDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/teleport'],
  // Short, because the rule stops a traveler going sideways on the way and
  // does not hand the speed back: everything after the arrival is a box
  // standing on a pad, and a third of a strip spent standing still reads as a
  // recording that ran out rather than as a beat.
  seconds: 2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    padColor = of('rules/teleport', 'PadColorProperty');
    const world = demoWorld('teleport', modules, teleportDemo.rules);

    const pad = (id: string, x: number) =>
      world.addActor(
        new ActorBuilder({id, name: 'pad'})
          .useTraits([of('rules/teleport', 'IsATeleportPadTrait')])
          .set(PositionProperty, new Vector(x, 80))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(28, 12))
          .instantiate(id),
      );
    pad('near', 40);
    pad('far', 152);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/teleport', 'UsesTeleportPadsTrait'),
        of('rules/collisions', 'CanCollideTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(of('rules/teleport', 'TakesAnyPadItTouchesProperty'), true)
      // Short enough that the trip is visible as a pause: the rule holds a
      // traveler still for `travel seconds` before it arrives.
      .set(of('rules/teleport', 'TravelSecondsProperty'), 0.25)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(72, 80))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.9, 0))
      .instantiate('walker');
    world.addActor(walker);

    return {world, cast: {walker}};
  },
  look(id, actor) {
    if (id === 'walker') {
      // NOT the pads' blue, which is what the first cut drew it: a traveler
      // standing on a pad was then a blue box on a blue box, and the strip
      // read as a pad flickering rather than as something arriving.
      return {width: 14, height: 14, color: '#e5c07b'};
    }
    // The pad's own color, read off the pad: what links two pads is what they
    // say they are, so a demo that painted them a color of its own would be
    // showing the one fact the rule turns on and getting it from somewhere
    // else.
    const said = (actor as {get(p: unknown): string}).get(padColor as never);
    return {width: 28, height: 12, color: said || '#4da3ff'};
  },
};
