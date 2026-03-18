import {Game2ImageEntry} from './types';

const GRID_SIZE = 50;

// How many grid cells are visible across the shorter canvas dimension.
const VIEWPORT_CELLS = 16;

// Physics constants in grid-cell units per frame.
const MOVE_SPEED = 0.15;
const GRAVITY = 0.015;
const JUMP_VELOCITY = -0.5;
const MAX_FALL_SPEED = 0.5;
const PLATFORM_MOVE_SPEED = 0.12;

// Sprite size in grid cells.
const ITEM_CELLS = 6;

/** Visible-pixel bounding box, as fractions of the image (0–1). */
interface VisibleBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** All positions/velocities are in grid-cell units. */
interface GameItem {
  /** User-facing name (matches Game2ImageEntry.name). */
  name: string;
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  behavior: 'none' | 'move' | 'platform';
}

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
    return {left: 0, top: 0, right: 1, bottom: 1};
  }

  return {
    left: minX / w,
    top: minY / h,
    right: (maxX + 1) / w,
    bottom: (maxY + 1) / h,
  };
}

export class Game2Runtime {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: boolean[][];
  private images: Game2ImageEntry[];
  /** Keyed by user-facing name. */
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  /** Keyed by user-facing name. */
  private visibleBounds: Map<string, VisibleBounds> = new Map();
  private nameToFilename: Map<string, string> = new Map();
  private channelId: string | undefined;
  private items: GameItem[] = [];
  private backgroundName: string | null = null;
  private animFrame: number | null = null;
  private running = false;
  private keysDown: Set<string> = new Set();

  // Camera in cell units.
  private camX = 0;
  private camY = 0;

  private static readonly PARALLAX_FACTOR = 0.3;

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

    for (const img of images) {
      this.nameToFilename.set(img.name, img.filename);
      const el = new Image();
      el.crossOrigin = 'anonymous';
      if (channelId) {
        el.src = `/v3/assets/${channelId}/${encodeURIComponent(img.filename)}`;
      }
      el.onload = () => {
        this.visibleBounds.set(img.name, computeVisibleBounds(el));
      };
      this.loadedImages.set(img.name, el);
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  /** Pixels per cell at the current canvas size. */
  private get cellPx(): number {
    return Math.min(this.canvas.width, this.canvas.height) / VIEWPORT_CELLS;
  }

  run(code: string) {
    this.items = [];
    this.backgroundName = null;

    const cx = GRID_SIZE / 2 - ITEM_CELLS / 2;
    const cy = GRID_SIZE / 2 - ITEM_CELLS / 2;

    const setBackground = (name: string) => {
      this.backgroundName = name;
    };

    const createItem = (name: string) => {
      this.items.push({
        name,
        x: cx,
        y: cy,
        vy: 0,
        grounded: false,
        behavior: 'none',
      });
    };

    const setItemBehavior = (name: string, behavior: string) => {
      for (const item of this.items) {
        if (item.name === name) {
          item.behavior = behavior as GameItem['behavior'];
        }
      }
    };

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        'createItem',
        'setItemBehavior',
        'setBackground',
        code
      );
      fn(createItem, setItemBehavior, setBackground);
    } catch (e) {
      console.error('[Game2 Runtime] Error executing code:', e);
    }

