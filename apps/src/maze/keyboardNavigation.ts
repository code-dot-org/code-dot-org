// Keyboard navigation for the maze. The svg is the only tab stop. Enter puts a
// cursor on the character's cell, arrows walk it, P jumps back to the
// character, Escape removes it. Edges always block; walls block too, except in
// Painter, where the walls hold the scenery worth reading.
//
// The svg is the interactive host rather than a wrapping div so it stays the
// direct child of #visualization, which is what common.scss and
// responsive-visualization.scss scale. A wrapper shifts the scale anchor.
//
// Nothing here mutates maze state. Cells come from window.Maze.controller,
// published by loadMaze.js on maze levels and by the Neighborhood mini app in
// Lab2. Without it the svg is just inert focus.

import maze from '@code-dot-org/maze';

// Relative because @cdo/i18n is a type-only alias with no bundler mapping.
import mazeStrings from '../../i18n/maze/en_us.json';

import * as mazeMsg from './locale';
import {describeNeighborhoodCell, SpriteMap} from './neighborhoodDescriptions';

const {SquareType, Direction} = maze.tiles;
const {HarvesterCell, PlanterCell} = maze.cells;

// Keys must already exist in the strings file; a new one fails typecheck.
type MazeMessageKey = keyof typeof mazeStrings;

type MessageParams = Record<string, string | number>;
type MessageFn = (params?: MessageParams) => string;

// Rails serves only the level's own <app>_locale.js, so a Painter level has no
// compiled maze strings. Fall back to the English source, filling {placeholders}.
function t(
  key: MazeMessageKey,
  params: MessageParams = {},
  // Only for the one source string whose plural syntax this cannot expand.
  fallback: string = mazeStrings[key]
): string {
  const compiled = (mazeMsg as Record<string, MessageFn | undefined>)[key];
  return typeof compiled === 'function'
    ? compiled(params)
    : fallback.replace(/\{(\w+)\}/g, (_, name) => String(params[name]));
}

// Painter has no key in the strings file, so those few are written in English.
const MSG = {
  goal: () => t('mazeNavGoal'),
  obstacle: () => t('mazeNavObstacle'),
  start: () => t('mazeNavStart'),
  openPath: () => t('mazeNavOpenPath'),
  wall: () => t('mazeNavWall'),
  edge: () => t('mazeNavEdge'),
  exited: () => t('mazeNavExited'),
  edgeOfNeighborhood: () => 'Edge of the neighborhood.',
  noPainter: () => 'No painter on the grid yet. Press Run to place one.',
  noCharacter: () => 'Character is not on the grid.',
  painterHere: (name: string) => `${name} is here.`,
  painterHereFacing: (name: string, direction: string) =>
    `${name} is here, facing ${direction}.`,
  characterHere: () => t('mazeNavCharacterHere'),
  characterHereFacing: (direction: string) =>
    t('mazeNavCharacterHereFacing', {direction}),
  position: (row: number, col: number) => t('mazeNavPosition', {row, col}),
  letter: (letter: string) => t('mazeNavLetter', {letter}),
  flowerRed: (count: number) => t('mazeNavFlowerRed', {count}),
  flowerRedUnlimited: () => t('mazeNavFlowerRedUnlimited'),
  flowerPurple: (count: number) => t('mazeNavFlowerPurple', {count}),
  flowerPurpleUnlimited: () => t('mazeNavFlowerPurpleUnlimited'),
  hive: (count: number) => t('mazeNavHive', {count}),
  hiveUnlimited: () => t('mazeNavHiveUnlimited'),
  cloud: () => t('mazeNavCloud'),
  // Only the collector subtype reaches this.
  collectibles: (count: number) =>
    t(
      'mazeNavCollectibles',
      {count},
      count === 1 ? '1 item to collect.' : '{count} items to collect.'
    ),
  dirtPile: (count: number) => t('mazeNavDirtPile', {count}),
  hole: (count: number) => t('mazeNavHole', {count}),
  hiddenCrop: () => t('mazeNavHiddenCrop'),
  corn: (count: number) => t('mazeNavCorn', {count}),
  pumpkin: (count: number) => t('mazeNavPumpkin', {count}),
  lettuce: (count: number) => t('mazeNavLettuce', {count}),
  soil: () => t('mazeNavSoil'),
  sprout: () => t('mazeNavSprout'),
};

