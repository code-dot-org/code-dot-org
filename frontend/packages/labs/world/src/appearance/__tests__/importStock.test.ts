// Copying a stock sprite or animation into a project.
//
// What matters is that the project ends up able to DRAW the thing: the image is
// there as bytes, a grid arrives with the `.sheet` that says it is one, and an
// animation brings the images its frames name. Any of those missing leaves a
// picker row that imports something broken — visible only when a game runs.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {addedFiles} from '../ImportAppearanceDialog';
import {importStockAnimation, importStockSprite} from '../importStock';
import {parseSheetFile} from '../sheetFile';
import {
  spriteFileName,
  stockAnimation,
  stockSprite,
  STOCK_ANIMATIONS,
  STOCK_CELL,
  STOCK_SPRITES,
} from '../stock';

const coinSpin = stockSprite('coinSpin')!;
const player = stockSprite('player')!;

/** An empty project — neither `sprites/` nor `animations/` exists yet. */
const project = (): MultiFileSource => ({
  files: {},
  folders: {},
  openFiles: [],
});

/** Files by name, for asking what a project holds. */
const byName = (source: MultiFileSource) =>
  Object.fromEntries(
    Object.values(source.files).map(file => [file.name, file]),
  );

/** The name of the folder a file sits in. */
const folderOf = (source: MultiFileSource, fileName: string) =>
  source.folders[byName(source)[fileName].folderId]?.name;

describe('importStockSprite', () => {
  it('writes the image as bytes, in sprites/', () => {
    const {source, value} = importStockSprite(project(), player);

    expect(value).toBe('player.png');
    const file = byName(source)['player.png'];
    expect(file.url).toBe(player.dataUrl);
    expect(file.mimeType).toBe('image/png');
    expect(folderOf(source, 'player.png')).toBe('sprites');
  });

  it('brings the .sheet that makes a grid a grid', () => {
    const {source} = importStockSprite(project(), coinSpin);

    const sheet = byName(source)['coinSpin.sheet'];
    expect(folderOf(source, 'coinSpin.sheet')).toBe('sprites');
    expect(parseSheetFile(sheet.contents)).toEqual({
      type: 'sheet',
      cell: {width: STOCK_CELL, height: STOCK_CELL},
    });
  });

  it('writes no sheet for a picture', () => {
    const {source} = importStockSprite(project(), player);

    expect(byName(source)['player.sheet']).toBeUndefined();
  });

  it('leaves an image the project already has alone', () => {
    const once = importStockSprite(project(), coinSpin).source;
    const painted: MultiFileSource = {
      ...once,
      files: Object.fromEntries(
        Object.entries(once.files).map(([id, file]) => [
          id,
          file.name === 'coinSpin.png' ? {...file, url: 'data:painted'} : file,
        ]),
      ),
    };

    const {source} = importStockSprite(painted, coinSpin);

    expect(Object.keys(source.files)).toHaveLength(
      Object.keys(painted.files).length,
    );
    expect(byName(source)['coinSpin.png'].url).toBe('data:painted');
  });
});

describe('importStockAnimation', () => {
  it('brings the images its frames name, and their sheets', () => {
    const {source, value} = importStockAnimation(
      project(),
      stockAnimation('coinSpin')!,
    );

    expect(value).toBe('coinSpin');
    const files = byName(source);
    expect(files['coinSpin.anim']).toBeDefined();
    expect(folderOf(source, 'coinSpin.anim')).toBe('animations');
    expect(files['coinSpin.png'].url).toBe(coinSpin.dataUrl);
    expect(files['coinSpin.sheet']).toBeDefined();
  });

  it('names the animation inside the file, not the file', () => {
    // "switch.anim" holds an animation called "switchFlip"; a `play animation`
    // block stores what the runtime looks up, which is the latter.
    const {value} = importStockAnimation(project(), stockAnimation('switch')!);

    expect(value).toBe('switchFlip');
  });

  it('writes frames that reference the files it wrote', () => {
    const animation = stockAnimation('playerWalk')!;
    const {source} = importStockAnimation(project(), animation);

    const named = new Set(
      Object.values(
        JSON.parse(byName(source)['playerWalk.anim'].contents)
          .animations as Record<string, {frames: {sprite: string}[]}>,
      ).flatMap(def => def.frames.map(frame => frame.sprite)),
    );
    for (const sprite of named) {
      expect(byName(source)[sprite], sprite).toBeDefined();
    }
    expect(named).toContain(spriteFileName('playerWalk'));
  });
});

describe('the picker\'s "Adds:" line', () => {
  // It is a promise about what a click is going to do to the project, made in
  // one file and kept in another. Left to drift, it is worse than saying
  // nothing — a learner reads it to decide whether to click.
  it('names exactly the files an import writes', () => {
    for (const sprite of STOCK_SPRITES) {
      const {source} = importStockSprite(project(), sprite);
      expect(addedFiles(sprite).sort(), sprite.id).toEqual(
        Object.values(source.files)
          .map(file => file.name)
          .sort(),
      );
    }
    for (const animation of STOCK_ANIMATIONS) {
      const {source} = importStockAnimation(project(), animation);
      expect(addedFiles(animation).sort(), animation.id).toEqual(
        Object.values(source.files)
          .map(file => file.name)
          .sort(),
      );
    }
  });
});
