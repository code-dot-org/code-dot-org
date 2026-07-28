// Refreshes every project-derived Blockly dropdown registry (animations, actor
// templates, worlds) from the flattened project files. Called both before the
// generator runs (WorldRuntimeContext) AND before the visible editor loads a
// workspace (BlocklyFileEditor) — a dropdown drops a serialized value that is
// not among its options, so the registry must be populated before Blockly
// deserializes a block that selected it.

import {setProjectAnimations} from './animationOptions';
import {
  setProjectActors,
  setProjectAnimationFiles,
  setProjectWorlds,
} from './moduleOptions';
import {projectAnimationIds} from './projectAnimations';
import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectWorldOptions,
} from './projectModules';

export function refreshProjectDropdowns(files: Record<string, string>): void {
  setProjectAnimations(projectAnimationIds(files));
  setProjectActors(projectActorOptions(files));
  setProjectWorlds(projectWorldOptions(files));
  setProjectAnimationFiles(projectAnimationFileOptions(files));
}
