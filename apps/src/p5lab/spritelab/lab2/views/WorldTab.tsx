import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ImageType} from '../ai/images/types';
import {imageTypeFromCategories} from '../imageGallery';
import {getImageThumbnail, onTrimsUpdated} from '../imageTrim';
import {BACKGROUNDS_CATEGORY} from '../types';
import {createEmptyWorld, World, WorldCell} from '../world';

import {PREVIEW_CLEARANCE} from './Playspace';

import moduleStyles from './world-tab.module.scss';

// The editor draws the grid at this overall size when there's room; cells
// shrink as the visible extent grows.
const GRID_PIXELS = 528;
// Short windows shrink the grid to fit, down to this; below it the tab
// scrolls instead (cells get too small to paint).
const MIN_GRID_PIXELS = 320;

// Rendered against a scene that has no world yet; never painted through.
const EMPTY_GRID = createEmptyWorld().grid;

// Number keys 1-9 pick the first nine palette items from anywhere in the
// tab; 0 picks Erase.
const SHORTCUT_COUNT = 9;
const ERASE_SHORTCUT = '0';

// A palette press that travels this far is a drag onto the grid, not a tap.
const DRAG_START_PX = 6;

// Palette items and the gap between them; the stylesheet reads these as
// custom properties.
const PALETTE_ITEM_PX = 64;
const PALETTE_GAP_PX = 8;

/** Items per palette column for the room available, at least one. */
export function paletteItemsPerColumn(height: number): number {
  return Math.max(
    1,
    Math.floor((height + PALETTE_GAP_PX) / (PALETTE_ITEM_PX + PALETTE_GAP_PX))
  );
}

/** The grid element's box in viewport pixels; `border` is inside it. */
export interface GridBox {
  left: number;
  top: number;
  width: number;
  height: number;
  border: number;
}

/** The side of one cell inside the box. */
export function cellSide(box: GridBox, sceneSize: number): number {
  return (box.width - 2 * box.border) / sceneSize;
}

/** The grid cell under a viewport point, or null off the grid. */
export function cellAtPoint(
  box: GridBox,
  sceneSize: number,
  x: number,
  y: number
): {row: number; col: number} | null {
  if (
    x < box.left ||
    y < box.top ||
    x >= box.left + box.width ||
    y >= box.top + box.height
  ) {
    return null;
  }
  const cell = cellSide(box, sceneSize);
  const clamp = (n: number) => Math.min(Math.max(n, 0), sceneSize - 1);
  return {
    row: clamp(Math.floor((y - box.top - box.border) / cell)),
    col: clamp(Math.floor((x - box.left - box.border) / cell)),
  };
}

// Arrow key -> cursor step, as [rows, columns].
const ARROW_STEPS: Record<string, [number, number] | undefined> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

interface WorldRowProps {
  row: number;
  sceneSize: number;
  /** This row of the grid; identity changes only when a paint lands. */
  cells?: (WorldCell | null)[];
  thumbsByImage: ReadonlyMap<string, string | undefined>;
  /** The cursor's column while it is on this row; -1 otherwise. */
  cursorCol: number;
  lockedKinds: ReadonlySet<Kind>;
  placeOne: boolean;
  /** The item a press would place, for the cells that would refuse it. */
  item: WorldCell | null;
  registerCell: (
    row: number,
    col: number,
    el: HTMLButtonElement | null
  ) => void;
  onCellPointerDown: (
    event: React.PointerEvent<HTMLButtonElement>,
    row: number,
    col: number
  ) => void;
  onCellPointerEnter: (
    event: React.PointerEvent<HTMLButtonElement>,
    row: number,
    col: number
  ) => void;
  onCellClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    row: number,
    col: number
  ) => void;
}

