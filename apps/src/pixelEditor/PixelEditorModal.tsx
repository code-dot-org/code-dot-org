import {CustomDialog} from '@code-dot-org/component-library/dialog';
import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import ColorPicker from './ColorPicker';
import {crispScaleFor, downsampleToGrid, upscaleNearest} from './pixelArt';
import PixelTooltip from './PixelTooltip';
import {PixelTool, TOOLS, toolTitle} from './toolDefinitions';
import {
  BRUSH_SIZES,
  drawCircle,
  drawRect,
  floodFill,
  Raster,
  RGBA,
  stamp,
  stampLine,
  TRANSPARENT,
} from './tools';

import moduleStyles from './pixel-editor.module.scss';

// Internal display-canvas resolution: integer upscale of the backing image,
// as large as fits this budget. The rendered (CSS) size is independent: the
// canvas fills this fraction of the viewport, capped, aspect preserved.
const MAX_DISPLAY_SIZE = 640;
const CSS_HEIGHT_VIEWPORT_FRACTION = 0.68;
const MAX_CSS_HEIGHT_PX = 720;
const CSS_WIDTH_VIEWPORT_FRACTION = 0.76;
const MAX_CSS_WIDTH_PX = 900;

// Transparency checkerboard: cell size in display px outside pixel mode, the
// smallest legible cell in pixel mode (art-pixel cells are grouped up to it),
// and the tint drawn over the white base.
const CHECKER_CELL_PX = 16;
const MIN_CHECKER_CELL_PX = 4;
const CHECKER_COLOR = 'rgb(128 128 128 / 16%)';

// Dark navy ink.
const DEFAULT_COLOR: RGBA = [31, 41, 71, 255];

// Summed per-channel difference a pixel may have from the clicked color and
// still flood-fill: AI-generated "solid" regions carry small variations that
// exact matching splinters into unfilled specks. Small enough that
// anti-aliased edges (which differ by far more) still stop the fill.
const FILL_TOLERANCE = 32;

// Shape previews drawn in the picked color would be invisible when that
// color is transparent; the preview layer uses this stand-in instead. The
// committed shape uses the real color.
const PREVIEW_STANDIN: RGBA = [128, 128, 128, 140];

// Undo history: one snapshot per completed operation, bounded by memory, not
// count — a 64x64 pixel-art backing is 16KB but a native-resolution image
// can be megabytes. At least MIN_UNDO_DEPTH steps are always kept.
const UNDO_BYTE_BUDGET = 16 * 1024 * 1024;
const MIN_UNDO_DEPTH = 4;
const MAX_UNDO_DEPTH = 30;

// Recently used colors, shown as one row in the color picker. Persisted per
// image in localStorage so they survive reopening the editor.
const RECENT_COLORS_MAX = 8;
const recentColorsStorageKey = (imageKey: string) =>
  `pixelEditor.recentColors.${imageKey}`;

const SHAPE_TOOLS: ReadonlySet<PixelTool> = new Set([
  'circle',
  'filledCircle',
  'rect',
  'filledRect',
]);

// Brush-size swatch dot: rendered edge in px for brush size N.
const brushDotPx = (size: number) => 3 + size * 1.6;

interface PixelEditorModalProps {
  title: string;
  // The image to edit (dataURI or URL; must be canvas-readable).
  imageUrl: string;
  // Physical pixels per art pixel, when the image is known pixel art (e.g.
  // recorded at generation time). > 1 opens the editor at the image's
  // LOGICAL resolution. Absent/1 = edit at native resolution; the editor
  // does no detection of its own.
  knownPixelGrid?: number;
  // Stable identity for this image (e.g. the animation key); keys the
  // per-image recent-colors persistence. Absent = recents are session-only.
  imageKey?: string;
  onSave: (dataURI: string, meta: {pixelGridSize?: number}) => void;
  onCancel: () => void;
}

/**
 * A small, self-contained pixel editor in a modal. Edits happen on a backing
 * canvas at the image's native resolution; the display canvas scales it up
 * with nearest-neighbor sampling. Tools: pen, eraser, tolerant bucket fill,
 * eyedropper, outline/solid circles and rectangles, four brush sizes, one
 * color (full-spectrum picker with per-image recents and transparent), and
 * memory-bounded undo/redo. Save hands back a PNG dataURI; Cancel discards.
 * Both close the modal.
 */
