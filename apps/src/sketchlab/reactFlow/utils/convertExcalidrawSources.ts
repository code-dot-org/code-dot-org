import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {MarkerType} from '@xyflow/react';

import {
  ExcalidrawSourceWithExternalFiles,
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LINE_ANCHOR_SIZE_PX} from '../constants';
import {FontSizeValue} from '../nodes/nodeToolbars/toolbarPalettes';
import {ShapeNodeData, ShapeType} from '../types';

// Maps Excalidraw px font size to our small/medium/large bands. The
// thresholds are midpoints between fontSizePx in toolbarPalettes.ts
// (small=12, medium=16, large=22).
function fontSizeBand(px: number): FontSizeValue {
  if (px < 14) return 'small';
  if (px < 19) return 'medium';
  return 'large';
}

function shapeTypeFor(
  el: ExcalidrawElement
): ShapeType | null {
  if (el.type === 'rectangle') return 'rectangle';
  if (el.type === 'diamond') return 'diamond';
  if (el.type === 'ellipse') return 'circle';
  return null;
}

function pickHandles(
  source: {x: number; y: number; width: number; height: number},
  target: {x: number; y: number; width: number; height: number}
): {sourceHandle: string; targetHandle: string} {
  const sourceCenterX = source.x + source.width / 2;
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? {sourceHandle: 'right-source', targetHandle: 'left-target'}
      : {sourceHandle: 'left-source', targetHandle: 'right-target'};
  }
  return dy >= 0
    ? {sourceHandle: 'bottom-source', targetHandle: 'top-target'}
    : {sourceHandle: 'top-source', targetHandle: 'bottom-target'};
}

export function convertExcalidrawToReactFlow(
  source: ExcalidrawSourceWithExternalFiles
): SketchlabReactFlowSource {
  const elements = (source.elements ?? []).filter(el => !el.isDeleted);
  const externalFiles = source.externalFiles;

  // First pass: index text elements by their containerId so shape
  // nodes can absorb them as labels rather than emit them as
  // standalone TextNodes.
  const labelByContainerId = new Map<string, {
    text: string;
    fontSize: number;
    strokeColor: string;
  }>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId) {
      labelByContainerId.set(el.containerId, {
        text: el.text,
        fontSize: el.fontSize,
        strokeColor: el.strokeColor,
      });
    }
  }

  const nodes: SketchlabReactFlowNode[] = [];
  const edges: SketchlabReactFlowEdge[] = [];

  // Map each emitted node's id back to its excalidraw element id, so
  // that arrow/line bindings can resolve to a node we actually kept.
  // Bound shapes / text / images keep their original Excalidraw id, so
  // the lookup is just "did we emit a node with this id?".
  const emittedNodeById = new Map<string, SketchlabReactFlowNode>();

  for (const el of elements) {
    const shapeType = shapeTypeFor(el);
    if (shapeType !== null) {
      const label = labelByContainerId.get(el.id);
      const data: ShapeNodeData = {
        shapeType,
        label: label?.text ?? '',
        backgroundColor: el.backgroundColor,
        strokeColor: el.strokeColor,
      };
      if (label) {
        data.fontColor = label.strokeColor;
        data.fontSize = fontSizeBand(label.fontSize);
      }
      const node: SketchlabReactFlowNode = {
        id: el.id,
        type: 'shape',
        position: {x: el.x, y: el.y},
        style: {width: el.width, height: el.height},
        data,
      };
      nodes.push(node);
      emittedNodeById.set(el.id, node);
      continue;
    }

    if (el.type === 'text') {
      // Text elements bound to a shape were absorbed above.
      if (el.containerId) continue;
      const node: SketchlabReactFlowNode = {
        id: el.id,
        type: 'text',
        position: {x: el.x, y: el.y},
        data: {
          text: el.text,
          fontColor: el.strokeColor,
          fontSize: fontSizeBand(el.fontSize),
          showHandles: false,
        },
      };
      nodes.push(node);
      emittedNodeById.set(el.id, node);
      continue;
    }

    if (el.type === 'image') {
      const fileId = el.fileId;
      const url = fileId ? externalFiles?.[fileId]?.url : undefined;
      if (!url) continue;
      const node: SketchlabReactFlowNode = {
        id: el.id,
        type: 'image',
        position: {x: el.x, y: el.y},
        style: {width: el.width, height: el.height},
        data: {src: url, altText: ''},
      };
      nodes.push(node);
      emittedNodeById.set(el.id, node);
      continue;
    }
    // freedraw, frame, embeddable, selection: dropped.
  }

  // Second pass: linear elements (arrows and lines). These must run
  // after the node pass so we can verify both endpoints resolve to a
  // node we emitted.
  for (const el of elements) {
    if (el.type !== 'arrow' && el.type !== 'line') continue;

    const startId = el.startBinding?.elementId;
    const endId = el.endBinding?.elementId;
    const startNode = startId ? emittedNodeById.get(startId) : undefined;
    const endNode = endId ? emittedNodeById.get(endId) : undefined;

    if (
      startNode &&
      endNode &&
      startNode.type !== 'lineAnchor' &&
      endNode.type !== 'lineAnchor'
    ) {
      const sourceBox = {
        x: startNode.position.x,
        y: startNode.position.y,
        width: Number(startNode.style?.width ?? 0),
        height: Number(startNode.style?.height ?? 0),
      };
      const targetBox = {
        x: endNode.position.x,
        y: endNode.position.y,
        width: Number(endNode.style?.width ?? 0),
        height: Number(endNode.style?.height ?? 0),
      };
      const {sourceHandle, targetHandle} = pickHandles(sourceBox, targetBox);
      const edge: SketchlabReactFlowEdge = {
        id: createUuid(),
        source: startNode.id,
        target: endNode.id,
        sourceHandle,
        targetHandle,
      };
      if (el.type === 'arrow') {
        edge.markerEnd = {type: MarkerType.ArrowClosed};
      }
      edges.push(edge);
      continue;
    }

    // Otherwise: emit a paired-anchor straight line at the linear
    // element's first and last absolute points.
    const points = el.points;
    if (!points || points.length < 2) continue;
    const first = points[0];
    const last = points[points.length - 1];
    const startX = el.x + first[0] - LINE_ANCHOR_SIZE_PX / 2;
    const startY = el.y + first[1] - LINE_ANCHOR_SIZE_PX / 2;
    const endX = el.x + last[0] - LINE_ANCHOR_SIZE_PX / 2;
    const endY = el.y + last[1] - LINE_ANCHOR_SIZE_PX / 2;

    const sourceAnchorId = createUuid();
    const targetAnchorId = createUuid();
    nodes.push({
      id: sourceAnchorId,
      type: 'lineAnchor',
      position: {x: startX, y: startY},
      style: {width: LINE_ANCHOR_SIZE_PX, height: LINE_ANCHOR_SIZE_PX},
      data: {lineAnchorRole: 'source'},
    });
    nodes.push({
      id: targetAnchorId,
      type: 'lineAnchor',
      position: {x: endX, y: endY},
      style: {width: LINE_ANCHOR_SIZE_PX, height: LINE_ANCHOR_SIZE_PX},
      data: {lineAnchorRole: 'target'},
    });
    const lineEdge: SketchlabReactFlowEdge = {
      id: createUuid(),
      source: sourceAnchorId,
      target: targetAnchorId,
      type: 'straight',
    };
    if (el.type === 'arrow') {
      lineEdge.markerEnd = {type: MarkerType.ArrowClosed};
    }
    edges.push(lineEdge);
  }

  return {nodes, edges};
}
