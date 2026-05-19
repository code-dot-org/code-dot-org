import {useReactFlow} from '@xyflow/react';
import React from 'react';

import {useClipboard, usePushSnapshot} from '../context';
import {newBackZIndex, newFrontZIndex} from '../utils/stacking';

import ActionsGroup from './ActionsGroup';

interface NodeActionsGroupProps {
  nodeId: string;
}

export default function NodeActionsGroup({nodeId}: NodeActionsGroupProps) {
  const {deleteElements, updateNode, updateNodeData, getNodes, getEdges} =
    useReactFlow();
  const {duplicateNode} = useClipboard();
  const pushSnapshot = usePushSnapshot();
  return (
    <ActionsGroup
      onDelete={() => deleteElements({nodes: [{id: nodeId}]})}
      onLock={() => updateNodeData(nodeId, {locked: true})}
      onBringToFront={() => {
        pushSnapshot();
        const items = [...getNodes(), ...getEdges()];
        updateNode(nodeId, {zIndex: newFrontZIndex(items, nodeId)});
      }}
      onSendToBack={() => {
        pushSnapshot();
        const items = [...getNodes(), ...getEdges()];
        updateNode(nodeId, {zIndex: newBackZIndex(items, nodeId)});
      }}
      onDuplicate={() => duplicateNode(nodeId)}
    />
  );
}
