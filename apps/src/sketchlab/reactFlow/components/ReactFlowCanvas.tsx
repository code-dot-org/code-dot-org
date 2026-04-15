import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type OnConnect,
} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  ReactFlowSource,
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from '../constants';
import ImageNode from '../nodes/ImageNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {ReactFlowSketchLabSources} from '../types';

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
  initialNodes: SketchlabReactFlowNode[];
  initialEdges: SketchlabReactFlowEdge[];
  initialViewport: ReactFlowSource['viewport'];
  colorMode: 'light' | 'dark';
  readOnly?: boolean;
}

export default function ReactFlowCanvas({
  updateSources,
  initialNodes,
  initialEdges,
  initialViewport,
  colorMode,
  readOnly = false,
}: ReactFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewport, setViewport] =
    useState<ReactFlowSource['viewport']>(initialViewport);

  const {screenToFlowPosition} = useReactFlow();
  const addedNodeCountRef = useRef(0);

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      const source: ReactFlowSource = {
        nodes: nodes as SketchlabReactFlowNode[],
        edges: edges as SketchlabReactFlowEdge[],
        viewport,
      };
      updateSources(prev => ({...prev, source}));
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

  const handleMoveEnd = useCallback(
    (_event: unknown, vp: ReactFlowSource['viewport']) => {
      setViewport(vp);
    },
    []
  );

  const handleAddNode = useCallback(
    (
      type: 'shape' | 'image' | 'text',
      data: SketchlabReactFlowNode['data']
    ) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNodeId = crypto.randomUUID();
      const newNode: SketchlabReactFlowNode = {
        id: newNodeId,
        type,
        position,
        data,
        // Text nodes auto-size to fit content; shapes and images use fixed defaults.
        ...(type !== 'text' && {
          style: {
            width: DEFAULT_NODE_WIDTH,
            height: DEFAULT_NODE_HEIGHT,
          },
        }),
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
      {!readOnly && <Toolbar onAddNode={handleAddNode} />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={NODE_TYPES}
        onMoveEnd={readOnly ? undefined : handleMoveEnd}
        defaultViewport={initialViewport}
        fitView={!initialViewport}
        colorMode={colorMode}
        deleteKeyCode={readOnly ? null : 'Delete'}
        proOptions={{hideAttribution: true}}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
