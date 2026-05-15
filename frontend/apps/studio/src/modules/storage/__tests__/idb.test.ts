import {beforeEach, describe, expect, it} from 'vitest';

import {courseProgressKey, del, get, set} from '@/modules/storage/idb';

describe('storage/idb', () => {
  beforeEach(async () => {
    // jsdom recreates IDB per test file, but to be safe we explicitly clear
    // anything our wrapper might have written in a prior test run.
    await del('catalog');
    await del('lastLaunchedSlug');
    await del(courseProgressKey('ai-for-oceans'));
  });

  it('round-trips a primitive value', async () => {
    expect(await get('lastLaunchedSlug')).toBeUndefined();
    await set('lastLaunchedSlug', 'ai-for-oceans');
    expect(await get('lastLaunchedSlug')).toBe('ai-for-oceans');
  });

  it('round-trips a structured catalog value', async () => {
    const catalog = {
      version: 1 as const,
      fetchedAt: 1715731200000,
      courses: [
        {
          slug: 'ai-for-oceans',
          title: 'AI for Oceans',
          description: 'Train a classifier.',
          illustration: 'oceans.webp',
          sampleOffline: true,
        },
      ],
    };
    await set('catalog', catalog);
    expect(await get('catalog')).toEqual(catalog);
  });

  it('writes and reads a per-course progress entry', async () => {
    const key = courseProgressKey('ai-for-oceans');
    await set(key, {step: 3, labeledFish: 12});
    expect(await get(key)).toEqual({step: 3, labeledFish: 12});
  });

  it('deletes a value', async () => {
    await set('lastLaunchedSlug', 'music');
    await del('lastLaunchedSlug');
    expect(await get('lastLaunchedSlug')).toBeUndefined();
  });
});
