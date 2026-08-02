// Which cell of a spritesheet a frame draws.
//
// This was one canvas with a click handler on it: a picture nothing could focus,
// nothing could operate from a keyboard, and a screen reader read as nothing at
// all — the frame's picture and its timing were reachable and the one control
// that says WHICH of six drawings it is was not.
//
// So the cells are buttons. One radio group, one tab stop, arrows to move
// through it — the grid pattern rather than six stops in a row, because a sheet
// is laid out in two dimensions and Down should mean the row below. Selection
// follows focus, which for a radio group is the expected behaviour and here is
// also the useful one: arrowing along a strip plays the frames past you.

import {useRef} from 'react';

import type {SheetFile} from '../appearance/sheetFile';

import styles from './cellPicker.module.css';
import {CellThumb} from './CellThumb';
import cellStyles from './cellThumb.module.css';
import {type CellRect, cellIndex, sheetCells, sheetGrid} from './sheetFrames';

/** Cells are drawn at 2×, as everywhere else in this editor. */
const SCALE = 2;

export interface CellPickerProps {
  /** The sheet image, decoded. Nothing is drawn until it has arrived. */
  image: HTMLImageElement | undefined;
  /** How the image is cut up (appearance/sheetFile). */
  sheet: SheetFile;
  /** The rectangle the frame draws now. */
  selected: CellRect | undefined;
  disabled: boolean;
  onPick: (cell: CellRect) => void;
}

export const CellPicker = ({
  image,
  sheet,
  selected,
  disabled,
  onPick,
}: CellPickerProps) => {
  const cells = sheetCells(image, sheet);
  const {columns} = sheetGrid(image, sheet);
  const chosen = cellIndex(cells, selected);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  if (!image || cells.length === 0) {
    return null;
  }

  /** Move to a cell: focus it and take it, the way a radio group does. */
  const goTo = (index: number): void => {
    const at = Math.min(cells.length - 1, Math.max(0, index));
    buttons.current[at]?.focus();
    onPick(cells[at]);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (disabled) {
      return;
    }
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index + columns,
      ArrowUp: index - columns,
      Home: 0,
      End: cells.length - 1,
    };
    const to = moves[event.key];
    if (to === undefined) {
      return;
    }
    // Up and down off the ends of the grid do nothing, rather than sliding
    // along the row: a sheet is a picture, and its edges are where it stops.
    if (to < 0 || to >= cells.length) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    goTo(to);
  };

  // The one tab stop: whichever cell is taken, or the first when none is.
  const stop = chosen >= 0 ? chosen : 0;

  return (
    <div className={styles.cellPicker}>
      <span className={styles.cellHint} id="cell-picker-label">
        Cell:
      </span>
      {/* Scrolls in its own box — a sheet is as wide as it is, and wider than
          this pane once it holds more than a few cells. */}
      <div className={styles.scroll}>
        <div
          className={styles.grid}
          role="radiogroup"
          aria-labelledby="cell-picker-label"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, columns)}, max-content)`,
          }}
        >
          {cells.map((cell, index) => (
            <button
              key={index}
              type="button"
              ref={element => {
                buttons.current[index] = element;
              }}
              className={
                index === chosen
                  ? `${cellStyles.cellButton} ${cellStyles.cellChosen}`
                  : cellStyles.cellButton
              }
              role="radio"
              aria-checked={index === chosen}
              aria-label={`Cell ${index + 1}`}
              tabIndex={index === stop ? 0 : -1}
              disabled={disabled}
              onClick={() => onPick(cell)}
              onKeyDown={event => onKeyDown(event, index)}
            >
              <CellThumb image={image} cell={cell} scale={SCALE} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
