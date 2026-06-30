// Keyboard navigation for the maze. The maze SVG wrapper is the only
// thing in the tab order until activated. Enter lays a transparent,
// focusable overlay rect over every non-wall cell, each carrying an
// aria-label describing what it is (open path, goal, start, obstacle).
// Arrows move DOM focus from cell to cell; the focused cell's label is
// what a screen reader or braille display reports. Walls and the maze
// edge are never focusable -- bumping into one is announced through a
// polite live region instead. Escape tears the overlay down.
//
// Why focusable cells rather than one moving cursor + a live region for
// every step: a braille display renders the accessible name of the
// *focused* element, not transient live-region text, which it may never
// surface. Giving each navigable cell a real focus target with a
// persistent label makes the path and goal legible in braille. The live
// region is then reserved for the wall/edge bumps, which have no element
// to land on.
//
// Pegman and maze state are never mutated. Cells are read through
// window.Maze.controller (set by loadMaze.js); without it the wrapper
// is just inert focus.

import maze from '@code-dot-org/maze';

const {SquareType} = maze.tiles;

interface MazeGlobal {
  controller?: {
    SQUARE_SIZE: number;
    subtype: {finish?: {x: number; y: number}};
    map: {
      ROWS: number;
      COLS: number;
      getTile: (row: number, col: number) => number | undefined;
    };
    getPegmanX: (id?: string) => number;
    getPegmanY: (id?: string) => number;
  };
}

type MazeController = NonNullable<MazeGlobal['controller']>;

const SVG_NS = 'http://www.w3.org/2000/svg';
const CORNER_RADIUS = 6;
const FOCUS_STROKE = '#1b6ec2';
const HALO_STROKE = '#ffffff';
const FOCUS_WIDTH = 3;
const HALO_WIDTH = 6;

const ARROW_TO_DELTA: Record<string, {dx: number; dy: number}> = {
  ArrowUp: {dx: 0, dy: -1},
  ArrowRight: {dx: 1, dy: 0},
  ArrowDown: {dx: 0, dy: 1},
  ArrowLeft: {dx: -1, dy: 0},
};

const SR_ONLY: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: '0',
};

interface CellPos {
  col: number;
  row: number;
}

function posKey(col: number, row: number): string {
  return `${col},${row}`;
}

function getMazeController(): MazeController | undefined {
  return (window as unknown as {Maze?: MazeGlobal}).Maze?.controller;
}

// map.getTile internally indexes grid_[firstArg][secondArg], where the
// first arg is the row. Pegman/finish use (x=col, y=row). Wrap once.
function tileAt(
  ctrl: MazeController,
  col: number,
  row: number
): number | undefined {
  return ctrl.map.getTile(row, col);
}

// Navigable = in bounds and not a wall. getTile returns undefined out of
// bounds and SquareType.WALL (0) for a wall; everything else is a cell a
// reader can stand on.
function isNavigable(ctrl: MazeController, col: number, row: number): boolean {
  const tile = tileAt(ctrl, col, row);
  return tile !== undefined && tile !== SquareType.WALL;
}

function describeCell(ctrl: MazeController, col: number, row: number): string {
  const tile = tileAt(ctrl, col, row);
  const finish = ctrl.subtype.finish;
  const isGoal =
    (finish?.x === col && finish?.y === row) ||
    tile === SquareType.FINISH ||
    tile === SquareType.STARTANDFINISH;
  const isStart =
    tile === SquareType.START || tile === SquareType.STARTANDFINISH;
  const what = isGoal
    ? isStart
      ? 'start and goal'
      : 'goal'
    : tile === SquareType.OBSTACLE
    ? 'obstacle'
    : isStart
    ? 'start'
    : 'open path';
  const here =
    ctrl.getPegmanX() === col && ctrl.getPegmanY() === row
      ? ' Character is here.'
      : '';
  return `${what}. Row ${row + 1}, column ${col + 1}.${here}`;
}

