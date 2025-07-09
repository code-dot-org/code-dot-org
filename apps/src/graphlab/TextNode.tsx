import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import React, {memo, useCallback} from 'react';

function TextNode({
  id,
  data,
}: NodeProps<Node<{fieldText: string; text: string}>>) {
  const {updateNodeData} = useReactFlow();

  const onEnter = useCallback(() => {
    updateNodeData(id, {
      text: data.fieldText,
    });
  }, [data.fieldText, id, updateNodeData]);

  return (
    <div>
      <div>Input {data.fieldText !== data.text && ' *'}</div>
      <div>
        <input
          onChange={evt => updateNodeData(id, {fieldText: evt.target.value})}
          value={data.fieldText || ''}
          className="xy-theme__input"
          onKeyDown={event => {
            if (event.key === 'Enter' && event.shiftKey) {
              onEnter();
              event.preventDefault();
            }
          }}
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(TextNode);
