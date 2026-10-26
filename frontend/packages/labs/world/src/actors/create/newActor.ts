// An actor made from nothing, for a game or for an interface
// (specs/PURPOSE_PLAN.md, step 2).
//
// A game's starts empty: what it looks like is the wizard's next question,
// and its picture is a sprite. An interface's is DRAWN, not given a sprite,
// and always has a box (SIMPLE_INTERFACE.md, "Interface Actors"): so it
// starts with one, 96 by 32, and a drawing as big as its box, a panel the
// learner can draw over.

import {asActorData} from '../actorData';
import {withPurpose, type PaletteTab} from '../actorPurpose';
import {labelSizeOf} from '../stock/label';
import {BORDER, LOOK, RADIUS_TIGHT} from '../stock/look';
import {
  actorFile,
  corner,
  fill,
  outline,
  rectangle,
  swatch,
  useTrait,
} from '../stock/workspace';

/** How big a new Interface Actor's box is: a button's size. */
export const NEW_INTERFACE_BOX = {width: 96, height: 32};

/** `set ⟨width|height⟩ of this actor to ⟨n⟩`, the box's two values. */
const boxed = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_Boxed_${name}Property`,
  inputs: {
    ACTOR: {block: {type: 'world_this_actor'}},
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

/** The file an actor made from nothing starts as, for `purpose`. */
export function newActorFile(name: string, purpose: PaletteTab): string {
  if (purpose === 'game') {
    return withPurpose(asActorData(actorFile(name, [])), 'game');
  }
  const width = () => labelSizeOf('Width');
  const height = () => labelSizeOf('Height');
  return withPurpose(
    asActorData(
      actorFile(
        name,
        [
          useTrait('Boxed#HasABoxTrait'),
          boxed('Width', NEW_INTERFACE_BOX.width),
          boxed('Height', NEW_INTERFACE_BOX.height),
        ],
        {
          drawing: {
            width: width(),
            height: height(),
            commands: [
              fill(swatch(LOOK.field)),
              outline(swatch(LOOK.primaryStrong), BORDER),
              corner(RADIUS_TIGHT),
              rectangle(0, 0, width(), height()),
            ],
          },
        },
      ),
    ),
    'interface',
  );
}
