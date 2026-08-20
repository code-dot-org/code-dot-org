// "Takes Keyboard Input" — a key going down is an event, and the project says
// what it means.
//
// The counterpart to Arrow Keys, and worth reading beside it: that rule is
// about a key being HELD, and this one is about the moment it goes down. So
// the strip is taps rather than a hold — the bar lights, the box hops once,
// and holding it longer does nothing at all.
//
// The handler is written here because the rule has none. It raises "presses"
// and owns nothing about what follows (`rules/input`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {SPACE_CAP, addCaps, capLook, keyboard} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** How far a tap moves it. Five taps, and it crosses the frame. */
const HOP = 26;

export const inputDemo: RuleDemo = {
  rules: ['rules/input'],
  seconds: 2.5,
  // Five taps, the third one HELD — and held is no different from tapped,
  // which is the distinction the whole demo exists to draw.
  input: keyboard([
    [0.3, 0.4, ['space']],
    [0.7, 0.8, ['space']],
    [1.1, 1.8, ['space']],
    [2.0, 2.1, ['space']],
    [2.3, 2.4, ['space']],
  ]),
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('input', modules, inputDemo.rules);
    const hopper = new ActorBuilder({id: 'hopper', name: 'hopper'})
      .useTraits([of('rules/input', 'TakesKeyboardInputTrait')])
      .set(PositionProperty, new Vector(34, 48))
      .on(of('rules/input', 'PressesEvent'), () => {
        const at = hopper.get(PositionProperty);
        hopper.set(PositionProperty, new Vector(at.x + HOP, at.y));
      })
      .instantiate('hopper');
    world.addActor(hopper);
    addCaps(world, SPACE_CAP);
    return {world, cast: {hopper}};
  },
  look(id, _actor, world) {
    return (
      capLook(id, world, SPACE_CAP) ?? {
        width: 18,
        height: 18,
        colour: '#98c379',
      }
    );
  },
};
