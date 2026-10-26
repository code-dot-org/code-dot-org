// "Takes Gestures" — a card that follows the finger, and keeps following it.
//
// The Mouse demo shows that a click is a PLACE. This one shows the thing that
// is true of a gesture and not of a click: it belongs to whatever the press
// began on, so the card goes on moving after the pointer has left it.
//
// The card moves by ADDING what the event carried, which is the other half of
// the point. `is dragged by ⟨movement⟩` hands over how far the pointer went
// since the last frame, and a thing that follows a finger is that number added
// up — no rule reads the card's position to work it out, and nothing anywhere
// remembers where the pointer was.
//
// The pointer is an actor moved by the script, as the Mouse demo's is, so
// nothing the rule reads comes from a picture.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {pointerFor} from './device';
import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Where the card starts, and where the pointer sets off from. */
const CARD = new Vector(56, 60);
const START = new Vector(18, 104);

/** The press, as a stretch of time: down at the card, up at the end. */
const PRESS_AT = 0.7;
const RELEASE_AT = 2.1;

/** Where the pointer is at `seconds`. */
function pointerAt(seconds: number): Vector {
  const legs: ReadonlyArray<readonly [number, number, Vector, Vector]> = [
    // To the card, before anything is pressed.
    [0, PRESS_AT, START, CARD],
    // …and across, with the button down. It ends well past where the card
    // began, which is what shows the card is still listening.
    [PRESS_AT, RELEASE_AT, CARD, new Vector(150, 104)],
    // …and away, with the button up: the card must not follow this.
    [RELEASE_AT, 2.6, new Vector(150, 104), new Vector(178, 40)],
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
  return new Vector(178, 40);
}

const holding = (seconds: number) =>
  seconds >= PRESS_AT && seconds < RELEASE_AT;

export const gesturesDemo: RuleDemo = {
  rules: ['rules/gestures'],
  seconds: 2.6,
  input(world: World, seconds: number) {
    const at = pointerAt(seconds);
    world.setPointer(pointerFor(world, at), holding(seconds) ? ['left'] : []);
    [...world.actors]
      .find(one => one.id === 'pointer')
      ?.set(PositionProperty, at);
  },
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('gestures', modules, gesturesDemo.rules);

    const card = new ActorBuilder({id: 'card', name: 'card'})
      .useTraits([of('rules/gestures', 'TakesGesturesTrait')])
      .set(PositionProperty, CARD)
      .on(of('rules/gestures', 'IsDraggedByEvent'), (_world, who, movement) => {
        const by = movement as Vector;
        const at = who.get(PositionProperty) as Vector;
        who.set(PositionProperty, new Vector(at.x + by.x, at.y + by.y));
      })
      .instantiate('card');
    world.addActor(card);

    world.addActor(
      new ActorBuilder({id: 'pointer', name: 'pointer'})
        .set(PositionProperty, pointerAt(0))
        .instantiate('pointer'),
    );

    return {world, cast: {card}};
  },
  look(id, _actor, world) {
    if (id === 'pointer') {
      return world.isButtonDown('left')
        ? {width: 14, height: 14, color: '#ffffff'}
        : {width: 8, height: 8, color: '#abb2bf'};
    }
    return {width: 34, height: 26, color: '#56b6c2'};
  },
};
