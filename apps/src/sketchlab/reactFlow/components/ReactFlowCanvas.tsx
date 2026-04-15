import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type Viewport,
} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from '../constants';
import ImageNode from '../nodes/ImageNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {
  ImageNodeData,
  ReactFlowSketchLabSources,
  ShapeNodeData,
  TextNodeData,
} from '../types';

import Toolbar from './Toolbar';

import styles from './react-flow-canvas.module.scss';

const NODE_TYPES = {
  shape: ShapeNode,
  image: ImageNode,
  text: TextNode,
};

// Offset added per new node so they don't stack exactly on top of each other.
const NEW_NODE_STAGGER_PX = 20;

export interface ReactFlowCanvasProps {
  updateSources: ReturnType<
    typeof useSources<ReactFlowSketchLabSources>
  >['updateSources'];
  initialNodes: Node[];
  initialEdges: Edge[];
  initialViewport: Viewport | undefined;
  colorMode: 'light' | 'dark';
}

export default function ReactFlowCanvas({
  updateSources,
  initialNodes,
  initialEdges,
  initialViewport,
  colorMode,
}: ReactFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewport, setViewport] = useState<Viewport | undefined>(
    initialViewport
  );

  const {screenToFlowPosition} = useReactFlow();
  const addedNodeCountRef = useRef(0);

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      updateSources(prev => ({
        ...prev,
        source: {nodes, edges, viewport},
      }));
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [nodes, edges, viewport, updateSources]);

  const onConnect: OnConnect = useCallback(
    connection => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  );

  const handleMoveEnd = useCallback((_event: unknown, vp: Viewport) => {
    setViewport(vp);
  }, []);

  const handleAddNode = useCallback(
    (
      type: 'shape' | 'image' | 'text',
      data: ShapeNodeData | ImageNodeData | TextNodeData
    ) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNodeId = crypto.randomUUID();
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: data as unknown as Node['data'],
        style: {
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        },
      };

      setNodes(nds => [...nds, newNode]);

      // Move focus to the new node after React Flow renders it.
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(() => {
        const nodeEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${newNodeId}"]`
        );
        nodeEl?.focus();
      }, 100);
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className={styles.canvasContainer}>
      <Toolbar onAddNode={handleAddNode} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        onMoveEnd={handleMoveEnd}
        defaultViewport={initialViewport}
        fitView={!initialViewport}
        colorMode={colorMode}
        deleteKeyCode="Delete"
        proOptions={{hideAttribution: true}}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
