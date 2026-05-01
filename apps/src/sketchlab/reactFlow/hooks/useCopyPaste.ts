import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {PASTE_OFFSET_PX} from '../constants';
import type {ClipboardContents} from '../context';
import type {SketchLabNode} from '../types';
import type {TabOrderEntry} from '../utils/computeTabOrder';
import {isLineEdge} from '../utils/lineEdges';

interface UseCopyPasteOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
}

export function useCopyPaste({nodes, edges}: UseCopyPasteOptions) {
  const {setNodes, setEdges, deleteElements, screenToFlowPosition} =
    useReactFlow<SketchlabReactFlowNode, SketchlabReactFlowEdge>();

  // useRef holds the actual clipboard data (changing it doesn't trigger
  // re-renders). useState tracks the boolean so the Paste button updates.
  const clipboardRef = useRef<ClipboardContents | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  // Last known mouse position in flow coordinates, updated on every mouse
  // move over the canvas. Null when the mouse is outside the canvas.
  const mousePositionRef = useRef<{x: number; y: number} | null>(null);

  const writeClipboard = useCallback((contents: ClipboardContents) => {
    clipboardRef.current = contents;
    setHasClipboard(true);
  }, []);

  const buildNodeClipboard = useCallback(
    (nodeId: string): ClipboardContents | null => {
      const node = nodes.find(currentNode => currentNode.id === nodeId);
      if (!node) return null;
      return {nodes: [node], edges: []};
    },
    [nodes]
  );

  // A line edge is stored as two hidden lineAnchor nodes plus the edge
  // connecting them — all three must travel together in the clipboard.
  const buildLineEdgeClipboard = useCallback(
    (edgeId: string): ClipboardContents | null => {
      const edge = edges.find(currentEdge => currentEdge.id === edgeId);
      if (!edge || !isLineEdge(edge, nodes)) return null;
      const sourceAnchor = nodes.find(n => n.id === edge.source);
      const targetAnchor = nodes.find(n => n.id === edge.target);
      if (!sourceAnchor || !targetAnchor) return null;
      return {nodes: [sourceAnchor, targetAnchor], edges: [edge]};
    },
    [nodes, edges]
  );

  const copyNode = useCallback(
    (nodeId: string) => {
      const contents = buildNodeClipboard(nodeId);
      if (contents) writeClipboard(contents);
    },
    [buildNodeClipboard, writeClipboard]
  );

  const cutNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId) as
        | SketchLabNode
        | undefined;
      if (!node || node.data?.locked) return;
      const contents = buildNodeClipboard(nodeId);
      if (!contents) return;
      writeClipboard(contents);
      deleteElements({nodes: [{id: nodeId}]});
    },
    [nodes, buildNodeClipboard, writeClipboard, deleteElements]
  );

  // Used by the keyboard handler in useKeyboardNavigation.
  const copyEntry = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        copyNode(entry.id);
      } else if (entry.type === 'edge') {
        const contents = buildLineEdgeClipboard(entry.id);
        if (contents) writeClipboard(contents);
      }
    },
    [copyNode, buildLineEdgeClipboard, writeClipboard]
  );

  const cutEntry = useCallback(
    (entry: TabOrderEntry) => {
      if (entry.type === 'node') {
        cutNode(entry.id);
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
    [cutNode, buildLineEdgeClipboard, writeClipboard, edges, deleteElements]
  );

  const paste = useCallback(() => {
    const contents = clipboardRef.current;
    if (!contents) return;

    // When the mouse is over the canvas, paste with the first node at the
    // cursor and maintain all other nodes' positions relative to it.
    // When the mouse is outside the canvas (keyboard-only path), fall back
    // to a fixed offset so pasted elements don't stack on originals.
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
        selected: false,
        data: {...node.data, locked: false},
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      } as unknown as SketchlabReactFlowNode;
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
    copyNode,
    cutNode,
    copyEntry,
    cutEntry,
    paste,
    hasClipboard,
    handleMouseMove,
    handleMouseLeave,
  };
}
