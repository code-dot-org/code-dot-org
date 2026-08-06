// The starter project's shape, and the one rule its ids have to keep.
//
// Codebridge allocates the next id by taking the highest integer id already in
// the project and adding one. A starter shipping an id that is not an integer
// used to poison that sum for the whole session, and two files written in a row
// then landed on the same key — the second silently replacing the first. The
// helpers no longer choke on it, but the starter is where world's ids come from,
// so this is where the contract is kept.

import {describe, expect, it} from 'vitest';

import {getNextFileId, getNextFolderId} from '@code-dot-org/codebridge';

import {DEFAULT_PROJECT, starterFile} from '../constants';

const source = DEFAULT_PROJECT.source;
const files = Object.values(source.files);
const folders = Object.values(source.folders);

/** A stringified non-negative integer, which is what an id is. */
const isId = (id: string) => /^\d+$/.test(id);

describe('the starter project', () => {
  it('numbers every file and folder', () => {
    expect(files.length).toBeGreaterThan(0);
    expect(files.map(file => file.id).filter(id => !isId(id))).toEqual([]);
    expect(folders.map(folder => folder.id).filter(id => !isId(id))).toEqual(
      [],
    );
  });

  it('keys each file and folder by its own id', () => {
    for (const [key, file] of Object.entries(source.files)) {
      expect(file.id).toBe(key);
    }
    for (const [key, folder] of Object.entries(source.folders)) {
      expect(folder.id).toBe(key);
    }
  });

  it('leaves the id helpers able to allocate', () => {
    // The bug this file exists for: both of these were the string "NaN".
    expect(isId(getNextFileId(files))).toBe(true);
    expect(isId(getNextFolderId(folders))).toBe(true);
    expect(source.files[getNextFileId(files)]).toBeUndefined();
    expect(source.folders[getNextFolderId(folders)]).toBeUndefined();
  });

  it('puts every file in a folder the project has', () => {
    for (const file of files) {
      expect(source.folders[file.folderId]).toBeDefined();
    }
  });

  it('opens files it holds, and activates one of them', () => {
    for (const id of source.openFiles ?? []) {
      expect(source.files[id]).toBeDefined();
    }
    const active = files.filter(file => file.active);
    expect(active).toHaveLength(1);
    expect(source.openFiles).toContain(active[0].id);
    expect(active[0].name).toBe('main.world');
  });
});

describe('starterFile', () => {
  it('finds a file by the name it is written under', () => {
    expect(starterFile('main').name).toBe('main.world');
    expect(starterFile('gravityRule').name).toBe('gravity.rule');
    expect(starterFile('sprite-coin').name).toBe('coin.png');
  });

  it('throws on a name the starter does not have', () => {
    // A typo in a test should say so, not read as an empty file.
    expect(() => starterFile('nope')).toThrow(/no starter file/);
  });
});
