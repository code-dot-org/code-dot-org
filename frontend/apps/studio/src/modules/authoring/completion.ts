import {useCallback, useSyncExternalStore} from 'react';

export type CompletionStatus = 'passed' | 'attempted';
export type CompletionMap = Record<string, CompletionStatus>;

// A runaway agent-authored course shouldn't grow localStorage without
// bound. Mirrors the ceiling clientState.js applies to cached progress,
// just shaped for a map instead of a scalar per level.
const MAX_ENTRIES_PER_COURSE = 500;
const KEY_PREFIX = 'authoring-completion:';
const EMPTY_MAP: CompletionMap = {};

// In-memory mirror of localStorage, keyed by course. useSyncExternalStore
// needs a snapshot that's referentially stable across calls when nothing
// changed — re-parsing localStorage on every read would violate that and
// spin the hook into a loop.
const cache = new Map<string, CompletionMap>();
const listeners = new Set<() => void>();

function storageKey(courseId: string): string {
  return `${KEY_PREFIX}${courseId}`;
}

function readFromStorage(courseId: string): CompletionMap {
  try {
    const raw = window.localStorage.getItem(storageKey(courseId));
    return raw ? (JSON.parse(raw) as CompletionMap) : EMPTY_MAP;
  } catch {
    return EMPTY_MAP;
  }
}

function getMap(courseId: string): CompletionMap {
  let map = cache.get(courseId);
  if (!map) {
    map = readFromStorage(courseId);
    cache.set(courseId, map);
  }
  return map;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Records completion for one experience, keyed per course. Never downgrades
 * 'passed' to 'attempted' — revisiting a solved activity shouldn't erase the
 * earlier success.
 */
export function markCompletion(
  courseId: string,
  experienceId: string,
  status: CompletionStatus,
): void {
  const current = getMap(courseId);
  const existing = current[experienceId];
  if (existing === 'passed' || existing === status) {
    return;
  }
  if (
    existing === undefined &&
    Object.keys(current).length >= MAX_ENTRIES_PER_COURSE
  ) {
    return;
  }
  const next = {...current, [experienceId]: status};
  cache.set(courseId, next);
  try {
    window.localStorage.setItem(storageKey(courseId), JSON.stringify(next));
  } catch {
    // Storage full or unavailable: keep the in-memory update for this tab.
  }
  notify();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    // Another tab wrote this course's completion — drop our cached copy so
    // the next read picks up its value instead of a stale one.
    if (event.key?.startsWith(KEY_PREFIX)) {
      cache.delete(event.key.slice(KEY_PREFIX.length));
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

/** Live completion map for one course, plus a bound `mark` — re-renders on change. */
export function useCompletion(courseId: string): {
  map: CompletionMap;
  mark: (experienceId: string, status: CompletionStatus) => void;
} {
  const map = useSyncExternalStore(subscribe, () => getMap(courseId));
  const mark = useCallback(
    (experienceId: string, status: CompletionStatus) =>
      markCompletion(courseId, experienceId, status),
    [courseId],
  );
  return {map, mark};
}
