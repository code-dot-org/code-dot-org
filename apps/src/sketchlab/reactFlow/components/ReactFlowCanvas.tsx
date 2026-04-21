import {
  addEdge,
  Background,
  Controls,
  type IsValidConnection,
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
import LineAnchorNode from '../nodes/LineAnchorNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {ReactFlowSketchLabSources} from '../types';

import Toolbar from './Toolbar';

import styles from './react-flow-canvas.module.scss';

const NODE_TYPES = {
  shape: ShapeNode,
  image: ImageNode,
  text: TextNode,
  lineAnchor: LineAnchorNode,
};

// Offset added per new node so they don't stack exactly on top of each other.
const NEW_NODE_STAGGER_PX = 20;
const FOCUS_DELAY_MS = 100;
const LINE_DEFAULT_LENGTH_PX = 220;
const LINE_ANCHOR_SIZE_PX = 10;
type FlowPoint = {x: number; y: number};

function nodeHasAnyEdge(nodeId: string, edges: SketchlabReactFlowEdge[]) {
  return edges.some(edge => edge.source === nodeId || edge.target === nodeId);
}

function isLineAnchorNodeId(nodeId: string, nodes: SketchlabReactFlowNode[]) {
  const node = nodes.find(candidate => candidate.id === nodeId);
  return node?.type === 'lineAnchor' || node?.data?.isLineAnchor === true;
}

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
  const draggingLineEdgeRef = useRef<{
    sourceId: string;
    targetId: string;
    startPointer: FlowPoint;
    startSourcePosition: FlowPoint;
    startTargetPosition: FlowPoint;
  } | null>(null);

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
      edges: edges as SketchlabReactFlowEdge[],
      tabOrder,
      focusEntry,
      setNodes,
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
      setEdges(currentEdges => {
        const {source, target} = connection;
        if (!source || !target) {
          return currentEdges;
        }
        const sourceLimited = isLineAnchorNodeId(source, nodes);
        const targetLimited = isLineAnchorNodeId(target, nodes);
        if (
          (sourceLimited && nodeHasAnyEdge(source, currentEdges)) ||
          (targetLimited && nodeHasAnyEdge(target, currentEdges))
        ) {
          return currentEdges;
        }

        return addEdge(
          {...connection, markerEnd: {type: MarkerType.ArrowClosed}},
          currentEdges
        );
      }),
    [nodes, setEdges]
  );

  const isValidConnection: IsValidConnection = useCallback(
    connectionOrEdge => {
      const {source, target} = connectionOrEdge;
      if (!source || !target) {
        return false;
      }
      const sourceLimited = isLineAnchorNodeId(source, nodes);
      const targetLimited = isLineAnchorNodeId(target, nodes);
      if (sourceLimited && nodeHasAnyEdge(source, edges)) {
        return false;
      }
      if (targetLimited && nodeHasAnyEdge(target, edges)) {
        return false;
      }
      return true;
    },
    [edges, nodes]
  );

  const handleMoveEnd = useCallback(
    (_event: unknown, newViewport: SketchlabReactFlowSource['viewport']) => {
      setViewport(newViewport);
    },
    []
  );

  const handleLineEdgeMouseMove = useCallback(
    (event: MouseEvent) => {
      const dragState = draggingLineEdgeRef.current;
      if (!dragState) {
        return;
      }

      const currentPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const deltaX = currentPointer.x - dragState.startPointer.x;
      const deltaY = currentPointer.y - dragState.startPointer.y;

      setNodes(currentNodes =>
        currentNodes.map(node => {
          if (node.id === dragState.sourceId) {
            return {
              ...node,
              position: {
                x: dragState.startSourcePosition.x + deltaX,
                y: dragState.startSourcePosition.y + deltaY,
              },
            };
          }
          if (node.id === dragState.targetId) {
            return {
              ...node,
              position: {
                x: dragState.startTargetPosition.x + deltaX,
                y: dragState.startTargetPosition.y + deltaY,
              },
            };
          }
          return node;
        })
      );
    },
    [screenToFlowPosition, setNodes]
  );

  const stopLineEdgeDrag = useCallback(() => {
    draggingLineEdgeRef.current = null;
    window.removeEventListener('mousemove', handleLineEdgeMouseMove);
    window.removeEventListener('mouseup', stopLineEdgeDrag);
  }, [handleLineEdgeMouseMove]);

  const handleEdgeMouseDown = useCallback(
    (event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      if (readOnly || event.button !== 0) {
        return;
      }

      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      const isLineEdge =
        sourceNode?.type === 'lineAnchor' && targetNode?.type === 'lineAnchor';
      if (!sourceNode || !targetNode || !isLineEdge) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      draggingLineEdgeRef.current = {
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        startPointer: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        startSourcePosition: {...sourceNode.position},
        startTargetPosition: {...targetNode.position},
      };

      window.addEventListener('mousemove', handleLineEdgeMouseMove);
      window.addEventListener('mouseup', stopLineEdgeDrag);
    },
    [
      readOnly,
      nodes,
      screenToFlowPosition,
      handleLineEdgeMouseMove,
      stopLineEdgeDrag,
    ]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleLineEdgeMouseMove);
      window.removeEventListener('mouseup', stopLineEdgeDrag);
    };
  }, [handleLineEdgeMouseMove, stopLineEdgeDrag]);

  // TODO: Add meaningful ariaLabel to edges using node labels instead of
  // raw IDs (React Flow defaults to "Edge from {sourceId} to {targetId}").
  const displayEdges = useMemo(
    () =>
      edges.map(edge => {
        const isActive =
          activeEntry?.type === 'edge' && activeEntry.id === edge.id;
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        const isLineEdge =
          sourceNode?.type === 'lineAnchor' &&
          targetNode?.type === 'lineAnchor';

        return {
          ...edge,
          domAttributes: {
            tabIndex: isActive ? 0 : -1,
            ...(isLineEdge && !readOnly
              ? {
                  onMouseDown: (event: React.MouseEvent) =>
                    handleEdgeMouseDown(event, edge),
                }
              : {}),
          },
        };
      }),
    [edges, activeEntry, nodes, readOnly, handleEdgeMouseDown]
  );

  const handleAddNode = useCallback(
    (
      type: 'shape' | 'image' | 'text' | 'line',
      data?: SketchlabReactFlowNode['data']
    ) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2 + stagger,
        y: window.innerHeight / 2 + stagger,
      });

      if (type === 'line') {
        const sourceAnchorId = createUuid();
        const targetAnchorId = createUuid();
        const lineEdgeId = createUuid();

        const anchorBaseData: SketchlabReactFlowNode['data'] = {
          isLineAnchor: true,
          shapeType: 'rectangle',
          label: '',
        };

        const sourceAnchor: SketchlabReactFlowNode = {
          id: sourceAnchorId,
          type: 'lineAnchor',
          position: {
            x: centerPosition.x - LINE_DEFAULT_LENGTH_PX / 2,
            y: centerPosition.y,
          },
          data: {
            ...anchorBaseData,
            lineAnchorRole: 'source',
          },
          style: {
            width: LINE_ANCHOR_SIZE_PX,
            height: LINE_ANCHOR_SIZE_PX,
          },
        };

        const targetAnchor: SketchlabReactFlowNode = {
          id: targetAnchorId,
          type: 'lineAnchor',
          position: {
            x: centerPosition.x + LINE_DEFAULT_LENGTH_PX / 2,
            y: centerPosition.y,
          },
          data: {
            ...anchorBaseData,
            lineAnchorRole: 'target',
          },
          style: {
            width: LINE_ANCHOR_SIZE_PX,
            height: LINE_ANCHOR_SIZE_PX,
          },
        };

        const newLine: SketchlabReactFlowEdge = {
          id: lineEdgeId,
          source: sourceAnchorId,
          target: targetAnchorId,
          type: 'straight',
        };

        setNodes(currentNodes => [...currentNodes, sourceAnchor, targetAnchor]);
        setEdges(currentEdges => [...currentEdges, newLine]);

        // Move focus to the new line after React Flow renders it.
        (document.activeElement as HTMLElement)?.blur();
        setTimeout(
          () => focusEntry({type: 'edge', id: lineEdgeId}),
          FOCUS_DELAY_MS
        );
        return;
      }

      if (!data) {
        return;
      }

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
    [focusEntry, screenToFlowPosition, setNodes, setEdges]
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
          isValidConnection={readOnly ? undefined : isValidConnection}
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
