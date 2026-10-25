// The `world_play_animation` dropdown lists, first, the animations of the
// actor whose file it is in — its Main and the rest, kept on it
// (specs/ANIMATION_PLAN.md) — and then the animations the PROJECT holds, the
// ids defined across its `.anim` files, until those are retired. There are no
// built-in animations to play: an animation is frames of an image, both of them
// files, and a project draws only what it holds. The last row is how you get
// more (`(import…)`, appearance/stock).
//
// Blockly JSON dropdowns take static options, so — like Music Lab's effect
// dropdowns — an extension swaps the field's `menuGenerator_` for one that reads
// this module's registry, which the lab refreshes from the project sources
// (WorldRuntimeContext) before the editor loads or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_ANIMATION_VALUE} from '../appearance/appearanceImport';

import {editingActorModule} from './editingRule';
import {label} from './label';
import {bindLiveOptions, orNone} from './moduleOptions';

let projectAnimations: string[] = [];
/** Each kind's own animations, by its module path. */
let kindAnimations: Readonly<Record<string, readonly string[]>> = {};

/** Replace what each kind's own animations are called. */
export function setKindAnimations(
  byKind: Readonly<Record<string, readonly string[]>>,
): void {
  kindAnimations = byKind;
}

/** Replace the project-authored animation ids the dropdown offers. */
export function setProjectAnimations(ids: string[]): void {
  projectAnimations = ids;
}

/**
 * Current `[label, id]` options: the project's animations, then `(import…)`.
 *
 * With nothing defined the list is "(no animations yet)" and the import row,
 * in that order — never the import row alone. A fresh block takes its first
 * option as its value, so a project with no `.anim` files gave `play animation`
 * a dialog for a value, and so did a block whose animation had been deleted.
 * The wording is `orNone`'s: a project with no animations did not choose to
 * play none, it has nothing in `animations/` yet.
 */
export function animationOptions(kind?: string): Array<[string, string]> {
  const own = kind ? (kindAnimations[kind] ?? []) : [];
  const ids = [...new Set(projectAnimations)].filter(id => !own.includes(id));
  return [
    ...orNone(
      [
        // Its own by the name it gave them, which is the value too: the
        // engine finds a name on the actor's kind first.
        ...own.map((name): [string, string] => [name, name]),
        ...ids.map((id): [string, string] => [label(id), id]),
      ],
      '(no animations yet)',
    ),
    ['(import…)', IMPORT_ANIMATION_VALUE],
  ];
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
