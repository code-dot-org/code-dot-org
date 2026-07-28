// The scene/world dropdowns list the project's modules: `world_add_actor`
// (ACTOR) the actor templates, `world_scene` (WORLD) the worlds, and
// `world_use_animations` (FILE) the animation files. Blockly JSON dropdowns take
// static options, so — like the animation-id dropdown (animationOptions.ts) — an
// extension swaps each field's `menuGenerator_` for one that reads this module's
// registry, which the lab refreshes from the project sources (WorldRuntimeContext
// and BlocklyFileEditor) before the editor loads a block or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

// `[label, path]` dropdown options, refreshed from the project (projectModules).
let projectActors: Array<[string, string]> = [];
let projectWorlds: Array<[string, string]> = [];
let projectAnimationFiles: Array<[string, string]> = [];

/** Replace the actor options the ACTOR dropdown offers. */
export function setProjectActors(options: Array<[string, string]>): void {
  projectActors = options;
}

/** Replace the world options the WORLD dropdown offers. */
export function setProjectWorlds(options: Array<[string, string]>): void {
  projectWorlds = options;
}

/** Replace the animation-file options the FILE dropdown offers. */
export function setProjectAnimationFiles(
  options: Array<[string, string]>,
): void {
  projectAnimationFiles = options;
}

const orNone = (options: Array<[string, string]>): Array<[string, string]> =>
  options.length ? options : [['(none)', '']];

/** Current ACTOR dropdown options (the project's actor templates). */
export function actorOptions(): Array<[string, string]> {
  return orNone(projectActors);
}

/** Current WORLD dropdown options (the project's worlds). */
export function worldOptions(): Array<[string, string]> {
  return orNone(projectWorlds);
}

/** Current FILE dropdown options (the project's animation files). */
export function animationFileOptions(): Array<[string, string]> {
  return orNone(projectAnimationFiles);
}

/** An extension that points `fieldName`'s dropdown at a live options function. */
function liveDropdown(
  extensionName: string,
  fieldName: string,
  options: () => Array<[string, string]>,
): Extension {
  return defineExtension(extensionName, {
    extension() {
      const field = this.getField(fieldName) as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // @ts-expect-error protected — reflect the live project registry, not the
      // static fallback baked in at block definition.
      field.menuGenerator_ = () => options();
    },
  });
}

export const actorOptionsExtension = liveDropdown(
  'world_actor_options',
  'ACTOR',
  actorOptions,
);
export const worldOptionsExtension = liveDropdown(
  'world_world_options',
  'WORLD',
  worldOptions,
);
export const animationFileOptionsExtension = liveDropdown(
  'world_animation_file_options',
  'FILE',
  animationFileOptions,
);
