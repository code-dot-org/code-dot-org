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
  ReactFlowSource,
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {createUuid} from '@cdo/apps/utils';

import {computeTabOrder, type TabOrderEntry} from '../computeTabOrder';
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from '../constants';
import {SketchLabReadOnlyProvider} from '../context';
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

/**
 * Pick source/target handles based on relative node positions so the arrow
 * points in a sensible direction (e.g. right-source → left-target when the
 * target is to the right of the source).
 */
function pickHandles(
  source: SketchlabReactFlowNode,
  target: SketchlabReactFlowNode
) {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? {sourceHandle: 'right-source', targetHandle: 'left-target'}
      : {sourceHandle: 'left-source', targetHandle: 'right-target'};
  }
  return dy >= 0
    ? {sourceHandle: 'bottom-source', targetHandle: 'top-target'}
    : {sourceHandle: 'top-source', targetHandle: 'bottom-target'};
}

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

  const {screenToFlowPosition, fitView, getZoom} = useReactFlow();
  const addedNodeCountRef = useRef(0);

  // Keyboard-only edge creation: tracks the source node while in connect mode.
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectAnnouncement, setConnectAnnouncement] = useState('');

  // Logical tab order: nodes with edges interleaved, then orphans.
  const tabOrder = useMemo(
    () =>
      computeTabOrder(
        nodes as SketchlabReactFlowNode[],
        edges as SketchlabReactFlowEdge[]
      ),
    [nodes, edges]
  );

  // Roving tabindex: exactly one element has tabIndex 0, the rest get -1.
  const [activeTabEntry, setActiveTabEntry] = useState<TabOrderEntry | null>(
    null
  );

  useEffect(() => {
    // If the active element was deleted, reset to the first in tab order.
    if (
      activeTabEntry &&
      !tabOrder.some(
        e => e.type === activeTabEntry.type && e.id === activeTabEntry.id
      )
    ) {
      setActiveTabEntry(tabOrder[0] ?? null);
    }
  }, [tabOrder, activeTabEntry]);

  useEffect(() => {
    const active = activeTabEntry ?? tabOrder[0] ?? null;
    document.querySelectorAll<HTMLElement>('.react-flow__node').forEach(el => {
      const id = el.getAttribute('data-id');
      el.tabIndex = active?.type === 'node' && active.id === id ? 0 : -1;
    });
    document.querySelectorAll<HTMLElement>('.react-flow__edge').forEach(el => {
      const id = el.getAttribute('data-id');
      el.tabIndex = active?.type === 'edge' && active.id === id ? 0 : -1;
    });
  }, [tabOrder, activeTabEntry]);

  const focusEntry = useCallback(
    (entry: TabOrderEntry) => {
      setActiveTabEntry(entry);
      const selector =
        entry.type === 'node'
          ? `.react-flow__node[data-id="${entry.id}"]`
          : `.react-flow__edge[data-id="${entry.id}"]`;
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      el.focus();
      // Pan only if the element is off-screen.
      if (entry.type === 'node') {
        const container = el.closest<HTMLElement>('.react-flow');
        if (container) {
          const cr = container.getBoundingClientRect();
          const nr = el.getBoundingClientRect();
          const offScreen =
            nr.right < cr.left ||
            nr.left > cr.right ||
            nr.bottom < cr.top ||
            nr.top > cr.bottom;
          if (offScreen) {
            const zoom = getZoom();
            fitView({nodes: [{id: entry.id}], duration: 200, maxZoom: zoom});
          }
        }
      }
    },
    [fitView, getZoom]
  );

  const handleFocusCapture = useCallback(
    (e: React.FocusEvent) => {
      const target = e.target as HTMLElement;
      const nodeEl = target.closest('.react-flow__node');
      const edgeEl = target.closest('.react-flow__edge');
      const entry: TabOrderEntry | null = nodeEl
        ? {type: 'node', id: nodeEl.getAttribute('data-id')!}
        : edgeEl
        ? {type: 'edge', id: edgeEl.getAttribute('data-id')!}
        : null;
      if (
        entry &&
        tabOrder.some(e => e.type === entry.type && e.id === entry.id)
      ) {
        setActiveTabEntry(entry);
      }
    },
    [tabOrder]
  );

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
    connection =>
      setEdges(eds =>
        addEdge({...connection, markerEnd: {type: MarkerType.ArrowClosed}}, eds)
      ),
    [setEdges]
  );

  const handleMoveEnd = useCallback(
    (_event: unknown, vp: ReactFlowSource['viewport']) => {
      setViewport(vp);
    },
    []
  );

  // Keyboard-driven edge creation.
  // Press "c" on a focused node to start, Tab to target, Enter to connect.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (readOnly) return;

      const target = e.target as HTMLElement;
      // Don't intercept non-Tab keys when the user is editing text content.
      // Tab still uses our logical order so the user can advance between nodes.
      const isEditing =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';
      if (isEditing && e.key !== 'Tab') {
        return;
      }

      // Determine which node or edge currently has focus.
      const nodeEl = target.closest('.react-flow__node');
      const edgeEl = target.closest('.react-flow__edge');
      const focusedEntry: TabOrderEntry | null = nodeEl
        ? {type: 'node', id: nodeEl.getAttribute('data-id')!}
        : edgeEl
        ? {type: 'edge', id: edgeEl.getAttribute('data-id')!}
        : null;
      const focusedNodeId =
        focusedEntry?.type === 'node' ? focusedEntry.id : undefined;

      // "c" toggles connect mode on/off (nodes only).
      if (e.key === 'c') {
        if (connectingFrom) {
          e.preventDefault();
          setConnectingFrom(null);
          setConnectAnnouncement('Connect mode cancelled.');
          return;
        }
        if (focusedNodeId) {
          e.preventDefault();
          setConnectingFrom(focusedNodeId);
          const node = nodes.find(n => n.id === focusedNodeId);
          const label =
            (node?.data?.label as string) ||
            (node?.data?.text as string) ||
            node?.type ||
            focusedNodeId;
          setConnectAnnouncement(
            `Connect mode: ${label} selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
          );
        }
        return;
      }

      // Tab uses the computed logical tab order for both connect and normal mode.
      if (e.key === 'Tab') {
        if (tabOrder.length === 0) return;
        const currentIdx = focusedEntry
          ? tabOrder.findIndex(
              e2 => e2.type === focusedEntry.type && e2.id === focusedEntry.id
            )
          : -1;
        const direction = e.shiftKey ? -1 : 1;

        if (connectingFrom) {
          // Connect mode: cycle through nodes only, wrap around.
          const nodeEntries = tabOrder.filter(e2 => e2.type === 'node');
          if (nodeEntries.length === 0) return;
          const curNodeIdx = focusedNodeId
            ? nodeEntries.findIndex(e2 => e2.id === focusedNodeId)
            : -1;
          const nextNodeIdx =
            (((curNodeIdx + direction + nodeEntries.length) %
              nodeEntries.length) +
              nodeEntries.length) %
            nodeEntries.length;
          e.preventDefault();
          focusEntry(nodeEntries[nextNodeIdx]);
          return;
        }

        // Normal mode: move through full order; escape at boundaries.
        if (focusedEntry) {
          const nextIdx = currentIdx + direction;
          if (nextIdx >= 0 && nextIdx < tabOrder.length) {
            e.preventDefault();
            focusEntry(tabOrder[nextIdx]);
          }
          // else: out of bounds -- let focus leave the canvas naturally.
          return;
        }
      }

      // Enter on a different node completes the connection.
      if (e.key === 'Enter' && connectingFrom) {
        if (focusedNodeId && focusedNodeId !== connectingFrom) {
          e.preventDefault();
          const sourceNode = nodes.find(n => n.id === connectingFrom);
          const targetNode = nodes.find(n => n.id === focusedNodeId);
          if (sourceNode && targetNode) {
            const handles = pickHandles(sourceNode, targetNode);
            setEdges(eds =>
              addEdge(
                {
                  source: connectingFrom,
                  target: focusedNodeId,
                  ...handles,
                  markerEnd: {type: MarkerType.ArrowClosed},
                },
                eds
              )
            );
            const targetLabel =
              (targetNode.data?.label as string) ||
              (targetNode.data?.text as string) ||
              targetNode.type ||
              focusedNodeId;
            setConnectAnnouncement(`Edge created to ${targetLabel}.`);
          }
          setConnectingFrom(null);
        }
        return;
      }

      if (e.key === 'Escape' && connectingFrom) {
        e.preventDefault();
        setConnectingFrom(null);
        setConnectAnnouncement('Connect mode cancelled.');
        return;
      }

      // Enter on a focused node (outside connect mode) enters edit mode.
      if (e.key === 'Enter' && focusedNodeId) {
        const focusedNodeEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${focusedNodeId}"]`
        );
        const editable = focusedNodeEl?.querySelector<HTMLElement>(
          '[role="textbox"], button, input'
        );
        if (editable) {
          e.preventDefault();
          // Buttons need a click to activate; text fields just need focus.
          if (editable.tagName === 'BUTTON') {
            editable.click();
          } else {
            editable.focus();
          }
        }
      }
    },
    [connectingFrom, focusEntry, nodes, readOnly, setEdges, tabOrder]
  );

  // Apply a CSS class to the source node while in connect mode.
  useEffect(() => {
    const prev = document.querySelector(`.${styles.connectSource}`);
    prev?.classList.remove(styles.connectSource);

    if (connectingFrom) {
      const el = document.querySelector(
        `.react-flow__node[data-id="${connectingFrom}"]`
      );
      el?.classList.add(styles.connectSource);
    }
  }, [connectingFrom]);

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
    <SketchLabReadOnlyProvider value={readOnly}>
      <div
        className={classNames(styles.canvasContainer, {
          [styles.connectMode]: !!connectingFrom,
        })}
        onKeyDown={handleKeyDown}
        onFocusCapture={handleFocusCapture}
      >
        {!readOnly && <Toolbar onAddNode={handleAddNode} />}
        <div aria-live="assertive" className={styles.srOnly}>
          {connectAnnouncement}
        </div>
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
          nodesFocusable={true}
          edgesFocusable={true}
          disableKeyboardA11y={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </SketchLabReadOnlyProvider>
  );
}
