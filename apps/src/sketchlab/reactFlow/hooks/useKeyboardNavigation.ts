import {addEdge, MarkerType, useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

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
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';
import {
  canCreateConnection,
  isLineAnchorNodeId,
} from '../utils/connectionRules';
import {isLineEdge} from '../utils/lineEdges';

/**
 * Pick source/target handles based on relative node positions so the arrow
 * points in a sensible direction.
 */
function pickHandles(
  source: SketchlabReactFlowNode,
  target: SketchlabReactFlowNode
) {
  const deltaX = target.position.x - source.position.x;
  const deltaY = target.position.y - source.position.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0
      ? {sourceHandle: 'right-source', targetHandle: 'left-target'}
      : {sourceHandle: 'left-source', targetHandle: 'right-target'};
  }
  return deltaY >= 0
    ? {sourceHandle: 'bottom-source', targetHandle: 'top-target'}
    : {sourceHandle: 'top-source', targetHandle: 'bottom-target'};
}

function getNodeLabel(node: SketchlabReactFlowNode): string {
  if (node.type === 'shape' && node.data.label) {
    return node.data.label;
  }
  if (node.type === 'text' && node.data.text) {
    return node.data.text;
  }
  return node.type;
}

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
 * Resize a single node by adding `delta` to both its width and height,
 * clamped to the minimum node dimensions. The node's measured dimensions
 * (set by NodeResizer on drag) are used as the base; DEFAULT_NODE_* values
 * are the fallback when the node has not been measured yet.
 */
