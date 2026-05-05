import {useReactFlow} from '@xyflow/react';
import React from 'react';

import {useClipboard} from '../context';
import {newBackZIndex, newFrontZIndex} from '../utils/stacking';

import ActionsGroup from './ActionsGroup';

interface NodeActionsGroupProps {
  nodeId: string;
}

export default function NodeActionsGroup({nodeId}: NodeActionsGroupProps) {
  const {deleteElements, updateNode, updateNodeData, getNodes, getEdges} =
    useReactFlow();
  const {duplicateNode} = useClipboard();
  return (
    <ActionsGroup
      onDelete={() => deleteElements({nodes: [{id: nodeId}]})}
      onLock={() => updateNodeData(nodeId, {locked: true})}
      onBringToFront={() => {
        const items = [...getNodes(), ...getEdges()];
        updateNode(nodeId, {zIndex: newFrontZIndex(items, nodeId)});
      }}
      onSendToBack={() => {
        const items = [...getNodes(), ...getEdges()];
        updateNode(nodeId, {zIndex: newBackZIndex(items, nodeId)});
      }}
      onDuplicate={() => duplicateNode(nodeId)}
    />
  );
}
