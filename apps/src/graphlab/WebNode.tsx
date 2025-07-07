import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
  type NodeProps,
  useReactFlow,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {isTextNode, type MyNode} from './initialElements';

function WebNode({id}: NodeProps) {
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

  const srcHtml: string =
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

  const srcDoc = srcHtml.substring(
    srcHtml.indexOf('<html>'),
    srcHtml.indexOf('</html>') + '</html>'.length
  );

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <iframe title="iframe" srcDoc={srcDoc} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(WebNode);
