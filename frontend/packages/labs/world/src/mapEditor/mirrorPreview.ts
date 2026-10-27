// What a Viewport that mirrors shows on the stage (specs/MIRRORING_PLAN.md,
// step 5).
//
// A Viewport that holds a map is drawn with that map inside its box, dimmed
// (`MapStage`). One that mirrors holds no map: it shows another Viewport's
// scene, or the world's own. The chain is the engine's (`World.mirrorTargetOf`):
// `mirrors` before `mirrors the world`, a mirror of a mirror shows what the
// end of the chain shows, and a chain that comes back to itself shows nothing.

import type {MapDoc, Placement} from './mapModel';

/** A placement's `showsMap` values, as much of them as a mirror reads. */
interface ShowsMap {
  mirrors?: unknown;
  mirrorsTheWorld?: unknown;
}

const showsMapOf = (placement: Placement): ShowsMap | undefined =>
  (placement.properties as {showsMap?: ShowsMap} | undefined)?.showsMap;

/** The one placement a `mirrors` value names, which may be held as a list. */
const named = (value: unknown): string | undefined => {
  const id = Array.isArray(value) ? value[0] : value;
  return typeof id === 'string' && id ? id : undefined;
};

/**
 * `held` with each mirror given the map it shows: the held map at the end
 * of its chain, or `root` for one that ends on the world.
 *
 * `root` is the world's own scene: the map being edited when it is the Main
 * Screen, and the Main Screen when it is not.
 */
export function withMirrors(
  map: MapDoc,
  held: Readonly<Record<string, MapDoc>>,
  root: MapDoc | undefined,
): Record<string, MapDoc> {
  const byId = new Map(map.actors.map(actor => [actor.id, actor]));
  const shown = (viewport: Placement): MapDoc | undefined => {
    const seen = new Set<Placement>();
    let at: Placement | undefined = viewport;
    while (at && !seen.has(at)) {
      seen.add(at);
      const shows = showsMapOf(at);
      if (!shows) {
        return undefined;
      }
      const next = named(shows.mirrors);
      if (next) {
        at = byId.get(next);
        continue;
      }
      if (shows.mirrorsTheWorld === true) {
        return root;
      }
      return at === viewport ? undefined : held[at.id];
    }
    return undefined;
  };
  const all: Record<string, MapDoc> = {...held};
  for (const actor of map.actors) {
    const shows = showsMapOf(actor);
    if (!named(shows?.mirrors) && shows?.mirrorsTheWorld !== true) {
      continue;
    }
    const scene = shown(actor);
    if (scene) {
      all[actor.id] = scene;
    } else {
      delete all[actor.id];
    }
  }
  return all;
}
