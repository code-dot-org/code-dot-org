// Best-effort conversion of an Excalidraw source into the React Flow source
// format used by this implementation. Handles the small set of elements our
// React Flow lab knows how to render: rectangle/ellipse/diamond shapes
// (mapped to `textBox` nodes), standalone `text` elements (mapped to
// rectangles), images, and arrow/line elements (mapped to edges when both
// ends bind to known shapes).
//
// Excalidraw stores "a rectangle with the word hello inside it" as TWO
// elements: the rectangle, and a `text` element whose `containerId` points
// at the rectangle. We merge those back into a single React Flow `textBox`
// rather than emitting a naked shape plus a naked text box.
//
// Anything more exotic (drawings, formatted text, libraries, etc.) is
// dropped on the floor. The goal is to give the student something
// recognisable to start with, not pixel-perfect parity.

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';

import {PALETTE_COLORS} from '../NodePalette';

// We narrow `unknown` here rather than pulling in the heavy Excalidraw types.
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
  containerId?: string | null;
  startBinding?: {elementId: string} | null;
  endBinding?: {elementId: string} | null;
  backgroundColor?: string;
  strokeColor?: string;
  groupIds?: string[];
  boundElements?: Array<{id: string; type: string}> | null;
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

type ShapeKind = 'rectangle' | 'circle' | 'triangle';

function shapeFor(type: string): ShapeKind | null {
  switch (type) {
    case 'rectangle':
      return 'rectangle';
    case 'ellipse':
      return 'circle';
    case 'diamond':
      return 'triangle';
    default:
      return null;
  }
}

function isShapeType(type: string): boolean {
  return shapeFor(type) !== null;
}

function resolveImageUrl(
  fileId: string,
  files: ExcalidrawSource['files'],
  externalFiles: ExcalidrawSource['externalFiles']
): string | null {
  const ext = externalFiles?.[fileId];
  if (ext?.url) return ext.url;
  return files?.[fileId]?.dataURL ?? null;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return [h, s, l];
}

// Circular distance between two hues, on the 0-360 hue wheel.
function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

// Pre-computed hue + saturation of every palette swatch that carries a
// real colour. Entries whose value is null ("default") or 'transparent'
// are dropped; those don't participate in the nearest-hue lookup.
const PALETTE_HSL: Array<{value: string; hue: number; saturation: number}> =
  PALETTE_COLORS.flatMap(({value}) => {
    if (!value || value === 'transparent') return [];
    const rgb = hexToRgb(value);
    if (!rgb) return [];
    const [h, s] = rgbToHsl(...rgb);
    return [{value, hue: h, saturation: s}];
  });

// Map an Excalidraw `backgroundColor` to the closest swatch in our palette,
// matching by hue and ignoring brightness. Inputs that are unparsable,
// transparent, or essentially grayscale fall back to the palette default
// (null) rather than being mapped to an unrelated hue.
//
// Note the semantic mismatch with Excalidraw's "transparent": there it
// means "no fill, stroke still visible". In our React Flow impl
// `color: 'transparent'` means "background AND border both hidden" — a
// ghost. So we map it to null (default fill with border), not 'transparent'.
function normalizeBackgroundColor(color: string | undefined): string | null {
  if (!color) return null;
  if (color === 'transparent') return null;
  if (/^#[0-9a-fA-F]{8}$/.test(color) && color.endsWith('00')) return null;
  const rgb = hexToRgb(color);
  if (!rgb) return null;
  const [h, s, l] = rgbToHsl(...rgb);
  // Near-grayscale, near-black, or near-white inputs have no meaningful
  // hue; snapping them to one of our coloured swatches would feel arbitrary.
  if (s < 0.15) return null;
  if (l < 0.08 || l > 0.95) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const entry of PALETTE_HSL) {
    const d = hueDistance(h, entry.hue);
    if (d < bestDist) {
      bestDist = d;
      best = entry.value;
    }
  }
  return best;
}

