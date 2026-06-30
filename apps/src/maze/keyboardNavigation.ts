// Keyboard navigation for the maze. The maze SVG wrapper is the only
// thing in the tab order. Enter activates a focus cursor on Pegman's
// cell. Arrows walk it along open cells, obstacles, and the goal;
// walls and out-of-bounds block. Escape removes the cursor.
//
// Pegman and maze state are never mutated. Cells are read through
// window.Maze.controller (set by loadMaze.js); without it the wrapper
// is just inert focus.

import maze from '@code-dot-org/maze';

import {Locale} from '@cdo/apps/types/locale';

import * as mazeMsg from './locale';

// Cast the runtime locale object to a type whose keys are derived from the
// source strings JSON, so missing/mistyped message keys fail typecheck.
const msg = mazeMsg as Locale<typeof import('@cdo/i18n/maze/en_us.json')>;

const {SquareType} = maze.tiles;
const {HarvesterCell, PlanterCell} = maze.cells;

// Cell is whatever subclass the active subtype uses (Cell, BeeCell,
// HarvesterCell, ...). Every method below is optional because only the
// matching subtype populates it; describeObject calls each behind the
// relevant subtype guard. All are read-only — none mutate puzzle state.
interface MazeCell {
  getCurrentValue: () => number | undefined;
  isFlower?: () => boolean; // BeeCell
  isHive?: () => boolean; // BeeCell
  isStaticCloud?: () => boolean; // BeeCell
  featureName?: () => string; // HarvesterCell / PlanterCell
  startsHidden?: () => boolean; // HarvesterCell
}

interface MazeSubtype {
  finish?: {x: number; y: number};
  isBee?: () => boolean;
  isCollector?: () => boolean;
  isFarmer?: () => boolean;
  isWordSearch?: () => boolean;
  getCell?: (row: number, col: number) => MazeCell;
  // Bee-only helpers; take (row, col) and do not record user checks.
  isRedFlower?: (row: number, col: number) => boolean;
  flowerRemainingCapacity?: (row: number, col: number) => number;
  hiveRemainingCapacity?: (row: number, col: number) => number;
}

interface MazeGlobal {
  controller?: {
    SQUARE_SIZE: number;
    subtype: MazeSubtype;
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

// WordSearch renders one letter per cell into an SVG <text> whose id is
// "letter_<row>_<col>"; that glyph lives only in the DOM, not the cell
// model, so it's read straight from the document. '-' marks the start
// square (drawn from a numeric map value), which describeCell already
// labels, so it's reported as having no letter.
const WORD_SEARCH_START_GLYPH = '-';

function wordSearchLetterAt(row: number, col: number): string | null {
  const text = document
    .getElementById(`letter_${row}_${col}`)
    ?.textContent?.trim();
  return text && text !== WORD_SEARCH_START_GLYPH ? text : null;
}

// Describe the gameplay object occupying a cell, for the subtypes whose
// goals are richer than reach-the-finish (bee nectar/honey, collector
// items, farmer dirt, harvester crops, planter soil/sprout, wordsearch
// letters). Returns null when the cell holds nothing type-specific, so
// describeCell falls back to the plain tile description. All reads are
// side-effect-free.
export function describeObject(
  ctrl: MazeController,
  col: number,
  row: number
): string | null {
  const sub = ctrl.subtype;

  // WordSearch reads the rendered letter from the DOM, not the cell model.
  if (sub.isWordSearch?.()) {
    const letter = wordSearchLetterAt(row, col);
    return letter ? msg.mazeNavLetter({letter}) : null;
  }

  const cell = sub.getCell?.(row, col);
  if (!cell) {
    return null;
  }

  if (sub.isBee?.()) {
    if (cell.isFlower?.()) {
      const red = sub.isRedFlower?.(row, col);
      const count = sub.flowerRemainingCapacity?.(row, col) ?? 0;
      if (!Number.isFinite(count)) {
        return red
          ? msg.mazeNavFlowerRedUnlimited()
          : msg.mazeNavFlowerPurpleUnlimited();
      }
      return red
        ? msg.mazeNavFlowerRed({count})
        : msg.mazeNavFlowerPurple({count});
    }
    if (cell.isHive?.()) {
      const count = sub.hiveRemainingCapacity?.(row, col) ?? 0;
      return Number.isFinite(count)
        ? msg.mazeNavHive({count})
        : msg.mazeNavHiveUnlimited();
    }
    if (cell.isStaticCloud?.()) {
      return msg.mazeNavCloud();
    }
    return null;
  }

  if (sub.isCollector?.()) {
    const count = cell.getCurrentValue();
    return count && count > 0 ? msg.mazeNavCollectibles({count}) : null;
  }

  if (sub.isFarmer?.()) {
    const value = cell.getCurrentValue();
    if (value === undefined || value === 0) {
      return null;
    }
    return value > 0
      ? msg.mazeNavDirtPile({count: value})
      : msg.mazeNavHole({count: -value});
  }

  // Harvester and Planter have no subtype predicate; discriminate by the
  // cell subclass the subtype instantiated.
  if (HarvesterCell && cell instanceof HarvesterCell) {
    if (cell.startsHidden?.()) {
      return msg.mazeNavHiddenCrop();
    }
    const count = cell.getCurrentValue() ?? 0;
    switch (cell.featureName?.()) {
      case 'corn':
        return msg.mazeNavCorn({count});
      case 'pumpkin':
        return msg.mazeNavPumpkin({count});
      case 'lettuce':
        return msg.mazeNavLettuce({count});
      case 'unknown':
        return msg.mazeNavHiddenCrop();
      default:
        return null;
    }
  }

  if (PlanterCell && cell instanceof PlanterCell) {
    switch (cell.featureName?.()) {
      case 'soil':
        return msg.mazeNavSoil();
      case 'sprout':
        return msg.mazeNavSprout();
      default:
        return null;
    }
  }

  return null;
}

export function describeCell(
  ctrl: MazeController,
  col: number,
  row: number
): string {
  const object = describeObject(ctrl, col, row);
  const finish = ctrl.subtype.finish;
  let primary: string;
  if (object) {
    primary = object;
  } else if (finish?.x === col && finish?.y === row) {
    primary = msg.mazeNavGoal();
  } else {
    const tile = tileAt(ctrl, col, row);
    primary =
      tile === SquareType.OBSTACLE
        ? msg.mazeNavObstacle()
        : tile === SquareType.START
        ? msg.mazeNavStart()
        : msg.mazeNavOpenPath();
  }
  const position = msg.mazeNavPosition({row: row + 1, col: col + 1});
  const here =
    ctrl.getPegmanX() === col && ctrl.getPegmanY() === row
      ? msg.mazeNavCharacterHere()
      : '';
  return [primary, position, here].filter(Boolean).join(' ');
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
  }

  private tryMove(delta: {dx: number; dy: number}): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.cursorPos) return;
    const nx = this.cursorPos.col + delta.dx;
    const ny = this.cursorPos.row + delta.dy;
    if (nx < 0 || nx >= ctrl.map.COLS || ny < 0 || ny >= ctrl.map.ROWS) {
      this.announce(msg.mazeNavEdge());
      return;
    }
    if (tileAt(ctrl, nx, ny) === SquareType.WALL) {
      this.announce(msg.mazeNavWall());
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
      this.announce(msg.mazeNavExited());
    }
  }
}
