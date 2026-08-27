// Reaching the progression from outside React.
//
// The map is opened by things that cannot use a hook: a Blockly field, a
// toolbox callback. Both run inside a workspace that knows nothing about the
// lab's contexts, and both need the same one sentence — "open the lesson that
// taught this".
//
// The shape is the one this package already uses for the same problem
// (`blockly/openModule`, `blockly/ruleImport`, `blockly/effectImport`): the
// editor registers a handler while it is mounted and clears it on unmount, and
// the caller asks through the seam. Registering `null` on unmount is the part
// that matters — a stale closure over a dead workspace is the bug this shape
// exists to prevent.

import type {TileId, UnlockTarget} from './types';

import {grantedBy} from './index';

export type LessonOpener = (tile: TileId) => void;

let opener: LessonOpener | null = null;

/** Register the opener. Called by the lab while the progression is mounted. */
export function setLessonOpener(next: LessonOpener | null): void {
  opener = next;
}

/**
 * The tile that taught a thing, if one did AND there is anywhere to open it.
 *
 * Both halves, deliberately: a caller asking this is deciding whether to draw
 * an affordance, and an affordance that opens nothing is worse than none. A
 * host with no progression mounted — a test, a headless generator — answers
 * "nothing here", and every call site then draws nothing without asking.
 */
export function lessonFor(unlock: UnlockTarget): TileId | undefined {
  return opener ? grantedBy(unlock)?.id : undefined;
}

/** Open the map on a tile. Does nothing if nothing is registered. */
export function openLesson(tile: TileId): void {
  opener?.(tile);
}
