import {
  WithTooltip,
  WithTooltipHandle,
} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';
import {createEmptyWorld, World, WorldCell} from '../world';

import {PREVIEW_CLEARANCE} from './Playspace';

import moduleStyles from './world-tab.module.scss';

// The editor draws the grid at this overall size when there's room; cells
// shrink as the visible extent grows.
const GRID_PIXELS = 528;
// Short windows shrink the grid to fit, down to this; below it the tab
// scrolls instead (cells get too small to paint).
const MIN_GRID_PIXELS = 320;

// Number keys 1-9 pick the first nine palette items from anywhere in the
// tab; 0 picks Erase.
const SHORTCUT_COUNT = 9;
const ERASE_SHORTCUT = '0';

// Arrow key -> cursor step, as [rows, columns].
const ARROW_STEPS: Record<string, [number, number] | undefined> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

// WithTooltip preconfigured for the palette: a small bubble below the item,
// so the next item to the right stays readable while it shows.
const PaletteTooltip: React.FunctionComponent<{
  tooltipId: string;
  text: string;
  children: React.ReactNode;
}> = ({tooltipId, text, children}) => {
  const handleRef = useRef<WithTooltipHandle>(null);

  // A window that loses focus never gets the mouseleave, so a hover
  // bubble would stay up until the next hover — hide it on window blur.
  // Skip when the trigger itself is focused: that bubble hides when the
  // trigger blurs, and hiding it here would block its next focus-show.
  useEffect(() => {
    const hide = () => {
      const trigger = document.activeElement;
      if (trigger?.getAttribute('aria-describedby') === tooltipId) {
        return;
      }
      handleRef.current?.hideTooltip();
    };
    window.addEventListener('blur', hide);
    return () => window.removeEventListener('blur', hide);
  }, [tooltipId]);

  return (
    <WithTooltip
      ref={handleRef}
      tooltipProps={{
        tooltipId,
        text,
        size: 's',
        direction: 'onBottom',
      }}
      hideDelayMs={10}
      hideOnFirstLeave={true}
    >
      {children}
    </WithTooltip>
  );
};

interface PaletteItem extends WorldCell {
  thumb?: string;
}

// What the palette can choose: a placeable cell, or the eraser.
type PaletteSelection = WorldCell | 'erase';

interface WorldTabProps {
  world?: World;
  // Cells per side of the playfield. Storage is larger, so placements keep
  // their coordinates if it ever grows.
  sceneSize: number;
  // Cell-level so the owner can apply it atomically against saved sources.
  onPaintCell: (row: number, col: number, cell: WorldCell | null) => void;
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
  selected,
  onSelect,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  const palette: PaletteItem[] = useMemo(
    () =>
      animationList.orderedKeys
        .map(key => animationList.propsByKey[key])
        .filter(props => !props.categories?.includes(BACKGROUNDS_CATEGORY))
        .map(props => ({
          image: props.name,
          kind: props.categories?.includes(BLOCKS_CATEGORY)
            ? ('block' as const)
            : ('sprite' as const),
          thumb: props.dataURI || props.sourceUrl,
        })),
    [animationList]
  );
  const thumbsByImage = useMemo(
    () => new Map(palette.map(item => [item.image, item.thumb])),
    [palette]
  );
  // The palette plus Erase, in keyboard order.
  const selections: PaletteSelection[] = useMemo(
    () => [
      ...palette.map(item => ({image: item.image, kind: item.kind})),
      'erase' as const,
    ],
    [palette]
  );
  const selectedIndex =
    selected === 'erase'
      ? selections.length - 1
      : selected
      ? palette.findIndex(item => item.image === selected.image)
      : -1;

  const grid = world?.grid ?? createEmptyWorld().grid;

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

