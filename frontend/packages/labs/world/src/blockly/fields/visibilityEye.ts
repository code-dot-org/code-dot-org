// The eye that says whether a declaration is anybody else's to use.
//
// `define property` has had one since it had a setter: the eye means VISIBLE —
// whether the block drawn beside it is offered to files other than this one.
// A count an actor advances for itself has a setter its own file needs and
// nobody else should be handed (specs/UI_ACTORS.md).
//
// `define block` wants the same answer for the same reason. An actor's own
// work — "keep the caret in view", said once and called from eight handlers —
// is an implementation, not vocabulary: putting it in everybody's toolbox
// offers a reader a block that only means anything inside the file it came
// from. So the two share this rather than growing two eyes that drift.
//
// WHAT IT IS NOT is `readonly` in the C sense, or a security boundary. Nothing
// stops a file naming a private block if it writes the type out by hand; what
// this decides is what the TOOLBOX offers, which is what a learner can find.

import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {glyphIcon} from '../extensions/glyphIcon';

// FontAwesome f06e / f070: `eye` and `eye-slash`, in the free package as well
// as the pro one (see `glyphIcon`). This is why the button that OPENS a file
// stopped being an eye and became `arrow-up-right-from-square`: two eyes a few
// blocks apart meaning "look at this file" and "this is visible" would be one
// picture for two ideas (`extensions/openSourceButton`).
export const EYE = '';
export const EYE_SLASH = '';

/** An eye, and the way to keep its glyph in step with its value. */
export interface VisibilityEye {
  field: FieldButton;
  /** Redraw the glyph if the value has changed. Cheap when it has not. */
  sync: () => void;
}

/**
 * An eye that toggles between two stored values.
 *
 * SERIALIZABLE, unlike every other button in this lab: the value is a fact the
 * FILE has to remember, not a way in to something. `transformText` is what
 * keeps the word off the block — `FieldButton` draws its text beside the glyph
 * unless there is none, and every other button here has none.
 */
export function visibilityEye(shown: string, hidden: string): VisibilityEye {
  const icon = glyphIcon(EYE);
  const field: FieldButton = new FieldButton({
    value: shown,
    onClick: () => field.setValue(field.getValue() === hidden ? shown : hidden),
    icon,
    transformText: () => '',
    // A read-only workspace still SHOWS which it is; the click is refused by
    // `setValue` on a block that cannot be edited.
    allowReadOnlyClick: false,
  });
  return {
    field,
    sync: () => {
      // The glyph is measured and not merely drawn (`FieldButton.updateSize_`),
      // so a swapped one has to ask for its size again — and only when it did
      // swap, or every keystroke in a name box re-renders it for nothing.
      const glyph = field.getValue() === hidden ? EYE_SLASH : EYE;
      if (icon.textContent !== glyph) {
        icon.textContent = glyph;
        field.forceRerender();
      }
    },
  };
}
