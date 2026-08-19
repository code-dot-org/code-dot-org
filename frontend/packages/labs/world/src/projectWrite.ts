// Adding a file to a project, without disturbing what is there.
//
// Every library import ends the same way: find or make the folder its kind
// lives in, and put a file in it — leaving anything already there alone. That
// was `importStock`'s private business while sprites and backdrops were the
// only shelf; a sound is a third caller, and three copies of "find the folder,
// do not overwrite" is three places for the rule to drift.
//
// NEVER OVERWRITES and never renames, which is the rule worth stating once. A
// project that already has `coin.mp3` has the one the learner may have replaced,
// and an import that clobbered it would destroy that work — while one that
// renamed would leave two files with one name for the blocks that reference it
// to fail to tell apart.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

/** A folder id by name, creating a top-level folder if the project lacks one. */
export function folderIn(
  source: MultiFileSource,
  name: string,
): {source: MultiFileSource; folderId: string} {
  const existing = Object.values(source.folders).find(
    entry => entry.name === name && entry.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, name);
  const created = Object.values(next.folders).find(
    entry => entry.name === name && entry.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

/** Whether a file of this name already exists in `folderId`. */
export function hasFile(
  source: MultiFileSource,
  folderId: string,
  fileName: string,
): boolean {
  return Object.values(source.files).some(
    file => file.folderId === folderId && file.name === fileName,
  );
}

/** One file to add. `url` carries bytes; `contents` carries text; never both. */
export interface NewFile {
  name: string;
  /**
   * What the file tree and the editor make of it.
   *
   * Stated by the caller rather than guessed from the name here, because the
   * guess was a nested ternary that knew about `.sheet` and `.anim` — facts
   * about the appearance library, in a helper three libraries share.
   */
  language: string;
  contents?: string;
  url?: string;
  mimeType?: string;
}

/** Add a file, leaving anything already there alone. */
export function writeFile(
  source: MultiFileSource,
  folderId: string,
  file: NewFile,
): MultiFileSource {
  if (hasFile(source, folderId, file.name)) {
    return source;
  }
  const id = getNextFileId(Object.values(source.files));
  return {
    ...source,
    files: {
      ...source.files,
      [id]: {
        id,
        name: file.name,
        language: file.language,
        contents: file.contents ?? '',
        folderId,
        ...(file.url ? {url: file.url, mimeType: file.mimeType} : {}),
      },
    },
  };
}
