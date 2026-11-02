// Which symbol each actor elected, read out of the files (specs/UI_ACTORS.md).
//
// Read from the FILES rather than from the live workspace, and synchronously, so
// unlike a thumbnail an icon is there the first time a dropdown is drawn.

import {actorDataOf} from '../actors/actorData';

/**
 * `{key: icon}` for every actor in the project that elected one, keyed by the
 * module path an ACTOR dropdown stores.
 */
export function projectActorIcons(
  files: Record<string, string>,
): Record<string, string> {
  const icons: Record<string, string> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.actor')) {
      continue;
    }
    const icon = actorDataOf(contents)?.icon;
    if (icon) {
      icons[path.replace(/\.actor$/, '')] = icon;
    }
  }
  return icons;
}
