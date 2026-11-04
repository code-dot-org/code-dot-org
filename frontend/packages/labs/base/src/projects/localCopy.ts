// A copy of a project's unsaved sources in the browser's own storage, so
// that leaving the page before a save lands loses nothing.
//
// Saves are held to one per interval, and a request started as the page
// unloads is cancelled with it; the payload is too large for `keepalive`.
// A write to `localStorage` is synchronous and survives the unload.
//
// Each copy names the server version it was edited from. One whose version
// is no longer the latest was overtaken by a save from elsewhere, and is
// dropped rather than written over it.

import type {ProjectSources} from '@code-dot-org/core/api';

export interface LocalCopy {
  /** The server version the edits were made on; null for a project never saved. */
  base: string | null;
  sources: ProjectSources;
}

export interface LocalCopyStore {
  read(channelId: string): LocalCopy | undefined;
  write(channelId: string, copy: LocalCopy): void;
  clear(channelId: string): void;
}

const keyOf = (channelId: string) => `lab.unsaved.${channelId}`;

/**
 * `localStorage`. Every access is guarded: storage can be blocked, full, or
 * hold something else under the key, and none of those may stop a save.
 */
export const browserLocalCopy: LocalCopyStore = {
  read(channelId) {
    try {
      const raw = localStorage.getItem(keyOf(channelId));
      const held = raw ? (JSON.parse(raw) as Partial<LocalCopy>) : undefined;
      return held && typeof held.sources === 'object' && held.sources
        ? {base: held.base ?? null, sources: held.sources}
        : undefined;
    } catch {
      return undefined;
    }
  },
  write(channelId, copy) {
    try {
      localStorage.setItem(keyOf(channelId), JSON.stringify(copy));
    } catch {
      // Too big for the quota, most likely. A stale copy is worse than none.
      this.clear(channelId);
    }
  },
  clear(channelId) {
    try {
      localStorage.removeItem(keyOf(channelId));
    } catch {
      // Nothing to clear where nothing can be stored.
    }
  },
};
