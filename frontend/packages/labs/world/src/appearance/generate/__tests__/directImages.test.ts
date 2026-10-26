// Drawing through the dev server, from the browser's side of the wire.
//
// What is worth pinning is the reading rather than the HTTP: that a proxy that
// is not there is told apart from one with nothing behind it, that a refusal
// arrives as words rather than as an empty tray, that an abandoned drawing is
// not reported as a failure, and that four pictures of one prompt get four
// names.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  directImages,
  imageProxyStatus,
  stemFor,
  DrawRefused,
} from '../directImages';
import {DrawAbandoned} from '../imageGenerator';

const fetching = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetching);
  fetching.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

/** An answer from the proxy. */
const answers = (body: unknown, ok = true) =>
  fetching.mockResolvedValue({ok, json: async () => body});

describe('asking whether anything is there', () => {
  it('tells a dev server with no key from no dev server at all', async () => {
    // The difference decides whether the fixture is offered or the door is
    // not: one is a harness with nothing behind it, the other is this lab
    // running somewhere that serves no such route.
    answers({available: false, reason: 'OPENAI_API_KEY is not set'});
    expect(await imageProxyStatus()).toMatchObject({available: false});

    fetching.mockRejectedValue(new Error('Failed to fetch'));
    expect(await imageProxyStatus()).toBeUndefined();

    fetching.mockResolvedValue({ok: false, json: async () => ({})});
    expect(await imageProxyStatus()).toBeUndefined();
  });
});

describe('drawing through the proxy', () => {
  it('turns what came back into pictures the project can hold', async () => {
    answers({
      pictures: [
        {base64: 'AAAA', mediaType: 'image/png'},
        {base64: 'BBBB', mediaType: 'image/png'},
      ],
    });

    const pictures = await directImages().draw({prompt: 'a purple crab'});

    expect(pictures[0].dataUrl).toBe('data:image/png;base64,AAAA');
    // Named from the words, numbered from the second — the shape the project's
    // own naming already uses when a name is taken.
    expect(pictures.map(one => one.name)).toEqual([
      'purpleCrab',
      'purpleCrab2',
    ]);
  });

  it('says what the proxy said when it could not draw', async () => {
    // Words the wizard can show. What the provider actually said went to the
    // terminal, where the developer who owns the key is looking.
    answers({pictures: [], failure: 'The drawing service refused the key.'});

    await expect(
      directImages().draw({prompt: 'a crab'}),
    ).rejects.toBeInstanceOf(DrawRefused);
  });

  it('reads an abandoned drawing as abandoned, not as a failure', async () => {
    // A learner who closed the wizard has not been refused, and a door that
    // reported it as one would be complaining about the learner.
    const stop = new AbortController();
    fetching.mockImplementation(() => {
      stop.abort();
      return Promise.reject(new Error('The operation was aborted.'));
    });

    await expect(
      directImages().draw({prompt: 'a crab', signal: stop.signal}),
    ).rejects.toBeInstanceOf(DrawAbandoned);
  });

  it('says which transport it is', () => {
    // It reaches a developer's own key and runs none of the moderation a
    // product path would; a page that could not tell could not say so.
    expect(directImages().kind).toBe('direct');
  });
});

describe('naming a picture from the words', () => {
  it('takes two words and drops the ones every prompt has', () => {
    expect(stemFor('a purple crab with big claws')).toBe('purpleCrab');
    expect(stemFor('THE Green Sprout')).toBe('greenSprout');
  });

  it('still answers for words that are all articles', () => {
    expect(stemFor('the a of')).toBe('picture');
    expect(stemFor('!!!')).toBe('picture');
  });
});
