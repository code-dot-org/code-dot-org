import {describe, expect, it} from 'vitest';

import {getLabEntrypointByAppName} from '../getLabEntrypointByAppName';

describe('getLabEntrypointByAppName', () => {
  it('resolves "fish" to a lazy component', () => {
    const entry = getLabEntrypointByAppName('fish');
    expect(entry).toBeDefined();
  });

  it('resolves "standalone_video" to a lazy component', () => {
    const entry = getLabEntrypointByAppName('standalone_video');
    expect(entry).toBeDefined();
  });

  it('returns undefined for unrecognized appName', () => {
    expect(getLabEntrypointByAppName('unknown_app')).toBeUndefined();
  });
});
