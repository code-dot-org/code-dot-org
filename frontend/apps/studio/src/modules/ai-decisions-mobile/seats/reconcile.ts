/**
 * Boot-time orphan reconciliation for seat storage.
 *
 * Partial writes (process kill mid-seat-create or mid-seat-clear) can leave
 * profile and progress keys that are not referenced by the index, or an index
 * entry that has no corresponding profile.  This module sweeps and removes
 * such orphans on every app boot.
 *
 * contracts/seat-storage.md "Atomicity" section documents the write order
 * that makes this reconciliation safe.
 */

import {
  prefsRemove,
  readSeatIndex,
  readSeatProfile,
  writeSeatIndex,
} from './storage';
import type {SeatId} from './types';

/** Current schema version. Bump when JourneyProgress or Seat shape changes. */
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Runs schema migration and orphan reconciliation at app boot.
 * Must complete before any seat data is read for rendering.
 */
export async function reconcileAtBoot(): Promise<void> {
  await migrateSchemaVersion();
  await removeOrphanedSeats();
}

// ---------------------------------------------------------------------------
// Schema migration
// ---------------------------------------------------------------------------

async function migrateSchemaVersion(): Promise<void> {
  const {Preferences} = await import('@capacitor/preferences');
  const {value} = await Preferences.get({key: 'meta:schema-version'});
  const version = value !== null ? (JSON.parse(value) as number) : 0;

  if (version === 0) {
    // Fresh install — write schema version, nothing else to migrate.
    await Preferences.set({
      key: 'meta:schema-version',
      value: JSON.stringify(CURRENT_SCHEMA_VERSION),
    });
  }
  // version === CURRENT_SCHEMA_VERSION: no migration needed.
  // version > CURRENT_SCHEMA_VERSION: downgrade — log and proceed read-only.
  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[reconcile] Storage schema version ${version} > app version ${CURRENT_SCHEMA_VERSION}. Some records may be unreadable.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Orphan removal
// ---------------------------------------------------------------------------

async function removeOrphanedSeats(): Promise<void> {
  const index = await readSeatIndex();
  const indexedIds = new Set<string>(index.seats);

  // Remove index entries whose profile no longer exists.
  const orphanedIndexEntries: SeatId[] = [];
  for (const seatId of index.seats) {
    const profile = await readSeatProfile(seatId);
    if (profile === null) {
      orphanedIndexEntries.push(seatId);
    }
  }

  if (orphanedIndexEntries.length > 0) {
    const cleanedIndex = {
      ...index,
      seats: index.seats.filter(id => !orphanedIndexEntries.includes(id)),
      activeSeatId:
        index.activeSeatId !== null &&
        orphanedIndexEntries.includes(index.activeSeatId)
          ? null
          : index.activeSeatId,
    };
    await writeSeatIndex(cleanedIndex);
  }

  // Enumerate all Preferences keys to find orphaned profile/progress entries.
  // @capacitor/preferences v7 exposes `keys()` for this.
  const {Preferences} = await import('@capacitor/preferences');
  const {keys} = await Preferences.keys();

  const orphanedKeys: string[] = [];
  for (const key of keys) {
    if (key.startsWith('seats:profile:') || key.startsWith('seats:progress:')) {
      const seatId = extractSeatId(key);
      if (seatId !== null && !indexedIds.has(seatId)) {
        orphanedKeys.push(key);
      }
    }
  }

  await Promise.all(orphanedKeys.map(k => prefsRemove(k)));

  if (orphanedIndexEntries.length > 0 || orphanedKeys.length > 0) {
    console.info(
      `[reconcile] Removed ${orphanedIndexEntries.length} orphaned index entries, ${orphanedKeys.length} orphaned storage keys.`,
    );
  }
}

/**
 * Extracts the `seat:<uuid>` portion from a storage key like
 * `seats:profile:seat:<uuid>` or `seats:progress:seat:<uuid>`.
 */
function extractSeatId(key: string): string | null {
  const prefixes = ['seats:profile:', 'seats:progress:'];
  for (const prefix of prefixes) {
    if (key.startsWith(prefix)) {
      return key.slice(prefix.length);
    }
  }
  return null;
}
