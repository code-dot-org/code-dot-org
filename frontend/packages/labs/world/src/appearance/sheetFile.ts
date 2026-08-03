// What makes an image a spritesheet.
//
// Nothing about a PNG says "I am six frames in a row" — it is a picture, and how
// it should be cut up is a decision someone made. So the decision is a file: a
// `.sheet` beside the image, with the same stem, saying how big a cell is.
// `coinSpin.png` + `coinSpin.sheet` is a spritesheet; `player.png` on its own is
// a picture.
//
// Only the editors read it. The runtime never does: a frame carries
// the rectangle it draws, so by the time an animation is playing, the grid has
// already done its job. That is why the metadata can live beside the image
// instead of inside it — and why a learner can change it without breaking
// animations that were already written against it.

import {getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

/** The on-disk shape of a `.sheet` file. */
export interface SheetFile {
  type: 'sheet';
  /** The size of one cell, in pixels. The grid is read left to right, top down. */
  cell: {width: number; height: number};
}

/** The `.sheet` for an image file name — `coinSpin.png` → `coinSpin.sheet`. */
export function sheetFileName(imageName: string): string {
  return `${imageName.replace(/\.[^.]+$/, '')}.sheet`;
}

/** Write one, the way an import does. */
export function serializeSheetFile(sheet: SheetFile): string {
  return `${JSON.stringify(sheet, null, 2)}\n`;
}

/**
 * Read one, or undefined if it is not a sheet file.
 *
 * Undefined rather than a throw: a malformed `.sheet` should leave its image a
 * plain picture — an editor that refused to open would be a worse answer than
 * one that offers no grid.
 */
export function parseSheetFile(contents: string): SheetFile | undefined {
  try {
    const parsed: unknown = JSON.parse(contents);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as {type?: unknown}).type !== 'sheet'
    ) {
      return undefined;
    }
    const cell = (parsed as {cell?: unknown}).cell;
    if (typeof cell !== 'object' || cell === null) {
      return undefined;
    }
    const {width, height} = cell as {width?: unknown; height?: unknown};
    if (
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      !(width > 0) ||
      !(height > 0)
    ) {
      return undefined;
    }
    return {type: 'sheet', cell: {width, height}};
  } catch {
    return undefined;
  }
}

/**
 * The sheets a project declares, by IMAGE file name (`coinSpin.png`).
 *
 * Keyed by the image rather than the `.sheet` because every question anyone asks
 * starts from a picture: "is this one a grid, and how big are its cells?".
 */
export function projectSheets(
  files: Record<string, string>,
): Record<string, SheetFile> {
  const sheets: Record<string, SheetFile> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.sheet')) {
      continue;
    }
    const sheet = parseSheetFile(contents);
    if (sheet) {
      const stem = (path.split('/').pop() as string).replace(/\.sheet$/, '');
      sheets[`${stem}.png`] = sheet;
    }
  }
  return sheets;
}

/**
 * The project with an image's `.sheet` set, replaced, or removed.
 *
 * Beside the image, in its folder, named after it — the whole convention. A
 * `sheet` of `undefined` deletes the file: an image with no grid is a picture,
 * and leaving an empty declaration behind would be a spritesheet with no cells,
 * which is a thing the editors would have to have an opinion about.
 *
 * Returns the same source when it already says this, so a caller can skip the
 * write and the recompile that follows it.
 */
export function setImageSheet(
  source: MultiFileSource,
  imageFileId: string,
  sheet: SheetFile | undefined,
): MultiFileSource {
  const image = source.files[imageFileId];
  if (!image) {
    return source;
  }
  const name = sheetFileName(image.name);
  const existing = Object.values(source.files).find(
    file => file.name === name && file.folderId === image.folderId,
  );
  const contents = sheet ? serializeSheetFile(sheet) : undefined;
  if (existing?.contents === contents || (!existing && !sheet)) {
    return source;
  }

  const files = {...source.files};
  if (!sheet) {
    delete files[existing!.id];
    return {...source, files};
  }
  if (existing) {
    files[existing.id] = {...existing, contents: contents as string};
    return {...source, files};
  }
  // `getNextFileId` is max-numeric-id + 1, which is NaN when a project holds a
  // non-numeric id; fall back to a count, as the stock import does.
  const numeric = getNextFileId(Object.values(source.files));
  const id = Number.isNaN(Number(numeric))
    ? String(Object.keys(source.files).length + 1)
    : numeric;
  files[id] = {
    id,
    name,
    language: 'json',
    contents: contents as string,
    folderId: image.folderId,
  };
  return {...source, files};
}
