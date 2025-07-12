import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Position,
  Handle,
  useReactFlow,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useEffect, useState} from 'react';

import askAi from '../../../flow/askAi';
import {useInputTexts} from '../../../flow/flowNodes';

// This node asks the aichat service a question entered in its input field, and
// sends the response to its output handle as text.  It acepts optional context
// via any text sent to its input handle.  It makes a new request whenever
// shift-enter is pressed while its input has focus, and whenever its input
// context changes.

function AiNode({
  id,
  data,
}: NodeProps<Node<{fieldText: string; askedText: string}>>) {
  const {updateNodeData} = useReactFlow();
  const contextString = useInputTexts().join('\n');

  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    (async () => {
      // Assume that asked text has just been set (in the case that
      // shift-enter was pressed), or the context changed so we're using the
      // last asked text.)  If there is none, then set the output to be empty.
      if (!data.askedText || data.askedText === '') {
        console.log('No text data available to ask chat');
        updateNodeData(id, {
          text: '',
        });
        return;
      }

      setIsWorking(true);

      const text: string =
        'Here is the context: \n' +
        contextString +
        '\nAnd here is the request: \n' +
        data.askedText;
      console.log('Ask chat:', text);

      const response = await askAi(text);
      console.log('Chat responded: ', response);

      const responseText =
        response && response.length > 1 ? response[1].chatMessageText : '';
      updateNodeData(id, {
        text: responseText,
      });

      setIsWorking(false);
    })();
  }, [contextString, data.askedText, id, updateNodeData]);

  // This doesn't use useCallback because a dependency on data.fieldText
  // would trigger an AI request every time the user types in the input field.
  const onEnter = () => {
    updateNodeData(id, {
      askedText: data.fieldText,
    });
  };

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        /*isConnectable={connections.length === 0}*/
      />
      <div>
        AI {data.fieldText !== data.askedText && ' *'}
        {isWorking && (
          <FontAwesomeV6Icon iconName="spinner" animationType="spin" />
        )}
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

export default memo(AiNode);
