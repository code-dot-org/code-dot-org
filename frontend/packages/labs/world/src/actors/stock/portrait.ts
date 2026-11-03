// "Portrait" — the character whose turn it is to speak.
//
// A picture, and a default of INVISIBLE. That is a thin actor, and the second
// half is the half that earns it a place: a portrait placed on a map before
// anybody has spoken should not be standing there, and a default of visible
// makes its own entrance a thing you cannot see happen. Choosing a picture is
// one field anybody can fill in; knowing to start at nothing is the part
// learned by getting it wrong.
//
// IT SHIPS ITS ENTRANCE AND ITS EXIT, `enters` and `leaves`, and plays
// neither: when a character comes on is the scene's decision, so the scene
// plays them (`play tween ⟨Portrait: enters⟩`, as `fixtures/novel` does).

import {actorDocument} from '../actorDocument';

import {opacityTo, tween} from './workspace';

/** The picture it shows until a project gives it a face of its own. */
export const PORTRAIT_SPRITE = 'player';

export const portraitActor = actorDocument({
  name: 'Portrait',
  // AN IMAGE, which is a picture drawn into a box: the face is its
  // `picture`, chosen per placement (specs/ACTORS_AS_DATA_PLAN.md, step 4).
  // It was a sprite, which an interface actor no longer wears.
  actsLike: 'actors/image',
  icon: 'portrait',
  values: [
    // Off screen until it is asked for.
    {setter: 'world_set_Appearance_OpacityProperty', type: 'number', value: 0},
  ],
  tweens: [
    tween('enters', 'enters', 0.4, 'ease-out', [opacityTo(1)]),
    tween('leaves', 'leaves', 0.4, 'ease-in', [opacityTo(0)]),
  ],
});
