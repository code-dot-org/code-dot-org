import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
// and per-theme base/tint pairs (a white base reads best on a light panel, a
// panel-colored base on a dark one — the image dialog uses the same pairs).
const CHECKER_CELL_PX = 16;
const MIN_CHECKER_CELL_PX = 4;
const CHECKER_COLORS = {
  light: {base: '#ffffff', tint: 'rgb(128 128 128 / 16%)'},
  dark: {base: '#333a47', tint: 'rgb(128 128 128 / 22%)'},
};

// A bright azure, at the darkest shade that clears 3:1 against white while
// holding 3:1 on the dark checker and 6.9:1 on a black background fill.
const DEFAULT_COLOR: RGBA = [0, 155, 233, 255];

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

// Recently used colors, shown as one row in the color picker. The caller
// seeds them and persists the updated list handed back on save.
const RECENT_COLORS_MAX = 8;

const SHAPE_TOOLS: ReadonlySet<PixelTool> = new Set([
  'circle',
  'filledCircle',
  'rect',
  'filledRect',
]);

// Brush-size swatch dot: rendered edge in px for brush size N.
const brushDotPx = (size: number) => 3 + size * 1.6;

// Keyboard painting: Shift+arrow moves the cursor this many art pixels.
const KB_SHIFT_STEP = 10;

export interface PixelEditorSaveMeta {
  pixelGridSize?: number;
  // Recently used colors after this session, in first-seen order; the caller
  // persists them (e.g. in the image's project data) and seeds them back via
  // initialRecentColors next time.
  recentColors?: RGBA[];
}

