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
  /** One of a world's two views (`mapEditor/WorldEditor`). */
  | {kind: 'view'; view: 'map' | 'world'}
  /** A placement selected on the map, of a kind by name or any (`MapStage`). */
  | {kind: 'placement'; named?: string}
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

const onTheMap: Reveal = {kind: 'view', view: 'map'};

/** In a placement's properties, with that placement selected. */
const inProperties =
  (mark: string, says: (kind: string) => string): PlaceOf =>
  named => ({
    mark,
    reveals: [onTheMap, {kind: 'placement', named}],
    says: says(named ?? 'the selected thing'),
  });

const PLACES: Readonly<Record<string, PlaceOf>> = {
  'view.map': () => ({
    mark: 'view.map',
    reveals: [],
    says: 'Map is the first of the two tabs above the editor.',
  }),
  'view.world': () => ({
    mark: 'view.world',
    reveals: [],
    says: 'World is the second of the two tabs above the editor, beside Map.',
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
    kind => `Enhance is in the properties of ${kind}, under its name.`,
  ),
  'map.openKind': inProperties(
    'map.openKind',
    kind => `Open is in the properties of ${kind}, beside Enhance.`,
  ),
  'map.script': inProperties(
    'map.script',
    kind => `Script is at the top of the properties of ${kind}, beside Delete.`,
  ),
  'map.layers': () => ({
    mark: 'map.layers',
    reveals: [onTheMap],
    says: 'Layers is the list beside the map, front layer at the top.',
  }),
  'toolbox.drawer': drawer => ({
    reveals: [{kind: 'toolbox', drawer}],
    says: `${drawer ?? 'The drawer'} is in the toolbox, beside the blocks.`,
  }),
  'toolbox.block': block => ({
    reveals: [{kind: 'toolbox', block}],
    says: 'The block is in the toolbox, beside the blocks.',
  }),
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
