// The `world_add_actor` (ACTOR) and `world_scene` (WORLD) dropdowns list the
// project's actor templates and worlds. Blockly JSON dropdowns take static
// options, so — like the animation dropdown (animationOptions.ts) — an extension
// swaps each field's `menuGenerator_` for one that reads this module's registry,
// which the lab refreshes from the project sources (WorldRuntimeContext) before
// the editor loads a block or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

// `[label, path]` dropdown options, refreshed from the project (projectModules).
let projectActors: Array<[string, string]> = [];
let projectWorlds: Array<[string, string]> = [];

/** Replace the actor options the ACTOR dropdown offers. */
export function setProjectActors(options: Array<[string, string]>): void {
  projectActors = options;
}

/** Replace the world options the WORLD dropdown offers. */
export function setProjectWorlds(options: Array<[string, string]>): void {
  projectWorlds = options;
}

/** Current ACTOR dropdown options (the project's actor templates). */
export function actorOptions(): Array<[string, string]> {
  return projectActors.length ? projectActors : [['(none)', '']];
}

/** Current WORLD dropdown options (the project's worlds). */
export function worldOptions(): Array<[string, string]> {
  return projectWorlds.length ? projectWorlds : [['(none)', '']];
}

export const ACTOR_OPTIONS_EXTENSION = 'world_actor_options';
export const WORLD_OPTIONS_EXTENSION = 'world_world_options';

/** Point the `ACTOR` dropdown at the live actor registry. */
export const actorOptionsExtension: Extension = defineExtension(
  ACTOR_OPTIONS_EXTENSION,
  {
    extension() {
      const field = this.getField('ACTOR') as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // @ts-expect-error protected — reflect the project's actors, not the
      // static fallback.
      field.menuGenerator_ = () => actorOptions();
    },
  },
);

/** Point the `WORLD` dropdown at the live world registry. */
export const worldOptionsExtension: Extension = defineExtension(
  WORLD_OPTIONS_EXTENSION,
  {
    extension() {
      const field = this.getField('WORLD') as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // @ts-expect-error protected — reflect the project's worlds, not the
      // static fallback.
      field.menuGenerator_ = () => worldOptions();
    },
  },
);
