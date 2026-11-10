import {describe, expect, it, vi} from 'vitest';

import type {Transport} from '../../../transports/types';
import {createImagesApi, imageModerationVerdict} from '../images.api';

const analysis = (severities: Record<string, number>) => ({
  categoriesAnalysis: Object.entries(severities).map(
    ([category, severity]) => ({
      category: category as 'Hate',
      severity,
    }),
  ),
});

describe('imageModerationVerdict', () => {
  it('flags a category at its threshold', () => {
    expect(imageModerationVerdict(analysis({Hate: 0, Violence: 2}))).toBe(
      'safe',
    );
    expect(imageModerationVerdict(analysis({Violence: 4}))).toBe('flagged');
    expect(imageModerationVerdict(analysis({Sexual: 2}))).toBe('flagged');
  });

  it('takes thresholds of the caller', () => {
    expect(imageModerationVerdict(analysis({Violence: 2}), {Violence: 2})).toBe(
      'flagged',
    );
  });

  it('flags an image with no analysis', () => {
    expect(imageModerationVerdict(null)).toBe('flagged');
    expect(imageModerationVerdict({})).toBe('flagged');
  });
});

describe('createImagesApi', () => {
  const transport = (reply: unknown) =>
    ({
      request: vi.fn().mockResolvedValue(reply),
      requestBlob: vi.fn(),
      requestWithMeta: vi.fn(),
    }) satisfies Transport;

  it("POSTs the image's bytes", async () => {
    const t = transport(analysis({Hate: 0}));
    const image = new Blob(['png'], {type: 'image/png'});
    await createImagesApi(t).moderate({image});
    expect(t.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/v3/images/moderate',
      headers: {'Content-Type': 'image/png'},
      body: image,
    });
  });

  it('rejects an empty result', async () => {
    await expect(
      createImagesApi(transport(null)).moderate({image: new Blob(['x'])}),
    ).rejects.toThrow();
  });
});
