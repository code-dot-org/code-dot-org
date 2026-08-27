// Where progress is kept while it is kept here at all.
//
// specs/PROGRESSION_UI.md is explicit that `localStorage` is temporary, which
// is exactly why it needs a test: the temporary thing is the one that survives,
// and the failure modes are all silent — a private-mode browser that throws on
// write, a half-written value, a set written against a catalogue that has since
// been renumbered.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {
  CATALOGUE_VERSION,
  clearProgress,
  loadProgress,
  saveProgress,
} from '../progressStore';

const KEY = 'world-lab.progression';

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('progress', () => {
  it('starts empty', () => {
    expect([...loadProgress()]).toEqual([]);
  });

  it('comes back', () => {
    saveProgress(new Set(['origin/first-world', 'motion/speed']));
    expect([...loadProgress()].sort()).toEqual([
      'motion/speed',
      'origin/first-world',
    ]);
  });

  it('is forgettable', () => {
    saveProgress(new Set(['origin/first-world']));
    clearProgress();
    expect([...loadProgress()]).toEqual([]);
  });

  // The migration rule in specs/PROGRESSION.md made enforceable: a set written
  // against a catalogue whose ids have since moved is dropped, not half-read.
  it('is dropped when it was written against another catalogue', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({version: CATALOGUE_VERSION + 1, completed: ['a', 'b']}),
    );
    expect([...loadProgress()]).toEqual([]);
  });

  it('survives rubbish in the slot', () => {
    window.localStorage.setItem(KEY, 'not json at all');
    expect([...loadProgress()]).toEqual([]);
  });

  it('survives a storage that refuses', () => {
    // Private browsing, or a full quota. Losing the tree is bad; failing to
    // open the lab over it would be worse.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveProgress(new Set(['origin/first-world']))).not.toThrow();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect([...loadProgress()]).toEqual([]);
  });
});
