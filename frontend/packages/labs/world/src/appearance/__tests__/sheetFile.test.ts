// What makes an image a spritesheet, and what a bad one does.
//
// The interesting cases are all failures: a `.sheet` is a file a learner can
// open and edit, so every malformed shape it can be left in has to leave its
// image a plain picture rather than take the editor down with it.

import {describe, expect, it} from 'vitest';

import {
  parseSheetFile,
  projectSheets,
  serializeSheetFile,
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
