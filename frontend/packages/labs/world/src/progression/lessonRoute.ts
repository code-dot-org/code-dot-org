// Where a lesson opens.
//
// A lesson gets a CHANNEL OF ITS OWN, and that is the whole of this module's
// reason to exist. The project a learner has open is their own game; starting a
// lesson must never replace its sources, which is how somebody loses a week of
// work (specs/PROGRESSION_UI.md, "Three transports, and only one of them is for
// starting"). So Start navigates, and this says where to.
//
// The host decides the shape of that URL, because the two hosts disagree: the
// studio serves projects at `/app/projects/world/<channel>/edit`, and the
// standalone demo answers a query parameter against its mock API. The default
// here is the studio's; `setLessonHref` is how the demo says otherwise, the
// same seam `runtime/worldConfig` uses for the sandbox origin.

import type {Tile, TileId} from './types';

/**
 * The channel id a lesson lives at.
 *
 * A tile id has a slash in it and a channel id may not — it is one path segment
 * in every route that carries it — so the slash becomes a hyphen. Prefixed, so
 * that a lesson channel is recognisable as one beside a learner's own projects.
 */
export const lessonChannel = (id: TileId): string =>
  `lesson-${id.replace(/\//g, '-')}`;

/** The tile a lesson channel belongs to, or nothing if it is not one. */
export const tileForChannel = (
  channel: string,
  ids: Iterable<TileId>,
): TileId | undefined => {
  for (const id of ids) {
    if (lessonChannel(id) === channel) {
      return id;
    }
  }
  return undefined;
};

export type LessonHref = (tile: Tile) => string;

const studioHref: LessonHref = tile =>
  `/app/projects/world/${lessonChannel(tile.id)}/edit`;

let href: LessonHref = studioHref;

/** Say where lessons open, for a host that is not the studio. */
export const setLessonHref = (fn: LessonHref): void => {
  href = fn;
};

/** Where this lesson opens. */
export const lessonHref = (tile: Tile): string => href(tile);
