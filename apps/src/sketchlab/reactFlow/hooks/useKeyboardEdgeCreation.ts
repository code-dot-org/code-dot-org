import {addEdge, MarkerType} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  entriesMatch,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';

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
  return (
    (node.data?.label as string) ||
    (node.data?.text as string) ||
    node.type ||
    node.id
  );
}

function nodeHasAnyEdge(nodeId: string, edges: SketchlabReactFlowEdge[]) {
  return edges.some(edge => edge.source === nodeId || edge.target === nodeId);
}

function isLineAnchorNodeId(nodeId: string, nodes: SketchlabReactFlowNode[]) {
  const node = nodes.find(candidate => candidate.id === nodeId);
  return node?.type === 'lineAnchor' || node?.data?.isLineAnchor === true;
}

interface UseKeyboardEdgeCreationOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  tabOrder: TabOrderEntry[];
  focusEntry: (entry: TabOrderEntry) => void;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  readOnly: boolean;
}

/**
 * Keyboard-driven edge creation and canvas key handling.
 *
 * Press "c" on a focused node to enter connect mode, Tab to cycle through
 * candidate target nodes, Enter to create the edge. Escape or "c" again
 * cancels. Also handles Tab-based navigation in normal mode and Enter to
 * activate a node's editable content.
 */
export function useKeyboardEdgeCreation({
  nodes,
  edges,
  tabOrder,
  focusEntry,
  setNodes,
  setEdges,
  readOnly,
}: UseKeyboardEdgeCreationOptions) {
  const KEYBOARD_MOVE_STEP = 10;
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

      // Determine which node or edge currently has focus.
      const focusedEntry = getEntryFromDOM(target);
      const focusedNodeId =
        focusedEntry?.type === 'node' ? focusedEntry.id : undefined;
      const focusedEdgeId =
        focusedEntry?.type === 'edge' ? focusedEntry.id : undefined;

      // Arrow keys on a focused node move just that node.
      if (!readOnly && focusedNodeId) {
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
            currentNodes.map(node =>
              node.id === focusedNodeId
                ? {
                    ...node,
                    position: {
                      x: node.position.x + deltaX,
                      y: node.position.y + deltaY,
                    },
                  }
                : node
            )
          );
          return;
        }
      }

      // Arrow keys on a focused line edge move the whole line by moving
      // both line-anchor nodes together.
      if (!readOnly && focusedEdgeId) {
        let deltaX = 0;
        let deltaY = 0;
        if (event.key === 'ArrowLeft') deltaX = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowRight') deltaX = KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowUp') deltaY = -KEYBOARD_MOVE_STEP;
        if (event.key === 'ArrowDown') deltaY = KEYBOARD_MOVE_STEP;

        if (deltaX || deltaY) {
          const focusedEdge = edges.find(edge => edge.id === focusedEdgeId);
          if (
            focusedEdge &&
            isLineAnchorNodeId(focusedEdge.source, nodes) &&
            isLineAnchorNodeId(focusedEdge.target, nodes)
          ) {
            event.preventDefault();
            event.stopPropagation();
            setNodes(currentNodes =>
              currentNodes.map(node => {
                if (
                  node.id !== focusedEdge.source &&
                  node.id !== focusedEdge.target
                ) {
                  return node;
                }
                return {
                  ...node,
                  position: {
                    x: node.position.x + deltaX,
                    y: node.position.y + deltaY,
                  },
                };
              })
            );
            return;
          }
        }
      }

      // "c" toggles connect mode on/off (nodes only).
      if (event.key === 'c') {
        if (readOnly) return;
        if (connectingFrom) {
          event.preventDefault();
          setConnectingFrom(null);
          announce('Connect mode cancelled.');
          return;
        }
        if (focusedNodeId) {
          event.preventDefault();
          const node = nodes.find(candidate => candidate.id === focusedNodeId);
          setConnectingFrom(focusedNodeId);
          announce(
            `Connect mode: ${
              node ? getNodeLabel(node) : focusedNodeId
            } selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
          );
        }
        return;
      }

      // Tab uses the computed logical tab order. We stopPropagation so
      // React Flow's built-in Tab handler (which cycles nodes in array
      // order) never fires.
      if (event.key === 'Tab') {
        if (tabOrder.length === 0) return;
        const currentIdx = focusedEntry
          ? tabOrder.findIndex(tabEntry => entriesMatch(tabEntry, focusedEntry))
          : -1;
        const direction = event.shiftKey ? -1 : 1;

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
            (curNodeIdx + direction + nodeEntries.length) % nodeEntries.length;
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
          const nextIdx = currentIdx + direction;
          if (nextIdx >= 0 && nextIdx < tabOrder.length) {
            event.preventDefault();
            focusEntry(tabOrder[nextIdx]);
          }
          // Boundary: no preventDefault lets the browser move focus out.
          return;
        }
      }

      // Enter on a different node completes the connection.
      if (event.key === 'Enter' && !readOnly && connectingFrom) {
        if (focusedNodeId && focusedNodeId !== connectingFrom) {
          event.preventDefault();
          event.stopPropagation();
          const sourceNode = nodes.find(node => node.id === connectingFrom);
          const targetNode = nodes.find(node => node.id === focusedNodeId);
          if (sourceNode && targetNode) {
            const handles = pickHandles(sourceNode, targetNode);
            let connectionRejected = false;
            setEdges(currentEdges => {
              const sourceLimited = isLineAnchorNodeId(connectingFrom, nodes);
              const targetLimited = isLineAnchorNodeId(focusedNodeId, nodes);
              if (
                (sourceLimited &&
                  nodeHasAnyEdge(connectingFrom, currentEdges)) ||
                (targetLimited && nodeHasAnyEdge(focusedNodeId, currentEdges))
              ) {
                connectionRejected = true;
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
            if (connectionRejected) {
              announce(
                'Connection not created. Line endpoints may only have one edge.'
              );
            } else {
              announce(`Edge created to ${getNodeLabel(targetNode)}.`);
            }
          }
          setConnectingFrom(null);
        }
        return;
      }

      if (event.key === 'Escape' && connectingFrom) {
        event.preventDefault();
        event.stopPropagation();
        setConnectingFrom(null);
        announce('Connect mode cancelled.');
        return;
      }

      // Enter on a focused node (outside connect mode) enters edit mode.
      // Do NOT stopPropagation here: React Flow's handler needs to fire
      // to select the node, which enables arrow-key movement.
      if (event.key === 'Enter' && !readOnly && focusedNodeId) {
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
      edges,
      focusEntry,
      nodes,
      readOnly,
      setEdges,
      setNodes,
      tabOrder,
    ]
  );

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
