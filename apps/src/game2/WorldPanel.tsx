import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {GRID_COLS, GRID_ROWS, SOLID_CELL} from './gridConstants';
import {renderGrid} from './gridRenderer';
import {assetUrl, getCachedImage} from './imageCache';
import {Game2ItemEntry} from './types';
import WorldGeneratePane from './WorldGeneratePane';

import moduleStyles from './game2View.module.scss';

interface WorldPanelProps {
  visible: boolean;
  grid: string[][];
  items: Game2ItemEntry[];
  channelId?: string;
  onGridChange: (grid: string[][]) => void;
}

/**
 * Deterministic palette of distinct colours for items.
 * The first slot is reserved for the solid block.
 */
const ITEM_COLORS = [
  '#F7F8FA', // solid — white
  '#7B61FF', // purple
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFD93D', // yellow
  '#FF8A5C', // orange
  '#6BCB77', // green
  '#4D96FF', // blue
  '#C471ED', // violet
  '#FF7EB3', // pink
];

function getItemColor(index: number): string {
  return ITEM_COLORS[index % ITEM_COLORS.length];
}

const WorldPanel: React.FunctionComponent<WorldPanelProps> = ({
  visible,
  grid,
  items,
  channelId,
  onGridChange,
}) => {
  const [selectedBrush, setSelectedBrush] = useState<string>(SOLID_CELL);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const painting = useRef(false);
  const paintValue = useRef(true);

  // Keep mutable refs so the animation-frame draw can access latest state
  // without re-creating callbacks.
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const selectedBrushRef = useRef(selectedBrush);
  selectedBrushRef.current = selectedBrush;

  /** Loaded image elements keyed by name. */
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Resolve block image name (first item with type 'block').
  const blockImageName = useMemo(() => {
    const block = items.find(i => i.itemType === 'block');
    return block?.name ?? null;
  }, [items]);

  // Filter and sort items by type for grouped palette display.
  const blockItems = useMemo(
    () =>
      items
        .filter(i => (i.itemType ?? 'sprite') === 'block')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const spriteItems = useMemo(
    () =>
      items
        .filter(i => (i.itemType ?? 'sprite') === 'sprite')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  /** Map from item name → asset URL for palette thumbnails. */
  const itemUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!channelId) {
      return map;
    }
    for (const img of items) {
      map.set(img.name, assetUrl(channelId, img.filename));
    }
    return map;
  }, [items, channelId]);

  // Load / update image elements when items or channelId change.
  useEffect(() => {
    const current = loadedImagesRef.current;
    for (const img of items) {
      if (current.has(img.name)) {
        continue;
      }
      if (!channelId) {
        continue;
      }
      const url = assetUrl(channelId, img.filename);
      const el = getCachedImage(url);
      if (!el.complete) {
        el.onload = () => draw();
      }
      current.set(img.name, el);
    }
  }, [items, channelId, draw]);

  // Compute cell size to fit the grid in the canvas.
  const getCellPx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      return 10;
    }
    const maxW = canvas.width / GRID_COLS;
    const maxH = canvas.height / GRID_ROWS;
    return Math.max(1, Math.floor(Math.min(maxW, maxH)));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const cp = getCellPx();
    const gridW = GRID_COLS * cp;
    const gridH = GRID_ROWS * cp;
    // Centre the grid in the canvas.
    const padX = (canvas.width - gridW) / 2;
    const padY = (canvas.height - gridH) / 2;

    // Clear background.
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(padX, padY);

    renderGrid({
      ctx,
      grid: gridRef.current,
      cellPx: cp,
      offsetX: 0,
      offsetY: 0,
      canvasWidth: gridW,
      canvasHeight: gridH,
      loadedImages: loadedImagesRef.current,
      blockImageName,
      showGridLines: true,
      highlightValue: selectedBrushRef.current,
      emptyCellColor: '#292F36',
    });

    ctx.restore();
  }, [getCellPx, blockImageName]);

  // Size canvas to container and redraw.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
  }, [draw]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Resize + redraw when panel becomes visible (container goes from 0 to real size).
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(resize);
    }
  }, [visible, resize]);

  // Redraw whenever grid, items, or selected brush changes.
  useEffect(() => {
    draw();
  }, [grid, items, selectedBrush, draw]);

  // Convert canvas pixel coords to grid cell coords.
  const pixelToCell = useCallback(
    (clientX: number, clientY: number): {row: number; col: number} | null => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return null;
      }
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return null;
      }
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (clientX - rect.left) * scaleX;
      const cy = (clientY - rect.top) * scaleY;

      const cp = getCellPx();
      const gridW = GRID_COLS * cp;
      const gridH = GRID_ROWS * cp;
      const padX = (canvas.width - gridW) / 2;
      const padY = (canvas.height - gridH) / 2;

      const col = Math.floor((cx - padX) / cp);
      const row = Math.floor((cy - padY) / cp);
      if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
        return null;
      }
      return {row, col};
    },
    [getCellPx]
  );

  const applyPaint = useCallback(
    (row: number, col: number) => {
      const next = grid.map(r => [...r]);
      next[row][col] = paintValue.current ? selectedBrush : '';
      onGridChange(next);
    },
    [grid, onGridChange, selectedBrush]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const cell = pixelToCell(e.clientX, e.clientY);
      if (!cell) {
        return;
      }
      painting.current = true;
      paintValue.current = grid[cell.row][cell.col] !== selectedBrush;
      applyPaint(cell.row, cell.col);
    },
    [grid, selectedBrush, pixelToCell, applyPaint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!painting.current) {
        return;
      }
      const cell = pixelToCell(e.clientX, e.clientY);
      if (!cell) {
        return;
      }
      applyPaint(cell.row, cell.col);
    },
    [pixelToCell, applyPaint]
  );

  const handlePointerUp = useCallback(() => {
    painting.current = false;
  }, []);

  const handleWorldGenerated = useCallback(
    (newGrid: string[][]) => {
      onGridChange(newGrid);
    },
    [onGridChange]
  );

  return (
    <div className={moduleStyles.worldContainer}>
      {/* Item palette */}
      <div className={moduleStyles.worldPalette}>
        {/* Blocks group */}
        <div className={moduleStyles.worldPaletteLabel}>Blocks</div>
        <button
          type="button"
          className={`${moduleStyles.worldPaletteItem} ${
            selectedBrush === SOLID_CELL
              ? moduleStyles.worldPaletteItemSelected
              : ''
          }`}
          onClick={() => setSelectedBrush(SOLID_CELL)}
        >
          <span
            className={moduleStyles.worldPaletteSwatch}
            style={{backgroundColor: ITEM_COLORS[0]}}
          />
          <span className={moduleStyles.worldPaletteItemName}>Solid</span>
        </button>
        {blockItems.map((img, i) => {
          const url = itemUrlMap.get(img.name);
          return (
            <button
              type="button"
              key={img.name}
              className={`${moduleStyles.worldPaletteItem} ${
                selectedBrush === img.name
                  ? moduleStyles.worldPaletteItemSelected
                  : ''
              }`}
              onClick={() => setSelectedBrush(img.name)}
            >
              {url ? (
                <img
                  className={moduleStyles.worldPaletteSwatch}
                  src={url}
                  alt={img.name}
                />
              ) : (
                <span
                  className={moduleStyles.worldPaletteSwatch}
                  style={{backgroundColor: getItemColor(i + 1)}}
                />
              )}
              <span className={moduleStyles.worldPaletteItemName}>
                {img.name}
              </span>
            </button>
          );
        })}

        {/* Sprites group */}
        <div className={moduleStyles.worldPaletteLabel}>Sprites</div>
        {spriteItems.map((img, i) => {
          const url = itemUrlMap.get(img.name);
          return (
            <button
              type="button"
              key={img.name}
              className={`${moduleStyles.worldPaletteItem} ${
                selectedBrush === img.name
                  ? moduleStyles.worldPaletteItemSelected
                  : ''
              }`}
              onClick={() => setSelectedBrush(img.name)}
            >
              {url ? (
                <img
                  className={moduleStyles.worldPaletteSwatch}
                  src={url}
                  alt={img.name}
                />
              ) : (
                <span
                  className={moduleStyles.worldPaletteSwatch}
                  style={{
                    backgroundColor: getItemColor(blockItems.length + i + 1),
                  }}
                />
              )}
              <span className={moduleStyles.worldPaletteItemName}>
                {img.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Canvas-based grid editor */}
      <div ref={containerRef} className={moduleStyles.worldGrid}>
        <canvas
          ref={canvasRef}
          className={moduleStyles.worldCanvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <WorldGeneratePane
        items={items}
        onWorldGenerated={handleWorldGenerated}
      />
    </div>
  );
};

export default WorldPanel;
export {createEmptyGrid} from './gridConstants';
