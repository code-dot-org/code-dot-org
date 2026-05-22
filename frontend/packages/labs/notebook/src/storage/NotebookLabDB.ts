/**
 * NotebookLabDB — typed IndexedDB layer for the K-12 notebook lab.
 *
 * All persistent notebook state lives here. The schema is versioned via idb's
 * `upgrade` callback; bump the version constant and add a migration block
 * before touching the upgrade callback's structure in a breaking way.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/**
 * A string that may carry per-locale variants. When a bare string is stored
 * the runtime uses it as-is; when an object is stored the 'default' key is
 * the fallback for any locale not explicitly listed.
 */
export type LocalizedString = string | { default: string; [locale: string]: string };

/**
 * A notebook-level global variable visible to every cell. The 'default' key
 * is the value for locales not explicitly listed; additional keys override it
 * for that locale's runtime environment.
 */
export interface Global {
  default: string;
  [locale: string]: string;
}

/**
 * Per-cell metadata. Standard Jupyter fields (tags, etc.) coexist with our
 * i18n extension; unknown future fields pass through via the index signature.
 */
export interface CellMetadata {
  /** Jupyter-standard cell tags (e.g. 'parameters', 'injected-parameters'). */
  tags?: string[];
  /**
   * Locale-keyed lists of string replacements applied before execution so
   * cells can surface locale-appropriate literals without branching in Python.
   */
  i18n?: Record<string, string[]>;
  [k: string]: unknown;
}

/**
 * Union of all output variants a code cell may produce. Mirrors the Jupyter
 * nbformat 4 output spec; 'display_data' is intentionally omitted until
 * rendering support is confirmed.
 */
export type Output =
  | { output_type: 'stream'; name: 'stdout' | 'stderr'; text: string[] }
  | { output_type: 'execute_result'; data: Record<string, unknown> }
  | { output_type: 'error'; ename?: string; evalue?: string; traceback: string[] };

/** A single notebook cell, structurally equivalent to nbformat 4 cell objects. */
export interface Cell {
  /** Stable UUID assigned at creation; must not change on re-save. */
  id: string;
  cell_type: 'code' | 'markdown' | 'raw';
  metadata: CellMetadata;
  /** Source lines including trailing newlines, matching nbformat convention. */
  source?: string[];
  outputs?: Output[];
  execution_count?: number | null;
}

/**
 * Top-level notebook metadata. Fields beyond the standard Jupyter set carry
 * curriculum context (title, goal, author, globals). Unknown keys pass through
 * so curriculum authors can add new fields without a schema change.
 */
export interface NotebookMetadata {
  title?: string;
  /** Filesystem-style folder path for grouping notebooks in the UI. */
  folder?: string;
  goal?: LocalizedString;
  author?: string;
  /** Named globals injected into each cell's execution namespace. */
  globals?: Record<string, Global>;
  [k: string]: unknown;
}

/** A complete notebook document conforming to nbformat 4. */
export interface Notebook {
  nbformat: 4;
  nbformat_minor: number;
  metadata: NotebookMetadata;
  cells: Cell[];
}

/**
 * Tracks how a notebook arrived in the student's session so the UI can apply
 * appropriate affordances (e.g. restrict editing for seed-derived copies).
 */
export type NotebookSource =
  | 'seed'
  | 'import-file'
  | 'import-url'
  | 'import-github'
  | 'import-joincode'
  | 'welcome';

/**
 * The persisted envelope wrapping a notebook. The composite key
 * `"${sessionId}::${notebookId}"` lets multiple sessions coexist in one DB
 * without collisions while still supporting per-session scans via the
 * by_session index.
 */
export interface NotebookRecord {
  /** Composite primary key: `"${sessionId}::${notebookId}"`. */
  key: string;
  notebookId: string;
  sessionId: string;
  notebook: Notebook;
  /** Unix ms timestamp of first save. */
  created: number;
  /** Unix ms timestamp of most recent save; updated on every put. */
  lastModified: number;
  source: NotebookSource;
  /**
   * ID of the curriculum seed this notebook was derived from. Absent for
   * notebooks created from scratch or imported by the student.
   */
  seedId?: string;
}

// ---------------------------------------------------------------------------
// IDB schema
// ---------------------------------------------------------------------------

interface NotebookLabDBSchema extends DBSchema {
  notebooks: {
    key: string;
    value: NotebookRecord;
    indexes: {
      /** All notebooks in a session; keyPath = sessionId. */
      by_session: string;
      /** Ordered by modification time for recency queries; keyPath = [sessionId, lastModified]. */
      by_session_modified: [string, number];
      /** Filter by origin source within a session; keyPath = [sessionId, source]. */
      by_session_source: [string, string];
      /** Locate the copy derived from a specific seed; keyPath = [sessionId, seedId]. */
      by_session_seedId: [string, string];
    };
  };
}

export type { IDBPDatabase };
export type { NotebookLabDBSchema };

// ---------------------------------------------------------------------------
// DB factory
// ---------------------------------------------------------------------------

/**
 * Opens (and migrates) the NotebookLabDB IndexedDB database.
 *
 * Version 1 establishes the notebooks object store and all secondary indexes.
 * Future versions must add a new `else if (oldVersion < N)` block inside
 * `upgrade` rather than modifying the version-1 block, to preserve safe
 * incremental migration for users on older versions.
 *
 * @returns Opened IDB database handle.
 */
export async function openNotebookLabDB(): Promise<IDBPDatabase<NotebookLabDBSchema>> {
  return openDB<NotebookLabDBSchema>('NotebookLabDB', 1, {
    upgrade(db) {
      const store = db.createObjectStore('notebooks', { keyPath: 'key' });
      store.createIndex('by_session', 'sessionId');
      store.createIndex('by_session_modified', ['sessionId', 'lastModified']);
      store.createIndex('by_session_source', ['sessionId', 'source']);
      store.createIndex('by_session_seedId', ['sessionId', 'seedId']);
    },
  });
}
