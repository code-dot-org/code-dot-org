/**
 * Capacitor Preferences adapter for the mobile prototype seat storage.
 *
 * Wraps @capacitor/preferences to provide typed get/set/remove helpers
 * with the key namespace defined in contracts/seat-storage.md.
 *
 * Atomicity guarantee: Preferences does not provide multi-key transactions.
 * Write order conventions are documented per operation to survive partial
 * writes (process kill mid-update).  An orphan-reconciliation pass at boot
 * (reconcile.ts) cleans up any partially-written state.
 */

import {Preferences} from '@capacitor/preferences';

import type {JourneyProgress, Seat, SeatId, SeatIndex} from './types';

// ---------------------------------------------------------------------------
// Key builders — match the namespace in contracts/seat-storage.md
// ---------------------------------------------------------------------------

/** Top-level schema migration cursor. */
export const KEY_SCHEMA_VERSION = 'meta:schema-version';
/** Ordered list of all seat ids plus the active seat. */
export const KEY_SEATS_INDEX = 'seats:index';

/** @returns Storage key for a seat's profile. */
export function keySeatProfile(seatId: SeatId): string {
  return `seats:profile:${seatId}`;
}

/** @returns Storage key for a seat's journey progress. */
export function keySeatProgress(seatId: SeatId): string {
  return `seats:progress:${seatId}`;
}

/** @returns Storage key for a level's per-renderer resume state. */
export function keyLevelState(seatId: SeatId, levelId: string): string {
  return `seats:level-state:${seatId}:${levelId}`;
}

// ---------------------------------------------------------------------------
// Generic read/write helpers
// ---------------------------------------------------------------------------

/**
 * Reads and JSON-parses a Preferences entry.
 * @returns Parsed value, or `null` if the key is absent.
 */
export async function prefsGet<T>(key: string): Promise<T | null> {
  const {value} = await Preferences.get({key});
  if (value === null) return null;
  return JSON.parse(value) as T;
}

/**
 * JSON-serialises and writes a Preferences entry.
 */
export async function prefsSet<T>(key: string, value: T): Promise<void> {
  await Preferences.set({key, value: JSON.stringify(value)});
}

/** Removes a Preferences entry. */
export async function prefsRemove(key: string): Promise<void> {
  await Preferences.remove({key});
}

// ---------------------------------------------------------------------------
// Typed helpers for the domain objects
// ---------------------------------------------------------------------------

/** Reads the schema version; returns 0 for a fresh install. */
export async function readSchemaVersion(): Promise<number> {
  return (await prefsGet<number>(KEY_SCHEMA_VERSION)) ?? 0;
}

/** Writes the schema version. */
export async function writeSchemaVersion(v: number): Promise<void> {
  await prefsSet(KEY_SCHEMA_VERSION, v);
}

/** Reads the seat index; returns an empty index if absent. */
export async function readSeatIndex(): Promise<SeatIndex> {
  return (
    (await prefsGet<SeatIndex>(KEY_SEATS_INDEX)) ?? {
      seats: [],
      activeSeatId: null,
    }
  );
}

/** Writes the seat index. */
export async function writeSeatIndex(index: SeatIndex): Promise<void> {
  await prefsSet(KEY_SEATS_INDEX, index);
}

/** Reads a seat profile; returns null if absent. */
export async function readSeatProfile(seatId: SeatId): Promise<Seat | null> {
  return prefsGet<Seat>(keySeatProfile(seatId));
}

/**
 * Writes a seat profile.
 * Write the profile BEFORE updating the index (atomicity convention:
 * an orphan profile is cheaper to clean up than a missing-profile index entry).
 */
export async function writeSeatProfile(seat: Seat): Promise<void> {
  await prefsSet(keySeatProfile(seat.id), seat);
}

/** Removes a seat profile. */
export async function removeSeatProfile(seatId: SeatId): Promise<void> {
  await prefsRemove(keySeatProfile(seatId));
}

/** Reads a seat's journey progress; returns null if absent. */
export async function readSeatProgress(
  seatId: SeatId,
): Promise<JourneyProgress | null> {
  return prefsGet<JourneyProgress>(keySeatProgress(seatId));
}

/**
 * Custom window event fired whenever a seat's journey progress is written.
 * Subscribers (e.g. the JourneyPage) re-read storage to refresh their view.
 * This sidesteps the React Router caching problem where the journey
 * component instance can outlive a navigation round-trip and keep stale
 * progress in state.
 */
export const PROGRESS_UPDATED_EVENT = 'mobile:progress-updated';

/** Writes a seat's journey progress.  Also fires PROGRESS_UPDATED_EVENT
 * so any mounted view (e.g. JourneyPage) can re-read storage. */
export async function writeSeatProgress(
  progress: JourneyProgress,
): Promise<void> {
  await prefsSet(keySeatProgress(progress.seatId), progress);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PROGRESS_UPDATED_EVENT, {
        detail: {seatId: progress.seatId},
      }),
    );
  }
}

/** Removes a seat's journey progress. */
export async function removeSeatProgress(seatId: SeatId): Promise<void> {
  await prefsRemove(keySeatProgress(seatId));
}

/** Reads a level's renderer-specific resume state. */
export async function readLevelState<T>(
  seatId: SeatId,
  levelId: string,
): Promise<T | null> {
  return prefsGet<T>(keyLevelState(seatId, levelId));
}

/** Writes a level's renderer-specific resume state. */
export async function writeLevelState<T>(
  seatId: SeatId,
  levelId: string,
  state: T,
): Promise<void> {
  await prefsSet(keyLevelState(seatId, levelId), state);
}

/** Removes a level's renderer-specific resume state. */
export async function removeLevelState(
  seatId: SeatId,
  levelId: string,
): Promise<void> {
  await prefsRemove(keyLevelState(seatId, levelId));
}

/**
 * Removes all level-state entries for a seat.
 * Used during seat-clear; iterates the known keys from a provided list
 * since Preferences has no wildcard-delete.
 */
export async function removeAllLevelStates(
  seatId: SeatId,
  levelIds: string[],
): Promise<void> {
  await Promise.all(levelIds.map(id => removeLevelState(seatId, id)));
}
