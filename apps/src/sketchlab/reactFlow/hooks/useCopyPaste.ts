import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {PASTE_OFFSET_PX} from '../constants';
import type {ClipboardContents} from '../context';
import type {TabOrderEntry} from '../utils/computeTabOrder';

interface UseCopyPasteOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

export function useCopyPaste({
  nodes,
  edges,
  setNodes,
  setEdges,
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

  // A line edge is stored as two hidden lineAnchor nodes plus the edge
  // connecting them — all three must travel together in the clipboard.
  // TODO: enable copy/paste of an edge attached to one or two real nodes.
  const buildLineEdgeClipboard = useCallback(
    (edgeId: string): ClipboardContents | null => {
      const edge = edges.find(e => e.id === edgeId);
      if (!edge) return null;
      const sourceAnchor = nodes.find(n => n.id === edge.source);
      const targetAnchor = nodes.find(n => n.id === edge.target);
      if (
        sourceAnchor?.type !== 'lineAnchor' ||
        targetAnchor?.type !== 'lineAnchor'
      ) {
        return null;
      }
      return {nodes: [sourceAnchor, targetAnchor], edges: [edge]};
    },
    [nodes, edges]
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

      setNodes(currentNodes => [...currentNodes, ...newNodes]);
    },
    [buildNodeClipboard, setNodes]
  );

  // Toolbar action: duplicate a line edge (both anchor nodes + the edge).
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

      setNodes(currentNodes => [...currentNodes, ...newNodes]);
      setEdges(currentEdges => [...currentEdges, ...newEdges]);
    },
    [buildLineEdgeClipboard, setNodes, setEdges]
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
        // Deleting the anchor nodes removes the line edge automatically.
        const lineEdge = edges.find(e => e.id === entry.id);
        if (lineEdge) {
          deleteElements({
            nodes: [{id: lineEdge.source}, {id: lineEdge.target}],
          });
        }
      }
    },
    [
      edges,
      buildNodeClipboard,
      buildLineEdgeClipboard,
      writeClipboard,
      deleteElements,
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

    setNodes(currentNodes => [...currentNodes, ...newNodes]);
    if (newEdges.length > 0) {
      setEdges(currentEdges => [...currentEdges, ...newEdges]);
    }
  }, [setNodes, setEdges]);

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