function resizeNodeByDelta(
  currentNodes: SketchlabReactFlowNode[],
  nodeId: string,
  delta: number
) {
  return currentNodes.map(node => {
    if (node.id !== nodeId) return node;
    const currentWidth = node.width ?? DEFAULT_NODE_WIDTH;
    const currentHeight = node.height ?? DEFAULT_NODE_HEIGHT;
    const newWidth = Math.max(MIN_NODE_WIDTH, currentWidth + delta);
    const newHeight = Math.max(MIN_NODE_HEIGHT, currentHeight + delta);
    return {...node, width: newWidth, height: newHeight};
  });
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
 * Keyboard-driven edge creation and canvas key handling.
 *
 * Press "c" on a focused node to enter connect mode, Tab to cycle through
 * candidate target nodes, Enter to create the edge. Escape or "c" again
 * cancels. "[" and "]" resize the focused node by the same step size for shapes and images.
 * Text-only nodes step through font sizes.
 * Also handles Tab-based navigation in normal mode and Enter to
 * activate a node's editable content.
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
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectAnnouncement, setConnectAnnouncement] = useState('');
  // Counter appended to announcements so identical consecutive strings
  // still trigger an aria-live update.
  const announceCountRef = useRef(0);

  function announce(message: string) {
    announceCountRef.current += 1;
    // Append a non-visible token so React always sees a new string.
    setConnectAnnouncement(
      `${message}\u00A0`.repeat(1).trimEnd() +
        '\u200B'.repeat(announceCountRef.current % 2 === 0 ? 1 : 2)
    );
  }

  // Cancel connect mode when the source node is deleted.
  useEffect(() => {
    if (connectingFrom && !nodes.some(n => n.id === connectingFrom)) {
      setConnectingFrom(null);
      announce('Connect mode cancelled.');
    }
  }, [connectingFrom, nodes]);

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
      const focusedNodeId =
        focusedEntry?.type === 'node' ? focusedEntry.id : undefined;
      const focusedEdgeId =
        focusedEntry?.type === 'edge' ? focusedEntry.id : undefined;

      // Tab navigation works in both read-only and edit mode and uses the computed tab order.
      // We stopPropagation so React Flow's built-in Tab handler (which cycles
      // nodes in array order) never fires.
      if (event.key === 'Tab') {
        if (tabOrder.length === 0) return;
        const currentIdx = focusedEntry
          ? tabOrder.findIndex(tabEntry => entriesMatch(tabEntry, focusedEntry))
          : -1;
        const tabDirection = event.shiftKey ? -1 : 1;

        if (connectingFrom) {
          // Connect mode: cycle through nodes only, wrap around.
          const nodeEntries = tabOrder.filter(
            tabEntry => tabEntry.type === 'node'
          );
          if (nodeEntries.length === 0) return;
          const curNodeIdx = focusedNodeId
            ? nodeEntries.findIndex(tabEntry => tabEntry.id === focusedNodeId)
            : -1;
          const nextNodeIdx =
            (curNodeIdx + tabDirection + nodeEntries.length) %
            nodeEntries.length;
          event.preventDefault();
          event.stopPropagation();
          focusEntry(nodeEntries[nextNodeIdx]);
          return;
        }

        // Normal mode: move through full order; escape at boundaries.
        if (focusedEntry) {
          // Block ReactFlow's built-in Tab handler when focus is on a
          // node/edge (it conflicts with elementsSelectable=false in
          // read-only mode).
          event.stopPropagation();
          const nextIdx = currentIdx + tabDirection;
          if (nextIdx >= 0 && nextIdx < tabOrder.length) {
            event.preventDefault();
            focusEntry(tabOrder[nextIdx]);
          }
          // Boundary: no preventDefault lets the browser move focus out.
          return;
        }
      }

      // Escape cancels connect mode.
      if (event.key === 'Escape' && connectingFrom) {
        event.preventDefault();
        event.stopPropagation();
        setConnectingFrom(null);
        announce('Connect mode cancelled.');
        return;
      }

      // Everything below mutates the canvas and requires edit access.
      if (readOnly) return;

      // Arrow keys on a focused node move just that node.
      if (focusedNodeId) {
        let deltaX = 0;
        let deltaY = 0;
        if (event.key === 'ArrowLeft') deltaX = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowRight') deltaX = KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowUp') deltaY = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowDown') deltaY = KEYBOARD_MOVE_STEP;

        if (deltaX || deltaY) {
          event.preventDefault();
          event.stopPropagation();
          setNodes(currentNodes =>
            moveNodesByDelta(currentNodes, [focusedNodeId], deltaX, deltaY)
          );
          return;
        }
      }

      // Arrow keys on a focused line edge move the whole line by moving
      // both line-anchor nodes together.
      if (focusedEdgeId) {
        let deltaX = 0;
        let deltaY = 0;
        if (event.key === 'ArrowLeft') deltaX = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowRight') deltaX = KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowUp') deltaY = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowDown') deltaY = KEYBOARD_MOVE_STEP;

        if (deltaX || deltaY) {
          const focusedEdge = getEdge(focusedEdgeId);
          if (focusedEdge && isLineEdge(focusedEdge, nodes)) {
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
            return;
          }
        }
      }

      // "[" and "]" adjust the focused node. Text-only nodes step through
      // font sizes; shape and image nodes resize their dimensions.
      // Line-anchor pseudo-nodes are excluded — they have no visible body.
      if (
        focusedNodeId &&
        !isLineAnchorNodeId(focusedNodeId, nodes) &&
        (event.key === '[' || event.key === ']')
      ) {
        const focusedNode = getNode(focusedNodeId);
        const direction = (event.key === ']' ? 1 : -1) as 1 | -1;

        // Shape and image nodes: resize dimensions.
        event.preventDefault();
        event.stopPropagation();
        setNodes(currentNodes =>
          resizeNodeByDelta(
            currentNodes,
            focusedNodeId,
            direction * KEYBOARD_RESIZE_STEP
          )
        );
        const nodeLabel = focusedNode
          ? getNodeLabel(focusedNode)
          : focusedNodeId;
        announce(`${nodeLabel} ${direction > 0 ? 'enlarged' : 'shrunk'}.`);

        return;
      }

      // "e" opens the node/line/image toolbar. ToolbarShell's FocusTrap
      // moves focus to the first tabbable item when isVisible flips.
      if (
        event.key === 'e' &&
        !connectingFrom &&
        focusedEntry &&
        !isLineAnchorNodeId(focusedEntry.id, nodes)
      ) {
        event.preventDefault();
        openToolbar(focusedEntry, {trapFocus: true});
        return;
      }

      // "c" toggles connect mode on/off (nodes only).
      if (event.key === 'c') {
        if (connectingFrom) {
          event.preventDefault();
          setConnectingFrom(null);
          announce('Connect mode cancelled.');
          return;
        }
        if (focusedNodeId) {
          event.preventDefault();
          const node = getNode(focusedNodeId);
          setConnectingFrom(focusedNodeId);
          announce(
            `Connect mode: ${
              node ? getNodeLabel(node) : focusedNodeId
            } selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
          );
        }
        return;
      }

      // Enter on a different node completes the connection.
      if (event.key === 'Enter' && connectingFrom) {
        if (focusedNodeId && focusedNodeId !== connectingFrom) {
          event.preventDefault();
          event.stopPropagation();
          const sourceNode = getNode(connectingFrom);
          const targetNode = getNode(focusedNodeId);
          if (sourceNode && targetNode) {
            const handles = pickHandles(sourceNode, targetNode);
            const connectionRejected = !canCreateConnection(
              connectingFrom,
              focusedNodeId,
              nodes
            );
            if (connectionRejected) {
              announce(
                'Connection not created. Line endpoints cannot accept additional connections.'
              );
            } else {
              setEdges(currentEdges => {
                if (
                  !canCreateConnection(connectingFrom, focusedNodeId, nodes)
                ) {
                  return currentEdges;
                }
                return addEdge(
                  {
                    source: connectingFrom,
                    target: focusedNodeId,
                    ...handles,
                    markerEnd: {type: MarkerType.ArrowClosed},
                  },
                  currentEdges
                );
              });
              announce(`Edge created to ${getNodeLabel(targetNode)}.`);
            }
          }
          setConnectingFrom(null);
        }
        return;
      }

      // Enter on a focused node (outside connect mode) enters edit mode.
      // Do NOT stopPropagation here: React Flow's handler needs to fire
      // to select the node, which enables arrow-key movement.
      if (event.key === 'Enter' && focusedNodeId) {
        const focusedNodeElement = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${focusedNodeId}"]`
        );
        const editable = focusedNodeElement?.querySelector<HTMLElement>(
          '[role="textbox"], button, input'
        );
        if (editable) {
          event.preventDefault();
          if (editable.tagName === 'BUTTON') {
            editable.click();
          } else {
            editable.focus();
          }
        }
      }
    },
    [
      connectingFrom,
      focusEntry,
      getEdge,
      getNode,
      nodes,
      openToolbar,
      readOnly,
      setEdges,
      setNodes,
      tabOrder,
    ]
  );

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
