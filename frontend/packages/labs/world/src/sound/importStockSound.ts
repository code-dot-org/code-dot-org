// Copying a stock sound into the learner's project.
//
// A pure transform of the project source, like `importStockBackground` — and
// with the same division of labour: the bytes are an ARGUMENT, because a stock
// sound's are served rather than bundled and the caller fetches one before it
// can be copied. Keeping the fetch outside leaves this the half worth testing.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {folderIn, writeFile} from '../projectWrite';

import {SOUNDS_FOLDER} from './soundFiles';
import {soundFileName} from './stock';

/** The result of an import: the new project, and what a block should name. */
export interface ImportedSound {
  source: MultiFileSource;
  /** What a block's field stores — the file name, as `set sprite` stores one. */
  value: string;
}

/**
 * Copy a stock sound in, given the bytes someone has already fetched.
 *
 * Never overwrites: a project that already has `coin.mp3` has the one the
 * learner may have replaced with their own (`projectWrite`).
 */
export function importStockSound(
  source: MultiFileSource,
  sound: {id: string},
  dataUrl: string,
): ImportedSound {
  const placed = folderIn(source, SOUNDS_FOLDER);
  const name = soundFileName(sound.id);
  return {
    source: writeFile(placed.source, placed.folderId, {
      name,
      language: 'mp3',
      url: dataUrl,
      mimeType: 'audio/mpeg',
    }),
    value: name,
  };
}
