// Keeping a `.sheet` with the `.png` it belongs to.
//
// A `.sheet` is not a file in its own right: it says how to cut the image of the
// same name, in the same folder, into cells (sheetFile). The learner never sees
// it — the file browser does not list it — so it cannot be dragged, renamed or
// deleted by hand, which means every one of those things has to happen to it
// automatically or not at all.
//
// This is the "or not at all" case made impossible. Given the project before and
// after a file operation, it works out what happened to each image and does the
// same to its sheet: moved folder, renamed, or gone.
//
// Identity is the file's ID, not its name — the name is exactly what a rename
// changes. An image present in both projects under a different name was renamed;
// one that has left was deleted. Nothing here guesses.

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {sheetFileName} from './sheetFile';

/** Whether this file is an image a `.sheet` could belong to. */
const isImage = (file: ProjectFile): boolean =>
  file.name.toLowerCase().endsWith('.png');

/** The sheet beside a given image (by the image's name and folder), if any. */
function sheetFor(
  source: MultiFileSource,
  image: Pick<ProjectFile, 'name' | 'folderId'>,
): ProjectFile | undefined {
  const name = sheetFileName(image.name);
  return Object.values(source.files).find(
    file => file.name === name && file.folderId === image.folderId,
  );
}

/**
 * The project after a file operation, with every `.sheet` back beside its image.
 *
 * Returns `next` unchanged when nothing needed doing, which is almost always.
 */
export function followImages(
  next: MultiFileSource,
  previous: MultiFileSource,
): MultiFileSource {
  const files = {...next.files};
  let changed = false;

  for (const before of Object.values(previous.files)) {
    if (!isImage(before)) {
      continue;
    }
    // The sheet as it was: found against the image's OLD name and folder, since
    // that is where it still sits in `next`.
    const sheet = sheetFor(next, before);
    if (!sheet) {
      continue;
    }
    const after = next.files[before.id];

    if (!after) {
      // The image is gone; its sheet describes nothing. A hidden file nobody
      // can see or delete would otherwise stay in the project forever.
      delete files[sheet.id];
      changed = true;
      continue;
    }
    if (after.name === before.name && after.folderId === before.folderId) {
      continue;
    }
    // Renamed, moved, or both: the sheet goes where the image went. Anything
    // already at the destination is replaced — two images cannot share a name
    // in one folder, so it can only be a leftover.
    const wanted = sheetFileName(after.name);
    const displaced = Object.values(files).find(
      file =>
        file.id !== sheet.id &&
        file.name === wanted &&
        file.folderId === after.folderId,
    );
    if (displaced) {
      delete files[displaced.id];
    }
    files[sheet.id] = {...sheet, name: wanted, folderId: after.folderId};
    changed = true;
  }

  return changed ? {...next, files} : next;
}
