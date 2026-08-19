// What a stock sound is called once it is ours, and where it came from.
//
// `sounds.txt` is `name<TAB>url` rather than the bare URLs `backgrounds.txt`
// carries, and the reason is the upstream names. A backdrop arrives as
// `background_cave.png`, which is one prefix away from what a learner should
// read; a sound arrives as `retro_game_coin_pickup_1`, which is not one
// anything away from `coin`. So the shelf names them and this reads the pairs.
//
// Shared by the downloader (`setup-world-assets.mjs`, which writes the files)
// and the manifest generator (`write-stock-sounds.mjs`, which lists them),
// because a disagreement between those two is a sound the picker offers and the
// import cannot find.

/** The extension every stock sound is served and stored as. */
export const SOUND_EXTENSION = '.mp3';

/**
 * The `{id, url}` pairs in `sounds.txt` — blank lines and `#` are neither.
 *
 * A line with no URL on it is an error rather than a skip: a name alone is a
 * shelf entry that downloads nothing, which shows up as a sound the picker
 * offers and cannot play.
 */
export function soundEntries(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [id, url, ...rest] = line.split(/\s+/);
      if (!url || rest.length) {
        throw new Error(`sounds.txt: expected "name url", got "${line}"`);
      }
      return {id, url};
    });
}

/** The project file name for a stock sound: `coin` → `coin.mp3`. */
export function soundFileName(id) {
  return `${id}${SOUND_EXTENSION}`;
}
