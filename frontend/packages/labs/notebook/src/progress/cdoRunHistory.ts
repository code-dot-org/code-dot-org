/**
 * cdoRunHistory — immutable helpers for the non-standard run-history metadata.
 *
 * Run records are stored at `notebook.metadata.cdo.runHistory` so they travel
 * with the notebook document while remaining invisible to standard Jupyter
 * tooling (the `cdo` key is not in the nbformat 4 spec).
 *
 * All functions return new notebook objects; the originals are never mutated.
 */

import type {Notebook} from '../storage/NotebookLabDB';
import type {CellRunRecord} from './lessonCompletion';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a new notebook with a run record added or updated for `cellId`.
 *
 * If a record for `cellId` already exists it is replaced; otherwise a new
 * entry is appended. `ranAt` is set to `Date.now()` at call time.
 *
 * The function does not mutate the input notebook — all intermediate
 * objects are created fresh via spread syntax.
 *
 * @param notebook  Source notebook document
 * @param cellId    Stable cell UUID that was executed
 * @param succeeded True when execution produced no error output
 * @returns         New notebook with the updated run history
 */
export function recordCellRun(
  notebook: Notebook,
  cellId: string,
  succeeded: boolean
): Notebook {
  const existingHistory = extractHistory(notebook);

  const newRecord: CellRunRecord = {
    cellId,
    ranAt: Date.now(),
    succeeded,
  };

  const updatedHistory: CellRunRecord[] = [
    ...existingHistory.filter(r => r.cellId !== cellId),
    newRecord,
  ];

  return {
    ...notebook,
    metadata: {
      ...notebook.metadata,
      cdo: {
        ...(notebook.metadata.cdo as Record<string, unknown> | undefined ?? {}),
        runHistory: updatedHistory,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Reads run history from `metadata.cdo.runHistory`, returning an empty array
 * when the key is absent or has an unexpected shape.
 *
 * @param notebook Notebook to inspect
 * @returns        Array of CellRunRecord entries
 */
function extractHistory(notebook: Notebook): CellRunRecord[] {
  const cdo = notebook.metadata.cdo as {runHistory?: unknown} | undefined;
  if (!Array.isArray(cdo?.runHistory)) return [];
  return cdo.runHistory as CellRunRecord[];
}
