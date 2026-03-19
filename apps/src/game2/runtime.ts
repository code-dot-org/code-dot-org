import {Game2ImageEntry} from './types';
import {SOLID_CELL} from './WorldPanel';

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

// Particle system constants.
const PARTICLE_COUNT = 12;
const PARTICLE_LIFETIME = 30; // frames
const PARTICLE_SPEED = 0.25; // cells per frame

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

interface Particle {
  x: number; // cell units
  y: number;
  vx: number;
  vy: number;
  life: number; // frames remaining
  maxLife: number;
  color: string;
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
  private sourceGrid: string[][];
  private grid: string[][];
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

  // Scoring state.
  private scoringEnabled = false;
  private score = 0;

  // Collision callbacks: itemName → list of callbacks.
  private collisionHandlers: Map<string, (() => void)[]> = new Map();

  // Active particles for removal puff effect.
  private particles: Particle[] = [];

  // Camera in cell units.
  private camX = 0;
  private camY = 0;

  private static readonly PARALLAX_FACTOR = 0.3;

  constructor(
    canvas: HTMLCanvasElement,
    grid: string[][],
    images: Game2ImageEntry[],
    channelId: string | undefined
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.sourceGrid = grid;
    this.grid = grid.map(row => [...row]);
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
    this.scoringEnabled = false;
    this.score = 0;
    this.collisionHandlers.clear();
    this.particles = [];

    // Deep-copy from the original grid so runtime removals don't persist.
    this.grid = this.sourceGrid.map(row => [...row]);

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

    const startScoring = () => {
      this.scoringEnabled = true;
      this.score = 0;
    };

    const increaseScore = (amount: number) => {
      this.score += amount;
    };

    const decreaseScore = (amount: number) => {
      this.score -= amount;
    };

    const whenCollide = (name: string, callback: () => void) => {
      if (!this.collisionHandlers.has(name)) {
        this.collisionHandlers.set(name, []);
      }
      this.collisionHandlers.get(name)!.push(callback);
    };

    const removeItem = (name: string) => {
      this.removeItemByName(name);
    };

    try {
      const fn = new Function(
        'createItem',
        'setItemBehavior',
        'setBackground',
        'startScoring',
        'increaseScore',
        'decreaseScore',
        'whenCollide',
        'removeItem',
        code
      );
      fn(
        createItem,
        setItemBehavior,
        setBackground,
        startScoring,
        increaseScore,
        decreaseScore,
        whenCollide,
        removeItem
      );
    } catch (e) {
      console.error('[Game2 Runtime] Error executing code:', e);
    }

    // Instantiate items placed on the world grid.
    this.instantiateGridItems();

    this.updateCamera();
    this.running = true;
    this.tick();
  }

