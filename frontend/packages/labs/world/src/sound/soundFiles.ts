// Which of a project's files are sounds.
//
// A sound is an ordinary project file — bytes on a `url`, like every image
// (specs/SOUND.md) — so the only thing that tells one from a sprite is its
// name. One test, in one place, because three callers ask it and they must
// agree: the driver decides what to hand Phaser's audio loader, the `play sound`
// dropdown decides what to offer, and the importer decides where a chosen
// sound lands.

/** The folder a sound is imported into, as `set sprite`'s pool has its own. */
export const SOUNDS_FOLDER = 'sounds';

/**
 * What counts as a sound, by extension.
 *
 * `mp3` is what the library ships and what an upload will almost always be;
 * the others are here because a learner's own file may be any of them and
 * refusing one for its extension when the browser can play it would be a rule
 * about nothing. The browser is the real arbiter — a file it cannot decode
 * fails at load, and says so then.
 */
const SOUND_FILE = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i;

/** Whether this file name or path names a sound. */
export const isSoundFile = (name: string): boolean => SOUND_FILE.test(name);

/** `sounds/jump.mp3` → `jump`, which is what a block's dropdown reads. */
export const soundLabel = (name: string): string =>
  (name.split('/').pop() ?? name).replace(SOUND_FILE, '');
