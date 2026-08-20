import {describe, expect, it} from 'vitest';

import {usableVersionId} from '../projectPersistence';

describe('Build Lab source version handling', () => {
  it('does not send the local placeholder version back as a replacement', () => {
    expect(usableVersionId('unknown')).toBeUndefined();
    expect(usableVersionId(undefined)).toBeUndefined();
    expect(usableVersionId('version-1')).toBe('version-1');
  });
});
