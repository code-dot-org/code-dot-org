// What makes an image a spritesheet.
//
// Nothing about a PNG says "I am six frames in a row" — it is a picture, and how
// it should be cut up is a decision someone made. So the decision is a file: a
// `.sheet` beside the image, with the same stem, saying how big a cell is.
// `coinSpin.png` + `coinSpin.sheet` is a spritesheet; `player.png` on its own is
// a picture.
//
// Only the animation editor reads it. The runtime never does: a frame carries
// the rectangle it draws, so by the time an animation is playing, the grid has
// already done its job. That is why the metadata can live beside the image
// instead of inside it — and why a learner can change it without breaking
// animations that were already written against it.

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
