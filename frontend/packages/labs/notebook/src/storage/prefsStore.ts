/**
 * Thin storage abstraction that routes to @capacitor/preferences on native
 * Capacitor builds and falls back to localStorage on web.  This keeps
 * higher-level modules unaware of the deployment target.
 *
 * NOTE: @capacitor/preferences must be present in package.json dependencies.
 * It has been added as "^6.0.0"; run `yarn` at the workspace root to install.
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Gets a stored JSON value by key.  Returns null if absent or unparseable.
 * @param key Storage key
 * @returns Deserialized value, or null
 */
export async function get<T>(key: string): Promise<T | null> {
  let raw: string | null;

  if (Capacitor.isNativePlatform()) {
    const result = await Preferences.get({ key });
    raw = result.value;
  } else {
    raw = localStorage.getItem(key);
  }

  if (raw === null) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt or legacy value; treat as absent rather than crashing.
    return null;
  }
}

/**
 * Stores a JSON-serializable value by key.
 * @param key Storage key
 * @param value Value to persist
 */
export async function set<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value);

  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value: serialized });
  } else {
    localStorage.setItem(key, serialized);
  }
}

/**
 * Removes a stored value by key.
 * @param key Storage key
 */
export async function remove(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
}
