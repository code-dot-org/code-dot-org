import {addEdge, useReactFlow} from '@xyflow/react';
import {useCallback, useEffect, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {canCreateConnection} from '../utils/connectionRules';
import {defaultLineEdgeFields} from '../utils/lineEdges';
import {getNodeLabel} from '../utils/nodeLabel';

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

interface UseConnectModeOptions {
  nodes: SketchlabReactFlowNode[];
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  announce: (message: string) => void;
  pushSnapshot: () => void;
}

/**
 * Keyboard-driven edge creation. Tracks the source node a user has
 * picked with "c" and provides start/cancel/complete callbacks.
 * Announcements are emitted via the caller-provided `announce` so the
 * keyboard hook can share one aria-live region for connect and resize.
 */
export function useConnectMode({
  nodes,
  setEdges,
  announce,
  pushSnapshot,
}: UseConnectModeOptions) {
  const {getNode} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Cancel connect mode when the source node is deleted out from under us.
  useEffect(() => {
    if (connectingFrom && !nodes.some(node => node.id === connectingFrom)) {
      setConnectingFrom(null);
      announce('Connect mode cancelled.');
    }
  }, [connectingFrom, nodes, announce]);

  const startConnect = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      setConnectingFrom(nodeId);
      announce(
        `Connect mode: ${
          node ? getNodeLabel(node) : nodeId
        } selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
      );
    },
    [getNode, announce]
  );

  const cancelConnect = useCallback(() => {
    setConnectingFrom(null);
    announce('Connect mode cancelled.');
  }, [announce]);

  const completeConnect = useCallback(
    (targetNodeId: string) => {
      if (!connectingFrom || targetNodeId === connectingFrom) return;
      const sourceNode = getNode(connectingFrom);
      const targetNode = getNode(targetNodeId);
      if (!sourceNode || !targetNode) {
        setConnectingFrom(null);
        return;
      }
      if (!canCreateConnection(connectingFrom, targetNodeId, nodes)) {
        announce(
          'Connection not created. Line endpoints cannot accept additional connections.'
        );
        setConnectingFrom(null);
        return;
      }
      const handles = pickHandles(sourceNode, targetNode);
      pushSnapshot();
      setEdges(currentEdges => {
        if (!canCreateConnection(connectingFrom, targetNodeId, nodes)) {
          return currentEdges;
        }
        return addEdge(
          {
            id: createUuid(),
            source: connectingFrom,
            target: targetNodeId,
            ...handles,
            ...defaultLineEdgeFields(),
          },
          currentEdges
        );
      });
      announce(`Edge created to ${getNodeLabel(targetNode)}.`);
      setConnectingFrom(null);
    },
    [connectingFrom, getNode, nodes, pushSnapshot, setEdges, announce]
  );

  return {
    connectingFrom,
    startConnect,
    cancelConnect,
    completeConnect,
  };
}
