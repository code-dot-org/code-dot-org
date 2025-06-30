import {
  Position,
  Handle,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useEffect, useRef} from 'react';

import AiTutor2Manager from '@cdo/apps/lab2/ai/AiTutor2Manager';

import {isTextNode, type MyNode} from './initialElements';

function AskChat({id}: NodeProps) {
  const {updateNodeData} = useReactFlow();
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const textNode = isTextNode(nodesData) ? nodesData : null;

  const managerRef = useRef<AiTutor2Manager | null>(
    new AiTutor2Manager('', 0, '')
  );

  useEffect(() => {
    const askChat = async () => {
      if (
        !textNode ||
        !textNode.data ||
        !textNode.data.text ||
        typeof textNode.data.text !== 'string'
      ) {
        console.warn('No text data available to ask chat');
        updateNodeData(id, {
          text: '',
        });
        return;
      }

      console.log('Ask chat:', textNode?.data.text);

      const response = await managerRef.current?.askAiTutor2(
        textNode?.data.text || '',
        '',
        'hint'
      );
      const responseText =
        response && response.length >= 1 ? response[1].chatMessageText : '';
      console.log('Chat responded: ', responseText);
      updateNodeData(id, {
        text: responseText,
      });
    };

    askChat();
  }, [id, textNode, updateNodeData]);

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connections.length === 0}
      />
      <div>ask chat</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(AskChat);
