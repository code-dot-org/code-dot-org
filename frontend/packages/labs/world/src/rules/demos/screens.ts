// "Shows Screens" — maps stacked over one another, and the way back down.
//
// The only demo whose subject is not an actor doing something: what moves here
// is WHICH MAPS ARE LOADED. So each screen is one card, and the strip shows
// them arriving over each other and one of them going again.
//
// TWO FORWARD AND ONE BACK, which is the shortest run that shows both
// directions AND ends somewhere other than it started — the check every demo
// answers to compares the first frame with the last, and a demo that returns
// home looks from the outside like a demo that did nothing.
//
// The actions are called from the script rather than by a button, for the
// reason the mouse demo draws its own pointer: a demo that pressed something
// would be showing a button, and what this is about is the stack underneath.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

const SCREENS = ['maps/one', 'maps/two', 'maps/three'] as const;

/** Where each screen's card sits, so the three are told apart at a glance. */
const PLACES = [new Vector(52, 44), new Vector(92, 64), new Vector(132, 84)];

/** What happens when: go in, go in, come back. */
const SCRIPT: ReadonlyArray<readonly [number, 'to' | 'back', number]> = [
  [0.6, 'to', 1],
  [1.3, 'to', 2],
  [2.0, 'back', 0],
];

/**
 * The rule's blocks, kept from `build` so `input` can call them.
 *
 * A demo's `input` is handed the world and the clock and nothing else; the
 * actions live on the compiled module, which only `build` sees.
 */
let actions: RuleModules[string] | undefined;

/** A map of one card, at a place. */
const screen = (id: string, at: Vector) => ({
  actors: [{type: 'actors/card', id}],
  script: (_world: World, placed: Record<string, unknown>) => {
    (placed[id] as {set(p: unknown, v: Vector): void} | undefined)?.set(
      PositionProperty,
      at,
    );
  },
});

const call = (world: World, name: string, ...args: unknown[]) =>
  (
    actions?.[name] as
      | {apply(world: World, ...rest: unknown[]): void}
      | undefined
  )?.apply(world, ...args);

export const screensDemo: RuleDemo = {
  rules: ['rules/screens'],
  seconds: 2.6,
  input(world: World, seconds: number) {
    for (const [when, what, which] of SCRIPT) {
      // The one frame this moment falls in, so each is done once.
      if (seconds >= when && seconds < when + 1 / 60) {
        if (what === 'to') {
          call(world, 'GoToScreenAction', SCREENS[which]);
        } else {
          call(world, 'GoBackAction');
        }
      }
    }
  },
  build(modules: RuleModules) {
    const world = demoWorld('screens', modules, screensDemo.rules);
    world.define('actors/card', new ActorBuilder({id: 'card', name: 'card'}));
    SCREENS.forEach((path, at) => {
      world.defineMap(path, screen(`screen${at + 1}`, PLACES[at]) as never);
    });
    actions = modules['rules/screens'];
    call(world, 'GoToScreenAction', SCREENS[0]);
    return {world, cast: {}};
  },
  look(id) {
    // The deeper a screen, the brighter: the strip then reads as a stack
    // rather than as boxes appearing in unrelated places.
    const shade = ['#3b4252', '#4c6494', '#61afef'];
    const at = Number(id.replace('screen', '')) - 1;
    return {
      width: 84 - at * 8,
      height: 58 - at * 6,
      color: shade[at] ?? shade[0],
    };
  },
};
