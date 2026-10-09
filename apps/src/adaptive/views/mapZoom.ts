// The map's three zoom levels and where the board sits in its viewport at
// each: the whole map scaled to fit, the map at full size around an anchor
// checkpoint, or the anchor enlarged. Pure, so the view only applies it.

import {CheckpointStatusMap} from '../progress';
import {Pathway} from '../types';

export type ZoomLevel = 'overview' | 'detail' | 'focus';
export const ZOOM_LEVELS: ZoomLevel[] = ['overview', 'detail', 'focus'];

const SCALE: {[level in ZoomLevel]: number | undefined} = {
  overview: undefined,
  detail: 1,
  focus: 1.5,
};

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point, Size {}

/** `translate(x, y) scale(scale)` from the board's top left corner. */
export interface BoardTransform {
  scale: number;
  x: number;
  y: number;
}

/** The level one step in or out, or the same level at either end. */
export function stepZoom(level: ZoomLevel, direction: 1 | -1): ZoomLevel {
  const i = ZOOM_LEVELS.indexOf(level) + direction;
  return ZOOM_LEVELS[Math.max(0, Math.min(ZOOM_LEVELS.length - 1, i))];
}

/**
 * Where the board sits at `level`. Overview fits the whole board, never
 * enlarged; the other levels center `anchor` (else the board's center) and
 * then pull the board back so no edge leaves a gap it could fill. At focus,
 * an `extent` that would not fit at full zoom is fitted instead, centered.
 */
export function boardTransform(
  level: ZoomLevel,
  board: Size,
  viewport: Size,
  anchor: Point | undefined,
  extent?: Rect
): BoardTransform {
  const fit = Math.min(
    1,
    viewport.width / board.width,
    viewport.height / board.height
  );
  let scale = SCALE[level] ?? fit;
  let target = anchor ?? {x: board.width / 2, y: board.height / 2};
  if (level === 'focus' && extent) {
    scale = Math.min(
      scale,
      viewport.width / extent.width,
      viewport.height / extent.height
    );
    target = {x: extent.x + extent.width / 2, y: extent.y + extent.height / 2};
  }
  return {
    scale,
    x: place(viewport.width, board.width * scale, target.x * scale),
    y: place(viewport.height, board.height * scale, target.y * scale),
  };
}

// Offset that centers `target` (in scaled board px) in a viewport of
// `outer`, clamped so a board larger than the viewport never shows a gap and
// one smaller is centered.
function place(outer: number, inner: number, target: number): number {
  if (inner <= outer) return (outer - inner) / 2;
  return Math.max(outer - inner, Math.min(0, outer / 2 - target));
}

/**
 * The checkpoint the map zooms toward when none is focused: the one in
 * progress, else the first available, else the first.
 */
export function nextUpCheckpointId(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): string {
  const find = (status: string) =>
    pathway.checkpoints.find(c => statusMap[c.id] === status)?.id;
  return find('inProgress') ?? find('available') ?? pathway.checkpoints[0].id;
}