  // Returns what the press did, so keyboard activation can narrate it.
  const paintCell = (
    row: number,
    col: number,
    erase: boolean
  ): 'placed' | 'removed' | null => {
    if (!selected) {
      return null;
    }
    const erasing = erase || selected === 'erase';
    onPaintCell(
      row,
      col,
      erasing ? null : {image: selected.image, kind: selected.kind}
    );
    return erasing ? 'removed' : 'placed';
  };
  // A press on a tile already holding the selected item erases instead
  // (click-again-to-remove). The pressed tile decides for the whole drag
  // stroke, so dragging across painted tiles doesn't toggle them.
  const strokeErase = useRef(false);
  const startStroke = (row: number, col: number) => {
    strokeErase.current =
      selected !== 'erase' && grid[row]?.[col]?.image === selected?.image;
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
  // swapped without leaving the grid.
  const handleShortcutKey = (event: React.KeyboardEvent): boolean => {
    if (event.key >= '1' && event.key <= '9') {
      const index = Number(event.key) - 1;
      if (index < palette.length) {
        choose(selections[index]);
      }
      return true;
    }
    if (event.key === ERASE_SHORTCUT) {
      if (palette.length > 0) {
        choose('erase');
      }
      return true;
    }
    return false;
  };

  const activateCellByKeyboard = (row: number, col: number) => {
    if (!selected) {
      announce('Choose an item first: press 1 to 9, or 0 for Erase.');
      return;
    }
    const did = startStroke(row, col);
    if (did === 'placed' && selected !== 'erase') {
      announce(`${selected.image} placed.`);
    } else if (did === 'removed') {
      announce('Removed.');
    }
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
      if (paintKeyHeld.current && selected) {
        paintCell(row, col, strokeErase.current);
      }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      paintKeyHeld.current = false;
      onPaintCell(cursorRow, cursorCol, null);
      announce('Removed.');
      return;
    }
    paintKeyHeld.current = false;
  };

  const handleGridKeyUp = (event: React.KeyboardEvent) => {
    if (isPaintKey(event.key)) {
      paintKeyHeld.current = false;
    }
  };

