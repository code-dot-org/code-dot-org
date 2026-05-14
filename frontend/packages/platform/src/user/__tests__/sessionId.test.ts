/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {getTabId} from '../sessionId';

describe('getTabId', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the existing tabId when one is already stored', () => {
    sessionStorage.setItem('tabId', '0.42');
    expect(getTabId()).toBe('0.42');
  });

  it('mints and stores a new tabId when sessionStorage is empty', () => {
    // First call mints. The implementation reads back from sessionStorage
    // before returning, so we should see the same value the second time.
    const first = getTabId();
    expect(typeof first).toBe('string');
    expect(first).not.toBe(false);
    expect(sessionStorage.getItem('tabId')).toBe(first);

    const second = getTabId();
    expect(second).toBe(first);
  });

  it('returns false when quota is exceeded on the mint write', () => {
    // tryGetSessionStorage returns false (the default) when nothing is
    // stored. trySetSessionStorage swallows QuotaExceededError, and the
    // second tryGetSessionStorage still finds no entry and returns the
    // default. So getTabId returns false — the documented fallback.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('quota');
      err.name = 'QuotaExceededError';
      throw err;
    });
    expect(getTabId()).toBe(false);
  });

  it('rethrows non-quota set errors (only QuotaExceededError is swallowed)', () => {
    // tryGetSessionStorage catches everything, but trySetSessionStorage
    // only swallows QuotaExceededError — any other Error is rethrown so
    // genuine bugs are visible.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('unexpected');
    });
    expect(() => getTabId()).toThrow('unexpected');
  });
});
