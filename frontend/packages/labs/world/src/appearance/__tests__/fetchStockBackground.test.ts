// Getting a backdrop's bytes, and failing to.
//
// The stock backdrops are fetched by `yarn setup:world` and served, so unlike
// every other thing on the library's shelves this one can be missing at the
// moment a learner asks for it — the setup script skips what it cannot reach
// (BACKGROUNDS.md §7). What that failure says is the interesting half.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {fetchStockBackground} from '../fetchStockBackground';

const background = {id: 'cave', name: 'Cave', url: '/backgrounds/cave.png'};

afterEach(() => vi.unstubAllGlobals());

describe('fetchStockBackground', () => {
  it('hands back the bytes as a data URL', async () => {
    // A project file holds bytes, not a URL to someone else's copy: from the
    // moment it is imported the backdrop is the learner's file.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ok: true, blob: async () => new Blob(['png'])})),
    );

    await expect(fetchStockBackground(background)).resolves.toMatch(/^data:/);
  });

  it('asks for exactly where the shelf said it was', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      blob: async () => new Blob(['png']),
    }));
    vi.stubGlobal('fetch', fetcher);

    await fetchStockBackground(background);

    expect(fetcher).toHaveBeenCalledWith('/backgrounds/cave.png');
  });

  it('names the backdrop, not the URL, when it cannot be had', async () => {
    // The learner chose "Cave"; a path under `public/` is not a thing they
    // picked or can act on.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ok: false, status: 404})),
    );

    await expect(fetchStockBackground(background)).rejects.toThrow(/Cave/);
    await expect(fetchStockBackground(background)).rejects.toThrow(/404/);
  });
});
