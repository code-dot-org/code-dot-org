/**
 * artifactPayload — builds a CompletionArtifact from a Notebook document.
 *
 * Exclusion rules enforced here:
 *   - cell.source is never included
 *   - metadata.globals values are never included
 *   - raw cdo.runHistory timestamps are never included
 *   - API keys are never included (globals excluded entirely)
 */

import type {Notebook, Cell, Output} from '../storage/NotebookLabDB';
import {unitName} from '../index/unitName';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Preview content for a single cell output included in the artifact.
 * Truncated so images and long text do not bloat the encoded payload.
 */
export interface ArtifactOutput {
  /** Discriminator for the output format. */
  kind: 'text' | 'html' | 'png' | 'svg' | 'error';
  /**
   * Truncated preview string:
   *   text/html/error ≤ 400 chars
   *   images ≤ 100 KB of base64 data
   */
  preview: string;
}

/** Run state derived from cdo.runHistory for a single code cell. */
export type RunState = 'untried' | 'ran-ok' | 'ran-error' | 'n/a';

/** Per-cell summary included in the artifact. Never contains cell.source. */
export interface ArtifactCell {
  /** Stable UUID of the cell, from cell.id. */
  cellId: string;
  /** Cell type from the notebook schema. */
  kind: 'code' | 'markdown' | 'raw';
  /** Run state derived from the notebook's run history. */
  runState: RunState;
  /** Last output produced by this cell, if any. */
  lastOutput?: ArtifactOutput;
}

/**
 * Top-level artifact emitted when a learner shares their work.
 * v: 1 is the schema version; increment on breaking changes.
 */
