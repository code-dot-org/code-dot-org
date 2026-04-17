import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type OnConnect,
} from '@xyflow/react';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  SketchlabReactFlowSource,
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {createUuid} from '@cdo/apps/utils';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from '../constants';
import {SketchLabReadOnlyProvider} from '../context';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardEdgeCreation} from '../hooks/useKeyboardEdgeCreation';
import {useTabOrder} from '../hooks/useTabOrder';
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
const FOCUS_DELAY_MS = 100;

export interface ReactFlowCanvasProps {
  updateSources: ReturnType<
    typeof useSources<ReactFlowSketchLabSources>
  >['updateSources'];
  initialNodes: SketchlabReactFlowNode[];
  initialEdges: SketchlabReactFlowEdge[];
  initialViewport: SketchlabReactFlowSource['viewport'];
  colorMode: 'light' | 'dark';
  readOnly?: boolean;
}

export const SKETCHLAB_CONTAINER_CLASS = 'sketchlab-react-flow-container';

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
    useState<SketchlabReactFlowSource['viewport']>(initialViewport);

  const {screenToFlowPosition} = useReactFlow();
  const addedNodeCountRef = useRef(0);

  const {tabOrder, activeEntry, setActiveTabEntry} = useTabOrder(
    nodes as SketchlabReactFlowNode[],
    edges as SketchlabReactFlowEdge[]
  );

  const {focusEntry, handleFocusCapture} = useFocusManagement(
    tabOrder,
    edges as SketchlabReactFlowEdge[],
    setActiveTabEntry
  );

  const {connectingFrom, connectAnnouncement, handleKeyDown} =
    useKeyboardEdgeCreation({
      nodes: nodes as SketchlabReactFlowNode[],
      tabOrder,
      focusEntry,
      setEdges,
      readOnly,
    });

  // Apply roving tabindex through React Flow's domAttributes so it
  // survives React Flow re-renders (direct DOM manipulation gets
  // overwritten when RF reconciles tabIndex={0} on focusable nodes).
  // Also applies connect-source styling and aria-selected via React
  // rather than direct DOM classList manipulation.
  const displayNodes = useMemo(
    () =>
      nodes.map(node => {
        const isActive =
          activeEntry?.type === 'node' && activeEntry.id === node.id;
        const isConnectSource = connectingFrom === node.id;
        return {
          ...node,
          className: isConnectSource ? styles.connectSource : undefined,
          domAttributes: {
            tabIndex: isActive ? 0 : -1,
            ...(isConnectSource && {'aria-selected': true}),
          },
        };
      }),
    [nodes, activeEntry, connectingFrom]
  );
  // TODO: Add meaningful ariaLabel to edges using node labels instead of
  // raw IDs (React Flow defaults to "Edge from {sourceId} to {targetId}").
  const displayEdges = useMemo(
    () =>
      edges.map(edge => {
        const isActive =
          activeEntry?.type === 'edge' && activeEntry.id === edge.id;
        return {...edge, domAttributes: {tabIndex: isActive ? 0 : -1}};
      }),
    [edges, activeEntry]
  );

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      const source: SketchlabReactFlowSource = {
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
    connection =>
      setEdges(currentEdges =>
        addEdge(
          {...connection, markerEnd: {type: MarkerType.ArrowClosed}},
          currentEdges
        )
      ),
    [setEdges]
  );

  const handleMoveEnd = useCallback(
    (_event: unknown, newViewport: SketchlabReactFlowSource['viewport']) => {
      setViewport(newViewport);
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

      const newNodeId = createUuid();
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

      setNodes(currentNodes => [...currentNodes, newNode]);

      // Move focus to the new node after React Flow renders it.
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(
        () => focusEntry({type: 'node', id: newNodeId}),
        FOCUS_DELAY_MS
      );
    },
    [focusEntry, screenToFlowPosition, setNodes]
  );

  return (
    <SketchLabReadOnlyProvider value={readOnly}>
      <div
        className={classNames(
          styles.canvasContainer,
          {
            [styles.connectMode]: !!connectingFrom,
          },
          SKETCHLAB_CONTAINER_CLASS
        )}
        onKeyDownCapture={handleKeyDown}
        onFocusCapture={handleFocusCapture}
      >
        {!readOnly && <Toolbar onAddNode={handleAddNode} />}
        <div aria-live="assertive" className={styles.srOnly}>
          {connectAnnouncement}
        </div>
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
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
          nodesFocusable={true}
          edgesFocusable={true}
          disableKeyboardA11y={false}
          autoPanOnNodeFocus={false} // We manage viewport on focus manually in useFocusManagement.
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </SketchLabReadOnlyProvider>
  );
}
