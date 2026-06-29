import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  DEFAULT_PASTE_OFFSET_PX,
  INTERNAL_CLIPBOARD_MARKER,
} from '../constants';
import type {ClipboardContents} from '../context';
import type {TabOrderEntry} from '../utils/computeTabOrder';
import {
  anchorHandleFlowPosition,
  createLineAnchorAtHandle,
  getHandleFlowPosition,
  lineAnchorHandleId,
} from '../utils/lineAnchors';
import {uploadImageAsset} from '../utils/uploadImageAsset';

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
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  readOnly: boolean;
  levelName: string;
  channelId: string;
}

// True when the paste target is a place where typing is the point — an input,
// textarea, or contentEditable (e.g. a TextNode editor). There we let the
// browser do its normal text paste instead of dropping an image node.
function isTargetEditable(target: HTMLElement): boolean {
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
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
  canvasContainerRef,
  readOnly,
  levelName,
  channelId,
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

  // Set by an in-app copy/cut so the next native copy/cut event stamps our
  // marker onto the system clipboard.
  const pendingMarkerStampRef = useRef(false);

  const writeClipboard = useCallback((contents: ClipboardContents) => {
    clipboardRef.current = contents;
    setHasClipboard(true);
    // Flag the imminent native copy/cut event to stamp our marker onto the
    // system clipboard. We do it there (not here) because clipboardData.setData
    // is synchronous and reliable, unlike navigator.clipboard.writeText which
    // is async, permission-gated, and frequently a no-op. The flag is cleared on
    // a timeout in case the copy/cut event never fires, so it can't leak into an
    // unrelated later copy.
    pendingMarkerStampRef.current = true;
    setTimeout(() => {
      pendingMarkerStampRef.current = false;
    }, 0);
  }, []);

  // Stamp the system clipboard with our marker on the native copy/cut event that
  // follows an in-app copy/cut. Its presence lets the paste handler know the
  // in-app copy is the most recent clipboard action and paste the element rather
  // than a stale clipboard image; an external image copy replaces the whole
  // clipboard, wiping the marker, which restores image paste.
  useEffect(() => {
    const stampMarker = (event: ClipboardEvent) => {
      if (!pendingMarkerStampRef.current) return;
      pendingMarkerStampRef.current = false;
      event.clipboardData?.setData('text/plain', INTERNAL_CLIPBOARD_MARKER);
      event.preventDefault();
    };
    document.addEventListener('copy', stampMarker);
    document.addEventListener('cut', stampMarker);
    return () => {
      document.removeEventListener('copy', stampMarker);
      document.removeEventListener('cut', stampMarker);
    };
  }, []);

  // Drop a clipboard-pasted image onto the canvas as an ImageNode. Positioned
  // top-left at the cursor when it's over the canvas (matching the internal
  // element paste), else centered in the viewport.
  const pasteImage = useCallback(
    (src: string) => {
      const mousePos = mousePositionRef.current;
      const position =
        mousePos ??
        screenToFlowPosition({
          x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2,
          y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2,
        });
      const newImageNode = {
        id: createUuid(),
        type: 'image',
        data: {src, altText: ''},
        position,
        width: DEFAULT_NODE_WIDTH,
        height: DEFAULT_NODE_HEIGHT,
      } as SketchlabReactFlowNode;
      pushSnapshot();
      setNodes(currentNodes => [...currentNodes, newImageNode]);
    },
    [screenToFlowPosition, pushSnapshot, setNodes]
  );

  const buildNodeClipboard = useCallback(
    (nodeId: string): ClipboardContents | null => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || node.data.locked || node.type === 'group') return null;
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
      const isLine = contents.edges.length > 0;
      if (isLine) {
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

  // Native paste while the canvas is focused: drop a clipboard image as an
  // ImageNode at the cursor, otherwise fall back to the internal element paste.
  // When our marker is present, the most recent clipboard action was an in-app
  // copy, so paste the copied element even if a stale image also lingers.
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (readOnly) return;
      const container = canvasContainerRef.current;
      if (!container || !container.contains(document.activeElement)) return;
      const target = event.target as HTMLElement | null;
      if (target && isTargetEditable(target)) return;

      const clipboardText = event.clipboardData?.getData('text/plain') ?? '';
      const internalCopyIsLatest = clipboardText === INTERNAL_CLIPBOARD_MARKER;
      const items = event.clipboardData?.items;
      const imageItem =
        !internalCopyIsLatest && items
          ? Array.from(items).find(item => item.type.startsWith('image/'))
          : undefined;

      if (!imageItem) {
        event.preventDefault();
        paste();
        return;
      }

      event.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      try {
        const uploadUrl = await uploadImageAsset(file, {levelName, channelId});
        if (!uploadUrl) return;
        pasteImage(uploadUrl);
      } catch (error) {
        console.error('Failed to upload pasted image:', error);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canvasContainerRef, readOnly, levelName, channelId, paste, pasteImage]);

  return {
    duplicateNode,
    duplicateLine,
    copyEntry,
    cutEntry,
    hasClipboard,
    handleMouseMove,
    handleMouseLeave,
  };
}
