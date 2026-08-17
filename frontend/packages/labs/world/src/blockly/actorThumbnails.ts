// What an actor is DRAWN AS, for the parts of Blockly that draw one — its
// picture, or the symbol it elected instead (specs/UI_ACTORS.md).
//
// The sandbox renders these (it is the only thing that can: an actor's
// appearance is its rules, its traits and its animation frame resolved
// together), and the map editor asks for them through the runtime context. A
// Blockly field cannot reach that context — it is not in the React tree — so
// the editor pushes them here, the same arrangement the project dropdowns use
// (`moduleOptions`).
//
// Missing is a fine answer: the placement grid draws a plain marker for an
// actor it has no picture of, which still says the cell is taken.

/** Data URLs by actor type, as the sandbox rendered them. */
let thumbnails: Record<string, string> = {};

/** Replace what the fields draw actors with. */
export function setActorThumbnails(next: Record<string, string>): void {
  thumbnails = next;
}

/** Merge in more, keeping what is already known. */
export function addActorThumbnails(more: Record<string, string>): void {
  thumbnails = {...thumbnails, ...more};
}

/** The thumbnail for an actor type, or undefined if none has arrived. */
export function actorThumbnail(type: string): string | undefined {
  return thumbnails[type];
}

/** Everything known, for a caller that wants to draw several. */
export function actorThumbnails(): Record<string, string> {
  return thumbnails;
}

/**
 * Elected icons by actor key — the `show as` row, read out of the file.
 *
 * Beside the thumbnails because it answers the same question for the same
 * callers, and REPLACED rather than merged: a thumbnail arrives once and stays
 * true, while an icon is whatever the file says right now, so a row deleted
 * from a `.actor` has to stop being an icon.
 */
let icons: Record<string, string> = {};

export function setActorIcons(next: Record<string, string>): void {
  icons = next;
}

/** The icon an actor elected, or undefined if it elected none. */
export function actorIcon(key: string): string | undefined {
  return icons[key];
}

/**
 * Pictures of particular PLACEMENTS, by `mapPlacements.placementKey`.
 *
 * A kind's picture is not a placement's: three Labels arranged on one map say
 * three different things, and drawing them all from the kind is three identical
 * smudges (specs/UI_ACTORS.md). Replaced rather than merged, because a
 * placement edited has a new key and the old one is nobody's.
 */
let placements: Record<string, string> = {};

export function setPlacementThumbnails(next: Record<string, string>): void {
  placements = next;
}

/** The picture for one placement, or undefined — the kind's is the fallback. */
export function placementThumbnail(key: string): string | undefined {
  return placements[key];
}
