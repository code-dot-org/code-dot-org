// The world dropdowns list the project's modules: `world_add_actor` (ACTOR) the
// actor templates, `world_load_map` (MAP) the map files, and
// `world_use_animations` (FILE) the animation files. Blockly JSON dropdowns take
// static options, so — like the animation-id dropdown (animationOptions.ts) — an
// extension swaps each field's `menuGenerator_` for one that reads this module's
// registry, which the lab refreshes from the project sources (WorldRuntimeContext
// and BlocklyFileEditor) before the editor loads a block or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import type {EffectParameter} from '../effect/model/types';

import {IMPORT_EFFECT_VALUE} from './effectImport';
import {label} from './label';

// `[label, path]` dropdown options, refreshed from the project (projectModules).
let projectActors: Array<[string, string]> = [];
let projectAnimationFiles: Array<[string, string]> = [];
// `[label, path]` for the project's `.effect` files — the `add effect` dropdown.
let projectEffectFiles: Array<[string, string]> = [];
// `[label, path]` for the project's own rule modules under `rules/` — the
// `world_use_rule` dropdown offers these ALONGSIDE the built-in rules, and its
// generator imports the module (a path value) rather than reading `WorldLab`.
let projectRuleModules: Array<[string, string]> = [];
// Map path -> the actor module paths it places (for the load-map generator).
let projectMaps: Record<string, string[]> = {};
// Effect path -> the parameters that effect declares (for the use-effect
// mutator, which builds one socket row per parameter).
let projectEffectParams: Record<string, EffectParameter[]> = {};

/** Replace the actor options the ACTOR dropdown offers. */
export function setProjectActors(options: Array<[string, string]>): void {
  projectActors = options;
}

/** Replace the animation-file options the FILE dropdown offers. */
export function setProjectAnimationFiles(
  options: Array<[string, string]>,
): void {
  projectAnimationFiles = options;
}

/** Replace the effect-file options the EFFECT dropdown offers. */
export function setProjectEffectFiles(options: Array<[string, string]>): void {
  projectEffectFiles = options;
}

/** Replace the project rule modules the `use rule` dropdown offers (paths). */
export function setProjectRuleModules(options: Array<[string, string]>): void {
  projectRuleModules = options;
}

/** The project's own rule modules (`[label, path]`), for `world_use_rule`. */
export function ruleModuleOptions(): Array<[string, string]> {
  return projectRuleModules;
}

/** Replace the map registry (path -> the actor modules each map places). */
export function setProjectMaps(maps: Record<string, string[]>): void {
  projectMaps = maps;
}

/** Replace the per-effect parameter registry. */
export function setProjectEffectParameters(
  parameters: Record<string, EffectParameter[]>,
): void {
  projectEffectParams = parameters;
}

/** The parameters an effect declares — read by the use-effect mutator. */
export function effectParameters(path: string): EffectParameter[] {
  return projectEffectParams[path] ?? [];
}

/** The actor module paths a map file places — read by the load-map generator. */
export function mapActorTypes(path: string): string[] {
  return projectMaps[path] ?? [];
}

const orNone = (options: Array<[string, string]>): Array<[string, string]> =>
  options.length ? options : [['(none)', '']];

/** Current ACTOR dropdown options (the project's actor templates). */
export function actorOptions(): Array<[string, string]> {
  return orNone(projectActors);
}

/** Current FILE dropdown options (the project's animation files). */
export function animationFileOptions(): Array<[string, string]> {
  return orNone(projectAnimationFiles);
}

/** Current EFFECT dropdown options (the project's effect files). */
export function effectFileOptions(): Array<[string, string]> {
  return orNone(projectEffectFiles);
}

/**
 * The same, plus an `(import…)` row that opens the stock-effect dialog.
 *
 * Offered by the blocks that APPLY an effect, and not by the two that remove
 * one: importing an effect in order to stop playing it is not a thing anyone
 * means to do.
 *
 * Listed last, and never as the fallback when the project has no effects yet —
 * `orNone` still supplies "(none)" there — so a saved block whose value is
 * missing does not silently become the import row.
 */
export function effectFileImportOptions(): Array<[string, string]> {
  return [...orNone(projectEffectFiles), ['(import…)', IMPORT_EFFECT_VALUE]];
}

/** Current MAP dropdown options (the project's map files). */
export function mapOptions(): Array<[string, string]> {
  const paths = Object.keys(projectMaps);
  return orNone(
    paths.map(path => [label(path.split('/').pop() ?? path), path]),
  );
}

/** An extension that points `fieldName`'s dropdown at a live options function. */
export function liveDropdown(
  extensionName: string,
  fieldName: string,
  // The field is passed so an option list can depend on where the block is —
  // `use rule` leaves out the rule whose own workspace it is in (editingRule).
  // Most lists are the same everywhere and ignore it.
  options: (field?: Blockly.FieldDropdown) => Array<[string, string]>,
): Extension {
  return defineExtension(extensionName, {
    extension() {
      const field = this.getField(fieldName) as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // @ts-expect-error protected — reflect the live project registry, not the
      // static fallback baked in at block definition.
      field.menuGenerator_ = () => options(field);
      // A fresh block still holds the static "(none)" fallback; if that isn't one
      // the live registry offers, default to the first real option so the block
      // is usable without opening the menu. A saved block keeps its own value —
      // it's already among the options.
      const values = options(field).map(([, value]) => value);
      const current = field.getValue();
      if (
        values.length > 0 &&
        (current === null || !values.includes(current))
      ) {
        field.setValue(values[0]);
      }
    },
  });
}

export const actorOptionsExtension = liveDropdown(
  'world_actor_options',
  'ACTOR',
  actorOptions,
);
export const animationFileOptionsExtension = liveDropdown(
  'world_animation_file_options',
  'FILE',
  animationFileOptions,
);
export const effectFileOptionsExtension = liveDropdown(
  'world_effect_file_options',
  'EFFECT',
  effectFileOptions,
);
export const effectFileImportOptionsExtension = liveDropdown(
  'world_effect_import_options',
  'EFFECT',
  effectFileImportOptions,
);
export const mapOptionsExtension = liveDropdown(
  'world_map_options',
  'MAP',
  mapOptions,
);
