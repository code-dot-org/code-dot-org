import {describe, expect, it} from 'vitest';

import {progressKeys} from '../progress.keys';

describe('progressKeys.userProgress', () => {
  it('builds a key under the shared `progress` root', () => {
    const key = progressKeys.userProgress('csd-1');
    // Verify the key is rooted at the shared family namespace —
    // important for `invalidateQueries({queryKey: progressKeys.all})`
    // sweeps to actually hit every entry.
    expect(key[0]).toBe('progress');
    expect(key[1]).toBe('userProgress');
    expect(key[2]).toBe('csd-1');
  });

  it('includes userId as a separate segment when provided', () => {
    const key = progressKeys.userProgress('csd-1', '42');
    expect(key).toEqual(['progress', 'userProgress', 'csd-1', '42']);
  });

  it('uses undefined in the userId slot when omitted', () => {
    // Same slot, different values — current-user and teacher-view-as
    // entries for the same script must not collide.
    const own = progressKeys.userProgress('csd-1');
    const viewAs = progressKeys.userProgress('csd-1', '42');
    expect(own).not.toEqual(viewAs);
  });

  it('different scriptNames produce different keys', () => {
    expect(progressKeys.userProgress('a')).not.toEqual(
      progressKeys.userProgress('b'),
    );
  });
});

describe('progressKeys.all', () => {
  it('is a prefix of every userProgress key (enables family invalidation)', () => {
    const key = progressKeys.userProgress('csd-1', '42');
    expect(key.slice(0, progressKeys.all.length)).toEqual(
      Array.from(progressKeys.all),
    );
  });
});
