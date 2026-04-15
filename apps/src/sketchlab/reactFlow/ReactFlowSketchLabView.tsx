import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {LabProps, LevelProperties} from '@cdo/apps/lab2/types';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';

import Toolbar from './components/Toolbar';
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from './constants';
import ImageNode from './nodes/ImageNode';
import ShapeNode from './nodes/ShapeNode';
import {ImageNodeData, ReactFlowSketchLabSources, ShapeNodeData} from './types';

import styles from './ReactFlowSketchLabView.module.scss';

export const REACT_FLOW_DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

const NODE_TYPES = {
  shape: ShapeNode,
  image: ImageNode,
};

// Offset added per new node so they don't stack exactly on top of each other.
const NEW_NODE_STAGGER_PX = 20;

function ReactFlowSketchLabViewInner(_props: LabProps<LevelProperties>) {
  const {currentSources, updateSources} =
    useSources<ReactFlowSketchLabSources>();

  const initialSource = currentSources.source ?? {};
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (initialSource.nodes as Node[]) ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (initialSource.edges as Edge[]) ?? []
  );
  const [viewport, setViewport] = useState<Viewport | undefined>(
    initialSource.viewport
  );

  const {screenToFlowPosition} = useReactFlow();

  // Track how many nodes have been added this session to stagger placement.
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
    (type: 'shape' | 'image', data: ShapeNodeData | ImageNodeData) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: data as unknown as Node['data'],
        style: {
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        },
      };

      setNodes(nds => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className={styles.container}>
      <Toolbar onAddNode={handleAddNode} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        onMoveEnd={handleMoveEnd}
        defaultViewport={viewport}
        fitView={!viewport}
        deleteKeyCode="Delete"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function ReactFlowSketchLabView(
  props: LabProps<LevelProperties>
) {
  return (
    <ReactFlowProvider>
      <ReactFlowSketchLabViewInner {...props} />
    </ReactFlowProvider>
  );
}
