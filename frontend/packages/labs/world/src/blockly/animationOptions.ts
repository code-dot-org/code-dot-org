// The `world_play_animation` dropdown lists the animations the PROJECT holds —
// the ids defined across its `.anim` files — and nothing else. There are no
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

import {label} from './label';
import {bindLiveOptions} from './moduleOptions';

let projectAnimations: string[] = [];

/** Replace the project-authored animation ids the dropdown offers. */
export function setProjectAnimations(ids: string[]): void {
  projectAnimations = ids;
}

/** Current `[label, id]` options: the project's animations, then `(import…)`. */
export function animationOptions(): Array<[string, string]> {
  const ids = [...new Set(projectAnimations)];
  return [
    ...ids.map((id): [string, string] => [label(id), id]),
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
      bindLiveOptions(field, animationOptions);
    },
  },
);
