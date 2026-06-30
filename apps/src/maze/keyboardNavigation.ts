// Keyboard navigation for the maze. The maze SVG wrapper is the only
// thing in the tab order. Enter activates a focus cursor on Pegman's
// cell. Arrows walk it along open cells, obstacles, and the goal;
// walls and out-of-bounds block. Escape removes the cursor.
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
const CURSOR_STROKE = '#1b6ec2';
const HALO_STROKE = '#ffffff';
const CURSOR_WIDTH = 3;
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

interface CursorPos {
  col: number;
  row: number;
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

function describeCell(ctrl: MazeController, col: number, row: number): string {
  const tile = tileAt(ctrl, col, row);
  const finish = ctrl.subtype.finish;
  const what =
    finish?.x === col && finish?.y === row
      ? 'goal'
      : tile === SquareType.OBSTACLE
      ? 'obstacle'
      : tile === SquareType.START
      ? 'start'
      : 'open path';
  const here =
    ctrl.getPegmanX() === col && ctrl.getPegmanY() === row
      ? ' Character is here.'
      : '';
  return `${what}. Row ${row + 1}, column ${col + 1}.${here}`;
}

function createCursorRect(
  squareSize: number,
  stroke: string,
  strokeWidth: number,
  focusable: boolean
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
  if (focusable) {
    r.setAttribute('tabindex', '0');
    r.setAttribute('role', 'img');
    r.style.outline = 'none';
  }
  return r;
}

export default class MazeKeyboardNavigation {
  private readonly wrapper: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly liveRegion: HTMLElement;
  private cursor: SVGRectElement | null = null;
  private cursorHalo: SVGRectElement | null = null;
  private cursorPos: CursorPos | null = null;
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

  // Clearing first so the same text on consecutive moves still re-fires
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
    if (next && next !== this.wrapper && this.wrapper.contains(next)) return;
    this.exit({restoreWrapperFocus: false});
  };

  private enter(): void {
    const ctrl = getMazeController();
    if (!ctrl) return;
    this.cursorPos = {col: ctrl.getPegmanX(), row: ctrl.getPegmanY()};

    // Two stacked rects: a fatter white halo so the cursor stays
    // visible across light and dark tiles, and a thinner blue rect on
    // top that takes focus.
    const size = ctrl.SQUARE_SIZE;
    this.cursorHalo = createCursorRect(size, HALO_STROKE, HALO_WIDTH, false);
    this.cursor = createCursorRect(size, CURSOR_STROKE, CURSOR_WIDTH, true);
    this.svg.appendChild(this.cursorHalo);
    this.svg.appendChild(this.cursor);

    this.active = true;
    this.placeCursor();
    this.cursor.focus();
  }

  private placeCursor(): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.cursor || !this.cursorPos) return;
    const {col, row} = this.cursorPos;
    const x = String(col * ctrl.SQUARE_SIZE);
    const y = String(row * ctrl.SQUARE_SIZE);
    for (const rect of [this.cursor, this.cursorHalo]) {
      rect?.setAttribute('x', x);
      rect?.setAttribute('y', y);
    }
    const label = describeCell(ctrl, col, row);
    this.cursor.setAttribute('aria-label', label);
    this.announce(label);
  }

  private tryMove(delta: {dx: number; dy: number}): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.cursorPos) return;
    const nx = this.cursorPos.col + delta.dx;
    const ny = this.cursorPos.row + delta.dy;
    if (nx < 0 || nx >= ctrl.map.COLS || ny < 0 || ny >= ctrl.map.ROWS) {
      this.announce('Edge of maze.');
      return;
    }
    if (tileAt(ctrl, nx, ny) === SquareType.WALL) {
      this.announce('Wall.');
      return;
    }
    this.cursorPos = {col: nx, row: ny};
    this.placeCursor();
  }

  // Detach refs and flip active before .remove(). The blur fired by
  // removing the focused cursor bubbles to focusout, which re-enters
  // this method; without the early flip we'd double-remove a node
  // mid-removal and the browser throws NotFoundError.
  private exit(opts: {restoreWrapperFocus?: boolean} = {}): void {
    const {restoreWrapperFocus = true} = opts;
    if (!this.active) return;
    this.active = false;
    const cursor = this.cursor;
    const halo = this.cursorHalo;
    this.cursor = null;
    this.cursorHalo = null;
    this.cursorPos = null;
    cursor?.remove();
    halo?.remove();
    if (restoreWrapperFocus) {
      this.wrapper.focus();
      this.announce('Exited maze navigation.');
    }
  }
}
