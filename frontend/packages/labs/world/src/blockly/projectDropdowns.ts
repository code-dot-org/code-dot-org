// Refreshes every project-derived Blockly dropdown registry (animations, actor
// templates, worlds, effects) from the flattened project files. Called both before the
// generator runs (WorldRuntimeContext) AND before the visible editor loads a
// workspace (BlocklyFileEditor) — a dropdown drops a serialized value that is
// not among its options, so the registry must be populated before Blockly
// deserializes a block that selected it.

import {projectSheets} from '../appearance/sheetFile';
import type {ImageSize} from '../runtime/imageSize';

import {setProjectAnimations} from './animationOptions';
import {duplicateEnumNames, registerProjectEnums} from './enums';
import {
  setProjectActors,
  setProjectAnimationFiles,
  setProjectEffectFiles,
  setProjectEffectParameters,
  setProjectMaps,
  setProjectRuleModules,
  setProjectBackgrounds,
  setProjectSprites,
} from './moduleOptions';
import {setOpenableModules} from './openModule';
import {projectAnimationIds} from './projectAnimations';
import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectEffectFileOptions,
  projectEffectParameters,
  projectMapActorTypes,
  projectRuleMetas,
  projectRuleOptions,
  projectBackgroundOptions,
  projectSpriteOptions,
  projectWorldRules,
} from './projectModules';
import {duplicateRuleNames, registerProjectRules} from './ruleRegistry';
import {setProjectGrids} from './spriteCells';
import {setProjectRuleMeta, setProjectRules} from './traitOptions';

/** Extensions a module path can resolve to — what a block may open. */
// What the eye can open. A `.map` is not a module the compiler resolves — a
// world names one in a dropdown and `loadMap` reads it as data — but it IS a
// file with an editor, which is the only thing the button needs.
const MODULE_FILE = /\.(rule|js|ts|map)$/;

export function refreshProjectDropdowns(
  files: Record<string, string>,
  /**
   * Image file PATHS the project holds (`backgrounds/cave.png`). They carry no
   * text contents — an uploaded or imported PNG is bytes on a `url` — so they
   * never appear in the flattened `files` map and have to be passed alongside
   * it. Paths, not names, because the folder is what says which pool an image
   * belongs to (projectFiles.projectImagePaths).
   */
  images: readonly string[] = [],
  /** Image sizes, by file name, for the ones the editor can measure. */
  imageSizes: Record<string, ImageSize> = {},
): void {
  // What the editor knows about spritesheets: the grids, and how big the images
  // are — together they say how many cells a sheet holds, which is what a
  // `set sprite` dropdown offers and what its generator resolves (spriteCells).
  setProjectGrids(projectSheets(files), imageSizes);
  setProjectAnimations(projectAnimationIds(files));
  // The images a `set sprite` block may name: the project's own, and nothing
  // else — a game draws what its project holds.
  setProjectSprites(projectSpriteOptions(files, images));
  // And the backdrops, which are the same images minus the folder that tells
  // them apart — one pool never offers the other's contents.
  setProjectBackgrounds(projectBackgroundOptions(files, images));
  // Which module paths there is a file to open for — what puts the eye on a
  // `use rule` / `use trait` block (openModule).
  setOpenableModules(
    Object.keys(files)
      .filter(path => MODULE_FILE.test(path))
      .map(path => path.replace(MODULE_FILE, '')),
  );
  setProjectActors(projectActorOptions(files));
  setProjectAnimationFiles(projectAnimationFileOptions(files));
  setProjectEffectFiles(projectEffectFileOptions(files));
  setProjectEffectParameters(projectEffectParameters(files));
  setProjectMaps(projectMapActorTypes(files));
  // The `use rule` dropdown offers the project's own rule modules (under
  // `rules/`) alongside the built-ins.
  setProjectRuleModules(projectRuleOptions(files));
  // The traits an actor may take come from the rules the project's worlds attach
  // — built-ins and the project's own declarative `.rule` rules.
  const ruleMetas = projectRuleMetas(files);
  setProjectRuleMeta(ruleMetas);
  // Every stored reference names a rule; this is what those names mean for this
  // project. Refreshed here rather than at parse time so the editor and the
  // generator resolve against the same set — the files as they are right now.
  registerProjectRules(ruleMetas);
  // …and the choices those rules declare (`define choices`), which the block
  // designer offers as parameter types and the enum chips read their options
  // from. Same moment as the rules, for the same reason: one view of the files
  // as they are right now.
  registerProjectEnums(ruleMetas.flatMap(rule => rule.enums));
  warnAboutDuplicateNames();
  setProjectRules(projectWorldRules(files));
}

// The last-warned set, so a collision is reported when it appears rather than on
// every keystroke that refreshes the project.
let warnedAbout = '';

/**
 * Say when two rules answer to one name.
 *
 * A reference names a rule, so two rules called "Gravity" make
 * `Gravity#AffectedByGravityTrait` a question with two answers — and the toolbox
 * grows two categories with one name. The registry picks the first and this says
 * so, which is the least a program can do about an ambiguity it cannot resolve.
 * Preventing the collision (a `define rule` refusing a name already taken) is the
 * editor's job, not this one's.
 */
function warnAboutDuplicateNames(): void {
  const rules = duplicateRuleNames();
  // Sets of choices go the same way and are reported the same way: one name,
  // one reference, and everything that reads it gets the first (blockly/enums).
  const choices = duplicateEnumNames();
  const key = [...rules, '\u0000', ...choices].join('\u0000');
  if (key === warnedAbout) {
    return;
  }
  warnedAbout = key;
  if (rules.length) {
    console.warn(
      `world lab: more than one rule is named ${rules
        .map(name => `"${name}"`)
        .join(', ')}; references to it resolve to the first one.`,
    );
  }
  if (choices.length) {
    console.warn(
      `world lab: more than one set of choices is named ${choices
        .map(ref => `"${ref.replace('#', ' \u25b8 ')}"`)
        .join(', ')}; the words offered are the first one's.`,
    );
  }
}