export interface CompletionArtifact {
  /** Schema version. */
  v: 1;
  /** Learner-chosen session label; PII only because the learner chose to export. */
  sessionLabel: string;
  /** Stable notebook identifier from IndexedDB. */
  notebookId: string;
  /** Notebook display title. */
  notebookTitle: string;
  /** Friendly unit name derived from metadata.folder; omitted when empty. */
  unit?: string;
  /** Unix ms timestamp of artifact generation. */
  generatedAt: number;
  /** Per-cell summaries in notebook order. */
  cells: ArtifactCell[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Max characters for text/html/error previews. */
const TEXT_PREVIEW_MAX = 400;

/** Max bytes of base64 for image previews (100 KB). */
const IMAGE_PREVIEW_MAX = 100_000;

/**
 * Extracts the preview string from a text/plain mime data value.
 * Handles both string and string[] as Jupyter may produce either.
 * @param value Raw mime data value
 * @returns Joined string, possibly truncated
 */
function textPreview(value: unknown): string {
  const joined = Array.isArray(value) ? (value as string[]).join('') : String(value);
  return joined.slice(0, TEXT_PREVIEW_MAX);
}

/**
 * Derives an ArtifactOutput from a single Jupyter output object.
 * Returns undefined when the output type is unrecognised.
 * @param output Jupyter output from the cell outputs array
 * @returns ArtifactOutput or undefined
 */
function outputToArtifact(output: Output): ArtifactOutput | undefined {
  if (output.output_type === 'error') {
    const ename = output.ename ?? '';
    const evalue = output.evalue ?? '';
    const preview = `${ename}: ${evalue}`.slice(0, TEXT_PREVIEW_MAX);
    return {kind: 'error', preview};
  }

  // Handle execute_result and display_data (display_data is not in the typed
  // Output union yet, so cast to unknown first to avoid the TS narrowing error).
  if (
    output.output_type === 'execute_result' ||
    (output as {output_type: string}).output_type === 'display_data'
  ) {
    const data = (output as {output_type: string; data: Record<string, unknown>}).data;

    if (typeof data['image/svg+xml'] === 'string' || Array.isArray(data['image/svg+xml'])) {
      const raw = Array.isArray(data['image/svg+xml'])
        ? (data['image/svg+xml'] as string[]).join('')
        : (data['image/svg+xml'] as string);
      return {kind: 'svg', preview: raw.slice(0, IMAGE_PREVIEW_MAX)};
    }

    if (typeof data['image/png'] === 'string') {
      return {kind: 'png', preview: (data['image/png'] as string).slice(0, IMAGE_PREVIEW_MAX)};
    }

    if (typeof data['text/html'] === 'string' || Array.isArray(data['text/html'])) {
      return {kind: 'html', preview: textPreview(data['text/html'])};
    }

    if (typeof data['text/plain'] === 'string' || Array.isArray(data['text/plain'])) {
      return {kind: 'text', preview: textPreview(data['text/plain'])};
    }
  }

  if (output.output_type === 'stream') {
    return {kind: 'text', preview: textPreview(output.text)};
  }

  return undefined;
}

/**
 * Derives the last ArtifactOutput from a cell's outputs array.
 * Iterates from the end to find the first recognisable output.
 * @param outputs Jupyter outputs array
 * @returns ArtifactOutput or undefined when no recognisable output exists
 */
function lastOutput(outputs: Output[] | undefined): ArtifactOutput | undefined {
  if (outputs === undefined || outputs.length === 0) {
    return undefined;
  }
  for (let i = outputs.length - 1; i >= 0; i--) {
    const artifact = outputToArtifact(outputs[i]);
    if (artifact !== undefined) {
      return artifact;
    }
  }
  return undefined;
}

/**
 * Typed shape of a single run history entry stored in metadata.cdo.runHistory.
 * Only the fields needed for runState derivation are typed; others pass through.
 */
interface RunHistoryEntry {
  /** Whether the cell run completed without an exception. */
  succeeded: boolean;
}

/**
 * Derives the RunState for a single cell.
 * Non-code cells always return 'n/a'.
 * Code cells consult the runHistory keyed by cellId.
 * @param cell Notebook cell
 * @param runHistory Map from cellId to the most recent run record
 * @returns Derived RunState
 */
function deriveRunState(
  cell: Cell,
  runHistory: Record<string, RunHistoryEntry> | undefined
): RunState {
  if (cell.cell_type !== 'code') {
    return 'n/a';
  }
  if (runHistory === undefined) {
    return 'untried';
  }
  const entry = runHistory[cell.id];
  if (entry === undefined) {
    return 'untried';
  }
  return entry.succeeded ? 'ran-ok' : 'ran-error';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds a CompletionArtifact from the given notebook.
 *
 * Cell sources are never included.  API keys and globals values are never
 * included since the entire metadata.globals field is excluded.  The artifact
 * is safe to encode and share outside the session.
 *
 * @param notebook Full notebook document from IndexedDB
 * @param notebookId Stable notebook identifier
 * @param sessionLabel Learner-chosen label for the active session
 * @returns CompletionArtifact ready to encode
 */
export function buildArtifactPayload(
  notebook: Notebook,
  notebookId: string,
  sessionLabel: string
): CompletionArtifact {
  const notebookTitle = notebook.metadata.title ?? notebookId;

  const folderPath = typeof notebook.metadata.folder === 'string'
    ? notebook.metadata.folder
    : '';
  const unit = unitName(folderPath);
  // unitName returns 'More Notebooks' for empty input; the contract says omit
  // the field when the folder resolves to an empty/fallback name.
  const unitField = folderPath.length > 0 ? unit : undefined;

  // Extract run history from cdo metadata; avoid exposing raw timestamps.
  const cdo = notebook.metadata.cdo as {runHistory?: Record<string, RunHistoryEntry>} | undefined;
  const runHistory = cdo?.runHistory;

  const cells: ArtifactCell[] = notebook.cells.map(cell => {
    const runState = deriveRunState(cell, runHistory);
    const artifactCell: ArtifactCell = {
      cellId: cell.id,
      kind: cell.cell_type,
      runState,
    };

    const output = lastOutput(cell.outputs);
    if (output !== undefined) {
      artifactCell.lastOutput = output;
    }

    return artifactCell;
  });

  return {
    v: 1,
    sessionLabel,
    notebookId,
    notebookTitle,
    ...(unitField !== undefined ? {unit: unitField} : {}),
    generatedAt: Date.now(),
    cells,
  };
}
