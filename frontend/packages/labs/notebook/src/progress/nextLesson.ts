/**
 * nextLesson — locates the notebook that follows the current one in a unit.
 *
 * "Unit" is defined by `notebook.metadata.folder`. Notebooks are ordered by
 * `created` ascending; the "next" lesson is the one immediately after the
 * current entry in that sorted list.
 */

import type {NotebookRecord} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the `notebookId` of the next notebook in the same unit as
 * `currentNotebookId`, or `null` when the current notebook is last or
 * is the only member of its unit.
 *
 * Ordering is by `created` ascending. Notebooks whose `metadata.folder`
 * differs from the current notebook's folder are excluded.
 *
 * @param currentNotebookId  Stable ID of the notebook the student is viewing
 * @param records            All NotebookRecord entries to search within
 * @returns                  ID of the next notebook, or null
 */
export function findNextLesson(
  currentNotebookId: string,
  records: NotebookRecord[]
): string | null {
  const current = records.find(r => r.notebookId === currentNotebookId);
  if (current === undefined) return null;

  const currentFolder = current.notebook.metadata.folder;

  // Keep only records in the same folder as the current notebook, sorted by
  // creation time ascending so "next" is deterministic regardless of insertion order.
  const sameUnit = records
    .filter(r => r.notebook.metadata.folder === currentFolder)
    .sort((a, b) => a.created - b.created);

  const currentIndex = sameUnit.findIndex(r => r.notebookId === currentNotebookId);
  if (currentIndex === -1) return null;

  const nextRecord = sameUnit[currentIndex + 1];
  return nextRecord !== undefined ? nextRecord.notebookId : null;
}
