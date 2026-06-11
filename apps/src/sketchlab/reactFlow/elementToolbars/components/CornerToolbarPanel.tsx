import {Panel} from '@xyflow/react';
import React, {useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '@cdo/apps/sketchlab/reactFlow/constants';
import {useToolbarVisibility} from '@cdo/apps/sketchlab/reactFlow/context';
import {useLineToolbar} from '@cdo/apps/sketchlab/reactFlow/hooks/useLineToolbar';

import GroupNodeToolbar from '../GroupNodeToolbar';
import ImageNodeToolbar from '../ImageNodeToolbar';
import LineEdgeToolbar from '../LineEdgeToolbar';
import MultiNodeSelectionToolbar from '../MultiNodeSelectionToolbar';
import ShapeNodeToolbar from '../ShapeNodeToolbar';
import TextNodeToolbar from '../TextNodeToolbar';

interface CornerToolbarPanelProps {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  pushSnapshot: () => void;
  multiSelectedNodeIds: string[];
  onGroupNodes: () => void;
  onUngroupNode: (groupId: string) => void;
}

/**
 * Renders the toolbar for the currently open node or edge, pinned to the
 * top-right corner of the canvas. Only one toolbar is visible at once.
 * Multi-selection (2+ nodes) takes priority and shows the group toolbar.
 */
export default function CornerToolbarPanel({
  nodes,
  edges,
  setNodes,
  setEdges,
  pushSnapshot,
  multiSelectedNodeIds,
  onGroupNodes,
  onUngroupNode,
}: CornerToolbarPanelProps) {
  const {openToolbarTarget} = useToolbarVisibility();
  const {
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeRotation,
    setLineEdgeType,
    setLineEdgeLocked,
  } = useLineToolbar({
    nodes,
    edges,
    setNodes,
    openToolbarTarget,
    setEdges,
    pushSnapshot,
  });

  // Count logical groupable elements: regular nodes as 1 each, standalone-line
  // anchor pairs as 1 (each line adds 2 lineAnchor IDs to the selection).
  // Already-grouped and locked nodes are excluded.
  const groupableCount = useMemo(() => {
    let anchors = 0;
    let nonAnchors = 0;
    for (const id of multiSelectedNodeIds) {
      const node = nodes.find(n => n.id === id);
      if (!node || node.parentId || node.data?.locked) continue;
      if (node.type === 'lineAnchor') anchors++;
      else nonAnchors++;
    }
    return nonAnchors + anchors / 2;
  }, [multiSelectedNodeIds, nodes]);

  const body = useMemo(() => {
    // Multi-selection takes priority: show group button when 2+ logical elements.
    if (groupableCount >= 2) {
      return <MultiNodeSelectionToolbar onGroup={onGroupNodes} />;
    }

    if (openToolbarTarget?.type === 'node') {
      const node = nodes.find(
        candidate => candidate.id === openToolbarTarget.id
      );
      if (node?.type === 'group') {
        return (
          <GroupNodeToolbar
            nodeId={node.id}
            onUngroup={() => onUngroupNode(node.id)}
          />
        );
      }
      if (node?.type === 'shape') {
        return <ShapeNodeToolbar nodeId={node.id} />;
      }
      if (node?.type === 'image') {
        return <ImageNodeToolbar nodeId={node.id} />;
      }
      if (node?.type === 'text') {
        return <TextNodeToolbar nodeId={node.id} />;
      }
      return null;
    }
    if (openToolbarTarget?.type === 'edge' && openLineEdge) {
      return (
        <LineEdgeToolbar
          edge={openLineEdge}
          onSelectColor={value => setLineEdgeColor(openLineEdge.id, value)}
          onSelectWidth={value => setLineEdgeWidth(openLineEdge.id, value)}
          onSelectStrokeStyle={value =>
            setLineEdgeStrokeStyle(openLineEdge.id, value)
          }
          onSelectArrowHeads={value =>
            setLineEdgeArrowHeads(openLineEdge.id, value)
          }
          onSelectRotation={value =>
            setLineEdgeRotation(openLineEdge.id, value)
          }
          onSetLocked={value => setLineEdgeLocked(openLineEdge.id, value)}
          onSelectEdgeType={value => setLineEdgeType(openLineEdge.id, value)}
        />
      );
    }
    return null;
  }, [
    groupableCount,
    onGroupNodes,
    onUngroupNode,
    openToolbarTarget,
    nodes,
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeRotation,
    setLineEdgeLocked,
    setLineEdgeType,
  ]);

  if (!body) return null;

  return (
    <Panel position="top-right" className={SKETCHLAB_TOOLBAR_PANEL_CLASS}>
      {body}
    </Panel>
  );
}
