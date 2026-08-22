// "Ground" — a tile that holds things up.
//
// Two traits and a picture, which by itself is not much of a library entry. It
// earns one as the other half of the Player: an actor that gravity pulls and
// nothing catches falls out of the world, so a shelf offering a Player without
// a Ground offers a bug. The pair is the unit.
//
// BOTH TRAITS COME FROM RULES THE PROJECT HOLDS, and that is the whole of what
// this file has to get right: gravity's ground loop matches its own trait, so a
// tile electing some other rule's would compile, run, and hold nothing up.
// Naming a trait by rule name rather than by module is what makes that hard to
// get wrong — there is only one "Gravity" in play.
//
// SOLID as well as ground, because they answer different questions. "Acts as
// Ground" is what a falling actor lands ON; "Solid" is what a moving actor
// cannot pass THROUGH. A platform wants both, and a one-way platform — a thing
// this lab can express — is the first with only the one.

import {actorFile, setSprite, useTrait} from './workspace';

/** The picture, and so the sprite the import must bring. */
export const GROUND_SPRITE = 'ground';

export const groundActor = actorFile('Ground', [
  useTrait('Gravity#ActsAsGroundTrait'),
  useTrait('Solid Bodies#SolidTrait'),
  setSprite(`${GROUND_SPRITE}.png`),
]);
