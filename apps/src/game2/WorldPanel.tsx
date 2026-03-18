import React, {useCallback, useRef, useState} from 'react';

import moduleStyles from './game2View.module.scss';

const GRID_SIZE = 50;

interface WorldPanelProps {
  grid: boolean[][];
  onGridChange: (grid: boolean[][]) => void;
}

function createEmptyGrid(): boolean[][] {
  return Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(false));
}

const WorldPanel: React.FunctionComponent<WorldPanelProps> = ({
  grid,
  onGridChange,
}) => {
  // Track whether the mouse is currently painting and whether it's setting or clearing.
  const painting = useRef(false);
  const paintValue = useRef(true);

  const toggle = useCallback(
    (row: number, col: number, value?: boolean) => {
      const next = grid.map(r => [...r]);
      next[row][col] = value ?? !next[row][col];
      onGridChange(next);
    },
    [grid, onGridChange]
  );

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      painting.current = true;
      paintValue.current = !grid[row][col];
      toggle(row, col, paintValue.current);
    },
    [grid, toggle]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      if (painting.current) {
        toggle(row, col, paintValue.current);
      }
    },
    [toggle]
  );

  const handlePointerUp = useCallback(() => {
    painting.current = false;
  }, []);

  return (
    <div
      className={moduleStyles.worldGrid}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {grid.map((row, r) => (
        <div key={r} className={moduleStyles.worldGridRow}>
          {row.map((cell, c) => (
            <div
              key={c}
              className={`${moduleStyles.worldGridCell} ${cell ? moduleStyles.worldGridCellOn : ''}`}
              onPointerDown={() => handlePointerDown(r, c)}
              onPointerEnter={() => handlePointerEnter(r, c)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export {createEmptyGrid, GRID_SIZE};
export default WorldPanel;
