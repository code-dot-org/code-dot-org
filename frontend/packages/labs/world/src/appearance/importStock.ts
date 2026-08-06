// Copying a stock sprite or animation into the learner's project.
//
// A pure transform of the project source, like `importStockEffect` and
// `importStockRule`: the interesting parts are naming and placement, and both
// are far easier to get right — and keep right — tested without a React tree.
//
// An imported image becomes a real file, bytes and all (a `data:` URL on the
// file, the same shape an uploaded image has), because a project draws only what
// it holds. An imported animation brings the images it reads with it: frames of
// nothing are not an animation, and a learner who picked "Coin Spin" did not ask
// to also go and find a coin.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {BACKGROUNDS_FOLDER} from './backgroundsFolder';
import {serializeSheetFile, sheetFileName} from './sheetFile';
import {
  backgroundFileName,
  spriteFileName,
  stockSprite,
  type StockAnimation,
  type StockSprite,
} from './stock';

/** Where each kind lives, by the lab's directory convention (GLOSSARY.md). */
const SPRITES_FOLDER = 'sprites';
const ANIMATIONS_FOLDER = 'animations';

/** The result of an import: the new project, and what the block should name. */
export interface ImportedAppearance {
  source: MultiFileSource;
  /**
   * What a block's field stores — a sprite's file name (`player.png`, which is
   * how a frame and the driver name an image) or an animation's id.
   */
  value: string;
}

/** A folder id by name, creating the folder if the project lacks one. */
function folder(
  source: MultiFileSource,
  name: string,
): {source: MultiFileSource; folderId: string} {
  const existing = Object.values(source.folders).find(
    entry => entry.name === name && entry.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, name);
  const created = Object.values(next.folders).find(
    entry => entry.name === name && entry.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

/** Whether a file of this name already exists in `folderId`. */
function has(
  source: MultiFileSource,
  folderId: string,
  fileName: string,
): boolean {
  return Object.values(source.files).some(
    file => file.folderId === folderId && file.name === fileName,
  );
}

/** Add a file, leaving anything already there alone. */
function write(
  source: MultiFileSource,
  folderId: string,
  file: {name: string; contents?: string; url?: string; mimeType?: string},
): MultiFileSource {
  if (has(source, folderId, file.name)) {
    return source;
  }
  const id = getNextFileId(Object.values(source.files));
  return {
    ...source,
    files: {
      ...source.files,
      [id]: {
        id,
        name: file.name,
        language:
          file.contents === undefined
            ? 'png'
            : file.name.endsWith('.sheet')
              ? 'json'
              : 'anim',
        contents: file.contents ?? '',
        folderId,
        ...(file.url ? {url: file.url, mimeType: file.mimeType} : {}),
      },
    },
  };
}

/**
 * Copy a stock sprite in.
 *
 * Never overwrites and never renames: a project that already has `player.png`
 * has the one the learner may have painted over, and the imported copy would
 * either destroy that work or leave two images with one name — which the frames
 * that reference it could not tell apart.
 */
export function importStockSprite(
  source: MultiFileSource,
  sprite: StockSprite,
): ImportedAppearance {
  const placed = folder(source, SPRITES_FOLDER);
  const name = spriteFileName(sprite.id);
  let current = write(placed.source, placed.folderId, {
    name,
    url: sprite.dataUrl,
    mimeType: 'image/png',
  });
  // A grid comes with the file that says it is one — an image without its
  // `.sheet` is a picture, and the animation editor would offer no frames.
  if (sprite.sheet) {
    current = write(current, placed.folderId, {
      name: sheetFileName(name),
      contents: serializeSheetFile(sprite.sheet),
    });
  }
  return {source: current, value: name};
}

/**
 * Copy a stock backdrop in, given the bytes someone has already fetched.
 *
 * Bytes as an argument, unlike a sprite's, because a backdrop's are not in the
 * bundle: the stock backdrops are served (BACKGROUNDS.md §7) and the caller
 * fetches one before it can be copied. Keeping the fetch outside leaves this a
 * pure transform like its neighbours, which is the half worth testing.
 *
 * No `.sheet`, ever. A backdrop is stretched over the viewport, so a grid of one
 * means nothing, and a file saying otherwise beside it would be a lie the
 * animation editor believes.
 */
export function importStockBackground(
  source: MultiFileSource,
  background: {id: string},
  dataUrl: string,
): ImportedAppearance {
  const placed = folder(source, BACKGROUNDS_FOLDER);
  const name = backgroundFileName(background.id);
  return {
    source: write(placed.source, placed.folderId, {
      name,
      url: dataUrl,
      mimeType: 'image/png',
    }),
    value: name,
  };
}

/** Copy a stock animation in, with the images its frames read. */
export function importStockAnimation(
  source: MultiFileSource,
  animation: StockAnimation,
): ImportedAppearance {
  let current = source;
  for (const id of animation.sprites) {
    const sprite = stockSprite(id);
    if (sprite) {
      current = importStockSprite(current, sprite).source;
    }
  }
  const placed = folder(current, ANIMATIONS_FOLDER);
  return {
    source: write(placed.source, placed.folderId, {
      name: `${animation.id}.anim`,
      contents: `${JSON.stringify(animation.document, null, 2)}\n`,
    }),
    // The id a `play animation` block stores — the animation's own key inside
    // the file, which is not always the file's stem ("switch" holds
    // "switchFlip").
    value: Object.keys(animation.document.animations)[0] ?? animation.id,
  };
}
