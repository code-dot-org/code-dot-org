import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type NodeChange,
  type NodeTypes,
  type OnConnectEnd,
  type OnNodeDrag,
  type XYPosition,
} from '@xyflow/react';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {translate} from '../localization';
import {isGhostNodeId} from '../model/constants';
import type {
  EffectGraphScope,
  EffectPortType,
  EffectValueType,
} from '../model/types';
import type {EffectNodeRegistry} from '../nodes/registry';

import {CommentFlowNode} from './CommentFlowNode';
import {ConnectionHint} from './ConnectionHint';
import {
  canConnect,
  connectableNodes,
  portInfoOf,
  portTypeOf,
  type ConnectableNode,
  type ResolvedPortTypes,
} from './connectionRules';
import {EffectFlowEdge} from './EffectFlowEdge';
import {EffectFlowNode} from './EffectFlowNode';
import styles from './EffectGraphCanvas.module.css';
import {
  FLOW_EDGE_TYPE,
  FLOW_COMMENT_TYPE,
  FLOW_GHOST_TYPE,
  FLOW_NODE_TYPE,
  reconcileFlowNodes,
  toFlowEdges,
  toFlowNodes,
  type AnyEffectFlowNode,
} from './flowMapping';
import {GhostFlowNode} from './GhostFlowNode';
import {NODE_DRAG_MIME} from './NodePalette';
import {defaultSwizzle, swizzlePlan, type SwizzlePlan} from './swizzle';
import {SwizzlePicker} from './SwizzlePicker';
import {usePinnedGhosts, type GhostAnchors} from './usePinnedGhosts';
import {WireDropPicker} from './WireDropPicker';

import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
  [FLOW_NODE_TYPE]: EffectFlowNode,
  [FLOW_COMMENT_TYPE]: CommentFlowNode,
  [FLOW_GHOST_TYPE]: GhostFlowNode,
};

const edgeTypes: EdgeTypes = {
  [FLOW_EDGE_TYPE]: EffectFlowEdge,
};

/**
 * Ghosts are invisible in the minimap: they hug the canvas edges and follow
 * the viewport, so drawing them would add specks that slide around as the
 * learner pans — noise with no information.
 */
function minimapNodeColor(node: {type?: string}): string {
  if (node.type === FLOW_GHOST_TYPE) {
    return 'transparent';
  }
  return node.type === FLOW_COMMENT_TYPE ? '#4a4463' : '#39415f';
}

/** The existing end of a dangling wire, as handed to `onAddConnectedNode`. */
export interface WireOrigin {
  node: string;
  port: string;
  /** Which end exists: `source` builds forward, `target` builds backward. */
  direction: 'source' | 'target';
}

export interface EffectGraphCanvasProps {
  document: EffectGraphScope;
  registry: EffectNodeRegistry;
  /** Knob elements in the fixed rows, by ghost node id. */
  anchors: GhostAnchors;
  /**
   * The canvas element, owned by the editor so it can convert its own screen
   * points (palette clicks land mid-view) with the same geometry the canvas
   * uses for pinning and drops.
   */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Concrete type per edge id, for coloring wires. See `EdgeViewState`. */
  wireTypes?: ReadonlyMap<string, EffectValueType>;
  onMoveNode: (nodeId: string, position: {x: number; y: number}) => void;
  onRemoveNode: (nodeId: string) => void;
  onConnect: (connection: Connection, swizzle?: string) => void;
  onDisconnect: (edgeId: string) => void;
  /** Place a node from the palette at a workspace position. */
  onAddNode: (type: string, position: XYPosition) => void;
  /** Place a node at a position and wire it to `origin` in one step. */
  onAddConnectedNode: (
    type: string,
    position: XYPosition,
    origin: WireOrigin,
    viaPort: string,
  ) => void;
  /**
   * Concrete types from the last compile. A generic port declares no type of
   * its own, so without these the editor cannot tell that this particular
   * Multiply is currently carrying a vec2.
   */
  resolvedTypes?: ResolvedPortTypes;
  /**
   * The concrete type of an output port, worked out on demand — including for
   * nodes the last compile never reached. Consulted once per drop.
   */
  resolveSourceType?: (
    nodeId: string,
    portId: string,
  ) => EffectValueType | undefined;
  /** The wire the current compile error is about. See `EdgeViewState`. */
  errorEdgeId?: string | null;
  /** Reports the selected workspace-node ids, for duplicate and copy. */
  onSelectedNodesChange?: (nodeIds: string[]) => void;
}