// Transparent, focusable square laid over one navigable cell. pointer-
// events stay off so the overlay never intercepts mouse interaction with
// the maze; focus is driven only by our own .focus() calls. tabindex
// starts at -1 -- focusCell promotes the active cell to 0 (roving
// tabindex) so the maze remains a single Tab stop.
function createCellRect(squareSize: number, label: string): SVGRectElement {
  const r = document.createElementNS(SVG_NS, 'rect');
  r.setAttribute('width', String(squareSize));
  r.setAttribute('height', String(squareSize));
  r.setAttribute('fill', 'transparent');
  r.setAttribute('pointer-events', 'none');
  r.setAttribute('tabindex', '-1');
  r.setAttribute('role', 'img');
  r.setAttribute('aria-label', label);
  r.style.outline = 'none';
  return r;
}

// Purely decorative focus ring that follows the focused cell. Two
// stacked rects: a fatter white halo so the ring stays visible across
// light and dark tiles, and a thinner blue rect on top.
function createRingRect(
  squareSize: number,
  stroke: string,
  strokeWidth: number
): SVGRectElement {
  const r = document.createElementNS(SVG_NS, 'rect');
  r.setAttribute('width', String(squareSize));
  r.setAttribute('height', String(squareSize));
  r.setAttribute('rx', String(CORNER_RADIUS));
  r.setAttribute('ry', String(CORNER_RADIUS));
  r.setAttribute('fill', 'none');
  r.setAttribute('stroke', stroke);
  r.setAttribute('stroke-width', String(strokeWidth));
  r.setAttribute('pointer-events', 'none');
  return r;
}

export default class MazeKeyboardNavigation {
  private readonly wrapper: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly liveRegion: HTMLElement;
  private cellLayer: SVGGElement | null = null;
  private ring: SVGRectElement | null = null;
  private ringHalo: SVGRectElement | null = null;
  private readonly cellRects = new Map<string, SVGRectElement>();
  private tabbableRect: SVGRectElement | null = null;
  private focusedPos: CellPos | null = null;
  private active = false;

  constructor(wrapper: HTMLElement, svg: SVGSVGElement) {
    this.wrapper = wrapper;
    this.svg = svg;
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    Object.assign(this.liveRegion.style, SR_ONLY);
    this.wrapper.appendChild(this.liveRegion);

    this.wrapper.addEventListener('keydown', this.handleKeyDown);
    this.wrapper.addEventListener('focusout', this.handleFocusOut);
  }

  destroy(): void {
    this.exit({restoreWrapperFocus: false});
    this.wrapper.removeEventListener('keydown', this.handleKeyDown);
    this.wrapper.removeEventListener('focusout', this.handleFocusOut);
    this.liveRegion.remove();
  }

  // Clearing first so the same text on consecutive bumps still re-fires
  // for screen readers that diff aria-live content.
  private announce(text: string): void {
    this.liveRegion.textContent = '';
    window.setTimeout(() => {
      this.liveRegion.textContent = text;
    }, 0);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const consume = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    if (!this.active) {
      if (e.key === 'Enter' && e.target === this.wrapper) {
        consume();
        this.enter();
      }
      return;
    }
    if (e.key === 'Escape') {
      consume();
      this.exit();
      return;
    }
    const delta = ARROW_TO_DELTA[e.key];
    if (delta) {
      consume();
      this.tryMove(delta);
    }
  };

  private handleFocusOut = (e: FocusEvent): void => {
    if (!this.active) return;
    const next = e.relatedTarget as Node | null;
    if (next && this.wrapper.contains(next)) return;
    this.exit({restoreWrapperFocus: false});
  };

