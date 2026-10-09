// Where a student's pathway progress lives. One implementation for now, the
// browser's local storage, behind an interface a server-backed store can
// replace once the progress shape settles.

import {EMPTY_PROGRESS, type Progress} from './model';

export interface ProgressKey {
  /** Null for a signed-out student, who shares one record per browser. */
  userId: number | null;
  /** The unit the level was opened from; null for standalone play. */
  scriptId: number | null;
  levelId: number;
  /** Guards the record: content swapped under the level is not resumed. */
  pathwayId: string;
}

export interface ProgressStore {
  load(key: ProgressKey): Promise<Progress | undefined>;
  save(key: ProgressKey, progress: Progress): Promise<void>;
}

interface StoredProgress {
  pathwayId: string;
  progress: Progress;
  savedAt: string;
}

// The same triple UserLevel is keyed by, so a server store can take over
// record for record.
const storageKey = (key: ProgressKey) =>
  `adaptive-progress:${key.userId ?? 'anonymous'}:${key.scriptId ?? 'none'}:${
    key.levelId
  }`;

const isProgress = (value: unknown): value is Progress =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as Progress).completed) &&
  Array.isArray((value as Progress).started) &&
  ((value as Progress).stepContext === undefined ||
    (typeof (value as Progress).stepContext === 'object' &&
      (value as Progress).stepContext !== null));

/**
 * Progress in the browser's local storage. Unavailable storage (private
 * windows, blocked site data) reads as no progress and drops writes, so the
 * pathway still plays for the session.
 */
export const localStorageProgressStore: ProgressStore = {
  async load(key) {
    try {
      const raw = window.localStorage.getItem(storageKey(key));
      if (!raw) return undefined;
      const stored = JSON.parse(raw) as Partial<StoredProgress>;
      if (stored.pathwayId !== key.pathwayId || !isProgress(stored.progress)) {
        return undefined;
      }
      // Records written before stepContext existed load with an empty cache.
      return {...EMPTY_PROGRESS, ...stored.progress};
    } catch {
      return undefined;
    }
  },

  async save(key, progress) {
    const stored: StoredProgress = {
      pathwayId: key.pathwayId,
      progress,
      savedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(storageKey(key), JSON.stringify(stored));
    } catch {
      // Storage unavailable: progress lives for the session only.
    }
  },
};
