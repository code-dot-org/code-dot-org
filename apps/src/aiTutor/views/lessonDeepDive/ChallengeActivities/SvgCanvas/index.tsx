import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  IText,
  Line,
  Path,
  PencilBrush,
  Rect,
  Triangle,
} from 'fabric';
import React, {
  FocusEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {createUuid} from '@cdo/apps/utils';

import AccessibleObjectList from './AccessibleObjectList';
import EmojiPicker from './EmojiPicker';
import PropertyPanel from './PropertyPanel';
import Toolbar from './Toolbar';
import {DrawingObjectRecord, DrawingTool} from './types';

import styles from './svg-canvas.module.scss';

// Custom data stored on each Fabric object alongside its visual properties.
interface FabricObjectData {
  id: string;
  description: string;
  // Prevents starter-image objects from appearing in the accessible model or
  // being moved/deleted by the student.
  starter?: boolean;
}

// `data` exists at runtime in fabric v6 but its generic resolution for
// FabricObject doesn't surface the property in TypeScript, so we use these
// helpers to avoid repeating the cast at every site.
type WithData = {data?: FabricObjectData};
const getData = (obj: FabricObject): FabricObjectData | undefined =>
  (obj as unknown as WithData).data;
const setData = (obj: FabricObject, data: FabricObjectData): void => {
  (obj as unknown as WithData).data = data;
};

const DEFAULT_TOOL: DrawingTool = 'select';
const DEFAULT_COLOR = '#1a1a1a';
const DEFAULT_SHAPE_SIZE = 100;
const STARTER_IMAGE_MAX_PX = 600;
// Pixels moved per arrow key press; Shift multiplies by this factor.
const CURSOR_STEP = 10;
const CURSOR_STEP_LARGE = 50;
// Degrees rotated per [ / ] key press; Shift uses the large step.
const ROTATE_STEP = 5;
const ROTATE_STEP_LARGE = 45;

const TOOL_NAMES: Record<DrawingTool, string> = {
  select: 'Select',
  rectangle: 'Rectangle',
  circle: 'Circle',
  triangle: 'Triangle',
  text: 'Text',
  line: 'Line',
  freedraw: 'Free draw',
  paintbucket: 'Paint bucket',
  emoji: 'Emoji',
};

// Curated emoji available in the stamp picker: friendly faces and cute animals.
const EMOJI_LIST = [
  '😊',
  '😄',
  '😂',
  '🥰',
  '😎',
  '🤔',
  '😴',
  '🥳',
  '😢',
  '😡',
  '🤩',
  '🥺',
  '😋',
  '😅',
  '😇',
  '🐶',
  '🐱',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐸',
  '🐧',
  '🦄',
  '🐙',
  '🦋',
  '🐢',
];

function kindFromFabricObject(
  obj: FabricObject
): DrawingObjectRecord['kind'] | null {
  if (obj instanceof Rect) return 'rectangle';
  if (obj instanceof Circle) return 'circle';
  if (obj instanceof Triangle) return 'triangle';
  if (obj instanceof IText) return 'text';
  if (obj instanceof Line) return 'line';
  if (obj.type === 'path') return 'path';
  if (obj instanceof FabricImage) return 'image';
  return null;
}

// Maximum pixel length for the longer edge of the PNG export.
const MAX_EXPORT_PX = 4096;

// Builds an SVG path string from an array of canvas points for keyboard drawing.
export function buildPathString(points: {x: number; y: number}[]): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest
    .map(p => `L ${p.x} ${p.y}`)
    .join(' ')}`;
}

function dataURLToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}

// Returns the axis-aligned bounding box that covers the full canvas viewport
// plus any objects that extend beyond it. The export area uses this so that
// objects dragged outside the visible canvas are not silently clipped.
function exportBounds(canvas: Canvas): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  let minX = 0;
  let minY = 0;
  let maxX = canvas.getWidth();
  let maxY = canvas.getHeight();
  canvas.getObjects().forEach(obj => {
    const b = obj.getBoundingRect();
    if (b.left < minX) minX = b.left;
    if (b.top < minY) minY = b.top;
    if (b.left + b.width > maxX) maxX = b.left + b.width;
    if (b.top + b.height > maxY) maxY = b.top + b.height;
  });
  return {left: minX, top: minY, width: maxX - minX, height: maxY - minY};
}

async function loadStarterImage(
  url: string,
  altText: string | null
): Promise<FabricImage | null> {
  try {
    const response = await fetch(url, {credentials: 'same-origin'});
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const img = await FabricImage.fromURL(dataUrl);
    const {width = 0, height = 0} = img;
    const scale =
      Math.min(1, STARTER_IMAGE_MAX_PX / Math.max(width, height)) || 1;
    img.scale(scale);
    img.set({
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
    });
    setData(img, {
      id: createUuid(),
      description: altText ?? 'Starter image',
      starter: true,
    });
    return img;
  } catch {
    return null;
  }
}

export interface SvgCanvasHandle {
  getBlob(): Promise<Blob>;
  getSvgBlob(): Blob;
}

interface SvgCanvasProps {
  readOnly?: boolean;
  starterImageUrl?: string | null;
  starterImageAltText?: string | null;
  onHasObjectsChange: (hasObjects: boolean) => void;
}

const SvgCanvas = forwardRef<SvgCanvasHandle, SvgCanvasProps>(
  (
    {
      readOnly = false,
      starterImageUrl,
      starterImageAltText,
      onHasObjectsChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);

    // Mutable refs so Fabric event handlers (bound once at init) see the
    // latest values without re-binding on every render.
    const toolRef = useRef<DrawingTool>(DEFAULT_TOOL);
    const colorRef = useRef<string>(DEFAULT_COLOR);
    const readOnlyRef = useRef<boolean>(readOnly);
    const lineStateRef = useRef<{
      start: {x: number; y: number};
      preview: Line;
    } | null>(null);

    const [tool, setTool] = useState<DrawingTool>(DEFAULT_TOOL);
    const [color, setColor] = useState<string>(DEFAULT_COLOR);
    const [objects, setObjects] = useState<DrawingObjectRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState('');

    // Keyboard cursor: null until the canvas container receives focus for the
    // first time, at which point it's placed at the canvas centre.
    const [cursorPos, setCursorPos] = useState<{x: number; y: number} | null>(
      null
    );
    // Whether the canvas container div itself (not a child) has focus.
    const [canvasFocused, setCanvasFocused] = useState(false);
    // First Enter on the line tool records the start point; second Enter
    // finalises the line.
    const [lineKeyStart, setLineKeyStart] = useState<{
      x: number;
      y: number;
    } | null>(null);

    // Whether the user is actively drawing a keyboard path in freedraw mode.
    const [keyDrawing, setKeyDrawing] = useState(false);
    // Accumulated path points while keyboard drawing is active.
    const keyDrawPointsRef = useRef<{x: number; y: number}[]>([]);
    // The preview Path object currently on the canvas (starter-tagged so
    // syncObjects ignores it; replaced on every step).
    const keyDrawPreviewRef = useRef<Path | null>(null);
    // Always-current ref so the canvas mouse:down handler (bound once) can
    // call the latest applyColorAt without re-binding.
    const applyColorAtRef = useRef<(pos: {x: number; y: number}) => void>(
      () => {}
    );

    const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_LIST[0]);
    // Ref mirrors selectedEmoji so the once-bound mouse:down handler sees the
    // latest value without re-binding.
    const selectedEmojiRef = useRef(EMOJI_LIST[0]);

    // Keep refs in sync with state.
    toolRef.current = tool;
    colorRef.current = color;
    readOnlyRef.current = readOnly;
    selectedEmojiRef.current = selectedEmoji;

    // --- Accessible model sync ---

    const syncObjects = useCallback(
      (canvas: Canvas) => {
        const records: DrawingObjectRecord[] = [];
        canvas.getObjects().forEach(obj => {
          const d = getData(obj);
          if (!d?.id || d.starter) return;
          const kind = kindFromFabricObject(obj);
          if (!kind) return;
          const useStroke = kind === 'line' || kind === 'path';
          const raw = useStroke ? obj.stroke : obj.fill;
          const color = typeof raw === 'string' ? raw : '';
          records.push({
            id: d.id,
            kind,
            description: d.description ?? '',
            color,
          });
        });
        setObjects(records);
        onHasObjectsChange(records.length > 0);
      },
      [onHasObjectsChange]
    );

    // --- Shared object creation (used by mouse and keyboard paths) ---

    // Adds a shape or text node at the given canvas coordinates using the
    // current tool and color. Does not handle line or freedraw.
    const addObjectAt = useCallback((x: number, y: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const currentTool = toolRef.current;
      if (
        currentTool === 'select' ||
        currentTool === 'freedraw' ||
        currentTool === 'line'
      )
        return;

      let obj: FabricObject | null = null;
      const half = DEFAULT_SHAPE_SIZE / 2;

      switch (currentTool) {
        case 'rectangle':
          obj = new Rect({
            left: x - half,
            top: y - half,
            width: DEFAULT_SHAPE_SIZE,
            height: DEFAULT_SHAPE_SIZE,
            fill: colorRef.current,
            stroke: '#000',
            strokeWidth: 1,
            strokeUniform: true,
          });
          break;
        case 'circle':
          obj = new Circle({
            left: x - half,
            top: y - half,
            radius: half,
            fill: colorRef.current,
            stroke: '#000',
            strokeWidth: 1,
            strokeUniform: true,
          });
          break;
        case 'triangle':
          obj = new Triangle({
            left: x - half,
            top: y - half,
            width: DEFAULT_SHAPE_SIZE,
            height: DEFAULT_SHAPE_SIZE,
            fill: colorRef.current,
            stroke: '#000',
            strokeWidth: 1,
            strokeUniform: true,
          });
          break;
        case 'text': {
          obj = new IText('', {
            left: x,
            top: y,
            fill: colorRef.current,
            fontSize: 20,
          });
          break;
        }
        case 'emoji': {
          obj = new IText(selectedEmojiRef.current, {
            left: x,
            top: y,
            fontSize: 40,
          });
          break;
        }
      }

      if (obj) {
        const isEmoji = currentTool === 'emoji';
        setData(obj, {
          id: createUuid(),
          description: isEmoji ? selectedEmojiRef.current : '',
        });
        canvas.add(obj);
        canvas.setActiveObject(obj);
        // Enter editing for text input but not for emoji stamps.
        if (obj instanceof IText && !isEmoji) obj.enterEditing();
        const kind = kindFromFabricObject(obj);
        setAnnouncement(
          isEmoji
            ? `Stamped ${selectedEmojiRef.current}.`
            : `Added ${kind ?? 'object'}.`
        );
      }
    }, []);

    // Adds a line between two points.
    const addLineAt = useCallback(
      (x1: number, y1: number, x2: number, y2: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const line = new Line([x1, y1, x2, y2], {
          stroke: colorRef.current,
          strokeWidth: 2,
          strokeUniform: true,
        });
        setData(line, {id: createUuid(), description: ''});
        canvas.add(line);
        canvas.setActiveObject(line);
        canvas.renderAll();
        setAnnouncement('Added line.');
      },
      []
    );

    // --- Keyboard freedraw helpers ---

    const cancelKeyDraw = useCallback(() => {
      const canvas = fabricRef.current;
      if (keyDrawPreviewRef.current && canvas) {
        canvas.remove(keyDrawPreviewRef.current);
        canvas.renderAll();
        keyDrawPreviewRef.current = null;
      }
      keyDrawPointsRef.current = [];
    }, []);

    const commitKeyDraw = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      if (keyDrawPreviewRef.current) {
        canvas.remove(keyDrawPreviewRef.current);
        keyDrawPreviewRef.current = null;
      }
      const points = keyDrawPointsRef.current;
      keyDrawPointsRef.current = [];
      const str = buildPathString(points);
      if (!str) {
        setAnnouncement(
          'Move the cursor before pressing Enter to finish the drawing.'
        );
        return;
      }
      const path = new Path(str, {
        stroke: colorRef.current,
        strokeWidth: 3,
        fill: 'transparent',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        strokeUniform: true,
      });
      setData(path, {id: createUuid(), description: ''});
      canvas.add(path);
      canvas.setActiveObject(path);
      canvas.renderAll();
      setAnnouncement('Drawing added.');
      syncObjects(canvas);
    }, [syncObjects]);

    // Applies the current color to the topmost non-starter object that contains
    // `pos`, or to the canvas background when no object is found.
    const applyColorAt = useCallback(
      (pos: {x: number; y: number}) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const objs = canvas.getObjects();
        let target: FabricObject | null = null;
        for (let i = objs.length - 1; i >= 0; i--) {
          const obj = objs[i];
          const d = getData(obj);
          if (!d?.id || d.starter) continue;
          const b = obj.getBoundingRect();
          if (
            pos.x >= b.left &&
            pos.x <= b.left + b.width &&
            pos.y >= b.top &&
            pos.y <= b.top + b.height
          ) {
            target = obj;
            break;
          }
        }
        if (target) {
          const kind = kindFromFabricObject(target);
          const useStroke = kind === 'line' || kind === 'path';
          target.set(
            useStroke ? {stroke: colorRef.current} : {fill: colorRef.current}
          );
          canvas.renderAll();
          syncObjects(canvas);
          setAnnouncement('Color applied.');
        } else {
          canvas.backgroundColor = colorRef.current;
          canvas.renderAll();
          setAnnouncement('Background color changed.');
        }
      },
      [syncObjects]
    );
    applyColorAtRef.current = applyColorAt;

    // Cancel any in-progress keyboard draw when the user switches away from
    // the free draw tool.
    useEffect(() => {
      if (tool !== 'freedraw') {
        cancelKeyDraw();
        setKeyDrawing(false);
      }
    }, [tool, cancelKeyDraw]);

    // --- Expose getBlob for submission ---

    useImperativeHandle(ref, () => ({
      getBlob: async () => {
        const canvas = fabricRef.current;
        if (!canvas) throw new Error('Canvas not initialized.');
        canvas.discardActiveObject();
        canvas.renderAll();
        const bounds = exportBounds(canvas);
        const multiplier = Math.min(
          1,
          MAX_EXPORT_PX / bounds.width,
          MAX_EXPORT_PX / bounds.height
        );
        const dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier,
          ...bounds,
        });
        return dataURLToBlob(dataUrl);
      },
      getSvgBlob: () => {
        const canvas = fabricRef.current;
        if (!canvas) throw new Error('Canvas not initialized.');
        canvas.discardActiveObject();
        canvas.renderAll();
        const {left, top, width, height} = exportBounds(canvas);
        const svg = canvas.toSVG({
          viewBox: {x: left, y: top, width, height},
        });
        return new Blob([svg], {type: 'image/svg+xml'});
      },
    }));

    // --- Canvas initialization (runs once) ---

    useEffect(() => {
      const el = canvasElRef.current;
      const container = containerRef.current;
      if (!el || !container) return;

      const {clientWidth: w, clientHeight: h} = container;
      const canvas = new Canvas(el, {
        width: w,
        height: h,
        backgroundColor: '#1e1e1e',
        selection: true,
        preserveObjectStacking: true,
      });
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = colorRef.current;
      canvas.freeDrawingBrush.width = 3;
      fabricRef.current = canvas;

      // Tag freehand paths with an id so syncObjects treats them like other shapes.
      // Fabric fires path:created after the stroke is committed and the Path
      // object is added to the canvas; at that point object:added has already
      // fired without an id, so we tag and re-sync here.
      canvas.on('path:created', e => {
        setData(e.path, {id: createUuid(), description: ''});
        setAnnouncement('Added drawing.');
        syncObjects(canvas);
      });

      // Sync the accessible object list whenever objects are added/removed/moved.
      canvas.on('object:added', () => syncObjects(canvas));
      canvas.on('object:removed', () => syncObjects(canvas));
      canvas.on('object:modified', () => syncObjects(canvas));

      // Announce and track the selected object.
      const onSelected = () => {
        const obj = canvas.getActiveObject();
        if (!obj) return;
        const d = getData(obj);
        if (d?.id && !d.starter) {
          setSelectedId(d.id);
          const kind = kindFromFabricObject(obj);
          setAnnouncement(
            `Selected: ${kind ?? 'object'}${
              d.description ? ', ' + d.description : ''
            }`
          );
        } else {
          setSelectedId(null);
        }
      };
      canvas.on('selection:created', onSelected);
      canvas.on('selection:updated', onSelected);
      canvas.on('selection:cleared', () => {
        setSelectedId(null);
        setAnnouncement('Selection cleared.');
      });

      // Mouse-driven shape and line placement. Checks toolRef/colorRef/
      // readOnlyRef so it reacts to the latest values without re-binding.
      canvas.on('mouse:down', e => {
        if (readOnlyRef.current) return;
        const currentTool = toolRef.current;
        if (currentTool === 'paintbucket') {
          const p = canvas.getScenePoint(e.e as MouseEvent);
          applyColorAtRef.current(p);
          return;
        }
        if (currentTool === 'select' || currentTool === 'freedraw') return;

        const p = canvas.getScenePoint(e.e as MouseEvent);

        if (currentTool === 'line') {
          const preview = new Line([p.x, p.y, p.x, p.y], {
            stroke: colorRef.current,
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          // Tag as starter so syncObjects ignores the preview line.
          setData(preview, {id: '__preview__', description: '', starter: true});
          canvas.add(preview);
          lineStateRef.current = {start: p, preview};
          return;
        }

        // Delegate to the shared helper so keyboard and mouse paths stay in sync.
        // addObjectAt reads toolRef/colorRef itself; we just supply the position.
        const half = DEFAULT_SHAPE_SIZE / 2;
        let obj: FabricObject | null = null;
        switch (currentTool) {
          case 'rectangle':
            obj = new Rect({
              left: p.x - half,
              top: p.y - half,
              width: DEFAULT_SHAPE_SIZE,
              height: DEFAULT_SHAPE_SIZE,
              fill: colorRef.current,
              stroke: '#000',
              strokeWidth: 1,
              strokeUniform: true,
            });
            break;
          case 'circle':
            obj = new Circle({
              left: p.x - half,
              top: p.y - half,
              radius: half,
              fill: colorRef.current,
              stroke: '#000',
              strokeWidth: 1,
              strokeUniform: true,
            });
            break;
          case 'triangle':
            obj = new Triangle({
              left: p.x - half,
              top: p.y - half,
              width: DEFAULT_SHAPE_SIZE,
              height: DEFAULT_SHAPE_SIZE,
              fill: colorRef.current,
              stroke: '#000',
              strokeWidth: 1,
              strokeUniform: true,
            });
            break;
          case 'text':
            obj = new IText('', {
              left: p.x,
              top: p.y,
              fill: colorRef.current,
              fontSize: 20,
            });
            break;
          case 'emoji':
            obj = new IText(selectedEmojiRef.current, {
              left: p.x,
              top: p.y,
              fontSize: 40,
            });
            break;
        }
        if (obj) {
          const isEmoji = currentTool === 'emoji';
          setData(obj, {
            id: createUuid(),
            description: isEmoji ? selectedEmojiRef.current : '',
          });
          canvas.add(obj);
          canvas.setActiveObject(obj);
          if (obj instanceof IText && !isEmoji) obj.enterEditing();
          setAnnouncement(
            isEmoji
              ? `Stamped ${selectedEmojiRef.current}.`
              : `Added ${kindFromFabricObject(obj) ?? 'object'}.`
          );
        }
      });

      canvas.on('mouse:move', e => {
        if (!lineStateRef.current) return;
        const p = canvas.getScenePoint(e.e as MouseEvent);
        lineStateRef.current.preview.set({x2: p.x, y2: p.y});
        canvas.requestRenderAll();
      });

      canvas.on('mouse:up', e => {
        const state = lineStateRef.current;
        if (!state) return;
        lineStateRef.current = null;

        const p = canvas.getScenePoint(e.e as MouseEvent);
        canvas.remove(state.preview);

        const dx = p.x - state.start.x;
        const dy = p.y - state.start.y;
        if (Math.sqrt(dx * dx + dy * dy) < 5) return;

        const line = new Line([state.start.x, state.start.y, p.x, p.y], {
          stroke: colorRef.current,
          strokeWidth: 2,
          strokeUniform: true,
        });
        setData(line, {id: createUuid(), description: ''});
        canvas.add(line);
        canvas.setActiveObject(line);
        setAnnouncement('Added line.');
      });

      // Delete/Backspace removes the selected non-starter object.
      const handleKeyDown = (e: KeyboardEvent) => {
        if (readOnlyRef.current) return;
        if (e.key !== 'Delete' && e.key !== 'Backspace') return;
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        const active = canvas.getActiveObject();
        if (!active) return;
        const d = getData(active);
        if (d?.id && !d.starter) {
          const kind = kindFromFabricObject(active);
          canvas.remove(active);
          canvas.discardActiveObject();
          setAnnouncement(`Deleted ${kind ?? 'object'}.`);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) return;
        const {width, height} = entry.contentRect;
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
      });
      resizeObserver.observe(container);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        resizeObserver.disconnect();
        canvas.dispose();
        fabricRef.current = null;
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Starter image ---

    useEffect(() => {
      if (!starterImageUrl) return;
      let cancelled = false;
      loadStarterImage(starterImageUrl, starterImageAltText ?? null).then(
        img => {
          if (cancelled || !img || !fabricRef.current) return;
          fabricRef.current.add(img);
          fabricRef.current.sendObjectToBack(img);
          fabricRef.current.renderAll();
        }
      );
      return () => {
        cancelled = true;
      };
    }, [starterImageUrl, starterImageAltText]);

    // --- Tool mode side-effects ---

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.isDrawingMode = tool === 'freedraw';
      canvas.selection = tool === 'select';
      // Disable hit-testing for shape/draw tools so clicking on an existing
      // object cannot select it while a placement tool is active.
      canvas.skipTargetFind = tool !== 'select';
      canvas.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
      if (tool !== 'select') {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
      if (tool === 'freedraw' && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = colorRef.current;
      }
      // Switching tools cancels any in-progress keyboard line.
      setLineKeyStart(null);
    }, [tool]);

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas || !canvas.isDrawingMode || !canvas.freeDrawingBrush) return;
      canvas.freeDrawingBrush.color = color;
    }, [color]);

    // --- Canvas container focus/blur ---

    const handleContainerFocus = (e: FocusEvent<HTMLDivElement>) => {
      // Only react when the container div itself gains focus, not a child.
      if (e.target !== e.currentTarget) return;
      setCanvasFocused(true);
      // Place cursor at canvas centre the first time focus arrives.
      if (!cursorPos) {
        const container = containerRef.current;
        setCursorPos({
          x: (container?.clientWidth ?? 400) / 2,
          y: (container?.clientHeight ?? 300) / 2,
        });
      }
      // In select mode with no active object, auto-select the first object and
      // move focus to its accessible list item so screen readers announce it.
      if (toolRef.current !== 'select') return;
      const canvas = fabricRef.current;
      if (!canvas || canvas.getActiveObject()) return;
      const first = canvas.getObjects().find(o => {
        const d = getData(o);
        return d?.id && !d.starter;
      });
      if (!first) return;
      canvas.setActiveObject(first);
      canvas.renderAll();
      const id = getData(first)?.id;
      if (!id) return;
      // Defer focus until React has re-rendered the list with the new selection.
      setTimeout(() => {
        containerRef.current
          ?.querySelector<HTMLElement>(`li[data-id="${id}"]`)
          ?.focus();
      }, 0);
    };

    const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
      // Keep canvasFocused true if focus moved to a child (e.g., the list).
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setCanvasFocused(false);
    };

    // --- Keyboard placement handler on the canvas container ---

    const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Only handle when the container div itself (not a child) has focus so
      // the accessible-list arrow-key navigation is unaffected.
      if (e.target !== e.currentTarget) return;
      if (readOnly) return;

      const step = e.shiftKey ? CURSOR_STEP_LARGE : CURSOR_STEP;

      if (tool === 'freedraw') {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const isArrow = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.key);
        if (isArrow) {
          e.preventDefault();
          e.stopPropagation();
          const cur = cursorPos ?? {x: 200, y: 150};
          const next =
            e.key === 'ArrowUp'
              ? {x: cur.x, y: Math.max(0, cur.y - step)}
              : e.key === 'ArrowDown'
              ? {x: cur.x, y: cur.y + step}
              : e.key === 'ArrowLeft'
              ? {x: Math.max(0, cur.x - step), y: cur.y}
              : {x: cur.x + step, y: cur.y};
          setCursorPos(next);
          if (keyDrawing) {
            keyDrawPointsRef.current.push(next);
            // Replace the preview path with one that includes the new point.
            if (keyDrawPreviewRef.current)
              canvas.remove(keyDrawPreviewRef.current);
            const previewStr = buildPathString(keyDrawPointsRef.current);
            if (previewStr) {
              const preview = new Path(previewStr, {
                stroke: colorRef.current,
                strokeWidth: 3,
                fill: 'transparent',
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
                strokeUniform: true,
                selectable: false,
                evented: false,
              });
              setData(preview, {
                id: '__kd_preview__',
                description: '',
                starter: true,
              });
              canvas.add(preview);
              keyDrawPreviewRef.current = preview;
              canvas.renderAll();
            }
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const pos = cursorPos ?? {x: 200, y: 150};
          if (!keyDrawing) {
            setKeyDrawing(true);
            keyDrawPointsRef.current = [pos];
            setAnnouncement(
              'Drawing started. Use arrow keys to draw, then press Enter to finish, or Escape to cancel.'
            );
          } else {
            commitKeyDraw();
            setKeyDrawing(false);
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          if (keyDrawing) {
            cancelKeyDraw();
            setKeyDrawing(false);
            setAnnouncement('Drawing cancelled.');
          } else {
            setTool('select');
            setAnnouncement('Returned to select tool.');
          }
          return;
        }
        return;
      }

      if (tool === 'paintbucket') {
        const isArrow = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.key);
        if (isArrow) {
          e.preventDefault();
          e.stopPropagation();
          setCursorPos(p => {
            const cur = p ?? {x: 200, y: 150};
            if (e.key === 'ArrowUp')
              return {x: cur.x, y: Math.max(0, cur.y - step)};
            if (e.key === 'ArrowDown') return {x: cur.x, y: cur.y + step};
            if (e.key === 'ArrowLeft')
              return {x: Math.max(0, cur.x - step), y: cur.y};
            return {x: cur.x + step, y: cur.y};
          });
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          applyColorAt(cursorPos ?? {x: 200, y: 150});
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setTool('select');
          setAnnouncement('Returned to select tool.');
          return;
        }
        return;
      }

      if (tool === 'select') {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (!canvas || !obj) return;
        const isArrow = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ].includes(e.key);
        const isRotate = e.key === '[' || e.key === ']';
        if (!isArrow && !isRotate) return;
        e.preventDefault();
        e.stopPropagation();
        if (isRotate) {
          const rotateStep = e.shiftKey ? ROTATE_STEP_LARGE : ROTATE_STEP;
          const delta = e.key === ']' ? rotateStep : -rotateStep;
          obj.set({angle: ((obj.angle ?? 0) + delta + 360) % 360});
          setAnnouncement(`Rotation: ${Math.round(obj.angle ?? 0)} degrees.`);
        } else if (e.altKey) {
          // Alt + Arrow: resize along the arrow axis.
          if (e.key === 'ArrowRight') {
            const w = obj.getScaledWidth();
            obj.scaleX = ((obj.scaleX ?? 1) * (w + step)) / w;
          } else if (e.key === 'ArrowLeft') {
            const w = obj.getScaledWidth();
            obj.scaleX = ((obj.scaleX ?? 1) * Math.max(10, w - step)) / w;
          } else if (e.key === 'ArrowUp') {
            const h = obj.getScaledHeight();
            obj.scaleY = ((obj.scaleY ?? 1) * (h + step)) / h;
          } else {
            const h = obj.getScaledHeight();
            obj.scaleY = ((obj.scaleY ?? 1) * Math.max(10, h - step)) / h;
          }
          setAnnouncement(
            `Resized to ${Math.round(obj.getScaledWidth())} by ${Math.round(
              obj.getScaledHeight()
            )}.`
          );
        } else {
          // Arrow: move.
          if (e.key === 'ArrowUp') obj.set({top: (obj.top ?? 0) - step});
          else if (e.key === 'ArrowDown') obj.set({top: (obj.top ?? 0) + step});
          else if (e.key === 'ArrowLeft')
            obj.set({left: (obj.left ?? 0) - step});
          else obj.set({left: (obj.left ?? 0) + step});
          setAnnouncement(
            `Position: ${Math.round(obj.left ?? 0)}, ${Math.round(
              obj.top ?? 0
            )}.`
          );
        }
        obj.setCoords();
        canvas.renderAll();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setCursorPos(p => ({
            x: p?.x ?? 0,
            y: Math.max(0, (p?.y ?? 0) - step),
          }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setCursorPos(p => ({x: p?.x ?? 0, y: (p?.y ?? 0) + step}));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          setCursorPos(p => ({
            x: Math.max(0, (p?.x ?? 0) - step),
            y: p?.y ?? 0,
          }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          setCursorPos(p => ({x: (p?.x ?? 0) + step, y: p?.y ?? 0}));
          break;
        case 'Enter': {
          e.preventDefault();
          const pos = cursorPos ?? {x: 200, y: 150};
          if (tool === 'line') {
            if (!lineKeyStart) {
              setLineKeyStart(pos);
              setAnnouncement(
                'Line start set. Move cursor with arrow keys and press Enter to complete the line, or Escape to cancel.'
              );
            } else {
              const dx = pos.x - lineKeyStart.x;
              const dy = pos.y - lineKeyStart.y;
              if (Math.sqrt(dx * dx + dy * dy) >= 5) {
                addLineAt(lineKeyStart.x, lineKeyStart.y, pos.x, pos.y);
              } else {
                setAnnouncement(
                  'Move the cursor further before pressing Enter to complete the line.'
                );
              }
              setLineKeyStart(null);
            }
          } else {
            addObjectAt(pos.x, pos.y);
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          setLineKeyStart(null);
          setTool('select');
          setAnnouncement('Returned to select tool.');
          break;
        default:
          break;
      }
    };

    // --- Accessible list → canvas selection ---

    const handleListSelect = useCallback((id: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getObjects().find(o => getData(o)?.id === id);
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    }, []);

    // --- Description update ---

    const handleDescriptionChange = useCallback(
      (description: string) => {
        const canvas = fabricRef.current;
        if (!canvas || !selectedId) return;
        const obj = canvas
          .getObjects()
          .find(o => getData(o)?.id === selectedId);
        if (obj) {
          const existing = getData(obj);
          if (existing) setData(obj, {...existing, description});
          syncObjects(canvas);
        }
      },
      [selectedId, syncObjects]
    );

    // --- Color change ---

    const handleColorChange = useCallback(
      (newColor: string) => {
        setColor(newColor);
        if (tool !== 'select' || !selectedId) return;
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas
          .getObjects()
          .find(o => getData(o)?.id === selectedId);
        if (!obj) return;
        const kind = kindFromFabricObject(obj);
        const useStroke = kind === 'line' || kind === 'path';
        obj.set(useStroke ? {stroke: newColor} : {fill: newColor});
        canvas.renderAll();
        syncObjects(canvas);
        setAnnouncement('Color changed.');
      },
      [tool, selectedId, syncObjects]
    );

    // Moves focus from the emoji picker back to the canvas so the user can
    // immediately use arrow keys and Enter to stamp the selected emoji.
    const handleEmojiConfirm = useCallback(() => {
      containerRef.current?.focus();
    }, []);

    // --- Delete via toolbar button ---

    const handleDeleteSelected = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas || !selectedId) return;
      const obj = canvas.getObjects().find(o => getData(o)?.id === selectedId);
      if (obj) {
        const kind = kindFromFabricObject(obj);
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.renderAll();
        setAnnouncement(`Deleted ${kind ?? 'object'}.`);
      }
    }, [selectedId]);

    // --- Layer order via toolbar buttons ---

    const makeLayerHandler = useCallback(
      (op: 'toFront' | 'forward' | 'backward' | 'toBack', label: string) =>
        () => {
          const canvas = fabricRef.current;
          if (!canvas || !selectedId) return;
          const obj = canvas
            .getObjects()
            .find(o => getData(o)?.id === selectedId);
          if (!obj) return;
          if (op === 'toFront') canvas.bringObjectToFront(obj);
          else if (op === 'forward') canvas.bringObjectForward(obj);
          else if (op === 'backward') canvas.sendObjectBackwards(obj);
          else canvas.sendObjectToBack(obj);
          canvas.renderAll();
          syncObjects(canvas);
          setAnnouncement(label);
        },
      [selectedId, syncObjects]
    );

    const handleBringToFront = makeLayerHandler('toFront', 'Brought to front.');
    const handleBringForward = makeLayerHandler('forward', 'Moved forward.');
    const handleSendBackward = makeLayerHandler('backward', 'Moved backward.');
    const handleSendToBack = makeLayerHandler('toBack', 'Sent to back.');

    const selectedRecord = objects.find(o => o.id === selectedId) ?? null;

    // The aria-label on the canvas container describes the current interaction
    // model so screen reader users know what the arrow keys and Enter will do.
    const canvasAriaLabel = (() => {
      if (readOnly) return 'Drawing canvas, read only.';
      if (tool === 'select')
        return selectedId
          ? 'Object selected. Arrow keys move, Alt and arrow keys resize, [ and ] rotate, Shift for larger steps.'
          : 'Drawing canvas. Select tool. Tab to navigate objects in the list below.';
      if (tool === 'freedraw')
        return keyDrawing
          ? 'Drawing in progress. Arrow keys extend the path, Enter finishes, Escape cancels.'
          : 'Free draw tool. Enter to start drawing, then use arrow keys. You can also draw with a mouse or touch. Escape returns to Select.';
      if (tool === 'paintbucket')
        return 'Paint bucket tool. Arrow keys move cursor, Shift for larger steps. Press Enter to apply the current color to the object under the cursor, or to the background when no object is there. Escape returns to Select.';
      if (tool === 'emoji')
        return `Emoji tool. ${selectedEmoji} selected. Arrow keys move cursor, Shift for larger steps. Press Enter to stamp the emoji. Escape returns to Select.`;
      if (tool === 'line') {
        return lineKeyStart
          ? 'Line tool: start point set. Move cursor with arrow keys, then press Enter to complete the line, or Escape to cancel.'
          : `Line tool. Arrow keys move cursor. Enter sets the start point. Escape returns to Select.`;
      }
      return `${
        TOOL_NAMES[tool]
      } tool. Arrow keys move cursor, Shift and arrow keys for larger steps. Enter places a ${TOOL_NAMES[
        tool
      ].toLowerCase()}. Escape returns to Select.`;
    })();

    const showCursor =
      !readOnly && canvasFocused && cursorPos !== null && tool !== 'select';

    return (
      <div className={styles.svgCanvas}>
        {!readOnly && (
          <div className={styles.toolbarWrapper}>
            <Toolbar
              tool={tool}
              color={color}
              selectedId={selectedId}
              onToolChange={setTool}
              onColorChange={handleColorChange}
              onDeleteSelected={handleDeleteSelected}
              onBringToFront={handleBringToFront}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              onSendToBack={handleSendToBack}
            />
            {tool === 'emoji' && (
              <EmojiPicker
                emojis={EMOJI_LIST}
                selectedEmoji={selectedEmoji}
                onEmojiChange={setSelectedEmoji}
                onConfirm={handleEmojiConfirm}
              />
            )}
          </div>
        )}

        <div className={styles.canvasColumn}>
          {/* role="application" suppresses AT browse-mode key interception so
              arrow keys reach our handler; jsx-a11y doesn't list it as
              interactive even though the ARIA spec requires it to have keyboard
              handlers. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className={styles.canvasContainer}
            ref={containerRef}
            style={readOnly ? {pointerEvents: 'none'} : undefined}
            tabIndex={readOnly ? undefined : 0}
            role="application"
            aria-label={canvasAriaLabel}
            onFocus={handleContainerFocus}
            onBlur={handleContainerBlur}
            onKeyDown={handleContainerKeyDown}
          >
            <canvas ref={canvasElRef} />

            {/* Keyboard placement cursor — crosshair at the current cursor position. */}
            {showCursor && cursorPos && (
              <div
                aria-hidden="true"
                className={styles.canvasCursor}
                style={{left: cursorPos.x, top: cursorPos.y}}
              />
            )}

            {/* Marker for the first click of a keyboard-drawn line. */}
            {showCursor && lineKeyStart && (
              <div
                aria-hidden="true"
                className={styles.lineStartMarker}
                style={{left: lineKeyStart.x, top: lineKeyStart.y}}
              />
            )}

            {/* Keyboard-navigable object list: visually hidden, screen reader accessible. */}
            <AccessibleObjectList
              objects={objects}
              selectedId={selectedId}
              onSelect={handleListSelect}
            />

            {/* Announces add / select / delete events to screen readers. */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className={styles.srOnly}
              role="status"
            >
              {announcement}
            </div>
          </div>

          {!readOnly && (
            <PropertyPanel
              selected={selectedRecord}
              onDescriptionChange={handleDescriptionChange}
            />
          )}
        </div>
      </div>
    );
  }
);

SvgCanvas.displayName = 'SvgCanvas';

export default SvgCanvas;
