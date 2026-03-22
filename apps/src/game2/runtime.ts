import {SOLID_CELL} from './gridConstants';
import {Game2ImageEntry} from './types';

const GRID_SIZE = 50;

// How many grid cells are visible across the shorter canvas dimension.
const VIEWPORT_CELLS = 7.5;

// Physics constants in grid-cell units per frame.
const MOVE_SPEED = 0.075;
const GRAVITY = 0.0075;
const JUMP_VELOCITY = -0.25;
const MAX_FALL_SPEED = 0.25;
const PLATFORM_MOVE_SPEED = 0.06;

// Sprite size in grid cells (same as a single grid cell).
const ITEM_CELLS = 1;

// Solid cells only occupy the bottom portion of the grid cell.
const SOLID_TOP = 0.8; // fraction of cell height where the solid starts

// Particle system constants.
const PARTICLE_COUNT = 12;
const PARTICLE_LIFETIME = 30; // frames
const PARTICLE_SPEED = 0.25; // cells per frame

// Text overlay constants (assumes ~60 fps).
const TEXT_DISPLAY_FRAMES = 180; // 3 seconds
const TEXT_FADE_FRAMES = 15; // quick fade at the end

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

interface TextOverlay {
  text: string;
  framesRemaining: number;
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
  private textOverlays: TextOverlay[] = [];

  // Debug overlay.
  private debugEnabled = false;

  // Camera in cell units.
  private camX = 0;
  private camY = 0;

  private static readonly PARALLAX_FACTOR = 0.3;

  constructor(
    canvas: HTMLCanvasElement,
    grid: string[][],
    images: Game2ImageEntry[],
    channelId: string | undefined,
    imageCache?: Map<string, HTMLImageElement>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.sourceGrid = grid;
    this.grid = grid.map(row => [...row]);
    this.images = images;
    this.channelId = channelId;

    for (const img of images) {
      this.nameToFilename.set(img.name, img.filename);

      // Reuse cached image element if available.
      const cached = imageCache?.get(img.filename);
      if (cached) {
        this.loadedImages.set(img.name, cached);
        if (cached.complete && cached.naturalWidth > 0) {
          this.visibleBounds.set(img.name, computeVisibleBounds(cached));
        }
        continue;
      }

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
    this.textOverlays = [];

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

    const showText = (text: string) => {
      this.textOverlays.push({text, framesRemaining: TEXT_DISPLAY_FRAMES});
    };

    const jump = () => {
      for (const item of this.items) {
        if (item.behavior === 'platform' && item.grounded) {
          item.vy = JUMP_VELOCITY;
          item.grounded = false;
        }
      }
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
        'showText',
        'jump',
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
        removeItem,
        showText,
        jump
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

  /** Return loaded image elements keyed by filename for reuse across restarts. */
  getImageCache(): Map<string, HTMLImageElement> {
    const cache = new Map<string, HTMLImageElement>();
    for (const [name, el] of this.loadedImages) {
      const filename = this.nameToFilename.get(name);
      if (filename) {
        cache.set(filename, el);
      }
    }
    return cache;
  }

  toggleDebug() {
    this.debugEnabled = !this.debugEnabled;
    return this.debugEnabled;
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
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }
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

  /**
   * Check whether a cell-unit rect overlaps any solid grid cell.
   * Solid cells only occupy the bottom portion: y range [r + SOLID_TOP, r + 1].
   */
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
          // Solid occupies (c, r + SOLID_TOP) to (c + 1, r + 1).
          const solidY = r + SOLID_TOP;
          if (rx < c + 1 && rx + rw > c && ry < r + 1 && ry + rh > solidY) {
            return true;
          }
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

    // Update text overlays.
    for (let i = this.textOverlays.length - 1; i >= 0; i--) {
      this.textOverlays[i].framesRemaining--;
      if (this.textOverlays[i].framesRemaining <= 0) {
        this.textOverlays.splice(i, 1);
      }
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

    // Parallax background image — sized relative to the canvas, not the world.
    if (this.backgroundName) {
      const bgImg = this.loadedImages.get(this.backgroundName);
      if (bgImg?.complete && bgImg.naturalWidth > 0) {
        const pf = Game2Runtime.PARALLAX_FACTOR;
        // Extra pixels the background extends beyond the canvas for parallax travel.
        const parallaxExtra = Math.max(cw, ch) * pf;
        const bgSize = Math.max(cw, ch) + parallaxExtra;
        // Normalize camera position to 0–1 across the scrollable range.
        const vpW = cw / cp;
        const vpH = ch / cp;
        const maxCamX = Math.max(1, GRID_SIZE - vpW);
        const maxCamY = Math.max(1, GRID_SIZE - vpH);
        const normX = this.camX / maxCamX;
        const normY = this.camY / maxCamY;
        const bgX = -normX * parallaxExtra;
        const bgY = -normY * parallaxExtra;
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
          ctx.fillRect(
            c * cp - ox,
            r * cp - oy + cp * SOLID_TOP,
            cp,
            cp * (1 - SOLID_TOP)
          );
        } else {
          // Placed item cell — same size as the grid cell.
          const imgEl = this.loadedImages.get(cell);
          if (imgEl?.complete && imgEl.naturalWidth > 0) {
            ctx.drawImage(imgEl, c * cp - ox, r * cp - oy, cp, cp);
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

    // Draw text overlays (bottom-center, fade out at end).
    for (const overlay of this.textOverlays) {
      let alpha = 1;
      if (overlay.framesRemaining < TEXT_FADE_FRAMES) {
        alpha = overlay.framesRemaining / TEXT_FADE_FRAMES;
      }
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const tx = cw / 2;
      const ty = ch - 40;
      // Drop shadow.
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(overlay.text, tx + 2, ty + 2);
      // Main text.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(overlay.text, tx, ty);
    }
    ctx.globalAlpha = 1;

    // Draw score HUD.
    if (this.scoringEnabled) {
      const fontSize = 18;
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

    // Debug overlay.
    if (this.debugEnabled) {
      this.renderDebug(ctx, cw, ch);
    }
  }

  private renderDebug(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
    const player = this.items.find(
      i => i.behavior === 'move' || i.behavior === 'platform'
    );

    const lines: string[] = [];
    if (player) {
      lines.push(`mode: ${player.behavior}`);
      lines.push(`x: ${player.x.toFixed(2)}  y: ${player.y.toFixed(2)}`);
      lines.push(`vy: ${player.vy.toFixed(4)}  grounded: ${player.grounded}`);
    } else {
      lines.push('no player item');
    }
    lines.push(`cam: ${this.camX.toFixed(2)}, ${this.camY.toFixed(2)}`);
    lines.push(`items: ${this.items.length}`);

    const fontSize = 12;
    const lineHeight = 16;
    const padding = 8;
    const panelHeight = lines.length * lineHeight + padding * 2;
    const panelWidth = 200;
    const px = padding;
    const py = ch - panelHeight - padding;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(px, py, panelWidth, panelHeight);

    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00FF88';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], px + padding, py + padding + i * lineHeight);
    }
  }
}
