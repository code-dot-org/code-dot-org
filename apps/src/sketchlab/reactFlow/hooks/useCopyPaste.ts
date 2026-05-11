import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  PASTE_OFFSET_PX,
} from '../constants';
import type {ClipboardContents} from '../context';
import type {TabOrderEntry} from '../utils/computeTabOrder';
import {
  createLineAnchorAtHandle,
  getHandleFlowPosition,
  lineAnchorHandleId,
} from '../utils/lineAnchors';

interface UseCopyPasteOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  pushSnapshot: () => void;
}

export function useCopyPaste({
  nodes,
  edges,
  setNodes,
  setEdges,
  pushSnapshot,
}: UseCopyPasteOptions) {
  const {deleteElements, screenToFlowPosition} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();

  // Keyboard clipboard. useRef holds data (no re-renders); useState tracks
  // whether anything is available so dependent UI can update.
  const clipboardRef = useRef<ClipboardContents | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  // Last known mouse position in flow coordinates for paste-at-cursor.
  const mousePositionRef = useRef<{x: number; y: number} | null>(null);

  // Each successive duplicate of the same element is offset from the previous duplicate
  // vertically and horizontally rather than the original, so repeated duplicates fan out visually.
  const lastDuplicateRef = useRef<ClipboardContents | null>(null);
  const lastDuplicateIdRef = useRef<string | null>(null);

  const writeClipboard = useCallback((contents: ClipboardContents) => {
    clipboardRef.current = contents;
    setHasClipboard(true);
  }, []);

  const buildNodeClipboard = useCallback(
    (nodeId: string): ClipboardContents | null => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || node.data.locked) return null;
      return {nodes: [node], edges: []};
    },
    [nodes]
  );

  // A line is stored as an edge with two nodes - the nodes are either anchor nodes or real nodes.
  // all three elements must travel together in the clipboard.
  // When an endpoint is a real (non-anchor) node, a new anchor node is
  // created at that node's handle position so we can duplicate the free-standing anchor node.
  const buildLineEdgeClipboard = useCallback(
    (edgeId: string): ClipboardContents | null => {
      const edge = edges.find(e => e.id === edgeId);
      if (!edge || edge.data?.locked) return null;

      const resolveEndpointAnchor = (
        nodeId: string,
        handleId: string | null | undefined,
        role: 'source' | 'target'
      ) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return null;
        if (node.type === 'lineAnchor') return node;
        const handlePos = getHandleFlowPosition(
          nodeId,
          handleId ?? undefined,
          screenToFlowPosition
        );
        const position = handlePos ?? {
          x: node.position.x + (node.width ?? DEFAULT_NODE_WIDTH) / 2,
          y: node.position.y + (node.height ?? DEFAULT_NODE_HEIGHT) / 2,
        };
        return createLineAnchorAtHandle(position, role);
      };

      const sourceAnchor = resolveEndpointAnchor(
        edge.source,
        edge.sourceHandle,
        'source'
      );
      const targetAnchor = resolveEndpointAnchor(
        edge.target,
        edge.targetHandle,
        'target'
      );
      if (!sourceAnchor || !targetAnchor) return null;

      // Point edge endpoints at the clipboard anchor IDs.
      const edgeWithAnchorNodes = {
        ...edge,
        source: sourceAnchor.id,
        target: targetAnchor.id,
        sourceHandle: lineAnchorHandleId('source'),
        targetHandle: lineAnchorHandleId('target'),
      };
      return {
        nodes: [sourceAnchor, targetAnchor],
        edges: [edgeWithAnchorNodes],
      };
    },
    [nodes, edges, screenToFlowPosition]
  );

  // Toolbar action: duplicate a node in-place with 'stagger' chaining, i.e., each duplicate is
  // offset by PASTE_OFFSET_PX in both dimensions.
  const duplicateNode = useCallback(
    (nodeId: string) => {
      const source =
        lastDuplicateIdRef.current === nodeId && lastDuplicateRef.current
          ? lastDuplicateRef.current
          : buildNodeClipboard(nodeId);
      if (!source) return;

      const newNodes = source.nodes.map(node => ({
        ...node,
        id: createUuid(),
        position: {
          x: node.position.x + PASTE_OFFSET_PX,
          y: node.position.y + PASTE_OFFSET_PX,
        },
      }));

      lastDuplicateRef.current = {nodes: newNodes, edges: []};
      lastDuplicateIdRef.current = nodeId;

      pushSnapshot();
      setNodes(currentNodes => [...currentNodes, ...newNodes]);
    },
    [buildNodeClipboard, pushSnapshot, setNodes]
  );

  // Toolbar action: duplicate a line.
  const duplicateLine = useCallback(
    (edgeId: string) => {
      const source =
        lastDuplicateIdRef.current === edgeId && lastDuplicateRef.current
          ? lastDuplicateRef.current
          : buildLineEdgeClipboard(edgeId);
      if (!source) return;

      const idMap = new Map<string, string>();
      const newNodes = source.nodes.map(node => {
        const newId = createUuid();
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + PASTE_OFFSET_PX,
            y: node.position.y + PASTE_OFFSET_PX,
          },
        };
      });
      const newEdges = source.edges.map(edge => ({
        ...edge,
        id: createUuid(),
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
      }));

      lastDuplicateRef.current = {nodes: newNodes, edges: newEdges};
      lastDuplicateIdRef.current = edgeId;

      pushSnapshot();
      setNodes(currentNodes => [...currentNodes, ...newNodes]);
      setEdges(currentEdges => [...currentEdges, ...newEdges]);
    },
    [buildLineEdgeClipboard, pushSnapshot, setNodes, setEdges]
  );

  // Keyboard copy/cut/paste.
  const copyEntry = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        const contents = buildNodeClipboard(entry.id);
        if (contents) writeClipboard(contents);
      } else if (entry.type === 'edge') {
        const contents = buildLineEdgeClipboard(entry.id);
        if (contents) writeClipboard(contents);
      }
    },
    [buildNodeClipboard, buildLineEdgeClipboard, writeClipboard]
  );

  const cutEntry = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        const contents = buildNodeClipboard(entry.id);
        if (!contents) return;
        writeClipboard(contents);
        deleteElements({nodes: [{id: entry.id}]});
      } else if (entry.type === 'edge') {
        const contents = buildLineEdgeClipboard(entry.id);
        if (!contents) return;
        writeClipboard(contents);
        const lineEdge = edges.find(e => e.id === entry.id);
        if (lineEdge) {
          // Only delete lineAnchor endpoints — real nodes are independent objects.
          // Deleting anchor nodes removes the edge automatically; for real-node
          // endpoints we delete the edge directly.
          const anchorIds = [lineEdge.source, lineEdge.target].filter(
            id => nodes.find(n => n.id === id)?.type === 'lineAnchor'
          );
          if (anchorIds.length > 0) {
            deleteElements({nodes: anchorIds.map(id => ({id}))});
          } else {
            deleteElements({edges: [{id: entry.id}]});
          }
        }
      }
    },
    [
      buildNodeClipboard,
      writeClipboard,
      deleteElements,
      buildLineEdgeClipboard,
      edges,
      nodes,
    ]
  );

  const paste = useCallback(() => {
    const contents = clipboardRef.current;
    if (!contents) return;

    // When the mouse is over the canvas, paste with the first node at the
    // cursor. When the mouse is outside (keyboard-only path), fall back to
    // a fixed offset so pasted elements don't stack on originals.
    const mousePos = mousePositionRef.current;
    const anchorNode = contents.nodes[0];
    const deltaX =
      mousePos && anchorNode
        ? mousePos.x - anchorNode.position.x
        : PASTE_OFFSET_PX;
    const deltaY =
      mousePos && anchorNode
        ? mousePos.y - anchorNode.position.y
        : PASTE_OFFSET_PX;

    const idMap = new Map<string, string>();
    const newNodes = contents.nodes.map(node => {
      const newId = createUuid();
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      };
    });

    const newEdges = contents.edges.map(edge => ({
      ...edge,
      id: createUuid(),
      source: idMap.get(edge.source) ?? edge.source,
      target: idMap.get(edge.target) ?? edge.target,
    }));

    pushSnapshot();
    setNodes(currentNodes => [...currentNodes, ...newNodes]);
    if (newEdges.length > 0) {
      setEdges(currentEdges => [...currentEdges, ...newEdges]);
    }
  }, [pushSnapshot, setNodes, setEdges]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      mousePositionRef.current = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [screenToFlowPosition]
  );

  const handleMouseLeave = useCallback(() => {
    mousePositionRef.current = null;
  }, []);

  return {
    duplicateNode,
    duplicateLine,
    copyEntry,
    cutEntry,
    paste,
    hasClipboard,
    handleMouseMove,
    handleMouseLeave,
  };
}
