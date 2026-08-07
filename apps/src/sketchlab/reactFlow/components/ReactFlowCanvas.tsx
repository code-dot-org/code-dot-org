import {
  addEdge,
  Background,
  type IsValidConnection,
  type OnBeforeDelete,
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  SketchlabReactFlowSource,
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {
  hasActiveTour,
  subscribeToActiveTour,
} from '@cdo/apps/sharedComponents/productTour/activeTourTracker';
import {createUuid} from '@cdo/apps/utils';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  DEFAULT_TEXT_NODE_HEIGHT,
  KEYBOARD_PAN_STEP,
  LINE_DEFAULT_LENGTH_PX,
  LINE_RECONNECT_SNAP_RADIUS_PX,
  MIN_ZOOM,
  SAVE_DEBOUNCE_MS,
  SKETCHLAB_TOOLBAR_PANEL_CLASS,
  TRANSIENT_MESSAGE_DURATION_MS,
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
import {
  MIDDLE_MOUSE_BUTTON,
  useCanvasToolSwitching,
} from '../hooks/useCanvasToolSwitching';
import {useCopyPaste} from '../hooks/useCopyPaste';
import {useDisplayElements} from '../hooks/useDisplayElements';
import {useDragSelection} from '../hooks/useDragSelection';
import {useElementClickHandlers} from '../hooks/useElementClickHandlers';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardNavigation} from '../hooks/useKeyboardNavigation';
import {useLineEdgeDrag} from '../hooks/useLineEdgeDrag';
import {ModeratedImageUploader} from '../hooks/useModeratedImageUpload';
import {useNodeDrag} from '../hooks/useNodeDrag';
import {useTabOrder} from '../hooks/useTabOrder';
import {useTransientMessage} from '../hooks/useTransientMessage';
import {useUndoHistory} from '../hooks/useUndoHistory';
import GroupNode from '../nodes/GroupNode';
import ImageNode from '../nodes/ImageNode';
import LineAnchorNode from '../nodes/LineAnchorNode';
import ShapeNode from '../nodes/ShapeNode';
import TextNode from '../nodes/TextNode';
import {
  AddNodeRequest,
  CanvasTool,
  ImageNodeData,
  ReactFlowSketchLabSources,
  SketchLabNode,
} from '../types';
import {canCreateConnection} from '../utils/connectionRules';
import {
  expandGroupDeletion,
  groupSelectedNodes,
  ungroupNode,
} from '../utils/grouping';
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

const FOCUS_DELAY_MS = 100;

const GROUP_MODE_HINT =
  'Tab to move — Enter to select/deselect — G to group — Esc to cancel';

const HAND_MODE_HINT =
  'Hand tool — use the arrow keys to pan — S to return to select';
const HAND_MODE_HINT_READ_ONLY = 'Hand tool — use the arrow keys to pan';

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
  // When absent, image uploads report an error.
  uploadImage?: ModeratedImageUploader;
  uploadsDisabled?: boolean;
  openUploadsDisabledModal?: () => void;
  onNodesDeleted?: (deletedNodes: SketchLabNode[]) => void;
  initialNodes: SketchlabReactFlowNode[];
  initialEdges: SketchlabReactFlowEdge[];
  initialViewport: SketchlabReactFlowSource['viewport'];
  colorMode: 'light' | 'dark';
  readOnly?: boolean;
  // A request from the parent view (e.g. Backpack import) to add an image node.
  // The canvas adds it via its own handleAddNode, then calls
  // onImageImportConsumed so the same request isn't processed twice.
  pendingImageImport?: ImageNodeData | null;
  onImageImportConsumed?: () => void;
}

export const SKETCHLAB_CONTAINER_CLASS = 'sketchlab-react-flow-container';

const uploadImageUnavailable: ModeratedImageUploader = async ({onError}) =>
  onError();

