// Which images are backdrops.
//
// The folder, and nothing else (BACKGROUNDS.md §5): an image under
// `backgrounds/` is a backdrop, and moving one there is a reasonable way to say
// so. That makes this string a rule rather than a path — the dropdowns filter on
// it, the import writes to it, the picture palette leaves it out, and the image
// editor stops offering spritesheet controls inside it. Four places that must
// agree, so they agree by reading the same line.

/** The folder a backdrop lives in, as a folder name. */
export const BACKGROUNDS_FOLDER = 'backgrounds';

const PREFIX = `${BACKGROUNDS_FOLDER}/`;

/** Whether a folder-prefixed project path names a backdrop. */
export const isBackgroundPath = (path: string | undefined): boolean =>
  path !== undefined && path.startsWith(PREFIX);
