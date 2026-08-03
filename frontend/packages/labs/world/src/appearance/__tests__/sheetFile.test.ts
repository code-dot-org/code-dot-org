// What makes an image a spritesheet, and what a bad one does.
//
// The interesting cases are all failures: a `.sheet` is a file a learner can
// open and edit, so every malformed shape it can be left in has to leave its
// image a plain picture rather than take the editor down with it.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  parseSheetFile,
  projectSheets,
  serializeSheetFile,
  setImageSheet,
  sheetFileName,
  type SheetFile,
} from '../sheetFile';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

describe('sheet files', () => {
  it('names itself after the image it describes', () => {
    expect(sheetFileName('coinSpin.png')).toBe('coinSpin.sheet');
    expect(sheetFileName('coin.spin.png')).toBe('coin.spin.sheet');
    // An image whose name has no extension at all is still an image.
    expect(sheetFileName('coinSpin')).toBe('coinSpin.sheet');
  });

  it('reads back what it writes', () => {
    expect(parseSheetFile(serializeSheetFile(SHEET))).toEqual(SHEET);
  });

  it('treats anything malformed as no sheet at all', () => {
    for (const bad of [
      '',
      'not json',
      '{}',
      '[]',
      'null',
      '{"type": "animation", "cell": {"width": 32, "height": 32}}',
      '{"type": "sheet"}',
      '{"type": "sheet", "cell": null}',
      '{"type": "sheet", "cell": {"width": 32}}',
      '{"type": "sheet", "cell": {"width": "32", "height": "32"}}',
      '{"type": "sheet", "cell": {"width": 0, "height": 32}}',
      '{"type": "sheet", "cell": {"width": -32, "height": 32}}',
    ]) {
      expect(parseSheetFile(bad), bad).toBeUndefined();
    }
  });

  describe('a project', () => {
    it('reports its sheets by the image each one describes', () => {
      expect(
        projectSheets({
          'sprites/coinSpin.png': '',
          'sprites/coinSpin.sheet': serializeSheetFile(SHEET),
          'sprites/player.png': '',
          'worlds/main.world': '{}',
        }),
      ).toEqual({'coinSpin.png': SHEET});
    });

    it('leaves an image whose sheet is broken a plain picture', () => {
      expect(
        projectSheets({'sprites/coinSpin.sheet': '{"type": "sheet"}'}),
      ).toEqual({});
    });
  });
});

describe('setImageSheet', () => {
  /** A project holding one image, and whatever else is given. */
  const project = (
    extra: Record<
      string,
      {name: string; contents?: string; folderId?: string}
    > = {},
  ): MultiFileSource => ({
    files: {
      img: {
        id: 'img',
        name: 'coinSpin.png',
        language: 'png',
        contents: '',
        folderId: 'sprites',
        url: 'data:image/png;base64,AAA',
      },
      ...Object.fromEntries(
        Object.entries(extra).map(([id, file]) => [
          id,
          {
            id,
            language: 'json',
            contents: '',
            folderId: 'sprites',
            ...file,
          },
        ]),
      ),
    },
    folders: {sprites: {id: 'sprites', name: 'sprites', parentId: '0'}},
    openFiles: [],
  });

  const sheetOf = (source: MultiFileSource) =>
    Object.values(source.files).find(file => file.name === 'coinSpin.sheet');

  it('writes the sheet beside its image', () => {
    const after = setImageSheet(project(), 'img', SHEET);

    const written = sheetOf(after);
    expect(written?.folderId).toBe('sprites');
    expect(parseSheetFile(written?.contents ?? '')).toEqual(SHEET);
  });

  it('replaces one that is already there', () => {
    const before = project({
      sheet: {name: 'coinSpin.sheet', contents: serializeSheetFile(SHEET)},
    });

    const after = setImageSheet(before, 'img', {
      type: 'sheet',
      cell: {width: 16, height: 16},
    });

    expect(Object.keys(after.files)).toHaveLength(2);
    expect(parseSheetFile(sheetOf(after)?.contents ?? '')).toEqual({
      type: 'sheet',
      cell: {width: 16, height: 16},
    });
  });

  it('removes it when there is no grid any more', () => {
    const before = project({
      sheet: {name: 'coinSpin.sheet', contents: serializeSheetFile(SHEET)},
    });

    const after = setImageSheet(before, 'img', undefined);

    expect(sheetOf(after)).toBeUndefined();
    expect(after.files.img).toBeDefined();
  });

  it('changes nothing when it already says this', () => {
    // The caller writes the sources; an unchanged write is a recompile.
    const before = project({
      sheet: {name: 'coinSpin.sheet', contents: serializeSheetFile(SHEET)},
    });

    expect(setImageSheet(before, 'img', SHEET)).toBe(before);
    expect(setImageSheet(project(), 'img', undefined)).toEqual(project());
  });

  it('leaves a sheet of the same name in another folder alone', () => {
    // Beside the image means beside THIS image.
    const before = project({
      other: {
        name: 'coinSpin.sheet',
        contents: serializeSheetFile(SHEET),
        folderId: 'elsewhere',
      },
    });

    const after = setImageSheet(before, 'img', {
      type: 'sheet',
      cell: {width: 8, height: 8},
    });

    expect(after.files.other.contents).toBe(serializeSheetFile(SHEET));
    expect(Object.keys(after.files)).toHaveLength(3);
  });

  it('does nothing for a file that is not there', () => {
    const before = project();
    expect(setImageSheet(before, 'nope', SHEET)).toBe(before);
  });
});