export default function ReactFlowCanvas({
  updateSources,
  uploadImage = uploadImageUnavailable,
  uploadsDisabled = false,
  openUploadsDisabledModal,
  onNodesDeleted,
  initialNodes,
  initialEdges,
  initialViewport,
  colorMode,
  readOnly = false,
  pendingImageImport = null,
  onImageImportConsumed,
}: ReactFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<SketchLabNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const tourActive = useSyncExternalStore(subscribeToActiveTour, hasActiveTour);
  const {syncRefs, pushSnapshot, clearHistory, undo, redo, canUndo, canRedo} =
    useUndoHistory();
  // Keep undo history refs in sync with current canvas state. nodesRef lets
  // event callbacks read current nodes without depending on the nodes array,
  // which changes every drag frame.
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
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

  // Read-only viewers get no editing toolbar, so grab (pan) is the only useful
  // default; editors start in cursor mode.
  const [canvasTool, setCanvasTool] = useState<CanvasTool>(
    readOnly ? 'grab' : 'cursor'
  );
  const isGrabMode = canvasTool === 'grab';

  const [isAnyPopoverOpen, setPopoverOpen] = useState(false);
  const [keyboardMovingLineId, setKeyboardMovingLineId] = useState<
    string | null
  >(null);
  // True while the workspace wrapper itself (the hand-mode tab stop) holds
  // keyboard focus.
  const [workspaceFocused, setWorkspaceFocused] = useState(false);

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

  const {
    screenToFlowPosition,
    flowToScreenPosition,
    getViewport,
    setViewport: setReactFlowViewport,
  } = useReactFlow<SketchlabReactFlowNode, SketchlabReactFlowEdge>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

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

  const [groupModeError, showGroupModeError] = useTransientMessage(
    TRANSIENT_MESSAGE_DURATION_MS
  );
  const handleCannotGroup = useCallback(
    (msg: string) => {
      announceGroupMode(msg);
      showGroupModeError(msg);
    },
    [announceGroupMode, showGroupModeError]
  );

  const [imageError, showImageError] = useTransientMessage(
    TRANSIENT_MESSAGE_DURATION_MS
  );
  const handleImageUploadError = useCallback(() => {
    const message = 'Could not upload image. Please try again.';
    announceGroupMode(message);
    showImageError(message);
  }, [announceGroupMode, showImageError]);
  const handleFlaggedImageCopyBlocked = useCallback(() => {
    const message = 'Flagged images cannot be copied.';
    announceGroupMode(message);
    showImageError(message);
  }, [announceGroupMode, showImageError]);

  // One banner at a time, highest priority first: an upload error, then a
  // group-mode error, the group-mode hint while group mode is active, and
  // finally the hand-tool pan hint while the workspace itself is focused.
  const banner = useMemo<{
    message: string;
    variant: 'info' | 'error';
  } | null>(() => {
    if (imageError) {
      return {message: imageError, variant: 'error'};
    }
    if (groupModeError) {
      return {message: groupModeError, variant: 'info'};
    }
    if (isGroupMode) {
      return {message: GROUP_MODE_HINT, variant: 'info'};
    }
    if (isGrabMode && workspaceFocused) {
      return {
        message: readOnly ? HAND_MODE_HINT_READ_ONLY : HAND_MODE_HINT,
        variant: 'info',
      };
    }
    return null;
  }, [
    imageError,
    groupModeError,
    isGroupMode,
    readOnly,
    isGrabMode,
    workspaceFocused,
  ]);

  const handlePaneClick = useCallback(() => {
    canvasContainerRef.current?.focus();
    clearSelection();
  }, [clearSelection]);

  // The workspace wrapper is the single tab stop for the canvas in hand mode.
  // While it holds focus, arrow keys pan the viewport. "S" returns to the
  // select tool, handled with the rest of the tool shortcuts.
  const handleWorkspaceKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.target !== event.currentTarget) return;

      let deltaX = 0;
      let deltaY = 0;
      switch (event.key) {
        case 'ArrowLeft':
          deltaX = KEYBOARD_PAN_STEP;
          break;
        case 'ArrowRight':
          deltaX = -KEYBOARD_PAN_STEP;
          break;
        case 'ArrowUp':
          deltaY = KEYBOARD_PAN_STEP;
          break;
        case 'ArrowDown':
          deltaY = -KEYBOARD_PAN_STEP;
          break;
        default:
          return;
      }
      event.preventDefault();
      const current = getViewport();
      setReactFlowViewport({
        ...current,
        x: current.x + deltaX,
        y: current.y + deltaY,
      });
    },
    [getViewport, setReactFlowViewport]
  );

  const handleWorkspaceFocus = useCallback((event: React.FocusEvent) => {
    if (event.target !== event.currentTarget) return;
    setWorkspaceFocused(event.currentTarget.matches(':focus-visible'));
  }, []);

  const handleWorkspaceBlur = useCallback((event: React.FocusEvent) => {
    if (event.target === event.currentTarget) setWorkspaceFocused(false);
  }, []);
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

  const handleNodesDeleted = useCallback(
    (deletedNodes: SketchLabNode[]) => {
      onNodesDeleted?.(deletedNodes);
      handleElementsDeleted();
    },
    [onNodesDeleted, handleElementsDeleted]
  );

  // Intercept React Flow's change callbacks to push undo snapshots before
  // delete. Drag is handled by handleNodeDragStart, and resize by
  // RotatedNodeResizer. Adds that bypass onNodesChange (direct setNodes calls)
  // are handled at their call sites.
  const handleNodesChange: OnNodesChange<SketchLabNode> = useCallback(
    changes => {
      const removedIds = new Set(
        changes
          .filter(change => change.type === 'remove')
          .map(change => change.id)
      );
      if (removedIds.size > 0) {
        // Deleting a flagged image hard-deletes its asset, so wipe history
        // instead of snapshotting.
        const deletesFlaggedImage = nodesRef.current.some(
          node =>
            removedIds.has(node.id) &&
            node.type === 'image' &&
            node.data.flagged
        );
        if (deletesFlaggedImage) {
          clearHistory();
        } else {
          pushSnapshot();
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange, pushSnapshot, clearHistory]
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
    handleMouseMove: copyPasteMouseMove,
    handleMouseLeave: copyPasteMouseLeave,
  } = useCopyPaste({
    nodes,
    edges,
    setNodes,
    setEdges,
    pushSnapshot,
    clearHistory,
    canvasContainerRef,
    readOnly,
    uploadImage,
    onImageUploadError: handleImageUploadError,
    onFlaggedImageCopyBlocked: handleFlaggedImageCopyBlocked,
  });

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

  const handleGroupNodes = useCallback(
    (explicitIds?: Set<string>) => {
      const selectedIds = [...(explicitIds ?? multiSelectedNodeIds)];
      if (selectedIds.length === 0) return;
      const groupId = createUuid();

      // groupSelectedNodes returns the input unchanged when the selection
      // doesn't meet the minimum threshold (e.g. a single standalone line).
      // Pre-check so pushSnapshot / announce / focus don't fire when no group
      // is actually created. The updater re-runs against authoritative current
      // state in case nodes changed between this render and the flush.
      if (groupSelectedNodes(selectedIds, nodes, groupId) === nodes) return;

      pushSnapshot();
      setNodes(current => groupSelectedNodes(selectedIds, current, groupId));
      clearSelection();
      closeToolbar();
      announceGroupMode('Group created.');
      setTimeout(() => focusEntry({type: 'node', id: groupId}), 0);
    },
    [
      multiSelectedNodeIds,
      nodes,
      pushSnapshot,
      setNodes,
      clearSelection,
      closeToolbar,
      announceGroupMode,
      focusEntry,
    ]
  );

  const handleUngroupNode = useCallback(
    (groupId: string) => {
      pushSnapshot();
      setNodes(current => ungroupNode(groupId, current));
      closeToolbar();
    },
    [pushSnapshot, setNodes, closeToolbar]
  );

  // Ensure delete on a group will delete all group elements.
  // Runs on both delete (via keystroke or button) and cut.
  const handleBeforeDelete: OnBeforeDelete<
    SketchLabNode,
    SketchlabReactFlowEdge
  > = useCallback(
    async ({nodes: nodesToDelete, edges: edgesToDelete}) =>
      expandGroupDeletion(nodesToDelete, edgesToDelete, nodes, edges),
    [nodes, edges]
  );

  const {
    selectionBox,
    pendingSelectedIds,
    dragSelectMouseDown,
    dragSelectMouseMove,
    dragSelectMouseUp,
    dragSelectMouseLeave,
  } = useDragSelection({
    nodes,
    edges,
    isGrabMode: canvasTool === 'grab',
    readOnly,
    screenToFlowPosition,
    onGroupNodes: handleGroupNodes,
  });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      copyPasteMouseMove(event);
      dragSelectMouseMove(event);
    },
    [copyPasteMouseMove, dragSelectMouseMove]
  );

  const handleMouseLeave = useCallback(() => {
    copyPasteMouseLeave();
    dragSelectMouseLeave();
  }, [copyPasteMouseLeave, dragSelectMouseLeave]);

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

  const {middleButtonHeld, handleMouseDownCapture, handleToolKeyDown} =
    useCanvasToolSwitching({
      setCanvasTool,
      readOnly,
      connecting: !!connectingFrom,
      isGroupMode,
      canvasContainerRef,
      workspaceRef,
    });

  const handleCanvasKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (handleToolKeyDown(event)) return;
      handleKeyDown(event);
    },
    [handleToolKeyDown, handleKeyDown]
  );

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
    // The onboarding tour moves focus into its own popup to point at the
    // element toolbar; don't treat that as the user leaving the element.
    if (tourActive) return;
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
  }, [
    openToolbarTarget,
    nodeOrEdgeFocused,
    lastFocusedEntry,
    closeToolbar,
    tourActive,
  ]);

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
    multiSelectedNodeIds: selectionBox
      ? pendingSelectedIds
      : multiSelectedNodeIds,
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
      // Undoing a flagged image's addition would strand the abuse block with
      // nothing visible to delete, so wipe history instead.
      if (request.type === 'image' && request.data.flagged) {
        clearHistory();
      } else {
        pushSnapshot();
      }
      setCanvasTool('cursor');
      const {type} = request;

      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
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

      const defaultHeight =
        type === 'text' ? DEFAULT_TEXT_NODE_HEIGHT : DEFAULT_NODE_HEIGHT;
      const position = {
        x: centerPosition.x - DEFAULT_NODE_WIDTH / 2,
        y: centerPosition.y - defaultHeight / 2,
      };

      const newNodeId = createUuid();
      // width/height are the React Flow fields NodeResizer also writes on drag,
      // keeping creation and resize consistent. style is reserved for appearance.
      // Cast is needed because TS can't preserve the (type, data) correlation
      // of the discriminated union across destructuring.
      const newNode = {
        id: newNodeId,
        type,
        data: request.data,
        position,
        width: DEFAULT_NODE_WIDTH,
        height: defaultHeight,
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
      clearHistory,
      focusEntry,
      openToolbar,
      pushSnapshot,
      screenToFlowPosition,
      setCanvasTool,
      setNodes,
      setEdges,
    ]
  );

  useEffect(() => {
    if (pendingImageImport) {
      handleAddNode({type: 'image', data: pendingImageImport});
      onImageImportConsumed?.();
    }
  }, [pendingImageImport, handleAddNode, onImageImportConsumed]);

  const dragBoxContainerRect = selectionBox
    ? canvasContainerRef.current?.getBoundingClientRect()
    : null;
  const dragBoxStyle: React.CSSProperties | null =
    selectionBox && dragBoxContainerRect
      ? {
          left:
            Math.min(selectionBox.startX, selectionBox.endX) -
            dragBoxContainerRect.left,
          top:
            Math.min(selectionBox.startY, selectionBox.endY) -
            dragBoxContainerRect.top,
          width: Math.abs(selectionBox.endX - selectionBox.startX),
          height: Math.abs(selectionBox.endY - selectionBox.startY),
        }
      : null;

  // All ReactFlow props that differ between cursor and grab mode, collected in
  // one place so the grab mode contract is visible at a glance.
  const grabModeProps = {
    // Left button pans only in hand mode; the middle button pans in either,
    // which is how the select tool gets a momentary hand tool.
    panOnDrag: isGrabMode ? [0, MIDDLE_MOUSE_BUTTON] : [MIDDLE_MOUSE_BUTTON],
    nodesDraggable: !readOnly && !isGrabMode,
    nodesConnectable: !readOnly && !isGrabMode,
    elementsSelectable: !readOnly && !isGrabMode,
    nodesFocusable: !isGrabMode,
    edgesFocusable: !isGrabMode,
    onNodeClick: isGrabMode ? undefined : handleNodeClick,
    onEdgeClick: isGrabMode ? undefined : handleEdgeClick,
    deleteKeyCode: !readOnly && !isGrabMode ? ['Delete', 'Backspace'] : null,
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
                      [styles.grabMode]: isGrabMode || middleButtonHeld,
                      [styles.grabbing]: middleButtonHeld,
                    },
                    SKETCHLAB_CONTAINER_CLASS
                  )}
                  tabIndex={-1}
                  onKeyDownCapture={handleCanvasKeyDown}
                  onFocusCapture={handleFocusCapture}
                  onBlur={handleContainerBlur}
                  // React Flow stops propagation of the mousedown that starts a
                  // pan, so the middle button has to be seen on the way down.
                  onMouseDownCapture={handleMouseDownCapture}
                  onMouseDown={dragSelectMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={dragSelectMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  {!readOnly && (
                    <Toolbar
                      onAddNode={handleAddNode}
                      uploadImage={uploadImage}
                      onImageUploadError={handleImageUploadError}
                      uploadsDisabled={uploadsDisabled}
                      openUploadsDisabledModal={openUploadsDisabledModal}
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
                  {/* In hand mode this is the single keyboard tab stop for
                      the canvas, so users can use arrow keys to pan */}
                  <div
                    ref={workspaceRef}
                    className={styles.workspace}
                    // Only claim the application role while the workspace is the
                    // grab-mode pan target. In cursor mode it's a passive wrapper,
                    // and an always-on application region would put the toolbar and
                    // controls inside it into screen-reader application mode.
                    role={isGrabMode ? 'application' : undefined}
                    tabIndex={isGrabMode ? 0 : -1}
                    aria-label={
                      readOnly
                        ? 'Canvas workspace. Use the arrow keys to pan.'
                        : 'Canvas workspace. Use the arrow keys to pan. Press S to return to the select tool.'
                    }
                    aria-keyshortcuts={
                      readOnly
                        ? 'ArrowUp ArrowDown ArrowLeft ArrowRight'
                        : 'ArrowUp ArrowDown ArrowLeft ArrowRight s'
                    }
                    onFocus={handleWorkspaceFocus}
                    onBlur={handleWorkspaceBlur}
                    onKeyDown={handleWorkspaceKeyDown}
                  >
                    <ReactFlow
                      nodes={displayNodes}
                      edges={displayEdges}
                      onNodesChange={handleNodesChange}
                      onEdgesChange={handleEdgesChange}
                      {...grabModeProps}
                      onPaneClick={handlePaneClick}
                      onConnect={onConnect}
                      onBeforeDelete={handleBeforeDelete}
                      onNodesDelete={handleNodesDeleted}
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
                      // We implement our own shift+click multi-selection and
                      // drag-to-select; disable React Flow's built-in versions.
                      multiSelectionKeyCode={null}
                      selectionKeyCode={null}
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
                      {banner && (
                        <Panel
                          position="bottom-center"
                          className={
                            banner.variant === 'error'
                              ? styles.bannerError
                              : styles.bannerInfo
                          }
                        >
                          {banner.message}
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
                  {dragBoxStyle && (
                    <div
                      aria-hidden="true"
                      className={styles.dragSelectionBox}
                      style={dragBoxStyle}
                    />
                  )}
                </div>
              </FocusTrap>
            </AnchorDraggingProvider>
          </PushSnapshotProvider>
        </ClipboardProvider>
      </ToolbarVisibilityProvider>
    </SketchLabReadOnlyProvider>
  );
}
