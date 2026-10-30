import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type OnConnect,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import React, {DragEvent, useCallback, useRef} from 'react';

import '@xyflow/react/dist/style.css';

import {type MyNode} from '../../flow/flowNodes';

import CustomSmoothStepConnectionLine from './CustomSmoothStepConnectionLine';
import {DataEdge} from './DataEdge';
import {DnDProvider, useDnD} from './DnDContext';
import AiNode from './nodes/AiNode';
import ConditionNode from './nodes/ConditionNode';
import ResultNode from './nodes/ResultNode';
import TextNode from './nodes/TextNode';
import WebNode from './nodes/WebNode';
import Sidebar from './Sidebar';

import './ReactFlow.css';

const nodeTypes = {
  ai: AiNode,
  condition: ConditionNode,
  text: TextNode,
  result: ResultNode,
  web: WebNode,
};

const edgeTypes = {
  'data-edge': DataEdge,
};

const initNodes: MyNode[] = [];
const initEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

const FlowLab: React.FunctionComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const reactFlowWrapper = useRef(null);
  const {screenToFlowPosition} = useReactFlow();
  const [type] = useDnD();

  const onConnect: OnConnect = useCallback(
    connection =>
      setEdges(eds =>
        addEdge({...connection, type: 'data-edge', data: {key: 'text'}}, eds)
      ),
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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let newNode: MyNode;
      switch (type) {
        case 'ai':
          newNode = {
            id: getId(),
            type: 'ai',
            position,
            data: {text: ''},
          };
          break;
        case 'condition':
          newNode = {
            id: getId(),
            type: 'condition',
            position,
            data: {text: ''},
          };
          break;
        case 'text':
          newNode = {
            id: getId(),
            type: 'text',
            position,
            data: {text: ''},
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
        case 'web':
          newNode = {
            id: getId(),
            type: 'web',
            position,
            data: {text: ''},
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
    <div className="flowlab">
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
          edgeTypes={edgeTypes}
          fitView
          connectionLineComponent={CustomSmoothStepConnectionLine}
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
      <FlowLab />
    </DnDProvider>
  </ReactFlowProvider>
);
