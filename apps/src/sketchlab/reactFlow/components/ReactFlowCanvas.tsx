import {
  addEdge,
  Background,
  Controls,
  type IsValidConnection,
  type OnEdgesChange,
  type OnNodesChange,
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
  LINE_DEFAULT_LENGTH_PX,
  LINE_RECONNECT_SNAP_RADIUS_PX,
  MIN_ZOOM,
  SAVE_DEBOUNCE_MS,
  SKETCHLAB_TOOLBAR_PANEL_CLASS,
} from '../constants';
import {
  ClipboardProvider,
  PushSnapshotProvider,
  SketchLabReadOnlyProvider,
  ToolbarVisibilityProvider,
  type ToolbarTarget,
} from '../context';
import CornerToolbarPanel from '../elementToolbars/CornerToolbarPanel';
import {
  DEFAULT_EDGE_TYPE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';
import {useCopyPaste} from '../hooks/useCopyPaste';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardNavigation} from '../hooks/useKeyboardNavigation';
import {useLineEdgeDrag} from '../hooks/useLineEdgeDrag';
import {useReconnect} from '../hooks/useReconnect';
import {useTabOrder} from '../hooks/useTabOrder';
import {useUndoHistory} from '../hooks/useUndoHistory';
import ImageNode from '../nodes/ImageNode';
import LineAnchorNode from '../nodes/LineAnchorNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {
  AddNodeRequest,
  ReactFlowSketchLabSources,
  SketchLabNode,
} from '../types';
import {
  canCreateConnection,
  isLineAnchorNodeId,
} from '../utils/connectionRules';
import {snapAnchorIfNearby} from '../utils/handleSnap';
import {createLineAnchorAtHandle} from '../utils/lineAnchors';
import {defaultLineEdgeFields} from '../utils/lineEdges';
import {getEdgeAriaLabel} from '../utils/nodeLabel';

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

function stripDisplayFields<T extends object>(item: T): T {
  const result = {...item} as Record<string, unknown>;
  delete result.domAttributes;
  delete result.className;
  delete result.selected;
  return result as T;
}

export interface ReactFlowCanvasProps {
  updateSources: ReturnType<
    typeof useSources<ReactFlowSketchLabSources>
  >['updateSources'];
  levelName: string;
  initialNodes: SketchlabReactFlowNode[];
  initialEdges: SketchlabReactFlowEdge[];
  initialViewport: SketchlabReactFlowSource['viewport'];
  colorMode: 'light' | 'dark';
  readOnly?: boolean;
}

export const SKETCHLAB_CONTAINER_CLASS = 'sketchlab-react-flow-container';

