import {describeCellState} from '../../editing';
import type {MapDraft} from '../../editing';

import moduleStyles from './mapPainter.module.scss';

export interface MapPainterProps {
  rows: number;
  cols: number;
  /** The current map draft — read only for each cell's aria-label
   * (`describeCellState`), never mutated here. Undefined skips the
   * cell-state part of the label (dimensions alone still render the grid). */
  grid?: MapDraft;
  /** For `describeCellState` — which paint-tool labels apply to this
   * level's skin (a bee flower reads differently than a farmer's soil). */
  skinId?: string;
  /** Label of the currently selected paint tool (from the panel's
   * palette), for the cell buttons' accessible names — undefined means no
   * tool is selected, so a click is a no-op the label should say so. */
  selectedToolLabel?: string;
  onPaintCell: (row: number, col: number) => void;
}

/**
 * The stage half of map painting (Author Mode Pass B) — an HTML grid
 * overlay positioned over the maze SVG by Visualization's `overlay` slot,
 * one absolutely-sized `<button>` per tile. The svg carries
 * `viewBox="0 0 MAZE_WIDTH MAZE_HEIGHT"` with `style.width: 100%`
 * (Maze.ts), so this grid — `position: absolute; inset: 0` from its own
 * CSS, `display: grid` with one column/row per tile — lines up with it
 * exactly at any zoom, with no coordinate math here.
 *
 * The tool palette itself lives in the properties panel, not here (the
 * plan's UX decision): this component only knows "a cell was clicked",
 * not what to paint with — MazeLab looks up the selected tool and applies
 * it.
 */
export default function MapPainter({
  rows,
  cols,
  grid,
  skinId,
  selectedToolLabel,
  onPaintCell,
}: MapPainterProps) {
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid?.[row]?.[col];
      const stateLabel =
        cell && skinId ? `${describeCellState(cell, skinId)}, ` : '';
      cells.push(
        <button
          key={`${row}-${col}`}
          type="button"
          className={moduleStyles.cell}
          aria-label={
            selectedToolLabel
              ? `Row ${row + 1}, column ${col + 1}, ${stateLabel}paint ${selectedToolLabel}`
              : `Row ${row + 1}, column ${col + 1}, ${stateLabel}no tool selected`
          }
          onClick={() => onPaintCell(row, col)}
        />,
      );
    }
  }

  return (
    <div
      className={moduleStyles.grid}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
}
