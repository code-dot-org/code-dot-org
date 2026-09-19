import {
  comboPath,
  findCachedImage,
  ImageCacheManifest,
  ImageCacheMissError,
  resetManifestCache,
  variantName,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';

const BASE = 'https://cache.test/generate/';
const VERSION = 'v9';

const MANIFEST: ImageCacheManifest = {
  version: VERSION,
  adlibs: {
    'sprite-hero': {
      slots: ['adjective', 'creature'],
      characterSet: true,
      variants: {'brave-dragon/pixel': 3},
    },
    'background-story': {
      slots: ['mood', 'place'],
      characterSet: false,
      variants: {'sunny-forest/pixel': 1, 'sunny-forest/smooth': 1},
    },
  },
  blockList: {'sprite-hero': ['brave-dragon/pixel/01']},
};

const SIDECAR = {
  frames: {
    base: {file: '00-base.png', mediaType: 'image/png', prompt: 'p'},
    walking: {file: '00-walking.png', mediaType: 'image/png', prompt: 'p'},
  },
  seed: 7,
};

// A tiny fetch: the manifest, a sidecar, and image bytes by URL suffix;
// anything else is a 404.
function installFetch(manifest: ImageCacheManifest | null = MANIFEST) {
  const calls: string[] = [];
  // The project types fetch as jest-fetch-mock; this stub is plainer.
  (global as unknown as {fetch: unknown}).fetch = jest.fn(
    async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      const ok = (body: BodyInit, type: string) =>
        new Response(body, {status: 200, headers: {'content-type': type}});
      if (url.endsWith('/manifest.json')) {
        return manifest
          ? ok(JSON.stringify(manifest), 'application/json')
          : new Response('', {status: 404});
      }
      if (url.endsWith('.json')) {
        return ok(JSON.stringify(SIDECAR), 'application/json');
      }
      if (url.endsWith('00-base.png')) {
        return ok(new Uint8Array([9, 8, 7]), 'image/png');
      }
      return new Response('', {status: 404});
    }
  );
  return calls;
}

const find = (overrides = {}) =>
  findCachedImage({
    adlibId: 'sprite-hero',
    choiceIds: ['brave', 'dragon'],
    style: 'pixel',
    baseUrl: BASE,
    version: VERSION,
    ...overrides,
  });

describe('imageCache', () => {
  beforeEach(() => {
    resetManifestCache();
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('names a combo by set, choice ids in slot order, and style', () => {
    expect(comboPath('sprite-hero', ['brave', 'dragon'], 'pixel')).toBe(
      'sprite-hero/brave-dragon/pixel'
    );
    expect(variantName(0)).toBe('00');
    expect(variantName(12)).toBe('12');
  });

  it('has nothing when the manifest is missing, and asks once', async () => {
    const calls = installFetch(null);
    expect(await find()).toBeUndefined();
    expect(await find()).toBeUndefined();
    expect(calls.filter(url => url.endsWith('manifest.json'))).toHaveLength(1);
  });

  it('has nothing for a set, combo or style the manifest does not list', async () => {
    installFetch();
    expect(await find({adlibId: 'block-simple'})).toBeUndefined();
    expect(await find({choiceIds: ['brave', 'cat']})).toBeUndefined();
    expect(await find({style: 'smooth'})).toBeUndefined();
  });

  it('skips variants review blocked', async () => {
    installFetch();
    // random 0 picks the first candidate: 00 is fine, but with 00 shown
    // last the next is 02, not the blocked 01.
    expect((await find())?.variant).toBe(0);
    expect((await find({avoidVariant: 0}))?.variant).toBe(2);
  });

  it('shows the only variant again rather than nothing', async () => {
    installFetch();
    const found = await find({
      adlibId: 'background-story',
      choiceIds: ['sunny', 'forest'],
      avoidVariant: 0,
    });
    expect(found?.variant).toBe(0);
    expect(found?.characterSet).toBe(false);
  });

  it('has nothing when every variant is blocked', async () => {
    installFetch({
      ...MANIFEST,
      blockList: {
        'sprite-hero': [
          'brave-dragon/pixel/00',
          'brave-dragon/pixel/01',
          'brave-dragon/pixel/02',
        ],
      },
    });
    expect(await find()).toBeUndefined();
  });

  it('reads a frame from the folder the sidecar names', async () => {
    const calls = installFetch();
    const found = (await find())!;
    expect(found.key).toBe('sprite-hero/brave-dragon/pixel/00');
    const raw = await found.raw('base');
    expect(Array.from(raw.uint8Array)).toEqual([9, 8, 7]);
    expect(raw.mediaType).toBe('image/png');
    expect(raw.base64).toBe('CQgH');
    expect(calls).toContain(
      `${BASE}${VERSION}/sprite-hero/brave-dragon/pixel/00-base.png`
    );
  });

  it("serves a set's base as its single picture", async () => {
    installFetch();
    const raw = await (await find())!.raw('single');
    expect(Array.from(raw.uint8Array)).toEqual([9, 8, 7]);
  });

  it('reports a promised file that is not there', async () => {
    installFetch();
    const found = (await find())!;
    await expect(found.raw('walking')).rejects.toBeInstanceOf(
      ImageCacheMissError
    );
    await expect(found.raw('jumping')).rejects.toBeInstanceOf(
      ImageCacheMissError
    );
  });
});
