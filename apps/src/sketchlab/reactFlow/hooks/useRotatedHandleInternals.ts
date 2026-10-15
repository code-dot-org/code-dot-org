import {useNodeId, useUpdateNodeInternals} from '@xyflow/react';
import {useEffect} from 'react';

/**
 * Connection handles rotate with the node via a CSS transform on their
 * wrapper. React Flow only re-reads handle positions when a node's measured
 * dimensions change, which rotation doesn't. This triggers a re-read whenever rotation changes.
 */
export function useRotatedHandleInternals(rotation: number): void {
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (nodeId) {
      updateNodeInternals(nodeId);
    }
  }, [nodeId, rotation, updateNodeInternals]);
}
