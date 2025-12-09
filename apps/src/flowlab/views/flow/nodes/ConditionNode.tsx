import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {useInputTexts} from '../../../flow/flowNodes';

// This node compares the text sent to its input handle to the text in its
// text field, and sends a comparison result to its output handle as text.
// The intent is that execution of the chain does not continue in the negative
// case.

function ConditionNode({id, data}: NodeProps<Node<{checkText: string}>>) {
  const {updateNodeData} = useReactFlow();
  const inputText = useInputTexts().join('\n');

  useEffect(() => {
    const updateValue = inputText.includes(data.checkText)
      ? 'yes - keep running this chain'
      : 'no - stop running this chain';

    updateNodeData(id, {
      text: updateValue,
    });
  }, [data.checkText, id, inputText, updateNodeData]);

  return (
    <div>
      <div>condition {id}</div>
      <div>
        <input
          onChange={evt => updateNodeData(id, {checkText: evt.target.value})}
          value={data.checkText || ''}
          className="xy-theme__input"
        />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ConditionNode);
