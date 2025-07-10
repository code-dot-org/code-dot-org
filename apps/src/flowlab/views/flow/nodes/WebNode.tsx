import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
  type NodeProps,
  useReactFlow,
  NodeResizer,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {isTextNode, type MyNode} from '../../../flow/initialElements';

function WebNode({id, selected}: NodeProps) {
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );
  const textNodes = nodesData.filter(isTextNode);
  const {updateNodeData} = useReactFlow();

  useEffect(() => {
    window.addEventListener('message', function (event) {
      if (typeof event.data === 'string') {
        console.log('Message received from the child: ' + event.data); // Message received from child
        updateNodeData(id, {text: event.data});
      }
    });
  }, [id, updateNodeData]);

  const srcDoc: string =
    textNodes.length > 0
      ? textNodes
          .map(({data}) => (data && 'text' in data ? data.text : ''))
          .join('')
      : 'none';

  /*
  const el = document.createElement('div');
  el.innerHTML = srcHtml;
  const srcDoc = el.getElementsByTagName('body')[0].textContent;
*/

  /*
  const parser = new DOMParser();
  const doc = parser.parseFromString(srcHtml, 'text/html');
  const srcDoc = doc.body.innerHTML;
  */

  /*const srcDoc = srcHtml.substring(
    srcHtml.indexOf('<html>'),
    srcHtml.indexOf('</html>') + '</html>'.length
  );*/

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
