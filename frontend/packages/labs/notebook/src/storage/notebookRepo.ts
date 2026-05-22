/**
 * notebookRepo — CRUD interface over NotebookLabDB.
 *
 * Each function opens a fresh DB handle. This is intentional: idb handles are
 * cheap and re-using a single long-lived handle across the module would
 * complicate lifecycle management (e.g. page-hide flushing, version upgrades).
 * The browser internally pools the underlying IDBDatabase connection.
 */

import {trackEvent} from '../telemetry/wrapper';

import {
  openNotebookLabDB,
  type NotebookRecord,
  type Notebook,
  type NotebookSource,
} from './NotebookLabDB';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/**
 * Thrown when IndexedDB storage quota is exceeded on a save operation.
 * Callers can catch this specifically to surface a storage-full prompt
 * without masking unrelated errors.
 */
export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaError';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the composite primary key from its two components.
 *
 * @param sessionId - Active session identifier.
 * @param notebookId - Stable notebook identifier within the session.
 * @returns The `"${sessionId}::${notebookId}"` key used in the object store.
 */
function makeKey(sessionId: string, notebookId: string): string {
  return `${sessionId}::${notebookId}`;
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/**
 * Retrieves a single notebook record by session and notebook ID.
 *
 * @param sessionId - Active session identifier.
 * @param notebookId - Notebook identifier to look up.
 * @returns The matching record, or `undefined` if not found.
 */
export async function getNotebook(
  sessionId: string,
  notebookId: string
): Promise<NotebookRecord | undefined> {
  const db = await openNotebookLabDB();
  return db.get('notebooks', makeKey(sessionId, notebookId));
}

/**
 * Returns all notebooks belonging to a session, in insertion order.
 *
 * @param sessionId - Session whose notebooks to retrieve.
 * @returns All records whose `sessionId` matches.
 */
export async function listForSession(sessionId: string): Promise<NotebookRecord[]> {
  const db = await openNotebookLabDB();
  return db.getAllFromIndex('notebooks', 'by_session', sessionId);
}

/**
 * Returns the most recently modified notebooks in a session.
 *
 * Walks the `by_session_modified` index in reverse (`'prev'`) so the first
 * entries encountered are the newest. Stops once `limit` records are collected
 * or the cursor exits the session's key range.
 *
 * @param sessionId - Session to query.
 * @param limit - Maximum number of records to return (default: 3).
 * @returns Up to `limit` records, most-recently-modified first.
 */
export async function listRecent(
  sessionId: string,
  limit = 3
): Promise<NotebookRecord[]> {
  const db = await openNotebookLabDB();
  const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Infinity]);
  const tx = db.transaction('notebooks', 'readonly');
  let cursor = await tx
    .objectStore('notebooks')
    .index('by_session_modified')
    .openCursor(range, 'prev');
  const results: NotebookRecord[] = [];
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

/**
 * Returns all notebooks that were imported (not created from a seed or the
 * welcome flow). Import sources are queried individually and merged because
 * IDB compound indexes do not support multi-value OR queries natively.
 *
 * @param sessionId - Session to query.
 * @returns All records whose source is one of the four import variants.
 */
export async function listAssigned(sessionId: string): Promise<NotebookRecord[]> {
  const db = await openNotebookLabDB();
  const importSources = [
    'import-file',
    'import-url',
    'import-github',
    'import-joincode',
  ] as const;

  const batches = await Promise.all(
    importSources.map(source =>
      db.getAllFromIndex('notebooks', 'by_session_source', [sessionId, source])
    )
  );
  return batches.flat();
}

/**
 * Finds the student copy derived from a given curriculum seed, if any.
 *
 * Only one copy per seed per session is expected; the index does not enforce
 * uniqueness but callers should treat a second entry as a data anomaly.
 *
 * @param sessionId - Session to query.
 * @param seedId - Curriculum seed identifier.
 * @returns The matching record, or `undefined` if the seed has not been opened.
 */
