/**
 * Boot-time orphan reconciliation and schema migration for seat storage.
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
  keySeatProgress,
  prefsGet,
  prefsRemove,
  readSeatIndex,
  readSeatProfile,
  writeSeatIndex,
  writeSeatProfile,
} from './storage';
import type {AiDecisionsProgress, Seat, SeatId} from './types';

/** Current schema version. Bump when Seat or JourneyProgress shape changes. */
const CURRENT_SCHEMA_VERSION = 2;

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

  if (version < 2) {
    await migrateV1ToV2();
    await Preferences.set({
      key: 'meta:schema-version',
      value: JSON.stringify(CURRENT_SCHEMA_VERSION),
    });
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[reconcile] Storage schema version ${version} > app version ${CURRENT_SCHEMA_VERSION}. Some records may be unreadable.`,
    );
  }
}

/**
 * v1 → v2: moves the legacy per-seat `seats:progress:<id>` key into
 * `seat.journeys['ai-decisions']` in the seat profile, then removes the
 * legacy key.  Adds the `kind: 'ai-decisions'` discriminant if absent.
 */
async function migrateV1ToV2(): Promise<void> {
  const index = await readSeatIndex();
  for (const seatId of index.seats) {
    const seat = await readSeatProfile(seatId);
    if (seat === null) continue;
    if (seat.journeys?.['ai-decisions'] !== undefined) continue;

    const legacy = await prefsGet<AiDecisionsProgress>(keySeatProgress(seatId));
    if (legacy === null) continue;

    const migrated: AiDecisionsProgress = {
      ...legacy,
      kind: 'ai-decisions',
    };

    const updated: Seat = {
      ...seat,
      journeys: {
        ...seat.journeys,
        'ai-decisions': migrated,
      },
    };
    await writeSeatProfile(updated);
    await prefsRemove(keySeatProgress(seatId));
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