interface PixelEditorModalProps {
  title: string;
  // The image to edit (dataURI or URL; must be canvas-readable).
  imageUrl: string;
  // Physical pixels per art pixel, when the image is known pixel art (e.g.
  // recorded at generation time). > 1 opens the editor at the image's
  // LOGICAL resolution. Absent/1 = edit at native resolution; the editor
  // does no detection of its own.
  knownPixelGrid?: number;
  // Seed for the recently-used-colors row (see PixelEditorSaveMeta).
  initialRecentColors?: RGBA[];
  // Ground color for an image that must stay fully opaque (e.g. a stage
  // background). Drawn under the artwork in place of the transparency
  // checker, and Save flattens onto it — the editor shows exactly what is
  // saved. Tools are unchanged: the eraser still clears to transparency,
  // which reads as painting the ground.
  opaqueGround?: string;
  // Fires when the editor first renders content (the image loaded or
  // failed). Until then the modal renders nothing; a caller swapping
  // another dialog for this one can wait for it to avoid a scrim gap.
  onReady?: () => void;
  onSave: (dataURI: string, meta: PixelEditorSaveMeta) => void;
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
  initialRecentColors,
  opaqueGround,
  onReady,
  onSave,
  onCancel,
}) => {
  const {theme} = useTheme();
  const themeMode = theme === 'Dark' ? 'dark' : 'light';
  // A ref so repaint (a stable callback) always draws the current theme's
  // checkerboard.
  const themeModeRef = useRef<'light' | 'dark'>(themeMode);
  themeModeRef.current = themeMode;
  const [tool, setTool] = useState<PixelTool>('pen');
  // The last non-eyedropper tool, so the eyedropper returns you to what you
  // were using rather than always the pen. Tracked during render: whenever
  // the active tool isn't the eyedropper, it's the one to come back to.
  const lastNonEyedropperToolRef = useRef<PixelTool>('pen');
  if (tool !== 'eyedropper') {
    lastNonEyedropperToolRef.current = tool;
  }
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [color, setColor] = useState<RGBA>(DEFAULT_COLOR);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // See the onReady prop; by ref so a changing identity can't re-fire it.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useEffect(() => {
    if (loaded || loadError) {
      onReadyRef.current?.();
    }
  }, [loaded, loadError]);
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
  // Last end point of the shape drag (may be off-canvas), so a release the
  // browser reports without coordinates still commits the previewed shape.
  const shapeEndRef = useRef<{x: number; y: number} | null>(null);

  // Keyboard painting: once the canvas has keyboard focus, a cursor
  // indicator appears; arrows move it, Space/Enter applies the active tool,
  // and shape tools take two presses (anchor, then place). Escape peels back
  // one layer per press — abort the shape, dismiss the cursor, and only then
  // (bubbling to the dialog) close the editor. Pointer use dismisses it.
  const [kbCursor, setKbCursor] = useState<{x: number; y: number} | null>(null);
  // Where the cursor was when last dismissed, so reactivating returns there.
  const lastKbCursorRef = useRef<{x: number; y: number} | null>(null);
  // Anchor of the in-progress keyboard shape (two-press model).
  const kbAnchorRef = useRef<{x: number; y: number} | null>(null);
  // Pen/eraser hold-to-draw: while Space/Enter is held, this holds the last
  // stamped point so arrow moves extend one continuous stroke (a single undo
  // entry). null when not mid-stroke. Cleared on key release.
  const kbStrokeRef = useRef<{x: number; y: number} | null>(null);
  // Rendered CSS px per art pixel, for positioning the cursor overlay.
  const [cssScale, setCssScale] = useState<{x: number; y: number} | null>(null);
  // Screen-reader narration (polite live region). Moves are debounced so
  // held arrow keys don't flood the queue; actions announce immediately.
  const [announcement, setAnnouncement] = useState('');
  const announceTimerRef = useRef<number>();
  const announce = useCallback((message: string) => {
    window.clearTimeout(announceTimerRef.current);
    setAnnouncement(message);
  }, []);
  const announceMove = useCallback((p: {x: number; y: number}) => {
    window.clearTimeout(announceTimerRef.current);
    announceTimerRef.current = window.setTimeout(
      () => setAnnouncement(`Cursor at column ${p.x + 1}, row ${p.y + 1}`),
      500
    );
  }, []);
  useEffect(() => () => window.clearTimeout(announceTimerRef.current), []);

  // Undo/redo: snapshots of the backing's pixels, one per completed
  // operation, in refs (they change on every stroke). historyVersion only
  // exists to re-render the buttons' disabled state.
  const undoStackRef = useRef<Uint8ClampedArray[]>([]);
  const redoStackRef = useRef<Uint8ClampedArray[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);

  // Recently used colors, in first-seen order (transparent excluded: it has
  // a permanent swatch of its own in the picker). Handed back on save for the
  // caller to persist.
  const [recentColors, setRecentColors] = useState<RGBA[]>(
    () => initialRecentColors ?? []
  );
  const recordColorUse = useCallback((used: RGBA) => {
    if (used[3] === 0) {
      return;
    }
    setRecentColors(prev => {
      // A color already in the row keeps its slot — reusing familiar colors
      // shouldn't shuffle the palette. New colors append; once full, the
      // oldest (front) drops.
      if (prev.some(c => c.every((v, i) => v === used[i]))) {
        return prev;
      }
      return [...prev, used].slice(-RECENT_COLORS_MAX);
    });
  }, []);

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
    if (opaqueGround) {
      // Opaque images sit on their ground color, not the checker.
      ctx.fillStyle = opaqueGround;
      ctx.fillRect(0, 0, display.width, display.height);
    } else {
      const checker = CHECKER_COLORS[themeModeRef.current];
      ctx.fillStyle = checker.base;
      ctx.fillRect(0, 0, display.width, display.height);
      const scale = scaleRef.current;
      const cell = pixelModeRef.current
        ? scale * Math.max(1, Math.ceil(MIN_CHECKER_CELL_PX / scale))
        : CHECKER_CELL_PX;
      ctx.fillStyle = checker.tint;
      for (let y = 0; y * cell < display.height; y++) {
        for (let x = y % 2; x * cell < display.width; x += 2) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
    ctx.drawImage(backing, 0, 0, display.width, display.height);
    if (previewRef.current) {
      ctx.drawImage(previewRef.current, 0, 0, display.width, display.height);
    }
  }, [opaqueGround]);

  // The checkerboard is baked into the canvas; redraw it if the page theme
  // flips while the editor is open.
  useEffect(() => {
    repaint();
  }, [repaint, themeMode]);

  // Abandon any in-progress stroke or shape drag. Losing the window
  // mid-press swallows the pointerup (and pointercancel isn't reliably
  // fired), so without this, returning to the editor keeps painting with
  // no button held.
  const cancelInteraction = useCallback(() => {
    if (!drawingRef.current) {
      return;
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    shapeStartRef.current = null;
    shapeEndRef.current = null;
    const preview = previewRef.current;
    preview?.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
    repaint();
  }, [repaint]);

  // Abort an in-progress keyboard shape; true when there was one.
  const abortKeyboardShape = useCallback(() => {
    if (!kbAnchorRef.current) {
      return false;
    }
    kbAnchorRef.current = null;
    const preview = previewRef.current;
    preview?.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
    repaint();
    return true;
  }, [repaint]);

  const dismissKeyboardCursor = useCallback(() => {
    abortKeyboardShape();
    kbStrokeRef.current = null;
    setKbCursor(null);
  }, [abortKeyboardShape]);

  useEffect(() => {
    window.addEventListener('blur', cancelInteraction);
    return () => window.removeEventListener('blur', cancelInteraction);
  }, [cancelInteraction]);

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
      // Shape solids share their outline's letter with Shift held, so the
      // shift state selects between the pair.
      const match = TOOLS.find(
        t =>
          t.shortcut === e.key.toLowerCase() && !!t.requiresShift === e.shiftKey
      );
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
      setCssScale({
        x: Math.round(cssW) / backing.width,
        y: Math.round(cssH) / backing.height,
      });
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

  // Like toPixel but clamps to the image bounds instead of returning null
  // off-canvas. Shape drags use this so a pointer past the edge still drives
  // the shape in real time (clipped to the edge) — otherwise you can't make a
  // shape whose far corner needs the pointer outside the paint area.
  // Like toPixel but never returns null: off-canvas maps to coordinates
  // outside [0,w)x[0,h) rather than being rejected. Shape drags use this so
  // the shape reflects the pointer's TRUE position past the edge (a circle
  // keeps growing, a rectangle's far corner keeps moving); the drawing
  // primitives clip writes to the raster, so only the visible part lands.
  const toPixelUnbounded = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const display = displayRef.current;
      const backing = backingRef.current;
      if (!display || !backing) {
        return null;
      }
      const rect = display.getBoundingClientRect();
      return {
        x: Math.floor(((e.clientX - rect.left) / rect.width) * backing.width),
        y: Math.floor(((e.clientY - rect.top) / rect.height) * backing.height),
      };
    },
    []
  );

  // Clamp a (possibly off-canvas) point into the image, for the keyboard
  // cursor's resume position — which must stay on the canvas.
  const clampToImage = useCallback((p: {x: number; y: number}) => {
    const backing = backingRef.current;
    if (!backing) {
      return p;
    }
    return {
      x: Math.min(backing.width - 1, Math.max(0, p.x)),
      y: Math.min(backing.height - 1, Math.max(0, p.y)),
    };
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
      // Pointer use takes over from the keyboard cursor — but remember the
      // pixel, so switching back to the keyboard resumes from where the
      // pointer last acted rather than the image center.
      dismissKeyboardCursor();
      lastKbCursorRef.current = p;
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
        shapeEndRef.current = p;
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
      dismissKeyboardCursor,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) {
        // A hover (not a drag) means the mouse is back in use: drop the
        // keyboard cursor so its crosshair and the OS pointer don't coexist.
        if (kbCursor) {
          dismissKeyboardCursor();
        }
        return;
      }
      if ((e.buttons & 1) === 0) {
        // The press ended somewhere we couldn't see it (window switch mid
        // stroke); a buttonless move must not paint.
        cancelInteraction();
        return;
      }
      const backing = backingRef.current;
      const preview = previewRef.current;
      if (!backing) {
        return;
      }
      // Shapes track the pointer's true position even past the edge, so a
      // drag whose far corner is outside the paint area keeps updating the
      // shape live (only the on-canvas part draws).
      if (SHAPE_TOOLS.has(tool) && shapeStartRef.current && preview) {
        const end = toPixelUnbounded(e);
        if (!end) {
          return;
        }
        const start = shapeStartRef.current;
        shapeEndRef.current = end;
        lastKbCursorRef.current = clampToImage(end);
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        withRaster(preview, raster =>
          drawShape(
            raster,
            start,
            end,
            brushSize,
            color[3] === 0 ? PREVIEW_STANDIN : color
          )
        );
        return;
      }
      // Freehand tools only act on a real in-bounds pixel.
      const p = toPixel(e);
      if (!p) {
        return;
      }
      lastKbCursorRef.current = p;
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
      }
    },
    [
      tool,
      brushSize,
      color,
      kbCursor,
      toPixel,
      toPixelUnbounded,
      clampToImage,
      withRaster,
      drawShape,
      pickColorAt,
      cancelInteraction,
      dismissKeyboardCursor,
    ]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) {
        return;
      }
      drawingRef.current = false;
      lastPointRef.current = null;
      if (tool === 'eyedropper') {
        // The pick is final on release (a drag samples continuously until
        // then); return to whatever tool was active before, so picking a
        // color mid-task drops you back where you were.
        setTool(lastNonEyedropperToolRef.current);
        return;
      }
      const backing = backingRef.current;
      const preview = previewRef.current;
      if (
        SHAPE_TOOLS.has(tool) &&
        shapeStartRef.current &&
        backing &&
        preview
      ) {
        // Commit at the true release position (off-canvas included) — matches
        // the live preview when the pointer ended past the edge.
        const p = toPixelUnbounded(e) ?? shapeEndRef.current;
        const start = shapeStartRef.current;
        shapeStartRef.current = null;
        shapeEndRef.current = null;
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        if (p) {
          lastKbCursorRef.current = clampToImage(p);
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
      toPixelUnbounded,
      clampToImage,
      withRaster,
      repaint,
      drawShape,
      pushUndo,
      recordColorUse,
    ]
  );

  // --- Keyboard painting handlers ---

  // Show the cursor where it was last dismissed, or at the image center.
  const activateKeyboardCursor = useCallback(() => {
    const backing = backingRef.current;
    if (!backing) {
      return null;
    }
    const p = lastKbCursorRef.current ?? {
      x: Math.floor(backing.width / 2),
      y: Math.floor(backing.height / 2),
    };
    lastKbCursorRef.current = p;
    setKbCursor(p);
    return p;
  }, []);

  const redrawKeyboardShapePreview = useCallback(
    (p: {x: number; y: number}) => {
      const anchor = kbAnchorRef.current;
      const preview = previewRef.current;
      if (!anchor || !preview) {
        return;
      }
      preview.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
      withRaster(preview, raster =>
        drawShape(
          raster,
          anchor,
          p,
          brushSize,
          color[3] === 0 ? PREVIEW_STANDIN : color
        )
      );
    },
    [withRaster, drawShape, brushSize, color]
  );

  const applyToolAtKeyboardCursor = useCallback(
    (p: {x: number; y: number}) => {
      const backing = backingRef.current;
      if (!backing) {
        return;
      }
      const at = `at column ${p.x + 1}, row ${p.y + 1}`;
      if (SHAPE_TOOLS.has(tool)) {
        if (!kbAnchorRef.current) {
          kbAnchorRef.current = p;
          redrawKeyboardShapePreview(p);
          announce(
            `Shape started ${at}. Move and press Space to place it, or Escape to cancel.`
          );
        } else {
          const start = kbAnchorRef.current;
          kbAnchorRef.current = null;
          const preview = previewRef.current;
          preview
            ?.getContext('2d')
            ?.clearRect(0, 0, preview.width, preview.height);
          pushUndo();
          recordColorUse(color);
          withRaster(backing, raster =>
            drawShape(raster, start, p, brushSize, color)
          );
          announce(`Shape placed ${at}`);
        }
      } else if (tool === 'eyedropper') {
        pickColorAt(p);
        // Mirror the pointer flow: return to the tool used before the pick.
        setTool(lastNonEyedropperToolRef.current);
        announce(`Color picked ${at}`);
      } else if (tool === 'bucket') {
        pushUndo();
        recordColorUse(color);
        withRaster(backing, raster =>
          floodFill(raster, p.x, p.y, color, FILL_TOLERANCE)
        );
        announce(`Filled ${at}`);
      }
      // Pen and eraser aren't here: they use the hold-to-draw stroke path
      // (startKeyboardStroke / extendKeyboardStroke) instead of a tap.
    },
    [
      tool,
      brushSize,
      color,
      withRaster,
      drawShape,
      pushUndo,
      recordColorUse,
      pickColorAt,
      redrawKeyboardShapePreview,
      announce,
    ]
  );

  // Pen/eraser hold-to-draw. The first press stamps a dot and opens a stroke
  // (one undo entry); arrow moves while held extend it as a continuous line;
  // release ends it. This mirrors a pointer drag.
  const startKeyboardStroke = useCallback(
    (p: {x: number; y: number}) => {
      const backing = backingRef.current;
      if (!backing) {
        return;
      }
      pushUndo();
      if (tool === 'pen') {
        recordColorUse(color);
      }
      kbStrokeRef.current = p;
      withRaster(backing, raster =>
        stamp(raster, p.x, p.y, brushSize, tool === 'pen' ? color : null)
      );
      announce(
        `${tool === 'pen' ? 'Painting' : 'Erasing'} at column ${p.x + 1}, row ${
          p.y + 1
        }. Hold and move to draw.`
      );
    },
    [tool, color, brushSize, withRaster, pushUndo, recordColorUse, announce]
  );

  // Extend an open stroke to a new point; true when a stroke was open.
  const extendKeyboardStroke = useCallback(
    (to: {x: number; y: number}) => {
      const from = kbStrokeRef.current;
      const backing = backingRef.current;
      if (!from || !backing) {
        return false;
      }
      withRaster(backing, raster =>
        stampLine(
          raster,
          from.x,
          from.y,
          to.x,
          to.y,
          brushSize,
          tool === 'pen' ? color : null
        )
      );
      kbStrokeRef.current = to;
      return true;
    },
    [tool, color, brushSize, withRaster]
  );

  const handleCanvasKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      const backing = backingRef.current;
      if (!backing) {
        return;
      }
      const ARROWS: {[key: string]: [number, number]} = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = ARROWS[e.key];
      if (delta) {
        e.preventDefault();
        const from = kbCursor ?? activateKeyboardCursor();
        if (!from) {
          return;
        }
        const step = e.shiftKey ? KB_SHIFT_STEP : 1;
        const next = {
          x: Math.min(backing.width - 1, Math.max(0, from.x + delta[0] * step)),
          y: Math.min(
            backing.height - 1,
            Math.max(0, from.y + delta[1] * step)
          ),
        };
        lastKbCursorRef.current = next;
        setKbCursor(next);
        // While a pen/eraser stroke is open (Space held), the move draws a
        // line segment; otherwise it may update a shape's preview.
        if (!extendKeyboardStroke(next)) {
          redrawKeyboardShapePreview(next);
        }
        announceMove(next);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // Ignore auto-repeat: the first press starts the action; repeats
        // while held must not re-fire it (a flood of one-per-stamp undo
        // entries, or a shape's anchor/commit toggling into nonsense).
        // Held-arrow movement still repeats, which is what draws the line.
        if (e.repeat) {
          return;
        }
        if (!kbCursor) {
          // First press only reveals the cursor; painting starts on the
          // next one, so entering the canvas can't leave a stray mark.
          const p = activateKeyboardCursor();
          if (p) {
            announce(`Cursor at column ${p.x + 1}, row ${p.y + 1}`);
          }
          return;
        }
        if (tool === 'pen' || tool === 'eraser') {
          startKeyboardStroke(kbCursor);
        } else {
          applyToolAtKeyboardCursor(kbCursor);
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (e.repeat || !kbCursor || kbAnchorRef.current) {
          return;
        }
        pushUndo();
        withRaster(backing, raster =>
          stamp(raster, kbCursor.x, kbCursor.y, brushSize, null)
        );
        announce(`Erased at column ${kbCursor.x + 1}, row ${kbCursor.y + 1}`);
        return;
      }
      if (e.key === 'Escape') {
        if (abortKeyboardShape()) {
          e.preventDefault();
          e.stopPropagation();
          announce('Shape canceled');
          return;
        }
        if (kbCursor) {
          e.preventDefault();
          e.stopPropagation();
          setKbCursor(null);
          announce('Cursor hidden');
        }
        // Without a cursor, Escape bubbles on to the dialog and closes it.
      }
    },
    [
      kbCursor,
      tool,
      brushSize,
      activateKeyboardCursor,
      applyToolAtKeyboardCursor,
      startKeyboardStroke,
      extendKeyboardStroke,
      redrawKeyboardShapePreview,
      abortKeyboardShape,
      withRaster,
      pushUndo,
      announce,
      announceMove,
    ]
  );

  // Releasing Space/Enter ends a pen/eraser stroke (the next press starts a
  // fresh one, as its own undo entry).
  const handleCanvasKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        kbStrokeRef.current = null;
      }
    },
    []
  );

  // Keyboard-driven focus (tabbing in) shows the cursor; a click also
  // focuses, but pointer users shouldn't see it — :focus-visible is the
  // browser's own modality heuristic for exactly this split.
  const handleCanvasFocus = useCallback(
    (e: React.FocusEvent<HTMLCanvasElement>) => {
      if (e.target.matches(':focus-visible')) {
        const p = activateKeyboardCursor();
        if (p) {
          announce(`Cursor at column ${p.x + 1}, row ${p.y + 1}`);
        }
      }
    },
    [activateKeyboardCursor, announce]
  );

  // A tool switch mid-shape would commit as the NEW shape; abort instead.
  useEffect(() => {
    abortKeyboardShape();
  }, [tool, abortKeyboardShape]);

  // Losing the window mid-interaction dismisses the cursor, like the
  // pointer path's cancelInteraction.
  useEffect(() => {
    window.addEventListener('blur', dismissKeyboardCursor);
    return () => window.removeEventListener('blur', dismissKeyboardCursor);
  }, [dismissKeyboardCursor]);

  const handleSave = useCallback(() => {
    const backing = backingRef.current;
    if (!backing) {
      return;
    }
    // What the display showed: the artwork over its opaque ground, if any.
    const finish = (source: HTMLCanvasElement, meta: PixelEditorSaveMeta) => {
      if (opaqueGround) {
        const out = document.createElement('canvas');
        out.width = source.width;
        out.height = source.height;
        const ctx = out.getContext('2d');
        if (ctx) {
          ctx.fillStyle = opaqueGround;
          ctx.fillRect(0, 0, out.width, out.height);
          ctx.drawImage(source, 0, 0);
          onSave(out.toDataURL('image/png'), meta);
          return;
        }
      }
      onSave(source.toDataURL('image/png'), meta);
    };
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
        finish(out, {pixelGridSize: crispScale, recentColors});
        return;
      }
    }
    finish(backing, {recentColors});
  }, [onSave, pixelMode, recentColors, opaqueGround]);

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
    <div className={moduleStyles.dialogHost} data-theme={themeMode}>
      <CustomDialog
        aria-label={title}
        onClose={onCancel}
        mode={themeMode}
        className={moduleStyles.modal}
      >
        <span id="dsco-dialog-description" className={moduleStyles.srOnly}>
          Draw on the image with the toolbar's tools, then save or cancel.
        </span>
        {/* Tabbable so the dialog's focus trap lands here on open (the
            WAI-ARIA dialog pattern's title-as-initial-focus): its
            first-focusable would otherwise be the pen button, whose
            focus-triggered tooltip then appears unprompted — positioned
            against the still-animating (scaled) modal — and lingers. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={moduleStyles.header} tabIndex={0}>
          {title}
        </div>
        <div className={moduleStyles.body}>
          <div className={moduleStyles.toolbar}>
            <div className={moduleStyles.toolGrid}>
              {TOOLS.map((t, index) => (
                <PixelTooltip
                  key={t.id}
                  tooltipId={`pixel-tool-${t.id}-tooltip`}
                  text={toolTitle(t)}
                  fromLeftColumn={index % 2 === 0}
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
                  fromLeftColumn={index % 2 === 0}
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
                      style={{
                        width: brushDotPx(size),
                        height: brushDotPx(size),
                      }}
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
            <div className={moduleStyles.historyRow}>
              <PixelTooltip
                tooltipId="pixel-undo-tooltip"
                text="Undo (Ctrl+Z)"
                fromLeftColumn
              >
                <button
                  type="button"
                  aria-label="Undo (Ctrl+Z)"
                  className={moduleStyles.toolButton}
                  disabled={!canUndo}
                  onClick={undo}
                >
                  <FontAwesomeV6Icon iconName="rotate-left" />
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
                  <FontAwesomeV6Icon iconName="rotate-right" />
                </button>
              </PixelTooltip>
            </div>
          </div>
          <div className={moduleStyles.canvasArea}>
            {loadError ? (
              <div className={moduleStyles.loadError}>
                This image couldn't be loaded for editing.
              </div>
            ) : (
              <div className={moduleStyles.canvasWrap}>
                {/* role="application" so screen readers hand the arrow keys
                    through to the canvas instead of their virtual cursor —
                    the APG pattern for key-driven drawing surfaces. The rule
                    can't know canvas semantics. */}
                {/* eslint-disable jsx-a11y/no-interactive-element-to-noninteractive-role */}
                <canvas
                  ref={displayRef}
                  className={moduleStyles.displayCanvas}
                  // Hide the OS pointer while the keyboard cursor is shown, so
                  // its crosshair doesn't sit next to the drawn one; moving
                  // the mouse dismisses the keyboard cursor and brings it back.
                  style={kbCursor ? {cursor: 'none'} : undefined}
                  tabIndex={0}
                  role="application"
                  aria-label="Drawing canvas"
                  aria-describedby="pixel-canvas-keyboard-help"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onKeyDown={handleCanvasKeyDown}
                  onKeyUp={handleCanvasKeyUp}
                  onFocus={handleCanvasFocus}
                  onBlur={dismissKeyboardCursor}
                />
                {/* eslint-enable jsx-a11y/no-interactive-element-to-noninteractive-role */}
                {kbCursor &&
                  cssScale &&
                  (pixelMode ? (
                    // The exact brush footprint (stamp anchors the size x
                    // size square at x - floor((size - 1) / 2)).
                    <div
                      className={moduleStyles.kbCursorRect}
                      style={{
                        left:
                          (kbCursor.x - Math.floor((brushSize - 1) / 2)) *
                          cssScale.x,
                        top:
                          (kbCursor.y - Math.floor((brushSize - 1) / 2)) *
                          cssScale.y,
                        width: brushSize * cssScale.x,
                        height: brushSize * cssScale.y,
                      }}
                    />
                  ) : (
                    // Crosshair with an open center. Arm thickness matches the
                    // brush's rendered footprint (what a stamp would paint);
                    // the gap leaves that footprint open in the middle.
                    <div
                      className={moduleStyles.kbCursorCross}
                      style={
                        {
                          left: (kbCursor.x + 0.5) * cssScale.x,
                          top: (kbCursor.y + 0.5) * cssScale.y,
                          '--stroke': `${Math.max(
                            1,
                            brushSize * cssScale.x
                          )}px`,
                          '--gap': `${Math.max(
                            4,
                            (brushSize * cssScale.x) / 2 + 2
                          )}px`,
                        } as React.CSSProperties
                      }
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
              </div>
            )}
            <span
              id="pixel-canvas-keyboard-help"
              className={moduleStyles.srOnly}
            >
              Use the arrow keys to move the paint cursor; hold Shift to move
              ten pixels at a time. Press Space or Enter to use the selected
              tool at the cursor. With the pen or eraser, hold Space and move to
              draw a continuous line. With the circle and rectangle tools, press
              once to start the shape and again to place it. Delete erases.
              Escape hides the cursor.
            </span>
            <div aria-live="polite" className={moduleStyles.srOnly}>
              {announcement}
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