/** Half the minimum node width, for centring a new node on a point. */
const NODE_HALF_WIDTH = 84;

/** Estimated menu size, for keeping the picker inside the canvas. */
const PICKER_WIDTH = 190;

/** Roughly the swizzle menu's height, so it never opens off the top edge. */
const SWIZZLE_MENU_HEIGHT = 110;
const PICKER_MAX_HEIGHT = 280;

/**
 * A drop that landed on a narrower port than the wire carries. Nothing is
 * written until the learner picks a component, so the graph is untouched if
 * they cancel.
 */
interface PendingSwizzle {
  connection: Connection;
  plan: SwizzlePlan;
  sourceType: EffectPortType;
  targetLabel: string;
  /** Where the menu opens, relative to the canvas container. */
  menu: {left: number; top: number};
}

interface PendingWire {
  origin: WireOrigin;
  wireType: EffectPortType;
  /** Where the new node will be placed. */
  flow: XYPosition;
  /** Where the menu opens, relative to the canvas container. */
  menu: {left: number; top: number};
}

function clampToRange(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), Math.max(low, high));
}

/**
 * The pannable, zoomable workspace between the fixed input and output rows.
 *
 * Node state is held here and driven by `applyNodeChanges`, not derived fresh
 * from the document on every render. React Flow keeps things on the node it
 * has to measure for itself — `measured`, `dragging`, `selected` — and a
 * rebuilt array throws them away. Losing `measured` is what leaves a node
 * "not initialized" and makes dragging it misbehave.
 *
 * The document remains the source of truth for structure and for resting
 * positions; `reconcileFlowNodes` folds it back in without disturbing what
 * React Flow owns.
 */
