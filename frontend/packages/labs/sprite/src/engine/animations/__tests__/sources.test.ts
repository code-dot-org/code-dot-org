import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {RuntimeAnimationList} from '../../../types';
import {
  animationSourceUrl,
  loadAnimationSources,
  revokeAnimationSources,
} from '../sources';

const proxied = (url: string) =>
  `//${window.location.host}/media?u=${encodeURIComponent(url)}`;

describe('animationSourceUrl', () => {
  it('fetches a library image through the media proxy', () => {
    const url = 'https://studio.code.org/api/v1/animation-library/cat.png';
    expect(animationSourceUrl('k', {sourceUrl: url}, 'ch')).toBe(proxied(url));
  });

  it('fetches from a CORS-open host directly', () => {
    const url = 'https://images.code.org/cat.png';
    expect(animationSourceUrl('k', {sourceUrl: url}, 'ch')).toBe(url);
  });

  it('leaves a relative library path alone', () => {
    const url = '/api/v1/animation-library/spritelab/cat.png';
    expect(animationSourceUrl('k', {sourceUrl: url}, 'ch')).toBe(url);
  });

  it("asks for an uploaded image's saved version", () => {
    const url = '/v3/animations/ch/k.png';
    expect(animationSourceUrl('k', {sourceUrl: url, version: 'v1'}, 'ch')).toBe(
      `${url}?version=v1`,
    );
    expect(animationSourceUrl('k', {sourceUrl: url}, 'ch')).toBe(
      `${url}?version=latestVersion`,
    );
    expect(
      animationSourceUrl('k', {sourceUrl: `${url}?version=v2`}, 'ch'),
    ).toBe(`${url}?version=v2`);
  });

  it('looks up an image without a sourceUrl by key', () => {
    expect(animationSourceUrl('a b/c', {version: 'v3'}, 'ch')).toBe(
      '/v3/animations/ch/a%20b/c.png?version=v3',
    );
    expect(animationSourceUrl('k', {}, 'ch')).toBe(
      '/v3/animations/ch/k.png?version=',
    );
  });
});

function list(
  entries: Record<string, {name: string; dataURI?: string}>,
): RuntimeAnimationList {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  for (const [key, entry] of Object.entries(entries)) {
    propsByKey[key] = {
      frameSize: {x: 1, y: 1},
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      ...entry,
    };
  }
  return {orderedKeys: Object.keys(entries), propsByKey};
}

describe('loadAnimationSources', () => {
  let urls: number;

  beforeEach(() => {
    urls = 0;
    URL.createObjectURL = vi.fn(() => `blob:image-${++urls}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('holds each fetched image as an object URL', async () => {
    const fetchImpl = vi.fn(async () => new Response(new Blob(['png'])));
    const loaded = await loadAnimationSources(
      list({a: {name: 'cat'}, b: {name: 'dog'}}),
      {channelId: 'ch', fetch: fetchImpl},
    );
    expect(fetchImpl).toHaveBeenCalledWith('/v3/animations/ch/a.png?version=');
    expect(loaded.propsByKey.a.dataURI).toMatch(/^blob:image-/);
    expect(loaded.propsByKey.b.dataURI).toMatch(/^blob:image-/);
  });

  it('keeps an entry that already has data', async () => {
    const fetchImpl = vi.fn(async () => new Response(new Blob(['png'])));
    const loaded = await loadAnimationSources(
      list({a: {name: 'cat', dataURI: 'data:image/png;base64,'}}),
      {channelId: 'ch', fetch: fetchImpl},
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(loaded.propsByKey.a.dataURI).toBe('data:image/png;base64,');
  });

  it('reports an image that fails and leaves it unloaded', async () => {
    const onError = vi.fn();
    const fetchImpl = vi.fn(async () => new Response('', {status: 404}));
    const loaded = await loadAnimationSources(list({a: {name: 'cat'}}), {
      channelId: 'ch',
      fetch: fetchImpl,
      onError,
    });
    expect(onError).toHaveBeenCalledWith('a', 'cat', expect.any(Error));
    expect(loaded.propsByKey.a.dataURI).toBeUndefined();
  });

  it('revokes only object URLs', () => {
    revokeAnimationSources(
      list({
        a: {name: 'cat', dataURI: 'blob:x'},
        b: {name: 'dog', dataURI: 'data:image/png;base64,'},
      }),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });
});
