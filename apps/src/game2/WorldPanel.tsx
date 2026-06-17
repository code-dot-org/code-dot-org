import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {createEmptyGrid, GRID_COLS, GRID_ROWS} from './gridConstants';
import {renderGrid} from './gridRenderer';
import {assetUrl, getCachedImage} from './imageCache';
import {Game2ItemEntry, Game2World} from './types';
import WorldGeneratePane from './WorldGeneratePane';

import moduleStyles from './game2View.module.scss';

interface WorldPanelProps {
  visible: boolean;
  worlds: Game2World[];
  activeWorldId: string;
  items: Game2ItemEntry[];
  channelId?: string;
  onWorldsChange: (worlds: Game2World[], activeWorldId?: string) => void;
  onActiveWorldChange: (id: string) => void;
}

/**
 * Deterministic palette of distinct colours for items (used as fallback
 * when no image is available).
 */
const ITEM_COLORS = [
  '#7B61FF', // purple
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFD93D', // yellow
  '#FF8A5C', // orange
  '#6BCB77', // green
  '#4D96FF', // blue
  '#C471ED', // violet
  '#FF7EB3', // pink
  '#F7F8FA', // white
];

function getItemColor(index: number): string {
  return ITEM_COLORS[index % ITEM_COLORS.length];
}

/** Generate a unique id like world2, world3, … for a new world. */
function nextWorldId(existing: Game2World[]): string {
  const ids = new Set(existing.map(w => w.id));
  for (let i = 1; i < 10000; i++) {
    const candidate = `world${i}`;
    if (!ids.has(candidate)) {
      return candidate;
    }
  }
  return `world${Date.now()}`;
}

const WorldPanel: React.FunctionComponent<WorldPanelProps> = ({
  visible,
  worlds,
  activeWorldId,
  items,
  channelId,
  onWorldsChange,
  onActiveWorldChange,
}) => {
  const activeWorld = useMemo(
    () => worlds.find(w => w.id === activeWorldId) ?? worlds[0],
    [worlds, activeWorldId]
  );
  const grid = activeWorld?.grid ?? createEmptyGrid();

  const [selectedBrush, setSelectedBrush] = useState<string>('');
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

  // Auto-select the first block item as the default brush if none selected.
  useEffect(() => {
    if (!selectedBrush) {
      const firstBlock = items.find(i => (i.itemType ?? 'sprite') === 'block');
      if (firstBlock) {
        setSelectedBrush(firstBlock.name);
      } else if (items.length > 0) {
        setSelectedBrush(items[0].name);
      }
    }
  }, [items, selectedBrush]);

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
      current.set(img.name, el);
    }
  }, [items, channelId]);

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
      showGridLines: true,
      highlightValue: selectedBrushRef.current,
      emptyCellColor: '#292F36',
    });

    ctx.restore();
  }, [getCellPx]);

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

  // Update the active world's grid only — leave other worlds untouched.
  const updateActiveWorldGrid = useCallback(
    (nextGrid: string[][]) => {
      const nextWorlds = worlds.map(w =>
        w.id === activeWorldId ? {...w, grid: nextGrid} : w
      );
      onWorldsChange(nextWorlds);
    },
    [worlds, activeWorldId, onWorldsChange]
  );

  const applyPaint = useCallback(
    (row: number, col: number) => {
      const next = grid.map(r => [...r]);
      next[row][col] = paintValue.current ? selectedBrush : '';
      updateActiveWorldGrid(next);
    },
    [grid, selectedBrush, updateActiveWorldGrid]
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
      updateActiveWorldGrid(newGrid);
    },
    [updateActiveWorldGrid]
  );

  // --- World list management -------------------------------------------------

  const handleAddWorld = useCallback(() => {
    const defaultId = nextWorldId(worlds);

    const input = window.prompt('New world ID:', defaultId);
    if (input === null) {
      return;
    }
    const id = input.trim();
    if (!id) {
      return;
    }
    if (worlds.some(w => w.id === id)) {
      window.alert(`World "${id}" already exists.`);
      return;
    }
    const nextWorlds = [...worlds, {id, grid: createEmptyGrid()}];
    onWorldsChange(nextWorlds, id);
  }, [worlds, onWorldsChange]);

  const handleDeleteWorld = useCallback(
    (id: string) => {
      if (worlds.length <= 1) {
        window.alert('You must keep at least one world.');
        return;
      }

      if (!window.confirm(`Delete world "${id}"?`)) {
        return;
      }
      const nextWorlds = worlds.filter(w => w.id !== id);
      // If the deleted world was active, let Game2View pick a new active id.
      onWorldsChange(nextWorlds);
    },
    [worlds, onWorldsChange]
  );

  // --- Render ---------------------------------------------------------------

  return (
    <div className={moduleStyles.worldContainer}>
      {/* Left sidebar: worlds list above the item palette */}
      <div className={moduleStyles.worldPalette}>
        <div className={moduleStyles.worldPaletteSection}>
          <div className={moduleStyles.worldPaletteLabel}>Worlds</div>
          {worlds.map(w => (
            <div
              key={w.id}
              className={`${moduleStyles.worldListItem} ${
                w.id === activeWorldId ? moduleStyles.worldListItemSelected : ''
              }`}
            >
              <button
                type="button"
                className={moduleStyles.worldListSelect}
                onClick={() => onActiveWorldChange(w.id)}
                title={`Edit world ${w.id}`}
              >
                {w.id}
              </button>
              <button
                type="button"
                className={moduleStyles.worldListDelete}
                onClick={() => handleDeleteWorld(w.id)}
                title={`Delete world ${w.id}`}
                disabled={worlds.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className={moduleStyles.worldListAdd}
            onClick={handleAddWorld}
          >
            + Add world
          </button>
        </div>

        <div className={moduleStyles.worldPaletteDivider} />

        <div className={moduleStyles.worldPaletteSection}>
          {/* Blocks group */}
          <div className={moduleStyles.worldPaletteLabel}>Blocks</div>
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