export async function findBySeedId(
  sessionId: string,
  seedId: string
): Promise<NotebookRecord | undefined> {
  const db = await openNotebookLabDB();
  return db.getFromIndex('notebooks', 'by_session_seedId', [sessionId, seedId]);
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/**
 * Persists a notebook, creating a new record or updating an existing one.
 *
 * On update, the original `created` timestamp is preserved so the first-open
 * time is not silently overwritten. `lastModified` is always set to now.
 *
 * Structural validation is intentionally minimal: we verify the two fields
 * that, if wrong, would silently corrupt the data model (nbformat version and
 * cells shape). Deeper schema validation belongs at the import boundary, not
 * the storage layer.
 *
 * Quota errors are caught, reported to telemetry, and re-thrown as
 * {@link QuotaError} so callers can handle them with context-appropriate UX
 * (e.g. a prompt to clear old sessions). All other errors propagate as-is.
 *
 * @param sessionId - Session owning the notebook; must equal `data.sessionId`.
 * @param data - Notebook envelope without `key` and `lastModified` (both are
 *   computed here).
 * @throws {Error} If the notebook schema is invalid or the sessionId mismatch.
 * @throws {QuotaError} If IndexedDB storage quota is exceeded.
 */
export async function saveNotebook(
  sessionId: string,
  data: Omit<NotebookRecord, 'key' | 'lastModified'>
): Promise<void> {
  if (data.notebook.nbformat !== 4 || !Array.isArray(data.notebook.cells)) {
    throw new Error('invalid notebook schema');
  }
  if (data.sessionId !== sessionId) {
    throw new Error(
      `sessionId mismatch: expected '${sessionId}', got '${data.sessionId}'`
    );
  }

  const existing = await getNotebook(sessionId, data.notebookId);
  const created = existing?.created ?? data.created ?? Date.now();
  const record: NotebookRecord = {
    ...data,
    key: makeKey(sessionId, data.notebookId),
    created,
    lastModified: Date.now(),
  };

  const db = await openNotebookLabDB();
  try {
    await db.put('notebooks', record);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      trackEvent('nblab.quota.exceeded');
      throw new QuotaError('IndexedDB quota exceeded');
    }
    throw err;
  }
}

/**
 * Removes a single notebook from the store.
 *
 * Silently succeeds if the record does not exist — IDB `delete` on a missing
 * key is a no-op per spec.
 *
 * @param sessionId - Session owning the notebook.
 * @param notebookId - Notebook to delete.
 */
export async function deleteNotebook(
  sessionId: string,
  notebookId: string
): Promise<void> {
  const db = await openNotebookLabDB();
  await db.delete('notebooks', makeKey(sessionId, notebookId));
}

/**
 * Removes every notebook record belonging to a session.
 *
 * Iterates a cursor on the `by_session` index rather than reading keys first
 * to avoid a separate read round-trip. Each `cursor.delete()` call removes the
 * underlying record without advancing the cursor, so an explicit `continue` is
 * required.
 *
 * @param sessionId - Session whose notebooks should be purged.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openNotebookLabDB();
  const tx = db.transaction('notebooks', 'readwrite');
  let cursor = await tx.objectStore('notebooks').index('by_session').openCursor(sessionId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// ---------------------------------------------------------------------------
// Export utilities
// ---------------------------------------------------------------------------

/**
 * Returns a new notebook with the non-standard `metadata.cdo` key removed.
 *
 * The `cdo` key stores run history and other internal state that should not
 * travel outside the lab (e.g. when the student exports to a .ipynb file).
 * Calling this before the "Save to file" path keeps the exported document
 * clean and compatible with standard Jupyter tooling.
 *
 * The input notebook is not mutated.
 *
 * @param notebook Source notebook document
 * @returns        New notebook without metadata.cdo
 */
export function stripCdoMetadata(notebook: Notebook): Notebook {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {cdo, ...restMetadata} = notebook.metadata as {
    cdo?: unknown;
    [k: string]: unknown;
  };
  return {
    ...notebook,
    metadata: restMetadata as Notebook['metadata'],
  };
}

// Re-export the types callers will commonly need alongside these functions.
// QuotaError is exported as a value (class) above; no re-export needed.
export type { NotebookRecord, Notebook, NotebookSource };
