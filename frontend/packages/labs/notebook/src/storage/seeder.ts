/**
 * seeder — seeds the sample notebook library into a session on first activation.
 *
 * Reads the samples manifest (samples/index.json), compares stored seed
 * version stamps against the manifest max version, and writes any new or
 * updated samples into IndexedDB via notebookRepo.  Learner-modified copies
 * are never overwritten.
 */

import type {Notebook, Cell} from './NotebookLabDB';
import * as notebookRepo from './notebookRepo';
import * as prefsStore from './prefsStore';
import samplesManifest from '../../samples/index.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single entry in the samples manifest (samples/index.json).
 */
export interface SampleEntry {
  /** Filename relative to the samples/ directory, e.g. "hello_world.ipynb". */
  file: string;
  /** Display folder path for grouping in the UI, e.g. "/lessons". */
  folder: string;
  /** Human-readable author name. */
  author: string;
  /** Stable UUID for this sample; never changes across versions. */
  seedId: string;
  /** Monotonically increasing version; bump to trigger re-seed. */
  seedVersion: number;
  /** Locale-aware goal description. */
  goal: string | {default: string; [locale: string]: string};
  /** Optional override for the notebook title shown in the UI. */
  notebook_title?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Builds the prefs key used to stamp the highest seed version applied to a
 * given session.  Keyed per-session so sessions are independent.
 *
 * @param sessionId - Active session identifier.
 * @returns Prefs key string.
 */
const SEED_VERSION_KEY = (sessionId: string): string =>
  `nblab.seedVersion.${sessionId}`;

/**
 * Milliseconds of grace period between `created` and `lastModified` that is
 * treated as "still pristine" (e.g. the initial save itself bumps lastModified
 * by a few ms, so we need a threshold larger than zero).
 */
const MODIFIED_THRESHOLD_MS = 1000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetches a .ipynb file from the samples/ directory relative to this module
 * and parses it as a Notebook.
 *
 * @param filename - Basename of the ipynb file, e.g. "hello_world.ipynb".
 * @returns Parsed Notebook document.
 * @throws {Error} If the fetch fails or the response is not valid JSON.
 */
async function fetchSampleNotebook(filename: string): Promise<Notebook> {
  const url = new URL(`../../samples/${filename}`, import.meta.url);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sample "${filename}": ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as Notebook;
}

/**
 * Ensures every cell in `notebook` has a non-empty `id` field.
 * Cells missing an id receive a freshly generated UUID.  Mutates in place and
 * returns the same array for convenience.
 *
 * @param cells - Array of cells to backfill.
 * @returns The same array with all ids populated.
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
 * Normalises the `metadata.folder` field so it always starts with a leading
 * slash when present.
 *
 * @param notebook - Notebook to normalise.  Mutated in place.
 */
function normaliseFolder(notebook: Notebook): void {
  const folder = notebook.metadata.folder;
  if (typeof folder === 'string' && folder.length > 0 && !folder.startsWith('/')) {
    notebook.metadata.folder = `/${folder}`;
  }
}

/**
 * Sets `metadata.title` if the notebook does not already have one, using the
 * entry's `notebook_title` override or falling back to the bare filename.
 *
 * @param notebook - Notebook to update.  Mutated in place.
 * @param entry - Manifest entry supplying the fallback title.
 */
function ensureTitle(notebook: Notebook, entry: SampleEntry): void {
  if (!notebook.metadata.title) {
    notebook.metadata.title = entry.notebook_title ?? entry.file;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Seeds the sample library into a session if it has not been seeded at the
 * current version.
 *
 * Idempotent: re-running with the same seed version is a no-op.  When the max
 * seed version in the manifest increases, only samples with a higher
 * `seedVersion` than the stored stamp are reconsidered, and among those only
 * the ones that the learner has not modified are actually written.
 *
 * Errors from individual sample fetches or saves are caught and logged so a
 * single broken sample does not block the rest of the seed pass.
 *
 * @param sessionId - Active session ID to seed into.
 */
export async function seedSessionIfEmpty(sessionId: string): Promise<void> {
  const storedVersion =
    (await prefsStore.get<number>(SEED_VERSION_KEY(sessionId))) ?? 0;

  const maxSeedVersion = Math.max(
    ...samplesManifest.samples.map((s: SampleEntry) => s.seedVersion)
  );

  if (storedVersion >= maxSeedVersion) {
    // Already at the latest version; nothing to do.
    return;
  }

  for (const entry of samplesManifest.samples as SampleEntry[]) {
    if (entry.seedVersion <= storedVersion) {
      // This sample's version is already applied; skip.
      continue;
    }

    try {
      const existing = await notebookRepo.findBySeedId(sessionId, entry.seedId);

      if (existing !== undefined) {
        const isModified =
          existing.lastModified > existing.created + MODIFIED_THRESHOLD_MS;
        if (isModified) {
          // Learner has edited this copy; do not overwrite.
          continue;
        }
      }

      const notebook = await fetchSampleNotebook(entry.file);
      backfillCellIds(notebook.cells);
      normaliseFolder(notebook);
      ensureTitle(notebook, entry);

      const notebookId = crypto.randomUUID();
      await notebookRepo.saveNotebook(sessionId, {
        notebookId,
        sessionId,
        notebook,
        created: Date.now(),
        source: 'seed',
        seedId: entry.seedId,
      });
    } catch (err) {
      // Log but continue so one bad sample does not block others.
      console.error(`[seeder] Failed to seed sample "${entry.file}":`, err);
    }
  }

  await prefsStore.set(SEED_VERSION_KEY(sessionId), maxSeedVersion);
}
