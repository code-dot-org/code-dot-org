import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  IText,
  Line,
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

const TOOL_NAMES: Record<DrawingTool, string> = {
  select: 'Select',
  rectangle: 'Rectangle',
  circle: 'Circle',
  triangle: 'Triangle',
  text: 'Text',
  line: 'Line',
  freedraw: 'Free draw',
};

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

function dataURLToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
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

    // Keep refs in sync with state.
    toolRef.current = tool;
    colorRef.current = color;
    readOnlyRef.current = readOnly;

    // --- Accessible model sync ---

    const syncObjects = useCallback(
      (canvas: Canvas) => {
        const records: DrawingObjectRecord[] = [];
        canvas.getObjects().forEach(obj => {
          const d = getData(obj);
          if (!d?.id || d.starter) return;
          const kind = kindFromFabricObject(obj);
          if (!kind) return;
          records.push({id: d.id, kind, description: d.description ?? ''});
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
      }

      if (obj) {
        setData(obj, {id: createUuid(), description: ''});
        canvas.add(obj);
        canvas.setActiveObject(obj);
        if (obj instanceof IText) obj.enterEditing();
        const kind = kindFromFabricObject(obj);
        setAnnouncement(`Added ${kind ?? 'object'}.`);
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

    // --- Expose getBlob for submission ---

    useImperativeHandle(ref, () => ({
      getBlob: async () => {
        const canvas = fabricRef.current;
        if (!canvas) throw new Error('Canvas not initialized.');
        canvas.discardActiveObject();
        canvas.renderAll();
        const dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });
        return dataURLToBlob(dataUrl);
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
      });
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = colorRef.current;
      canvas.freeDrawingBrush.width = 3;
      fabricRef.current = canvas;

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
        if (currentTool === 'select' || currentTool === 'freedraw' || e.target)
          return;

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
        }
        if (obj) {
          setData(obj, {id: createUuid(), description: ''});
          canvas.add(obj);
          canvas.setActiveObject(obj);
          if (obj instanceof IText) obj.enterEditing();
          setAnnouncement(`Added ${kindFromFabricObject(obj) ?? 'object'}.`);
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
      canvas.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
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
      if (tool === 'select' || tool === 'freedraw') return;

      const step = e.shiftKey ? CURSOR_STEP_LARGE : CURSOR_STEP;

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

    const selectedRecord = objects.find(o => o.id === selectedId) ?? null;

    // The aria-label on the canvas container describes the current interaction
    // model so screen reader users know what the arrow keys and Enter will do.
    const canvasAriaLabel = (() => {
      if (readOnly) return 'Drawing canvas, read only.';
      if (tool === 'select')
        return 'Drawing canvas. Tab to navigate objects in the list below.';
      if (tool === 'freedraw')
        return 'Drawing canvas. Free draw tool selected; use a mouse or touch screen to draw.';
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
      !readOnly &&
      canvasFocused &&
      cursorPos !== null &&
      tool !== 'select' &&
      tool !== 'freedraw';

    return (
      <div className={styles.svgCanvas}>
        {!readOnly && (
          <Toolbar
            tool={tool}
            color={color}
            selectedId={selectedId}
            onToolChange={setTool}
            onColorChange={setColor}
            onDeleteSelected={handleDeleteSelected}
          />
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
