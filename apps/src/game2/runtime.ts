import {Game2ImageEntry} from './types';

const GRID_SIZE = 50;
const MOVE_SPEED = 3;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;
const MAX_FALL_SPEED = 12;
const PLATFORM_MOVE_SPEED = 3;

/** Visible-pixel bounding box, as fractions of the image (0–1). */
interface VisibleBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface GameItem {
  imageFilename: string;
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  behavior: 'none' | 'move' | 'platform';
}

/**
 * Scan an image and return the tight bounding box of visible (alpha > 0)
 * pixels, expressed as fractions of image width/height.
 */
function computeVisibleBounds(img: HTMLImageElement): VisibleBounds {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w === 0 || h === 0) {
    return {left: 0, top: 0, right: 1, bottom: 1};
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const {data} = ctx.getImageData(0, 0, w, h);

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) {
          minX = x;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }
  }

  if (maxX < minX) {
    // Fully transparent image — use full bounds.
    return {left: 0, top: 0, right: 1, bottom: 1};
  }

  return {
    left: minX / w,
    top: minY / h,
    right: (maxX + 1) / w,
    bottom: (maxY + 1) / h,
  };
}

/**
 * Lightweight runtime that renders the world grid + sprite items onto a canvas
 * and executes Blockly-generated JavaScript.
 */
export class Game2Runtime {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: boolean[][];
  private images: Game2ImageEntry[];
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private visibleBounds: Map<string, VisibleBounds> = new Map();
  private channelId: string | undefined;
  private items: GameItem[] = [];
  private animFrame: number | null = null;
  private running = false;
  private keysDown: Set<string> = new Set();

  constructor(
    canvas: HTMLCanvasElement,
    grid: boolean[][],
    images: Game2ImageEntry[],
    channelId: string | undefined
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.grid = grid;
    this.images = images;
    this.channelId = channelId;

    // Pre-load image assets and compute visible bounds once loaded.
    for (const img of images) {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      if (channelId) {
        el.src = `/v3/assets/${channelId}/${encodeURIComponent(img.filename)}`;
      }
      el.onload = () => {
        this.visibleBounds.set(img.filename, computeVisibleBounds(el));
      };
      this.loadedImages.set(img.filename, el);
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /** Execute generated Blockly JS and start the game loop. */
  run(code: string) {
    this.items = [];

    const itemSize = this.getItemSize();
    const cx = this.canvas.width / 2 - itemSize / 2;
    const cy = this.canvas.height / 2 - itemSize / 2;

    const createItem = (imageFilename: string) => {
      this.items.push({
        imageFilename,
        x: cx,
        y: cy,
        vy: 0,
        grounded: false,
        behavior: 'none',
      });
    };

    const setItemBehavior = (imageFilename: string, behavior: string) => {
      for (const item of this.items) {
        if (item.imageFilename === imageFilename) {
          item.behavior = behavior as GameItem['behavior'];
        }
      }
    };

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('createItem', 'setItemBehavior', code);
      fn(createItem, setItemBehavior);
    } catch (e) {
      console.error('[Game2 Runtime] Error executing code:', e);
    }

    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
    ) {
      e.preventDefault();
      this.keysDown.add(e.key);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.key);
  };

  private tick = () => {
    if (!this.running) {
      return;
    }
    this.update();
    this.render();
    this.animFrame = requestAnimationFrame(this.tick);
  };

  /**
   * Get the collision rectangle for an item in canvas coordinates.
   * Uses visible-pixel bounds when available, otherwise falls back to the
   * full sprite square.
   */
  private getCollisionRect(item: GameItem, x: number, y: number) {
    const size = this.getItemSize();
    const bounds = this.visibleBounds.get(item.imageFilename);
    if (!bounds) {
      return {x, y, w: size, h: size};
    }
    return {
      x: x + bounds.left * size,
      y: y + bounds.top * size,
      w: (bounds.right - bounds.left) * size,
      h: (bounds.bottom - bounds.top) * size,
    };
  }

