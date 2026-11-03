// An actor made from nothing, for a game or for an interface
// (specs/PURPOSE_PLAN.md, step 2).
//
// A game's starts empty: what it looks like is the wizard's next question,
// and its picture is a sprite. An interface's is DRAWN, not given a sprite,
// and always has a box (SIMPLE_INTERFACE.md, "Interface Actors"): so it
// starts with one, 96 by 32, and a drawing as big as its box, a panel the
// learner can draw over.

import {actorDocument} from '../actorDocument';
import {type PaletteTab} from '../actorPurpose';
import {boxValue, labelSizeOf} from '../stock/label';
import {BORDER, LOOK, RADIUS_TIGHT} from '../stock/look';
import {
  corner,
  drawing,
  fill,
  outline,
  rectangle,
  swatch,
} from '../stock/workspace';

/** How big a new Interface Actor's box is: a button's size. */
export const NEW_INTERFACE_BOX = {width: 96, height: 32};

/** The file an actor made from nothing starts as, for `purpose`. */
export function newActorFile(name: string, purpose: PaletteTab): string {
  if (purpose === 'game') {
    return actorDocument({name, for: 'game'});
  }
  const width = () => labelSizeOf('Width');
  const height = () => labelSizeOf('Height');
  return actorDocument({
    name,
    for: 'interface',
    traits: ['Boxed#HasABoxTrait'],
    values: [
      boxValue('Width', NEW_INTERFACE_BOX.width),
      boxValue('Height', NEW_INTERFACE_BOX.height),
    ],
    drawing: drawing({
      width: width(),
      height: height(),
      commands: [
        fill(swatch(LOOK.field)),
        outline(swatch(LOOK.primaryStrong), BORDER),
        corner(RADIUS_TIGHT),
        rectangle(0, 0, width(), height()),
      ],
    }),
  });
}