export default function ReactFlowCanvas({
  updateSources,
  levelName,
  initialNodes,
  initialEdges,
  initialViewport,
  colorMode,
  readOnly = false,
}: ReactFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<SketchLabNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const {syncRefs, pushSnapshot, undo, redo, canUndo, canRedo} =
    useUndoHistory();
  // Keep undo history refs in sync with current canvas state.
  useEffect(() => {
    syncRefs(nodes, edges);
  }, [nodes, edges, syncRefs]);

  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (!snapshot) return;
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const snapshot = redo();
    if (!snapshot) return;
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
  }, [redo, setNodes, setEdges]);

  const [viewport, setViewport] =
    useState<SketchlabReactFlowSource['viewport']>(initialViewport);
  const [openToolbarInfo, setOpenToolbarInfo] = useState<{
    target: ToolbarTarget | null;
    trapFocus: boolean;
  }>({target: null, trapFocus: false});
  const {target: openToolbarTarget, trapFocus} = openToolbarInfo;

  const openToolbar = useCallback(
    (target: ToolbarTarget, options?: {trapFocus?: boolean}) => {
      setOpenToolbarInfo({
        target,
        trapFocus: options?.trapFocus ?? false,
      });
    },
    []
  );

  const closeToolbar = useCallback(() => {
    setOpenToolbarInfo({target: null, trapFocus: false});
  }, []);

  const toolbarVisibility = useMemo(
    () => ({
      openToolbarTarget,
      trapFocus,
      openToolbar,
      closeToolbar,
    }),
    [openToolbarTarget, trapFocus, openToolbar, closeToolbar]
  );

  const {screenToFlowPosition, flowToScreenPosition, getEdges} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const addedNodeCountRef = useRef(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const handlePaneClick = useCallback(() => {
    canvasContainerRef.current?.focus();
  }, []);
  const {
    tabOrder,
    activeEntry,
    lastFocusedEntry,
    setLastFocusedEntry,
    nodeOrEdgeFocused,
    setNodeOrEdgeFocused,
  } = useTabOrder(nodes, edges);

  // Push snapshot when a drag begins — at this point nodesRef still holds the
  // pre-drag positions, so undo correctly restores the node to where it was
  // before the move.
  const handleNodeDragStart = useCallback(() => {
    pushSnapshot();
  }, [pushSnapshot]);

  // After element is deleted from the DOM, focus falls to body.
  // Return it to the canvas container so keyboard shortcuts (undo, etc.)
  // keep working without requiring a click or tab navigation.
  const handleElementsDeleted = useCallback(() => {
    canvasContainerRef.current?.focus();
  }, []);

  // Intercept React Flow's change callbacks to push undo snapshots before
  // resize-stop and delete. Drag is handled by handleNodeDragStart instead.
  // Adds that bypass onNodesChange (direct setNodes calls) are handled at
  // their call sites.
  const handleNodesChange: OnNodesChange<SketchLabNode> = useCallback(
    changes => {
      const commitsResize = changes.some(
        change => change.type === 'dimensions' && change.resizing === false
      );
      const hasDelete = changes.some(change => change.type === 'remove');
      if (commitsResize || hasDelete) pushSnapshot();
      onNodesChange(changes);
    },
    [onNodesChange, pushSnapshot]
  );

  const handleEdgesChange: OnEdgesChange<SketchlabReactFlowEdge> = useCallback(
    changes => {
      const hasDelete = changes.some(change => change.type === 'remove');
      // 'replace' covers updateEdge() calls (e.g. z-index changes from the
      // line toolbar's bring-to-front / send-to-back actions).
      const isStyleChange = changes.some(change => change.type === 'replace');
      if (hasDelete || isStyleChange) pushSnapshot();
      onEdgesChange(changes);
    },
    [onEdgesChange, pushSnapshot]
  );

  const {
    duplicateNode,
    duplicateLine,
    copyEntry,
    cutEntry,
    paste,
    handleMouseMove,
    handleMouseLeave,
  } = useCopyPaste({nodes, edges, setNodes, setEdges, pushSnapshot});

  const clipboardContextValue = useMemo(
    () => ({duplicateNode, duplicateLine}),
    [duplicateNode, duplicateLine]
  );

  const {focusEntry, handleFocusCapture} = useFocusManagement(
    tabOrder,
    edges,
    nodeOrEdgeFocused,
    setLastFocusedEntry,
    setNodeOrEdgeFocused
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: SketchlabReactFlowNode) => {
      if (node.type !== 'lineAnchor') return;
      snapAnchorIfNearby({
        anchorId: node.id,
        screenPoint: {x: event.clientX, y: event.clientY},
        radiusPx: LINE_RECONNECT_SNAP_RADIUS_PX,
        edges: getEdges(),
        setEdges,
      });
    },
    [getEdges, setEdges]
  );

  const {connectingFrom, connectAnnouncement, handleKeyDown} =
    useKeyboardNavigation({
      nodes,
      tabOrder,
      focusEntry,
      setNodes,
      setEdges,
      readOnly,
      openToolbar,
      copyEntry,
      cutEntry,
      paste,
      undo: handleUndo,
      redo: handleRedo,
      pushSnapshot,
      lastFocusedEntry,
    });

  const {handleEdgeMouseDown} = useLineEdgeDrag({
    readOnly,
    setNodes,
    setEdges,
    screenToFlowPosition,
    flowToScreenPosition,
  });

  // Close the toolbar when focus moves off the owning node/edge: to a
  // different node/edge, or out of the canvas entirely. Skips clearing
  // while focus is inside the toolbar itself so keyboard interactions
  // don't dismiss it.
  useEffect(() => {
    if (!openToolbarTarget) return;
    const focusedEntry = nodeOrEdgeFocused ? lastFocusedEntry : null;
    if (
      !focusedEntry ||
      focusedEntry.type !== openToolbarTarget.type ||
      focusedEntry.id !== openToolbarTarget.id
    ) {
      closeToolbar();
    }
  }, [openToolbarTarget, nodeOrEdgeFocused, lastFocusedEntry, closeToolbar]);

  // Close the toolbar when its owning node/edge is deleted.
  useEffect(() => {
    if (!openToolbarTarget) {
      return;
    }
    if (openToolbarTarget.type === 'node') {
      if (!nodes.some(node => node.id === openToolbarTarget.id)) {
        closeToolbar();
      }
      return;
    }
    if (!edges.some(edge => edge.id === openToolbarTarget.id)) {
      closeToolbar();
    }
  }, [nodes, edges, openToolbarTarget, closeToolbar]);

  // Clear selection when focus leaves the canvas container entirely
  // (e.g. clicking outside or tabbing out of the canvas). Skip when the
  // blur originates from a toolbar control — e.g. a native color
  // picker steals focus to an OS dialog (relatedTarget null), and
  // clearing here would unmount the toolbar before the user can pick.
  const handleContainerBlur = useCallback(
    (event: React.FocusEvent) => {
      const focusTarget = event.target as HTMLElement;
      if (
        event.currentTarget.contains(event.relatedTarget as Node) ||
        focusTarget.closest(`.${SKETCHLAB_TOOLBAR_PANEL_CLASS}`)
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
    // Anchor endpoints of a locked edge inherit the lock so the user can't
    // drag them around. Real-node endpoints have their own lock state.
    const lockedLineAnchorIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.data?.locked !== true) return;
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      if (sourceNode?.type === 'lineAnchor') {
        lockedLineAnchorIds.add(edge.source);
      }
      if (targetNode?.type === 'lineAnchor') {
        lockedLineAnchorIds.add(edge.target);
      }
    });

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
        const locked =
          node.data?.locked === true || lockedLineAnchorIds.has(node.id);
        return {
          ...node,
          selected,
          ...(locked && {
            draggable: false,
            connectable: false,
            deletable: false,
          }),
          // Override React Flow's default "{type} node" aria-label on the
          // wrapper element so screenreaders hear a human-readable description.
          ...(node.type === 'lineAnchor' && {ariaLabel: 'Line endpoint'}),
          className: isConnectSource ? styles.connectSource : undefined,
          domAttributes: {
            ...domAttributes,
            ...(isConnectSource && {'aria-selected': true}),
          },
        };
      }),
      displayEdges: edges.map(edge => {
        const locked = edge.data?.locked === true;
        const {selected, domAttributes} = applyDisplayProps(edge, 'edge');
        return {
          ...edge,
          selected,
          ...(locked && {deletable: false}),
          ariaLabel: getEdgeAriaLabel(edge, nodes),
          className: styles.lineEdge,
          domAttributes: {
            ...domAttributes,
            ...(!readOnly && !locked
              ? {
                  onMouseDown: (event: React.MouseEvent) => {
                    focusEntry({type: 'edge', id: edge.id});
                    handleEdgeMouseDown(event, edge);
                  },
                }
              : {}),
          },
        };
      }),
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
    focusEntry,
    handleEdgeMouseDown,
  ]);

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      // updateNode/updateEdge from useReactFlow round-trips through React Flow's internal
      // store, which mirrors the displayNodes/displayEdges we render.
      // That spreads display-only fields (including domAttributes, which can include a function)
      // back into our state, which can then fail to clone. Strip them before persisting.
      const source: SketchlabReactFlowSource = {
        nodes: nodes.map(stripDisplayFields) as SketchlabReactFlowNode[],
        edges: edges.map(stripDisplayFields) as SketchlabReactFlowEdge[],
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

  const {
    isReconnecting,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
  } = useReconnect({
    setNodes,
    setEdges,
    screenToFlowPosition,
    pushSnapshot,
  });

  const onConnect: OnConnect = useCallback(
    connection => {
      const {source, target} = connection;
      if (!source || !target || !canCreateConnection(source, target, nodes)) {
        return;
      }
      pushSnapshot();
      setEdges(currentEdges =>
        addEdge({...connection, ...defaultLineEdgeFields()}, currentEdges)
      );
    },
    [nodes, pushSnapshot, setEdges]
  );

  const isValidConnection: IsValidConnection = useCallback(
    connectionOrEdge => {
      const {source, target} = connectionOrEdge;
      if (!source || !target) {
        return false;
      }
      // During an in-flight reconnect we relax the anchor restriction so the
      // user can drag a line endpoint onto a real node's handle. We still
      // block self-loops and reconnecting to another line anchor.
      if (isReconnecting()) {
        return source !== target && !isLineAnchorNodeId(target, nodes);
      }
      return canCreateConnection(source, target, nodes);
    },
    [nodes, isReconnecting]
  );

  const handleMoveEnd = useCallback(
    (_event: unknown, newViewport: SketchlabReactFlowSource['viewport']) => {
      setViewport(newViewport);
    },
    []
  );

  // Cleanup orphaned line anchors after any edge mutation. Anchors could be orphaned
  // if a line is deleted or if it was connected to a node.
  useEffect(() => {
    setNodes(currentNodes => {
      const referencedNodes = new Set<string>();
      edges.forEach(edge => {
        referencedNodes.add(edge.source);
        referencedNodes.add(edge.target);
      });
      const activeNodes = currentNodes.filter(
        node => node.type !== 'lineAnchor' || referencedNodes.has(node.id)
      );
      return activeNodes.length === currentNodes.length
        ? currentNodes
        : activeNodes;
    });
  }, [edges, setNodes]);

  const handleAddNode = useCallback(
    (request: AddNodeRequest) => {
      pushSnapshot();
      const {type} = request;
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2 + stagger,
        y: window.innerHeight / 2 + stagger,
      });

      // For lines, create two hidden anchor nodes and connect them.
      if (type === 'line') {
        const sourceAnchor = createLineAnchorAtHandle(
          {
            x: centerPosition.x - LINE_DEFAULT_LENGTH_PX / 2,
            y: centerPosition.y,
          },
          'source'
        );
        const targetAnchor = createLineAnchorAtHandle(
          {
            x: centerPosition.x + LINE_DEFAULT_LENGTH_PX / 2,
            y: centerPosition.y,
          },
          'target'
        );
        const newLine: SketchlabReactFlowEdge = {
          id: createUuid(),
          source: sourceAnchor.id,
          target: targetAnchor.id,
          ...defaultLineEdgeFields(),
        };

        setNodes(currentNodes => [...currentNodes, sourceAnchor, targetAnchor]);
        setEdges(currentEdges => [...currentEdges, newLine]);

        // Move focus to the new line and open its toolbar after React
        // Flow renders it. focusEntry must run before openToolbar so
        // lastFocusedEntry matches the toolbar target — otherwise the
        // close-on-focus-loss effect dismisses the toolbar immediately.
        (document.activeElement as HTMLElement)?.blur();
        setTimeout(() => {
          focusEntry({type: 'edge', id: newLine.id});
          openToolbar({type: 'edge', id: newLine.id}, {trapFocus: false});
        }, FOCUS_DELAY_MS);
        return;
      }

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNodeId = createUuid();
      // Text nodes auto-size to fit content; shapes and images use fixed defaults.
      // width/height are the React Flow fields NodeResizer also writes on drag,
      // keeping creation and resize consistent. style is reserved for appearance.
      // Cast is needed because TS can't preserve the (type, data) correlation
      // of the discriminated union across destructuring.
      const newNode = {
        id: newNodeId,
        type,
        data: request.data,
        position,
        ...(type !== 'text' && {
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        }),
      } as SketchLabNode;

      setNodes(currentNodes => [...currentNodes, newNode]);

      // Move focus to the new node and open its toolbar after React
      // Flow renders it. focusEntry must run before openToolbar so
      // lastFocusedEntry matches the toolbar target — otherwise the
      // close-on-focus-loss effect dismisses the toolbar immediately.
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(() => {
        focusEntry({type: 'node', id: newNodeId});
        openToolbar({type: 'node', id: newNodeId}, {trapFocus: false});
      }, FOCUS_DELAY_MS);
    },
    [
      focusEntry,
      openToolbar,
      pushSnapshot,
      screenToFlowPosition,
      setNodes,
      setEdges,
    ]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: {id: string}) => {
      // Only open the toolbar in editable mode, and for nodes that aren't line anchors.
      // Mouse opens don't trap focus so resize handles and contenteditable text stay usable.
      if (!readOnly && !isLineAnchorNodeId(node.id, nodes)) {
        openToolbar({type: 'node', id: node.id}, {trapFocus: false});
      }
    },
    [readOnly, openToolbar, nodes]
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: {id: string}) => {
      if (readOnly) return;
      openToolbar({type: 'edge', id: edge.id}, {trapFocus: false});
    },
    [readOnly, openToolbar]
  );

  return (
    <SketchLabReadOnlyProvider value={readOnly}>
      <ToolbarVisibilityProvider value={toolbarVisibility}>
        <ClipboardProvider value={clipboardContextValue}>
          <PushSnapshotProvider value={pushSnapshot}>
            <div
              ref={canvasContainerRef}
              className={classNames(
                styles.canvasContainer,
                {
                  [styles.connectMode]: !!connectingFrom,
                },
                SKETCHLAB_CONTAINER_CLASS
              )}
              tabIndex={-1}
              onKeyDownCapture={handleKeyDown}
              onFocusCapture={handleFocusCapture}
              onBlur={handleContainerBlur}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {!readOnly && (
                <Toolbar
                  onAddNode={handleAddNode}
                  levelName={levelName}
                  onUndo={handleUndo}
                  canUndo={canUndo}
                  onRedo={handleRedo}
                  canRedo={canRedo}
                />
              )}
              <div aria-live="assertive" className={styles.srOnly}>
                {connectAnnouncement}
              </div>
              <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onPaneClick={handlePaneClick}
                onConnect={onConnect}
                onReconnectStart={handleReconnectStart}
                onReconnect={handleReconnect}
                onReconnectEnd={handleReconnectEnd}
                onNodesDelete={handleElementsDeleted}
                onEdgesDelete={handleElementsDeleted}
                onNodeDragStart={handleNodeDragStart}
                onNodeDragStop={handleNodeDragStop}
                isValidConnection={isValidConnection}
                minZoom={MIN_ZOOM}
                connectionRadius={LINE_RECONNECT_SNAP_RADIUS_PX}
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
                // Even though we manage tab order, we keep React Flow's keyboard A11y on because
                // it manages things like moving nodes with arrow keys.
                disableKeyboardA11y={false}
                autoPanOnNodeFocus={false} // We manage viewport on focus manually in useFocusManagement.
                zIndexMode={'manual'}
                defaultEdgeOptions={{
                  type: DEFAULT_EDGE_TYPE,
                  style: {
                    stroke: DEFAULT_STROKE_COLOR,
                    strokeWidth: DEFAULT_LINE_WIDTH,
                  },
                }}
                defaultMarkerColor={DEFAULT_STROKE_COLOR}
              >
                <CornerToolbarPanel
                  nodes={nodes}
                  edges={edges}
                  setEdges={setEdges}
                  pushSnapshot={pushSnapshot}
                />
                <Background />
                <Controls position="bottom-right" />
              </ReactFlow>
            </div>
          </PushSnapshotProvider>
        </ClipboardProvider>
      </ToolbarVisibilityProvider>
    </SketchLabReadOnlyProvider>
  );
}
