import {
  addEdge,
  Background,
  type IsValidConnection,
  type OnEdgesChange,
  type OnNodesChange,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type OnConnect,
} from '@xyflow/react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
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
  AnchorDraggingProvider,
  ClipboardProvider,
  PushSnapshotProvider,
  SketchLabReadOnlyProvider,
  ToolbarVisibilityProvider,
  type ToolbarTarget,
} from '../context';
import CornerToolbarPanel from '../elementToolbars/components/CornerToolbarPanel';
import {DEFAULT_STROKE_COLOR} from '../elementToolbars/toolbarPalettes';
import {useCopyPaste} from '../hooks/useCopyPaste';
import {useDisplayElements} from '../hooks/useDisplayElements';
import {useElementClickHandlers} from '../hooks/useElementClickHandlers';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardNavigation} from '../hooks/useKeyboardNavigation';
import {useLineEdgeDrag} from '../hooks/useLineEdgeDrag';
import {useNodeDrag} from '../hooks/useNodeDrag';
import {useTabOrder} from '../hooks/useTabOrder';
import {useUndoHistory} from '../hooks/useUndoHistory';
import GroupNode from '../nodes/GroupNode';
import ImageNode from '../nodes/ImageNode';
import LineAnchorNode from '../nodes/LineAnchorNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {
  AddNodeRequest,
  CanvasTool,
  ReactFlowSketchLabSources,
  SketchLabNode,
} from '../types';
import {canCreateConnection} from '../utils/connectionRules';
import {groupSelectedNodes, ungroupNode} from '../utils/grouping';
import {createLineAnchorAtHandle} from '../utils/lineAnchors';
import {defaultLineEdgeFields} from '../utils/lineEdges';

import CanvasControls from './CanvasControls';
import ConnectionLine from './ConnectionLine';
import Toolbar from './Toolbar';

import styles from './react-flow-canvas.module.scss';

const NODE_TYPES = {
  shape: ShapeNode,
  image: ImageNode,
  text: TextNode,
  lineAnchor: LineAnchorNode,
  group: GroupNode,
};

// Offset added per new node so they don't stack exactly on top of each other.
const NEW_NODE_STAGGER_PX = 20;
const FOCUS_DELAY_MS = 100;

// Fallbacks for edges that don't specify type/style, kept in sync with the
// fields a new line gets. markerEnd is intentionally omitted so edges saved
// without an explicit marker don't gain arrows.
const DEFAULT_EDGE_OPTIONS = {
  type: defaultLineEdgeFields().type,
  style: defaultLineEdgeFields().style,
};

