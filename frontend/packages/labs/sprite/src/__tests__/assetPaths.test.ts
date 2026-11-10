import {describe, expect, it} from 'vitest';

import {mediaUrl} from '../assetPaths';

describe('mediaUrl', () => {
  it('proxies an absolute URL on another host', () => {
    expect(mediaUrl('https://example.com/a b.png')).toBe(
      `//${window.location.host}/media?u=${encodeURIComponent('https://example.com/a%20b.png')}`,
    );
  });

  it('leaves relative URLs and CORS-open hosts alone', () => {
    expect(mediaUrl('/api/v1/sound-library/a.mp3')).toBe(
      '/api/v1/sound-library/a.mp3',
    );
    expect(mediaUrl('https://curriculum.code.org/a.png')).toBe(
      'https://curriculum.code.org/a.png',
    );
  });
});
