// Persistent, content-addressed cache of compiled bundles, on the sandbox
// origin's CacheStorage. A refresh (or reopen) with unchanged sources hits this
// and skips esbuild entirely: the compile surface derives a content key from the
// exact inputs, and if that bundle is already stored it returns the URL without
// running the bundler. The transport service worker serves the same URL out of
// the same CacheStorage, so a persisted bundle survives both a page reload and
// the worker being evicted — its in-memory map does not (SANDBOX.md / PLAN §7).
//
// The cache UNIT is one whole bundle: esbuild runs in bundle mode and emits a
// single module, so any change to any input yields a new key and a fresh
// compile. This tier targets the UNCHANGED case (refresh); the warm esbuild
// BuildContext handles the edit case in memory.

// Kept in sync with public/sandbox/worldBuildServiceWorker.js, which cannot import
// modules. Bumping the name orphans old entries harmlessly (they age out).
export const BUILD_CACHE_NAME = 'world-build-v1';

// FIFO cap. CacheStorage.keys() is insertion-ordered, so evicting from the front
// drops the oldest bundles while keeping the most recent — which is exactly what
// a refresh asks for.
export const BUILD_CACHE_MAX_ENTRIES = 50;

// Bumped when the key FORMAT below changes, to invalidate every stored bundle.
const KEY_FORMAT = 'k1';

/**
 * A stable content key for `files` bundled from `entry`. `salt` folds in
 * everything outside the sources that changes esbuild's output — the esbuild
 * version and the external asset base, which is baked into the emitted import
 * URLs — so a toolchain or deployment change misses rather than serving a stale
 * bundle. esbuild is deterministic for identical inputs + version, so a key hit
 * is guaranteed to equal a fresh compile: reusing it is correct, not a gamble.
 *
 * The payload is JSON of `[format, salt, entry, sorted [path, content] pairs]`.
 * JSON encoding is unambiguous, so no path or content — spaces, delimiters,
 * anything — can be reinterpreted to collide two different projects onto one key.
 */
export async function buildCacheKey(
  files: Record<string, string>,
  entry: string,
  salt: string,
): Promise<string> {
  const sortedFiles = Object.keys(files)
    .sort()
    .map(path => [path, files[path]]);
  const payload = JSON.stringify([KEY_FORMAT, salt, entry, sortedFiles]);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export interface BuildCache {
  /** Whether a bundle is already stored at `path`. */
  has(path: string): Promise<boolean>;
  /** Store `code` at `path`, then evict the oldest entries past the cap. */
  put(path: string, code: string): Promise<void>;
}

/**
 * Open the persistent build cache. Defaults to the origin's CacheStorage; a host
 * without one (CacheStorage unavailable, e.g. some private modes) degrades to a
 * no-op cache — every compile then runs and only the in-memory tier serves,
 * i.e. the pre-cache behavior.
 */
export async function openBuildCache(
  store: CacheStorage | undefined = globalThis.caches,
): Promise<BuildCache> {
  if (!store) {
    return {
      has: async () => false,
      put: async () => {},
    };
  }
  const cache = await store.open(BUILD_CACHE_NAME);
  return {
    async has(path) {
      return (await cache.match(path)) !== undefined;
    },
    async put(path, code) {
      await cache.put(
        path,
        new Response(code, {headers: {'Content-Type': 'text/javascript'}}),
      );
      const keys = await cache.keys();
      const overflow = keys.length - BUILD_CACHE_MAX_ENTRIES;
      if (overflow > 0) {
        await Promise.all(
          keys.slice(0, overflow).map(key => cache.delete(key)),
        );
      }
    },
  };
}
