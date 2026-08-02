// Refreshes every project-derived Blockly dropdown registry (animations, actor
// templates, worlds, effects) from the flattened project files. Called both before the
// generator runs (WorldRuntimeContext) AND before the visible editor loads a
// workspace (BlocklyFileEditor) — a dropdown drops a serialized value that is
// not among its options, so the registry must be populated before Blockly
// deserializes a block that selected it.

import {setProjectAnimations} from './animationOptions';
import {
  setProjectActors,
  setProjectAnimationFiles,
  setProjectEffectFiles,
  setProjectEffectParameters,
  setProjectMaps,
  setProjectRuleModules,
} from './moduleOptions';
import {projectAnimationIds} from './projectAnimations';
import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectEffectFileOptions,
  projectEffectParameters,
  projectMapActorTypes,
  projectRuleMetas,
  projectRuleOptions,
  projectWorldRules,
} from './projectModules';
import {duplicateRuleNames, registerProjectRules} from './ruleRegistry';
import {setProjectRuleMeta, setProjectRules} from './traitOptions';

export function refreshProjectDropdowns(files: Record<string, string>): void {
  setProjectAnimations(projectAnimationIds(files));
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
  const duplicated = duplicateRuleNames();
  const key = duplicated.join('\u0000');
  if (key === warnedAbout) {
    return;
  }
  warnedAbout = key;
  if (duplicated.length) {
    console.warn(
      `world lab: more than one rule is named ${duplicated
        .map(name => `"${name}"`)
        .join(', ')}; references to it resolve to the first one.`,
    );
  }
}
