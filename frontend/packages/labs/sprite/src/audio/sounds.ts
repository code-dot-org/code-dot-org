import {SoundBoard} from '@code-dot-org/audio';

// Where the sound library serves a `sound://` URL; apps' assetPrefix default.
const SOUND_PREFIX = 'sound://';
const SOUND_PATH_PREFIX = '/api/v1/sound-library/';

/** The lab's one sound board, shared by the block pickers and the engine. */
export const sounds = new SoundBoard();

/** A `sound://` URL as the path the sound library serves it at. */
export function resolveSoundUrl(url: string): string {
  return url.startsWith(SOUND_PREFIX)
    ? SOUND_PATH_PREFIX + url.slice(SOUND_PREFIX.length)
    : url;
}

/** Play a library sound once, as apps' audioApi playSound does. */
export function playSound(url: string, loop = false): void {
  sounds.playUrl(resolveSoundUrl(url), {
    volume: 1.0,
    loop,
    allowHTML5Mobile: true,
  });
}
