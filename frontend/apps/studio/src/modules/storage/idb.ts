import {
  createStore,
  get as kvGet,
  set as kvSet,
  del as kvDel,
} from 'idb-keyval';

import type {Catalog} from '@/modules/catalog/types';

// One named store inside its own IDB database so studio's keys do not
// collide with anything else hosted under the same origin (e.g. when the
// PWA and Rails-served studio share localhost).
const STORE = createStore('studio-mobile', 'kv');

// Studio's local cache is shaped as a small set of well-known keys. The
// `_brand` field on each KeyId lets TypeScript map keys to value types
// without making us export a separate union for each.
export type CourseProgress = Record<string, unknown>;

export interface KeyToType {
  catalog: Catalog;
  lastLaunchedSlug: string;
  [progressKey: `courseProgress:${string}`]: CourseProgress;
}

export type StorageKey = keyof KeyToType;

/** Read a value by its typed key. Returns undefined when absent. */
export async function get<K extends StorageKey>(
  key: K,
): Promise<KeyToType[K] | undefined> {
  return kvGet<KeyToType[K]>(key, STORE);
}

/** Write a value by its typed key. Resolves once the write commits. */
export async function set<K extends StorageKey>(
  key: K,
  value: KeyToType[K],
): Promise<void> {
  return kvSet(key, value, STORE);
}

/** Delete a value by its typed key. No-op if absent. */
export async function del<K extends StorageKey>(key: K): Promise<void> {
  return kvDel(key, STORE);
}

/** The progress key for a given course slug. */
export function courseProgressKey(slug: string): `courseProgress:${string}` {
  return `courseProgress:${slug}` as const;
}
