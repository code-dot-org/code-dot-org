import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {GRID_COLS, GRID_ROWS} from '../world/gridConstants';

import moduleStyles from './sprite-lab2-view.module.scss';

const ERASE = '';

// Deterministic pastel color per item name so painted cells are distinguishable
// without loading the actual costume image (this editor isn't wired to the
// runtime yet).
function colorForItem(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 70%)`;
}

interface WorldTabProps {
  grid: string[][];
  onGridChange: (grid: string[][]) => void;
}

/**
 * A rudimentary world-grid editor: pick a costume from the palette (or the
 * eraser) and paint cells. The grid persists to project sources but is not yet
 * wired into the p5.play runtime. Later this is meant to unify with the
 * @blockly/field-bitmap grid editor.
 */
const WorldTab: React.FunctionComponent<WorldTabProps> = ({
  grid,
  onGridChange,
}) => {
  // Available costumes to paint with, from the animation list.
  const itemNames = useAppSelector(state =>
    state.animationList.orderedKeys
      .map(key => state.animationList.propsByKey[key]?.name)
      .filter((name): name is string => !!name)
  );

  const [cells, setCells] = useState<string[][]>(grid);
  const [brush, setBrush] = useState<string>(ERASE);
  const painting = useRef(false);

  // Reset when the grid identity changes (e.g. switching levels).
  useEffect(() => setCells(grid), [grid]);

  const paint = useCallback(
    (r: number, c: number) => {
      setCells(prev => {
        if (prev[r]?.[c] === brush) {
          return prev;
        }
        const next = prev.map(row => row.slice());
        next[r][c] = brush;
        onGridChange(next);
        return next;
      });
    },
    [brush, onGridChange]
  );

  const stopPainting = useCallback(() => {
    painting.current = false;
  }, []);

  return (
    <div
      className={moduleStyles.worldTab}
      onMouseUp={stopPainting}
      onMouseLeave={stopPainting}
    >
      <div className={moduleStyles.worldPalette}>
        <strong>Paint:</strong>
        <button
          type="button"
          className={brush === ERASE ? moduleStyles.brushActive : undefined}
          onClick={() => setBrush(ERASE)}
        >
          Erase
        </button>
        {itemNames.map(name => (
          <button
            key={name}
            type="button"
            className={brush === name ? moduleStyles.brushActive : undefined}
            onClick={() => setBrush(name)}
          >
            <span
              className={moduleStyles.brushSwatch}
              style={{background: colorForItem(name)}}
            />
            {name}
          </button>
        ))}
        {itemNames.length === 0 && (
          <span>Add costumes in the Images tab to paint with them.</span>
        )}
      </div>

      <div
        className={moduleStyles.worldGrid}
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
      >
        {cells.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={moduleStyles.worldCell}
              title={cell || 'empty'}
              style={{background: cell ? colorForItem(cell) : undefined}}
              onMouseDown={() => {
                painting.current = true;
                paint(r, c);
              }}
              onMouseEnter={() => {
                if (painting.current) {
                  paint(r, c);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WorldTab;
