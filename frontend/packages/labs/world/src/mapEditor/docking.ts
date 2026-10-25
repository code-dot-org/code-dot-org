// Docking on a Screen in the editor (specs/DOCKING_PLAN.md, step 4): where a
// dragged placement can dock, and the document with its docked placements
// fitted to their regions.
//
// THE FILE AGREES WITH THE GAME. A docked placement's stored position and
// box are kept equal to its region at the screen's own size, so the stage
// draws it, and a click finds it, where it will be; the engine fits it again
// to whatever window the game runs in (`World.applyLayout`).
//
// Pure: the stage asks it while a placement is dragged and when it is let go.

import {
  dockedIds,
  layoutBoxes,
  undock,
  type Box,
  type LayoutNode,
  type Side,
} from '../engine/core/layout';

import {extentOf, parentIdOf, type MapDoc, type Placement} from './mapModel';

/** Where a placement docks if it is let go here. */
export interface DockZone {
  /** The docked placement it goes beside; nothing, the screen's own edge. */
  target?: string;
  side: Side;
  /** The band that is the zone, in map pixels. */
  box: Box;
}

/** How deep the screen's own edges are, in pixels. */
export const EDGE = 16;

/** What a placement must be to fill a region: in the map, and not a child. */
const dockable = (doc: MapDoc) => {
  const ids = new Set(
    doc.actors.filter(actor => !parentIdOf(actor)).map(actor => actor.id),
  );
  return (id: string) => ids.has(id);
};

/** A placement's box override, or nothing. */
const boxOf = (placement: Placement): {width?: number; height?: number} =>
  (placement.properties?.hasABox ?? {}) as {width?: number; height?: number};

/**
 * The document with each docked placement's position and box its region's,
 * at the map's own size; the same document when every one already is.
 */
export function fitLayout(doc: MapDoc): MapDoc {
  if (!doc.layout) {
    return doc;
  }
  const extent = extentOf(doc);
  const boxes = layoutBoxes(doc.layout, extent.w, extent.h, dockable(doc));
  let changed = false;
  const actors = doc.actors.map(actor => {
    const box = boxes.get(actor.id);
    if (!box) {
      return actor;
    }
    const position = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    const held = actor.properties?.positional?.position as
      | {x: number; y: number}
      | undefined;
    const sized = boxOf(actor);
    if (
      held?.x === position.x &&
      held?.y === position.y &&
      sized.width === box.width &&
      sized.height === box.height
    ) {
      return actor;
    }
    changed = true;
    return {
      ...actor,
      properties: {
        ...actor.properties,
        positional: {...actor.properties?.positional, position},
        hasABox: {...boxOf(actor), width: box.width, height: box.height},
      },
    };
  });
  return changed ? {...doc, actors} : doc;
}

/** Whether a placement is docked. */
export const isDocked = (doc: MapDoc, id: string): boolean =>
  dockedIds(doc.layout).includes(id);

/** The four bands along the inside of `box`, `depth` deep, one per side. */
function bands(box: Box, depth: number): Array<{side: Side; box: Box}> {
  const across = Math.min(depth, box.height / 2);
  const down = Math.min(depth, box.width / 2);
  return [
    {side: 'top', box: {...box, height: across}},
    {
      side: 'bottom',
      box: {...box, y: box.y + box.height - across, height: across},
    },
    {side: 'left', box: {...box, width: down}},
    {side: 'right', box: {...box, x: box.x + box.width - down, width: down}},
  ];
}

/**
 * Where `dragged` could dock: the screen's own four edges, and the four
 * sides of every other docked placement's region, a quarter of the region
 * deep. The screen's edges first, which is the order they are asked in.
 */
export function dockZones(doc: MapDoc, dragged: string): DockZone[] {
  const extent = extentOf(doc);
  const screen = {x: 0, y: 0, width: extent.w, height: extent.h};
  const zones: DockZone[] = bands(screen, EDGE).map(band => ({...band}));
  const present = dockable(doc);
  // Not beside itself: the layout as it would be with it lifted out.
  const rest = undock(doc.layout, dragged);
  for (const [id, box] of layoutBoxes(rest, extent.w, extent.h, present)) {
    const depth = Math.max(8, Math.min(box.width, box.height) / 4);
    for (const band of bands(box, depth)) {
      zones.push({target: id, ...band});
    }
  }
  return zones;
}

/** The zone a point is in, the first that holds it; or nothing. */
export const zoneAt = (
  zones: readonly DockZone[],
  at: {x: number; y: number},
): DockZone | undefined =>
  zones.find(
    zone =>
      at.x >= zone.box.x &&
      at.x <= zone.box.x + zone.box.width &&
      at.y >= zone.box.y &&
      at.y <= zone.box.y + zone.box.height,
  );

/** What a placement docked on `side` is fixed at: its own box across it. */
export function dockSize(placement: Placement, side: Side): number {
  const box = boxOf(placement);
  const size = side === 'top' || side === 'bottom' ? box.height : box.width;
  return typeof size === 'number' && size > 0 ? size : 48;
}

/** The document with this layout, or with none when it is empty. */
export function withLayout(
  doc: MapDoc,
  layout: LayoutNode | undefined,
): MapDoc {
  const next = {...doc};
  if (layout) {
    next.layout = layout;
  } else {
    delete next.layout;
  }
  return next;
}
