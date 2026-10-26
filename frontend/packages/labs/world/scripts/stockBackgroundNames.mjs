// What a stock backdrop is called once it is ours.
//
// The URLs in `backgrounds.txt` are animation-library paths, and their file
// names carry that library's conventions rather than this lab's: a
// `background_` prefix on some but not others (`background_cave.png`, but
// `city.png`), and snake_case throughout. The lab's own stock images are
// camelCase and unprefixed (`coinSpin.png`, `playerWalk.png`), and a learner who
// imports one sees the file name in the browser, on a tab, and in a block
// dropdown — so the name is part of the library, not an implementation detail.
//
// Shared by the downloader (`setup-world-assets.mjs`, which writes the files)
// and the manifest generator (`write-stock-backgrounds.mjs`, which lists them),
// because a disagreement between those two is a background the picker offers
// and the import cannot find.

/** The lines of `backgrounds.txt` that are URLs — blanks and `#` are not. */
export function backgroundUrls(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

/**
 * The project file name for a stock backdrop URL: `…/background_cave.png` →
 * `cave.png`, `…/sun_and_rainbow.png` → `sunAndRainbow.png`.
 */
export function backgroundFileName(url) {
  const base = url.slice(url.lastIndexOf('/') + 1).replace(/\.png$/i, '');
  const stem = base.replace(/^background_/, '');
  const camel = stem.replace(/_([a-z0-9])/g, (_, character) =>
    character.toUpperCase(),
  );
  return `${camel}.png`;
}
