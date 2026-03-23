/**
 * Shared grid rendering used by both the World editor and the Play runtime.
 *
 * Draws grid cells (solid blocks and placed items) onto a canvas, with
 * configurable camera offset, grid lines, and highlight.
 */
import {GRID_COLS, GRID_ROWS, SOLID_CELL} from './gridConstants';

/** Fallback solid-cell colour (bottom portion only). */
const SOLID_TOP = 0.8;
const SOLID_FALLBACK_COLOR = '#F7F8FA';
const ITEM_FALLBACK_COLOR = '#7B61FF';

export interface GridRenderOptions {
  ctx: CanvasRenderingContext2D;
  grid: string[][];
  /** Pixels per grid cell. */
  cellPx: number;
  /** Camera offset in pixels (scroll). */
  offsetX: number;
  offsetY: number;
  /** Canvas width/height for culling. */
  canvasWidth: number;
  canvasHeight: number;

  // Image lookup ---------------------------------------------------------
  /** Map of image name → loaded HTMLImageElement. */
  loadedImages: Map<string, HTMLImageElement>;
  /**
   * For SOLID_CELL cells, the name of the block-type image to use.
   * If null/undefined, falls back to a white rectangle.
   */
  blockImageName?: string | null;

  /**
   * Map of item name → type. Sprites are drawn at 2× cell size in play mode.
   * If not provided, all placed items render at 1× (editor mode).
   */
  itemTypeMap?: Map<string, string>;
  /** Scale factor for sprite items (relative to cell size). Defaults to 1. */
  spriteScale?: number;

  // Editor features (optional) -------------------------------------------
  /** Whether to draw grid lines. */
  showGridLines?: boolean;
  /** Cell value to highlight (e.g. the selected brush). */
  highlightValue?: string;
  /** Background colour for empty cells (editor only). */
  emptyCellColor?: string;
}

export function renderGrid(opts: GridRenderOptions) {
  const {
    ctx,
    grid,
    cellPx: cp,
    offsetX: ox,
    offsetY: oy,
    canvasWidth: cw,
    canvasHeight: ch,
    loadedImages,
    blockImageName,
    itemTypeMap,
    spriteScale = 1,
    showGridLines = false,
    highlightValue,
    emptyCellColor,
  } = opts;

  // Visible cell range.
  const colStart = Math.max(0, Math.floor(ox / cp));
  const colEnd = Math.min(GRID_COLS - 1, Math.floor((ox + cw) / cp));
  const rowStart = Math.max(0, Math.floor(oy / cp));
  const rowEnd = Math.min(GRID_ROWS - 1, Math.floor((oy + ch) / cp));

  // Draw cells.
  for (let r = rowStart; r <= rowEnd; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      const px = c * cp - ox;
      const py = r * cp - oy;
      const cell = grid[r]?.[c];

      if (!cell) {
        if (emptyCellColor) {
          ctx.fillStyle = emptyCellColor;
          ctx.fillRect(px, py, cp, cp);
        }
        continue;
      }

      if (cell === SOLID_CELL) {
        const blockImg = blockImageName && loadedImages.get(blockImageName);
        if (blockImg && blockImg.complete && blockImg.naturalWidth > 0) {
          ctx.drawImage(blockImg, px, py, cp, cp);
        } else {
          ctx.fillStyle = SOLID_FALLBACK_COLOR;
          ctx.fillRect(px, py + cp * SOLID_TOP, cp, cp * (1 - SOLID_TOP));
        }
      } else {
        const imgEl = loadedImages.get(cell);
        const isSprite =
          itemTypeMap && (itemTypeMap.get(cell) ?? 'sprite') === 'sprite';
        const scale = isSprite ? spriteScale : 1;
        const size = cp * scale;
        const offset = (size - cp) / 2;
        if (imgEl?.complete && imgEl.naturalWidth > 0) {
          ctx.drawImage(imgEl, px - offset, py - offset, size, size);
        } else {
          ctx.fillStyle = ITEM_FALLBACK_COLOR;
          ctx.fillRect(px, py, cp, cp);
        }
      }
    }
  }

  // Grid lines.
  if (showGridLines) {
    ctx.strokeStyle = 'rgba(114,122,131,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = rowStart; r <= rowEnd + 1; r++) {
      const sy = r * cp - oy;
      ctx.beginPath();
      ctx.moveTo(colStart * cp - ox, sy);
      ctx.lineTo((colEnd + 1) * cp - ox, sy);
      ctx.stroke();
    }
    for (let c = colStart; c <= colEnd + 1; c++) {
      const sx = c * cp - ox;
      ctx.beginPath();
      ctx.moveTo(sx, rowStart * cp - oy);
      ctx.lineTo(sx, (rowEnd + 1) * cp - oy);
      ctx.stroke();
    }
  }

  // Highlight cells matching the selected brush.
  if (highlightValue) {
    ctx.strokeStyle = 'rgba(100,150,255,0.8)';
    ctx.lineWidth = 2;
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (grid[r]?.[c] === highlightValue) {
          const px = c * cp - ox;
          const py = r * cp - oy;
          ctx.strokeRect(px + 1, py + 1, cp - 2, cp - 2);
        }
      }
    }
  }
}