export function EffectGraphCanvas({
  document,
  registry,
  anchors,
  containerRef,
  wireTypes,
  onMoveNode,
  onRemoveNode,
  onConnect,
  onDisconnect,
  onAddNode,
  onAddConnectedNode,
  resolvedTypes,
  resolveSourceType,
  errorEdgeId,
  onSelectedNodesChange,
}: EffectGraphCanvasProps) {
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [pendingWire, setPendingWire] = useState<PendingWire | null>(null);
  const [pendingSwizzle, setPendingSwizzle] = useState<PendingSwizzle | null>(
    null,
  );
  const {screenToFlowPosition} = useReactFlow();

  const ghostPositions = usePinnedGhosts(anchors, containerRef);

  const [nodes, setNodes] = useState<AnyEffectFlowNode[]>(() =>
    toFlowNodes(document, registry, ghostPositions),
  );

  // Fold document and pinning changes into the nodes React Flow is managing.
  useEffect(() => {
    setNodes(current =>
      reconcileFlowNodes(current, document, registry, ghostPositions),
    );
  }, [document, registry, ghostPositions]);

  const edges = useMemo<Edge[]>(
    () =>
      toFlowEdges(document, {
        selectedIds: selectedEdgeIds,
        hoveredId: hoveredEdgeId,
        wireTypes,
        errorEdgeId,
      }),
    [document, selectedEdgeIds, hoveredEdgeId, wireTypes, errorEdgeId],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<AnyEffectFlowNode>[]) => {
      // Apply every change, including the `dimensions` ones carrying measured
      // sizes. Dropping those is what breaks dragging.
      setNodes(current => applyNodeChanges(changes, current));

      for (const change of changes) {
        if (change.type === 'remove') {
          onRemoveNode(change.id);
        }
      }
    },
    [onRemoveNode],
  );

  // Positions go to the document once the drag finishes rather than on every
  // pointer move: one undo step per drag, and no document churn mid-gesture.
  const handleNodeDragStop = useCallback<OnNodeDrag<AnyEffectFlowNode>>(
    (_event, node) => {
      if (!isGhostNodeId(node.id)) {
        onMoveNode(node.id, node.position);
      }
    },
    [onMoveNode],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      for (const change of changes) {
        switch (change.type) {
          case 'remove':
            onDisconnect(change.id);
            break;
          case 'select':
            // Applying this is what makes the delete key work: React Flow
            // reads selection back out of the controlled `edges` prop, so an
            // ignored `select` leaves nothing selected to delete.
            setSelectedEdgeIds(current => {
              const next = new Set(current);
              if (change.selected) {
                next.add(change.id);
              } else {
                next.delete(change.id);
              }
              return next;
            });
            break;
          default:
            break;
        }
      }
    },
    [onDisconnect],
  );

  /**
   * Take the drop, but ask before narrowing.
   *
   * `canConnect` lets a wide wire land on a narrow port so the drag can
   * succeed; this is where that permission is paid for. The menu opens on the
   * target handle itself — measured from the DOM rather than the pointer, so
   * it is at the connection point however the drop was made (mouse, touch, or
   * a release inside the snap radius).
   */
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) {
        return;
      }

      const declaredType = portTypeOf(
        document,
        registry,
        connection.source,
        connection.sourceHandle,
        'source',
      );
      // A generic output declares nothing about what it carries; ask what it
      // resolved to before deciding whether this drop needs narrowing.
      const sourceType =
        declaredType === 'generic'
          ? (resolveSourceType?.(connection.source, connection.sourceHandle) ??
            declaredType)
          : declaredType;
      const targetInfo = portInfoOf(
        document,
        registry,
        connection.target,
        connection.targetHandle,
        'target',
      );
      const plan =
        sourceType && targetInfo
          ? swizzlePlan(sourceType, targetInfo.type)
          : null;

      if (!plan || !sourceType || !targetInfo) {
        onConnect(connection);
        return;
      }

      const container = containerRef.current;
      const handle = container?.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${CSS.escape(connection.target)}"] ` +
          `.react-flow__handle[data-handleid="${CSS.escape(connection.targetHandle)}"]`,
      );
      if (!container || !handle) {
        // No handle to point at — take the natural components rather than
        // dropping the learner's gesture on the floor.
        onConnect(connection, defaultSwizzle(plan));
        return;
      }

      const bounds = container.getBoundingClientRect();
      const rect = handle.getBoundingClientRect();
      setPendingSwizzle({
        connection,
        plan,
        sourceType,
        targetLabel: translate(targetInfo.label),
        menu: {
          left: clampToRange(
            rect.left + rect.width / 2 - bounds.left,
            PICKER_WIDTH / 2,
            bounds.width - PICKER_WIDTH / 2,
          ),
          // A few pixels of clearance so the menu never sits on the dot it
          // is asking about.
          top: Math.max(rect.top - bounds.top - 8, SWIZZLE_MENU_HEIGHT),
        },
      });
    },
    [document, registry, containerRef, resolveSourceType, onConnect],
  );

  const handleSwizzlePick = useCallback(
    (swizzle: string) => {
      if (pendingSwizzle) {
        onConnect(pendingSwizzle.connection, swizzle);
        setPendingSwizzle(null);
      }
    },
    [pendingSwizzle, onConnect],
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) =>
      canConnect(document, registry, connection as Connection, resolvedTypes),
    [document, registry, resolvedTypes],
  );

  // --- Dropping a palette item places the node where it lands. ---

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(NODE_DRAG_MIME)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      const type = event.dataTransfer.getData(NODE_DRAG_MIME);
      if (!type) {
        return;
      }
      event.preventDefault();
      const flow = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onAddNode(type, {x: flow.x - NODE_HALF_WIDTH, y: flow.y});
    },
    [screenToFlowPosition, onAddNode],
  );

  // --- Dropping a wire on empty canvas opens the connected-node picker. ---

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      // A successful connection, or a drop on a handle (compatible or not),
      // is not this feature — only a wire released over nothing.
      if (
        connectionState.isValid ||
        connectionState.toNode ||
        !connectionState.fromNode ||
        !connectionState.fromHandle?.id
      ) {
        return;
      }

      const {clientX, clientY} =
        'changedTouches' in event ? event.changedTouches[0] : event;
      const origin: WireOrigin = {
        node: connectionState.fromNode.id,
        port: connectionState.fromHandle.id,
        direction: connectionState.fromHandle.type,
      };
      const wireType = portTypeOf(
        document,
        registry,
        origin.node,
        origin.port,
        origin.direction,
      );
      if (!wireType) {
        return;
      }

      const bounds = containerRef.current?.getBoundingClientRect();
      setPendingWire({
        origin,
        wireType,
        flow: screenToFlowPosition({x: clientX, y: clientY}),
        menu: {
          left: clampToRange(
            clientX - (bounds?.left ?? 0),
            8,
            (bounds?.width ?? PICKER_WIDTH) - PICKER_WIDTH - 8,
          ),
          top: clampToRange(
            clientY - (bounds?.top ?? 0),
            8,
            (bounds?.height ?? PICKER_MAX_HEIGHT) - PICKER_MAX_HEIGHT - 8,
          ),
        },
      });
    },
    [document, registry, containerRef, screenToFlowPosition],
  );

  const pickerOptions = useMemo(
    () =>
      pendingWire
        ? connectableNodes(
            registry,
            pendingWire.wireType,
            pendingWire.origin.direction,
          )
        : [],
    [registry, pendingWire],
  );

  const handlePick = useCallback(
    (option: ConnectableNode) => {
      if (!pendingWire) {
        return;
      }
      // Building forward, the new node hangs below the drop point with its
      // input near the wire; building backward it sits above, output down.
      const position =
        pendingWire.origin.direction === 'source'
          ? {x: pendingWire.flow.x - NODE_HALF_WIDTH, y: pendingWire.flow.y}
          : {
              x: pendingWire.flow.x - NODE_HALF_WIDTH,
              y: pendingWire.flow.y - 90,
            };

      onAddConnectedNode(
        option.definition.type,
        position,
        pendingWire.origin,
        option.portId,
      );
      setPendingWire(null);
    },
    [pendingWire, onAddConnectedNode],
  );

  const dismissPicker = useCallback(() => setPendingWire(null), []);

  // React Flow requires this to be referentially stable, or selection updates
  // can loop. Ghosts never appear here: they are `selectable: false`.
  const handleSelectionChange = useCallback(
    ({nodes: selectedNodes}: {nodes: AnyEffectFlowNode[]}) => {
      onSelectedNodesChange?.(selectedNodes.map(node => node.id));
    },
    [onSelectedNodesChange],
  );

  return (
    <div
      ref={containerRef}
      className={styles.canvas}
      // A drop target, not an interactive element: it has no keyboard or
      // focus behaviour of its own. The accessible route to the same outcome
      // is activating a palette button, which places the node mid-view.
      role="presentation"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onNodeDragStop={handleNodeDragStop}
        onEdgesChange={handleEdgesChange}
        onSelectionChange={handleSelectionChange}
        onConnect={handleConnect}
        onConnectEnd={handleConnectEnd}
        onEdgeMouseEnter={(_event, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        isValidConnection={isValidConnection}
        // Delete is what most people reach for; Backspace is React Flow's
        // default and worth keeping for anyone already used to it.
        deleteKeyCode={['Delete', 'Backspace']}
        // Auto-pan during a connection drag is poison here: the ghost dots are
        // pinned to the canvas edge by design, so every wire dragged from a
        // row knob starts inside the auto-pan zone — the canvas slides out
        // from under the drag and the intended target moves away from the
        // pointer. Reaching a far-off node is what the wire-drop picker is
        // for; panning stays an explicit gesture.
        autoPanOnConnect={false}
        // Ghost handles sit under the row knobs and have no node body to aim
        // at, so give a wire being dragged toward one a generous snap radius.
        connectionRadius={28}
        connectionLineStyle={{strokeWidth: 2}}
        defaultEdgeOptions={{type: 'default', style: {strokeWidth: 2}}}
        minZoom={0.25}
        maxZoom={2}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className={styles.controls} showInteractive={false} />
        <MiniMap
          className={styles.minimap}
          pannable
          zoomable
          ariaLabel={translate('Graph overview')}
          bgColor="var(--effect-editor-canvas, #1b1f30)"
          maskColor="rgb(14 17 30 / 65%)"
          nodeColor={minimapNodeColor}
          nodeStrokeColor="transparent"
        />
      </ReactFlow>

      <ConnectionHint
        document={document}
        registry={registry}
        containerRef={containerRef}
        resolvedTypes={resolvedTypes}
      />

      {pendingSwizzle && (
        <SwizzlePicker
          plan={pendingSwizzle.plan}
          sourceType={pendingSwizzle.sourceType}
          targetLabel={pendingSwizzle.targetLabel}
          position={pendingSwizzle.menu}
          onPick={handleSwizzlePick}
          onDismiss={() => setPendingSwizzle(null)}
        />
      )}

      {pendingWire && (
        <WireDropPicker
          options={pickerOptions}
          wireType={pendingWire.wireType}
          position={pendingWire.menu}
          onPick={handlePick}
          onDismiss={dismissPicker}
        />
      )}
    </div>
  );
}
