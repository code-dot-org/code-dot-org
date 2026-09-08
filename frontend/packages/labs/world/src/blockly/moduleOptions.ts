// The world dropdowns list the project's modules: `world_add_actor` (ACTOR) the
// actor templates, `world_load_map` (MAP) the map files, and
// `world_use_animations` (FILE) the animation files. Blockly JSON dropdowns take
// static options, so — like the animation-id dropdown (animationOptions.ts) — an
// extension swaps each field's `menuGenerator_` for one that reads this module's
// registry, which the lab refreshes from the project sources (WorldRuntimeContext
// and BlocklyFileEditor) before the editor loads a block or the generator runs.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';
import {localization} from '@code-dot-org/core/plugins/localization';

import {IMPORT_ACTOR_VALUE} from '../actors/actorImport';
import {IMPORT_BACKGROUND_VALUE} from '../appearance/appearanceImport';
import type {EffectParameter} from '../effect/model/types';
import {IMPORT_SOUND_VALUE} from '../sound/soundImport';

import {actorIconImage} from './actorIcons';
import {actorIcon, actorThumbnail} from './actorThumbnails';
import {editingActorModule} from './editingRule';
import {IMPORT_EFFECT_VALUE} from './effectImport';
import {label} from './label';
import {actorIdFromName, localActorOptions} from './localActors';
import {localizeLabel, localizeText} from './localizeBlocks';
import {projectImage} from './projectImages';

// `[label, path]` dropdown options, refreshed from the project (projectModules).
let projectActors: Array<[string, string]> = [];
let projectAnimationFiles: Array<[string, string]> = [];
let projectSprites: Array<[string, string]> = [];
// The same, for the images under `backgrounds/` — a pool of its own, because a
// sky and a costume are never wanted in the same list (BACKGROUNDS.md §5).
let projectBackgrounds: Array<[string, string]> = [];
// `[label, fileName]` for the project's sounds — the `play sound` / `set music
// to` dropdowns. A pool of their own, like the backdrops': a sound is not
// something to dress an actor in (specs/SOUND.md).
let projectSounds: Array<[string, string]> = [];
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

// Who each `.actor` file says it acts like — `actors/healthBar` →
// `actors/progressBar`. Refreshed with the actor options beside it, and read
// by the `acts like` dropdown to work out what would make a cycle.
let actsLikeEdges: Record<string, string> = {};

/** Replace the `acts like` edges the dropdown reads (`projectModules`). */
export function setActorParents(edges: Record<string, string>): void {
  actsLikeEdges = edges;
}

/**
 * Actors this one may act LIKE: the project's `.actor` files, less itself and
 * less anything that already acts like it.
 *
 * BECAUSE A CYCLE IS NOT A LOOP HERE, it is a project that will not load. Each
 * `acts like` compiles to an import of the other actor's module, so `A` acting
 * like `B` acting like `A` is two modules importing each other — resolved to
 * `undefined` at whichever end is evaluated first, and the game dies reading a
 * builder that is not there before anything is on screen. `use rule` leaves
 * the rule being edited out of its own dropdown for the same reason; this has
 * to look further, because the chain can be longer than one.
 *
 * The field is what says which file is asking — a dropdown definition is
 * global and serves every workspace at once (`editingRule`).
 */
export function actorParentOptions(
  field?: Blockly.FieldDropdown,
): DropdownOptions {
  const self = editingActorModule(field?.getSourceBlock() ?? undefined);
  /** Whether `path` already reaches `self` by acting like it, however far. */
  const reaches = (path: string): boolean => {
    const seen = new Set<string>();
    for (let at: string | undefined = path; at; at = actsLikeEdges[at]) {
      if (at === self) {
        return true;
      }
      if (seen.has(at)) {
        return false; // a cycle that does not pass through us; not ours to fix
      }
      seen.add(at);
    }
    return false;
  };
  const offered = projectActors.filter(
    ([, value]) => value !== self && !reaches(value),
  );
  return orNone(offered, '(no other actors)').map(([label, value]) =>
    pictured(label, value),
  );
}

/** Replace the sprite options — the project's own image files. */
export function setProjectSprites(options: Array<[string, string]>): void {
  projectSprites = options;
}

/** Replace the backdrop options — the project's images under `backgrounds/`. */
export function setProjectBackgrounds(options: Array<[string, string]>): void {
  projectBackgrounds = options;
}

