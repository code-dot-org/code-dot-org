// "Portrait" — the character whose turn it is to speak.
//
// A picture and two movements. The picture alone would not earn a place on the
// shelf — `set sprite` is one row and anybody can write it — but a portrait
// that cannot enter or leave is not what anybody means by one, and the entering
// is the part that is fiddly: from where, over how long, and fading or not.
//
// SO IT SHIPS ITS OWN TWEENS. `enters` and `leaves` are defined in this file
// and played by name — the plainest example of what a definition is for:
// described once, played from any handler, and named so something can wait for
// it to finish.
//
// They fade and nothing else, for now. Sliding as it fades is the obvious next
// thing and wants a destination worked out from where the portrait already
// stands, which a definition can do — it is a function of the actor — but is
// more block than this needs to be useful.
//
// It starts invisible. A portrait placed on a map before anybody has spoken
// should not be standing there — `enters` is what puts it on screen, and a
// default of visible would make the entrance a thing you cannot see happen.

import {actorFile, num, setSprite} from './workspace';

/** The sprite it wears until a project gives it a face of its own. */
export const PORTRAIT_SPRITE = 'player';

/** `set opacity of ⟨this actor⟩ to ⟨value⟩` — a tween destination, or a row. */
const opacity = (value: number) => ({
  type: 'world_set_Appearance_OpacityProperty',
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: num(value),
  },
});

const tween = (name: string, y: number, seconds: number, rows: object[]) => ({
  type: 'world_define_tween',
  // A stable id, because a `play tween` names the DEFINING BLOCK — one Blockly
  // generates on load would differ every time the file was opened.
  id: `portrait${name}`,
  x: 20,
  y,
  fields: {NAME: name, CURVE: 'ending slowly'},
  inputs: {
    SECONDS: {block: {type: 'math_number', fields: {NUM: seconds}}},
    DO: {
      block: rows.reduceRight((next, row) => ({...row, next: {block: next}})),
    },
  },
});

export const portraitActor = actorFile(
  'Portrait',
  [
    // No `use trait` for being positioned or drawn: every actor has both
    // without electing either, and saying so would be electing a fact rather
    // than an ability — the same reason a Coin does not elect "Can Collide".
    setSprite(`${PORTRAIT_SPRITE}.png`),
    // Off screen until it is asked for. A portrait standing there before
    // anybody has spoken makes its own entrance impossible to see.
    opacity(0),
  ],
  {
    handlers: [
      tween('enters', 200, 0.3, [opacity(1)]),
      tween('leaves', 340, 0.2, [opacity(0)]),
    ],
  },
);