export function migrateExcalidrawToReactFlow(
  source: ExcalidrawSource
): SketchlabReactFlowSource {
  const elements = (source.elements ?? []).filter(e => !e.isDeleted);

  // First pass: group text elements by their container, so when we process
  // the shape itself we can pull the bound text into it. Free-floating text
  // (no container) goes through later as its own node.
  const textByContainer = new Map<string, string>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId && el.text) {
      const prev = textByContainer.get(el.containerId);
      textByContainer.set(
        el.containerId,
        prev ? `${prev}\n${el.text}` : el.text
      );
    }
  }
  // Track which text element IDs have been merged into a container so we
  // skip emitting them as standalone nodes.
  const mergedTextIds = new Set<string>();
  for (const el of elements) {
    if (
      el.type === 'text' &&
      el.containerId &&
      textByContainer.has(el.containerId)
    ) {
      mergedTextIds.add(el.id);
    }
  }

  const nodes: SketchlabReactFlowNode[] = [];
  const edges: SketchlabReactFlowEdge[] = [];

  // Excalidraw element id -> React Flow node id (we keep them identical, but
  // the map lets us check whether a given id was actually emitted).
  const idMap = new Map<string, string>();

  for (const el of elements) {
    // Images
    if (el.type === 'image' && el.fileId) {
      const url = resolveImageUrl(
        el.fileId,
        source.files,
        source.externalFiles
      );
      if (!url) continue;
      idMap.set(el.id, el.id);
      nodes.push({
        id: el.id,
        type: 'image',
        position: {x: el.x, y: el.y},
        data: {url, filename: el.fileId},
        width: el.width,
        height: el.height,
        style: {width: el.width, height: el.height},
      });
      continue;
    }

    // Shapes with (optionally) bound text. Don't carry Excalidraw's width
    // and height through: the React Flow lab uses a single fixed size
    // (SHAPE_HEIGHT) for every shape and relies on the wrapper/inner-div
    // sizes matching for handle hit-testing. Feeding a different wrapper
    // size here breaks that invariant.
    if (isShapeType(el.type)) {
      const shape = shapeFor(el.type)!;
      const text = textByContainer.get(el.id) ?? '';
      idMap.set(el.id, el.id);
      const color = normalizeBackgroundColor(el.backgroundColor);
      const data: Record<string, unknown> = {text, shape};
      if (color !== null) data.color = color;
      nodes.push({
        id: el.id,
        type: 'textBox',
        position: {x: el.x, y: el.y},
        data,
      });
      continue;
    }

    // Standalone text (no container) becomes a rectangle.
    if (el.type === 'text' && !el.containerId) {
      idMap.set(el.id, el.id);
      nodes.push({
        id: el.id,
        type: 'textBox',
        position: {x: el.x, y: el.y},
        data: {text: el.text ?? '', shape: 'rectangle'},
      });
      continue;
    }

    // Bound text is dropped here; its content is already carried by the
    // shape it belongs to (see textByContainer above).
    if (mergedTextIds.has(el.id)) continue;
  }

  // Second pass: arrows/lines become edges.
  //
  // Excalidraw arrows bind to shape elements via `startBinding.elementId`,
  // but a binding can land on a text element (when the user drew the arrow
  // onto the text rather than its container). Resolve those through to the
  // container id, and fall back to the explicit `boundElements` entries on
  // the shape if the binding is missing entirely.
  const containerByTextId = new Map<string, string>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId) {
      containerByTextId.set(el.id, el.containerId);
    }
  }

  const resolveBindingTarget = (elementId: string): string | undefined => {
    if (idMap.has(elementId)) return elementId;
    const container = containerByTextId.get(elementId);
    if (container && idMap.has(container)) return container;
    return undefined;
  };

  for (const el of elements) {
    if (el.type !== 'arrow' && el.type !== 'line') continue;
    const sourceId = el.startBinding?.elementId
      ? resolveBindingTarget(el.startBinding.elementId)
      : undefined;
    const targetId = el.endBinding?.elementId
      ? resolveBindingTarget(el.endBinding.elementId)
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
