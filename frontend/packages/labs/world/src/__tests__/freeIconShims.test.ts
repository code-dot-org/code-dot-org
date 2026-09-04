// Whether the icons this lab asks for are icons FREE has.
//
// A name FontAwesome does not know fails silently: the element renders, sized
// and empty, because `--fa` is simply never set. So the free demo can lose an
// icon and nobody finds out until they look at that corner of the screen.
// `reportMissingIcons` finds them at runtime, in a browser, if somebody is
// watching the console; this finds them here.
//
// It reads the installed package's own stylesheet rather than a list of names
// written down beside it, because a list would be a second copy of FontAwesome
// going stale on its own schedule — and the stale copy would say the icon is
// fine.

import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

import {worldConfig} from '../config';
import {FOLDER_MENUS} from '../files/folderMenus';
import {FREE_ICON_SHIMS} from '../freeIconShims';

const freeCss = readFileSync(
  createRequire(import.meta.url).resolve(
    '@fortawesome/fontawesome-free/css/all.css',
  ),
  'utf8',
);

/** Every icon name Free draws, mapped to the code point it draws it with. */
const freeGlyphs = new Map<string, string>(
  [
    ...freeCss.matchAll(/\.fa-([a-z0-9-]+)\s*\{\s*--fa:\s*"(\\[0-9a-f]+)"/g),
  ].map(match => [match[1], match[2]]),
);

const shimmed = new Set(FREE_ICON_SHIMS.map(shim => shim.name));

/** Every icon this lab names for itself, and where it named it. */
const asked: ReadonlyArray<{name: string; where: string}> = [
  ...FOLDER_MENUS.map(menu => ({
    name: menu.icon,
    where: `the ${menu.folder} folder menu`,
  })),
  ...Object.entries(worldConfig.fileIcons ?? {}).map(([extension, icon]) => ({
    name: icon.iconName,
    where: `the .${extension} file icon`,
  })),
];

describe('the icons the lab names', () => {
  it('reads a real stylesheet, or it is checking nothing', () => {
    // The regex is the load-bearing part: a FontAwesome that changed how it
    // writes a glyph would leave this map empty, and an empty map calls every
    // icon missing — or, worse, an empty ASKED list would call nothing
    // missing. Both ends pinned.
    expect(freeGlyphs.get('earth-americas')).toBe('\\f57d');
    expect(freeGlyphs.size).toBeGreaterThan(1000);
    expect(asked.length).toBeGreaterThan(10);
  });

  it.each(asked)('draws $name, for $where', ({name}) => {
    // Either Free has it, or `freeIconShims` says what to draw instead. A name
    // that is neither is an empty box in every build without the pro kit.
    expect(freeGlyphs.has(name) || shimmed.has(name)).toBe(true);
  });

  it.each(FREE_ICON_SHIMS)(
    'stands $name in with a glyph Free actually has',
    ({glyph, substitute}) => {
      // A shim is a raw code point, so a typo in one is the same empty box the
      // shim was written to fix — and it would look like the shim is missing.
      // The `substitute` name is the comment for a reader; this is what makes
      // the two agree.
      expect(freeGlyphs.get(substitute)).toBe(glyph);
    },
  );
});
