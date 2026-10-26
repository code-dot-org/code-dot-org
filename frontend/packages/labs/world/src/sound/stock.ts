// The sound library a project can copy from.
//
// A shelf, not a runtime — the same thing `appearance/stock` says about
// pictures, and it is as true here: a game plays only what its project holds.
// Nothing on this shelf makes a noise until it has been imported, at which
// point it is a file the learner owns, renamable and deletable, and nothing
// outside the project decides whether their game still goes pop.
//
// A CURATED SUBSET of Sprite Lab's library (specs/SOUND.md): 39 of 1598,
// vendored, because the standalone demo has no code.org origin to ask. The ids
// and the URLs they came from are in `sounds.txt`.

import {getSoundBaseUrl} from '../runtime/worldConfig';

import {STOCK_SOUND_IDS} from './stockSounds';

export interface StockSound {
  /** File stem this is imported as — `coin` becomes `sounds/coin.mp3`. */
  id: string;
  /** What the shelf calls it, and what the dialog announces. */
  name: string;
  /** Where its bytes are served from, resolved against the sound base URL. */
  url: string;
}

/** `coin` → `coin.mp3`, the name a project file and a block value carry. */
export const soundFileName = (id: string): string => `${id}.mp3`;

/**
 * `bigJump` → "big jump" — the id as words, for a label and a screen reader.
 *
 * Derived rather than listed, because a second name per sound in `sounds.txt`
 * would be a second thing to keep in step with the first for no information:
 * the ids are already chosen to read as what they are.
 */
export const soundLabel = (id: string): string =>
  id.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();

/** Every stock sound, as the library dialog lists them. */
export function stockSounds(): StockSound[] {
  const base = getSoundBaseUrl();
  return STOCK_SOUND_IDS.map(id => ({
    id,
    name: soundLabel(id),
    url: `${base}${soundFileName(id)}`,
  }));
}

/** One by id, or undefined — a shelf entry a saved value no longer matches. */
export const stockSound = (id: string): StockSound | undefined =>
  stockSounds().find(sound => sound.id === id);
