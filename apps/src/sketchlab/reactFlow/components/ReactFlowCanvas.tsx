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
  ARROW_MARKER_HEIGHT_PX,
  ARROW_MARKER_WIDTH_PX,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  LINE_ANCHOR_SIZE_PX,
  LINE_DEFAULT_LENGTH_PX,
  SAVE_DEBOUNCE_MS,
} from '../constants';
import {
  SketchLabReadOnlyProvider,
  ToolbarVisibilityProvider,
  type ToolbarTarget,
} from '../context';
import LineEdgeToolbar from '../elementToolbars/LineEdgeToolbar';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';
import {useFocusManagement} from '../hooks/useFocusManagement';
import {useKeyboardNavigation} from '../hooks/useKeyboardNavigation';
import {useLineEdgeDrag} from '../hooks/useLineEdgeDrag';
import {useLineToolbar} from '../hooks/useLineToolbar';
import {useTabOrder} from '../hooks/useTabOrder';
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
import {isLineEdge} from '../utils/lineEdges';

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

  const {screenToFlowPosition, getNode} = useReactFlow();
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
      setNodes,
      setEdges,
      readOnly,
      openToolbar,
    });

  const {handleEdgeMouseDown} = useLineEdgeDrag({
    readOnly,
    setNodes,
    screenToFlowPosition,
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
        const locked = node.data?.locked === true;
        return {
          ...node,
          selected,
          ...(locked && {
            draggable: false,
            connectable: false,
            deletable: false,
          }),
          className: isConnectSource ? styles.connectSource : undefined,
          domAttributes: {
            ...domAttributes,
            ...(isConnectSource && {'aria-selected': true}),
          },
        };
      }),
      // TODO: Add meaningful ariaLabel to edges using node labels instead of
      // raw IDs (React Flow defaults to "Edge from {sourceId} to {targetId}").
      displayEdges: edges.map(edge => {
        const lineEdge = isLineEdge(edge, nodes);
        const {selected, domAttributes} = applyDisplayProps(edge, 'edge');
        return {
          ...edge,
          selected,
          className: lineEdge ? styles.lineEdge : undefined,
          domAttributes: {
            ...domAttributes,
            ...(lineEdge && !readOnly
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

  const onConnect: OnConnect = useCallback(
    connection =>
      setEdges(currentEdges => {
        const {source, target} = connection;
        if (!source || !target) {
          return currentEdges;
        }
        if (!canCreateConnection(source, target, nodes)) {
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

  const handleEdgesDelete = useCallback(
    (deletedEdges: SketchlabReactFlowEdge[]) => {
      setNodes(currentNodes => {
        const lineAnchorIdsToDelete = new Set<string>();

        deletedEdges.forEach(edge => {
          const sourceNode = getNode(edge.source);
          const targetNode = getNode(edge.target);
          if (
            sourceNode?.type === 'lineAnchor' &&
            targetNode?.type === 'lineAnchor'
          ) {
            lineAnchorIdsToDelete.add(edge.source);
            lineAnchorIdsToDelete.add(edge.target);
          }
        });

        if (lineAnchorIdsToDelete.size === 0) {
          return currentNodes;
        }

        return currentNodes.filter(node => !lineAnchorIdsToDelete.has(node.id));
      });
    },
    [getNode, setNodes]
  );

  const handleAddNode = useCallback(
    (request: AddNodeRequest) => {
      const {type} = request;
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2 + stagger,
        y: window.innerHeight / 2 + stagger,
      });

      // For lines/arrows, create two hidden anchor nodes and connect them.
      if (type === 'line' || type === 'arrow') {
        const sourceAnchorId = createUuid();
        const targetAnchorId = createUuid();
        const lineEdgeId = createUuid();

        const sourceAnchor: SketchlabReactFlowNode = {
          id: sourceAnchorId,
          type: 'lineAnchor',
          position: {
            x:
              centerPosition.x -
              LINE_DEFAULT_LENGTH_PX / 2 -
              LINE_ANCHOR_SIZE_PX,
            y: centerPosition.y - LINE_ANCHOR_SIZE_PX / 2,
          },
          data: {lineAnchorRole: 'source'},
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
            y: centerPosition.y - LINE_ANCHOR_SIZE_PX / 2,
          },
          data: {lineAnchorRole: 'target'},
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
          ...(type === 'arrow' && {
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: DEFAULT_STROKE_COLOR,
              width: ARROW_MARKER_WIDTH_PX,
              height: ARROW_MARKER_HEIGHT_PX,
              strokeWidth: DEFAULT_LINE_WIDTH,
            },
          }),
          style: {
            stroke: DEFAULT_STROKE_COLOR,
            strokeWidth: DEFAULT_LINE_WIDTH,
          },
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

      // Move focus to the new node after React Flow renders it.
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(
        () => focusEntry({type: 'node', id: newNodeId}),
        FOCUS_DELAY_MS
      );
    },
    [focusEntry, screenToFlowPosition, setNodes, setEdges]
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

  const {
    handleEdgeClick,
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
  } = useLineToolbar({
    edges,
    nodes,
    readOnly,
    openToolbarTarget,
    openToolbar,
    setEdges,
  });

  return (
    <SketchLabReadOnlyProvider value={readOnly}>
      <ToolbarVisibilityProvider value={toolbarVisibility}>
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
            onEdgesDelete={handleEdgesDelete}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
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
          >
            {openLineEdge && (
              <LineEdgeToolbar
                edge={openLineEdge}
                anchorNodeId={openLineEdge.source}
                onSelectColor={value =>
                  setLineEdgeColor(openLineEdge.id, value)
                }
                onSelectWidth={value =>
                  setLineEdgeWidth(openLineEdge.id, value)
                }
                onSelectStrokeStyle={value =>
                  setLineEdgeStrokeStyle(openLineEdge.id, value)
                }
                onSelectArrowHeads={value =>
                  setLineEdgeArrowHeads(openLineEdge.id, value)
                }
              />
            )}
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </ToolbarVisibilityProvider>
    </SketchLabReadOnlyProvider>
  );
}
