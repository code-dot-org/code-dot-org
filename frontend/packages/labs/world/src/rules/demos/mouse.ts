// "Takes Mouse Input" and "Can Be Clicked" — a pointer that goes somewhere and
// presses.
//
// The keyboard demos draw a key cap; this one draws the pointer, because a
// mouse is a place as well as a button. It is an ACTOR, moved by the script
// rather than by any rule, and the click is the moment it fattens — the same
// trick as a cap lighting, and for the same reason: the cause has to be in the
// frame or the strip shows a target moving by itself.
//
// What it demonstrates is that a click is a place. The pointer travels to the
// target and presses, and the target answers; the second press happens where
// the target has MOVED to, and it answers again. A demo that clicked in one
// spot would prove nothing about where.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {pointerFor} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Where the target sits, in the order it is clicked there. */
const SPOTS = [
  new Vector(70, 44),
  new Vector(140, 80),
  new Vector(48, 88),
] as const;

/** When the button is held. Each press is inside a stretch of stillness. */
const PRESSES: ReadonlyArray<readonly [number, number]> = [
  [0.9, 1.05],
  [1.9, 2.05],
];

/** Where the pointer is at `seconds` — a walk between the spots it clicks. */
function pointerAt(seconds: number): Vector {
  const legs: ReadonlyArray<readonly [number, number, Vector, Vector]> = [
    [0, 0.9, new Vector(20, 100), SPOTS[0]],
    [1.05, 1.9, SPOTS[0], SPOTS[1]],
    [2.05, 2.5, SPOTS[1], SPOTS[2]],
  ];
  for (const [from, to, start, end] of legs) {
    if (seconds < to) {
      const along = Math.max(0, Math.min(1, (seconds - from) / (to - from)));
      return new Vector(
        start.x + (end.x - start.x) * along,
        start.y + (end.y - start.y) * along,
      );
    }
  }
  return SPOTS[2];
}

const holding = (seconds: number) =>
  PRESSES.some(([from, to]) => seconds >= from && seconds < to);

export const mouseDemo: RuleDemo = {
  rules: ['rules/mouse'],
  seconds: 2.5,
  input(world: World, seconds: number) {
    const at = pointerAt(seconds);
    world.setPointer(pointerFor(world, at), holding(seconds) ? ['left'] : []);
    // The drawn pointer follows the real one rather than the other way round,
    // so nothing the rule reads comes from a picture.
    [...world.actors]
      .find(one => one.id === 'pointer')
      ?.set(PositionProperty, at);
  },
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('mouse', modules, mouseDemo.rules);

    let clicks = 0;
    const target = new ActorBuilder({id: 'target', name: 'target'})
      .useTraits([of('rules/mouse', 'CanBeClickedTrait')])
      .set(PositionProperty, SPOTS[0])
      .on(of('rules/mouse', 'IsClickedWithEvent'), () => {
        clicks++;
        target.set(PositionProperty, SPOTS[Math.min(clicks, SPOTS.length - 1)]);
      })
      .instantiate('target');
    world.addActor(target);

    world.addActor(
      new ActorBuilder({id: 'pointer', name: 'pointer'})
        .set(PositionProperty, pointerAt(0))
        .instantiate('pointer'),
    );

    return {world, cast: {target, clicked: () => clicks}};
  },
  look(id, _actor, world) {
    if (id === 'pointer') {
      // Fatter and brighter while the button is down: that is the click, and
      // there is nothing else in a rectangle to say it with.
      return world.isButtonDown('left')
        ? {width: 14, height: 14, colour: '#ffffff'}
        : {width: 8, height: 8, colour: '#abb2bf'};
    }
    return {width: 28, height: 28, colour: '#c678dd'};
  },
};