  // Radio-style palette: one tab stop, arrows move AND choose. Up and Down
  // step by the measured items-per-row, so a wrapped palette walks as the
  // grid it looks like.
  const paletteRefs = useRef<(HTMLButtonElement | null)[]>([]);
  paletteRefs.current.length = selections.length;
  const focusAndChoose = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), selections.length - 1);
    paletteRefs.current[clamped]?.focus();
    choose(selections[clamped]);
  };
  const handlePaletteKeyDown = (event: React.KeyboardEvent) => {
    if (handleShortcutKey(event)) {
      return;
    }
    const count = selections.length;
    if (count === 0) {
      return;
    }
    const focusedIndex = paletteRefs.current.findIndex(
      el => el === document.activeElement
    );
    const current =
      focusedIndex >= 0 ? focusedIndex : Math.max(selectedIndex, 0);
    const items = paletteRefs.current;
    // Items before the first line wrap share the first item's top. Viewport
    // coordinates, because each item sits inside its own tooltip wrapper
    // and offsets within it are meaningless.
    const topOf = (el: HTMLButtonElement | null) =>
      el ? Math.round(el.getBoundingClientRect().top) : 0;
    let perRow = count;
    for (let i = 1; i < count; i++) {
      if (items[i] && topOf(items[i]) !== topOf(items[0])) {
        perRow = i;
        break;
      }
    }
    let next = -1;
    if (event.key === 'ArrowRight') {
      next = (current + 1) % count;
    } else if (event.key === 'ArrowLeft') {
      next = (current - 1 + count) % count;
    } else if (event.key === 'ArrowDown' && current + perRow < count) {
      next = current + perRow;
    } else if (event.key === 'ArrowUp' && current - perRow >= 0) {
      next = current - perRow;
    }
    if (next >= 0) {
      event.preventDefault();
      focusAndChoose(next);
    }
  };

  const shortcutFor = (index: number) =>
    index < SHORTCUT_COUNT ? `${index + 1}` : undefined;

  // Shrink the grid to the vertical room left after the palette (see
  // worldGridArea): full size when it fits, floored so cells stay paintable.
  const gridAreaRef = useRef<HTMLDivElement | null>(null);
  const [gridPixels, setGridPixels] = useState(GRID_PIXELS);
  useEffect(() => {
    const area = gridAreaRef.current;
    if (!area) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setGridPixels(
        Math.max(MIN_GRID_PIXELS, Math.min(GRID_PIXELS, area.clientHeight))
      );
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const cellPixels = gridPixels / sceneSize;
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
        onKeyDown={handlePaletteKeyDown}
      >
        {palette.map((item, index) => (
          <PaletteTooltip
            key={item.image}
            tooltipId={`world-palette-${index}`}
            text={
              shortcutFor(index)
                ? `${item.image} (${shortcutFor(index)})`
                : item.image
            }
          >
            <button
              ref={el => (paletteRefs.current[index] = el)}
              type="button"
              role="radio"
              aria-checked={selectedIndex === index}
              aria-label={`${item.image}, ${item.kind}`}
              aria-keyshortcuts={shortcutFor(index)}
              tabIndex={index === Math.max(selectedIndex, 0) ? 0 : -1}
              className={classNames(
                moduleStyles.worldPaletteItem,
                selectedIndex === index && moduleStyles.worldPaletteSelected
              )}
              onClick={() => choose(selections[index])}
            >
              {item.thumb && <img src={item.thumb} alt="" />}
            </button>
          </PaletteTooltip>
        ))}
        {palette.length > 0 && (
          <PaletteTooltip
            tooltipId="world-palette-erase"
            text={`Erase (${ERASE_SHORTCUT})`}
          >
            <button
              ref={el => (paletteRefs.current[palette.length] = el)}
              type="button"
              role="radio"
              aria-checked={selected === 'erase'}
              aria-keyshortcuts={ERASE_SHORTCUT}
              tabIndex={selectedIndex === selections.length - 1 ? 0 : -1}
              className={classNames(
                moduleStyles.worldPaletteItem,
                moduleStyles.worldPaletteErase,
                selected === 'erase' && moduleStyles.worldPaletteSelected
              )}
              onClick={() => choose('erase')}
            >
              Erase
            </button>
          </PaletteTooltip>
        )}
        {!palette.length && (
          <span className={moduleStyles.worldEmpty}>
            Create some images on the Images tab first.
          </span>
        )}
      </div>
      <p id="world-grid-help" className={moduleStyles.srOnly}>
        Arrow keys move around the grid. Enter or Space places the chosen item,
        or removes it if the cell already holds it; hold the key down and move
        to keep painting. Delete clears the cell. Number keys 1 to 9 choose an
        item; 0 chooses Erase.
      </p>
      <div ref={gridAreaRef} className={moduleStyles.worldGridArea}>
        <div
          role="grid"
          aria-label="World"
          aria-describedby="world-grid-help"
          // Focus lives on the cursor cell (roving tabindex).
          tabIndex={-1}
          className={moduleStyles.worldGrid}
          onKeyDown={handleGridKeyDown}
          onKeyUp={handleGridKeyUp}
        >
          {Array.from({length: sceneSize}, (_, row) => (
            <div key={row} role="row" className={moduleStyles.worldRow}>
              {Array.from({length: sceneSize}, (_, col) => {
                const cell = grid[row]?.[col];
                const thumb = cell && thumbsByImage.get(cell.image);
                return (
                  <button
                    key={`${row}-${col}`}
                    ref={el => {
                      if (el) {
                        cellRefs.current.set(`${row}-${col}`, el);
                      } else {
                        cellRefs.current.delete(`${row}-${col}`);
                      }
                    }}
                    type="button"
                    role="gridcell"
                    aria-rowindex={row + 1}
                    aria-colindex={col + 1}
                    aria-label={cell ? `${cell.image}, ${cell.kind}` : 'empty'}
                    tabIndex={row === cursorRow && col === cursorCol ? 0 : -1}
                    className={moduleStyles.worldCell}
                    style={{width: cellPixels, height: cellPixels}}
                    // Touch implicitly captures the pointer on the pressed cell,
                    // which would keep drag painting's enter events from the
                    // neighbors — release it.
                    onPointerDown={e => {
                      e.currentTarget.releasePointerCapture?.(e.pointerId);
                      // Keyboard use resumes from the pressed cell.
                      setCursor({row, col});
                      startStroke(row, col);
                    }}
                    onPointerEnter={e => {
                      if (e.buttons & 1) {
                        paintCell(row, col, strokeErase.current);
                      }
                    }}
                    // Physical Enter and Space are handled in keydown; a
                    // detail-0 click here is assistive tech activating the
                    // cell without key events.
                    onClick={e => {
                      if (e.detail === 0) {
                        activateCellByKeyboard(row, col);
                      }
                    }}
                  >
                    {thumb && <img src={thumb} alt="" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div aria-live="polite" className={moduleStyles.srOnly}>
        {announced}
      </div>
    </div>
  );
};

export default WorldTab;
