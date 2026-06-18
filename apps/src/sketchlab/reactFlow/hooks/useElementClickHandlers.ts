import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import type {ToolbarTarget} from '../context';
import type {TabOrderEntry} from '../utils/computeTabOrder';
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
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  // Tracks the last plain-clicked groupable target so the first Shift+click of
  // a fresh multi-selection can include it automatically. Standalone lines
  // contribute both of their lineAnchor node ids here.
  const multiSelectSeedRef = useRef<string[] | null>(null);

  // Resets multi-selection state without touching isGroupMode.
  const clearMultiSelect = useCallback(() => {
    setMultiSelectedNodeIds(new Set());
    multiSelectSeedRef.current = null;
  }, []);

  // Resets everything: exits group mode and clears selection.
  const clearSelection = useCallback(() => {
    setIsGroupMode(false);
    clearMultiSelect();
  }, [clearMultiSelect]);

  // Enters group mode: clears any existing selection, closes toolbar.
  const enterGroupMode = useCallback(() => {
    setIsGroupMode(true);
    clearMultiSelect();
    closeToolbar();
    setAriaAnnouncement(
      'Group mode. Tab to navigate, Enter to select or deselect, G to create group, Escape to cancel.'
    );
  }, [clearMultiSelect, closeToolbar]);

  // Exits group mode without creating a group.
  const exitGroupMode = useCallback(() => {
    setIsGroupMode(false);
    clearMultiSelect();
    setAriaAnnouncement('Exited group mode.');
  }, [clearMultiSelect]);

  // Toggles the focused element in/out of the group selection.
  // Used by the keyboard path (Enter key in group mode); no seed logic.
  const toggleEntryInGroupMode = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        const node = nodes.find(n => n.id === entry.id);
        if (
          !node ||
          isLineAnchorNodeId(entry.id, nodes) ||
          node.type === 'group' ||
          isGroupedChildNode(node) ||
          node.data?.locked
        ) {
          return;
        }
        setMultiSelectedNodeIds(prev => {
          const next = new Set(prev);
          if (next.has(entry.id)) {
            next.delete(entry.id);
          } else {
            next.add(entry.id);
          }
          return next;
        });
      } else if (entry.type === 'edge') {
        const edge = edges.find(e => e.id === entry.id);
        if (!edge || edge.data?.locked) return;
        const anchorIds = getStandaloneLineAnchorIds(edge, getNode);
        if (!anchorIds) return;
        const lineIsGrouped = anchorIds.some(id =>
          isGroupedChildNode(getNode(id))
        );
        if (lineIsGrouped) return;
        setMultiSelectedNodeIds(prev => {
          const next = new Set(prev);
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
      }
    },
    [nodes, edges, getNode]
  );

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

      // Plain click: exit group mode, record selection seed, clear any
      // multi-selection, open toolbar. Group nodes, grouped children, and
      // locked nodes get null seed.
      setIsGroupMode(false);
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

      // Plain click: exit group mode, record standalone ungrouped unlocked
      // line as selection seed.
      setIsGroupMode(false);
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
    isGroupMode,
    ariaAnnouncement,
    announceGroupMode: setAriaAnnouncement,
    enterGroupMode,
    exitGroupMode,
    toggleEntryInGroupMode,
    handleNodeClick,
    handleEdgeClick,
  };
}
