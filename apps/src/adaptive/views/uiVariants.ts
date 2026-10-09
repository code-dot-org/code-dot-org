// Running UI experiments for the map. The defaults here are what the map
// opens with; the UI Variants card changes them for the session, and one
// worth showing around gets promoted to a URL parameter.

import {createContext, useContext} from 'react';

export type EdgeShape = 'curve' | 'straight' | 'elbow';
export type LayoutMode = 'tree' | 'treeUp' | 'cluster' | 'radial' | 'honeycomb';
export type NodeShape = 'circle' | 'circleTitled' | 'square' | 'hexagon';

export interface UiVariants {
  /** Rows by dependency depth, a grid or honeycomb in authored order, or rings around the root. */
  layoutMode: LayoutMode;
  /** Draw every dependency edge, with nodes spaced to leave them room. Off, nodes pack closer. */
  showEdges: boolean;
  /** With edges off: straight lines from the selected checkpoint's requirements, over whatever is between. */
  showFocusEdges: boolean;
  /** S-curve, straight segment, or L-shaped (down, across, down). */
  edgeShape: EdgeShape;
  /** Edges into the selected checkpoint drawn heavier, in color, flowing. */
  highlightIncomingEdges: boolean;
  /** A circle with the title above it, or a circle, square or hexagon with the title inside. */
  nodeShape: NodeShape;
  /** The status icon as a small badge on the node's corner rather than at its center. */
  statusBadge: boolean;
}

export const DEFAULT_UI_VARIANTS: UiVariants = {
  layoutMode: 'radial',
  showEdges: false,
  showFocusEdges: true,
  edgeShape: 'elbow',
  highlightIncomingEdges: true,
  nodeShape: 'circle',
  statusBadge: false,
};

export const NODE_SHAPES: {value: NodeShape; text: string}[] = [
  {value: 'circle', text: 'Circle, title above'},
  {value: 'circleTitled', text: 'Circle, title inside'},
  {value: 'square', text: 'Square, title inside'},
  {value: 'hexagon', text: 'Hexagon, title inside'},
];

export const LAYOUT_MODES: {value: LayoutMode; text: string}[] = [
  {value: 'tree', text: 'Tree (rows by depth)'},
  {value: 'treeUp', text: 'Tree, bottom to top'},
  {value: 'cluster', text: 'Cluster (grid)'},
  {value: 'radial', text: 'Radial (rings from the start)'},
  {value: 'honeycomb', text: 'Honeycomb (hex tiling)'},
];

export const EDGE_SHAPES: {value: EdgeShape; text: string}[] = [
  {value: 'curve', text: 'Curved'},
  {value: 'straight', text: 'Straight'},
  {value: 'elbow', text: 'L-shaped'},
];

export interface UiVariantsState {
  variants: UiVariants;
  setVariant: <K extends keyof UiVariants>(
    key: K,
    value: UiVariants[K]
  ) => void;
}

export const UiVariantsContext = createContext<UiVariantsState>({
  variants: DEFAULT_UI_VARIANTS,
  setVariant: () => {},
});

export const useUiVariants = () => useContext(UiVariantsContext);