  /** Check whether a collision rect overlaps any set grid cell. */
  private collidesWithGrid(
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    const cellW = this.canvas.width / GRID_SIZE;
    const cellH = this.canvas.height / GRID_SIZE;

    const colStart = Math.max(0, Math.floor(rx / cellW));
    const colEnd = Math.min(
      GRID_SIZE - 1,
      Math.floor((rx + rw - 1) / cellW)
    );
    const rowStart = Math.max(0, Math.floor(ry / cellH));
    const rowEnd = Math.min(
      GRID_SIZE - 1,
      Math.floor((ry + rh - 1) / cellH)
    );

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (this.grid[r]?.[c]) {
          return true;
        }
      }
    }
    return false;
  }

  /** Convenience: check collision for an item at a given sprite position. */
  private itemCollidesWithGrid(
    item: GameItem,
    x: number,
    y: number
  ): boolean {
    const rect = this.getCollisionRect(item, x, y);
    return this.collidesWithGrid(rect.x, rect.y, rect.w, rect.h);
  }

  /** Check if the item's collision rect is out of canvas bounds. */
  private itemOutOfBounds(item: GameItem, x: number, y: number): boolean {
    const rect = this.getCollisionRect(item, x, y);
    return (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.w > this.canvas.width ||
      rect.y + rect.h > this.canvas.height
    );
  }

  private update() {
    for (const item of this.items) {
      if (item.behavior === 'none') {
        continue;
      }
      if (item.behavior === 'move') {
        this.updateMove(item);
      } else if (item.behavior === 'platform') {
        this.updatePlatform(item);
      }
    }
  }

  private updateMove(item: GameItem) {
    // Try each axis independently so sliding along walls works.
    let nx = item.x;
    let ny = item.y;

    if (this.keysDown.has('ArrowLeft')) {
      nx -= MOVE_SPEED;
    }
    if (this.keysDown.has('ArrowRight')) {
      nx += MOVE_SPEED;
    }
    if (
      !this.itemOutOfBounds(item, nx, item.y) &&
      !this.itemCollidesWithGrid(item, nx, item.y)
    ) {
      item.x = nx;
    }

    if (this.keysDown.has('ArrowUp')) {
      ny -= MOVE_SPEED;
    }
    if (this.keysDown.has('ArrowDown')) {
      ny += MOVE_SPEED;
    }
    if (
      !this.itemOutOfBounds(item, item.x, ny) &&
      !this.itemCollidesWithGrid(item, item.x, ny)
    ) {
      item.y = ny;
    }
  }

  private updatePlatform(item: GameItem) {
    // Horizontal movement (left/right arrows).
    let nx = item.x;
    if (this.keysDown.has('ArrowLeft')) {
      nx -= PLATFORM_MOVE_SPEED;
    }
    if (this.keysDown.has('ArrowRight')) {
      nx += PLATFORM_MOVE_SPEED;
    }
    if (
      !this.itemOutOfBounds(item, nx, item.y) &&
      !this.itemCollidesWithGrid(item, nx, item.y)
    ) {
      item.x = nx;
    }

    // Jump (spacebar) — only when grounded.
    if (this.keysDown.has(' ') && item.grounded) {
      item.vy = JUMP_VELOCITY;
      item.grounded = false;
    }

    // Apply gravity.
    item.vy = Math.min(item.vy + GRAVITY, MAX_FALL_SPEED);

    // Move vertically in small steps for accurate collision.
    let remainingVy = item.vy;
    const step = Math.sign(remainingVy);
    item.grounded = false;

    while (Math.abs(remainingVy) >= 1) {
      const ny = item.y + step;
      if (
        this.itemOutOfBounds(item, item.x, ny) ||
        this.itemCollidesWithGrid(item, item.x, ny)
      ) {
        if (step > 0) {
          item.grounded = true;
        }
        item.vy = 0;
        break;
      }
      item.y = ny;
      remainingVy -= step;
    }

    // Also check if still grounded (standing on a surface).
    if (
      !item.grounded &&
      item.vy >= 0 &&
      (this.itemOutOfBounds(item, item.x, item.y + 1) ||
        this.itemCollidesWithGrid(item, item.x, item.y + 1))
    ) {
      item.grounded = true;
    }
  }

  private getItemSize() {
    // Size items relative to the grid cell size (6 cells wide/tall).
    return (Math.min(this.canvas.width, this.canvas.height) / GRID_SIZE) * 6;
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid.
    const cellW = w / GRID_SIZE;
    const cellH = h / GRID_SIZE;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r]?.[c]) {
          ctx.fillStyle = '#F7F8FA';
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }

    // Subtle grid lines.
    ctx.strokeStyle = 'rgba(114,122,131,0.15)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= GRID_SIZE; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(w, r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= GRID_SIZE; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, h);
      ctx.stroke();
    }

    // Draw items.
    const itemSize = this.getItemSize();
    for (const item of this.items) {
      const imgEl = this.loadedImages.get(item.imageFilename);
      if (imgEl?.complete && imgEl.naturalWidth > 0) {
        ctx.drawImage(imgEl, item.x, item.y, itemSize, itemSize);
      } else {
        // Placeholder.
        ctx.fillStyle = '#7B61FF';
        ctx.fillRect(item.x, item.y, itemSize, itemSize);
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          item.imageFilename.slice(0, 12),
          item.x + itemSize / 2,
          item.y + itemSize / 2
        );
      }
    }
  }
}
