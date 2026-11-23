import {
  findCachedImage,
  frameFileName,
  ImageCacheMissError,
  resetImageCacheState,
  sentencePath,
  VARIANT_COUNT,
  variantName,
  imageSourceFor,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';

// lodash keeps its own handle on Math.random, so the shuffle is pinned
// here instead: variants come in list order.
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  shuffle: <T>(items: T[]) => [...items],
}));

const BASE = 'https://cache.test/generate/';
const VERSION = 'v9';
const FOLDER = `${BASE}${VERSION}/character/brave/dragon/_/pixel`;
const OTHER_FOLDER = `${BASE}${VERSION}/character/calm/dragon/_/pixel`;

// A tiny cache: the named variants' base frames, and one walking frame;
// anything else is a 404.
function installFetch(
  variants: string[] = ['00', '02'],
  folders: string[] = [FOLDER]
) {
  const calls: string[] = [];
  // The project types fetch as jest-fetch-mock; this stub is plainer.
  (global as unknown as {fetch: unknown}).fetch = jest.fn(
    async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      const ok = (body: BodyInit, type: string) =>
        new Response(body, {status: 200, headers: {'content-type': type}});
      const variant = variants.find(v =>
        folders.some(folder => url === `${folder}/${v}-base.png`)
      );
      if (variant) {
        return ok(new Uint8Array([Number(variant), 8, 7]), 'image/png');
      }
      if (url === `${FOLDER}/00-walking.png`) {
        return ok(new Uint8Array([1]), 'image/png');
      }
      return new Response('', {status: 404});
    }
  );
  return calls;
}

const find = (overrides = {}) =>
  findCachedImage({
    sentenceId: 'character',
    wordIds: ['brave', 'dragon', '_'],
    style: 'pixel',
    characterSet: true,
    baseUrl: BASE,
    version: VERSION,
    ...overrides,
  });

