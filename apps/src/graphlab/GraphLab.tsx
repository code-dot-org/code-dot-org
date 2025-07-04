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
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import React, {useCallback, DragEvent, useRef} from 'react';

import '@xyflow/react/dist/style.css';

import AskChat from './AskChat';
import ConditionNode from './ConditionNode';
import {DnDProvider, useDnD} from './DnDContext';
import {type MyNode} from './initialElements';
import ResultNode from './ResultNode';
import Sidebar from './Sidebar';
import TextNode from './TextNode';
import UppercaseNode from './UppercaseNode';
import WebNode from './WebNode';

const nodeTypes = {
  text: TextNode,
  result: ResultNode,
  uppercase: UppercaseNode,
  askchat: AskChat,
  web: WebNode,
  condition: ConditionNode,
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

let id = 0;
const getId = () => `node_${id++}`;

const GraphLab: React.FunctionComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const reactFlowWrapper = useRef(null);
  const {screenToFlowPosition} = useReactFlow();
  const [type] = useDnD();

  const onConnect: OnConnect = useCallback(
    connection => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let newNode: MyNode;
      switch (type) {
        case 'text':
          newNode = {
            id: getId(),
            type: 'text',
            position,
            data: {text: 'hi'},
          };
          break;
        case 'result':
          newNode = {
            id: getId(),
            type: 'result',
            position,
            data: {},
          };
          break;
        case 'uppercase':
          newNode = {
            id: getId(),
            type: 'uppercase',
            position,
            data: {text: 'hi'},
          };
          break;
        case 'askchat':
          newNode = {
            id: getId(),
            type: 'askchat',
            position,
            data: {text: 'hi'},
          };
          break;
        case 'web':
          newNode = {
            id: getId(),
            type: 'web',
            position,
            data: {text: 'hi'},
          };
          break;
        case 'condition':
          newNode = {
            id: getId(),
            type: 'condition',
            position,
            data: {text: 'hi'},
          };
          break;
        default:
          // fallback for unknown types
          newNode = {
            id: getId(),
            type: 'text',
            position,
            data: {text: 'hi'},
          };
      }

      setNodes(nds => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, type]
  );

  /*
  const onDragStart = (event: DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  */

  return (
    <div className="graphlab">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          //onDragStart={onDragStart}
          onDragOver={onDragOver}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <GraphLab />
    </DnDProvider>
  </ReactFlowProvider>
);
