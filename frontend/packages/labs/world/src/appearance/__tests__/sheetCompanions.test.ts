// A `.sheet` goes where its `.png` goes.
//
// The learner cannot see the sheet, let alone drag it — so every case here is
// one they would otherwise have no way to put right.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {followImages} from '../sheetCompanions';
import {serializeSheetFile, type SheetFile} from '../sheetFile';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

/** A project with `coinSpin.png` + `coinSpin.sheet` in `sprites/`. */
const project = (): MultiFileSource => ({
  files: {
    img: {
      id: 'img',
      name: 'coinSpin.png',
      language: 'png',
      contents: '',
      folderId: 'sprites',
      url: 'data:image/png;base64,AAA',
    },
    sheet: {
      id: 'sheet',
      name: 'coinSpin.sheet',
      language: 'json',
      contents: serializeSheetFile(SHEET),
      folderId: 'sprites',
    },
    other: {
      id: 'other',
      name: 'player.png',
      language: 'png',
      contents: '',
      folderId: 'sprites',
      url: 'data:image/png;base64,BBB',
    },
  },
  folders: {
    sprites: {id: 'sprites', name: 'sprites', parentId: '0'},
    art: {id: 'art', name: 'art', parentId: '0'},
  },
  openFiles: [],
});

/** The same project with one file changed or removed. */
const edited = (
  before: MultiFileSource,
  id: string,
  change: Partial<MultiFileSource['files'][string]> | null,
): MultiFileSource => {
  const files = {...before.files};
  if (change === null) {
    delete files[id];
  } else {
    files[id] = {...files[id], ...change};
  }
  return {...before, files};
};

const sheetOf = (source: MultiFileSource) => source.files.sheet;

describe('followImages', () => {
  it('moves the sheet with the image', () => {
    const before = project();

    const after = followImages(
      edited(before, 'img', {folderId: 'art'}),
      before,
    );

    expect(sheetOf(after).folderId).toBe('art');
    expect(sheetOf(after).name).toBe('coinSpin.sheet');
  });

  it('renames the sheet with the image', () => {
    const before = project();

    const after = followImages(
      edited(before, 'img', {name: 'spin.png'}),
      before,
    );

    expect(sheetOf(after).name).toBe('spin.sheet');
    expect(sheetOf(after).folderId).toBe('sprites');
    // Its contents are untouched: the grid did not change, only the name.
    expect(sheetOf(after).contents).toBe(serializeSheetFile(SHEET));
  });

  it('follows a rename and a move at once', () => {
    const before = project();

    const after = followImages(
      edited(before, 'img', {name: 'spin.png', folderId: 'art'}),
      before,
    );

    expect(sheetOf(after).name).toBe('spin.sheet');
    expect(sheetOf(after).folderId).toBe('art');
  });

  it('deletes the sheet when the image is deleted', () => {
    const before = project();

    const after = followImages(edited(before, 'img', null), before);

    expect(after.files.sheet).toBeUndefined();
    // Nothing else went with it.
    expect(after.files.other).toBeDefined();
  });

  it('leaves an image with no sheet alone', () => {
    const before = project();
    const next = edited(before, 'other', {folderId: 'art'});

    expect(followImages(next, before)).toBe(next);
  });

  it('changes nothing when nothing moved', () => {
    const before = project();
    const next = edited(before, 'other', {contents: 'x'});

    expect(followImages(next, before)).toBe(next);
  });

  it('replaces a leftover sheet at the destination', () => {
    // Only reachable if a stale sheet outlived its image; two images cannot
    // share a name in one folder, so this can never be somebody else's.
    const before: MultiFileSource = {
      ...project(),
      files: {
        ...project().files,
        stale: {
          id: 'stale',
          name: 'spin.sheet',
          language: 'json',
          contents: '{}',
          folderId: 'sprites',
        },
      },
    };

    const after = followImages(
      edited(before, 'img', {name: 'spin.png'}),
      before,
    );

    expect(after.files.stale).toBeUndefined();
    expect(sheetOf(after).name).toBe('spin.sheet');
    expect(sheetOf(after).contents).toBe(serializeSheetFile(SHEET));
  });

  it('does not mistake a sheet for an image', () => {
    // `.sheet` files are not `.png`s, so nothing here recurses on them.
    const before = project();
    const next = edited(before, 'sheet', {folderId: 'art'});

    expect(followImages(next, before)).toBe(next);
  });
});
