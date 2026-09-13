// Which of the three draws, and the one case that matters most.
//
// Falling back to the fixture where there is no dev server would put four
// canned pictures in front of a student as though something had drawn them.
// This lab runs inside the dashboard as well as in its own harness, so the
// difference between "a harness with no key" and "not a harness" is the whole
// of what this decides.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {chooseImageGenerator} from '../chooseImageGenerator';

const fetching = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetching);
  fetching.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

describe('choosing what draws', () => {
  it('draws for real when the dev server has a key', async () => {
    fetching.mockResolvedValue({
      ok: true,
      json: async () => ({available: true, model: 'gpt-image-1'}),
    });

    const chosen = await chooseImageGenerator();

    expect(chosen.generator?.kind).toBe('direct');
    expect(chosen.model).toBe('gpt-image-1');
  });

  it('falls back to the fixture in a harness with no key', async () => {
    // The flow is still worth walking, and the developer is told why.
    fetching.mockResolvedValue({
      ok: true,
      json: async () => ({
        available: false,
        reason: 'OPENAI_API_KEY is not set',
      }),
    });

    const chosen = await chooseImageGenerator();

    expect(chosen.generator?.kind).toBe('fixture');
    expect(chosen.reason).toMatch(/OPENAI_API_KEY/);
  });

  it('offers NOTHING where there is no dev server', async () => {
    // The case this exists for. A `/__images/status` served by nobody means
    // the lab is running somewhere else — and canned pictures offered there
    // would be a lie rather than a stand-in.
    fetching.mockRejectedValue(new Error('Failed to fetch'));

    const chosen = await chooseImageGenerator();

    expect(chosen.generator).toBeUndefined();
    expect(chosen.reason).toBe('no drawing service here');
  });
});
