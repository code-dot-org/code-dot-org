// Putting the tutor's rewritten files into the project.
//
// The lab's half of the accept/reject flow (`@code-dot-org/aitutor`
// specs/PLAN.md §8): the package decides an answer IS a proposal and hands over
// the files; only the lab knows what a file is here.
//
// Ported from `getMergedAiTutorCodeWithSource` in
// `apps/src/weblab2/helpers/aiTutorStructuredResponseHelper.ts`, with one
// behaviour made explicit that the legacy leaves to a comment: a proposal names
// files by PATH, and a path that already exists is an edit while a path that
// does not is a new file. The model returns whole files either way — it is
// asked to, in the schema's `code` description — so there is no patch to apply.

import {
  getFilePath,
  getNextFileId,
  DEFAULT_FOLDER_ID,
} from '@code-dot-org/codebridge';
import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

/** The language a Codebridge editor uses for a file, from its extension. */
const languageFor = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  return extension === 'js' ? 'javascript' : extension;
};

/** A proposed file's name, without the folders it may have been given. */
const nameOf = (path: string): string => path.split('/').pop() ?? path;

export interface MergeResult {
  source: MultiFileSource;
  /** The files as they now stand — what the host shows as chips and reverts. */
  changed: ProjectFile[];
}

/**
 * A copy of `source` with the proposed files written into it.
 *
 * NEW FILES LAND IN THE ROOT. The model is asked for the files it changed, not
 * for a directory layout, and a path it invented ("src/main.js") would create a
 * folder the student never made. Matching by full path first means an edit to a
 * file that IS in a folder still finds it.
 */
export const mergeProposedFiles = (
  source: MultiFileSource,
  proposed: ReadonlyArray<{path: string; contents: string}>,
): MergeResult => {
  const files = {...source.files};
  const changed: ProjectFile[] = [];

  for (const file of proposed) {
    const existing = Object.values(files).find(
      held =>
        getFilePath(held, source.folders) === file.path ||
        held.name === nameOf(file.path),
    );

    const updated: ProjectFile = existing
      ? {...existing, contents: file.contents}
      : {
          id: getNextFileId([...Object.values(files), ...changed]),
          name: nameOf(file.path),
          language: languageFor(file.path),
          contents: file.contents,
          folderId: DEFAULT_FOLDER_ID,
          open: true,
        };

    files[updated.id] = updated;
    changed.push(updated);
  }

  return {source: {...source, files}, changed};
};
