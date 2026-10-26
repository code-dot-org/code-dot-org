// "Portrait" — the character whose turn it is to speak.
//
// A picture, and a default of INVISIBLE. That is a thin actor, and the second
// half is the half that earns it a place: a portrait placed on a map before
// anybody has spoken should not be standing there, and a default of visible
// makes its own entrance a thing you cannot see happen. Choosing a picture is
// one field anybody can fill in; knowing to start at nothing is the part
// learned by getting it wrong.
//
// IT SHIPS NO TWEENS, AND THE REASON IS WORTH WRITING DOWN, because `enters`
// and `leaves` are the obvious things to put here and were here until they
// were found to be unreachable. A `play tween` names its definition by the
// DEFINING BLOCK'S ID and the dropdown is built from the blocks in its own
// workspace (`tweensIn`), so a definition in this file can only ever be played
// by a handler in this file — and a portrait's entrance is the SCENE's
// decision, not the portrait's. There is no handler to write here that would
// not be guessing when the story wants it.
//
// So a project fades it where the fade belongs, with `play tween … do` at the
// line that brings the character on — which is what `src/fixtures/novel.ts`
// does. A shipped `enters` becomes possible when tweens can live in a file of
// their own, shared across files the way an actor is; until then, one written
// here is a definition nothing can name.

import {actorFile, actsLike, num, showAs} from './workspace';

/** The picture it shows until a project gives it a face of its own. */
export const PORTRAIT_SPRITE = 'player';

/** `set opacity of ⟨this actor⟩ to ⟨value⟩`. */
const opacity = (value: number) => ({
  type: 'world_set_Appearance_OpacityProperty',
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: num(value),
  },
});

export const portraitActor = actorFile('Portrait', [
  // AN IMAGE, which is a picture drawn into a box: the face is its
  // `picture`, chosen per placement (specs/ACTORS_AS_DATA_PLAN.md, step 4).
  // It was a sprite, which an interface actor no longer wears.
  actsLike('actors/image'),
  showAs('portrait'),
  // Off screen until it is asked for.
  opacity(0),
]);
