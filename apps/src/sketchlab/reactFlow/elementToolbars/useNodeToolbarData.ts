import {useNodesData, useReactFlow, type Node} from '@xyflow/react';
import {useCallback} from 'react';

import {usePushSnapshot} from '../context';

// Subscribing to the store via `useNodesData` (rather than reading `data`
// from props) ensures selection-state swatches re-render even when a
// memoized ancestor skips re-rendering.
export function useNodeToolbarData<NodeType extends Node>(nodeId: string) {
  const {updateNodeData} = useReactFlow();
  const nodeData = useNodesData<NodeType>(nodeId);
  const data = (nodeData?.data ?? {}) as Partial<NodeType['data']>;
  const pushSnapshot = usePushSnapshot();

  const patchNodeData = useCallback(
    (patch: Partial<NodeType['data']>) => {
      pushSnapshot();
      updateNodeData(nodeId, patch);
    },
    [nodeId, pushSnapshot, updateNodeData]
  );

  return {data, patchNodeData};
}
