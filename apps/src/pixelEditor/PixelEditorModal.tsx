import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import ColorPicker from './ColorPicker';
import {
  crispScaleFor,
  detectPixelGrid,
  downsampleToGrid,
  upscaleNearest,
} from './pixelArt';
import {
  BRUSH_SIZES,
  drawCircle,
  floodFill,
  Raster,
  RGBA,
  stamp,
  stampLine,
} from './tools';

import moduleStyles from './pixel-editor.module.scss';

export type PixelTool = 'pen' | 'eraser' | 'bucket' | 'circle' | 'filledCircle';

// Each tool has a single-key shortcut; the hover tooltip reads
// "<label> (<KEY>)".
const TOOLS: {
  id: PixelTool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'pen',
    label: 'Pen',
    shortcut: 'p',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 14l1-4 8-8 3 3-8 8-4 1z" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'e',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6 13L2 9l7-7 5 5-6 6H6zm-1 1h9v1H5v-1z" />
      </svg>
    ),
  },
  {
    id: 'bucket',
    label: 'Fill',
    shortcut: 'f',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1l6 6-6 6-5-5 5-5V1zm5.5 9.5S15 12.4 15 13.5a1.5 1.5 0 0 1-3 0c0-1.1 1.5-3 1.5-3z" />
      </svg>
    ),
  },
  {
    id: 'circle',
    label: 'Circle outline',
    shortcut: 'c',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 'filledCircle',
    label: 'Solid circle',
    shortcut: 's',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" />
      </svg>
    ),
  },
];

function toolTitle(tool: (typeof TOOLS)[number]): string {
  return `${tool.label} (${tool.shortcut.toUpperCase()})`;
}

const MAX_DISPLAY_SIZE = 480;

interface PixelEditorModalProps {
  title: string;
  // The image to edit (dataURI or URL; must be canvas-readable).
  imageUrl: string;
  onSave: (dataURI: string) => void;
  onCancel: () => void;
}

/**
 * A small, self-contained pixel editor in a modal. Edits happen on a backing
 * canvas at the image's native resolution; the display canvas scales it up
 * with nearest-neighbor sampling. Tools: pen, eraser, bucket fill, outline
 * and solid circles, four brush sizes, one color (full-spectrum picker).
 * Save hands back a PNG dataURI; Cancel discards. Both close the modal.
 */
