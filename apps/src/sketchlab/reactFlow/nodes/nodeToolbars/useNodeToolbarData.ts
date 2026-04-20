import {useNodesData, useReactFlow} from '@xyflow/react';
import {useCallback} from 'react';

// Subscribing to the store via `useNodesData` (rather than reading `data`
// from props) ensures selection-state swatches re-render even when a
// memo-ized ancestor skips re-rendering.
export function useNodeToolbarData(nodeId: string) {
  const {updateNodeData} = useReactFlow();
  const nodeData = useNodesData(nodeId);
  const data: Record<string, unknown> = nodeData?.data ?? {};

  const patchNodeData = useCallback(
    (patch: Record<string, string | boolean>) => {
      updateNodeData(nodeId, patch);
    },
    [nodeId, updateNodeData]
  );

  return {data, patchNodeData};
}
