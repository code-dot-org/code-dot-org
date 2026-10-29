export const NODE_RADIUS = 34;

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  row: number;
}

export interface Edge {
  from: string;
  to: string;
}

/** The checkpoints that share a `destination`, in authored order. */
export interface DestinationGroup {
  title: string;
  ids: string[];
}

export interface MapLayout {
  nodes: {[id: string]: NodePosition};
  edges: Edge[];
  width: number;
  height: number;
  /** Distance between neighbouring cells of a destinations grid. */
  cell?: {width: number; height: number};
  /** The destination groups of a destinations grid, in authored order. */
  destinations?: DestinationGroup[];
}