describe('imageCache', () => {
  beforeEach(() => {
    resetImageCacheState();
  });

  it('names a filled sentence by sentence, one folder per word, and style', () => {
    expect(sentencePath('character', ['brave', 'dragon', '_'], 'pixel')).toBe(
      'character/brave/dragon/_/pixel'
    );
    expect(sentencePath('place-time', ['_', 'forest', 'night'], 'smooth')).toBe(
      'place-time/_/forest/night/smooth'
    );
    expect(variantName(0)).toBe('00');
    expect(variantName(12)).toBe('12');
  });

  it("names a frame's file by variant and, for a set, its frame", () => {
    expect(frameFileName(0, 'base', true)).toBe('00-base.png');
    expect(frameFileName(3, 'walking', true)).toBe('03-walking.png');
    expect(frameFileName(3, 'single', false)).toBe('03.png');
  });

  it('takes the first variant whose first frame is there', async () => {
    installFetch();
    const found = await find();
    expect(found?.variant).toBe(0);
    expect(found?.characterSet).toBe(true);
  });

  it('passes over a missing variant, and the one shown last', async () => {
    installFetch(['01', '02']);
    expect((await find())?.variant).toBe(1);
    expect((await find())?.variant).toBe(2);
  });

  it('shows the only variant again rather than nothing', async () => {
    installFetch(['02']);
    expect((await find())?.variant).toBe(2);
    expect((await find())?.variant).toBe(2);
  });

  it('brings back the variant found longest ago when every variant was found recently', async () => {
    installFetch(['01', '02', '04']);
    const found: (number | undefined)[] = [];
    for (let i = 0; i < 7; i++) {
      found.push((await find())?.variant);
    }
    expect(found).toEqual([1, 2, 4, 1, 2, 4, 1]);
  });

  it('leaves two of a full set to choose between', async () => {
    installFetch([...Array(VARIANT_COUNT).keys()].map(variantName));
    const found: number[] = [];
    for (let i = 0; i < VARIANT_COUNT - 1; i++) {
      found.push((await find())?.variant as number);
    }
    expect(new Set(found).size).toBe(VARIANT_COUNT - 1);
    // The two are the variant not found yet and the variant found first.
    // The shuffle is pinned to keep its input's order, so the
    // lower-numbered is chosen, and that is the variant found first.
    expect((await find())?.variant).toBe(found[0]);
  });

  it('starts again from nothing when the words change', async () => {
    installFetch(['01', '02', '04'], [FOLDER, OTHER_FOLDER]);
    expect((await find())?.variant).toBe(1);
    expect((await find())?.variant).toBe(2);
    expect((await find({wordIds: ['calm', 'dragon', '_']}))?.variant).toBe(1);
    // Back to the first words: the two variants found for them earlier are
    // forgotten.
    expect((await find())?.variant).toBe(1);
  });

  it('has nothing when no variant is there, and asks each once', async () => {
    const calls = installFetch([]);
    expect(await find()).toBeUndefined();
    expect(await find()).toBeUndefined();
    expect(calls).toHaveLength(VARIANT_COUNT);
  });

  it('asks again after a fetch that failed, and says so', async () => {
    const calls = installFetch();
    const fetchMock = (global as unknown as {fetch: jest.Mock}).fetch;
    const working = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementationOnce(async (input: RequestInfo | URL) => {
      calls.push(String(input));
      throw new TypeError('Failed to fetch');
    });
    await expect(find()).rejects.toBeInstanceOf(TypeError);
    fetchMock.mockImplementation(working);
    expect((await find())!.variant).toBe(0);
    expect(calls).toEqual([`${FOLDER}/00-base.png`, `${FOLDER}/00-base.png`]);
  });

  it('has nothing for words or a style the cache lacks', async () => {
    installFetch();
    expect(await find({wordIds: ['brave', 'cat', '_']})).toBeUndefined();
    expect(await find({style: 'smooth'})).toBeUndefined();
  });

  it('keeps the first frame it found and reads the others on demand', async () => {
    const calls = installFetch();
    const found = (await find())!;
    const base = await found.raw('base');
    expect(Array.from(base.uint8Array)).toEqual([0, 8, 7]);
    expect(base.mediaType).toBe('image/png');
    expect(base.base64).toBe('AAgH');
    expect(calls.filter(url => url === `${FOLDER}/00-base.png`)).toHaveLength(
      1
    );
    const walking = await found.raw('walking');
    expect(Array.from(walking.uint8Array)).toEqual([1]);
    expect(calls).toContain(`${FOLDER}/00-walking.png`);
  });

  it("serves a set's base as its single picture", async () => {
    installFetch();
    const raw = await (await find())!.raw('single');
    expect(Array.from(raw.uint8Array)).toEqual([0, 8, 7]);
  });

  it('finds a single picture by its one file', async () => {
    const folder = `${BASE}${VERSION}/place/_/forest/pixel`;
    const calls: string[] = [];
    (global as unknown as {fetch: unknown}).fetch = jest.fn(
      async (input: RequestInfo | URL) => {
        calls.push(String(input));
        return String(input) === `${folder}/00.png`
          ? new Response(new Uint8Array([4]), {status: 200})
          : new Response('', {status: 404});
      }
    );
    const found = await find({
      sentenceId: 'place',
      wordIds: ['_', 'forest'],
      characterSet: false,
    });
    expect(found?.variant).toBe(0);
    expect(found?.characterSet).toBe(false);
    const raw = await found!.raw('single');
    expect(Array.from(raw.uint8Array)).toEqual([4]);
    expect(raw.mediaType).toBe('image/png');
    expect(calls).toEqual([`${folder}/00.png`]);
  });

  it('reports a frame file that is not there', async () => {
    installFetch();
    const found = (await find())!;
    await expect(found.raw('jumping')).rejects.toBeInstanceOf(
      ImageCacheMissError
    );
  });
});

describe('imageSourceFor', () => {
  it('gives anyone but a levelbuilder the cache, whatever is asked for', () => {
    expect(imageSourceFor('live', undefined, false)).toBe('cached');
    expect(imageSourceFor(undefined, 'live', false)).toBe('cached');
  });

  it("gives a levelbuilder the level's source, or the one asked for", () => {
    expect(imageSourceFor('live', undefined, true)).toBe('live');
    expect(imageSourceFor(undefined, 'live', true)).toBe('live');
    expect(imageSourceFor('live', 'cached', true)).toBe('cached');
    expect(imageSourceFor(undefined, undefined, true)).toBe('cached');
  });
});
