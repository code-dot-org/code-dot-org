// The tree: roots on top, a checkpoint's row being the length of the
// longest `requires` chain beneath it, so every edge points downward.

import {Checkpoint} from '../../../types';

import {depthRows, edgesOf} from './graph';
import {MapLayout, NodePosition} from './types';

export const BOARD_WIDTH = 760;
const ROW_HEIGHT = 170;
const TOP_MARGIN = 96;
const BOTTOM_MARGIN = 60;

/** Checkpoints in rows by depth, roots on top. */
export function layoutCheckpoints(checkpoints: Checkpoint[]): MapLayout {
  const rows = depthRows(checkpoints);
  const nodes: {[id: string]: NodePosition} = {};
  rows.forEach((ids, row) => {
    ids.forEach((id, i) => {
      nodes[id] = {
        id,
        row,
        x: Math.round((BOARD_WIDTH * (i + 1)) / (ids.length + 1)),
        y: TOP_MARGIN + row * ROW_HEIGHT,
      };
    });
  });
  return {
    nodes,
    edges: edgesOf(checkpoints),
    width: BOARD_WIDTH,
    height: TOP_MARGIN + (rows.length - 1) * ROW_HEIGHT + BOTTOM_MARGIN,
  };
}
