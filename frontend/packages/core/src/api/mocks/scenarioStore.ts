// sessionStorage write-through for MSW mock state. Keys are namespaced by
// `<labKey>:<tag>` so each fixture scenario gets its own slate; switching
// labs or tags in the URL switches the working set without clobbering.
//
// Reads return `undefined` when nothing is stored — the handler falls back
// to fixture data, which falls back to a handler-specific default.

import {clearAllAssets} from './assetStore';
import {getActiveScenario} from './scenario';

const NAMESPACE = 'cdo-mock';
const RESET_QUERY_PARAM = 'cdoMockReset';

function activeKey(resource: string): string | undefined {
  const scenario = getActiveScenario();
  if (!scenario || typeof window === 'undefined') return undefined;
  return `${NAMESPACE}:${scenario.labKey}:${scenario.tag}:${resource}`;
}

export function readResource<T>(resource: string): T | undefined {
  const key = activeKey(resource);
  if (!key) return undefined;
  const raw = window.sessionStorage.getItem(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function writeResource<T>(resource: string, value: T): void {
  const key = activeKey(resource);
  if (!key) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearResource(resource: string): void {
  const key = activeKey(resource);
  if (!key) return;
  window.sessionStorage.removeItem(key);
}

/**
 * Wipes every key in the `cdo-mock:` namespace, and the stored assets.
 *
 * The assets live in IndexedDB rather than here (`assetStore`), so a reset
 * that only swept this store would leave the uploaded bytes behind — which is
 * the one kind of state big enough for anybody to notice.
 *
 * Not awaited: a reset happens before the mocks answer anything, and a caller
 * that had to wait for it would have to be async all the way up for the sake
 * of bytes nothing is about to ask for.
 */
export function resetScenarioStore(): void {
  if (typeof window === 'undefined') return;
  void clearAllAssets();
  const prefix = `${NAMESPACE}:`;
  const toRemove: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const k = window.sessionStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach(k => window.sessionStorage.removeItem(k));
}

/**
 * If the current URL carries `?cdoMockReset=1`, wipe the store and strip the
 * param from the visible URL so a subsequent reload doesn't reset again.
 * Safe to call repeatedly.
 */
export function maybeResetFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(RESET_QUERY_PARAM) !== '1') return;

  resetScenarioStore();
  url.searchParams.delete(RESET_QUERY_PARAM);
  window.history.replaceState({}, '', url.toString());
}
