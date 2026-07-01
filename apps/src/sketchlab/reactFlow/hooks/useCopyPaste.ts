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
  DEFAULT_PASTE_OFFSET_PX,
} from '../constants';
import type {ClipboardContents} from '../context';
import type {TabOrderEntry} from '../utils/computeTabOrder';
import {
  anchorHandleFlowPosition,
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

// Returns the handle-to-handle horizontal span of a line clipboard's anchor
// nodes. Uses anchorHandleFlowPosition rather than raw position.x because
// source and target anchors offset their top-left corners differently.
function lineHorizontalSpanFromClipboardNodes(
  clipboardNodes: SketchlabReactFlowNode[]
): number {
  const handleXs = clipboardNodes.map(n =>
    n.type === 'lineAnchor'
      ? anchorHandleFlowPosition(n.position, n.data.lineAnchorRole).x
      : n.position.x
  );
  return Math.max(...handleXs) - Math.min(...handleXs);
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
      if (!node || node.data.locked || node.type === 'group') return null;
      return {nodes: [node], edges: []};
    },
    [nodes]
  );

  const buildGroupClipboard = useCallback(
    (groupId: string): ClipboardContents | null => {
      const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
      if (!groupNode) return null;
      const children = nodes.filter(n => n.parentId === groupId);
      const childIds = new Set(children.map(n => n.id));
      // Only include edges fully contained in the group (both endpoints are children).
      const groupEdges = edges.filter(
        e => childIds.has(e.source) && childIds.has(e.target)
      );
      // Group node first so children can remap parentId in a single pass during paste.
      return {nodes: [groupNode, ...children], edges: groupEdges};
    },
    [nodes, edges]
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

  // Toolbar action: duplicate a node in-place but each duplicate is offset by the width of the node horizontally.
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
          x: node.position.x + (node.width ?? DEFAULT_NODE_WIDTH),
          y: node.position.y,
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

      const lineHorizontalSpan = lineHorizontalSpanFromClipboardNodes(
        source.nodes
      );
      // For lines, we want to offset the pasted line by the horizontal displacement of the original line.
      // If the line's horizontal displacement is less than the default offset, use the default offset so that lines
      // that are vertical or almost vertical aren't too close to each other.
      const offsetX = Math.max(lineHorizontalSpan, DEFAULT_PASTE_OFFSET_PX);

      const idMap = new Map<string, string>();
      const newNodes = source.nodes.map(node => {
        const newId = createUuid();
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y,
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
        const node = nodes.find(n => n.id === entry.id);
        const contents =
          node?.type === 'group'
            ? buildGroupClipboard(entry.id)
            : buildNodeClipboard(entry.id);
        if (contents) writeClipboard(contents);
      } else if (entry.type === 'edge') {
        const contents = buildLineEdgeClipboard(entry.id);
        if (contents) writeClipboard(contents);
      }
    },
    [
      nodes,
      buildGroupClipboard,
      buildNodeClipboard,
      buildLineEdgeClipboard,
      writeClipboard,
    ]
  );

  const cutEntry = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        const node = nodes.find(n => n.id === entry.id);
        if (node?.type === 'group') {
          const contents = buildGroupClipboard(entry.id);
          if (!contents) return;
          writeClipboard(contents);
          // Delete the group and its children explicitly; React Flow does not cascade-delete children.
          const children = nodes.filter(n => n.parentId === entry.id);
          deleteElements({
            nodes: [{id: entry.id}, ...children.map(n => ({id: n.id}))],
          });
        } else {
          const contents = buildNodeClipboard(entry.id);
          if (!contents) return;
          writeClipboard(contents);
          deleteElements({nodes: [{id: entry.id}]});
        }
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
      nodes,
      buildGroupClipboard,
      buildNodeClipboard,
      writeClipboard,
      deleteElements,
      buildLineEdgeClipboard,
      edges,
    ]
  );

  const paste = useCallback(() => {
    const contents = clipboardRef.current;
    if (!contents) return;

    // When the mouse is over the canvas, paste with the first node at the
    // cursor. When the mouse is outside (keyboard-only path), offset to the
    // right by the element's width (node) or horizontal span (line).
    const mousePos = mousePositionRef.current;
    const anchorNode = contents.nodes[0];
    let deltaX: number;
    let deltaY: number;
    if (mousePos && anchorNode) {
      deltaX = mousePos.x - anchorNode.position.x;
      deltaY = mousePos.y - anchorNode.position.y;
    } else {
      // Nodes and groups offset by width; standalone lines offset by their horizontal span.
      const hasGroup = contents.nodes.some(n => n.type === 'group');
      const isStandaloneLine = !hasGroup && contents.edges.length > 0;
      if (isStandaloneLine) {
        const lineHorizontalSpan = lineHorizontalSpanFromClipboardNodes(
          contents.nodes
        );
        deltaX = Math.max(lineHorizontalSpan, DEFAULT_PASTE_OFFSET_PX);
      } else {
        deltaX = anchorNode
          ? anchorNode.width ?? DEFAULT_NODE_WIDTH
          : DEFAULT_PASTE_OFFSET_PX;
      }
      deltaY = 0;
    }

    // IDs in the clipboard — used to detect parent-child relationships below.
    const clipboardNodeIds = new Set(contents.nodes.map(n => n.id));

    // Build idMap before creating new nodes so parentId remapping works in one
    // pass: the group node (index 0) is mapped before its children are processed.
    const idMap = new Map<string, string>();
    for (const node of contents.nodes) {
      idMap.set(node.id, createUuid());
    }

    const newNodes = contents.nodes.map(node => {
      return {
        ...node,
        id: idMap.get(node.id)!,
        // Children have positions relative to the parent group — don't offset them.
        position:
          node.parentId && clipboardNodeIds.has(node.parentId)
            ? node.position
            : {x: node.position.x + deltaX, y: node.position.y + deltaY},
        ...(node.parentId && {parentId: idMap.get(node.parentId)}),
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