const PixelEditorModal: React.FunctionComponent<PixelEditorModalProps> = ({
  title,
  imageUrl,
  knownPixelGrid,
  imageKey,
  onSave,
  onCancel,
}) => {
  const [tool, setTool] = useState<PixelTool>('pen');
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [color, setColor] = useState<RGBA>(DEFAULT_COLOR);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // Editing at the image's logical resolution (see knownPixelGrid).
  const [pixelMode, setPixelMode] = useState(false);
  // Mirror for the stable repaint callback (which runs on every stroke).
  const pixelModeRef = useRef(false);

  const displayRef = useRef<HTMLCanvasElement | null>(null);
  // Backing canvas at native image resolution: the single source of truth.
  const backingRef = useRef<HTMLCanvasElement | null>(null);
  // Circle preview: drawn over the backing on the display until pointer-up.
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const scaleRef = useRef(1);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{x: number; y: number} | null>(null);
  // Anchor corner/center of the shape being dragged (circle or rectangle).
  const shapeStartRef = useRef<{x: number; y: number} | null>(null);

  // Undo/redo: snapshots of the backing's pixels, one per completed
  // operation, in refs (they change on every stroke). historyVersion only
  // exists to re-render the buttons' disabled state.
  const undoStackRef = useRef<Uint8ClampedArray[]>([]);
  const redoStackRef = useRef<Uint8ClampedArray[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);

  // Recently used colors, most recent first (transparent excluded: it has a
  // permanent swatch of its own in the picker).
  const [recentColors, setRecentColors] = useState<RGBA[]>(() => {
    if (!imageKey) {
      return [];
    }
    try {
      const stored = localStorage.getItem(recentColorsStorageKey(imageKey));
      return stored ? (JSON.parse(stored) as RGBA[]) : [];
    } catch {
      return [];
    }
  });
  const recordColorUse = useCallback(
    (used: RGBA) => {
      if (used[3] === 0) {
        return;
      }
      setRecentColors(prev => {
        const next = [
          used,
          ...prev.filter(c => !c.every((v, i) => v === used[i])),
        ].slice(0, RECENT_COLORS_MAX);
        if (imageKey) {
          try {
            localStorage.setItem(
              recentColorsStorageKey(imageKey),
              JSON.stringify(next)
            );
          } catch {
            // Quota/privacy-mode failures just lose persistence.
          }
        }
        return next;
      });
    },
    [imageKey]
  );

  // Snapshot the backing before a mutating operation. Memory-bounded: total
  // snapshot bytes stay under UNDO_BYTE_BUDGET (large images keep fewer
  // steps, never fewer than MIN_UNDO_DEPTH). A new operation invalidates the
  // redo stack.
  const pushUndo = useCallback(() => {
    const backing = backingRef.current;
    const ctx = backing?.getContext('2d');
    if (!backing || !ctx) {
      return;
    }
    const stack = undoStackRef.current;
    stack.push(
      new Uint8ClampedArray(
        ctx.getImageData(0, 0, backing.width, backing.height).data
      )
    );
    const bytesPer = backing.width * backing.height * 4;
    const maxDepth = Math.min(
      MAX_UNDO_DEPTH,
      Math.max(MIN_UNDO_DEPTH, Math.floor(UNDO_BYTE_BUDGET / bytesPer))
    );
    while (stack.length > maxDepth) {
      stack.shift();
    }
    redoStackRef.current = [];
    setHistoryVersion(v => v + 1);
  }, []);

  const restoreSnapshot = useCallback((pixels: Uint8ClampedArray) => {
    const backing = backingRef.current;
    const ctx = backing?.getContext('2d');
    if (!backing || !ctx) {
      return;
    }
    ctx.putImageData(
      new ImageData(new Uint8ClampedArray(pixels), backing.width),
      0,
      0
    );
  }, []);

  const currentPixels = useCallback(() => {
    const backing = backingRef.current;
    const ctx = backing?.getContext('2d');
    if (!backing || !ctx) {
      return null;
    }
    return new Uint8ClampedArray(
      ctx.getImageData(0, 0, backing.width, backing.height).data
    );
  }, []);

  // Composite the transparency checkerboard, the backing, and (while
  // dragging a circle) the preview to the display. The checker lives in the
  // canvas so it aligns with the image: in pixel mode one checker cell is one
  // art pixel (grouped to stay legible at tiny zooms), matching how dedicated
  // pixel editors show transparency.
  const repaint = useCallback(() => {
    const display = displayRef.current;
    const backing = backingRef.current;
    if (!display || !backing) {
      return;
    }
    const ctx = display.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, display.width, display.height);
    const scale = scaleRef.current;
    const cell = pixelModeRef.current
      ? scale * Math.max(1, Math.ceil(MIN_CHECKER_CELL_PX / scale))
      : CHECKER_CELL_PX;
    ctx.fillStyle = CHECKER_COLOR;
    for (let y = 0; y * cell < display.height; y++) {
      for (let x = y % 2; x * cell < display.width; x += 2) {
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    ctx.drawImage(backing, 0, 0, display.width, display.height);
    if (previewRef.current) {
      ctx.drawImage(previewRef.current, 0, 0, display.width, display.height);
    }
  }, []);

  const undo = useCallback(() => {
    const previous = undoStackRef.current.pop();
    if (!previous) {
      return;
    }
    const current = currentPixels();
    if (current) {
      redoStackRef.current.push(current);
    }
    restoreSnapshot(previous);
    repaint();
    setHistoryVersion(v => v + 1);
  }, [currentPixels, restoreSnapshot, repaint]);

  const redo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) {
      return;
    }
    const current = currentPixels();
    if (current) {
      undoStackRef.current.push(current);
    }
    restoreSnapshot(next);
    repaint();
    setHistoryVersion(v => v + 1);
  }, [currentPixels, restoreSnapshot, repaint]);
  // Refs so the window keydown listener below can stay mounted once.
  const undoRef = useRef(undo);
  undoRef.current = undo;
  const redoRef = useRef(redo);
  redoRef.current = redo;

  // Load the image into the backing canvas (at logical resolution when
  // knownPixelGrid applies) and size the display. Decode via
  // createImageBitmap (native async decode, off the main thread), falling
  // back to an Image element. Canvases we read back get willReadFrequently
  // to stay CPU-side — GPU readback stalls.
  useEffect(() => {
    let cancelled = false;
    const finish = (
      source: CanvasImageSource,
      width: number,
      height: number
    ) => {
      if (cancelled) {
        return;
      }
      let backing = document.createElement('canvas');
      backing.width = width;
      backing.height = height;
      const ctx = backing.getContext('2d', {willReadFrequently: true});
      ctx?.drawImage(source, 0, 0);
      // Trust the metadata only when it divides the image cleanly (a resize
      // elsewhere would otherwise smear the downsample).
      const grid =
        knownPixelGrid &&
        knownPixelGrid > 1 &&
        width % knownPixelGrid === 0 &&
        height % knownPixelGrid === 0
          ? knownPixelGrid
          : null;
      const raster = grid ? ctx?.getImageData(0, 0, width, height) : null;
      if (raster && grid) {
        const logical = downsampleToGrid(raster, {
          sizeX: grid,
          sizeY: grid,
          offsetX: 0,
          offsetY: 0,
          confidence: 1,
        });
        backing = document.createElement('canvas');
        backing.width = logical.width;
        backing.height = logical.height;
        backing
          .getContext('2d', {willReadFrequently: true})
          ?.putImageData(
            new ImageData(
              new Uint8ClampedArray(logical.data),
              logical.width,
              logical.height
            ),
            0,
            0
          );
        setPixelMode(true);
        pixelModeRef.current = true;
      } else {
        setPixelMode(false);
        pixelModeRef.current = false;
      }
      backingRef.current = backing;
      const preview = document.createElement('canvas');
      preview.width = backing.width;
      preview.height = backing.height;
      // The circle preview is also read back per pointer-move.
      preview.getContext('2d', {willReadFrequently: true});
      previewRef.current = preview;
      scaleRef.current = Math.max(
        1,
        Math.floor(MAX_DISPLAY_SIZE / Math.max(backing.width, backing.height))
      );
      setLoaded(true);
    };
    const loadViaImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => finish(img, img.naturalWidth, img.naturalHeight);
      img.onerror = () => {
        if (!cancelled) {
          setLoadError(true);
        }
      };
      img.src = imageUrl;
    };
    if (typeof createImageBitmap === 'function') {
      HttpClient.get(imageUrl)
        .then(response => response.blob())
        .then(blob => createImageBitmap(blob))
        .then(bitmap => {
          finish(bitmap, bitmap.width, bitmap.height);
          bitmap.close();
        })
        .catch(loadViaImage);
    } else {
      loadViaImage();
    }
    return () => {
      cancelled = true;
    };
  }, [imageUrl, knownPixelGrid]);

  // Single-key shortcuts (shown in the tooltips): letters pick tools, digits
  // 1-4 pick brush sizes. Ctrl/Cmd+Z undoes, with Shift (or Ctrl+Y) redoes;
  // other modifier combos pass through so browser shortcuts keep working.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        (key === 'z' || key === 'y')
      ) {
        e.preventDefault();
        if (key === 'y' || e.shiftKey) {
          redoRef.current();
        } else {
          undoRef.current();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      const match = TOOLS.find(t => t.shortcut === e.key.toLowerCase());
      if (match) {
        setTool(match.id);
        return;
      }
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= BRUSH_SIZES.length) {
        setBrushSize(BRUSH_SIZES[digit - 1]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Layout effect: size and paint the canvas BEFORE the browser paints the
  // newly-mounted panel, or its first frame flashes default-sized. The
  // rendered size fills the viewport allowance (aspect preserved, the modal
  // sizes to match); image-rendering: pixelated covers the fractional
  // remainder over the integer-upscaled internal resolution.
  useLayoutEffect(() => {
    if (!loaded) {
      return;
    }
    const display = displayRef.current;
    const backing = backingRef.current;
    if (display && backing) {
      display.width = backing.width * scaleRef.current;
      display.height = backing.height * scaleRef.current;
      const aspect = backing.width / backing.height;
      let cssH = Math.min(
        window.innerHeight * CSS_HEIGHT_VIEWPORT_FRACTION,
        MAX_CSS_HEIGHT_PX
      );
      let cssW = cssH * aspect;
      const maxW = Math.min(
        window.innerWidth * CSS_WIDTH_VIEWPORT_FRACTION,
        MAX_CSS_WIDTH_PX
      );
      if (cssW > maxW) {
        cssW = maxW;
        cssH = cssW / aspect;
      }
      display.style.width = `${Math.round(cssW)}px`;
      display.style.height = `${Math.round(cssH)}px`;
      repaint();
    }
  }, [loaded, repaint]);

  // Map a pointer event to backing-canvas pixel coordinates.
  const toPixel = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const display = displayRef.current;
    const backing = backingRef.current;
    if (!display || !backing) {
      return null;
    }
    const rect = display.getBoundingClientRect();
    const x = Math.floor(
      ((e.clientX - rect.left) / rect.width) * backing.width
    );
    const y = Math.floor(
      ((e.clientY - rect.top) / rect.height) * backing.height
    );
    if (x < 0 || y < 0 || x >= backing.width || y >= backing.height) {
      return null;
    }
    return {x, y};
  }, []);

  // Run an operation against the backing canvas's pixels, then repaint.
  const withRaster = useCallback(
    (target: HTMLCanvasElement, op: (raster: Raster) => void) => {
      const ctx = target.getContext('2d');
      if (!ctx) {
        return;
      }
      const imageData = ctx.getImageData(0, 0, target.width, target.height);
      op(imageData);
      ctx.putImageData(imageData, 0, 0);
      repaint();
    },
    [repaint]
  );

  // Draw the active shape tool between its anchor and the current point.
  const drawShape = useCallback(
    (
      raster: Raster,
      start: {x: number; y: number},
      end: {x: number; y: number},
      size: number,
      shapeColor: RGBA
    ) => {
      if (tool === 'circle' || tool === 'filledCircle') {
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        drawCircle(
          raster,
          start.x,
          start.y,
          radius,
          size,
          shapeColor,
          tool === 'filledCircle'
        );
      } else {
        drawRect(
          raster,
          start.x,
          start.y,
          end.x,
          end.y,
          size,
          shapeColor,
          tool === 'filledRect'
        );
      }
    },
    [tool]
  );

  // Read the backing pixel under the pointer into the active color. The
  // spectrum picker has no alpha axis, so partial alpha snaps to opaque;
  // fully transparent picks the transparent color.
  const pickColorAt = useCallback((p: {x: number; y: number}) => {
    const ctx = backingRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    const [r, g, b, a] = ctx.getImageData(p.x, p.y, 1, 1).data;
    setColor(a === 0 ? TRANSPARENT : [r, g, b, 255]);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const p = toPixel(e);
      const backing = backingRef.current;
      if (!p || !backing) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      if (tool === 'eyedropper') {
        pickColorAt(p);
      } else if (tool === 'pen' || tool === 'eraser') {
        pushUndo();
        if (tool === 'pen') {
          recordColorUse(color);
        }
        lastPointRef.current = p;
        withRaster(backing, raster =>
          stamp(raster, p.x, p.y, brushSize, tool === 'pen' ? color : null)
        );
      } else if (tool === 'bucket') {
        pushUndo();
        recordColorUse(color);
        withRaster(backing, raster =>
          floodFill(raster, p.x, p.y, color, FILL_TOLERANCE)
        );
      } else {
        shapeStartRef.current = p;
      }
    },
    [
      tool,
      brushSize,
      color,
      toPixel,
      withRaster,
      pushUndo,
      recordColorUse,
      pickColorAt,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) {
        return;
      }
      const p = toPixel(e);
      const backing = backingRef.current;
      const preview = previewRef.current;
      if (!p || !backing) {
        return;
      }
      if (tool === 'eyedropper') {
        pickColorAt(p);
      } else if (tool === 'pen' || tool === 'eraser') {
        const last = lastPointRef.current || p;
        lastPointRef.current = p;
        withRaster(backing, raster =>
          stampLine(
            raster,
            last.x,
            last.y,
            p.x,
            p.y,
            brushSize,
            tool === 'pen' ? color : null
          )
        );
      } else if (SHAPE_TOOLS.has(tool) && shapeStartRef.current && preview) {
        const start = shapeStartRef.current;
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        withRaster(preview, raster =>
          drawShape(
            raster,
            start,
            p,
            brushSize,
            color[3] === 0 ? PREVIEW_STANDIN : color
          )
        );
      }
    },
    [tool, brushSize, color, toPixel, withRaster, drawShape, pickColorAt]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) {
        return;
      }
      drawingRef.current = false;
      lastPointRef.current = null;
      const backing = backingRef.current;
      const preview = previewRef.current;
      if (
        SHAPE_TOOLS.has(tool) &&
        shapeStartRef.current &&
        backing &&
        preview
      ) {
        const p = toPixel(e);
        const start = shapeStartRef.current;
        shapeStartRef.current = null;
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        if (p) {
          pushUndo();
          recordColorUse(color);
          withRaster(backing, raster =>
            drawShape(raster, start, p, brushSize, color)
          );
        } else {
          repaint();
        }
      }
    },
    [
      tool,
      brushSize,
      color,
      toPixel,
      withRaster,
      repaint,
      drawShape,
      pushUndo,
      recordColorUse,
    ]
  );

  const handleSave = useCallback(() => {
    const backing = backingRef.current;
    if (!backing) {
      return;
    }
    if (pixelMode) {
      // Store crisp: nearest-neighbor upscale of the logical pixels, so the
      // runtime renders sharply without engine smoothing changes.
      const ctx = backing.getContext('2d');
      if (ctx) {
        const logical = ctx.getImageData(0, 0, backing.width, backing.height);
        const crispScale = crispScaleFor(backing.width, backing.height);
        const crisp = upscaleNearest(logical, crispScale);
        const out = document.createElement('canvas');
        out.width = crisp.width;
        out.height = crisp.height;
        out
          .getContext('2d')
          ?.putImageData(
            new ImageData(
              new Uint8ClampedArray(crisp.data),
              crisp.width,
              crisp.height
            ),
            0,
            0
          );
        onSave(out.toDataURL('image/png'), {pixelGridSize: crispScale});
        return;
      }
    }
    onSave(backing.toDataURL('image/png'), {});
  }, [onSave, pixelMode]);

  // historyVersion re-renders this component whenever the stacks change; the
  // stacks themselves live in refs.
  const canUndo = historyVersion >= 0 && undoStackRef.current.length > 0;
  const canRedo = historyVersion >= 0 && redoStackRef.current.length > 0;

  if (!loaded && !loadError) {
    return null;
  }

  return (
    // display: contents host, so the editor's panel styles win over
    // CustomDialog's via parent-selector specificity (never load order).
    <div className={moduleStyles.dialogHost}>
      <CustomDialog
        aria-label={title}
        onClose={onCancel}
        mode="dark"
        className={moduleStyles.modal}
      >
        <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
          Draw on the image with the toolbar's tools, then save or cancel.
        </span>
        <div className={moduleStyles.header}>{title}</div>
        <div className={moduleStyles.body}>
          <div className={moduleStyles.toolbar}>
            {TOOLS.map(t => (
              <PixelTooltip
                key={t.id}
                tooltipId={`pixel-tool-${t.id}-tooltip`}
                text={toolTitle(t)}
              >
                <button
                  type="button"
                  aria-label={toolTitle(t)}
                  aria-pressed={tool === t.id}
                  className={classNames(
                    moduleStyles.toolButton,
                    tool === t.id && moduleStyles.toolActive
                  )}
                  onClick={() => setTool(t.id)}
                >
                  {t.icon}
                </button>
              </PixelTooltip>
            ))}
            <div className={moduleStyles.toolbarDivider} />
            {BRUSH_SIZES.map((size, index) => (
              <PixelTooltip
                key={size}
                tooltipId={`pixel-brush-${size}-tooltip`}
                text={`Brush size ${size} (${index + 1})`}
              >
                <button
                  type="button"
                  aria-label={`Brush size ${size} (${index + 1})`}
                  aria-pressed={brushSize === size}
                  className={classNames(
                    moduleStyles.toolButton,
                    brushSize === size && moduleStyles.toolActive
                  )}
                  onClick={() => setBrushSize(size)}
                >
                  <span
                    className={classNames(
                      moduleStyles.brushDot,
                      pixelMode && moduleStyles.brushDotSquare
                    )}
                    style={{width: brushDotPx(size), height: brushDotPx(size)}}
                  />
                </button>
              </PixelTooltip>
            ))}
            <div className={moduleStyles.toolbarDivider} />
            <ColorPicker
              color={color}
              onChange={setColor}
              recentColors={recentColors}
            />
          </div>
          <div className={moduleStyles.canvasColumn}>
            <div className={moduleStyles.canvasArea}>
              {loadError ? (
                <div className={moduleStyles.loadError}>
                  This image couldn't be loaded for editing.
                </div>
              ) : (
                <canvas
                  ref={displayRef}
                  className={moduleStyles.displayCanvas}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
              )}
            </div>
            <div className={moduleStyles.historyRow}>
              <PixelTooltip tooltipId="pixel-undo-tooltip" text="Undo (Ctrl+Z)">
                <button
                  type="button"
                  aria-label="Undo (Ctrl+Z)"
                  className={moduleStyles.toolButton}
                  disabled={!canUndo}
                  onClick={undo}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M6 3L2 7l4 4V8.5h4a3 3 0 0 1 0 6H7v2h3a5 5 0 0 0 0-10H6V3z" />
                  </svg>
                </button>
              </PixelTooltip>
              <PixelTooltip
                tooltipId="pixel-redo-tooltip"
                text="Redo (Ctrl+Shift+Z)"
              >
                <button
                  type="button"
                  aria-label="Redo (Ctrl+Shift+Z)"
                  className={moduleStyles.toolButton}
                  disabled={!canRedo}
                  onClick={redo}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M10 3l4 4-4 4V8.5H6a3 3 0 0 0 0 6h3v2H6a5 5 0 0 1 0-10h4V3z" />
                  </svg>
                </button>
              </PixelTooltip>
            </div>
          </div>
        </div>
        <div className={moduleStyles.footer}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={moduleStyles.savePrimary}
            onClick={handleSave}
            disabled={!loaded}
          >
            Save
          </button>
        </div>
      </CustomDialog>
    </div>
  );
};

export default PixelEditorModal;
