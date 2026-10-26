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
  dividers,
  dock,
  dockedIds,
  layoutBoxes,
  resize,
  splitAt,
  undock,
  type Divider,
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
    // NOT TURNED. The engine fits a docked actor's middle and box to its
    // region and leaves its rotation alone, so a turned one drew tilted
    // across its neighbours. Docked, it is square to the screen.
    const turned = actor.properties?.positional?.rotation;
    const square = typeof turned !== 'number' || turned === 0;
    if (
      held?.x === position.x &&
      held?.y === position.y &&
      sized.width === box.width &&
      sized.height === box.height &&
      square
    ) {
      return actor;
    }
    changed = true;
    return {
      ...actor,
      properties: {
        ...actor.properties,
        positional: {
          ...actor.properties?.positional,
          position,
          ...(square ? {} : {rotation: 0}),
        },
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

/** One place the inspector offers to dock a placement. */
export interface DockChoice {
  /** The docked placement it goes beside; nothing, the screen's own edge. */
  target?: string;
  side: Side;
  /** What the menu says. */
  label: string;
}

const EDGE_WORDS: Record<Side, string> = {
  top: 'Along the top of the screen',
  bottom: 'Along the bottom of the screen',
  left: 'Down the left of the screen',
  right: 'Down the right of the screen',
};
const BESIDE_WORDS: Record<Side, string> = {
  top: 'Above',
  bottom: 'Below',
  left: 'Left of',
  right: 'Right of',
};
const SIDES: readonly Side[] = ['top', 'bottom', 'left', 'right'];

/**
 * Where `id` could dock, as the inspector lists it (specs/PURPOSE_PLAN.md,
 * step 5): the zones a drag offers, without the drag. The screen's four
 * edges, then the four sides of every other docked placement. Nothing for a
 * placement inside another, which a drag cannot dock either.
 */
export function dockChoices(doc: MapDoc, id: string): DockChoice[] {
  if (!dockable(doc)(id)) {
    return [];
  }
  const others = dockedIds(undock(doc.layout, id)).filter(dockable(doc));
  return [
    ...SIDES.map(side => ({side, label: EDGE_WORDS[side]})),
    ...others.flatMap(target =>
      SIDES.map(side => ({
        target,
        side,
        label: `${BESIDE_WORDS[side]} ${target}`,
      })),
    ),
  ];
}

/**
 * The document with `id` docked on `side` of `target`, or of the screen:
 * what a drop in that zone does. Its side is fixed at the size of its own box
 * across it, and it is moved if it was docked elsewhere.
 */
export function dockedAt(
  doc: MapDoc,
  id: string,
  target: string | undefined,
  side: Side,
): MapDoc {
  const placement = doc.actors.find(actor => actor.id === id);
  return withLayout(
    doc,
    dock(
      doc.layout,
      id,
      target,
      side,
      placement ? dockSize(placement, side) : 48,
    ),
  );
}

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

/** The divider within `reach` of a point, nearest first; or nothing. */
export function dividerAt(
  doc: MapDoc,
  at: {x: number; y: number},
  reach: number,
): Divider | undefined {
  const extent = extentOf(doc);
  let best: Divider | undefined;
  let bestDistance = reach;
  for (const line of dividers(doc.layout, extent.w, extent.h, dockable(doc))) {
    const across = line.split === 'across';
    const along = across ? at.y : at.x;
    const start = across ? line.box.y : line.box.x;
    const end = start + (across ? line.box.height : line.box.width);
    const distance = Math.abs((across ? at.x : at.y) - line.at);
    if (along >= start && along <= end && distance <= bestDistance) {
      best = line;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * The document with a divider dragged to a point: its split's fixed side
 * as large as the point makes it, within the region it divides.
 */
export function dragDivider(
  doc: MapDoc,
  line: Divider,
  at: {x: number; y: number},
): MapDoc {
  const split = splitAt(doc.layout, line.path);
  if (!split) {
    return doc;
  }
  const across = line.split === 'across';
  const whole = across ? line.box.width : line.box.height;
  const along = Math.max(
    0,
    Math.min(whole, across ? at.x - line.box.x : at.y - line.box.y),
  );
  const size = split.fixed === 'first' ? along : whole - along;
  return withLayout(doc, resize(doc.layout, line.path, size));
}

/** The props a dock decides, which the inspector shows and does not edit. */
export const SET_BY_DOCK: ReadonlyArray<{owner: string; prop: string}> = [
  {owner: 'positional', prop: 'position'},
  {owner: 'positional', prop: 'rotation'},
  {owner: 'hasABox', prop: 'width'},
  {owner: 'hasABox', prop: 'height'},
];

/** One edge of a docked placement's region that can be moved. */
export interface DockedEdge {
  side: Side;
  /** The divider the edge lies on, which moving the edge drags. */
  line: Divider;
  /** The middle of the edge, where its grip is drawn. */
  at: {x: number; y: number};
}

/**
 * The edges of `id`'s region that are dividers, which are the only ones
 * that can move: an edge on the screen's own boundary stays where it is
 * whatever is dragged. A top bar has one, its bottom; the Viewport under it
 * has one, its top. Nothing for a placement that is not docked.
 *
 * Each edge lies on exactly one divider — the nearest split above it in the
 * tree that has something on both sides — so the first found is the one.
 */
export function dockedEdges(doc: MapDoc, id: string): DockedEdge[] {
  const extent = extentOf(doc);
  const present = dockable(doc);
  const box = layoutBoxes(doc.layout, extent.w, extent.h, present).get(id);
  if (!box) {
    return [];
  }
  const lines = dividers(doc.layout, extent.w, extent.h, present);
  const near = (a: number, b: number) => Math.abs(a - b) < 0.5;
  const spans = (line: Divider, from: number, to: number) => {
    const start = line.split === 'across' ? line.box.y : line.box.x;
    const end =
      start + (line.split === 'across' ? line.box.height : line.box.width);
    return from >= start - 0.5 && to <= end + 0.5;
  };
  const edges: Array<{side: Side; split: 'across' | 'down'; at: number}> = [
    {side: 'top', split: 'down', at: box.y},
    {side: 'bottom', split: 'down', at: box.y + box.height},
    {side: 'left', split: 'across', at: box.x},
    {side: 'right', split: 'across', at: box.x + box.width},
  ];
  const found: DockedEdge[] = [];
  for (const edge of edges) {
    const across = edge.split === 'across';
    const line = lines.find(
      one =>
        one.split === edge.split &&
        near(one.at, edge.at) &&
        (across
          ? spans(one, box.y, box.y + box.height)
          : spans(one, box.x, box.x + box.width)),
    );
    if (line) {
      found.push({
        side: edge.side,
        line,
        at: across
          ? {x: edge.at, y: box.y + box.height / 2}
          : {x: box.x + box.width / 2, y: edge.at},
      });
    }
  }
  return found;
}

/** The document with a divider moved `by` pixels, right or down. */
export const nudgeDivider = (doc: MapDoc, line: Divider, by: number): MapDoc =>
  dragDivider(
    doc,
    line,
    line.split === 'across'
      ? {x: line.at + by, y: line.box.y}
      : {x: line.box.x, y: line.at + by},
  );

/** The region a docked placement fills, at the map's own size. */
export function dockedBox(doc: MapDoc, id: string): Box | undefined {
  const extent = extentOf(doc);
  return layoutBoxes(doc.layout, extent.w, extent.h, dockable(doc)).get(id);
}
