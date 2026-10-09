import {
  findCachedImage,
  frameFileName,
  ImageCacheMissError,
  resetSidecarCache,
  sentencePath,
  variantName,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';

// lodash keeps its own handle on Math.random, so the shuffle is pinned
// here instead: variants come in list order.
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  shuffle: <T>(items: T[]) => [...items],
}));

const BASE = 'https://cache.test/generate/';
const VERSION = 'v9';
const FOLDER = `${BASE}${VERSION}/character/brave-dragon/pixel`;

const SIDECAR = {characterSet: true, keyColor: 'magenta', pixelGrid: 64};

// A tiny tree: the sidecars named, one set's base frame; anything else is
// a 404.
function installFetch(sidecars: string[] = ['00', '02']) {
  const calls: string[] = [];
  // The project types fetch as jest-fetch-mock; this stub is plainer.
  (global as unknown as {fetch: unknown}).fetch = jest.fn(
    async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      const ok = (body: BodyInit, type: string) =>
        new Response(body, {status: 200, headers: {'content-type': type}});
      const sidecar = sidecars.find(v => url === `${FOLDER}/${v}.json`);
      if (sidecar) {
        return ok(JSON.stringify(SIDECAR), 'application/json');
      }
      if (url === `${FOLDER}/00-base.png`) {
        return ok(new Uint8Array([9, 8, 7]), 'image/png');
      }
      return new Response('', {status: 404});
    }
  );
  return calls;
}

const find = (overrides = {}) =>
  findCachedImage({
    sentenceId: 'character',
    wordIds: ['brave', 'dragon'],
    style: 'pixel',
    baseUrl: BASE,
    version: VERSION,
    ...overrides,
  });

describe('imageCache', () => {
  beforeEach(() => {
    resetSidecarCache();
  });

  it('names a filled sentence by sentence, word ids in slot order, and style', () => {
    expect(sentencePath('character', ['brave', 'dragon'], 'pixel')).toBe(
      'character/brave-dragon/pixel'
    );
    expect(sentencePath('place-time', ['sunny', 'forest', '_'], 'smooth')).toBe(
      'place-time/sunny-forest-_/smooth'
    );
    expect(variantName(0)).toBe('00');
    expect(variantName(12)).toBe('12');
  });

  it("names a frame's file by variant and, for a set, its frame", () => {
    expect(frameFileName(0, 'base', true)).toBe('00-base.png');
    expect(frameFileName(3, 'single', false)).toBe('03.png');
  });

  it('takes the first variant whose sidecar is there', async () => {
    installFetch();
    const found = await find();
    expect(found?.variant).toBe(0);
    expect(found?.characterSet).toBe(true);
    expect(found?.key).toBe('character/brave-dragon/pixel/00');
  });

  it('passes over a missing variant, and the one shown last', async () => {
    installFetch(['01', '02']);
    expect((await find())?.variant).toBe(1);
    expect((await find({avoidVariant: 1}))?.variant).toBe(2);
  });

  it('shows the only variant again rather than nothing', async () => {
    installFetch(['02']);
    expect((await find({avoidVariant: 2}))?.variant).toBe(2);
  });

  it('has nothing when no variant is there, and asks each once', async () => {
    const calls = installFetch([]);
    expect(await find()).toBeUndefined();
    expect(await find()).toBeUndefined();
    expect(calls.filter(url => url.endsWith('.json'))).toHaveLength(3);
  });

  it('has nothing for words or a style the tree lacks', async () => {
    installFetch();
    expect(await find({wordIds: ['brave', 'cat']})).toBeUndefined();
    expect(await find({style: 'smooth'})).toBeUndefined();
  });

  it("reads a frame from the variant's folder", async () => {
    const calls = installFetch();
    const found = (await find())!;
    const raw = await found.raw('base');
    expect(Array.from(raw.uint8Array)).toEqual([9, 8, 7]);
    expect(raw.mediaType).toBe('image/png');
    expect(raw.base64).toBe('CQgH');
    expect(calls).toContain(`${FOLDER}/00-base.png`);
    expect(await found.sidecar()).toEqual(SIDECAR);
  });

  it("serves a set's base as its single picture", async () => {
    installFetch();
    const raw = await (await find())!.raw('single');
    expect(Array.from(raw.uint8Array)).toEqual([9, 8, 7]);
  });

  it('reports a frame file that is not there', async () => {
    installFetch();
    const found = (await find())!;
    await expect(found.raw('walking')).rejects.toBeInstanceOf(
      ImageCacheMissError
    );
  });
});
