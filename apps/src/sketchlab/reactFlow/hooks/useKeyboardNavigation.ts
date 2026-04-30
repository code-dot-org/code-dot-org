import {useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
  KEYBOARD_RESIZE_STEP,
  KEYBOARD_MOVE_STEP,
} from '../constants';
import {
  entriesMatch,
  getElementForEntry,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';
import {isLineAnchorNodeId} from '../utils/connectionRules';
import {isLineEdge} from '../utils/lineEdges';
import {getNodeLabel} from '../utils/nodeLabel';

import {useAriaAnnouncer} from './useAriaAnnouncer';
import {useConnectMode} from './useConnectMode';

function moveNodesByDelta(
  currentNodes: SketchlabReactFlowNode[],
  nodeIds: string[],
  deltaX: number,
  deltaY: number
) {
  const nodeIdsToMove = new Set(nodeIds);
  return currentNodes.map(node =>
    nodeIdsToMove.has(node.id)
      ? {
          ...node,
          position: {
            x: node.position.x + deltaX,
            y: node.position.y + deltaY,
          },
        }
      : node
  );
}

/**
 * Resize a single node by adding `deltaWidth` and `deltaHeight` to its
 * dimensions, each clamped to the minimum node dimensions independently.
 */
function resizeNodeByDelta(
  currentNodes: SketchlabReactFlowNode[],
  nodeId: string,
  deltaWidth: number,
  deltaHeight: number
) {
  return currentNodes.map(node => {
    if (node.id !== nodeId) return node;
    const currentWidth = node.width ?? DEFAULT_NODE_WIDTH;
    const currentHeight = node.height ?? DEFAULT_NODE_HEIGHT;
    const newWidth = Math.max(MIN_NODE_WIDTH, currentWidth + deltaWidth);
    const newHeight = Math.max(MIN_NODE_HEIGHT, currentHeight + deltaHeight);
    return {...node, width: newWidth, height: newHeight};
  });
}

/**
 * Read a single-step arrow-key delta. Returns zeros for non-arrow keys.
 */
function getArrowDelta(key: string) {
  switch (key) {
    case 'ArrowLeft':
      return {deltaX: -KEYBOARD_MOVE_STEP, deltaY: 0};
    case 'ArrowRight':
      return {deltaX: KEYBOARD_MOVE_STEP, deltaY: 0};
    case 'ArrowUp':
      return {deltaX: 0, deltaY: -KEYBOARD_MOVE_STEP};
    case 'ArrowDown':
      return {deltaX: 0, deltaY: KEYBOARD_MOVE_STEP};
    default:
      return {deltaX: 0, deltaY: 0};
  }
}

interface UseKeyboardNavigationOptions {
  nodes: SketchlabReactFlowNode[];
  tabOrder: TabOrderEntry[];
  focusEntry: (entry: TabOrderEntry) => void;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  readOnly: boolean;
  openToolbar: (entry: TabOrderEntry, options?: {trapFocus?: boolean}) => void;
}

/**
 * Per-keystroke context shared between the dispatcher and individual
 * key handlers. Computed once at the top of `handleKeyDown` so each
 * handler reads the same view of focus and event state.
 */
interface KeyContext {
  event: React.KeyboardEvent;
  focusedEntry: TabOrderEntry | null;
  focusedNodeId: string | undefined;
  focusedEdgeId: string | undefined;
}

/**
 * Keyboard-driven edge creation and canvas key handling.
 *
 * Press "c" on a focused node to enter connect mode, Tab to cycle through
 * candidate target nodes, Enter to create the edge. Escape or "c" again
 * cancels. "[" and "]" resize the focused node by adjusting its width and
 * height by the keyboard resize step.
 * Also handles Tab-based navigation in normal mode and Enter to
 * activate a node's editable content.
 *
 * Each key handler below returns true when it handled the event so the
 * dispatcher stops walking the list. Returning true does NOT imply
 * preventDefault/stopPropagation were called: the Tab boundary case
 * lets the browser move focus out, and Enter-edit lets React Flow run
 * its own selection logic. Each handler owns its own propagation calls.
 */
export function useKeyboardNavigation({
  nodes,
  tabOrder,
  focusEntry,
  setNodes,
  setEdges,
  readOnly,
  openToolbar,
}: UseKeyboardNavigationOptions) {
  const {getEdge, getNode} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const {announcement: connectAnnouncement, announce} = useAriaAnnouncer();
  const {connectingFrom, startConnect, cancelConnect, completeConnect} =
    useConnectMode({nodes, setEdges, announce});

  const handleTabNavigation = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEntry, focusedNodeId} = keyContext;
      if (event.key !== 'Tab') return false;
      if (tabOrder.length === 0) return true;

      const tabDirection = event.shiftKey ? -1 : 1;

      if (connectingFrom) {
        // Connect mode: cycle through nodes only, wrap around.
        const nodeEntries = tabOrder.filter(entry => entry.type === 'node');
        if (nodeEntries.length === 0) return true;
        const curNodeIdx = focusedNodeId
          ? nodeEntries.findIndex(entry => entry.id === focusedNodeId)
          : -1;
        const nextNodeIdx =
          (curNodeIdx + tabDirection + nodeEntries.length) % nodeEntries.length;
        event.preventDefault();
        event.stopPropagation();
        focusEntry(nodeEntries[nextNodeIdx]);
        return true;
      }

      // Normal mode: move through full order; escape at boundaries.
      if (!focusedEntry) return false;

      // Block ReactFlow's built-in Tab handler when focus is on a
      // node/edge (it conflicts with elementsSelectable=false in
      // read-only mode).
      event.stopPropagation();
      const currentIdx = tabOrder.findIndex(entry =>
        entriesMatch(entry, focusedEntry)
      );
      const nextIdx = currentIdx + tabDirection;
      if (nextIdx >= 0 && nextIdx < tabOrder.length) {
        event.preventDefault();
        focusEntry(tabOrder[nextIdx]);
      }
      // Boundary: no preventDefault lets the browser move focus out.
      return true;
    },
    [tabOrder, connectingFrom, focusEntry]
  );

  const handleEscapeCancelConnect = useCallback(
    (keyContext: KeyContext): boolean => {
      if (keyContext.event.key !== 'Escape' || !connectingFrom) return false;
      keyContext.event.preventDefault();
      keyContext.event.stopPropagation();
      cancelConnect();
      return true;
    },
    [connectingFrom, cancelConnect]
  );

  const handleOpenToolbar = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEntry} = keyContext;
      if (event.key !== 'e') return false;
      if (connectingFrom || !focusedEntry) return false;
      if (isLineAnchorNodeId(focusedEntry.id, nodes)) return false;
      event.preventDefault();
      openToolbar(focusedEntry, {trapFocus: true});
      return true;
    },
    [connectingFrom, nodes, openToolbar]
  );

  const handleConnectToggle = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (event.key !== 'c') return false;
      if (connectingFrom) {
        event.preventDefault();
        cancelConnect();
        return true;
      }
      if (focusedNodeId) {
        event.preventDefault();
        startConnect(focusedNodeId);
      }
      // Always consume "c" so it never falls through to other handlers.
      return true;
    },
    [connectingFrom, cancelConnect, startConnect]
  );

  const handleConnectComplete = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (event.key !== 'Enter' || !connectingFrom) return false;
      if (focusedNodeId && focusedNodeId !== connectingFrom) {
        event.preventDefault();
        event.stopPropagation();
        completeConnect(focusedNodeId);
      }
      // Enter while connecting always consumes the event, even with no
      // valid target — falling through to handleEnterEdit would re-enter
      // the source node's text edit on the same keystroke.
      return true;
    },
    [connectingFrom, completeConnect]
  );

  const handleMoveNode = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (!focusedNodeId) return false;
      const {deltaX, deltaY} = getArrowDelta(event.key);
      if (!deltaX && !deltaY) return false;
      event.preventDefault();
      event.stopPropagation();
      setNodes(currentNodes =>
        moveNodesByDelta(currentNodes, [focusedNodeId], deltaX, deltaY)
      );
      return true;
    },
    [setNodes]
  );

  const handleMoveEdge = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEdgeId} = keyContext;
      if (!focusedEdgeId) return false;
      const {deltaX, deltaY} = getArrowDelta(event.key);
      if (!deltaX && !deltaY) return false;
      const focusedEdge = getEdge(focusedEdgeId);
      if (!focusedEdge || !isLineEdge(focusedEdge, nodes)) return false;
      event.preventDefault();
      event.stopPropagation();
      setNodes(currentNodes =>
        moveNodesByDelta(
          currentNodes,
          [focusedEdge.source, focusedEdge.target],
          deltaX,
          deltaY
        )
      );
      return true;
    },
    [getEdge, nodes, setNodes]
  );

  /**
   * "[" and "]" decrease or increase the size of the focused node.
   * Line-anchor pseudo-nodes are excluded — they have no visible body
   * and are resized through 'ghost' nodes.
   * Modifier keys control the resize axis:
   *   No modifier → both width and height (uniform resize)
   *   Shift       → width only (horizontal)
   *   Alt         → height only (vertical)
   */
  const handleResize = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (!focusedNodeId) return false;
      if (event.code !== 'BracketLeft' && event.code !== 'BracketRight') {
        return false;
      }
      if (isLineAnchorNodeId(focusedNodeId, nodes)) return false;

      const focusedNode = getNode(focusedNodeId);
      const direction = (event.code === 'BracketRight' ? 1 : -1) as 1 | -1;
      const step = direction * KEYBOARD_RESIZE_STEP;
      const deltaWidth = event.altKey ? 0 : step;
      const deltaHeight = event.shiftKey ? 0 : step;

      event.preventDefault();
      event.stopPropagation();
      setNodes(currentNodes =>
        resizeNodeByDelta(currentNodes, focusedNodeId, deltaWidth, deltaHeight)
      );
      const nodeLabel = focusedNode ? getNodeLabel(focusedNode) : focusedNodeId;
      const axis = event.altKey ? 'height' : event.shiftKey ? 'width' : 'size';
      announce(
        `${nodeLabel} ${axis} ${direction > 0 ? 'enlarged' : 'shrunk'}.`
      );
      return true;
    },
    [nodes, getNode, setNodes, announce]
  );

  /**
   * Enter on a focused node (outside connect mode) enters edit mode.
   * Do NOT stopPropagation here: React Flow's handler needs to fire
   * to select the node, which enables arrow-key movement.
   */
  const handleEnterEdit = useCallback((keyContext: KeyContext): boolean => {
    const {event, focusedNodeId} = keyContext;
    if (event.key !== 'Enter' || !focusedNodeId) return false;
    const nodeEl = getElementForEntry({type: 'node', id: focusedNodeId});
    const editable = nodeEl?.querySelector<HTMLElement>(
      '[role="textbox"], button, input'
    );
    if (!editable) return false;
    event.preventDefault();
    if (editable.tagName === 'BUTTON') {
      editable.click();
    } else {
      editable.focus();
    }
    return true;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Don't intercept non-Tab keys when the user is editing text content.
      const isEditing =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';
      if (isEditing && event.key !== 'Tab') {
        return;
      }

      const focusedEntry = getEntryFromDOM(target);
      const keyContext: KeyContext = {
        event,
        focusedEntry,
        focusedNodeId:
          focusedEntry?.type === 'node' ? focusedEntry.id : undefined,
        focusedEdgeId:
          focusedEntry?.type === 'edge' ? focusedEntry.id : undefined,
      };

      // Tab navigation works in both read-only and edit mode.
      if (handleTabNavigation(keyContext)) return;

      // Escape cancels connect mode.
      if (handleEscapeCancelConnect(keyContext)) return;

      // Everything below mutates the canvas and requires edit access.
      if (readOnly) return;

      if (handleOpenToolbar(keyContext)) return;
      if (handleConnectToggle(keyContext)) return;
      if (handleConnectComplete(keyContext)) return;

      // All further interactions require an unlocked node, if a node is focused.
      if (
        keyContext.focusedNodeId &&
        getNode(keyContext.focusedNodeId)?.data?.locked
      ) {
        return;
      }

      if (handleMoveNode(keyContext)) return;
      if (handleMoveEdge(keyContext)) return;
      if (handleResize(keyContext)) return;
      handleEnterEdit(keyContext);
    },
    [
      readOnly,
      getNode,
      handleTabNavigation,
      handleEscapeCancelConnect,
      handleOpenToolbar,
      handleConnectToggle,
      handleConnectComplete,
      handleMoveNode,
      handleMoveEdge,
      handleResize,
      handleEnterEdit,
    ]
  );

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
