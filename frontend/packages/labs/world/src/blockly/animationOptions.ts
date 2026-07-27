// The `world_play_animation` dropdown lists the animations available in the
// project: the built-in stock animations plus the ids the learner authored in
// their animation `.json` files. Blockly JSON dropdowns take static options, so
// — like Music Lab's effect dropdowns — an extension swaps the field's
// `menuGenerator_` for one that reads this module's registry, which the lab
// refreshes from the project sources (WorldRuntimeContext) before the editor
// loads or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {SPRITESHEET_NAMES} from '../sprites';

import {label} from './label';

const STOCK_ANIMATIONS = [...SPRITESHEET_NAMES];
let projectAnimations: string[] = [];

/** Replace the project-authored animation ids the dropdown offers. */
export function setProjectAnimations(ids: string[]): void {
  projectAnimations = ids;
}

/** Current `[label, id]` dropdown options: stock animations, then authored ones. */
export function animationOptions(): Array<[string, string]> {
  const ids = [...new Set([...STOCK_ANIMATIONS, ...projectAnimations])];
  return ids.length ? ids.map(id => [label(id), id]) : [['(none)', '']];
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
      // @ts-expect-error protected — point the menu at the live registry so the
      // dropdown reflects the project's animations, not the static fallback.
      field.menuGenerator_ = () => animationOptions();
    },
  },
);
