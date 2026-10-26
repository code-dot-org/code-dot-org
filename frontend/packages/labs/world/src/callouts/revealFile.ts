// Which file a `file` reveal means (`places`, `layout/WorldLayout`).
//
// A lesson names things the way a learner does — "the Hero", "the world" —
// and this answers with the file that declares one. Pure, and here rather
// than in the layout that acts on it, so what can be tested is
// (specs/SHOW_ME_PLAN.md; the layout itself is React, redux and codebridge,
// and mounting it to ask this would be testing those).

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdForModule} from '../blockly/openModule';
import {
  projectActorOptions,
  projectWorldOptions,
} from '../blockly/projectModules';
import {fileIdAt, projectFiles} from '../runtime/projectFiles';

/**
 * The id of the file a reveal asks for, or nothing when the project holds no
 * such thing — an actor by the NAME its file declares, whatever its file is
 * called, or the world's own file.
 */
export function fileToReveal(
  source: MultiFileSource,
  {actor, world}: {actor?: string; world?: boolean},
): string | undefined {
  const files = projectFiles(source);
  const wanted = actor?.toLowerCase();
  if (world) {
    const modulePath = projectWorldOptions(files)[0]?.[1];
    // By PATH, not by `fileIdForModule`, which follows the compiler's own
    // resolution and has no reason to try `.world`: a world is not a module
    // anything imports (`blockly/openModule`).
    return modulePath ? fileIdAt(source, `${modulePath}.world`) : undefined;
  }
  const modulePath = wanted
    ? projectActorOptions(files).find(
        ([name]) => name.toLowerCase() === wanted,
      )?.[1]
    : undefined;
  return modulePath ? fileIdForModule(source, modulePath) : undefined;
}