const PixelEditorModal: React.FunctionComponent<PixelEditorModalProps> = ({
  title,
  imageUrl,
  onSave,
  onCancel,
}) => {
  const [tool, setTool] = useState<PixelTool>('pen');
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [color, setColor] = useState<RGBA>([31, 41, 71, 255]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // True when the image depicts pixel art (a block grid was detected): the
  // editor then works at the LOGICAL resolution — one edited pixel is one art
  // pixel — and save re-upscales nearest-neighbor for crisp storage.
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
  const circleCenterRef = useRef<{x: number; y: number} | null>(null);

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
      ? scale * Math.max(1, Math.ceil(4 / scale))
      : 16;
    ctx.fillStyle = 'rgb(128 128 128 / 16%)';
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

  // Load the image into the backing canvas and size the display. Images that
  // depict pixel art (a detectable block grid — AI pixel-art output, or our
  // own normalized assets) are edited at their LOGICAL resolution.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let backing = document.createElement('canvas');
      backing.width = img.naturalWidth;
      backing.height = img.naturalHeight;
      backing.getContext('2d')?.drawImage(img, 0, 0);
      const ctx = backing.getContext('2d');
      const raster = ctx?.getImageData(0, 0, backing.width, backing.height);
      const grid = raster ? detectPixelGrid(raster) : null;
      if (raster && grid && (grid.sizeX > 1 || grid.sizeY > 1)) {
        const logical = downsampleToGrid(raster, grid);
        backing = document.createElement('canvas');
        backing.width = logical.width;
        backing.height = logical.height;
        backing
          .getContext('2d')
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
      previewRef.current = preview;
      scaleRef.current = Math.max(
        1,
        Math.floor(MAX_DISPLAY_SIZE / Math.max(backing.width, backing.height))
      );
      setLoaded(true);
    };
    img.onerror = () => setLoadError(true);
    img.src = imageUrl;
  }, [imageUrl]);

  // Single-key tool shortcuts (shown in each tool's tooltip). Modifier
  // combos pass through so browser shortcuts keep working.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // The panel (and its canvas) only mounts once the image is ready, so the
  // modal appears in final form instead of resizing as the image decodes.
  // Layout effect: the canvas must be sized and painted BEFORE the browser
  // paints the newly-mounted panel, or its first frame flashes default-sized.
  useLayoutEffect(() => {
    if (!loaded) {
      return;
    }
    const display = displayRef.current;
    const backing = backingRef.current;
    if (display && backing) {
      display.width = backing.width * scaleRef.current;
      display.height = backing.height * scaleRef.current;
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const p = toPixel(e);
      const backing = backingRef.current;
      if (!p || !backing) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      if (tool === 'pen' || tool === 'eraser') {
        lastPointRef.current = p;
        withRaster(backing, raster =>
          stamp(raster, p.x, p.y, brushSize, tool === 'pen' ? color : null)
        );
      } else if (tool === 'bucket') {
        withRaster(backing, raster => floodFill(raster, p.x, p.y, color));
      } else {
        circleCenterRef.current = p;
      }
    },
    [tool, brushSize, color, toPixel, withRaster]
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
      if (tool === 'pen' || tool === 'eraser') {
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
      } else if (
        (tool === 'circle' || tool === 'filledCircle') &&
        circleCenterRef.current &&
        preview
      ) {
        const c = circleCenterRef.current;
        const radius = Math.hypot(p.x - c.x, p.y - c.y);
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        withRaster(preview, raster =>
          drawCircle(
            raster,
            c.x,
            c.y,
            radius,
            brushSize,
            color,
            tool === 'filledCircle'
          )
        );
      }
    },
    [tool, brushSize, color, toPixel, withRaster]
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
        (tool === 'circle' || tool === 'filledCircle') &&
        circleCenterRef.current &&
        backing &&
        preview
      ) {
        const p = toPixel(e);
        const c = circleCenterRef.current;
        circleCenterRef.current = null;
        preview
          .getContext('2d')
          ?.clearRect(0, 0, preview.width, preview.height);
        if (p) {
          const radius = Math.hypot(p.x - c.x, p.y - c.y);
          withRaster(backing, raster =>
            drawCircle(
              raster,
              c.x,
              c.y,
              radius,
              brushSize,
              color,
              tool === 'filledCircle'
            )
          );
        } else {
          repaint();
        }
      }
    },
    [tool, brushSize, color, toPixel, withRaster, repaint]
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
        const crisp = upscaleNearest(
          logical,
          crispScaleFor(backing.width, backing.height)
        );
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
        onSave(out.toDataURL('image/png'));
        return;
      }
    }
    onSave(backing.toDataURL('image/png'));
  }, [onSave, pixelMode]);

  // The backdrop appears immediately (the click responds); the panel mounts
  // only once the image is decoded and measured, arriving in final form.
  if (!loaded && !loadError) {
    return <div className={moduleStyles.overlay} />;
  }

  return (
    <div className={moduleStyles.overlay}>
      <div className={moduleStyles.modal}>
        <div className={moduleStyles.header}>{title}</div>
        <div className={moduleStyles.body}>
          <div className={moduleStyles.toolbar}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                type="button"
                title={toolTitle(t)}
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
            ))}
            <div className={moduleStyles.toolbarDivider} />
            {BRUSH_SIZES.map(size => (
              <button
                key={size}
                type="button"
                title={`Brush size ${size}`}
                aria-label={`Brush size ${size}`}
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
                    // Cute: square brush swatches when editing pixel art.
                    pixelMode && moduleStyles.brushDotSquare
                  )}
                  style={{width: 3 + size * 1.6, height: 3 + size * 1.6}}
                />
              </button>
            ))}
            <div className={moduleStyles.toolbarDivider} />
            <ColorPicker color={color} onChange={setColor} />
          </div>
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
      </div>
    </div>
  );
};

export default PixelEditorModal;
