// Keeping a hidden file with the file it belongs to.
//
// A companion is not a file in its own right: a `.sheet` says how to cut the
// image of the same name into cells (appearance/sheetFile), and a `.picture`
// is what a Screen or Map looks like (mapEditor/placePicture). The learner
// never sees one, so it cannot be renamed, moved or deleted by hand, and
// every one of those has to happen to it when it happens to its owner.
//
// Given the project before and after a file operation, this works out what
// happened to each owner and does the same to its companion: moved folder,
// renamed, or gone. Identity is the file's ID, not its name — the name is
// exactly what a rename changes. An owner present in both projects under a
// different name was renamed; one that has left was deleted. Nothing here
// guesses.

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

/** What a kind of companion is: whose it is, and what it is called. */
export interface Companion {
  /** Whether a file is one a companion of this kind could belong to. */
  owns: (file: ProjectFile) => boolean;
  /** The companion's name, from its owner's. */
  nameFor: (ownerName: string) => string;
}

/** The companion beside an owner (by the owner's name and folder), if any. */
export function companionOf(
  source: MultiFileSource,
  kind: Companion,
  owner: Pick<ProjectFile, 'name' | 'folderId'>,
): ProjectFile | undefined {
  const name = kind.nameFor(owner.name);
  return Object.values(source.files).find(
    file => file.name === name && file.folderId === owner.folderId,
  );
}

/**
 * The project after a file operation, with every companion of this kind back
 * beside its owner. Returns `next` unchanged when nothing needed doing, which
 * is almost always.
 */
export function followOwners(
  next: MultiFileSource,
  previous: MultiFileSource,
  kind: Companion,
): MultiFileSource {
  const files = {...next.files};
  let changed = false;

  for (const before of Object.values(previous.files)) {
    if (!kind.owns(before)) {
      continue;
    }
    // The companion as it was: found against the owner's OLD name and
    // folder, since that is where it still sits in `next`.
    const companion = companionOf(next, kind, before);
    if (!companion) {
      continue;
    }
    const after = next.files[before.id];

    if (!after) {
      // The owner is gone; its companion describes nothing. A hidden file
      // nobody can see or delete would otherwise stay in the project forever.
      delete files[companion.id];
      changed = true;
      continue;
    }
    if (after.name === before.name && after.folderId === before.folderId) {
      continue;
    }
    // Renamed, moved, or both: the companion goes where the owner went.
    // Anything already at the destination is replaced — two owners cannot
    // share a name in one folder, so it can only be a leftover.
    const wanted = kind.nameFor(after.name);
    const displaced = Object.values(files).find(
      file =>
        file.id !== companion.id &&
        file.name === wanted &&
        file.folderId === after.folderId,
    );
    if (displaced) {
      delete files[displaced.id];
    }
    files[companion.id] = {
      ...companion,
      name: wanted,
      folderId: after.folderId,
    };
    changed = true;
  }

  return changed ? {...next, files} : next;
}