/** Replace the sound options the SOUND dropdowns offer. */
export function setProjectSounds(options: Array<[string, string]>): void {
  projectSounds = options;
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

/**
 * A list, or the one row a dropdown shows when the project offers nothing.
 *
 * Exported because a list assembled elsewhere needs it too: `use rule` builds
 * its options in `domainBlocks` (it labels a rule by the ability the parsed
 * `.rule` declares), and it is precisely the list that may be empty.
 *
 * `empty` NAMES WHAT IS MISSING where the caller knows. "(none)" is a fair
 * answer for a dropdown whose subject a learner may genuinely not want — no
 * trait, no rule, no property of that kind — but it reads as a CHOICE, and for
 * a list of the project's OWN FILES it is not one: a project with no sounds is
 * not a project that chose silence, it is one with nothing in `sounds/` yet.
 * `play tween` has said "(no tweens yet)" since it was written
 * (`blockly/tweens`), and this is that wording made available to the rest.
 *
 * So every dropdown listing the project's own files says so: actors, sprites,
 * backgrounds, animations, sounds, effects, maps. The line between the two
 * groups is whether an empty list is a state of the PROJECT or an answer the
 * learner might mean, and it is drawn here rather than at each call so that
 * adding a dropdown is a decision about which group it is in.
 *
 * The VALUE is the same either way, so nothing downstream changes: an empty
 * value is "nothing chosen" and the block generates nothing.
 */
export const orNone = (
  options: Array<[string, string]>,
  empty = '(none)',
): Array<[string, string]> =>
  // The words are the lab's, not the project's — there is nothing in the
  // project to name, which is what the line says — so they are read in the
  // reader's language. Here rather than at each call for the same reason the
  // sentence above gives: fifteen call sites, one decision.
  options.length ? options : [[localizeText(empty), NONE_VALUE]];

/** Current ACTOR dropdown options (the project's actor templates). */
export function actorOptions(): Array<[string, string]> {
  return orNone(projectActors, '(no actors yet)');
}

/** Current SPRITE dropdown options (the images the project holds). */
export function spriteOptions(): DropdownOptions {
  return orNone(projectSprites, '(no sprites yet)').map(asPicture);
}

/**
 * One dropdown row for a picture: the picture, with its name as `alt`.
 *
 * A CELL OF A SHEET keeps its name. `switch.png#3` is one frame of a strip, and
 * a field image cannot crop — drawn whole it would show all six squashed into a
 * square, and drawn as the first cell it would be a picture of the wrong frame.
 * The name is the honest answer, and it is the same fallback `pictured` makes
 * for an actor whose thumbnail has not arrived.
 */
function asPicture([label, value]: [string, string]): DropdownOptions[number] {
  const src = value.includes('#') ? undefined : projectImage(value);
  return src
    ? [{src, width: PICTURE_ICON, height: PICTURE_ICON, alt: label}, value]
    : [label, value];
}

/**
 * How big a picture is drawn in a dropdown, square.
 *
 * The actors' size, so the dropdowns a learner meets side by side — `add actor
 * ⟨Coin⟩` and `set sprite ⟨coin⟩` — are the same height.
 */
const PICTURE_ICON = 24;

/** Current BACKGROUND dropdown options (the project's backdrops). */
export function backgroundOptions(): DropdownOptions {
  return orNone(projectBackgrounds, '(no backgrounds yet)').map(asPicture);
}

/**
 * The same, plus an `(import…)` row that opens the stock backdrop shelf.
 *
 * Listed last, and never as the fallback when the project has none — `orNone`
 * still supplies "(no backgrounds yet)" there — so a saved block whose backdrop
 * was deleted does not silently become the import row.
 */
/**
 * Current SOUND dropdown options, plus an `(import…)` row.
 *
 * Both sound blocks offer the row: `play sound` and `set music to` reach the
 * same shelf, and a learner who has no sounds yet is exactly the learner who
 * needs it. Listed last, and never as the fallback when the project has none —
 * `orNone` still supplies "(no sounds yet)" — so a saved block whose file was
 * deleted does not silently become the import row.
 */
export function soundImportOptions(): Array<[string, string]> {
  return [
    ...orNone(projectSounds, '(no sounds yet)'),
    ['(import…)', IMPORT_SOUND_VALUE],
  ];
}

export function backgroundImportOptions(): DropdownOptions {
  return [
    ...orNone(projectBackgrounds, '(no backgrounds yet)').map(asPicture),
    ['(import…)', IMPORT_BACKGROUND_VALUE],
  ];
}

/** Current FILE dropdown options (the project's animation files). */
export function animationFileOptions(): Array<[string, string]> {
  return orNone(projectAnimationFiles, '(no animations yet)');
}

/** Current EFFECT dropdown options (the project's effect files). */
export function effectFileOptions(): Array<[string, string]> {
  return orNone(projectEffectFiles, '(no effects yet)');
}

/**
 * The same, plus an `(import…)` row that opens the stock-effect dialog.
 *
 * Offered by the blocks that APPLY an effect, and not by the two that remove
 * one: importing an effect in order to stop playing it is not a thing anyone
 * means to do.
 *
 * Listed last, and never as the fallback when the project has no effects yet —
 * `orNone` still supplies "(no effects yet)" there — so a saved block whose
 * value is missing does not silently become the import row.
 */
export function effectFileImportOptions(): Array<[string, string]> {
  return [
    ...orNone(projectEffectFiles, '(no effects yet)'),
    ['(import…)', IMPORT_EFFECT_VALUE],
  ];
}

/** Current MAP dropdown options (the project's map files). */
export function mapOptions(): Array<[string, string]> {
  const paths = Object.keys(projectMaps);
  return orNone(
    paths.map(path => [label(path.split('/').pop() ?? path), path]),
    '(no maps yet)',
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
 * Redraw every live dropdown on a workspace.
 *
 * A live dropdown regenerates its options when the menu opens, so what it
 * OFFERS is always current. What it DRAWS is not: the field was painted once
 * and only repaints when something asks. That gap is invisible for a list of
 * names, which does not change under a rendered block — and visible the moment
 * an option becomes a picture, because actor thumbnails are rendered by the
 * sandbox and arrive after the editor has drawn. Without this, a block sits
 * there showing a name until the next unrelated edit repaints it.
 */
export function redrawLiveDropdowns(workspace: Blockly.WorkspaceSvg): void {
  const names = new Set(liveDropdownFields.values());
  for (const block of workspace.getAllBlocks(false)) {
    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        if (field.name && names.has(field.name)) {
          reselect(field as Blockly.FieldDropdown);
          field.forceRerender();
        }
      }
    }
  }
}

/**
 * Point a dropdown at its option again, from the live list.
 *
 * `forceRerender` alone is not enough, and the reason is easy to miss:
 * `selectedOption` is CACHED, set when the value was last written, and it is
 * what decides whether the field draws text or an image. Redrawing without
 * refreshing it faithfully redraws the stale answer — the name the option was
 * when the block was built, forever, however many pictures have arrived since.
 *
 * The value is untouched; only the option explaining it is looked up again.
 */
function reselect(field: Blockly.FieldDropdown): void {
  const dropdown = field as unknown as {
    selectedOption?: [unknown, string];
    getOptions?: (useCache?: boolean) => Array<[unknown, string]>;
  };
  const chosen = dropdown
    .getOptions?.(false)
    ?.find(([, value]) => value === field.getValue());
  if (chosen) {
    dropdown.selectedOption = chosen;
  }
}

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
  options: (field?: Blockly.FieldDropdown) => DropdownOptions,
): void {
  const dropdown = field as unknown as {
    menuGenerator_: () => DropdownOptions;
    getOptions: (useCache?: boolean) => DropdownOptions;
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
    if (!chosen) {
      return staleLabel();
    }
    // An option may be a picture, and a picture's text is its `alt` — which is
    // what Blockly's own `getText` reports, and what a screen reader reads.
    // `String()` on one of those says "[object Object]".
    const [label] = chosen;
    return typeof label === 'string' ? label : label.alt;
  };

  // A picture cannot say its own name, so the field says it on hover. Only for
  // a picture: a text option already reads as its name, and overriding the
  // tooltip there would replace something the block meant to say.
  field.setTooltip(() => {
    const chosen = options(field).find(
      ([, option]) => option === field.getValue(),
    );
    const label = chosen?.[0];
    if (label && typeof label !== 'string') {
      return label.alt;
    }
    const block = field.getSourceBlock();
    return typeof block?.tooltip === 'string' ? block.tooltip : '';
  });

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

/**
 * An extension that points `fieldName`'s dropdown at a live options function.
 *
 * `words` says whether the LABELS are the lab's own vocabulary or the names of
 * things in the project, and it decides whether they are translated. Most of
 * these lists are names — actors, traits, rules, files, the enums a learner
 * wrote — and a name is not translated in any language: it is what the learner
 * called the thing. A few are the lab talking about itself, and those read as
 * English to a reader who has none.
 *
 * Off by default because that is the safe way round. A vocabulary list left
 * untranslated reads as English, which is a gap somebody notices; a name list
 * translated by accident renames what a learner made — an actor called `Math`
 * would come back as whatever the Math drawer is called in their language.
 *
 * Extensions, not definitions, is why this exists at all: a live dropdown
 * REPLACES the options `localizeBlocks` translated on the definition, so the
 * seam that handles every other label never sees these.
 */
export function liveDropdown(
  extensionName: string,
  fieldName: string,
  // The field is passed so an option list can depend on where the block is —
  // `use rule` leaves out the rule whose own workspace it is in (editingRule).
  // Most lists are the same everywhere and ignore it.
  options: (field?: Blockly.FieldDropdown) => DropdownOptions,
  {words = false}: {words?: boolean} = {},
): Extension {
  liveDropdownFields.set(extensionName, fieldName);
  const listed = words
    ? (field?: Blockly.FieldDropdown): DropdownOptions =>
        options(field).map(
          ([label, value]) =>
            [
              localizeLabel(label, text => localization.translate(text)),
              value,
            ] as DropdownOptions[number],
        )
    : options;
  return defineExtension(extensionName, {
    extension() {
      const field = this.getField(fieldName) as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      bindLiveOptions(field, listed);

      // A fresh block still holds the static "(none)" fallback; if that isn't
      // one the live registry offers, default to the first real option so the
      // block is usable without opening the menu. Only that fallback: anything
      // else was chosen or loaded, and is not this code's to replace.
      const values = listed(field).map(([, value]) => value);
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
): DropdownOptions {
  const local = localActorOptions(field);
  if (!local.length) {
    return orNone(projectActors, '(no actors yet)').map(([label, value]) =>
      pictured(label, value),
    );
  }
  return [
    // A world's own are looked up by the TYPE a placed one carries, not by the
    // `local:<block id>` the dropdown stores. The two differ — the value has to
    // survive renaming the actor, the type has to be the same string the
    // running world stamps on an instance — and looking one up by the other
    // quietly found nothing, which is a dropdown of names beside a project's
    // dropdown of pictures.
    ...local.map(([label, value]) =>
      pictured(label, value, actorIdFromName(label)),
    ),
    ...projectActors.map(([label, value]) => pictured(label, value)),
  ];
}

/**
 * An actor option as its PICTURE, where we have one.
 *
 * A kind of actor is a thing you can see, and a row of names is a worse way to
 * pick one than a row of pictures — which is what Sprite Lab has always done,
 * and what `CdoFieldImageDropdown` does for animations. Blockly's dropdown
 * takes an option that is either text or an image, never both, so this is a
 * choice rather than an addition.
 *
 * THE NAME IS NOT LOST. It rides along as `alt`, which is what
 * `FieldDropdown.getText` reports for an image option — so a screen reader
 * hears it, and `actorNameFor` reads it back for the tooltip that says which
 * actor a picture is.
 *
 * A thumbnail is rendered by the sandbox and arrives after the editor has
 * drawn, and a world's own inline `define actor` may never get one at all. So
 * the fallback is not an edge case: no picture yet means the name, which is
 * exactly what the dropdown said before this.
 */
function pictured(
  label: string,
  value: string,
  thumbnailKey: string = value,
): DropdownOptions[number] {
  // The elected symbol first. This dropdown is the one surface that can hold
  // neither the picture nor the name — 24 by 24, and an option is an image OR
  // text — so an actor whose appearance is content-dependent is unidentifiable
  // here however well it is drawn (specs/UI_ACTORS.md).
  const src =
    actorIconImage(actorIcon(thumbnailKey) ?? '') ??
    actorThumbnail(thumbnailKey);
  return src
    ? [{src, width: ACTOR_ICON, height: ACTOR_ICON, alt: label}, value]
    : [label, value];
}

/** How big an actor's picture is drawn in a dropdown, square. */
const ACTOR_ICON = 24;

/**
 * What a dropdown may offer: a label, or a picture with the label as its `alt`.
 *
 * Blockly's own `MenuOption` is wider than this (it admits an `HTMLElement` and
 * a third element), and the block definition types are narrower. This is the
 * overlap, which is what both ends actually accept.
 */
export type DropdownOptions = Array<
  [string | {src: string; alt: string; width?: number; height?: number}, string]
>;

export const actorOptionsExtension = liveDropdown(
  'world_actor_options',
  'ACTOR',
  actorFieldOptions,
);

/** …and the narrower list `acts like` offers (`actorParentOptions`). */
export const actorParentOptionsExtension = liveDropdown(
  'world_actor_parent_options',
  'ACTOR',
  actorParentOptions,
);

/**
 * The same list plus an `(import…)` row, for the two blocks that PLACE an actor.
 *
 * Not on every actor dropdown. `any ⟨kind⟩` and `is a ⟨kind⟩` ASK about actors,
 * and importing one to ask about it is not a thing anybody wants; more to the
 * point, the row is a sentinel rather than a value, and only a field with the
 * import validator on it can reject one. A dropdown offering the row without
 * that validator would store the sentinel as if it named an actor.
 */
export function actorImportFieldOptions(
  field?: Blockly.FieldDropdown,
): DropdownOptions {
  return [...actorFieldOptions(field), ['(import…)', IMPORT_ACTOR_VALUE]];
}

export const actorImportOptionsExtension = liveDropdown(
  'world_actor_import_options',
  'ACTOR',
  actorImportFieldOptions,
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
/** Make the SOUND dropdowns reflect what the project holds, plus `(import…)`. */
export const soundOptionsExtension = liveDropdown(
  'world_sound_options',
  'SOUND',
  soundImportOptions,
);

export const mapOptionsExtension = liveDropdown(
  'world_map_options',
  'MAP',
  mapOptions,
);