const DIRECTION_NAME: Record<number, () => string> = {
  [Direction.NORTH]: () => t('mazeNavNorth'),
  [Direction.EAST]: () => t('mazeNavEast'),
  [Direction.SOUTH]: () => t('mazeNavSouth'),
  [Direction.WEST]: () => t('mazeNavWest'),
};

// Returns whether the level requires "turn right/left" movement
// to enable reporting of the direction the character is facing.
function usesTurns(ctrl: MazeController): boolean {
  // Painter always turns, and has no block XML to scan.
  if (ctrl.subtype.isNeighborhood?.()) {
    return true;
  }
  const {toolbox, startBlocks} = ctrl.level ?? {};
  return [toolbox, startBlocks].some(
    xml => typeof xml === 'string' && xml.includes('maze_turn')
  );
}

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
  getColor?: () => string | undefined; // NeighborhoodCell
  getAssetId?: () => number | undefined; // NeighborhoodCell
}

interface MazeSubtype {
  finish?: {x: number; y: number};
  isBee?: () => boolean;
  isCollector?: () => boolean;
  isFarmer?: () => boolean;
  isWordSearch?: () => boolean;
  isNeighborhood?: () => boolean;
  getSpriteMap?: () => SpriteMap;
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
    // toolbox/startBlocks are the rendered block XML; we scan them to learn
    // whether turning is part of this level's controls.
    level?: {toolbox?: string; startBlocks?: string};
    // Undefined until a pegman with this id exists.
    getPegmanX: (id?: string) => number | undefined;
    getPegmanY: (id?: string) => number | undefined;
    getPegmanD: (id?: string) => number | undefined;
    // Neighborhood runs one pegman per Painter object; see painterIds.
    pegmanController?: {getAllPegmanIds?: () => string[]};
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

  if (sub.isWordSearch?.()) {
    const letter = wordSearchLetterAt(row, col);
    return letter ? MSG.letter(letter) : null;
  }

  const cell = sub.getCell?.(row, col);
  if (!cell) {
    return null;
  }

  if (sub.isNeighborhood?.()) {
    return describeNeighborhoodCell(sub.getSpriteMap?.(), {
      color: cell.getColor?.(),
      paintCount: cell.getCurrentValue(),
      assetId: cell.getAssetId?.(),
    });
  }

  if (sub.isBee?.()) {
    if (cell.isFlower?.()) {
      const red = sub.isRedFlower?.(row, col);
      const count = sub.flowerRemainingCapacity?.(row, col) ?? 0;
      if (!Number.isFinite(count)) {
        return red ? MSG.flowerRedUnlimited() : MSG.flowerPurpleUnlimited();
      }
      return red ? MSG.flowerRed(count) : MSG.flowerPurple(count);
    }
    if (cell.isHive?.()) {
      const count = sub.hiveRemainingCapacity?.(row, col) ?? 0;
      return Number.isFinite(count) ? MSG.hive(count) : MSG.hiveUnlimited();
    }
    if (cell.isStaticCloud?.()) {
      return MSG.cloud();
    }
    return null;
  }

  if (sub.isCollector?.()) {
    const count = cell.getCurrentValue();
    return count && count > 0 ? MSG.collectibles(count) : null;
  }

  if (sub.isFarmer?.()) {
    const value = cell.getCurrentValue();
    if (value === undefined || value === 0) {
      return null;
    }
    return value > 0 ? MSG.dirtPile(value) : MSG.hole(-value);
  }

  // Harvester and Planter have no subtype predicate; discriminate by the
  // cell subclass the subtype instantiated.
  if (HarvesterCell && cell instanceof HarvesterCell) {
    if (cell.startsHidden?.()) {
      return MSG.hiddenCrop();
    }
    const count = cell.getCurrentValue() ?? 0;
    switch (cell.featureName?.()) {
      case 'corn':
        return MSG.corn(count);
      case 'pumpkin':
        return MSG.pumpkin(count);
      case 'lettuce':
        return MSG.lettuce(count);
      case 'unknown':
        return MSG.hiddenCrop();
      default:
        return null;
    }
  }

