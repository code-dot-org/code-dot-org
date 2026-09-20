// Where progress is kept while it is kept here at all.
//
// specs/PROGRESSION_UI.md is explicit that `localStorage` is temporary, which
// is exactly why it needs a test: the temporary thing is the one that survives,
// and the failure modes are all silent — a private-mode browser that throws on
// write, a half-written value, a set written against a catalogue that has since
// been renumbered.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {WORLD_CATALOGUE} from '../catalogues';
import {clearProgress, loadProgress, saveProgress} from '../progressStore';
import type {Catalogue} from '../types';

const WORLD = WORLD_CATALOGUE;
const CATALOGUE_VERSION = WORLD.version;
const KEY = `world-lab.progression.${WORLD.id}`;

/** A second tree, to show the two do not share a key. */
const APPS: Catalogue = {id: 'apps', name: 'Apps', version: 1, tiles: []};

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('two trees', () => {
  it('keep their progress apart', () => {
    // The reason the store takes a catalogue at all: a lesson finished on one
    // tree is not a lesson finished on the other (specs/APPS.md).
    saveProgress(WORLD, new Set(['place/first']));
    saveProgress(APPS, new Set(['app/first']));

    expect([...loadProgress(WORLD)]).toEqual(['place/first']);
    expect([...loadProgress(APPS)]).toEqual(['app/first']);
  });

  it('are forgotten one at a time', () => {
    saveProgress(WORLD, new Set(['place/first']));
    saveProgress(APPS, new Set(['app/first']));

    clearProgress(APPS);
    expect([...loadProgress(WORLD)]).toEqual(['place/first']);
    expect([...loadProgress(APPS)]).toEqual([]);
  });

  it('do not invalidate each other when one is renumbered', () => {
    // Each tree's version is its own. A tile renamed on the app tree must not
    // drop what somebody finished on the world tree.
    saveProgress(WORLD, new Set(['place/first']));
    const renumbered: Catalogue = {...APPS, version: APPS.version + 1};
    saveProgress(APPS, new Set(['app/first']));

    expect([...loadProgress(renumbered)]).toEqual([]);
    expect([...loadProgress(WORLD)]).toEqual(['place/first']);
  });
});

describe('progress', () => {
  it('starts empty', () => {
    expect([...loadProgress(WORLD)]).toEqual([]);
  });

  it('comes back', () => {
    saveProgress(WORLD, new Set(['origin/first-world', 'motion/speed']));
    expect([...loadProgress(WORLD)].sort()).toEqual([
      'motion/speed',
      'origin/first-world',
    ]);
  });

  it('is forgettable', () => {
    saveProgress(WORLD, new Set(['origin/first-world']));
    clearProgress(WORLD);
    expect([...loadProgress(WORLD)]).toEqual([]);
  });

  // The migration rule in specs/PROGRESSION.md made enforceable: a set written
  // against a catalogue whose ids have since moved is dropped, not half-read.
  it('is dropped when it was written against another catalogue', () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({version: CATALOGUE_VERSION + 1, completed: ['a', 'b']}),
    );
    expect([...loadProgress(WORLD)]).toEqual([]);
  });

  it('survives rubbish in the slot', () => {
    window.localStorage.setItem(KEY, 'not json at all');
    expect([...loadProgress(WORLD)]).toEqual([]);
  });

  it('survives a storage that refuses', () => {
    // Private browsing, or a full quota. Losing the tree is bad; failing to
    // open the lab over it would be worse.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() =>
      saveProgress(WORLD, new Set(['origin/first-world'])),
    ).not.toThrow();

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect([...loadProgress(WORLD)]).toEqual([]);
  });
});
