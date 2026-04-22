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
import {
  SketchLabReadOnlyProvider,
  NodeToolbarVisibilityProvider,
} from '../context';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardNavigation} from '../hooks/useKeyboardNavigation';
import {useTabOrder} from '../hooks/useTabOrder';
import ImageNode from '../nodes/ImageNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {ReactFlowSketchLabSources, SketchLabNode} from '../types';

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
  const [nodes, setNodes, onNodesChange] =
    useNodesState<SketchLabNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewport, setViewport] =
    useState<SketchlabReactFlowSource['viewport']>(initialViewport);
  const [openNodeToolbar_, setOpenNodeToolbar_] = useState<{
    id: string | null;
    trapFocus: boolean;
  }>({id: null, trapFocus: false});
  const openNodeToolbarId = openNodeToolbar_.id;
  const trapFocus = openNodeToolbar_.trapFocus;

  const openNodeToolbar = useCallback(
    (nodeId: string, options?: {trapFocus?: boolean}) => {
      setOpenNodeToolbar_({id: nodeId, trapFocus: options?.trapFocus ?? false});
    },
    []
  );

  const closeNodeToolbar = useCallback(() => {
    setOpenNodeToolbar_({id: null, trapFocus: false});
  }, []);

  const nodeToolbarVisibility = useMemo(
    () => ({
      openNodeToolbarId,
      trapFocus,
      openNodeToolbar,
      closeNodeToolbar,
    }),
    [openNodeToolbarId, trapFocus, openNodeToolbar, closeNodeToolbar]
  );

  const {screenToFlowPosition} = useReactFlow();
  const addedNodeCountRef = useRef(0);

  const {
    tabOrder,
    activeEntry,
    lastFocusedEntry,
    setLastFocusedEntry,
    nodeOrEdgeFocused,
    setNodeOrEdgeFocused,
  } = useTabOrder(nodes, edges);

  const {focusEntry, handleFocusCapture} = useFocusManagement(
    tabOrder,
    edges,
    nodeOrEdgeFocused,
    setLastFocusedEntry,
    setNodeOrEdgeFocused
  );

  const {connectingFrom, connectAnnouncement, handleKeyDown} =
    useKeyboardNavigation({
      nodes,
      tabOrder,
      focusEntry,
      setEdges,
      readOnly,
      openNodeToolbar,
    });

  // Close the node toolbar when focus moves off the owning node: to a
  // different node/edge, or out of the canvas entirely. Skips clearing
  // while focus is inside the toolbar itself so keyboard interactions
  // don't dismiss it.
  useEffect(() => {
    if (!openNodeToolbarId) return;
    const focusedNodeId =
      nodeOrEdgeFocused && lastFocusedEntry?.type === 'node'
        ? lastFocusedEntry.id
        : null;
    if (focusedNodeId !== openNodeToolbarId) {
      closeNodeToolbar();
    }
  }, [
    openNodeToolbarId,
    nodeOrEdgeFocused,
    lastFocusedEntry,
    closeNodeToolbar,
  ]);

  // Close the node toolbar when its owning node is deleted.
  useEffect(() => {
    if (
      openNodeToolbarId &&
      !nodes.some(node => node.id === openNodeToolbarId)
    ) {
      closeNodeToolbar();
    }
  }, [nodes, openNodeToolbarId, closeNodeToolbar]);

  // Clear selection when focus leaves the canvas container entirely
  // (e.g. clicking outside or tabbing out of the canvas). Skip when the
  // blur originates from a NodeToolbar control — e.g. a native color
  // picker steals focus to an OS dialog (relatedTarget null), and
  // clearing here would unmount the toolbar before the user can pick.
  const handleContainerBlur = useCallback(
    (event: React.FocusEvent) => {
      if (
        event.currentTarget.contains(event.relatedTarget as Node) ||
        (event.target as HTMLElement).closest('.react-flow__node-toolbar')
      ) {
        return;
      }
      setLastFocusedEntry(null);
      setNodeOrEdgeFocused(false);
    },
    [setLastFocusedEntry, setNodeOrEdgeFocused]
  );

  // Apply roving tabindex through React Flow's domAttributes so it
  // survives React Flow re-renders (direct DOM manipulation gets
  // overwritten when RF reconciles tabIndex={0} on focusable nodes).
  // Also applies connect-source styling and aria-selected via React
  // rather than direct DOM classList manipulation.
  const {displayNodes, displayEdges} = useMemo(() => {
    const applyDisplayProps = (item: {id: string}, type: 'node' | 'edge') => {
      const isTabTarget =
        activeEntry?.type === type && activeEntry.id === item.id;
      const isSelected =
        nodeOrEdgeFocused &&
        lastFocusedEntry?.type === type &&
        lastFocusedEntry.id === item.id;
      return {
        selected: isSelected && !readOnly,
        domAttributes: {tabIndex: isTabTarget ? 0 : -1},
      };
    };

    return {
      displayNodes: nodes.map(node => {
        const isConnectSource = connectingFrom === node.id;
        const {selected, domAttributes} = applyDisplayProps(node, 'node');
        return {
          ...node,
          selected,
          className: isConnectSource ? styles.connectSource : undefined,
          domAttributes: {
            ...domAttributes,
            ...(isConnectSource && {'aria-selected': true}),
          },
        };
      }),
      // TODO: Add meaningful ariaLabel to edges using node labels instead of
      // raw IDs (React Flow defaults to "Edge from {sourceId} to {targetId}").
      displayEdges: edges.map(edge => ({
        ...edge,
        ...applyDisplayProps(edge, 'edge'),
      })),
    };
  }, [
    nodes,
    edges,
    activeEntry?.type,
    activeEntry?.id,
    nodeOrEdgeFocused,
    lastFocusedEntry?.type,
    lastFocusedEntry?.id,
    connectingFrom,
    readOnly,
  ]);

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      const source: SketchlabReactFlowSource = {nodes, edges, viewport};
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
    ({type, data}: Pick<SketchLabNode, 'type' | 'data'>) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNodeId = createUuid();
      // Text nodes auto-size to fit content; shapes and images use fixed defaults.
      // Cast is needed because TS can't preserve the (type, data) correlation
      // of the discriminated union across destructuring.
      const newNode = {
        id: newNodeId,
        type,
        data,
        position,
        ...(type !== 'text' && {
          style: {width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT},
        }),
      } as SketchLabNode;

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

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: {id: string}) => {
      // Only open the node toolbar in editable mode. Mouse opens don't
      // trap focus so resize handles and contenteditable text stay usable.
      if (!readOnly) {
        openNodeToolbar(node.id, {trapFocus: false});
      }
    },
    [readOnly, openNodeToolbar]
  );

  return (
    <SketchLabReadOnlyProvider value={readOnly}>
      <NodeToolbarVisibilityProvider value={nodeToolbarVisibility}>
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
          onBlur={handleContainerBlur}
        >
          {!readOnly && <Toolbar onAddNode={handleAddNode} />}
          <div aria-live="assertive" className={styles.srOnly}>
            {connectAnnouncement}
          </div>
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            onMoveEnd={handleMoveEnd}
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
            onNodeClick={handleNodeClick}
            // Even though we manage tab order, we keep React Flow's keyboard A11y on because
            // it manages things like moving nodes with arrow keys.
            disableKeyboardA11y={false}
            autoPanOnNodeFocus={false} // We manage viewport on focus manually in useFocusManagement.
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </NodeToolbarVisibilityProvider>
    </SketchLabReadOnlyProvider>
  );
}
