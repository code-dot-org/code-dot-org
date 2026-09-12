// The transport everything runs on until something can draw.
//
// What is worth pinning is what the door is built against: that it answers
// with several pictures rather than one, that it takes a moment, that
// different words give a visibly different answer without pretending to
// understand them, and that it can be called off.

import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';

import {fixtureImages} from '../fixtureImages';
import {DrawAbandoned, type GeneratedPicture} from '../imageGenerator';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Let the fixture's timer fire, and hand back what it resolved with. */
const drawn = async (
  promise: Promise<GeneratedPicture[]>,
): Promise<GeneratedPicture[]> => {
  await vi.runAllTimersAsync();
  return promise;
};

describe('the fixture pictures', () => {
  it('answers with several, not one', async () => {
    // Choosing between pictures is a different act from accepting one, and a
    // door offering a single picture makes a learner reject before they can
    // compare.
    const pictures = await drawn(
      fixtureImages().draw({prompt: 'a purple crab'}),
    );

    expect(pictures.length).toBeGreaterThan(1);
  });

  it('gives each one bytes and a short name', async () => {
    // Bytes on a URL, which is what every picture in a project already is —
    // and a name that is a word rather than the sentence somebody typed.
    const [first] = await drawn(
      fixtureImages().draw({prompt: 'a purple crab with big claws'}),
    );

    expect(first.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(first.mediaType).toBe('image/png');
    expect(first.name).toMatch(/^[a-z]+$/);
  });

  it('takes a moment, on purpose', async () => {
    // A generator that answers instantly designs a flow with no waiting state
    // in it, and waiting is most of what this flow is.
    let done = false;
    void fixtureImages()
      .draw({prompt: 'a star'})
      .then(() => (done = true));

    await vi.advanceTimersByTimeAsync(10);
    expect(done).toBe(false);
    await vi.runAllTimersAsync();
    expect(done).toBe(true);
  });

  it('answers different words differently, without claiming to read them', async () => {
    // The words pick the order and nothing else. A fixture that appeared to
    // answer them would be a demo, and the first real transport a surprise;
    // one that ignored them would make "ask again" look broken.
    const one = await drawn(fixtureImages().draw({prompt: 'a crab'}));
    const other = await drawn(fixtureImages().draw({prompt: 'a spaceship'}));

    expect(one.map(p => p.name)).not.toEqual(other.map(p => p.name));
    expect(new Set(one.map(p => p.name))).toEqual(
      new Set(other.map(p => p.name)),
    );
  });

  it('gives most pairs of words a different order, not one in four', async () => {
    // Rotating four pictures gives four orders, so a quarter of prompt pairs
    // came back identical — and demonstrating that asking again does
    // something is the whole job. A permutation gives twenty-four.
    const prompts = ['crab', 'spaceship', 'tree', 'robot', 'coin', 'ghost'];
    const orders = new Set<string>();
    for (const prompt of prompts) {
      const pictures = await drawn(fixtureImages().draw({prompt}));
      orders.add(pictures.map(one => one.name).join(','));
    }

    expect(orders.size).toBeGreaterThanOrEqual(prompts.length - 1);
  });

  it('offers fewer when fewer are asked for', async () => {
    const pictures = await drawn(
      fixtureImages().draw({prompt: 'a crab', count: 2}),
    );

    expect(pictures).toHaveLength(2);
  });

  it('can be called off', async () => {
    // A drawing takes seconds, and in that time the learner may close the
    // wizard: an answer that cannot be abandoned arrives at a door that has
    // gone.
    const stop = new AbortController();
    const drawing = fixtureImages().draw({
      prompt: 'a crab',
      signal: stop.signal,
    });
    stop.abort();

    await expect(drawing).rejects.toBeInstanceOf(DrawAbandoned);
  });

  it('is called off before it starts, when it was never wanted', async () => {
    const stop = new AbortController();
    stop.abort();

    await expect(
      fixtureImages().draw({prompt: 'a crab', signal: stop.signal}),
    ).rejects.toBeInstanceOf(DrawAbandoned);
  });

  it('says which transport it is', async () => {
    // The three are not interchangeable in the one way that matters: the dev
    // proxy runs none of the moderation a product path runs, and a page that
    // could not tell them apart could not say so.
    expect(fixtureImages().kind).toBe('fixture');
  });
});
