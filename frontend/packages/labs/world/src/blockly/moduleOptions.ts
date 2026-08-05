// The world dropdowns list the project's modules: `world_add_actor` (ACTOR) the
// actor templates, `world_load_map` (MAP) the map files, and
// `world_use_animations` (FILE) the animation files. Blockly JSON dropdowns take
// static options, so — like the animation-id dropdown (animationOptions.ts) — an
// extension swaps each field's `menuGenerator_` for one that reads this module's
// registry, which the lab refreshes from the project sources (WorldRuntimeContext
// and BlocklyFileEditor) before the editor loads a block or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_BACKGROUND_VALUE} from '../appearance/appearanceImport';
import type {EffectParameter} from '../effect/model/types';

import {IMPORT_EFFECT_VALUE} from './effectImport';
import {label} from './label';
import {localActorOptions} from './localActors';

// `[label, path]` dropdown options, refreshed from the project (projectModules).
let projectActors: Array<[string, string]> = [];
let projectAnimationFiles: Array<[string, string]> = [];
let projectSprites: Array<[string, string]> = [];
// The same, for the images under `backgrounds/` — a pool of its own, because a
// sky and a costume are never wanted in the same list (BACKGROUNDS.md §5).
let projectBackgrounds: Array<[string, string]> = [];
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

/** Replace the sprite options — the project's own image files. */
export function setProjectSprites(options: Array<[string, string]>): void {
  projectSprites = options;
}

