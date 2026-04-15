import {addEdge, MarkerType} from '@xyflow/react';
import React, {useCallback, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import type {TabOrderEntry} from '../utils/computeTabOrder';

/**
 * Pick source/target handles based on relative node positions so the arrow
 * points in a sensible direction.
 */
function pickHandles(
  source: SketchlabReactFlowNode,
  target: SketchlabReactFlowNode
) {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? {sourceHandle: 'right-source', targetHandle: 'left-target'}
      : {sourceHandle: 'left-source', targetHandle: 'right-target'};
  }
  return dy >= 0
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

interface UseKeyboardEdgeCreationOptions {
  nodes: SketchlabReactFlowNode[];
  tabOrder: TabOrderEntry[];
  focusEntry: (entry: TabOrderEntry) => void;
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
  tabOrder,
  focusEntry,
  setEdges,
  readOnly,
}: UseKeyboardEdgeCreationOptions) {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectAnnouncement, setConnectAnnouncement] = useState('');

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (readOnly) return;

      const target = e.target as HTMLElement;
      // Don't intercept non-Tab keys when the user is editing text content.
      const isEditing =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';
      if (isEditing && e.key !== 'Tab') {
        return;
      }

      // Determine which node or edge currently has focus.
      const nodeEl = target.closest('.react-flow__node');
      const edgeEl = target.closest('.react-flow__edge');
      const focusedEntry: TabOrderEntry | null = nodeEl
        ? {type: 'node', id: nodeEl.getAttribute('data-id')!}
        : edgeEl
        ? {type: 'edge', id: edgeEl.getAttribute('data-id')!}
        : null;
      const focusedNodeId =
        focusedEntry?.type === 'node' ? focusedEntry.id : undefined;

      // "c" toggles connect mode on/off (nodes only).
      if (e.key === 'c') {
        if (connectingFrom) {
          e.preventDefault();
          setConnectingFrom(null);
          setConnectAnnouncement('Connect mode cancelled.');
          return;
        }
        if (focusedNodeId) {
          e.preventDefault();
          const node = nodes.find(n => n.id === focusedNodeId);
          setConnectingFrom(focusedNodeId);
          setConnectAnnouncement(
            `Connect mode: ${
              node ? getNodeLabel(node) : focusedNodeId
            } selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
          );
        }
        return;
      }

      // Tab uses the computed logical tab order.
      if (e.key === 'Tab') {
        if (tabOrder.length === 0) return;
        const currentIdx = focusedEntry
          ? tabOrder.findIndex(
              e2 => e2.type === focusedEntry.type && e2.id === focusedEntry.id
            )
          : -1;
        const direction = e.shiftKey ? -1 : 1;

        if (connectingFrom) {
          // Connect mode: cycle through nodes only, wrap around.
          const nodeEntries = tabOrder.filter(e2 => e2.type === 'node');
          if (nodeEntries.length === 0) return;
          const curNodeIdx = focusedNodeId
            ? nodeEntries.findIndex(e2 => e2.id === focusedNodeId)
            : -1;
          const nextNodeIdx =
            (((curNodeIdx + direction + nodeEntries.length) %
              nodeEntries.length) +
              nodeEntries.length) %
            nodeEntries.length;
          e.preventDefault();
          focusEntry(nodeEntries[nextNodeIdx]);
          return;
        }

        // Normal mode: move through full order; escape at boundaries.
        if (focusedEntry) {
          const nextIdx = currentIdx + direction;
          if (nextIdx >= 0 && nextIdx < tabOrder.length) {
            e.preventDefault();
            focusEntry(tabOrder[nextIdx]);
          }
          // else: out of bounds -- let focus leave the canvas naturally.
          return;
        }
      }

      // Enter on a different node completes the connection.
      if (e.key === 'Enter' && connectingFrom) {
        if (focusedNodeId && focusedNodeId !== connectingFrom) {
          e.preventDefault();
          const sourceNode = nodes.find(n => n.id === connectingFrom);
          const targetNode = nodes.find(n => n.id === focusedNodeId);
          if (sourceNode && targetNode) {
            const handles = pickHandles(sourceNode, targetNode);
            setEdges(eds =>
              addEdge(
                {
                  source: connectingFrom,
                  target: focusedNodeId,
                  ...handles,
                  markerEnd: {type: MarkerType.ArrowClosed},
                },
                eds
              )
            );
            setConnectAnnouncement(
              `Edge created to ${getNodeLabel(targetNode)}.`
            );
          }
          setConnectingFrom(null);
        }
        return;
      }

      if (e.key === 'Escape' && connectingFrom) {
        e.preventDefault();
        setConnectingFrom(null);
        setConnectAnnouncement('Connect mode cancelled.');
        return;
      }

      // Enter on a focused node (outside connect mode) enters edit mode.
      if (e.key === 'Enter' && focusedNodeId) {
        const focusedNodeEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${focusedNodeId}"]`
        );
        const editable = focusedNodeEl?.querySelector<HTMLElement>(
          '[role="textbox"], button, input'
        );
        if (editable) {
          e.preventDefault();
          if (editable.tagName === 'BUTTON') {
            editable.click();
          } else {
            editable.focus();
          }
        }
      }
    },
    [connectingFrom, focusEntry, nodes, readOnly, setEdges, tabOrder]
  );

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
