import {useStore} from '@xyflow/react';
import React, {useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {useSketchLabReadOnly, useToolbarVisibility} from '../context';
import {useLineToolbar} from '../hooks/useLineToolbar';
import {endpointFlowPositionFromState} from '../utils/lineAnchors';

import LineEdgeToolbar from './LineEdgeToolbar';

interface OpenLineEdgeToolbarProps {
  edges: SketchlabReactFlowEdge[];
  nodes: SketchlabReactFlowNode[];
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

/**
 * Renders the line-edge toolbar for the currently open line edge, anchored
 * at the leftmost endpoint with padding tuned to the visible handle.
 *
 * The anchor is the leftmost endpoint of the edge, so the toolbar sits on
 * the left side of the line. The padding accounts for the visible handle
 * circle, whose leftward overhang past the line endpoint differs by node
 * type and scales with zoom (handles live inside React Flow's transformed
 * pane). Holding the visible gap constant across zoom keeps the toolbar
 * the same apparent distance from the handle whatever the zoom level.
 */
export default function OpenLineEdgeToolbar({
  edges,
  nodes,
  setEdges,
}: OpenLineEdgeToolbarProps) {
  const readOnly = useSketchLabReadOnly();
  const {openToolbarTarget, openToolbar} = useToolbarVisibility();
  const {
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeLocked,
  } = useLineToolbar({
    edges,
    readOnly,
    openToolbarTarget,
    openToolbar,
    setEdges,
  });

  // Subscribe to zoom so we can scale the toolbar's right padding to
  // match the visible handle's on-screen size as zoom changes.
  const zoom = useStore(state => state.transform[2]);

  const anchor = useMemo(() => {
    if (!openLineEdge) return null;
    const sourceNode = nodes.find(node => node.id === openLineEdge.source);
    const targetNode = nodes.find(node => node.id === openLineEdge.target);
    if (!sourceNode || !targetNode) return null;
    const sourcePoint = endpointFlowPositionFromState(
      openLineEdge,
      'source',
      sourceNode
    );
    const targetPoint = endpointFlowPositionFromState(
      openLineEdge,
      'target',
      targetNode
    );
    const leftIsSource = sourcePoint.x <= targetPoint.x;
    const position = leftIsSource ? sourcePoint : targetPoint;
    const leftNode = leftIsSource ? sourceNode : targetNode;
    const leftIsLineAnchor = leftNode.type === 'lineAnchor';
    // How far the visible handle circle protrudes to the left of the line
    // endpoint, measured in CSS px BEFORE zoom is applied.
    let baseHandleOverhangLeftPx;
    if (!leftIsLineAnchor) {
      baseHandleOverhangLeftPx = 3;
    } else if (leftIsSource) {
      baseHandleOverhangLeftPx = 6;
    } else {
      baseHandleOverhangLeftPx = 0;
    }
    const visibleHandleOverhangLeftPx = baseHandleOverhangLeftPx * zoom;
    // Constant visible gap between the handle's left edge and the toolbar
    // at any zoom. 5 matches the gap NodeToolbar gives nodes at zoom=1.
    const VISIBLE_GAP_PX = 5;
    const anchorRightPaddingPx = visibleHandleOverhangLeftPx + VISIBLE_GAP_PX;
    return {position, anchorRightPaddingPx};
  }, [openLineEdge, nodes, zoom]);

  if (!openLineEdge || !anchor) return null;

  return (
    <LineEdgeToolbar
      edge={openLineEdge}
      anchorFlowPosition={anchor.position}
      anchorRightPaddingPx={anchor.anchorRightPaddingPx}
      onSelectColor={value => setLineEdgeColor(openLineEdge.id, value)}
      onSelectWidth={value => setLineEdgeWidth(openLineEdge.id, value)}
      onSelectStrokeStyle={value =>
        setLineEdgeStrokeStyle(openLineEdge.id, value)
      }
      onSelectArrowHeads={value =>
        setLineEdgeArrowHeads(openLineEdge.id, value)
      }
      onSetLocked={value => setLineEdgeLocked(openLineEdge.id, value)}
    />
  );
}
