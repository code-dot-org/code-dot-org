// @vitest-environment node
// Node env: buildCache uses crypto.subtle + Response, which Node provides
// globally but jsdom does not.
import {describe, expect, it} from 'vitest';

import {
  BUILD_CACHE_MAX_ENTRIES,
  buildCacheKey,
  openBuildCache,
} from '../buildCache';

const FILES = {'a.js': 'export const a = 1;', 'b.js': 'export const b = 2;'};

describe('buildCacheKey', () => {
  it('is stable for identical inputs', async () => {
    const a = await buildCacheKey(FILES, 'a.js', 'salt');
    const b = await buildCacheKey(FILES, 'a.js', 'salt');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
  });

  it('is independent of file insertion order', async () => {
    const forward = await buildCacheKey(
      {'a.js': '1', 'b.js': '2'},
      'a.js',
      's',
    );
    const reverse = await buildCacheKey(
      {'b.js': '2', 'a.js': '1'},
      'a.js',
      's',
    );
    expect(forward).toBe(reverse);
  });

  it('changes when any input changes', async () => {
    const base = await buildCacheKey(FILES, 'a.js', 'salt');
    expect(
      await buildCacheKey(
        {...FILES, 'a.js': 'export const a = 9;'},
        'a.js',
        'salt',
      ),
    ).not.toBe(base);
    expect(await buildCacheKey(FILES, 'b.js', 'salt')).not.toBe(base);
    expect(await buildCacheKey(FILES, 'a.js', 'salt2')).not.toBe(base);
    // A new file, even empty, is a different project.
    expect(
      await buildCacheKey({...FILES, 'c.js': ''}, 'a.js', 'salt'),
    ).not.toBe(base);
  });

  it('does not collide when content shifts across the separator', async () => {
    // Guards against a naive concat where {ab:''} and {a:'b'} could hash alike.
    const one = await buildCacheKey({ab: ''}, 'e', 's');
    const two = await buildCacheKey({a: 'b'}, 'e', 's');
    expect(one).not.toBe(two);
  });
});

/** Minimal in-memory CacheStorage double (insertion-ordered, string-keyed). */
function fakeCaches(): {store: CacheStorage; size: () => number} {
  const map = new Map<string, Response>();
  const keyOf = (r: unknown): string =>
    typeof r === 'string' ? r : (r as {url: string}).url;
  const cache = {
    match: async (r: RequestInfo | URL) => map.get(keyOf(r)),
    put: async (r: RequestInfo | URL, res: Response) => {
      map.set(keyOf(r), res);
    },
    delete: async (r: RequestInfo | URL) => map.delete(keyOf(r)),
    keys: async () => [...map.keys()].map(url => ({url}) as Request),
  } as unknown as Cache;
  const store = {open: async () => cache} as unknown as CacheStorage;
  return {store, size: () => map.size};
}

describe('openBuildCache', () => {
  it('round-trips has/put', async () => {
    const {store} = fakeCaches();
    const cache = await openBuildCache(store);
    expect(await cache.has('/__world_build__/x.mjs')).toBe(false);
    await cache.put('/__world_build__/x.mjs', 'export default 1;');
    expect(await cache.has('/__world_build__/x.mjs')).toBe(true);
  });

  it('evicts oldest entries past the cap (FIFO)', async () => {
    const {store, size} = fakeCaches();
    const cache = await openBuildCache(store);
    const total = BUILD_CACHE_MAX_ENTRIES + 5;
    for (let i = 0; i < total; i++) {
      await cache.put(`/__world_build__/${i}.mjs`, `// ${i}`);
    }
    expect(size()).toBe(BUILD_CACHE_MAX_ENTRIES);
    // The first 5 (oldest) are gone; the most recent survive.
    expect(await cache.has('/__world_build__/0.mjs')).toBe(false);
    expect(await cache.has('/__world_build__/4.mjs')).toBe(false);
    expect(await cache.has('/__world_build__/5.mjs')).toBe(true);
    expect(await cache.has(`/__world_build__/${total - 1}.mjs`)).toBe(true);
  });

  it('degrades to a no-op cache when CacheStorage is absent', async () => {
    const cache = await openBuildCache(undefined);
    await cache.put('/__world_build__/x.mjs', 'code'); // must not throw
    expect(await cache.has('/__world_build__/x.mjs')).toBe(false);
  });
});