// Memoized: an arrow-key cursor move re-renders the row it left and the row
// it entered, not every cell on the board (24x24 worlds at key-repeat rate).
const WorldRow = React.memo<WorldRowProps>(
  ({
    row,
    sceneSize,
    cells,
    thumbsByImage,
    cursorCol,
    lockedKinds,
    placeOne,
    item,
    registerCell,
    onCellPointerDown,
    onCellPointerEnter,
    onCellClick,
  }) => (
    <div role="row" className={moduleStyles.worldRow}>
      {Array.from({length: sceneSize}, (_, col) => {
        const cell = cells?.[col];
        const thumb = cell ? thumbsByImage.get(cell.image) : undefined;
        const refusal = cellRefusal(cell, lockedKinds, placeOne, item);
        return (
          <button
            key={col}
            ref={el => registerCell(row, col, el)}
            type="button"
            role="gridcell"
            tabIndex={col === cursorCol ? 0 : -1}
            className={classNames(
              moduleStyles.worldCell,
              refusal && moduleStyles.worldCellBlocked
            )}
            onPointerDown={event => onCellPointerDown(event, row, col)}
            onPointerEnter={event => onCellPointerEnter(event, row, col)}
            onClick={event => onCellClick(event, row, col)}
          >
            {/* Hidden text, not aria-label: VoiceOver appends "blank" on
                every focus move to an element whose name has no backing
                content. */}
            <span className={moduleStyles.srOnly}>
              {cell
                ? `${cell.image}, ${cell.kind}${
                    refusal === 'stays' ? ', stays' : ''
                  }`
                : 'empty'}
            </span>
            {thumb && <img src={thumb} alt="" />}
          </button>
        );
      })}
    </div>
  )
);
WorldRow.displayName = 'WorldRow';

// Bubble goes beside the item so the items below it stay readable.
const PaletteTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  // Closes the bubble and keeps it closed: during a drag from the item it
  // would hang over the grid the item is heading for.
  suppress?: boolean;
  children: React.ReactElement;
}> = ({tooltipId, text, suppress = false, children}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (suppress) {
      setOpen(false);
    }
  }, [suppress]);

  // A window that loses focus never gets the mouseleave, so the bubble stays
  // up. Skip a focused trigger: closing here would block its next focus-show.
  useEffect(() => {
    const hide = () => {
      const trigger = document.activeElement;
      if (trigger?.getAttribute('aria-describedby') === tooltipId) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener('blur', hide);
    return () => window.removeEventListener('blur', hide);
  }, [tooltipId]);

  return (
    <Tooltip
      id={tooltipId}
      title={text}
      placement="right"
      open={open && !suppress}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      leaveDelay={10}
      disableInteractive
    >
      {children}
    </Tooltip>
  );
};

interface PaletteItem extends WorldCell {
  thumb?: string;
}

// The cell kind an image type places: tiles by their own kind, anything
// else as a sprite.
function cellKind(type: ImageType): Kind {
  return type === 'block' || type === 'ladder' ? type : 'sprite';
}

// What the palette can choose: a placeable cell, or the eraser.
type PaletteSelection = WorldCell | 'erase';

type Kind = WorldCell['kind'];

type Refusal = 'stays' | 'taken';
/** What a change to a cell did, for narration. */
type Change = 'placed' | 'removed' | Refusal | null;

/** Why a held cell refuses a change, or null: a kind the palette does not
    offer stays (nothing could put it back); placing one thing, a held cell
    is taken for any other item. */
export function cellRefusal(
  cell: WorldCell | null | undefined,
  lockedKinds: ReadonlySet<Kind>,
  placeOne: boolean,
  item: WorldCell | null
): Refusal | null {
  if (!cell) {
    return null;
  }
  if (lockedKinds.has(cell.kind)) {
    return 'stays';
  }
  if (placeOne && item && item.image !== cell.image) {
    return 'taken';
  }
  return null;
}

