// Named places: what "Show me" can point at, and the words for where each is.
//
// A lesson's instructions name a control — "press **Enhance Hero…**" — and a
// link in them can point at it (specs/CALLOUTS.md, specs/SHOW_ME_PLAN.md).
// The link carries a NAME, not a selector: `map.enhance:Hero`. This is the
// list of names. A name that is not here points at nothing, and a test holds
// every lesson to that (`progression/__tests__`), so a lesson cannot name a
// place the lab does not have.
//
// Plain data and pure functions: no DOM, no React, no Blockly. `pointAt` is
// what acts on a place.
//
// A NAME MAY CARRY AN ARGUMENT after a colon. `map.enhance:Ground` is Enhance
// with a Ground selected; `toolbox.block:world_print` is one block. The
// argument is the place's own to interpret.

/** What has to be true for a place to be on screen, asked of its owner. */
export type Reveal =
  /**
   * A FILE in front, which is what every other reveal is asked of: only the
   * active tab's editor is mounted, so a place in another file has nobody to
   * answer for it until this (`layout/WorldLayout`). Named as a lesson names
   * things — the actor by the name its file declares, the level and the Main
   * Screen by being them — rather than by a path.
   */
  | {kind: 'file'; actor?: string; level?: boolean; screen?: boolean}
  /** The Main Screen's code open, in place of the screen (`MapEditor`). */
  | {kind: 'code'}
  /** A placement selected on the map, of a kind by name or any (`MapStage`). */
  | {kind: 'placement'; named?: string}
  /** The map's panel that starts hidden behind a button (`MapStage`). */
  | {kind: 'mapPanel'; panel: 'layers'}
  /** A toolbox drawer open, on a block or by name (`BlocklyFileEditor`). */
  | {kind: 'toolbox'; block?: string; drawer?: string};

export interface Place {
  /**
   * The `data-callout` the target wears, or nothing when the place is not
   * DOM the lab marks — a block in Blockly's flyout, which Blockly's own
   * focus rings (specs/SHOW_ME_PLAN.md).
   */
  mark?: string;
  /** What to ask for, in order, before looking for the target. */
  reveals: readonly Reveal[];
  /** Where it is, in words that stand without the picture. */
  says: string;
}

type PlaceOf = (argument: string | undefined) => Place;

/** The level in front: `main.map`, or the screen where it is the level. */
const onTheMap: Reveal = {kind: 'file', level: true};
const theScreen: Reveal = {kind: 'file', screen: true};
const theScreenCode: readonly Reveal[] = [theScreen, {kind: 'code'}];

/**
 * A block or a drawer may say WHICH FILE'S toolbox, after an `@`:
 * `world_print@Hero` is in the Hero's file, `world_add_actor@screen` in the
 * Main Screen's code. Without one, whichever file is in front, which is
 * right for a lesson that has just said to open it.
 */
const inFile = (
  argument: string | undefined,
): {wanted: string | undefined; reveals: Reveal[]} => {
  const at = argument?.indexOf('@') ?? -1;
  if (!argument || at < 0) {
    return {wanted: argument, reveals: []};
  }
  const file = argument.slice(at + 1);
  return {
    wanted: argument.slice(0, at) || undefined,
    reveals:
      file === 'screen' ? [...theScreenCode] : [{kind: 'file', actor: file}],
  };
};

/** In a placement's properties, with that placement selected. */
const inProperties =
  (mark: string, says: (kind: string) => string): PlaceOf =>
  named => ({
    mark,
    reveals: [onTheMap, {kind: 'placement', named}],
    says: says(named ?? 'the selected thing'),
  });

const PLACES: Readonly<Record<string, PlaceOf>> = {
  level: () => ({
    reveals: [onTheMap],
    says: 'The level is main.map, the tab beside the Main Screen.',
  }),
  'screen.code': () => ({
    mark: 'screen.code',
    reveals: [theScreen],
    says:
      'Screen code is the puzzle piece above the Main Screen, and it opens ' +
      'the screen’s blocks.',
  }),
  'map.palette': named => ({
    mark: named ? `map.palette:${named}` : 'map.palette',
    reveals: [onTheMap],
    says: named
      ? `${named} is in the strip of kinds along the top of the map.`
      : 'The strip of kinds runs along the top of the map.',
  }),
  'map.newActor': () => ({
    mark: 'map.newActor',
    reveals: [onTheMap],
    says: 'New actor is the last tile in the strip along the top of the map.',
  }),
  'map.enhance': inProperties(
    'map.enhance',
    kind =>
      `Enhance is the sparkles beside the name in the properties of ${kind}.`,
  ),
  'map.openKind': inProperties(
    'map.openKind',
    kind =>
      `Open is the box with an arrow beside the name in the properties of ${kind}.`,
  ),
  'map.script': inProperties(
    'map.script',
    kind =>
      `Code is the puzzle piece beside the name in the properties of ${kind}.`,
  ),
  'world.properties': () => ({
    mark: 'world.properties',
    reveals: [theScreen],
    says:
      'The game’s own properties are beside the Main Screen, with nothing ' +
      'selected on it.',
  }),
  'map.layers': () => ({
    mark: 'map.layers',
    reveals: [onTheMap, {kind: 'mapPanel', panel: 'layers'}],
    says:
      'Layers is the list the Layers button above the map opens, front ' +
      'layer at the top.',
  }),
  'actor.blocks': actor => ({
    reveals: [{kind: 'file', actor}],
    says: `${actor ?? 'The actor'}'s blocks are the tab of its own name.`,
  }),
  'screen.blocks': () => ({
    reveals: [...theScreenCode],
    says: 'The Main Screen’s blocks are behind Screen code, above the screen.',
  }),
  'toolbox.drawer': argument => {
    const {wanted, reveals} = inFile(argument);
    return {
      reveals: [...reveals, {kind: 'toolbox', drawer: wanted}],
      says: `${wanted ?? 'The drawer'} is in the toolbox, beside the blocks.`,
    };
  },
  'toolbox.block': argument => {
    const {wanted, reveals} = inFile(argument);
    return {
      reveals: [...reveals, {kind: 'toolbox', block: wanted}],
      says: 'The block is in the toolbox, beside the blocks.',
    };
  },
};

/** A name split at its first colon: `map.enhance:Hero`. */
export const parsePlaceName = (
  name: string,
): {place: string; argument: string | undefined} => {
  const at = name.indexOf(':');
  return at < 0
    ? {place: name, argument: undefined}
    : {place: name.slice(0, at), argument: name.slice(at + 1) || undefined};
};

/** The place a name means, or nothing for a name the lab does not have. */
export const placeNamed = (name: string): Place | undefined => {
  const {place, argument} = parsePlaceName(name);
  return PLACES[place]?.(argument);
};

/** Every place there is, without arguments — for a list, and for tests. */
export const PLACE_NAMES: readonly string[] = Object.keys(PLACES);

/** The `#clickable=` names in a piece of markdown, in order. */
export const clickableNames = (markdown: string): string[] =>
  [...markdown.matchAll(/\]\(#clickable=([^)\s]+)\)/g)].map(match =>
    decodeURIComponent(match[1]),
  );
