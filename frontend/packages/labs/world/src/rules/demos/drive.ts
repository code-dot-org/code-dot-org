// "Driven by Arrow Keys" — left and right TURN, up pushes the way you face.
//
// The rule that is unmistakable in motion and impossible in a still: the same
// two keys as Arrow Keys, doing something entirely different with them. So the
// strip is one long turn under thrust, and the cluster shows up-and-right held
// throughout while the box travels an arc rather than a diagonal.
//
// Drag is elected as well, and not as decoration. Nothing in the rule ever
// slows an actor down — that is stated in the rule itself — so a box thrusting
// for two and a half seconds accelerates out of the frame. A terminal speed is
// what makes it a demo, and it is also what a project would do.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {ARROW_CAPS, addCaps, capLook, keyboard} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const driveDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/drive', 'rules/drag'],
  seconds: 2.5,
  input: keyboard([
    [0, 2.5, ['up arrow']],
    // A moment of straight running first, so the turn is visibly a TURN and
    // not just the shape the thing was always going to fly.
    [0.3, 2.5, ['right arrow']],
  ]),
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('drive', modules, driveDemo.rules);
    const ship = new ActorBuilder({id: 'ship', name: 'ship'})
      .useTraits([
        of('rules/drive', 'DrivenByArrowKeysTrait'),
        of('rules/drag', 'SlowsDownTrait'),
      ])
      // Thrust against drag settles at `thrust / -ln(1 - drag)`, which these
      // put at about sixty pixels a second; turning a hundred and forty
      // degrees a second at that speed draws a circle about fifty pixels
      // across, which is a loop the frame can hold with room to spare.
      //
      // A rotation of zero faces UP, so the start is low in the frame and the
      // loop is drawn above it. Facing right and starting in the middle put
      // the first quarter of the circle off the top of the picture.
      .set(of('rules/drive', 'ThrustProperty'), 1.4)
      .set(of('rules/drive', 'TurnSpeedProperty'), 140)
      .set(of('rules/drag', 'DragProperty'), 0.9)
      .set(PositionProperty, new Vector(60, 92))
      .instantiate('ship');
    world.addActor(ship);
    addCaps(world, ARROW_CAPS);
    return {world, cast: {ship}};
  },
  look(id, _actor, world) {
    return (
      capLook(id, world, ARROW_CAPS) ?? {
        width: 16,
        height: 16,
        colour: '#e06c75',
      }
    );
  },
};