    this.updateCamera();
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
    this.updateCamera();
    this.render();
    this.animFrame = requestAnimationFrame(this.tick);
  };

  private updateCamera() {
    const target = this.items.find(
      i => i.behavior === 'move' || i.behavior === 'platform'
    );
    if (!target) {
      return;
    }

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const cp = this.cellPx;

    // Viewport size in cells.
    const vpW = cw / cp;
    const vpH = ch / cp;

    let cx = target.x + ITEM_CELLS / 2 - vpW / 2;
    let cy = target.y + ITEM_CELLS / 2 - vpH / 2;

    cx = Math.max(0, Math.min(GRID_SIZE - vpW, cx));
    cy = Math.max(0, Math.min(GRID_SIZE - vpH, cy));

    this.camX = cx;
    this.camY = cy;
  }

  /** Collision rect in cell units for an item at position (x, y). */
  private getCollisionRect(item: GameItem, x: number, y: number) {
    const bounds = this.visibleBounds.get(item.name);
    if (!bounds) {
      return {x, y, w: ITEM_CELLS, h: ITEM_CELLS};
    }
    return {
      x: x + bounds.left * ITEM_CELLS,
      y: y + bounds.top * ITEM_CELLS,
      w: (bounds.right - bounds.left) * ITEM_CELLS,
      h: (bounds.bottom - bounds.top) * ITEM_CELLS,
    };
  }

  /** Check whether a cell-unit rect overlaps any set grid cell. */
  private collidesWithGrid(
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    const colStart = Math.max(0, Math.floor(rx));
    const colEnd = Math.min(GRID_SIZE - 1, Math.floor(rx + rw - 0.001));
    const rowStart = Math.max(0, Math.floor(ry));
    const rowEnd = Math.min(GRID_SIZE - 1, Math.floor(ry + rh - 0.001));

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (this.grid[r]?.[c]) {
          return true;
        }
      }
    }
    return false;
  }

  private itemCollidesWithGrid(
    item: GameItem,
    x: number,
    y: number
  ): boolean {
    const rect = this.getCollisionRect(item, x, y);
    return this.collidesWithGrid(rect.x, rect.y, rect.w, rect.h);
  }

  private itemOutOfBounds(item: GameItem, x: number, y: number): boolean {
    const rect = this.getCollisionRect(item, x, y);
    return (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.w > GRID_SIZE ||
      rect.y + rect.h > GRID_SIZE
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

    if (this.keysDown.has(' ') && item.grounded) {
      item.vy = JUMP_VELOCITY;
      item.grounded = false;
    }

    item.vy = Math.min(item.vy + GRAVITY, MAX_FALL_SPEED);

    // Step vertically in small increments for accurate collision.
    const stepSize = 0.05; // cells per sub-step
    let remaining = Math.abs(item.vy);
    const dir = Math.sign(item.vy);
    item.grounded = false;

    while (remaining > 0) {
      const move = Math.min(remaining, stepSize);
      const ny = item.y + dir * move;
      if (
        this.itemOutOfBounds(item, item.x, ny) ||
        this.itemCollidesWithGrid(item, item.x, ny)
      ) {
        if (dir > 0) {
          item.grounded = true;
        }
        item.vy = 0;
        break;
      }
      item.y = ny;
      remaining -= move;
    }

    if (
      !item.grounded &&
      item.vy >= 0 &&
      (this.itemOutOfBounds(item, item.x, item.y + 0.01) ||
        this.itemCollidesWithGrid(item, item.x, item.y + 0.01))
    ) {
      item.grounded = true;
    }
  }

  private render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const cp = this.cellPx;

    // Camera offset in pixels.
    const ox = this.camX * cp;
    const oy = this.camY * cp;

    // Background color.
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, cw, ch);

    // Parallax background image.
    if (this.backgroundName) {
      const bgImg = this.loadedImages.get(this.backgroundName);
      if (bgImg?.complete && bgImg.naturalWidth > 0) {
        const pf = Game2Runtime.PARALLAX_FACTOR;
        const worldPx = GRID_SIZE * cp;
        const bgSize = Math.max(cw, ch) + worldPx * pf;
        const bgX = -ox * pf;
        const bgY = -oy * pf;
        ctx.drawImage(bgImg, bgX, bgY, bgSize, bgSize);
      }
    }

    // Visible grid cell range.
    const colStart = Math.max(0, Math.floor(this.camX));
    const colEnd = Math.min(
      GRID_SIZE - 1,
      Math.floor(this.camX + cw / cp)
    );
    const rowStart = Math.max(0, Math.floor(this.camY));
    const rowEnd = Math.min(
      GRID_SIZE - 1,
      Math.floor(this.camY + ch / cp)
    );

    // Draw filled grid cells.
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (this.grid[r]?.[c]) {
          ctx.fillStyle = '#F7F8FA';
          ctx.fillRect(c * cp - ox, r * cp - oy, cp, cp);
        }
      }
    }

    // Subtle grid lines.
    ctx.strokeStyle = 'rgba(114,122,131,0.15)';
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

    // Draw items.
    const itemPx = ITEM_CELLS * cp;
    for (const item of this.items) {
      const dx = item.x * cp - ox;
      const dy = item.y * cp - oy;

      if (
        dx + itemPx < 0 ||
        dy + itemPx < 0 ||
        dx > cw ||
        dy > ch
      ) {
        continue;
      }

      const imgEl = this.loadedImages.get(item.name);
      if (imgEl?.complete && imgEl.naturalWidth > 0) {
        ctx.drawImage(imgEl, dx, dy, itemPx, itemPx);
      } else {
        ctx.fillStyle = '#7B61FF';
        ctx.fillRect(dx, dy, itemPx, itemPx);
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          item.name.slice(0, 12),
          dx + itemPx / 2,
          dy + itemPx / 2
        );
      }
    }
  }
}
