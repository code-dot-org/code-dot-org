import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Position,
  Handle,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useEffect, useRef, useState, useCallback} from 'react';

import AiTutor2Manager from '@cdo/apps/lab2/ai/AiTutor2Manager';

import {isTextNode, type MyNode} from './initialElements';

function AskChatNode({
  id,
  data,
}: NodeProps<Node<{fieldText: string; askedText: string; text: string}>>) {
  const {updateNodeData} = useReactFlow();
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );
  const textNodes = nodesData.filter(isTextNode);

  const [isWorking, setIsWorking] = useState(false);

  const [lastContextString, setLastContextString] = useState<
    string | undefined
  >(undefined);

  const contextString =
    textNodes.length > 0
      ? textNodes
          .map(({data}) => (data && 'text' in data ? data.text : ''))
          .join('')
      : 'none';

  const text: string =
    'Here is the context: ' +
    contextString +
    ' And here is the request: ' +
    data.fieldText;

  const managerRef = useRef<AiTutor2Manager | null>(
    new AiTutor2Manager(undefined, '', 0, '')
  );

  const onEnter = useCallback(() => {
    const askChat = async () => {
      if (text === '') {
        console.warn('No text data available to ask chat');
        updateNodeData(id, {
          text: '',
        });
        return;
      }

      updateNodeData(id, {
        askedText: data.fieldText,
      });

      console.log('Ask chat:', text);

      setIsWorking(true);

      const response = await managerRef.current?.askAiTutor2(text, '', 'hint');
      const responseText =
        response && response.length > 1 ? response[1].chatMessageText : '';
      console.log('Chat responded: ', responseText);
      updateNodeData(id, {
        text: responseText,
      });

      setIsWorking(false);
    };

    askChat();
  }, [data.fieldText, id, text, updateNodeData]);

  // Also requery if the input nodes' values change.
  useEffect(() => {
    console.log('context:', contextString);
    if (lastContextString !== contextString) {
      onEnter();
      setLastContextString(contextString);
    }
  }, [contextString, lastContextString, onEnter]);

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        /*isConnectable={connections.length === 0}*/
      />
      <div>
        ask chat{' '}
        {isWorking && (
          <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
        )}
        {data.fieldText !== data.askedText && ' *'}
      </div>
      <textarea
        onChange={evt => updateNodeData(id, {fieldText: evt.target.value})}
        onKeyDown={event => {
          if (event.key === 'Enter' && event.shiftKey) {
            onEnter();
            event.preventDefault();
          }
        }}
        value={data.fieldText}
        className="reactflow-textarea"
        rows={10}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(AskChatNode);
