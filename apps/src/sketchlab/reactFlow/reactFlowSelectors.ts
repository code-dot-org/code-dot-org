/**
 * Class names and data-attributes that @xyflow/react renders onto its own DOM.
 *
 * None of these are part of the library's documented public API, so a version
 * bump could rename them and silently break the focus, snapping, snapshot, and
 * toolbar-positioning code that queries for them. reactFlowSelectorsTest.tsx
 * tests that the library still renders the expected names.
 */

// Bare class names (no leading dot), as found on `element.className` /
// `classList`. Use REACT_FLOW_SELECTOR.* when you need a CSS selector string.
export const REACT_FLOW_CLASS = {
  /** Outer flow container. */
  container: 'react-flow',
  /** Transformed pane holding all nodes/edges; the element we snapshot. */
  viewport: 'react-flow__viewport',
  /** Wrapper around each node. Carries `data-id`. */
  node: 'react-flow__node',
  /** Wrapper around each edge. Carries `data-id`. */
  edge: 'react-flow__edge',
  /** The drawn path inside an edge wrapper. */
  edgePath: 'react-flow__edge-path',
  /** Connection point on a node. Carries `data-nodeid` / `data-handleid`. */
  handle: 'react-flow__handle',
  /** Bottom-right zoom/fit controls panel. */
  controls: 'react-flow__controls',
  /** A button inside the controls panel. */
  controlsButton: 'react-flow__controls-button',
  /** Path element of the in-progress connection line. */
  connectionPath: 'react-flow__connection-path',
} as const;

// React Flow appends `react-flow__node-<type>` for every node type registered
// in NODE_TYPES (e.g. `react-flow__node-lineAnchor`).
export const reactFlowNodeTypeClass = (nodeType: string): string =>
  `${REACT_FLOW_CLASS.node}-${nodeType}`;

// `.`-prefixed selectors for the common closest()/querySelector() calls.
export const REACT_FLOW_SELECTOR = {
  container: `.${REACT_FLOW_CLASS.container}`,
  viewport: `.${REACT_FLOW_CLASS.viewport}`,
  node: `.${REACT_FLOW_CLASS.node}`,
  edge: `.${REACT_FLOW_CLASS.edge}`,
  handle: `.${REACT_FLOW_CLASS.handle}`,
  controls: `.${REACT_FLOW_CLASS.controls}`,
} as const;

// Helper classes React Flow looks for on descendants to opt them out of the
// corresponding canvas interaction.
export const REACT_FLOW_INTERACTION_CLASS = {
  noDrag: 'nodrag',
  noPan: 'nopan',
  noWheel: 'nowheel',
} as const;

/** Selector for a specific node wrapper by its React Flow id. */
export const reactFlowNodeSelector = (id: string): string =>
  `${REACT_FLOW_SELECTOR.node}[data-id="${CSS.escape(id)}"]`;

/** Selector for a specific edge wrapper by its React Flow id. */
export const reactFlowEdgeSelector = (id: string): string =>
  `${REACT_FLOW_SELECTOR.edge}[data-id="${CSS.escape(id)}"]`;

/** Selector for the drawn path of the edge with the given id. */
export const reactFlowEdgePathSelector = (id: string): string =>
  `${reactFlowEdgeSelector(id)} .${REACT_FLOW_CLASS.edgePath}`;

/** Selector for every handle belonging to the node with the given id. */
export const reactFlowHandlesByNodeSelector = (nodeId: string): string =>
  `${REACT_FLOW_SELECTOR.handle}[data-nodeid="${CSS.escape(nodeId)}"]`;
