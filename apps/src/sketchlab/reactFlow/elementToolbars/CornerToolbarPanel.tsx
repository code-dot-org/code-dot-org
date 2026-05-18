import {Panel} from '@xyflow/react';
import React, {useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '../constants';
import {useToolbarVisibility} from '../context';
import {useLineToolbar} from '../hooks/useLineToolbar';

import ImageNodeToolbar from './ImageNodeToolbar';
import LineEdgeToolbar from './LineEdgeToolbar';
import ShapeNodeToolbar from './ShapeNodeToolbar';
import TextNodeToolbar from './TextNodeToolbar';

interface CornerToolbarPanelProps {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

/**
 * Renders the toolbar for the currently open node or edge, pinned to the
 * top-right corner of the canvas. Only one toolbar is visible at once,
 * driven by openToolbarTarget. Renders nothing when no element is open.
 */
export default function CornerToolbarPanel({
  nodes,
  edges,
  setEdges,
}: CornerToolbarPanelProps) {
  const {openToolbarTarget} = useToolbarVisibility();
  const {
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeType,
    setLineEdgeLocked,
  } = useLineToolbar({edges, openToolbarTarget, setEdges});

  const body = useMemo(() => {
    if (openToolbarTarget?.type === 'node') {
      const node = nodes.find(
        candidate => candidate.id === openToolbarTarget.id
      );
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
