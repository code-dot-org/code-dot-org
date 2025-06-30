/* import React from 'react';

const GraphLab: React.FunctionComponent = () => {
  return <div>hello</div>;
};

export default GraphLab;
*/

import {
  ReactFlow,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  type Edge,
  type OnConnect,
} from '@xyflow/react';
import React, {useCallback, useEffect} from 'react';

import '@xyflow/react/dist/style.css';

import AskChat from './AskChat';
import {type MyNode} from './initialElements';
import ResultNode from './ResultNode';
import TextNode from './TextNode';
import UppercaseNode from './UppercaseNode';
import WebNode from './WebNode';

const nodeTypes = {
  text: TextNode,
  result: ResultNode,
  uppercase: UppercaseNode,
  askchat: AskChat,
  web: WebNode,
};

const initNodes: MyNode[] = [
  {
    id: '1',
    type: 'text',
    data: {
      text: 'can you make a web page with one input field and one button that says "click me" and when the button is pressed, call `window.parent.postMessage(message, "*");` where message is the content of the input field?  give the web page a nice light blue background.  No prefix and no backticks, please. Also, include the folowing text on the page, in small print below everything else: ',
    },
    position: {x: -100, y: -50},
  },
  {
    id: '2',
    type: 'text',
    data: {
      text: 'world',
    },
    position: {x: 0, y: 100},
  },
  /*
  {
    id: '3',
    type: 'uppercase',
    data: {text: ''},
    position: {x: 100, y: -100},
  },
  */
  {
    id: '3',
    type: 'askchat',
    data: {text: ''},
    position: {x: 100, y: -100},
  },
  /*
  {
    id: '4',
    type: 'result',
    data: {},
    position: {x: 300, y: -75},
  },*/
  {
    id: '4',
    type: 'web',
    data: {text: ''},
    position: {x: 300, y: -75},
  },
  {
    id: '5',
    type: 'askchat',
    data: {text: ''},
    position: {x: 750, y: 0},
  },
  {
    id: '6',
    type: 'text',
    data: {
      text: 'Can you think of the opposite to this?',
    },
    position: {x: 850, y: -100},
  },
  {
    id: '7',
    type: 'askchat',
    data: {text: ''},
    position: {x: 850, y: 0},
  },
  {
    id: '8',
    type: 'result',
    data: {},
    position: {x: 950, y: 0},
  },
  {
    id: '9',
    type: 'result',
    data: {},
    position: {x: 850, y: 100},
  },
];

const initEdges: Edge[] = [
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
  },
  {
    id: 'e4-1',
    source: '4',
    target: '5',
  },
  {
    id: 'e4-2',
    source: '5',
    target: '7',
  },
  {
    id: 'e4-',
    source: '6',
    target: '7',
  },
  {
    id: 'e4-4',
    source: '7',
    target: '8',
  },
  {
    id: 'e4-5',
    source: '5',
    target: '9',
  },
];

const GraphLab: React.FunctionComponent = () => {
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const onConnect: OnConnect = useCallback(
    connection => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default GraphLab;