function stripDisplayFields<T extends object>(item: T): T {
  const result = {...item} as Record<string, unknown>;
  delete result.domAttributes;
  delete result.className;
  delete result.selected;
  // draggable/connectable/deletable are derived from data.locked/readOnly at render
  // time.
  delete result.draggable;
  delete result.connectable;
  delete result.deletable;
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

  const [canvasTool, setCanvasTool] = useState<CanvasTool>('cursor');

  const [isAnyPopoverOpen, setPopoverOpen] = useState(false);
  const [keyboardMovingLineId, setKeyboardMovingLineId] = useState<
    string | null
  >(null);

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
      isAnyPopoverOpen,
      setPopoverOpen,
    }),
    [
      openToolbarTarget,
      trapFocus,
      openToolbar,
      closeToolbar,
      isAnyPopoverOpen,
      setPopoverOpen,
    ]
  );

  const {screenToFlowPosition, flowToScreenPosition} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const addedNodeCountRef = useRef(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const {
    isDirectAnchorDragging,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
  } = useNodeDrag({
    setNodes,
    setEdges,
    screenToFlowPosition,
    flowToScreenPosition,
    pushSnapshot,
  });
  const {
    multiSelectedNodeIds,
    clearSelection,
    isGroupMode,
    ariaAnnouncement,
    announceGroupMode,
    enterGroupMode,
    exitGroupMode,
    toggleEntryInGroupMode,
    handleNodeClick,
    handleEdgeClick,
  } = useElementClickHandlers({
    readOnly,
    nodes,
    edges,
    openToolbar,
    closeToolbar,
  });

  // Count logical groupable elements: regular nodes as 1, standalone-line
  // anchor pairs as 1. Already-grouped and locked nodes are excluded.
  const groupableCount = useMemo(() => {
    let anchors = 0;
    let nonAnchors = 0;
    for (const id of multiSelectedNodeIds) {
      const node = nodes.find(n => n.id === id);
      if (!node || node.parentId || node.data?.locked) continue;
      if (node.type === 'lineAnchor') anchors++;
      else nonAnchors++;
    }
    return nonAnchors + anchors / 2;
  }, [multiSelectedNodeIds, nodes]);
  // Count ALL groupable elements on the canvas (not just selected) to decide
  // whether entering group mode is possible.
  const totalGroupableCount = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    let count = 0;
    for (const node of nodes) {
      if (
        node.type !== 'lineAnchor' &&
        node.type !== 'group' &&
        !node.parentId &&
        !node.data?.locked
      ) {
        count++;
      }
    }
    for (const edge of edges) {
      if (edge.data?.locked) continue;
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (
        src?.type === 'lineAnchor' &&
        tgt?.type === 'lineAnchor' &&
        !src.parentId &&
        !tgt.parentId
      ) {
        count++;
      }
    }
    return count;
  }, [nodes, edges]);

  const [groupModeError, setGroupModeError] = useState<string | null>(null);
  const groupModeErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const handleCannotGroup = useCallback(
    (msg: string) => {
      announceGroupMode(msg);
      setGroupModeError(msg);
      if (groupModeErrorTimerRef.current)
        clearTimeout(groupModeErrorTimerRef.current);
      groupModeErrorTimerRef.current = setTimeout(
        () => setGroupModeError(null),
        2000
      );
    },
    [announceGroupMode]
  );

  const handlePaneClick = useCallback(() => {
    canvasContainerRef.current?.focus();
    clearSelection();
  }, [clearSelection]);
  const {
    tabOrder,
    activeEntry,
    lastFocusedEntry,
    setLastFocusedEntry,
    nodeOrEdgeFocused,
    setNodeOrEdgeFocused,
  } = useTabOrder(nodes, edges);

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

  const handleGroupNodes = useCallback(() => {
    const selectedIds = [...multiSelectedNodeIds];
    const groupId = createUuid();
    pushSnapshot();
    setNodes(current => groupSelectedNodes(selectedIds, current, groupId));
    clearSelection();
    closeToolbar();
    announceGroupMode('Group created.');
    setTimeout(() => focusEntry({type: 'node', id: groupId}), 0);
  }, [
    multiSelectedNodeIds,
    pushSnapshot,
    setNodes,
    clearSelection,
    closeToolbar,
    announceGroupMode,
    focusEntry,
  ]);

  const handleUngroupNode = useCallback(
    (groupId: string) => {
      pushSnapshot();
      setNodes(current => ungroupNode(groupId, current));
      closeToolbar();
    },
    [pushSnapshot, setNodes, closeToolbar]
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
      onLineKeyboardMove: setKeyboardMovingLineId,
      isGroupMode,
      canGroup: groupableCount >= 2,
      canEnterGroupMode: totalGroupableCount >= 2,
      onEnterGroupMode: enterGroupMode,
      onExitGroupMode: exitGroupMode,
      onToggleEntryInGroupMode: toggleEntryInGroupMode,
      onGroupSelected: handleGroupNodes,
      onCannotGroup: handleCannotGroup,
    });

  const {handleEdgeMouseDown, isLineDragging} = useLineEdgeDrag({
    readOnly,
    setNodes,
    setEdges,
    screenToFlowPosition,
    flowToScreenPosition,
    pushSnapshot,
  });
  const isAnchorDragging =
    isDirectAnchorDragging || isLineDragging || keyboardMovingLineId !== null;

  // Clear the keyboard-move flag once focus leaves the anchor or edge being moved.
  useEffect(() => {
    if (!keyboardMovingLineId) return;
    const stillFocused =
      nodeOrEdgeFocused && lastFocusedEntry?.id === keyboardMovingLineId;
    if (!stillFocused) {
      setKeyboardMovingLineId(null);
    }
  }, [lastFocusedEntry, keyboardMovingLineId, nodeOrEdgeFocused]);

  // Close the toolbar when focus moves off the owning node/edge: to a
  // different node/edge, or out of the canvas entirely. Skips clearing
  // while focus is inside the toolbar itself so keyboard interactions
  // don't dismiss it.
  useEffect(() => {
    if (!openToolbarTarget) return;
    // If the user is actively interacting with the toolbar (mouse or keyboard
    // focus inside it), keep it open regardless of where the focus-tracking
    // state currently points.
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement?.closest(`.${SKETCHLAB_TOOLBAR_PANEL_CLASS}`)) {
      return;
    }
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

  const isGrabMode = canvasTool === 'grab';

  const {displayNodes, displayEdges} = useDisplayElements({
    nodes,
    edges,
    activeEntry,
    nodeOrEdgeFocused,
    lastFocusedEntry,
    connectingFrom,
    readOnly,
    grabMode: isGrabMode,
    focusEntry,
    handleEdgeMouseDown,
    multiSelectedNodeIds,
  });

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

  const onConnect: OnConnect = useCallback(
    connection => {
      const {source, target} = connection;
      if (!source || !target || !canCreateConnection(source, target, nodes)) {
        return;
      }
      pushSnapshot();
      setEdges(currentEdges =>
        addEdge(
          {id: createUuid(), ...connection, ...defaultLineEdgeFields()},
          currentEdges
        )
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
      return canCreateConnection(source, target, nodes);
    },
    [nodes]
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

  // All ReactFlow props that differ between cursor and grab mode, collected in
  // one place so the grab mode contract is visible at a glance.
  const grabModeProps = {
    panOnDrag: isGrabMode,
    nodesDraggable: !readOnly && !isGrabMode,
    nodesConnectable: !readOnly && !isGrabMode,
    elementsSelectable: !readOnly && !isGrabMode,
    nodesFocusable: !isGrabMode,
    edgesFocusable: !isGrabMode,
    onNodeClick: isGrabMode ? undefined : handleNodeClick,
    onEdgeClick: isGrabMode ? undefined : handleEdgeClick,
  };

  return (
    <SketchLabReadOnlyProvider value={readOnly || isGrabMode}>
      <ToolbarVisibilityProvider value={toolbarVisibility}>
        <ClipboardProvider value={clipboardContextValue}>
          <PushSnapshotProvider value={pushSnapshot}>
            <AnchorDraggingProvider value={isAnchorDragging}>
              <FocusTrap
                active={isGroupMode}
                focusTrapOptions={{
                  initialFocus: false,
                  escapeDeactivates: false,
                  allowOutsideClick: true,
                  returnFocusOnDeactivate: false,
                }}
              >
                <div
                  ref={canvasContainerRef}
                  className={classNames(
                    styles.canvasContainer,
                    {
                      [styles.connectMode]: !!connectingFrom,
                      [styles.grabMode]: isGrabMode,
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
                      canvasTool={canvasTool}
                      onSetCanvasTool={setCanvasTool}
                    />
                  )}
                  <div aria-live="assertive" className={styles.srOnly}>
                    {connectAnnouncement}
                  </div>
                  <div aria-live="polite" className={styles.srOnly}>
                    {ariaAnnouncement}
                  </div>
                  <ReactFlow
                    nodes={displayNodes}
                    edges={displayEdges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    {...grabModeProps}
                    onPaneClick={handlePaneClick}
                    onConnect={onConnect}
                    onNodesDelete={handleElementsDeleted}
                    onEdgesDelete={handleElementsDeleted}
                    onNodeDragStart={handleNodeDragStart}
                    onNodeDrag={handleNodeDrag}
                    onNodeDragStop={handleNodeDragStop}
                    isValidConnection={isValidConnection}
                    connectionLineComponent={ConnectionLine}
                    minZoom={MIN_ZOOM}
                    connectionRadius={LINE_RECONNECT_SNAP_RADIUS_PX}
                    nodeTypes={NODE_TYPES}
                    onMoveEnd={handleMoveEnd}
                    defaultViewport={initialViewport}
                    fitView={!initialViewport}
                    colorMode={colorMode}
                    // We implement our own shift+click multi-selection; disable
                    // React Flow's built-in so it doesn't fight our selection state.
                    multiSelectionKeyCode={null}
                    deleteKeyCode={readOnly ? null : 'Delete'}
                    proOptions={{hideAttribution: true}}
                    // Even though we manage tab order, we keep React Flow's keyboard A11y on because
                    // it manages things like moving nodes with arrow keys.
                    disableKeyboardA11y={false}
                    autoPanOnNodeFocus={false} // We manage viewport on focus manually in useFocusManagement.
                    zIndexMode={'manual'}
                    defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
                    defaultMarkerColor={DEFAULT_STROKE_COLOR}
                  >
                    <CornerToolbarPanel
                      nodes={nodes}
                      edges={edges}
                      setNodes={setNodes}
                      setEdges={setEdges}
                      pushSnapshot={pushSnapshot}
                      groupableCount={groupableCount}
                      onGroupNodes={handleGroupNodes}
                      onUngroupNode={handleUngroupNode}
                    />
                    {isGroupMode && (
                      <Panel
                        position="bottom-center"
                        className={styles.groupModeIndicator}
                      >
                        {groupModeError ??
                          'Tab to move — Enter to select/deselect — G to group — Esc to cancel'}
                      </Panel>
                    )}
                    <Background />
                    <CanvasControls
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      isReadOnly={readOnly}
                    />
                  </ReactFlow>
                </div>
              </FocusTrap>
            </AnchorDraggingProvider>
          </PushSnapshotProvider>
        </ClipboardProvider>
      </ToolbarVisibilityProvider>
    </SketchLabReadOnlyProvider>
  );
}