  private enter(): void {
    const ctrl = getMazeController();
    if (!ctrl) return;

    const size = ctrl.SQUARE_SIZE;
    const layer = document.createElementNS(SVG_NS, 'g');
    for (let row = 0; row < ctrl.map.ROWS; row++) {
      for (let col = 0; col < ctrl.map.COLS; col++) {
        if (!isNavigable(ctrl, col, row)) continue;
        const rect = createCellRect(size, describeCell(ctrl, col, row));
        rect.setAttribute('x', String(col * size));
        rect.setAttribute('y', String(row * size));
        layer.appendChild(rect);
        this.cellRects.set(posKey(col, row), rect);
      }
    }
    if (this.cellRects.size === 0) return;

    this.ringHalo = createRingRect(size, HALO_STROKE, HALO_WIDTH);
    this.ring = createRingRect(size, FOCUS_STROKE, FOCUS_WIDTH);
    this.svg.appendChild(layer);
    this.svg.appendChild(this.ringHalo);
    this.svg.appendChild(this.ring);
    this.cellLayer = layer;
    this.active = true;

    // Land on Pegman's cell; fall back to any navigable cell if Pegman
    // somehow sits off the grid.
    const start = {col: ctrl.getPegmanX(), row: ctrl.getPegmanY()};
    const entry = this.cellRects.has(posKey(start.col, start.row))
      ? start
      : this.firstCellPos();
    if (entry) this.focusCell(entry.col, entry.row);
  }

  private firstCellPos(): CellPos | null {
    const key = this.cellRects.keys().next().value;
    if (!key) return null;
    const [col, row] = key.split(',').map(Number);
    return {col, row};
  }

  // Move focus to a cell. Roving tabindex keeps exactly one cell in the
  // Tab order; the decorative ring tracks the focused cell.
  private focusCell(col: number, row: number): void {
    const rect = this.cellRects.get(posKey(col, row));
    if (!rect) return;
    if (this.tabbableRect && this.tabbableRect !== rect) {
      this.tabbableRect.setAttribute('tabindex', '-1');
    }
    rect.setAttribute('tabindex', '0');
    this.tabbableRect = rect;
    this.focusedPos = {col, row};
    this.positionRing(col, row);
    rect.focus();
  }

  private positionRing(col: number, row: number): void {
    const ctrl = getMazeController();
    if (!ctrl) return;
    const x = String(col * ctrl.SQUARE_SIZE);
    const y = String(row * ctrl.SQUARE_SIZE);
    for (const rect of [this.ring, this.ringHalo]) {
      rect?.setAttribute('x', x);
      rect?.setAttribute('y', y);
    }
  }

  private tryMove(delta: {dx: number; dy: number}): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.focusedPos) return;
    const nx = this.focusedPos.col + delta.dx;
    const ny = this.focusedPos.row + delta.dy;
    if (nx < 0 || nx >= ctrl.map.COLS || ny < 0 || ny >= ctrl.map.ROWS) {
      this.announce('Edge of maze.');
      return;
    }
    if (!isNavigable(ctrl, nx, ny)) {
      this.announce('Wall.');
      return;
    }
    // The destination cell carries its own aria-label, so focusing it is
    // what reports the move -- no live-region echo for path or goal.
    this.focusCell(nx, ny);
  }

  // Detach refs and flip active before removing nodes. Removing the
  // focused cell blurs it, and that blur bubbles to focusout, which
  // re-enters teardown; without the early flip we'd touch a half-removed
  // tree and the browser throws NotFoundError.
  private exit(opts: {restoreWrapperFocus?: boolean} = {}): void {
    const {restoreWrapperFocus = true} = opts;
    if (!this.active) return;
    this.active = false;
    const layer = this.cellLayer;
    const ring = this.ring;
    const halo = this.ringHalo;
    this.cellLayer = null;
    this.ring = null;
    this.ringHalo = null;
    this.tabbableRect = null;
    this.focusedPos = null;
    this.cellRects.clear();
    layer?.remove();
    ring?.remove();
    halo?.remove();
    if (restoreWrapperFocus) {
      this.wrapper.focus();
      this.announce('Exited maze navigation.');
    }
  }
}
