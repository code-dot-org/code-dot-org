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

import type {MultiFileSource} from '@code-dot-org/core/api';

import {folderIn, writeFile} from '../projectWrite';

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
  const placed = folderIn(source, SPRITES_FOLDER);
  const name = spriteFileName(sprite.id);
  let current = writeFile(placed.source, placed.folderId, {
    name,
    language: 'png',
    url: sprite.dataUrl,
    mimeType: 'image/png',
  });
  // A grid comes with the file that says it is one — an image without its
  // `.sheet` is a picture, and the animation editor would offer no frames.
  if (sprite.sheet) {
    current = writeFile(current, placed.folderId, {
      name: sheetFileName(name),
      language: 'json',
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
  const placed = folderIn(source, BACKGROUNDS_FOLDER);
  const name = backgroundFileName(background.id);
  return {
    source: writeFile(placed.source, placed.folderId, {
      name,
      language: 'png',
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
  const placed = folderIn(current, ANIMATIONS_FOLDER);
  return {
    source: writeFile(placed.source, placed.folderId, {
      name: `${animation.id}.anim`,
      language: 'anim',
      contents: `${JSON.stringify(animation.document, null, 2)}\n`,
    }),
    // The id a `play animation` block stores — the animation's own key inside
    // the file, which is not always the file's stem ("switch" holds
    // "switchFlip").
    value: Object.keys(animation.document.animations)[0] ?? animation.id,
  };
}
