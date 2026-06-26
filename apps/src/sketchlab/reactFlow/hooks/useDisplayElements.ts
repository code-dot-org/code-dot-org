import classNames from 'classnames';
import React, {useMemo} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import type {TabOrderEntry} from '../utils/computeTabOrder';
import {getEdgeLabel} from '../utils/elementLabel';
import {isGroupedChildNode} from '../utils/grouping';

import styles from '../components/react-flow-canvas.module.scss';

interface UseDisplayElementsOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  activeEntry: TabOrderEntry | null;
  nodeOrEdgeFocused: boolean;
  lastFocusedEntry: TabOrderEntry | null;
  connectingFrom: string | null;
  readOnly: boolean;
  grabMode: boolean;
  focusEntry: (entry: TabOrderEntry) => void;
  handleEdgeMouseDown: (
    event: React.MouseEvent,
    edge: SketchlabReactFlowEdge
  ) => void;
  multiSelectedNodeIds: Set<string>;
}

export function useDisplayElements({
  nodes,
  edges,
  activeEntry,
  nodeOrEdgeFocused,
  lastFocusedEntry,
  connectingFrom,
  readOnly,
  grabMode,
  focusEntry,
  handleEdgeMouseDown,
  multiSelectedNodeIds,
}: UseDisplayElementsOptions) {
  return useMemo(() => {
    // Anchor endpoints of a locked edge inherit the lock so the user can't
    // drag them around. Real-node endpoints have their own lock state.
    const lockedLineAnchorIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.data?.locked !== true) return;
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      if (sourceNode?.type === 'lineAnchor') {
        lockedLineAnchorIds.add(edge.source);
      }
      if (targetNode?.type === 'lineAnchor') {
        lockedLineAnchorIds.add(edge.target);
      }
    });

    const applyDisplayProps = (item: {id: string}, type: 'node' | 'edge') => {
      const isTabTarget =
        !grabMode && activeEntry?.type === type && activeEntry.id === item.id;
      const isSelected =
        !grabMode &&
        nodeOrEdgeFocused &&
        lastFocusedEntry?.type === type &&
        lastFocusedEntry.id === item.id;
      return {
        selected: isSelected && !readOnly,
        domAttributes: {tabIndex: isTabTarget ? 0 : -1},
      };
    };

    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Assign a 1-based index to each free-floating line (both endpoints are
    // anchors) so the screenreader can distinguish them: "Line 1", "Line 2".
    let floatingLineCount = 0;
    const floatingLineIndex = new Map<string, number>();
    edges.forEach(edge => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (
        (!src || src.type === 'lineAnchor') &&
        (!tgt || tgt.type === 'lineAnchor')
      ) {
        floatingLineIndex.set(edge.id, ++floatingLineCount);
      }
    });

    // Endpoint handles on line anchor nodes are shown via a CSS class when
    // the associated edge is focused.
    const focusedEdgeId =
      nodeOrEdgeFocused && lastFocusedEntry?.type === 'edge'
        ? lastFocusedEntry.id
        : null;
    const focusedEdgeEndpointIds = new Set<string>();
    if (focusedEdgeId) {
      const focusedEdge = edges.find(e => e.id === focusedEdgeId);
      if (focusedEdge) {
        focusedEdgeEndpointIds.add(focusedEdge.source);
        focusedEdgeEndpointIds.add(focusedEdge.target);
      }
    }

    return {
      displayNodes: nodes.map(node => {
        const isConnectSource = connectingFrom === node.id;
        const {selected: singleSelected, domAttributes} = applyDisplayProps(
          node,
          'node'
        );
        const selected = singleSelected || multiSelectedNodeIds.has(node.id);
        const locked =
          node.data?.locked === true || lockedLineAnchorIds.has(node.id);
        const groupedChild = isGroupedChildNode(node);
        const isAnchorForFocusedEdge =
          node.type === 'lineAnchor' && focusedEdgeEndpointIds.has(node.id);
        return {
          ...node,
          selected,
          // Derive draggable/connectable/deletable from locked/read-only/grouped state
          draggable: !locked && !readOnly && !groupedChild && !grabMode,
          deletable: !locked && !readOnly && !groupedChild && !grabMode,
          // Nodes are still connectable when locked, but not in read-only or grab mode
          connectable: !readOnly && !grabMode,
          // Override React Flow's default "{type} node" aria-label on the
          // wrapper div for line anchors so it reads as "Line endpoint" instead
          // of "Line endpoint node".
          ...(node.type === 'lineAnchor' && {ariaLabel: 'Line endpoint'}),
          className: classNames(
            isConnectSource && styles.connectSource,
            isAnchorForFocusedEdge && styles.lineAnchorOnFocusedEdge
          ),
          domAttributes: {
            ...domAttributes,
            ...(isConnectSource && {'aria-selected': true}),
          },
        };
      }),
      displayEdges: edges.map(edge => {
        const locked = edge.data?.locked === true;
        const {selected: singleSelected, domAttributes} = applyDisplayProps(
          edge,
          'edge'
        );
        // A standalone line (both endpoints are line anchors) is shown as
        // selected when both its anchors are in the multi-selection.
        const bothAnchorsSelected =
          nodeMap.get(edge.source)?.type === 'lineAnchor' &&
          nodeMap.get(edge.target)?.type === 'lineAnchor' &&
          multiSelectedNodeIds.has(edge.source) &&
          multiSelectedNodeIds.has(edge.target);
        const selected = singleSelected || bothAnchorsSelected;

        return {
          ...edge,
          selected,
          deletable: !locked && !readOnly && !grabMode,
          ariaLabel: getEdgeLabel(
            edge,
            nodeMap,
            floatingLineIndex.get(edge.id)
          ),
          className: styles.lineEdge,
          domAttributes: {
            ...domAttributes,
            ...(!readOnly && !locked
              ? {
                  onMouseDown: (event: React.MouseEvent) => {
                    focusEntry({type: 'edge', id: edge.id});
                    handleEdgeMouseDown(event, edge);
                  },
                }
              : {}),
          },
        };
      }),
    };
  }, [
    nodes,
    edges,
    activeEntry?.type,
    activeEntry?.id,
    nodeOrEdgeFocused,
    lastFocusedEntry?.type,
    lastFocusedEntry?.id,
    connectingFrom,
    readOnly,
    grabMode,
    focusEntry,
    handleEdgeMouseDown,
    multiSelectedNodeIds,
  ]);
}