interface WorldTabProps {
  world?: World;
  // Cells per side of the playfield. Storage is larger, so placements keep
  // their coordinates if it ever grows.
  sceneSize: number;
  // Cell-level so the owner can apply it atomically against saved sources.
  onPaintCell: (row: number, col: number, cell: WorldCell | null) => void;
  // Shown with nothing to place; the owner knows where images come from.
  emptyMessage: string;
  // The one image the palette offers: a world level's image of its kind.
  only?: string;
  // Present when the level places one thing (level_mode.placeOne): no Erase,
  // the image goes on an empty cell, and choosing another cell moves it there.
  onMoveCell?: (row: number, col: number, cell: WorldCell) => void;
  // Palette selection, owned by the view so it survives tab switches (this
  // component unmounts when the tab is hidden).
  selected: PaletteSelection | null;
  onSelect: (selection: PaletteSelection) => void;
}

/**
 * The World tab (experiment): paint starter sprites and blocks onto the
 * scene's grid from the project's images, instead of placing them with
 * code. The scene spawns the world's top-left corner when it runs.
 *
 * Pointer model: tap an item, then tap or drag-paint cells; or drag an item
 * from the palette straight onto a cell.
 *
 * Keyboard model: the palette and the grid are one tab stop each. In the
 * palette, arrow keys move and choose (radio-style); in the grid, arrow
 * keys move a cursor, Enter or Space places or removes the chosen item,
 * and holding either while moving keeps painting. Number keys choose an
 * item from anywhere in the tab.
 */
