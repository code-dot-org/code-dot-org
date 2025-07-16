import {
  Handle,
  Position,
  type NodeProps,
  NodeResizer,
  useReactFlow,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {useInputTexts} from '../../../flow/flowNodes';

// This node renders HTML sent to its input node as text in an iframe.
// It is able to send a message received from its iframe to its output handle.

function WebNode({id, selected}: NodeProps) {
  const {updateNodeData} = useReactFlow();
  const srcDoc = useInputTexts().join('\n');

  // Handles a message sent from the iframe, and sends its content to the output.
  useEffect(() => {
    window.addEventListener('message', function (event) {
      if (typeof event.data === 'string') {
        console.log('Message received from the child: ' + event.data); // Message received from child
        updateNodeData(id, {text: event.data});
      }
    });
  }, [id, updateNodeData]);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      <Handle type="target" position={Position.Left} />
      <div>Web</div>
      <iframe
        title="iframe"
        srcDoc={srcDoc}
        style={{width: '100%', height: 'calc(100% - 20px)'}}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(WebNode);
