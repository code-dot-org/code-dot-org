/**
 * importer — canonical import pipeline for the K-12 notebook lab.
 *
 * All three entry points (URL dialog, file picker, join code / ?github= deep
 * link) funnel through this module.  The pipeline follows the sequence
 * specified in contracts/url-contracts.md §"Import flow":
 *   1. Acquire bytes (fetch or FileReader)
 *   2. Parse JSON
 *   3. Validate as Jupyter v4
 *   4. Backfill missing cell ids
 *   5. Normalize metadata.folder to leading slash
 *   6. Stamp import source
 *   7. Generate fresh notebook UUID
 *   8. Write to IndexedDB via saveNotebook
 *
 * No partial record is written when any step fails.
 */

import type {Notebook, Cell} from './NotebookLabDB';
import {saveNotebook} from './notebookRepo';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Discriminates the origin of an imported notebook so the UI can apply
 * appropriate affordances (e.g. a "view only" badge for teacher-assigned
 * notebooks received via join code).
 */
export type ImportSource =
  | 'import-github'
  | 'import-url'
  | 'import-file'
  | 'import-joincode';

/**
 * Carries the result of a successful import: the new notebook's stable UUID
 * and the fully validated, normalized notebook document.
 */
export interface ImportResult {
  /** Freshly generated UUID assigned to this notebook in IndexedDB. */
  notebookId: string;
  /** Validated, normalized notebook document. */
  notebook: Notebook;
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/**
 * Thrown at any stage of the import pipeline to indicate a recoverable failure
 * that should surface a user-facing message.  The `reason` discriminant lets
 * the UI pick the right localized string without parsing the error message.
 */
export class ImportError extends Error {
  /** Machine-readable failure category. */
  readonly reason: 'fetch' | 'parse' | 'invalid' | 'unknown';

  /**
   * @param reason - Machine-readable failure category.
   * @param message - Human-readable detail (English, for logging).
   */
  constructor(
    reason: 'fetch' | 'parse' | 'invalid' | 'unknown',
    message: string
  ) {
    super(message);
    this.name = 'ImportError';
    this.reason = reason;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Ensures every cell in `cells` has a non-empty `id`.  Cells missing an id
 * receive a freshly generated UUID.  Mutates in place.
 *
 * @param cells - Cell array to backfill.
 * @returns The same array for chaining convenience.
 */
function backfillCellIds(cells: Cell[]): Cell[] {
  for (const cell of cells) {
    if (!cell.id) {
      cell.id = crypto.randomUUID();
    }
  }
  return cells;
}

/**
 * Normalizes `metadata.folder` so it always starts with `/` when present.
 * A folder value of `'unit3'` becomes `'/unit3'`.  Mutates the notebook.
 *
 * @param notebook - Notebook whose folder field should be normalized.
 */
function normalizeFolder(notebook: Notebook): void {
  const folder = notebook.metadata.folder;
  if (typeof folder === 'string' && folder.length > 0 && !folder.startsWith('/')) {
    notebook.metadata.folder = `/${folder}`;
  }
}

/**
 * Asserts that `raw` is a Jupyter v4 notebook shape.
 * Throws `ImportError('invalid', …)` if the check fails.
 *
 * @param raw - Parsed JSON value of unknown shape.
 * @returns The same value cast to `Notebook` after passing the check.
 * @throws {ImportError} When `nbformat !== 4` or `cells` is not an array.
 */
function assertNotebookV4(raw: unknown): Notebook {
  const nb = raw as Record<string, unknown>;
  if (nb.nbformat !== 4 || !Array.isArray(nb.cells)) {
    throw new ImportError(
      'invalid',
      'Document is not a valid Jupyter v4 notebook (missing nbformat: 4 or cells array)'
    );
  }
  return raw as Notebook;
}

/**
 * Parses `text` as JSON and throws `ImportError('parse', …)` on failure.
 *
 * @param text - Raw JSON string.
 * @returns Parsed value.
 * @throws {ImportError} On JSON syntax error.
 */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ImportError('parse', 'Failed to parse notebook JSON');
  }
}

/**
 * Runs steps 3–8 of the import pipeline on an already-acquired text payload.
 * Writes the record to IndexedDB only after all validation passes.
 *
 * @param text - Raw notebook JSON string.
 * @param sessionId - Active session to persist into.
 * @param source - Import origin discriminant.
 * @returns Resolved import result with the new notebookId and notebook.
 * @throws {ImportError} On validation failure (parse or invalid).
 */
async function processText(
  text: string,
  sessionId: string,
  source: ImportSource
): Promise<ImportResult> {
  const raw = parseJson(text);
  const notebook = assertNotebookV4(raw);

  backfillCellIds(notebook.cells);
  normalizeFolder(notebook);

  const notebookId = crypto.randomUUID();

  await saveNotebook(sessionId, {
    notebookId,
    sessionId,
    notebook,
    created: Date.now(),
    source,
  });

  return {notebookId, notebook};
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches a notebook from `url` and runs it through the canonical import
 * pipeline.  The URL should already be rewritten to a raw-content endpoint
 * (e.g. via `rewriteGithubUrl`) before calling this function.
 *
 * Throws `ImportError('fetch', …)` if the HTTP response is non-2xx.
 * Does not write to IndexedDB until all validation steps pass.
 *
 * @param url - Direct URL to a `.ipynb` JSON document.
 * @param sessionId - Active session to persist the imported notebook into.
 * @param source - Import origin discriminant stamped on the record.
 * @returns The new notebookId and the validated notebook document.
 * @throws {ImportError} On fetch failure, parse error, or validation failure.
 */
export async function importFromUrl(
  url: string,
  sessionId: string,
  source: ImportSource
): Promise<ImportResult> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new ImportError('fetch', `Network error fetching "${url}": ${String(err)}`);
  }

  if (!response.ok) {
    throw new ImportError(
      'fetch',
      `Fetch failed for "${url}": ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  return processText(text, sessionId, source);
}

/**
 * Wraps the FileReader API in a Promise so it can be awaited.
 * Resolves with the file's text content; rejects on read error.
 *
 * @param file - File to read as a UTF-8 string.
 * @returns File text content.
 * @throws {ImportError} If the FileReader fires an error event.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new ImportError('unknown', `Failed to read file "${file.name}"`));
    reader.readAsText(file);
  });
}

/**
 * Reads a `.ipynb` file from the browser file picker and runs it through the
 * canonical import pipeline.  Always stamps the source as `'import-file'`.
 *
 * Does not write to IndexedDB until all validation steps pass.
 *
 * @param file - File object from `<input type="file">` or drag-and-drop.
 * @param sessionId - Active session to persist the imported notebook into.
 * @returns The new notebookId and the validated notebook document.
 * @throws {ImportError} On read failure, parse error, or validation failure.
 */
export async function importFromFile(
  file: File,
  sessionId: string
): Promise<ImportResult> {
  const text = await readFileAsText(file);
  return processText(text, sessionId, 'import-file');
}
