import React, {useCallback, useMemo, useRef, useState} from 'react';

import {SOLID_CELL} from './gridConstants';
import {Game2ImageEntry} from './types';
import WorldGeneratePane from './WorldGeneratePane';

import moduleStyles from './game2View.module.scss';

interface WorldPanelProps {
  grid: string[][];
  images: Game2ImageEntry[];
  onGridChange: (grid: string[][]) => void;
}

/**
 * Deterministic palette of distinct colours for items.
 * The first slot is reserved for the solid block.
 */
const ITEM_COLORS = [
  '#F7F8FA', // solid — white
  '#7B61FF', // purple
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFD93D', // yellow
  '#FF8A5C', // orange
  '#6BCB77', // green
  '#4D96FF', // blue
  '#C471ED', // violet
  '#FF7EB3', // pink
];

function getItemColor(index: number): string {
  return ITEM_COLORS[index % ITEM_COLORS.length];
}

/** Build a map from cell value → display colour. */
function buildColorMap(images: Game2ImageEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  map.set(SOLID_CELL, ITEM_COLORS[0]);
  images.forEach((img, i) => {
    map.set(img.name, getItemColor(i + 1));
  });
  return map;
}

const WorldPanel: React.FunctionComponent<WorldPanelProps> = ({
  grid,
  images,
  onGridChange,
}) => {
  const [selectedBrush, setSelectedBrush] = useState<string>(SOLID_CELL);
  const painting = useRef(false);
  /** true = painting selectedBrush, false = erasing */
  const paintValue = useRef(true);

  const colorMap = useMemo(() => buildColorMap(images), [images]);

  const toggle = useCallback(
    (row: number, col: number, value?: boolean) => {
      const next = grid.map(r => [...r]);
      if (value !== undefined) {
        next[row][col] = value ? selectedBrush : '';
      } else {
        next[row][col] = next[row][col] === selectedBrush ? '' : selectedBrush;
      }
      onGridChange(next);
    },
    [grid, onGridChange, selectedBrush]
  );

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      painting.current = true;
      // If cell already has the selected brush, we're erasing; otherwise painting.
      paintValue.current = grid[row][col] !== selectedBrush;
      toggle(row, col, paintValue.current);
    },
    [grid, toggle, selectedBrush]
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

  const handleWorldGenerated = useCallback(
    (newGrid: string[][]) => {
      onGridChange(newGrid);
    },
    [onGridChange]
  );

  return (
    <div className={moduleStyles.worldContainer}>
      {/* Item palette */}
      <div className={moduleStyles.worldPalette}>
        <div className={moduleStyles.worldPaletteLabel}>Item</div>
        <button
          type="button"
          className={`${moduleStyles.worldPaletteItem} ${
            selectedBrush === SOLID_CELL
              ? moduleStyles.worldPaletteItemSelected
              : ''
          }`}
          onClick={() => setSelectedBrush(SOLID_CELL)}
        >
          <span
            className={moduleStyles.worldPaletteSwatch}
            style={{backgroundColor: ITEM_COLORS[0]}}
          />
          <span className={moduleStyles.worldPaletteItemName}>Solid</span>
        </button>
        {images.map((img, i) => (
          <button
            type="button"
            key={img.name}
            className={`${moduleStyles.worldPaletteItem} ${
              selectedBrush === img.name
                ? moduleStyles.worldPaletteItemSelected
                : ''
            }`}
            onClick={() => setSelectedBrush(img.name)}
          >
            <span
              className={moduleStyles.worldPaletteSwatch}
              style={{backgroundColor: getItemColor(i + 1)}}
            />
            <span className={moduleStyles.worldPaletteItemName}>
              {img.name}
            </span>
          </button>
        ))}
      </div>

      {/* Grid editor */}
      <div
        className={moduleStyles.worldGrid}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {grid.map((row, r) => (
          <div key={r} className={moduleStyles.worldGridRow}>
            {row.map((cell, c) => {
              const color = cell ? colorMap.get(cell) : undefined;
              return (
                <div
                  key={c}
                  className={`${moduleStyles.worldGridCell} ${
                    cell ? moduleStyles.worldGridCellOn : ''
                  }`}
                  style={color ? {backgroundColor: color} : undefined}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <WorldGeneratePane
        images={images}
        onWorldGenerated={handleWorldGenerated}
      />
    </div>
  );
};

export default WorldPanel;
