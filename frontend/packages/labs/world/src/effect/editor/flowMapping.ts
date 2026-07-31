import type {Edge, Node, XYPosition} from '@xyflow/react';

import {COMMENT_NODE_TYPE} from '../model/constants';
import type {
  EffectGraphNode,
  EffectGraphScope,
  EffectValueType,
} from '../model/types';
import {inputRowGhosts, outputGhost, type EffectGhost} from '../nodes/ghosts';
import type {EffectNodeRegistry} from '../nodes/registry';
import type {EffectNodeDefinition} from '../nodes/types';

import {portColor} from './portTypes';
import {deliveredType, swizzleLabel} from './swizzle';

/** React Flow node type keys registered by `EffectGraphCanvas`. */
export const FLOW_NODE_TYPE = 'effectNode';
export const FLOW_GHOST_TYPE = 'effectGhost';
export const FLOW_COMMENT_TYPE = 'effectComment';

/** Size a comment starts at, before anyone drags a corner. */
export const DEFAULT_COMMENT_SIZE = {width: 220, height: 96};
export const FLOW_EDGE_TYPE = 'effectEdge';

/**
 * Stacking order for the wire the learner is pointing at.
 *
 * React Flow's viewport layers — edges, edge labels, nodes — all sit at
 * `z-index: auto` and therefore stack in DOM order, with nodes last. Wires
 * belong under nodes at rest, but the one being interacted with does not: a
 * third of a long wire's length can pass behind node bodies, taking its delete
 * button and its own hit area with it.
 *
 * Only the active wire is raised, so the graph at rest still reads as nodes on
 * top of wiring. 1100 clears the 1000 React Flow gives a selected node.
 */
export const ACTIVE_EDGE_Z_INDEX = 1100;

export interface EffectFlowNodeData extends Record<string, unknown> {
  definition: EffectNodeDefinition;
  node: EffectGraphNode;
  inspected: boolean;
}

export interface EffectGhostNodeData extends Record<string, unknown> {
  ghost: EffectGhost;
}

export interface EffectCommentNodeData extends Record<string, unknown> {
  node: EffectGraphNode;
}

export type EffectFlowNode = Node<EffectFlowNodeData, typeof FLOW_NODE_TYPE>;
export type EffectGhostNode = Node<EffectGhostNodeData, typeof FLOW_GHOST_TYPE>;
export type EffectCommentNode = Node<
  EffectCommentNodeData,
  typeof FLOW_COMMENT_TYPE
>;
export type AnyEffectFlowNode =
  | EffectFlowNode
  | EffectGhostNode
  | EffectCommentNode;

/**
 * Project a document onto React Flow's node list.
 *
 * Ghosts come first so they paint underneath workspace nodes. Their positions
 * come from `ghostPositions`, computed by `usePinnedGhosts` from where the row
 * knobs are on screen — not from the document, which does not store them.
 * Until the rows have been measured a ghost has no position and is left out,
 * so nothing is drawn in the wrong place for a frame.
 */
export function toFlowNodes(
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  ghostPositions: ReadonlyMap<string, XYPosition>,
): AnyEffectFlowNode[] {
  const ghosts: AnyEffectFlowNode[] = [...inputRowGhosts(document), outputGhost]
    .filter(ghost => ghostPositions.has(ghost.id))
    .map(ghost => ({
      id: ghost.id,
      type: FLOW_GHOST_TYPE,
      position: ghostPositions.get(ghost.id) as XYPosition,
      draggable: false,
      selectable: false,
      deletable: false,
      data: {ghost},
    }));

  const workspace: AnyEffectFlowNode[] = [];
  for (const node of document.nodes) {
    const definition = registry.get(node.type);
    if (!definition) {
      // An unknown node type means a document this build cannot fully render.
      // The compiler reports it; skipping keeps the rest of the canvas usable.
      continue;
    }
    if (node.type === COMMENT_NODE_TYPE) {
      // A comment has no ports and no computation; it renders as its note.
      // Its box is explicit because it is resizable — React Flow needs a size
      // to hand the resizer, and the note reflows inside whatever it is given.
      workspace.push({
        id: node.id,
        type: FLOW_COMMENT_TYPE,
        position: node.position,
        // `width`/`height` rather than `style`: React Flow writes the resized
        // dimensions onto these fields, so the document has to overwrite the
        // same ones. Setting only `style` left the old measurement in place
        // and an undo could not shrink the box back.
        ...(node.size ?? DEFAULT_COMMENT_SIZE),
        data: {node},
      });
      continue;
    }

    workspace.push({
      id: node.id,
      type: FLOW_NODE_TYPE,
      position: node.position,
      data: {definition, node, inspected: node.inspected ?? false},
    });
  }

  return [...ghosts, ...workspace];
}