/** Replace the backdrop options — the project's images under `backgrounds/`. */
export function setProjectBackgrounds(options: Array<[string, string]>): void {
  projectBackgrounds = options;
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

/** What a dropdown holds before the project offers it anything real. */
const NONE_VALUE = '';

const orNone = (options: Array<[string, string]>): Array<[string, string]> =>
  options.length ? options : [['(none)', NONE_VALUE]];

/** Current ACTOR dropdown options (the project's actor templates). */
export function actorOptions(): Array<[string, string]> {
  return orNone(projectActors);
}

/** Current SPRITE dropdown options (the images the project holds). */
export function spriteOptions(): Array<[string, string]> {
  return orNone(projectSprites);
}

/** Current BACKGROUND dropdown options (the project's backdrops). */
export function backgroundOptions(): Array<[string, string]> {
  return orNone(projectBackgrounds);
}

/**
 * The same, plus an `(import…)` row that opens the stock backdrop shelf.
 *
 * Listed last, and never as the fallback when the project has none — `orNone`
 * still supplies "(none)" there — so a saved block whose backdrop was deleted
 * does not silently become the import row.
 */
export function backgroundImportOptions(): Array<[string, string]> {
  return [
    ...orNone(projectBackgrounds),
    ['(import…)', IMPORT_BACKGROUND_VALUE],
  ];
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

/**
 * The field each live dropdown rebinds, by extension name.
 *
 * An extension that names a field its block does not have does nothing at all,
 * and quietly: the dropdown keeps the static generator from the block
 * definition, which Blockly calls with no arguments — so any option list that
 * depends on WHERE the block is silently loses that half of itself. A test
 * walks this against the block definitions rather than waiting for someone to
 * open the menu (blockly/__tests__/liveDropdowns.test.ts).
 */
const liveDropdownFields = new Map<string, string>();

/** Which field each live-dropdown extension expects, by extension name. */
export const liveDropdownFieldNames = (): ReadonlyMap<string, string> =>
  liveDropdownFields;

/**
 * Point one dropdown field at a live option list — its menu AND its label.
 *
 * Blockly keeps the two apart, and both need saying:
 *
 *   - the MENU comes from `menuGenerator_`, which a dynamic dropdown calls with
 *     no arguments. Passing the field is how a list can depend on where the
 *     block is: the actors a world defines for itself are reached through the
 *     field's own workspace (blockly/localActors).
 *   - the LABEL is `selectedOption`, which `doValueUpdate_` resolves against
 *     `getOptions(true)` — the CACHED list — and, on a miss, leaves exactly as
 *     it was. For a live list that cache is a lie: it is generated when the
 *     block is built, which during a load is before the rest of the file
 *     exists. A `create ⟨actor⟩ in map` naming a `define actor` further down
 *     the file therefore held the right value and drew the wrong name — the
 *     first actor in the list, because that is what the block was defaulted to
 *     a moment earlier. The value was right, so the game ran with the right
 *     actor and the menu opened on the right row (it regenerates); only the
 *     label anyone reads was wrong.
 *
 * So the cache is refused, and the label is looked up when it is drawn. A value
 * with no option to explain it keeps the name it had, which is the same bargain
 * the validator makes — and the validator belongs here for the same reason, as
 * a dropdown that refuses what its own list has not caught up with is exactly
 * what a live list cannot afford.
 */
export function bindLiveOptions(
  field: Blockly.FieldDropdown,
  options: (field?: Blockly.FieldDropdown) => Array<[string, string]>,
): void {
  const dropdown = field as unknown as {
    menuGenerator_: () => Array<[string, string]>;
    getOptions: (useCache?: boolean) => Array<[string, string]>;
    getText_: () => string | null;
    doClassValidation_?: (value?: string) => string | null;
  };
  const staleLabel = dropdown.getText_.bind(field);
  const validate = dropdown.doClassValidation_?.bind(field);

  dropdown.menuGenerator_ = () => options(field);
  dropdown.getOptions = () => options(field);
  dropdown.getText_ = () => {
    const value = field.getValue();
    const chosen = options(field).find(([, option]) => option === value);
    return chosen ? String(chosen[0]) : staleLabel();
  };

  // A dropdown normally refuses a value that is not one of its options, and
  // that is wrong for a LIVE one: the options are the project as the editor
  // currently understands it, and a saved workspace can name something the
  // editor has not caught up with. An uploaded spritesheet is the case that
  // bites — its cells are only known once the image has decoded, so a block
  // holding `strip.png#3` was quietly reset to the first picture in the list on
  // every reload, and then saved that way.
  //
  // So an unknown value is kept, and shows as itself until the option that
  // explains it arrives. A value naming something genuinely gone stays visible
  // too, which is the same bargain the renames make: a block that says what it
  // means and is wrong beats one silently changed.
  dropdown.doClassValidation_ = (value?: string) => {
    if (typeof value !== 'string') {
      return validate ? (validate(value) ?? null) : null;
    }
    const known = options(field).some(([, option]) => option === value);
    return known && validate ? (validate(value) ?? value) : value;
  };
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
  liveDropdownFields.set(extensionName, fieldName);
  return defineExtension(extensionName, {
    extension() {
      const field = this.getField(fieldName) as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      bindLiveOptions(field, options);

      // A fresh block still holds the static "(none)" fallback; if that isn't
      // one the live registry offers, default to the first real option so the
      // block is usable without opening the menu. Only that fallback: anything
      // else was chosen or loaded, and is not this code's to replace.
      const values = options(field).map(([, value]) => value);
      const current = field.getValue();
      if (
        values.length > 0 &&
        (current === null || current === '' || current === NONE_VALUE)
      ) {
        field.setValue(values[0]);
      }
    },
  });
}

/**
 * What an ACTOR dropdown offers: the actor templates the project holds, and the
 * ones the world being edited defines for itself (blockly/localActors).
 *
 * A world's own come first — they are the ones that file is about — and a
 * `.actor` file defines none, so the list is the project's there.
 */
export function actorFieldOptions(
  field?: Blockly.FieldDropdown,
): Array<[string, string]> {
  const local = localActorOptions(field);
  return local.length ? [...local, ...projectActors] : orNone(projectActors);
}

export const actorOptionsExtension = liveDropdown(
  'world_actor_options',
  'ACTOR',
  actorFieldOptions,
);
/**
 * The same list, for a block whose actor dropdown is not called ACTOR.
 *
 * `world_is_a` takes an actor in a SOCKET named ACTOR and names the kind field
 * TYPE, so it needs the extension bound to that name — an extension only
 * rebinds the one field it was given, and the ACTOR one found nothing there.
 * The symptom was narrow: the project's `.actor` files listed (they come from
 * this module's registry, which the static fallback still reads), and a world's
 * OWN `define actor` did not, because those are found through the field.
 */
export const actorTypeOptionsExtension = liveDropdown(
  'world_actor_type_options',
  'TYPE',
  actorFieldOptions,
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
