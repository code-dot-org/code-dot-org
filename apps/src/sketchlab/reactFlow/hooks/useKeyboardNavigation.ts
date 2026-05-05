import {useReactFlow, type XYPosition} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
  KEYBOARD_RESIZE_STEP,
  KEYBOARD_MOVE_STEP,
  KEYBOARD_SNAP_RADIUS_FLOW_UNITS,
  LINE_RECONNECT_SNAP_RADIUS_PX,
} from '../constants';
import {
  entriesMatch,
  getElementForEntry,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';
import {isLineAnchorNodeId} from '../utils/connectionRules';
import {findNearestHandle} from '../utils/handleSnap';
import {
  anchorHandleFlowPosition,
  createLineAnchorAtHandle,
  getHandleFlowPosition,
} from '../utils/lineAnchors';
import {getNodeLabel} from '../utils/nodeLabel';

import {useAriaAnnouncer} from './useAriaAnnouncer';
import {useConnectMode} from './useConnectMode';

function moveNodesByDelta(
  currentNodes: SketchlabReactFlowNode[],
  nodeIds: string[],
  deltaX: number,
  deltaY: number
) {
  const nodeIdsToMove = new Set(nodeIds);
  return currentNodes.map(node =>
    nodeIdsToMove.has(node.id)
      ? {
          ...node,
          position: {
            x: node.position.x + deltaX,
            y: node.position.y + deltaY,
          },
        }
      : node
  );
}

/**
 * Resize a single node by adding `deltaWidth` and `deltaHeight` to its
 * dimensions, each clamped to the minimum node dimensions independently.
 */
function resizeNodeByDelta(
  currentNodes: SketchlabReactFlowNode[],
  nodeId: string,
  deltaWidth: number,
  deltaHeight: number
) {
  return currentNodes.map(node => {
    if (node.id !== nodeId) return node;
    const currentWidth = node.width ?? DEFAULT_NODE_WIDTH;
    const currentHeight = node.height ?? DEFAULT_NODE_HEIGHT;
    const newWidth = Math.max(MIN_NODE_WIDTH, currentWidth + deltaWidth);
    const newHeight = Math.max(MIN_NODE_HEIGHT, currentHeight + deltaHeight);
    return {...node, width: newWidth, height: newHeight};
  });
}

/**
 * Returns true if `target` is a context where text editing/typing is the
 * primary purpose — input, textarea, or contentEditable. We use this in
 * keyboard handlers to stay out of the user's way while they're typing.
 */
function isEditingTarget(target: HTMLElement): boolean {
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}

/**
 * Read a single-step arrow-key delta. Returns zeros for non-arrow keys.
 */
function getArrowDelta(key: string) {
  switch (key) {
    case 'ArrowLeft':
      return {deltaX: -KEYBOARD_MOVE_STEP, deltaY: 0};
    case 'ArrowRight':
      return {deltaX: KEYBOARD_MOVE_STEP, deltaY: 0};
    case 'ArrowUp':
      return {deltaX: 0, deltaY: -KEYBOARD_MOVE_STEP};
    case 'ArrowDown':
      return {deltaX: 0, deltaY: KEYBOARD_MOVE_STEP};
    default:
      return {deltaX: 0, deltaY: 0};
  }
}

interface UseKeyboardNavigationOptions {
  nodes: SketchlabReactFlowNode[];
  tabOrder: TabOrderEntry[];
  focusEntry: (entry: TabOrderEntry) => void;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  readOnly: boolean;
  openToolbar: (entry: TabOrderEntry, options?: {trapFocus?: boolean}) => void;
}

/**
 * Per-keystroke context shared between the dispatcher and individual
 * key handlers. Computed once at the top of `handleKeyDown` so each
 * handler reads the same view of focus and event state.
 */
interface KeyContext {
  event: React.KeyboardEvent;
  focusedEntry: TabOrderEntry | null;
  focusedNodeId: string | undefined;
  focusedEdgeId: string | undefined;
}

/**
 * Keyboard-driven edge creation and canvas key handling.
 *
 * Press "c" on a focused node to enter connect mode, Tab to cycle through
 * candidate target nodes, Enter to create the edge. Escape or "c" again
 * cancels. "[" and "]" resize the focused node by adjusting its width and
 * height by the keyboard resize step.
 * Also handles Tab-based navigation in normal mode and Enter to
 * activate a node's editable content.
 *
 * Each key handler below returns true when it handled the event so the
 * dispatcher stops walking the list. Returning true does NOT imply
 * preventDefault/stopPropagation were called: the Tab boundary case
 * lets the browser move focus out, and Enter-edit lets React Flow run
 * its own selection logic. Each handler owns its own propagation calls.
 */
export function useKeyboardNavigation({
  nodes,
  tabOrder,
  focusEntry,
  setNodes,
  setEdges,
  readOnly,
  openToolbar,
}: UseKeyboardNavigationOptions) {
  const {
    getEdge,
    getEdges,
    getNode,
    getZoom,
    screenToFlowPosition,
    flowToScreenPosition,
  } = useReactFlow<SketchlabReactFlowNode, SketchlabReactFlowEdge>();
  const {announcement: connectAnnouncement, announce} = useAriaAnnouncer();
  const {connectingFrom, startConnect, cancelConnect, completeConnect} =
    useConnectMode({nodes, setEdges, announce});

  // Remembers the edge most recently translated by an arrow keypress so
  // that subsequent presses can keep moving the same edge even if the
  // mutation knocked DOM focus off the edge wrapper. Cleared whenever a
  // non-arrow key is pressed (Tab, Escape, etc.) so unrelated key presses
  // don't accidentally pick it up.
  const keyboardMovingEdgeRef = useRef<string | null>(null);

  const handleTabNavigation = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEntry, focusedNodeId} = keyContext;
      if (event.key !== 'Tab') return false;
      if (tabOrder.length === 0) return true;

      const tabDirection = event.shiftKey ? -1 : 1;

      if (connectingFrom) {
        // Connect mode: cycle through nodes only, wrap around.
        const nodeEntries = tabOrder.filter(entry => entry.type === 'node');
        if (nodeEntries.length === 0) return true;
        const curNodeIdx = focusedNodeId
          ? nodeEntries.findIndex(entry => entry.id === focusedNodeId)
          : -1;
        const nextNodeIdx =
          (curNodeIdx + tabDirection + nodeEntries.length) % nodeEntries.length;
        event.preventDefault();
        event.stopPropagation();
        focusEntry(nodeEntries[nextNodeIdx]);
        return true;
      }

      // Normal mode: move through full order; escape at boundaries.
      if (!focusedEntry) return false;

      // Block ReactFlow's built-in Tab handler when focus is on a
      // node/edge (it conflicts with elementsSelectable=false in
      // read-only mode).
      event.stopPropagation();
      const currentIdx = tabOrder.findIndex(entry =>
        entriesMatch(entry, focusedEntry)
      );
      const nextIdx = currentIdx + tabDirection;
      if (nextIdx >= 0 && nextIdx < tabOrder.length) {
        event.preventDefault();
        focusEntry(tabOrder[nextIdx]);
      }
      // Boundary: no preventDefault lets the browser move focus out.
      return true;
    },
    [tabOrder, connectingFrom, focusEntry]
  );

  const handleEscapeCancelConnect = useCallback(
    (keyContext: KeyContext): boolean => {
      if (keyContext.event.key !== 'Escape' || !connectingFrom) return false;
      keyContext.event.preventDefault();
      keyContext.event.stopPropagation();
      cancelConnect();
      return true;
    },
    [connectingFrom, cancelConnect]
  );

  const handleOpenToolbar = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEntry} = keyContext;
      if (event.key !== 'e') return false;
      if (connectingFrom || !focusedEntry) return false;
      if (isLineAnchorNodeId(focusedEntry.id, nodes)) return false;
      event.preventDefault();
      openToolbar(focusedEntry, {trapFocus: true});
      return true;
    },
    [connectingFrom, nodes, openToolbar]
  );

  const handleConnectToggle = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (event.key !== 'c') return false;
      if (connectingFrom) {
        event.preventDefault();
        cancelConnect();
        return true;
      }
      if (focusedNodeId) {
        event.preventDefault();
        startConnect(focusedNodeId);
      }
      // Always consume "c" so it never falls through to other handlers.
      return true;
    },
    [connectingFrom, cancelConnect, startConnect]
  );

  const handleConnectComplete = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (event.key !== 'Enter' || !connectingFrom) return false;
      if (focusedNodeId && focusedNodeId !== connectingFrom) {
        event.preventDefault();
        event.stopPropagation();
        completeConnect(focusedNodeId);
      }
      // Enter while connecting always consumes the event, even with no
      // valid target — falling through to handleEnterEdit would re-enter
      // the source node's text edit on the same keystroke.
      return true;
    },
    [connectingFrom, completeConnect]
  );

  // Move a single line-anchor by delta. If the post-move handle position
  // lands within snap range of a real node's handle, attach the edge to
  // that handle directly instead of translating; the now-unreferenced
  // anchor is cleaned up by the prune effect. Returns false (and does
  // nothing) if the node isn't a lineAnchor or has no associated edge,
  // letting the caller fall back to a generic translate.
  const snapAnchorIfNearHandle = useCallback(
    (anchorId: string, deltaX: number, deltaY: number): boolean => {
      const anchorNode = getNode(anchorId);
      if (!anchorNode || anchorNode.type !== 'lineAnchor') return false;
      const associatedEdge = getEdges().find(
        edge => edge.source === anchorId || edge.target === anchorId
      );
      if (!associatedEdge) return false;
      const isSourceSide = associatedEdge.source === anchorId;
      const side: 'source' | 'target' = isSourceSide ? 'source' : 'target';

      const handleBefore = anchorHandleFlowPosition(anchorNode.position, side);
      const postMoveHandleFlow: XYPosition = {
        x: handleBefore.x + deltaX,
        y: handleBefore.y + deltaY,
      };
      const snapRadiusPx = Math.max(
        LINE_RECONNECT_SNAP_RADIUS_PX,
        KEYBOARD_SNAP_RADIUS_FLOW_UNITS * getZoom()
      );
      const snap = findNearestHandle(
        flowToScreenPosition(postMoveHandleFlow),
        anchorId,
        side,
        snapRadiusPx
      );
      if (!snap) return false;

      setEdges(currentEdges =>
        currentEdges.map(currentEdge => {
          if (currentEdge.id !== associatedEdge.id) return currentEdge;
          return isSourceSide
            ? {
                ...currentEdge,
                source: snap.nodeId,
                sourceHandle: snap.handleId ?? undefined,
              }
            : {
                ...currentEdge,
                target: snap.nodeId,
                targetHandle: snap.handleId ?? undefined,
              };
        })
      );
      // The anchor we were focused on is about to be orphan-pruned; move
      // focus to the edge it terminated so the user stays on a useful
      // target. Deferred so the focus call runs after React commits and
      // the new edge wrapper exists in the DOM.
      setTimeout(() => focusEntry({type: 'edge', id: associatedEdge.id}), 0);
      return true;
    },
    [getEdges, getNode, getZoom, flowToScreenPosition, setEdges, focusEntry]
  );

  const handleMoveNode = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (!focusedNodeId) return false;
      const {deltaX, deltaY} = getArrowDelta(event.key);
      if (!deltaX && !deltaY) return false;
      event.preventDefault();
      event.stopPropagation();
      // For a focused line anchor, try snap-on-step first. If a real
      // handle is in range, the edge attaches there and the anchor is
      // pruned. Otherwise (or for any non-anchor node) fall through to
      // the plain translate.
      if (snapAnchorIfNearHandle(focusedNodeId, deltaX, deltaY)) {
        return true;
      }
      setNodes(currentNodes =>
        moveNodesByDelta(currentNodes, [focusedNodeId], deltaX, deltaY)
      );
      return true;
    },
    [setNodes, snapAnchorIfNearHandle]
  );

  // Per side: figure out the post-move handle position, check if it would
  // land on another node's handle (snap), and otherwise either translate
  // the existing anchor or detach the real-node end into a fresh anchor at
  // the post-move position. Snapping skips both the anchor creation and
  // the translate; any orphaned anchor is cleaned up by the prune effect.
  // Returns true when at least one mutation was applied.
  const moveEdgeByDelta = useCallback(
    (edgeId: string, deltaX: number, deltaY: number): boolean => {
      const focusedEdge = getEdge(edgeId);
      if (!focusedEdge) return false;

      const anchorIdsToMove: string[] = [];
      const newAnchors: SketchlabReactFlowNode[] = [];
      const edgePatch: Partial<SketchlabReactFlowEdge> = {};

      const collectSide = (side: 'source' | 'target') => {
        const endpointId = focusedEdge[side];
        const endpointNode = getNode(endpointId);
        if (!endpointNode) return;
        const isAnchor = endpointNode.type === 'lineAnchor';

        let postMoveHandleFlow: XYPosition;
        if (isAnchor) {
          const handleBefore = anchorHandleFlowPosition(
            endpointNode.position,
            side
          );
          postMoveHandleFlow = {
            x: handleBefore.x + deltaX,
            y: handleBefore.y + deltaY,
          };
        } else {
          const handlePos = getHandleFlowPosition(
            endpointId,
            side === 'source'
              ? focusedEdge.sourceHandle
              : focusedEdge.targetHandle,
            screenToFlowPosition
          );
          if (!handlePos) return;
          postMoveHandleFlow = {
            x: handlePos.x + deltaX,
            y: handlePos.y + deltaY,
          };
        }

        // Keyboard moves are stepwise, so the snap window must be at
        // least one step wide in flow space — otherwise an arrow press
        // can step past a handle without ever landing inside the radius.
        // We multiply by zoom so the flow-unit window stays consistent
        // regardless of how zoomed-in the canvas is, and floor at the
        // mouse default so we're never less generous than mouse drags.
        const keyboardRadiusPx = KEYBOARD_SNAP_RADIUS_FLOW_UNITS * getZoom();
        const snapRadiusPx = Math.max(
          LINE_RECONNECT_SNAP_RADIUS_PX,
          keyboardRadiusPx
        );
        const snap = findNearestHandle(
          flowToScreenPosition(postMoveHandleFlow),
          endpointId,
          side,
          snapRadiusPx
        );
        if (snap) {
          if (side === 'source') {
            edgePatch.source = snap.nodeId;
            edgePatch.sourceHandle = snap.handleId ?? undefined;
          } else {
            edgePatch.target = snap.nodeId;
            edgePatch.targetHandle = snap.handleId ?? undefined;
          }
          return;
        }

        if (isAnchor) {
          anchorIdsToMove.push(endpointId);
          return;
        }
        // Detach: spawn an anchor already at the post-move position so we
        // don't need to translate it afterwards.
        const anchor = createLineAnchorAtHandle(postMoveHandleFlow, side);
        newAnchors.push(anchor);
        if (side === 'source') {
          edgePatch.source = anchor.id;
          edgePatch.sourceHandle = 'line-anchor-source';
        } else {
          edgePatch.target = anchor.id;
          edgePatch.targetHandle = 'line-anchor-target';
        }
      };
      collectSide('source');
      collectSide('target');

      const didAnything =
        anchorIdsToMove.length > 0 ||
        newAnchors.length > 0 ||
        Object.keys(edgePatch).length > 0;
      if (!didAnything) return false;

      if (newAnchors.length > 0) {
        setNodes(currentNodes => [...currentNodes, ...newAnchors]);
      }
      if (Object.keys(edgePatch).length > 0) {
        setEdges(currentEdges =>
          currentEdges.map(currentEdge =>
            currentEdge.id === edgeId
              ? {...currentEdge, ...edgePatch}
              : currentEdge
          )
        );
      }
      if (anchorIdsToMove.length > 0) {
        setNodes(currentNodes =>
          moveNodesByDelta(currentNodes, anchorIdsToMove, deltaX, deltaY)
        );
      }
      // The mutation can knock focus off the edge wrapper. Remember which
      // edge we just moved so the next arrow keypress can fall back to it
      // when DOM focus has drifted to body, and restore focus on the next
      // tick so the visible focus outline comes back. The window-level
      // listener picks up arrows even when this refocus doesn't take.
      keyboardMovingEdgeRef.current = edgeId;
      setTimeout(() => focusEntry({type: 'edge', id: edgeId}), 0);
      return true;
    },
    [
      getEdge,
      getNode,
      getZoom,
      setNodes,
      setEdges,
      screenToFlowPosition,
      flowToScreenPosition,
      focusEntry,
    ]
  );

  const handleMoveEdge = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedEdgeId} = keyContext;
      if (!focusedEdgeId) return false;
      const {deltaX, deltaY} = getArrowDelta(event.key);
      if (!deltaX && !deltaY) return false;
      if (!moveEdgeByDelta(focusedEdgeId, deltaX, deltaY)) return false;
      event.preventDefault();
      event.stopPropagation();
      return true;
    },
    [moveEdgeByDelta]
  );

  /**
   * "[" and "]" decrease or increase the size of the focused node.
   * Line-anchor pseudo-nodes are excluded — they have no visible body
   * and are resized through 'ghost' nodes.
   * Modifier keys control the resize axis:
   *   No modifier → both width and height (uniform resize)
   *   Shift       → width only (horizontal)
   *   Alt         → height only (vertical)
   */
  const handleResize = useCallback(
    (keyContext: KeyContext): boolean => {
      const {event, focusedNodeId} = keyContext;
      if (!focusedNodeId) return false;
      if (event.code !== 'BracketLeft' && event.code !== 'BracketRight') {
        return false;
      }
      if (isLineAnchorNodeId(focusedNodeId, nodes)) return false;

      const focusedNode = getNode(focusedNodeId);
      const direction = (event.code === 'BracketRight' ? 1 : -1) as 1 | -1;
      const step = direction * KEYBOARD_RESIZE_STEP;
      const deltaWidth = event.altKey ? 0 : step;
      const deltaHeight = event.shiftKey ? 0 : step;

      event.preventDefault();
      event.stopPropagation();
      setNodes(currentNodes =>
        resizeNodeByDelta(currentNodes, focusedNodeId, deltaWidth, deltaHeight)
      );
      const nodeLabel = focusedNode ? getNodeLabel(focusedNode) : focusedNodeId;
      const axis = event.altKey ? 'height' : event.shiftKey ? 'width' : 'size';
      announce(
        `${nodeLabel} ${axis} ${direction > 0 ? 'enlarged' : 'shrunk'}.`
      );
      return true;
    },
    [nodes, getNode, setNodes, announce]
  );

  /**
   * Enter on a focused node (outside connect mode) enters edit mode.
   * Do NOT stopPropagation here: React Flow's handler needs to fire
   * to select the node, which enables arrow-key movement.
   */
  const handleEnterEdit = useCallback((keyContext: KeyContext): boolean => {
    const {event, focusedNodeId} = keyContext;
    if (event.key !== 'Enter' || !focusedNodeId) return false;
    const nodeEl = getElementForEntry({type: 'node', id: focusedNodeId});
    const editable = nodeEl?.querySelector<HTMLElement>(
      '[role="textbox"], button, input'
    );
    if (!editable) return false;
    event.preventDefault();
    if (editable.tagName === 'BUTTON') {
      editable.click();
    } else {
      editable.focus();
    }
    return true;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Don't intercept non-Tab keys when the user is editing text content.
      if (isEditingTarget(target) && event.key !== 'Tab') {
        return;
      }

      const focusedEntry = getEntryFromDOM(target);
      const arrowDelta = getArrowDelta(event.key);
      const isArrowKey = !!arrowDelta.deltaX || !!arrowDelta.deltaY;
      // Clear the moving-edge ref on any non-arrow key so Tab/Escape/etc.
      // don't get hijacked by it later.
      if (!isArrowKey) {
        keyboardMovingEdgeRef.current = null;
      }
      // When DOM focus has drifted off a node/edge but the user is still
      // arrow-keying, fall back to the edge we were just moving.
      const fallbackEdgeId =
        isArrowKey && !focusedEntry
          ? keyboardMovingEdgeRef.current ?? undefined
          : undefined;
      const keyContext: KeyContext = {
        event,
        focusedEntry,
        focusedNodeId:
          focusedEntry?.type === 'node' ? focusedEntry.id : undefined,
        focusedEdgeId:
          focusedEntry?.type === 'edge' ? focusedEntry.id : fallbackEdgeId,
      };

      // Tab navigation works in both read-only and edit mode.
      if (handleTabNavigation(keyContext)) return;

      // Escape cancels connect mode.
      if (handleEscapeCancelConnect(keyContext)) return;

      // Everything below mutates the canvas and requires edit access.
      if (readOnly) return;

      if (handleOpenToolbar(keyContext)) return;
      if (handleConnectToggle(keyContext)) return;
      if (handleConnectComplete(keyContext)) return;

      // All further interactions require an unlocked element, if an element is focused.
      if (
        keyContext.focusedNodeId &&
        getNode(keyContext.focusedNodeId)?.data?.locked
      ) {
        return;
      }
      if (
        keyContext.focusedEdgeId &&
        getEdge(keyContext.focusedEdgeId)?.data?.locked
      ) {
        return;
      }

      if (handleMoveNode(keyContext)) return;
      if (handleMoveEdge(keyContext)) return;
      if (handleResize(keyContext)) return;
      handleEnterEdit(keyContext);
    },
    [
      readOnly,
      getEdge,
      getNode,
      handleTabNavigation,
      handleEscapeCancelConnect,
      handleOpenToolbar,
      handleConnectToggle,
      handleConnectComplete,
      handleMoveNode,
      handleMoveEdge,
      handleResize,
      handleEnterEdit,
    ]
  );

  // When DOM focus drifts off the edge (React Flow can knock the wrapper
  // out of focus during a mutation), keydown events fire on `body` and
  // never traverse the canvas div, so the `onKeyDownCapture` handler
  // doesn't run. While we're tracking a recently-moved edge, listen at
  // the window level so arrow keys still translate the same edge. The
  // canvas's `onKeyDownCapture` calls stopPropagation for events it
  // handles, so this bubble-phase listener only fires for events whose
  // path doesn't go through the canvas — exactly the recovery case.
  useEffect(() => {
    const handler = (nativeEvent: KeyboardEvent) => {
      const edgeId = keyboardMovingEdgeRef.current;
      if (!edgeId) return;
      const {deltaX, deltaY} = getArrowDelta(nativeEvent.key);
      if (!deltaX && !deltaY) return;
      const target = nativeEvent.target as HTMLElement;
      if (isEditingTarget(target)) return;
      if (moveEdgeByDelta(edgeId, deltaX, deltaY)) {
        nativeEvent.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [moveEdgeByDelta]);

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
