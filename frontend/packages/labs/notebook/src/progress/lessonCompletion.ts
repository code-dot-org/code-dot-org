/**
 * lessonCompletion — derives per-notebook completion state from run history.
 *
 * "Complete" means every code cell with non-empty source has been run at least
 * once. The run history is stored on the non-standard key
 * `notebook.metadata.cdo.runHistory` so it travels with the notebook document
 * without polluting standard Jupyter metadata fields.
 */

import type {Notebook} from '../storage/NotebookLabDB';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single record of a code cell execution, persisted in run history.
 * `ranAt` is the Unix-ms timestamp of the run; `succeeded` is false when
 * the execution ended with a Python traceback.
 */
export interface CellRunRecord {
  /** Stable UUID of the cell that was run. */
  cellId: string;
  /** Unix-ms timestamp of the execution. */
  ranAt: number;
  /** True when the execution produced no error output. */
  succeeded: boolean;
}

/**
 * Derived view of how complete a notebook's required cells are.
 *
 * Computed from the notebook document on demand; not persisted separately.
 */
export interface CompletionState {
  /** ID of the notebook this state applies to. */
  notebookId: string;
  /** IDs of code cells with non-empty source — the "required" set. */
  runnableCellIds: string[];
  /** Subset of runnableCellIds that have at least one run record. */
  ranCellIds: string[];
  /** True when every runnable cell has been run at least once. */
  isComplete: boolean;
  /**
   * Unix-ms timestamp of completion. Set to the latest `ranAt` across all
   * run records when complete; null when not yet complete.
   */
  completedAt: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the run history array from the non-standard `metadata.cdo` key.
 * Returns an empty array when the key is absent or malformed so callers
 * need not guard for undefined.
 *
 * @param notebook Notebook document to inspect
 * @returns Array of CellRunRecord stored in metadata.cdo.runHistory
 */
function extractRunHistory(notebook: Notebook): CellRunRecord[] {
  const cdo = (notebook.metadata.cdo as {runHistory?: unknown} | undefined);
  if (!Array.isArray(cdo?.runHistory)) return [];
  return cdo.runHistory as CellRunRecord[];
}

/**
 * Returns true when a code cell has at least one non-whitespace character
 * in its source. Cells with an empty or whitespace-only source are not
 * considered runnable — curriculum authors sometimes include shell cells
 * as structural placeholders.
 *
 * @param source Source lines array from the cell
 * @returns Whether the joined source is non-empty after trimming
 */
function hasNonEmptySource(source: string[] | undefined): boolean {
  if (source === undefined) return false;
  return source.join('').trim() !== '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derives a CompletionState for a notebook by comparing runnable cells against
 * the run history stored in `metadata.cdo.runHistory`.
 *
 * @param notebookId Stable notebook identifier (used as-is in the result)
 * @param notebook   Notebook document to inspect
 * @returns          Derived CompletionState; never throws
 */
export function deriveCompletionState(
  notebookId: string,
  notebook: Notebook
): CompletionState {
  const runnableCellIds = notebook.cells
    .filter(cell => cell.cell_type === 'code' && hasNonEmptySource(cell.source))
    .map(cell => cell.id);

  const runHistory = extractRunHistory(notebook);

  // Build a set of cell IDs that have a run record for fast membership tests.
  const ranCellIdSet = new Set(runHistory.map(r => r.cellId));

  const ranCellIds = runnableCellIds.filter(id => ranCellIdSet.has(id));

  const isComplete =
    runnableCellIds.length > 0 &&
    ranCellIds.length >= runnableCellIds.length;

  let completedAt: number | null = null;
  if (isComplete) {
    const maxRanAt = runHistory.reduce<number | null>((max, r) => {
      if (max === null) return r.ranAt;
      return r.ranAt > max ? r.ranAt : max;
    }, null);
    completedAt = maxRanAt ?? Date.now();
  }

  return {
    notebookId,
    runnableCellIds,
    ranCellIds,
    isComplete,
    completedAt,
  };
}
