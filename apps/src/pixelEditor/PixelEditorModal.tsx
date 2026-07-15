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
  floodFill,
  Raster,
  RGBA,
  stamp,
  stampLine,
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
  onSave: (dataURI: string, meta: {pixelGridSize?: number}) => void;
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
  knownPixelGrid,
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
  // 1-4 pick brush sizes. Modifier combos pass through so browser shortcuts
  // keep working.
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
      </CustomDialog>
    </div>
  );
};

export default PixelEditorModal;