  if (PlanterCell && cell instanceof PlanterCell) {
    switch (cell.featureName?.()) {
      case 'soil':
        return MSG.soil();
      case 'sprout':
        return MSG.sprout();
      default:
        return null;
    }
  }

  return null;
}

// @code-dot-org/maze keys its lone pegman under this id and does not export it.
const DEFAULT_PEGMAN_ID = 'default';

// Which pegmen are worth reporting. Painter hides the default pegman on run and
// adds one per Painter object, so once those exist the parked default is noise.
function painterIds(ctrl: MazeController): string[] {
  if (!ctrl.subtype.isNeighborhood?.()) {
    return [DEFAULT_PEGMAN_ID];
  }
  const painters = (ctrl.pegmanController?.getAllPegmanIds?.() ?? []).filter(
    id => id !== DEFAULT_PEGMAN_ID
  );
  return painters.length > 0 ? painters : [DEFAULT_PEGMAN_ID];
}

// Where a pegman stands, or null before it has been placed.
function pegmanSpot(ctrl: MazeController, id: string): CursorPos | null {
  const col = ctrl.getPegmanX(id);
  const row = ctrl.getPegmanY(id);
  return typeof col === 'number' && typeof row === 'number' ? {col, row} : null;
}

// Painter names its pegmen "painter-1", "painter-2"; say that as "Painter 1".
// Java Lab ids may differ, so unknown ones are read as they come.
function painterName(id: string): string {
  if (id === DEFAULT_PEGMAN_ID) {
    return 'Painter';
  }
  const numbered = /^painter-(\d+)$/.exec(id);
  return numbered ? `Painter ${numbered[1]}` : id;
}

// The "is here" clause, empty unless the cursor is on a pegman. Facing is named
// only on levels that turn.
function describeCharacterHere(
  ctrl: MazeController,
  col: number,
  row: number
): string {
  const here = painterIds(ctrl).filter(
    id => ctrl.getPegmanX(id) === col && ctrl.getPegmanY(id) === row
  );
  // usesTurns scans block XML, so skip it on the many cells with no pegman.
  if (here.length === 0) {
    return '';
  }
  const named = usesTurns(ctrl);
  const isPainter = ctrl.subtype.isNeighborhood?.() ?? false;
  return here
    .map(id => {
      const facing = named && DIRECTION_NAME[ctrl.getPegmanD(id) as number];
      if (isPainter) {
        const name = painterName(id);
        return facing
          ? MSG.painterHereFacing(name, facing())
          : MSG.painterHere(name);
      }
      return facing ? MSG.characterHereFacing(facing()) : MSG.characterHere();
    })
    .join(' ');
}

