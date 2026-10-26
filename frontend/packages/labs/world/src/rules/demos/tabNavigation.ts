// "Moves Focus with Tab" — the keyboard's way around a screen.
//
// Three fields in a row and the focus stepping along them, one Tab at a time.
// What the strip has to show is that the focus is a THING that moves rather
// than a click that happens: the same three boxes, and the lit one walking.
//
// The lit box is drawn from `focused`, which is the property the rule writes,
// so the picture cannot disagree with the rule about which field has it.
//
// ARRIVING IS NOT MOVING ON, and the demo has to arrive before it can move:
// the Tab that carries a player onto the canvas was pressed while the page
// still had the keyboard, so the rule takes `gainedKeyboard` as the moment the
// first field lights and a Tab after that as the step to the next.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {TAB_CAP, addCaps, capLook} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` — what the rule writes when focus moves. */
let focused: unknown;

/** The frames a Tab is held for, as elapsed seconds. */
const TABS: ReadonlyArray<readonly [number, number]> = [
  [0.7, 0.85],
  [1.4, 1.55],
  [2.1, 2.25],
];

export const tabNavigationDemo: RuleDemo = {
  rules: ['rules/tabNavigation'],
  seconds: 2.8,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    focused = of('rules/tabNavigation', 'FocusedProperty');
    const world = demoWorld('tabNavigation', modules, tabNavigationDemo.rules);

    [0, 1, 2].forEach(index => {
      const field = new ActorBuilder({id: `field${index}`, name: 'field'})
        .useTraits([of('rules/tabNavigation', 'CanBeFocusedTrait')])
        .set(PositionProperty, new Vector(40 + index * 56, 52))
        .instantiate(`field${index}`);
      field.set(of('rules/tabNavigation', 'TabOrderProperty'), index as never);
      world.addActor(field);
    });
    addCaps(world, TAB_CAP);

    return {world, cast: {}};
  },
  input(world: World, seconds: number) {
    // The player arrives at the game once, at the start. Not a Tab press —
    // nothing in the pressed keys can tell arriving from moving on, which is
    // the distinction the rule is built around (`World.gainedKeyboard`).
    if (Math.round(seconds * 60) === Math.round(0.2 * 60)) {
      world.gainedKeyboard();
    }
    const held = TABS.some(([from, to]) => seconds >= from && seconds < to);
    world.setInput(held ? ['tab'] : []);
  },
  look(id, actor, world) {
    const cap = capLook(id, world, TAB_CAP);
    if (cap) {
      return cap;
    }
    const lit = (actor as {get(p: unknown): boolean}).get(focused as never);
    return {
      width: 40,
      height: 26,
      color: lit ? '#61afef' : '#3b4048',
    };
  },
};
