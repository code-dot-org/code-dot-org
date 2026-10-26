// The `world_play_animation` dropdown lists the animations of the actor whose
// file it is in — its Main and the rest, kept on it (specs/ANIMATION_PLAN.md).
// An animation is its kind's, so there is nothing else to offer. There are no
// built-in animations to play: an animation is frames of an image, both of them
// files, and a project draws only what it holds. The last row is how you get
// more (`(import…)`, appearance/stock).
//
// Blockly JSON dropdowns take static options, so — like Music Lab's effect
// dropdowns — an extension swaps the field's `menuGenerator_` for one that reads
// this module's registry, which the lab refreshes from the project sources
// (WorldRuntimeContext) before the editor loads or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {editingActorModule} from './editingRule';
import {bindLiveOptions, orNone} from './moduleOptions';

/** Each kind's own animations, by its module path. */
let kindAnimations: Readonly<Record<string, readonly string[]>> = {};

/** Replace what each kind's own animations are called. */
export function setKindAnimations(
  byKind: Readonly<Record<string, readonly string[]>>,
): void {
  kindAnimations = byKind;
}

/**
 * Current `[label, id]` options: the project's animations, then `(import…)`.
 *
 * With nothing defined the list is "(no animations yet)", whose value is
 * empty, so a fresh block stays unfinished and generates nothing until
 * somebody chooses. There is no import row: an animation is added to an actor
 * in the Actor Editor (specs/ANIMATION_PLAN.md).
 */
export function animationOptions(kind?: string): Array<[string, string]> {
  const own = kind ? (kindAnimations[kind] ?? []) : [];
  // By the name it gave them, which is the value too: the engine finds a
  // name on the actor's kind.
  return orNone(
    own.map((name): [string, string] => [name, name]),
    '(no animations yet)',
  );
}

export const ANIMATION_OPTIONS_EXTENSION = 'world_animation_options';

/** Make a block's `ANIMATION` dropdown reflect the live animation registry. */
export const animationOptionsExtension: Extension = defineExtension(
  ANIMATION_OPTIONS_EXTENSION,
  {
    extension() {
      const field = this.getField('ANIMATION') as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // Point the menu at the live registry so the dropdown reflects the
      // project's animations, not the static fallback — and the label too:
      // Blockly resolves that against a cached list and leaves it alone on a
      // miss, so a block loaded before its animation was registered kept
      // whatever name it had (blockly/moduleOptions).
      // …and this actor's own first, when the block is in an actor's file.
      bindLiveOptions(field, () => animationOptions(editingActorModule(this)));
    },
  },
);
