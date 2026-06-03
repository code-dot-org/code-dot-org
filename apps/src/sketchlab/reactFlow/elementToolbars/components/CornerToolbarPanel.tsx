import {Panel} from '@xyflow/react';
import React, {useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '@cdo/apps/sketchlab/reactFlow/constants';
import {useToolbarVisibility} from '@cdo/apps/sketchlab/reactFlow/context';
import {useLineToolbar} from '@cdo/apps/sketchlab/reactFlow/hooks/useLineToolbar';
import {isGroupNode} from '@cdo/apps/sketchlab/reactFlow/utils/grouping';

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
  selectedNodeIds: string[];
  onClearSelection: () => void;
  onGroupNodes: () => void;
  onUngroupNode: (groupId: string) => void;
}

/**
 * Renders the toolbar for the currently open node or edge, pinned to the
 * top-right corner of the canvas. Only one toolbar is visible at once,
 * driven by openToolbarTarget. Renders nothing when no element is open.
 */
export default function CornerToolbarPanel({
  nodes,
  edges,
  setNodes,
  setEdges,
  pushSnapshot,
  selectedNodeIds,
  onClearSelection,
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

  const body = useMemo(() => {
    if (selectedNodeIds.length > 1) {
      return (
        <MultiNodeSelectionToolbar
          selectedCount={selectedNodeIds.length}
          onClose={onClearSelection}
          onGroupNodes={onGroupNodes}
        />
      );
    }

    if (openToolbarTarget?.type === 'node') {
      const node = nodes.find(
        candidate => candidate.id === openToolbarTarget.id
      );
      if (node && isGroupNode(node)) {
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
    selectedNodeIds,
    onClearSelection,
    onGroupNodes,
    onUngroupNode,
  ]);

  if (!body) return null;

  return (
    <Panel position="top-right" className={SKETCHLAB_TOOLBAR_PANEL_CLASS}>
      {body}
    </Panel>
  );
}
