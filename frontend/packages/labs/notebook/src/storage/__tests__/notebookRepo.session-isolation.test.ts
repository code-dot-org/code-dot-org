/**
 * Session-isolation tests for notebookRepo.
 *
 * Verifies that writes for session A are invisible to reads scoped to session B
 * and vice-versa.  The real listForSession implementation queries the
 * by_session index, so the mock DB must implement getAllFromIndex with
 * sessionId filtering — that is the boundary under test.
 *
 * IndexedDB is mocked at the NotebookLabDB module boundary so no real IDB
 * environment is required.  The store is a plain Map; each test gets a fresh
 * instance via beforeEach.
 */

import {vi, describe, it, expect, beforeEach} from 'vitest';
import type {NotebookRecord, Notebook} from '../NotebookLabDB';

// ---------------------------------------------------------------------------
// In-memory store shared by the mock factory.  Replaced before each test so
// every test starts with an empty DB.
// ---------------------------------------------------------------------------

/**
 * Mutable reference to the current in-memory notebook store.
 * Replaced in beforeEach to give each test a clean slate.
 */
let store: Map<string, NotebookRecord>;

// ---------------------------------------------------------------------------
// Module mock — must be declared before the module under test is imported.
// The factory closes over `store` by reference; reassigning `store` in
// beforeEach is visible inside subsequent mock calls.
// ---------------------------------------------------------------------------

vi.mock('../NotebookLabDB', () => ({
  openNotebookLabDB: vi.fn(async () => ({
    /**
     * Retrieves a record by primary key.
     * @param _storeName Ignored — only one store exists.
     * @param key Composite key.
     * @returns Matching record or undefined.
     */
    get(_storeName: string, key: string): NotebookRecord | undefined {
      return store.get(key);
    },

    /**
     * Writes a record into the store.
     * @param _storeName Ignored.
     * @param record Full NotebookRecord to upsert.
     */
    put(_storeName: string, record: NotebookRecord): void {
      store.set(record.key, record);
    },

    /**
     * Simulates getAllFromIndex for the by_session index.
     * Returns all records whose sessionId matches the query value.
     * @param _storeName Ignored.
     * @param indexName Expected to be 'by_session'.
     * @param sessionId The session to filter on.
     * @returns Array of matching records.
     */
    getAllFromIndex(
      _storeName: string,
      indexName: string,
      sessionId: string
    ): NotebookRecord[] {
      if (indexName !== 'by_session') return [];
      return Array.from(store.values()).filter(r => r.sessionId === sessionId);
    },
  })),
}));

// Mock telemetry so saveNotebook's quota-error reporting path does not pull in
// the real observability provider.
vi.mock('../../telemetry/wrapper', () => ({
  trackEvent: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import {saveNotebook, listForSession} from '../notebookRepo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal valid Notebook document.
 * @returns Bare nbformat 4 notebook.
 */
function minimalNotebook(): Notebook {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {},
    cells: [],
  };
}

/**
 * Builds the envelope required by saveNotebook (no key or lastModified).
 * @param sessionId Owner session.
 * @param notebookId Stable notebook identifier.
 * @returns Record envelope ready for saveNotebook.
 */
function makeEnvelope(
  sessionId: string,
  notebookId: string
): Omit<NotebookRecord, 'key' | 'lastModified'> {
  return {
    notebookId,
    sessionId,
    notebook: minimalNotebook(),
    created: Date.now(),
    source: 'seed',
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Replace the store with an empty Map so each test is independent.
  store = new Map();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('notebookRepo session isolation', () => {
  it('listForSession returns only records for the queried session', async () => {
    // Write two notebooks into session A and one into session B.
    await saveNotebook('session-a', makeEnvelope('session-a', 'nb-a-1'));
    await saveNotebook('session-a', makeEnvelope('session-a', 'nb-a-2'));
    await saveNotebook('session-b', makeEnvelope('session-b', 'nb-b-1'));

    const results = await listForSession('session-b');

    // session-b sees exactly its own record.
    expect(results).toHaveLength(1);
    expect(results[0].notebookId).toBe('nb-b-1');
    expect(results[0].sessionId).toBe('session-b');
  });

  it('session A records are invisible to session B reads', async () => {
    await saveNotebook('session-a', makeEnvelope('session-a', 'nb-a-1'));

    const results = await listForSession('session-b');

    // session-b must see nothing even though session-a has data.
    expect(results).toHaveLength(0);
  });

  it('session B records are invisible to session A reads', async () => {
    await saveNotebook('session-b', makeEnvelope('session-b', 'nb-b-1'));
    await saveNotebook('session-b', makeEnvelope('session-b', 'nb-b-2'));

    const results = await listForSession('session-a');

    expect(results).toHaveLength(0);
  });

  it('each session sees the full set of its own records', async () => {
    await saveNotebook('session-a', makeEnvelope('session-a', 'nb-a-1'));
    await saveNotebook('session-a', makeEnvelope('session-a', 'nb-a-2'));
    await saveNotebook('session-b', makeEnvelope('session-b', 'nb-b-1'));

    const aResults = await listForSession('session-a');
    const bResults = await listForSession('session-b');

    expect(aResults).toHaveLength(2);
    expect(bResults).toHaveLength(1);

    const aIds = aResults.map(r => r.notebookId).sort();
    expect(aIds).toEqual(['nb-a-1', 'nb-a-2']);
  });
});
