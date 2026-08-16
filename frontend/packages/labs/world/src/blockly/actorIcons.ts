// The symbols an actor may elect to be shown by (specs/UI_ACTORS.md).
//
// For the one surface that can hold neither a picture nor a name: a Blockly
// dropdown's option is `{src, width, height, alt}` at 24 by 24, so there is no
// room for a 96 by 24 Label and no name beneath it to fall back on. A symbol is
// what a picker wants there anyway — what identifies a Label as a KIND is "a
// strip of text", not whatever this one happens to say.
//
// AN IMAGE, because that is what the field takes. An SVG data URI rather than a
// rasterized glyph: crisp at any size, no font to load, and Font Awesome's own
// files are already in the tree — the lab depends on `fontawesome-free` for the
// design system's icons, and this reads five of its drawings.
//
// DRAWN ON A PLATE, which is the whole of how it stays legible. A glyph in one
// fixed colour is a bet on the menu's background, and this lab has themes; a
// dark rounded tile with a light glyph on it reads on any of them, and it
// matches how a picture already appears in the map editor's palette.

import barsProgress from '@fortawesome/fontawesome-free/svgs/solid/bars-progress.svg?raw';
import font from '@fortawesome/fontawesome-free/svgs/solid/font.svg?raw';
import handPointer from '@fortawesome/fontawesome-free/svgs/solid/hand-pointer.svg?raw';
import iCursor from '@fortawesome/fontawesome-free/svgs/solid/i-cursor.svg?raw';
import windowMaximize from '@fortawesome/fontawesome-free/svgs/solid/window-maximize.svg?raw';

import {DEFAULT_BACKDROP_COLOR} from '../engine';

/** The glyph, and how much of the tile it takes. */
const GLYPH_COLOR = '#ffffff';
const TILE = 24;
const INSET = 5;

/** Font Awesome ships one `<path>` per solid icon, and states its own box. */
const pathOf = (svg: string): string => /\sd="([^"]+)"/.exec(svg)?.[1] ?? '';
const viewBoxOf = (svg: string): string =>
  /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 512 512';

/**
 * One icon as a data URI: a rounded plate, then the glyph scaled onto it.
 *
 * The glyph is placed with a nested `<svg>` carrying Font Awesome's own
 * viewBox, which is how a drawing meant for a 512 box lands in a 14 pixel one
 * without anybody doing the arithmetic.
 */
const tile = (source: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" ` +
    `viewBox="0 0 ${TILE} ${TILE}">` +
    `<rect width="${TILE}" height="${TILE}" rx="4" fill="${DEFAULT_BACKDROP_COLOR}"/>` +
    `<svg x="${INSET}" y="${INSET}" width="${TILE - INSET * 2}" ` +
    `height="${TILE - INSET * 2}" viewBox="${viewBoxOf(source)}">` +
    `<path fill="${GLYPH_COLOR}" d="${pathOf(source)}"/></svg></svg>`;
  // Encoded rather than base64'd: an SVG data URI is legible in a devtools
  // inspector this way, and shorter for anything but binary.
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * What an actor may say it looks like, named for what it IS rather than for the
 * drawing — a learner picks "button", not "a hand pointing at something".
 */
export const ACTOR_ICONS: Readonly<Record<string, string>> = {
  text: tile(font),
  button: tile(handPointer),
  bar: tile(barsProgress),
  panel: tile(windowMaximize),
  input: tile(iCursor),
};

/** The dropdown's rows, in the order an interface is usually built. */
export const ACTOR_ICON_OPTIONS: Array<[string, string]> = Object.keys(
  ACTOR_ICONS,
).map(name => [name, name]);

/** The data URI for an elected icon, or undefined for a name nothing draws. */
export const actorIconImage = (name: string): string | undefined =>
  ACTOR_ICONS[name];
