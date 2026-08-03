// The seam between a `create actor in map` block and the map canvas.
//
// The same shape as `spritePick` and `appearanceImport`, and for the same
// reason: a Blockly field cannot open a React dialog, and the editor cannot
// reach into a workspace it does not render. The block asks through a handler
// the editor registers while it is mounted.
//
// What is asked is "let them arrange these", and what comes back is the
// arrangement — or undefined when the learner closed the dialog without
// changing anything, which is not the same as coming back with an empty list.

import type {MapPlacement} from './mapPlacements';

/** What the popup is opened on, and what it edits. */
export interface MapPickRequest {
  /** The block asking, so the editor can read its siblings for context. */
  blockId: string;
  /** The actor type being placed — the one type this popup may add. */
  type: string;
  /** A label for it, as the block shows it. */
  name: string;
  /** What this block has now. */
  placements: readonly MapPlacement[];
}

/** Opens the map popup; resolves with the new placements, or undefined. */
export type MapPickHandler = (
  request: MapPickRequest,
) => Promise<MapPlacement[] | undefined>;

let handler: MapPickHandler | null = null;

/**
 * Register the popup. Called by the Blockly editor while it is mounted, and
 * with `null` on unmount so a stale closure over a dead workspace cannot run.
 */
export function setMapPickHandler(next: MapPickHandler | null): void {
  handler = next;
}

/**
 * Ask to arrange these placements.
 *
 * Resolves undefined when nothing changed — including when no handler is
 * registered, which is the case in the headless generator and in tests.
 */
export function requestMapPick(
  request: MapPickRequest,
): Promise<MapPlacement[] | undefined> {
  return handler ? handler(request) : Promise.resolve(undefined);
}