/**
 * Merge the document's view of the graph into the nodes React Flow is holding.
 *
 * React Flow keeps state on a node that it works out for itself — `measured`
 * from the DOM, plus `dragging` and `selected` — and rebuilding the array from
 * the document throws all of it away. Losing `measured` is what leaves a node
 * "not initialized", which breaks dragging it.
 *
 * Spreading the existing node first keeps that state; the document's
 * projection then supplies structure: type, data, and resting position.
 *
 * A node mid-drag keeps its live position. The document only learns where a
 * node landed on drag stop, so taking position from it during the gesture
 * would haul the node back to its old spot on every frame.
 */
export function reconcileFlowNodes(
  current: readonly AnyEffectFlowNode[],
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  ghostPositions: ReadonlyMap<string, XYPosition>,
): AnyEffectFlowNode[] {
  const existingById = new Map(current.map(node => [node.id, node]));

  return toFlowNodes(document, registry, ghostPositions).map(next => {
    const existing = existingById.get(next.id);
    if (!existing) {
      return next;
    }

    return {
      ...existing,
      ...next,
      position: existing.dragging ? existing.position : next.position,
      // Same reasoning as `position` during a drag: the document does not
      // learn the new size until the resize ends, so folding it back in
      // mid-gesture would snap the box to its old dimensions every frame.
      ...(existing.resizing
        ? {width: existing.width, height: existing.height}
        : {}),
    } as AnyEffectFlowNode;
  });
}

/**
 * Stroke for the wire a compile error is about.
 *
 * Deliberately not the pink used for vec4 (`#ff8fa3`) — a vec4 wire is
 * healthy, and the error wire must not read as one. The dash pattern carries
 * the same signal without relying on color at all.
 */
export const ERROR_EDGE_STROKE = 'var(--effect-editor-error)';

export interface EdgeViewState {
  /** Edges the learner has clicked. Selected edges answer to the delete key. */
  selectedIds?: ReadonlySet<string>;
  /** The edge under the pointer, if any. */
  hoveredId?: string | null;
  /**
   * Concrete value type per edge id, from the last successful compile. A wire
   * with an entry here draws in its type's color — the same color as the port
   * dots and row knobs — so a value can be followed across the graph by hue.
   */
  wireTypes?: ReadonlyMap<string, EffectValueType>;
  /** The wire the current compile error is about, if it is about one. */
  errorEdgeId?: string | null;
}

/**
 * Project a document's wires onto React Flow's edge list.
 *
 * Selection has to be applied here rather than left to React Flow. `edges` is
 * a controlled prop, so React Flow never writes selection back into it —
 * ignoring the `select` change means no edge is ever selected, and the delete
 * key has nothing to act on.
 */
export function toFlowEdges(
  document: EffectGraphScope,
  {selectedIds, hoveredId, wireTypes, errorEdgeId}: EdgeViewState = {},
): Edge[] {
  return document.edges.map(edge => {
    const selected = selectedIds?.has(edge.id) ?? false;
    // "Active" is what puts the delete button on screen: the wire is either
    // being pointed at or has been picked.
    const active = selected || edge.id === hoveredId;
    const errored = edge.id === errorEdgeId;

    // A typed wire keeps its type color even while active — recoloring on
    // hover would break the very association the colors exist to build.
    // Untyped wires (a failed compile, an unknown node) fall back to the
    // accent when active so interaction feedback never disappears. An error
    // outranks both: the wire being wrong is the one thing it must show.
    // A narrowed wire is drawn in the color of what it *delivers*, not what
    // it left with: following a value by hue is the whole point, and after
    // the swizzle this wire really is carrying a number. The source dot keeps
    // its own type color, so the change of hue at the dot is the visible
    // signal that something was taken out.
    const sourceType = wireTypes?.get(edge.id);
    const {swizzle} = edge.source;
    const typeColor =
      sourceType !== undefined ? deliveredType(sourceType, swizzle) : undefined;
    const stroke = errored
      ? ERROR_EDGE_STROKE
      : typeColor !== undefined
        ? portColor(typeColor)
        : active
          ? 'var(--effect-editor-accent)'
          : undefined;

    return {
      id: edge.id,
      source: edge.source.node,
      sourceHandle: edge.source.port,
      target: edge.target.node,
      targetHandle: edge.target.port,
      type: FLOW_EDGE_TYPE,
      selected,
      data: {
        active,
        // The badge names the components taken. Spelled for the learner from
        // the *source* type — RGBA off a color, XYZW off a coordinate.
        swizzleLabel:
          swizzle && sourceType !== undefined
            ? swizzleLabel(sourceType, swizzle)
            : swizzle?.toUpperCase(),
        swizzleColor:
          typeColor !== undefined ? portColor(typeColor) : undefined,
      },
      // Lifts the whole wire — stroke, hit area, and delete button — clear of
      // any node it happens to run behind. An errored wire is raised for the
      // same reason: it must be visible to be fixable.
      zIndex: active || errored ? ACTIVE_EDGE_Z_INDEX : undefined,
      style: {
        strokeWidth: active || errored ? 3 : 2,
        stroke,
        // Colored wires rest slightly dimmed so the hovered one still pops.
        strokeOpacity: active || errored ? 1 : 0.75,
        // The dash is the color-independent half of the error signal.
        strokeDasharray: errored ? '7 4' : undefined,
      },
    };
  });
}
