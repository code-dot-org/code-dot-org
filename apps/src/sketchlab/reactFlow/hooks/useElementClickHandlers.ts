import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import type {ToolbarTarget} from '../context';
import {isLineAnchorNodeId} from '../utils/connectionRules';
import {isGroupedChildNode} from '../utils/grouping';
import {getStandaloneLineAnchorIds} from '../utils/lineAnchors';

interface UseElementClickHandlersOptions {
  readOnly: boolean;
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  openToolbar: (target: ToolbarTarget, options?: {trapFocus?: boolean}) => void;
  closeToolbar: () => void;
}

export function useElementClickHandlers({
  readOnly,
  nodes,
  edges,
  openToolbar,
  closeToolbar,
}: UseElementClickHandlersOptions) {
  const {getNode} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();

  const [multiSelectedNodeIds, setMultiSelectedNodeIds] = useState<Set<string>>(
    () => new Set()
  );
  // Tracks the last plain-clicked groupable target so the first Shift+click of
  // a fresh multi-selection can include it automatically. Standalone lines
  // contribute both of their lineAnchor node ids here.
  const multiSelectSeedRef = useRef<string[] | null>(null);

  const clearSelection = useCallback(() => {
    setMultiSelectedNodeIds(new Set());
    multiSelectSeedRef.current = null;
  }, []);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: {id: string}) => {
      if (readOnly) return;
      const fullNode = nodes.find(n => n.id === node.id);
      const nodeType = fullNode?.type;
      if (isLineAnchorNodeId(node.id, nodes)) return;

      // Shift+click: toggle this node in the multi-selection. Group nodes,
      // already-grouped children, and locked nodes are excluded.
      if (event.shiftKey) {
        if (
          nodeType !== 'group' &&
          !isGroupedChildNode(fullNode) &&
          !fullNode?.data?.locked
        ) {
          setMultiSelectedNodeIds(prev => {
            const next = new Set(prev);
            // On the first Shift+click of a fresh selection, automatically include
            // the seed (last plain-clicked groupable target) so plain-click → Shift+click
            // selects two elements in one extra click, matching standard UX.
            // Skip seed entries that are already grouped or locked.
            if (next.size === 0) {
              multiSelectSeedRef.current?.forEach(seedId => {
                const seedNode = nodes.find(n => n.id === seedId);
                if (
                  seedId !== node.id &&
                  !isGroupedChildNode(seedNode) &&
                  !seedNode?.data?.locked
                ) {
                  next.add(seedId);
                }
              });
            }
            if (next.has(node.id)) {
              next.delete(node.id);
            } else {
              next.add(node.id);
            }
            return next;
          });
          closeToolbar();
        }
        // Excluded targets (group, grouped child, locked): silently ignore so
        // an in-progress multi-selection is not cleared.
        return;
      }

      // Plain click: record selection seed, clear any multi-selection, open toolbar.
      // Group nodes, grouped children, and locked nodes get null seed.
      multiSelectSeedRef.current =
        nodeType === 'group' ||
        isGroupedChildNode(fullNode) ||
        fullNode?.data?.locked
          ? null
          : [node.id];
      setMultiSelectedNodeIds(new Set());
      openToolbar({type: 'node', id: node.id}, {trapFocus: false});
    },
    [readOnly, openToolbar, closeToolbar, nodes]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: {id: string}) => {
      if (readOnly) return;
      const clickedEdge = edges.find(e => e.id === edge.id);
      const anchorIds = clickedEdge
        ? getStandaloneLineAnchorIds(clickedEdge, getNode)
        : null;
      // A standalone line that is grouped or locked cannot be re-grouped.
      const lineIsGrouped =
        anchorIds?.some(id => isGroupedChildNode(getNode(id))) ?? false;
      const lineIsLocked = clickedEdge?.data?.locked ?? false;

      if (event.shiftKey) {
        if (anchorIds && !lineIsGrouped && !lineIsLocked) {
          // Shift+click on a standalone line: toggle both lineAnchor nodes in
          // the multi-selection, applying the same seed-inclusion logic as nodes.
          setMultiSelectedNodeIds(prev => {
            const next = new Set(prev);
            if (next.size === 0) {
              multiSelectSeedRef.current?.forEach(seedId => {
                const seedNode = getNode(seedId);
                if (
                  !anchorIds.includes(seedId) &&
                  !isGroupedChildNode(seedNode) &&
                  !seedNode?.data?.locked
                )
                  next.add(seedId);
              });
            }
            const allSelected = anchorIds.every(id => next.has(id));
            anchorIds.forEach(id => {
              if (allSelected) {
                next.delete(id);
              } else {
                next.add(id);
              }
            });
            return next;
          });
          closeToolbar();
        }
        // Shift+click on an attached, grouped, or locked line: ignore.
        return;
      }

      // Plain click: record standalone, ungrouped, unlocked line as selection seed.
      multiSelectSeedRef.current =
        lineIsGrouped || lineIsLocked ? null : anchorIds;
      setMultiSelectedNodeIds(new Set());
      openToolbar({type: 'edge', id: edge.id}, {trapFocus: false});
    },
    [readOnly, edges, getNode, openToolbar, closeToolbar]
  );

  return {
    multiSelectedNodeIds,
    setMultiSelectedNodeIds,
    clearSelection,
    handleNodeClick,
    handleEdgeClick,
  };
}