  /**
   * For items created by code that also appear on the grid, update their
   * starting position to the first grid placement. Items that only exist
   * on the grid (not created by code) are rendered as part of the grid
   * cells and are NOT instantiated as movable GameItems.
   */
  private instantiateGridItems() {
    const codeItemNames = new Set(this.items.map(i => i.name));
    const gridPlacements = new Map<string, {row: number; col: number}>();

    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < (this.grid[r]?.length ?? 0); c++) {
        const cell = this.grid[r][c];
        if (cell && cell !== SOLID_CELL && !gridPlacements.has(cell)) {
          gridPlacements.set(cell, {row: r, col: c});
        }
      }
    }

    for (const [name, pos] of gridPlacements) {
      if (codeItemNames.has(name)) {
        // Code created this item — use the grid placement as starting position.
        for (const item of this.items) {
          if (item.name === name) {
            item.x = pos.col;
            item.y = pos.row;
            break;
          }
        }
      }
      // If code didn't create this item, it stays as grid decoration only.
    }
  }

  /**
   * Remove all items (GameItems + grid cells) of the given name,
   * spawning puff particles at each removed location.
   */
  private removeItemByName(name: string) {
    // Remove code-created items with puff.
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].name === name) {
        this.spawnPuff(
          this.items[i].x + ITEM_CELLS / 2,
          this.items[i].y + ITEM_CELLS / 2
        );
        this.items.splice(i, 1);
      }
    }

    // Remove grid-placed cells.
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < (this.grid[r]?.length ?? 0); c++) {
        if (this.grid[r][c] === name) {
          this.spawnPuff(c + 0.5, r + 0.5);
          this.grid[r][c] = '';
        }
      }
    }
  }

  private spawnPuff(cx: number, cy: number) {
    const colors = ['#FFFFFF', '#FFD700', '#FF8C00', '#FF4500'];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.3;
      const speed = PARTICLE_SPEED * (0.5 + Math.random() * 0.5);
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: PARTICLE_LIFETIME,
        maxLife: PARTICLE_LIFETIME,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
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

    let camCx = target.x + ITEM_CELLS / 2 - vpW / 2;
    let camCy = target.y + ITEM_CELLS / 2 - vpH / 2;

    camCx = Math.max(0, Math.min(GRID_SIZE - vpW, camCx));
    camCy = Math.max(0, Math.min(GRID_SIZE - vpH, camCy));

    this.camX = camCx;
    this.camY = camCy;
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

  /** Check whether a cell-unit rect overlaps any solid grid cell. */
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
        if (this.grid[r]?.[c] === SOLID_CELL) {
          return true;
        }
      }
    }
    return false;
  }

  private itemCollidesWithGrid(item: GameItem, x: number, y: number): boolean {
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

  /** Check whether two axis-aligned rects overlap. */
  private rectsOverlap(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  /**
   * Check collisions between the controlled item and all grid-placed
   * item cells + code-created items of a given name.
   */
  private checkItemCollisions(controlled: GameItem) {
    const cr = this.getCollisionRect(controlled, controlled.x, controlled.y);

    // Check against grid-placed item cells.
    const colStart = Math.max(0, Math.floor(cr.x) - 1);
    const colEnd = Math.min(GRID_SIZE - 1, Math.ceil(cr.x + cr.w) + 1);
    const rowStart = Math.max(0, Math.floor(cr.y) - 1);
    const rowEnd = Math.min(GRID_SIZE - 1, Math.ceil(cr.y + cr.h) + 1);

    const collidedNames = new Set<string>();

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        const cell = this.grid[r]?.[c];
        if (cell && cell !== SOLID_CELL) {
          // Cell occupies a 1×1 area at (c, r).
          if (this.rectsOverlap(cr.x, cr.y, cr.w, cr.h, c, r, 1, 1)) {
            collidedNames.add(cell);
          }
        }
      }
    }

    // Check against code-created items (but not the controlled item itself).
    for (const other of this.items) {
      if (other === controlled) {
        continue;
      }
      const or = this.getCollisionRect(other, other.x, other.y);
      if (this.rectsOverlap(cr.x, cr.y, cr.w, cr.h, or.x, or.y, or.w, or.h)) {
        collidedNames.add(other.name);
      }
    }

    // Fire collision handlers.
    for (const name of collidedNames) {
      const handlers = this.collisionHandlers.get(name);
      if (handlers) {
        for (const handler of handlers) {
          handler();
        }
      }
    }
  }

  private update() {
    // Find the controlled item for collision checking.
    const controlled = this.items.find(
      i => i.behavior === 'move' || i.behavior === 'platform'
    );

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

    // Check collision events for the controlled item.
    if (controlled) {
      this.checkItemCollisions(controlled);
    }

    // Update particles.
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
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
    const colEnd = Math.min(GRID_SIZE - 1, Math.floor(this.camX + cw / cp));
    const rowStart = Math.max(0, Math.floor(this.camY));
    const rowEnd = Math.min(GRID_SIZE - 1, Math.floor(this.camY + ch / cp));

    // Draw filled grid cells (solid blocks and placed items).
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        const cell = this.grid[r]?.[c];
        if (!cell) {
          continue;
        }
        if (cell === SOLID_CELL) {
          ctx.fillStyle = '#F7F8FA';
          ctx.fillRect(c * cp - ox, r * cp - oy, cp, cp);
        } else {
          // Placed item cell — draw 30% bigger than the cell, centered.
          const imgEl = this.loadedImages.get(cell);
          const scale = 1.3;
          const size = cp * scale;
          const offset = (size - cp) / 2;
          if (imgEl?.complete && imgEl.naturalWidth > 0) {
            ctx.drawImage(
              imgEl,
              c * cp - ox - offset,
              r * cp - oy - offset,
              size,
              size
            );
          } else {
            // Fallback colored square.
            ctx.fillStyle = '#7B61FF';
            ctx.fillRect(c * cp - ox, r * cp - oy, cp, cp);
          }
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

    // Draw items (code-created and grid-instantiated sprites).
    const itemPx = ITEM_CELLS * cp;
    for (const item of this.items) {
      const dx = item.x * cp - ox;
      const dy = item.y * cp - oy;

      if (dx + itemPx < 0 || dy + itemPx < 0 || dx > cw || dy > ch) {
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
        ctx.fillText(item.name.slice(0, 12), dx + itemPx / 2, dy + itemPx / 2);
      }
    }

    // Draw particles.
    for (const p of this.particles) {
      const px = p.x * cp - ox;
      const py = p.y * cp - oy;
      const alpha = p.life / p.maxLife;
      const radius = cp * 0.3 * alpha;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw score HUD.
    if (this.scoringEnabled) {
      const fontSize = Math.max(16, cp * 1.2);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      const text = `Score: ${this.score}`;
      const padding = 10;
      const x = cw - padding;
      const y = padding;

      // Drop shadow.
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(text, x + 2, y + 2);

      // Main text.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, x, y);
    }
  }
}