export function describeCell(
  ctrl: MazeController,
  col: number,
  row: number
): string {
  const object = describeObject(ctrl, col, row);
  const finish = ctrl.subtype.finish;
  const isGoal = finish?.x === col && finish?.y === row;
  const tile = tileAt(ctrl, col, row);
  let primary: string;
  if (object) {
    primary = object;
  } else if (isGoal) {
    primary = MSG.goal();
  } else {
    primary =
      tile === SquareType.OBSTACLE
        ? MSG.obstacle()
        : tile === SquareType.START
        ? MSG.start()
        : MSG.openPath();
  }
  const position = MSG.position(row + 1, col + 1);
  const here = describeCharacterHere(ctrl, col, row);
  return [primary, here, position].filter(Boolean).join(' ');
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
  private readonly svg: SVGSVGElement;
  private readonly liveRegion: HTMLElement;
  private cursor: SVGRectElement | null = null;
  private cursorHalo: SVGRectElement | null = null;
  private cursorPos: CursorPos | null = null;

  // Read from the DOM rather than tracked, so a level reload that clears the
  // svg cannot leave us thinking a cursor is still up.
  private get active(): boolean {
    return this.cursor?.isConnected ?? false;
  }

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    // The live region is an HTML element and can't live inside the svg
    // namespace, so it hangs off document.body. It works from anywhere in
    // the document and is removed in destroy().
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    Object.assign(this.liveRegion.style, SR_ONLY);
    document.body.appendChild(this.liveRegion);

    this.svg.addEventListener('keydown', this.handleKeyDown);
    this.svg.addEventListener('focusout', this.handleFocusOut);
  }

  destroy(): void {
    this.exit({restoreFocus: false});
    this.svg.removeEventListener('keydown', this.handleKeyDown);
    this.svg.removeEventListener('focusout', this.handleFocusOut);
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
      if (e.key === 'Enter' && e.target === this.svg) {
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
    if (e.key === 'p' || e.key === 'P') {
      consume();
      this.jumpToCharacter();
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
    if (next && next !== this.svg && this.svg.contains(next)) return;
    this.exit({restoreFocus: false});
  };

  private enter(): void {
    const ctrl = getMazeController();
    if (!ctrl) return;
    // Painter levels have no start square and no painter until a program runs,
    // so fall back to the top-left cell.
    this.cursorPos = pegmanSpot(ctrl, painterIds(ctrl)[0]) ?? {col: 0, row: 0};

    // Two stacked rects: a fatter white halo so the cursor stays
    // visible across light and dark tiles, and a thinner blue rect on
    // top that takes focus.
    const size = ctrl.SQUARE_SIZE;
    this.cursorHalo = createCursorRect(size, HALO_STROKE, HALO_WIDTH, false);
    this.cursor = createCursorRect(size, CURSOR_STROKE, CURSOR_WIDTH, true);
    this.svg.appendChild(this.cursorHalo);
    this.svg.appendChild(this.cursor);
    this.placeCursor();
    this.cursor.focus();
  }

  // Focus lands on this rect once and then it slides between cells. Painter's
  // changed aria-label went unread, so there the live region speaks. Maze
  // already reads the label; announcing would say every cell twice.
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
    if (ctrl.subtype.isNeighborhood?.()) {
      this.announce(label);
    }
  }

  private tryMove(delta: {dx: number; dy: number}): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.cursorPos) return;
    const isPainter = ctrl.subtype.isNeighborhood?.() ?? false;
    const nx = this.cursorPos.col + delta.dx;
    const ny = this.cursorPos.row + delta.dy;
    if (nx < 0 || nx >= ctrl.map.COLS || ny < 0 || ny >= ctrl.map.ROWS) {
      this.announce(isPainter ? MSG.edgeOfNeighborhood() : MSG.edge());
      return;
    }
    // Painter keeps its scenery on wall tiles — grass, houses, the cone that
    // ends a level — so the read-only cursor walks onto them. A student who
    // cannot visit a wall cannot survey the neighborhood.
    if (!isPainter && tileAt(ctrl, nx, ny) === SquareType.WALL) {
      this.announce(MSG.wall());
      return;
    }
    this.cursorPos = {col: nx, row: ny};
    this.placeCursor();
  }

  // Every cell is walkable in Painter, so a student can wander far from the
  // painter. Repeated presses cycle through several painters.
  private jumpToCharacter(): void {
    const ctrl = getMazeController();
    if (!ctrl || !this.cursorPos) return;
    const {col, row} = this.cursorPos;
    const spots = painterIds(ctrl)
      .map(id => pegmanSpot(ctrl, id))
      .filter((spot): spot is CursorPos => spot !== null);
    if (spots.length === 0) {
      this.announce(
        ctrl.subtype.isNeighborhood?.() ? MSG.noPainter() : MSG.noCharacter()
      );
      return;
    }
    // Off every painter gives -1, which lands on the first.
    const current = spots.findIndex(
      spot => spot.col === col && spot.row === row
    );
    this.cursorPos = spots[(current + 1) % spots.length];
    this.placeCursor();
  }

  // Drop the refs before .remove(): removing the focused cursor fires a blur
  // that re-enters here through focusout, and that second pass must find no
  // cursor or it double-removes and throws NotFoundError.
  private exit(opts: {restoreFocus?: boolean} = {}): void {
    const {restoreFocus = true} = opts;
    const cursor = this.cursor;
    const halo = this.cursorHalo;
    if (!cursor) return;
    this.cursor = null;
    this.cursorHalo = null;
    this.cursorPos = null;
    cursor?.remove();
    halo?.remove();
    if (restoreFocus) {
      this.svg.focus();
      this.announce(MSG.exited());
    }
  }
}
