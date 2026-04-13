// Best-effort conversion of an Excalidraw source into the React-Flow source
// format used by this implementation. Handles the small set of elements our
// React-Flow lab knows how to render: text/rectangle/ellipse/diamond shapes
// (mapped to `textBox` nodes), images (mapped to `image` nodes), and
// arrow/line elements (mapped to edges when both ends bind to known shapes).
//
// Anything more exotic (drawings, formatted text, libraries, etc.) is
// dropped on the floor with a console warning. The goal is to give the
// student something recognisable to start with, not pixel-perfect parity.

import {
  Sketchlab2Edge,
  Sketchlab2Node,
  Sketchlab2Source,
} from '@cdo/apps/lab2/types';

// We only care about a handful of fields, so we narrow `unknown` here
// rather than pulling in the heavy Excalidraw types.
interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fileId?: string;
  isDeleted?: boolean;
  startBinding?: {elementId: string} | null;
  endBinding?: {elementId: string} | null;
  groupIds?: string[];
}

interface ExcalidrawFile {
  id: string;
  dataURL?: string;
  mimeType?: string;
}

interface ExcalidrawSource {
  elements?: ExcalidrawElement[];
  files?: Record<string, ExcalidrawFile>;
  externalFiles?: Record<string, {url?: string} | undefined>;
  appState?: {scrollX?: number; scrollY?: number; zoom?: {value?: number}};
}

// Heuristic: an Excalidraw source has `elements` (array) and typically
// `appState`. The React Flow source has `nodes`/`edges` arrays. Since both
// are stored at `source.source`, we sniff the shape to decide.
export function isExcalidrawSource(
  source: unknown
): source is ExcalidrawSource {
  if (!source || typeof source !== 'object') return false;
  const s = source as ExcalidrawSource & {nodes?: unknown};
  if (Array.isArray(s.nodes)) return false; // already React Flow
  return Array.isArray(s.elements);
}

const SHAPE_HEIGHT = 80;
const TRI_WIDTH = Math.round(SHAPE_HEIGHT * (2 / Math.sqrt(3)));

// Map an Excalidraw element type to our React Flow text-box `data.shape`.
function shapeFor(type: string): 'rectangle' | 'circle' | 'triangle' | null {
  switch (type) {
    case 'rectangle':
    case 'text':
      return 'rectangle';
    case 'ellipse':
      return 'circle';
    case 'diamond':
      return 'triangle';
    default:
      return null;
  }
}

// Resolve an Excalidraw fileId to a URL we can hand to an <img>. Prefers
// the externalFiles entry (uploaded to S3) over the inline dataURL.
function resolveImageUrl(
  fileId: string,
  files: ExcalidrawSource['files'],
  externalFiles: ExcalidrawSource['externalFiles']
): string | null {
  const ext = externalFiles?.[fileId];
  if (ext?.url) return ext.url;
  return files?.[fileId]?.dataURL ?? null;
}

export function migrateExcalidrawToReactFlow(
  source: ExcalidrawSource
): Sketchlab2Source {
  const elements = (source.elements ?? []).filter(e => !e.isDeleted);
  const nodes: Sketchlab2Node[] = [];
  const edges: Sketchlab2Edge[] = [];

  // Track which Excalidraw element IDs became which React Flow node IDs,
  // so we can reconnect arrows below.
  const idMap = new Map<string, string>();

  for (const el of elements) {
    if (el.type === 'image' && el.fileId) {
      const url = resolveImageUrl(
        el.fileId,
        source.files,
        source.externalFiles
      );
      if (!url) continue;
      const newId = el.id;
      idMap.set(el.id, newId);
      nodes.push({
        id: newId,
        type: 'image',
        position: {x: el.x, y: el.y},
        data: {url, filename: el.fileId},
        width: el.width,
        height: el.height,
        style: {width: el.width, height: el.height},
      });
      continue;
    }

    const shape = shapeFor(el.type);
    if (shape) {
      const newId = el.id;
      idMap.set(el.id, newId);
      const node: Sketchlab2Node = {
        id: newId,
        type: 'textBox',
        position: {x: el.x, y: el.y},
        data: {text: el.text ?? '', shape},
      };
      // Apply our React-Flow lab's fixed shape sizing rules. Rectangles let
      // the CSS handle their height; circle/triangle have explicit dims.
      if (shape === 'circle') {
        node.width = SHAPE_HEIGHT;
        node.height = SHAPE_HEIGHT;
        node.style = {width: SHAPE_HEIGHT, height: SHAPE_HEIGHT};
      } else if (shape === 'triangle') {
        node.width = TRI_WIDTH;
        node.height = SHAPE_HEIGHT;
        node.style = {width: TRI_WIDTH, height: SHAPE_HEIGHT};
      }
      nodes.push(node);
    }
  }

  for (const el of elements) {
    if (el.type !== 'arrow' && el.type !== 'line') continue;
    const sourceId = el.startBinding?.elementId
      ? idMap.get(el.startBinding.elementId)
      : undefined;
    const targetId = el.endBinding?.elementId
      ? idMap.get(el.endBinding.elementId)
      : undefined;
    if (!sourceId || !targetId) continue; // skip free-floating lines
    edges.push({
      id: el.id,
      source: sourceId,
      target: targetId,
      type: 'default',
      markerEnd: {type: 'arrowclosed'},
    });
  }

  const viewport = source.appState
    ? {
        x: source.appState.scrollX ?? 0,
        y: source.appState.scrollY ?? 0,
        zoom: source.appState.zoom?.value ?? 1,
      }
    : undefined;

  return {nodes, edges, viewport};
}
