// Copying a backdrop into the project.
//
// The folder is the whole of what makes an image a backdrop (BACKGROUNDS.md
// §5), so where this writes IS the feature — an import that landed in
// `sprites/` would produce a file the background dropdown cannot see and the
// sprite dropdown should never have offered.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockBackground} from '../importStock';
import {sheetFileName} from '../sheetFile';

const BYTES = 'data:image/png;base64,iVBORw0KGgo=';

const empty = (): MultiFileSource => ({files: {}, folders: {}, openFiles: []});

/** `folder/name` for every file, which is what the dropdowns key on. */
const paths = (source: MultiFileSource): string[] =>
  Object.values(source.files).map(file => {
    const folder = source.folders[file.folderId];
    return folder ? `${folder.name}/${file.name}` : file.name;
  });

describe('importStockBackground', () => {
  it('writes one file, under backgrounds/', () => {
    const {source, value} = importStockBackground(empty(), {id: 'cave'}, BYTES);

    expect(paths(source)).toEqual(['backgrounds/cave.png']);
    // The value is what the block stores and what the engine is told.
    expect(value).toBe('cave.png');
    expect(Object.values(source.files)[0]).toMatchObject({
      name: 'cave.png',
      url: BYTES,
      mimeType: 'image/png',
    });
  });

  it('never writes a .sheet beside one', () => {
    // A backdrop is stretched over the viewport, so a grid of one means
    // nothing — and a `.sheet` saying otherwise is a lie the animation editor
    // would believe.
    const {source} = importStockBackground(empty(), {id: 'cave'}, BYTES);

    expect(paths(source)).not.toContain(
      `backgrounds/${sheetFileName('cave.png')}`,
    );
  });

  it('makes the folder when the project has none', () => {
    const {source} = importStockBackground(empty(), {id: 'city'}, BYTES);

    expect(Object.values(source.folders).map(folder => folder.name)).toEqual([
      'backgrounds',
    ]);
  });

  it('reuses the folder rather than making a second', () => {
    const first = importStockBackground(empty(), {id: 'cave'}, BYTES).source;
    const {source} = importStockBackground(first, {id: 'city'}, BYTES);

    expect(Object.values(source.folders)).toHaveLength(1);
    expect(paths(source).sort()).toEqual([
      'backgrounds/cave.png',
      'backgrounds/city.png',
    ]);
  });

  it('leaves the project it was given alone', () => {
    // A pure transform, like its neighbours: the caller decides when the new
    // project becomes the current one.
    const before = empty();
    importStockBackground(before, {id: 'cave'}, BYTES);

    expect(Object.keys(before.files)).toEqual([]);
  });
});