const WorldTab: React.FunctionComponent<WorldTabProps> = ({
  world,
  sceneSize,
  onPaintCell,
  emptyMessage,
  only,
  onMoveCell,
  selected,
  onSelect,
}) => {
  const placeOne = !!onMoveCell;
  const animationList = useAppSelector(state => state.animationList);
  // Thumbnails prefer the engine's trimmed image (a sprite sheet's is its
  // first frame; the raw sheet would show every frame side by side). Trims
  // land as the engine preloads; re-render when they do.
  const [trimVersion, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);
  // Every image a cell can hold; the grid draws them all, whatever the
  // palette offers.
  const placeable: PaletteItem[] = useMemo(
    () =>
      animationList.orderedKeys
        .map(key => animationList.propsByKey[key])
        .filter(props => !props.categories?.includes(BACKGROUNDS_CATEGORY))
        .map(props => ({
          image: props.name,
          kind: cellKind(imageTypeFromCategories(props.categories)),
          thumb:
            getImageThumbnail(props.name) || props.dataURI || props.sourceUrl,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationList, trimVersion]
  );
  const palette = useMemo(
    () => placeable.filter(item => !only || item.image === only),
    [placeable, only]
  );
  const thumbsByImage = useMemo(
    () => new Map(placeable.map(item => [item.image, item.thumb])),
    [placeable]
  );
  const lockedKinds = useMemo(() => {
    const offered = new Set(palette.map(item => item.kind));
    return new Set<Kind>(
      (['block', 'sprite', 'ladder'] as const).filter(
        kind => !offered.has(kind)
      )
    );
  }, [palette]);
  // The palette plus Erase, in keyboard order. Placing one thing has no
  // Erase: choosing its cell again removes it.
  const selections: PaletteSelection[] = useMemo(
    () => [
      ...palette.map(item => ({image: item.image, kind: item.kind})),
      ...(placeOne ? [] : ['erase' as const]),
    ],
    [palette, placeOne]
  );
  // A selection can outlive its image (deleted or recategorized on the
  // Images tab — the reference scrub covers cells and blocks, not this);
  // one the palette no longer offers counts as no selection.
  const effectiveSelected =
    (selected === 'erase' && !placeOne) ||
    (selected &&
      selected !== 'erase' &&
      palette.some(item => item.image === selected.image))
      ? selected
      : null;
  const selectedIndex =
    effectiveSelected === 'erase'
      ? selections.length - 1
      : effectiveSelected
      ? palette.findIndex(item => item.image === effectiveSelected.image)
      : -1;

  const grid = world?.grid ?? EMPTY_GRID;

  // Screen-reader narration for actions whose visible result is a silent
  // DOM change (placements, removals, number-key choices). A no-break
  // space alternates onto repeated messages so they re-announce.
  const [announced, setAnnounced] = useState('');
  const announce = (message: string) =>
    setAnnounced(current =>
      current === message ? `${message}\u00a0` : message
    );

  const selectionLabel = (selection: PaletteSelection) =>
    selection === 'erase' ? 'Erase' : selection.image;

  const choose = (selection: PaletteSelection) => {
    onSelect(selection);
    announce(`${selectionLabel(selection)} chosen.`);
  };

  const changeCell = (
    row: number,
    col: number,
    next: WorldCell | null
  ): Change => {
    const held = grid[row]?.[col];
    const refusal = cellRefusal(held, lockedKinds, placeOne, next);
    if (refusal) {
      return refusal;
    }
    if (!next) {
      if (!held) {
        return null;
      }
      if (placeOne && !palette.some(item => item.image === held.image)) {
        return null;
      }
      onPaintCell(row, col, null);
      return 'removed';
    }
    if (onMoveCell) {
      if (held) {
        return 'taken';
      }
      onMoveCell(row, col, next);
    } else {
      onPaintCell(row, col, next);
    }
    return 'placed';
  };
  const announceResult = (did: Change, image: string) => {
    if (did === 'placed') {
      announce(`${image} placed.`);
    } else if (did === 'removed') {
      announce('Removed.');
    } else if (did === 'taken') {
      announce('That square is taken.');
    } else if (did === 'stays') {
      announce('That one stays.');
    }
  };
  const paintCell = (row: number, col: number, erase: boolean): Change => {
    if (!effectiveSelected) {
      return null;
    }
    return changeCell(
      row,
      col,
      erase || effectiveSelected === 'erase'
        ? null
        : {image: effectiveSelected.image, kind: effectiveSelected.kind}
    );
  };
  // A press on a tile already holding the selected item erases instead
  // (click-again-to-remove). The pressed tile decides for the whole drag
  // stroke, so dragging across painted tiles doesn't toggle them.
  const strokeErase = useRef(false);
  // A stroke lasts from a press on a cell to the release, so a pointer that
  // crosses cells for another reason (a drag from the palette) paints nothing.
  const strokeActive = useRef(false);
  useEffect(() => {
    const end = () => (strokeActive.current = false);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
    };
  }, []);
  const startStroke = (row: number, col: number) => {
    strokeErase.current =
      effectiveSelected !== 'erase' &&
      grid[row]?.[col]?.image === effectiveSelected?.image;
    return paintCell(row, col, strokeErase.current);
  };

  // The grid is one tab stop: this cell carries tabIndex 0 and the arrow
  // keys move it. Pointer presses move it too, so keyboard use resumes
  // from wherever the mouse left off.
  const [cursor, setCursor] = useState({row: 0, col: 0});
  // Clamped against the live extent: the playfield can shrink (the corner
  // mode), and the grid must keep exactly one tab stop.
  const cursorRow = Math.min(cursor.row, sceneSize - 1);
  const cursorCol = Math.min(cursor.col, sceneSize - 1);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const moveCursor = (rowDelta: number, colDelta: number) => {
    const row = Math.min(Math.max(cursorRow + rowDelta, 0), sceneSize - 1);
    const col = Math.min(Math.max(cursorCol + colDelta, 0), sceneSize - 1);
    setCursor({row, col});
    cellRefs.current.get(`${row}-${col}`)?.focus();
    return {row, col};
  };

  // Whether Enter or Space is down, for drag-paint (see the component
  // note). A swallowed keyup — window blur mid-hold — must not leave the
  // key stuck down.
  const paintKeyHeld = useRef(false);
  const isPaintKey = (key: string) => key === 'Enter' || key === ' ';
  useEffect(() => {
    const release = () => (paintKeyHeld.current = false);
    window.addEventListener('blur', release);
    return () => window.removeEventListener('blur', release);
  }, []);

  // 1-9 and 0 work from the grid and the palette alike, so an item can be
  // swapped without leaving the grid; the palette passes focusAndChoose so
  // the checked radio stays the group's tab stop.
  const handleShortcutKey = (
    event: React.KeyboardEvent,
    chooseAt: (index: number) => void = index => choose(selections[index])
  ): boolean => {
    // Browser chords (tab switching, zoom reset) must not also select.
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    if (event.key >= '1' && Number(event.key) <= SHORTCUT_COUNT) {
      const index = Number(event.key) - 1;
      if (index < palette.length) {
        chooseAt(index);
      }
      return true;
    }
    if (event.key === ERASE_SHORTCUT && !placeOne) {
      chooseAt(selections.length - 1);
      return true;
    }
    return false;
  };

  const activateCellByKeyboard = (row: number, col: number) => {
    if (!effectiveSelected) {
      announce(
        placeOne
          ? 'Choose an item first: press 1 to 9.'
          : 'Choose an item first: press 1 to 9, or 0 for Erase.'
      );
      return;
    }
    announceResult(
      startStroke(row, col),
      effectiveSelected === 'erase' ? '' : effectiveSelected.image
    );
  };

  const handleGridKeyDown = (event: React.KeyboardEvent) => {
    if (handleShortcutKey(event)) {
      // The stroke's mode belongs to the old choice; end it.
      paintKeyHeld.current = false;
      return;
    }
    if (isPaintKey(event.key)) {
      // Handled here, not by the button: native activation would auto-repeat
      // while held, toggling the cell on and off.
      event.preventDefault();
      if (!event.repeat) {
        activateCellByKeyboard(cursorRow, cursorCol);
        paintKeyHeld.current = true;
      }
      return;
    }
    const step = ARROW_STEPS[event.key];
    if (step) {
      event.preventDefault();
      const {row, col} = moveCursor(step[0], step[1]);
      // No painting along the way when placing one thing: it would drag along.
      if (paintKeyHeld.current && selected && !placeOne) {
        paintCell(row, col, strokeErase.current);
      }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      paintKeyHeld.current = false;
      // Nothing on an empty cell: clearing it would stream "Removed." on key
      // repeat and restart the preview.
      announceResult(changeCell(cursorRow, cursorCol, null), '');
      return;
    }
    paintKeyHeld.current = false;
  };

  const handleGridKeyUp = (event: React.KeyboardEvent) => {
    if (isPaintKey(event.key)) {
      paintKeyHeld.current = false;
    }
  };

  // The memoized rows need stable handlers; these read the live logic
  // through a ref, assigned after every commit.
  const latest = useRef({startStroke, paintCell, activateCellByKeyboard});
  useEffect(() => {
    latest.current = {startStroke, paintCell, activateCellByKeyboard};
  });
  const registerCell = useCallback(
    (row: number, col: number, el: HTMLButtonElement | null) => {
      const key = `${row}-${col}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    },
    []
  );
  const handleCellPointerDown = useCallback(
    (
      event: React.PointerEvent<HTMLButtonElement>,
      row: number,
      col: number
    ) => {
      // Touch implicitly captures the pointer on the pressed cell, which
      // would keep drag painting's enter events from the neighbors.
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      // Keyboard use resumes from the pressed cell. The explicit focus is
      // for Safari and macOS Firefox, which don't focus a pressed button.
      event.currentTarget.focus();
      setCursor({row, col});
      strokeActive.current = true;
      latest.current.startStroke(row, col);
    },
    []
  );
  const handleCellPointerEnter = useCallback(
    (
      event: React.PointerEvent<HTMLButtonElement>,
      row: number,
      col: number
    ) => {
      // No drag painting when placing one thing: it would drag along.
      if (strokeActive.current && !placeOne) {
        latest.current.paintCell(row, col, strokeErase.current);
      }
    },
    [placeOne]
  );
  // Physical Enter and Space are handled in keydown; a detail-0 click is
  // assistive tech activating the cell without key events.
  const handleCellClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, row: number, col: number) => {
      if (event.detail === 0) {
        latest.current.activateCellByKeyboard(row, col);
      }
    },
    []
  );

  // Radio-style palette: one tab stop, arrows move AND choose. The palette
  // fills columns top to bottom, so Left and Right step by a column and a
  // wrapped palette walks as the grid it looks like.
  const paletteRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusAndChoose = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), selections.length - 1);
    paletteRefs.current[clamped]?.focus();
    choose(selections[clamped]);
  };
  const handlePaletteKeyDown = (event: React.KeyboardEvent) => {
    if (handleShortcutKey(event, focusAndChoose)) {
      return;
    }
    if (!(event.key in ARROW_STEPS)) {
      return;
    }
    const count = selections.length;
    const focusedIndex = paletteRefs.current.findIndex(
      el => el === document.activeElement
    );
    const current =
      focusedIndex >= 0 ? focusedIndex : Math.max(selectedIndex, 0);
    const perColumn = paletteRows;
    let next = -1;
    if (event.key === 'ArrowDown') {
      next = (current + 1) % count;
    } else if (event.key === 'ArrowUp') {
      next = (current - 1 + count) % count;
    } else if (event.key === 'ArrowRight' && current + perColumn < count) {
      next = current + perColumn;
    } else if (event.key === 'ArrowLeft' && current - perColumn >= 0) {
      next = current - perColumn;
    }
    if (next >= 0) {
      event.preventDefault();
      focusAndChoose(next);
    }
  };

  const shortcutFor = (index: number) =>
    index < SHORTCUT_COUNT ? `${index + 1}` : undefined;

  // Shrink the grid to the room beside the palette: full size when it fits,
  // floored so cells stay paintable. The same height sets the palette's
  // rows; CSS auto-fill would size the palette's width before its height
  // and come out a column too wide.
  const gridAreaRef = useRef<HTMLDivElement | null>(null);
  const [gridPixels, setGridPixels] = useState(GRID_PIXELS);
  const [areaHeight, setAreaHeight] = useState(0);
  useEffect(() => {
    const area = gridAreaRef.current;
    if (!area) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setGridPixels(
        Math.max(
          MIN_GRID_PIXELS,
          Math.min(GRID_PIXELS, area.clientHeight, area.clientWidth)
        )
      );
      setAreaHeight(area.clientHeight);
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const cellPixels = gridPixels / sceneSize;
  // Unmeasured, the palette is one column; empty, it keeps one cell's shape.
  const paletteRows = Math.max(
    1,
    areaHeight
      ? Math.min(paletteItemsPerColumn(areaHeight), selections.length)
      : selections.length
  );
  const paletteColumns = Math.max(
    1,
    Math.ceil(selections.length / paletteRows)
  );
  const paletteStyle = {
    '--palette-item': `${PALETTE_ITEM_PX}px`,
    '--palette-gap': `${PALETTE_GAP_PX}px`,
    gridTemplateRows: `repeat(${paletteRows}, ${PALETTE_ITEM_PX}px)`,
    width:
      paletteColumns * PALETTE_ITEM_PX + (paletteColumns - 1) * PALETTE_GAP_PX,
  } as React.CSSProperties;

  // Dragging an item from the palette onto a cell. The moves and the
  // release are read on window, whichever element the pointer is over. The
  // grid's box is read once, when the press becomes a drag.
  const gridRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    item: PaletteItem;
    pointerId: number;
    startX: number;
    startY: number;
    /** Set once the press has travelled far enough to be a drag. */
    grid: GridBox | null;
    stop: () => void;
  } | null>(null);
  const [dragging, setDragging] = useState<PaletteItem | null>(null);
  // A drop chooses the item itself; the release's click must not narrate a
  // second choice. A touch drag ends with no click, so the press clears it.
  const clickAfterDrop = useRef(false);
  const gridBox = (): GridBox | null => {
    const grid = gridRef.current;
    if (!grid) {
      return null;
    }
    const rect = grid.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      border: grid.clientLeft,
    };
  };
  const moveGhost = (grid: GridBox, x: number, y: number) => {
    const ghost = ghostRef.current;
    if (!ghost) {
      return;
    }
    const side = cellSide(grid, sceneSize);
    const target = cellAtPoint(grid, sceneSize, x, y);
    const left = target
      ? grid.left + grid.border + target.col * side
      : x - side / 2;
    const top = target
      ? grid.top + grid.border + target.row * side
      : y - side / 2;
    ghost.style.transform = `translate(${left}px, ${top}px)`;
    ghost.style.width = `${side}px`;
    ghost.style.height = `${side}px`;
  };
  const endDrag = () => {
    dragRef.current?.stop();
    dragRef.current = null;
    setDragging(null);
  };
  useEffect(() => endDrag, []);
  const handlePalettePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    item: PaletteItem
  ) => {
    clickAfterDrop.current = false;
    if (event.button !== 0 || dragRef.current) {
      return;
    }
    const {pointerId} = event;
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) {
        return;
      }
      if (!drag.grid) {
        const distance = Math.hypot(
          e.clientX - drag.startX,
          e.clientY - drag.startY
        );
        if (distance < DRAG_START_PX) {
          return;
        }
        drag.grid = gridBox();
        if (!drag.grid) {
          endDrag();
          return;
        }
        setDragging(drag.item);
      }
      moveGhost(drag.grid, e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) {
        return;
      }
      const target =
        drag.grid && cellAtPoint(drag.grid, sceneSize, e.clientX, e.clientY);
      endDrag();
      if (!target) {
        return;
      }
      const cell = {image: drag.item.image, kind: drag.item.kind};
      onSelect(cell);
      clickAfterDrop.current = true;
      if (grid[target.row]?.[target.col]?.image === cell.image) {
        announce(`${cell.image} is already there.`);
        return;
      }
      announceResult(changeCell(target.row, target.col, cell), cell.image);
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId === dragRef.current?.pointerId) {
        endDrag();
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    dragRef.current = {
      item,
      pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grid: null,
      stop: () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      },
    };
  };
  return (
    <div
      className={moduleStyles.worldTab}
      style={{paddingRight: PREVIEW_CLEARANCE}}
    >
      <div
        role="radiogroup"
        aria-label="Items to place"
        // Focus lives on the items (roving tabindex); the container is only
        // a programmatic target.
        tabIndex={-1}
        className={moduleStyles.worldPalette}
        style={paletteStyle}
        onKeyDown={handlePaletteKeyDown}
      >
        {palette.map((item, index) => (
          <PaletteTooltip
            key={item.image}
            tooltipId={`world-palette-${index}`}
            suppress={dragging?.image === item.image}
            text={
              shortcutFor(index)
                ? `${item.image}, ${item.kind} (${shortcutFor(index)})`
                : `${item.image}, ${item.kind}`
            }
          >
            <button
              ref={el => (paletteRefs.current[index] = el)}
              type="button"
              role="radio"
              aria-checked={selectedIndex === index}
              aria-keyshortcuts={shortcutFor(index)}
              tabIndex={index === Math.max(selectedIndex, 0) ? 0 : -1}
              className={classNames(
                moduleStyles.worldPaletteItem,
                selectedIndex === index && moduleStyles.worldPaletteSelected
              )}
              // The explicit focus is for Safari and macOS Firefox, which
              // don't focus a pressed button; the roving tab stop follows
              // the selection and must not part from focus.
              onClick={event => {
                event.currentTarget.focus();
                if (clickAfterDrop.current) {
                  clickAfterDrop.current = false;
                  return;
                }
                choose(selections[index]);
              }}
              onPointerDown={event => handlePalettePointerDown(event, item)}
            >
              <span className={moduleStyles.srOnly}>
                {item.image}, {item.kind}
              </span>
              {item.thumb && <img src={item.thumb} alt="" draggable={false} />}
            </button>
          </PaletteTooltip>
        ))}
        {/* With no images left, Erase is still the only way a pointer user
            can clear placed cells; only placing one thing does without it. */}
        {!placeOne && (
          <PaletteTooltip
            tooltipId="world-palette-erase"
            text={`Erase (${ERASE_SHORTCUT})`}
          >
            <button
              ref={el => (paletteRefs.current[palette.length] = el)}
              type="button"
              role="radio"
              aria-checked={effectiveSelected === 'erase'}
              aria-keyshortcuts={ERASE_SHORTCUT}
              tabIndex={Math.max(selectedIndex, 0) === palette.length ? 0 : -1}
              className={classNames(
                moduleStyles.worldPaletteItem,
                moduleStyles.worldPaletteErase,
                effectiveSelected === 'erase' &&
                  moduleStyles.worldPaletteSelected
              )}
              onClick={event => {
                event.currentTarget.focus();
                choose('erase');
              }}
            >
              <FontAwesomeV6Icon iconName="eraser" />
              Erase
            </button>
          </PaletteTooltip>
        )}
      </div>
      <p id="world-grid-help" className={moduleStyles.srOnly}>
        {placeOne
          ? 'Arrow keys move around the grid. Enter or Space puts the chosen item on an empty cell, or moves it there; on its own cell, it removes it. Delete removes it. Number keys 1 to 9 choose an item.'
          : 'Arrow keys move around the grid. Enter or Space places the chosen item, or removes it if the cell already holds it; hold the key down and move to keep painting. Delete clears the cell. Number keys 1 to 9 choose an item; 0 chooses Erase.'}
      </p>
      <div className={moduleStyles.worldGridColumn}>
        {!palette.length && (
          <p className={moduleStyles.worldEmpty}>{emptyMessage}</p>
        )}
        <div ref={gridAreaRef} className={moduleStyles.worldGridArea}>
          <div
            ref={gridRef}
            role="grid"
            aria-label="World"
            aria-describedby="world-grid-help"
            // Focus lives on the cursor cell (roving tabindex).
            tabIndex={-1}
            className={moduleStyles.worldGrid}
            style={{'--world-cell': `${cellPixels}px`} as React.CSSProperties}
            onKeyDown={handleGridKeyDown}
            onKeyUp={handleGridKeyUp}
          >
            {Array.from({length: sceneSize}, (_, row) => (
              <WorldRow
                lockedKinds={lockedKinds}
                placeOne={placeOne}
                item={
                  effectiveSelected && effectiveSelected !== 'erase'
                    ? effectiveSelected
                    : null
                }
                key={row}
                row={row}
                sceneSize={sceneSize}
                cells={grid[row]}
                thumbsByImage={thumbsByImage}
                cursorCol={row === cursorRow ? cursorCol : -1}
                registerCell={registerCell}
                onCellPointerDown={handleCellPointerDown}
                onCellPointerEnter={handleCellPointerEnter}
                onCellClick={handleCellClick}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Always mounted, so the first move of a drag has it to place; sized
          and placed by moveGhost. */}
      <img
        ref={ghostRef}
        src={dragging?.thumb}
        alt=""
        aria-hidden
        className={moduleStyles.worldDragGhost}
        style={{display: dragging ? 'block' : 'none'}}
      />
      <div aria-live="polite" className={moduleStyles.srOnly}>
        {announced}
      </div>
    </div>
  );
};

export default WorldTab;
